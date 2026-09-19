import * as T from 'three';
import type {Atlas,PartTransform} from './anatomy';

export type Side='left'|'right';
export interface MotionPose{
 shoulderAbduction:number;
 shoulderFlexion:number;
 shoulderRotation:number;
 elbowFlexion:number;
 forearmRotation:number;
 wristFlexion:number;
 wristDeviation:number;
}
export const NEUTRAL_POSE:MotionPose={
 shoulderAbduction:0,
 shoulderFlexion:0,
 shoulderRotation:0,
 elbowFlexion:0,
 forearmRotation:0,
 wristFlexion:0,
 wristDeviation:0
};
export const MOTION_LIMITS={
 shoulderAbduction:[0,155],
 shoulderFlexion:[-45,165],
 shoulderRotation:[-45,55],
 elbowFlexion:[-5,135],
 forearmRotation:[-75,75],
 wristFlexion:[-60,60],
 wristDeviation:[-20,30]
} as const;

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
  wristFlexion:clamp(input.wristFlexion,MOTION_LIMITS.wristFlexion),
  wristDeviation:clamp(input.wristDeviation,MOTION_LIMITS.wristDeviation),
 };
}

export function buildUpperLimbMotion(atlas:Atlas,side:Side,input:MotionPose){
 const cap=side[0].toUpperCase()+side.slice(1);
 const humerus=exact(atlas,`${cap} humerus`),scapula=exact(atlas,`${cap} scapula`),radius=exact(atlas,`${cap} radius`),ulna=exact(atlas,`${cap} ulna`);
 const warnings:string[]=[];
 if(humerus.length!==1||scapula.length!==1||radius.length!==1||ulna.length!==1){
  warnings.push(`Upper-limb bone mapping incomplete for ${side} side.`);
  return{transforms:{} as Record<string,PartTransform>,warnings};
 }

 const handBone=/metacarpal|phalanx|carpal|scaphoid|lunate|triquetr|pisiform|trapezium|trapezoid|capitate|hamate/;
 const handIndices=atlas.parts.map((p,i)=>({p,i})).filter(({p})=>{
  if(p.system!=='skeletal')return false;
  const c=centerOfPart(p),correctSide=side==='right'?c.x<-.04:c.x>.04;
  return correctSide&&handBone.test(norm(p.name));
 }).map(x=>x.i);

 const shoulderCandidates=longEndpoints(boxFor(atlas,humerus));
 const shoulder=nearer(shoulderCandidates[0],shoulderCandidates[1],boxCenter(atlas,scapula));
 const forearmBox=boxFor(atlas,[...radius,...ulna]),forearmEnds=longEndpoints(forearmBox),humerusEnds=longEndpoints(boxFor(atlas,humerus));
 const neutralHandCenter=handIndices.length?boxCenter(atlas,handIndices):forearmBox.getCenter(new T.Vector3()).add(new T.Vector3(0,-.22,0));
 const neutralWrist=nearer(forearmEnds[0],forearmEnds[1],neutralHandCenter);

 let elbow=new T.Vector3(),best=Infinity;
 for(const h of humerusEnds)for(const f of forearmEnds){const d=h.distanceToSquared(f);if(d<best){best=d;elbow.copy(h).add(f).multiplyScalar(.5);}}

 const superior=shoulder.clone().sub(elbow).normalize();
 const lateral=new T.Vector3(side==='right'?-1:1,0,0);
 const abductionAxis=lateral.clone().cross(superior).normalize();if(abductionAxis.lengthSq()<.5)abductionAxis.set(0,0,side==='right'?-1:1);
 const worldAnterior=new T.Vector3(0,0,1),shoulderFlexSign=side==='right'?1:-1,shoulderRotationSign=side==='right'?-1:1;
 const p=constrainPose(input);

 // Compose shoulder motion on moving anatomical axes rather than three fixed
 // world axes. This keeps abduction/adduction, flexion/extension and axial
 // rotation centred on the humeral head instead of letting combined sliders
 // sweep the arm through the thorax.
 const qAbduction=qdeg(abductionAxis,p.shoulderAbduction);
 const flexionAxis=lateral.clone().applyQuaternion(qAbduction).normalize();
 const qFlexion=qdeg(flexionAxis,p.shoulderFlexion*shoulderFlexSign);
 const shoulderSwingQ=qFlexion.clone().multiply(qAbduction).normalize();
 const axialAxis=superior.clone().applyQuaternion(shoulderSwingQ).normalize();
 const qAxial=qdeg(axialAxis,p.shoulderRotation*shoulderRotationSign);
 const shoulderQ=qAxial.clone().multiply(shoulderSwingQ).normalize();
 const shoulderM=about(shoulder,shoulderQ);
 const movedElbow=elbow.clone().applyMatrix4(shoulderM);
 const movedLateral=lateral.clone().applyQuaternion(shoulderQ).normalize();
 const movedAnterior=worldAnterior.clone().applyQuaternion(shoulderQ).normalize();
 const neutralForearmCenter=forearmBox.getCenter(new T.Vector3()).applyMatrix4(shoulderM);

 // Positive elbow flexion must move the forearm anteriorly. Negative values
 // allow only a small physiological hyperextension.
 const testQ=qdeg(movedLateral,5);
 const testPoint=neutralForearmCenter.clone().sub(movedElbow).applyQuaternion(testQ).add(movedElbow);
 const flexSign=testPoint.clone().sub(neutralForearmCenter).dot(movedAnterior)>=0?1:-1;
 const elbowQ=qdeg(movedLateral,p.elbowFlexion*flexSign);
 const elbowM=about(movedElbow,elbowQ).multiply(shoulderM);

 const distalCenter=forearmBox.getCenter(new T.Vector3()).applyMatrix4(elbowM);
 const forearmAxis=movedElbow.clone().sub(distalCenter).normalize();
 const forearmQ=qdeg(forearmAxis,p.forearmRotation);
 const forearmM=about(movedElbow,forearmQ).multiply(elbowM);

 const movedWrist=neutralWrist.clone().applyMatrix4(forearmM);
 const wristFlexAxis=movedLateral.clone().applyQuaternion(forearmQ).normalize();
 const wristDeviationAxis=forearmAxis.clone().cross(wristFlexAxis).normalize();
 const wristQ=qdeg(wristFlexAxis,p.wristFlexion)
  .multiply(qdeg(wristDeviationAxis,p.wristDeviation)).normalize();
 const wristM=about(movedWrist,wristQ).multiply(forearmM);

 // Soft-tissue approximations. These meshes are rigid (not skinned), so muscles
 // spanning the glenohumeral joint follow a controlled fraction of the same
 // anatomical shoulder quaternion instead of rotating around a different axis.
 const identityQ=new T.Quaternion();
 const softShoulderQ=new T.Quaternion().slerpQuaternions(identityQ,shoulderQ,.78).normalize();
 const cuffShoulderQ=new T.Quaternion().slerpQuaternions(identityQ,shoulderQ,.42).normalize();
 const softShoulderM=about(shoulder,softShoulderQ);
 const cuffShoulderM=about(shoulder,cuffShoulderQ);

 const transforms:Record<string,PartTransform>={};
 const onSide=(part:Atlas['parts'][number])=>{
  const c=centerOfPart(part);
  return side==='right'?c.x<-.10:c.x>.10;
 };
 const trunkAnchored=(part:Atlas['parts'][number])=>/pectoralis|latissimus dorsi|serratus anterior|trapezius|rhomboid|levator scapulae|subclavius/.test(norm(part.name));
 const scapulohumeral=(part:Atlas['parts'][number])=>/supraspinatus|infraspinatus|subscapularis|teres major|teres minor/.test(norm(part.name));
 const crossesShoulder=(part:Atlas['parts'][number])=>/deltoid/.test(norm(part.name));
 const upperArmMuscle=(part:Atlas['parts'][number])=>/biceps brachii|triceps brachii|brachialis|coracobrachialis/.test(norm(part.name));
 const forearmMuscle=(part:Atlas['parts'][number])=>/brachioradialis|pronator|supinator|flexor|extensor|palmaris/.test(norm(part.name));
 const isProximalBundle=(part:Atlas['parts'][number])=>{
  const c=centerOfPart(part),n=norm(part.name);
  return c.y>1.27&&/(artery|vein|nerve|plexus|ligament|retinaculum|fascia|aponeurosis)/.test(n);
 };
 const isUpperLimb=(part:Atlas['parts'][number])=>{
  const c=centerOfPart(part),ax=Math.abs(c.x),n=norm(part.name);
  if(!onSide(part)||c.y<.62||c.y>1.44)return false;
  if(part.system==='nervous')return false;
  if(trunkAnchored(part)||scapulohumeral(part))return false;
  if(/scapula|clavicle|sternum|rib/.test(n))return false;
  if(isProximalBundle(part))return false;
  if(/humerus|radius|ulna/.test(n)||handBone.test(n))return true;
  return ax>.145;
 };
 const isDistalToElbow=(part:Atlas['parts'][number])=>{
  const c=centerOfPart(part),n=norm(part.name);
  if(!isUpperLimb(part))return false;
  if(/radius|ulna/.test(n)||handBone.test(n))return true;
  return c.y<=elbow.y+.02;
 };
 const isHandPart=(part:Atlas['parts'][number])=>{
  if(!isUpperLimb(part))return false;
  const c=centerOfPart(part),n=norm(part.name);
  return handBone.test(n)||/thenar|hypothenar|lumbrical|interosse|palmar|digital|thumb|finger/.test(n)||c.y<=neutralWrist.y+.035;
 };
 const isPronating=(part:Atlas['parts'][number])=>{
  const n=norm(part.name),c=centerOfPart(part);
  if(!isDistalToElbow(part))return false;
  if(n===norm(`${cap} ulna`))return false;
  return n===norm(`${cap} radius`)||c.y<1.10||handBone.test(n);
 };

 for(const part of atlas.parts){
  if(trunkAnchored(part))continue;
  if(scapulohumeral(part)&&onSide(part)){transforms[part.id]=rigid(cuffShoulderM);continue;}
  if(crossesShoulder(part)&&onSide(part)){transforms[part.id]=rigid(softShoulderM);continue;}
  if(upperArmMuscle(part)&&onSide(part)){transforms[part.id]=rigid(shoulderM);continue;}
  if(forearmMuscle(part)&&onSide(part)){transforms[part.id]=rigid(elbowM);continue;}
  if(!isUpperLimb(part))continue;
  if(isHandPart(part)){transforms[part.id]=rigid(wristM);continue;}
  if(isPronating(part)){transforms[part.id]=rigid(forearmM);continue;}
  transforms[part.id]=rigid(isDistalToElbow(part)?elbowM:shoulderM);
 }

 return{transforms,warnings};
}
