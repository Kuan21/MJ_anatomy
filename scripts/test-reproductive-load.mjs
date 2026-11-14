// Reproductive organs of BOTH sexes: every structure of the required list (scripts/data/reproductive-required.json, written from the structures the site already has) must
//   - exist in the runtime atlas (the catalogue the viewer builds: body + facial + supplement + female + serous + vessel ends + schematic packages) and have drawable geometry,
//   - be shown by the real display rule (app/mj-part-visibility.ts) in its own sex, with only its own system switch on and with every system on,
//   - be hidden in the other sex (so 男／女 really swaps the set),
//   - belong to a body region of the region bar (so a region view can show it),
//   - and the scene must redraw when the sex (or any other display-rule input) changes: the list of inputs is checked against what partVisibility reads.
// A negative run then removes / breaks one structure at a time and expects each to fail. Prints only pass / fail and counts.
//   node scripts/test-reproductive-load.mjs
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {quizModule} from './quiz-modules.mjs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {displaySystem} from './lib/runtime-systems.mjs';

const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
const V = await quizModule('app/mj-part-visibility.ts'), O = await quizModule('app/mj-owners.ts'), B = await quizModule('app/mj-region-bar.ts'), S = await quizModule('app/mj-sex.ts');
const required = JSON.parse(fs.readFileSync(file('scripts/data/reproductive-required.json'), 'utf8'));
const {atlas, geometry} = loadFullAtlas();
// the system a part is shown under: the body atlas is classified at load, the packages keep their own system (app/page.tsx, app/mj-system-classifier.ts)
const runtimeParts = atlas.parts.map(p => p.stream ? p : {...p, system: displaySystem(p)});
const ALL = ['skeletal', 'muscular', 'tendon', 'connective', 'arterial', 'venous', 'nervous', 'cardiac', 'respiratory', 'urinary', 'digestive', 'serous', 'lymphatic', 'reproductive', 'integumentary', 'endocrine', 'sensory'];
const state = o => ({visible: ALL, selected: [], hiddenParts: [], focusParts: undefined, isolate: false, depthFilter: 'all', muscleRegion: undefined, muscleLayer: 'all', faceMuscleLayer: 'all', heartOpen: undefined, sex: undefined, hiddenSerous: [], ...o});

/** Runs every check on a list of runtime parts; returns the failures and the number of checks made. */
function run(parts, geom = geometry) {
  const fails = []; let checks = 0;
  const bad = m => fails.push(m), ok = (cond, m) => { checks++; if (!cond) bad(m); };
  const owners = O.buildOwners(parts), index = B.buildRegionIndex(parts);
  const region = new Set();
  for (const def of B.REGION_BAR.filter(r => r.key !== 'whole')) for (const sub of def.subs ?? [{id: undefined}]) for (const id of B.regionMembers(index, parts, def.key, sub.id, 'both').focus) region.add(id);
  for (const [sex, other, list] of [['male', 'female', required.male], ['female', 'male', required.female]]) {
    for (const entry of list) {
      const [system, name] = entry.split('|');
      const found = parts.filter(p => p.system === system && p.name === name);
      ok(found.length >= 1, `${sex}: ${name} is not in the atlas`);
      for (const p of found) {
        // drawable geometry: counted vertices and triangles, its package on disk, finite coordinates, a box with extent
        let g = null; try { g = p.vertexCount > 0 && p.indexCount > 0 ? geom(p) : null; } catch { g = null; }
        ok(!!g && g.positions.length === p.vertexCount * 3 && g.indices.length === p.indexCount && g.positions.every(Number.isFinite) && g.indices.every(i => i < p.vertexCount), `${sex}: ${name} has no drawable mesh`);
        ok(p.bounds && p.bounds[1].filter((v, k) => v > p.bounds[0][k]).length >= 2, `${sex}: ${name} has an empty bounding box`);
        // shown in its own sex with only its own system (plus Reproductive) on, and with every system on
        const own = [...new Set([p.system, 'reproductive', ...(p.system === 'serous' ? ['serous'] : [])])];
        for (const [label, vis] of [['own switches', own], ['all systems', ALL]]) {
          const v = V.partVisibility(owners, state({visible: vis, sex}));
          ok(v.base(p), `${sex}: ${name} is not shown (${label})`);
        }
        // and hidden in the other sex
        ok(!V.partVisibility(owners, state({visible: ALL, sex: other})).base(p), `${other}: ${name} (${sex}-only) is still shown`);
        ok(region.has(p.id), `${sex}: ${name} is in no region of the region bar`);
      }
    }
    // the part counter of the Reproductive row in this sex counts them all
    const counted = parts.filter(p => p.system === 'reproductive' && S.matchesSex(p, sex)).length, listed = list.filter(e => e.startsWith('reproductive|')).length;
    ok(counted >= listed, `${sex}: the Reproductive row counts ${counted}, fewer than the ${listed} required`);
  }
  // the female pelvis stands in for the male one: hip bones and sacrum
  for (const entry of required.femalePelvisReplacements) {
    const [system, name] = entry.split('|'), p = parts.find(q => q.system === system && q.name === name && q.sex === 'female');
    ok(!!p && V.partVisibility(owners, state({sex: 'female'})).base(p) && !V.partVisibility(owners, state({sex: 'male'})).base(p), `female pelvis part ${name} is missing or not swapped by sex`);
  }
  return {fails, checks};
}

