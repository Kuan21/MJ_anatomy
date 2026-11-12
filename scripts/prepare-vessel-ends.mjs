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
import {auditEnds, atlas, geom} from './audit-vessel-ends.mjs';
import {weldSurface, endFrame as endFrameOf, bridgePath, sub, add, len, unit} from './lib/vessel-frames.mjs';
import {loadFullAtlas, STREAMS} from './lib/full-atlas.mjs';
import {loadVessels, analyse, bridgeable, regionTools} from './lib/vessel-segments.mjs';

const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
const stamp = file('work/vessel-ends.stamp'), out = new URL('public/models/stream/', root), manifest = file('public/models/vessel-ends/vessel-ends-stream.json.gz');
const inputs = ['scripts/prepare-vessel-ends.mjs', 'scripts/audit-vessel-ends.mjs', 'scripts/lib/nerve-schematics.mjs', 'scripts/lib/vessel-frames.mjs', 'scripts/lib/vessel-segments.mjs', 'scripts/lib/tube-tips.mjs', 'scripts/lib/region-entry.ts', 'app/mj-part-regions.ts', 'public/models/atlas.json', 'app/anatomy-source-overrides.json', ...STREAMS.filter(s => !s.startsWith('vessel-ends')).map(s => 'public/models/' + s)];
const hash = createHash('sha256').update(inputs.map(f => fs.readFileSync(file(f))).join('')).digest('hex');
try { if (fs.readFileSync(stamp, 'utf8') === hash && fs.existsSync(manifest)) { console.log('Vessel ends: up to date.'); process.exit(0); } } catch {}

const GAP_MM = 12, FADE_RADIUS = .0018;

const rows = auditEnds(), parts = new Map(atlas.parts.map(p => [p.id, p])), cache = new Map();
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
const sides = id => limbIds.has(id) ? 12 : 5;
for (const row of rows) {
  const frame = row.kind === 'joined' ? null : endFrame(row.id, row.at);
  let action = row.kind === 'joined' ? 'joined' : 'enters';
  if (frame) {
    const gap = row.toSameMm <= GAP_MM && row.closest, inTissue = row.toTissueMm <= 4;
    if (row.kind === 'dangling' && gap) {
      action = 'gap';
      const d = row.toSameMm / 1000, target = row.closest, chord = unit(sub(target, row.at));
      const bend = add(row.at, chord, d * .5), mid = add(bend, frame.dir, d * .18), through = add(target, chord, .001);
      piece(row.id, tube([add(row.at, frame.dir, -.0015), row.at, mid, through], frame.radius * .95, frame.radius * .75, limbIds.has(row.id) ? 12 : 6, sides(row.id)), row.at, 'gap');
    } else if (frame.radius <= FADE_RADIUS) {
      action = 'fade';
      const L = Math.min(.008, .003 + 3 * frame.radius);
      piece(row.id, tube([add(row.at, frame.dir, -.001), add(row.at, frame.dir, L / 2), add(row.at, frame.dir, L)], frame.radius * .95, frame.radius * .1, limbIds.has(row.id) ? 4 : 2, sides(row.id)), row.at, 'fade');
    } else if (!inTissue && row.kind === 'dangling') action = 'enters';
  }
  report.push({id: row.id, name: row.name, system: row.system, action, at: row.at, radiusMm: frame ? +(frame.radius * 1000).toFixed(1) : null, toSameMm: row.toSameMm, toTissueMm: row.toTissueMm, nearest: row.nearestSame});
}

// Bridges (upper and lower limb): every end whose next segment lies further away than half the vessel's diameter gets a spline connector that tapers from its own
// diameter to the next segment's, replacing the simple connector of the same end. The measurement is the one scripts/audit-vessel-continuity.mjs uses (scripts/lib/vessel-segments.mjs).
const source = loadFullAtlas({streams: STREAMS.filter(s => !s.startsWith('vessel-ends'))});   // the vessels the viewer shows, without the pieces this step makes
const {rows: gapRows} = await analyse({regions: ['upper', 'lower'], mode: 'before', V: await loadVessels({mode: 'before', source})});
const planned = gapRows.filter(bridgeable), mutual = new Set();
let bridged = 0;
for (const r of planned) {
  if (r.kind === 'end-to-end') { // two ends facing each other would get two tubes: keep one
    const twin = planned.find(o => o !== r && o.id === r.neighbourId && o.neighbourId === r.id && len(sub(o.capAt, r.target.point)) < .002 && len(sub(r.capAt, o.target.point)) < .002);
    if (twin && (mutual.has(twin) || r.id > twin.id)) continue; mutual.add(r);
  }
  const t = r.target, to = r.kind === 'end-to-end' ? add(t.point, t.dir, -.001) : add(t.point, t.inward, Math.min(.0006 + t.radius * .5, .002));
  const travel = r.kind === 'end-to-end' ? t.dir.map(v => -v) : unit(sub(to, r.capAt));
  const r1 = r.kind === 'end-to-end' ? Math.min(t.radius, r.radius * 2.2) : r.radius * .85;
  const path = bridgePath(r.capAt, r.dir, to, travel);
  const near = pieces.filter(q => q.id === r.id && q.action === 'gap' && len(sub(q.tip, r.tipAt)) < .004);
  for (const q of near) pieces.splice(pieces.indexOf(q), 1);
  const far = pieces.filter(q => q.id === r.id && q.action === 'fade' && len(sub(q.tip, r.tipAt)) < .004);
  for (const q of far) pieces.splice(pieces.indexOf(q), 1);
  const samples = Math.max(16, Math.ceil((r.gapMm / 1.2) / (path.length - 1)) * (path.length - 1));
  piece(r.id, tube(path, r.radius * .95, r1 * .97, samples, 12), r.tipAt, 'bridge'); bridged++;
  const hit = report.find(x => x.id === r.id && len(sub(x.at, r.tipAt)) < .004); if (hit) hit.action = 'bridge';
}
console.log(`Vessel ends: ${bridged} limb bridges planned from ${gapRows.length} adjacent-segment ends.`);
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
