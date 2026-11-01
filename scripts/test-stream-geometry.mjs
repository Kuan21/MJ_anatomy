// The compact atlas packages (Bug Audit P2-01) decode back to the source geometry: indices identical, positions within the quantisation step
// (6 µm at most, exact for the parts whose motion data is fitted to the source positions), normals within 0.01°. Also checks that the
// browser decoder (app/stream-geometry.ts) and the Node decoder (scripts/lib/stream-geometry.mjs) agree.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
import {indicesOf, positionsOf} from './lib/stream-geometry.mjs';
const {positionArray, normalArray, indexArray} = await quizModule('app/stream-geometry.ts');
const models = new URL('../public/models/', import.meta.url);
const original = JSON.parse(fs.readFileSync(new URL('atlas.json', models))), stream = JSON.parse(fs.readFileSync(new URL('atlas-stream.json', models)));
const originals = original.chunks.map(c => fs.readFileSync(new URL('../' + c.url.replace(/^\//, ''), models)));
const packages = new Map(), pkg = i => {if (!packages.has(i)) packages.set(i, fs.readFileSync(new URL('../' + stream.chunks[i].url.replace(/^\//, ''), models))); return packages.get(i);};
const byId = new Map(original.parts.map(p => [p.id, p]));
let checked = 0, exact = 0, maxPos = 0, maxAngle = 0, quantised = 0;
for (const part of stream.parts) {
  const src = byId.get(part.id); if (!src || part.tendonCut || part.smoothed) continue; // cut or smoothed parts differ from the source on purpose
  const sb = originals[src.chunk], pb = pkg(part.chunk), ab = pb.buffer.slice(pb.byteOffset, pb.byteOffset + pb.length);
  const srcPos = new Float32Array(sb.buffer.slice(sb.byteOffset + src.positions, sb.byteOffset + src.positions + src.vertexCount * 12));
  const srcIdx = new Uint32Array(sb.buffer.slice(sb.byteOffset + src.indices, sb.byteOffset + src.indices + src.indexCount * 4));
  const srcNrm = new Int16Array(sb.buffer.slice(sb.byteOffset + src.normals, sb.byteOffset + src.normals + src.vertexCount * 6));
  const pos = positionArray(ab, part), idx = indexArray(ab, part), nrm = normalArray(ab, part);
  assert.equal(idx.length, srcIdx.length, part.name); for (let i = 0; i < idx.length; i++) if (idx[i] !== srcIdx[i]) assert.fail(`index differs: ${part.name}`);
  assert.deepEqual(Array.from(indicesOf(pb, part)), Array.from(idx), 'node and browser index decoders agree');
  const nodePos = positionsOf(pb, part); assert.equal(nodePos.length, pos.length); for (let i = 0; i < pos.length; i += 97) assert.equal(nodePos[i], pos[i], 'node and browser position decoders agree');
  const step = part.pq ? Math.max(part.pq[3], part.pq[4], part.pq[5]) : 0;
  for (let i = 0; i < pos.length; i++) {const d = Math.abs(pos[i] - srcPos[i]); if (d > maxPos) maxPos = d; if (d > step * 0.5000001 + 3e-7) assert.fail(`position off by ${d} m in ${part.name}`);} // + Float32 rounding of the decoded value (about 1.2e-7 m per ulp below 2 m)
  if (!part.pq) {exact++; for (let i = 0; i < pos.length; i++) if (pos[i] !== srcPos[i]) assert.fail(`exact part changed: ${part.name}`);} else quantised++;
  for (let i = 0; i < nrm.length; i += 3) {
    const a = [srcNrm[i], srcNrm[i + 1], srcNrm[i + 2]], b = [nrm[i], nrm[i + 1], nrm[i + 2]], la = Math.hypot(...a) || 1, lb = Math.hypot(...b) || 1;
    if (la < 1) continue; // a zero source normal has no direction
    const ang = Math.acos(Math.min(1, (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (la * lb))) * 180 / Math.PI; if (ang > maxAngle) maxAngle = ang;
    if (ang > 0.01) assert.fail(`normal off by ${ang.toFixed(4)}° in ${part.name}`);
  }
  checked++;
}
assert.ok(checked > 1800, `checked ${checked} parts`); // 2234 parts minus the 92 cut muscles and about 250 smoothed vessels
assert.ok(exact > 0, 'the hash-bound parts keep exact positions');
console.log(`stream geometry: ${checked} parts decode back to the source (${quantised} quantised, ${exact} exact); max position error ${(maxPos * 1e6).toFixed(1)} µm, max normal error ${maxAngle.toFixed(4)}°`);
