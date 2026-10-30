// Scope selection: categories combine freely with region section and side, in both levels; an empty scope has no questions.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {quizModule} from './quiz-modules.mjs';
const {QUIZ_CATEGORIES, questionPool, categoryOf} = await quizModule('app/quiz/catalogue.ts');
const {namingPool} = await quizModule('app/quiz/level2.ts');
const load = f => JSON.parse(fs.readFileSync(`public/models/quiz-${f}.json`, 'utf8'));
const lower = load('lower'), heart = load('heart');
assert.deepEqual(QUIZ_CATEGORIES.map(c => c.id), ['bone', 'muscle', 'nerve', 'artery', 'vein', 'ligament', 'space', 'organ']);
const scope = (categories, side = 'both', section = 'all') => ({section, systems: [], categories, side, count: 10});
for (const pool of [questionPool, namingPool]) {
  const nerves = pool(lower, scope(['nerve'], 'right'));
  assert.ok(nerves.length > 0 && nerves.every(s => s.system === 'nervous' && (s.side === 'right' || s.side === 'midline')), 'lower limb + right + nerves = right lower-limb nerves only');
  assert.ok(!nerves.some(s => s.system === 'muscular'), 'no muscle in a nerves-only scope');
  const vascular = pool(lower, scope(['nerve', 'artery', 'vein']));
  assert.ok(vascular.length === pool(lower, scope(['nerve'])).length + pool(lower, scope(['artery'])).length + pool(lower, scope(['vein'])).length, 'nerves + arteries + veins add up');
  assert.ok(!vascular.some(s => s.system === 'muscular' || s.system === 'skeletal'), 'nerves + arteries + veins without muscle or bone');
  const cardiacArteries = pool(heart, scope(['artery']));
  assert.ok(cardiacArteries.length > 0 && cardiacArteries.every(s => s.system === 'arterial'), 'heart + arteries');
  assert.equal(pool(lower, scope([])).length, 0, 'no category = no questions');
  assert.equal(pool(lower, scope(['space'])).length, 0, 'a category without structures has no questions (nothing is invented)');
  assert.ok(pool(lower, scope(['nerve'], 'right', 'foot')).every(s => s.sections.includes('foot')), 'section crosses with category');
}
assert.equal(questionPool(lower, scope(['nerve'], 'left')).length, namingPool(lower, scope(['nerve'], 'left')).length, 'both levels hold the same nerves');
// every category chip has its Chinese label and a bilingual name
for (const c of QUIZ_CATEGORIES) assert.ok(c.label && c.english, c.id);
assert.equal(categoryOf({name: 'Right tensor fasciae latae', system: 'muscular'}), 'muscle');
assert.equal(categoryOf({name: 'Right long plantar ligament', system: 'skeletal'}), 'ligament');
console.log('Quiz scope passed: categories combine freely with section and side in both levels; empty scopes have no questions.');
