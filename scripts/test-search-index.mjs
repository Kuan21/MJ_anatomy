// The search index: every structure is findable by its English name, Chinese name (all accepted spellings), alias and FMA id; at most 50 results;
// and a query is fast enough that typing never waits on it.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {quizModule} from './quiz-modules.mjs';

const {buildSearchIndex, querySearchIndex, conceptMatches} = await quizModule('app/mj-search.ts');
const {structureProfile} = await quizModule('app/mj-structure-info.ts');
const {normalizeAtlasSystems} = await quizModule('app/mj-system-classifier.ts');
const {mergeAtlasStreams} = await quizModule('app/mj-facial-atlas.ts');
const models = new URL('../public/models/', import.meta.url), read = f => JSON.parse(gunzipSync(fs.readFileSync(new URL(f, models))));
const atlas = mergeAtlasStreams(normalizeAtlasSystems(read('atlas-stream.json.gz')), [read('facial/facial-stream.json.gz'), read('supplement/supplement-stream.json.gz')]);
const parts = new Map(atlas.parts.map(p => [p.id, p]));
const sources = atlas.concepts.map(c => {
  const p = c.elements.map(id => parts.get(id)).find(Boolean), profile = p ? structureProfile(c.name, p.system, p) : undefined;
  return {concept: c, english: profile?.english ?? c.name, chinese: profile?.chinese, profile};
});
for (const x of read('search-extras.json.gz')) {
  const profile = structureProfile(x.n, x.s);
  sources.push({concept: {id: `extra:${x.k}:${x.raw ?? x.n}`, name: x.n, elements: []}, english: profile.english ?? x.n, chinese: profile.chinese, kind: x.k});
}
let t = performance.now();
const index = buildSearchIndex(sources);
const buildMs = performance.now() - t;
assert.ok(index.length > 2500, `index entries: ${index.length}`);

// same matches as the predicate the panel used before (conceptMatches), for a spread of queries
for (const q of ['latiss', '闊背', '背闊肌', '背阔肌', 'median nerve', '正中神經', 'rectus', '腹直肌', 'femur', '股骨', 'FMA13358', 'vertebral artery', '椎動脈', 'heart', 'ventricle']) {
  const expected = new Set(sources.filter(s => !s.kind && conceptMatches(s.concept, s.profile, q)).map(s => s.concept.id));
  const got = querySearchIndex(index, q, 100000);
  for (const id of expected) assert.ok(got.some(e => e.concept.id === id), `"${q}" finds ${id}`);
  assert.ok(querySearchIndex(index, q, 50).length <= 50, 'at most 50 results');
}
// by FMA id and by alias
assert.ok(querySearchIndex(index, 'FMA13358').some(e => /latissimus/i.test(e.english)), 'FMA id');
for (const q of ['闊背肌', '背阔肌', '背闊肌']) assert.ok(querySearchIndex(index, q).some(e => /latissimus/i.test(e.english)), `alias ${q}`);
assert.deepEqual(querySearchIndex(index, '   '), []);
// best match first: the shortest name that matches comes first
{const top = querySearchIndex(index, 'femur')[0].english; assert.ok(/femur/i.test(top) && top.length <= 12, `best match for femur: ${top}`);}
// speed: a query over the whole index
const queries = ['l', 'la', 'lat', 'latissimus', 'm', 'me', 'med', '正', '正中', '正中神經', '闊', '闊背', '闊背肌'];
const times = [];
for (let round = 0; round < 5; round++) for (const q of queries) {t = performance.now(); querySearchIndex(index, q, 50); times.push(performance.now() - t);}
times.sort((a, b) => a - b);
const median = times[times.length >> 1], worst = times.at(-1);
assert.ok(worst < 25, `worst query ${worst.toFixed(1)} ms`);
console.log(`PASS search index: ${index.length.toLocaleString()} entries built in ${buildMs.toFixed(0)} ms; a query takes ${median.toFixed(2)} ms median, ${worst.toFixed(1)} ms worst; results capped at 50; English, Chinese (背闊肌／闊背肌／背阔肌), FMA id and alias all match.`);
