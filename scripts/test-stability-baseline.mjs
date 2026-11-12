import assert from 'node:assert/strict';
import {compareBaseline} from './lib/stability-baseline.mjs';

const known = {
  'stretch|a|pose': {name: 'A', measure: 10, reason: 'Reviewed existing stretch'},
  'cuts|b': {name: 'B', measure: 2, reason: 'Reviewed existing cut'},
};
const snapshot = structuredClone(known);
const f = (measure, id = 'a') => ({check: 'stretch', id, sub: 'pose', key: `stretch|${id}|pose`, measure});
assert.equal(compareBaseline(known, [f(10), f(1, 'new')], ['stretch']).next, null, 'new violations cannot be accepted by an update');
assert.equal(compareBaseline(known, [f(11)], ['stretch']).next, null, 'a worse measurement cannot replace its limit');
for (const value of [NaN, Infinity, -1]) assert.equal(compareBaseline(known, [f(value)], ['stretch']).next, null);
assert.equal(compareBaseline(known, [f(1), f(1)], ['stretch']).next, null, 'duplicate findings must not hide one another');
assert.equal(compareBaseline(known, [f(1)], ['cuts']).next, null, 'findings must belong to the checks that ran');
assert.equal(compareBaseline({}, [f(1)], ['stretch']).next, null, 'missing baseline is not an implicit bootstrap');
const partial = compareBaseline(known, [f(6)], ['stretch']);
assert.deepEqual(partial.next, {...known, 'stretch|a|pose': {...known['stretch|a|pose'], measure: 6}});
assert.deepEqual(compareBaseline(known, [], ['stretch']).next, {'cuts|b': known['cuts|b']}, 'remove fixed findings only from checks that ran');
assert.deepEqual(compareBaseline(known, [], ['stretch', 'cuts']).next, {}, 'all fixed findings can be removed');
assert.equal(compareBaseline(partial.next, [f(7)], ['stretch']).next, null, 'improvements become the new limit');
assert.deepEqual(known, snapshot, 'validation does not mutate the reviewed baseline');
// Density-free numbers (detached / stretch): a different tessellation changes the counts but not the share or the severity, so it is not a regression.
const dKnown = {'detached|n|pose': {name: 'N', measure: 100, fraction: .5, severity: 50, reason: 'Reviewed existing detachment'}};
const d = (measure, fraction, severity) => ({check: 'detached', id: 'n', sub: 'pose', key: 'detached|n|pose', measure, fraction, severity});
assert.equal(compareBaseline(dKnown, [d(260, .5, 50)], ['detached']).bad.length, 0, 'twice the vertices, same share and distance: not worse');
assert.equal(compareBaseline(dKnown, [d(60, .5, 51)], ['detached']).bad.length, 0, 'a 1 mm difference in the farthest point is within the tolerance');
assert.equal(compareBaseline(dKnown, [d(100, .5, 53)], ['detached']).bad.length, 1, 'the farthest point moving 3 mm further is worse');
assert.equal(compareBaseline(dKnown, [d(100, .56, 50)], ['detached']).bad.length, 1, 'a larger share of the points detached is worse');
assert.equal(compareBaseline(dKnown, [d(260, .4, 40)], ['detached']).next['detached|n|pose'].measure, 100, 'the raw count never rises when the density grows');
assert.deepEqual(
  (({fraction, severity}) => ({fraction, severity}))(compareBaseline(dKnown, [d(260, .4, 40)], ['detached']).next['detached|n|pose']), {fraction: .4, severity: 40}, 'improvements become the new limit');
// An entry without the numbers keeps the old rule, and moves onto them only with the explicit one-time adoption.
const oldKnown = {'detached|n|pose': {name: 'N', measure: 100, reason: 'Reviewed existing detachment'}};
assert.equal(compareBaseline(oldKnown, [d(260, .5, 50)], ['detached']).bad.length, 1, 'without adoption the old count rule applies');
const adopted = compareBaseline(oldKnown, [d(260, .5, 50)], ['detached'], {adopt: true});
assert.equal(adopted.bad.length, 0); assert.deepEqual([adopted.next['detached|n|pose'].fraction, adopted.next['detached|n|pose'].severity], [.5, 50], 'adoption stores the current numbers');
// Other checks are not affected by the numbers.
assert.equal(compareBaseline(known, [{...f(10), fraction: .1, severity: 1}], ['stretch']).bad.length, 0, 'a stretch finding without a known entry with numbers keeps the count rule');
for (const bad of [{fraction: -1, severity: 1}, {fraction: .1}, {severity: 5}]) assert.ok(compareBaseline({'detached|n|pose': {name: 'N', measure: 100, reason: 'Reviewed existing detachment', ...bad}}, [d(1, .1, 1)], ['detached']).invalid.length > 0, 'a malformed entry is invalid');
console.log('Stability baseline regression tests: OK (23 cases).');
