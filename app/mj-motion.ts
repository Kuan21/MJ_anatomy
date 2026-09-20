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
 shoulderAbduction:[0,165],
 shoulderFlexion:[-45,170],
 shoulderRotation:[-45,60],
 elbowFlexion:[-5,140],
 forearmRotation:[-80,80],
 wristFlexion:[-65,65],
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
 * Educational upper-limb kinematic model.
 *
 * The shoulder is no longer treated as a humerus rotating against a fixed
 * thorax. Elevation is split between glenohumeral motion and a simplified
 * scapulothoracic/clavicular contribution. Soft tissues can carry two rigid
 * transforms (an anatomical anchor and a moving insertion); scene.tsx blends
 * their vertices between those transforms so muscles do not detach as one
 * rigid block.
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

 // Total humeral swing in the requested plane.
 const qAbduction=qdeg(abductionAxis,p.shoulderAbduction);
 const flexionAxis=lateral.clone().applyQuaternion(qAbduction).normalize();
 const qFlexion=qdeg(flexionAxis,p.shoulderFlexion*shoulderFlexSign);
 const shoulderSwingQ=qFlexion.clone().multiply(qAbduction).normalize();

 // Simplified scapulohumeral rhythm:
 // first ~30 degrees are predominantly glenohumeral; above that the scapula
 // contributes progressively, approaching ~60 degrees near full elevation.
 const swingAngle=T.MathUtils.radToDeg(2*Math.acos(T.MathUtils.clamp(Math.abs(shoulderSwingQ.w),0,1)));
 const elevationDemand=Math.min(180,Math.hypot(Math.max(0,p.shoulderAbduction),Math.max(0,p.shoulderFlexion)));
 const scapularAngle=T.MathUtils.clamp((elevationDemand-30)/2.5,0,60);
 const scapularFraction=swingAngle>.001?T.MathUtils.clamp(scapularAngle/swingAngle,0,.42):0;
 const clavicularAngle=Math.min(20,scapularAngle*.35);
 const clavicularFraction=swingAngle>.001?T.MathUtils.clamp(clavicularAngle/swingAngle,0,.18):0;
 const identityQ=new T.Quaternion();
 const scapulaQ=new T.Quaternion().slerpQuaternions(identityQ,shoulderSwingQ,scapularFraction).normalize();
 const clavicleQ=new T.Quaternion().slerpQuaternions(identityQ,shoulderSwingQ,clavicularFraction).normalize();

 // Approximate sternoclavicular and acromioclavicular ends from the clavicle's
 // long axis. The scapula follows the moved AC end, keeping the shoulder girdle
 // mechanically connected instead of leaving the scapula fixed to the thorax.
 const clavicleEnds=longEndpoints(clavicleBox),clavicleCenter=clavicleBox.getCenter(new T.Vector3());
 const scJoint=nearer(clavicleEnds[0],clavicleEnds[1],new T.Vector3(0,clavicleCenter.y,clavicleCenter.z));
 const acJoint=scJoint===clavicleEnds[0]?clavicleEnds[1]:clavicleEnds[0];
 const clavicleM=about(scJoint,clavicleQ);
 const movedAc=acJoint.clone().applyMatrix4(clavicleM),acShift=movedAc.clone().sub(acJoint);
 const scapulaRotateM=about(acJoint,scapulaQ);
 const scapulaM=new T.Matrix4().makeTranslation(acShift.x,acShift.y,acShift.z).multiply(scapulaRotateM);

 // Humeral head follows the moving glenoid, then completes the remaining
 // glenohumeral swing. The resulting world orientation still equals the user's
 // requested total shoulder swing.
 const movedShoulder=shoulder.clone().applyMatrix4(scapulaM);
 const glenohumeralQ=shoulderSwingQ.clone().multiply(scapulaQ.clone().invert()).normalize();
 const swingM=about(movedShoulder,glenohumeralQ).multiply(scapulaM);
 const axialAxis=superior.clone().applyQuaternion(shoulderSwingQ).normalize();
 const qAxial=qdeg(axialAxis,p.shoulderRotation*shoulderRotationSign);
 const shoulderQ=qAxial.clone().multiply(shoulderSwingQ).normalize();
 const shoulderM=about(movedShoulder,qAxial).multiply(swingM);

 const movedElbow=elbow.clone().applyMatrix4(shoulderM);
 const movedLateral=lateral.clone().applyQuaternion(shoulderQ).normalize();
 const movedAnterior=worldAnterior.clone().applyQuaternion(shoulderQ).normalize();
 const neutralForearmCenter=forearmBox.getCenter(new T.Vector3()).applyMatrix4(shoulderM);

 // Elbow hinge: choose the sign that moves the forearm anteriorly.
 const testQ=qdeg(movedLateral,5);
 const testPoint=neutralForearmCenter.clone().sub(movedElbow).applyQuaternion(testQ).add(movedElbow);
 const flexSign=testPoint.clone().sub(neutralForearmCenter).dot(movedAnterior)>=0?1:-1;
 const elbowQ=qdeg(movedLateral,p.elbowFlexion*flexSign);
 const elbowM=about(movedElbow,elbowQ).multiply(shoulderM);

 // Radius/hand rotation for pronation-supination.
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

 const identityM=new T.Matrix4();
 const transforms:Record<string,PartTransform>={};
 const onSide=(part:Atlas['parts'][number])=>{
  const n=norm(part.name);
  if(/\bright\b/.test(n))return side==='right';
  if(/\bleft\b/.test(n))return side==='left';
  const c=centerOfPart(part);if(Math.abs(c.x)<.02)return false;
  return side==='right'?c.x<0:c.x>0;
 };
 const exactName=(part:Atlas['parts'][number],needle:string)=>norm(part.name)===norm(`${cap} ${needle}`);

 const deltoid=(part:Atlas['parts'][number])=>/deltoid/.test(norm(part.name));
 const cuff=(part:Atlas['parts'][number])=>/supraspinatus|infraspinatus|subscapularis|teres major|teres minor/.test(norm(part.name));
 const trunkToScapula=(part:Atlas['parts'][number])=>/pectoralis minor|serratus anterior|trapezius|rhomboid|levator scapulae/.test(norm(part.name));
 const trunkToClavicle=(part:Atlas['parts'][number])=>/subclavius/.test(norm(part.name));
 const trunkToHumerus=(part:Atlas['parts'][number])=>/pectoralis major|latissimus dorsi/.test(norm(part.name));
 const biceps=(part:Atlas['parts'][number])=>/biceps brachii/.test(norm(part.name));
 const triceps=(part:Atlas['parts'][number])=>/triceps brachii/.test(norm(part.name));
 const brachialis=(part:Atlas['parts'][number])=>/\bbrachialis\b/.test(norm(part.name))&&!/brachioradialis/.test(norm(part.name));
 const coracobrachialis=(part:Atlas['parts'][number])=>/coracobrachialis/.test(norm(part.name));
 const forearmRotator=(part:Atlas['parts'][number])=>/brachioradialis|pronator teres|pronator quadratus|supinator/.test(norm(part.name));
 const wristCrosser=(part:Atlas['parts'][number])=>/flexor carpi|palmaris longus|flexor digitorum|flexor pollicis longus|extensor carpi|extensor digitorum|extensor digiti minimi|extensor pollicis|extensor indicis|abductor pollicis longus/.test(norm(part.name));
 const forearmMuscle=(part:Atlas['parts'][number])=>/brachioradialis|pronator|supinator|flexor|extensor|palmaris/.test(norm(part.name));
 const specialShoulder=(part:Atlas['parts'][number])=>deltoid(part)||cuff(part)||trunkToScapula(part)||trunkToClavicle(part)||trunkToHumerus(part)||biceps(part)||triceps(part)||brachialis(part)||coracobrachialis(part);

 const isProximalBundle=(part:Atlas['parts'][number])=>{
  const c=centerOfPart(part),n=norm(part.name);
  return c.y>1.27&&/(artery|vein|nerve|plexus|ligament|retinaculum|fascia|aponeurosis)/.test(n);
 };
 const isUpperLimb=(part:Atlas['parts'][number])=>{
  const c=centerOfPart(part),ax=Math.abs(c.x),n=norm(part.name);
  if(!onSide(part)||c.y<.62||c.y>1.46)return false;
  if(part.system==='nervous')return false;
  if(specialShoulder(part))return false;
  if(/scapula|clavicle|sternum|rib/.test(n))return false;
  if(isProximalBundle(part))return false;
  if(/humerus|radius|ulna/.test(n)||handBone.test(n))return true;
  return ax>.13;
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
  if(exactName(part,'scapula')){transforms[part.id]=rigid(scapulaM);continue;}
  if(exactName(part,'clavicle')){transforms[part.id]=rigid(clavicleM);continue;}
  if(!onSide(part))continue;

  // Shoulder-girdle muscles: preserve both anatomical attachments.
  if(deltoid(part)){
   const anchor=/clavicular part/.test(norm(part.name))?clavicleM:scapulaM;
   transforms[part.id]=deform(shoulderM,anchor);continue;
  }
  if(cuff(part)){transforms[part.id]=deform(shoulderM,scapulaM);continue;}
  if(trunkToScapula(part)){transforms[part.id]=deform(scapulaM,identityM);continue;}
  if(trunkToClavicle(part)){transforms[part.id]=deform(clavicleM,identityM);continue;}
  if(trunkToHumerus(part)){
   const anchor=/clavicular part/.test(norm(part.name))?clavicleM:identityM;
   transforms[part.id]=deform(shoulderM,anchor);continue;
  }

  // Muscles crossing joints are blended from origin-side motion to
  // insertion-side motion instead of being moved as detached rigid objects.
  if(biceps(part)){transforms[part.id]=deform(forearmM,scapulaM);continue;}
  if(triceps(part)){
   const anchor=/long head/.test(norm(part.name))?scapulaM:shoulderM;
   transforms[part.id]=deform(elbowM,anchor);continue;
  }
  if(brachialis(part)){transforms[part.id]=deform(elbowM,shoulderM);continue;}
  if(coracobrachialis(part)){transforms[part.id]=deform(shoulderM,scapulaM);continue;}
  if(wristCrosser(part)){transforms[part.id]=deform(wristM,forearmM);continue;}
  if(forearmRotator(part)){transforms[part.id]=deform(forearmM,elbowM);continue;}
  if(forearmMuscle(part)){transforms[part.id]=deform(elbowM,shoulderM);continue;}

  if(!isUpperLimb(part))continue;
  if(isHandPart(part)){transforms[part.id]=rigid(wristM);continue;}
  if(isPronating(part)){transforms[part.id]=rigid(forearmM);continue;}
  transforms[part.id]=rigid(isDistalToElbow(part)?elbowM:shoulderM);
 }

 return{transforms,warnings};
}
