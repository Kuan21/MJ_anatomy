// Vessel ends. The atlas vessels are closed tubes cut off where the source segmentation stopped, so once the muscles around them are hidden some
// ends hang in mid-air. Every end is audited (scripts/audit-vessel-ends.mjs) and then handled in one of three ways:
//   joined    nothing to do: the end touches its parent or branch
//   gap       a vessel of the same kind lies within 12 mm: a thin curved connector tube is added, so the end now continues into it
//   fade      a small vessel (radius <= 1.8 mm) that really does end in muscle, organ or fascia, or nothing is near it: the end is tapered to a point
//   enters    a large vessel entering an organ or bone (aorta root, hepatic veins …): left as it is and listed
// docs/vessel-ends.md, plus app/mj-vessel-ends.json (vessels whose cards say that an end fades into tissue).
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createStream} from './lib/stream-writer.mjs';
import {tube} from './lib/nerve-schematics.mjs';
import {auditEnds, atlas, geom, surfacePieces, Grid} from './audit-vessel-ends.mjs';
import {weldSurface, endFrame as endFrameOf, bridgePath, sub, add, len, unit} from './lib/vessel-frames.mjs';
import {loadFullAtlas, STREAMS} from './lib/full-atlas.mjs';
import {loadVessels, analyse, bridgeable, regionTools} from './lib/vessel-segments.mjs';
import {planTips, tipKey, NECK_ROOT_ARM_RIG, PELVIC_VESSELS} from './lib/vessel-tip-plan.mjs';

const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
const stamp = file('work/vessel-ends.stamp'), out = new URL('public/models/stream/', root), manifest = file('public/models/vessel-ends/vessel-ends-stream.json.gz');
const inputs = ['scripts/prepare-vessel-ends.mjs', 'scripts/lib/vessel-tip-plan.mjs', 'scripts/lib/vessel-relation.mjs', 'app/mj-vessel-parents.json', 'scripts/lib/vessel-tip-shape.mjs', 'scripts/audit-vessel-ends.mjs', 'scripts/lib/nerve-schematics.mjs', 'scripts/lib/vessel-frames.mjs', 'scripts/lib/vessel-segments.mjs', 'scripts/lib/tube-tips.mjs', 'scripts/lib/region-entry.ts', 'app/mj-part-regions.ts', 'public/models/atlas.json', 'public/models/atlas-stream.json', 'app/anatomy-source-overrides.json', ...STREAMS.filter(s => !s.startsWith('vessel-ends')).map(s => 'public/models/' + s)];
const hash = createHash('sha256').update(inputs.map(f => fs.readFileSync(file(f))).join('')).digest('hex');
try { if (fs.readFileSync(stamp, 'utf8') === hash && fs.existsSync(manifest)) { console.log('Vessel ends: up to date.'); process.exit(0); } } catch {}

const GAP_MM = 12, FADE_RADIUS = .0018;

const unshaped = new Set(JSON.parse(fs.readFileSync(file('public/models/atlas-stream.json'), 'utf8')).shapedVesselTips?.unshaped ?? []);   // tips the stream step found no wall to narrow: they keep the old cone
// tips shaped by the stream step, or no end at all (the vessel carries on past them), get no cone
const rows = auditEnds(), plan = process.env.MJ_NO_TIP_SHAPE ? {tapers: [], buried: []} : await planTips(rows), shapedTips = new Set([...plan.tapers.filter(t => !unshaped.has(tipKey(t.row))), ...plan.buried].map(t => t.row)), parts = new Map(atlas.parts.map(p => [p.id, p])), cache = new Map();
/** Welded surface graph of a vessel mesh (cached). */
function surface(id) {
  if (!cache.has(id)) { const g = geom(parts.get(id)); cache.set(id, weldSurface(g.pos, g.idx)); }
  return cache.get(id);
}
const endFrame = (id, tip) => endFrameOf(surface(id), tip);

