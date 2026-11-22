// Data-card consistency: a structure's card must be of its own kind. Catches a card borrowed from another structure whose name it merely contains
// (the left circumflex scapular artery showing the scapula's bone card). Fails the build on any mismatch.
import fs from 'node:fs';
import {quizModule} from './quiz-modules.mjs';
const {normalizeAtlasSystems} = await quizModule('app/mj-system-classifier.ts');
const {structureProfile} = await quizModule('app/mj-structure-info.ts');
const {correctedPartName} = await quizModule('app/mj-part-regions.ts');
const atlas = normalizeAtlasSystems(JSON.parse(fs.readFileSync(new URL('../public/models/atlas.json', import.meta.url), 'utf8')));
const FAMILY = {Muscle: ['muscular', 'cardiac'], Nerve: ['nervous'], Bone: ['skeletal'], Vein: ['venous']};
const bad = [];
for (const p of atlas.parts) {
  const name = correctedPartName(p), card = structureProfile(name, p.system, {...p, name}), family = card.category.match(/^[A-Za-z]+/)?.[0], n = name.toLowerCase();
  const kind = /\b(artery|arteries)\b/.test(n) ? 'arterial' : /\bvein\b/.test(n) ? 'venous' : /\bnerve\b/.test(n) ? 'nervous' : /\bmuscle\b/.test(n) ? 'muscular' : null;
  if ((FAMILY[family] && !FAMILY[family].includes(p.system)) || (kind && kind !== p.system)) bad.push(`${p.id} ${name} [${p.system}] shows "${card.category}"`);
}
// Field names follow the kind of structure (muscle: origin / insertion / innervation / action; vessel: origin / course / [main branches] / territory; nerve: roots / course / supply;
// space: boundaries / location / contents) and no card shows an empty field.
{
  const zlib = await import('node:zlib'), stream = JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL('../public/models/paokao/paokao-stream.json.gz', import.meta.url)))), cards = JSON.parse(fs.readFileSync(new URL('../app/mj-paokao.json', import.meta.url), 'utf8'));
  const LABELS = {muscle: ['起點', '止點', '神經支配', '作用'], tendon: ['起點', '走向與通道', '止點', '功能'], artery: ['來源', '走向', '主要分支', '供應範圍'], vein: ['來源', '走向', '主要分支', '引流範圍'], nerve: ['神經根', '走向', '支配範圍'], space: ['邊界', '位置', '內容物'], organ: ['位置', '構造／毗鄰關係', '血液供應／神經'], gland: ['位置', '構造／毗鄰關係', '血液供應／神經'], landmark: ['所在骨骼', '描述', '附著構造', '相關構造']};
  for (const part of stream.parts) {
    const card = cards[part.id]; if (!card || !LABELS[card.kind]) continue;
    // A part of an abdominal organ (kind 'landmark' on a digestive or lymphatic organ, scripts/paokao-structures/abdomen-parts.mjs) is not a bone landmark: its card names the
    // organ and where the part lies (both required), then the fields of its card text (app/quiz/card-data.ts) and the model note. Bone landmarks keep their own fields.
    const organPart = card.kind === 'landmark' && (part.system === 'digestive' || part.system === 'lymphatic');
    const labels = organPart ? ['所在器官', '位置', '形態', '形態與附著', '組成', '毗鄰', '固定方式', '血液供應', '神經支配', '作用', '臨床意義', '模型'] : LABELS[card.kind];
    const profile = structureProfile(card.name, part.system, part), got = profile.facts.map(f => f.labelZh);
    const extra = got.filter(l => !labels.includes(l) && l !== '模型末端'), empty = profile.facts.filter(f => !f.valueEn || !f.valueZh).map(f => f.labelZh);
    if (extra.length || empty.length) bad.push(`${part.id} ${card.name} (${card.kind}) has fields ${got.join('／')}${empty.length ? '; empty: ' + empty.join('／') : ''}`);
    if (organPart) { if (!(got.includes('所在器官') && got.includes('位置'))) bad.push(`${part.id} ${card.name} must show its organ and where it lies`); }
    else if (card.kind === 'landmark' && !(got.includes('所在骨骼') && got.includes('描述'))) bad.push(`${part.id} ${card.name} must show its bone and a description`);
    if (card.kind === 'muscle' && got.length !== 4) bad.push(`${part.id} ${card.name} must show origin, insertion, innervation and action`);
  }
}
// No card of any structure of the runtime atlas shows a field without content (in either language): the build of every card drops them.
{
  const zlib = await import('node:zlib'), stream = JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL('../public/models/paokao/paokao-stream.json.gz', import.meta.url))));
  for (const p of [...atlas.parts, ...stream.parts]) {
    const name = correctedPartName(p), card = structureProfile(name, p.system, {...p, name}), empty = card.facts.filter(f => !(f.valueEn || '').trim() && !(f.valueZh || '').trim());
    if (empty.length) bad.push(`${p.id} ${name} shows empty field(s): ${empty.map(f => f.labelZh).join('／')}`);
  }
}
if (bad.length) { console.error(`${bad.length} data cards do not match their structure:\n - ${bad.slice(0, 20).join('\n - ')}`); process.exit(1); }
console.log(`Data cards OK: ${atlas.parts.length} structures show a card of their own kind.`);
