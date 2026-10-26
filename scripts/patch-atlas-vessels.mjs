// One-off data fix for BodyParts3D vessels whose course is wrong. The source "superior gluteal vein" runs forward over the iliac fossa and ends in mid-air, while the vein
// leaves the pelvis through the greater sciatic foramen above piriformis with the artery (Gray's Anatomy). Each vertex keeps its offset from the old centre line; the centre line
// moves onto the waypoints below (millimetres, model frame, left side; the right side is mirrored). The script rewrites the affected chunk (.bin and .bin.gz) and the part's bounds in
// public/models/atlas.json, and does nothing when the part has already been moved. Run: node scripts/patch-atlas-vessels.mjs
import fs from 'node:fs';
import {gzipSync} from 'node:zlib';
import {reroute} from './lib/nerve-corrections.mjs';

const root = new URL('../public/models/', import.meta.url);
// The waypoints were searched (2 mm steps, with a smoothness penalty) for the least overlap with the hip bone, piriformis and the superior gluteal artery and its deep branch;
// the vein accompanies the artery out of the pelvis above piriformis and on towards the deep branch.
// The right-hand path is searched separately: the source's two sides are not exact mirror images.
const FIXES = {
  FJ3531: {mirror: false, waypoints: [[18, 929, -71], [30, 937, -61], [46, 940, -72], [60, 942, -69], [72, 947, -66], [82, 956, -63], [92, 967, -59]]},
  FJ3616: {mirror: true, waypoints: [[18, 929, -71], [30, 943, -59], [46, 942, -68], [60, 942, -75], [72, 949, -70], [82, 958, -63], [92, 967, -57]]},
};

const atlasFile = new URL('atlas.json', root), atlas = JSON.parse(fs.readFileSync(atlasFile, 'utf8')), touched = new Map();
const bins = new Map(), bin = i => { if (!bins.has(i)) bins.set(i, fs.readFileSync(new URL('..' + atlas.chunks[i].url, root))); return bins.get(i); };
for (const [id, fix] of Object.entries(FIXES)) {
  const part = atlas.parts.find(p => p.id === id); if (!part) throw new Error(`no atlas part ${id}`);
  const b = bin(part.chunk), n = part.vertexCount, pos = new Float32Array(n * 3);
  for (let i = 0; i < n * 3; i++) pos[i] = b.readFloatLE(part.positions + i * 4);
  // done already when the vein's far end sits at the end of the new path (about 92 mm lateral, 967 mm up)
  const far = Math.abs(fix.mirror ? part.bounds[0][0] : part.bounds[1][0]) * 1000;
  if (far > 85 && part.bounds[1][1] * 1000 > 960) { console.log(`${id}: already moved`); continue; }
  reroute(pos, fix.waypoints, fix.mirror);
  // normals (int16 snorm ×3) from the new triangles
  const idx = Array.from({length: part.indexCount}, (_, i) => b.readUInt32LE(part.indices + i * 4)), nrm = new Float64Array(n * 3);
  for (let t = 0; t < idx.length; t += 3) {
    const [a, c, d] = [idx[t], idx[t + 1], idx[t + 2]], u = [0, 1, 2].map(k => pos[c * 3 + k] - pos[a * 3 + k]), v = [0, 1, 2].map(k => pos[d * 3 + k] - pos[a * 3 + k]);
    const f = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    for (const q of [a, c, d]) for (let k = 0; k < 3; k++) nrm[q * 3 + k] += f[k];
  }
  for (let i = 0; i < n; i++) {
    const l = Math.hypot(nrm[i * 3], nrm[i * 3 + 1], nrm[i * 3 + 2]) || 1;
    for (let k = 0; k < 3; k++) b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, nrm[i * 3 + k] / l)) * 32767), part.normals + (i * 3 + k) * 2);
  }
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) { b.writeFloatLE(pos[i * 3 + k], part.positions + (i * 3 + k) * 4); lo[k] = Math.min(lo[k], pos[i * 3 + k]); hi[k] = Math.max(hi[k], pos[i * 3 + k]); }
  part.bounds = [lo, hi]; touched.set(part.chunk, b); console.log(`${id}: moved onto ${fix.waypoints.length} waypoints`);
}
for (const [i, b] of touched) {
  fs.writeFileSync(new URL('..' + atlas.chunks[i].url, root), b);
  const gz = gzipSync(b, {level: 9}); fs.writeFileSync(new URL('..' + atlas.chunks[i].gzip, root), gz); atlas.chunks[i].gzipBytes = gz.length;
}
if (touched.size) fs.writeFileSync(atlasFile, JSON.stringify(atlas));
