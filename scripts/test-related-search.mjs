// Related search: names the site does not model as a structure of their own list the closest structures instead.
// Every target must exist in the search index; the data must stay out of the Quiz, the synonym tables and the structure cards.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {quizModule} from './quiz-modules.mjs';

const {buildSearchIndex, querySearchIndex} = await quizModule('app/mj-search.ts');
const {RELATED_ENTRIES, relatedFor, relatedResults, RELATED_NOTE_ZH, RELATED_NOTE_EN, relatedRows, isCerebellar, CEREBELLAR_TAG_ZH, CEREBELLAR_TAG_EN} = await quizModule('app/mj-related-search.ts');
const {structureProfile} = await quizModule('app/mj-structure-info.ts');
const {normalizeAtlasSystems} = await quizModule('app/mj-system-classifier.ts');
const {mergeAtlasStreams} = await quizModule('app/mj-facial-atlas.ts');
const models = new URL('../public/models/', import.meta.url), read = f => JSON.parse(gunzipSync(fs.readFileSync(new URL(f, models))));
const atlas = mergeAtlasStreams(normalizeAtlasSystems(read('atlas-stream.json.gz')), [read('facial/facial-stream.json.gz'), read('supplement/supplement-stream.json.gz')]);
const parts = new Map(atlas.parts.map(p => [p.id, p]));
const sources = atlas.concepts.map(c => {
  const p = c.elements.map(id => parts.get(id)).find(Boolean), profile = p ? structureProfile(c.name, p.system, p) : undefined;
  return {concept: c, english: profile?.english ?? c.name, chinese: profile?.chinese};
});
for (const x of read('search-extras.json.gz')) {
  const profile = structureProfile(x.n, x.s);
  sources.push({concept: {id: `extra:${x.k}:${x.raw ?? x.n}`, name: x.n, elements: []}, english: profile.english ?? x.n, chinese: x.z ?? profile.chinese, kind: x.k, group: x.g});
}
const index = buildSearchIndex(sources), byId = new Map(index.map(e => [e.concept.id, e]));

// data shape and every target exists on the site under the name given
assert.ok(RELATED_ENTRIES.length >= 9, 'related entries present');
const seenTerms = new Set();
for (const e of RELATED_ENTRIES) {
  for (const k of ['en', 'zh', 'reasonZh', 'reasonEn']) assert.ok(typeof e[k] === 'string' && e[k].trim(), `${e.en}: ${k}`);
  assert.ok(e.targets.length > 0, `${e.en}: has targets`);
  for (const t of e.targets) {
    const hit = byId.get(t.id);
    assert.ok(hit, `${e.en}: target ${t.id} exists in the model data`);
    assert.equal(hit.english.toLowerCase(), t.name.toLowerCase(), `${e.en}: target name ${t.id}`);
  }
  assert.equal(new Set(e.targets.map(t => t.id)).size, e.targets.length, `${e.en}: no duplicate targets`);
  for (const term of [e.en, e.zh, ...(e.more ?? [])]) {assert.ok(!seenTerms.has(term.toLowerCase()), `term used once: ${term}`); seenTerms.add(term.toLowerCase());}
  assert.ok(!/[A-Za-z]{6,}/.test(e.zh), `${e.en}: Chinese term has no Latin words`);
}

// behaviour: exact name (case / spaces / hyphens ignored), English or Chinese, shows the closest structures
for (const [q, ids] of [['uvula', ['FMA46733']], ['Uvula', ['FMA46733']], ['懸雍垂', ['FMA46733']], ['懸壅垂', ['FMA46733']], ['aryepiglottic fold', ['FMA46604', 'FMA46605']], ['Lacrimal ducts', ['FMA59555', 'FMA59582']], ['neural layer of retina', ['FMA58607']], ['cranium', ['FMA52734', 'FMA52735']], ['opening of carotid canal', ['FMA52738']], ['cerebral peduncle', ['FMA62394']], ['大腦腳', ['FMA62394']], ['soft palate', ['FMA46728', 'FMA46733']], ['軟顎', ['FMA46731']], ['Occipitofrontalis', ['FMA46759', 'FMA46761']], ['額枕肌', ['FMA46760']]]) {
  const r = relatedResults(index, q);
  assert.ok(r, `related result for ${q}`);
  for (const id of ids) assert.ok(r.entries.some(e => e.concept.id === id), `${q} shows ${id}`);
}
assert.equal(relatedFor('femur'), undefined);
assert.equal(relatedFor('   '), undefined);
assert.equal(relatedFor('uvu'), undefined, 'exact names only');
assert.ok(RELATED_NOTE_ZH.includes('站上沒有這個結構本身') && /not modeled on the site/.test(RELATED_NOTE_EN));
assert.ok(querySearchIndex(index, 'femur').length > 0, 'ordinary search unchanged');

