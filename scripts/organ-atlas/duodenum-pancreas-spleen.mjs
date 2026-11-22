// Duodenum, pancreas and spleen detail package. No external model: the BodyParts3D duodenum, pancreas, spleen, ducts and vessels (public/models/atlas.json, CC BY 4.0, already in the
// repository) are subdivided for a smooth surface and their parts are marked on that surface (triangle labels, no new meshes):
//   Duodenum  zone 1 superior part, 2 descending part, 3 inferior (horizontal) part, 4 ascending part — cut along a centre line at its three bends;
//             line 1 major duodenal papilla, 2 minor duodenal papilla (patches on the wall; the papillae open inside, on the posteromedial wall), 3 duodenojejunal flexure
//             (the stretch of gut at the bend).
//   Pancreas  zone 1 head, 2 uncinate process, 3 neck, 4 body, 5 tail — the neck is the part in front of the superior mesenteric and portal veins, the head lies to their right,
//             the uncinate process is the part of the head that hooks behind the superior mesenteric vein, the tail is the last 25 mm towards the spleen.
//   Spleen    zone 1 diaphragmatic surface, 2 gastric surface, 3 renal surface, 4 colic surface — a visceral surface is the part of the spleen that faces that organ;
//             line 1 splenic hilum (where the splenic vessels enter).
// Built by us (schematic, single continuous tubes along a smooth centre line, ends placed on the meshes that are there): the hepatopancreatic ampulla, the accessory pancreatic duct,
// the supraduodenal artery, the suspensory muscle (ligament) of the duodenum as a flat band with thickness, the celiac and superior mesenteric plexuses.
import {weld, loopSubdivide, graphOf, dijkstra, clipPlane, distToPolyline, smoothPolyline, vertexNormals} from '../lib/organ-mesh.mjs';
import {add, sub, mul, lerp, len, unit, cross, verticesOf, nearest, merge, tubeThrough} from '../lib/organ-supply.mjs';
import {tidy} from '../lib/organ-tidy.mjs';
import {splitByField, triCentre} from '../lib/organ-parts.mjs';

export const id = 'duodenum-pancreas-spleen';
const D = (a, b) => len(sub(a, b));
const centroid = pts => mul(pts.reduce((s, p) => add(s, p), [0, 0, 0]), 1 / pts.length);

