// Head-and-neck quiz (Quiz → 頭頸): the pool, the sections, the categories, the exclusions, the eye glass rule and the answer cards.
//   node scripts/test-quiz-headneck.mjs
// Needs public/models/quiz-head-neck.json and .sites-runtime/quiz-head-neck-report.json (node scripts/prepare-quiz.mjs). Rules: app/quiz/headneck.ts, documentation: docs/quiz-head-neck.md.
// Only counts are printed.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';

const {QUIZ_REGIONS, QUIZ_REGION_IDS, QUIZ_CATEGORIES, QUIZ_SYSTEMS, categoryOf, questionPool, sceneStructures, regionOfHash, askedAtLevel} = await quizModule('app/quiz/catalogue.ts');
const {exclusionOf, nameCounts, namingPool} = await quizModule('app/quiz/level2.ts');
const {normalize, judgeName} = await quizModule('app/quiz/naming.ts');
const {structureCard} = await quizModule('app/quiz/card.ts');
const {buildLessons} = await quizModule('app/quiz/lessons.ts');
const {HN_SECTIONS, HN_EXCLUSION_REASONS, HEADNECK_NERVES, headNeckSystem, headNeckSection, headNeckLayerOf, coversHeadNeckTarget, headNeckNameClashes} = await quizModule('app/quiz/headneck.ts');

const region = QUIZ_REGIONS['head-neck'];
assert.ok(region && QUIZ_REGION_IDS.includes('head-neck'), 'the head and neck is a quiz region');
assert.equal(regionOfHash('#/quiz/head-neck'), 'head-neck');
assert.equal(region.file, 'quiz-head-neck.json');
assert.ok(QUIZ_SYSTEMS.some(s => s.id === 'headorgan'));
const sectionIds = region.sections.filter(s => s.id !== 'all').map(s => s.id);
assert.deepEqual(sectionIds, [...HN_SECTIONS], 'the section list and the rule table agree (same ids, same order)');
assert.equal(region.sections[0].id, 'all');
for (const s of region.sections) assert.ok(/[㐀-鿿]/.test(s.label) && !/[A-Za-z]/.test(s.label), `${s.id}: the section label is Chinese`);

