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
for (const id of ['thorax', 'back', 'upper-limb', 'lower-limb']) assert.equal(regionOfHash(QUIZ_REGIONS[id].hash), id);
const main = fs.readFileSync(path.join(root, 'web/main.tsx'), 'utf8');
assert.match(main, /hub \? <QuizHub\/>/, 'the router shows the chooser for #/quiz');
assert.match(main, /params\.get\('dev'\) === '1'/, 'Skeleton v2 lab needs ?dev=1');
const page = fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8');
assert.ok(!/skeleton-v2|Skeleton v2/i.test(page), 'no Skeleton v2 link on the home page');
assert.match(page, /const quizHref='#\/quiz'/, 'the Quiz button always opens the chooser');

// ---- the chooser page
const jsx = (type, props) => ({type, props: props ?? {}});
const react = {useEffect() {}};
const external = {react, 'react/jsx-runtime': {jsx, jsxs: jsx, Fragment: 'fragment'}, 'lucide-react': Object.fromEntries(['ArrowLeft', 'ChevronRight', 'Lock', 'Target'].map(n => [n, n]))};
const cache = new Map();
async function moduleFor(key) {
  if (cache.has(key)) return cache.get(key);
  const exports = key.endsWith('.css') ? {} : external[key];
  let mod;
  if (exports) mod = new vm.SyntheticModule(Object.keys(exports), function () {for (const [n, v] of Object.entries(exports)) this.setExport(n, v);});
  else mod = new vm.SourceTextModule(ts.transpileModule(fs.readFileSync(key, 'utf8'), {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX}}).outputText, {identifier: key});
  cache.set(key, mod); return mod;
}
const link = async (spec, ref) => {let key = spec; if (spec.startsWith('.')) {key = path.resolve(path.dirname(ref.identifier), spec); if (!fs.existsSync(key)) key += '.ts';} return moduleFor(key);};
const hub = await moduleFor(path.join(root, 'app/quiz/hub.tsx')); await hub.link(link); await hub.evaluate();
const tree = hub.namespace.default();
const all = n => Array.isArray(n) ? n.flatMap(all) : !n || typeof n !== 'object' ? [] : [n, ...all(n.props?.children)];
const text = n => Array.isArray(n) ? n.map(text).join('') : n == null || typeof n === 'boolean' ? '' : typeof n !== 'object' ? String(n) : text(n.props?.children);
const cards = all(tree).filter(n => n.props?.['data-part']);
assert.deepEqual(cards.map(c => c.props['data-part']), ['head', 'neck', 'thorax', 'back', 'upper-limb', 'lower-limb', 'organs'], 'six body parts, then the reserved organ slot');
for (const part of ['thorax', 'back', 'upper-limb', 'lower-limb']) {
  const card = cards.find(c => c.props['data-part'] === part);
  assert.equal(card.type, 'a'); assert.equal(card.props.href, QUIZ_REGIONS[part].hash);
}
for (const part of ['head', 'neck', 'organs']) {
  const card = cards.find(c => c.props['data-part'] === part);
  assert.notEqual(card.type, 'a', `${part} is not a link yet`); assert.equal(card.props['aria-disabled'], 'true'); assert.match(text(card), /即將推出/);
}
for (const label of ['頭部', '頸部', '胸腔', '背部', '上肢', '下肢']) assert.ok(text(tree).includes(label), label);
assert.ok(all(tree).some(n => n.type === 'a' && n.props.href === '#/' ), 'a way back to the atlas');

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
  assert.equal(card.fields.length + card.missing.length, {muscular: 5, nervous: 4, arterial: 4, venous: 4, skeletal: 3}[s.system]);
}
console.log('Quiz chooser passed: six body parts in order, parts without content marked 即將推出, organ slot reserved, Quiz button and #/quiz route, Skeleton v2 only with ?dev=1, answer-card fields per structure type with nothing guessed.');
