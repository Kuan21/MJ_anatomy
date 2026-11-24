// Eye quiz (Quiz → 器官 → 眼): the pool, the sections, the answer cards, the names (in both languages, against the required-structure list), the layers and the data hygiene.
//   node scripts/test-quiz-eye.mjs
// Needs public/models/quiz-eye.json and .sites-runtime/quiz-eye-report.json (node scripts/prepare-quiz.mjs). Catalogue and cards: app/mj-eye-atlas.ts and app/mj-eye-openings.ts.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';

const {QUIZ_REGIONS, QUIZ_REGION_IDS, QUIZ_SYSTEMS, categoryOf, questionPool, sceneStructures, regionOfHash, orderedRegions} = await quizModule('app/quiz/catalogue.ts');
const {namingPool, nameCounts, exclusionOf} = await quizModule('app/quiz/level2.ts');
const {judgeName, acceptedNames, normalize} = await quizModule('app/quiz/naming.ts');
const {structureCard} = await quizModule('app/quiz/card.ts');
const {buildLessons} = await quizModule('app/quiz/lessons.ts');
const {EYE_PARTS} = await quizModule('app/mj-eye-atlas.ts');
const {EYE_OPENINGS} = await quizModule('app/mj-eye-openings.ts');
const {coversEyeTarget, eyeLayerOf} = await quizModule('app/quiz/eye.ts');

const region = QUIZ_REGIONS.eye, SYSTEMS = region?.systems;
assert.ok(region && QUIZ_REGION_IDS.includes('eye'), 'the eye is a quiz region');
assert.equal(regionOfHash('#/quiz/eye'), 'eye');
assert.equal(region.atlasHash, '#/organ/eye');
assert.deepEqual(SYSTEMS, ['skeletal', 'muscular', 'nervous', 'arterial', 'eye', 'brain']);
assert.ok(QUIZ_SYSTEMS.some(s => s.id === 'eye'));
assert.deepEqual(region.sections.map(s => s.id), ['all', 'orbit', 'adnexa', 'muscles', 'nerves', 'visual', 'wall', 'retina', 'lens']);
const order = orderedRegions().map(r => r.id);
assert.equal(order[order.indexOf('brain') + 1], 'eye', 'the setup, learning and exam pages list the eye after the brain');
assert.equal(order[order.indexOf('eye') + 1], 'ear', 'and the ear after the eye');

const catalogue = JSON.parse(fs.readFileSync('public/models/quiz-eye.json', 'utf8')), report = JSON.parse(fs.readFileSync('.sites-runtime/quiz-eye-report.json', 'utf8'));
assert.equal(catalogue.region, 'eye');
// every structure of the eye model and every opening of the orbit is asked (nothing is left out silently)
const partCount = Object.keys(EYE_PARTS).length;
assert.equal(report.excluded.length, 0, 'every structure of the eye model has a mesh');
assert.equal(report.asked.length, partCount);
assert.equal(report.openings.length, EYE_OPENINGS.length, 'every opening of the orbit is a patch of bone surface');
assert.equal(catalogue.structures.length, partCount + EYE_OPENINGS.length);
const byName = new Map(catalogue.structures.map(s => [s.name, s]));
assert.equal(byName.size, catalogue.structures.length, 'no repeated name');
assert.equal(new Set(catalogue.structures.map(s => normalize(s.chinese, false))).size, catalogue.structures.length, 'no repeated Chinese name');
for (const p of Object.values(EYE_PARTS)) {
  const s = byName.get(p.name); assert.ok(s, `${p.name} is asked`);
  assert.equal(s.chinese, p.zh, `${p.name}: Chinese name of the eye model`);
  const card = structureCard(s);
  assert.deepEqual(card.fields.map(f => [f.zh, f.en]), [[p.textZh, p.text]], `${p.name}: the card is the eye card text`);
}
for (const o of EYE_OPENINGS) {
  const s = byName.get(o.name.replace(/ \(notch\)$/, '')); assert.ok(s, `${o.name} is asked`);
  assert.equal(s.chinese, o.zh); assert.equal(s.layer, 'opening'); assert.deepEqual(s.sections, ['orbit']);
  const card = structureCard(s); assert.equal(card.fields[0].zh, o.textZh);
  assert.equal(card.fields.length, 1 + (o.contents.length ? 1 : 0), `${o.name}: the structures that pass through`);
}
for (const o of report.openings) assert.ok(o.triangles >= 8, `${o.name}: the patch of bone surface has ${o.triangles} triangles`);

