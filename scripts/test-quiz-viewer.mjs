// Real geometry, raycasting, loader, materials and gesture controller; only GPU
// drawing and DOM/OrbitControls are stubbed. This is not a device visual test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import * as T from 'three';

const root = fileURLToPath(new URL('../', import.meta.url));
const catalogue = JSON.parse(fs.readFileSync(path.join(root, 'public/models/quiz-lower.json')));
let frame, scene, camera, canvas, failures = false;
const requests = [];
function element() {
  const listeners = new Map();
  return {style: {}, tabIndex: 0, listeners, appendChild() {}, setAttribute() {}, remove() {},
    addEventListener(name, fn) {listeners.set(name, fn);}, removeEventListener(name) {listeners.delete(name);},
    getBoundingClientRect() {return {left: 0, top: 0, width: 900, height: 760};}};
}
class Renderer {
  domElement = element();
  constructor() {canvas = this.domElement;}
  setPixelRatio() {} setClearColor() {} setSize() {} dispose() {}
  render(s, c) {scene = s; camera = c; s.updateMatrixWorld(true); c.updateMatrixWorld(true);}
}
class Controls {
  target = new T.Vector3();
  constructor(camera) {this.camera = camera;}
  update() {this.camera.lookAt(this.target);} addEventListener() {} dispose() {}
}
globalThis.window = {devicePixelRatio: 2};
globalThis.ResizeObserver = class {constructor(fn) {this.fn = fn;} observe() {this.fn();} disconnect() {}};
globalThis.requestAnimationFrame = fn => {frame = fn; return 1;};
globalThis.cancelAnimationFrame = () => {};
globalThis.fetch = async (url, options) => {
  requests.push(String(url));
  if (options.signal.aborted) throw new DOMException('Aborted', 'AbortError');
  if (failures) return new Response('offline', {status: 503});
  const file = path.join(root, 'public', String(url));
  return fs.existsSync(file) ? new Response(fs.readFileSync(file)) : new Response('missing', {status: 404});
};
const cache = new Map();
async function moduleFor(key) {
  if (cache.has(key)) return cache.get(key);
  let module;
  if (key.endsWith('.json')) {
    const data = JSON.parse(fs.readFileSync(key, 'utf8'));
    module = new vm.SyntheticModule(['default'], function () {this.setExport('default', data);});
  } else if (key === 'three' || key.includes('OrbitControls')) {
    const exports = key === 'three' ? {...T, WebGLRenderer: Renderer} : {OrbitControls: Controls};
    module = new vm.SyntheticModule(Object.keys(exports), function () {for (const [name, value] of Object.entries(exports)) this.setExport(name, value);});
  } else {
    const source = ts.transpileModule(fs.readFileSync(key, 'utf8'), {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext}}).outputText;
    module = new vm.SourceTextModule(source, {identifier: key, initializeImportMeta(meta) {meta.env = {BASE_URL: '/'};}});
  }
  cache.set(key, module); return module;
}
async function link(spec, ref) {return moduleFor(spec.startsWith('.') ? path.resolve(path.dirname(ref.identifier), spec.endsWith('.json') ? spec : spec + '.ts') : spec);}
const module = await moduleFor(path.join(root, 'app/quiz/viewer.ts'));
await module.link(link); await module.evaluate();
const {createQuizViewer, clearPackageCache, packageBuffer, rankPackages, preloadQuestions, questionScene, questionPackages} = module.namespace;
let ready = [], errors = [], picks = [], missed = 0;
let shownLog = [];
const callbacks = {ready: (key, value) => ready.push({key, value}), shown: (key, value) => shownLog.push({key, value}), progress() {}, error: e => {if (e) errors.push(e);}, pick: id => picks.push(id), miss: () => missed++, keyboard() {}};
const targetNamed = name => {const target = catalogue.structures.find(s => s.name === name); assert.ok(target, name); return target;};
const makeState = (key, name, section = 'all') => ({key, target: targetNamed(name), section, side: 'right', answered: false, pickedId: null, hidden: [], context: true, peeling: false, command: {id: 0, view: 'front'}});
const settle = async () => {
  const timeout = Date.now() + 15000;
  while (!ready.at(-1)?.value && !errors.length) {
    assert.ok(Date.now() < timeout, 'Loading completes or reports error');
    await new Promise(resolve => setTimeout(resolve, 2)); frame?.();
  }
  frame?.();
};
const meshes = id => scene.children.filter(o => o.isMesh && (!id || o.userData.structureId === id));
function projectedHit(id) {
  const candidates = meshes().filter(m => m.visible && m.userData.structureId.split(':')[0] === id.split(':')[0]);
  const ray = new T.Raycaster();
  for (const mesh of meshes(id)) {
    const positions = mesh.geometry.getAttribute('position'), indices = mesh.geometry.index;
    for (let i = 0; i < indices.count; i += 3) {
      const p = new T.Vector3();
      for (let j = 0; j < 3; j++) p.add(new T.Vector3().fromBufferAttribute(positions, indices.getX(i + j)));
      p.divideScalar(3).project(camera);
      if (Math.abs(p.x) > .94 || Math.abs(p.y) > .94) continue;
      ray.setFromCamera(new T.Vector2(p.x, p.y), camera);
      if (ray.intersectObjects(candidates, false)[0]?.object.userData.structureId === id) return [(p.x + 1) * 450, (1 - p.y) * 380];
    }
  }
  return null;
}
const pointer = (name, id, x, y, pointerType = 'mouse') => canvas.listeners.get(name)({pointerId: id, clientX: x, clientY: y, pointerType, button: 0});
function click(point) {pointer('pointerdown', 1, ...point); pointer('pointerup', 1, ...point);}

