import * as T from 'three';
import type {Atlas,PartTransform} from './anatomy';
import {evaluateLigaments,type LigamentConstraint} from './mj-constraints';

export type UpperLimbJoint='shoulder-abduction'|'shoulder-flexion'|'shoulder-rotation'|'elbow-flexion'|'forearm-rotation';
export type Side='left'|'right';
export interface MotionPose{shoulderAbduction:number;shoulderFlexion:number;shoulderRotation:number;elbowFlexion:number;forearmRotation:number}
export const NEUTRAL_POSE:MotionPose={shoulderAbduction:0,shoulderFlexion:0,shoulderRotation:0,elbowFlexion:0,forearmRotation:0};
export interface KinematicPartSet{clavicle:number[];scapula:number[];humerus:number[];ulna:number[];radius:number[];hand:number[]}
export interface CalibrationReport{side:Side;mapped:{[K in keyof KinematicPartSet]:number};readyForBonePreview:boolean;warnings:string[]}
export interface MotionBuildResult{transforms:Record<string,PartTransform>;warnings:string[];ligamentStates?:ReturnType<typeof evaluateLigaments>}
export interface ConstraintResult{pose:MotionPose;warnings:string[]}

const norm=(s:string)=>s.trim().toLowerCase();
const skeletal=(atlas:Atlas)=>atlas.parts.map((p,i)=>({p,i})).filter(x=>x.p.system==='skeletal');
const exact=(atlas:Atlas,name:string)=>skeletal(atlas).filter(x=>norm(x.p.name)===norm(name)).map(x=>x.i);
const handBone=(name:string,side:Side)=>{
 const n=norm(name);if(!n.includes(side))return false;
 return /metacarpal bone|phalanx .* (finger|thumb)|scaphoid|lunate|triquetr|pisiform|trapezium|trapezoid|capitate|hamate/.test(n);
};

/** Strict skeletal-only catalogue mapping: no substring matches to vessels/muscles. */
export function mapUpperLimbBones(atlas:Atlas,side:Side):KinematicPartSet{
 const cap=side[0].toUpperCase()+side.slice(1);
 return {
  clavicle:exact(atlas,`${cap} clavicle`),scapula:exact(atlas,`${cap} scapula`),
  humerus:exact(atlas,`${cap} humerus`),ulna:exact(atlas,`${cap} ulna`),radius:exact(atlas,`${cap} radius`),
  hand:skeletal(atlas).filter(x=>handBone(x.p.name,side)).map(x=>x.i)
 };
}
const boxFor=(atlas:Atlas,indices:number[])=>{const b=new T.Box3();indices.forEach(i=>{const p=atlas.parts[i];if(p)b.union(new T.Box3(new T.Vector3().fromArray(p.bounds[0]),new T.Vector3().fromArray(p.bounds[1])))});return b;};
const center=(atlas:Atlas,indices:number[])=>boxFor(atlas,indices).getCenter(new T.Vector3());
const longEndpoints=(box:T.Box3)=>{
 const c=box.getCenter(new T.Vector3()),s=box.getSize(new T.Vector3());let axis=0;if(s.y>s.x&&s.y>=s.z)axis=1;else if(s.z>s.x&&s.z>s.y)axis=2;
 const a=c.clone(),b=c.clone();a.setComponent(axis,box.min.getComponent(axis));b.setComponent(axis,box.max.getComponent(axis));return[a,b] as const;
};
const nearer=(a:T.Vector3,b:T.Vector3,to:T.Vector3)=>a.distanceToSquared(to)<b.distanceToSquared(to)?a:b;
const shoulderPivot=(atlas:Atlas,b:KinematicPartSet)=>{const [a,z]=longEndpoints(boxFor(atlas,b.humerus));return nearer(a,z,center(atlas,b.scapula));};
const elbowPivot=(atlas:Atlas,b:KinematicPartSet)=>{
 const hb=longEndpoints(boxFor(atlas,b.humerus)),fb=longEndpoints(boxFor(atlas,[...b.ulna,...b.radius]));
 let best=new T.Vector3(),d=Infinity;for(const h of hb)for(const f of fb){const q=h.distanceToSquared(f);if(q<d){d=q;best.copy(h).add(f).multiplyScalar(.5);}}return best;
};
const basis=(atlas:Atlas,side:Side,b:KinematicPartSet)=>{
 const shoulder=shoulderPivot(atlas,b),elbow=elbowPivot(atlas,b);
 const superior=shoulder.clone().sub(elbow).normalize();
 const other=mapUpperLimbBones(atlas,side==='left'?'right':'left');
 let lateral=center(atlas,b.humerus).sub(center(atlas,other.humerus)).normalize();
 let anterior=lateral.clone().cross(superior).normalize();if(anterior.lengthSq()<.5)anterior.set(0,0,1);
 return {shoulder,elbow,superior,lateral,anterior};
};
export function validateUpperLimbMapping(atlas:Atlas,side:Side):CalibrationReport{
 const b=mapUpperLimbBones(atlas,side),mapped={clavicle:b.clavicle.length,scapula:b.scapula.length,humerus:b.humerus.length,ulna:b.ulna.length,radius:b.radius.length,hand:b.hand.length};
 const required:(keyof KinematicPartSet)[]=['clavicle','scapula','humerus','ulna','radius'];
 const ambiguous=required.filter(k=>mapped[k]!==1),warnings=ambiguous.map(k=>`Expected exactly one skeletal ${side} ${k}; found ${mapped[k]}.`);
 return {side,mapped,readyForBonePreview:ambiguous.length===0,warnings};
}
const qdeg=(axis:T.Vector3,d:number)=>new T.Quaternion().setFromAxisAngle(axis,T.MathUtils.degToRad(d));
const tuple3=(v:T.Vector3):[number,number,number]=>[v.x,v.y,v.z];
const tuple4=(q:T.Quaternion):[number,number,number,number]=>[q.x,q.y,q.z,q.w];
const about=(pivot:T.Vector3,q:T.Quaternion)=>new T.Matrix4().makeTranslation(pivot.x,pivot.y,pivot.z).multiply(new T.Matrix4().makeRotationFromQuaternion(q)).multiply(new T.Matrix4().makeTranslation(-pivot.x,-pivot.y,-pivot.z));
const rigid=(m:T.Matrix4):PartTransform=>{const p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();m.decompose(p,q,s);return{translation:tuple3(p),quaternion:tuple4(q.normalize())};};

