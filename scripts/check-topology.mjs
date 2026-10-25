// Fails the build when a vessel or nerve branch does not touch the structure it comes from (scripts/topology-spec.mjs), at the level the anatomy requires.
// The check reads the same meshes the viewer draws: the atlas, the nerve stream and the connector pieces of the paokao package.
import fs from 'node:fs';
import {loadWorld} from './lib/paokao-world.mjs';
import {makeUtil} from './lib/paokao-util.mjs';
import {expand, attachment, originLevel, TOLERANCE} from './lib/topology.mjs';
import {ARTERIES, VEINS, NERVES} from './topology-spec.mjs';

const w = loadWorld({paokao: true}), U = makeUtil(w), problems = [], rows = [];
for (const rel of [...expand(ARTERIES, 'artery'), ...expand(VEINS, 'vein'), ...expand(NERVES, 'nerve')]) {
  const r = rel;
  const att = attachment(U, w, r);
  if (att.missing) { problems.push(`${rel.child}: no mesh named ${att.missing}`); continue; }
  const level = originLevel(U, w, r);
  if (att.gap > TOLERANCE) problems.push(`${rel.child} does not touch ${rel.parent}: ${(att.gap * 1000).toFixed(1)} mm apart`);
  else if (level != null && att.point[1] < level - (r.rule.originBelow.tolMm ?? 12) / 1000) problems.push(`${rel.child} leaves ${rel.parent} ${((level - att.point[1]) * 1000).toFixed(0)} mm below where it should (just under ${r.rule.originBelow.mesh.replace('%', rel.side.w)})`);
  rows.push(rel.child);
}
// ---- Whole body: every artery and vein must touch at least one other vessel of its kind (a vessel floating alone is cut off). Known singletons are listed in docs/topology-baseline.json;
// a new one, or one that is not in the model any more, fails the build.
const T = .0025, C = T;
const vessels = w.entries.filter(e => (e.system === 'arterial' || e.system === 'venous') && !/^extra:/.test(e.id));
const grid = new Map(), cells = new Map(), verts = new Map();
const cellOf = (x, y, z) => `${Math.floor(x / C)},${Math.floor(y / C)},${Math.floor(z / C)}`;
for (const e of vessels) { const g = e.load(); verts.set(e.id, g.positions); for (let i = 0; i < g.positions.length; i += 3) { const k = cellOf(g.positions[i], g.positions[i + 1], g.positions[i + 2]); (grid.get(k) ?? grid.set(k, []).get(k)).push([e.id, i]); } }
const touching = new Map(vessels.map(e => [e.id, new Set()]));
for (const e of vessels) {
  const pos = verts.get(e.id);
  for (let i = 0; i < pos.length; i += 3) {
    const cx = Math.floor(pos[i] / C), cy = Math.floor(pos[i + 1] / C), cz = Math.floor(pos[i + 2] / C);
    for (let x = cx - 1; x <= cx + 1; x++) for (let y = cy - 1; y <= cy + 1; y++) for (let z = cz - 1; z <= cz + 1; z++) for (const [id, j] of grid.get(`${x},${y},${z}`) ?? []) {
      if (id === e.id || touching.get(e.id).has(id)) continue;
      const q = verts.get(id); if (Math.hypot(q[j] - pos[i], q[j + 1] - pos[i + 1], q[j + 2] - pos[i + 2]) <= T) { touching.get(e.id).add(id); touching.get(id).add(e.id); }
    }
  }
}
const alone = vessels.filter(e => !touching.get(e.id).size).map(e => `${e.name} [${e.id}]`).sort();
const baselineFile = new URL('../docs/topology-baseline.json', import.meta.url);
if (process.argv.includes('--write')) fs.writeFileSync(baselineFile, JSON.stringify({note: 'Vessels that touch no other vessel in the source atlas (checked at 2.5 mm). Each is listed so a new floating vessel fails the build; fix them rather than adding to the list.', alone}, null, 1));
else {
  const known = new Set(JSON.parse(fs.readFileSync(baselineFile, 'utf8')).alone);
  for (const a of alone) if (!known.has(a)) problems.push(`${a} touches no other vessel`);
}
if (problems.length) { console.error(`Topology: ${problems.length} branches are cut off from their parent or leave it at the wrong level:\n - ` + problems.join('\n - ')); process.exit(1); }
console.log(`Topology OK: ${rows.length} vessel and nerve branches each touch the parent they come from; ${vessels.length - alone.length} of ${vessels.length} vessel meshes touch another vessel (${alone.length} known loners).`);