const report = [];
const pieces = [];   // {id, tip, action, geometry}
const piece = (id, geometry, tip, action) => pieces.push({id, tip, action, geometry});
// Limb vessels get round connectors (12 sides); the rest keep the light 5-sided pieces.
const {anatomicalRegion} = await regionTools(), limbIds = new Set(atlas.parts.filter(p => ['upper-limb', 'lower-limb'].includes(anatomicalRegion(p))).map(p => p.id));
// Round connectors: 12 sides on limb vessels and on the vessels of the abdominal and chest wall (the ones in front of the camera there), 8 elsewhere. The light 5-sided prisms of the first version read as faceted, segmented
// vessels where a wall vessel meets its end piece.
// Intercostal and subcostal vessels end beside ribs and discs: as 12-sided prisms their end pieces sank 2-3 mm into the 9th/12th ribs and the intervertebral disk (stability check), so they keep the light end pieces.
const WALL_VESSELS = /epigastric|circumflex iliac|musculophrenic|lumbar (?:artery|vein)|thoracoepigastric/i;
// Kept light until the stability check passes with round ones (2026-11-14, split out of this change): the inferior epigastric end piece overlapped the femoral artery connector end (112 coincident faces).
// The medial occipital artery (cerebral, inside the skull) keeps the light end pieces as well: its two meshes (FJ1691 and FJ1691M) have end pieces of the same shape, and as 12-sided prisms they coincide (182 faces, stability check).
const LIGHT_ENDS = /inferior epigastric|medial occipital artery/i, lightIds = new Set(atlas.parts.filter(p => LIGHT_ENDS.test(p.name)).map(p => p.id));
// The vessels of the head and neck and the subclavian and brachiocephalic vessels at the neck root are round too (second exam, 2026-11-17): the 5-sided pieces there read as blue triangles and red spikes beside the large veins.
// The neck root is judged by the position of each end, not by the region label or the centre of the vessel (the thoracic apical vessels, the deep cervical and suprascapular vessels and the first intercostal vessels around the clavicle carry other
// labels, and the internal thoracic artery runs down the chest): an end within |x| 170 mm, y 1.37-1.47 m, |z| 80 mm gets round pieces.
const atNeckRoot = at => Math.abs(at[0]) <= .17 && at[1] >= 1.37 && at[1] <= 1.47 && Math.abs(at[2]) <= .08;
const neckIds = new Set([...atlas.parts.filter(p => anatomicalRegion(p) === 'head-neck').map(p => p.id), ...NECK_ROOT_ARM_RIG]);
const wallIds = new Set(atlas.parts.filter(p => WALL_VESSELS.test(p.name)).map(p => p.id)), round = id => (limbIds.has(id) || wallIds.has(id) || neckIds.has(id)) && !lightIds.has(id);
const roundTip = row => (round(row.id) || (atNeckRoot(row.at) && !lightIds.has(row.id))), sides = row => roundTip(row) ? 12 : 5;
// A bridge between two vessels must not run through a bone (the bridge of the left inferior gluteal artery to the internal iliac artery went 4 mm into the sacrum, check stability 2026-11-22): the points of its path that lie inside a bone,
// or closer to it than the tube is wide, are pushed out along the bone's outward normal; the two ends stay where they are. Bone meshes have outward-facing triangles.
const boneGrid = new Grid(); for (const p of atlas.parts.filter(q => q.system === 'skeletal')) { const g = geom(p); for (let i = 0; i < g.idx.length; i += 3) { const t = [0, 1, 2].map(k => [g.pos[g.idx[i + k] * 3], g.pos[g.idx[i + k] * 3 + 1], g.pos[g.idx[i + k] * 3 + 2]]); boneGrid.add(p.id, t[0], t[1], t[2]); } }
function clearOfBone(path, radius, keepEnd = 2) {
  const margin = radius + .0006;
  return path.map((pt, i) => {
    if (i < 2 || i >= path.length - keepEnd) return pt;   // the ends stay on their vessels
    let q = pt;
    for (let k = 0; k < 4; k++) {
      const hit = boneGrid.nearest(q, .02, new Set()); if (!hit.tag || !hit.tri || hit.d > .02) break;
      const [a, b, c] = hit.tri, n = unit([(b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]), (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])]);
      const signed = (q[0] - hit.q[0]) * n[0] + (q[1] - hit.q[1]) * n[1] + (q[2] - hit.q[2]) * n[2], d = signed >= 0 ? hit.d : -hit.d;   // negative: inside the bone
      if (d >= margin) break;
      q = add(q, n, margin - d + .0003);
    }
    return q;
  });
}
const RENAL_VESSELS = /^Right renal vein$/;   // the one connector that is closed to the vena cava after the renal hilum shift moved the vein (the left renal vein runs beside the pancreas: deeper there would touch it)
for (const row of rows) {
  const frame = row.kind === 'joined' ? null : endFrame(row.id, row.at);
  let action = row.kind === 'joined' ? 'joined' : 'enters';
  if (frame) {
    const gap = row.toSameMm <= GAP_MM && row.closest, inTissue = row.toTissueMm <= 4;
    if (row.kind === 'dangling' && gap) {
      action = 'gap';
      const d = row.toSameMm / 1000, target = row.closest, chord = unit(sub(target, row.at));
      const bend = add(row.at, chord, d * .5), mid = add(bend, frame.dir, d * .18), through = add(target, chord, RENAL_VESSELS.test(row.name) ? .004 : .001);   // the right renal vein is shifted at the hilum while the vena cava stays (scripts/test-renal-hilum-shift.mjs): its connector to the cava ends 4 mm inside it, so the joint stays closed after the shift
      const gapPath = [add(row.at, frame.dir, -.0015), row.at, mid, through];   // the bend point of a pelvic connector leaves the bone as well
      piece(row.id, tube(PELVIC_VESSELS.test(row.name) ? clearOfBone(gapPath, frame.radius, 1) : gapPath, frame.radius * .95, frame.radius * .75, roundTip(row) ? 12 : 6, sides(row)), row.at, 'gap');
    } else if (frame.radius <= FADE_RADIUS) {
      action = 'fade';
      if (shapedTips.has(row)) { /* the vessel's own mesh narrows to a rounded tip (scripts/prepare-model-stream.mjs): no cone beyond the end */ } else {
      const L = Math.min(.008, .003 + 3 * frame.radius);
      piece(row.id, tube([add(row.at, frame.dir, -.001), add(row.at, frame.dir, L / 2), add(row.at, frame.dir, L)], frame.radius * .95, frame.radius * .1, roundTip(row) ? 4 : 2, sides(row)), row.at, 'fade'); }
    } else if (!inTissue && row.kind === 'dangling') action = 'enters';
  }
  report.push({id: row.id, name: row.name, system: row.system, action, at: row.at, radiusMm: frame ? +(frame.radius * 1000).toFixed(1) : null, toSameMm: row.toSameMm, toTissueMm: row.toTissueMm, nearest: row.nearestSame});
}

