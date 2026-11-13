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
// the female view draws the reshaped female skin and not the male one (the penis and scrotum are part of the male skin mesh), the male view the reverse
const M = await quizModule('app/mj-sex.ts'), maleSkin = parts.find(p => p.id === 'FJ2810'), femSkin = parts.find(p => p.id === 'HRAF-skin');
if (!maleSkin || !femSkin) { console.error('both skins must exist (FJ2810 and HRAF-skin)'); process.exit(1); }
for (const [sex, a, b] of [['female', femSkin, maleSkin], ['male', maleSkin, femSkin]]) {
  if (!M.matchesSex(a, sex)) { bad++; console.error(`FAIL ${sex} view must show ${a.id}`); }
  if (M.matchesSex(b, sex)) { bad++; console.error(`FAIL ${sex} view must not show ${b.id}`); }
}
const clit = parts.find(p => p.name === 'Clitoris');
if (clit && !V.partVisibility(owners, {...base, visible: ['reproductive']}).base(clit)) { bad++; console.error('FAIL Clitoris must not depend on the skin'); }
if (bad) process.exit(1);
console.log('skin folds OK: mons pubis and labia are shown only with the body surface; the other female structures do not depend on it.');
