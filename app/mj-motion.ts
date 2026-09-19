import * as T from 'three';
import type {Atlas,PartTransform} from './anatomy';

export type Side='left'|'right';
export interface MotionPose{
 shoulderAbduction:number;
 shoulderFlexion:number;
 shoulderRotation:number;
 elbowFlexion:number;
 forearmRotation:number;
}
export const NEUTRAL_POSE:MotionPose={shoulderAbduction:0,shoulderFlexion:0,shoulderRotation:0,elbowFlexion:0,forearmRotation:0};
export const MOTION_LIMITS={shoulderAbduction:[0,170],shoulderFlexion:[-40,170],shoulderRotation:[-80,90],elbowFlexion:[0,145],forearmRotation:[-80,80]} as const;

const norm=(s:string)=>s.trim().toLowerCase();
const centerOfPart=(p:Atlas['parts'][number])=>new T.Vector3().fromArray(p.bounds[0]).add(new T.Vector3().fromArray(p.bounds[1])).multiplyScalar(.5);
const exact=(atlas:Atlas,name:string)=>atlas.parts.map((p,i)=>({p,i})).filter(x=>x.p.system==='skeletal'&&norm(x.p.name)===norm(name)).map(x=>x.i);
const boxFor=(atlas:Atlas,indices:number[])=>{const b=new T.Box3();indices.forEach(i=>{const p=atlas.parts[i];if(p)b.union(new T.Box3(new T.Vector3().fromArray(p.bounds[0]),new T.Vector3().fromArray(p.bounds[1])))});return b;};
const boxCenter=(atlas:Atlas,indices:number[])=>boxFor(atlas,indices).getCenter(new T.Vector3());
const longEndpoints=(box:T.Box3)=>{
 const c=box.getCenter(new T.Vector3()),s=box.getSize(new T.Vector3());let axis=0;
 if(s.y>s.x&&s.y>=s.z)axis=1;else if(s.z>s.x&&s.z>s.y)axis=2;
 const a=c.clone(),b=c.clone();a.setComponent(axis,box.min.getComponent(axis));b.setComponent(axis,box.max.getComponent(axis));return[a,b] as const;
};
const nearer=(a:T.Vector3,b:T.Vector3,to:T.Vector3)=>a.distanceToSquared(to)<b.distanceToSquared(to)?a:b;
const qdeg=(axis:T.Vector3,d:number)=>new T.Quaternion().setFromAxisAngle(axis,T.MathUtils.degToRad(d));
const about=(pivot:T.Vector3,q:T.Quaternion)=>new T.Matrix4().makeTranslation(pivot.x,pivot.y,pivot.z).multiply(new T.Matrix4().makeRotationFromQuaternion(q)).multiply(new T.Matrix4().makeTranslation(-pivot.x,-pivot.y,-pivot.z));
const tuple3=(v:T.Vector3):[number,number,number]=>[v.x,v.y,v.z];
const tuple4=(q:T.Quaternion):[number,number,number,number]=>[q.x,q.y,q.z,q.w];
const rigid=(m:T.Matrix4):PartTransform=>{const p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();m.decompose(p,q,s);return{translation:tuple3(p),quaternion:tuple4(q.normalize())};};
const clamp=(v:number,[lo,hi]:readonly[number,number])=>T.MathUtils.clamp(v,lo,hi);

export function constrainPose(input:MotionPose):MotionPose{
 return{
  shoulderAbduction:clamp(input.shoulderAbduction,MOTION_LIMITS.shoulderAbduction),
  shoulderFlexion:clamp(input.shoulderFlexion,MOTION_LIMITS.shoulderFlexion),
  shoulderRotation:clamp(input.shoulderRotation,MOTION_LIMITS.shoulderRotation),
  elbowFlexion:clamp(input.elbowFlexion,MOTION_LIMITS.elbowFlexion),
  forearmRotation:clamp(input.forearmRotation,MOTION_LIMITS.forearmRotation),
 };
}

