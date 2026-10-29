// Frames of vessel tubes: the welded surface graph of a mesh and, at any surface point, the local axis direction, radius and end-cap centre.
// Shared by scripts/prepare-vessel-ends.mjs (connectors) and scripts/audit-vessel-continuity.mjs (gap, tangent and diameter checks), so both see the same numbers.
const MIN_RADIUS = .0004;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add = (a, b, s = 1) => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s], len = a => Math.hypot(...a), unit = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export {sub, add, len, unit};
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Welded surface graph of a mesh ({pos, idx} typed arrays): vertex positions and neighbour sets. */
export function weldSurface(pos, idx) {
  const key = new Map(), pts = [], remap = new Uint32Array(pos.length / 3);
  for (let i = 0; i < remap.length; i++) {
    const k = `${Math.round(pos[i * 3] * 1e5)},${Math.round(pos[i * 3 + 1] * 1e5)},${Math.round(pos[i * 3 + 2] * 1e5)}`;
    let v = key.get(k); if (v === undefined) { v = pts.length; key.set(k, v); pts.push([pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]]); } remap[i] = v;
  }
  const adj = pts.map(() => new Set());
  for (let i = 0; i < idx.length; i += 3) for (let k = 0; k < 3; k++) { const a = remap[idx[i + k]], b = remap[idx[i + (k + 1) % 3]]; if (a !== b) { adj[a].add(b); adj[b].add(a); } }
  return {pts, adj};
}

/** Direction (pointing out of the tube) and radius of a tube end: the surface vertices connected to the tip within 5 mm give a principal axis and the RMS distance from it.
 *  `center` is the middle of the end cap (the top fifth of the neighbourhood along the axis), `along` the axis coordinate of the neighbourhood's centroid. */
export function endFrame({pts, adj}, tip) {
  let start = -1, best = Infinity;
  pts.forEach((v, i) => { const d = Math.hypot(v[0] - tip[0], v[1] - tip[1], v[2] - tip[2]); if (d < best) { best = d; start = i; } });
  const seen = new Set([start]), queue = [start], set = [];
  while (queue.length) {
    const v = queue.pop(); set.push(pts[v]);
    for (const u of adj[v]) if (!seen.has(u) && Math.hypot(pts[u][0] - tip[0], pts[u][1] - tip[1], pts[u][2] - tip[2]) < .005) { seen.add(u); queue.push(u); }
  }
  if (set.length < 8) return null;
  const c = set.reduce((s, v) => add(s, v, 1 / set.length), [0, 0, 0]), cov = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const v of set) { const d = sub(v, c); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) cov[i][j] += d[i] * d[j] / set.length; }
  let axis = unit(sub(tip, c));
  for (let k = 0; k < 24; k++) axis = unit([0, 1, 2].map(i => cov[i][0] * axis[0] + cov[i][1] * axis[1] + cov[i][2] * axis[2]));
  const dir = axis[0] * (tip[0] - c[0]) + axis[1] * (tip[1] - c[1]) + axis[2] * (tip[2] - c[2]) < 0 ? axis.map(x => -x) : axis;
  let r2 = 0; for (const v of set) { const d = sub(v, c), along = d[0] * dir[0] + d[1] * dir[1] + d[2] * dir[2]; r2 += (len(d) ** 2 - along ** 2) / set.length; }
  const radius = Math.max(MIN_RADIUS, Math.min(Math.sqrt(r2) * 1.2, .008));
  const ranked = set.map(v => [dot(sub(v, c), dir), v]).sort((a, b) => b[0] - a[0]), top = ranked.slice(0, Math.max(3, Math.ceil(set.length / 5)));
  const center = top.reduce((s, [, v]) => add(s, v, 1 / top.length), [0, 0, 0]);
  return {dir, radius, center, centroid: c};
}

/** Control points of a smooth bridge from an end (position, outward direction) to a target point and the direction the bridge travels there: a cubic Hermite curve sampled
 *  at `n` points, plus one point just inside the vessel it leaves and one just past the target so the tube overlaps both. */
export function bridgePath(from, dirFrom, to, dirTo, {n = 7, back = .0015, over = .001} = {}) {
  const chord = len(sub(to, from)), m0 = dirFrom.map(v => v * chord * 1.1), m1 = dirTo.map(v => v * chord * 1.1), pts = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), t2 = t * t, t3 = t2 * t, h00 = 2 * t3 - 3 * t2 + 1, h10 = t3 - 2 * t2 + t, h01 = -2 * t3 + 3 * t2, h11 = t3 - t2;
    pts.push([0, 1, 2].map(a => h00 * from[a] + h10 * m0[a] + h01 * to[a] + h11 * m1[a]));
  }
  return [add(from, dirFrom, -back), ...pts, add(to, dirTo, over)];
}
