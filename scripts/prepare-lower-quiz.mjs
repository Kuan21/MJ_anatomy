// Repack the existing source anatomy, losslessly, into small lower-limb-only
// packages. No procedural anatomy, geometry deformation, or runtime Draco.
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
const {QUIZ_SYSTEMS, LOWER_NERVES, lowerSections} = await quizModule('app/quiz/catalogue.ts');
const atlas = normalizeAtlasSystems(JSON.parse(fs.readFileSync(new URL('atlas.json', models))));
const sourceBuffers = new Map(), items = [], structures = new Map();
const groupId = (system, name) => `${system}:${name.toLowerCase().replace(/\s+/g, ' ').trim()}`;
function add({id, name, chinese, system, side, bounds, source, positions, normals, indices}) {
  const structureId = groupId(system, name);
  let structure = structures.get(structureId);
  if (!structure) {
    structure = {id: structureId, name, chinese, system, side, sections: lowerSections(name, bounds), meshIds: [], bounds: bounds.map(b => [...b]), source};
    structures.set(structureId, structure);
  }
  structure.meshIds.push(id);
  for (let i = 0; i < 3; i++) {
    structure.bounds[0][i] = Math.min(structure.bounds[0][i], bounds[0][i]);
    structure.bounds[1][i] = Math.max(structure.bounds[1][i], bounds[1][i]);
  }
  items.push({id, structureId, system, side, positions, normals, indices});
}

for (const part of atlas.parts) {
  if (!QUIZ_SYSTEMS.some(s => s.id === part.system)) continue;
  const hip = /\bhip bone\b|\b(?:common|external|internal) iliac (?:artery|vein)\b|glute|obturator|tensor fasciae/i.test(part.name);
  if (anatomicalRegion(part) !== 'lower-limb' && !hip) continue;
  let side = anatomicalSide(part);
  if (side === 'midline') {
    const x = (part.bounds[0][0] + part.bounds[1][0]) / 2;
    if (Math.abs(x) < .005) continue;
    side = x > 0 ? 'left' : 'right';
  }
  let name = correctedPartName(part);
  if (!/\b(left|right)\b/i.test(name)) name = `${side === 'left' ? 'Left' : 'Right'} ${name[0].toLowerCase()}${name.slice(1)}`;
  const profile = structureProfile(name, part.system, {...part, name});
  // Keep the primary English source term authoritative; do not display a
  // partially translated fallback as if it were a verified Chinese name.
  const chinese = profile.chinese && !/[a-z]/i.test(profile.chinese) ? profile.chinese : undefined;
  const chunk = atlas.chunks[part.chunk];
  if (!sourceBuffers.has(part.chunk)) sourceBuffers.set(part.chunk, fs.readFileSync(new URL('public' + chunk.url, root)));
  const raw = sourceBuffers.get(part.chunk);
  add({id: part.id, name, chinese, side, system: part.system, bounds: part.bounds, source: 'BodyParts3D',
    positions: raw.subarray(part.positions, part.positions + part.vertexCount * 12),
    normals: raw.subarray(part.normals, part.normals + part.vertexCount * 6),
    indices: raw.subarray(part.indices, part.indices + part.indexCount * 4)});
}

const nerves = JSON.parse(fs.readFileSync(new URL('nerve-stream.json', models)));
for (const chunk of nerves.chunks) {
  let raw;
  for (const [ordinal, mesh] of chunk.meshes.entries()) {
    const match = /^(.*?)\.([lr])(?:\.\d+)?$/i.exec(mesh.name);
    const definition = match && LOWER_NERVES[match[1].toLowerCase()];
    if (!definition) continue;
    const side = match[2].toLowerCase() === 'l' ? 'left' : 'right';
    const name = `${side === 'left' ? 'Left' : 'Right'} ${match[1][0].toLowerCase()}${match[1].slice(1)}`;
    raw ??= gunzipSync(fs.readFileSync(new URL('public' + chunk.url, root)));
    const positions = raw.subarray(mesh.positions, mesh.positions + mesh.vertexCount * 12);
    const indices = raw.subarray(mesh.indices, mesh.indices + mesh.indexCount * 4);
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions.buffer, positions.byteOffset, mesh.vertexCount * 3), 3));
    geometry.setIndex(new BufferAttribute(new Uint32Array(indices.buffer, indices.byteOffset, mesh.indexCount), 1));
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    const bounds = [geometry.boundingBox.min.toArray(), geometry.boundingBox.max.toArray()];
    if ((side === 'right' && bounds[1][0] > .035) || (side === 'left' && bounds[0][0] < -.035)) throw Error(`Nerve laterality mismatch: ${mesh.name}`);
    const normals = new Int16Array(mesh.vertexCount * 3);
    geometry.getAttribute('normal').array.forEach((x, i) => {normals[i] = Math.round(x * 32767);});
    add({id: `nerve:${mesh.name}:${ordinal}`, name, chinese: (side === 'left' ? '左' : '右') + definition.zh,
      system: 'nervous', side, bounds, source: 'Nervous supplement', positions, normals: Buffer.from(normals.buffer), indices});
    geometry.dispose();
  }
}

const packages = [];
for (const {id: system} of QUIZ_SYSTEMS) for (const side of ['left', 'right']) {
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
    const name = `quiz-lower-${hash}.bin`, compressed = gzipSync(buffer, {level: 9});
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
const catalogue = {version: 1, structures: [...structures.values()], packages};
fs.writeFileSync(new URL('quiz-lower.json', models), JSON.stringify(catalogue));
console.log(`Lower-limb quiz: ${catalogue.structures.length} named structures, ${items.length} unchanged meshes, ${(packages.reduce((s, p) => s + p.gzipBytes, 0) / 1e6).toFixed(2)} MB for both sides / all systems.`);
