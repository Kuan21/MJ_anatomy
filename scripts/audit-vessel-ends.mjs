// Audit of vessel ends. Every artery and vein mesh in the atlas is a closed tube; its ends are found as the tips of its branches (geodesic skeleton from the
// surface graph). Each tip is then classed:
//   joined    the tip touches another vessel (it continues into its parent or a branch)
//   tissue    the tip ends in a muscle, organ, gland, bone or fascia, where a small vessel really does fade out
//   dangling  nothing is there: the tip hangs in the air once the tissue around it is hidden
// Usage: node scripts/audit-vessel-ends.mjs [--write]   (--write refreshes docs/vessel-ends.json and docs/vessel-ends.md)
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {makeRelation, contactPairs, saveContacts} from './lib/vessel-relation.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const atlas = JSON.parse(fs.readFileSync(root + 'public/models/atlas.json', 'utf8'));
// The viewer drops the source meshes listed in app/anatomy-source-overrides.json (mislabelled or misplaced pieces) and renames a few: audit the same set, so that no
// end piece is ever built for a vessel the viewer does not draw (three such pieces used to float at hip height and in the opposite thigh).
{const over = JSON.parse(fs.readFileSync(root + 'app/anatomy-source-overrides.json', 'utf8')), excluded = new Set(over.exclude);
 atlas.parts = atlas.parts.filter(p => !excluded.has(p.id)).map(p => ({...p, ...(over.parts[p.id] || {})}));}
const buffers = new Map(), buf = c => {if (!buffers.has(c)) {const b = fs.readFileSync(root + 'public' + atlas.chunks[c].url); buffers.set(c, b.buffer.slice(b.byteOffset, b.byteOffset + b.length));} return buffers.get(c);};
const geom = p => {const ab = buf(p.chunk); return {pos: new Float32Array(ab, p.positions, p.vertexCount * 3), idx: new Uint32Array(ab, p.indices, p.indexCount)};};
// BodyParts3D's "hepatovenous segments" are the liver tissue itself (the parts of the liver each hepatic vein drains), not veins: the viewer shows them as digestive (displaySystem in app/mj-system-classifier.ts).
// The audit used to take them for veins and built end pieces (connectors, tapers) for them, which float in the air once the organs are hidden (check VS-06, 2026-11-21); scripts/test-vessel-audit-systems.mjs keeps this in step with the classifier.
export const NOT_VESSELS = /hepatovenous segment/i;
const systemOf = p => NOT_VESSELS.test(p.name) ? 'digestive' : p.system;
const isVessel = p => systemOf(p) === 'arterial' || systemOf(p) === 'venous';
const TISSUE = p => ['muscular', 'skeletal', 'digestive', 'respiratory', 'urinary', 'reproductive', 'endocrine', 'lymphatic', 'connective', 'sensory', 'cardiac'].includes(systemOf(p)) || (systemOf(p) === 'nervous' && /brain|cerebr|spinal cord/i.test(p.name));
const CELL = .008;
export class Grid {
  constructor() {this.cells = new Map(); this.tris = [];}
  add(tag, a, b, c) {
    const id = this.tris.length; this.tris.push([a, b, c, tag]);
    const cx = Math.floor((a[0] + b[0] + c[0]) / 3 / CELL), cy = Math.floor((a[1] + b[1] + c[1]) / 3 / CELL), cz = Math.floor((a[2] + b[2] + c[2]) / 3 / CELL), k = `${cx},${cy},${cz}`;
    let l = this.cells.get(k); if (!l) this.cells.set(k, l = []); l.push(id);
  }
  /** nearest triangle distance to p among triangles of other parts (skip `self`) within `radius`. */
  nearest(p, radius, self) {
    const r = Math.ceil(radius / CELL), cx = Math.floor(p[0] / CELL), cy = Math.floor(p[1] / CELL), cz = Math.floor(p[2] / CELL);
    let best = {d: Infinity, tag: null, q: null};
    for (let x = cx - r; x <= cx + r; x++) for (let y = cy - r; y <= cy + r; y++) for (let z = cz - r; z <= cz + r; z++) {
      const l = this.cells.get(`${x},${y},${z}`); if (!l) continue;
      for (const id of l) { const t = this.tris[id]; if (self instanceof Set ? self.has(t[3]) : t[3] === self) continue; const d = triDist(p, t[0], t[1], t[2]); if (d < best.d) best = {d, tag: t[3], q: triDist.q}; }
    }
    return best;
  }
}
export function triDist(p, a, b, c) {
  const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]], ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
  const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2], d1 = dot(ab, ap), d2 = dot(ac, ap);
  let q;
  if (d1 <= 0 && d2 <= 0) q = a;
  else {
    const bp = [p[0] - b[0], p[1] - b[1], p[2] - b[2]], d3 = dot(ab, bp), d4 = dot(ac, bp);
    if (d3 >= 0 && d4 <= d3) q = b;
    else {
      const vc = d1 * d4 - d3 * d2;
      if (vc <= 0 && d1 >= 0 && d3 <= 0) {const t = d1 / (d1 - d3); q = [a[0] + ab[0] * t, a[1] + ab[1] * t, a[2] + ab[2] * t];}
      else {
        const cp = [p[0] - c[0], p[1] - c[1], p[2] - c[2]], d5 = dot(ab, cp), d6 = dot(ac, cp);
        if (d6 >= 0 && d5 <= d6) q = c;
        else {
          const vb = d5 * d2 - d1 * d6;
          if (vb <= 0 && d2 >= 0 && d6 <= 0) {const t = d2 / (d2 - d6); q = [a[0] + ac[0] * t, a[1] + ac[1] * t, a[2] + ac[2] * t];}
          else {
            const va = d3 * d6 - d5 * d4;
            if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {const t = (d4 - d3) / ((d4 - d3) + (d5 - d6)); q = [b[0] + (c[0] - b[0]) * t, b[1] + (c[1] - b[1]) * t, b[2] + (c[2] - b[2]) * t];}
            else {const den = 1 / (va + vb + vc), v = vb * den, w = vc * den; q = [a[0] + ab[0] * v + ac[0] * w, a[1] + ab[1] * v + ac[1] * w, a[2] + ab[2] * v + ac[2] * w];}
          }
        }
      }
    }
  }
  triDist.q = q;
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
}

