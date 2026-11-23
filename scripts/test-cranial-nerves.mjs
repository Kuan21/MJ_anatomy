// Cranial nerves animation (app/cranial-nerves/): the twelve nerves and their text, the names of the head-and-neck required list, that every nerve, opening and target the animation
// draws exists in the site's own packages (nerve stream, main atlas, facial muscles, the skull openings of the schematic package), the light band, the state machine, and the rules that
// keep the animation from downloading anything new. No browser. Prints counts only.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
import {scanLine} from './lib/zh-rules.mjs';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));   // .pathname gives /C:/… on Windows
const d = await quizModule('app/cranial-nerves/cn-data.ts');
const {CRANIAL_NERVES, NERVE_COUNT, CN_NOTE, LEVELS, KIND_ZH, flowDirection, bandAt, STEP_COUNT, initialPlay, goTo, stepBy, wrapStep, advance, AUTO_DWELL_S} = d;

// ---- the twelve, in order, with the required-list names
assert.equal(NERVE_COUNT, 12);
assert.deepEqual(CRANIAL_NERVES.map(n => n.roman), ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']);
const required = JSON.parse(fs.readFileSync(path.join(root, 'docs/required-structures/head-neck.json'), 'utf8')).structures;
for (const n of CRANIAL_NERVES) {
  const r = required.find(s => s.en === n.en);
  assert.ok(r, `${n.en} is on the required list`);
  assert.equal(n.zh, r.zh, `${n.en}: Chinese name follows the required list (${r.zh})`);
}
assert.deepEqual(CRANIAL_NERVES.filter(n => n.kind === 'sensory').map(n => n.n), [1, 2, 8]);
assert.deepEqual(CRANIAL_NERVES.filter(n => n.kind === 'motor').map(n => n.n), [3, 4, 6, 11, 12]);
assert.deepEqual(CRANIAL_NERVES.filter(n => n.kind === 'mixed').map(n => n.n), [5, 7, 9, 10]);
assert.deepEqual(LEVELS.flatMap(l => l.nerves), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 'every nerve at one level, in order');
// openings that every learner is asked about
const via = name => CRANIAL_NERVES.filter(n => n.openings.some(o => o.mark === name || o.en.startsWith(name))).map(n => n.n);
assert.deepEqual(via('Superior orbital fissure'), [3, 4, 5, 6]);
assert.deepEqual(via('Jugular foramen'), [9, 10, 11]);
assert.deepEqual(via('Internal acoustic meatus'), [7, 8]);
assert.deepEqual(via('Foramen rotundum'), [5]); assert.deepEqual(via('Foramen ovale'), [5]); assert.deepEqual(via('Hypoglossal canal'), [12]); assert.deepEqual(via('Optic canal'), [2]); assert.deepEqual(via('Stylomastoid foramen'), [7]);

// ---- text: English above, Chinese below, no notes wording, no Cantonese
const CJK = /[㐀-鿿]/, FORBIDDEN = /[0-9]{4} ?p\.[0-9]|共筆|筆記|跑考|課堂|講義|Course notes|cmu-course|neuro-notes|M65×CM57|出處|CMU|中國醫藥大學|課件|上課|下圖|上圖|圖中|老師|考古|Netter|Moore|Gray|Guyton|Kandel|Sobotta|Snell/;
const texts = [CN_NOTE, ...Object.values(KIND_ZH), ...LEVELS.flatMap(l => [l.en, l.zh])];
for (const n of CRANIAL_NERVES) {
  assert.ok(!CJK.test(n.en) && CJK.test(n.zh) && n.fn.length > 10 && n.tip.length > 10 && n.points.length >= 1, `${n.id}: text`);
  assert.ok(n.openings.length >= 1 && n.targets.length >= 1, `${n.id}: opening and target`);
  for (const x of [...n.openings, ...n.targets, n.from]) assert.ok(!CJK.test(x.en) && CJK.test(x.zh), `${n.id}: ${x.en} bilingual`);
  texts.push(n.en, n.zh, n.fn, n.tip, ...n.points, n.from.en, n.from.zh, ...n.openings.flatMap(o => [o.en, o.zh]), ...n.targets.flatMap(t => [t.en, t.zh]));
}
for (const t of texts) {assert.deepEqual(scanLine(t), [], `Cantonese wording: ${t}`); assert.ok(!FORBIDDEN.test(t), `note wording or a book name: ${t}`);}

// ---- everything drawn exists in the site's packages, on both sides
const gz = f => JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root, f))));
const nerveStream = JSON.parse(fs.readFileSync(path.join(root, 'public/models/nerve-stream.json'), 'utf8'));
const atlas = JSON.parse(fs.readFileSync(path.join(root, 'public/models/atlas-stream.json'), 'utf8')), facial = gz('public/models/facial/facial-stream.json.gz'), paokao = gz('public/models/paokao/paokao-stream.json.gz');
const SUFFIX = /\.(?:l|r)(?:\.\d+)?$|\.\d+$/, clean = n => n.replace(SUFFIX, '').replace(SUFFIX, '').trim(), sideOfNerve = n => /\.l(\.\d+)?$/i.test(n) ? 'left' : 'right';
const sideless = n => n.toLowerCase().replace(/\b(left|right)\b\s?/g, '').replace(/\s+/g, ' ').trim();
const nerveMeshes = nerveStream.chunks.flatMap(c => c.meshes.map(m => ({...m, bytes: c.bytes, url: c.url})));
let nerveBytes = 0; const nerveChunks = new Set();
for (const n of CRANIAL_NERVES) {
  const hits = nerveMeshes.filter(m => n.meshes.test(clean(m.name)));
  for (const side of ['left', 'right']) assert.ok(hits.some(m => sideOfNerve(m.name) === side), `${n.en}: ${side} side in the nerve stream`);
  for (const m of hits) if (!nerveChunks.has(m.url)) {nerveChunks.add(m.url); nerveBytes += m.bytes;}
}
const siteNames = new Set([...atlas.parts, ...facial.parts].map(p => sideless(p.name)));
for (const n of CRANIAL_NERVES) for (const t of n.targets) for (const m of t.meshes) assert.ok(siteNames.has(m), `${n.id}: target mesh "${m}" exists in the atlas or the facial package`);
const marks = new Set(paokao.parts.map(p => sideless(p.name)));
for (const n of CRANIAL_NERVES) for (const o of n.openings) if (o.mark) assert.ok(marks.has(o.mark.toLowerCase()), `${n.id}: opening "${o.mark}" is marked on the skull`);
assert.equal(CRANIAL_NERVES.filter(n => n.openings.some(o => !o.mark)).map(n => n.id).join(), 'olfactory', 'only the cribriform plate is a schematic point');
for (const name of ['optic canal', 'superior orbital fissure', 'foramen rotundum', 'foramen ovale', 'internal acoustic meatus', 'stylomastoid foramen', 'hypoglossal canal'])
  assert.equal(paokao.parts.filter(p => sideless(p.name) === name).length >= 2, true, `${name}: marked on both sides`);
