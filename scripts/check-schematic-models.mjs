// Schematic models, site-wide, without a browser.
//   1. Bone landmarks (kind 'landmark'): every vertex lies on its bone (within SURFACE_MM of the bone surface), the bounding box sits inside the bone's box
//      (grown by SURFACE_MM), and the patch is not out of proportion to the bone (largest side <= SIZE_RATIO of the bone's largest side; lines, crests, fossae and borders <= 90 %).
//   2. Schematic vessels and nerves: each selectable structure is one continuous piece (pieces further apart than about GAP_MM count as broken), and it does
//      not leave its neighbours (no stretch of it lies further than FAR_MM from every other structure; skin and serous shells do not count as neighbours).
//      Covered: the vessel-end pieces (`…-END`, checked as the viewer selects them: together with their vessel, app/mj-vessel-unit.ts), the schematic
//      arteries, veins, nerves and lymphatics of the course list (PK-…), and the schematic tubes of the nerve stream.
//   3. Checks 1 and 2 (landmark on its bone, structure in one piece) again at the joint poses of scripts/test-vessel-motion.mjs, limits included, posed the
//      way the viewer poses them (arm: soft-tissue bindings and the shoulder/elbow/wrist transforms; leg: body rig).
//   4. Negative controls: the left intertubercular groove bound the old way (as soft tissue, it lifted off the humerus when the elbow bent) and the vessel-end
//      piece of the left median antebrachial vein selected on its own (several separate pieces) must both be caught; if either passes, the check itself fails.
//   --only=landmarks runs 1 and 3 for the bone landmarks alone (scripts/checks/motion.d/20261116-landmarks-on-bone.txt).
//   node scripts/check-schematic-models.mjs [--write] [--json=<file>]   --write rewrites docs/schematic-models-report.md
// Exit code: 0 when nothing is found, 1 otherwise (or when a negative control passes). Not part of `npm run check` yet: the report comes first.
import fs from 'node:fs';
import esbuild from 'esbuild';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {regionTools} from './lib/vessel-segments.mjs';
import {loadPoseModule} from './lib/vessel-pose.mjs';
import {surfaceIndex, pieceSizes} from './lib/surface-distance.mjs';
import {MULTI_PIECE_VESSELS} from './audit-vessel-ends.mjs';

const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
const write = process.argv.includes('--write'), onlyLandmarks = process.argv.includes('--only=landmarks'), jsonOut = process.argv.find(a => a.startsWith('--json='))?.slice(7);
const SURFACE_MM = 3, SIZE_RATIO = .6, GAP_MM = 1.5, FAR_MM = 15;
const NEGATIVE = {landmark: 'Left intertubercular groove', vessel: 'Left median antebrachial vein'};

const {anatomicalRegion, anatomicalSubregion, anatomicalSide} = await regionTools();
// the selection rule of the viewer (a vessel and its end piece are picked together)
fs.mkdirSync(file('.sites-runtime'), {recursive: true});
await esbuild.build({entryPoints: [file('app/mj-vessel-unit.ts')], bundle: true, format: 'esm', platform: 'node', outfile: file('.sites-runtime/vessel-unit.mjs'), logLevel: 'error'});
const {vesselUnit} = await import(file('.sites-runtime/vessel-unit.mjs') + '?t=' + Date.now());
const m = await loadPoseModule();
const {atlas, geometry} = loadFullAtlas();
const PAOKAO = JSON.parse(fs.readFileSync(file('app/mj-paokao.json'), 'utf8')), RIGID = JSON.parse(fs.readFileSync(file('app/biomechanics-v2/paokao-bindings.json'), 'utf8')).rigid ?? {};
const byId = new Map(atlas.parts.map(p => [p.id, p])), byName = new Map();
for (const p of atlas.parts) if (!p.stream && !byName.has(p.name)) byName.set(p.name, p);
const geo = new Map(), G = p => geo.get(p.id) ?? geo.set(p.id, (() => { const g = geometry(p); return {pos: g.positions, idx: g.indices}; })()).get(p.id);

