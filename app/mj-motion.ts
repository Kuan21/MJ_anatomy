import * as T from 'three';
import type {Atlas} from './anatomy';

export type UpperLimbJoint='shoulder-abduction'|'shoulder-flexion'|'shoulder-rotation'|'elbow-flexion'|'forearm-rotation';
export type Side='left'|'right';

export interface MotionPose {
 shoulderAbduction:number;
 shoulderFlexion:number;
 shoulderRotation:number;
 elbowFlexion:number;
 forearmRotation:number;
}
export const NEUTRAL_POSE:MotionPose={shoulderAbduction:0,shoulderFlexion:0,shoulderRotation:0,elbowFlexion:0,forearmRotation:0};

export interface KinematicPartSet {clavicle:number[];scapula:number[];humerus:number[];ulna:number[];radius:number[];hand:number[]}
export interface JointFrame {pivot:T.Vector3;axis:T.Vector3}

/**
 * Catalogue-driven bone mapper. We only animate parts actually present in
 * BodyParts3D. Side detection uses the source names; ambiguous structures are
 * deliberately excluded instead of guessed.
 */
export function mapUpperLimbBones(atlas:Atlas,side:Side):KinematicPartSet{
 const names=(needles:string[])=>atlas.parts.map((p,i)=>({p,i})).filter(({p})=>{
  const n=p.name.toLowerCase();
  return needles.some(k=>n.includes(k))&&n.includes(side);
 }).map(x=>x.i);
 return {
  clavicle:names(['clavicle']),
  scapula:names(['scapula']),
  humerus:names(['humerus']),
  ulna:names(['ulna']),
  radius:names(['radius']),
  hand:names(['carpal','metacarp','phalan']),
 };
}
const center=(atlas:Atlas,indices:number[])=>{
 const box=new T.Box3();
 indices.forEach(i=>{const p=atlas.parts[i];box.union(new T.Box3(new T.Vector3().fromArray(p.bounds[0]),new T.Vector3().fromArray(p.bounds[1])))});
 return box.isEmpty()?new T.Vector3():box.getCenter(new T.Vector3());
};
export function estimateJointFrames(atlas:Atlas,b:KinematicPartSet){
 const shoulder=center(atlas,b.humerus),elbow=center(atlas,[...b.ulna,...b.radius]);
 // These are provisional geometric frames, not claimed anatomical landmarks.
 // They are exposed so the next validation pass can replace pivots with
 // landmark-calibrated coordinates before motion is enabled for release.
 return {
  shoulder:{pivot:shoulder,axis:new T.Vector3(0,0,1)} as JointFrame,
  elbow:{pivot:elbow,axis:new T.Vector3(0,0,1)} as JointFrame,
  radioulnar:{pivot:center(atlas,b.radius),axis:new T.Vector3(0,1,0)} as JointFrame,
 };
}

/** Scapulohumeral coupling used only after the joint frames are calibrated. */
export function shoulderComplexContribution(humeralElevationDeg:number){
 const elevation=T.MathUtils.clamp(humeralElevationDeg,0,180);
 // Educational approximation: do not present as a fixed physiological ratio.
 return {glenohumeralDeg:elevation*(2/3),scapularUpwardRotationDeg:elevation*(1/3),clavicularElevationDeg:elevation*(1/6)};
}

export const MOTION_LIMITS={
 shoulderAbduction:[0,180],
 shoulderFlexion:[-40,180],
 shoulderRotation:[-90,90],
 elbowFlexion:[0,150],
 forearmRotation:[-80,80],
} as const;


export interface CalibrationReport {
 side:Side;
 mapped:{[K in keyof KinematicPartSet]:number};
 readyForBonePreview:boolean;
 warnings:string[];
}

/**
 * Gate visible motion behind catalogue validation. A preview is enabled only
 * when the major bones needed for a coherent chain are independently mapped.
 */
export function validateUpperLimbMapping(atlas:Atlas,side:Side):CalibrationReport{
 const b=mapUpperLimbBones(atlas,side);
 const mapped={clavicle:b.clavicle.length,scapula:b.scapula.length,humerus:b.humerus.length,ulna:b.ulna.length,radius:b.radius.length,hand:b.hand.length};
 const required:(keyof KinematicPartSet)[]=['clavicle','scapula','humerus','ulna','radius'];
 const missing=required.filter(k=>mapped[k]===0);
 return {side,mapped,readyForBonePreview:missing.length===0,warnings:missing.map(k=>`No unambiguous ${side} ${k} mapping found; motion remains disabled.`)};
}
