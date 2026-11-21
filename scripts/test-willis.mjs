// Circle of Willis animation of the brain detail mode (app/willis/): the four steps and their text, the flow network (conservation, the normal pattern, what each block does),
// the territories of the brain surfaces, the paths along the real artery meshes of public/models/brain.glb, and the rules that keep the animation from downloading anything new.
// No browser. Prints counts only.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
import {scanLine} from './lib/zh-rules.mjs';
import {loadBrainArteries} from './lib/brain-artery-source.mjs';

const root = new URL('../', import.meta.url).pathname;
const d = await quizModule('app/willis/willis-data.ts');
const {buildWillisPaths} = await quizModule('app/willis/willis-paths.ts');
const {WILLIS_STEPS, STEP_COUNT, WILLIS_NOTE, SEGMENTS, SOURCES, SINKS, TERRITORIES, BLOCK_CHOICES, solveFlow, perfusionLevel, reversedSegments, territoryOf, dotPosition, dotCount, NORMAL_MAX_FLOW} = d;

// ---- four steps in order, English title above, Chinese below, key points and an exam tip
assert.equal(STEP_COUNT, 4);
assert.deepEqual(WILLIS_STEPS.map(s => s.id), ['inflow', 'circle', 'branches', 'block']);
const CJK = /[㐀-鿿]/, FORBIDDEN = /[0-9]{4} ?p\.[0-9]|共筆|筆記|跑考|課堂|講義|Course notes|cmu-course|neuro-notes|M65×CM57|出處|CMU|中國醫藥大學|課件|上課|下圖|上圖|圖中|老師|考古|Netter|Moore|Gray|Guyton|Kandel|Sobotta|Snell/;
const texts = [WILLIS_NOTE];
for (const s of WILLIS_STEPS) {
  assert.ok(s.en.trim() && !CJK.test(s.en) && CJK.test(s.zh) && CJK.test(s.short), `${s.id}: titles`);
  assert.ok(s.points.length >= 3 && s.points.every(p => p.length > 15 && CJK.test(p)), `${s.id}: at least three key points`);
  assert.ok(CJK.test(s.tip.label) && s.tip.text.length > 15, `${s.id}: exam tip`);
  texts.push(s.en, s.zh, s.short, ...s.points, s.tip.label, s.tip.text);
}
for (const c of BLOCK_CHOICES) texts.push(c.en, c.zh, c.result);
for (const t of TERRITORIES) texts.push(t.en, t.zh);
for (const s of SEGMENTS) texts.push(s.en, s.zh);
for (const t of texts) {
  assert.deepEqual(scanLine(t), [], `Cantonese wording: ${t}`);
  assert.ok(!FORBIDDEN.test(t), `note wording or a book name: ${t}`);
}
// names follow the required list of the head and neck (中大腦動脈, 後大腦動脈, 前交通支, 後交通支, 內頸動脈)
const allText = texts.join('\n');
for (const zh of ['內頸動脈', '椎動脈', '基底動脈', '前大腦動脈', '中大腦動脈', '後大腦動脈', '前交通支', '後交通支']) assert.ok(allText.includes(zh), `uses ${zh}`);
for (const old of ['大腦中動脈', '大腦後動脈', '大腦前動脈', '頸內動脈', '前交通動脈', '後交通動脈']) assert.ok(!allText.includes(old), `does not use ${old}`);

// ---- the network: Kirchhoff holds, the normal pattern is symmetric with almost no flow in the communicating arteries
const normal = solveFlow();
const nodes = [...new Set(SEGMENTS.flatMap(s => [s.from, s.to]))];
const net = (r, n) => SEGMENTS.reduce((sum, s) => sum + (s.to === n ? r.flow[s.id] : 0) - (s.from === n ? r.flow[s.id] : 0), 0);
for (const r of [normal, solveFlow({blocked: 'ica-l'}), solveFlow({blocked: 'ba-1', thinPcom: true})]) {
  for (const n of nodes) if (!SOURCES.includes(n) && !SINKS.includes(n)) assert.ok(Math.abs(net(r, n)) < 1e-9, `flow is conserved at ${n}`);
  const inflow = SOURCES.reduce((s, n) => s - net(r, n), 0), outflow = SINKS.reduce((s, n) => s + net(r, n), 0);
  assert.ok(Math.abs(inflow - outflow) < 1e-9, 'what enters leaves through the territories');
}
for (const t of TERRITORIES) assert.ok(Math.abs(normal.perfusion[t.id] - 1) < 1e-12, `normal perfusion of ${t.id} is 100%`);
assert.ok(Math.abs(normal.flow.acom) < 1e-9, 'no flow across the anterior communicating artery when both sides are equal');
assert.ok(Math.abs(normal.flow['pcom-l']) < .3 * NORMAL_MAX_FLOW, 'little flow in the posterior communicating arteries');
assert.ok(normal.flow['ica-l'] > normal.flow['va-l'] * 2, 'the carotids carry more than the vertebrals');
assert.ok(Math.abs(normal.flow['mca-l']) === Math.max(...['mca-l', 'a2-l', 'p2-l'].map(id => Math.abs(normal.flow[id]))), 'the middle cerebral artery is the largest branch');
assert.deepEqual(reversedSegments(normal), []);

