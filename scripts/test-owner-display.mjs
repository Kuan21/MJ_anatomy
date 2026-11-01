// Every structure that follows a muscle (tendons, tendon sheaths, the palmar aponeurosis ...) goes through EVERY display operation of its muscle: Hide, Hide all / systems off, Isolate,
// region and sub-region filters on each side, tissue depth, muscle layers (Peel deeper), sex. For each state the structure must be shown exactly when one of its owner muscles is shown
// (and never when all of them are hidden). Uses the real rule function the scene uses (app/mj-part-visibility.ts) on the runtime atlas. Also lists tendon-like structures that have no
// owner muscle: tendons must have one (fail), the others (ligaments of the extensor mechanism, retinacula ...) are only listed.
import fs from 'node:fs';
import {quizModule} from './quiz-modules.mjs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {displaySystem} from './lib/runtime-systems.mjs';

const V = await quizModule('app/mj-part-visibility.ts'), O = await quizModule('app/mj-owners.ts'), B = await quizModule('app/mj-region-bar.ts'), L = await quizModule('app/mj-muscle-layers.ts');
const {atlas} = loadFullAtlas(), parts = atlas.parts.map(p => p.stream ? p : {...p, system: displaySystem(p)});
const owners = O.buildOwners(parts), byId = owners.byId;
const followers = parts.filter(p => owners.muscleOf.has(p.id));
let fails = 0, checks = 0;
const bad = m => { fails++; if (fails < 25) console.error('FAIL ' + m); };
const ALL = ['skeletal', 'muscular', 'tendon', 'connective', 'arterial', 'venous', 'nervous', 'cardiac', 'respiratory', 'digestive', 'serous', 'lymphatic'];
const state = o => ({visible: ALL, selected: [], hiddenParts: [], focusParts: undefined, isolate: false, depthFilter: 'all', muscleRegion: undefined, muscleLayer: 'all', faceMuscleLayer: 'all', heartOpen: undefined, sex: undefined, hiddenSerous: [], ...o});

// the structure is shown exactly when its muscle is shown (the muscle is judged by the same function, with its own system)
function check(label, s, only = followers) {
  const v = V.partVisibility(owners, s);
  for (const p of only) {
    checks++;
    const m = owners.muscleOf.get(p.id).map(id => byId.get(id)).filter(Boolean);
    const shown = v.base(p);
    const ownerShown = m.some(q => s.isolate ? v.selection.has(q.id) && !v.hidden.has(q.id) && v.visible.has(q.system) : v.base(q));
    const flags = v.visible.has('muscular') && v.visible.has(p.system);
    const expected = !v.hidden.has(p.id) && flags && ownerShown && (!s.isolate || true);
    if (shown && !ownerShown) bad(`${label}: ${p.name} (${p.id}) is shown while its muscle is not (${m.map(q => q.name).join(', ')})`);
    if (shown !== expected && !(shown === false && !flags)) bad(`${label}: ${p.name} (${p.id}) shown=${shown}, expected ${expected}`);
  }
}

