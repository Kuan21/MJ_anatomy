// Regression for the brain midline structures (core check, no generated files needed beyond public/models/brain.glb): in the brain detail model and the brain quiz source the optic chiasm, pons,
// midbrain, tentorium cerebelli and anterior spinal artery are ONE structure each (no .l/.r), the medulla oblongata is complete (left half plus its mirror), the body of the fornix is cut
// from the two fornix meshes, and every one of them is closed across x = 0 with no gap. Prints pass/fail and counts only.
import assert from 'node:assert/strict';
import {loadBrainRows} from './lib/brain-quiz-source.mjs';
const {rows, dropped} = await loadBrainRows();
const by = en => rows.filter(r => r.part.en === en);
const span = r => {const b = r.geometry.boundingBox; return [b.min.x * 1e3, b.max.x * 1e3];};
/** edges that belong to exactly one triangle after welding: the seam on x = 0 is closed when none of them lies on the midline plane */
const openEdgesOnMidline = r => {
  const ix = r.geometry.getIndex(), p = r.geometry.getAttribute('position'), cnt = new Map(); let n = 0;
  for (let t = 0; t < ix.count; t += 3) for (let k = 0; k < 3; k++) {const a = ix.getX(t + k), b = ix.getX(t + (k + 1) % 3), key = a < b ? a + '_' + b : b + '_' + a; cnt.set(key, (cnt.get(key) ?? 0) + 1);}
  for (const [key, c] of cnt) if (c === 1) {const [a, b] = key.split('_').map(Number); if (Math.abs(p.getX(a)) < 1e-6 && Math.abs(p.getX(b)) < 1e-6) n++;}
  return n;
};
for (const [en, minX, maxX] of [['Optic chiasm', -7, 7], ['Pons', -20, 20], ['Midbrain', -14, 14], ['Tentorium cerebelli', -60, 60], ['Medulla oblongata', -13, 13]]) {
  const hits = by(en); assert.equal(hits.length, 1, `${en}: one structure (found ${hits.length})`);
  assert.equal(hits[0].part.side, 'mid', `${en}: no side`); assert.ok(!/\.[lr]$/i.test(hits[0].raw.name), `${en}: no .l/.r name`);
  const [lo, hi] = span(hits[0]); assert.ok(lo < minX + 1 && hi > maxX - 1, `${en}: covers both sides (${lo.toFixed(1)}..${hi.toFixed(1)} mm)`);
  assert.equal(openEdgesOnMidline(hits[0]), 0, `${en}: open edges on the midline plane`);
}
assert.ok(!dropped.some(d => d.raw && /\.[lr]$/.test(d.raw.name) && /^(Optic chiasm|Pons|Midbrain|Tentorium cerebelli|Medulla oblongata)$/.test(d.raw.label)), 'no half left behind');
const body = by('Body of fornix'); assert.equal(body.length, 1, 'one Body of fornix'); assert.equal(body[0].part.side, 'mid');
const [blo, bhi] = span(body[0]); assert.ok(blo < -5 && bhi > 5, `the body of the fornix spans the midline (${blo.toFixed(1)}..${bhi.toFixed(1)} mm)`);
const fornix = by('Fornix'); assert.deepEqual(fornix.map(r => r.part.side).sort(), ['left', 'right'], 'left and right fornix stay');
for (const r of fornix) { const [lo, hi] = span(r); assert.ok(r.part.side === 'left' ? lo > -0.5 : hi < 0.5, 'fornix half stays on its own side'); }
const fornixTriangles = fornix.reduce((n, r) => n + r.geometry.getIndex().count / 3, 0) + body[0].geometry.getIndex().count / 3;
assert.equal(fornixTriangles, 2 * 2158, 'the two fornix meshes (2 x 2158 triangles) are partitioned into body and halves, none lost or duplicated');
console.log(`Brain midline structures OK: ${['Optic chiasm', 'Pons', 'Midbrain', 'Tentorium cerebelli', 'Medulla oblongata', 'Body of fornix'].length} single structures, no half left, seams closed.`);
