import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {quizModule} from './quiz-modules.mjs';
import {planCuts, atlasParts} from './lib/tendon-set.mjs';
const cutMuscles = new Set(planCuts(atlasParts().parts, atlasParts().read).finals.keys());

const {QUIZ_SECTIONS, QUIZ_SYSTEMS, questionPool, sceneStructures} = await quizModule('app/quiz/catalogue.ts');
const LOWER_SYSTEMS = QUIZ_SYSTEMS.filter(s => s.id !== 'cardiac' && s.id !== 'respiratory'); // heart and lung structures only exist in their own quizzes
const {createSession, recordAnswer, retryMistakes} = await quizModule('app/quiz/engine.ts');
const {PointerTap} = await quizModule('app/pointer-tap.ts');
const {normalizeAtlasSystems} = await quizModule('app/mj-system-classifier.ts');
const catalogue = JSON.parse(fs.readFileSync('public/models/quiz-lower.json'));
const atlas = normalizeAtlasSystems(JSON.parse(fs.readFileSync('public/models/atlas.json')));
// BodyParts3D 3.0 supplement structures (latissimus dorsi, extensor digitorum brevis…) are quiz answers too; their packages sit after the atlas chunks.
{
  const supplement = JSON.parse(gunzipSync(fs.readFileSync('public/models/supplement/supplement-stream.json.gz'))), offset = atlas.chunks.length;
  atlas.chunks.push(...supplement.chunks);
  for (const p of supplement.parts) atlas.parts.push({...p, chunk: p.chunk + offset});
}
const native = new Map(atlas.parts.map(p => [p.id, p]));
const nerves = JSON.parse(fs.readFileSync('public/models/nerve-stream.json'));
const nerveMeshes = new Map(nerves.chunks.flatMap(c => c.meshes.map(m => [m.name, {mesh: m, chunk: c}])));
const structures = new Map(catalogue.structures.map(s => [s.id, s]));
assert.equal(structures.size, catalogue.structures.length, 'No repeated anatomical answers');
const buffers = new Map();
function read(file, gzip = false) {
  if (!buffers.has(file)) buffers.set(file, gzip ? gunzipSync(fs.readFileSync(file)) : fs.readFileSync(file));
  return buffers.get(file);
}
const meshes = new Set();
for (const pack of catalogue.packages) {
  const raw = read('public' + pack.url);
  assert.equal(raw.length, pack.bytes);
  assert.deepEqual(read('public' + pack.gzip, true), raw, 'Gzip fallback is identical');
  assert.ok(pack.url.includes(createHash('sha256').update(raw).digest('hex').slice(0, 20)), 'Content-addressed cache key');
  for (const mesh of pack.meshes) {
    assert.ok(!meshes.has(mesh.id), `Duplicate mesh ${mesh.id}`); meshes.add(mesh.id);
    const structure = structures.get(mesh.structureId);
    assert.ok(structure?.meshIds.includes(mesh.id));
    assert.equal(structure.system, pack.system);
    assert.equal(structure.side, pack.side);
    const positions = raw.subarray(mesh.positions, mesh.positions + mesh.vertexCount * 12);
    const indices = raw.subarray(mesh.indices, mesh.indices + mesh.indexCount * 4);
    for (const x of new Float32Array(positions.buffer, positions.byteOffset, mesh.vertexCount * 3)) assert.ok(Number.isFinite(x));
    for (const i of new Uint32Array(indices.buffer, indices.byteOffset, mesh.indexCount)) assert.ok(i < mesh.vertexCount);
    assert.ok(mesh.normals + mesh.vertexCount * 6 <= raw.length);
    // muscles that end at their musculotendinous junction and the tendon parts cut from them are derived from the atlas meshes, not byte copies (scripts/tendon/*.mjs)
    if (structure.source === 'BodyParts3D' && !(structure.system === 'tendon' || cutMuscles.has(mesh.id))) {
      const source = native.get(mesh.id); assert.ok(source);
      const original = read('public' + atlas.chunks[source.chunk].url);
      assert.deepEqual(positions, original.subarray(source.positions, source.positions + source.vertexCount * 12), 'Unchanged original position data');
      assert.deepEqual(indices, original.subarray(source.indices, source.indices + source.indexCount * 4), 'Unchanged source triangles');
      assert.deepEqual(raw.subarray(mesh.normals, mesh.normals + mesh.vertexCount * 6), original.subarray(source.normals, source.normals + source.vertexCount * 6));
    } else if (structure.source !== 'BodyParts3D') {
      const name = mesh.id.replace(/^nerve:/, '').replace(/:\d+$/, '');
      const source = nerveMeshes.get(name); assert.ok(source);
      const original = read('public' + source.chunk.url, true), m = source.mesh;
      assert.deepEqual(positions, original.subarray(m.positions, m.positions + m.vertexCount * 12));
      assert.deepEqual(indices, original.subarray(m.indices, m.indices + m.indexCount * 4));
    }
  }
}
for (const s of catalogue.structures) {
  assert.ok(s.meshIds.length && s.meshIds.every(id => meshes.has(id)), `Question has renderable geometry: ${s.name}`);
  assert.ok(s.sections.length && s.sections.every(id => QUIZ_SECTIONS.some(r => r.id === id)));
  assert.ok(s.bounds[1][1] < 1.2 && s.bounds[0][1] >= -.01, `No upper-body answer: ${s.name}`);
  if (s.side === 'right') assert.ok(s.bounds[1][0] < .04, s.name);
  else assert.ok(s.bounds[0][0] > -.04, s.name);
}
for (const side of ['Left', 'Right']) {
  for (const name of ['gluteus maximus', 'gluteus medius', 'gluteus minimus', 'femur', 'tibia', 'patella', 'sciatic nerve', 'femoral nerve', 'tibial nerve', 'common fibular nerve', 'medial plantar nerve', 'femoral artery', 'femoral vein', 'external iliac artery', 'great saphenous vein']) {
    assert.ok(catalogue.structures.some(s => s.name === `${side} ${name}`), `Missing ${side} ${name}`);
  }
}
assert.ok(!meshes.has('FJ2091') && !meshes.has('FJ2195'), 'Quarantined source identities stay out of the quiz');
assert.equal(catalogue.structures.find(s => s.meshIds.includes('FJ2186')).system, 'venous');
assert.equal(catalogue.structures.find(s => s.meshIds.includes('FJ1438')).system, 'muscular');
assert.equal(new Set(catalogue.structures.filter(s => s.name === 'Left internal iliac vein').flatMap(s => s.meshIds)).size, 3, 'Split source pieces form one answer');

