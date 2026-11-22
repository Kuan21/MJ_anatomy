// Abdomen (and pelvis-and-perineum) quiz: the pool is complete and consistent. Needs public/models/quiz-abdomen.json and .sites-runtime/quiz-abdomen-report.json (node scripts/prepare-quiz.mjs).
// Rules: app/quiz/trunk.ts, documentation: docs/quiz-trunk.md. Prints counts only.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
const {QUIZ_REGIONS, QUIZ_REGION_IDS, QUIZ_CATEGORIES, categoryOf, regionOfHash, questionPool, sceneStructures, focusStructures} = await quizModule('app/quiz/catalogue.ts');
const {acceptedNames, normalize} = await quizModule('app/quiz/naming.ts');
const {structureCard} = await quizModule('app/quiz/card.ts');
const {coversTrunkTarget, abdomenSection, abdomenExclusion, trunkNameClashes, TRUNK_EXCLUSION_REASONS} = await quizModule('app/quiz/trunk.ts');

// the words of the notes and of the Cantonese written language never appear in what the quiz shows
const BANNED = /共筆|筆記|跑考|課堂|嘅|唔|咗|冇|啲|嘢|佢|喺|咁|哋|乜|嚟|咩|俾|睇|嗰|喇|㗎/;
const regions = ['abdomen'].filter(id => QUIZ_REGIONS[id]);
assert.ok(regions.length, 'the abdomen is a quiz region');
let structuresTotal = 0;
for (const id of regions) {
  const region = QUIZ_REGIONS[id];
  assert.ok(QUIZ_REGION_IDS.includes(id)); assert.equal(regionOfHash(region.hash), id); assert.equal(region.file, `quiz-${id}.json`);
  const catalogue = JSON.parse(fs.readFileSync(`public/models/${region.file}`, 'utf8')), report = JSON.parse(fs.readFileSync(`.sites-runtime/quiz-${id}-report.json`, 'utf8'));
  assert.equal(catalogue.region, id);
  assert.equal(catalogue.structures.length, report.asked.length, `${id}: catalogue and report agree`);
  structuresTotal += catalogue.structures.length;
  const sectionIds = region.sections.filter(s => s.id !== 'all').map(s => s.id);

  // complete: every section and every category of the region has questions, every meshed structure renders, every structure is in a valid section
  for (const sec of sectionIds) assert.ok(catalogue.structures.some(s => s.sections.includes(sec)), `${id}/${sec}: the section has questions`);
  const categories = new Set(catalogue.structures.map(s => categoryOf(s)));
  for (const c of ['bone', 'muscle', 'nerve', 'artery', 'vein', 'organ', 'ligament']) assert.ok(categories.has(c), `${id}: category ${c} has questions`);
  for (const s of catalogue.structures) {
    assert.ok(s.meshIds.length, `${s.name}: has a mesh`);
    assert.equal(s.sections.length, 1, `${s.name}: one section`);
    assert.ok(sectionIds.includes(s.sections[0]), `${s.name}: valid section`);
    assert.ok(region.systems.includes(s.system), `${s.name}: system ${s.system} is offered by the region`);
  }

  // names: every structure has an English and a Chinese name, no duplicates, no one name for two structures, nothing of the notes or of Cantonese
  const keys = new Map();
  for (const s of catalogue.structures) {
    assert.ok(/[A-Za-z]/.test(s.name) && s.chinese && /[一-鿿]/.test(s.chinese) && !/[A-Za-z]/.test(s.chinese), `${s.name}: English and Chinese names`);
    assert.ok(!BANNED.test(s.name + s.chinese + JSON.stringify(s.aliases ?? {})), `${s.name}: no notes or Cantonese wording`);
    const k = `${s.system}|${s.side}|${s.name.toLowerCase()}`;
    assert.ok(!keys.has(k), `${s.name}: no duplicate structure`); keys.set(k, s);
    assert.ok(['left', 'right', 'midline'].includes(s.side));
  }
  assert.equal(trunkNameClashes(catalogue.structures).size, 0, `${id}: no name with two right answers`);
  // a name matches one structure: the accepted names of different structures of one system never overlap (left and right of one pair share a base name)
  const owner = new Map(), baseId = s => s.side === 'midline' ? s.name.toLowerCase() : s.name.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/\s+/g, ' ').trim();
  for (const s of catalogue.structures) {
    const acc = acceptedNames(s);
    for (const n of [...acc.en, ...acc.zh]) {
      const k = `${s.system}|${normalize(n, true)}`, mine = baseId(s), prev = owner.get(k);
      assert.ok(!prev || prev === mine, `${s.name}: accepted name "${n}" also belongs to ${prev}`);
      owner.set(k, mine);
    }
  }
  // cards: a card never shows the notes; a structure with a card shows only fields with text
  for (const s of catalogue.structures) {
    const card = structureCard(s);
    assert.ok(card.fields.every(f => f.zh || f.en), `${s.name}: card fields have text`);
    assert.ok(!BANNED.test(JSON.stringify(card)), `${s.name}: card has no notes or Cantonese wording`);
  }
  // layers: only organs have one; a deeper organ is covered by the shallower ones and never by itself
  const layered = catalogue.structures.filter(s => s.layer);
  assert.ok(layered.every(s => s.system === 'trunkorgan'));
  assert.ok(layered.length >= 10, `${id}: depth layers are set`);
  const deep = layered.find(s => s.layer === 'deep'), front = layered.find(s => s.layer === 'front');
  assert.ok(deep && front, 'front and deep organs exist');
  assert.ok(catalogue.structures.filter(s => /rectus sheath|linea alba/i.test(s.name)).every(s => s.layer === 'front'), 'the front wall is the front layer');
  assert.equal(coversTrunkTarget(deep, front), true); assert.equal(coversTrunkTarget(front, deep), false); assert.equal(coversTrunkTarget(deep, deep), false); assert.equal(coversTrunkTarget({}, front), false);

  // playable: every section × system gives a pool whose target is in the scene; the reduced scene keeps what a question needs
  for (const sec of region.sections) for (const system of region.systems) {
    const pool = questionPool(catalogue, {section: sec.id, side: 'both', systems: [system], count: 10});
    for (const t of pool.slice(0, 3)) {
      const scene = sceneStructures(catalogue, t, sec.id === 'all' ? t.sections[0] : sec.id, 'both');
      assert.ok(scene.some(s => s.id === t.id), `${t.name}: the target is in its scene`);
      assert.ok(focusStructures(scene, t, {count: 8}).some(s => s.id === t.id));
    }
  }
  // the exclusions all have a documented reason, and the report lists the asked structures by name
  assert.ok(report.excluded.every(e => TRUNK_EXCLUSION_REASONS[e.reason]), 'every exclusion has a documented reason');
  // the required-structure list: the quiz asks the structures that the site has, and counts what it does not
  assert.ok(report.requiredCoverage.required > 0 && report.requiredCoverage.asked.length + report.requiredCoverage.notAsked.length === report.requiredCoverage.required);
  assert.ok(report.requiredCoverage.asked.length >= 100, `${id}: the quiz covers the required structures the site has`);
  console.log(`Quiz ${id} passed: ${catalogue.structures.length} structures, ${sectionIds.length} sections, ${categories.size} categories, ${report.requiredCoverage.asked.length}/${report.requiredCoverage.required} required entries asked, ${report.excluded.length} excluded.`);
}
// the rules themselves
assert.equal(abdomenExclusion('Right lobe branch of right hepatic artery'), 'organ-detail');
assert.equal(abdomenExclusion('Left kidney'), null);
assert.equal(abdomenSection('Left kidney', 'trunkorgan'), 'retro');
assert.equal(abdomenSection('Right rectus abdominis', 'muscular'), 'wall');
assert.equal(abdomenSection('Celiac artery', 'arterial'), 'vessels');
assert.equal(abdomenSection('Left inferior epigastric artery', 'arterial'), 'wall');
assert.equal(abdomenSection('Spleen', 'trunkorgan'), 'hpbs');
assert.equal(QUIZ_CATEGORIES.some(c => c.id === 'organ'), true);
assert.equal(categoryOf({name: 'Rectus sheath', system: 'trunkorgan'}), 'ligament');
assert.equal(categoryOf({name: 'Aortic hiatus', system: 'trunkorgan'}), 'space');
assert.equal(categoryOf({name: 'Left kidney', system: 'trunkorgan'}), 'organ');
console.log(`Quiz trunk rules passed (${structuresTotal} structures in ${regions.length} region).`);
