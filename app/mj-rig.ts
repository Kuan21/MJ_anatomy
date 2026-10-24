import * as T from 'three';
import type {Atlas} from './anatomy';

/**
 * MJ shared segment chain ("rig").
 *
 * One rig is built per atlas from catalogue metadata only (names + bounds), so it
 * exists before any geometry chunk arrives. Every renderer, picker and motion
 * builder reads the same segments, which is what keeps bones, muscles and
 * neurovascular paths moving as one body instead of as rigid per-part blocks.
 *
 * Tree (weight paths follow anatomical adjacency):
 *   thorax ─┬─ {side}.scapula → {side}.humerus ─┬─ {side}.ulna
 *           │                                   └─ {side}.radius → {side}.hand
 *           └─ pelvis → {side}.femur → {side}.tibia → {side}.foot
 *
 * Adding a region means adding a LimbChain to LIMB_CHAINS: bones are mapped by
 * exact skeletal names, capsules describe the segment's soft-tissue envelope and
 * `pivot` is the proximal joint centre a motion builder rotates about.
 */
export type Side='left'|'right';
export type LimbKind='axial'|'upper'|'lower';
export interface Capsule{a:T.Vector3;b:T.Vector3;r:number}
export interface Segment{id:string;index:number;parent:number;depth:number;limb:LimbKind;side?:Side;bones:number[];capsules:Capsule[];pivot:T.Vector3;/** distal joint centre, when the segment has one */end?:T.Vector3;/** blend group, see RigGroup */group:number}
/**
 * Blend groups: the trunk with both girdles, and each free limb. Segments inside a
 * group blend smoothly across their joints; different groups only blend smoothly
 * near the joint that connects them (`junction`), so an arm resting against the
 * trunk is not glued to it.
 */
export interface RigGroup{id:string;junction?:T.Vector3}
export interface Rig{segments:Segment[];byId:Map<string,Segment>;groups:RigGroup[];boneSegment:Map<number,number>;scale:number}
interface SegmentSeed{id:string;parent:string|null;limb:LimbKind;side?:Side;bones:number[];capsules:Capsule[];pivot:T.Vector3;end?:T.Vector3}
export interface LimbChain{limb:LimbKind;build(ctx:RigContext,side:Side):SegmentSeed[]}

const norm=(s:string)=>s.trim().toLowerCase();
const cap=(side:Side)=>side[0].toUpperCase()+side.slice(1);
export const segmentId=(side:Side,key:string)=>`${side}.${key}`;

export class RigContext{
 readonly scale:number;
 constructor(readonly atlas:Atlas){const b=this.box(atlas.parts.map((_,i)=>i));this.scale=Math.max(.5,b.max.y-b.min.y)/1.73;}
 skeletal(){return this.atlas.parts.map((p,i)=>({p,i})).filter(x=>x.p.system==='skeletal');}
 exact(name:string){return this.skeletal().filter(x=>norm(x.p.name)===norm(name)).map(x=>x.i);}
 matching(side:Side,re:RegExp){return this.skeletal().filter(x=>{const n=norm(x.p.name);return n.includes(side)&&re.test(n);}).map(x=>x.i);}
 box(indices:number[]){const b=new T.Box3();indices.forEach(i=>{const p=this.atlas.parts[i];if(p)b.union(new T.Box3(new T.Vector3().fromArray(p.bounds[0]),new T.Vector3().fromArray(p.bounds[1])));});return b;}
 center(indices:number[]){return this.box(indices).getCenter(new T.Vector3());}
 /** Endpoints of a box along its longest extent, through the box centre. */
 ends(indices:number[]){
  const box=this.box(indices),c=box.getCenter(new T.Vector3()),s=box.getSize(new T.Vector3());let axis=0;if(s.y>s.x&&s.y>=s.z)axis=1;else if(s.z>s.x&&s.z>s.y)axis=2;
  const a=c.clone(),b=c.clone();a.setComponent(axis,box.min.getComponent(axis));b.setComponent(axis,box.max.getComponent(axis));return[a,b] as [T.Vector3,T.Vector3];
 }
 /** Returns [end nearer `to`, end farther from `to`]. */
 orient(indices:number[],to:T.Vector3){const[a,b]=this.ends(indices);return a.distanceToSquared(to)<=b.distanceToSquared(to)?[a,b] as const:[b,a] as const;}
 /** Midpoint of the closest pair of long-axis endpoints of two bone groups. */
 joint(a:number[],b:number[]){let best=new T.Vector3(),d=Infinity;for(const p of this.ends(a))for(const q of this.ends(b)){const x=p.distanceToSquared(q);if(x<d){d=x;best=p.clone().add(q).multiplyScalar(.5);}}return best;}
}

