// Writes docs/zh-tw-terminology-review.md: every Chinese name the quizzes and data panel show that was composed here or has more
// than one Taiwan form in use, for a human to confirm. Names taken from the CMU lecture dictionaries are not repeated.
import fs from 'node:fs';
import {quizModule} from './quiz-modules.mjs';
const {QUIZ_REGIONS} = await quizModule('app/quiz/catalogue.ts');
const {zhAnatomy} = await quizModule('app/mj-zh-anatomy.ts');
const rows = new Map(), counts = {};
for (const [id, def] of Object.entries(QUIZ_REGIONS)) {
  const catalogue = JSON.parse(fs.readFileSync(`public/models/${def.file}`));
  counts[id] = {total: catalogue.structures.length, check: 0};
  for (const s of catalogue.structures) {
    const base = s.name.toLowerCase().replace(/\b(left|right)\b/g, ' ').replace(/\s+/g, ' ').trim();
    const z = zhAnatomy(base);
    if (!z?.check) continue;
    const key = base;
    if (!rows.has(key)) rows.set(key, {en: base, zh: z.zh, why: z.check, regions: new Set()});
    rows.get(key).regions.add(def.label); counts[id].check++;
  }
}
const list = [...rows.values()].sort((a, b) => [...a.regions].join().localeCompare([...b.regions].join()) || a.en.localeCompare(b.en));
const lines = ['# 中文譯名待確認清單（台灣醫學用語）', '',
  '以下譯名由本專案組合或整理，臺灣教科書與《解剖學名詞》可能有多於一種寫法。其餘譯名取自中國醫藥大學課件字典（肌肉、骨骼、主要神經）或已是通行的標準名詞。', '',
  `共 ${list.length} 個不同名稱需要確認（涵蓋 ${Object.entries(counts).map(([id, c]) => `${QUIZ_REGIONS[id].label} ${c.check}／${c.total} 題`).join('、')}）。`, '',
  '| 英文名 | 目前譯名 | 區域 | 需要確認的原因 |', '|---|---|---|---|',
  ...list.map(r => `| ${r.en} | ${r.zh} | ${[...r.regions].join('、')} | ${r.why} |`), ''];
fs.mkdirSync('docs', {recursive: true});
fs.writeFileSync('docs/zh-tw-terminology-review.md', lines.join('\n'));
console.log(`Terminology review list: ${list.length} names to confirm.`);
