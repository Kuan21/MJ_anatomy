// Larynx mesh audit: for every mesh in or around the larynx lists fragments, open boundary, fold (crumple) share, inconsistent winding, thinness and edge-length spread.
//   node scripts/audit-larynx.mjs [--json=<file>] [--check]
// Metrics (per mesh, rest pose, as the viewer draws it):
//   pieces    connected components (by shared vertex index after welding coincident vertices)
//   fold      share of edge-adjacent triangle pairs whose face normals are more than 100 degrees apart (a crumpled sheet folds back on itself)
//   rough     share of edge-adjacent triangle pairs more than 60 degrees apart (crumple, not only folds)
//   winding   share of shared edges traversed in the same direction by both triangles (the two faces disagree about which side is outside)
//   open      boundary edges (edges used by a single triangle) / all edges
//   thin      smallest bounding-box extent (mm) of the main piece
//   spread    longest edge / median edge
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadFullAtlas} from './lib/full-atlas.mjs';
const arg = n => process.argv.find(a => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const {atlas, geometry} = loadFullAtlas({streams: []});   // the larynx meshes are all in the base atlas
const parts = atlas.parts.map(p => ({id: p.id, name: p.name, system: p.system, stream: 'atlas', load: () => geometry(p)}));
const NAME = /thyro|cricoid|cricothyroid|laryn|arytenoid|epiglott|corniculate|cuneiform cartilage|vocal|conus elasticus|crico|hyoid|aryepiglot|trachea$|^trachea|thyro-?arytenoid|vocalis|pharyngeal raphe|pharyngeal constrictor/i;
const sel = parts.filter(p => p.system !== 'nervous' || p.stream !== 'nerve').filter(p => NAME.test(p.name) && !/conus branch|conus artery|metatars|tarsal|cuneiform bone|intermediate cuneiform|medial cuneiform|lateral cuneiform/i.test(p.name));
const deg = d => Math.cos(d * Math.PI / 180);
export function measure(g) {
  const P = g.positions, I = g.indices, nv = P.length / 3, nt = I.length / 3;
  // weld
  const key = new Map(), map = new Uint32Array(nv); let m = 0;
  for (let i = 0; i < nv; i++) { const k = `${Math.round(P[i * 3] * 1e5)},${Math.round(P[i * 3 + 1] * 1e5)},${Math.round(P[i * 3 + 2] * 1e5)}`; let v = key.get(k); if (v === undefined) key.set(k, v = m++); map[i] = v; }
  const tri = [], N = [];
  for (let t = 0; t < nt; t++) {
    const a = map[I[t * 3]], b = map[I[t * 3 + 1]], c = map[I[t * 3 + 2]]; if (a === b || b === c || a === c) continue;
    const ia = I[t * 3] * 3, ib = I[t * 3 + 1] * 3, ic = I[t * 3 + 2] * 3;
    const ux = P[ib] - P[ia], uy = P[ib + 1] - P[ia + 1], uz = P[ib + 2] - P[ia + 2], vx = P[ic] - P[ia], vy = P[ic + 1] - P[ia + 1], vz = P[ic + 2] - P[ia + 2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz); if (l < 1e-14) continue;
    tri.push([a, b, c]); N.push([nx / l, ny / l, nz / l]);
  }
  const edges = new Map(), lens = [];
  tri.forEach(([a, b, c], t) => { for (const [u, v] of [[a, b], [b, c], [c, a]]) { const k = u < v ? u * 4294967296 + v : v * 4294967296 + u; let e = edges.get(k); if (!e) edges.set(k, e = []); e.push([t, u < v ? 1 : -1]); } });
  let open = 0, fold = 0, rough = 0, pairs = 0, same = 0, nonman = 0;
  const cos100 = deg(100), cos60 = deg(60);
  for (const [k, e] of edges) {
    if (e.length === 1) open++;
    else if (e.length === 2) { pairs++; const [t1, d1] = e[0], [t2, d2] = e[1]; if (d1 === d2) same++; const d = N[t1][0] * N[t2][0] + N[t1][1] * N[t2][1] + N[t1][2] * N[t2][2]; if (d < cos100) fold++; if (d < cos60) rough++; } else nonman++;
    const u = Math.floor(k / 4294967296), v = k % 4294967296; void u; void v;
  }
  // pieces by union-find on welded vertices
  const par = new Int32Array(m).map((_, i) => i), f = x => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
  tri.forEach(([a, b, c]) => { par[f(a)] = f(b); par[f(b)] = f(c); });
  const cnt = new Map(); tri.forEach(([a]) => { const r = f(a); cnt.set(r, (cnt.get(r) || 0) + 1); });
  const sizes = [...cnt.values()].sort((x, y) => y - x);
  // main-piece bbox extents
  const mainRoot = [...cnt.entries()].sort((x, y) => y[1] - x[1])[0]?.[0];
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; const first = new Map(); for (let i = 0; i < nv; i++) if (!first.has(map[i])) first.set(map[i], i);
  for (const [w, i] of first) if (mainRoot !== undefined && f(w) === mainRoot) for (let d = 0; d < 3; d++) { lo[d] = Math.min(lo[d], P[i * 3 + d]); hi[d] = Math.max(hi[d], P[i * 3 + d]); }
  const ext = [0, 1, 2].map(d => (hi[d] - lo[d]) * 1000).sort((a, b) => a - b);
  // edge lengths
  const el = []; for (const k of edges.keys()) { const u = Math.floor(k / 4294967296), v = k % 4294967296; const iu = first.get(u) * 3, iv = first.get(v) * 3; el.push(Math.hypot(P[iu] - P[iv], P[iu + 1] - P[iv + 1], P[iu + 2] - P[iv + 2])); }
  el.sort((a, b) => a - b);
  // signed volume (outward-normal winding of a closed mesh gives positive)
  let vol = 0; tri.forEach(([a, b, c]) => { const A = first.get(a) * 3, B = first.get(b) * 3, C = first.get(c) * 3; vol += (P[A] * (P[B + 1] * P[C + 2] - P[B + 2] * P[C + 1]) - P[A + 1] * (P[B] * P[C + 2] - P[B + 2] * P[C]) + P[A + 2] * (P[B] * P[C + 1] - P[B + 1] * P[C])) / 6; });
  const pc = x => +(100 * x).toFixed(1);
  return {tris: tri.length, pieces: sizes.length, smallPieces: sizes.filter(s => s < sizes[0] * .25).length, open: pc(open / Math.max(1, edges.size)), fold: pc(fold / Math.max(1, pairs)), rough: pc(rough / Math.max(1, pairs)), winding: pc(same / Math.max(1, pairs)), nonManifold: nonman, thinMm: +ext[0].toFixed(2), midMm: +ext[1].toFixed(1), longMm: +ext[2].toFixed(1), spread: +(el[el.length - 1] / (el[el.length >> 1] || 1)).toFixed(1), edgeMm: +(el[el.length >> 1] * 1000).toFixed(2), volMm3: Math.round(vol * 1e9)};
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rows = sel.map(p => ({id: p.id, name: p.name, system: p.system, stream: p.stream, ...measure(p.load())}));
  rows.sort((a, b) => a.name.localeCompare(b.name));
  console.log('id\tname\tsys\ttris\tpieces\tsmall\topen%\tfold%\trough%\twind%\tthin\tmid\tlong\tspread\tedge\tvol');
  for (const r of rows) console.log([r.id, r.name, r.system, r.tris, r.pieces, r.smallPieces, r.open, r.fold, r.rough, r.winding, r.thinMm, r.midMm, r.longMm, r.spread, r.edgeMm, r.volMm3].join('\t'));
  if (arg('json')) fs.writeFileSync(arg('json'), JSON.stringify(rows, null, 1));
}
