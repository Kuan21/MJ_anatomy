import * as T from 'three';
import type {PartTransform,SystemId} from './anatomy';
import {SOFT_TISSUE_FILED_AS_SKELETAL,segmentPath,type Capsule,type Rig} from './mj-rig';

/**
 * Dual-quaternion skinning shared by the GPU shader and the CPU picker.
 *
 * Each vertex carries up to four (segment, weight) pairs:
 * - bones: weight 1.0 on their own segment (rigid);
 * - muscles: weights blend smoothly from the origin segment to the insertion
 *   segment along the muscle's own origin→insertion axis, and the belly
 *   thickens/thins with the stretch ratio (approximate volume preservation);
 * - nerves, arteries, veins and other tissue: weights are a function of
 *   position only (soft-min over segment capsules). Two parts that meet at the
 *   same point therefore get identical weights there, so a vessel split into
 *   several catalogue parts stays connected and bends smoothly at the joint.
 */
export const INFLUENCES=4;
export type SegmentTransform=PartTransform;
export interface MuscleBinding{origin:number;insertion:number;o:[number,number,number];i:[number,number,number]}
export interface PartSkin{index:Uint8Array;weight:Uint16Array;segments:number[];muscle?:MuscleBinding;/** bit mask of blend groups this part keeps away from (see AFFINITY) */foreign?:number}
export type SkinKind='bone'|'muscle'|'field';

const WEIGHT_SCALE=65535;
export function skinKind(system:SystemId,name:string):SkinKind{
 if(system==='skeletal')return SOFT_TISSUE_FILED_AS_SKELETAL.test(name.toLowerCase())?'muscle':'bone';
 return system==='muscular'?'muscle':'field';
}

/** Capsules flattened per segment: [ax,ay,az, dx,dy,dz, 1/|d|², r] × n, so distance queries allocate nothing. */
const packed=new WeakMap<Rig,Float64Array[]>();
function capsulesOf(rig:Rig){
 let p=packed.get(rig);if(p)return p;
 p=rig.segments.map(s=>Float64Array.from(s.capsules.flatMap((c:Capsule)=>{const d=c.b.clone().sub(c.a),l=d.lengthSq();return[c.a.x,c.a.y,c.a.z,d.x,d.y,d.z,l>0?1/l:0,c.r];})));packed.set(rig,p);return p;
}
export function segmentDistance(rig:Rig,s:number,x:number,y:number,z:number){
 const c=capsulesOf(rig)[s];let best=Infinity;
 for(let o=0;o<c.length;o+=8){
  const px=x-c[o],py=y-c[o+1],pz=z-c[o+2],dx=c[o+3],dy=c[o+4],dz=c[o+5];let t=(px*dx+py*dy+pz*dz)*c[o+6];t=t<0?0:t>1?1:t;
  const ex=px-dx*t,ey=py-dy*t,ez=pz-dz*t,d=Math.sqrt(ex*ex+ey*ey+ez*ez)-c[o+7];if(d<best)best=d;
 }
 return best;
}
/** Soft-min temperature: sets how wide the blend band around each joint is. */
export const fieldTemperature=(rig:Rig)=>.014*rig.scale;
/** Between blend groups: as smooth as a joint near their junction, nearly a hard boundary away from it. */
const SHARP=.003,JUNCTION_NEAR=.12,JUNCTION_FAR=.22;
/** Tissue squeezed between a limb and the trunk goes with the limb: the trunk's envelope is shrunk this much when groups compete. */
const AXIAL_YIELD=.006;
const ease=(rig:Rig,d:number)=>{const u=rig.scale,k=T.MathUtils.clamp((d-JUNCTION_NEAR*u)/((JUNCTION_FAR-JUNCTION_NEAR)*u),0,1);return k*k*(3-2*k);};
/** 0 within JUNCTION_NEAR of a shoulder/hip centre, easing to 1 beyond JUNCTION_FAR. */
export function junctionFactor(rig:Rig,x:number,y:number,z:number){
 let d=Infinity;for(const g of rig.groups)if(g.junction)d=Math.min(d,Math.hypot(x-g.junction.x,y-g.junction.y,z-g.junction.z));
 return ease(rig,d);
}
/** Per group: a limb is only joined to the trunk at its own junction; the trunk meets every limb. */
const groupFar=new Float64Array(64);
function groupFactors(rig:Rig,x:number,y:number,z:number){
 const nearest=junctionFactor(rig,x,y,z);
 rig.groups.forEach((g,k)=>{groupFar[k]=g.junction?ease(rig,Math.hypot(x-g.junction.x,y-g.junction.y,z-g.junction.z)):nearest;});
 return groupFar;
}
/**
 * A part that only grazes a group (a thigh fascia that the hanging hand touches)
 * keeps away from it away from the junctions: groups holding under FOREIGN_SHARE of
 * its vertices are pushed back by AFFINITY. Near a junction the bias fades to zero,
 * so vessels passing from trunk to limb still agree at every seam.
 */
const AFFINITY=.03,FOREIGN_SHARE=.05;

/** Segments that can influence anything inside a box (conservative, so per-vertex work stays small). */
export function candidateSegments(rig:Rig,box:T.Box3){
 const c=box.getCenter(new T.Vector3()),h=box.getSize(new T.Vector3()).length()/2,tau=fieldTemperature(rig);
 const d=rig.segments.map((_,s)=>segmentDistance(rig,s,c.x,c.y,c.z)),limit=Math.min(...d.map(x=>x+h))+12*tau;
 return d.map((x,s)=>({x,s})).filter(e=>e.x-h<=limit).map(e=>e.s);
}

