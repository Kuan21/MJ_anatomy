// Geometry defects of every mesh in the atlas as the app sees it (scripts/lib/full-atlas.mjs), on the rest pose. Only counts and names are printed.
//   fragment   (stability check b)  a connected piece (vertices welded by position, 0.01 mm) of at most 2 % of the mesh's triangles and at most 40 triangles that lies more than 6 mm from the biggest piece of the same mesh (sets of repeated structures have pieces of similar size and do not count; vessel-end connectors "...-END" are separate pieces by design and are checked by test-vessel-motion)
//   straightcut (stability check f) a boundary loop (edges used by one triangle only) of at least 8 vertices that is flat (RMS distance to its best plane <= FLAT_MM) and longer than CUT_MM: the mark of a mesh cut by a plane or a box
// Known defects are in docs/geometry-defects-baseline.json ("part id|kind" -> size). A new one, or a known one that grows, fails; fix the mesh instead of adding to the list. Defects that are real anatomy go in "allowed" with a reason.
//   node scripts/audit-geometry-defects.mjs [--write] [--list]
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadFullAtlas} from './lib/full-atlas.mjs';

const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
const FRAG_MM = 6, FRAG_FRAC = .02, FRAG_TRIS = 40, FLAT_MM = .4, CUT_MM = 25, MIN_LOOP = 8, WELD = 1e-5;
const write = process.argv.includes('--write'), list = process.argv.includes('--list');
const baseFile = file('docs/geometry-defects-baseline.json');
const base = fs.existsSync(baseFile) ? JSON.parse(fs.readFileSync(baseFile, 'utf8')) : {known: {}, allowed: {}};

const {atlas, geometry} = loadFullAtlas();
const defects = new Map();   // key -> {size, text, system}

function analyse(p) {
  const {positions: P, indices: I} = geometry(p), nv = P.length / 3;
  // weld vertices by position
  const id = new Int32Array(nv), map = new Map();
  let n = 0;
  for (let v = 0; v < nv; v++) {
    const k = Math.round(P[3 * v] / WELD) + ',' + Math.round(P[3 * v + 1] / WELD) + ',' + Math.round(P[3 * v + 2] / WELD);
    let w = map.get(k); if (w === undefined) { w = n++; map.set(k, w); } id[v] = w;
  }
  const pos = new Float64Array(n * 3);
  for (let v = 0; v < nv; v++) { pos[3 * id[v]] = P[3 * v]; pos[3 * id[v] + 1] = P[3 * v + 1]; pos[3 * id[v] + 2] = P[3 * v + 2]; }
  const nt = I.length / 3, tri = i => [id[I[3 * i]], id[I[3 * i + 1]], id[I[3 * i + 2]]];
  // union-find of triangles through shared welded vertices
  const parent = new Int32Array(n).map((_, i) => i), find = x => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  for (let i = 0; i < nt; i++) { const [a, b, c] = tri(i); if (a === b || b === c || a === c) continue; parent[find(a)] = find(b); parent[find(b)] = find(c); }
  const comp = new Map();
  for (let i = 0; i < nt; i++) { const [a, b, c] = tri(i); if (a === b || b === c || a === c) continue; const r = find(a); let e = comp.get(r); if (!e) comp.set(r, e = {tris: 0, verts: new Set(), min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9]}); e.tris++; for (const v of [a, b, c]) { e.verts.add(v); for (let d = 0; d < 3; d++) { e.min[d] = Math.min(e.min[d], pos[3 * v + d]); e.max[d] = Math.max(e.max[d], pos[3 * v + d]); } } }
  const out = [];
  if (comp.size > 1) {
    const all = [...comp.values()].sort((a, b) => b.tris - a.tris), big = all[0], total = nt;
    for (const c of all.slice(1)) {
      if (c.tris > FRAG_FRAC * total || c.tris > FRAG_TRIS) continue;
      // distance between the two boxes, a lower bound of the distance between the pieces
      let d2 = 0; for (let d = 0; d < 3; d++) { const g = Math.max(0, c.min[d] - big.max[d], big.min[d] - c.max[d]); d2 += g * g; }
      const mm = Math.sqrt(d2) * 1000;
      if (mm > FRAG_MM) out.push({kind: 'fragment', size: mm, text: `${c.tris} triangles, ${mm.toFixed(0)} mm from the main piece`});
    }
  }
  // boundary loops
  const ec = new Map();
  for (let i = 0; i < nt; i++) { const t = tri(i); if (t[0] === t[1] || t[1] === t[2] || t[0] === t[2]) continue; for (let k = 0; k < 3; k++) { const a = t[k], b = t[(k + 1) % 3], key = a < b ? a * n + b : b * n + a; ec.set(key, (ec.get(key) || 0) + 1); } }
  const adj = new Map();
  for (const [key, c] of ec) if (c === 1) { const a = Math.floor(key / n), b = key % n; (adj.get(a) || adj.set(a, []).get(a)).push(b); (adj.get(b) || adj.set(b, []).get(b)).push(a); }
  const seen = new Set();
  for (const s of adj.keys()) {
    if (seen.has(s)) continue;
    // walk the loop (stop on branching vertices: ragged boundary, not a clean cut)
    const loop = [s]; seen.add(s); let prev = -1, cur = s, ok = true;
    for (;;) { const nb = adj.get(cur).filter(x => x !== prev); if (adj.get(cur).length !== 2) { ok = false; } const nx = nb.find(x => x !== loop[0] || loop.length > 2); if (nx === undefined || seen.has(nx)) break; loop.push(nx); seen.add(nx); prev = cur; cur = nx; }
    if (!ok || loop.length < MIN_LOOP) continue;
    let per = 0; for (let i = 0; i < loop.length; i++) { const a = loop[i], b = loop[(i + 1) % loop.length]; per += Math.hypot(pos[3 * a] - pos[3 * b], pos[3 * a + 1] - pos[3 * b + 1], pos[3 * a + 2] - pos[3 * b + 2]); }
    if (per * 1000 < CUT_MM) continue;
    // best plane through the centroid: smallest eigenvector of the covariance (power iteration on the inverse is overkill; use the cross-product normal of the two longest spread axes)
    let cx = 0, cy = 0, cz = 0; for (const v of loop) { cx += pos[3 * v]; cy += pos[3 * v + 1]; cz += pos[3 * v + 2]; } cx /= loop.length; cy /= loop.length; cz /= loop.length;
    const C = [0, 0, 0, 0, 0, 0]; for (const v of loop) { const x = pos[3 * v] - cx, y = pos[3 * v + 1] - cy, z = pos[3 * v + 2] - cz; C[0] += x * x; C[1] += x * y; C[2] += x * z; C[3] += y * y; C[4] += y * z; C[5] += z * z; }
    const rms = planeRms(C, loop.length);
    if (rms * 1000 <= FLAT_MM) out.push({kind: 'straightcut', size: per * 1000, text: `flat boundary loop of ${loop.length} vertices, ${(per * 1000).toFixed(0)} mm around, ${(rms * 1000).toFixed(2)} mm off its plane`});
  }
  return out;
}
// smallest eigenvalue of the symmetric covariance [xx,xy,xz,yy,yz,zz] = RMS distance to the best plane (closed form for 3x3)
function planeRms(C, n) {
  const [xx, xy, xz, yy, yz, zz] = C, q = (xx + yy + zz) / 3, p1 = xy * xy + xz * xz + yz * yz;
  if (p1 < 1e-30) return Math.sqrt(Math.max(0, Math.min(xx, yy, zz)) / n);
  const p2 = (xx - q) ** 2 + (yy - q) ** 2 + (zz - q) ** 2 + 2 * p1, p = Math.sqrt(p2 / 6);
  const B = [(xx - q) / p, xy / p, xz / p, (yy - q) / p, yz / p, (zz - q) / p];
  const det = B[0] * (B[3] * B[5] - B[4] * B[4]) - B[1] * (B[1] * B[5] - B[4] * B[2]) + B[2] * (B[1] * B[4] - B[3] * B[2]);
  const r = Math.max(-1, Math.min(1, det / 2)), phi = Math.acos(r) / 3;
  const e1 = q + 2 * p * Math.cos(phi), e3 = q + 2 * p * Math.cos(phi + 2 * Math.PI / 3);
  return Math.sqrt(Math.max(0, Math.min(e1, e3)) / n);
}

