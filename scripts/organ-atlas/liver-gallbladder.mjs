// Liver, gallbladder and biliary tract detail package. No external model: the BodyParts3D liver segments, gallbladder, bile ducts and hepatic vessels (public/models/atlas.json, CC BY 4.0,
// already in the repository). The liver is the atlas segments put together into one surface (each kept as it is, subdivided once), so its lobes and landmarks are surface labels:
//   Liver  zone 1 right lobe (segments IV upper part, V–VIII and the posterior piece the atlas calls IX), 2 left lobe (II, III), 3 quadrate lobe (the part of IV on the visceral
//          surface below the porta hepatis), 4 caudate lobe (I);
//          line 1 porta hepatis, 2 bare area, 3 coronary ligament (the border of the bare area), 4 right triangular ligament, 5 left triangular ligament,
//          6 attachment of the falciform ligament (the border between IV and II/III on the diaphragmatic surface).
//   Gallbladder zone 1 fundus, 2 body, 3 neck — along its long axis from the cystic duct.
// Built by us (schematic): round ligament of the liver and ligamentum venosum (cords in their fissures), cystic artery and cystic vein, hepatic plexus.
import {weld, loopSubdivide, graphOf, dijkstra, clipPlane, vertexNormals, smoothPolyline} from '../lib/organ-mesh.mjs';
import {add, sub, mul, lerp, len, unit, verticesOf, nearest, merge, tubeThrough, centreline} from '../lib/organ-supply.mjs';
import {tidy} from '../lib/organ-tidy.mjs';
import {smoothLabels, triangleLabels, band, onSurface, marchOnSurface} from '../lib/organ-parts.mjs';

export const id = 'liver-gallbladder';
const D = (a, b) => len(sub(a, b));
const centroid = pts => mul(pts.reduce((s, p) => add(s, p), [0, 0, 0]), 1 / pts.length);

/** Liver segment meshes of the atlas and their segment number (the atlas has two pieces for VIII and a posterior piece it names IX). */
const SEGMENTS = [['FJ2816', 1], ['FJ2818', 2], ['FJ2819', 3], ['FJ2820', 4], ['FJ2821', 5], ['FJ2822', 6], ['FJ2409', 7], ['FJ2823', 8], ['FJ2824', 8], ['FJ1858', 9]];
/** Atlas pieces merged into one structure: key -> ids (duplicate pieces of the atlas are left out). */
const MERGED = {
  'Right hepatic artery': ['FJ3117', 'FJ1924', 'FJ1916', 'FJ3075', 'FJ3076', 'FJ3114', 'FJ3115', 'FJ3116'],
  'Left hepatic artery': ['FJ3095', 'FJ1874', 'FJ3077', 'FJ3091', 'FJ3092', 'FJ3093', 'FJ3106', 'FJ3107'],
  'Right branch of portal vein': ['FJ3122', 'FJ2405', 'FJ3073', 'FJ3074', 'FJ3111', 'FJ3112', 'FJ3113', 'FJ1914'],
  'Left branch of portal vein': ['FJ3102', 'FJ2404', 'FJ3124', 'FJ3125', 'FJ3126', 'FJ3127', 'FJ3128'],
  'Right hepatic vein': ['FJ2416', 'FJ3118', 'FJ3119', 'FJ3120', 'FJ3121'],
  'Middle hepatic vein': ['FJ2414', 'FJ1867', 'FJ3083', 'FJ3084', 'FJ3085', 'FJ3086'],
  'Left hepatic vein': ['FJ2415', 'FJ3097', 'FJ3098', 'FJ3099', 'FJ3100', 'FJ3101'],
  'Intrahepatic bile ducts': ['FJ1883', 'FJ3071', 'FJ3072', 'FJ3088', 'FJ3089', 'FJ3090', 'FJ3094', 'FJ3103', 'FJ3104', 'FJ3105', 'FJ3108', 'FJ3109', 'FJ3110'],
};
/** Single atlas parts: [key, id, keep y >= lo, keep y <= hi]. */
const COPIED = [
  ['Abdominal aorta', 'FJ1932', 1.12, 1.205], ['Celiac trunk', 'FJ3421'], ['Common hepatic artery', 'FJ3078'], ['Hepatic artery proper', 'FJ3081'], ['Gastroduodenal artery', 'FJ3432'],
  ['Hepatic portal vein', 'FJ3082'], ['Right hepatic duct', 'FJ3123'], ['Left hepatic duct', 'FJ3096'], ['Cystic duct', 'FJ3080'],
  ['Stomach', 'FJ2564'], ['Duodenum', 'FJ2573', 1.12], ['Right kidney', 'FJ3147'], ['Diaphragm', 'FJ3131', 1.12],
];
const CONTEXT = ['Stomach', 'Duodenum', 'Right kidney', 'Diaphragm', 'Cystic duct', 'Common hepatic duct', 'Bile duct', 'Right hepatic duct', 'Left hepatic duct', 'Intrahepatic bile ducts'];