/** Position-only weights: identical inputs give identical outputs, which is what guarantees continuity across parts. */
const fieldDistance=new Float64Array(64),groupDistance=new Float64Array(64),groupNearest=new Float64Array(64),groupSum=new Float64Array(64),fieldValue=new Float64Array(64);
export function fieldWeights(rig:Rig,candidates:ArrayLike<number>,x:number,y:number,z:number,outIndex:number[],outWeight:number[],foreign=0){
 const tau=fieldTemperature(rig),n=candidates.length,groups=rig.groups.length,u=rig.scale;outIndex.length=0;outWeight.length=0;
 if(n===1){outIndex.push(candidates[0]);outWeight.push(1);return;}
 groupNearest.fill(Infinity,0,groups);groupSum.fill(0,0,groups);
 for(let k=0;k<n;k++){const s=candidates[k],d=segmentDistance(rig,s,x,y,z),g=rig.segments[s].group;fieldDistance[k]=d;if(d<groupNearest[g])groupNearest[g]=d;}
 // Within a group: smooth soft-min across its joints.
 for(let k=0;k<n;k++){const g=rig.segments[candidates[k]].group;fieldValue[k]=Math.exp(-(fieldDistance[k]-groupNearest[g])/tau);groupSum[g]+=fieldValue[k];}
 // Between groups: the trunk yields to limbs, a part may keep to its own group, sharp away from junctions.
 const far=groupFactors(rig,x,y,z);let min=Infinity;
 for(let g=0;g<groups;g++){groupDistance[g]=groupNearest[g]+(g===0&&groups>1?AXIAL_YIELD*u:0)+(foreign&(1<<g)?AFFINITY*u*far[g]:0);if(groupDistance[g]<min)min=groupDistance[g];}
 for(let k=0;k<n;k++){const g=rig.segments[candidates[k]].group;fieldValue[k]*=Math.exp(-(groupDistance[g]-min)/T.MathUtils.lerp(tau,SHARP*u,far[g]))/groupSum[g];}
 // Keep the INFLUENCES strongest segments (ties broken by index, so the result is a pure function of position).
 for(let k=0;k<n;k++){
  const s=candidates[k],w=fieldValue[k];let j=outWeight.length;
  while(j>0&&(outWeight[j-1]<w||(outWeight[j-1]===w&&outIndex[j-1]>s)))j--;
  if(j>=INFLUENCES)continue;outIndex.splice(j,0,s);outWeight.splice(j,0,w);if(outIndex.length>INFLUENCES){outIndex.pop();outWeight.pop();}
 }
 let sum=0;for(let k=0;k<outWeight.length;k++)sum+=outWeight[k];for(let k=0;k<outWeight.length;k++)outWeight[k]/=sum;
}

/**
 * Candidate segments per 2 cm cell, built once per rig. Looking candidates up by
 * position (not by part) keeps per-vertex work to the 1–4 segments that matter
 * and makes the weights an exact function of position across all parts.
 */
interface CandidateGrid{min:T.Vector3;cell:number;n:[number,number,number];offset:Uint32Array;list:Uint8Array;all:Uint8Array}
const grids=new WeakMap<Rig,CandidateGrid>();
function candidateGrid(rig:Rig){
 let grid=grids.get(rig);if(grid)return grid;
 const u=rig.scale,box=new T.Box3();rig.segments.forEach(s=>s.capsules.forEach(c=>{box.expandByPoint(c.a);box.expandByPoint(c.b);}));box.expandByScalar(.25*u);
 const cell=.02*u,size=box.getSize(new T.Vector3()),n:[number,number,number]=[Math.ceil(size.x/cell),Math.ceil(size.y/cell),Math.ceil(size.z/cell)];
 const h=Math.sqrt(3)*cell/2,margin=12*fieldTemperature(rig)+AXIAL_YIELD*u,offset=new Uint32Array(n[0]*n[1]*n[2]+1),lists:number[]=[],d=new Float64Array(rig.segments.length);
 for(let k=0;k<n[2];k++)for(let j=0;j<n[1];j++)for(let i=0;i<n[0];i++){
  const x=box.min.x+(i+.5)*cell,y=box.min.y+(j+.5)*cell,z=box.min.z+(k+.5)*cell;let limit=Infinity;
  for(let s=0;s<d.length;s++){d[s]=segmentDistance(rig,s,x,y,z);limit=Math.min(limit,d[s]+h);}
  const at=(k*n[1]+j)*n[0]+i;offset[at]=lists.length;for(let s=0;s<d.length;s++)if(d[s]-h<=limit+margin)lists.push(s);
 }
 offset[offset.length-1]=lists.length;
 grid={min:box.min.clone(),cell,n,offset,list:Uint8Array.from(lists),all:Uint8Array.from(rig.segments.map((_,s)=>s))};grids.set(rig,grid);return grid;
}
function candidatesAt(rig:Rig,x:number,y:number,z:number){
 const g=candidateGrid(rig),i=Math.floor((x-g.min.x)/g.cell),j=Math.floor((y-g.min.y)/g.cell),k=Math.floor((z-g.min.z)/g.cell);
 if(i<0||j<0||k<0||i>=g.n[0]||j>=g.n[1]||k>=g.n[2])return g.all;
 const at=(k*g.n[1]+j)*g.n[0]+i;return g.list.subarray(g.offset[at],g.offset[at+1]);
}
/** Field weights at a point, with candidates looked up from the shared grid. */
export function fieldAt(rig:Rig,x:number,y:number,z:number,outIndex:number[],outWeight:number[],foreign=0){fieldWeights(rig,candidatesAt(rig,x,y,z),x,y,z,outIndex,outWeight,foreign);}

