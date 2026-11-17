// Left and right recurrent laryngeal nerve (RLN) in the neck against the trachea, oesophagus, common carotid artery, vagus nerve and inferior thyroid artery.
//   node scripts/measure-rln-groove.mjs            table every 5 mm of height, millimetres, "out" = away from the midline (right side mirrored), "fwd" = anterior
// The nerve is the generated tube (scripts/paokao-structures/thorax-nerves.mjs, same build as prepare-paokao.mjs); the other structures are read from the atlas, the corrected vagus from the nerve
// stream, the displayed carotid from neck-vessels.json.gz. Wall-to-wall = distance between ring centres in the horizontal plane minus both mean radii.
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadWorld} from './lib/paokao-world.mjs';
import {makeUtil} from './lib/paokao-util.mjs';
import {meshOf, closest, ray} from './lib/heart-geom.mjs';
import thoraxNerves from './paokao-structures/thorax-nerves.mjs';
const root = new URL('../', import.meta.url);
const f = p => new URL(p, root);

export const band = (pos, y, h = .0025) => { const o = []; for (let i = 0; i < pos.length; i += 3) if (Math.abs(pos[i + 1] - y) <= h) o.push([pos[i], pos[i + 2]]); return o; };
/** Ring of a tube-like or ring-like mesh at height y: centre (x, z), mean radius, and the x and z extent. */
export function ring(pos, y, near = null, h = .0025) {
  let p = band(pos, y, h); if (near) { const s = p.reduce((a, v) => Math.hypot(v[0] - near[0], v[1] - near[1]) < Math.hypot(a[0] - near[0], a[1] - near[1]) ? v : a, p[0] ?? [0, 0]); p = p.filter(v => Math.hypot(v[0] - s[0], v[1] - s[1]) < .012); }
  if (p.length < 5) return null;
  const c = [p.reduce((a, v) => a + v[0], 0) / p.length, p.reduce((a, v) => a + v[1], 0) / p.length];
  return {c, r: p.reduce((a, v) => a + Math.hypot(v[0] - c[0], v[1] - c[1]), 0) / p.length, x: [Math.min(...p.map(v => v[0])), Math.max(...p.map(v => v[0]))], z: [Math.min(...p.map(v => v[1])), Math.max(...p.map(v => v[1]))]};
}
export const wall = (a, b) => a && b ? Math.hypot(a.c[0] - b.c[0], a.c[1] - b.c[1]) - a.r - b.r : null;

export function loadNeck() {
  const w = loadWorld(), U = makeUtil(w); U.legacyRln = !!process.env.RLN_LEGACY; const specs = thoraxNerves(U), meshes = {};
  const built = specs.filter(s => /recurrent laryngeal/.test(s.name)).map(s => ({name: s.name, geometry: U.tube(s.tubes[0].pts, s.tubes[0].r[0], s.tubes[0].r[1], s.tubes[0].samples, 12)}));
  const atlas = n => { const m = w.mesh(n); return m.positions; };
  const neck = JSON.parse(zlib.gunzipSync(fs.readFileSync(f('public/models/neck-vessels.json.gz')))).vessels;
  const stream = JSON.parse(fs.readFileSync(f('public/models/nerve-stream.json')));
  const vagus = {}; globalThis.vagusIdx = {};
  for (const ch of stream.chunks) {
    const recs = ch.meshes ?? []; if (!recs.some(r => /^Vagus nerve \(X\)\.[lr]\.001$/.test(r.name))) continue;
    const raw = zlib.gunzipSync(fs.readFileSync(f('public' + ch.url)));
    for (const r of recs) if (/^Vagus nerve \(X\)\.[lr]\.001$/.test(r.name)) { vagus[r.name] = new Float32Array(raw.buffer.slice(raw.byteOffset + r.positions, raw.byteOffset + r.positions + r.vertexCount * 12)); globalThis.vagusIdx[r.name.includes('.l.') ? 'l' : 'r'] = new Uint32Array(raw.buffer.slice(raw.byteOffset + r.indices, raw.byteOffset + r.indices + r.indexCount * 4)); }
  }
  for (const [s, W] of [['l', 'Left'], ['r', 'Right']]) {
    meshes[s] = {rln: built.find(b => b.name === `${W} recurrent laryngeal nerve`).geometry.positions, trachea: atlas('Trachea'), esoph: atlas('Esophagus'),
      cca: neck.find(v => v.name === `${W} common carotid artery`)?.positions ?? atlas(`${W} common carotid artery`), vagus: vagus[`Vagus nerve (X).${s}.001`], ita: atlas(`${W} inferior thyroid artery`)};
  }
  return {meshes, built, w};
}

