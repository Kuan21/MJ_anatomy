// A positive whole-mesh volume can conceal locally inverted tissue. Exercise
// signed interior cells separately from the existing edge/total-volume tests.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Vector3} from 'three';
import {cellDeterminant,constrainMuscleCells} from '../.sites-runtime/muscle-cells.mjs';
import * as soft from '../.sites-runtime/soft-tissue.mjs';
import * as motion from '../.sites-runtime/mj-motion.mjs';
import * as muscles from '../.sites-runtime/shoulder-muscles.mjs';
import {normalizeAtlasSystems} from '../.sites-runtime/mj-system-classifier.mjs';
{
 const rest=new Float32Array([0,0,0,.02,0,0,0,.02,0,0,0,.02]);
 const cells={nodes:new Uint32Array([0,1,2,3]),volumes:new Float32Array([cellDeterminant(rest,0,3,6,9)])};
 const p=rest.slice();p[11]=-.01;const pinned=p.slice(0,9);
 assert.ok(cellDeterminant(p,0,3,6,9)/cells.volumes[0]<0);
 for(let i=0;i<64;i++)constrainMuscleCells(cells,p,new Float32Array([0,0,0,1]));
 assert.ok(cellDeterminant(p,0,3,6,9)/cells.volumes[0]>.149);
 assert.deepEqual(p.slice(0,9),pinned,'inversion recovery moved fixed attachments');
 const unchanged=rest.slice();constrainMuscleCells(cells,unchanged,new Float32Array([1,1,1,1]));assert.deepEqual(unchanged,rest);
}
const atlas=normalizeAtlasSystems(JSON.parse(fs.readFileSync('public/models/atlas.json'))),buffers=atlas.chunks.map(c=>fs.readFileSync('public'+c.url));
const landmarks=JSON.parse(fs.readFileSync('app/biomechanics-v2/shoulder-landmarks.json'));
const cases=[{}, {shoulderAbduction:90,shoulderRotation:48,elbowFlexion:140,forearmRotation:80,wristFlexion:17}, {shoulderFlexion:82,shoulderAbduction:143,shoulderRotation:48,elbowFlexion:140,forearmRotation:80,wristFlexion:80}, {shoulderFlexion:82,shoulderAbduction:143,shoulderRotation:-60,elbowFlexion:44,forearmRotation:60,wristFlexion:80,wristDeviation:20}, {shoulderAbduction:70,elbowFlexion:90,forearmRotation:-80,wristFlexion:-70}];
let beforeInverted=0,afterInverted=0,totalCells=0,maxVolumeError=0,maxDisplacement=0,maxEdge=0,parts=0;
for(const side of ['left','right']){
 const rig=soft.makeSoftRig(atlas,side),groups=new Map();
 for(const part of atlas.parts){
  const binding=soft.tissueBindings[part.id];if(binding?.side!==side||part.system!=='muscular')continue;
  const b=buffers[part.chunk],base=new Float32Array(b.buffer,b.byteOffset+part.positions,part.vertexCount*3).slice(),skin=soft.bindTissue(rig,binding.profile,base,part);
  if(!skin.fibre&&!['deltoid','cuff'].includes(skin.profile))continue;
  const key=['deltoid','biceps','triceps'].includes(skin.profile)?skin.profile:part.id,list=groups.get(key)??[];
  list.push({part,base,positions:base.slice(),triangles:new Uint32Array(b.buffer,b.byteOffset+part.indices,part.indexCount),skin});groups.set(key,list);parts++;
 }
 for(const members of groups.values()){
  const model=muscles.makeShoulderMuscles(members,rig.shoulder,landmarks.sides[side].headRadius);
  for(const input of cases){
   const palette=soft.makePalette(rig,motion.buildUpperLimbMotion(atlas,side,{...motion.NEUTRAL_POSE,...input}).transforms),head=soft.deformPoint(rig.shoulder,[0,0,0,1,0,0,0],palette);
   members.forEach(m=>soft.deformTissue(m.skin,m.base,palette,m.positions));
   const before=members.map(m=>m.positions.slice());
   const inspect=()=>{
    members.forEach((m,k)=>model.group.maps[k].forEach((n,i)=>model.group.positions.set(m.positions.subarray(i*3,i*3+3),n*3)));
    let inverted=0,total=0;
    for(const m of model.muscles)for(let c=0;c<m.cells.volumes.length;c++){
     const ns=m.cells.nodes.subarray(c*4,c*4+4);if(!ns.some(n=>model.group.constraints.mobility[n]>0))continue;
     const v=cellDeterminant(model.group.positions,...Array.from(ns,n=>n*3))/m.cells.volumes[c];
     if(v<-.01)inverted++;total++;
    }
    return{inverted,total};
   };
   // The previous release already applied bulk shoulder constraints. Use
   // that baseline (material-cell projection disabled), not raw shoulder skinning.
   if(!model.longitudinal){
    const saved=model.muscles.map(m=>m.cells.volumes);
    model.muscles.forEach(m=>m.cells.volumes=new Float32Array());
    muscles.solveShoulderMuscles(model,head);
    model.muscles.forEach((m,i)=>m.cells.volumes=saved[i]);
   }
   const old=inspect();members.forEach((m,k)=>m.positions.set(before[k]));muscles.solveShoulderMuscles(model,head);const next=inspect();
   beforeInverted+=old.inverted;afterInverted+=next.inverted;totalCells+=next.total;
   // Every part must improve or remain within two numerical/local exceptions.
   assert.ok(next.inverted<=old.inverted+2,`${members[0].part.name}: inversion regression ${old.inverted} -> ${next.inverted}`);
   for(const m of model.muscles){
    const error=Math.abs(muscles.muscleVolume(model.group.positions,m.triangles,head)/m.volume-1);maxVolumeError=Math.max(maxVolumeError,error);
    assert.ok(error<.06,`${members[0].part.name}: bulk volume changed ${error}`);
   }
   members.forEach((m,k)=>{
    assert.ok(m.positions.every(Number.isFinite));
    model.group.maps[k].forEach((node,i)=>{
     if(model.group.constraints.mobility[node]===0)assert.deepEqual(m.positions.slice(i*3,i*3+3),before[k].slice(i*3,i*3+3),'attachment moved');
     maxDisplacement=Math.max(maxDisplacement,Math.hypot(...[0,1,2].map(c=>m.positions[i*3+c]-before[k][i*3+c])));
    });
    if(!Object.keys(input).length)assert.deepEqual(m.positions,m.base,'rest changed');
    for(let i=0;i<m.triangles.length;i+=3)for(let k=0;k<3;k++){
     const a=m.triangles[i+k]*3,b=m.triangles[i+(k+1)%3]*3,d=p=>Math.hypot(p[a]-p[b],p[a+1]-p[b+1],p[a+2]-p[b+2]);
     if(d(m.base)>.0002)maxEdge=Math.max(maxEdge,d(m.positions)/d(m.base));
    }
   });
  }
 }
}
assert.ok(afterInverted<beforeInverted*.12,'local cell inversion was not substantially reduced');
assert.ok(maxEdge<4.2,'new mesh spike');
console.log({parts,poses:cases.length,beforeInverted,afterInverted,totalCells,inversionReduction:1-afterInverted/beforeInverted,maxVolumeError,maxDisplacement,maxEdge});
console.log('Signed material cells, bilateral combined poses, attachments, volume and neutral reset PASS');
