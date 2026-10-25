/**
 * Solid cut surfaces for the brain detail mode.
 *
 * The Brain Project pieces are surfaces (many are open shells), so a cut cannot be capped piece by piece. Instead the surfaces are rasterised
 * into a voxel grid once, the space outside the brain is flood-filled from the corner, and everything that is not outside is tissue. Each tissue
 * voxel then belongs to the nearest surface piece; cortex voxels within `GREY_STEPS` voxels of a cortical or cerebellar surface are grey matter
 * and the rest is white matter (a schematic thickness, not a measurement). Deep structures (tracts, nuclei, thalamus, ventricles) are filled the same way
 * and written over the tissue. A section is then a lookup of this grid on the cutting plane.
 */
export interface VoxelInput {index: number; group: string; /** -1 left, 1 right of the midline (centroid x), used to keep the two hemispheres apart */ hemisphere: -1 | 1; positions: ArrayLike<number>; indices: ArrayLike<number> | null}
export interface VoxelGrid {nx: number; ny: number; nz: number; origin: [number, number, number]; size: number; label: Uint8Array; part: Uint16Array}

/** Tissue classes written to the grid. */
export const LABEL = {empty: 0, cortexGrey: 1, cortexWhite: 2, cerebellumGrey: 3, cerebellumWhite: 4, brainstem: 5, basal: 6, diencephalon: 7, tract: 8, csf: 9} as const;
export const GREY_STEPS = 2;
const CORTEX = new Set(['frontal', 'parietal', 'temporal', 'occipital', 'limbic', 'insula', 'cortex-other']);
const BODY = new Set([...CORTEX, 'cerebellum', 'brainstem']);
const INTERNAL: [string, number][] = [['white', LABEL.tract], ['basal', LABEL.basal], ['diencephalon', LABEL.diencephalon], ['ventricles', LABEL.csf]];

interface Box {nx: number; ny: number; nz: number; ox: number; oy: number; oz: number}

/** Calls `mark(x, y, z)` for every voxel (in `box` coordinates) that the surface passes through; samples are dense enough that the marked set has no 6-connected gaps. */
function rasterise(input: VoxelInput, origin: [number, number, number], size: number, mark: (x: number, y: number, z: number) => void) {
  const p = input.positions, idx = input.indices, count = idx ? idx.length : p.length / 9 * 3;
  const inv = 1 / size, [ox, oy, oz] = origin;
  const a = [0, 0, 0], b = [0, 0, 0], c = [0, 0, 0];
  const load = (v: number, out: number[]) => {out[0] = (p[v * 3] - ox) * inv; out[1] = (p[v * 3 + 1] - oy) * inv; out[2] = (p[v * 3 + 2] - oz) * inv;};
  for (let t = 0; t < count; t += 3) {
    load(idx ? idx[t] : t, a); load(idx ? idx[t + 1] : t + 1, b); load(idx ? idx[t + 2] : t + 2, c);
    const l = Math.max(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), Math.hypot(c[0] - b[0], c[1] - b[1], c[2] - b[2]), Math.hypot(a[0] - c[0], a[1] - c[1], a[2] - c[2]));
    const n = Math.min(60, Math.max(1, Math.ceil(l / .4)));
    for (let i = 0; i <= n; i++) for (let j = 0; j <= n - i; j++) {
      const u = i / n, v = j / n, w = 1 - u - v;
      mark(Math.floor(a[0] * w + b[0] * u + c[0] * v), Math.floor(a[1] * w + b[1] * u + c[1] * v), Math.floor(a[2] * w + b[2] * u + c[2] * v));
    }
  }
}

