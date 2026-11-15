import * as T from 'three';

/** One Loop subdivision step on an indexed triangle mesh (positions only). The cortical meshes of the Brain Project model have about 500 vertices per gyrus, which shows as
 * flat facets on a surface only a few millimetres across; one step quadruples the triangles and moves the vertices onto the smooth limit surface, so a gyrus reads as a curved
 * surface. Open edges (the border of a patch) use the boundary rule, which depends only on the border itself, so neighbouring patches that share a border stay joined. */
export function loopSubdivide(source: T.BufferGeometry): T.BufferGeometry {
  const pos = source.getAttribute('position').array as ArrayLike<number>, index = source.getIndex()!.array as ArrayLike<number>;
  const n = pos.length / 3, tris = index.length / 3;
  const key = (a: number, b: number) => a < b ? a * n + b : b * n + a;
  // edges: the vertices opposite to it and how many faces use it
  const edgeFaces = new Map<number, number[]>();
  for (let t = 0; t < tris; t++) {
    const a = index[t * 3], b = index[t * 3 + 1], c = index[t * 3 + 2];
    for (const [u, v, w] of [[a, b, c], [b, c, a], [c, a, b]]) {
      const k = key(u, v), list = edgeFaces.get(k);
      if (list) list.push(w); else edgeFaces.set(k, [w]);
    }
  }
  const nbrs: Set<number>[] = Array.from({length: n}, () => new Set<number>()), borderNbrs: number[][] = Array.from({length: n}, () => []), nonManifold = new Uint8Array(n);
  for (const [k, opp] of edgeFaces) {
    const a = Math.floor(k / n), b = k % n;
    nbrs[a].add(b); nbrs[b].add(a);
    if (opp.length !== 2) {borderNbrs[a].push(b); borderNbrs[b].push(a); if (opp.length > 2) {nonManifold[a] = 1; nonManifold[b] = 1;}}
  }
  const out = new Float32Array((n + edgeFaces.size) * 3);
  // old vertices
  for (let v = 0; v < n; v++) {
    const x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2], border = borderNbrs[v];
    let ox = x, oy = y, oz = z;
    if (border.length === 0) {
      const k = nbrs[v].size, beta = k === 3 ? 3 / 16 : 3 / (8 * k);
      if (k > 0) {
        let sx = 0, sy = 0, sz = 0;
        for (const u of nbrs[v]) {sx += pos[u * 3]; sy += pos[u * 3 + 1]; sz += pos[u * 3 + 2];}
        ox = (1 - k * beta) * x + beta * sx; oy = (1 - k * beta) * y + beta * sy; oz = (1 - k * beta) * z + beta * sz;
      }
    } else if (border.length === 2 && !nonManifold[v]) {
      const [a, b] = border;
      ox = .75 * x + .125 * (pos[a * 3] + pos[b * 3]); oy = .75 * y + .125 * (pos[a * 3 + 1] + pos[b * 3 + 1]); oz = .75 * z + .125 * (pos[a * 3 + 2] + pos[b * 3 + 2]);
    }
    out[v * 3] = ox; out[v * 3 + 1] = oy; out[v * 3 + 2] = oz;
  }
  // edge vertices
  const edgeIndex = new Map<number, number>();
  let next = n;
  for (const [k, opp] of edgeFaces) {
    const a = Math.floor(k / n), b = k % n;
    let px: number, py: number, pz: number;
    if (opp.length === 2) {
      const c = opp[0], d = opp[1];
      px = .375 * (pos[a * 3] + pos[b * 3]) + .125 * (pos[c * 3] + pos[d * 3]); py = .375 * (pos[a * 3 + 1] + pos[b * 3 + 1]) + .125 * (pos[c * 3 + 1] + pos[d * 3 + 1]); pz = .375 * (pos[a * 3 + 2] + pos[b * 3 + 2]) + .125 * (pos[c * 3 + 2] + pos[d * 3 + 2]);
    } else {px = .5 * (pos[a * 3] + pos[b * 3]); py = .5 * (pos[a * 3 + 1] + pos[b * 3 + 1]); pz = .5 * (pos[a * 3 + 2] + pos[b * 3 + 2]);}
    out[next * 3] = px; out[next * 3 + 1] = py; out[next * 3 + 2] = pz; edgeIndex.set(k, next++);
  }
  const faces = new Uint32Array(tris * 12);
  for (let t = 0; t < tris; t++) {
    const a = index[t * 3], b = index[t * 3 + 1], c = index[t * 3 + 2], ab = edgeIndex.get(key(a, b))!, bc = edgeIndex.get(key(b, c))!, ca = edgeIndex.get(key(c, a))!;
    faces.set([a, ab, ca, b, bc, ab, c, ca, bc, ab, bc, ca], t * 12);
  }
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.BufferAttribute(out, 3)); g.setIndex(new T.BufferAttribute(faces, 1));
  return g;
}

