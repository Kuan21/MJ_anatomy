// Level 2 (學習關卡): lesson generation, hints, stars, typing speed, spaced review and the L2 -> L3 mistakes migration.
// Only pass/fail and counts are printed. Needs the quiz catalogues (public/models/quiz-*.json, made by scripts/prepare-quiz.mjs).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {quizModule} from './quiz-modules.mjs';

const {QUIZ_REGIONS, QUIZ_CATEGORIES, categoryOf, inLessons} = await quizModule('app/quiz/catalogue.ts');
const {namingPool} = await quizModule('app/quiz/level2.ts');
const {structureCard} = await quizModule('app/quiz/card.ts');
const lessonsModule = await quizModule('app/quiz/lessons.ts');
const {buildLessons, chunkSizes, hintFor, byPosition, MIN_SIZE, MAX_SIZE} = lessonsModule;
const progress = await quizModule('app/quiz/lesson-progress.ts');
const mistakes = await quizModule('app/quiz/mistakes.ts');
const {seededRandom, seededShuffle} = await quizModule('app/quiz/seeded.ts');
const all = QUIZ_CATEGORIES.map(c => c.id);
const catalogueOf = def => JSON.parse(fs.readFileSync(`public/models/${def.file}`, 'utf8'));
const settingsOf = (section, side, categories = all, scope = 'all') => ({section, side, systems: [], categories, count: 9999, scope});

// ---- chunking ----
for (let n = 1; n <= 200; n++) {
  const sizes = chunkSizes(n, 8);
  assert.equal(sizes.reduce((a, b) => a + b, 0), n, `chunk sum ${n}`);
  assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1, `balanced ${n}`);
  if (n >= MIN_SIZE) assert.ok(Math.min(...sizes) >= MIN_SIZE && Math.max(...sizes) <= MAX_SIZE, `size range for ${n}: ${sizes}`);
}
assert.deepEqual(chunkSizes(0, 8), []);

// ---- lessons for every region ----
let lessonCount = 0, structureCount = 0;
const empty = [];
for (const [id, def] of Object.entries(QUIZ_REGIONS)) {
  const catalogue = catalogueOf(def);
  for (const side of ['both', 'right', 'left']) for (const section of def.sections) {
    // structures whose availability leaves the guided lessons out (the decussation of the superior cerebellar peduncles: level 3 only) are legitimately in NO lesson, so the lessons cover the pool minus them
    const settings = settingsOf(section.id, side), pool = namingPool(catalogue, settings).filter(inLessons);
    const lessons = buildLessons(catalogue, settings);
    // deterministic, and independent of the order of the catalogue file
    assert.deepEqual(buildLessons(catalogue, settings), lessons, `${id}/${section.id}/${side}: not deterministic`);
    const reversed = {...catalogue, structures: [...catalogue.structures].reverse()};
    assert.deepEqual(buildLessons(reversed, settings), lessons, `${id}/${section.id}/${side}: depends on catalogue order`);
    // every question-able structure that the lessons take (availability.lessons is not false) is in exactly one lesson, and nothing else is
    const seen = new Map();
    for (const l of lessons) for (const sid of l.ids) { assert.ok(!seen.has(sid), `${id}/${section.id}/${side}: ${sid} is in two lessons`); seen.set(sid, l.key); }
    assert.deepEqual([...seen.keys()].sort(), pool.map(s => s.id).sort(), `${id}/${section.id}/${side}: lessons do not cover the pool`);
    const byId = new Map(catalogue.structures.map(s => [s.id, s]));
    for (const category of all) {
      const inCategory = lessons.filter(l => l.category === category), members = pool.filter(s => categoryOf(s) === category);
      // one lesson is one category
      for (const l of inCategory) for (const sid of l.ids) assert.equal(categoryOf(byId.get(sid)), category, `${id}: lesson ${l.key} mixes categories`);
      assert.equal(inCategory.reduce((n, l) => n + l.ids.length, 0), members.length);
      // sizes: 4-12, except a category with fewer than 4 structures (one small lesson)
      for (const l of inCategory) assert.ok(members.length < MIN_SIZE ? l.ids.length === members.length : l.ids.length >= MIN_SIZE && l.ids.length <= MAX_SIZE, `${id}/${section.id}/${side}/${category}: lesson size ${l.ids.length} of ${members.length}`);
      assert.deepEqual(inCategory.map(l => l.number), inCategory.map((_, i) => i + 1));
      // ordered from the top of the body downwards across the lessons of a category
      const order = inCategory.flatMap(l => l.ids).map(sid => byId.get(sid));
      for (let i = 1; i < order.length; i++) assert.ok(byPosition(order[i - 1], order[i]) <= 0, `${id}/${category}: not ordered by position`);
      if (!members.length && section.id === 'all' && side === 'both') empty.push(`${def.label}/${category}`);
    }
    // the category filter only chooses which lessons are listed, never renumbers them
    for (const category of all) {
      const only = buildLessons(catalogue, settingsOf(section.id, side, [category]));
      assert.deepEqual(only, lessons.filter(l => l.category === category), `${id}: category filter changes the lessons`);
    }
    assert.deepEqual(buildLessons(catalogue, settingsOf(section.id, side, [])), []);
    lessonCount += lessons.length; structureCount += pool.length;
  }
}
assert.ok(lessonCount > 0 && structureCount > 0);

