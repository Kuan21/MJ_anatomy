// A structure with no card text shows 「資料整理中」 in the learn step of the guided lessons (not a list of empty fields),
// and is still asked in the name questions of levels 1 and 3. No card text is written here.
// The check does not depend on how many structures of the real data are still blank: real blanks are checked when there are any,
// and a test-only structure without card text is always checked, so finishing all the card text can never fail this test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';
import {quizModule} from './quiz-modules.mjs';
const {QUIZ_REGIONS, QUIZ_CATEGORIES, questionPool} = await quizModule('app/quiz/catalogue.ts');
const {namingPool} = await quizModule('app/quiz/level2.ts');
const {structureCard} = await quizModule('app/quiz/card.ts');
fs.mkdirSync('.sites-runtime', {recursive: true});
const out = '.sites-runtime/learn-info.test.mjs';
await build({entryPoints: ['app/quiz/learn-info.tsx'], bundle: true, format: 'esm', platform: 'node', outfile: out, jsx: 'automatic', external: ['react', 'react/jsx-runtime'], logLevel: 'silent', loader: {'.json': 'json'}});
const {LearnInfo} = await import(pathToFileURL(out).href + `?t=${Date.now()}`);
const all = QUIZ_CATEGORIES.map(c => c.id), settings = {section: 'all', side: 'both', systems: [], categories: all, count: 9999, scope: 'all'};
let blankCount = 0, withText = 0, askedBlank = 0;
for (const def of Object.values(QUIZ_REGIONS)) {
  const catalogue = JSON.parse(fs.readFileSync(`public/models/${def.file}`, 'utf8'));
  const l1 = new Set(questionPool(catalogue, settings, 1).map(s => s.id)), l3 = new Set(namingPool(catalogue, settings).map(s => s.id));
  let asked1 = 0, asked3 = 0, blanks = 0;
  for (const s of catalogue.structures) {
    const blank = structureCard(s).fields.length === 0, html = renderToStaticMarkup(createElement(LearnInfo, {structure: s}));
    if (!blank) {withText++; assert.ok(!html.includes('資料整理中') && !html.includes('尚無資料'), `${s.name}: has card text but shows the pending line`); continue;}
    blankCount++; blanks++;
    assert.ok(html.includes('資料整理中') && html.includes('Content being prepared'), `${s.name}: no card text, the learn step must say 資料整理中`);
    assert.ok(!html.includes('尚無資料'), `${s.name}: the learn step still shows empty fields`);
    if (l1.has(s.id)) asked1++;
    if (l3.has(s.id)) asked3++;
  }
  askedBlank += asked1 + asked3;
  // the banks are not filtered by card text: structures without card text stay in the name questions of levels 1 and 3
  if (def.id === 'head-neck') assert.ok(asked1 === blanks && asked3 === blanks, `head-neck: ${blanks} structures without card text, asked in level 1: ${asked1}, level 3: ${asked3}`);
}
assert.ok(withText > 0, 'the real data has structures with card text');

// ---- a test-only structure without card text (does not depend on the real data having any blank structure)
{
  const def = QUIZ_REGIONS['head-neck'], real = JSON.parse(fs.readFileSync(`public/models/${def.file}`, 'utf8'));
  const template = real.structures.find(s => (s.availability?.levels ?? [1, 3]).includes(1) && (s.availability?.levels ?? [1, 3]).includes(3) && s.availability?.exam !== false) ?? real.structures[0];
  const fake = {...template, id: 'test-only-no-card', name: 'Test only structure without card text', chinese: '測試用無資料構造', aliases: undefined, synonyms: undefined};
  assert.equal(structureCard(fake).fields.length, 0, 'the test-only structure has no card text');
  const html = renderToStaticMarkup(createElement(LearnInfo, {structure: fake}));
  assert.ok(html.includes('資料整理中') && html.includes('Content being prepared') && !html.includes('尚無資料'), 'the learn step says 資料整理中 for a structure without card text');
  const catalogue = {...real, structures: [...real.structures, fake]};
  assert.ok(questionPool(catalogue, settings, 1).some(s => s.id === fake.id), 'a structure without card text is still asked in level 1');
  assert.ok(namingPool(catalogue, settings).some(s => s.id === fake.id), 'a structure without card text is still asked in level 3');
}
const src = fs.readFileSync('app/quiz/learn.tsx', 'utf8');
assert.ok(/know \? <>[\s\S]*?<AnswerCard structure=\{target\} lesson\/>/.test(src), 'the get-to-know step shows the card in lesson mode (a structure without text shows the pending line)');
console.log(`quiz lesson pending line: ok (${blankCount} structures without card text, ${withText} with)`);
