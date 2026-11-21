// Abdomen (and pelvis-and-perineum) quiz pool report: which structures are asked, how they split over sections and categories, which answer cards have data, EVERY structure that is not asked with its reason,
// and which entries of the required-structure list the quiz does not ask (no model on the site, or an organ detail mode asks it).
// The decisions are made by scripts/prepare-quiz.mjs (rules in app/quiz/trunk.ts) and written to .sites-runtime/quiz-<region>-report.json; this script turns them into docs/quiz-trunk-pool.md.
//   node scripts/report-quiz-trunk.mjs           write docs/quiz-trunk-pool.md
//   node scripts/report-quiz-trunk.mjs --check   fail when docs/quiz-trunk-pool.md is stale
// Only counts go to the CI log; the names are in the document.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
const {QUIZ_REGIONS, QUIZ_CATEGORIES, QUIZ_SYSTEMS, categoryOf} = await quizModule('app/quiz/catalogue.ts');
const {structureCard} = await quizModule('app/quiz/card.ts');
const key = s => s.name.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/\s+/g, ' ').trim();

const lines = ['# Quiz 腹部、骨盆與會陰：題庫範圍與排除清單', '',
  '此檔由 `node scripts/report-quiz-trunk.mjs` 產生，請勿手改（排除與分組由 `scripts/prepare-quiz.mjs` 依 `app/quiz/trunk.ts` 的規則決定；說明見 `docs/quiz-trunk.md`）。來源是主站在該區已有的構造（圖譜、補充構造與神經疊層）；肝、膽道、胰、腎的內部構造由各器官的詳細模式 Quiz 出題。', ''];
