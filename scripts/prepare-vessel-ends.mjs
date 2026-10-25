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

const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
const stamp = file('work/vessel-ends.stamp'), out = new URL('public/models/stream/', root), manifest = file('public/models/vessel-ends/vessel-ends-stream.json.gz');
const inputs = ['scripts/prepare-vessel-ends.mjs', 'scripts/audit-vessel-ends.mjs', 'scripts/lib/nerve-schematics.mjs', 'public/models/atlas.json'];
const hash = createHash('sha256').update(inputs.map(f => fs.readFileSync(file(f))).join('')).digest('hex');
try { if (fs.readFileSync(stamp, 'utf8') === hash && fs.existsSync(manifest)) { console.log('Vessel ends: up to date.'); process.exit(0); } } catch {}

const GAP_MM = 12, FADE_RADIUS = .0018, MIN_RADIUS = .0004;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add = (a, b, s = 1) => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s], len = a => Math.hypot(...a), unit = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

const rows = auditEnds(), parts = new Map(atlas.parts.map(p => [p.id, p])), cache = new Map();
/** Welded surface graph of a vessel mesh (cached): vertex positions and neighbour lists. */
function surface(id) {
  if (cache.has(id)) return cache.get(id);
  const g = geom(parts.get(id)), key = new Map(), pts = [], remap = new Uint32Array(g.pos.length / 3);
  for (let i = 0; i < remap.length; i++) {
    const k = `${Math.round(g.pos[i * 3] * 1e5)},${Math.round(g.pos[i * 3 + 1] * 1e5)},${Math.round(g.pos[i * 3 + 2] * 1e5)}`;
    let v = key.get(k); if (v === undefined) { v = pts.length; key.set(k, v); pts.push([g.pos[i * 3], g.pos[i * 3 + 1], g.pos[i * 3 + 2]]); } remap[i] = v;
  }
  const adj = pts.map(() => new Set());
  for (let i = 0; i < g.idx.length; i += 3) for (let k = 0; k < 3; k++) { const a = remap[g.idx[i + k]], b = remap[g.idx[i + (k + 1) % 3]]; if (a !== b) { adj[a].add(b); adj[b].add(a); } }
  const entry = {pts, adj}; cache.set(id, entry); return entry;
}
/** Direction (pointing out of the tube) and radius of a tube end: the surface vertices connected to the tip within 5 mm give a principal axis and the RMS distance from it. */
function endFrame(id, tip) {
  const {pts, adj} = surface(id);
  let start = -1, best = Infinity;
  pts.forEach((v, i) => { const d = Math.hypot(v[0] - tip[0], v[1] - tip[1], v[2] - tip[2]); if (d < best) { best = d; start = i; } });
  const seen = new Set([start]), queue = [start], set = [];
  while (queue.length) {
    const v = queue.pop(); set.push(pts[v]);
    for (const u of adj[v]) if (!seen.has(u) && Math.hypot(pts[u][0] - tip[0], pts[u][1] - tip[1], pts[u][2] - tip[2]) < .005) { seen.add(u); queue.push(u); }
  }
  if (set.length < 8) return null;
  const c = set.reduce((s, v) => add(s, v, 1 / set.length), [0, 0, 0]), cov = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const v of set) { const d = sub(v, c); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) cov[i][j] += d[i] * d[j] / set.length; }
  let axis = unit(sub(tip, c));
  for (let k = 0; k < 24; k++) axis = unit([0, 1, 2].map(i => cov[i][0] * axis[0] + cov[i][1] * axis[1] + cov[i][2] * axis[2]));
  const dir = axis[0] * (tip[0] - c[0]) + axis[1] * (tip[1] - c[1]) + axis[2] * (tip[2] - c[2]) < 0 ? axis.map(x => -x) : axis;
  let r2 = 0; for (const v of set) { const d = sub(v, c), along = d[0] * dir[0] + d[1] * dir[1] + d[2] * dir[2]; r2 += (len(d) ** 2 - along ** 2) / set.length; }
  return {dir, radius: Math.max(MIN_RADIUS, Math.min(Math.sqrt(r2) * 1.2, .008))};
}

