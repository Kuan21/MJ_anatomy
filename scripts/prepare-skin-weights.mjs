// Build-time skinning weights for surfaces that have no muscle/vessel binding of their own: the skin and
// any unbound fascia or lymphatic mesh in a limb. Every vertex is weighted over the SAME segment chain that
// moves the bones, muscles, nerves and vessels (trunk → clavicle → scapula → humerus → ulna/radius → hand, and
// pelvis → thigh → shank → foot), by how close it is to the bones of each segment, then smoothed over the mesh
// so joints bend instead of tearing. The viewer blends these absolute palette slots on the GPU.
// Output is gzip JSON served from the same origin and checked against the mesh by a position hash.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {quizModule} from './quiz-modules.mjs';

const root = new URL('../', import.meta.url), models = new URL('public/models/', root);
// The result depends only on these inputs; skip the minute-long solve when nothing changed.
const inputHash = createHash('sha256');
for (const file of ['scripts/prepare-skin-weights.mjs', 'public/models/atlas.json', 'app/biomechanics-v2/bone-bindings.json', 'app/biomechanics-v2/digit-joints.json', 'app/biomechanics-v2/body-bindings.json', 'app/biomechanics-v2/tissue-bindings.json', 'app/biomechanics-v2/gpu-skinning.ts', 'app/mj-part-regions.ts', 'app/mj-system-classifier.ts', 'app/anatomy-source-overrides.json']) inputHash.update(fs.readFileSync(new URL(file, root)));
for (const k of ['SKIN_SIGMA_ROOT', 'SKIN_SIGMA_SCALE', 'SKIN_SMOOTH', 'SKIN_GEO_LIMIT']) inputHash.update(`${k}=${process.env[k] ?? ''}`);
const stamp = inputHash.digest('hex').slice(0, 24);
const stampFile = new URL('../../work/skin-weights.stamp', models);
try {
  if (fs.readFileSync(stampFile, 'utf8') === stamp && fs.existsSync(new URL('skin-weights.json.gz', models))) {console.log(`Skin weights up to date (${stamp}).`); process.exit(0);}
} catch {}
const gpu = await quizModule('app/biomechanics-v2/gpu-skinning.ts');
const {anatomicalRegion, isMotionQuarantined} = await quizModule('app/mj-part-regions.ts');
const {normalizeAtlasSystems} = await quizModule('app/mj-system-classifier.ts');
// The raw atlas files a few leg muscles (fibularis, tibialis, iliotibial tract) as bones; use the corrected systems the viewer uses.
const atlas = normalizeAtlasSystems(JSON.parse(fs.readFileSync(new URL('atlas.json', models), 'utf8')));
const boneBindings = JSON.parse(fs.readFileSync(new URL('app/biomechanics-v2/bone-bindings.json', root), 'utf8'));
const bodyBindings = JSON.parse(fs.readFileSync(new URL('app/biomechanics-v2/body-bindings.json', root), 'utf8'));
const tissueBindings = JSON.parse(fs.readFileSync(new URL('app/biomechanics-v2/tissue-bindings.json', root), 'utf8'));
const chunks = new Map(), chunk = i => (chunks.has(i) || chunks.set(i, fs.readFileSync(new URL('..' + atlas.chunks[i].url, models))), chunks.get(i));
const view = (p, Type, offset, count) => {const b = chunk(p.chunk); return new Type(b.buffer.slice(b.byteOffset + offset, b.byteOffset + offset + count * Type.BYTES_PER_ELEMENT));};
export const positionHash = positions => {let hash = 2166136261; for (let i = 0; i < positions.length; i++) hash = Math.imul(hash ^ Math.round(positions[i] * 1e7), 16777619); return hash >>> 0;};

// Which palette slot moves each bone.
const ARM_FRAME = {clavicle: 1, scapula: 2, humerus: 3, ulna: 4, radius: 5, carpus: 6, hand: 6};
const slotOfBone = new Map();
for (const side of ['left', 'right']) for (const [group, entries] of Object.entries(boneBindings[side])) for (const e of entries) slotOfBone.set(e.id, gpu.SIDE_BASE[side] + ARM_FRAME[group]);
// every moving digit bone (thumb metacarpal, phalanges) has a frame of its own after the seven arm frames, in digits.ts DIGIT_FRAMES order
const digitJoints = JSON.parse(fs.readFileSync(new URL('app/biomechanics-v2/digit-joints.json', root), 'utf8'));
const DIGITS = ['thumb', 'index', 'middle', 'ring', 'little'];
const digitSlot = (side, digit, k) => gpu.SIDE_BASE[side] + 7 + DIGITS.indexOf(digit) * 3 + k;
for (const side of ['left', 'right']) for (const digit of DIGITS) {
  const ids = digitJoints.sides[side][digit].ids, order = digit === 'thumb' ? ['mc', 'pp', 'dp'] : ['pp', 'mp', 'dp'];
  order.forEach((key, k) => slotOfBone.set(ids[key], digitSlot(side, digit, k)));
}
for (const [id, b] of Object.entries(bodyBindings)) {
  if ((b.rig === 'leftLeg' || b.rig === 'rightLeg') && b.frame !== null && b.frame >= 1) slotOfBone.set(id, gpu.LEG_BASE[b.rig === 'leftLeg' ? 'left' : 'right'] + b.frame - 1);
}

