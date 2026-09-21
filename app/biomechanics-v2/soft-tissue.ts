import {Box3,Matrix4,Quaternion,Vector3} from 'three';
import type {Atlas,Part,PartTransform} from '../anatomy';
import {createSkeletonRig,type Side} from './skeleton';
import rawBindings from './tissue-bindings.json';
import rawNerves from './nerve-bindings.json';

export type Profile='path'|'deltoid'|'chest'|'cuff'|'biceps'|'triceps'|'arm'|'coraco'|'forearm'|'hand'|'scapular'|'clavicular';
export interface TissueBinding {name:string;side:Side;profile:Profile}
export const tissueBindings=rawBindings as Record<string,TissueBinding>;
export const nerveBindings=rawNerves as Record<string,{side:Side;profile:'path'}>;
// Common frame palette: trunk, clavicle, scapula, humerus, ulna, radius, hand.
export const FRAMES=['root','clavicle','scapula','humerus','ulna','radius','hand'] as const;
export interface SoftRig {side:Side;ids:(string|undefined)[];shoulder:Vector3;elbow:Vector3;wrist:Vector3;groups:Record<string,Box3>;radius:Vector3;ulna:Vector3;handTipY:number}
export interface SkinBinding {indices:Uint8Array;weights:Float32Array;belly:Float32Array;radial:Float32Array;origin:Vector3;insertion:Vector3;originWeights:number[];insertionWeights:number[];restLength:number;profile:Profile}
export function makeSoftRig(atlas:Atlas,side:Side):SoftRig|null{
 const rig=createSkeletonRig(atlas,side);if(!rig.valid)return null;
 const node=(id:string)=>rig.nodes.find(n=>n.id===id)!;
 const groups:Record<string,Box3>={};
 for(const p of atlas.parts){const b=tissueBindings[p.id];if(!b||b.name!==p.name||b.side!==side)continue;
  const key=b.profile;groups[key]??=new Box3();groups[key].union(new Box3(new Vector3().fromArray(p.bounds[0]),new Vector3().fromArray(p.bounds[1])));
 }
 const center=(id:string)=>{const p=atlas.parts.find(p=>p.id===node(id).partIds[0])!;return new Vector3().fromArray(p.bounds[0]).add(new Vector3().fromArray(p.bounds[1])).multiplyScalar(.5);};
 return{side,ids:[undefined,...['clavicle','scapula','humerus','ulna','radius','hand'].map(id=>node(id).partIds[0])],shoulder:node('humerus').pivot.clone(),elbow:node('ulna').pivot.clone(),wrist:node('carpus').pivot.clone(),groups,handTipY:Math.min(...atlas.parts.filter(p=>node('hand').partIds.includes(p.id)).map(p=>p.bounds[0][1])),radius:center('radius'),ulna:center('ulna')};
}
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const smooth=(x:number)=>{x=clamp(x);return x*x*(3-2*x);};
const range=(x:number,a:number,b:number)=>smooth((x-a)/Math.max(1e-6,b-a));
function pair(a:number,b:number,t:number){const w=[0,0,0,0,0,0,0];w[a]=1-t;w[b]+=t;return w;}
/** One shared, continuous spatial field for every vessel/nerve segment.
 * No per-segment centre decisions: equal rest points map to equal posed points.
 */
export function pathWeights(rig:SoftRig,x:number,y:number,z:number):number[]{
 const e=range(rig.elbow.y-y,-.055,.065),w=range(rig.wrist.y-y,-.035,.035);
 const lateral=range(Math.abs(x),.035,Math.max(.07,Math.abs(rig.shoulder.x)-.035));
 const arm=range(rig.shoulder.y-y,-.015,.105);
 const dR=Math.hypot(x-rig.radius.x,z-rig.radius.z),dU=Math.hypot(x-rig.ulna.x,z-rig.ulna.z);
 const radial=dU/(dR+dU+1e-9); // continuous, identical across adjacent segments
 return[(1-lateral)*(1-e),lateral*(1-arm)*(1-e),0,lateral*arm*(1-e),e*(1-w)*(1-radial),e*(1-w)*radial,e*w];
}
/** Register the separate legacy nerve atlas to this atlas BEFORE skinning.
 * Source distal landmark measured from all 98 decoded upper-limb GLB nodes.
 * A shared monotone warp preserves branch joins; wrist and proximal paths stay fixed.
 * This is a rest-pose length registration, not a clipping of posed nerve tips.
 */
