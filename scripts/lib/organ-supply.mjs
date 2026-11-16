// Helpers for the blood vessels and nerves of an organ detail package: reading the vertices of an atlas mesh, finding the points where a vessel or nerve is placed, and building a continuous
// tube along a centre line. A branch that the atlas does not have is one tube along a smooth path (not a chain of short segments): the path starts on the parent vessel, ends on the organ
// surface and is drawn through a few control points. These tubes are marked as schematic (示意) in the organ definition.
import {tube} from './nerve-schematics.mjs';

export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const len = a => Math.hypot(a[0], a[1], a[2]);
export const unit = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** The vertices of a mesh as [x, y, z] arrays. */
export const verticesOf = m => { const out = []; for (let i = 0; i < m.positions.length; i += 3) out.push([m.positions[i], m.positions[i + 1], m.positions[i + 2]]); return out; };
/** The vertex of the list that is farthest along axis (0 x, 1 y, 2 z) in the direction sign (+1 / -1). */
export const extreme = (verts, axis, sign) => verts.reduce((best, p) => sign * p[axis] > sign * best[axis] ? p : best);
/** The vertex of the list that is nearest to point p. */
export const nearest = (verts, p) => { let best = verts[0], bd = Infinity; for (const v of verts) { const d = len(sub(v, p)); if (d < bd) { bd = d; best = v; } } return best; };
/** Index of the vertex of the list that is nearest to point p. */
export const nearestIndex = (verts, p) => { let best = 0, bd = Infinity; for (let i = 0; i < verts.length; i++) { const d = len(sub(verts[i], p)); if (d < bd) { bd = d; best = i; } } return best; };

/** One mesh from several (vertex offsets added to the indices). */
export function merge(meshes) {
  const positions = [], indices = []; let base = 0;
  for (const m of meshes) { positions.push(...m.positions); for (const i of m.indices) indices.push(i + base); base += m.positions.length / 3; }
  return {positions: Float32Array.from(positions), indices: Uint32Array.from(indices)};
}

/** A smooth tube (Catmull-Rom through the control points) with `sides` facets and a radius that tapers from r0 to r1. `per` is the number of samples between two control points. */
export function tubeThrough(points, r0, r1 = r0, per = 10, sides = 10) { return tube(points, r0, r1, per * (points.length - 1), sides); }

/** The ordered centre line of a vessel mesh: the vertices are binned along their first principal direction and each bin is averaged (the vessels used here do not fold back on themselves). */
export function centreline(verts, bins = 24) {
  const c = [0, 1, 2].map(a => verts.reduce((s, p) => s + p[a], 0) / verts.length);
  // principal direction by power iteration on the covariance matrix
  const cov = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const p of verts) { const d = sub(p, c); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) cov[i][j] += d[i] * d[j]; }
  let axis = [1, .3, .2]; for (let k = 0; k < 40; k++) axis = unit([0, 1, 2].map(i => cov[i][0] * axis[0] + cov[i][1] * axis[1] + cov[i][2] * axis[2]));
  const proj = verts.map(p => (p[0] - c[0]) * axis[0] + (p[1] - c[1]) * axis[1] + (p[2] - c[2]) * axis[2]), lo = Math.min(...proj), hi = Math.max(...proj), acc = Array.from({length: bins}, () => ({n: 0, s: [0, 0, 0]}));
  verts.forEach((p, i) => { const b = Math.min(bins - 1, Math.floor((proj[i] - lo) / (hi - lo + 1e-12) * bins)); acc[b].n++; for (let a = 0; a < 3; a++) acc[b].s[a] += p[a]; });
  return acc.filter(b => b.n).map(b => mul(b.s, 1 / b.n));
}

/** A point at fraction t (0..1) of the length of a polyline. */
export function alongPolyline(pts, t) {
  const seg = []; let total = 0; for (let i = 0; i + 1 < pts.length; i++) { const l = len(sub(pts[i + 1], pts[i])); seg.push(l); total += l; }
  let want = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < seg.length; i++) { if (want <= seg[i] || i === seg.length - 1) return lerp(pts[i], pts[i + 1], seg[i] ? Math.min(1, want / seg[i]) : 0); want -= seg[i]; }
  return pts[pts.length - 1];
}

/** True when point p is inside the closed surface m (ray along +x, parity of the crossings). */
export function insideMesh(m, p) {
  const P = m.positions, I = m.indices; let crossings = 0;
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
    const ay = P[a + 1] - p[1], az = P[a + 2] - p[2], by = P[b + 1] - p[1], bz = P[b + 2] - p[2], cy = P[c + 1] - p[1], cz = P[c + 2] - p[2];
    const d1 = ay * bz - az * by, d2 = by * cz - bz * cy, d3 = cy * az - cz * ay;
    if ((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0)) continue;
    const s = d1 + d2 + d3; if (!s) continue;
    if ((P[a] * d2 + P[b] * d3 + P[c] * d1) / s > p[0]) crossings++;
  }
  return crossings % 2 === 1;
}
