// Layering of the anterolateral abdominal wall. The three flat muscles come from different sources (external oblique from the 4.0 atlas, internal oblique and transversus abdominis from the
// BodyParts3D 3.0 supplement) and were registered to the same frame, but nothing kept them in order: the internal oblique reached the same front surface as the external oblique (118 mm
// both at the umbilical level), poked through it over about a fifth of the wall and flickered against it (z-fighting), and both flat muscles ran on to the midline behind and in front of rectus abdominis.
//
//   1. Medial boundary. The internal oblique and transversus abdominis are muscle only lateral to the semilunar line (the lateral border of rectus abdominis, x = 0.075 m from the midline,
//      measured on the rectus meshes); further medially they continue as aponeuroses, which the rectus sheath mesh stands for. Each is cut at that line (flat cap, closed mesh).
//   2. Order. Seen from outside, external oblique is the outermost layer, internal oblique lies behind its deep surface and transversus abdominis behind that of the internal oblique, each
//      with a gap of `gap` metres. A vertex that lies in front of the deep surface of the layer outside it is moved inward, along the line from the trunk axis, to just behind that surface
//      (at most `maxMove`); the displacement is smoothed over the mesh so the surface stays smooth.
import {meshOf, sub, dot, mul, add, unit, cross, len} from './heart-geom.mjs';
import {splitMesh, planeOf} from './tendon-cut.mjs';
import {openEdges} from './tendon-build.mjs';

export const SEMILUNAR_X = .075, GAP = .0022, MAX_MOVE = .012;
/** Centre of the trunk in the horizontal plane (x = 0 on the midline; z of the middle of the abdominal wall measured on the ribs). */
export const TRUNK_AXIS_Z = .028;

/** All hits (distances) of the line o + t d with a mesh, nearest first. */
function hits(mesh, o, d) {
  const out = [];
  for (const tr of mesh.tris) {
    const e1 = sub(tr.b, tr.a), e2 = sub(tr.c, tr.a), p = cross(d, e2), det = dot(e1, p);
    if (Math.abs(det) < 1e-14) continue;
    const inv = 1 / det, t0 = sub(o, tr.a), u = dot(t0, p) * inv; if (u < 0 || u > 1) continue;
    const q = cross(t0, e1), v = dot(d, q) * inv; if (v < 0 || u + v > 1) continue;
    const t = dot(e2, q) * inv; if (t > 1e-7) out.push(t);
  }
  return out.sort((a, b) => a - b);
}
const outward = (x, z) => unit([x, 0, z - TRUNK_AXIS_Z]);

/**
 * Cuts a mesh at the vertical plane |x| = SEMILUNAR_X and keeps the lateral part, capped. `sx` = -1 for the right side (x < 0). The sources are not watertight (the voxel segmentation left tears), and a cut
 * through a tear leaves a straight open run; the plane is therefore tried at 0, +-1 ... +-5 mm of the nominal line and the one that adds the fewest open edges is taken.
 */
export function cutAtSemilunarLine(positions, indices, sx) {
  const mesh = {positions: Float64Array.from(positions), indices: Uint32Array.from(indices)}, open0 = openEdges(mesh);
  let best = null;
  for (const d of [0, .001, -.001, .002, -.002, .003, -.003, .004, -.004, .005, -.005]) {
    const {pos} = splitMesh(mesh, planeOf([sx, 0, 0], [sx * (SEMILUNAR_X + d), 0, 0]));
    if (!pos.indices.length) continue;
    const open = openEdges(pos); if (!best || open < best.open) best = {positions: pos.positions, indices: pos.indices, open, d};
    if (open <= open0) break;
  }
  if (!best) throw new Error('abdominal layers: the semilunar cut removed everything');
  return {positions: best.positions, indices: best.indices, openBefore: open0, openAfter: best.open, offset: best.d};
}

/** Moves the vertices of `inner` that lie in front of the deep surface of `outer` (or inside it) to `gap` behind that surface. Returns the number of vertices moved. */
export function stackBehind(outer, inner, {gap = GAP, maxMove = MAX_MOVE, passes = 6} = {}) {
  const P = inner.positions, n = P.length / 3, mesh = outer.tris ? outer : meshOf(outer.positions, outer.indices), R = 0.3;
  const need = new Float64Array(n), dirs = new Array(n);
  for (let v = 0; v < n; v++) {
    const r = outward(P[v * 3], P[v * 3 + 2]); dirs[v] = r;
    const o = [P[v * 3] + r[0] * R, P[v * 3 + 1], P[v * 3 + 2] + r[2] * R], h = hits(mesh, o, mul(r, -1));
    if (!h.length) continue;
    // the deep surface of the layer at this place: the last hit within 3 cm of the first (the line goes on through the trunk and meets the same muscle again at the back)
    let deepest = h[0]; for (const t of h) if (t <= h[0] + .03) deepest = t;
    need[v] = Math.max(0, Math.min(maxMove, deepest + gap - R));   // R = where the vertex is; positive: it lies in front of deep surface + gap
  }
  // smooth the displacement over the mesh (neighbours from the triangles), never below the requirement of a vertex itself
  const nb = Array.from({length: n}, () => new Set());
  for (let i = 0; i < inner.indices.length; i += 3) for (let k = 0; k < 3; k++) { const a = inner.indices[i + k], b = inner.indices[i + (k + 1) % 3]; nb[a].add(b); nb[b].add(a); }
  let cur = Float64Array.from(need);
  for (let pass = 0; pass < passes; pass++) {
    const next = new Float64Array(n);
    for (let v = 0; v < n; v++) { let s = cur[v], c = 1; for (const u of nb[v]) { s += cur[u]; c++; } next[v] = Math.max(need[v], s / c); }
    cur = next;
  }
  let moved = 0;
  for (let v = 0; v < n; v++) if (cur[v] > 1e-5) { const r = dirs[v]; P[v * 3] -= r[0] * cur[v]; P[v * 3 + 2] -= r[2] * cur[v]; moved++; }
  return moved;
}

/**
 * `ext`, `internal`, `transversus`: {positions, indices} of one side in the atlas frame (metres); `sx` = -1 right, +1 left.
 * Returns the cut and stacked internal oblique and transversus abdominis.
 */
export function layerAbdominalWall({ext, internal, transversus, sx}) {
  const outer = meshOf(ext.positions, ext.indices);
  const a = cutAtSemilunarLine(internal.positions, internal.indices, sx), b = cutAtSemilunarLine(transversus.positions, transversus.indices, sx);
  const movedA = stackBehind(outer, a);
  const movedB = stackBehind(meshOf(a.positions, a.indices), b);
  return {internal: a, transversus: b, moved: {internal: movedA, transversus: movedB}};
}
