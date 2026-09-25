import {Matrix4,Quaternion,Vector3} from 'three';
import type {Atlas,Part,PartTransform} from '../anatomy';
import type {SkinBinding,Palette} from './soft-tissue';
import rawBindings from './body-bindings.json';
export type BodyRegion='head'|'spine'|'leftLeg'|'rightLeg';
export interface BodyPose {flexion:number;rotation:number;sideBend:number;knee:number;ankle:number}
export const BODY_NEUTRAL:BodyPose={flexion:0,rotation:0,sideBend:0,knee:0,ankle:0};
export const BODY_LIMITS={head:{flexion:[-30,35],rotation:[-55,55],sideBend:[-25,25],knee:[0,0],ankle:[0,0]},spine:{flexion:[-15,42],rotation:[-24,24],sideBend:[-20,20],knee:[0,0],ankle:[0,0]},leg:{flexion:[-20,80],rotation:[-20,20],sideBend:[0,35],knee:[0,110],ankle:[-30,20]}} as const;
export interface BodyBinding {name:string;rig:BodyRegion;frame:number|null}
// Cervical vessels must blend into the skull, not rotate as entire rigid tubes.
export const bodyBindings=Object.fromEntries(Object.entries(rawBindings).map(([id,b])=>[id,b.rig==='head'&&/artery|vein|venous/i.test(b.name)?{...b,frame:null}:b])) as Record<string,BodyBinding>;
export interface BodyRig {region:BodyRegion;pivots:Vector3[];levels:number[];focusIds:string[];framePartIds?:string[][]}
const center=(p:Atlas['parts'][number])=>new Vector3().fromArray(p.bounds[0]).add(new Vector3().fromArray(p.bounds[1])).multiplyScalar(.5);
export function makeBodyRig(atlas:Atlas,region:BodyRegion):BodyRig{
 const part=(name:string)=>{const p=atlas.parts.find(p=>p.name===name);if(!p)throw new Error(`Missing joint landmark: ${name}`);return p;};
 const focusIds=atlas.parts.filter(p=>(bodyBindings[p.id]?.rig===region&&bodyBindings[p.id].name===p.name&&(region!=='head'||p.bounds[0][1]>1.27))||(region==='head'&&p.id.startsWith('BP3-FMA'))).map(p=>p.id);
 if(region==='head'){
  const names=['Seventh cervical vertebra','Sixth cervical vertebra','Fifth cervical vertebra','Fourth cervical vertebra','Third cervical vertebra','Axis','Atlas'];
  const cs=names.map(n=>center(part(n)));
  const pivots=[new Vector3(),...cs.map((c,i)=>i?c.clone().add(cs[i-1]).multiplyScalar(.5):c.clone().setY(part(names[0]).bounds[0][1])),cs[6].clone().setY(part('Atlas').bounds[1][1])];
  return{region,pivots,levels:[pivots[1].y,...cs.map(c=>c.y),pivots[8].y],focusIds};
 }
 if(region==='spine'){
  const vertebrae=atlas.parts.filter(p=>p.system==='skeletal'&&/(lumbar vertebra|thoracic vertebra)/i.test(p.name)).sort((a,b)=>center(a).y-center(b).y);
  if(vertebrae.length<8)throw new Error('Spine rig could not find the thoracic and lumbar vertebrae.');
  const centers=vertebrae.map(center),levels=centers.map(v=>v.y),pivots=[new Vector3(),...centers.map(v=>v.clone())];
  const minY=levels[0]-.16,maxY=levels[levels.length-1]+.13;
  const focusIds=atlas.parts.filter(p=>{const c=center(p);return c.y>=minY&&c.y<=maxY&&Math.abs(c.x)<.48;}).map(p=>p.id);
  const framePartIds=Array.from({length:vertebrae.length},()=>[] as string[]);
  vertebrae.forEach((p,i)=>framePartIds[i].push(p.id));
  for(const p of atlas.parts){
   if(p.system!=='skeletal'||!/(rib|sternum)/i.test(p.name))continue;
   const y=center(p).y;if(y<minY||y>maxY)continue;
   let best=0,dist=Infinity;levels.forEach((level,i)=>{const d=Math.abs(level-y);if(d<dist){dist=d;best=i;}});
   framePartIds[best].push(p.id);
  }
  // Everything anatomically suspended from the upper thorax must inherit the
  // final thoracic frame during trunk motion. Otherwise the ribs bend while
  // the shoulder girdle, arms and head remain behind in world space.
  const upperChain=/clavicle|scapula|humerus|ulna|radius|carpal|metacarpal|phalanx of .*?(?:finger|thumb)|cervical vertebra|atlas$|axis$|occipital|parietal|frontal bone|temporal bone|sphenoid|ethmoid|mandible|maxilla|zygomatic|nasal bone|lacrimal bone|palatine bone|vomer|inferior nasal concha|hyoid/i;
  const topFrame=framePartIds[framePartIds.length-1];
  const assigned=new Set(framePartIds.flat()),topY=levels[levels.length-1];
  for(const p of atlas.parts){
   if(p.system!=='skeletal'||assigned.has(p.id))continue;
   const b=bodyBindings[p.id],pc=center(p);
   const cranioCervicalSpatial=pc.y>topY+.035&&Math.abs(pc.x)<.38;
   if(upperChain.test(p.name)||(b?.rig==='head'&&b.frame!==null)||cranioCervicalSpatial)topFrame.push(p.id);
  }
  return{region,pivots,levels,focusIds:[...new Set([...focusIds,...framePartIds.flat()])],framePartIds};
 }
 const side=region==='leftLeg'?'Left':'Right',sign=region==='leftLeg'?1:-1,femur=part(`${side} femur`),tibia=part(`${side} tibia`),talus=part(`${side} talus`);
 const hip=center(femur).set(sign*(Math.min(Math.abs(femur.bounds[0][0]),Math.abs(femur.bounds[1][0]))+.022),femur.bounds[1][1]-.023,center(femur).z);
 const knee=center(tibia).setY((tibia.bounds[1][1]+femur.bounds[0][1])*.5),ankle=center(talus).setY(talus.bounds[1][1]);
 for(const p of atlas.parts)if(p.name===`${side} hip bone`||p.name==='Sacrum')focusIds.push(p.id);
 return{region,pivots:[new Vector3(),hip,knee,ankle,knee.clone()],levels:[hip.y,knee.y,ankle.y],focusIds};
}
const rotation=(x:number,y:number,z:number)=>new Quaternion().setFromAxisAngle(new Vector3(0,1,0),y*Math.PI/180).multiply(new Quaternion().setFromAxisAngle(new Vector3(0,0,1),z*Math.PI/180)).multiply(new Quaternion().setFromAxisAngle(new Vector3(1,0,0),x*Math.PI/180));
const about=(p:Vector3,q:Quaternion)=>new Matrix4().makeTranslation(p.x,p.y,p.z).multiply(new Matrix4().makeRotationFromQuaternion(q)).multiply(new Matrix4().makeTranslation(-p.x,-p.y,-p.z));
const rigid=(m:Matrix4):PartTransform=>{const p=new Vector3(),q=new Quaternion(),s=new Vector3();m.decompose(p,q,s);return{translation:p.toArray() as [number,number,number],quaternion:q.toArray() as [number,number,number,number]};};
export function buildBodyMotion(rig:BodyRig,input:BodyPose){
 const limits=BODY_LIMITS[rig.region==='head'?'head':rig.region==='spine'?'spine':'leg'],pose={...BODY_NEUTRAL};
 for(const key of Object.keys(pose) as (keyof BodyPose)[])pose[key]=Math.max(limits[key][0],Math.min(limits[key][1],Number.isFinite(input[key])?input[key]:0));
 const matrices=[new Matrix4()];
 if(rig.region==='head'){
  const flex=[.07,.1,.12,.12,.12,.12,.1,.25],yaw=[.04,.05,.06,.06,.07,.12,.5,.1];
  for(let i=1;i<=8;i++)matrices.push(matrices[i-1].clone().multiply(about(rig.pivots[i],rotation(pose.flexion*flex[i-1],pose.rotation*yaw[i-1],-pose.sideBend*flex[i-1]))));
 }else if(rig.region==='spine'){
  const n=rig.pivots.length-1;
  const flexWeights=Array.from({length:n},(_,i)=>1.35-.7*(i/Math.max(1,n-1)));
  const rotWeights=Array.from({length:n},(_,i)=>.55+.9*(i/Math.max(1,n-1)));
  const flexSum=flexWeights.reduce((a,b)=>a+b,0),rotSum=rotWeights.reduce((a,b)=>a+b,0);
  for(let i=1;i<=n;i++){
   const localFlex=pose.flexion*flexWeights[i-1]/flexSum;
   const localRot=pose.rotation*rotWeights[i-1]/rotSum;
   const localSide=pose.sideBend*flexWeights[i-1]/flexSum;
   matrices.push(matrices[i-1].clone().multiply(about(rig.pivots[i],rotation(localFlex,localRot,-localSide))));
  }
 }else{
  const sign=rig.region==='leftLeg'?1:-1;
  matrices.push(about(rig.pivots[1],rotation(-pose.flexion,-sign*pose.rotation,sign*pose.sideBend)));
  matrices.push(matrices[1].clone().multiply(about(rig.pivots[2],rotation(pose.knee,0,0))));
  matrices.push(matrices[2].clone().multiply(about(rig.pivots[3],rotation(-pose.ankle,0,0))));
  matrices.push(matrices[1].clone().multiply(about(rig.pivots[2],rotation(pose.knee*.5,0,0))));
 }
 const palette=new Float64Array(matrices.length*8),transforms:Record<string,PartTransform>={};
 matrices.forEach((m,i)=>{const t=rigid(m),q=new Quaternion(...t.quaternion),v=t.translation,d=new Quaternion(...v,0).multiply(q);palette.set([...q.toArray(),...d.toArray().map(x=>x*.5)],i*8);});
 if(rig.region==='spine'){
  rig.framePartIds?.forEach((ids,i)=>ids.forEach(id=>transforms[id]=rigid(matrices[i+1])));
 }else{
  for(const id of rig.focusIds){const b=bodyBindings[id];if(b?.rig===rig.region&&b.frame!==null)transforms[id]=rigid(matrices[b.frame]);else if(rig.region==='head'&&id.startsWith('BP3-FMA'))transforms[id]=rigid(matrices[8]);}
 }
 return{pose,matrices,palette,transforms};
}
const smooth=(x:number)=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export function bodyWeights(rig:BodyRig,y:number):number[]{
 const w=Array(rig.pivots.length).fill(0);
 if(rig.region==='spine'){
  const levels=rig.levels;
  if(y<=levels[0]-.05){w[0]=1;return w;}
  if(y<=levels[0]){const t=smooth((y-(levels[0]-.05))/.05);w[0]=1-t;w[1]=t;return w;}
  for(let i=0;i<levels.length-1;i++)if(y<levels[i+1]){
   const t=smooth((y-levels[i])/Math.max(.001,levels[i+1]-levels[i]));w[i+1]=1-t;w[i+2]=t;return w;
  }
  w[w.length-1]=1;return w;
 }
 if(rig.region==='head'){
  const levels=rig.levels;if(y<=levels[0]){w[0]=1;return w;}
  for(let i=1;i<levels.length;i++)if(y<levels[i]){const t=smooth((y-levels[i-1])/(levels[i]-levels[i-1]));w[i-1]=1-t;w[i]=t;return w;}
  w[8]=1;return w;
 }
 const [h,k,a]=rig.levels,hip=smooth((h+.075-y)/.15),knee=smooth((k+.055-y)/.11),ankle=smooth((a+.035-y)/.07);
 w[0]=1-hip;w[1]=hip*(1-knee);w[2]=hip*knee*(1-ankle);w[3]=hip*knee*ankle;return w;
}
export function cranialNerveRigid(name:string):boolean{return /facial nerve|trigeminal|supraorbital|supratrochlear|infraorbital|mental nerve|buccal nerve|zygomatic|infratrochlear|nasociliary|ethmoidal|ciliary|lacrimal|ophthalmic|maxillary nerve|mandibular nerve/i.test(name);}
/** Shared neck soft-tissue field. The anterior neck starts above the thoracic
 * inlet, not at C7: otherwise most of the trachea/strap muscles remain frozen.
 * The jaw is lower than the skull base, so anterior tissues reach head motion
 * lower down. Equal nerve/vessel rest points always receive equal weights.
 * This is an educational attachment envelope, not a physiological solver. */