// ---- overrides: names, pin, target size ----
{
  const def = QUIZ_REGIONS['lower-limb'], catalogue = catalogueOf(def), settings = settingsOf('all', 'right');
  const base = buildLessons(catalogue, settings), muscles = base.filter(l => l.category === 'muscle');
  assert.ok(muscles.length >= 2, 'lower-limb muscles need more than one lesson');
  const named = buildLessons(catalogue, settings, {names: {'lower-limb/muscle-1': {en: 'Test lesson', zh: '測試關卡'}}});
  assert.equal(named.find(l => l.key === 'muscle-1').en, 'Test lesson'); assert.equal(named.find(l => l.key === 'muscle-1').zh, '測試關卡');
  assert.equal(named.find(l => l.key === 'muscle-2').en, base.find(l => l.key === 'muscle-2').en, 'other names stay generated');
  const byId = new Map(catalogue.structures.map(s => [s.id, s])), last = byId.get(muscles[muscles.length - 1].ids.at(-1));
  const pinned = buildLessons(catalogue, settings, {pin: {'lower-limb/muscle': [last.name]}});
  assert.equal(pinned.find(l => l.key === 'muscle-1').ids[0], last.id, 'pinned structure moves to the front');
  assert.deepEqual(pinned.flatMap(l => l.ids).sort(), base.flatMap(l => l.ids).sort(), 'pin never drops or duplicates a structure');
  const small = buildLessons(catalogue, settings, {target: 4});
  assert.ok(small.length > base.length, 'a smaller target gives more lessons');
  const real = JSON.parse(fs.readFileSync('app/data/quiz-lessons/overrides.json', 'utf8'));
  assert.ok(real.target >= 6 && real.target <= 10, 'default lesson size is about 6-10');
  // every name or pin in the override file must refer to something that exists
  for (const key of Object.keys(real.names ?? {})) { const [region, lesson] = key.split('/'); assert.ok(QUIZ_REGIONS[region] && /^[a-z]+-\d+$/.test(lesson), `bad override name key ${key}`); }
}

// ---- hints: nothing invented ----
{
  const s = {name: 'Rectus femoris', chinese: '股直肌'};
  const h = hintFor(s, [{label: '起點', zh: '髂前下棘；髖臼上緣'}, {label: '止點', zh: '髕骨'}]);
  assert.equal(h.letters, 'R… f…'); assert.equal(h.chinese, '股直肌'); assert.deepEqual(h.location, {label: '起點', text: '髂前下棘'});
  assert.equal(hintFor(s, []).location, undefined, 'no location field -> no location line');
  assert.equal(hintFor(s, [{label: '作用', zh: '屈髖'}]).location, undefined, 'only location-like fields are used');
  assert.equal(hintFor(s, [{label: '起點', zh: '股直肌的起點在髂骨'}]).location, undefined, 'a line that spells out the name is dropped');
  assert.equal(hintFor(s, [{label: '位置', en: 'English only'}]).location, undefined, 'empty Chinese text is not shown');
  assert.equal(hintFor(s, [{label: '起點', zh: 'a'.repeat(100)}]).location.text.length, 47);
  assert.match(hintFor(s, [], 'zh').chinese, /^股…/); assert.ok(!hintFor(s, [], 'zh').chinese.includes('直肌'), 'Chinese-only answers do not get the full Chinese name');
  assert.equal(hintFor({name: 'Femur', chinese: undefined}, []).chinese, undefined);
  // real cards: the location line, when there is one, comes from a card field
  let withLocation = 0, total = 0;
  const catalogue = catalogueOf(QUIZ_REGIONS['upper-limb']);
  for (const st of namingPool(catalogue, settingsOf('all', 'right')).slice(0, 80)) {
    const card = structureCard(st), hint = hintFor(st, card.fields), texts = card.fields.map(f => f.zh ?? '');
    total++;
    if (hint.location) { withLocation++; assert.ok(texts.some(t => t.includes(hint.location.text.replace(/…$/, ''))), `${st.name}: location line is not taken from the card`); }
  }
  assert.ok(withLocation > 0 && total > 0);
}

