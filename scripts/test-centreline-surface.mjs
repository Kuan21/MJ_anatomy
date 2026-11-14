// Surface to surface distance between meshes must stay right (synthetic shapes, no model data needed).
import assert from 'node:assert/strict';
import {pointTriangle, surfaceGap} from './lib/centreline-surface.mjs';

const near = (got, want, what, tol = 1e-9) => assert.ok(Math.abs(got - want) < tol, `${what}: got ${got}, expected ${want}`);
// Point against one triangle: over the face, beside an edge, beyond a corner, in the plane, and a degenerate triangle.
const A = [0, 0, 0], B = [1, 0, 0], C = [0, 1, 0];
near(pointTriangle([.2, .2, .5], A, B, C), .5, 'above the face');
near(pointTriangle([.2, .2, 0], A, B, C), 0, 'on the face');
near(pointTriangle([.5, -.3, 0], A, B, C), .3, 'beside edge AB');
near(pointTriangle([-.3, .5, .4], A, B, C), .5, 'beside edge AC');
near(pointTriangle([1, 1, 0], A, B, C), Math.SQRT1_2, 'beside edge BC');
near(pointTriangle([-3, -4, 0], A, B, C), 5, 'beyond corner A');
near(pointTriangle([2, 0, 0], A, B, C), 1, 'beyond corner B');
near(pointTriangle([0, 3, 0], A, B, C), 2, 'beyond corner C');
near(pointTriangle([.5, 2, 0], A, B, B), 2, 'degenerate triangle (a segment)');
near(pointTriangle([3, 4, 0], A, A, A), 5, 'degenerate triangle (a point)');

// Open vertical tube of radius R from y = top downwards, around the axis x = x0, z = 0.
function tube(R, {top = 0, length = .06, x0 = 0, seg = 24, step = .003} = {}) {
  const p = [], ix = [], n = Math.round(length / step);
  for (let j = 0; j <= n; j++) for (let s = 0; s < seg; s++) p.push(x0 + R * Math.cos(s / seg * 2 * Math.PI), top - j * step, R * Math.sin(s / seg * 2 * Math.PI));
  for (let j = 0; j < n; j++) for (let s = 0; s < seg; s++) { const a = j * seg + s, b = j * seg + (s + 1) % seg, c = a + seg, d = b + seg; ix.push(a, b, c, b, d, c); }
  return {positions: Float32Array.from(p), indices: Uint32Array.from(ix)};
}
// Two parallel tubes: the gap is the distance between the axes less both radii, whichever is given first.
const a = tube(.004), b = tube(.003, {x0: .02});
near(surfaceGap(a, b), .013, 'parallel tubes', 1e-6);
near(surfaceGap(b, a), .013, 'parallel tubes, other order', 1e-6);
// End to end with a 10 mm gap, and touching.
near(surfaceGap(a, tube(.004, {top: -.07})), .01, 'end to end, 10 mm apart', 1e-6);
near(surfaceGap(a, tube(.004, {top: -.06})), 0, 'end to end, touching', 1e-6);
// A thin tube that ends inside a wide one counts as touching only at the wall: fully inside, the gap is the clearance to the wall.
near(surfaceGap(tube(.012), tube(.002)), .01, 'thin tube inside a wide one', 2e-4);
// A coarse mesh: one long triangle against a fine tube whose nearest spot is the middle of the triangle, far from its corners.
const sheet = {positions: Float32Array.from([.02, .5, -.5, .02, .5, .5, .02, -1, 0]), indices: Uint32Array.from([0, 1, 2])};
near(surfaceGap(a, sheet), .016, 'fine tube against one long triangle', 1e-6);
near(surfaceGap(sheet, a), .016, 'the same, other order', 1e-6);
assert.equal(surfaceGap(a, {positions: new Float32Array(0), indices: new Uint32Array(0)}), null, 'empty mesh');
console.log('centreline surface: ok');
