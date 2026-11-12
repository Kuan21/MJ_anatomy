// Maintainer tool (not run by the build): re-exports public/models/nervous.glb from the OFFICIAL Z-Anatomy nervous system model.
//   node scripts/extract-zanatomy-nervous.mjs <path to a checkout of LluisV/Z-Anatomy> [--check]
// Source: https://github.com/LluisV/Z-Anatomy, commit 6c7f9016bd5899ac8edafd31b9900c151df42ed6, "Resources/Models/FBX/NervousSystem100.fbx"
// (CC BY-SA 4.0; the model's own License.txt also asks for the BodyParts3D credit, CC BY-SA 2.1 Japan). Never taken from any other repository or copy.
//
// What it does: the glb keeps the container the build scripts and tests already read (node names such as "Radial nerve.l.001", one top-level node per mesh, the four materials,
// the node offsets), but the GEOMETRY of every mesh is the official model's: the FBX mesh with the same name and side, converted from centimetres to metres, re-encoded with Draco.
// A mesh the official model does not contain is left out (its node stays, without a mesh). `--check` only reports the match and writes nothing.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import * as T from 'three';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
import {DRACOExporter} from 'three/examples/jsm/exporters/DRACOExporter.js';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const COMMIT = '6c7f9016bd5899ac8edafd31b9900c151df42ed6', FILE = 'Resources/Models/FBX/NervousSystem100.fbx';
const repo = process.argv[2], check = process.argv.includes('--check');
if (!repo) { console.error('usage: node scripts/extract-zanatomy-nervous.mjs <Z-Anatomy checkout> [--check]'); process.exit(1); }
const head = execFileSync('git', ['-C', repo, 'rev-parse', 'HEAD']).toString().trim();
if (head !== COMMIT) throw new Error(`the checkout is at ${head}, not the pinned commit ${COMMIT}`);
const root = new URL('../', import.meta.url), glbUrl = new URL('public/models/nervous.glb', root), req = createRequire(import.meta.url);

// ---- the official model (centimetres, +Y up, mesh names with underscores and the side letter glued on: "Radial_nerver")
const fbxBytes = fs.readFileSync(`${repo}/${FILE}`), fbxSha = createHash('sha256').update(fbxBytes).digest('hex');
const scene = new FBXLoader().parse(fbxBytes.buffer.slice(fbxBytes.byteOffset, fbxBytes.byteOffset + fbxBytes.byteLength), ''); scene.updateMatrixWorld(true);
const official = [];
scene.traverse(o => {
  if (!o.isMesh) return;
  const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld);
  const p = g.getAttribute('position'), idx = g.getIndex();
  official.push({name: o.name, positions: Float32Array.from(p.array, v => v * .01), indices: idx ? Uint32Array.from(idx.array) : Uint32Array.from({length: p.count}, (_, i) => i)});
});
const squash = s => s.toLowerCase().replace(/[\s_\-]+/g, '').replace(/[^a-z0-9.]/g, '');
const sideOfGlb = s => (/\.(l|r|j|g)(\.\d{3})?$/.exec(s) ?? [])[1] ?? '';
const keyOfGlb = s => squash(s.replace(/\.(l|r|j|g)(\.\d{3})?$/, '').replace(/\.\d{3}$/, '')) + '|' + sideOfGlb(s);
const keyOfFbx = s => { const m = /^(.*?)(l|r|j|g)$/.exec(s); return squash((m ? m[1] : s).replace(/(?<=[a-z])\d{3}$/i, '')) + '|' + (m ? m[2] : ''); };
const byKey = new Map(); for (const m of official) (byKey.get(keyOfFbx(m.name)) ?? byKey.set(keyOfFbx(m.name), []).get(keyOfFbx(m.name))).push(m);

