// Smooth ends of small vessels, shaped inside the vessel's own mesh (scripts/prepare-model-stream.mjs, plan from scripts/lib/vessel-tip-plan.mjs).
//   taper  the last millimetres of a small branch that really ends in tissue narrow smoothly to a rounded point along the vessel's own course (radius factor (1 - t^2)^0.75, t = 1 at the old end): the end never reaches
//          past where the vessel used to stop. The old end was a separate 5-sided cone added beyond the cut end, which stood out beside the main vessel like a thorn and ran into the structure it reached.
//   flare  the root of a small branch where it leaves a clearly larger vessel from the side widens by up to 50 % over four radii, so the junction blends into the trunk.
// Only vertex positions of the vessel change (nothing is added, removed or re-connected), so the skinning, the connectors and every check that reads the source geometry are unaffected. Plain geometry: no atlas access.
export const WALL_NORMAL = .6, TAPER_POWER = .75, FLARE_WIDEN = .5, FLARE_BACK_RADII = 4, FLARE_MIN_TRUNK = 2;
/** Length of a taper for a vessel of this radius (metres): 4.5 mm for a 0.5 mm vessel, at most 8 mm (the length of the old cone). */
export const taperLength = radius => Math.min(.008, .003 + 3 * radius);

/** True when the mesh carries on past an end: three or more vertices lie ahead of the cap (0.3 mm to `ahead` metres along the outward axis) within 1.25 radii of the axis. A real end has nothing there. */
export function continuesAhead(positions, center, dir, radius, ahead) {
  const lim = 1.25 * radius + .0003; let n = 0;
  for (let i = 0; i < positions.length; i += 3) {
    const rx = positions[i] - center[0], ry = positions[i + 1] - center[1], rz = positions[i + 2] - center[2], s = rx * dir[0] + ry * dir[1] + rz * dir[2];
    if (s < .0003 || s > ahead) continue;
    if (Math.hypot(rx - s * dir[0], ry - s * dir[1], rz - s * dir[2]) <= lim && ++n >= 3) return true;
  }
  return false;
}

/** Which vertices belong to the tube wall of this end: behind the cap plane by `s`, near the axis, and on the wall (not the flat inside of a cap, not the trunk the branch leaves from). */
function select(P, i, c, d, s0, s1, r, wall = .55, capEdge = .0004) {
  const rel = [P[i] - c[0], P[i + 1] - c[1], P[i + 2] - c[2]], s = -(rel[0] * d[0] + rel[1] * d[1] + rel[2] * d[2]);
  if (s < s0 || s > s1) return null;
  const perp = [rel[0] + s * d[0], rel[1] + s * d[1], rel[2] + s * d[2]], pr = Math.hypot(perp[0], perp[1], perp[2]);
  if (pr > 1.35 * r + .0003 || (pr < wall * r && s > capEdge)) return null;
  return {s, perp};
}

/**
 * Shape the ends of one vessel mesh in place.
 * @param positions Float32Array xyz
 * @param tapers    [{center, dir, radius, length}]  center of the end cap, unit vector pointing out of the vessel, radius at the end, taper length
 * @param flares    [{center, dir, radius, reach}]   dir points from the branch towards the trunk, reach = distance from the cap to the trunk wall
 * @returns indices of the vertices that moved
 */
export function shapeVesselTips(positions, tapers = [], flares = [], indices = null) {
  const normals = indices && (tapers.length || flares.length) ? weldedNormals(positions, indices) : null;
  /** True when the vertex belongs to the tube wall of this end: its normal stands across the axis. The wall of a larger vessel that the axis runs through (a stub is welded to it) faces along the axis and is left alone. */
  const onWall = (i, dir, s, capS) => { if (!normals || s <= capS) return true; const n = normals.get(i); return !n || Math.abs(n[0] * dir[0] + n[1] * dir[1] + n[2] * dir[2]) <= WALL_NORMAL; };
  const moved = new Set(), applied = {tapers: 0, flares: 0, missed: [], done: []}, keyOf = i => `${Math.round(positions[i * 3] * 1e6)},${Math.round(positions[i * 3 + 1] * 1e6)},${Math.round(positions[i * 3 + 2] * 1e6)}`;
  /** Vertex numbers (i * 3) of the selected set that are joined, by triangles, to a vertex of the end itself (s <= seedS): another vessel of the same mesh that merely passes by is left alone. */
  function connected(sel, seedS) {
    if (!indices) return new Set(sel.keys());
    const parent = new Map(), find = k => { let r = k; while (parent.get(r) !== r) r = parent.get(r); while (parent.get(k) !== r) { const n = parent.get(k); parent.set(k, r); k = n; } return r; };
    for (const i of sel.keys()) { const k = keyOf(i / 3); if (!parent.has(k)) parent.set(k, k); }
    for (let t = 0; t < indices.length; t += 3) {
      const ks = [0, 1, 2].map(j => indices[t + j] * 3).filter(v => sel.has(v)).map(v => keyOf(v / 3));
      for (let a = 1; a < ks.length; a++) { const x = find(ks[0]), y = find(ks[a]); if (x !== y) parent.set(x, y); }
    }
    let low = Infinity; for (const v of sel.values()) if (Math.hypot(...v.perp) <= 1.1 * v.r) low = Math.min(low, v.s);
    const reach = Math.max(seedS, low + .0004), seeds = new Set(); for (const [i, v] of sel) if (v.s <= reach && Math.hypot(...v.perp) <= 1.1 * v.r) seeds.add(find(keyOf(i / 3)));   // the end itself: normally s <= seedS, else the vertices closest to the cut
    const out = new Set(); for (const i of sel.keys()) if (seeds.has(find(keyOf(i / 3)))) out.add(i);
    return out;
  }
  for (const t of tapers) {
    const sel = new Map(); for (let i = 0; i < positions.length; i += 3) { const r = select(positions, i, t.center, t.dir, -.0004, t.length, t.radius); if (r && onWall(i / 3, t.dir, r.s, .0004)) sel.set(i, {...r, r: t.radius}); }
    const hit = connected(sel, .0006); if (hit.size) { applied.tapers++; applied.done.push(t); } else applied.missed.push(t);
    for (const i of hit) {
    const s0 = sel.get(i);
    const u = 1 - Math.max(s0.s, 0) / t.length, f = Math.pow(Math.max(0, 1 - u * u), TAPER_POWER);   // 1 at the body, 0 at the old end
    let changed = false; for (let k = 0; k < 3; k++) { const v = t.center[k] - s0.s * t.dir[k] + s0.perp[k] * f; if (Math.abs(v - positions[i + k]) > 1e-9) changed = true; positions[i + k] = v; }
    if (changed) moved.add(i / 3);
    }
  }
  for (const fl of flares) {
    const back = FLARE_BACK_RADII * fl.radius, sel = new Map();
    for (let i = 0; i < positions.length; i += 3) { const r = select(positions, i, fl.center, fl.dir, -.0001, back, fl.radius, .8, -1); if (r && r.s + fl.reach <= back && onWall(i / 3, fl.dir, r.s, -1)) sel.set(i, {...r, r: fl.radius}); }   // wall vertices only (capEdge -1: nothing is exempt)
    const hit = connected(sel, back); if (hit.size) applied.flares++;
    for (const i of hit) {
    const s0 = sel.get(i), w = Math.max(0, 1 - (s0.s + fl.reach) / back), g = 1 + FLARE_WIDEN * w * w;
    let changed = false; for (let k = 0; k < 3; k++) { const v = fl.center[k] - s0.s * fl.dir[k] + s0.perp[k] * g; if (Math.abs(v - positions[i + k]) > 1e-9) changed = true; positions[i + k] = v; }
    if (changed) moved.add(i / 3);
    }
  }
  moved.applied = applied;
  return moved;
}

