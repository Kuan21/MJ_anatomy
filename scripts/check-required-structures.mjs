// Required-structure check: every structure listed in docs/required-structures/head-neck.json (3D expected) must exist on the site.
// The site may have more, never fewer. Uses only committed files and prints only counts and opaque ids.
//   node scripts/check-required-structures.mjs               check (CI)
//   node scripts/check-required-structures.mjs --explain     also print names and matches (local use only, never in CI)
//   node scripts/check-required-structures.mjs --write       drop ids from known-gaps.json that are no longer missing
//   node scripts/check-required-structures.mjs --write --adopt   (first adoption) set known-gaps.json to the current gaps
// Status per structure: PRESENT, ALIAS (found under another name: alias table or Chinese name), CONCEPT-ONLY (a named concept without a mesh),
// CARD-ONLY (a data card without a mesh), MISSING. Known gaps may only shrink.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {quizModule} from './quiz-modules.mjs';
import {addToIndex, classify, createIndex} from './lib/required-match.mjs';

const root = new URL('../', import.meta.url), models = new URL('public/models/', root), dir = new URL('docs/required-structures/', root);
const args = new Set(process.argv.slice(2)), explain = args.has('--explain');
const json = (url) => JSON.parse(fs.readFileSync(url, 'utf8'));
const gz = (url) => JSON.parse(gunzipSync(fs.readFileSync(url)));
const glbJson = (url) => { const b = fs.readFileSync(url); return JSON.parse(b.toString('utf8', 20, 20 + b.readUInt32LE(12))); };

const {correctedPartName} = await quizModule('app/mj-part-regions.ts');
const {structureProfile} = await quizModule('app/mj-structure-info.ts');
const {SPACES} = await quizModule('app/mj-spaces.ts');
const {SCHEMATIC_NAMES} = await import('./lib/nerve-schematics.mjs');

const index = createIndex();
const counts = {};
const add = (source, names, {zh = [], status = 'PRESENT', system = 'skeletal'} = {}) => {
  const list = [...new Set(names.filter(Boolean))];
  let chinese = [].concat(zh).filter(Boolean);
  if (!chinese.length) { try { const c = structureProfile(list[0], system)?.chinese; if (c) chinese = [c]; } catch { /* name without a Chinese entry */ } }
  addToIndex(index, {names: list, zh: chinese, status, source: source});
  counts[source] = (counts[source] ?? 0) + 1;
};

