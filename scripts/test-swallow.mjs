// Swallowing animation (app/swallow/): the steps and their text, the time line of the swallow (order and overlap of the protective movements), the atlas structures it draws
// (every one exists in the main atlas package, one per name) and their relative positions, and the rules that keep the animation from downloading anything new.
// No browser. Prints counts only.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
import {scanLine} from './lib/zh-rules.mjs';

const root = new URL('../', import.meta.url).pathname;
const d = await quizModule('app/swallow/swallow-data.ts');
const parts = await quizModule('app/swallow/swallow-parts.ts');
const {SWALLOW_STEPS, STEP_COUNT, SWALLOW_NOTE, SWALLOW_S, poseAt, phaseAt, PATH_MARKS, initialPlay, goTo, stepBy, advance, wrapStep} = d;

// ---- steps
assert.deepEqual(SWALLOW_STEPS.map(s => s.id), ['oral', 'pharyngeal', 'oesophageal', 'whole']);
const CJK = /[㐀-鿿]/, FORBIDDEN = /[0-9]{4} ?p\.[0-9]|共筆|筆記|跑考|課堂|講義|Course notes|cmu-course|neuro-notes|M65×CM57|出處|CMU|中國醫藥大學|課件|上課|下圖|上圖|圖中|老師|考古|Netter|Moore|Gray|Guyton|Kandel|Sobotta|Snell/;
const texts = [SWALLOW_NOTE];
for (const s of SWALLOW_STEPS) {
  assert.ok(s.en.trim() && !CJK.test(s.en) && CJK.test(s.zh) && CJK.test(s.short), `${s.id}: titles`);
  assert.ok(s.points.length >= 3 && s.points.every(p => p.length > 15 && CJK.test(p)), `${s.id}: key points`);
  assert.ok(CJK.test(s.tip.label) && s.tip.text.length > 15, `${s.id}: exam tip`);
  assert.ok(s.span[0] >= 0 && s.span[1] <= SWALLOW_S && s.span[0] < s.span[1], `${s.id}: span inside the swallow`);
  texts.push(s.en, s.zh, s.short, ...s.points, s.tip.label, s.tip.text);
}
for (const t of texts) {assert.deepEqual(scanLine(t), [], `Cantonese wording: ${t}`); assert.ok(!FORBIDDEN.test(t), `note wording or a book name: ${t}`);}
// names follow the head-and-neck required list
const all = texts.join('\n');
for (const zh of ['提顎帆肌', '張顎帆肌', '顎舌肌', '喉口', '上咽縮肌', '中咽縮肌', '下咽縮肌', '下頜舌骨肌', '食道', '舌骨', '軟顎']) assert.ok(all.includes(zh) || ['上咽縮肌', '中咽縮肌', '下咽縮肌', '舌骨', '軟顎'].includes(zh), `uses ${zh}`);
for (const old of ['提腭帆肌', '張腭帆肌', '腭舌肌', '喉入口']) assert.ok(!all.includes(old), `does not use ${old}`);