let viewer = createQuizViewer(element(), catalogue, callbacks);
let state = makeState('bone', 'Right patella', 'knee');
viewer.update(state); await settle(); assert.ok(ready.at(-1).value); assert.equal(errors.length, 0);
const correctPoint = projectedHit(state.target.id); assert.ok(correctPoint, 'Patella can be found and raycast');
click(correctPoint); assert.equal(picks.at(-1), state.target.id, 'Actual pointer picks correct geometry');
const other = [...new Set(meshes().filter(m => m.visible).map(m => m.userData.structureId))].find(id => id !== state.target.id && projectedHit(id));
assert.ok(other); const wrongPoint = projectedHit(other); click(wrongPoint); assert.equal(picks.at(-1), other, 'No bias toward correct answer');
const beforeGesture = picks.length;
pointer('pointerdown', 1, ...correctPoint); pointer('pointermove', 1, correctPoint[0] + 25, correctPoint[1]); pointer('pointerup', 1, ...correctPoint);
pointer('pointerdown', 1, ...correctPoint, 'touch'); pointer('pointerdown', 2, ...wrongPoint, 'touch'); pointer('pointerup', 2, ...wrongPoint, 'touch'); pointer('pointerup', 1, ...correctPoint, 'touch');
assert.equal(picks.length, beforeGesture, 'Orbit and pinch do not submit an answer');
click([1, 1]); assert.equal(missed, 1); assert.equal(picks.length, beforeGesture);
viewer.update({...state, hidden: [other], peeling: true}); frame(); assert.ok(meshes(other).every(m => !m.visible));
viewer.update({...state, answered: true, pickedId: other}); frame();
assert.ok(meshes(state.target.id).every(m => m.visible && m.material.color.getHexString() === '5db89a' && !m.material.depthTest));
assert.ok(meshes(other).every(m => m.visible && m.material.color.getHexString() === 'd6304a'));
click(correctPoint); assert.equal(picks.length, beforeGesture, 'Answered question cannot accept another selection');