// ---- the current container
const bytes = fs.readFileSync(glbUrl), jsonLen = bytes.readUInt32LE(12), gltf = JSON.parse(bytes.subarray(20, 20 + jsonLen)), bin = bytes.subarray(28 + jsonLen);
// the draco libraries are plain scripts: copy them next to each other as .cjs so that require() takes them (the package is "type": "module")
fs.mkdirSync(new URL('.sites-runtime/', root), {recursive: true});
fs.copyFileSync(new URL('public/draco/draco_wasm_wrapper.js', root), new URL('.sites-runtime/extract-draco-decoder.cjs', root));
fs.copyFileSync(new URL('node_modules/three/examples/jsm/libs/draco/draco_encoder.js', root), new URL('.sites-runtime/extract-draco-encoder.cjs', root));
const draco = await req(new URL('.sites-runtime/extract-draco-decoder.cjs', root).pathname)({wasmBinary: fs.readFileSync(new URL('public/draco/draco_decoder.wasm', root))});
const nodeMatrix = n => n.matrix ? new T.Matrix4().fromArray(n.matrix) : new T.Matrix4().compose(new T.Vector3(...(n.translation ?? [0, 0, 0])), new T.Quaternion(...(n.rotation ?? [0, 0, 0, 1])), new T.Vector3(...(n.scale ?? [1, 1, 1])));
if (gltf.nodes.some(n => (n.children ?? []).length)) throw new Error('the container is expected to be flat (every node on top level)');

const centroidOf = (positions) => { const c = [0, 0, 0], n = positions.length / 3; for (let i = 0; i < positions.length; i += 3) for (let k = 0; k < 3; k++) c[k] += positions[i + k] / n; return c; };
function decodeCurrent(node) {   // world-space positions of the current mesh (to choose between same-named candidates and to report the match)
  const prim = gltf.meshes[node.mesh].primitives[0], ext = prim.extensions.KHR_draco_mesh_compression, view = gltf.bufferViews[ext.bufferView];
  const decoder = new draco.Decoder(), buffer = new draco.DecoderBuffer(), mesh = new draco.Mesh(), data = bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
  buffer.Init(data, data.length); if (!decoder.DecodeBufferToMesh(buffer, mesh).ok()) throw new Error(node.name + ': draco decode failed');
  const values = new draco.DracoFloat32Array(), attribute = decoder.GetAttributeByUniqueId(mesh, ext.attributes.POSITION); decoder.GetAttributeFloatForAllPoints(mesh, attribute, values);
  const m = nodeMatrix(node), v = new T.Vector3(), out = new Float32Array(mesh.num_points() * 3);
  for (let k = 0; k < mesh.num_points(); k++) { v.set(values.GetValue(k * 3), values.GetValue(k * 3 + 1), values.GetValue(k * 3 + 2)).applyMatrix4(m); out.set(v.toArray(), k * 3); }
  for (const o of [values, mesh, decoder, buffer]) draco.destroy(o);
  return out;
}

const report = {matched: 0, omitted: [], moved: [], total: 0};
const plan = [];   // [node, official mesh]
for (const node of gltf.nodes) {
  if (node.mesh === undefined) continue;
  report.total++;
  const cands = byKey.get(keyOfGlb(node.name));
  if (!cands) { report.omitted.push(node.name); continue; }
  let best = cands[0];
  if (cands.length > 1) { const c = centroidOf(decodeCurrent(node)); best = cands.reduce((a, b) => { const d = m => Math.hypot(...centroidOf(m.positions).map((v, k) => v - c[k])); return d(b) < d(a) ? b : a; }); }
  const a = centroidOf(decodeCurrent(node)), b = centroidOf(best.positions), off = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) * 1000;
  if (off > 5) report.moved.push(`${node.name}: official mesh is ${off.toFixed(0)} mm from the current one`);
  plan.push([node, best]); report.matched++;
}
console.log(`Official nervous system: ${official.length} meshes. Container meshes ${report.total}: ${report.matched} take the official geometry, ${report.omitted.length} are left out (${report.omitted.join('; ')}).`);
if (report.moved.length) console.log(`  ${report.moved.length} meshes differ from the current ones by more than 5 mm (the official one is used): ${report.moved.join('; ')}`);
if (check) process.exit(0);

