// Vessel tree continuity. Every artery must be reachable from the aorta through meshes that touch end to end (or branch point to branch), every vein from a vena cava;
// a mesh that is cut off from its tree, or a whole group of them, is listed. Besides the topology check (parent and branch relations, scripts/topology-spec.mjs) this
// walks the whole tree, so a gap in the middle of a chain (e.g. between the palmar arch and a digital artery) cannot hide behind two parts that each touch something.
// It also reports the mean radius of each limb vessel along the main chains and fails when a branch is wider than its parent by more than 40 %.
//   node scripts/check-vessel-tree.mjs [--write]      --write refreshes docs/vessel-tree.md
import fs from 'node:fs';
import {loadWorld} from './lib/paokao-world.mjs';
import {closest} from './lib/heart-geom.mjs';

const T = .0025, SURFACE = .0015, C = T;
const w = loadWorld({paokao: true});
const vessels = w.entries.filter(e => (e.system === 'arterial' || e.system === 'venous') && !/^extra:/.test(e.id));
const geom = new Map(), bb = new Map(), radius = new Map();
for (const e of vessels) {
  const g = e.load(); geom.set(e.id, g);
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < g.positions.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], g.positions[i + k]); hi[k] = Math.max(hi[k], g.positions[i + k]); }
  bb.set(e.id, [lo, hi]);
  let area = 0; const P = g.positions, I = g.indices;
  for (let t = 0; t < I.length; t += 3) { const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3; const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2]; area += Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) / 2; }
  radius.set(e.id, area / (2 * Math.PI * (Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) || 1)));
}
// ---- who touches whom: vertices within T of a vertex of the other mesh, or a vertex within SURFACE of the other mesh's surface
const grid = new Map(), cell = (x, y, z) => `${Math.floor(x / C)},${Math.floor(y / C)},${Math.floor(z / C)}`;
for (const e of vessels) { const P = geom.get(e.id).positions; for (let i = 0; i < P.length; i += 3) { const k = cell(P[i], P[i + 1], P[i + 2]); (grid.get(k) ?? grid.set(k, []).get(k)).push([e.id, i]); } }
const parent = new Map(vessels.map(e => [e.id, e.id])), find = x => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; }, union = (a, b) => parent.set(find(a), find(b));
const adj = new Map(vessels.map(e => [e.id, new Set()])), link = (a, b) => { adj.get(a).add(b); adj.get(b).add(a); union(a, b); };
for (const e of vessels) {
  const P = geom.get(e.id).positions;
  for (let i = 0; i < P.length; i += 3) {
    const cx = Math.floor(P[i] / C), cy = Math.floor(P[i + 1] / C), cz = Math.floor(P[i + 2] / C);
    for (let x = cx - 1; x <= cx + 1; x++) for (let y = cy - 1; y <= cy + 1; y++) for (let z = cz - 1; z <= cz + 1; z++) for (const [id, j] of grid.get(`${x},${y},${z}`) ?? []) {
      if (id === e.id || adj.get(e.id).has(id)) continue;
      const Q = geom.get(id).positions; if (Math.hypot(Q[j] - P[i], Q[j + 1] - P[i + 1], Q[j + 2] - P[i + 2]) <= T) link(e.id, id);
    }
  }
}
// surface pass for coarse meshes: only meshes whose bounding boxes overlap, and only vertices not already explained
const byName = new Map(); for (const e of vessels) (byName.get(e.name) ?? byName.set(e.name, []).get(e.name)).push(e);
for (const a of vessels) for (const b of vessels) {
  if (a.id >= b.id || adj.get(a.id).has(b.id) || a.name === b.name) continue;
  const [la, ha] = bb.get(a.id), [lb, hb] = bb.get(b.id);
  if ([0, 1, 2].some(k => la[k] > hb[k] + SURFACE || lb[k] > ha[k] + SURFACE)) continue;
  // vertex distance is reliable against a densely sampled mesh; only a coarse one (under 1200 vertices per metre of length) can hide a tip inside it
  const dens = e => geom.get(e.id).positions.length / 3 / (Math.hypot(...[0, 1, 2].map(k => bb.get(e.id)[1][k] - bb.get(e.id)[0][k])) || 1);
  const small = dens(a) >= dens(b) ? a : b, big = small === a ? b : a;
  if (dens(big) >= 1200) continue;
  const P = geom.get(small.id).positions, mesh = w.mesh(big.name);
  for (let i = 0; i < P.length; i += 3) if (closest(mesh, [P[i], P[i + 1], P[i + 2]]).d <= SURFACE) { link(a.id, b.id); break; }
}
// ---- roots
const rootNames = ['Arch of aorta', 'Abdominal aorta', 'Superior vena cava', 'Inferior vena cava', 'Ascending aorta', 'Descending thoracic aorta'];
const roots = vessels.filter(e => rootNames.some(n => n.toLowerCase() === e.name.toLowerCase()));
const rootComponents = new Set(roots.map(e => find(e.id)));
const cut = vessels.filter(e => !rootComponents.has(find(e.id)));
const groups = new Map(); for (const e of cut) (groups.get(find(e.id)) ?? groups.set(find(e.id), []).get(find(e.id))).push(e);
const describe = list => [...new Set(list.map(e => e.name))].sort();
// ---- radius along the main chains (mean radius, mm). A branch much wider than its parent means a vessel that was scaled or reconnected wrongly.
const mean = name => { const list = byName.get(name); if (!list) return null; let a = 0, n = 0; for (const e of list) { a += radius.get(e.id); n++; } return a / n * 1000; };
const CHAINS = [
  ['% subclavian artery', '% axillary artery', '% brachial artery', '% radial artery', '% superficial palmar arterial arch'], ['% brachial artery', '% ulnar artery', '% superficial palmar arterial arch'],
  ['% radial artery', '% deep palmar arch'], ['% superficial palmar arterial arch', '% first common palmar digital artery'], ['% superficial palmar arterial arch', '% second common palmar digital artery'],
  ['% external iliac artery', '% femoral artery', '% popliteal artery', '% anterior tibial artery', '% dorsalis pedis artery'], ['% popliteal artery', '% posterior tibial artery', '% medial plantar artery'],
  ['% subclavian vein', '% axillary vein', '% cephalic vein'], ['% axillary vein', '% basilic vein', '% median cubital vein'],
];
const wide = [], rows = [];
for (const S of ['Right', 'Left']) for (const chain of CHAINS) {
  const names = chain.map(n => n.replace('%', S)), r = names.map(mean);
  for (let i = 1; i < names.length; i++) {
    if (r[i] == null || r[i - 1] == null) continue;
    rows.push(`| ${names[i - 1]} → ${names[i]} | ${r[i - 1].toFixed(2)} | ${r[i].toFixed(2)} |`);
    if (r[i] > r[i - 1] * 1.4) wide.push(`${names[i]} (${r[i].toFixed(2)} mm) is wider than ${names[i - 1]} (${r[i - 1].toFixed(2)} mm)`);
  }
}
const lines = [];
lines.push(`${vessels.length} vessel meshes, ${new Set(vessels.map(e => find(e.id))).size} connected groups; ${vessels.length - cut.length} meshes reach an aorta or a vena cava.`);
for (const list of [...groups.values()].sort((a, b) => b.length - a.length)) lines.push(`  cut off (${list.length}): ${describe(list).slice(0, 12).join('; ')}${describe(list).length > 12 ? '; …' : ''}`);
if (process.argv.includes('--write')) {
  fs.writeFileSync(new URL('../docs/vessel-tree.md', import.meta.url), ['# Vessel tree', '', 'Written by `node scripts/check-vessel-tree.mjs --write`.', '', ...lines.map(l => `- ${l.trim()}`), '', '## Mean radius along the main chains (mm)', '', '| Step | parent | child |', '| --- | --- | --- |', ...rows, ''].join('\n'));
}
const baselineFile = new URL('../docs/vessel-tree-baseline.json', import.meta.url);
const cutNames = [...groups.values()].flatMap(describe).sort();
if (process.argv.includes('--write')) fs.writeFileSync(baselineFile, JSON.stringify({note: 'Vessel meshes that do not reach an aorta or a vena cava through touching meshes, and branches wider than their parent (known; the source atlas has them). A new one fails the build; fix the vessel rather than adding it here.', cutOff: cutNames, wider: wide.map(x => x.split(' (')[0])}, null, 1));
const base = JSON.parse(fs.readFileSync(baselineFile, 'utf8')), known = new Set(base.cutOff), knownWide = new Set(base.wider ?? []), fresh = cutNames.filter(n => !known.has(n)), newWide = wide.filter(x => !knownWide.has(x.split(' (')[0]));
console.log(lines[0]);
if (fresh.length || newWide.length) {
  if (fresh.length) console.error(`Vessel tree: ${fresh.length} vessels are cut off from their tree:\n - ${fresh.join('\n - ')}`);
  if (newWide.length) console.error(`Vessel tree: branches wider than their parent:\n - ${newWide.join('\n - ')}`);
  process.exit(1);
}
console.log(`Vessel tree OK: no new cut-off vessels (${cutNames.length} known), no new branch more than 40 % wider than its parent (${wide.length} known).`);
