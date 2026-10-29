// Vendor BodyParts3D 3.0 structures that the 4.0 atlas export left out (latissimus dorsi, rectus abdominis, the deep
// abdominal-wall and back muscles, …). Each pinned STL is verified, welded, registered to the 4.0 frame with the same
// similarity transform OMFAtlas fitted for the facial muscles, simplified, and packed into small gzip packages that
// load in stages like every other package. Run with --pin to (re)write the sha256 of each source file.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {MeshoptSimplifier} from 'meshoptimizer';
import {LUNG_LOBES, carveFissures} from './lib/lung-fissures.mjs';
await MeshoptSimplifier.ready;
const pin = process.argv.includes('--pin');
const specUrl = new URL('./supplement-parts.json', import.meta.url), spec = JSON.parse(fs.readFileSync(specUrl, 'utf8'));
const out = new URL('../public/models/stream/', import.meta.url), dir = new URL('../public/models/supplement/', import.meta.url), cache = new URL('../work/supplement/', import.meta.url);
fs.mkdirSync(out, {recursive: true}); fs.mkdirSync(dir, {recursive: true}); fs.mkdirSync(cache, {recursive: true});
const digest = b => createHash('sha256').update(b).digest('hex');
// 3.0 millimetre, Z-up (anterior = −Y) → 4.0 metre, Y-up. Scale and offset are the OMFAtlas facial registration (the offset re-derived from six shared
// facial muscles, all agreeing to 0.02 mm). The two releases are not one rigid body, so the similarity alone drifts from the head (12 mm at the ribs,
// 30 mm at the feet). scripts/supplement-registration.json adds a smooth displacement field fitted on 270 bones both releases share.
const SCALE = 1.059369874098004, OFFSET_MM = [0.04, -21.16, -115.62];
const registration = JSON.parse(fs.readFileSync(new URL('./supplement-registration.json', import.meta.url), 'utf8'));
const control = registration.controlPoints, K = registration.k, FLOOR = registration.floorMm;
function displacement(x, y, z) {
  // K nearest control points, inverse-distance weighted (distance floor, power 2).
  const best = [];
  for (const c of control) {
    const dist = Math.hypot(x - c.src[0], y - c.src[1], z - c.src[2]);
    if (best.length < K || dist < best[best.length - 1].dist) {
      best.push({dist, c}); best.sort((a, b) => a.dist - b.dist); if (best.length > K) best.pop();
    }
  }
  let w = 0, dx = 0, dy = 0, dz = 0;
  for (const {dist, c} of best) {const wi = 1 / Math.max(dist, FLOOR) ** 2; w += wi; dx += wi * c.d[0]; dy += wi * c.d[1]; dz += wi * c.d[2];}
  return [dx / w, dy / w, dz / w];
}
const toAtlas = (x, y, z) => {
  const u = [x, z, -y], d = displacement(u[0], u[1], u[2]);
  return [(SCALE * u[0] + OFFSET_MM[0] + d[0]) / 1000, (SCALE * u[1] + OFFSET_MM[1] + d[1]) / 1000, (SCALE * u[2] + OFFSET_MM[2] + d[2]) / 1000];
};
const MAX_TRIANGLES = 16000;

async function source(part) {
  const file = new URL(`${part.fma}.stl`, cache);
  let bytes; try { bytes = fs.readFileSync(file); } catch {}
  if (!bytes || (!pin && digest(bytes) !== part.sha256)) {
    const url = `https://raw.githubusercontent.com/${spec.repository}/${spec.revision}/assets/BodyParts3D_data/stl/${part.fma}.stl`;
    let error;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const response = await fetch(url, {signal: AbortSignal.timeout(180000)});
        if (!response.ok) throw new Error(`${part.fma}.stl download failed: ${response.status}`);
        bytes = Buffer.from(await response.arrayBuffer()); error = undefined; break;
      } catch (e) { error = e; await new Promise(r => setTimeout(r, 1000 * 2 ** attempt)); }
    }
    if (error) throw error;
    fs.writeFileSync(file, bytes);
  }
  if (pin) part.sha256 = digest(bytes);
  else if (digest(bytes) !== part.sha256) throw new Error(`${part.fma}.stl checksum mismatch`);
  return bytes;
}

function weld(bytes) {
  const count = bytes.readUInt32LE(80);
  if (bytes.length !== 84 + count * 50) throw new Error('not a binary STL');
  const map = new Map(), positions = [], indices = new Uint32Array(count * 3);
  for (let t = 0; t < count; t++) for (let v = 0; v < 3; v++) {
    const o = 84 + t * 50 + 12 + v * 12, x = bytes.readFloatLE(o), y = bytes.readFloatLE(o + 4), z = bytes.readFloatLE(o + 8), key = `${x},${y},${z}`;
    let index = map.get(key);
    if (index === undefined) { index = positions.length / 3; map.set(key, index); positions.push(...toAtlas(x, y, z)); }
    indices[t * 3 + v] = index;
  }
  return {positions: Float32Array.from(positions), indices};
}

