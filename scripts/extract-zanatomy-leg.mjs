// Maintainer tool (not run by the build): extracts the retinacula and the plantar and patellar fasciae of the lower limb from the Z-Anatomy muscular model and vendors them in
// scripts/data/zanatomy-lower-limb.json.gz, registered to the BodyParts3D frame of this atlas, so that an upstream change or outage can never break a deploy.
//   node scripts/extract-zanatomy-leg.mjs <path to a checkout of LluisV/Z-Anatomy>
// Source: https://github.com/LluisV/Z-Anatomy, commit 6c7f9016bd5899ac8edafd31b9900c151df42ed6, "Z-Anatomy PC/Assets/Models/1.0 Models/MuscularSystem100.fbx" and SkeletalSystem100.fbx
// (CC BY-SA 4.0; Z-Anatomy's own Resources/Models/License.txt also asks for the BodyParts3D credit, CC BY-SA 2.1 Japan). Units are cm; one similarity transform per side and
// region (scale, rotation, translation) fitted on the bones both models share (centre of every bone) brings them into the atlas frame. Never taken from any other repository.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import * as T from 'three';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
import {weldByPosition, simplify} from './lib/stream-writer.mjs';
import {atlasParts} from './lib/tendon-set.mjs';
import {meshOf, closest} from './lib/heart-geom.mjs';

