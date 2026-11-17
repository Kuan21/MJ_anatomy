// Hearing animation of the ear detail mode (app/ear-hearing/): the six steps and their text, the sliders and the pitch map, the state machine, the pulse timing, the centre-line
// maths on a synthetic cochlea, and the rules that keep the animation from downloading anything new. Pure functions only; no browser. Prints counts only.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
import {scanLine} from './lib/zh-rules.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));   // .pathname gives "/C:/…" on Windows
const data = await quizModule('app/ear-hearing/hearing-data.ts');
const geometry = await quizModule('app/ear-hearing/geometry-analysis.ts');
const {HEARING_STEPS, STEP_COUNT, HEARING_NOTE, PRESSURE_GAIN, FREQ_SLIDER, LOUD_SLIDER, SPEED_SLIDER, sliderToHz, formatHz, basePosition, hzAt, waveEnvelope, waveValue, initialPlay, goTo, stepBy, wrapStep, advance, AUTO_DWELL_S, PULSE_LEGS, PULSE_CYCLE_S, PULSE_LEG_S, pulseAt} = data;

// ---- six steps, in the agreed order, each with key points and an exam tip
assert.equal(STEP_COUNT, 6);
assert.deepEqual(HEARING_STEPS.map(s => s.id), ['outer', 'middle', 'wave', 'corti', 'synapse', 'pathway']);
assert.deepEqual(HEARING_STEPS.map(s => s.en), ['Outer ear', 'Middle ear', 'Cochlea · traveling wave', 'Organ of Corti', 'Synapse → action potential', 'Auditory pathway']);
const CJK = /[㐀-鿿]/, FORBIDDEN = /[0-9]{4} ?p\.[0-9]|共筆|筆記|跑考|課堂|講義|Course notes|cmu-course|neuro-notes|M65×CM57|出處|CMU|中國醫藥大學|課件|上課|下圖|上圖|圖中|老師|考古|Netter|Moore|Gray|Guyton|Kandel|Sobotta|Snell/;
const texts = [HEARING_NOTE, ...PRESSURE_GAIN.lines, PRESSURE_GAIN.zh, PRESSURE_GAIN.en];
for (const s of HEARING_STEPS) {
  assert.ok(s.en.trim() && CJK.test(s.zh) && CJK.test(s.short), `${s.id}: English title above, Chinese title below`);
  assert.ok(!CJK.test(s.en), `${s.id}: the English title holds no Chinese`);
  assert.ok(s.points.length >= 3 && s.points.every(p => p.length > 15 && CJK.test(p)), `${s.id}: at least three key points in Chinese`);
  assert.ok(CJK.test(s.tip.label) && s.tip.text.length > 15, `${s.id}: exam tip`);
  texts.push(s.en, s.zh, s.short, ...s.points, s.tip.label, s.tip.text);
}
for (const t of texts) {
  assert.deepEqual(scanLine(t), [], `Cantonese wording: ${t}`);
  assert.ok(!FORBIDDEN.test(t), `note wording or a book name: ${t}`);
}
assert.ok(PRESSURE_GAIN.lines.join('').includes('×17') && PRESSURE_GAIN.lines.join('').includes('×1.3') && PRESSURE_GAIN.lines.join('').includes('×22'), 'pressure gain card: ×17, ×1.3, about ×22');
assert.equal(new Set(HEARING_STEPS.flatMap(x => x.points)).size, HEARING_STEPS.flatMap(x => x.points).length, 'no key point repeated');

