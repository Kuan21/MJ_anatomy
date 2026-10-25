// One-off extractor: pulls the female pelvic organs out of the Human Reference Atlas "3D Reference Organ Set for Female v1.5" (united-female GLB,
// CC BY 4.0, 212 MB) into scripts/data/hra-female-pelvis.json.gz, so the build never has to download the whole body.
//   node scripts/extract-hra-female.mjs /path/to/3d-vh-f-united.glb
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
const file = process.argv[2];
if (!file) throw new Error('usage: extract-hra-female.mjs <united-female.glb>');
const bytes = fs.readFileSync(file), json = JSON.parse(bytes.toString('utf8', 20, 20 + bytes.readUInt32LE(12)));
const binStart = 20 + bytes.readUInt32LE(12) + 8, sha = createHash('sha256').update(bytes).digest('hex');
const parents = new Map(); json.nodes.forEach((n, i) => (n.children ?? []).forEach(c => parents.set(c, i)));
const WANT = /^VH_F_(vagina|cervicovaginal_junction|ampulla_of_uterine_tube_[LR]|isthmus_of_fallopian_tube_[LR]|fibria_of_uterine_tube_[LR]|uterine_tube_infundibulum_[LR]|(left|right)_round_ligament_of_uterus|(left|right)_uterosacral_ligament|(left|right)_cardinal_ligament_of_uterus|suspensory_ligament_of_ovary_[LR]|ovarian_ligament_[LR]|broad_ligament|mesovarium_[LR]|(left|right)_ovary|body_of_uterus|fundus_of_uterus|lower_uterine_segment|cervix|(left|right)_uterine_artery|(left|right)_uterine_vein)$/;
const pieces = [];
json.nodes.forEach((node, i) => {
  if (node.mesh === undefined || !WANT.test(node.name ?? '')) return;
  for (let p = parents.get(i); p !== undefined; p = parents.get(p)) { const n = json.nodes[p]; if (n.matrix || n.translation || n.rotation || n.scale) throw new Error(`parent transform on ${node.name}`); }
  if (node.matrix || node.translation || node.rotation || node.scale) throw new Error(`node transform on ${node.name}`);
  const prim = json.meshes[node.mesh].primitives[0], pos = json.accessors[prim.attributes.POSITION], idx = json.accessors[prim.indices];
  const view = a => json.bufferViews[a.bufferView], off = a => binStart + (view(a).byteOffset ?? 0) + (a.byteOffset ?? 0);
  const positions = new Float32Array(bytes.buffer.slice(bytes.byteOffset + off(pos), bytes.byteOffset + off(pos) + pos.count * 12));
  const Type = idx.componentType === 5125 ? Uint32Array : Uint16Array;
  const raw = new Type(bytes.buffer.slice(bytes.byteOffset + off(idx), bytes.byteOffset + off(idx) + idx.count * Type.BYTES_PER_ELEMENT));
  const indices = Uint32Array.from(raw);
  pieces.push({node: i, name: node.name, label: node.extras?.label, ontology: node.extras?.ontologyid, vertexCount: pos.count, indexCount: idx.count,
    positions: Buffer.from(positions.buffer).toString('base64'), indices: Buffer.from(indices.buffer).toString('base64')});
});
const out = {source: 'Human Reference Atlas, 3D Reference Organ Set for Female v1.5 (united-female GLB)', doi: 'https://doi.org/10.48539/HBM352.BTSQ.586', license: 'CC BY 4.0',
  url: 'https://cdn.humanatlas.io/digital-objects/ref-organ/united-female/v1.5/assets/3d-vh-f-united.glb', sourceSha256: sha, authors: 'Kristen Browne and Heidi Schlehlein', pieces};
fs.writeFileSync(new URL('./data/hra-female-pelvis.json.gz', import.meta.url), gzipSync(Buffer.from(JSON.stringify(out)), {level: 9}));
console.log(`${pieces.length} pieces, ${pieces.reduce((n, p) => n + p.vertexCount, 0)} vertices, sha256 ${sha}`);
