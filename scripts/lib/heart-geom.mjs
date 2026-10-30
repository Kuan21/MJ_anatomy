// Small triangle-mesh helpers for building MJ-made heart structures on the Z-Anatomy chambers: ray casts, closest points, face selection,
// and tubes that follow a path on the inside of a chamber wall.
import {tube} from './nerve-schematics.mjs';

export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len = a => Math.hypot(a[0], a[1], a[2]);
export const unit = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

export function meshOf(positions, indices) {
  const tris = [];
  for (let i = 0; i < indices.length; i += 3) {
    const a = [positions[indices[i] * 3], positions[indices[i] * 3 + 1], positions[indices[i] * 3 + 2]];
    const b = [positions[indices[i + 1] * 3], positions[indices[i + 1] * 3 + 1], positions[indices[i + 1] * 3 + 2]];
    const c = [positions[indices[i + 2] * 3], positions[indices[i + 2] * 3 + 1], positions[indices[i + 2] * 3 + 2]];
    const n = unit(cross(sub(b, a), sub(c, a)));
    tris.push({a, b, c, n, mid: [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3]});
  }
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (let i = 0; i < positions.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], positions[i + k]); hi[k] = Math.max(hi[k], positions[i + k]); }
  return {positions, indices, tris, lo, hi, centre: lerp(lo, hi, .5)};
}

/** Nearest ray hit (Moller-Trumbore) of a mesh: {t, point, normal} or null. */
export function ray(mesh, o, d) {
  let best = null;
  for (const tr of mesh.tris) {
    const e1 = sub(tr.b, tr.a), e2 = sub(tr.c, tr.a), p = cross(d, e2), det = dot(e1, p);
    if (Math.abs(det) < 1e-14) continue;
    const inv = 1 / det, t0 = sub(o, tr.a), u = dot(t0, p) * inv; if (u < 0 || u > 1) continue;
    const q = cross(t0, e1), v = dot(d, q) * inv; if (v < 0 || u + v > 1) continue;
    const t = dot(e2, q) * inv; if (t > 1e-7 && (!best || t < best.t)) best = {t, point: add(o, mul(d, t)), normal: tr.n};
  }
  return best;
}

/** Closest point on a triangle (Ericson) to p. */
function closestOnTri(p, a, b, c) {
  const ab = sub(b, a), ac = sub(c, a), ap = sub(p, a), d1 = dot(ab, ap), d2 = dot(ac, ap);
  if (d1 <= 0 && d2 <= 0) return a;
  const bp = sub(p, b), d3 = dot(ab, bp), d4 = dot(ac, bp); if (d3 >= 0 && d4 <= d3) return b;
  const vc = d1 * d4 - d3 * d2; if (vc <= 0 && d1 >= 0 && d3 <= 0) return add(a, mul(ab, d1 / (d1 - d3)));
  const cp = sub(p, c), d5 = dot(ab, cp), d6 = dot(ac, cp); if (d6 >= 0 && d5 <= d6) return c;
  const vb = d5 * d2 - d1 * d6; if (vb <= 0 && d2 >= 0 && d6 <= 0) return add(a, mul(ac, d2 / (d2 - d6)));
  const va = d3 * d6 - d5 * d4; if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) return add(b, mul(sub(c, b), (d4 - d3) / ((d4 - d3) + (d5 - d6))));
  const denom = 1 / (va + vb + vc); return add(a, add(mul(ab, vb * denom), mul(ac, vc * denom)));
}
export function closest(mesh, p) {
  let best = null;
  for (const tr of mesh.tris) {
    if (best && (Math.abs(tr.mid[0] - p[0]) > best.d + .02 || Math.abs(tr.mid[1] - p[1]) > best.d + .02 || Math.abs(tr.mid[2] - p[2]) > best.d + .02)) continue;
    const q = closestOnTri(p, tr.a, tr.b, tr.c), d = len(sub(q, p));
    if (!best || d < best.d) best = {d, point: q, normal: tr.n};
  }
  return best;
}
/** A point on the wall of a chamber seen from `from` in direction `dir`, pulled `inset` back towards the cavity. */
export function wallPoint(mesh, from, dir, inset) {
  const h = ray(mesh, from, unit(dir)); return h ? sub(h.point, mul(unit(dir), inset)) : null;
}
/** Triangles of `mesh` selected by a predicate on the triangle, as a new indexed mesh offset along the normal (negative = into the cavity). */
export function patch(mesh, keep, offset = 0) {
  const pos = [], idx = [];
  for (const tr of mesh.tris) {
    if (!keep(tr)) continue;
    const base = pos.length / 3;
    for (const v of [tr.a, tr.b, tr.c]) pos.push(v[0] + tr.n[0] * offset, v[1] + tr.n[1] * offset, v[2] + tr.n[2] * offset);
    idx.push(base, base + 1, base + 2);
  }
  return {positions: new Float32Array(pos), indices: new Uint32Array(idx)};
}
export function tubeThrough(points, r0, r1 = r0, samples = 40, sides = 8) { return tube(points, r0, r1, samples, sides); }
export function merge(list) {
  let n = 0, m = 0; for (const g of list) { n += g.positions.length; m += g.indices.length; }
  const positions = new Float32Array(n), indices = new Uint32Array(m); let po = 0, io = 0, base = 0;
  for (const g of list) { positions.set(g.positions, po); for (let i = 0; i < g.indices.length; i++) indices[io + i] = g.indices[i] + base; po += g.positions.length; io += g.indices.length; base += g.positions.length / 3; }
  return {positions, indices};
}

