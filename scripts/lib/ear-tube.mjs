// Measuring and slimming of tube-like closed meshes (nerves, tubes) of the ear atlas, and Loop subdivision of the auricle.
// Everything works on flat Float32/Float64 position arrays and Uint32 index arrays, in the units of the caller (the build uses specimen millimetres; the test uses metres and scales).
import {signedVolume, v3} from './ear-geometry.mjs';
import {vertexNormals} from './ear-mesh-io.mjs';

/** Area-weighted unit normals pointing outward (flipped when the volume of the mesh is negative). */
export const outwardNormals = (pos, idx) => {
  const n16 = vertexNormals(pos, idx), sign = signedVolume(pos, idx) < 0 ? -1 : 1, out = new Float64Array(n16.length);
  for (let i = 0; i < n16.length; i++) out[i] = sign * n16[i] / 32767;
  return out;
};

const grid = (pos, cell) => {
  const g = new Map(), key = (x, y, z) => `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`;
  for (let i = 0; i < pos.length; i += 3) { const k = key(pos[i], pos[i + 1], pos[i + 2]); (g.get(k) ?? g.set(k, []).get(k)).push(i / 3); }
  return {within(x, y, z, r) { const out = [], c = Math.ceil(r / cell), cx = Math.floor(x / cell), cy = Math.floor(y / cell), cz = Math.floor(z / cell);
    for (let i = -c; i <= c; i++) for (let j = -c; j <= c; j++) for (let k = -c; k <= c; k++) { const l = g.get(`${cx + i},${cy + j},${cz + k}`); if (l) for (const v of l) out.push(v); }
    return out; }};
};

/**
 * Local half-thickness of a closed tube-like mesh at every vertex: the surface is probed along the inward normal and the nearest vertex of the opposite wall
 * (direction within 25 degrees of the normal) gives the local diameter. Returns {radius (Float64Array, NaN where no opposite wall was found within `reach`), centre (Float64Array xyz)}.
 */
