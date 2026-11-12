// Heart detail: every vessel of the coronary and cardiac-vein groups is sorted as a main vessel (kept when a chamber is opened) or a fine branch (hidden), the great vessels are all kept.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
fs.mkdirSync(file('.sites-runtime'), {recursive: true});
const out = file('.sites-runtime/heart-vessels.mjs');
await build({entryPoints: [file('app/organ/heart-vessels.ts')], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error'});
const {MAIN_CORONARY, FINE_BRANCHES, isFineBranch, isKeptVessel, isTrunkPart, trunkTriangles} = await import(out);
const heart = JSON.parse(gunzipSync(fs.readFileSync(file('public/models/heart/heart-detail.json.gz'))));
const names = new Set(heart.parts.map(p => p.name));
for (const n of [...MAIN_CORONARY, ...FINE_BRANCHES]) assert.ok(names.has(n), `${n} is a part of the heart catalogue`);
for (const p of heart.parts.filter(q => q.group === 'coronary' || q.group === 'veins')) assert.ok(MAIN_CORONARY.includes(p.name) !== isFineBranch(p.name), `${p.name} is either a main vessel or a fine branch`);
for (const p of heart.parts.filter(q => q.group === 'vessels')) assert.ok(isKeptVessel(p.group, p.name) && !isFineBranch(p.name), `${p.name} (great vessel) is kept`);
for (const p of heart.parts.filter(q => q.group === 'pericardium')) assert.ok(!isKeptVessel(p.group, p.name), 'pericardium is not kept');
// the kept coronary parts hold the trunk plus side branches as separate pieces: opening a chamber draws the trunk only
const chunks = heart.chunks.map(c => {const b = fs.readFileSync(file('public' + c.url)); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);});
let trimmed = 0;
for (const p of heart.parts.filter(q => isTrunkPart(q.group, q.name))) {
  const buf = chunks[p.chunk], pos = new Float32Array(buf, p.positions, p.vertexCount * 3), idx = new Uint32Array(buf, p.indices, p.indexCount), trunk = trunkTriangles(pos, idx);
  assert.ok(trunk.length > 0 && trunk.length % 3 === 0 && trunk.length <= idx.length, `${p.name}: trunk is a non-empty subset`);
  if (['Right coronary artery', 'Anterior interventricular artery', 'Circumflex artery', 'Great cardiac vein'].includes(p.name)) {
    assert.ok(trunk.length < idx.length * .6, `${p.name}: the side branches stored in the part are left out (${trunk.length / 3} of ${idx.length / 3} triangles kept)`);
    trimmed++;
  }
}
assert.equal(trimmed, 4, 'four main vessels are drawn as trunk only');
console.log(`heart vessels: ${MAIN_CORONARY.length} main coronary vessels kept, ${FINE_BRANCHES.length} fine branches hidden, ${heart.parts.filter(p => p.group === 'vessels').length} great vessels kept, ${heart.parts.filter(p => p.group === 'pericardium').length} pericardium parts hidden`);
