// Run after test-soft-tissue and test-shoulder-muscles.
import assert from 'node:assert/strict';
import fs from 'node:fs';import {gunzipSync} from 'node:zlib';
import * as soft from '../.sites-runtime/soft-tissue.mjs';
import * as motion from '../.sites-runtime/mj-motion.mjs';
const atlas=JSON.parse(fs.readFileSync('public/models/atlas.json')),fit=JSON.parse(fs.readFileSync('app/biomechanics-v2/deltoid-nerve-followers.json')).parts;
const qa=JSON.parse(fs.readFileSync('.sites-runtime/shoulder-qa.json')),sources=new Map(),hosts=new Map();
for(const p of atlas.parts.filter(p=>/deltoid/.test(p.name)&&p.system==='muscular')){const b=fs.readFileSync('public'+atlas.chunks[p.chunk].url),base=new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3).slice();hosts.set(p.id,{base,posed:base});}
for(const c of JSON.parse(fs.readFileSync('public/models/nerve-stream.json')).chunks){const selected=c.meshes.filter(p=>fit[p.name]);if(!selected.length)continue;const b=gunzipSync(fs.readFileSync('public'+c.url));for(const p of selected)sources.set(p.name,{base:new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3).slice(),idx:new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount).slice()});}
let cases=0,maxEdge=0,oldMaxEdge=0,totalOld=0,totalNew=0;
const poses=[{}, {shoulderAbduction:70,elbowFlexion:140,forearmRotation:80,wristFlexion:14,wristDeviation:20},{shoulderFlexion:74,shoulderAbduction:147,elbowFlexion:140,forearmRotation:80,wristFlexion:14,wristDeviation:20},{shoulderAbduction:165},{shoulderFlexion:165}];
const keys=['neutral','raise60','reportedWrist','abduction165','flexion165'];
// Use matching shoulder transforms/outputs; elbow/wrist cannot affect deltoid.
poses[1].shoulderAbduction=60;
for(const [name,data] of Object.entries(fit)){
 const {base,idx}=sources.get(name),rig=soft.makeSoftRig(atlas,data.side),skin=soft.bindTissue(rig,'path',base,undefined,name),old=soft.bindTissue(rig,'path',base);
 const neutral=base.slice();soft.followDeltoidSurface(name,base,neutral,id=>hosts.get(id));assert.deepEqual(neutral,base);
 const unavailable=Float32Array.from(base,v=>v+.02),unchanged=unavailable.slice();
 soft.followDeltoidSurface(name,base,unavailable,()=>undefined);assert.deepEqual(unavailable,unchanged,'partial loading must retain fallback');
 soft.followDeltoidSurface('unrelated nerve',base,unavailable,id=>hosts.get(id));assert.deepEqual(unavailable,unchanged,'unrelated nerve changed');
 const shift=[.13,-.09,.07],translated=new Map([...hosts].map(([id,h])=>[id,{base:h.base,posed:Float32Array.from(h.base,(v,i)=>v+shift[i%3])}]));
 const rigid=base.slice();soft.followDeltoidSurface(name,base,rigid,id=>translated.get(id));
 data.progress.forEach((t,i)=>{for(let k=0;k<3;k++)assert.ok(Math.abs(rigid[i*3+k]-base[i*3+k]-t*shift[k])<2e-6,'rigid host covariance');});
 for(let k=0;k<poses.length;k++){
  const palette=soft.makePalette(rig,motion.buildUpperLimbMotion(atlas,data.side,{...motion.NEUTRAL_POSE,...poses[k]}).transforms),out=base.slice(),previous=base.slice();
  soft.deformTissue(skin,base,palette,out);soft.deformTissue(old,base,palette,previous);const carrier=out.slice();
  const posed=new Map(qa[data.side+'_'+keys[k]].filter(m=>hosts.has(m.id)).map(m=>[m.id,{base:hosts.get(m.id).base,posed:new Float32Array(m.vertices)}]));
  soft.followDeltoidSurface(name,base,out,id=>posed.get(id));assert.ok(out.every(Number.isFinite));
  data.progress.forEach((t,i)=>{if(t===0)assert.deepEqual(out.subarray(i*3,i*3+3),carrier.subarray(i*3,i*3+3),'axillary junction moved');});
  const seams=new Map();for(let i=0;i<base.length;i+=3){const key=[...base.subarray(i,i+3)].join(',');if(seams.has(key))assert.deepEqual(out.subarray(i,i+3),seams.get(key));else seams.set(key,out.slice(i,i+3));}
  for(let i=0;i<idx.length;i+=3)for(let e=0;e<3;e++){const a=idx[i+e]*3,b=idx[i+(e+1)%3]*3,length=p=>Math.hypot(p[a]-p[b],p[a+1]-p[b+1],p[a+2]-p[b+2]),rest=length(base);if(rest<.0002)continue;maxEdge=Math.max(maxEdge,length(out)/rest);oldMaxEdge=Math.max(oldMaxEdge,length(previous)/rest);}
  // Compare branch/host separation with the actual solved host surface.
  const vertices=[...posed.values()].flatMap(h=>Array.from({length:h.posed.length/3},(_,i)=>[...h.posed.subarray(i*3,i*3+3)]));
  for(let i=0;i<data.vertexCount;i+=5)if(data.progress[i]===1){const distance=p=>Math.min(...vertices.map(v=>Math.hypot(p[i*3]-v[0],p[i*3+1]-v[1],p[i*3+2]-v[2])));totalOld+=distance(previous);totalNew+=distance(out);}
  cases++;
 }
 assert.throws(()=>soft.bindTissue(rig,'path',Float32Array.from(base,(v,i)=>i===0?v+.001:v),undefined,name),/mismatch/);
}
console.log({cases,maxEdge,oldMaxEdge,totalOld,totalNew,separationReduction:1-totalNew/totalOld});
assert.ok(totalNew<totalOld,'terminal branches no closer to solved deltoid');
assert.ok(maxEdge<5.5,'new nerve spike');
console.log('Deltoid nerve source identity, translation covariance, neutral, axillary collars, seams and completed-surface following PASS');
