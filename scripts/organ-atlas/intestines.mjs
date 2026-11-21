// Small and large intestine detail package. No external model: the BodyParts3D jejunum and ileum pieces, colon, rectum, appendix, taeniae coli, mesenteries and intestinal vessels
// (public/models/atlas.json, CC BY 4.0, already in the repository). The three colon pieces are put together into one surface so their parts can be marked on it:
//   Colon   zone 1 caecum (below the ileocaecal junction), 2 ascending colon, 3 transverse colon, 4 descending colon, 5 sigmoid colon (the descending piece of the atlas runs on
//           into the pelvis: the sigmoid colon starts where it turns medially);
//           line 1 haustra (the sacculations of the model, where the wall bulges out from the centre line), 2 right colic flexure, 3 left colic flexure (the stretch of gut at each bend;
//           6 and 7 where a haustrum lies in it), 4 ileocaecal valve (marked on the outer wall where the ileum enters). Haustra and the root of the mesentery show only when chosen.
//   Rectum  zone 1 rectum, 2 anal canal (the lowest 35 mm, within the anal sphincters); line 1 anus (the lower opening).
//   Mesentery line 1 root of the mesentery (the border along the back wall of the abdomen).
// Built by us (schematic): omental (epiploic) appendices along the taeniae, jejunal and ileal arteries from the superior mesenteric artery, the inferior mesenteric ganglion and the
// intermesenteric and inferior mesenteric plexuses.
import {weld, loopSubdivide, graphOf, dijkstra, clipPlane, vertexNormals, smoothPolyline} from '../lib/organ-mesh.mjs';
import {add, sub, mul, lerp, len, unit, cross, verticesOf, nearest, merge, tubeThrough} from '../lib/organ-supply.mjs';
import {tidy} from '../lib/organ-tidy.mjs';
import {smoothLabels, triangleLabels, band, splitByField, triCentre} from '../lib/organ-parts.mjs';

export const id = 'intestines';
const D = (a, b) => len(sub(a, b));
const centroid = pts => mul(pts.reduce((s, p) => add(s, p), [0, 0, 0]), 1 / pts.length);
const JEJUNUM = ['FJ2606', 'FJ2607', 'FJ2608', 'FJ2609', 'FJ2610', 'FJ2611', 'FJ2612', 'FJ2613', 'FJ2614', 'FJ2615', 'FJ2616', 'FJ2617', 'FJ2618', 'FJ2619', 'FJ2620', 'FJ2621', 'FJ2622', 'FJ2623', 'FJ2624', 'FJ2625', 'FJ2626', 'FJ2627', 'FJ2628'];
const ILEUM = ['FJ2574', 'FJ2575', 'FJ2576', 'FJ2577', 'FJ2578', 'FJ2579', 'FJ2580', 'FJ2581', 'FJ2582', 'FJ2583', 'FJ2584', 'FJ2585', 'FJ2586', 'FJ2587', 'FJ2588', 'FJ2589', 'FJ2590', 'FJ2591', 'FJ2592', 'FJ2593', 'FJ2594', 'FJ2595', 'FJ2596', 'FJ2597', 'FJ2598', 'FJ2600', 'FJ2601', 'FJ2602', 'FJ2603', 'FJ2604', 'FJ2605'];
const MERGED = {
  'Jejunum': JEJUNUM, 'Ileum': ILEUM, 'Taeniae coli': ['FJ2568', 'FJ2569', 'FJ2570'],
  'Ileocolic artery': ['FJ3439', 'FJ2034', 'FJ3414'], 'Left colic artery': ['FJ3494', 'FJ3399', 'FJ3428'], 'Left colic vein': ['FJ3400', 'FJ3429', 'FJ3495'], 'Ileocolic vein': ['FJ3415', 'FJ3440'],
  'External anal sphincter': ['FJ2543', 'FJ2548'], 'Puborectalis': ['FJ2546', 'FJ2551'],
};
/** [key, id, keep y >= lo, keep y <= hi] */
const COPIED = [
  ['Ileocecal junction', 'FJ2599'], ['Appendix', 'FJ2565'], ['Mesoappendix', 'FJ3397'], ['Transverse mesocolon', 'FJ3398'],
  ['Abdominal aorta', 'FJ1932', .95, 1.15], ['Superior mesenteric artery', 'FJ3644'], ['Middle colic artery', 'FJ3542'], ['Right colic artery', 'FJ3590'], ['Appendicular artery', 'FJ3410'],
  ['Anterior cecal artery', 'FJ3406'], ['Posterior cecal artery', 'FJ3553'], ['Marginal artery of colon', 'FJ3534'], ['Inferior mesenteric artery', 'FJ3442'], ['Sigmoid arteries', 'FJ3638'],
  ['Superior rectal artery', 'FJ3656'], ['Superior mesenteric vein', 'FJ3647', .95, 1.13], ['Inferior mesenteric vein', 'FJ3443', .9, 1.13], ['Middle colic vein', 'FJ3543'], ['Right colic vein', 'FJ3591'],
  ['Ileal veins', 'FJ3438'], ['Sigmoid veins', 'FJ3639'], ['Superior rectal vein', 'FJ3657'],
];

