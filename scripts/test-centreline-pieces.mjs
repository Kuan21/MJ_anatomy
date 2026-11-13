// Per-piece centrelines and the radius of wide tubes must stay right (synthetic tubes, no model data needed).
import assert from 'node:assert/strict';
import {centrelineOf} from './lib/leg-centreline.mjs';
import {splitPieces, centrelineWide, centrelinesOf} from './lib/centreline-pieces.mjs';
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
// A whole mesh is one piece and gives one line.
assert.equal(centrelinesOf(tube(.004)).length, 1);
console.log('centreline pieces: ok');
