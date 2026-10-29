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
const clampedDigits=(pose:Partial<DigitPose>):DigitPose=>Object.fromEntries(DIGIT_KEYS.map(k=>[k,clampDeg(pose[k]??0,DIGIT_LIMITS[k])])) as DigitPose;
/** Sideways angle of a finger in the hand, positive towards the little-finger side (spreading moves the index and middle finger towards the thumb, the ring and little finger away from it). */
const ULNAR_SIGN={index:-1,middle:-1,ring:1,little:1} as const;
/** Neighbouring fingers lie against each other at rest, so they can only move together or apart: the angle between two neighbours may not drop below this (degrees). */
const MIN_FINGER_GAP_ANGLE=-1;
/** Clamps every joint to its range, then spreads neighbouring fingers apart where one would be driven into the next (no finger passes through another). */
export const constrainDigits=(pose:Partial<DigitPose>):DigitPose=>{
 const out=clampedDigits(pose),key=(f:(typeof FINGERS)[number])=>`${f}McpAbduction` as DigitKey;
 const lateral=(f:(typeof FINGERS)[number])=>out[key(f)]*ULNAR_SIGN[f];
 /** Moves a finger sideways by `delta` degrees (positive = towards the little-finger side) as far as its limits allow; returns the movement that was possible. */
 const shift=(f:(typeof FINGERS)[number],delta:number)=>{const [lo,hi]=DIGIT_LIMITS[key(f)],before=lateral(f),target=before+delta,raw=target*ULNAR_SIGN[f],clamped=Math.max(lo,Math.min(hi,raw));out[key(f)]=clamped;return clamped*ULNAR_SIGN[f]-before;};
 for(let pass=0;pass<4;pass++)for(let k=0;k+1<FINGERS.length;k++){
  const a=FINGERS[k],b=FINGERS[k+1],short=MIN_FINGER_GAP_ANGLE-(lateral(b)-lateral(a));
  if(short<=0)continue;
  // each takes half; what a finger at its limit cannot give is taken from its neighbour
  const gotB=shift(b,short/2),gotA=-shift(a,-short/2);
  const left=short-gotB-gotA;
  if(left>1e-9){const more=shift(b,left);if(left-more>1e-9)shift(a,-(left-more));}
 }
 return out;
};

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
/**
 * Convergence: the flexion axes of the four fingers are not parallel. They lean (degrees, positive = towards the thumb side) so that, in a fist, the fingertips close
 * in on the tubercle of the scaphoid instead of curling in one plane: nothing for the index finger, more for each finger further out.
 */
export const FINGER_CONVERGENCE:Record<(typeof FINGERS)[number],number>={index:0,middle:2.5,ring:6,little:10};
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
  // the leaning axis (in the rest hand) turns the fingertip towards the radial side as the finger curls; it is the axis of all three joints of the finger
  const axis=FLEX.clone().applyAxisAngle(Z,T.MathUtils.degToRad(-s*FINGER_CONVERGENCE[digit as (typeof FINGERS)[number]]));
  const m1=hand.clone().multiply(about(mcp,axis,key('McpFlexion'))).multiply(about(mcp,Z,key('McpAbduction')*away));
  const m2=m1.clone().multiply(about(pip,axis,key('PipFlexion')));
  const m3=m2.clone().multiply(about(dip,axis,key('DipFlexion')));
  out[d.ids.pp]=rigid(m1);out[d.ids.mp]=rigid(m2);out[d.ids.dp]=rigid(m3);
 }
 return out;
}

// ---- skinning weights -------------------------------------------------------------------------------------------------------------------------

/** Structures that stay on the hand frame however the fingers move (see withDigitWeights). */
const HAND_ONLY=/dorsal venous network|palmar (?:venous |arterial )?arch|dorsal carpal (?:venous|arterial) (?:network|arch)/i;
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
export function withDigitWeights(side:Side,weights:number[],x:number,y:number,z:number,frameCount:number,name=''):number[]{
 const out=weights.slice(0,frameCount);while(out.length<frameCount)out.push(0);
 const hand=out[6];if(!(hand>1e-6))return out;
 // The dorsal venous network and the palmar arches end at the knuckle line, a few millimetres before the first finger joint. They belong to the back and the palm of the hand;
 // letting the start of a finger take them (the blend begins 10 mm before the joint) dragged their cut ends round the proximal phalanges into loops when the fingers curled.
 if(HAND_ONLY.test(name))return out;
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

// ---- clearance from the bones ------------------------------------------------------------------------------------------------------------------

/** For a soft vertex lying beside the shaft of a digit that carries it: which digit chain, and how far it lies from the digit's bone line in the rest pose (metres). */
export interface DigitClearance{chain:number;rest:number;/** share of the vertex weight carried by the digit's own frames: the correction fades in from 0.45 to 0.8 */carried:number}
export function digitClearanceOf(side:Side,p:T.Vector3,weights:ArrayLike<number>):DigitClearance|null{
 let best:DigitClearance|null=null,bestScore=Infinity;
 chainsOf(side).forEach((chain,index)=>{
  const {distance}=nearest(chain.points,p),along=p.clone().sub(chain.origin).dot(chain.axis);
  if(distance>chain.radius+.009||along<.004)return;
  const carried=chain.frames.reduce((s,f)=>s+(weights[f]??0),0);
  if(carried<.45||distance>=bestScore)return;
  best={chain:index,rest:distance,carried};bestScore=distance;
 });
 return best;
}
/** The bone line of a digit in the current pose: joint centres and tip carried by the frame of the bone that ends there (`carry` applies a frame's transform to a point). */
export function posedChain(side:Side,chain:number,carry:(frame:number,p:T.Vector3)=>T.Vector3):T.Vector3[]{
 const c=chainsOf(side)[chain],owner=[0,0,1,2];
 return c.points.map((pt,i)=>carry(c.frames[owner[i]],pt));
}
/**
 * Keeps a vertex that rides on a digit at its rest distance from the bone line: tendons, vessels and nerves are neither pulled through the bone on the inside of a
 * bent joint (where blending two segments squeezes them against it) nor lifted away from it. `w` is moved along the line from the nearest bone point.
 */
export function keepOnBone(side:Side,clearance:DigitClearance,line:T.Vector3[],w:T.Vector3){
 const radius=chainsOf(side)[clearance.chain].radius,fade=smooth((clearance.carried-.45)/.35),from=w.clone();
 // inside the bone: out to the rest distance (but at least the bone surface); lifted off it by more than 1.5 mm: back to within 1.5 mm of the rest distance.
 // On the inside of a bent joint the two neighbouring segments both press on the vertex, so the push is repeated until the nearest segment changes no more.
 const floor=Math.min(clearance.rest,Math.max(clearance.rest*.95,radius*.8)),ceiling=Math.max(clearance.rest+.0015,floor),x=w.clone();
 for(let pass=0;pass<4;pass++){
  let best=Infinity,q=line[0];
  for(let k=0;k+1<line.length;k++){
   const a=line[k],ab=line[k+1].clone().sub(a),t=clamp01(x.clone().sub(a).dot(ab)/Math.max(1e-12,ab.lengthSq())),c=a.clone().addScaledVector(ab,t),d=c.distanceTo(x);
   if(d<best){best=d;q=c;}
  }
  const target=Math.min(Math.max(best,floor),ceiling);
  if(Math.abs(target-best)<2e-5)break;
  const dir=x.clone().sub(q);if(dir.lengthSq()<1e-12)break;
  x.copy(q).addScaledVector(dir.normalize(),target);
 }
 w.copy(from).lerp(x,fade);
}
