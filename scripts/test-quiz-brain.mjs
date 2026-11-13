// Brain quiz (Quiz → 器官 → 腦): the pool, the sections, the categories, the exclusions and the answer cards.
//   node scripts/test-quiz-brain.mjs
// Needs public/models/quiz-brain.json and .sites-runtime/quiz-brain-report.json (node scripts/prepare-quiz.mjs). Rules: app/quiz/brain.ts, documentation: docs/quiz-brain.md.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';

const {QUIZ_REGIONS, QUIZ_REGION_IDS, QUIZ_CATEGORIES, QUIZ_SYSTEMS, categoryOf, questionPool, sceneStructures, regionOfHash} = await quizModule('app/quiz/catalogue.ts');
const {exclusionOf, nameCounts, namingPool} = await quizModule('app/quiz/level2.ts');
const {normalize, judgeName} = await quizModule('app/quiz/naming.ts');
const {structureCard} = await quizModule('app/quiz/card.ts');
const {buildLessons} = await quizModule('app/quiz/lessons.ts');
const {BRAIN_SECTION_GROUPS, BRAIN_EXCLUSION_REASONS, brainSectionOf, brainLayerOf, coversBrainTarget, brainSystemOf, PERIPHERAL_NERVE} = await quizModule('app/quiz/brain.ts');
const {BRAIN_GROUPS} = await quizModule('app/organ/brain-catalogue.ts');
const {SCHEMATIC} = await quizModule('app/organ/brain-schematic.ts');

const region = QUIZ_REGIONS.brain;
assert.ok(region && QUIZ_REGION_IDS.includes('brain'), 'the brain is a quiz region');
assert.equal(regionOfHash('#/quiz/brain'), 'brain');
assert.deepEqual(region.systems, ['brain', 'nervous', 'arterial', 'venous']);
assert.ok(QUIZ_SYSTEMS.some(s => s.id === 'brain'));

// ---- sections: every group of the brain viewer is in exactly one section or is documented as not asked
const sectionIds = region.sections.filter(s => s.id !== 'all').map(s => s.id);
assert.deepEqual(Object.keys(BRAIN_SECTION_GROUPS), sectionIds, 'the section list and the group table agree (same ids, same order)');
const grouped = Object.values(BRAIN_SECTION_GROUPS).flat();
assert.equal(new Set(grouped).size, grouped.length, 'a group is in one section only');
for (const g of BRAIN_GROUPS) assert.ok(grouped.includes(g.id) || g.id === 'meninges', `group ${g.id} has a section (or is the meninges, which is not asked)`);
for (const id of grouped) assert.ok(BRAIN_GROUPS.some(g => g.id === id), `section group ${id} is a group of the brain viewer`);
assert.equal(brainSectionOf('meninges'), undefined);
assert.equal(region.sections[0].id, 'all');

