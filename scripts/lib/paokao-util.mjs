// Geometry helpers for the structures built in scripts/paokao-structures/*.mjs: landmarks measured on the atlas meshes, tubes, ribbons, surface patches.
import {tube} from './nerve-schematics.mjs';
import {tubeTips} from './tube-tips.mjs';
import {weldByPosition} from './stream-writer.mjs';
import {sub, add, mul, unit, len, lerp, dot, cross, closest, patch, merge, meshOf, ray} from './heart-geom.mjs';
export {sub, add, mul, unit, len, lerp, dot, cross, merge};

/** Split the triangles of `mesh` that touch `region` into four until no edge is longer than maxEdge (midpoint subdivision, so the surface is unchanged). */
function refine(mesh, region, maxEdge) {
  let tris = mesh.tris.map(t => [t.a, t.b, t.c]);
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2], edge = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  for (let pass = 0; pass < 6; pass++) {
    const next = []; let split = 0;
    for (const [a, b, c] of tris) {
      const longest = Math.max(edge(a, b), edge(b, c), edge(c, a));
      if (longest > maxEdge && (region(a) || region(b) || region(c) || region(mid(a, mid(b, c))))) {
        const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a); split++;
        next.push([a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca]);
      } else next.push([a, b, c]);
    }
    tris = next; if (!split) break;
  }
  const positions = new Float32Array(tris.length * 9), indices = new Uint32Array(tris.length * 3);
  tris.forEach((t, i) => { t.forEach((v, k) => positions.set(v, i * 9 + k * 3)); indices.set([i * 3, i * 3 + 1, i * 3 + 2], i * 3); });
  return meshOf(positions, indices);
}