/** Parts copied from the atlas or the other packages: [key, source, id or name, keep y >= lo, keep y <= hi]. */
export const COPIED = [
  // arteries
  ['Abdominal aorta', 'atlas', 'FJ1932', 1.07, 1.205], ['Celiac trunk', 'atlas', 'FJ3421'], ['Common hepatic artery', 'atlas', 'FJ3078'], ['Hepatic artery proper', 'atlas', 'FJ3081', 1.1, 1.18],
  ['Gastroduodenal artery', 'atlas', 'FJ3432'], ['Right gastro-omental artery', 'atlas', 'FJ3596'], ['Left gastric artery', 'atlas', 'FJ3499', 1.1, 1.18],
  ['Anterior superior pancreaticoduodenal artery', 'atlas', 'FJ3409'], ['Posterior superior pancreaticoduodenal artery', 'atlas', 'FJ3557'],
  ['Inferior pancreaticoduodenal artery', 'atlas', 'FJ3446'], ['Anterior inferior pancreaticoduodenal artery', 'atlas', 'FJ3401'], ['Posterior inferior pancreaticoduodenal artery', 'atlas', 'FJ3546'],
  ['Superior mesenteric artery', 'atlas', 'FJ3644', 1.075],
  ['Splenic artery', 'atlas', 'FJ3640'], ['Dorsal pancreatic artery', 'atlas', 'FJ3430'], ['Greater pancreatic artery', 'atlas', 'FJ3433'], ['Caudal pancreatic artery', 'atlas', 'FJ3419'],
  ['Inferior pancreatic artery', 'atlas', 'FJ3444'],
  // veins (portal system and the systemic veins the duodenum and pancreas lie on)
  ['Hepatic portal vein', 'atlas', 'FJ3082', 1.1, 1.18], ['Splenic vein', 'atlas', 'FJ3641'], ['Superior mesenteric vein', 'atlas', 'FJ3647', 1.075], ['Inferior mesenteric vein', 'atlas', 'FJ3443', 1.075],
  ['Right gastro-omental vein', 'atlas', 'FJ3597'],
  ['Anterior pancreaticoduodenal vein', 'atlas', 'FJ3545'], ['Inferior pancreaticoduodenal vein', 'atlas', 'FJ3646'], ['Posterior superior pancreaticoduodenal vein', 'atlas', 'FJ3655'],
  ['Inferior vena cava', 'atlas', 'FJ3659', 1.07, 1.2],
  // nerves
  ['Right celiac ganglion', 'paokao', 'Right celiac ganglion'], ['Left celiac ganglion', 'paokao', 'Left celiac ganglion'],
  ['Right superior mesenteric ganglion', 'paokao', 'Right superior mesenteric ganglion'], ['Left superior mesenteric ganglion', 'paokao', 'Left superior mesenteric ganglion'],
  ['Right greater splanchnic nerve', 'paokao', 'Right greater splanchnic nerve', 1.1, 1.21], ['Left greater splanchnic nerve', 'paokao', 'Left greater splanchnic nerve', 1.1, 1.21],
  ['Right aorticorenal ganglion', 'paokao', 'Right aorticorenal ganglion'], ['Left aorticorenal ganglion', 'paokao', 'Left aorticorenal ganglion'],
  ['Right lesser splanchnic nerve', 'paokao', 'Right lesser splanchnic nerve', 1.1, 1.21], ['Left lesser splanchnic nerve', 'paokao', 'Left lesser splanchnic nerve', 1.1, 1.21],
  ['Posterior vagal trunk', 'paokao', 'Posterior vagal trunk', 1.12, 1.21],
  // ducts
  ['Cystic duct', 'atlas', 'FJ3080'], ['Main pancreatic duct', 'atlas', 'FJ1896'],
  // neighbouring organs (context) and the related muscle
  ['Stomach', 'atlas', 'FJ2564'], ['Gallbladder', 'atlas', 'FJ2817'], ['Left kidney', 'atlas', 'FJ3145'], ['Right kidney', 'atlas', 'FJ3147'], ['Jejunum', 'atlas', 'FJ2606'],
  ['Transverse colon', 'atlas', 'FJ2572'], ['Diaphragm', 'atlas', 'FJ3131', 1.07, 1.2],
];
const CONTEXT = ['Stomach', 'Gallbladder', 'Left kidney', 'Right kidney', 'Jejunum', 'Transverse colon', 'Diaphragm', 'Cystic duct', 'Common hepatic duct', 'Bile duct', 'Main pancreatic duct'];

