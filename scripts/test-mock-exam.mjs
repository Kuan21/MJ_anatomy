// Mock exam (app/quiz/mock-exam.ts): seeded paper builder, difficulty mix, exclusion of structures that cannot be asked, shuffle across regions, typed-answer acceptance,
// timer and remembered settings. Pure functions only; the real catalogues (public/models/quiz-*.json) are checked as well when they have been generated. Prints pass/fail only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {quizModule} from './quiz-modules.mjs';

const exam = await quizModule('app/quiz/mock-exam.ts');
const {QUIZ_REGIONS} = await quizModule('app/quiz/catalogue.ts');
const {judgeName} = await quizModule('app/quiz/naming.ts');
const {buildExam, examPool, gradeTyped, tierOf, difficultyScore, familyKey, tierCounts, secondsLeft, isExpired, secondsUsed, clockText, sanitizeSettings, loadSettings, saveSettings, EXAM_DEFAULTS, scoreOf, MOCK_EXAM_LABEL} = exam;

// ---- synthetic catalogues ------------------------------------------------------------------------------------------------------------------------------------
const box = d => [[0, 0, 0], [d, 0, 0]];
let n = 0;
const make = (name, chinese, system, side, size, extra = {}) => ({id: `s${++n}`, name, chinese, system, side, sections: ['all-parts'], meshIds: [`m${n}`], bounds: box(size), source: 'BodyParts3D', ...extra});
function catalogue(region, tag) {
  const structures = [];
  for (let i = 0; i < 40; i++) structures.push(make(`Right ${tag} bone ${'abcdefghijklmnopqrstuvwxyz'[i % 26]}${i}`, `右${tag}骨${i}`, 'skeletal', 'right', .3 + i / 100));
  for (let i = 0; i < 40; i++) structures.push(make(`Right ${tag} muscle q${i}x`, `右${tag}肌${i}`, 'muscular', 'right', .05 + i / 200));
  for (let i = 0; i < 30; i++) structures.push(make(`Left ${tag} vein v${i}y`, `左${tag}靜脈${i}`, 'venous', 'left', .02 + i / 400));
  for (let i = 0; i < 30; i++) structures.push(make(`${tag} nerve n${i}z`, `${tag}神經${i}`, 'nervous', 'midline', .03 + i / 300));
  return {version: 1, region, structures, packages: [{url: 'x', gzip: 'x', bytes: 1, gzipBytes: 1, system: 'skeletal', side: 'right', meshes: []}]};
}
const lower = catalogue('lower-limb', 'lower'), upper = catalogue('upper-limb', 'upper');
// a structure the exam must never ask, a structure without a Chinese name, and a name shared by two structures
const flagged = make('Right lower flagged bone', '右下肢標記骨', 'skeletal', 'right', .2, {availability: {levels: [1, 3], lessons: true, exam: false}});
const noZh = make('Right lower unnamed bone', undefined, 'skeletal', 'right', .2);
const twin1 = make('Right lower twin', '右雙胞胎', 'skeletal', 'right', .2), twin2 = make('Right lower twin', '右雙胞胎二', 'skeletal', 'right', .2);
lower.structures.push(flagged, noZh, twin1, twin2);
const sources = [{region: 'lower-limb', catalogue: lower, section: 'all'}, {region: 'upper-limb', catalogue: upper, section: 'all'}];
const pool = examPool(sources);

// ---- exclusion ------------------------------------------------------------------------------------------------------------------------------------------------
assert.ok(pool.length > 200, 'pool built');
for (const bad of [flagged, noZh, twin1, twin2]) assert.ok(!pool.some(i => i.id === bad.id), `${bad.name} must not be asked`);
const hiddenOnly = make('Right lower surface only', '右下肢表面', 'skeletal', 'right', .2, {sections: []});
assert.ok(!examPool([{region: 'lower-limb', catalogue: {...lower, structures: [...lower.structures, hiddenOnly]}, section: 'all'}]).some(i => i.id === hiddenOnly.id), 'a structure drawn in no section is not asked');
for (let s = 0; s < 20; s++) assert.ok(!buildExam(pool, 50, `x${s}`).questions.some(q => q.id === flagged.id), 'flagged structure never on a paper');
// the same structure in two catalogues is asked once
const dup = {...lower, region: 'upper-limb'};
assert.equal(examPool([{region: 'lower-limb', catalogue: lower, section: 'all'}, {region: 'upper-limb', catalogue: dup, section: 'all'}]).length, examPool([sources[0]]).length, 'duplicates across regions are asked once');

