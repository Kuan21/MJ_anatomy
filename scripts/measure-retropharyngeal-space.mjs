// Retropharyngeal space layer (scripts/paokao-structures/retropharyngeal-space.mjs): how it sits among the structures around it. Read-only.
//   node scripts/measure-retropharyngeal-space.mjs [--md]
// For every structure near the layer: the smallest distance from a layer vertex to its surface, the deepest layer vertex inside it (ray parity, mm), and whether the front face of the layer
// (the back wall of the pharynx, which was not moved) is itself already inside that structure: then the overlap existed before and is listed, not counted. A structure that the layer
// enters by more than 0.3 mm although the pharynx wall does not is a violation.
import {loadWorld} from './lib/paokao-world.mjs';
import {makeUtil} from './lib/paokao-util.mjs';
import {meshOf, closest, ray} from './lib/heart-geom.mjs';
import {retropharyngealLayer, PHARYNX} from './paokao-structures/retropharyngeal-space.mjs';
export function measure(options = {}) {
  const w = loadWorld({paokao: true}), U = makeUtil(w), g = retropharyngealLayer(U, options), P = g.positions, n = P.length / 6;   // first half: front face, second half: back face
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], P[i + k]); hi[k] = Math.max(hi[k], P[i + k]); }
  const front = [], back = []; for (let i = 0; i < n; i++) { front.push([P[i * 3], P[i * 3 + 1], P[i * 3 + 2]]); back.push([P[(n + i) * 3], P[(n + i) * 3 + 1], P[(n + i) * 3 + 2]]); }
  const inside = (m, p) => { const votes = [0, .0002, -.0002].map(dy => { let c = 0, from = [p[0], p[1] + dy, p[2]]; for (let k = 0; k < 12; k++) { const h = ray(m, from, [1, 0, 0]); if (!h) break; c++; from = [h.point[0] + 1e-6, from[1], from[2]]; } return c % 2; }); return votes.reduce((a, b) => a + b, 0) >= 2; };
  const rows = [], seen = new Set();
  for (const e of w.entries) {
    if (/retropharyngeal/i.test(e.name) || seen.has(e.name)) continue; let geo; try { geo = e.load(); } catch { continue; }
    const pp = geo.positions; let a = [1e9, 1e9, 1e9], b = [-1e9, -1e9, -1e9]; for (let i = 0; i < pp.length; i += 3) for (let k = 0; k < 3; k++) { a[k] = Math.min(a[k], pp[i + k]); b[k] = Math.max(b[k], pp[i + k]); }
    if (a[0] > hi[0] + .004 || b[0] < lo[0] - .004 || a[1] > hi[1] + .004 || b[1] < lo[1] - .004 || a[2] > hi[2] + .004 || b[2] < lo[2] - .004) continue;
    seen.add(e.name); const m = w.mesh(e.name); let min = 1e9, deepest = 0, frontInside = 0, backInside = 0;
    for (let i = 0; i < n; i += 2) for (const [p, isFront] of [[front[i], true], [back[i], false]]) {
      if (p[0] < a[0] - .004 || p[0] > b[0] + .004 || p[1] < a[1] - .004 || p[1] > b[1] + .004 || p[2] < a[2] - .004 || p[2] > b[2] + .004) continue;
      const c = closest(m, p); min = Math.min(min, c.d); if (inside(m, p)) { if (isFront) frontInside++; else backInside++; deepest = Math.max(deepest, c.d); } }
    rows.push({name: e.name, min: min * 1000, deepest: deepest * 1000, frontInside, backInside, pharynx: PHARYNX.includes(e.name)});
  }
  rows.sort((x, y) => y.deepest - x.deepest || x.min - y.min);
  const th = front.map((f, i) => (f[2] - back[i][2]) * 1000), cnt = lim => th.filter(t => t < lim).length;
  const verdict = r => r.pharynx ? 'pharynx' : r.deepest <= .3 ? 'ok' : r.frontInside ? 'existing' : 'violation';
  for (const r of rows) r.verdict = verdict(r);
  return {rows, verts: n, tris: g.indices.length / 3, thickness: {mean: th.reduce((a, b) => a + b, 0) / n, min: Math.min(...th), thin: cnt(1.5), bbox: [lo, hi]}};
}
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const {rows, verts, thickness} = measure(), f = v => v.toFixed(1);
  console.log(`layer: ${verts} vertices per face; thickness (layer front face is 1.5 mm behind the pharynx wall): mean ${f(thickness.mean)} mm, thinnest ${f(thickness.min)} mm, ${thickness.thin} vertices thinner than 1.5 mm; extent x ${f(thickness.bbox[0][0] * 1e3)} to ${f(thickness.bbox[1][0] * 1e3)}, y ${f(thickness.bbox[0][1] * 1e3)} to ${f(thickness.bbox[1][1] * 1e3)} mm`);
  console.log('| structure | closest layer vertex (mm) | deepest layer vertex inside (mm) | back-face vertices inside | front-face vertices inside | verdict |\n|---|---|---|---|---|---|');
  for (const r of rows.filter(r => r.min < 3)) { const verdict = r.pharynx ? 'the pharynx itself (front face)' : r.deepest <= .3 ? 'ok' : r.frontInside ? 'overlap already there (the pharynx wall is inside it)' : 'VIOLATION'; console.log(`| ${r.name} | ${f(r.min)} | ${f(r.deepest)} | ${r.backInside} | ${r.frontInside} | ${verdict} |`); }
}
