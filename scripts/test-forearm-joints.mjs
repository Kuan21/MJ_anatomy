import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Vector3,Quaternion} from 'three';
import * as motion from '../.sites-runtime/mj-motion.mjs';
import * as soft from '../.sites-runtime/soft-tissue.mjs';
const atlas=JSON.parse(fs.readFileSync('public/models/atlas.json')),landmarks=JSON.parse(fs.readFileSync('app/biomechanics-v2/forearm-landmarks.json')).sides;
const apply=(p,t)=>new Vector3(...p).applyQuaternion(new Quaternion(...t.quaternion)).add(new Vector3(...t.translation));
let cases=0,maxError=0;
for(const side of ['left','right']){
 const l=landmarks[side],rig=soft.makeSoftRig(atlas,side);
 assert.ok(rig.wrist.distanceTo(new Vector3(...l.wrist))<1e-12,'soft and bone wrist pivots differ');
 // Independent source check: pivot must be in the radiocarpal neighbourhood,
 // not at the centre of the whole curved radius/ulna shaft bounding box.
 for(const suffix of ['radius','lunate','scaphoid']){
  const p=atlas.parts.find(p=>p.name.toLowerCase()===side+' '+suffix),b=fs.readFileSync('public'+atlas.chunks[p.chunk].url),v=new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3);
  let min=Infinity;for(let i=0;i<v.length;i+=3)min=Math.min(min,Math.hypot(v[i]-l.wrist[0],v[i+1]-l.wrist[1],v[i+2]-l.wrist[2]));assert.ok(min<.012,side+' wrist outside '+suffix+' neighbourhood '+min);
 }
 for(const forearmRotation of [-80,0,80])for(const wristFlexion of [-70,0,17,80])for(const wristDeviation of [-29,0,19]){
  const pose={...motion.NEUTRAL_POSE,shoulderFlexion:74,shoulderAbduction:147,elbowFlexion:140,forearmRotation,wristFlexion,wristDeviation},t=motion.buildUpperLimbMotion(atlas,side,pose).transforms;
  for(const point of [l.radialHead,l.ulnarHead]){const error=apply(point,t[l.radiusId]).distanceTo(apply(point,t[l.ulnaId]));assert.ok(error<2e-7,'radioulnar axis attachment drift');maxError=Math.max(maxError,error);}
  const hand=t[rig.ids[6]],radius=t[l.radiusId],error=apply(l.wrist,hand).distanceTo(apply(l.wrist,radius));assert.ok(error<2e-7,'wrist pivot drift');maxError=Math.max(maxError,error);
  const noWrist=motion.buildUpperLimbMotion(atlas,side,{...pose,wristFlexion:0,wristDeviation:0}).transforms;
  assert.deepEqual(t[l.radiusId],noWrist[l.radiusId],'wrist moved radius');assert.deepEqual(t[l.ulnaId],noWrist[l.ulnaId],'wrist moved ulna');cases++;
 }
}
console.log(cases,'reported-pose bilateral wrist/pronation combinations: source proximity, shared pivots and stationary forearm bones PASS; max axis error',maxError);
