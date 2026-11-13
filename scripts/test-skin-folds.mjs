// The mound of the pubis and the labia are shown only together with the body surface (app/mj-part-visibility.ts, SKIN_FOLDS): with the body surface off they would float in front of the male pelvic muscles.
import {quizModule} from './quiz-modules.mjs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {displaySystem} from './lib/runtime-systems.mjs';

const V = await quizModule('app/mj-part-visibility.ts'), O = await quizModule('app/mj-owners.ts');
const {atlas} = loadFullAtlas(), parts = atlas.parts.map(p => p.stream ? p : {...p, system: displaySystem(p)}), owners = O.buildOwners(parts);
const folds = parts.filter(p => V.SKIN_FOLDS.test(p.name));
if (folds.length !== 5) { console.error(`expected 5 skin-fold structures (mons pubis, 2 labia majora, 2 labia minora), found ${folds.length}`); process.exit(1); }
const base = {selected: [], hiddenParts: [], focusParts: undefined, isolate: false, depthFilter: 'all', muscleRegion: undefined, muscleLayer: 'all', faceMuscleLayer: 'all', heartOpen: false, sex: 'female', hiddenSerous: []};
let bad = 0;
for (const [label, visible, want] of [['skin off', ['reproductive', 'muscular'], false], ['skin on', ['reproductive', 'integumentary'], true]]) {
  const v = V.partVisibility(owners, {...base, visible});
  for (const p of folds) if (v.base(p) !== want) { bad++; console.error(`FAIL ${p.name}: ${label} should be ${want ? 'shown' : 'hidden'}`); }
}
const clit = parts.find(p => p.name === 'Clitoris');
if (clit && !V.partVisibility(owners, {...base, visible: ['reproductive']}).base(clit)) { bad++; console.error('FAIL Clitoris must not depend on the skin'); }
if (bad) process.exit(1);
console.log('skin folds OK: mons pubis and labia are shown only with the body surface; the other female structures do not depend on it.');
