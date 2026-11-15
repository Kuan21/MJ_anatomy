// The baseline of the centreline continuity check may only shrink (synthetic rows, no model data needed).
import assert from 'node:assert/strict';
import {compareContinuity, firstBaseline, findingsOf, roundUp, keyOf} from './lib/centreline-baseline.mjs';

const row = (child, surfaceMm, attachMm = surfaceMm, parent = 'Trunk') => ({child, parent, surfaceMm, attachMm});
const rel = (child, parent = 'Trunk') => ({child, parent});

assert.deepEqual([0, .1, .5, .51, 12.04, 12.5000001].map(roundUp), [0, .5, .5, 1, 12.5, 12.5], 'rounded up to half a millimetre');
assert.deepEqual(findingsOf([row('A', 3), row('B', 3.01), row('C', 0)], 3).map(f => [f.key, f.measure]), [['attach|B|Trunk', 3.5]], 'only gaps over the limit are findings');
assert.equal(findingsOf([row('A', NaN)], 3).length, 1, 'a distance that is not a number is never within the limit');

// First baseline: gaps over the limit and the relations without a mesh.
const rows = [row('Near', .4), row('Gap', 12.2, 13), row('Wide', 49.6, 50.3)], absent = [rel('Schematic')];
const base = firstBaseline(rows, absent, 3, 'present when the baseline was made');
assert.deepEqual(Object.keys(base.known), ['attach|Gap|Trunk', 'attach|Wide|Trunk']);
assert.deepEqual(base.known['attach|Gap|Trunk'], {measure: 12.5, attachMm: 13, reason: 'present when the baseline was made'});
assert.deepEqual(base.absent, ['attach|Schematic|Trunk']);
assert.throws(() => firstBaseline(rows, absent, 3, ' '), 'a baseline needs a reason');
assert.throws(() => firstBaseline([row('A', NaN)], [], 3, 'x'), 'a distance that is not a number cannot be recorded');
const snapshot = structuredClone(base);

// The same measurement again: nothing changes.
const same = compareContinuity(base, rows, absent);
assert.deepEqual([same.bad, same.lost, same.invalid, same.gone, same.back], [[], [], [], [], []]);
assert.deepEqual(same.next, base, 'an unchanged run reproduces the baseline');
// Within the half millimetre step a re-run is not worse; beyond it, it is.
assert.ok(compareContinuity(base, [row('Near', .4), row('Gap', 12.5), row('Wide', 49.6)], absent).next, 'same step');
const worse = compareContinuity(base, [row('Near', .4), row('Gap', 12.6), row('Wide', 49.6)], absent);
assert.deepEqual([worse.bad.map(f => f.key), worse.next], [['attach|Gap|Trunk'], null], 'a wider gap fails and cannot be saved');
// A relation that was within the limit and is not any more.
const fresh = compareContinuity(base, [row('Near', 3.2), row('Gap', 12.2), row('Wide', 49.6)], absent);
assert.deepEqual([fresh.bad.map(f => f.key), fresh.next], [['attach|Near|Trunk'], null], 'a new gap fails');
// A relation nobody measured before (new in the spec) is held to the limit too.
assert.equal(compareContinuity(base, [...rows, row('New', 8)], absent).next, null, 'a new relation with a gap fails');
assert.ok(compareContinuity(base, [...rows, row('New', 1)], absent).next, 'a new relation within the limit passes');

// Improvements: a smaller gap becomes the new limit, a closed gap leaves the list, and neither can come back.
const better = compareContinuity(base, [row('Near', .4), row('Gap', 6.1, 7), row('Wide', 1.2)], absent);
assert.deepEqual(better.gone, ['attach|Wide|Trunk']);
assert.deepEqual(better.next.known, {'attach|Gap|Trunk': {measure: 6.5, attachMm: 7, reason: 'present when the baseline was made'}});
assert.equal(compareContinuity(better.next, rows, absent).next, null, 'the old distances no longer pass');

// Meshes that disappear or appear.
const lost = compareContinuity(base, [row('Gap', 12.2), row('Wide', 49.6)], [...absent, rel('Near')]);
assert.deepEqual([lost.lost, lost.next], [['attach|Near|Trunk'], null], 'a relation that loses its mesh fails');
const lostGap = compareContinuity(base, [row('Near', .4), row('Wide', 49.6)], [...absent, rel('Gap')]);
assert.deepEqual([lostGap.lost, lostGap.gone, lostGap.next], [['attach|Gap|Trunk'], [], null], 'a recorded gap whose mesh is gone is lost, not fixed');
const back = compareContinuity(base, [...rows, row('Schematic', .2)], []);
assert.deepEqual([back.back, back.next.absent], [['attach|Schematic|Trunk'], []], 'a mesh that appears leaves the absent list');
assert.equal(compareContinuity(back.next, rows, absent).next, null, 'and may not go missing again');
assert.equal(compareContinuity(base, [...rows, row('Schematic', 9)], []).next, null, 'a mesh that appears with a gap is held to the limit');

// Broken input never yields a baseline to save.
assert.equal(compareContinuity(base, [...rows, row('Gap', 12.2)], absent).next, null, 'the same relation twice');
assert.equal(compareContinuity(base, [...rows, row('Schematic', 1)], absent).next, null, 'a relation both measured and absent');
assert.equal(compareContinuity(base, [row('Near', .4), row('Gap', NaN), row('Wide', 49.6)], absent).next, null, 'a distance that is not a number');
for (const broken of [null, {}, {limitMm: 3, known: {}}, {limitMm: 3, known: [], absent: []}, {limitMm: -1, known: {}, absent: []}, {known: {}, absent: []}])
  assert.deepEqual(compareContinuity(broken, rows, absent).invalid, ['baseline'], 'a broken baseline is not a fresh start');
assert.equal(compareContinuity({limitMm: 3, known: {}, absent: []}, rows, []).next, null, 'an empty baseline does not accept gaps');
assert.equal(compareContinuity({...base, known: {...base.known, 'attach|Gap|Trunk': {measure: 12.5}}}, rows, absent).next, null, 'an entry without a reason');
assert.equal(keyOf(rel('A', 'B')), 'attach|A|B');
assert.deepEqual(base, snapshot, 'comparing does not change the baseline');
console.log('centreline baseline: ok');