function normalsOf(positions, indices) {
  const n = new Float32Array(positions.length);
  for (let i = 0; i < indices.length; i += 3) {
    const [a, b, c] = [indices[i], indices[i + 1], indices[i + 2]];
    const ux = positions[b * 3] - positions[a * 3], uy = positions[b * 3 + 1] - positions[a * 3 + 1], uz = positions[b * 3 + 2] - positions[a * 3 + 2];
    const vx = positions[c * 3] - positions[a * 3], vy = positions[c * 3 + 1] - positions[a * 3 + 1], vz = positions[c * 3 + 2] - positions[a * 3 + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const k of [a, b, c]) { n[k * 3] += nx; n[k * 3 + 1] += ny; n[k * 3 + 2] += nz; }
  }
  const out = new Int16Array(n.length);
  // Vertices only touched by zero-area triangles have no surface normal; point them away from the mesh centre so every packed normal is a unit vector.
  const centre = [0, 0, 0]; for (let i = 0; i < positions.length; i += 3) for (let k = 0; k < 3; k++) centre[k] += positions[i + k] / (positions.length / 3);
  for (let i = 0; i < n.length; i += 3) {
    let l = Math.hypot(n[i], n[i + 1], n[i + 2]);
    if (l < 1e-18) { for (let k = 0; k < 3; k++) n[i + k] = positions[i + k] - centre[k]; l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1; if (l === 1 && !n[i] && !n[i + 1] && !n[i + 2]) n[i + 1] = 1; }
    for (let k = 0; k < 3; k++) out[i + k] = Math.round(n[i + k] / l * 32767);
  }
  return out;
}

const chunks = [], parts = []; let slices = [], size = 0; const report = [];
const append = data => { const padding = (4 - size % 4) % 4; if (padding) { slices.push(Buffer.alloc(padding)); size += padding; } const start = size; slices.push(data); size += data.length; return start; };
const flush = () => {
  if (!size) return;
  const data = Buffer.concat(slices), name = `supplement-${digest(data).slice(0, 20)}.bin`, gzip = gzipSync(data, {level: 9});
  fs.writeFileSync(new URL(name, out), data); fs.writeFileSync(new URL(name + '.gz', out), gzip);
  chunks.push({url: '/models/stream/' + name, gzip: '/models/stream/' + name + '.gz', bytes: data.length, gzipBytes: gzip.length}); slices = []; size = 0;
};
// Everything up to the packed positions of one part: weld, simplify, compact.
async function prepared(part) {
  const bytes = await source(part), {positions: fullPositions, indices: fullIndices} = weld(bytes);
  const [simplified, error] = MeshoptSimplifier.simplify(fullIndices, fullPositions, 3, Math.min(fullIndices.length, MAX_TRIANGLES * 3), .004);
  const [remap, vertexCount] = MeshoptSimplifier.compactMesh(simplified);
  const positions = new Float32Array(vertexCount * 3);
  for (let old = 0; old < remap.length; old++) { const k = remap[old]; if (k !== 0xffffffff) positions.set(fullPositions.subarray(old * 3, old * 3 + 3), k * 3); }
  return {positions, simplified, vertexCount, error, fullIndices};
}
// The lung lobes of one lung are carved together so that each fissure opens as a slit between two lobes (scripts/lib/lung-fissures.mjs).
const carved = new Map();
for (const [side, fmas] of Object.entries(LUNG_LOBES)) {
  const lobes = []; for (const fma of fmas) {const part = spec.parts.find(p => p.fma === fma); if (!part) throw new Error(`lung lobe ${fma} is not in supplement-parts.json`); const g = await prepared(part); carved.set(fma, g); lobes.push({positions: g.positions, indices: g.simplified});}
  report.push(`${side} lung fissures: ${carveFissures(lobes).join(' / ')} vertices moved inward`);
}
for (const part of spec.parts) {
  const {positions, simplified, vertexCount, error, fullIndices} = carved.get(part.fma) ?? await prepared(part);
  const normals = normalsOf(positions, simplified);
  const bounds = [[Infinity, Infinity, Infinity], [-Infinity, -Infinity, -Infinity]];
  for (let i = 0; i < positions.length; i += 3) for (let k = 0; k < 3; k++) { bounds[0][k] = Math.min(bounds[0][k], positions[i + k]); bounds[1][k] = Math.max(bounds[1][k], positions[i + k]); }
  const pos = Buffer.from(positions.buffer), nor = Buffer.from(normals.buffer), idx = Buffer.from(simplified.buffer, simplified.byteOffset, simplified.byteLength);
  if (size && size + pos.length + nor.length + idx.length > 750000) flush();
  parts.push({id: `BP3S-${part.fma}`, conceptId: part.fma, name: part.name, system: part.system, chunk: chunks.length, vertexCount, indexCount: simplified.length, bounds,
    positions: append(pos), normals: append(nor), indices: append(idx), sourceSha256: part.sha256});
  report.push(`${part.fma} ${(fullIndices.length / 3 / 1000).toFixed(0)}k→${(simplified.length / 3 / 1000).toFixed(1)}k tris (err ${error.toFixed(4)})`);
}
flush();
if (pin) { fs.writeFileSync(specUrl, JSON.stringify(spec, null, 1).replace(/\n\s+\{"fma"/g, '\n  {"fma"').replace(/",\n\s+"name"/g, '","name"').replace(/",\n\s+"system"/g, '","system"').replace(/",\n\s+"sha256"/g, '","sha256"')); }
const manifest = {source: `BodyParts3D 3.0 (${spec.repository}@${spec.revision.slice(0, 12)})`, license: spec.license, attribution: 'BodyParts3D, Copyright© The Database Center for Life Science licensed by CC Attribution-Share Alike 2.1 Japan', parts, chunks};
fs.writeFileSync(new URL('supplement-stream.json.gz', dir), gzipSync(Buffer.from(JSON.stringify(manifest)), {level: 9}));
console.log(`Supplement structures: ${parts.length} pieces in ${chunks.length} packages, ${(chunks.reduce((n, c) => n + c.gzipBytes, 0) / 1e6).toFixed(2)} MB compressed.`);
if (process.argv.includes('--verbose')) console.log(report.join('\n'));
