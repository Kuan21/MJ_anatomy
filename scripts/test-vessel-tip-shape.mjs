// Smooth vessel ends shaped in the vessels' own meshes (scripts/lib/vessel-tip-shape.mjs, scripts/lib/vessel-tip-plan.mjs, scripts/prepare-model-stream.mjs).
//   1. the shaping on a synthetic tube: nothing is added or re-connected, no vertex ever moves past the old end, the radius narrows monotonically and smoothly to a point at the old end, vertices beyond the taper
//      length stay exactly where they were; a flare widens monotonically by at most 50 % and leaves the rest alone; the refreshed normals are unit length;
//   2. the build: the atlas stream records how many tips it shaped, and the end pieces no longer carry a cone for them (the old cones stay only for the arm, the shoulder cables and the vessels fitted to their source mesh).
import fs from 'node:fs';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import {shapeVesselTips, refreshNormals, taperLength, FLARE_WIDEN, TAPER_POWER} from './lib/vessel-tip-shape.mjs';

// ---- 1. synthetic tube along +z that ends (flat cap) at z = 0; the body lies at negative z
const ring = (z, r, sides) => Array.from({length: sides}, (_, j) => [Math.cos(j / sides * Math.PI * 2) * r, Math.sin(j / sides * Math.PI * 2) * r, z]);
function tube(r, length, step, sides = 12) {
  const rings = []; for (let z = -length; z <= 1e-12; z += step) rings.push(ring(Math.min(z, 0), r, sides));
  const pos = [], idx = []; for (const rg of rings) for (const p of rg) pos.push(...p);
  for (let i = 0; i < rings.length - 1; i++) for (let j = 0; j < sides; j++) { const a = i * sides + j, b = i * sides + (j + 1) % sides, c = (i + 1) * sides + j, d = (i + 1) * sides + (j + 1) % sides; idx.push(a, c, b, b, c, d); }
  const centre = pos.length / 3; pos.push(0, 0, 0); const last = (rings.length - 1) * sides; for (let j = 0; j < sides; j++) idx.push(centre, last + (j + 1) % sides, last + j);
  return {positions: Float32Array.from(pos), indices: Uint32Array.from(idx), sides, rings: rings.length};
}
const radiusAt = (positions, i) => Math.hypot(positions[i * 3], positions[i * 3 + 1]);
for (const r of [.0003, .0008, .0017]) {
  const L = taperLength(r), g = tube(r, .02, .0004), before = Float32Array.from(g.positions);
  const moved = shapeVesselTips(g.positions, [{center: [0, 0, 0], dir: [0, 0, 1], radius: r, length: L}]);
  assert.ok(moved.size > 0, 'taper: vertices moved');
  assert.equal(g.positions.length, before.length, 'taper: no vertex added or removed');
  let prev = 0, rings = new Map();
  for (let i = 0; i < before.length / 3; i++) {
    const z = before[i * 3 + 2], s = -z;
    assert.ok(g.positions[i * 3 + 2] <= 1e-9, 'taper: nothing moves past the old end');
    assert.equal(g.positions[i * 3 + 2], before[i * 3 + 2], 'taper: vertices only move across the tube, not along it');
    if (s > L + 1e-9) { assert.equal(radiusAt(g.positions, i), radiusAt(before, i), 'taper: vertices beyond the taper stay put'); continue; }
    if (i < g.rings * g.sides) { const f = Math.pow(Math.max(0, 1 - (1 - s / L) ** 2), TAPER_POWER); assert.ok(Math.abs(radiusAt(g.positions, i) - r * f) < 1e-9, `taper: radius at s=${(s * 1000).toFixed(2)} mm follows the profile`); rings.set(s, radiusAt(g.positions, i)); }
  }
  const prof = [...rings].sort((a, b) => a[0] - b[0]).map(x => x[1]);
  assert.ok(prof[0] < 1e-9, 'taper: the old end collapses to a point');
  for (let i = 1; i < prof.length; i++) assert.ok(prof[i] >= prof[i - 1] - 1e-12, 'taper: the radius never grows towards the body');
  const n16 = new Int16Array(g.positions.length); refreshNormals(g.positions, g.indices, moved, n16);
  for (const v of moved) { const l = Math.hypot(n16[v * 3], n16[v * 3 + 1], n16[v * 3 + 2]) / 32767; assert.ok(Math.abs(l - 1) < 1e-3, 'refreshed normals are unit length'); }
}
for (const [r, reach] of [[.0004, 0], [.0009, .0006], [.0016, .0003]]) {
  const g = tube(r, .02, .0004), before = Float32Array.from(g.positions), back = 4 * r;
  const moved = shapeVesselTips(g.positions, [], [{center: [0, 0, 0], dir: [0, 0, 1], radius: r, reach}]);
  assert.ok(moved.size > 0, 'flare: vertices moved');
  const rows = new Map();
  for (let i = 0; i < before.length / 3; i++) {
    const s = -before[i * 3 + 2], now = radiusAt(g.positions, i), was = radiusAt(before, i);
    assert.equal(g.positions[i * 3 + 2], before[i * 3 + 2], 'flare: no vertex moves along the tube');
    if (i >= g.rings * g.sides) continue;
    if (s + reach > back + 1e-9) assert.equal(now, was, 'flare: vertices beyond the flare stay put');
    assert.ok(now <= r * (1 + FLARE_WIDEN) + 1e-9 && now >= r - 1e-9, 'flare: widens by at most 50 %');
    rows.set(s, now);
  }
  const prof = [...rows].sort((a, b) => b[0] - a[0]).map(x => x[1]);   // from the body to the end
  for (let i = 1; i < prof.length; i++) assert.ok(prof[i] >= prof[i - 1] - 1e-12, 'flare: the radius never shrinks towards the trunk');
}

