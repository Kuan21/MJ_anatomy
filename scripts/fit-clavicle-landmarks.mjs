// Sternal and acromial ends of each clavicle, from the atlas mesh: the centroid of the vertices within 6 mm of the most medial (sternal) and the most
// lateral (acromial) point of the bone. The shoulder girdle turns the clavicle about its sternal end (the sternoclavicular joint); the centre of the
// bounding box used before lay 33 mm from the sternal articular face, so the sternal end left the sternum when the arm was raised.
//   node scripts/fit-clavicle-landmarks.mjs            write app/biomechanics-v2/clavicle-landmarks.json
//   node scripts/fit-clavicle-landmarks.mjs --check    fail when the file is stale
// Approximate landmarks of the BodyParts3D rest frame; not measured cartilage or clinical validation.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {loadFullAtlas} from './lib/full-atlas.mjs';
const file = new URL('../app/biomechanics-v2/clavicle-landmarks.json', import.meta.url), SLAB = .006;
const {atlas, geometry} = loadFullAtlas({streams: []}), sides = {};
for (const side of ['right', 'left']) {
  const part = atlas.parts.find(p => p.system === 'skeletal' && p.name.toLowerCase() === `${side} clavicle`); assert.ok(part, `${side} clavicle not found`);
  const P = geometry(part).positions; let medial = Infinity, lateral = -Infinity;
  for (let i = 0; i < P.length; i += 3) { medial = Math.min(medial, Math.abs(P[i])); lateral = Math.max(lateral, Math.abs(P[i])); }
  const centroid = keep => { const c = [0, 0, 0]; let n = 0; for (let i = 0; i < P.length; i += 3) if (keep(Math.abs(P[i]))) { c[0] += P[i]; c[1] += P[i + 1]; c[2] += P[i + 2]; n++; } return {point: c.map(v => +(v / n).toFixed(6)), vertices: n}; };
  const sternal = centroid(x => x < medial + SLAB), acromial = centroid(x => x > lateral - SLAB);
  sides[side] = {clavicleId: part.id, sternalEnd: sternal.point, sternalVertices: sternal.vertices, acromialEnd: acromial.point, acromialVertices: acromial.vertices};
}
const text = JSON.stringify({method: 'Centroid of the clavicle vertices within 6 mm of its most medial (sternal) and most lateral (acromial) point, BodyParts3D atlas rest frame. Approximate landmarks; not measured cartilage or clinical validation.', sides}, null, 2) + '\n';
if (process.argv.includes('--check')) { assert.equal(fs.existsSync(file) && fs.readFileSync(file, 'utf8'), text, 'app/biomechanics-v2/clavicle-landmarks.json is stale: run node scripts/fit-clavicle-landmarks.mjs'); console.log('Clavicle landmarks up to date.'); }
else { fs.writeFileSync(file, text); console.log('wrote app/biomechanics-v2/clavicle-landmarks.json', JSON.stringify(sides)); }
