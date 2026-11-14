// Head-and-neck quiz pool report: which structures are asked, how they split over sections and categories, which answer cards have data, and EVERY structure that is not asked with its reason.
// The decisions are made by scripts/prepare-quiz.mjs (rules in app/quiz/headneck.ts) and written to .sites-runtime/quiz-head-neck-report.json; this script turns them into docs/quiz-head-neck-pool.md.
//   node scripts/report-quiz-headneck.mjs           write docs/quiz-head-neck-pool.md
//   node scripts/report-quiz-headneck.mjs --check   fail when docs/quiz-head-neck-pool.md is stale
// Only counts go to the CI log; the names are in the document.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
const {QUIZ_REGIONS, QUIZ_CATEGORIES, QUIZ_SYSTEMS, categoryOf} = await quizModule('app/quiz/catalogue.ts');
const {structureCard} = await quizModule('app/quiz/card.ts');
const report = JSON.parse(fs.readFileSync('.sites-runtime/quiz-head-neck-report.json', 'utf8'));
const catalogue = JSON.parse(fs.readFileSync('public/models/quiz-head-neck.json', 'utf8'));
const sections = QUIZ_REGIONS['head-neck'].sections.filter(s => s.id !== 'all');
const key = s => s.name.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/\s+/g, ' ').trim();
assert.equal(catalogue.structures.length, report.asked.length, 'catalogue and report disagree on the number of asked structures');

const cats = QUIZ_CATEGORIES.filter(c => catalogue.structures.some(s => categoryOf(s) === c.id));
const cell = (sec, cat) => {
  const list = catalogue.structures.filter(s => s.sections.includes(sec) && categoryOf(s) === cat);
  return list.length ? `${list.length} / ${new Set(list.map(key)).size}` : '—';
};
const total = list => `${list.length} / ${new Set(list.map(key)).size}`;
const lines = ['# Quiz 頭頸：題庫範圍與排除清單', '',
  '此檔由 `node scripts/report-quiz-headneck.mjs` 產生，請勿手改（排除與分組由 `scripts/prepare-quiz.mjs` 依 `app/quiz/headneck.ts` 的規則決定；說明見 `docs/quiz-head-neck.md`）。來源是主站已有的頭頸構造（圖譜、面部與補充肌肉、神經疊圖、頸部血管、關節組織），沒有新增或修改任何 3D 模型。腦的構造不在這裡（有獨立的「腦」Quiz）。', '',
  `可出題：${catalogue.structures.length} 個構造（左右分開計），去掉左右後 ${new Set(catalogue.structures.map(key)).size} 個名稱。不出題：${report.excluded.length} 項（逐項列在下方，原因見各小節）。`, '',
  '## 各區段 × 類別（格內為「構造數 / 去掉左右後的名稱數」）', '',
  `| 區段 | ${cats.map(c => c.label).join(' | ')} | 合計 |`, `| --- |${' --- |'.repeat(cats.length + 1)}`,
  ...sections.map(sec => `| ${sec.label} | ${cats.map(c => cell(sec.id, c.id)).join(' | ')} | ${total(catalogue.structures.filter(s => s.sections.includes(sec.id)))} |`),
  `| 全部頭頸 | ${cats.map(c => { const l = catalogue.structures.filter(s => categoryOf(s) === c.id); return l.length ? total(l) : '—'; }).join(' | ')} | ${total(catalogue.structures)} |`, '',
  '類別對照：顱骨、頸椎、舌骨與鼻甲 → 骨；面部、咀嚼、頸部、眼外、咽喉與舌肌 → 肌肉；腦神經與頸神經 → 神經；動脈、靜脈 → 動脈、靜脈；顳顎關節的關節囊、關節盤與韌帶 → 關節；莖突舌骨韌帶、甲狀舌骨膜、聲帶韌帶、咽縫、帽狀腱膜與眼的制止韌帶等 → 韌帶與筋膜；眼球與淚器、舌、牙與牙齦、唾液腺、喉軟骨、鼻軟骨、會厭、氣管 → 器官結構；枕下三角 → 特殊空間與孔。沿用現有類別，沒有新增類別。', ''];

// the answer cards: what the card shows comes only from data the repository already has; a field without data is 「尚無資料」
const withCards = catalogue.structures.map(s => ({s, card: structureCard(s)}));
const full = withCards.filter(x => !x.card.missing.length), part = withCards.filter(x => x.card.fields.length && x.card.missing.length), none = withCards.filter(x => !x.card.fields.length);
const bySystem = QUIZ_SYSTEMS.map(sys => {
  const l = withCards.filter(x => x.s.system === sys.id);
  return l.length ? `| ${sys.label} | ${l.length} | ${l.filter(x => !x.card.missing.length).length} | ${l.filter(x => x.card.fields.length && x.card.missing.length).length} | ${l.filter(x => !x.card.fields.length).length} |` : '';
}).filter(Boolean);
lines.push('## 資料卡', '', `資料卡只使用主站已有的資料；沒有資料的欄位顯示「尚無資料」，不自行補寫。欄位齊全：${full.length} / ${catalogue.structures.length}；部分欄位有資料：${part.length}；完全沒有資料：${none.length}。完整的缺漏清單在 \`docs/quiz-card-gaps.md\`。`, '',
  '| 系統 | 構造數 | 欄位齊全 | 部分有資料 | 完全沒有資料 |', '| --- | --- | --- | --- | --- |', ...bySystem, '');

const links = catalogue.structures.filter(s => s.layer);
lines.push('## 眼球內部構造（外層變半透明）', '', `共 ${links.length} 個構造有「層」的標記：題目是眼球內部的構造時，同一側外層的鞏膜與角膜（以及更外一層的構造）改為淡色半透明、不能被點選，其他題目不變。規則：\`app/quiz/headneck.ts\` 的 \`coversHeadNeckTarget\`。`, '');

const reasons = report.reasons;
lines.push('## 不出題的構造（逐項）', '');
for (const why of Object.keys(reasons)) {
  const group = report.excluded.filter(e => e.reason === why);
  lines.push(`### ${reasons[why]}（${group.length}）`, '');
  if (!group.length) {lines.push('沒有。', ''); continue;}
  lines.push(...group.map(e => `- ${e.name}${e.chinese ? `（${e.chinese}）` : ''}${e.side === 'midline' ? '' : ` [${e.side}]`}`), '');
}
lines.push('## 與其他區域重複的構造', '', '腦神經的根部、腦血管等屬於「腦」Quiz；頸椎、頸部肌肉與頸神經在「背部」Quiz 也有（背部以後方層次為主），名稱相同的構造在不同區域各自出題，同一區域內名稱不重複。', '');
assert.ok(report.excluded.every(e => reasons[e.reason]), 'an exclusion has no documented reason');
const text = lines.join('\n') + '\n', file = 'docs/quiz-head-neck-pool.md';
if (process.argv.includes('--check')) {
  assert.equal(fs.existsSync(file) && fs.readFileSync(file, 'utf8'), text, `${file} is stale: run node scripts/report-quiz-headneck.mjs`);
  console.log(`Quiz head-neck pool passed: ${catalogue.structures.length} asked, ${report.excluded.length} excluded with a reason, report is current.`);
} else {fs.writeFileSync(file, text); console.log(`wrote ${file}: ${catalogue.structures.length} asked, ${report.excluded.length} excluded`);}