/** Unit normals per vertex index, area-weighted over every vertex at the same position (a seam gives one normal). Map vertex -> [x,y,z]. */
function weldedNormals(positions, indices) {
  const key = i => `${Math.round(positions[i * 3] * 1e6)},${Math.round(positions[i * 3 + 1] * 1e6)},${Math.round(positions[i * 3 + 2] * 1e6)}`, sums = new Map(), keys = new Map();
  const k = i => keys.get(i) ?? keys.set(i, key(i)).get(i);
  for (let t = 0; t < indices.length; t += 3) {
    const a = indices[t] * 3, b = indices[t + 1] * 3, c = indices[t + 2] * 3;
    const ux = positions[b] - positions[a], uy = positions[b + 1] - positions[a + 1], uz = positions[b + 2] - positions[a + 2], vx = positions[c] - positions[a], vy = positions[c + 1] - positions[a + 1], vz = positions[c + 2] - positions[a + 2];
    const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
    for (let j = 0; j < 3; j++) { const q = k(indices[t + j]), sm = sums.get(q) ?? sums.set(q, [0, 0, 0]).get(q); sm[0] += n[0]; sm[1] += n[1]; sm[2] += n[2]; }
  }
  const out = new Map();
  for (let v = 0; v < positions.length / 3; v++) { const sm = sums.get(k(v)); if (!sm) continue; const l = Math.hypot(...sm); if (l > 1e-24) out.set(v, [sm[0] / l, sm[1] / l, sm[2] / l]); }
  return out;
}

/**
 * Update the normals of the vertices that moved and of the vertices that share a triangle with them: area-weighted normals summed over every vertex at the same position (so a seam stays closed).
 * @param normals Int16Array xyz packed to +-32767 (the viewer's packing), changed in place
 */
export function refreshNormals(positions, indices, moved, normals) {
  const key = i => `${Math.round(positions[i * 3] * 1e6)},${Math.round(positions[i * 3 + 1] * 1e6)},${Math.round(positions[i * 3 + 2] * 1e6)}`, sums = new Map(), near = new Set(moved);
  for (let t = 0; t < indices.length; t += 3) {
    const a = indices[t], b = indices[t + 1], c = indices[t + 2], A = a * 3, B = b * 3, C = c * 3;
    const ux = positions[B] - positions[A], uy = positions[B + 1] - positions[A + 1], uz = positions[B + 2] - positions[A + 2], vx = positions[C] - positions[A], vy = positions[C + 1] - positions[A + 1], vz = positions[C + 2] - positions[A + 2];
    const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
    for (const v of [a, b, c]) { const k = key(v), s = sums.get(k) ?? sums.set(k, [0, 0, 0]).get(k); s[0] += n[0]; s[1] += n[1]; s[2] += n[2]; }
    if (moved.has(a) || moved.has(b) || moved.has(c)) { near.add(a); near.add(b); near.add(c); }
  }
  for (const v of near) {
    const s = sums.get(key(v)), l = Math.hypot(...s); if (!(l > 1e-24)) continue;
    for (let k = 0; k < 3; k++) normals[v * 3 + k] = Math.round(s[k] / l * 32767);
  }
}

/** Bounds [[x,y,z],[x,y,z]] of a position array. */
export function boundsOf(positions) {
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], positions[i + k]); hi[k] = Math.max(hi[k], positions[i + k]); }
  return [lo, hi];
}
