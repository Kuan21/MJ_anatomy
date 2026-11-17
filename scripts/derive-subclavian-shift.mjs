// Centre lines of the two subclavian arteries (HN-23), derived from the meshes themselves: the surface graph of each artery mesh is split into 4 mm slices by distance (along the surface)
// from its medial end (aortic arch on the left, brachiocephalic trunk on the right); the centre of each slice is one point of the polyline. The artery meshes are not rings
// (313 and 219 vertices), so this is the only centre line they have. Written to app/biomechanics-v2/subclavian-centreline.json (mm; y up, x positive = Left, z positive = anterior).
//   node scripts/derive-subclavian-shift.mjs [--check]     --check: fail when the stored file differs from a fresh derivation
import fs from 'node:fs';
import {part, SIDES} from './lib/subclavian-measure.mjs';
const OUT = new URL('../app/biomechanics-v2/subclavian-centreline.json', import.meta.url), SLICE = 4;
const r1 = x => Math.round(x * 10) / 10;
export function centreline(id, medialSign) {
  const A = part(id), key = v => v.map(x => x.toFixed(2)).join(','), rep = new Map(), idOf = [];
  A.verts.forEach((v, i) => { const k = key(v); if (!rep.has(k)) rep.set(k, rep.size); idOf[i] = rep.get(k); });
  const m = rep.size, adj = Array.from({length: m}, () => []), pos = Array(m);
  A.verts.forEach((v, i) => { pos[idOf[i]] = v; });
  for (let i = 0; i < A.idx.length; i += 3) for (let k = 0; k < 3; k++) { const a = idOf[A.idx[i + k]], b = idOf[A.idx[i + (k + 1) % 3]]; if (a !== b) { const d = Math.hypot(...pos[a].map((x, j) => x - pos[b][j])); adj[a].push([b, d]); adj[b].push([a, d]); } }
  const dij = src => { const d = new Float64Array(m).fill(1e9); d[src] = 0; const q = [[0, src]]; while (q.length) { q.sort((x, y) => x[0] - y[0]); const [du, u] = q.shift(); if (du > d[u]) continue; for (const [v, w] of adj[u]) if (du + w < d[v]) { d[v] = du + w; q.push([d[v], v]); } } return d; };
  const far = d => { let b = 0; d.forEach((x, i) => { if (x < 1e8 && x > d[b]) b = i; }); return b; };
  const e1 = far(dij(0)), e2 = far(dij(e1));
  // medial end: the end nearer the midline
  const medial = Math.abs(pos[e1][0]) < Math.abs(pos[e2][0]) ? e1 : e2, dm = dij(medial);
  const bins = new Map(); pos.forEach((p, i) => { if (dm[i] > 1e8) return; const b = Math.floor(dm[i] / SLICE); (bins.get(b) ?? bins.set(b, []).get(b)).push(p); });
  let pts = [...bins.keys()].sort((a, b) => a - b).map(b => { const a = bins.get(b); return [0, 1, 2].map(k => a.reduce((s, p) => s + p[k], 0) / a.length); });
  // The slices of a surface that is not a ring tube are uneven (a vertex is up to 2 mm off the true centre), so the polyline zigzags; smooth it (binomial 1-4-6-4-1, five passes, end points fixed) so that arc length along it grows evenly.
  for (let pass = 0; pass < 5; pass++) pts = pts.map((p, i) => i === 0 || i === pts.length - 1 ? p : [0, 1, 2].map(k => [-2, -1, 0, 1, 2].reduce((s, o, q) => s + [1, 4, 6, 4, 1][q] * pts[Math.max(0, Math.min(pts.length - 1, i + o))][k], 0) / 16));
  return pts.map(p => p.map(r1));
}
export const derive = () => Object.fromEntries(SIDES.map(S => [S.side, centreline(S.artery)]));
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const fresh = JSON.stringify(derive()) + '\n';
  if (process.argv.includes('--check')) { if (fs.readFileSync(OUT, 'utf8') !== fresh) { console.error('subclavian-centreline.json is out of date: run node scripts/derive-subclavian-shift.mjs'); process.exit(1); } console.log('Subclavian centre lines: up to date.'); }
  else { fs.writeFileSync(OUT, fresh); console.log('Wrote ' + OUT.pathname); }
}
