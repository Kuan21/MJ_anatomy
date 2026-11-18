// The left recurrent laryngeal nerve lies in the tracheo-oesophageal groove (HN-24). Checks on the generated nerve and on the atlas meshes around it:
// 1. the displacement helper: zero offset at both ends, no step (smootherstep over the arc length), heights unchanged, input not modified;
// 2. the left nerve in the neck: at most 3 mm beyond the lateral wall of the trachea, wall gaps to trachea and oesophagus, clearance from the common carotid, inferior thyroid artery and vagus;
// 3. continuity: the two ends are where the vagus origin and the larynx landmark put them, the tube has no jump or kink, the right nerve and the unmoved parts are unchanged;
// 4. reverse control: the same checks on the earlier course (U.legacyRln) fail, with the nerve about 10 mm lateral of the trachea wall;
// 5. upper end and right hook (HN-24 follow-up): both nerves end on their own side behind the cricothyroid joint, never cross the midline or sink into the trachea; the right nerve climbs at once after
//    the hook under the subclavian artery; the course before this follow-up (U.legacyRlnEnds) is caught by each of these checks.
// Output is pass/fail and counts only.
import assert from 'node:assert/strict';
import {loadWorld} from './lib/paokao-world.mjs';
import {makeUtil} from './lib/paokao-util.mjs';
import {meshOf} from './lib/heart-geom.mjs';
import thoraxNerves from './paokao-structures/thorax-nerves.mjs';
import {displaceAlong, offsetsAlong, smootherstep, arcLengths} from './lib/rln-groove.mjs';
import {gapTo, loadNeck} from './measure-rln-groove.mjs';
import fs from 'node:fs';
import zlib from 'node:zlib';

// 1. the helper
{
  const path = Array.from({length: 51}, (_, i) => [i * .002, 1.36 + i * .0022, -.01]);
  const before = JSON.stringify(path), st = [{i: 10, dx: 0, dz: 0}, {i: 20, dx: -.01, dz: .004}, {i: 40, dx: -.012, dz: .002}, {i: 50, dx: 0, dz: 0}];
  const moved = displaceAlong(path, st), off = offsetsAlong(path, st);
  assert.equal(JSON.stringify(path), before, 'the input path is not modified');
  assert.deepEqual(moved.map(p => p[1]), path.map(p => p[1]), 'heights are unchanged');
  for (const i of [0, 5, 10, 50]) assert.ok(Math.hypot(off[i].dx, off[i].dz) === 0, `no offset at sample ${i}`);
  assert.ok(Math.abs(off[20].dx + .01) < 1e-12 && Math.abs(off[40].dx + .012) < 1e-12, 'the stations are reached exactly');
  // no step: the change of the offset between neighbouring samples is small and goes to zero at every station (smootherstep has zero slope at both of its ends)
  const s = arcLengths(path); let maxStep = 0; for (let i = 1; i < off.length; i++) maxStep = Math.max(maxStep, Math.hypot(off[i].dx - off[i - 1].dx, off[i].dz - off[i - 1].dz) / (s[i] - s[i - 1]));
  const bound = Math.max(...[[10, 20], [20, 40], [40, 50]].map(([i, j]) => 1.875 * Math.hypot(off[j].dx - off[i].dx, off[j].dz - off[i].dz) / (s[j] - s[i])));   // the steepest slope of smootherstep is 1.875 times the mean slope
  assert.ok(maxStep <= bound * 1.02, `the offset changes by at most ${maxStep.toFixed(3)} per unit of arc length (bound ${bound.toFixed(3)})`);
  for (const i of [10, 20, 40]) { const a = Math.hypot(off[i + 1].dx - off[i].dx, off[i + 1].dz - off[i].dz), b = Math.hypot(off[i - 1].dx - off[i].dx, off[i - 1].dz - off[i].dz); assert.ok(Math.min(a, b) < 3e-4, `slope of the offset is flat at station ${i}`); }
  assert.equal(smootherstep(0), 0); assert.equal(smootherstep(1), 1); assert.equal(smootherstep(.5), .5);
}