const HAND=/metacarpal bone|phalanx .* (finger|thumb)|scaphoid|lunate|triquetr|pisiform|trapezium|trapezoid|capitate|hamate/;
const FOOT=/talus|calcaneus|cuboid|cuneiform bone|navicular bone of|metatarsal|phalanx .* toe|sesamoid bone of/;
/** Catalogue entries filed as skeletal that are really muscles/tendons; they must deform, not stay rigid. */
export const SOFT_TISSUE_FILED_AS_SKELETAL=/levator scapulae|subscapularis|fibularis|tibialis|iliotibial tract/;

export interface UpperLimbBones{clavicle:number[];scapula:number[];humerus:number[];ulna:number[];radius:number[];hand:number[]}
export function mapUpperLimbBones(atlas:Atlas,side:Side,ctx=new RigContext(atlas)):UpperLimbBones{
 const c=cap(side);
 return{clavicle:ctx.exact(`${c} clavicle`),scapula:ctx.exact(`${c} scapula`),humerus:ctx.exact(`${c} humerus`),ulna:ctx.exact(`${c} ulna`),radius:ctx.exact(`${c} radius`),hand:ctx.matching(side,HAND)};
}
export interface LowerLimbBones{hip:number[];femur:number[];tibia:number[];fibula:number[];patella:number[];foot:number[]}
export function mapLowerLimbBones(atlas:Atlas,side:Side,ctx=new RigContext(atlas)):LowerLimbBones{
 const c=cap(side);
 return{hip:ctx.exact(`${c} hip bone`),femur:ctx.exact(`${c} femur`),tibia:ctx.exact(`${c} tibia`),fibula:ctx.exact(`${c} fibula`),patella:ctx.exact(`${c} patella`),foot:ctx.matching(side,FOOT)};
}

export const UPPER_LIMB_CHAIN:LimbChain={limb:'upper',build(ctx,side){
 const b=mapUpperLimbBones(ctx.atlas,side,ctx),u=ctx.scale,limb='upper' as const;
 if(!b.humerus.length||!b.ulna.length||!b.radius.length)return[];
 const scapulaCenter=ctx.center(b.scapula),[headTop,humerusEnd]=ctx.orient(b.humerus,scapulaCenter);
 // Glenohumeral centre: one humeral-head radius below the top of the humerus along its shaft.
 const shoulder=headTop.clone().addScaledVector(humerusEnd.clone().sub(headTop).normalize(),.022*u);
 const elbow=ctx.joint(b.humerus,[...b.ulna,...b.radius]);
 const wrist=b.hand.length?ctx.joint([...b.ulna,...b.radius],b.hand):ctx.orient([...b.ulna,...b.radius],elbow)[1];
 const handTip=b.hand.length?ctx.orient(b.hand,wrist)[1]:wrist.clone();
 const midline=new T.Vector3(0,shoulder.y,shoulder.z),[sc]=b.clavicle.length?ctx.orient(b.clavicle,midline):[shoulder];
 const [ulnaTop,ulnaEnd]=ctx.orient(b.ulna,elbow),[radialHead,radiusEnd]=ctx.orient(b.radius,elbow);
 const girdle:Capsule[]=[{a:sc.clone(),b:shoulder.clone(),r:.035*u}];
 // Thin: the scapula is a plate gliding on the ribs, so only tissue right on it should follow it.
 if(b.scapula.length){const[s0,s1]=ctx.ends(b.scapula);girdle.push({a:s0,b:s1,r:.012*u});}
 return[
  {id:segmentId(side,'scapula'),parent:'thorax',limb,side,bones:[...b.clavicle,...b.scapula],capsules:girdle,pivot:sc.clone(),end:shoulder.clone()},
  {id:segmentId(side,'humerus'),parent:segmentId(side,'scapula'),limb,side,bones:b.humerus,capsules:[{a:shoulder.clone(),b:elbow.clone(),r:.045*u}],pivot:shoulder.clone(),end:elbow.clone()},
  {id:segmentId(side,'ulna'),parent:segmentId(side,'humerus'),limb,side,bones:b.ulna,capsules:[{a:ulnaTop,b:ulnaEnd,r:.032*u}],pivot:elbow.clone(),end:ulnaEnd.clone()},
  {id:segmentId(side,'radius'),parent:segmentId(side,'humerus'),limb,side,bones:b.radius,capsules:[{a:radialHead,b:radiusEnd,r:.032*u}],pivot:radialHead.clone(),end:radiusEnd.clone()},
  {id:segmentId(side,'hand'),parent:segmentId(side,'radius'),limb,side,bones:b.hand,capsules:[{a:wrist.clone(),b:handTip,r:.03*u}],pivot:wrist.clone(),end:handTip.clone()},
 ];
}};