/** Tips of a tube tree: weld the surface into a graph, then repeatedly take the vertex farthest (geodesically) from the skeleton found so far. */
export function tubeTips(g, minBranch = .006) {
  const key = new Map(), pts = [], remap = new Uint32Array(g.pos.length / 3);
  for (let i = 0; i < remap.length; i++) {
    const k = `${Math.round(g.pos[i * 3] * 1e5)},${Math.round(g.pos[i * 3 + 1] * 1e5)},${Math.round(g.pos[i * 3 + 2] * 1e5)}`;
    let v = key.get(k); if (v === undefined) {v = pts.length; key.set(k, v); pts.push([g.pos[i * 3], g.pos[i * 3 + 1], g.pos[i * 3 + 2]]);} remap[i] = v;
  }
  const adj = pts.map(() => new Map());
  const link = (a, b) => {if (a === b) return; const d = Math.hypot(pts[a][0] - pts[b][0], pts[a][1] - pts[b][1], pts[a][2] - pts[b][2]); adj[a].set(b, d); adj[b].set(a, d);};
  for (let i = 0; i < g.idx.length; i += 3) {const a = remap[g.idx[i]], b = remap[g.idx[i + 1]], c = remap[g.idx[i + 2]]; link(a, b); link(b, c); link(c, a);}
  // Dijkstra with a binary heap from several sources
  const dijkstra = sources => {
    const dist = new Float64Array(pts.length).fill(Infinity), prev = new Int32Array(pts.length).fill(-1), heap = [];
    const push = (d, v) => {heap.push([d, v]); let i = heap.length - 1; while (i > 0) {const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p;}};
    const pop = () => {const top = heap[0], last = heap.pop(); if (heap.length) {heap[0] = last; let i = 0; for (;;) {let l = 2 * i + 1, r = l + 1, m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m;}} return top;};
    for (const s of sources) {dist[s] = 0; push(0, s);}
    while (heap.length) {const [d, v] = pop(); if (d > dist[v]) continue; for (const [u, w] of adj[v]) if (d + w < dist[u]) {dist[u] = d + w; prev[u] = v; push(d + w, u);}}
    return {dist, prev};
  };
  const farthest = dist => {let best = -1, bd = -1; for (let i = 0; i < dist.length; i++) if (Number.isFinite(dist[i]) && dist[i] > bd) {bd = dist[i]; best = i;} return {best, bd};};
  let {dist: d0} = dijkstra([0]); const a = farthest(d0).best;
  const {dist: da, prev: pa} = dijkstra([a]); const b = farthest(da).best;
  const tips = [a, b], lengths = [Infinity, Infinity], skeleton = new Set(), walk = (from, prev) => {for (let v = from; v >= 0 && !skeleton.has(v); v = prev[v]) skeleton.add(v);};
  walk(b, pa); skeleton.add(a);
  for (let guard = 0; guard < 40; guard++) {
    const {dist, prev} = dijkstra([...skeleton]), f = farthest(dist);
    if (f.bd < minBranch) break;
    tips.push(f.best); lengths.push(f.bd); walk(f.best, prev);
  }
  // lengths[i]: distance (m) along the surface from tips[i] to the skeleton found before it (Infinity for the two ends of the main axis)
  return {pts, tips, lengths, skeleton, adj};
}