// Bridges (upper and lower limb): every end whose next segment lies further away than half the vessel's diameter gets a spline connector that tapers from its own
// diameter to the next segment's, replacing the simple connector of the same end. The measurement is the one scripts/audit-vessel-continuity.mjs uses (scripts/lib/vessel-segments.mjs).
const source = loadFullAtlas({streams: STREAMS.filter(s => !s.startsWith('vessel-ends'))});   // the vessels the viewer shows, without the pieces this step makes
const {rows: gapRows} = await analyse({regions: ['upper', 'lower'], mode: 'before', V: await loadVessels({mode: 'before', source})});
/** Signed distance (m) of a point to the nearest bone triangle, negative inside the bone; null when no bone lies within 2 cm. */
function boneSigned(q) {
  const hit = boneGrid.nearest(q, .02, new Set()); if (!hit.tag || !hit.tri || hit.d > .02) return null;
  const [a, b, c] = hit.tri, n = unit([(b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]), (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])]);
  return ((q[0] - hit.q[0]) * n[0] + (q[1] - hit.q[1]) * n[1] + (q[2] - hit.q[2]) * n[2] >= 0 ? 1 : -1) * hit.d;
}
/** Where a bridge to a pelvic trunk ends inside the bone (the left internal iliac artery lies 3.6 mm in the sacrum, so a bridge to it did too): the nearest wall point of that trunk that is clear of the bone, moved inside the trunk. */
function targetOutOfBone(r, t, to) {
  const s0 = boneSigned(to); if (s0 == null || s0 > -.001) return null;
  const np = atlas.parts.find(q => q.id === r.neighbourId); if (!np) return null;
  const g = geom(np), v = i => [g.pos[i * 3], g.pos[i * 3 + 1], g.pos[i * 3 + 2]], n = g.pos.length / 3, depth = Math.min(.0006 + t.radius * .5, .002);
  let best = null;
  for (let i = 0; i < n; i++) {
    const w = v(i), d = len(sub(w, r.capAt)); if (best && d >= best.d) continue;
    const sw = boneSigned(w); if (sw == null || sw < 0) continue;
    const c = [0, 0, 0]; let m = 0; for (let j = 0; j < n; j += 3) { const u = v(j); if (len(sub(u, w)) < t.radius * 2) { for (let k = 0; k < 3; k++) c[k] += u[k]; m++; } }
    if (m < 3) continue;
    const inward = unit(sub(c.map(x => x / m), w)), p2 = add(w, inward, depth), s2 = boneSigned(p2); if (s2 != null && s2 < -.001) continue;
    best = {d, to: p2};
  }
  return best?.to ?? null;
}
const planned = gapRows.filter(bridgeable), mutual = new Set();
let bridged = 0;
for (const r of planned) {
  if (r.kind === 'end-to-end') { // two ends facing each other would get two tubes: keep one
    const twin = planned.find(o => o !== r && o.id === r.neighbourId && o.neighbourId === r.id && len(sub(o.capAt, r.target.point)) < .002 && len(sub(r.capAt, o.target.point)) < .002);
    if (twin && (mutual.has(twin) || r.id > twin.id)) continue; mutual.add(r);
  }
  const t = r.target; let to = r.kind === 'end-to-end' ? add(t.point, t.dir, -.001) : add(t.point, t.inward, Math.min(.0006 + t.radius * .5, .002));
  let moved = false;
  if (PELVIC_VESSELS.test(r.name)) { const out = targetOutOfBone(r, t, to); if (out) { to = out; moved = true; } }   // the trunk end lies in the bone: join the wall of the trunk where it is clear of it
  const travel = r.kind === 'end-to-end' && !moved ? t.dir.map(v => -v) : unit(sub(to, r.capAt));
  const r1 = r.kind === 'end-to-end' && !moved ? Math.min(t.radius, r.radius * 2.2) : r.radius * .85;
  const path = PELVIC_VESSELS.test(r.name) ? clearOfBone(bridgePath(r.capAt, r.dir, to, travel), r.radius) : bridgePath(r.capAt, r.dir, to, travel);   // pelvic vessels only: the bridges of the limbs keep their paths
  const near = pieces.filter(q => q.id === r.id && q.action === 'gap' && len(sub(q.tip, r.tipAt)) < .004);
  for (const q of near) pieces.splice(pieces.indexOf(q), 1);
  const far = pieces.filter(q => q.id === r.id && q.action === 'fade' && len(sub(q.tip, r.tipAt)) < .004);
  for (const q of far) pieces.splice(pieces.indexOf(q), 1);
  const samples = Math.max(16, Math.ceil((r.gapMm / 1.2) / (path.length - 1)) * (path.length - 1));
  piece(r.id, tube(path, r.radius * .95, r1 * .97, samples, 12), r.tipAt, 'bridge'); bridged++;
  const hit = report.find(x => x.id === r.id && len(sub(x.at, r.tipAt)) < .004); if (hit) hit.action = 'bridge';
}
console.log(`Vessel ends: ${bridged} limb bridges planned from ${gapRows.length} adjacent-segment ends.`);
// A vessel whose mesh lost a stretch in the segmentation and kept a small fragment of it, floating a few millimetres away from the rest (check VS-06: the posterior division of the left renal artery, a 22-triangle piece 11 mm
// from the rest of the artery): a thin link tube from the fragment to the nearest point of the main piece makes it one vessel again. Only the vessels listed here; two separate vessels in one mesh (the lumbar veins) are not linked.
const LINK_FRAGMENTS = /^Posterior division of left renal artery$/;
let linked = 0;
for (const p of atlas.parts.filter(q => LINK_FRAGMENTS.test(q.name))) {
  const pcs = surfacePieces(geom(p), 8).sort((a, b) => b.idx.length - a.idx.length), main = pcs[0], centre = pc => { const c = [0, 0, 0]; for (let i = 0; i < pc.pos.length; i += 3) for (let k = 0; k < 3; k++) c[k] += pc.pos[i + k] / (pc.pos.length / 3); return c; };
  for (const frag of pcs.slice(1)) {
    let best = {d: Infinity};
    for (let i = 0; i < frag.pos.length; i += 3) for (let j = 0; j < main.pos.length; j += 3) {
      const d = Math.hypot(frag.pos[i] - main.pos[j], frag.pos[i + 1] - main.pos[j + 1], frag.pos[i + 2] - main.pos[j + 2]);
      if (d < best.d) best = {d, a: [frag.pos[i], frag.pos[i + 1], frag.pos[i + 2]], b: [main.pos[j], main.pos[j + 1], main.pos[j + 2]]};
    }
    if (!(best.d < .03)) continue;
    const cf = centre(frag), cm = centre(main), fb = endFrame(p.id, best.b), r = Math.min(.0008, (fb?.radius ?? .0015) * .6);
    const inA = add(best.a, unit(sub(cf, best.a)), Math.min(.001, len(sub(cf, best.a)))), inB = add(best.b, unit(sub(cm, best.b)), .0008), chord = unit(sub(inB, inA));
    piece(p.id, tube([inA, best.a, add(best.a, chord, best.d / 3), add(best.a, chord, 2 * best.d / 3), best.b, inB], r, r, 16, 12), best.a, 'link'); linked++;
  }
}
console.log(`Vessel ends: ${linked} link tube(s) between a vessel and a fragment of its own mesh.`);
const byPart = new Map(); for (const q of pieces) { if (!byPart.has(q.id)) byPart.set(q.id, []); byPart.get(q.id).push(q.geometry); }

