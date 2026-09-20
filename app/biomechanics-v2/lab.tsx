import {useEffect,useMemo,useState} from 'react';
import {Quaternion,Vector3} from 'three';
import {Button} from '@/components/ui/button';
import {Slider} from '@/components/ui/slider';
import AnatomyScene from '../scene';
import type {Atlas,SceneState,View} from '../anatomy';
import {normalizeAtlasSystems} from '../mj-system-classifier';
import {createSkeletonRig,evaluateSkeleton,type NodeId,type Side} from './skeleton';
import './lab.css';
const labels:Record<NodeId,string>={thorax:'Thorax｜胸廓',clavicle:'Clavicle｜鎖骨',scapula:'Scapula｜肩胛骨',humerus:'Humerus｜肱骨',ulna:'Ulna｜尺骨',radius:'Radius｜橈骨',carpus:'Carpus｜腕骨',hand:'Hand｜掌骨與指骨'};
export default function SkeletonLab(){
 const [atlas,setAtlas]=useState<Atlas|null>(null),[error,setError]=useState(''),[progress,setProgress]=useState(0);
 const [side,setSide]=useState<Side>('right'),[node,setNode]=useState<NodeId>('humerus'),[angle,setAngle]=useState(0),[axis,setAxis]=useState(2);
 const [selected,setSelected]=useState<string[]>([]),[hidden,setHidden]=useState<string[]>([]),[isolate,setIsolate]=useState(false),[view,setView]=useState<View>('front'),[reset,setReset]=useState(0),[whole,setWhole]=useState(false);
 useEffect(()=>{const abort=new AbortController();fetch(`${import.meta.env.BASE_URL}models/atlas.json`,{signal:abort.signal}).then(r=>{if(!r.ok)throw new Error('Cannot load anatomy catalogue.');return r.json();}).then(a=>setAtlas(normalizeAtlasSystems(a as Atlas))).catch(e=>{if(e.name!=='AbortError')setError(e.message);});return()=>abort.abort();},[]);
 const rig=useMemo(()=>atlas?createSkeletonRig(atlas,side):null,[atlas,side]);
 const result=useMemo(()=>rig?evaluateSkeleton(rig,{[node]:new Quaternion().setFromAxisAngle(new Vector3().setComponent(axis,1),angle*Math.PI/180)}):null,[rig,node,axis,angle]);
 const ids=useMemo(()=>rig?.nodes.flatMap(n=>n.partIds)??[],[rig]);
 const part=atlas?.parts.find(p=>p.id===selected[0]);
 const state:SceneState={visible:['skeletal'],selected,hiddenParts:hidden,isolate,view,rotate:false,reset,explode:0,depthFilter:'all',partTransforms:result?.transforms,focusParts:whole?undefined:ids,cameraFocusParts:whole?undefined:ids,cameraFocusNonce:reset};
 const neutral=()=>{setAngle(0);setSelected([]);setHidden([]);setIsolate(false);setReset(v=>v+1);};
 return <main className="rig-lab">
  {atlas&&<AnatomyScene atlas={atlas} state={state} onSelect={id=>setSelected([id])} onProgress={setProgress} onError={setError} region="whole-body" focusSide="both" motionActive={false}/>}
  <header className="rig-heading"><span>MJ ANATOMY / EXPERIMENTAL</span><h1>Upper-limb skeleton<span>上肢骨骼架構</span></h1><p>Phase 1 · {ids.length} bones · {side==='right'?'右側':'左側'}</p><a href="?">← Return to full atlas｜返回完整圖譜</a></header>
  <aside className="rig-panel" aria-label="Skeletal hierarchy controls">
   <div className="rig-tabs">{(['right','left'] as Side[]).map(s=><Button key={s} variant="ghost" aria-pressed={side===s} onClick={()=>{setSide(s);neutral();}}>{s==='right'?'Right｜右':'Left｜左'}</Button>)}</div>
   <h2>Bone hierarchy｜骨骼層級</h2>
   <div className="rig-tree">{rig?.nodes.map((n,i)=><Button variant="ghost" key={n.id} aria-pressed={node===n.id} onClick={()=>{setNode(n.id);setAngle(0);}} style={{marginLeft:Math.min(i,4)*8}}><span>{labels[n.id]}</span><small>{n.partIds.length||'root'}</small></Button>)}</div>
   <p className="rig-description">{node==='thorax'?'Root frame｜根座標':`Parent: ${labels[rig?.nodes.find(n=>n.id===node)?.parent??'thorax']}`}</p>
   <h2>Inheritance test｜連動測試</h2>
   <p className="rig-description">小角度測試子骨骼跟隨關係。旋轉中心暫由模型邊界估算，並非已校準嘅生理關節動作。</p>
   <div className="rig-tabs">{['X','Y','Z'].map((a,i)=><Button key={a} variant="ghost" aria-pressed={axis===i} onClick={()=>{setAxis(i);setAngle(0);}}>{a} axis</Button>)}</div>
   <label className="rig-angle"><span>Local rotation｜局部旋轉 <b>{angle}°</b></span><Slider aria-label="Test local rotation" min={-15} max={15} step={1} value={[angle]} disabled={!rig?.valid} onValueChange={v=>setAngle(Array.isArray(v)?v[0]:v)}/></label>
   <Button variant="outline" onClick={neutral}>Reset to bind pose｜還原</Button>
   <p className="rig-description">本階段只測骨骼；肩胛節律、旋前旋後、肌肉、神經及血管連動尚未接入。</p>
  </aside>
  <div className="rig-toolbar"><Button variant="outline" aria-pressed={whole} onClick={()=>{setWhole(v=>!v);setIsolate(false);setReset(v=>v+1);}}> {whole?'Focus arm｜上肢':'Whole skeleton｜全身'} </Button>{(['front','side','back'] as View[]).map(v=><Button key={v} variant="outline" aria-pressed={view===v} onClick={()=>{setView(v);setReset(n=>n+1);}}>{v}</Button>)}</div>
  {part&&<section className="rig-inspector" aria-label="Selected bone"><strong>{part.name}</strong><small>{part.id}</small><div><Button variant="outline" onClick={()=>{setHidden(h=>[...new Set([...h,part.id])]);setSelected([]);setIsolate(false);}}>Hide｜隱藏</Button><Button variant="outline" aria-pressed={isolate} onClick={()=>setIsolate(v=>!v)}>Isolate｜單獨顯示</Button><Button variant="ghost" onClick={()=>{setSelected([]);setIsolate(false);}}>Close</Button></div></section>}
  {hidden.length>0&&<Button className="rig-restore" variant="outline" onClick={()=>setHidden([])}>Restore {hidden.length} hidden｜還原隱藏</Button>}
  {(error||rig?.warnings.length)?<div className="rig-status" role="alert">{error||rig?.warnings.join(' ')}</div>:progress<100?<div className="rig-status" role="status">Loading anatomy｜載入模型 {progress}%</div>:null}
 </main>;
}
