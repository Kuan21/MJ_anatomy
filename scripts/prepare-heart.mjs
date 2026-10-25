// Heart detail model: the heart, its valves with chordae tendineae, papillary muscles, coronary arteries/veins and the adjoining great vessels,
// taken from the Z-Anatomy cardiovascular export (a BodyParts3D derivative, CC BY-SA 4.0 / 2.1 Japan). The pinned glb is verified, only the
// allow-listed nodes (scripts/heart-parts.json) are decoded, welded and repacked into a small gzip package that the viewer loads on demand.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {createRequire} from 'node:module';
import * as T from 'three';

const root = new URL('../', import.meta.url);
const spec = JSON.parse(fs.readFileSync(new URL('scripts/heart-parts.json', root), 'utf8'));
const cache = new URL('work/', root), out = new URL('public/models/stream/', root), dir = new URL('public/models/heart/', root);
for (const d of [cache, out, dir]) fs.mkdirSync(d, {recursive: true});
const digest = b => createHash('sha256').update(b).digest('hex');

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
for (const part of spec.parts) {
  const nodeIndex = byName.get(part.node);
  if (nodeIndex === undefined || gltf.nodes[nodeIndex].mesh === undefined) throw new Error(`Node not found in the pinned export: ${part.node}`);
  const {positions, indices} = weld(decode(nodeIndex)), normals = normalsOf(positions, indices);
  const bounds = [[Infinity, Infinity, Infinity], [-Infinity, -Infinity, -Infinity]];
  for (let i = 0; i < positions.length; i += 3) for (let k = 0; k < 3; k++) {bounds[0][k] = Math.min(bounds[0][k], positions[i + k]); bounds[1][k] = Math.max(bounds[1][k], positions[i + k]);}
  const pos = Buffer.from(positions.buffer), nor = Buffer.from(normals.buffer), idx = Buffer.from(indices.buffer);
  if (size && size + pos.length + nor.length + idx.length > 900000) flush();
  parts.push({id: `HEART-${parts.length + 1}`, name: part.name, chinese: part.zh, group: part.group, system: part.system, description: {zh: part.zhDesc, en: part.enDesc}, node: part.node,
    chunk: chunks.length, vertexCount: positions.length / 3, indexCount: indices.length, bounds, positions: append(pos), normals: append(nor), indices: append(idx)});
}
flush();
const catalogue = {version: 1, source: `Z-Anatomy cardiovascular export (${spec.repository}@${spec.revision.slice(0, 12)}), derived from BodyParts3D`, license: spec.license,
  attribution: 'BodyParts3D - The Database Center for Life Science - CC-BY-SA 2.1 Japan; Z-Anatomy - The open source atlas of anatomy - CC-BY-SA 4.0',
  groups: spec.groups, parts, chunks};
fs.writeFileSync(new URL('heart-detail.json.gz', dir), gzipSync(Buffer.from(JSON.stringify(catalogue)), {level: 9}));
const triangles = parts.reduce((n, p) => n + p.indexCount / 3, 0);
console.log(`Heart detail: ${parts.length} structures, ${triangles.toLocaleString()} triangles, ${chunks.length} packages, ${(chunks.reduce((n, c) => n + c.gzipBytes, 0) / 1e6).toFixed(2)} MB compressed (${(chunks.reduce((n, c) => n + c.bytes, 0) / 1e6).toFixed(1)} MB raw).`);