let asked = 0, excluded = 0;
for (const id of ['abdomen', 'pelvis']) {
  const reportFile = `.sites-runtime/quiz-${id}-report.json`;
  if (!fs.existsSync(reportFile) || !QUIZ_REGIONS[id]) continue;
  const report = JSON.parse(fs.readFileSync(reportFile, 'utf8')), catalogue = JSON.parse(fs.readFileSync(`public/models/${QUIZ_REGIONS[id].file}`, 'utf8'));
  assert.equal(catalogue.structures.length, report.asked.length, `${id}: catalogue and report disagree on the number of asked structures`);
  asked += catalogue.structures.length; excluded += report.excluded.length;
  const sections = QUIZ_REGIONS[id].sections.filter(s => s.id !== 'all'), cats = QUIZ_CATEGORIES.filter(c => catalogue.structures.some(s => categoryOf(s) === c.id));
  const total = list => `${list.length} / ${new Set(list.map(key)).size}`;
  const cell = (sec, cat) => {const l = catalogue.structures.filter(s => s.sections.includes(sec) && categoryOf(s) === cat); return l.length ? total(l) : '—';};
  lines.push(`## ${QUIZ_REGIONS[id].label}（${QUIZ_REGIONS[id].english}）`, '',
    `可出題：${catalogue.structures.length} 個構造（左右分開計），去掉左右後 ${new Set(catalogue.structures.map(key)).size} 個名稱。不出題：${report.excluded.length} 項（逐項列在下方）。`, '',
    '### 各區段 × 類別（格內為「構造數 / 去掉左右後的名稱數」）', '',
    `| 區段 | ${cats.map(c => c.label).join(' | ')} | 合計 |`, `| --- |${' --- |'.repeat(cats.length + 1)}`,
    ...sections.map(sec => `| ${sec.label} | ${cats.map(c => cell(sec.id, c.id)).join(' | ')} | ${total(catalogue.structures.filter(s => s.sections.includes(sec.id)))} |`),
    `| 全部 | ${cats.map(c => { const l = catalogue.structures.filter(s => categoryOf(s) === c.id); return l.length ? total(l) : '—'; }).join(' | ')} | ${total(catalogue.structures)} |`, '');
  lines.push('### 各區段的構造', '');
  for (const sec of sections) {
    const names = [...new Map(catalogue.structures.filter(s => s.sections.includes(sec.id)).map(s => [key(s), s])).values()].sort((a, b) => key(a).localeCompare(key(b)));
    lines.push(`**${sec.label}（${names.length}）**：${names.map(s => `${key(s).replace(/^./, c => c.toUpperCase())}（${(s.chinese ?? '').replace(/^[左右]/, '')}）`).join('；') || '無'}`, '');
  }
  // answer cards: only data the repository already has; a field without data is 「尚無資料」
  const withCards = catalogue.structures.map(s => ({s, card: structureCard(s)}));
  const bySystem = QUIZ_SYSTEMS.map(sys => {
    const l = withCards.filter(x => x.s.system === sys.id);
    return l.length ? `| ${sys.label} | ${l.length} | ${l.filter(x => !x.card.missing.length).length} | ${l.filter(x => x.card.fields.length && x.card.missing.length).length} | ${l.filter(x => !x.card.fields.length).length} |` : '';
  }).filter(Boolean);
  lines.push('### 資料卡', '', `資料卡只使用主站已有的資料；沒有資料的欄位顯示「尚無資料」，不自行補寫。欄位齊全：${withCards.filter(x => !x.card.missing.length).length} / ${catalogue.structures.length}；部分欄位有資料：${withCards.filter(x => x.card.fields.length && x.card.missing.length).length}；完全沒有資料：${withCards.filter(x => !x.card.fields.length).length}。`, '',
    '| 系統 | 構造數 | 欄位齊全 | 部分有資料 | 完全沒有資料 |', '| --- | --- | --- | --- | --- |', ...bySystem, '');
  const layered = catalogue.structures.filter(s => s.layer);
  if (layered.length) lines.push('### 內臟的前後層次（前方的內臟變半透明）', '', `共 ${layered.length} 個構造有「層」的標記（前層：${layered.filter(s => s.layer === 'front').length}、中層：${layered.filter(s => s.layer === 'middle').length}、深層：${layered.filter(s => s.layer === 'deep').length}）：題目是較深層的內臟時，位於它前方的內臟改為淡色半透明、不能被點選。`, '');
  const aliased = catalogue.structures.filter(s => s.aliases);
  lines.push('### 名稱的其他接受寫法', '', `${aliased.length} 個構造另有可接受的寫法（來自必考清單的用詞，顯示名稱仍是主站的名稱）。`, '');
  const reasons = report.reasons;
  lines.push('### 不出題的構造（逐項）', '');
  for (const why of Object.keys(reasons)) {
    const group = report.excluded.filter(e => e.reason === why);
    lines.push(`#### ${reasons[why]}（${group.length}）`, '');
    if (!group.length) {lines.push('沒有。', ''); continue;}
    lines.push(...group.map(e => `- ${e.name}${e.chinese ? `（${e.chinese}）` : ''}${e.side === 'midline' ? '' : ` [${e.side}]`}`), '');
  }
  assert.ok(report.excluded.every(e => reasons[e.reason]), `${id}: an exclusion has no documented reason`);
  if (report.requiredCoverage) {
    const required = JSON.parse(fs.readFileSync(`docs/required-structures/${id}.json`, 'utf8')).structures.filter(r => r.expect3d), byId = new Map(required.map(r => [r.id, r]));
    lines.push('### 必考清單的覆蓋', '', `必考清單要求 3D 的 ${report.requiredCoverage.required} 項：本區出題 ${report.requiredCoverage.asked.length} 項；沒有出題 ${report.requiredCoverage.notAsked.length} 項（主站沒有該構造的模型，或屬器官詳細模式／其他區域的 Quiz；缺項記入 ROADMAP，考試後才做）。`, '',
      '沒有出題的項目：', '', ...report.requiredCoverage.notAsked.map(i => `- ${byId.get(i).en}（${byId.get(i).zh}）`), '');
  }
}
const text = lines.join('\n') + '\n', file = 'docs/quiz-trunk-pool.md';
if (process.argv.includes('--check')) {
  assert.equal(fs.existsSync(file) && fs.readFileSync(file, 'utf8'), text, `${file} is stale: run node scripts/report-quiz-trunk.mjs`);
  console.log(`Quiz trunk pool passed: ${asked} asked, ${excluded} excluded with a reason, report is current.`);
} else {fs.writeFileSync(file, text); console.log(`wrote ${file}: ${asked} asked, ${excluded} excluded`);}
