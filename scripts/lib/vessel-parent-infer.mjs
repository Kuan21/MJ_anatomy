// Parents of arteries, veins and nerves worked out from the meshes themselves, for the structures that no table gives a parent: the parent of a structure is the thicker
// structure of the same kind that one of its ends touches (within the tolerance scripts/check-topology.mjs uses for its attachments), the nearest one when several do.
// This is an inference from geometry (a small branch that runs close to two parallel vessels can be attached to the wrong one), so it is kept apart from the tables in the
// generated file and the viewer lets a table win. Only same-kind pairs count (artery → artery, vein → vein, nerve → nerve) and the parent must be clearly thicker, which also
// makes a loop impossible.
import {tubeTips} from './tube-tips.mjs';
import {centrelineOf} from './leg-centreline.mjs';
import {closest} from './heart-geom.mjs';

// Arteries and veins only: nerve roots, plexuses and branches are too close in thickness and too tangled for a thickness rule (nerves take their parents from the tables).
const KIND = {arterial: 'artery', venous: 'vein'}, CELL = .006, TOLERANCE = .002, THICKER = 1.5;
// Right/Left of a name (words, lower-case words inside it, nerve suffix); '' when it has none. A branch and its parent must be on the same side when both have one.
const sideOf = n => /\b(Right|right)\b|\.r$/.test(n) ? 'R' : /\b(Left|left)\b|\.l$/.test(n) ? 'L' : '';
const plain = n => n.replace(/\.\d{3}$/, '');

/** @returns Map child name -> parent name, for structures of `w` that have no entry in `known` (a Map child -> [parents]). */
export function inferParents(w, known) {
  // one record per structure name (several parts can share a name)
  const byName = new Map();
  for (const e of w.entries) {
    if (!KIND[e.system] || /^extra:/.test(e.id)) continue;
    const n = plain(e.name), r = byName.get(n) ?? byName.set(n, {name: n, system: e.system, parts: []}).get(n);
    r.parts.push(e);
  }
  const all = [...byName.values()];
  for (const s of all) {
    // thickness: the median ring radius of the centreline of each part; a part that is not a tube (a ganglion, a plexus sheet) has none
    const radii = [], tips = [], verts = [];
    for (const e of s.parts) {
      const g = e.load(); if (!g.indices.length) continue;
      let rings = null; try { rings = centrelineOf(g); } catch { rings = null; }
      if (rings && rings.length >= 2) for (const q of rings) if (q.r > 0) radii.push(q.r);
      const {pts, tips: ti} = tubeTips({pos: g.positions, idx: g.indices}, .008); for (const i of ti) tips.push(pts[i]);
      for (let i = 0; i < g.positions.length; i += 3 * 4) verts.push([g.positions[i], g.positions[i + 1], g.positions[i + 2]]);
    }
    radii.sort((a, b) => a - b); s.r = radii.length ? radii[radii.length >> 1] : 0; s.tips = tips; s.verts = verts;
  }
  // vertex grid per kind: cell -> structures with a vertex there
  const grid = {}, key = (x, y, z) => `${Math.floor(x / CELL)},${Math.floor(y / CELL)},${Math.floor(z / CELL)}`;
  for (const s of all) { if (s.r <= 0) continue; const gr = grid[s.system] ??= new Map(); for (const v of s.verts) { const k = key(...v); let l = gr.get(k); if (!l) gr.set(k, l = new Set()); l.add(s); } }
  const out = new Map();
  for (const s of all) {
    if (known.has(s.name) || s.r <= 0 || !s.tips.length) continue;
    const gr = grid[s.system]; if (!gr) continue;
    let best = null;
    for (const t of s.tips) {
      const cx = Math.floor(t[0] / CELL), cy = Math.floor(t[1] / CELL), cz = Math.floor(t[2] / CELL), seen = new Set();
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) for (const p of gr.get(`${cx + a},${cy + b},${cz + c}`) ?? []) {
        if (p === s || seen.has(p) || p.r < s.r * THICKER) continue; seen.add(p);
        const a = sideOf(s.name), b = sideOf(p.name); if (a && b && a !== b) continue;
        let d = Infinity; for (const e of p.parts) { const g = e.load(); if (!g.indices.length) continue; const m = p.mesh ??= {}; const c2 = closestOf(p, e, t); if (c2 < d) d = c2; }
        const gap = Math.max(0, d - .8 * s.r);   // the tip vertex of a thick tube lies on its end ring, up to one radius from the axis (as in lib/topology.mjs)
        if (gap <= TOLERANCE && (!best || gap < best.gap - 1e-6 || (Math.abs(gap - best.gap) <= 1e-6 && p.r > best.p.r))) best = {gap, p};
      }
    }
    if (best) out.set(s.name, best.p.name);
  }
  return out;
}

const meshCache = new WeakMap();
function closestOf(p, e, t) {
  let m = meshCache.get(e);
  if (!m) { const g = e.load(); m = meshOfGeom(g); meshCache.set(e, m); }
  return closest(m, t).d;
}
import {meshOf} from './heart-geom.mjs';
function meshOfGeom(g) { return meshOf(g.positions, g.indices); }
