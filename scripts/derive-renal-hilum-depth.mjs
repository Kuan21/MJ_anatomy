// Depth inside each kidney near the hilum, for the load-time shift of app/biomechanics-v2/renal-hilum-shift.ts (AB-01). The shift must not push the intrarenal branches of the
// renal vessels and the top of the ureter out through the kidney surface, so it fades out with the depth of a point inside the kidney. The kidney meshes are not available when
// a vessel is loaded (other packages), so the depth is sampled here once on a regular grid (1.5 mm) around each hilum and stored with the app
// (app/biomechanics-v2/renal-hilum-depth.json): 0 outside the kidney, the distance to the kidney surface inside (0.1 mm units, capped at 12 mm, the fade depth).
// A vertex just under the kidney surface can still be carried out through it before the fade takes hold, so in a second pass every vertex of the shifted parts that lies
// inside a kidney gets a cap: the distance along its direction of shift (forward for the veins, backward for the arteries and the pelvis) to the kidney surface, less 0.5 mm.
// The adrenal glands sit on the upper medial part of each kidney, next to the hilum: a vertex outside a gland whose path (along its shift) would reach the gland is capped
// so that its whole path stays 1.5 mm from the gland surface.
// A cap that binds next to a vertex that is free would tear the mesh, so the caps are spread over the mesh as an envelope: a vertex at path distance l (mm, along the
// mesh edges, vertices at the same place welded) from a capped vertex may move at most cap + SLOPE * l, so the shift changes by at most SLOPE mm per mm.
// Only caps that bind are stored (`caps`: part id -> [vertex index, cap in 0.1 mm]).
// usage: node scripts/derive-renal-hilum-depth.mjs [--check]   (--check: fail when the stored grid does not match the meshes)
import fs from 'node:fs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {surfaceIndex} from './lib/surface-distance.mjs';
import {quizModule} from './quiz-modules.mjs';
const OUT = new URL('../app/biomechanics-v2/renal-hilum-depth.json', import.meta.url), check = process.argv.includes('--check'), before = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
// gaps (mm) kept from the kidney surface (inside it) and from the adrenal gland (outside it; the vessel wall between two vertices must stay clear too)
const STEP = 2, SLOPE = 2.5, KIDNEY_GAP = .5, ADRENAL_GAP = 1.5;
// grid boxes (mm, atlas axes; x signed) around each hilum: from the midline side of the hilum into the renal sinus, the hilum height and the kidney depth
const BOX = {Left: {id: 'FJ3145', lo: [24, 1050, -46], hi: [66, 1180, 16]}, Right: {id: 'FJ3147', lo: [-66, 1040, -40], hi: [-24, 1165, 18]}};
const full = loadFullAtlas(), {atlas, geometry} = full;
const DIRS = [[0.577, 0.577, 0.577], [-0.7, 0.1, 0.707], [0.1, -0.99, 0.1]];
function inside(p, pos, idx) {
  let votes = 0;
  for (const d of DIRS) {
    let n = 0;
    for (let i = 0; i < idx.length; i += 3) {
      const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
      const e1 = [pos[b] - pos[a], pos[b + 1] - pos[a + 1], pos[b + 2] - pos[a + 2]], e2 = [pos[c] - pos[a], pos[c + 1] - pos[a + 1], pos[c + 2] - pos[a + 2]];
      const h = [d[1] * e2[2] - d[2] * e2[1], d[2] * e2[0] - d[0] * e2[2], d[0] * e2[1] - d[1] * e2[0]], det = e1[0] * h[0] + e1[1] * h[1] + e1[2] * h[2];
      if (Math.abs(det) < 1e-14) continue;
      const f = 1 / det, s = [p[0] - pos[a], p[1] - pos[a + 1], p[2] - pos[a + 2]], u = f * (s[0] * h[0] + s[1] * h[1] + s[2] * h[2]); if (u < 0 || u > 1) continue;
      const q = [s[1] * e1[2] - s[2] * e1[1], s[2] * e1[0] - s[0] * e1[2], s[0] * e1[1] - s[1] * e1[0]], v = f * (d[0] * q[0] + d[1] * q[1] + d[2] * q[2]); if (v < 0 || u + v > 1) continue;
      if (f * (e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]) > 0) n++;
    }
    if (n % 2) votes++;
  }
  return votes >= 2;
}
const out = {step: STEP};
for (const [side, b] of Object.entries(BOX)) {
  const g = geometry(atlas.parts.find(p => p.id === b.id)), pos = g.positions, idx = g.indices, ix = surfaceIndex(pos, idx);
  const dims = [0, 1, 2].map(k => Math.round((b.hi[k] - b.lo[k]) / STEP) + 1), data = new Uint8Array(dims[0] * dims[1] * dims[2]);
  for (let k = 0; k < dims[2]; k++) for (let j = 0; j < dims[1]; j++) for (let i = 0; i < dims[0]; i++) {
    const p = [(b.lo[0] + i * STEP) * 1e-3, (b.lo[1] + j * STEP) * 1e-3, (b.lo[2] + k * STEP) * 1e-3];
    if (!inside(p, pos, idx)) continue;
    const d = Math.min(ix.distance(p, .03), .012); // beyond the fade depth (12 mm, DEPTH_FADE) every depth gives the same weight
    data[i + dims[0] * (j + dims[1] * k)] = Math.max(1, Math.round(d * 1e4));
  }
  out[side] = {kidney: b.id, origin: b.lo, dims, depth: Buffer.from(data).toString('base64')};
}
/** Distance (m) from p along direction dir (+1/-1 on z) to the first surface of the mesh. */
function exit(p, dz, pos, idx) {
  let best = Infinity; const d = [0, 0, dz];
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
    const e1 = [pos[b] - pos[a], pos[b + 1] - pos[a + 1], pos[b + 2] - pos[a + 2]], e2 = [pos[c] - pos[a], pos[c + 1] - pos[a + 1], pos[c + 2] - pos[a + 2]];
    const h = [d[1] * e2[2] - d[2] * e2[1], d[2] * e2[0] - d[0] * e2[2], d[0] * e2[1] - d[1] * e2[0]], det = e1[0] * h[0] + e1[1] * h[1] + e1[2] * h[2];
    if (Math.abs(det) < 1e-14) continue;
    const f = 1 / det, s = [p[0] - pos[a], p[1] - pos[a + 1], p[2] - pos[a + 2]], u = f * (s[0] * h[0] + s[1] * h[1] + s[2] * h[2]); if (u < 0 || u > 1) continue;
    const q = [s[1] * e1[2] - s[2] * e1[1], s[2] * e1[0] - s[0] * e1[2], s[0] * e1[1] - s[1] * e1[0]], v = f * (d[0] * q[0] + d[1] * q[1] + d[2] * q[2]); if (v < 0 || u + v > 1) continue;
    const t = f * (e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]); if (t > 0 && t < best) best = t;
  }
  return best;
}
// second pass: caps, with the shift module as the viewer runs it (depth grid of the first pass, no caps yet)
out.caps = {};
const grid = JSON.stringify(out) + '\n';
fs.writeFileSync(OUT, grid);
const M = await quizModule('app/biomechanics-v2/renal-hilum-shift.ts');
const kid = {}, ADRENAL = {Left: 'FJ3129', Right: 'FJ3130'}, adr = {};
for (const [side, b] of Object.entries(BOX)) { const g = geometry(atlas.parts.find(p => p.id === b.id)); kid[side] = {pos: g.positions, idx: g.indices}; const a = geometry(atlas.parts.find(p => p.id === ADRENAL[side])); adr[side] = {pos: a.positions, idx: a.indices, ix: surfaceIndex(a.positions, a.indices)}; }
for (const p of atlas.parts) {
  const r = M.roleOf(p.id); if (!r) continue;
  const g = geometry(p), pos = g.positions, n = pos.length / 3, K = kid[r.side], want = new Float64Array(n), cap = new Float64Array(n).fill(Infinity);
  for (let i = 0; i < n; i++) {
    const x = pos[i * 3] * 1e3, y = pos[i * 3 + 1] * 1e3, z = pos[i * 3 + 2] * 1e3; want[i] = M.shiftAt(p.id, r.side, r.role, x, y, z);
    if (Math.abs(want[i]) < .05) continue;
    const q = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]], A = adr[r.side];
    // the kidney and the adrenal gland meshes overlap a little where the gland sits on the kidney, so both are checked for every vertex
    let room = Infinity;
    if (inside(q, K.pos, K.idx)) room = exit(q, Math.sign(want[i]), K.pos, K.idx) * 1e3 - KIDNEY_GAP;
    if (!inside(q, A.pos, A.idx)) {
      // the vertex stops where its path first comes within ADRENAL_GAP of the gland (marched in 0.25 mm steps), so it neither ends inside nor jumps across the gland
      const ok = t => A.ix.distance([q[0], q[1], q[2] + Math.sign(want[i]) * t * 1e-3], .01) * 1e3 >= ADRENAL_GAP;
      if (!ok(0)) room = 0;
      else for (let t = .25; t < Math.abs(want[i]) + .25; t += .25) if (!ok(Math.min(t, Math.abs(want[i])))) { room = Math.min(room, t - .25); break; }
    }
    if (room < Math.abs(want[i])) cap[i] = Math.max(0, room);
  }
  if (!cap.some(Number.isFinite)) continue;
  // weld vertices at the same place, build the edge graph, spread the caps (Dijkstra on cap + SLOPE * path length)
  const key = i => `${Math.round(pos[i * 3] * 1e6)},${Math.round(pos[i * 3 + 1] * 1e6)},${Math.round(pos[i * 3 + 2] * 1e6)}`, wid = new Map(), w = new Int32Array(n);
  for (let i = 0; i < n; i++) { const k = key(i); if (!wid.has(k)) wid.set(k, wid.size); w[i] = wid.get(k); }
  const m = wid.size, adj = Array.from({length: m}, () => new Map()), env = new Float64Array(m).fill(Infinity), rep = new Int32Array(m);
  for (let i = 0; i < n; i++) { rep[w[i]] = i; env[w[i]] = Math.min(env[w[i]], cap[i]); }
  for (let t = 0; t < g.indices.length; t += 3) for (let k = 0; k < 3; k++) {
    const a = g.indices[t + k], b = g.indices[t + (k + 1) % 3], A = w[a], B = w[b]; if (A === B) continue;
    const l = Math.hypot(pos[a * 3] - pos[b * 3], pos[a * 3 + 1] - pos[b * 3 + 1], pos[a * 3 + 2] - pos[b * 3 + 2]) * 1e3; adj[A].set(B, l); adj[B].set(A, l);
  }
  const done = new Uint8Array(m);
  for (;;) { // simple O(m^2) Dijkstra: the parts have at most a few thousand vertices
    let u = -1, best = Infinity; for (let i = 0; i < m; i++) if (!done[i] && env[i] < best) { best = env[i]; u = i; }
    if (u < 0) break; done[u] = 1;
    for (const [v, l] of adj[u]) if (env[u] + SLOPE * l < env[v]) env[v] = env[u] + SLOPE * l;
  }
  const caps = [];
  for (let i = 0; i < n; i++) { const c = env[w[i]]; if (Math.abs(want[i]) > c + .05) caps.push(i, Math.round(c * 10)); }
  if (caps.length) out.caps[p.id] = caps;
}
const text = JSON.stringify(out) + '\n';
fs.writeFileSync(OUT, check ? before : text);
if (check) {
  if (before !== text) { console.error('app/biomechanics-v2/renal-hilum-depth.json is out of date: run node scripts/derive-renal-hilum-depth.mjs'); process.exit(1); }
  console.log('Renal hilum depth grid and caps are current.');
} else console.log(`wrote app/biomechanics-v2/renal-hilum-depth.json (${text.length} bytes; caps on ${Object.values(out.caps).reduce((t, c) => t + c.length / 2, 0)} vertices of ${Object.keys(out.caps).length} parts)`);
