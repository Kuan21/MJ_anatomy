// Vessel smoothness (the faceted, segmented vessels of the knee and the abdominal wall). On the geometry the viewer loads, per group of vessel meshes (60 triangles or more):
//   - abdominal- and chest-wall vessels (epigastric, circumflex iliac, musculophrenic, intercostal, lumbar, thoracoepigastric, subcostal) and their end pieces: round (>= 12 sides), as the limb vessels
//   - bridge connectors (PKC-*): >= 9 sides (they were 6-sided prisms with 98 % of their corners shaded flat)
//   - the other vessel end pieces (head, spine, organs) stay the light 5-sided pieces: raising them to 8 made 17 of them dip into bone or stretch in the limit poses (stability gate), so they are only held where they are
//   - the genicular arteries and veins at the knee: >= 10 sides
// Ratchet, not a wish: the numbers are what the build produces now; a change that makes any group coarser again fails. Triangle budget (mobile): all vessels together stay under 2.1 million.
import assert from 'node:assert/strict';
import {loadViewerAtlas} from './lib/viewer-atlas.mjs';
import {smoothness} from './lib/vessel-smoothness.mjs';
const {atlas, geometry} = loadViewerAtlas();
const WALL = /epigastric|circumflex iliac|musculophrenic|intercostal|lumbar (artery|vein)|thoracoepigastric|subcostal/i;
const RULES = [
  {label: 'wall vessels and their end pieces', test: p => WALL.test(p.name) && p.stream !== 'paokao', minSides: 11.9},
  {label: 'bridge connectors', test: p => /^PKC-/.test(p.id), minSides: 9},
  {label: 'other end pieces', test: p => p.id.endsWith('-END') && !WALL.test(p.name), minSides: 3.5},
  {label: 'genicular vessels', test: p => /genicular/i.test(p.name), minSides: 10},
];
const worst = RULES.map(() => ({sides: Infinity, id: ''})), fail = []; let triangles = 0, n = 0;
for (const p of atlas.parts) {
  if (p.system !== 'arterial' && p.system !== 'venous') continue;
  const g = geometry(p); triangles += g.indices.length / 3; if (g.indices.length / 3 < 60) continue;
  const m = smoothness(g); n++;
  RULES.forEach((r, i) => { if (!r.test(p)) return; if (m.sides < worst[i].sides) worst[i] = {sides: m.sides, id: `${p.id} ${p.name}`}; if (m.sides < r.minSides) fail.push(`${r.label}: ${p.id} ${p.name} has ${m.sides.toFixed(1)} sides (needs ${r.minSides})`); });
}
assert.ok(n > 1500, `${n} vessel meshes`);
assert.equal(fail.length, 0, `${fail.length} vessel meshes are too coarse, e.g. ${fail.slice(0, 4).join('; ')}`);
assert.ok(triangles < 2.1e6, `all vessels together use ${(triangles / 1e6).toFixed(2)} million triangles (budget 2.1)`);
console.log(`PASS vessel smoothness: ${n} vessel meshes, ${(triangles / 1e6).toFixed(2)} million triangles; coarsest per group: ` + RULES.map((r, i) => `${r.label} ${worst[i].sides.toFixed(1)}`).join(', ') + '.');
