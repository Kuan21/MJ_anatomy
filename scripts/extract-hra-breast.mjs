// One-off extractor: pulls the left and right mammary glands out of the Human Reference Atlas 3D Reference Organs "Left/Right mammary gland, female, v1.1"
// (CC BY 4.0) into scripts/data/hra-female-breast.json.gz, thinned to a size the app can stream. The pieces stay in the HRA frame; scripts/paokao-structures/neck-breast-vulva.mjs
// registers them onto the chest of the atlas.
//   node scripts/extract-hra-breast.mjs /path/to/3d-vh-f-mammary-gland-l.glb /path/to/3d-vh-f-mammary-gland-r.glb
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {simplify, weldByPosition} from './lib/stream-writer.mjs';
const files = process.argv.slice(2);
if (files.length !== 2) throw new Error('usage: extract-hra-breast.mjs <left.glb> <right.glb>');
// Triangle budget per tissue (the source meshes have 30–190 thousand vertices each).
const BUDGET = {fat: 6000, areolar_tubercles: 800, nipple: 1200, areola: 1500, mammary_lobes: 9000, main_lactiferous_ducts: 4000, main_lactiferous_sinuses: 1200, suspensory_ligaments: 5000};
const pieces = [], sources = [];
for (const file of files) {
  const bytes = fs.readFileSync(file), json = JSON.parse(bytes.toString('utf8', 20, 20 + bytes.readUInt32LE(12)));
  const binStart = 20 + bytes.readUInt32LE(12) + 8;
  sources.push({file: file.split('/').pop(), sha256: createHash('sha256').update(bytes).digest('hex')});
  for (const [i, node] of json.nodes.entries()) {
    if (node.mesh === undefined) continue;
    const key = /^VH_F_(.+)_([LR])$/.exec(node.name ?? ''); if (!key || !(key[1] in BUDGET)) throw new Error('unexpected node ' + node.name);
    if (node.matrix || node.translation || node.rotation || node.scale) throw new Error(`node transform on ${node.name}`);
    const prim = json.meshes[node.mesh].primitives[0], pos = json.accessors[prim.attributes.POSITION], idx = json.accessors[prim.indices];
    const view = a => json.bufferViews[a.bufferView], off = a => binStart + (view(a).byteOffset ?? 0) + (a.byteOffset ?? 0);
    const positions = new Float32Array(bytes.buffer.slice(bytes.byteOffset + off(pos), bytes.byteOffset + off(pos) + pos.count * 12));
    const Type = idx.componentType === 5125 ? Uint32Array : Uint16Array;
    const indices = Uint32Array.from(new Type(bytes.buffer.slice(bytes.byteOffset + off(idx), bytes.byteOffset + off(idx) + idx.count * Type.BYTES_PER_ELEMENT)));
    const welded = weldByPosition(positions, indices);
    const thin = await simplify(welded.positions, welded.indices, BUDGET[key[1]], .05);
    pieces.push({name: node.name, tissue: key[1], side: key[2], triangles: thin.indices.length / 3, positions: Buffer.from(thin.positions.buffer, thin.positions.byteOffset, thin.positions.byteLength).toString('base64'), indices: Buffer.from(Uint32Array.from(thin.indices).buffer).toString('base64')});
    console.log(node.name, indices.length / 3, '→', thin.indices.length / 3);
  }
}
const out = {source: 'Human Reference Atlas, 3D Reference Organs: Left / Right mammary gland, female, v1.1', license: 'CC BY 4.0', authors: 'Kristen Browne and Heidi Schlehlein (HuBMAP / Human Reference Atlas)',
  urls: ['https://cdn.humanatlas.io/digital-objects/ref-organ/mammary-gland-female-left/v1.1/assets/3d-vh-f-mammary-gland-l.glb', 'https://cdn.humanatlas.io/digital-objects/ref-organ/mammary-gland-female-right/v1.1/assets/3d-vh-f-mammary-gland-r.glb'], sources, pieces};
fs.writeFileSync(new URL('./data/hra-female-breast.json.gz', import.meta.url), gzipSync(Buffer.from(JSON.stringify(out)), {level: 9}));
console.log(`${pieces.length} pieces`);