export function sideRegionIds(atlas:Atlas,side:Side,minY=.68,maxY=1.50){
 return atlas.parts.filter(p=>{
  const c=centerOfPart(p);
  const correctSide=side==='right'?c.x<-.055:c.x>.055;
  return correctSide&&c.y>=minY&&c.y<=maxY;
 }).map(p=>p.id);
}

export function buildUpperLimbMotion(atlas:Atlas,side:Side,input:MotionPose){
 const cap=side[0].toUpperCase()+side.slice(1);
 const humerus=exact(atlas,`${cap} humerus`),scapula=exact(atlas,`${cap} scapula`),radius=exact(atlas,`${cap} radius`),ulna=exact(atlas,`${cap} ulna`);
 const warnings:string[]=[];
 if(humerus.length!==1||scapula.length!==1||radius.length!==1||ulna.length!==1){
  warnings.push(`Upper-limb bone mapping incomplete for ${side} side.`);
  return{transforms:{} as Record<string,PartTransform>,warnings};
 }
 const shoulderCandidates=longEndpoints(boxFor(atlas,humerus));
 const shoulder=nearer(shoulderCandidates[0],shoulderCandidates[1],boxCenter(atlas,scapula));
 const forearmBox=boxFor(atlas,[...radius,...ulna]),forearmEnds=longEndpoints(forearmBox),humerusEnds=longEndpoints(boxFor(atlas,humerus));
 let elbow=new T.Vector3(),best=Infinity;
 for(const h of humerusEnds)for(const f of forearmEnds){const d=h.distanceToSquared(f);if(d<best){best=d;elbow.copy(h).add(f).multiplyScalar(.5);}}
 const superior=shoulder.clone().sub(elbow).normalize();
 const lateral=new T.Vector3(side==='right'?-1:1,0,0);
 let anterior=lateral.clone().cross(superior).normalize();if(anterior.lengthSq()<.5)anterior.set(0,0,1);
 const p=constrainPose(input);
 const shoulderQ=qdeg(anterior,p.shoulderAbduction).multiply(qdeg(lateral,p.shoulderFlexion)).multiply(qdeg(superior,p.shoulderRotation)).normalize();
 const shoulderM=about(shoulder,shoulderQ);
 const movedElbow=elbow.clone().applyMatrix4(shoulderM);
 const movedLateral=lateral.clone().applyQuaternion(shoulderQ).normalize();
 const elbowQ=qdeg(movedLateral,p.elbowFlexion);
 const elbowM=about(movedElbow,elbowQ).multiply(shoulderM);
 const distalCenter=forearmBox.getCenter(new T.Vector3()).applyMatrix4(elbowM);
 const forearmAxis=movedElbow.clone().sub(distalCenter).normalize();
 const forearmQ=qdeg(forearmAxis,p.forearmRotation);
 const forearmM=about(movedElbow,forearmQ).multiply(elbowM);
 const transforms:Record<string,PartTransform>={};
 for(const part of atlas.parts){
  const c=centerOfPart(part),correctSide=side==='right'?c.x<-.055:c.x>.055;
  if(!correctSide||c.y<.68||c.y>1.50)continue;
  // Rigid educational approximation: all visible tissues travel with the limb segment.
  if(c.y<elbow.y+.015)transforms[part.id]=rigid(elbowM);
  else transforms[part.id]=rigid(shoulderM);
 }
 // Radius, hand and distal wrist receive pronation/supination around the forearm axis.
 for(const part of atlas.parts){
  const c=centerOfPart(part),correctSide=side==='right'?c.x<-.055:c.x>.055;
  if(!correctSide)continue;
  const n=norm(part.name);
  if((c.y<.96&&c.y>.68)||n===norm(`${cap} radius`)||/metacarpal|phalanx|carpal|scaphoid|lunate|triquetr|pisiform|trapezium|trapezoid|capitate|hamate/.test(n))transforms[part.id]=rigid(forearmM);
 }
 return{transforms,warnings};
}
