// HN-21b regression: in the first centimetres above the carotid bifurcation the external carotid lies in front of and medial to the internal carotid and the two walls are apart,
// the displacement is smooth (no step, no new kink, no seam at the junction), the internal carotid and everything outside the displaced stretch is untouched, and the
// neighbours (internal jugular vein as aligned, vagus nerve, hypoglossal nerve, sympathetic trunk, pharyngeal wall) keep their clearance. Reverse test: the state before the change (raise + rebuild only) fails the separation rules.
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
import {info, SIDES} from './lib/carotid-measure.mjs';
import {loadVessels, separation} from './measure-carotid-separation.mjs';
const M = await quizModule('app/biomechanics-v2/carotid-bifurcation.ts');
const {SEP_MM, SEP_END, SEP_FULL, separationAt, raiseBifurcation, smoothBifurcation} = M;
const source = await loadVessels(true), now = await loadVessels(false, M);
/** the state before HN-21b: raise and rebuild, no extra separation */
const old = await loadVessels(true); for (const [, c, i, e] of SIDES) { const by = n => old.find(v => v.name === n); raiseBifurcation(by(c), by(i), by(e)); smoothBifurcation(by(c), by(i), by(e)); }
const get = (vs, n) => vs.find(v => v.name === n), ringsN = v => v.positions.length / 36;
const dN = separation(now), d0 = separation(old);
const rules = (sep, side) => { const sign = side === 'left' ? 1 : -1, err = [];
  for (const r of sep[side]) {
    if (r.h < 5) continue;
    if (!(r.wall >= 0)) err.push(`${side} ${r.h} mm: walls overlap or touch (wall gap ${r.wall} mm)`);
    if (r.h >= 10 && r.h <= 20 && !(r.wall >= 1.5)) err.push(`${side} ${r.h} mm: wall gap ${r.wall} mm < 1.5`);
    if (!(r.dz < -0.3 * r.centre)) err.push(`${side} ${r.h} mm: the external carotid is not in front (dz ${r.dz})`);
    if (r.h >= 8 && r.h <= 18 && !(sign * r.dx >= 0.3 * r.centre)) err.push(`${side} ${r.h} mm: the external carotid is not medial enough (lateral share ${(sign * r.dx / r.centre).toFixed(2)})`);
  } return err; };
