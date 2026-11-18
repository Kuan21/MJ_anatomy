// Stomach detail package. No external model: the BodyParts3D stomach (public/models/atlas.json, CC BY 4.0, already in the repository) is subdivided for a smooth surface and
// its regions are marked on that surface (triangle labels, no new meshes). The abdominal oesophagus and the first part of the duodenum come from the same atlas as context.
//   zone channel : 1 cardia, 2 fundus, 3 body, 4 pyloric antrum, 5 pyloric canal      (a partition of the stomach surface)
//   line channel : 1 lesser curvature, 2 greater curvature, 3 angular incisure, 4 pyloric sphincter band, 5 cardial notch (strips and patches laid over the zones)
import {weld, loopSubdivide, graphOf, dijkstra, compact, clipPlane, distToPolyline, smoothPolyline, vertexNormals} from '../lib/organ-mesh.mjs';
import {buildSupply} from './stomach-supply.mjs';

export const id = 'stomach';
const D = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

export function build({atlasPart, nervePart, paokaoPart, writer}) {
  const raw = atlasPart('FJ2564'), w = weld(raw.positions, raw.indices, 1e-6), eso = weld(...Object.values(atlasPart('FJ2563')), 1e-6), duo = weld(...Object.values(atlasPart('FJ2573')), 1e-6);
  const pt = (m, v) => [m.positions[v * 3], m.positions[v * 3 + 1], m.positions[v * 3 + 2]];
  const nearest = (m, p) => { let b = -1, bd = Infinity; for (let v = 0; v < m.positions.length / 3; v++) { const d = D(pt(m, v), p); if (d < bd) { bd = d; b = v; } } return b; };
  // landmarks on the unsubdivided mesh: where the oesophagus and the duodenum touch the stomach
  const nv = w.positions.length / 3;
  let bestE = [Infinity], bestD = [Infinity];
  for (let i = 0; i < nv; i++) { const p = pt(w, i); for (let j = 0; j < eso.positions.length / 3; j++) { const d = D(p, pt(eso, j)); if (d < bestE[0]) bestE = [d, p, pt(eso, j)]; } for (let j = 0; j < duo.positions.length / 3; j++) { const d = D(p, pt(duo, j)); if (d < bestD[0]) bestD = [d, p, pt(duo, j)]; } }
  const cardiaPt = bestE[1], pylorusPt = bestD[1];
  const s = loopSubdivide(w.positions, w.indices, 3), adj = graphOf(s.positions, s.indices), n = s.positions.length / 3;
  const c0 = nearest(s, cardiaPt), p0 = nearest(s, pylorusPt);
  // lesser curvature: the shortest way over the surface from cardia to pylorus
  const fromC = dijkstra(adj, [c0]), lesser = []; for (let v = p0; v >= 0; v = fromC.prev[v]) lesser.push(v); lesser.reverse();
  const arc = [0]; for (let i = 1; i < lesser.length; i++) arc.push(arc[i - 1] + D(pt(s, lesser[i - 1]), pt(s, lesser[i])));
  const lesserLen = arc.at(-1);
  const dl = dijkstra(adj, lesser), dMax = Math.max(...dl.dist);
  const pos = v => pt(s, v);
  // greater curvature: the ridge of vertices farthest from the lesser curvature, found as the cheapest path that stays on it, from the pylorus to the top of the fundus
  let apex = 0; for (let v = 1; v < n; v++) if (s.positions[v * 3 + 1] > s.positions[apex * 3 + 1]) apex = v;
  // the greater curvature ends at the cardial notch: the vertex of the cardia ring that lies farthest from the lesser curvature
  { let far = c0, fd = -1; for (let v = 0; v < n; v++) if (D(pos(v), pos(c0)) < .015 && D(pos(v), pos(c0)) > .011 && dl.dist[v] > fd) { fd = dl.dist[v]; far = v; } apex = far; }
  const ridge = dijkstra(adj, [p0], (a, b, len) => len * (.02 + Math.pow(1 - (dl.dist[a] + dl.dist[b]) / 2 / dMax, 2)));
  const greater = []; for (let v = apex; v >= 0; v = ridge.prev[v]) greater.push(v);
  // angular incisure: the sharpest bend of the lesser curvature in its lower part
  const at = f => { let i = lesser.findIndex((_, k) => arc[k] >= f * lesserLen); return i < 0 ? lesser.length - 1 : i; };
  let incisure = at(.6), bestTurn = -1; const win = .09 * lesserLen;
  for (let i = at(.45); i < at(.92); i++) { const a = lesser.findIndex((_, k) => arc[k] >= arc[i] - win), b = lesser.findIndex((_, k) => arc[k] >= arc[i] + win);
    if (a < 0 || b < 0) continue; const u = pos(lesser[i]).map((x, k) => x - pos(lesser[a])[k]), v = pos(lesser[b]).map((x, k) => x - pos(lesser[i])[k]);
    const cos = (u[0] * v[0] + u[1] * v[1] + u[2] * v[2]) / (Math.hypot(...u) * Math.hypot(...v) || 1), turn = Math.acos(Math.max(-1, Math.min(1, cos))); if (turn > bestTurn) { bestTurn = turn; incisure = i; } }
  const aiV = lesser[incisure], ai = pos(aiV);
  // zones: smooth boundaries (planes and spheres, not mesh-edge distances)
  const cardiaP = pos(c0), pylorusP = pos(p0), cardiaR = .015, canalLen = .026, sphincterLen = .009;
  const near = []; for (let v = 0; v < n; v++) if (D(pos(v), pylorusP) < .03) near.push(v);
  const cen = [0, 1, 2].map(k => near.reduce((t, v) => t + pos(v)[k], 0) / near.length), ax = pylorusP.map((x, k) => x - cen[k]), axl = Math.hypot(...ax), canalAxis = ax.map(x => x / axl);
  const toBody = pylorusP.map((x, k) => x - ai[k]), bl = Math.hypot(...toBody), nrm = toBody.map(x => x / bl);
  const dot = (p, q, o) => (p[0] - o[0]) * q[0] + (p[1] - o[1]) * q[1] + (p[2] - o[2]) * q[2];
  const zoneOf = new Uint8Array(n);
  for (let v = 0; v < n; v++) {
    const p = pos(v);
    if (D(p, cardiaP) < cardiaR) zoneOf[v] = 1;
    else if (p[1] > cardiaP[1] - .002) zoneOf[v] = 2;
    else if (dot(p, nrm, ai) > 0) zoneOf[v] = dot(pylorusP, canalAxis, p) <= canalLen ? 5 : 4;
    else zoneOf[v] = 3;
  }
  const lineOf = new Uint8Array(n);
  const stripLine = (path, r, label) => { const poly = smoothPolyline(path.map(pos), 4, 3); for (let v = 0; v < n; v++) if (distToPolyline(pos(v), poly) <= r) lineOf[v] = label; };
  // the two curvatures are their own thin bands (below), not triangle labels: a band cut along a smooth line of equal distance has a smooth edge, a run of whole triangles does not
  for (let v = 0; v < n; v++) { const p = pos(v); if (D(p, ai) <= .0065) lineOf[v] = 3; const along = dot(pylorusP, canalAxis, p); if (zoneOf[v] >= 4 && along >= 0 && along <= sphincterLen) lineOf[v] = 4; }
  // cardial notch: the angle between the oesophagus and the fundus, on the side of the cardia that faces away from the lesser curvature
  const notchV = (() => { let far = c0, fd = -1; for (let v = 0; v < n; v++) if (zoneOf[v] === 1 && dl.dist[v] > fd) { fd = dl.dist[v]; far = v; } return far; })();
  for (let v = 0; v < n; v++) if (D(pos(v), pos(notchV)) <= .0075) lineOf[v] = 5;
  // triangle labels: a triangle takes the zone of most of its corners, and a line label when two corners carry it
  const nt = s.indices.length / 3, triZone = new Uint8Array(nt), triLine = new Uint8Array(nt);
  for (let t = 0; t < nt; t++) {
    const c = [0, 1, 2].map(k => s.indices[t * 3 + k]), zs = c.map(v => zoneOf[v]), ls = c.map(v => lineOf[v]);
    triZone[t] = zs[0] === zs[1] || zs[0] === zs[2] ? zs[0] : zs[1] === zs[2] ? zs[1] : zs[0];
    for (const l of [1, 2, 3, 4, 5]) if (ls.filter(x => x === l).length >= 2) { triLine[t] = l; break; }
  }
  const stats = {vertices: n, triangles: nt, lesserLenMm: +(lesserLen * 1000).toFixed(1), greaterVertices: greater.length, incisureArcFraction: +(arc[incisure] / lesserLen).toFixed(2), turnDeg: +(bestTurn * 180 / Math.PI).toFixed(0),
    zone: Object.fromEntries([1, 2, 3, 4, 5].map(z => [z, [...triZone].filter(x => x === z).length])), line: Object.fromEntries([1, 2, 3, 4, 5].map(z => [z, [...triLine].filter(x => x === z).length]))};
  const part = writer.addMesh('Stomach', s.positions, s.indices, {});
  part.triZone = writer.addBytes(triZone); part.triLine = writer.addBytes(triLine);
  // context: the abdominal oesophagus (plus a short stretch above the diaphragm) and the first part of the duodenum, each cut straight with a plane
  const e1 = loopSubdivide(eso.positions, eso.indices, 1), e2 = clipPlane(e1.positions, e1.indices, [0, 1, 0], cardiaPt[1] + .14);
  // curvature bands: the stomach surface within BAND of the (smoothed) curvature, cut along the line of equal distance and lifted 0.35 mm out of the surface
  const BAND = .0012, LIFT = .00035, sn = vertexNormals(s.positions, s.indices);
  for (const [key, path] of [['Lesser curvature', lesser], ['Greater curvature', greater]]) {
    const poly = smoothPolyline(path.map(pos), 4, 3), f = Float64Array.from({length: n}, (_, v) => BAND - distToPolyline(pos(v), poly));
    const band = fieldClip(s.positions, s.indices, f);
    for (let v = 0; v < band.positions.length / 3; v++) { const src = band.from[v]; for (let k = 0; k < 3; k++) band.positions[v * 3 + k] += LIFT * (sn[src[0] * 3 + k] * (1 - src[2]) + sn[src[1] * 3 + k] * src[2]); }
    writer.addMesh(key, band.positions, band.indices);
  }
  writer.addMesh('Esophagus', e2.positions, e2.indices);
  const d1 = loopSubdivide(duo.positions, duo.indices, 1), dn = []; for (let v = 0; v < d1.positions.length / 3; v++) if (D(pt(d1, v), pylorusPt) < .04) dn.push(v);
  const dc = [0, 1, 2].map(k => dn.reduce((t, v) => t + pt(d1, v)[k], 0) / dn.length), du = dc.map((x, k) => x - pylorusPt[k]), dul = Math.hypot(...du), u = du.map(x => x / dul);
  const d2 = clipPlane(d1.positions, d1.indices, u, u[0] * pylorusPt[0] + u[1] * pylorusPt[1] + u[2] * pylorusPt[2] + .05);
  writer.addMesh('Duodenum', d2.positions, d2.indices);
  const supply = buildSupply({writer, atlasPart, nervePart, paokaoPart, surface: s, lesser: lesser.map(pos), greater: greater.map(pos), organs: {Esophagus: eso, Duodenum: duo}});
  return {stats: {...stats, supply: supply.keys.length}, landmarks: {cardia: pt(s, c0), pylorus: pt(s, p0), incisure: ai, apex: pos(apex)}};
}

