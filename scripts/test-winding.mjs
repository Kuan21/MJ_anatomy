// Winding of closed meshes: every closed, manifold piece of the schematic streams (paokao structures, vessel ends, facial, female) is wound outward and consistently. 585 closed meshes (tubes, vessel ends,
// the mirrored Z-Anatomy retinacula of the left knee) were inside out or had a cap wound against its sides; with double-sided materials that only showed as dark or flat-shaded patches
// (e.g. on the lateral side of the left knee). scripts/lib/stream-writer.mjs `orientClosedPieces` now fixes this when the packages are written; this test fails when a package is written without it.
import assert from 'node:assert/strict';
import {loadViewerAtlas} from './lib/viewer-atlas.mjs';
import {orientClosedPieces} from './lib/stream-writer.mjs';
const {atlas, geometry} = loadViewerAtlas(), bad = []; let checked = 0, flippedTotal = 0;
for (const p of atlas.parts) {
  if (!['paokao', 'vessel-ends', 'facial', 'female'].includes(p.stream)) continue;
  const g = geometry(p), idx = Uint32Array.from(g.indices), flipped = orientClosedPieces(g.positions, idx); checked++;
  if (flipped) { flippedTotal += flipped; bad.push(`${p.id} ${p.name} (${flipped} of ${idx.length / 3} triangles)`); }
}
assert.ok(checked > 600, `${checked} meshes checked`);
assert.equal(bad.length, 0, `${bad.length} closed meshes are inside out or inconsistently wound, e.g. ${bad.slice(0, 5).join('; ')}`);
console.log(`PASS winding: ${checked} schematic meshes, every closed piece wound outward and consistently.`);
