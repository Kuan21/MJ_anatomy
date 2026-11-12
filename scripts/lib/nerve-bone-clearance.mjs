// Keeps nerve tubes out of the bones. The Z-Anatomy nerves were registered to the BodyParts3D skeleton by landmarks only, so in places a tube runs through a bone (the foot nerves
// through the metatarsals, the plantar nerves through the calcaneus, the saphenous trunk through the tibia ...). Every nerve vertex that lies inside a leg or foot bone is moved out
// through the nearest point of the bone surface (plus a small margin), and the move is spread along the tube (diffusion over the mesh, fading to zero 25 mm away) so the tube stays
// smooth and keeps its thickness. Works on the same atlas meshes the viewer draws; runs at build time inside scripts/prepare-nerve-stream.mjs.
import fs from 'node:fs';
import {meshOf, closest} from './heart-geom.mjs';

const root = new URL('../../', import.meta.url);
/** Bones a leg or foot nerve must not enter (the sacrum is left out: the sacral roots really do run in its canal and foramina). */
const OBSTACLE = /^(Right|Left) (femur|tibia|fibula|patella|hip bone|calcaneus|talus|cuboid bone|(first|second|third|fourth|fifth) metatarsal bone|(medial|intermediate|lateral) cuneiform bone)$|^Navicular bone of (left|right) foot$|^(Proximal|Middle|Distal) phalanx of (left|right) (big|second|third|fourth|little) toe$|^Sesamoid bone of (left|right) foot$/;

let cache = null;
/** The obstacle bones as {name, mesh, tri (Float64 9 per triangle), box (y/z extent per triangle), lo, hi}, read from public/models (atlas.json and the body-N.bin packages). */
export function loadObstacles() {
  if (cache) return cache;
  const atlas = JSON.parse(fs.readFileSync(new URL('public/models/atlas.json', root))), chunks = new Map();
  const chunk = i => { if (!chunks.has(i)) chunks.set(i, fs.readFileSync(new URL('public' + atlas.chunks[i].url, root))); return chunks.get(i); };
  cache = [];
  for (const p of atlas.parts) {
    if (!OBSTACLE.test(p.name)) continue;
    const b = chunk(p.chunk), positions = new Float32Array(b.buffer.slice(b.byteOffset + p.positions, b.byteOffset + p.positions + p.vertexCount * 12)), indices = new Uint32Array(b.buffer.slice(b.byteOffset + p.indices, b.byteOffset + p.indices + p.indexCount * 4));
    const nt = indices.length / 3, tri = new Float64Array(nt * 9), box = new Float64Array(nt * 4);
    for (let t = 0; t < nt; t++) {
      for (let k = 0; k < 3; k++) for (let a = 0; a < 3; a++) tri[t * 9 + k * 3 + a] = positions[indices[t * 3 + k] * 3 + a];
      box[t * 4] = Math.min(tri[t * 9 + 1], tri[t * 9 + 4], tri[t * 9 + 7]); box[t * 4 + 1] = Math.max(tri[t * 9 + 1], tri[t * 9 + 4], tri[t * 9 + 7]);
      box[t * 4 + 2] = Math.min(tri[t * 9 + 2], tri[t * 9 + 5], tri[t * 9 + 8]); box[t * 4 + 3] = Math.max(tri[t * 9 + 2], tri[t * 9 + 5], tri[t * 9 + 8]);
    }
    const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
    for (let i = 0; i < positions.length; i += 3) for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], positions[i + a]); hi[a] = Math.max(hi[a], positions[i + a]); }
    cache.push({name: p.name, positions, indices, tri, box, nt, lo, hi, mesh: null});
  }
  return cache;
}
const meshOfBone = b => b.mesh ??= meshOf(b.positions, b.indices);

const DIRS = [[1, .0013, .0021], [.0017, 1, .0011], [.0009, .0019, 1]];
/** Is the point (metres) inside the bone? Odd crossing count along two of three rays. */
export function inside(b, p) {
  const e = .003; if (p[0] < b.lo[0] - e || p[0] > b.hi[0] + e || p[1] < b.lo[1] - e || p[1] > b.hi[1] + e || p[2] < b.lo[2] - e || p[2] > b.hi[2] + e) return false;
  let votes = 0;
  for (const d of DIRS) {
    let n = 0;
    for (let t = 0; t < b.nt; t++) {
      // cheap reject for the x ray (a slightly tilted ray stays within 2 mm of its start in y and z over a bone's width)
      if (d[0] === 1 && (p[1] < b.box[t * 4] - .002 || p[1] > b.box[t * 4 + 1] + .002 || p[2] < b.box[t * 4 + 2] - .002 || p[2] > b.box[t * 4 + 3] + .002)) continue;
      const o = t * 9, ax = b.tri[o], ay = b.tri[o + 1], az = b.tri[o + 2];
      const e1x = b.tri[o + 3] - ax, e1y = b.tri[o + 4] - ay, e1z = b.tri[o + 5] - az, e2x = b.tri[o + 6] - ax, e2y = b.tri[o + 7] - ay, e2z = b.tri[o + 8] - az;
      const hx = d[1] * e2z - d[2] * e2y, hy = d[2] * e2x - d[0] * e2z, hz = d[0] * e2y - d[1] * e2x, det = e1x * hx + e1y * hy + e1z * hz;
      if (Math.abs(det) < 1e-18) continue;
      const f = 1 / det, sx = p[0] - ax, sy = p[1] - ay, sz = p[2] - az, u = f * (sx * hx + sy * hy + sz * hz); if (u < 0 || u > 1) continue;
      const qx = sy * e1z - sz * e1y, qy = sz * e1x - sx * e1z, qz = sx * e1y - sy * e1x, v = f * (d[0] * qx + d[1] * qy + d[2] * qz); if (v < 0 || u + v > 1) continue;
      if (f * (e2x * qx + e2y * qy + e2z * qz) > 1e-9) n++;
    }
    if (n % 2 === 1) votes++;
  }
  return votes >= 2;
}

