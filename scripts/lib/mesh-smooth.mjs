// Smooths low-polygon tubes (vessels): one Loop subdivision step on the welded surface, then area-weighted vertex normals.
// The atlas was simplified to about a fifth of its triangles, so a vessel of a few millimetres is a 5- or 6-sided prism; one step turns the
// cross-section into a 10- or 12-gon with smooth normals, which reads as round at any zoom the viewer allows.
// Positions are welded first (the source repeats vertices along seams), so the result is one manifold-ish indexed mesh; open ends stay open.

const key = (x, y, z) => `${Math.round(x * 1e6)},${Math.round(y * 1e6)},${Math.round(z * 1e6)}`;

/** Merge vertices that share a position. Returns {pos (Float64Array), idx (Uint32Array without degenerate triangles)}. */
export function weld(positions, indices) {
  const map = new Map(), pos = [], remap = new Uint32Array(positions.length / 3);
  for (let i = 0; i < remap.length; i++) {
    const k = key(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
    let v = map.get(k); if (v === undefined) { v = pos.length / 3; map.set(k, v); pos.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]); }
    remap[i] = v;
  }
  const idx = [];
  for (let t = 0; t < indices.length; t += 3) { const a = remap[indices[t]], b = remap[indices[t + 1]], c = remap[indices[t + 2]]; if (a !== b && b !== c && a !== c) idx.push(a, b, c); }
  return {pos: Float64Array.from(pos), idx: Uint32Array.from(idx)};
}

/** One Loop subdivision step. */
export function loopSubdivide(pos, idx) {
  const n = pos.length / 3, edgeKey = (a, b) => a < b ? a * n + b : b * n + a;
  // edge -> opposite vertices of the triangles that share it
  const edges = new Map();
  for (let t = 0; t < idx.length; t += 3) for (let k = 0; k < 3; k++) {
    const a = idx[t + k], b = idx[t + (k + 1) % 3], c = idx[t + (k + 2) % 3], e = edgeKey(a, b);
    let rec = edges.get(e); if (!rec) { rec = {a: Math.min(a, b), b: Math.max(a, b), opp: []}; edges.set(e, rec); } rec.opp.push(c);
  }
  const neighbours = Array.from({length: n}, () => new Set()), boundaryNeighbours = Array.from({length: n}, () => []);
  for (const e of edges.values()) {
    neighbours[e.a].add(e.b); neighbours[e.b].add(e.a);
    if (e.opp.length !== 2) { boundaryNeighbours[e.a].push(e.b); boundaryNeighbours[e.b].push(e.a); }
  }
  const out = new Float64Array((n + edges.size) * 3), mid = new Map();
  // even (old) vertices
  for (let v = 0; v < n; v++) {
    const bn = boundaryNeighbours[v];
    if (bn.length === 2) { for (let k = 0; k < 3; k++) out[v * 3 + k] = .75 * pos[v * 3 + k] + .125 * (pos[bn[0] * 3 + k] + pos[bn[1] * 3 + k]); continue; }
    if (bn.length > 2 || neighbours[v].size === 0) { for (let k = 0; k < 3; k++) out[v * 3 + k] = pos[v * 3 + k]; continue; }
    const m = neighbours[v].size, beta = m === 3 ? 3 / 16 : 3 / (8 * m);
    for (let k = 0; k < 3; k++) { let s = 0; for (const u of neighbours[v]) s += pos[u * 3 + k]; out[v * 3 + k] = (1 - m * beta) * pos[v * 3 + k] + beta * s; }
  }
  // odd (edge) vertices
  let next = n;
  for (const [e, r] of edges) {
    mid.set(e, next);
    for (let k = 0; k < 3; k++) {
      out[next * 3 + k] = r.opp.length === 2
        ? .375 * (pos[r.a * 3 + k] + pos[r.b * 3 + k]) + .125 * (pos[r.opp[0] * 3 + k] + pos[r.opp[1] * 3 + k])
        : .5 * (pos[r.a * 3 + k] + pos[r.b * 3 + k]);
    }
    next++;
  }
  const idx2 = new Uint32Array(idx.length * 4);
  for (let t = 0, o = 0; t < idx.length; t += 3, o += 12) {
    const a = idx[t], b = idx[t + 1], c = idx[t + 2], ab = mid.get(edgeKey(a, b)), bc = mid.get(edgeKey(b, c)), ca = mid.get(edgeKey(c, a));
    idx2.set([a, ab, ca, b, bc, ab, c, ca, bc, ab, bc, ca], o);
  }
  return {pos: out, idx: idx2};
}

/** Area-weighted vertex normals as normalised signed 16-bit integers (the viewer's packing). */
export function packedNormals(pos, idx) {
  const sums = new Float64Array(pos.length);
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2], vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    const x = uy * vz - uz * vy, y = uz * vx - ux * vz, z = ux * vy - uy * vx;
    for (const i of [a, b, c]) { sums[i] += x; sums[i + 1] += y; sums[i + 2] += z; }
  }
  const out = new Int16Array(pos.length);
  for (let i = 0; i < pos.length; i += 3) {
    const l = Math.hypot(sums[i], sums[i + 1], sums[i + 2]) || 1;
    out[i] = Math.round(sums[i] / l * 32767); out[i + 1] = Math.round(sums[i + 1] / l * 32767); out[i + 2] = Math.round(sums[i + 2] / l * 32767);
  }
  return out;
}

/** Welded + one Loop step, as float32 positions, 32-bit indices and packed normals. */
export function smoothTube(positions, indices) {
  const w = weld(positions, indices), s = loopSubdivide(w.pos, w.idx);
  return {positions: Float32Array.from(s.pos), indices: s.idx, normals: packedNormals(s.pos, s.idx)};
}
