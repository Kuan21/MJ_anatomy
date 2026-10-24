import * as T from 'three';
import type {MotionPose} from './mj-motion';
import {segmentId,type Rig,type Side} from './mj-rig';
import type {SegmentTransform} from './mj-skinning';

/** A rest-pose world point carried rigidly by one rig segment. */
export interface AttachmentLandmark {segment:string;point:[number,number,number]}
export interface LigamentConstraint {
 id:string;label:string;origin:AttachmentLandmark;insertion:AttachmentLandmark;
 slackLength:number;toeStrain:number;maxStrain:number;role:string;
}
export interface LigamentState {id:string;length:number;strain:number;restraint:number;violated:boolean}
export type SegmentTransforms=Record<string,SegmentTransform>;

const v=(x:[number,number,number])=>new T.Vector3(...x);
const tuple=(p:T.Vector3):[number,number,number]=>[p.x,p.y,p.z];
const world=(a:AttachmentLandmark,segments:SegmentTransforms)=>{
 const p=v(a.point),t=segments[a.segment];if(!t)return p;
 return p.applyQuaternion(new T.Quaternion(...t.quaternion)).add(v(t.translation));
};
export function evaluateLigament(c:LigamentConstraint,segments:SegmentTransforms):LigamentState{
 const length=world(c.origin,segments).distanceTo(world(c.insertion,segments));
 const strain=c.slackLength>0?(length-c.slackLength)/c.slackLength:0;
 const toe=Math.max(1e-6,c.toeStrain),span=Math.max(1e-6,c.maxStrain-toe);
 const restraint=strain<=0?0:strain<toe?.5*(strain/toe)**2:strain<c.maxStrain?.5+.5*Math.min(1,(strain-toe)/span):1;
 return{id:c.id,length,strain,restraint,violated:Math.abs(strain)>c.maxStrain};
}
export function evaluateLigaments(cs:LigamentConstraint[],segments:SegmentTransforms){
 return cs.map(c=>evaluateLigament(c,segments));
}

/**
 * Radioulnar integrity guards. With pronation solved about the anatomical axis
 * (radial head → distal ulna) both distances stay at their rest length; a strain
 * here means the forearm solution is tearing the radius away from the ulna.
 */
export function upperLimbLigaments(rig:Rig,side:Side):LigamentConstraint[]{
 const ulna=rig.byId.get(segmentId(side,'ulna')),radius=rig.byId.get(segmentId(side,'radius'));
 if(!ulna||!radius||!ulna.end||!radius.end)return[];
 const make=(id:string,label:string,role:string,o:T.Vector3,i:T.Vector3):LigamentConstraint=>({
  id:`${side}-${id}`,label,role,origin:{segment:ulna.id,point:tuple(o)},insertion:{segment:radius.id,point:tuple(i)},
  slackLength:o.distanceTo(i),toeStrain:.02,maxStrain:.06,
 });
 return[
  make('annular','Annular ligament','Retains the radial head against the radial notch of the ulna.',ulna.capsules[0].a,radius.pivot),
  make('druj','Distal radioulnar joint','Keeps the ulnar notch of the radius around the ulnar head.',ulna.end,radius.end),
 ];
}

export const MOTION_LIMITS={shoulderAbduction:[0,170],shoulderFlexion:[-40,170],shoulderRotation:[-80,90],elbowFlexion:[0,145],forearmRotation:[-10,140]} as const;
const clamp=(x:number,[lo,hi]:readonly[number,number])=>T.MathUtils.clamp(x,lo,hi);
/**
 * First-pass passive soft-tissue envelope. These are conservative educational
 * bounds, not a subject-specific tissue simulation. Coupled shoulder limits
 * tighten external rotation when the arm is elevated, reflecting the fact that
 * capsuloligamentous restraint changes with position.
 */
export function constrainUpperLimbPose(input:MotionPose):{pose:MotionPose;warnings:string[]}{
 const warnings:string[]=[];
 const pose:MotionPose={
  shoulderAbduction:clamp(input.shoulderAbduction,MOTION_LIMITS.shoulderAbduction),
  shoulderFlexion:clamp(input.shoulderFlexion,MOTION_LIMITS.shoulderFlexion),
  shoulderRotation:clamp(input.shoulderRotation,MOTION_LIMITS.shoulderRotation),
  elbowFlexion:clamp(input.elbowFlexion,MOTION_LIMITS.elbowFlexion),
  forearmRotation:clamp(input.forearmRotation,MOTION_LIMITS.forearmRotation)
 };
 if(pose.shoulderAbduction>90){
  const maxER=T.MathUtils.lerp(90,70,(pose.shoulderAbduction-90)/90);
  if(pose.shoulderRotation>maxER){pose.shoulderRotation=maxER;warnings.push('Shoulder external rotation limited by the guarded capsuloligamentous envelope.');}
 }
 return{pose,warnings};
}

/**
 * Progressive ligament solve: if the requested pose over-strains any guard, back
 * the whole pose off toward neutral (bisection) until every guard is satisfied.
 */
export function solveWithinLigaments(pose:MotionPose,neutral:MotionPose,build:(p:MotionPose)=>SegmentTransforms,constraints:LigamentConstraint[]){
 const at=(s:number)=>{const p={...pose};(Object.keys(p) as (keyof MotionPose)[]).forEach(k=>{p[k]=neutral[k]+(pose[k]-neutral[k])*s;});return p;};
 const ok=(p:MotionPose)=>{const segments=build(p);return{segments,states:evaluateLigaments(constraints,segments)};};
 const requested=ok(pose);if(!requested.states.some(s=>s.violated))return{pose,...requested,warnings:[] as string[]};
 let lo=0,hi=1,best=at(0),result=ok(best);
 for(let k=0;k<14;k++){const mid=(lo+hi)/2,p=at(mid),r=ok(p);if(r.states.some(s=>s.violated))hi=mid;else{lo=mid;best=p;result=r;}}
 const names=constraints.filter((_,i)=>requested.states[i].violated).map(c=>c.label);
 return{pose:best,...result,warnings:[`Pose reduced to ${Math.round(lo*100)}% to stay within: ${names.join(', ')}.`]};
}
