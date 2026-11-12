// Cuts a muscle mesh (BodyParts3D draws the distal tendon as the tapering end of the muscle) at a plane into a muscle part and a tendon part.
// Both parts are closed and share the very same vertices on the cut ring, so the join has no gap and no overlap, whatever the pose does to the vertices (they carry
// the same skin weights because a weight is a function of the rest position alone). The tendon part is then refined and smoothed with the ring held fixed, so the
// faceted prism of the source becomes a smooth cord or flat band.
import {weldByPosition} from './stream-writer.mjs';

const EPS = 1e-9;

/** Welded copy of a mesh: {positions: Float64Array, indices: Uint32Array}. */
export function weld(positions, indices) {
  const w = weldByPosition(Float32Array.from(positions), Uint32Array.from(indices));
  // drop degenerate triangles produced by welding
  const idx = [];
  for (let i = 0; i < w.indices.length; i += 3) { const a = w.indices[i], b = w.indices[i + 1], c = w.indices[i + 2]; if (a !== b && b !== c && a !== c) idx.push(a, b, c); }
  return {positions: Float64Array.from(w.positions), indices: Uint32Array.from(idx)};
}

export function bounds(positions) {
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], positions[i + k]); hi[k] = Math.max(hi[k], positions[i + k]); }
  return [lo, hi];
}

/** A plane: points with dot(n, p) - c > 0 are on the positive side. */
export const planeOf = (n, point) => { const l = Math.hypot(...n); const u = n.map(v => v / l); return {n: u, c: u[0] * point[0] + u[1] * point[1] + u[2] * point[2]}; };

/** Cross-section area of a closed mesh at a plane (sum of the signed areas of the cut loops). */
export function sliceArea(mesh, plane) {
  const {positions: P, indices: I} = mesh, {n, c} = plane;
  const sd = new Float64Array(P.length / 3); for (let v = 0; v < sd.length; v++) sd[v] = n[0] * P[v * 3] + n[1] * P[v * 3 + 1] + n[2] * P[v * 3 + 2] - c;
  // basis of the plane
  const t1 = Math.abs(n[0]) < .9 ? [1, 0, 0] : [0, 1, 0]; let u = [n[1] * t1[2] - n[2] * t1[1], n[2] * t1[0] - n[0] * t1[2], n[0] * t1[1] - n[1] * t1[0]]; const ul = Math.hypot(...u); u = u.map(v => v / ul);
  const w = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];
  const pt = (a, b) => { const t = sd[a] / (sd[a] - sd[b]); return [P[a * 3] + (P[b * 3] - P[a * 3]) * t, P[a * 3 + 1] + (P[b * 3 + 1] - P[a * 3 + 1]) * t, P[a * 3 + 2] + (P[b * 3 + 2] - P[a * 3 + 2]) * t]; };
  let area = 0;
  for (let i = 0; i < I.length; i += 3) {
    const t = [I[i], I[i + 1], I[i + 2]], pos = t.map(v => sd[v] > 0);
    const np = pos.filter(Boolean).length; if (np === 0 || np === 3) continue;
    // the two crossing edges, in the order that follows the triangle winding with the lone vertex first
    const lone = np === 1 ? pos.indexOf(true) : pos.indexOf(false), a = t[lone], b = t[(lone + 1) % 3], c2 = t[(lone + 2) % 3];
    const p = pt(a, b), q = pt(c2, a), sign = np === 1 ? 1 : -1;
    const x1 = p[0] * u[0] + p[1] * u[1] + p[2] * u[2], y1 = p[0] * w[0] + p[1] * w[1] + p[2] * w[2], x2 = q[0] * u[0] + q[1] * u[1] + q[2] * u[2], y2 = q[0] * w[0] + q[1] * w[1] + q[2] * w[2];
    area += sign * (x1 * y2 - x2 * y1) / 2;
  }
  return Math.abs(area);
}