// ---- regions of the report (the parent vessel decides for a vessel-end piece)
const ZONES = [['head-neck', '頭頸'], ['abdomen', '腹腔'], ['pelvis', '骨盆與會陰'], ['thorax', '胸腔（含胸背壁）'], ['upper-limb', '上肢'], ['lower-limb', '下肢']];
const zoneOf = p => {
  if (/hip bone|sacrum|coccyx|pubic/i.test(p.name)) return 'pelvis';
  if (/scapula|clavicle|humerus|radius|ulna/i.test(p.name) && p.system === 'skeletal') return 'upper-limb';
  const r = anatomicalRegion(p); if (r !== 'trunk') return r; const s = anatomicalSubregion(p); return s === 'abdomen' || s === 'pelvis' ? s : 'thorax';
};

// ---- posing, as in the viewer (app/scene.tsx; scripts/lib/vessel-pose.mjs)
const POSES = {
  upper: {'肩外展 90°': {shoulderAbduction: 90}, '肩屈曲 90°': {shoulderFlexion: 90}, '屈肘 90°': {elbowFlexion: 90}, '肩外展 180°（極限）': {shoulderAbduction: 180},
    '肩屈曲 180°（極限）': {shoulderFlexion: 180}, '屈肘 140°（極限）': {elbowFlexion: 140}, '屈腕 80°（極限）': {wristFlexion: 80}, '伸腕 70°（極限）': {wristFlexion: -70}},
  lower: {'屈髖 90°': {flexion: 90}, '屈膝 90°': {knee: 90}, '屈髖 120°＋屈膝 130°（極限）': {flexion: 120, knee: 130}, '伸髖 20°（極限）': {flexion: -20}, '踝背屈 20°（極限）': {ankle: 20},
    '踝蹠屈 30°（極限）': {ankle: -30}, '髖外展 35°（極限）': {sideBend: 35}, '髖旋轉 20°（極限）': {rotation: 20}},
};
const rigs = {}, armRig = side => rigs['arm' + side] ??= m.makeSoftRig(atlas, side), legRig = key => rigs[key] ??= m.makeBodyRig(atlas, key);
const contexts = new Map();
const context = (kind, key, name, pose) => contexts.get(kind + key + name) ?? contexts.set(kind + key + name, kind === 'arm'
  ? (() => { const {transforms} = m.buildUpperLimbMotion(atlas, key, {...m.NEUTRAL_POSE, ...pose}); return {palette: m.makePalette(armRig(key), transforms), transforms}; })()
  : (() => { const b = m.buildBodyMotion(legRig(key), {...m.BODY_NEUTRAL, ...pose}); return {palette: b.palette, matrices: b.matrices}; })()).get(kind + key + name);
const rigid = (pos, t) => { if (!t) return pos; const [qx, qy, qz, qw] = t.quaternion, [tx, ty, tz] = t.translation, o = new Float32Array(pos.length); for (let i = 0; i < pos.length; i += 3) { const x = pos[i], y = pos[i + 1], z = pos[i + 2], cx = qy * z - qz * y + qw * x, cy = qz * x - qx * z + qw * y, cz = qx * y - qy * x + qw * z; o[i] = x + 2 * (qy * cz - qz * cy) + tx; o[i + 1] = y + 2 * (qz * cx - qx * cz) + ty; o[i + 2] = z + 2 * (qx * cy - qy * cx) + tz; } return o; };
const matrix = (pos, e) => { const o = new Float32Array(pos.length); for (let i = 0; i < pos.length; i += 3) { const x = pos[i], y = pos[i + 1], z = pos[i + 2]; o[i] = e[0] * x + e[4] * y + e[8] * z + e[12]; o[i + 1] = e[1] * x + e[5] * y + e[9] * z + e[13]; o[i + 2] = e[2] * x + e[6] * y + e[10] * z + e[14]; } return o; };
/** How the viewer moves a part: {kind:'arm'|'leg', key, apply(ctx) -> positions} or null (it stays where it is). */
const skins = new Map();
function mover(p) {
  if (skins.has(p.id)) return skins.get(p.id);
  const g = G(p), region = anatomicalRegion(p), side = anatomicalSide(p);
  let out = null;
  // a landmark bound rigidly to its bone gets that bone's transform from buildUpperLimbMotion (app/mj-motion.ts)
  if (RIGID[p.id]?.name === p.name) out = {kind: 'arm', key: RIGID[p.id].side, apply: ctx => rigid(g.pos, ctx.transforms[p.id])};
  else if (p.system === 'skeletal' && !p.kind && (region === 'upper-limb' || /humerus|scapula|clavicle|radius|ulna/.test(p.name)) && (side === 'left' || side === 'right'))
    out = {kind: 'arm', key: side, apply: ctx => rigid(g.pos, ctx.transforms[p.id])};
  else {
    const tb = m.tissueBindings[p.id], bindingSide = tb ? (side === 'midline' ? tb.side : side) : null;
    if (tb?.name === p.name && bindingSide && (region === 'upper-limb' || region === 'trunk')) {
      const profile = p.system === 'arterial' || p.system === 'venous' ? m.resolveNeurovascularProfile(p.name, tb.profile) : tb.profile;
      const skin = m.bindTissue(armRig(bindingSide), profile, g.pos, p, '', g.idx);
      out = {kind: 'arm', key: bindingSide, apply: ctx => { const o = new Float32Array(g.pos.length); m.deformTissue(skin, g.pos, ctx.palette, o); return o; }};
    } else {
      const bb = m.bodyBindings[p.id];
      if (bb && bb.name === p.name && /Leg$/.test(bb.rig)) {
        if (bb.frame === null) { const skin = m.bindBodyTissue(legRig(bb.rig), g.pos, false, p); out = {kind: 'leg', key: bb.rig, apply: ctx => { const o = new Float32Array(g.pos.length); m.deformTissue(skin, g.pos, ctx.palette, o); return o; }}; }
        else out = {kind: 'leg', key: bb.rig, apply: ctx => matrix(g.pos, ctx.matrices[bb.frame].elements)};
      }
    }
  }
  skins.set(p.id, out); return out;
}
const poseSet = mv => mv ? Object.entries(POSES[mv.kind === 'arm' ? 'upper' : 'lower']).map(([name, pose]) => ({name, ctx: context(mv.kind, mv.key, name, pose)})) : [];