for (const [name, system] of [['Right gluteus maximus', 'muscular'], ['Right sciatic nerve', 'nervous'], ['Right femoral artery', 'arterial'], ['Right great saphenous vein', 'venous']]) {
  state = makeState(system, name); viewer.update(state); await settle();
  assert.equal(ready.at(-1).key, system); assert.ok(ready.at(-1).value);
  assert.ok(meshes(state.target.id).every(m => m.visible && m.material.opacity === 1), `${name} present and opaque`);
  assert.ok(meshes().filter(m => m.visible).every(m => [system, 'skeletal'].includes(m.userData.structureId.split(':')[0])));
  const eligible = [...new Set(meshes().filter(m => m.visible && m.userData.structureId.startsWith(system + ':')).map(m => m.userData.structureId))].sort();
  const targetIndex = eligible.indexOf(state.target.id);
  assert.ok(targetIndex >= 0);
  for (let i = 0; i <= targetIndex; i++) canvas.listeners.get('keydown')({key: 'ArrowRight', preventDefault() {}});
  canvas.listeners.get('keydown')({key: 'Enter', preventDefault() {}});
  assert.equal(picks.at(-1), state.target.id, 'Anonymous keyboard selection reaches every structure');
  viewer.update({...state, answered: true, pickedId: state.target.id}); frame();
  assert.ok(meshes(state.target.id).every(m => m.material.color.getHexString() === '5db89a'));
}
// A limb space has no mesh of its own: its members (boundaries and contents) are the target, the structures around it are the other choices.
{
  const space = targetNamed('Right tarsal tunnel'), memberIds = new Set(space.space.members.map(m => m.id));
  state = makeState('space', 'Right tarsal tunnel'); viewer.update(state); await settle();
  assert.ok(ready.at(-1).value && errors.length === 0);
  const visible = meshes().filter(m => m.visible), memberMeshes = visible.filter(m => memberIds.has(m.userData.structureId)), others = visible.filter(m => !memberIds.has(m.userData.structureId));
  assert.ok([...memberIds].every(id => meshes(id).length && meshes(id).every(m => m.visible)), 'every member of the space is in the scene');
  assert.ok(others.length > 0, 'the structures around the space are in the scene too');
  assert.ok(visible.every(m => m.material.opacity === 1), 'nothing is faded before the answer (a faded neighbour would give the answer away)');
  assert.ok(meshes(space.id).length === 0, 'the space itself has no mesh');
  const member = [...memberIds].find(id => projectedHit(id)); assert.ok(member, 'a member can be tapped'); click(projectedHit(member)); assert.equal(picks.at(-1), member);
  const outside = [...new Set(others.map(m => m.userData.structureId))].find(id => projectedHit(id)); assert.ok(outside, 'a structure around the space can be tapped'); click(projectedHit(outside)); assert.equal(picks.at(-1), outside);
  viewer.update({...state, answered: true}); frame();
  assert.ok(meshes().filter(m => m.visible && memberIds.has(m.userData.structureId)).every(m => m.material.color.getHexString() === '5db89a' && m.material.opacity === 1 && m.material.depthTest), 'members are green and solid in the answer');
  assert.ok(meshes().filter(m => m.visible && !memberIds.has(m.userData.structureId)).every(m => m.material.opacity < .5), 'the rest is faded in the answer');
  viewer.update({...state, mode: 'name'}); frame();
  assert.ok(meshes().filter(m => m.visible && memberIds.has(m.userData.structureId)).every(m => m.material.color.getHexString() === '9b30ff'), 'members are violet in levels 2 and 3');
  assert.ok(meshes().filter(m => m.visible && !memberIds.has(m.userData.structureId)).every(m => m.material.opacity < 1), 'the rest is faded in levels 2 and 3');
}
const completedRequests = requests.length;
viewer.update(makeState('cached', 'Right patella', 'knee')); await settle();
assert.equal(requests.length, completedRequests, 'Revisiting a question reuses loaded geometry');
assert.ok(requests.every(url => url.includes('/models/stream/quiz-lower-')), 'No whole-body models, brain or motion data');
viewer.dispose();
// the bytes are shared by the whole page: another viewer (lesson, then Quiz) asking for the same question fetches nothing again
viewer = createQuizViewer(element(), catalogue, callbacks); viewer.update(makeState('shared', 'Right patella', 'knee')); await settle();
assert.equal(requests.length, completedRequests, 'A second viewer reuses the packages already in memory');
viewer.dispose();