// ---- sliders: 20 Hz – 20 kHz on a log scale, loudness and speed ranges as in the agreed prototype
assert.ok(Math.abs(sliderToHz(FREQ_SLIDER.min) - 20) < .05 && Math.abs(sliderToHz(FREQ_SLIDER.max) - 20000) < 20);
assert.ok(FREQ_SLIDER.initial > FREQ_SLIDER.min && FREQ_SLIDER.initial < FREQ_SLIDER.max && Math.abs(sliderToHz(3) - 1000) < 1e-6);
assert.deepEqual([LOUD_SLIDER.min, LOUD_SLIDER.max, SPEED_SLIDER.min, SPEED_SLIDER.max], [.15, 1, .2, 1.2]);
assert.equal(formatHz(125), '125 Hz'); assert.equal(formatHz(1000), '1.0 kHz'); assert.equal(formatHz(20000), '20 kHz');
// pitch map: 20 kHz at the base (0), 20 Hz at the apex (1), strictly decreasing with frequency, equal steps per octave
assert.ok(Math.abs(basePosition(20000)) < 1e-9 && Math.abs(basePosition(20) - 1) < 1e-9);
assert.equal(basePosition(1e6), 0); assert.equal(basePosition(1), 1);
let previous = -1;
for (let hz = 20000; hz >= 20; hz /= 1.25) {const u = basePosition(hz); assert.ok(u > previous, 'low frequencies lie nearer the apex'); previous = u;}
assert.ok(Math.abs((basePosition(1000) - basePosition(2000)) - (basePosition(2000) - basePosition(4000))) < 1e-9, 'one octave is one step');
for (const hz of [20, 125, 1000, 8000, 20000]) assert.ok(Math.abs(hzAt(basePosition(hz)) - hz) / hz < 1e-9, 'hzAt inverts basePosition');
assert.ok(basePosition(8000) < basePosition(500), 'a high note peaks nearer the base than a low note');

// ---- traveling wave: the largest swing is at the peak, a high note moves the peak toward the base, louder is bigger, and the wave runs from base to apex
const best = peak => {let bu = 0, bv = -1; for (let i = 0; i <= 200; i++) {const u = i / 200, v = waveEnvelope(u, peak); if (v > bv) {bv = v; bu = u;}} return bu;};
for (const peak of [.1, .4, .8]) assert.ok(Math.abs(best(peak) - peak) < .01, `envelope peaks at ${peak}`);
assert.ok(waveEnvelope(.95, .3) < .01 && waveEnvelope(0, .5) > .05, 'nothing beyond the peak, a small swing before it');
assert.ok(best(basePosition(8000)) < best(basePosition(500)));
const swing = (u, peak, loud) => {let m = 0; for (let k = 0; k < 40; k++) m = Math.max(m, Math.abs(waveValue(u, peak, k / 40 / data.WAVE_HZ, loud))); return m;};
assert.ok(swing(.5, .5, 1) > swing(.5, .5, .3) * 3, 'louder is bigger');
// at the peak position the zero crossing moves toward the apex with time (a wave that travels apex-ward)
{const zero = t => {for (let i = 0; i < 400; i++) {const u = i / 400; if (waveValue(u, .9, t, 1) > 0 && waveValue(u + .0025, .9, t, 1) <= 0) return u;} return null;};
 const a = zero(.001), b = zero(.05); assert.ok(a !== null && b !== null && b > a, 'the crest runs from the base toward the apex');}

// ---- state machine
let s = initialPlay(false);
assert.deepEqual([s.step, s.playing, s.auto, s.t, s.dwell], [0, true, false, 0, 0]);
assert.equal(initialPlay(true).playing, false, 'reduced motion starts paused');
assert.equal(wrapStep(-1), 5); assert.equal(wrapStep(6), 0); assert.equal(stepBy(s, -1).step, 5); assert.equal(stepBy({...s, step: 5}, 1).step, 0); assert.equal(goTo(s, 3).step, 3);
assert.equal(goTo({...s, dwell: 9, t: 2}, 2).dwell, 0, 'a step change restarts the dwell clock and keeps the animation clock');
assert.equal(goTo({...s, t: 2}, 2).t, 2);
s = advance(s, .5, .6); assert.ok(Math.abs(s.t - .3) < 1e-9 && Math.abs(s.dwell - .5) < 1e-9, 'the speed slider scales the clock, not the dwell time');
assert.equal(advance({...s, playing: false}, 1, 1).t, s.t, 'paused stays still');
assert.equal(advance({...s, dwell: AUTO_DWELL_S - .1}, .5, 1).step, 0, 'no auto switch while "auto" is off');
const auto = advance({...s, auto: true, dwell: AUTO_DWELL_S - .1}, .5, 1);
assert.equal(auto.step, 1); assert.equal(auto.dwell, 0);
assert.equal(advance({...s, auto: true, step: 5, dwell: AUTO_DWELL_S}, .5, 1).step, 0, 'auto continues from the last step to the first');

