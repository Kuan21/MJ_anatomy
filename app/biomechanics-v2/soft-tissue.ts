import {Box3,Matrix4,Quaternion,Vector3} from 'three';
import type {Atlas,Part,PartTransform} from '../anatomy';
import {createSkeletonRig,type Side} from './skeleton';
import rawBindings from './tissue-bindings.json';
import rawNerves from './nerve-bindings.json';

export type Profile='pectoralPath'|'axillaryCable'|'path'|'trunk'|'humeral'|'sheetMuscle'|'deltoid'|'chest'|'cuff'|'biceps'|'triceps'|'arm'|'coraco'|'forearm'|'hand'|'scapular'|'clavicular';
export interface TissueBinding {name:string;side:Side;profile:Profile}
export const tissueBindings=rawBindings as Record<string,TissueBinding>;
export const nerveBindings=rawNerves as Record<string,{side:Side;profile:'path'}>;

/**
 * Route neurovascular structures by their real attachment territory instead of
 * treating every branch as a free upper-limb tube. This prevents thoracic and
 * scapular branches from being dragged around the humerus during elevation.
 */
export function resolveNeurovascularProfile(name:string,fallback:Profile='path'):Profile{
 const n=name.toLowerCase();
 // Proximal neurovascular structures use one continuous world-space cable
 // field. Anatomically these bundles mainly glide and uncoil; the visual
 // effect is elastic lengthening without tearing at named-mesh boundaries.
 if(/long thoracic nerve|intercostobrachial|lateral thoracic (?:artery|vein)|superior thoracic (?:artery|vein)|axillary nerve|muscular branches of axillary nerve|superior lateral brachial cutaneous nerve|anterior circumflex humeral (?:artery|vein)|posterior circumflex humeral (?:artery|vein)|brachial plexus|trunk of brachial plexus|division of .*brachial plexus|cord of brachial plexus|roots of brachial plexus|pectoral nerve|thoraco-?acromial/.test(n))return 'axillaryCable';
 if(/dorsal scapular|suprascapular|thoracodorsal|circumflex scapular|subscapular (?:nerve|artery|vein)|upper subscapular nerve|lower subscapular nerve/.test(n))return 'scapular';
 if(/subclavian nerve|nerve to subclavius|supraclavicular/.test(n))return 'clavicular';
 return fallback;
}
/** Muscle deformation classification.
 * Broad pectoralis-major parts are fibre sheets: broad thoracic/clavicular
 * origins stay attached while the narrow humeral insertion follows the arm.
 * Other muscles keep their specialised profiles until separately validated.
 */
