// Inventory of the lower-limb and pelvic arteries and veins as the site draws them (read-only measurement, not part of `npm run check`).
// Usage: node scripts/inventory-leg-vessels.mjs [--write]   (--write refreshes docs/lower-limb-vessel-inventory.json, the numbers quoted in docs/lower-limb-vessel-inventory.md)
// For every vessel mesh in scope (atlas, schematic and connector pieces together) it measures, on the rest pose:
//   centreline   rings of the welded surface graph, binned by geodesic distance from one tip: length, radius profile, number of branch tips, connected pieces
//   continuity   gap from each open end to the next segment (scripts/lib/vessel-segments.mjs, with and without the connector pieces of vessel-ends)
//   bones        surface vertices and centreline rings inside a bone, deepest overlap, smallest wall-to-bone clearance
//   neighbours   the muscles, nerves and bones nearest to the centreline (counts of the nearest structure per sample, with the median distance)
//   gluteal      pieces of pelvic vessels that sit on or beyond the outer surface of gluteus maximus
// Nothing here is a verdict on anatomy: it says where the model is broken or doubtful; the final anatomical check is the user's.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {loadWorld} from './lib/paokao-world.mjs';
import {analyse, loadVessels, pointInside} from './lib/vessel-segments.mjs';
import {tubeTips} from './lib/tube-tips.mjs';
import {Grid} from './audit-vessel-ends.mjs';
import {meshOf, ray, closest} from './lib/heart-geom.mjs';

const root = new URL('../', import.meta.url), out = fileURLToPath(new URL('docs/lower-limb-vessel-inventory.json', root));
const WRITE = process.argv.includes('--write');
const SCOPE = /iliac|gluteal|obturator|internal pudendal|external pudendal|inferior epigastric|superficial epigastric|femoral|popliteal|tibial|fibular|saphenous|genicular|malleolar|tarsal|arcuate|dorsalis pedis|plantar|calcaneal|foot|perforating|dorsal venous arch|dorsal metatarsal|metatarsal artery|metatarsal vein/i;
const EXCLUDE = /penis|palmar|carpal|humeral|scapular|coronary|thalamo|ulnar|radial|interosseous|brachial|digital artery of hand|uterine|testicular|thoracoepigastric|superior epigastric|femoral circumflex humeral/i;
const sideOf = (name, x) => /\bleft\b/i.test(name) ? 'Left' : /\bright\b/i.test(name) ? 'Right' : (x > 0 ? 'Left' : 'Right');
const mm = v => +(v * 1000).toFixed(1);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], len = a => Math.hypot(a[0], a[1], a[2]);

// ---- worlds ------------------------------------------------------------------------------------------------------------
const source = loadFullAtlas();
const V = await loadVessels({mode: 'after', source});
const {atlas, geometry} = source;
const world = loadWorld({paokao: true});

const tissue = {bone: new Grid(), muscle: new Grid(), nerve: new Grid()}, boneGeo = new Map(), glute = {Left: null, Right: null};
const LOW = p => p.bounds[0][1] < 1.2 && p.bounds[1][1] > -.01 && Math.abs((p.bounds[0][0] + p.bounds[1][0]) / 2) < .4;
const addGeo = (grid, tag, g) => { for (let i = 0; i < g.indices.length; i += 3) { const t = [0, 1, 2].map(k => [g.positions[g.indices[i + k] * 3], g.positions[g.indices[i + k] * 3 + 1], g.positions[g.indices[i + k] * 3 + 2]]); grid.add(tag, t[0], t[1], t[2]); } };
for (const p of atlas.parts) {
  if (p.stream === 'vessel-ends' || !LOW(p)) continue;
  // the source file files a few leg muscles and the iliotibial tract under 'skeletal': they count as muscle here, and disks, ribs and arm bones are not obstacles
  const muscleLike = /tibialis|fibularis|iliotibial/i.test(p.name);
  if (p.system === 'skeletal' && !muscleLike && !/disk|rib\b|costal|humerus|radius|ulna|capitate|hamate|lunate|pisiform|scaphoid|trapez|triquetral|skull|mandible|clavicle|scapula|sternum/i.test(p.name)) { const g = geometry(p); boneGeo.set(p.id, {pos: g.positions, idx: g.indices, name: p.name}); addGeo(tissue.bone, p.id, g); }
  else if (p.system === 'muscular' || muscleLike) { const g = geometry(p); addGeo(tissue.muscle, p.name, g); if (/gluteus maximus/i.test(p.name)) glute[sideOf(p.name, 0)] = {pos: g.positions, idx: g.indices, mesh: meshOf(g.positions, g.indices)}; }
}
for (const e of world.entries) {
  if (e.system !== 'nervous') continue;
  const g = e.load(); let lo = 9, hi = -9; for (let i = 1; i < g.positions.length; i += 3) { lo = Math.min(lo, g.positions[i]); hi = Math.max(hi, g.positions[i]); }
  if (hi < 1.1 && lo > -.01 && g.positions.length) addGeo(tissue.nerve, e.name.replace(/\.[lr]$/, '') + (/\.l$/.test(e.name) ? ' (left)' : /\.r$/.test(e.name) ? ' (right)' : ''), g);
}