let scanned = 0;
for (const p of atlas.parts) {
  if (/-END$/.test(p.id)) continue;
  let found; try { found = analyse(p); } catch { continue; }
  scanned++;
  for (const d of found) { const key = `${p.id}|${d.kind}`; const cur = defects.get(key); if (!cur || d.size > cur.size) defects.set(key, {size: d.size, text: `${p.name}: ${d.text}`, system: p.system}); }
}
const by = k => [...defects].filter(([key]) => key.endsWith('|' + k));
console.log(`Geometry defects: ${scanned} meshes scanned, fragments ${by('fragment').length}, straight cuts ${by('straightcut').length}`);
if (list) for (const [k, v] of [...defects].sort()) console.log(`  ${k} (${v.system}): ${v.text}`);
if (write) {
  fs.writeFileSync(baseFile, JSON.stringify({note: 'Known defects of scripts/audit-geometry-defects.mjs ("part id|kind" -> size in mm). A new one, or a bigger one, fails the check. Fix the mesh instead of adding to this list; "allowed" holds defects that are real anatomy, each with its reason.', known: Object.fromEntries([...defects].map(([k, v]) => [k, Math.round(v.size * 10) / 10])), allowed: base.allowed || {}}, null, 1));
  console.log(`Baseline written with ${defects.size} entries.`); process.exit(0);
}
const bad = [...defects].filter(([k, v]) => !(k in base.allowed) && (!(k in base.known) || v.size > base.known[k] + 0.11));
if (bad.length) { console.error(`Geometry defects: ${bad.length} new or worse of ${defects.size}`); for (const [k, v] of bad.slice(0, 40)) console.error(' - ' + k + ': ' + v.text); process.exit(1); }
console.log(`PASS geometry defects: ${defects.size} known, none new.`);
