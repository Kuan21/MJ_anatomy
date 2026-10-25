// Repack the existing source anatomy, losslessly, into small per-region quiz packages
// (lower limb, upper limb, thorax). No procedural anatomy, geometry deformation, or runtime Draco.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync, gunzipSync} from 'node:zlib';
import {BufferGeometry, BufferAttribute} from 'three';
import {quizModule} from './quiz-modules.mjs';

const root = new URL('../', import.meta.url);
const models = new URL('public/models/', root);
const output = new URL('stream/', models);
fs.mkdirSync(output, {recursive: true});
const {normalizeAtlasSystems} = await quizModule('app/mj-system-classifier.ts');
const {anatomicalRegion, anatomicalSide, correctedPartName} = await quizModule('app/mj-part-regions.ts');
const {structureProfile} = await quizModule('app/mj-structure-info.ts');
const {namingOverride, applyZhFixes} = await quizModule('app/mj-naming.ts');
const {QUIZ_SYSTEMS, QUIZ_REGIONS, LOWER_NERVES, UPPER_NERVES, THORAX_NERVES, THORAX_INCLUDE, BACK_NERVES, BACK_INCLUDE, classifySections} = await quizModule('app/quiz/catalogue.ts');
const atlas = normalizeAtlasSystems(JSON.parse(fs.readFileSync(new URL('atlas.json', models))));
// BodyParts3D 3.0 structures the 4.0 export left out (latissimus dorsi, multifidus, spinalis cervicis…) are quiz answers too: their packages are read like the atlas chunks.
const supplement = JSON.parse(gunzipSync(fs.readFileSync(new URL('supplement/supplement-stream.json.gz', models))));
const supplementBase = atlas.chunks.length;
atlas.chunks.push(...supplement.chunks);
for (const p of supplement.parts) atlas.parts.push({...p, chunk: p.chunk + supplementBase});
const nerveStream = JSON.parse(fs.readFileSync(new URL('nerve-stream.json', models)));
const sourceBuffers = new Map();
const lc = s => s[0].toLowerCase() + s.slice(1);
const cleanName = name => name.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/\s+/g, ' ').trim();
const PAIRED_THORAX = /\brib\b|intercostal|serratus posterior|levatores costarum|rotator|iliocostalis|longissimus|spinalis|semispinalis|interspinalis|transversus thoracis|subcostal|internal thoracic|musculophrenic|bronchial|pulmonary (?:artery|vein)|superior pulmonary|inferior pulmonary|costocervical|thyrocervical|costal cartilage/i;
const NERVES = {'lower-limb': LOWER_NERVES, 'upper-limb': UPPER_NERVES, thorax: THORAX_NERVES, back: BACK_NERVES};

/** Which atlas meshes belong to a region's quiz, and on which side (null = leave out). */
function include(region, part) {
  if (region === 'lower-limb') {
    const hip = /\bhip bone\b|\b(?:common|external|internal) iliac (?:artery|vein)\b|glute|obturator|tensor fasciae/i.test(part.name);
    if (anatomicalRegion(part) !== 'lower-limb' && !hip) return null;
  } else if (region === 'upper-limb') {
    if (anatomicalRegion(part) !== 'upper-limb') return null;
  } else if (region === 'back') {
    const name = cleanName(correctedPartName(part));
    if (!BACK_INCLUDE[part.system]?.test(name)) return null;
    // Source files also hold side-less duplicates of paired structures; only use the explicitly left/right ones (vertebrae, sacrum and skull are unpaired).
    if (part.system !== 'skeletal' && !/\b(left|right)\b/i.test(part.name)) return null;
  } else {
    const y = (part.bounds[0][1] + part.bounds[1][1]) / 2;
    if (y < 1.04 || y > 1.5 || !THORAX_INCLUDE[part.system]?.test(cleanName(correctedPartName(part)))) return null;
  }
  let side = anatomicalSide(part);
  if (side === 'midline') {
    const x = (part.bounds[0][0] + part.bounds[1][0]) / 2;
    if (region === 'thorax' || region === 'back') side = Math.abs(x) < .012 || (region === 'back' && part.system === 'skeletal' && !/scapula/.test(part.name.toLowerCase())) ? 'midline' : x > 0 ? 'left' : 'right';
    else if (Math.abs(x) < .005) return null;
    else side = x > 0 ? 'left' : 'right';
  }
  // Unpaired thoracic structures (aorta, venae cavae, pulmonary trunk, sternum, vertebrae, diaphragm…) are midline, whatever side they sit on.
  if (region === 'thorax' && !/\b(left|right)\b/i.test(part.name) && !PAIRED_THORAX.test(cleanName(correctedPartName(part)))) return 'midline';
  return side;
}

