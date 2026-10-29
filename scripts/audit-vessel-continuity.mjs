// Whole-body scan for broken vessels: splits every artery and vein mesh (atlas, supplement, paokao, and the end pieces of vessel-ends) into connected pieces and reports
//   floating   a piece of 12 or more vertices that lies more than 3 mm from every other vessel piece, so it hangs in space with nothing to join
//   end caps   pieces of fewer than 12 vertices (single triangles and small fans the source left at cut branch openings); counted for information only
// Known floating pieces are listed in docs/vessel-continuity-baseline.json so a new one fails `npm run check`; fix them rather than adding to the list.
// docs/vessel-continuity.md is written with --write.
//
// Segments mode (node scripts/audit-vessel-continuity.mjs --segments [--regions upper,lower] [--write] [--ends <manifest>] [--list]):
//   for every artery and vein of a region, each end is paired with the next segment (the end cap it faces, or the trunk it runs into), and three things are measured:
//   gap (end cap to the other segment's surface, 0 when they overlap), tangent mismatch (angle between the two axes at an end-to-end joint, 0 = straight on)
//   and diameter mismatch (ratio of the two diameters). A gap larger than half the vessel's diameter is listed; docs/vessel-segments-baseline.json holds the known ones,
//   and a new one, or a known one that grows by more than 1 mm, fails. Regions: upper, lower (done); thorax, head, trunk are not covered yet.
//   --write refreshes docs/vessel-segments.md and the baseline, --ends measures with another vessel-ends manifest (e.g. the one before the bridges), --list prints the gaps.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {loadWorld} from './lib/paokao-world.mjs';
import {closest} from './lib/heart-geom.mjs';