// ---- geometry helpers
const boxOf = pos => { const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (let i = 0; i < pos.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], pos[i + k]); hi[k] = Math.max(hi[k], pos[i + k]); } return [lo, hi]; };
// A neighbour grid of every structure that is not skin, a serous shell, a vessel-end piece or a schematic structure itself (2 mm voxels; nerves of the nerve stream not included).
const NB = .002, neighbours = new Map();
for (const p of atlas.parts) {
  if (p.system === 'integumentary' || p.system === 'serous' || p.schematic || p.stream === 'vessel-ends' || p.kind === 'landmark' || p.kind === 'surface') continue;
  const {pos} = G(p);
  for (let i = 0; i < pos.length; i += 3) { const k = Math.floor(pos[i] / NB) + ',' + Math.floor(pos[i + 1] / NB) + ',' + Math.floor(pos[i + 2] / NB); const s = neighbours.get(k); if (!s) neighbours.set(k, [p.id]); else if (s.length < 4 && !s.includes(p.id)) s.push(p.id); }
}
/** Largest distance (mm, in 2 mm steps) from a point of the structure to the nearest other structure, ignoring the ids in `self`. */
function farthestFromNeighbours(pos, self) {
  const R = Math.ceil(FAR_MM / 1000 / NB) + 1; let worst = 0;
  const stride = Math.max(3, Math.floor(pos.length / 3 / 400) * 3);
  for (let i = 0; i < pos.length; i += stride) {
    const c = [pos[i], pos[i + 1], pos[i + 2]].map(v => Math.floor(v / NB)); let found = Infinity;
    for (let r = 0; r <= R && found === Infinity; r++)
      for (let x = -r; x <= r; x++) for (let y = -r; y <= r; y++) for (let z = -r; z <= r; z++) {
        if (Math.max(Math.abs(x), Math.abs(y), Math.abs(z)) !== r) continue;
        const s = neighbours.get((c[0] + x) + ',' + (c[1] + y) + ',' + (c[2] + z)); if (s && s.some(id => !self.has(id))) found = Math.min(found, Math.max(0, r - 1) * NB * 1000);
      }
    worst = Math.max(worst, found);
  }
  return worst;
}