export function resolveMuscleProfile(name:string,fallback:Profile):Profile{
 if(/(?:clavicular|sternocostal|abdominal) part of .*pectoralis major|pectoralis major/i.test(name))return 'sheetMuscle';
 return fallback;
}
// Common frame palette: trunk, clavicle, scapula, humerus, ulna, radius, hand.
export const FRAMES=['root','clavicle','scapula','humerus','ulna','radius','hand'] as const;
export interface SoftRig {side:Side;ids:(string|undefined)[];shoulder:Vector3;elbow:Vector3;wrist:Vector3;groups:Record<string,Box3>;radius:Vector3;ulna:Vector3;handTipY:number;digitalLandmarks:{source:Vector3;target:Vector3}[]}
export interface SkinBinding {indices:Uint8Array;weights:Float32Array;belly:Float32Array;radial:Float32Array;longitudinal?:Float32Array;restAxis?:Vector3;sheetOriginFrame?:number;origin:Vector3;insertion:Vector3;originWeights:number[];insertionWeights:number[];restLength:number;profile:Profile}
export function makeSoftRig(atlas:Atlas,side:Side):SoftRig|null{
 const rig=createSkeletonRig(atlas,side);if(!rig.valid)return null;
 const node=(id:string)=>rig.nodes.find(n=>n.id===id)!;
 const groups:Record<string,Box3>={};
 for(const p of atlas.parts){const b=tissueBindings[p.id];if(!b||b.name!==p.name||b.side!==side)continue;
  const key=b.profile;groups[key]??=new Box3();groups[key].union(new Box3(new Vector3().fromArray(p.bounds[0]),new Vector3().fromArray(p.bounds[1])));
 }
 const center=(id:string)=>{const p=atlas.parts.find(p=>p.id===node(id).partIds[0])!;return new Vector3().fromArray(p.bounds[0]).add(new Vector3().fromArray(p.bounds[1])).multiplyScalar(.5);};
 const sourceTips=[[.23294473,.72658675,.07827127],[.2544531,.7137407,.08966618],[.28421846,.70268024,.09161239],[.31737652,.71126334,.08250995],[.32835086,.77373981,.06288589]];
 const fingers=['little finger','ring finger','middle finger','index finger','thumb'],sign=side==='left'?1:-1;
 const digitalLandmarks=fingers.map((finger,i)=>{const p=atlas.parts.find(p=>p.name===`Distal phalanx of ${side} ${finger}`);if(!p)throw new Error(`Missing distal landmark: ${side} ${finger}`);return{source:new Vector3(sign*sourceTips[i][0],sourceTips[i][1],sourceTips[i][2]),target:new Vector3((p.bounds[0][0]+p.bounds[1][0])*.5,p.bounds[0][1]-.001,p.bounds[1][2]-.002)};});
 return{side,digitalLandmarks,ids:[undefined,...['clavicle','scapula','humerus','ulna','radius','hand'].map(id=>node(id).partIds[0])],shoulder:node('humerus').pivot.clone(),elbow:node('ulna').pivot.clone(),wrist:node('carpus').pivot.clone(),groups,handTipY:Math.min(...atlas.parts.filter(p=>node('hand').partIds.includes(p.id)).map(p=>p.bounds[0][1])),radius:center('radius'),ulna:center('ulna')};
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
/** Continuous thorax-to-humerus field for axillary nerves/vessels.
 * It depends only on world position, so equal rest points on adjacent source
 * meshes remain coincident after deformation.
 */
export function axillaryCableWeights(rig:SoftRig,x:number,y:number,z:number):number[]{
 const lateral=range(Math.abs(x),.045,Math.max(.09,Math.abs(rig.shoulder.x)-.01));
 const height=range(y,rig.shoulder.y-.24,rig.shoulder.y+.025);
 const anterior=range(z,rig.shoulder.z-.11,rig.shoulder.z+.10);
 const humeral=smooth(lateral*(.82*height+.18*height*anterior));
 return pair(0,3,humeral);
}
/** Register the separate legacy nerve atlas to this atlas BEFORE skinning.
 * Five source digit landmarks are measured from decoded digital nerve branches.
 * A shared 3-D displacement field preserves branch joins; the wrist stays fixed.
 * This is rest-pose registration, not clipping or removal of posed nerve tips.
 */
export function registerNerveRest(rig:SoftRig,positions:Float32Array):void{
 // Digit endpoints measured in the decoded legacy GLB; target landmarks
 // follow each atlas distal phalanx, with a 1 mm distal soft-tissue allowance.
 // A shared smooth 3-D displacement field preserves cross-mesh branch joins.
 for(let i=0;i<positions.length;i+=3){
  const x=positions[i],y=positions[i+1],z=positions[i+2],t=range(.84-y,0,.06);if(t===0)continue;
  let total=0,dx=0,dy=0,dz=0;
  for(const {source:a,target:b} of rig.digitalLandmarks){const d=(x-a.x)**2+(y-a.y)**2+(z-a.z)**2,w=1/Math.max(1e-14,d*d);total+=w;dx+=w*(b.x-a.x);dy+=w*(b.y-a.y);dz+=w*(b.z-a.z);}
  positions[i]+=t*dx/total;positions[i+1]+=t*dy/total;positions[i+2]+=t*dz/total;
 }
}
export function weightsAt(rig:SoftRig,profile:Profile,p:Vector3,box:Box3,name=''):number[]{
 const c=box.getCenter(new Vector3()),size=box.getSize(new Vector3());
 const down=clamp((box.max.y-p.y)/Math.max(.01,size.y));
 const lateral=clamp((Math.abs(p.x)-Math.min(Math.abs(box.min.x),Math.abs(box.max.x)))/Math.max(.01,size.x));
 if(profile==='trunk')return pair(0,0,1);
 if(profile==='humeral')return pair(3,3,1);
 if(profile==='sheetMuscle')return pair(0,3,range(lateral,.10,.90));
 if(profile==='axillaryCable')return axillaryCableWeights(rig,p.x,p.y,p.z);
 if(profile==='pectoralPath'){const b=rig.groups.chest??box;const t=(Math.abs(p.x)-Math.min(Math.abs(b.min.x),Math.abs(b.max.x)))/Math.max(.01,b.max.x-b.min.x);return pair(0,3,range(t,.72,.98));}
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

/** Store sparse weights once. All deltoid heads use the SAME envelope.
 * Broad sheet muscles use their actual medial/lateral mesh edges as attachment
 * bands. This preserves the fan shape while preventing free cloth-like folds.
 */
export function bindTissue(rig:SoftRig,profile:Profile,positions:ArrayLike<number>,part?:Part):SkinBinding{
 const count=positions.length/3,indices=new Uint8Array(count*4),weights=new Float32Array(count*4),belly=new Float32Array(count),radial=new Float32Array(count*3),longitudinal=new Float32Array(count);
 const own=new Box3();for(let i=0;i<count;i++)own.expandByPoint(new Vector3(positions[i*3],positions[i*3+1],positions[i*3+2]));
 const name=part?.name??'',effectiveProfile=resolveMuscleProfile(name,profile);
 const shared=['deltoid','biceps','triceps'].includes(effectiveProfile)?rig.groups[effectiveProfile]:null;
 const box=shared??own;
 let origin:Vector3,insertion:Vector3,minAbs=0,maxAbs=1,spanAbs=1;

 if(effectiveProfile==='sheetMuscle'){
  minAbs=Math.min(Math.abs(own.min.x),Math.abs(own.max.x));maxAbs=Math.max(Math.abs(own.min.x),Math.abs(own.max.x));spanAbs=Math.max(1e-6,maxAbs-minAbs);
  const originSum=new Vector3(),insertionSum=new Vector3();let originCount=0,insertionCount=0;
  for(let i=0;i<count;i++){
   const p=new Vector3(positions[i*3],positions[i*3+1],positions[i*3+2]),t=clamp((Math.abs(p.x)-minAbs)/spanAbs);
   if(t<=.12){originSum.add(p);originCount++;}
   if(t>=.88){insertionSum.add(p);insertionCount++;}
  }
  const center=own.getCenter(new Vector3());
  origin=originCount?originSum.multiplyScalar(1/originCount):center.clone();
  insertion=insertionCount?insertionSum.multiplyScalar(1/insertionCount):center.clone();
 }else{
  origin=box.getCenter(new Vector3()).setY(box.max.y);
  insertion=box.getCenter(new Vector3()).setY(box.min.y);
 }

 const restVector=insertion.clone().sub(origin),restLength=Math.max(restVector.length(),1e-6),restAxis=restVector.clone().normalize();
 for(let i=0;i<count;i++){
  const p=new Vector3(positions[i*3],positions[i*3+1],positions[i*3+2]);
  const raw=weightsAt(rig,effectiveProfile,p,box,name),entries=raw.map((w,j)=>({w,j})).filter(x=>x.w>0).sort((a,b)=>b.w-a.w).slice(0,4),total=entries.reduce((s,x)=>s+x.w,0);
  for(let k=0;k<entries.length;k++){indices[i*4+k]=entries[k].j;weights[i*4+k]=entries[k].w/total;}
  const t=effectiveProfile==='sheetMuscle'?clamp((Math.abs(p.x)-minAbs)/spanAbs):clamp(p.clone().sub(origin).dot(restAxis)/restLength);
  longitudinal[i]=t;
  const r=p.clone().sub(origin.clone().addScaledVector(restVector,t));radial.set(r.toArray(),i*3);
  belly[i]=['biceps','triceps','arm'].includes(effectiveProfile)?Math.sin(Math.PI*t)**2:0;
 }
 const sheetOriginFrame=effectiveProfile==='sheetMuscle'&&/clavicular part/i.test(name)?1:effectiveProfile==='sheetMuscle'?0:undefined;
 return{indices,weights,belly,radial,longitudinal,restAxis,sheetOriginFrame,origin,insertion,originWeights:weightsAt(rig,effectiveProfile,origin,box,name),insertionWeights:weightsAt(rig,effectiveProfile,insertion,box,name),restLength,profile:effectiveProfile};
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
 const posedVector=b.clone().sub(a),posedLength=Math.max(posedVector.length(),1e-6);
 const ratio=posedLength/Math.max(binding.restLength,1e-6);
 const radialScale=Math.max(.94,Math.min(1.08,1/Math.sqrt(Math.max(.60,ratio))));
 const q=new Float64Array(8);

 // Broad muscles must not be linearly interpolated between a fixed thorax
 // and a highly rotated humerus: linear position blending collapses the mesh
 // into long triangular flaps at high shoulder elevation. The generic
 // dual-quaternion path below blends the two attachment frames without volume
 // collapse, while the sheet weights still keep the medial origin pinned.

 for(let i=0;i<base.length/3;i++){
  blended(palette,binding.indices,binding.weights,i*4,q);
  const extra=(radialScale-1)*binding.belly[i],j=i*3;
  if((binding.profile==='chest'||binding.profile==='pectoralPath'||binding.profile==='axillaryCable')){
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
