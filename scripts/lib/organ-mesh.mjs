// Mesh helpers shared by the organ detail builders (scripts/build-organ-atlas.mjs). Plain indexed triangle meshes: {positions: Float32Array, indices: Uint32Array}.
import fs from 'node:fs';
import {MeshoptSimplifier} from 'meshoptimizer';
await MeshoptSimplifier.ready;

/** Reads the node meshes of a glb (all nodes with a mesh, first primitive) with their node matrix baked in. Positions are in the file's own units. */
export function readGlb(file) {
  const bytes = fs.readFileSync(file), json = JSON.parse(bytes.toString('utf8', 20, 20 + bytes.readUInt32LE(12))), binStart = 20 + bytes.readUInt32LE(12) + 8;
  const parents = new Map(); json.nodes.forEach((n, i) => (n.children ?? []).forEach(c => parents.set(c, i)));
  const local = n => { const m = new Array(16).fill(0); if (n.matrix) return n.matrix.slice(); const t = n.translation ?? [0, 0, 0], s = n.scale ?? [1, 1, 1], q = n.rotation ?? [0, 0, 0, 1];
    const [x, y, z, w] = q; const r = [1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w), 0, 2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w), 0, 2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y), 0];
    return [r[0] * s[0], r[1] * s[0], r[2] * s[0], 0, r[4] * s[1], r[5] * s[1], r[6] * s[1], 0, r[8] * s[2], r[9] * s[2], r[10] * s[2], 0, t[0], t[1], t[2], 1]; };
  const mul = (a, b) => { const o = new Array(16).fill(0); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k]; return o; };
  const world = i => { let m = local(json.nodes[i]); for (let p = parents.get(i); p !== undefined; p = parents.get(p)) m = mul(local(json.nodes[p]), m); return m; };
  const out = [];
  json.nodes.forEach((node, i) => {
    if (node.mesh === undefined) return;
    const prim = json.meshes[node.mesh].primitives[0], pa = json.accessors[prim.attributes.POSITION], ia = json.accessors[prim.indices];
    const off = a => binStart + (json.bufferViews[a.bufferView].byteOffset ?? 0) + (a.byteOffset ?? 0);
    const src = new Float32Array(bytes.buffer.slice(bytes.byteOffset + off(pa), bytes.byteOffset + off(pa) + pa.count * 12));
    const Type = ia.componentType === 5125 ? Uint32Array : ia.componentType === 5123 ? Uint16Array : Uint8Array;
    const indices = Uint32Array.from(new Type(bytes.buffer.slice(bytes.byteOffset + off(ia), bytes.byteOffset + off(ia) + ia.count * Type.BYTES_PER_ELEMENT)));
    const m = world(i), positions = new Float32Array(src.length);
    for (let v = 0; v < pa.count; v++) { const x = src[v * 3], y = src[v * 3 + 1], z = src[v * 3 + 2];
      positions[v * 3] = m[0] * x + m[4] * y + m[8] * z + m[12]; positions[v * 3 + 1] = m[1] * x + m[5] * y + m[9] * z + m[13]; positions[v * 3 + 2] = m[2] * x + m[6] * y + m[10] * z + m[14]; }
    out.push({node: i, name: node.name, label: node.extras?.label, positions, indices});
  });
  return out;
}

/** Merge coincident vertices (within `eps`) and drop degenerate triangles. */
export function weld(positions, indices, eps = 1e-7) {
  const map = new Map(), remap = new Uint32Array(positions.length / 3), keep = [];
  for (let v = 0; v < positions.length / 3; v++) {
    const key = [0, 1, 2].map(a => Math.round(positions[v * 3 + a] / eps)).join(',');
    if (!map.has(key)) { map.set(key, keep.length); keep.push(v); }
    remap[v] = map.get(key);
  }
  const pos = new Float32Array(keep.length * 3); keep.forEach((v, i) => pos.set(positions.subarray(v * 3, v * 3 + 3), i * 3));
  const idx = []; for (let t = 0; t < indices.length; t += 3) { const a = remap[indices[t]], b = remap[indices[t + 1]], c = remap[indices[t + 2]]; if (a !== b && b !== c && a !== c) idx.push(a, b, c); }
  return {positions: pos, indices: Uint32Array.from(idx)};
}

/** Meshopt simplification to about `ratio` of the triangles; `error` is relative to the mesh extent. */
export function simplify(positions, indices, ratio, error = .01) {
  const target = Math.max(60, Math.floor(indices.length * ratio / 3) * 3);
  if (target >= indices.length) return {positions, indices};
  const [out] = MeshoptSimplifier.simplify(indices, positions, 3, target, error);
  return compact(positions, out);
}

