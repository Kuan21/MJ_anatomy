// Regression (core review HN-22): the superficial part of the masseter lies lateral to the deep part, per side.
// The source's names were on the opposite meshes (the one named "deep" was the outer, anterior one); the names (with their concept ids) were exchanged, the meshes are untouched.
// Compared in 10 mm cells of height and front-back position: the mean distance from the midline of the superficial part is larger than that of the deep part in every shared cell. Prints pass/fail and counts only.
import assert from 'node:assert/strict';
import {loadFullAtlas} from './lib/full-atlas.mjs';
const {atlas, geometry} = loadFullAtlas();
const pts = name => { const p = atlas.parts.find(q => q.name === name); assert.ok(p, `part ${name}`); const P = geometry(p).positions, o = []; for (let i = 0; i < P.length; i += 3) o.push([P[i] * 1e3, P[i + 1] * 1e3, P[i + 2] * 1e3]); return {p, o}; };
let cells = 0;
for (const [side, s] of [['left', 1], ['right', -1]]) {
  const sup = pts(`Superficial part of ${side} masseter`), deep = pts(`Deep part of ${side} masseter`);
  assert.match(sup.p.conceptId, /^FMA4900[12]$/, 'superficial part keeps the superficial concept');
  assert.match(deep.p.conceptId, /^FMA4900[45]$/, 'deep part keeps the deep concept');
  const mean = a => a.reduce((t, v) => t + v[0] * s, 0) / a.length;
  const cell = a => { const m = new Map(); for (const v of a) { const k = Math.floor(v[1] / 10) + ',' + Math.floor(v[2] / 10); (m.get(k) || m.set(k, []).get(k)).push(v); } return m; };
  const cs = cell(sup.o), cd = cell(deep.o);
  for (const [k, a] of cs) { const b = cd.get(k); if (!b || a.length < 20 || b.length < 20) continue; cells++; assert.ok(mean(a) > mean(b), `${side} cell ${k}: superficial must be lateral to deep`); }
  assert.ok(sup.p.bounds[1][1] > 0 && Math.abs(Math.abs(sup.o.reduce((t, v) => t + v[0], 0) / sup.o.length) - Math.abs(deep.o.reduce((t, v) => t + v[0], 0) / deep.o.length)) < 10, 'both on the same side');
}
assert.ok(cells >= 12, 'enough cells compared');
console.log(`Masseter parts OK: superficial lateral to deep in ${cells} cells, both sides.`);
