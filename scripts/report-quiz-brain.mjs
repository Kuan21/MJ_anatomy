// Brain quiz pool report: which structures of the brain package are asked, how they split over sections and categories, and EVERY structure that is not asked with its reason.
// The decisions are made by scripts/prepare-quiz.mjs (rules in app/quiz/brain.ts) and written to .sites-runtime/quiz-brain-report.json; this script turns them into docs/quiz-brain-pool.md.
//   node scripts/report-quiz-brain.mjs           write docs/quiz-brain-pool.md
//   node scripts/report-quiz-brain.mjs --check   fail when docs/quiz-brain-pool.md is stale
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
const {QUIZ_REGIONS, QUIZ_CATEGORIES, categoryOf} = await quizModule('app/quiz/catalogue.ts');
const report = JSON.parse(fs.readFileSync('.sites-runtime/quiz-brain-report.json', 'utf8'));
const catalogue = JSON.parse(fs.readFileSync('public/models/quiz-brain.json', 'utf8'));
const sections = QUIZ_REGIONS.brain.sections.filter(s => s.id !== 'all');
const key = s => s.name.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/\s+/g, ' ').trim();
assert.equal(catalogue.structures.length, report.asked.length, 'catalogue and report disagree on the number of asked structures');

const cats = QUIZ_CATEGORIES.filter(c => catalogue.structures.some(s => categoryOf(s) === c.id));
const cell = (sec, cat) => {
  const list = catalogue.structures.filter(s => s.sections.includes(sec) && categoryOf(s) === cat);
  return list.length ? `${list.length} / ${new Set(list.map(key)).size}` : '—';
};
const total = list => `${list.length} / ${new Set(list.map(key)).size}`;
const lines = ['# Quiz 腦：題庫範圍與排除清單', '',
  '此檔由 `node scripts/report-quiz-brain.mjs` 產生，請勿手改（排除與分組由 `scripts/prepare-quiz.mjs` 依 `app/quiz/brain.ts` 的規則決定；說明見 `docs/quiz-brain.md`）。來源是主站腦部畫面使用的同一個腦模型（`public/models/brain.glb`），測驗只用模型真正有的網格。', '',
  `可出題：${catalogue.structures.length} 個構造（左右分開計），去掉左右後 ${new Set(catalogue.structures.map(key)).size} 個名稱。不出題：${report.excluded.length} 項（逐項列在下方，原因見各小節）。`, '',
  '## 各區段 × 類別（格內為「構造數 / 去掉左右後的名稱數」）', '',
  `| 區段 | ${cats.map(c => c.label).join(' | ')} | 合計 |`, `| --- |${' --- |'.repeat(cats.length + 1)}`,
  ...sections.map(sec => `| ${sec.label} | ${cats.map(c => cell(sec.id, c.id)).join(' | ')} | ${total(catalogue.structures.filter(s => s.sections.includes(sec.id)))} |`),
  `| 全部腦 | ${cats.map(c => { const l = catalogue.structures.filter(s => categoryOf(s) === c.id); return l.length ? total(l) : '—'; }).join(' | ')} | ${total(catalogue.structures)} |`, '',
  '分類規則：腦神經根 → 神經；腦動脈 → 動脈；靜脈竇與靜脈 → 靜脈；皮質、核團、腦室、白質纖維束、腦幹、小腦、間腦 → 器官結構（沿用現有類別，不新增類別）。', ''];

const missing = catalogue.structures.filter(s => !s.cardFields?.length), broader = report.asked.filter(a => a.card && !a.cardSame);
lines.push('## 資料卡', '', `有資料卡：${catalogue.structures.length - missing.length} / ${catalogue.structures.length} 個構造；其中 ${new Set(broader.map(a => key(a))).size} 個名稱對應的是較廣概念的資料卡（例如視丘的卡片對應視丘的各個核），卡片第一行會標明「所屬資料卡」。沒有資料卡的構造在答題後的資料卡顯示「尚無資料」，並列在 \`docs/quiz-card-gaps.md\`。資料卡內容全部來自 \`public/models/brain/neuro-cards.json\`，沒有新增文字。`, '');

const reasons = report.reasons;
lines.push('## 不出題的構造（逐項）', '');
for (const why of Object.keys(reasons)) {
  const group = report.excluded.filter(e => e.reason === why);
  lines.push(`### ${reasons[why]}（${group.length}）`, '');
  if (!group.length) {lines.push('沒有。', ''); continue;}
  lines.push(...group.map(e => `- ${e.name}${e.chinese ? `（${e.chinese}）` : ''} [${e.group}${e.side === 'midline' ? '' : `, ${e.side}`}]`), '');
}
assert.ok(report.excluded.every(e => reasons[e.reason]), 'an exclusion has no documented reason');
const text = lines.join('\n') + '\n', file = 'docs/quiz-brain-pool.md';
if (process.argv.includes('--check')) {
  assert.equal(fs.existsSync(file) && fs.readFileSync(file, 'utf8'), text, `${file} is stale: run node scripts/report-quiz-brain.mjs`);
  console.log(`Quiz brain pool passed: ${catalogue.structures.length} asked, ${report.excluded.length} excluded with a reason, report is current.`);
} else {fs.writeFileSync(file, text); console.log(`wrote ${file}: ${catalogue.structures.length} asked, ${report.excluded.length} excluded`);}