// names, sections, systems, categories
for (const s of catalogue.structures) {
  assert.equal(s.source, 'Eye atlas'); assert.equal(s.side, 'midline'); assert.equal(s.exactNames, true);
  assert.equal(s.sections.length, 1, `${s.name}: one section`); assert.ok(region.sections.some(x => x.id === s.sections[0] && x.id !== 'all'));
  assert.ok(SYSTEMS.includes(s.system), `${s.name}: system ${s.system}`);
  assert.equal(s.meshIds.length, 1);
  const card = structureCard(s);
  assert.ok(card.fields.length >= 1 && card.fields.every(f => f.zh && f.en), `${s.name}: card in both languages`); assert.equal(card.missing.length, 0);
}
const sys = name => byName.get(name).system, cat = name => categoryOf(byName.get(name));
assert.equal(cat('Frontal bone'), 'bone'); assert.equal(cat('Lateral rectus'), 'muscle'); assert.equal(cat('Levator palpebrae superioris'), 'muscle'); assert.equal(cat('Lacrimal nerve'), 'nerve'); assert.equal(cat('Ciliary ganglion'), 'nerve');
assert.equal(cat('Ophthalmic artery'), 'artery'); assert.equal(cat('Optic nerve'), 'nerve'); assert.equal(sys('Optic chiasm'), 'brain'); assert.equal(sys('Lateral geniculate body'), 'brain');
assert.equal(cat('Check ligament of lateral rectus'), 'ligament'); assert.equal(cat('Suspensory ligament of lens'), 'ligament'); assert.equal(cat('Common tendinous ring'), 'ligament');
assert.equal(cat('Optic canal'), 'space'); assert.equal(cat('Superior orbital fissure'), 'space'); assert.equal(cat('Infraorbital foramen'), 'space'); assert.equal(sys('Supraorbital foramen'), 'eye');
assert.equal(cat('Scleral venous sinus (Schlemm canal)'), 'organ'); assert.equal(categoryOf({name: 'x', system: 'eye'}), 'organ'); assert.equal(catalogue.structures.filter(s => categoryOf(s) === 'space').length, 7, 'the seven openings of the orbit');
assert.equal(cat('Cornea'), 'organ'); assert.equal(cat('Lens'), 'organ'); assert.equal(cat('Trochlea of superior oblique'), 'organ');
for (const [section, names] of Object.entries({
  orbit: ['Frontal bone', 'Optic canal'], adnexa: ['Lacrimal gland', 'Tarsal plate of upper eyelid'], muscles: ['Superior rectus', 'Common tendinous ring'], nerves: ['Nasociliary nerve', 'Ophthalmic artery'],
  visual: ['Optic nerve', 'Superior colliculus'], wall: ['Sclera', 'Ciliary body', 'Choroid', 'Trabecular meshwork'], retina: ['Retina', 'Fovea centralis'], lens: ['Lens', 'Vitreous body', 'Aqueous humor'],
})) for (const name of names) assert.deepEqual(byName.get(name).sections, [section], `${name}: section`);

// the pool: every section and category is playable, nothing from another region comes in
const base = {side: 'both', systems: SYSTEMS, count: 9999}, total = catalogue.structures.length;
assert.equal(questionPool(catalogue, {...base, section: 'all'}).length, total);
assert.equal(questionPool(catalogue, {...base, section: 'all', side: 'left'}).length, total, 'one eye: both sides of the setup page ask the same questions');
let inSections = 0;
for (const section of region.sections.slice(1)) {const n = questionPool(catalogue, {...base, section: section.id}).length; assert.ok(n >= 2, `section ${section.id}: ${n}`); inSections += n;}
assert.equal(inSections, total, 'every structure is in exactly one section');
const categories = new Set(catalogue.structures.map(s => categoryOf(s)));
assert.deepEqual([...categories].sort(), ['artery', 'bone', 'ligament', 'muscle', 'nerve', 'organ', 'space']);
for (const category of categories) assert.ok(questionPool(catalogue, {...base, section: 'all', categories: [category]}).length, `category ${category}`);
// level 3 and the guided lessons ask the same structures
assert.equal(namingPool(catalogue, {...base, section: 'all'}).length, total);
for (const s of catalogue.structures) assert.ok(!exclusionOf(s, nameCounts(catalogue)), `${s.name}: level 3`);
const lessons = buildLessons(catalogue, {...base, section: 'all'});
assert.equal(new Set(lessons.flatMap(l => l.ids)).size, total, 'every structure is in a lesson');
assert.equal(lessons.flatMap(l => l.ids).length, total, 'in exactly one lesson');
// a question draws the whole eye
assert.equal(sceneStructures(catalogue, byName.get('Fovea centralis'), 'retina', 'left').length, total);

