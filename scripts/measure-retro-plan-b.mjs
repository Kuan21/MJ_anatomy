// Read-only pre-check of plan B in docs/retropharyngeal-survey.md (pharynx plus larynx moved forward): nothing is changed, nothing is written.
//   node scripts/measure-retro-plan-b.mjs [--md]
// The displacement fields below are applied to copies of the vertices (z only, height-dependent); the script then reports, for every moved mesh,
// (1) how much its triangles stretch (new edge length / old edge length), (2) the smallest distance and the number of vertices inside a closed neighbour,
// before and after the move, against the neighbours that stay where they are (vertebrae, prevertebral muscles, skin, platysma, strap muscles, vessels, nerves, oesophagus),
// (3) the same between the moved pharynx and the moved larynx. Coordinates: metres in the rest frame, output mm (x 1000), z > 0 anterior.
// Variants: V1 = the survey's field (larynx +5.9 at C5, +3.4 at C6, 0 above C4-C5; shear), V2 = the larynx cartilages and muscles moved as one rigid block (+5.9 mm).
import {loadWorld} from './lib/paokao-world.mjs';
const w = loadWorld({paokao: true});
const byId = id => w.entries.find(e => e.id === id);
const geom = id => { const e = byId(id); if (!e) throw new Error('no ' + id); const g = e.load(); return {P: Float32Array.from(g.positions), I: Uint32Array.from(g.indices)}; };
const lerpTable = (t, y) => { // t = [[y_mm, dz_mm], ...] sorted by y descending; clamp outside
  if (y >= t[0][0]) return t[0][1]; if (y <= t[t.length - 1][0]) return t[t.length - 1][1];
  for (let i = 0; i < t.length - 1; i++) if (y <= t[i][0] && y >= t[i + 1][0]) { const f = (t[i][0] - y) / (t[i][0] - t[i + 1][0]); return t[i][1] + f * (t[i + 1][1] - t[i][1]); } };
