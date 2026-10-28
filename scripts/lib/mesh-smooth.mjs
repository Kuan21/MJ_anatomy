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
    // Open ends stay where they are: a vessel shortened by a millimetre at each end would leave a gap where it meets its neighbour.
    if (bn.length > 0 || neighbours[v].size === 0) { for (let k = 0; k < 3; k++) out[v * 3 + k] = pos[v * 3 + k]; continue; }
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

const area = (pos, idx) => {
  let a = 0;
  for (let t = 0; t < idx.length; t += 3) {
    const i = idx[t] * 3, j = idx[t + 1] * 3, k = idx[t + 2] * 3;
    const ux = pos[j] - pos[i], uy = pos[j + 1] - pos[i + 1], uz = pos[j + 2] - pos[i + 2], vx = pos[k] - pos[i], vy = pos[k + 1] - pos[i + 1], vz = pos[k + 2] - pos[i + 2];
    a += Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) / 2;
  }
  return a;
};

/**
 * Welded + one Loop step, as float32 positions, 32-bit indices and packed normals.
 * Loop shrinks a prism towards its axis (a 5-sided tube of 5 mm radius loses about a millimetre), so the interior vertices are moved back out along
 * their normals by the radius the step took away: the mean tube radius, area / (2 pi length), is the same before and after. Open ends do not move.
 */
export function smoothTube(positions, indices) {
  const w = weld(positions, indices), s = loopSubdivide(w.pos, w.idx);
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < w.pos.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], w.pos[i + k]); hi[k] = Math.max(hi[k], w.pos[i + k]); }
  const length = Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) || 1;
  const delta = Math.max(0, (area(w.pos, w.idx) - area(s.pos, s.idx)) / (2 * Math.PI * length));
  // vertices on open edges (ends of the tube) are fixed
  const count = new Map();
  for (let t = 0; t < s.idx.length; t += 3) for (let k = 0; k < 3; k++) { const a = s.idx[t + k], b = s.idx[t + (k + 1) % 3], e = a < b ? a * (s.pos.length / 3) + b : b * (s.pos.length / 3) + a; count.set(e, (count.get(e) ?? 0) + 1); }
  const fixed = new Uint8Array(s.pos.length / 3), n = s.pos.length / 3;
  for (const [e, c] of count) if (c !== 2) { fixed[Math.floor(e / n)] = 1; fixed[e % n] = 1; }
  // outward direction at a vertex: away from the average of its neighbours (on a convex tube the neighbours lie around the axis); it does not depend on triangle winding
  const nb = Array.from({length: n}, () => new Set());
  for (let t = 0; t < s.idx.length; t += 3) for (let k = 0; k < 3; k++) { const a = s.idx[t + k], b = s.idx[t + (k + 1) % 3]; nb[a].add(b); nb[b].add(a); }
  const pos = Float64Array.from(s.pos), step = Math.min(delta, .002);
  for (let v = 0; v < n; v++) {
    if (fixed[v] || !nb[v].size) continue;
    const d = [0, 0, 0]; for (const u of nb[v]) for (let k = 0; k < 3; k++) d[k] += s.pos[u * 3 + k] / nb[v].size;
    for (let k = 0; k < 3; k++) d[k] = s.pos[v * 3 + k] - d[k];
    const l = Math.hypot(d[0], d[1], d[2]); if (l < 1e-9) continue;
    for (let k = 0; k < 3; k++) pos[v * 3 + k] += d[k] / l * step;
  }
  return {positions: Float32Array.from(pos), indices: s.idx, normals: packedNormals(pos, s.idx)};
}

