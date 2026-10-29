// Adjacent-segment analysis of arteries and veins. A "segment" is one vessel mesh; each of its ends (tube tips) is looked at together with the nearest segment of the same kind that lies ahead of it:
//   gap        distance from the end-cap centre to that segment's surface (0 when they overlap)
//   tangent    end-to-end continuation: angle between this end's outward direction and the reversed outward direction of the neighbour's own end (0 = straight on).
//              At a side junction (the neighbour is a parent trunk) the angle is the branching angle and is only reported.
//   diameter   end-to-end: ratio of the two diameters; at a junction: branch diameter against trunk diameter
// `mode: 'before'` ignores the connector pieces of public/models/vessel-ends, `'after'` counts them: an end that carries a connector is measured from the connector's far end.
import esbuild from 'esbuild';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadFullAtlas} from './full-atlas.mjs';
import {tubeTips} from './tube-tips.mjs';
import {weldSurface, endFrame, sub, add, len, unit, dot} from './vessel-frames.mjs';
import {Grid} from '../audit-vessel-ends.mjs';

const root = new URL('../../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
export const REGIONS = {upper: 'upper-limb', lower: 'lower-limb', thorax: 'trunk', head: 'head-neck'};
export const AHEAD_DEG = 70, SEARCH_MM = 40, FADE_RADIUS = .0018;
const isVessel = p => p.system === 'arterial' || p.system === 'venous';

export async function regionTools() {
  fs.mkdirSync(file('.sites-runtime'), {recursive: true});
  const out = file('.sites-runtime/region-entry.mjs');
  await esbuild.build({entryPoints: [file('scripts/lib/region-entry.ts')], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error', external: ['three']});
  return import(out + '?t=' + Date.now());
}

/** Everything the checks need: the full atlas, the region of each vessel, a triangle grid per kind. */
export async function loadVessels({mode = 'after', source} = {}) {
  const {anatomicalRegion, anatomicalSubregion, anatomicalSide} = await regionTools();
  const {atlas, geometry} = source ?? loadFullAtlas();
  const parts = atlas.parts.filter(isVessel), byId = new Map(parts.map(p => [p.id, p]));
  const isEnd = p => p.stream === 'vessel-ends';
  const bases = parts.filter(p => !isEnd(p)), ends = new Map(parts.filter(isEnd).map(p => [p.id.replace(/-END$/, ''), p]));
  const grids = {arterial: new Grid(), venous: new Grid()};
  const geo = new Map(), g = p => geo.get(p.id) ?? geo.set(p.id, (() => { const q = geometry(p); return {pos: q.positions, idx: q.indices}; })()).get(p.id);
  for (const p of mode === 'after' ? parts : bases) {
    const q = g(p);
    for (let i = 0; i < q.idx.length; i += 3) { const t = [0, 1, 2].map(k => [q.pos[q.idx[i + k] * 3], q.pos[q.idx[i + k] * 3 + 1], q.pos[q.idx[i + k] * 3 + 2]]); grids[p.system].add(p.id, t[0], t[1], t[2]); }
  }
  const info = new Map();
  /** surface graph + tips (with frames) of a part, cached */
  const infoOf = id => {
    if (info.has(id)) return info.get(id);
    const p = byId.get(id), q = g(p), surf = weldSurface(q.pos, q.idx), tips = [];
    if (!id.endsWith('-END')) { const t = tubeTips({pos: q.pos, idx: q.idx}); for (const i of t.tips) { const fr = endFrame(surf, t.pts[i]); if (fr) tips.push({at: t.pts[i], ...fr}); } }
    const entry = {surf, tips}; info.set(id, entry); return entry;
  };
  const region = p => { const r = anatomicalRegion(p); return {region: r, sub: anatomicalSubregion(p), side: anatomicalSide(p)}; };
  return {atlas, parts, bases, ends, grids, g, infoOf, region, byId};
}

/** The connector tube of `piece` that starts at this tip (its back end lies 1-1.5 mm inside the vessel, behind the end cap): far end centre, direction and radius there.
 *  A piece holds one tube per treated end, so tubes are told apart by their back end rather than by the nearest vertex. */
function connectorEnd(piece, g, tip) {
  const q = g(piece), n = q.pos.length / 3, par = Array.from({length: n}, (_, i) => i), f = x => { while (par[x] !== x) x = par[x] = par[par[x]]; return x; };
  for (let i = 0; i < q.idx.length; i += 3) { par[f(q.idx[i])] = f(q.idx[i + 1]); par[f(q.idx[i + 1])] = f(q.idx[i + 2]); }
  const comps = new Map(); for (let i = 0; i < n; i++) { const r = f(i); (comps.get(r) ?? comps.set(r, []).get(r)).push([q.pos[i * 3], q.pos[i * 3 + 1], q.pos[i * 3 + 2]]); }
  const want = add(tip.center, tip.dir, -.0015), reach = .0006 + 1.3 * tip.radius;
  let pick = null;
  for (const vs of comps.values()) {
    // the two ends of the tube: the vertex farthest from the first vertex, then the vertex farthest from that one
    const far = (from) => vs.reduce((b, v) => len(sub(v, from)) > len(sub(b, from)) ? v : b, vs[0]);
    const a = far(vs[0]), b = far(a), ring = (c) => { const m = vs.filter(v => len(sub(v, c)) < Math.max(.0016, 1.6 * tip.radius)); return m.reduce((s, v) => add(s, v, 1 / m.length), [0, 0, 0]); };
    for (const [start, end] of [[a, b], [b, a]]) {
      const sc = ring(start), d = len(sub(sc, want));
      if (d <= reach && (!pick || d < pick.d)) pick = {d, vs, end, sc};
    }
  }
  if (!pick) return null;
  // far end: vertices within 0.3 mm (along the tube) of the extreme vertex form the last ring
  const near = pick.vs.filter(v => len(sub(v, pick.end)) < .005), c0 = near.reduce((s, v) => add(s, v, 1 / near.length), [0, 0, 0]), axis = unit(sub(pick.end, c0));
  const ringV = pick.vs.filter(v => dot(sub(v, pick.end), axis) > -.0003), center = ringV.reduce((s, v) => add(s, v, 1 / ringV.length), [0, 0, 0]);
  let r = 0; for (const v of ringV) { const d = sub(v, center); r += Math.sqrt(Math.max(0, len(d) ** 2 - dot(d, axis) ** 2)) / ringV.length; }
  const rest = pick.vs.filter(v => { const d = len(sub(v, center)); return d > .0015 && d < .004; }), back = rest.length ? rest.reduce((s, v) => add(s, v, 1 / rest.length), [0, 0, 0]) : pick.sc;
  return {center, dir: unit(sub(center, back)), radius: Math.max(r, .0001), lengthMm: len(sub(center, pick.sc)) * 1000};
}

/** Ray-parity test: is p inside the closed mesh {pos, idx}? */
export function pointInside(p, {pos, idx}) {
  const d = [.8132, .4021, .4213], n = Math.hypot(...d); d[0] /= n; d[1] /= n; d[2] /= n;
  let hits = 0;
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
    const e1 = [pos[b] - pos[a], pos[b + 1] - pos[a + 1], pos[b + 2] - pos[a + 2]], e2 = [pos[c] - pos[a], pos[c + 1] - pos[a + 1], pos[c + 2] - pos[a + 2]];
    const h = [d[1] * e2[2] - d[2] * e2[1], d[2] * e2[0] - d[0] * e2[2], d[0] * e2[1] - d[1] * e2[0]], det = e1[0] * h[0] + e1[1] * h[1] + e1[2] * h[2];
    if (Math.abs(det) < 1e-18) continue;
    const f = 1 / det, s = [p[0] - pos[a], p[1] - pos[a + 1], p[2] - pos[a + 2]], u = f * (s[0] * h[0] + s[1] * h[1] + s[2] * h[2]); if (u < 0 || u > 1) continue;
    const q = [s[1] * e1[2] - s[2] * e1[1], s[2] * e1[0] - s[0] * e1[2], s[0] * e1[1] - s[1] * e1[0]], v = f * (d[0] * q[0] + d[1] * q[1] + d[2] * q[2]); if (v < 0 || u + v > 1) continue;
    if (f * (e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]) > 0) hits++;
  }
  return hits % 2 === 1;
}
const deg = x => Math.acos(Math.max(-1, Math.min(1, x))) * 180 / Math.PI;
/** Segments count as adjacent when the gap is at most this many mm: a few millimetres plus six diameters, never more than SEARCH_MM. */
export const adjacentMm = diameterMm => Math.min(SEARCH_MM, 3 + 6 * diameterMm);

/** One row per end of every in-scope vessel that has a same-kind segment close enough ahead of it to be the next segment (or the trunk it joins).
 *  Ends without one are counted as terminal (`terminal`), ends that the vessel-ends step tapers to a point as `tapered`. */
export async function analyse({regions = ['upper'], mode = 'after', V} = {}) {
  V ??= await loadVessels({mode});
  const want = new Set(regions.map(r => REGIONS[r] ?? r)), rows = [], stats = {ends: 0, terminal: 0, tapered: 0, vessels: 0};
  const scope = V.bases.filter(p => want.has(V.region(p).region));
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (const p of scope) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], p.bounds[0][k]); hi[k] = Math.max(hi[k], p.bounds[1][k]); }
  const near = V.bases.filter(p => [0, 1, 2].every(k => p.bounds[1][k] > lo[k] - .05 && p.bounds[0][k] < hi[k] + .05));
  // every end cap of every nearby vessel: the candidates for "the next segment"
  const caps = {arterial: [], venous: []};
  for (const p of near) for (const t of V.infoOf(p.id).tips) caps[p.system].push({id: p.id, name: p.name, ...t});
  stats.vessels = scope.length;
  for (const p of scope) {
    const rg = V.region(p), {tips} = V.infoOf(p.id), connector = V.ends.get(p.id);
    for (const tip of tips) {
      stats.ends++;
      let end = {at: tip.center, dir: tip.dir, radius: tip.radius, connector: false};
      if (mode === 'after' && connector) {
        const c = connectorEnd(connector, V.g, tip);
        if (c && c.lengthMm > 2.5) { if (c.radius < tip.radius * .4) { stats.tapered++; continue; } end = {at: c.center, dir: c.dir, radius: c.radius, connector: true}; }
      }
      const d2 = end.radius * 2000, limit = adjacentMm(d2) / 1000, skip = new Set([p.id, p.id + '-END']);
      // (1) another end cap that faces this one
      let best = null;
      for (const c of caps[p.system]) {
        if (c.id === p.id) continue;
        const v = sub(c.center, end.at), dist = len(v); if (dist > limit) continue;
        const faces = dist < Math.max(end.radius, c.radius) || (deg(dot(end.dir, unit(v))) <= 55 && deg(dot(c.dir, unit(sub(end.at, c.center)))) <= 70);
        if (faces && (!best || dist < best.dist)) best = {dist, cap: c};
      }
      // (2) otherwise the surface of the trunk it runs into
      const hit = V.grids[p.system].nearest(end.at, limit, skip);
      let kind, nId, nName, nRadius, angle, gap, target;
      if (best) {
        const surf = hit.tag ? hit.d : best.dist; gap = Math.min(best.dist, surf);
        target = {point: best.cap.center, dir: best.cap.dir, radius: best.cap.radius, inward: best.cap.dir.map(v => -v)};
        kind = 'end-to-end'; nId = best.cap.id; nName = best.cap.name; nRadius = best.cap.radius; angle = deg(-dot(end.dir, best.cap.dir));
      } else if (hit.tag && hit.q && (hit.d < end.radius * 1.2 || deg(dot(end.dir, unit(sub(hit.q, end.at)))) <= 70)) {
        gap = hit.d; kind = 'junction'; nId = hit.tag.replace(/-END$/, ''); const np = V.byId.get(nId) ?? V.byId.get(hit.tag); nName = np?.name ?? hit.tag;
        const fr = endFrame(V.infoOf(V.byId.has(nId) ? nId : hit.tag).surf, hit.q); nRadius = fr?.radius ?? null; angle = fr ? deg(Math.abs(dot(end.dir, fr.dir))) : null;
        target = {point: hit.q, dir: fr?.dir ?? null, radius: fr?.radius ?? end.radius, inward: fr ? unit(sub(fr.centroid, hit.q)) : unit(sub(hit.q, end.at))};
      } else { stats.terminal++; continue; }
      // a connector that dives into the next tube ends inside it: overlap, not a gap
      if (gap > 0 && [nId, hit.tag].some(id => id && V.byId.has(id) && pointInside(end.at, V.g(V.byId.get(id))))) gap = 0;
      rows.push({id: p.id, name: p.name, system: p.system, region: rg.region, sub: rg.sub, side: rg.side, at: end.at, diameterMm: +d2.toFixed(2), connector: end.connector,
        gapMm: +(gap * 1000).toFixed(2), kind, tangentDeg: angle == null ? null : +angle.toFixed(0), neighbourId: nId, neighbour: nName, neighbourDiameterMm: nRadius ? +(nRadius * 2000).toFixed(2) : null,
        diameterRatio: nRadius ? +(Math.max(end.radius, nRadius) / Math.min(end.radius, nRadius)).toFixed(2) : null, dir: end.dir, radius: end.radius, capAt: end.at, tipAt: tip.at, target});
    }
  }
  return {rows, stats, V};
}
export const GAP_FACTOR = .5;   // a gap is listed when it is larger than half the vessel's diameter
export const bigGaps = rows => rows.filter(r => r.gapMm > r.diameterMm * GAP_FACTOR);

/** Which gaps the vessel-ends step bridges with a connector: a continuation (end facing end) within reach, or a branch that runs into its trunk within a few diameters.
 *  Small branches that stop short of a trunk are left alone: they end in muscle or fascia, and joining them would invent anatomy. */
export function bridgeable(r) {
  if (r.gapMm <= r.diameterMm * GAP_FACTOR) return false;
  if (r.kind === 'end-to-end') return r.tangentDeg <= 120 && r.gapMm <= adjacentMm(r.diameterMm);
  return (r.diameterMm > 3.6 || r.gapMm <= 1.5 * r.diameterMm + 1) && r.gapMm <= 2 + 3 * r.diameterMm;
}
