// Bronchopulmonary segments (肺段) of the 肺 focus view.
// Real vs schematic: the segmental bronchi are real meshes of the atlas; the segment territories on the lobes are a schematic partition (示意分區) built by
// scripts/paokao-structures/lung-segments.mjs. This test checks the data, the model packages, the panel wiring and the quiz bank.
//   node scripts/test-lung-segments.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {quizModule} from './quiz-modules.mjs';

const text = f => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const data = JSON.parse(text('app/mj-lung-segments.json')), segs = data.segments;

// --- scheme: right 10, left 8 (apicoposterior S1+2 and anteromedial basal S7+8 merged) ---------------------------------------------------------------------
assert.equal(segs.filter(s => s.side === 'right').length, 10, 'right lung: 10 segments');
assert.equal(segs.filter(s => s.side === 'left').length, 8, 'left lung: 8 segments (merged scheme)');
assert.deepEqual(segs.filter(s => s.side === 'right').map(s => s.number), ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10']);
assert.deepEqual(segs.filter(s => s.side === 'left').map(s => s.number), ['S1+2', 'S3', 'S4', 'S5', 'S6', 'S7+8', 'S9', 'S10']);
assert.equal(new Set(segs.map(s => s.en)).size, segs.length, 'segment names are unique');
assert.equal(new Set(segs.map(s => s.key)).size, segs.length);
for (const s of segs) {
  assert.ok(s.en && s.zh && /^#[0-9a-f]{6}$/i.test(s.color), s.key);
  assert.ok(s.bronchus?.[0] && s.bronchus?.[1] && s.relations?.[0] && s.relations?.[1], `${s.key}: card fields`);
  assert.ok(new RegExp(`${s.side} lung$`).test(s.en) && s.zh.startsWith(s.side === 'left' ? '左肺' : '右肺'), `${s.key}: side in the names`);
  assert.ok(!/[一-鿿]/.test(s.en) && !/[A-Za-z]/.test(s.zh.replace(/S\d/g, '')), `${s.key}: English name is English, Chinese name is Chinese`);
  for (const a of [...s.aliases.en, ...s.aliases.zh]) assert.ok(a.trim() === a && a.length, `${s.key}: alias ${a}`);
}
// the left lung accepts the split names as well as the merged one
const left = Object.fromEntries(segs.filter(s => s.side === 'left').map(s => [s.key, s]));
for (const a of ['s1', 's2', 'apical segment', 'posterior segment', 's1+2', 'apicoposterior segment']) assert.ok(left.L12.aliases.en.includes(a), `apicoposterior accepts ${a}`);
for (const a of ['s7', 's8', 'medial basal segment', 'anterior basal segment', 's7+8', 'anteromedial basal segment']) assert.ok(left.L78.aliases.en.includes(a), `anteromedial basal accepts ${a}`);
for (const a of ['尖段', '後段', '尖後段']) assert.ok(left.L12.aliases.zh.includes(a), `尖後段 accepts ${a}`);
for (const a of ['內基底段', '前基底段', '前內基底段']) assert.ok(left.L78.aliases.zh.includes(a), `前內基底段 accepts ${a}`);
// colours: distinct inside one lung (CIE76 ΔE ≥ 18), and the segments both lungs share keep the same colour
const lab = hex => {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4), [r, g, b] = c;
  const xyz = [(.4124 * r + .3576 * g + .1805 * b) / .95047, .2126 * r + .7152 * g + .0722 * b, (.0193 * r + .1192 * g + .9505 * b) / 1.08883].map(v => v > .008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116);
  return [116 * xyz[1] - 16, 500 * (xyz[0] - xyz[1]), 200 * (xyz[1] - xyz[2])];
};
const dE = (a, b) => Math.hypot(...lab(a).map((v, i) => v - lab(b)[i]));
let minE = Infinity, minPair = '';
for (const side of ['right', 'left']) {
  const list = segs.filter(s => s.side === side).concat([{key: 'lobe', color: '#c98f8a'}]);
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) { const d = dE(list[i].color, list[j].color); if (d < minE) { minE = d; minPair = `${side} ${list[i].key}/${list[j].key}`; } }
}
assert.ok(minE >= 18, `segment colours too alike inside one lung: ${minPair} ΔE ${minE.toFixed(1)}`);
console.log(`colours: smallest ΔE inside one lung (and against the lobe pink) ${minE.toFixed(1)} (${minPair})`);

