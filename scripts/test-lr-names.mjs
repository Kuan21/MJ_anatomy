// Regression: in the head and neck (mesh centroid y >= 1.42 m) the Left/Right in a structure's name agrees with the side the mesh is on (centroid x, positive = Left),
// midline-crossing structures (|x| < 2 mm) are not judged; the known-reversed list is empty and may only shrink. Names stay unique, and each concept holds the part of its own side.
// Fixed in this data: both middle pharyngeal constrictors and both brachia of the superior colliculus were named on the opposite side. Prints pass/fail and counts only.
import assert from 'node:assert/strict';
import {scanLeftRight, KNOWN_REVERSED} from './audit-lr-names.mjs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
const rows = scanLeftRight();
assert.ok(rows.length > 500, 'the scan sees the head-neck structures');
const bad = rows.filter(r => r.verdict === 'REVERSED' && !KNOWN_REVERSED.includes(r.id));
assert.deepEqual(bad.map(r => `${r.id} ${r.name} x=${r.cx}`), [], 'name side differs from mesh side');
assert.ok(KNOWN_REVERSED.length === 0, 'the known-reversed list is empty (it may only shrink)');
const {atlas} = loadFullAtlas();
for (const [id, side] of [['FJ2742', 'Left'], ['FJ2754', 'Right'], ['FJ1735', 'right'], ['FJ1736', 'left']]) {
  const p = atlas.parts.find(x => x.id === id), c = atlas.concepts.find(x => x.id === p.conceptId);
  assert.ok(p.name.toLowerCase().includes(side.toLowerCase()), `${id} name`);
  assert.ok(c.name.toLowerCase().includes(side.toLowerCase()), `${id} concept ${p.conceptId}`);
}
const names = new Map(); for (const p of atlas.parts) names.set(p.name, (names.get(p.name) || 0) + 1);
assert.deepEqual(['Left middle pharyngeal constrictor', 'Right middle pharyngeal constrictor', 'Brachium of left superior colliculus', 'Brachium of right superior colliculus'].filter(n => names.get(n) !== 1), [], 'duplicate or missing name');
console.log(`Left/right names OK: ${rows.length} head-neck structures checked, none reversed.`);
