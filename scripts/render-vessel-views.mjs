// Dumps the left upper limb and left lower limb (arteries, veins, bones) in the poses used for docs/vessel-continuity/*.jpg, posed exactly like scripts/test-vessel-motion.mjs,
// for scripts/render-vessel-views.cjs to draw. The state is chosen by the vessel-ends files on disk: run it once as is ("after"), and once with
//   VESSEL_ENDS_MANIFEST=<old vessel-ends-stream.json.gz>  and  --bindings <old vessel-end-bindings.json>   for "before".
//   node scripts/render-vessel-views.mjs --out <dir> [--bindings <file>]
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadVessels} from './lib/vessel-segments.mjs';
import {loadPoseModule, createPoser} from './lib/vessel-pose.mjs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {smoothTube} from './lib/mesh-smooth.mjs';

const arg = k => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined; };
const out = arg('--out'); if (!out) throw new Error('--out <dir>');
fs.mkdirSync(out, {recursive: true});
const m = await loadPoseModule();
if (arg('--bindings')) {   // state before: the connector bindings of that state
  const old = JSON.parse(fs.readFileSync(arg('--bindings'), 'utf8'));
  for (const t of ['tissueBindings', 'bodyBindings']) for (const k of Object.keys(m[t])) if (k.endsWith('-END')) delete m[t][k];
  Object.assign(m.tissueBindings, old.tissue); Object.assign(m.bodyBindings, old.body);
}
const V = await loadVessels({mode: 'after'});
// The viewer draws limb vessels of up to 3000 triangles Loop-subdivided (scripts/prepare-model-stream.mjs): do the same here so the pictures show what the viewer shows.
{ const g0 = V.g, cache = new Map(); V.g = p => { if (p.system !== 'arterial' && p.system !== 'venous' || p.stream || p.indexCount / 3 > 3000) return g0(p); if (!cache.has(p.id)) { const q = g0(p), s = smoothTube(q.pos, q.idx); cache.set(p.id, {pos: s.positions, idx: s.indices}); } return cache.get(p.id); }; }
const poser = createPoser(V, m), full = loadFullAtlas(), {anatomicalRegion, anatomicalSide} = await (await import('./lib/vessel-segments.mjs')).regionTools();
const POSES = [
  {name: 'upper-neutral', kind: 'arm', key: 'left', pose: {}}, {name: 'shoulder-abd90', kind: 'arm', key: 'left', pose: {shoulderAbduction: 90}}, {name: 'elbow-flex90', kind: 'arm', key: 'left', pose: {elbowFlexion: 90}},
  {name: 'lower-neutral', kind: 'leg', key: 'leftLeg', pose: {}}, {name: 'knee-flex90', kind: 'leg', key: 'leftLeg', pose: {knee: 90}},
];
/** vertex normals from the posed surface, smoothed across duplicated seam vertices (matched by rest position) */
function normals(rest, pos, idx) {
  const key = new Map(), id = new Uint32Array(rest.length / 3);
  for (let i = 0; i < id.length; i++) { const k = `${Math.round(rest[i * 3] * 1e5)},${Math.round(rest[i * 3 + 1] * 1e5)},${Math.round(rest[i * 3 + 2] * 1e5)}`; let v = key.get(k); if (v === undefined) { v = key.size; key.set(k, v); } id[i] = v; }
  const acc = new Float64Array(key.size * 3);
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3, ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2], vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const i of [idx[t], idx[t + 1], idx[t + 2]]) { acc[id[i] * 3] += nx; acc[id[i] * 3 + 1] += ny; acc[id[i] * 3 + 2] += nz; }
  }
  const nor = new Float32Array(pos.length);
  for (let i = 0; i < id.length; i++) { const x = acc[id[i] * 3], y = acc[id[i] * 3 + 1], z = acc[id[i] * 3 + 2], l = Math.hypot(x, y, z) || 1; nor[i * 3] = x / l; nor[i * 3 + 1] = y / l; nor[i * 3 + 2] = z / l; }
  return nor;
}
const rigid = (pos, t) => { if (!t) return pos; const [qx, qy, qz, qw] = t.quaternion, [tx, ty, tz] = t.translation, o = new Float32Array(pos.length); for (let i = 0; i < pos.length; i += 3) { const x = pos[i], y = pos[i + 1], z = pos[i + 2], cx = qy * z - qz * y + qw * x, cy = qz * x - qx * z + qw * y, cz = qx * y - qy * x + qw * z; o[i] = x + 2 * (qy * cz - qz * cy) + tx; o[i + 1] = y + 2 * (qz * cx - qx * cz) + ty; o[i + 2] = z + 2 * (qx * cy - qy * cx) + tz; } return o; };
const matrix = (pos, e) => { const o = new Float32Array(pos.length); for (let i = 0; i < pos.length; i += 3) { const x = pos[i], y = pos[i + 1], z = pos[i + 2]; o[i] = e[0] * x + e[4] * y + e[8] * z + e[12]; o[i + 1] = e[1] * x + e[5] * y + e[9] * z + e[13]; o[i + 2] = e[2] * x + e[6] * y + e[10] * z + e[14]; } return o; };

for (const {name, kind, key, pose} of POSES) {
  const region = kind === 'arm' ? 'upper-limb' : 'lower-limb', ctx = poser.context(kind, key, pose), meshes = [], chunks = [];
  let offset = 0;
  const add = (type, id, nm, rest, pos, idx) => {
    const nor = normals(rest, pos, idx), p = Buffer.from(pos.buffer, pos.byteOffset, pos.byteLength), n = Buffer.from(nor.buffer), i = Buffer.from(Uint32Array.from(idx).buffer);
    meshes.push({type, id, name: nm, vertices: pos.length / 3, indices: idx.length, p: offset, n: offset + p.length, i: offset + p.length + n.length}); chunks.push(p, n, i); offset += p.length + n.length + i.length;
  };
  for (const p of V.parts) {
    if (!(p.system === 'arterial' || p.system === 'venous')) continue;
    const base = p.id.replace(/-END$/, ''), bp = V.byId.get(base) ?? p; if (anatomicalRegion(bp) !== region || anatomicalSide(bp) !== 'left') continue;
    const g = poser.geo(p.id), pos = poser.posed(p.id, kind, key, name, ctx);
    add(p.system === 'arterial' ? 'artery' : 'vein', p.id, p.name, g.pos, pos, g.idx);
  }
  for (const p of full.atlas.parts) {
    if (p.system !== 'skeletal' || anatomicalRegion(p) !== region || anatomicalSide(p) !== 'left') continue;
    const g = full.geometry(p); let pos = g.positions;
    if (kind === 'arm') pos = rigid(pos, ctx.transforms[p.id]); else { const b = m.bodyBindings[p.id]; if (b && b.rig === key && b.frame !== null) pos = matrix(pos, ctx.matrices[b.frame].elements); }
    add('bone', p.id, p.name, g.positions, pos, g.indices);
  }
  fs.writeFileSync(out + '/' + name + '.json', JSON.stringify(meshes)); fs.writeFileSync(out + '/' + name + '.bin', Buffer.concat(chunks));
  console.log(`${name}: ${meshes.length} meshes (${meshes.filter(x => x.type === 'artery').length} arteries, ${meshes.filter(x => x.type === 'vein').length} veins, ${meshes.filter(x => x.type === 'bone').length} bones), ${(offset / 1e6).toFixed(1)} MB`);
}