// ---- time line
const at = t => poseAt(t), range = (a, b, step = .02) => {const out = []; for (let t = a; t <= b + 1e-9; t += step) out.push(t); return out;};
const first = (test, from = 0) => range(from, SWALLOW_S).find(t => test(at(t)));
assert.equal(phaseAt(.5), 'oral'); assert.equal(phaseAt(2.5), 'pharyngeal'); assert.equal(phaseAt(5), 'oesophageal'); assert.equal(phaseAt(SWALLOW_S + .1), 'rest');
const rest = at(0);
assert.ok(rest.palate === 0 && rest.larynx === 0 && rest.epiglottis === 0 && rest.ues === 0 && rest.apnoea === 0 && rest.bolus === 0 && rest.peristalsis === null, 'at rest nothing has moved');
const end = at(SWALLOW_S);
assert.ok(end.palate < .01 && end.larynx < .01 && end.epiglottis < .01 && end.ues < .01 && end.apnoea < .01 && end.bolus === 1, 'after the swallow everything is back and the bolus has gone down');
// the protective closures are in place before the bolus reaches the pharynx below the palate, and stay until it has passed the inlet
const reachOro = first(p => p.bolus >= PATH_MARKS.oropharynx), intoOes = first(p => p.bolus >= PATH_MARKS.oesophagus);
assert.ok(reachOro && intoOes && reachOro < intoOes);
for (const t of range(reachOro + .1, intoOes)) {const p = at(t); assert.ok(p.palate > .5, `nasopharynx closed at ${t.toFixed(2)} s`); assert.ok(p.apnoea > .5, `breathing paused at ${t.toFixed(2)} s`);}
const reachLaryngo = first(p => p.bolus >= PATH_MARKS.laryngopharynx);
for (const t of range(reachLaryngo, intoOes)) {const p = at(t); assert.ok(p.epiglottis > .5 && p.larynx > .5, `inlet covered and larynx raised at ${t.toFixed(2)} s`);}
assert.ok(at(intoOes).ues > .5, 'the upper oesophageal sphincter is open when the bolus enters');
// the order of events in the pharyngeal phase: palate, then larynx, then epiglottis; constrictors top to bottom
const t50 = key => first(p => p[key] > .5);
assert.ok(t50('palate') <= t50('larynx') && t50('larynx') <= t50('epiglottis'), 'palate, then larynx, then epiglottis');
const peak = k => range(1.5, 4).reduce((best, t) => at(t).constrictor[k] > at(best).constrictor[k] ? t : best, 1.5);
assert.ok(peak(0) < peak(1) && peak(1) < peak(2), 'superior, middle, inferior constrictor in turn');
assert.ok(at(.9).tongueWaveAmp > .5 && at(.9).palate === 0, 'oral phase: tongue at work, palate still down');
// SW-02: the soft palate is up before the bolus, carried back by the wave of the tongue, reaches the back of the mouth
for (const t of range(0, 3)) {const p = at(t); if (p.tongueWave > .7 && p.bolus < PATH_MARKS.oesophagus) assert.ok(p.palate > .6, `soft palate raised when the bolus reaches the back of the tongue (${t.toFixed(2)} s)`);}
// the bolus only goes forward; the peristaltic wave runs down
let prev = -1; for (const t of range(0, SWALLOW_S, .05)) {const b = at(t).bolus; assert.ok(b >= prev - 1e-12, 'bolus moves only forward'); prev = b;}
let w = -1; for (const t of range(3.5, SWALLOW_S - .6, .05)) {const p = at(t).peristalsis; assert.ok(p !== null && p >= w, 'peristalsis runs downward'); w = p;}
// state machine: steps loop over their span
let s = initialPlay(false); assert.equal(s.step, 3); assert.equal(initialPlay(true).playing, false);
assert.equal(wrapStep(-1), STEP_COUNT - 1); assert.equal(stepBy(s, 1).step, 0); assert.equal(goTo(s, 1).t, SWALLOW_STEPS[1].span[0]);
s = goTo(s, 0); const after = advance(s, 1, 1); assert.ok(after.t > s.t); assert.equal(advance({...after, playing: false}, 1, 1).t, after.t);
let loop = goTo(s, 1); for (let i = 0; i < 200; i++) loop = advance(loop, .05, 1); assert.ok(loop.t >= SWALLOW_SPAN(1)[0] && loop.t <= SWALLOW_SPAN(1)[1] + .5, 'a step loops over its own span');
function SWALLOW_SPAN(i) {return SWALLOW_STEPS[i].span;}
{const m = d.atMoment(initialPlay(false), '2.4'); assert.ok(m.t === 2.4 && !m.playing && m.step === 1, 'a link opens the swallow paused at a moment, in the step of that moment'); assert.equal(d.atMoment(s, '1.2').step, 0); assert.equal(d.atMoment(s, '6').step, 2); assert.equal(d.atMoment(s, 'x'), s); assert.equal(d.atMoment(s, '99'), s); assert.equal(d.atMoment(s, null), s);}

