// Read-only report: extracts a centreline (scripts/lib/leg-centreline.mjs) for every vessel and nerve mesh of the atlas and lists the ones that fail or look wrong
// (no tube shape, fewer than 2 rings, very short, jumps between rings). Nothing is written to the site; this is the measuring step of docs/centerline-plan.md.
//   node scripts/report-centerlines.mjs [--json] [--write] [--available]
//     --write      refreshes docs/centerline-report.md
//     --available  runs on the packages that exist in this checkout (the generated supplement, serous and female packages may be absent) and names the ones left out
import fs from 'node:fs';
import {loadWorld} from './lib/paokao-world.mjs';
import {centrelineOf} from './lib/leg-centreline.mjs';
import {classifyRings, sparseStep, pieceCount} from './lib/centreline-classify.mjs';
import {centrelinesOf} from './lib/centreline-pieces.mjs';
import {joinGap} from './lib/centreline-continuity.mjs';
import {specNames, structureKind, linkGap} from './lib/centreline-groups.mjs';

const w = loadWorld({paokao: false, allowMissing: process.argv.includes('--available')});
const entries = w.entries.filter(e => ['arterial', 'venous', 'nervous'].includes(e.system) && !/^extra:/.test(e.id));
const spec = specNames(), KIND = {spec: '應相接', group: '成組', unknown: '未判定'}, ORDER = ['spec', 'unknown', 'group'];
const t0 = Date.now(), bad = [], sparse = [], pieces = [], stats = {arterial: 0, venous: 0, nervous: 0};
for (const e of entries) {
  let why = null, rings = [];
  const g = e.load(), info = {};
  try { rings = centrelineOf(g, .003, info); } catch (err) { why = `no tube shape (${String(err.message).slice(0, 40)})`; }
  if (!why) why = classifyRings(rings, info.steps);
  if (why) bad.push({id: e.id, name: e.name, system: e.system, why}); else stats[e.system]++;
  // Not faults, but limits of the measurement: rings far apart on a coarse mesh, and meshes made of several pieces (only one piece is followed).
  const s = why ? 0 : sparseStep(rings, info.steps); if (s) sparse.push({id: e.id, name: e.name, system: e.system, mm: Math.round(s * 1000)});
  const n = pieceCount(g);
  if (n > 1) {
    // One centreline per piece; `gap` is the widest distance from a piece's line to the end of the nearest other piece's line (joinGap, less the radius): a hint of how far the pieces are apart.
    const skipped = [], lines = centrelinesOf(g, .003, skipped);
    let gap = 0;
    if (lines.length > 1) for (const a of lines) gap = Math.max(gap, Math.min(...lines.filter(b => b !== a).map(b => joinGap(a.rings, b.rings))));
    pieces.push({id: e.id, name: e.name, system: e.system, pieces: n, lines: lines.length, skipped: skipped.length, gapMm: lines.length > 1 ? Math.round(gap * 1000) : null,
      // kind: one structure by topology-spec, a group by its name, or undecided; link: the gap to bridge to make one connected structure of all the lines (not meaningful for a group).
      kind: structureKind(e.name, spec), linkMm: lines.length > 1 ? Math.round(linkGap(lines.map(l => l.rings)) * 1000) : null});
  }
}
const left = w.missing.length ? `（本次未含：${w.missing.join('、')}，這些生成檔不在本機）` : '';
if (process.argv.includes('--json')) console.log(JSON.stringify({ok: stats, bad, sparse, pieces, missing: w.missing}, null, 1));
else {
  console.log(`centrelines: ${entries.length} meshes in ${((Date.now() - t0) / 1000).toFixed(1)} s; ok arterial ${stats.arterial}, venous ${stats.venous}, nervous ${stats.nervous}; ${bad.length} listed; ${sparse.length} coarse (rings far apart, not a break); ${pieces.length} made of several pieces${w.missing.length ? '; left out: ' + w.missing.join(', ') : ''}`);
  for (const b of bad) console.log(`  ${b.system} | ${b.name} | ${b.why}`);
}
if (process.argv.includes('--write')) {
  const rows = bad.map(b => `| ${b.system} | ${b.name} | ${b.why} |`).join('\n');
  const sparseRows = sparse.sort((a, b) => b.mm - a.mm).map(b => `| ${b.system} | ${b.name} | ${b.mm} mm |`).join('\n');
  const count = k => pieces.filter(b => b.kind === k).length, apart = k => pieces.filter(b => b.kind === k && b.linkMm > 5).length;
  const pieceRows = pieces.sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind) || (b.linkMm ?? -1) - (a.linkMm ?? -1) || b.pieces - a.pieces)
    .map(b => `| ${b.system} | ${b.name} | ${KIND[b.kind]} | ${b.pieces} | ${b.lines} | ${b.skipped} | ${b.gapMm === null ? '—' : b.gapMm + ' mm'} | ${b.linkMm === null ? '—' : b.linkMm + ' mm'} |`).join('\n');
  fs.writeFileSync('docs/centerline-report.md', `# 中心線抽取報告（自動產生，勿手動修改）

由 \`node scripts/report-centerlines.mjs --write\` 產生。共 ${entries.length} 個血管與神經網格${left}，抽取成功且通過檢查：動脈 ${stats.arterial}、靜脈 ${stats.venous}、神經 ${stats.nervous}；列出 ${bad.length} 個。

判讀：「jump」是相鄰兩圈的距離超過 20 mm，而且沿表面的距離解釋不了（可能是抽取走錯或網格有斷口）；「length only」是很短的結構（例如腦神經根）；「fewer than 2 rings」是形狀不是管（例如交感幹神經節）。這些是量測用的提示，不是已確認的缺陷。

| 系統 | 結構 | 原因 |
| --- | --- | --- |
${rows}

## 網格較粗、圈距較大（不算斷開，${sparse.length} 個）

這些網格的三角形很長，兩圈之間表面上沒有頂點，所以相鄰兩圈相距超過 20 mm；沿表面的距離與圈距相符，管子本身是連續的。之前的版本把它們列為「jump」。中心線在這一段是直線，用於連續性檢查時位置誤差較大。

| 系統 | 結構 | 最大圈距 |
| --- | --- | --- |
${sparseRows}

## 由多件組成的網格（${pieces.length} 個）

上面的檢查只沿其中一件走。這裡逐件抽取中心線：「中心線」是抽得出至少兩圈的件數，「略過」是太小或形狀不是管的件數，「最大件距」是各件的中心線端點到最近另一件端點的距離（已扣半徑）當中最大的一個。件距大不一定是缺陷（例如同一名稱下本來就分開的分支，或端點不是相接處），只是提示要看哪些結構。

「分類」只看名稱與 \`scripts/topology-spec.mjs\`，不是解剖判斷：「應相接」是 topology-spec 列為上一級或分支的單一結構（${count('spec')} 個，其中連接距離超過 5 mm 的 ${apart('spec')} 個）；「成組」是名稱本身表示多條的結構（Set of、複數、plexus；${count('group')} 個），各件本來分開，件距沒有意義；「未判定」是單數名稱但 topology-spec 沒有列出（${count('unknown')} 個，其中連接距離超過 5 mm 的 ${apart('unknown')} 個），需要人看。「連接距離」是把所有中心線連成一個整體時必須跨過的最大空隙（端點對端點，或端點到另一件的管壁），0 代表各件相接。表格依分類、再依連接距離排列。

| 系統 | 結構 | 分類 | 件數 | 中心線 | 略過 | 最大件距 | 連接距離 |
| --- | --- | --- | --- | --- | --- | --- | --- |
${pieceRows}
`);
}
