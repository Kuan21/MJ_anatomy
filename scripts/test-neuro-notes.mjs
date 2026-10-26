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
  assert.ok(c.fields.length > 0, `${c.id} ${c.zh}: has a card text (docs/neuro-card-text/)`);
  assert.ok(data.regions[c.region], `${c.id}: known region`);
  for (const f of c.fields) { assert.ok(f.label && f.items.length, `${c.id}: every field has a label and sentences`); for (const x of f.items) assert.equal(typeof x, 'string', `${c.id}: sentences are plain text`); }
}
// the site never shows the notes: no source pages, no mention of the notes in the public file
const publicText = JSON.stringify(data);
assert.ok(!/[0-9]{4} ?p\.[0-9]|共筆|筆記|跑考|M65|CM57|\"sources\"|\"noBody\"/.test(publicText), 'neuro-cards.json carries no note citations or note wording');
// every written text belongs to a card, and none of it is copied from the notes: no run of 16 characters of a card text appears in the notes' sentences
const cardIds = new Set(data.cards.map(c => c.id));
const texts = {};
for (const f of fs.readdirSync(new URL('docs/neuro-card-text/', root)).filter(f => f.endsWith('.json'))) Object.assign(texts, JSON.parse(fs.readFileSync(new URL('docs/neuro-card-text/' + f, root), 'utf8')));
for (const id of Object.keys(texts)) assert.ok(cardIds.has(id), `docs/neuro-card-text has a text for ${id}, which is not a card`);
const tidy = s => s.replace(/\s+/g, '').replace(/[，。；、：（）()\-—「」]/g, '');
const noteText = tidy(notes.lectures.flatMap(l => l.pages.map(p => p.text)).join(''));
const copied = [];
for (const [id, fields] of Object.entries(texts)) for (const [label, items] of fields) for (const item of items) {
  const t = tidy(item);
  for (let i = 0; i + 16 <= t.length; i += 4) if ((t.slice(i, i + 16).match(/[㐀-鿿]/g) ?? []).length >= 10 && noteText.includes(t.slice(i, i + 16))) { copied.push(`${id} ${label}: …${t.slice(i, i + 16)}…`); break; }
}
assert.equal(copied.length, 0, `card texts must be in our own words; 16 characters in a row also appear in the notes:\n${copied.join('\n')}`);
// partCards only points at real cards
for (const [part, list] of Object.entries(data.partCards)) for (const id of list) assert.ok(ids.has(id), `${part} → ${id}`);
console.log(`Neuro notes passed: ${data.cards.length} cards from ${notes.structures.length} extracted structures (${merged} merged, ${dropped} dropped with a reason); none blank.`);
