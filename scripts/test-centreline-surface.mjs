// Surface to surface distance between meshes must stay right (synthetic shapes, no model data needed).
import assert from 'node:assert/strict';
import {pointTriangle, surfaceGap, surfaceLinkGap} from './lib/centreline-surface.mjs';

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
// A bound caps the answer and never changes a smaller one.
near(surfaceGap(a, b, .005), .005, 'bounded below the real gap', 1e-9);
near(surfaceGap(a, b, .05), .013, 'bounded above the real gap', 1e-6);

// surfaceLinkGap: pieces that touch into one whole, in whatever order.
const lower = tube(.004, {top: -.06}), beside = tube(.003, {x0: .007, top: -.02, length: .02});
near(surfaceLinkGap([a, lower, beside]), 0, 'trunk, continuation and a piece on its wall', 1e-6);
near(surfaceLinkGap([beside, lower, a]), 0, 'the same, other order', 1e-6);
assert.equal(surfaceLinkGap([a]), null, 'one piece');
// Two tight clusters far apart: every piece touches a neighbour, but the structure is in two parts 30 mm apart.
const farA = tube(.004, {x0: .038}), farB = tube(.004, {x0: .038, top: -.06});
near(surfaceLinkGap([a, lower, farA, farB]), .03, 'two clusters', 1e-6);
near(surfaceLinkGap([farB, a, farA, lower]), .03, 'two clusters, other order', 1e-6);
// Separate parallel vessels of a set: the link is their spacing less both radii.
near(surfaceLinkGap([0, .03, .06].map(x0 => tube(.002, {x0}))), .026, 'spacing of a set', 1e-6);
// A stray sliver far away sets the result unless small pieces are left out.
const sliver = {positions: Float32Array.from([.2, 0, 0, .201, 0, 0, .2, .001, 0]), indices: Uint32Array.from([0, 1, 2])};
assert.ok(surfaceLinkGap([a, lower, sliver]) > .19, 'a sliver counts by default');
near(surfaceLinkGap([a, lower, sliver], 4), 0, 'slivers left out', 1e-6);
assert.equal(surfaceLinkGap([a, sliver], 4), null, 'one piece left after leaving out slivers');
console.log('centreline surface: ok');