// ---- 1 + 3: bone landmarks
const findings = [];
const add = (kind, p, zone, problem, detail) => findings.push({kind, id: p.id, name: p.name, zone, problem, detail});
const landmarks = atlas.parts.filter(p => p.kind === 'landmark');
// Lines, crests, fossae and borders run along most of a bone by definition (iliac crest, superior nuchal line, infraspinous fossa): they may reach 90 % of the bone's largest side.
const sizeLimit = p => /\b(?:line|crest|fossa|border)\b/i.test(p.name) ? .9 : SIZE_RATIO;
const hostOf = p => { const hostName = PAOKAO[p.id]?.parent; return hostName && (p.sex === 'female' ? atlas.parts.find(q => q.name === hostName && q.sex === 'female' && !q.kind) : byName.get(hostName)); };
/** Problems of one landmark: [problem, detail]. `lm` is how it moves (the viewer's binding, or a forced one for the negative control). */
function landmarkProblems(p, host, lm = mover(p)) {
  const out = [], g = G(p), hg = G(host), S = surfaceIndex(hg.pos, hg.idx);
  const off = pos => { let mx = 0; for (let i = 0; i < pos.length; i += 3) mx = Math.max(mx, S.distance([pos[i], pos[i + 1], pos[i + 2]], .05)); return mx * 1000; };
  const rest = off(g.pos), [lo, hi] = boxOf(g.pos), [blo, bhi] = boxOf(hg.pos), t = SURFACE_MM / 1000;
  const outside = [0, 1, 2].some(k => lo[k] < blo[k] - t || hi[k] > bhi[k] + t), size = Math.max(...hi.map((v, k) => v - lo[k])) / Math.max(...bhi.map((v, k) => v - blo[k]));
  if (rest > SURFACE_MM) out.push(['靜止時離開骨面', `最遠 ${rest === Infinity ? '> 50' : rest.toFixed(1)} mm（${host.name}）`]);
  if (outside) out.push(['包圍盒超出所屬骨骼', host.name]);
  if (size > sizeLimit(p)) out.push(['尺寸過大', `最長邊為骨骼的 ${(size * 100).toFixed(0)}%（上限 ${sizeLimit(p) * 100}%）`]);
  const bm = mover(host);
  if (!lm && !bm) return out;
  if (!lm || !bm || lm.kind !== bm.kind || lm.key !== bm.key) { out.push(['關節動作時不跟所屬骨骼', `標誌${lm ? '會動' : '不動'}、骨骼${bm ? '會動' : '不動'}`]); return out; }
  const bad = [];
  for (const {name, ctx} of poseSet(lm)) {
    const bone = bm.apply(ctx), Sp = surfaceIndex(bone, hg.idx), pos = lm.apply(ctx); let mx = 0;
    for (let i = 0; i < pos.length; i += 3) mx = Math.max(mx, Sp.distance([pos[i], pos[i + 1], pos[i + 2]], .5));
    mx *= 1000; if (mx > SURFACE_MM) bad.push(`${name} ${mx === Infinity ? '> 500' : mx.toFixed(0)} mm`);
  }
  if (bad.length) out.push(['關節動作時離開骨面', bad.join('；')]);
  return out;
}
for (const p of landmarks) {
  const host = hostOf(p), zone = zoneOf(host ?? p);
  if (!host) { add('landmark', p, zone, '找不到所屬骨骼', PAOKAO[p.id]?.parent ?? '—'); continue; }
  for (const [problem, detail] of landmarkProblems(p, host)) add('landmark', p, zone, problem, detail);
}
// Negative control for landmarks: the left intertubercular groove bound the old way (soft tissue, the 'arm' profile of the upper-arm muscles) must be caught.
const controlLandmark = (() => {
  const p = landmarks.find(q => q.name === NEGATIVE.landmark), host = p && hostOf(p); if (!host) return false;
  const g = G(p), skin = m.bindTissue(armRig('left'), 'arm', g.pos, p, '', g.idx);
  const soft = {kind: 'arm', key: 'left', apply: ctx => { const o = new Float32Array(g.pos.length); m.deformTissue(skin, g.pos, ctx.palette, o); return o; }};
  return landmarkProblems(p, host, soft).some(([problem]) => problem === '關節動作時離開骨面');
})();

if (onlyLandmarks) {
  const list = findings.filter(f => f.kind === 'landmark');
  for (const f of list) console.error(`  ${f.name} (${f.id}): ${f.problem} ${f.detail}`);
  if (!controlLandmark) { console.error(`Negative control passed (the check is broken): ${NEGATIVE.landmark} bound as soft tissue`); process.exit(1); }
  console.log(`Bone landmarks: ${landmarks.length} checked at rest and at the joint poses (limits included): ${list.length} problems; negative control (${NEGATIVE.landmark} bound as soft tissue) caught.`);
  process.exit(list.length ? 1 : 0);
}

