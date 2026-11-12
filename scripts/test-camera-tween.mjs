// The camera glide (Bug Audit P3-04) is a fixed 300 ms ease-out on the wall clock: this checks the curve itself,
// which a headless software renderer cannot show (it draws about one frame every few seconds).
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
const {CAMERA_TWEEN_MS,easeOutCubic,tweenProgress}=await quizModule('app/camera-tween.ts');
assert.equal(CAMERA_TWEEN_MS,300);
assert.equal(easeOutCubic(0),0);assert.equal(easeOutCubic(1),1);
assert.ok(easeOutCubic(.5)>.5&&easeOutCubic(.5)<1,'ease-out: more than half the way at half time');
// monotonic, and decelerating: each later tenth covers less distance than the one before
let prev=0,prevStep=Infinity;for(let i=1;i<=10;i++){const v=easeOutCubic(i/10);assert.ok(v>prev);assert.ok(v-prev<prevStep);prevStep=v-prev;prev=v;}
const t0=1000;
assert.deepEqual(tweenProgress(t0,t0),{k:0,e:0,done:false});
assert.equal(tweenProgress(t0,t0+150).k,.5);
assert.ok(tweenProgress(t0,t0+299).done===false);
assert.equal(tweenProgress(t0,t0+300).done,true);
// a frame that arrives long after the deadline (slow renderer) lands exactly on the target
assert.deepEqual(tweenProgress(t0,t0+10000),{k:1,e:1,done:true});
// about 70 % of the way after one third of the time: the glide is front-loaded, like the old chase, but ends on time
assert.ok(tweenProgress(t0,t0+100).e>.7&&tweenProgress(t0,t0+100).e<.72);
console.log('camera tween: ok');
