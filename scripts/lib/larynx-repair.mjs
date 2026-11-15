// Repair of the thin laryngeal sheets and slips (membranes, ligaments, small muscles) of the base atlas.
// Why: these meshes come from a voxel-like segmentation, 0.2 to 1 mm thick. They carry loose shreds of 0.1 mm (a few triangles each) and a stair-stepped, crumpled surface
// (a fifth to a third of the neighbouring triangle pairs bend by more than 60 degrees), which draws as creased paper. Two steps, both on the same vertices and triangles otherwise:
//   1. loose shreds (a piece that is under 5 % of the main piece's triangles and under 1.5 mm across) are dropped;
//   2. Taubin smoothing (a shrinking step and an inflating step, so the volume stays) over the welded vertices, 20 passes; the surface moves by well under the sheet thickness.
// Normals are recomputed (area weighted) from the repaired surface. Used by scripts/prepare-model-stream.mjs (what the viewer loads) and scripts/lib/full-atlas.mjs (what the checks measure).
export const LARYNX_REPAIR = new Set(['FJ2771', 'FJ2774', 'FJ2791', 'FJ2777', 'FJ2794', 'FJ2787', 'FJ2805', 'FJ2789', 'FJ2749', 'FJ2763', 'FJ2764', 'FJ2780', 'FJ2798', 'FJ2784', 'FJ2785', 'FJ2802', 'FJ2803']);
/** The vocal ligaments lie on the vocalis muscle: smoothing them flattens them onto it and raises the registered count of coincident faces, so they only lose their shreds. */
export const repairPasses = id => (id === 'FJ2787' || id === 'FJ2805') ? 0 : 20;
const key = (x, y, z) => `${Math.round(x * 1e6)},${Math.round(y * 1e6)},${Math.round(z * 1e6)}`;
export function repairSheet(positions, indices, {passes = 20, lambda = .5, mu = -.53, shred = .05, shredSize = .0015, limit = .0015} = {}) {
  const nv = positions.length / 3, map = new Map(), w = new Uint32Array(nv), wpos = [];
  for (let i = 0; i < nv; i++) { const k = key(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]); let v = map.get(k); if (v === undefined) { v = wpos.length / 3; map.set(k, v); wpos.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]); } w[i] = v; }
  const m = wpos.length / 3, tris = [];
  for (let t = 0; t < indices.length; t += 3) { const a = w[indices[t]], b = w[indices[t + 1]], c = w[indices[t + 2]]; if (a !== b && b !== c && a !== c) tris.push(t / 3); }
  // pieces
  const par = new Int32Array(m).map((_, i) => i), f = x => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
  for (const t of tris) { const a = w[indices[t * 3]], b = w[indices[t * 3 + 1]], c = w[indices[t * 3 + 2]]; par[f(a)] = f(b); par[f(b)] = f(c); }
  const count = new Map(), lo = new Map(), hi = new Map();
  for (const t of tris) for (let k = 0; k < 3; k++) { const v = w[indices[t * 3 + k]], r = f(v); count.set(r, (count.get(r) || 0) + (k === 0 ? 1 : 0)); const l = lo.get(r) || [1e9, 1e9, 1e9], h = hi.get(r) || [-1e9, -1e9, -1e9]; for (let d = 0; d < 3; d++) { l[d] = Math.min(l[d], wpos[v * 3 + d]); h[d] = Math.max(h[d], wpos[v * 3 + d]); } lo.set(r, l); hi.set(r, h); }
  const main = Math.max(...count.values());
  const keep = new Set([...count.keys()].filter(r => count.get(r) >= main * shred || Math.hypot(hi.get(r)[0] - lo.get(r)[0], hi.get(r)[1] - lo.get(r)[1], hi.get(r)[2] - lo.get(r)[2]) >= shredSize));
  const kept = tris.filter(t => keep.has(f(w[indices[t * 3]])));
  // Taubin smoothing on the welded graph
  const nb = Array.from({length: m}, () => new Set());
  for (const t of kept) { const a = w[indices[t * 3]], b = w[indices[t * 3 + 1]], c = w[indices[t * 3 + 2]]; nb[a].add(b).add(c); nb[b].add(a).add(c); nb[c].add(a).add(b); }
  let p = Float64Array.from(wpos);
  for (let it = 0; it < passes * 2; it++) {
    const s = it % 2 ? mu : lambda, q = new Float64Array(p);
    for (let v = 0; v < m; v++) { const n = nb[v]; if (!n.size) continue; let x = 0, y = 0, z = 0; for (const u of n) { x += p[u * 3]; y += p[u * 3 + 1]; z += p[u * 3 + 2]; } x /= n.size; y /= n.size; z /= n.size; q[v * 3] = p[v * 3] + s * (x - p[v * 3]); q[v * 3 + 1] = p[v * 3 + 1] + s * (y - p[v * 3 + 1]); q[v * 3 + 2] = p[v * 3 + 2] + s * (z - p[v * 3 + 2]); }
    p = q;
  }
  // no vertex may end more than `limit` from where the source has it (attachments stay put): longer moves are cut back to the limit
  for (let v = 0; v < m; v++) { const d = Math.hypot(p[v * 3] - wpos[v * 3], p[v * 3 + 1] - wpos[v * 3 + 1], p[v * 3 + 2] - wpos[v * 3 + 2]); if (d > limit) for (let k = 0; k < 3; k++) p[v * 3 + k] = wpos[v * 3 + k] + (p[v * 3 + k] - wpos[v * 3 + k]) * limit / d; }
  let maxMove = 0; for (let v = 0; v < m; v++) if (nb[v].size) maxMove = Math.max(maxMove, Math.hypot(p[v * 3] - wpos[v * 3], p[v * 3 + 1] - wpos[v * 3 + 1], p[v * 3 + 2] - wpos[v * 3 + 2]));
  // compact: keep the vertices of the kept triangles (split vertices of the source stay split, they carry the same position)
  const used = new Map(), outPos = [], outIdx = [];
  for (const t of kept) for (let k = 0; k < 3; k++) { const i = indices[t * 3 + k]; let n = used.get(i); if (n === undefined) { n = outPos.length / 3; used.set(i, n); const v = w[i]; outPos.push(p[v * 3], p[v * 3 + 1], p[v * 3 + 2]); } outIdx.push(n); }
  const pos = Float32Array.from(outPos), idx = Uint32Array.from(outIdx);
  // area-weighted normals on the welded positions
  const acc = new Map(), nrm = new Float64Array(pos.length);
  const vk = i => key(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
  for (let t = 0; t < idx.length; t += 3) { const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3; const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2], vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2]; const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx]; for (const i of [idx[t], idx[t + 1], idx[t + 2]]) { const k = vk(i); const s = acc.get(k) || [0, 0, 0]; s[0] += n[0]; s[1] += n[1]; s[2] += n[2]; acc.set(k, s); } }
  const normals = new Int16Array(pos.length);
  for (let i = 0; i < pos.length / 3; i++) { const s = acc.get(vk(i)), l = Math.hypot(...s) || 1; for (let d = 0; d < 3; d++) normals[i * 3 + d] = Math.round(s[d] / l * 32767); }
  void nrm;
  return {positions: pos, normals, indices: idx, dropped: tris.length - kept.length, maxMove};
}
