import * as T from 'three';
import type {PartTransform} from '../anatomy';
import joints from './digit-joints.json';

/**
 * Finger kinematics and skinning weights.
 *
 * Each digit is a rigid chain of the real bone meshes: thumb = first metacarpal (CMC) → proximal phalanx (MCP) → distal phalanx (IP); each finger =
 * proximal (MCP) → middle (PIP) → distal phalanx (DIP). Joint centres come from the bones themselves (scripts/fit-digit-joints.mjs).
 * The four finger metacarpals stay with the hand. Every phalanx is one frame of the soft-tissue palette (see FRAMES in soft-tissue.ts), so
 * muscles, tendons, vessels, nerves and the skin of the finger follow it through the same skinning as the rest of the arm.
 */
export type Side='left'|'right';
export const DIGITS=['thumb','index','middle','ring','little'] as const;
export type Digit=(typeof DIGITS)[number];
/** Frame names in palette order: the first of each digit is the thumb metacarpal or the proximal phalanx, the last is the distal phalanx. */
export const DIGIT_FRAMES=DIGITS.flatMap(d=>[1,2,3].map(i=>`${d}${i}`)) as readonly string[];
export const FINGERS=['index','middle','ring','little'] as const;

type FingerKey<D extends string>=`${D}McpFlexion`|`${D}McpAbduction`|`${D}PipFlexion`|`${D}DipFlexion`;
export type DigitKey='thumbCmcFlexion'|'thumbCmcAbduction'|'thumbOpposition'|'thumbMcpFlexion'|'thumbIpFlexion'|FingerKey<'index'>|FingerKey<'middle'>|FingerKey<'ring'>|FingerKey<'little'>;
export type DigitPose={[K in DigitKey]:number};

// Limits in degrees [min, max]. Fingers: MCP flexion -15..90, abduction -20..20 (negative = adduction past the neutral spread), PIP 0..105, DIP 0..80.
// Thumb: CMC flexion -15..45, abduction 0..55, opposition 0..50; MCP 0..55; IP -10..80 (the registry values in articulation-registry.ts).
export const DIGIT_LIMITS:Record<DigitKey,readonly [number,number]>={
 thumbCmcFlexion:[-15,45],thumbCmcAbduction:[0,55],thumbOpposition:[0,50],thumbMcpFlexion:[0,55],thumbIpFlexion:[-10,80],
 ...Object.fromEntries(FINGERS.flatMap(f=>[[`${f}McpFlexion`,[-15,90]],[`${f}McpAbduction`,[-20,20]],[`${f}PipFlexion`,[0,105]],[`${f}DipFlexion`,[0,80]]])) as unknown as Record<Exclude<DigitKey,`thumb${string}`>,readonly [number,number]>
};
export const DIGIT_KEYS=Object.keys(DIGIT_LIMITS) as DigitKey[];
export const DIGIT_NEUTRAL=Object.fromEntries(DIGIT_KEYS.map(k=>[k,0])) as DigitPose;

const clampDeg=(v:number,[lo,hi]:readonly [number,number])=>Math.max(lo,Math.min(hi,Number.isFinite(v)?v:0));
export const constrainDigits=(pose:Partial<DigitPose>):DigitPose=>Object.fromEntries(DIGIT_KEYS.map(k=>[k,clampDeg(pose[k]??0,DIGIT_LIMITS[k])])) as DigitPose;

interface DigitData{ids:Record<string,string>;joints:Record<string,number[]>;tip:number[];radius:number}
const data=(side:Side,digit:Digit)=>(joints.sides[side] as unknown as Record<Digit,DigitData>)[digit];
const v3=(a:number[])=>new T.Vector3(a[0],a[1],a[2]);
const about=(pivot:T.Vector3,axis:T.Vector3,deg:number)=>{
 const q=new T.Quaternion().setFromAxisAngle(axis,T.MathUtils.degToRad(deg));
 return new T.Matrix4().makeTranslation(pivot.x,pivot.y,pivot.z).multiply(new T.Matrix4().makeRotationFromQuaternion(q)).multiply(new T.Matrix4().makeTranslation(-pivot.x,-pivot.y,-pivot.z));
};
const rigid=(m:T.Matrix4):PartTransform=>{const p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();m.decompose(p,q,s);return{translation:[p.x,p.y,p.z],quaternion:[q.x,q.y,q.z,q.w]};};