// ---- every block: the result the text describes
const level = (o, t) => perfusionLevel(solveFlow(o).perfusion[t]);
const ica = solveFlow({blocked: 'ica-l'});
assert.ok(ica.flow.acom < 0 && ica.flow['pcom-l'] < 0 && ica.flow['a1-l'] < 0, 'left carotid blocked: the ACoA flows to the left, the left PCoA forward, the left A1 back to the carotid end');
assert.deepEqual(reversedSegments(ica).sort(), ['a1-l', 'acom', 'pcom-l']);
assert.equal(level({blocked: 'ica-l'}, 'mca-l'), 'low', 'complete circle: the left MCA territory is short but not ischaemic');
assert.equal(level({blocked: 'ica-l', thinPcom: true}, 'mca-l'), 'ischaemia', 'thin PCoAs: the left MCA territory is ischaemic');
assert.equal(level({blocked: 'ica-l'}, 'mca-r'), 'ok');
assert.equal(level({blocked: 'ica-r'}, 'mca-r'), 'low');
for (const v of ['va-l', 'va-r']) for (const t of TERRITORIES) assert.equal(level({blocked: v}, t.id), 'ok', `one vertebral artery is enough (${t.id})`);
assert.notEqual(level({blocked: 'ba-1'}, 'pf'), 'ok', 'basilar blocked: brainstem and cerebellum are short');
assert.ok(solveFlow({blocked: 'ba-1'}).flow['ba-2'] < 0, 'basilar blocked: the upper basilar fills backwards from the PCoAs');
assert.equal(level({blocked: 'ba-1', thinPcom: true}, 'pf'), 'ischaemia');
assert.equal(level({blocked: 'ba-1', thinPcom: true}, 'pca-l'), 'ischaemia');
for (const [b, t] of [['mca-l', 'mca-l'], ['mca-r', 'mca-r'], ['a2-l', 'aca-l'], ['p2-l', 'pca-l']]) {
  assert.ok(solveFlow({blocked: b}).perfusion[t] < .01, `${b} blocked beyond the circle: no flow into ${t}`);
  assert.equal(level({blocked: b}, t), 'ischaemia');
}
assert.ok(solveFlow({blocked: 'a1-l'}).flow.acom < 0 && level({blocked: 'a1-l'}, 'aca-l') !== 'ischaemia', 'left A1 blocked: the ACoA fills the left A2');
assert.equal(level({blocked: 'p1-l'}, 'pca-l'), 'ok', 'left P1 blocked: the left PCoA fills the left P2');
assert.equal(level({blocked: 'p1-l', thinPcom: true}, 'pca-l'), 'ischaemia');
for (const c of BLOCK_CHOICES) {
  assert.ok(SEGMENTS.some(s => s.id === c.id), `${c.id} is a segment`);
  const r = solveFlow({blocked: c.id}), worst = TERRITORIES.map(t => perfusionLevel(r.perfusion[t.id]));
  assert.equal(c.result.includes('缺血'), worst.includes('ischaemia') || c.id === 'ba-1', `${c.id}: the text says 缺血 exactly when a territory is ischaemic (or would be with thin PCoAs)`);
}
assert.equal(new Set(BLOCK_CHOICES.map(c => c.id)).size, BLOCK_CHOICES.length);

// ---- dots: direction follows the sign of the flow, more flow gives more dots, no dots without flow
assert.equal(dotCount(0, .03), 0);
assert.ok(dotCount(NORMAL_MAX_FLOW, .03) > dotCount(.2 * NORMAL_MAX_FLOW, .03));
assert.ok(dotPosition(0, 4, .2, 1, .03) > dotPosition(0, 4, .1, 1, .03), 'forward flow moves toward the end');
assert.ok(dotPosition(0, 4, .2, -1, .03) < dotPosition(0, 4, .1, -1, .03), 'reversed flow moves toward the start');
for (let k = 0; k < 9; k++) {const u = dotPosition(k, 9, 3.7, .4, .05); assert.ok(u >= 0 && u <= 1);}