export function registerNerveRest(rig:SoftRig,positions:Float32Array):void{
 const sourceTip=.70182711,targetTip=rig.handTipY-.002,anchor=rig.wrist.y;
 const delta=targetTip-sourceTip,length=anchor-sourceTip;
 for(let i=0;i<positions.length;i+=3){
  const t=clamp((anchor-positions[i+1])/length);
  positions[i+1]+=delta*smooth(t);
 }
}
export function weightsAt(rig:SoftRig,profile:Profile,p:Vector3,box:Box3,name=''):number[]{
 const c=box.getCenter(new Vector3()),size=box.getSize(new Vector3());
 const down=clamp((box.max.y-p.y)/Math.max(.01,size.y));
 const lateral=clamp((Math.abs(p.x)-Math.min(Math.abs(box.min.x),Math.abs(box.max.x)))/Math.max(.01,size.x));
 if(profile==='path'||profile==='forearm')return pathWeights(rig,p.x,p.y,p.z);
 if(profile==='hand')return pair(6,6,1);
 if(profile==='clavicular')return pair(0,1,smooth(lateral));
 if(profile==='scapular')return pair(0,2,range(lateral,.35,.95));
 if(profile==='chest')return pair(name.toLowerCase().includes('clavicular')?1:0,3,range(lateral,.72,.98));
 if(profile==='cuff')return pair(2,3,range(lateral,.30,.95));
 if(profile==='coraco')return pair(2,3,range(down,.1,.85));
 if(profile==='deltoid'){
  const distal=range(down,.08,.90),anterior=range(p.z,-.025,.015);
  const w=pair(2,3,distal);w[1]=(1-distal)*anterior;w[2]*=1-anterior;return w;
 }
 const proximal=profile==='biceps'||(profile==='triceps'&&name.toLowerCase().includes('long head'))?2:3;
 const distal=profile==='biceps'?5:4;
 const a=range(down,0,.22),b=range(down,.62,1);
 const weights=pair(proximal,3,a);for(let i=0;i<7;i++)weights[i]*=1-b;weights[distal]+=b;
 void c;return weights;
}

/** Store sparse weights once. All deltoid heads use the SAME envelope. */
export function bindTissue(rig:SoftRig,profile:Profile,positions:ArrayLike<number>,part?:Part):SkinBinding{
 const count=positions.length/3,indices=new Uint8Array(count*4),weights=new Float32Array(count*4),belly=new Float32Array(count),radial=new Float32Array(count*3);
 const own=new Box3();for(let i=0;i<count;i++)own.expandByPoint(new Vector3(positions[i*3],positions[i*3+1],positions[i*3+2]));
 const shared=['deltoid','biceps','triceps'].includes(profile)?rig.groups[profile]:null;
 const box=shared??own;
 const origin=box.getCenter(new Vector3()).setY(box.max.y),insertion=box.getCenter(new Vector3()).setY(box.min.y),axis=insertion.clone().sub(origin),restLength=axis.length();axis.normalize();
 const name=part?.name??'';
 for(let i=0;i<count;i++){
  const p=new Vector3(positions[i*3],positions[i*3+1],positions[i*3+2]);
  const raw=weightsAt(rig,profile,p,box,name),entries=raw.map((w,j)=>({w,j})).filter(x=>x.w>0).sort((a,b)=>b.w-a.w).slice(0,4),total=entries.reduce((s,x)=>s+x.w,0);
  for(let k=0;k<entries.length;k++){indices[i*4+k]=entries[k].j;weights[i*4+k]=entries[k].w/total;}
  const t=clamp(p.clone().sub(origin).dot(axis)/Math.max(restLength,1e-6));
  const r=p.clone().sub(origin.clone().addScaledVector(axis,t*restLength));radial.set(r.toArray(),i*3);
  // Taper to zero at both attachments. Broad muscles get no volume correction.
  belly[i]=['biceps','triceps','arm','deltoid'].includes(profile)?Math.sin(Math.PI*t)**2:0;
 }
 return{indices,weights,belly,radial,origin,insertion,originWeights:weightsAt(rig,profile,origin,box,name),insertionWeights:weightsAt(rig,profile,insertion,box,name),restLength,profile};
}
export type Palette=Float64Array;
export function makePalette(rig:SoftRig,transforms:Record<string,PartTransform>):Palette{
 const out=new Float64Array(7*8);
 for(let i=0;i<7;i++){
  const t=rig.ids[i]?transforms[rig.ids[i]!]:undefined,q=t?new Quaternion(...t.quaternion).normalize():new Quaternion(),v=t?new Vector3(...t.translation):new Vector3();
  const d=new Quaternion(v.x,v.y,v.z,0).multiply(q);
  out.set([q.x,q.y,q.z,q.w,d.x*.5,d.y*.5,d.z*.5,d.w*.5],i*8);
 }
 return out;
}
/** Normalized dual-quaternion skinning. Hemisphere correction applies to BOTH
 * real and dual parts. No displacement clipping that strands moving insertions.
 */