const PHAR = [[1580, 0], [1550, .1], [1540, 1.0], [1530, 2.2], [1520, 3.5], [1510, 4.0], [1500, 5.2], [1490, 6.3], [1480, 7.7], [1470, 8.4], [1455, 4.0], [1440, 0]];
const LAR_V1 = [[1520, 0], [1500, 0], [1490, 0], [1480, 5.9], [1470, 3.4], [1465, 3.4], [1440, 0]];
const LAR_V2 = [[1520, 0], [1505, 5.9], [1465, 5.9], [1440, 0]];   // rigid block above 1465 (the cartilage spans 1465 to 1509); fades in the trachea below
const groups = {
  pharynx: ['FJ2749', 'FJ2740', 'FJ2752', 'FJ2742', 'FJ2754', 'FJ2743', 'FJ2755', 'FJ2746', 'FJ2758', 'FJ2747', 'FJ2759'],
  larynx: ['FJ2440', 'FJ2769', 'FJ2808', 'FJ2770', 'FJ2771', 'FJ2773', 'FJ2774', 'FJ2775', 'FJ2776', 'FJ2777', 'FJ2778', 'FJ2780', 'FJ2781', 'FJ2782', 'FJ2783', 'FJ2784', 'FJ2785', 'FJ2787', 'FJ2788', 'FJ2789', 'FJ2791', 'FJ2792', 'FJ2793', 'FJ2794', 'FJ2795', 'FJ2796', 'FJ2798', 'FJ2799', 'FJ2800', 'FJ2801', 'FJ2802', 'FJ2803', 'FJ2805', 'FJ2806', 'FJ2807', 'FJ2809'],
  larynxMembranes: ['FJ2786', 'FJ2804', 'FJ2790', 'FJ2779', 'FJ2797'],   // thyrohyoid membranes and lateral thyrohyoid ligaments: the lower edge moves with the larynx, the upper edge stays with the hyoid
  tracheaOesophagus: ['FJ2541', 'FJ2563'],
};
const fixed = {
  'vertebrae and discs (closed)': ['FJ3161', 'FJ3164', 'FJ3167', 'FJ3170', 'FJ3172', 'FJ3158', 'FJ3177', 'FJ3213', 'FJ3218', 'FJ3219', 'FJ3220', 'FJ3221'],
  'prevertebral muscles': ['FJ1557', 'FJ1561', 'FJ1582', 'FJ1600', 'FJ1601', 'BP3S-FMA46283', 'BP3S-FMA46285', 'BP3S-FMA46287'],
  'hyoid (closed)': ['FJ2772', 'FJ3201'],
  'skin (closed)': ['FJ2810'],
  'platysma': ['FJ1558', 'FJ1587'],
  'strap muscles': ['FJ1565', 'FJ1574', 'FJ1575', 'FJ1577', 'FJ1586', 'FJ1596', 'FJ1597', 'FJ1599'],
  'carotid, jugular vein': ['FJ3483', 'FJ3564', 'FJ3485', 'FJ3585'],
  'vagus, sympathetic trunk': ['Vagus nerve (X).r.001', 'Vagus nerve (X).l.001', 'Sympathetic trunk.r.001', 'Sympathetic trunk.l.001'],
  'inferior thyroid artery': ['FJ2209', 'FJ2210'],
  'recurrent laryngeal nerve (generated)': ['PK-14', 'PK-25'],
};
const ys = P => { let lo = 1e9, hi = -1e9; for (let i = 1; i < P.length; i += 3) { lo = Math.min(lo, P[i]); hi = Math.max(hi, P[i]); } return [lo, hi]; };
const move = (g, table) => { const Q = Float32Array.from(g.P); for (let i = 0; i < Q.length; i += 3) Q[i + 2] += lerpTable(table, Q[i + 1] * 1e3) / 1e3; return Q; };
function stretch(g, Q) {
  let worst = 1, n = 0, bad = 0;
  for (let t = 0; t < g.I.length; t += 3) for (const [a, b] of [[0, 1], [1, 2], [2, 0]]) {
    const i = g.I[t + a] * 3, j = g.I[t + b] * 3, d0 = Math.hypot(g.P[i] - g.P[j], g.P[i + 1] - g.P[j + 1], g.P[i + 2] - g.P[j + 2]); if (d0 < 2e-4) continue;
    const d1 = Math.hypot(Q[i] - Q[j], Q[i + 1] - Q[j + 1], Q[i + 2] - Q[j + 2]), r = d1 / d0; n++; worst = Math.max(worst, r, 1 / r); if (r > 1.3 || r < .77) bad++;
  }
  return {worst, badPct: n ? 100 * bad / n : 0};
}
// distance from points to the triangles of (P, I) near them
const triNear = (g, lo, hi, m) => { const out = []; for (let t = 0; t < g.I.length; t += 3) { let ok = true; for (let k = 0; k < 3 && ok; k++) { const i = g.I[t + k] * 3; ok = g.P[i] > lo[0] - m && g.P[i] < hi[0] + m && g.P[i + 1] > lo[1] - m && g.P[i + 1] < hi[1] + m && g.P[i + 2] > lo[2] - m && g.P[i + 2] < hi[2] + m; } if (ok || true) { const a = g.I[t] * 3, b = g.I[t + 1] * 3, c = g.I[t + 2] * 3; const xs = [g.P[a], g.P[b], g.P[c]], yv = [g.P[a + 1], g.P[b + 1], g.P[c + 1]], zs = [g.P[a + 2], g.P[b + 2], g.P[c + 2]]; if (Math.max(...xs) < lo[0] - m || Math.min(...xs) > hi[0] + m || Math.max(...yv) < lo[1] - m || Math.min(...yv) > hi[1] + m || Math.max(...zs) < lo[2] - m || Math.min(...zs) > hi[2] + m) continue; out.push(t); } } return out; };
function triDist(p, P, a, b, c) {
  const ab = [P[b] - P[a], P[b + 1] - P[a + 1], P[b + 2] - P[a + 2]], ac = [P[c] - P[a], P[c + 1] - P[a + 1], P[c + 2] - P[a + 2]], ap = [p[0] - P[a], p[1] - P[a + 1], p[2] - P[a + 2]];
  const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2], d1 = dot(ab, ap), d2 = dot(ac, ap);
  const at = q => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  const A = [P[a], P[a + 1], P[a + 2]], B = [P[b], P[b + 1], P[b + 2]], C = [P[c], P[c + 1], P[c + 2]];
  if (d1 <= 0 && d2 <= 0) return at(A);
  const bp = [p[0] - B[0], p[1] - B[1], p[2] - B[2]], d3 = dot(ab, bp), d4 = dot(ac, bp); if (d3 >= 0 && d4 <= d3) return at(B);
  const vc = d1 * d4 - d3 * d2; if (vc <= 0 && d1 >= 0 && d3 <= 0) { const f = d1 / (d1 - d3); return at([A[0] + f * ab[0], A[1] + f * ab[1], A[2] + f * ab[2]]); }
  const cp = [p[0] - C[0], p[1] - C[1], p[2] - C[2]], d5 = dot(ab, cp), d6 = dot(ac, cp); if (d6 >= 0 && d5 <= d6) return at(C);
  const vb = d5 * d2 - d1 * d6; if (vb <= 0 && d2 >= 0 && d6 <= 0) { const f = d2 / (d2 - d6); return at([A[0] + f * ac[0], A[1] + f * ac[1], A[2] + f * ac[2]]); }
  const va = d3 * d6 - d5 * d4; if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) { const f = (d4 - d3) / ((d4 - d3) + (d5 - d6)); return at([B[0] + f * (C[0] - B[0]), B[1] + f * (C[1] - B[1]), B[2] + f * (C[2] - B[2])]); }
  const den = 1 / (va + vb + vc), v = vb * den, ww = vc * den; return at([A[0] + ab[0] * v + ac[0] * ww, A[1] + ab[1] * v + ac[1] * ww, A[2] + ab[2] * v + ac[2] * ww]);
}
function gap(Pm, gm, Pf, gf, step) {   // smallest vertex-to-surface distance (moved vertices to fixed triangles), mm, and how many sampled vertices lie within 0.5 mm
  let lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (let i = 0; i < Pm.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], Pm[i + k]); hi[k] = Math.max(hi[k], Pm[i + k]); }
  const tris = triNear({P: Pf, I: gf.I}, lo, hi, .006); let min = 1e9, near = 0, n = 0;
  if (!tris.length) return {min: null, near: 0, n: 0};
  for (let i = 0; i < Pm.length; i += 3 * step) { const p = [Pm[i], Pm[i + 1], Pm[i + 2]]; let d = 1e9; for (const t of tris) d = Math.min(d, triDist(p, Pf, gf.I[t] * 3, gf.I[t + 1] * 3, gf.I[t + 2] * 3)); n++; min = Math.min(min, d); if (d < .0005) near++; }
  return {min: min * 1e3, near, n};
}
// the survey's own layer chain in the midline band (|x| < 12 mm, slab +-2.5 mm): prevertebral muscle front, pharyngeal raphe back and front, rearmost larynx / hyoid cartilage; after the move
const loadCache = {};
const band = (P, y, lo, hi, pick) => { let v = null; for (let i = 0; i < P.length; i += 3) { if (Math.abs(P[i + 1] * 1e3 - y) > 2.5 || Math.abs(P[i]) * 1e3 > 12) continue; const z = P[i + 2] * 1e3; v = v == null ? z : pick(v, z); } return v; };
const chain = (variant, Q) => {
  const rows = [], front = ids => y => ids.map(i => band(Q[i] ?? loadCache[i].P, y, 0, 0, Math.max)).filter(x => x != null);
  for (const y of [1550, 1530, 1510, 1490, 1480, 1470]) {
    const pm = ['FJ1557', 'FJ1561', 'FJ1582', 'FJ1600', 'FJ1601', 'BP3S-FMA46283', 'BP3S-FMA46285', 'BP3S-FMA46287'].map(i => band(loadCache[i].P, y, 0, 0, Math.max)).filter(x => x != null), rb = band(Q.FJ2749 ?? loadCache.FJ2749.P, y, 0, 0, Math.min), rf = band(Q.FJ2749 ?? loadCache.FJ2749.P, y, 0, 0, Math.max);
    const lr = ['FJ2772', 'FJ2808', 'FJ2440', 'FJ2775', 'FJ2792'].map(i => band(Q[i] ?? loadCache[i].P, y, 0, 0, Math.min)).filter(x => x != null);
    rows.push(`| ${y} | ${pm.length ? f1(Math.max(...pm)) : '—'} | ${f1(rb)}～${f1(rf)} | ${lr.length ? f1(Math.min(...lr)) : '—'} | ${rf != null && lr.length ? f1(Math.min(...lr) - rf) : '—'} | ${pm.length && rb != null ? f1(rb - Math.max(...pm)) : '—'} |`);
  }
  return rows;
};

