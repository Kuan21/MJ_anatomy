// Writes docs/leg-vessel-tree-batch1.md: the vessel tree of batch 1 (femoral artery system and the pelvic arteries that feed it), what was built from it, and the card fields it produces.
// The tubes themselves are not shipped: the site keeps drawing the current vessels until the whole new set is approved (then one replacement). Pictures: scripts/render-leg-vessel-tree.mjs.
//   node scripts/build-leg-vessels.mjs [--write]
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadTree, buildTree} from './lib/leg-vessel-build.mjs';

const root = new URL('../', import.meta.url), tree = loadTree(), built = buildTree(tree);
const kids = id => tree.vessels.filter(v => v.parent === id).sort((a, b) => a.order - b.order);
const by = (id, side) => built.vessels.find(b => b.id === id && b.side === side);
const mmOf = b => Math.round(b.path.length * 3);
const name = v => `${v.en}<br>${v.zh}`;
const rows = tree.vessels.map(v => `| ${name(v)} | ${v.parent ? tree.vessels.find(x => x.id === v.parent).zh : '腹主動脈'} | ${v.calibreMm[0]}→${v.calibreMm[1]} | ${v.terminal ? '末端（收細）' : '分出或延續'} | L ${mmOf(by(v.id, 'Left'))}／R ${mmOf(by(v.id, 'Right'))} |`);
const cards = tree.vessels.map(v => {
  const k = kids(v.id);
  return [`### ${v.en}｜${v.zh}`, '', `- Origin 起點：${v.origin.en}｜${v.origin.zh}`, `- Course 走向：${v.course.en}｜${v.course.zh}`,
    `- Main branches 主要分支：${k.length ? k.map(c => `${c.en}（${c.zh}）`).join('、') : '無（本批範圍內）'}`, `- Territory 供應範圍：${v.supply.en}｜${v.supply.zh}`,
    ...(v.relations.length ? [`- 位置關係：${v.relations.map(r => r.rule).join('；')}`] : []), ''].join('\n');
});
const md = `# Leg vessel tree, batch 1: femoral artery system
# 下肢血管樹 第 1 批：股動脈系統

由 \`node scripts/build-leg-vessels.mjs --write\` 產生，資料在 \`app/data/vessel-tree/femoral-system.json\`，檢查是 \`scripts/check-leg-vessel-tree.mjs\`（已併入 \`npm run check\`）。新血管與網站上現有血管並存，**尚未替換**；經你審核整批動脈後一次替換。畫面確認見 PR 說明與截圖，沒有在 3D 畫面確認的部分列在 PR 說明。

## 血管（${tree.vessels.length} 條 × 左右）

| 血管 | 上一級 | 直徑 mm（起→末） | 末端 | 中心線長度 mm |
| --- | --- | --- | --- | --- |
${rows.join('\n')}

## 建法

1. 每條血管以網站現有網格（圖譜或示意）的中心線為導引，保留位置；穿動脈、旋髂深動脈、旋股外側動脈升支與橫支、閉孔動脈沒有可用的導引，依骨與肌網格上量到的標誌另寫路線（示意）。
2. 起點移到上一級的中心線上，子血管一定接在上一級上；髂總動脈分叉處與腹股溝韌帶處（外髂動脈到股動脈）接點相同。
3. 中心線被推出骨外（壁離骨面至少 1.2 mm）並避開神經（距神經表面至少 0.7 倍半徑），再平滑；直徑由起端線性遞減到末端，只有標記為末端的血管才收細。
4. 股動脈的下端接現有的膕動脈（第 2 批重建）。

## 資訊卡欄位（由血管樹產生）

${cards.join('\n')}
`;
if (process.argv.includes('--write')) { fs.writeFileSync(fileURLToPath(new URL('docs/leg-vessel-tree-batch1.md', root)), md); console.log('wrote docs/leg-vessel-tree-batch1.md'); } else console.log(md.slice(0, 1500));
