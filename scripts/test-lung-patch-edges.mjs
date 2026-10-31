// Lung surface patches (grooves, impressions, borders, fissures, hilum): their borders are smooth cuts, they stay on the lobe surface, and overlapping patches never sit at the same depth.
// Needs the generated paokao stream (node scripts/prepare-paokao.mjs). Output is pass/fail and counts only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadWorld} from './lib/paokao-world.mjs';
import {makeUtil} from './lib/paokao-util.mjs';

const w = loadWorld({paokao: true}), U = makeUtil(w), MM = 1000;
const cards = JSON.parse(fs.readFileSync(new URL('../app/mj-paokao.json', import.meta.url), 'utf8'));
const names = [...new Set(Object.values(cards).filter(c => c.lung && c.kind === 'surface').map(c => c.name))];
assert.ok(names.length >= 35, `lung surface patches not found (${names.length})`);
const LOBES = ['Upper lobe of right lung', 'Middle lobe of right lung', 'Lower lobe of right lung', 'Upper lobe of left lung', 'Lower lobe of left lung'];
const dist = LOBES.map(n => U.distTo(n)), lobeDist = p => Math.min(...dist.map(d => d(p)));

const problems = [], lifts = new Map(), verts = new Map();
for (const name of names) {
  const m = U.mesh(name), P = m.positions, I = m.indices, pts = [];
  for (let i = 0; i < P.length; i += 3) pts.push([P[i], P[i + 1], P[i + 2]]);
  // 1. on the lobe surface: every vertex 0.15 to 1.6 mm above it (not sunk into it, not floating)
  const d = pts.map(lobeDist).map(x => x * MM), lo = Math.min(...d), hi = Math.max(...d);
  if (lo < .15 || hi > 1.6) problems.push(`${name}: height above the lobe ${lo.toFixed(2)}..${hi.toFixed(2)} mm`);
  lifts.set(name, d.slice().sort((a, b) => a - b)[Math.floor(d.length / 2)]); verts.set(name, pts);
  // 2. smooth border: boundary edges (used by one triangle) are short cuts, not whole lobe triangles (those run up to 16 mm)
  const use = new Map(); for (let i = 0; i < I.length; i += 3) for (const [a, b] of [[0, 1], [1, 2], [2, 0]]) { const x = I[i + a], y = I[i + b], k = x < y ? x * 4294967296 + y : y * 4294967296 + x; use.set(k, (use.get(k) ?? 0) + 1); }
  const edges = []; for (const [k, c] of use) if (c === 1) { const x = Math.floor(k / 4294967296), y = k % 4294967296; edges.push(Math.hypot(P[x * 3] - P[y * 3], P[x * 3 + 1] - P[y * 3 + 1], P[x * 3 + 2] - P[y * 3 + 2]) * MM); }
  edges.sort((a, b) => a - b);
  if (edges.length && (edges[Math.floor(edges.length * .95)] > 3 || edges[edges.length - 1] > 6)) problems.push(`${name}: border edges p95 ${edges[Math.floor(edges.length * .95)].toFixed(1)} mm, longest ${edges[edges.length - 1].toFixed(1)} mm`);
}
// 3. two patches that overlap are lifted to different heights (equal heights flicker into each other)
let overlaps = 0;
for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) {
  const a = names[i], b = names[j], D = U.distTo(b);
  const A = verts.get(a), step = Math.max(1, Math.floor(A.length / 60));
  let hit = false; for (let k = 0; k < A.length && !hit; k += step) if (D(A[k]) < .0016) hit = true;
  if (!hit) continue;
  overlaps++;
  if (Math.abs(lifts.get(a) - lifts.get(b)) < .02) problems.push(`${a} and ${b} overlap at the same height (${lifts.get(a).toFixed(2)} / ${lifts.get(b).toFixed(2)} mm)`);
}
assert.deepEqual(problems, [], `lung patch problems: ${problems.length}\n${problems.join('\n')}`);
console.log(`Lung patch edges ok: ${names.length} patches, ${overlaps} overlapping pairs at different heights.`);