const smooth=(x:number)=>{const t=T.MathUtils.clamp(x,0,1);return t*t*(3-2*t);};
/** Fraction of the transition across one joint completed at parameter t (continuous, monotone, 0.5 at the joint). */
function jointBlend(t:number,lo:number,j:number,hi:number){
 if(t<=lo)return 0;if(t>=hi)return 1;
 const u=t<j?.5*(t-lo)/Math.max(1e-6,j-lo):.5+.5*(t-j)/Math.max(1e-6,hi-j);return smooth(u);
}
export interface MusclePath{path:number[];joints:{lo:number;j:number;hi:number}[]}
/** Weights along a muscle path at parameter t (0 = origin, 1 = insertion). At most two segments are non-zero. */
export function muscleWeightsAt(mp:MusclePath,t:number,outIndex:number[],outWeight:number[]){
 outIndex.length=0;outWeight.length=0;let carry=1;
 for(let k=0;k<mp.path.length;k++){
  const a=k<mp.joints.length?jointBlend(t,mp.joints[k].lo,mp.joints[k].j,mp.joints[k].hi):1,w=carry*(1-(k<mp.joints.length?a:0));
  if(w>1e-5){outIndex.push(mp.path[k]);outWeight.push(w);}carry*=a;if(carry<=1e-5)break;
 }
 const sum=outWeight.reduce((x,y)=>x+y,0)||1;for(let k=0;k<outWeight.length;k++)outWeight[k]/=sum;
}

function writeVertex(skin:PartSkin,v:number,idx:number[],w:number[],used:Set<number>){
 let total=0;const q:number[]=[];
 for(let k=0;k<INFLUENCES;k++){const x=k<w.length?Math.round(w[k]*WEIGHT_SCALE):0;q.push(x);total+=x;}
 q[0]+=WEIGHT_SCALE-total;// keep an exact partition of unity after quantisation
 for(let k=0;k<INFLUENCES;k++){skin.index[v*4+k]=k<idx.length?idx[k]:idx[0];skin.weight[v*4+k]=q[k];if(q[k]>0)used.add(idx[k]??idx[0]);}
}

/**
 * Attachment hints for upper-limb muscles whose bony ends are known but are not
 * reliably inferable from proximity (e.g. biceps inserts on the radius, not the
 * nearby ulna). Keys are segment keys on the muscle's own side; first match wins.
 * Unlisted muscles fall back to the segments their vertices lie against.
 */
export const ATTACHMENT_HINTS:{match:RegExp;origin?:string;insertion?:string}[]=[
 {match:/biceps brachii/,origin:'scapula',insertion:'radius'},
 {match:/coracobrachialis/,origin:'scapula',insertion:'humerus'},
 {match:/\bbrachialis\b/,origin:'humerus',insertion:'ulna'},
 {match:/long head of (left|right) triceps/,origin:'scapula',insertion:'ulna'},
 {match:/triceps brachii|anconeus/,origin:'humerus',insertion:'ulna'},
 {match:/brachioradialis|supinator/,origin:'humerus',insertion:'radius'},
 {match:/ulnar head of (left|right) pronator teres|pronator quadratus/,origin:'ulna',insertion:'radius'},
 {match:/pronator teres/,origin:'humerus',insertion:'radius'},
 {match:/deltoid|supraspinatus|infraspinatus|teres minor|teres major|subscapularis/,origin:'scapula',insertion:'humerus'},
 {match:/pectoralis major|latissimus dorsi/,origin:'thorax',insertion:'humerus'},
 {match:/pectoralis minor|serratus anterior|trapezius|rhomboid|levator scapulae|subclavius/,origin:'thorax',insertion:'scapula'},
 // Trunk-wall muscles are fixed to the ribs/spine even where the scapula lies on them.
 {match:/intercostal|subcostal|transversus thoracis|levatores costarum|oblique|rectus abdominis|transversus abdominis|longissimus|iliocostalis|spinalis|multifidus|rotatores|semispinalis|diaphragm|quadratus lumborum|serratus posterior/,origin:'thorax',insertion:'thorax'},
 {match:/flexor carpi|extensor carpi|palmaris longus|flexor digitorum|extensor digitorum|flexor pollicis longus|extensor pollicis|abductor pollicis longus|extensor indicis|extensor digiti minimi/,insertion:'hand'},
];
function hinted(rig:Rig,name:string,key:string|undefined){
 if(!key)return undefined;if(rig.byId.has(key))return rig.byId.get(key)!.index;
 const n=name.toLowerCase(),side=/\bright\b/.test(n)?'right':/\bleft\b/.test(n)?'left':null;
 return side?rig.byId.get(`${side}.${key}`)?.index:undefined;
}

