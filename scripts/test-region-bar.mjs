// Top region bar: order and labels, region membership of landmark structures, internal views, sides, and that docs/region-members.md is current.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import {loadFullAtlas} from './lib/full-atlas.mjs';

const root = new URL('../', import.meta.url), tmp = new URL('.sites-runtime/', root);
fs.mkdirSync(fileURLToPath(tmp), {recursive: true});
for (const f of ['mj-part-regions', 'mj-region-bar']) {
  const src = fs.readFileSync(fileURLToPath(new URL(`app/${f}.ts`, root)), 'utf8');
  fs.writeFileSync(fileURLToPath(new URL(`${f}.mjs`, tmp)), ts.transpileModule(src, {compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022}}).outputText.replace(/from '\.\/([\w-]+)'/g, "from './$1.mjs'"));
}
const bar = await import(new URL('mj-region-bar.mjs', tmp));
const {atlas} = loadFullAtlas(), parts = atlas.parts, index = bar.buildRegionIndex(parts);

assert.deepEqual(bar.REGION_BAR.map(r => r.label), ['全身', '頭頸', '上肢', '胸腔', '背部', '腹腔', '骨盆與會陰', '臀區', '下肢']);
assert.deepEqual(bar.REGION_BAR.filter(r => r.paired).map(r => r.label), ['頭頸', '上肢', '胸腔', '背部', '臀區', '下肢']);
assert.deepEqual(bar.regionDef('chest').subs.map(s => s.label).sort(), ['縱隔與心臟', '胸壁', '肺與胸膜'].sort());
assert.deepEqual(bar.regionDef('abdomen').subs.map(s => s.label).sort(), ['後腹壁（腎、大血管）', '腹壁', '腹腔器官'].sort());
assert.deepEqual(bar.regionDef('pelvis').subs.map(s => s.label).sort(), ['會陰', '骨盆器官', '骨盆壁'].sort());

const names = (key, sub, side = 'both') => bar.regionMembers(index, parts, key, sub, side);
const has = (set, re, ids = set.focus) => ids.some(id => re.test(index.byId.get(id).name));
const only = (set, re) => set.focus.filter(id => re.test(index.byId.get(id).name));

// body cavities: internal views drop the wall and the skin, the bones around stay but see-through
for (const [key, sub] of [['chest', 'mediastinum'], ['chest', 'lung'], ['abdomen', 'organs'], ['pelvis', 'organs']]) {
  const s = names(key, sub);
  assert.ok(s.focus.length > 20, `${key}/${sub} has structures`);
  assert.ok(!has(s, /^Skin$/), `${key}/${sub} hides the skin`);
  assert.ok(!has(s, /pectoralis|rectus abdominis|external oblique|serratus anterior|latissimus|trapezius/i), `${key}/${sub} hides the superficial wall muscles`);
  assert.ok(s.faded.length > 0 && s.faded.every(id => ['skeletal', 'connective'].includes(index.byId.get(id).system)), `${key}/${sub} draws bones see-through`);
}
assert.ok(has(names('chest', 'mediastinum'), /Wall of ventricle|Ascending aorta|Trachea/), 'mediastinum has heart, aorta, trachea');
assert.ok(has(names('chest', 'mediastinum'), /first rib/i, names('chest', 'mediastinum').faded), 'ribs are see-through in the mediastinum view');
assert.ok(!has(names('chest', 'mediastinum'), /lobe of (?:right |left )?lung/i), 'lungs are in 肺與胸膜');
assert.ok(has(names('chest', 'lung'), /Upper lobe of (?:right |left )?lung/i) && has(names('chest', 'lung'), /pleura/i), 'lung view has lobes and pleura');
assert.ok(has(names('chest', 'wall'), /Skin/) && has(names('chest', 'wall'), /pectoralis major/i) && has(names('chest', 'wall'), /intercostal/i), 'chest wall');
assert.ok(has(names('abdomen', 'organs'), /Stomach/) && has(names('abdomen', 'organs'), /Pancreas/) && !has(names('abdomen', 'organs'), /kidney/i), 'abdominal organs');
assert.ok(has(names('abdomen', 'retro'), /kidney/i) && has(names('abdomen', 'retro'), /Abdominal aorta/) && has(names('abdomen', 'retro'), /Inferior vena cava/) && has(names('abdomen', 'retro'), /psoas/i), 'posterior abdominal wall');
assert.ok(has(names('abdomen', 'wall'), /rectus abdominis/i) && !has(names('abdomen', 'wall'), /oblique fissure|superior oblique|inferior oblique/i), 'abdominal wall muscles only');
assert.ok(has(names('pelvis', 'organs'), /Urinary bladder/) && has(names('pelvis', 'organs'), /Rectum/), 'pelvic organs');
assert.ok(has(names('pelvis', 'wall'), /levator ani|coccygeus|piriformis/i) && has(names('pelvis', 'wall'), /hip bone/i), 'pelvic wall');
assert.ok(has(names('pelvis', 'perineum'), /Clitoris|Corpus cavernosum of penis/) && !has(names('pelvis', 'perineum'), /canal of spinal cord|canaliculus/i), 'perineum');
assert.ok(has(names('gluteal'), /gluteus maximus/i) && has(names('gluteal'), /piriformis/i), 'gluteal region');
assert.ok(has(names('back'), /erector|iliocostalis|multifidus/i) && has(names('back'), /vertebra/i) && has(names('back'), /trapezius|latissimus/i) && !has(names('back'), /gluteus/i), 'back');

