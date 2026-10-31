// Lung labels: category colours, data-card fields by type, the hilum as one region, no left tracheal contact area.
// Output is pass/fail and counts only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {quizModule} from './quiz-modules.mjs';

const text = f => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const cards = JSON.parse(text('app/mj-paokao.json')), lung = Object.values(cards).filter(c => c.lung);
const {LUNG_CATEGORIES, lungCategoryOf} = await quizModule('app/mj-lung-categories.ts');
const labels = text('app/mj-lung-labels.ts');

// 1. every labelled lung structure has a category; every category is used; letters and colours are unique (colour is never the only cue)
const names = [...labels.matchAll(/names:\['([^']+)'\]/g)].map(m => m[1]);
assert.ok(names.length >= 40, 'label definitions not found');
const unknown = names.filter(n => !lungCategoryOf(n) && n !== 'Hilum of left lung' && n !== 'Hilum of right lung');
assert.deepEqual(unknown, [], `labels without a category: ${unknown.join(', ')}`);
assert.equal(new Set(LUNG_CATEGORIES.map(c => c.letter)).size, LUNG_CATEGORIES.length, 'letters must be unique');
assert.equal(new Set(LUNG_CATEGORIES.map(c => c.light)).size, LUNG_CATEGORIES.length, 'colours must be unique');
for (const c of LUNG_CATEGORIES) assert.ok(names.some(n => lungCategoryOf(n) === c.key), `category ${c.key} has no label`);
assert.equal(lungCategoryOf('Esophagus'), null, 'the oesophagus itself is not a lung structure');
for (const [n, k] of [['Right groove for subclavian artery', 'artery'], ['Groove for azygos vein', 'vein'], ['Groove for esophagus', 'tube'], ['Cardiac notch of left lung', 'heart'], ['Groove for first rib of right lung', 'bone'], ['Lingula of left lung', 'part'], ['Oblique fissure of left lung', 'fissure'], ['Anterior border of right lung', 'border'], ['Left pulmonary ligament', 'hilum'], ['Right inferior pulmonary vein', 'vein'], ['Left main bronchus', 'tube']]) assert.equal(lungCategoryOf(n), k, n);

// 2. the left lung has no tracheal contact area (not in the course summary; the aortic arch lies between trachea and left lung)
assert.ok(!lung.some(c => c.name === 'Contact area for trachea of left lung'), 'left tracheal contact area must not exist');
assert.ok(!labels.includes('trachea of left lung'), 'left tracheal contact area label must not exist');
assert.ok(lung.some(c => c.name === 'Contact area for trachea of right lung'));

// 3. card fields by type: impressions (location, impressed by, neighbouring impressions), hilum (location, contents, arrangement), lobe parts (location, segments, boundaries); never the old blood-supply field
const FIELDS = {impression: ['位置', '壓出的構造', '相鄰壓跡'], hilum: ['位置', '內容物', '排列'], 'lobe-part': ['位置', '包含的肺段', '邊界']};
for (const c of lung) {
  const got = c.extra.map(f => f.labelZh);
  if (FIELDS[c.lung]) assert.deepEqual(got, FIELDS[c.lung], `${c.name}: fields`);
  else assert.ok(got[0] === '位置' && got.length >= 2, `${c.name}: fields`);
  for (const f of c.extra) assert.ok(f.en && f.zh && /[一-鿿]/.test(f.zh) && !/[一-鿿]/.test(f.en), `${c.name}: ${f.labelEn} needs English and Chinese`);
  assert.ok(!got.includes('血液供應／神經') && !got.includes('構造／毗鄰關係'), `${c.name}: old fields`);
}
for (const side of ['left', 'right']) {
  const h = lung.find(c => c.name === `Hilum of ${side} lung`);
  assert.equal(h.extra[0].zh, `${side === 'left' ? '左' : '右'}肺縱隔面`);
  assert.match(h.extra[2].zh, /膈神經/); assert.match(h.extra[2].zh, /迷走神經/);
}
assert.equal(lung.filter(c => c.lung === 'impression').length >= 17, true);
assert.equal(cards[Object.keys(cards).find(k => cards[k].name === 'Lingula of left lung')].lung, 'lobe-part');

// 4. the info card and the page: lung categories, no depth field for impressions and lobes, the hilum lights its root structures, legend and master switch
const info = text('app/mj-structure-info.ts'), page = text('app/page.tsx'), scene = text('app/scene.tsx');
assert.match(info, /Part of lobe','肺葉部分'/); assert.match(info, /hilum:\['Lung structure','肺的結構'\]/); assert.match(info, /impression:\['Impression','壓跡'\]/);
assert.match(page, /\(\?:Impression\|Part of lobe\|Lung structure\|Lobe of lung\)/, 'depth field must be hidden for lung structures');
assert.match(page, /lungHilumRoot/); assert.match(page, /aria-label="分類上色"/); assert.match(page, /className="lung-legend"/);
assert.match(scene, /tintState/); assert.match(scene, /partTint\.a < 0\.5\) discard/, 'tinted surface patches are decals drawn through the tint');
console.log(`Lung categories OK: ${names.length} labels in ${LUNG_CATEGORIES.length} categories, ${lung.length} lung cards with fields by type, no left tracheal contact area.`);
