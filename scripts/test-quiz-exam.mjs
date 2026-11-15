// Mock exam rules: difficulty tiers and the 40 / 40-50 / rest mix, fully shuffled order across regions, remembered setup, left/right in the typed answer, and that a region added to the data is offered.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {quizModule} from './quiz-modules.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const cat = await quizModule('app/quiz/catalogue.ts');
const diff = await quizModule('app/quiz/exam-difficulty.ts'), setupMod = await quizModule('app/quiz/exam-setup.ts'), naming = await quizModule('app/quiz/naming.ts'), level2 = await quizModule('app/quiz/level2.ts'), {seededRandom} = await quizModule('app/quiz/seeded.ts');
const {QUIZ_REGIONS, orderedRegions, regionIds} = cat;
const mem = () => {const m = new Map(); return {getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k)};};

// ---- setup: defaults 50 x 30 s, limits, remembered, cleaned
const d = setupMod.defaultExamSetup();
assert.equal(d.count, 50); assert.equal(d.seconds, 30); assert.deepEqual(d.regions, {});
const store = mem();
setupMod.saveExamSetup({...d, regions: {thorax: ['all'], back: ['superficial']}, count: 80, seconds: 45}, store);
assert.deepEqual(setupMod.loadExamSetup(store).regions, {thorax: ['all'], back: ['superficial']}); assert.equal(setupMod.loadExamSetup(store).count, 80);
store.setItem('mj-exam-setup', JSON.stringify({regions: {nowhere: ['all']}, count: 99999, seconds: 1, categories: ['x']}));
const cleaned = setupMod.loadExamSetup(store); assert.deepEqual(cleaned.regions, {}); assert.equal(cleaned.count, 200); assert.equal(cleaned.seconds, 10);
store.setItem('mj-exam-setup', '{bad'); assert.deepEqual(setupMod.loadExamSetup(store), d); assert.deepEqual(setupMod.loadExamSetup(null), d);
assert.equal(setupMod.clock(30), '0:30'); assert.equal(setupMod.clock(125), '2:05'); assert.equal(setupMod.clock(-3), '0:00');

// ---- left/right in the typed answer
assert.equal(setupMod.withSide('biceps brachii', 'left'), 'Left biceps brachii');
assert.equal(setupMod.withSide('肱二頭肌', 'right'), '右肱二頭肌');
assert.equal(setupMod.withSide('Left biceps', 'right'), 'Left biceps', 'a side already typed is kept');
assert.equal(setupMod.withSide('biceps brachii', null), 'biceps brachii');
const fake = {name: 'Right biceps brachii', chinese: '右肱二頭肌', system: 'muscular', side: 'right'};
assert.equal(naming.judgeName(setupMod.withSide('biceps brachii', 'right'), fake, {language: 'any', needSide: true}).result, 'correct');
assert.notEqual(naming.judgeName(setupMod.withSide('biceps brachii', 'left'), fake, {language: 'any', needSide: true}).result, 'correct', 'the wrong side is never right');
assert.notEqual(naming.judgeName('biceps brachii', fake, {language: 'any', needSide: true}).result, 'correct', 'a missing side is never right');

// ---- the mix: hard 40%, medium 40-50% (random per exam), the rest easy
const pool = [];
for (let i = 0; i < 300; i++) pool.push({region: ['back', 'thorax', 'upper-limb'][i % 3], structure: {id: `s${i}`}, difficulty: i % 10 < 3 ? 'hard' : i % 10 < 7 ? 'medium' : 'easy'});
const mediums = new Set();
for (let seed = 0; seed < 40; seed++) {
  const exam = diff.composeExam(pool, 50, seededRandom(`mix${seed}`)), tiers = diff.tierCounts(exam);
  assert.equal(exam.length, 50); assert.equal(new Set(exam.map(q => q.structure.id)).size, 50, 'no repeats');
  assert.equal(tiers.hard, 20, `hard is 40%: ${JSON.stringify(tiers)}`); assert.ok(tiers.medium >= 20 && tiers.medium <= 25, `medium 40-50%: ${tiers.medium}`);
  assert.equal(tiers.easy, 50 - 20 - tiers.medium); mediums.add(tiers.medium);
}
assert.ok(mediums.size >= 3, 'the medium share changes from exam to exam');
// fully shuffled: the regions are mixed, never in blocks
const exam = diff.composeExam(pool, 60, seededRandom('order')), switches = exam.filter((q, i) => i && q.region !== exam[i - 1].region).length;
assert.ok(switches > 30, `regions are interleaved (${switches} changes in 60)`);
// a tier that runs short is filled from another tier, the count still holds
const onlyEasy = pool.map(q => ({...q, difficulty: 'easy'}));
assert.equal(diff.composeExam(onlyEasy, 50, seededRandom('x')).length, 50);
assert.equal(diff.composeExam(pool.slice(0, 7), 50, seededRandom('y')).length, 7, 'never more than the pool');

