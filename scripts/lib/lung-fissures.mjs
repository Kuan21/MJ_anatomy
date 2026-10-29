// The BodyParts3D lung lobes touch each other flush along the fissures, so a solid lung shows no seam. Where a lobe lies within `REACH` of a neighbouring lobe of the same lung
// (right: upper/middle/lower, left: upper/lower) its surface is moved inward along the vertex normal by up to `DEPTH` (smooth fall-off), so each fissure opens as a clear V-shaped
// slit 2-3 mm wide between two lobes: the horizontal fissure (right upper/middle) and the oblique fissures (right middle/lower and upper/lower, left upper/lower).
export const LUNG_LOBES = {right: ['FMA7333', 'FMA7383', 'FMA7337'], left: ['FMA7370', 'FMA7371']};
export const REACH = .005, DEPTH = .0018, CELL = .005, SMOOTHING = 3;
const smooth = t => t * t * (3 - 2 * t);
function vertexNormals(pos, idx) {
  const n = new Float64Array(pos.length);
  for (let t = 0; t < idx.length; t += 3) {
    const [a, c, d] = [idx[t], idx[t + 1], idx[t + 2]], u = [0, 1, 2].map(k => pos[c * 3 + k] - pos[a * 3 + k]), v = [0, 1, 2].map(k => pos[d * 3 + k] - pos[a * 3 + k]);
    const f = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    for (const q of [a, c, d]) for (let k = 0; k < 3; k++) n[q * 3 + k] += f[k];
  }
  for (let i = 0; i < n.length; i += 3) {const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1; n[i] /= l; n[i + 1] /= l; n[i + 2] /= l;}
  return n;
}
const hashOf = pos => {const h = new Map(); for (let i = 0; i < pos.length; i += 3) {const k = [Math.floor(pos[i] / CELL), Math.floor(pos[i + 1] / CELL), Math.floor(pos[i + 2] / CELL)].join(); (h.get(k) ?? h.set(k, []).get(k)).push(i);} return h;};
function nearest(h, pos, x, y, z) {
  let best = Infinity; const c = [Math.floor(x / CELL), Math.floor(y / CELL), Math.floor(z / CELL)];
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let d = -1; d <= 1; d++) {const l = h.get([c[0] + a, c[1] + b, c[2] + d].join()); if (!l) continue; for (const i of l) best = Math.min(best, Math.hypot(pos[i] - x, pos[i + 1] - y, pos[i + 2] - z));}
  return best;
}
/** `lobes`: [{positions: Float32Array, indices}] of one lung. Moves the positions in place; returns how many vertices of each lobe were moved. */
export function carveFissures(lobes) {
  const hashes = lobes.map(l => hashOf(l.positions)), normals = lobes.map(l => vertexNormals(l.positions, l.indices)), source = lobes.map(l => Float32Array.from(l.positions));
  return lobes.map((lobe, a) => {
    const n = source[a].length / 3, depth = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      let d = Infinity; lobes.forEach((other, b) => {if (b !== a) d = Math.min(d, nearest(hashes[b], source[b], source[a][i * 3], source[a][i * 3 + 1], source[a][i * 3 + 2]));});
      if (d < REACH) depth[i] = DEPTH * (1 - smooth(d / REACH));
    }
    // average the depth over each vertex's neighbours a few times, so the slit edge is a smooth curve and not a row of spikes
    const neighbours = Array.from({length: n}, () => new Set());
    for (let t = 0; t < lobe.indices.length; t += 3) for (let k = 0; k < 3; k++) {neighbours[lobe.indices[t + k]].add(lobe.indices[t + (k + 1) % 3]); neighbours[lobe.indices[t + k]].add(lobe.indices[t + (k + 2) % 3]);}
    let field = depth;
    for (let pass = 0; pass < SMOOTHING; pass++) {
      const next = new Float32Array(n);
      for (let i = 0; i < n; i++) {let sum = field[i], count = 1; for (const j of neighbours[i]) {sum += field[j]; count++;} next[i] = sum / count;}
      field = next;
    }
    let carved = 0;
    for (let i = 0; i < n; i++) {
      if (field[i] < 1e-5) continue; carved++;
      for (let k = 0; k < 3; k++) lobe.positions[i * 3 + k] = source[a][i * 3 + k] - normals[a][i * 3 + k] * field[i];
    }
    return carved;
  });
}
