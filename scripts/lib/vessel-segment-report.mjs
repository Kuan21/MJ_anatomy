// Segment check of scripts/audit-vessel-continuity.mjs --segments: report, baseline, docs/vessel-segments.md. Measurements come from scripts/lib/vessel-segments.mjs.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {analyse, loadVessels, bigGaps, bridgeable, REGIONS, regionTools} from './vessel-segments.mjs';

const root = new URL('../../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
const TANGENT_DEG = 45, RATIO = 1.5, GROW_MM = 1;
const LABEL = {upper: '上肢', lower: '下肢', thorax: '胸部', head: '頭頸', trunk: '軀幹'};
export const DEFERRED = ['thorax (incl. hilum vessels)', 'back', 'head and neck', 'abdomen and pelvis'];
const pairKey = r => `${r.id}|${r.neighbourId}|${r.kind}`;

/** Per region: rows and counts. */
export async function measure(regions, mode = 'after') {
  const V = await loadVessels({mode}), out = {};
  for (const region of regions) {
    const {rows, stats} = await analyse({regions: [region], mode, V});
    const gaps = bigGaps(rows).sort((a, b) => b.gapMm - a.gapMm);
    out[region] = {rows, stats, gaps,
      tangent: rows.filter(r => r.kind === 'end-to-end' && r.tangentDeg > TANGENT_DEG),
      diameter: rows.filter(r => r.kind === 'end-to-end' && r.diameterRatio > RATIO)};
  }
  return out;
}
const summary = m => ({open: m.stats.open.length, ends: m.stats.ends, adjacent: m.rows.length, tapered: m.stats.tapered, terminal: m.stats.terminal, gaps: m.gaps.length, bridgeableGaps: m.gaps.filter(bridgeable).length, tangent: m.tangent.length, diameter: m.diameter.length});
const gapLine = r => `${r.name} (${r.id}) → ${r.neighbour} (${r.neighbourId}) | ${r.kind === 'end-to-end' ? '端接端' : '分支入幹'} | ${r.gapMm} | ${r.diameterMm}`;

export async function runSegments(argv) {
  const arg = k => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  const regions = (arg('--regions') ?? 'upper,lower').split(','), write = argv.includes('--write'), list = argv.includes('--list');
  if (arg('--ends')) process.env.VESSEL_ENDS_MANIFEST = arg('--ends');
  const t = performance.now(), res = await measure(regions);
  const sums = Object.fromEntries(regions.map(r => [r, summary(res[r])]));
  for (const r of regions) {
    const s = sums[r];
    console.log(`Vessel segments ${r}: ${s.ends} ends, ${s.adjacent} with a next segment (${s.tapered} tapered, ${s.terminal} terminal), ${s.gaps} gaps > half diameter (${s.bridgeableGaps} of them a connector could still bridge), ${s.tangent} tangent mismatches > ${TANGENT_DEG}°, ${s.diameter} diameter mismatches > ${RATIO}x`);
    if (list) for (const g of res[r].gaps) console.log('  ' + gapLine(g));
  }
  const baselineFile = file('docs/vessel-segments-baseline.json');
  if (write && argv.includes('--as-before')) {   // record this measurement as the state before the bridges
    const cur = JSON.parse(fs.readFileSync(baselineFile, 'utf8')); cur.before = {...cur.before, ...sums, gaps: Object.fromEntries(regions.map(r => [r, res[r].gaps.map(g => ({id: g.id, name: g.name, neighbourId: g.neighbourId, neighbour: g.neighbour, kind: g.kind, gapMm: g.gapMm, diameterMm: g.diameterMm}))])), note: 'Measured with the vessel-ends connectors of origin/main (before the spline bridges).'};
    fs.writeFileSync(baselineFile, JSON.stringify(cur, null, 1)); console.log('Recorded the state before the bridges.'); return;
  }
  if (write) {
    const base = {note: 'Vessel ends whose next segment lies further away than half the vessel diameter (known, listed in REVIEW_LOG.md). A new one fails `npm run check`; bridge it rather than adding it here.', thresholds: {gapFactor: .5, tangentDeg: TANGENT_DEG, diameterRatio: RATIO, growMm: GROW_MM}, before: JSON.parse(fs.existsSync(baselineFile) ? fs.readFileSync(baselineFile, 'utf8') : '{}').before, regions: {}};
    for (const r of regions) base.regions[r] = {summary: sums[r], gaps: Object.fromEntries(res[r].gaps.map(g => [pairKey(g) + '|' + g.at.map(v => Math.round(v * 1000)).join(','), g.gapMm]))};
    fs.writeFileSync(baselineFile, JSON.stringify(base, null, 1));
    await writeDocs(res, regions, sums, base.before);
    console.log(`Wrote docs/vessel-segments.md and the baseline (${((performance.now() - t) / 1000).toFixed(0)} s).`);
    return;
  }
  const base = JSON.parse(fs.readFileSync(baselineFile, 'utf8')), fails = [];
  for (const r of regions) {
    const known = base.regions[r]?.gaps ?? {};
    for (const g of res[r].gaps) {
      const k = pairKey(g) + '|' + g.at.map(v => Math.round(v * 1000)).join(','), old = known[k];
      if (old === undefined) fails.push(`new gap in ${r}: ${gapLine(g)}`); else if (g.gapMm > old + GROW_MM) fails.push(`gap grew from ${old} mm in ${r}: ${gapLine(g)}`);
    }
    const b = base.regions[r]?.summary; if (b && sums[r].tangent > b.tangent + 3) fails.push(`${r}: tangent mismatches grew from ${b.tangent} to ${sums[r].tangent}`);
    if (b && sums[r].diameter > b.diameter + 3) fails.push(`${r}: diameter mismatches grew from ${b.diameter} to ${sums[r].diameter}`);
  }
  if (fails.length) { console.error(`Vessel segments: ${fails.length} problems:\n - ` + fails.slice(0, 40).join('\n - ')); process.exit(1); }
  console.log(`Vessel segments OK (${((performance.now() - t) / 1000).toFixed(0)} s): no new gaps larger than half a diameter, no growth in tangent or diameter mismatches.`);
}

/** Surface smoothing of the vessels in scope: limb vessels of 3000 triangles or fewer are Loop-subdivided with area-weighted normals when the model stream is built (scripts/prepare-model-stream.mjs). */
async function smoothingSection(regions) {
  const f = new URL('public/models/atlas-stream.json', root); if (!fs.existsSync(f)) return [];
  const {anatomicalRegion} = await regionTools(), a = JSON.parse(fs.readFileSync(f, 'utf8')), lines = ['## 表面圓滑', '', '| 區域 | 動脈／靜脈網格 | 已圓滑（Loop 細分 + 平滑法線） | 未圓滑（超過 3000 個三角形，或形狀由運動資料綁定） |', '| --- | ---: | ---: | ---: |'];
  for (const r of regions) { const list = a.parts.filter(p => (p.system === 'arterial' || p.system === 'venous') && anatomicalRegion(p) === REGIONS[r]); lines.push(`| ${LABEL[r] ?? r} | ${list.length} | ${list.filter(p => p.smoothed).length} | ${list.filter(p => !p.smoothed).length} |`); }
  return [...lines, '', '本步驟新增的橋接管與漸細管：上肢與下肢為 12 邊的圓形斷面、沿管長平滑法線（`scripts/prepare-vessel-ends.mjs`）；其餘區域的連接管維持 5 邊。', ''];
}

async function writeDocs(res, regions, sums, before) {
  const md = ['# 血管分段連續性（相鄰動脈／靜脈）', '',
    `由 \`node scripts/audit-vessel-continuity.mjs --segments --write\` 產生。每個血管網格是一段；每個末端與「下一段」配對（它面對的末端，或它匯入的主幹），量測：`, '',
    '- 間隙：本段末端中心到下一段表面的距離（重疊則為 0）', '- 切線誤差：端接端時，兩端軸向的夾角（0° = 正好接續）', '- 管徑誤差：兩段管徑的比值', '',
    '間隙大於管徑一半者列在下方，並收進 `REVIEW_LOG.md`。範圍：上肢、下肢；尚未處理：' + DEFERRED.join('、') + '。', '',
    '| 區域 | 末端數 | 有下一段 | 已收成尖端 | 無下一段 | 間隙 > 管徑一半（修正前→後） | 切線誤差 > 45° | 管徑誤差 > 1.5 倍 |', '| --- | ---: | ---: | ---: | ---: | --- | ---: | ---: |',
    ...regions.map(r => { const s = sums[r], b = before?.[r]; return `| ${LABEL[r] ?? r} | ${s.ends} | ${s.adjacent} | ${s.tapered} | ${s.terminal} | ${b ? b.gaps + ' → ' : ''}${s.gaps} | ${b ? b.tangent + ' → ' : ''}${s.tangent} | ${b ? b.diameter + ' → ' : ''}${s.diameter} |`; }), ''];
  for (const r of regions) {
    const was = before?.gaps?.[r]; if (!was) continue;
    const left = new Set(res[r].gaps.map(g => g.id + '|' + g.neighbourId));
    md.push(`## ${LABEL[r] ?? r}：修正前（origin/main 的連接管）間隙大於管徑一半（${was.length}）`, '', `其中 ${was.filter(g => !left.has(g.id + '|' + g.neighbourId)).length} 個已不再出現（橋接後間隙小於管徑一半，或該末端收成尖端）。`, '', '| 血管對（上游 → 下一段） | 類型 | 間隙 (mm) | 管徑 (mm) | 修正後 |', '| --- | --- | ---: | ---: | --- |',
      ...was.sort((a, b) => b.gapMm - a.gapMm).map(g => `| ${g.name} (${g.id}) → ${g.neighbour} (${g.neighbourId}) | ${g.kind === 'end-to-end' ? '端接端' : '分支入幹'} | ${g.gapMm} | ${g.diameterMm} | ${left.has(g.id + '|' + g.neighbourId) ? '仍有間隙' : '已解決'} |`), '');
  }
  for (const r of regions) {
    md.push(`## ${LABEL[r] ?? r}：修正後仍大於管徑一半（${res[r].gaps.length}）`, '', '| 血管對（上游 → 下一段） | 類型 | 間隙 (mm) | 管徑 (mm) |', '| --- | --- | ---: | ---: |', ...res[r].gaps.map(g => `| ${gapLine(g)} |`), '');
  }
  md.push('## 沒有下一段的大血管末端（管徑 ≥ 3 mm，未收成尖端）', '', '這些末端附近找不到同類型的下一段：可能是血管進入組織或器官，也可能是圖譜缺少該段血管。**未新增任何血管模型**，只列出供人工對照。', '',
    '| 血管 | 部位 | 側 | 管徑 (mm) | 末端位置 (m) |', '| --- | --- | --- | ---: | --- |');
  for (const r of regions) for (const o of res[r].stats.open.filter(o => o.diameterMm >= 3).sort((a, b) => a.name.localeCompare(b.name))) md.push(`| ${o.name} (${o.id}) | ${o.sub} | ${o.side} | ${o.diameterMm} | ${o.at.join(', ')} |`);
  md.push('');
  md.push(...await smoothingSection(regions));
  fs.writeFileSync(file('docs/vessel-segments.md'), md.join('\n'));
}
