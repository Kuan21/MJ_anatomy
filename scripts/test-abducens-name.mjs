// The sixth cranial nerve is shown as 外旋神經 everywhere; 外展神經 stays searchable as an alias (the alias table of app/mj-search.ts,
// which the brain detail mode's search also uses). Prints pass/fail only.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const files = [];
const walk = dir => { for (const e of fs.readdirSync(dir, {withFileTypes: true})) { const f = path.join(dir, e.name); if (e.isDirectory()) walk(f); else if (/\.(ts|tsx)$/.test(e.name)) files.push(f); } };
walk(path.join(root, 'app'));
// shown names: every mention outside the alias table uses 外旋神經
const stray = files.filter(f => fs.readFileSync(f, 'utf8').split('\n').some(line => line.includes('外展神經') && !/ALIASES|又稱外展神經/.test(line)));
assert.deepEqual(stray.map(f => path.relative(root, f)), [], 'a file still shows the other spelling');
const {CRANIAL_NERVES} = await quizModule('app/mj-cranial-search.ts');
assert.equal(CRANIAL_NERVES.find(c => c.n === 6).zh, '外旋神經');
const {chineseMatches} = await quizModule('app/mj-search.ts');
const {zhExtra} = await quizModule('app/mj-zh-extra.ts');
const shown = zhExtra('abducens nerve (vi)')?.zh ?? '';
assert.ok(shown.includes('外旋神經'), 'atlas name of the abducens nerve');
for (const name of [shown, '左' + shown, '外旋神經核']) {
  assert.ok(chineseMatches(name, '外展神經'), `外展神經 does not find ${name}`);
  assert.ok(chineseMatches(name, '外旋神經'), `外旋神經 does not find ${name}`);
}
assert.ok(/chineseMatches\(p\.zh/.test(fs.readFileSync(path.join(root, 'app/organ/brain.tsx'), 'utf8')), 'the brain detail search does not use the alias table');
console.log('Abducens name OK: 外旋神經 shown, 外展神經 searchable.');