// ---- the generated pool
const catalogue = JSON.parse(fs.readFileSync('public/models/quiz-head-neck.json', 'utf8'));
const report = JSON.parse(fs.readFileSync('.sites-runtime/quiz-head-neck-report.json', 'utf8'));
assert.equal(catalogue.region, 'head-neck');
const counts = nameCounts(catalogue), byCategory = {}, bySection = {};
const seenIds = new Set();
const BRAIN_NAME = /gyrus|sulcus|cerebr|cerebell|lobe|ventricle|thalamus|caudate|putamen|pallidus|hippocamp|amygdala|colliculus|geniculate|commissure|fornix|capsule|midbrain|pons|medulla|callos|choroid plexus|aqueduct|falx|tentorium|pineal|pituitary/i;
for (const s of catalogue.structures) {
  assert.ok(!seenIds.has(s.id), `${s.name}: duplicate structure id`); seenIds.add(s.id);
  assert.ok(s.chinese && /[㐀-鿿]/.test(s.chinese), `${s.name}: has a Chinese name`);
  assert.ok(!/[A-Za-z]/.test(s.chinese), `${s.name}: the Chinese name has no Latin letters (${s.chinese})`);
  assert.ok(/^[A-Za-z]/.test(s.name) && !/[㐀-鿿]/.test(s.name), `${s.name}: the English name is English only`);
  assert.equal(exclusionOf(s, counts), null, `${s.name}: passes the level-3 identity rule`);
  assert.equal(s.sections.length, 1, `${s.name}: in exactly one section`);
  assert.ok(sectionIds.includes(s.sections[0]), `${s.name}: section ${s.sections[0]} exists`);
  bySection[s.sections[0]] = (bySection[s.sections[0]] ?? 0) + 1;
  assert.equal(s.sections[0], headNeckSection(s.name.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/\s+/g, ' ').trim(), s.system), `${s.name}: the section follows the rule`);
  assert.ok(!BRAIN_NAME.test(s.name.replace(/choroid$/i, '')) || /(?:eyeball|choroid|capsule of temporomandibular|tarsal)/i.test(s.name) || /articular capsule/i.test(s.name), `${s.name}: brain structures are not in this pool`);
  assert.ok(['skeletal', 'muscular', 'tendon', 'nervous', 'arterial', 'venous', 'headorgan', 'joint', 'space'].includes(s.system), `${s.name}: system ${s.system}`);
  assert.ok(['left', 'right', 'midline'].includes(s.side));
  // paired structures carry Left/Right in the English name and 左/右 in the Chinese name
  if (s.side !== 'midline' && s.system !== 'space') {
    assert.ok(/\b(left|right)\b/i.test(s.name), `${s.name}: a paired structure names its side`);
    assert.ok(s.chinese.startsWith(s.side === 'left' ? '左' : '右') || /[左右]/.test(s.chinese), `${s.name}: the Chinese name names the side (${s.chinese})`);
  }
  if (s.side === 'midline') assert.ok(!/\b(left|right)\b/i.test(s.name), `${s.name}: a midline structure has no side word`);
  const category = categoryOf(s);
  byCategory[category] = (byCategory[category] ?? 0) + 1;
  assert.ok(s.system === 'space' ? s.meshIds.length === 0 : s.meshIds.length >= 1);
  if (s.system !== 'space') assert.ok(catalogue.packages.some(p => p.meshes.some(m => m.structureId === s.id)), `${s.name}: has a drawable mesh in a package`);
  assert.equal(s.availability, undefined, `${s.name}: nothing in the head and neck is limited to some levels`);
  // an answer card: only existing data; a field without data stays empty and is listed as missing (shown as 尚無資料)
  const card = structureCard(s);
  assert.equal(card.chinese, s.chinese); assert.equal(card.english, s.name);
  for (const f of card.fields) assert.ok((f.zh || f.en)?.trim(), `${s.name}: card field ${f.label} is not empty`);
  if (s.system === 'headorgan') assert.deepEqual(card.missing, ['說明'], `${s.name}: no card text exists for it, so the card says 尚無資料`);
}
for (const id of sectionIds) assert.ok(bySection[id] > 0, `section ${id} has questions`);
for (const c of ['bone', 'muscle', 'nerve', 'artery', 'vein', 'ligament', 'organ']) assert.ok(byCategory[c] > 0, `category ${c} has questions`);
assert.equal(Object.values(byCategory).reduce((a, b) => a + b, 0), catalogue.structures.length, 'the categories partition the pool');

// the names are unique once left/right is handled, in English and in Chinese
const byName = new Map(), byZh = new Map();
for (const s of catalogue.structures) {
  const k = `${s.system}|${normalize(s.name, false)}`, list = byName.get(k) ?? byName.set(k, []).get(k); list.push(s);
  const z = normalize(s.chinese, false), zl = byZh.get(z) ?? byZh.set(z, []).get(z); zl.push(s);
}
for (const list of byName.values()) assert.ok(list.length === 1 || list.map(s => s.side).sort().join(',') === 'left,right', `${list[0].name}: shares its name with ${list.slice(1).map(s => s.name).join(', ')}`);
for (const list of byZh.values()) assert.ok(list.length === 1 || (list.length === 2 && list.map(s => s.side).sort().join(',') === 'left,right' && normalize(list[0].name, false) === normalize(list[1].name, false)), `${list[0].chinese}: one Chinese name on several structures`);
assert.equal(headNeckNameClashes(catalogue.structures).size, 0, 'no name clash is left in the pool');

// every structure is answered by its own name (English and Chinese), in the language of the setup
for (const s of catalogue.structures) {
  assert.equal(judgeName(s.name, s, {language: 'en', needSide: true}).result, 'correct', `${s.name}: English name is accepted`);
  assert.equal(judgeName(s.chinese, s, {language: 'zh', needSide: true}).result, 'correct', `${s.chinese}: Chinese name is accepted`);
}
// left and right are told apart: the name of the other side is not the right answer
for (const s of catalogue.structures.filter(x => x.side === 'left' && x.system !== 'space').slice(0, 60)) {
  const other = s.name.replace(/^Left /, 'Right ').replace(/\bleft\b/, 'right');
  assert.notEqual(judgeName(other, s, {language: 'en', needSide: true}).result, 'correct', `${s.name}: the right-side name is not accepted`);
}