// 0. no operation: shown with its muscle
check('default', state({}));
// 1. Hide: each owner muscle alone, then all owners of a structure, then a tendon itself
for (const p of followers) {
  const m = owners.muscleOf.get(p.id);
  for (const id of m) {
    const s = state({hiddenParts: [id]}), v = V.partVisibility(owners, s);
    if (m.length === 1 && v.base(p)) bad(`Hide ${byId.get(id).name}: its tendon part ${p.name} (${p.id}) is still shown`);
    check(`Hide ${byId.get(id).name}`, s, [p]);
  }
  const s2 = state({hiddenParts: m}); if (V.partVisibility(owners, s2).base(p)) bad(`Hide all owners: ${p.name} (${p.id}) still shown`);
  const s3 = state({hiddenParts: [p.id]}); if (V.partVisibility(owners, s3).base(p)) bad(`Hide the tendon itself: ${p.name} still shown`);
}
// a muscle with several mesh parts: hiding every part of one muscle name leaves none of its tendon pieces
const names = new Map(); for (const p of parts.filter(q => q.system === 'muscular')) (names.get(p.name) ?? names.set(p.name, []).get(p.name)).push(p.id);
for (const [n, ids] of names) { const v = V.partVisibility(owners, state({hiddenParts: ids})); for (const p of followers) { const m = owners.muscleOf.get(p.id); if (m.every(id => ids.includes(id)) && v.base(p)) bad(`Hide muscle ${n}: ${p.name} (${p.id}) still shown`); } }
// 2. Hide all / Muscles off / Tendons off / every system off
check('Muscles off', state({visible: ALL.filter(x => x !== 'muscular')}));
check('Hide all', state({visible: []}));
for (const p of followers) if (p.system === 'tendon' && V.partVisibility(owners, state({visible: ALL.filter(x => x !== 'tendon')})).base(p)) bad(`Tendons off: ${p.name} still shown`);
// 3. Isolate: a selected muscle keeps its tendon pieces, an unrelated selection keeps none, a selected tendon is the caller's override
for (const p of followers) {
  const m = owners.muscleOf.get(p.id);
  for (const id of m) { const v = V.partVisibility(owners, state({isolate: true, selected: [id]})); if (p.system === 'tendon' && !v.base(p)) bad(`Isolate ${byId.get(id).name}: its tendon ${p.name} (${p.id}) is not kept`); }
  const other = parts.find(q => q.system === 'muscular' && !m.includes(q.id));
  if (V.partVisibility(owners, state({isolate: true, selected: [other.id]})).base(p)) bad(`Isolate ${other.name}: ${p.name} is shown`);
  if (V.partVisibility(owners, state({isolate: true, selected: []})).base(p)) bad(`Isolate nothing: ${p.name} is shown`);
}
// 4. regions and sub-regions, each side
const index = B.buildRegionIndex(parts);
for (const def of B.REGION_BAR.filter(r => r.key !== 'whole')) for (const sub of def.subs ?? [{id: undefined}]) for (const side of ['both', 'left', 'right']) {
  const set = B.regionMembers(index, parts, def.key, sub.id, side);
  check(`region ${def.key}/${sub.id ?? '-'}/${side}`, state({visible: B.regionVisible(def.key, sub.id), focusParts: set.focus}));
  // the faded other side joins the focus (淡化另一側): same rule
  check(`region ${def.key}/${sub.id ?? '-'}/${side} + faded other side`, state({visible: B.regionVisible(def.key, sub.id), focusParts: [...set.focus, ...set.other]}));
}
// 5. tissue depth and muscle layers (Peel deeper)
for (const depth of ['superficial', 'intermediate', 'deep']) check(`depth ${depth}`, state({depthFilter: depth}));
for (const r of L.MUSCLE_LAYER_REGIONS) for (const order of L.layerOrders(r.id)) check(`layer ${r.id} ${order}`, state({muscleRegion: r.id, muscleLayer: order}));
// 6. sex
check('sex female', state({sex: 'female'})); check('sex male', state({sex: 'male'}));

// owners: every tendon has one; list the tendon-like structures that follow nothing
const noOwner = parts.filter(p => !owners.muscleOf.has(p.id));
const tendons = noOwner.filter(p => p.system === 'tendon' || p.kind === 'tendon');
for (const p of tendons) bad(`tendon without an owner muscle: ${p.name} (${p.id})`);
const LIKE = /tendon|tendinous|aponeurosis|pes anserinus|iliotibial|fascia lata|patellar (?:ligament|retinaculum)|retinaculum|sheath|compartment/i;
const like = [...new Set(noOwner.filter(p => p.system === 'connective' && LIKE.test(p.name)).map(p => p.name.replace(/\b(?:Left|Right)\b ?/gi, '').trim()))].sort();
if (process.argv.includes('--list')) console.log('Tendon-like connective structures without an owner muscle (not following Muscles):\n' + like.join('\n'));
// a piece of a multi-muscle tendon belongs to ONE muscle: only whole-mesh tendons (calcaneal tendon: plantaris, soleus, gastrocnemius) and the sheaths and aponeuroses that enclose several tendons share owners
const shared = followers.filter(p => owners.muscleOf.get(p.id).length > 1);
for (const p of shared) if (p.system === 'tendon' && p.stream === 'paokao') bad(`${p.name} (${p.id}) is a cut piece but has ${owners.muscleOf.get(p.id).length} owner muscles`);
if (process.argv.includes('--list')) console.log('Parts with several owner muscles (shown while any of them is shown):\n' + [...new Set(shared.map(p => p.name + ' <- ' + owners.muscleOf.get(p.id).map(id => byId.get(id).name).join(', ')))].sort().join('\n'));
if (!followers.length) bad('no owner-following structures found');
if (fails) { console.error(`${fails} display check(s) failed`); process.exit(1); }
console.log(`Owner display OK: ${followers.length} owner-following parts (${followers.filter(p => p.system === 'tendon').length} tendon parts) x Hide, Hide all, Muscles/Tendons off, Isolate, ${B.REGION_BAR.length - 1} regions with sub-regions x 3 sides x faded other side, depth, muscle layers, sex = ${checks} checks; no tendon without an owner; ${like.length} tendon-like connective names follow no muscle.`);
