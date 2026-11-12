// Shape of the lofted tendons (knee and thigh). Every section of the lofted band used to be a zig-zag polygon (scripts/lib/tendon-build.mjs took the interior points of the cut cap into the outline), so the
// quadriceps, patellar, biceps femoris, sartorius, gracilis and semi- tendons were pleated: 11-17 % of their edges folded over, shading flipped between neighbouring triangles. Now: at most 8 % for the tendons
// of the knee and thigh (they are 4-6 % now) and 12 % for any other tendon, ligament or retinaculum of the schematic streams.
import assert from 'node:assert/strict';
import {loadViewerAtlas} from './lib/viewer-atlas.mjs';
import {foldShare} from './lib/fold-share.mjs';
const {atlas, geometry} = loadViewerAtlas(), KNEE = /quadriceps|patellar ligament|biceps femoris|sartorius|gracilis|semitendinosus|semimembranosus|popliteus|iliotibial|pes anserinus/i;
const fail = []; let n = 0, worstKnee = 0;
for (const p of atlas.parts) {
  if (p.stream !== 'paokao' || !(p.system === 'tendon' || /tendon|ligament|retinaculum/i.test(p.name))) continue;
  const g = geometry(p); if (g.indices.length < 300) continue; n++;
  const f = foldShare(g), limit = KNEE.test(p.name) ? .08 : .12; if (KNEE.test(p.name)) worstKnee = Math.max(worstKnee, f);
  if (f > limit) fail.push(`${p.id} ${p.name} ${(f * 100).toFixed(1)} % (limit ${limit * 100} %)`);
}
assert.ok(n > 100, `${n} tendon meshes`);
assert.equal(fail.length, 0, `${fail.length} tendons are pleated: ${fail.slice(0, 5).join('; ')}`);
console.log(`PASS tendon shape: ${n} tendon, ligament and retinaculum meshes, the knee and thigh tendons fold over on at most ${(worstKnee * 100).toFixed(1)} % of their edges.`);