// ---- vessel parts in scope ----------------------------------------------------------------------------------------------
const inScope = p => (p.stream !== 'vessel-ends') && !EXCLUDE.test(p.name) && (SCOPE.test(p.name) || V.region(p).region === 'lower-limb');
const ONLY = process.env.ONLY?.split(','), parts = V.bases.filter(inScope).filter(p => !ONLY || ONLY.includes(p.id));
const rows = [], ringsByPart = new Map();
for (const p of parts) {
  const q = V.g(p), end = V.byId.get(p.id + '-END'), endG = end ? V.g(end) : null;
  const t = tubeTips({pos: q.pos, idx: q.idx});
  // centreline: main chain = surface path between the two geodesically farthest tips; every vertex within 8 mm (geodesic) of it is assigned to its nearest chain vertex,
  // and the vertices sharing a 3 mm stretch of the chain form one ring (centre and mean radius). Side branches beyond 8 mm are left out.
  const n = t.pts.length, run = sources => { const dist = new Float64Array(n).fill(Infinity), prev = new Int32Array(n).fill(-1), lab = new Int32Array(n).fill(-1), heap = []; for (const s of sources) { dist[s] = 0; lab[s] = s; heap.push([0, s]); }
    while (heap.length) { heap.sort((x, y) => y[0] - x[0]); const [d, v] = heap.pop(); if (d > dist[v]) continue; for (const [u, w] of t.adj[v]) if (d + w < dist[u]) { dist[u] = d + w; prev[u] = v; lab[u] = lab[v]; heap.push([d + w, u]); } } return {dist, prev, lab}; };
  const fromA = run([t.tips[0]]); let bTip = t.tips[1]; for (let i = 0; i < n; i++) if (Number.isFinite(fromA.dist[i]) && fromA.dist[i] > fromA.dist[bTip]) bTip = i;
  const chain = []; for (let v = bTip; v >= 0; v = fromA.prev[v]) chain.push(v);
  const near = run(chain), BIN = .003, bins = new Map();
  for (let i = 0; i < n; i++) if (near.dist[i] < .008 && near.lab[i] >= 0) { const k = Math.floor(fromA.dist[near.lab[i]] / BIN); (bins.get(k) ?? bins.set(k, []).get(k)).push(i); }
  const ring = [...bins].sort((x, y) => x[0] - y[0]).map(([, vs]) => { const c = [0, 0, 0]; for (const v of vs) for (let a = 0; a < 3; a++) c[a] += t.pts[v][a] / vs.length; let r = 0; for (const v of vs) r += len(sub(t.pts[v], c)) / vs.length; return {c, r, k: vs.length}; });
  let length = 0; for (let i = 1; i < ring.length; i++) length += len(sub(ring[i].c, ring[i - 1].c));
  // the tube is straight between two rings, so the centreline is resampled every 3 mm between ring centres (radius interpolated): that is what the viewer draws
  const line = ring.length ? [{c: ring[0].c, r: ring[0].r}] : [];
  for (let i = 1; i < ring.length; i++) { const d = len(sub(ring[i].c, ring[i - 1].c)), k = Math.max(1, Math.round(d / .003)); for (let j = 1; j <= k; j++) { const u = j / k; line.push({c: [0, 1, 2].map(a => ring[i - 1].c[a] + (ring[i].c[a] - ring[i - 1].c[a]) * u), r: ring[i - 1].r + (ring[i].r - ring[i - 1].r) * u}); } }
  const rs = ring.map(r => r.r), third = Math.max(1, Math.floor(rs.length / 5)), avg = a => a.reduce((s, x) => s + x, 0) / (a.length || 1);
  const mid = rs.slice(third, rs.length - third), r0 = avg(rs.slice(0, third)), r1 = avg(rs.slice(-third)), rm = avg(mid.length ? mid : rs);
  // connected pieces
  const par = Array.from({length: q.pos.length / 3}, (_, i) => i), f = x => { while (par[x] !== x) x = par[x] = par[par[x]]; return x; };
  for (let i = 0; i < q.idx.length; i += 3) { par[f(q.idx[i])] = f(q.idx[i + 1]); par[f(q.idx[i + 1])] = f(q.idx[i + 2]); }
  const sizes = new Map(); for (let i = 0; i < par.length; i++) { const r = f(i); sizes.set(r, (sizes.get(r) ?? 0) + 1); }
  const comp = [...sizes.values()].sort((a, b) => b - a);
  const cx = t.pts.reduce((s, v) => s + v[0], 0) / n;
  // bones: surface vertices (stride sample) and centreline rings
  const insideBone = pt => { const h = tissue.bone.nearest(pt, .024, null); if (!h.tag) return {inside: false, d: h.d, tag: null}; const b = boneGeo.get(h.tag); return {inside: pointInside(pt, b), d: h.d, tag: h.tag}; };
  const stride = Math.max(1, Math.floor(t.pts.length / 220)); let vin = 0, vtot = 0, deep = 0, deepBone = null, minClear = Infinity;
  for (let i = 0; i < t.pts.length; i += stride) { vtot++; const r = insideBone(t.pts[i]); if (r.inside) { vin++; if (r.d > deep) { deep = r.d; deepBone = r.tag; } } }
  let rin = 0, rinLen = 0, ringDeep = 0, ringBone = null;
  line.forEach((rg, i) => { const r = insideBone(rg.c); if (r.tag) minClear = Math.min(minClear, r.inside ? -r.d - rg.r : r.d - rg.r); if (r.inside) { rin++; rinLen += BIN; if (r.d > ringDeep) { ringDeep = r.d; ringBone = r.tag; } } });
  const isolated = line.length ? line.filter(rg => !tissue.muscle.nearest(rg.c, .02, null).tag && !tissue.bone.nearest(rg.c, .03, null).tag).length : 0;
  ringsByPart.set(p.id, line.map(r => r.c));
  // neighbours
  const nb = {muscle: new Map(), nerve: new Map(), bone: new Map()}, dists = {muscle: [], nerve: [], bone: []};
  const step = 2;
  for (let i = 0; i < line.length; i += step) for (const k of ['muscle', 'nerve', 'bone']) {
    const h = tissue[k].nearest(line[i].c, k === 'muscle' ? .02 : .03, null); if (!h.tag) continue;
    const nm = k === 'bone' ? boneGeo.get(h.tag).name : h.tag; nb[k].set(nm, (nb[k].get(nm) ?? 0) + 1); dists[k].push(h.d);
  }
  const top = (m, k = 3) => [...m].sort((a, b) => b[1] - a[1]).slice(0, k).map(([name, c]) => name + ' x' + c);
  const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? mm(s[Math.floor(s.length / 2)]) : null; };
  // gluteus maximus relation (pelvic vessels behind the hip)
  const gl = glute[sideOf(p.name, cx)];
  let gluteal = null;
  if (gl && cx !== 0) {
    // pieces of this mesh behind the hip: inside the muscle belly, "superficial" (outside it, with gluteus maximus straight in front of the piece within 30 mm: the piece lies between the muscle and the skin) or deep/other
    const pieces = new Map(); for (let i = 0; i < par.length; i++) { const r = f(i); (pieces.get(r) ?? pieces.set(r, []).get(r)).push(i); }
    const detail = []; let inside = 0, superficial = 0;
    for (const vs of pieces.values()) {
      if (vs.length < 3) continue; const c = [0, 0, 0]; for (const v of vs) for (let a = 0; a < 3; a++) c[a] += q.pos[v * 3 + a] / vs.length;
      if (c[1] < .8 || c[1] > 1.06 || c[2] > .02) continue;
      const ins = pointInside(c, {pos: gl.pos, idx: gl.idx});
      if (ins) { inside++; continue; }
      const h = ray(gl.mesh, c, [0, 0, 1]); if (!h || h.t > .03) continue;
      superficial++; detail.push({vertices: vs.length, centreMm: c.map(v => Math.round(v * 1000)), muscleInFrontMm: mm(h.t)});
    }
    gluteal = {piecesInsideGlute: inside, piecesBehindMuscleSurface: superficial, detail: detail.slice(0, 8)};
  }
  rows.push({id: p.id, name: p.name, side: sideOf(p.name, cx), system: p.system, source: p.stream ?? 'atlas', verticesBase: n, verticesConnector: endG ? endG.vertexCount ?? V.g(end).pos.length / 3 : 0,
    pieces: comp.length, bigPieces: comp.filter(c => c >= 12).length, tips: t.tips.length, lengthMm: mm(length), radiusMm: {start: mm(r0), middle: mm(rm), end: mm(r1)},
    lengthOverDiameter: +(length / (2 * Math.max(rm, 1e-4))).toFixed(1),
    bone: {verticesInsidePct: +(100 * vin / vtot).toFixed(1), deepestVertexMm: mm(deep), deepestBone: deepBone ? boneGeo.get(deepBone).name : null, centrelineInsideMm: mm(rinLen), centrelineDeepestMm: mm(ringDeep), centrelineBone: ringBone ? boneGeo.get(ringBone).name : null, minWallClearanceMm: Number.isFinite(minClear) ? mm(minClear) : null},
    isolatedRingPct: line.length ? +(100 * isolated / line.length).toFixed(0) : 0, rings: ring.length, mmPerRing: ring.length > 1 ? +(1000 * length / (ring.length - 1)).toFixed(1) : null, near: {muscles: top(nb.muscle), nerves: top(nb.nerve), bones: top(nb.bone, 2), medianMm: {muscle: med(dists.muscle), nerve: med(dists.nerve), bone: med(dists.bone)}}, gluteal});
}
// ---- continuity (gaps) --------------------------------------------------------------------------------------------------
const ids = new Set(parts.map(p => p.id));
const gapRows = {};
for (const mode of ['before', 'after']) {
  const Vm = mode === 'after' ? V : await loadVessels({mode, source});
  const r = await analyse({regions: ['lower', 'thorax'], mode, V: Vm});
  gapRows[mode] = r.rows.filter(g => ids.has(g.id));
  const open = r.stats.open.filter(o => ids.has(o.id));
  for (const row of rows) {
    const mine = gapRows[mode].filter(g => g.id === row.id), big = mine.filter(g => g.gapMm > g.diameterMm * .5);
    (row.gaps ??= {})[mode] = {ends: mine.length, big: big.map(g => ({toId: g.neighbourId, to: g.neighbour, kind: g.kind, gapMm: g.gapMm, diameterMm: g.diameterMm})), openThick: open.filter(o => o.id === row.id).length};
  }
}
// ---- duplicates: two meshes of the same kind and side whose centrelines run together ----------------------------------------
const byId = new Map(rows.map(r => [r.id, r]));
const cover = (A, B, tol) => { const a = ringsByPart.get(A), b = ringsByPart.get(B); if (!a?.length || !b?.length) return 0; let hit = 0; for (const p of a) { let m = 1e9; for (const q of b) m = Math.min(m, len(sub(p, q))); if (m <= tol) hit++; } return hit / a.length; };
const overlaps = [];
for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) {
  const A = rows[i], B = rows[j]; if (A.side !== B.side || A.system !== B.system) continue;
  const TOL = +(process.env.OVERLAP_TOL ?? .003), ca = cover(A.id, B.id, TOL), cb = cover(B.id, A.id, TOL), m = Math.max(ca, cb);
  if (m >= +(process.env.OVERLAP_MIN ?? .5)) overlaps.push({a: A.id, aName: A.name, b: B.id, bName: B.name, side: A.side, aInB: +ca.toFixed(2), bInA: +cb.toFixed(2)});
}
// ---- tree edges: child end -> parent surface ------------------------------------------------------------------------------
const vb = JSON.parse(fs.readFileSync(new URL('app/mj-vessel-branches.json', root), 'utf8')), pk = JSON.parse(fs.readFileSync(new URL('app/mj-paokao.json', root), 'utf8'));
const idsByName = new Map(); for (const r of rows) (idsByName.get(r.name.toLowerCase()) ?? idsByName.set(r.name.toLowerCase(), []).get(r.name.toLowerCase())).push(r.id);
const meshCache = new Map(), meshOfId = id => meshCache.get(id) ?? meshCache.set(id, (() => { const g = V.g(V.byId.get(id)); return meshOf(g.pos, g.idx); })()).get(id);
const edges = [], seen = new Set();
const addEdge = (child, parent, src) => {
  const key = child + '>' + parent; if (seen.has(key)) return; seen.add(key);
  const cIds = idsByName.get(child.toLowerCase()), pIds = idsByName.get(parent.toLowerCase()); if (!cIds || !pIds) { if (cIds) edges.push({child, parent, src, parentInScope: false}); return; }
  let best = {d: 1e9}, contact = 1e9;
  for (const cid of cIds) { const g = V.g(V.byId.get(cid)); const st = Math.max(1, Math.floor(g.pos.length / 3 / 150)); for (let i = 0; i < g.pos.length / 3; i += st) for (const pid of pIds) contact = Math.min(contact, closest(meshOfId(pid), [g.pos[i * 3], g.pos[i * 3 + 1], g.pos[i * 3 + 2]]).d); }
  for (const cid of cIds) { const tips = V.infoOf(cid).tips; for (const pid of pIds) for (const tp of tips) { const h = closest(meshOfId(pid), tp.center); if (h.d < best.d) best = {d: h.d, cid, pid, radiusMm: mm(tp.radius)}; } }
  edges.push({child, parent, src, childIds: cIds, parentIds: pIds, tipToParentSurfaceMm: best.d < 1e8 ? mm(best.d) : null, contactMm: mm(contact), tipRadiusMm: best.radiusMm ?? null});
};
for (const [c, pa] of Object.entries(vb.parents)) if (idsByName.has(c.toLowerCase())) addEdge(c, pa, 'atlas-parent-map');
for (const it of Object.values(pk)) if (it && it.parent && it.system && idsByName.has(it.name.toLowerCase())) addEdge(it.name, it.parent, 'schematic-parent');
// ---- structural order at three landmarks ---------------------------------------------------------------------------------------
const centreAt = (name, y, near) => { const ids = (idsByName.get(name.toLowerCase()) ?? []); let best = null; for (const id of ids) for (const c of (ringsByPart.get(id) ?? [])) { const d = Math.abs(c[1] - y) + (near ? len(sub(c, near)) * .1 : 0); if (!best || d < best.d) best = {d, c}; } return best && Math.abs(best.c[1] - y) < .02 ? best.c : null; };
const nerveAt = (re, y, side) => { const hits = []; for (const e of world.entries) { if (e.system !== 'nervous') continue; const nm = e.name; if (!re.test(nm) || !(side === 'Left' ? /\.l$/.test(nm) : /\.r$/.test(nm))) continue; const g = e.load(); let c = [0, 0, 0], k = 0; for (let i = 0; i < g.positions.length; i += 3) if (Math.abs(g.positions[i + 1] - y) < .01) { c[0] += g.positions[i]; c[1] += g.positions[i + 1]; c[2] += g.positions[i + 2]; k++; } if (k > 3) hits.push({name: nm, c: c.map(v => v / k)}); } return hits; };
const orders = [];
for (const side of ['Left', 'Right']) {
  const lat = side === 'Left' ? 1 : -1;   // sign of x on the lateral side
  const at = (label, items) => orders.push({side, label, items: items.filter(i => i.c).map(i => ({name: i.name, xLateralMm: i.c ? mm(i.c[0] * lat) : null, zAnteriorMm: i.c ? mm(i.c[2]) : null, yMm: i.c ? mm(i.c[1]) : null})).sort((p, q) => q.xLateralMm - p.xLateralMm)});
  const fn = nerveAt(/^Femoral nerve\.[lr]/, .86, side)[0];
  at('Femoral triangle, y 0.86 m (expected lateral to medial: nerve, artery, vein)', [{name: 'Femoral nerve', c: fn?.c}, {name: 'Femoral artery', c: centreAt(`${side} femoral artery`, .86)}, {name: 'Femoral vein', c: centreAt(`${side} femoral vein`, .86)}]);
  const tn = nerveAt(/^Tibial nerve\.[lr]/, .46, side)[0];
  at('Popliteal fossa, y 0.46 m (expected superficial/posterior to deep/anterior: nerve, vein, artery)', [{name: 'Tibial nerve', c: tn?.c}, {name: 'Popliteal vein', c: centreAt(`${side} popliteal vein`, .46)}, {name: 'Popliteal artery', c: centreAt(`${side} popliteal artery`, .46)}]);
  const tn2 = nerveAt(/^Tibial nerve\.[lr]/, .22, side)[0];
  at('Mid leg, y 0.22 m (posterior tibial artery, vein and tibial nerve)', [{name: 'Tibial nerve', c: tn2?.c}, {name: 'Posterior tibial vein', c: centreAt(`${side} posterior tibial vein`, .22)}, {name: 'Posterior tibial artery', c: centreAt(`${side} posterior tibial artery`, .22)}, {name: 'Fibular artery', c: centreAt(`${side} fibular artery`, .22)}]);
}
// ---- artery and companion vein: how far apart the two centrelines run -------------------------------------------------------------
const lineOf = names => names.flatMap(n => (idsByName.get(n.toLowerCase()) ?? []).flatMap(id => ringsByPart.get(id) ?? []));
const companions = [];
for (const side of ['Left', 'Right']) for (const [art, vein] of [['femoral artery', 'femoral vein'], ['popliteal artery', 'popliteal vein'], ['posterior tibial artery', 'posterior tibial vein'], ['anterior tibial artery', 'anterior tibial vein'], ['fibular artery', 'fibular vein'], ['deep femoral artery', 'deep femoral vein'], ['lateral circumflex femoral artery', 'lateral circumflex femoral vein'], ['medial circumflex femoral artery', 'medial circumflex femoral vein'], ['external iliac artery', 'external iliac vein'], ['internal iliac artery', 'internal iliac vein']]) {
  const A = lineOf([`${side} ${art}`]), B = lineOf([`${side} ${vein}`]); if (!A.length || !B.length) { companions.push({side, artery: art, vein, note: 'one of the two is missing'}); continue; }
  const d = A.map(p => Math.min(...B.map(q => len(sub(p, q))))).sort((x, y) => x - y);
  companions.push({side, artery: art, vein, veinMeshes: (idsByName.get(`${side} ${vein}`.toLowerCase()) ?? []).length, medianMm: mm(d[Math.floor(d.length / 2)]), p90Mm: mm(d[Math.floor(d.length * .9)]), maxMm: mm(d[d.length - 1])});
}
// ---- connector pieces whose base mesh is removed from the atlas ------------------------------------------------------------------
const orphanEnds = V.parts.filter(p => p.stream === 'vessel-ends' && !V.byId.has(p.id.replace(/-END$/, ''))).map(p => ({id: p.id, name: p.name, vertices: p.vertexCount, boundsMm: p.bounds.map(b => b.map(v => Math.round(v * 1000)))})).filter(o => SCOPE.test(o.name) && !EXCLUDE.test(o.name));
// ---- cards: branch lists vs the parent relation --------------------------------------------------------------------------
const childrenOf = {}; for (const e of edges) (childrenOf[e.parent] ??= new Set()).add(e.child);
const cardGap = []; for (const [parent, kids] of Object.entries(childrenOf)) { const listed = new Set(vb.branches[parent] ?? []), missing = [...kids].filter(c => !listed.has(c)); if (missing.length) cardGap.push({vessel: parent, listedOnCard: [...listed], missingFromCard: missing}); }
if (process.env.DUMP_LINES) fs.writeFileSync(process.env.DUMP_LINES, JSON.stringify(Object.fromEntries(ringsByPart)));
if (process.env.DEBUG_RINGS) for (const [id, r] of ringsByPart) console.log(id, r.length, r.slice(0, 3).map(c => c.map(v => Math.round(v * 1000))).join(' / '), '...', r.slice(-1).map(c => c.map(v => Math.round(v * 1000))).join());
const result = {rowCount: rows.length, rows, overlaps, edges, orders, companions, orphanEnds, cardGap};
if (WRITE) { fs.writeFileSync(out, JSON.stringify(result)); console.log(`wrote ${out}: ${rows.length} vessel meshes, ${edges.length} parent-child pairs, ${overlaps.length} overlapping pairs`); } else { console.log(JSON.stringify(result).slice(0, 1500)); }
