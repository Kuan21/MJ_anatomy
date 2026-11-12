// Where does a bone show through the muscles when the back of the head and neck is seen from behind? Rays run forward (+z) over the whole back of the head and neck on a 2 mm lattice;
// a lattice point is "exposed" when the first thing it hits is a bone although soft tissue (muscle, tendon, connective tissue) lies within `NEAR` of it, i.e. it is a hole in the cover, not the
// edge of the body. Lists the connected exposed areas (size in mm, position), nothing else.   node scripts/list-exposed-bone.mjs [--list]
import {loadStabilityParts} from './lib/stability-world.mjs';
const list = process.argv.includes('--list'), STEP = .002, NEAR = .02, BOX = {x: [-.11, .11], y: [1.36, 1.74]};
const {parts} = loadStabilityParts(), cell = .004, grid = new Map(), tris = [];
const SHOWN = new Set(['skeletal', 'muscular', 'tendon', 'connective', 'arterial', 'venous', 'nervous']);
for (const p of parts) {
  if (!SHOWN.has(p.system) || (p.system === 'nervous' && /brain|cerebr|cerebell|spinal cord|medulla|pons|thalam|ventricle/i.test(p.name))) continue;
  const g = p.load(), P = g.positions;
  for (let i = 0; i < g.indices.length; i += 3) {
    const a = g.indices[i] * 3, b = g.indices[i + 1] * 3, c = g.indices[i + 2] * 3;
    const x0 = Math.min(P[a], P[b], P[c]), x1 = Math.max(P[a], P[b], P[c]), y0 = Math.min(P[a + 1], P[b + 1], P[c + 1]), y1 = Math.max(P[a + 1], P[b + 1], P[c + 1]);
    if (x1 < BOX.x[0] || x0 > BOX.x[1] || y1 < BOX.y[0] || y0 > BOX.y[1]) continue;
    const id = tris.length; tris.push([P[a], P[a + 1], P[a + 2], P[b], P[b + 1], P[b + 2], P[c], P[c + 1], P[c + 2], p.system === 'skeletal' ? 1 : 0, p.name]);
    for (let x = Math.floor(x0 / cell); x <= Math.floor(x1 / cell); x++) for (let y = Math.floor(y0 / cell); y <= Math.floor(y1 / cell); y++) { const k = x * 100003 + y; let l = grid.get(k); if (!l) grid.set(k, l = []); l.push(id); }
  }
}
const nx = Math.round((BOX.x[1] - BOX.x[0]) / STEP), ny = Math.round((BOX.y[1] - BOX.y[0]) / STEP), first = new Int8Array(nx * ny).fill(-1), what = new Array(nx * ny);
for (let ix = 0; ix < nx; ix++) for (let iy = 0; iy < ny; iy++) {
  const x = BOX.x[0] + (ix + .5) * STEP, y = BOX.y[0] + (iy + .5) * STEP, l = grid.get(Math.floor(x / cell) * 100003 + Math.floor(y / cell)); if (!l) continue;
  let bz = Infinity, bt = null;
  for (const id of l) { const t = tris[id], d = (t[4] - t[7]) * (t[0] - t[6]) + (t[6] - t[3]) * (t[1] - t[7]); if (Math.abs(d) < 1e-14) continue; const u = ((t[4] - t[7]) * (x - t[6]) + (t[6] - t[3]) * (y - t[7])) / d, v = ((t[7] - t[1]) * (x - t[6]) + (t[0] - t[6]) * (y - t[7])) / d, w = 1 - u - v; if (u < 0 || v < 0 || w < 0) continue; const z = u * t[2] + v * t[5] + w * t[8]; if (z < bz) { bz = z; bt = t; } }
  if (bt) { first[ix * ny + iy] = bt[9]; what[ix * ny + iy] = bt[10]; }
}
// exposed = first hit is a bone and soft tissue is the first hit somewhere within NEAR on both sides in y or x (a hole, not the edge of the body)
const r = Math.round(NEAR / STEP), soft = (ix, iy) => ix >= 0 && iy >= 0 && ix < nx && iy < ny && first[ix * ny + iy] === 0;
const exposed = new Uint8Array(nx * ny);
for (let ix = 0; ix < nx; ix++) for (let iy = 0; iy < ny; iy++) if (first[ix * ny + iy] === 1) {
  const L = [...Array(r)].some((_, k) => soft(ix - k - 1, iy)), R = [...Array(r)].some((_, k) => soft(ix + k + 1, iy)), U = [...Array(r)].some((_, k) => soft(ix, iy + k + 1)), D = [...Array(r)].some((_, k) => soft(ix, iy - k - 1));
  if ((L && R) || (U && D)) exposed[ix * ny + iy] = 1;
}
const seen = new Uint8Array(nx * ny), areas = [];
for (let s = 0; s < nx * ny; s++) if (exposed[s] && !seen[s]) {
  const stack = [s], cells = []; seen[s] = 1;
  while (stack.length) { const c = stack.pop(); cells.push(c); const ix = Math.floor(c / ny), iy = c % ny; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const jx = ix + a, jy = iy + b; if (jx < 0 || jy < 0 || jx >= nx || jy >= ny) continue; const k = jx * ny + jy; if (exposed[k] && !seen[k]) { seen[k] = 1; stack.push(k); } } }
  const xs = cells.map(c => BOX.x[0] + (Math.floor(c / ny) + .5) * STEP), ys = cells.map(c => BOX.y[0] + (c % ny + .5) * STEP), bones = {}; for (const c of cells) bones[what[c]] = (bones[what[c]] || 0) + 1;
  areas.push({cells: cells.length, areaMm2: cells.length * STEP * STEP * 1e6, x: [Math.min(...xs), Math.max(...xs)], y: [Math.min(...ys), Math.max(...ys)], bone: Object.entries(bones).sort((a, b) => b[1] - a[1])[0][0]});
}
const big = areas.filter(a => a.areaMm2 >= 30).sort((a, b) => b.areaMm2 - a.areaMm2);
console.log(`Exposed bone areas (30 mm2 or more): ${big.length}`);
if (list) for (const a of big) console.log(`${a.bone}: ${a.areaMm2.toFixed(0)} mm2, x ${(a.x[0] * 1000).toFixed(0)} to ${(a.x[1] * 1000).toFixed(0)} mm, y ${(a.y[0] * 1000).toFixed(0)} to ${(a.y[1] * 1000).toFixed(0)} mm`);