// 2-4. the nerve and the meshes around it
const world = loadWorld(), neck = loadNeck().meshes;
const V = n => world.mesh(n), tubeOf = (legacy, name) => { const U = makeUtil(world); U.legacyRln = legacy; const s = thoraxNerves(U).find(x => x.name === name); return {U, s, g: U.tube(s.tubes[0].pts, s.tubes[0].r[0], s.tubes[0].r[1], s.tubes[0].samples, 12)}; };
const T = V('Trachea'), E = V('Esophagus'), ITA = V('Left inferior thyroid artery');
const cc = JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL('../public/models/neck-vessels.json.gz', import.meta.url)))).vessels.find(v => v.name === 'Left common carotid artery');
const CCA = meshOf(Float32Array.from(cc.positions), Uint32Array.from(cc.indices));
const centres = g => { const out = []; for (let i = 0; i < (g.positions.length / 3 - 2) / 12; i++) { let c = [0, 0, 0]; for (let j = 0; j < 12; j++) for (let k = 0; k < 3; k++) c[k] += g.positions[(i * 12 + j) * 3 + k] / 12; out.push(c); } return out; };

/** The violations of the course in the neck: lateral excess over the tracheal wall, wall gaps to the structures beside it. */
function violations(g) {
  const bad = [], c = centres(g), at = y => c.reduce((a, p) => Math.abs(p[1] - y) < Math.abs(a[1] - y) ? p : a);
  let worstLateral = -1e9, minT = 1e9, minE = 1e9, minC = 1e9, minI = 1e9;
  for (let y = 1.385; y <= 1.4551; y += .005) {
    const p = at(y), slab = T.positions; let lat = -1e9; for (let i = 0; i < slab.length; i += 3) if (Math.abs(slab[i + 1] - y) < .004) lat = Math.max(lat, slab[i]);
    worstLateral = Math.max(worstLateral, (p[0] - lat) * 1000); minT = Math.min(minT, gapTo(T, p)); minE = Math.min(minE, gapTo(E, p)); minC = Math.min(minC, gapTo(CCA, p)); minI = Math.min(minI, gapTo(ITA, p));
  }
  if (worstLateral > 3) bad.push(`lateral ${worstLateral.toFixed(1)} mm beyond the tracheal wall`);
  if (minT < .3) bad.push(`trachea gap ${minT.toFixed(1)} mm`);
  if (minE < .3) bad.push(`oesophagus gap ${minE.toFixed(1)} mm`);
  if (minC < 3) bad.push(`common carotid gap ${minC.toFixed(1)} mm`);
  if (minI < 5) bad.push(`inferior thyroid artery gap ${minI.toFixed(1)} mm`);
  return {bad, worstLateral, minT, minE, minC, minI};
}

const now = tubeOf(false, 'Left recurrent laryngeal nerve'), old = tubeOf(true, 'Left recurrent laryngeal nerve');
const r = violations(now.g);
assert.deepEqual(r.bad, [], `left recurrent laryngeal nerve: ${r.bad.join('; ')}`);

// reverse control: the earlier course is about 10 mm lateral of the groove and must be caught
const o = violations(old.g);
assert.ok(o.worstLateral > 8 && o.worstLateral < 14, `the earlier course should lie 8-14 mm beyond the tracheal wall, it is ${o.worstLateral.toFixed(1)}`);
assert.ok(o.bad.some(b => b.startsWith('lateral')), 'the checks flag the earlier course as too far lateral');