// ---- difficulty rules on real data
const real = orderedRegions().filter(def => fs.existsSync(path.join(root, 'public/models', def.file)));
let eligible = 0; const seen = {easy: 0, medium: 0, hard: 0};
for (const def of real) {
  const catalogue = JSON.parse(fs.readFileSync(path.join(root, 'public/models', def.file), 'utf8')), levels = diff.difficultyMap(catalogue, def.id);
  const settings = {section: 'all', systems: [], categories: undefined, side: 'both', scope: 'all', count: 9999};
  for (const s of level2.namingPool(catalogue, {...settings, categories: cat.QUIZ_CATEGORIES.map(c => c.id)}).filter(diff.examEligible)) {eligible++; seen[levels.get(s.id)]++;}
}
assert.ok(eligible > 500 && seen.easy > 0 && seen.medium > 0 && seen.hard > 0, `every tier has questions ${JSON.stringify(seen)}`);
assert.equal(diff.classify(5), 'hard'); assert.equal(diff.classify(2), 'medium'); assert.equal(diff.classify(0), 'easy');
const tiny = {name: 'Second lumbrical', system: 'muscular', bounds: [[0, 0, 0], [.01, .01, .01]]}, big = {name: 'Trapezius', system: 'muscular', bounds: [[0, 0, 0], [.3, .4, .05]]};
assert.ok(diff.difficultyScore(tiny, 3) > diff.difficultyScore(big, 0), 'a small structure with sisters is harder than a big one');
assert.equal(diff.classify(diff.difficultyScore(big, 0)), 'easy');
const overridden = diff.difficultyMap({structures: [{id: 'a', name: 'Trapezius', system: 'muscular', side: 'midline', bounds: [[0, 0, 0], [.3, .4, .05]], sections: []}]}, 'back', {...diff.EXAM_RULES, overrides: {'back/trapezius': 'hard'}});
assert.equal(overridden.get('a'), 'hard', 'the override table wins');
assert.equal(diff.needsSide({side: 'left'}), true); assert.equal(diff.needsSide({side: 'midline'}), false);

// ---- a region added to the data is offered by the exam setup (no region list in the page)
const FAKE = 'test-fake-region';
QUIZ_REGIONS[FAKE] = {...QUIZ_REGIONS['upper-limb'], id: FAKE, label: '測試區'};
try {
  assert.ok(regionIds().includes(FAKE));
  assert.deepEqual(setupMod.loadExamSetup({getItem: () => JSON.stringify({regions: {[FAKE]: ['arm']}}), setItem() {}, removeItem() {}}).regions, {[FAKE]: ['arm']});
} finally { delete QUIZ_REGIONS[FAKE]; }
const page = fs.readFileSync(path.join(root, 'app/quiz/exam.tsx'), 'utf8') + fs.readFileSync(path.join(root, 'app/quiz/setup-parts.tsx'), 'utf8');
assert.ok(page.includes('orderedRegions()') && !/'head-neck'|'upper-limb'|'lower-limb'/.test(page), 'the exam page names no region');
assert.ok(!/共筆|筆記|跑考|課堂/.test(page), 'no note wording on the exam page');
console.log(`Mock exam passed: 50 x 30 s defaults, ${eligible} questions in ${real.length} catalogues across three tiers, hard 40% / medium 40-50% mix, shuffled across regions, left/right in answers, remembered setup.`);