const load = id => { const g = geom(id); loadCache[id] = g; return {id, name: byId(id).name, ...g}; };
const field = {V1: {pharynx: PHAR, larynx: LAR_V1, larynxMembranes: LAR_V1, tracheaOesophagus: LAR_V1}, V2: {pharynx: PHAR, larynx: LAR_V2, larynxMembranes: LAR_V2, tracheaOesophagus: LAR_V2}};
const md = process.argv.includes('--md'); const f1 = v => v == null ? '—' : v.toFixed(1);
const moved = {}; for (const [g, ids] of Object.entries(groups)) moved[g] = ids.map(load);
for (const id of ['FJ1557', 'FJ1561', 'FJ1582', 'FJ1600', 'FJ1601', 'BP3S-FMA46283', 'BP3S-FMA46285', 'BP3S-FMA46287', 'FJ2772', 'FJ2808', 'FJ2440', 'FJ2775', 'FJ2792']) if (!loadCache[id]) load(id);
const fx = {}; for (const [g, ids] of Object.entries(fixed)) fx[g] = ids.map(id => { try { return load(id); } catch { return null; } }).filter(Boolean);
for (const v of ['V1', 'V2']) {
  console.log(`\n## ${v}: ${v === 'V1' ? 'survey field (shear)' : 'larynx moved as one rigid block'}`);
  console.log('\n### Triangle stretch of the moved meshes (new / old edge length)\n| group | mesh | worst ratio | % edges beyond 1.3 or 0.77 |\n|---|---|---|---|');
  const Q = {}; for (const [g, list] of Object.entries(moved)) for (const m of list) { const q = move(m, field[v][g]); Q[m.id] = q; const s = stretch(m, q); if (s.worst > 1.15) console.log(`| ${g} | ${m.name} (${m.id}) | ${s.worst.toFixed(2)} | ${s.badPct.toFixed(1)} |`); }
  console.log(`\n### Layer chain in the midline band after the move (z, mm; absolute, not relative to the vertebrae)\n| y | prevertebral muscle front | raphe back～front | rearmost larynx/hyoid | larynx rear minus raphe front (negative = overlap) | raphe back minus prevertebral front (negative = in the muscle) |\n|---|---|---|---|---|---|\n${chain(v, Q).join('\n')}`);
  console.log('\n### Moved structures against neighbours that stay (smallest vertex-to-surface distance in mm before -> after; sampled vertices within 0.5 mm before -> after)\n| moved group | neighbour group | before min | after min | near before | near after |\n|---|---|---|---|---|---|');
  for (const [g, list] of Object.entries(moved)) for (const [fg, flist] of Object.entries(fx)) {
    let b = {min: 1e9, near: 0}, a = {min: 1e9, near: 0};
    for (const m of list) for (const f of flist) { const gb = gap(m.P, m, f.P, f, 3), ga = gap(Q[m.id], m, f.P, f, 3); if (gb.min != null) { b.min = Math.min(b.min, gb.min); b.near += gb.near; } if (ga.min != null) { a.min = Math.min(a.min, ga.min); a.near += ga.near; } }
    if (b.min < 1e8 || a.min < 1e8) console.log(`| ${g} | ${fg} | ${f1(b.min < 1e8 ? b.min : null)} | ${f1(a.min < 1e8 ? a.min : null)} | ${b.near} | ${a.near} |`);
  }
  console.log('\n### Moved pharynx against moved larynx and moved trachea/oesophagus\n| pair | before min | after min | near before | near after |\n|---|---|---|---|---|');
  for (const [g1, g2] of [['pharynx', 'larynx'], ['pharynx', 'tracheaOesophagus'], ['larynx', 'tracheaOesophagus']]) {
    let b = {min: 1e9, near: 0}, a = {min: 1e9, near: 0};
    for (const m of moved[g1]) for (const f of moved[g2]) { const gb = gap(m.P, m, f.P, f, 3), ga = gap(Q[m.id], m, Q[f.id], f, 3); if (gb.min != null) { b.min = Math.min(b.min, gb.min); b.near += gb.near; } if (ga.min != null) { a.min = Math.min(a.min, ga.min); a.near += ga.near; } }
    console.log(`| ${g1} / ${g2} | ${f1(b.min < 1e8 ? b.min : null)} | ${f1(a.min < 1e8 ? a.min : null)} | ${b.near} | ${a.near} |`);
  }
}