// --- the real segmental bronchi are in the atlas, and each belongs to exactly one segment ---------------------------------------------------------------
const atlas = JSON.parse(text('public/models/atlas.json'));
const trees = atlas.parts.filter(p => /bronchial tree$/i.test(p.name) && p.system === 'respiratory');
const owner = new Map(); for (const s of segs) for (const t of s.trees) owner.set(t.toLowerCase(), s.key);
for (const t of trees) assert.ok(owner.has(t.name.toLowerCase()), `bronchial tree mesh "${t.name}" belongs to no segment`);
for (const s of segs) assert.ok(s.trees.every(t => trees.some(p => p.name === t)), `${s.key}: its bronchial tree is not in the atlas`);
console.log(`segmental bronchi: ${trees.length} meshes of the atlas, all assigned (${[...owner.keys()].length} names, ${segs.length} segments)`);

// --- the territories are in the schematic package, one per segment, no overlap with each other (each lobe triangle goes to one segment) ------------------------
const pk = JSON.parse(gunzipSync(fs.readFileSync(new URL('../public/models/paokao/paokao-stream.json.gz', import.meta.url))));
for (const s of segs) {
  const hit = pk.parts.filter(p => p.name === s.en);
  assert.equal(hit.length, 1, `${s.key}: territory part in the schematic package`);
  assert.equal(hit[0].kind, 'segment'); assert.equal(hit[0].schematic, true); assert.equal(hit[0].system, 'respiratory');
  assert.ok(hit[0].indexCount / 3 >= 300, `${s.key}: territory too small (${hit[0].indexCount / 3} triangles)`);
}
const report = JSON.parse(text('docs/lung-segments.json'));
for (const lobe of new Set(report.map(r => r.lobe))) {
  const sum = report.filter(r => r.lobe === lobe).reduce((n, r) => n + r.surfaceShareOfLobe, 0);
  assert.ok(Math.abs(sum - 1) < .02, `${lobe}: territories cover the whole lobe surface (${sum.toFixed(3)})`);
}
for (const r of report) assert.ok(r.surfaceShareOfLobe >= .08, `${r.name}: territory is only ${(r.surfaceShareOfLobe * 100).toFixed(1)} % of its lobe`);

// --- cards: lobe, segment, segmental bronchus, main relations (+ clinical note only where there is one) ---------------------------------------------------
const cards = JSON.parse(text('app/mj-paokao.json'));
for (const s of segs) {
  const card = Object.values(cards).find(c => c.name === s.en);
  assert.ok(card && card.kind === 'segment' && card.zh === s.zh, `${s.key}: card`);
  const labels = card.extra.map(e => e.labelEn);
  assert.deepEqual(labels, ['Lobe', 'Segment', 'Segmental bronchus', 'Main relations', ...(s.clinical ? ['Clinical note'] : [])], `${s.key}: card fields`);
  for (const e of card.extra) assert.ok(e.en && e.zh, `${s.key}: ${e.labelEn} is bilingual`);
}

// --- the site must not carry notes, sources or page numbers ----------------------------------------------------------------------------------------------
for (const word of ['跑考', '共筆', '筆記', '課堂', '頁碼', 'p\\.\\d']) assert.ok(!new RegExp(word).test(JSON.stringify(data)), `segment data mentions ${word}`);

