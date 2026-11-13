// Every reproductive structure of BOTH sexes must exist, load real geometry and be shown when its sex is selected. docs/reproductive-expected.json lists them (ids and names);
// a structure that is missing from the atlas, has broken geometry, or is not shown by the display rules for its sex fails the check, so it cannot disappear unnoticed.
//   node scripts/test-reproductive-organs.mjs          check
//   node scripts/test-reproductive-organs.mjs --write  (re)write the list from the current atlas; it refuses to drop a structure (remove it by hand if that is intended)
import fs from 'node:fs';
import {quizModule} from './quiz-modules.mjs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {displaySystem} from './lib/runtime-systems.mjs';

const listFile = new URL('../docs/reproductive-expected.json', import.meta.url);
const V = await quizModule('app/mj-part-visibility.ts'), O = await quizModule('app/mj-owners.ts'), S = await quizModule('app/mj-sex.ts');
const {atlas, geometry} = loadFullAtlas(), parts = atlas.parts.map(p => p.stream ? p : {...p, system: displaySystem(p)}), owners = O.buildOwners(parts);
const MALE_NAMES = /\b(penis|penile|scrot|testic|spermatic|prostat|vas deferens|ductus deferens|seminal|bulbourethral|cavernos|glans|epididym)/i;
const current = {
  male: parts.filter(p => !p.sex && S.matchesSex(p, 'male') && (p.system === 'reproductive' || MALE_NAMES.test(p.name))).map(p => ({id: p.id, name: p.name})),
  female: parts.filter(p => p.sex === 'female').map(p => ({id: p.id, name: p.name})),
};
const sorted = l => [...l].sort((a, b) => a.id.localeCompare(b.id));

if (process.argv.includes('--write')) {
  let old = {male: [], female: []}; try { old = JSON.parse(fs.readFileSync(listFile, 'utf8')); } catch {}
  for (const sex of ['male', 'female']) { const have = new Set(current[sex].map(x => x.id)), lost = old[sex].filter(x => !have.has(x.id)); if (lost.length) { console.error(`refusing to drop ${sex} structures: ${lost.map(x => x.name).join(', ')}`); process.exit(1); } }
  fs.writeFileSync(listFile, JSON.stringify({male: sorted(current.male), female: sorted(current.female)}, null, 1) + '\n');
  console.log(`reproductive list written: ${current.male.length} male, ${current.female.length} female structures.`); process.exit(0);
}

const expected = JSON.parse(fs.readFileSync(listFile, 'utf8')), byId = new Map(parts.map(p => [p.id, p]));
const ALL = ['skeletal', 'muscular', 'tendon', 'connective', 'arterial', 'venous', 'nervous', 'cardiac', 'respiratory', 'digestive', 'urinary', 'reproductive', 'serous', 'lymphatic', 'endocrine', 'integumentary', 'sensory'];
const base = {selected: [], hiddenParts: [], focusParts: undefined, isolate: false, depthFilter: 'all', muscleRegion: undefined, muscleLayer: 'all', faceMuscleLayer: 'all', heartOpen: false, hiddenSerous: []};
let bad = 0, checked = 0;
const fail = m => { bad++; if (bad < 30) console.error('FAIL ' + m); };
for (const sex of ['male', 'female']) {
  const v = V.partVisibility(owners, {...base, visible: ALL, sex});
  for (const e of expected[sex]) {
    checked++;
    const p = byId.get(e.id);
    if (!p) { fail(`${sex}: ${e.name} (${e.id}) is missing from the atlas`); continue; }
    let g; try { g = geometry(p); } catch (err) { fail(`${sex}: ${e.name} (${e.id}) geometry does not load: ${err.message}`); continue; }
    if (!g.positions.length || !g.indices.length) { fail(`${sex}: ${e.name} (${e.id}) has no geometry`); continue; }
    let finite = true, maxIndex = 0; for (const x of g.positions) if (!Number.isFinite(x)) { finite = false; break; } for (const i of g.indices) if (i > maxIndex) maxIndex = i;
    if (!finite || maxIndex >= g.positions.length / 3) { fail(`${sex}: ${e.name} (${e.id}) has invalid geometry`); continue; }
    if (!S.matchesSex(p, sex)) { fail(`${sex}: ${e.name} (${e.id}) is not offered for this sex`); continue; }
    if (!v.base(p)) fail(`${sex}: ${e.name} (${e.id}) is not shown by the display rules with every system switched on`);
  }
  // a structure of the other sex must not leak in
  for (const e of expected[sex === 'male' ? 'female' : 'male']) { const p = byId.get(e.id); if (p && !(sex === 'female' ? !p.sex : p.sex === 'female') && v.base(p)) fail(`${sex}: ${e.name} (${e.id}) of the other sex is shown`); }
}
if (bad) { console.error(`${bad} problem(s) in the reproductive structures (checked ${checked}).`); process.exit(1); }
console.log(`Reproductive organs OK: ${expected.male.length} male and ${expected.female.length} female structures exist, load valid geometry and are shown for their own sex.`);
