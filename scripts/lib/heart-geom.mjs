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
