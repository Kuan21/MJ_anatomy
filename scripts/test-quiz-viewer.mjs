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
  if (key === 'three' || key.includes('OrbitControls')) {
    const exports = key === 'three' ? {...T, WebGLRenderer: Renderer} : {OrbitControls: Controls};
    module = new vm.SyntheticModule(Object.keys(exports), function () {for (const [name, value] of Object.entries(exports)) this.setExport(name, value);});
  } else {
    const source = ts.transpileModule(fs.readFileSync(key, 'utf8'), {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext}}).outputText;
    module = new vm.SourceTextModule(source, {identifier: key, initializeImportMeta(meta) {meta.env = {BASE_URL: '/'};}});
  }
  cache.set(key, module); return module;
}
async function link(spec, ref) {return moduleFor(spec.startsWith('.') ? path.resolve(path.dirname(ref.identifier), spec + '.ts') : spec);}
const module = await moduleFor(path.join(root, 'app/quiz/viewer.ts'));
await module.link(link); await module.evaluate();
const {createQuizViewer} = module.namespace;
let ready = [], errors = [], picks = [], missed = 0;
const callbacks = {ready: (key, value) => ready.push({key, value}), progress() {}, error: e => {if (e) errors.push(e);}, pick: id => picks.push(id), miss: () => missed++, keyboard() {}};
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
assert.ok(meshes(state.target.id).every(m => m.visible && m.material.color.getHexString() === '49e5a0' && !m.material.depthTest));
assert.ok(meshes(other).every(m => m.visible && m.material.color.getHexString() === 'f76d7d'));
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
  assert.ok(meshes(state.target.id).every(m => m.material.color.getHexString() === '49e5a0'));
}
const completedRequests = requests.length;
viewer.update(makeState('cached', 'Right patella', 'knee')); await settle();
assert.equal(requests.length, completedRequests, 'Revisiting a question reuses loaded geometry');
assert.ok(requests.every(url => url.includes('/models/stream/quiz-lower-')), 'No whole-body models, brain or motion data');
viewer.dispose();

ready = []; errors = []; failures = true;
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