/**
 * The part of a mesh where the per-vertex field f is >= 0, the triangles crossing the zero level cut along it (linear along each edge), so the border is a smooth line.
 * Returns positions, indices and, for every output vertex, the source edge [a, b, t] it lies on (a = b for a source vertex), so normals can be carried over.
 */
function fieldClip(P, I, f) {
  const out = [], from = [], map = new Map(), edge = new Map(), idx = [];
  const vert = v => { if (!map.has(v)) { map.set(v, out.length / 3); out.push(P[v * 3], P[v * 3 + 1], P[v * 3 + 2]); from.push([v, v, 0]); } return map.get(v); };
  const cut = (a, b) => { const k = a < b ? `${a}_${b}` : `${b}_${a}`; if (edge.has(k)) return edge.get(k); const t = f[a] / (f[a] - f[b]), i = out.length / 3;
    for (let c = 0; c < 3; c++) out.push(P[a * 3 + c] + (P[b * 3 + c] - P[a * 3 + c]) * t); from.push([a, b, t]); edge.set(k, i); return i; };
  for (let t = 0; t < I.length; t += 3) {
    const tri = [I[t], I[t + 1], I[t + 2]], inside = tri.map(v => f[v] >= 0), k = inside.filter(Boolean).length;
    if (k === 3) idx.push(...tri.map(vert));
    else if (k === 1) { const i = inside.indexOf(true), a = tri[i], b = tri[(i + 1) % 3], c = tri[(i + 2) % 3]; idx.push(vert(a), cut(a, b), cut(a, c)); }
    else if (k === 2) { const o = inside.indexOf(false), a = tri[o], b = tri[(o + 1) % 3], c = tri[(o + 2) % 3]; const ab = cut(b, a), ca = cut(c, a); idx.push(vert(b), vert(c), ca, vert(b), ca, ab); }
  }
  return {positions: Float32Array.from(out), indices: Uint32Array.from(idx), from};
}