const root = new URL('../', import.meta.url), TOL = .003, MIN = 12, C = TOL;
if (process.argv.includes('--segments')) { const {runSegments} = await import('./lib/vessel-segment-report.mjs'); await runSegments(process.argv.slice(2)); process.exit(0); }
const w = loadWorld({paokao: true});
const pieces = [];
function split(name, id, pos, idx, side) {
  const n = pos.length / 3, par = Array.from({length: n}, (_, i) => i), f = x => { while (par[x] !== x) x = par[x] = par[par[x]]; return x; };
  for (let i = 0; i < idx.length; i += 3) { par[f(idx[i])] = f(idx[i + 1]); par[f(idx[i + 1])] = f(idx[i + 2]); }
  const groups = new Map(); for (let i = 0; i < n; i++) { const r = f(i); (groups.get(r) ?? groups.set(r, []).get(r)).push(i); }
  for (const g of groups.values()) pieces.push({name, id, verts: g.length, pts: g.map(i => [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]]), end: side});
}
for (const e of w.entries) {
  if (e.system !== 'arterial' && e.system !== 'venous') continue;
  const g = e.load(); split(e.name, e.id, g.positions, g.indices, false);
}
// end pieces
{
  const m = JSON.parse(gunzipSync(fs.readFileSync(new URL('public/models/vessel-ends/vessel-ends-stream.json.gz', root))));
  const bufs = new Map(), buf = c => bufs.get(c) ?? bufs.set(c, fs.readFileSync(new URL('public' + m.chunks[c].url, root))).get(c);
  for (const p of m.parts) {
    const b = buf(p.chunk), pos = new Float32Array(b.buffer.slice(b.byteOffset + p.positions, b.byteOffset + p.positions + p.vertexCount * 12)), idx = new Uint32Array(b.buffer.slice(b.byteOffset + p.indices, b.byteOffset + p.indices + p.indexCount * 4));
    split(p.name + ' (end piece)', p.id, pos, idx, true);
  }
}
const grid = new Map(), key = (x, y, z) => `${Math.floor(x / C)},${Math.floor(y / C)},${Math.floor(z / C)}`;
pieces.forEach((pc, k) => { pc.k = k; for (const p of pc.pts) { const q = key(...p); (grid.get(q) ?? grid.set(q, []).get(q)).push([k, p]); } });
const touches = pc => {
  for (const p of pc.pts) { const cx = Math.floor(p[0] / C), cy = Math.floor(p[1] / C), cz = Math.floor(p[2] / C);
    for (let x = cx - 1; x <= cx + 1; x++) for (let y = cy - 1; y <= cy + 1; y++) for (let z = cz - 1; z <= cz + 1; z++) for (const [k, q] of grid.get(`${x},${y},${z}`) ?? []) {
      if (k !== pc.k && Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) <= TOL) return true; } }
  return false;
};
// Vertex-to-vertex distance misses a tip that sits inside a coarse neighbour (a 100-vertex artery has vertices 30 mm apart): a piece that fails it is re-checked against the
// neighbours' surfaces, and counts as joined when one of its vertices lies within 1.5 mm of another vessel mesh.
const SURFACE_TOL = .0015, meshNames = [...new Set(w.entries.filter(e => (e.system === 'arterial' || e.system === 'venous') && !/^extra:/.test(e.id)).map(e => e.name))];
const bounds = new Map(); for (const n of meshNames) { let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity]; for (const e of w.find(n)) { const g = e.load(); for (let i = 0; i < g.positions.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], g.positions[i + k]); hi[k] = Math.max(hi[k], g.positions[i + k]); } } bounds.set(n, [lo, hi]); }
const touchesSurface = pc => {
  const own = pc.name.replace(/ \(end piece\)$/, '');
  for (const p of pc.pts) for (const n of meshNames) {
    if (n === own) continue; const [lo, hi] = bounds.get(n);
    if (p[0] < lo[0] - SURFACE_TOL || p[0] > hi[0] + SURFACE_TOL || p[1] < lo[1] - SURFACE_TOL || p[1] > hi[1] + SURFACE_TOL || p[2] < lo[2] - SURFACE_TOL || p[2] > hi[2] + SURFACE_TOL) continue;
    if (closest(w.mesh(n), p).d <= SURFACE_TOL) return true;
  }
  return false;
};
const floating = pieces.filter(p => p.verts >= MIN && !touches(p) && !touchesSurface(p)), slivers = pieces.filter(p => p.verts < MIN && !p.end);
const label = p => `${p.name} [${p.id}] ${p.verts} vertices at ${[0, 1, 2].map(a => Math.round(p.pts.reduce((t, q) => t + q[a], 0) / p.pts.length * 1000)).join(', ')} mm`;
const names = floating.map(label).sort();
const baseline = new URL('docs/vessel-continuity-baseline.json', root);
if (process.argv.includes('--write')) {
  fs.writeFileSync(baseline, JSON.stringify({note: 'Vessel pieces (12+ vertices) that touch no other vessel within 3 mm. A new one fails the build; fix it rather than adding it here.', floating: names}, null, 1));
  const bySlivers = new Map(); for (const s of slivers) bySlivers.set(s.name, (bySlivers.get(s.name) ?? 0) + 1);
  fs.writeFileSync(new URL('docs/vessel-continuity.md', root), ['# Vessel continuity scan', '', `Generated by \`node scripts/audit-vessel-continuity.mjs --write\`. ${pieces.length} connected pieces in ${new Set(pieces.map(p => p.id)).size} vessel meshes.`, '',
    `## Floating pieces (${floating.length}): 12 or more vertices, more than 3 mm from every other vessel`, '', ...(names.length ? names.map(n => `- ${n}`) : ['None.']), '',
    `## End caps (${slivers.length} pieces in ${bySlivers.size} vessels): fewer than 12 vertices each, informational`, '', ...[...bySlivers].sort((a, b) => b[1] - a[1]).slice(0, 80).map(([n, c]) => `- ${n}: ${c}`), ''].join('\n'));
  console.log(`Vessel continuity: ${floating.length} floating pieces, ${slivers.length} small end caps written.`);
} else {
  const known = new Set(JSON.parse(fs.readFileSync(baseline, 'utf8')).floating), fresh = names.filter(n => !known.has(n));
  if (fresh.length) { console.error(`Vessel continuity: ${fresh.length} vessel pieces float with nothing to join:\n - ` + fresh.join('\n - ')); process.exit(1); }
  console.log(`Vessel continuity OK: ${floating.length} known floating pieces, none new (${slivers.length} small end caps).`);
}