/** Until real weights arrive: mapped bones on their own segment, everything else on the trunk (segment 0). */
export function provisionalSkin(rig:Rig,part:number,count:number):PartSkin{
 const s=rig.boneSegment.get(part)??0,skin:PartSkin={index:new Uint8Array(count*4),weight:new Uint16Array(count*4),segments:[s]};
 for(let v=0;v<count;v++){skin.index[v*4]=s;skin.weight[v*4]=WEIGHT_SCALE;}
 return skin;
}

/** Build per-vertex segment indices/weights for one catalogue part. */
export function computePartSkin(rig:Rig,part:number,name:string,kind:SkinKind,positions:ArrayLike<number>,count:number,box:T.Box3,indices?:ArrayLike<number>,options:{foreign?:number}={}):PartSkin{
 const skin:PartSkin={index:new Uint8Array(count*4),weight:new Uint16Array(count*4),segments:[]},used=new Set<number>();
 const idx:number[]=[],w:number[]=[];
 const rigid=(s:number)=>{for(let v=0;v<count;v++){skin.index[v*4]=s;skin.weight[v*4]=WEIGHT_SCALE;}skin.segments=[s];return skin;};
 const bone=rig.boneSegment.get(part),candidates=candidateSegments(rig,box);
 if(kind==='bone'){
  if(bone!==undefined)return rigid(bone);
  const c=box.getCenter(new T.Vector3());fieldAt(rig,c.x,c.y,c.z,idx,w);return rigid(idx[0]);
 }
 // A hint only applies where its bones are actually nearby (leg "flexor digitorum longus" must not bind to the hand).
 const step=Math.max(1,Math.floor(count/400)),near=(key?:string)=>{
  if(!key)return true;const s=hinted(rig,name,key);if(s===undefined)return false;
  for(let v=0;v<count;v+=step)if(segmentDistance(rig,s,positions[v*3],positions[v*3+1],positions[v*3+2])<=.03*rig.scale)return true;return false;
 };
 const hint=kind==='muscle'?ATTACHMENT_HINTS.find(h=>h.match.test(name.toLowerCase())&&near(h.origin)&&near(h.insertion)):undefined;
 if(candidates.length===1&&!hint)return rigid(candidates[0]);
 if(hint?.origin&&hint.origin===hint.insertion){const s=hinted(rig,name,hint.origin);if(s!==undefined)return rigid(s);}
 const field:FieldSample={index:new Uint8Array(count*4),weight:new Float32Array(count*4)};
 for(let v=0;v<count;v++){
  fieldAt(rig,positions[v*3],positions[v*3+1],positions[v*3+2],idx,w);
  for(let k=0;k<INFLUENCES;k++){field.index[v*4+k]=idx[k]??idx[0];field.weight[v*4+k]=w[k]??0;}
 }
 if(kind==='field'){
  const votes=new Map<number,number>();for(let v=0;v<count;v++){const g=rig.segments[field.index[v*4]].group;votes.set(g,(votes.get(g)??0)+1);}
  let foreign=options.foreign??0;if(options.foreign===undefined)rig.groups.forEach((_,g)=>{if((votes.get(g)??0)<count*FOREIGN_SHARE)foreign|=1<<g;});
  if(foreign)skin.foreign=foreign;
  for(let v=0;v<count;v++){
   if(foreign)fieldAt(rig,positions[v*3],positions[v*3+1],positions[v*3+2],idx,w,foreign);
   else{idx.length=0;w.length=0;for(let k=0;k<INFLUENCES;k++){idx.push(field.index[v*4+k]);w.push(field.weight[v*4+k]);}}
   writeVertex(skin,v,idx,w,used);
  }
 }
 if(kind==='muscle'){
  const mp=musclePath(rig,name,hint,positions,count,field,indices);
  if(typeof mp==='number')return rigid(mp);
  if(mp==='field'){for(let v=0;v<count;v++){idx.length=0;w.length=0;for(let k=0;k<INFLUENCES;k++){idx.push(field.index[v*4+k]);w.push(field.weight[v*4+k]);}writeVertex(skin,v,idx,w,used);}}
  else{
   for(let v=0;v<count;v++){muscleWeightsAt(mp,mp.t[v],idx,w);writeVertex(skin,v,idx,w,used);}
   skin.muscle={origin:mp.path[0],insertion:mp.path[mp.path.length-1],o:mp.o,i:mp.i};
  }
 }
 skin.segments=[...used].sort((a,b)=>a-b);
 return skin;
}

/** Share of each side of a joint over which origin→insertion weights blend. */
const BLEND_SPREAD=.7;
interface FieldSample{index:Uint8Array;weight:Float32Array}
type MuscleFit=MusclePath&{t:Float32Array;o:[number,number,number];i:[number,number,number]};
/**
 * Origin/insertion segments come from the hint table, else from the shallowest
 * and deepest segments the muscle lies against. Each vertex is then
 * parameterised by arc length along the segment path (origin axis → joint
 * centres → insertion axis), which stays meaningful for sheet-like muscles where
 * a principal axis would run across the fibres. When topology is available the
 * parameter is refined to a surface-geodesic ratio between the attachment areas.
 */
