// Read-only trial of the centreline continuity check of docs/centerline-plan.md: for every parent/child relation of scripts/topology-spec.mjs, how far the child's
// centreline is from the wall of its parent's centreline. Nothing is written to the site and no model is changed; there is no baseline yet and this is not part of npm run check.
//   node scripts/report-centreline-attach.mjs [--json] [--write] [--available]
//     --write      refreshes docs/centerline-attach-report.md
//     --available  runs on the packages that exist in this checkout and names the ones left out
// The connector pieces of the paokao package are not loaded, so a gap listed here can be one that a connector closes in the viewer.
import fs from 'node:fs';
import {loadWorld} from './lib/paokao-world.mjs';
import {centrelinesOf} from './lib/centreline-pieces.mjs';
import {attachGap} from './lib/centreline-continuity.mjs';
import {pieceGap} from './lib/centreline-groups.mjs';
import {expand} from './lib/topology.mjs';
import {ARTERIES, VEINS, NERVES} from './topology-spec.mjs';

const w = loadWorld({paokao: false, allowMissing: process.argv.includes('--available')});
const KIND = {artery: '動脈', vein: '靜脈', nerve: '神經'}, LIMITS = [3, 6, 12, 25];
const cache = new Map();
// Every centreline of every mesh with this name (a name can have several meshes, a mesh several pieces); null when there is no mesh, [] when none gives a line.
const linesOf = name => {
  if (!cache.has(name)) { const list = w.find(name); cache.set(name, list.length ? list.flatMap(e => centrelinesOf(e.load()).map(l => l.rings)) : null); }
  return cache.get(name);
};
const min = values => { const v = values.filter(x => x !== null && x !== undefined); return v.length ? Math.min(...v) : null; };
const t0 = Date.now(), rows = [], absent = [], noLine = [];
for (const rel of [...expand(ARTERIES, 'artery'), ...expand(VEINS, 'vein'), ...expand(NERVES, 'nerve')]) {
  const child = linesOf(rel.child), parent = linesOf(rel.parent);
  if (!child || !parent) { absent.push({kind: rel.kind, child: rel.child, parent: rel.parent, missing: !child ? rel.child : rel.parent}); continue; }
  if (!child.length || !parent.length) { noLine.push({kind: rel.kind, child: rel.child, parent: rel.parent, missing: !child.length ? rel.child : rel.parent}); continue; }
  // attach: an end of the child to the wall of the parent (the direction topology-spec states); either: the smaller of that, the parent's end to the child's wall, and end to end.
  const attach = min(child.flatMap(c => parent.map(p => attachGap(c, p)?.gap))), either = min(child.flatMap(c => parent.map(p => pieceGap(c, p))));
  rows.push({kind: rel.kind, child: rel.child, parent: rel.parent, attachMm: +(attach * 1000).toFixed(1), eitherMm: +(either * 1000).toFixed(1), childLines: child.length, parentLines: parent.length});
}
rows.sort((a, b) => b.attachMm - a.attachMm);
const over = (key, mm) => rows.filter(r => r[key] > mm).length;
const summary = `centreline attach: ${rows.length} relations measured, ${absent.length} without a mesh here, ${noLine.length} without a centreline, in ${((Date.now() - t0) / 1000).toFixed(1)} s; child end to parent wall over ${LIMITS.map(mm => `${mm} mm: ${over('attachMm', mm)}`).join(', ')}${w.missing.length ? '; left out: ' + w.missing.join(', ') : ''}`;
if (process.argv.includes('--json')) console.log(JSON.stringify({rows, absent, noLine, missing: w.missing}, null, 1));
else { console.log(summary); for (const r of rows.filter(r => r.attachMm > 3)) console.log(`  ${r.kind} | ${r.child} -> ${r.parent} | ${r.attachMm} mm (either way ${r.eitherMm} mm)`); }
if (process.argv.includes('--write')) {
  const left = w.missing.length ? `本次未含：${w.missing.join('、')}（這些生成檔不在本機）；也` : '';
  const table = list => list.map(r => `| ${KIND[r.kind]} | ${r.child} | ${r.parent} | ${r.attachMm} mm | ${r.eitherMm} mm | ${r.childLines} | ${r.parentLines} |`).join('\n');
  const lack = list => list.map(r => `| ${KIND[r.kind]} | ${r.child} | ${r.parent} | ${r.missing} |`).join('\n');
  fs.writeFileSync('docs/centerline-attach-report.md', `# 中心線上一級關係試量報告（自動產生，勿手動修改）

由 \`node scripts/report-centreline-attach.mjs --write\` 產生。這是連續性檢查的試量，**沒有基準、未納入檢查、沒有改模型**；數值沒有在 3D 畫面確認。

量法：依 \`scripts/topology-spec.mjs\` 的每個上一級關係，逐件抽出子結構與上一級的中心線（\`scripts/lib/centreline-pieces.mjs\`），「子端到上一級管壁」是子結構中心線的端點到上一級中心線的距離扣掉上一級在該處的半徑（0 代表端點在上一級的管壁以內）；「任一方向」另外也算上一級的端點到子結構管壁、以及兩者端點對端點，取最小。

限制：${left}沒有載入示意血管的連接管，所以這裡列出的空隙有些在網站上是由連接管補上的，**不能直接當成缺陷清單**。中心線是由網格表面推算的軸心，分支多的粗血管半徑仍可能有誤差。

共 ${rows.length + absent.length + noLine.length} 個關係：量到 ${rows.length} 個、本機沒有網格 ${absent.length} 個、抽不出中心線 ${noLine.length} 個。

| 子端到上一級管壁 | 關係數 | 任一方向 | 關係數 |
| --- | --- | --- | --- |
${LIMITS.map(mm => `| 超過 ${mm} mm | ${over('attachMm', mm)} | 超過 ${mm} mm | ${over('eitherMm', mm)} |`).join('\n')}

## 超過 3 mm 的關係（${over('attachMm', 3)} 個）

| 類別 | 子結構 | 上一級 | 子端到上一級管壁 | 任一方向 | 子中心線數 | 上一級中心線數 |
| --- | --- | --- | --- | --- | --- | --- |
${table(rows.filter(r => r.attachMm > 3))}

## 3 mm 以內的關係（${rows.length - over('attachMm', 3)} 個）

| 類別 | 子結構 | 上一級 | 子端到上一級管壁 | 任一方向 | 子中心線數 | 上一級中心線數 |
| --- | --- | --- | --- | --- | --- | --- |
${table(rows.filter(r => r.attachMm <= 3))}

## 抽不出中心線（${noLine.length} 個）

| 類別 | 子結構 | 上一級 | 抽不出的結構 |
| --- | --- | --- | --- |
${lack(noLine)}

## 本機沒有網格（${absent.length} 個）

多數是要有示意血管（跑考串流）或缺少的生成檔才有的結構。

| 類別 | 子結構 | 上一級 | 缺少的結構 |
| --- | --- | --- | --- |
${lack(absent)}
`);
}
