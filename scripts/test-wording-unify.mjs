// Wording unified across the site (HN-06, HN-07, HN-19):
//   - jaw and palate are written 頜／顎 everywhere the site shows a name; 頷／腭 survive only as search and typed-answer aliases;
//   - brain Quiz English names continue in lower case after Left／Right ("Left lateral sulcus"), acronyms and possessives excepted;
//   - the CSF page uses the same words as the brain model and the main atlas (中腦導水管, 蛛網膜…), the other spelling stays searchable;
//   - the old spellings still find the structures.
// Prints pass/fail and counts only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';
import {quizModule} from './quiz-modules.mjs';

const root = new URL('../', import.meta.url), rootPath = path.resolve(root.pathname);
const OLD = /[頷腭]/;

// 1. no old spelling in anything the site shows (source strings and generated data); alias tables and character-fold maps are the allowed places
const ALLOWED = new Set(['app/mj-head-neck-names.json', 'app/mj-head-neck-names.ts', 'app/mj-required-names.json', 'app/mj-related-' + 'search.json', 'app/mj-search.ts', 'app/quiz/naming.ts']);
const walk = d => fs.readdirSync(d, {withFileTypes: true}).flatMap(e => e.name === 'node_modules' || e.name.startsWith('.') ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
let scanned = 0;
for (const dir of ['app', 'components', 'lib', 'public', 'dist']) {
  const base = path.join(rootPath, dir);
  if (!fs.existsSync(base)) continue;
  for (const f of walk(base)) {
    const rel = path.relative(rootPath, f);
    if (ALLOWED.has(rel) || !/\.(ts|tsx|json|json\.gz|js|css|html|md|txt)$/.test(f)) continue;
    let text = f.endsWith('.gz') ? gunzipSync(fs.readFileSync(f)).toString('utf8') : fs.readFileSync(f, 'utf8');
    scanned++;
    // the bundled copy of app/quiz/naming.ts (an allowed file above) carries its simplified-to-traditional fold table as one string literal; skip only that literal in dist
    if (rel.startsWith('dist/') && f.endsWith('.js')) text = text.replace(/(["'`])(?:(?!\1)[^\\\n]|\\.)*侧側(?:(?!\1)[^\\\n]|\\.)*\1/g, '');
    if (rel === 'app/mj-naming-data.ts') text = text.replace(/fixes:.*$/m, ''); // the fix table itself names the old spellings
    const m = OLD.exec(text);
    assert.ok(!m, `${rel}: old spelling 頷／腭 near 「${m && text.slice(Math.max(0, m.index - 8), m.index + 8)}」`);
  }
}
{ // the names table: displayed names are clean; the old spelling is only in zhAliases
  const rows = JSON.parse(fs.readFileSync(new URL('app/mj-head-neck-names.json', root), 'utf8')).rows;
  for (const r of rows) for (const e of r.entries) assert.ok(!OLD.test(e.zh) && !e.enAliases.some(a => OLD.test(a)), `row ${r.id}: displayed name uses the old spelling`);
}

// 2. brain Quiz English names after Left／Right
const {displayEn} = await quizModule('app/organ/brain-catalogue.ts');
const part = (en, side) => ({en, side});
assert.equal(displayEn(part('Lateral sulcus', 'left')), 'Left lateral sulcus');
assert.equal(displayEn(part('Pons', 'right')), 'Right pons');
assert.equal(displayEn(part('Lat Fis-post', 'left')), 'Left lateral sulcus (posterior ramus)');
assert.equal(displayEn(part("Broca's area", 'left')), "Left Broca's area");
assert.equal(displayEn(part('CA1 field', 'right')), 'Right CA1 field');
assert.equal(displayEn(part('Pons', 'mid')), 'Pons', 'a midline structure keeps its capital');
let brainNames = 0;
const quizFile = new URL('public/models/quiz-brain.json', root);
if (fs.existsSync(quizFile)) for (const s of JSON.parse(fs.readFileSync(quizFile, 'utf8')).structures) {
  const m = /^(?:Left|Right) (.)(.?)/.exec(s.name);
  if (!m) continue;
  brainNames++;
  assert.ok(!/[A-Z]/.test(m[1]) || /[A-Z0-9]/.test(m[2]), `brain Quiz name 「${s.name}」 should continue in lower case after Left／Right`);
}
assert.ok(brainNames > 300 || !fs.existsSync(quizFile), `only ${brainNames} brain names checked`);

// 3. CSF page wording
const csf = ['app/organ/csf-notes.ts', 'app/organ/csf-scene.ts'].map(f => fs.readFileSync(new URL(f, root), 'utf8')).join('\n');
assert.ok(!/中腦導水管|蜘蛛膜/.test(csf), 'CSF page: 中腦導水管（HN-11 改為必考清單用詞）／蜘蛛膜 must not appear');
assert.ok(/大腦導水管/.test(csf) && /蛛網膜下腔/.test(csf) && /蛛網膜顆粒/.test(csf), 'CSF page uses 大腦導水管、蛛網膜下腔、蛛網膜顆粒');
const brainZh = fs.readFileSync(new URL('app/mj-zh-extra.ts', root), 'utf8');
assert.ok(brainZh.includes("'cerebral aqueduct':'大腦導水管'"), 'the model name of the aqueduct is 大腦導水管');

// 4. old spellings still search
const {chineseMatches} = await quizModule('app/mj-search.ts');
for (const [shown, typed] of [['頜下腺', '頷下腺'], ['頜下腺', '下頷下腺'], ['左顎咽肌', '腭咽肌'], ['右提顎帆肌', '提腭帆肌'], ['左翼下頜縫', '翼下頷縫'], ['左下頜神經前股', '下頷神經前股'], ['上頜竇', '上頷竇'], ['蛛網膜下腔', '蜘蛛膜下腔'], ['蛛網膜顆粒', '蜘蛛膜顆粒'], ['上頜神經', '上頷神經'], ['顎', '腭']]) {
  assert.ok(chineseMatches(shown, typed), `search 「${typed}」 should find 「${shown}」`);
  assert.ok(chineseMatches(shown, shown), `search 「${shown}」 finds itself`);
}
console.log(`wording unified: ${scanned} files without 頷／腭, ${brainNames} brain Quiz names, CSF page, search aliases pass`);
