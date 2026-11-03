// Scope report (範圍: 摘要 / 延伸) over every structure the atlas can show: counts by system, the summary terms that have no structure of their own, and the extended structures by system.
//   node scripts/report-scope.mjs        writes docs/scope-report.md (internal; not served)
import fs from 'node:fs';
import {entities} from './lib/coverage-match.mjs';
import {quizModule} from './quiz-modules.mjs';
const {scopeOf, scopeName} = await quizModule('app/mj-scope.ts');
const root = new URL('../', import.meta.url), audit = JSON.parse(fs.readFileSync(new URL('docs/paokao-audit.json', root), 'utf8'));
const ID_SOURCES = ['atlas', 'facial', 'supplement', 'female', 'serous', 'heart'];
// One structure = one normalised English name within a system (left and right of a paired structure count once); 'meshes' counts every piece the viewer draws.
const byKey = new Map();
for (const e of entities) {
  if (e.source.startsWith('candidate')) continue;
  const name = e.names[0], key = `${e.system}|${scopeName(name)}`, scope = scopeOf(name, ID_SOURCES.includes(e.source) ? [e.id] : []);
  const row = byKey.get(key) ?? {system: e.system, name, scope, meshes: 0};
  row.meshes++; if (scope === 'summary') row.scope = 'summary'; byKey.set(key, row);
}
const rows = [...byKey.values()], systems = [...new Set(rows.map(r => r.system))].sort();
const n = (list, s) => list.filter(r => r.scope === s).length;
const unmatched = audit.rows.filter(r => r.status === 'skip' || r.status === 'part');
const md = ['# 範圍（摘要／延伸）統計', '', '由 `node scripts/report-scope.mjs` 產生；判定來源：`app/mj-scope.json`（由 `node scripts/audit-paokao.mjs` 依 `docs/paokao-checklist.json` 的必備結構清單比對產生）。內部文件，不部署。', '',
  `全站 ${rows.length} 個結構（同名左右算一個）：摘要 ${n(rows, 'summary')}、延伸 ${n(rows, 'extended')}；模型件數合計 ${rows.reduce((a, r) => a + r.meshes, 0)}（摘要 ${rows.filter(r => r.scope === 'summary').reduce((a, r) => a + r.meshes, 0)}）。`, '',
  '| 系統 | 摘要 | 延伸 | 合計 |', '| --- | ---: | ---: | ---: |', ...systems.map(s => { const l = rows.filter(r => r.system === s); return `| ${s} | ${n(l, 'summary')} | ${n(l, 'extended')} | ${l.length} |`; }), '',
  `## 沒有獨立結構可比對的摘要項目（${unmatched.length}）`, '', '這些項目不是獨立的結構（略過的泛稱，或肌頭、肌腱等屬於已有結構的一部分），所以沒有自己的「摘要」標記；所屬結構已標摘要。', '', '| 項目 | 處理 | 對應結構 |', '| --- | --- | --- |',
  ...unmatched.map(r => `| ${r.term} | ${r.status === 'skip' ? '略過（泛稱或截斷）' : '屬於已有結構的一部分'} | ${r.status === 'part' ? r.parent : ''} |`), '',
  '## 延伸結構（依系統）', '', ...systems.flatMap(s => [`### ${s}（${n(rows.filter(r => r.system === s), 'extended')}）`, '', rows.filter(r => r.system === s && r.scope === 'extended').map(r => r.name).sort().join('；'), ''])];
fs.writeFileSync(new URL('docs/scope-report.md', root), md.join('\n'));
console.log(JSON.stringify({structures: rows.length, summary: n(rows, 'summary'), extended: n(rows, 'extended'), unmatched: unmatched.length}));