// --- panel and scene wiring -----------------------------------------------------------------------------------------------------------------------------
const page = text('app/page.tsx'), scene = text('app/scene.tsx'), css = text('app/globals.css');
assert.ok(/aria-label="顯示肺段"/.test(page) && /onCheckedChange=\{on=>setLungSegments\(!!on\)\}/.test(page), 'panel switch for the segments');
assert.ok(/aria-label="肺段圖例"/.test(page) && /onClick=\{\(\)=>pickSegment\(x\.key\)\}/.test(page), 'legend rows open the segment card');
assert.ok(/lungSegments\?:boolean/.test(text('app/anatomy.ts')), 'SceneState.lungSegments');
assert.ok(/segMats/.test(scene) && /latest\.current\.lungSegments/.test(scene), 'the scene colours the segments from the switch');
assert.ok(/'lungseg-tree:'/.test(scene) && /'lungseg-surf:'/.test(scene), 'a bronchus and its surface territory use a material pair of the same segment colour');
assert.ok(/\.lung-seg-row/.test(css), 'legend styles');
// with the switch off a territory is hidden (it would cover the lobe and swallow clicks)
assert.ok(/kind===LUNG_SEGMENT_KIND&&!s\.lungSegments&&!selection\.has\(p\.id\)\)return false/.test(scene), 'territories are hidden while the switch is off');

// --- quiz: the segments are a section of the lung quiz, both levels hold the same questions, split names are accepted ---------------------------------
const {QUIZ_REGIONS, questionPool, sceneStructures} = await quizModule('app/quiz/catalogue.ts');
const {namingPool} = await quizModule('app/quiz/level2.ts');
const {judgeName} = await quizModule('app/quiz/naming.ts');
assert.ok(QUIZ_REGIONS.lung.sections.some(s => s.id === 'segments'), 'lung quiz section "segments"');
const catalogue = JSON.parse(text('public/models/quiz-lung.json'));
const settings = {section: 'segments', side: 'both', systems: [], categories: ['organ'], count: 9999};
const one = questionPool(catalogue, settings), two = namingPool(catalogue, settings);
assert.equal(one.length, 18, 'level 1: 10 right + 8 left segment questions');
assert.equal(two.length, 18, 'level 2 asks the same 18');
for (const s of catalogue.structures.filter(x => x.sections.includes('segments'))) assert.ok(s.chinese, `${s.name}: Chinese name`);
const askLeft = n => catalogue.structures.find(x => x.name === n);
const ap = askLeft('Apicoposterior segment of left lung'), am = askLeft('Anteromedial basal segment of left lung');
for (const typed of ['Apicoposterior segment', 'apical segment', 'Posterior segment', 'S1', 's2', 'S1+2', '尖後段', '尖段', '後段', '左上葉尖後段']) assert.equal(judgeName(typed, ap, {language: 'any', needSide: false}).result, 'correct', `left S1+2 accepts "${typed}"`);
for (const typed of ['Anteromedial basal segment', 'medial basal segment', 'Anterior basal segment', 'S7', 's8', 'S7+8', '前內基底段', '內基底段', '前基底段']) assert.equal(judgeName(typed, am, {language: 'any', needSide: false}).result, 'correct', `left S7+8 accepts "${typed}"`);
const r1 = catalogue.structures.find(x => x.name === 'Apical segment of right lung');
for (const typed of ['apical segment', 'S1', '尖段', '右上葉尖段']) assert.equal(judgeName(typed, r1, {language: 'any', needSide: false}).result, 'correct', `right S1 accepts "${typed}"`);
assert.notEqual(judgeName('S2', r1, {language: 'any', needSide: false}).result, 'correct', 'right S1 does not accept S2');
// a segment question shows the lobes and the territories only; a surface-mark question never shows the territories
const target = askLeft('Superior segment of right lung') ?? catalogue.structures.find(x => x.name === 'Superior segment of right lung');
const scene1 = sceneStructures(catalogue, target, 'segments', 'right');
assert.ok(scene1.every(s => s.sections.includes('segments') || s.sections.length === 0), 'segment question: lobes and territories only');
const mark = catalogue.structures.find(x => x.name === 'Right groove for azygos vein');
assert.ok(sceneStructures(catalogue, mark, 'all', 'right').every(s => !s.sections.includes('segments')), 'mark question: no territories');
console.log(`lung segments passed: ${segs.length} segments (right 10, left 8), ${trees.length} real bronchial meshes, ${one.length} quiz questions, split names accepted for the left lung`);
