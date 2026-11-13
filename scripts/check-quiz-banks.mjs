// Level 1 (name -> structure) and level 3 (structure -> name) share ONE question bank, and level 2 (guided lessons) draws from that same bank.
// For every region x section x category x side the levels must hold the same questions; on a mismatch this fails and lists the structures that level 3 cannot ask.
//   node scripts/check-quiz-banks.mjs            check (CI)
//   node scripts/check-quiz-banks.mjs --write    rewrite docs/quiz-scope-counts.md
//   node scripts/check-quiz-banks.mjs --check    also fail when docs/quiz-scope-counts.md is stale
import fs from 'node:fs';
import {quizModule} from './quiz-modules.mjs';
const {QUIZ_REGIONS, QUIZ_CATEGORIES, questionPool, categoryOf, askedAtLevel, inLessons} = await quizModule('app/quiz/catalogue.ts');
const {namingPool, exclusionOf, nameCounts} = await quizModule('app/quiz/level2.ts');
const {buildLessons} = await quizModule('app/quiz/lessons.ts');
const reasons = {'no-chinese-name': '缺中文名', 'name-not-unique': '名稱與同範圍其他構造重複'};
const sides = ['right', 'left', 'both'], all = QUIZ_CATEGORIES.map(c => c.id);
const problems = [];
const rows = [], flagged = [];
let combos = 0;
for (const [id, def] of Object.entries(QUIZ_REGIONS)) {
  const catalogue = JSON.parse(fs.readFileSync(`public/models/${def.file}`, 'utf8')), counts = nameCounts(catalogue);
  const row = {id, label: def.label, cells: {}};
  for (const s of catalogue.structures) if (s.availability) flagged.push(`${s.name}（${def.label}，只開放第${s.availability.levels.map(l => l === 1 ? '一' : '三').join('、')}級）`);
  for (const section of def.sections) for (const category of [...all, 'all']) for (const side of sides) {
    const settings = {section: section.id, side, systems: [], categories: category === 'all' ? all : [category], count: 9999};
    const one = questionPool(catalogue, settings), two = namingPool(catalogue, settings);
    combos++;
    if (section.id === 'all' && side === 'both') row.cells[category] = [one.length, two.length];
    // The levels hold the same questions, with ONE allowed difference: the structures whose availability (app/organ/brain-overrides.ts, field `availability` of the catalogue) leaves level 1 out.
    // Level 3 must ask exactly level 1's questions plus those; nothing else may differ.
    const flaggedTwo = two.filter(s => !askedAtLevel(s, 1)), have = new Set(two.map(s => s.id)), haveOne = new Set(one.map(s => s.id));
    for (const s of one) if (!have.has(s.id)) problems.push(`${def.label} / ${section.label} / ${category} / ${side}: 第三級缺 ${s.name}${s.chinese ? `（${s.chinese}）` : ''} — ${reasons[exclusionOf(s, counts)]}`);
    for (const s of two) if (!haveOne.has(s.id) && askedAtLevel(s, 1)) problems.push(`${def.label} / ${section.label} / ${category} / ${side}: 第一級缺 ${s.name}，且沒有 availability 旗標`);
    for (const s of one) if (!askedAtLevel(s, 1)) problems.push(`${def.label}: 第一級題庫含有旗標限制的 ${s.name}`);
    if (two.length !== one.length + flaggedTwo.length) problems.push(`${def.label} / ${section.label} / ${category} / ${side}: 第一級 ${one.length} 題，第三級 ${two.length} 題，相差 ${two.length - one.length}，旗標構造 ${flaggedTwo.length} 個`);
    // level 2 (lessons): the lessons of this scope hold exactly the questions of the shared bank that the lessons take (availability.lessons), each in one lesson
    const lessonIds = buildLessons(catalogue, settings).flatMap(l => l.ids), lessonPool = two.filter(inLessons);
    if (new Set(lessonIds).size !== lessonIds.length || lessonIds.length !== lessonPool.length || !lessonPool.every(s => lessonIds.includes(s.id))) problems.push(`${def.label} / ${section.label} / ${category} / ${side}: 第二級關卡 ${lessonIds.length} 題，題庫 ${lessonPool.length} 題（旗標不收的構造除外），或有構造不在恰好一個關卡`);
    if (category !== 'all') for (const s of one) if (categoryOf(s) !== category) problems.push(`${def.label}: ${s.name} is not in category ${category}`);
  }
  // Scope (摘要 / 延伸): with 只考摘要範圍 the two levels still hold the same questions, and that pool is part of the full one (the default 包括延伸 is every question as before).
  for (const section of def.sections) for (const category of [...all, 'all']) for (const side of sides) {
    const base = {section: section.id, side, systems: [], categories: category === 'all' ? all : [category], count: 9999};
    const full = questionPool(catalogue, base), fullTwo = namingPool(catalogue, base), one = questionPool(catalogue, {...base, scope: 'summary'}), two = namingPool(catalogue, {...base, scope: 'summary'});
    if (full.length !== questionPool(catalogue, {...base, scope: 'all'}).length) problems.push(`${def.label}: scope 'all' must be the same pool as no scope`);
    const inFull = new Set(full.map(x => x.id)), inFullTwo = new Set(fullTwo.map(x => x.id));
    if (two.length !== one.length + two.filter(s => !askedAtLevel(s, 1)).length) problems.push(`${def.label} / ${section.label} / ${category} / ${side}: scope summary level 1 has ${one.length}, level 3 has ${two.length}`);
    for (const x of one) if (!inFull.has(x.id)) problems.push(`${def.label}: summary question ${x.name} is not in the full pool`);
    for (const x of two) if (!inFullTwo.has(x.id)) problems.push(`${def.label}: summary level-3 question ${x.name} is not in the full level-3 pool`);
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
const doc = ['# Quiz 題目範圍：各部位 × 題目類別的題數（第一級與第二級 / 第三級）', '', '此檔由 `node scripts/check-quiz-banks.mjs --write` 產生，請勿手改。範圍為「全部部位、雙側」；格內為「第一級題數 / 第三級題數」（第二級學習關卡與第三級使用同一個題庫），「—」表示此範圍暫無題目（模型中沒有這類構造，不編造）。', '',
  ...table, '', `共比對 ${combos} 種「部位區段 × 類別 × 左右側」組合，第一級、第二級與第三級${problems.length ? '不一致' : '題目相同'}；唯一的例外是 availability 旗標限制的構造（${flagged.join('；') || '目前沒有'}；不入另一級的題庫與學習關卡）。`, ''].join('\n');
if (problems.length) {console.error('Quiz level 1 / level 2 / level 3 question banks differ:\n' + [...new Set(problems)].slice(0, 80).join('\n')); process.exit(1);}
if (process.argv.includes('--write')) {fs.writeFileSync('docs/quiz-scope-counts.md', doc); console.log('wrote docs/quiz-scope-counts.md');}
else if (process.argv.includes('--check') && (!fs.existsSync('docs/quiz-scope-counts.md') || fs.readFileSync('docs/quiz-scope-counts.md', 'utf8') !== doc)) {console.error('docs/quiz-scope-counts.md is stale: run node scripts/check-quiz-banks.mjs --write'); process.exit(1);}
console.log(`Quiz banks passed: levels 1, 2 and 3 hold the same questions (except the availability-flagged structures, only level 3) in ${combos} region x category x side combinations.`);
console.log(table.join('\n'));
