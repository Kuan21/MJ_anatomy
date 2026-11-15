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

const reasons = report.reasons, limited = report.asked.filter(a => a.availability);
lines.push('## 只開放部分級別的構造', '', '這些構造在 `app/organ/brain-overrides.ts` 的 `quiz` 旗標指定開放的級別；第一級題庫、學習關卡（第二級）與模擬跑考題庫都不含它們，第三級（看結構寫名稱）才出題。`scripts/check-quiz-banks.mjs` 只容許第一級與第三級題庫相差這一組。', '');
if (!limited.length) lines.push('沒有。', '');
else lines.push('| 構造 | 開放級別 | 學習關卡 | 模擬跑考 | 原因 |', '| --- | --- | --- | --- | --- |', ...limited.map(a => `| ${a.name}（${a.chinese}） | ${a.availability.levels.map(l => `第${l === 1 ? '一' : '三'}級`).join('、')} | ${a.availability.lessons ? '收' : '不收'} | ${a.availability.exam ? '收' : '不收'} | ${a.availabilityReason} |`), '');
lines.push('## 不出題的構造（逐項）', '');
for (const why of Object.keys(reasons)) {
  const group = report.excluded.filter(e => e.reason === why);
  lines.push(`### ${reasons[why]}（${group.length}）`, '');
  if (!group.length) {lines.push('沒有。', ''); continue;}
  lines.push(...group.map(e => `- ${e.name}${e.chinese ? `（${e.chinese}）` : ''} [${e.group}${e.side === 'midline' ? '' : `, ${e.side}`}]`), '');
}
lines.push('## 同名檢查', '',
  '依模型原本的英文名（去掉 Left／Right、只比字母與數字）與中文名（去掉左／右）逐一比對所有腦網格；符合下列任一種就列出：(i) 左、右與中線三者同名；(ii) 同側兩個以上同名；(iii) 三個以上同名；(iv) 同名卻分屬不同群組，或同一中文名用在不同構造；(v) 左右一對但英文寫法不一致。每一項都要在 `app/quiz/brain.ts` 的 `BRAIN_NAME_CLASHES` 寫明處理方式，測試會在出現沒有說明的新同名時失敗。「中心 x」是網格包圍盒中心的 x（腦檔座標，正值為身體左側）。', '');
if (!report.nameClashes.length) lines.push('沒有。', '');
for (const k of report.nameClashes) {
  lines.push(`### ${k.key.replace(/^zh:/, '')}（${k.members.length} 個網格；${k.kinds.join('；')}）`, '',
    '| 模型名稱 | 位置 | 群組 | 中心 x | 測驗名稱（中文） | 狀態 |', '| --- | --- | --- | --- | --- | --- |',
    ...k.members.map(m => `| ${m.modelName} | ${m.side === 'midline' ? '中線' : m.side === 'left' ? '左' : '右'} | ${m.group} | ${m.centreX} | ${m.quizName}${m.quizChinese ? `（${m.quizChinese}）` : ''} | ${m.status === 'asked' ? (limited.find(a => a.name === m.quizName) ? '出題（限第三級）' : '出題') : `不出題：${reasons[m.status]}`} |`), '',
    `處理：${k.note ?? '（沒有說明）'}`, '');
}
assert.ok(report.excluded.every(e => reasons[e.reason]), 'an exclusion has no documented reason');
const text = lines.join('\n') + '\n', file = 'docs/quiz-brain-pool.md';
if (process.argv.includes('--check')) {
  assert.equal(fs.existsSync(file) && fs.readFileSync(file, 'utf8'), text, `${file} is stale: run node scripts/report-quiz-brain.mjs`);
  console.log(`Quiz brain pool passed: ${catalogue.structures.length} asked, ${report.excluded.length} excluded with a reason, report is current.`);
} else {fs.writeFileSync(file, text); console.log(`wrote ${file}: ${catalogue.structures.length} asked, ${report.excluded.length} excluded`);}
