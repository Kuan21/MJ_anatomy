import type {Atlas,Part,PartTransform,SceneState} from '../anatomy';
import {BufferAttribute,BufferGeometry} from 'three';
import {makeSoftRig,bindTissue,makePalette,deformTissue,deformPoint,tissueBindings,resolveNeurovascularProfile} from './soft-tissue';
import {makeShoulderMuscles,solveShoulderMuscles} from './shoulder-muscles';
import {makeSurfaceConstraints,constrainSurface} from './surface-constraints';
import {prepareSurfaceNormals,updateSurfaceNormals} from '../surface-normals';
import landmarks from './shoulder-landmarks.json';
import {makeBodyRig,buildBodyMotion} from './body-motion';
import {bindBodyPart} from './body-part';
import {anatomicalRegion,isMotionQuarantined} from '../mj-part-regions';

export type ShoulderInput={part:Part;base:Float32Array;triangles:Uint32Array;normals:Int16Array};
export type ShoulderResult={id:string;positions:Float32Array;normals:Int16Array;bounds:[number[],number[]]};
export function createShoulderSolver(atlas:Atlas){
 const rigs={left:makeSoftRig(atlas,'left')!,right:makeSoftRig(atlas,'right')!};
 const members=new Map<string,ShoulderInput&{skin:ReturnType<typeof bindTissue>;positions:Float32Array;side:'left'|'right';geometry:BufferGeometry;guard?:ReturnType<typeof makeSurfaceConstraints>}>();
 const models=new Map<string,ReturnType<typeof makeShoulderMuscles>>();
 return(inputs:ShoulderInput[],transforms:Record<string,PartTransform>)=>{
  if(inputs.length)models.clear();
  for(const input of inputs){
   const binding=tissueBindings[input.part.id];
   if(!binding||binding.name!==input.part.name||isMotionQuarantined(input.part)||!['upper-limb','trunk'].includes(anatomicalRegion(input.part)))continue;
   const profile=['arterial','venous'].includes(input.part.system)?resolveNeurovascularProfile(input.part.name,binding.profile):binding.profile;
   const skin=bindTissue(rigs[binding.side],profile,input.base,input.part),positions=input.base.slice(),geometry=new BufferGeometry();
   geometry.setAttribute('position',new BufferAttribute(positions,3));geometry.setAttribute('normal',new BufferAttribute(input.normals.slice(),3,true));geometry.setIndex(new BufferAttribute(input.triangles,1));prepareSurfaceNormals(geometry);
   const guard=['chest','scapular'].includes(skin.profile)?makeSurfaceConstraints(input.base,input.triangles,skin):undefined;
   members.set(input.part.id,{...input,side:binding.side,skin,positions,geometry,guard});
  }
  const results:ShoulderResult[]=[];
  for(const side of ['left','right'] as const){
   const rig=rigs[side];if(!transforms[rig.ids[3]!])continue;
   const palette=makePalette(rig,transforms),groups=new Map<string,(typeof members extends Map<string,infer M>?M:never)[]>();
   for(const m of members.values())if(m.side===side){
    deformTissue(m.skin,m.base,palette,m.positions);
    if(m.guard)constrainSurface(m.guard,m.positions);
    if(!m.skin.fibre&&!['deltoid','cuff'].includes(m.skin.profile))continue;
    const key=['deltoid','biceps','triceps'].includes(m.skin.profile)?side+':'+m.skin.profile:m.part.id;
    const list=groups.get(key)??[];list.push(m);groups.set(key,list);
   }
   const head=deformPoint(rig.shoulder,[0,0,0,1,0,0,0],palette);
   for(const [key,group] of groups){
    let model=models.get(key);
    if(!model){model=makeShoulderMuscles(group,rig.shoulder,landmarks.sides[side].headRadius);models.set(key,model);}
    solveShoulderMuscles(model,head);
   }
   for(const m of members.values())if(m.side===side){
    updateSurfaceNormals(m.geometry);m.geometry.computeBoundingBox();
    results.push({id:m.part.id,positions:m.positions.slice(),normals:(m.geometry.getAttribute('normal').array as Int16Array).slice(),bounds:[m.geometry.boundingBox!.min.toArray(),m.geometry.boundingBox!.max.toArray()]});
   }
  }
  return results;
 };
}