// the connectivity and wall-normal filters leave a plain tube untouched: same result with and without the triangle list
for (const r of [.0006, .0015]) {
  const L = taperLength(r), a = tube(r, .02, .0004), b = tube(r, .02, .0004), tip = {center: [0, 0, 0], dir: [0, 0, 1], radius: r, length: L};
  shapeVesselTips(a.positions, [tip]); const moved = shapeVesselTips(b.positions, [tip], [], b.indices);
  assert.deepEqual(Array.from(b.positions), Array.from(a.positions), 'filtered shaping equals the plain shaping on a tube');
  assert.equal(moved.applied.tapers, 1, 'the tip counts as applied');
}
// a tube that does not touch the selected region: nothing moves and the tip is reported as missed
{ const g = tube(.001, .02, .0004), tip = {center: [0, 0, .05], dir: [0, 0, 1], radius: .001, length: .004}, moved = shapeVesselTips(g.positions, [tip], [], g.indices);
  assert.equal(moved.size, 0); assert.equal(moved.applied.missed.length, 1, 'a tip with no wall near it is reported as missed'); }

// ---- 2. the build
const models = new URL('../public/models/', import.meta.url), stream = JSON.parse(fs.readFileSync(new URL('atlas-stream.json', models)));
const shaped = stream.shapedVesselTips, parts = stream.parts.filter(p => p.tipsShaped).length;
assert.ok(shaped && shaped.tapers >= 500 && shaped.flares >= 30 && shaped.notEnds >= 500, `tapers and flares shaped in the vessel meshes: ${JSON.stringify(shaped)}`);
assert.ok(parts >= 300, `${parts} vessel meshes carry shaped tips`);
const ends = JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL('vessel-ends/vessel-ends-stream.json.gz', models))));
const cones = ends.parts.filter(p => p.vertexCount >= 17).length;   // every end piece is bigger than one cone; this only guards the manifest against being empty
assert.ok(cones > 100, 'end pieces present');
const oldEndVerts = ends.parts.reduce((n, p) => n + p.vertexCount, 0);
assert.ok(oldEndVerts < 400000, `end pieces carry ${oldEndVerts} vertices (a cone for every candidate end would have added about 40 000 more)`);
console.log(`PASS vessel tip shape: taper and flare profiles on synthetic tubes are closed to the old end and smooth; ${shaped.tapers} tapers and ${shaped.flares} flares shaped in ${parts} vessel meshes.`);
