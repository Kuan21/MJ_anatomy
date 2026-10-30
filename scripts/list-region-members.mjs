// Writes docs/region-members.md: every structure of the runtime atlas under each region of the top region bar (names merged left/right,
// repeated meshes counted), so the membership can be checked by eye. `--check` fails when the file is out of date; `--summary` prints counts only.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import {loadFullAtlas} from './lib/full-atlas.mjs';

const root = new URL('../', import.meta.url), tmp = new URL('.sites-runtime/', root);
fs.mkdirSync(fileURLToPath(tmp), {recursive: true});
for (const f of ['mj-part-regions', 'mj-region-bar']) {
  const src = fs.readFileSync(fileURLToPath(new URL(`app/${f}.ts`, root)), 'utf8');
  const js = ts.transpileModule(src, {compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022}}).outputText.replace(/from '\.\/([\w-]+)'/g, "from './$1.mjs'");
  fs.writeFileSync(fileURLToPath(new URL(`${f}.mjs`, tmp)), js);
}
const bar = await import(new URL('mj-region-bar.mjs', tmp));
const {atlas} = loadFullAtlas();
const parts = atlas.parts;
const index = bar.buildRegionIndex(parts);

const LABEL = {head: '頭頸', upper: '上肢', lower: '下肢', back: '背部', gluteal: '臀區'};
const sections = [];
const base = n => n.replace(/\b(?:left|right)\b ?/gi, '').replace(/\s+/g, ' ').trim();
const SYS = {skeletal: '骨', muscular: '肌肉', arterial: '動脈', venous: '靜脈', nervous: '神經', connective: '結締組織', cardiac: '心臟', respiratory: '呼吸', digestive: '消化', urinary: '泌尿', reproductive: '生殖', lymphatic: '淋巴', endocrine: '內分泌', serous: '漿膜', sensory: '感覺器', integumentary: '體表'};
function list(key, sub) {
  const set = bar.regionMembers(index, parts, key, sub, 'both');
  const groups = new Map();
  for (const id of set.focus) {
    const p = index.byId.get(id), k = p.system + '|' + base(p.name).toLowerCase();
    const g = groups.get(k) || {system: p.system, name: base(p.name), n: 0};
    g.n++; groups.set(k, g);
  }
  const bySystem = new Map();
  for (const g of groups.values()) { if (!bySystem.has(g.system)) bySystem.set(g.system, []); bySystem.get(g.system).push(g); }
  return {count: set.focus.length, names: groups.size, faded: set.faded.length, bySystem};
}
const defs = bar.REGION_BAR.filter(r => r.key !== 'whole');
let md = '# 區域歸屬清單（頂部區域列）\n\n由 `node scripts/list-region-members.mjs` 產生，規則在 `app/mj-region-bar.ts`。左右合併、同名多段以「×數量」表示。**需人工審核**：這份清單是依名稱與位置高度的規則分的，請特別核對背部、臀區、骨盆與會陰的邊界。\n\n';
const summary = [];
for (const d of defs) {
  const subs = d.subs ? d.subs : [{id: undefined, label: ''}];
  for (const s of subs) {
    const r = list(d.key, s.id);
    const title = `${d.label}${s.id ? ' → ' + s.label : ''}`;
    summary.push(`${title}: ${r.count} 個網格、${r.names} 個名稱${r.faded ? `、其中 ${r.faded} 個骨骼半透明` : ''}`);
    md += `## ${title}\n\n${r.count} 個網格，${r.names} 個名稱${r.faded ? `；內部視圖中 ${r.faded} 個骨骼半透明` : ''}。\n\n`;
    for (const [sys, gs] of [...r.bySystem].sort((a, b) => a[0].localeCompare(b[0]))) {
      gs.sort((a, b) => a.name.localeCompare(b.name));
      md += `- **${SYS[sys] || sys}**（${gs.length}）：${gs.map(g => g.n > 1 ? `${g.name} ×${g.n}` : g.name).join('；')}\n`;
    }
    md += '\n';
  }
}
if (process.argv.includes('--summary')) { console.log(summary.join('\n')); process.exit(0); }
const out = fileURLToPath(new URL('docs/region-members.md', root));
if (process.argv.includes('--check')) {
  const cur = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
  if (cur !== md) { console.error('docs/region-members.md 已過期，請執行 node scripts/list-region-members.mjs'); process.exit(1); }
  console.log('region members: up to date'); process.exit(0);
}
fs.writeFileSync(out, md);
console.log(summary.join('\n'));
