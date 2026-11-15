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
 * A ring beside a wide branch can keep a radius within the tolerance while its centre is pulled out, so a ring is also taken as disturbed when its centre lies more than
 * `ctol` radii (and more than one ring spacing) from the median centre of the `span` rings on either side (fewer near the ends, so the window stays symmetric).
 * Undisturbed rings keep their centre, so a real bend stays (a kink sharper than one ring spacing, oblique to the axes, can lose its corner ring: under one spacing).
 * Limits: a branch that disturbs more than `span` rings in a row (about 12 mm of the tube) is not removed: in the synthetic tests that is a tube of 10 mm radius and more
 * with a branch more than about half as wide; rings that drift slowly to one side over more than `span` rings (tilted bands beside such a branch) are not seen either.
 * Returns new rings; `info` (optional) receives {disturbed}: the indices that were corrected.
 */
export function robustRings(rings, span = 4, tol = .3, info = null, ctol = .5) {
  const n = rings.length, r = rings.map((_, i) => median(rings.slice(Math.max(0, i - span), i + span + 1).map(q => q.r)));
  const step = n > 1 ? median(rings.slice(1).map((q, i) => Math.hypot(q.c[0] - rings[i].c[0], q.c[1] - rings[i].c[1], q.c[2] - rings[i].c[2]))) : 0;
  const bad = rings.map((q, i) => {
    if (Math.abs(q.r - r[i]) > r[i] * tol) return true;
    const h = Math.min(span, i, n - 1 - i), near = rings.slice(i - h, i + h + 1), m = [0, 1, 2].map(k => median(near.map(p => p.c[k])));
    return Math.hypot(q.c[0] - m[0], q.c[1] - m[1], q.c[2] - m[2]) > Math.max(r[i] * ctol, step);
  }), good = i => i >= 0 && i < n && !bad[i];
  if (info) info.disturbed = bad.flatMap((b, i) => b ? [i] : []);
  return rings.map((q, i) => {
    if (!bad[i]) return {c: q.c, r: r[i]};
    let a = i, b = i; while (a >= 0 && !good(a)) a--; while (b < rings.length && !good(b)) b++;
    if (!good(a) || !good(b)) return {c: q.c, r: r[i]};
    const t = (i - a) / (b - a);
    return {c: rings[a].c.map((v, k) => v + (rings[b].c[k] - v) * t), r: r[i]};
  });
}
