import * as T from 'three';
import type {Atlas,PartTransform} from './anatomy';
import boneBindings from './biomechanics-v2/bone-bindings.json';
import shoulderLandmarks from './biomechanics-v2/shoulder-landmarks.json';
import forearmLandmarks from './biomechanics-v2/forearm-landmarks.json';
import scapularContact from './biomechanics-v2/scapular-contact.json';

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
 shoulderAbduction:[-20,165],
 shoulderFlexion:[-60,165],
 shoulderRotation:[-60,70],
 elbowFlexion:[-5,140],
 forearmRotation:[-80,80],
 wristFlexion:[-70,80],
 wristDeviation:[-30,20]
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

// Keep the blade centre on its source thoracic shell while preserving the
// clavicle length and both joint pivots. This is a geometric guide, not a
// patient-specific collision or muscle-force simulation.
function contactGirdle(atlas:Atlas,side:Side,sc:T.Vector3,ac:T.Vector3,up:number,tilt:T.Quaternion,desired:T.Matrix4){
 const fit=scapularContact.sides[side],centre=new T.Vector3(...fit.centre),normal=new T.Vector3(...fit.normal);
 if(!atlas.parts.some(p=>p.id===fit.scapulaId&&p.system==='skeletal'))throw new Error('Scapular contact/source mismatch');
 const ribs=new T.Box3();for(const p of atlas.parts)if(p.system==='skeletal'&&/ rib$/i.test(p.name))ribs.union(new T.Box3(new T.Vector3(...p.bounds[0]),new T.Vector3(...p.bounds[1])));
 const rx=Math.max(Math.abs(ribs.min.x),Math.abs(ribs.max.x)),rz=(ribs.max.z-ribs.min.z)/2,cz=(ribs.min.z+ribs.max.z)/2;
 const theta0=Math.atan2((centre.z-cz)/rz,centre.x/rx),rad=Math.hypot(centre.x/rx,(centre.z-cz)/rz),wanted=centre.clone().applyMatrix4(desired);
 const thetaWanted=theta0+Math.atan2(Math.sin(Math.atan2((wanted.z-cz)/rz,wanted.x/rx)-theta0),Math.cos(Math.atan2((wanted.z-cz)/rz,wanted.x/rx)-theta0));
 if(side==='right')normal.negate();
 const local=tilt.clone().multiply(qdeg(normal,up)),restAc=ac.clone().sub(centre),restNormal=new T.Vector3(Math.cos(theta0)/rx,0,Math.sin(theta0)/rz).normalize(),length=sc.distanceTo(ac);
 const candidate=(theta:number)=>{
  const surfaceNormal=new T.Vector3(Math.cos(theta)/rx,0,Math.sin(theta)/rz).normalize(),rotation=new T.Quaternion().setFromUnitVectors(restNormal,surfaceNormal).multiply(local);
  const point=new T.Vector3(rx*rad*Math.cos(theta),0,cz+rz*rad*Math.sin(theta)),offset=restAc.clone().applyQuaternion(rotation),joint=point.clone().add(offset);
  const height2=length*length-(joint.x-sc.x)**2-(joint.z-sc.z)**2;
  if(height2<0)return{score:Infinity,point,rotation,joint};
  point.y=sc.y+Math.sqrt(height2)-offset.y;joint.y=sc.y+Math.sqrt(height2);
  const score=((theta-thetaWanted)*(rx+rz)/2)**2+(point.y-wanted.y)**2;
  return{score,point,rotation,joint};
 };
 let bestTheta=theta0,best=candidate(theta0);
 for(let i=-40;i<=40;i++){const theta=theta0+i*.02,result=candidate(theta);if(result.score<best.score){best=result;bestTheta=theta;}}
 let lo=bestTheta-.02,hi=bestTheta+.02;
 for(let i=0;i<28;i++){const a=lo+(hi-lo)/3,b=hi-(hi-lo)/3;if(candidate(a).score<candidate(b).score)hi=b;else lo=a;}
 const refined=candidate((lo+hi)/2);if(refined.score<best.score)best=refined;
 if(!Number.isFinite(best.score))throw new Error('No connected scapular contact solution');
 const scapula=new T.Matrix4().makeTranslation(...best.point.toArray()).multiply(new T.Matrix4().makeRotationFromQuaternion(best.rotation)).multiply(new T.Matrix4().makeTranslation(-centre.x,-centre.y,-centre.z));
 const clavicle=about(sc,new T.Quaternion().setFromUnitVectors(ac.clone().sub(sc).normalize(),best.joint.clone().sub(sc).normalize()));
 return{scapula,clavicle};
}