/** True for voxels reachable from the box border without crossing a surface voxel (6-connected). */
function outsideOf(surf: Uint8Array, nx: number, ny: number, nz: number): Uint8Array {
  const out = new Uint8Array(surf.length), stack = new Int32Array(surf.length);
  let top = 0;
  const push = (i: number) => {if (!surf[i] && !out[i]) {out[i] = 1; stack[top++] = i;}};
  for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) if (x === 0 || y === 0 || z === 0 || x === nx - 1 || y === ny - 1 || z === nz - 1) push(x + nx * (y + ny * z));
  const sy = nx, sz = nx * ny;
  while (top) {
    const i = stack[--top], x = i % nx, y = Math.floor(i / nx) % ny, z = Math.floor(i / sz);
    if (x > 0) push(i - 1); if (x < nx - 1) push(i + 1);
    if (y > 0) push(i - sy); if (y < ny - 1) push(i + sy);
    if (z > 0) push(i - sz); if (z < nz - 1) push(i + sz);
  }
  return out;
}

export function voxelize(inputs: VoxelInput[], size = .0012): VoxelGrid {
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (const m of inputs) if (BODY.has(m.group)) for (let i = 0; i < m.positions.length; i += 3) for (let k = 0; k < 3; k++) {lo[k] = Math.min(lo[k], m.positions[i + k]); hi[k] = Math.max(hi[k], m.positions[i + k]);}
  const origin: [number, number, number] = [lo[0] - size * 3, lo[1] - size * 3, lo[2] - size * 3];
  const nx = Math.ceil((hi[0] - lo[0]) / size) + 7, ny = Math.ceil((hi[1] - lo[1]) / size) + 7, nz = Math.ceil((hi[2] - lo[2]) / size) + 7;
  const total = nx * ny * nz, at = (x: number, y: number, z: number) => x + nx * (y + ny * z), inside = (x: number, y: number, z: number) => x >= 0 && y >= 0 && z >= 0 && x < nx && y < ny && z < nz;

  // 1. surfaces of the cerebrum, cerebellum and brainstem
  const surf = new Uint8Array(total), owner = new Uint16Array(total), groupOf = new Map<number, string>();
  for (const m of inputs) {
    if (!BODY.has(m.group)) continue;
    groupOf.set(m.index + 1, m.group);
    rasterise(m, origin, size, (x, y, z) => {if (inside(x, y, z)) {const i = at(x, y, z); surf[i] = 1; owner[i] = m.index + 1;}});
  }
  // 2. tissue. The pieces are open shells with gaps, so flooding the outside leaks into the brain. Instead each organ (a hemisphere, the cerebellum, the brainstem) is
  //    filled where it is spanned by its own surface along all three axes (a "visual hull"): sulci are bridged, which is acceptable for a schematic cut.
  const keyOf = (group: string, hemisphere: number) => group === 'cerebellum' ? 'cb' : group === 'brainstem' ? 'bs' : `h${hemisphere}`;
  const sets = new Map<string, Uint8Array>();
  const deepGroups = new Set(INTERNAL.map(([g]) => g));
  for (const m of inputs) {
    // the deep structures (corpus callosum, thalamus, third ventricle …) cross the midline and bridge the two hemispheres
    if (!BODY.has(m.group) && !deepGroups.has(m.group)) continue;
    const key = deepGroups.has(m.group) ? 'deep' : keyOf(m.group, m.hemisphere);
    let mask = sets.get(key); if (!mask) {mask = new Uint8Array(total); sets.set(key, mask);}
    rasterise(m, origin, size, (x, y, z) => {if (inside(x, y, z)) mask![at(x, y, z)] = 1;});
  }
  const hull = new Uint8Array(total);
  for (const mask of sets.values()) {
    const span = new Uint8Array(total);
    const mark = (from: number, step: number, count: number) => {
      let first = -1, last = -1;
      for (let k = 0, i = from; k < count; k++, i += step) if (mask[i]) {if (first < 0) first = k; last = k;}
      if (first >= 0) for (let k = first, i = from + first * step; k <= last; k++, i += step) span[i]++;
    };
    for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) mark(at(0, y, z), 1, nx);
    for (let z = 0; z < nz; z++) for (let x = 0; x < nx; x++) mark(at(x, 0, z), nx, ny);
    for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) mark(at(x, y, 0), nx * ny, nz);
    for (let i = 0; i < total; i++) if (span[i] >= 2 || mask[i]) hull[i] = 1;
  }
  const outside = new Uint8Array(total), label = new Uint8Array(total), part = new Uint16Array(total);
  for (let i = 0; i < total; i++) outside[i] = hull[i] ? 0 : 1;
  // 3. nearest surface piece and distance, spread through the tissue (6-connected, multi-source)
  const dist = new Uint8Array(total).fill(255), queue = new Int32Array(total);
  let head = 0, tail = 0;
  for (let i = 0; i < total; i++) if (surf[i]) {dist[i] = 0; part[i] = owner[i]; queue[tail++] = i;}
  const sy = nx, sz = nx * ny;
  const visit = (from: number, to: number) => {if (!outside[to] && dist[to] === 255) {dist[to] = Math.min(254, dist[from] + 1); part[to] = part[from]; queue[tail++] = to;}};
  while (head < tail) {
    const i = queue[head++], x = i % nx, y = Math.floor(i / nx) % ny, z = Math.floor(i / sz);
    if (x > 0) visit(i, i - 1); if (x < nx - 1) visit(i, i + 1);
    if (y > 0) visit(i, i - sy); if (y < ny - 1) visit(i, i + sy);
    if (z > 0) visit(i, i - sz); if (z < nz - 1) visit(i, i + sz);
  }
  for (let i = 0; i < total; i++) {
    if (outside[i]) {part[i] = 0; continue;}
    const g = groupOf.get(part[i]) ?? 'brainstem';
    label[i] = g === 'brainstem' ? LABEL.brainstem : g === 'cerebellum' ? (dist[i] <= GREY_STEPS ? LABEL.cerebellumGrey : LABEL.cerebellumWhite) : (dist[i] <= GREY_STEPS ? LABEL.cortexGrey : LABEL.cortexWhite);
  }
  // 4. deep structures written over the tissue, outermost class first
  for (const [group, value] of INTERNAL) for (const m of inputs) {
    if (m.group !== group) continue;
    const mlo = [Infinity, Infinity, Infinity], mhi = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < m.positions.length; i += 3) for (let k = 0; k < 3; k++) {mlo[k] = Math.min(mlo[k], m.positions[i + k]); mhi[k] = Math.max(mhi[k], m.positions[i + k]);}
    const box: Box = {ox: Math.floor((mlo[0] - origin[0]) / size) - 1, oy: Math.floor((mlo[1] - origin[1]) / size) - 1, oz: Math.floor((mlo[2] - origin[2]) / size) - 1, nx: 0, ny: 0, nz: 0};
    box.nx = Math.ceil((mhi[0] - mlo[0]) / size) + 4; box.ny = Math.ceil((mhi[1] - mlo[1]) / size) + 4; box.nz = Math.ceil((mhi[2] - mlo[2]) / size) + 4;
    const local = new Uint8Array(box.nx * box.ny * box.nz);
    rasterise(m, origin, size, (x, y, z) => {const lx = x - box.ox, ly = y - box.oy, lz = z - box.oz; if (lx >= 0 && ly >= 0 && lz >= 0 && lx < box.nx && ly < box.ny && lz < box.nz) local[lx + box.nx * (ly + box.ny * lz)] = 1;});
    const out = outsideOf(local, box.nx, box.ny, box.nz);
    for (let lz = 0; lz < box.nz; lz++) for (let ly = 0; ly < box.ny; ly++) for (let lx = 0; lx < box.nx; lx++) {
      if (out[lx + box.nx * (ly + box.ny * lz)]) continue;
      const x = lx + box.ox, y = ly + box.oy, z = lz + box.oz;
      if (!inside(x, y, z)) continue;
      const i = at(x, y, z);
      if (outside[i]) continue;
      label[i] = value; part[i] = m.index + 1;
    }
  }
  return {nx, ny, nz, origin, size, label, part};
}