// ---- territories of the brain surfaces (whole gyri)
const T = (label, group, side = 'left') => territoryOf(label, group, side);
assert.equal(T('Superior frontal gyrus', 'frontal'), 'aca-l'); assert.equal(T('Paracentral gyrus and sulcus', 'frontal', 'right'), 'aca-r'); assert.equal(T('Precuneus', 'parietal'), 'aca-l');
assert.equal(T('Precentral gyrus', 'frontal'), 'mca-l'); assert.equal(T('Angular gyrus', 'parietal'), 'mca-l'); assert.equal(T('Insula (Subcentral gyrus and ant. and post. sulci)', 'insula'), 'mca-l'); assert.equal(T('Superior temporal gyrus (Lateral part)', 'temporal'), 'mca-l');
assert.equal(T('Cuneus', 'occipital'), 'pca-l'); assert.equal(T('Lingual gyrus', 'occipital', 'right'), 'pca-r'); assert.equal(T('Medial occipitotemporal gyrus (Parahippocampal)', 'temporal'), 'pca-l'); assert.equal(T('Hippocampus', 'limbic'), 'pca-l');
assert.equal(T('Pons', 'brainstem', 'median'), 'pf'); assert.equal(T('Culmen', 'cerebellum', 'median'), 'pf'); assert.equal(T('Putamen', 'basal'), null);

// ---- paths along the arteries of the brain model
const arteries = await loadBrainArteries();
const lookup = (re, side) => {const r = arteries.find(a => re.test(a.label) && a.side === side); return r ? {positions: r.positions, index: r.index} : null;};
const P = buildWillisPaths(lookup);
assert.deepEqual(P.missing, [], 'every artery of the network is in the model');
const len = c => c.reduce((s, p, i) => i ? s + Math.hypot(p[0] - c[i - 1][0], p[1] - c[i - 1][1], p[2] - c[i - 1][2]) : 0, 0);
const same = (a, b, tol = 1e-9) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) <= tol;
const first = id => P.curves[id][0][0], last = id => {const c = P.curves[id][0]; return c[c.length - 1];};
for (const s of SEGMENTS) assert.ok(P.curves[s.id]?.length >= 1 && P.curves[s.id].every(c => c.length >= 2), `${s.id}: has a path`);
// the network is connected end to end
for (const side of ['l', 'r']) {
  assert.ok(same(first(`a1-${side}`), last(`ica-${side}`)) && same(first(`pcom-${side}`), last(`ica-${side}`)) && same(first(`mca-${side}`), last(`ica-${side}`)), `${side}: A1, PCoA and MCA leave the carotid end`);
  assert.ok(same(first(`a2-${side}`), last(`a1-${side}`)), `${side}: A2 continues A1`);
  assert.ok(same(last(`p1-${side}`), last(`pcom-${side}`)) && same(first(`p2-${side}`), last(`p1-${side}`)), `${side}: P1 and the PCoA meet where P2 starts`);
  assert.ok(same(first(`p1-${side}`), last('ba-2')), `${side}: P1 leaves the top of the basilar artery`);
  assert.ok(same(last(`va-${side}`), first('ba-1')), `${side}: the vertebral artery joins the basilar artery`);
}
assert.ok(same(first('acom'), last('a1-l')) && same(last('acom'), last('a1-r')), 'the ACoA joins the two A1 ends');
assert.ok(same(last('ba-1'), first('ba-2')));
// each path runs inside its own artery: every point lies within 2.5 mm of that mesh
const nearestDist = (m, p) => {let b = Infinity; for (let i = 0; i < m.positions.length; i += 3) b = Math.min(b, Math.hypot(m.positions[i] - p[0], m.positions[i + 1] - p[1], m.positions[i + 2] - p[2])); return b;};
const OWN = {ica: /^Internal carotid artery$/, va: /^Vertebral artery$/, a1: /^Anterior cerebral artery$/, a2: /^Anterior cerebral artery$/, pcom: /^Posterior communicating artery$/, p1: /^Posterior cerebral artery$/, p2: /^Posterior cerebral artery$/};
for (const side of ['l', 'r']) for (const [k, re] of Object.entries(OWN)) {
  const c = P.curves[`${k}-${side}`][0], m = lookup(re, side === 'l' ? 'left' : 'right');
  const inner = k === 'va' ? c.slice(0, -1) : k === 'a1' || k === 'pcom' || k === 'p1' ? c.slice(1, -1) : c.slice(1);
  const worst = Math.max(...inner.map(p => nearestDist(m, p)));
  assert.ok(worst < .0025, `${k}-${side}: path stays on its artery (worst ${(worst * 1e3).toFixed(1)} mm)`);
  assert.ok(c.slice(1, -1).every(p => side === 'l' ? p[0] > -.002 : p[0] < .002), `${k}-${side}: path stays on its own side`);
}
for (const id of ['ba-1', 'ba-2', 'acom']) {const m = lookup(id === 'acom' ? /^Anterior communicating artery$/ : /^Basilar artery$/, 'median'); assert.ok(Math.max(...P.curves[id][0].map(p => nearestDist(m, p))) < .0025, `${id}: on its artery`);}
// lengths in a plausible range (mm): the intracranial carotid with its siphon, a short ACoA, the PCoA, the basilar artery
const mm = id => len(P.curves[id][0]) * 1e3;
assert.ok(mm('ica-l') > 90 && mm('ica-l') < 200, `ICA ${mm('ica-l').toFixed(0)} mm`);
assert.ok(mm('acom') > 2 && mm('acom') < 12, `ACoA ${mm('acom').toFixed(1)} mm`);
assert.ok(mm('pcom-l') > 8 && mm('pcom-l') < 25, `PCoA ${mm('pcom-l').toFixed(1)} mm`);
assert.ok(mm('ba-1') + mm('ba-2') > 18 && mm('ba-1') + mm('ba-2') < 40, `basilar ${(mm('ba-1') + mm('ba-2')).toFixed(1)} mm`);
// anatomy of the junctions: the ACoA lies in front of the PCoA ends and the basilar top; the carotid ends lateral to the ACoA
assert.ok(P.points.acomEnd.l[2] > P.points.pcomBack.l[2] + .008 && P.points.acomEnd.l[2] > P.points.baTop[2] + .008, 'the ACoA is the front of the circle');
assert.ok(P.points.icaTop.l[0] > P.points.acomEnd.l[0] + .004 && P.points.icaTop.r[0] < P.points.acomEnd.r[0] - .004, 'the carotid ends lie lateral to the ACoA');
assert.ok(P.points.baLow[1] < P.points.baTop[1] - .015, 'the basilar artery runs upward');
assert.ok(P.curves['pf-branches'].length === 4, 'superior and anterior inferior cerebellar arteries, both sides');