function musclePath(rig:Rig,name:string,hint:typeof ATTACHMENT_HINTS[number]|undefined,pos:ArrayLike<number>,count:number,field:FieldSample,indices?:ArrayLike<number>):MuscleFit|'field'|number{
 const votes=new Map<number,number>();for(let v=0;v<count;v++)votes.set(field.index[v*4],(votes.get(field.index[v*4])??0)+1);
 const supported=[...votes].filter(([,n])=>n>=Math.max(1,count*.04)).map(([s])=>s);
 const pickBy=(better:(a:number,b:number)=>boolean)=>supported.reduce((best,s)=>better(s,best)?s:best,supported[0]);
 const depth=(s:number)=>rig.segments[s].depth,n=(s:number)=>votes.get(s)??0;
 let origin=hinted(rig,name,hint?.origin)??pickBy((a,b)=>depth(a)<depth(b)||(depth(a)===depth(b)&&n(a)>n(b)));
 let insertion=hinted(rig,name,hint?.insertion)??pickBy((a,b)=>depth(a)>depth(b)||(depth(a)===depth(b)&&n(a)>n(b)));
 if(origin===insertion)return hint?.origin&&hint.origin===hint.insertion||votes.size<=1?origin:'field';
 let path=segmentPath(rig,origin,insertion);
 const linked=(a:number,b:number)=>rig.segments[a].parent===b||rig.segments[b].parent===a;
 // Ulna→radius→hand: the hand already carries the radius motion, so blend ulna straight into hand at the wrist.
 if(path.length>2)path=path.filter((s,k)=>k===0||k===path.length-1||linked(path[k-1],s));
 origin=path[0];insertion=path[path.length-1];
 const t=new Float32Array(count);let joints:number[];
 let pivots:T.Vector3[]=[];
 if(path.length===2&&!linked(origin,insertion)){
  // Side-by-side bones (ulna↔radius): parameterise across the gap between their axes.
  for(let v=0;v<count;v++){const a=Math.max(0,segmentDistance(rig,origin,pos[v*3],pos[v*3+1],pos[v*3+2])),b=Math.max(0,segmentDistance(rig,insertion,pos[v*3],pos[v*3+1],pos[v*3+2]));t[v]=a+b>0?a/(a+b):.5;}
  joints=[.5];
 }else{
  const centre=(a:number,b:number)=>rig.segments[rig.segments[b].parent===a||!linked(a,b)?b:a].pivot;
  const J=path.slice(1).map((s,k)=>centre(path[k],s).clone()),A:number[]=[0];pivots=J;for(let k=1;k<J.length;k++)A.push(A[k-1]+J[k].distanceTo(J[k-1]));
  const axisOf=(s:number,toward:T.Vector3)=>{const seg=rig.segments[s],c=seg.capsules[0],d=c.b.clone().sub(c.a);if(seg.limb==='axial'||d.lengthSq()<1e-10)return null;return d.dot(toward.clone().sub(c.a))<0?d.negate().normalize():d.normalize();};
  const last=J.length-1,pre=axisOf(origin,J[0]),post=axisOf(insertion,rig.segments[insertion].end??rig.segments[insertion].capsules[0].b)??J[last].clone().sub(J[last-1]??rig.segments[origin].pivot).normalize();
  const spans=J.slice(0,-1).map((j,k)=>J[k+1].clone().sub(j).normalize());
  // Arc coordinate of a point as seen from each path segment; blending these by the
  // (continuous) field weights keeps t continuous across the whole muscle surface.
  const arcOn=(k:number,x:number,y:number,z:number)=>{
   if(k===0){const dx=x-J[0].x,dy=y-J[0].y,dz=z-J[0].z;return pre?dx*pre.x+dy*pre.y+dz*pre.z:-Math.hypot(dx,dy,dz);}
   if(k===path.length-1)return A[last]+(x-J[last].x)*post.x+(y-J[last].y)*post.y+(z-J[last].z)*post.z;
   const d=spans[k-1],j=J[k-1];return A[k-1]+(x-j.x)*d.x+(y-j.y)*d.y+(z-j.z)*d.z;
  };
  const mid=(s:number)=>{const c=rig.segments[s].capsules[0];return c.a.clone().add(c.b).multiplyScalar(.5);};
  const onPath=new Map<number,number>();rig.segments.forEach((_,s)=>{const k=path.indexOf(s);onPath.set(s,k>=0?k:path.reduce((best,p,i)=>mid(p).distanceToSquared(mid(s))<mid(path[best]).distanceToSquared(mid(s))?i:best,0));});
  for(let v=0;v<count;v++){
   const x=pos[v*3],y=pos[v*3+1],z=pos[v*3+2];let arc=0;
   for(let k=0;k<INFLUENCES;k++){const fw=field.weight[v*4+k];if(fw>0)arc+=fw*arcOn(onPath.get(field.index[v*4+k])!,x,y,z);}
   t[v]=arc;
  }
  let lo=Infinity,hi=-Infinity;for(let v=0;v<count;v++){lo=Math.min(lo,t[v]);hi=Math.max(hi,t[v]);}
  const span=Math.max(1e-6,hi-lo);for(let v=0;v<count;v++)t[v]=(t[v]-lo)/span;
  joints=A.map(x=>(x-lo)/span);
 }
 if(indices)refineGeodesic(rig,pos,count,indices,field,origin,insertion,t,pivots,joints);
 joints=joints.map(j=>T.MathUtils.clamp(j,.08,.92));for(let k=1;k<joints.length;k++)joints[k]=Math.max(joints[k],joints[k-1]+.02);
 const ranges=joints.map((j,k)=>{
  const left=k===0?0:(joints[k-1]+j)/2,right=k===joints.length-1?1:(j+joints[k+1])/2;
  return{lo:j-BLEND_SPREAD*(j-left),j,hi:j+BLEND_SPREAD*(right-j)};
 });
 const end=(low:boolean)=>{const c=new T.Vector3();let m=0;for(let v=0;v<count;v++)if(low?t[v]<=.04:t[v]>=.96){c.x+=pos[v*3];c.y+=pos[v*3+1];c.z+=pos[v*3+2];m++;}return c.multiplyScalar(1/Math.max(1,m));};
 const o=end(true),i=end(false);
 return{path,joints:ranges,t,o:[o.x,o.y,o.z],i:[i.x,i.y,i.z]};
}

