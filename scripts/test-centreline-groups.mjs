// Sorting multi-piece meshes into "one structure" and "a group by name", and the gap that links the pieces (synthetic lines, no model data needed).
import assert from 'node:assert/strict';
import {specNames, structureKind, pieceGap, linkGap} from './lib/centreline-groups.mjs';

// Names: topology-spec entries are single structures on both sides, with the stream suffix for nerves.
const spec = specNames();
for (const n of ['Left femoral artery', 'right femoral artery', 'Arch of aorta', 'Median nerve.l', 'Sciatic nerve.r', 'Left lateral cord of brachial plexus', 'Right axillary vein'])
  assert.equal(structureKind(n, spec), 'spec', n);
// Names that say they hold several structures.
for (const n of ['Set of perforating veins', 'Set of anterior intercostal veins', 'Posterior intercostal arteries', 'Intercostal nerves.r', 'Roots of brachial plexus.l',
  'Proper palmar digital branches of median nerve.r', 'Ganglia of sympathetic trunk.l', 'Suboccipital venous plexus.r', 'Set of oesophageal branches of thoracic aorta'])
  assert.equal(structureKind(n, spec), 'group', n);
// Singular names outside the spec stay undecided, also when the owner after "of" is a plural or a plexus.
for (const n of ['Lumbar artery', 'Saphenous nerve.r', 'Anterior root of spinal nerve.l', 'Superficial branch of radial nerve.r', 'Right portal vein', 'Posterior cord of brachial plexus.l', 'Marginal colic artery'])
  assert.equal(structureKind(n, spec), 'unknown', n);
assert.equal(structureKind('Sural nerves', new Set(['sural nerves'])), 'spec', 'a name in the spec wins over its plural');

// Lines: straight runs of rings of radius r.
const line = (from, to, r = .002, n = 20) => Array.from({length: n + 1}, (_, i) => ({c: from.map((v, k) => v + (to[k] - v) * i / n), r}));
const trunk = line([0, 0, 0], [0, -.1, 0], .004);
// A branch leaving the side of the trunk: its end is far from both trunk ends, but it sits on the wall.
const branch = line([.004, -.05, 0], [.05, -.07, 0]);
assert.ok(pieceGap(trunk, branch) < 1e-9, 'a side branch on the wall has no gap');
assert.ok(pieceGap(branch, trunk) < 1e-9, 'and the order does not matter');
// The same branch 10 mm off the wall.
const off = line([.014, -.05, 0], [.05, -.07, 0]);
assert.ok(Math.abs(pieceGap(trunk, off) - .01) < 1e-6, `10 mm off the wall, got ${pieceGap(trunk, off)}`);
// Two parts end to end, 6 mm between the ends, radius 4 mm: 2 mm left.
const below = line([0, -.106, 0], [0, -.2, 0], .004);
assert.ok(Math.abs(pieceGap(trunk, below) - .002) < 1e-6, 'end to end less the radius');
assert.equal(pieceGap(trunk, []), null);

// linkGap: one connected structure, in whatever order the pieces come.
const next = line([0, -.1, 0], [0, -.2, 0], .004);
assert.ok(linkGap([trunk, branch, next]) < 1e-9 && linkGap([branch, next, trunk]) < 1e-9, 'trunk, continuation and side branch hang together');
assert.equal(linkGap([trunk]), null);
// Two tight clusters far apart: every piece has a near neighbour, but the structure is in two parts.
const far = [line([.1, 0, 0], [.1, -.1, 0], .004), line([.104, -.05, 0], [.15, -.07, 0])];
const g = linkGap([trunk, branch, ...far]);
assert.ok(g > .04 && g < .1, `two clusters need a long link, got ${g}`);
// Separate parallel vessels of a group: the link is their spacing less the radius.
const set = [0, .03, .06].map(x => line([x, 0, 0], [x, -.1, 0], .002));
assert.ok(Math.abs(linkGap(set) - .028) < 1e-6, `spacing of a set, got ${linkGap(set)}`);
console.log('centreline groups: ok');