// ---- the generated pool
const catalogue = JSON.parse(fs.readFileSync('public/models/quiz-brain.json', 'utf8'));
const report = JSON.parse(fs.readFileSync('.sites-runtime/quiz-brain-report.json', 'utf8'));
assert.equal(catalogue.region, 'brain');
const counts = nameCounts(catalogue), byCategory = {};
const seenIds = new Set();
for (const s of catalogue.structures) {
  assert.ok(!seenIds.has(s.id), `${s.name}: duplicate structure id`); seenIds.add(s.id);
  assert.ok(s.chinese && /[㐀-鿿]/.test(s.chinese), `${s.name}: has a Chinese name`);
  assert.equal(exclusionOf(s, counts), null, `${s.name}: passes the level-2 identity rule (exclusionOf / nameCounts)`);
  assert.equal(s.sections.length, 1, `${s.name}: in exactly one section`);
  assert.ok(sectionIds.includes(s.sections[0]), `${s.name}: section ${s.sections[0]} exists`);
  assert.equal(s.source, 'Brain Project');
  assert.ok(s.layer, `${s.name}: has a layer`);
  const system = brainSystemOf(Object.entries(BRAIN_SECTION_GROUPS).find(([id]) => id === s.sections[0])[1][0]);
  // the system follows the section's group kind: cranial → nerve, vessels → artery / vein, the rest → brain structures
  if (s.sections[0] === 'cranial') assert.equal(s.system, 'nervous'); else if (s.sections[0] === 'vessels') assert.ok(['arterial', 'venous'].includes(s.system)); else assert.equal(s.system, 'brain'), assert.equal(system, 'brain');
  const category = categoryOf(s);
  assert.ok(['organ', 'nerve', 'artery', 'vein'].includes(category), `${s.name}: category ${category}`);
  byCategory[category] = (byCategory[category] ?? 0) + 1;
  assert.deepEqual(s.id.split(':')[0], s.system, `${s.name}: structure id starts with its system`);
  assert.ok(s.meshIds.length >= 1);
  assert.ok(catalogue.packages.some(p => p.meshes.some(m => m.structureId === s.id)), `${s.name}: has a drawable mesh in a package`);
  // an answer card: the brain card's fields, or the explicit gap
  const card = structureCard(s);
  assert.equal(card.chinese, s.chinese); assert.equal(card.english, s.name);
  if (s.cardFields?.length) {
    assert.deepEqual(card.missing, []);
    for (const f of card.fields) assert.ok(f.label && f.zh?.trim(), `${s.name}: card field ${f.label} is not empty`);
  } else assert.deepEqual(card.missing, ['資料卡'], `${s.name}: no card is an explicit gap`);
}
// the names are unique once left/right is handled, also across systems and sides (a midline name never equals a paired one)
const bySide = new Map();
for (const s of catalogue.structures) {
  const key = normalize(s.name, false);
  const list = bySide.get(key) ?? bySide.set(key, []).get(key); list.push(s);
}
for (const list of bySide.values()) {
  const sides = list.map(s => s.side).sort().join(',');
  assert.ok(list.length === 1 || sides === 'left,right', `${list[0].name}: shares its name with ${list.slice(1).map(s => s.name).join(', ')}`);
}
const zhKeys = new Map();
for (const s of catalogue.structures) {
  const key = normalize(s.chinese, false), prior = zhKeys.get(key);
  assert.ok(!prior || (prior.side !== s.side && prior.side !== 'midline' && s.side !== 'midline'), `${s.name}: the Chinese name ${s.chinese} is also ${prior?.name}`);
  zhKeys.set(key, s);
}
// every structure is answered by its own name (English and Chinese), in the language of the setup
for (const s of catalogue.structures) {
  assert.equal(judgeName(s.name, s, {language: 'en', needSide: true}).result, 'correct', `${s.name}: English name is accepted`);
  assert.equal(judgeName(s.chinese, s, {language: 'zh', needSide: true}).result, 'correct', `${s.chinese}: Chinese name is accepted`);
}

// ---- the report: every node of the model is either asked or listed with a documented reason
assert.equal(report.asked.length, catalogue.structures.length);
for (const e of report.excluded) assert.ok(BRAIN_EXCLUSION_REASONS[e.reason], `${e.name}: reason ${e.reason} is documented`);
assert.deepEqual(Object.keys(report.reasons), Object.keys(BRAIN_EXCLUSION_REASONS));
const glb = fs.readFileSync('public/models/brain.glb'), nodes = JSON.parse(glb.subarray(20, 20 + glb.readUInt32LE(12))).nodes.filter(n => n.extras?.bx_label).length;
const fromModel = report.excluded.filter(e => e.reason !== 'schematic');
// the pool packs one structure per name+side, a structure may have several meshes
const meshes = catalogue.structures.reduce((n, s) => n + s.meshIds.length, 0);
assert.equal(meshes + fromModel.length, nodes, `${nodes} nodes of the model = ${meshes} asked meshes + ${fromModel.length} excluded`);
assert.equal(report.excluded.filter(e => e.reason === 'schematic').length, SCHEMATIC.length, 'every schematic structure of the brain viewer is listed as not asked');
assert.equal(report.excluded.filter(e => e.reason === 'meninges').length, 3, 'falx cerebri and the two tentoria');
assert.ok(report.excluded.filter(e => e.reason === 'peripheral-nerve').every(e => PERIPHERAL_NERVE.test(e.name.replace(/^(Left|Right) /, '').toLowerCase())));
for (const name of ['Left Buccal nerve', 'Falx cerebri', 'Anterior spinal artery']) assert.ok(report.excluded.some(e => e.name === name), `${name} is listed as excluded`);
assert.ok(fs.existsSync('docs/quiz-brain-pool.md') && fs.readFileSync('docs/quiz-brain-pool.md', 'utf8').includes('不出題的構造'), 'docs/quiz-brain-pool.md exists');