// Spatial hash of bone surface samples per slot.
const CELL = .02, RANGE = .14, cells = new Map(), key = (x, y, z) => `${x},${y},${z}`;
let samples = 0;
for (const part of atlas.parts) {
  if (part.system !== 'skeletal') continue;
  const slot = slotOfBone.get(part.id) ?? 0, pos = view(part, Float32Array, part.positions, part.vertexCount * 3);
  for (let v = 0; v < part.vertexCount; v++) {
    const k = key(Math.floor(pos[v * 3] / CELL), Math.floor(pos[v * 3 + 1] / CELL), Math.floor(pos[v * 3 + 2] / CELL));
    let list = cells.get(k); if (!list) cells.set(k, list = []);
    list.push(slot, pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]); samples++;
  }
}

// Kinematic graph of the segment chain (slots), used to keep smoothing from leaking between unrelated segments.
const links = [];
for (const side of ['left', 'right']) {
  const a = gpu.SIDE_BASE[side], l = gpu.LEG_BASE[side];
  links.push([0, a + 1], [0, a + 2], [a + 1, a + 2], [a + 1, a + 3], [a + 2, a + 3], [a + 3, a + 4], [a + 3, a + 5], [a + 4, a + 5], [a + 4, a + 6], [a + 5, a + 6]);
  for (let d = 0; d < 5; d++) links.push([a + 6, a + 7 + d * 3], [a + 7 + d * 3, a + 8 + d * 3], [a + 8 + d * 3, a + 9 + d * 3]);
  links.push([0, l], [l, l + 1], [l + 1, l + 2], [l, l + 3], [l + 1, l + 3]);
}
const hops = new Map();
{
  const adj = new Map(); for (const [x, y] of links) {(adj.get(x) ?? adj.set(x, []).get(x)).push(y); (adj.get(y) ?? adj.set(y, []).get(y)).push(x);}
  for (const start of adj.keys()) {
    const dist = new Map([[start, 0]]), queue = [start];
    for (let i = 0; i < queue.length; i++) for (const n of adj.get(queue[i]) ?? []) if (!dist.has(n)) {dist.set(n, dist.get(queue[i]) + 1); queue.push(n);}
    hops.set(start, dist);
  }
}

// Soft surfaces that do not already have their own binding.
const targets = atlas.parts.filter(p => {
  if (isMotionQuarantined(p) || tissueBindings[p.id] || bodyBindings[p.id]) return false;
  if (p.system === 'integumentary' && p.name === 'Skin') return true;
  return ['lymphatic', 'integumentary', 'connective'].includes(p.system) && ['upper-limb', 'lower-limb'].includes(anatomicalRegion(p));
});

