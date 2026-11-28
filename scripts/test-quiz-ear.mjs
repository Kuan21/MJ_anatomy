// Ear quiz (Quiz → 器官 → 耳): the pool, the sections, the exclusions, the answer cards and the typed names.
//   node scripts/test-quiz-ear.mjs
// Needs public/models/quiz-ear.json and .sites-runtime/quiz-ear-report.json (node scripts/prepare-quiz.mjs). Catalogue and cards: app/mj-ear-atlas.ts.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';

const {QUIZ_REGIONS, QUIZ_REGION_IDS, QUIZ_SYSTEMS, categoryOf, questionPool, sceneStructures, regionOfHash} = await quizModule('app/quiz/catalogue.ts');
const {namingPool, nameCounts, exclusionOf} = await quizModule('app/quiz/level2.ts');
const {judgeName} = await quizModule('app/quiz/naming.ts');
const {structureCard} = await quizModule('app/quiz/card.ts');
const {buildLessons} = await quizModule('app/quiz/lessons.ts');
const {EAR_PARTS} = await quizModule('app/mj-ear-atlas.ts');
const {coversEarTarget, earLayerOf} = await quizModule('app/quiz/ear.ts');

const region = QUIZ_REGIONS.ear;
assert.ok(region && QUIZ_REGION_IDS.includes('ear'), 'the ear is a quiz region');
assert.equal(regionOfHash('#/quiz/ear'), 'ear');
assert.equal(region.atlasHash, '#/organ/ear');
assert.deepEqual(region.systems, ['skeletal', 'nervous', 'ear']);
assert.ok(QUIZ_SYSTEMS.some(s => s.id === 'ear'));
assert.deepEqual(region.sections.map(s => s.id), ['all', 'outer', 'middle', 'bony', 'membranous', 'nerves']);

