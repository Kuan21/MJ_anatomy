// The main atlas card also shows (1) the shared card text of the five temporomandibular joint structures (they come from the search index, not from the atlas meshes)
// and (2) the brain information card fields (public/models/brain/neuro-cards.json) of every main-atlas structure that has a brain card of the same name.
import fs from 'node:fs';
import zlib from 'node:zlib';
import {quizModule} from './quiz-modules.mjs';
const {structureProfile, cardExtraFor, brainCardIndex, withBrainCard} = await quizModule('app/mj-structure-info.ts');
const {CARD_EXTRAS} = await quizModule('app/quiz/card-data.ts');
const {normalizeAtlasSystems} = await quizModule('app/mj-system-classifier.ts');
const {correctedPartName} = await quizModule('app/mj-part-regions.ts');
const models = f => new URL('../public/models/' + f, import.meta.url);
const readGz = f => JSON.parse(zlib.gunzipSync(fs.readFileSync(models(f))));
const atlas = normalizeAtlasSystems(JSON.parse(fs.readFileSync(models('atlas.json'), 'utf8')));
const extras = readGz('search-extras.json.gz');
const cards = JSON.parse(fs.readFileSync(models('brain/neuro-cards.json'), 'utf8')).cards;
const index = brainCardIndex(cards);
const parts = [...atlas.parts, ...readGz('paokao/paokao-stream.json.gz').parts, ...['supplement/supplement-stream.json.gz', 'facial/facial-stream.json.gz', 'serous/serous-stream.json.gz', 'female/female-stream.json.gz'].flatMap(f => readGz(f).parts)];
const sideless = n => n.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/\s+/g, ' ').trim();
const bad = [];

// (1) temporomandibular joint: both sides of all five, from the search index, show every field of the shared card text.
const TMJ = ['articular disc of temporomandibular joint', 'articular capsule of temporomandibular joint', 'lateral temporomandibular ligament', 'sphenomandibular ligament', 'stylomandibular ligament'];
for (const base of TMJ) for (const side of ['Left', 'Right']) {
  const x = extras.find(e => e.n === `${side} ${base}`);
  if (!x) {bad.push(`${side} ${base}: not in the search index`); continue;}
  const card = structureProfile(x.n, x.s), extra = CARD_EXTRAS[base];
  for (const [label, v] of Object.entries(extra)) {
    const f = card.facts.find(y => y.labelZh === label);
    if (!f || f.valueZh !== v.zh) bad.push(`${x.n}: field ${label} is not the shared card text`);
  }
}

// (2) brain cards on the main atlas card.
let shown = 0, matched = 0;
const mainProfile = p => {const name = p.bounds ? correctedPartName(p) : p.name; return [name, p.bounds ? structureProfile(name, p.system, {...p, name}) : structureProfile(name, p.system)];};
for (const p of parts) {
  const [name, base] = mainProfile(p), key = sideless(name);
  const card = index.get(key);
  const out = withBrainCard(base, index);
  const labels = out.facts.map(f => f.labelZh);
  if (new Set(labels).size !== labels.length) bad.push(`${name}: a field appears twice (${labels.join('／')})`);
  const empty = out.facts.filter(f => !(f.valueEn || '').trim() && !(f.valueZh || '').trim());
  if (empty.length) bad.push(`${name}: empty field(s) ${empty.map(f => f.labelZh).join('／')}`);
  if (!card) {if (out !== base) bad.push(`${name}: changed although it has no brain card`); continue;}
  matched++;
  if (cardExtraFor(name)) {if (out !== base) bad.push(`${name}: has the shared card text and must not take a brain card too`); continue;}
  // every brain card field with text is on the card, either under its own label or as the field the profile already had
  for (const f of card.fields.filter(f => f.items.join('').trim())) {
    const own = out.facts.find(x => x.labelZh === f.label);
    if (own && own.valueZh !== f.items.join('').trim() && base.facts.some(x => x.labelZh === f.label)) continue;
    if (!own && !['分支', '供應範圍', '分布', '來源', '位置', '功能'].includes(f.label)) bad.push(`${name}: brain card field ${f.label} is missing`);
  }
  if (out !== base) shown++;
}
if (matched < 40) bad.push(`only ${matched} main-atlas structures match a brain card (expected about 58)`);
// a name with no brain card keeps exactly its own fields
const plain = structureProfile('Left Biceps brachii', 'muscular');
if (withBrainCard(plain, index) !== plain) bad.push('a structure without a brain card was changed');
if (bad.length) {console.error(`${bad.length} problems:\n - ${bad.slice(0, 30).join('\n - ')}`); process.exit(1);}
console.log(`TMJ and brain card text OK: 10 temporomandibular joint structures show the shared card text; ${matched} main-atlas structures match a brain card, ${shown} gain card fields.`);
