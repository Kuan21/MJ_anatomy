// Geometry helpers of the stability checks (scripts/check-stability.mjs): a triangle grid with closest-point queries, welded edges, connected pieces.
// Units are metres (the viewer's world). Everything works on flat typed arrays so that the whole body (about 2.7 million triangles) stays affordable.

/** Closest point on triangle (a, b, c) to p (Ericson). Writes the point to `out` and returns the squared distance. */
export function closestOnTri(px, py, pz, ax, ay, az, bx, by, bz, cx, cy, cz, out) {
  const abx = bx - ax, aby = by - ay, abz = bz - az, acx = cx - ax, acy = cy - ay, acz = cz - az, apx = px - ax, apy = py - ay, apz = pz - az;
  const d1 = abx * apx + aby * apy + abz * apz, d2 = acx * apx + acy * apy + acz * apz;
  let x, y, z;
  if (d1 <= 0 && d2 <= 0) { x = ax; y = ay; z = az; }
  else {
    const bpx = px - bx, bpy = py - by, bpz = pz - bz, d3 = abx * bpx + aby * bpy + abz * bpz, d4 = acx * bpx + acy * bpy + acz * bpz;
    if (d3 >= 0 && d4 <= d3) { x = bx; y = by; z = bz; }
    else {
      const vc = d1 * d4 - d3 * d2;
      if (vc <= 0 && d1 >= 0 && d3 <= 0) { const v = d1 / (d1 - d3); x = ax + abx * v; y = ay + aby * v; z = az + abz * v; }
      else {
        const cpx = px - cx, cpy = py - cy, cpz = pz - cz, d5 = abx * cpx + aby * cpy + abz * cpz, d6 = acx * cpx + acy * cpy + acz * cpz;
        if (d6 >= 0 && d5 <= d6) { x = cx; y = cy; z = cz; }
        else {
          const vb = d5 * d2 - d1 * d6;
          if (vb <= 0 && d2 >= 0 && d6 <= 0) { const w = d2 / (d2 - d6); x = ax + acx * w; y = ay + acy * w; z = az + acz * w; }
          else {
            const va = d3 * d6 - d5 * d4;
            if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) { const w = (d4 - d3) / ((d4 - d3) + (d5 - d6)); x = bx + (cx - bx) * w; y = by + (cy - by) * w; z = bz + (cz - bz) * w; }
            else { const den = 1 / (va + vb + vc), v = vb * den, w = vc * den; x = ax + abx * v + acx * w; y = ay + aby * v + acy * w; z = az + abz * v + acz * w; }
          }
        }
      }
    }
  }
  out[0] = x; out[1] = y; out[2] = z;
  return (x - px) ** 2 + (y - py) ** 2 + (z - pz) ** 2;
}

