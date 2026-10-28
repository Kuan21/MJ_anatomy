import type {Part} from './anatomy';
import layerDoc from '../docs/muscle-layers.json';

/**
 * Dissection layers come from docs/muscle-layers.json (the user's own
 * 跑考 summary). order 1 = most superficial. "Peeling to layer N" hides the
 * muscles of that region whose order is smaller than N, so the deeper ones
 * show; muscles outside the chosen region are never touched.
 */
export type MuscleLayer='all'|number;
export interface LayerMuscle{en:string;zh:string;note?:string}
export interface LayerGroup{order:number;label:string;muscles:LayerMuscle[];note?:string}
export interface LayerRegion{id:string;zh:string;en:string;layers:LayerGroup[]}
export const MUSCLE_LAYER_REGIONS=layerDoc.regions as LayerRegion[];
export const MUSCLE_LAYER_SOURCE=layerDoc.source as string;

const esc=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const SIDE='(?:left |right )?';

/** Part-name patterns for one entry of the layer file (lower-case names, either side). */
export function __patternsFor(en:string,regionId=''):RegExp[]{return patternsFor(en,regionId);}
function patternsFor(en:string,regionId=''):RegExp[]{
 const e=en.toLowerCase();
 const limbSuffix=regionId==='hand'?'hand':regionId.startsWith('foot')?'foot':'';
 const head=e.match(/^(.+?) – (long|short|lateral|medial) head$/);
 if(head){const base=esc(head[1]);return[new RegExp(`${head[2]} head of ${SIDE}${base}\\b`)];}
 const limb=e.match(/^(.+?) \((hand|foot)\)$/);
 if(limb){
  const base=limb[1].replace(/s$/,'');
  return[new RegExp(`${esc(base)}.*\\b(?:of )?${SIDE}${limb[2]}\\b|${esc(base)}\\w* of ${SIDE}${limb[2]}`)];
 }
 const special:Record<string,RegExp>={
  'spinalis':/^(?:left |right )?spinalis/,
  'longissimus':/^(?:left |right )?longissimus/,
  'iliocostalis':/^(?:left |right )?iliocostalis/,
  'rotatores':/rotator/,
  'interspinales':/interspinal/,
  'intertransversarii':/intertransvers/,
  'multifidus':/multifid/,
  'lumbricals (hand)':/lumbrical.*hand/,
  'palmar interossei':/palmar interossei/,
  'dorsal interossei (hand)':/dorsal interossei.*hand/,
  'dorsal interossei (foot)':/dorsal interosse.*foot/,
  'plantar interossei':/plantar interosse/,
  'lumbricals (foot)':/lumbrical.*foot/,
  'tensor fasciae latae':/tensor fasciae latae/,
  'iliopsoas':/^(?:left |right )?(?:iliacus|psoas major)/,
  'trapezius':/trapezius/,
  'deltoid':/deltoid/,
  'quadratus plantae':/flexor accessorius|quadratus plantae/
 };
 if(special[e])return[special[e]];
 if(/^(?:superior|inferior) gemellus$/.test(e)){const w=e.split(' ')[0];return[new RegExp(`gemellus ${w}`)];}
 if(e==='obturator internus'||e==='obturator externus')return[new RegExp(`^(?:left |right )?${e}`)];
 const suffix=limbSuffix?`|^${esc(e)} of ${SIDE}${limbSuffix}$`:'';
 return[new RegExp(`^(?:(?:left|right) )?${esc(e)}(?: muscle)?$|^(?:\\w+ (?:part|head) of )${SIDE}${esc(e)}$${suffix}`)];
}

const NOT_MUSCLE=/artery|vein|nerve|ligament|tendon sheath|bursa|fascia\b(?! lata)/;
const compiled=new Map<string,{region:string;order:number;res:RegExp[]}[]>();
for(const r of MUSCLE_LAYER_REGIONS){
 const list:{region:string;order:number;res:RegExp[]}[]=[];
 for(const g of r.layers)for(const m of g.muscles)list.push({region:r.id,order:g.order,res:patternsFor(m.en,r.id)});
 compiled.set(r.id,list);
}

const cache=new Map<string,Map<string,number|undefined>>();
/** Layer order of a part inside a region, or undefined when the file does not list it there. */
export function muscleLayerOrder(part:Part,regionId:string):number|undefined{
 let byPart=cache.get(regionId);if(!byPart){byPart=new Map();cache.set(regionId,byPart);}
 if(byPart.has(part.id))return byPart.get(part.id);
 let found:number|undefined;
 const name=part.name.toLowerCase();
 if(!NOT_MUSCLE.test(name)||/tensor fasciae latae/.test(name)){
  for(const entry of compiled.get(regionId)??[])if(entry.res.some(re=>re.test(name))){found=found===undefined?entry.order:Math.min(found,entry.order);}
 }
 byPart.set(part.id,found);return found;
}

export function layerOrders(regionId:string):number[]{
 const r=MUSCLE_LAYER_REGIONS.find(x=>x.id===regionId);
 return r?[...new Set(r.layers.map(l=>l.order))].sort((a,b)=>a-b):[];
}
export function layerMembers(regionId:string,order:number):LayerGroup[]{
 return MUSCLE_LAYER_REGIONS.find(x=>x.id===regionId)?.layers.filter(l=>l.order===order)??[];
}

/** Peeling to layer N hides the region's layers above it (order < N). */
export function matchesMuscleLayer(part:Part,regionId:string|undefined,selected:MuscleLayer|undefined){
 if(!regionId||!selected||selected==='all')return true;
 const order=muscleLayerOrder(part,regionId);
 return order===undefined||order>=selected;
}

