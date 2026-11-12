// Vessel continuity at joint poses. The segment pairs of scripts/lib/vessel-segments.mjs (end of one segment, start of the next, connectors included) are posed with the same
// skinning the viewer uses (arm: soft-tissue bindings and the shoulder/elbow/wrist transforms; leg: body rig for hip, knee and ankle) and the gap is measured again:
//   gap after posing = gap at rest + change of the distance between the two end points
// It has to stay below half the vessel's diameter, or below the rest gap + 1 mm. Pairs that do not are exceptions: a known one is listed in docs/vessel-motion-exceptions.json,
// a new one fails. Also checked: every connector (vessel-ends piece) carries the binding of its vessel, and its back end moves with the vessel it leaves (within 2 mm).
//   node scripts/test-vessel-motion.mjs [--write] [--list]     --write refreshes docs/vessel-motion-exceptions.json and docs/vessel-motion.md
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {loadVessels, analyse} from './lib/vessel-segments.mjs';
import {loadPoseModule, createPoser} from './lib/vessel-pose.mjs';

const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
const m = await loadPoseModule();
const write = process.argv.includes('--write'), list = process.argv.includes('--list');
const GROW_MM = 1, WEIGHT_MM = 2;

const V = await loadVessels({mode: 'after'});
const {atlas} = V;
const {rows} = await analyse({regions: ['upper', 'lower'], mode: 'after', V});
const POSES = {
  upper: {'shoulder abduction 90': {shoulderAbduction: 90}, 'shoulder flexion 90': {shoulderFlexion: 90}, 'elbow flexion 90': {elbowFlexion: 90}, 'shoulder abduction 180 (limit)': {shoulderAbduction: 180},
    'shoulder flexion 180 (limit)': {shoulderFlexion: 180}, 'elbow flexion 140 (limit)': {elbowFlexion: 140}, 'wrist flexion 80 (limit)': {wristFlexion: 80}, 'wrist flexion -70 (limit)': {wristFlexion: -70}},
  lower: {'hip flexion 90': {flexion: 90}, 'knee flexion 90': {knee: 90}, 'hip flexion 120 + knee 130 (limit)': {flexion: 120, knee: 130}, 'hip extension -20 (limit)': {flexion: -20}, 'ankle dorsiflexion 20 (limit)': {ankle: 20},
    'ankle plantar flexion -30 (limit)': {ankle: -30}, 'hip abduction 35 (limit)': {sideBend: 35}, 'hip rotation 20 (limit)': {rotation: 20}},
};
const sideOf = r => r.side === 'left' || r.side === 'right' ? r.side : null;

// ---- binding check: a connector carries the binding of its vessel
const problems = [];
let ends = 0;
for (const [baseId, end] of V.ends) {
  const base = V.byId.get(baseId); if (!base) continue; ends++;
  const region = V.region(base).region; if (!['upper-limb', 'lower-limb'].includes(region)) continue;
  const tb = m.tissueBindings[baseId], te = m.tissueBindings[end.id], bb = m.bodyBindings[baseId], be = m.bodyBindings[end.id];
  if (!!tb !== !!te || (tb && (tb.profile !== te.profile || tb.side !== te.side || te.name !== end.name))) problems.push(`${end.id}: arm binding of the connector differs from ${baseId} (${base.name})`);
  if (!!bb !== !!be || (bb && (bb.rig !== be.rig || bb.frame !== be.frame))) problems.push(`${end.id}: body binding of the connector differs from ${baseId} (${base.name})`);
}
assert.equal(problems.length, 0, problems.slice(0, 10).join('\n'));
console.log(`Vessel motion: ${ends} connector pieces carry exactly the binding of their vessel.`);

const {skinOf, posed, geo, armRig, legRig, context} = createPoser(V, m);
const nearestVertex = (partIds, point) => {
  let best = {d: Infinity};
  for (const id of partIds) { const p = V.byId.get(id); if (!p) continue; const g = geo(id).pos; for (let i = 0; i < g.length; i += 3) { const d = Math.hypot(g[i] - point[0], g[i + 1] - point[1], g[i + 2] - point[2]); if (d < best.d) best = {d, id, i}; } }
  return best;
};
// the two vertices of each pair, found once at rest
const pairs = rows.filter(r => sideOf(r)).map(r => {
  const a = nearestVertex(r.connector ? [r.id + '-END'] : [r.id], r.capAt), b = nearestVertex([r.neighbourId, r.neighbourId + '-END'], r.target.point);
  return {r, a, b, rest: Math.hypot(...[0, 1, 2].map(k => geo(a.id).pos[a.i + k] - geo(b.id).pos[b.i + k]))};
}).filter(p => p.a.id && p.b.id);

