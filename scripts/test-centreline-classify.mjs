// The failure classes of the centreline report must stay stable (synthetic rings, no model data needed).
import assert from 'node:assert/strict';
import {classifyRings, sparseStep, longestStep, pieceCount} from './lib/centreline-classify.mjs';
const line = (n, step) => Array.from({length: n}, (_, i) => ({c: [0, -i * step, 0], r: .002}));
assert.equal(classifyRings([]), 'fewer than 2 rings');
assert.equal(classifyRings(line(1, .003)), 'fewer than 2 rings');
assert.equal(classifyRings(line(30, .003)), null);
assert.equal(classifyRings(line(2, .001)), 'length only 1.0 mm');
const gap = line(10, .003); gap.forEach((p, i) => { if (i >= 5) p.c[1] -= .05; });
assert.match(classifyRings(gap), /^jump of \d+ mm between rings$/);
assert.equal(classifyRings(line(8, .019)), null, 'steps below the limit are allowed');
// A coarse mesh: the surface chain itself steps 50 mm between two rings (no vertices in between), so the large step is not a break.
const steps = gap.slice(1).map((_, i) => i === 4 ? .051 : .003);
assert.equal(longestStep(gap).i, 4);
assert.equal(classifyRings(gap, steps), null, 'a step explained by the surface chain is not a jump');
assert.ok(Math.abs(sparseStep(gap, steps) - .053) < 1e-9);
assert.match(classifyRings(gap, steps.map(() => .003)), /^jump of/, 'a step the chain does not explain stays a jump');
assert.equal(sparseStep(line(30, .003), line(29, .003).map(() => .003)), 0);
assert.equal(sparseStep(gap, null), 0);
// Separate pieces: two triangles sharing an edge are one piece (also when the shared vertices are stored twice); a third one far away is a second piece.
const tri = (x) => [x, 0, 0, x + .01, 0, 0, x, .01, 0];
assert.equal(pieceCount({positions: Float32Array.from([...tri(0), .01, .01, 0]), indices: Uint32Array.from([0, 1, 2, 1, 3, 2])}), 1);
assert.equal(pieceCount({positions: Float32Array.from([...tri(0), .01, 0, 0, .01, .01, 0, 0, .01, 0]), indices: Uint32Array.from([0, 1, 2, 3, 4, 5])}), 1, 'welded');
assert.equal(pieceCount({positions: Float32Array.from([...tri(0), ...tri(.5)]), indices: Uint32Array.from([0, 1, 2, 3, 4, 5])}), 2);
console.log('centreline classify: ok');
