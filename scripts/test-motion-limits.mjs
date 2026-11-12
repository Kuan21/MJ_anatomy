// Active ranges of the upper-limb sliders (standard clinical goniometry) and the combined-motion rules.
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {runnerImport} from 'vite';
const root=fileURLToPath(new URL('../',import.meta.url)),motion=(await runnerImport(root+'app/mj-motion.ts')).module;
const L=motion.MOTION_LIMITS,N=motion.NEUTRAL_POSE,c=p=>motion.constrainPose({...N,...p});
// each slider's range, in the direction named by its label (+ = flexion, abduction, internal rotation, pronation, ulnar deviation)
assert.deepEqual([...L.shoulderFlexion],[-60,180],'shoulder extension 60 / flexion 180');
assert.deepEqual([...L.shoulderAbduction],[0,180],'shoulder abduction 0-180');
assert.deepEqual([...L.shoulderRotation],[-90,70],'external rotation 90 / internal rotation 70');
assert.deepEqual([...L.elbowFlexion],[0,145],'elbow flexion 0-145');
assert.deepEqual([...L.forearmRotation],[-90,80],'supination 90 / pronation 80');
assert.deepEqual([...L.wristFlexion],[-70,80],'wrist extension 70 / flexion 80');
assert.deepEqual([...L.wristDeviation],[-20,30],'radial deviation 20 / ulnar deviation 30');
// anything beyond a range is clamped to it
assert.equal(c({elbowFlexion:200}).elbowFlexion,145);assert.equal(c({elbowFlexion:-10}).elbowFlexion,0);
assert.equal(c({shoulderAbduction:-30}).shoulderAbduction,0);assert.equal(c({forearmRotation:-120}).forearmRotation,-90);assert.equal(c({wristFlexion:120}).wristFlexion,80);
// the full internal rotation is available with the arm down; the elevated arm loses rotation (capsule tightens), external rotation more than internal in absolute terms but never beyond the scaled range
assert.equal(c({shoulderRotation:-100}).shoulderRotation,-90);assert.equal(c({shoulderRotation:100}).shoulderRotation,70);
const raised=c({shoulderAbduction:180,shoulderRotation:-100}).shoulderRotation;assert.ok(raised>-90&&raised>=-62-1e-9,`external rotation shrinks with the arm raised (${raised.toFixed(1)})`);
// flexion and abduction together are one swing of at most 180 degrees (no 180 + 180)
const both=c({shoulderFlexion:180,shoulderAbduction:180});assert.ok(Math.hypot(both.shoulderFlexion,both.shoulderAbduction)<=180+1e-9);
// the wrist cannot take both of its extremes at once (a wrist flexed 80 degrees has little deviation left)
const wrist=c({wristFlexion:80,wristDeviation:30});assert.ok(Math.hypot(wrist.wristFlexion/80,wrist.wristDeviation/30)<=1+1e-9,'wrist flexion and deviation share one envelope');
// the ranges the sliders show are the ranges that are enforced (page.tsx draws the sliders from MOTION_LIMITS)
for(const k of Object.keys(L))assert.ok(L[k][0]<=0&&L[k][1]>0,k+' range contains the anatomical position');
console.log('PASS motion limits and combined-motion rules');
