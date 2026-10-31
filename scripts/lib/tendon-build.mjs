// Builds the muscle part and the tendon part of one cut (specs in scripts/tendon/*.mjs). Pure function of the source mesh and the spec, so prepare-model-stream (which writes the
// muscle part into the atlas stream) and prepare-paokao (which writes the tendon part) get the identical ring of vertices.
import {weld, bounds, planeOf, sliceArea, splitMesh, subdivide, smooth, normalsOf, volume} from './tendon-cut.mjs';
import {meshOf, closest} from './heart-geom.mjs';

const STEP = .0005;   // 0.5 mm sampling of the cross-section along y

/** Height of the cut: where the section falls below `tau` of the largest one, scanning from the largest section to the bony end. */
export function cutHeight(mesh, end, tau, above = -Infinity, below = Infinity) {
  const [lo, hi] = bounds(mesh.positions), ys = []; for (let y = lo[1] + STEP; y < hi[1] - STEP; y += STEP) if (y >= above && y <= below) ys.push(y);
  const areas = ys.map(y => sliceArea(mesh, planeOf([0, 1, 0], [0, y, 0])));
  let peak = 0; areas.forEach((a, i) => { if (a > areas[peak]) peak = i; });
  const limit = areas[peak] * tau, step = end === 'distal' ? -1 : 1;
  for (let i = peak; i >= 0 && i < ys.length; i += step) if (areas[i] < limit) return {y: ys[i], peakY: ys[peak], peakArea: areas[peak]};
  return null;
}

/** Normals with creases: faces within `angle` degrees of each other around a vertex share a normal, so a low-poly muscle keeps its facets like the source. */
export function creaseMesh(positions, indices, angle = 40) {
  const nF = indices.length / 3, fn = new Float64Array(nF * 3);
  for (let f = 0; f < nF; f++) {
    const a = indices[f * 3], b = indices[f * 3 + 1], c = indices[f * 3 + 2];
    const ux = positions[b * 3] - positions[a * 3], uy = positions[b * 3 + 1] - positions[a * 3 + 1], uz = positions[b * 3 + 2] - positions[a * 3 + 2], vx = positions[c * 3] - positions[a * 3], vy = positions[c * 3 + 1] - positions[a * 3 + 1], vz = positions[c * 3 + 2] - positions[a * 3 + 2];
    const x = uy * vz - uz * vy, y = uz * vx - ux * vz, z = ux * vy - uy * vx, l = Math.hypot(x, y, z) || 1; fn[f * 3] = x / l; fn[f * 3 + 1] = y / l; fn[f * 3 + 2] = z / l;
  }
  const cosLimit = Math.cos(angle * Math.PI / 180), byVertex = Array.from({length: positions.length / 3}, () => []);
  for (let f = 0; f < nF; f++) for (let k = 0; k < 3; k++) byVertex[indices[f * 3 + k]].push(f);
  const P = [], N = [], I = new Uint32Array(indices.length);
  byVertex.forEach((faces, v) => {
    const groups = [];
    for (const f of faces) {
      let g = groups.find(g => g.n[0] * fn[f * 3] + g.n[1] * fn[f * 3 + 1] + g.n[2] * fn[f * 3 + 2] >= cosLimit);
      if (!g) { g = {n: [fn[f * 3], fn[f * 3 + 1], fn[f * 3 + 2]], sum: [0, 0, 0], faces: []}; groups.push(g); }
      g.sum[0] += fn[f * 3]; g.sum[1] += fn[f * 3 + 1]; g.sum[2] += fn[f * 3 + 2]; g.faces.push(f);
    }
    for (const g of groups) {
      const idx = P.length / 3, l = Math.hypot(...g.sum) || 1;
      P.push(positions[v * 3], positions[v * 3 + 1], positions[v * 3 + 2]); N.push(Math.round(g.sum[0] / l * 32767), Math.round(g.sum[1] / l * 32767), Math.round(g.sum[2] / l * 32767));
      for (const f of g.faces) for (let k = 0; k < 3; k++) if (indices[f * 3 + k] === v) I[f * 3 + k] = idx;
    }
  });
  return {positions: Float32Array.from(P), normals: Int16Array.from(N), indices: I};
}

/**
 * Cuts one muscle mesh. `positions`/`indices` are the raw atlas arrays. Returns null when the muscle has no usable tendon end, else
 * {y, belly: {positions, normals, indices} (Float32/Int16/Uint32, creased like the source), tendon: {positions, indices} (Float32, refined and smoothed, ring fixed), ring}.
 */