// ---- sources: no new files are fetched, nothing from the notes, entry in the brain detail mode
const dir = path.join(root, 'app/willis'), sources = fs.readdirSync(dir).filter(f => /\.(ts|tsx|css)$/.test(f));
assert.ok(sources.length >= 6, 'animation source files');
for (const f of sources) {
  const text = fs.readFileSync(path.join(dir, f), 'utf8'), code = text.replace(/\/\/.*$/gm, '');
  for (const m of code.matchAll(/['"`][^'"`]*\.(glb|gltf|bin|obj|fbx|png|jpg|jpeg|mp4|webm|json)['"`]/g)) assert.ok(/models\/brain\.glb/.test(m[0]), `${f}: loads only the brain model (${m[0]})`);
  assert.ok(!/fetch\(\s*['"]https?:/.test(text), `${f}: no remote fetch`);
  const shown = text.split('\n').filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l)).join('\n');
  assert.ok(!FORBIDDEN.test(shown), `${f}: note wording or a book name in a string`);
  for (const line of shown.split('\n')) assert.deepEqual(scanLine(line), [], `${f}: Cantonese wording in ${line.trim().slice(0, 60)}`);
}
const brain = fs.readFileSync(path.join(root, 'app/organ/brain.tsx'), 'utf8');
assert.ok(/lazy\(\(\) => import\('\.\.\/willis\/willis-animation'\)\)/.test(brain) && brain.includes('Willis 環血流') && brain.includes('overlayOpen={csf || willis}'), 'the brain detail mode opens the animation, loaded only when opened');

console.log(`circle of Willis animation: ${STEP_COUNT} steps, ${SEGMENTS.length} segments, ${BLOCK_CHOICES.length} blocks, ${texts.length} texts, paths on ${arteries.length} artery meshes, ${sources.length} source files checked`);