const clamp=(v:number,[lo,hi]:readonly[number,number])=>T.MathUtils.clamp(v,lo,hi);
/**
 * First-pass passive soft-tissue envelope. These are conservative educational
 * bounds, not a subject-specific tissue simulation. Coupled shoulder limits
 * tighten external rotation when the arm is elevated, reflecting the fact that
 * capsuloligamentous restraint changes with position.
 */
export function constrainUpperLimbPose(input:MotionPose):ConstraintResult{
 const warnings:string[]=[];
 const pose:MotionPose={
  shoulderAbduction:clamp(input.shoulderAbduction,MOTION_LIMITS.shoulderAbduction),
  shoulderFlexion:clamp(input.shoulderFlexion,MOTION_LIMITS.shoulderFlexion),
  shoulderRotation:clamp(input.shoulderRotation,MOTION_LIMITS.shoulderRotation),
  elbowFlexion:clamp(input.elbowFlexion,MOTION_LIMITS.elbowFlexion),
  forearmRotation:clamp(input.forearmRotation,MOTION_LIMITS.forearmRotation)
 };
 // High abduction recruits different GH capsuloligamentous restraints; keep
 // this preview inside a guarded envelope until explicit attachment landmarks exist.
 if(pose.shoulderAbduction>90){
  const maxER=T.MathUtils.lerp(90,70,(pose.shoulderAbduction-90)/90);
  if(pose.shoulderRotation>maxER){pose.shoulderRotation=maxER;warnings.push('Shoulder external rotation limited by the guarded capsuloligamentous envelope.');}
 }
 return{pose,warnings};
}

/** Bone-only preview with passive constraint envelope; attachment-level soft tissue follows next. */
export function buildUpperLimbPreview(atlas:Atlas,side:Side,pose:MotionPose):MotionBuildResult{
 const report=validateUpperLimbMapping(atlas,side);if(!report.readyForBonePreview)return{transforms:{},warnings:report.warnings};
 const b=mapUpperLimbBones(atlas,side),frame=basis(atlas,side,b),transforms:Record<string,PartTransform>={};
 const constrained=constrainUpperLimbPose(pose),p=constrained.pose;
 const shoulderQ=qdeg(frame.anterior,p.shoulderAbduction).multiply(qdeg(frame.lateral,p.shoulderFlexion)).multiply(qdeg(frame.superior,p.shoulderRotation)).normalize();
 const shoulderM=about(frame.shoulder,shoulderQ);
 const movedElbow=frame.elbow.clone().applyMatrix4(shoulderM);
 const movedLateral=frame.lateral.clone().applyQuaternion(shoulderQ).normalize();
 const elbowQ=qdeg(movedLateral,p.elbowFlexion);
 const elbowM=about(movedElbow,elbowQ).multiply(shoulderM);
 const forearmAxis=frame.elbow.clone().sub(center(atlas,b.hand)).normalize().applyQuaternion(shoulderQ).applyQuaternion(elbowQ).normalize();
 const forearmQ=qdeg(forearmAxis,p.forearmRotation);
 const forearmM=about(movedElbow,forearmQ).multiply(elbowM);
 const assign=(indices:number[],m:T.Matrix4)=>indices.forEach(i=>{const id=atlas.parts[i]?.id;if(id)transforms[id]=rigid(m);});
 assign(b.humerus,shoulderM);assign(b.ulna,elbowM);assign([...b.radius,...b.hand],forearmM);
 const ligamentStates=evaluateLigaments([],transforms);
 return{transforms,warnings:constrained.warnings,ligamentStates};
}
export const MOTION_LIMITS={shoulderAbduction:[0,170],shoulderFlexion:[-40,170],shoulderRotation:[-80,90],elbowFlexion:[0,145],forearmRotation:[-80,80]} as const;