export function neckSoftWeights(rig:BodyRig,y:number,z:number):number[]{
 const anterior=smooth((z+.035)/.065),base=rig.levels[0]-.05;
 const top=rig.levels[8]-.035*anterior;
 const t=Math.max(0,Math.min(1,(y-base)/(top-base)));
 return bodyWeights(rig,rig.levels[0]+t*(rig.levels[8]-rig.levels[0]));
}
export function bindBodyTissue(rig:BodyRig,positions:ArrayLike<number>,skull=false,part?:Part):SkinBinding{
 const count=positions.length/3,indices=new Uint8Array(count*4),weights=new Float32Array(count*4);
 const rigidThroat=part&&/^(Hyoid bone|.*cartilage)$/.test(part.name)&&!/disk/i.test(part.name);
 const spinal=part&&/longus colli|cervicis|scalen|intervertebral|vertebral artery/i.test(part.name);
 const c=rigidThroat?center(part):null;
 for(let i=0;i<count;i++){
  const y=c?.y??positions[i*3+1],z=c?.z??positions[i*3+2];
  let w=skull&&rig.region==='head'?[0,0,0,0,0,0,0,0,1]:skull&&rig.region==='spine'?Array.from({length:rig.pivots.length},(_,j)=>j===rig.pivots.length-1?1:0):rig.region==='head'&&!spinal?neckSoftWeights(rig,y,z):bodyWeights(rig,y);
  if(rig.region==='head'&&part&&/platysma/.test(part.name)){
   // Keep the broad clavicular sheet stationary and let its mandibular edge
   // reach the skull transform. Height-only cervical weights leave a flap
   // beside the jaw while rotating the lateral shoulder portion too far.
   const t=smooth((y-(part.bounds[0][1]+.018))/.10),lateral=smooth((.14-Math.abs(positions[i*3]))/.075),follow=t*lateral;
   w=[1-follow,0,0,0,0,0,0,0,follow];
  }
  // Broad skull-inserting neck muscles keep their thoracic origins fixed.
  if(rig.region==='head'&&part&&/sternocleidomastoid|splenius capitis|semispinalis capitis|longus capitis/.test(part.name)){
   const t=smooth((y-part.bounds[0][1])/(part.bounds[1][1]-part.bounds[0][1]));
   const root=bodyWeights(rig,part.bounds[0][1]),tip=[0,0,0,0,0,0,0,0,1];
   w=root.map((v,j)=>v*(1-t)+tip[j]*t);
  }
  const entries=w.map((w,j)=>({w,j})).filter(e=>e.w>0);entries.forEach((e,k)=>{indices[i*4+k]=e.j;weights[i*4+k]=e.w;});
 }
 return{indices,weights,belly:new Float32Array(count),radial:new Float32Array(count*3),origin:new Vector3(),insertion:new Vector3(0,1,0),originWeights:[1],insertionWeights:[1],restLength:1,profile:'path'};
}
