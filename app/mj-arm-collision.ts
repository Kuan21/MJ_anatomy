import * as T from 'three';
import type {Atlas} from './anatomy';
import {armJoints,buildUpperLimbMotion,constrainPose,type MotionPose,type Side} from './mj-motion';

/**
 * Collision envelope of the arm against the body. Real people can bring a hand to the head, neck or chest, but not through them: the arm is
 * three capsules (upper arm, forearm, hand), the body an ellipsoid head, a neck capsule and an elliptic trunk cylinder, all built from the
 * skeleton plus a soft-tissue margin. When a requested pose would penetrate, the joints are reduced one group at a time, distal first
 * (wrist, forearm rotation, elbow, shoulder rotation, then the shoulder swing), to the largest angle that still clears.
 */
export interface Contact{clearance:number;segment?:'upper arm'|'forearm'|'hand';body?:'head'|'neck'|'trunk'}
interface Body{head:{c:T.Vector3;r:T.Vector3};neck:{a:T.Vector3;b:T.Vector3;r:number};trunk:{cx:number;cz:number;rx:number;rz:number;y0:number;y1:number}}
const SKULL=/^(occipital bone|frontal bone|(left|right) parietal bone|parietal bone|(left|right) temporal bone|temporal bone|mandible|maxilla|sphenoid bone|(left|right) zygomatic bone|nasal bone)$/i;
const CERVICAL=/^(atlas|axis|(third|fourth|fifth|sixth|seventh) cervical vertebra)$/i;
const RADII={'upper arm':.034,forearm:.034,hand:.03};
/** Soft tissue compresses a little where an arm rests against the head or chest (ear, cheek, ribs): contact up to this depth is allowed. */
export const COMPRESSION=.008;
const SKIN=.012;
const bodies=new WeakMap<Atlas,Body>();
const boxOf=(atlas:Atlas,test:(name:string,id:string)=>boolean)=>{const b=new T.Box3();for(const p of atlas.parts)if(p.system==='skeletal'&&test(p.name,p.id))b.union(new T.Box3(new T.Vector3().fromArray(p.bounds[0]),new T.Vector3().fromArray(p.bounds[1])));return b;};
export function bodyShape(atlas:Atlas):Body{
 const cached=bodies.get(atlas);if(cached)return cached;
 const skull=boxOf(atlas,n=>SKULL.test(n)),cs=boxOf(atlas,n=>CERVICAL.test(n)),ribs=boxOf(atlas,n=>/ rib$/i.test(n));
 const sc=skull.getSize(new T.Vector3()),skullTop=skull.max.y;
 const neckTop=new T.Vector3((cs.min.x+cs.max.x)/2,cs.max.y,(cs.min.z+cs.max.z)/2),neckBottom=new T.Vector3(neckTop.x,cs.min.y,neckTop.z);
 const body:Body={
  head:{c:skull.getCenter(new T.Vector3()),r:new T.Vector3(sc.x/2+SKIN,sc.y/2+SKIN,sc.z/2+SKIN)},
  neck:{a:neckBottom,b:neckTop.clone().setY(Math.min(neckTop.y,skull.min.y+.02)),r:.052},
  trunk:{cx:(ribs.min.x+ribs.max.x)/2,cz:(ribs.min.z+ribs.max.z)/2,rx:(ribs.max.x-ribs.min.x)/2+.012,rz:(ribs.max.z-ribs.min.z)/2+.014,y0:ribs.min.y-.05,y1:ribs.max.y+.02},
 };
 void skullTop;bodies.set(atlas,body);return body;
}
const SAMPLES=7;
/** Depth of the deepest penetration (negative) or the smallest gap (positive) between one capsule and the body parts. */
function segmentClearance(a:T.Vector3,b:T.Vector3,radius:number,body:Body,segment:Contact['segment'],checkTrunk:boolean):Contact{
 let worst:Contact={clearance:Infinity};
 const p=new T.Vector3();
 for(let i=0;i<=SAMPLES;i++){
  p.lerpVectors(a,b,i/SAMPLES);
  // head: ellipsoid with the capsule radius added to every axis
  const h=body.head,k=Math.hypot((p.x-h.c.x)/(h.r.x+radius),(p.y-h.c.y)/(h.r.y+radius),(p.z-h.c.z)/(h.r.z+radius));
  const dh=(k-1)*Math.min(h.r.x,h.r.y,h.r.z);
  if(dh<worst.clearance)worst={clearance:dh,segment,body:'head'};
  // neck: capsule
  const n=body.neck,ab=n.b.clone().sub(n.a),t=Math.max(0,Math.min(1,p.clone().sub(n.a).dot(ab)/Math.max(1e-9,ab.lengthSq()))),closest=n.a.clone().addScaledVector(ab,t),dn=p.distanceTo(closest)-n.r-radius;
  if(dn<worst.clearance)worst={clearance:dn,segment,body:'neck'};
  if(checkTrunk){
   const r=body.trunk,inRange=p.y>r.y0&&p.y<r.y1,kk=Math.hypot((p.x-r.cx)/(r.rx+radius),(p.z-r.cz)/(r.rz+radius)),dt=Math.min((kk-1)*Math.min(r.rx,r.rz),inRange?Infinity:Math.min(Math.abs(p.y-r.y0),Math.abs(p.y-r.y1)));
   if(inRange&&dt<worst.clearance)worst={clearance:dt,segment,body:'trunk'};
  }
 }
 return worst;
}
export function armContact(atlas:Atlas,side:Side,pose:MotionPose):Contact{
 const built=buildUpperLimbMotion(atlas,side,pose),j=armJoints(atlas,side,built.transforms);
 if(!j)return{clearance:Infinity};
 const body=bodyShape(atlas),all=[
  segmentClearance(j.shoulder,j.elbow,RADII['upper arm'],body,'upper arm',false),
  segmentClearance(j.elbow,j.wrist,RADII.forearm,body,'forearm',true),
  segmentClearance(j.wrist,j.tip,RADII.hand,body,'hand',true),
 ];
 // the shoulder end of the upper arm sits inside the trunk and the head/neck envelope is only meaningful beyond the first third of it
 return all.reduce((a,b)=>b.clearance<a.clearance?b:a);
}
const STAGES:(keyof MotionPose)[][]=[['wristFlexion','wristDeviation'],['forearmRotation'],['elbowFlexion'],['shoulderRotation'],['shoulderFlexion','shoulderAbduction']];
const scaled=(pose:MotionPose,keys:(keyof MotionPose)[],s:number)=>{const q={...pose};for(const k of keys)q[k]=pose[k]*s;return q;};
/** The requested pose, reduced to the largest one that does not push the arm through the head, neck or trunk. */
export function resolveArmCollision(atlas:Atlas,side:Side,input:MotionPose):{pose:MotionPose;limited:boolean;contact?:Contact}{
 let pose=constrainPose(input);
 const first=armContact(atlas,side,pose);
 if(first.clearance>=-COMPRESSION)return{pose,limited:false};
 for(const keys of STAGES){
  if(armContact(atlas,side,pose).clearance>=-COMPRESSION)break;
  if(keys.every(k=>pose[k]===0))continue;
  if(armContact(atlas,side,scaled(pose,keys,0)).clearance<-COMPRESSION){pose=scaled(pose,keys,0);continue;}
  let lo=0,hi=1;
  for(let i=0;i<9;i++){const mid=(lo+hi)/2;if(armContact(atlas,side,scaled(pose,keys,mid)).clearance>=-COMPRESSION)lo=mid;else hi=mid;}
  pose=scaled(pose,keys,lo);
 }
 return{pose,limited:true,contact:first};
}
