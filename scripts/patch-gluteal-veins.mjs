// One-off data fix (same kind as patch-atlas-vessels.mjs): the source inferior gluteal veins run through the belly of gluteus maximus, and the left one comes out of its back surface
// near the gluteal cleft, although the inferior gluteal vessels leave the pelvis below piriformis and lie DEEP to gluteus maximus, entering it from its deep surface
// (position checked against public sources only, the user verifies). Every vertex that lies behind the deep surface of the (repaired, see scripts/lib/muscle-reshape.mjs) muscle is moved forwards (+z) to just in front of that
// surface, plus a small clearance; the move is spread along the vessel (the move may only grow in the smoothing, never fall below what a vertex needs), so the tube stays smooth.
// Vertices that were already in front of the muscle, or outside its footprint, do not move, so the vein still joins the internal iliac vein where it did.
// The script rewrites the affected chunk (.bin and .bin.gz) and the part's bounds in public/models/atlas.json and does nothing when nothing needs to move.
// Run: node scripts/patch-gluteal-veins.mjs [--check]   (--check only reports; exit code 1 when a vein still has vertices behind the deep surface)
import fs from 'node:fs';
import {gzipSync} from 'node:zlib';
import {atlasParts} from './lib/tendon-set.mjs';
import {planReshapes} from './lib/muscle-reshape.mjs';
import {meshOf} from './lib/heart-geom.mjs';
import {clearBones} from './lib/nerve-bone-clearance.mjs';

const root = new URL('../public/models/', import.meta.url), CLEARANCE = .003, check = process.argv.includes('--check');
const VEINS = [{id: 'FJ3606', muscle: 'FJ1418'}, {id: 'FJ3513', muscle: 'FJ1418M'}];   // right and left inferior gluteal vein

const {parts, read} = atlasParts(), reshaped = planReshapes(parts, read);
const atlasFile = new URL('atlas.json', root), atlas = JSON.parse(fs.readFileSync(atlasFile, 'utf8')), bins = new Map(), touched = new Map();
const bin = i => { if (!bins.has(i)) bins.set(i, fs.readFileSync(new URL('..' + atlas.chunks[i].url, root))); return bins.get(i); };