/** Area-weighted vertex normals of a mesh from meshOf (cached on the mesh). */
export function vertexNormalsOf(mesh) {
  if (mesh.vn) return mesh.vn;
  const n = new Float64Array(mesh.positions.length), P = mesh.positions, I = mesh.indices;
  for (let i = 0; i < I.length; i += 3) {
    const a = I[i], b = I[i + 1], c = I[i + 2];
    const u = [P[b * 3] - P[a * 3], P[b * 3 + 1] - P[a * 3 + 1], P[b * 3 + 2] - P[a * 3 + 2]], v = [P[c * 3] - P[a * 3], P[c * 3 + 1] - P[a * 3 + 1], P[c * 3 + 2] - P[a * 3 + 2]], w = cross(u, v);
    for (const k of [a, b, c]) { n[k * 3] += w[0]; n[k * 3 + 1] += w[1]; n[k * 3 + 2] += w[2]; }
  }
  for (let i = 0; i < n.length; i += 3) { const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1; n[i] /= l; n[i + 1] /= l; n[i + 2] /= l; }
  return mesh.vn = n;
}

/** Weld coincident vertices (1e-7 m) of a raw {positions, indices} mesh and drop degenerate triangles. */
export function weldMesh({positions, indices}) {
  const map = new Map(), out = [], remap = new Uint32Array(positions.length / 3);
  for (let i = 0; i < remap.length; i++) {
    const key = `${Math.round(positions[i * 3] * 1e7)},${Math.round(positions[i * 3 + 1] * 1e7)},${Math.round(positions[i * 3 + 2] * 1e7)}`;
    let k = map.get(key); if (k === undefined) { k = out.length / 3; map.set(key, k); out.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]); }
    remap[i] = k;
  }
  const idx = []; for (let i = 0; i < indices.length; i += 3) { const a = remap[indices[i]], b = remap[indices[i + 1]], c = remap[indices[i + 2]]; if (a !== b && b !== c && a !== c) idx.push(a, b, c); }
  return {positions: Float32Array.from(out), indices: Uint32Array.from(idx)};
}

/** Taubin smoothing (shrink-free): `iterations` pairs of a positive and a negative Laplacian step over a welded mesh. */
export function taubin({positions, indices}, iterations = 8, lambda = .5, mu = -.53) {
  const n = positions.length / 3, nb = Array.from({length: n}, () => new Set());
  for (let i = 0; i < indices.length; i += 3) for (const [a, b] of [[0, 1], [1, 2], [2, 0]]) { nb[indices[i + a]].add(indices[i + b]); nb[indices[i + b]].add(indices[i + a]); }
  let cur = Float64Array.from(positions);
  const step = f => {
    const next = Float64Array.from(cur);
    for (let v = 0; v < n; v++) {
      if (!nb[v].size) continue;
      let x = 0, y = 0, z = 0; for (const u of nb[v]) { x += cur[u * 3]; y += cur[u * 3 + 1]; z += cur[u * 3 + 2]; }
      const k = nb[v].size; next[v * 3] += f * (x / k - cur[v * 3]); next[v * 3 + 1] += f * (y / k - cur[v * 3 + 1]); next[v * 3 + 2] += f * (z / k - cur[v * 3 + 2]);
    }
    cur = next;
  };
  for (let i = 0; i < iterations; i++) { step(lambda); step(mu); }
  return {positions: Float32Array.from(cur), indices};
}

/**
 * Smooth surface patch: the part of `mesh` where the scalar `field(point, normal)` is positive. Triangles are cut along the zero level of the field (linear in
 * each triangle), so the border follows the field and does not run along whole triangles (no stair-steps); the patch is then offset along the surface normals
 * (negative = into the cavity), welded and lightly Taubin-smoothed.
 */
