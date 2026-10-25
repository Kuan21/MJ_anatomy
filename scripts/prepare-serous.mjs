// Serous membranes (visceral/parietal pleura, fibrous pericardium, parietal/visceral serous pericardium). No open model has them as separate layers
// (BodyParts3D has no pleura or pericardium; Z-Anatomy ships one unsplit "Pleura" mesh), so each layer is built by moving the organ surface outward:
// pleura from the lung-lobe surfaces (BodyParts3D 3.0, registered), pericardium from the heart wall surfaces (BodyParts3D 4.0). Offsets in metres.
// Every piece is marked as a schematic model: the thickness and the pleural / pericardial cavities are not to scale.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createStream, simplify, weldByPosition} from './lib/stream-writer.mjs';

const root = new URL('../', import.meta.url), models = new URL('public/models/', root), out = new URL('stream/', models);
const read = f => fs.readFileSync(new URL(f, models));
const supplement = JSON.parse(gunzipSync(read('supplement/supplement-stream.json.gz'))), atlas = JSON.parse(read('atlas-stream.json'));
const geometry = (part, chunks, loadChunk) => {
  const b = loadChunk(chunks[part.chunk]);
  const f32 = (o, n) => new Float32Array(b.buffer.slice(b.byteOffset + o, b.byteOffset + o + n * 4)), u32 = (o, n) => new Uint32Array(b.buffer.slice(b.byteOffset + o, b.byteOffset + o + n * 4));
  return {positions: f32(part.positions, part.vertexCount * 3), indices: u32(part.indices, part.indexCount)};
};
const supplementGeometry = name => geometry(supplement.parts.find(p => p.name === name) ?? (() => {throw new Error('missing ' + name);})(), supplement.chunks, c => read('stream/' + c.url.split('/').pop()));
const atlasGeometry = name => geometry(atlas.parts.find(p => p.name === name) ?? (() => {throw new Error('missing ' + name);})(), atlas.chunks, c => read(c.url.replace(/^\/models\//, '')));

/** Offset a surface along its welded vertex normals. */
function offsetSurface(pieces, distance) {
  const positions = [], indices = [];
  for (const piece of pieces) {
    const {positions: p, indices: ix} = weldByPosition(piece.positions, piece.indices), n = new Float32Array(p.length), base = positions.length / 3;
    for (let t = 0; t < ix.length; t += 3) {
      const [a, b, c] = [ix[t], ix[t + 1], ix[t + 2]];
      const ux = p[b * 3] - p[a * 3], uy = p[b * 3 + 1] - p[a * 3 + 1], uz = p[b * 3 + 2] - p[a * 3 + 2], vx = p[c * 3] - p[a * 3], vy = p[c * 3 + 1] - p[a * 3 + 1], vz = p[c * 3 + 2] - p[a * 3 + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      for (const k of [a, b, c]) {n[k * 3] += nx; n[k * 3 + 1] += ny; n[k * 3 + 2] += nz;}
    }
    // Orient outward: the surface normal should point away from the piece's centroid on average.
    const centre = [0, 0, 0]; for (let i = 0; i < p.length; i += 3) for (let k = 0; k < 3; k++) centre[k] += p[i + k] / (p.length / 3);
    let outward = 0; for (let i = 0; i < p.length; i += 3) outward += (p[i] - centre[0]) * n[i] + (p[i + 1] - centre[1]) * n[i + 1] + (p[i + 2] - centre[2]) * n[i + 2];
    const sign = outward < 0 ? -1 : 1;
    for (let i = 0; i < p.length; i += 3) {
      const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1;
      positions.push(p[i] + sign * n[i] / l * distance, p[i + 1] + sign * n[i + 1] / l * distance, p[i + 2] + sign * n[i + 2] / l * distance);
    }
    for (let t = 0; t < ix.length; t++) indices.push(ix[t] + base);
  }
  return {positions: Float32Array.from(positions), indices: Uint32Array.from(indices)};
}

const lungs = {Right: ['Upper lobe of right lung', 'Middle lobe of right lung', 'Lower lobe of right lung'], Left: ['Upper lobe of left lung', 'Lower lobe of left lung']};
const heart = ['Wall of ventricle', 'Wall of left atrium', 'Wall of right atrium'];
const LAYERS = [ // [name, zh, source pieces, offset, side]
  ...Object.entries(lungs).flatMap(([side, names]) => [
    [`${side} visceral pleura`, `${side === 'Left' ? '左' : '右'}臟層胸膜`, names.map(supplementGeometry), .0005],
    [`${side} parietal pleura`, `${side === 'Left' ? '左' : '右'}壁層胸膜`, names.map(supplementGeometry), .005]]),
  ['Visceral layer of serous pericardium', '漿膜心包臟層（心外膜）', heart.map(atlasGeometry), .0006],
  ['Parietal layer of serous pericardium', '漿膜心包壁層', heart.map(atlasGeometry), .0045],
  ['Fibrous pericardium', '纖維心包', heart.map(atlasGeometry), .0075],
];
const stream = createStream(out, 'serous'), report = [];
let n = 0;
for (const [name, zh, pieces, distance] of LAYERS) {
  const shell = offsetSurface(pieces, distance), {positions, indices} = await simplify(shell.positions, shell.indices, 9000, .006);
  stream.add({id: `SERO-${++n}`, conceptId: `SERO-${n}`, name, system: 'serous', schematic: true, chineseName: zh}, positions, indices);
  report.push(`${name}: ${indices.length / 3} tris, offset ${distance * 1000} mm`);
}
const info = stream.finish({source: 'Generated for this atlas from organ surfaces (BodyParts3D 4.0 heart walls; BodyParts3D 3.0 lung lobes)', license: 'CC BY-SA 2.1 Japan (derived from BodyParts3D)', attribution: 'Schematic serous-membrane shells built by offsetting BodyParts3D organ surfaces. BodyParts3D, Copyright© The Database Center for Life Science licensed by CC Attribution-Share Alike 2.1 Japan.'}, new URL('serous/serous-stream.json.gz', models));
console.log(`Serous membranes: ${info.parts} schematic shells in ${info.chunks} packages, ${(info.gzipBytes / 1e6).toFixed(2)} MB compressed.`);
if (process.argv.includes('--verbose')) console.log(report.join('\n'));