const exceptions = [], summary = {};
for (const [kindName, poses] of Object.entries(POSES)) {
  const kind = kindName === 'upper' ? 'arm' : 'leg';
  for (const [poseName, pose] of Object.entries(poses)) {
    let worst = 0, n = 0, bad = 0;
    for (const side of ['left', 'right']) {
      let ctx, key;
      if (kind === 'arm') { const {transforms} = m.buildUpperLimbMotion(atlas, side, {...m.NEUTRAL_POSE, ...pose}); key = side; ctx = {palette: m.makePalette(armRig(side), transforms)}; }
      else { key = side + 'Leg'; const built = m.buildBodyMotion(legRig(key), {...m.BODY_NEUTRAL, ...pose}); ctx = {palette: built.palette, matrices: built.matrices}; }
      const poseKey = poseName + side;
      for (const p of pairs) {
        if (p.r.region !== (kind === 'arm' ? 'upper-limb' : 'lower-limb') || p.r.side !== side) continue;
        const pa = posed(p.a.id, kind, key, poseKey, ctx), pb = posed(p.b.id, kind, key, poseKey, ctx);
        const d1 = Math.hypot(...[0, 1, 2].map(k => pa[p.a.i + k] - pb[p.b.i + k])), gap = Math.max(0, p.r.gapMm + (d1 - p.rest) * 1000), half = p.r.diameterMm / 2;
        n++; worst = Math.max(worst, gap - p.r.gapMm);
        if (gap > half && gap > p.r.gapMm + GROW_MM) { bad++; exceptions.push({pose: poseName, side, id: p.r.id, name: p.r.name, neighbour: p.r.neighbour, neighbourId: p.r.neighbourId, restGapMm: p.r.gapMm, posedGapMm: +gap.toFixed(1), diameterMm: p.r.diameterMm, kind: p.r.kind, region: p.r.region, neighbourRegion: V.region(V.byId.get(p.r.neighbourId) ?? V.byId.get(p.b.id)).region, unbound: [!skinOf(V.byId.get(p.a.id), kind, key) && 'this vessel', !skinOf(V.byId.get(p.b.id), kind, key) && 'the next segment'].filter(Boolean).join(' and ') || undefined}); }
      }
    }
    summary[poseName] = {pairs: n, exceptions: bad, worstOpeningMm: +worst.toFixed(1)};
    console.log(`  ${poseName}: ${n} pairs posed, ${bad} open more than half a diameter and 1 mm beyond rest (worst opening ${worst.toFixed(1)} mm)`);
  }
}
// ---- connector back end follows its vessel
const weightRows = [];
for (const [baseId, end] of V.ends) {
  const base = V.byId.get(baseId); if (!base) continue; const rg = V.region(base), sd = rg.side; if (!['left', 'right'].includes(sd)) continue;
  const kind = rg.region === 'upper-limb' ? 'arm' : rg.region === 'lower-limb' ? 'leg' : null; if (!kind) continue;
  const poses = POSES[kind === 'arm' ? 'upper' : 'lower'], names = Object.keys(poses).filter((_, i) => i < 3), baseG = geo(baseId).pos, endG = geo(end.id).pos;
  // end-piece vertices that lie inside or on the vessel (within 1.2 mm of one of its vertices) are the back ends of the connectors
  const probe = [];
  for (let i = 0; i < endG.length; i += 3) { let best = {d: Infinity}; for (let j = 0; j < baseG.length; j += 3) { const d = Math.hypot(endG[i] - baseG[j], endG[i + 1] - baseG[j + 1], endG[i + 2] - baseG[j + 2]); if (d < best.d) best = {d, j}; } if (best.d < .0012) probe.push([i, best.j]); }
  if (!probe.length) continue;
  for (const poseName of names) {
    const pose = poses[poseName]; let ctx, key;
    if (kind === 'arm') { const {transforms} = m.buildUpperLimbMotion(atlas, sd, {...m.NEUTRAL_POSE, ...pose}); key = sd; ctx = {palette: m.makePalette(armRig(sd), transforms)}; }
    else { key = sd + 'Leg'; const built = m.buildBodyMotion(legRig(key), {...m.BODY_NEUTRAL, ...pose}); ctx = {palette: built.palette, matrices: built.matrices}; }
    const pk = poseName + sd + 'w', pb = posed(baseId, kind, key, pk, ctx), pe = posed(end.id, kind, key, pk, ctx);
    let worst = 0; for (const [i, j] of probe) worst = Math.max(worst, Math.hypot(pe[i] - pb[j], pe[i + 1] - pb[j + 1], pe[i + 2] - pb[j + 2]) - Math.hypot(endG[i] - baseG[j], endG[i + 1] - baseG[j + 1], endG[i + 2] - baseG[j + 2]));
    if (worst * 1000 > WEIGHT_MM) weightRows.push({pose: poseName, id: end.id, name: base.name, separationMm: +(worst * 1000).toFixed(1)});
  }
}
console.log(`  connector back ends: ${weightRows.length} connector/pose combinations separate from their vessel by more than ${WEIGHT_MM} mm`);