/**
 * t = dO/(dO+dI) with dO, dI the surface geodesic distances to the origin and
 * insertion attachment areas: the extreme 3% of the coarse parameter, or for an
 * axial origin the whole face lying ≥95% against the trunk.
 * Duplicate vertices along normal seams are welded so the surface is connected.
 */
function refineGeodesic(rig:Rig,pos:ArrayLike<number>,count:number,indices:ArrayLike<number>,field:FieldSample,origin:number,insertion:number,t:Float32Array,pivots:T.Vector3[],joints:number[]){
 const weld=new Int32Array(count),keys=new Map<string,number>();let nodes=0;const q=1e5;
 for(let v=0;v<count;v++){const k=`${Math.round(pos[v*3]*q)},${Math.round(pos[v*3+1]*q)},${Math.round(pos[v*3+2]*q)}`;let id=keys.get(k);if(id===undefined){id=nodes++;keys.set(k,id);}weld[v]=id;}
 const deg=new Int32Array(nodes+1);for(let k=0;k+2<indices.length;k+=3)for(let e=0;e<3;e++){deg[weld[indices[k+e]]+1]+=2;}
 for(let k=0;k<nodes;k++)deg[k+1]+=deg[k];
 const adj=new Int32Array(deg[nodes]),fill=deg.slice(0,nodes);
 for(let k=0;k+2<indices.length;k+=3)for(let e=0;e<3;e++){const a=weld[indices[k+e]],b=weld[indices[k+(e+1)%3]];adj[fill[a]++]=b;adj[fill[b]++]=a;}
 const node=new Float64Array(nodes*3);for(let v=0;v<count;v++){node[weld[v]*3]=pos[v*3];node[weld[v]*3+1]=pos[v*3+1];node[weld[v]*3+2]=pos[v*3+2];}
 const weightOn=(v:number,s:number)=>{let x=0;for(let k=0;k<INFLUENCES;k++)if(field.index[v*4+k]===s)x+=field.weight[v*4+k];return x;};
 const sorted=Array.from(t).sort((a,b)=>a-b),qlo=sorted[Math.floor(count*.03)],qhi=sorted[Math.min(count-1,Math.ceil(count*.97))];
 const seeds=(s:number,low:boolean)=>{
  // A muscle spread over the trunk (pectoralis, latissimus) is attached along its whole axial face;
  // limb attachments are the far ends of the muscle along its segment path.
  let out=new Set<number>();if(rig.segments[s].limb==='axial')for(let v=0;v<count;v++)if(weightOn(v,s)>=.95)out.add(weld[v]);
  if(out.size<Math.max(3,nodes*.01)){out=new Set();for(let v=0;v<count;v++)if(low?t[v]<=qlo:t[v]>=qhi)out.add(weld[v]);}
  return out;
 };
 const dO=dijkstra(seeds(origin,true),node,deg,adj,nodes),dI=dijkstra(seeds(insertion,false),node,deg,adj,nodes);
 for(let v=0;v<count;v++){const a=dO[weld[v]],b=dI[weld[v]];if(Number.isFinite(a)&&Number.isFinite(b))t[v]=a+b>0?a/(a+b):.5;else if(Number.isFinite(a))t[v]=0;else if(Number.isFinite(b))t[v]=1;}
 // Joint parameters: t at the surface point nearest each joint centre.
 pivots.forEach((J,k)=>{let best=Infinity,at=-1;for(let v=0;v<count;v++){const d=(pos[v*3]-J.x)**2+(pos[v*3+1]-J.y)**2+(pos[v*3+2]-J.z)**2;if(d<best){best=d;at=v;}}if(at>=0)joints[k]=t[at];});
}
function dijkstra(sources:Set<number>,node:Float64Array,deg:Int32Array,adj:Int32Array,nodes:number){
 const dist=new Float64Array(nodes).fill(Infinity),heap:number[]=[],key:number[]=[];
 const push=(n:number,d:number)=>{heap.push(n);key.push(d);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(key[p]<=key[i])break;[heap[p],heap[i]]=[heap[i],heap[p]];[key[p],key[i]]=[key[i],key[p]];i=p;}};
 const pop=()=>{const n=heap[0],d=key[0],ln=heap.pop()!,lk=key.pop()!;if(heap.length){heap[0]=ln;key[0]=lk;let i=0;for(;;){const l=i*2+1,r=l+1;let m=i;if(l<heap.length&&key[l]<key[m])m=l;if(r<heap.length&&key[r]<key[m])m=r;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];[key[m],key[i]]=[key[i],key[m]];i=m;}}return[n,d] as const;};
 sources.forEach(n=>{dist[n]=0;push(n,0);});
 while(heap.length){
  const[n,d]=pop();if(d>dist[n])continue;
  for(let e=deg[n];e<deg[n+1];e++){const m=adj[e],nd=d+Math.hypot(node[n*3]-node[m*3],node[n*3+1]-node[m*3+1],node[n*3+2]-node[m*3+2]);if(nd<dist[m]){dist[m]=nd;push(m,nd);}}
 }
 return dist;
}