const summary = [];
for (const region of Object.keys(QUIZ_REGIONS)) {
  const def = QUIZ_REGIONS[region], short = def.file.replace(/^quiz-|\.json$/g, '');
  const items = [], structures = new Map();
  const groupId = (system, name) => `${system}:${name.toLowerCase().replace(/\s+/g, ' ').trim()}`;
  function add({id, name, chinese, system, side, bounds, source, positions, normals, indices, sections, description}) {
    const structureId = groupId(system, name);
    let structure = structures.get(structureId);
    if (!structure) {
      structure = {id: structureId, name, chinese, system, side, sections: sections ?? classifySections(region, name, bounds, system), meshIds: [], bounds: bounds.map(b => [...b]), source, ...(description ? {description} : {})};
      structures.set(structureId, structure);
    }
    structure.meshIds.push(id);
    for (let i = 0; i < 3; i++) {
      structure.bounds[0][i] = Math.min(structure.bounds[0][i], bounds[0][i]);
      structure.bounds[1][i] = Math.max(structure.bounds[1][i], bounds[1][i]);
    }
    items.push({id, structureId, system, side, positions, normals, indices});
  }

  // Heart quiz: the structures come from the heart detail package (Z-Anatomy), not the atlas.
  if (region === 'heart') {
    const heart = JSON.parse(gunzipSync(fs.readFileSync(new URL('heart/heart-detail.json.gz', models))));
    const heartChunks = heart.chunks.map(c => fs.readFileSync(new URL('public' + c.url, root)));
    for (const part of heart.parts) {
      const raw = heartChunks[part.chunk];
      add({id: part.id, name: part.name, chinese: part.chinese, system: part.system, side: 'midline', bounds: part.bounds, source: 'Z-Anatomy', sections: [part.group], description: part.description,
        positions: raw.subarray(part.positions, part.positions + part.vertexCount * 12), normals: raw.subarray(part.normals, part.normals + part.vertexCount * 6), indices: raw.subarray(part.indices, part.indices + part.indexCount * 4)});
    }
  }
  for (const part of region === 'heart' ? [] : atlas.parts) {
    if (!QUIZ_SYSTEMS.some(s => s.id === part.system)) continue;
    const side = include(region, part);
    if (!side) continue;
    let name = correctedPartName(part);
    if (side !== 'midline' && !/\b(left|right)\b/i.test(name)) name = `${side === 'left' ? 'Left' : 'Right'} ${lc(name)}`;
    const profile = structureProfile(name, part.system, {...part, name});
    // Keep the primary English source term authoritative; never show a half-translated fallback as a verified Chinese name.
    const chinese = profile.chinese && !/[a-z]/i.test(profile.chinese) ? profile.chinese : undefined;
    const chunk = atlas.chunks[part.chunk];
    if (!sourceBuffers.has(part.chunk)) sourceBuffers.set(part.chunk, fs.readFileSync(new URL('public' + chunk.url, root)));
    const raw = sourceBuffers.get(part.chunk);
    add({id: part.id, name, chinese, side, system: part.system, bounds: part.bounds, source: 'BodyParts3D',
      positions: raw.subarray(part.positions, part.positions + part.vertexCount * 12),
      normals: raw.subarray(part.normals, part.normals + part.vertexCount * 6),
      indices: raw.subarray(part.indices, part.indices + part.indexCount * 4)});
  }

  for (const chunk of region === 'heart' ? [] : nerveStream.chunks) {
    let raw;
    for (const [ordinal, mesh] of chunk.meshes.entries()) {
      const match = /^(.*?)\.([lr])(?:\.\d+)?$/i.exec(mesh.name);
      const definition = match && NERVES[region][match[1].toLowerCase()];
      if (!definition) continue;
      const side = match[2].toLowerCase() === 'l' ? 'left' : 'right';
      const name = `${side === 'left' ? 'Left' : 'Right'} ${lc(match[1])}`;
      raw ??= gunzipSync(fs.readFileSync(new URL('public' + chunk.url, root)));
      const positions = raw.subarray(mesh.positions, mesh.positions + mesh.vertexCount * 12);
      const indices = raw.subarray(mesh.indices, mesh.indices + mesh.indexCount * 4);
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions.buffer, positions.byteOffset, mesh.vertexCount * 3), 3));
      geometry.setIndex(new BufferAttribute(new Uint32Array(indices.buffer, indices.byteOffset, mesh.indexCount), 1));
      geometry.computeVertexNormals();
      geometry.computeBoundingBox();
      const bounds = [geometry.boundingBox.min.toArray(), geometry.boundingBox.max.toArray()];
      if (region !== 'thorax' && ((side === 'right' && bounds[1][0] > .035) || (side === 'left' && bounds[0][0] < -.035))) throw Error(`Nerve laterality mismatch: ${mesh.name}`);
      const normals = new Int16Array(mesh.vertexCount * 3);
      geometry.getAttribute('normal').array.forEach((x, i) => {normals[i] = Math.round(x * 32767);});
      add({id: `nerve:${mesh.name}:${ordinal}`, name, chinese: applyZhFixes((side === 'left' ? '左' : '右') + (namingOverride(name) ?? definition.zh)),
        system: definition.system ?? 'nervous', side, bounds, source: definition.schematic ? 'Schematic model' : 'Nervous supplement', positions, normals: Buffer.from(normals.buffer), indices});
      geometry.dispose();
    }
  }

  const packages = [], sides = region === 'thorax' || region === 'back' || region === 'heart' ? ['left', 'right', 'midline'] : ['left', 'right'];
  for (const {id: system} of QUIZ_SYSTEMS) for (const side of sides) {
    let buffers = [], bytes = 0, meshes = [];
    const append = data => {
      const padding = (4 - bytes % 4) % 4;
      if (padding) {buffers.push(Buffer.alloc(padding)); bytes += padding;}
      const offset = bytes;
      buffers.push(data); bytes += data.length;
      return offset;
    };
    const flush = () => {
      if (!meshes.length) return;
      const buffer = Buffer.concat(buffers), hash = createHash('sha256').update(buffer).digest('hex').slice(0, 20);
      const name = `quiz-${short}-${hash}.bin`, compressed = gzipSync(buffer, {level: 9});
      fs.writeFileSync(new URL(name, output), buffer);
      fs.writeFileSync(new URL(name + '.gz', output), compressed);
      packages.push({system, side, url: '/models/stream/' + name, gzip: '/models/stream/' + name + '.gz', bytes, gzipBytes: compressed.length, meshes});
      buffers = []; bytes = 0; meshes = [];
    };
    for (const item of items.filter(m => m.system === system && m.side === side)) {
      if (bytes > 420000) flush();
      meshes.push({id: item.id, structureId: item.structureId, positions: append(item.positions), normals: append(item.normals), indices: append(item.indices),
        vertexCount: item.positions.length / 12, indexCount: item.indices.length / 4});
    }
    flush();
  }
  const catalogue = {version: 1, region, structures: [...structures.values()], packages};
  fs.writeFileSync(new URL(def.file, models), JSON.stringify(catalogue));
  const missing = catalogue.structures.filter(s => !s.chinese).length;
  summary.push(`${def.english}: ${catalogue.structures.length} named structures, ${items.length} unchanged meshes, ${(packages.reduce((s, p) => s + p.gzipBytes, 0) / 1e6).toFixed(2)} MB${missing ? `, ${missing} without a Chinese name` : ''}`);
}
console.log('Quiz catalogues — ' + summary.join('; ') + '.');
