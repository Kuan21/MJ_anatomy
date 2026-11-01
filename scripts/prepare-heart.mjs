// Heart detail model: the heart, its valves with chordae tendineae, papillary muscles, coronary arteries/veins and the adjoining great vessels,
// taken from the Z-Anatomy cardiovascular export (a BodyParts3D derivative, CC BY-SA 4.0 / 2.1 Japan). The pinned glb is verified, only the
// allow-listed nodes (scripts/heart-parts.json) are decoded, welded and repacked into a small gzip package that the viewer loads on demand.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync, gunzipSync} from 'node:zlib';
import {createRequire} from 'node:module';
import * as T from 'three';
import {buildMjHeart} from './lib/heart-mj.mjs';
import {buildValveApparatus, semilunarShift} from './lib/heart-valves.mjs';
import {indicesOf, positionsOf} from './lib/stream-geometry.mjs';

const root = new URL('../', import.meta.url);
const spec = JSON.parse(fs.readFileSync(new URL('scripts/heart-parts.json', root), 'utf8'));
const cache = new URL('work/', root), out = new URL('public/models/stream/', root), dir = new URL('public/models/heart/', root);
for (const d of [cache, out, dir]) fs.mkdirSync(d, {recursive: true});
const digest = b => createHash('sha256').update(b).digest('hex');

// Building the MJ structures takes ~30 s, so the package is rebuilt only when an input changed (spec, builders, atlas, serous shells) or an output is missing.
const stampFile = new URL('heart.stamp', cache), stampInputs = ['scripts/heart-parts.json', 'scripts/prepare-heart.mjs', 'scripts/lib/heart-mj.mjs', 'scripts/lib/heart-valves.mjs', 'scripts/lib/heart-geom.mjs', 'scripts/lib/nerve-schematics.mjs', 'public/models/atlas-stream.json.gz', 'public/models/serous/serous-stream.json.gz'];
const stamp = digest(Buffer.concat(stampInputs.map(f => fs.readFileSync(new URL(f, root)))));
try {
  const previous = fs.readFileSync(stampFile, 'utf8').split('\n');
  const catalogue = JSON.parse(gunzipSync(fs.readFileSync(new URL('heart-detail.json.gz', dir))));
  if (previous[0] === stamp && catalogue.chunks.every(c => fs.existsSync(new URL('public' + c.url, root)) && fs.existsSync(new URL('public' + c.gzip, root)))) {console.log(previous[1]); process.exit(0);}
} catch {}
const glbFile = new URL('heart-source.glb', cache);
let bytes; try {bytes = fs.readFileSync(glbFile);} catch {}
if (!bytes || digest(bytes) !== spec.sha256) {
  const url = `https://raw.githubusercontent.com/${spec.repository}/${spec.revision}/${spec.file}`;
  let error;
  for (let attempt = 0; attempt < 4 && !(bytes && digest(bytes) === spec.sha256); attempt++) {
    try {
      const response = await fetch(url, {signal: AbortSignal.timeout(180000)});
      if (!response.ok) throw new Error(`cardiovascular.glb download failed: ${response.status}`);
      bytes = Buffer.from(await response.arrayBuffer());
    } catch (e) {error = e; await new Promise(r => setTimeout(r, 1000 * 2 ** attempt));}
  }
  if (!bytes || digest(bytes) !== spec.sha256) throw error ?? new Error('cardiovascular.glb checksum mismatch');
  fs.writeFileSync(glbFile, bytes);
}

fs.writeFileSync(new URL('draco.cjs', cache), fs.readFileSync(new URL('public/draco/draco_wasm_wrapper.js', root)));
const draco = await createRequire(import.meta.url)(new URL('draco.cjs', cache).pathname)({wasmBinary: fs.readFileSync(new URL('public/draco/draco_decoder.wasm', root))});
const jsonLength = bytes.readUInt32LE(12), gltf = JSON.parse(bytes.subarray(20, 20 + jsonLength)), bin = bytes.subarray(28 + jsonLength);
const parents = new Map(), world = [];
gltf.nodes.forEach((n, i) => (n.children ?? []).forEach(c => parents.set(c, i)));
const matrix = i => {
  if (world[i]) return world[i];
  const n = gltf.nodes[i], m = n.matrix ? new T.Matrix4().fromArray(n.matrix) : new T.Matrix4().compose(new T.Vector3(...(n.translation ?? [0, 0, 0])), new T.Quaternion(...(n.rotation ?? [0, 0, 0, 1])), new T.Vector3(...(n.scale ?? [1, 1, 1])));
  const p = parents.get(i);
  return world[i] = p === undefined ? m : matrix(p).clone().multiply(m);
};

