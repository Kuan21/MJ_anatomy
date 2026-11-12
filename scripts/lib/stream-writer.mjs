// Shared packaging for derived organ streams: gzip packages of positions/normals/indices plus a manifest the viewer merges into the atlas.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {MeshoptSimplifier} from 'meshoptimizer';

export const digest = b => createHash('sha256').update(b).digest('hex');

export function normalsOf(positions, indices) {
  const n = new Float32Array(positions.length);
  for (let i = 0; i < indices.length; i += 3) {
    const [a, b, c] = [indices[i], indices[i + 1], indices[i + 2]];
    const ux = positions[b * 3] - positions[a * 3], uy = positions[b * 3 + 1] - positions[a * 3 + 1], uz = positions[b * 3 + 2] - positions[a * 3 + 2];
    const vx = positions[c * 3] - positions[a * 3], vy = positions[c * 3 + 1] - positions[a * 3 + 1], vz = positions[c * 3 + 2] - positions[a * 3 + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const k of [a, b, c]) { n[k * 3] += nx; n[k * 3 + 1] += ny; n[k * 3 + 2] += nz; }
  }
  const out = new Int16Array(n.length), centre = [0, 0, 0];
  for (let i = 0; i < positions.length; i += 3) for (let k = 0; k < 3; k++) centre[k] += positions[i + k] / (positions.length / 3);
  for (let i = 0; i < n.length; i += 3) {
    let l = Math.hypot(n[i], n[i + 1], n[i + 2]);
    if (l < 1e-18) { for (let k = 0; k < 3; k++) n[i + k] = positions[i + k] - centre[k]; l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1; if (!n[i] && !n[i + 1] && !n[i + 2]) { n[i + 1] = 1; l = 1; } }
    for (let k = 0; k < 3; k++) out[i + k] = Math.round(n[i + k] / l * 32767);
  }
  return out;
}

/** Weld coincident vertices (quantised to 0.01 mm) so surfaces from sources with split seams offset and simplify cleanly. */
export function weldByPosition(positions, indices) {
  const map = new Map(), out = [], remap = new Uint32Array(positions.length / 3);
  for (let i = 0; i < remap.length; i++) {
    const key = `${Math.round(positions[i * 3] * 1e5)},${Math.round(positions[i * 3 + 1] * 1e5)},${Math.round(positions[i * 3 + 2] * 1e5)}`;
    let k = map.get(key); if (k === undefined) { k = out.length / 3; map.set(key, k); out.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]); }
    remap[i] = k;
  }
  const idx = new Uint32Array(indices.length), kept = [];
  for (let t = 0; t < indices.length; t += 3) { const a = remap[indices[t]], b = remap[indices[t + 1]], c = remap[indices[t + 2]]; if (a !== b && b !== c && a !== c) kept.push(a, b, c); }
  return {positions: Float32Array.from(out), indices: Uint32Array.from(kept)};
}

export async function simplify(positions, indices, maxTriangles, error = .004, flags = []) {
  await MeshoptSimplifier.ready;
  if (indices.length / 3 <= maxTriangles) return {positions, indices};
  const [simplified] = MeshoptSimplifier.simplify(indices, positions, 3, maxTriangles * 3, error, flags);
  const [remap, vertexCount] = MeshoptSimplifier.compactMesh(simplified);
  const next = new Float32Array(vertexCount * 3);
  for (let old = 0; old < remap.length; old++) { const k = remap[old]; if (k !== 0xffffffff) next.set(positions.subarray(old * 3, old * 3 + 3), k * 3); }
  return {positions: next, indices: simplified};
}

export function createStream(outDir, prefix) {
  const chunks = [], parts = []; let slices = [], size = 0;
  const append = data => { const pad = (4 - size % 4) % 4; if (pad) { slices.push(Buffer.alloc(pad)); size += pad; } const start = size; slices.push(data); size += data.length; return start; };
  const flush = () => {
    if (!size) return;
    const data = Buffer.concat(slices), name = `${prefix}-${digest(data).slice(0, 20)}.bin`, gzip = gzipSync(data, {level: 9});
    fs.writeFileSync(new URL(name, outDir), data); fs.writeFileSync(new URL(name + '.gz', outDir), gzip);
    chunks.push({url: '/models/stream/' + name, gzip: '/models/stream/' + name + '.gz', bytes: data.length, gzipBytes: gzip.length}); slices = []; size = 0;
  };
  return {
    add(meta, positions, indices) {
      const normals = normalsOf(positions, indices), bounds = [[Infinity, Infinity, Infinity], [-Infinity, -Infinity, -Infinity]];
      for (let i = 0; i < positions.length; i += 3) for (let k = 0; k < 3; k++) { bounds[0][k] = Math.min(bounds[0][k], positions[i + k]); bounds[1][k] = Math.max(bounds[1][k], positions[i + k]); }
      const pos = Buffer.from(positions.buffer, positions.byteOffset, positions.byteLength), nor = Buffer.from(normals.buffer), idx = Buffer.from(indices.buffer, indices.byteOffset, indices.byteLength);
      if (size && size + pos.length + nor.length + idx.length > 750000) flush();
      parts.push({...meta, chunk: chunks.length, vertexCount: positions.length / 3, indexCount: indices.length, bounds, positions: append(pos), normals: append(nor), indices: append(idx)});
    },
    finish(manifest, file) {
      flush();
      fs.mkdirSync(new URL('.', file), {recursive: true});
      fs.writeFileSync(file, gzipSync(Buffer.from(JSON.stringify({...manifest, parts, chunks})), {level: 9}));
      return {parts: parts.length, chunks: chunks.length, gzipBytes: chunks.reduce((n, c) => n + c.gzipBytes, 0)};
    },
  };
}