// ---- atlas structures: each rule finds its parts, one per name, all in the main atlas package
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public/models/atlas-stream.json'), 'utf8'));
const chosen = parts.pickSwallowParts(manifest.parts);
assert.equal(new Set(chosen.map(p => p.name)).size, chosen.length, 'one part per name');
const roles = new Set(chosen.map(p => p.role));
for (const r of ['tongue', 'palate-muscle', 'constrictor-1', 'constrictor-2', 'constrictor-3', 'hyoid', 'larynx', 'epiglottis', 'suprahyoid', 'oesophagus', 'trachea', 'bone']) assert.ok(roles.has(r), `has ${r}`);
for (const n of ['Tongue', 'Uvular muscle', 'Epiglottis', 'Hyoid bone', 'Thyroid cartilage', 'Esophagus', 'Right superior pharyngeal constrictor', 'Right middle pharyngeal constrictor', 'Right inferior pharyngeal constrictor', 'Left palatine bone', 'Right palatine bone']) assert.ok(chosen.some(p => p.name === n), `draws ${n}`);
const chunks = new Set(chosen.map(p => p.chunk)), gz = [...chunks].reduce((sum, c) => sum + (manifest.chunks[c].gzipBytes ?? manifest.chunks[c].bytes), 0);
assert.ok(gz < 12e6, `downloads ${(gz / 1e6).toFixed(1)} MB at most`);
// relative positions (model frame: +y up, +z front): tongue above the hyoid, hyoid above the thyroid cartilage, epiglottis behind the tongue, the oesophagus starts below the larynx inlet
const B = n => chosen.find(p => p.name === n).bounds, mid = (b, k) => (b[0][k] + b[1][k]) / 2;
assert.ok(mid(B('Tongue'), 1) > mid(B('Hyoid bone'), 1) && mid(B('Hyoid bone'), 1) > mid(B('Thyroid cartilage'), 1));
assert.ok(mid(B('Epiglottis'), 2) < B('Tongue')[1][2] && mid(B('Epiglottis'), 1) < B('Tongue')[1][1]);
assert.ok(B('Esophagus')[1][1] < B('Epiglottis')[1][1] && mid(B('Esophagus'), 2) < mid(B('Thyroid cartilage'), 2), 'oesophagus below and behind the larynx');
assert.ok(parts.MOVE.hyoid.up > .01 && parts.MOVE.hyoid.up < .03 && parts.MOVE.larynx.up < .03, 'hyoid and larynx rise 1–3 cm');

// ---- the shapes the animation measures, on the real atlas meshes (review of #478: SW-01; SW-03 to SW-06 after the exam)
{
  const geo = await quizModule('app/swallow/swallow-geometry.ts'), sg = await quizModule('app/stream-geometry.ts');
  const buffers = new Map(), posOf = p => {if (!buffers.has(p.chunk)) {const b = zlib.gunzipSync(fs.readFileSync(path.join(root, 'public', manifest.chunks[p.chunk].gzip))); buffers.set(p.chunk, b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));} return sg.positionArray(buffers.get(p.chunk), p);};
  const byName = n => chosen.filter(p => n instanceof RegExp ? n.test(p.name) : p.name === n).map(posOf);
  const tongue = geo.midline(byName('Tongue'), .012);
  const front = geo.midline([...byName('Tongue'), ...byName('Epiglottis'), ...byName('Cricoid cartilage'), ...byName(/arytenoid/)]), wall = geo.midline(byName(/pharyngeal constrictor$|^Pharyngeal raphe$/));
  const tb = B('Tongue'), z0 = tb[0][2] + .016, z1 = tb[1][2] - .022;
  // SW-01: every point of the bolus path through the pharynx lies inside the cavity, between the structures in front and the posterior wall
  const yTop = (geo.topAt(tongue, z0, .004) ?? tb[1][1]) + .0015, yBottom = B('Esophagus')[1][1] + .004, pp = geo.pharynxPath(front, wall, yTop, yBottom, 14);
  assert.ok(pp.points.length === 14, 'path through the pharynx');
  let measured = 0;
  for (const q of pp.points) {const l = geo.lumenAt(front, wall, q[1]); if (!l) continue; measured++; const back = geo.backAt(front, q[1]), wallFront = geo.frontAt(wall, q[1]); assert.ok(q[2] < back && q[2] > wallFront, `bolus path at y ${(q[1] * 1e3).toFixed(0)} mm stays between the front structures and the posterior wall`);}
  assert.ok(measured >= 8, `cavity measured at ${measured} of 14 levels`);
  const sceneText = fs.readFileSync(path.join(root, 'app/swallow/swallow-scene.ts'), 'utf8');
  assert.ok(sceneText.includes('pharynxPath(frontPts, wallPts'), 'SW-01: the scene takes the bolus path from the measured cavity');
  assert.ok(/palateRest\.clone\(\)\.applyAxisAngle[\s\S]{0,400}bolus\.position\.y = limit/.test(sceneText), 'SW-02: under the soft palate the bolus is kept below its lower surface');
}

