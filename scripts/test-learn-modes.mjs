// 學習 / Quiz / 模擬考試 entrances: the learning-map rules (80% pass, unlock chain, saved progress, old stars) and the rule that the regions, the lessons and the categories come from the
// question data, so that a region added to the data shows up in all of the modes without further code. Only pass/fail and counts are printed.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import {quizModule} from './quiz-modules.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const cat = await quizModule('app/quiz/catalogue.ts');
const {QUIZ_REGIONS, QUIZ_CATEGORIES, orderedRegions, regionIds, learnHashOf, learnRegionOfHash, regionOfHash, isLearnHub, isExam, isQuizHub} = cat;
const lp = await quizModule('app/quiz/learn-progress.ts');
const old = await quizModule('app/quiz/lesson-progress.ts');
const {buildLessons} = await quizModule('app/quiz/lessons.ts');

// ---- pass rule
assert.equal(lp.PASS_RATE, 0.8);
assert.ok(lp.passes(8, 10) && lp.passes(4, 5) && !lp.passes(7, 10) && !lp.passes(6, 8) && lp.passes(7, 8) && !lp.passes(0, 0));
assert.equal(lp.percentOf(7, 8), 88);

// ---- unlock chain: the first lesson of a category is open, the others open when the one before is passed
const lessons = ['bone-1', 'bone-2', 'bone-3'].map(key => ({key, category: 'bone'}));
const keyOf = l => `r|all|all/${l.key}`;
let progress = {};
const states = () => lessons.map((_, i) => lp.stateOf(lessons, i, keyOf, progress));
assert.deepEqual(states(), ['current', 'locked', 'locked']);
progress = lp.recordTest(progress, keyOf(lessons[0]), 6, 8, '2026-11-15');
assert.equal(progress[keyOf(lessons[0])].passed, false);
assert.deepEqual(states(), ['current', 'locked', 'locked'], '75% does not unlock');
progress = lp.recordTest(progress, keyOf(lessons[0]), 7, 8, '2026-11-16');
assert.deepEqual(states(), ['passed', 'current', 'locked']);
progress = lp.recordTest(progress, keyOf(lessons[0]), 1, 8, '2026-11-17');
assert.ok(progress[keyOf(lessons[0])].passed && progress[keyOf(lessons[0])].best === 88 && progress[keyOf(lessons[0])].tries === 3, 'a worse later attempt keeps the pass and the best score');
assert.deepEqual(lessons.map((_, i) => lp.stateOf(lessons, i, keyOf, {}, true)), ['current', 'current', 'current'], 'unlock all');
assert.deepEqual(lp.needReview(['a', 'b', 'c'], new Set(['b', 'x'])), ['b']);

// ---- saved progress (browser storage, wrapped) and the older star results
const memory = new Map(), store = {getItem: k => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, v), removeItem: k => memory.delete(k)};
lp.saveProgress('r', progress, store);
assert.deepEqual(lp.loadProgress('r', store)[keyOf(lessons[0])].passed, true);
old.saveResults('r2', {'a/bone-1': {stars: 2, accuracy: 90, wpm: null, at: '2026-11-01'}, 'a/bone-2': {stars: 1, accuracy: 60, wpm: null, at: '2026-11-01'}}, store);
const migrated = lp.loadProgress('r2', store);
assert.ok(migrated['a/bone-1'].passed && !migrated['a/bone-2'], 'two or more stars count as passed; one star does not');
assert.deepEqual(lp.loadProgress('none', null), {}, 'no storage: nothing breaks');
lp.saveUnlockAll(true, store); assert.equal(lp.loadUnlockAll(store), true);
store.setItem('mj-learn:bad', '{oops'); assert.deepEqual(lp.loadProgress('bad', store), {});

// ---- routes
assert.ok(isLearnHub('#/learn') && isLearnHub('#/learn/') && !isLearnHub('#/learn/heart') && isExam('#/exam') && !isExam('#/quiz') && isQuizHub('#/quiz'));
for (const id of regionIds()) {
  assert.equal(learnRegionOfHash(learnHashOf(id)), id); assert.equal(regionOfHash(QUIZ_REGIONS[id].hash), id);
  assert.notEqual(learnHashOf(id), QUIZ_REGIONS[id].hash, 'learn and quiz are separate routes');
}

// ---- every region of the data has lessons in the map, and the categories on offer come from the data
const all = QUIZ_CATEGORIES.map(c => c.id), settingsOf = def => ({section: 'all', side: def.defaultSide ?? 'right', systems: [], categories: all, scope: 'all', count: 9999});
let counted = 0;
for (const def of orderedRegions()) {
  const file = path.join(root, 'public/models', def.file);
  if (!fs.existsSync(file)) continue;
  const lessonsOf = buildLessons(JSON.parse(fs.readFileSync(file, 'utf8')), settingsOf(def));
  assert.ok(lessonsOf.length > 0, `${def.id} has lessons`); counted++;
}
assert.ok(counted >= 1, 'at least one question catalogue was checked');