/** Part id that stands for each digit frame (the bone whose transform is that frame's transform), in DIGIT_FRAMES order. */
export function digitBoneIds(side:Side):string[]{
 return DIGITS.flatMap(d=>{const ids=data(side,d).ids;return d==='thumb'?[ids.mc,ids.pp,ids.dp]:[ids.pp,ids.mp,ids.dp];});
}

const Z=new T.Vector3(0,0,1),FLEX=new T.Vector3(-1,0,0);
/** Rigid transforms of every moving digit bone for a pose, composed on top of the hand (wrist) matrix: M_bone = M_parent · R_joint(rest pivot, rest axis). */
export function digitTransforms(side:Side,input:Partial<DigitPose>,hand:T.Matrix4):Record<string,PartTransform>{
 const p=constrainDigits(input),out:Record<string,PartTransform>={},s=side==='left'?1:-1;
 const medial=new T.Vector3(-s,0,0);
 for(const digit of DIGITS){
  const d=data(side,digit),j=d.joints;
  if(digit==='thumb'){
   const cmc=v3(j.cmc),mcp=v3(j.mcp),ip=v3(j.ip),tip=v3(d.tip);
   const uMc=mcp.clone().sub(cmc).normalize(),uPp=ip.clone().sub(mcp).normalize(),uDp=tip.clone().sub(ip).normalize();
   const flexC=uMc.clone().cross(medial).normalize(),abdC=uMc.clone().cross(Z).normalize();
   // Opposition is a combined movement: the metacarpal swings forward and across the palm while it turns about its own axis (pad towards the fingers).
   const o=p.thumbOpposition;
   const cmcM=about(cmc,flexC,p.thumbCmcFlexion+.4*o).multiply(about(cmc,abdC,p.thumbCmcAbduction+.55*o)).multiply(about(cmc,uMc,-.6*o*s));
   const m1=hand.clone().multiply(cmcM);
   const m2=m1.clone().multiply(about(mcp,uPp.clone().cross(medial).normalize(),p.thumbMcpFlexion));
   const m3=m2.clone().multiply(about(ip,uDp.clone().cross(medial).normalize(),p.thumbIpFlexion));
   out[d.ids.mc]=rigid(m1);out[d.ids.pp]=rigid(m2);out[d.ids.dp]=rigid(m3);
   continue;
  }
  const mcp=v3(j.mcp),pip=v3(j.pip),dip=v3(j.dip);
  // spreading moves the finger away from the middle finger: radial for index and middle, ulnar for ring and little
  const away=digit==='index'||digit==='middle'?s:-s;
  const key=(k:string)=>p[`${digit}${k}` as DigitKey];
  const m1=hand.clone().multiply(about(mcp,FLEX,key('McpFlexion'))).multiply(about(mcp,Z,key('McpAbduction')*away));
  const m2=m1.clone().multiply(about(pip,FLEX,key('PipFlexion')));
  const m3=m2.clone().multiply(about(dip,FLEX,key('DipFlexion')));
  out[d.ids.pp]=rigid(m1);out[d.ids.mp]=rigid(m2);out[d.ids.dp]=rigid(m3);
 }
 return out;
}

// ---- skinning weights -------------------------------------------------------------------------------------------------------------------------