export function build({atlasPart, nervePart, paokaoPart, writer}) {
  const src = {atlas: atlasPart, nerve: nervePart, paokao: paokaoPart}, meshes = new Map();
  for (const [key, kind, sid, lo, hi] of COPIED) {
    let m = src[kind](sid);
    if (lo !== undefined) m = clipPlane(m.positions, m.indices, [0, -1, 0], -lo);
    if (hi !== undefined) m = clipPlane(m.positions, m.indices, [0, 1, 0], hi);
    // the diaphragm: only the crura and the parts next to the aorta (the suspensory muscle of the duodenum arises from the right crus); the domes would cover everything
    if (key === 'Diaphragm') { m = clipPlane(m.positions, m.indices, [1, 0, 0], .045); m = clipPlane(m.positions, m.indices, [-1, 0, 0], .045); m = clipPlane(m.positions, m.indices, [0, 0, 1], .03); }
    // the transverse colon: only its left part, at the left colic flexure next to the spleen
    if (key === 'Transverse colon') m = clipPlane(m.positions, m.indices, [-1, 0, 0], -.03);
    meshes.set(key, weld(m.positions, m.indices, 1e-6));
  }
  // the atlas "common hepatic duct" runs on down to the duodenum: below the junction of the cystic duct it is the bile duct
  const chd = atlasPart('FJ3079'), cyst = verticesOf(meshes.get('Cystic duct')), chdV = verticesOf(weld(chd.positions, chd.indices, 1e-6));
  let joinY = 0, bj = Infinity; for (const p of chdV) { const d = D(p, nearest(cyst, p)); if (d < bj) { bj = d; joinY = p[1]; } }
  meshes.set('Common hepatic duct', weld(...Object.values(clipPlane(chd.positions, chd.indices, [0, -1, 0], -joinY)), 1e-6));
  meshes.set('Bile duct', weld(...Object.values(clipPlane(chd.positions, chd.indices, [0, 1, 0], joinY)), 1e-6));

  const V = key => verticesOf(meshes.get(key));
  // ---- the three organs, subdivided
  const organ = sid => { const w = weld(...Object.values(atlasPart(sid)), 1e-6), s = loopSubdivide(w.positions, w.indices, 2); return {...s, adj: graphOf(s.positions, s.indices), n: s.positions.length / 3}; };
  const duo = organ('FJ2573'), pan = organ('FJ1895'), spl = organ('FJ2561');
  const P = (m, v) => [m.positions[v * 3], m.positions[v * 3 + 1], m.positions[v * 3 + 2]];
  const nearestV = (m, p) => { let b = 0, bd = Infinity; for (let v = 0; v < m.n; v++) { const d = D(P(m, v), p); if (d < bd) { bd = d; b = v; } } return b; };
  const contact = (m, pts) => { let best = [Infinity, 0]; for (let v = 0; v < m.n; v += 2) { const d = D(P(m, v), nearest(pts, P(m, v))); if (d < best[0]) best = [d, v]; } return best[1]; };

  // ---- duodenum: centre line from the pylorus to the duodenojejunal flexure (rings of equal distance over the surface from the pylorus), cut at its bends
  const pyl = contact(duo, V('Stomach')), djV = contact(duo, V('Jejunum')), fromPyl = dijkstra(duo.adj, [pyl]);
  const STEP = .003, bins = new Map();
  for (let v = 0; v < duo.n; v++) { const b = Math.floor(fromPyl.dist[v] / STEP); if (!bins.has(b)) bins.set(b, []); bins.get(b).push(P(duo, v)); }
  const djDist = fromPyl.dist[djV];
  const line = smoothPolyline([...bins.keys()].sort((a, b) => a - b).filter(b => b * STEP <= djDist).map(b => centroid(bins.get(b))), 3, 3);
  const arc = [0]; for (let i = 1; i < line.length; i++) arc.push(arc[i - 1] + D(line[i], line[i - 1]));
  const tangent = i => unit(sub(line[Math.min(line.length - 1, i + 2)], line[Math.max(0, i - 2)]));
  // superior flexure: the line turns down (after the first few millimetres, which follow the pyloric ring); inferior flexure: it turns to run across to the left;
  // the ascending part begins on the left of the aorta
  const aortaX = (() => { const a = verticesOf(meshes.get('Abdominal aorta')).filter(p => p[1] < 1.11); return a.reduce((s, p) => s + p[0], 0) / a.length; })();
  let b1 = line.findIndex((_, i) => i >= 5 && tangent(i)[1] < -.6);
  let b2 = line.findIndex((_, i) => i > b1 + 3 && tangent(i)[1] > -.6 && Math.abs(tangent(i)[0]) > .6);
  let b3 = line.findIndex((_, i) => i > b2 + 3 && line[i][0] > aortaX - .004);
  if (process.env.DPS_DEBUG) console.log('line', line.map((p, i) => i + ':' + p.map(x => (x * 1e3).toFixed(0)).join(',') + ' t' + tangent(i).map(x => x.toFixed(2)).join(',')).join('\n'), {b1, b2, b3});
  if (b1 < 0 || b2 < 0) throw new Error(`duodenum: bends not found (${b1}, ${b2})`);
  if (b3 < 0) b3 = line.length - 3;
  const arcOf = p => { let best = Infinity, at = 0; for (let i = 0; i + 1 < line.length; i++) { const a = line[i], ab = sub(line[i + 1], a), l2 = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2, t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1] + (p[2] - a[2]) * ab[2]) / l2)) : 0, d = D(p, add(a, mul(ab, t))); if (d < best) { best = d; at = arc[i] + t * (arc[i + 1] - arc[i]); } } return at; };
  const duoZone = new Uint8Array(duo.n);
  for (let v = 0; v < duo.n; v++) { const u = arcOf(P(duo, v)); duoZone[v] = u < arc[b1] ? 1 : u < arc[b2] ? 2 : u < arc[b3] ? 3 : 4; }
  // ducts: the bile duct and the main pancreatic duct end at the posteromedial wall of the descending part; that point is the major papilla
  const bileV = V('Bile duct'), ductV = V('Main pancreatic duct'), duoV = Array.from({length: duo.n}, (_, v) => P(duo, v));
  const bileEnd = bileV.reduce((b, p) => D(p, nearest(duoV, p)) < D(b, nearest(duoV, b)) ? p : b), ductEnd = ductV.reduce((b, p) => D(p, nearest(duoV, p)) < D(b, nearest(duoV, b)) ? p : b);
  const majorV = nearestV(duo, lerp(bileEnd, ductEnd, .5)), major = P(duo, majorV), duoN = vertexNormals(duo.positions, duo.indices), nrm = (m, N, v) => [N[v * 3], N[v * 3 + 1], N[v * 3 + 2]];
  // minor papilla: about 2 cm above the major one, a little in front, on the wall of the descending part that faces the pancreas
  let minorV = majorV, mb = Infinity; const aim = add(major, [.003, .019, .006]);
  for (let v = 0; v < duo.n; v++) if (duoZone[v] === 2 && nrm(duo, duoN, v)[0] > .2) { const d = D(P(duo, v), aim); if (d < mb) { mb = d; minorV = v; } }
  const minor = P(duo, minorV), dj = P(duo, djV);
  const duoLine = new Uint8Array(duo.n);
  for (let v = 0; v < duo.n; v++) { const p = P(duo, v); if (D(p, major) <= .0042) duoLine[v] = 1; else if (D(p, minor) <= .003) duoLine[v] = 2; }

  // ---- pancreas: the superior mesenteric and portal veins as the landmark
  const smv = [...V('Superior mesenteric vein'), ...V('Hepatic portal vein')];
  const veinAt = y => { let ring = smv.filter(p => Math.abs(p[1] - y) < .003); if (!ring.length) ring = [smv.reduce((b, p) => Math.abs(p[1] - y) < Math.abs(b[1] - y) ? p : b)]; return centroid(ring); };
  const panXmax = Math.max(...Array.from({length: pan.n}, (_, v) => pan.positions[v * 3])), TAIL = .025, NECK = .009;
  const panZone = new Uint8Array(pan.n);
  // the uncinate process is the part of the head below the lowest level at which the gland still lies in front of the vein (the lower border of the neck), hooking behind the vein
  let yNeck = Infinity;
  for (let v = 0; v < pan.n; v++) { const p = P(pan, v), c = veinAt(p[1]); if (Math.abs(p[0] - c[0]) <= NECK && p[2] > c[2] + .004) yNeck = Math.min(yNeck, p[1]); }
  for (let v = 0; v < pan.n; v++) {
    const p = P(pan, v), c = veinAt(p[1]), dx = p[0] - c[0];
    if (p[0] > panXmax - TAIL) panZone[v] = 5;
    else if (dx > NECK) panZone[v] = 4;
    else if (p[1] < yNeck && dx >= -NECK - .006) panZone[v] = 2;
    else if (dx >= -NECK) panZone[v] = 3;
    else panZone[v] = 1;
  }
  smoothLabels(pan.adj, panZone, 4);

  // ---- spleen: hilum where the splenic vessels end; visceral surfaces by the organ they face
  const splV = Array.from({length: spl.n}, (_, v) => P(spl, v)), splN = vertexNormals(spl.positions, spl.indices);
  const hilumPts = [...V('Splenic artery'), ...V('Splenic vein')].filter(p => D(p, nearest(splV, p)) < .006), hilum = centroid(hilumPts);
  const faces = [['Stomach', 2], ['Left kidney', 3], ['Transverse colon', 4]].map(([k, z]) => [V(k), z]);
  const splZone = new Uint8Array(spl.n).fill(1), splLine = new Uint8Array(spl.n);
  for (let v = 0; v < spl.n; v++) {
    const p = splV[v], n = nrm(spl, splN, v); let best = [.03, 1];
    for (const [pts, z] of faces) { const q = nearest(pts, p), d = D(p, q); if (d < best[0] && n[0] * (q[0] - p[0]) + n[1] * (q[1] - p[1]) + n[2] * (q[2] - p[2]) > .2 * d) best = [d, z]; }
    splZone[v] = best[1];
    if (D(p, hilum) <= .009) splLine[v] = 1;
  }
  smoothLabels(spl.adj, splZone, 4);

  // ---- write the organs with their triangle labels
  const labels = (m, zone, lineL) => {
    const nt = m.indices.length / 3, tz = new Uint8Array(nt), tl = new Uint8Array(nt);
    for (let t = 0; t < nt; t++) {
      const c = [0, 1, 2].map(k => m.indices[t * 3 + k]), zs = c.map(v => zone[v]);
      tz[t] = zs[0] === zs[1] || zs[0] === zs[2] ? zs[0] : zs[1] === zs[2] ? zs[1] : zs[0];
      if (lineL) { const ls = c.map(v => lineL[v]); for (const l of [1, 2, 3]) if (ls.filter(x => x === l).length >= 2) { tl[t] = l; break; } }
    }
    return {tz, tl};
  };
  const count = (a, k) => a.filter(x => x === k).length;
  const stats = {};
  for (const [key, m, zone, lineL] of [['Duodenum', duo, duoZone, duoLine], ['Pancreas', pan, panZone, null], ['Spleen', spl, splZone, splLine]]) {
    let {tz, tl} = labels(m, zone, lineL), out = {positions: m.positions, indices: m.indices};
    // duodenojejunal flexure: the stretch of the gut where it turns forward into the jejunum, between two planes across the gut 6 mm either side of the bend
    if (key === 'Duodenum') {
      const tg = unit(sub(line.at(-1), line.at(-5))), c = sub(line.at(-1), mul(tg, .004)), slab = p => D(p, c) > .02 ? -1 : .006 - Math.abs((p[0] - c[0]) * tg[0] + (p[1] - c[1]) * tg[1] + (p[2] - c[2]) * tg[2]);
      const sp = splitByField({positions: m.positions, indices: m.indices, zone: tz, line: tl}, slab);
      for (let t = 0; t < sp.indices.length / 3; t++) if (slab(triCentre(sp, t)) > 0 && !sp.line[t]) sp.line[t] = 3;
      out = sp; tz = sp.zone; tl = sp.line;
    }
    const part = writer.addMesh(key, out.positions, out.indices, {});
    part.triZone = writer.addBytes(tz); if (lineL) part.triLine = writer.addBytes(tl);
    stats[key] = {vertices: m.n, zones: [1, 2, 3, 4, 5].map(z => count([...tz], z)), lines: lineL ? [1, 2, 3].map(z => count([...tl], z)) : null};
  }

  // ---- built parts (schematic)
  const R_DUCT = .0011, R_ART = .0008, R_NERVE = .0007;
  const duoNormalAt = p => nrm(duo, duoN, nearestV(duo, p));
  // hepatopancreatic ampulla: the two ducts meet just outside the wall and the common channel runs through the wall to the papilla
  const join = add(lerp(bileEnd, ductEnd, .5), mul(duoNormalAt(major), .003));
  meshes.set('Hepatopancreatic ampulla', merge([tubeThrough([bileEnd, lerp(bileEnd, join, .6), join], R_DUCT, R_DUCT * 1.25, 6, 10), tubeThrough([ductEnd, lerp(ductEnd, join, .6), join], R_DUCT * .9, R_DUCT * 1.25, 6, 10),
    tubeThrough([join, lerp(join, major, .5), sub(major, mul(duoNormalAt(major), .0008))], R_DUCT * 1.4, R_DUCT, 6, 12)]));
  // accessory pancreatic duct: from the main duct in the head (about 15 mm from its end) to the minor papilla
  const accFrom = ductV.filter(p => D(p, ductEnd) > .012 && D(p, ductEnd) < .018).reduce((b, p) => p[1] > b[1] ? p : b), minorIn = sub(minor, mul(duoNormalAt(minor), .0006));
  meshes.set('Accessory pancreatic duct', tubeThrough([accFrom, add(lerp(accFrom, minorIn, .4), [0, .003, .001]), lerp(accFrom, minorIn, .8), minorIn], R_DUCT * .6, R_DUCT * .5, 8, 8));
  // supraduodenal artery: from the upper part of the gastroduodenal artery to the upper border of the superior part of the duodenum
  const gda = V('Gastroduodenal artery'), gdaTop = gda.reduce((b, p) => p[1] > b[1] ? p : b), sup = Array.from({length: duo.n}, (_, v) => v).filter(v => duoZone[v] === 1);
  const supTop = sup.reduce((b, v) => P(duo, v)[1] > P(duo, b)[1] ? v : b), supEnd = add(P(duo, supTop), mul(nrm(duo, duoN, supTop), .0006)), gdaFrom = nearest(gda, lerp(gdaTop, supEnd, .15));
  meshes.set('Supraduodenal artery', tubeThrough([gdaFrom, add(lerp(gdaFrom, supEnd, .5), [0, .002, .001]), supEnd], R_ART, R_ART * .6, 8, 8));
  // suspensory muscle (ligament) of the duodenum: a flat band from the right crus beside the root of the celiac trunk, down behind the pancreas and the splenic vein, to the duodenojejunal flexure
  const celiac = V('Celiac trunk'), root = celiac.reduce((b, p) => p[2] < b[2] ? p : b), aorta = V('Abdominal aorta');
  /** The point of the aortic wall at height y that faces direction dir (x, z), lifted `out` off the wall. */
  const aortaWall = (y, dir, out = .0018) => { const ring = aorta.filter(p => Math.abs(p[1] - y) < .006), c = centroid(ring), d = unit([dir[0], 0, dir[1]]);
    const q = ring.reduce((b, p) => (p[0] - c[0]) * d[0] + (p[2] - c[2]) * d[2] > (b[0] - c[0]) * d[0] + (b[2] - c[2]) * d[2] ? p : b); return add(q, mul(unit(sub([q[0], y, q[2]], [c[0], y, c[2]])), out)); };
  const djTop = (() => { let b = djV; for (let v = 0; v < duo.n; v++) if (D(P(duo, v), dj) < .012 && P(duo, v)[1] > P(duo, b)[1]) b = v; return add(P(duo, b), mul(nrm(duo, duoN, b), .0008)); })();
  // it starts on the front-left of the aorta just left of the root of the celiac trunk (where the right crus fibres reach round the aorta), and runs down on the left front of the aorta
  const tA = aortaWall(root[1] + .001, [1, .6]), tB = aortaWall(1.135, [1, .5]), tC = aortaWall(1.115, [1, .2]);
  meshes.set('Suspensory muscle of duodenum', band([tA, lerp(tA, tB, .5), tB, tC, lerp(tC, djTop, .5), djTop], .004, .0012));

  // ---- nerves: celiac plexus around the root of the celiac trunk and along its branches; superior mesenteric plexus along the first part of the superior mesenteric artery
  const centre = k => centroid(V(k)), gR = centre('Right celiac ganglion'), gL = centre('Left celiac ganglion'), smR = centre('Right superior mesenteric ganglion'), smL = centre('Left superior mesenteric ganglion');
  const cRoot = centroid(celiac.filter(p => D(p, root) < .006));
  const followArtery = (key, from, frac, lift = .0015) => {
    const vs = V(key); let s0 = vs[0]; for (const p of vs) if (D(p, from) < D(s0, from)) s0 = p;
    const d = vs.map(p => D(p, s0)), dmax = Math.max(...d), pts = [];
    for (let k = 0; k <= 10; k++) { const lo = dmax * frac * k / 10, ring = vs.filter((p, i) => Math.abs(d[i] - lo) < .0025); if (ring.length) pts.push(add(centroid(ring), [0, lift, 0])); }
    return pts;
  };
  const celiacStrands = [
    tubeThrough([gR, [gR[0] + .004, cRoot[1] + .001, cRoot[2] + .0085], add(cRoot, [0, .0005, .0095]), [gL[0] - .004, cRoot[1] + .001, cRoot[2] + .0085], gL], R_NERVE, R_NERVE, 8, 8),
    tubeThrough([gR, [gR[0] + .004, cRoot[1] - .007, cRoot[2] + .003], add(cRoot, [0, -.008, .0025]), [gL[0] - .004, cRoot[1] - .007, cRoot[2] + .003], gL], R_NERVE * .9, R_NERVE * .9, 8, 8),
  ];
  for (const [key, g] of [['Common hepatic artery', gR], ['Splenic artery', gL]]) celiacStrands.push(tubeThrough([g, ...followArtery(key, cRoot, .5)], R_NERVE * .75, R_NERVE * .6, 6, 8));
  meshes.set('Celiac plexus', merge(celiacStrands));
  const sma = V('Superior mesenteric artery'), smaTop = sma.reduce((b, p) => p[1] > b[1] ? p : b);
  // centre line of the first 35 mm of the artery: rings of equal distance from its top, averaged and smoothed
  const smaLine = smoothPolyline([0, .005, .01, .015, .02, .025, .03, .035].map(d0 => centroid(sma.filter(p => Math.abs(D(p, smaTop) - d0) < .002 && p[1] <= smaTop[1]) .concat(d0 === 0 ? [smaTop] : []))), 2, 3);
  const smStrands = [];
  for (const [g, side] of [[smR, -1], [smL, 1]]) {
    const along = smaLine.map((p, k) => { const t = unit(sub(smaLine[Math.min(smaLine.length - 1, k + 1)], smaLine[Math.max(0, k - 1)])), sidev = unit(cross(t, [0, 0, 1])); return add(p, mul(sidev, side * .0032)); });
    smStrands.push(tubeThrough([g, ...along.slice(1)], R_NERVE * .8, R_NERVE * .55, 6, 8));
  }
  smStrands.push(tubeThrough([gR, lerp(gR, smR, .5), smR], R_NERVE * .7, R_NERVE * .7, 6, 8), tubeThrough([gL, lerp(gL, smL, .5), smL], R_NERVE * .7, R_NERVE * .7, 6, 8));
  meshes.set('Superior mesenteric plexus', merge(smStrands));

  // ---- every vessel and nerve piece must end on something
  const walls = new Map([['Duodenum', duo], ['Pancreas', pan], ['Spleen', spl]]);
  const report = tidy(meshes, {walls, organs: CONTEXT, drain: {'Splenic artery': 'Spleen', 'Splenic vein': 'Spleen', 'Celiac trunk': 'Abdominal aorta', 'Superior mesenteric artery': 'Abdominal aorta'},
    origin: {'Right gastro-omental artery': 'Gastroduodenal artery', 'Right gastro-omental vein': 'Superior mesenteric vein'},
    cutEnd: p => p[1] > 1.175 || p[1] < 1.08, skip: k => /ganglion/i.test(k) || /aorta|vena cava/i.test(k)});
  for (const [key, m] of meshes) writer.addMesh(key, m.positions, m.indices);
  return {stats: {...stats, duodenumLineMm: +(arc.at(-1) * 1e3).toFixed(0), bendsMm: [b1, b2, b3].map(i => +(arc[i] * 1e3).toFixed(0)), meshes: meshes.size + 3, tidy: report.length},
    landmarks: {pylorus: P(duo, pyl), dj, major, minor, hilum, yNeck}};
}