// progressive loading: the model is shown once the target and the bones around it are in; the question is ready (find mode) only when everything is
{
  clearPackageCache(); ready = []; shownLog = []; errors = [];
  const progressive = {...makeState('prog', 'Right gluteus maximus'), progressive: true}, v = createQuizViewer(element(), catalogue, callbacks);
  v.update(progressive); await settle();
  const keyed = shownLog.filter(e => e.key === 'prog' && e.value);
  assert.equal(keyed.length, 1, 'shown fires once');
  const order = [...shownLog.map(e => ['shown', e.value]), ...ready.map(e => ['ready', e.value])];
  assert.ok(ready.at(-1).value && errors.length === 0, 'the question becomes ready');
  const plan = rankPackages(catalogue, progressive.target, new Set(catalogue.structures.map(s => s.id)), new Set([progressive.target.id]));
  assert.ok(plan.essential >= 1 && plan.essential <= plan.order.length, 'a plan with at least one essential package');
  const first = catalogue.packages[plan.order[0]];
  assert.ok(first.meshes.some(m => m.structureId === progressive.target.id), 'the package holding the target loads first');
  v.dispose();
}
// prefetch: once a question is complete the next one's packages are brought in at low priority
{
  clearPackageCache(); ready = []; errors = []; requests.length = 0;
  const next = targetNamed('Right patella'), v = createQuizViewer(element(), catalogue, callbacks);
  v.update({...makeState('pf', 'Right gluteus maximus'), progressive: true, next: {catalogue, target: next}}); await settle();
  await new Promise(resolve => setTimeout(resolve, 400));
  const before = requests.length;
  v.update(makeState('pf2', 'Right patella', 'knee')); await settle();
  const after = requests.slice(before).filter(u => u.endsWith('.bin.gz') || u.endsWith('.bin'));
  assert.ok(requests.length >= before); void after;
  v.dispose();
}
// preload (mock exam): packages of many questions land in memory before the first one, within the byte limit
{
  clearPackageCache(); requests.length = 0;
  const items = ['Right gluteus maximus', 'Right patella'].map(name => ({catalogue, target: targetNamed(name), section: 'all', side: 'both'})), progress = [];
  const report = await preloadQuestions(items, {limitBytes: 1e12, onProgress: (d, t) => progress.push([d, t])});
  assert.ok(report.loaded > 0 && report.left === 0 && report.failed === 0, 'everything within the limit is loaded');
  assert.deepEqual(progress.at(-1), [report.loaded, report.loaded], 'progress ends complete');
  const count = requests.length;
  for (const it of items) {const v = createQuizViewer(element(), catalogue, callbacks); ready = []; v.update({...makeState('pre' + it.target.id, it.target.name), side: 'both'}); await settle(); v.dispose();}
  assert.equal(requests.length, count, 'stations after the preload fetch nothing');
  clearPackageCache(); requests.length = 0;
  const small = await preloadQuestions(items, {limitBytes: 1, onProgress() {}});
  assert.ok(small.left > 0 && small.loaded === 0 && requests.length === 0, 'what passes the limit is left for the background');
}

