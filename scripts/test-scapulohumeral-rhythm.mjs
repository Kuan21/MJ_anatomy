// Scapulohumeral rhythm: raising the arm is shared between the glenohumeral joint and the scapulothoracic joint
// (about 2:1 overall), the scapula rotates upward and tilts posteriorly, and the clavicle elevates and retracts.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {runnerImport} from 'vite';
import {Quaternion,Vector3} from 'three';
const root=fileURLToPath(new URL('../',import.meta.url)),motion=(await runnerImport(root+'app/mj-motion.ts')).module;
const atlas=JSON.parse(fs.readFileSync(root+'public/models/atlas.json','utf8'));
const contact=JSON.parse(fs.readFileSync(root+'app/biomechanics-v2/scapular-contact.json','utf8'));
const angle=t=>2*Math.acos(Math.min(1,Math.abs(new Quaternion(...t.quaternion).normalize().w)))*180/Math.PI;
// Upward rotation = rotation of the scapula about its own plane normal (the axis of scapulothoracic upward rotation).
const upward=(t,side)=>{const q=new Quaternion(...t.quaternion).normalize(),a=2*Math.acos(Math.min(1,Math.abs(q.w))),s=Math.sin(a/2)||1,sign=q.w<0?-1:1,n=new Vector3(...contact.sides[side].normal);if(side==='right')n.negate();return new Vector3(q.x,q.y,q.z).multiplyScalar(sign/s*a*180/Math.PI).dot(n);};
const rows=[];
for(const side of ['left','right']){
 const ids=name=>atlas.parts.find(p=>p.name.toLowerCase()===`${side} ${name}`).id;
 const clavicle=atlas.parts.find(p=>p.name.toLowerCase()===`${side} clavicle`),box=[new Vector3(...clavicle.bounds[0]),new Vector3(...clavicle.bounds[1])],c=box[0].clone().add(box[1]).multiplyScalar(.5);
 const sc=c.clone().setX(side==='left'?box[0].x:box[1].x),ac=c.clone().setX(side==='left'?box[1].x:box[0].x);
 for(const [label,key] of [['flexion','shoulderFlexion'],['abduction','shoulderAbduction']]){
  let previous=0;
  for(const elevation of [30,60,90,120,150,180]){
   const {transforms,warnings}=motion.buildUpperLimbMotion(atlas,side,{...motion.NEUTRAL_POSE,[key]:elevation});assert.equal(warnings.length,0);
   const humerus=angle(transforms[ids('humerus')]),scapula=upward(transforms[ids('scapula')],side);
   const clav=transforms[ids('clavicle')],acMoved=ac.clone().applyQuaternion(new Quaternion(...clav.quaternion)).add(new Vector3(...clav.translation));
   assert.ok(Math.abs(humerus-elevation)<8,`${side} ${label} ${elevation}: humerus carries the requested elevation (${humerus.toFixed(1)})`);
   if(elevation>=90){
    const glenohumeral=humerus-scapula,ratio=glenohumeral/scapula;
    assert.ok(ratio>1.5&&ratio<3.2,`${side} ${label} ${elevation}: GH:ST ratio ${ratio.toFixed(2)} should be about 2:1`);
    assert.ok(scapula>22,`${side} ${label} ${elevation}: scapular rotation ${scapula.toFixed(1)}`);
   }
   if(elevation>=120){
    assert.ok(acMoved.y>ac.y+.004,`${side} ${label} ${elevation}: clavicle elevates (${((acMoved.y-ac.y)*1000).toFixed(0)} mm)`);
    assert.ok(acMoved.z<ac.z-.004,`${side} ${label} ${elevation}: clavicle retracts (${((ac.z-acMoved.z)*1000).toFixed(0)} mm)`);
   }
   assert.ok(scapula>=previous-1e-6,`${side} ${label}: scapular rotation grows monotonically`);previous=scapula;
   if(elevation===180)rows.push(`${side} ${label}: humerus ${humerus.toFixed(0)}° = glenohumeral ${(humerus-scapula).toFixed(0)}° + scapulothoracic ${scapula.toFixed(0)}° (${((humerus-scapula)/scapula).toFixed(2)}:1), AC +${((acMoved.y-ac.y)*1000).toFixed(0)} mm up / ${((ac.z-acMoved.z)*1000).toFixed(0)} mm back`);
  }
 }
}
// The limit is now a full 180 degrees and is still enforced.
assert.deepEqual([...motion.MOTION_LIMITS.shoulderFlexion],[-60,180]);assert.deepEqual([...motion.MOTION_LIMITS.shoulderAbduction],[-20,180]);
const c=motion.constrainPose({...motion.NEUTRAL_POSE,shoulderFlexion:200,shoulderAbduction:200});assert.ok(Math.hypot(c.shoulderFlexion,c.shoulderAbduction)<=180+1e-9);
console.log('PASS scapulohumeral rhythm at 180°: '+rows.join('; ')+'.');