export const LOWER_LIMB_CHAIN:LimbChain={limb:'lower',build(ctx,side){
 const b=mapLowerLimbBones(ctx.atlas,side,ctx),u=ctx.scale,limb='lower' as const;
 if(!b.femur.length||!b.tibia.length)return[];
 const hipCenter=ctx.center(b.hip.length?b.hip:b.femur),[hip]=ctx.orient(b.femur,hipCenter);
 const leg=[...b.tibia,...b.fibula],knee=ctx.joint(b.femur,leg);
 const ankle=b.foot.length?ctx.joint(leg,b.foot):ctx.orient(leg,knee)[1];
 const toe=b.foot.length?ctx.orient(b.foot,ankle)[1]:ankle.clone();
 return[
  {id:segmentId(side,'femur'),parent:'pelvis',limb,side,bones:b.femur,capsules:[{a:hip.clone(),b:knee.clone(),r:.065*u}],pivot:hip.clone(),end:knee.clone()},
  {id:segmentId(side,'tibia'),parent:segmentId(side,'femur'),limb,side,bones:[...leg,...b.patella],capsules:[{a:knee.clone(),b:ankle.clone(),r:.048*u}],pivot:knee.clone(),end:ankle.clone()},
  {id:segmentId(side,'foot'),parent:segmentId(side,'tibia'),limb,side,bones:b.foot,capsules:[{a:ankle.clone(),b:toe,r:.035*u}],pivot:ankle.clone(),end:toe.clone()},
 ];
}};

/** Register new regions here; the shader, picker and weight builder need no changes. */
export const LIMB_CHAINS:LimbChain[]=[UPPER_LIMB_CHAIN,LOWER_LIMB_CHAIN];