/** Drop vertices that no triangle uses. */
export function compact(positions, indices) {
  const remap = new Int32Array(positions.length / 3).fill(-1), keep = [];
  for (const i of indices) if (remap[i] < 0) { remap[i] = keep.length; keep.push(i); }
  const pos = new Float32Array(keep.length * 3); keep.forEach((v, i) => pos.set(positions.subarray(v * 3, v * 3 + 3), i * 3));
  return {positions: pos, indices: Uint32Array.from(indices, i => remap[i])};
}

/** Loop subdivision (with the boundary rule for open edges): each level splits every triangle in four and smooths. */
export function loopSubdivide(positions, indices, levels = 1) {
  let pos = positions, idx = indices;
  for (let l = 0; l < levels; l++) {
    const n = pos.length / 3, edgeKey = (a, b) => a < b ? a * n + b : b * n + a, edges = new Map();
    for (let t = 0; t < idx.length; t += 3) for (let k = 0; k < 3; k++) { const a = idx[t + k], b = idx[t + (k + 1) % 3], c = idx[t + (k + 2) % 3], key = edgeKey(a, b);
      const e = edges.get(key) ?? {a, b, opp: [], n: 0}; e.opp.push(c); e.n++; edges.set(key, e); }
    const nbr = Array.from({length: n}, () => new Set()), bnbr = Array.from({length: n}, () => []);
    for (const e of edges.values()) { nbr[e.a].add(e.b); nbr[e.b].add(e.a); if (e.n === 1) { bnbr[e.a].push(e.b); bnbr[e.b].push(e.a); } }
    const out = new Float32Array((n + edges.size) * 3), P = v => [pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]];
    for (let v = 0; v < n; v++) {
      const p = P(v); let q;
      if (bnbr[v].length === 2) { const a = P(bnbr[v][0]), b = P(bnbr[v][1]); q = p.map((x, i) => .75 * x + .125 * (a[i] + b[i])); }
      else if (bnbr[v].length > 2 || nbr[v].size < 3) q = p;
      else { const k = nbr[v].size, beta = k === 3 ? 3 / 16 : 3 / (8 * k), s = [0, 0, 0]; for (const w of nbr[v]) { const a = P(w); for (let i = 0; i < 3; i++) s[i] += a[i]; } q = p.map((x, i) => (1 - k * beta) * x + beta * s[i]); }
      out.set(q, v * 3);
    }
    const mid = new Map(); let next = n;
    for (const [key, e] of edges) { const a = P(e.a), b = P(e.b); let q;
      if (e.n === 2) { const c = P(e.opp[0]), d = P(e.opp[1]); q = a.map((x, i) => .375 * (x + b[i]) + .125 * (c[i] + d[i])); } else q = a.map((x, i) => .5 * (x + b[i]));
      out.set(q, next * 3); mid.set(key, next++); }
    const ni = []; for (let t = 0; t < idx.length; t += 3) { const [a, b, c] = [idx[t], idx[t + 1], idx[t + 2]], ab = mid.get(edgeKey(a, b)), bc = mid.get(edgeKey(b, c)), ca = mid.get(edgeKey(c, a));
      ni.push(a, ab, ca, b, bc, ab, c, ca, bc, ab, bc, ca); }
    pos = out; idx = Uint32Array.from(ni);
  }
  return {positions: pos, indices: idx};
}

