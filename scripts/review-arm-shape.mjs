// Source-mesh diagnostic; renders the same deformation and shoulder constraint
// stages used by the worker. No browser/GPU validation is implied.
import fs from 'node:fs';
import {Vector3,Quaternion} from 'three';
import * as soft from '../.sites-runtime/soft-tissue.mjs';
import * as motion from '../.sites-runtime/mj-motion.mjs';
import * as muscles from '../.sites-runtime/shoulder-muscles.mjs';
const atlas=JSON.parse(fs.readFileSync('public/models/atlas.json'));
const landmarks=JSON.parse(fs.readFileSync('app/biomechanics-v2/shoulder-landmarks.json'));
const buffers=atlas.chunks.map(c=>fs.readFileSync('public'+c.url));
const side='right',rig=soft.makeSoftRig(atlas,side),rows=[];
for(const part of atlas.parts){
 const b=soft.tissueBindings[part.id];
 if(!(b?.side===side&&['arm','biceps','triceps','forearm','deltoid','cuff','coraco'].includes(b.profile)&&part.system==='muscular')&&!/^Right (humerus|ulna|radius|scapula)$/.test(part.name))continue;
 const buf=buffers[part.chunk],base=new Float32Array(buf.buffer,buf.byteOffset+part.positions,part.vertexCount*3).slice();
 rows.push({part,base,positions:base.slice(),triangles:new Uint32Array(buf.buffer,buf.byteOffset+part.indices,part.indexCount).slice(),skin:b?soft.bindTissue(rig,b.profile,base,part):null});
}
const grouped=new Map();
for(const m of rows){
 if(!m.skin?.fibre&&!['deltoid','cuff'].includes(m.skin?.profile))continue;
 const key=['deltoid','biceps','triceps'].includes(m.skin.profile)?m.skin.profile:m.part.id;
 const list=grouped.get(key)??[];list.push(m);grouped.set(key,list);
}
const models=[...grouped.values()].map(group=>muscles.makeShoulderMuscles(group,rig.shoulder,landmarks.sides[side].headRadius));
const cases={neutral:{},bent:{shoulderAbduction:90,shoulderRotation:48,elbowFlexion:140,forearmRotation:80,wristFlexion:17},raised:{shoulderFlexion:82,shoulderAbduction:143,shoulderRotation:48,elbowFlexion:140,forearmRotation:80,wristFlexion:80},rotated:{shoulderFlexion:82,shoulderAbduction:143,shoulderRotation:-60,elbowFlexion:44,forearmRotation:60,wristFlexion:80,wristDeviation:20}};
const result={};
for(const [name,pose] of Object.entries(cases)){
 const transforms=motion.buildUpperLimbMotion(atlas,side,{...motion.NEUTRAL_POSE,...pose}).transforms,palette=soft.makePalette(rig,transforms);
 for(const m of rows){
  if(m.skin)soft.deformTissue(m.skin,m.base,palette,m.positions);
  else{
   const t=transforms[m.part.id];m.positions.set(m.base);
   if(t)for(let i=0;i<m.base.length;i+=3)new Vector3().fromArray(m.base,i).applyQuaternion(new Quaternion(...t.quaternion)).add(new Vector3(...t.translation)).toArray(m.positions,i);
  }
 }
 models.forEach(model=>muscles.solveShoulderMuscles(model,soft.deformPoint(rig.shoulder,[0,0,0,1,0,0,0],palette)));
 result[name]={pose,rows:rows.map(m=>({id:m.part.id,name:m.part.name,profile:m.skin?.profile??'bone',vertices:[...m.positions],base:[...m.base],indices:[...m.triangles]}))};
 console.log(name,rows.filter(m=>m.skin?.fibre).map(m=>({name:m.part.name,volumeRatio:muscles.muscleVolume(m.positions,m.triangles,new Vector3())/muscles.muscleVolume(m.base,m.triangles,new Vector3())})).sort((a,b)=>a.volumeRatio-b.volumeRatio).filter(m=>Math.abs(m.volumeRatio-1)>.25));
}
const label=process.argv[2]??'candidate';
fs.writeFileSync(`.sites-runtime/arm-shape-${label}.json`,JSON.stringify(result));
