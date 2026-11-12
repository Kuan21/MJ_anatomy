// Writes docs/organ-owners.md: every vessel and nerve of the atlas (and the external nerve meshes) with its owner organ, "in-organ" (shown only with the organ) or "passing"
// (never hidden with an organ), from the rule table app/mj-organ-owners.ts. `--check` fails when the file is out of date; `--summary` prints counts only.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {displaySystem} from './lib/runtime-systems.mjs';

const root = new URL('../', import.meta.url), tmp = new URL('.sites-runtime/', root);
fs.mkdirSync(fileURLToPath(tmp), {recursive: true});
for (const f of ['mj-part-regions', 'mj-organ-owners']) {
  const src = fs.readFileSync(fileURLToPath(new URL(`app/${f}.ts`, root)), 'utf8');
  const js = ts.transpileModule(src, {compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022}}).outputText.replace(/from '\.\/([\w-]+)'/g, "from './$1.mjs'");
  fs.writeFileSync(fileURLToPath(new URL(`${f}.mjs`, tmp)), js);
}
const {organOwner, isBrainTissue} = await import(new URL('mj-organ-owners.mjs', tmp));
const full = loadFullAtlas(), atlas = {...full.atlas, parts: full.atlas.parts.map(p => p.stream ? p : {...p, system: displaySystem(p)})};
const base = n => n.replace(/\b(?:left|right)\b ?/gi, '').replace(/\s+/g, ' ').trim();
const ORGAN = {cardiac: '心臟', respiratory: '肺（呼吸）', digestive: '消化（肝、胃腸、食道）', urinary: '泌尿（腎）', reproductive: '生殖', nervous: '腦（跟神經系統開關）'};
const SYS = {arterial: '動脈', venous: '靜脈', nervous: '神經', lymphatic: '淋巴'};
const inOrgan = new Map(), passing = new Map();
for (const p of atlas.parts) {
  if (!SYS[p.system]) continue;
  if (p.system === 'lymphatic' && /spleen|thymus/i.test(p.name)) continue;   // organs, not vessels
  if (isBrainTissue(p)) continue;   // the brain itself (gyri, nuclei, tracts) is the organ, not a nerve running to it
  const o = organOwner(p), key = `${p.system}|${o}|${base(p.name)}`, map = o ? inOrgan : passing;
  const e = map.get(key) ?? {system: p.system, name: base(p.name), organ: o, n: 0}; e.n++; map.set(key, e);
}
const line = e => `${e.name}${e.n > 1 ? ' ×' + e.n : ''}`;
let md = '# 血管與神經的歸屬器官（器官開關）\n\n由 `node scripts/list-organ-owners.mjs` 產生，規則表在 `app/mj-organ-owners.ts`（`npm run check` 會檢查本檔沒有過期）。\n\n' +
  '**顯示規則：** 器官內的血管、神經要「自己的系統開關（動脈／靜脈／神經）」與「所屬器官開關」都開啟才顯示；經過、沿著器官的血管與神經（主動脈、上下腔靜脈、頭臂靜脈、奇靜脈系統、肺動脈幹、膈神經、迷走神經、喉返神經、交感幹、肋間血管與神經等）不屬任何器官，不會隨器官開關隱藏。\n\n' +
  '**需人工審核：** 歸屬是解剖判斷，下方「邊界案例」請核對。\n\n';
const groups = new Map();
for (const e of inOrgan.values()) { if (!groups.has(e.organ)) groups.set(e.organ, new Map()); const g = groups.get(e.organ); if (!g.has(e.system)) g.set(e.system, []); g.get(e.system).push(e); }
md += '## 器官內（隨器官顯示）\n\n';
for (const [organ, bySys] of [...groups].sort()) {
  const total = [...bySys.values()].flat().reduce((s, e) => s + e.n, 0);
  md += `### ${ORGAN[organ]}（開關：${organ}；${total} 個網格）\n\n`;
  for (const [sys, list] of [...bySys].sort()) md += `- **${SYS[sys]}**（${list.length}）：${list.sort((a, b) => a.name < b.name ? -1 : 1).map(line).join('；')}\n`;
  md += '\n';
}
md += '## 經過、沿著（不隨器官隱藏）\n\n';
const pg = new Map(); for (const e of passing.values()) { if (!pg.has(e.system)) pg.set(e.system, []); pg.get(e.system).push(e); }
for (const [sys, list] of [...pg].sort()) md += `- **${SYS[sys]}**（${list.length}）：${list.sort((a, b) => a.name < b.name ? -1 : 1).map(line).join('；')}\n`;
md += `\n另外，外部神經網格（\`nervous.glb\`：迷走神經、交感幹、肋間神經、臂叢、膈神經等）全部屬「經過」，模型裡沒有心臟表面或肺門內的神經分支（心叢、肺叢分支），所以沒有需要隨心、肺隱藏的神經。\n\n`;
md += '## 邊界案例（目前的歸類與理由，請核對）\n\n' + fs.readFileSync(fileURLToPath(new URL('scripts/data/organ-owner-boundaries.md', root)), 'utf8') + '\n';
const out = fileURLToPath(new URL('docs/organ-owners.md', root));
if (process.argv.includes('--summary')) { console.log([...groups].map(([o, m]) => `${o}: ${[...m.values()].flat().reduce((s, e) => s + e.n, 0)}`).join(', '), '| passing groups', passing.size); process.exit(0); }
if (process.argv.includes('--check')) { let old = ''; try { old = fs.readFileSync(out, 'utf8'); } catch {} if (old !== md) { console.error('docs/organ-owners.md is out of date: run node scripts/list-organ-owners.mjs'); process.exit(1); } console.log('Organ owners list is up to date.'); process.exit(0); }
fs.writeFileSync(out, md); console.log('docs/organ-owners.md written.');
