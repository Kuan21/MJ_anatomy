// Level 1 (name -> structure) and level 2 (structure -> name) share ONE question bank.
// For every region x section x category x side the two levels must hold the same questions; on a mismatch this fails and lists the structures that level 2 cannot ask.
//   node scripts/check-quiz-banks.mjs            check (CI)
//   node scripts/check-quiz-banks.mjs --write    rewrite docs/quiz-scope-counts.md
//   node scripts/check-quiz-banks.mjs --check    also fail when docs/quiz-scope-counts.md is stale
import fs from 'node:fs';
import {quizModule} from './quiz-modules.mjs';
const {QUIZ_REGIONS, QUIZ_CATEGORIES, questionPool, categoryOf} = await quizModule('app/quiz/catalogue.ts');
const {namingPool, exclusionOf, nameCounts} = await quizModule('app/quiz/level2.ts');
const reasons = {'no-chinese-name': '缺中文名', 'name-not-unique': '名稱與同範圍其他構造重複'};
const sides = ['right', 'left', 'both'], all = QUIZ_CATEGORIES.map(c => c.id);
const problems = [];
const rows = [];
let combos = 0;
for (const [id, def] of Object.entries(QUIZ_REGIONS)) {
  const catalogue = JSON.parse(fs.readFileSync(`public/models/${def.file}`, 'utf8')), counts = nameCounts(catalogue);
  const row = {id, label: def.label, cells: {}};
  for (const section of def.sections) for (const category of [...all, 'all']) for (const side of sides) {
    const settings = {section: section.id, side, systems: [], categories: category === 'all' ? all : [category], count: 9999};
    const one = questionPool(catalogue, settings), two = namingPool(catalogue, settings);
    combos++;
    if (section.id === 'all' && side === 'both') row.cells[category] = [one.length, two.length];
    if (one.length !== two.length) {
      const have = new Set(two.map(s => s.id));
      for (const s of one) if (!have.has(s.id)) problems.push(`${def.label} / ${section.label} / ${category} / ${side}: 第二級缺 ${s.name}${s.chinese ? `（${s.chinese}）` : ''} — ${reasons[exclusionOf(s, counts)] ?? '原因不明'}`);
      problems.push(`${def.label} / ${section.label} / ${category} / ${side}: 第一級 ${one.length} 題，第二級 ${two.length} 題`);
    }
    if (category !== 'all') for (const s of one) if (categoryOf(s) !== category) problems.push(`${def.label}: ${s.name} is not in category ${category}`);
  }
  // every structure with a question belongs to exactly one category
  const asked = catalogue.structures.filter(s => s.sections.length);
  const sum = all.reduce((n, c) => n + asked.filter(s => categoryOf(s) === c).length, 0);
  if (sum !== asked.length) problems.push(`${def.label}: categories do not partition the questions`);
  rows.push(row);
}
const names = Object.fromEntries(QUIZ_CATEGORIES.map(c => [c.id, c.label]));
const table = ['| 部位 | ' + [...all, 'all'].map(c => c === 'all' ? '合計' : names[c]).join(' | ') + ' |', '| --- |' + ' --- |'.repeat(all.length + 1),
  ...rows.map(r => `| ${r.label} | ${[...all, 'all'].map(c => { const [a, b] = r.cells[c]; return a === 0 && b === 0 ? '—' : `${a} / ${b}`; }).join(' | ')} |`)];
const doc = ['# Quiz 題目範圍：各部位 × 題目類別的題數（第一級 / 第二級）', '', '此檔由 `node scripts/check-quiz-banks.mjs --write` 產生，請勿手改。範圍為「全部部位、雙側」；格內為「第一級題數 / 第二級題數」，「—」表示此範圍暫無題目（模型中沒有這類構造，不編造）。', '',
  ...table, '', `共比對 ${combos} 種「部位區段 × 類別 × 左右側」組合，第一級與第二級${problems.length ? '不一致' : '題數與題目完全相同'}。`, ''].join('\n');
if (problems.length) {console.error('Quiz level 1 / level 2 question banks differ:\n' + [...new Set(problems)].slice(0, 80).join('\n')); process.exit(1);}
if (process.argv.includes('--write')) {fs.writeFileSync('docs/quiz-scope-counts.md', doc); console.log('wrote docs/quiz-scope-counts.md');}
else if (process.argv.includes('--check') && (!fs.existsSync('docs/quiz-scope-counts.md') || fs.readFileSync('docs/quiz-scope-counts.md', 'utf8') !== doc)) {console.error('docs/quiz-scope-counts.md is stale: run node scripts/check-quiz-banks.mjs --write'); process.exit(1);}
console.log(`Quiz banks passed: level 1 and level 2 hold the same questions in ${combos} region x category x side combinations.`);
console.log(table.join('\n'));
