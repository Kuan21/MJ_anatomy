// Quiz setup screen rules: multi-section pools, splitting the question count over regions, the remembered setup, the plan handed to the run page, and that a region added to the data is offered.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {quizModule} from './quiz-modules.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const cat = await quizModule('app/quiz/catalogue.ts'), setupMod = await quizModule('app/quiz/setup.ts');
const {QUIZ_REGIONS, orderedRegions, questionPool, regionIds, QUIZ_CATEGORIES} = cat;
const {splitCount, loadSetup, saveSetup, defaultSetup, settingsFor, planOf, poolFor, savePlan, loadPlan, MAX_COUNT} = setupMod;
const mem = () => {const m = new Map(); return {getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k), m};};

// ---- split of the question count
const sum = o => Object.values(o).reduce((a, b) => a + b, 0);
for (const total of [1, 3, 5, 10, 20, 37, 100]) {
  const sizes = {a: 120, b: 30, c: 9, d: 0}, out = splitCount(total, sizes), n = Math.min(total, 159);
  assert.equal(sum(out), n, `split ${total}`);
  for (const id of Object.keys(sizes)) assert.ok(out[id] <= sizes[id], `${id} never above its pool`);
  assert.equal(out.d, 0);
  if (total >= 3) assert.ok(out.a >= 1 && out.b >= 1 && out.c >= 1, 'each region with a pool is in when there is room');
}
assert.deepEqual(splitCount('all', {a: 5, b: 7}), {a: 5, b: 7});
assert.deepEqual(splitCount(1000, {a: 5, b: 7}), {a: 5, b: 7});
assert.deepEqual(splitCount(10, {a: 0}), {a: 0});

// ---- remembered setup
const store = mem();
let setup = {...defaultSetup(), regions: {'upper-limb': ['shoulder', 'arm'], thorax: ['all']}, categories: ['bone', 'nerve'], count: 'all', level: 3, side: 'both'};
saveSetup(setup, store);
assert.deepEqual(loadSetup(store), {...setup, language: 'any', needSide: false, scope: 'all', remember: true});
saveSetup({...setup, remember: false}, store);
assert.equal(store.getItem('mj-quiz-setup'), null, 'remember off forgets');
store.setItem('mj-quiz-setup', '{bad'); assert.deepEqual(loadSetup(store), defaultSetup());
store.setItem('mj-quiz-setup', JSON.stringify({regions: {nowhere: ['all'], 'upper-limb': ['ghost']}, categories: ['zzz'], count: -4, level: 7, side: 'up'}));
const cleaned = loadSetup(store);
assert.deepEqual(cleaned.regions, {'upper-limb': ['all']}, 'unknown region dropped; unknown sections become the whole region');
assert.deepEqual(cleaned.categories, QUIZ_CATEGORIES.map(c => c.id)); assert.equal(cleaned.count, 10); assert.equal(cleaned.level, 1); assert.equal(cleaned.side, 'right');
store.setItem('mj-quiz-setup', JSON.stringify({count: 99999})); assert.equal(loadSetup(store).count, MAX_COUNT);
assert.deepEqual(loadSetup(null), defaultSetup());

// ---- pools: several sections, categories, sides
const file = def => path.join(root, 'public/models', def.file);
const withFile = orderedRegions().filter(d => fs.existsSync(file(d)));
assert.ok(withFile.length >= 3);
const upper = JSON.parse(fs.readFileSync(file(QUIZ_REGIONS['upper-limb']), 'utf8'));
const all = QUIZ_CATEGORIES.map(c => c.id);
const base = {...defaultSetup(), side: 'both', categories: all};
const whole = poolFor(upper, {...base, regions: {'upper-limb': ['all']}}, 'upper-limb').length;
const shoulder = poolFor(upper, {...base, regions: {'upper-limb': ['shoulder']}}, 'upper-limb').length;
const arm = poolFor(upper, {...base, regions: {'upper-limb': ['arm']}}, 'upper-limb').length;
const both = poolFor(upper, {...base, regions: {'upper-limb': ['shoulder', 'arm']}}, 'upper-limb').length;
assert.ok(shoulder > 0 && arm > 0 && both >= Math.max(shoulder, arm) && both <= shoulder + arm && both < whole && whole === poolFor(upper, {...base, regions: {}}, 'upper-limb').length, `sections ${shoulder}/${arm}/${both}/${whole}`);
assert.equal(settingsFor({...base, regions: {'upper-limb': ['arm']}}, 'upper-limb').section, 'arm', 'one section keeps the scene on it');
assert.equal(settingsFor({...base, regions: {'upper-limb': ['shoulder', 'arm']}}, 'upper-limb').section, 'all', 'several sections show the whole region');
const bones = poolFor(upper, {...base, categories: ['bone'], regions: {'upper-limb': ['all']}}, 'upper-limb');
assert.ok(bones.length > 0 && bones.every(s => cat.categoryOf(s) === 'bone'));
assert.ok(poolFor(upper, {...base, side: 'right', regions: {}}, 'upper-limb').every(s => s.side !== 'left'));
assert.ok(poolFor(upper, {...base, level: 3, regions: {}}, 'upper-limb').length <= whole, 'level 2 (typing) pool is part of the level 1 pool');

// ---- plan
const plan = planOf({...base, count: 10, regions: {'upper-limb': ['all'], thorax: ['all'], back: ['all']}}, {'upper-limb': 500, thorax: 100, back: 100});
assert.deepEqual(plan.blocks.map(b => b.region), ['thorax', 'back', 'upper-limb'], 'blocks follow the order of the choosers');
assert.equal(plan.blocks.reduce((n, b) => n + b.count, 0), 10);
const s2 = mem(); savePlan(plan, s2); assert.deepEqual(loadPlan(s2), plan); assert.deepEqual(loadPlan(null), plan, 'kept in memory without storage');

// ---- a region added to the data is offered by the setup (regions are never listed here or in the page)
const FAKE = 'test-fake-region';
QUIZ_REGIONS[FAKE] = {...QUIZ_REGIONS['upper-limb'], id: FAKE, label: '測試區', hash: `#/quiz/${FAKE}`};
try {
  assert.ok(regionIds().includes(FAKE) && orderedRegions().at(-1).id === FAKE);
  assert.deepEqual(loadSetup({getItem: () => JSON.stringify({regions: {[FAKE]: ['arm']}}), setItem() {}, removeItem() {}}).regions, {[FAKE]: ['arm']}, 'the new region and its sections are accepted');
  const fakeCat = {...upper, region: FAKE};
  assert.ok(poolFor(fakeCat, {...base, regions: {[FAKE]: ['arm']}}, FAKE).length > 0);
  assert.ok(planOf({...base, count: 5, regions: {[FAKE]: ['all']}}, {[FAKE]: 50}).blocks.some(b => b.region === FAKE));
} finally { delete QUIZ_REGIONS[FAKE]; }
const page = fs.readFileSync(path.join(root, 'app/quiz/setup-page.tsx'), 'utf8');
assert.ok(page.includes('orderedRegions()') && !/'head-neck'|'upper-limb'|'lower-limb'/.test(page), 'the setup page names no region');
assert.ok(!/共筆|筆記|跑考摘要|課堂/.test(page + fs.readFileSync(path.join(root, 'app/quiz/run.tsx'), 'utf8')));
console.log(`Quiz setup passed: count split, remembered setup, multi-section pools (${shoulder}+${arm} -> ${both}), plan blocks, a region added to the data is offered.`);