export function build({atlasPart, paokaoPart, writer}) {
  const meshes = new Map(), W = (m) => weld(m.positions, m.indices, 1e-6);
  for (const [key, sid, lo, hi] of COPIED) {
    let m = atlasPart(sid);
    if (lo !== undefined) m = clipPlane(m.positions, m.indices, [0, -1, 0], -lo);
    if (hi !== undefined) m = clipPlane(m.positions, m.indices, [0, 1, 0], hi);
    meshes.set(key, W(m));
  }
  for (const [key, ids] of Object.entries(MERGED)) meshes.set(key, W(merge(ids.map(atlasPart))));
  // the inferior vena cava behind the liver: the atlas has it in two pieces
  { const a = atlasPart('FJ3441'), b = clipPlane(...Object.values(atlasPart('FJ3659')), [0, -1, 0], -1.12); meshes.set('Inferior vena cava', W(merge([a, b]))); }
  // the atlas "common hepatic duct" runs on down to the duodenum: below the junction of the cystic duct it is the bile duct
  { const chd = atlasPart('FJ3079'), cyst = verticesOf(meshes.get('Cystic duct')); let joinY = 0, bj = Infinity;
    for (const p of verticesOf(W(chd))) { const d = D(p, nearest(cyst, p)); if (d < bj) { bj = d; joinY = p[1]; } }
    meshes.set('Common hepatic duct', W(clipPlane(chd.positions, chd.indices, [0, -1, 0], -joinY))); meshes.set('Bile duct', W(clipPlane(chd.positions, chd.indices, [0, 1, 0], joinY))); }
  for (const [key, sid] of [['Right celiac ganglion', 'Right celiac ganglion'], ['Left celiac ganglion', 'Left celiac ganglion']]) meshes.set(key, W(paokaoPart(sid)));
  const V = key => verticesOf(meshes.get(key));

  // ---- the liver: segments subdivided once and put together; each vertex keeps its segment
  const segMeshes = new Map(), pos = [], idx = [], seg = [];
  for (const [sid, n] of SEGMENTS) {
    const s = loopSubdivide(...Object.values(W(atlasPart(sid))), 1), base = pos.length / 3; segMeshes.set(sid, s);
    pos.push(...s.positions); for (const i of s.indices) idx.push(i + base); for (let v = 0; v < s.positions.length / 3; v++) seg.push(n);
  }
  const liver = {positions: Float32Array.from(pos), indices: Uint32Array.from(idx)}, nv = seg.length, adj = graphOf(liver.positions, liver.indices), LN = vertexNormals(liver.positions, liver.indices);
  const P = v => [liver.positions[v * 3], liver.positions[v * 3 + 1], liver.positions[v * 3 + 2]], N = v => [LN[v * 3], LN[v * 3 + 1], LN[v * 3 + 2]];
  const LV = Array.from({length: nv}, (_, v) => P(v)), LNs = Array.from({length: nv}, (_, v) => N(v));
  // porta hepatis: where the portal vein divides (the top of its trunk)
  const portal = V('Hepatic portal vein'), pTop = Math.max(...portal.map(p => p[1])), porta = centroid(portal.filter(p => p[1] > pTop - .004));
  const visceral = v => LNs[v][1] < -.25 || (LNs[v][2] < -.2 && LV[v][1] < porta[1] + .01);
  const zone = new Uint8Array(nv);
  for (let v = 0; v < nv; v++) {
    const s = seg[v];
    zone[v] = s === 2 || s === 3 ? 2 : s === 1 ? 4 : s === 4 && visceral(v) && LV[v][1] < porta[1] + .002 && LV[v][2] > porta[2] - .004 ? 3 : 1;
  }
  smoothLabels(adj, zone, 3);
  // near-boundary helper: vertices of segment set A that lie within r of a vertex of segment set B
  const segPts = set => LV.filter((_, v) => set.includes(seg[v]));
  const nearSet = (v, pts, r) => { const p = LV[v]; for (const q of pts) if (Math.abs(q[0] - p[0]) < r && Math.abs(q[1] - p[1]) < r && D(p, q) < r) return true; return false; };
  const line = new Uint8Array(nv);
  // bare area: the back of the right lobe and of segment IV around the inferior vena cava, above the porta, facing back and up against the diaphragm (no peritoneum there)
  const ivc = V('Inferior vena cava'), ivcAt = y => centroid(ivc.filter(p => Math.abs(p[1] - y) < .006).concat([nearest(ivc, [0, y, 0])]));
  const bare = new Uint8Array(nv);
  for (let v = 0; v < nv; v++) { const p = LV[v], n = LNs[v], c = ivcAt(p[1]); if (p[1] > porta[1] + .008 && n[2] < -.35 && n[1] > -.3 && p[2] < c[2] + .012 && p[0] > c[0] - .075 && p[0] < c[0] + .02 && seg[v] !== 2 && seg[v] !== 3) bare[v] = 1; }
  smoothLabels(adj, bare, 2);
  // the coronary ligament runs along the border of the bare area; its right end is the right triangular ligament
  const border = []; for (let v = 0; v < nv; v++) if (bare[v]) for (const [u] of adj[v]) if (!bare[u]) { border.push(v); break; }
  const fromBorder = dijkstra(adj, border), bareXs = LV.filter((_, v) => bare[v]).map(p => p[0]), bareMinX = Math.min(...bareXs);
  for (let v = 0; v < nv; v++) if (bare[v]) line[v] = fromBorder.dist[v] <= .0025 ? (LV[v][0] < bareMinX + .012 ? 4 : 3) : 2;
  // left triangular ligament: the back of the tip of the left lobe
  const leftTip = LV.filter((_, v) => seg[v] === 2).reduce((b, p) => p[0] > b[0] ? p : b);
  for (let v = 0; v < nv; v++) if (seg[v] === 2 && D(LV[v], leftTip) < .016 && LNs[v][2] < .1 && LNs[v][1] > -.2) line[v] = 5;
  // falciform ligament attachment: the border between segment IV and segments II/III on the diaphragmatic (front and upper) surface
  const s23 = segPts([2, 3]);
  for (let v = 0; v < nv; v++) if (seg[v] === 4 && !line[v] && (LNs[v][2] > .25 || LNs[v][1] > .35) && nearSet(v, s23, .0022)) line[v] = 6;
  // porta hepatis
  for (let v = 0; v < nv; v++) if (D(LV[v], porta) < .014 && visceral(v) && !line[v]) line[v] = 1;
  const {tz, tl} = triangleLabels(liver.indices, zone, line, 6), lp = writer.addMesh('Liver', liver.positions, liver.indices, {});
  lp.triZone = writer.addBytes(tz); lp.triLine = writer.addBytes(tl);
  const count = (a, k) => a.reduce((n, x) => n + (x === k), 0);

  // ---- cords in the fissures of the visceral surface: round ligament (between III and IV, from the inferior border to the left portal vein) and ligamentum venosum (between I and II)
  const fissure = (a, b, r = .0025, face = visceral) => { const pb = segPts(b), out = []; for (let v = 0; v < nv; v++) if (a.includes(seg[v]) && face(v) && nearSet(v, pb, r)) out.push(v); return out; };
  const cord = (vs, radius, lift) => {
    const pts = vs.map(v => LV[v]), c = centroid(pts), dir = unit(sub(pts.reduce((b, p) => D(p, c) > D(b, c) ? p : b), c)), proj = p => (p[0] - c[0]) * dir[0] + (p[1] - c[1]) * dir[1] + (p[2] - c[2]) * dir[2];
    const lo = Math.min(...pts.map(proj)), hi = Math.max(...pts.map(proj)), bins = 10, line = [];
    for (let k = 0; k < bins; k++) { const sel = vs.filter(v => { const t = (proj(LV[v]) - lo) / (hi - lo); return t >= k / bins && t <= (k + 1) / bins; }); if (sel.length) line.push(add(centroid(sel.map(v => LV[v])), mul(unit(centroid(sel.map(v => LNs[v]))), lift))); }
    return band(smoothPolyline(line, 2, 3), radius * 2, radius * 2, {sides: 12, taper: .7});
  };
  const roundV = fissure([3], [4]), venosumV = fissure([1], [2, 3], .003, v => LNs[v][2] < 0 || LNs[v][1] < 0);  // the fissure for the ligamentum venosum is on the back of the liver, between the caudate lobe and the left lobe
  if (process.env.LIVER_DEBUG) { const all = (a, b, r) => { const pb = segPts(b); return LV.filter((p, v) => a.includes(seg[v]) && nearSet(v, pb, r)); }; for (const [a, b] of [[[3], [4]], [[1], [2, 3]], [[1], [2]], [[1], [4]]]) { const pts = all(a, b, .003); console.log(a, b, pts.length, pts.length && centroid(pts).map(x => (x * 1e3).toFixed(0)).join(','), 'visceral', a.length && LV.filter((p, v) => a.includes(seg[v]) && nearSet(v, segPts(b), .003) && visceral(v)).length); } console.log('porta', porta.map(x => (x * 1e3).toFixed(0)).join(',')); }
  meshes.set('Round ligament of liver', cord(roundV, .0016, .0018));
  meshes.set('Ligamentum venosum', cord(venosumV, .0011, .0012));

  // ---- gallbladder: fundus, body and neck along its axis from the cystic duct
  const gb = loopSubdivide(...Object.values(W(atlasPart('FJ2817'))), 1), gbn = gb.positions.length / 3, GV = verticesOf(gb), GN0 = vertexNormals(gb.positions, gb.indices), GN = GV.map((_, i) => [GN0[i * 3], GN0[i * 3 + 1], GN0[i * 3 + 2]]);
  const cyst = V('Cystic duct'), neckPt = GV.reduce((b, p) => D(p, nearest(cyst, p)) < D(b, nearest(cyst, b)) ? p : b), fundusPt = GV.reduce((b, p) => D(p, neckPt) > D(b, neckPt) ? p : b);
  const axis = unit(sub(fundusPt, neckPt)), L = D(fundusPt, neckPt), gz = new Uint8Array(gbn);
  for (let v = 0; v < gbn; v++) { const t = ((GV[v][0] - neckPt[0]) * axis[0] + (GV[v][1] - neckPt[1]) * axis[1] + (GV[v][2] - neckPt[2]) * axis[2]) / L; gz[v] = t < .3 ? 3 : t > .72 ? 1 : 2; }
  smoothLabels(graphOf(gb.positions, gb.indices), gz, 3);
  { const {tz: gtz} = triangleLabels(gb.indices, gz, null), gp = writer.addMesh('Gallbladder', gb.positions, gb.indices, {}); gp.triZone = writer.addBytes(gtz); }

  // ---- cystic artery: from the right hepatic artery in the cystohepatic triangle to the neck, where it divides into a superficial branch (free, peritoneal surface) and a
  // deep branch (the surface against the liver); both run on the wall towards the fundus. Cystic vein: from the neck to the right branch of the portal vein.
  const rha = V('Right hepatic artery'), neckOut = onSurface(GV, GN, neckPt, .0008), a0 = nearest(rha, neckPt);
  const toFundus = axis, liverSide = n => { const q = nearest(LV, add(neckPt, mul(n, .01))); return D(q, neckPt) < .02; };
  const sup = marchOnSurface(GV, GN, neckOut, toFundus, 5, .005, .0007, n => n[1] < 0), deep = marchOnSurface(GV, GN, neckOut, toFundus, 5, .005, .0007, n => n[1] >= 0);
  meshes.set('Cystic artery', merge([tubeThrough([a0, add(lerp(a0, neckOut, .5), [0, -.002, .002]), neckOut], .0007, .0006, 8, 8), tubeThrough([neckOut, ...sup], .0006, .0003, 6, 8), tubeThrough([neckOut, ...deep], .0006, .0003, 6, 8)]));
  const rpv = V('Right branch of portal vein'), v0 = onSurface(GV, GN, lerp(neckPt, fundusPt, .15), .0008, n => n[1] >= 0), v1 = nearest(rpv, v0);
  meshes.set('Cystic vein', tubeThrough([v0, add(lerp(v0, v1, .5), [0, .002, -.001]), v1], .0006, .0007, 8, 8));

  // ---- hepatic plexus: strands along the common hepatic artery and the hepatic artery proper, from the right celiac ganglion
  const gR = centroid(V('Right celiac ganglion')), along = key => { const cl = centreline(V(key), 10); return D(cl[0], gR) < D(cl.at(-1), gR) ? cl : cl.reverse(); };
  const path = [...along('Common hepatic artery'), ...along('Hepatic artery proper')].map(p => add(p, [0, .0016, .0008]));
  meshes.set('Hepatic plexus', merge([tubeThrough([gR, ...path], .0006, .0005, 5, 8), tubeThrough([gR, ...path.map(p => add(p, [0, -.0032, 0]))], .0005, .0004, 5, 8)]));

  // ---- every vessel and nerve piece must end on something: the liver segments (closed surfaces) and the gallbladder are the walls
  const walls = new Map([...[...segMeshes].map(([sid, s]) => [sid, s]), ['Gallbladder', gb]]);
  const report = tidy(meshes, {walls, organs: CONTEXT, drain: {'Celiac trunk': 'Abdominal aorta'}, origin: {'Cystic artery': 'Right hepatic artery', 'Cystic vein': 'Right branch of portal vein'}, keepInside: true,
    cutEnd: p => p[1] < 1.145 || p[1] > 1.262, skip: k => /ganglion|aorta|vena cava/i.test(k)});
  for (const [key, m] of meshes) writer.addMesh(key, m.positions, m.indices);
  return {stats: {liverVertices: nv, lobes: [1, 2, 3, 4].map(z => count([...tz], z)), lines: [1, 2, 3, 4, 5, 6].map(l => count([...tl], l)), gallbladder: [1, 2, 3].map(z => count([...gz], z)),
    round: roundV.length, venosum: venosumV.length, meshes: meshes.size + 2, tidy: report.length}, landmarks: {porta, neckPt, fundusPt, leftTip}};
}