/**
 * Moves the vertices of one nerve mesh (`positions` in metres, in place) out of the obstacle bones. Returns {inside, moved, left}: vertices that were inside, the largest move in
 * millimetres, and vertices still inside afterwards.
 */
export function clearBones(positions, indices, {margin = .0012, reach = 25, rounds = 16} = {}) {
  const bones = loadObstacles(), n = positions.length / 3;
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (let i = 0; i < n; i++) for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], positions[i * 3 + a]); hi[a] = Math.max(hi[a], positions[i * 3 + a]); }
  const near = bones.filter(b => b.lo[0] < hi[0] + .01 && b.hi[0] > lo[0] - .01 && b.lo[1] < hi[1] + .01 && b.hi[1] > lo[1] - .01 && b.lo[2] < hi[2] + .01 && b.hi[2] > lo[2] - .01);
  if (!near.length) return {inside: 0, moved: 0, left: 0};
  // graph of the mesh (vertices at the same position are one node), for spreading the move along the tube
  const key = new Map(), canon = new Int32Array(n);
  for (let i = 0; i < n; i++) { const k = [0, 1, 2].map(a => Math.round(positions[i * 3 + a] * 20000)).join(','); if (!key.has(k)) key.set(k, i); canon[i] = key.get(k); }
  const adj = Array.from({length: n}, () => new Set());
  for (let t = 0; t < indices.length; t += 3) for (let k = 0; k < 3; k++) { const a = canon[indices[t + k]], b = canon[indices[t + (k + 1) % 3]]; if (a !== b) { adj[a].add(b); adj[b].add(a); } }
  const dist = (a, b) => Math.hypot(positions[a * 3] - positions[b * 3], positions[a * 3 + 1] - positions[b * 3 + 1], positions[a * 3 + 2] - positions[b * 3 + 2]);
  let firstInside = -1, moved = 0;
  for (let round = 0; round < rounds; round++) {
    const push = new Map();
    for (let i = 0; i < n; i++) {
      if (canon[i] !== i) continue; const p = [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]];
      for (const b of near) {
        if (!inside(b, p)) continue;
        const c = closest(meshOfBone(b), p), v = [c.point[0] - p[0], c.point[1] - p[1], c.point[2] - p[2]], l = Math.hypot(...v) || 1e-9;
        push.set(i, v.map(x => x + x / l * margin)); break;
      }
    }
    if (round === 0) firstInside = push.size;
    if (!push.size) return {inside: firstInside, moved, left: 0};
    // distance along the mesh from the nearest pushed vertex (multi-source Dijkstra, simple binary-free version: relaxation sweeps)
    const geo = new Float64Array(n).fill(Infinity), queue = [];
    for (const i of push.keys()) { geo[i] = 0; queue.push(i); }
    while (queue.length) { const i = queue.shift(); for (const j of adj[i]) { const d = geo[i] + dist(i, j); if (d < geo[j] && d < reach / 1000) { geo[j] = d; queue.push(j); } } }
    const d = new Map(), free = [];
    for (let i = 0; i < n; i++) if (canon[i] === i) { if (push.has(i)) d.set(i, push.get(i)); else if (geo[i] < Infinity) { d.set(i, [0, 0, 0]); free.push(i); } }
    for (let it = 0; it < 120; it++) for (const i of free) { const s = [0, 0, 0]; let c = 0; for (const j of adj[i]) { const v = d.get(j); if (v) { s[0] += v[0]; s[1] += v[1]; s[2] += v[2]; c++; } } if (c) d.set(i, [s[0] / c, s[1] / c, s[2] / c]); }
    for (let i = 0; i < n; i++) { const v = d.get(canon[i]); if (!v) continue; for (let a = 0; a < 3; a++) positions[i * 3 + a] += v[a]; moved = Math.max(moved, Math.hypot(...v) * 1000); }
  }
  // what is still inside (thin digital branches squeezed between neighbouring bones) is moved straight out, without spreading
  for (let pass = 0; pass < 6; pass++) {
    let any = false;
    for (let i = 0; i < n; i++) {
      if (canon[i] !== i) continue; const p = [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]];
      for (const b of near) {
        if (!inside(b, p)) continue; any = true;
        const c = closest(meshOfBone(b), p), v = [c.point[0] - p[0], c.point[1] - p[1], c.point[2] - p[2]], l = Math.hypot(...v) || 1e-9, m = v.map(x => x + x / l * margin);
        for (let j = 0; j < n; j++) if (canon[j] === i) for (let a = 0; a < 3; a++) positions[j * 3 + a] += m[a];
        moved = Math.max(moved, Math.hypot(...m) * 1000); break;
      }
    }
    if (!any) break;
  }
  // count what is still inside
  let left = 0;
  for (let i = 0; i < n; i++) { if (canon[i] !== i) continue; const p = [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]]; if (near.some(b => inside(b, p))) left++; }
  return {inside: firstInside, moved, left};
}
