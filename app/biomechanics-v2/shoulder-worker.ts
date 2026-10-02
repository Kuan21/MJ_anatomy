import type {Atlas,Part,PartTransform} from '../anatomy';
import {BufferAttribute,BufferGeometry} from 'three';
import {makeSoftRig,bindTissue,makePalette,deformTissue,deformPoint,tissueBindings,resolveNeurovascularProfile} from './soft-tissue';
import {makeShoulderMuscles,solveShoulderMuscles} from './shoulder-muscles';
import {makeSurfaceConstraints,constrainSurface} from './surface-constraints';
import {prepareSurfaceNormals,updateSurfaceNormals} from '../surface-normals';
import landmarks from './shoulder-landmarks.json';

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
    if(!['deltoid','cuff'].includes(m.skin.profile))continue;
    const key=m.skin.profile==='deltoid'?side+':deltoid':m.part.id;
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

let solve:ReturnType<typeof createShoulderSolver>;
if(typeof self!=='undefined')self.onmessage=(event:MessageEvent<{atlas?:Atlas;inputs:ShoulderInput[];transforms:Record<string,PartTransform>}>)=>{
 try{
  if(event.data.atlas)solve=createShoulderSolver(event.data.atlas);
  const results=solve(event.data.inputs,event.data.transforms);
  self.postMessage({results},{transfer:results.flatMap(r=>[r.positions.buffer,r.normals.buffer])});
 }catch(error){self.postMessage({error:error instanceof Error?error.message:String(error)});}
};
