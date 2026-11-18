// Parts of the abdominal organs (A1–A3 of docs/exam2-abdomen-gap.md) marked as patches on the organ meshes of the atlas, the same way as the bone landmarks: thin patches lifted
// a fraction of a millimetre off the organ (kind 'landmark', parent = the organ), so they can be searched, picked and quizzed and follow the organ when it is hidden.
// Names (English and Chinese) are those of docs/required-structures/abdomen.json, so the card text of app/quiz/card-data.ts finds them. Borders are schematic: each patch is
// the zero level of a smooth field on the organ surface (U.fieldPatch), from landmarks measured on the meshes:
//   stomach   the oesophagus and duodenum contacts give the cardia and the pylorus; the lesser curvature is the shortest way over the surface between them, the greater curvature
//             the ridge farthest from it, the angular incisure the sharpest bend of the lesser curvature (same rules as the stomach detail mode);
//   duodenum  a centre line from the pylorus to the duodenojejunal end, cut at its three bends into the superior, descending, inferior (horizontal) and ascending parts;
//             the papillae open on the inner wall of the descending part and are marked on its medial (pancreatic) side;
//   caecum    the atlas has no caecum mesh: it is the end of the ascending colon below the entry of the ileum; the ileocaecal valve is marked where the ileum enters;
//   gallbladder neck, body and fundus along its long axis from the cystic duct;
//   liver     the atlas liver is made of its segments: right lobe V–VIII, left lobe II–III, quadrate lobe the lower part of segment IV (the caudate lobe has its own mesh).
import {sub, add, mul, unit, len, lerp, dot} from '../lib/paokao-util.mjs';

const D = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const vertsOf = m => { const out = []; for (let i = 0; i < m.positions.length; i += 3) out.push([m.positions[i], m.positions[i + 1], m.positions[i + 2]]); return out; };
/** Vertices welded (same place = same vertex) and the edge graph between them. */
function graph(m) {
  const key = i => `${Math.round(m.positions[i * 3] * 1e6)},${Math.round(m.positions[i * 3 + 1] * 1e6)},${Math.round(m.positions[i * 3 + 2] * 1e6)}`, ids = new Map(), map = [], pts = [];
  for (let i = 0; i < m.positions.length / 3; i++) { const k = key(i); if (!ids.has(k)) { ids.set(k, ids.size); pts.push([m.positions[i * 3], m.positions[i * 3 + 1], m.positions[i * 3 + 2]]); } map.push(ids.get(k)); }
  const adj = pts.map(() => new Map());
  for (let t = 0; t < m.indices.length; t += 3) for (let k = 0; k < 3; k++) { const a = map[m.indices[t + k]], b = map[m.indices[t + (k + 1) % 3]]; if (a !== b) { const l = D(pts[a], pts[b]); adj[a].set(b, l); adj[b].set(a, l); } }
  return {pts, adj};
}
/** Dijkstra from a set of sources; cost(a, b, length) defaults to the length. */
function dijkstra(adj, sources, cost = (a, b, l) => l) {
  const n = adj.length, dist = new Float64Array(n).fill(Infinity), prev = new Int32Array(n).fill(-1), done = new Uint8Array(n);
  for (const s of sources) dist[s] = 0;
  for (;;) {
    let u = -1, best = Infinity; for (let i = 0; i < n; i++) if (!done[i] && dist[i] < best) { best = dist[i]; u = i; }
    if (u < 0) break; done[u] = 1;
    for (const [v, l] of adj[u]) { const d = dist[u] + cost(u, v, l); if (d < dist[v]) { dist[v] = d; prev[v] = u; } }
  }
  return {dist, prev};
}
const pathTo = (prev, v) => { const out = []; for (; v >= 0; v = prev[v]) out.push(v); return out.reverse(); };
const nearestIndex = (pts, p) => { let b = 0, bd = Infinity; pts.forEach((q, i) => { const d = D(q, p); if (d < bd) { bd = d; b = i; } }); return b; };
/** Distance from p to a polyline. */
function distToPolyline(p, poly) {
  let best = Infinity;
  for (let i = 1; i < poly.length; i++) { const a = poly[i - 1], ab = sub(poly[i], a), l2 = dot(ab, ab), t = l2 ? Math.max(0, Math.min(1, dot(sub(p, a), ab) / l2)) : 0; best = Math.min(best, D(p, add(a, mul(ab, t)))); }
  return best;
}
/** Arc length of the point of a polyline nearest to p, and the distance to it. */
function alongPolyline(p, poly, arc) {
  let best = Infinity, s = 0;
  for (let i = 1; i < poly.length; i++) { const a = poly[i - 1], ab = sub(poly[i], a), l2 = dot(ab, ab), t = l2 ? Math.max(0, Math.min(1, dot(sub(p, a), ab) / l2)) : 0, d = D(p, add(a, mul(ab, t))); if (d < best) { best = d; s = arc[i - 1] + t * (arc[i] - arc[i - 1]); } }
  return {s, d: best};
}
const arcOf = poly => { const arc = [0]; for (let i = 1; i < poly.length; i++) arc.push(arc[i - 1] + D(poly[i - 1], poly[i])); return arc; };
/** Moving average along a polyline (k passes of a 3-point average, ends fixed). */
const smooth = (poly, k = 3) => { let p = poly.map(q => [...q]); for (let it = 0; it < k; it++) p = p.map((q, i) => i === 0 || i === p.length - 1 ? q : [0, 1, 2].map(a => (p[i - 1][a] + q[a] + p[i + 1][a]) / 3)); return p; };
/** Closest pair between two meshes (vertices): [point on a, point on b, distance]. */
function contact(a, b) { let best = [null, null, Infinity]; for (const p of a) for (const q of b) { const d = D(p, q); if (d < best[2]) best = [p, q, d]; } return best; }