const repo = process.argv[2]; if (!repo) { console.error('usage: node scripts/extract-zanatomy-limb.mjs <Z-Anatomy checkout>'); process.exit(1); }
const dir = `${repo}/Z-Anatomy PC/Assets/Models/1.0 Models/`;
const COMMIT = '6c7f9016bd5899ac8edafd31b9900c151df42ed6';
const load = f => { const b = fs.readFileSync(dir + f); const g = new FBXLoader().parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), ''); g.updateMatrixWorld(true); const m = new Map(); g.traverse(o => { if (!o.isMesh) return; const geo = o.geometry.clone(); geo.applyMatrix4(o.matrixWorld); m.set(o.name, {positions: Float64Array.from(geo.attributes.position.array), indices: geo.index ? Uint32Array.from(geo.index.array) : Uint32Array.from({length: geo.attributes.position.count}, (_, i) => i)}); }); return {m, sha: createHash('sha256').update(b).digest('hex')}; };
const sk = load('SkeletalSystem100.fbx'), mu = load('MuscularSystem100.fbx');
const {parts, read} = atlasParts(), atlasBone = name => { const p = parts.find(q => q.name === name); if (!p) throw new Error('atlas bone ' + name); return read(p).positions; };
const centre = p => { const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (let i = 0; i < p.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], p[i + k]); hi[k] = Math.max(hi[k], p[i + k]); } return lo.map((v, k) => (v + hi[k]) / 2); };
function fit(src, dst) {
  const n = src.length, mean = a => a.reduce((s, v) => v.map((x, k) => s[k] + x / n), [0, 0, 0]), sm = mean(src), dm = mean(dst);
  const A = src.map(v => v.map((x, k) => x - sm[k])), B = dst.map(v => v.map((x, k) => x - dm[k]));
  const H = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; for (let i = 0; i < n; i++) for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) H[a][b] += A[i][a] * B[i][b];
  // rotation by Horn's quaternion method
  const [Sxx, Sxy, Sxz] = H[0], [Syx, Syy, Syz] = H[1], [Szx, Szy, Szz] = H[2];
  const N = [[Sxx + Syy + Szz, Syz - Szy, Szx - Sxz, Sxy - Syx], [Syz - Szy, Sxx - Syy - Szz, Sxy + Syx, Szx + Sxz], [Szx - Sxz, Sxy + Syx, -Sxx + Syy - Szz, Syz + Szy], [Sxy - Syx, Szx + Sxz, Syz + Szy, -Sxx - Syy + Szz]];
  let q = [1, 0, 0, 0]; for (let it = 0; it < 200; it++) { const shift = 1e6; const r = N.map((row, i) => row.reduce((s, v, j) => s + (v + (i === j ? shift : 0)) * q[j], 0)); const l = Math.hypot(...r); q = r.map(v => v / l); }
  const [w, x, y, z] = q, R = [[1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)], [2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)], [2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)]];
  const rot = v => R.map(r => r[0] * v[0] + r[1] * v[1] + r[2] * v[2]);
  let num = 0, den = 0; for (let i = 0; i < n; i++) { const r = rot(A[i]); num += r[0] * B[i][0] + r[1] * B[i][1] + r[2] * B[i][2]; den += A[i][0] ** 2 + A[i][1] ** 2 + A[i][2] ** 2; }
  const s = num / den, t = dm.map((v, k) => v - s * rot(sm)[k]);
  const apply = v => rot(v).map((x, k) => x * s + t[k]);
  const rms = Math.sqrt(src.reduce((a, v, i) => a + apply(v).reduce((c, x, k) => c + (x - dst[i][k]) ** 2, 0), 0) / n);
  return {apply, rms, scale: s, rot, sm, dm};
}
/** Same rotation as `fit`, but with the scale held at `s0` (the surface refinement must not shrink or grow the model to chase the bones). */
function fitRigid(src, dst, s0) { const f = fit(src, dst); const apply = v => { const r = f.rot(v.map((x, k) => x - f.sm[k])); return r.map((x, k) => x * s0 + f.dm[k]); }; return {apply, scale: s0, rot: f.rot, sm: f.sm, dm: f.dm, rms: 0}; }
const toes = ['first', 'second', 'third', 'fourth', 'fifth'], toeName = ['big', 'second', 'third', 'fourth', 'little'], meta = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
const SIDES = [{z: 'r', w: 'Right', l: 'right'}, {z: 'l', w: 'Left', l: 'left'}];
// [Z-Anatomy mesh name (without side letter), name in this atlas, region of the fit]
const WANTED = [
  ['Superior_extensor_retinaculum_of_ankle', 'superior extensor retinaculum of foot', 'ankle'],
  // Z-Anatomy files the Y-shaped band over the front of the ankle (lateral root on the calcaneus, two limbs to the medial side) under "Superior fibular retinaculum"; by its position it is the inferior
  // extensor retinaculum and is named that here. Z-Anatomy's flexor retinaculum is a sheet that spreads over the whole heel and is not used (the flexor and fibular retinacula are built over the tendons instead). Its mesh called "Inferior extensor retinaculum" is a transverse band at the level of the ankle joint that matches no retinaculum and is not used.
  ['Superior_fibular_retinaculum', 'inferior extensor retinaculum of foot', 'ankle'],
  ['Plantar_aponeurosis', 'plantar aponeurosis', 'foot'],
  ['Medial_patellar_retinaculum', 'medial patellar retinaculum', 'knee'], ['Lateral_patellar_retinaculum', 'lateral patellar retinaculum', 'knee'],
];
const out = {source: 'Z-Anatomy (LluisV/Z-Anatomy)', commit: COMMIT, license: 'CC BY-SA 4.0 (Z-Anatomy), with the BodyParts3D credit CC BY-SA 2.1 Japan as required by its License.txt', files: {'SkeletalSystem100.fbx': sk.sha, 'MuscularSystem100.fbx': mu.sha}, meshes: []};
for (const S of SIDES) {
  const pairsFor = region => {
    const list = [[`Femur${S.z}`, `${S.w} femur`], [`Tibia${S.z}`, `${S.w} tibia`], [`Fibula${S.z}`, `${S.w} fibula`], [`Patella${S.z}`, `${S.w} patella`]];
    if (region === 'knee') return list.filter(p => !/Femur/.test(p[0]) || true);
    const hind = [[`Talus${S.z}`, `${S.w} talus`], [`Calcaneus${S.z}`, `${S.w} calcaneus`], [`Navicular_bone${S.z}`, `Navicular bone of ${S.l} foot`], [`Cuboid_bone${S.z}`, `${S.w} cuboid bone`]];
    if (region === 'ankle') return [...list.slice(1, 3), ...hind];
    // the foot: tarsal bones, cuneiforms and the five metatarsals (the forefoot is plantar flexed differently in the two models, so it gets its own fit)
    return [...hind, [`Medial_cuneiform_bone${S.z}`, `${S.w} medial cuneiform bone`], [`Intermediate_cuneiform_bone${S.z}`, `${S.w} intermediate cuneiform bone`], [`Lateral_cuneiform_bone${S.z}`, `${S.w} lateral cuneiform bone`],
      ...meta.map(m => [`${m}_metatarsal_bone${S.z}`, `${S.w} ${m.toLowerCase()} metatarsal bone`])];
  };
  const fits = {};
  for (const region of ['ankle', 'foot', 'knee']) {
    const src = [], dst = [];
    for (const [zn, an] of pairsFor(region)) { const m = sk.m.get(zn); if (!m) { console.warn('no Z bone', zn); continue; } src.push(centre(m.positions)); dst.push(centre(atlasBone(an))); }
    fits[region] = fit(src, dst);
    // refine on the bone surfaces: iterated closest point (Z-Anatomy bone vertices to the nearest point of the same atlas bone), the transform re-estimated from the original points each round
    {
      const pts = [], tgt = [];
      for (const [zn, an] of pairsFor(region)) {
        const m = sk.m.get(zn); if (!m) continue; const ap = parts.find(q => q.name === an), ag = read(ap), mesh = meshOf(ag.positions, ag.indices), step = Math.max(1, Math.floor(m.positions.length / 3 / 250));
        for (let v = 0; v < m.positions.length / 3; v += step) pts.push({p: [m.positions[v * 3], m.positions[v * 3 + 1], m.positions[v * 3 + 2]], mesh});
      }
      let f = fits[region], residual = 0;
      for (let it = 0; it < 40; it++) {
        const target = pts.map(q => closest(q.mesh, f.apply(q.p)).point); residual = Math.sqrt(pts.reduce((a, q, i) => a + target[i].reduce((c, x, k) => c + (x - f.apply(q.p)[k]) ** 2, 0), 0) / pts.length);
        f = fitRigid(pts.map(q => q.p), target, fits[region].scale);
      }
      console.log(`  surface refinement: ${(residual * 1000).toFixed(2)} mm rms to the bone surfaces`); f.rms = residual; fits[region] = f;
    } console.log(S.w, region, src.length, 'bones, scale', fits[region].scale.toFixed(5), 'rms', (fits[region].rms * 1000).toFixed(2), 'mm');
  }
  for (const [zname, name, region] of WANTED) {
    const m = mu.m.get(zname + S.z); if (!m) { console.warn('missing', zname + S.z); continue; }
    const pos = Float32Array.from({length: m.positions.length}, () => 0), f = fits[region];
    for (let i = 0; i < m.positions.length; i += 3) { const v = f.apply([m.positions[i], m.positions[i + 1], m.positions[i + 2]]); pos[i] = v[0]; pos[i + 1] = v[1]; pos[i + 2] = v[2]; }
    let w = weldByPosition(pos, m.indices); w = await simplify(w.positions, w.indices, 6000, .002, ['LockBorder']);
    out.meshes.push({name: `${S.w} ${name}`, zname: zname + S.z, side: S.l, region, fitRmsMm: +(f.rms * 1000).toFixed(2), positions: Buffer.from(w.positions.buffer, w.positions.byteOffset, w.positions.byteLength).toString('base64'), indices: Buffer.from(w.indices.buffer, w.indices.byteOffset, w.indices.byteLength).toString('base64')});
  }
}
fs.mkdirSync(new URL('./data/', import.meta.url), {recursive: true});
fs.writeFileSync(new URL('./data/zanatomy-lower-limb.json.gz', import.meta.url), gzipSync(Buffer.from(JSON.stringify(out)), {level: 9}));
console.log(out.meshes.length, 'meshes vendored');