/** Number of directed edges without exactly one opposite edge (0 for a closed, consistently oriented surface). */
export function openEdges(m) {
  const ed = new Map();
  for (let i = 0; i < m.indices.length; i += 3) for (let k = 0; k < 3; k++) { const a = m.indices[i + k], b = m.indices[i + (k + 1) % 3], key = a * 4294967296 + b; ed.set(key, (ed.get(key) || 0) + 1); }
  let bad = 0; for (const [key, c] of ed) { const a = Math.floor(key / 4294967296), b = key % 4294967296; if (c !== 1 || ed.get(b * 4294967296 + a) !== 1) bad++; }
  return bad;
}
export function cutMuscle(positions, indices, {end, tau, y: forced, above, below}, {subdivisions, smoothing = 24} = {}) {
  const mesh = weld(positions, indices), h = forced != null ? {y: forced, peakY: forced} : cutHeight(mesh, end, tau, above, below);
  if (!h) return null;
  // The source meshes have a few non-manifold edges: a cut through one gives open pieces, so the plane is moved by half-millimetre steps (up to 2 cm) until both pieces are closed.
  let plane, pos, neg; const open0 = openEdges(mesh);
  for (const dy of [0, ...Array.from({length: 40}, (_, k) => [(k + 1) * .0005, -(k + 1) * .0005]).flat()]) {
    const y = h.y + dy; plane = end === 'distal' ? planeOf([0, -1, 0], [0, y, 0]) : planeOf([0, 1, 0], [0, y, 0]);
    ({pos, neg} = splitMesh(mesh, plane));            // pos = the tendon side (below the cut for 'distal')
    if (pos.indices.length && neg.indices.length && openEdges(pos) <= open0 && openEdges(neg) <= open0 && volume(pos.positions, pos.indices) > 0 && volume(neg.positions, neg.indices) > 0) { h.y = y; break; }
    pos = null;
  }
  if (!pos) return null;
  // float32 first, so that the ring is bit-identical in both parts
  const f32 = m => ({positions: Float32Array.from(m.positions), indices: m.indices});
  const bellyMesh = f32(neg), tendonMesh = f32(pos);
  let t = {positions: Float64Array.from(tendonMesh.positions), indices: tendonMesh.indices};
  // a tendon of a few hundred triangles (a single cord) is refined twice, a many-stranded one (the finger tendons, the palmar fan) once
  for (let s = 0; s < (subdivisions ?? (t.indices.length / 3 * 16 <= 9000 ? 2 : 1)); s++) t = subdivide(t);
  const pinned = []; for (let v = 0; v < t.positions.length / 3; v++) { const d = plane.n[0] * t.positions[v * 3] + plane.n[1] * t.positions[v * 3 + 1] + plane.n[2] * t.positions[v * 3 + 2] - plane.c; if (Math.abs(d) < 1e-6) pinned.push(v); }
  t = smooth(t, pinned, smoothing);
  // the pinned vertices must stay exactly where the cut put them (float32 value of the ring)
  const tp = Float32Array.from(t.positions);
  const belly = creaseMesh(bellyMesh.positions, bellyMesh.indices);
  return {y: h.y, peakY: h.peakY, plane, belly, tendon: {positions: tp, indices: t.indices}};
}

export const mirrorName = n => n.replace(/\bRight\b/g, 'Left').replace(/\bright\b/g, 'left');
export {weld, bounds, normalsOf};

/**
 * Moves the bony end of a tendon onto its bone: the source mesh of some tendons stops a few millimetres short. The vertices within `len` metres of the end (the lowest point for a
 * distal tendon) are moved by the vector from the centre of the end to the nearest point of the bone (plus `embed`), fading to nothing at `len`, so the far end (the cut ring) stays put.
 * Returns the number of millimetres the end moved (0 when it was already on the bone or the gap is larger than `maxGap`).
 */
export function reachBone(tendon, bonePositions, boneIndices, {len = .03, embed = .0004, maxGap = .02, end = 'distal'} = {}) {
  const P = tendon.positions, n = P.length / 3, sign = end === 'distal' ? 1 : -1;
  let yEnd = Infinity; for (let v = 0; v < n; v++) yEnd = Math.min(yEnd, sign * P[v * 3 + 1]);
  const tip = []; for (let v = 0; v < n; v++) if (sign * P[v * 3 + 1] < yEnd + .004) tip.push(v);
  const c = [0, 0, 0]; for (const v of tip) for (let k = 0; k < 3; k++) c[k] += P[v * 3 + k] / tip.length;
  const hit = closest(meshOf(bonePositions, boneIndices), c);
  if (hit.d > maxGap || hit.d < embed) return 0;
  const d = [hit.point[0] - c[0], hit.point[1] - c[1], hit.point[2] - c[2]], l = Math.hypot(...d) || 1, move = d.map(x => x + x / l * embed);
  for (let v = 0; v < n; v++) {
    const t = Math.max(0, Math.min(1, 1 - (sign * P[v * 3 + 1] - yEnd) / len)), w = t * t * (3 - 2 * t);
    for (let k = 0; k < 3; k++) P[v * 3 + k] += move[k] * w;
  }
  return hit.d * 1000;
}