// ---- 2 + 3: schematic vessels and nerves
const VESSEL_SYSTEMS = new Set(['arterial', 'venous', 'nervous', 'lymphatic']);
const ends = atlas.parts.filter(p => p.stream === 'vessel-ends');
const pk = atlas.parts.filter(p => p.stream === 'paokao' && p.schematic && VESSEL_SYSTEMS.has(p.system) && p.kind !== 'ganglion');
let checkedVessels = 0, controlVessel = false;
for (const p of [...ends, ...pk]) {
  const isEnd = p.stream === 'vessel-ends', main = isEnd ? byId.get(p.id.replace(/-END$/, '')) : null, zone = zoneOf(main ?? p), g = G(p);
  checkedVessels++;
  // the selectable structure: today a click selects only the part under the pointer (app/page.tsx choosePart), so a vessel-end piece is a structure of its own
  const sizes = pieceSizes([g]);
  if (isEnd) {
    // What a click selects (app/mj-vessel-unit.ts): the vessel together with its end piece. It must be one continuous structure.
    // A vessel that is several separate segmental tubes by anatomy (the lumbar veins: each drains on its own into the inferior vena cava or the ascending lumbar vein, MULTI_PIECE_VESSELS) counts as that many independent
    // structures: its end piece must not add loose segments of its own, but the separate tubes are not "broken".
    const unit = vesselUnit(p.id, id => byId.has(id)).map(id => G(byId.get(id))), joined = pieceSizes(unit).length, expected = main && MULTI_PIECE_VESSELS.test(main.name) ? pieceSizes([G(main)]).length : 1;
    if (joined > expected) add('vessel-end', p, zone, '與主血管合併後仍斷開', `點選得到 ${joined} 段（預期 ${expected} 段；末端片本身 ${sizes.length} 段）`);
    if (p.name === NEGATIVE.vessel) controlVessel = sizes.length > 1;   // the old selection (the end piece alone) must be found broken
  } else if (sizes.length > 1) add('schematic', p, zone, /(?:arteries|veins|branches|plexus|rami)\b/i.test(p.name) || /dorsal ramus of thoracic|perforating branch/i.test(p.name) ? '多段（名稱為複數、叢或多節段，可能是設計，待確認）' : '斷開成多段', `${sizes.length} 段`);
  if (!isEnd) {
    const far = farthestFromNeighbours(g.pos, new Set([p.id]));
    if (far > FAR_MM) add('schematic', p, zone, '離開相鄰構造太遠', `有一段離最近的構造 > ${FAR_MM} mm`);
    const mv = mover(p), bad = [];
    for (const {name, ctx} of poseSet(mv)) { const s = pieceSizes([{pos: mv.apply(ctx), idx: g.idx}]); if (s.length > sizes.length) bad.push(`${name}：${s.length} 段`); }
    if (bad.length) add('schematic', p, zone, '關節動作時斷開', bad.join('；'));
  }
}
// schematic tubes of the nerve stream (suboccipital region; they do not move with a limb)
const ns = JSON.parse(fs.readFileSync(file('public/models/nerve-stream.json'), 'utf8'));
for (const ch of ns.chunks) {
  const meshes = ch.meshes.filter(r => r.schematic); if (!meshes.length) continue;
  const raw = fs.readFileSync(file('public' + ch.url)), buf = ch.url.endsWith('.gz') ? zlib.gunzipSync(raw) : raw;
  for (const r of meshes) {
    checkedVessels++;
    const pos = new Float32Array(buf.buffer.slice(buf.byteOffset + r.positions, buf.byteOffset + r.positions + r.vertexCount * 12)), idx = new Uint32Array(buf.buffer.slice(buf.byteOffset + r.indices, buf.byteOffset + r.indices + r.indexCount * 4));
    const name = r.name.replace(/\.(l|r)\.\d+$/, (_, s) => '').trim(), side = /\.l\./.test(r.name) ? 'Left ' : /\.r\./.test(r.name) ? 'Right ' : '', p = {id: 'nerve-stream', name: side + name};
    const sizes = pieceSizes([{pos, idx}]); if (sizes.length > 1) add('schematic', p, 'head-neck', '斷開成多段', `${sizes.length} 段`);
    const far = farthestFromNeighbours(pos, new Set()); if (far > FAR_MM) add('schematic', p, 'head-neck', '離開相鄰構造太遠', `有一段離最近的構造 > ${FAR_MM} mm`);
  }
}

// ---- 4: negative controls
const control = {
  landmark: controlLandmark,
  vessel: controlVessel,
};

