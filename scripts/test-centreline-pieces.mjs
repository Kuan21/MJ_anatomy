// Per-piece centrelines and the radius of wide tubes must stay right (synthetic tubes, no model data needed).
import assert from 'node:assert/strict';
import {centrelineOf} from './lib/leg-centreline.mjs';
import {splitPieces, centrelineWide, centrelinesOf, robustRings} from './lib/centreline-pieces.mjs';
import {joinGap} from './lib/centreline-continuity.mjs';
import {pieceCount} from './lib/centreline-classify.mjs';

// Open vertical tube of radius R from y = top downwards, around the axis x = x0, z = 0.
function tube(R, {top = 0, length = .12, x0 = 0, seg = 24, step = .003} = {}) {
  const p = [], ix = [], n = Math.round(length / step);
  for (let j = 0; j <= n; j++) for (let s = 0; s < seg; s++) p.push(x0 + R * Math.cos(s / seg * 2 * Math.PI), top - j * step, R * Math.sin(s / seg * 2 * Math.PI));
  for (let j = 0; j < n; j++) for (let s = 0; s < seg; s++) { const a = j * seg + s, b = j * seg + (s + 1) % seg, c = a + seg, d = b + seg; ix.push(a, b, c, b, d, c); }
  return {positions: Float32Array.from(p), indices: Uint32Array.from(ix)};
}
const join = (...gs) => {
  const positions = [], indices = []; let base = 0;
  for (const g of gs) { positions.push(...g.positions); indices.push(...Array.from(g.indices, i => i + base)); base += g.positions.length / 3; }
  return {positions: Float32Array.from(positions), indices: Uint32Array.from(indices)};
};
const median = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
const radius = rings => median(rings.map(r => r.r)), offAxis = (rings, x0 = 0) => median(rings.map(r => Math.hypot(r.c[0] - x0, r.c[2])));

// The cause of the small radii of wide vessels: with the default reach a ring holds a strip of the wall only.
const strip = centrelineOf(tube(.012));
assert.ok(radius(strip) < .005, `default reach on a 12 mm tube measures a strip (${(radius(strip) * 1000).toFixed(1)} mm)`);
assert.ok(offAxis(strip) > .008, 'and its centre sits near the wall');
// centrelineWide: right radius and centre for thin and wide tubes.
for (const R of [.002, .004, .008, .012, .016]) {
  const info = {}, rings = centrelineWide(tube(R, {length: .3}), .003, info);
  assert.ok(Math.abs(radius(rings) - R) < R * .05, `radius of a ${R * 1000} mm tube, got ${(radius(rings) * 1000).toFixed(2)} mm`);
  assert.ok(offAxis(rings) < R * .1, `centre of a ${R * 1000} mm tube is on the axis`);
  assert.equal(info.steps.length, rings.length - 1);
  assert.ok(info.reach >= .016, 'at least one wider pass was compared');
}
// Known limit: a stubby tube (shorter than about 8 times its radius) is still measured too thin, because the chain runs diagonally across it.
assert.ok(radius(centrelineWide(tube(.016, {length: .12}))) < .016 * .95, 'stubby tube: still short of the real radius (update this test when that is solved)');
assert.equal(centrelineWide(tube(.002), .003, {}).length, centrelineOf(tube(.002)).length, 'thin tubes are unchanged');

