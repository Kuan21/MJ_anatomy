// Run test-soft-tissue.mjs first to compile shared modules.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Vector3,Quaternion} from 'three';
import * as soft from '../.sites-runtime/soft-tissue.mjs';
import * as motion from '../.sites-runtime/mj-motion.mjs';
const atlas=JSON.parse(fs.readFileSync(new URL('../public/models/atlas.json',import.meta.url)));
const buffers=atlas.chunks.map(c=>fs.readFileSync(new URL('../public'+c.url,import.meta.url)));
// Visible slider values in the owner's 2026-10-06 recording, plus a sweep
// between neutral and the reported overhead posture. These are mesh quality
// checks, not claims about physiological muscle strain.
const poses=Array.from({length:12},(_,i)=>({shoulderFlexion:32*i/11,shoulderAbduction:162*i/11,shoulderRotation:28*i/11}));
poses.push({shoulderFlexion:32,shoulderAbduction:162,shoulderRotation:28,elbowFlexion:140,forearmRotation:80,wristFlexion:80});
poses.push({shoulderFlexion:32,shoulderAbduction:162,shoulderRotation:48});
poses.push({shoulderFlexion:161,shoulderAbduction:36,shoulderRotation:0});
let worst=0;
for(const side of ['left','right']){
 const rig=soft.makeSoftRig(atlas,side);
 const parts=atlas.parts.filter(p=>soft.tissueBindings[p.id]?.side===side&&/pectoralis minor|rhomboid|serratus anterior/i.test(p.name));
 assert.equal(parts.length,4);
 for(const p of parts){
  const raw=buffers[p.chunk],base=new Float32Array(raw.buffer,raw.byteOffset+p.positions,p.vertexCount*3).slice();
  const triangles=new Uint32Array(raw.buffer,raw.byteOffset+p.indices,p.indexCount),skin=soft.bindTissue(rig,'scapular',base,p),out=base.slice();
  let max=0;
  for(const pose of poses){
   const palette=soft.makePalette(rig,motion.buildUpperLimbMotion(atlas,side,{...motion.NEUTRAL_POSE,...pose}).transforms);
   soft.deformTissue(skin,base,palette,out);
   if(/serratus anterior/i.test(p.name)){
    assert.ok(skin.wrap,'Serratus must use its chest circumference guide');
    const radius=v=>Math.hypot(v.x/skin.wrap.radiusX,(v.z-skin.wrap.centerZ)/skin.wrap.radiusZ);
    const transform=motion.buildUpperLimbMotion(atlas,side,{...motion.NEUTRAL_POSE,...pose}).transforms[rig.ids[2]];
    const q=new Quaternion(...transform.quaternion),translation=new Vector3(...transform.translation);
    const seams=new Map();
    for(let v=0;v<p.vertexCount;v++){
     const start=new Vector3().fromArray(base,v*3),end=start.clone().applyQuaternion(q).add(translation),posed=new Vector3().fromArray(out,v*3);
     // No additional radial ballooning beyond either carrier position.
     assert.ok(radius(posed)<=Math.max(radius(start),radius(end))+1e-6,'Chest wrap overshot its radial envelope');
     assert.ok(radius(posed)>=Math.min(radius(start),radius(end))-1e-6,'Chest wrap cut through its radial envelope');
     const key=start.toArray().join(','),previous=seams.get(key);
     if(previous)assert.deepEqual(posed.toArray(),previous,'Serratus source seam opened');else seams.set(key,posed.toArray());
    }
   }
   for(let k=0;k<triangles.length;k+=3)for(let e=0;e<3;e++){
    const a=triangles[k+e]*3,b=triangles[k+(e+1)%3]*3;
    const length=v=>Math.hypot(v[a]-v[b],v[a+1]-v[b+1],v[a+2]-v[b+2]);
    if(length(base)>.0005)max=Math.max(max,length(out)/length(base));
   }
  }
  worst=Math.max(worst,max);
  console.log(p.name, 'maximum raw mesh-edge ratio',max.toFixed(3));
  assert.ok(max<3,`${p.name}: recorded shoulder sequence creates a local spike (${max})`);
 }
}
console.log('Recorded shoulder sequence:',poses.length,'poses on each side PASS; worst mesh-edge ratio',worst.toFixed(3));

// The screenshot's posterior vessel loop must not return. This is a mesh
// spike regression, NOT a physiological strain limit or a collision test.
for(const side of ['left','right']){
 const rig=soft.makeSoftRig(atlas,side);
 for(const reported of poses.slice(-2)){
 const palette=soft.makePalette(rig,motion.buildUpperLimbMotion(atlas,side,{...motion.NEUTRAL_POSE,...reported}).transforms);
 let worst=0,count=0;
 for(const p of atlas.parts.filter(p=>soft.tissueBindings[p.id]?.side===side&&['arterial','venous','nervous'].includes(p.system))){
  const raw=buffers[p.chunk],base=new Float32Array(raw.buffer,raw.byteOffset+p.positions,p.vertexCount*3).slice();
  const triangles=new Uint32Array(raw.buffer,raw.byteOffset+p.indices,p.indexCount),skin=soft.bindTissue(rig,'path',base,p),out=base.slice();
  soft.deformTissue(skin,base,palette,out);
  assert.ok(out.every(Number.isFinite),p.name+' nonfinite geometry');
  let max=0;
  for(let k=0;k<triangles.length;k+=3)for(let e=0;e<3;e++){
   const a=triangles[k+e]*3,b=triangles[k+(e+1)%3]*3;
   const length=v=>Math.hypot(v[a]-v[b],v[a+1]-v[b+1],v[a+2]-v[b+2]);
   if(length(base)>.0005)max=Math.max(max,length(out)/length(base));
  }
  assert.ok(max<4,`${p.name}: screenshot pose creates a local neurovascular spike (${max})`);
  worst=Math.max(worst,max);count++;
 }
 assert.ok(count>50,'Expected complete curated neurovascular set');
 console.log(side,count,'neurovascular meshes: screenshot spike regression PASS',worst.toFixed(3));
 }
}
