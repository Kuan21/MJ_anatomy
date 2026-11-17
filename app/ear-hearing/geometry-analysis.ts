/** Centre lines and axes of the packaged ear meshes, computed from the loaded geometry (plain arrays, no three.js), so the animation follows whatever shape the atlas holds. */
export type V3 = [number, number, number];

export interface Centreline {
  /** evenly spaced points from the start end to the far end of the tube */
  points: V3[];
  /** share (0–1) of the way along the tube for each vertex, by distance over the surface from the start end */
  u: Float32Array;
  /** surface distance from the start end to the far end */
  length: number;
}

/** Vertices closer than this (metres) are one point of the graph: a mesh cut open along a seam still counts as one tube. */
const WELD = 2e-6;

function weld(positions: ArrayLike<number>) {
  const n = positions.length / 3, key = new Map<string, number>(), rep = new Int32Array(n);
  const q = (v: number) => Math.round(v / WELD);
  for (let i = 0; i < n; i++) {
    const k = `${q(positions[i * 3])},${q(positions[i * 3 + 1])},${q(positions[i * 3 + 2])}`;
    const hit = key.get(k);
    if (hit === undefined) {key.set(k, i); rep[i] = i;} else rep[i] = hit;
  }
  return rep;
}

/** Shortest surface distances from `from` (Dijkstra on the triangle edges). Unreached vertices stay Infinity. */
function distances(positions: ArrayLike<number>, indices: ArrayLike<number>, rep: Int32Array, from: number) {
  const n = positions.length / 3, adj: number[][] = Array.from({length: n}, () => []);
  for (let i = 0; i + 2 < indices.length; i += 3) {
    const a = rep[indices[i]], b = rep[indices[i + 1]], c = rep[indices[i + 2]];
    for (const [p, q] of [[a, b], [b, c], [c, a]]) if (p !== q) {adj[p].push(q); adj[q].push(p);}
  }
  const dist = new Float64Array(n).fill(Infinity), heap: [number, number][] = [];
  const push = (d: number, v: number) => {heap.push([d, v]); let i = heap.length - 1; while (i > 0) {const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p;}};
  const pop = () => {
    const top = heap[0], last = heap.pop()!;
    if (heap.length) {heap[0] = last; let i = 0; for (;;) {const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m;}}
    return top;
  };
  const start = rep[from]; dist[start] = 0; push(0, start);
  while (heap.length) {
    const [d, v] = pop();
    if (d > dist[v]) continue;
    for (const w of adj[v]) {
      const dx = positions[v * 3] - positions[w * 3], dy = positions[v * 3 + 1] - positions[w * 3 + 1], dz = positions[v * 3 + 2] - positions[w * 3 + 2], nd = d + Math.hypot(dx, dy, dz);
      if (nd < dist[w]) {dist[w] = nd; push(nd, w);}
    }
  }
  for (let i = 0; i < n; i++) dist[i] = dist[rep[i]];
  return dist;
}

const farthest = (dist: Float64Array) => {let best = 0, at = -1; for (let i = 0; i < dist.length; i++) if (Number.isFinite(dist[i]) && dist[i] > best) {best = dist[i]; at = i;} return at;};
const nearestTo = (positions: ArrayLike<number>, point: V3, among?: (i: number) => boolean) => {
  let best = Infinity, at = 0;
  for (let i = 0; i < positions.length / 3; i++) {
    if (among && !among(i)) continue;
    const d = Math.hypot(positions[i * 3] - point[0], positions[i * 3 + 1] - point[1], positions[i * 3 + 2] - point[2]);
    if (d < best) {best = d; at = i;}
  }
  return at;
};

/** The two ends of a tube-like mesh (found by two sweeps over the surface) as vertex indices. */
export function tubeEnds(positions: ArrayLike<number>, indices: ArrayLike<number>): [number, number] {
  const rep = weld(positions), a = farthest(distances(positions, indices, rep, 0)), b = farthest(distances(positions, indices, rep, a));
  return [a, b];
}

