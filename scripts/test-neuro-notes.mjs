// The notes' info cards: every structure of the notes is either a card, merged into one, or dropped with a reason; no card is blank.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const notes = JSON.parse(fs.readFileSync(new URL('docs/neuro-notes.json', root), 'utf8'));
const cur = JSON.parse(fs.readFileSync(new URL('docs/neuro-notes-curation.json', root), 'utf8'));
const data = JSON.parse(fs.readFileSync(new URL('public/models/brain/neuro-cards.json', root), 'utf8'));
const ids = new Set(data.cards.map(c => c.id));
assert.equal(ids.size, data.cards.length, 'card ids are unique');
let dropped = 0, merged = 0;
for (const s of notes.structures) {
  const id = s.id.replace('neuro-', ''), e = cur.entries[s.id];
  assert.ok(e, `${s.id} is in the curation`);
  if (e.drop) {dropped++; assert.ok(e.drop.length > 4, `${s.id} dropped with a reason`); continue;}
  if (e.merge) {merged++; assert.ok(ids.has(e.merge) || cur.entries['neuro-' + e.merge]?.merge, `${s.id} merges into a card`); continue;}
  assert.ok(ids.has(id), `${s.id} ${s.zh} became a card`);
}
const CJK = /[㐀-鿿]/;
for (const c of data.cards) {
  assert.ok(c.en && c.zh && CJK.test(c.zh), `${c.id}: has an English and a Chinese name`);
  assert.ok(c.fields.length > 0 || c.noBody, `${c.id} ${c.zh}: not blank (a body or an explicit "no body in the notes" notice)`);
  assert.ok(data.regions[c.region], `${c.id}: known region`);
  assert.ok(c.sources.length || c.noBody, `${c.id}: source pages (or an explicit no-body notice)`);
  for (const f of c.fields) for (const x of f.items) assert.ok(x.t && x.s, `${c.id}: every sentence has its source page`);
}
// the notes' own marker for structures with no body text must survive
const noBody = notes.structures.filter(s => s.note && !cur.entries[s.id].drop && !cur.entries[s.id].merge).map(s => s.id.replace('neuro-', ''));
for (const id of noBody) assert.ok(data.cards.find(c => c.id === id)?.noBody || data.cards.find(c => c.id === id)?.fields.length, `${id}: flagged note-only structure is still a card`);
// partCards only points at real cards
for (const [part, list] of Object.entries(data.partCards)) for (const id of list) assert.ok(ids.has(id), `${part} → ${id}`);
console.log(`Neuro notes passed: ${data.cards.length} cards from ${notes.structures.length} extracted structures (${merged} merged, ${dropped} dropped with a reason); none blank.`);