/** Cells of a coarse grid that lie within `radius` (a cube of cells, so a little more than the round distance) of any point of `clouds`. Used to find the part of a cranial nerve
 * that belongs to the brain view: the stretch near the brain, before the nerve leaves the skull. */
export function nearMask(clouds: ArrayLike<number>[], cell: number, radius: number) {
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (const c of clouds) for (let i = 0; i < c.length; i += 3) for (let k = 0; k < 3; k++) {lo[k] = Math.min(lo[k], c[i + k]); hi[k] = Math.max(hi[k], c[i + k]);}
  const r = Math.ceil(radius / cell), origin = lo.map(v => v - (r + 1) * cell), dims = hi.map((v, k) => Math.ceil((v - origin[k]) / cell) + r + 2);
  const [nx, ny, nz] = dims, at = (x: number, y: number, z: number) => x + nx * (y + ny * z);
  let grid = new Uint8Array(nx * ny * nz);
  for (const c of clouds) for (let i = 0; i < c.length; i += 3) grid[at(Math.floor((c[i] - origin[0]) / cell), Math.floor((c[i + 1] - origin[1]) / cell), Math.floor((c[i + 2] - origin[2]) / cell))] = 1;
  // dilate along each axis in turn (running window of 2r + 1 cells)
  for (let axis = 0; axis < 3; axis++) {
    const next = new Uint8Array(grid.length), len = dims[axis], stride = axis === 0 ? 1 : axis === 1 ? nx : nx * ny;
    const outer = [0, 1, 2].filter(k => k !== axis);
    for (let a = 0; a < dims[outer[0]]; a++) for (let b = 0; b < dims[outer[1]]; b++) {
      const c = [0, 0, 0]; c[outer[0]] = a; c[outer[1]] = b; const base = at(c[0], c[1], c[2]);
      let last = -Infinity;
      for (let i = 0; i < len; i++) if (grid[base + i * stride]) last = i, next[base + i * stride] = 1; else if (i - last <= r) next[base + i * stride] = 1;
      let nextOne = Infinity;
      for (let i = len - 1; i >= 0; i--) if (grid[base + i * stride]) nextOne = i; else if (nextOne - i <= r) next[base + i * stride] = 1;
    }
    grid = next;
  }
  return {has: (x: number, y: number, z: number) => {
    const ix = Math.floor((x - origin[0]) / cell), iy = Math.floor((y - origin[1]) / cell), iz = Math.floor((z - origin[2]) / cell);
    return ix >= 0 && iy >= 0 && iz >= 0 && ix < nx && iy < ny && iz < nz && grid[at(ix, iy, iz)] === 1;
  }};
}

/** The triangles of an indexed geometry whose three vertices are all inside `mask`, as a new geometry (null when none is left). Whole triangles only: nothing is cut across. */
export function keepNear(source: T.BufferGeometry, mask: {has: (x: number, y: number, z: number) => boolean}): T.BufferGeometry | null {
  const pos = source.getAttribute('position').array as ArrayLike<number>, index = source.getIndex()!.array as ArrayLike<number>;
  const ok = new Map<number, boolean>(), inside = (v: number) => {let r = ok.get(v); if (r === undefined) {r = mask.has(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]); ok.set(v, r);} return r;};
  const kept: number[] = [];
  for (let t = 0; t < index.length; t += 3) if (inside(index[t]) && inside(index[t + 1]) && inside(index[t + 2])) kept.push(index[t], index[t + 1], index[t + 2]);
  if (!kept.length) return null;
  const remap = new Map<number, number>(), positions: number[] = [], faces = new Uint32Array(kept.length);
  kept.forEach((v, i) => {
    let m = remap.get(v);
    if (m === undefined) {m = remap.size; remap.set(v, m); positions.push(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]);}
    faces[i] = m;
  });
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.BufferAttribute(new Float32Array(positions), 3)); g.setIndex(new T.BufferAttribute(faces, 1));
  return g;
}