for (const side of ['left', 'right']) {
  assert.deepEqual(rules(dN, side), [], `${side}: separation rules`);
  assert.ok(rules(d0, side).length >= 3, `${side}: reverse test, the earlier state (centres 4.7 mm apart at 5 mm, nearly in line front to back) violates the rules (${rules(d0, side).length} violations)`);
}
for (const [side, c, i, e] of SIDES) {
  const sign = side === 'left' ? 1 : -1, I1 = get(now, i), I0 = get(old, i), E1 = get(now, e), E0 = get(old, e), C1 = get(now, c), C0 = get(old, c), n = ringsN(E1);
  // the internal carotid and the common carotid are not touched by this step
  assert.deepEqual(I1.positions, I0.positions, `${i} moved`); assert.deepEqual(C1.positions, C0.positions, `${c} moved`);
  // external carotid: zero shift at the junction ring (the seam stays closed) and from the end of the stretch on; the shift is purely forward and medial
  let arc = 0, prev = null, maxStep = 0, maxSlope = 0; const shifts = [], arcs = [];
  for (let r = 0; r < n; r++) {
    const a = info(E1, r).c, b = info(E0, r).c; if (prev) arc += Math.hypot(...a.map((x, k) => x - prev[k])); prev = a;
    const s = a.map((x, k) => x - b[k]); shifts.push(s); arcs.push(arc);
    assert.ok(Math.abs(s[1]) < 1e-9, `${e} ring ${r}: vertical shift`);
    assert.ok(Math.abs(s[2]) <= SEP_MM * .6 + 1e-9 && Math.abs(s[0]) <= SEP_MM * .8 + 1e-9, `${e} ring ${r}: shift ${s.map(x => (x * 1e3).toFixed(2))}`);
    if (r) { const ds = Math.hypot(...s.map((x, k) => x - shifts[r - 1][k])), dl = Math.hypot(...info(E0, r).c.map((x, k) => x - info(E0, r - 1).c[k])) || 1e-6; maxSlope = Math.max(maxSlope, ds / dl); maxStep = Math.max(maxStep, ds); }
  }
  assert.deepEqual(E1.positions.slice(0, 36).map((x, k) => x - E0.positions[k]).map(Math.abs).reduce((m, x) => Math.max(m, x), 0) < 1e-9, true, `${e}: first ring (seam with the common carotid) moved`);
  assert.deepEqual(E1.positions.slice(-36), E0.positions.slice(-36), `${e}: distal end moved`);
  const lastMoved = shifts.findLastIndex(s => Math.hypot(...s) > 1e-9);
  assert.ok(arcs[lastMoved] <= SEP_END * 1.35 && arcs[lastMoved] > SEP_END * .6, `${e}: shift ends at ${(arcs[lastMoved] * 1e3).toFixed(1)} mm`);
  assert.ok(maxSlope < .7, `${e}: shift changes by ${maxSlope.toFixed(2)} mm per mm of tube (a step)`);
  assert.ok(Math.hypot(...shifts.reduce((m, s) => Math.hypot(...s) > Math.hypot(...m) ? s : m, [0, 0, 0])) > SEP_MM * .95 && SEP_MM >= .0025 && SEP_MM <= .004, `${e}: full shift ${SEP_MM}`);
  // medial = towards the midline, forward = +z
  const big = shifts.reduce((m, s) => Math.hypot(...s) > Math.hypot(...m) ? s : m, [0, 0, 0]); assert.ok(sign * big[0] < 0 && big[2] > 0, `${e}: shift direction ${big.map(x => (x * 1e3).toFixed(2))}`);
  // no new kink: the angle between neighbouring centre-line segments grows by at most 12 degrees against the earlier state
  const ang = V => { const cs = Array.from({length: ringsN(V)}, (_, r) => info(V, r).c), o = []; for (let r = 1; r < cs.length - 1; r++) { const u = cs[r].map((x, k) => x - cs[r - 1][k]), w = cs[r + 1].map((x, k) => x - cs[r][k]); o.push(Math.acos(Math.max(-1, Math.min(1, (u[0] * w[0] + u[1] * w[1] + u[2] * w[2]) / (Math.hypot(...u) * Math.hypot(...w) || 1)))) * 180 / Math.PI); } return o; };
  const a1 = ang(E1), a0 = ang(E0); assert.ok(Math.max(...a1.map((x, k) => x - a0[k])) <= 12, `${e}: centre line kinks by ${Math.max(...a1.map((x, k) => x - a0[k])).toFixed(1)} degrees more`);
  // radii and triangles unchanged
  for (let r = 0; r < n; r++) assert.ok(Math.abs(info(E1, r).r / info(E0, r).r - 1) < 1e-4, `${e}: radius of ring ${r} changed`);
}
// neighbours: clearance of the external carotid (wall to wall, ring-centre method of measure-carotid-clearance) shrinks only in the displaced stretch and stays above 8 mm for hyoid, thyroid cartilage and pharyngeal constrictors, above 14 mm for the sympathetic trunk, and the vagus, hypoglossal nerve and internal jugular vein keep at least their earlier values (3.9, 14, 1.3 mm)
{ const {execFileSync} = await import('node:child_process'); const run = (...a) => execFileSync('node', ['scripts/measure-carotid-clearance.mjs', ...a], {encoding: 'utf8'});
  const rows = JSON.parse(run()), keyOf = r => `${r.side} ${r.artery} ${r.target}`, byKey = new Map(rows.map(r => [keyOf(r), r.gapMm]));
  for (const side of ['Left', 'Right']) {
    for (const t of ['Hyoid', 'Thyroid cart.', 'Mid. constrictor', 'Sup. constrictor']) assert.ok(byKey.get(`${side} ECA ${t}`) >= 8, `${side} ECA to ${t}: ${byKey.get(`${side} ECA ${t}`)} mm`);
    assert.ok(byKey.get(`${side} ECA Sympathetic trunk`) >= 14, `${side} ECA to sympathetic trunk ${byKey.get(`${side} ECA Sympathetic trunk`)} mm`);
    for (const t of ['Vagus', 'Hypoglossal', 'IJV']) assert.ok(byKey.get(`${side} ECA ${t}`) >= (t === 'Vagus' ? 3.9 : t === 'IJV' ? 1.3 : 14), `${side} ECA to ${t}: ${byKey.get(`${side} ECA ${t}`)} mm`);
    for (const t of ['Vagus', 'Hypoglossal', 'IJV', 'Sympathetic trunk', 'Mid. constrictor']) assert.ok(byKey.get(`${side} ICA ${t}`) !== undefined, 'ICA rows exist');
  } }
console.log(`External carotid moved forward and medially by up to ${SEP_MM * 1e3} mm over ${SEP_END * 1e3} mm (full from ${SEP_FULL * 1e3} mm); wall gap at 5/10/15 mm: left ${dN.left.filter(r => [5, 10, 15].includes(r.h)).map(r => r.wall)} (before ${d0.left.filter(r => [5, 10, 15].includes(r.h)).map(r => r.wall)}), right ${dN.right.filter(r => [5, 10, 15].includes(r.h)).map(r => r.wall)}; internal and common carotid unchanged.`);
void source; void separationAt;