const byPart = new Map(), report = [];
const piece = (id, geometry) => { if (!byPart.has(id)) byPart.set(id, []); byPart.get(id).push(geometry); };
for (const row of rows) {
  const frame = row.kind === 'joined' ? null : endFrame(row.id, row.at);
  let action = row.kind === 'joined' ? 'joined' : 'enters';
  if (frame) {
    const gap = row.toSameMm <= GAP_MM && row.closest, inTissue = row.toTissueMm <= 4;
    if (row.kind === 'dangling' && gap) {
      action = 'gap';
      const d = row.toSameMm / 1000, target = row.closest, chord = unit(sub(target, row.at));
      const bend = add(row.at, chord, d * .5), mid = add(bend, frame.dir, d * .18), through = add(target, chord, .001);
      piece(row.id, tube([add(row.at, frame.dir, -.0015), row.at, mid, through], frame.radius * .95, frame.radius * .75, 6, 5));
    } else if (frame.radius <= FADE_RADIUS) {
      action = 'fade';
      const L = Math.min(.008, .003 + 3 * frame.radius);
      piece(row.id, tube([add(row.at, frame.dir, -.001), add(row.at, frame.dir, L / 2), add(row.at, frame.dir, L)], frame.radius * .95, frame.radius * .1, 2, 5));
    } else if (!inTissue && row.kind === 'dangling') action = 'enters';
  }
  report.push({id: row.id, name: row.name, system: row.system, action, at: row.at, radiusMm: frame ? +(frame.radius * 1000).toFixed(1) : null, toSameMm: row.toSameMm, toTissueMm: row.toTissueMm, nearest: row.nearestSame});
}

fs.mkdirSync(out, {recursive: true}); fs.mkdirSync(new URL('public/models/vessel-ends/', root), {recursive: true}); fs.mkdirSync(new URL('work/', root), {recursive: true});
const stream = createStream(out, 'vessel-ends');
for (const [id, list] of byPart) {
  const positions = [], indices = [];
  for (const g of list) { const base = positions.length / 3; positions.push(...g.positions); for (const i of g.indices) indices.push(i + base); }
  const parent = parts.get(id);
  stream.add({id: `${id}-END`, conceptId: parent.conceptId, name: parent.name, system: parent.system, schematic: true}, Float32Array.from(positions), Uint32Array.from(indices));
}
const info = stream.finish({source: 'Generated for this atlas from the vessel meshes (connector and taper pieces)', license: 'Derived from BodyParts3D (CC BY-SA 2.1 Japan)', attribution: 'Connector and taper pieces added at audited vessel ends by scripts/prepare-vessel-ends.mjs.'}, new URL(manifest, 'file:'));

const count = k => report.filter(r => r.action === k).length, fading = {};
for (const r of report) if (r.action === 'fade') fading[r.id] = (fading[r.id] ?? 0) + 1;
fs.writeFileSync(file('app/mj-vessel-ends.json'), JSON.stringify(fading));
const grouped = new Map();
for (const r of report.filter(r => r.action === 'gap' || r.action === 'enters')) {
  const key = r.id + r.action, g = grouped.get(key) ?? {name: r.name, id: r.id, action: r.action, n: 0, radius: 0, same: Infinity, tissue: Infinity};
  g.n++; g.radius = Math.max(g.radius, r.radiusMm ?? 0); g.same = Math.min(g.same, r.toSameMm); g.tissue = Math.min(g.tissue, r.toTissueMm); grouped.set(key, g);
}
const md = [`# 血管末端審核`, '', `共檢查 ${report.length} 個血管末端（動脈與靜脈；每個血管網格的各分支尖端）。`, '', '| 處理 | 數量 | 說明 |', '| --- | ---: | --- |',
  `| 原本已相連 | ${count('joined')} | 末端接到同類型的上游或分支血管，不處理 |`,
  `| 補接（connector） | ${count('gap')} | 12 mm 內有同類型血管，加一條細而彎的連接管，接回母血管 |`,
  `| 漸細（fade） | ${count('fade')} | 半徑 1.8 mm 以下的小血管，真實解剖上止於肌肉、器官或筋膜；末端收成尖端，資料卡註明「末端逐漸變細，進入周圍組織」 |`,
  `| 進入器官／其他（enters） | ${count('enters')} | 較大的血管進入器官或骨（如主動脈根部、肝靜脈進入肝），不改形狀，列在下方供人工複查 |`, '',
  '## 補接與未處理清單', '', '| 血管 | 處理（末端數） | 最大半徑 (mm) | 最近同類血管 (mm) | 最近組織 (mm) |', '| --- | --- | ---: | ---: | ---: |',
  ...[...grouped].map(([key, g]) => `| ${g.name} (${g.id}) | ${g.action} × ${g.n} | ${g.radius} | ${g.same} | ${g.tissue} |`), '',
  '重新產生：`node scripts/prepare-vessel-ends.mjs`（輸入變動時自動重跑）。', ''].join('\n');
fs.writeFileSync(file('docs/vessel-ends.md'), md);
fs.writeFileSync(stamp, hash);
console.log(`Vessel ends: ${report.length} audited — joined ${count('joined')}, gap ${count('gap')}, fade ${count('fade')}, enters ${count('enters')}; ${info.parts} pieces in ${info.chunks} packages, ${(info.gzipBytes / 1e6).toFixed(2)} MB.`);
