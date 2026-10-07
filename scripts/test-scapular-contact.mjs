import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Vector3,Quaternion,Box3} from 'three';
import {buildUpperLimbMotion,NEUTRAL_POSE} from '../.sites-runtime/mj-motion.mjs';
const atlas=JSON.parse(fs.readFileSync(new URL('../public/models/atlas.json',import.meta.url))),fit=JSON.parse(fs.readFileSync(new URL('../app/biomechanics-v2/scapular-contact.json',import.meta.url)));
const ribs=new Box3();for(const p of atlas.parts)if(p.system==='skeletal'&&/ rib$/i.test(p.name))ribs.union(new Box3(new Vector3(...p.bounds[0]),new Vector3(...p.bounds[1])));
const rx=Math.max(Math.abs(ribs.min.x),Math.abs(ribs.max.x)),rz=(ribs.max.z-ribs.min.z)/2,cz=(ribs.min.z+ribs.max.z)/2;
const radial=p=>Math.hypot(p.x/rx,(p.z-cz)/rz);
const moved=(p,t)=>p.clone().applyQuaternion(new Quaternion(...t.quaternion)).add(new Vector3(...t.translation));
let maxStep=0,maxGap=0,maxDrift=0;
for(const side of ['left','right']){
 const s=fit.sides[side],centre=new Vector3(...s.centre),clavicle=atlas.parts.find(p=>p.name.toLowerCase()===`${side} clavicle`),box=new Box3(new Vector3(...clavicle.bounds[0]),new Vector3(...clavicle.bounds[1])),c=box.getCenter(new Vector3());
 const sc=c.clone().setX(side==='left'?box.min.x:box.max.x),ac=c.clone().setX(side==='left'?box.max.x:box.min.x);
 for(const [abd,flex] of [[1,0],[0,1],[.7,.7]]){
  let prev;
  for(let angle=0;angle<=165;angle++){
   const {transforms,warnings}=buildUpperLimbMotion(atlas,side,{...NEUTRAL_POSE,shoulderAbduction:angle*abd,shoulderFlexion:angle*flex});
   assert.equal(warnings.length,0);
   const blade=moved(centre,transforms[s.scapulaId]),drift=Math.abs(radial(blade)-radial(centre)),gap=moved(ac,transforms[s.scapulaId]).distanceTo(moved(ac,transforms[clavicle.id]));
   assert.ok(drift<1e-9,`${side} blade left thoracic shell at ${angle}`);assert.ok(gap<1e-9,`${side} AC separation at ${angle}`);
   assert.ok(moved(sc,transforms[clavicle.id]).distanceTo(sc)<1e-10,'SC pivot moved');
   if(prev){const step=blade.distanceTo(prev);maxStep=Math.max(maxStep,step);assert.ok(step<.008,'Scapular motion jumped');}prev=blade;
   maxDrift=Math.max(maxDrift,drift);maxGap=Math.max(maxGap,gap);
  }
 }
 const a=buildUpperLimbMotion(atlas,side,{...NEUTRAL_POSE,shoulderAbduction:30}).transforms,b=buildUpperLimbMotion(atlas,side,{...NEUTRAL_POSE,shoulderAbduction:30.0001}).transforms;
 assert.ok(moved(centre,a[s.scapulaId]).distanceTo(moved(centre,b[s.scapulaId]))<.00005,'Activation discontinuity');
}
console.log('Scapular guide: 996 bilateral poses; max radial drift',maxDrift,'AC gap',maxGap,'step (m)',maxStep);