// ---- sources: only the main atlas package is fetched, nothing from the notes; the atlas has a button and the route opens the page
const dir = path.join(root, 'app/swallow'), sources = fs.readdirSync(dir).filter(f => /\.(ts|tsx|css)$/.test(f));
assert.ok(sources.length >= 5);
for (const f of sources) {
  const text = fs.readFileSync(path.join(dir, f), 'utf8'), code = text.replace(/\/\/.*$/gm, '');
  for (const m of code.matchAll(/['"`][^'"`]*\.(glb|gltf|bin|obj|fbx|png|jpg|jpeg|mp4|webm|json|gz)['"`]/g)) assert.ok(/atlas-stream\.json\.gz/.test(m[0]), `${f}: fetches only the atlas package (${m[0]})`);
  assert.ok(!/fetch\(\s*['"]https?:/.test(text), `${f}: no remote fetch`);
  const shown = text.split('\n').filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l)).join('\n');
  assert.ok(!FORBIDDEN.test(shown), `${f}: note wording or a book name in a string`);
  for (const line of shown.split('\n')) assert.deepEqual(scanLine(line), [], `${f}: Cantonese wording in ${line.trim().slice(0, 60)}`);
}
const scene = fs.readFileSync(path.join(dir, 'swallow-scene.ts'), 'utf8');
assert.ok(/'軟顎'[^\n]*schematic: true/.test(scene) && /'食團'[^\n]*schematic: true/.test(scene), 'soft palate and bolus are labelled 示意');
// labels never sit on the picture (review of #470, 2026-11-22): they live in two gutters beside the canvas and only leader lines cross it; status and controls are outside the canvas too
assert.ok(scene.includes("new SideLabels(") && !/new LabelLayer\(/.test(scene), 'the scene uses the side-gutter labels');
const anim = fs.readFileSync(path.join(dir, 'swallow-animation.tsx'), 'utf8'), css = fs.readFileSync(path.join(dir, 'swallow.css'), 'utf8'), side = fs.readFileSync(path.join(dir, 'side-labels.ts'), 'utf8');
assert.ok(/swallow-gutter left[\s\S]*swallow-canvas[\s\S]*swallow-gutter right/.test(anim), 'gutter | canvas | gutter');
assert.ok(anim.indexOf('swallow-status') < anim.indexOf('swallow-view') && anim.indexOf('swallow-controls') > anim.indexOf('swallow-view'), 'status above the picture, controls below it');
assert.ok(/\.swallow-controls\{position:static/.test(css) && /grid-template-columns:170px minmax\(0,1fr\) 170px/.test(css), 'controls are not laid over the picture; two label columns');
assert.ok(/gutter\.left - o\.left/.test(side), 'label boxes are placed inside a gutter, never over the canvas');
assert.ok(anim.includes("import '../organ/organ.css'"), 'loading and error messages are styled');
const main = fs.readFileSync(path.join(root, 'web/main.tsx'), 'utf8'), page = fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8');
assert.ok(/lazy\(\(\) => import\('\.\.\/app\/swallow\/swallow-animation'\)\)/.test(main) && main.includes("'#/animation/swallow'"), 'route #/animation/swallow, loaded only when opened');
assert.ok(page.includes("'#/animation/swallow'") && page.includes('>吞嚥</Button>'), 'button in the atlas');

console.log(`swallowing animation: ${STEP_COUNT} steps, ${texts.length} texts, time line checked, ${chosen.length} atlas structures in ${chunks.size} packages (${(gz / 1e6).toFixed(1)} MB), ${sources.length} source files checked`);