function earClip(poly2) {
  // poly2: [[x, y], ...] counter-clockwise or clockwise; returns triangles as index triples
  const n = poly2.length; if (n < 3) return [];
  let area = 0; for (let i = 0; i < n; i++) { const a = poly2[i], b = poly2[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
  const ccw = area > 0, idx = [...Array(n).keys()]; if (!ccw) idx.reverse();
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const inTri = (p, a, b, c) => cr(a, b, p) >= -1e-14 && cr(b, c, p) >= -1e-14 && cr(c, a, p) >= -1e-14;
  const out = []; let guard = 0;
  while (idx.length > 3 && guard++ < n * n) {
    let clipped = false;
    for (let k = 0; k < idx.length; k++) {
      const i0 = idx[(k + idx.length - 1) % idx.length], i1 = idx[k], i2 = idx[(k + 1) % idx.length], a = poly2[i0], b = poly2[i1], c = poly2[i2];
      if (cr(a, b, c) <= 1e-18) continue;
      if (idx.some(j => j !== i0 && j !== i1 && j !== i2 && inTri(poly2[j], a, b, c))) continue;
      out.push([i0, i1, i2]); idx.splice(k, 1); clipped = true; break;
    }
    if (!clipped) { // degenerate: fan the rest
      for (let k = 1; k + 1 < idx.length; k++) out.push([idx[0], idx[k], idx[k + 1]]); return out.map(t => ccw ? t : [t[0], t[2], t[1]]);
    }
  }
  if (idx.length === 3) out.push([idx[0], idx[1], idx[2]]);
  return out;
}

/**
 * Splits a closed, welded mesh at `plane`. Returns {pos, neg}: {positions, indices, ring: Uint32Array of the vertices on the cut} for the positive and negative side.
 * Each side is capped with a flat polygon per cut loop, so both are closed meshes.
 */
export function splitMesh(mesh, plane) {
  const {positions: P, indices: I} = mesh, {n, c} = plane, nv = P.length / 3;
  const sd = new Float64Array(nv); for (let v = 0; v < nv; v++) { sd[v] = n[0] * P[v * 3] + n[1] * P[v * 3 + 1] + n[2] * P[v * 3 + 2] - c; if (Math.abs(sd[v]) < 1e-7) sd[v] = sd[v] < 0 ? -1e-7 : 1e-7; }
  const sides = {pos: {P: [], map: new Map(), I: []}, neg: {P: [], map: new Map(), I: []}};
  const ringKey = new Map(), ringPts = [];            // intersection points shared by both sides
  const vert = (S, v) => { let k = S.map.get(v); if (k === undefined) { k = S.P.length / 3; S.P.push(P[v * 3], P[v * 3 + 1], P[v * 3 + 2]); S.map.set(v, k); } return k; };
  const cut = (a, b) => { const key = a < b ? a * nv + b : b * nv + a; let r = ringKey.get(key); if (r === undefined) { const t = sd[a] / (sd[a] - sd[b]); r = ringPts.length / 3; ringPts.push(P[a * 3] + (P[b * 3] - P[a * 3]) * t, P[a * 3 + 1] + (P[b * 3 + 1] - P[a * 3 + 1]) * t, P[a * 3 + 2] + (P[b * 3 + 2] - P[a * 3 + 2]) * t); ringKey.set(key, r); } return r; };
  const ringIndex = {pos: new Map(), neg: new Map()};
  const rv = (S, name, r) => { const m = ringIndex[name]; let k = m.get(r); if (k === undefined) { k = S.P.length / 3; S.P.push(ringPts[r * 3], ringPts[r * 3 + 1], ringPts[r * 3 + 2]); m.set(r, k); } return k; };
  const segments = [];   // directed cut segments (ring ids) following the winding of the positive polygon
  for (let i = 0; i < I.length; i += 3) {
    const t = [I[i], I[i + 1], I[i + 2]], pos = t.map(v => sd[v] > 0), np = pos.filter(Boolean).length;
    if (np === 3) { sides.pos.I.push(vert(sides.pos, t[0]), vert(sides.pos, t[1]), vert(sides.pos, t[2])); continue; }
    if (np === 0) { sides.neg.I.push(vert(sides.neg, t[0]), vert(sides.neg, t[1]), vert(sides.neg, t[2])); continue; }
    const lone = np === 1 ? pos.indexOf(true) : pos.indexOf(false), a = t[lone], b = t[(lone + 1) % 3], d = t[(lone + 2) % 3];
    const p = cut(a, b), q = cut(d, a);                  // on edge a-b and on edge d-a
    const loneSide = np === 1 ? 'pos' : 'neg', otherSide = np === 1 ? 'neg' : 'pos', L = sides[loneSide], O = sides[otherSide];
    // lone side: triangle (a, p, q); other side: quad (p, b, d, q) = (p,b,d) + (p,d,q)
    L.I.push(vert(L, a), rv(L, loneSide, p), rv(L, loneSide, q));
    O.I.push(rv(O, otherSide, p), vert(O, b), vert(O, d), rv(O, otherSide, p), vert(O, d), rv(O, otherSide, q));
    // boundary of the positive polygon along the cut: p -> q when the lone vertex is positive (triangle a,p,q), q -> p when it is the quad (p,b,d,q)
    if (np === 1) segments.push([p, q]); else segments.push([q, p]);
  }
  // chain segments into loops
  const next = new Map(); for (const [s, e] of segments) { (next.get(s) ?? next.set(s, []).get(s)).push(e); }
  const loops = [], used = new Set();
  for (const [s] of segments) {
    if (used.has(s)) continue;
    const loop = [s]; used.add(s); let cur = s, guard = 0;
    for (;;) { const outs = (next.get(cur) ?? []).filter(e => !used.has(e) || e === s); if (!outs.length || guard++ > segments.length + 2) break; const e = outs[0]; if (e === s) break; loop.push(e); used.add(e); cur = e; }
    if (loop.length >= 3) loops.push(loop);
  }
  // basis in the plane
  const t1 = Math.abs(n[0]) < .9 ? [1, 0, 0] : [0, 1, 0]; let u = [n[1] * t1[2] - n[2] * t1[1], n[2] * t1[0] - n[0] * t1[2], n[0] * t1[1] - n[1] * t1[0]]; const ul = Math.hypot(...u); u = u.map(v => v / ul);
  const w = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];
  const capLoops = [];
  for (const loop of loops) {
    const poly = loop.map(r => [ringPts[r * 3] * u[0] + ringPts[r * 3 + 1] * u[1] + ringPts[r * 3 + 2] * u[2], ringPts[r * 3] * w[0] + ringPts[r * 3 + 1] * w[1] + ringPts[r * 3 + 2] * w[2]]);
    const tris = earClip(poly); capLoops.push({loop, tris});
    for (const [i0, i1, i2] of tris) {
      const a = loop[i0], b = loop[i1], d = loop[i2];
      // the positive piece is closed by a cap facing -n (outward), the negative one by a cap facing +n
      const ax = ringPts[a * 3], ay = ringPts[a * 3 + 1], az = ringPts[a * 3 + 2], ux = ringPts[b * 3] - ax, uy = ringPts[b * 3 + 1] - ay, uz = ringPts[b * 3 + 2] - az, vx = ringPts[d * 3] - ax, vy = ringPts[d * 3 + 1] - ay, vz = ringPts[d * 3 + 2] - az;
      const nn = (uy * vz - uz * vy) * n[0] + (uz * vx - ux * vz) * n[1] + (ux * vy - uy * vx) * n[2];
      const [pa, pb, pd] = nn < 0 ? [a, b, d] : [a, d, b];       // facing -n
      sides.pos.I.push(rv(sides.pos, 'pos', pa), rv(sides.pos, 'pos', pb), rv(sides.pos, 'pos', pd));
      sides.neg.I.push(rv(sides.neg, 'neg', pa), rv(sides.neg, 'neg', pd), rv(sides.neg, 'neg', pb));
    }
  }
  const finish = (S, name) => ({positions: Float64Array.from(S.P), indices: Uint32Array.from(S.I), ring: Uint32Array.from(ringIndex[name].values()), loops: loops.length});
  return {pos: finish(sides.pos, 'pos'), neg: finish(sides.neg, 'neg'), ringPoints: Float64Array.from(ringPts), loops};
}

/** Splits every triangle into four (shared edge midpoints, so the surface stays closed). */
export function subdivide(mesh) {
  const P = Array.from(mesh.positions), I = mesh.indices, mid = new Map(), out = [];
  const m = (a, b) => { const key = a < b ? a * 1e7 + b : b * 1e7 + a; let r = mid.get(key); if (r === undefined) { r = P.length / 3; P.push((P[a * 3] + P[b * 3]) / 2, (P[a * 3 + 1] + P[b * 3 + 1]) / 2, (P[a * 3 + 2] + P[b * 3 + 2]) / 2); mid.set(key, r); } return r; };
  for (let i = 0; i < I.length; i += 3) { const a = I[i], b = I[i + 1], c = I[i + 2], ab = m(a, b), bc = m(b, c), ca = m(c, a); out.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca); }
  return {positions: Float64Array.from(P), indices: Uint32Array.from(out), originalCount: mesh.positions.length / 3};
}

