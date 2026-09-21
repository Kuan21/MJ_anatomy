import {Matrix4,Quaternion,Vector3} from 'three';
import type {Atlas,PartTransform} from '../anatomy';
import type {SkinBinding,Palette} from './soft-tissue';
import rawBindings from './body-bindings.json';
export type BodyRegion='head'|'leftLeg'|'rightLeg';
export interface BodyPose {flexion:number;rotation:number;sideBend:number;knee:number;ankle:number}
export const BODY_NEUTRAL:BodyPose={flexion:0,rotation:0,sideBend:0,knee:0,ankle:0};
export const BODY_LIMITS={head:{flexion:[-30,35],rotation:[-55,55],sideBend:[-25,25],knee:[0,0],ankle:[0,0]},leg:{flexion:[-20,80],rotation:[-20,20],sideBend:[0,35],knee:[0,110],ankle:[-30,20]}} as const;
export interface BodyBinding {name:string;rig:BodyRegion;frame:number|null}
export const bodyBindings=rawBindings as Record<string,BodyBinding>;
export interface BodyRig {region:BodyRegion;pivots:Vector3[];levels:number[];focusIds:string[]}
const center=(p:Atlas['parts'][number])=>new Vector3().fromArray(p.bounds[0]).add(new Vector3().fromArray(p.bounds[1])).multiplyScalar(.5);
export function makeBodyRig(atlas:Atlas,region:BodyRegion):BodyRig{
 const part=(name:string)=>{const p=atlas.parts.find(p=>p.name===name);if(!p)throw new Error(`Missing joint landmark: ${name}`);return p;};
 const focusIds=atlas.parts.filter(p=>bodyBindings[p.id]?.rig===region&&bodyBindings[p.id].name===p.name&&(region!=='head'||p.bounds[0][1]>1.27)).map(p=>p.id);
 if(region==='head'){
  const names=['Seventh cervical vertebra','Sixth cervical vertebra','Fifth cervical vertebra','Fourth cervical vertebra','Third cervical vertebra','Axis','Atlas'];
  const cs=names.map(n=>center(part(n)));
  const pivots=[new Vector3(),...cs.map((c,i)=>i?c.clone().add(cs[i-1]).multiplyScalar(.5):c.clone().setY(part(names[0]).bounds[0][1])),cs[6].clone().setY(part('Atlas').bounds[1][1])];
  return{region,pivots,levels:[pivots[1].y,...cs.map(c=>c.y),pivots[8].y],focusIds};
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
 const limits=BODY_LIMITS[rig.region==='head'?'head':'leg'],pose={...BODY_NEUTRAL};
 for(const key of Object.keys(pose) as (keyof BodyPose)[])pose[key]=Math.max(limits[key][0],Math.min(limits[key][1],Number.isFinite(input[key])?input[key]:0));
 const matrices=[new Matrix4()];
 if(rig.region==='head'){
  const flex=[.07,.1,.12,.12,.12,.12,.1,.25],yaw=[.04,.05,.06,.06,.07,.12,.5,.1];
  for(let i=1;i<=8;i++)matrices.push(matrices[i-1].clone().multiply(about(rig.pivots[i],rotation(pose.flexion*flex[i-1],pose.rotation*yaw[i-1],-pose.sideBend*flex[i-1]))));
 }else{
  const sign=rig.region==='leftLeg'?1:-1;
  matrices.push(about(rig.pivots[1],rotation(-pose.flexion,-sign*pose.rotation,sign*pose.sideBend)));
  matrices.push(matrices[1].clone().multiply(about(rig.pivots[2],rotation(pose.knee,0,0))));
  matrices.push(matrices[2].clone().multiply(about(rig.pivots[3],rotation(-pose.ankle,0,0))));
  matrices.push(matrices[1].clone().multiply(about(rig.pivots[2],rotation(pose.knee*.5,0,0))));
 }
 const palette=new Float64Array(matrices.length*8),transforms:Record<string,PartTransform>={};
 matrices.forEach((m,i)=>{const t=rigid(m),q=new Quaternion(...t.quaternion),v=t.translation,d=new Quaternion(...v,0).multiply(q);palette.set([...q.toArray(),...d.toArray().map(x=>x*.5)],i*8);});
 for(const id of rig.focusIds){const b=bodyBindings[id];if(b?.rig===rig.region&&b.frame!==null)transforms[id]=rigid(matrices[b.frame]);}
 return{pose,matrices,palette,transforms};
}
const smooth=(x:number)=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export function bodyWeights(rig:BodyRig,y:number):number[]{
 const w=Array(rig.pivots.length).fill(0);
 if(rig.region==='head'){
  const levels=rig.levels;if(y<=levels[0]){w[0]=1;return w;}
  for(let i=1;i<levels.length;i++)if(y<levels[i]){const t=smooth((y-levels[i-1])/(levels[i]-levels[i-1]));w[i-1]=1-t;w[i]=t;return w;}
  w[8]=1;return w;
 }
 const [h,k,a]=rig.levels,hip=smooth((h+.075-y)/.15),knee=smooth((k+.055-y)/.11),ankle=smooth((a+.035-y)/.07);
 w[0]=1-hip;w[1]=hip*(1-knee);w[2]=hip*knee*(1-ankle);w[3]=hip*knee*ankle;return w;
}
export function cranialNerveRigid(name:string):boolean{return /facial nerve|trigeminal|supraorbital|supratrochlear|infraorbital|mental nerve|buccal nerve|zygomatic|infratrochlear|nasociliary|ethmoidal|ciliary|lacrimal|ophthalmic|maxillary nerve|mandibular nerve/i.test(name);}
export function bindBodyTissue(rig:BodyRig,positions:ArrayLike<number>,skull=false):SkinBinding{
 const count=positions.length/3,indices=new Uint8Array(count*4),weights=new Float32Array(count*4);
 for(let i=0;i<count;i++){const entries=(skull&&rig.region==='head'?[0,0,0,0,0,0,0,0,1]:bodyWeights(rig,positions[i*3+1])).map((w,j)=>({w,j})).filter(e=>e.w>0);entries.forEach((e,k)=>{indices[i*4+k]=e.j;weights[i*4+k]=e.w;});}
 return{indices,weights,belly:new Float32Array(count),radial:new Float32Array(count*3),origin:new Vector3(),insertion:new Vector3(0,1,0),originWeights:[1],insertionWeights:[1],restLength:1,profile:'path'};
}