export function vertexNormals(positions, indices) {
  const nrm = new Float32Array(positions.length);
  for (let t = 0; t < indices.length; t += 3) { const [a, b, c] = [indices[t] * 3, indices[t + 1] * 3, indices[t + 2] * 3];
    const ux = positions[b] - positions[a], uy = positions[b + 1] - positions[a + 1], uz = positions[b + 2] - positions[a + 2], vx = positions[c] - positions[a], vy = positions[c + 1] - positions[a + 1], vz = positions[c + 2] - positions[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; for (const i of [a, b, c]) { nrm[i] += nx; nrm[i + 1] += ny; nrm[i + 2] += nz; } }
  for (let v = 0; v < nrm.length; v += 3) { const l = Math.hypot(nrm[v], nrm[v + 1], nrm[v + 2]) || 1; nrm[v] /= l; nrm[v + 1] /= l; nrm[v + 2] /= l; }
  return nrm;
}

/** Adjacency with edge lengths for geodesic searches over the vertices. */
export function graphOf(positions, indices) {
  const n = positions.length / 3, adj = Array.from({length: n}, () => new Map());
  const d = (a, b) => Math.hypot(positions[a * 3] - positions[b * 3], positions[a * 3 + 1] - positions[b * 3 + 1], positions[a * 3 + 2] - positions[b * 3 + 2]);
  for (let t = 0; t < indices.length; t += 3) for (let k = 0; k < 3; k++) { const a = indices[t + k], b = indices[t + (k + 1) % 3]; const w = d(a, b); adj[a].set(b, w); adj[b].set(a, w); }
  return adj;
}

/** Multi-source Dijkstra. `sources`: vertex ids (distance 0); optional `weight(a,b,w)` to bend the metric. Returns {dist, prev, src}. */
export function dijkstra(adj, sources, weight) {
  const n = adj.length, dist = new Float64Array(n).fill(Infinity), prev = new Int32Array(n).fill(-1), src = new Int32Array(n).fill(-1);
  const heap = []; const push = (d, v) => { heap.push([d, v]); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { let l = 2 * i + 1, r = l + 1, m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
  for (const s of sources) { dist[s] = 0; src[s] = s; push(0, s); }
  while (heap.length) { const [d, v] = pop(); if (d > dist[v]) continue; for (const [w, len] of adj[v]) { const nd = d + (weight ? weight(v, w, len) : len); if (nd < dist[w]) { dist[w] = nd; prev[w] = v; src[w] = src[v]; push(nd, w); } } }
  return {dist, prev, src};
}

export const boundsOf = pos => { const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity]; for (let i = 0; i < pos.length; i++) { const a = i % 3; if (pos[i] < lo[a]) lo[a] = pos[i]; if (pos[i] > hi[a]) hi[a] = pos[i]; } return [lo, hi]; };

/** Writes the package: one binary (positions Float32, normals Int16 snorm, indices Uint32, label bytes) and a manifest. */
export class AtlasWriter {
  constructor() { this.segments = []; this.offset = 0; this.parts = []; }
  push(array) { const at = this.offset, b = Buffer.from(array.buffer, array.byteOffset, array.byteLength); this.segments.push(b); this.offset += b.length; const pad = (4 - this.offset % 4) % 4; if (pad) { this.segments.push(Buffer.alloc(pad)); this.offset += pad; } return at; }
  addMesh(id, positions, indices, extra = {}) {
    const nrm = vertexNormals(positions, indices), n16 = Int16Array.from(nrm, x => Math.round(x * 32767));
    const part = {id, vertexCount: positions.length / 3, indexCount: indices.length, bounds: boundsOf(positions), positions: this.push(positions), normals: this.push(n16), indices: this.push(indices), ...extra};
    this.parts.push(part); return part;
  }
  addBytes(array) { return this.push(array); }
  binary() { return Buffer.concat(this.segments); }
}

/** Cuts a mesh with the plane n·p = d and keeps the side where n·p <= d. Triangles that cross the plane are split exactly, so the new edge is straight. */
export function clipPlane(positions, indices, n, d) {
  const out = Array.from(positions), edge = new Map(), idx = [];
  const s = v => n[0] * positions[v * 3] + n[1] * positions[v * 3 + 1] + n[2] * positions[v * 3 + 2] - d;
  const cut = (a, b) => { const key = a < b ? `${a}_${b}` : `${b}_${a}`; if (edge.has(key)) return edge.get(key); const t = s(a) / (s(a) - s(b)), i = out.length / 3;
    for (let k = 0; k < 3; k++) out.push(positions[a * 3 + k] + (positions[b * 3 + k] - positions[a * 3 + k]) * t); edge.set(key, i); return i; };
  for (let t = 0; t < indices.length; t += 3) {
    const tri = [indices[t], indices[t + 1], indices[t + 2]], inside = tri.map(v => s(v) <= 0), k = inside.filter(Boolean).length;
    if (k === 3) idx.push(...tri);
    else if (k === 1) { const i = inside.indexOf(true), a = tri[i], b = tri[(i + 1) % 3], c = tri[(i + 2) % 3]; idx.push(a, cut(a, b), cut(c, a)); }
    else if (k === 2) { const o = inside.indexOf(false), a = tri[o], b = tri[(o + 1) % 3], c = tri[(o + 2) % 3]; const ab = cut(a, b), ca = cut(c, a); idx.push(b, c, ca, b, ca, ab); }
  }
  return compact(Float32Array.from(out), Uint32Array.from(idx));
}

/** Distance from point p to the polyline pts (array of [x,y,z]). */
export function distToPolyline(p, pts) {
  let best = Infinity;
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1], ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
    const l2 = ab[0] * ab[0] + ab[1] * ab[1] + ab[2] * ab[2], t = l2 ? Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / l2)) : 0;
    const d = Math.hypot(ap[0] - ab[0] * t, ap[1] - ab[1] * t, ap[2] - ab[2] * t); if (d < best) best = d;
  }
  return best;
}
/** Smooths a polyline with a moving average (ends kept), `radius` points each side. */
export function smoothPolyline(pts, radius = 4, passes = 2) {
  let cur = pts.map(p => p.slice());
  for (let r = 0; r < passes; r++) cur = cur.map((p, i) => { if (i === 0 || i === cur.length - 1) return p; const lo = Math.max(0, i - radius), hi = Math.min(cur.length - 1, i + radius), k = Math.min(i - lo, hi - i), a = i - k, b = i + k, s = [0, 0, 0];
    for (let j = a; j <= b; j++) for (let c = 0; c < 3; c++) s[c] += cur[j][c] / (b - a + 1); return s; });
  return cur;
}
