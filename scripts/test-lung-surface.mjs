// Lung surface view: colours of the grooves on the model, medial-view button, impressing structures, data-card colours and links, left hilum in the middle of the mediastinal face.
// Output is pass/fail and counts only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {quizModule} from './quiz-modules.mjs';
import {loadWorld} from './lib/paokao-world.mjs';
import {makeUtil} from './lib/paokao-util.mjs';

const text = f => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const page = text('app/page.tsx'), scene = text('app/scene.tsx'), css = text('app/globals.css'), info = text('app/mj-structure-info.ts');
const links = JSON.parse(text('app/mj-lung-links.json')), cards = Object.values(JSON.parse(text('app/mj-paokao.json'))).filter(c => c.lung);
const atlas = JSON.parse(fs.readFileSync(new URL('../public/models/atlas.json', import.meta.url), 'utf8'));
const {LUNG_CATEGORIES, lungCategoryOf} = await quizModule('app/mj-lung-categories.ts');
const {lungImpressors, lungContextIds, lungLinkTarget, LUNG_LABELS} = await quizModule('app/mj-lung-labels.ts');
const {surfaceEdgeDepth} = await quizModule('app/mj-surface-edge.ts');

// 1. border fade of a patch: on a strip of a mark (4 x 4 vertices, 1 mm apart) the border vertices are 1; a crack (two triangles that do not share their vertices although the surface goes on) is not a border
{
  const {surfaceBorderFade} = await quizModule('app/mj-surface-edge.ts'), n = 5, pos = [], idx = [], at = (x, y) => y * n + x;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) pos.push(x * .001, y * .001, 0);
  for (let y = 0; y < n - 1; y++) for (let x = 0; x < n - 1; x++) idx.push(at(x, y), at(x + 1, y), at(x + 1, y + 1), at(x, y), at(x + 1, y + 1), at(x, y + 1));
  const d = surfaceBorderFade(idx, pos, .0025);
  assert.equal(d[at(0, 0)], 1); assert.equal(d[at(4, 2)], 1); assert.ok(Math.abs(d[at(2, 2)] - 0.2) < 1e-6, 'two millimetres from the border: 1 - 2/2.5');
  // the same area made of two halves that do not share the vertices of the line where they meet (a crack): that line is not a border
  const pos2 = [], idx2 = [];
  for (const x0 of [0, 2]) { const base = pos2.length / 3; for (let y = 0; y < n; y++) for (let x = 0; x < 3; x++) pos2.push((x0 + x) * .001, y * .001, 0); for (let y = 0; y < n - 1; y++) for (let x = 0; x < 2; x++) { const a = base + y * 3 + x; idx2.push(a, a + 1, a + 4, a, a + 4, a + 3); } }
  const cracked = surfaceBorderFade(idx2, pos2, .0025);
  assert.ok(Math.abs(cracked[2 * 3 + 2] - 0.2) < 1e-6, 'a vertex on the crack, 2 mm from the outline, is 0.2 and not 1');
  // normals on both sides of a crack are the same after averaging by place, even when the two halves came with different ones
  {
    const {smoothNormalsByPlace} = await quizModule('app/mj-surface-edge.ts'), orig = pos2.map((_, i) => i % 3 === 2 ? 1 : 0), sm = smoothNormalsByPlace(idx2, pos2, orig), a = 2 * 3 + 2, b = 15 + 2 * 3;
    assert.ok(Math.hypot(sm[a * 3] - sm[b * 3], sm[a * 3 + 1] - sm[b * 3 + 1], sm[a * 3 + 2] - sm[b * 3 + 2]) < 1e-6 && sm[a * 3 + 2] > .99, 'smooth normals across a crack');
  }
  const closed = surfaceBorderFade([0, 1, 2, 0, 2, 3, 0, 3, 1, 1, 3, 2], [0, 0, 0, .001, 0, 0, 0, .001, 0, 0, 0, .001], .0025);   // closed tetrahedron: no border at all
  assert.ok(closed.every(v => v === 0), 'a patch with no border has no shadow');
}
// 2. every impressing structure, neighbour link and context structure exists in the atlas (chest copy), and every impression with a link has a card field to hang it on
const names = new Set(atlas.parts.map(p => p.name)), patchNames = new Set(cards.filter(c => c.kind === 'surface').map(c => c.name));
for (const [patch, list] of Object.entries(links.impressors)) { assert.ok(patchNames.has(patch), `impressor map: ${patch} is not a lung patch`); for (const n of list) assert.ok(names.has(n), `${patch}: impressing structure ${n} is not in the atlas`); assert.ok(lungCategoryOf(patch), `${patch}: no category`); }
for (const [patch, list] of Object.entries(links.neighbours)) { assert.ok(patchNames.has(patch), `neighbour map: ${patch} is not a lung patch`); for (const n of list) assert.ok(patchNames.has(n), `${patch}: neighbour ${n} is not a lung patch`); }
for (const n of links.context) assert.ok(names.has(n), `context structure ${n} is not in the atlas`);
const impressions = cards.filter(c => c.lung === 'impression');
for (const c of impressions) {
  const labels = c.extra.map(f => f.labelEn);
  if (links.impressors[c.name]) assert.ok(labels.includes('Impressed by'), `${c.name}: Impressed by field`);
  if (links.neighbours[c.name]) assert.ok(labels.includes('Neighbouring impressions'), `${c.name}: Neighbouring impressions field`);
  assert.ok(links.impressors[c.name] && links.neighbours[c.name], `${c.name}: every impression lists what presses it and its neighbours`);
}
let nImp = 0;
for (const side of ['left', 'right']) {
  const g = lungImpressors(atlas, [side]);
  assert.ok(g.length >= 4, `${side}: impressing structures found`);
  for (const grp of g) { nImp += grp.ids.length; assert.ok(LUNG_CATEGORIES.some(c => c.key === grp.cat)); }
  assert.ok(lungContextIds(atlas, side).length >= 10, `${side}: context structures found`);
  // the groove of the other side's subclavian artery is not asked for
  const other = side === 'left' ? 'Right' : 'Left', ids = g.flatMap(x => x.ids).map(id => atlas.parts.find(p => p.id === id).name);
  assert.ok(!ids.some(n => n.startsWith(other + ' ')), `${side}: no structure of the other side`);
}
const arch = lungImpressors(atlas, ['left']).find(x => x.cat === 'artery').ids.map(id => atlas.parts.find(p => p.id === id).name);
assert.ok(arch.includes('Arch of aorta') && arch.includes('Left subclavian artery') && arch.includes('Descending thoracic aorta'), 'left arterial impressors');
assert.ok(lungLinkTarget(atlas, 'Inferior vena cava', 'right'), 'IVC link resolves to the chest copy');

