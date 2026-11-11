// Read-only report: extracts a centreline (scripts/lib/leg-centreline.mjs) for every vessel and nerve mesh of the atlas and lists the ones that fail or look wrong
// (no tube shape, fewer than 2 rings, very short, jumps between rings). Nothing is written to the site; this is the measuring step of docs/centerline-plan.md.
//   node scripts/report-centerlines.mjs [--json] [--write]      --write refreshes docs/centerline-report.md
import fs from 'node:fs';
import {loadWorld} from './lib/paokao-world.mjs';
import {centrelineOf} from './lib/leg-centreline.mjs';

const w = loadWorld({paokao: false});
const entries = w.entries.filter(e => ['arterial', 'venous', 'nervous'].includes(e.system) && !/^extra:/.test(e.id));
const t0 = Date.now(), bad = [], stats = {arterial: 0, venous: 0, nervous: 0};
for (const e of entries) {
  let why = null, rings = [];
  try { rings = centrelineOf(e.load()); } catch (err) { why = `no tube shape (${String(err.message).slice(0, 40)})`; }
  if (!why && rings.length < 2) why = 'fewer than 2 rings';
  if (!why) {
    let max = 0, len = 0;
    for (let i = 1; i < rings.length; i++) { const d = Math.hypot(...rings[i].c.map((v, k) => v - rings[i - 1].c[k])); max = Math.max(max, d); len += d; }
    if (max > .02) why = `jump of ${(max * 1000).toFixed(0)} mm between rings`;
    else if (len < .004) why = `length only ${(len * 1000).toFixed(1)} mm`;
  }
  if (why) bad.push({id: e.id, name: e.name, system: e.system, why}); else stats[e.system]++;
}
if (process.argv.includes('--json')) console.log(JSON.stringify({ok: stats, bad}, null, 1));
else {
  console.log(`centrelines: ${entries.length} meshes in ${((Date.now() - t0) / 1000).toFixed(1)} s; ok arterial ${stats.arterial}, venous ${stats.venous}, nervous ${stats.nervous}; ${bad.length} listed`);
  for (const b of bad) console.log(`  ${b.system} | ${b.name} | ${b.why}`);
}
if (process.argv.includes('--write')) {
  const rows = bad.map(b => `| ${b.system} | ${b.name} | ${b.why} |`).join('\n');
  fs.writeFileSync('docs/centerline-report.md', `# 中心線抽取報告（自動產生，勿手動修改）\n\n由 \`node scripts/report-centerlines.mjs --write\` 產生。共 ${entries.length} 個血管與神經網格，抽取成功且通過檢查：動脈 ${stats.arterial}、靜脈 ${stats.venous}、神經 ${stats.nervous}；列出 ${bad.length} 個。\n\n判讀：「jump」多半是主幹旁有粗分支，抽取把分支算進主幹；「length only」是很短的腦神經根；「fewer than 2 rings」是形狀不是管（交感幹神經節）。這些是量測用的提示，不是已確認的缺陷。\n\n| 系統 | 結構 | 原因 |\n| --- | --- | --- |\n${rows}\n`);
}