/** Pose: per-segment unit dual quaternions [real xyzw, dual xyzw]. */
export class SegmentPose{
 readonly data:Float32Array;readonly identity:Uint8Array;version=0;
 constructor(readonly count:number){this.data=new Float32Array(count*8);this.identity=new Uint8Array(count);this.reset();}
 reset(){for(let s=0;s<this.count;s++){this.data.set([0,0,0,1,0,0,0,0],s*8);this.identity[s]=1;}this.version++;}
 set(rig:Rig,transforms:Record<string,SegmentTransform>|undefined){
  this.reset();if(!transforms)return;
  for(const[id,t]of Object.entries(transforms)){const s=rig.byId.get(id);if(!s)continue;this.data.set(dualQuaternion(t),s.index*8);this.identity[s.index]=isIdentity(t)?1:0;}
 }
 isRest(segments:number[]){return segments.every(s=>this.identity[s]===1);}
}
export function isIdentity(t:SegmentTransform){const[x,y,z]=t.translation,q=t.quaternion;return Math.abs(x)+Math.abs(y)+Math.abs(z)<1e-9&&Math.abs(Math.abs(q[3])-1)<1e-9;}
/** d = ½·(t,0)·r */
export function dualQuaternion(t:SegmentTransform):number[]{
 const[x,y,z,w]=t.quaternion,l=Math.hypot(x,y,z,w)||1,r=[x/l,y/l,z/l,w/l],[tx,ty,tz]=t.translation;
 return[...r,.5*(tx*r[3]+ty*r[2]-tz*r[1]),.5*(ty*r[3]+tz*r[0]-tx*r[2]),.5*(tz*r[3]+tx*r[1]-ty*r[0]),-.5*(tx*r[0]+ty*r[1]+tz*r[2])];
}

const blend=new Float32Array(8);
function blendDQ(pose:SegmentPose,index:ArrayLike<number>,weight:ArrayLike<number>,o:number){
 blend.fill(0);const d=pose.data,r0=index[o]*8;
 for(let k=0;k<INFLUENCES;k++){
  const w=weight[o+k];if(!w)continue;const s=index[o+k]*8,sign=d[s]*d[r0]+d[s+1]*d[r0+1]+d[s+2]*d[r0+2]+d[s+3]*d[r0+3]<0?-w:w;
  for(let c=0;c<8;c++)blend[c]+=sign*d[s+c];
 }
 const l=Math.hypot(blend[0],blend[1],blend[2],blend[3])||1;for(let c=0;c<8;c++)blend[c]/=l;return blend;
}
/** p' = r·p·r* + 2(r.w·d.xyz − d.w·r.xyz + r.xyz×d.xyz) */
export function applyDQ(q:ArrayLike<number>,x:number,y:number,z:number,out:T.Vector3){
 const rx=q[0],ry=q[1],rz=q[2],rw=q[3],dx=q[4],dy=q[5],dz=q[6],dw=q[7];
 const cx=ry*z-rz*y+rw*x,cy=rz*x-rx*z+rw*y,cz=rx*y-ry*x+rw*z;
 return out.set(x+2*(ry*cz-rz*cy)+2*(rw*dx-dw*rx+ry*dz-rz*dy),y+2*(rz*cx-rx*cz)+2*(rw*dy-dw*ry+rz*dx-rx*dz),z+2*(rx*cy-ry*cx)+2*(rw*dz-dw*rz+rx*dy-ry*dx));
}
const segDQ=(pose:SegmentPose,s:number)=>pose.data.subarray(s*8,s*8+8);
/** Belly calibre scale from stretch ratio λ: cross-section ∝ λ^-½, tapering to 1 at both attachments. */
export const BULGE_LIMITS=[.82,1.22] as const;
const oNow=new T.Vector3(),iNow=new T.Vector3(),axisNow=new T.Vector3();
/** Stretch ratio λ = current/rest attachment distance, and the resulting mid-belly calibre scale. */
export function bellyScale(pose:SegmentPose,m:MuscleBinding){
 applyDQ(segDQ(pose,m.origin),m.o[0],m.o[1],m.o[2],oNow);applyDQ(segDQ(pose,m.insertion),m.i[0],m.i[1],m.i[2],iNow);
 const rest=Math.hypot(m.i[0]-m.o[0],m.i[1]-m.o[1],m.i[2]-m.o[2]),lambda=rest>1e-6?oNow.distanceTo(iNow)/rest:1;
 return{lambda,scale:T.MathUtils.clamp(1/Math.sqrt(Math.max(lambda,1e-6)),BULGE_LIMITS[0],BULGE_LIMITS[1])};
}
/**
 * Scale the vertex's offset from its own point on the origin→insertion axis. That
 * axis point is carried by the same blended dual quaternion as the vertex, so the
 * bulge is a true cross-section change even where the belly bends round a joint.
 */
