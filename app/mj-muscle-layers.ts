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