// ---- seeded views ----
{
  const a = seededRandom('lower-limb:x'), b = seededRandom('lower-limb:x'), c = seededRandom('lower-limb:y');
  const xs = Array.from({length: 8}, () => a()), ys = Array.from({length: 8}, () => b()), zs = Array.from({length: 8}, () => c());
  assert.deepEqual(xs, ys); assert.notDeepEqual(xs, zs);
  assert.deepEqual(seededShuffle([1, 2, 3, 4, 5, 6], 's'), seededShuffle([1, 2, 3, 4, 5, 6], 's'));
  assert.deepEqual([...seededShuffle([1, 2, 3, 4, 5, 6], 's')].sort(), [1, 2, 3, 4, 5, 6]);
  const viewer = fs.readFileSync('app/quiz/viewer.ts', 'utf8');
  assert.match(viewer, /lesson\?: \{seed: string; apart: boolean\}/); assert.match(viewer, /avoid/);
  const page = fs.readFileSync('app/quiz/lesson-mode.tsx', 'utf8');
  assert.match(page, /apart: round === 3/, 'round 3 asks for a different view'); assert.ok(!/apart: round === [12]/.test(page));
}

// ---- stars ----
{
  const {starsFor, STAR_RULES} = progress;
  assert.equal(starsFor({round3Total: 8, round3Correct: 8, wrongs: 0}), 3);
  assert.equal(starsFor({round3Total: 8, round3Correct: 8, wrongs: STAR_RULES.three.maxWrongs}), 3);
  assert.equal(starsFor({round3Total: 8, round3Correct: 8, wrongs: STAR_RULES.three.maxWrongs + 1}), 2, 'many wrong answers in round 2 cost the third star');
  assert.equal(starsFor({round3Total: 10, round3Correct: 8, wrongs: 2}), 2);
  assert.equal(starsFor({round3Total: 10, round3Correct: 7, wrongs: 3}), 1);
  assert.equal(starsFor({round3Total: 10, round3Correct: 5, wrongs: 5}), 1);
  assert.equal(starsFor({round3Total: 10, round3Correct: 4, wrongs: 6}), 0);
  assert.equal(starsFor({round3Total: 0, round3Correct: 0, wrongs: 0}), 0);
  // results keep the best stars; the summary text
  let r = {}; r = progress.recordResult(r, 'a', {stars: 3, accuracy: 100, wpm: 30, at: '2026-01-01'}); r = progress.recordResult(r, 'a', {stars: 1, accuracy: 60, wpm: 20, at: '2026-01-02'});
  assert.equal(r.a.stars, 3, 'a worse later attempt keeps the best stars'); assert.equal(r.a.accuracy, 60);
  r = progress.recordResult(r, 'b', {stars: 0, accuracy: 20, wpm: null, at: '2026-01-02'});
  assert.equal(progress.summarise(['a', 'b', 'c'], r).text, '3 關 · 已通過 1 · ★ 3/9');
  assert.equal(progress.summarise([], {}).text, '0 關 · 已通過 0 · ★ 0/0');
}

// ---- typing speed ----
{
  const {typingSpeed, wordsOf, accuracyOf} = progress;
  assert.equal(wordsOf('Rectus femoris'), 'Rectusfemoris'.length / 5); assert.equal(wordsOf('股直肌'), 3);
  assert.equal(typingSpeed([{text: 'a'.repeat(50), ms: 60000}]), 10);
  assert.equal(typingSpeed([{text: 'a'.repeat(50), ms: 100}]), null, 'too short to measure');
  assert.equal(typingSpeed([]), null);
  assert.equal(accuracyOf(3, 4), 75); assert.equal(accuracyOf(0, 0), 0);
}

