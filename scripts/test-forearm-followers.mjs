// Run after test-soft-tissue.mjs. Source meshes and independent joints.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {Vector3,Quaternion} from 'three';
import * as soft from '../.sites-runtime/soft-tissue.mjs';
import * as motion from '../.sites-runtime/mj-motion.mjs';
const atlas=JSON.parse(fs.readFileSync('public/models/atlas.json')),sources=JSON.parse(fs.readFileSync('app/biomechanics-v2/pectoral-followers.json')).parts,meshes=[];
for(const p of atlas.parts){const binding=soft.tissueBindings[p.id];if(binding?.profile!=='forearm'&&!sources[p.name])continue;const b=fs.readFileSync('public'+atlas.chunks[p.chunk].url);meshes.push({name:p.name,part:p,side:binding.side,profile:binding.profile,base:new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3).slice(),idx:new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount)});}
for(const c of JSON.parse(fs.readFileSync('public/models/nerve-stream.json')).chunks){const selected=c.meshes.filter(p=>sources[p.name]);if(!selected.length)continue;const b=gunzipSync(fs.readFileSync('public'+c.url));for(const p of selected)meshes.push({name:p.name,side:sources[p.name].side,profile:'path',base:new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3).slice(),idx:new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount)});}
const poses=[];
for(const elbowFlexion of [0,70,140])for(const forearmRotation of [-80,0,80])for(const wristFlexion of [-70,0,70])poses.push({...motion.NEUTRAL_POSE,shoulderAbduction:145,elbowFlexion,forearmRotation,wristFlexion});
poses.push({...motion.NEUTRAL_POSE,shoulderFlexion:150,shoulderAbduction:70,shoulderRotation:60,elbowFlexion:140,forearmRotation:80,wristFlexion:70});
let worst=0,followers=0,muscles=0;
for(const {name,part,side,profile,base,idx} of meshes){
 const rig=soft.makeSoftRig(atlas,side),binding=soft.bindTissue(rig,profile,base,part,name),out=base.slice();let maxRatio=0;
 for(const pose of poses){
  const transforms=motion.buildUpperLimbMotion(atlas,side,pose).transforms,palette=soft.makePalette(rig,transforms);
  soft.deformTissue(binding,base,palette,out);assert.ok(out.every(Number.isFinite),name);
  if(binding.follower){
   const parent=base.slice(),shared=base.slice();soft.deformTissue(binding.follower.parent,base,palette,parent);soft.deformTissue(soft.bindTissue(rig,'path',base),base,palette,shared);
   binding.follower.progress.forEach((t,i)=>{const expected=t<=.10?shared:t>=.70?parent:null;if(expected)for(let k=0;k<3;k++)assert.ok(Math.abs(out[i*3+k]-expected[i*3+k])<2e-7,`${name}: junction/host drift`);});
  }
  if(profile==='forearm')for(let i=0;i<base.length/3;i++)if(binding.indices[i*4]===6&&binding.weights[i*4]>.999999){
   const t=transforms[rig.ids[6]],expected=new Vector3(...base.slice(i*3,i*3+3)).applyQuaternion(new Quaternion(...t.quaternion)).add(new Vector3(...t.translation));assert.ok(expected.distanceTo(new Vector3(...out.slice(i*3,i*3+3)))<3e-7,`${name}: digital tendon drift`);
  }
  const welded=new Map();for(let i=0;i<base.length;i+=3){const key=base.slice(i,i+3).join(',');if(welded.has(key))assert.deepEqual(out.slice(i,i+3),welded.get(key),name+' split seam');else welded.set(key,out.slice(i,i+3));}
  for(let i=0;i<idx.length;i+=3)for(let k=0;k<3;k++){const a=idx[i+k]*3,b=idx[i+(k+1)%3]*3,L=p=>Math.hypot(p[a]-p[b],p[a+1]-p[b+1],p[a+2]-p[b+2]),rest=L(base);if(rest>.0002)maxRatio=Math.max(maxRatio,L(out)/rest);}
 }
 soft.deformTissue(binding,base,soft.makePalette(rig,{}),out);assert.ok(out.every((v,i)=>Math.abs(v-base[i])<2e-7),name+' reset');
 if(/pronator|supinator|brachioradialis|anconeus/i.test(name)){
  soft.deformTissue(binding,base,soft.makePalette(rig,motion.buildUpperLimbMotion(atlas,side,{...motion.NEUTRAL_POSE,wristFlexion:70,wristDeviation:25}).transforms),out);
  assert.ok(out.every((v,i)=>Math.abs(v-base[i])<2e-7),name+' incorrectly follows wrist');
 }
 if(binding.follower){followers++;const changed=base.slice();changed[0]+=.001;assert.throws(()=>soft.bindTissue(rig,profile,changed,part,name),/mismatch/);}else muscles++;
 worst=Math.max(worst,maxRatio);console.log(name,maxRatio.toFixed(3));assert.ok(maxRatio<4.2,`${name}: high-flexion spike ${maxRatio}`);
}
assert.equal(muscles,48);assert.equal(followers,4);
console.log(`${muscles} forearm muscles + ${followers} pectoral nerve/artery followers, ${poses.length} poses each: joint isolation, attachments, seams, hashes and reset PASS; worst edge ratio ${worst.toFixed(3)}`);