function decode(nodeIndex) {
  const node = gltf.nodes[nodeIndex], pos = [], idx = [], mat = matrix(nodeIndex), v3 = new T.Vector3();
  for (const p of gltf.meshes[node.mesh].primitives) {
    const ext = p.extensions.KHR_draco_mesh_compression, view = gltf.bufferViews[ext.bufferView], buffer = new draco.DecoderBuffer(), decoder = new draco.Decoder(), mesh = new draco.Mesh();
    const data = bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
    buffer.Init(data, data.length);
    if (!decoder.DecodeBufferToMesh(buffer, mesh).ok()) throw new Error(`Draco decode failed: ${node.name}`);
    const values = new draco.DracoFloat32Array();
    decoder.GetAttributeFloatForAllPoints(mesh, decoder.GetAttributeByUniqueId(mesh, ext.attributes.POSITION), values);
    const base = pos.length / 3, faces = new draco.DracoInt32Array();
    for (let k = 0; k < mesh.num_points(); k++) {
      v3.set(values.GetValue(k * 3), values.GetValue(k * 3 + 1), values.GetValue(k * 3 + 2)).applyMatrix4(mat);
      pos.push(v3.x, v3.y, v3.z);
    }
    for (let f = 0; f < mesh.num_faces(); f++) {decoder.GetFaceFromMesh(mesh, f, faces); idx.push(base + faces.GetValue(0), base + faces.GetValue(1), base + faces.GetValue(2));}
    for (const o of [values, faces, mesh, decoder, buffer]) draco.destroy(o);
  }
  return {pos, idx};
}
// Weld points that coincide (Draco keeps one point per attribute combination), drop degenerate triangles, then smooth normals.
function weld({pos, idx}) {
  const map = new Map(), positions = [], remap = new Uint32Array(pos.length / 3);
  for (let i = 0; i < remap.length; i++) {
    const key = `${pos[i * 3].toFixed(6)},${pos[i * 3 + 1].toFixed(6)},${pos[i * 3 + 2].toFixed(6)}`;
    let k = map.get(key);
    if (k === undefined) {k = positions.length / 3; map.set(key, k); positions.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);}
    remap[i] = k;
  }
  const indices = [];
  for (let i = 0; i < idx.length; i += 3) {const a = remap[idx[i]], b = remap[idx[i + 1]], c = remap[idx[i + 2]]; if (a !== b && b !== c && a !== c) indices.push(a, b, c);}
  return {positions: Float32Array.from(positions), indices: Uint32Array.from(indices)};
}
function normalsOf(positions, indices) {
  const n = new Float32Array(positions.length);
  for (let i = 0; i < indices.length; i += 3) {
    const [a, b, c] = [indices[i], indices[i + 1], indices[i + 2]];
    const ux = positions[b * 3] - positions[a * 3], uy = positions[b * 3 + 1] - positions[a * 3 + 1], uz = positions[b * 3 + 2] - positions[a * 3 + 2];
    const vx = positions[c * 3] - positions[a * 3], vy = positions[c * 3 + 1] - positions[a * 3 + 1], vz = positions[c * 3 + 2] - positions[a * 3 + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const k of [a, b, c]) {n[k * 3] += nx; n[k * 3 + 1] += ny; n[k * 3 + 2] += nz;}
  }
  const outN = new Int16Array(n.length);
  for (let i = 0; i < n.length; i += 3) {
    let l = Math.hypot(n[i], n[i + 1], n[i + 2]);
    if (l < 1e-18) {n[i] = 0; n[i + 1] = 1; n[i + 2] = 0; l = 1;}
    for (let k = 0; k < 3; k++) outN[i + k] = Math.round(n[i + k] / l * 32767);
  }
  return outN;
}