// ---- determinism, size, no repeats ---------------------------------------------------------------------------------------------------------------------------
const a = buildExam(pool, 50, 'seed-1'), b = buildExam(pool, 50, 'seed-1'), c = buildExam(pool, 50, 'seed-2');
assert.deepEqual(a, b, 'same seed, same paper');
assert.notDeepEqual(a.questions, c.questions, 'another seed, another paper');
assert.deepEqual(buildExam([...pool].reverse(), 50, 'seed-1'), a, 'the paper does not depend on the order of the pool');
assert.equal(a.questions.length, 50);
assert.equal(new Set(a.questions.map(q => `${q.region}:${q.id}`)).size, 50, 'no repeated question');
assert.equal(buildExam(pool, 9999, 'big').questions.length, pool.length, 'a count above the pool gives the whole pool');
assert.equal(buildExam(pool, 0, 'zero').questions.length, 0);

// ---- difficulty mix ------------------------------------------------------------------------------------------------------------------------------------------
const tiers = {easy: 0, medium: 0, hard: 0};
for (const i of pool) tiers[i.tier]++;
assert.ok(tiers.easy > 15 && tiers.medium > 15 && tiers.hard > 25, `the synthetic pool has every tier ${JSON.stringify(tiers)}`);
for (let s = 0; s < 60; s++) {
  const paper = buildExam(pool, 50, `mix${s}`);
  assert.equal(paper.mix.hard, 20, 'hard is 40%');
  assert.ok(paper.mix.medium >= 20 && paper.mix.medium <= 25, `medium 40-50%: ${paper.mix.medium}`);
  assert.ok(paper.mix.easy >= 5 && paper.mix.easy <= 10, `easy 10-20%: ${paper.mix.easy}`);
  assert.equal(paper.mix.easy + paper.mix.medium + paper.mix.hard, 50);
  for (const q of paper.questions) assert.equal(q.tier, pool.find(i => i.id === q.id && i.region === q.region).tier);
}
const mediums = new Set(Array.from({length: 40}, (_, s) => buildExam(pool, 50, `r${s}`).mix.medium));
assert.ok(mediums.size >= 4, 'the medium share varies from exam to exam');
for (const count of [1, 5, 10, 37, 100, 200]) {const t = tierCounts(count, 'k'); assert.equal(t.hard + t.medium + t.easy, count); assert.ok(t.easy >= 0 && t.medium >= 0);}
// a pool with no hard structures is topped up from the other tiers
const easyOnly = pool.filter(i => i.tier === 'easy');
assert.equal(buildExam(easyOnly, Math.min(10, easyOnly.length), 'e').questions.length, Math.min(10, easyOnly.length), 'a missing tier is topped up');

// ---- the difficulty rule -------------------------------------------------------------------------------------------------------------------------------------
assert.equal(tierOf(0), 'easy'); assert.equal(tierOf(2), 'easy'); assert.equal(tierOf(3), 'medium'); assert.equal(tierOf(5), 'medium'); assert.equal(tierOf(6), 'hard'); assert.equal(tierOf(8), 'hard');
const big = make('Right big bone', '右大骨', 'skeletal', 'right', .5), tinyVein = make('Right tiny vein', '右小靜脈', 'venous', 'right', .02), trap = make('Right trapezius', '右斜方肌', 'muscular', 'right', .3);
assert.equal(difficultyScore(big, 1), 0); assert.equal(difficultyScore(tinyVein, 3), 8); assert.equal(difficultyScore(trap, 1), 1);
assert.equal(difficultyScore(tinyVein, 3), difficultyScore(tinyVein, 3), 'deterministic');
assert.equal(familyKey({name: 'Right second lumbrical', system: 'muscular'}), familyKey({name: 'Left third lumbrical', system: 'muscular'}), 'ordinals and sides do not split a family');
assert.notEqual(familyKey({name: 'Right lumbrical', system: 'muscular'}), familyKey({name: 'Right deltoid', system: 'muscular'}));