const catalogue = JSON.parse(fs.readFileSync('public/models/quiz-ear.json', 'utf8')), report = JSON.parse(fs.readFileSync('.sites-runtime/quiz-ear-report.json', 'utf8'));
assert.equal(catalogue.region, 'ear');
// every structure of the ear catalogue is asked or excluded with a documented reason, and nothing else
const asked = new Set(catalogue.structures.map(s => s.name)), excluded = new Map(report.excluded.map(e => [e.name, e.reason]));
for (const p of EAR_PARTS) assert.ok(asked.has(p.en) !== excluded.has(p.en), `${p.en} is asked or excluded, not both`);
assert.equal(catalogue.structures.length, 22, '22 structures with a real mesh are asked');
for (const [name, reason] of excluded) assert.ok(report.reasons[reason], `${name}: reason ${reason}`);
assert.deepEqual([...new Set(report.excluded.map(e => e.reason))].sort(), ['bone-surface-mark', 'no-mesh', 'schematic']);
for (const p of EAR_PARTS) {
  if (!p.model) assert.equal(excluded.get(p.en), 'no-mesh', `${p.en} has no mesh`);
  else if (p.schematic) assert.equal(excluded.get(p.en), 'schematic', `${p.en} is a schematic tube`);
  else if (p.mark) assert.equal(excluded.get(p.en), 'bone-surface-mark', `${p.en} is a patch on a bone`);
}
// names, sections, systems, categories
const byName = new Map(EAR_PARTS.map(p => [p.en, p]));
for (const s of catalogue.structures) {
  const p = byName.get(s.name); assert.ok(p, s.name);
  assert.equal(s.chinese, p.zh); assert.equal(s.source, 'Ear atlas'); assert.equal(s.side, 'midline'); assert.equal(s.exactNames, true);
  assert.deepEqual(s.sections, [p.group], `${s.name}: section is its group`);
  assert.equal(s.system, ['malleus', 'incus', 'stapes'].includes(p.id) ? 'skeletal' : p.group === 'nerves' ? 'nervous' : 'ear');
  assert.equal(categoryOf(s), s.system === 'skeletal' ? 'bone' : s.system === 'nervous' ? 'nerve' : 'organ', `${s.name}: category`);
  assert.equal(s.meshIds.length, 1);
  // the card has the same fields as the ear card, in Chinese and English
  const card = structureCard(s);
  assert.deepEqual(card.fields.map(f => f.zh), s.cardFields.map(f => f.zh)); assert.ok(card.fields.length >= 3 && card.fields.every(f => f.zh && f.en), `${s.name}: card`);
  assert.equal(card.missing.length, 0);
  assert.equal(card.fields[0].zh, p.card.zh.loc); assert.equal(card.fields[1].en, p.card.en.fn);
}
// the pool: every section and category is playable, nothing from another region comes in
const all = questionPool(catalogue, {section: 'all', side: 'right', systems: ['skeletal', 'nervous', 'ear'], count: 10});
assert.equal(all.length, 22);
for (const section of region.sections.slice(1)) assert.ok(questionPool(catalogue, {section: section.id, side: 'both', systems: ['skeletal', 'nervous', 'ear'], count: 10}).length, `section ${section.id}`);
assert.equal(questionPool(catalogue, {section: 'all', side: 'left', systems: ['skeletal', 'nervous', 'ear'], count: 10}).length, 22, 'one ear: both sides of the setup page ask the same questions');
// level 3 and the guided lessons ask the same structures
assert.equal(namingPool(catalogue, {section: 'all', side: 'both', systems: ['skeletal', 'nervous', 'ear'], count: 9999}).length, 22);
for (const s of catalogue.structures) assert.ok(!exclusionOf(s, nameCounts(catalogue)), `${s.name}: level 3`);
const lessons = buildLessons(catalogue, {section: 'all', side: 'both', systems: ['skeletal', 'nervous', 'ear'], count: 9999});
assert.equal(new Set(lessons.flatMap(l => l.ids)).size, 22, 'every structure is in exactly one lesson');
assert.equal(lessons.flatMap(l => l.ids).length, 22);
// a question draws the whole ear
const target = catalogue.structures.find(s => s.name === 'Utricle');
assert.equal(sceneStructures(catalogue, target, 'membranous', 'right').length, 22);
// typed names: every structure is answered with its English or its Chinese name; brackets are optional
for (const s of catalogue.structures) {
  assert.equal(judgeName(s.name, s, {language: 'en', needSide: false}).result, 'correct', `${s.name}: English name`);
  assert.equal(judgeName(s.chinese, s, {language: 'zh', needSide: false}).result, 'correct', `${s.chinese}: Chinese name`);
  assert.equal(judgeName(s.name.replace(/\s*\([^)]*\)/, ''), s, {language: 'en', needSide: false}).result, 'correct', `${s.name}: without the bracket`);
  assert.notEqual(judgeName('Malleus' === s.name ? 'Incus' : 'Malleus', s, {language: 'en', needSide: false}).result, 'correct');
}
// what lies in front: the outer layers are glass while an inner structure is the question, never the other way round
const lay = name => catalogue.structures.find(s => s.name === name);
assert.equal(lay('Auricle').layer, 'auricle'); assert.equal(lay('Tympanic membrane').layer, 'membrane'); assert.equal(lay('Malleus').layer, 'ossicle'); assert.equal(lay('Vestibule').layer, 'bony'); assert.equal(lay('Utricle').layer, 'membranous'); assert.equal(lay('Cochlear nerve').layer, 'nerve');
assert.ok(catalogue.structures.every(s => s.layer && s.layer === earLayerOf(byName.get(s.name).id, byName.get(s.name).group)));
assert.ok(coversEarTarget(lay('Utricle'), lay('Auricle')) && coversEarTarget(lay('Utricle'), lay('Malleus')) && coversEarTarget(lay('Utricle'), lay('Vestibule')) && coversEarTarget(lay('Malleus'), lay('Tympanic membrane')));
assert.ok(!coversEarTarget(lay('Auricle'), lay('Utricle')) && !coversEarTarget(lay('Malleus'), lay('Incus')) && !coversEarTarget(lay('Malleus'), lay('Facial nerve (intratemporal part)')) && !coversEarTarget(lay('Vestibule'), lay('Scala vestibuli')));
// the setup and learning pages list the regions of the data, so the ear shows up there; the order is brain, eye, ear
const {orderedRegions} = await quizModule('app/quiz/catalogue.ts');
const order = orderedRegions().map(r => r.id);
assert.equal(order[order.indexOf('eye') + 1], 'ear');
console.log(`Ear quiz passed: ${catalogue.structures.length} structures in 5 sections; ${report.excluded.length} excluded with a documented reason (no mesh, schematic tube, patch on a bone); cards, names, levels and lessons consistent.`);
