// One-off extractor: pulls the female pelvic bones out of the Human Reference Atlas "3D Reference Organ Set for Female v1.5" (united-female GLB, CC BY 4.0)
// into scripts/data/hra-female-pelvis-bones.json.gz: sacrum, coccyx and the compact bone of the ilium, ischium and pubis on each side (v1.10 lacks the
// ischium and pubis; v1.5 has all of them in the same frame), plus the centres of the two femoral heads, which prepare-female-pelvis.mjs uses to seat the
// pelvis on the atlas femurs.
//   node scripts/extract-hra-pelvis-bones.mjs /path/to/3d-vh-f-united.glb
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
const file = process.argv[2];
if (!file) throw new Error('usage: extract-hra-pelvis-bones.mjs <united-female.glb>');
const bytes = fs.readFileSync(file), json = JSON.parse(bytes.toString('utf8', 20, 20 + bytes.readUInt32LE(12)));
const binStart = 20 + bytes.readUInt32LE(12) + 8, sha = createHash('sha256').update(bytes).digest('hex');
const WANT = /^VH_F_(sacrum|coccyx|(ilium|ischium|pubis)_compact_bone_[LR])$/;
const geometry = node => {
  if (node.matrix || node.translation || node.rotation || node.scale) throw new Error(`node transform on ${node.name}`);
  const prim = json.meshes[node.mesh].primitives[0], pos = json.accessors[prim.attributes.POSITION], idx = json.accessors[prim.indices];
  const view = a => json.bufferViews[a.bufferView], off = a => binStart + (view(a).byteOffset ?? 0) + (a.byteOffset ?? 0);
  const positions = new Float32Array(bytes.buffer.slice(bytes.byteOffset + off(pos), bytes.byteOffset + off(pos) + pos.count * 12));
  const Type = idx.componentType === 5125 ? Uint32Array : Uint16Array;
  const raw = new Type(bytes.buffer.slice(bytes.byteOffset + off(idx), bytes.byteOffset + off(idx) + idx.count * Type.BYTES_PER_ELEMENT));
  return {positions, indices: Uint32Array.from(raw)};
};
// Least-squares sphere through the points (fixed-point iteration on the centre).
function sphereFit(pts) {
  let c = [0, 0, 0]; for (const p of pts) for (let k = 0; k < 3; k++) c[k] += p[k] / pts.length;
  let r = 0;
  for (let it = 0; it < 40; it++) {
    const d = pts.map(p => Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2])); r = d.reduce((a, b) => a + b, 0) / d.length;
    const s = [0, 0, 0]; pts.forEach((p, i) => { for (let k = 0; k < 3; k++) s[k] += (p[k] - r * (p[k] - c[k]) / d[i]) / pts.length; }); c = s;
  }
  return {center: c, radius: r};
}
const pieces = [], heads = {};
json.nodes.forEach((node, i) => {
  if (node.mesh === undefined) return;
  const name = node.name ?? '';
  if (WANT.test(name)) {
    const {positions, indices} = geometry(node);
    pieces.push({node: i, name, label: node.extras?.label, ontology: node.extras?.ontologyid, vertexCount: positions.length / 3, indexCount: indices.length,
      positions: Buffer.from(positions.buffer).toString('base64'), indices: Buffer.from(indices.buffer).toString('base64')});
  }
  const femur = /^VH_F_femur_([LR])$/.exec(name);
  if (femur) { // femoral head: the medial half of the top 5 cm of the shaft's upper end
    const P = geometry(node).positions; let top = -Infinity; for (let k = 1; k < P.length; k += 3) top = Math.max(top, P[k]);
    const cand = []; for (let k = 0; k < P.length; k += 3) if (P[k + 1] > top - .05) cand.push([P[k], P[k + 1], P[k + 2]]);
    const xs = cand.map(p => p[0]).sort((a, b) => a - b), mid = xs[xs.length >> 1], left = femur[1] === 'L';
    heads[femur[1]] = sphereFit(cand.filter(p => left ? p[0] < mid : p[0] > mid));
  }
});
const out = {source: 'Human Reference Atlas, 3D Reference Organ Set for Female v1.5 (united-female GLB)', doi: 'https://doi.org/10.48539/HBM352.BTSQ.586', license: 'CC BY 4.0',
  url: 'https://cdn.humanatlas.io/digital-objects/ref-organ/united-female/v1.5/assets/3d-vh-f-united.glb', sourceSha256: sha, authors: 'Kristen Browne and Heidi Schlehlein', femoralHeads: heads, pieces};
fs.writeFileSync(new URL('./data/hra-female-pelvis-bones.json.gz', import.meta.url), gzipSync(Buffer.from(JSON.stringify(out)), {level: 9}));
console.log(`${pieces.length} pieces, ${pieces.reduce((n, p) => n + p.vertexCount, 0)} vertices, femoral heads ${JSON.stringify(heads)}, sha256 ${sha}`);