/** z of every crossing of the ray along z at (x, y) with the mesh, ascending. */
function crossings(mesh, x, y) {
  const out = [];
  for (const t of mesh.tris) {
    const a = t.a, b = t.b, c = t.c, d1 = (x - b[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (y - b[1]), d2 = (x - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (y - c[1]), d3 = (x - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (y - a[1]);
    if (((d1 < 0) || (d2 < 0) || (d3 < 0)) && ((d1 > 0) || (d2 > 0) || (d3 > 0))) continue;
    if (Math.abs(t.n[2]) < 1e-9) continue;
    out.push(a[2] - ((x - a[0]) * t.n[0] + (y - a[1]) * t.n[1]) / t.n[2]);
  }
  return out.sort((p, q) => p - q);
}

// vertices within 14 mm of another vessel are where this vein joins its parent or a neighbour (internal iliac, obturator …): they stay, so the joins stay closed
const others = [], cell = .008, grid = new Map(), gk = (i, j, k) => `${i},${j},${k}`;
for (const q of atlas.parts) {
  if (!['arterial', 'venous'].includes(q.system) || VEINS.some(v => v.id === q.id) || q.bounds[1][1] < .8 || q.bounds[0][1] > 1.05 || Math.abs(q.bounds[0][0]) > .2 && Math.abs(q.bounds[1][0]) > .2) continue;
  const b = bin(q.chunk); for (let i = 0; i < q.vertexCount; i++) { const x = b.readFloatLE(q.positions + i * 12), y = b.readFloatLE(q.positions + i * 12 + 4), z = b.readFloatLE(q.positions + i * 12 + 8); if (y < .8 || y > 1.05) continue; const key = gk(Math.floor(x / cell), Math.floor(y / cell), Math.floor(z / cell)); (grid.get(key) ?? grid.set(key, []).get(key)).push([x, y, z]); others.push(1); }
}
const nearOther = (x, y, z) => { const a = Math.floor(x / cell), b = Math.floor(y / cell), c = Math.floor(z / cell); for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) for (const q of grid.get(gk(a + i, b + j, c + k)) ?? []) if (Math.hypot(q[0] - x, q[1] - y, q[2] - z) < .014) return true; return false; };
let behind = 0;
for (const {id, muscle} of VEINS) {
  const part = atlas.parts.find(p => p.id === id); if (!part) throw new Error(`no atlas part ${id}`);
  const g = reshaped.get(muscle), mesh = meshOf(g.positions, g.indices);
  const b = bin(part.chunk), n = part.vertexCount, pos = new Float32Array(n * 3), idx = new Uint32Array(part.indexCount);
  for (let i = 0; i < n * 3; i++) pos[i] = b.readFloatLE(part.positions + i * 4);
  for (let i = 0; i < idx.length; i++) idx[i] = b.readUInt32LE(part.indices + i * 4);
  // how far each vertex must move forwards: the deep surface of the muscle (its most forward crossing) plus the clearance, minus where the vertex is
  const need = new Float64Array(n), pin = new Uint8Array(n);
  for (let v = 0; v < n; v++) { const z = crossings(mesh, pos[v * 3], pos[v * 3 + 1]); if (nearOther(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2])) pin[v] = 1; if (z.length && !pin[v]) need[v] = Math.max(0, z[z.length - 1] + CLEARANCE - pos[v * 3 + 2]); }
  const worst = Math.max(...need), count = need.reduce((s, x) => s + (x > .002 ? 1 : 0), 0);
  console.log(`${id}: ${count} of ${n} vertices behind the deep surface of the muscle ${muscle}; largest move ${(worst * 1000).toFixed(1)} mm`);
  behind += count; if (check || count === 0) continue;
  // vertices at the same place (the seams of the tube) move together: adjacency over welded positions
  const key = v => `${Math.round(pos[v * 3] * 1e6)},${Math.round(pos[v * 3 + 1] * 1e6)},${Math.round(pos[v * 3 + 2] * 1e6)}`, rep = new Map(), group = new Int32Array(n);
  for (let v = 0; v < n; v++) { const k = key(v); if (!rep.has(k)) rep.set(k, v); group[v] = rep.get(k); }
  const nb = Array.from({length: n}, () => new Set());
  for (let t = 0; t < idx.length; t += 3) for (let k = 0; k < 3; k++) { const a = group[idx[t + k]], c = group[idx[t + (k + 1) % 3]]; if (a !== c) { nb[a].add(c); nb[c].add(a); } }
  const needG = new Float64Array(n); for (let v = 0; v < n; v++) needG[group[v]] = Math.max(needG[group[v]], need[v]);
  const pinG = new Uint8Array(n); for (let v = 0; v < n; v++) if (pin[v]) pinG[group[v]] = 1;
  let d = Float64Array.from(needG);
  for (let it = 0; it < 60; it++) {
    const next = Float64Array.from(d);
    for (let v = 0; v < n; v++) { if (group[v] !== v || !nb[v].size) continue; let s = 0; for (const u of nb[v]) s += d[u]; next[v] = pinG[v] ? 0 : Math.max(needG[v], .5 * d[v] + .5 * s / nb[v].size); }
    d = next;
  }
  for (let v = 0; v < n; v++) pos[v * 3 + 2] += d[group[v]];
  // the vein must not come to lie in a bone after the move
  const c = clearBones(pos, idx); if (c.inside) console.log(`  ${c.inside} vertices were moved out of the pelvis bones`);
  // normals (int16 snorm ×3) from the new triangles
  const nrm = new Float64Array(n * 3);
  for (let t = 0; t < idx.length; t += 3) {
    const [p, q, r] = [idx[t], idx[t + 1], idx[t + 2]], u = [0, 1, 2].map(k => pos[q * 3 + k] - pos[p * 3 + k]), w = [0, 1, 2].map(k => pos[r * 3 + k] - pos[p * 3 + k]);
    const f = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    for (const s of [p, q, r]) for (let k = 0; k < 3; k++) nrm[s * 3 + k] += f[k];
  }
  for (let i = 0; i < n; i++) { const l = Math.hypot(nrm[i * 3], nrm[i * 3 + 1], nrm[i * 3 + 2]) || 1; for (let k = 0; k < 3; k++) b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, nrm[i * 3 + k] / l)) * 32767), part.normals + (i * 3 + k) * 2); }
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) { b.writeFloatLE(pos[i * 3 + k], part.positions + (i * 3 + k) * 4); lo[k] = Math.min(lo[k], pos[i * 3 + k]); hi[k] = Math.max(hi[k], pos[i * 3 + k]); }
  part.bounds = [lo, hi]; touched.set(part.chunk, b);
}
if (check) process.exit(behind ? 1 : 0);
for (const [i, b] of touched) {
  fs.writeFileSync(new URL('..' + atlas.chunks[i].url, root), b);
  const gz = gzipSync(b, {level: 9}); fs.writeFileSync(new URL('..' + atlas.chunks[i].gzip, root), gz); atlas.chunks[i].gzipBytes = gz.length;
}
if (touched.size) fs.writeFileSync(atlasFile, JSON.stringify(atlas));
console.log(touched.size ? `moved the inferior gluteal veins in ${touched.size} chunk(s)` : 'both inferior gluteal veins already lie deep to gluteus maximus');
