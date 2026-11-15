// A head-and-neck space question opens from the side the space is seen from (the suboccipital triangle from behind), not from the region's front default.
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
const {openingView} = await quizModule('app/quiz/spaces.ts');
const {SPACES} = await quizModule('app/mj-spaces.ts');
const {SPACE_REGION} = await quizModule('app/quiz/spaces.ts');
const space = {space: {id: 'suboccipital'}};
assert.equal(openingView('head-neck', space, 'front'), 'space', 'a head-and-neck space must open aimed at the space');
assert.equal(openingView('head-neck', {}, 'front'), 'front', 'other head-and-neck questions keep the default view');
assert.equal(openingView('upper-limb', space, undefined), 'front', 'limb questions are unchanged');
assert.equal(openingView('back', {}, 'back'), 'back');
const def = SPACES.find(d => d.id === 'suboccipital');
assert.ok(def && SPACE_REGION[def.group] === 'head-neck');
assert.ok(def.look[2] < 0, 'the suboccipital triangle lies on the back of the neck: its view direction must come from behind (negative front component)');
// every head-and-neck space must look at a side that is not the opposite of the structure: the look vector has a clear front/back component
for (const d of SPACES.filter(d => SPACE_REGION[d.group] === 'head-neck')) assert.ok(Math.abs(d.look[2]) > .5, `${d.id}: unclear view direction`);
console.log('quiz space opening view: ok');
