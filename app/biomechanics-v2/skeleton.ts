import {Matrix4, Quaternion, Vector3} from 'three';
import type {Atlas, Part, PartTransform} from '../anatomy';
import bindings from './bone-bindings.json';

export type Side = 'left' | 'right';
export type NodeId = 'thorax' | 'clavicle' | 'scapula' | 'humerus' | 'ulna' | 'radius' | 'carpus' | 'hand';
export interface RigNode {id:NodeId; parent:NodeId|null; pivot:Vector3; partIds:string[]}
export interface SkeletonRig {side:Side; nodes:RigNode[]; warnings:string[]; valid:boolean}
export type LocalPose = Partial<Record<NodeId, Quaternion>>;
const center=(p:Part)=>new Vector3().fromArray(p.bounds[0]).add(new Vector3().fromArray(p.bounds[1])).multiplyScalar(.5);
const endpoint=(p:Part, axis:number, upper:boolean)=>center(p).setComponent(axis,p.bounds[upper?1:0][axis]);

/** Phase 1: explicit, versioned IDs; no region/regex/position-based membership.
 * Bounds-derived pivots are provisional, NOT validated anatomical landmarks.
 * All rest frames use atlas orientation; translations are relative to parent.
 * Radius inherits elbow motion through ulna, while its own DOF never rotates ulna.
 * Carpus/hand inherit radius. This is transform dependency, not joint anatomy.
 */
export function createSkeletonRig(atlas:Atlas,side:Side):SkeletonRig {
 const warnings:string[]=[], mapped=new Map(atlas.parts.map(p=>[p.id,p]));
 const group=bindings[side];
 for(const entries of Object.values(group))for(const entry of entries){
  const p=mapped.get(entry.id);
  if(!p||p.name!==entry.name||p.system!=='skeletal')warnings.push(`Bone binding mismatch: ${entry.id} (${entry.name}).`);
  else if(p.bounds.some(b=>b.length!==3||b.some(v=>!Number.isFinite(v)))||p.bounds[0].some((v,i)=>v>=p.bounds[1][i]))warnings.push(`Invalid bounds: ${entry.id}.`);
 }
 if(warnings.length)return{side,nodes:[],warnings,valid:false};
 const bone=(id:keyof typeof group)=>mapped.get(group[id][0].id)!;
 const clavicle=bone('clavicle'),humerus=bone('humerus'),ulna=bone('ulna'),radius=bone('radius');
 const medial=side==='left'?false:true;
 const pivots:Record<NodeId,Vector3>={
  thorax:new Vector3(),clavicle:endpoint(clavicle,0,medial),scapula:endpoint(clavicle,0,!medial),
  humerus:endpoint(humerus,1,true),
  ulna:endpoint(humerus,1,false).add(endpoint(ulna,1,true)).multiplyScalar(.5),
  radius:endpoint(radius,1,true),carpus:endpoint(radius,1,false),hand:endpoint(radius,1,false)
 };
 const parents:Record<NodeId,NodeId|null>={thorax:null,clavicle:'thorax',scapula:'clavicle',humerus:'scapula',ulna:'humerus',radius:'ulna',carpus:'radius',hand:'carpus'};
 const nodes=(Object.keys(parents) as NodeId[]).map(id=>({id,parent:parents[id],pivot:pivots[id],partIds:id==='thorax'?[]:group[id].map(p=>p.id)}));
 return{side,nodes,warnings,valid:true};
}

/** Absolute pose evaluation from bind state: never accumulate frame transforms.
 * world = parentWorld * translate(bindPivot-parentBindPivot) * localRotation
 * meshDelta = world * inverse(bindWorld). Only rigid bone transforms are emitted.
 */
export function evaluateSkeleton(rig:SkeletonRig,pose:LocalPose={}) {
 const world=new Map<NodeId,Matrix4>(),transforms:Record<string,PartTransform>={};
 if(!rig.valid)return{transforms,world};
 for(const node of rig.nodes){
  const parent=rig.nodes.find(n=>n.id===node.parent);
  const local=node.pivot.clone().sub(parent?.pivot??new Vector3());
  const rotation=pose[node.id]?.clone()??new Quaternion();
  if(!rotation.toArray().every(Number.isFinite)||rotation.lengthSq()<1e-12)throw new Error(`Invalid rotation for ${node.id}`);
  const matrix=(node.parent?world.get(node.parent)!.clone():new Matrix4())
   .multiply(new Matrix4().makeTranslation(local.x,local.y,local.z))
   .multiply(new Matrix4().makeRotationFromQuaternion(rotation.normalize()));
  world.set(node.id,matrix);
  const delta=matrix.clone().multiply(new Matrix4().makeTranslation(-node.pivot.x,-node.pivot.y,-node.pivot.z));
  const translation=new Vector3(),quaternion=new Quaternion(),scale=new Vector3();delta.decompose(translation,quaternion,scale);
  for(const id of node.partIds)transforms[id]={translation:translation.toArray(),quaternion:quaternion.normalize().toArray() as [number,number,number,number]};
 }
 return{transforms,world};
}