export function build({atlasPart, paokaoPart, writer}) {
  const meshes = new Map(), W = m => weld(m.positions, m.indices, 1e-6);
  for (const [key, sid, lo, hi] of COPIED) { let m = atlasPart(sid); if (lo !== undefined) m = clipPlane(m.positions, m.indices, [0, -1, 0], -lo); if (hi !== undefined) m = clipPlane(m.positions, m.indices, [0, 1, 0], hi); meshes.set(key, W(m)); }
  for (const [key, ids] of Object.entries(MERGED)) meshes.set(key, W(merge(ids.map(atlasPart))));
  for (const n of ['Right superior mesenteric ganglion', 'Left superior mesenteric ganglion']) meshes.set(n, W(paokaoPart(n)));
  const V = key => verticesOf(meshes.get(key));

  // ---- colon: ascending, transverse and descending pieces, each subdivided once, put together; each vertex keeps its piece
  const pieces = [['FJ2566', 'asc'], ['FJ2572', 'tra'], ['FJ2567', 'des']], pos = [], idx = [], piece = [], ranges = {};
  for (const [sid, name] of pieces) { const s = loopSubdivide(...Object.values(W(atlasPart(sid))), 1), base = pos.length / 3; pos.push(...s.positions); for (const i of s.indices) idx.push(i + base); ranges[name] = [base, base + s.positions.length / 3]; for (let v = 0; v < s.positions.length / 3; v++) piece.push(name); }
  const colon = {positions: Float32Array.from(pos), indices: Uint32Array.from(idx)}, cn = piece.length, adj = graphOf(colon.positions, colon.indices), CV = verticesOf(colon);
  // centre line of each piece: rings of equal distance over the surface from one end, averaged
  const lineOf = (name, start) => {
    const [a, b] = ranges[name], s0 = Array.from({length: b - a}, (_, k) => a + k).reduce((best, v) => start(CV[v]) > start(CV[best]) ? v : best, a), dist = dijkstra(adj, [s0]).dist, bins = new Map();
    for (let v = a; v < b; v++) { const k = Math.floor(dist[v] / .005); if (!bins.has(k)) bins.set(k, []); bins.get(k).push(CV[v]); }
    return smoothPolyline([...bins.keys()].sort((x, y) => x - y).map(k => centroid(bins.get(k))), 2, 3);
  };
  const lines = {asc: lineOf('asc', p => -p[1]), tra: lineOf('tra', p => -p[0]), des: lineOf('des', p => p[1])};
  const nearestOnLine = (line, p) => { let best = [Infinity, 0, null]; let acc = 0; for (let i = 0; i + 1 < line.length; i++) { const a = line[i], ab = sub(line[i + 1], a), l2 = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2, t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1] + (p[2] - a[2]) * ab[2]) / l2)) : 0, q = add(a, mul(ab, t)), d = D(p, q); if (d < best[0]) best = [d, acc + t * Math.sqrt(l2), q]; acc += Math.sqrt(l2); } return best; };
  // sigmoid colon: where the descending piece turns towards the midline in the pelvis
  const des = lines.des, desArc = [0]; for (let i = 1; i < des.length; i++) desArc.push(desArc[i - 1] + D(des[i], des[i - 1]));
  const tan = i => unit(sub(des[Math.min(des.length - 1, i + 2)], des[Math.max(0, i - 2)]));
  let sig = des.findIndex((p, i) => p[1] < 1.0 && tan(i)[0] < -.45); if (sig < 0) sig = des.length - 1;
  const ileoc = centroid(V('Ileocecal junction')), icOnColon = CV.reduce((b, p) => D(p, ileoc) < D(b, ileoc) ? p : b);
  const zone = new Uint8Array(cn), line = new Uint8Array(cn), radial = new Float64Array(cn), arcAt = new Float64Array(cn);
  for (let v = 0; v < cn; v++) {
    const name = piece[v], [r, arc] = nearestOnLine(lines[name], CV[v]); radial[v] = r; arcAt[v] = arc;
    zone[v] = name === 'tra' ? 3 : name === 'asc' ? (CV[v][1] < icOnColon[1] - .002 ? 1 : 2) : (arc >= desArc[sig] ? 5 : 4);
  }
  smoothLabels(adj, zone, 3);
  // haustra: the sacculations bulge out between the folds, so the wall at a haustrum lies further from the centre line than the wall at the same angle 12 mm before and
  // after it (comparing along the length only; the colon is not round in section, so comparing round the ring would mark its flatter sides instead)
  const angleAt = new Float64Array(cn);
  for (let v = 0; v < cn; v++) { const name = piece[v], L = lines[name], [, arc, q] = nearestOnLine(L, CV[v]); let i0 = 0, acc = 0; for (let i = 0; i + 1 < L.length; i++) { const l = D(L[i], L[i + 1]); if (acc + l >= arc) { i0 = i; break; } acc += l; i0 = i; }
    const t = unit(sub(L[Math.min(L.length - 1, i0 + 1)], L[i0])), u = unit(cross(t, Math.abs(t[2]) < .9 ? [0, 0, 1] : [1, 0, 0])), w = cross(t, u), d = sub(CV[v], q); angleAt[v] = Math.atan2(d[0] * w[0] + d[1] * w[1] + d[2] * w[2], d[0] * u[0] + d[1] * u[1] + d[2] * u[2]); }
  const SECT = 12, STEP = .003;
  for (const name of ['asc', 'tra', 'des']) {
    const [a, b] = ranges[name], cell = new Map(), key = (k, s) => k * 100 + s;
    for (let v = a; v < b; v++) { const k = Math.floor(arcAt[v] / STEP), sct = Math.floor((angleAt[v] + Math.PI) / (2 * Math.PI) * SECT) % SECT, c = cell.get(key(k, sct)) ?? [0, 0]; c[0] += radial[v]; c[1]++; cell.set(key(k, sct), c); }
    for (let v = a; v < b; v++) {
      if (zone[v] === 1) continue;
      const k = Math.floor(arcAt[v] / STEP), sct = Math.floor((angleAt[v] + Math.PI) / (2 * Math.PI) * SECT) % SECT; let sum = 0, n = 0;
      for (let dk = -4; dk <= 4; dk++) { const c = cell.get(key(k + dk, sct)); if (c) { sum += c[0]; n += c[1]; } }
      if (n && radial[v] > sum / n + .0005) line[v] = 1;
    }
  }
  smoothLabels(adj, line, 3);
  // flexures: where the pieces meet; ileocaecal valve: where the ileum enters
  const contact = (a, b) => { let best = [Infinity]; for (let v = ranges[a][0]; v < ranges[a][1]; v += 3) for (let u = ranges[b][0]; u < ranges[b][1]; u += 3) { const d = D(CV[v], CV[u]); if (d < best[0]) best = [d, lerp(CV[v], CV[u], .5)]; } return best[1]; };
  const rightFlex = contact('asc', 'tra'), leftFlex = contact('des', 'tra');
  for (let v = 0; v < cn; v++) if (D(CV[v], icOnColon) < .008) line[v] = 4;
  const count = (a, k) => a.reduce((n, x) => n + (x === k), 0);
  // colic flexures: the stretch of colon at each bend, between two planes across the gut 15 mm either side of the bend (planes square to the bisector of the two directions there)
  let cm = {positions: colon.positions, indices: colon.indices, ...(({tz, tl}) => ({zone: tz, line: tl}))(triangleLabels(colon.indices, zone, line, 4))};
  const endDir = (L, atEnd) => atEnd ? unit(sub(L.at(-1), L.at(-4))) : unit(sub(L[0], L[3]));
  const bends = [[rightFlex, unit(add(endDir(lines.asc, true), endDir(lines.tra, false))), 2], [leftFlex, unit(add(endDir(lines.tra, true), endDir(lines.des, false))), 3]];
  const slab = (c, n) => p => D(p, c) > .04 ? -1 : .015 - Math.abs((p[0] - c[0]) * n[0] + (p[1] - c[1]) * n[1] + (p[2] - c[2]) * n[2]);
  for (const [c, n] of bends) cm = splitByField(cm, slab(c, n));
  for (let t = 0; t < cm.indices.length / 3; t++) { const q = triCentre(cm, t); for (const [c, n, lab] of bends) if (slab(c, n)(q) > 0 && cm.line[t] !== 4) cm.line[t] = cm.line[t] === 1 ? lab + 4 : lab; }
  const tz = cm.zone, tl = cm.line, cp = writer.addMesh('Colon', cm.positions, cm.indices, {}); cp.triZone = writer.addBytes(tz); cp.triLine = writer.addBytes(tl);

  // ---- rectum and anal canal
  const rec = loopSubdivide(...Object.values(W(atlasPart('FJ2571'))), 1), RV = verticesOf(rec), rn = RV.length, rMinY = Math.min(...RV.map(p => p[1]));
  const rz = new Uint8Array(rn), rl = new Uint8Array(rn);
  for (let v = 0; v < rn; v++) { rz[v] = RV[v][1] < rMinY + .035 ? 2 : 1; if (RV[v][1] < rMinY + .004) rl[v] = 1; }
  { const {tz: a, tl: b} = triangleLabels(rec.indices, rz, rl, 1), rp = writer.addMesh('Rectum', rec.positions, rec.indices, {}); rp.triZone = writer.addBytes(a); rp.triLine = writer.addBytes(b); }

  // ---- mesentery of the small intestine with the line of its root
  const mes = W(atlasPart('FJ3396')), MV = verticesOf(mes), djEnd = centroid(V('Jejunum').filter(p => p[1] > 1.095)), rootLine = [djEnd, ileoc];
  const ml = new Uint8Array(MV.length), minZ = Math.min(...MV.map(p => p[2]));
  for (let v = 0; v < MV.length; v++) { const p = MV[v], ab = sub(rootLine[1], rootLine[0]), t = Math.max(0, Math.min(1, ((p[0] - rootLine[0][0]) * ab[0] + (p[1] - rootLine[0][1]) * ab[1] + (p[2] - rootLine[0][2]) * ab[2]) / (ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2))), q = add(rootLine[0], mul(ab, t)); if (Math.hypot(p[0] - q[0], p[1] - q[1]) < .008 && p[2] < minZ + .012) ml[v] = 1; }
  { const {tl: b} = triangleLabels(mes.indices, new Uint8Array(MV.length), ml, 1), mp = writer.addMesh('Mesentery', mes.positions, mes.indices, {}); mp.triLine = writer.addBytes(b); }

  // ---- omental appendices: small fatty tags along the free and omental taeniae of the transverse, descending and sigmoid colon, every 22 mm (schematic)
  const taeniae = V('Taeniae coli'), tags = [];
  for (const name of ['tra', 'des']) {
    const lineP = lines[name], tv = taeniae.filter(p => nearestOnLine(lineP, p)[0] < .03), byArc = new Map();
    for (const p of tv) { const [, arc, q] = nearestOnLine(lineP, p), k = Math.floor(arc / .022); const out = unit(sub(p, q)); if (out[2] < -.3) continue; if (!byArc.has(k) || D(p, q) > D(byArc.get(k)[0], byArc.get(k)[1])) byArc.set(k, [p, q]); }
    for (const [p, q] of byArc.values()) { const out = unit(sub(p, q)), base = add(p, mul(out, -.0006)); tags.push(band([base, add(base, mul(out, .004)), add(add(base, mul(out, .008)), [0, -.002, 0])], .005, .004, {sides: 12, taper: .45, face: unit(cross(out, [0, 1, 0]))})); }
  }
  meshes.set('Omental appendices', merge(tags));

  // ---- jejunal and ileal arteries: from the left side of the superior mesenteric artery to the loops, in the mesentery (schematic); the atlas has one ileal artery, kept
  const sma = V('Superior mesenteric artery'), smaAt = y => sma.reduce((b, p) => Math.abs(p[1] - y) < Math.abs(b[1] - y) ? p : b);
  const loops = (ids, n) => { const cs = ids.map(i => centroid(verticesOf(W(atlasPart(i))))); const step = Math.max(1, Math.floor(cs.length / n)); return cs.filter((_, k) => k % step === 0).slice(0, n); };
  const branches = (targets, wall) => targets.map(c => { const s0 = smaAt(Math.max(Math.min(c[1], Math.max(...sma.map(p => p[1])) - .01), Math.min(...sma.map(p => p[1])) + .01)), wv = verticesOf(meshes.get(wall)), end = wv.reduce((b, p) => D(p, s0) < D(b, s0) ? p : b); return tubeThrough([s0, add(lerp(s0, end, .5), [0, 0, .006]), end], .0009, .0006, 8, 8); });
  meshes.set('Jejunal arteries', merge(branches(loops(JEJUNUM, 6), 'Jejunum')));
  meshes.set('Ileal arteries', merge([...branches(loops(ILEUM, 6), 'Ileum'), W(atlasPart('FJ3437'))]));

  // ---- nerves: superior mesenteric plexus along the start of the artery; intermesenteric plexus on the front of the aorta down to the inferior mesenteric artery, where the
  // inferior mesenteric ganglion lies; inferior mesenteric plexus along the start of that artery (all schematic)
  const aorta = V('Abdominal aorta'), ima = V('Inferior mesenteric artery'), imaTop = ima.reduce((b, p) => D(p, centroid(aorta.filter(q => Math.abs(q[1] - p[1]) < .005))) < D(b, centroid(aorta.filter(q => Math.abs(q[1] - b[1]) < .005))) ? p : b);
  const aortaFront = y => { const ring = aorta.filter(p => Math.abs(p[1] - y) < .006), c = centroid(ring); return ring.reduce((b, p) => p[2] > b[2] ? p : b, c); };
  const smR = centroid(V('Right superior mesenteric ganglion')), smL = centroid(V('Left superior mesenteric ganglion'));
  const imgC = add(aortaFront(imaTop[1] + .004), [.004, 0, .002]);
  meshes.set('Inferior mesenteric ganglion', band([add(imgC, [0, .003, 0]), imgC, add(imgC, [0, -.003, 0])], .004, .003, {sides: 12, taper: .6}));
  const inter = [smR, smL].map((g, k) => { const pts = [g]; for (let y = g[1] - .01; y > imaTop[1] + .004; y -= .01) pts.push(add(aortaFront(y), [(k ? 1 : -1) * .004, 0, .0012])); pts.push(imgC); return tubeThrough(pts, .0006, .0005, 6, 8); });
  meshes.set('Intermesenteric plexus', merge(inter));
  const imaLine = [...ima].sort((a, b) => D(a, imaTop) - D(b, imaTop)).filter((_, k) => k % 6 === 0).slice(0, 12);
  meshes.set('Inferior mesenteric plexus', tubeThrough([imgC, ...smoothPolyline(imaLine, 2, 2).map(p => add(p, [0, .0015, .0008]))], .0006, .0004, 4, 8));
  const smaTop = sma.reduce((b, p) => p[1] > b[1] ? p : b), smaDown = [...sma].filter(p => p[1] < smaTop[1] && p[1] > smaTop[1] - .04).sort((a, b) => b[1] - a[1]).filter((_, k) => k % 8 === 0);
  meshes.set('Superior mesenteric plexus', merge([-1, 1].map((s, k) => tubeThrough([k ? smL : smR, ...smoothPolyline(smaDown, 2, 2).map(p => add(p, [s * .003, 0, .0012]))], .0006, .0004, 4, 8))));

  // ---- every vessel and nerve piece must end on something
  const walls = new Map([['Colon', colon], ['Rectum', rec], ['Jejunum', meshes.get('Jejunum')], ['Ileum', meshes.get('Ileum')], ['Appendix', meshes.get('Appendix')], ['Ileocecal junction', meshes.get('Ileocecal junction')]]);
  const report = tidy(meshes, {walls, organs: ['Mesentery', 'Mesoappendix', 'Transverse mesocolon', 'Taeniae coli', 'External anal sphincter', 'Puborectalis'], keepInside: true,
    origin: {'Superior mesenteric artery': 'Abdominal aorta', 'Inferior mesenteric artery': 'Abdominal aorta'}, cutEnd: p => p[1] > 1.125 || p[1] < .84, skip: k => /ganglion|aorta|appendices/i.test(k)});
  for (const [key, m] of meshes) writer.addMesh(key, m.positions, m.indices);
  return {stats: {colonVertices: cn, zones: [1, 2, 3, 4, 5].map(z => count([...tz], z)), lines: [1, 2, 3, 4, 6, 7].map(l => count([...tl], l)), sigmoidFromMm: +(desArc[sig] * 1e3).toFixed(0), appendices: tags.length, tidy: report.length},
    landmarks: {rightFlex, leftFlex, icOnColon, imaTop}};
}