// ---- the pulse of step 6: nine legs, in order, two sides leave each station together
assert.equal(PULSE_LEGS.length, 9);
assert.deepEqual(PULSE_LEGS.map(l => l.t0), [0, .9, .9, 1.8, 1.8, 2.6, 2.6, 3.3, 3.3]);
assert.ok(PULSE_LEGS.every(l => l.t0 + PULSE_LEG_S <= PULSE_CYCLE_S), 'every leg ends inside one cycle');
const near = (a, b) => Math.abs(a - b) < 1e-9; assert.ok(near(pulseAt(.4, 0), .5)); assert.ok(near(pulseAt(PULSE_CYCLE_S + .4, 0), .5), 'the cycle repeats'); assert.equal(pulseAt(1, 1.8), null); assert.ok(pulseAt(PULSE_CYCLE_S - .01, 3.3) === null);
assert.equal(new Set(PULSE_LEGS.map(l => l.id)).size, 9);

// ---- centre line of a cochlea-like tube (a conical spiral of 2.5 turns), start end chosen by `near`
{
  const turns = 2.5, rings = 220, sides = 12, pos = [], idx = [], rad = u => .0045 * (1 - .75 * u), tube = .0006 * 1;
  const centre = u => [rad(u) * Math.cos(turns * 2 * Math.PI * u), .002 * u, rad(u) * Math.sin(turns * 2 * Math.PI * u)];
  for (let i = 0; i <= rings; i++) {
    const u = i / rings, c = centre(u), d = centre(Math.min(1, u + 1e-4)), e = centre(Math.max(0, u - 1e-4));
    const t = [d[0] - e[0], d[1] - e[1], d[2] - e[2]], l = Math.hypot(...t), tn = t.map(x => x / l);
    const side = [tn[1] * 0 - tn[2] * 1, 0, tn[0] * 1], sl = Math.hypot(...side), sn = side.map(x => x / sl), up = [sn[1] * tn[2] - sn[2] * tn[1], sn[2] * tn[0] - sn[0] * tn[2], sn[0] * tn[1] - sn[1] * tn[0]];
    for (let j = 0; j < sides; j++) {const a = j / sides * 2 * Math.PI; pos.push(c[0] + tube * (Math.cos(a) * sn[0] + Math.sin(a) * up[0]), c[1] + tube * (Math.cos(a) * sn[1] + Math.sin(a) * up[1]), c[2] + tube * (Math.cos(a) * sn[2] + Math.sin(a) * up[2]));}
  }
  for (let i = 0; i < rings; i++) for (let j = 0; j < sides; j++) {const a = i * sides + j, b = i * sides + (j + 1) % sides, c = (i + 1) * sides + j, d = (i + 1) * sides + (j + 1) % sides; idx.push(a, b, c, b, d, c);}
  const positions = Float32Array.from(pos), indices = Uint32Array.from(idx);
  const line = geometry.tubeCentreline(positions, indices, centre(0), 48);
  assert.equal(line.points.length, 48);
  const close = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  // every point lies on the spiral's axis curve, and the points run along it in order from the near end
  const samples = Array.from({length: 4001}, (_, i) => centre(i / 4000)), nearest = p => {let bi = 0, bd = Infinity; samples.forEach((q, i) => {const d = close(p, q); if (d < bd) {bd = d; bi = i;}}); return [bi / 4000, bd];};
  const found = line.points.map(nearest);
  assert.ok(found.every(([, d]) => d < .0007), 'the centre line stays on the spiral');
  assert.ok(found.every(([u], i) => i === 0 || u >= found[i - 1][0] - 1e-9) && found[1][0] < .08 && found[46][0] > .9, 'the centre line runs from the near end to the far end');
  const flipped = geometry.tubeCentreline(positions, indices, centre(1), 48), back = flipped.points.map(nearest);
  assert.ok(back[1][0] > .9 && back[46][0] < .08, 'the start end is the one nearer to `near`');
  assert.ok(line.u[0] < .06 && line.u[(rings + 1) * sides - 1] > .94 && line.u.every((u, i) => i === 0 || u >= 0 && u <= 1.0001), 'each vertex gets its share along the tube');
  assert.ok(geometry.pointAlong(line.points, 0).every((v, i) => v === line.points[0][i]) && geometry.pointAlong(line.points, 1).every((v, i) => v === line.points[47][i]));
  const axes = geometry.principalAxes(Float32Array.from(line.points.flat()));
  assert.ok(Math.abs(axes.axes[2][1]) > .9, 'the axis of the spiral (shortest direction) is the height axis');
  const cylinder = []; for (let i = 0; i < 60; i++) cylinder.push(i * .0002, 0, 0, i * .0002, .0003, .0003);
  const along = geometry.longAxis(Float32Array.from(cylinder), [1, 0, 0]); assert.ok(along[0] > .99, 'long axis points toward the given side');
}