export function createBodySolver(atlas:Atlas){
 const rigs={head:makeBodyRig(atlas,'head'),spine:makeBodyRig(atlas,'spine'),leftLeg:makeBodyRig(atlas,'leftLeg'),rightLeg:makeBodyRig(atlas,'rightLeg')};
 const softRigs={left:makeSoftRig(atlas,'left'),right:makeSoftRig(atlas,'right')};
 const sources=new Map<string,ShoulderInput>();
 type Member={input:ShoulderInput;skin:NonNullable<ReturnType<typeof bindBodyPart>>['skin'];positions:Float32Array;geometry:BufferGeometry;guard?:ReturnType<typeof makeSurfaceConstraints>};
 const bound=new Map<string,Member|null>();
 return(inputs:ShoulderInput[],motion:NonNullable<SceneState['bodyMotion']>)=>{
  for(const input of inputs)sources.set(input.part.id,input);
  const rig=rigs[motion.region],palette=buildBodyMotion(rig,motion.pose).palette,results:ShoulderResult[]=[];
  for(const input of sources.values()){
   const key=motion.region+':'+input.part.id;
   if(!bound.has(key)){
    const binding=bindBodyPart(input.part,input.base,rig,softRigs);
    if(!binding){bound.set(key,null);continue;}
    const positions=input.base.slice(),geometry=new BufferGeometry();
    geometry.setAttribute('position',new BufferAttribute(positions,3));geometry.setAttribute('normal',new BufferAttribute(input.normals.slice(),3,true));geometry.setIndex(new BufferAttribute(input.triangles,1));prepareSurfaceNormals(geometry);
    bound.set(key,{input,skin:binding.skin,positions,geometry,guard:binding.guard?makeSurfaceConstraints(input.base,input.triangles,binding.skin):undefined});
   }
   const member=bound.get(key);if(!member)continue;
   deformTissue(member.skin,input.base,palette,member.positions);if(member.guard)constrainSurface(member.guard,member.positions);
   updateSurfaceNormals(member.geometry);member.geometry.computeBoundingBox();
   results.push({id:input.part.id,positions:member.positions.slice(),normals:(member.geometry.getAttribute('normal').array as Int16Array).slice(),bounds:[member.geometry.boundingBox!.min.toArray(),member.geometry.boundingBox!.max.toArray()]});
  }
  return results;
 };
}

let solve:ReturnType<typeof createShoulderSolver>,solveBody:ReturnType<typeof createBodySolver>;
const sources=new Map<string,ShoulderInput>(),seenUpper=new Set<string>(),seenBody=new Set<string>();
if(typeof self!=='undefined')self.onmessage=(event:MessageEvent<{atlas?:Atlas;inputs:ShoulderInput[];transforms:Record<string,PartTransform>;bodyMotion?:SceneState['bodyMotion']}>)=>{
 try{
  if(event.data.atlas){solve=createShoulderSolver(event.data.atlas);solveBody=createBodySolver(event.data.atlas);sources.clear();seenUpper.clear();seenBody.clear();}
  for(const input of event.data.inputs)sources.set(input.part.id,input);
  const seen=event.data.bodyMotion?seenBody:seenUpper,inputs=[...sources.values()].filter(input=>!seen.has(input.part.id));
  inputs.forEach(input=>seen.add(input.part.id));
  const results=event.data.bodyMotion?solveBody(inputs,event.data.bodyMotion):solve(inputs,event.data.transforms);
  self.postMessage({results},{transfer:results.flatMap(r=>[r.positions.buffer,r.normals.buffer])});
 }catch(error){self.postMessage({error:error instanceof Error?error.message:String(error)});}
};
