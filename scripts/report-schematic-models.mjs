// Lists every schematic (project-built) structure with its kind, size and triangles, and flags the ones that stick out of the skin of the atlas.
// Writes docs/schematic-models.md (for review) and docs/schematic-models.json.   node scripts/report-schematic-models.mjs
import fs from 'node:fs';
import {buildAll} from './lib/paokao-build.mjs';
const {built, U} = buildAll();
const rows = [];
for (const s of built) {
  const p = s.geometry.positions, lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (let i = 0; i < p.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], p[i + k]); hi[k] = Math.max(hi[k], p[i + k]); }
  const size = hi.map((v, k) => v - lo[k]), tris = s.geometry.indices.length / 3, sorted = [...size].sort((a, b) => b - a);
  const shape = sorted[2] < .004 && sorted[1] > .008 ? 'sheet' : sorted[1] < .012 && sorted[0] > .02 ? 'tube' : sorted[1] < .02 ? 'rod' : 'volume';
  // protrusion: sample vertices and compare with the skin along the front, back and the sides
  const n = p.length / 3, step = Math.max(1, Math.floor(n / 40)); let out = 0, worst = 0, samples = 0;
  for (let i = 0; i < n; i += step) {
    const x = p[i * 3], y = p[i * 3 + 1], z = p[i * 3 + 2]; samples++;
    const f = U.rayHit('Skin', [x, y, .6], [0, 0, -1]), b = U.rayHit('Skin', [x, y, -.6], [0, 0, 1]);
    let over = 0; if (f) over = Math.max(over, z - f.point[2]); if (b) over = Math.max(over, b.point[2] - z);
    if (!f && !b) over = 0;
    if (over > .004) out++; worst = Math.max(worst, over);
  }
  rows.push({name: s.name, zh: s.zh, system: s.system, kind: s.kind, sex: s.sex ?? '', shape, sizeMm: size.map(v => Math.round(v * 1000)), centreMm: lo.map((v, k) => Math.round((v + hi[k]) / 2 * 1000)), triangles: tris, outsideSkinSamples: `${out}/${samples}`, worstOverMm: Math.round(worst * 1000)});
}
fs.writeFileSync(new URL('../docs/schematic-models.json', import.meta.url), JSON.stringify(rows, null, 1));
const flagged = rows.filter(r => r.worstOverMm > 4);
let md = `# 示意模型清單\n\n由 \`scripts/report-schematic-models.mjs\` 產生。共 ${rows.length} 個專案自建的示意結構。「超出皮膚」欄是沿前後方向檢查，結構表面比身體表面更往外的最大距離（mm）。\n\n`;
md += `## 超出皮膚超過 4 mm 的結構（${flagged.length}）\n\n| 名稱 | 種類 | 形狀 | 大小 mm (x,y,z) | 超出 mm |\n| --- | --- | --- | --- | --- |\n` + flagged.map(r => `| ${r.name}（${r.zh}） | ${r.kind} | ${r.shape} | ${r.sizeMm.join(' × ')} | ${r.worstOverMm} |\n`).join('');
md += `\n## 全部\n\n| 名稱 | 中文 | 系統 | 種類 | 形狀 | 大小 mm | 中心 mm | 三角形 | 性別 |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n` + rows.map(r => `| ${r.name} | ${r.zh} | ${r.system} | ${r.kind} | ${r.shape} | ${r.sizeMm.join(' × ')} | ${r.centreMm.join(', ')} | ${r.triangles} | ${r.sex} |\n`).join('');
fs.writeFileSync(new URL('../docs/schematic-models.md', import.meta.url), md);
console.log(`${rows.length} schematic structures; ${flagged.length} stick out of the skin by more than 4 mm`);
console.log(flagged.map(r => `${r.name}: ${r.worstOverMm} mm (${r.shape} ${r.sizeMm.join('x')})`).join('\n'));