/** Taubin smoothing (volume preserving) with `pinned` vertices held fixed. */
export function smooth(mesh, pinned, iterations = 20, lambda = .5, mu = -.53) {
  const P = Float64Array.from(mesh.positions), n = P.length / 3, nb = Array.from({length: n}, () => new Set());
  for (let i = 0; i < mesh.indices.length; i += 3) for (let k = 0; k < 3; k++) { const a = mesh.indices[i + k], b = mesh.indices[i + (k + 1) % 3]; nb[a].add(b); nb[b].add(a); }
  const fixed = new Uint8Array(n); for (const v of pinned) fixed[v] = 1;
  const step = f => { const Q = Float64Array.from(P); for (let v = 0; v < n; v++) { if (fixed[v] || !nb[v].size) continue; let x = 0, y = 0, z = 0; for (const u of nb[v]) { x += P[u * 3]; y += P[u * 3 + 1]; z += P[u * 3 + 2]; } const s = 1 / nb[v].size; Q[v * 3] += f * (x * s - P[v * 3]); Q[v * 3 + 1] += f * (y * s - P[v * 3 + 1]); Q[v * 3 + 2] += f * (z * s - P[v * 3 + 2]); } P.set(Q); };
  for (let it = 0; it < iterations; it++) { step(lambda); step(mu); }
  return {...mesh, positions: P};
}

