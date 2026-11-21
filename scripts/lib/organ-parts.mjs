// Helpers shared by the organ detail builders (scripts/organ-atlas/*.mjs) for marking parts of an organ on its surface and building small schematic pieces.
import {add, sub, mul, unit, cross, len} from './organ-supply.mjs';

/** Majority vote of each vertex and its neighbours, repeated: smooths the borders between surface labels. adj: neighbour Maps from graphOf. Labels 0 are left alone. */
export function smoothLabels(adj, lab, iters) {
  for (let it = 0; it < iters; it++) {
    const next = lab.slice();
    for (let v = 0; v < lab.length; v++) { if (!lab[v]) continue; const c = new Map([[lab[v], 1]]); for (const [u] of adj[v]) if (lab[u]) c.set(lab[u], (c.get(lab[u]) ?? 0) + 1); let best = lab[v], bn = 0; for (const [k, n] of c) if (n > bn) { bn = n; best = k; } next[v] = best; }
    lab.set(next);
  }
}

/** Triangle labels from vertex labels: a triangle takes the zone of most of its corners, and a line label when two corners carry it (line labels 1..maxLine). */
export function triangleLabels(indices, zone, line, maxLine = 8) {
  const nt = indices.length / 3, tz = new Uint8Array(nt), tl = new Uint8Array(nt);
  for (let t = 0; t < nt; t++) {
    const c = [indices[t * 3], indices[t * 3 + 1], indices[t * 3 + 2]], zs = c.map(v => zone[v]);
    tz[t] = zs[0] === zs[1] || zs[0] === zs[2] ? zs[0] : zs[1] === zs[2] ? zs[1] : zs[0];
    if (line) { const ls = c.map(v => line[v]); for (let l = 1; l <= maxLine; l++) if (ls.filter(x => x === l).length >= 2) { tl[t] = l; break; } }
  }
  return {tz, tl};
}

/** A smooth tube with an elliptical section (a flat band such as a ligament, or a round cord when w = t) through the points; its broad side faces `face` (default forward). Ends are tapered and capped. */
export function band(points, w, t, {per = 10, sides = 16, face = [0, 0, 1], taper = .55} = {}) {
  const cr = (p0, p1, p2, p3, s) => [0, 1, 2].map(k => .5 * (2 * p1[k] + (-p0[k] + p2[k]) * s + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * s * s + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * s * s * s));
  const pts = [], ext = [points[0], ...points, points.at(-1)];
  for (let i = 1; i < ext.length - 2; i++) for (let k = 0; k < per; k++) pts.push(cr(ext[i - 1], ext[i], ext[i + 1], ext[i + 2], k / per));
  pts.push(points.at(-1));
  const pos = [], idx = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const tg = unit(sub(pts[Math.min(n - 1, i + 1)], pts[Math.max(0, i - 1)])), wide = unit(cross(tg, face)), thick = unit(cross(wide, tg));
    const f = Math.min(1, taper + 3 * Math.min(i, n - 1 - i) / n);
    for (let s = 0; s < sides; s++) { const a = 2 * Math.PI * s / sides; pos.push(...add(pts[i], add(mul(wide, Math.cos(a) * w / 2 * f), mul(thick, Math.sin(a) * t / 2 * f)))); }
  }
  for (let i = 0; i + 1 < n; i++) for (let s = 0; s < sides; s++) { const a = i * sides + s, b = i * sides + (s + 1) % sides, c = a + sides, d = b + sides; idx.push(a, c, b, b, c, d); }
  for (const [ring, flip] of [[0, true], [n - 1, false]]) { const c = pos.length / 3; pos.push(...pts[ring]); for (let s = 0; s < sides; s++) { const a = ring * sides + s, b = ring * sides + (s + 1) % sides; idx.push(...(flip ? [c, a, b] : [c, b, a])); } }
  return {positions: Float32Array.from(pos), indices: Uint32Array.from(idx)};
}

/** Points of a mesh surface (verts, normals as [x,y,z] arrays): the vertex nearest to p among those whose normal passes `accept`, lifted `lift` along its normal. */
export function onSurface(verts, normals, p, lift = .0006, accept = () => true) {
  let best = -1, bd = Infinity;
  for (let i = 0; i < verts.length; i++) { if (!accept(normals[i], verts[i])) continue; const d = len(sub(verts[i], p)); if (d < bd) { bd = d; best = i; } }
  return best < 0 ? null : add(verts[best], mul(normals[best], lift));
}

/** A path over a surface from `from`, stepping `step` in direction `dir` and putting each step back on the surface (see onSurface). */
export function marchOnSurface(verts, normals, from, dir, steps, step = .004, lift = .0006, accept = () => true) {
  const out = []; let at = from;
  for (let k = 0; k < steps; k++) { const next = onSurface(verts, normals, add(at, mul(dir, step)), lift, accept); if (!next) break; out.push(next); at = next; }
  return out;
}

/**
 * Splits the triangles of a mesh that cross the zero level of a field (fOf: position -> value) along that level (linear along each edge), keeping both sides; each new triangle keeps
 * the zone and line labels of the triangle it comes from. Shared edges are cut once, so the mesh stays watertight. Used to draw the thin line of a position term into the surface.
 */
export function splitByField({positions: P, indices: I, zone, line}, fOf) {
  const pos = Array.from(P), f = [], edge = new Map(), idx = [], z = [], l = [];
  for (let v = 0; v < P.length / 3; v++) f.push(fOf([P[v * 3], P[v * 3 + 1], P[v * 3 + 2]]));
  const cut = (a, b) => { const k = a < b ? `${a}_${b}` : `${b}_${a}`; if (edge.has(k)) return edge.get(k); const t = f[a] / (f[a] - f[b]), i = pos.length / 3;
    for (let c = 0; c < 3; c++) pos.push(pos[a * 3 + c] + (pos[b * 3 + c] - pos[a * 3 + c]) * t); f.push(0); edge.set(k, i); return i; };
  for (let t = 0; t < I.length / 3; t++) {
    const tri = [I[t * 3], I[t * 3 + 1], I[t * 3 + 2]], s = tri.map(v => f[v] >= 0), push = (a, b, c) => { idx.push(a, b, c); z.push(zone[t]); l.push(line[t]); };
    if (s[0] === s[1] && s[1] === s[2]) { push(...tri); continue; }
    const k = s[0] !== s[1] && s[0] !== s[2] ? 0 : s[1] !== s[0] && s[1] !== s[2] ? 1 : 2, L = tri[k], M = tri[(k + 1) % 3], N = tri[(k + 2) % 3], pM = cut(L, M), pN = cut(L, N);
    push(L, pM, pN); push(pM, M, N); push(pM, N, pN);
  }
  return {positions: Float32Array.from(pos), indices: Uint32Array.from(idx), zone: Uint8Array.from(z), line: Uint8Array.from(l)};
}

/** Centroid of triangle t. */
export const triCentre = (m, t) => [0, 1, 2].map(k => (m.positions[m.indices[t * 3] * 3 + k] + m.positions[m.indices[t * 3 + 1] * 3 + k] + m.positions[m.indices[t * 3 + 2] * 3 + k]) / 3);
