// Selecting a structure must not move the camera (UI rule): model click, list, search and info-card links only select and outline; the Focus button of the info card
// is the one thing that frames a structure. Three parts:
//  1. state level: selectOnly leaves every camera-deciding field of the scene state as it was, withCameraFocus raises the focus request exactly once;
//  2. source level: no selection handler of the page, the heart viewer or the brain viewer asks for a camera move (only Focus, the per-chamber buttons, Quiz and the like do);
//  3. framing level: the Focus framing keeps the whole target inside the free part of the screen (panel and info-card widths subtracted) with a margin.
// The same rule is checked in a real browser (production build) by scripts/browser/select-no-camera.cjs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {quizModule} from './quiz-modules.mjs';
const {selectOnly, withCameraFocus, CAMERA_FIELDS} = await quizModule('app/selection-state.ts');
const {focusFrame} = await quizModule('app/camera-framing.ts');

// 1. state level -------------------------------------------------------------------------------------------------
const base = {visible: ['skeletal', 'muscular'], selected: [], hiddenParts: ['x'], depthFilter: 'all', muscleLayer: 2, isolate: true, rotate: true, explode: 0, view: 'front', reset: 3,
  focusParts: ['a', 'b'], cameraFocusNonce: 7, cameraFocusParts: ['a'], cameraFocusNerve: undefined, cameraFocusRange: undefined, cameraFocusDir: [0, 0, 1], cameraFocusScale: .82};
const picked = selectOnly(base, ['right-pectoralis-minor']);
for (const k of CAMERA_FIELDS) assert.deepEqual(picked[k], base[k], `selecting must leave ${k} as it was`);
assert.deepEqual(picked.selected, ['right-pectoralis-minor']);
assert.equal(picked.isolate, false, 'a new pick leaves isolate mode instead of re-framing');
const focused = withCameraFocus(picked, {parts: picked.selected});
assert.equal(focused.cameraFocusNonce, base.cameraFocusNonce + 1, 'Focus raises the focus request once');
assert.deepEqual(focused.cameraFocusParts, picked.selected);
assert.equal(focused.isolate, picked.isolate, 'Focus does not isolate');
assert.equal(withCameraFocus(picked, {nerve: 'n'}).cameraFocusNerve, 'n');

// 2. source level ------------------------------------------------------------------------------------------------
const page = fs.readFileSync('app/page.tsx', 'utf8');
const fn = (src, name) => {
  const i = src.indexOf(`const ${name}=`); assert.ok(i >= 0, `${name} exists`);
  const end = src.indexOf('\n const ', i + 10), end2 = src.indexOf('\n // ', i + 10);
  return src.slice(i, Math.min(...[end, end2].filter(x => x > 0)));
};
for (const name of ['choose', 'choosePart', 'chooseNerve', 'pickLayerMuscles', 'clearSelection', 'pickLabel']) {
  const body = fn(page, name);
  assert.ok(!/cameraFocus|revealState|muscleLayer:order|selectTop|leaveHeadFor\(/.test(body), `${name} must not move the camera, reveal, peel or switch region`);
}
const extra = page.slice(page.indexOf('const chooseExtra='), page.indexOf('const chooseNerve='));
assert.ok(!/cameraFocus|visible:/.test(extra), 'chooseExtra only selects');
const spaceItem = page.slice(page.indexOf('const pickSpaceItem='), page.indexOf('const pickSpaceItem=') + 900);
assert.ok(!/cameraFocus/.test(spaceItem), 'a dissection-panel item only selects');
assert.match(fn(page, 'focusSelected'), /withCameraFocus/, 'the Focus button asks for the camera move');
assert.ok(!/isolate:true/.test(fn(page, 'focusSelected')), 'Focus does not isolate');
assert.equal((page.match(/onClick=\{focusSelected\}/g) ?? []).length, 2, 'both Focus buttons (part, nerve) use focusSelected');
assert.match(page, /不在目前視野，按 Focus 查看/, 'out-of-view hint on the info card');
const heartViewer = fs.readFileSync('app/organ/heart-viewer.ts', 'utf8');
const update = heartViewer.slice(heartViewer.indexOf('const update = '), heartViewer.indexOf('const pickAt ='));
assert.ok(!/moved\s*&&/.test(update) && /focusNonce/.test(update), 'heart: selecting does not turn the camera, only focusNonce does');
const heart = fs.readFileSync('app/organ/heart.tsx', 'utf8');
assert.match(heart, /focusNonce: \(v\.focusNonce \?\? 0\) \+ 1/, 'heart Focus button raises focusNonce');
assert.match(heart, /不在目前視野，按 Focus 查看/);
const brain = fs.readFileSync('app/organ/brain.tsx', 'utf8');
const chooseBrain = brain.slice(brain.indexOf('const choose = '), brain.indexOf('const focusOn'));
assert.ok(!/go\(|command/.test(chooseBrain), 'brain: choose only selects');
const selectBrain = brain.slice(brain.indexOf('const select = '), brain.indexOf('const choose = '));
assert.ok(!/hiddenGroups|command/.test(selectBrain), 'brain: select neither re-shows layers nor moves the camera');
assert.match(brain, /onClick=\{\(\) => focusOn\(selected\.id\)\}/, 'brain Focus button');
assert.match(brain, /不在目前視野，按 Focus 查看/);

// 3. framing level -----------------------------------------------------------------------------------------------
let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
let worst = 1;
for (let n = 0; n < 400; n++) {
  const w = 900 + Math.floor(rnd() * 1100), h = 560 + Math.floor(rnd() * 500), cardW = Math.round(Math.min(390, w * .35)) + 30 + 16, panelW = 222 + 20 + 18;
  const free = {left: panelW, right: w - cardW, top: 70 + rnd() * 90, bottom: h - 64};
  const c = new T.Vector3((rnd() - .5) * .5, .2 + rnd() * 1.4, (rnd() - .5) * .2);
  const sz = new T.Vector3(.01 + rnd() * .45, .01 + rnd() * .8, .005 + rnd() * .2);
  const box = new T.Box3(c.clone().sub(sz.clone().multiplyScalar(.5)), c.clone().add(sz.clone().multiplyScalar(.5)));
  const dir = new T.Vector3(rnd() * 2 - 1, (rnd() - .5) * .8, rnd() * 2 - 1).normalize(), aspect = w / h;
  const {distance, offset} = focusFrame(box, dir, 34, aspect, w, h, free, 1);
  const cam = new T.PerspectiveCamera(34, aspect, .005, 100);
  cam.position.copy(c).addScaledVector(dir, distance); cam.lookAt(c); cam.setViewOffset(w, h, offset[0], offset[1], w, h); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  for (let i = 0; i < 8; i++) {
    const q = new T.Vector3(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).project(cam), x = (q.x * .5 + .5) * w, y = (-q.y * .5 + .5) * h;
    assert.ok(q.z > -1 && q.z < 1, 'corner in front of the camera');
    assert.ok(x >= free.left - 1 && x <= free.right + 1 && y >= free.top - 1 && y <= free.bottom + 1, `case ${n}: corner (${x.toFixed(0)}, ${y.toFixed(0)}) inside the free area ${JSON.stringify(free)}`);
    worst = Math.min(worst, (Math.min(x - free.left, free.right - x) / (free.right - free.left)));
  }
}
console.log(`Selection never moves the camera: state, handlers (page, heart, brain) and Focus framing checked (400 framings, tightest corner ${(worst * 100).toFixed(1)} % of the free width from its edge).`);
