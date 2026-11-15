// Maintainer tool (not run by the build): writes public/models/joints.glb (the ligaments, cartilages and joint capsules the viewer registers onto the bones) from the OFFICIAL
// Z-Anatomy joints model.
//   node scripts/extract-zanatomy-joints.mjs <path to a checkout of LluisV/Z-Anatomy> [--check]
// Source: https://github.com/LluisV/Z-Anatomy, commit 6c7f9016bd5899ac8edafd31b9900c151df42ed6, "Resources/Models/FBX/Joints100.fbx"
// (CC BY-SA 4.0; the model's own License.txt also asks for the BodyParts3D credit, CC BY-SA 2.1 Japan). Never taken from any other repository or copy.
//
// The viewer uses 349 of the model's tissues; their names and materials are listed in scripts/data/zanatomy-joints-names.json. Each one is the official mesh with the same name and
// side, converted from centimetres to metres, welded and Draco-encoded; every node is on top level in the model's own frame (no mirrored instances). The four materials (Ligament,
// Cartilage, Articular capsule, Fat) are the project's own colour choices: the official FBX carries the material names only.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import * as T from 'three';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
import {DRACOExporter} from 'three/examples/jsm/exporters/DRACOExporter.js';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const COMMIT = '6c7f9016bd5899ac8edafd31b9900c151df42ed6', FILE = 'Resources/Models/FBX/Joints100.fbx';
const repo = process.argv[2], check = process.argv.includes('--check');
if (!repo) { console.error('usage: node scripts/extract-zanatomy-joints.mjs <Z-Anatomy checkout> [--check]'); process.exit(1); }
const head = execFileSync('git', ['-C', repo, 'rev-parse', 'HEAD']).toString().trim();
if (head !== COMMIT) throw new Error(`the checkout is at ${head}, not the pinned commit ${COMMIT}`);
const root = new URL('../', import.meta.url), req = createRequire(import.meta.url);
const wanted = JSON.parse(fs.readFileSync(new URL('scripts/data/zanatomy-joints-names.json', root), 'utf8')).nodes;
const MATERIALS = {   // project's own colours (linear RGB), matching the look of the viewer's joint tissues
  Ligament: {color: [0.797, 0.997, 0.973, 1], roughness: 0.102}, Cartilage: {color: [0.696, 0.615, 0.568, 1], roughness: 0.317},
  'Articular capsule': {color: [0.561, 0.463, 0.8, 1], roughness: 0.102}, Fat: {color: [0.648, 0.413, 0.1, 1], roughness: 0.202},
};

const fbxBytes = fs.readFileSync(`${repo}/${FILE}`), fbxSha = createHash('sha256').update(fbxBytes).digest('hex');
const scene = new FBXLoader().parse(fbxBytes.buffer.slice(fbxBytes.byteOffset, fbxBytes.byteOffset + fbxBytes.byteLength), ''); scene.updateMatrixWorld(true);
const official = [];
scene.traverse(o => {
  if (!o.isMesh) return;
  const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld);
  const p = g.getAttribute('position'), idx = g.getIndex();
  official.push({name: o.name, positions: Float32Array.from(p.array, v => v * .01), indices: idx ? Uint32Array.from(idx.array) : Uint32Array.from({length: p.count}, (_, i) => i)});
});
// "Superior_pubic_ligamentj" -> key "superiorpubicligament|"  (the side letter l / r is glued on, j means on the midline)
const squash = s => s.toLowerCase().replace(/[\s_\-]+/g, '').replace(/[^a-z0-9.]/g, '');
const keyOfGlb = s => { const m = /^(.*)\.(l|r|j)$/.exec(s); return squash(m ? m[1] : s) + '|' + (m && m[2] !== 'j' ? m[2] : ''); };
const keyOfFbx = s => { const m = /^(.*?)(l|r|j)$/.exec(s); return squash((m ? m[1] : s).replace(/(?<=[a-z])\d{3}$/i, '')) + '|' + (m && m[2] !== 'j' ? m[2] : ''); };
const byKey = new Map(); for (const m of official) (byKey.get(keyOfFbx(m.name)) ?? byKey.set(keyOfFbx(m.name), []).get(keyOfFbx(m.name))).push(m);
const plan = [], missing = [];
for (const w of wanted) { const c = byKey.get(keyOfGlb(w.name)); if (!c) missing.push(w.name); else plan.push([w, c[0], c.length]); }
console.log(`Official joints model: ${official.length} meshes. Of the ${wanted.length} tissues the viewer uses, ${plan.length} are taken from it${missing.length ? `; ${missing.length} have no counterpart and are left out: ${missing.join('; ')}` : ''}.`);
const dup = plan.filter(p => p[2] > 1); if (dup.length) console.log(`  ${dup.length} names have several official meshes (the first is used): ${dup.map(p => p[0].name).join('; ')}`);
if (check) process.exit(0);