const real = run(runtimeParts);
const total = required.male.length + required.female.length;

// the packages that carry them are merged into the viewer's catalogue
const facial = fs.readFileSync(file('app/mj-facial-atlas.ts'), 'utf8');
for (const pkg of ['female/female-stream.json.gz', 'serous/serous-stream.json.gz', 'paokao/paokao-stream.json.gz']) if (!facial.includes(`'${pkg}'`)) real.fails.push(`the viewer does not load ${pkg}`);
real.checks += 3;

// the scene redraws when the sex (or any input of the display rule) changes
const scene = fs.readFileSync(file('app/scene.tsx'), 'utf8'), rule = fs.readFileSync(file('app/mj-part-visibility.ts'), 'utf8');
if (!/visibilityChanged\(lastState,\s*s\)/.test(scene)) real.fails.push('app/scene.tsx does not redraw on a change of the display-rule inputs (visibilityChanged)');
const read = new Set([...rule.matchAll(/\bs\.(\w+)/g)].map(m => m[1])), keys = new Set(V.VISIBILITY_KEYS);
for (const k of read) if (!keys.has(k)) real.fails.push(`partVisibility reads s.${k}, which is not in VISIBILITY_KEYS (the scene would not redraw when it changes)`);
const base = state({sex: 'male'});
for (const k of V.VISIBILITY_KEYS) {
  const changed = {...base, [k]: k === 'sex' ? 'female' : k === 'isolate' ? true : Array.isArray(base[k]) || base[k] === undefined ? [...(base[k] ?? []), 'x'] : 'x'};
  if (!V.visibilityChanged(base, changed)) real.fails.push(`visibilityChanged ignores ${k}`);
  if (V.visibilityChanged(base, {...base})) real.fails.push('visibilityChanged reports a change for identical state');
}
real.checks += 2 + keys.size * 2;

// negative run: each broken copy of the catalogue must fail
const negatives = [];
const drop = (list, sys, name) => list.filter(p => !(p.system === sys && p.name === name));
negatives.push(['remove Prostate (male)', drop(runtimeParts, 'reproductive', 'Prostate')]);
negatives.push(['remove Body of uterus (female)', drop(runtimeParts, 'reproductive', 'Body of uterus')]);
negatives.push(['remove Vagina (female)', drop(runtimeParts, 'reproductive', 'Vagina')]);
negatives.push(['remove Left ovary (female)', drop(runtimeParts, 'reproductive', 'Left ovary')]);
negatives.push(['remove Left ampulla of uterine tube (female)', drop(runtimeParts, 'reproductive', 'Left ampulla of uterine tube')]);
negatives.push(['empty mesh of Right testis', runtimeParts.map(p => p.name === 'Right testis' ? {...p, vertexCount: 0, indexCount: 0} : p)]);
negatives.push(['female part tagged for the wrong sex (Cervix of uterus)', runtimeParts.map(p => p.name === 'Cervix of uterus' ? {...p, sex: undefined} : p)]);
negatives.push(['female part moved to another system switch (Left ovary -> connective)', runtimeParts.map(p => p.name === 'Left ovary' ? {...p, system: 'connective'} : p)]);
let negFail = 0;
for (const [label, list] of negatives) { if (run(list).fails.length === 0) { real.fails.push(`negative test did not fail: ${label}`); negFail++; } }
real.checks += negatives.length;

if (real.fails.length) {
  console.error(`FAIL reproductive organs: ${real.fails.length} problem(s) in ${real.checks} checks`);
  for (const m of real.fails.slice(0, 20)) console.error('  ' + m);
  process.exit(1);
}
console.log(`PASS reproductive organs: ${required.male.length} male + ${required.female.length} female structures (${total}) loaded, drawable, shown in their own sex, hidden in the other, in a region; ${required.femalePelvisReplacements.length} female pelvis parts swap by sex; the scene redraws on every display-rule input (${keys.size}); ${negatives.length} negative cases fail as they must; ${real.checks} checks`);
