// Level 2 (看結構寫名稱): every answer accepted beyond the structure's own English and Chinese names and the synonym table — the main site's spelling, the course
// checklist's 1:1 aliases, the whole muscle for a part — and the group names that count as close. `node scripts/report-quiz-accepted-names.mjs` writes
// docs/quiz-level2-accepted-names.md for the owner to check; `--check` fails when the file is stale.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
const {siteName, checklistAliases, wholeMuscleOf, acceptedNames} = await quizModule('app/quiz/naming.ts');
const regions = [['lower', '下肢'], ['upper', '上肢'], ['thorax', '胸腔'], ['back', '背部'], ['heart', '心臟'], ['lung', '肺']];
const lines = ['# Quiz 第二級額外接受的答案', '', '此檔由 `node scripts/report-quiz-accepted-names.mjs` 產生，請勿手改。除了構造自己的英文名、中文名、括號內別名與同義詞表（`app/quiz/synonyms.ts`，列在 REVIEW_LOG）之外，第二級還接受下列寫法；群名只算「接近」並列入錯題。左右兩側同一規則，只列一側。', ''];
let total = 0;
for (const [id, label] of regions) {
  const catalogue = JSON.parse(fs.readFileSync(`public/models/quiz-${id}.json`, 'utf8')), rows = [], seen = new Set();
  for (const s of catalogue.structures) {
    const key = s.name.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/\s+/g, ' ').trim(); if (seen.has(key)) continue; seen.add(key);
    const site = siteName(s), alias = checklistAliases(s), whole = wholeMuscleOf(s);
    const extra = [site.en, site.zh, ...alias.exact, whole && !whole.headsRequired ? `${whole.en}${whole.zh ? '／' + whole.zh : ''}（整條肌肉）` : null].filter(Boolean);
    const close = [...alias.group, whole && whole.headsRequired ? `${whole.en}（整條肌肉，必須寫頭）` : null].filter(Boolean);
    if (!extra.length && !close.length) continue;
    assert.ok(!site.en || acceptedNames(s).en.includes(site.en), `${s.name}: site name not in accepted list`);
    rows.push(`| ${s.name} | ${s.chinese ?? ''} | ${extra.join('、')} | ${close.join('、')} |`);
  }
  total += rows.length;
  lines.push(`## ${label}（${id}）：${rows.length} 個構造`, '', '| 題目 | 中文 | 也接受 | 只算接近 |', '| --- | --- | --- | --- |', ...rows, '');
}
lines.splice(3, 0, `合計 ${total} 個構造有額外接受的寫法。`, '');
const text = lines.join('\n') + '\n', file = 'docs/quiz-level2-accepted-names.md';
if (process.argv.includes('--check')) {
  assert.equal(fs.existsSync(file) && fs.readFileSync(file, 'utf8'), text, `${file} is stale: run node scripts/report-quiz-accepted-names.mjs`);
  console.log(`Quiz accepted names passed: ${total} structures with extra accepted spellings, list is current.`);
} else {fs.writeFileSync(file, text); console.log(`wrote ${file}: ${total} structures`);}