// ---- what must be there (the structures the main site already has), and what must not
const names = new Set(catalogue.structures.map(s => s.name.toLowerCase()));
for (const must of ['mandible', 'occipital bone', 'hyoid bone', 'atlas', 'axis', 'tongue', 'thyroid cartilage', 'epiglottis', 'left sternocleidomastoid', 'right sternocleidomastoid', 'left masseter', 'left temporalis', 'left optic nerve (ii)', 'right facial nerve (vii)', 'left vagus nerve (x)', 'right hypoglossal nerve (xii)', 'left external carotid artery', 'right internal jugular vein', 'left vertebral artery', 'left sclera', 'right lens']) {
  const hit = names.has(must) || [...names].some(n => n.includes(must));
  assert.ok(hit, `missing ${must}`);
}
// the brain keeps its own quiz: nothing of the brain package is asked here
for (const s of catalogue.structures) assert.ok(!/gyrus|ventricle|thalamus|hippocampus|colliculus|corpus callosum|cerebral artery|basilar|circle of willis/i.test(s.name), `${s.name} belongs to the brain quiz`);
// the structures the neck-vessel package replaces are asked once, from that package
for (const side of ['Left', 'Right']) for (const n of ['common carotid artery', 'internal carotid artery', 'external carotid artery', 'internal jugular vein']) {
  const list = catalogue.structures.filter(s => s.name === `${side} ${n}`);
  assert.equal(list.length, 1, `${side} ${n} is asked once`);
  assert.ok(list[0].meshIds[0].startsWith('neckvessel:'), `${side} ${n} comes from the neck-vessel package`);
}
// the blocked intracranial overlay meshes never enter the pool (the nerve overlay holds brain pieces the site hides)
const blocked = JSON.parse(fs.readFileSync('app/biomechanics-v2/blocked-overlay-meshes.json', 'utf8')).names;
for (const n of blocked) assert.ok(!catalogue.structures.some(s => s.meshIds.some(id => id.includes(`:${n}:`))), `blocked mesh ${n} is in the pool`);

// ---- the pool follows the rules table
for (const [name, system, expected] of [['Frontal bone', 'skeletal', 'skeletal'], ['Left first secondary molar tooth', 'skeletal', 'headorgan'], ['Left cerebral thing', 'nervous', null], ['Left optic nerve', 'nervous', 'nervous'], ['Pituitary gland', 'endocrine', null], ['Left common carotid artery', 'arterial', null], ['Left vertebral artery', 'arterial', 'arterial'], ['Hair of head', 'integumentary', null], ['External ear', 'sensory', null], ['Left lacrimal bone', 'sensory', 'skeletal'], ['Left inferior nasal concha', 'respiratory', 'skeletal'], ['Left stylohyoid ligament', 'connective', 'headorgan'], ['Intervertebral disk of axis', 'connective', 'skeletal']]) {
  const d = headNeckSystem(name, system);
  assert.equal('system' in d ? d.system : null, expected, `${name} (${system})`);
}
// ---- every exclusion has a documented reason; the report and the catalogue agree
assert.equal(report.asked.length, catalogue.structures.length);
for (const e of report.excluded) assert.ok(HN_EXCLUSION_REASONS[e.reason], `${e.name}: reason ${e.reason} is documented`);
assert.deepEqual(Object.keys(report.reasons), Object.keys(HN_EXCLUSION_REASONS));
for (const e of report.excluded) assert.ok(!names.has(e.name.toLowerCase()) || e.reason === 'name-not-unique' || e.reason === 'duplicate-source' || e.reason === 'replaced-by-neck-vessel', `${e.name}: is both asked and excluded`);
assert.ok(report.excluded.some(e => e.reason === 'in-brain-region'), 'the brain structures of the atlas are listed as not asked');
assert.ok(report.excluded.some(e => e.reason === 'replaced-by-neck-vessel'));
assert.ok(report.excluded.some(e => e.reason === 'left-right-merged'));
// the cranial nerve table: every nerve is on both sides and the Chinese names are the table's
for (const [key, def] of Object.entries(HEADNECK_NERVES)) {
  for (const [side, word, zh] of [['Left', 'left', '左'], ['Right', 'right', '右']]) {
    const s = catalogue.structures.find(x => x.system === 'nervous' && x.name.toLowerCase() === `${word} ${key}`);
    assert.ok(s, `${side} ${key} is asked`);
    assert.equal(s.chinese, zh + def.zh);
  }
}