const distCache = new Map();
/** The triangles of `mesh` chosen by `keep`, welded into one surface and lifted `off` along smoothed vertex normals (so the patch stays one piece and can be simplified). */
function smoothPatch(mesh, keep, off) {
  const pos = [], idx = [];
  for (const tr of mesh.tris) if (keep(tr)) { const b = pos.length / 3; pos.push(...tr.a, ...tr.b, ...tr.c); idx.push(b, b + 1, b + 2); }
  if (!idx.length) return {positions: new Float32Array(0), indices: new Uint32Array(0)};
  const {positions, indices} = weldByPosition(Float32Array.from(pos), Uint32Array.from(idx)), n = new Float32Array(positions.length);
  for (let i = 0; i < indices.length; i += 3) {
    const [a, b, c] = [indices[i], indices[i + 1], indices[i + 2]];
    const ux = positions[b * 3] - positions[a * 3], uy = positions[b * 3 + 1] - positions[a * 3 + 1], uz = positions[b * 3 + 2] - positions[a * 3 + 2], vx = positions[c * 3] - positions[a * 3], vy = positions[c * 3 + 1] - positions[a * 3 + 1], vz = positions[c * 3 + 2] - positions[a * 3 + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const k of [a, b, c]) { n[k * 3] += nx; n[k * 3 + 1] += ny; n[k * 3 + 2] += nz; }
  }
  for (let i = 0; i < positions.length; i += 3) { const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1; for (let k = 0; k < 3; k++) positions[i + k] += n[i + k] / l * off; }
  return {positions, indices};
}
export function makeUtil(w) {
  const verts = name => { const m = w.mesh(name), out = []; for (let i = 0; i < m.positions.length; i += 3) out.push([m.positions[i], m.positions[i + 1], m.positions[i + 2]]); return out; };
  const vcache = new Map(), V = name => (vcache.has(name) ? vcache.get(name) : (vcache.set(name, verts(name)), vcache.get(name)));
  const centroid = list => list.reduce((s, v) => add(s, mul(v, 1 / list.length)), [0, 0, 0]);
  const U = {
    mesh: n => w.mesh(n), has: n => w.has(n), V,
    /** The first of several candidate names that exists in the atlas. */
    pick: (...names) => { const n = names.find(x => w.has(x)); if (!n) throw new Error(`none of ${names.join(' | ')} exists`); return n; },
    /** Centre of a tube-like mesh near `p`: mean of the vertices within r of the vertex nearest to p. */
    cen(name, p, r = .004) {
      const list = V(name); let best = list[0], bd = Infinity; for (const v of list) { const d = len(sub(v, p)); if (d < bd) { bd = d; best = v; } }
      return centroid(list.filter(v => len(sub(v, best)) < r));
    },
    /** Centre of a tube-like mesh in the horizontal slab at height y (several branches: the one nearest to x,z). */
    axisAt(name, y, near, half = .0015) {
      let slab = [], h = half; for (; h < .02 && !slab.length; h *= 1.6) slab = V(name).filter(v => Math.abs(v[1] - y) < h);
      if (!slab.length) throw new Error(`axisAt: ${name} has nothing near y=${y}`);
      const seed = near ? slab.reduce((a, v) => len(sub(v, near)) < len(sub(a, near)) ? v : a, slab[0]) : slab[0];
      return centroid(slab.filter(v => Math.hypot(v[0] - seed[0], v[2] - seed[2]) < .006));
    },
    /** Extreme vertex of a mesh in a direction, optionally inside a box {x:[lo,hi], y:[…], z:[…]}. */
    extreme(name, dir, box) {
      let best = null, bs = -Infinity;
      for (const v of V(name)) {
        if (box && ((box.x && (v[0] < box.x[0] || v[0] > box.x[1])) || (box.y && (v[1] < box.y[0] || v[1] > box.y[1])) || (box.z && (v[2] < box.z[0] || v[2] > box.z[1])))) continue;
        const s = dot(v, dir); if (s > bs) { bs = s; best = v; }
      }
      if (!best) throw new Error(`extreme: nothing in box for ${name}`); return best;
    },
    /** Branch ends of a tube-like mesh (nerves, vessels): the tips of its skeleton, longer than minBranch. */
    tips(name, minBranch = .01) { const m = w.mesh(name), {pts, tips} = tubeTips({pos: m.positions, idx: m.indices}, minBranch); return tips.map(i => pts[i]); },
    /** The tip of a tube-like mesh nearest to p (where a branch leaves or joins). */
    tipNear(name, p, minBranch = .008) { const t = U.tips(name, minBranch); return t.reduce((a, v) => len(sub(v, p)) < len(sub(a, p)) ? v : a, t[0]); },
    /** Principal axis of a mesh (power iteration on the vertex covariance): {c, axis, lo, hi} with lo/hi the extent of the vertices along the axis. */
    pca(name) {
      const list = V(name), c = centroid(list), cov = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
      for (const v of list) { const d = sub(v, c); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) cov[i][j] += d[i] * d[j] / list.length; }
      let a = unit([1, .3, .2]); for (let k = 0; k < 30; k++) a = unit([0, 1, 2].map(i => cov[i][0] * a[0] + cov[i][1] * a[1] + cov[i][2] * a[2]));
      let lo = Infinity, hi = -Infinity; for (const v of list) { const t = dot(sub(v, c), a); lo = Math.min(lo, t); hi = Math.max(hi, t); }
      return {c, axis: a, lo, hi};
    },
    /** A point of a long mesh at fraction t of its length from the end `from` ('+y' = the end with the larger y, otherwise the other), and its extreme vertex in dir within that slice. */
    alongMesh(name, t, dir, from = 'x-min') {
      const q = U.pca(name), toward = from === 'x-min' ? (q.axis[0] >= 0 ? 1 : -1) : -(q.axis[0] >= 0 ? 1 : -1), sA = toward > 0 ? q.lo : q.hi, sB = toward > 0 ? q.hi : q.lo;
      const target = sA + (sB - sA) * t, slice = V(name).filter(v => Math.abs(dot(sub(v, q.c), q.axis) - target) < .004 * 1.2);
      const centre = centroid(slice);
      if (!dir) return centre;
      return slice.reduce((a, v) => dot(v, dir) > dot(a, dir) ? v : a, slice[0]);
    },
    /** First hit of a ray on a mesh (e.g. the skin of the back from a point inside the body): {point, normal} or null. */
    rayHit(name, o, d) { const h = ray(w.mesh(name), o, unit(d)); return h ? {point: h.point, normal: h.normal} : null; },
    /** Direction (pointing out of the tube) and radius of a tube end: vertices within 5 mm of the tip give a principal axis and the RMS distance from it. */
    tipFrame(name, tip) {
      const near = V(name).filter(v => len(sub(v, tip)) < .005); if (near.length < 8) return {dir: [0, -1, 0], radius: .001};
      const c = centroid(near), cov = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
      for (const v of near) { const d = sub(v, c); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) cov[i][j] += d[i] * d[j] / near.length; }
      let a = unit(sub(tip, c)); for (let k = 0; k < 24; k++) a = unit([0, 1, 2].map(i => cov[i][0] * a[0] + cov[i][1] * a[1] + cov[i][2] * a[2]));
      const dir = dot(a, sub(tip, c)) < 0 ? mul(a, -1) : a; let r2 = 0; for (const v of near) { const d = sub(v, c), al = dot(d, dir); r2 += (dot(d, d) - al * al) / near.length; }
      return {dir, radius: Math.max(.0004, Math.min(Math.sqrt(r2) * 1.2, .008))};
    },
    surf(name, p) { const c = closest(w.mesh(name), p); return c.point; },
    /** Point on the surface of `name` nearest p, moved `off` along the outward normal. */
    onSurface(name, p, off = 0) { const c = closest(w.mesh(name), p); return add(c.point, mul(c.normal, off)); },
    dist(name, p) { return closest(w.mesh(name), p).d; },
    tube: (pts, r0, r1 = r0, samples = 24, sides = 6) => tube(pts, r0, r1, samples, sides),
    /** Flat band (ligament, retinaculum) along a path: width across `side`, thickness along the other axis. */
    ribbon(pts, width, thick, hint = [0, 0, 1], samples = 20) {
      const P = []; const n = pts.length;
      const at = i => pts[Math.max(0, Math.min(n - 1, i))];
      for (let s = 0; s < n - 1; s++) for (let k = 0; k < samples / (n - 1); k++) {
        const t = k / (samples / (n - 1)), p0 = at(s - 1), p1 = at(s), p2 = at(s + 1), p3 = at(s + 2);
        P.push([0, 1, 2].map(a => .5 * ((2 * p1[a]) + (-p0[a] + p2[a]) * t + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t * t + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t ** 3)));
      }
      P.push(pts[n - 1]);
      const positions = [], indices = [];
      P.forEach((p, i) => {
        const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], tan = unit(sub(b, a));
        let side = hint === 'vertical' ? sub([0, 1, 0], mul(tan, tan[1])) : cross(tan, hint); if (len(side) < 1e-6) side = cross(tan, [0, 1, 0]); side = unit(side);
        const up = unit(cross(side, tan));
        for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) positions.push(...add(add(p, mul(side, sx * width / 2)), mul(up, sy * thick / 2)));
      });
      for (let i = 0; i < P.length - 1; i++) for (let j = 0; j < 4; j++) { const a = i * 4 + j, b = i * 4 + (j + 1) % 4, c = (i + 1) * 4 + j, d = (i + 1) * 4 + (j + 1) % 4; indices.push(a, c, b, b, c, d); }
      for (const [r, flip] of [[0, true], [P.length - 1, false]]) indices.push(...(flip ? [r * 4, r * 4 + 2, r * 4 + 1, r * 4, r * 4 + 3, r * 4 + 2] : [r * 4, r * 4 + 1, r * 4 + 2, r * 4, r * 4 + 2, r * 4 + 3]));
      return {positions: Float32Array.from(positions), indices: Uint32Array.from(indices)};
    },
    /** Triangles of a mesh whose centre is within `radius` of `c` (or satisfies keep), as a patch lifted `off` off the surface. */
    surfacePatch(name, c, radius, off = .0003, keep) { return U.patchWhere(name, tr => len(sub(tr.mid, c)) <= radius && (!keep || keep(tr)), off, p => len(sub(p, c)) < radius + .006, Math.max(.0007, radius / 5)); },
    /** Triangles of mesh `name` within `d` of another mesh (an impression or groove left by a neighbouring structure). */
    contactPatch(name, other, d, off = .0003, keep) { const dist = U.nearDist(name, other), m = w.mesh(name); const idx = new Map(m.tris.map((t, i) => [t, i])); return smoothPatch(m, tr => dist[idx.get(tr)] <= d && (!keep || keep(tr)), off); },
    /** Distance from each triangle centre of `name` to the nearest vertex or triangle centre of `other` (grid lookup, accurate to about half an edge). */
    nearDist(name, other) {
      const key = name + '>' + other; if (distCache.has(key)) return distCache.get(key);
      const o = w.mesh(other), pts = []; for (const t of o.tris) pts.push(t.a, t.b, t.c, t.mid);
      const C = .008, cell = v => [Math.floor(v[0] / C), Math.floor(v[1] / C), Math.floor(v[2] / C)], grid = new Map();
      for (const p of pts) { const k = cell(p).join(','); (grid.get(k) ?? grid.set(k, []).get(k)).push(p); }
      const m = w.mesh(name), out = new Float32Array(m.tris.length).fill(1);
      m.tris.forEach((t, i) => { const [cx, cy, cz] = cell(t.mid); let best = 1; for (let x = cx - 2; x <= cx + 2; x++) for (let y = cy - 2; y <= cy + 2; y++) for (let z = cz - 2; z <= cz + 2; z++) for (const p of grid.get(`${x},${y},${z}`) ?? []) { const d = len(sub(p, t.mid)); if (d < best) best = d; } out[i] = best; });
      distCache.set(key, out); return out;
    },
    /** A thin sheet through a grid of points (rows × cols), thickness t. Double sided. */
    sheet(grid, t = .0006) {
      const rows = grid.length, cols = grid[0].length, positions = [], indices = [];
      const nrm = (i, j) => { const a = grid[Math.min(rows - 1, i + 1)][j], b = grid[Math.max(0, i - 1)][j], c = grid[i][Math.min(cols - 1, j + 1)], d = grid[i][Math.max(0, j - 1)]; return unit(cross(sub(a, b), sub(c, d))); };
      for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) { const n = nrm(i, j); positions.push(...add(grid[i][j], mul(n, t / 2)), ...sub(grid[i][j], mul(n, t / 2))); }
      const id = (i, j, s) => (i * cols + j) * 2 + s;
      for (let i = 0; i < rows - 1; i++) for (let j = 0; j < cols - 1; j++) {
        indices.push(id(i, j, 0), id(i + 1, j, 0), id(i, j + 1, 0), id(i, j + 1, 0), id(i + 1, j, 0), id(i + 1, j + 1, 0));
        indices.push(id(i, j, 1), id(i, j + 1, 1), id(i + 1, j, 1), id(i, j + 1, 1), id(i + 1, j + 1, 1), id(i + 1, j, 1));
      }
      return {positions: Float32Array.from(positions), indices: Uint32Array.from(indices)};
    },
    /** Hollow translucent box through 8 corners (a space: bottom 4 then top 4), as its 12 triangles. */
    prism(c) {
      const f = [[0, 1, 2, 3], [4, 7, 6, 5], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]], indices = [];
      for (const q of f) indices.push(q[0], q[1], q[2], q[0], q[2], q[3]);
      return {positions: Float32Array.from(c.flat()), indices: Uint32Array.from(indices)};
    },
    /** A small ellipsoid (a ganglion), semi-axes in metres along the three directions. */
    ellipsoid(c, ax, ay = ax, az = ax, rot) {
      const positions = [], indices = [], N = 10, M = 8;
      for (let i = 0; i <= M; i++) { const th = Math.PI * i / M; for (let j = 0; j < N; j++) { const ph = 2 * Math.PI * j / N; let v = [ax * Math.sin(th) * Math.cos(ph), ay * Math.cos(th), az * Math.sin(th) * Math.sin(ph)]; if (rot) v = rot(v); positions.push(c[0] + v[0], c[1] + v[1], c[2] + v[2]); } }
      for (let i = 0; i < M; i++) for (let j = 0; j < N; j++) { const a = i * N + j, b = i * N + (j + 1) % N, cc = (i + 1) * N + j, d = (i + 1) * N + (j + 1) % N; indices.push(a, cc, b, b, cc, d); }
      return {positions: Float32Array.from(positions), indices: Uint32Array.from(indices)};
    },
    /** Triangles of a mesh selected by a predicate on {mid, n, a, b, c}, lifted `off` off the surface. With `region` (a predicate on a point) the triangles
     *  there are first split down to `maxEdge` so the patch follows its outline instead of whole bone triangles. */
    patchWhere(name, keep, off = .0003, region, maxEdge = .0015) {
      let m = w.mesh(name);
      if (region) m = refine(m, region, maxEdge);
      return smoothPatch(m, keep, off);
    },
    /** Predicate: the triangle centre lies within r of a polyline. */
    nearPolyline(pts, r) {
      const segDist = (p, a, b) => { const ab = sub(b, a), t = Math.max(0, Math.min(1, dot(sub(p, a), ab) / (dot(ab, ab) || 1))); return len(sub(p, add(a, mul(ab, t)))); };
      return x => { const q = Array.isArray(x) ? x : x.mid; for (let i = 0; i < pts.length - 1; i++) if (segDist(q, pts[i], pts[i + 1]) <= r) return true; return pts.length === 1 && len(sub(q, pts[0])) <= r; };
    },
    /** A closed ribbon ring (a hiatus, a band round a limb): points on an ellipse in the plane spanned by u and v around centre c. */
    ring(c, u, v, ru, rv, width, thick, n = 18) {
      const pts = []; for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2; pts.push(add(c, add(mul(u, Math.cos(a) * ru), mul(v, Math.sin(a) * rv)))); }
      return U.ribbon(pts, width, thick, cross(unit(u), unit(v)), n * 2);
    },
    merge,
  };
  return U;
}