/** Majority vote of each vertex and its neighbours, repeated: smooths the borders between surface labels. */
function smoothLabels(adj, lab, iters) {
  for (let it = 0; it < iters; it++) {
    const next = lab.slice();
    for (let v = 0; v < lab.length; v++) { const c = new Map([[lab[v], 1]]); for (const [u] of adj[v]) c.set(lab[u], (c.get(lab[u]) ?? 0) + 1); let best = lab[v], bn = 0; for (const [k, n] of c) if (n > bn) { bn = n; best = k; } next[v] = best; }
    lab.set(next);
  }
}

/** A flat band with thickness (ligament, tendon): an elliptical tube of width w and thickness t along a smooth curve through the points; its broad side faces forward. */
function band(points, w, t, per = 10, sides = 16) {
  const cr = (p0, p1, p2, p3, s) => [0, 1, 2].map(k => .5 * (2 * p1[k] + (-p0[k] + p2[k]) * s + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * s * s + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * s * s * s));
  const pts = []; const ext = [points[0], ...points, points.at(-1)];
  for (let i = 1; i < ext.length - 2; i++) for (let k = 0; k < per; k++) pts.push(cr(ext[i - 1], ext[i], ext[i + 1], ext[i + 2], k / per));
  pts.push(points.at(-1));
  const pos = [], idx = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const tg = unit(sub(pts[Math.min(n - 1, i + 1)], pts[Math.max(0, i - 1)])), wide = unit(cross(tg, [0, 0, 1])), thick = unit(cross(wide, tg));
    // taper the ends a little so the band meets its attachments without a square edge
    const f = Math.min(1, .55 + 3 * Math.min(i, n - 1 - i) / n);
    for (let s = 0; s < sides; s++) { const a = 2 * Math.PI * s / sides; pos.push(...add(pts[i], add(mul(wide, Math.cos(a) * w / 2 * f), mul(thick, Math.sin(a) * t / 2)))); }
  }
  for (let i = 0; i + 1 < n; i++) for (let s = 0; s < sides; s++) { const a = i * sides + s, b = i * sides + (s + 1) % sides, c = a + sides, d = b + sides; idx.push(a, c, b, b, c, d); }
  // end caps
  for (const [ring, flip] of [[0, true], [n - 1, false]]) { const c = pos.length / 3; pos.push(...pts[ring]); for (let s = 0; s < sides; s++) { const a = ring * sides + s, b = ring * sides + (s + 1) % sides; idx.push(...(flip ? [c, a, b] : [c, b, a])); } }
  return {positions: Float32Array.from(pos), indices: Uint32Array.from(idx)};
}
