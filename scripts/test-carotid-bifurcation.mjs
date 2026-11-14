// Carotid bifurcation regression on the real neck vessel data: the first rings of the internal and external carotid are rebuilt as two halves of the common carotid's end ring
// (closed, no flat cut), the diameter runs on continuously, the two branches no longer pass through each other, both sides match, and the parent, the distal ends and every radius above the junction are unchanged.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import {quizModule} from './quiz-modules.mjs';
import {measureAll, measureSide, info, SIDES} from './lib/carotid-measure.mjs';
const {smoothCarotids} = await quizModule('app/biomechanics-v2/carotid-bifurcation.ts');
const load = () => JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL('../public/models/neck-vessels.json.gz', import.meta.url))));
const atlasJson = JSON.parse(fs.readFileSync(new URL('../public/models/atlas.json', import.meta.url), 'utf8'));
const thyroidTop = atlasJson.parts.find(p => p.name === 'Thyroid cartilage').bounds[1][1];
const before = load(), after = load();
assert.equal(smoothCarotids(after.vessels).length, 2, 'both sides rebuilt');
const b = measureAll(before.vessels), a = measureAll(after.vessels);
const get = (d, n) => d.vessels.find(v => v.name === n);
for (const [side, c, i, e] of SIDES) {
  const m = a[side], m0 = b[side];
  assert.ok(m0.crossing.n > 20, 'the source branches really pass through each other (' + m0.crossing.n + ' vertices)');
  assert.equal(m.crossing.n + m.crossingOther.n, 0, `${side}: branches still cross`);
  m.sectionAreaRatio.forEach(r => assert.ok(Math.abs(r - .5) < .06, `${side}: each branch starts as half of the common section (${r})`));
  m.radiusStep.forEach(r => assert.ok(r <= 1.08, `${side}: diameter jumps between rings (x${r})`));
  m.centreJump.forEach((r, k) => assert.ok(r <= 2.5 && r < m0.centreJump[k], `${side}: centre line kinks (${m0.centreJump[k]} -> ${r})`));
  assert.deepEqual(get(after, c).positions, get(before, c).positions, 'common carotid untouched');
  // flat cut closed: seven vertices of each first ring coincide with the common end ring
  const cn = get(after, c).positions.length / 36, end = info(get(after, c), cn - 1).p;
  for (const n of [i, e]) {
    const f = info(get(after, n), 0).p; let shared = 0; for (const q of f) if (end.some(r => Math.hypot(q[0] - r[0], q[1] - r[1], q[2] - r[2]) < 1e-7)) shared++;
    assert.ok(shared >= 7, `${n}: first ring shares ${shared} vertices with the common end ring (needs 7)`);
    const pa = get(after, n).positions, pb = get(before, n).positions, rings = pa.length / 36;
    assert.equal(pa.length, pb.length); assert.deepEqual(get(after, n).indices, get(before, n).indices, 'same triangles');
    for (let j = 12; j < rings; j++) assert.ok(Math.abs(info(get(after, n), j).r / info(get(before, n), j).r - 1) < 1e-4, `${n}: radius of ring ${j} changed`);
    assert.deepEqual(pa.slice(-36), pb.slice(-36), `${n}: distal end moved`);
  }
}
// anatomy of the origin (both sides, mirrored): internal carotid behind and outside the external carotid, which lies in front and inside
for (const [side, c, i, e] of SIDES) {
  const sign = side === 'left' ? 1 : -1, I = get(after, i), E = get(after, e);
  for (const j of [4, 9, 14]) {
    const qi = info(I, j), qe = info(E, j);
    assert.ok(qi.c[2] < qe.c[2] - .0015, `${side}: internal carotid must lie behind the external at ring ${j}`);
    assert.ok(sign * (qi.c[0] - qe.c[0]) > -.0005, `${side}: internal carotid must lie outside the external at ring ${j}`);
  }
  // carotid sinus: the internal carotid swells 10 to 25 % above its D-shaped origin within about 2 cm, smoothly (the swelling is the source radius; nothing is inflated)
  const r = Array.from({length: 24}, (_, j) => info(I, j).r), peak = Math.max(...r.slice(0, 20)), at = r.indexOf(peak);
  assert.ok(peak / r[0] >= 1.10 && peak / r[0] <= 1.25, `${side}: carotid sinus swelling x${(peak / r[0]).toFixed(2)} outside 10-25 %`);
  assert.ok(at >= 6 && at <= 16, `${side}: swelling peaks at ring ${at}`);
  // height of the bifurcation against the upper edge of the thyroid cartilage (reported, see docs/larynx-bifurcation.md)
  assert.ok(Math.abs(info(get(after, c), get(after, c).positions.length / 36 - 1).c[1] - thyroidTop) < .03, `${side}: bifurcation more than 3 cm from the thyroid cartilage's upper edge`);
}
// both sides alike (mirror images within the source's own asymmetry)
for (const k of ['sectionAreaRatio', 'radiusStep']) a.left[k].forEach((v, i) => assert.ok(Math.abs(v - a.right[k][i]) < .08, `left and right differ in ${k}`));
console.log(`Carotid bifurcation: crossings ${b.left.crossing.n}+${b.right.crossing.n} -> 0, radius step x${b.left.radiusStep[0]} -> x${a.left.radiusStep[0]}, each branch starts as half of the common section, ends and radii above the junction unchanged.`);
void measureSide;