// ---- the eye: inner parts are looked at through the outer coats of the same eye, nothing else is glass
{
  const eye = n => catalogue.structures.find(s => s.name === n);
  const sclera = eye('Left sclera'), cornea = eye('Left cornea'), lens = eye('Left lens'), vitreous = eye('Left vitreous body'), rightLens = eye('Right lens'), rightSclera = eye('Right sclera');
  for (const s of [sclera, cornea, lens, vitreous, rightLens, rightSclera]) assert.ok(s?.layer, `${s?.name}: has an eye layer`);
  assert.ok(coversHeadNeckTarget(lens, sclera) && coversHeadNeckTarget(lens, cornea) && coversHeadNeckTarget(lens, vitreous), 'the lens is seen through the sclera, the cornea and the vitreous body');
  assert.ok(coversHeadNeckTarget(vitreous, sclera) && !coversHeadNeckTarget(vitreous, lens), 'the vitreous body is seen through the sclera, not through the lens');
  assert.ok(!coversHeadNeckTarget(sclera, lens) && !coversHeadNeckTarget(sclera, cornea), 'the outer coat is never glass for itself');
  assert.ok(!coversHeadNeckTarget(lens, rightSclera), 'the other eye is not glass');
  const mandible = catalogue.structures.find(s => s.name === 'Mandible');
  assert.ok(!coversHeadNeckTarget(mandible, sclera) && !coversHeadNeckTarget(lens, mandible), 'only the eye has glass');
  assert.equal(headNeckLayerOf('lens'), 'eye-core'); assert.equal(headNeckLayerOf('mandible'), undefined);
  // the layer is drawn into the scene: a lens question draws the sclera (as glass in the viewer), and both eyes never mix with the other side
  const scene = sceneStructures(catalogue, lens, 'orbit', 'left');
  assert.ok(scene.some(s => s.id === sclera.id) && !scene.some(s => s.id === rightSclera.id));
}
// ---- the questions: every section × category × side is playable, level 1 and level 3 agree, the lessons hold the same bank
const all = QUIZ_CATEGORIES.map(c => c.id);
for (const section of region.sections) for (const side of ['right', 'left', 'both']) {
  const settings = {section: section.id, side, systems: [], categories: all, count: 9999};
  const one = questionPool(catalogue, settings), three = namingPool(catalogue, settings);
  assert.equal(one.length, three.length, `${section.id}/${side}: levels 1 and 3 hold the same questions`);
  assert.equal(buildLessons(catalogue, settings).flatMap(l => l.ids).length, three.length, `${section.id}/${side}: the lessons hold the same bank`);
  for (const s of one) assert.ok(askedAtLevel(s, 1));
  if (section.id !== 'all') assert.ok(one.length > 0 || side !== 'both', `${section.id}: has questions`);
}
// a question's scene always contains the target and respects the side
for (const s of catalogue.structures) {
  const scene = sceneStructures(catalogue, s, s.sections[0], s.side === 'midline' ? 'both' : s.side);
  assert.ok(scene.some(x => x.id === s.id), `${s.name}: the scene draws the target`);
}
// ---- size: a question loads one system and the skeleton of its side(s); the largest single load stays within the budget
const MB = 1e6, bytes = (system, side) => catalogue.packages.filter(p => p.system === system && (p.side === side || p.side === 'midline')).reduce((n, p) => n + p.gzipBytes, 0);
let worst = 0;
for (const system of new Set(catalogue.structures.map(s => s.system))) for (const side of ['left', 'right']) worst = Math.max(worst, bytes(system, side) + (system === 'skeletal' ? 0 : bytes('skeletal', side)));
assert.ok(worst < 14 * MB, `the largest single load is ${(worst / MB).toFixed(1)} MB`);
console.log(`PASS quiz head and neck: ${catalogue.structures.length} structures in ${sectionIds.length} sections (${Object.entries(byCategory).map(([c, n]) => `${c} ${n}`).join(', ')}); ${report.excluded.length} excluded with a documented reason; names unique, sides named, eye glass rule, cards and levels consistent.`);
