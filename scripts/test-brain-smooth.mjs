// Brain detail mode: the cortex is smoothed (one Loop subdivision step), cranial nerves are cut back to the stretch near the brain by dropping whole triangles, branches outside the
// skull start switched off, and a selected deep structure fades the cortex in front of it. The real model is checked in the browser (scripts/browser/brain-views.cjs).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {quizModule} from './quiz-modules.mjs';
const {loopSubdivide, nearMask, keepNear} = await quizModule('app/organ/brain-smooth.ts');
const indexed = (positions, faces) => {const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(positions), 3)); g.setIndex(faces); return g;};

// a closed octahedron: 6 vertices, 8 faces -> 18 vertices, 32 faces; every vertex moves inward onto the limit surface and the mesh stays closed
const oct = indexed([1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1], [0, 2, 4, 2, 1, 4, 1, 3, 4, 3, 0, 4, 0, 5, 2, 2, 5, 1, 1, 5, 3, 3, 5, 0]);
const s = loopSubdivide(oct), p = s.getAttribute('position');
assert.equal(p.count, 18); assert.equal(s.getIndex().count / 3, 32);
const edges = new Map(); const ix = s.getIndex().array;
for (let t = 0; t < ix.length; t += 3) for (const [a, b] of [[ix[t], ix[t + 1]], [ix[t + 1], ix[t + 2]], [ix[t + 2], ix[t]]]) {const k = Math.min(a, b) + ':' + Math.max(a, b); edges.set(k, (edges.get(k) ?? 0) + 1);}
assert.ok([...edges.values()].every(n => n === 2), 'a closed mesh stays closed');
for (let i = 0; i < 6; i++) assert.ok(Math.hypot(p.getX(i), p.getY(i), p.getZ(i)) < 1 && Math.hypot(p.getX(i), p.getY(i), p.getZ(i)) > .5, 'old vertices move a little inward, not collapse');

// an open patch (two triangles): the border keeps its two end points' line, nothing is lost, and two patches sharing a border give the same border points
const patchA = indexed([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0], [0, 1, 2, 0, 2, 3]), a = loopSubdivide(patchA);
assert.equal(a.getIndex().count / 3, 8); assert.ok(a.getAttribute('position').count >= 4 + 5);
const patchB = indexed([1, 0, 0, 2, 0, 0, 2, 1, 0, 1, 1, 0], [0, 1, 2, 0, 2, 3]);
const ptsA = new Set(), ptsB = new Set(); const onBorder = (g, set) => {const q = g.getAttribute('position'); for (let i = 0; i < q.count; i++) if (Math.abs(q.getX(i) - 1) < 1e-6) set.add(q.getY(i).toFixed(5));};
onBorder(a, ptsA); onBorder(loopSubdivide(patchB), ptsB);
assert.ok(ptsA.size > 0 && [...ptsA].every(v => ptsB.has(v)), 'neighbouring patches keep the same shared border');

// nerve reach: cells within the radius of the cloud are kept, whole triangles only
const cloud = [0, 0, 0, .01, 0, 0], mask = nearMask([cloud], .003, .018);
assert.ok(mask.has(0, 0, 0) && mask.has(.02, 0, 0), 'near the cloud'); assert.ok(!mask.has(.08, 0, 0) && !mask.has(0, .08, 0), 'far from the cloud');
const tube = indexed([0, 0, 0, .004, 0, 0, 0, .004, 0, .01, 0, 0, .014, 0, 0, .01, .004, 0, .2, 0, 0, .204, 0, 0, .2, .004, 0], [0, 1, 2, 3, 4, 5, 6, 7, 8]);
const kept = keepNear(tube, mask);
assert.equal(kept.getIndex().count, 6, 'the two triangles near the brain stay, the far one goes'); assert.equal(kept.getAttribute('position').count, 6);
assert.equal(keepNear(indexed([.2, 0, 0, .204, 0, 0, .2, .004, 0], [0, 1, 2]), mask), null, 'a nerve wholly out of reach is dropped entirely');

// wiring in the viewer
const viewer = fs.readFileSync('app/organ/brain-viewer.ts', 'utf8'), page = fs.readFileSync('app/organ/brain.tsx', 'utf8');
assert.match(viewer, /loopSubdivide\(geometry\)/); assert.match(viewer, /keepNear\(mesh\.geometry, mask\)/); assert.match(viewer, /COVER_OPACITY/);
assert.match(viewer, /coarseOf\(mesh\)\.getAttribute\('position'\)/, 'the cut surface is computed from the unsmoothed meshes');
assert.match(page, /hiddenParts: \[\.\.\.new Set\(\[\.\.\.v\.hiddenParts, \.\.\.peripheral\.current\]\)\]/, 'peripheral nerve branches start switched off');
const re = /PERIPHERAL_NERVE = (\/.*\/i);/.exec(viewer); assert.ok(re); const rx = eval(re[1]);
for (const n of ['Buccal nerve', 'Mental nerve', 'Inferior alveolar nerve', 'Lingual nerve', 'Anterior division of mandibular nerve', 'Posterior division of mandibular nerve', 'Meningeal branch of maxillary nerve']) assert.ok(rx.test(n), n);
for (const n of ['Facial nerve (VII)', 'Vagus nerve (X)', 'Trigeminal nerve (V)', 'Maxillary nerve', 'Optic nerve (II)', 'Hypoglossal nerve (XII)']) assert.ok(!rx.test(n), `${n} is a root, stays on`);
console.log('Brain detail: Loop smoothing, nerve reach, peripheral branches off and cortex fade checked.');
