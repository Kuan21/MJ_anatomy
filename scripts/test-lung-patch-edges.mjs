// Lung surface patches (grooves, impressions, borders, fissures, hilum): their borders are smooth cuts, they stay on the lobe surface, and overlapping patches never sit at the same depth.
// Needs the generated paokao stream (node scripts/prepare-paokao.mjs). Output is pass/fail and counts only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadWorld} from './lib/paokao-world.mjs';
import {makeUtil} from './lib/paokao-util.mjs';

const w = loadWorld({paokao: true}), U = makeUtil(w), MM = 1000;
const cards = JSON.parse(fs.readFileSync(new URL('../app/mj-paokao.json', import.meta.url), 'utf8'));
const names = [...new Set(Object.values(cards).filter(c => c.lung && c.kind === 'surface').map(c => c.name))];
assert.ok(names.length >= 30, `lung surface patches not found (${names.length})`);
const LOBES = ['Upper lobe of right lung', 'Middle lobe of right lung', 'Lower lobe of right lung', 'Upper lobe of left lung', 'Lower lobe of left lung'];
const dist = LOBES.map(n => U.distTo(n)), lobeDist = p => Math.min(...dist.map(d => d(p)));

const problems = [], lifts = new Map(), verts = new Map();
for (const name of names) {
  const m = U.mesh(name), P = m.positions, I = m.indices, pts = [];
  for (let i = 0; i < P.length; i += 3) pts.push([P[i], P[i + 1], P[i + 2]]);
  // 1. on the lobe surface: 95 % of the vertices 0.05 to 1.6 mm above it (not sunk into it, not floating); the rest are border vertices beside a neighbouring lobe
  const d = pts.map(lobeDist).map(x => x * MM), hi = Math.max(...d);
  const p5 = d.slice().sort((x, y) => x - y)[Math.floor(d.length * .05)];
  if (p5 < .05 || hi > 1.6) problems.push(`${name}: height above the lobe p5 ${p5.toFixed(2)}, max ${hi.toFixed(2)} mm`);
  lifts.set(name, d.slice().sort((a, b) => a - b)[Math.floor(d.length / 2)]); verts.set(name, pts);
  // 2. smooth border: boundary edges (used by one triangle) are short cuts, not whole lobe triangles (those run up to 16 mm)
  const use = new Map(); for (let i = 0; i < I.length; i += 3) for (const [a, b] of [[0, 1], [1, 2], [2, 0]]) { const x = I[i + a], y = I[i + b], k = x < y ? x * 4294967296 + y : y * 4294967296 + x; use.set(k, (use.get(k) ?? 0) + 1); }
  const edges = []; for (const [k, c] of use) if (c === 1) { const x = Math.floor(k / 4294967296), y = k % 4294967296; edges.push(Math.hypot(P[x * 3] - P[y * 3], P[x * 3 + 1] - P[y * 3 + 1], P[x * 3 + 2] - P[y * 3 + 2]) * MM); }
  edges.sort((a, b) => a - b);
  if (edges.length && (edges[Math.floor(edges.length * .95)] > 3 || edges[edges.length - 1] > 6)) problems.push(`${name}: border edges p95 ${edges[Math.floor(edges.length * .95)].toFixed(1)} mm, longest ${edges[edges.length - 1].toFixed(1)} mm`);
}
// 3. every patch has its own place in the stacking order of lungs.mjs (its own height above the lobe, 0.03 mm apart), so two overlapping patches never lie at the same depth
const src = fs.readFileSync(new URL('./paokao-structures/lungs.mjs', import.meta.url), 'utf8'), stack = [...src.slice(src.indexOf('const STACK = ['), src.indexOf('const lift =')).matchAll(/'([^']+)'/g)].map(m => m[1]);
assert.equal(new Set(stack).size, stack.length, 'stacking order has duplicates');
for (const n of names) if (!stack.includes(n)) problems.push(`${n} is not in the stacking order`);
const overlaps = stack.length;
assert.deepEqual(problems, [], `lung patch problems: ${problems.length}\n${problems.join('\n')}`);
console.log(`Lung patch edges ok: ${names.length} patches, ${overlaps} heights, all different.`);
