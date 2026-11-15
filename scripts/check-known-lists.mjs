// The known-violation lists (docs/stability-known.json, docs/vessel-motion-exceptions.json) name structures by a stable identifier (scripts/lib/stable-keys.mjs): a PK / PKC structure by its name,
// an atlas structure by its id. This check fails when
//   - a list still holds a numbered PK-n / PKC-n id (those move whenever a structure is added or removed, and the entry then points at the wrong structure), or
//   - an entry refers to a structure that does not exist any more (a renamed, removed or renumbered one: fix or delete the entry, never leave it pointing nowhere),
// and it tests the identifier logic itself: adding or removing a structure must not change the identifier of any other structure.
//   node scripts/check-known-lists.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {loadStabilityParts} from './lib/stability-world.mjs';
import {makeStableIds, loadPaokaoList, idsOfKey, PK_ID} from './lib/stable-keys.mjs';

// ---- the identifier logic on a made-up list
{
  const base = [{id: 'PK-1', name: 'Alpha'}, {id: 'PK-2', name: 'Beta'}, {id: 'PK-3', name: 'Beta'}, {id: 'PK-4', name: 'Gamma'}, {id: 'PKC-1', name: 'Alpha'}];
  const a = makeStableIds(base), tokens = ids => Object.fromEntries(ids.map(i => [base.find(p => p.id === i)?.name + '/' + i, a.token(i)]));
  assert.equal(a.token('PK-1'), 'PK:Alpha'); assert.equal(a.token('PKC-1'), 'PKC:Alpha'); assert.equal(a.token('PK-2'), 'PK:Beta#1'); assert.equal(a.token('PK-3'), 'PK:Beta#2'); assert.equal(a.token('PK-4-END'), 'PK:Gamma-END');
  assert.equal(a.token('FJ123'), 'FJ123'); assert.equal(a.token('PK-9'), null);
  assert.equal(a.id('PK:Beta#2'), 'PK-3'); assert.equal(a.id('PK:Nope'), null); assert.equal(a.id('FJ123'), 'FJ123');
  // two structures inserted in front and one removed: every other structure keeps its identifier
  const moved = [{id: 'PK-1', name: 'New one'}, {id: 'PK-2', name: 'Alpha'}, {id: 'PK-3', name: 'Beta'}, {id: 'PK-4', name: 'Beta'}, {id: 'PK-5', name: 'Gamma'}, {id: 'PKC-1', name: 'Alpha'}], b = makeStableIds(moved);
  for (const [was, now] of [['PK-1', 'PK-2'], ['PK-2', 'PK-3'], ['PK-3', 'PK-4'], ['PK-4', 'PK-5'], ['PKC-1', 'PKC-1']]) assert.equal(b.token(now), a.token(was), `${was} -> ${now}`);
  assert.equal(a.text('x|PK-2|PKC-1-END|FJ9'), 'x|PK:Beta#1|PKC:Alpha-END|FJ9');
}

// ---- the lists
const file = f => fileURLToPath(new URL('../' + f, import.meta.url)), read = f => JSON.parse(fs.readFileSync(file(f), 'utf8'));
const {parts} = loadStabilityParts(), ids = new Set(parts.map(p => p.id)), SK = makeStableIds(loadPaokaoList());
const bad = [];
const check = (list, key) => {
  for (const piece of String(key).split('|')) { if (PK_ID.test(piece)) bad.push(`${list}: "${key}" holds the numbered id ${piece}; write the structure name (PK:<name>) instead`); }
  for (const piece of idsOfKey(key)) {
    if (/^PKC?:/.test(piece)) { if (SK.id(piece.replace(/-END$/, '')) === null) bad.push(`${list}: "${key}" refers to ${piece}, which no structure has`); }
    else if (!ids.has(piece) && !ids.has(piece.replace(/-END$/, ''))) bad.push(`${list}: "${key}" refers to ${piece}, which does not exist`);
  }
};
const stability = read('docs/stability-known.json'), vessel = read('docs/vessel-motion-exceptions.json');
for (const k of Object.keys(stability.known)) check('stability-known', k);
for (const k of Object.keys(vessel.exceptions)) check('vessel-motion-exceptions', k);
for (const k of Object.keys(vessel.reasons ?? {})) check('vessel-motion-exceptions (reasons)', k);
for (const k of vessel.weightExceptions ?? []) check('vessel-motion-exceptions (weight)', k);
if (bad.length) { console.error(`Known-violation lists: ${bad.length} entr${bad.length === 1 ? 'y does' : 'ies do'} not point at an existing structure:\n - ${bad.slice(0, 40).join('\n - ')}`); process.exit(1); }
console.log(`PASS known-violation lists: ${Object.keys(stability.known).length} stability and ${Object.keys(vessel.exceptions).length} vessel entries all point at existing structures by stable identifier.`);
