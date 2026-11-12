// The continuity measures between centrelines must stay stable (synthetic lines, no model data needed).
import assert from 'node:assert/strict';
import {toAxis, attachGap, joinGap} from './lib/centreline-continuity.mjs';
const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-9, `${msg ?? ''} got ${a}, expected ${b}`);
// A vertical trunk of radius 5 mm, 90 mm long, and branches leaving it sideways at mid height.
const trunk = Array.from({length: 31}, (_, i) => ({c: [0, -i * .003, 0], r: .005}));
const branch = (x0, n = 10, y = -.045) => Array.from({length: n}, (_, i) => ({c: [x0 + i * .003, y, 0], r: .001}));
near(toAxis([.02, -.045, 0], trunk).dist, .02, 'distance to the axis');
near(toAxis([0, .01, 0], trunk).dist, .01, 'beyond the end of the line the nearest point is the end');
near(attachGap(branch(.005), trunk).gap, 0, 'starts on the wall');
near(attachGap(branch(.002), trunk).gap, 0, 'starts inside the trunk');
near(attachGap(branch(.012), trunk).gap, .007, 'starts 7 mm off the wall');
assert.equal(attachGap(branch(.012), trunk).end, 'start');
assert.equal(attachGap(branch(.012).reverse(), trunk).end, 'end', 'direction of the child does not matter');
near(attachGap(branch(.012).reverse(), trunk).gap, .007);
near(attachGap(branch(.012), trunk).at, 15, 'position along the parent');
// The radius is interpolated along a tapering parent.
const taper = [{c: [0, 0, 0], r: .006}, {c: [0, -.06, 0], r: .002}];
near(attachGap(branch(.01, 5, -.03), taper).gap, .006, 'tapering parent');
// A single-ring parent is treated as a point; empty lines give null.
near(attachGap(branch(.01), [{c: [0, -.045, 0], r: .004}]).gap, .006);
assert.equal(attachGap([], trunk), null);
assert.equal(attachGap(branch(.01), []), null);
// Parts of one structure: end to end.
const lower = trunk.map(p => ({c: [0, p.c[1] - .09, 0], r: .005}));
near(joinGap(trunk, lower), 0, 'parts that share an end');
near(joinGap(trunk, lower.map(p => ({c: [0, p.c[1] - .02, 0], r: .005}))), .015, '20 mm apart less the radius');
near(joinGap(lower.slice().reverse(), trunk), 0, 'order and direction do not matter');
assert.equal(joinGap([], trunk), null);
console.log('centreline continuity: ok');