/** Triangles of several meshes in one hash grid. add(owner, positions, indices[, matrix-free transform]) then query. */
export class TriGrid {
  constructor(cell = .006) { this.cell = cell; this.cells = new Map(); this.v = []; this.owner = []; this.nrm = []; this.count = 0; }
  key(x, y, z) { return (x * 73856093) ^ (y * 19349663) ^ (z * 83492791); }
  add(owner, positions, indices) {
    const {cell} = this;
    for (let i = 0; i < indices.length; i += 3) {
      const a = indices[i] * 3, b = indices[i + 1] * 3, c = indices[i + 2] * 3;
      const ax = positions[a], ay = positions[a + 1], az = positions[a + 2], bx = positions[b], by = positions[b + 1], bz = positions[b + 2], cx = positions[c], cy = positions[c + 1], cz = positions[c + 2];
      let nx = (by - ay) * (cz - az) - (bz - az) * (cy - ay), ny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az), nz = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
      const nl = Math.hypot(nx, ny, nz); if (nl < 1e-14) continue;
      const id = this.count++; this.v.push(ax, ay, az, bx, by, bz, cx, cy, cz); this.nrm.push(nx / nl, ny / nl, nz / nl); this.owner.push(owner);
      const x0 = Math.floor(Math.min(ax, bx, cx) / cell), x1 = Math.floor(Math.max(ax, bx, cx) / cell), y0 = Math.floor(Math.min(ay, by, cy) / cell), y1 = Math.floor(Math.max(ay, by, cy) / cell), z0 = Math.floor(Math.min(az, bz, cz) / cell), z1 = Math.floor(Math.max(az, bz, cz) / cell);
      if ((x1 - x0 + 1) * (y1 - y0 + 1) * (z1 - z0 + 1) > 64) {   // a very large triangle: register by its three corners and centroid only
        for (const [x, y, z] of [[ax, ay, az], [bx, by, bz], [cx, cy, cz], [(ax + bx + cx) / 3, (ay + by + cy) / 3, (az + bz + cz) / 3]]) this.put(Math.floor(x / cell), Math.floor(y / cell), Math.floor(z / cell), id);
        continue;
      }
      for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) this.put(x, y, z, id);
    }
  }
  put(x, y, z, id) { const k = this.key(x, y, z); let l = this.cells.get(k); if (!l) this.cells.set(k, l = []); if (l[l.length - 1] !== id) l.push(id); }
  /** Nearest triangle within `radius` (not owned by a skipped owner). Returns {d, owner, tri, nx, ny, nz, qx, qy, qz} or null. */
  nearest(px, py, pz, radius, skip) {
    const {cell} = this, r = Math.ceil(radius / cell), cx = Math.floor(px / cell), cy = Math.floor(py / cell), cz = Math.floor(pz / cell), q = [0, 0, 0], v = this.v;
    let best = Infinity, tri = -1, bq = null;
    for (let x = cx - r; x <= cx + r; x++) for (let y = cy - r; y <= cy + r; y++) for (let z = cz - r; z <= cz + r; z++) {
      const l = this.cells.get(this.key(x, y, z)); if (!l) continue;
      for (const id of l) {
        if (skip && skip(this.owner[id])) continue;
        const o = id * 9, d2 = closestOnTri(px, py, pz, v[o], v[o + 1], v[o + 2], v[o + 3], v[o + 4], v[o + 5], v[o + 6], v[o + 7], v[o + 8], q);
        if (d2 < best) { best = d2; tri = id; bq = [q[0], q[1], q[2]]; }
      }
    }
    if (tri < 0 || best > radius * radius) return null;
    return {d: Math.sqrt(best), owner: this.owner[tri], tri, nx: this.nrm[tri * 3], ny: this.nrm[tri * 3 + 1], nz: this.nrm[tri * 3 + 2], qx: bq[0], qy: bq[1], qz: bq[2]};
  }
}

/** Vertices welded by position (1 micrometre): returns {map: Uint32Array old vertex -> welded id, count}. */
export function weld(positions) {
  const n = positions.length / 3, map = new Uint32Array(n), seen = new Map(); let count = 0;
  for (let i = 0; i < n; i++) {
    const k = `${Math.round(positions[i * 3] * 1e6)},${Math.round(positions[i * 3 + 1] * 1e6)},${Math.round(positions[i * 3 + 2] * 1e6)}`;
    let id = seen.get(k); if (id === undefined) seen.set(k, id = count++); map[i] = id;
  }
  return {map, count};
}

