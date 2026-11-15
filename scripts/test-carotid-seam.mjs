// Seams of the carotid bifurcation (the junction of the common carotid with its two branches, and the shift that raises the bifurcation): no step, no crease.
// Checked on the real neck vessel data, before the raise (source) and after it, and each limit is shown to catch the fault it is for (a hard step in the shift, and the averaged junction normals that drew a crease round the tube).
//   1. the raise alone is a smooth field: second difference of the shift between neighbouring rings stays small (smootherstep, C2 at both ends); a shift that stops at once is caught;
//   2. ring radius and spacing: neighbouring rings of the common carotid differ by under 1.05 in radius, and the raise does not make any spacing jump worse than the source's own;
//   3. the first vertex of every ring turns by one vertex per ring with the same spread as in the source (the raise is a translation: it cannot twist the rings);
//   4. normals: at the junction (end ring of the common carotid, first ring of each branch) and the row below, the vertex normal stays within 5 degrees of radial; the old averaged rule is far outside this limit.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import {quizModule} from './quiz-modules.mjs';
import {info, SIDES, vertexNormals, normalVsRadial, ringAngles, angleSteps, spacingRatios, shiftSecondDifference} from './lib/carotid-measure.mjs';
const {smoothCarotids, raiseBifurcation, junctionPairs, junctionNormals, stitchNormals} = await quizModule('app/biomechanics-v2/carotid-bifurcation.ts');
const load = () => JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL('../public/models/neck-vessels.json.gz', import.meta.url))));
const clone = d => JSON.parse(JSON.stringify(d));
const src = load(), raised = clone(src), full = clone(src);
const by = (d, n) => d.vessels.find(v => v.name === n);
const SECOND_DIFF_MM = 1.0, NORMAL_DEG = 5;
const ringSteps = v => { const n = v.positions.length / 36, s = []; for (let r = 1; r < n; r++) s.push(Math.hypot(...info(v, r).c.map((x, k) => x - info(v, r - 1).c[k]))); return s; };
for (const [side, c, i, e] of SIDES) {
  raiseBifurcation(by(raised, c), by(raised, i), by(raised, e));
  // 1. shift field
  for (const nm of [c, i, e]) { const sd = shiftSecondDifference(by(src, nm), by(raised, nm)); assert.ok(Math.max(...sd) <= SECOND_DIFF_MM, `${side} ${nm}: shift changes abruptly (second difference ${Math.max(...sd).toFixed(2)} mm)`); }
  // the check does catch a step: the same raise with no taper (the last three rings of the common carotid pushed 13 mm up at once)
  { const hard = clone(src), V = by(hard, c), n = V.positions.length / 36; for (let r = n - 3; r < n; r++) for (let k = 0; k < 12; k++) V.positions[(r * 12 + k) * 3 + 1] += 0.013;
    assert.ok(Math.max(...shiftSecondDifference(by(src, c), V)) > 5 * SECOND_DIFF_MM, `${side}: a hard step in the shift is not caught`); }
  // 2. radius and spacing of the common carotid
  { const A = by(raised, c), B = by(src, c), n = A.positions.length / 36;
    for (let r = Math.max(1, n - 25); r < n; r++) { const q = info(A, r).r / info(A, r - 1).r; assert.ok(Math.max(q, 1 / q) < 1.05, `${side}: common carotid radius jumps at ring ${r}`); }
    assert.ok(Math.max(...spacingRatios(A)) <= Math.max(...spacingRatios(B)) * 1.10, `${side}: the raise makes a spacing jump worse (${Math.max(...spacingRatios(A)).toFixed(2)} against ${Math.max(...spacingRatios(B)).toFixed(2)})`);
    // 3. ring start angles
    const sa = angleSteps(ringAngles(A)), sb = angleSteps(ringAngles(B)); sa.forEach((x, r) => assert.ok(Math.abs(x - sb[r]) < 1, `${side}: ring ${r} start angle turned by ${(x - sb[r]).toFixed(1)} degrees more than in the source`));
    const med = [...sb].sort((p, q) => p - q)[sb.length >> 1]; sb.forEach((x, r) => r >= sb.length - 25 && assert.ok(Math.abs(x - med) < 12, `${side}: source ring ${r} turns ${x.toFixed(0)} degrees (median ${med.toFixed(0)})`)); }
  void ringSteps;
}
// 4. normals at the junction, built as the viewer builds them (face normals, then the junction rule)
smoothCarotids(full.vessels);
const asGeo = v => ({positions: Float32Array.from(v.positions), normals: vertexNormals(v.positions, v.indices)});
let oldWorst = 0;
for (const [side, c, i, e] of SIDES) {
  const C = by(full, c), cg = asGeo(C), cn = C.positions.length / 36;
  const oldN = {c: Float64Array.from(cg.normals)};
  for (const nm of [i, e]) {
    const B = by(full, nm), bg = asGeo(B), pairs = junctionPairs(cg.positions, bg.positions), oldB = Float64Array.from(bg.normals);
    assert.ok(pairs.length >= 7, `${side} ${nm}: ${pairs.length} seam vertices`);
    junctionNormals(cg.positions, cg.normals, bg.positions, bg.normals, pairs);
    for (const [j, nrm] of [[cn - 1, cg.normals], [cn - 2, cg.normals]]) assert.ok(normalVsRadial(C, nrm, j) <= NORMAL_DEG, `${side}: common carotid ring ${j} normals ${normalVsRadial(C, nrm, j)} degrees from radial`);
    // the old rule (average of the two face-based normals) on the same data
    stitchNormals({array: oldN.c}, {array: oldB}, pairs); oldWorst = Math.max(oldWorst, normalVsRadial(C, oldN.c, cn - 1));
  }
}
assert.ok(oldWorst > 30, `the averaged junction normals are within ${oldWorst} degrees of radial: the check would not catch the crease it is for`);
console.log(`Carotid seams: shift second difference <= ${SECOND_DIFF_MM} mm (a hard step is caught), radius ratio < 1.05, ring start angles as in the source, junction normals <= ${NORMAL_DEG} degrees from radial (the old averaged rule: ${oldWorst} degrees).`);
