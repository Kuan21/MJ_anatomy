// Renal hilum order (AB-01): front-to-back position of the renal vein, renal artery and renal pelvis near the hilum, before and after the load-time shift of
// app/biomechanics-v2/renal-hilum-shift.ts (the code the viewer runs), and wall-to-wall clearance against the neighbouring organs. Prints a table; `measure()` is used by the test.
// Usage: node scripts/measure-renal-hilum.mjs
import {quizModule} from './quiz-modules.mjs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {surfaceIndex} from './lib/surface-distance.mjs';
export const M = await quizModule('app/biomechanics-v2/renal-hilum-shift.ts');
const {atlas, geometry} = loadFullAtlas(process.env.HILUM_NO_STREAMS ? {streams: []} : undefined);
const parts = atlas.parts.filter(p => !p.stream || p.stream === 'vessel-ends');
const byId = new Map(parts.map(p => [p.id, p]));
/** Geometry of a part as the viewer sees it (metres); `apply` false: the source. */
export function loaded(id, apply = true) {
  const p = byId.get(id); if (!p) return null;
  const g = geometry(p), pos = new Float32Array(g.positions); if (apply) M.shiftHilumPart(id, pos);
  return {id, name: p.name, pos, idx: g.indices};
}
const ids = (side, role) => M.PARTS[side][role].flatMap(id => [id, id + '-END']).filter(id => byId.has(id));
/** The first n parts of a role (renal vein trunk and hilum part; renal artery, its trunk and first divisions), with their end pieces. */
const main = (side, role, n) => M.PARTS[side][role].slice(0, n).flatMap(id => [id, id + '-END']).filter(id => byId.has(id));
/** Hilum slabs: lateral distance band (mm) where the three meet. */
export const HILUM = {Left: [30, 42], Right: [30, 42]};
const median = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : NaN; };
/** Median z (mm) of a role in a lateral band, within the hilum height (and above PELVIS_Y[1] for the pelvis). */
export function bandZ(side, role, lo, hi, apply) {
  const s = M.SPEC[side], sg = side === 'Left' ? 1 : -1, zs = [];
  for (const id of ids(side, role)) {
    const {pos} = loaded(id, apply);
    for (let i = 0; i < pos.length; i += 3) {
      const u = pos[i] * 1e3 * sg, y = pos[i + 1] * 1e3;
      if (u < lo || u >= hi || Math.abs(y - s.y) > 20) continue;
      if (role === 'pelvis' && y < M.PELVIS_Y[1]) continue;
      if (role === 'artery' && /segmental|suprarenal|Ureteric/.test(byId.get(id.replace(/-END$/, '')).name)) continue;
      zs.push(pos[i + 2] * 1e3);
    }
  }
  return median(zs);
}
const DIRS = [[0.577, 0.577, 0.577], [-0.7, 0.1, 0.707], [0.1, -0.99, 0.1]];
/** Parity inside test (two of three rays agree): is point p inside the closed surface (pos, idx)? */
function inside(p, pos, idx) {
  let votes = 0;
  for (const d of DIRS) {
    let n = 0;
    for (let i = 0; i < idx.length; i += 3) {
      const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
      const e1 = [pos[b] - pos[a], pos[b + 1] - pos[a + 1], pos[b + 2] - pos[a + 2]], e2 = [pos[c] - pos[a], pos[c + 1] - pos[a + 1], pos[c + 2] - pos[a + 2]];
      const h = [d[1] * e2[2] - d[2] * e2[1], d[2] * e2[0] - d[0] * e2[2], d[0] * e2[1] - d[1] * e2[0]], det = e1[0] * h[0] + e1[1] * h[1] + e1[2] * h[2];
      if (Math.abs(det) < 1e-14) continue;
      const f = 1 / det, sv = [p[0] - pos[a], p[1] - pos[a + 1], p[2] - pos[a + 2]], u = f * (sv[0] * h[0] + sv[1] * h[1] + sv[2] * h[2]); if (u < 0 || u > 1) continue;
      const q = [sv[1] * e1[2] - sv[2] * e1[1], sv[2] * e1[0] - sv[0] * e1[2], sv[0] * e1[1] - sv[1] * e1[0]], v = f * (d[0] * q[0] + d[1] * q[1] + d[2] * q[2]); if (v < 0 || u + v > 1) continue;
      if (f * (e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]) > 0) n++;
    }
    if (n % 2) votes++;
  }
  return votes >= 2;
}
/** Is the mesh closed (every edge shared by exactly two triangles after welding vertices within 0.01 mm)? The parity inside test is used only on closed meshes. */
const closedCache = new Map();
export function closed(pos, idx) {
  const key = i => `${Math.round(pos[i * 3] * 1e5)},${Math.round(pos[i * 3 + 1] * 1e5)},${Math.round(pos[i * 3 + 2] * 1e5)}`, ids = new Map(), w = i => { const k = key(i); if (!ids.has(k)) ids.set(k, ids.size); return ids.get(k); };
  const edges = new Map();
  for (let i = 0; i < idx.length; i += 3) for (let k = 0; k < 3; k++) { const a = w(idx[i + k]), b = w(idx[i + (k + 1) % 3]); if (a === b) continue; const e = a < b ? a + ':' + b : b + ':' + a; edges.set(e, (edges.get(e) || 0) + 1); }
  for (const n of edges.values()) if (n !== 2) return false;
  return true;
}
/** Smallest wall-to-wall distance (mm; negative: depth of the deepest vertex inside) from the vertices of `a` parts to the surface of `b` parts, restricted to the hilum region. */
export function clearance(side, aIds, bIds, apply = true) {
  const sg = side === 'Left' ? 1 : -1, s = M.SPEC[side];
  let best = Infinity, where = null;
  for (const bid of bIds) {
    const B = loaded(bid, apply) ?? null; if (!B) continue;
    const index = surfaceIndex(B.pos, B.idx), sealed = closedCache.get(bid) ?? closedCache.set(bid, closed(B.pos, B.idx)).get(bid);
    clearance.open ??= new Set(); if (!sealed) clearance.open.add(B.name);
    for (const aid of aIds) {
      const A = loaded(aid, apply); if (!A) continue;
      for (let i = 0; i < A.pos.length; i += 3) {
        const u = A.pos[i] * 1e3 * sg, y = A.pos[i + 1] * 1e3;
        if (u < 10 || u > 56 || Math.abs(y - s.y) > s.outer) continue;
        const q = [A.pos[i], A.pos[i + 1], A.pos[i + 2]], d0 = index.distance(q, .02);
        if (d0 === Infinity && best < .02) continue;
        const d = sealed && d0 < .02 && inside(q, B.pos, B.idx) ? -d0 : d0;
        if (d < best) { best = d; where = [Math.round(u), Math.round(y), Math.round(A.pos[i + 2] * 1e3), aid]; }
      }
    }
  }
  if (process.env.HILUM_WHERE && where) clearance.last = where;
  return best * 1e3;
}
export const NEIGHBOURS = {
  Left: {Pancreas: ['FJ1895', 'FJ2629'], 'Abdominal aorta': ['FJ1932'], 'Superior mesenteric artery': ['FJ1928'], 'Left kidney': ['FJ3145'], 'Left psoas major': ['FJ1431M'], 'Left adrenal gland': ['FJ3129'], 'Descending colon': ['FJ2567'], Duodenum: ['FJ2573'], 'Left testicular artery': ['FJ3532'], 'Left middle suprarenal artery': ['FJ3472']},
  Right: {'Right kidney': ['FJ3147'], Duodenum: ['FJ2573'], 'Right psoas major': ['FJ1431'], 'Right adrenal gland': ['FJ3130'], 'Abdominal aorta': ['FJ1932'], Pancreas: ['FJ1895', 'FJ2629'], 'Right testicular vein': ['FJ3618'], 'Right testicular artery': ['FJ3617'], 'Right suprarenal vein': ['FJ3580'], 'Right middle suprarenal artery': ['FJ3586']},
};
const IVC = parts.filter(p => /inferior vena cava/i.test(p.name) && !p.stream).map(p => p.id);
NEIGHBOURS.Right['Inferior vena cava'] = IVC; NEIGHBOURS.Left['Inferior vena cava'] = IVC;
export function measure(apply) {
  const out = {};
  for (const side of ['Left', 'Right']) {
    const [lo, hi] = HILUM[side], o = out[side] = {bands: [], clear: {}};
    for (let u = 8; u < 56; u += 4) o.bands.push({u, vein: bandZ(side, 'vein', u, u + 4, apply), artery: bandZ(side, 'artery', u, u + 4, apply), pelvis: bandZ(side, 'pelvis', u, u + 4, apply)});
    o.hilum = {vein: bandZ(side, 'vein', lo, hi, apply), artery: bandZ(side, 'artery', lo, hi, apply), pelvis: bandZ(side, 'pelvis', lo, hi, apply)};
    o.where = {}; const C = o.clear; o.clear = new Proxy(C, {set(t, k, v) { t[k] = v; if (clearance.last) o.where[k] = clearance.last; clearance.last = null; return true; }});
    o.clear['vein ↔ artery'] = clearance(side, main(side, 'vein', 2), main(side, 'artery', 4), apply);
    o.clear['artery ↔ pelvis'] = clearance(side, main(side, 'artery', 4), ids(side, 'pelvis'), apply);
    for (const [name, nb] of Object.entries(NEIGHBOURS[side])) o.clear['vein ↔ ' + name] = clearance(side, main(side, 'vein', 2), nb, apply);
    for (const [name, nb] of Object.entries(NEIGHBOURS[side])) o.clear['artery ↔ ' + name] = clearance(side, main(side, 'artery', 4), nb, apply);
  }
  return out;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const before = measure(false), after = measure(true), f = v => Number.isFinite(v) ? v.toFixed(1) : '—';
  for (const side of ['Left', 'Right']) {
    console.log(`\n## ${side}: median z (mm, + is anterior) by lateral distance from the midline; before → after`);
    console.log('| u (mm) | vein | artery | pelvis |\n|---|---|---|---|');
    before[side].bands.forEach((b, i) => { const a = after[side].bands[i]; console.log(`| ${b.u}–${b.u + 4} | ${f(b.vein)} → ${f(a.vein)} | ${f(b.artery)} → ${f(a.artery)} | ${f(b.pelvis)} → ${f(a.pelvis)} |`); });
    const h0 = before[side].hilum, h1 = after[side].hilum;
    console.log(`hilum ${HILUM[side].join('–')} mm: vein ${f(h0.vein)} → ${f(h1.vein)}, artery ${f(h0.artery)} → ${f(h1.artery)}, pelvis ${f(h0.pelvis)} → ${f(h1.pelvis)}`);
    console.log('| clearance (mm, wall to wall; 0 = touching or inside) | before | after |\n|---|---|---|');
    if (side === 'Right') console.log('\nopen meshes (no inside test, distance only): ' + [...clearance.open].sort().join(', '));
    for (const k of Object.keys(before[side].clear)) console.log(`| ${k} | ${f(before[side].clear[k])} | ${f(after[side].clear[k])} |` + (after[side].where?.[k] ? ' ' + after[side].where[k].join(' ') : ''));
  }
}