// ---- spaced review, with injected dates ----
{
  const {applyReview, dueIds, addDays, dayKey, REVIEW_DAYS} = progress;
  assert.deepEqual(REVIEW_DAYS, [1, 3, 7, 14, 30]);
  assert.equal(addDays('2026-11-12', 1), '2026-11-13'); assert.equal(addDays('2026-12-31', 1), '2027-01-01'); assert.equal(addDays('2028-02-28', 1), '2028-02-29'); assert.equal(addDays('2027-02-28', 1), '2027-03-01'); assert.equal(addDays('2026-01-31', 30), '2026-03-02');
  assert.equal(dayKey(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
  let s = {};
  s = applyReview(s, 'x', true, '2026-01-01');
  assert.deepEqual(s.x, {stage: 0, due: '2026-01-02'}, 'first correct answer: 1 day');
  assert.deepEqual(dueIds(s, '2026-01-01'), []); assert.deepEqual(dueIds(s, '2026-01-02'), ['x']);
  const same = applyReview(s, 'x', true, '2026-01-01');
  assert.equal(same, s, 'a correct answer before the due day changes nothing');
  const expected = [['2026-01-02', 1, '2026-01-05'], ['2026-01-05', 2, '2026-01-12'], ['2026-01-12', 3, '2026-01-26'], ['2026-01-26', 4, '2026-02-25'], ['2026-02-25', 4, '2026-03-27']];
  for (const [day, stage, due] of expected) { s = applyReview(s, 'x', true, day); assert.deepEqual(s.x, {stage, due}, `reviewed on ${day}`); }
  // intervals 1, 3, 7, 14, 30 days from the day of each review
  assert.deepEqual([addDays('2026-01-02', 3), addDays('2026-01-05', 7), addDays('2026-01-12', 14), addDays('2026-01-26', 30)], ['2026-01-05', '2026-01-12', '2026-01-26', '2026-02-25']);
  // a wrong answer goes back to 1 day, also for a structure never seen
  s = applyReview(s, 'x', false, '2026-03-27'); assert.deepEqual(s.x, {stage: 0, due: '2026-03-28'});
  s = applyReview(s, 'new', false, '2026-03-27'); assert.deepEqual(s.new, {stage: 0, due: '2026-03-28'});
  // late review: the next interval counts from the day it was reviewed
  s = applyReview({y: {stage: 1, due: '2026-01-05'}}, 'y', true, '2026-01-20'); assert.deepEqual(s.y, {stage: 2, due: '2026-01-27'});
  // due list: most overdue first, then by id; the input is not mutated
  const frozen = Object.freeze({b: {stage: 0, due: '2026-01-02'}, a: {stage: 0, due: '2026-01-02'}, c: {stage: 2, due: '2026-01-01'}, d: {stage: 1, due: '2026-02-01'}});
  assert.deepEqual(dueIds(frozen, '2026-01-10'), ['c', 'a', 'b']);
  // storage: a fake store, a broken store and no store
  const mem = new Map(), fake = {getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), removeItem: k => mem.delete(k)};
  progress.saveReview('lower-limb', s, fake); assert.deepEqual(progress.loadReview('lower-limb', fake), s);
  assert.deepEqual(progress.loadReview('upper-limb', fake), {});
  mem.set('mj-quiz-review:thorax', '{"a":{"stage":9,"due":"2026-01-01"},"b":{"stage":1,"due":"bad"},"c":5}'); assert.deepEqual(progress.loadReview('thorax', fake), {a: {stage: 4, due: '2026-01-01'}});
  mem.set('mj-quiz-review:back', 'not json'); assert.deepEqual(progress.loadReview('back', fake), {});
  const broken = {getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); }, removeItem() { throw Error('blocked'); }};
  assert.deepEqual(progress.loadReview('lower-limb', broken), {}); progress.saveReview('lower-limb', s, broken); assert.deepEqual(progress.loadResults('lower-limb', broken), {}); progress.saveResults('lower-limb', {}, broken);
  assert.deepEqual(progress.loadReview('lower-limb', null), {}); progress.saveReview('lower-limb', s, null); progress.saveResults('x', {}, null);
}