fs.mkdirSync(out, {recursive: true}); fs.mkdirSync(new URL('public/models/vessel-ends/', root), {recursive: true}); fs.mkdirSync(new URL('work/', root), {recursive: true});
const stream = createStream(out, 'vessel-ends');
// Each end piece moves exactly like the vessel it finishes: it copies that vessel's arm (tissue) and body-rig bindings.
const paokaoJson = JSON.parse(fs.readFileSync(file('app/biomechanics-v2/paokao-bindings.json'), 'utf8')), tissueJson = {...JSON.parse(fs.readFileSync(file('app/biomechanics-v2/tissue-bindings.json'), 'utf8')), ...paokaoJson.tissue}, bodyJson = {...JSON.parse(fs.readFileSync(file('app/biomechanics-v2/body-bindings.json'), 'utf8')), ...paokaoJson.body}, endBindings = {tissue: {}, body: {}};
for (const [id, list] of byPart) {
  const positions = [], indices = [];
  for (const g of list) { const base = positions.length / 3; positions.push(...g.positions); for (const i of g.indices) indices.push(i + base); }
  const parent = parts.get(id) ?? source.atlas.parts.find(q => q.id === id);
  if (tissueJson[id]) endBindings.tissue[`${id}-END`] = {...tissueJson[id]};
  if (bodyJson[id]) endBindings.body[`${id}-END`] = {...bodyJson[id]};
  stream.add({id: `${id}-END`, conceptId: parent.conceptId, name: parent.name, system: parent.system, schematic: true}, Float32Array.from(positions), Uint32Array.from(indices));
}
const info = stream.finish({source: 'Generated for this atlas from the vessel meshes (connector and taper pieces)', license: 'Derived from BodyParts3D (CC BY-SA 2.1 Japan)', attribution: 'Connector and taper pieces added at audited vessel ends by scripts/prepare-vessel-ends.mjs.'}, new URL(manifest, 'file:'));