/** Surface-to-surface gap (mm) from a nerve of radius r whose centre is at p (x, y, z) to a mesh: distance to the nearest triangle minus r, negative when the centre is inside the closed surface (ray parity along +x). */
export function gapTo(mesh, p, r = .00085) {
  let n = 0; const o = [p[0], p[1], p[2]];
  // count the crossings of a ray along +x (three slightly different heights, majority vote) so a seam does not flip the answer
  const votes = [0, .0002, -.0002].map(dy => { let c = 0, from = [o[0], o[1] + dy, o[2]]; for (let k = 0; k < 12; k++) { const h = ray(mesh, from, [1, 0, 0]); if (!h) break; c++; from = [h.point[0] + 1e-6, from[1], from[2]]; } return c % 2; });
  n = votes.reduce((a, b) => a + b, 0) >= 2 ? 1 : 0;
  const d = closest(mesh, o).d; return (n ? -d : d - r) * 1000;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {   // .pathname never equals argv[1] on Windows
  const {meshes, w} = loadNeck(), f1 = v => v == null || Number.isNaN(v) ? '    —' : v.toFixed(1).padStart(5);
  for (const [s, sg] of [['l', 1], ['r', -1]]) {
    const m = meshes[s], W = s === 'l' ? 'Left' : 'Right';
    const idx = {rln: null}, M = {trachea: w.mesh('Trachea'), esoph: w.mesh('Esophagus'), ita: w.mesh(`${W} inferior thyroid artery`), arch: w.mesh('Arch of aorta'), sub: w.mesh(`${W} subclavian artery`)};
    const neckV = JSON.parse(zlib.gunzipSync(fs.readFileSync(f('public/models/neck-vessels.json.gz')))).vessels;
    const cc = neckV.find(v => v.name === `${W} common carotid artery`); M.cca = meshOf(Float32Array.from(cc.positions), Uint32Array.from(cc.indices));
    console.log(`\n${W} recurrent laryngeal nerve (mm; out = away from the midline, fwd = anterior; gap = surface to surface, negative = inside)`);
    console.log(' y(m)   RLN out  fwd | trachea: wall out  post z  | RLN gap: trachea  oesoph   CCA  ITA  vagus  arch  subcl');
    for (let y = 1.37; y <= 1.4701; y += .005) {
      const n = ring(m.rln, y, null, .0015); if (!n) continue;
      const P = [n.c[0], y, n.c[1]], t = band(M.trachea.positions, y, .004);
      const wallOut = t.length ? sg * (sg > 0 ? Math.max(...t.map(v => v[0])) : Math.min(...t.map(v => v[0]))) * 1000 : null, postZ = t.length ? Math.min(...t.map(v => v[1])) * 1000 : null;
      const vag = m.vagus ? (() => { const vm = (idx.v ??= meshOf(Float32Array.from(m.vagus), Uint32Array.from(globalThis.vagusIdx[s]))); return gapTo(vm, P, .00085); })() : null;
      console.log(`${y.toFixed(3)}  ${f1(n.c[0] * sg * 1000)} ${f1(n.c[1] * 1000)} |  ${f1(wallOut)} ${f1(postZ)}  |  ${f1(gapTo(M.trachea, P))} ${f1(gapTo(M.esoph, P))} ${f1(gapTo(M.cca, P))} ${f1(gapTo(M.ita, P))} ${f1(vag)} ${f1(gapTo(M.arch, P))} ${f1(gapTo(M.sub, P))}`);
    }
  }
}
