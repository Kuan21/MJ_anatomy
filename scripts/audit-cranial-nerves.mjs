// Where each cranial nerve root leaves the brainstem, measured on the real meshes of the brain detail model (public/models/brain.glb): for every nerve (left and right) the
// vertices of the nerve mesh closest to the brainstem structures are the root; its position is compared with the textbook exit site (landmarks of the same model).
// Run: node scripts/audit-cranial-nerves.mjs [--write]   (--write writes docs/cranial-nerves.md)
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {Matrix4, Quaternion, Vector3} from 'three';
const root = new URL('../', import.meta.url);
const draco = await createRequire(import.meta.url)(new URL('.sites-runtime/nerve-draco.cjs', root).pathname)({wasmBinary: fs.readFileSync(new URL('public/draco/draco_decoder.wasm', root))});
const bytes = fs.readFileSync(new URL('public/models/brain.glb', root)), n = bytes.readUInt32LE(12), gltf = JSON.parse(bytes.subarray(20, 20 + n)), bin = bytes.subarray(28 + n);
const parents = new Map(), world = []; gltf.nodes.forEach((node, i) => (node.children ?? []).forEach(c => parents.set(c, i)));
const matrix = i => world[i] ?? (world[i] = (() => { const node = gltf.nodes[i], m = node.matrix ? new Matrix4().fromArray(node.matrix) : new Matrix4().compose(new Vector3(...(node.translation ?? [0, 0, 0])), new Quaternion(...(node.rotation ?? [0, 0, 0, 1])), new Vector3(...(node.scale ?? [1, 1, 1]))); const p = parents.get(i); return p === undefined ? m : new Matrix4().multiplyMatrices(matrix(p), m); })());
const meshes = [];
for (const [i, node] of gltf.nodes.entries()) {
  if (node.mesh === undefined) continue;
  const prim = gltf.meshes[node.mesh].primitives[0], ext = prim.extensions.KHR_draco_mesh_compression, view = gltf.bufferViews[ext.bufferView];
  const decoder = new draco.Decoder(), buffer = new draco.DecoderBuffer(), mesh = new draco.Mesh(), data = bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
  buffer.Init(data, data.length); decoder.DecodeBufferToMesh(buffer, mesh);
  const values = new draco.DracoFloat32Array(), attr = decoder.GetAttributeByUniqueId(mesh, ext.attributes.POSITION); decoder.GetAttributeFloatForAllPoints(mesh, attr, values);
  const pts = [], v = new Vector3(), M = matrix(i);
  for (let k = 0; k < mesh.num_points(); k++) { v.set(values.GetValue(k * 3), values.GetValue(k * 3 + 1), values.GetValue(k * 3 + 2)).applyMatrix4(M); pts.push([v.x, v.y, v.z]); }
  meshes.push({name: node.name ?? '', cat: node.extras?.bx_cat, label: node.extras?.bx_label, pts});
  for (const o of [values, mesh, decoder, buffer]) draco.destroy(o);
}
const bb = pts => { const lo = [9, 9, 9], hi = [-9, -9, -9]; for (const p of pts) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], p[k]); hi[k] = Math.max(hi[k], p[k]); } return {lo, hi}; };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const side = name => /\.l$|\.l\.|left/i.test(name) ? 'L' : /\.r$|\.r\.|right/i.test(name) ? 'R' : '?';
const stem = meshes.filter(m => m.cat === 'brainstem' && /^(midbrain|pons|medulla oblongata)$/i.test(m.label));
const stemPts = stem.flatMap(m => m.pts);
const find = (label, s) => meshes.find(m => m.label === label && (!s || side(m.name) === s || bb(m.pts).lo[0] * (s === 'L' ? 1 : -1) >= -0.001));
const byLabel = (label, s) => meshes.filter(m => m.label === label).find(m => { const b = bb(m.pts), cx = (b.lo[0] + b.hi[0]) / 2; return s === 'L' ? cx > 0 : cx < 0; });
const cranial = meshes.filter(m => m.cat === 'cranial_nerves');
const CN = [['I', 'Olfactory nerve (I)'], ['II', 'Optic nerve (II)'], ['III', 'Oculomotor nerve (III)'], ['IV', 'Trochlear nerve (IV)'], ['V', 'Trigeminal nerve (V)'], ['VI', 'Abducens nerve (VI)'], ['VII', 'Facial nerve (VII)'], ['VIII', 'Vestibulocochlear nerve (VIII)'], ['IX', 'Glossopharyngeal nerve (IX)'], ['X', 'Vagus nerve (X)'], ['XI', 'Accessory nerve (XI)'], ['XII', 'Hypoglossal nerve (XII)']];
const LANDMARKS = ['Interpeduncular fossa', 'Inferior colliculus', 'Superior colliculus', 'Olive', 'Pyramid of medulla oblongata', 'Middle cerebellar peduncle', 'Inferior cerebellar peduncle', 'Superior cerebellar peduncle', 'Flocculus', 'Peduncle of flocculus', 'Pons', 'Midbrain', 'Medulla oblongata', 'Optic chiasm', 'Orbital gyri'];
const lmPts = LANDMARKS.map(l => ({l, pts: meshes.filter(m => m.label === l).flatMap(m => m.pts).filter((_, k) => k % 3 === 0)}));
const rows = [];
for (const [num, label] of CN) for (const s of ['L', 'R']) {
  const m = cranial.find(c => c.label === label && side(c.name) === s) ?? byLabel(label, s);
  if (!m) { rows.push({num, s, missing: true}); continue; }
  const sub = stemPts.filter((_, k) => k % 5 === 0), withD = m.pts.map(p => ({p, d: Math.min(...sub.map(q => dist(p, q)))})), gap = Math.min(...withD.map(r => r.d));
  // contact patch: vertices within 1.5 mm of the brainstem surface (for I and II: of the frontal lobe / chiasm, reported separately)
  const patch = withD.filter(r => r.d <= gap + .0015).map(r => r.p), pb = bb(patch), centre = [0, 1, 2].map(k => patch.reduce((t, p) => t + p[k], 0) / patch.length);
  const tally = {};
  for (const p of patch.filter((_, k) => k % 2 === 0)) { let best = null; for (const L of lmPts) for (const q of L.pts) { const d = dist(p, q); if (!best || d < best.d) best = {d, l: L.l}; } tally[best.l] = (tally[best.l] || 0) + 1; }
  const top = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([l, c]) => `${l} ${c}`).join(', ');
  rows.push({num, s, label: m.name, verts: m.pts.length, patchN: patch.length, centre: centre.map(x => +x.toFixed(4)), lo: pb.lo.map(x => +x.toFixed(3)), hi: pb.hi.map(x => +x.toFixed(3)), gap: +(gap * 1000).toFixed(1), near: top, box: bb(m.pts)});
}
const out = {rows, stem: stem.map(m => ({label: m.label, ...bb(m.pts)}))};
fs.writeFileSync('/tmp/claude-0/cn-audit.json', JSON.stringify(out));
for (const r of rows) console.log(r.num, r.s, r.missing ? 'MISSING' : `${r.verts}v gap ${r.gap}mm patch ${r.patchN}v centre ${r.centre} ${r.lo}..${r.hi} | nearest: ${r.near}`);
// The main atlas nerve layer (public/models/nerve-stream.json, Z-Anatomy nervous.glb) has the same nerves plus the ones missing from the brain model; measured the same way.
import zlib from 'node:zlib';
const stream = JSON.parse(fs.readFileSync(new URL('public/models/nerve-stream.json', root), 'utf8')), extra = [];
for (const c of stream.chunks) { const raw = zlib.gunzipSync(fs.readFileSync(new URL('public' + c.url, root))); for (const m of c.meshes) if (/\((VIII|IX)\)/.test(m.name)) { const f = new Float32Array(raw.buffer.slice(raw.byteOffset + m.positions, raw.byteOffset + m.positions + m.vertexCount * 12)); const pts = []; for (let i = 0; i < f.length; i += 3) pts.push([f[i], f[i + 1], f[i + 2]]); extra.push({name: m.name, pts}); } }
for (const m of extra) {
  const sub = stemPts.filter((_, k) => k % 5 === 0), withD = m.pts.map(p => ({p, d: Math.min(...sub.map(q => dist(p, q)))})), gap = Math.min(...withD.map(r => r.d)), patch = withD.filter(r => r.d <= gap + .0015).map(r => r.p), pb = bb(patch);
  const tally = {}; for (const p of patch.filter((_, k) => k % 2 === 0)) { let best = null; for (const L of lmPts) for (const q of L.pts) { const d = dist(p, q); if (!best || d < best.d) best = {d, l: L.l}; } tally[best.l] = (tally[best.l] || 0) + 1; }
  console.log('stream', m.name, m.pts.length + 'v', 'gap', +(gap * 1000).toFixed(1) + 'mm', 'patch', patch.length, pb.lo.map(x => +x.toFixed(3)) + '..' + pb.hi.map(x => +x.toFixed(3)), Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([l, c]) => l + ' ' + c).join(', '));
}
