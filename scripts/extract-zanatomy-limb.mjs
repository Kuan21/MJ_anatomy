// Maintainer tool (not run by the build): extracts the retinacula and tendon sheaths of the upper limb from the Z-Anatomy muscular model and vendors them in
// scripts/data/zanatomy-upper-limb.json.gz, registered to the BodyParts3D frame of this atlas, so that an upstream change or outage can never break a deploy.
//   node scripts/extract-zanatomy-limb.mjs <path to a checkout of LluisV/Z-Anatomy>
// Source: https://github.com/LluisV/Z-Anatomy, commit 6c7f9016bd5899ac8edafd31b9900c151df42ed6, "Z-Anatomy PC/Assets/Models/1.0 Models/MuscularSystem100.fbx" and SkeletalSystem100.fbx
// (CC BY-SA 4.0; Z-Anatomy's own Resources/Models/License.txt also asks for the BodyParts3D credit, CC BY-SA 2.1 Japan). Units are cm; one similarity transform per side and
// region (scale, rotation, translation) fitted on the bones both models share (centre of every bone, 0.2 mm residual at the wrist) brings them into the atlas frame.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import * as T from 'three';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
import {weldByPosition, simplify} from './lib/stream-writer.mjs';
import {atlasParts} from './lib/tendon-set.mjs';

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
  return {apply, rms, scale: s};
}
const carpals = ['Capitate', 'Hamate', 'Lunate', 'Pisiform', 'Scaphoid', 'Trapezium', 'Triquetrum'], atlasCarpal = {Triquetrum: 'triquetral'};
const meta = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
const SIDES = [{z: 'r', w: 'Right', l: 'right'}, {z: 'l', w: 'Left', l: 'left'}];
// [Z-Anatomy mesh name (without side letter), name in this atlas, region of the fit, kind]
const WANTED = [
  ['Extensor_retinaculum_of_wrist', 'extensor retinaculum of wrist', 'wrist'], ['Flexor_retinaculum_of_wrist', 'flexor retinaculum of wrist', 'wrist'],
  ['Tendon_sheath_-_abd_pollicis_longus_-_ext_pollicis_brevis', 'first dorsal compartment of wrist', 'wrist'], ['Tendon_sheath_of_extensors_carpi_radialis', 'second dorsal compartment of wrist', 'wrist'],
  ['Tendon_sheath_of_extensor_pollicis_longus', 'third dorsal compartment of wrist', 'wrist'], ['Tendon_sheath_of_extensor_digitorum_and_extensor_indicis', 'fourth dorsal compartment of wrist', 'wrist'],
  ['Tendon_sheath_of_extensor_digiti_minimi_manus', 'fifth dorsal compartment of wrist', 'wrist'], ['Tendon_sheath_of_extensor_carpi_ulnaris', 'sixth dorsal compartment of wrist', 'wrist'],
  ['Common_flexor_tendon_sheath', 'common flexor tendon sheath', 'wrist'], ['Tendon_sheath_of_flexor_pollicis_longus', 'flexor pollicis longus tendon sheath', 'wrist'],
  ['Tendon_sheath_of_flexor_carpi_radialis', 'flexor carpi radialis tendon sheath', 'wrist'], ['Intertubercular_tendon_sheath', 'intertubercular tendon sheath', 'shoulder'],
];
const out = {source: 'Z-Anatomy (LluisV/Z-Anatomy)', commit: COMMIT, license: 'CC BY-SA 4.0 (Z-Anatomy), with the BodyParts3D credit CC BY-SA 2.1 Japan as required by its License.txt', files: {'SkeletalSystem100.fbx': sk.sha, 'MuscularSystem100.fbx': mu.sha}, meshes: []};
for (const S of SIDES) {
  const pairsFor = region => {
    const list = [];
    if (region === 'wrist') {
      list.push([`Radius${S.z}`, `${S.w} radius`], [`Ulna${S.z}`, `${S.w} ulna`], ...carpals.map(c => [`${c}_bone${S.z}`, `${S.w} ${atlasCarpal[c] ?? c.toLowerCase()}`]), ...meta.map(m => [`${m}_metacarpal_bone${S.z}`, `${S.w} ${m.toLowerCase()} metacarpal bone`]));
    } else list.push([`Humerus${S.z}`, `${S.w} humerus`], [`Clavicle${S.z}`, `${S.w} clavicle`], [`Scapula${S.z}`, `${S.w} scapula`]);
    return list;
  };
  const fits = {};
  for (const region of ['wrist', 'shoulder']) {
    const src = [], dst = [];
    for (const [zn, an] of pairsFor(region)) { const m = sk.m.get(zn); if (!m) { console.warn('no Z bone', zn); continue; } src.push(centre(m.positions)); dst.push(centre(atlasBone(an))); }
    fits[region] = fit(src, dst); console.log(S.w, region, src.length, 'bones, scale', fits[region].scale.toFixed(5), 'rms', (fits[region].rms * 1000).toFixed(2), 'mm');
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
fs.writeFileSync(new URL('./data/zanatomy-upper-limb.json.gz', import.meta.url), gzipSync(Buffer.from(JSON.stringify(out)), {level: 9}));
console.log(out.meshes.length, 'meshes vendored');