/** Atlas parts (either side) that one entry of the layer file stands for; used to highlight a muscle or a whole group picked from the layer list. */
export function partsForLayerMuscles(parts:Part[],regionId:string,names:string[]):Part[]{
 const res=names.flatMap(n=>patternsFor(n,regionId));
 return parts.filter(p=>{const name=p.name.toLowerCase();return(!NOT_MUSCLE.test(name)||/tensor fasciae latae/.test(name))&&res.some(re=>re.test(name));});
}

/** Which layer regions the part buttons of the dissection panel offer. `null` lists every region. */
export type LayerBody='whole'|'upper'|'lower'|'head'|'organs';
export const LAYER_REGIONS_BY_PART:Record<string,string[]>={
 shoulder:['scapular'],
 arm:['arm_anterior','arm_posterior'],
 forearm:['forearm_flexor','forearm_extensor'],
 hand:['hand'],
 upper:['scapular','arm_anterior','arm_posterior','forearm_flexor','forearm_extensor','hand'],
 lower:['gluteal','thigh_anterior','thigh_medial','thigh_posterior','leg_anterior','leg_lateral','leg_posterior','foot_dorsum','foot_sole'],
 head:['suboccipital'],
 back:['back_superficial','back_deep']
};
export function layerRegionsFor(body:LayerBody,part:string):string[]|null{
 if(body==='upper')return LAYER_REGIONS_BY_PART[part]??LAYER_REGIONS_BY_PART.upper;
 if(body==='lower')return LAYER_REGIONS_BY_PART.lower;
 if(body==='head')return LAYER_REGIONS_BY_PART.head;
 return null;
}
/** Group titles for the whole-body list. */
export const LAYER_GROUP_OF:Record<string,{en:string;zh:string}>={
 back_superficial:{en:'Back',zh:'背部'},back_deep:{en:'Back',zh:'背部'},suboccipital:{en:'Head and neck',zh:'頭頸'},
 scapular:{en:'Upper limb',zh:'上肢'},arm_anterior:{en:'Upper limb',zh:'上肢'},arm_posterior:{en:'Upper limb',zh:'上肢'},forearm_flexor:{en:'Upper limb',zh:'上肢'},forearm_extensor:{en:'Upper limb',zh:'上肢'},hand:{en:'Upper limb',zh:'上肢'},
 gluteal:{en:'Lower limb',zh:'下肢'},thigh_anterior:{en:'Lower limb',zh:'下肢'},thigh_medial:{en:'Lower limb',zh:'下肢'},thigh_posterior:{en:'Lower limb',zh:'下肢'},leg_anterior:{en:'Lower limb',zh:'下肢'},leg_lateral:{en:'Lower limb',zh:'下肢'},leg_posterior:{en:'Lower limb',zh:'下肢'},foot_dorsum:{en:'Lower limb',zh:'下肢'},foot_sole:{en:'Lower limb',zh:'下肢'}
};

/** English first, Chinese (the 跑考 summary's wording) after. */
const REGION_NAMES:Record<string,string>={
 back_superficial:'Superficial back muscles (extrinsic)｜背部淺層（外在肌群）',
 back_deep:'Deep back muscles (intrinsic)｜背部深層（內在肌群）',
 forearm_flexor:'Forearm flexors (4+1+3)｜前臂屈肌側',
 forearm_extensor:'Forearm extensors (6+5)｜前臂伸肌側'
};
export const layerRegionLabel=(r:LayerRegion)=>REGION_NAMES[r.id]??`${r.en}｜${r.zh}`;

const GROUP_EN:Record<string,string>={
 '第一層':'Layer 1','第二層':'Layer 2','第三層':'Layer 3','第四層':'Layer 4',
 '第二層（共同止於肩胛骨內側緣）':'Layer 2 (all insert on the medial border of the scapula)',
 '第一層：夾肌':'Layer 1: splenius','第二層：豎脊肌群（由內而外）':'Layer 2: erector spinae (medial to lateral)','第三層：橫棘肌群':'Layer 3: transversospinalis','更深層（不太會考）':'Deepest layer',
 '頂':'Roof','邊界肌肉':'Boundary muscles','更內側':'More medial','後面觀':'Posterior view','前面觀':'Anterior view',
 '淺層':'Superficial','深層':'Deep','中層':'Middle','肘部':'Elbow','淺層（較深）':'Superficial (deeper)',
 '淺層 4（由外而內，皆起自肱骨內上髁）':'Superficial 4 (lateral to medial, all from the medial epicondyle)','中間層 1':'Intermediate 1','深層 3':'Deep 3',
 '淺層 6（由外而內）':'Superficial 6 (lateral to medial)','深層 5（由外而內；前三塊構成鼻煙盒）':'Deep 5 (lateral to medial; the first three form the snuffbox)',
 '大魚際淺層':'Thenar, superficial','大魚際深層':'Thenar, deep','小魚際淺層':'Hypothenar, superficial','小魚際深層':'Hypothenar, deep','掌側其他（淺）':'Other palmar muscles, superficial','掌側其他（深）':'Other palmar muscles, deep','背側':'Dorsal',
 '第一層（皆起自跟骨粗隆）':'Layer 1 (all from the calcaneal tuberosity)','第二層（必連到屈趾長肌肌腱）':'Layer 2 (attach to the flexor digitorum longus tendon)'
};
export const layerGroupLabel=(label:string)=>GROUP_EN[label]?`${GROUP_EN[label]}｜${label}`:label;
