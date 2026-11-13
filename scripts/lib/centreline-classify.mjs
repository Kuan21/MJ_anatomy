// Classifies a centreline (array of {c:[x,y,z], r}) for scripts/report-centerlines.mjs. Returns null when it looks fine, otherwise a short reason.
export const JUMP_MAX = .02, LENGTH_MIN = .004, SPARSE_SLACK = .008;
/** Largest distance between two consecutive rings: {d, i} (i is the index of the first ring of the pair), and the total length. */
export function longestStep(rings) {
  let d = 0, at = -1, length = 0;
  for (let i = 1; i < rings.length; i++) { const s = Math.hypot(...rings[i].c.map((v, k) => v - rings[i - 1].c[k])); length += s; if (s > d) { d = s; at = i - 1; } }
  return {d, i: at, length};
}
/**
 * A large step between rings is only a break when the surface chain itself does not explain it. `steps` (optional, from centrelineOf's info) is the distance along the surface
 * between each ring and the next: on a coarse mesh (long triangles, no vertices in between) the rings are far apart although the tube is whole.
 * Returns the step in metres when the largest step is explained that way, otherwise 0.
 */
export function sparseStep(rings, steps) {
  const {d, i} = longestStep(rings);
  return steps && d > JUMP_MAX && d <= steps[i] + SPARSE_SLACK ? d : 0;
}
export function classifyRings(rings, steps = null) {
  if (rings.length < 2) return 'fewer than 2 rings';
  const {d: max, length: len} = longestStep(rings);
  if (max > JUMP_MAX && !sparseStep(rings, steps)) return 'jump of ' + (max * 1000).toFixed(0) + ' mm between rings';
  if (len < LENGTH_MIN) return 'length only ' + (len * 1000).toFixed(1) + ' mm';
  return null;
}
/** Number of separate pieces of a mesh {positions, indices} (vertices welded at 0.01 mm). The centreline follows one piece only, so the others are not measured. */
export function pieceCount(g) {
  const key = new Map(), remap = new Uint32Array(g.positions.length / 3), parent = [];
  for (let i = 0; i < remap.length; i++) {
    const k = `${Math.round(g.positions[i * 3] * 1e5)},${Math.round(g.positions[i * 3 + 1] * 1e5)},${Math.round(g.positions[i * 3 + 2] * 1e5)}`;
    let v = key.get(k); if (v === undefined) { v = parent.length; key.set(k, v); parent.push(v); } remap[i] = v;
  }
  const root = v => { while (parent[v] !== v) v = parent[v] = parent[parent[v]]; return v; };
  for (let i = 0; i < g.indices.length; i += 3) { const a = root(remap[g.indices[i]]); for (const j of [1, 2]) { const b = root(remap[g.indices[i + j]]); if (a !== b) parent[b] = a; } }
  const used = new Set(); for (let i = 0; i < g.indices.length; i++) used.add(root(remap[g.indices[i]]));
  return used.size;
}
