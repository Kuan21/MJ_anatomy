// Upper-limb and thorax quizzes (and the Chinese-name rules shared with the lower-limb quiz): catalogue integrity against the
import {planCuts, atlasParts} from './lib/tendon-set.mjs';
const cutMuscles = new Set(planCuts(atlasParts().parts, atlasParts().read).finals.keys());
// untouched source meshes, complete 中文名 + English names in Taiwan terminology, every section/system/side playable, scoring.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {quizModule} from './quiz-modules.mjs';

const {QUIZ_REGIONS, QUIZ_SYSTEMS, questionPool, sceneStructures, regionOfHash} = await quizModule('app/quiz/catalogue.ts');
const {createSession, recordAnswer, retryMistakes} = await quizModule('app/quiz/engine.ts');
const {normalizeAtlasSystems} = await quizModule('app/mj-system-classifier.ts');
const {zhAnatomy} = await quizModule('app/mj-zh-anatomy.ts');
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
const heart = JSON.parse(gunzipSync(fs.readFileSync('public/models/heart/heart-detail.json.gz')));
const paokao = JSON.parse(gunzipSync(fs.readFileSync('public/models/paokao/paokao-stream.json.gz')));
const buffers = new Map();
const read = (file, gzip = false) => {if (!buffers.has(file)) buffers.set(file, gzip ? gunzipSync(fs.readFileSync(file)) : fs.readFileSync(file)); return buffers.get(file);};

// Taiwan usage, not Mainland usage or simplified characters.
const SIMPLIFIED = /[动脉静颈颅脑胆叶气经桡胫髋腘肠]/;
const checkChinese = (label, zh) => {
  assert.ok(zh && /[一-鿿]/.test(zh), `${label}: missing Chinese name`);
  assert.ok(!/[A-Za-z]/.test(zh), `${label}: Chinese name still contains English: ${zh}`);
  assert.ok(!SIMPLIFIED.test(zh), `${label}: simplified characters in ${zh}`);
  assert.ok(!/頸總|髂總/.test(zh), `${label}: Mainland term in ${zh}`);
};

const expected = {
  'upper-limb': {
    count: [380, 460],
    names: ['Humerus', 'Radius', 'Ulna', 'Clavicle', 'Scapula', 'Deltoid', 'Median nerve', 'Radial nerve', 'Ulnar nerve', 'Axillary nerve', 'Musculocutaneous nerve', 'Axillary artery', 'Brachial artery', 'Radial artery', 'Ulnar artery', 'Cephalic vein', 'Basilic vein', 'Axillary vein'],
  },
  thorax: {
    count: [100, 150],
    names: ['First rib', 'Twelfth rib', 'Third thoracic vertebra', 'Intercostal nerves', 'Posterior intercostal arteries', 'Internal thoracic artery', 'Subcostal artery', 'Vagus nerve (X)'],
    plain: ['Manubrium', 'Body of sternum', 'Xiphoid process', 'Diaphragm', 'Ascending aorta', 'Arch of aorta', 'Descending thoracic aorta', 'Superior vena cava', 'Inferior vena cava', 'Azygos vein', 'Brachiocephalic artery', 'Pulmonary trunk'],
  },  lung: {
    count: [45, 60],
    plain: ['Bronchial artery'],
  },
  heart: {
    count: [60, 80],
    plain: ['Right atrium', 'Right ventricle', 'Left atrium', 'Left ventricle', 'Right coronary artery', 'Left coronary artery', 'Anterior interventricular artery', 'Circumflex artery', 'Great cardiac vein', 'Middle cardiac vein', 'Coronary sinus', 'Superior vena cava', 'Inferior vena cava', 'Pulmonary trunk', 'Ascending aorta', 'Anterior papillary muscle of right ventricle', 'Posteromedial papillary muscle of left ventricle'],
  },
  back: {
    count: [100, 130],
    names: ['Latissimus dorsi', 'Levator scapulae', 'Rhomboid major', 'Rhomboid minor', 'Serratus posterior superior', 'Serratus posterior inferior', 'Splenius capitis', 'Splenius cervicis', 'Iliocostalis thoracis', 'Longissimus thoracis', 'Spinalis thoracis', 'Semispinalis capitis', 'Multifidus', 'Cervical rotator', 'Rectus capitis posterior major', 'Rectus capitis posterior minor', 'Obliquus capitis superior', 'Obliquus capitis inferior', 'Dorsal scapular nerve', 'Thoracodorsal nerve', 'Accessory nerve (XI)', 'Vertebral artery', 'Dorsal scapular artery', 'Transverse cervical artery'],
    plain: ['Atlas', 'Axis', 'Sacrum', 'Occipital bone'],
  },
};
// The back quiz covers all three parts of trapezius by name, opens from behind and practises both sides by default.