/** Vessel meshes that are several separate tubes in one mesh (the four lumbar veins of a side, each running from the body wall to the vena cava or the ascending lumbar vein). `tubeTips` walks the surface graph from
 *  its first vertex, so it only ever reaches ONE of the pieces and the other three got no ends audited at all (no connector, no taper: the end pieces of the lumbar veins stayed in 4 loose segments, 2026-11-18).
 *  For the vessels listed here every piece gets its own tips. Other multi-piece meshes (84 in the atlas: portal vein, intercostal sets, digital sets …) are not listed yet: each would add its own connectors and checks. */
export const MULTI_PIECE_VESSELS = process.env.MJ_NO_MULTI_PIECE ? /(?!)/ : /^Lumbar vein$/;   // MJ_NO_MULTI_PIECE=1: the old behaviour (one piece per mesh), for before/after comparisons
const MIN_PIECE_TRIANGLES = 40;
/** The connected pieces of a mesh (vertices welded by position), each with its own compact positions and indices; pieces below MIN_PIECE_TRIANGLES are loose debris and dropped. */
export function surfacePieces(g, minTriangles = MIN_PIECE_TRIANGLES) {
  const key = new Map(), remap = new Uint32Array(g.pos.length / 3); let n = 0;
  for (let i = 0; i < remap.length; i++) {
    const k = `${Math.round(g.pos[i * 3] * 1e5)},${Math.round(g.pos[i * 3 + 1] * 1e5)},${Math.round(g.pos[i * 3 + 2] * 1e5)}`;
    let v = key.get(k); if (v === undefined) { v = n++; key.set(k, v); } remap[i] = v;
  }
  const par = Array.from({length: n}, (_, i) => i), find = x => { while (par[x] !== x) x = par[x] = par[par[x]]; return x; };
  for (let i = 0; i < g.idx.length; i += 3) { const a = find(remap[g.idx[i]]), b = find(remap[g.idx[i + 1]]), c = find(remap[g.idx[i + 2]]); par[b] = a; par[c] = a; }
  const groups = new Map();
  for (let i = 0; i < g.idx.length; i += 3) { const r = find(remap[g.idx[i]]); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(i); }
  const pieces = [];
  for (const tris of groups.values()) {
    if (tris.length < minTriangles) continue;
    const local = new Map(), pos = [], idx = [];
    for (const i of tris) for (let t = 0; t < 3; t++) { const v = g.idx[i + t]; if (!local.has(v)) { local.set(v, pos.length / 3); pos.push(g.pos[v * 3], g.pos[v * 3 + 1], g.pos[v * 3 + 2]); } idx.push(local.get(v)); }
    pieces.push({pos: Float32Array.from(pos), idx: Uint32Array.from(idx)});
  }
  return pieces;
}
/** [{pts, tips, lengths}] of a vessel: one entry per connected piece for MULTI_PIECE_VESSELS, else the single entry of tubeTips. */
const tipsOf = (p, g) => { const pieces = MULTI_PIECE_VESSELS.test(p.name) ? surfacePieces(g) : [g];
  if (!MULTI_PIECE_VESSELS.test(p.name)) return [tubeTips(g)];
  // a piece is a plain tube, ~70 mm long and 4-6 mm across: the surface of a tube that thick is more than 6 mm (geodesic) from its axis, so the branch search would invent side tips; only the two ends of the axis count
  return (pieces.length ? pieces : [g]).map(piece => { const t = tubeTips(piece); return {...t, tips: t.tips.slice(0, 2), lengths: t.lengths.slice(0, 2)}; }); };

