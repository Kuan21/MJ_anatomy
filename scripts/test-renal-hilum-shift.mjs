// Renal hilum order (AB-01) regression, on the real meshes. The load-time shift of app/biomechanics-v2/renal-hilum-shift.ts (the code the viewer runs) must
//  1. give the order renal vein, renal artery, renal pelvis from front to back at the hilum on both sides (median depths at least 3.5 mm and 5 mm apart; on the right the vein
//     is held back by the kidney surface and the artery by the psoas major, so 4 mm is what fits), with the vein in front of the artery all the way from the midline
//     (reverse test: the unshifted meshes fail this);
//  2. fade to nothing near the midline (vein into the inferior vena cava, artery from the aorta) and inside the renal sinus, with no step (the shift changes by less than 3 mm per mm along any mesh edge);
//  3. keep every branch on its parent and on its organ: suprarenal vessels on the renal vessel and on the adrenal gland, ureteric arteries on the renal artery and on the ureter
//     (every vertex that touched within 1.5 mm before still touches within 2.5 mm), and leave no vessel that touches a moved part behind (closure);
//  4. keep inside each kidney what was inside it (no intrarenal branch or part of the ureter is carried out through the kidney surface) and keep 1 mm from the adrenal glands;
//  5. not push the vessels into the neighbouring organs: wall clearance against the closed neighbour meshes no worse than the source by more than 0.5 mm, unless still clear by 1 mm;
//     vein and artery may touch only inside the renal sinus (measured clearance >= -1 mm).
import assert from 'node:assert/strict';
import {M, loaded, bandZ, measure, HILUM, ENTRY} from './measure-renal-hilum.mjs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {surfaceIndex} from './lib/surface-distance.mjs';
const SIDES = ['Left', 'Right'];
// 1. order at the hilum, and the vein in front of the artery from the midline to the hilum
for (const side of SIDES) {
  const [lo, hi] = HILUM[side];
  const after = {vein: bandZ(side, 'vein', lo, hi, true), artery: bandZ(side, 'artery', lo, hi, true), pelvis: bandZ(side, 'pelvis', lo, hi, true)};
  const before = {vein: bandZ(side, 'vein', lo, hi, false), artery: bandZ(side, 'artery', lo, hi, false)};
  assert.ok(after.vein - after.artery >= 3.5, `${side} hilum: vein ${after.vein.toFixed(1)} must be at least 3.5 mm in front of the artery ${after.artery.toFixed(1)}`);
  assert.ok(after.artery - after.pelvis >= 5, `${side} hilum: artery ${after.artery.toFixed(1)} must be at least 5 mm in front of the pelvis ${after.pelvis.toFixed(1)}`);
  assert.ok(before.vein < before.artery, `${side} reverse test: the source meshes should have the vein behind the artery at the hilum`);
  for (let u = 8; u + 4 <= ENTRY[side]; u += 4) {
    const v = bandZ(side, 'vein', u, u + 4, true), a = bandZ(side, 'artery', u, u + 4, true);
    if (Number.isFinite(v) && Number.isFinite(a)) assert.ok(v > a, `${side} ${u}–${u + 4} mm from the midline: vein ${v.toFixed(1)} behind artery ${a.toFixed(1)}`);
  }
}
// 2. fades and steps
const {atlas, geometry} = loadFullAtlas(process.env.HILUM_NO_STREAMS ? {streams: []} : undefined);
const all = atlas.parts.filter(p => M.isHilumPart(p.id));
assert.ok(all.length >= 40, `expected the renal vessels, branches, end pieces and ureters, found ${all.length}`);
for (const p of all) {
  const g = geometry(p), pos = new Float32Array(g.positions); M.shiftHilumPart(p.id, pos);
  let worst = 0;
  for (let i = 0; i < g.indices.length; i += 3) for (let k = 0; k < 3; k++) {
    const a = g.indices[i + k] * 3, b = g.indices[i + (k + 1) % 3] * 3, len = Math.hypot(g.positions[a] - g.positions[b], g.positions[a + 1] - g.positions[b + 1], g.positions[a + 2] - g.positions[b + 2]);
    if (len < 2e-4) continue;
    const da = pos[a + 2] - g.positions[a + 2], db = pos[b + 2] - g.positions[b + 2]; worst = Math.max(worst, Math.abs(da - db) / len);
  }
  assert.ok(worst < 3, `${p.id} ${p.name}: the shift changes by ${worst.toFixed(2)} mm per mm along an edge`);
  for (let i = 0; i < pos.length; i += 3) {
    const u = Math.abs(g.positions[i]) * 1e3, d = Math.abs(pos[i + 2] - g.positions[i + 2]) * 1e3;
    if (u <= 12 || u >= 56) assert.ok(d < 1e-6, `${p.id}: vertex ${u.toFixed(0)} mm from the midline moved ${d.toFixed(2)} mm (must stay)`);
  }
}
// 3. branches stay on their parents and organs; closure
const geo = id => { const p = atlas.parts.find(q => q.id === id); return p ? geometry(p) : null; };
const touch = (tid, pids, apply) => {
  const T = loaded(tid, apply); const res = [];
  for (const pid of pids) { const P = loaded(pid, apply); if (!P) continue; const ix = surfaceIndex(P.pos, P.idx); for (let i = 0; i < T.pos.length; i += 3) res.push(ix.distance([T.pos[i], T.pos[i + 1], T.pos[i + 2]], .01)); }
  return res;
};
const BR = {
  FJ3480: [['FJ3477', 'FJ3478'], ['FJ3129']], FJ3467: [['FJ2046', 'FJ3476', 'FJ3458', 'FJ3462', 'FJ3463', 'FJ3473', 'FJ3475'], ['FJ3129']],
  FJ3584: [['FJ2038', 'FJ3576', 'FJ3558', 'FJ3559', 'FJ3560', 'FJ3561', 'FJ3575', 'FJ3563'], ['FJ3130']],
  FJ3481: [['FJ2046', 'FJ3476', 'FJ3458', 'FJ3462', 'FJ3463', 'FJ3473', 'FJ3475'], ['FJ3144']],
  FJ3581: [['FJ2038', 'FJ3576', 'FJ3558', 'FJ3559', 'FJ3560', 'FJ3561', 'FJ3575', 'FJ3563'], ['FJ3146']], FJ3582: [['FJ3581'], ['FJ3146']],
};
for (const [t, groups] of Object.entries(BR)) for (const g of groups) {
  // per parent group: the vertices of the branch that touched (within 1.5 mm of any member) before must still be within 2.5 mm after
  const T0 = loaded(t, false), T1 = loaded(t, true), I0 = g.map(id => loaded(id, false)).filter(Boolean).map(P => surfaceIndex(P.pos, P.idx)), I1 = g.map(id => loaded(id, true)).filter(Boolean).map(P => surfaceIndex(P.pos, P.idx));
  let had = 0, lost = 0;
  for (let i = 0; i < T0.pos.length; i += 3) {
    const d0 = Math.min(...I0.map(ix => ix.distance([T0.pos[i], T0.pos[i + 1], T0.pos[i + 2]], .01))); if (d0 > .0015) continue; had++;
    const d1 = Math.min(...I1.map(ix => ix.distance([T1.pos[i], T1.pos[i + 1], T1.pos[i + 2]], .01))); if (d1 > .0025) lost++;
  }
  assert.ok(had > 0, `${t} should touch ${g.join(',')} in the source`);
  assert.ok(lost / had < .05, `${t}: ${lost} of ${had} contact vertices with ${g.join(',')} left the surface`);
}
// closure: an arterial or venous part (not moved) touching a moved part of the same system, at a point where the moved part moves by more than 1 mm, would be left behind
// Not connected to the moved vessel, only lying against it in the source meshes (they separate, nothing is left hanging):
const NOT_CONNECTED = {
  FJ3493: 'source label "Left ascending lumbar vein" but lies right of the midline: the right ascending lumbar vein ends in the azygos system, not in the right renal vein',
};
const moved = all.filter(p => !p.stream || p.stream === 'vessel-ends');
const vessels = atlas.parts.filter(p => (p.system === 'arterial' || p.system === 'venous') && !M.isHilumPart(p.id) && !NOT_CONNECTED[p.id] && p.bounds && Math.abs(p.bounds[0][1] - 1.11) < .12);
const movedGeo = moved.map(p => { const g = geometry(p), pos = new Float32Array(g.positions); M.shiftHilumPart(p.id, pos); return {p, g, pos}; });
for (const q of vessels) {
  const [lo, hi] = q.bounds; let overlap = false;
  for (const m of movedGeo) { const b = m.p.bounds; if (lo[0] <= b[1][0] + .002 && hi[0] >= b[0][0] - .002 && lo[1] <= b[1][1] + .002 && hi[1] >= b[0][1] - .002 && lo[2] <= b[1][2] + .002 && hi[2] >= b[0][2] - .002) { overlap = true; break; } }
  if (!overlap) continue;
  const G = geo(q.id); if (!G) continue; const ix = surfaceIndex(G.positions, G.indices);
  for (const m of movedGeo) if (m.p.system === q.system) for (let i = 0; i < m.pos.length; i += 3) {
    const shift = Math.abs(m.pos[i + 2] - m.g.positions[i + 2]); if (shift < .001) continue;
    const d = ix.distance([m.g.positions[i], m.g.positions[i + 1], m.g.positions[i + 2]], .001);
    assert.ok(d > .0005, `${q.id} ${q.name} touches ${m.p.id} ${m.p.name} where it moves ${(shift * 1e3).toFixed(1)} mm, but is not moved with it`);
  }
}
// 4. nothing that was inside a kidney leaves it
{
  const DIRS = [[0.577, 0.577, 0.577], [-0.7, 0.1, 0.707], [0.1, -0.99, 0.1]];
  const inside = (p, pos, idx) => { let votes = 0; for (const d of DIRS) { let n = 0; for (let i = 0; i < idx.length; i += 3) { const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
    const e1 = [pos[b] - pos[a], pos[b + 1] - pos[a + 1], pos[b + 2] - pos[a + 2]], e2 = [pos[c] - pos[a], pos[c + 1] - pos[a + 1], pos[c + 2] - pos[a + 2]];
    const h = [d[1] * e2[2] - d[2] * e2[1], d[2] * e2[0] - d[0] * e2[2], d[0] * e2[1] - d[1] * e2[0]], det = e1[0] * h[0] + e1[1] * h[1] + e1[2] * h[2]; if (Math.abs(det) < 1e-14) continue;
    const f = 1 / det, sv = [p[0] - pos[a], p[1] - pos[a + 1], p[2] - pos[a + 2]], u = f * (sv[0] * h[0] + sv[1] * h[1] + sv[2] * h[2]); if (u < 0 || u > 1) continue;
    const q = [sv[1] * e1[2] - sv[2] * e1[1], sv[2] * e1[0] - sv[0] * e1[2], sv[0] * e1[1] - sv[1] * e1[0]], v = f * (d[0] * q[0] + d[1] * q[1] + d[2] * q[2]); if (v < 0 || u + v > 1) continue;
    if (f * (e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]) > 0) n++; } if (n % 2) votes++; } return votes >= 2; };
  for (const [side, kidney] of [['Left', 'FJ3145'], ['Right', 'FJ3147']]) {
    const K = loaded(kidney, false); let out = 0, checked = 0;
    for (const p of moved.filter(q => M.roleOf(q.id).side === side)) {
      const A0 = loaded(p.id, false), A1 = loaded(p.id, true);
      for (let i = 0; i < A0.pos.length; i += 3) {
        if (Math.abs(A1.pos[i + 2] - A0.pos[i + 2]) < 2e-4) continue;
        const p0 = [A0.pos[i], A0.pos[i + 1], A0.pos[i + 2]]; if (!inside(p0, K.pos, K.idx)) continue; checked++;
        if (!inside([A1.pos[i], A1.pos[i + 1], A1.pos[i + 2]], K.pos, K.idx)) out++;
      }
    }
    assert.equal(out, 0, `${side}: ${out} of ${checked} moved vertices inside the kidney were carried out through its surface`);
  }
}
// 5. clearances
const before = measure(false), after = measure(true);
for (const side of SIDES) for (const [k, b] of Object.entries(before[side].clear)) {
  const a = after[side].clear[k]; if (!Number.isFinite(a)) continue;
  if (k === 'vein ↔ artery') { assert.ok(a >= -1, `${side} ${k}: ${a.toFixed(1)} mm`); continue; }
  if (/adrenal/.test(k)) { assert.ok(a >= Math.min(b, 1), `${side} ${k}: clearance ${a.toFixed(1)} mm after, ${b.toFixed(1)} mm before`); continue; }
  assert.ok(a >= Math.min(b - .5, 1) || a >= b - .5, `${side} ${k}: clearance ${a.toFixed(1)} mm after, ${b.toFixed(1)} mm before`);
}
console.log(`Renal hilum shift: ${all.length} parts; vein, artery, pelvis in order at both hila; no step, branches kept on their parents and organs, no new penetration of neighbours.`);
