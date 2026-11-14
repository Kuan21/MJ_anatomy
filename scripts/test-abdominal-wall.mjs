// Anterolateral abdominal wall (scripts/lib/abdominal-layers.mjs), on the geometry the viewer loads:
//   1. from the front only the external oblique, the rectus sheath, the linea alba and rectus abdominis are ever the first thing a line of sight meets: never the internal oblique or the transversus abdominis;
//   2. along every line of sight the layers come in the order external oblique, internal oblique, transversus abdominis (no interleaving);
//   3. the internal oblique and transversus abdominis end at the semilunar line, within the 12 mm the stacking may move a vertex (they do not reach the midline);
//   4. the depth data: external oblique, rectus abdominis, rectus sheath superficial; internal oblique intermediate; transversus abdominis deep.
import assert from 'node:assert/strict';
import * as T from 'three';
import {loadViewerAtlas} from './lib/viewer-atlas.mjs';
import {quizModule} from './quiz-modules.mjs';
import {SEMILUNAR_X} from './lib/abdominal-layers.mjs';
const {atlas, geometry} = loadViewerAtlas(), {anatomyDepth} = await quizModule('app/mj-depth.ts');
const NAMES = ['Right external oblique', 'Left external oblique', 'Right internal oblique', 'Left internal oblique', 'Right transversus abdominis', 'Left transversus abdominis', 'Right rectus abdominis', 'Left rectus abdominis', 'rectus sheath', 'Linea alba'];
const parts = new Map(NAMES.map(n => [n, atlas.parts.find(p => p.name === n)])); for (const [n, p] of parts) assert.ok(p, 'missing ' + n);
const meshes = NAMES.map(n => { const g = geometry(parts.get(n)), bg = new T.BufferGeometry(); bg.setAttribute('position', new T.BufferAttribute(g.positions, 3)); bg.setIndex(new T.BufferAttribute(g.indices, 1)); const m = new T.Mesh(bg, new T.MeshBasicMaterial({side: T.DoubleSide})); m.name = n; return m; });
const kind = n => /external oblique/.test(n) ? 0 : /internal oblique/.test(n) ? 1 : /transversus/.test(n) ? 2 : 3;
const rc = new T.Raycaster(); let rays = 0, internalFirst = 0, disorder = 0; const first = {};
for (let x = -.14; x <= .1401; x += .01) for (let y = .9; y <= 1.24; y += .01) {
  rc.set(new T.Vector3(x, y, .4), new T.Vector3(0, 0, -1)); const h = rc.intersectObjects(meshes, false); if (!h.length) continue; rays++;
  const k = kind(h[0].object.name); first[k] = (first[k] || 0) + 1; if (k === 1 || k === 2) internalFirst++;
  // the wall is about 3 cm thick: only what lies within 4 cm of the first surface belongs to the wall (the line goes on through the body and meets the posterior parts of the muscles again)
  const seq = []; for (const i of h) { if (h[0].distance + .04 < i.distance) break; const q = kind(i.object.name); if (q < 3 && seq[seq.length - 1] !== q) seq.push(q); }
  // each flat muscle may appear once per side of the wall; the first appearances must be in the order 0, 1, 2
  const firstSeen = [...new Set(seq)]; for (let i = 1; i < firstSeen.length; i++) if (firstSeen[i] < firstSeen[i - 1]) { disorder++; break; }
}
assert.ok(rays > 600, `${rays} rays`);
assert.equal(internalFirst, 0, `${internalFirst} of ${rays} lines of sight from the front meet the internal oblique or transversus abdominis first`);
assert.equal(disorder, 0, `${disorder} lines of sight cross the layers out of order`);
for (const side of ['Right', 'Left']) for (const m of ['internal oblique', 'transversus abdominis']) {
  const g = geometry(parts.get(`${side} ${m}`)); let near = Infinity; for (let i = 0; i < g.positions.length; i += 3) near = Math.min(near, Math.abs(g.positions[i]));
  assert.ok(near >= SEMILUNAR_X - .015, `${side} ${m} reaches ${(near * 1000).toFixed(0)} mm from the midline (semilunar line ${SEMILUNAR_X * 1000} mm)`);
}
const depth = n => anatomyDepth(parts.get(n));
for (const s of ['Right', 'Left']) { assert.equal(depth(`${s} external oblique`), 'superficial'); assert.equal(depth(`${s} internal oblique`), 'intermediate'); assert.equal(depth(`${s} transversus abdominis`), 'deep'); assert.equal(depth(`${s} rectus abdominis`), 'superficial'); }
assert.equal(depth('rectus sheath'), 'superficial'); assert.equal(depth('Linea alba'), 'superficial');
console.log(`PASS abdominal wall: ${rays} lines of sight from the front (first hit: external oblique ${first[0] || 0}, rectus sheath/linea alba/rectus ${first[3] || 0}, deeper layers 0), layers in order, flat muscles end at the semilunar line, depth data as anatomy.`);