export const localThickness = (pos, idx, reach) => {
  const nv = pos.length / 3, nor = outwardNormals(pos, idx), g = grid(pos, reach / 2), radius = new Float64Array(nv).fill(NaN), centre = new Float64Array(nv * 3);
  for (let v = 0; v < nv; v++) {
    const x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2], nx = -nor[v * 3], ny = -nor[v * 3 + 1], nz = -nor[v * 3 + 2];
    let best = Infinity;
    for (const w of g.within(x, y, z, reach)) {
      const dx = pos[w * 3] - x, dy = pos[w * 3 + 1] - y, dz = pos[w * 3 + 2] - z, d = Math.hypot(dx, dy, dz);
      if (d < 1e-9 || d >= best || d > reach) continue;
      if ((dx * nx + dy * ny + dz * nz) / d > .9) best = d;
    }
    if (best < Infinity) { radius[v] = best / 2; centre[v * 3] = x + nx * best / 2; centre[v * 3 + 1] = y + ny * best / 2; centre[v * 3 + 2] = z + nz * best / 2; }
  }
  return {radius, centre};
};
const percentile = (a, q) => { const s = Array.from(a).filter(Number.isFinite).sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
export const radiusStats = (pos, idx, reach) => { const {radius} = localThickness(pos, idx, reach); return {median: percentile(radius, .5), p95: percentile(radius, .95), max: percentile(radius, .995), measured: radius.filter(Number.isFinite).length / radius.length}; };

/** Mesh neighbours of every vertex. */
export const neighbourLists = (nv, idx) => { const n = Array.from({length: nv}, () => new Set()); for (let t = 0; t < idx.length; t += 3) for (let k = 0; k < 3; k++) { n[idx[t + k]].add(idx[t + (k + 1) % 3]); n[idx[t + k]].add(idx[t + (k + 2) % 3]); } return n; };

/**
 * Slims a closed tube: every vertex moves along the line to its local centre so that the local radius becomes `scale` times the old one (or `target` mm when given).
 * The centres and the factors are smoothed over the mesh neighbours first, so the wall stays smooth and the tube stays in one piece.
 */
export const slimTube = (pos, idx, {scale = 1, target = 0, reach, passes = 6}) => {
  const nv = pos.length / 3, {radius, centre} = localThickness(pos, idx, reach), nb = neighbourLists(nv, idx);
  const med = percentile(radius, .5);
  // fill the vertices without an opposite wall (ends of the tube) from their neighbours
  let r = Float64Array.from(radius, v => Number.isFinite(v) ? v : NaN), c = Float64Array.from(centre);
  for (let pass = 0; pass < 30; pass++) { let left = 0; const nr = r.slice(), nc = c.slice(); for (let v = 0; v < nv; v++) if (!Number.isFinite(r[v])) { let s = 0, k = 0; const sc = [0, 0, 0]; for (const w of nb[v]) if (Number.isFinite(r[w])) { s += r[w]; k++; for (let a = 0; a < 3; a++) sc[a] += c[w * 3 + a]; } if (k) { nr[v] = s / k; for (let a = 0; a < 3; a++) nc[v * 3 + a] = sc[a] / k; } else left++; } r = nr; c = nc; if (!left) break; }
  for (let pass = 0; pass < passes; pass++) { const nr = r.slice(), nc = c.slice(); for (let v = 0; v < nv; v++) { let s = r[v], k = 1; const sc = [c[v * 3], c[v * 3 + 1], c[v * 3 + 2]]; for (const w of nb[v]) { s += r[w]; k++; for (let a = 0; a < 3; a++) sc[a] += c[w * 3 + a]; } nr[v] = s / k; for (let a = 0; a < 3; a++) nc[v * 3 + a] = sc[a] / k; } r = nr; c = nc; }
  const out = new Float32Array(pos.length);
  for (let v = 0; v < nv; v++) {
    const f = target ? Math.min(1, target / Math.max(r[v], 1e-9)) : scale, j = v * 3;
    for (let a = 0; a < 3; a++) out[j + a] = c[j + a] + (pos[j + a] - c[j + a]) * f;
  }
  return {positions: out, medianRadius: med};
};

/** Number of connected pieces of a mesh (vertices joined through triangles) and the number of edges that belong to one triangle only (0 for a closed surface). */
export const connectivity = (nv, idx) => {
  const parent = Int32Array.from({length: nv}, (_, i) => i), find = a => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
  const used = new Uint8Array(nv), edges = new Map();
  for (let t = 0; t < idx.length; t += 3) for (let k = 0; k < 3; k++) {
    const a = idx[t + k], b = idx[t + (k + 1) % 3]; used[a] = used[b] = 1; parent[find(a)] = find(b);
    const key = a < b ? a * nv + b : b * nv + a; edges.set(key, (edges.get(key) ?? 0) + 1);
  }
  const roots = new Set(); for (let v = 0; v < nv; v++) if (used[v]) roots.add(find(v));
  let boundary = 0, nonManifold = 0; for (const c of edges.values()) { if (c === 1) boundary++; else if (c > 2) nonManifold++; }
  return {pieces: roots.size, boundaryEdges: boundary, nonManifoldEdges: nonManifold};
};

/** One level of Loop subdivision (boundary edges stay boundary and follow the cubic B-spline rule). */
export const loopSubdivide = (pos, idx) => {
  const nv = pos.length / 3, edgeOf = new Map(), edges = [], faces = [];
  const edgeId = (a, b) => { const k = a < b ? a * nv + b : b * nv + a; let e = edgeOf.get(k); if (e === undefined) { e = edges.length; edgeOf.set(k, e); edges.push({a: Math.min(a, b), b: Math.max(a, b), opp: []}); } return e; };
  for (let t = 0; t < idx.length; t += 3) for (let k = 0; k < 3; k++) edges[edgeId(idx[t + k], idx[t + (k + 1) % 3])].opp.push(idx[t + (k + 2) % 3]);
  const nb = Array.from({length: nv}, () => new Set()), bnb = Array.from({length: nv}, () => []);
  for (const e of edges) { nb[e.a].add(e.b); nb[e.b].add(e.a); if (e.opp.length === 1) { bnb[e.a].push(e.b); bnb[e.b].push(e.a); } }
  const out = new Float64Array((nv + edges.length) * 3), P = (i, a) => pos[i * 3 + a];
  for (let v = 0; v < nv; v++) for (let a = 0; a < 3; a++) {
    if (bnb[v].length >= 2) out[v * 3 + a] = .75 * P(v, a) + .125 * (P(bnb[v][0], a) + P(bnb[v][1], a));
    else { const n = nb[v].size, beta = n === 3 ? 3 / 16 : 3 / (8 * n); let s = 0; for (const w of nb[v]) s += P(w, a); out[v * 3 + a] = (1 - n * beta) * P(v, a) + beta * s; }
  }
  edges.forEach((e, i) => { for (let a = 0; a < 3; a++) out[(nv + i) * 3 + a] = e.opp.length === 2 ? .375 * (P(e.a, a) + P(e.b, a)) + .125 * (P(e.opp[0], a) + P(e.opp[1], a)) : .5 * (P(e.a, a) + P(e.b, a)); });
  const index = [];
  for (let t = 0; t < idx.length; t += 3) {
    const [a, b, c] = [idx[t], idx[t + 1], idx[t + 2]], ab = nv + edgeId(a, b), bc = nv + edgeId(b, c), ca = nv + edgeId(c, a);
    index.push(a, ab, ca, b, bc, ab, c, ca, bc, ab, bc, ca);
  }
  return {positions: Float32Array.from(out), indices: Uint32Array.from(index)};
};

/** Largest distance (and mean) from the points of `from` to the triangle surface (`pos`, `idx`), brute force. */
export const surfaceDistance = (from, pos, idx) => {
  const tri = []; for (let t = 0; t < idx.length; t += 3) tri.push([idx[t] * 3, idx[t + 1] * 3, idx[t + 2] * 3]);
  const cp = (p, a, b, c) => { // closest point on a triangle (Ericson)
    const ab = v3.sub(b, a), ac = v3.sub(c, a), ap = v3.sub(p, a), d1 = v3.dot(ab, ap), d2 = v3.dot(ac, ap);
    if (d1 <= 0 && d2 <= 0) return a; const bp = v3.sub(p, b), d3 = v3.dot(ab, bp), d4 = v3.dot(ac, bp); if (d3 >= 0 && d4 <= d3) return b;
    const vc = d1 * d4 - d3 * d2; if (vc <= 0 && d1 >= 0 && d3 <= 0) return v3.add(a, v3.mul(ab, d1 / (d1 - d3)));
    const cpv = v3.sub(p, c), d5 = v3.dot(ab, cpv), d6 = v3.dot(ac, cpv); if (d6 >= 0 && d5 <= d6) return c;
    const vb = d5 * d2 - d1 * d6; if (vb <= 0 && d2 >= 0 && d6 <= 0) return v3.add(a, v3.mul(ac, d2 / (d2 - d6)));
    const va = d3 * d6 - d5 * d4; if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) return v3.add(b, v3.mul(v3.sub(c, b), (d4 - d3) / ((d4 - d3) + (d5 - d6))));
    const den = 1 / (va + vb + vc); return v3.add(a, v3.add(v3.mul(ab, vb * den), v3.mul(ac, vc * den)));
  };
  const V = i => [pos[i], pos[i + 1], pos[i + 2]]; let max = 0, sum = 0; const n = from.length / 3;
  for (let i = 0; i < n; i++) { const p = [from[i * 3], from[i * 3 + 1], from[i * 3 + 2]]; let best = Infinity; for (const t of tri) { const q = cp(p, V(t[0]), V(t[1]), V(t[2])), d = Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]); if (d < best) best = d; } max = Math.max(max, best); sum += best; }
  return {max, mean: sum / n};
};
