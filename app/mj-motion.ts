import * as T from 'three';
import type {Atlas,PartTransform} from './anatomy';
import boneBindings from './biomechanics-v2/bone-bindings.json';

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

// These limits intentionally stay a little conservative. The web atlas is a
// surface reference, not a skinned biomechanical model; conservative limits
// prevent anatomically impossible-looking combined rotations and self-crossing.
export const MOTION_LIMITS={
 shoulderAbduction:[0,145],
 shoulderFlexion:[-45,150],
 shoulderRotation:[-25,35],
 elbowFlexion:[0,135],
 forearmRotation:[-45,45],
 wristFlexion:[-45,45],
 wristDeviation:[-8,8]
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

/**
 * Educational upper-limb kinematics.
 *
 * The model uses a simplified scapulohumeral rhythm and attachment-aware soft
 * tissue deformation. It is deliberately conservative: the goal is to keep the
 * atlas anatomically legible while showing realistic relationships, not to
 * claim patient-specific biomechanics.
 */
export function buildUpperLimbMotion(atlas:Atlas,side:Side,input:MotionPose){
 const cap=side[0].toUpperCase()+side.slice(1);
 const humerus=exact(atlas,`${cap} humerus`),scapula=exact(atlas,`${cap} scapula`),clavicle=exact(atlas,`${cap} clavicle`),radius=exact(atlas,`${cap} radius`),ulna=exact(atlas,`${cap} ulna`);
 const warnings:string[]=[];
 if(humerus.length!==1||scapula.length!==1||clavicle.length!==1||radius.length!==1||ulna.length!==1){
  warnings.push(`Upper-limb bone mapping incomplete for ${side} side.`);
  return{transforms:{} as Record<string,PartTransform>,warnings};
 }

 const handIds=new Set([...boneBindings[side].carpus,...boneBindings[side].hand].map(p=>p.id));
 const handIndices=atlas.parts.map((p,i)=>({p,i})).filter(({p})=>handIds.has(p.id)&&p.system==='skeletal').map(({i})=>i);

 const humerusBox=boxFor(atlas,humerus),scapulaBox=boxFor(atlas,scapula),clavicleBox=boxFor(atlas,clavicle);
 const shoulderCandidates=longEndpoints(humerusBox);
 const shoulder=nearer(shoulderCandidates[0],shoulderCandidates[1],boxCenter(atlas,scapula));
 const forearmBox=boxFor(atlas,[...radius,...ulna]),forearmEnds=longEndpoints(forearmBox),humerusEnds=longEndpoints(humerusBox);
 const neutralHandCenter=handIndices.length?boxCenter(atlas,handIndices):forearmBox.getCenter(new T.Vector3()).add(new T.Vector3(0,-.22,0));
 const neutralWrist=nearer(forearmEnds[0],forearmEnds[1],neutralHandCenter);

 let elbow=new T.Vector3(),best=Infinity;
 for(const h of humerusEnds)for(const f of forearmEnds){const d=h.distanceToSquared(f);if(d<best){best=d;elbow.copy(h).add(f).multiplyScalar(.5);}}
 const radiusEnds=longEndpoints(boxFor(atlas,radius)),ulnaEnds=longEndpoints(boxFor(atlas,ulna));
 const neutralRadialHead=nearer(radiusEnds[0],radiusEnds[1],elbow);
 const neutralUlnarHead=nearer(ulnaEnds[0],ulnaEnds[1],neutralHandCenter);

 const superior=shoulder.clone().sub(elbow).normalize();
 const lateral=new T.Vector3(side==='right'?-1:1,0,0);
 const abductionAxis=lateral.clone().cross(superior).normalize();if(abductionAxis.lengthSq()<.5)abductionAxis.set(0,0,side==='right'?-1:1);
 const worldAnterior=new T.Vector3(0,0,1),shoulderFlexSign=side==='right'?1:-1,shoulderRotationSign=side==='right'?-1:1;
 const p=constrainPose(input);

 // Flexion and abduction are treated as a single plane-of-elevation rotation
 // (rotation-vector composition). This avoids the non-physiological twisting
 // produced by successively rotating around already-rotated world axes.
 const abdRad=T.MathUtils.degToRad(p.shoulderAbduction),flexRad=T.MathUtils.degToRad(p.shoulderFlexion*shoulderFlexSign);
 const rotationVector=abductionAxis.clone().multiplyScalar(abdRad).add(lateral.clone().multiplyScalar(flexRad));
 const requestedSwing=rotationVector.length(),maxSwing=T.MathUtils.degToRad(165),swingRad=Math.min(requestedSwing,maxSwing);
 const swingAxis=requestedSwing>.00001?rotationVector.normalize():abductionAxis.clone();
 const shoulderSwingQ=new T.Quaternion().setFromAxisAngle(swingAxis,swingRad).normalize();
 const elevation=T.MathUtils.radToDeg(swingRad);

 // Scapulohumeral rhythm: little scapular motion in the first ~30 degrees,
 // then a progressive scapular contribution, reaching roughly 55-60 degrees
 // at high elevation. The scapula upwardly rotates instead of copying the
 // humeral rotation axis; flexion adds a modest posterior tilt.
 const upwardElevation=Math.hypot(p.shoulderAbduction,Math.max(0,p.shoulderFlexion));
 const scapularUp=T.MathUtils.clamp((upwardElevation-30)*.43,0,58);
 const posteriorTilt=T.MathUtils.clamp(Math.max(0,p.shoulderFlexion-35)*.09,0,12);
 const scapulaUpQ=qdeg(abductionAxis,scapularUp);
 const scapulaTiltQ=qdeg(lateral,posteriorTilt*shoulderFlexSign);
 const scapulaQ=scapulaTiltQ.clone().multiply(scapulaUpQ).normalize();
 const clavicularElevation=T.MathUtils.clamp(scapularUp*.30,0,16);
 const clavicleQ=qdeg(abductionAxis,clavicularElevation);

 // Approximate SC/AC pivots from the clavicle itself. The scapula follows the
 // moving AC end so the shoulder girdle remains connected during elevation.
 const clavicleEnds=longEndpoints(clavicleBox),clavicleCenter=clavicleBox.getCenter(new T.Vector3());
 const scJoint=nearer(clavicleEnds[0],clavicleEnds[1],new T.Vector3(0,clavicleCenter.y,clavicleCenter.z));
 const acJoint=scJoint===clavicleEnds[0]?clavicleEnds[1]:clavicleEnds[0];
 const clavicleM=about(scJoint,clavicleQ);
 const movedAc=acJoint.clone().applyMatrix4(clavicleM),acShift=movedAc.clone().sub(acJoint);
 const scapulaRotateM=about(acJoint,scapulaQ);
 const scapulaM=new T.Matrix4().makeTranslation(acShift.x,acShift.y,acShift.z).multiply(scapulaRotateM);

 // The humeral head follows the moving glenoid. Remaining glenohumeral motion
 // is the total requested swing after removing the scapular contribution.
 const movedShoulder=shoulder.clone().applyMatrix4(scapulaM);
 const glenohumeralQ=shoulderSwingQ.clone().multiply(scapulaQ.clone().invert()).normalize();
 const swingM=about(movedShoulder,glenohumeralQ).multiply(scapulaM);

 // Axial humeral rotation is applied after elevation and kept conservative.
 const axialAxis=superior.clone().applyQuaternion(shoulderSwingQ).normalize();
 const axialScale=T.MathUtils.lerp(1,.68,T.MathUtils.clamp(elevation/165,0,1));
 const axialAmount=p.shoulderRotation*shoulderRotationSign*axialScale;
 const qAxial=qdeg(axialAxis,axialAmount);
 const shoulderQ=qAxial.clone().multiply(shoulderSwingQ).normalize();
 const shoulderM=about(movedShoulder,qAxial).multiply(swingM);

 const movedElbow=elbow.clone().applyMatrix4(shoulderM);
 const movedLateral=lateral.clone().applyQuaternion(shoulderQ).normalize();
 const movedAnterior=worldAnterior.clone().applyQuaternion(shoulderQ).normalize();
 const neutralForearmCenter=forearmBox.getCenter(new T.Vector3()).applyMatrix4(shoulderM);

 // Elbow remains a hinge. Pick the sign that moves the forearm anteriorly and
 // allow only a small amount of hyperextension.
 const testQ=qdeg(movedLateral,5);
 const testPoint=neutralForearmCenter.clone().sub(movedElbow).applyQuaternion(testQ).add(movedElbow);
 const flexSign=testPoint.clone().sub(neutralForearmCenter).dot(movedAnterior)>=0?1:-1;
 const elbowQ=qdeg(movedLateral,p.elbowFlexion*flexSign);
 const elbowM=about(movedElbow,elbowQ).multiply(shoulderM);

 // Pronation/supination follows the anatomical longitudinal axis from the
 // radial head proximally toward the ulnar head distally. The ulna stays with
 // elbow flexion while the radius and hand rotate around this axis.
 const movedRadialHead=neutralRadialHead.clone().applyMatrix4(elbowM);
 const movedUlnarHead=neutralUlnarHead.clone().applyMatrix4(elbowM);
 const forearmAxis=movedUlnarHead.clone().sub(movedRadialHead).normalize();
 const forearmQ=qdeg(forearmAxis,p.forearmRotation);
 const forearmM=about(movedRadialHead,forearmQ).multiply(elbowM);

 const movedWrist=neutralWrist.clone().applyMatrix4(forearmM);
 const elbowWorldQ=elbowQ.clone().multiply(shoulderQ).normalize();
 const forearmWorldQ=forearmQ.clone().multiply(elbowWorldQ).normalize();
 const wristFlexAxis=lateral.clone().applyQuaternion(forearmWorldQ).normalize();
 const wristDeviationAxis=forearmAxis.clone().cross(wristFlexAxis).normalize();
 const wristQ=qdeg(wristFlexAxis,p.wristFlexion).multiply(qdeg(wristDeviationAxis,p.wristDeviation)).normalize();
 const wristM=about(movedWrist,wristQ).multiply(forearmM);

 // Soft tissues are deformed in scene.tsx from a shared bind-space field.
 // Emit bone-only transforms; never rotate muscle heads as separate rigid lumps.
 const transforms:Record<string,PartTransform>={};
 const matrices={clavicle:clavicleM,scapula:scapulaM,humerus:shoulderM,ulna:elbowM,radius:forearmM,carpus:wristM,hand:wristM};
 for(const [group,entries] of Object.entries(boneBindings[side]))for(const entry of entries){
  const part=atlas.parts.find(p=>p.id===entry.id&&p.name===entry.name&&p.system==='skeletal');
  if(!part){warnings.push(`Bone binding missing: ${entry.name}`);continue;}
  transforms[part.id]=rigid(matrices[group as keyof typeof matrices]);
 }
 return{transforms,warnings};
}