/**
 * Lifts a tendon (a closed mesh) out of the bones it was modelled through, keeping its thickness: every vertex that lies behind the surface of a bone (or closer than `clearance`) asks to be moved out
 * along the bone's normal by the depth it is missing; the largest request among the vertices within `reach` metres is applied to all of them (so a cord moves as one piece instead of being flattened onto the
 * surface), the field is smoothed over the mesh edges, and it fades in from nothing at `ringY` (the cut ring stays where the muscle part has it) over `fade` metres. `bones` are heart-geom meshes.
 * Returns the deepest request in millimetres.
 */
export function clearBones(tendon, bones, {ringY, end = 'distal', fade = .012, clearance = .0004, reach = .006, passes = 6, hold = null} = {}) {
  const P = tendon.positions, n = P.length / 3, need = new Float64Array(n), dir = new Float64Array(n * 3);
  for (let v = 0; v < n; v++) {
    const q = [P[v * 3], P[v * 3 + 1], P[v * 3 + 2]]; let best = null;
    for (const b of bones) { if (q[0] < b.lo[0] - .01 || q[0] > b.hi[0] + .01 || q[1] < b.lo[1] - .01 || q[1] > b.hi[1] + .01 || q[2] < b.lo[2] - .01 || q[2] > b.hi[2] + .01) continue; const c = closest(b, q); if (!best || c.d < best.d) best = c; }
    if (!best) continue;
    const signed = (q[0] - best.point[0]) * best.normal[0] + (q[1] - best.point[1]) * best.normal[1] + (q[2] - best.point[2]) * best.normal[2];
    const m = signed < 0 ? best.d + clearance : clearance - best.d;     // how far out along the normal this vertex has to go
    if (m > 0) { need[v] = m; dir.set(best.normal, v * 3); }
  }
  // the largest request in the neighbourhood, with the direction of the vertex that made it
  const cell = reach, key = (x, y, z) => `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`, grid = new Map();
  for (let v = 0; v < n; v++) if (need[v] > 0) { const k = key(P[v * 3], P[v * 3 + 1], P[v * 3 + 2]); (grid.get(k) ?? grid.set(k, []).get(k)).push(v); }
  const field = new Float64Array(n * 3); let deepest = 0;
  for (let v = 0; v < n; v++) {
    const cx = Math.floor(P[v * 3] / cell), cy = Math.floor(P[v * 3 + 1] / cell), cz = Math.floor(P[v * 3 + 2] / cell); let m = 0, from = -1;
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) for (const u of grid.get(`${cx + a},${cy + b},${cz + c}`) ?? []) {
      if (need[u] <= m) continue; if (Math.hypot(P[u * 3] - P[v * 3], P[u * 3 + 1] - P[v * 3 + 1], P[u * 3 + 2] - P[v * 3 + 2]) > reach) continue; m = need[u]; from = u;
    }
    if (from >= 0) { for (let k = 0; k < 3; k++) field[v * 3 + k] = dir[from * 3 + k] * m; deepest = Math.max(deepest, m); }
  }
  if (!deepest) return 0;
  const nb = Array.from({length: n}, () => new Set());
  for (let i = 0; i < tendon.indices.length; i += 3) for (let k = 0; k < 3; k++) { const a = tendon.indices[i + k], b = tendon.indices[i + (k + 1) % 3]; nb[a].add(b); nb[b].add(a); }
  for (let it = 0; it < passes; it++) { const next = Float64Array.from(field); for (let v = 0; v < n; v++) { if (!nb[v].size) continue; for (let k = 0; k < 3; k++) { let s = 0; for (const u of nb[v]) s += field[u * 3 + k]; next[v * 3 + k] = field[v * 3 + k] * .5 + s / nb[v].size * .5; } } field.set(next); }
  const sign = end === 'distal' ? 1 : -1;
  for (let v = 0; v < n; v++) {
    const t = Math.max(0, Math.min(1, sign * (ringY - P[v * 3 + 1]) / fade)), w = t * t * (3 - 2 * t);
    for (let k = 0; k < 3; k++) P[v * 3 + k] += field[v * 3 + k] * w;
  }
  return deepest * 1000;
}

