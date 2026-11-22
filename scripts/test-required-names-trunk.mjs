// AB-07／PP-05: abdomen, pelvis, perineum (and the superior orbital fissure) show the Chinese name of the required-structure list;
// the earlier site wording stays searchable and is accepted in typed answers.
//   - the table app/mj-required-names-trunk.json agrees with docs/required-structures/abdomen.json and the pelvis list where they name the structure;
//   - the earlier wording no longer appears in site source strings (aliases tables excepted);
//   - search shows the list name and finds the earlier wording; Quiz structures show the list name and accept both.
// Prints pass/fail and counts only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {quizModule} from './quiz-modules.mjs';

const root = new URL('../', import.meta.url), rootPath = fileURLToPath(root);
const rows = JSON.parse(fs.readFileSync(new URL('app/mj-required-names-trunk.json', root), 'utf8')).rows;
const renamed = rows.filter(r => r.display === 'renamed').map(r => r.entries[0]);
const aliasOnly = rows.filter(r => r.display === 'alias').map(r => r.entries[0]);
assert.ok(renamed.length >= 50, `renamed rows: ${renamed.length}`);

// 1. the table follows the required lists
const required = [...JSON.parse(fs.readFileSync(new URL('docs/required-structures/abdomen.json', root), 'utf8')).structures.map(s => s.zh)];
required.push(...JSON.parse(fs.readFileSync(new URL('docs/required-structures/head-neck.json', root), 'utf8')).structures.map(s => s.zh));
for (const l of fs.readFileSync(new URL('docs/required-structures/pelvis-perineum-genital-list.md', root), 'utf8').split('\n')) { const m = l.match(/^\| \d+ \| [^|]+ \| ([^|]+) \|/); if (m) required.push(m[1].trim()); }
const listed = new Set(required.map(z => z.replace(/（.*）/, '')));
let inList = 0;
for (const n of renamed) { if (n.en === 'Superior orbital fissure') continue; assert.ok(listed.has(n.zh), `${n.en}: 「${n.zh}」 is the name in the required list`); inList++; }
for (const n of [...renamed, ...aliasOnly]) for (const a of n.zhAliases) assert.notEqual(a, n.zh);

// 2. the earlier wording is gone from the source strings the site shows
const olds = [...new Set(renamed.flatMap(n => n.zhAliases))];
const walk = d => fs.readdirSync(d, {withFileTypes: true}).flatMap(e => e.name === 'node_modules' || e.name.startsWith('.') ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const ALLOWED = new RegExp('mj-eye-openings|quiz/eye\\.ts|mj-required-names|mj-head-neck-names|mj-related-' + 'search|mj-search\.ts|quiz/naming\.ts|mj-naming-data|synonyms');
let scanned = 0;
for (const dir of ['app', 'public']) for (const f of walk(path.join(rootPath, dir))) {
  const rel = path.relative(rootPath, f).split(path.sep).join('/');
  if (ALLOWED.test(rel) || !/\.(ts|tsx|json|json\.gz)$/.test(f)) continue;
  const text = f.endsWith('.gz') ? gunzipSync(fs.readFileSync(f)).toString('utf8') : fs.readFileSync(f, 'utf8');
  scanned++;
  for (const o of olds) assert.ok(!text.includes(o), `${rel}: still has the earlier wording 「${o}」`);
}

// 3. search and Quiz
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
let found = 0;
for (const n of [...renamed, ...aliasOnly]) {
  const hits = index.filter(e => base(e.english) === n.en.toLowerCase());
  if (!hits.length) continue;
  if (!aliasOnly.includes(n)) for (const h of hits) assert.equal(side(h.chinese), n.zh, `${n.en}: search shows 「${h.chinese}」`);
  for (const a of n.zhAliases) assert.ok(querySearchIndex(index, a, 300).some(e => base(e.english) === n.en.toLowerCase()), `search 「${a}」 finds ${n.en}`);
  found++;
}
assert.ok(found >= 25, `only ${found} structures found in the search index`);

const quiz = fs.readdirSync(models).filter(f => /^quiz-.*\.json$/.test(f)).flatMap(f => JSON.parse(fs.readFileSync(new URL(f, models), 'utf8')).structures ?? []);
const any = {language: 'any', needSide: false};
let quizChecked = 0;
for (const n of [...renamed, ...aliasOnly]) {
  for (const s of quiz.filter(x => base(x.name) === n.en.toLowerCase())) {
    if (!aliasOnly.includes(n)) assert.equal(side(s.chinese), n.zh, `Quiz shows ${n.zh} for ${n.en}`);
    for (const t of [n.zh, ...n.zhAliases]) assert.ok(['', '左', '右'].some(p => judgeName(p + t, s, any).result === 'correct'), `Quiz accepts 「${t}」 for ${n.en}`);
    quizChecked++;
  }
}
assert.ok(quizChecked >= 10, `only ${quizChecked} Quiz structures checked`);
// user decisions 2026-11-21: landmarks follow the list; the ribs keep the site wording with the list wording as an alias; the clitoris body is shown as 陰蒂體
const zhOf = en => [...renamed, ...aliasOnly].find(n => n.en === en);
assert.deepEqual(['Iliac crest', 'Ischial tuberosity', 'Pubic tubercle'].map(e => zhOf(e)?.zh), ['髂脊', '坐骨粗隆', '恥骨粗隆']);
assert.ok(zhOf('11th rib').zhAliases.includes('第 11 肋') && zhOf('12th rib').zhAliases.includes('第 12 肋'));
assert.equal(zhOf('Body of clitoris').zh, '陰蒂體');
assert.deepEqual(['Posterior auricular artery', 'Middle meningeal artery'].map(e => zhOf(e)?.zh), ['後耳動脈', '中腦膜動脈']);
// follow-up 2026-11-22: iliac arteries, lateral femoral cutaneous nerve, great pancreatic artery, pericardiophrenic artery, linea alba, inferior orbital fissure
assert.deepEqual(['Lateral femoral cutaneous nerve', 'Internal iliac artery', 'External iliac artery', 'Common iliac artery', 'Great pancreatic artery', 'Pericardiophrenic artery', 'Linea alba', 'Inferior orbital fissure'].map(e => zhOf(e)?.zh),
  ['外股皮神經', '內髂動脈', '外髂動脈', '總髂動脈', '大胰動脈', '心包膜膈動脈', '白線', '下眶裂']);
console.log(`Required names (abdomen, pelvis, perineum) OK: ${renamed.length} renamed, ${inList} in the lists, ${found} in the search index, ${quizChecked} Quiz structures, ${scanned} files scanned.`);