// typed names: every structure is answered with its English or its Chinese name; brackets are optional; another structure's name is wrong
const sample = [...catalogue.structures];
for (const s of sample) {
  assert.equal(judgeName(s.name, s, {language: 'en', needSide: false}).result, 'correct', `${s.name}: English name`);
  assert.equal(judgeName(s.chinese, s, {language: 'zh', needSide: false}).result, 'correct', `${s.chinese}: Chinese name`);
  assert.equal(judgeName(s.name.replace(/\s*\([^)]*\)/, ''), s, {language: 'en', needSide: false}).result, 'correct', `${s.name}: without the bracket`);
  assert.notEqual(judgeName(s.name === 'Cornea' ? 'Sclera' : 'Cornea', s, {language: 'en', needSide: false}).result, 'correct');
}
// the wording of the required-structure list (docs/required-structures) is accepted for every structure it names, and a Chinese name that differs from it is only a second wording
const required = JSON.parse(fs.readFileSync('docs/required-structures/head-neck.json', 'utf8')).structures;
const plain = t => t.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z ]/g, ' ').replace(/\bmuscle\b/g, '').replace(/\s+/g, ' ').trim();
const requiredBy = new Map(required.map(r => [plain(r.en), r]));
let matched = 0; const differing = [];
for (const s of catalogue.structures) {
  const r = requiredBy.get(plain(s.name)); if (!r) continue;
  matched++;
  if (r.zh && normalize(r.zh, false) !== normalize(s.chinese, false)) {
    differing.push(`${s.name}: ${s.chinese} / ${r.zh}`);
    assert.ok(acceptedNames(s).zh.some(z => normalize(z, false) === normalize(r.zh, false)), `${s.name}: the required list writes ${r.zh}, which the quiz must accept`);
  }
}
assert.ok(matched >= 55, `${matched} structures of the eye model are on the required list`);

// what lies in front: the outer layers are glass while an inner structure is the question, never the other way round
const lay = name => byName.get(name);
assert.equal(lay('Frontal bone').layer, 'bone'); assert.equal(lay('Lacrimal gland').layer, 'adnexa'); assert.equal(lay('Superior rectus').layer, 'orbital'); assert.equal(lay('Optic nerve').layer, 'orbital'); assert.equal(lay('Sclera').layer, 'fibrous');
assert.equal(lay('Iris').layer, 'uveal'); assert.equal(lay('Choroid').layer, 'uveal'); assert.equal(lay('Retina').layer, 'inner'); assert.equal(lay('Lens').layer, 'inner'); assert.equal(lay('Fovea centralis').layer, 'landmark'); assert.equal(lay('Vitreous body').layer, 'media');
for (const s of catalogue.structures) if (s.layer !== 'opening') assert.equal(s.layer, eyeLayerOf(Object.values(EYE_PARTS).find(p => p.name === s.name).layer));
assert.ok(coversEyeTarget(lay('Retina'), lay('Frontal bone')) && coversEyeTarget(lay('Retina'), lay('Lateral rectus')) && coversEyeTarget(lay('Retina'), lay('Sclera')) && coversEyeTarget(lay('Retina'), lay('Choroid')) && coversEyeTarget(lay('Fovea centralis'), lay('Retina')));
assert.ok(!coversEyeTarget(lay('Frontal bone'), lay('Retina')) && !coversEyeTarget(lay('Sclera'), lay('Retina')) && !coversEyeTarget(lay('Lens'), lay('Retina')) && !coversEyeTarget(lay('Iris'), lay('Choroid')) && !coversEyeTarget(lay('Lateral rectus'), lay('Medial rectus')));
assert.ok(coversEyeTarget(lay('Lens'), lay('Vitreous body')) && coversEyeTarget(lay('Retina'), lay('Aqueous humor')) && coversEyeTarget(lay('Frontal bone'), lay('Vitreous body')) && !coversEyeTarget(lay('Aqueous humor'), lay('Vitreous body')));
assert.ok(coversEyeTarget(lay('Lateral rectus'), lay('Optic canal')) && !coversEyeTarget(lay('Frontal bone'), lay('Optic canal')) && coversEyeTarget(lay('Optic canal'), lay('Frontal bone')));
assert.equal(coversEyeTarget(undefined, lay('Retina')), false);

// data hygiene: no course-note wording, no Cantonese, Taiwan wording, nothing in a language it should not be in
const text = JSON.stringify(catalogue);
for (const word of ['共筆', '筆記', '跑考', '課堂', '考古題', '頁碼', '講義']) assert.ok(!text.includes(word), `the catalogue never says ${word}`);
assert.ok(!/[嘅咗嘢冇啲喺係乜咁哋嚟睇唔佢咩啱嗰俾攞噉嗮啫呢哂]/.test(JSON.stringify(catalogue.structures.map(s => [s.chinese, s.cardFields]))), 'no Cantonese character in the Chinese names or cards');
for (const s of catalogue.structures) {
  assert.ok(/[㐀-鿿]/.test(s.chinese) && !/[A-Za-z]{3}/.test(s.chinese), `${s.name}: Chinese name ${s.chinese}`);
  for (const f of s.cardFields) {assert.ok(/[㐀-鿿]/.test(f.zh), `${s.name}: ${f.label} is Chinese`); assert.ok(/[A-Za-z]{3}/.test(f.en), `${s.name}: ${f.label} has English`);}
}
console.log(`Eye quiz passed: ${total} structures (${partCount} of the eye model, ${EYE_OPENINGS.length} openings of the orbit) in 8 sections; ${matched} on the required list (${differing.length} with another Chinese wording, all accepted); cards, names, levels, lessons and layers consistent.`);
