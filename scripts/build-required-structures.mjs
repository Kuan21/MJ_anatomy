// Builds docs/required-structures/head-neck.json (names only) from per-topic name lists kept outside the repository.
//   node scripts/build-required-structures.mjs <file-or-folder> [more files ...]
// A folder means every *.json file inside it. Each file is an array of {en, zh, type, status, topic}.
// Not part of CI: the inputs are not in the repository. Ids already in the output are kept, new structures get the next free number,
// so an id never changes meaning. Only names, types and topic labels are written.
import fs from 'node:fs';
import path from 'node:path';
import {requiredKey} from './lib/required-match.mjs';

const out = new URL('../docs/required-structures/head-neck.json', import.meta.url);
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
if (!args.length) { console.error('usage: node scripts/build-required-structures.mjs <json file or folder> [...]'); process.exit(2); }
const files = args.flatMap(a => fs.statSync(a).isDirectory() ? fs.readdirSync(a).filter(f => f.endsWith('.json')).sort().map(f => path.join(a, f)) : [a]);
const rows = files.flatMap(f => JSON.parse(fs.readFileSync(f, 'utf8')));

// Regional types come first when one structure was typed differently in two lists.
const PRIORITY = ['ear', 'eye', 'oral', 'brain', 'bone', 'foramen', 'cartilage', 'ligament', 'muscle', 'artery', 'vein', 'nerve', 'ganglion', 'gland', 'duct', 'sinus', 'space', 'fascia', 'lymphoid', 'landmark', 'other'];
const rank = t => { const i = PRIORITY.indexOf(t); return i < 0 ? PRIORITY.length : i; };
const REASON = {EXCLUDED: 'clinical or functional term, not a drawable structure', HISTOLOGY: 'cell or tissue level, not a gross structure'};

const groups = new Map();
for (const r of rows) {
  const en = String(r.en ?? '').replace(/\s+/g, ' ').trim();
  if (!en) continue;
  const key = requiredKey(en);
  if (!key) continue;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push({...r, en});
}

let previous = {structures: []};
try { previous = JSON.parse(fs.readFileSync(out, 'utf8')); } catch { /* first run */ }
const idByKey = new Map(previous.structures.map(s => [requiredKey(s.en), s.id]));
let next = previous.structures.reduce((n, s) => Math.max(n, Number(s.id.slice(3))), 0) + 1;

const structures = [];
for (const [key, list] of [...groups].sort((a, b) => a[0].localeCompare(b[0]))) {
  const types = new Map();
  for (const r of list) types.set(r.type, (types.get(r.type) ?? 0) + 1);
  const type = [...types].sort((a, b) => b[1] - a[1] || rank(a[0]) - rank(b[0]))[0][0];
  const en = list.map(r => r.en).sort((a, b) => (/^[A-Z]/.test(a) ? 0 : 1) - (/^[A-Z]/.test(b) ? 0 : 1) || a.length - b.length)[0];
  // a Chinese name only: anything after an arrow in the input is a working note and is dropped
  const zh = list.map(r => String(r.zh ?? '').split('=>')[0].trim()).find(Boolean) ?? '';
  const statuses = new Set(list.map(r => r.status));
  const drawable = [...statuses].some(s => s !== 'EXCLUDED' && s !== 'HISTOLOGY');
  const seed = ['FOUND', 'ALIAS', 'REGION-ONLY', 'MISSING', 'EXCLUDED', 'HISTOLOGY'].find(s => statuses.has(s));
  const id = idByKey.get(key) ?? `RS-${String(next++).padStart(4, '0')}`;
  const entry = {id, en, zh, type, topics: [...new Set(list.map(r => r.topic).filter(Boolean))].sort(), expect3d: drawable};
  if (!drawable) entry.reason = REASON[seed] ?? REASON.EXCLUDED;
  entry.seed = [...statuses].some(s => s === 'FOUND') ? 'FOUND' : seed;
  structures.push(entry);
}
structures.sort((a, b) => a.id.localeCompare(b.id));
fs.mkdirSync(path.dirname(out.pathname), {recursive: true});
fs.writeFileSync(out, JSON.stringify({version: 1, kind: 'names-only', structures}, null, 1) + '\n');
console.log(`required structures ${structures.length} (3D expected ${structures.filter(s => s.expect3d).length}, kept out ${structures.filter(s => !s.expect3d).length})`);