// ---- pool and scenes through the shared engine
const all = QUIZ_CATEGORIES.map(c => c.id);
const base = {section: 'all', side: 'both', systems: [], categories: all, count: 9999};
assert.equal(questionPool(catalogue, base).length, catalogue.structures.length);
assert.equal(namingPool(catalogue, base).length, catalogue.structures.length, 'levels 1, 2 and 3 hold the same questions');
for (const section of sectionIds) assert.ok(questionPool(catalogue, {...base, section}).length > 0, `section ${section} has questions`);
assert.equal(sectionIds.reduce((n, id) => n + questionPool(catalogue, {...base, section: id}).length, 0), catalogue.structures.length, 'the sections partition the pool');
for (const c of ['organ', 'nerve', 'artery', 'vein']) assert.ok(byCategory[c] > 0, `category ${c} has questions`);
for (const c of ['bone', 'muscle', 'tendon', 'ligament', 'joint', 'space']) assert.equal(byCategory[c] ?? 0, 0, `no ${c} questions in the brain`);
// a side chosen on the setup page keeps its own structures and the midline ones
for (const side of ['left', 'right']) for (const s of questionPool(catalogue, {...base, side})) assert.ok(s.side === side || s.side === 'midline');
// lessons (level 2) come from the same bank with no code change
for (const side of ['left', 'right', 'both']) {
  const lessons = buildLessons(catalogue, {...base, side}), ids = lessons.flatMap(l => l.ids);
  assert.equal(new Set(ids).size, ids.length); assert.equal(ids.length, questionPool(catalogue, {...base, side}).length);
  assert.ok(lessons.length > 5 && lessons.every(l => l.zh && l.en));
}
// every question can be drawn: the target, its side and the midline structures of the region are in the scene
const target = catalogue.structures.find(s => /caudate nucleus/i.test(s.name) && s.side === 'right');
const scene = sceneStructures(catalogue, target, 'all', 'right');
assert.ok(scene.some(s => s.id === target.id) && scene.every(s => s.side === 'right' || s.side === 'midline') && scene.every(s => s.system === 'brain'), 'a brain-structure question draws brain structures only (no vessels, no nerve roots)');
const artery = catalogue.structures.find(s => s.system === 'arterial' && s.side === 'midline');
assert.ok(sceneStructures(catalogue, artery, 'all', 'right').some(s => s.system === 'brain') && sceneStructures(catalogue, artery, 'all', 'right').some(s => s.system === 'arterial') && !sceneStructures(catalogue, artery, 'all', 'right').some(s => s.system === 'nervous'), 'a vessel question draws the brain faintly with the vessels');

// a question loads one side and only the structures it draws: never more than the 8 MB every other quiz stays under
let heaviest = 0;
for (const side of ['left', 'right', 'both']) for (const s of catalogue.structures) {
  const ids = new Set(sceneStructures(catalogue, s, 'all', side).map(x => x.id));
  const bytes = catalogue.packages.filter(p => p.meshes.some(m => ids.has(m.structureId))).reduce((n, p) => n + p.gzipBytes, 0);
  if (side !== 'both') heaviest = Math.max(heaviest, bytes);
}
assert.ok(heaviest < 8e6, `a one-sided brain question loads ${(heaviest / 1e6).toFixed(2)} MB compressed`);

