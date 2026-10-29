// Outline of each special region from the real meshes: for every edge of app/mj-space-shapes.ts the vertices of the boundary structure that form that
// margin are picked (the extreme vertex of the margin in each bin along the edge, or the surface that faces into the space), so the outline is made of
// vertices of the boundary meshes and follows them when they are posed. Output: app/space-shapes.json (vertex references) and docs/space-shapes.md (corner positions).
// Run: node scripts/compute-space-shapes.mjs [--check]
import fs from 'node:fs';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {loadFullAtlas} from './lib/full-atlas.mjs';
const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
const tmp = file('.sites-runtime/shapes-entry.mjs');
await build({entryPoints: [file('scripts/lib/shapes-entry.ts')], bundle: true, format: 'esm', platform: 'node', outfile: tmp, loader: {'.json': 'json'}, logLevel: 'error', external: ['three']});
const {SPACES, SPACE_SHAPES, resolveSpace} = await import(tmp);
const ranges = JSON.parse(fs.readFileSync(file('app/space-ranges.json'), 'utf8'));
const {atlas, geometry} = loadFullAtlas();
const parts = atlas.parts, byId = new Map(parts.map(p => [p.id, p])), geoCache = new Map();
const geo = id => geoCache.get(id) ?? (geoCache.set(id, geometry(byId.get(id))), geoCache.get(id));
const AXIS = {x: 0, y: 1, z: 2}, BINS = 14;
const dirOf = (margin, side) => { const lat = side === 'left' ? 1 : -1; return {up: [0, 1, 0], down: [0, -1, 0], lateral: [lat, 0, 0], medial: [-lat, 0, 0], anterior: [0, 0, 1], posterior: [0, 0, -1]}[margin]; };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

function chain(edge, hit, c, side, defaultReach) {
  const reach = edge.reach ?? defaultReach, cand = [];
  for (const name of edge.items) {
    const item = hit.boundaries.find(h => h.item.en === name);
    if (!item) throw new Error(`${name}: not a boundary of the space`);
    for (const id of item.ids) { const p = geo(id).positions; for (let i = 0; i < p.length / 3; i++) { const v = [p[i * 3], p[i * 3 + 1], p[i * 3 + 2]]; if (dist(v, c) <= reach) cand.push({id, i, v}); } }
  }
  if (cand.length < 3) return null;
  const a = AXIS[edge.along], lo = Math.min(...cand.map(q => q.v[a])), hi = Math.max(...cand.map(q => q.v[a])), step = (hi - lo) / BINS || 1;
  const d = edge.margin === 'facing' ? null : dirOf(edge.margin, side), best = new Array(BINS + 1).fill(null);
  for (const q of cand) {
    const b = Math.min(BINS, Math.floor((q.v[a] - lo) / step)), score = d ? q.v[0] * d[0] + q.v[1] * d[1] + q.v[2] * d[2] : -dist(q.v, c);
    if (!best[b] || score > best[b].score) best[b] = {...q, score};
  }
  let out = best.filter(Boolean).sort((p, q) => p.v[a] - q.v[a]);
  // a margin is a smooth curve: drop vertices that stick out of it (picked on a fold of the mesh)
  if (d && out.length > 4) { const med = arr => [...arr].sort((x, y) => x - y)[arr.length >> 1]; out = out.filter((q, i) => { const w = out.slice(Math.max(0, i - 2), i + 3).map(r => r.score); return Math.abs(q.score - med(w)) < .006; }); }
  return out;
}

