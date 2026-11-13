// Centreline of a tube-like vessel mesh and bone clearance for centrelines (used by scripts/build-leg-vessels.mjs and the inventory).
import {tubeTips} from './tube-tips.mjs';
import {closestOnTri, meshOf} from './heart-geom.mjs';

const DIRS = [[.8132, .4021, .4213], [-.3517, .8801, .3176], [.2231, -.4416, .8696]].map(d => { const n = Math.hypot(...d); return d.map(x => x / n); });
/** Is p inside the closed mesh {pos, idx}? Majority of three ray directions (one ray flips near thin or doubled surfaces). */
export function pointInside(p, {pos, idx}) {
  let votes = 0;
  for (const d of DIRS) {
    let hits = 0;
    for (let i = 0; i < idx.length; i += 3) {
      const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
      const e1x = pos[b] - pos[a], e1y = pos[b + 1] - pos[a + 1], e1z = pos[b + 2] - pos[a + 2], e2x = pos[c] - pos[a], e2y = pos[c + 1] - pos[a + 1], e2z = pos[c + 2] - pos[a + 2];
      const hx = d[1] * e2z - d[2] * e2y, hy = d[2] * e2x - d[0] * e2z, hz = d[0] * e2y - d[1] * e2x, det = e1x * hx + e1y * hy + e1z * hz;
      if (Math.abs(det) < 1e-18) continue;
      const f = 1 / det, sx = p[0] - pos[a], sy = p[1] - pos[a + 1], sz = p[2] - pos[a + 2], u = f * (sx * hx + sy * hy + sz * hz); if (u < 0 || u > 1) continue;
      const qx = sy * e1z - sz * e1y, qy = sz * e1x - sx * e1z, qz = sx * e1y - sy * e1x, v = f * (d[0] * qx + d[1] * qy + d[2] * qz); if (v < 0 || u + v > 1) continue;
      if (f * (e2x * qx + e2y * qy + e2z * qz) > 0) hits++;
    }
    if (hits % 2 === 1) votes++;
  }
  return votes >= 2;
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], len = a => Math.hypot(a[0], a[1], a[2]);
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** Centreline of a vessel mesh ({positions, indices}) from its upper (larger y) end to its lower end, as [{c, r}] rings every `bin` metres of the main chain. */
// `info` (optional, for reports) receives {steps}: the distance along the surface chain between each ring and the next, in metres.
// `reach` is how far around the wall (metres along the surface, from the chain) vertices are collected into a ring; the default covers thin vessels only (see centrelineWide).
export function centrelineOf(g, bin = .003, info = null, reach = .008) {
  const t = tubeTips({pos: g.positions, idx: g.indices}), n = t.pts.length;
  const run = sources => { const dist = new Float64Array(n).fill(Infinity), prev = new Int32Array(n).fill(-1), lab = new Int32Array(n).fill(-1), heap = []; for (const s of sources) { dist[s] = 0; lab[s] = s; heap.push([0, s]); }
    while (heap.length) { heap.sort((x, y) => y[0] - x[0]); const [d, v] = heap.pop(); if (d > dist[v]) continue; for (const [u, w] of t.adj[v]) if (d + w < dist[u]) { dist[u] = d + w; prev[u] = v; lab[u] = lab[v]; heap.push([d + w, u]); } } return {dist, prev, lab}; };
  const fromA = run([t.tips[0]]); let bTip = t.tips[1]; for (let i = 0; i < n; i++) if (Number.isFinite(fromA.dist[i]) && fromA.dist[i] > fromA.dist[bTip]) bTip = i;
  const chain = []; for (let v = bTip; v >= 0; v = fromA.prev[v]) chain.push(v);
  const near = run(chain), bins = new Map();
  for (let i = 0; i < n; i++) if (near.dist[i] < reach && near.lab[i] >= 0) { const k = Math.floor(fromA.dist[near.lab[i]] / bin); (bins.get(k) ?? bins.set(k, []).get(k)).push(i); }
  const sorted = [...bins].sort((x, y) => x[0] - y[0]);
  const rings = sorted.map(([, vs]) => { const c = [0, 0, 0]; for (const v of vs) for (let a = 0; a < 3; a++) c[a] += t.pts[v][a] / vs.length; let r = 0; for (const v of vs) r += len(sub(t.pts[v], c)) / vs.length; return {c, r}; });
  if (info) info.steps = sorted.slice(1).map(([k], i) => (k - sorted[i][0]) * bin);
  if (rings.length > 1 && rings[0].c[1] < rings[rings.length - 1].c[1]) { rings.reverse(); if (info) info.steps.reverse(); }
  return rings;
}

