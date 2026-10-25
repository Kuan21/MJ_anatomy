// Lists, for every quiz, the structures whose answer card is incomplete (a field with no documented data is left blank, never guessed).
// Writes docs/quiz-card-gaps.md for review.
import fs from 'node:fs';
import {quizModule} from './quiz-modules.mjs';

const {QUIZ_REGIONS, QUIZ_SYSTEMS} = await quizModule('app/quiz/catalogue.ts');
const {structureCard} = await quizModule('app/quiz/card.ts');
const models = new URL('../public/models/', import.meta.url);
const out = ['# 測驗資料卡：資料不完整的構造', '',
  '答題後的資料卡只使用專案內已有、已核對的資料；沒有把握的欄位留空，不推測。本清單由 `node scripts/list-quiz-card-gaps.mjs` 產生，供逐項檢查與補充（補充位置：`app/quiz/card-data.ts`，或 `app/mj-muscle-facts-*.ts`／`app/mj-structure-info.ts`）。', ''];
const summary = [];
for (const region of Object.values(QUIZ_REGIONS)) {
  const catalogue = JSON.parse(fs.readFileSync(new URL(region.file, models), 'utf8'));
  const seen = new Set(), bySystem = {};
  for (const s of catalogue.structures) {
    const key = s.system + ':' + s.name.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/\s+/g, ' ').trim();
    if (seen.has(key)) continue; seen.add(key);
    const card = structureCard(s);
    (bySystem[s.system] ??= {total: 0, rows: []}).total++;
    if (card.missing.length) bySystem[s.system].rows.push(`- ${card.chinese ? card.chinese + '（' + card.english.replace(/^(Left|Right) /, '') + '）' : card.english.replace(/^(Left|Right) /, '')}：缺 ${card.missing.join('、')}`);
  }
  out.push(`## ${region.label}（${region.english}）`, '');
  let incomplete = 0, total = 0;
  for (const system of QUIZ_SYSTEMS) {
    const g = bySystem[system.id]; if (!g) continue;
    total += g.total; incomplete += g.rows.length;
    out.push(`### ${system.label}：${g.total - g.rows.length} / ${g.total} 項資料完整`, '', ...(g.rows.length ? g.rows : ['（全部完整）']), '');
  }
  summary.push(`${region.label}: ${total - incomplete}/${total} complete`);
}
fs.writeFileSync(new URL('../docs/quiz-card-gaps.md', import.meta.url), out.join('\n'));
console.log('Quiz answer cards — ' + summary.join('; ') + '. Gaps listed in docs/quiz-card-gaps.md.');