// ---- documented deviations from the official geometry (each one is listed in the glb's asset.extras.adjustments and in docs/official-nerve-stability-review.md)
// 1. The anterior root of the posterior femoral cutaneous nerve starts inside the sciatic nerve and, for the first ~35 mm, its surface lies on the sciatic nerve's surface
//    (parallel faces within 0.15 mm), so the pair draws as noise (z-fighting). Where its faces coincide with the sciatic nerve's, they are moved 0.3 mm inwards along their own
//    normals (the root then runs just under the trunk's surface, as the fibres do inside the sciatic sheath); nothing else of the mesh is touched.
const ADJUSTMENTS = [];
{
  const COINCIDE = {gap: .00015, radius: .006, dot: .995}, INWARD = .0003;
  const facesOf = m => { const out = []; for (let t = 0; t < m.indices.length; t += 3) { const P = m.positions, a = m.indices[t] * 3, b = m.indices[t + 1] * 3, c = m.indices[t + 2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
    let x = uy * vz - uz * vy, y = uz * vx - ux * vz, z = ux * vy - uy * vx; const l = Math.hypot(x, y, z); if (l < 1e-14) continue;
    out.push({t, c: [(P[a] + P[b] + P[c]) / 3, (P[a + 1] + P[b + 1] + P[c + 1]) / 3, (P[a + 2] + P[b + 2] + P[c + 2]) / 3], n: [x / l, y / l, z / l]}); } return out; };
  for (const side of ['l', 'r']) {
    const find = base => official.find(m => keyOfFbx(m.name) === squash(base) + '|' + side);
    const host = find('Sciatic nerve'), root = find('Anterior root of posterior femoral cutaneous nerve');
    if (!host || !root) { console.log(`  adjustment 1 (${side}): sciatic nerve or anterior root not found, skipped`); continue; }
    const fh = facesOf(host), fr = facesOf(root), grid = new Map(), cell = COINCIDE.radius, cellKey = (x, y, z) => `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`;
    for (const f of fh) { const k = cellKey(...f.c); (grid.get(k) ?? grid.set(k, []).get(k)).push(f); }
    const move = new Map(), key = (P, i) => `${Math.round(P[i] * 1e7)},${Math.round(P[i + 1] * 1e7)},${Math.round(P[i + 2] * 1e7)}`;
    let faces = 0;
    for (const f of fr) {
      const [gx, gy, gz] = f.c.map(v => Math.floor(v / cell)); let hit = false;
      for (let u = -1; u <= 1 && !hit; u++) for (let v = -1; v <= 1 && !hit; v++) for (let w = -1; w <= 1 && !hit; w++) for (const h of grid.get(`${gx + u},${gy + v},${gz + w}`) ?? []) {
        const d = [h.c[0] - f.c[0], h.c[1] - f.c[1], h.c[2] - f.c[2]]; if (Math.hypot(...d) > COINCIDE.radius) continue;
        if (h.n[0] * f.n[0] + h.n[1] * f.n[1] + h.n[2] * f.n[2] < COINCIDE.dot) continue;
        if (Math.abs(d[0] * f.n[0] + d[1] * f.n[1] + d[2] * f.n[2]) > COINCIDE.gap) continue; hit = true; break; }
      if (!hit) continue; faces++;
      for (let k = 0; k < 3; k++) { const i = root.indices[f.t + k] * 3, id = key(root.positions, i); const e = move.get(id) ?? move.set(id, [0, 0, 0, 0]).get(id); e[0] += f.n[0]; e[1] += f.n[1]; e[2] += f.n[2]; e[3]++; }
    }
    // every vertex that sits at a moved position moves by the mean normal of the coincident faces at that position (so the seams of the triangle soup stay closed)
    for (let i = 0; i < root.positions.length; i += 3) { const e = move.get(key(root.positions, i)); if (!e) continue; const l = Math.hypot(e[0], e[1], e[2]) || 1; for (let k = 0; k < 3; k++) root.positions[i + k] -= INWARD * e[k] / l; }
    ADJUSTMENTS.push({mesh: `Anterior root of posterior femoral cutaneous nerve.${side}`, change: `${faces} faces that coincide with the sciatic nerve moved 0.3 mm inwards`, vertices: move.size});
    console.log(`  adjustment 1 (${side}): ${faces} root faces coincided with the sciatic nerve; ${move.size} vertex positions moved 0.3 mm inwards`);
  }
}

// ---- write the glb: official geometry, current names, materials and node offsets
globalThis.DracoEncoderModule = req(new URL('.sites-runtime/extract-draco-encoder.cjs', root).pathname);
const out = JSON.parse(JSON.stringify(gltf)); out.accessors = []; out.bufferViews = []; out.meshes = [];
const chunks = []; let offset = 0;
for (const node of out.nodes) {
  if (node.mesh === undefined) continue;
  const hit = plan.find(([n]) => n.name === node.name && gltf.nodes.indexOf(n) === out.nodes.indexOf(node));
  const material = gltf.meshes[node.mesh].primitives[0].material;
  if (!hit) { delete node.mesh; continue; }
  const [src, official_] = hit, inverse = nodeMatrix(src).invert(), v = new T.Vector3(), local = new Float32Array(official_.positions.length);
  for (let i = 0; i < local.length; i += 3) { v.set(official_.positions[i], official_.positions[i + 1], official_.positions[i + 2]).applyMatrix4(inverse); local.set(v.toArray(), i); }
  // the FBX meshes are triangle soup (three vertices per triangle): weld the vertices that share a position, so that the glb is indexed like a normal mesh
  let g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(local, 3)); g.setIndex(new T.BufferAttribute(official_.indices, 1));
  g = mergeVertices(g, 1e-7); g.computeVertexNormals();
  const welded = g.getAttribute('position').array, windex = g.getIndex().array;
  const encoded = Buffer.from(new DRACOExporter().parse(new T.Mesh(g), {quantization: [16, 10, 8, 8, 8], exportUvs: false, exportNormals: true, encodeSpeed: 5, decodeSpeed: 5}));
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (let i = 0; i < welded.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], welded[i + k]); hi[k] = Math.max(hi[k], welded[i + k]); }
  const view = out.bufferViews.push({buffer: 0, byteOffset: offset, byteLength: encoded.length}) - 1;
  chunks.push(encoded); offset += encoded.length; const pad = (4 - (offset % 4)) % 4; if (pad) { chunks.push(Buffer.alloc(pad)); offset += pad; }
  const pos = out.accessors.push({componentType: 5126, count: welded.length / 3, type: 'VEC3', min: lo, max: hi}) - 1, nor = out.accessors.push({componentType: 5126, count: welded.length / 3, type: 'VEC3'}) - 1;
  const ind = out.accessors.push({componentType: 5125, count: windex.length, type: 'SCALAR'}) - 1;
  node.mesh = out.meshes.push({name: node.name, primitives: [{attributes: {POSITION: pos, NORMAL: nor}, indices: ind, material, mode: 4, extensions: {KHR_draco_mesh_compression: {bufferView: view, attributes: {POSITION: 0, NORMAL: 1}}}}]}) - 1;
}
out.buffers = [{byteLength: offset}];
out.asset = {version: '2.0', generator: 'MJ Anatomy scripts/extract-zanatomy-nervous.mjs', extras: {source: 'https://github.com/LluisV/Z-Anatomy', commit: COMMIT, file: FILE, fileSha256: fbxSha, adjustments: ADJUSTMENTS, license: 'CC BY-SA 4.0 (Z-Anatomy), with the BodyParts3D credit CC BY-SA 2.1 Japan', note: 'official geometry converted from centimetres to metres and Draco-encoded; names and materials follow the previous container'}};
const json = Buffer.from(JSON.stringify(out)), jpad = (4 - (json.length % 4)) % 4, body = Buffer.concat(chunks), bpad = (4 - (body.length % 4)) % 4;
const header = Buffer.alloc(12); header.write('glTF', 0); header.writeUInt32LE(2, 4);
const jh = Buffer.alloc(8); jh.writeUInt32LE(json.length + jpad, 0); jh.write('JSON', 4); const bh = Buffer.alloc(8); bh.writeUInt32LE(body.length + bpad, 0); bh.writeUInt32LE(0x004e4942, 4);
const total = 12 + 8 + json.length + jpad + 8 + body.length + bpad; header.writeUInt32LE(total, 8);
fs.writeFileSync(glbUrl, Buffer.concat([header, jh, json, Buffer.alloc(jpad, 0x20), bh, body, Buffer.alloc(bpad)]));
console.log(`Wrote public/models/nervous.glb: ${(total / 1e6).toFixed(2)} MB, ${out.meshes.length} meshes (was ${(bytes.length / 1e6).toFixed(2)} MB, ${gltf.meshes.length}); official file sha256 ${fbxSha.slice(0, 16)}…`);
