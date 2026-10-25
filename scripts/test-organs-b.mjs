// Lung lobes, serous membrane shells and the female reproductive organs: present, named, filtered by sex and placed sensibly.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {quizModule} from './quiz-modules.mjs';

const {structureProfile} = await quizModule('app/mj-structure-info.ts');
const {matchesSex} = await quizModule('app/mj-sex.ts');
const {SEROUS_LAYERS, serousLayerKey} = await quizModule('app/mj-serous.ts');
const read = f => JSON.parse(gunzipSync(fs.readFileSync(new URL(`../public/models/${f}`, import.meta.url))));
const lobes = read('supplement/supplement-stream.json.gz').parts.filter(p => /lobe of (right|left) lung/i.test(p.name));
const serous = read('serous/serous-stream.json.gz').parts, female = read('female/female-stream.json.gz').parts;

// lungs: right three lobes, left two
assert.equal(lobes.filter(p => /right lung/i.test(p.name)).length, 3);
assert.equal(lobes.filter(p => /left lung/i.test(p.name)).length, 2);
for (const p of lobes) assert.equal(p.system, 'respiratory');

// serous membranes: every layer exists, is schematic, and the layer key maps onto the switch list
assert.equal(serous.length, 7);
const keys = new Set(SEROUS_LAYERS.map(l => l.key));
for (const p of serous) { assert.equal(p.system, 'serous'); assert.ok(p.schematic, p.name); assert.ok(keys.has(serousLayerKey(p.name)), p.name); }
for (const k of keys) assert.ok(serous.some(p => serousLayerKey(p.name) === k), k);

// female organs: sex-tagged, filtered, Chinese-named
for (const n of ['Left ovary', 'Right ovary', 'Body of uterus', 'Cervix of uterus', 'Vagina']) assert.ok(female.some(p => p.name === n), n);
for (const p of female) {
  assert.equal(p.sex, 'female');
  assert.ok(matchesSex(p, 'female') && !matchesSex(p, 'male') && !matchesSex(p, undefined), p.name);
  const zh = structureProfile(p.name, p.system, p).chinese;
  assert.ok(/[一-鿿]/.test(zh) && !/[A-Za-z]{4}/.test(zh), `${p.name} -> ${zh}`);
}
for (const p of [...serous, ...lobes]) { const zh = structureProfile(p.name, p.system, p).chinese; assert.ok(!/[A-Za-z]{4}/.test(zh), `${p.name} -> ${zh}`); }
assert.ok(matchesSex({system: 'reproductive'}, 'male') && !matchesSex({system: 'reproductive'}, 'female'));
assert.ok(matchesSex({system: 'skeletal'}, 'female'));

// placement: uterus between bladder (in front, below) and rectum (behind); bounds in atlas metres
const mid = p => p.bounds[0].map((v, i) => (v + p.bounds[1][i]) / 2);
const atlas = read('atlas-stream.json.gz');
const find = re => atlas.parts.find(p => re.test(p.name));
const bladder = find(/^urinary bladder$/i), rectum = find(/^rectum$/i), uterus = female.find(p => p.name === 'Body of uterus');
if (bladder && rectum) {
  assert.ok(mid(rectum)[2] < mid(uterus)[2] && mid(uterus)[2] < mid(bladder)[2], 'uterus sits between rectum (behind) and bladder (in front)');
  assert.ok(mid(uterus)[1] > mid(bladder)[1], 'uterus lies above the bladder');
  const lo = female.find(p => p.name === 'Left ovary'), ro = female.find(p => p.name === 'Right ovary'), lk = find(/^left kidney$/i), rk = find(/^right kidney$/i);
  if (lk && rk) assert.equal(Math.sign(mid(lo)[0]), Math.sign(mid(lk)[0]), 'left ovary on the same side as the left kidney'), assert.equal(Math.sign(mid(ro)[0]), Math.sign(mid(rk)[0]));
}
console.log(`organs-b ok: ${lobes.length} lobes, ${serous.length} serous shells, ${female.length} female parts`);
