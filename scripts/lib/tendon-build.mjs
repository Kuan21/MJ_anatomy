// Builds the muscle part and the tendon part of one cut (specs in scripts/tendon/*.mjs). Pure function of the source mesh and the spec, so prepare-model-stream (which writes the
// muscle part into the atlas stream) and prepare-paokao (which writes the tendon part) get the identical ring of vertices.
import {weld, bounds, planeOf, sliceArea, splitMesh, subdivide, smooth, normalsOf, volume} from './tendon-cut.mjs';

const STEP = .0005;   // 0.5 mm sampling of the cross-section along y

/** Height of the cut: where the section falls below `tau` of the largest one, scanning from the largest section to the bony end. */
export function cutHeight(mesh, end, tau) {
  const [lo, hi] = bounds(mesh.positions), ys = []; for (let y = lo[1] + STEP; y < hi[1] - STEP; y += STEP) ys.push(y);
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
export function cutMuscle(positions, indices, {end, tau, y: forced}, {subdivisions, smoothing = 24} = {}) {
  const mesh = weld(positions, indices), h = forced != null ? {y: forced, peakY: forced} : cutHeight(mesh, end, tau);
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