export function auditEnds() {
  const vessels = atlas.parts.filter(isVessel), tissue = new Grid(), vesselGrid = new Grid(), bySystem = {arterial: new Grid(), venous: new Grid()};
  for (const p of atlas.parts) {
    const target = isVessel(p) ? vesselGrid : TISSUE(p) ? tissue : null; if (!target) continue;
    const g = geom(p);
    for (let i = 0; i < g.idx.length; i += 3) {
      const t = [0, 1, 2].map(k => [g.pos[g.idx[i + k] * 3], g.pos[g.idx[i + k] * 3 + 1], g.pos[g.idx[i + k] * 3 + 2]]);
      target.add(p.id, t[0], t[1], t[2]);
      if (isVessel(p)) bySystem[p.system].add(p.id, t[0], t[1], t[2]);
    }
  }
  const rows = [];
  for (const p of vessels) {
    for (const {pts, tips, lengths} of tipsOf(p, geom(p))) for (const [k, tip] of tips.entries()) {
      const at = pts[tip], inTissue = tissue.nearest(at, .004, p.id);
      const near = vesselGrid.nearest(at, .03, p.id);
      const same = bySystem[p.system].nearest(at, .03, p.id);
      const kind = same.d < .0025 ? 'joined' : inTissue.d < .004 ? 'tissue' : 'dangling';
      rows.push({id: p.id, name: p.name, system: p.system, kind, branchMm: Number.isFinite(lengths[k]) ? +(lengths[k] * 1000).toFixed(1) : null, at: at.map(v => +v.toFixed(4)), toVessel: +(near.d * 1000).toFixed(1), nearestVessel: near.tag, toSameMm: +(same.d * 1000).toFixed(1), nearestSame: same.tag, closest: same.q && same.q.map(v => +v.toFixed(5)), toTissueMm: +(inTissue.d * 1000).toFixed(1)});
    }
  }
  // Second pass: a dangling end is joined only to a vessel of its own tree (scripts/lib/vessel-relation.mjs). `toSameMm`, `nearestSame` and `closest` now describe the nearest RELATED vessel of the same kind;
  // `anySameMm` / `anyNearest` keep the plain nearest one, and `lostGap` marks an end that used to be joined to an unrelated vessel (it is rounded off instead).
  const pairs = contactPairs(rows); saveContacts(pairs);
  const names = new Map(atlas.parts.map(p => [p.id, p.name])), relation = makeRelation(id => names.get(id), pairs, vessels.map(p => p.name)), ids = vessels.map(p => p.id);
  for (const r of rows) {
    r.anySameMm = r.toSameMm; r.anyNearest = r.nearestSame; r.rel = null; r.lostGap = false;
    if (r.kind !== 'dangling' || !r.closest) continue;
    const hit = relation.nearest(bySystem[r.system], r.at, r.id, .03, ids);
    r.lostGap = r.anySameMm <= 12 && !(hit.tag && hit.d <= .012);
    r.rel = hit.rel; r.toSameMm = hit.tag ? +(hit.d * 1000).toFixed(1) : 999; r.nearestSame = hit.tag; r.closest = hit.q && hit.q.map(v => +v.toFixed(5));
  }
  return rows;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const t = performance.now(), rows = auditEnds(), by = {};
  for (const r of rows) by[r.kind] = (by[r.kind] || 0) + 1;
  console.log(`vessel ends: ${rows.length}`, by, `${((performance.now() - t) / 1000).toFixed(0)} s`);
  if (process.argv.includes('--write')) fs.writeFileSync(root + 'docs/vessel-ends.json', JSON.stringify(rows));
}
export {atlas, geom};
