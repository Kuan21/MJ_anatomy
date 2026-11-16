// Subclavian artery behind the anterior scalene (HN-23) regression, on the real meshes. The load-time shift of app/biomechanics-v2/subclavian-shift.ts (the code the viewer runs) must
//  1. put the artery between scalenus anterior (in front) and scalenus medius (behind), and not in front of the anterior scalene (reverse test: the unshifted meshes fail this);
//  2. leave the subclavian vein in front of the anterior scalene and the brachial plexus (never moved) clear of the artery wall (clearance >= 0.5 mm, measured wall to wall);
//  3. keep the known limits: wall penetration into either scalene <= 1 mm (user-approved 2026-11-16), first rib <= 0.5 mm, not worse than the source for the clavicle, lung and pleura (they were already overlapped);
//  4. fade to nothing at the medial end (aortic arch / brachiocephalic trunk) and before the axillary artery, with no step (the shift changes by less than 0.9 mm per mm anywhere on the mesh), the
//     vertebral artery, thyrocervical trunk and the other branches follow their origin, and no arterial part that touches a moved part is left behind.
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
import {part, nerve, SIDES, tris, clearance, bbox} from './lib/subclavian-measure.mjs';
import {measure} from './measure-subclavian-shift.mjs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
const M = await quizModule('app/biomechanics-v2/subclavian-shift.ts');
const {atlas, geometry} = loadFullAtlas();
const mm = (g) => { const v = []; for (let i = 0; i < g.length; i += 3) v.push([g[i] * 1e3, g[i + 1] * 1e3, g[i + 2] * 1e3]); return v; };
const byId = id => atlas.parts.find(p => p.id === id);
/** A part as the viewer sees it after the shift: positions decoded, then shiftSubclavianPart (the same call as in app/scene.tsx). */
const loaded = (id, apply = true) => { const g = geometry(byId(id)), pos = new Float32Array(g.positions); const moved = apply ? M.shiftSubclavianPart(id, pos) : false; return {id, moved, verts: mm(pos), idx: g.indices, base: mm(g.positions)}; };
const zc = (vs, lo, hi, ylo = -1e9, yhi = 1e9) => { const s = vs.filter(v => Math.abs(v[0]) >= lo && Math.abs(v[0]) <= hi && v[1] >= ylo && v[1] <= yhi); return s.reduce((t, v) => t + v[2], 0) / s.length; };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const PARAM = {Left: {dz: 12, dy: 2}, Right: {dz: 11, dy: 4}};
const EXCLUDED = p => /apical segmental/i.test(p.name);   // apical segmental arteries of the lung apex: lung vessels that only overlap the subclavian artery and its branches in the source, they stay in the lung
const movedIds = new Set(Object.values(M.PARTS).flatMap(p => [...p.own, ...p.branches]));

