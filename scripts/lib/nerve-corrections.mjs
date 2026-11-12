// Nerves whose Z-Anatomy course sits in the wrong place relative to the BodyParts3D bones and muscles are re-routed here: each vertex keeps its offset from the old
// centre line, and the centre line itself is replaced by a path through landmarks measured on the atlas meshes (millimetres, model frame, left side; the right side is mirrored).
// The waypoints for the superior gluteal nerve follow Gray's course: it leaves the pelvis through the greater sciatic foramen above piriformis, runs between gluteus medius
// and gluteus minimus (the points from the exit onward are the mid-points between the two muscle surfaces) and ends in tensor fasciae latae.
import fs from 'node:fs';
// Lower-limb nerves (deep fibular, infrapatellar branch, saphenous trunk) follow paths fitted to the bones and arteries by scripts/fit-lower-limb-nerves.mjs. Each entry is
// {rotate, pieces: [{at, path} | {at, follow}]}: a piece is one connected part of the mesh (matched to `at`, left-side millimetres), moved onto `path`; a `follow` piece (a side branch)
// is carried along with the trunk's displacement at its root, fading out over 30 mm.
let LIMB = {};
try { LIMB = JSON.parse(fs.readFileSync(new URL('./lower-limb-nerve-paths.json', import.meta.url), 'utf8')); } catch { /* the fit script writes it; the first run of scripts/fit-lower-limb-nerves.mjs starts without it */ }
export const CORRECTIONS = {
  'Superior gluteal nerve.l.001': [[34, 946, -64], [58, 944, -58], [72, 946, -56], [85, 960, -53], [100, 976, -49], [119, 989, -33], [126, 989, -14], [134, 987, -3]],
  ...LIMB,
};

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
function polyline(points) { const acc = [0]; for (let i = 1; i < points.length; i++) acc.push(acc[i - 1] + dist(points[i], points[i - 1])); return {points, acc, total: acc[acc.length - 1]}; }
function pointAt(pl, u) {
  const s = u * pl.total; let i = 1; while (i < pl.acc.length - 1 && pl.acc[i] < s) i++;
  const k = (s - pl.acc[i - 1]) / ((pl.acc[i] - pl.acc[i - 1]) || 1), a = pl.points[i - 1], b = pl.points[i];
  return [0, 1, 2].map(j => a[j] + (b[j] - a[j]) * k);
}
function nearestU(pl, p) {
  let best = 1e9, bu = 0;
  for (let i = 1; i < pl.points.length; i++) {
    const a = pl.points[i - 1], b = pl.points[i], ab = [0, 1, 2].map(j => b[j] - a[j]), l2 = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2 || 1;
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1] + (p[2] - a[2]) * ab[2]) / l2)), q = [0, 1, 2].map(j => a[j] + ab[j] * t), d = dist(p, q);
    if (d < best) { best = d; bu = (pl.acc[i - 1] + (pl.acc[i] - pl.acc[i - 1]) * t) / pl.total; }
  }
  return bu;
}
/** Smooth path through the waypoints (Catmull-Rom, resampled to a polyline). */
export function smooth(wp, n = 60) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const f = i / (n - 1) * (wp.length - 1), s = Math.min(wp.length - 2, Math.floor(f)), t = f - s, at = k => wp[Math.max(0, Math.min(wp.length - 1, k))];
    const p0 = at(s - 1), p1 = at(s), p2 = at(s + 1), p3 = at(s + 2);
    out.push([0, 1, 2].map(a => .5 * ((2 * p1[a]) + (-p0[a] + p2[a]) * t + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t * t + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t ** 3)));
  }
  return out;
}

/** Re-routes `positions` (metres, in place) when the nerve has a correction; returns whether it did. `indices` (triangle list) splits the mesh into connected pieces. */
export function correctNerve(name, positions, indices) {
  const spec = CORRECTIONS[name] ?? CORRECTIONS[name.replace(/\.r\.001$/, '.l.001')];
  if (!spec) return false;
  const mirror = /\.r\.001$/.test(name);
  if (spec.taper) { shiftNear(positions, spec.taper, mirror); return true; }
  if (Array.isArray(spec)) reroute(positions, spec, mirror);
  else rerouteMesh(positions, indices, spec, mirror);
  return true;
}

/** Carries the end of a nerve that starts where another nerve was moved: every vertex moves by `shift` (mm) times a weight that falls from 1 at `from` to 0 at `length` mm away. */
function shiftNear(positions, {from, shift, length}, mirror) {
  const sx = mirror ? -1 : 1, o = [from[0] * sx, from[1], from[2]], v = [shift[0] * sx, shift[1], shift[2]];
  for (let i = 0; i < positions.length / 3; i++) {
    const p = [positions[i * 3] * 1000, positions[i * 3 + 1] * 1000, positions[i * 3 + 2] * 1000], f = Math.max(0, 1 - dist(p, o) / length), k = f * f * (3 - 2 * f);
    for (let a = 0; a < 3; a++) positions[i * 3 + a] += v[a] * k / 1000;
  }
}

