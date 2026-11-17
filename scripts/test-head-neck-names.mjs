// Unified head-and-neck names (app/mj-head-neck-names.json, decided in docs/quiz-head-neck-name-decisions.md):
//   - the data holds exactly the rows of the decision table (count check), the open owner decisions are not applied;
//   - renamed structures show the unified name; the other wording is found by the main search and accepted by the Quiz typing check;
//   - alias-only rows are found and accepted in both wordings; the 頜／頷 and 顎／腭 character forms find each other.
// Prints pass/fail and counts only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {quizModule} from './quiz-modules.mjs';

const root = new URL('../', import.meta.url);
const data = JSON.parse(fs.readFileSync(new URL('app/mj-head-neck-names.json', root), 'utf8'));

// 1. count check against the decision table
{
  const table = fs.readFileSync(new URL('docs/quiz-head-neck-name-decisions.md', root), 'utf8').split('\n')
    .filter(l => /^\| (同義異名|異體字或拼法|筆誤) \| /.test(l) && l.split('|').length >= 8 && l.split('|')[3].trim() !== '');
  assert.equal(data.rows.length, table.length, `rows in the data (${data.rows.length}) differ from rows in the table (${table.length})`);
  const applied = data.rows.filter(r => r.status === 'applied'), open = data.rows.filter(r => r.status === 'not-applied');
  assert.equal(applied.length + open.length, table.length);
  assert.deepEqual(open.map(r => r.id).sort(), ['354', '508'], 'the open owner decisions are exactly the two palatine artery rows');
  const by = k => applied.filter(r => r.display === k).length;
  assert.equal(by('renamed') + by('alias') + by('typo'), applied.length, 'every applied row has an effect');
  assert.equal(by('typo'), 27, 'typo rows');
  assert.equal(by('renamed'), 3, 'renamed rows');
  assert.equal(applied.length, 147, 'applied rows');
  for (const r of data.rows) for (const e of r.entries) { assert.ok(e.en && e.zh, `row ${r.id} has names`); assert.ok(!/[㐀-鿿]/.test(e.en), `row ${r.id} English name has no Chinese`); }
  // a typo is never kept as an alias
  for (const r of data.rows.filter(x => x.kind === 'typo')) for (const e of r.entries) for (const a of e.zhAliases) assert.ok(!/鄂|硬腱膜|視神經|內頸靜脈|下頷靜脈|錘鼓|上肩胛|顴骨莖突/.test(a), `typo kept as alias: row ${r.id}`);
}

const {buildSearchIndex, querySearchIndex} = await quizModule('app/mj-search.ts');
const {structureProfile} = await quizModule('app/mj-structure-info.ts');
const {judgeName, acceptedNames} = await quizModule('app/quiz/naming.ts');
const {normalizeAtlasSystems} = await quizModule('app/mj-system-classifier.ts');
const {mergeAtlasStreams} = await quizModule('app/mj-facial-atlas.ts');
const models = new URL('public/models/', root), read = f => JSON.parse(gunzipSync(fs.readFileSync(new URL(f, models))));
const atlas = mergeAtlasStreams(normalizeAtlasSystems(read('atlas-stream.json.gz')), [read('facial/facial-stream.json.gz'), read('supplement/supplement-stream.json.gz')]);
const parts = new Map(atlas.parts.map(p => [p.id, p]));
const sources = atlas.concepts.map(c => {
  const p = c.elements.map(id => parts.get(id)).find(Boolean), profile = p ? structureProfile(c.name, p.system, p) : undefined;
  return {concept: c, english: profile?.english ?? c.name, chinese: profile?.chinese};
});
for (const x of read('search-extras.json.gz')) {
  const profile = structureProfile(x.n, x.s);
  sources.push({concept: {id: `extra:${x.k}:${x.raw ?? x.n}`, name: x.n, elements: []}, english: profile.english ?? x.n, chinese: x.z ?? profile.chinese, kind: x.k});
}
const index = buildSearchIndex(sources);
const found = (query, english) => querySearchIndex(index, query, 200).some(e => e.english.toLowerCase().includes(english));
const shown = english => [...new Set(index.filter(e => e.english.toLowerCase().includes(english)).map(e => e.chinese))];