export function patchField(mesh, field, offset = 0, smoothing = 8) {
  const vn = vertexNormalsOf(mesh), P = mesh.positions, I = mesh.indices, memo = new Float64Array(P.length / 3).fill(NaN);
  const vertex = i => ({p: [P[i * 3], P[i * 3 + 1], P[i * 3 + 2]], n: [vn[i * 3], vn[i * 3 + 1], vn[i * 3 + 2]], f: memo[i] === memo[i] ? memo[i] : (memo[i] = field([P[i * 3], P[i * 3 + 1], P[i * 3 + 2]], [vn[i * 3], vn[i * 3 + 1], vn[i * 3 + 2]]))});
  const pos = [], idx = [];
  for (let t = 0; t < I.length; t += 3) {
    const poly = [vertex(I[t]), vertex(I[t + 1]), vertex(I[t + 2])];
    if (poly.every(v => v.f <= 0)) continue;
    const res = [];
    for (let i = 0; i < 3; i++) {
      const a = poly[i], b = poly[(i + 1) % 3], ina = a.f > 0, inb = b.f > 0;
      if (ina) res.push(a);
      if (ina !== inb) { const s = a.f / (a.f - b.f); res.push({p: lerp(a.p, b.p, s), n: unit(lerp(a.n, b.n, s)), f: 0}); }
    }
    if (res.length < 3) continue;
    const base = pos.length / 3; for (const v of res) pos.push(v.p[0] + v.n[0] * offset, v.p[1] + v.n[1] * offset, v.p[2] + v.n[2] * offset);
    for (let k = 1; k < res.length - 1; k++) idx.push(base, base + k, base + k + 1);
  }
  const welded = weldMesh({positions: Float32Array.from(pos), indices: Uint32Array.from(idx)});
  return smoothing ? taubin(welded, smoothing) : welded;
}

/** Closest point of several meshes: {point, normal (smooth, from the nearest triangle's vertices), d}. */
export function surfaceNear(meshes, p) {
  let best = null;
  for (const m of meshes) { const h = closest(m, p); if (h && (!best || h.d < best.d)) best = h; }
  return best;
}

/** Closed mesh with outward-facing triangles: flips the winding when the signed volume is negative. */
export function orient({positions, indices}) {
  let v = 0;
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i] * 3, b = indices[i + 1] * 3, c = indices[i + 2] * 3;
    v += positions[a] * (positions[b + 1] * positions[c + 2] - positions[b + 2] * positions[c + 1]) - positions[a + 1] * (positions[b] * positions[c + 2] - positions[b + 2] * positions[c]) + positions[a + 2] * (positions[b] * positions[c + 1] - positions[b + 1] * positions[c]);
  }
  if (v >= 0) return {positions, indices};
  const flipped = Uint32Array.from(indices); for (let i = 0; i < flipped.length; i += 3) { flipped[i + 1] = indices[i + 2]; flipped[i + 2] = indices[i + 1]; }
  return {positions, indices: flipped};
}

const catmull = (P, samples) => {
  const n = P.length, at = i => P[Math.max(0, Math.min(n - 1, i))], path = [];
  for (let s = 0; s < n - 1; s++) for (let k = 0; k < samples / (n - 1); k++) {
    const t = k / (samples / (n - 1)), p0 = at(s - 1), p1 = at(s), p2 = at(s + 1), p3 = at(s + 2);
    path.push([0, 1, 2].map(a => .5 * ((2 * p1[a]) + (-p0[a] + p2[a]) * t + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t * t + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t ** 3)));
  }
  path.push(P[n - 1]); return path;
};

/**
 * Closed "pillow" lying on a surface: a rounded triangle (or any star-shaped outline) of the tangent plane at `centre`, projected onto the nearest of `surfaces`,
 * raised into a smooth dome of height `height` over a flat underside sunk `sink` into the wall. `corners` are the outline vertices in tangent-plane
 * coordinates (u along `e1`, w along `e2`) seen from the outline's own centroid; `round` (p-norm exponent, lower = rounder) blends the corners.
 * Used for the right auricle: a broad triangular sac that spreads over the root of the ascending aorta.
 */
