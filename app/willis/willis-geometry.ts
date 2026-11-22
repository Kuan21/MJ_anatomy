/** Paths along the artery meshes of the brain model (plain arrays, no three.js), so the moving dots of the circle of Willis animation follow the arteries the model holds.
 *  A path is the shortest way over the mesh surface between two points, pulled to the middle of the vessel by averaging the vertices around each point. */
import {nearestTo, type V3} from '../ear-hearing/geometry-analysis';

export type {V3};

/** Vertex neighbours (welded by position, so a mesh stored as separate triangles is still one surface). */
function graph(positions: ArrayLike<number>, indices: ArrayLike<number>) {
  const n = positions.length / 3, key = new Map<string, number>(), rep = new Int32Array(n);
  const q = (v: number) => Math.round(v / 2e-6);
  for (let i = 0; i < n; i++) {
    const k = `${q(positions[i * 3])},${q(positions[i * 3 + 1])},${q(positions[i * 3 + 2])}`, hit = key.get(k);
    if (hit === undefined) {key.set(k, i); rep[i] = i;} else rep[i] = hit;
  }
  const adj: number[][] = Array.from({length: n}, () => []);
  for (let i = 0; i + 2 < indices.length; i += 3) {
    const a = rep[indices[i]], b = rep[indices[i + 1]], c = rep[indices[i + 2]];
    for (const [p, r] of [[a, b], [b, c], [c, a]]) if (p !== r) {adj[p].push(r); adj[r].push(p);}
  }
  return {rep, adj};
}

const dist3 = (p: ArrayLike<number>, i: number, j: number) => Math.hypot(p[i * 3] - p[j * 3], p[i * 3 + 1] - p[j * 3 + 1], p[i * 3 + 2] - p[j * 3 + 2]);

/** Vertex indices of the shortest surface path from the vertex nearest `from` to the vertex nearest `to` (Dijkstra). When the two are not connected the path ends at the connected vertex nearest `to`. */
export function surfacePath(positions: ArrayLike<number>, indices: ArrayLike<number>, from: V3, to: V3): number[] {
  const {rep, adj} = graph(positions, indices), n = positions.length / 3;
  const s = rep[nearestTo(positions, from)], t = rep[nearestTo(positions, to)];
  const dist = new Float64Array(n).fill(Infinity), prev = new Int32Array(n).fill(-1), heap: [number, number][] = [];
  const push = (d: number, v: number) => {heap.push([d, v]); let i = heap.length - 1; while (i > 0) {const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p;}};
  const pop = () => {
    const top = heap[0], last = heap.pop()!;
    if (heap.length) {heap[0] = last; let i = 0; for (;;) {const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m;}}
    return top;
  };
  dist[s] = 0; push(0, s);
  while (heap.length) {
    const [d, v] = pop();
    if (d > dist[v]) continue;
    if (v === t) break;
    for (const w of adj[v]) {const nd = d + dist3(positions, v, w); if (nd < dist[w]) {dist[w] = nd; prev[w] = v; push(nd, w);}}
  }
  let end = t;
  // `to` lies on a piece of the mesh not joined to the start (a branch stored on its own): go to the joined vertex nearest to it instead
  if (!Number.isFinite(dist[t])) {
    let best = Infinity;
    for (let i = 0; i < n; i++) if (Number.isFinite(dist[i])) {const dd = Math.hypot(positions[i * 3] - to[0], positions[i * 3 + 1] - to[1], positions[i * 3 + 2] - to[2]); if (dd < best) {best = dd; end = i;}}
  }
  const out: number[] = []; for (let v = end; v !== -1; v = prev[v]) out.push(v);
  return out.reverse();
}

/** Evenly spaced points (`steps`) along a polyline. */
export function resample(points: V3[], steps: number): V3[] {
  if (points.length < 2) return points.map(p => [...p] as V3);
  const cum = [0]; for (let i = 1; i < points.length; i++) cum.push(cum[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1], points[i][2] - points[i - 1][2]));
  const total = cum[cum.length - 1] || 1, out: V3[] = [];
  for (let k = 0; k < steps; k++) {
    const d = total * k / (steps - 1); let i = 1; while (i < cum.length - 1 && cum[i] < d) i++;
    const f = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1);
    out.push([0, 1, 2].map(c => points[i - 1][c] * (1 - f) + points[i][c] * f) as V3);
  }
  return out;
}

export const polylineLength = (points: V3[]) => points.reduce((sum, p, i) => i ? sum + Math.hypot(p[0] - points[i - 1][0], p[1] - points[i - 1][1], p[2] - points[i - 1][2]) : 0, 0);

/** Moves each point of a path to the centre of the vessel: the mean of the mesh vertices within `radius` of it (two passes), the two ends kept where they are pulled from. */
export function centrePath(positions: ArrayLike<number>, points: V3[], radius: number): V3[] {
  let cur = points.map(p => [...p] as V3);
  const n = positions.length / 3;
  for (let pass = 0; pass < 2; pass++) {
    cur = cur.map(p => {
      let sx = 0, sy = 0, sz = 0, c = 0;
      for (let i = 0; i < n; i++) {
        const dx = positions[i * 3] - p[0], dy = positions[i * 3 + 1] - p[1], dz = positions[i * 3 + 2] - p[2];
        if (dx * dx + dy * dy + dz * dz < radius * radius) {sx += positions[i * 3]; sy += positions[i * 3 + 1]; sz += positions[i * 3 + 2]; c++;}
      }
      return c >= 3 ? [sx / c, sy / c, sz / c] as V3 : p;
    });
  }
  // a point pulled far away (between two branches lying side by side) stays on the surface instead
  return cur.map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1], p[2] - points[i][2]) > 1.5 * radius ? [...points[i]] as V3 : p);
}

/** Centre line of the stretch of an artery mesh between two points: surface path, resampled, pulled to the middle and resampled again. */
export function arteryPath(positions: ArrayLike<number>, indices: ArrayLike<number>, from: V3, to: V3, radius = .0016, steps = 32): V3[] {
  const path = surfacePath(positions, indices, from, to).map(i => [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]] as V3);
  return resample(centrePath(positions, resample(path, steps), radius), steps);
}

/** The vertex of a mesh farthest from a point (straight-line distance), as a point. */
export function farthestFrom(positions: ArrayLike<number>, p: V3): V3 {
  let best = -1, at = 0;
  for (let i = 0; i < positions.length / 3; i++) {const d = Math.hypot(positions[i * 3] - p[0], positions[i * 3 + 1] - p[1], positions[i * 3 + 2] - p[2]); if (d > best) {best = d; at = i;}}
  return [positions[at * 3], positions[at * 3 + 1], positions[at * 3 + 2]];
}
/** The vertex of a mesh nearest to a point, as a point. */
export function nearestPoint(positions: ArrayLike<number>, p: V3): V3 {
  const i = nearestTo(positions, p);
  return [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]];
}
/** The vertex with the smallest (sign −1) or largest (sign 1) coordinate on an axis. */
export function extreme(positions: ArrayLike<number>, axis: 0 | 1 | 2, sign: 1 | -1): V3 {
  let best = -Infinity, at = 0;
  for (let i = 0; i < positions.length / 3; i++) {const v = positions[i * 3 + axis] * sign; if (v > best) {best = v; at = i;}}
  return [positions[at * 3], positions[at * 3 + 1], positions[at * 3 + 2]];
}
