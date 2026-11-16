// Regression: the anterior spinal artery is ONE named structure (no Left/Right), listed once, both mesh pieces (FJ1657, FJ1657M) belong to the same concept. Names only; meshes unchanged.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
const {atlas} = loadFullAtlas();
const asa = atlas.parts.filter(p => /spinal artery/i.test(p.name));
assert.deepEqual(asa.map(p => p.id).sort(), ['FJ1657', 'FJ1657M'], 'both pieces present');
for (const p of asa) { assert.equal(p.name, 'Anterior spinal artery', `${p.id} name`); assert.ok(!/\b(left|right)\b/i.test(p.name), `${p.id} has no side word`); }
assert.equal(new Set(asa.map(p => p.conceptId)).size, 1, 'one concept for both pieces');
const c = atlas.concepts.find(x => x.id === asa[0].conceptId);
assert.ok(c && !/\b(left|right)\b/i.test(c.name), 'concept has no side word');
assert.deepEqual(atlas.parts.filter(p => /anterior spinal/i.test(p.name) && /\b(left|right)\b/i.test(p.name)), [], 'no sided name left');
const b = JSON.parse(fs.readFileSync(new URL('../app/biomechanics-v2/body-bindings.json', import.meta.url), 'utf8'));
for (const id of ['FJ1657', 'FJ1657M']) assert.equal(b[id].name, 'Anterior spinal artery', `${id} binding name`);
console.log('Anterior spinal artery name OK: one name, no side word, 2 mesh pieces share one concept.');