const byName = new Map(gltf.nodes.map((n, i) => [n.name, i]));
const chunks = [], parts = []; let slices = [], size = 0;
const append = data => {const pad = (4 - size % 4) % 4; if (pad) {slices.push(Buffer.alloc(pad)); size += pad;} const start = size; slices.push(data); size += data.length; return start;};
const flush = () => {
  if (!size) return;
  const data = Buffer.concat(slices), name = `heart-${digest(data).slice(0, 20)}.bin`, gzip = gzipSync(data, {level: 9});
  fs.writeFileSync(new URL(name, out), data); fs.writeFileSync(new URL(name + '.gz', out), gzip);
  chunks.push({url: '/models/stream/' + name, gzip: '/models/stream/' + name + '.gz', bytes: data.length, gzipBytes: gzip.length}); slices = []; size = 0;
};
// A few left-sided and tricuspid structures are missing from the Z-Anatomy export but exist in the BodyParts3D atlas the site already ships
// (spec.bodyparts3d). The Z-Anatomy heart sits a constant ~15 mm lower than the atlas heart, so the BodyParts3D pieces are moved by the mean
// offset of five structures present in both (spec.alignWith), which keeps the leaflets and papillary muscles inside the Z-Anatomy chambers.
const atlas = JSON.parse(gunzipSync(fs.readFileSync(new URL('public/models/atlas-stream.json.gz', root))));
const atlasById = new Map(atlas.parts.map(p => [p.id, p]));
const atlasChunk = new Map();
const atlasGeometry = id => {
  const p = atlasById.get(id); if (!p) throw new Error(`BodyParts3D piece not in the atlas: ${id}`);
  let raw = atlasChunk.get(p.chunk);
  if (!raw) {raw = fs.readFileSync(new URL('public' + atlas.chunks[p.chunk].url, root)); atlasChunk.set(p.chunk, raw);}
  const positions = positionsOf(raw, p);
  const indices = indicesOf(raw, p);
  return {p, positions, indices};
};
// The pericardial layers come from the schematic shells of the serous-membrane package (offsets of the BodyParts3D heart walls), moved by the same offset.
const serousManifest = JSON.parse(gunzipSync(fs.readFileSync(new URL('public/models/serous/serous-stream.json.gz', root))));
const serousChunk = new Map();
const serousGeometry = name => {
  const p = serousManifest.parts.find(x => x.name === name); if (!p) throw new Error(`Serous shell missing: ${name}`);
  let raw = serousChunk.get(p.chunk);
  if (!raw) {raw = fs.readFileSync(new URL('public' + serousManifest.chunks[p.chunk].url, root)); serousChunk.set(p.chunk, raw);}
  return {positions: new Float32Array(raw.buffer.slice(raw.byteOffset + p.positions, raw.byteOffset + p.positions + p.vertexCount * 12)), indices: new Uint32Array(raw.buffer.slice(raw.byteOffset + p.indices, raw.byteOffset + p.indices + p.indexCount * 4))};
};
const boundsOf = positions => {const b = [[Infinity, Infinity, Infinity], [-Infinity, -Infinity, -Infinity]]; for (let i = 0; i < positions.length; i += 3) for (let k = 0; k < 3; k++) {b[0][k] = Math.min(b[0][k], positions[i + k]); b[1][k] = Math.max(b[1][k], positions[i + k]);} return b;};
const centre = b => [0, 1, 2].map(k => (b[0][k] + b[1][k]) / 2);
const offset = [0, 0, 0];
for (const pair of spec.alignWith) {
  const z = boundsOf(weld(decode(byName.get(pair.node))).positions), a = atlasGeometry(pair.id).p.bounds;
  for (let k = 0; k < 3; k++) offset[k] += (centre(z)[k] - centre(a)[k]) / spec.alignWith.length;
}
console.log('BodyParts3D -> Z-Anatomy heart offset (mm):', offset.map(v => (v * 1000).toFixed(1)).join(', '));

