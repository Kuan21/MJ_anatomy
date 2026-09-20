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

// These limits intentionally stay a little conservative. The web atlas is a
// surface reference, not a skinned biomechanical model; conservative limits
// prevent anatomically impossible-looking combined rotations and self-crossing.
export const MOTION_LIMITS={
 shoulderAbduction:[0,165],
 shoulderFlexion:[-40,165],
 shoulderRotation:[-35,45],
 elbowFlexion:[-5,140],
 forearmRotation:[-75,75],
 wristFlexion:[-60,60],
 wristDeviation:[-20,25]
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
const deform=(moving:T.Matrix4,anchor:T.Matrix4):PartTransform=>{
 const a=rigid(anchor),b=rigid(moving);
 return{...b,anchorTranslation:a.translation,anchorQuaternion:a.quaternion};
};
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

 const handBone=/metacarpal|phalanx|carpal|scaphoid|lunate|triquetr|pisiform|trapezium|trapezoid|capitate|hamate/;
 const handIndices=atlas.parts.map((p,i)=>({p,i})).filter(({p})=>{
  if(p.system!=='skeletal')return false;
  const c=centerOfPart(p),correctSide=side==='right'?c.x<-.04:c.x>.04;
  return correctSide&&handBone.test(norm(p.name));
 }).map(x=>x.i);

 const humerusBox=boxFor(atlas,humerus),scapulaBox=boxFor(atlas,scapula),clavicleBox=boxFor(atlas,clavicle);
 const shoulderCandidates=longEndpoints(humerusBox);
 const shoulder=nearer(shoulderCandidates[0],shoulderCandidates[1],boxCenter(atlas,scapula));
 const forearmBox=boxFor(atlas,[...radius,...ulna]),forearmEnds=longEndpoints(forearmBox),humerusEnds=longEndpoints(humerusBox);
 const neutralHandCenter=handIndices.length?boxCenter(atlas,handIndices):forearmBox.getCenter(new T.Vector3()).add(new T.Vector3(0,-.22,0));
 const neutralWrist=nearer(forearmEnds[0],forearmEnds[1],neutralHandCenter);

 let elbow=new T.Vector3(),best=Infinity;
 for(const h of humerusEnds)for(const f of forearmEnds){const d=h.distanceToSquared(f);if(d<best){best=d;elbow.copy(h).add(f).multiplyScalar(.5);}}

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
 const scapularUp=T.MathUtils.clamp((elevation-30)*.43,0,58);
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

 // Pronation/supination is applied around the forearm long axis. The ulna is
 // kept with the hinge transform while the radius/hand rotate around it.
 const distalCenter=forearmBox.getCenter(new T.Vector3()).applyMatrix4(elbowM);
 const forearmAxis=movedElbow.clone().sub(distalCenter).normalize();
 const forearmQ=qdeg(forearmAxis,p.forearmRotation);
 const forearmM=about(movedElbow,forearmQ).multiply(elbowM);

 const movedWrist=neutralWrist.clone().applyMatrix4(forearmM);
 const elbowWorldQ=elbowQ.clone().multiply(shoulderQ).normalize();
 const forearmWorldQ=forearmQ.clone().multiply(elbowWorldQ).normalize();
 const wristFlexAxis=lateral.clone().applyQuaternion(forearmWorldQ).normalize();
 const wristDeviationAxis=forearmAxis.clone().cross(wristFlexAxis).normalize();
 const wristQ=qdeg(wristFlexAxis,p.wristFlexion).multiply(qdeg(wristDeviationAxis,p.wristDeviation)).normalize();
 const wristM=about(movedWrist,wristQ).multiply(forearmM);

 const identityM=new T.Matrix4();
 const transforms:Record<string,PartTransform>={};
 const onSide=(part:Atlas['parts'][number])=>{
  const name=norm(part.name);
  if(/\bright\b/.test(name))return side==='right';
  if(/\bleft\b/.test(name))return side==='left';
  const c=centerOfPart(part);if(Math.abs(c.x)<.02)return false;
  return side==='right'?c.x<0:c.x>0;
 };
 const exactName=(part:Atlas['parts'][number],needle:string)=>norm(part.name)===norm(`${cap} ${needle}`);

 const deltoid=(part:Atlas['parts'][number])=>/deltoid/.test(norm(part.name));
 const cuff=(part:Atlas['parts'][number])=>/supraspinatus|infraspinatus|subscapularis|teres minor/.test(norm(part.name));
 const trunkToScapula=(part:Atlas['parts'][number])=>/pectoralis minor|serratus anterior|trapezius|rhomboid|levator scapulae/.test(norm(part.name));
 const trunkToClavicle=(part:Atlas['parts'][number])=>/subclavius/.test(norm(part.name));
 const trunkToHumerus=(part:Atlas['parts'][number])=>/pectoralis major|latissimus dorsi|teres major/.test(norm(part.name));
 const biceps=(part:Atlas['parts'][number])=>/biceps brachii/.test(norm(part.name));
 const triceps=(part:Atlas['parts'][number])=>/triceps brachii/.test(norm(part.name));
 const brachialis=(part:Atlas['parts'][number])=>/\bbrachialis\b/.test(norm(part.name))&&!/brachioradialis/.test(norm(part.name));
 const coracobrachialis=(part:Atlas['parts'][number])=>/coracobrachialis/.test(norm(part.name));
 const brachioradialis=(part:Atlas['parts'][number])=>/brachioradialis/.test(norm(part.name));
 const forearmRotator=(part:Atlas['parts'][number])=>/pronator teres|pronator quadratus|supinator/.test(norm(part.name));
 const wristCrosser=(part:Atlas['parts'][number])=>/flexor carpi|palmaris longus|flexor digitorum|flexor pollicis longus|extensor carpi|extensor digitorum|extensor digiti minimi|extensor pollicis|extensor indicis|abductor pollicis longus/.test(norm(part.name));
 const forearmMuscle=(part:Atlas['parts'][number])=>/pronator|supinator|flexor|extensor|palmaris/.test(norm(part.name));
 const vascular=(part:Atlas['parts'][number])=>part.system==='arterial'||part.system==='venous';
 const upperLimbVascular=(part:Atlas['parts'][number])=>centerOfPart(part).y>.68&&/subclavian|axillary|brachial|radial|ulnar|interosseous|palmar|digital|metacarpal|carpal|cephalic|basilic|median cubital|median antebrachial|circumflex humeral|thoraco-acromial|lateral thoracic|subscapular|suprascapular|thoracodorsal|dorsal scapular|princeps pollicis|radialis indicis/.test(norm(part.name));
 const thoraxStatic=(part:Atlas['parts'][number])=>/rib|sternum|intercostal|costal cartilage|thoracic fascia|pectoral fascia|clavipectoral fascia|endothoracic|pleura|diaphragm|rectus sheath|linea alba|intervertebral/.test(norm(part.name));
 const specialShoulder=(part:Atlas['parts'][number])=>deltoid(part)||cuff(part)||trunkToScapula(part)||trunkToClavicle(part)||trunkToHumerus(part)||biceps(part)||triceps(part)||brachialis(part)||coracobrachialis(part);
 const forearmBand=(part:Atlas['parts'][number])=>{const c=centerOfPart(part);return c.y>.74&&c.y<1.20&&Math.abs(c.x)>.13;};

 const isProximalBundle=(part:Atlas['parts'][number])=>{
  const c=centerOfPart(part),name=norm(part.name);
  return c.y>1.27&&/(ligament|retinaculum|fascia|aponeurosis)/.test(name);
 };
 const isUpperLimb=(part:Atlas['parts'][number])=>{
  const c=centerOfPart(part),name=norm(part.name);
  if(!onSide(part)||c.y<.62||c.y>1.46)return false;
  if(part.system==='nervous'||part.system==='integumentary'||vascular(part))return false;
  if(specialShoulder(part)||thoraxStatic(part))return false;
  if(/scapula|clavicle/.test(name))return false;
  if(isProximalBundle(part))return false;
  if(/humerus|radius|ulna/.test(name)||handBone.test(name))return true;
  // Do not use a broad coordinate fallback here: hip/thigh structures occupy
  // overlapping Y ranges in this atlas and were previously dragged with the
  // arm. Only explicitly upper-limb connective/soft structures may follow.
  return /forearm|wrist|hand|digital|palmar|antebrachial|brachial|flexor retinaculum|interosseous membrane/.test(name);
 };
 const isDistalToElbow=(part:Atlas['parts'][number])=>{
  const c=centerOfPart(part),name=norm(part.name);
  if(!isUpperLimb(part))return false;
  if(/radius|ulna/.test(name)||handBone.test(name))return true;
  return c.y<=elbow.y+.02;
 };
 const isHandPart=(part:Atlas['parts'][number])=>{
  if(!isUpperLimb(part))return false;
  const c=centerOfPart(part),name=norm(part.name);
  return handBone.test(name)||/thenar|hypothenar|lumbrical|interosse|palmar|digital|thumb|finger/.test(name)||c.y<=neutralWrist.y+.035;
 };
 const isPronating=(part:Atlas['parts'][number])=>{
  const name=norm(part.name),c=centerOfPart(part);
  if(!isDistalToElbow(part))return false;
  if(name===norm(`${cap} ulna`))return false;
  return name===norm(`${cap} radius`)||c.y<1.10||handBone.test(name);
 };

 const vesselTransform=(part:Atlas['parts'][number])=>{
  const name=norm(part.name),c=centerOfPart(part);
  // Scapular branches remain related to the moving scapula rather than the
  // humeral shaft.
  if(/suprascapular|dorsal scapular|circumflex scapular|thoracodorsal/.test(name))return deform(scapulaM,identityM);
  // Subclavian vessels are anchored to the root of the neck and follow only
  // the lateral clavicular end.
  if(/subclavian/.test(name))return deform(clavicleM,identityM);
  // Axillary/circumflex vessels bridge trunk/shoulder to the arm.
  if(c.y>1.30||/axillary|circumflex humeral|thoraco-acromial|lateral thoracic|subscapular/.test(name))return deform(shoulderM,identityM);
  // Brachial and superficial arm vessels bend from humerus to elbow.
  if(c.y>1.08)return deform(elbowM,shoulderM);
  // Forearm vessels rotate with the radius/ulna relationship while remaining
  // connected at the cubital fossa.
  if(c.y>.88)return deform(forearmM,elbowM);
  // Carpal branches bridge the moving wrist; digital/palmar vessels then move
  // rigidly with the hand so the vascular tree stays continuous.
  if(c.y>.80)return deform(wristM,forearmM);
  return rigid(wristM);
 };

 for(const part of atlas.parts){
  if(exactName(part,'scapula')){transforms[part.id]=rigid(scapulaM);continue;}
  if(exactName(part,'clavicle')){transforms[part.id]=rigid(clavicleM);continue;}
  if(!onSide(part)||thoraxStatic(part))continue;

  // Vessels are treated as continuous soft tubes rather than disconnected
  // rigid fragments. scene.tsx blends each segment between these transforms.
  if(vascular(part)){if(upperLimbVascular(part))transforms[part.id]=vesselTransform(part);continue;}

  // Shoulder-girdle muscles preserve their anatomical attachments.
  if(deltoid(part)){
   const anchor=/clavicular part/.test(norm(part.name))?clavicleM:scapulaM;
   transforms[part.id]=deform(shoulderM,anchor);continue;
  }
  if(cuff(part)){transforms[part.id]=deform(shoulderM,scapulaM);continue;}
  if(trunkToScapula(part)){
   // Keep broad trunk-origin muscles visually continuous on this rigid atlas.
   // Their true shortening/bulging needs a skinned or volumetric model.
   if(/pectoralis minor|serratus anterior|trapezius|rhomboid|levator scapulae/.test(norm(part.name)))continue;
   transforms[part.id]=rigid(clavicleM);continue;
  }
  if(trunkToClavicle(part)){transforms[part.id]=rigid(clavicleM);continue;}
  if(trunkToHumerus(part)){
   // Pectoralis major / latissimus / teres major previously became large
   // triangular sheets during elevation. Preserve thoracic coverage instead
   // of stretching the rigid source mesh across the moving shoulder.
   if(/pectoralis major|latissimus dorsi/.test(norm(part.name)))continue;
   transforms[part.id]=deform(shoulderM,scapulaM);continue;
  }

  // Muscles crossing joints are blended from their origin-side transform to
  // their insertion-side transform, so they elongate/curve rather than detach.
  if(biceps(part)){transforms[part.id]=deform(forearmM,scapulaM);continue;}
  if(triceps(part)){
   const anchor=/long head/.test(norm(part.name))?scapulaM:shoulderM;
   transforms[part.id]=deform(elbowM,anchor);continue;
  }
  if(brachialis(part)){transforms[part.id]=deform(elbowM,shoulderM);continue;}
  if(coracobrachialis(part)){transforms[part.id]=deform(shoulderM,scapulaM);continue;}
  if(brachioradialis(part)&&forearmBand(part)){transforms[part.id]=deform(forearmM,shoulderM);continue;}
  if(wristCrosser(part)&&forearmBand(part)){transforms[part.id]=deform(wristM,elbowM);continue;}
  if(forearmRotator(part)&&forearmBand(part)){transforms[part.id]=deform(forearmM,elbowM);continue;}
  if(forearmMuscle(part)&&forearmBand(part)){transforms[part.id]=deform(forearmM,elbowM);continue;}

  if(!isUpperLimb(part))continue;
  if(isHandPart(part)){transforms[part.id]=rigid(wristM);continue;}
  if(isPronating(part)){transforms[part.id]=rigid(forearmM);continue;}
  transforms[part.id]=rigid(isDistalToElbow(part)?elbowM:shoulderM);
 }

 return{transforms,warnings};
}