// Pieces: two tubes end to end with a 10 mm gap, plus a stray triangle.
const upper = tube(.004, {length: .075}), lower = tube(.003, {top: -.085, length: .06}), stray = {positions: Float32Array.from([.2, 0, 0, .201, 0, 0, .2, .001, 0]), indices: Uint32Array.from([0, 1, 2])};
const mesh = join(lower, stray, upper);
const parts = splitPieces(mesh);
assert.equal(parts.length, 3); assert.equal(parts.length, pieceCount(mesh));
assert.deepEqual(parts.map(p => p.indices.length / 3), [upper.indices.length / 3, lower.indices.length / 3, 1], 'largest first, every triangle kept');
const skipped = [], lines = centrelinesOf(mesh, .003, skipped);
assert.equal(lines.length, 2, 'one centreline per tube');
assert.equal(skipped.length, 1); assert.equal(skipped[0].triangles, 1);
assert.ok(Math.abs(radius(lines[0].rings) - .004) < .0003 && Math.abs(radius(lines[1].rings) - .003) < .0003);
const gap = joinGap(lines[0].rings, lines[1].rings);
assert.ok(gap > .004 && gap < .012, `the 10 mm gap between the two pieces is measured (less the radius), got ${(gap * 1000).toFixed(1)} mm`);
// The same two tubes touching: no gap.
const touching = centrelinesOf(join(tube(.004, {length: .06}), tube(.004, {top: -.0601, length: .06})));
assert.equal(touching.length, 2); assert.equal(joinGap(touching[0].rings, touching[1].rings), 0);
// A side branch (radius r, 60 mm long, joined to the wall at y = -150 mm) widens the rings next to it and pulls their centres into the branch; robustRings undoes that.
function withBranch(R, r, phi) {
  const m = tube(R, {length: .3}), p = Array.from(m.positions), ix = Array.from(m.indices), base = p.length / 3, seg = 16, n = 20, dx = Math.cos(phi), dz = Math.sin(phi);
  for (let j = 0; j <= n; j++) for (let s = 0; s < seg; s++) { const a = s / seg * 2 * Math.PI, d = R + j * .003, u = r * Math.cos(a), v = r * Math.sin(a); p.push(dx * d - dz * u, -.15 + v, dz * d + dx * u); }
  for (let j = 0; j < n; j++) for (let s = 0; s < seg; s++) { const a = base + j * seg + s, b = base + j * seg + (s + 1) % seg, c = a + seg, d = b + seg; ix.push(a, b, c, b, d, c); }
  for (let s = 0; s < seg; s++) { // join the first ring of the branch to the nearest wall vertices
    const a = base + s; let best = 0, bd = Infinity;
    for (let i = 0; i < base; i++) { const d = Math.hypot(p[i * 3] - p[a * 3], p[i * 3 + 1] - p[a * 3 + 1], p[i * 3 + 2] - p[a * 3 + 2]); if (d < bd) { bd = d; best = i; } }
    ix.push(a, base + (s + 1) % seg, best);
  }
  return {positions: Float32Array.from(p), indices: Uint32Array.from(ix)};
}
const nearBranch = rings => rings.filter(q => Math.abs(q.c[1] + .15) < .02), widest = rings => Math.max(...rings.map(q => q.r)), farthest = rings => Math.max(...rings.map(q => Math.hypot(q.c[0], q.c[2])));
for (const [R, r] of [[.003, .002], [.004, .004], [.005, .003]]) for (const phi of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
  const g = withBranch(R, r, phi), raw = centrelineWide(g), fix = {}, rings = robustRings(raw, 4, .3, fix);
  assert.ok(widest(nearBranch(raw)) > R * 1.4, `uncorrected: a ${r * 1000} mm branch widens the rings of a ${R * 1000} mm tube`);
  assert.ok(Math.abs(widest(rings) - R) < R * .05, `corrected radius of a ${R * 1000} mm tube with a ${r * 1000} mm branch, got ${(widest(rings) * 1000).toFixed(1)} mm`);
  assert.ok(farthest(nearBranch(rings)) < R * .75 && farthest(nearBranch(rings)) < farthest(nearBranch(raw)), 'corrected centres stay inside the tube');
  assert.ok(fix.disturbed.length >= 1 && fix.disturbed.length <= 6, 'only the rings at the branch are touched');
  assert.equal(rings.length, raw.length);
  assert.equal(centrelinesOf(g)[0].disturbed, fix.disturbed.length, 'centrelinesOf returns corrected rings');
}
// Known limit: on a wide tube with a wide branch the radius is corrected but a centre can stay pulled towards the branch.
{ const raw = centrelineWide(withBranch(.008, .004, Math.PI)), rings = robustRings(raw);
  assert.ok(Math.abs(widest(nearBranch(rings)) - .008) < .0005 && widest(nearBranch(raw)) > .012, 'wide tube: radius corrected');
  assert.ok(farthest(nearBranch(rings)) > .008, 'wide tube: a centre is still off the axis (update this test when that is solved)'); }
// A plain tube and a bent line are left alone: no ring is disturbed, centres are identical.
{ const raw = centrelineWide(tube(.004)), fix = {}, rings = robustRings(raw, 4, .3, fix);
  assert.equal(fix.disturbed.length, 0); assert.deepEqual(rings.map(q => q.c), raw.map(q => q.c));
  const bent = Array.from({length: 40}, (_, i) => ({c: [i < 20 ? 0 : (i - 20) * .003, -Math.min(i, 20) * .003, 0], r: .002 + i * .00001})), kept = robustRings(bent);
  assert.deepEqual(kept.map(q => q.c), bent.map(q => q.c), 'a right-angle bend with a slowly changing radius keeps its centres'); }
// A whole mesh is one piece and gives one line.
assert.equal(centrelinesOf(tube(.004)).length, 1);
console.log('centreline pieces: ok');
