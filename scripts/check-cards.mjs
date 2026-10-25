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
if (bad.length) { console.error(`${bad.length} data cards do not match their structure:\n - ${bad.slice(0, 20).join('\n - ')}`); process.exit(1); }
console.log(`Data cards OK: ${atlas.parts.length} structures show a card of their own kind.`);
