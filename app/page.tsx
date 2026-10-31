import {SEROUS_LAYERS,PERITONEUM_KEYS} from './mj-serous';
import {flushSync} from 'react-dom';
import {registerAtlasTools} from './agent-tools';
import {Fragment,useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {PronounceButton} from './pronunciation/PronounceButton';
import {Activity,ArrowUpRight,Maximize2,ChevronRight,EyeOff,GraduationCap,Focus,Info,Layers3,Pause,RotateCcw,RotateCw,Search,Undo2,X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Switch} from '@/components/ui/switch';
import {Sheet,SheetContent,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import {Combobox,ComboboxInput,ComboboxContent,ComboboxList,ComboboxItem,ComboboxEmpty} from '@/components/ui/combobox';
import AnatomyScene,{type AnatomyLoadStatus} from './scene';
import {fetchModelBuffer} from './model-download';
import MicroAtlasScene,{MICRO_ATLASES,type MicroAtlasId} from './micro-atlas';
import MotionPullControl from './motion-pull-control';
import MotionAnatomyPanel,{UPPER_ACTION_ANATOMY} from './motion-anatomy';
import {DEFAULT_VISIBLE,SYSTEMS,EXPLANATIONS,explanation,type Atlas,type OutlineRef,type Concept,type SceneState,type SystemId,type View} from './anatomy';
import {ANATOMY_REGIONS,regionById,type RegionId} from './mj-regions';
import {resolveDissection} from './mj-dissection';
import {structureProfile} from './mj-structure-info';
import {resolveLungLabels,lungHilumRoot} from './mj-lung-labels';
import {LUNG_CATEGORIES,LUNG_CATEGORY} from './mj-lung-categories';
import {buildSearchIndex,type SearchEntry,type SearchSource} from './mj-search';
import SearchPanel from './search-panel';
import {normalizeAtlasSystems} from './mj-system-classifier';
import {anatomicalRegion,anatomicalSide,partsInRegion,topRegionParts} from './mj-part-regions';
import {REGION_BAR,regionDef,buildRegionIndex,regionMembers,regionVisible,regionDirection,regionZoom,regionNerveFilter,quizHrefFor,type RegionKey} from './mj-region-bar';
import {resolveArmCollision} from './mj-arm-collision';
import {HAND_PRESETS} from './mj-hand-presets';
import {buildUpperLimbMotion,constrainPose,MOTION_LIMITS,NEUTRAL_POSE,type MotionPose,type Side} from './mj-motion';
import BodyControls from './biomechanics-v2/body-controls';
import {DIGIT_KEYS} from './biomechanics-v2/digits';
import {makeBodyRig,buildBodyMotion,BODY_NEUTRAL,type BodyRegion,type BodyPose} from './biomechanics-v2/body-motion';
import {JOINT_TYPES} from './mj-joints';
import {matchesMuscleLayer,MUSCLE_LAYER_REGIONS,MUSCLE_LAYER_SOURCE,layerOrders,layerMembers,partsForLayerMuscles,layerRegionsFor,layerRegionLabel,layerGroupLabel,LAYER_GROUP_OF,type MuscleLayer} from './mj-muscle-layers';
import SPACE_RANGES from './space-ranges.json';
import SPACE_SHAPE_DATA from './space-shapes.json';
import {SPACE_SHAPES,SHAPE_COLORS} from './mj-space-shapes';
import {SPACES,resolveSpace,spacesForGroups,type SpaceDef,type SpaceGroup,type SpaceHit,type SpaceItemHit} from './mj-spaces';
import {anatomyDepth,matchesDepth,type TissueDepth} from './mj-depth';
import {augmentAtlasWithFacial} from './mj-facial-atlas';
import {matchesHeartLayer} from './mj-heart-layers';
import {matchesSex} from './mj-sex';
import {serousLayerKey} from './mj-serous';
import {FACIAL_MUSCLE_LAYERS,matchesFacialMuscleLayer,type FacialMuscleLayer} from './mj-facial-layers';
type TopRegion='whole'|'upper'|'lower'|'head'|'organs'|'chest'|'back'|'abdomen'|'pelvis'|'gluteal';
/** regions focused by the region-bar membership (the limbs keep their own views and joint motion) */
const GENERIC_REGIONS:TopRegion[]=['head','chest','back','abdomen','pelvis','gluteal'];
type UpperMotionAction='shoulderFlexion'|'shoulderAbduction'|'elbowFlexion'|'forearmRotation'|'wristExtension';
const UPPER_MOTION_ACTIONS:{id:UpperMotionAction;label:string}[]=[
 {id:'shoulderFlexion',label:'肩前舉'},
 {id:'shoulderAbduction',label:'肩外展'},
 {id:'elbowFlexion',label:'屈肘'},
 {id:'forearmRotation',label:'旋前／旋後'},
 {id:'wristExtension',label:'腕屈／伸'},
];
const UPPER_MOTION_KEY:Record<UpperMotionAction,keyof MotionPose>={
 shoulderFlexion:'shoulderFlexion',
 shoulderAbduction:'shoulderAbduction',
 elbowFlexion:'elbowFlexion',
 forearmRotation:'forearmRotation',
 wristExtension:'wristFlexion',
};
const UPPER_MOTION_CONTROLS:{key:keyof MotionPose;label:string;action:UpperMotionAction}[]=[
 {key:'shoulderFlexion',label:'肩屈曲（＋）／伸展（－）',action:'shoulderFlexion'},
 {key:'shoulderAbduction',label:'肩外展（＋）／內收（－）',action:'shoulderAbduction'},
 {key:'shoulderRotation',label:'肩內旋（＋）／外旋（－）',action:'shoulderAbduction'},
 {key:'elbowFlexion',label:'肘屈曲（＋）／伸展（－）',action:'elbowFlexion'},
 {key:'forearmRotation',label:'前臂旋前（＋）／旋後（－）',action:'forearmRotation'},
 {key:'wristFlexion',label:'腕屈曲（＋）／伸展（－）',action:'wristExtension'},
 {key:'wristDeviation',label:'腕尺偏（＋）／橈偏（－）',action:'wristExtension'},
];
// Fingers: no sliders, only the gesture presets (HAND_PRESETS); the joints of the digits are moved together and eased in over half a second.
const REGIONAL_VISIBLE:SystemId[]=['skeletal','muscular','arterial','venous','nervous','connective','tendon'];
const ORGAN_SYSTEM_IDS:SystemId[]=['cardiac','serous','sensory','respiratory','digestive','urinary','lymphatic','endocrine','reproductive'];
// The three pericardial layers belong to the heart: they start hidden here and are shown in the heart detail mode (心).
const initial:SceneState={hiddenSerous:SEROUS_LAYERS.slice(2).map(l=>l.key),tissueMotion:true,explode:0,visible:DEFAULT_VISIBLE,selected:[],hiddenParts:[],depthFilter:'all',isolate:false,view:'three-quarter',rotate:false,reset:0};
/** One thin green line at the very bottom of the screen: no card, no text. It fades out when everything has
 * loaded. If a package failed it turns amber and becomes a (text-free) button that retries only the missing pieces. */
function LoadBar({progress,failed,unavailable,busy,onRetry}:{progress:number;failed:string[];unavailable:string[];busy:boolean;onRetry:()=>void}){
 const [gone,setGone]=useState(false);
 const trouble=failed.length>0||unavailable.length>0;
 useEffect(()=>{if(progress<100||trouble){setGone(false);return;}const t=window.setTimeout(()=>setGone(true),1400);return()=>window.clearTimeout(t);},[progress,trouble]);
 if(gone)return null;
 const done=progress>=100&&!trouble;
 // The bar only shows progress; a failure gets words and its own button (P2-16): a bare amber line told nobody what was missing or that it could be pressed.
 return <>
  <div className={`load-bar${done?' done':''}${trouble?' failed':''}`} data-testid="load-bar" role="progressbar" aria-label="載入進度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><i style={{transform:`scaleX(${Math.max(.02,progress/100)})`}}/></div>
  {trouble&&<div className="load-fail glass" role="alert">
   {failed.length>0&&<p>部分結構未載入（{failed.length} 組）。<Button variant="ghost" size="sm" onClick={onRetry} disabled={busy}>{busy?'重試中…':'重試'}</Button></p>}
   {unavailable.length>0&&<p>補充資料包未載入：{unavailable.join('、')}。<Button variant="ghost" size="sm" onClick={()=>location.reload()}>重新載入</Button></p>}
  </div>}
 </>;
}

export default function Home({initialRegion='whole'}:{initialRegion?:'whole'|'upper'|'lower'}){
 const detailTitle=useRef<HTMLHeadingElement>(null);
 const [atlas,setAtlas]=useState<Atlas|null>(null),[state,setState]=useState(initial),[progress,setProgress]=useState(0),[error,setError]=useState(''),[panel,setPanel]=useState<'layers'|'search'|null>(null),[details,setDetails]=useState(false),[about,setAbout]=useState(false),[chosen,setChosen]=useState<Concept|null>(null),[externalNerve,setExternalNerve]=useState<string|null>(null);
 const [loadStatus,setLoadStatus]=useState<AnatomyLoadStatus|null>(null),[retryNonce,setRetryNonce]=useState(0);
 // Motion warnings (a pose the model cannot show) are advice, not a failure: they never show the fatal error box with its reload button (P3-10).
 const [notice,setNotice]=useState('');
 // Structures the viewer draws that are not atlas concepts (external nerves, joint ligaments, brain, neck vessels): loaded when search first opens.
 type Extra={n:string;s:SystemId;k:'nerve'|'joint'|'brain'|'vessel'|'heart';raw?:string;/** Chinese name carried by the index (heart detail structures) */z?:string};
 const [extras,setExtras]=useState<Extra[]>([]),[externalSystem,setExternalSystem]=useState<SystemId>('nervous');
 const [fadeOther,setFadeOther]=useState(false);
 const [region,setRegion]=useState<RegionId>('whole-body'),[dissectionStage,setDissectionStage]=useState(0),[studySide,setStudySide]=useState<'both'|Side>('both');
 const [topRegion,setTopRegion]=useState<TopRegion>('whole'),[rightTool,setRightTool]=useState<'view'|'dissection'|'depth'|null>(null),[microAtlas,setMicroAtlas]=useState<MicroAtlasId|null>(null);
 const [regionSub,setRegionSub]=useState<string|undefined>(undefined),[regionPrev,setRegionPrev]=useState<null|{prev:SceneState;topRegion:TopRegion;studySide:'both'|Side;rightTool:typeof rightTool;motionEnabled:boolean}>(null);
 const [jointInfoOpen,setJointInfoOpen]=useState(false),[motionSide,setMotionSide]=useState<Side>('right'),[motionPose,setMotionPose]=useState<MotionPose>(NEUTRAL_POSE),[motionEdit,setMotionEdit]=useState(false),[motionBlock,setMotionBlock]=useState(''),[motionEnabled,setMotionEnabled]=useState(false),[organsOpen,setOrgansOpen]=useState(true),[organRowsOpen,setOrganRowsOpen]=useState<string[]>([]);
 const [mobileMotionOpen,setMobileMotionOpen]=useState(false);
 const [motionAction,setMotionAction]=useState<UpperMotionAction>('shoulderFlexion');
 const motionPoseRef=useRef<MotionPose>(NEUTRAL_POSE);motionPoseRef.current=motionPose;
 const motionTargetRef=useRef<MotionPose>(NEUTRAL_POSE),smoothMotionFrame=useRef<number|null>(null);
 const motionInputSide=useRef<'both'|Side>('both');
 useEffect(()=>{if(state.bodyMotion)setTopRegion(state.bodyMotion.region==='head'?'head':state.bodyMotion.region==='spine'?'whole':'lower');},[state.bodyMotion?.region]);
 useEffect(()=>{
  const abort=new AbortController();setProgress(0);setError('');setAtlas(null);setLoadStatus(null);setChosen(null);setExternalNerve(null);setDetails(false);setState({...initial,visible:DEFAULT_VISIBLE});
  const readJson=async(path:string)=>JSON.parse(new TextDecoder().decode(await fetchModelBuffer(`${import.meta.env.BASE_URL}models/${path}`,0,false,abort.signal)));
  // The 解剖重點 panel is off: the extracted lecture-note fragments were cut mid-sentence and often unrelated to the structure.
  void (async()=>{
   let data:Atlas;
   try{data=normalizeAtlasSystems(JSON.parse(new TextDecoder().decode(await fetchModelBuffer(`${import.meta.env.BASE_URL}models/atlas-stream.json.gz`,0,true,abort.signal))) as Atlas);}catch(e){if(abort.signal.aborted)throw e;data=normalizeAtlasSystems(await readJson('atlas.json') as Atlas);}
   return augmentAtlasWithFacial(data,abort.signal);
  })().then(data=>{if(!abort.signal.aborted)setAtlas(data);}).catch(e=>{if(!abort.signal.aborted)setError(e instanceof Error?e.message:'解剖目錄載入失敗');});
  return()=>abort.abort();
 },[]);
 useEffect(()=>{if(panel!=='search'||extras.length)return;const abort=new AbortController();void fetchModelBuffer(`${import.meta.env.BASE_URL}models/search-extras.json.gz`,0,true,abort.signal).then(b=>{if(!abort.signal.aborted)setExtras(JSON.parse(new TextDecoder().decode(b)) as Extra[]);}).catch(e=>{if(!abort.signal.aborted)console.warn('Search index extras unavailable',e);});return()=>abort.abort();},[panel,extras.length]);
 // Esc closes the topmost layer: an open panel, then the about sheet, then the structure card.
 const escRef=useRef({panel,details,about});escRef.current={panel,details,about};
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='/'&&!(e.target instanceof HTMLInputElement)&&!(e.target instanceof HTMLTextAreaElement)){e.preventDefault();setPanel('search');setDetails(false);}
  if(e.key==='Escape'){const u=escRef.current;if(u.panel)setPanel(null);else if(u.about)setAbout(false);else if(u.details){setDetails(false);setExternalNerve(null);}}};
  // capture phase: the card and the search popup stop Escape from bubbling to the window
  window.addEventListener('keydown',key,true);return()=>window.removeEventListener('keydown',key,true);},[]);
 const parts=useMemo(()=>new Map(atlas?.parts.map(p=>[p.id,p])),[atlas]);
 const extraOf=(c:Concept)=>c.id.startsWith('extra:')?extras.find(x=>c.id===`extra:${x.k}:${x.raw??x.n}`):undefined;
 const profileForConcept=(c:Concept)=>{const x=extraOf(c);if(x)return structureProfile(x.n,x.s);const p=c.elements.map(id=>parts.get(id)).find(Boolean);return p?structureProfile(c.name,p.system,p):undefined;};
 const profileForPart=(id:string)=>{const p=parts.get(id);return p?structureProfile(p.name,p.system,p):undefined;};
 const counts=useMemo(()=>Object.fromEntries(SYSTEMS.map(s=>[s.id,atlas?.parts.filter(p=>p.system===s.id&&matchesSex(p,state.sex)).length??0])),[atlas,state.sex]);
 const activeSystems=SYSTEMS.filter(s=>counts[s.id]>0);
 const organSystems=activeSystems.filter(s=>ORGAN_SYSTEM_IDS.includes(s.id));
 const primarySystems=activeSystems.filter(s=>!ORGAN_SYSTEM_IDS.includes(s.id));
 const serousRow=(l:typeof SEROUS_LAYERS[number])=>{const off=(state.hiddenSerous??[]).includes(l.key);return <label key={l.key} className="organ-sub-row"><span className="bn-stack"><span className="bn-en">{l.en}</span><small className="bn-zh">{l.zh}</small></span><Switch checked={state.visible.includes('serous')&&!off} onCheckedChange={()=>setState(v=>{const hidden=v.hiddenSerous??[];const vis=v.visible.includes('serous');const nowOff=hidden.includes(l.key);if(!vis)return{...v,visible:[...v.visible,'serous'],hiddenSerous:SEROUS_LAYERS.map(x=>x.key).filter(k=>k!==l.key)};return{...v,hiddenSerous:nowOff?hidden.filter(k=>k!==l.key):[...hidden,l.key]}})} aria-label={l.en}/></label>;};
 // Organs, top to bottom: heart, respiratory, digestive, urinary, reproductive, endocrine, lymphatic, sensory organs. The serous membranes belong to their organ: pleura to Respiratory, the three pericardial layers to the heart.
 const ORGAN_ORDER:SystemId[]=['cardiac','respiratory','digestive','urinary','reproductive','endocrine','lymphatic','sensory'];
 const ORGAN_LABEL:Partial<Record<SystemId,string>>={cardiac:'Cardiac'};
 const SEROUS_OF:Partial<Record<SystemId,typeof SEROUS_LAYERS[number][]>>={respiratory:SEROUS_LAYERS.slice(0,2),cardiac:SEROUS_LAYERS.slice(2,5)};
 const serousCount=(keys:string[])=>atlas?.parts.filter(p=>p.system==='serous'&&keys.includes(serousLayerKey(p.name))).length??0;
 const setSerousGroup=(v:SceneState,keys:string[],on:boolean):SceneState=>{const all=SEROUS_LAYERS.map(x=>x.key) as string[],serousOn=v.visible.includes('serous');let hidden=serousOn?[...(v.hiddenSerous??[])]:[...all];hidden=on?hidden.filter(k=>!keys.includes(k)):[...new Set([...hidden,...keys])];return{...v,hiddenSerous:hidden,visible:on&&!serousOn?[...v.visible,'serous']:v.visible};};
 // Respiratory has two layers: 1 = lobes, trachea, main bronchi and hilum; 2 = the pleura laid over the lungs. Switching Respiratory on shows layer 1; ＋ adds the pleura, － takes it away.
 const PLEURA_KEYS=SEROUS_LAYERS.slice(0,2).map(l=>l.key) as string[];
 const lungLayer=state.visible.includes('serous')&&PLEURA_KEYS.some(k=>!(state.hiddenSerous??[]).includes(k))?2:1;
 // Eye and ear detail atlases are unfinished: their entry buttons are hidden for now (code and data stay, see ROADMAP.md); the atlas never shows while the entry is off.
 const MICRO_ATLAS_ENTRY=false;
 useEffect(()=>{if(!MICRO_ATLAS_ENTRY&&microAtlas)setMicroAtlas(null);},[microAtlas]);// eslint-disable-line react-hooks/exhaustive-deps
 // Thorax focus view (肺 button): the respiratory system, the pleura (off until layer 2) and the rib cage drawn see-through, camera on the front of the chest; 返回 restores what was shown before.
 const THORAX_BONE=/^(?:left |right )?(?:\d+(?:st|nd|rd|th) )?rib\b|\brib\b|costal cartilage|sternum|manubrium|xiphoid|thoracic vertebra|^(?:left |right )?clavicle$/i;
 const [lungView,setLungView]=useState<null|{prev:SceneState;topRegion:TopRegion;studySide:'both'|Side;rightTool:typeof rightTool;motionEnabled:boolean}>(null),[lungSide,setLungSide]=useState<'both'|Side>('both');
 // What the thorax view shows: layer 1 = lobes, trachea, main bronchi, hilum (epiglottis, nasal and pharyngeal pieces stay out; the lobe surface marks are included but drawn in the lobe colour, so they only show when selected); the segmental bronchial tree and the pulmonary arteries and veins are switched on with their own toggles.
 const LUNG_CORE=/^(?:upper|middle|lower) lobe of (?:right |left )?lung$|^trachea$|\bmain bronchus\b|^hilum of (?:left|right) lung$/i,LUNG_BRONCHI=/bronchial tree/i,PULM_VESSEL=/\bsegmental (?:artery|vein)\b|\blingular (?:artery|vein)\b|\bpulmonary (?:artery|vein)\b|^pulmonary trunk$/i;
 const [lungInner,setLungInner]=useState({bronchi:false,vessels:false,touched:false}),[lungLabels,setLungLabels]=useState(false);
 // Name labels (medial view of one lung): the parts they point to are kept in the focus set even when they belong to systems that are otherwise off (hilum vessels, pulmonary ligament).
 const lungLabelRows=lungView&&lungLabels&&lungSide!=='both'&&atlas?resolveLungLabels(atlas,lungSide):[];
 // Category colours (分類上色): a master switch and one switch per category; a coloured category tints its model parts and its labels.
 const [lungTintOn,setLungTintOn]=useState(true),[lungCatsOn,setLungCatsOn]=useState<Record<string,boolean>>(()=>Object.fromEntries(LUNG_CATEGORIES.map(c=>[c.key,true])));
 const catActive=(k:string|null)=>!!k&&lungTintOn&&lungCatsOn[k]!==false;
 // The liver has segmental arteries and veins of the same names: only vessels whose centre lies in the chest count as pulmonary.
 const inChest=(p:{bounds:number[][]})=>{const cy=(p.bounds[0][1]+p.bounds[1][1])/2,cx=(p.bounds[0][0]+p.bounds[1][0])/2;return cy>1.17&&cy<1.45&&Math.abs(cx)<.15;};
 const lungViewIds=(side:'both'|Side,inner:{bronchi:boolean;vessels:boolean})=>{if(!atlas)return{lung:[] as string[],bone:[] as string[],core:[] as string[]};const ok=(p:(typeof atlas.parts)[number])=>side==='both'||anatomicalSide(p)===side||anatomicalSide(p)==='midline',onSide=(p:(typeof atlas.parts)[number])=>side==='both'||(side==='left'?p.bounds[0][0]>-.012:p.bounds[1][0]<.012);const core=atlas.parts.filter(p=>p.system==='respiratory'&&LUNG_CORE.test(p.name)&&ok(p)).map(p=>p.id),marks=atlas.parts.filter(p=>p.system==='respiratory'&&(p as {kind?:string}).kind==='surface'&&onSide(p)).map(p=>p.id);return{core,lung:[...core,...marks,...atlas.parts.filter(p=>(ok(p)&&p.system==='serous'&&/pleura/i.test(p.name))||(p.system==='respiratory'&&inner.bronchi&&LUNG_BRONCHI.test(p.name)&&onSide(p))||(inner.vessels&&(p.system==='arterial'||p.system==='venous')&&PULM_VESSEL.test(p.name)&&inChest(p)&&onSide(p))).map(p=>p.id)],bone:atlas.parts.filter(p=>p.system==='skeletal'&&THORAX_BONE.test(p.name)&&ok(p)).map(p=>p.id)};};
 const lungParts=(side:'both'|Side,inner:{bronchi:boolean;vessels:boolean},labels=lungLabels)=>{const {lung,bone}=lungViewIds(side,inner),extra=labels&&side!=='both'&&atlas?resolveLungLabels(atlas,side).flatMap(r=>r.ids):[];return{visible:['respiratory','skeletal','serous',...(inner.vessels||extra.length?['arterial','venous']:[]),...(extra.length?['connective']:[])] as SystemId[],focusParts:[...new Set([...lung,...extra,...bone])],fadedParts:bone};};
 const aimLungView=(side:'both'|Side,first:boolean,inner=lungInner,labels=lungLabels)=>{const {core,bone}=lungViewIds(side,inner),all=SEROUS_LAYERS.map(l=>l.key) as string[],medial=labels&&side!=='both'&&atlas?(()=>{const ps=atlas.parts.filter(p=>core.includes(p.id)),lo=[1,1,1].map((_,k)=>Math.min(...ps.map(p=>p.bounds[0][k]))),hi=[1,1,1].map((_,k)=>Math.max(...ps.map(p=>p.bounds[1][k])));return{c:lo.map((v,k)=>(v+hi[k])/2) as [number,number,number],r:.07,dir:[side==='left'?-1:1,0,0] as [number,number,number]};})():undefined;setState(s=>({...s,...lungParts(side,inner,labels),cameraFocusRange:medial,hiddenSerous:first?all:s.hiddenSerous,hiddenParts:labels&&side!=='both'&&atlas?(()=>{const keep=new Set(resolveLungLabels(atlas,side).flatMap(r=>r.ids));return atlas.parts.filter(p=>p.system==='connective'&&!keep.has(p.id)).map(p=>p.id);})():[],selected:[],isolate:false,explode:0,rotate:false,bodyMotion:undefined,partTransforms:undefined,cameraFocusParts:[...core,...bone],cameraFocusDir:regionDirection('chest','lung'),nerveFilter:regionNerveFilter('chest','lung'),cameraFocusNerve:undefined,spaceRange:undefined,cameraFocusNonce:(s.cameraFocusNonce??0)+1,cameraFocusScale:labels&&side!=='both'?1.15:.7}));};
 // Bronchial tree / pulmonary vessel toggles; moving the opacity slider down switches both on once (unless the person already chose), because the inside is what the see-through lung is for.
 const setLungInnerParts=(next:{bronchi:boolean;vessels:boolean;touched:boolean})=>{setLungInner(next);setState(s=>({...s,...lungParts(lungSide,next)}));};
 // The 肺 button is 胸腔 → 肺與胸膜: the same view (and the same focus logic) as choosing it in the region bar. 返回 / ← restores what was shown before.
 const snapshot=()=>regionPrev??{prev:state,topRegion,studySide,rightTool,motionEnabled};
 const enterLungView=()=>{if(!atlas||lungView)return;const snap=snapshot();setRegionPrev(snap);setLungView(snap);setMicroAtlas(null);setMotionEdit(false);setMotionEnabled(false);setDetails(false);setPanel(null);setChosen(null);setExternalNerve(null);setSpaceId(null);setSpaceItem(null);setTopRegion('chest');setRegionSub('lung');setStudySide('both');setRightTool(null);setLungSide('both');const inner={bronchi:false,vessels:false,touched:false};setLungInner(inner);setLungLabels(false);aimLungView('both',true,inner,false);};
 const exitLungView=()=>{const v=lungView;if(!v)return;setLungView(null);setRegionPrev(null);setRegionSub(undefined);setTopRegion(v.topRegion);setStudySide(v.studySide);setRightTool(v.rightTool);setMotionEnabled(v.motionEnabled);setState(s=>({...v.prev,reset:v.prev.cameraFocusParts?s.reset:s.reset+1,cameraFocusNonce:v.prev.cameraFocusParts?(s.cameraFocusNonce??0)+1:v.prev.cameraFocusNonce}));};
 const toggleOrganRow=(id:SystemId)=>setState(v=>{const keys=(SEROUS_OF[id]??[]).map(l=>l.key) as string[],on=v.visible.includes(id);const base:SceneState={...v,isolate:false,selected:[],visible:on?v.visible.filter(x=>x!==id):[...v.visible,id]};return keys.length?setSerousGroup(base,keys,!on&&id!=='respiratory'):base;});
 const organPieceCount=organSystems.reduce((sum,s)=>sum+(counts[s.id]??0),0);
 const anyOrganVisible=organSystems.some(s=>state.visible.includes(s.id));
 const allOrgansVisible=organSystems.length>0&&organSystems.every(s=>state.visible.includes(s.id));
 const toggleOrgans=()=>{setDetails(false);setState(s=>{const hasAll=organSystems.every(x=>s.visible.includes(x.id));const without=s.visible.filter(id=>!ORGAN_SYSTEM_IDS.includes(id));return{...s,selected:[],isolate:false,visible:hasAll?without:[...without,...organSystems.map(x=>x.id)]};});};
 const selectedParts=state.selected.map(id=>parts.get(id)).filter(p=>!!p),selected=selectedParts[0],inspectedSystem:SystemId|undefined=externalNerve?externalSystem:selected?.system,system=SYSTEMS.find(s=>s.id===inspectedSystem);

 // The Quiz button always opens the body-part chooser (#/quiz), from every page.
 const quizHref=quizHrefFor(topRegion as RegionKey,regionSub);
 const hiddenSet=new Set(state.hiddenParts??[]);
 // Counting ~2,300 parts is skipped while only the pose changes (a motion drag re-renders this page every frame).
 const visibleCount=useMemo(()=>atlas?.parts.filter(p=>!hiddenSet.has(p.id)&&(state.selected.includes(p.id)||(matchesDepth(p,state.depthFilter)&&matchesMuscleLayer(p,state.muscleRegion,state.muscleLayer)&&matchesFacialMuscleLayer(p,state.faceMuscleLayer)&&matchesHeartLayer(p,state.heartOpen)&&matchesSex(p,state.sex)&&!(p.system==='serous'&&(state.hiddenSerous??[]).includes(serousLayerKey(p.name)))&&(state.isolate?false:state.focusParts?state.focusParts.includes(p.id)&&state.visible.includes(p.system):state.visible.includes(p.system))))).length??0,[atlas,state.hiddenParts,state.selected,state.depthFilter,state.muscleRegion,state.muscleLayer,state.faceMuscleLayer,state.heartOpen,state.sex,state.hiddenSerous,state.isolate,state.focusParts,state.visible]);
 // Search index: built once in idle slices after the atlas is ready (and again when the extra names arrive), then queried per keystroke by the search panel.
 const [searchIndex,setSearchIndex]=useState<SearchEntry[]|null>(null);
 useEffect(()=>{
  if(!atlas)return;
  let cancelled=false;const sources:SearchSource[]=[],queue:(()=>void)[]=[];
  const concepts=atlas.concepts;
  for(let i=0;i<concepts.length;i+=150)queue.push(()=>{for(const c of concepts.slice(i,i+150)){const p=c.elements.map(id=>parts.get(id)).find(Boolean),profile=p?structureProfile(c.name,p.system,p):undefined;sources.push({concept:c,english:profile?.english??c.name,chinese:profile?.chinese});}});
  for(let i=0;i<extras.length;i+=150)queue.push(()=>{for(const x of extras.slice(i,i+150)){const profile=structureProfile(x.n,x.s);sources.push({concept:{id:`extra:${x.k}:${x.raw??x.n}`,name:x.n,elements:[] as string[]},english:profile.english??x.n,chinese:x.z??profile.chinese,kind:x.k});}});
  // spaces that have no mesh of their own in the atlas (femoral triangle, adductor canal, popliteal fossa) are found by search too; they open in the dissection panel
  queue.push(()=>{for(const d of SPACES){const re=new RegExp(`^(?:left |right )?${d.part}$`,'i');if(atlas.parts.some(q=>re.test(q.name)&&q.system!=='muscular'))continue;sources.push({concept:{id:`space:${d.id}`,name:d.en,elements:[] as string[]},english:d.en,chinese:d.zh,kind:'space'});}});
  const idle=(fn:()=>void)=>'requestIdleCallback' in window?(window as unknown as {requestIdleCallback:(f:()=>void,o?:{timeout:number})=>number}).requestIdleCallback(fn,{timeout:400}):setTimeout(fn,16);
  const step=()=>{if(cancelled)return;const job=queue.shift();if(job){job();idle(step);}else setSearchIndex(buildSearchIndex(sources));};
  idle(step);
  return()=>{cancelled=true;};
 },[atlas,parts,extras]);
 // Anything picked from search, a list or a related-structure chip is brought into view: its system is switched on, it is un-hidden and every filter that would keep it out of the scene is lifted.
 const revealState=(s:SceneState,ids:string[]):SceneState=>{const picked=ids.map(id=>parts.get(id)).filter((p):p is NonNullable<typeof p>=>!!p);return{...s,hiddenParts:(s.hiddenParts??[]).filter(x=>!ids.includes(x)),visible:[...new Set([...s.visible,...picked.map(p=>p.system)])],muscleLayer:picked.some(p=>p.system==='muscular')?'all':s.muscleLayer,depthFilter:'all',focusParts:s.focusParts?[...new Set([...s.focusParts,...ids])]:s.focusParts,cameraFocusNerve:undefined};};
 // A special region (axillary fossa, carpal tunnel …) found by search or opened from a card is shown the way the dissection panel shows it: its boundaries and contents highlighted near the region, nothing drawn for the space itself.
 const spaceOfParts=(ids:string[])=>{const p=ids.length?parts.get(ids[0]):undefined;return p?SPACES.find(d=>new RegExp(`^(?:left |right )?${d.part}$`,'i').test(p.name)&&p.system!=='muscular'):undefined;};
 // In the 頭部 tab the scene is clipped at the clavicles: a structure picked from search below that line would be flown to but not drawn, so the view goes back to 全身 first.
 const leaveHeadFor=(ids:string[])=>{if(topRegion!=='head')return;if(ids.some(id=>{const p=parts.get(id);return p&&anatomicalRegion(p)!=='head-neck';}))selectTop('whole');};
 const choose=(c:Concept)=>{if(c.id.startsWith('space:')){const d=SPACES.find(x=>c.id===`space:${x.id}`);if(d){setRightTool('dissection');setPanel(null);setDetails(false);pickSpaceRef.current(d);return;}}const x=extraOf(c);if(x){chooseExtra(x);return;}const sp=spaceOfParts(c.elements);if(sp){setRightTool('dissection');setPanel(null);setDetails(false);pickSpaceRef.current(sp);return;}leaveHeadFor(c.elements);setExternalNerve(null);setChosen(c);setState(s=>({...revealState(s,c.elements),selected:c.elements,cameraFocusParts:c.elements,cameraFocusNonce:(s.cameraFocusNonce??0)+1,isolate:false,rotate:false}));setDetails(true);setPanel(null);};
 // The search panel is memoised; it gets one stable callback so typing or dragging a joint never re-renders it through a new onChoose.
 const closePanel=useCallback(()=>setPanel(null),[]);
 const chooseRef=useRef(choose);chooseRef.current=choose;const chooseStable=useCallback((c:Concept)=>chooseRef.current(c),[]);
 useEffect(()=>{if(!atlas)return;return registerAtlasTools(atlas,c=>flushSync(()=>choose(c)));},[atlas]);
 const [layerPicked,setLayerPicked]=useState<string|null>(null);
 // A space picked in the dissection panel (e.g. the quadrangular space): its boundary structures and contents are highlighted, everything else of the region is faded.
 const [spaceId,setSpaceId]=useState<string|null>(null),[spaceItem,setSpaceItem]=useState<string|null>(null);
 const pickLayerMuscles=(key:string,names:string[],order:number)=>{
  if(layerPicked===key){setLayerPicked(null);setChosen(null);setDetails(false);setState(s=>({...s,selected:[],isolate:false}));return;}
  const region=state.muscleRegion;if(!region||!atlas)return;
  const ids=partsForLayerMuscles(atlas.parts,region,names).map(p=>p.id);if(!ids.length)return;
  setLayerPicked(key);setExternalNerve(null);
  if(ids.length===1){const p=parts.get(ids[0])!;setChosen({id:p.conceptId,name:p.name,elements:ids});setDetails(true);}else{setChosen(null);setDetails(false);}
  // shallower layers of the region that cover the muscle are peeled away so it can be seen
  setState(s=>({...s,muscleLayer:order>1?order:s.muscleLayer,hiddenParts:(s.hiddenParts??[]).filter(x=>!ids.includes(x)),selected:ids,cameraFocusParts:ids,cameraFocusNonce:(s.cameraFocusNonce??0)+1,isolate:false,rotate:false}));
 };
 const choosePart=(id:string)=>{const p=parts.get(id);if(!p)return;const sp=spaceOfParts([id]);if(sp){setRightTool('dissection');setPanel(null);pickSpaceRef.current(sp);return;}leaveHeadFor([id]);setExternalNerve(null);setChosen({id:p.conceptId,name:p.name,elements:[id]});setState(s=>({...revealState(s,[id]),selected:[id],cameraFocusParts:[id],cameraFocusNonce:(s.cameraFocusNonce??0)+1,isolate:false,rotate:false}));setDetails(true);setPanel(null);};
 // A tap on empty background clears the current selection and closes the card (P3-06); panels, layers and the picked special region stay.
 const clearSelection=()=>{if(!state.selected.length&&!externalNerve&&!details)return;setChosen(null);setDetails(false);setExternalNerve(null);setLayerPicked(null);setState(s=>({...s,selected:[],isolate:false}));};
 const chooseExtra=(x:Extra)=>{
  // A brain structure opens the brain detail mode on that structure; nerves, joint tissues and neck vessels are highlighted and framed in the scene by mesh name.
  if(x.k==='brain'){window.location.hash=`#/organ/brain?select=${encodeURIComponent(x.n)}`;return;}
  // A heart detail structure (crista terminalis, fossa ovalis …) has no mesh in the main atlas: it opens the heart detail mode on that structure.
  if(x.k==='heart'){window.location.hash=`#/organ/heart?select=${encodeURIComponent(x.n)}`;return;}
  setExternalSystem(x.s);setExternalNerve(x.raw??x.n);setChosen(null);
  setState(s=>({...s,selected:[],isolate:false,rotate:false,hiddenParts:s.hiddenParts??[],hiddenNerves:(s.hiddenNerves??[]).filter(n=>n!==(x.raw??x.n)),visible:s.visible.includes(x.s)?s.visible:[...s.visible,x.s],cameraFocusNerve:x.raw??x.n,cameraFocusParts:undefined,cameraFocusNonce:(s.cameraFocusNonce??0)+1,cameraFocusScale:.92}));setDetails(true);setPanel(null);
 };
 const chooseNerve=(name:string,system:SystemId='nervous')=>{setExternalSystem(system);setExternalNerve(name);setChosen(null);setState(s=>({...s,selected:[],isolate:false,rotate:false,hiddenNerves:(s.hiddenNerves??[]).filter(n=>n!==name),visible:s.visible.includes(system)?s.visible:[...s.visible,system],cameraFocusNerve:name,cameraFocusParts:undefined,cameraFocusNonce:(s.cameraFocusNonce??0)+1,cameraFocusScale:.92}));setDetails(true);setPanel(null);};
 const setMuscleLayer=(muscleLayer:MuscleLayer)=>setState(s=>({...s,muscleLayer,selected:[],isolate:false}));const setMuscleRegion=(muscleRegion:string|undefined)=>setState(s=>({...s,muscleRegion,muscleLayer:'all',selected:[],isolate:false}));
 const setFaceMuscleLayer=(faceMuscleLayer:FacialMuscleLayer)=>setState(s=>({...s,faceMuscleLayer,selected:[],isolate:false}));
 const setDepth=(depth:TissueDepth)=>setState(s=>({...s,depthFilter:depth,selected:[],isolate:false}));
 const hideSelected=()=>{if(!state.selected.length)return;setState(s=>({...s,hiddenParts:Array.from(new Set([...(s.hiddenParts??[]),...s.selected])),selected:[],isolate:false}));setChosen(null);setDetails(false);};
 const restoreHidden=()=>setState(s=>({...s,hiddenParts:[],hiddenNerves:[]}));
 const hideNerve=()=>{if(!externalNerve)return;const name=externalNerve;setState(s=>({...s,hiddenNerves:[...new Set([...(s.hiddenNerves??[]),name])],isolate:false}));setExternalNerve(null);setDetails(false);};
 const restorePart=(id:string)=>setState(s=>({...s,hiddenParts:(s.hiddenParts??[]).filter(x=>x!==id)}));

 const toggle=(id:SystemId)=>{setDetails(false);setState(s=>({...s,selected:[],isolate:false,visible:s.visible.includes(id)?s.visible.filter(x=>x!==id):[...s.visible,id]}));};
 const reset=()=>{stopMotionAnimation();setMicroAtlas(null);setLungView(null);setRegionPrev(null);setRegionSub(undefined);setFadeOther(false);setSpaceId(null);setSpaceItem(null);setLayerPicked(null);setError('');setNotice('');setAbout(false);setMobileMotionOpen(false);setState(s=>({...initial,visible:DEFAULT_VISIBLE,reset:s.reset+1}));setTopRegion('whole');setStudySide('both');setRightTool(null);setChosen(null);setExternalNerve(null);setDetails(false);setPanel(null);setRegion('whole-body');setDissectionStage(0);setMotionPose(NEUTRAL_POSE);motionPoseRef.current=NEUTRAL_POSE;motionTargetRef.current=NEUTRAL_POSE;setMotionEdit(false);setMotionEnabled(false);};
 const openPanel=(next:'layers'|'search')=>{setDetails(false);setPanel(p=>p===next?null:next);};
 const currentRegion=regionById(region);
 const profile=externalNerve?structureProfile(extras.find(x=>(x.raw??x.n)===externalNerve)?.n??externalNerve,externalSystem):chosen&&selected?structureProfile(chosen.name,selected.system,selected):null;
 // Only a real Foundational Model of Anatomy id of a BodyParts3D structure is shown as a reference (and links to the BodyParts3D database); structures this project built itself (PK-, HRAF-, SERO- …) have no such id and show nothing.
 const atlasReference=!externalNerve&&chosen&&/^FMA[0-9]+$/.test(chosen.id)&&chosen.elements.length>0&&chosen.elements.every(id=>/^(?:FJ[0-9]|BP3S-FMA)/.test(id))?chosen.id:null;
 const filterSide=(ids:string[],side:'both'|Side)=>{if(side==='both')return ids;return ids.filter(id=>{const p=parts.get(id);if(!p)return false;const sd=anatomicalSide(p);return sd===side||sd==='midline'||(p.system==='integumentary'&&p.name==='Skin');});};
 const motionFocusIds=(side:'both'|Side)=>{
  if(!atlas)return[];
  const order:RegionId[]=['shoulder','arm','forearm','hand'];
  const start=region==='whole-body'?0:Math.max(0,order.indexOf(region));
  const ids=new Set<string>();
  for(const rid of order.slice(start)){for(const id of filterSide(resolveDissection(atlas,rid,0).partIds,side))ids.add(id);}
  return [...ids];
 };
 const dissect=(nextStage:number)=>{stopMotionAnimation();if(!atlas||region==='whole-body')return;setMotionEdit(false);const resolved=resolveDissection(atlas,region,nextStage),ids=filterSide(resolved.partIds,studySide);setDissectionStage(resolved.stage);setChosen(null);setDetails(false);setPanel(null);setState(s=>({...s,focusParts:ids,selected:[],isolate:false,explode:0,rotate:false,bodyMotion:undefined,partTransforms:undefined}));};
 const focusSide=(side:'both'|Side)=>{stopMotionAnimation();if(!atlas)return;if(side==='both'&&topRegion==='upper'&&region==='whole-body'){selectTop('upper');return;}setMotionEdit(false);setStudySide(side);if(side!=='both')setMotionSide(side);if(region==='whole-body'){if(side==='both'){setState(s=>({...s,focusParts:undefined,cameraFocusParts:undefined,selected:[],bodyMotion:undefined,partTransforms:undefined}));return;}const ids=motionFocusIds(side);setState(s=>({...s,focusParts:ids,cameraFocusParts:ids,cameraFocusNonce:(s.cameraFocusNonce??0)+1,selected:[],isolate:false,explode:0}));return;}const resolved=resolveDissection(atlas,region,dissectionStage),ids=filterSide(resolved.partIds,side);setState(s=>({...s,focusParts:ids,cameraFocusParts:ids,cameraFocusNonce:(s.cameraFocusNonce??0)+1,selected:[],isolate:false,explode:0}));};
 const changeRegion=(next:RegionId)=>{stopMotionAnimation();motionTargetRef.current=NEUTRAL_POSE;motionPoseRef.current=NEUTRAL_POSE;setRegion(next);setDissectionStage(0);setChosen(null);setDetails(false);setMotionEdit(false);setState(s=>({...s,bodyMotion:undefined,partTransforms:undefined}));setMotionPose(NEUTRAL_POSE);if(!atlas||next==='whole-body'){setStudySide('both');setState(s=>({...s,focusParts:undefined,cameraFocusParts:undefined,selected:[],isolate:false,explode:0,rotate:false,visible:DEFAULT_VISIBLE,bodyMotion:undefined,partTransforms:undefined}));return;}const resolved=resolveDissection(atlas,next,0),ids=filterSide(resolved.partIds,studySide);setState(s=>({...s,focusParts:ids,cameraFocusParts:ids,cameraFocusNonce:(s.cameraFocusNonce??0)+1,cameraFocusScale:1,selected:[],isolate:false,explode:0,rotate:false,visible:REGIONAL_VISIBLE,bodyMotion:undefined,partTransforms:undefined}));};
 const buildShownMotion=(pose:MotionPose,shownSide:'both'|Side)=>{const sides:Side[]=shownSide==='both'?['left','right']:[shownSide];const builds=sides.map(side=>buildUpperLimbMotion(atlas!,side,pose));return{transforms:Object.assign({},...builds.map(b=>b.transforms)),warnings:builds.flatMap(b=>b.warnings)};};
 const commitMotionPose=(pose:MotionPose,side:'both'|Side)=>{if(!atlas||!motionEnabled)return;motionPoseRef.current=pose;setMotionEdit(true);const built=buildShownMotion(pose,side);if(built.warnings.length)setNotice(built.warnings.join(' '));else setNotice('');setState(s=>({...s,bodyMotion:undefined,partTransforms:built.transforms,rotate:false}));};
 // Direct manipulation follows the latest input once per animation frame.
 // A smoothing loop previously rewrote the slider with older angles, kept
 // moving after release, and captured the wrong side during a side switch.
 // Direct manipulation: each input only records the latest requested pose. Once per animation frame the pose is resolved against the joint limits and
 // the collision envelope, and the page state is updated in a single batch (pose readout, notice and bone transforms together).
 const requestedPose=useRef<{pose:MotionPose;side:'both'|Side}|null>(null);
 const applyMotionPose=(pose:MotionPose,side:'both'|Side=studySide)=>{if(!atlas||!motionEnabled)return;requestedPose.current={pose,side};motionTargetRef.current=constrainPose(pose);motionInputSide.current=side;if(smoothMotionFrame.current!==null)return;smoothMotionFrame.current=requestAnimationFrame(()=>{smoothMotionFrame.current=null;const request=requestedPose.current;requestedPose.current=null;if(!request||!atlas)return;let target=constrainPose(request.pose),block='';for(const arm of request.side==='both'?(['left','right'] as Side[]):[request.side]){const r=resolveArmCollision(atlas,arm,target);target=r.pose;if(r.limited&&r.contact)block=`${r.contact.segment==='hand'?'手':r.contact.segment==='forearm'?'前臂':'上臂'}已碰到${r.contact.body==='head'?'頭部':r.contact.body==='neck'?'頸部':'軀幹'}，角度已依人體活動度限制，避免穿過身體。`;}motionTargetRef.current=target;setMotionBlock(block);setMotionPose(target);commitMotionPose(target,request.side);});};
 const activateMotionSide=(side:Side)=>{if(!atlas||!motionEnabled)return;stopMotionAnimation();setTopRegion('upper');setMotionSide(side);setStudySide(side);motionTargetRef.current=NEUTRAL_POSE;motionPoseRef.current=NEUTRAL_POSE;setMotionPose(NEUTRAL_POSE);setMotionEdit(true);const ids=filterSide(motionRegionIds('upper'),side),built=buildUpperLimbMotion(atlas,side,NEUTRAL_POSE);if(built.warnings.length)setNotice(built.warnings.join(' '));else setNotice('');setState(s=>({...s,focusParts:ids,cameraFocusParts:ids,cameraFocusNonce:(s.cameraFocusNonce??0)+1,bodyMotion:undefined,partTransforms:built.transforms,selected:[],isolate:false,explode:0,rotate:false}));};
 const setJoint=(key:keyof MotionPose,value:number)=>{applyMotionPose({...motionTargetRef.current,[key]:value});};
 /** Eases the digits from the current pose to a gesture over half a second (the other joints stay as they are). */
 const gestureFrame=useRef<number|null>(null);
 const [gestureMs,setGestureMs]=useState(500);
 const playGesture=(to:Partial<MotionPose>)=>{
  if(gestureFrame.current!==null)cancelAnimationFrame(gestureFrame.current);
  const from=motionTargetRef.current,t0=performance.now();
  const step=(now:number)=>{const u=Math.min(1,(now-t0)/gestureMs),e=u*u*(3-2*u),digits=Object.fromEntries(DIGIT_KEYS.map(k=>[k,from[k]+((to[k]??0)-from[k])*e]));applyMotionPose({...motionTargetRef.current,...digits});gestureFrame.current=u<1?requestAnimationFrame(step):null;};
  gestureFrame.current=requestAnimationFrame(step);
 };
 const nudgeJoint=(side:Side,key:'shoulderAbduction'|'shoulderFlexion'|'elbowFlexion',delta:number)=>{if(!atlas||!motionEnabled)return;setMotionSide(side);setStudySide(side);const limits=MOTION_LIMITS[key],base=motionTargetRef.current,value=Math.max(limits[0],Math.min(limits[1],base[key]+delta)),pose={...base,[key]:value};applyMotionPose(pose,side);};
 const neutralMotion=()=>{stopMotionAnimation();applyMotionPose(NEUTRAL_POSE);};
 const chooseMotionAction=(action:UpperMotionAction)=>setMotionAction(action);
 const upperActionKey=UPPER_MOTION_KEY[motionAction],upperActionLimit=MOTION_LIMITS[upperActionKey];
 const pullMotion=(value:number)=>applyMotionPose({...motionTargetRef.current,[upperActionKey]:value});
 useEffect(()=>()=>{if(smoothMotionFrame.current!==null)cancelAnimationFrame(smoothMotionFrame.current);},[]);
 const bodyRigs=useMemo(()=>atlas?{head:makeBodyRig(atlas,'head'),spine:makeBodyRig(atlas,'spine'),leftLeg:makeBodyRig(atlas,'leftLeg'),rightLeg:makeBodyRig(atlas,'rightLeg')}:null,[atlas]);
 const topFocusIds=(next:TopRegion)=>atlas?topRegionParts(atlas.parts,next as 'whole'|'upper'|'lower'|'head'|'organs',ORGAN_SYSTEM_IDS):undefined;
 const selectTop=(next:TopRegion)=>{
  setMicroAtlas(null);if(!atlas||!bodyRigs)return;
  if(smoothMotionFrame.current!==null){cancelAnimationFrame(smoothMotionFrame.current);smoothMotionFrame.current=null;}requestedPose.current=null;
  setTopRegion(next);setRegionSub(undefined);setLungView(null);setStudySide('both');setRegion('whole-body');setDissectionStage(0);setMotionEdit(false);setMotionEnabled(false);
  setMotionPose(NEUTRAL_POSE);motionPoseRef.current=NEUTRAL_POSE;motionTargetRef.current=NEUTRAL_POSE;
  setDetails(false);setChosen(null);setExternalNerve(null);
  const ids=topFocusIds(next);
  setState(s=>({...s,focusParts:ids,cameraFocusParts:ids,cameraFocusNonce:(s.cameraFocusNonce??0)+1,cameraFocusScale:1,cameraFocusDir:undefined,nerveFilter:undefined,fadedParts:undefined,lungOpacity:undefined,bodyMotion:undefined,partTransforms:undefined,selected:[],hiddenParts:[],depthFilter:'all',muscleLayer:'all',faceMuscleLayer:'all',isolate:false,explode:0,rotate:false,reset:s.reset+1}));
 };

 // ---- top region bar -------------------------------------------------------------------------------------------------------------
 // Region membership comes from app/mj-region-bar.ts. Choosing a region shows only its structures, turns the camera to it and zooms in; body cavities open on an
 // internal view (skin and wall muscles are not members, the ribs and sternum are drawn see-through, the organs solid). The left-hand system switches still work, but
 // only on this region's structures. ← restores what was shown before the first region was chosen.
 const regionIndex=useMemo(()=>atlas?buildRegionIndex(atlas.parts):null,[atlas]);
 const regionSets=useMemo(()=>atlas&&regionIndex&&GENERIC_REGIONS.includes(topRegion)&&studySide!=='both'?regionMembers(regionIndex,atlas.parts,topRegion as RegionKey,regionSub,studySide):null,[atlas,regionIndex,topRegion,regionSub,studySide]);
 const applyRegion=(key:RegionKey,sub:string|undefined,side:'both'|Side,changed=true)=>{
  if(!atlas||!regionIndex)return;
  stopMotionAnimation();requestedPose.current=null;
  const wasLung=!!lungView,snap=regionPrev??{prev:state,topRegion,studySide,rightTool,motionEnabled};
  if(topRegion==='whole'&&!regionPrev)setRegionPrev(snap);
  setMicroAtlas(null);setMotionEdit(false);setMotionEnabled(false);setDetails(false);setPanel(null);setChosen(null);setExternalNerve(null);setSpaceId(null);setSpaceItem(null);
  setRegion('whole-body');setDissectionStage(0);setMotionPose(NEUTRAL_POSE);motionPoseRef.current=NEUTRAL_POSE;motionTargetRef.current=NEUTRAL_POSE;
  setTopRegion(key as TopRegion);setRegionSub(sub);setStudySide(side);if(side!=='both')setMotionSide(side);
  if(key==='chest'&&sub==='lung'){
   // 肺與胸膜 is the lung view of the 肺 button: same ids, same panel, same camera
   if(!lungView)setLungView(snap);
   setRightTool(null);setLungSide(side);
   if(!wasLung){const inner={bronchi:false,vessels:false,touched:false};setLungInner(inner);setLungLabels(false);aimLungView(side,true,inner,false);}else{const labels=lungLabels&&side!=='both';if(side==='both')setLungLabels(false);aimLungView(side,false,lungInner,labels);}
   return;
  }
  setLungView(null);
  const set=regionMembers(regionIndex,atlas.parts,key,sub,side);
  const allSerous=SEROUS_LAYERS.map(l=>l.key) as string[];
  setState(s=>({...s,
   focusParts:set.focus,cameraFocusParts:set.camera,cameraFocusDir:regionDirection(key,sub),cameraFocusScale:regionZoom(key,sub),cameraFocusNonce:(s.cameraFocusNonce??0)+1,
   fadedParts:set.faded.length?set.faded:undefined,nerveFilter:key==='head'?undefined:regionNerveFilter(key,sub),lungOpacity:undefined,
   visible:changed?regionVisible(key,sub):s.visible,hiddenSerous:changed?allSerous:s.hiddenSerous,
   hiddenParts:[],selected:[],isolate:false,explode:0,rotate:false,bodyMotion:undefined,partTransforms:undefined,
   depthFilter:'all',muscleLayer:'all',muscleRegion:undefined,faceMuscleLayer:'all',reset:s.reset}));
 };
 const backToWhole=()=>{
  if(lungView){exitLungView();return;}
  const prev=regionPrev;
  if(prev){
   setRegionPrev(null);setRegionSub(undefined);setTopRegion(prev.topRegion);setStudySide(prev.studySide);setRightTool(prev.rightTool);setMotionEnabled(prev.motionEnabled);setFadeOther(false);setChosen(null);setDetails(false);
   setState(s=>({...prev.prev,reset:prev.prev.cameraFocusParts?s.reset:s.reset+1,cameraFocusNonce:prev.prev.cameraFocusParts?(s.cameraFocusNonce??0)+1:prev.prev.cameraFocusNonce}));
   return;
  }
  selectTop('whole');
 };
 /** a region button of the bar */
 const chooseRegion=(key:RegionKey)=>{
  if(key==='whole'){backToWhole();return;}
  if(key==='upper'||key==='lower'||key==='head'){selectTop(key as TopRegion);return;}
  applyRegion(key,regionDef(key).subs?.[0]?.id,'both');
 };
 // The body-surface layer (skin) is skinned over the same limb segment chain, so it stays available while a limb moves.
 const skinIds=()=>atlas?.parts.filter(p=>p.system==='integumentary'&&p.name==='Skin').map(p=>p.id)??[];
 const motionRegionIds=(target:'head'|'upper'|'lower'|'spine'|'leftLeg'|'rightLeg')=>{
  if(!atlas)return[] as string[];
  if(target==='spine')return atlas.parts.map(p=>p.id);
  if(target==='head')return [...partsInRegion(atlas.parts,'head-neck'),...skinIds()];
  if(target==='upper')return [...partsInRegion(atlas.parts,'upper-limb'),...skinIds()];
  if(target==='lower')return [...partsInRegion(atlas.parts,'lower-limb'),...skinIds()];
  const wantedSide=target==='leftLeg'?'left':'right';
  return [...atlas.parts.filter(p=>anatomicalRegion(p)==='lower-limb'&&(anatomicalSide(p)===wantedSide||anatomicalSide(p)==='midline')).map(p=>p.id),...skinIds()];
 };
 const stopMotionAnimation=()=>{if(gestureFrame.current!==null){cancelAnimationFrame(gestureFrame.current);gestureFrame.current=null;}if(smoothMotionFrame.current!==null)cancelAnimationFrame(smoothMotionFrame.current);smoothMotionFrame.current=null;};
 const enterUpperMotion=()=>{if(!atlas)return;stopMotionAnimation();setMotionPose(NEUTRAL_POSE);motionPoseRef.current=NEUTRAL_POSE;motionTargetRef.current=NEUTRAL_POSE;setMicroAtlas(null);setStudySide('both');setTopRegion('upper');setRegion('whole-body');setMotionEdit(true);const ids=motionRegionIds('upper');setState(s=>({...s,bodyMotion:undefined,partTransforms:undefined,focusParts:ids,cameraFocusParts:ids,cameraFocusNonce:(s.cameraFocusNonce??0)+1,cameraFocusScale:.82,selected:[],isolate:false,explode:0,rotate:false}));};
 const enterLowerMotion=()=>changeBody('rightLeg',{...BODY_NEUTRAL},true);
 /** Side chooser beside the region menu (upper limb and lower limb): shows one limb with the trunk structures that belong to it, camera on it; the other side is hidden or, with 淡化, drawn faded. */
 const sideSplit=(target:'upper'|'lower',side:Side)=>{const other:Side=side==='left'?'right':'left',all=motionRegionIds(target),keep=filterSide(all,side),away=all.filter(id=>{const p=parts.get(id);return !!p&&p.system!=='integumentary'&&anatomicalSide(p)===other;});return{keep,away};};
 const applySide=(side:'both'|Side)=>{
  if(atlas&&GENERIC_REGIONS.includes(topRegion)){applyRegion(topRegion as RegionKey,regionSub,side,false);return;}
  if(!atlas||(topRegion!=='upper'&&topRegion!=='lower'))return;
  stopMotionAnimation();
  if(side==='both'){if(topRegion==='upper'&&motionEnabled)enterUpperMotion();else selectTop(topRegion);return;}
  if(topRegion==='upper'&&motionEnabled){activateMotionSide(side);return;}
  if(topRegion==='lower'&&(motionEnabled||state.bodyMotion)){changeBody(side==='left'?'leftLeg':'rightLeg',{...BODY_NEUTRAL},true);return;}
  setMicroAtlas(null);setMotionEdit(false);setStudySide(side);setMotionSide(side);setChosen(null);setDetails(false);setExternalNerve(null);
  const {keep}=sideSplit(topRegion,side);
  setState(s=>({...s,focusParts:keep,cameraFocusParts:keep,cameraFocusNonce:(s.cameraFocusNonce??0)+1,cameraFocusScale:.82,selected:[],isolate:false,explode:0,rotate:false,bodyMotion:undefined,partTransforms:undefined}));
 };
 const spaceSides:Side[]=studySide==='both'?['left','right']:[studySide];
 const spaceHits=useMemo<SpaceHit[]>(()=>{const def=SPACES.find(x=>x.id===spaceId);return atlas&&def?spaceSides.map(sd=>resolveSpace(atlas.parts,def,sd)):[];},[atlas,spaceId,studySide]);// eslint-disable-line react-hooks/exhaustive-deps
 const spaceItems=useMemo(()=>{const def=SPACES.find(x=>x.id===spaceId);if(!def)return null;const merge=(key:'boundaries'|'contents')=>def[key].map((item,i)=>({item,ids:spaceHits.flatMap(h=>h[key][i].ids),nerves:spaceHits.flatMap(h=>h[key][i].nerves)}));return{def,boundaries:merge('boundaries'),contents:merge('contents')};},[spaceId,spaceHits]);
 // the sphere (centre from the real meshes, radius from the space's definition) of each side shown
 const rangesOf=(def:SpaceDef,sides:Side[])=>sides.map(sd=>{const e=(SPACE_RANGES as unknown as Record<string,{r:number;left?:{c:[number,number,number]};right?:{c:[number,number,number]}}>)[def.id]?.[sd];return e?{c:e.c,r:def.r}:null;}).filter((x):x is {c:[number,number,number];r:number}=>!!x);
 const contentRangesOf=(def:SpaceDef,sides:Side[])=>rangesOf(def,sides).map(r=>({...r,r:r.r*1.7}));
 /** outline of a space on each side shown: its edges as vertex references, coloured like the labels of the boundaries that form them */
 const outlinesOf=(def:SpaceDef,sides:Side[])=>{const shape=SPACE_SHAPES[def.id],data=(SPACE_SHAPE_DATA as unknown as Record<string,Partial<Record<Side,{chains:{edge:number;refs:OutlineRef[]}[];apex?:OutlineRef}>>>)[def.id];if(!shape||!data)return undefined;const out=sides.map(sd=>{const d=data[sd];return d?{fill:shape.fill,chains:d.chains.map(c=>({color:SHAPE_COLORS[shape.edges[c.edge]!.color],refs:c.refs})),apex:d.apex}:null;}).filter((x):x is NonNullable<typeof x>=>!!x);return out.length?out:undefined;};
 const edgeColorOf=(def:SpaceDef,en:string)=>{const shape=SPACE_SHAPES[def.id],edge=shape?.edges.find(e=>e.items.includes(en));return edge?SHAPE_COLORS[edge.color]:undefined;};
 const lookOf=(def:SpaceDef,sd:Side):[number,number,number]=>[def.look[0]*(sd==='left'?1:-1),def.look[1],def.look[2]];
 const spaceView=useMemo(()=>{
  if(!atlas||!spaceItems)return null;
  const all=[...spaceItems.boundaries,...spaceItems.contents],picked=all.find(x=>x.item.en===spaceItem&&x.item.zh);
  const full=[...new Set(spaceHits.flatMap(h=>h.highlight))],fullNerves=[...new Set(spaceHits.flatMap(h=>h.nerves))];
  const ids=picked?picked.ids:full,nerves=picked?picked.nerves:fullNerves;
  const regionSeed=[...spaceItems.boundaries,...spaceItems.contents].flatMap(x=>x.ids)[0];
  const anchor=regionSeed?parts.get(regionSeed):undefined;
  const bodyRegion=anchor?anatomicalRegion(anchor):undefined;
  const scope=bodyRegion?atlas.parts.filter(p=>anatomicalRegion(p)===bodyRegion&&(studySide==='both'||anatomicalSide(p)===studySide||anatomicalSide(p)==='midline')&&REGIONAL_VISIBLE.includes(p.system)).map(p=>p.id):full;
  const focus=[...new Set([...scope,...full])];
  const contentIds=[...new Set(spaceItems.contents.flatMap(x=>x.ids))],range=contentRangesOf(spaceItems.def,spaceSides),outlines=outlinesOf(spaceItems.def,spaceSides);
  const label=(x:{item:{en:string;zh:string;role?:string};ids:string[];nerves:string[]},content:boolean)=>({key:x.item.en,text:`${x.item.en} ${x.item.zh}${x.item.role?` — ${x.item.role}`:''}`,ids:x.ids,nerves:x.nerves,content,color:content?undefined:edgeColorOf(spaceItems.def,x.item.en)});
  const labels=[...spaceItems.boundaries.map(x=>label(x,false)),...spaceItems.contents.map(x=>label(x,true))].filter(l=>l.ids.length||l.nerves.length);
  return{ids,nerves,focus,faded:focus.filter(id=>!full.includes(id)||(!!picked&&!ids.includes(id))),systems:[...new Set(full.map(id=>parts.get(id)?.system).filter(Boolean))] as SystemId[],range,rangeIds:contentIds,contentIds,labels,outlines};
 },[atlas,spaceItems,spaceItem,spaceHits,studySide,parts]);
 const pickSpaceRef=useRef<(def:SpaceDef)=>void>(()=>{});
 const pickSpace=(def:SpaceDef)=>{
  if(spaceId===def.id){setSpaceId(null);setSpaceItem(null);setChosen(null);setDetails(false);setExternalNerve(null);setState(s=>({...s,selected:[],focusParts:topRegion==='whole'?undefined:s.focusParts,isolate:false}));return;}
  if(!atlas)return;
  const hits=spaceSides.map(sd=>resolveSpace(atlas.parts,def,sd)),full=[...new Set(hits.flatMap(h=>h.highlight))],range=rangesOf(def,spaceSides),contentIds=[...new Set(hits.flatMap(h=>h.contents.flatMap(c=>c.ids)))];
  if(!full.length||!range.length)return;
  setSpaceId(def.id);setSpaceItem(null);setLayerPicked(null);setChosen(null);setDetails(false);setExternalNerve(null);
  setState(s=>({...s,selected:contentIds,hiddenParts:(s.hiddenParts??[]).filter(x=>!full.includes(x)),visible:[...new Set([...s.visible,...REGIONAL_VISIBLE])],muscleLayer:'all',cameraFocusParts:undefined,cameraFocusNerve:undefined,cameraFocusRange:{c:range[0].c,r:range[0].r,dir:lookOf(def,spaceSides[0])},cameraFocusNonce:(s.cameraFocusNonce??0)+1,cameraFocusScale:.85,isolate:false,rotate:false}));
 };
 pickSpaceRef.current=pickSpace;
 const pickSpaceItem=(key:string,hit:{item:{en:string};ids:string[];nerves:string[]})=>{
  if(spaceItem===key){setSpaceItem(null);setChosen(null);setDetails(false);setExternalNerve(null);setState(s=>({...s,selected:[...new Set(spaceHits.flatMap(h=>h.highlight))]}));return;}
  setSpaceItem(key);
  if(hit.ids.length){const p=parts.get(hit.ids[0])!;setExternalNerve(null);setChosen(hit.ids.length===1?{id:p.conceptId,name:p.name,elements:hit.ids}:null);setDetails(hit.ids.length===1);setState(s=>({...s,selected:hit.ids,cameraFocusParts:hit.ids,cameraFocusNonce:(s.cameraFocusNonce??0)+1,isolate:false,rotate:false}));}
  else if(hit.nerves[0]){chooseNerve(hit.nerves[0]);}
 };
 useEffect(()=>{setSpaceId(null);setSpaceItem(null);},[topRegion,region,studySide]);
 const spaceGroups:SpaceGroup[]|null=topRegion==='upper'?(region==='shoulder'?['shoulder']:region==='arm'||region==='forearm'?['arm']:region==='hand'?['hand']:['shoulder','arm','hand']):topRegion==='lower'?['lower']:topRegion==='head'?['head']:topRegion==='chest'||topRegion==='abdomen'?['trunk']:topRegion==='back'?['head']:topRegion==='pelvis'||topRegion==='gluteal'?[]:null;
 const layerChoices=useMemo(()=>{const ids=layerRegionsFor(topRegion==='whole'||topRegion==='organs'?'whole':topRegion,region);return ids?MUSCLE_LAYER_REGIONS.filter(r=>ids.includes(r.id)):MUSCLE_LAYER_REGIONS;},[topRegion,region]);
 useEffect(()=>{if(state.muscleRegion&&!layerChoices.some(r=>r.id===state.muscleRegion))setState(s=>({...s,muscleRegion:undefined,muscleLayer:'all',selected:[],isolate:false}));},[layerChoices]);// eslint-disable-line react-hooks/exhaustive-deps
 const sideButtons=<>{([['both','Both｜雙側'],['left','Left｜左側'],['right','Right｜右側']] as ['both'|Side,string][]).map(([id,label])=><Button variant="ghost" key={id} aria-pressed={studySide===id} onClick={()=>applySide(id)}>{label}</Button>)}</>;
 const inspectMotionStructure=(term:string)=>{if(!atlas)return;const t=term.toLowerCase(),side=state.bodyMotion?.region==='leftLeg'?'left':state.bodyMotion?.region==='rightLeg'?'right':!state.bodyMotion&&studySide!=='both'?studySide:null;let candidates=atlas.concepts.filter(x=>x.name.toLowerCase().includes(t));if(side){const sided=candidates.filter(x=>x.name.toLowerCase().includes(side));if(sided.length)candidates=sided;}candidates.sort((a,b)=>a.name.length-b.name.length);if(candidates[0])choose(candidates[0]);};
 const openMicroAtlas=(next:MicroAtlasId)=>{setMicroAtlas(next);setDetails(false);setPanel(null);setRightTool(null);setChosen(null);setExternalNerve(null);setMotionEdit(false);setMotionEnabled(false);};
 const changeBody=(bodyRegion:BodyRegion,pose:BodyPose,focus=false)=>{stopMotionAnimation();motionTargetRef.current=NEUTRAL_POSE;setMicroAtlas(null);if(!bodyRigs)return;const rig=bodyRigs[bodyRegion],built=buildBodyMotion(rig,pose);setMotionEdit(false);setRegion('whole-body');setStudySide(bodyRegion==='leftLeg'?'left':bodyRegion==='rightLeg'?'right':'both');setDetails(false);setChosen(null);setExternalNerve(null);setMotionPose(NEUTRAL_POSE);motionPoseRef.current=NEUTRAL_POSE;const ids=bodyRegion==='head'?motionRegionIds('head'):bodyRegion==='spine'?motionRegionIds('spine'):motionRegionIds(bodyRegion);const scale=bodyRegion==='head'?.76:bodyRegion==='spine'?1:.82;setState(s=>({...s,bodyMotion:{region:bodyRegion,pose:built.pose},partTransforms:built.transforms,focusParts:bodyRegion==='spine'?undefined:ids,cameraFocusParts:ids,cameraFocusNonce:focus||s.bodyMotion?.region!==bodyRegion?(s.cameraFocusNonce??0)+1:s.cameraFocusNonce,cameraFocusScale:scale,selected:[],isolate:false,explode:0,rotate:false}));};
 useEffect(()=>{if(atlas&&(initialRegion==='lower'||initialRegion==='upper'))selectTop(initialRegion);},[atlas,initialRegion]);
 // With 另一側淡化 the hidden side stays in the scene, faded: the scene draws the ids in fadedParts see-through. Nerves and schematic veins of the other side stay hidden.
 const fadedSide=useMemo(()=>{if(!atlas||!fadeOther||studySide==='both'||!state.focusParts)return null;if(regionSets)return regionSets.other;if(topRegion!=='upper'&&topRegion!=='lower')return null;const other=studySide==='left'?'right':'left';return motionRegionIds(topRegion).filter(id=>{const p=parts.get(id);return !!p&&p.system!=='integumentary'&&anatomicalSide(p)===other;});},[atlas,fadeOther,studySide,topRegion,regionSets,!!state.focusParts]);// eslint-disable-line react-hooks/exhaustive-deps
 const mergedFocus=useMemo(()=>fadedSide&&state.focusParts?[...state.focusParts,...fadedSide]:state.focusParts,[fadedSide,state.focusParts]);
 const baseSceneState=spaceView?{...state,focusParts:spaceView.focus,fadedParts:spaceView.faded,highlightNerves:spaceView.nerves,spaceRange:spaceView.range,spaceRangeIds:spaceView.rangeIds,spaceOutlines:spaceView.outlines,spaceContentIds:spaceView.contentIds,spaceLabels:spaceView.labels,visible:[...new Set([...state.visible,...REGIONAL_VISIBLE])]}:fadedSide?{...state,focusParts:mergedFocus,fadedParts:[...(state.fadedParts??[]),...fadedSide]}:state;
 // Selecting the hilum also lights the real meshes that enter it (bronchus orange, pulmonary artery red, pulmonary veins blue), so their arrangement can be read off the model.
 const hilumRoot=lungLabelRows.length&&chosen&&/^hilum of (?:left|right) lung$/i.test(chosen.name)&&atlas&&lungSide!=='both'?lungHilumRoot(atlas,lungSide):null;
 const hilumIds=hilumRoot?[...hilumRoot.bronchus,...hilumRoot.artery,...hilumRoot.veins]:[];
 const lungSceneState=lungLabelRows.length?{...baseSceneState,...(hilumIds.length?{selected:[...new Set([...baseSceneState.selected,...hilumIds])],spaceContentIds:hilumIds,spaceRange:undefined}:{}),
  partLabels:lungLabelRows.map(r=>{const pr=structureProfile(r.name,r.system as SystemId);const on=catActive(r.cat);return{key:r.key,en:pr.english,zh:pr.chinese??'',ids:r.ids,near:r.near,...(on&&r.cat?{cat:r.cat,letter:LUNG_CATEGORY[r.cat].letter,color:LUNG_CATEGORY[r.cat].light}:{})};}),
  lungTint:LUNG_CATEGORIES.filter(c=>catActive(c.key)).map(c=>({ids:lungLabelRows.filter(r=>r.cat===c.key).flatMap(r=>r.ids),color:c.light})).filter(t=>t.ids.length)}:null;
 const sceneState=lungSceneState??baseSceneState;
 // a label opens the data card of its structure without moving the camera
 const pickLabel=(id:string)=>{const p=parts.get(id);if(!p)return;setExternalNerve(null);setChosen({id:p.conceptId,name:p.name,elements:[id]});setState(s=>({...s,selected:[id]}));setDetails(true);setPanel(null);};
 return <main className="studio">
  {microAtlas?<MicroAtlasScene atlasId={microAtlas} onExit={()=>setMicroAtlas(null)}/>:atlas&&<AnatomyScene atlas={atlas} state={{...sceneState,inspectorOpen:details&&(selectedParts.length>0||!!externalNerve)}} onSelect={choosePart} onClear={clearSelection} onLabelPick={pickLabel} onSelectNerve={chooseNerve} onProgress={setProgress} onLoadStatus={setLoadStatus} retryNonce={retryNonce} onError={setError} onJointDrag={nudgeJoint} region={region} focusSide={state.focusParts?studySide:'both'} motionActive={motionEdit&&!!state.focusParts} jointMotionEnabled={motionEnabled} selectedExternalNerve={externalNerve} bodyArea={topRegion}/>}
  <div className="vignette"/>
  <header className="identity"><div className="eyebrow"><span className="status-dot"/> INTERACTIVE ANATOMY ATLAS</div><h1><button type="button" className="title-reset" title="Reset to default｜回到初始設定" aria-label="Reset to default｜回到初始設定" onClick={reset}>MJ Anatomy</button><Badge variant="outline" className="edition">3D</Badge></h1><div className="identity-meta">{atlas?atlas.parts.length.toLocaleString():'…'} structures <span>·</span> 可點選構造</div></header>
  {(()=>{const picked=topRegion!=='whole'&&topRegion!=='organs'&&!microAtlas,def=regionDef(topRegion==='organs'?'whole':topRegion as RegionKey);
   return <nav className={`body-region-nav top-region-nav region-bar ${picked?'limb-picked':''}`} aria-label="身體區域">
   <Button variant="ghost" className="tab-back" aria-label="返回上一層" tabIndex={picked?0:-1} onClick={backToWhole}>←</Button>
   {REGION_BAR.map(r=>{const hide=picked&&topRegion!==r.key;return <Button variant="ghost" key={r.key} className={hide?'tab-hidden':''} aria-hidden={hide} tabIndex={hide?-1:0} aria-pressed={topRegion===r.key&&!microAtlas} onClick={()=>picked&&topRegion===r.key?backToWhole():chooseRegion(r.key)}>{r.label}</Button>;})}
   {picked&&def.subs&&<span className="tab-subs" role="group" aria-label={`${def.label}的深度`}>{def.subs.map(sub=><Button variant="ghost" key={sub.id} aria-pressed={regionSub===sub.id} onClick={()=>applyRegion(topRegion as RegionKey,sub.id,studySide)}>{sub.label}</Button>)}</span>}
   {picked&&def.paired&&<span className="tab-sides" role="group" aria-label={`${def.label}側別`}>{([['both','雙側'],['left','左側'],['right','右側']] as ['both'|Side,string][]).map(([id,label])=><Button variant="ghost" key={id} aria-pressed={studySide===id} onClick={()=>applySide(id)}>{label}</Button>)}</span>}
   {picked&&def.paired&&studySide!=='both'&&<label className="side-fade-toggle"><input type="checkbox" checked={fadeOther} onChange={e=>setFadeOther(e.target.checked)}/>淡化另一側</label>}
  </nav>;})()}
  <nav className="top-actions" aria-label="工具列"><a className="top-link quiz-link" href={quizHref} aria-label="開啟 Quiz，先選擇部位" title="Quiz"><GraduationCap size={18}/><span>Quiz</span></a><Button variant="ghost" className={panel==='search'?'active':''} onClick={()=>openPanel('search')} aria-label="搜尋構造"><Search size={18}/><span>Find a structure｜搜尋</span><kbd>/</kbd></Button><Button variant="ghost" className="icon-button" aria-label="關於本圖譜與來源" onClick={()=>{setDetails(false);setPanel(null);setAbout(true);}}><Info size={18}/></Button></nav>
  <aside className={`left-workspace ${panel==='layers'?'mobile-open':''}`}>
  <section className={`layers-panel glass ${panel==='layers'?'mobile-open':''}`} aria-label="Anatomical layers">
   <Button variant="ghost" className="mobile-only close-systems" onClick={()=>setPanel(null)} aria-label="Close systems"><X size={18}/></Button>
   <div className="system-list">
    {primarySystems.map(s=><div className={`system-row ${state.visible.includes(s.id)?'enabled':''}`} key={s.id}><Button variant="ghost" className="system-name" title={`只顯示${s.zh}｜Show only ${s.name.toLowerCase()}`} onClick={()=>setState(v=>({...v,visible:[s.id],isolate:false,selected:[]}))}><span className="system-dot" style={{background:s.color}}/><span className="system-en">{s.name}</span><small className="system-zh">{s.zh}</small><span className="system-count">{counts[s.id]}</span></Button><Switch checked={state.visible.includes(s.id)} onCheckedChange={()=>toggle(s.id)} aria-label={`Show ${s.name.toLowerCase()}`} /></div>)}
    {organSystems.length>0&&<div className={`organ-layer ${organsOpen?'open':''}`}>
     <div className={`system-row organ-parent ${anyOrganVisible?'enabled':''}`}>
      <Button variant="ghost" className="system-name organ-expand" aria-expanded={organsOpen} onClick={()=>setOrgansOpen(v=>!v)}><ChevronRight size={13}/><span className="system-dot organ-dot"/><span>Organs</span><span className="system-count">{organPieceCount}</span></Button>
      <Switch checked={allOrgansVisible} onCheckedChange={toggleOrgans} aria-label="Show all organ systems"/>
     </div>
     {organsOpen&&<div className="organ-children">{ORGAN_ORDER.map(id=>organSystems.find(x=>x.id===id)).filter((x):x is NonNullable<typeof x>=>!!x).map(s=>{
      const kids=SEROUS_OF[s.id],hasKids=!!kids||s.id==='reproductive',open=organRowsOpen.includes(s.id),count=(counts[s.id]??0)+(kids?serousCount(kids.map(l=>l.key)):0);
      return <Fragment key={s.id}><div className={`system-row ${state.visible.includes(s.id)?'enabled':''}`}>
       {hasKids?<Button variant="ghost" className="row-arrow" aria-expanded={open} aria-label={`${open?'收起':'展開'} ${ORGAN_LABEL[s.id]??s.name}`} onClick={()=>setOrganRowsOpen(o=>open?o.filter(x=>x!==s.id):[...o,s.id])}><ChevronRight size={13}/></Button>:<span className="row-arrow-spacer"/>}
       <Button variant="ghost" className="system-name" title={`只顯示${s.zh}｜Show only ${(ORGAN_LABEL[s.id]??s.name).toLowerCase()}`} onClick={()=>setState(v=>({...v,visible:kids&&s.id!=='respiratory'?[s.id,'serous']:[s.id],hiddenSerous:kids?SEROUS_LAYERS.map(l=>l.key).filter(k=>s.id==='respiratory'||!(kids.map(l=>l.key) as string[]).includes(k)):v.hiddenSerous,isolate:false,selected:[]}))}><span className="system-dot" style={{background:s.color}}/><span className="system-en">{ORGAN_LABEL[s.id]??s.name}</span><small className="system-zh">{s.zh}</small><span className="system-count">{count}</span></Button><span className="organ-detail-slot"/><Switch checked={state.visible.includes(s.id)} onCheckedChange={()=>kids?toggleOrganRow(s.id):toggle(s.id)} aria-label={`顯示${s.zh}`} /></div>
       {open&&s.id==='respiratory'&&<div className="organ-sub" role="group" aria-label="肺的分層與透明度"><div className="organ-sub-row layer-stepper"><span className="bn-stack"><span className="bn-en">Layer {lungLayer} / 2</span><small className="bn-zh">{lungLayer===1?'第 1 層：肺葉、氣管、主支氣管、肺門':'第 2 層：胸膜（半透明）'}</small></span><span className="layer-buttons"><Button variant="ghost" aria-label="減少一層（隱藏胸膜）" disabled={lungLayer<=1} onClick={()=>setState(v=>setSerousGroup(v,PLEURA_KEYS,false))}>－</Button><Button variant="ghost" aria-label="增加一層（顯示胸膜）" disabled={lungLayer>=2} onClick={()=>setState(v=>setSerousGroup({...v,visible:v.visible.includes('respiratory')?v.visible:[...v.visible,'respiratory']},PLEURA_KEYS,true))}>＋</Button></span></div>{lungLayer===2&&kids?.map(serousRow)}<label className="organ-sub-row"><span className="bn-stack"><span className="bn-en">Lung opacity</span><small className="bn-zh">肺透明度（預設不透明）</small></span><input type="range" className="organ-range" min={10} max={100} step={5} value={Math.round((state.lungOpacity??1)*100)} onChange={e=>{const value=Number(e.target.value)/100;setState(v=>({...v,lungOpacity:value}));}} aria-label="肺透明度"/></label></div>}
       {open&&s.id==='cardiac'&&kids&&<div className="organ-sub" role="group" aria-label="心包與心外膜">{kids.map(serousRow)}</div>}
       {open&&s.id==='reproductive'&&<div className="organ-sub" role="group" aria-label="生殖系統性別"><span>性別</span>{(['male','female'] as const).map(x=><Button key={x} variant="ghost" className="organ-detail-link" aria-pressed={(state.sex??'male')===x} title={x==='male'?'顯示男性生殖器官':'顯示女性生殖器官與女性骨盆'} onClick={()=>setState(v=>({...v,sex:x,visible:v.visible.includes('reproductive')?v.visible:[...v.visible,'reproductive']}))}>{x==='male'?'男':'女'}</Button>)}</div>}
       {open&&s.id==='reproductive'&&(state.sex??'male')==='female'&&<div className="organ-sub" role="group" aria-label="盆腔腹膜">{SEROUS_LAYERS.filter(l=>PERITONEUM_KEYS.includes(l.key)).map(serousRow)}<label className="organ-sub-row"><span className="bn-stack"><span className="bn-en">Peritoneum opacity</span><small className="bn-zh">腹膜透明度</small></span><input type="range" className="organ-range" min={10} max={80} step={5} value={Math.round((state.peritoneumOpacity??.3)*100)} onChange={e=>{const value=Number(e.target.value)/100;setState(v=>({...v,peritoneumOpacity:value}));}} aria-label="盆腔腹膜透明度"/></label></div>}
      </Fragment>;})}</div>}
    </div>}
   </div>
   <div className="detail-atlas-shortcuts" aria-label="Detail atlases">
    <Button variant="ghost" onClick={()=>{window.location.hash='#/organ/brain';}}>腦</Button>
    <Button variant="ghost" onClick={()=>{window.location.hash='#/organ/heart';}}>心</Button>
    <Button variant="ghost" onClick={enterLungView} aria-pressed={!!lungView}>肺</Button>
    {MICRO_ATLAS_ENTRY&&<><Button variant="ghost" onClick={()=>openMicroAtlas('eye')}>眼</Button><Button variant="ghost" onClick={()=>openMicroAtlas('ear')}>耳</Button></>}
   </div>
   <div className="panel-foot"><span>可見 {visibleCount.toLocaleString()} 件{((state.hiddenParts?.length??0)+(state.hiddenNerves?.length??0))>0&&<small> · 隱藏 {(state.hiddenParts?.length??0)+(state.hiddenNerves?.length??0)} 件</small>}</span><div className="panel-foot-actions">{((state.hiddenParts?.length??0)+(state.hiddenNerves?.length??0))>0&&<Button variant="ghost" onClick={restoreHidden}><Undo2 size={14}/> 還原隱藏</Button>}<Button variant="ghost" onClick={()=>setState(s=>({...s,visible:[],selected:[],isolate:false}))}>全部隱藏</Button><Button variant="ghost" onClick={reset}><RotateCcw size={14}/> 重設</Button></div></div>{((state.hiddenParts?.length??0)+(state.hiddenNerves?.length??0))>0&&<details className="hidden-structures"><summary>Hidden structures｜已隱藏 <span>{state.hiddenParts?.length}</span></summary><div>{(state.hiddenParts??[]).slice(0,24).map(id=>{const hp=profileForPart(id);return <Button variant="ghost" key={id} onClick={()=>restorePart(id)}><span>{hp?.english??parts.get(id)?.name??id}{hp?.chinese&&<small>{hp.chinese}</small>}</span><Undo2 size={13}/></Button>})}</div></details>}
  </section>
  <footer className="studio-footer workspace-credit"><Button variant="ghost" onClick={()=>{setDetails(false);setPanel(null);setAbout(true);}}>Source & credits｜來源與授權 <ArrowUpRight size={12}/></Button></footer>
  </aside>
  {lungView&&<aside className="lung-focus glass" aria-label="肺部聚焦">
   <div className="lung-focus-row"><h3 className="bn-stack"><span className="bn-en">Lungs</span><small className="bn-zh">肺</small></h3><Button variant="ghost" className="lung-focus-back bn-stack" onClick={exitLungView} aria-label="返回"><span className="bn-en">Back</span><small className="bn-zh">返回</small></Button></div>
   <div className="lung-focus-sides" role="group" aria-label="左右肺">{([['both','Both','雙側'],['left','Left','左肺'],['right','Right','右肺']] as ['both'|Side,string,string][]).map(([id,en,label])=><Button key={id} variant="ghost" aria-pressed={lungSide===id} onClick={()=>applySide(id)}><span className="bn-stack"><span className="bn-en">{en}</span><small className="bn-zh">{label}</small></span></Button>)}</div>
   <div className="lung-focus-row"><span className="bn-stack"><span className="bn-en">Layer {lungLayer} / 2</span><small className="bn-zh">{lungLayer===1?'第 1 層：肺葉、氣管、主支氣管、肺門':'第 2 層：胸膜（半透明）'}</small></span><span className="layer-buttons"><Button variant="ghost" aria-label="減少一層（隱藏胸膜）" disabled={lungLayer<=1} onClick={()=>setState(v=>setSerousGroup(v,PLEURA_KEYS,false))}>－</Button><Button variant="ghost" aria-label="增加一層（顯示胸膜）" disabled={lungLayer>=2} onClick={()=>setState(v=>setSerousGroup(v,PLEURA_KEYS,true))}>＋</Button></span></div>
   <label className="lung-focus-row"><span className="bn-stack"><span className="bn-en">Lung opacity</span><small className="bn-zh">肺透明度（預設不透明）</small></span><input type="range" className="organ-range" min={10} max={100} step={5} value={Math.round((state.lungOpacity??1)*100)} onChange={e=>{const value=Number(e.target.value)/100;setState(v=>({...v,lungOpacity:value}));if(value<1&&!lungInner.touched&&!(lungInner.bronchi&&lungInner.vessels)){const next={...lungInner,bronchi:true,vessels:true};setLungInner(next);setState(v=>({...v,lungOpacity:value,...lungParts(lungSide,next)}));}}} aria-label="肺透明度"/></label>
   <label className="lung-focus-row"><span className="bn-stack"><span className="bn-en">Bronchial tree</span><small className="bn-zh">支氣管樹（肺內分支）</small></span><Switch checked={lungInner.bronchi} onCheckedChange={on=>setLungInnerParts({...lungInner,bronchi:!!on,touched:true})} aria-label="顯示支氣管樹"/></label>
   <label className="lung-focus-row"><span className="bn-stack"><span className="bn-en">Pulmonary vessels</span><small className="bn-zh">肺血管（肺動脈、肺靜脈）</small></span><Switch checked={lungInner.vessels} onCheckedChange={on=>setLungInnerParts({...lungInner,vessels:!!on,touched:true})} aria-label="顯示肺血管"/></label>
   <label className="lung-focus-row"><span className="bn-stack"><span className="bn-en">Name labels</span><small className="bn-zh">名稱標籤（從內側面看一側肺）</small></span><Switch checked={lungLabels} onCheckedChange={on=>{const side=lungSide==='both'?'right':lungSide;setLungSide(side);setLungLabels(on);setDetails(false);aimLungView(side,false,lungInner,on);}} aria-label="名稱標籤"/></label>
   {lungLabels&&lungSide!=='both'&&<div className="lung-legend" role="group" aria-label="分類色彩圖例">
    <label className="lung-focus-row"><span className="bn-stack"><span className="bn-en">Colour by category</span><small className="bn-zh">分類上色</small></span><Switch className="lung-legend-master" checked={lungTintOn} onCheckedChange={setLungTintOn} aria-label="分類上色"/></label>
    <div className="lung-legend-list">{LUNG_CATEGORIES.map(c=>{const on=lungCatsOn[c.key]!==false;return <button type="button" key={c.key} data-cat={c.key} className="lung-legend-item" aria-pressed={on} disabled={!lungTintOn} title={c.hint} style={{'--cat':c.light,'--cat-dark':c.dark} as React.CSSProperties} onClick={()=>setLungCatsOn(v=>({...v,[c.key]:!on}))}><i className="lung-cat-letter" aria-hidden="true">{c.letter}</i><span className="bn-stack"><span className="bn-en">{c.en}</span><small className="bn-zh">{c.zh}</small></span></button>;})}</div>
   </div>}
   <small className="lung-focus-help"><span>Only the respiratory system and the see-through rib cage are shown; the pleura is off until you press ＋. Lowering the lung opacity switches on the bronchial tree and pulmonary vessels.</span><span>只顯示呼吸系統與胸廓骨骼（半透明）；胸膜預設關閉，按「＋」加開。降低肺透明度會自動打開支氣管樹與肺血管，才看得到肺內構造。</span></small>
  </aside>}
  {panel==='search'&&<SearchPanel index={searchIndex} onChoose={chooseStable} onClose={closePanel}/>}
  <aside id="motion-workspace" className={`right-workspace ${mobileMotionOpen?'mobile-motion-open':''}`} aria-label="模型檢視與關節動作">
   <Button variant="ghost" className="mobile-only motion-close" onClick={()=>setMobileMotionOpen(false)} aria-label="關閉動作面板">收起動作 <X size={18}/></Button>
   <nav className="right-tool-rail glass" aria-label="模型檢視工具">{([['view','體位'],['dissection','分層解剖'],['depth','組織深度']] as const).map(([id,label])=><Button variant="ghost" key={id} aria-expanded={rightTool===id} aria-controls={`tool-${id}`} onClick={()=>setRightTool(v=>v===id?null:id)}>{label}</Button>)}</nav>
   {rightTool==='dissection'&&<section id="tool-dissection" className="right-tool-panel glass" aria-label="分層解剖">
    <div className="mj-region-title"><strong>Dissection｜分層解剖</strong><span>逐層剝除解剖構造</span></div>
    {(topRegion==='upper'||topRegion==='lower')&&<div className="mj-motion-sides dissection-sides" role="group" aria-label="Side｜側別">{sideButtons}</div>}
    {topRegion==='upper'?<div className="mj-region-tabs">{ANATOMY_REGIONS.filter(r=>r.id!=='whole-body').map(r=><Button variant="ghost" key={r.id} className={region===r.id?'active':''} aria-pressed={region===r.id} onClick={()=>changeRegion(r.id)}>{r.name}</Button>)}</div>:topRegion==='head'?<p>頭面部肌肉可按解剖深度逐層剝離；每塊肌肉仍可單獨 Hide 或 Isolate。</p>:topRegion==='lower'?<p>下肢可在下方的「肌肉分層」選擇區域（臀部、大腿前／內側／後、小腿、足部），逐層剝離。</p>:<p>選擇上肢或下肢後，可逐區進行分層解剖。其他區域可用「組織深度」篩選。</p>}
    <div className="muscle-layer-filter"><strong>Muscle layers｜肌肉分層</strong><select className="muscle-region-select" aria-label="分層區域" value={state.muscleRegion??''} onChange={e=>setMuscleRegion(e.target.value||undefined)}><option value="">Select region｜選擇區域…</option>{(topRegion==='whole'||topRegion==='organs'?[...new Set(layerChoices.map(r=>LAYER_GROUP_OF[r.id]?.en))]:[undefined]).map(g=>g?<optgroup key={g} label={`${g}｜${layerChoices.find(r=>LAYER_GROUP_OF[r.id]?.en===g)&&LAYER_GROUP_OF[layerChoices.find(r=>LAYER_GROUP_OF[r.id]?.en===g)!.id].zh}`}>{layerChoices.filter(r=>LAYER_GROUP_OF[r.id]?.en===g).map(r=><option key={r.id} value={r.id}>{layerRegionLabel(r)}</option>)}</optgroup>:layerChoices.map(r=><option key={r.id} value={r.id}>{layerRegionLabel(r)}</option>))}</select>{state.muscleRegion&&<div className="depth-filter-buttons"><Button variant="ghost" aria-pressed={!state.muscleLayer||state.muscleLayer==='all'} onClick={()=>setMuscleLayer('all')}>All｜全部</Button>{layerOrders(state.muscleRegion).map(o=><Button variant="ghost" key={o} aria-pressed={state.muscleLayer===o} onClick={()=>setMuscleLayer(o)}>Peel to layer {o}｜剝至第{o}層</Button>)}</div>}{state.muscleRegion&&(()=>{const shown=state.muscleLayer&&state.muscleLayer!=='all'?[state.muscleLayer]:layerOrders(state.muscleRegion);return <details className="muscle-layer-members" open>{<summary>{layerRegionLabel(MUSCLE_LAYER_REGIONS.find(r=>r.id===state.muscleRegion)!)}</summary>}{shown.flatMap(o=>layerMembers(state.muscleRegion!,o).map((g,gi)=><div key={o+'-'+gi}><p><b>Layer {o}｜第{o}層</b> <Button variant="ghost" className="layer-group" aria-pressed={layerPicked===`group:${o}:${gi}`} onClick={()=>pickLayerMuscles(`group:${o}:${gi}`,g.muscles.map(m=>m.en),g.order)}>{layerGroupLabel(g.label)}</Button></p>{g.muscles.map(m=><Button key={m.en} variant="ghost" className="bn-row layer-muscle" aria-pressed={layerPicked===m.en} onClick={()=>pickLayerMuscles(m.en,[m.en],g.order)}><span className="bn-en">{m.en}</span><small className="bn-zh">{m.zh}</small></Button>)}{g.note&&<small>{g.note}</small>}</div>))}</details>;})()}</div>
    <div className="muscle-layer-filter space-filter"><strong>Spaces｜特殊區域</strong>{(()=>{const list=spacesForGroups(spaceGroups);return list.length?<><div className="space-list">{list.map(d=><Button key={d.id} variant="ghost" className="space-pick" aria-pressed={spaceId===d.id} onClick={()=>pickSpace(d)}>{d.en}｜{d.zh}</Button>)}</div>{spaceItems?<div className="space-detail"><p className="space-hint">The space is drawn as an outline: each coloured line is the margin of a boundary structure that forms one side, the pale fill is the opening; contents pass through it.｜以輪廓顯示空間形狀：每條彩色線是構成一邊的邊界結構的邊緣，淡色填色為開口，內容物從中穿過。</p><div><b>Boundaries｜邊界</b>{spaceItems.boundaries.map(b=><Button key={b.item.en} variant="ghost" className="bn-row layer-muscle" disabled={!b.ids.length&&!b.nerves.length} aria-pressed={spaceItem===b.item.en} onClick={()=>pickSpaceItem(b.item.en,b)}><span className="bn-en">{edgeColorOf(spaceItems.def,b.item.en)&&<i className="edge-dot" style={{background:edgeColorOf(spaceItems.def,b.item.en)}}/>}{b.item.en}</span><small className="bn-zh">{b.item.zh}</small>{b.item.role&&<small className="bn-role">{b.item.role}</small>}</Button>)}</div><div><b>Contents｜內容物</b>{spaceItems.contents.map(b=><Button key={b.item.en} variant="ghost" className="bn-row layer-muscle" disabled={!b.ids.length&&!b.nerves.length} aria-pressed={spaceItem===b.item.en} onClick={()=>pickSpaceItem(b.item.en,b)}><span className="bn-en">{b.item.en}</span><small className="bn-zh">{b.item.zh}</small>{b.item.role&&<small className="bn-role">{b.item.role}</small>}</Button>)}</div>{spaceItems.def.related?.length?<div><b>Related spaces｜相關區域</b><div className="space-list">{spaceItems.def.related.map(id=>{const r=SPACES.find(x=>x.id===id);return r?<Button key={id} variant="ghost" className="space-pick" onClick={()=>pickSpace(r)}>{r.en}｜{r.zh}</Button>:null;})}</div></div>:null}{spaceItems.def.missing?.length?<div className="space-missing"><b>Not in the model｜模型沒有</b>{spaceItems.def.missing.map(t=><small key={t}>{t}</small>)}</div>:null}</div>:<small>Pick a space to see what bounds it and what passes through it.｜選一個區域，查看它的邊界與通過的結構。</small>}</>:<small>No listed spaces for this part.｜此部位沒有列出的特殊區域。</small>;})()}</div>
    {topRegion==='head'&&<div className="muscle-layer-filter"><strong>頭面肌肉五層</strong><div className="depth-filter-buttons"><Button variant="ghost" aria-pressed={!state.faceMuscleLayer||state.faceMuscleLayer==='all'} onClick={()=>setFaceMuscleLayer('all')}>全部</Button>{FACIAL_MUSCLE_LAYERS.map(layer=><Button variant="ghost" key={layer.id} title={layer.depth} aria-pressed={state.faceMuscleLayer===layer.id} onClick={()=>setFaceMuscleLayer(layer.id)}>{layer.label}</Button>)}</div>{state.faceMuscleLayer&&state.faceMuscleLayer!=='all'&&<details className="muscle-layer-members" open><summary>{FACIAL_MUSCLE_LAYERS.find(x=>x.id===state.faceMuscleLayer)?.depth}</summary>{FACIAL_MUSCLE_LAYERS.find(x=>x.id===state.faceMuscleLayer)?.muscles.map(name=><p key={name}>{name}</p>)}</details>}<small>由深至淺的教學式分層；不同面區的筋膜與肌肉重疊並非完全平行。</small></div>}
    {region!=='whole-body'&&<div className="mj-dissection-control"><div><span className="eyebrow">{currentRegion.subtitle}</span><strong>{currentRegion.stages[dissectionStage]?.label}</strong><small>{currentRegion.stages[dissectionStage]?.description}</small></div><div className="mj-dissection-side"><Button variant="ghost" className={studySide==='both'?'active':''} onClick={()=>focusSide('both')}>Both</Button><Button variant="ghost" className={studySide==='left'?'active':''} onClick={()=>focusSide('left')}>Left focus</Button><Button variant="ghost" className={studySide==='right'?'active':''} onClick={()=>focusSide('right')}>Right focus</Button></div><div className="mj-dissection-actions"><Button variant="ghost" disabled={dissectionStage===0} onClick={()=>dissect(dissectionStage-1)}>Layer back｜上一層</Button><Button variant="ghost" disabled={dissectionStage>=currentRegion.stages.length-1} onClick={()=>dissect(dissectionStage+1)}>Dissect deeper｜向深層</Button></div></div>}
   </section>}
   {rightTool==='depth'&&<section id="tool-depth" className="right-tool-panel glass" aria-label="組織深度"><strong>組織深度</strong><div className="depth-filter-buttons">{([['all','全部'],['superficial','淺層'],['intermediate','中層'],['deep','深層']] as [TissueDepth,string][]).map(([depth,label])=><Button variant="ghost" key={depth} aria-pressed={state.depthFilter===depth} onClick={()=>setDepth(depth)}>{label}</Button>)}</div></section>}
   {rightTool==='view'&&<nav id="tool-view" className="right-tool-panel view-controls glass" aria-label="Camera controls">{(['three-quarter','front','side','back'] as View[]).map((v,i)=><Button variant="ghost" key={v} className={state.view===v?'active':''} aria-pressed={state.view===v} disabled={state.explode>.8&&v!=='front'} onClick={()=>setState(s=>({...s,view:v,reset:s.reset+1,rotate:false}))} title={`${v} view`} aria-label={`${v} view`}><span>{['¾','正面','側面','背面'][i]}</span></Button>)}<i/><Button variant="ghost" disabled={state.explode>=.4} aria-label={state.rotate?'Pause rotation':'Rotate body'} title="Auto rotate" className={state.rotate?'active':''} onClick={()=>setState(s=>({...s,rotate:!s.rotate}))}>{state.rotate?<Pause size={17}/>:<RotateCw size={18}/>}</Button><Button variant="ghost" aria-label="Reset view and layers" title="Reset" onClick={reset}><RotateCcw size={17}/></Button></nav>}
   <details className="joint-workspace glass" open={mobileMotionOpen||undefined}><summary><span>關節系統與動作</span><label className="motion-enable-toggle" onClick={e=>e.stopPropagation()}><input type="checkbox" checked={motionEnabled} onChange={e=>{stopMotionAnimation();motionTargetRef.current=motionPoseRef.current;setMotionEnabled(e.target.checked);}}/><span>{motionEnabled?'已啟用':'啟用活動'}</span></label></summary><div className="joint-workspace-content">
    {motionBlock&&<div className="motion-lock-note motion-limit-note" role="status">{motionBlock}</div>}
    {!motionEnabled&&<div className="motion-lock-note">關節已鎖定。勾選「啟用活動」後，才可以拖動模型或調整關節角度。</div>}
    <details className="joint-guide"><summary>關節類型</summary><div className="joint-guide-list">{JOINT_TYPES.map(j=><div className="joint-guide-row" key={j.id}><div><strong>{j.zh} · {j.en}</strong><span>{j.axis}</span></div><small>{j.upperLimbExamples}</small><p>{j.movements}</p></div>)}</div></details>
    <div className="joint-surface-row"><label className="joint-surface-toggle"><input type="checkbox" checked={state.jointSurfaces!==false} onChange={e=>setState(s=>({...s,jointSurfaces:e.target.checked,visible:e.target.checked&&!s.visible.includes('connective')?[...s.visible,'connective']:s.visible}))}/>關節軟骨面</label><button type="button" className="joint-info-button" aria-expanded={jointInfoOpen} aria-controls="joint-info" aria-label="關節軟骨面說明" title="說明" onClick={()=>setJointInfoOpen(v=>!v)}><Info size={14}/></button></div>{jointInfoOpen&&<small id="joint-info" className="joint-surface-note" role="note">藍綠色為軟骨面、盂唇與關節盤，淡色半透明為關節囊；軟骨面依來源標記配準，厚度非實測。</small>}
    <div className="mj-motion-sides motion-region-picker" role="group" aria-label="動作區域"><Button variant="ghost" aria-pressed={state.bodyMotion?.region==='head'} onClick={()=>changeBody('head',{...BODY_NEUTRAL},true)}>頭頸</Button><Button variant="ghost" aria-pressed={!state.bodyMotion&&topRegion==='upper'} onClick={enterUpperMotion}>上肢</Button><Button variant="ghost" aria-pressed={state.bodyMotion?.region==='spine'} onClick={()=>changeBody('spine',{...BODY_NEUTRAL},true)}>軀幹</Button><Button variant="ghost" aria-pressed={topRegion==='lower'} onClick={enterLowerMotion}>下肢</Button></div>
    {state.bodyMotion?<BodyControls region={state.bodyMotion.region} pose={state.bodyMotion.pose} onChange={changeBody} onBoth={()=>applySide('both')} onInspect={inspectMotionStructure} disabled={!motionEnabled}/>:topRegion==='lower'?<BodyControls region={studySide==='left'?'leftLeg':'rightLeg'} pose={BODY_NEUTRAL} onChange={changeBody} onBoth={()=>applySide('both')} onInspect={inspectMotionStructure} disabled={!motionEnabled}/>:topRegion==='head'?<BodyControls region="head" pose={BODY_NEUTRAL} onChange={changeBody} onInspect={inspectMotionStructure} disabled={!motionEnabled}/>:topRegion==='whole'?<small className="mj-motion-note">請在上方選擇動作區域：頭頸、上肢、軀幹或下肢。</small>:<section className="mj-motion-lab glass" aria-label="Upper limb motion lab">
    <div className="mj-motion-head"><div><strong>{studySide==='both'?'雙側上肢':studySide==='right'?'右上肢':'左上肢'}</strong></div><Button variant="ghost" disabled={!motionEnabled} onClick={neutralMotion}>復位</Button></div>
    <div className="mj-motion-sides"><Button variant="ghost" disabled={!motionEnabled} aria-pressed={studySide==='both'} onClick={enterUpperMotion}>Both｜雙側</Button><Button variant="ghost" disabled={!motionEnabled} aria-pressed={studySide==='left'} onClick={()=>activateMotionSide('left')}>Left｜左側</Button><Button variant="ghost" disabled={!motionEnabled} aria-pressed={studySide==='right'} onClick={()=>activateMotionSide('right')}>Right｜右側</Button></div>

    <div className="motion-control-stack">
     {UPPER_MOTION_CONTROLS.map(control=><MotionPullControl key={control.key} label={control.label} value={motionPose[control.key]} min={MOTION_LIMITS[control.key][0]} max={MOTION_LIMITS[control.key][1]} disabled={!motionEnabled} onValueChange={value=>{setMotionAction(control.action);setJoint(control.key,value);}}/>)}
    </div>
    <details className="mj-finger-lab"><summary>手指｜Fingers</summary>
     <div className="mj-hand-presets" role="group" aria-label="Hand gestures｜手勢預設">{HAND_PRESETS.map(h=><Button key={h.id} variant="ghost" disabled={!motionEnabled} onClick={()=>{setMotionAction('wristExtension');const current=motionTargetRef.current,same=(g:Partial<MotionPose>)=>DIGIT_KEYS.every(k=>Math.abs(current[k]-(g[k]??0))<1);playGesture(h.id==='open'&&same(h.pose)?{}:h.pose);}}><span className="mj-bi"><b>{h.en}</b><small>{h.label}</small></span></Button>)}</div>
     <div className="mj-hand-speed" role="group" aria-label="Gesture speed｜手勢速度">{([['Slow','慢',1200],['Medium','中',500],['Fast','快',250]] as const).map(([en,name,ms])=><Button key={name} variant="ghost" aria-pressed={gestureMs===ms} onClick={()=>setGestureMs(ms)}><span className="mj-bi"><b>{en}</b><small>{name}</small></span></Button>)}</div>
    </details>
    <small className="mj-motion-note">0° 為人體放鬆中立位；正負角度代表相反方向。所有角度都可以直接拖動，毋須先選動作。</small>
    <MotionAnatomyPanel anatomy={UPPER_ACTION_ANATOMY[motionAction]} onInspect={inspectMotionStructure}/>
   </section>}
   </div></details>
  </aside>
  <Button variant="ghost" className="mobile-only mobile-system-trigger glass" onClick={()=>{setMobileMotionOpen(false);openPanel('layers');}} aria-label="開啟系統面板"><Layers3 size={18}/> Systems｜系統</Button>
  {!microAtlas&&<Button variant="ghost" className="mobile-only mobile-motion-trigger glass" aria-expanded={mobileMotionOpen} aria-controls="motion-workspace" onClick={()=>{setMobileMotionOpen(v=>!v);setPanel(null);setDetails(false);}}>動作 <Activity size={18}/></Button>}
  {!microAtlas&&!error&&<LoadBar progress={progress} failed={loadStatus?.failed??[]} unavailable={atlas?.unavailable??[]} busy={!!loadStatus?.busy} onRetry={()=>setRetryNonce(n=>n+1)}/>}
  {!microAtlas&&error&&<div className="loading glass error" role="alert"><p>{error}</p><Button variant="ghost" onClick={()=>location.reload()}>重新載入檢視器</Button></div>}
  {!microAtlas&&!error&&notice&&<div className="loading glass notice background-loading" role="status"><p>{notice}</p><Button variant="ghost" size="sm" onClick={()=>setNotice('')} aria-label="關閉提示"><X size={14}/></Button></div>}
  <Sheet open={!microAtlas&&details&&(selectedParts.length>0||!!externalNerve)} modal={false} disablePointerDismissal onOpenChange={open=>{setDetails(open);if(!open)setExternalNerve(null);}}><SheetContent initialFocus={detailTitle} className={`detail-sheet glass ${state.isolate?'is-isolated':''}`} showCloseButton={true}><div className="detail-header"><div className="detail-accent" style={{background:system?.color}}/><div className="eyebrow">{profile?.category??system?.name??'ANATOMY'}</div><SheetTitle ref={detailTitle} tabIndex={-1} className="structure-title">{profile?.english??chosen?.name??externalNerve}{profile?.chinese&&<span className="structure-title-zh">{profile.chinese}</span>}</SheetTitle><PronounceButton name={profile?.english??chosen?.name??externalNerve??''}/></div><div className="detail-scroll" key={`${externalNerve??chosen?.id}-${state.isolate}`}>{profile?.facts&&profile.facts.length>0&&<div className="bilingual-facts">{profile.facts.map((fact,i)=><div className="bilingual-fact" key={`${fact.labelEn}-${i}`}><div className="fact-label">{fact.labelEn}<span>{fact.labelZh}</span></div><div className="fact-value">{fact.valueEn}{fact.valueZh&&<span>{fact.valueZh}</span>}</div></div>)}</div>}<div className="structure-meta compact-meta"><span>Selected pieces｜選取件數<strong>{externalNerve?'1':state.selected.length.toLocaleString()}</strong></span>{selected&&!/^(?:Impression|Part of lobe|Lung structure|Lobe of lung)｜/.test(profile?.category??'')&&<span>Anatomical depth｜解剖深度<strong>{anatomyDepth(selected)}</strong></span>}</div>{!externalNerve&&selectedParts.length>1&&<div className="member-list"><h3>Included structures｜包含的構造</h3>{selectedParts.slice(0,50).map(p=>{const mp=structureProfile(p.name,p.system,p);return <Button variant="ghost" key={p.id} onClick={()=>choosePart(p.id)}><span>{mp.english}{mp.chinese&&<small>{mp.chinese}</small>}</span><ChevronRight size={14}/></Button>})}{selectedParts.length>50&&<p>And {selectedParts.length-50} more modeled pieces.</p>}</div>}</div>{atlasReference&&<div className="detail-reference-bar"><span>FMA ID <strong>{atlasReference}</strong></span><a href="https://lifesciencedb.jp/bp3d/" target="_blank" rel="noreferrer">BodyParts3D database <ArrowUpRight size={12}/></a></div>}<div className="detail-actions">{!externalNerve&&<><Button className="primary-action" title="Focus / 放大" onClick={()=>setState(s=>({...s,cameraFocusParts:s.selected,cameraFocusNonce:(s.cameraFocusNonce??0)+1,cameraFocusScale:.92,isolate:true,explode:0,rotate:false}))}><Focus size={15}/><span>Focus<small>放大</small></span></Button><Button className={`primary-action ${state.isolate?'active':''}`} title={state.isolate?'Show surrounding anatomy':'Isolate structure'} onClick={()=>setState(s=>({...s,isolate:!s.isolate,explode:0}))}><span>{state.isolate?'Unisolate':'Isolate'}<small>{state.isolate?'顯示周圍':'單獨顯示'}</small></span></Button><Button variant="ghost" className="hide-structure-action" title="Hide structure｜隱藏此構造" onClick={hideSelected}><EyeOff size={15}/><span>Hide<small>隱藏</small></span></Button></>}{externalNerve&&<><Button className="primary-action" title="Focus / 放大" onClick={()=>setState(s=>({...s,cameraFocusNerve:externalNerve,cameraFocusParts:undefined,cameraFocusNonce:(s.cameraFocusNonce??0)+1,cameraFocusScale:.92,isolate:true,explode:0,rotate:false}))}><Focus size={15}/><span>Focus<small>放大</small></span></Button><Button className={`primary-action ${state.isolate?'active':''}`} title={state.isolate?'Show surrounding anatomy':'Isolate structure'} onClick={()=>setState(s=>({...s,isolate:!s.isolate,explode:0}))}><span>{state.isolate?'Unisolate':'Isolate'}<small>{state.isolate?'顯示周圍':'單獨顯示'}</small></span></Button><Button variant="ghost" className="hide-structure-action" title="Hide structure｜隱藏此構造" onClick={hideNerve}><EyeOff size={15}/><span>Hide<small>隱藏</small></span></Button></>}<Button variant="ghost" className="secondary-action" title="Clear selection" onClick={()=>{setState(s=>({...s,selected:[],isolate:false}));setExternalNerve(null);setDetails(false);}}><span>Clear<small>清除</small></span></Button></div></SheetContent></Sheet>
  <Sheet open={about} onOpenChange={setAbout}><SheetContent className="about-sheet glass"><div className="eyebrow">SOURCE & SCOPE</div><SheetTitle className="structure-title">A body, revealed.</SheetTitle><SheetDescription>Explore the adult male reference anatomy from BodyParts3D.</SheetDescription><div className="about-copy"><p><strong>Male · BodyParts3D</strong><br/>2,234 individual meshes and 3,432 named concepts from an adult male reference anatomy.</p><p>This reference does not contain every human structure or variation. Named concepts can contain multiple pieces; each source mesh is rendered once.</p><p>Colors and system groupings are designed for exploration. The geometry is simplified for the web, and short explanations provide general educational context. This is an anatomical reference, not a diagnostic or surgical tool.</p><p><strong>肌肉分層</strong><br/>{MUSCLE_LAYER_SOURCE}</p><h3>Source</h3><p><strong>英文發音</strong><br/>音標取自英文維基詞典（Wiktionary，CC BY-SA 4.0）；真人錄音取自維基共享資源（Wikimedia Commons），每一段的作者與授權顯示在該名稱的「音標／查字典」裡；沒有錄音的字由瀏覽器語音朗讀，標示為「發音待校對」。不使用也不複製牛津、劍橋或韋氏字典的內容，「查字典」只是連結。</p><p>BodyParts3D, © The Database Center for Life Science. The main whole-body atlas is used under CC Attribution 4.0 International.</p><p><strong>Facial muscle supplement</strong><br/>47 registered facial and masticatory muscle meshes originate from the official BodyParts3D 3.0 95% polygon-reduction archive and remain licensed under CC BY-SA 2.1 Japan. They were similarity-registered to the newer head coordinate frame for educational visualization.</p><p><strong>Joint and cervical vessel supplement</strong><br/>Z-Anatomy — The open source atlas of anatomy — CC BY-SA 4.0. Derived from BodyParts3D — The Database Center for Life Science — CC BY-SA 2.1 Japan. Source cartilage material labels are transferred to the atlas bones; joint tissue positions are registered and animated for illustration, not measured cartilage thickness or physiological constraints. Eight cervical artery and vein meshes are registered to the atlas and share one motion field to preserve branch continuity. Adapted mesh data remains CC BY-SA 4.0.</p><a href="https://github.com/nqwrc/3d-anatomy" target="_blank" rel="noreferrer">Joint model source</a><h3>Detail atlases</h3><p><strong>Brain</strong><br/>Brain Project neuroanatomy assets derived from open anatomical sources. Distributed under CC BY-SA 4.0.</p><p><strong>Eye</strong><br/>Human Reference Atlas ocular geometry via Ocularium. CC BY 4.0.</p><p><strong>Inner ear</strong><br/>IE-Map human inner-ear atlas and surface meshes. CC BY 4.0.</p><a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html" target="_blank" rel="noreferrer">Dataset license <ArrowUpRight size={14}/></a><a href="https://creativecommons.org/licenses/by-sa/2.1/jp/" target="_blank" rel="noreferrer">Facial supplement license <ArrowUpRight size={14}/></a><a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html" target="_blank" rel="noreferrer">Original geometry & metadata <ArrowUpRight size={14}/></a><a href="https://academic.oup.com/nar/article/37/suppl_1/D782/1000752" target="_blank" rel="noreferrer">Read the source publication <ArrowUpRight size={14}/></a></div></SheetContent></Sheet>
 </main>;
}