// ---- nothing new is downloaded, nothing from the notes: scan the animation's source
const dir = path.join(root, 'app/ear-hearing');
const sources = fs.readdirSync(dir).filter(f => /\.(ts|tsx|css)$/.test(f));
assert.ok(sources.length >= 8, 'animation source files');
const allowedFetch = new Set(['models/ear/ear-atlas.json']);
for (const f of sources) {
  const text = fs.readFileSync(path.join(dir, f), 'utf8');
  assert.ok(!/\.(glb|gltf|bin|obj|fbx|png|jpg|jpeg|mp4|webm)['"`]/.test(text.replace(/\/\/.*$/gm, '')), `${f}: no new model, image or video files`);
  for (const m of text.matchAll(/fetch\(`?\$\{base\}([^`'")$]+)/g)) assert.ok(allowedFetch.has(m[1]), `${f}: fetches ${m[1]}`);
  assert.ok(!/fetch\(\s*['"]https?:/.test(text), `${f}: no remote fetch`);
  const shown = text.split('\n').filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l)).join('\n');
  assert.ok(!FORBIDDEN.test(shown), `${f}: note wording or a book name in a string`);
  for (const line of shown.split('\n')) assert.deepEqual(scanLine(line), [], `${f}: Cantonese wording in ${line.trim().slice(0, 60)}`);
}
const earModel = fs.readFileSync(path.join(dir, 'ear-geometry.ts'), 'utf8');
assert.ok(earModel.includes('models/ear/ear-atlas.json') && earModel.includes('atlas.gzip'), 'the ear is read from the detail mode\'s own package file');
const brainScene = fs.readFileSync(path.join(dir, 'hearing-brain-scene.ts'), 'utf8');
assert.ok(brainScene.includes("from '../organ/brain-viewer'") && !/GLTFLoader/.test(brainScene), 'the brain is the detail mode\'s own viewer, not a second loader');
// the entry in the ear detail mode: a button in the right column, loaded only when opened
const detail = fs.readFileSync(path.join(root, 'app/ear-detail.tsx'), 'utf8');
assert.ok(/lazy\(\(\) => import\('\.\/ear-hearing\/hearing-animation'\)\)/.test(detail) && detail.includes('聽覺傳導動畫') && detail.includes('overlayOpen={hearing}'), 'ear detail mode opens the animation');
// the stations the brain model lacks are marked 示意 on the labels
const labelText = fs.readFileSync(path.join(dir, 'label-layer.ts'), 'utf8');
assert.ok(labelText.includes('〔示意〕'), 'schematic labels are marked');
for (const zh of ['耳蝸核', '上橄欖核', '斜方體', '外側丘系']) assert.ok(new RegExp(`'${zh}[^']*'[^\\n]*schematic: true`).test(brainScene), `${zh} is a schematic label`);

console.log(`ear hearing animation: ${STEP_COUNT} steps, ${texts.length} texts, pitch map, wave, state machine, pulse, centre line, ${sources.length} source files checked`);
