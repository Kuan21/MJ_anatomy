// The per-relation measurement of report-centreline-attach must stay right (synthetic tubes, no model data needed).
import assert from 'node:assert/strict';
import {relationGaps, linesOfMeshes} from './lib/centreline-attach.mjs';

// Open tube of radius R, `length` long from `from` along the unit direction `dir`.
function tube(R, {from = [0, 0, 0], dir = [0, -1, 0], length = .12, seg = 24, step = .003} = {}) {
  const p = [], ix = [], n = Math.round(length / step);
  const u = Math.abs(dir[1]) > .9 ? [1, 0, 0] : [0, 1, 0], v = [dir[1] * u[2] - dir[2] * u[1], dir[2] * u[0] - dir[0] * u[2], dir[0] * u[1] - dir[1] * u[0]];
  for (let j = 0; j <= n; j++) for (let s = 0; s < seg; s++) { const a = s / seg * 2 * Math.PI, c = Math.cos(a) * R, d = Math.sin(a) * R; p.push(...[0, 1, 2].map(k => from[k] + dir[k] * j * step + u[k] * c + v[k] * d)); }
  for (let j = 0; j < n; j++) for (let s = 0; s < seg; s++) { const a = j * seg + s, b = j * seg + (s + 1) % seg, c = a + seg, d = b + seg; ix.push(a, b, c, b, d, c); }
  return {positions: Float32Array.from(p), indices: Uint32Array.from(ix)};
}
const mm = v => v === null ? 'null' : (v * 1000).toFixed(2) + ' mm';
const within = (got, want, tol, what) => assert.ok(got !== null && Math.abs(got - want) <= tol, `${what}: got ${mm(got)}, expected ${mm(want)} ± ${mm(tol)}`);

// A parent trunk down the y axis (radius 5 mm, 0.3 m) and a side branch (radius 2 mm) that leaves it at y = -0.15 along +x, starting `gap` away from the wall.
const trunk = tube(.005, {length: .3}), branch = gap => tube(.002, {from: [.005 + gap, -.15, 0], dir: [1, 0, 0], length: .06});
for (const gap of [0, .004, .02]) {
  const g = relationGaps([branch(gap)], [trunk]);
  assert.equal(g.noLine, null); assert.equal(g.childLines, 1); assert.equal(g.parentLines, 1);
  within(g.attach, gap, .0015, `branch ${gap * 1000} mm off the wall, child end to parent wall`);
  within(g.surface, gap, .0005, `branch ${gap * 1000} mm off the wall, surface`);
  assert.ok(g.either <= g.attach + 1e-12, 'either way is never more than the stated direction');
}
// A continuation (child carries on from the end of the parent, same axis): a 10 mm gap end to end.
const next = relationGaps([tube(.004, {from: [0, -.31, 0], length: .12})], [trunk]);
within(next.attach, .01, .0035, 'continuation 10 mm below the parent end'); within(next.surface, .01, .0005, 'continuation, surface');
// The direction matters: a trunk whose END is far from the branch, but the branch's end lies on the trunk. Stated the wrong way round (trunk as child) attach is large, either stays small.
const swapped = relationGaps([trunk], [branch(0)]);
assert.ok(swapped.attach > .1, `trunk as child of its branch: its ends are far (${mm(swapped.attach)})`);
within(swapped.either, 0, .0015, 'either way still finds the junction'); within(swapped.surface, 0, .0005, 'and so does the surface');
// Several meshes for one name (for example left and right found together): the smallest gap over all pairs counts.
const far = tube(.005, {from: [.5, 0, 0], length: .3}), both = relationGaps([branch(.004)], [far, trunk]);
assert.equal(both.parentLines, 2); within(both.attach, .004, .0015, 'two parent meshes, the near one counts'); within(both.surface, .004, .0005, 'two parent meshes, surface');
// A mesh that gives no centreline (one stray triangle): reported as such, surface still measured.
const stray = {positions: Float32Array.from([.02, -.15, 0, .021, -.15, 0, .02, -.149, 0]), indices: Uint32Array.from([0, 1, 2])};
assert.equal(linesOfMeshes([stray]).length, 0);
const none = relationGaps([stray], [trunk]);
assert.equal(none.noLine, 'child'); assert.equal(none.attach, null); assert.equal(none.either, null); within(none.surface, .015, .0005, 'stray triangle, surface');
assert.equal(relationGaps([trunk], [stray]).noLine, 'parent');
console.log('centreline attach: ok');