// 3. the page: medial button (only a press turns the camera), impressing-structure switch (off by default), restore, category-coloured card, links on the card
assert.match(page, /className="lung-medial-btn"/); assert.match(page, /aria-label="顯示造成壓跡的結構"/);
assert.match(page, /useState\(false\),\[lungImpress,setLungImpress\]=useState\(false\)/, 'impressing structures are off by default');
assert.match(page, /const toggleLungMedial=/); assert.match(page, /cameraSaveNonce/); assert.match(page, /cameraBackNonce/);
assert.match(page, /disabled=\{lungSide==='both'\}/, 'the medial button needs one lung');
assert.match(page, /onCheckedChange=\{on=>\{const side=lungSide==='both'\?'right':lungSide;[^}]*aim:side!==lungSide/, 'the name-label switch must not turn the camera');
assert.match(page, /const lungCat=profile\?\.lungCategory/); assert.match(page, /className="lung-card-cat"/); assert.match(page, /className="fact-link"/);
assert.match(page, /lungView&&lungTintRows\.length\?/, 'colours do not depend on the name labels');
assert.match(scene, /cameraSaveNonce/); assert.match(scene, /edgeD/); assert.match(scene, /halo/); assert.match(scene, /partTint\.a < 0\.5'\:''\)\+'\) \{/, 'a coloured mark is not lifted towards the camera');
assert.match(info, /lungCategory:lungCategoryOf\(card\.name\)/); assert.match(css, /\.fact-link\{/); assert.match(css, /\.detail-header\[data-lung-cat\] \.detail-accent/);
for (const c of LUNG_CATEGORIES) assert.ok(c.cardEn && c.cardZh, `${c.key}: card category name`);
// no note wording, no page citations
for (const f of [page, info, css]) assert.ok(!/出處：神經解剖|共筆/.test(f));

// 4. the hilum of the left lung is one region in the middle of the mediastinal face (not a strip along the edge): its centre lies in the middle of the lobes' height and depth and near the medial face
{
  const w = loadWorld({paokao: true}), U = makeUtil(w), problems = [];
  for (const [side, lobes, sx] of [['left', ['Upper lobe of left lung', 'Lower lobe of left lung'], 1], ['right', ['Upper lobe of right lung', 'Middle lobe of right lung', 'Lower lobe of right lung'], -1]]) {
    const lo = [1, 1, 1].map((_, k) => Math.min(...lobes.map(l => U.mesh(l).lo[k]))), hi = [1, 1, 1].map((_, k) => Math.max(...lobes.map(l => U.mesh(l).hi[k])));
    const m = U.mesh(`Hilum of ${side} lung`), P = m.positions, n = P.length / 3, c = [0, 0, 0];
    for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) c[k] += P[i + k] / n;
    const rel = k => (c[k] - lo[k]) / (hi[k] - lo[k]), medial = sx > 0 ? (c[0] - lo[0]) : (hi[0] - c[0]);
    if (rel(1) < .35 || rel(1) > .75) problems.push(`${side} hilum height ${rel(1).toFixed(2)} of the lung`);
    if (rel(2) < .25 || rel(2) > .75) problems.push(`${side} hilum depth ${rel(2).toFixed(2)} of the lung`);
    if (medial > .04) problems.push(`${side} hilum ${(medial * 1000).toFixed(0)} mm from the medial face`);
    let far = 0; for (let i = 0; i < P.length; i += 3) if (Math.hypot(P[i] - c[0], P[i + 1] - c[1], P[i + 2] - c[2]) > .045) far++;
    if (far / n > .02) problems.push(`${side} hilum is spread out (${(far / n * 100).toFixed(0)} % of its vertices more than 45 mm from its centre)`);
  }
  assert.deepEqual(problems, [], problems.join('\n'));
}
// 5. z-fighting: the marks do not write depth, are drawn after the lobes and in the stacking order of the build; borders and fissures are drawn as lines
{
  const {LUNG_STACK, lungStackRank} = await quizModule('app/mj-lung-categories.ts'), src = text('scripts/paokao-structures/lungs.mjs');
  const stack = [...src.slice(src.indexOf('const STACK = ['), src.indexOf('const lift =')).matchAll(/'([^']+)'/g)].map(m => m[1]);
  assert.deepEqual(LUNG_STACK, stack, 'LUNG_STACK must equal the STACK of lungs.mjs');
  assert.ok(lungStackRank('Hilum of left lung') > lungStackRank('Diaphragmatic surface of left lung'));
  assert.match(scene, /mark\.depthWrite=false/); assert.match(scene, /respiratory:mark'\)mesh\.renderOrder=2/); assert.match(scene, /gs\.sort\(\(a,b\)=>\(a\.userData\.lungRank/);
}
const hilumCard = cards.find(c => c.name === 'Hilum of left lung');
assert.equal(hilumCard.extra[0].zh, '左肺縱隔面');
console.log(`Lung surface OK: ${Object.keys(links.impressors).length} impressions with impressing structures, ${nImp} impressor meshes, ${links.context.length} context structures, hilum in the middle of the medial face.`);