/** Centre line of a tube-like mesh (a cochlear scala, a nerve): rings of equal surface distance from the end that lies nearest to `near`, averaged. `steps` points are returned. */
export function tubeCentreline(positions: ArrayLike<number>, indices: ArrayLike<number>, near: V3, steps = 48): Centreline {
  const rep = weld(positions), [a, b] = tubeEnds(positions, indices);
  const da = Math.hypot(positions[a * 3] - near[0], positions[a * 3 + 1] - near[1], positions[a * 3 + 2] - near[2]), db = Math.hypot(positions[b * 3] - near[0], positions[b * 3 + 1] - near[1], positions[b * 3 + 2] - near[2]);
  const dist = distances(positions, indices, rep, da <= db ? a : b), n = positions.length / 3;
  let length = 0; for (let i = 0; i < n; i++) if (Number.isFinite(dist[i])) length = Math.max(length, dist[i]);
  const sum = Array.from({length: steps}, () => [0, 0, 0, 0]), u = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    if (!Number.isFinite(dist[i])) {u[i] = 0; continue;}
    u[i] = length > 0 ? dist[i] / length : 0;
    const k = Math.min(steps - 1, Math.floor(u[i] * steps)), s = sum[k];
    s[0] += positions[i * 3]; s[1] += positions[i * 3 + 1]; s[2] += positions[i * 3 + 2]; s[3]++;
  }
  // an empty ring (a very coarse mesh) is filled in between its neighbours
  const found = sum.map(s => s[3] ? [s[0] / s[3], s[1] / s[3], s[2] / s[3]] as V3 : null);
  const filled = found.map(p => p ?? [0, 0, 0] as V3);
  for (let k = 0; k < steps; k++) {
    if (found[k]) continue;
    let lo = k - 1, hi = k + 1;
    while (lo >= 0 && !found[lo]) lo--;
    while (hi < steps && !found[hi]) hi++;
    if (lo < 0 && hi >= steps) continue;
    if (lo < 0) filled[k] = found[hi]!; else if (hi >= steps) filled[k] = found[lo]!;
    else {const f = (k - lo) / (hi - lo); filled[k] = [0, 1, 2].map(c => found[lo]![c] * (1 - f) + found[hi]![c] * f) as V3;}
  }
  const points = filled;
  return {points, u, length};
}

/** Point at share `u` (0–1) along a polyline of evenly spaced points. */
export function pointAlong(points: V3[], u: number): V3 {
  const f = Math.min(1, Math.max(0, u)) * (points.length - 1), i = Math.min(points.length - 2, Math.floor(f)), k = f - i;
  return [0, 1, 2].map(c => points[i][c] * (1 - k) + points[i + 1][c] * k) as V3;
}

/** Long axis of a point cloud (power iteration on the covariance), as a unit vector pointing toward `towards`. */
export function longAxis(positions: ArrayLike<number>, towards: V3): V3 {
  const n = positions.length / 3, m = [0, 0, 0];
  for (let i = 0; i < n; i++) for (let c = 0; c < 3; c++) m[c] += positions[i * 3 + c] / n;
  const cov = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < n; i++) {const d = [0, 1, 2].map(c => positions[i * 3 + c] - m[c]); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) cov[r][c] += d[r] * d[c];}
  let v = [1, .3, .2];
  for (let it = 0; it < 40; it++) {
    const w = [0, 1, 2].map(r => cov[r][0] * v[0] + cov[r][1] * v[1] + cov[r][2] * v[2]), len = Math.hypot(w[0], w[1], w[2]) || 1;
    v = w.map(x => x / len);
  }
  const toward = [towards[0] - m[0], towards[1] - m[1], towards[2] - m[2]];
  if (v[0] * toward[0] + v[1] * toward[1] + v[2] * toward[2] < 0) v = v.map(x => -x);
  return v as V3;
}

/** The three principal axes of a point cloud (unit vectors, longest first) and its centre. */
export function principalAxes(positions: ArrayLike<number>): {centre: V3; axes: [V3, V3, V3]} {
  const n = positions.length / 3, m = [0, 0, 0];
  for (let i = 0; i < n; i++) for (let c = 0; c < 3; c++) m[c] += positions[i * 3 + c] / n;
  const cov = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < n; i++) {const d = [0, 1, 2].map(c => positions[i * 3 + c] - m[c]); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) cov[r][c] += d[r] * d[c];}
  const mul = (v: number[]) => [0, 1, 2].map(r => cov[r][0] * v[0] + cov[r][1] * v[1] + cov[r][2] * v[2]);
  const unit = (v: number[]) => {const l = Math.hypot(v[0], v[1], v[2]) || 1; return v.map(x => x / l);};
  const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const first = (against: number[][], seed: number[]) => {
    let v = unit(seed);
    for (let it = 0; it < 60; it++) {
      let w = mul(v);
      for (const a of against) {const k = dot(w, a); w = w.map((x, i) => x - k * a[i]);}
      v = unit(w);
    }
    return v;
  };
  const a = first([], [1, .3, .2]), b = first([a], [.2, 1, .4]), c = unit([a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]);
  return {centre: m as V3, axes: [a as V3, b as V3, c as V3]};
}

export {nearestTo};