// ---- shuffle across regions ----------------------------------------------------------------------------------------------------------------------------------
for (let s = 0; s < 20; s++) {
  const regions = buildExam(pool, 50, `sh${s}`).questions.map(q => q.region);
  assert.ok(regions.includes('lower-limb') && regions.includes('upper-limb'), 'both regions appear');
  const switches = regions.filter((r, i) => i && r !== regions[i - 1]).length;
  assert.ok(switches >= 10, `the order is not grouped by region (switches ${switches})`);
}

// ---- typed answers: English or Chinese, left/right required, same matching as level 3 --------------------------------------------------------------------------
const deltoid = make('Right deltoid', '右三角肌', 'muscular', 'right', .2);
assert.equal(gradeTyped('Right deltoid', deltoid), 'correct');
assert.equal(gradeTyped('right DELTOID', deltoid), 'correct');
assert.equal(gradeTyped('deltoid right', deltoid), 'correct');
assert.equal(gradeTyped('右三角肌', deltoid), 'correct');
assert.equal(gradeTyped('三角肌右側', deltoid), 'correct');
assert.notEqual(gradeTyped('Deltoid', deltoid), 'correct', 'a missing side is not correct');
assert.equal(gradeTyped('三角肌', deltoid), 'close', 'a missing side is not correct (Chinese)');
assert.notEqual(gradeTyped('Deltoid', deltoid), 'correct', 'a missing side is never scored');
assert.equal(gradeTyped('Left deltoid', deltoid), 'wrong', 'the wrong side is wrong');
assert.equal(gradeTyped('左三角肌', deltoid), 'wrong');
assert.equal(gradeTyped('   ', deltoid), 'skipped');
assert.equal(gradeTyped('', deltoid), 'skipped');
assert.equal(gradeTyped('Right trapezius', deltoid), 'wrong');
const midline = make('Sternum', '胸骨', 'skeletal', 'midline', .2);
assert.equal(gradeTyped('Sternum', midline), 'correct'); assert.equal(gradeTyped('胸骨', midline), 'correct');
// the exam grades exactly like level 3 with the side required
for (const typed of ['Right deltoid', 'right deltoid muscle', '右三角肌', 'Right deltoyd', 'Right trapezius']) assert.equal(gradeTyped(typed, deltoid), judgeName(typed, deltoid, {language: 'any', needSide: true}, []).result);
assert.equal(scoreOf([{result: 'correct'}, {result: 'close'}, {result: 'wrong'}, {result: 'skipped'}, undefined, {result: 'correct'}]), 2, 'only correct answers score');

// ---- timer -----------------------------------------------------------------------------------------------------------------------------------------------------
assert.equal(secondsLeft(0, 30), 30); assert.equal(secondsLeft(1, 30), 30); assert.equal(secondsLeft(1000, 30), 29); assert.equal(secondsLeft(29999, 30), 1); assert.equal(secondsLeft(30000, 30), 0); assert.equal(secondsLeft(99999, 30), 0); assert.equal(secondsLeft(-5, 30), 30);
assert.ok(!isExpired(29999, 30)); assert.ok(isExpired(30000, 30)); assert.ok(isExpired(40000, 30));
assert.equal(secondsUsed(12340, 30), 12.3); assert.equal(secondsUsed(99999, 30), 30); assert.equal(secondsUsed(-1, 30), 0);
assert.equal(clockText(30), '0:30'); assert.equal(clockText(5), '0:05'); assert.equal(clockText(125), '2:05');