const count = k => report.filter(r => r.action === k).length, fading = {};
for (const r of report) if (r.action === 'fade') fading[r.id] = (fading[r.id] ?? 0) + 1;
fs.writeFileSync(file('app/mj-vessel-ends.json'), JSON.stringify(fading));
fs.writeFileSync(file('app/biomechanics-v2/vessel-end-bindings.json'), JSON.stringify(endBindings));
const grouped = new Map();
for (const r of report.filter(r => r.action === 'gap' || r.action === 'enters')) {
  const key = r.id + r.action, g = grouped.get(key) ?? {name: r.name, id: r.id, action: r.action, n: 0, radius: 0, same: Infinity, tissue: Infinity};
  g.n++; g.radius = Math.max(g.radius, r.radiusMm ?? 0); g.same = Math.min(g.same, r.toSameMm); g.tissue = Math.min(g.tissue, r.toTissueMm); grouped.set(key, g);
}
const md = [`# 血管末端審核`, '', `共檢查 ${report.length} 個血管末端（動脈與靜脈；每個血管網格的各分支尖端）。`, '', '| 處理 | 數量 | 說明 |', '| --- | ---: | --- |',
  `| 原本已相連 | ${count('joined')} | 末端接到同類型的上游或分支血管，不處理 |`,
  `| 補接（connector） | ${count('gap')} | 12 mm 內有同類型血管，加一條細而彎的連接管，接回母血管 |`,
  `| 樣條橋接（bridge） | ${count('bridge')} | 上肢與下肢：下一段血管距離大於本段管徑一半者，加一條口徑漸變的樣條連接管（半徑由本段漸變到下一段），取代簡單連接管 |`,
  `| 漸細（fade） | ${count('fade')} | 半徑 1.8 mm 以下的小血管，真實解剖上止於肌肉、器官或筋膜；末端收成尖端，資料卡註明「末端逐漸變細，進入周圍組織」 |`,
  `| 進入器官／其他（enters） | ${count('enters')} | 較大的血管進入器官或骨（如主動脈根部、肝靜脈進入肝），不改形狀，列在下方供人工複查 |`, '',
  '## 補接與未處理清單', '', '| 血管 | 處理（末端數） | 最大半徑 (mm) | 最近同類血管 (mm) | 最近組織 (mm) |', '| --- | --- | ---: | ---: | ---: |',
  ...[...grouped].map(([key, g]) => `| ${g.name} (${g.id}) | ${g.action} × ${g.n} | ${g.radius} | ${g.same} | ${g.tissue} |`), '',
  '重新產生：`node scripts/prepare-vessel-ends.mjs`（輸入變動時自動重跑）。', ''].join('\n');
fs.writeFileSync(file('docs/vessel-ends.md'), md);
fs.writeFileSync(stamp, hash);
console.log(`Vessel ends: ${report.length} audited — joined ${count('joined')}, gap ${count('gap')}, fade ${count('fade')}, enters ${count('enters')}; ${info.parts} pieces in ${info.chunks} packages, ${(info.gzipBytes / 1e6).toFixed(2)} MB.`);
