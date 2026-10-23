// Run after test-body-motion. Validate attachment transport, not physiology.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Vector3} from 'three';
import * as body from '../.sites-runtime/body-motion.mjs';
import * as soft from '../.sites-runtime/soft-tissue.mjs';
import {normalizeAtlasSystems} from '../.sites-runtime/mj-system-classifier.mjs';
const atlas=normalizeAtlasSystems(JSON.parse(fs.readFileSync('public/models/atlas.json')));
const fits={...JSON.parse(fs.readFileSync('app/biomechanics-v2/shoulder-attachments.json')).parts,...JSON.parse(fs.readFileSync('app/biomechanics-v2/serratus-attachments.json')).parts};
const chunks=atlas.chunks.map(c=>fs.readFileSync('public'+c.url));
const rig=body.makeBodyRig(atlas,'spine'),softRigs={left:soft.makeSoftRig(atlas,'left'),right:soft.makeSoftRig(atlas,'right')};
let cases=0,pins=0,maxError=0,oldMaxError=0;
const poses=[{flexion:50,rotation:0,sideBend:0},{flexion:50,rotation:29,sideBend:20},{flexion:-25,rotation:-30,sideBend:-20}];
for(const p of atlas.parts){
 const fit=fits[p.id],binding=soft.tissueBindings[p.id];if(!fit||!binding)continue;
 const bytes=chunks[p.chunk],base=new Float32Array(bytes.buffer,bytes.byteOffset+p.positions,p.vertexCount*3).slice();
 const upper=soft.bindTissue(softRigs[binding.side],binding.profile,base,p),skin=body.bindSpineCarrier(rig,base,upper);
 const neutral=base.slice();soft.deformTissue(skin,base,body.buildBodyMotion(rig,body.BODY_NEUTRAL).palette,neutral);assert.deepEqual(neutral,base,p.name+' neutral');
 const y=(p.bounds[0][1]+p.bounds[1][1])*.5;
 const oldHeightOnly=!body.bodyBindings[p.id]&&y>=rig.levels[0]-.12&&y<=rig.levels.at(-1)+.13&&/pectoralis|serratus|intercostal|latissimus|trapezius/i.test(p.name);
 const old=body.bindBodyTissue(rig,base,!oldHeightOnly,p);
 for(const pose of poses){
  const built=body.buildBodyMotion(rig,{...body.BODY_NEUTRAL,...pose}),out=base.slice(),previous=base.slice();
  soft.deformTissue(skin,base,built.palette,out);soft.deformTissue(old,base,built.palette,previous);
  assert.ok(out.every(Number.isFinite));
  for(let i=0;i<p.vertexCount;i++){
   const t=fit.weight[i];if(t!==0&&t!==1)continue;
   const frame=t===0?fit.originFrame:(fit.insertionFrame??3),point=new Vector3().fromArray(base,i*3);
   const expected=frame===0?soft.deformPoint(point,body.bodyWeights(rig,point.y),built.palette):point.applyMatrix4(built.matrices.at(-1));
   const error=expected.distanceTo(new Vector3().fromArray(out,i*3));
   assert.ok(error<1e-6,`${p.name}: authored attachment left its carrier`);
   maxError=Math.max(maxError,error);oldMaxError=Math.max(oldMaxError,expected.distanceTo(new Vector3().fromArray(previous,i*3)));pins++;
  }
  cases++;
 }
}
assert.ok(cases>=40&&pins>10000);assert.ok(oldMaxError>.01,'fixture reproduces former attachment mismatch');
console.log({cases,pins,maxErrorMM:maxError*1000,oldMaxErrorMM:oldMaxError*1000});
console.log('Trunk transport: authored rib and scapular attachments, neutral reset and reported compound poses PASS');
