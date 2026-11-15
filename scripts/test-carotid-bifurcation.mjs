// Carotid bifurcation regression on the real neck vessel data: the first rings of the internal and external carotid are rebuilt as two halves of the common carotid's end ring
// (closed, no flat cut), the diameter runs on continuously, the two branches no longer pass through each other, both sides match, and the parent, the distal ends and every radius above the junction are unchanged.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import {quizModule} from './quiz-modules.mjs';
import {measureAll, measureSide, info, SIDES} from './lib/carotid-measure.mjs';
const {smoothCarotids, junctionPairs, stitchNormals, raiseBifurcation, RAISE, COMMON_BLEND, BRANCH_BLEND} = await quizModule('app/biomechanics-v2/carotid-bifurcation.ts');
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
  // the common carotid is lengthened at its end only: rings further than COMMON_BLEND (arc length) below the end are untouched, the end moves up by RAISE, no ring changes shape or radius, the spacing never jumps
  { const A = get(after, c), B = get(before, c), n = A.positions.length / 36; let arc = 0;
    for (let j = n - 1; j >= 0; j--) {
      if (j < n - 1) arc += Math.hypot(...info(B, j).c.map((x, k) => x - info(B, j + 1).c[k]));
      assert.ok(Math.abs(info(A, j).r / info(B, j).r - 1) < 1e-4, `${c}: radius of ring ${j} changed`);
      if (arc > COMMON_BLEND + 1e-9) assert.deepEqual(A.positions.slice(j * 12 * 3, (j + 1) * 12 * 3), B.positions.slice(j * 12 * 3, (j + 1) * 12 * 3), `${c}: ring ${j} below the blend moved`);
    }
    const rise = (info(A, n - 1).c[1] - info(B, n - 1).c[1]); assert.ok(Math.abs(rise - RAISE) < 1e-6, `${side}: bifurcation raised by ${rise} m, not ${RAISE}`);
    const steps = (V) => Array.from({length: n - 1}, (_, j) => Math.hypot(...info(V, j + 1).c.map((x, k) => x - info(V, j).c[k])));
    const sa = steps(A), sb = steps(B); sa.forEach((x, j) => assert.ok(x / sb[j] < 1.8 && x / sb[j] > 0.99, `${c}: ring spacing ${j} changes by x${(x / sb[j]).toFixed(2)}`));
  }
  // the raise alone (before the rebuild of the first rings): a rigid shift per ring that fades out smoothly, no step between neighbouring rings
  { const raw = load(), by = n => raw.vessels.find(v => v.name === n); raiseBifurcation(by(c), by(i), by(e));
    for (const nm of [c, i, e]) { const A = by(nm), B = get(before, nm), nn = A.positions.length / 36; let prev = null;
      for (let j = 0; j < nn; j++) { const d = info(A, j).c.map((x, k) => x - info(B, j).c[k]); if (prev) assert.ok(Math.hypot(...d.map((x, k) => x - prev[k])) < .0035, `${nm}: raise steps between rings ${j - 1} and ${j}`); prev = d; } } }
  // the external and internal carotid start segments become shorter by about RAISE (distal ends fixed), the shift fades out over BRANCH_BLEND without a step
  for (const nm of [i, e]) {
    const A = get(after, nm), B = get(before, nm), nn = A.positions.length / 36, L = V => { let t = 0; for (let j = 1; j < nn; j++) t += Math.hypot(...info(V, j).c.map((x, k) => x - info(V, j - 1).c[k])); return t; };
    assert.ok(L(B) - L(A) > RAISE * .6, `${nm}: start segment not shortened (${((L(B) - L(A)) * 1000).toFixed(1)} mm)`);
  }
  // flat cut closed: seven vertices of each first ring coincide with the common end ring
  const cn = get(after, c).positions.length / 36, end = info(get(after, c), cn - 1).p;
  for (const n of [i, e]) {
    const f = info(get(after, n), 0).p; let shared = 0; for (const q of f) if (end.some(r => Math.hypot(q[0] - r[0], q[1] - r[1], q[2] - r[2]) < 1e-7)) shared++;
    assert.ok(shared >= 7, `${n}: first ring shares ${shared} vertices with the common end ring (needs 7)`);
    const pa = get(after, n).positions, pb = get(before, n).positions, rings = pa.length / 36;
    assert.equal(pa.length, pb.length); assert.deepEqual(get(after, n).indices, get(before, n).indices, 'same triangles');
    for (let j = 16; j < rings; j++) assert.ok(Math.abs(info(get(after, n), j).r / info(get(before, n), j).r - 1) < 1e-4, `${n}: radius of ring ${j} changed`);
    assert.deepEqual(pa.slice(-36), pb.slice(-36), `${n}: distal end moved`);
    const pairs = junctionPairs(get(after, c).positions, pa); assert.ok(pairs.length >= 7, `${n}: ${pairs.length} seam vertices`);
    const na = {array: Float32Array.from(get(after, c).positions, () => 0)}, nb = {array: Float32Array.from(pa, () => 0)}; for (const [x, y] of pairs) { na.array[x * 3 + 1] = 1; nb.array[y * 3] = 1; }
    stitchNormals(na, nb, pairs); for (const [x, y] of pairs) assert.ok(Math.abs(na.array[x * 3] - nb.array[y * 3]) < 1e-9 && Math.abs(Math.hypot(na.array[x * 3], na.array[x * 3 + 1]) - 1) < 1e-6, 'seam normals match');
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
  // the two branches are visibly apart 1 to 2 cm above the bifurcation (wall to wall at least 1.5 mm there), the internal carotid behind and outside the external one
  { const C = get(after, c), top = info(C, C.positions.length / 36 - 1).c[1];
    for (const h of [.015, .02]) { const near = V => { let b = null, bd = 1e9; for (let j = 0; j < V.positions.length / 36; j++) { const q = info(V, j), dd = Math.abs(q.c[1] - (top + h)); if (dd < bd) { bd = dd; b = q; } } return b; }; const qi = near(I), qe = near(E);
      assert.ok(Math.hypot(...qi.c.map((x, k) => x - qe.c[k])) - qi.r - qe.r > .0015, `${side}: branches closer than 1.5 mm (wall to wall) ${h * 1000} mm above the bifurcation`);
      assert.ok(qi.c[2] < qe.c[2] - .003 && sign * (qi.c[0] - qe.c[0]) > -.0005, `${side}: internal carotid not posterolateral at ${h * 1000} mm`); } }
  // height of the bifurcation: at the upper edge of the thyroid cartilage plate (1498.8 mm, C4), within +0 to +4 mm above it (docs/carotid-landmarks.md)
  { const y = info(get(after, c), get(after, c).positions.length / 36 - 1).c[1]; assert.ok(y > 1.4988 && y < 1.5028, `${side}: bifurcation at y ${(y * 1000).toFixed(1)} mm, expected 1498.8 to 1502.8`); }
  assert.ok(Math.abs(info(get(after, c), get(after, c).positions.length / 36 - 1).c[1] - thyroidTop) < .03, `${side}: bifurcation more than 3 cm from the thyroid cartilage's upper edge`);
}
// both sides alike (mirror images within the source's own asymmetry)
for (const k of ['sectionAreaRatio', 'radiusStep']) a.left[k].forEach((v, i) => assert.ok(Math.abs(v - a.right[k][i]) < .08, `left and right differ in ${k}`));
console.log(`Carotid bifurcation raised by ${RAISE * 1000} mm to the thyroid cartilage's upper edge; crossings ${b.left.crossing.n}+${b.right.crossing.n} -> 0, radius step x${b.left.radiusStep[0]} -> x${a.left.radiusStep[0]}, each branch starts as half of the common section, ends and radii above the junction unchanged.`);
void measureSide; void BRANCH_BLEND;