export function pillow(surfaces, centre, e1, e2, corners, {height = .007, sink = .0015, round = 7, rings = 16, around = 56, smoothing = 10} = {}) {
  const c = [0, 1].map(k => corners.reduce((s, v) => s + v[k], 0) / corners.length), V = corners.map(v => [v[0] - c[0], v[1] - c[1]]);
  const edges = V.map((a, i) => { const b = V[(i + 1) % V.length], d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(d[0], d[1]), nrm = [d[1] / l, -d[0] / l]; return {nrm, dist: nrm[0] * a[0] + nrm[1] * a[1]}; });
  // outward edge normals: make the distance positive (centroid is inside)
  for (const e of edges) if (e.dist < 0) { e.nrm = [-e.nrm[0], -e.nrm[1]]; e.dist = -e.dist; }
  const radius = th => { let s = 0; for (const e of edges) { const cs = Math.cos(th) * e.nrm[0] + Math.sin(th) * e.nrm[1]; if (cs > 1e-4) s += (cs / e.dist) ** round; } return s ? s ** (-1 / round) : 1e-3; };
  // the dome profile is a function of the radial fraction r of the (rounded) outline
  const profile = r => Math.sqrt(Math.max(0, 1 - r * r)) ** .8;
  const top = [], bottom = [], idx = [];
  const place = (r, th, up) => {
    const R = r * radius(th), q = add(add(centre, mul(e1, c[0] + Math.cos(th) * R)), mul(e2, c[1] + Math.sin(th) * R)), h = surfaceNear(surfaces, q);
    return h ? add(h.point, mul(h.normal, up(h))) : q;
  };
  const rowsTop = [], rowsBottom = [];
  for (let k = 0; k <= rings; k++) for (let j = 0; j < around; j++) {
    const r = k / rings, th = j / around * Math.PI * 2;
    top.push(...place(r, th, () => -sink + (height + sink) * profile(r)));
    bottom.push(...place(r, th, () => -sink));
  }
  const grid = (base, flip) => {
    for (let k = 0; k < rings; k++) for (let j = 0; j < around; j++) {
      const a = base + k * around + j, b = base + k * around + (j + 1) % around, c2 = base + (k + 1) * around + j, d = base + (k + 1) * around + (j + 1) % around;
      if (flip) idx.push(a, b, c2, b, d, c2); else idx.push(a, c2, b, b, c2, d);
    }
  };
  grid(0, false); grid(top.length / 3, true);
  void rowsTop; void rowsBottom;
  const positions = Float32Array.from([...top, ...bottom]), indices = Uint32Array.from(idx);
  return orient(taubin(weldMesh({positions, indices}), smoothing));
}

/**
 * Flattened tapering finger that lies along a surface: swept along `waypoints` (snapped onto the nearest of `surfaces` and lifted by half the thickness).
 * `notches` are positions (0..1 along the finger) of crescent-shaped notches cut into the outer margin. The base is embedded in the wall, the tip is closed.
 */
export function finger(surfaces, waypoints, {width = .0065, thick = .0042, samples = 56, sides = 22, notches = [], notchDepth = .4, outward = [1, 0, 0], smoothing = 6} = {}) {
  const path = catmull(waypoints, samples), n = path.length, positions = [], indices = [];
  let lastSide = null;
  const rings = path.map((p, i) => {
    const t = i / (n - 1), a = path[Math.max(0, i - 1)], b = path[Math.min(n - 1, i + 1)], tan = unit(sub(b, a)), h = surfaceNear(surfaces, p);
    const nrm = h ? unit(h.normal) : [0, 1, 0], base = h ? h.point : p;
    let side = unit(cross(tan, nrm)); if (lastSide && dot(side, lastSide) < 0) side = mul(side, -1); lastSide = side;
    if (dot(side, outward) < 0) side = mul(side, -1);
    const up = unit(cross(side, tan)), upn = dot(up, nrm) < 0 ? mul(up, -1) : up;
    const taper = t < .12 ? .55 + t / .12 * .45 : 1 - Math.max(0, (t - .55) / .45) ** 1.5 * .93;
    let notch = 0; for (const c of notches) notch += Math.exp(-(((t - c) / .028) ** 2));
    return {base, side, up: upn, w: width * taper, th: thick * taper, notch: Math.min(1, notch)};
  });
  for (const r of rings) for (let j = 0; j < sides; j++) {
    const ang = j / sides * Math.PI * 2, ca = Math.cos(ang), sa = Math.sin(ang), edge = Math.max(0, ca) ** 3, bite = 1 - notchDepth * r.notch * edge;
    const x = ca * r.w * bite, y = sa * r.th * (1 - .5 * r.notch * edge * notchDepth);
    const centre = add(r.base, mul(r.up, r.th * .35));
    positions.push(...add(centre, add(mul(r.side, x), mul(r.up, y))));
  }
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < sides; j++) {
    const a = i * sides + j, b = i * sides + (j + 1) % sides, c = (i + 1) * sides + j, d = (i + 1) * sides + (j + 1) % sides;
    indices.push(a, b, c, b, d, c);
  }
  for (const [ring, flip] of [[0, false], [n - 1, true]]) {
    const centre = positions.length / 3, r = rings[ring], p = add(r.base, mul(r.up, r.th * .35));
    positions.push(...p);
    for (let j = 0; j < sides; j++) { const a = ring * sides + j, b = ring * sides + (j + 1) % sides; indices.push(...(flip ? [centre, b, a] : [centre, a, b])); }
  }
  return orient(taubin(weldMesh({positions: Float32Array.from(positions), indices: Uint32Array.from(indices)}), smoothing));
}
