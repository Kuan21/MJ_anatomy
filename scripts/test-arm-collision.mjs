// Arm collision envelope: a hand may touch the head, neck or chest, never pass through them. Shoulder flexion + elbow flexion + forearm pronation + wrist flexion,
// pushed to the end of their ranges, used to carry the hand through the head and neck.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {runnerImport} from 'vite';
const root=fileURLToPath(new URL('../',import.meta.url)),load=async f=>(await runnerImport(root+f)).module;
const [motion,coll,classifier]=await Promise.all(['app/mj-motion.ts','app/mj-arm-collision.ts','app/mj-system-classifier.ts'].map(load));
const atlas=classifier.normalizeAtlasSystems(JSON.parse(fs.readFileSync(root+'public/models/atlas-stream.json','utf8')));
const N=motion.NEUTRAL_POSE,L=motion.MOTION_LIMITS,tol=coll.COMPRESSION+1e-9;
const resolve=(side,pose)=>coll.resolveArmCollision(atlas,side,{...N,...pose});

// poses that touch nothing are left exactly as requested
for(const side of ['left','right'])for(const pose of [{},{shoulderFlexion:90},{shoulderAbduction:90},{elbowFlexion:140},{shoulderFlexion:60,elbowFlexion:90,forearmRotation:50,wristFlexion:40},{shoulderFlexion:-60}]){
 const r=resolve(side,pose);assert.equal(r.limited,false,`${side} ${JSON.stringify(pose)} is free`);assert.deepEqual(r.pose,motion.constrainPose({...N,...pose}));
}
// the reported combination, pushed to the end of every range, is limited and ends outside the head
for(const side of ['left','right']){
 const asked={shoulderFlexion:120,elbowFlexion:140,forearmRotation:80,wristFlexion:80},r=resolve(side,asked);
 assert.equal(r.limited,true,`${side}: shoulder flexion + elbow flexion + pronation + wrist flexion collides`);
 assert.ok(coll.armContact(atlas,side,r.pose).clearance>=-tol,`${side}: resolved pose clears the body`);
 assert.ok(r.pose.wristFlexion<asked.wristFlexion,'the distal joint gives way first');assert.equal(r.pose.shoulderFlexion,asked.shoulderFlexion,'the shoulder keeps its angle');
 const max=resolve(side,Object.fromEntries(Object.keys(L).map(k=>[k,L[k][1]])));assert.ok(coll.armContact(atlas,side,max.pose).clearance>=-tol,`${side}: every joint at its maximum still clears`);
 const min=resolve(side,Object.fromEntries(Object.keys(L).map(k=>[k,L[k][0]])));assert.ok(coll.armContact(atlas,side,min.pose).clearance>=-tol,`${side}: every joint at its minimum still clears`);
}
// random poses over the whole range: always clear afterwards, never more than requested, and fast enough to run on every drag frame
let seed=7;const rnd=()=>(seed=(seed*1664525+1013904223)>>>0)/4294967296;let limited=0,total=0,worstMs=0;
for(const side of ['left','right'])for(let i=0;i<500;i++){
 const pose={};for(const k of Object.keys(L))pose[k]=L[k][0]+rnd()*(L[k][1]-L[k][0]);
 const t=performance.now(),r=resolve(side,pose),ms=performance.now()-t;worstMs=Math.max(worstMs,ms);total++;if(r.limited)limited++;
 assert.ok(coll.armContact(atlas,side,r.pose).clearance>=-tol,`${side} ${JSON.stringify(pose)}: still inside the body after resolving`);
 const asked=motion.constrainPose({...N,...pose});for(const k of Object.keys(L))assert.ok(Math.abs(r.pose[k])<=Math.abs(asked[k])+1e-9,`${k} is only ever reduced`);
}
assert.ok(limited>20&&limited<total*.7,`a sensible share of random poses is limited (${limited}/${total})`);
assert.ok(worstMs<25,`resolving stays fast (worst ${worstMs.toFixed(1)} ms)`);
// timing of the motion solver itself after caching the per-atlas landmarks
let t=performance.now();for(let i=0;i<200;i++)motion.buildUpperLimbMotion(atlas,'left',{...N,shoulderFlexion:100+i%50,elbowFlexion:90});const build=(performance.now()-t)/200;assert.ok(build<2,`one arm solve takes ${build.toFixed(2)} ms`);
console.log(`PASS arm collision: ${total} random poses (${limited} limited), reported combination limited at the wrist, worst resolve ${worstMs.toFixed(1)} ms, arm solve ${build.toFixed(2)} ms`);