assert.ok(nerveBytes < 12e6, `nerve download ${(nerveBytes / 1e6).toFixed(1)} MB`);

// ---- light band: outward for motor, inward for sensory, both for mixed; peaks once per period
assert.deepEqual(flowDirection('motor'), ['out']); assert.deepEqual(flowDirection('sensory'), ['in']); assert.deepEqual(flowDirection('mixed'), ['out', 'in']);
const peakAt = (t, dir) => {let best = -1, at = 0; for (let x = 0; x < .06; x += .0005) {const v = bandAt(x, t, dir); if (v > best) {best = v; at = x;}} return at;};
assert.ok(peakAt(.2, 'out') > peakAt(.1, 'out'), 'the outward band moves away from the brainstem');
assert.ok(peakAt(.2, 'in') < peakAt(.1, 'in') || peakAt(.1, 'in') < .002, 'the inward band moves toward the brainstem');
assert.ok(Math.abs(bandAt(0, 0, 'out') - 1) < 1e-9 && bandAt(.03, 0, 'out') < .01);

// ---- state machine: overview + twelve
assert.equal(STEP_COUNT, 13);
let s = initialPlay(false); assert.equal(s.step, 0); assert.equal(initialPlay(true).playing, false);
assert.equal(wrapStep(-1), 12); assert.equal(stepBy(s, -1).step, 12); assert.equal(goTo(s, 13).step, 0);
assert.equal(advance({...s, auto: true, dwell: AUTO_DWELL_S - .01}, .1, 1).step, 1); const paused = {...s, playing: false}; assert.equal(advance(paused, 1, 1), paused, 'paused stays still');