// ---- report
const zoneZh = new Map(ZONES), uniq = list => new Set(list.map(f => f.id + '|' + f.name)).size;
const COLUMNS = [
  ['骨性標誌', f => f.kind === 'landmark'],
  ['血管末端片：點選（主血管＋末端片）後仍斷開', f => f.kind === 'vessel-end'],
  ['示意血管／神經：斷開', f => f.kind === 'schematic' && f.problem === '斷開成多段'],
  ['示意血管／神經：多段但可能是設計（待確認）', f => f.kind === 'schematic' && f.problem.startsWith('多段')],
  ['示意血管／神經：離開相鄰構造', f => f.kind === 'schematic' && f.problem === '離開相鄰構造太遠'],
];
const lines = ['# 示意模型全站檢查報告', '', '由 `node scripts/check-schematic-models.mjs --write` 生成（不開瀏覽器；數值檢查，未在 3D 畫面確認）。', '',
  `檢查範圍：骨性標誌 ${landmarks.length} 個；示意血管與神經 ${checkedVessels} 個（血管末端片 ${ends.length}、PK 示意血管／神經 ${pk.length}、神經串流示意管 ${checkedVessels - ends.length - pk.length}）。`, '',
  `門檻：骨面距離 ≤ ${SURFACE_MM} mm；標誌最長邊 ≤ 所屬骨骼最長邊的 ${SIZE_RATIO * 100}%（線、嵴、窩、緣 ≤ 90%）；斷開＝兩段之間的空隙大於約 ${GAP_MM} mm；離開相鄰構造＝有一段離最近的構造（不計皮膚與漿膜）超過 ${FAR_MM} mm。關節姿勢與 \`scripts/test-vessel-motion.mjs\` 相同（含極限角度）。區域：骨性標誌按所屬骨骼，末端片按所屬主血管。`, '',
  `反向對照：${NEGATIVE.landmark} 以舊的軟組織綁定重演（關節動作）${control.landmark ? '已如預期判為失敗' : '**沒有判為失敗：檢查失效**'}；${NEGATIVE.vessel} 的末端片單獨選取（舊的點選方式，斷開）${control.vessel ? '已如預期判為失敗' : '**沒有判為失敗：檢查失效**'}。`, '',
  '## 按區域的數目（結構數）', '', `| 區域 | ${COLUMNS.map(c => c[0]).join(' | ')} |`, `| --- | ${COLUMNS.map(() => '---:').join(' | ')} |`,
  ...ZONES.map(([z, zh]) => `| ${zh} | ${COLUMNS.map(([, t]) => uniq(findings.filter(f => f.zone === z && t(f)))).join(' | ')} |`),
  `| **合計** | ${COLUMNS.map(([, t]) => uniq(findings.filter(t))).join(' | ')} |`, ''];
for (const [z, zh] of ZONES) {
  const list = findings.filter(f => f.zone === z); if (!list.length) continue;
  lines.push(`## ${zh}`, '');
  const sec = (title, rows) => { if (!rows.length) return; lines.push(`### ${title}（${uniq(rows)}）`, '', '| 結構 | 編號 | 問題 | 細節 |', '| --- | --- | --- | --- |', ...rows.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id)).map(f => `| ${f.name} | ${f.id} | ${f.problem} | ${f.detail} |`), ''); };
  sec('骨性標誌', list.filter(f => f.kind === 'landmark'));
  sec('示意血管／神經（PK 與神經串流）', list.filter(f => f.kind === 'schematic'));
  sec('血管末端片', list.filter(f => f.kind === 'vessel-end'));
}
if (write) fs.writeFileSync(file('docs/schematic-models-report.md'), lines.join('\n'));
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(findings, null, 1));
console.log(`Schematic models: ${landmarks.length} landmarks, ${checkedVessels} schematic vessels/nerves; ${new Set(findings.map(f => f.id + f.name)).size} structures with problems (${findings.length} findings).`);
for (const [z, zh] of ZONES) console.log(`  ${zh}: ${COLUMNS.map(([c, t]) => `${c.trim().split('（')[0]} ${uniq(findings.filter(f => f.zone === z && t(f)))}`).join('、')}`);
if (!control.landmark || !control.vessel) { console.error(`Negative control passed (the check is broken): ${!control.landmark ? NEGATIVE.landmark : ''} ${!control.vessel ? NEGATIVE.vessel + ' (end piece)' : ''}`); process.exit(1); }
process.exit(findings.length ? 1 : 0);