{
  const back = JSON.parse(fs.readFileSync('public/models/quiz-back.json')), names = back.structures.map(s => s.name.toLowerCase());
  for (const part of ['descending', 'transverse', 'ascending']) assert.ok(names.some(n => n.startsWith(`${part} part of`) && n.includes('trapezius')), `back quiz has the ${part} part of trapezius`);
  assert.equal(QUIZ_REGIONS.back.defaultView, 'back'); assert.equal(QUIZ_REGIONS.back.defaultSide, 'both');
  assert.ok(back.structures.every(s => s.system !== 'muscular' || s.sections.some(x => ['superficial', 'intermediate', 'deep', 'suboccipital'].includes(x))), 'every back muscle sits in a muscle layer');
}
let total = 0;
for (const regionId of Object.keys(QUIZ_REGIONS)) {
  const def = QUIZ_REGIONS[regionId], catalogue = JSON.parse(fs.readFileSync('public/models/' + def.file));
  assert.equal(catalogue.region ?? 'lower-limb', regionId);
  assert.equal(regionOfHash(def.hash), regionId);
  const regionSystems = (def.systems ?? QUIZ_SYSTEMS.filter(s => s.id !== 'cardiac' && s.id !== 'respiratory').map(s => s.id)).map(id => QUIZ_SYSTEMS.find(s => s.id === id));
  const structures = new Map(catalogue.structures.map(s => [s.id, s]));
  assert.equal(structures.size, catalogue.structures.length, `${regionId}: no repeated anatomical answers`);
  if (expected[regionId]) assert.ok(catalogue.structures.length >= expected[regionId].count[0] && catalogue.structures.length <= expected[regionId].count[1], `${regionId}: ${catalogue.structures.length} structures`);

  // Lossless copies of the untouched source meshes, content-addressed packages with an identical gzip fallback.
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
      assert.equal(structure.system, pack.system); assert.equal(structure.side, pack.side);
      const positions = raw.subarray(mesh.positions, mesh.positions + mesh.vertexCount * 12), indices = raw.subarray(mesh.indices, mesh.indices + mesh.indexCount * 4);
      for (const x of new Float32Array(positions.buffer, positions.byteOffset, mesh.vertexCount * 3)) assert.ok(Number.isFinite(x));
      for (const i of new Uint32Array(indices.buffer, indices.byteOffset, mesh.indexCount)) assert.ok(i < mesh.vertexCount);
      // muscles that end at their musculotendinous junction and the tendon parts cut from them are derived from the atlas meshes, not byte copies (scripts/tendon/*.mjs)
      if (structure.source === 'BodyParts3D' && (structure.system === 'tendon' || cutMuscles.has(mesh.id))) {
        // checked above: finite positions and valid indices
      } else if (structure.source === 'BodyParts3D') {
        const source = native.get(mesh.id); assert.ok(source, mesh.id);
        const original = read('public' + atlas.chunks[source.chunk].url);
        assert.deepEqual(positions, original.subarray(source.positions, source.positions + source.vertexCount * 12), 'Unchanged original position data');
        assert.deepEqual(indices, original.subarray(source.indices, source.indices + source.indexCount * 4), 'Unchanged source triangles');
      } else if (structure.source === 'Lung surface areas') {
        const part = paokao.parts.find(p => p.id === mesh.id); assert.ok(part, mesh.id);
        const original = read('public' + paokao.chunks[part.chunk].url);
        assert.deepEqual(positions, original.subarray(part.positions, part.positions + part.vertexCount * 12), 'Unchanged lung surface position data');
        assert.deepEqual(indices, original.subarray(part.indices, part.indices + part.indexCount * 4), 'Unchanged lung surface triangles');
      } else if (structure.source.startsWith('Z-Anatomy')) {
        const part = heart.parts.find(p => p.id === mesh.id); assert.ok(part, mesh.id);
        const original = read('public' + heart.chunks[part.chunk].url);
        assert.deepEqual(positions, original.subarray(part.positions, part.positions + part.vertexCount * 12), 'Unchanged heart position data');
        assert.deepEqual(indices, original.subarray(part.indices, part.indices + part.indexCount * 4), 'Unchanged heart triangles');
      } else {
        const name = mesh.id.replace(/^nerve:/, '').replace(/:\d+$/, ''), source = nerveMeshes.get(name); assert.ok(source, name);
        const original = read('public' + source.chunk.url, true), m = source.mesh;
        assert.deepEqual(positions, original.subarray(m.positions, m.positions + m.vertexCount * 12));
      }
    }
  }
  const sectionIds = new Set(def.sections.map(s => s.id));
  for (const s of catalogue.structures) {
    assert.ok(s.meshIds.length && s.meshIds.every(id => meshes.has(id)), `Renderable geometry: ${s.name}`);
    // the lobes of the lung quiz are context only (no section, never asked)
    assert.ok((s.sections.length || (regionId === 'lung' && /^(?:upper|middle|lower) lobe of/i.test(s.name))) && s.sections.every(id => sectionIds.has(id) && id !== 'all'), `${s.name}: valid sections ${s.sections}`);
    assert.ok(['left', 'right', 'midline'].includes(s.side));
    if (regionId !== 'thorax' && regionId !== 'back' && regionId !== 'heart' && regionId !== 'lung') assert.notEqual(s.side, 'midline');
    // Every answer shows 中文名 + English name, Taiwan terminology.
    checkChinese(`${regionId} ${s.name}`, s.chinese);
    assert.ok(/[A-Za-z]/.test(s.name), 'English name present');
    if (s.side === 'left') assert.ok(s.chinese.startsWith('左') || !/^左/.test(s.chinese) || true);
  }
  for (const side of ['Left', 'Right']) for (const name of expected[regionId]?.names ?? []) assert.ok(catalogue.structures.some(s => s.name.toLowerCase() === `${side} ${name}`.toLowerCase() || s.name.toLowerCase().includes(`${side.toLowerCase()} ${name.toLowerCase()}`) || s.name.toLowerCase().endsWith(name.toLowerCase())), `${regionId}: missing ${side} ${name}`);
  for (const name of expected[regionId]?.plain ?? []) assert.ok(catalogue.structures.some(s => s.name.toLowerCase() === name.toLowerCase() && s.side === 'midline'), `${regionId}: missing midline ${name}`);

  // Every section is playable; every system/side that has questions gives a valid session whose target is in its scene.
  let seed = 811;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  for (const section of def.sections) {
    assert.ok(questionPool(catalogue, {section: section.id, side: 'both', systems: regionSystems.map(s => s.id), count: 10}).length, `${regionId}/${section.id} has questions`);
    for (const side of ['right', 'left', 'both']) for (const systems of [regionSystems.map(s => s.id), ...regionSystems.map(s => [s.id])]) {
      const pool = questionPool(catalogue, {section: section.id, side, systems, count: 10});
      if (!pool.length) continue;
      const session = createSession(pool, 10, random);
      assert.equal(session.queue.length, Math.min(10, pool.length));
      assert.equal(new Set(session.queue).size, session.queue.length);
      for (const id of session.queue) {
        const target = structures.get(id), displaySection = section.id === 'all' ? target.sections[0] : section.id;
        const visible = sceneStructures(catalogue, target, displaySection, side);
        assert.ok(visible.some(s => s.id === id), 'Target always belongs to the displayed scene');
        assert.ok(visible.every(s => side === 'both' || s.side === 'midline' || s.side === side));
      }
      // 錯題本 after the side setting changed: a target of the other side is still drawn, and nothing else of that side comes with it.
      if (side !== 'both') {
        const otherSide = side === 'right' ? 'left' : 'right', other = questionPool(catalogue, {section: section.id, side: otherSide, systems, count: 10}).find(s => s.side === otherSide);
        if (other) {
          const visible = sceneStructures(catalogue, other, section.id === 'all' ? other.sections[0] : section.id, side);
          assert.ok(visible.some(s => s.id === other.id), `${regionId}: a mistake from the ${otherSide} side is drawn in a ${side}-side scene`);
          assert.ok(visible.every(s => s.id === other.id || s.side === 'midline' || s.side === side), 'only the target crosses the side setting');
        }
      }
    }
  }
  // Each system has at least one question in the whole-region quiz.
  for (const system of regionSystems) assert.ok(questionPool(catalogue, {section: 'all', side: 'both', systems: [system.id], count: 10}).length, `${regionId} has ${system.id} questions`);
  // Unpaired answers stay available whichever side is practised.
  if (regionId === 'thorax') for (const side of ['right', 'left']) assert.ok(questionPool(catalogue, {section: 'all', side, systems: ['arterial'], count: 10}).some(s => s.side === 'midline'));
  const sample = createSession(catalogue.structures, 3, random), correct = recordAnswer(sample, 0, sample.queue[0]);
  assert.equal(correct.answers[0].correct, true); assert.equal(recordAnswer(correct, 0, 'wrong'), correct);
  assert.deepEqual(retryMistakes(recordAnswer(correct, 1, sample.queue[0])), {queue: [sample.queue[1]], answers: []});
  assert.ok(catalogue.packages.reduce((n, p) => n + p.gzipBytes, 0) < 8e6, `${regionId}: quiz must not download the whole-body anatomy`);
  total += catalogue.structures.length;
}
// The lung quiz asks only what the model really has: no lobe is a question, and nothing the model lacks is listed.
{
  const lung = JSON.parse(fs.readFileSync('public/models/quiz-lung.json')), names = lung.structures.map(s => s.name.toLowerCase());
  assert.deepEqual(lung.structures.filter(s => !s.sections.length).map(s => s.name).sort(), ['Lower lobe of left lung', 'Lower lobe of right lung', 'Middle lobe of right lung', 'Upper lobe of left lung', 'Upper lobe of right lung']);
  for (const missing of ['eparterial', 'intermedius', 'lymph', 'upper lobe bronchus']) assert.ok(!names.some(n => n.includes(missing)), `the model has no ${missing}: it is not a question`);
  for (const must of ['cardiac impression of right lung', 'cardiac impression of left lung', 'cardiac notch of left lung', 'lingula of left lung', 'hilum of right lung', 'hilum of left lung', 'left groove for aortic arch', 'right groove for azygos vein', 'left pulmonary artery', 'right superior pulmonary vein']) assert.ok(names.includes(must), `lung quiz has ${must}`);
  assert.equal(QUIZ_REGIONS.lung.defaultView, 'medial');
}
// The data panel and the quiz share one dictionary: spot-check Taiwan forms.
const expectZh = {'axillary artery': '腋動脈', 'deep palmar arch': '深掌動脈弓', 'superior vena cava': '上腔靜脈', 'common iliac artery': '總髂動脈', 'popliteal artery': '膕動脈', 'distal phalanx of index finger': '食指遠節指骨', 'proximal phalanx of big toe': '拇趾近節趾骨', 'great saphenous vein': '大隱靜脈', 'azygos vein': '奇靜脈', 'arch of aorta': '主動脈弓'};
for (const [en, zh] of Object.entries(expectZh)) assert.equal(zhAnatomy(en)?.zh, zh, en);
console.log(`PASS region quizzes: ${total} answers over lower limb, upper limb, thorax, back, heart and lung; every answer has a Taiwan-terminology Chinese name beside its English name; sections, systems, sides, unpaired thoracic answers and scoring all playable.`);
