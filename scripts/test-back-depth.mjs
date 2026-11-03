// Tissue depth of the back: a chosen layer shows only the muscles (tendons follow their muscle), connective tissue, vessels and nerves of that layer; bone stays as the reference.
// Superficial: trapezius, latissimus dorsi, thoracolumbar fascia. Middle: rhomboids, levator scapulae, posterior serratus muscles. Deep: the intrinsic muscles.
// Uses the real visibility function the scene uses, on the runtime atlas, and the nerve-depth function for the separate nerve meshes.
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {displaySystem} from './lib/runtime-systems.mjs';

const V = await quizModule('app/mj-part-visibility.ts'), O = await quizModule('app/mj-owners.ts'), D = await quizModule('app/mj-depth.ts'), B = await quizModule('app/mj-region-bar.ts');
const {atlas} = loadFullAtlas(), parts = atlas.parts.map(p => p.stream ? p : {...p, system: displaySystem(p)});
const owners = O.buildOwners(parts), index = B.buildRegionIndex(parts);
const back = new Set(B.regionMembers(index, parts, 'back', undefined, 'both').focus);
const ALL = ['skeletal', 'muscular', 'tendon', 'connective', 'arterial', 'venous', 'nervous'];
const state = depthFilter => ({visible: ALL, selected: [], hiddenParts: [], focusParts: [...back], isolate: false, depthFilter, muscleRegion: undefined, muscleLayer: 'all', faceMuscleLayer: 'all', heartOpen: undefined, sex: undefined, hiddenSerous: []});
const shown = d => { const v = V.partVisibility(owners, state(d)); return parts.filter(p => back.has(p.id) && v.base(p)); };

const EXPECT = {
  superficial: [/trapezius/i, /latissimus dorsi/i, /thoracolumbar fascia/i],
  intermediate: [/rhomboid (major|minor)/i, /levator scapulae/i, /serratus posterior (superior|inferior)/i],
  deep: [/splenius (capitis|cervicis)/i, /iliocostalis/i, /longissimus/i, /spinalis/i, /semispinalis/i, /multifidus/i, /rotator/i, /interspinal/i, /intertransvers/i, /levatores costarum/i],
};
let checks = 0;
for (const depth of ['superficial', 'intermediate', 'deep']) {
  const list = shown(depth), names = list.filter(p => p.system !== 'skeletal').map(p => p.name);
  for (const re of EXPECT[depth]) { checks++; assert.ok(names.some(n => re.test(n)), `${depth}: ${re} must be shown`); }
  for (const other of Object.keys(EXPECT).filter(k => k !== depth)) for (const re of EXPECT[other]) { checks++; assert.ok(!names.some(n => re.test(n)), `${depth}: ${re} belongs to the ${other} layer and must be hidden (shown: ${names.filter(n => re.test(n)).join(', ')})`); }
  checks++; assert.ok(list.some(p => p.system === 'skeletal'), `${depth}: bone stays as the reference`);
  // the neurovascular structures shown belong to the layer
  for (const p of list) if (['arterial', 'venous', 'nervous'].includes(p.system)) { checks++; assert.equal(D.anatomyDepth(p), depth, `${depth}: ${p.name} is shown but belongs to ${D.anatomyDepth(p)}`); }
}
// all: every structure of the region is shown, i.e. at least the three layers together
{ const v = V.partVisibility(owners, state('all')), nb = l => l.filter(p => p.system !== 'skeletal' && !/intervertebral disk/i.test(p.name)).length, n = nb(parts.filter(p => back.has(p.id) && v.base(p)));
  const sum = ['superficial', 'intermediate', 'deep'].reduce((a, d) => a + nb(shown(d)), 0); checks++; assert.ok(n >= sum, `all: ${n} structures, layers add up to ${sum}`); }
// the separate nerve meshes
const nd = D.nerveDepth;
for (const [name, depth] of [['Accessory nerve (XI).r.001', 'superficial'], ['Dorsal scapular nerve.l.001', 'intermediate'], ['Posterior rami of lumbar nerves.j.001', 'deep'], ['Spinal nerves.j.001', 'deep']]) { checks++; assert.equal(nd(name), depth, name); }
checks++; assert.equal(nd('Median nerve.r.001'), undefined, 'nerves of other regions are not touched by the depth control');
const cnt = d => shown(d).filter(p => p.system !== 'skeletal' && !/intervertebral disk/i.test(p.name)).length;
console.log(`back depth OK: ${checks} checks (superficial ${cnt('superficial')}, middle ${cnt('intermediate')}, deep ${cnt('deep')} non-bone structures)`);
