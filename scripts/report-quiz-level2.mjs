// Level 2 (看結構寫名稱) question pool: which structures qualify per region, and which are left out and why.
// `node scripts/report-quiz-level2.mjs` writes docs/quiz-level2-pool.md; `--check` fails when the file is stale.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
const {exclusionOf, nameCounts, neighbours} = await quizModule('app/quiz/level2.ts'), {SYNONYMS} = await quizModule('app/quiz/synonyms.ts');
const regions = [['lower', '下肢'], ['upper', '上肢'], ['thorax', '胸腔'], ['back', '背部'], ['heart', '心臟']];
const reasons = {'no-chinese-name': '缺中文名', 'card-incomplete': '資料卡欄位不完整', 'name-not-unique': '名稱與同範圍其他構造重複'};
const lines = ['# Quiz 第二級（看結構寫名稱）題庫範圍', '', '此檔由 `node scripts/report-quiz-level2.mjs` 產生，請勿手改。只有同時符合下列條件的構造會出題：有模型、有中文名、資料卡必填欄位完整、名稱在同一部位內不與其他構造重複（打出名稱只有一個正確答案）。其餘排除並列於下。', ''];
let total = 0, kept = 0;
for (const [id, label] of regions) {
  const catalogue = JSON.parse(fs.readFileSync(`public/models/quiz-${id}.json`, 'utf8')), counts = nameCounts(catalogue);
  const out = catalogue.structures.map(s => ({s, why: exclusionOf(s, counts)})), left = out.filter(x => x.why), inPool = out.length - left.length;
  const sample = catalogue.structures.find(s => !exclusionOf(s, counts));
  if (sample) assert.ok(neighbours(catalogue, sample).every(n => n.id !== sample.id), `${id}: a neighbour is the target itself`);
  assert.ok(inPool > 0, `${id}: empty level 2 pool`);
  total += out.length; kept += inPool;
  lines.push(`## ${label}（${id}）：${inPool} / ${out.length} 可出題`, '');
  if (!left.length) {lines.push('沒有排除的構造。', ''); continue;}
  for (const why of Object.keys(reasons)) {
    const group = left.filter(x => x.why === why).map(x => `${x.s.name}${x.s.chinese ? `（${x.s.chinese}）` : ''}${x.s.side === 'midline' ? '' : ` [${x.s.side}]`}`).sort();
    if (!group.length) continue;
    lines.push(`### ${reasons[why]}（${group.length}）`, '', ...group.map(g => `- ${g}`), '');
  }
}
lines.splice(3, 0, `合計：${kept} / ${total} 個構造可出題。`, '');
const text = lines.join('\n') + '\n';
if (process.argv.includes('--check')) {
  const log = fs.readFileSync('REVIEW_LOG.md', 'utf8');
  for (const key of Object.keys(SYNONYMS)) assert.ok(log.includes(`| ${key} |`), `synonym row "${key}" is missing from REVIEW_LOG.md`);
  assert.equal(fs.existsSync('docs/quiz-level2-pool.md') && fs.readFileSync('docs/quiz-level2-pool.md', 'utf8'), text, 'docs/quiz-level2-pool.md is stale: run node scripts/report-quiz-level2.mjs');
  console.log(`Quiz level 2 pool passed: ${kept} / ${total} structures qualify, exclusion list is current.`);
} else {fs.writeFileSync('docs/quiz-level2-pool.md', text); console.log(`wrote docs/quiz-level2-pool.md: ${kept} / ${total}`);}