const clamp01=(x:number)=>Math.max(0,Math.min(1,x));
const smooth=(x:number)=>{x=clamp01(x);return x*x*(3-2*x);};
const step=(x:number,a:number,b:number)=>smooth((x-a)/Math.max(1e-9,b-a));
interface Chain{digit:Digit;points:T.Vector3[];joint:number[];frames:number[];start:number;axis:T.Vector3;origin:T.Vector3;radius:number;length:number}
const chains=new Map<Side,Chain[]>();
function chainsOf(side:Side):Chain[]{
 const cached=chains.get(side);if(cached)return cached;
 const made=DIGITS.map((digit,i)=>{
  const d=data(side,digit),j=d.joints;
  // polyline through the digit: the thumb starts at its CMC joint (its metacarpal is a moving frame), the fingers at the MCP joint
  const pts=digit==='thumb'?[v3(j.cmc),v3(j.mcp),v3(j.ip),v3(d.tip)]:[v3(j.mcp),v3(j.pip),v3(j.dip),v3(d.tip)];
  const arc=[0];for(let k=1;k<pts.length;k++)arc.push(arc[k-1]+pts[k].distanceTo(pts[k-1]));
  const axis=pts[pts.length-1].clone().sub(pts[0]).normalize();
  return{digit,points:pts,joint:[arc[1],arc[2]],frames:[7+i*3,8+i*3,9+i*3],start:0,axis,origin:pts[0].clone(),radius:d.radius,length:arc[3]};
 });
 chains.set(side,made);return made;
}
/** Nearest point of a polyline: its distance, and the arc length of that point from the start. */
function nearest(points:T.Vector3[],p:T.Vector3){
 let best=Infinity,arc=0,run=0;
 for(let k=0;k+1<points.length;k++){
  const a=points[k],b=points[k+1],ab=b.clone().sub(a),len=ab.length(),t=clamp01(p.clone().sub(a).dot(ab)/Math.max(1e-12,len*len)),q=a.clone().addScaledVector(ab,t),d=q.distanceTo(p);
  if(d<best){best=d;arc=run+t*len;}
  run+=len;
 }
 return{distance:best,arc};
}
/**
 * Moves the weight a vertex has on the hand frame (index 6) onto the digit frames, from where the vertex lies in the rest pose: near a digit's bones (and
 * distal to its first joint) it goes to the phalanx frames, blended across each joint over ±6 mm; elsewhere it stays on the hand. `weights` is the
 * 7-entry (or longer) result of the arm weighting; the return value has one entry per frame.
 */
export function withDigitWeights(side:Side,weights:number[],x:number,y:number,z:number,frameCount:number):number[]{
 const out=weights.slice(0,frameCount);while(out.length<frameCount)out.push(0);
 const hand=out[6];if(!(hand>1e-6))return out;
 const p=new T.Vector3(x,y,z),parts:{chain:Chain;amount:number;f:[number,number,number]}[]=[];
 let total=0;
 for(const chain of chainsOf(side)){
  const {distance,arc}=nearest(chain.points,p),sigma=.0075+chain.radius*.55;
  const lateral=Math.exp(-((Math.max(0,distance-chain.radius)/sigma)**2));
  const along=p.clone().sub(chain.origin).dot(chain.axis);
  // the thumb's metacarpal is part of the digit; the fingers' metacarpals belong to the hand, so a finger starts ~10 mm before its MCP joint
  const ramp=chain.digit==='thumb'?step(along,-.012,.004):step(along,-.010,.006);
  const amount=lateral*ramp;if(amount<1e-4)continue;
  const d=.006,f1=1-step(arc,chain.joint[0]-d,chain.joint[0]+d),f3=step(arc,chain.joint[1]-d,chain.joint[1]+d);
  parts.push({chain,amount,f:[f1,1-f1-f3,f3]});total+=amount;
 }
 if(!parts.length)return out;
 const scale=total>1?1/total:1;let moved=0;
 for(const {chain,amount,f} of parts){
  const a=hand*amount*scale;moved+=a;
  for(let k=0;k<3;k++)out[chain.frames[k]]+=a*f[k];
 }
 out[6]=hand-moved;
 return out;
}