// ---- mistakes: levels are numbered 1, 2 (lessons), 3 (typed name); old L2 lists move to L3 once ----
{
  assert.equal(mistakes.scopeOf('lower-limb', 1), 'lower-limb:L1'); assert.equal(mistakes.scopeOf('lower-limb', 2), 'lower-limb:L2'); assert.equal(mistakes.scopeOf('lower-limb', 3), 'lower-limb:L3');
  const make = (initial = {}) => {
    const mem = new Map(Object.entries(initial));
    return {mem, getItem: k => mem.has(k) ? mem.get(k) : null, setItem: (k, v) => void mem.set(k, String(v)), removeItem: k => void mem.delete(k), key: i => [...mem.keys()][i] ?? null, get length() { return mem.size; }};
  };
  const store = make({'mj-quiz-mistakes:lower-limb:L2': '["a","b"]', 'mj-quiz-mistakes:thorax:L2': '["c"]', 'mj-quiz-mistakes:lower-limb:L1': '["z"]', 'mj-quiz-mistakes:heart:L3': '["h"]', 'unrelated': 'keep'});
  assert.equal(mistakes.migrateMistakes(store), 2);
  assert.deepEqual(mistakes.loadMistakes('lower-limb:L3', store), ['a', 'b']); assert.deepEqual(mistakes.loadMistakes('thorax:L3', store), ['c']);
  assert.equal(store.getItem('mj-quiz-mistakes:lower-limb:L2'), null, 'old key removed'); assert.equal(store.getItem('mj-quiz-mistakes:thorax:L2'), null);
  assert.deepEqual(mistakes.loadMistakes('lower-limb:L1', store), ['z'], 'level 1 untouched'); assert.deepEqual(mistakes.loadMistakes('heart:L3', store), ['h']); assert.equal(store.getItem('unrelated'), 'keep');
  // a second run moves nothing; a new level-2 (lessons) mistake stays under L2
  assert.equal(mistakes.migrateMistakes(store), 0);
  mistakes.addMistakes('lower-limb:L2', ['new'], [], store);
  assert.equal(mistakes.migrateMistakes(store), 0); assert.equal(mistakes.migrateMistakes(store), 0);
  assert.deepEqual(mistakes.loadMistakes('lower-limb:L2', store), ['new'], 'new lesson mistakes are not moved to L3'); assert.deepEqual(mistakes.loadMistakes('lower-limb:L3', store), ['a', 'b']);
  // an existing L3 list is merged, not overwritten
  const merge = make({'mj-quiz-mistakes:back:L2': '["x","y"]', 'mj-quiz-mistakes:back:L3': '["y","w"]'});
  mistakes.migrateMistakes(merge); assert.deepEqual(mistakes.loadMistakes('back:L3', merge).sort(), ['w', 'x', 'y']);
  // nothing to move, broken storage, no storage
  const none = make(); assert.equal(mistakes.migrateMistakes(none), 0); assert.equal(mistakes.migrateMistakes(none), 0);
  const throwing = {getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); }, removeItem() { throw Error('blocked'); }, key: () => null, length: 0};
  assert.equal(mistakes.migrateMistakes(throwing), 0); assert.equal(mistakes.migrateMistakes(null), 0); assert.deepEqual(mistakes.loadMistakes('x:L2', throwing), []);
  mistakes.saveMistakes('x:L2', ['a'], throwing); mistakes.saveMistakes('x:L2', ['a'], null);
  // a storage that refuses the marker loses nothing
  const refusing = make({'mj-quiz-mistakes:back:L2': '["x"]'}); refusing.setItem = () => { throw Error('full'); };
  assert.equal(mistakes.migrateMistakes(refusing), 0); assert.deepEqual(mistakes.loadMistakes('back:L2', refusing), ['x']);
}

console.log(`Quiz lessons passed: ${lessonCount} lessons over ${structureCount} structures in ${Object.keys(QUIZ_REGIONS).length} regions (deterministic, one lesson per structure, sizes ${MIN_SIZE}-${MAX_SIZE}), hints, stars, typing speed, spaced review and mistakes migration.`);
if (empty.length) console.log(`Categories with no lessons (no structures in the bank): ${empty.join(', ')}`);