// ---- sources: only the site's packages are fetched, nothing from the notes; route and button
const dir = path.join(root, 'app/cranial-nerves'), sources = fs.readdirSync(dir).filter(f => /\.(ts|tsx|css)$/.test(f));
assert.ok(sources.length >= 5);
const allowed = /^models\/(atlas-stream\.json\.gz|facial\/facial-stream\.json\.gz|paokao\/paokao-stream\.json\.gz|nerve-stream\.json)$/;
for (const f of sources) {
  const text = fs.readFileSync(path.join(dir, f), 'utf8'), code = text.replace(/\/\/.*$/gm, '');
  for (const m of code.matchAll(/['"`]([^'"`]*\.(glb|gltf|bin|obj|fbx|png|jpg|jpeg|mp4|webm|json|gz))['"`]/g)) assert.ok(allowed.test(m[1]), `${f}: fetches only the site's packages (${m[1]})`);
  assert.ok(!/fetch\(\s*['"]https?:/.test(text), `${f}: no remote fetch`);
  const shown = text.split('\n').filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l)).join('\n');
  assert.ok(!FORBIDDEN.test(shown), `${f}: note wording or a book name in a string`);
  for (const line of shown.split('\n')) assert.deepEqual(scanLine(line), [], `${f}: Cantonese wording in ${line.trim().slice(0, 60)}`);
}
// labels never sit on the picture (same layout as the swallowing animation): two gutters beside the canvas, leader lines only; legend above and controls below the picture
const sceneText = fs.readFileSync(path.join(dir, 'cn-scene.ts'), 'utf8'), anim = fs.readFileSync(path.join(dir, 'cn-animation.tsx'), 'utf8'), css = fs.readFileSync(path.join(dir, 'cn.css'), 'utf8');
assert.ok(sceneText.includes('new SideLabels(') && !/new LabelLayer\(/.test(sceneText), 'side-gutter labels');
assert.ok(/cn-gutter[\s\S]*cn-canvas[\s\S]*cn-gutter/.test(anim) && anim.indexOf('cn-legend') < anim.indexOf('cn-view') && anim.indexOf('cn-controls') > anim.indexOf('cn-view'), 'gutter | canvas | gutter, legend above, controls below');
assert.ok(/\.cn-page \.cn-controls\{position:static/.test(css) && !/\.cn-legend\{position:absolute/.test(css) && /\.cn-stage\{display:grid;grid-template-rows:auto minmax\(0,1fr\) auto\}/.test(css) && /\.cn-canvas canvas\{position:absolute/.test(css), 'nothing laid over the picture: legend, picture and controls are three rows');
assert.ok(anim.includes("import '../organ/organ.css'"), 'loading and error messages are styled');
// label keys carry the nerve, so a label never keeps the text of the previous nerve; targets are see-through so they do not hide the nerve
assert.ok(sceneText.includes('key: `p-${n.id}-${i}`') && sceneText.includes('key: `t-${n.id}-${i}`') && sceneText.includes('mat(TARGET, .45)'));
// the two openings without a mark of their own stay labelled 示意 until the head-and-neck model marks them
assert.ok(/schematic: !o\.mark \|\| \(\/jugular\/i/.test(sceneText) && CN_NOTE.includes('示意') && CN_NOTE.includes('頸靜脈孔') && CN_NOTE.includes('篩板'), 'cribriform plate and left jugular foramen are schematic');
const main = fs.readFileSync(path.join(root, 'web/main.tsx'), 'utf8'), page = fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8');
assert.ok(/lazy\(\(\) => import\('\.\.\/app\/cranial-nerves\/cn-animation'\)\)/.test(main) && main.includes("'#/animation/cranial-nerves'"), 'route, loaded only when opened');
assert.ok(page.includes("'#/animation/cranial-nerves'") && page.includes('>腦神經</Button>'), 'button in the atlas');

console.log(`cranial nerves animation: ${NERVE_COUNT} nerves, ${texts.length} texts, every nerve on both sides, ${nerveChunks.size} nerve packages (${(nerveBytes / 1e6).toFixed(1)} MB), ${sources.length} source files checked`);
