// Branch/trunk continuity after the HN-23 load-time shift: for every moved branch, the distance from its vertices to the nearest vertex of
// the artery wall mesh (and of any other moved part) before and after the shift; and every NOT moved part (any system) that touches a moved vertex that moves 1 mm or more.
import {quizModule} from './quiz-modules.mjs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
const M = await quizModule('app/biomechanics-v2/subclavian-shift.ts');
const {atlas, geometry} = loadFullAtlas();
const mm = g => { const v = []; for (let i = 0; i < g.length; i += 3) v.push([g[i] * 1e3, g[i + 1] * 1e3, g[i + 2] * 1e3]); return v; };
const byId = id => atlas.parts.find(p => p.id === id);
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const load = id => { const g = geometry(byId(id)), pos = new Float32Array(g.positions); const base = mm(pos); M.shiftSubclavianPart(id, pos); return {id, name: byId(id).name, base, verts: mm(pos)}; };
const minD = (A, B) => { let m = Infinity; for (const p of A) for (const q of B) { const d = dist(p, q); if (d < m) m = d; } return m; };
export function gaps() {
  const out = [];
  for (const side of ['Left', 'Right']) {
    const art = load(M.PARTS[side].own[0]);
    const all = [...M.PARTS[side].own, ...M.PARTS[side].branches].map(load);
    for (const L of all) {
      if (L.id === art.id) continue;
      // nearest distance to ANY other moved part of this side (parent may be a branch), before and after
      let best = null;
      for (const O of all) { if (O.id === L.id) continue; const b = minD(L.base, O.base), a = minD(L.verts, O.verts); if (!best || b < best.before) best = {with: O.id, before: b, after: a}; }
      out.push({side, id: L.id, name: L.name, ...best, vsArtery: {before: minD(L.base, art.base), after: minD(L.verts, art.verts)}});
    }
  }
  return out;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  for (const r of gaps()) console.log(`${r.side} ${r.id} ${r.name} | nearest moved part ${r.with}: ${r.before.toFixed(2)} -> ${r.after.toFixed(2)} | artery ${r.vsArtery.before.toFixed(2)} -> ${r.vsArtery.after.toFixed(2)}`);
  // unmoved parts touching moved vertices
  const moved = new Set(Object.values(M.PARTS).flatMap(p => [...p.own, ...p.branches]));
  const mv = [...moved].map(load), pts = [];
  for (const L of mv) L.base.forEach((p, i) => { const d = dist(p, L.verts[i]); if (d >= 1) pts.push([p, d, L.id]); });
  for (const p of atlas.parts) {
    if (moved.has(p.id) || !p.bounds || /apical segmental/i.test(p.name)) continue;
    if (p.bounds[0][1] * 1e3 > 1500 || p.bounds[1][1] * 1e3 < 1370) continue;
    const v = mm(geometry(p).positions); let w = 0, who = '', md = Infinity;
    for (const q of v) for (const [r, d, id] of pts) { const dd = dist(q, r); if (dd < 1.5 && d > w) { w = d; who = id; } }
    if (w >= 1) console.log(`NOT MOVED but touches: ${p.id} ${p.name} (${p.system}) near ${who}, shift ${w.toFixed(1)} mm`);
  }
}