// ---- exceptions file
const key = e => `${e.pose}|${e.side}|${e.id}|${e.neighbourId}|${e.kind}`;
const excFile = file('docs/vessel-motion-exceptions.json');
const worstByKey = {}; for (const e of exceptions) worstByKey[key(e)] = Math.max(worstByKey[key(e)] ?? 0, e.posedGapMm);   // several ends of one pair share a key: the worst counts
if (write) {
  fs.writeFileSync(excFile, JSON.stringify({note: 'Vessel pairs that open more than half a diameter (and more than 1 mm beyond their rest gap) at a joint pose. Known; a new one fails `npm run check:motion`.', summary, weightExceptions: weightRows.map(w => `${w.pose}|${w.id}`), exceptions: worstByKey}, null, 1));
  const byPose = new Map(); for (const e of exceptions) (byPose.get(e.pose) ?? byPose.set(e.pose, []).get(e.pose)).push(e);
  fs.writeFileSync(file('docs/vessel-motion.md'), ['# 血管在關節極限位置的連續性', '', '由 `node scripts/test-vessel-motion.mjs --write` 產生。相鄰兩段血管（含連接管）以檢視器使用的蒙皮擺姿後，重新量測間隙（間隙 = 靜止間隙 + 兩端點距離的變化）。判準：間隙小於管徑一半，或小於靜止間隙 + 1 mm。', '',
    '| 姿勢 | 量測的血管對 | 例外 | 最大開口 (mm) |', '| --- | ---: | ---: | ---: |', ...Object.entries(summary).map(([k, s]) => `| ${k} | ${s.pairs} | ${s.exceptions} | ${s.worstOpeningMm} |`), '',
    `連接管背端與所屬血管分離超過 ${WEIGHT_MM} mm 的組合：${weightRows.length} 個。`, '',
    ...[...byPose].flatMap(([pose, list]) => [`## ${pose}（${list.length} 個例外）`, '', '| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |', '| --- | --- | ---: | ---: | ---: | --- |', ...list.sort((a, b) => b.posedGapMm - a.posedGapMm).slice(0, 60).map(e => `| ${e.name} (${e.id}) → ${e.neighbour} (${e.neighbourId}) | ${e.side} | ${e.restGapMm} | ${e.posedGapMm} | ${e.diameterMm} | ${[e.unbound ? "未綁定：" + e.unbound : "", e.neighbourRegion !== e.region ? "下一段在" + e.neighbourRegion : ""].filter(Boolean).join("；")} |`), ''])].join('\n'));
  console.log('Wrote docs/vessel-motion-exceptions.json and docs/vessel-motion.md');
} else {
  const known = JSON.parse(fs.readFileSync(excFile, 'utf8')), fresh = exceptions.filter(e => known.exceptions[key(e)] === undefined || e.posedGapMm > known.exceptions[key(e)] + GROW_MM);
  const freshW = weightRows.filter(w => !known.weightExceptions.includes(`${w.pose}|${w.id}`));
  if (list) for (const e of exceptions) console.log(`  ${e.pose} ${e.side}: ${e.name} -> ${e.neighbour} ${e.restGapMm} -> ${e.posedGapMm} mm (diameter ${e.diameterMm})`);
  if (fresh.length || freshW.length) { console.error(`Vessel motion: ${fresh.length} new open pairs, ${freshW.length} new separated connectors:\n - ` + [...fresh.slice(0, 25).map(e => `${e.pose} ${e.side}: ${e.name} -> ${e.neighbour} rest ${e.restGapMm} mm, posed ${e.posedGapMm} mm, diameter ${e.diameterMm} mm`), ...freshW.slice(0, 10).map(w => `${w.pose}: connector ${w.id} (${w.name}) ${w.separationMm} mm`)].join('\n - ')); process.exit(1); }
  console.log(`PASS vessel motion: ${exceptions.length} known exceptions (docs/vessel-motion-exceptions.json), none new.`);
}