function blended(palette:Palette,indices:ArrayLike<number>,weights:ArrayLike<number>,offset:number,out:Float64Array){
 out.fill(0);const ref=indices[offset]*8;
 for(let k=0;k<4;k++){
  let w=weights[offset+k];if(!w)continue;const j=indices[offset+k]*8;
  if(palette[ref]*palette[j]+palette[ref+1]*palette[j+1]+palette[ref+2]*palette[j+2]+palette[ref+3]*palette[j+3]<0)w=-w;
  for(let c=0;c<8;c++)out[c]+=w*palette[j+c];
 }
 const len=Math.hypot(out[0],out[1],out[2],out[3]);
 if(len<1e-10)throw new Error('Degenerate skinning weights');
 for(let c=0;c<8;c++)out[c]/=len;
 // Project dual part onto the tangent space for a unit dual quaternion.
 const dot=out[0]*out[4]+out[1]*out[5]+out[2]*out[6]+out[3]*out[7];
 for(let c=0;c<4;c++)out[c+4]-=dot*out[c];
}
function transform(x:number,y:number,z:number,q:Float64Array,out:ArrayLike<number>&{[n:number]:number},i:number,translate=true){
 const [a,b,c,d,e,f,g,h]=q,tx=2*(b*z-c*y),ty=2*(c*x-a*z),tz=2*(a*y-b*x);
 out[i]=x+d*tx+b*tz-c*ty+(translate?2*(-h*a+d*e-f*c+g*b):0);
 out[i+1]=y+d*ty+c*tx-a*tz+(translate?2*(-h*b+d*f-g*a+e*c):0);
 out[i+2]=z+d*tz+a*ty-b*tx+(translate?2*(-h*c+d*g-e*b+f*a):0);
}
export function deformPoint(p:Vector3,weights:number[],palette:Palette):Vector3{
 const pairs=weights.map((w,i)=>({w,i})).sort((a,b)=>b.w-a.w).slice(0,4),sum=pairs.reduce((s,p)=>s+p.w,0),q=new Float64Array(8),v=new Float64Array(3);
 blended(palette,pairs.map(p=>p.i),pairs.map(p=>p.w/sum),0,q);transform(p.x,p.y,p.z,q,v,0);return new Vector3(...v);
}
export function deformTissue(binding:SkinBinding,base:Float32Array,palette:Palette,out:Float32Array):number{
 const a=deformPoint(binding.origin,binding.originWeights,palette),b=deformPoint(binding.insertion,binding.insertionWeights,palette);
 const ratio=a.distanceTo(b)/Math.max(binding.restLength,1e-6);
 // Modest inverse-length radial response; bounded, visual approximation only.
 const radialScale=Math.max(.94,Math.min(1.12,1/Math.sqrt(Math.max(.5,ratio))));
 const q=new Float64Array(8);
 for(let i=0;i<base.length/3;i++){
  blended(palette,binding.indices,binding.weights,i*4,q);
  const extra=(radialScale-1)*binding.belly[i],j=i*3;
  if(binding.profile==='chest'){
   // Broad origin stays anchored. Blend endpoint-frame displacements instead
   // of rotating the fan as a dual quaternion, which bows the chest upward.
   let x=0,y=0,z=0;const v=new Float64Array(3);
   for(let k=0;k<4;k++){const w=binding.weights[i*4+k];if(!w)continue;
    const f=binding.indices[i*4+k];transform(base[j],base[j+1],base[j+2],palette.subarray(f*8,f*8+8),v,0);
    x+=w*v[0];y+=w*v[1];z+=w*v[2];
   }
   out[j]=x;out[j+1]=y;out[j+2]=z;continue;
  }
  transform(base[j]+binding.radial[j]*extra,base[j+1]+binding.radial[j+1]*extra,base[j+2]+binding.radial[j+2]*extra,q,out,j);
 }
 return radialScale;
}
