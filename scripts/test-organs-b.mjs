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
// 7 thoracic layers + the female pelvic peritoneum (the two pouches are in the female stream)
assert.equal(serous.length, 8);
const keys = new Set(SEROUS_LAYERS.map(l => l.key));
for (const p of serous) { assert.equal(p.system, 'serous'); assert.ok(p.schematic, p.name); assert.ok(keys.has(serousLayerKey(p.name)), p.name); }
const pouches = female.filter(p => p.system === 'serous');
assert.deepEqual(pouches.map(p => p.name).sort(), ['Rectouterine pouch', 'Vesicouterine pouch']);
for (const k of keys) assert.ok([...serous, ...pouches].some(p => serousLayerKey(p.name) === k), k);
for (const p of [...serous.filter(q => /peritoneum/i.test(q.name)), ...pouches]) assert.ok(matchesSex(p, 'female') && !matchesSex(p, 'male'), p.name);

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
// female pelvis: the HRA bones replace the male hip bones and sacrum in female mode, and the organs lie inside them
for (const n of ['Left hip bone', 'Right hip bone', 'Sacrum', 'Coccyx']) {
  const bone = female.find(p => p.name === n); assert.ok(bone && bone.system === 'skeletal', n);
  assert.ok(matchesSex(bone, 'female') && !matchesSex(bone, 'male'), n);
  const male = atlas.parts.find(p => p.name === n);
  if (male) assert.ok(matchesSex(male, 'male') && !matchesSex(male, 'female'), `male ${n} is hidden in female mode`);
}
{
  const hipL = female.find(p => p.name === 'Left hip bone'), hipR = female.find(p => p.name === 'Right hip bone'), sacrum = female.find(p => p.name === 'Sacrum');
  assert.ok(mid(hipL)[0] > 0 && mid(hipR)[0] < 0, 'hip bones on the correct sides');
  const lo = Math.min(hipR.bounds[0][0], hipL.bounds[0][0]), hi = Math.max(hipR.bounds[1][0], hipL.bounds[1][0]);
  for (const p of female.filter(q => q.system === 'reproductive' && /uterus|vagina|cervix/i.test(q.name))) assert.ok(p.bounds[0][0] > lo && p.bounds[1][0] < hi, `${p.name} lies between the hip bones`);
  assert.ok(mid(sacrum)[2] < mid(uterus)[2], 'sacrum behind the uterus');
  assert.ok(sacrum.bounds[1][1] > uterus.bounds[0][1] && hipL.bounds[1][1] > uterus.bounds[1][1] - .03, 'uterus lies within the height of the pelvis');
}
// female urinary organs replace the male bladder, ureters and urethra; the bladder lies in front of the uterus and below it, the urethra in front of the vagina
for (const n of ['Urinary bladder', 'Left ureter', 'Right ureter', 'Female urethra', 'Trigone of urinary bladder']) assert.ok(female.some(p => p.name === n && p.system === 'urinary'), n);
for (const n of ['Urinary bladder', 'Left ureter', 'Right ureter', 'Urethra']) { const male = atlas.parts.find(p => p.name === n); assert.ok(male && matchesSex(male, 'male') && !matchesSex(male, 'female'), `male ${n} is hidden in female mode`); }
{
  const bl = female.find(p => p.name === 'Urinary bladder'), ur = female.find(p => p.name === 'Female urethra'), vag = female.find(p => p.name === 'Vagina');
  assert.ok(mid(bl)[2] > mid(uterus)[2] && mid(bl)[1] < mid(uterus)[1], 'bladder in front of and below the uterus');
  assert.ok(bl.bounds[1][1] < uterus.bounds[1][1] && !(bl.bounds[0][2] < uterus.bounds[0][2] - .01), 'bladder does not reach behind the uterus');
  assert.ok(mid(ur)[2] > mid(vag)[2], 'urethra in front of the vagina');
  for (const side of ['Left', 'Right']) { const u = female.find(p => p.name === `${side} ureter`); assert.equal(Math.sign(mid(u)[0]), side === 'Left' ? 1 : -1, `${side} ureter on its own side`); assert.ok(u.bounds[1][1] - u.bounds[0][1] > .15, `${side} ureter runs from the kidney to the bladder`); }
}
console.log(`organs-b ok: ${lobes.length} lobes, ${serous.length} serous shells, ${female.length} female parts`);