for (const S of SIDES) {
  const side = S.side, P = M.PARTS[side], spec = M.SHIFT[side];
  assert.equal(spec.dz, PARAM[side].dz); assert.equal(spec.dy, PARAM[side].dy);
  const art = loaded(S.artery), A0 = part(S.artery);
  assert.ok(art.moved, `${side}: artery is moved`);
  // 1. the artery between the scalenes, not in front of the anterior scalene (the unshifted artery is in front of it)
  const scaA = part(S.scaA), scaM = part(S.scaM), vein = part(S.vein);
  const za = zc(scaA.verts, 38, 52, 1420, 1440), zm = zc(scaM.verts, 38, 52, 1420, 1440);
  const behind = vs => { const z = zc(vs, 38, 52); return z < za - 1.5 && z > zm + 1.5; };
  assert.ok(!behind(art.base), `${side}: reverse test, the source artery is NOT between the scalenes`);
  assert.ok(behind(art.verts), `${side}: artery z ${zc(art.verts, 38, 52).toFixed(1)} must lie between scalenus medius ${zm.toFixed(1)} and scalenus anterior ${za.toFixed(1)}`);
  assert.ok(zc(art.base, 38, 52) > za, `${side}: the source artery lies in front of the anterior scalene`);
  // 2. the vein stays in front of the anterior scalene (never moved), at least 8 mm in front of its centre and in front of the artery by 10 mm or more at the scalene
  assert.ok(!movedIds.has(S.vein), 'vein is not moved');
  assert.ok(zc(vein.verts, 38, 52) > za + 8 && zc(vein.verts, 38, 52) - zc(art.verts, 38, 52) > 10, `${side}: subclavian vein must stay in front of the anterior scalene and of the artery`);
  assert.ok(Math.min(...vein.verts.filter(v => Math.abs(v[0]) >= 30 && Math.abs(v[0]) <= 55).map(v => v[2])) > Math.max(...scaA.verts.filter(v => Math.abs(v[0]) >= 30 && Math.abs(v[0]) <= 55).map(v => v[2])) - 1, `${side}: vein behind the front edge of the anterior scalene`);
  // 3. the plexus meshes are never moved, and stay clear of the artery wall
  for (const n of S.plexus) assert.ok(!M.roleOf(n), `${n} must not be moved`);
  // displacement amounts and direction
  let maxDz = 0, maxDy = 0; art.verts.forEach((v, i) => { maxDz = Math.max(maxDz, A0.verts[i][2] - v[2]); maxDy = Math.max(maxDy, v[1] - A0.verts[i][1]); assert.ok(Math.abs(v[0] - A0.verts[i][0]) < 1e-3, 'no sideways shift'); });
  assert.ok(Math.abs(maxDz - spec.dz) < .15 && Math.abs(maxDy - spec.dy) < .15, `${side}: maximum shift ${maxDz.toFixed(2)} back, ${maxDy.toFixed(2)} up`);
  // 4. no shift at the ends of the artery and no step anywhere
  const line = M.onLine; let ends = 0;
  art.base.forEach((p, i) => { const {d} = line(side, p); assert.ok(d <= M.INNER, `${side}: artery vertex ${d.toFixed(1)} mm from the centre line`); if (dist(p, art.verts[i]) < .05) ends++; });
  assert.ok(ends >= 2, `${side}: at least two artery vertices (the two ends) stay put, ${ends} do`);
  // contacts with the vessels the artery joins: aortic arch / brachiocephalic trunk and common carotid medially, axillary artery laterally (shift at the contact < 0.5 mm)
  const joins = side === 'Left' ? ['FJ3411', 'FJ3483', 'FJ2216'] : ['FJ3417', 'FJ3564', 'FJ2268'];
  for (const id of joins) { const nb = part(id); let n = 0, worst = 0; art.base.forEach((p, i) => { if (nb.verts.some(q => dist(p, q) < 1.5)) { n++; worst = Math.max(worst, dist(p, art.verts[i])); } }); assert.ok((n > 0 || id === 'FJ3483') && worst < .5, `${side}: ${id} contact ${n} vertices moved ${worst.toFixed(2)} mm`); }
}
// no step on any moved part: the shift of two neighbouring vertices of one triangle differs by less than 0.9 mm per mm on the artery itself (a smootherstep over a 30 to 40 mm ramp) and less than 1.3 on a branch (which fades with the distance as well)
const SLOPE = {}, movedOwn = new Set(Object.values(M.PARTS).flatMap(p => p.own));
for (const id of movedIds) {
  const L = loaded(id); assert.ok(L.moved, id); let worst = 0;
  for (let i = 0; i < L.idx.length; i += 3) for (let k = 0; k < 3; k++) { const a = L.idx[i + k], b = L.idx[i + (k + 1) % 3], da = L.verts[a].map((x, j) => x - L.base[a][j]), db = L.verts[b].map((x, j) => x - L.base[b][j]), d = dist(L.base[a], L.base[b]); if (d < 1e-6) continue; worst = Math.max(worst, dist(da, db) / d); }
  SLOPE[id] = worst; assert.ok(worst < (movedOwn.has(id) ? .9 : 1.3), `${id}: shift changes by ${worst.toFixed(2)} mm per mm between neighbouring vertices`);
}
// branches follow their origin: every vertex of a moved part that touches (<= 1.2 mm) a vertex of another moved part keeps its place relative to it (shift difference <= 1 mm); every moved branch touches one
{
  const all = [...movedIds].map(id => loaded(id));
  for (const L of all) {
    if (M.PARTS.Left.own.includes(L.id) || M.PARTS.Right.own.includes(L.id)) continue;
    let touches = 0, worst = 0;
    for (const O of all) { if (O.id === L.id || (L.id.startsWith('FJ1972') && O.id.startsWith('FJ1972'))) continue;
      L.base.forEach((p, i) => { for (let j = 0; j < O.base.length; j++) if (dist(p, O.base[j]) < 1.2) { touches++; worst = Math.max(worst, dist(L.verts[i].map((x, k) => x - p[k]), O.verts[j].map((x, k) => x - O.base[j][k]))); break; } }); }
    assert.ok(touches > 0, `${L.id}: touches no other moved part`); assert.ok(worst <= 1, `${L.id}: separates from its parent by ${worst.toFixed(2)} mm`);
  }
  // no arterial part is left behind where it touched a vertex that moves by 1 mm or more (the apical segmental arteries are lung vessels that only overlap the artery)
  const grid = new Map(), cell = 2, key = p => p.map(x => Math.floor(x / cell)).join(',');
  for (const L of all) L.base.forEach((p, i) => { const d = dist(p, L.verts[i]); if (d >= 1) { const k = key(p); (grid.get(k) ?? grid.set(k, []).get(k)).push([p, d]); } });
  const near = p => { const [a, b, c] = p.map(x => Math.floor(x / cell)); let w = 0; for (let x = a - 1; x <= a + 1; x++) for (let y = b - 1; y <= b + 1; y++) for (let z = c - 1; z <= c + 1; z++) for (const [q, d] of grid.get(`${x},${y},${z}`) ?? []) if (dist(p, q) < 1.2) w = Math.max(w, d); return w; };
  let checked = 0;
  for (const p of atlas.parts) {
    if (movedIds.has(p.id) || EXCLUDED(p) || p.system !== 'arterial' || !p.bounds) continue;
    if (p.bounds[0][1] * 1e3 > 1460 || p.bounds[1][1] * 1e3 < 1380) continue;
    checked++; const v = mm(geometry(p).positions); const w = Math.max(...v.map(near));
    assert.ok(w < 1, `${p.id} ${p.name} touches a part that moves by ${w.toFixed(1)} mm but stays behind`);
  }
  assert.ok(checked > 20, 'arterial parts checked: ' + checked);
}
// negative controls: a rigid shift of the artery alone (no fade, no branches) is caught by the same measurements
{
  const S = SIDES[0], A = loaded(S.artery), rigid = A.base.map(p => [p[0], p[1] + 2, p[2] - 12]), arch = part('FJ3411');
  assert.ok(Math.max(...A.base.map((p, i) => arch.verts.some(q => dist(p, q) < 1.5) ? dist(p, rigid[i]) : 0)) > 5, 'control: a rigid shift moves the aortic arch contact');
}
// branches against the neighbours the artery was measured against: no new penetration of the first rib or clavicle (0.5 mm), none deeper than 1 mm into the brachial plexus, 2 mm into the anterior scalene, 3.5 mm into the middle scalene
for (const S of SIDES) {
  const nb = {rib: part(S.rib), clavicle: part(S.side === 'Left' ? 'FJ3237' : 'FJ3362'), roots: nerve(S.plexus[0]), inferior: nerve(S.plexus[3]), scaA: part(S.scaA), scaM: part(S.scaM)};
  const tb = Object.fromEntries(Object.entries(nb).map(([k, v]) => [k, tris(v)])), room = {rib: .5, clavicle: .5, roots: 1, inferior: 1, scaA: 2, scaM: 3.5};
  for (const id of M.PARTS[S.side].branches) {
    const L = loaded(id), P0 = {verts: L.base, idx: L.idx}, P1 = {verts: L.verts, idx: L.idx}, t0 = tris(P0), t1 = tris(P1);
    for (const k in nb) { const a = clearance(P0, nb[k], {ta: t0, tb: tb[k], limit: 8}), b = clearance(P1, nb[k], {ta: t1, tb: tb[k], limit: 8}); assert.ok(b >= Math.min(a, 0) - room[k], `${S.side} ${id} vs ${k}: ${a.toFixed(1)} -> ${b.toFixed(1)} mm`); }
  }
}
// wall clearances (before / after), with the upper limits
const m = await measure(M);
const LIM = {
  Left: {'scalenus anterior': -1, 'scalenus medius': -1, 'first rib': .5, 'brachial plexus roots': .5, 'superior trunk': .5, 'middle trunk': .5, 'inferior trunk': .5, 'subclavian vein': 1.5, clavicle: -4.3, 'pleural cupula': -22.3, 'lung (upper lobe)': -11.2, trachea: 6, 'axillary artery': -3.3, 'arch of aorta': -9.4},
  Right: {'scalenus anterior': -1, 'scalenus medius': -1, 'first rib': -.5, 'brachial plexus roots': .5, 'superior trunk': .5, 'middle trunk': .5, 'inferior trunk': .5, 'subclavian vein': 1.5, clavicle: -4.4, 'pleural cupula': -18.8, 'lung (upper lobe)': -5.2, trachea: 5, 'axillary artery': -3.3, 'brachiocephalic trunk': -4.5},
};
for (const side of ['Left', 'Right']) for (const [n, lim] of Object.entries(LIM[side])) { const r = m[side][n]; assert.ok(r, `${side} ${n}: not measured`); assert.ok(r.after >= lim, `${side} ${n}: clearance ${r.after.toFixed(2)} mm after the shift, limit ${lim}`); }
// reverse test of the limits: the unshifted artery is nowhere near the interscalene position (it sits in the anterior scalene: no reverse of the plexus limits is needed)
for (const side of ['Left', 'Right']) assert.ok(m[side]['scalenus medius'].before > 8, `${side}: source artery is far in front of the middle scalene (${m[side]['scalenus medius'].before.toFixed(1)})`);
const f = (s, n) => `${m[s][n].before.toFixed(1)}->${m[s][n].after.toFixed(1)}`;
console.log(`largest slope ${Math.max(...Object.values(SLOPE)).toFixed(2)} mm/mm; Subclavian artery moved back ${M.SHIFT.Left.dz}/${M.SHIFT.Right.dz} mm and up ${M.SHIFT.Left.dy}/${M.SHIFT.Right.dy} mm (left/right) into the interscalene gap; scalenus anterior ${f('Left', 'scalenus anterior')}/${f('Right', 'scalenus anterior')}, medius ${f('Left', 'scalenus medius')}/${f('Right', 'scalenus medius')}, plexus roots ${f('Left', 'brachial plexus roots')}/${f('Right', 'brachial plexus roots')} mm, branches follow, ends fixed.`);
void nerve; void tris; void clearance; void bbox;