// 1. atlas parts and concepts
const atlas = json(new URL('atlas.json', models));
const partIds = new Set(atlas.parts.map(p => p.id));
for (const p of atlas.parts) {
  const name = correctedPartName(p), profile = structureProfile(name, p.system, {...p, name});
  add('atlas', [name, p.name, profile.english], {zh: profile.chinese, system: p.system});
}
for (const c of atlas.concepts) if (!c.elements.some(id => partIds.has(id))) add('concept', [c.name], {status: 'CONCEPT-ONLY'});
// 2. facial muscles and the supplement parts
for (const p of json(new URL('facial/atlas.json', models)).parts) add('facial', [p.name], {system: 'muscular'});
for (const p of json(new URL('scripts/supplement-parts.json', root)).parts) add('supplement', [p.name], {system: p.system});
// 3. nerve and sense-organ meshes of nervous.glb, joint tissues of joints.glb (node names are the structure names)
const cleanNode = n => n.replace(/\.(?:[lr]|j|g)(?=\.|$)/g, '').replace(/\.\d{3}$/, '').replace(/\.(?:[lr])$/, '').trim();
for (const n of glbJson(new URL('nervous.glb', models)).nodes) if (n.mesh !== undefined && n.name) add('nervous', [cleanNode(n.name)], {system: 'nervous'});
for (const n of glbJson(new URL('joints.glb', models)).nodes) if (n.name) add('joints', [cleanNode(n.extras?.za_name ?? n.name)], {system: 'connective'});
// 4. neck vessels, vessel trees, heart, schematic models, special regions
for (const v of gz(new URL('neck-vessels.json.gz', models)).vessels) add('neck-vessels', [cleanNode(v.name)], {system: v.system});
for (const f of fs.readdirSync(new URL('app/data/vessel-tree/', root)).filter(f => f.endsWith('.json'))) for (const v of json(new URL(`app/data/vessel-tree/${f}`, root)).vessels) add('vessel-tree', [v.en], {zh: v.zh, system: v.kind === 'vein' ? 'venous' : 'arterial'});
// (the atria's auricles are not the ear's auricle, so they are left out of the index)
for (const p of gz(new URL('heart/heart-detail.json.gz', models)).parts.filter(p => !/auricle/i.test(p.name))) add('heart', [p.name], {zh: p.chinese, system: 'cardiac'});
for (const p of Object.values(json(new URL('app/mj-paokao.json', root)))) add('paokao-cards', [p.name], {zh: p.zh, system: p.system});
for (const p of json(new URL('docs/schematic-models.json', root))) add('schematic', [p.name], {zh: p.zh, system: p.system});
for (const s of Object.values(SCHEMATIC_NAMES)) add('schematic', [s.en], {zh: s.zh, system: s.system});
for (const s of SPACES) add('special-region', [s.en], {zh: s.zh});
// 5. meshes that load at run time: the eye and inner-ear micro-atlas lists (name tables in app/micro-atlas.tsx)
const micro = fs.readFileSync(new URL('app/micro-atlas.tsx', root), 'utf8');
for (const [from, to] of [['const EYE_PARTS', '\n};'], ['const EAR_FILES', '] as const']]) {
  const start = micro.indexOf(from), block = micro.slice(start, micro.indexOf(to, start));
  for (const m of block.matchAll(/name:\s*(?:'([^']+)'|"([^"]+)")/g)) add('micro-atlas', (m[1] ?? m[2]).split(/\s+\/\s+|\s+·\s+/), {system: 'nervous'});
}
// 6. brain data cards (no mesh of their own): the names of the brain structure cards in the neuro cards file and the brain fact templates
for (const f of fs.readdirSync(new URL('app/organ/', root)).filter(f => /^brain-facts-.*\.ts$/.test(f))) {
  for (const m of fs.readFileSync(new URL(`app/organ/${f}`, root), 'utf8').matchAll(/\bT\(\/\^([^/]*?)\$\/i/g)) {
    const plain = m[1].replace(/\\\(/g, '(').replace(/\\\)/g, ')');
    if (!/[\\|?*+[\]{}^$]/.test(plain.replace(/\([^)]*\)/g, ''))) add('brain-facts', [plain], {status: 'CARD-ONLY'});
  }
}
// 7. brain data cards (no mesh of their own)
for (const c of Object.values(json(new URL('brain/neuro-cards.json', models)).cards)) add('brain-cards', [c.en], {zh: c.zh, status: 'CARD-ONLY'});

if (process.argv.includes('--find')) {
  // local help for building the alias table: index keys that contain the given text
  const q = process.argv[process.argv.indexOf('--find') + 1].toLowerCase().replace(/[^a-z0-9]+/g, '');
  for (const [k, v] of index.en) if (k.includes(q)) console.log(`${k}  ${v.status}  ${v.source}`);
  process.exit(0);
}
// ---- compare
const required = json(new URL('head-neck.json', dir)).structures;
const aliasTable = fs.existsSync(new URL('aliases.json', dir)) ? json(new URL('aliases.json', dir)).aliases : [];
const aliasById = new Map();
for (const a of aliasTable) aliasById.set(a.id, [...(aliasById.get(a.id) ?? []), a.site]);
const knownFile = new URL('known-gaps.json', dir);
const known = new Set(fs.existsSync(knownFile) ? json(knownFile).ids : []);

const result = new Map(), tally = {PRESENT: 0, ALIAS: 0, 'CONCEPT-ONLY': 0, 'CARD-ONLY': 0, MISSING: 0};
let expected = 0;
for (const r of required) {
  if (!r.expect3d) continue;
  expected++;
  const c = classify(r, index, aliasById.get(r.id) ?? []);
  result.set(r.id, c);
  tally[c.status]++;
}
const ids = status => required.filter(r => result.get(r.id)?.status === status).map(r => r.id);
const missing = ids('MISSING');
const newGaps = missing.filter(id => !known.has(id));
const nowPresent = [...known].filter(id => result.has(id) && result.get(id).status !== 'MISSING');
const unknownIds = [...known].filter(id => !required.some(r => r.id === id));
const badAlias = aliasTable.filter(a => !required.some(r => r.id === a.id) || classify({en: '', zh: ''}, index, [a.site]).status === 'MISSING');

if (args.has('--write')) {
  const next = args.has('--adopt') ? missing : [...known].filter(id => missing.includes(id));
  fs.writeFileSync(knownFile, JSON.stringify({version: 1, ids: next.sort()}, null, 1) + '\n');
  console.log(`known gaps written: ${next.length}`);
  process.exit(0);
}

console.log(`required ${expected}, present ${tally.PRESENT}, alias ${tally.ALIAS}, concept-only ${tally['CONCEPT-ONLY']}, card-only ${tally['CARD-ONLY']}, missing ${tally.MISSING} (known ${missing.length - newGaps.length}), new gaps ${newGaps.length}, now-present ${nowPresent.length}`);
if (explain) {
  const byId = new Map(required.map(r => [r.id, r]));
  const show = (title, list) => { console.log(`\n${title} (${list.length})`); for (const id of list) { const r = byId.get(id), c = result.get(id); console.log(`  ${id}  ${r.en} | ${r.zh}  [${r.type}]${c?.source ? `  -> ${c.via}:${c.source}` : ''}  seed=${r.seed}`); } };
  show('ALIAS', ids('ALIAS')); show('CONCEPT-ONLY', ids('CONCEPT-ONLY')); show('CARD-ONLY', ids('CARD-ONLY')); show('NEW GAPS', newGaps); show('NOW PRESENT (still listed as known gaps)', nowPresent);
  const seedClass = r => r.seed === 'MISSING' ? 'missing' : r.seed === 'REGION-ONLY' ? 'region' : 'have';
  const computedClass = id => { const s = result.get(id).status; return s === 'PRESENT' || s === 'ALIAS' ? 'have' : s === 'MISSING' ? 'missing' : 'card'; };
  const matrix = {};
  for (const r of required.filter(r => r.expect3d)) { const k = `seed ${seedClass(r)} -> computed ${computedClass(r.id)}`; matrix[k] = (matrix[k] ?? 0) + 1; }
  console.log('\nseed vs computed', JSON.stringify(matrix));
  const disagree = required.filter(r => r.expect3d).filter(r => seedClass(r) === 'region' ? computedClass(r.id) === 'have' : seedClass(r) !== computedClass(r.id));
  console.log(`\nseed disagreements ${disagree.length}`);
  for (const r of disagree) console.log(`  ${r.id}  ${r.en}  seed=${r.seed}  computed=${result.get(r.id).status}${result.get(r.id).source ? ` (${result.get(r.id).via}:${result.get(r.id).source})` : ''}`);
  console.log('\nindex sources', JSON.stringify(counts));
}
const problems = [];
if (newGaps.length) problems.push(`new gaps ${newGaps.length}: ${newGaps.slice(0, 30).join(' ')}${newGaps.length > 30 ? ' ...' : ''}`);
if (nowPresent.length) problems.push(`known gaps that are now covered, run with --write: ${nowPresent.slice(0, 30).join(' ')}${nowPresent.length > 30 ? ' ...' : ''}`);
if (unknownIds.length) problems.push(`known-gaps ids not in the list: ${unknownIds.join(' ')}`);
if (badAlias.length) problems.push(`alias entries that point at nothing: ${badAlias.length}`);
if (problems.length) { console.error('Required structures check failed:\n - ' + problems.join('\n - ')); process.exit(1); }
console.log('Required structures OK: the known gaps only shrink.');
