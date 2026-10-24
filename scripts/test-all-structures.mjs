// Every structure the header counts must load, draw and be found by search. Builds the same merged atlas the viewer builds
// (body + facial muscles + BodyParts3D 3.0 supplement) and checks the packages byte for byte.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {quizModule} from './quiz-modules.mjs';
const models = new URL('../public/models/', import.meta.url), read = p => fs.readFileSync(new URL(p, models));
const {normalizeAtlasSystems} = await quizModule('app/mj-system-classifier.ts');
const {mergeAtlasStreams} = await quizModule('app/mj-facial-atlas.ts');
const {conceptMatches} = await quizModule('app/mj-search.ts');
const {structureProfile} = await quizModule('app/mj-structure-info.ts');
const stream = f => JSON.parse(gunzipSync(read(f)));
const base = normalizeAtlasSystems(stream('atlas-stream.json.gz')), facial = stream('facial/facial-stream.json.gz'), supplement = stream('supplement/supplement-stream.json.gz');
const atlas = mergeAtlasStreams(base, [facial, supplement]);

assert.equal(atlas.parts.length, base.parts.length + facial.parts.length + supplement.parts.length);
assert.equal(base.parts.length + facial.parts.length, 2279, '2,232 body + 47 facial = 2,279 structures before the supplement');
assert.equal(new Set(atlas.parts.map(p => p.id)).size, atlas.parts.length, 'part ids are unique');

// every part resolves to bytes inside a real, correctly sized package
const packages = atlas.chunks.map((c, i) => {
  const file = c.gzip ?? c.url;
  assert.ok(fs.existsSync(new URL('.' + file.replace('/models', ''), models)), `package ${i} exists: ${file}`);
  const raw = c.gzip ? gunzipSync(fs.readFileSync(new URL('.' + c.gzip.replace('/models', ''), models))) : fs.readFileSync(new URL('.' + c.url.replace('/models', ''), models));
  if (c.bytes) assert.equal(raw.length, c.bytes, `package ${i} byte length`);
  return raw.length;
});
for (const p of atlas.parts) {
  const size = packages[p.chunk];
  assert.ok(size !== undefined, `${p.name}: chunk ${p.chunk} exists`);
  assert.ok(p.positions % 4 === 0 && p.indices % 4 === 0, `${p.name}: aligned`);
  assert.ok(p.positions + p.vertexCount * 12 <= size && p.normals + p.vertexCount * 6 <= size && p.indices + p.indexCount * 4 <= size, `${p.name}: bytes inside its package`);
  assert.ok(p.bounds.flat().every(Number.isFinite), `${p.name}: finite bounds`);
}

// supplement: registered into the atlas frame (same side, overlapping the neighbouring bone, inside the body)
const find = re => atlas.parts.filter(p => re.test(p.name));
const centre = p => p.bounds[0].map((v, k) => (v + p.bounds[1][k]) / 2);
const overlap = (a, b) => [0, 1, 2].every(k => a.bounds[0][k] <= b.bounds[1][k] && a.bounds[1][k] >= b.bounds[0][k]);
for (const side of ['Right', 'Left']) {
  const sign = side === 'Right' ? -1 : 1, scapula = find(new RegExp(`^${side} scapula$`, 'i'))[0], ilium = find(new RegExp(`^${side} hip bone$`, 'i'))[0];
  assert.ok(scapula && ilium);
  for (const p of atlas.parts.filter(p => p.id.startsWith('BP3S-') && p.name.startsWith(side))) assert.equal(Math.sign(centre(p)[0]) || sign, sign, `${p.name} is on the ${side} side`);
  const lat = find(new RegExp(`^${side} latissimus dorsi$`, 'i'))[0];
  assert.ok(lat, `${side} latissimus dorsi is in the atlas`);
  assert.ok(overlap(lat, scapula), `${side} latissimus dorsi overlaps its scapula (registration)`);
  assert.ok(lat.bounds[0][1] < ilium.bounds[1][1] && lat.bounds[0][1] > ilium.bounds[0][1] - .05, `${side} latissimus dorsi reaches the iliac crest`);
}
for (const p of supplement.parts) assert.ok(p.bounds[0][1] > -.02 && p.bounds[1][1] < 1.75 && Math.abs(p.bounds[0][0]) < .45 && Math.abs(p.bounds[1][0]) < .45, `${p.name} inside the body envelope`);

// search finds every supplement structure by English and Chinese, as the Find-a-structure panel does
const parts = new Map(atlas.parts.map(p => [p.id, p]));
const search = query => atlas.concepts.filter(c => {
  const p = c.elements.map(id => parts.get(id)).find(Boolean), profile = p ? structureProfile(c.name, p.system, p) : undefined;
  return conceptMatches(c, profile, query);
});
for (const query of ['latiss', 'latissimus dorsi', '闊背', '闊背肌', '背闊肌', '背阔肌', 'rectus abdominis', '腹直肌', 'transversus abdominis', '腹橫肌', 'quadratus lumborum', '腰方肌', 'multifidus', '多裂肌']) assert.ok(search(query).length, `search "${query}" finds something`);
for (const p of atlas.parts.filter(p => p.id.startsWith('BP3S-'))) {
  const hits = search(p.name);
  assert.ok(hits.some(c => c.elements.includes(p.id)), `search finds "${p.name}"`);
}
console.log(`PASS all structures: ${atlas.parts.length.toLocaleString()} (${base.parts.length.toLocaleString()} body + ${facial.parts.length} facial + ${supplement.parts.length} supplement) resolve to real package bytes, are registered to the atlas frame, and are found by search in English, 背闊肌/闊背肌/背阔肌 and simplified spellings.`);
