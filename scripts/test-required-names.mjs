// HN-11: head-and-neck structures show the Chinese name of the required-structure list; the earlier site wording stays searchable and is accepted in typed answers.
//   - the shown name of each structure (search index, structure card profile) equals the required-list name;
//   - the earlier wording is no longer shown but still finds the structure;
//   - the table in app/mj-required-names.json agrees with docs/required-structures/head-neck.json.
// Prints pass/fail and counts only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {quizModule} from './quiz-modules.mjs';

const root = new URL('../', import.meta.url);
const required = new Map(JSON.parse(fs.readFileSync(new URL('docs/required-structures/head-neck.json', root), 'utf8')).structures.map(s => [s.en.toLowerCase(), s.zh]));
const rows = JSON.parse(fs.readFileSync(new URL('app/mj-required-names.json', root), 'utf8')).rows;
const names = rows.map(r => r.entries[0]), aliasOnly = new Set(rows.filter(r => r.display === 'alias').map(r => r.entries[0].en));
const all = names;
assert.equal(all.length, 33, 'HN-11 structures');
for (const n of all) {
  const want = required.get(n.en.toLowerCase());
  if (want && !aliasOnly.has(n.en)) assert.equal(n.zh, want, `${n.en}: shown name equals the required list`);
  for (const a of n.zhAliases) assert.notEqual(a, n.zh);
}

const {buildSearchIndex, querySearchIndex} = await quizModule('app/mj-search.ts');
const {structureProfile} = await quizModule('app/mj-structure-info.ts');
const {judgeName} = await quizModule('app/quiz/naming.ts');
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
const base = s => s.toLowerCase().replace(/^(left|right) /, '');
const side = zh => (zh ?? '').replace(/^[左右]/, '');
let checked = 0;
for (const n of all) {
  const hits = index.filter(e => base(e.english) === n.en.toLowerCase());
  if (!hits.length) continue; // the structure is not in the head-and-neck atlas (kept in the table for the Quiz and the detail modes)
  for (const h of hits) if (!aliasOnly.has(n.en)) assert.equal(side(h.chinese), n.zh, `${n.en}: search shows 「${h.chinese}」`);
  for (const a of n.zhAliases) assert.ok(querySearchIndex(index, a, 300).some(e => base(e.english) === n.en.toLowerCase()), `search 「${a}」 finds ${n.en}`);
  checked++;
}
assert.ok(checked >= 18, `only ${checked} structures found in the search index`);

// Quiz typed answers: the required wording and the earlier wording are both accepted
const quiz = ['quiz-head-neck.json', 'quiz-brain.json'].flatMap(f => JSON.parse(fs.readFileSync(new URL(f, models), 'utf8')).structures);
const any = {language: 'any', needSide: false};
let quizChecked = 0;
for (const n of all) {
  const s = quiz.find(x => base(x.name) === n.en.toLowerCase());
  if (!s) continue;
  if (!aliasOnly.has(n.en)) assert.equal(side(s.chinese), n.zh, `Quiz shows ${n.zh} for ${n.en}`);
  for (const t of [n.zh, ...n.zhAliases]) assert.ok(['', '左', '右'].some(p => judgeName(p + t, s, any).result === 'correct'), `Quiz accepts 「${t}」 for ${n.en}`);
  quizChecked++;
}
assert.ok(quizChecked >= 12, `only ${quizChecked} Quiz structures checked`);
// brain information cards (titles come from the card list, renamed by the same wording table)
const cards = Object.values(JSON.parse(fs.readFileSync(new URL('brain/neuro-cards.json', models), 'utf8')).cards);
const WORDING = Object.entries(JSON.parse(fs.readFileSync(new URL('app/mj-required-names.json', root), 'utf8')).wording);
for (const c of cards) for (const [old] of WORDING) assert.ok(!c.zh.replace('小腦橋腦角', '').includes(old), `brain card ${c.en}: title 「${c.zh}」 still has 「${old}」`);
const pons = cards.find(c => c.en === 'Pons');
assert.ok(pons && pons.zh === '腦橋' && (pons.aka ?? []).some(a => a.zh === '橋腦'), 'the pons card is 腦橋 with 橋腦 as an alias');
console.log(`Required names OK: ${all.length} structures, ${checked} in the search index, ${quizChecked} in the head-and-neck Quiz.`);