/** Exact nearest point of a mesh (heart-geom's closest() skips triangles larger than 2 cm, which low-poly bones have). */
export function closest(mesh, p) {
  let best = null;
  for (const tr of mesh.tris) { const q = closestOnTri(p, tr.a, tr.b, tr.c), d = len(sub(q, p)); if (!best || d < best.d) best = {d, point: q, normal: tr.n}; }
  return best;
}

/** Resamples a polyline every `step` metres. */
export function resample(points, step = .003) {
  const out = [points[0]];
  for (let i = 1; i < points.length; i++) { const d = len(sub(points[i], points[i - 1])), k = Math.max(1, Math.round(d / step)); for (let j = 1; j <= k; j++) out.push(lerp(points[i - 1], points[i], j / k)); }
  return out;
}

/** Point on a polyline (dense) nearest to height y. */
export function atHeight(line, y) { return line.reduce((a, p) => Math.abs(p[1] - y) < Math.abs(a[1] - y) ? p : a, line[0]); }

/**
 * Moves a dense centreline (array of points, radii per point) out of the bones: a point whose wall (radius + margin) reaches into a bone is pushed out along the surface normal,
 * then the whole line is smoothed with its two ends and the `pin` indices kept. Returns the moved line and the number of rounds used.
 */
export function clearBones(line, radii, bones, {margin = .0012, rounds = 30, pin = [], soft = []} = {}) {
  const P = line.map(p => p.slice()), pinned = new Set([0, ...pin]);
  const meshes = bones.map(b => b.mesh ?? (b.mesh = meshOf(b.positions, b.indices)));
  let used = 0;
  const pushBones = () => {
    let moved = 0;
    P.forEach((p, i) => {
      for (let k = 0; k < bones.length; k++) {
        const b = bones[k], m = meshes[k];
        if (p[0] < b.lo[0] - .02 || p[0] > b.hi[0] + .02 || p[1] < b.lo[1] - .02 || p[1] > b.hi[1] + .02 || p[2] < b.lo[2] - .02 || p[2] > b.hi[2] + .02) continue;
        const h = closest(m, p); if (!h || h.d > radii[i] + margin + .03 && h.d > .03) continue;
        // side of the nearest face (surface normals point out of the bone): behind it, or too close in front of it, means the wall touches the bone; move to the clear distance in front of that face
        const sgn = (p[0] - h.point[0]) * h.normal[0] + (p[1] - h.point[1]) * h.normal[1] + (p[2] - h.point[2]) * h.normal[2], need = radii[i] + margin;
        if (sgn < 0 || h.d < need) { const t = [h.point[0] + h.normal[0] * need, h.point[1] + h.normal[1] * need, h.point[2] + h.normal[2] * need]; if (len(sub(t, p)) > 1e-4) { for (let a = 0; a < 3; a++) p[a] = t[a]; moved++; } }
      }
    });
    return moved;
  };
  const pushSoft = () => {
    let moved = 0;
    P.forEach((p, i) => { for (const m of soft) {
      if (p[0] < m.lo[0] - .02 || p[0] > m.hi[0] + .02 || p[1] < m.lo[1] - .02 || p[1] > m.hi[1] + .02 || p[2] < m.lo[2] - .02 || p[2] > m.hi[2] + .02) continue;
      const h = closest(m, p); if (h && h.d < radii[i] * .7) { const dir = sub(p, h.point), l = len(dir) || 1, need = radii[i] * .7 - h.d; for (let a = 0; a < 3; a++) p[a] += dir[a] / l * need; moved++; }
    } });
    return moved;
  };
  for (let round = 0; round < rounds; round++) {
    const moved = pushBones() + pushSoft();
    const Q = P.map(p => p.slice());
    for (let i = 1; i < P.length - 1; i++) if (!pinned.has(i)) for (let a = 0; a < 3; a++) Q[i][a] = P[i][a] * .7 + (P[i - 1][a] + P[i + 1][a]) * .15;
    for (let i = 0; i < P.length; i++) P[i] = Q[i];
    used = round + 1; if (!moved && round > 2) break;
  }
  // final passes without smoothing; bones last, so the line ends outside every bone
  for (let k = 0; k < 10; k++) if (!pushBones()) break;
  return {line: P, rounds: used};
}
