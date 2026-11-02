// Writes docs/depth-classification.md: the tissue depth (superficial / middle / deep) of every muscle, connective structure, vessel and nerve of the runtime atlas per top region,
// and which of them were placed by a named rule and which only by the default of their system (those are the ones to check by eye). `--check` fails when the file is out of date.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {quizModule} from './quiz-modules.mjs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {displaySystem} from './lib/runtime-systems.mjs';

const D = await quizModule('app/mj-depth.ts'), B = await quizModule('app/mj-region-bar.ts'), O = await quizModule('app/mj-owners.ts');
const {atlas} = loadFullAtlas(), parts = atlas.parts.map(p => p.stream ? p : {...p, system: displaySystem(p)});
const owners = O.buildOwners(parts), index = B.buildRegionIndex(parts);
const ZH = {superficial: '淺層', intermediate: '中層', deep: '深層'}, SYS = {muscular: '肌肉', connective: '結締組織', arterial: '動脈', venous: '靜脈', nervous: '神經'};
const base = n => n.replace(/\b(?:left|right)\b ?/gi, '').replace(/\s+/g, ' ').trim();
const regions = [['back', undefined, '背部'], ['upper', undefined, '上肢'], ['lower', undefined, '下肢'], ['gluteal', undefined, '臀區'], ['head', undefined, '頭頸'], ['chest', 'wall', '胸壁'], ['abdomen', 'wall', '腹壁']];
let md = `# 組織深度歸類清單\n\n由 \`node scripts/report-depth.mjs\` 產生，規則在 \`app/mj-depth.ts\`。選某一層時，只顯示該層的肌肉（連肌腱）、結締組織、血管與神經；骨作參照，一律顯示。**需人工審核**：標「預設」的是沒有專屬規則、依系統預設歸類的結構，歸類最可能有誤，請優先核對。\n`;
const suspicious = [];
for (const [key, sub, label] of regions) {
  const set = B.regionMembers(index, parts, key, sub, 'both').focus, rows = new Map();
  for (const id of set) {
    const p = index.byId.get(id); if (!p || owners.muscleOf.has(p.id) || !SYS[p.system]) continue;
    const info = D.anatomyDepthInfo(p), k = p.system + '|' + base(p.name).toLowerCase();
    if (!rows.has(k)) rows.set(k, {system: p.system, name: base(p.name), ...info});
  }
  md += `\n## ${label}（${rows.size} 個名稱）\n`;
  for (const depth of ['superficial', 'intermediate', 'deep']) {
    md += `\n### ${ZH[depth]}\n\n`;
    for (const sys of Object.keys(SYS)) {
      const list = [...rows.values()].filter(r => r.depth === depth && r.system === sys).sort((a, b) => a.name.localeCompare(b.name));
      if (!list.length) continue;
      md += `- **${SYS[sys]}**（${list.length}）：${list.map(r => r.name + (r.by === 'default' ? '〔預設〕' : '')).join('；')}\n`;
    }
  }
  for (const r of rows.values()) if (r.by === 'default' && (r.system === 'muscular' || r.system === 'nervous' && /spinal|ramus/i.test(r.name))) suspicious.push(`${label}：${r.name} → ${ZH[r.depth]}`);
}
md += `\n## 歸類可疑、請使用者確認的肌肉\n\n依系統預設歸類（沒有專屬規則）的肌肉共 ${suspicious.length} 項：\n\n${suspicious.map(s => '- ' + s).join('\n')}\n`;
const out = fileURLToPath(new URL('../docs/depth-classification.md', import.meta.url));
if (process.argv.includes('--check')) { if (!fs.existsSync(out) || fs.readFileSync(out, 'utf8') !== md) { console.error('docs/depth-classification.md is out of date: run node scripts/report-depth.mjs'); process.exit(1); } console.log('depth classification list is up to date'); }
else { fs.writeFileSync(out, md); console.log(`wrote docs/depth-classification.md (${suspicious.length} default-classified muscles)`); }