fs.mkdirSync(new URL('.sites-runtime/', root), {recursive: true});
fs.copyFileSync(new URL('node_modules/three/examples/jsm/libs/draco/draco_encoder.js', root), new URL('.sites-runtime/extract-draco-encoder.cjs', root));
globalThis.DracoEncoderModule = req(new URL('.sites-runtime/extract-draco-encoder.cjs', root).pathname);
const materialNames = Object.keys(MATERIALS);
const out = {asset: {version: '2.0', generator: 'MJ Anatomy scripts/extract-zanatomy-joints.mjs', extras: {source: 'https://github.com/LluisV/Z-Anatomy', commit: COMMIT, file: FILE, fileSha256: fbxSha, license: 'CC BY-SA 4.0 (Z-Anatomy), with the BodyParts3D credit CC BY-SA 2.1 Japan', note: 'official geometry converted from centimetres to metres, welded and Draco-encoded; materials are this project\'s own colours'}},
  extensionsUsed: ['KHR_draco_mesh_compression'], extensionsRequired: ['KHR_draco_mesh_compression'], scene: 0, scenes: [{nodes: []}], nodes: [], meshes: [], accessors: [], bufferViews: [], buffers: [],
  materials: materialNames.map(n => ({name: n, doubleSided: true, pbrMetallicRoughness: {baseColorFactor: MATERIALS[n].color, metallicFactor: 0, roughnessFactor: MATERIALS[n].roughness}}))};
const chunks = []; let offset = 0;
for (const [w, src] of plan) {
  let g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(src.positions, 3)); g.setIndex(new T.BufferAttribute(src.indices, 1));
  g = mergeVertices(g, 1e-7); g.computeVertexNormals();
  const pos = g.getAttribute('position').array, idx = g.getIndex().array;
  const encoded = Buffer.from(new DRACOExporter().parse(new T.Mesh(g), {quantization: [16, 10, 8, 8, 8], exportUvs: false, exportNormals: true, encodeSpeed: 5, decodeSpeed: 5}));
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (let i = 0; i < pos.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], pos[i + k]); hi[k] = Math.max(hi[k], pos[i + k]); }
  const view = out.bufferViews.push({buffer: 0, byteOffset: offset, byteLength: encoded.length}) - 1;
  chunks.push(encoded); offset += encoded.length; const pad = (4 - (offset % 4)) % 4; if (pad) { chunks.push(Buffer.alloc(pad)); offset += pad; }
  const a = out.accessors.push({componentType: 5126, count: pos.length / 3, type: 'VEC3', min: lo, max: hi}) - 1, n = out.accessors.push({componentType: 5126, count: pos.length / 3, type: 'VEC3'}) - 1, ind = out.accessors.push({componentType: 5125, count: idx.length, type: 'SCALAR'}) - 1;
  const mesh = out.meshes.push({name: w.name, primitives: [{attributes: {POSITION: a, NORMAL: n}, indices: ind, material: Math.max(0, materialNames.indexOf(w.material)), mode: 4, extensions: {KHR_draco_mesh_compression: {bufferView: view, attributes: {POSITION: 0, NORMAL: 1}}}}]}) - 1;
  out.scenes[0].nodes.push(out.nodes.push({name: w.name, mesh, extras: {za_name: w.name, za_system: 'joints'}}) - 1);
}
out.buffers = [{byteLength: offset}];
const json = Buffer.from(JSON.stringify(out)), jpad = (4 - (json.length % 4)) % 4, body = Buffer.concat(chunks), bpad = (4 - (body.length % 4)) % 4;
const header = Buffer.alloc(12); header.write('glTF', 0); header.writeUInt32LE(2, 4);
const jh = Buffer.alloc(8); jh.writeUInt32LE(json.length + jpad, 0); jh.write('JSON', 4); const bh = Buffer.alloc(8); bh.writeUInt32LE(body.length + bpad, 0); bh.writeUInt32LE(0x004e4942, 4);
const total = 12 + 8 + json.length + jpad + 8 + body.length + bpad; header.writeUInt32LE(total, 8);
fs.writeFileSync(new URL('public/models/joints.glb', root), Buffer.concat([header, jh, json, Buffer.alloc(jpad, 0x20), bh, body, Buffer.alloc(bpad)]));
console.log(`Wrote public/models/joints.glb: ${(total / 1e6).toFixed(2)} MB, ${out.nodes.length} tissues; official file sha256 ${fbxSha.slice(0, 16)}…`);