// Metres of extra distance that cut a segment's influence to 1/e. Girdle and proximal-limb segments blend over a wide band, so the
// axilla and groin stretch gradually (a skin web) instead of tearing; distal segments blend over a narrow band so fingers and toes stay crisp.
const SIGMA_BY_FRAME = {arm: [0, .03, .03, .03, .02, .02, .012, ...Array(15).fill(.007)], leg: [0, .03, .022, .012, .03]};
const SIGMA_ROOT = Number(process.env.SKIN_SIGMA_ROOT ?? .012);
const sigmaOfSlot = slot => {
  if (slot === 0) return SIGMA_ROOT;
  for (const side of ['left', 'right']) {
    if (slot >= gpu.SIDE_BASE[side] && slot < gpu.SIDE_BASE[side] + gpu.FRAME_COUNT) return SIGMA_BY_FRAME.arm[slot - gpu.SIDE_BASE[side]] * Number(process.env.SKIN_SIGMA_SCALE ?? 1);
    if (slot >= gpu.LEG_BASE[side] && slot < gpu.LEG_BASE[side] + 4) return SIGMA_BY_FRAME.leg[slot - gpu.LEG_BASE[side] + 1] * Number(process.env.SKIN_SIGMA_SCALE ?? 1);
  }
  return SIGMA_ROOT;
};
const GEO_LIMIT = Number(process.env.SKIN_GEO_LIMIT ?? .12); // metres along the skin surface
const SMOOTH_PASSES = Number(process.env.SKIN_SMOOTH ?? 20); // weight-smoothing over the mesh edges
const out = {version: 1, inputHash: stamp, slotCount: gpu.SLOT_COUNT, sigma: SIGMA_BY_FRAME, parts: {}};
for (const part of targets) {
  const n = part.vertexCount, pos = view(part, Float32Array, part.positions, n * 3), tri = view(part, Uint32Array, part.indices, part.indexCount);
  // Outward vertex normals from the triangles. Each connected shell is oriented by its signed volume (the skin file holds an outer and an inner shell).
  const nor = new Float64Array(n * 3), parent = Int32Array.from({length: n}, (_, i) => i), find = x => {while (parent[x] !== x) {parent[x] = parent[parent[x]]; x = parent[x];} return x;};
  for (let t = 0; t < tri.length; t += 3) {const a = find(tri[t]), b = find(tri[t + 1]), c = find(tri[t + 2]); parent[b] = a; parent[find(c)] = a;}
  const volume = new Map();
  for (let t = 0; t < tri.length; t += 3) {
    const a = tri[t] * 3, b = tri[t + 1] * 3, c = tri[t + 2] * 3, ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2], vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, root = find(tri[t]);
    volume.set(root, (volume.get(root) ?? 0) + (pos[a] * nx + pos[a + 1] * ny + pos[a + 2] * nz) / 6);
    for (const i of [a, b, c]) {nor[i] += nx; nor[i + 1] += ny; nor[i + 2] += nz;}
  }
  for (let v = 0; v < n; v++) {const flip = (volume.get(find(v)) ?? 1) < 0 ? -1 : 1, len = Math.hypot(nor[v * 3], nor[v * 3 + 1], nor[v * 3 + 2]) || 1; for (let k = 0; k < 3; k++) nor[v * 3 + k] *= flip / len;}
  const nearestMaps = new Array(n);
  for (let v = 0; v < n; v++) {
    const x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2], cx = Math.floor(x / CELL), cy = Math.floor(y / CELL), cz = Math.floor(z / CELL), reach = Math.ceil(RANGE / CELL);
    const nearest = new Map();
    for (let a = -reach; a <= reach; a++) for (let b = -reach; b <= reach; b++) for (let c = -reach; c <= reach; c++) {
      const list = cells.get(key(cx + a, cy + b, cz + c)); if (!list) continue;
      for (let i = 0; i < list.length; i += 4) {
        const dx = list[i + 1] - x, dy = list[i + 2] - y, dz = list[i + 3] - z, d = Math.hypot(dx, dy, dz), slot = list[i];
        // A bone that lies in FRONT of the surface (outside the skin) belongs to something else touching it, e.g. a hand resting on a thigh.
        if (d > .004 && (dx * nor[v * 3] + dy * nor[v * 3 + 1] + dz * nor[v * 3 + 2]) / d > .35) continue;
        if (d < (nearest.get(slot) ?? Infinity)) nearest.set(slot, d);
      }
    }
    nearestMaps[v] = nearest;
  }
  // Surface adjacency (also used for smoothing below).
  const neighbours = Array.from({length: n}, () => new Set());
  for (let t = 0; t < tri.length; t += 3) for (let k = 0; k < 3; k++) {const a = tri[t + k], b = tri[t + (k + 1) % 3]; if (a !== b) {neighbours[a].add(b); neighbours[b].add(a);}}
  // A segment may only move skin that is close to it ALONG THE SURFACE. Euclidean proximity alone lets the skin of a hanging hand drag the thigh
  // skin it touches, or the torso wall drag the inner arm, which stretches into the sails and balloons seen when an arm is raised.
  // Every vertex has a primary segment (its nearest bone); a segment's other weights survive only within GEO_LIMIT metres of the surface
  // region of that primary segment, fading out over the last third.
  const primary = new Int16Array(n);
  for (let v = 0; v < n; v++) {let best = Infinity, slot = 0; for (const [k, d] of nearestMaps[v]) if (d < best) {best = d; slot = k;} primary[v] = slot;}
  const geodesic = new Map();
  const slotsUsed = [...new Set(primary)];
  for (const slot of slotsUsed) {
    const dist = new Float32Array(n).fill(Infinity), heap = [];
    const push = (d, v) => {heap.push([d, v]); let i = heap.length - 1; while (i > 0) {const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p;}};
    const pop = () => {const top = heap[0], last = heap.pop(); if (heap.length) {heap[0] = last; let i = 0; for (;;) {const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m;}} return top;};
    for (let v = 0; v < n; v++) if (primary[v] === slot) {dist[v] = 0; push(0, v);}
    while (heap.length) {
      const [d, v] = pop(); if (d > dist[v]) continue;
      for (const u of neighbours[v]) {const e = d + Math.hypot(pos[u * 3] - pos[v * 3], pos[u * 3 + 1] - pos[v * 3 + 1], pos[u * 3 + 2] - pos[v * 3 + 2]); if (e < dist[u] && e < GEO_LIMIT * 1.1) {dist[u] = e; push(e, u);}}
    }
    geodesic.set(slot, dist);
  }
  let weights = new Array(n);
  for (let v = 0; v < n; v++) {
    const nearest = nearestMaps[v], w = new Map();
    if (!nearest.size) w.set(0, 1);
    else {
      const best = Math.min(...nearest.values());
      for (const [slot, d] of nearest) {
        let value = Math.exp(-(d - best) / sigmaOfSlot(slot));
        if (slot !== primary[v]) {
          const g = geodesic.get(slot)?.[v] ?? Infinity, fade = g >= GEO_LIMIT ? 0 : g <= GEO_LIMIT * .66 ? 1 : (GEO_LIMIT - g) / (GEO_LIMIT * .34);
          value *= fade;
        }
        if (value > .02) w.set(slot, value);
      }
      if (!w.size) w.set(primary[v], 1);
    }
    weights[v] = w;
  }
  // Mesh adjacency, then smooth every weight vector toward its neighbours' mean. Only neighbours whose dominant segment is within two joints of
  // this vertex's own segment contribute: where a hand rests against a thigh the mesh is touching, but the segments are kinematically unrelated.
  const dominant = weights.map(w => [...w].reduce((best, e) => e[1] > best[1] ? e : best)[0]);
  const related = (a, b) => a === b || (hops.get(a)?.get(b) ?? 99) <= 2;
  const normalise = w => {let s = 0; for (const x of w.values()) s += x; for (const [k, x] of w) w.set(k, x / s);};
  weights.forEach(normalise);
  for (let pass = 0; pass < SMOOTH_PASSES; pass++) {
    const next = new Array(n);
    for (let v = 0; v < n; v++) {
      const w = new Map(), around = neighbours[v];
      for (const [k, x] of weights[v]) w.set(k, (w.get(k) ?? 0) + x * .5);
      const usable = [...around].filter(u => related(dominant[v], dominant[u]));
      if (usable.length) for (const u of usable) for (const [k, x] of weights[u]) w.set(k, (w.get(k) ?? 0) + x * .5 / usable.length);
      else for (const [k, x] of weights[v]) w.set(k, (w.get(k) ?? 0) + x * .5);
      normalise(w); next[v] = w;
    }
    weights = next;
  }
  const slots = new Uint8Array(n * 4), values = new Uint16Array(n * 4);
  for (let v = 0; v < n; v++) {
    const top = [...weights[v]].sort((a, b) => b[1] - a[1]).slice(0, 4), total = top.reduce((s, e) => s + e[1], 0);
    let sum = 0, largest = 0;
    top.forEach(([slot, w], k) => {slots[v * 4 + k] = slot; values[v * 4 + k] = Math.round(w / total * 65535); sum += values[v * 4 + k]; if (values[v * 4 + k] > values[v * 4 + largest]) largest = k;});
    values[v * 4 + largest] += 65535 - sum;
  }
  out.parts[part.id] = {name: part.name, vertexCount: n, positionHash: positionHash(pos), slots: Buffer.from(slots).toString('base64'), weights: Buffer.from(values.buffer).toString('base64')};
}
const manifest = Buffer.from(JSON.stringify(out));
fs.writeFileSync(new URL('skin-weights.json.gz', models), gzipSync(manifest, {level: 9}));
fs.mkdirSync(new URL('../../work/', models), {recursive: true});
fs.writeFileSync(stampFile, stamp);
console.log(`Skin weights: ${targets.map(p => `${p.name} (${p.vertexCount.toLocaleString()} vertices)`).join(', ')} weighted over ${samples.toLocaleString()} bone samples; ${(manifest.length / 1e3).toFixed(0)} kB.`);
