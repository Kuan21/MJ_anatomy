import * as T from 'three';
import type {Atlas} from './anatomy';
import {constrainUpperLimbPose,solveWithinLigaments,upperLimbLigaments,type LigamentState,type SegmentTransforms} from './mj-constraints';
import {mapUpperLimbBones,rigFor,segmentId,type Rig,type Side} from './mj-rig';

export {MOTION_LIMITS,constrainUpperLimbPose} from './mj-constraints';
export {mapUpperLimbBones} from './mj-rig';
export type {Side} from './mj-rig';
export type UpperLimbJoint='shoulder-abduction'|'shoulder-flexion'|'shoulder-rotation'|'elbow-flexion'|'forearm-rotation';
/** Angles in degrees from the anatomical position. forearmRotation > 0 is pronation. */
export interface MotionPose{shoulderAbduction:number;shoulderFlexion:number;shoulderRotation:number;elbowFlexion:number;forearmRotation:number}
export const NEUTRAL_POSE:MotionPose={shoulderAbduction:0,shoulderFlexion:0,shoulderRotation:0,elbowFlexion:0,forearmRotation:0};
export type KinematicPartSet=ReturnType<typeof mapUpperLimbBones>;
export interface CalibrationReport{side:Side;mapped:{[K in keyof KinematicPartSet]:number};readyForBonePreview:boolean;warnings:string[]}
/** Segment transforms drive the skinned anatomy; every structure follows them through its vertex weights. */
export interface MotionBuildResult{segments:SegmentTransforms;pose:MotionPose;warnings:string[];ligamentStates:LigamentState[]}

export function validateUpperLimbMapping(atlas:Atlas,side:Side):CalibrationReport{
 const b=mapUpperLimbBones(atlas,side),mapped={clavicle:b.clavicle.length,scapula:b.scapula.length,humerus:b.humerus.length,ulna:b.ulna.length,radius:b.radius.length,hand:b.hand.length};
 const required:(keyof KinematicPartSet)[]=['clavicle','scapula','humerus','ulna','radius'];
 const ambiguous=required.filter(k=>mapped[k]!==1),warnings=ambiguous.map(k=>`Expected exactly one skeletal ${side} ${k}; found ${mapped[k]}.`);
 return {side,mapped,readyForBonePreview:ambiguous.length===0,warnings};
}

const q=(axis:T.Vector3,deg:number)=>new T.Quaternion().setFromAxisAngle(axis,T.MathUtils.degToRad(deg));
const about=(pivot:T.Vector3,r:T.Quaternion)=>new T.Matrix4().makeTranslation(pivot.x,pivot.y,pivot.z).multiply(new T.Matrix4().makeRotationFromQuaternion(r)).multiply(new T.Matrix4().makeTranslation(-pivot.x,-pivot.y,-pivot.z));
const rigid=(m:T.Matrix4):SegmentTransform=>{const p=new T.Vector3(),r=new T.Quaternion(),s=new T.Vector3();m.decompose(p,r,s);return{translation:[p.x,p.y,p.z],quaternion:[r.x,r.y,r.z,r.w]};};
type SegmentTransform=SegmentTransforms[string];

/** Scapulohumeral rhythm: beyond 30° of elevation roughly a third is scapulothoracic. */
const GIRDLE_SHARE=.35,GIRDLE_MAX=50;

/**
 * Upper-limb chain solved on the shared rig, all axes in the rest frame:
 * thorax → girdle (about the sternoclavicular joint) → glenohumeral → elbow
 * (ulna) → radius (about the radial head–distal ulna axis) → hand.
 */
export function upperLimbSegments(rig:Rig,side:Side,p:MotionPose):SegmentTransforms{
 const get=(k:string)=>rig.byId.get(segmentId(side,k));
 const scapula=get('scapula'),humerus=get('humerus'),ulna=get('ulna'),radius=get('radius'),hand=get('hand'),other=rig.byId.get(segmentId(side==='left'?'right':'left','humerus'));
 if(!scapula||!humerus||!ulna||!radius||!hand)return{};
 const shoulder=humerus.pivot,elbow=ulna.pivot,down=elbow.clone().sub(shoulder).normalize();
 const lateral=other?shoulder.clone().sub(other.pivot).projectOnPlane(down).normalize():new T.Vector3(side==='left'?1:-1,0,0);
 const anterior=down.clone().negate().cross(lateral).multiplyScalar(side==='left'?-1:1).normalize();
 // Each axis turns the hanging arm toward the named direction for a positive angle, on either side.
 const abduction=down.clone().cross(lateral).normalize(),flexion=down.clone().cross(anterior).normalize(),external=anterior.clone().cross(lateral).normalize();
 const elevation=Math.max(p.shoulderAbduction,p.shoulderFlexion,0),girdle=Math.min(GIRDLE_MAX,Math.max(0,elevation-30)*GIRDLE_SHARE),share=elevation>0?girdle/elevation:0;
 const girdleM=about(scapula.pivot,q(abduction,p.shoulderAbduction*share).multiply(q(flexion,p.shoulderFlexion*share)));
 const gh=q(abduction,p.shoulderAbduction*(1-share)).multiply(q(flexion,p.shoulderFlexion*(1-share))).multiply(q(external,p.shoulderRotation));
 const humerusM=girdleM.clone().multiply(about(shoulder,gh));
 const forearm=(hand.pivot.clone().sub(elbow)).normalize(),elbowAxis=forearm.clone().cross(anterior).normalize();
 const ulnaM=humerusM.clone().multiply(about(elbow,q(elbowAxis,p.elbowFlexion)));
 const pronationAxis=(ulna.end??hand.pivot).clone().sub(radius.pivot).normalize(),medial=lateral.clone().negate();
 if(anterior.clone().cross(medial).dot(pronationAxis)<0)pronationAxis.negate();
 const radiusM=ulnaM.clone().multiply(about(radius.pivot,q(pronationAxis,p.forearmRotation)));
 return{[scapula.id]:rigid(girdleM),[humerus.id]:rigid(humerusM),[ulna.id]:rigid(ulnaM),[radius.id]:rigid(radiusM),[hand.id]:rigid(radiusM)};
}

/** Skinned upper-limb preview: bones, muscles and neurovascular paths all follow these segment transforms. */
export function buildUpperLimbPreview(atlas:Atlas,side:Side,pose:MotionPose):MotionBuildResult{
 const report=validateUpperLimbMapping(atlas,side);if(!report.readyForBonePreview)return{segments:{},pose:NEUTRAL_POSE,warnings:report.warnings,ligamentStates:[]};
 const rig=rigFor(atlas),constrained=constrainUpperLimbPose(pose);
 const solved=solveWithinLigaments(constrained.pose,NEUTRAL_POSE,p=>upperLimbSegments(rig,side,p),upperLimbLigaments(rig,side));
 return{segments:solved.segments,pose:solved.pose,warnings:[...constrained.warnings,...solved.warnings],ligamentStates:solved.states};
}