// cerebellar structures: tagged from the brain model's own category, listed after the related results and the ordinary matches
const rowsFor = q => {const r = relatedResults(index, q); return r && relatedRows(r.entries, querySearchIndex(index, q, 50), 50);};
const vermis = byId.get([...byId.keys()].find(id => byId.get(id).english.toLowerCase() === 'uvula of vermis'));
assert.ok(vermis && isCerebellar(vermis), 'Uvula of vermis carries the cerebellum category');
assert.ok(!isCerebellar(byId.get('FMA46733')), 'Uvular muscle is not cerebellar');
assert.ok(index.some(e => e.english === 'Base of peduncle' ? !isCerebellar(e) : true), 'base of peduncle is not tagged');
for (const q of ['uvula', 'Uvula']) {
  const rows = rowsFor(q), at = rows.findIndex(e => e.concept.id === vermis.concept.id);
  assert.equal(rows[0].concept.id, 'FMA46733', `${q}: the related structure is first`);
  assert.ok(at > 0, `${q}: Uvula of vermis is still listed`);
  assert.ok(rows.slice(0, at).every(e => !isCerebellar(e)), `${q}: nothing cerebellar before the related and ordinary results`);
  assert.ok(rows.slice(at).every(isCerebellar), `${q}: cerebellar structures come last`);
}
assert.equal(CEREBELLAR_TAG_ZH, '小腦結構');
assert.equal(CEREBELLAR_TAG_EN, 'Cerebellar structure');
// other searches are unchanged: no related result, so the panel shows the ordinary list without tags
for (const q of ['femur', 'vermis', 'cerebellum']) assert.equal(relatedResults(index, q), undefined, `${q} is not a related search`);
const sample = relatedResults(index, 'uvula').entries;
assert.deepEqual(relatedRows(sample, [], 50), sample);
const src = fs.readFileSync('app/search-panel.tsx', 'utf8');
assert.ok(/related&&isCerebellar\(e\)/.test(src), 'the tag is shown only on a related search');

// the data is used only by the search panel: not by the Quiz, the synonym tables, the structure cards or the alias lists
const usesIt = f => /mj-related-search/.test(fs.readFileSync(f, 'utf8'));
const walk = d => fs.readdirSync(d, {withFileTypes: true}).flatMap(x => x.isDirectory() ? (x.name === 'node_modules' ? [] : walk(`${d}/${x.name}`)) : [`${d}/${x.name}`]);
const users = [...walk('app'), ...walk('scripts'), ...walk('docs')].filter(f => /\.(ts|tsx|mjs|json)$/.test(f) && !f.endsWith('mj-related-search.json') && !f.endsWith('mj-related-search.ts') && !f.endsWith('test-related-search.mjs') && usesIt(f));
assert.deepEqual(users, ['app/search-panel.tsx'], `only the search panel reads the related data: ${users.join(', ')}`);
const quizSources = walk('app/quiz');
assert.ok(quizSources.length > 0 && quizSources.every(f => !usesIt(f)), 'Quiz does not use related search');
for (const f of ['app/quiz/synonyms.ts', 'app/mj-structure-info.ts', 'docs/paokao-aliases.json']) if (fs.existsSync(f)) assert.ok(!usesIt(f), `${f} does not use related search`);
// no related term appears as a name or alias of the structures it points to: the terms are not in the quiz bank, the paokao aliases or the zh name tables
const aliasKeys = new Set(Object.keys(JSON.parse(fs.readFileSync('docs/paokao-aliases.json', 'utf8'))).map(k => k.toLowerCase()));
for (const e of RELATED_ENTRIES) for (const term of [e.en, ...(e.more ?? [])]) assert.ok(!aliasKeys.has(term.toLowerCase()), `${term} is not a formal alias`);
const cardsSrc = fs.readFileSync('app/mj-structure-info.ts', 'utf8');
for (const e of RELATED_ENTRIES) assert.ok(!cardsSrc.toLowerCase().includes(`'${e.en.toLowerCase()}'`), `${e.en} is not a card name`);
console.log(`related search ok: ${RELATED_ENTRIES.length} entries, ${RELATED_ENTRIES.reduce((n, e) => n + e.targets.length, 0)} targets`);
