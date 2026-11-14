// Centrelines for the continuity check of docs/centerline-plan.md: one centreline per separate piece of a mesh, with a ring radius that is also right for wide vessels.
// Measuring only; nothing here changes a model. centrelineOf (leg-centreline.mjs) keeps its behaviour for the leg vessel build.
import {centrelineOf} from './leg-centreline.mjs';

const REACH = [.008, .016, .032, .064, .128];
const median = a => a.slice().sort((x, y) => x - y)[a.length >> 1];

/** Separate pieces of a mesh {positions, indices} (vertices welded at 0.01 mm, like tubeTips), largest first; each piece is a mesh of its own. */
export function splitPieces(g) {
  const key = new Map(), remap = new Uint32Array(g.positions.length / 3), parent = [];
  for (let i = 0; i < remap.length; i++) {
    const k = `${Math.round(g.positions[i * 3] * 1e5)},${Math.round(g.positions[i * 3 + 1] * 1e5)},${Math.round(g.positions[i * 3 + 2] * 1e5)}`;
    let v = key.get(k); if (v === undefined) { v = parent.length; key.set(k, v); parent.push(v); } remap[i] = v;
  }
  const root = v => { while (parent[v] !== v) v = parent[v] = parent[parent[v]]; return v; };
  for (let i = 0; i < g.indices.length; i += 3) { const a = root(remap[g.indices[i]]); for (const j of [1, 2]) { const b = root(remap[g.indices[i + j]]); if (a !== b) parent[b] = a; } }
  const groups = new Map();
  for (let i = 0; i < g.indices.length; i += 3) { const r = root(remap[g.indices[i]]); (groups.get(r) ?? groups.set(r, []).get(r)).push(i); }
  return [...groups.values()].sort((a, b) => b.length - a.length).map(tris => {
    const local = new Map(), positions = [], indices = [];
    for (const t of tris) for (let j = 0; j < 3; j++) {
      const v = g.indices[t + j]; let l = local.get(v);
      if (l === undefined) { l = positions.length / 3; local.set(v, l); positions.push(g.positions[v * 3], g.positions[v * 3 + 1], g.positions[v * 3 + 2]); }
      indices.push(l);
    }
    return {positions: Float32Array.from(positions), indices: Uint32Array.from(indices)};
  });
}

/**
 * Centreline of one tube with the whole wall in every ring. centrelineOf collects the vertices within `reach` (8 mm along the surface) of a chain that runs along one side
 * of the tube, so on a tube wider than about 2.5 mm radius a ring holds only a strip of the wall: its centre sits near that side and its radius comes out near 3–4 mm
 * whatever the real size. Here the reach is doubled until the measured radius stops growing (less than 2 %), which means the rings already hold the whole wall.
 * (The reach is measured along mesh edges, which zigzag, so it cannot be derived from the radius directly.)
 * Limits: where a branch leaves the tube, the branch's vertices near the chain are counted too and that ring comes out too wide (corrected afterwards by robustRings);
 * a stubby tube (shorter than about 8 times its radius) is still measured too thin, because the chain crosses it diagonally and the rings are tilted bands.
 * `info` receives {steps, reach}.
 */
export function centrelineWide(g, bin = .003, info = null) {
  let rings = [], own = {}, last = 0;
  for (const reach of REACH) {
    own = {}; rings = centrelineOf(g, bin, own, reach); own.reach = reach;
    const r = rings.length ? median(rings.map(q => q.r)) : 0;
    if (!rings.length || last && r <= last * 1.02) break;
    last = r;
  }
  if (info) Object.assign(info, own);
  return rings;
}

/**
 * One centreline per piece of the mesh: [{rings, steps, reach, triangles, disturbed}] (rings corrected by robustRings; `disturbed` is how many were) for the pieces that give a line of at least 2 rings, largest piece first;
 * `skipped` (optional array) receives {triangles, why} for the pieces that do not (too small or not a tube).
 */
export function centrelinesOf(g, bin = .003, skipped = null) {
  const out = [];
  for (const piece of splitPieces(g)) {
    const triangles = piece.indices.length / 3, info = {};
    let rings = [], why = null;
    try { rings = centrelineWide(piece, bin, info); } catch (err) { why = 'no tube shape'; }
    if (!why && rings.length < 2) why = 'fewer than 2 rings';
    if (why) skipped?.push({triangles, why}); else { const fix = {}; out.push({rings: robustRings(rings, 4, .3, fix), steps: info.steps, reach: info.reach, triangles, disturbed: fix.disturbed.length}); }
  }
  return out;
}

/**
 * Rings that a side branch does not disturb. Where a branch leaves the tube, its vertices near the chain fall into the same few rings: their radius comes out too wide
 * and their centre is pulled into the branch. Each radius is replaced by the median over `span` rings on either side; a ring whose own radius differs from that by more
 * than `tol` (30 %) is taken as disturbed and its centre is put on the straight line between the nearest undisturbed rings before and after it (kept when there is none on one side).
 * Undisturbed rings keep their centre, so a real bend stays. Limit: a branch that disturbs more than `span` rings in a row (about 12 mm of the tube) is not removed;
 * next to a wide branch on a wide tube (radius 8 mm and more in the synthetic tests) a ring can keep a radius within the tolerance while its centre is still pulled
 * towards the branch by up to about one radius, and that ring is not corrected.
 * Returns new rings; `info` (optional) receives {disturbed}: the indices that were corrected.
 */
export function robustRings(rings, span = 4, tol = .3, info = null) {
  const r = rings.map((_, i) => median(rings.slice(Math.max(0, i - span), i + span + 1).map(q => q.r)));
  const bad = rings.map((q, i) => Math.abs(q.r - r[i]) > r[i] * tol), good = i => i >= 0 && i < rings.length && !bad[i];
  if (info) info.disturbed = bad.flatMap((b, i) => b ? [i] : []);
  return rings.map((q, i) => {
    if (!bad[i]) return {c: q.c, r: r[i]};
    let a = i, b = i; while (a >= 0 && !good(a)) a--; while (b < rings.length && !good(b)) b++;
    if (!good(a) || !good(b)) return {c: q.c, r: r[i]};
    const t = (i - a) / (b - a);
    return {c: rings[a].c.map((v, k) => v + (rings[b].c[k] - v) * t), r: r[i]};
  });
}