const quiz = JSON.parse(fs.readFileSync(new URL('quiz-head-neck.json', models), 'utf8')).structures;
const quizOf = name => { const s = quiz.find(x => x.name.toLowerCase() === name.toLowerCase()); assert.ok(s, `quiz structure ${name}`); return s; };
const any = {language: 'any', needSide: false};
const accepts = (structure, typed) => judgeName(typed, structure, any).result === 'correct';

// 2. renamed: the unified name is shown, the other wording is found and accepted
for (const [english, unified, others, quizName, quizTyped] of [
  ['submandibular gland', '頜下腺', ['頷下腺', '下頷下腺', '顎下腺', '下頜下腺'], 'Left submandibular gland', ['下頜下腺', '頷下腺', '下頷下腺', '顎下腺']],
  ['pineal gland', '松果體', ['松果腺', '松果體', 'pineal body'], null, []],
]) {
  assert.ok(shown(english).some(z => z?.includes(unified)), `${english} is shown as ${unified}`);
  for (const q of others) assert.ok(found(q, english), `search "${q}" finds ${english}`);
  if (quizName) { const s = quizOf(quizName); assert.ok(s.chinese.includes(unified), `Quiz shows ${unified}`); for (const t of quizTyped) assert.ok(accepts(s, '左' + t) || accepts(s, t), `Quiz accepts ${t}`); }
}
assert.ok(!shown('submandibular gland').some(z => /頷/.test(z ?? '')), 'the old display form is gone');

// 3. alias only: both wordings found by search and accepted by the Quiz typing check
for (const [english, queries, quizName, typed] of [
  ['great auricular nerve', ['大耳神經', '耳大神經', 'greater auricular nerve'], 'Left great auricular nerve', ['耳大神經', '大耳神經', 'Greater auricular nerve']],
  ['levator anguli oris', ['提嘴角肌', '提口角肌'], 'Left levator anguli oris', ['提口角肌', '提嘴角肌']],
  ['common tendinous ring', ['津氏環', '總腱環', 'annular ring'], 'Left common tendinous ring', ['總腱環', '津氏環', 'Annular ring']],
  ['stylohyoid ligament', ['莖舌骨韌帶', '莖突舌骨韌帶'], 'Left stylohyoid ligament', ['莖突舌骨韌帶', '莖舌骨韌帶']],
  ['pterygomandibular raphe', ['翼下頷縫', '翼下頜縫'], 'Left pterygomandibular raphe', ['翼下頷縫', '翼下頜縫']],
  ['superior branch of left oculomotor nerve', ['動眼神經上分支', '動眼神經上支'], 'Superior branch of left oculomotor nerve', ['動眼神經上支', '動眼神經上分支', 'Superior division of oculomotor nerve']],
]) {
  for (const q of queries) assert.ok(found(q, english.split(' of left ')[0]) || found(q, english), `search "${q}" finds ${english}`);
  const s = quizOf(quizName);
  for (const t of typed) assert.ok(accepts(s, t) || accepts(s, '左' + t), `Quiz accepts ${t} for ${quizName}`);
  assert.ok(!accepts(s, '腓總神經'), 'a different structure is still wrong');
}
// the character forms find each other
assert.ok(found('下頷下腺', 'submandibular gland') && found('下頜下腺', 'submandibular gland'));
assert.ok(accepts(quizOf('Left submandibular gland'), '左下頷下腺'));

// 4. typo rows: the correct name is the one shown, and it is the one found
for (const [english, unified] of [['internal carotid artery', '內頸動脈'], ['ophthalmic artery', '眼動脈'], ['ophthalmic nerve', '眼神經'], ['corrugator supercilii', '皺眉肌']]) {
  assert.ok(shown(english).some(z => z?.includes(unified)), `${english} is shown as ${unified}`);
  assert.ok(found(unified, english), `search finds ${english} by ${unified}`);
}
// an alias of one structure does not turn up another (the open palatine artery rows are not applied)
assert.ok(!found('大顎動脈', 'descending palatine'), 'no alias is invented for the open rows');
console.log(`Head-and-neck names OK: ${data.rows.length} rows (applied ${data.rows.filter(r => r.status === 'applied').length}, open ${data.rows.filter(r => r.status !== 'applied').length}).`);
