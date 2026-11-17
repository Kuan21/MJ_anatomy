// Nearest-surface distance from points to a triangle mesh (uniform grid over the triangles). Used by scripts/check-schematic-models.mjs.
const CELL = .005;
function closest(p, a, b, c) {
  // closest point on triangle abc to p (Ericson, Real-Time Collision Detection 5.1.5); returns squared distance
  const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]], ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
  const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2], d2 = q => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2;
  const at = (s, t) => [a[0] + ab[0] * s + ac[0] * t, a[1] + ab[1] * s + ac[1] * t, a[2] + ab[2] * s + ac[2] * t];
  const d1 = dot(ab, ap), d2_ = dot(ac, ap); if (d1 <= 0 && d2_ <= 0) return d2(a);
  const bp = [p[0] - b[0], p[1] - b[1], p[2] - b[2]], d3 = dot(ab, bp), d4 = dot(ac, bp); if (d3 >= 0 && d4 <= d3) return d2(b);
  const vc = d1 * d4 - d3 * d2_; if (vc <= 0 && d1 >= 0 && d3 <= 0) return d2(at(d1 / (d1 - d3), 0));
  const cp = [p[0] - c[0], p[1] - c[1], p[2] - c[2]], d5 = dot(ab, cp), d6 = dot(ac, cp); if (d6 >= 0 && d5 <= d6) return d2(c);
  const vb = d5 * d2_ - d1 * d6; if (vb <= 0 && d2_ >= 0 && d6 <= 0) return d2(at(0, d2_ / (d2_ - d6)));
  const va = d3 * d6 - d5 * d4; if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) { const w = (d4 - d3) / ((d4 - d3) + (d5 - d6)); return d2([b[0] + (c[0] - b[0]) * w, b[1] + (c[1] - b[1]) * w, b[2] + (c[2] - b[2]) * w]); }
  const den = 1 / (va + vb + vc); return d2(at(vb * den, vc * den));
}
/** {distance(point, maxM)}: distance (m) from a point to the nearest triangle, or Infinity beyond maxM. */
export function surfaceIndex(pos, idx) {
  const cells = new Map(), key = (x, y, z) => `${x},${y},${z}`, tri = i => [0, 1, 2].map(k => [pos[idx[i + k] * 3], pos[idx[i + k] * 3 + 1], pos[idx[i + k] * 3 + 2]]);
  for (let i = 0; i < idx.length; i += 3) {
    const t = tri(i), lo = [0, 1, 2].map(k => Math.floor(Math.min(t[0][k], t[1][k], t[2][k]) / CELL)), hi = [0, 1, 2].map(k => Math.floor(Math.max(t[0][k], t[1][k], t[2][k]) / CELL));
    for (let x = lo[0]; x <= hi[0]; x++) for (let y = lo[1]; y <= hi[1]; y++) for (let z = lo[2]; z <= hi[2]; z++) { const k = key(x, y, z); let l = cells.get(k); if (!l) cells.set(k, l = []); l.push(i); }
  }
  return {
    distance(p, maxM = .03) {
      const c = p.map(v => Math.floor(v / CELL)), rings = Math.ceil(maxM / CELL); let best = Infinity;
      for (let r = 0; r <= rings; r++) {
        if (best < Infinity && (r - 1) * CELL > Math.sqrt(best)) break;
        for (let x = -r; x <= r; x++) for (let y = -r; y <= r; y++) for (let z = -r; z <= r; z++) {
          if (Math.max(Math.abs(x), Math.abs(y), Math.abs(z)) !== r) continue;
          const l = cells.get(key(c[0] + x, c[1] + y, c[2] + z)); if (!l) continue;
          for (const i of l) { const t = tri(i), d = closest(p, t[0], t[1], t[2]); if (d < best) best = d; }
        }
      }
      const d = Math.sqrt(best); return d <= maxM ? d : Infinity;
    },
  };
}
/** Number of connected pieces of a triangle mesh, after welding vertices closer than `weld` (m). */
export function pieces(pos, idx, weld = 1e-5) {
  const key = i => `${Math.round(pos[i * 3] / weld)},${Math.round(pos[i * 3 + 1] / weld)},${Math.round(pos[i * 3 + 2] / weld)}`, ids = new Map(), map = new Int32Array(pos.length / 3);
  for (let i = 0; i < map.length; i++) { const k = key(i); if (!ids.has(k)) ids.set(k, ids.size); map[i] = ids.get(k); }
  const par = Int32Array.from({length: ids.size}, (_, i) => i), find = x => { while (par[x] !== x) x = par[x] = par[par[x]]; return x; };
  for (let i = 0; i < idx.length; i += 3) { const a = find(map[idx[i]]), b = find(map[idx[i + 1]]), c = find(map[idx[i + 2]]); par[b] = a; par[find(c)] = a; }
  const roots = new Set(); for (let i = 0; i < idx.length; i++) roots.add(find(map[idx[i]])); return roots.size;
}

const VOX = .001;
/** Points on the surface of a mesh, about every 0.5 mm. */
export function surfacePoints(pos, idx, step = .0005) {
  const pts = [];
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3, A = [pos[a], pos[a + 1], pos[a + 2]], B = [pos[b], pos[b + 1], pos[b + 2]], C = [pos[c], pos[c + 1], pos[c + 2]];
    const n = Math.min(40, Math.ceil(Math.max(Math.hypot(B[0] - A[0], B[1] - A[1], B[2] - A[2]), Math.hypot(C[0] - A[0], C[1] - A[1], C[2] - A[2])) / step));
    for (let s = 0; s <= n; s++) for (let t = 0; t <= n - s; t++) { const u = s / Math.max(n, 1), v = t / Math.max(n, 1); pts.push([A[0] + (B[0] - A[0]) * u + (C[0] - A[0]) * v, A[1] + (B[1] - A[1]) * u + (C[1] - A[1]) * v, A[2] + (B[2] - A[2]) * u + (C[2] - A[2]) * v]); }
  }
  return pts;
}
/** Separate pieces of a structure (one or more meshes): surface voxels of 1 mm, joined when they touch (26-neighbourhood), so a gap wider than about 1.5 mm breaks it. Returns piece sizes, largest first. */
export function pieceSizes(meshes) {
  const cells = new Map(), key = (x, y, z) => x + ',' + y + ',' + z;
  for (const {pos, idx} of meshes) for (const q of surfacePoints(pos, idx)) { const k = key(Math.floor(q[0] / VOX), Math.floor(q[1] / VOX), Math.floor(q[2] / VOX)); if (!cells.has(k)) cells.set(k, -1); }
  const sizes = []; let label = 0;
  for (const [k, v] of cells) {
    if (v >= 0) continue;
    const stack = [k]; cells.set(k, label); let n = 0;
    while (stack.length) {
      const [x, y, z] = stack.pop().split(',').map(Number); n++;
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) { const nk = key(x + dx, y + dy, z + dz); if (cells.get(nk) === -1) { cells.set(nk, label); stack.push(nk); } }
    }
    sizes.push(n); label++;
  }
  return sizes.sort((a, b) => b - a);
}