let seed = 327;
const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
for (const section of QUIZ_SECTIONS) for (const side of ['right', 'left', 'both']) {
  for (const systems of [LOWER_SYSTEMS.map(s => s.id), ...LOWER_SYSTEMS.map(s => [s.id])]) {
    const settings = {section: section.id, side, systems, count: 10};
    const pool = questionPool(catalogue, settings), session = createSession(pool, 10, random);
    // the hip has no tendon of its own that the model can show apart from the iliopsoas tendon: a tendon-only quiz of that section may be empty (the setup screen then has no tendon questions there)
    if (!pool.length && systems.length === 1 && systems[0] === 'tendon' && section.id === 'hip') continue;
    assert.ok(pool.length, `Playable section/system: ${section.id}/${side}/${systems}`);
    assert.equal(session.queue.length, Math.min(10, pool.length));
    assert.equal(new Set(session.queue).size, session.queue.length);
    if (systems.length > 1) assert.ok(new Set(session.queue.map(id => structures.get(id).system)).size >= Math.min(5, systems.length), 'Mixed quiz covers at least five of the six systems');
    for (const id of session.queue) {
      const target = structures.get(id), displaySection = section.id === 'all' ? target.sections[0] : section.id;
      const visible = sceneStructures(catalogue, target, displaySection, side);
      assert.ok(visible.some(s => s.id === id), 'Target always belongs to the displayed scene');
      if (target.system !== 'tendon') assert.ok(visible.filter(s => s.system === target.system).length > 1, 'An answer has selectable distractors');
      assert.ok(visible.every(s => side === 'both' || s.side === side));
    }
  }
}
const sample = createSession(catalogue.structures, 3, random);
const correct = recordAnswer(sample, 0, sample.queue[0]);
assert.equal(correct.answers[0].correct, true);
assert.equal(recordAnswer(correct, 0, 'wrong'), correct, 'Double tap does not overwrite or advance');
assert.equal(recordAnswer(sample, 1, sample.queue[1]), sample, 'Out-of-order callback cannot score a future question');
const wrong = recordAnswer(correct, 1, sample.queue[0]);
const skipped = recordAnswer(wrong, 2, null);
assert.equal(skipped.answers.filter(a => a.correct).length, 1);
assert.deepEqual(retryMistakes(skipped), {queue: sample.queue.slice(1), answers: []});
assert.deepEqual(createSession([], 10), {queue: [], answers: []});
assert.equal(createSession([...catalogue.structures, ...catalogue.structures], 9999, random).queue.length, catalogue.structures.length);
const tap = new PointerTap();
tap.down(1, 20, 20, 10); tap.move(1, 50, 50); assert.equal(tap.up(1, 20, 20), false);
tap.down(1, 20, 20, 10); tap.down(2, 30, 30, 10); assert.equal(tap.up(2, 30, 30), false); assert.equal(tap.up(1, 20, 20), false);
tap.down(1, 20, 20, 10); tap.cancel(1); assert.equal(tap.up(1, 20, 20), false);
assert.ok(catalogue.packages.reduce((n, p) => n + p.gzipBytes, 0) < 8e6, 'Quiz must not download the whole-body anatomy');
console.log(`Lower quiz passed: ${structures.size} answers / ${meshes.size} losslessly copied meshes; every region, system and side; scoring, skips, duplicate taps and retry mistakes.`);