/** Connected pieces of a triangle mesh (vertices are joined by position, so split vertices do not separate a piece). Returns one vertex-index list per piece. */
export function pieces(positions, indices) {
  const n = positions.length / 3, key = new Map(), canon = new Array(n);
  for (let i = 0; i < n; i++) { const k = [0, 1, 2].map(a => Math.round(positions[i * 3 + a] * 20000)).join(','); if (!key.has(k)) key.set(k, i); canon[i] = key.get(k); }
  const par = Array.from({length: n}, (_, i) => i), find = a => { while (par[a] !== a) { par[a] = par[par[a]]; a = par[a]; } return a; };
  for (let t = 0; t < indices.length; t += 3) { par[find(canon[indices[t]])] = find(canon[indices[t + 1]]); par[find(canon[indices[t + 1]])] = find(canon[indices[t + 2]]); }
  const groups = new Map(); for (let i = 0; i < n; i++) { const r = find(canon[i]); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(i); }
  return [...groups.values()];
}

function rerouteMesh(positions, indices, spec, mirror) {
  if (spec.pieces.length === 1 && !spec.pieces[0].at) return reroute(positions, spec.pieces[0].path, mirror, null, spec.rotate);   // one tube: the whole mesh
  const sx = mirror ? -1 : 1, groups = pieces(positions, indices), cen = g => [0, 1, 2].map(a => g.reduce((s, i) => s + positions[i * 3 + a] * 1000, 0) / g.length);
  // match every piece of the spec to the nearest connected piece (each piece once, within 60 mm); pieces without a spec stay where they are
  const taken = new Set(), match = spec.pieces.map(sp => {
    let best = null, bd = 60; const at = [sp.at[0] * sx, sp.at[1], sp.at[2]];
    groups.forEach((g, gi) => { if (taken.has(gi)) return; const d = dist(cen(g), at); if (d < bd) { bd = d; best = gi; } });
    if (best !== null) taken.add(best); return best;
  });
  if (match.includes(null)) throw new Error('nerve correction: a piece of the mesh was not found near its anchor');
  const trunkIdx = spec.pieces.findIndex(p => p.path), trunk = groups[match[trunkIdx]];
  const before = new Map(trunk.map(i => [i, [0, 1, 2].map(a => positions[i * 3 + a] * 1000)]));
  spec.pieces.forEach((sp, k) => { if (sp.path) reroute(positions, sp.path, mirror, groups[match[k]], spec.rotate); });
  // side branches: carried along by the displacement of the trunk vertex nearest to their root, fading out over 30 mm
  spec.pieces.forEach((sp, k) => {
    if (!sp.follow) return; const g = groups[match[k]];
    let best = Infinity, root = null, shift = null;
    for (const i of g) { const p = [0, 1, 2].map(a => positions[i * 3 + a] * 1000); for (const [j, q] of before) { const d = dist(p, q); if (d < best) { best = d; root = p; shift = [0, 1, 2].map(a => positions[j * 3 + a] * 1000 - q[a]); } } }
    for (const i of g) { const p = [0, 1, 2].map(a => positions[i * 3 + a] * 1000), f = Math.max(0, 1 - dist(p, root) / 30); for (let a = 0; a < 3; a++) positions[i * 3 + a] += shift[a] * f / 1000; }
  });
}

/** Moves a tube-like mesh onto a new centre line: every vertex keeps its offset from the old centre line (mean of slices along the longest axis) at the same relative position along the path. */
export function reroute(positions, waypoints, mirror = false, subset = null, rotate = false) {
  const target = smooth(waypoints.map(p => [mirror ? -p[0] : p[0], p[1], p[2]]));
  // old centre line: means of the vertices in slices along the nerve's longest axis
  const ids = subset ?? Array.from({length: positions.length / 3}, (_, i) => i), n = ids.length, pts = ids.map(i => [positions[i * 3] * 1000, positions[i * 3 + 1] * 1000, positions[i * 3 + 2] * 1000]);
  const ext = [0, 1, 2].map(a => Math.max(...pts.map(p => p[a])) - Math.min(...pts.map(p => p[a]))), axis = ext.indexOf(Math.max(...ext));
  const sorted = pts.slice().sort((a, b) => a[axis] - b[axis]), bins = 14, old = [];
  for (let k = 0; k < bins; k++) { const s = sorted.slice(Math.floor(k * n / bins), Math.floor((k + 1) * n / bins)); if (s.length) old.push([0, 1, 2].map(a => s.reduce((t, p) => t + p[a], 0) / s.length)); }
  if (target[0][axis] > target[target.length - 1][axis] !== old[0][axis] > old[old.length - 1][axis]) target.reverse();
  const oldPl = polyline(old), newPl = polyline(target);
  for (let i = 0; i < n; i++) {
    const u = nearestU(oldPl, pts[i]), c = pointAt(oldPl, u), t = pointAt(newPl, u);
    let off = [pts[i][0] - c[0], pts[i][1] - c[1], pts[i][2] - c[2]];
    // keep the tube round where the new path turns: rotate the offset by the turn from the old to the new direction (parallel transport)
    if (rotate) off = turn(off, tangent(oldPl, u), tangent(newPl, u));
    for (let a = 0; a < 3; a++) positions[ids[i] * 3 + a] = (t[a] + off[a]) / 1000;
  }
}
function tangent(pl, u) { const a = pointAt(pl, Math.max(0, u - .02)), b = pointAt(pl, Math.min(1, u + .02)), d = [0, 1, 2].map(k => b[k] - a[k]), l = Math.hypot(...d) || 1; return d.map(v => v / l); }
/** Rotates v by the smallest rotation that takes direction a to direction b (Rodrigues). */
function turn(v, a, b) {
  const k = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], s = Math.hypot(...k), c = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  if (s < 1e-6) return v;
  const u = k.map(x => x / s), kv = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], ud = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  return [0, 1, 2].map(m => v[m] * c + kv[m] * s + u[m] * ud * (1 - c));
}
