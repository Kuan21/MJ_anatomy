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
console.log('Stability baseline regression tests: OK (12 cases).');