function axialSeeds(ctx:RigContext):SegmentSeed[]{
 const u=ctx.scale,sk=ctx.skeletal(),pick=(re:RegExp)=>sk.filter(x=>re.test(norm(x.p.name))).map(x=>x.i);
 const ribs=ctx.box(pick(/\brib\b/)),spine=ctx.box(pick(/vertebra|sacrum|atlas|axis/)),skull=ctx.box(pick(/frontal bone|occipital bone|parietal bone/));
 const pelvisBones=pick(/hip bone|sacrum|coccyx/),pelvis=ctx.box(pelvisBones);
 const thorax:Capsule[]=[];
 if(!spine.isEmpty()){const c=spine.getCenter(new T.Vector3());thorax.push({a:new T.Vector3(c.x,pelvis.isEmpty()?spine.min.y:pelvis.max.y,c.z),b:new T.Vector3(c.x,skull.isEmpty()?spine.max.y:skull.max.y-.06*u,c.z),r:.065*u});}
 if(!ribs.isEmpty()){
  // The rib cage is wider than deep: two lateral capsules approximate its elliptical section.
  const c=ribs.getCenter(new T.Vector3()),s=ribs.getSize(new T.Vector3()),r=s.z/2,x=Math.max(0,s.x/2-r),top=ribs.min.y+s.y*.65;
  for(const k of[-1,1])thorax.push({a:new T.Vector3(c.x+k*x,pelvis.isEmpty()?ribs.min.y:pelvis.max.y,c.z),b:new T.Vector3(c.x+k*x,top,c.z),r});
 }
 if(!thorax.length)thorax.push({a:new T.Vector3(0,.9*u,0),b:new T.Vector3(0,1.5*u,0),r:.12*u});
 const seeds:SegmentSeed[]=[{id:'thorax',parent:null,limb:'axial',bones:[],capsules:thorax,pivot:thorax[0].a.clone()}];
 if(!pelvis.isEmpty()){
  const c=pelvis.getCenter(new T.Vector3()),s=pelvis.getSize(new T.Vector3()),r=Math.min(s.z/2,.09*u),x=Math.max(0,s.x/2-r);
  seeds.push({id:'pelvis',parent:'thorax',limb:'axial',bones:pelvisBones,capsules:[{a:new T.Vector3(c.x-x,c.y,c.z),b:new T.Vector3(c.x+x,c.y,c.z),r}],pivot:new T.Vector3(c.x,pelvis.max.y,c.z)});
 }
 return seeds;
}

export function buildRig(atlas:Atlas,chains:LimbChain[]=LIMB_CHAINS):Rig{
 const ctx=new RigContext(atlas),seeds=axialSeeds(ctx);
 for(const chain of chains)for(const side of['left','right'] as Side[])seeds.push(...chain.build(ctx,side));
 const byId=new Map<string,Segment>(),segments:Segment[]=[],groups:RigGroup[]=[{id:'axial'}];
 for(const s of seeds){
  const parent=s.parent?byId.get(s.parent):undefined;if(s.parent&&!parent)continue;
  // The shoulder girdle rides on the thorax, so it blends with the trunk; free limbs start at their root joint.
  const groupId=s.limb==='axial'||s.id.endsWith('.scapula')?'axial':`${s.side}.${s.limb}`;let group=groups.findIndex(g=>g.id===groupId);
  if(group<0){group=groups.length;groups.push({id:groupId,junction:s.pivot.clone()});}
  const seg:Segment={...s,index:segments.length,parent:parent?.index??-1,depth:parent?parent.depth+1:0,group};segments.push(seg);byId.set(seg.id,seg);
 }
 const boneSegment=new Map<number,number>();segments.forEach(s=>s.bones.forEach(i=>{if(!SOFT_TISSUE_FILED_AS_SKELETAL.test(norm(atlas.parts[i].name)))boneSegment.set(i,s.index);}));
 return{segments,byId,groups,boneSegment,scale:ctx.scale};
}
const cache=new WeakMap<Atlas,Rig>();
/** Shared rig instance: the scene, picker and motion builders must agree on segment indices. */
export function rigFor(atlas:Atlas){let rig=cache.get(atlas);if(!rig){rig=buildRig(atlas);cache.set(atlas,rig);}return rig;}

/** Segment path for a structure spanning a→b. Side-by-side branches of one limb (ulna↔radius) connect directly rather than through their parent. */
export function segmentPath(rig:Rig,a:number,b:number):number[]{
 const up=(i:number)=>{const out:number[]=[];for(let k=i;k>=0;k=rig.segments[k].parent)out.push(k);return out;};
 const pa=up(a),pb=up(b),lca=pa.find(k=>pb.includes(k))??0;
 const left=pa.slice(0,pa.indexOf(lca)),right=pb.slice(0,pb.indexOf(lca)).reverse();
 // Inside one limb the branches below a shared parent sit side by side (ulna beside radius→hand): connect them directly.
 const sameLimb=left.length>0&&right.length>0&&rig.segments[a].limb!=='axial'&&rig.segments[a].limb===rig.segments[b].limb&&rig.segments[a].side===rig.segments[b].side;
 return sameLimb?[...left,...right]:[...left,lca,...right];
}
