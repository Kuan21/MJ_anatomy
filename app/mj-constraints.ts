import * as T from 'three';
import type {PartTransform} from './anatomy';

export type LandmarkName='shoulder-center'|'elbow-center'|'radial-head'|'distal-radius'|'distal-ulna';
export interface AttachmentLandmark {boneId:string;local:[number,number,number]}
export interface LigamentConstraint {
 id:string;label:string;origin:AttachmentLandmark;insertion:AttachmentLandmark;
 slackLength:number;toeStrain:number;maxStrain:number;role:string;
}
export interface LigamentState {id:string;length:number;strain:number;restraint:number;violated:boolean}

const v=(x:[number,number,number])=>new T.Vector3(...x);
const world=(a:AttachmentLandmark,transforms:Record<string,PartTransform>)=>{
 const p=v(a.local),t=transforms[a.boneId];if(!t)return p;
 return p.applyQuaternion(new T.Quaternion(...t.quaternion)).add(v(t.translation));
};
export function evaluateLigament(c:LigamentConstraint,transforms:Record<string,PartTransform>):LigamentState{
 const length=world(c.origin,transforms).distanceTo(world(c.insertion,transforms));
 const strain=c.slackLength>0?(length-c.slackLength)/c.slackLength:0;
 const toe=Math.max(1e-6,c.toeStrain),span=Math.max(1e-6,c.maxStrain-toe);
 const restraint=strain<=0?0:strain<toe?.5*(strain/toe)**2:strain<c.maxStrain?.5+.5*Math.min(1,(strain-toe)/span):1;
 return{id:c.id,length,strain,restraint,violated:strain>c.maxStrain};
}
export function evaluateLigaments(cs:LigamentConstraint[],transforms:Record<string,PartTransform>){
 return cs.map(c=>evaluateLigament(c,transforms));
}