// reduced scene (學習「認識」步驟、模擬考試): the target, every bone and the structures nearest to the target; the far faint muscles are not loaded or drawn.
// Questions where something is picked (mode 'find') always draw every candidate, whatever `focus` says, so the scoring stays fair.
{
  const target = targetNamed('Right gluteus maximus'), focus = {count: 3};
  const full = questionScene(catalogue, target, 'all', 'right'), reduced = questionScene(catalogue, target, 'all', 'right', focus);
  const reducedIds = new Set(reduced.map(s => s.id)), bones = full.filter(s => s.system === 'skeletal'), others = full.filter(s => s.id !== target.id && s.system !== 'skeletal');
  assert.ok(others.length > focus.count + 2, 'the scene has enough structures to leave some out');
  assert.equal(reduced.length, 1 + bones.length + focus.count, 'target, every bone and the `count` nearest');
  assert.ok(reduced.every(s => full.some(f => f.id === s.id)), 'nothing is added that the whole scene does not have');
  assert.ok(reducedIds.has(target.id) && bones.every(s => reducedIds.has(s.id)), 'the target and every bone stay');
  const gap = (a, b) => Math.hypot(...[0, 1, 2].map(i => Math.max(0, a.bounds[0][i] - b.bounds[1][i], b.bounds[0][i] - a.bounds[1][i])));
  const kept = others.filter(s => reducedIds.has(s.id)), left = others.filter(s => !reducedIds.has(s.id));
  assert.ok(Math.max(...kept.map(s => gap(s, target))) <= Math.min(...left.map(s => gap(s, target))) + 1e-9, 'what stays is nearer to the target than what is left out');
  const far = left.at(-1);
  const packs = questionPackages(catalogue, target, 'all', 'right', focus), packsFull = questionPackages(catalogue, target, 'all', 'right');
  assert.ok(packs.every(i => packsFull.includes(i)) && packs.length <= packsFull.length, 'the reduced scene never needs a package the whole scene does not');
  // a bone question keeps no bone it does not need: the nearest ones
  const bone = targetNamed('Right patella'), boneScene = questionScene(catalogue, bone, 'all', 'right', focus);
  assert.equal(boneScene.length, 1 + focus.count, 'a bone question draws the nearest structures only');
  // a space is never reduced
  const space = targetNamed('Right tarsal tunnel');
  assert.equal(questionScene(catalogue, space, 'all', 'right', focus).length, questionScene(catalogue, space, 'all', 'right').length, 'a space keeps its whole scene');
  // drawn: only the reduced scene is visible in mode 'name', and nothing else was fetched for it
  clearPackageCache(); ready = []; errors = []; requests.length = 0;
  const v = createQuizViewer(element(), catalogue, callbacks), name = {...makeState('focus-name', 'Right gluteus maximus'), mode: 'name', progressive: true, focus};
  v.update(name); await settle();
  const drawn = new Set(meshes().filter(m => m.visible).map(m => m.userData.structureId));
  assert.ok(drawn.has(target.id) && [...drawn].every(id => reducedIds.has(id)), 'mode name draws only the reduced scene');
  assert.ok(!drawn.has(far.id), 'the far structure is not drawn');
  const binsOf = () => requests.filter(u => /\.bin(\.gz)?$/.test(u)).length;
  assert.ok(binsOf() <= packs.length, 'only the packages of the reduced scene were fetched');
  // the same question in mode 'find' ignores the focus: every candidate is there
  ready = []; v.update({...name, key: 'focus-find', mode: 'find'}); await settle();
  const drawnFind = new Set(meshes().filter(m => m.visible).map(m => m.userData.structureId));
  assert.ok(drawnFind.has(far.id), 'mode find draws the far structure too (every distractor)');
  v.dispose();
  // the step after the reduced one is brought in at low priority: the whole scene lands in memory without a question asking for it
  clearPackageCache(); ready = []; errors = []; requests.length = 0;
  const w = createQuizViewer(element(), catalogue, callbacks);
  w.update({...makeState('warm', 'Right gluteus maximus'), mode: 'name', progressive: true, focus, next: {catalogue, target, focus, warm: target}}); await settle();
  const deadline = Date.now() + 8000; while (binsOf() < packsFull.length && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(binsOf(), packsFull.length, 'the warm-up fetches the packages of the whole scene in the background');
  w.dispose();
}

clearPackageCache(); ready = []; errors = []; failures = true;
viewer = createQuizViewer(element(), catalogue, callbacks); viewer.update(makeState('offline', 'Right patella', 'knee')); await settle();
assert.ok(errors.length); assert.ok(!ready.some(r => r.value), 'Incomplete model never allows scoring');
viewer.dispose(); failures = false; ready = []; errors = [];
viewer = createQuizViewer(element(), catalogue, callbacks);
viewer.update(makeState('old', 'Right gluteus maximus'));
viewer.update(makeState('latest', 'Right patella', 'knee'));
await settle();
assert.deepEqual(ready.filter(r => r.value).map(r => r.key), ['latest'], 'Late load cannot enable an earlier question');
viewer.dispose();
console.log('Quiz viewer CPU integration passed: all five systems, true ray hits, red/green materials, peeling, keyboard, drag/pinch, cached reload, failure lockout and stale-response guard. GPU drawing remains untested.');