const out = {}, rows = [];
for (const space of SPACES) {
  const shape = SPACE_SHAPES[space.id]; if (!shape) continue;
  out[space.id] = {};
  for (const side of ['left', 'right']) {
    const hit = resolveSpace(parts, space, side), c = ranges[space.id]?.[side]?.c; if (!c) continue;
    const chains = [];
    shape.edges.forEach((edge, k) => { const ch = chain(edge, hit, c, side, space.r * 1.05); if (ch) chains.push({edge: k, ch}); else rows.push(`${space.id} ${side}: edge "${edge.key}" has no vertices (structure missing)`); });
    // The edges are ordered around the centre of the space as seen from the front of the opening (the camera direction of the space), each edge runs counter-clockwise,
    // so that the end of one edge is next to the start of the next one and the loop closes without crossing itself.
    const ordered = [], n = chains.length;
    if (shape.fill === 'tube' || n < 2) chains.forEach(cc => ordered.push({edge: cc.edge, pts: cc.ch}));
    else if (n === 2) {
      ordered.push({edge: chains[0].edge, pts: chains[0].ch});
      const a = chains[0].ch, b = [...chains[1].ch];
      if (dist(a.at(-1).v, b[0].v) > dist(a.at(-1).v, b.at(-1).v)) b.reverse();
      ordered.push({edge: chains[1].edge, pts: b});
    } else {
      // greedy loop: start with the first edge, then always continue with the edge whose nearest end is closest to where the loop is now (entered at that end)
      const rest = chains.map(cc => ({edge: cc.edge, pts: cc.ch})), first = rest.shift();
      ordered.push(first);
      while (rest.length) {
        const cur = ordered.at(-1).pts.at(-1).v; let bi = 0, bd = Infinity, flip = false;
        rest.forEach((cc, i) => { const d0 = dist(cur, cc.pts[0].v), d1 = dist(cur, cc.pts.at(-1).v); if (d0 < bd) { bd = d0; bi = i; flip = false; } if (d1 < bd) { bd = d1; bi = i; flip = true; } });
        const next = rest.splice(bi, 1)[0]; ordered.push({edge: next.edge, pts: flip ? [...next.pts].reverse() : next.pts});
      }
    }
    let apex = null;
    if (shape.apex) {
      const target = [c[0] + shape.apex.from[0] * (side === 'left' ? 1 : -1), c[1] + shape.apex.from[1], c[2] + shape.apex.from[2]];
      let bestD = Infinity;
      for (const p of parts) { if (!shape.apex.part.test(p.name.toLowerCase())) continue; const g = geo(p.id).positions; for (let i = 0; i < g.length / 3; i++) { const dd = dist([g[i * 3], g[i * 3 + 1], g[i * 3 + 2]], target); if (dd < bestD) { bestD = dd; apex = {id: p.id, i, v: [g[i * 3], g[i * 3 + 1], g[i * 3 + 2]]}; } } }
    }
    // Smooth every edge (the vertices of a low-poly mesh zigzag): the line passes through smoothed positions, each carried by its nearest mesh vertex, stored as the
    // offset from that vertex (so the line is skinned with the weights of the vertex next to it).
    const smoothed = pts => { let q = pts.map(p => [...p.v]); for (let it = 0; it < 4; it++) q = q.map((v, i) => (i === 0 || i === q.length - 1) ? v : v.map((x, k) => .25 * q[i - 1][k] + .5 * x + .25 * q[i + 1][k])); return q; };
    const ref = (p, v) => [p.id, p.i, ...v.map((x, k) => +(x - p.v[k]).toFixed(5))];
    out[space.id][side] = {
      chains: ordered.map(o => { const q = smoothed(o.pts); return {edge: o.edge, refs: o.pts.map((p, i) => ref(p, q[i]))}; }),
      ...(apex ? {apex: ref(apex, apex.v)} : {}),
    };
    for (const o of ordered) rows.push(`${space.id} ${side} ${shape.edges[o.edge].key}: ${o.pts.length} vertices, from (${o.pts[0].v.map(x => x.toFixed(3))}) to (${o.pts.at(-1).v.map(x => x.toFixed(3))})`);
  }
}
const missing = rows.filter(r => r.includes('no vertices'));
if (missing.length) { console.error('A space edge has no boundary vertices:\n' + missing.join('\n')); process.exit(1); }
const json = JSON.stringify(out) + '\n';
const md = ['# Special regions: outline vertices', '', 'Generated by `node scripts/compute-space-shapes.mjs`. 每條邊取自邊界結構網格的頂點；下表列出各邊兩端（角點）的模型座標（公尺）。', '', ...rows.map(r => '- ' + r), ''].join('\n');
if (process.argv.includes('--check')) {
  const ok = fs.existsSync(file('app/space-shapes.json')) && fs.readFileSync(file('app/space-shapes.json'), 'utf8') === json && fs.readFileSync(file('docs/space-shapes.md'), 'utf8') === md;
  if (!ok) { console.error('app/space-shapes.json or docs/space-shapes.md is out of date: run node scripts/compute-space-shapes.mjs'); process.exit(1); }
  console.log('space shapes up to date');
} else { fs.writeFileSync(file('app/space-shapes.json'), json); fs.writeFileSync(file('docs/space-shapes.md'), md); console.log(md); }
