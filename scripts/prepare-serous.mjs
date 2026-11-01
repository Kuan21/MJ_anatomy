// Serous membranes (visceral/parietal pleura, fibrous pericardium, parietal/visceral serous pericardium). No open model has them as separate layers
// (BodyParts3D has no pleura or pericardium; Z-Anatomy ships one unsplit "Pleura" mesh), so each layer is built by moving the organ surface outward:
// pleura from the lung-lobe surfaces (BodyParts3D 3.0, registered), pericardium from the heart wall surfaces (BodyParts3D 4.0). Offsets in metres.
// Every piece is marked as a schematic model: the thickness and the pleural / pericardial cavities are not to scale.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createStream, simplify, weldByPosition} from './lib/stream-writer.mjs';
import {taubin} from './lib/lung-mesh.mjs';
import {envelope} from './lib/lung-envelope.mjs';
import {indicesOf, positionsOf} from './lib/stream-geometry.mjs';

const root = new URL('../', import.meta.url), models = new URL('public/models/', root), out = new URL('stream/', models);
const read = f => fs.readFileSync(new URL(f, models));
const supplement = JSON.parse(gunzipSync(read('supplement/supplement-stream.json.gz'))), atlas = JSON.parse(read('atlas-stream.json'));
const geometry = (part, chunks, loadChunk) => {
  const b = loadChunk(chunks[part.chunk]);
  return {positions: positionsOf(b, part), indices: indicesOf(b, part)};
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
  ...Object.entries(lungs).map(([side, names]) => [`${side} visceral pleura`, `${side === 'Left' ? '左' : '右'}臟層胸膜`, names.map(supplementGeometry), .0005]),
  ['Visceral layer of serous pericardium', '漿膜心包臟層（心外膜）', heart.map(atlasGeometry), .0006],
  ['Parietal layer of serous pericardium', '漿膜心包壁層', heart.map(atlasGeometry), .0045],
  ['Fibrous pericardium', '纖維心包', heart.map(atlasGeometry), .0075],
];
const stream = createStream(out, 'serous'), report = [];
let n = 0;
/** Parietal pleura of one lung: the 5 mm shell around the lobes (faces between lobes dropped, the pleura does not enter the fissures), with the costal margin
 * pushed down so the lower border lies two ribs below the lung (ribs 8 / 10 / 12 at the mid-clavicular / mid-axillary / paravertebral lines, the costodiaphragmatic
 * recess), the apex raised above the first rib (cupula), then cut into costal, mediastinal, diaphragmatic and cervical parts by normal direction. */
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
async function parietalPleura(side, names) {
  const sign = side === 'Left' ? 1 : -1, pieces = names.map(supplementGeometry);
  // one watertight envelope 5 mm outside the closed lung (the fissures bridged), see lib/lung-envelope.mjs
  const shell = envelope(pieces, {offset: .005});
  const p = shell.positions, ix = shell.indices, nv = p.length / 3, nrm = new Float32Array(p.length);
  for (let t = 0; t < ix.length; t += 3) {
    const [a, b, c] = [ix[t], ix[t + 1], ix[t + 2]];
    const ux = p[b * 3] - p[a * 3], uy = p[b * 3 + 1] - p[a * 3 + 1], uz = p[b * 3 + 2] - p[a * 3 + 2], vx = p[c * 3] - p[a * 3], vy = p[c * 3 + 1] - p[a * 3 + 1], vz = p[c * 3 + 2] - p[a * 3 + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const k of [a, b, c]) { nrm[k * 3] += nx; nrm[k * 3 + 1] += ny; nrm[k * 3 + 2] += nz; }
  }
  let cx = 0, cy = 0, cz = 0; for (let i = 0; i < nv; i++) { cx += p[i * 3] / nv; cy += p[i * 3 + 1] / nv; cz += p[i * 3 + 2] / nv; }
  let out = 0; for (let i = 0; i < nv; i++) out += (p[i * 3] - cx) * nrm[i * 3] + (p[i * 3 + 1] - cy) * nrm[i * 3 + 1] + (p[i * 3 + 2] - cz) * nrm[i * 3 + 2];
  const flip = out < 0 ? -1 : 1, normals = new Float32Array(p.length);
  let top = -Infinity; for (let i = 0; i < nv; i++) top = Math.max(top, p[i * 3 + 1]);
  for (let i = 0; i < nv; i++) {
    const l = Math.hypot(nrm[i * 3], nrm[i * 3 + 1], nrm[i * 3 + 2]) || 1;
    for (let k = 0; k < 3; k++) normals[i * 3 + k] = flip * nrm[i * 3 + k] / l;
    const y = p[i * 3 + 1], z = p[i * 3 + 2], medial = smooth(.3, .8, -sign * normals[i * 3]);
    // costodiaphragmatic recess: drop 20 mm in front (rib 6 -> 8), 35 mm at the side (rib 8 -> 10), 40 mm behind (rib 10 -> 12); fades out above the lower lobe's base
    const drop = (.02 + .02 * smooth(.0, -.08, z) + .015 * smooth(.09, -.02, z)) * (1 - medial) * smooth(1.27, 1.2, y);
    // cupula: the apex projects above the first rib
    const rise = .018 * smooth(top - .05, top - .005, y) * (1 - medial);
    p[i * 3 + 1] = y - drop + rise;
  }
  // The shell was cut triangle by triangle where the lobes touch and bent by the recess and the cupula: smooth it (open borders included) so the edges are curves, not steps.
  taubin(p, ix, {iterations: 12, pinBorder: false});
  const cervicalY = top - .03, parts = {costal: [], mediastinal: [], diaphragmatic: [], cervical: []};
  const labels = [];
  for (let t = 0; t < ix.length; t += 3) {
    let nx = 0, ny = 0, y = 0; for (let k = 0; k < 3; k++) { nx += normals[ix[t + k] * 3] / 3; ny += normals[ix[t + k] * 3 + 1] / 3; y += p[ix[t + k] * 3 + 1] / 3; }
    const group = ny > .2 && y > cervicalY ? 'cervical' : ny < -.45 ? 'diaphragmatic' : -sign * nx > .55 ? 'mediastinal' : 'costal';
    parts[group].push(ix[t], ix[t + 1], ix[t + 2]);
    labels.push(group);
  }
  // Majority filter on the triangle labels: a triangle whose edge neighbours mostly belong to another part joins it, so the borders between costal, mediastinal, diaphragmatic and cervical parts run smoothly.
  const edgeTris = new Map();
  for (let t = 0; t < ix.length; t += 3) for (let k = 0; k < 3; k++) {const a = ix[t + k], b = ix[t + (k + 1) % 3], key = a < b ? a * nv + b : b * nv + a; (edgeTris.get(key) ?? edgeTris.set(key, []).get(key)).push(t / 3);}
  const adjacent = Array.from({length: ix.length / 3}, () => []);
  for (const pair of edgeTris.values()) if (pair.length === 2) {adjacent[pair[0]].push(pair[1]); adjacent[pair[1]].push(pair[0]);}
  for (let round = 0; round < 6; round++) {
    const next = labels.slice();
    for (let t = 0; t < labels.length; t++) {
      const votes = {}; for (const q of adjacent[t]) votes[labels[q]] = (votes[labels[q]] ?? 0) + 1;
      const [best, n] = Object.entries(votes).sort((a, b) => b[1] - a[1])[0] ?? [labels[t], 0];
      if (best !== labels[t] && n >= 2 && (votes[labels[t]] ?? 0) < n) next[t] = best;
    }
    for (let t = 0; t < labels.length; t++) labels[t] = next[t];
  }
  for (const g of Object.keys(parts)) parts[g] = [];
  labels.forEach((g, t) => parts[g].push(ix[t * 3], ix[t * 3 + 1], ix[t * 3 + 2]));
  return {parts, positions: p};
}
const PLEURA_PARTS = [['costal', 'Costal part of', '肋部'], ['mediastinal', 'Mediastinal part of', '縱隔部'], ['diaphragmatic', 'Diaphragmatic part of', '膈部'], ['cervical', 'Cervical part (cupula) of', '頂（胸膜頂部）']];
for (const [side, names] of Object.entries(lungs)) {
  const {parts, positions: pp} = await parietalPleura(side, names);
  for (const [group, en, zh] of PLEURA_PARTS) {
    const ixs = parts[group]; if (!ixs.length) continue;
    const {positions, indices} = await simplify(pp, Uint32Array.from(ixs), 7000, .002);
    stream.add({id: `SERO-${++n}`, conceptId: `SERO-${n}`, name: `${en} ${side.toLowerCase()} parietal pleura`, system: 'serous', schematic: true, chineseName: `${side === 'Left' ? '左' : '右'}壁層胸膜${zh}`}, positions, indices);
    report.push(`${en} ${side.toLowerCase()} parietal pleura: ${indices.length / 3} tris`);
  }
}
for (const [name, zh, pieces, distance] of LAYERS) {
  const shell = offsetSurface(pieces, distance), lung = /pleura/i.test(name), {positions, indices} = await simplify(shell.positions, shell.indices, lung ? 14000 : 9000, lung ? .002 : .006);
  if (lung) taubin(positions, indices, {iterations: 6, pinBorder: false});
  stream.add({id: `SERO-${++n}`, conceptId: `SERO-${n}`, name, system: 'serous', schematic: true, chineseName: zh}, positions, indices);
  report.push(`${name}: ${indices.length / 3} tris, offset ${distance * 1000} mm`);
}
// Pelvic peritoneum (female): the peritoneum covering the uterus and the dome of the bladder, built from the female meshes (prepare-female.mjs runs first) in the
// same way. The vesicouterine and rectouterine pouches are the recesses between these organs and are written by prepare-female.mjs.
{
  const female = JSON.parse(gunzipSync(read('female/female-stream.json.gz')));
  const femaleGeometry = name => geometry(female.parts.find(p => p.name === name) ?? (() => {throw new Error('missing ' + name);})(), female.chunks, c => read('stream/' + c.url.split('/').pop()));
  const bladder = femaleGeometry('Urinary bladder');
  // only the upper half of the bladder is covered by peritoneum (the base and neck lie below the pelvic floor peritoneum)
  let cy = 0; for (let i = 1; i < bladder.positions.length; i += 3) cy += bladder.positions[i] / (bladder.positions.length / 3);
  const dome = {positions: bladder.positions, indices: Uint32Array.from((() => {const keep = []; for (let t = 0; t < bladder.indices.length; t += 3) { const y = (bladder.positions[bladder.indices[t] * 3 + 1] + bladder.positions[bladder.indices[t + 1] * 3 + 1] + bladder.positions[bladder.indices[t + 2] * 3 + 1]) / 3; if (y > cy) keep.push(bladder.indices[t], bladder.indices[t + 1], bladder.indices[t + 2]); } return keep;})())};
  const shell = offsetSurface([femaleGeometry('Body of uterus'), femaleGeometry('Fundus of uterus'), femaleGeometry('Lower uterine segment'), dome], .0015), {positions, indices} = await simplify(shell.positions, shell.indices, 12000, .006);
  stream.add({id: `SERO-${++n}`, conceptId: `SERO-${n}`, name: 'Pelvic peritoneum', system: 'serous', sex: 'female', schematic: true, chineseName: '盆腔腹膜'}, positions, indices);
  report.push(`Pelvic peritoneum: ${indices.length / 3} tris, offset 1.5 mm`);
}
const info = stream.finish({source: 'Generated for this atlas from organ surfaces (BodyParts3D 4.0 heart walls; BodyParts3D 3.0 lung lobes)', license: 'CC BY-SA 2.1 Japan (derived from BodyParts3D)', attribution: 'Schematic serous-membrane shells built by offsetting BodyParts3D organ surfaces. BodyParts3D, Copyright© The Database Center for Life Science licensed by CC Attribution-Share Alike 2.1 Japan.'}, new URL('serous/serous-stream.json.gz', models));
console.log(`Serous membranes: ${info.parts} schematic shells in ${info.chunks} packages, ${(info.gzipBytes / 1e6).toFixed(2)} MB compressed.`);
if (process.argv.includes('--verbose')) console.log(report.join('\n'));
