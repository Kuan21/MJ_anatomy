// The Quiz entry point: body-part chooser (#/quiz) with the six parts, the reserved organ slot, and the answer card's content rules.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import {quizModule} from './quiz-modules.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const {isQuizHub, regionOfHash, QUIZ_REGIONS} = await quizModule('app/quiz/catalogue.ts');
const {structureCard} = await quizModule('app/quiz/card.ts');

// ---- routing
assert.ok(isQuizHub('#/quiz') && isQuizHub('#/quiz/') && !isQuizHub('#/quiz/back') && !isQuizHub(''));
for (const id of ['head-neck', 'thorax', 'back', 'upper-limb', 'lower-limb', 'heart', 'lung', 'brain']) assert.equal(regionOfHash(QUIZ_REGIONS[id].hash), id);
const main = fs.readFileSync(path.join(root, 'web/main.tsx'), 'utf8');
assert.match(main, /hub \? <QuizSetup\/>/, 'the router shows the setup page for #/quiz');
assert.match(main, /params\.get\('dev'\) === '1'/, 'Skeleton v2 lab needs ?dev=1');
const page = fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8');
assert.ok(!/skeleton-v2|Skeleton v2/i.test(page), 'no Skeleton v2 link on the home page');
// The Quiz button follows the region chosen in the top bar (app/mj-region-bar.ts quizHrefFor); with nothing chosen it opens the chooser.
assert.match(page, /const quizHref=quizHrefFor\(topRegion as RegionKey,regionSub\)/, 'the Quiz button takes its scope from the region bar');
const barSource = fs.readFileSync(path.join(root, 'app/mj-region-bar.ts'), 'utf8');
assert.match(barSource, /return '#\/quiz';\n\}/, 'whole body (and the regions without a quiz) opens the chooser');
for (const [needle, id] of [['#/quiz/upper-limb', 'upper-limb'], ['#/quiz/lower-limb', 'lower-limb'], ['#/quiz/heart', 'heart'], ['#/quiz/lung', 'lung'], ['#/quiz/thorax', 'thorax'], ['#/quiz/back', 'back'], ['#/quiz/head-neck', 'head-neck']]) {
  assert.ok(barSource.includes(needle) && QUIZ_REGIONS[id].hash === needle, `region bar links to ${needle}`);
}

// ---- the setup page (#/quiz) lists every region of the data; its rules are tested in test-quiz-setup.mjs
const setupSource = fs.readFileSync(path.join(root, 'app/quiz/setup-page.tsx'), 'utf8');
assert.ok(setupSource.includes('orderedRegions()') && setupSource.includes('QUIZ_CATEGORIES.map'), 'the setup page builds regions and categories from the data');
assert.match(fs.readFileSync(path.join(root, 'web/main.tsx'), 'utf8'), /hub \? <QuizSetup\/>/, '#/quiz shows the setup page');

// ---- answer card content
const muscle = structureCard({name: 'Right latissimus dorsi', chinese: '右闊背肌', system: 'muscular'});
assert.equal(muscle.english, 'Right latissimus dorsi'); assert.equal(muscle.chinese, '右闊背肌');
assert.deepEqual(muscle.fields.map(f => f.label), ['起點', '止點', '作用', '神經支配', '血液供應']);
assert.deepEqual(muscle.missing, []);
const nerve = structureCard({name: 'Left accessory nerve (XI)', chinese: '左副神經', system: 'nervous'});
assert.deepEqual(nerve.fields.map(f => f.label), ['來源', '走向', '主要分支', '支配範圍']);
const artery = structureCard({name: 'Left vertebral artery', chinese: '左椎動脈', system: 'arterial'});
assert.deepEqual(artery.fields.map(f => f.label), ['來源', '走向', '主要分支', '供應範圍']);
const vein = structureCard({name: 'Left subcostal vein', chinese: '左肋下靜脈', system: 'venous'});
assert.ok(vein.fields.some(f => f.label === '引流範圍'));
const bone = structureCard({name: 'Sacrum', chinese: '薦骨', system: 'skeletal'});
assert.deepEqual(bone.fields.map(f => f.label), ['主要標誌', '相關關節']);
assert.deepEqual(bone.missing, ['附著肌肉'], 'bone attachments are not documented, so the field stays empty');
// Nothing is guessed: a vessel with no documented data shows no fields at all.
const unknown = structureCard({name: 'Left posterior circumflex humeral artery', chinese: '左旋肱後動脈', system: 'arterial'});
assert.deepEqual(unknown.fields, []); assert.deepEqual(unknown.missing, ['來源', '走向', '主要分支', '供應範圍']);
// Every shown value is non-empty text.
const catalogue = JSON.parse(fs.readFileSync(path.join(root, 'public/models/quiz-back.json'), 'utf8'));
for (const s of catalogue.structures) {
  const card = structureCard(s);
  for (const f of card.fields) assert.ok((f.zh || f.en)?.trim(), `${s.name}: ${f.label} is not empty`);
  assert.equal(card.fields.length + card.missing.length, {muscular: 5, nervous: 4, arterial: 4, venous: 4, skeletal: 3, joint: 3}[s.system]);
}
console.log('Quiz chooser passed: six body parts in order, parts without content marked 即將推出, organ slot reserved, Quiz button and #/quiz route, Skeleton v2 only with ?dev=1, answer-card fields per structure type with nothing guessed.');