/** Connected pieces of a mesh over welded vertices: {pieceOfTri: Int32Array, pieces: [{tris, lo, hi, diag}]} sorted by size (largest first). */
export function pieces(positions, indices) {
  const w = weld(positions), parent = Int32Array.from({length: w.count}, (_, i) => i);
  const find = x => { while (parent[x] !== x) x = parent[x] = parent[parent[x]]; return x; };
  for (let i = 0; i < indices.length; i += 3) { const a = find(w.map[indices[i]]); parent[find(w.map[indices[i + 1]])] = a; parent[find(w.map[indices[i + 2]])] = a; }
  const root = new Map(), list = [], pieceOfTri = new Int32Array(indices.length / 3);
  for (let t = 0; t < indices.length / 3; t++) {
    const r = find(w.map[indices[t * 3]]); let id = root.get(r);
    if (id === undefined) { id = list.length; root.set(r, id); list.push({tris: [], lo: [1e9, 1e9, 1e9], hi: [-1e9, -1e9, -1e9]}); }
    pieceOfTri[t] = id; const p = list[id]; p.tris.push(t);
    for (let k = 0; k < 3; k++) for (let a = 0; a < 3; a++) { const x = positions[indices[t * 3 + k] * 3 + a]; if (x < p.lo[a]) p.lo[a] = x; if (x > p.hi[a]) p.hi[a] = x; }
  }
  for (const p of list) p.diag = Math.hypot(p.hi[0] - p.lo[0], p.hi[1] - p.lo[1], p.hi[2] - p.lo[2]);
  const order = list.map((_, i) => i).sort((a, b) => list[b].tris.length - list[a].tris.length), rank = new Int32Array(list.length);
  order.forEach((o, r) => { rank[o] = r; });
  for (let t = 0; t < pieceOfTri.length; t++) pieceOfTri[t] = rank[pieceOfTri[t]];
  return {pieceOfTri, pieces: order.map(o => list[o]), weld: w};
}

/** Boundary edges (used by one triangle only) over welded vertices, chained into loops/strips of welded vertex ids. */
export function boundaryChains(positions, indices) {
  const w = weld(positions), edges = new Map();
  for (let t = 0; t < indices.length; t += 3) for (let k = 0; k < 3; k++) {
    const a = w.map[indices[t + k]], b = w.map[indices[t + (k + 1) % 3]]; if (a === b) continue;
    const key = a < b ? a * 4294967296 + b : b * 4294967296 + a, e = edges.get(key);
    if (e) e.n++; else edges.set(key, {a, b, n: 1});
  }
  const adj = new Map(), pos = new Map();
  for (let i = 0; i < positions.length / 3; i++) if (!pos.has(w.map[i])) pos.set(w.map[i], [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]]);
  let boundary = 0;
  for (const e of edges.values()) if (e.n === 1) { boundary++; for (const [u, v] of [[e.a, e.b], [e.b, e.a]]) { let l = adj.get(u); if (!l) adj.set(u, l = []); l.push(v); } }
  const used = new Set(), chains = [];
  const ek = (a, b) => a < b ? a * 4294967296 + b : b * 4294967296 + a;
  for (const [start, nb] of adj) {
    for (const first of nb) {
      if (used.has(ek(start, first))) continue;
      const chain = [start]; let prev = start, cur = first; used.add(ek(start, first));
      for (let guard = 0; guard < 1e6; guard++) {
        chain.push(cur);
        const next = (adj.get(cur) || []).find(n => n !== prev && !used.has(ek(cur, n)));
        if (next === undefined) break;
        used.add(ek(cur, next)); prev = cur; cur = next;
        if (cur === start) { chain.push(cur); break; }
      }
      chains.push(chain.map(v => pos.get(v)));
    }
  }
  return {chains, boundary, edgeCount: edges.size};
}

/** Longest run of consecutive points of a chain that stay on one straight line (all points within `tol` metres of the line through the run ends). */
export function longestStraightRun(chain, tol = .0006) {
  let best = {len: 0, from: 0, to: 0, points: 0};
  const n = chain.length;
  for (let i = 0; i < n - 2; i++) {
    let j = i + 2;
    for (; j < n; j++) {
      const a = chain[i], b = chain[j], dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz); if (L < 1e-9) break;
      let ok = true;
      for (let k = i + 1; k < j; k++) { const p = chain[k], ex = p[0] - a[0], ey = p[1] - a[1], ez = p[2] - a[2], cx = ey * dz - ez * dy, cy = ez * dx - ex * dz, cz = ex * dy - ey * dx; if (Math.hypot(cx, cy, cz) / L > tol) { ok = false; break; } }
      if (!ok) break;
    }
    const e = j - 1, a = chain[i], b = chain[e], L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    if (e - i >= 2 && L > best.len) best = {len: L, from: i, to: e, points: e - i + 1, dir: [(b[0] - a[0]) / L, (b[1] - a[1]) / L, (b[2] - a[2]) / L]};
    if (e >= n - 1) break;
  }
  return best;
}