export function constrainPose(input:MotionPose):MotionPose{
 const p={
  shoulderAbduction:clamp(input.shoulderAbduction,MOTION_LIMITS.shoulderAbduction),
  shoulderFlexion:clamp(input.shoulderFlexion,MOTION_LIMITS.shoulderFlexion),
  shoulderRotation:clamp(input.shoulderRotation,MOTION_LIMITS.shoulderRotation),
  elbowFlexion:clamp(input.elbowFlexion,MOTION_LIMITS.elbowFlexion),
  forearmRotation:clamp(input.forearmRotation,MOTION_LIMITS.forearmRotation),
  wristFlexion:clamp(input.wristFlexion,MOTION_LIMITS.wristFlexion),
  wristDeviation:clamp(input.wristDeviation,MOTION_LIMITS.wristDeviation),
 };
 // A conservative combined-motion envelope, not independent maximum axes.
 // Keep the displayed pose identical to the pose used by bones and soft tissue.
 const swing=Math.hypot(p.shoulderAbduction,p.shoulderFlexion);
 if(swing>165){p.shoulderAbduction*=165/swing;p.shoulderFlexion*=165/swing;}
 const axialScale=1-.32*Math.min(1,Math.hypot(p.shoulderAbduction,p.shoulderFlexion)/165);
 p.shoulderRotation=T.MathUtils.clamp(p.shoulderRotation,MOTION_LIMITS.shoulderRotation[0]*axialScale,MOTION_LIMITS.shoulderRotation[1]*axialScale);
 const wristLoad=Math.hypot(p.wristFlexion/(p.wristFlexion>=0?80:70),p.wristDeviation/(p.wristDeviation>=0?20:30));
 if(wristLoad>1){p.wristFlexion/=wristLoad;p.wristDeviation/=wristLoad;}
 return p;
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
 // Rotate about the fitted articular head centre, not the top of the
 // humerus bounding box (which includes the lateral greater tuberosity).
 const landmark=shoulderLandmarks.sides[side];
 if(atlas.parts[humerus[0]].id!==landmark.humerusId||atlas.parts[scapula[0]].id!==landmark.scapulaId){
  return{transforms:{} as Record<string,PartTransform>,warnings:['Shoulder landmark/source mismatch.']};
 }
 const shoulder=new T.Vector3().fromArray(landmark.headCenter);
 const forearmBox=boxFor(atlas,[...radius,...ulna]),forearmEnds=longEndpoints(forearmBox),humerusEnds=longEndpoints(humerusBox);
 const neutralHandCenter=handIndices.length?boxCenter(atlas,handIndices):forearmBox.getCenter(new T.Vector3()).add(new T.Vector3(0,-.22,0));
 const forearmLandmark=forearmLandmarks.sides[side];
 if(atlas.parts[radius[0]].id!==forearmLandmark.radiusId||atlas.parts[ulna[0]].id!==forearmLandmark.ulnaId)return{transforms:{} as Record<string,PartTransform>,warnings:['Forearm landmark/source mismatch.']};
 const neutralWrist=new T.Vector3().fromArray(forearmLandmark.wrist);

 let elbow=new T.Vector3(),best=Infinity;
 for(const h of humerusEnds)for(const f of forearmEnds){const d=h.distanceToSquared(f);if(d<best){best=d;elbow.copy(h).add(f).multiplyScalar(.5);}}
 const neutralRadialHead=new T.Vector3().fromArray(forearmLandmark.radialHead);
 const neutralUlnarHead=new T.Vector3().fromArray(forearmLandmark.ulnarHead);

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
 let clavicleM=about(scJoint,clavicleQ);
 const movedAc=acJoint.clone().applyMatrix4(clavicleM),acShift=movedAc.clone().sub(acJoint);
 const scapulaRotateM=about(acJoint,scapulaQ);
 let scapulaM=new T.Matrix4().makeTranslation(acShift.x,acShift.y,acShift.z).multiply(scapulaRotateM);
 if(scapularUp>0){const contact=contactGirdle(atlas,side,scJoint,acJoint,scapularUp,scapulaTiltQ,scapulaM);scapulaM=contact.scapula;clavicleM=contact.clavicle;}

 // The humeral head follows the moving glenoid. Remaining glenohumeral motion
 // is the total requested swing after removing the scapular contribution.
 const movedShoulder=shoulder.clone().applyMatrix4(scapulaM);
 const swingM=new T.Matrix4().makeTranslation(movedShoulder.x,movedShoulder.y,movedShoulder.z).multiply(new T.Matrix4().makeRotationFromQuaternion(shoulderSwingQ)).multiply(new T.Matrix4().makeTranslation(-shoulder.x,-shoulder.y,-shoulder.z));

 // Axial humeral rotation is applied after elevation and kept conservative.
 const axialAxis=superior.clone().applyQuaternion(shoulderSwingQ).normalize();
 const axialAmount=p.shoulderRotation*shoulderRotationSign;
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
 // Mirrored limbs need opposite axial signs for the same named motion.
 const forearmQ=qdeg(forearmAxis,p.forearmRotation*(side==='right'?-1:1));
 const forearmM=about(movedRadialHead,forearmQ).multiply(elbowM);

 const movedWrist=neutralWrist.clone().applyMatrix4(forearmM);
 const elbowWorldQ=elbowQ.clone().multiply(shoulderQ).normalize();
 const forearmWorldQ=forearmQ.clone().multiply(elbowWorldQ).normalize();
 const wristFlexAxis=lateral.clone().applyQuaternion(forearmWorldQ).normalize();
 const wristDeviationAxis=forearmAxis.clone().cross(wristFlexAxis).normalize();
 // Positive flexion moves both palms anteriorly; positive deviation is ulnar.
 const wristQ=qdeg(wristFlexAxis,p.wristFlexion*shoulderFlexSign).multiply(qdeg(wristDeviationAxis,-p.wristDeviation)).normalize();
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