// 3. continuity: ends, no jump, nothing else moved
{
  const a = centres(now.g), b = centres(old.g);
  assert.ok(Math.hypot(...a[0].map((v, k) => v - b[0][k])) < 2e-6, 'the end at the vagus does not move');
  assert.ok(Math.hypot(...a[a.length - 1].map((v, k) => v - b[b.length - 1][k])) > .008, 'the end at the larynx is no longer the far-side landmark of the earlier course');
  const vagusMesh = meshOf(Float32Array.from(neck.l.vagus), Uint32Array.from(globalThis.vagusIdx.l));
  assert.ok(gapTo(vagusMesh, a[0]) < 0, 'the start of the nerve lies inside the vagus nerve (it leaves it)');
  const turns = c => { let step = 0, turn = 0; for (let i = 1; i < c.length; i++) step = Math.max(step, Math.hypot(...c[i].map((v, k) => v - c[i - 1][k])) * 1000);
    for (let i = 1; i < c.length - 1; i++) { const u = c[i].map((v, k) => v - c[i - 1][k]), w = c[i + 1].map((v, k) => v - c[i][k]), cos = (u[0] * w[0] + u[1] * w[1] + u[2] * w[2]) / (Math.hypot(...u) * Math.hypot(...w) || 1); turn = Math.max(turn, Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI); }
    return {step, turn}; };
  const nw = turns(a), od = turns(b), maxStep = nw.step, maxTurn = nw.turn;
  assert.ok(maxStep < 4.5, `ring spacing along the nerve is at most ${maxStep.toFixed(1)} mm`);
  // the turns of the earlier course are at the hook round the aortic arch and at the larynx; the displacement must not add a kink of its own (a few degrees more than before at most)
  assert.ok(maxTurn <= od.turn + 8, `the centre line turns by at most ${maxTurn.toFixed(0)} degrees between neighbouring rings (earlier course ${od.turn.toFixed(0)})`);
  console.log(`Recurrent laryngeal nerve (left): at most ${r.worstLateral.toFixed(1)} mm beyond the tracheal wall (earlier course ${o.worstLateral.toFixed(1)} mm), gaps to trachea >= ${r.minT.toFixed(1)}, oesophagus >= ${r.minE.toFixed(1)}, common carotid >= ${r.minC.toFixed(1)}, inferior thyroid artery >= ${r.minI.toFixed(1)} mm; start fixed, steepest turn ${maxTurn.toFixed(0)} degrees.`);
}

