// The failure classes of the centreline report must stay stable (synthetic rings, no model data needed).
import assert from 'node:assert/strict';
import {classifyRings} from './lib/centreline-classify.mjs';
const line = (n, step) => Array.from({length: n}, (_, i) => ({c: [0, -i * step, 0], r: .002}));
assert.equal(classifyRings([]), 'fewer than 2 rings');
assert.equal(classifyRings(line(1, .003)), 'fewer than 2 rings');
assert.equal(classifyRings(line(30, .003)), null);
assert.equal(classifyRings(line(2, .001)), 'length only 1.0 mm');
const gap = line(10, .003); gap.forEach((p, i) => { if (i >= 5) p.c[1] -= .05; });
assert.match(classifyRings(gap), /^jump of \d+ mm between rings$/);
assert.equal(classifyRings(line(8, .019)), null, 'steps below the limit are allowed');
console.log('centreline classify: ok');
