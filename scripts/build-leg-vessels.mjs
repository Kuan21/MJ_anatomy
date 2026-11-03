// Writes docs/leg-vessel-tree-batch<N>.md for every batch of the vessel tree (app/data/vessel-tree/*.json): the vessels, what was built from them, and the card fields they produce.
// The tubes themselves are not shipped: the site keeps drawing the current vessels until the whole new set is approved (then one replacement). Pictures: scripts/render-leg-vessel-tree.mjs.
//   node scripts/build-leg-vessels.mjs [--write]
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadTree, buildTree} from './lib/leg-vessel-build.mjs';

const root = new URL('../', import.meta.url), full = loadTree(), built = buildTree(full);
const kids = id => full.vessels.filter(v => v.parent === id || v.parentPending === id || v.joinsTo === id).sort((a, b) => a.order - b.order);
const by = (id, side) => built.vessels.find(b => b.id === id && b.side === side);
const mmOf = b => Math.round(b.path.length * 3);
const TITLE = {1: ['femoral artery system', '股動脈系統'], 2: ['popliteal artery and knee arteries', '膕動脈與膝部動脈'], 3: ['tibial, fibular and ankle arteries', '脛前、脛後、腓動脈與踝部動脈']};
const parentName = v => v.parent ? full.vessels.find(x => x.id === v.parent).zh : v.parentPending ? `${full.vessels.find(x => x.id === v.parentPending)?.zh ?? '脛前動脈'}（之後的批次）` : '腹主動脈';
for (const batch of full.batches) {
  const list = full.vessels.filter(v => v.batch === batch);
  const rows = list.map(v => `| ${v.en}<br>${v.zh} | ${parentName(v)}${v.joinsTo ? `，終止於${full.vessels.find(x => x.id === v.joinsTo).zh}` : ''} | ${v.calibreMm[0]}→${v.calibreMm[1]} | ${v.terminal ? '末端（收細）' : v.joinsTo ? '接到另一條血管' : '分出或延續'} | L ${mmOf(by(v.id, 'Left'))}／R ${mmOf(by(v.id, 'Right'))} |`);
  const cards = list.map(v => {
    const k = kids(v.id);
    return [`### ${v.en}｜${v.zh}`, '', `- Origin 起點：${v.origin.en}｜${v.origin.zh}`, `- Course 走向：${v.course.en}｜${v.course.zh}`,
      `- Main branches 主要分支：${k.length ? k.map(c => `${c.en}（${c.zh}）`).join('、') : (v.continuesInto ? '脛前動脈、脛後動脈（之後的批次）' : '無（本批範圍內）')}`, `- Territory 供應範圍：${v.supply.en}｜${v.supply.zh}`,
      ...(v.relations.length ? [`- 位置關係：${v.relations.map(r => r.rule).join('；')}`] : []), ''].join('\n');
  });
  const md = `# Leg vessel tree, batch ${batch}: ${TITLE[batch]?.[0] ?? ''}
# 下肢血管樹 第 ${batch} 批：${TITLE[batch]?.[1] ?? ''}

由 \`node scripts/build-leg-vessels.mjs --write\` 產生，資料在 \`app/data/vessel-tree/\`，檢查是 \`scripts/check-leg-vessel-tree.mjs\`（已併入 \`npm run check\`）。新血管與網站現有血管並存，**尚未替換**；全部批次完成並經你審核後一次替換。

## 血管（${list.length} 條 × 左右）

| 血管 | 上一級 | 直徑 mm（起→末） | 末端 | 中心線長度 mm |
| --- | --- | --- | --- | --- |
${rows.join('\n')}

## 建法

1. 每條血管以網站現有網格（圖譜或示意）的中心線為導引，保留位置；沒有可用導引的，依骨與肌網格上量到的標誌另寫路線（示意）。
2. 起點移到上一級的中心線上，子血管一定接在上一級上；吻合支的兩端各接在一條血管上。
3. 中心線被推出骨外（壁離骨面至少 1.2 mm）並避開神經，再平滑；直徑由起端線性遞減到末端，只有標記為末端的血管才收細。

## 資訊卡欄位（由血管樹產生）

${cards.join('\n')}
`;
  if (process.argv.includes('--write')) { fs.writeFileSync(fileURLToPath(new URL(`docs/leg-vessel-tree-batch${batch}.md`, root)), md); console.log(`wrote docs/leg-vessel-tree-batch${batch}.md`); } else console.log(md.slice(0, 600));
}
