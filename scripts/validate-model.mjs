// Model validation, run by `npm run check` (and so by CI before any build).
// Covers every structure the viewer can show (body + facial + supplement + female + serous + paokao streams):
//   mesh        unique ids, every concept element resolves to a part, a known display system
//   name        non-empty English display name with no mesh residue (.l/.r/.j, trailing 001)
//   side        left/right written as the words Left/Right (no .l/.r or L/R); a name that opens with a side word capitalises it
//   zhside      an English name with Left/Right has 左／右 in its Chinese name
//   extras      the search-only structures (nerves, joints, brain, neck vessels) follow the same name rules
//   chinese     every structure resolves to a Chinese name that contains CJK characters
//   category    every structure resolves to a data card with a category
// The raw atlas binary check (indices, triangle counts) stays in scripts/validate-atlas.mjs.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {atlas, supplement, female, serous, paokao, models} from './lib/coverage-match.mjs';
import {quizModule} from './quiz-modules.mjs';
const {mergeAtlasStreams} = await quizModule('app/mj-facial-atlas.ts');
const {structureProfile} = await quizModule('app/mj-structure-info.ts');
const {correctedPartName} = await quizModule('app/mj-part-regions.ts');
const {cleanMeshName} = await quizModule('app/mj-naming.ts');
const SYSTEMS = new Set(['skeletal', 'sensory', 'nervous', 'connective', 'muscular', 'arterial', 'cardiac', 'endocrine', 'venous', 'digestive', 'respiratory', 'lymphatic', 'integumentary', 'reproductive', 'urinary', 'serous']);
const RESIDUE = /\.[lrj]\b|\.\d+$|[A-Za-z]\d{3}$|_[lr]$|\*$|^-$|Bounds\(/i;
const CJK = /[㐀-鿿]/;
const baseline = fs.existsSync(new URL('../docs/model-validation-baseline.json', import.meta.url)) ? JSON.parse(fs.readFileSync(new URL('../docs/model-validation-baseline.json', import.meta.url), 'utf8')) : {};
const merged = mergeAtlasStreams(atlas, [JSON.parse(gunzipSync(fs.readFileSync(new URL('facial/facial-stream.json.gz', models)))), supplement, female, serous, paokao]);
const problems = {mesh: [], name: [], side: [], zhside: [], chinese: [], category: []};
const ids = new Set();
for (const p of merged.parts) {
  if (ids.has(p.id)) problems.mesh.push(`${p.id}: duplicate id`);
  ids.add(p.id);
  if (!SYSTEMS.has(p.system)) problems.mesh.push(`${p.id} ${p.name}: unknown system "${p.system}"`);
}
for (const c of merged.concepts) {
  if (!c.name?.trim()) problems.name.push(`concept ${c.id}: empty name`);
  for (const id of c.elements) if (!ids.has(id)) problems.mesh.push(`concept ${c.id}: element ${id} is not a part`);
}
for (const p of merged.parts) {
  const raw = correctedPartName(p), name = cleanMeshName(raw);
  if (!name.trim() || RESIDUE.test(name) || /^\s|\s$|\s{2,}/.test(name)) problems.name.push(`${p.id} ${JSON.stringify(raw)}: English name empty or carries mesh residue`);
  // sides are written as the words Left/Right: no .l/.r or L/R abbreviations, and a name that opens with a side word capitalises it
  if (/^(left|right) /.test(name) || /(?:^|[\s(_-])[LR](?:$|[\s)_-])/.test(name)) problems.side.push(`${p.id} ${name}: side must be written as the word Left or Right`);
  const card = structureProfile(name, p.system, {...p, name});
  if (!card.chinese || !CJK.test(card.chinese)) problems.chinese.push(`${p.id} ${name}: no Chinese name`);
  else if (/\b(left|right)\b/i.test(name) && !/[左右]/.test(card.chinese)) problems.zhside.push(`${p.id} ${name}: Chinese name "${card.chinese}" has no 左／右`);
  if (!card.category) problems.category.push(`${p.id} ${name}: no category`);
}
if (process.argv.includes('--write-baseline')) {
  fs.writeFileSync(new URL('../docs/model-validation-baseline.json', import.meta.url), JSON.stringify({side: problems.side.map(l => l.split(' ')[0]), zhside: problems.zhside.map(l => l.split(' ')[0])}, null, 1) + '\n');
  console.log(`Baseline written: ${problems.side.length} side-word exceptions.`); process.exit(0);
}
// the search-only structures (nerves, joints, brain, neck vessels): same residue and side rules
const extras = JSON.parse(gunzipSync(fs.readFileSync(new URL('search-extras.json.gz', models))));
for (const e of extras) {
  if (!e.n.trim() || RESIDUE.test(e.n) || /\s{2,}/.test(e.n)) problems.name.push(`EX:${e.k}:${e.n}: search name empty or carries mesh residue`);
  if (/^(left|right) /.test(e.n) || /(?:^|[\s(_-])[LR](?:$|[\s)_-])/.test(e.n)) problems.side.push(`EX:${e.k}:${e.n}: side must be written as the word Left or Right`);
}
let failed = 0;
for (const [kind, list] of Object.entries(problems)) {
  const allowed = new Set(baseline[kind] ?? []);
  const fresh = list.filter(line => !allowed.has(line.split(':')[0].split(' ')[0]));
  if (fresh.length) {failed += fresh.length; console.error(`validate-model [${kind}] ${fresh.length} problem(s):\n - ${fresh.slice(0, 25).join('\n - ')}${fresh.length > 25 ? `\n - … ${fresh.length - 25} more` : ''}`);}
}
if (failed) process.exit(1);
const baselined = Object.values(problems).reduce((n, l) => n + l.length, 0);
console.log(`Model validation OK: ${merged.parts.length} parts, ${merged.concepts.length} concepts, ${merged.parts.length} English + Chinese names and cards${baselined ? ` (${baselined} tracked in docs/model-validation-baseline.json)` : ''}.`);