// ---- deep structures are seen through glass: the layers and the cover rule
const byName = n => catalogue.structures.find(s => s.name === n);
for (const [name, layer] of [['Right Caudate nucleus', 'deep'], ['Right Hippocampus', 'deep'], ['Right Lateral ventricle', 'deep'], ['Third ventricle', 'deep'], ['Right Corticospinal tract', 'tract'], ['Corpus callosum', 'tract'], ['Right Red nucleus', 'deep'],
  ['Right Precentral gyrus', 'cortex'], ['Right Insula (Subcentral gyrus and ant. and post. sulci)', 'inset'], ['Right Pons', 'envelope'], ['Right Inferior cerebellar peduncle', 'tract']]) {
  const s = byName(name); assert.ok(s, `${name} is in the pool`); assert.equal(s.layer, layer, `${name}: layer`);
}
const cortex = byName('Right Precentral gyrus'), deep = byName('Right Caudate nucleus'), cerebellum = catalogue.structures.find(s => s.layer === 'cerebellum'), pons = byName('Right Pons'), insula = byName('Right Insula (Subcentral gyrus and ant. and post. sulci)');
assert.ok(coversBrainTarget(deep, cortex) && coversBrainTarget(deep, cerebellum) && coversBrainTarget(deep, pons) && coversBrainTarget(deep, insula), 'a deep target is seen through cortex, cerebellum and the wrapping solids');
assert.ok(!coversBrainTarget(deep, deep) && !coversBrainTarget(deep, byName('Right Putamen')), 'other deep structures stay solid');
const tract = byName('Right Corticospinal tract'), otherTract = byName('Right Arcuate fasciculus');
assert.ok(coversBrainTarget(deep, tract), 'the tracts that cross a nucleus are glass for it');
assert.ok(coversBrainTarget(tract, cortex) && coversBrainTarget(tract, pons) && !coversBrainTarget(tract, otherTract) && !coversBrainTarget(tract, deep), 'a tract is looked at through the cortex; other tracts and the nuclei stay solid');
assert.ok(coversBrainTarget(insula, cortex) && !coversBrainTarget(insula, cerebellum), 'buried cortex is seen through the surface cortex only');
assert.ok(!coversBrainTarget(cortex, deep) && !coversBrainTarget(cortex, cortex) && !coversBrainTarget(byName('Right Pons') && cerebellum, cortex), 'a surface target covers nothing');
assert.ok(!coversBrainTarget({layer: 'open'}, cortex) && !coversBrainTarget(undefined, cortex) && !coversBrainTarget(deep, {}));
assert.equal(brainLayerOf('basal', 'Putamen'), 'deep'); assert.equal(brainLayerOf('limbic', 'Hippocampus'), 'deep'); assert.equal(brainLayerOf('limbic', 'Precuneus'), 'cortex');
assert.equal(brainLayerOf('white', 'White matter of telencephalon'), 'envelope'); assert.equal(brainLayerOf('white', 'Fornix'), 'tract'); assert.equal(brainLayerOf('arteries', 'Basilar artery'), 'open');

// ---- the hub card and the region wiring
const hub = fs.readFileSync('app/quiz/hub.tsx', 'utf8');
assert.ok(/href=\{QUIZ_REGIONS\.brain\.hash\} data-part="brain"/.test(hub), 'the hub has a brain card');
assert.ok(!/腦等器官/.test(hub), 'the reserved organs card no longer promises the brain');
const lessonsSource = fs.readFileSync('app/quiz/lessons.ts', 'utf8');
assert.ok(!/brain/.test(lessonsSource), 'the lesson generator needs no brain-specific code');
console.log(`Brain quiz passed: ${catalogue.structures.length} structures (${new Set(catalogue.structures.map(s => normalize(s.name, false))).size} names) in ${sectionIds.length} sections; organ ${byCategory.organ}, nerve ${byCategory.nerve}, artery ${byCategory.artery}, vein ${byCategory.vein}; ${report.excluded.length} excluded with a documented reason; ${catalogue.structures.filter(s => !s.cardFields?.length).length} without a card (listed as gaps).`);