// ---- remembered settings ---------------------------------------------------------------------------------------------------------------------------------------
assert.equal(EXAM_DEFAULTS.count, 50); assert.equal(EXAM_DEFAULTS.seconds, 30);
assert.deepEqual(sanitizeSettings(null), EXAM_DEFAULTS);
assert.deepEqual(sanitizeSettings({regions: [{region: 'nowhere', section: 'x'}], count: 'abc', seconds: -4}).regions, EXAM_DEFAULTS.regions, 'unknown regions fall back to all');
const odd = sanitizeSettings({regions: [{region: 'back', section: 'nonsense'}, {region: 'back', section: 'all'}, {region: 'heart', section: 'all'}], count: 5000, seconds: 1});
assert.deepEqual(odd.regions.map(r => r.region), ['back', 'heart']); assert.equal(odd.regions[0].section, 'all'); assert.equal(odd.count, 200); assert.equal(odd.seconds, 5);
const store = new Map(), fake = {getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v)};
saveSettings({regions: [{region: 'thorax', section: 'all'}], count: 20, seconds: 45}, fake);
assert.deepEqual(loadSettings(fake), {regions: [{region: 'thorax', section: 'all'}], count: 20, seconds: 45});
const broken = {getItem() {throw new Error('blocked');}, setItem() {throw new Error('blocked');}};
assert.deepEqual(loadSettings(broken), EXAM_DEFAULTS); saveSettings(EXAM_DEFAULTS, broken);
assert.deepEqual(loadSettings({getItem: () => '{not json'}), EXAM_DEFAULTS);

// ---- wiring ---------------------------------------------------------------------------------------------------------------------------------------------------
assert.equal(MOCK_EXAM_LABEL, '模擬考試', 'the site label (the word 跑考 is not allowed on the site)');
const read = f => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
assert.match(read('web/main.tsx'), /exam \? <ExamPage\/>/, 'the router shows the exam page at #/exam');
assert.match(read('app/quiz/exam.tsx'), /MockExamView/, 'the exam page mounts the exam');
assert.match(read('app/quiz/mode-nav.tsx'), new RegExp(`label: '${MOCK_EXAM_LABEL}'`), 'the mode tab uses the same label');
assert.ok(!/跑考/.test(read('app/quiz/mock-exam-view.tsx') + read('app/quiz/exam.tsx') + read('app/quiz/mode-nav.tsx')), 'no 跑考 in the shipped strings');

// ---- the real catalogues (when generated) --------------------------------------------------------------------------------------------------------------------
let real = 0, flaggedReal = 0, asked = 0;
for (const [id, def] of Object.entries(QUIZ_REGIONS)) {
  const file = new URL(`../public/models/${def.file}`, import.meta.url);
  if (!fs.existsSync(file)) continue;
  real++;
  const cat = JSON.parse(fs.readFileSync(file, 'utf8')), items = examPool([{region: id, catalogue: cat, section: 'all'}]);
  assert.ok(items.length > 0, `${id}: the exam has questions`);
  const ids = new Set(items.map(i => i.id));
  for (const s of cat.structures) if (s.availability?.exam === false) {flaggedReal++; assert.ok(!ids.has(s.id), `${id}: ${s.name} is flagged exam:false`);}
  for (const i of items) {
    asked++;
    assert.ok(i.structure.chinese, `${id}: ${i.structure.name} has a Chinese name`);
    // the structure's own names are accepted: English with the side, and Chinese
    assert.equal(gradeTyped(i.structure.name, i.structure, cat), 'correct', `${id}: ${i.structure.name} accepts its own English name`);
    assert.equal(gradeTyped(i.structure.chinese, i.structure, cat), 'correct', `${id}: ${i.structure.chinese} accepts its own Chinese name`);
  }
  for (const section of def.sections) assert.ok(examPool([{region: id, catalogue: cat, section: section.id}]).length <= items.length, `${id}/${section.id}: a section is a subset`);
}
console.log(`Mock exam: all checks passed (${pool.length} synthetic questions; ${real} real catalogues, ${asked} real questions, ${flaggedReal} exam:false structures excluded).`);
