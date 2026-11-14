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

/**
 * Winding of the closed pieces of a mesh: every closed, manifold connected piece gets one consistent orientation (neighbouring triangles traverse their shared edge in opposite directions) and is
 * turned outward (positive signed volume). 585 closed meshes of the atlas (tubes, vessel ends, the Z-Anatomy retinacula mirrored to the left side) were inside out or had a cap wound against its
 * sides; the stored normals followed the inverted winding and, with double-sided materials, the inverted pieces lit up dark or as flat patches wherever the shader or the surface-normal update did not
 * flip them. Open pieces (sheets) are left as they are. Returns the number of triangles flipped; `indices` is changed in place.
 */
export function orientClosedPieces(positions, indices) {
  const T = indices.length / 3, edge = new Map(), add = (a, b, t) => { const k = a * 4294967296 + b; (edge.get(k) || edge.set(k, []).get(k)).push(t); };
  for (let t = 0; t < T; t++) { const a = indices[t * 3], b = indices[t * 3 + 1], c = indices[t * 3 + 2]; add(a, b, t); add(b, c, t); add(c, a, t); }
  const twin = (a, b) => { const l = edge.get(b * 4294967296 + a); return l; };
  const dirOf = (t, a, b) => { const x = indices[t * 3], y = indices[t * 3 + 1], z = indices[t * 3 + 2]; return (x === a && y === b) || (y === a && z === b) || (z === a && x === b); };
  const piece = new Int32Array(T).fill(-1), flip = new Uint8Array(T), pieces = []; let ok;
  for (let seed = 0; seed < T; seed++) {
    if (piece[seed] >= 0) continue;
    const id = pieces.length, members = [seed], stack = [seed]; piece[seed] = id; let closed = true, manifold = true;
    while (stack.length) {
      const t = stack.pop(), v = [indices[t * 3], indices[t * 3 + 1], indices[t * 3 + 2]];
      for (let e = 0; e < 3; e++) {
        const a = v[e], b = v[(e + 1) % 3], same = edge.get(a * 4294967296 + b) || [], opp = twin(a, b) || [];
        const nbrs = [...same.filter(u => u !== t), ...opp];
        if (same.length + opp.length !== 2) { if (same.length + opp.length === 1) closed = false; else manifold = false; }
        for (const u of nbrs) {
          if (piece[u] >= 0) continue;
          piece[u] = id; members.push(u);
          // orientation of u relative to t: a neighbour that traverses (a,b) in the same direction must be flipped (as seen from t's final orientation)
          const sameDir = dirOf(u, a, b); flip[u] = (flip[t] ^ (sameDir ? 1 : 0)); stack.push(u);
        }
      }
    }
    pieces.push({members, closed, manifold});
  }
  let flipped = 0;
  for (const {members, closed, manifold} of pieces) {
    if (!closed || !manifold || members.length < 4) continue;
    let vol = 0;
    for (const t of members) {
      let a = indices[t * 3], b = indices[t * 3 + 1], c = indices[t * 3 + 2]; if (flip[t]) [b, c] = [c, b];
      vol += positions[a * 3] * (positions[b * 3 + 1] * positions[c * 3 + 2] - positions[b * 3 + 2] * positions[c * 3 + 1]) - positions[a * 3 + 1] * (positions[b * 3] * positions[c * 3 + 2] - positions[b * 3 + 2] * positions[c * 3]) + positions[a * 3 + 2] * (positions[b * 3] * positions[c * 3 + 1] - positions[b * 3 + 1] * positions[c * 3]);
    }
    const reverse = vol < 0;
    for (const t of members) if (flip[t] ^ (reverse ? 1 : 0)) { const b = indices[t * 3 + 1]; indices[t * 3 + 1] = indices[t * 3 + 2]; indices[t * 3 + 2] = b; flipped++; }
  }
  return flipped;
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
      indices = Uint32Array.from(indices); orientClosedPieces(positions, indices);
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
