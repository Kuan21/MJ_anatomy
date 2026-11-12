// Writes docs/special-region-composition.md: the proposed five-role composition of the 12 special regions that are not yet redone (boundary / roof / floor / contents / related),
// each item marked 有 (a real model mesh), 示意 (a schematic mesh built for this atlas), 缺 (no model) with the mesh names found. For the user to confirm before the regions are rebuilt.
import fs from 'node:fs';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {REGIONS} from './lib/space-composition.mjs';

const root = new URL('../', import.meta.url), {atlas} = loadFullAtlas();
const nerveNames = new Set();
try {
  const j = JSON.parse(fs.readFileSync(fileURLToPath(new URL('public/models/nerve-stream.json', root)), 'utf8'));
  for (const c of j.chunks ?? []) for (const n of c.names ?? []) nerveNames.add(n);
} catch {}
// the nerve model names come from the glb itself (the stream manifest holds no names): read them from the node list of nervous.glb
{
  const b = fs.readFileSync(fileURLToPath(new URL('public/models/nervous.glb', root))), l = b.readUInt32LE(12), js = JSON.parse(b.slice(20, 20 + l).toString('utf8'));
  for (const n of js.nodes) if (n.name) nerveNames.add(n.name.replace(/\.(?:l|r|j)\.001$/, '').replace(/\.001$/, ''));
}
const paokaoCards = JSON.parse(fs.readFileSync(fileURLToPath(new URL('app/mj-paokao.json', root)), 'utf8'));
const schematicNerve = new Set(['Suboccipital nerve', 'Greater occipital nerve', 'Third occipital nerve', 'Lesser occipital nerve']);
const base = n => n.replace(/\b(?:left|right)\b ?/gi, '').replace(/\s+/g, ' ').trim();
const ROLES = [['boundary', '邊界'], ['roof', '頂'], ['floor', '底'], ['contents', '內容物'], ['related', '相關結構']];
function resolve(item) {
  if (item.absent) return {status: '缺', names: []};
  if (item.nerve) { const hit = [...nerveNames].filter(n => n.toLowerCase() === item.nerve.toLowerCase()); return hit.length ? {status: schematicNerve.has(item.nerve) ? '示意' : '有', names: [item.nerve + '（神經模型）']} : {status: '缺', names: []}; }
  const hits = atlas.parts.filter(p => item.re.test(p.name.toLowerCase()) && p.system !== 'muscular' || item.re.test(p.name.toLowerCase()));
  if (!hits.length || item.re.source === '^$') return {status: '缺', names: []};
  const names = [...new Set(hits.map(p => base(p.name)))];
  const schematic = hits.every(p => p.stream === 'paokao' || p.schematic || p.id in paokaoCards);
  return {status: schematic ? '示意' : '有', names};
}
let md = `# 特殊區域組成清單（其餘 12 個區域，尚未重做）\n\n由 \`node scripts/report-space-composition.mjs\` 產生，資料在 \`scripts/lib/space-composition.mjs\`。**需人工審核，請確認每區的組成後才會重做**：每區分成邊界、頂、底、內容物、相關結構五組；位置依 Gray's Anatomy 1918 與 OpenStax。\n\n狀態：**有**＝模型有這個結構的網格；**示意**＝本專案依解剖描述建立的示意模型；**缺**＝沒有任何開放模型（不會編造，只在清單標示「模型沒有」）。「—」表示該區在解剖上沒有這一組（例如孔洞前後貫通，沒有頂與底），請確認是否同意。\n\n`;
let have = 0, schem = 0, miss = 0;
for (const r of REGIONS) {
  md += `## ${r.zh}（${r.en}）\n\n${r.newRegion ? '> 目前網站沒有這個區域，需新增。\n\n' : ''}${r.note ? `> ${r.note}\n\n` : ''}`;
  for (const [key, zh] of ROLES) {
    const list = r[key] ?? [];
    if (!list.length) { md += `- **${zh}**：—\n`; continue; }
    md += `- **${zh}**\n`;
    for (const it of list) {
      const res = r.relatedAreSpaces && key === 'related' ? {status: '區域', names: []} : resolve(it);
      if (res.status === '有') have++; else if (res.status === '示意') schem++; else if (res.status === '缺') miss++;
      md += `  - ${it.zh}（${it.en}）${it.role ? ` — ${it.role}` : ''}：**${res.status}**${res.names.length ? `；網格：${res.names.slice(0, 8).join('、')}${res.names.length > 8 ? '…' : ''}` : ''}\n`;
    }
  }
  md += '\n';
}
md += `## 統計\n\n有 ${have} 項、示意 ${schem} 項、缺 ${miss} 項。\n`;
const out = fileURLToPath(new URL('docs/special-region-composition.md', root));
if (process.argv.includes('--check')) { if (!fs.existsSync(out) || fs.readFileSync(out, 'utf8') !== md) { console.error('docs/special-region-composition.md is out of date: run node scripts/report-space-composition.mjs'); process.exit(1); } console.log('special region composition list is up to date'); }
else { fs.writeFileSync(out, md); console.log(`wrote docs/special-region-composition.md (有 ${have}, 示意 ${schem}, 缺 ${miss})`); }