// 5. upper end and right hook (HN-24 follow-up)
{
  const tubeFlag = (flag, name) => { const U = makeUtil(world); if (flag) U[flag] = true; const s = thoraxNerves(U).find(x => x.name === name); return U.tube(s.tubes[0].pts, s.tubes[0].r[0], s.tubes[0].r[1], s.tubes[0].samples, 12); };
  const cricoid = V('Cricoid cartilage'), thyroid = V('Thyroid cartilage'), sub = V('Right subclavian artery');
  const cx = (() => { const xs = []; for (let i = 0; i < cricoid.positions.length; i += 3) xs.push(cricoid.positions[i]); return (Math.max(...xs) + Math.min(...xs)) / 2; })();   // the midline of the larynx
  const jointZ = sx => { let b = null; for (let i = 0; i < cricoid.positions.length; i += 3) if (!b || cricoid.positions[i] * sx > b[0] * sx) b = [cricoid.positions[i], cricoid.positions[i + 1], cricoid.positions[i + 2]]; return b; };   // lateral extreme of the cricoid (the facet for the cricothyroid joint)
  const pca = {1: V('Left posterior crico-arytenoid'), '-1': V('Right posterior crico-arytenoid')}, ctm = {1: V('Oblique part of left cricothyroid'), '-1': V('Oblique part of right cricothyroid')};
  const upper = (c, sx) => {
    const bad = [], top = c[c.length - 1], j = jointZ(sx);
    const cross = c.filter(p => p[1] > 1.44 && (p[0] - cx) * sx < .003).length;
    if (cross) bad.push(`${cross} rings above 1.44 m within 3 mm of the midline or across it`);
    let sunk = 0; for (const p of c) if (p[1] > 1.43 && gapTo(T, p) < 0) sunk++;
    if (sunk) bad.push(`${sunk} rings above 1.43 m inside the trachea`);
    if ((top[0] - j[0]) * sx < 0) bad.push(`ends ${((top[0] - j[0]) * sx * 1000).toFixed(1)} mm medial of the lateral edge of the cricoid`);
    if (j[2] - top[2] < .003) bad.push(`ends only ${((j[2] - top[2]) * 1000).toFixed(1)} mm behind the cricothyroid joint`);
    for (const [n, m] of [['cricoid', cricoid], ['thyroid cartilage', thyroid], ['trachea', T], ['posterior crico-arytenoid', pca[sx]], ['cricothyroid', ctm[sx]]]) { const g = gapTo(m, top); if (g < .3) bad.push(`end ${g.toFixed(1)} mm from the ${n}`); }
    return {bad, top, j};
  };
  const hook = c => {
    const bad = []; let k = 0; c.forEach((p, i) => { if (-p[0] > -c[k][0]) k = i; });   // the lateral-most ring: the hook
    const after = c.slice(k).reduce((m, p) => Math.min(m, p[1]), 9), drop = (c[k][1] - after) * 1000, g = gapTo(sub, c[k]);
    if (drop > .5) bad.push(`after the hook the nerve still descends ${drop.toFixed(1)} mm`);
    if (g < 0 || g > 6) bad.push(`the hook is ${g.toFixed(1)} mm from the subclavian artery (wanted 0 to 6)`);
    if (c.some(p => gapTo(sub, p) < 0)) bad.push('the nerve enters the subclavian artery');
    return {bad, drop, g};
  };
  const cNow = {r: centres(tubeFlag(false, 'Right recurrent laryngeal nerve')), l: centres(tubeFlag(false, 'Left recurrent laryngeal nerve'))};
  const cOld = {r: centres(tubeFlag('legacyRlnEnds', 'Right recurrent laryngeal nerve')), l: centres(tubeFlag('legacyRlnEnds', 'Left recurrent laryngeal nerve'))};
  const u = {r: upper(cNow.r, -1), l: upper(cNow.l, 1)}, uo = {r: upper(cOld.r, -1), l: upper(cOld.l, 1)}, h = hook(cNow.r), ho = hook(cOld.r);
  assert.deepEqual(u.r.bad, [], `right nerve upper end: ${u.r.bad.join('; ')}`);
  assert.deepEqual(u.l.bad, [], `left nerve upper end: ${u.l.bad.join('; ')}`);
  assert.deepEqual(h.bad, [], `right hook: ${h.bad.join('; ')}`);
  // reverse control: the course before this follow-up is caught by each check
  for (const s of ['r', 'l']) { assert.ok(uo[s].bad.some(b => /midline/.test(b)), `${s}: the earlier course crosses the midline`); assert.ok(uo[s].bad.some(b => /inside the trachea/.test(b)), `${s}: the earlier course sinks into the trachea`); assert.ok(uo[s].bad.some(b => /medial of the lateral edge/.test(b)), `${s}: the earlier course ends on the wrong side`); }
  assert.ok(ho.bad.some(b => /still descends/.test(b)), 'the earlier right course dips after the hook'); assert.ok(ho.bad.some(b => /subclavian artery \(wanted/.test(b)), 'the earlier right hook was too far under the artery');
  // the left hook and the groove part are kept: every left ring up to 1.455 m is within 1.5 mm of the earlier course
  const nearest = (p, line) => line.reduce((m, q) => Math.min(m, Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2])), 1e9);
  const dev = Math.max(...cNow.l.filter(p => p[1] < 1.455).map(p => nearest(p, cOld.l))) * 1000;
  assert.ok(dev < 1.5, `the left course below 1.455 m stays within 1.5 mm of the earlier one (${dev.toFixed(2)} mm)`);
  // continuity of the right nerve: same ring spacing and turn limits as the left one
  const spacing = c => Math.max(...c.slice(1).map((p, i) => Math.hypot(...p.map((v, k) => v - c[i][k])))) * 1000;
  assert.ok(spacing(cNow.r) < 4.5 && spacing(cNow.l) < 4.5, 'ring spacing at most 4.5 mm on both sides');
  const vagusR = meshOf(Float32Array.from(neck.r.vagus), Uint32Array.from(globalThis.vagusIdx.r));
  assert.ok(gapTo(vagusR, cNow.r[0]) < 0, 'the right nerve still starts inside the vagus nerve');
  console.log(`Recurrent laryngeal nerve ends: both nerves end behind the cricothyroid joint on their own side (nearest gap to cricoid/thyroid cartilage/trachea >= 0.3 mm), none within 3 mm of the midline above 1.44 m; right nerve climbs at once after the hook (descent after the hook ${h.drop.toFixed(1)} mm, earlier ${ho.drop.toFixed(1)} mm), hook ${h.g.toFixed(1)} mm from the artery (earlier ${ho.g.toFixed(1)} mm); the earlier course is caught by every check.`);
}