/** Appends a piece to another (no welding). */
export function concat(a, b) { const base = a.positions.length / 3; return {positions: Float64Array.from([...a.positions, ...b.positions]), indices: Uint32Array.from([...a.indices, ...Array.from(b.indices, i => i + base)])}; }

/** Vertex normals (area weighted) as Float32Array. */
export function normalsOf(positions, indices) {
  const n = new Float64Array(positions.length);
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i], b = indices[i + 1], c = indices[i + 2];
    const ux = positions[b * 3] - positions[a * 3], uy = positions[b * 3 + 1] - positions[a * 3 + 1], uz = positions[b * 3 + 2] - positions[a * 3 + 2], vx = positions[c * 3] - positions[a * 3], vy = positions[c * 3 + 1] - positions[a * 3 + 1], vz = positions[c * 3 + 2] - positions[a * 3 + 2];
    const x = uy * vz - uz * vy, y = uz * vx - ux * vz, z = ux * vy - uy * vx;
    for (const k of [a, b, c]) { n[k * 3] += x; n[k * 3 + 1] += y; n[k * 3 + 2] += z; }
  }
  const out = new Float32Array(n.length);
  for (let v = 0; v < n.length; v += 3) { const l = Math.hypot(n[v], n[v + 1], n[v + 2]) || 1; out[v] = n[v] / l; out[v + 1] = n[v + 1] / l; out[v + 2] = n[v + 2] / l; }
  return out;
}

/** Signed volume of a closed mesh (positive when the winding faces outward). */
export function volume(positions, indices) {
  let v = 0;
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i] * 3, b = indices[i + 1] * 3, c = indices[i + 2] * 3;
    v += (positions[a] * (positions[b + 1] * positions[c + 2] - positions[b + 2] * positions[c + 1]) - positions[a + 1] * (positions[b] * positions[c + 2] - positions[b + 2] * positions[c]) + positions[a + 2] * (positions[b] * positions[c + 1] - positions[b + 1] * positions[c])) / 6;
  }
  return v;
}
export {EPS};