// ---- a region added to the data appears in the learning hub and the Quiz chooser, has a route and lessons (no list of regions to edit)
const source = def => def.file && fs.existsSync(path.join(root, 'public/models', def.file));
const donor = orderedRegions().find(source);
assert.ok(donor, 'a catalogue is needed for the test');
const FAKE = 'test-fake-region';
QUIZ_REGIONS[FAKE] = {...donor, id: FAKE, label: '測試區', english: 'Test region', hash: `#/quiz/${FAKE}`, group: undefined};
try {
  assert.ok(regionIds().includes(FAKE) && orderedRegions().at(-1).id === FAKE, 'a new region comes after the known ones');
  assert.equal(learnRegionOfHash(`#/learn/${FAKE}`), FAKE); assert.equal(regionOfHash(`#/quiz/${FAKE}`), FAKE);
  const fakeCatalogue = {...JSON.parse(fs.readFileSync(path.join(root, 'public/models', donor.file), 'utf8')), region: FAKE};
  const lessonsOf = buildLessons(fakeCatalogue, settingsOf(QUIZ_REGIONS[FAKE]));
  assert.ok(lessonsOf.length > 0, 'the new region has lessons');
  // the three pages are rendered with a tiny element harness
  const jsx = (type, props) => ({type, props: props ?? {}});
  const external = {react: {useEffect() {}, useMemo: f => f()}, 'react/jsx-runtime': {jsx, jsxs: jsx, Fragment: 'fragment'}, 'lucide-react': Object.fromEntries(['ArrowLeft', 'ChevronRight', 'Lock', 'Target', 'GraduationCap'].map(n => [n, n]))};
  const cache = new Map();
  const moduleFor = async key => {
    if (cache.has(key)) return cache.get(key);
    const exports = key.endsWith('/quiz/catalogue.ts') ? cat : key.endsWith('.json') ? {default: JSON.parse(fs.readFileSync(key, 'utf8'))} : key.endsWith('.css') ? {} : external[key];
    const mod = exports ? new vm.SyntheticModule(Object.keys(exports), function () {for (const [n, v] of Object.entries(exports)) this.setExport(n, v);})
      : new vm.SourceTextModule(ts.transpileModule(fs.readFileSync(key, 'utf8'), {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX}}).outputText, {identifier: key, importModuleDynamically: undefined});
    cache.set(key, mod); return mod;
  };
  const link = async (spec, ref) => {let key = spec; if (spec.startsWith('.')) {key = path.resolve(path.dirname(ref.identifier), spec); if (!fs.existsSync(key)) key += fs.existsSync(key + '.ts') ? '.ts' : '.tsx';} return moduleFor(key);};
  const all2 = n => Array.isArray(n) ? n.flatMap(all2) : !n || typeof n !== 'object' ? [] : [n, ...all2(n.props?.children)];
  const hrefs = async file => {
    const mod = await moduleFor(path.join(root, file)); await mod.link(link); await mod.evaluate();
    return all2(mod.namespace.default()).filter(n => n.type === 'a' && n.props['data-part']).map(n => [n.props['data-part'], n.props.href]);
  };
  const learn = await hrefs('app/quiz/learn-hub.tsx'), quiz = await hrefs('app/quiz/hub.tsx');
  assert.ok(learn.some(([id, href]) => id === FAKE && href === `#/learn/${FAKE}`), 'the learning hub lists the new region');
  assert.ok(quiz.some(([id, href]) => id === FAKE && href === `#/quiz/${FAKE}`), 'the Quiz chooser lists the new region');
  for (const id of regionIds().filter(i => i !== FAKE)) assert.ok(learn.some(([p]) => p === id) && quiz.some(([p]) => p === id), `${id} is in both choosers`);
} finally { delete QUIZ_REGIONS[FAKE]; }
assert.ok(!regionIds().includes(FAKE));

// ---- the exam entrance is on the same region data (checked again when the exam page exists)
const hubSource = fs.readFileSync(path.join(root, 'app/quiz/learn-hub.tsx'), 'utf8'), quizHubSource = fs.readFileSync(path.join(root, 'app/quiz/hub.tsx'), 'utf8');
for (const [name, src] of [['learn hub', hubSource], ['quiz chooser', quizHubSource]]) assert.ok(src.includes('orderedRegions()') && !/data-part="(?:heart|lung|brain)"/.test(src), `${name} builds its cards from the region data`);
// no study page names notes or the exam sources
for (const f of ['learn.tsx', 'learn-hub.tsx', 'mode-nav.tsx', 'exam.tsx', 'hub.tsx', 'page.tsx']) assert.ok(!/共筆|筆記|跑考摘要|課堂/.test(fs.readFileSync(path.join(root, 'app/quiz', f), 'utf8')), `${f}: no note wording`);
console.log(`Learn modes passed: 80% pass rule, unlock chain, saved progress and old star results, routes, ${counted} region catalogue(s) give lessons, a region added to the data appears in the learning hub and the Quiz chooser.`);