export default function abdomenParts(U) {
  const out = [];
  // lifts: every patch of one organ at its own height, so two selected patches never fight
  let k = 0; const lift = () => .0004 + (k++ % 12) * .00003;
  // The card holds only the organ and, where the model needs it, a note on how the part is shown; the anatomical text is in app/quiz/card-data.ts (shared with the quiz cards).
  const ORGAN_ZH = {Stomach: '胃', Duodenum: '十二指腸', 'Ascending colon': '升結腸', Gallbladder: '膽囊', liver: '肝臟'};
  const part = (name, zh, organ, geometry, where, _role, note = ['', '']) => {
    if (!geometry.indices.length) throw new Error(`abdomen part ${name}: empty patch on ${organ}`);
    const host = /^Hepatovenous/.test(organ) ? 'liver' : organ;
    out.push({name, zh, system: 'digestive', kind: 'landmark', parent: organ, geometry: [geometry], card: {origin: [host === 'liver' ? 'Liver' : host, ORGAN_ZH[host]], course: note, supply: ['', '']}, refs: []});
  };
  const patch = (organ, field, opts = {}) => U.fieldPatch(organ, field, {off: lift(), maxEdge: .0012, ...opts});

  // ---------------- Stomach
  {
    const S = 'Stomach', G = graph(U.mesh(S)), P = G.pts, n = P.length;
    const eso = U.V('Esophagus'), duo = U.V('Duodenum');
    const cardiaPt = contact(P, eso)[0], pylorusPt = contact(P, duo)[0];
    const c0 = nearestIndex(P, cardiaPt), p0 = nearestIndex(P, pylorusPt);
    const fromC = dijkstra(G.adj, [c0]), lesserIdx = pathTo(fromC.prev, p0), lesser = smooth(lesserIdx.map(i => P[i]), 4), arc = arcOf(lesser), lesserLen = arc.at(-1);
    const dl = dijkstra(G.adj, lesserIdx), dMax = Math.max(...[...dl.dist].filter(Number.isFinite));
    // the greater curvature ends at the cardial notch: the point of the ring around the cardia that lies farthest from the lesser curvature
    let notch = c0, fd = -1; for (let v = 0; v < n; v++) { const d = D(P[v], P[c0]); if (d > .011 && d < .015 && dl.dist[v] > fd) { fd = dl.dist[v]; notch = v; } }
    const ridge = dijkstra(G.adj, [p0], (a, b, l) => l * (.02 + Math.pow(1 - (dl.dist[a] + dl.dist[b]) / 2 / dMax, 2)));
    const greater = smooth(pathTo(ridge.prev, notch).map(i => P[i]), 4);
    // angular incisure: the sharpest bend of the lower lesser curvature
    const at = f => { const i = arc.findIndex(a => a >= f * lesserLen); return i < 0 ? lesser.length - 1 : i; };
    let inc = at(.6), bestTurn = -1; const win = .09 * lesserLen;
    for (let i = at(.45); i < at(.92); i++) {
      const a = arc.findIndex(x => x >= arc[i] - win), b = arc.findIndex(x => x >= arc[i] + win); if (a < 0 || b < 0) continue;
      const u = unit(sub(lesser[i], lesser[a])), v = unit(sub(lesser[b], lesser[i])), turn = Math.acos(Math.max(-1, Math.min(1, dot(u, v)))); if (turn > bestTurn) { bestTurn = turn; inc = i; }
    }
    const ai = lesser[inc], cardiaP = P[c0], pylorusP = P[p0];
    const nearPyl = P.filter(p => D(p, pylorusP) < .03), cen = mul(nearPyl.reduce((s, p) => add(s, p), [0, 0, 0]), 1 / nearPyl.length), canalAxis = unit(sub(pylorusP, cen));
    const toBody = unit(sub(pylorusP, ai));
    const R = .015, CANAL = .026, SPH = .009, yF = cardiaP[1] - .002;
    // fields (metres; positive inside the patch)
    const cardia = p => R - D(p, cardiaP);
    const distal = p => dot(sub(p, ai), toBody); // > 0: pyloric part (beyond the plane through the angular incisure)
    const fromPylorus = p => dot(sub(pylorusP, p), canalAxis); // distance back from the pylorus along the canal axis
    part('Cardia (cardial orifice)', '賁門', S, patch(S, cardia), ['Where the oesophagus opens into the stomach, at the upper end of the lesser curvature', '食道開口進入胃之處，在胃小彎上端'], ['The area around the cardial orifice', '賁門口周圍的區域']);
    part('Fundus of stomach', '胃底', S, patch(S, p => Math.min(p[1] - yF, -cardia(p))), ['The dome of the stomach above the level of the cardia, under the left dome of the diaphragm', '賁門平面以上、位於左側橫膈圓頂下方的胃頂部'], ['Usually holds a bubble of swallowed air', '通常存有吞入的空氣']);
    part('Body of stomach', '胃體', S, patch(S, p => Math.min(yF - p[1], -cardia(p), -distal(p))), ['The large middle part, between the fundus and the plane through the angular incisure', '胃底與通過胃角切跡的平面之間的大部分'], ['', '']);
    part('Pylorus', '幽門', S, patch(S, p => distal(p)), ['The pyloric part beyond the angular incisure: the pyloric antrum and the pyloric canal, ending at the pyloric sphincter', '胃角切跡以遠的幽門部：幽門竇與幽門管，止於幽門括約肌'], ['', '']);
    part('Pyloric antrum', '幽門竇', S, patch(S, p => Math.min(distal(p), fromPylorus(p) - CANAL)), ['The wider first part of the pyloric part, beyond the angular incisure', '幽門部較寬的近端，在胃角切跡以遠'], ['', '']);
    part('Pyloric canal', '幽門管', S, patch(S, p => Math.min(distal(p), CANAL - fromPylorus(p))), ['The narrow last 2–3 cm before the pyloric sphincter', '幽門括約肌前約 2–3 公分的狹窄段'], ['', '']);
    part('Pyloric sphincter', '幽門括約肌', S, patch(S, p => Math.min(distal(p), SPH - Math.abs(fromPylorus(p) - SPH / 2) * 2)), ['The ring of thickened circular muscle at the junction with the duodenum (marked on the surface)', '與十二指腸交界處增厚的環狀肌（標在表面）'], ['', '']);
    part('Lesser curvature of stomach', '胃小彎', S, patch(S, p => .0045 - distToPolyline(p, lesser)), ['The short concave right border, from the cardia to the pylorus', '由賁門到幽門、較短的凹形右緣'], ['The lesser omentum is attached along it', '小網膜附著於此']);
    part('Greater curvature of stomach', '胃大彎', S, patch(S, p => .0045 - distToPolyline(p, greater)), ['The long convex left border, from the cardial notch round the fundus to the pylorus', '由賁門切跡繞過胃底到幽門、較長的凸形左緣'], ['The greater omentum and the gastrosplenic ligament are attached along it', '大網膜與胃脾韌帶附著於此']);
    part('Angular incisure (angular notch)', '胃角切跡', S, patch(S, p => .0065 - D(p, ai)), ['The notch at the lowest point of the lesser curvature, where the body turns into the pyloric part', '胃小彎最低處的切跡，胃體在此轉為幽門部'], ['', '']);
    part('Cardial notch', '賁門切跡', S, patch(S, p => .0075 - D(p, P[notch])), ['The angle between the oesophagus and the fundus, on the left of the cardia', '食道與胃底之間、賁門左側的夾角'], ['', '']);
  }

  // ---------------- Duodenum
  {
    const Dn = 'Duodenum', G = graph(U.mesh(Dn)), P = G.pts, sto = U.V('Stomach');
    const start = nearestIndex(P, contact(P, sto)[0]);
    // centre line: rings of vertices at equal path distance from the pyloric end, each replaced by its centroid
    const fromP = dijkstra(G.adj, [start]), maxD = Math.max(...[...fromP.dist].filter(Number.isFinite)), STEP = .006, rings = [];
    for (let s = 0; s <= maxD; s += STEP) { const ring = P.filter((_, i) => fromP.dist[i] >= s && fromP.dist[i] < s + STEP); if (ring.length >= 3) rings.push(mul(ring.reduce((a, p) => add(a, p), [0, 0, 0]), 1 / ring.length)); }
    const line = smooth(rings, 3), arc = arcOf(line), total = arc.at(-1);
    // bends: the superior part runs to the right, the descending part down, the inferior part to the left, the ascending part up
    const dir = i => unit(sub(line[Math.min(line.length - 1, i + 2)], line[Math.max(0, i - 2)]));
    const firstWhere = (from, test) => { for (let i = from; i < line.length; i++) if (test(dir(i))) return i; return -1; };
    const bend1 = firstWhere(1, d => d[1] < -.7), bend2 = firstWhere(Math.max(bend1, 1), d => d[0] > .6 && Math.abs(d[1]) < .6), bend3 = firstWhere(Math.max(bend2, 1), d => d[1] > .6);
    if (bend1 < 0 || bend2 < 0 || bend3 < 0) throw new Error(`duodenum bends not found: ${bend1} ${bend2} ${bend3}`);
    const s1 = arc[bend1], s2 = arc[bend2], s3 = arc[bend3], at = p => alongPolyline(p, line, arc).s;
    part('Superior part of duodenum (duodenal cap)', '十二指腸上部（十二指腸壺腹）', Dn, patch(Dn, p => s1 - at(p)), ['The first part, about 5 cm, running from the pylorus to the right and back; its first, smooth-walled stretch is the duodenal cap', '第一部，約 5 公分，由幽門向右後方走；起始的平滑段即十二指腸壺腹'], ['', '']);
    part('Descending part of duodenum', '十二指腸降部', Dn, patch(Dn, p => Math.min(at(p) - s1, s2 - at(p))), ['The second part, about 7–10 cm, running down on the right of the head of the pancreas', '第二部，約 7–10 公分，在胰頭右側向下走'], ['The bile duct and the main pancreatic duct open into it at the major duodenal papilla', '總膽管與主胰管在大十二指腸乳突開口於此']);
    part('Inferior (horizontal) part of duodenum', '十二指腸下部（水平部）', Dn, patch(Dn, p => Math.min(at(p) - s2, s3 - at(p))), ['The third part, about 10 cm, crossing to the left in front of the inferior vena cava and the aorta, behind the superior mesenteric vessels', '第三部，約 10 公分，向左橫過下腔靜脈與主動脈前方、腸繫膜上血管後方'], ['', '']);
    part('Ascending part of duodenum', '十二指腸升部', Dn, patch(Dn, p => at(p) - s3), ['The fourth part, about 2.5 cm, rising to the duodenojejunal flexure on the left of the aorta', '第四部，約 2.5 公分，在主動脈左側上升至十二指腸空腸彎曲'], ['', '']);
    // papillae: on the medial (pancreatic) side of the descending part, the major one about halfway down, the minor one about 2 cm above and a little in front of it
    const mid = (s1 + s2) / 2, onLine = s => { const i = arc.findIndex(a => a >= s); return line[i < 0 ? line.length - 1 : i]; };
    const medialPoint = (s, forward) => { const c = onLine(s); let best = null, bd = -Infinity; for (const p of P) { if (Math.abs(at(p) - s) > .004) continue; const score = (p[0] - c[0]) + forward * (p[2] - c[2]); if (score > bd) { bd = score; best = p; } } return best; };
    const major = medialPoint(mid, 0), minor = medialPoint(mid - .02, .5);
    part('Major duodenal papilla', '大十二指腸乳突', Dn, patch(Dn, p => .004 - D(p, major)), ['On the inner wall of the descending part, about halfway down on its medial side; marked here on the outer surface at that place (the mesh has no inner wall)', '在降部內側壁約中段的位置；模型沒有腸壁內面，這裡標在外表面相同位置'], ['Common opening of the bile duct and the main pancreatic duct (hepatopancreatic ampulla)', '總膽管與主胰管的共同開口（肝胰壺腹）'], ['Opens on the inner wall; the model has no inner wall, so the place is marked on the outer surface', '開口在腸壁內面；模型沒有內面，位置標在外表面'])
    part('Minor duodenal papilla', '小十二指腸乳突', Dn, patch(Dn, p => .003 - D(p, minor)), ['About 2 cm above and slightly in front of the major papilla, on the same inner wall; marked on the outer surface', '大乳突上方約 2 公分、稍前方，同在內側壁；標在外表面'], ['Opening of the accessory pancreatic duct', '副胰管的開口'], ['Opens on the inner wall; marked on the outer surface at that place', '開口在腸壁內面；位置標在外表面'])
  }

  // ---------------- Caecum and ileocaecal valve (on the ascending colon)
  {
    const C = 'Ascending colon', col = U.V(C), ile = U.V('Ileocecal junction');
    const [entry] = contact(col, ile), yV = entry[1];
    part('Cecum', '盲腸', C, patch(C, p => (yV - .006) - p[1]), ['The blind pouch of the large intestine below the entry of the ileum, in the right iliac fossa; the atlas has no separate caecum, so it is marked on the lower end of the ascending colon', '大腸在迴腸入口以下的盲端，位於右髂窩；圖譜沒有獨立的盲腸模型，標在升結腸下端'], ['The appendix opens into its posteromedial wall', '闌尾開口於其後內側壁'], ['The atlas has no separate caecum: it is marked on the lower end of the ascending colon, below the entry of the ileum', '圖譜沒有獨立的盲腸模型：標在升結腸下端、迴腸入口以下'])
    part('Ileocecal valve', '迴盲瓣', C, patch(C, p => .006 - D(p, entry)), ['Where the ileum opens into the large intestine (on the inner wall; marked on the outer surface at that place)', '迴腸開口進入大腸之處（在腸壁內面；標在外表面相同位置）'], ['Its lips slow the passage of contents into the caecum and limit their flow back', '瓣唇減慢內容物進入盲腸，並限制逆流'], ['The valve lies on the inner wall where the ileum enters; marked on the outer surface of the colon at that place', '瓣在迴腸入口處的腸壁內面；位置標在結腸外表面'])
  }

  // ---------------- Gallbladder
  {
    const Gb = 'Gallbladder', gb = U.V(Gb), duct = U.V('Cystic duct');
    const [neckEnd] = contact(gb, duct); let far = gb[0]; for (const p of gb) if (D(p, neckEnd) > D(far, neckEnd)) far = p;
    const axis = unit(sub(far, neckEnd)), L = D(far, neckEnd), t = p => dot(sub(p, neckEnd), axis) / L;
    part('Neck of gallbladder', '膽囊頸', Gb, patch(Gb, p => .25 - t(p)), ['The narrow end that turns into the cystic duct', '連接膽囊管的狹窄端'], ['', '']);
    part('Body of gallbladder', '膽囊體', Gb, patch(Gb, p => Math.min(t(p) - .25, .75 - t(p))), ['The main part, lying against the visceral surface of the liver', '主要部分，貼在肝臟臟面'], ['', '']);
    part('Fundus of gallbladder', '膽囊底', Gb, patch(Gb, p => t(p) - .75), ['The rounded blind end that projects beyond the lower border of the liver', '突出於肝下緣的圓形盲端'], ['', '']);
  }

  // ---------------- Liver lobes (from the segments)
  {
    const seg = s => `Hepatovenous segment ${s}`, whole = s => patch(seg(s), () => 1, {margin: 1});
    const merge = list => { let pos = [], idx = []; for (const g of list) { const base = pos.length / 3; pos = pos.concat(Array.from(g.positions)); for (const i of g.indices) idx.push(i + base); } return {positions: Float32Array.from(pos), indices: Uint32Array.from(idx)}; };
    part('Right lobe of liver', '肝右葉', seg('V'), merge(['V', 'VI', 'VII', 'VIII'].map(whole)), ['The large right part of the liver, right of the gallbladder fossa and the groove for the inferior vena cava (segments V–VIII)', '肝臟右側的大部分，在膽囊窩與下腔靜脈溝右側（第 V–VIII 段）'], ['', ''], ['Made of liver segments V–VIII of the model', '由模型的肝第 V–VIII 段組成']);
    part('Left lobe of liver', '肝左葉', seg('II'), merge(['II', 'III'].map(whole)), ['The part left of the falciform ligament and the fissure for the ligamentum teres (segments II–III)', '鐮狀韌帶與肝圓韌帶裂左側的部分（第 II–III 段）'], ['', ''], ['Made of liver segments II–III of the model', '由模型的肝第 II–III 段組成']);
    const iv = U.mesh(seg('IV')), ys = vertsOf(iv).map(p => p[1]).sort((a, b) => a - b), yMid = ys[Math.floor(ys.length / 2)];
    part('Quadrate lobe of liver', '肝方形葉', seg('IV'), patch(seg('IV'), p => yMid - p[1]), ['On the visceral surface, between the gallbladder fossa and the fissure for the ligamentum teres, in front of the porta hepatis (the lower part of segment IV)', '在臟面、膽囊窩與肝圓韌帶裂之間、肝門前方（第 IV 段下部）'], ['', ''], ['The lower part of liver segment IV of the model', '模型肝第 IV 段的下部']);
  }
  return out;
}