function bulge(pose:SegmentPose,m:MuscleBinding,dq:ArrayLike<number>,restX:number,restY:number,restZ:number,p:T.Vector3){
 const ax=m.i[0]-m.o[0],ay=m.i[1]-m.o[1],az=m.i[2]-m.o[2],rest2=ax*ax+ay*ay+az*az;if(rest2<1e-12)return p;
 const t=T.MathUtils.clamp(((restX-m.o[0])*ax+(restY-m.o[1])*ay+(restZ-m.o[2])*az)/rest2,0,1),scale=1+(bellyScale(pose,m).scale-1)*4*t*(1-t);
 const c=applyDQ(dq,m.o[0]+ax*t,m.o[1]+ay*t,m.o[2]+az*t,axisNow);
 return p.set(c.x+(p.x-c.x)*scale,c.y+(p.y-c.y)*scale,c.z+(p.z-c.z)*scale);
}
/** Blended dual quaternion for one vertex (a view into scratch memory: copy it to keep it). */
export function vertexDQ(pose:SegmentPose,skin:PartSkin,v:number){const o=v*4;return skin.weight[o]===WEIGHT_SCALE?segDQ(pose,skin.index[o]):blendDQ(pose,skin.index,skin.weight,o);}
/** CPU twin of the shader: used for picking and validation. */
export function skinVertex(pose:SegmentPose,skin:PartSkin,v:number,x:number,y:number,z:number,out:T.Vector3){
 const dq=vertexDQ(pose,skin,v);applyDQ(dq,x,y,z,out);
 if(skin.muscle&&skin.muscle.origin!==skin.muscle.insertion)bulge(pose,skin.muscle,dq,x,y,z,out);
 return out;
}
const sv=new T.Vector3();
export function skinPositions(pose:SegmentPose,skin:PartSkin,rest:ArrayLike<number>,count:number,out:Float32Array){
 for(let v=0;v<count;v++){skinVertex(pose,skin,v,rest[v*3],rest[v*3+1],rest[v*3+2],sv);out[v*3]=sv.x;out[v*3+1]=sv.y;out[v*3+2]=sv.z;}
 return out;
}

/** GLSL twin of blendDQ/applyDQ/bulge. `stateWidth` and `partIndex` come from the anatomy material. */
export const SKINNING_PARS=`
attribute vec4 segIndex; attribute vec4 segWeight;
uniform sampler2D segmentState; uniform float segmentWidth; uniform sampler2D muscleState;
vec4 mjSegReal(float s){ return texture2D(segmentState, vec2((2.0*s+0.5)/segmentWidth, 0.5)); }
vec4 mjSegDual(float s){ return texture2D(segmentState, vec2((2.0*s+1.5)/segmentWidth, 0.5)); }
vec3 mjDQPoint(vec4 r, vec4 d, vec3 p){ return p + 2.0*cross(r.xyz, cross(r.xyz,p)+r.w*p) + 2.0*(r.w*d.xyz - d.w*r.xyz + cross(r.xyz,d.xyz)); }
vec3 mjBulge(vec3 p, vec3 rest, vec4 mo, vec4 mi, vec4 real, vec4 dual){
 vec3 o = mjDQPoint(mjSegReal(mo.w), mjSegDual(mo.w), mo.xyz), i = mjDQPoint(mjSegReal(mi.w), mjSegDual(mi.w), mi.xyz);
 vec3 restAxis = mi.xyz - mo.xyz; float rest2 = dot(restAxis,restAxis);
 if(rest2 < 1e-12) return p;
 float t = clamp(dot(rest - mo.xyz, restAxis)/rest2, 0.0, 1.0);
 float s = clamp(inversesqrt(max(length(i - o)/sqrt(rest2), 1e-6)), ${BULGE_LIMITS[0].toFixed(2)}, ${BULGE_LIMITS[1].toFixed(2)});
 float scale = 1.0 + (s - 1.0)*4.0*t*(1.0 - t);
 vec3 c = mjDQPoint(real, dual, mo.xyz + restAxis*t);
 return c + (p - c)*scale;
}
`;
export const SKINNING_NORMAL=`
vec4 mjR0 = mjSegReal(segIndex.x), mjReal = vec4(0.0), mjDual = vec4(0.0);
float mjTotal = segWeight.x + segWeight.y + segWeight.z + segWeight.w;
for(int k = 0; k < 4; k++){
 float s = segIndex[k], w = segWeight[k]/max(mjTotal, 1e-6);
 if(w <= 0.0) continue;
 vec4 r = mjSegReal(s); w *= dot(r, mjR0) < 0.0 ? -1.0 : 1.0;
 mjReal += w*r; mjDual += w*mjSegDual(s);
}
float mjLen = length(mjReal); mjReal /= mjLen; mjDual /= mjLen;
vec3 objectNormal = normal + 2.0*cross(mjReal.xyz, cross(mjReal.xyz, normal) + mjReal.w*normal);
`;
export const SKINNING_POSITION=`
vec3 transformed = mjDQPoint(mjReal, mjDual, position);
vec4 mjMo = texture2D(muscleState, vec2((partIndex + 0.5)/stateWidth, 0.25)), mjMi = texture2D(muscleState, vec2((partIndex + 0.5)/stateWidth, 0.75));
if(mjMo.w >= 0.0 && mjMi.w >= 0.0 && mjMo.w != mjMi.w) transformed = mjBulge(transformed, position, mjMo, mjMi, mjReal, mjDual);
`;