// structures that cross regions are shown in each region they pass
const inAll = (re, list) => list.forEach(([k, s]) => assert.ok(has(names(k, s), re), `${re} in ${k}/${s}`));
inAll(/^Diaphragm$/, [['chest', 'wall'], ['chest', 'mediastinum'], ['chest', 'lung'], ['abdomen', 'organs'], ['abdomen', 'retro'], ['abdomen', 'wall']]);
inAll(/^(?:Descending aorta)$/, [['chest', 'mediastinum'], ['abdomen', 'retro'], ['abdomen', 'organs']]);
inAll(/^Inferior vena cava$/, [['chest', 'mediastinum'], ['abdomen', 'retro']]);
inAll(/latissimus dorsi/i, [['back'], ['chest', 'wall'], ['upper']]);
assert.ok(has(names('upper'), /latissimus dorsi/i), 'latissimus dorsi is in the upper limb');

// sides: a side keeps its own structures and the midline ones; the other side moves to `other`
for (const [key, sub] of [['chest', 'wall'], ['back'], ['gluteal'], ['head']]) {
  const l = names(key, sub, 'left'), r = names(key, sub, 'right'), both = names(key, sub);
  assert.ok(l.other.length > 0 && r.other.length > 0, `${key} has two sides`);
  assert.equal(new Set([...l.focus, ...l.other]).size, new Set(both.focus).size, `${key}: left + other = both`);
  assert.ok(!l.focus.some(id => r.other.length && new Set(l.other).has(id)), `${key}: left focus excludes the right`);
}
assert.ok(has(names('chest', 'lung', 'left'), /Upper lobe of left lung/i) && !has(names('chest', 'lung', 'left'), /Upper lobe of right lung/i), 'left lung only');
assert.ok(has(names('chest', 'mediastinum', 'left'), /Ascending aorta/), 'midline structures stay when one side is chosen');

// every region has structures and the nerve rules exist
for (const r of bar.REGION_BAR.filter(r => r.key !== 'whole')) for (const sub of r.subs ? r.subs.map(s => s.id) : [undefined]) {
  assert.ok(names(r.key, sub).focus.length > 20, `${r.key}/${sub} is not empty`);
  if (!['head', 'upper', 'lower'].includes(r.key)) assert.ok(bar.regionNerveFilter(r.key, sub)('x intercostal nerves.l.001') || bar.regionNerveFilter(r.key, sub)('sciatic nerve.l.001') || bar.regionNerveFilter(r.key, sub)('vagus nerve (x).l.001') || bar.regionNerveFilter(r.key, sub)('pudendal nerve.l.001') || bar.regionNerveFilter(r.key, sub)('Spinal nerve') || bar.regionNerveFilter(r.key, sub)('hypogastric') || bar.regionNerveFilter(r.key, sub)('splanchnic'), `nerve rule for ${r.key}/${sub}`);
}
console.log('region bar: ok');