// MJ-made structures, built once on the Z-Anatomy chambers (see scripts/lib/heart-mj.mjs).
// A builder asks for a source mesh by catalogue name: a shown Z-Anatomy part, or a reference piece (spec.references: Z-Anatomy node or BodyParts3D piece moved into the Z-Anatomy frame) that is not shown itself.
const sourceMesh = name => {
  const part = spec.parts.find(p => p.name === name), ref = (spec.references ?? []).find(r => r.name === name);
  if (part) return weld(decode(byName.get(part.node)));
  if (!ref) throw new Error(`MJ builder needs ${name}`);
  if (ref.node) return weld(decode(byName.get(ref.node)));
  const g = atlasGeometry(ref.id), moved = new Float32Array(g.positions.length);
  for (let i = 0; i < moved.length; i += 3) for (let k = 0; k < 3; k++) moved[i + k] = g.positions[i + k] + offset[k];
  return weld({pos: moved, idx: g.indices});
};
const mjGeometry = buildMjHeart(sourceMesh);
{ const apparatus = buildValveApparatus(sourceMesh); for (const r of apparatus.__report) if (process.env.HEART_REPORT) console.log(JSON.stringify(r)); delete apparatus.__report; Object.assign(mjGeometry, apparatus); }

const sources = [...spec.parts.map(part => ({part, geometry: () => {
  const nodeIndex = byName.get(part.node);
  if (nodeIndex === undefined || gltf.nodes[nodeIndex].mesh === undefined) throw new Error(`Node not found in the pinned export: ${part.node}`);
  return weld(decode(nodeIndex));
}})), ...(spec.bodyparts3d ?? []).map(part => ({part: {...part, node: part.id ?? part.match}, geometry: () => {
  // one atlas piece (`id`) or every atlas piece whose name matches (`match`, merged into one structure); moved into the Z-Anatomy heart frame
  const ids = part.id ? [part.id] : atlas.parts.filter(p => new RegExp(part.match).test(p.name)).map(p => p.id);
  if (!ids.length) throw new Error(`No BodyParts3D piece matches ${part.match}`);
  const pos = [], idx = [];
  for (const id of ids) {
   const g = atlasGeometry(id), base = pos.length / 3;
   for (let i = 0; i < g.positions.length; i += 3) for (let k = 0; k < 3; k++) pos.push(g.positions[i + k] + offset[k]);
   for (const i of g.indices) idx.push(base + i);
  }
  return weld({pos, idx});
}})),...(spec.serous ?? []).map(part => ({part: {...part, node: part.shell}, geometry: () => {
  const g = serousGeometry(part.shell), moved = new Float32Array(g.positions.length);
  for (let i = 0; i < moved.length; i += 3) for (let k = 0; k < 3; k++) moved[i + k] = g.positions[i + k] + offset[k];
  return dropStrays(weld({pos: moved, idx: g.indices}));
}})),...(spec.mj ?? []).map(part => ({part: {...part, node: part.build.join('+')}, geometry: () => {
  const list = part.build.map(k => {const g = mjGeometry[k]; if (!g) throw new Error(`MJ builder produced nothing for ${k}`); return g;});
  const positions = [], indices = []; for (const g of list) {const base = positions.length / 3; for (const v of g.positions) positions.push(v); for (const i of g.indices) indices.push(base + i);}
  return dropStrays(weld({pos: Float32Array.from(positions), idx: Uint32Array.from(indices)}));
}}))];
// Connected pieces of fewer than 12 triangles are cut-off slivers (a patch field that touches a triangle only at a corner): they are dropped so that a structure only holds real pieces.
function dropStrays({positions, indices}, minTriangles = 12) {
  const parent = new Int32Array(positions.length / 3).map((_, i) => i), find = x => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  for (let i = 0; i < indices.length; i += 3) { const a = find(indices[i]); parent[find(indices[i + 1])] = a; parent[find(indices[i + 2])] = a; }
  const count = new Map(); for (let i = 0; i < indices.length; i += 3) { const r = find(indices[i]); count.set(r, (count.get(r) ?? 0) + 1); }
  const keep = []; for (let i = 0; i < indices.length; i += 3) if (count.get(find(indices[i])) >= minTriangles) keep.push(indices[i], indices[i + 1], indices[i + 2]);
  return keep.length === indices.length ? {positions, indices} : weld({pos: positions, idx: Uint32Array.from(keep)});
}
// Plane clip of a mesh: keeps the part of the mesh with min <= coordinate[axis] <= max (triangles are cut, not dropped), so the venae cavae end shortly outside the right atrium.
function clipMesh({positions, indices}, axis, min, max) {
  const out = [], idx = [], at = i => [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]];
  const cut = (poly, keep, edge) => {
    const res = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], ina = keep(a), inb = keep(b);
      if (ina) res.push(a);
      if (ina !== inb) {const t = (edge - a[axis]) / (b[axis] - a[axis]); res.push(a.map((v, k) => v + (b[k] - v) * t));}
    }
    return res;
  };
  for (let i = 0; i < indices.length; i += 3) {
    let poly = [at(indices[i]), at(indices[i + 1]), at(indices[i + 2])];
    if (Number.isFinite(max)) poly = cut(poly, v => v[axis] <= max, max);
    if (poly.length && Number.isFinite(min)) poly = cut(poly, v => v[axis] >= min, min);
    if (poly.length < 3) continue;
    const base = out.length / 3; for (const v of poly) out.push(...v);
    for (let k = 1; k < poly.length - 1; k++) idx.push(base, base + k, base + k + 1);
  }
  return weld({pos: Float32Array.from(out), idx: Uint32Array.from(idx)});
}
// Semilunar cusps that sit off the centre of their valve ring are moved (as a group) in the ring plane (spec.semilunarAlign).
const shiftOf = new Map();
for (const group of spec.semilunarAlign ?? []) {
  const shift = semilunarShift(sourceMesh(group.chamber), group.loopNear, group.cusps.map(n => sourceMesh(n)));
  console.log(`${group.valve} cusps shifted ${(Math.hypot(...shift) * 1000).toFixed(1)} mm onto the valve ring`);
  for (const n of group.cusps) shiftOf.set(n, shift);
}
for (const {part, geometry} of sources) {
  const raw = geometry(), shift = shiftOf.get(part.name); if (shift) for (let i = 0; i < raw.positions.length; i += 3) for (let k = 0; k < 3; k++) raw.positions[i + k] += shift[k];
  const {positions, indices} = part.clip ? clipMesh(raw, part.clip.axis, part.clip.min ?? -Infinity, part.clip.max ?? Infinity) : raw, normals = normalsOf(positions, indices);
  const bounds = [[Infinity, Infinity, Infinity], [-Infinity, -Infinity, -Infinity]];
  for (let i = 0; i < positions.length; i += 3) for (let k = 0; k < 3; k++) {bounds[0][k] = Math.min(bounds[0][k], positions[i + k]); bounds[1][k] = Math.max(bounds[1][k], positions[i + k]);}
  const pos = Buffer.from(positions.buffer), nor = Buffer.from(normals.buffer), idx = Buffer.from(indices.buffer);
  if (size && size + pos.length + nor.length + idx.length > 900000) flush();
  parts.push({id: `HEART-${parts.length + 1}`, name: part.name, chinese: part.zh, group: part.group, system: part.system, description: {zh: part.zhDesc, en: part.enDesc}, node: part.node, ...(part.id || part.match ? {origin: 'BodyParts3D 4.0'} : part.shell ? {origin: 'schematic shell'} : part.build ? {origin: '示意構造'} : {}),
    chunk: chunks.length, vertexCount: positions.length / 3, indexCount: indices.length, bounds, positions: append(pos), normals: append(nor), indices: append(idx)});
}
flush();
const catalogue = {version: 1, source: `Z-Anatomy cardiovascular export (${spec.repository}@${spec.revision.slice(0, 12)}), derived from BodyParts3D`, license: spec.license,
  attribution: 'BodyParts3D - The Database Center for Life Science - CC-BY-SA 2.1 Japan; Z-Anatomy - The open source atlas of anatomy - CC-BY-SA 4.0',
  groups: spec.groups, parts, chunks};
fs.writeFileSync(new URL('heart-detail.json.gz', dir), gzipSync(Buffer.from(JSON.stringify(catalogue)), {level: 9}));
const triangles = parts.reduce((n, p) => n + p.indexCount / 3, 0);
const summary = `Heart detail: ${parts.length} structures, ${triangles.toLocaleString()} triangles, ${chunks.length} packages, ${(chunks.reduce((n, c) => n + c.gzipBytes, 0) / 1e6).toFixed(2)} MB compressed (${(chunks.reduce((n, c) => n + c.bytes, 0) / 1e6).toFixed(1)} MB raw).`;
console.log(summary); fs.writeFileSync(stampFile, stamp + '\n' + summary);
