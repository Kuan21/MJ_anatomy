// The main atlas card and the quiz / learning card share one card text (app/quiz/card-data.ts): a structure that has card text shows it on the main atlas,
// left and right alike; a structure without card text shows no field it does not have (no empty rows, nothing invented).
import fs from 'node:fs';
import zlib from 'node:zlib';
import {quizModule} from './quiz-modules.mjs';
const {structureProfile, cardExtraFor} = await quizModule('app/mj-structure-info.ts');
const {CARD_EXTRAS} = await quizModule('app/quiz/card-data.ts');
const {normalizeAtlasSystems} = await quizModule('app/mj-system-classifier.ts');
const {correctedPartName} = await quizModule('app/mj-part-regions.ts');
const atlas = normalizeAtlasSystems(JSON.parse(fs.readFileSync(new URL('../public/models/atlas.json', import.meta.url), 'utf8')));
const stream = JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL('../public/models/paokao/paokao-stream.json.gz', import.meta.url))));
const readGz = f => JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL('../public/models/' + f, import.meta.url))));
const {cleanMeshName} = await quizModule('app/mj-naming.ts');
// The peripheral and cranial nerve overlay names its cards from the cleaned mesh name (Left Oculomotor nerve (III)); the other streams carry their own part names.
const nerveParts = JSON.parse(fs.readFileSync(new URL('../public/models/nerve-stream.json', import.meta.url), 'utf8')).chunks.flatMap(c => c.meshes).map((m, i) => ({id: `nerve:${i}`, name: cleanMeshName(m.name), system: 'nervous'}));
const neckVessels = readGz('neck-vessels.json.gz').vessels.map((v, i) => ({id: `neck:${i}`, name: cleanMeshName(v.name), system: v.system ?? (/vein/i.test(v.name) ? 'venous' : 'arterial')}));
// The search index also lists structures that are not atlas meshes (joint ligaments, capsules); their cards open from there.
const searchExtras = readGz('search-extras.json.gz').filter(x => x.k === 'joint').map((x, i) => ({id: `extra:${i}`, name: x.n, system: x.s}));
const parts = [...searchExtras, ...atlas.parts, ...stream.parts, ...nerveParts, ...neckVessels, ...['supplement/supplement-stream.json.gz', 'facial/facial-stream.json.gz', 'serous/serous-stream.json.gz', 'female/female-stream.json.gz'].flatMap(f => readGz(f).parts)];
const bad = [];
const sideless = n => n.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/\s+/g, ' ').trim();
const nameOf = p => p.bounds ? correctedPartName(p) : p.name;
const profileOf = p => {const name = nameOf(p); return p.bounds ? structureProfile(name, p.system, {...p, name}) : structureProfile(name, p.system);};

let shown = 0; const hit = new Set();
for (const p of parts) {
  const name = nameOf(p), card = profileOf(p), extra = cardExtraFor(name);
  const empty = card.facts.filter(f => !(f.valueEn || '').trim() && !(f.valueZh || '').trim());
  if (empty.length) bad.push(`${name}: empty field(s) ${empty.map(f => f.labelZh).join('／')}`);
  if (!extra) continue;
  shown++; hit.add(CARD_EXTRAS[name.toLowerCase()] ? name.toLowerCase() : sideless(name));
  for (const [label, v] of Object.entries(extra)) {
    const f = card.facts.find(x => x.labelZh === label);
    if (!f || f.valueZh !== v.zh || (v.en && f.valueEn !== v.en)) bad.push(`${name}: field ${label} is not the shared card text`);
  }
  const labels = card.facts.map(f => f.labelZh);
  if (new Set(labels).size !== labels.length) bad.push(`${name}: a field appears twice (${labels.join('／')})`);
}
const missing = Object.keys(CARD_EXTRAS).filter(k => !hit.has(k));

// Samples: the structures the report names, left and right alike, and a structure with no card text.
const find = re => parts.filter(p => re.test(nameOf(p)));
for (const [re, label, text] of [
  [/^(?:left |right )?superior pharyngeal constrictor$/i, '起點', CARD_EXTRAS['superior pharyngeal constrictor']['起點'].zh],
  [/^(?:left |right )?thyroid cartilage$/i, '位置', CARD_EXTRAS['thyroid cartilage']['位置']?.zh],
  [/^(?:left |right )?lacrimal gland$/i, '位置', CARD_EXTRAS['lacrimal gland']['位置']?.zh],
]) {
  const found = find(re);
  if (!found.length) {bad.push(`sample ${re} not in the atlas`); continue;}
  for (const p of found) {
    const f = profileOf(p).facts.find(x => x.labelZh === label);
    if (!f || (text && f.valueZh !== text)) bad.push(`sample ${nameOf(p)}: ${label} is missing or differs from the quiz card`);
  }
  if (re.source.includes('pharyngeal') || re.source.includes('lacrimal')) {
    const sides = new Set(found.map(p => nameOf(p).split(' ')[0].toLowerCase()));
    if (found.length > 1 && !(sides.has('left') && sides.has('right'))) bad.push(`sample ${re}: left and right are not both found`);
  }
}
// A structure with no card text keeps exactly its own fields.
const plain = parts.filter(p => !cardExtraFor(nameOf(p))).slice(0, 400);
for (const p of plain) {
  const card = profileOf(p), name = nameOf(p);
  if (card.facts.some(f => f.labelZh === '組成' || f.labelZh === '毗鄰')) bad.push(`${name}: shows a card field it has no text for`);
}
if (bad.length) {console.error(`${bad.length} problems:\n - ${bad.slice(0, 30).join('\n - ')}`); process.exit(1);}
console.log(`Main card text OK: ${shown} atlas structures show the shared card text (${hit.size}/${Object.keys(CARD_EXTRAS).length} card entries reach the main atlas${missing.length ? '; no atlas structure of that name: ' + missing.length : ''}).`);
if (process.env.VERBOSE) console.log(missing.join('\n'));
