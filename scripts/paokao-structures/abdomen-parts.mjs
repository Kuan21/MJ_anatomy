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
//   liver     the atlas liver is made of its segments: right lobe V–VIII with the upper part of IV, left lobe II–III, quadrate lobe the lower part of segment IV (the caudate lobe
//             has its own mesh); the bare area is the back of the right part that touches the diaphragm, the porta hepatis the visceral surface round the entering portal vein,
//             hepatic artery and hepatic duct;
//   oesophagus the hiatus is the height where the diaphragm lies closest all round it: the abdominal oesophagus lies below, the diaphragmatic constriction is a band there,
//             the oesophagogastric junction a band where the oesophagus meets the stomach;
//   colon     the right and left colic flexures are the upper ends of the ascending and descending colon where they meet the transverse colon;
//   spleen    the hilum is the surface round the entering splenic vessels; the gastric, renal and colic areas are the parts of the inward-facing surface nearest each organ.
import {sub, add, mul, unit, len, lerp, dot} from '../lib/paokao-util.mjs';
import {closest} from '../lib/heart-geom.mjs';

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
  // lifts: every patch of one organ at its own height, 0.3 mm apart (twice the 0.15 mm at which scripts/lib/stability-static.mjs counts two faces as coincident, so the
  // simplification below cannot close the step), so two patches that meet or overlap never draw on top of each other; the organ with the most parts (the stomach, 11) reaches
  // 3.3 mm (scripts/check-schematic-models.mjs allows 3.5 mm for a part of an organ)
  const level = new Map(); let group = '';
  const lift = () => { const n = level.get(group) ?? 0; level.set(group, n + 1); return .0003 + n * .0003; };
  // the patches are simplified when the stream is written (scripts/prepare-paokao.mjs): to about 0.06 mm, so the 0.3 mm steps between them stay
  // The card holds the organ, where the part lies and, where the model needs it, a note on how it is shown; the anatomical text of app/quiz/card-data.ts (shared with the quiz
  // cards) replaces the location and adds the other fields where it has an entry.
  const ORGAN_ZH = {Stomach: '胃', Duodenum: '十二指腸', 'Ascending colon': '升結腸', 'Descending colon': '降結腸', Gallbladder: '膽囊', liver: '肝臟', Esophagus: '食道', Spleen: '脾臟'};
  const SYSTEM = {Spleen: 'lymphatic'}; // the part is drawn and shown with its organ's system
  // `organ` is the mesh the patch lies on, or a list of meshes (a liver lobe lies on several liver segments: the first is its parent, all are its hosts for scripts/check-schematic-models.mjs)
  const part = (name, zh, organs, geometry, where, _role, note = ['', '']) => {
    const list = [organs].flat(), organ = list[0];
    if (!geometry.indices.length) throw new Error(`abdomen part ${name}: empty patch on ${organ}`);
    const host = /^Hepatovenous/.test(organ) ? 'liver' : organ;
    let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity]; for (let i = 0; i < geometry.positions.length; i += 3) for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], geometry.positions[i + a]); hi[a] = Math.max(hi[a], geometry.positions[i + a]); }
    const diag = Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]);
    out.push({name, zh, system: SYSTEM[organ] ?? 'digestive', kind: 'landmark', parent: organ, ...(list.length > 1 ? {hosts: list} : {}), ...(REGION.has(name) ? {region: true} : {}), error: Math.min(.003, .00006 / diag), geometry: [geometry], card: {origin: [host === 'liver' ? 'Liver' : host, ORGAN_ZH[host]], course: note, supply: where}, refs: []});
  };
  // Parts that together cover their organ (regions, not small marks): a click on the organ still picks the organ (app/scene.tsx treats them as see-through for picking);
  // they are chosen from the search, the structure list or the quiz. The small marks (papillae, notches, valve, sphincter, curvatures, flexures, hila …) are picked by a click like bone landmarks.
  const REGION = new Set(['Fundus of stomach', 'Body of stomach', 'Pylorus', 'Pyloric antrum', 'Pyloric canal', 'Superior part of duodenum (duodenal cap)', 'Descending part of duodenum', 'Inferior (horizontal) part of duodenum', 'Ascending part of duodenum', 'Cecum', 'Neck of gallbladder', 'Body of gallbladder', 'Fundus of gallbladder', 'Right lobe of liver', 'Left lobe of liver', 'Quadrate lobe of liver',
    'Abdominal esophagus', 'Gastric surface of spleen', 'Renal surface of spleen', 'Bare area of liver']);
  // Borders, angles, bends and hila are places on an organ, not structures of their own (user, 2026-11-21): they are drawn as a thin line about 1.5 mm wide along the
  // border (a smoothed centre line) or round the gut, refined finely enough for the line to keep its width; the parts (fundus, body, parts of the duodenum, lobes …) stay areas.
  const LINE = .00075, FINE = {maxEdge: .0005};
  const patch = (organ, field, opts = {}) => U.fieldPatch(organ, field, {off: lift(), maxEdge: .0012, ...opts});

  // ---------------- Stomach
  {
    group = 'stomach';
    const S = 'Stomach', G = graph(U.mesh(S)), P = G.pts, n = P.length;
    // a smoothed curvature cuts the corner where the border bends sharply: put it back on the surface, so the thin line along it has no gap there
    const onOrgan = line => line.map(q => U.surf(S, q));
    const eso = U.V('Esophagus'), duo = U.V('Duodenum');
    const cardiaPt = contact(P, eso)[0], pylorusPt = contact(P, duo)[0];
    const c0 = nearestIndex(P, cardiaPt), p0 = nearestIndex(P, pylorusPt);
    const fromC = dijkstra(G.adj, [c0]), lesserIdx = pathTo(fromC.prev, p0), lesser = onOrgan(smooth(lesserIdx.map(i => P[i]), 4)), arc = arcOf(lesser), lesserLen = arc.at(-1);
    const dl = dijkstra(G.adj, lesserIdx), dMax = Math.max(...[...dl.dist].filter(Number.isFinite));
    // the greater curvature ends at the cardial notch: the point of the ring around the cardia that lies farthest from the lesser curvature
    let notch = c0, fd = -1; for (let v = 0; v < n; v++) { const d = D(P[v], P[c0]); if (d > .011 && d < .015 && dl.dist[v] > fd) { fd = dl.dist[v]; notch = v; } }
    const ridge = dijkstra(G.adj, [p0], (a, b, l) => l * (.02 + Math.pow(1 - (dl.dist[a] + dl.dist[b]) / 2 / dMax, 2)));
    const greater = onOrgan(smooth(pathTo(ridge.prev, notch).map(i => P[i]), 4));
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
    part('Lesser curvature of stomach', '胃小彎', S, patch(S, p => LINE - distToPolyline(p, lesser), FINE), ['The short concave right border, from the cardia to the pylorus', '由賁門到幽門、較短的凹形右緣'], ['The lesser omentum is attached along it', '小網膜附著於此'], ['A thin line along the edge of the stomach model: it is a border of the organ, not a separate structure', '沿胃模型邊緣的細線：這是器官的邊緣，不是獨立構造']);
    part('Greater curvature of stomach', '胃大彎', S, patch(S, p => LINE - distToPolyline(p, greater), FINE), ['The long convex left border, from the cardial notch round the fundus to the pylorus', '由賁門切跡繞過胃底到幽門、較長的凸形左緣'], ['The greater omentum and the gastrosplenic ligament are attached along it', '大網膜與胃脾韌帶附著於此'], ['A thin line along the edge of the stomach model: it is a border of the organ, not a separate structure', '沿胃模型邊緣的細線：這是器官的邊緣，不是獨立構造']);
    part('Angular incisure (angular notch)', '胃角切跡', S, patch(S, p => Math.min(LINE - distToPolyline(p, lesser), .008 - D(p, ai)), FINE), ['The notch at the lowest point of the lesser curvature, where the body turns into the pyloric part', '胃小彎最低處的切跡，胃體在此轉為幽門部'], ['', ''], ['A short thin line on the lesser curvature at its sharpest bend: an angle of the organ, not a separate structure', '胃小彎最彎處的一小段細線：這是器官的角，不是獨立構造']);
    part('Cardial notch', '賁門切跡', S, patch(S, p => Math.min(LINE - distToPolyline(p, greater), .008 - D(p, P[notch])), FINE), ['The angle between the oesophagus and the fundus, on the left of the cardia', '食道與胃底之間、賁門左側的夾角'], ['', ''], ['A short thin line where the greater curvature meets the oesophagus: an angle of the organ, not a separate structure', '胃大彎與食道相接處的一小段細線：這是器官的角，不是獨立構造']);
  }

  // ---------------- Duodenum
  {
    group = 'duodenum';
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
    part('Duodenojejunal flexure', '十二指腸空腸彎曲', Dn, patch(Dn, p => LINE - Math.abs(at(p) - (total - .008)), FINE), ['', ''], ['', ''], ['A thin line round the gut at the bend where the duodenum turns into the jejunum: a bend of the organ, not a separate structure', '在十二指腸轉為空腸的彎曲處繞腸管一圈的細線：這是器官的彎曲，不是獨立構造']);
    // papillae: on the medial (pancreatic) side of the descending part, the major one about halfway down, the minor one about 2 cm above and a little in front of it
    const mid = (s1 + s2) / 2, onLine = s => { const i = arc.findIndex(a => a >= s); return line[i < 0 ? line.length - 1 : i]; };
    const medialPoint = (s, forward) => { const c = onLine(s); let best = null, bd = -Infinity; for (const p of P) { if (Math.abs(at(p) - s) > .004) continue; const score = (p[0] - c[0]) + forward * (p[2] - c[2]); if (score > bd) { bd = score; best = p; } } return best; };
    const major = medialPoint(mid, 0), minor = medialPoint(mid - .02, .5);
    part('Major duodenal papilla', '大十二指腸乳突', Dn, patch(Dn, p => .004 - D(p, major)), ['On the inner wall of the descending part, about halfway down on its medial side; marked here on the outer surface at that place (the mesh has no inner wall)', '在降部內側壁約中段的位置；模型沒有腸壁內面，這裡標在外表面相同位置'], ['Common opening of the bile duct and the main pancreatic duct (hepatopancreatic ampulla)', '總膽管與主胰管的共同開口（肝胰壺腹）'], ['Opens on the inner wall; the model has no inner wall, so the place is marked on the outer surface', '開口在腸壁內面；模型沒有內面，位置標在外表面'])
    part('Minor duodenal papilla', '小十二指腸乳突', Dn, patch(Dn, p => .003 - D(p, minor)), ['About 2 cm above and slightly in front of the major papilla, on the same inner wall; marked on the outer surface', '大乳突上方約 2 公分、稍前方，同在內側壁；標在外表面'], ['Opening of the accessory pancreatic duct', '副胰管的開口'], ['Opens on the inner wall; marked on the outer surface at that place', '開口在腸壁內面；位置標在外表面'])
  }

  // ---------------- Caecum and ileocaecal valve (on the ascending colon)
  {
    group = 'caecum';
    const C = 'Ascending colon', col = U.V(C), ile = U.V('Ileocecal junction');
    const [entry] = contact(col, ile), yV = entry[1];
    part('Cecum', '盲腸', C, patch(C, p => (yV - .006) - p[1]), ['The blind pouch of the large intestine below the entry of the ileum, in the right iliac fossa; the atlas has no separate caecum, so it is marked on the lower end of the ascending colon', '大腸在迴腸入口以下的盲端，位於右髂窩；圖譜沒有獨立的盲腸模型，標在升結腸下端'], ['The appendix opens into its posteromedial wall', '闌尾開口於其後內側壁'], ['The atlas has no separate caecum: it is marked on the lower end of the ascending colon, below the entry of the ileum', '圖譜沒有獨立的盲腸模型：標在升結腸下端、迴腸入口以下'])
    part('Ileocecal valve', '迴盲瓣', C, patch(C, p => .006 - D(p, entry)), ['Where the ileum opens into the large intestine (on the inner wall; marked on the outer surface at that place)', '迴腸開口進入大腸之處（在腸壁內面；標在外表面相同位置）'], ['Its lips slow the passage of contents into the caecum and limit their flow back', '瓣唇減慢內容物進入盲腸，並限制逆流'], ['The valve lies on the inner wall where the ileum enters; marked on the outer surface of the colon at that place', '瓣在迴腸入口處的腸壁內面；位置標在結腸外表面'])
  }

  // ---------------- Gallbladder
  {
    group = 'gallbladder';
    const Gb = 'Gallbladder', gb = U.V(Gb), duct = U.V('Cystic duct');
    const [neckEnd] = contact(gb, duct); let far = gb[0]; for (const p of gb) if (D(p, neckEnd) > D(far, neckEnd)) far = p;
    const axis = unit(sub(far, neckEnd)), L = D(far, neckEnd), t = p => dot(sub(p, neckEnd), axis) / L;
    part('Neck of gallbladder', '膽囊頸', Gb, patch(Gb, p => .25 - t(p)), ['The narrow end that turns into the cystic duct', '連接膽囊管的狹窄端'], ['', '']);
    part('Body of gallbladder', '膽囊體', Gb, patch(Gb, p => Math.min(t(p) - .25, .75 - t(p))), ['The main part, lying against the visceral surface of the liver', '主要部分，貼在肝臟臟面'], ['', '']);
    part('Fundus of gallbladder', '膽囊底', Gb, patch(Gb, p => t(p) - .75), ['The rounded blind end that projects beyond the lower border of the liver', '突出於肝下緣的圓形盲端'], ['', '']);
  }

  // ---------------- Liver lobes (from the segments)
  {
    group = 'liver';
    const seg = s => `Hepatovenous segment ${s}`, whole = s => patch(seg(s), () => 1, {margin: 1, maxEdge: 1}); // the whole segment: nothing to cut, so no refinement
    const merge = list => { let pos = [], idx = []; for (const g of list) { const base = pos.length / 3; pos = pos.concat(Array.from(g.positions)); for (const i of g.indices) idx.push(i + base); } return {positions: Float32Array.from(pos), indices: Uint32Array.from(idx)}; };
    // segment IV is split at the median height of its vertices: the lower part (on the visceral surface, in front of the porta hepatis) is the quadrate lobe, the upper part
    // (on the diaphragmatic surface, right of the falciform ligament) belongs to the morphological right lobe
    const iv = U.mesh(seg('IV')), ys = vertsOf(iv).map(p => p[1]).sort((a, b) => a - b), yMid = ys[Math.floor(ys.length / 2)];
    part('Right lobe of liver', '肝右葉', ['V', 'VI', 'VII', 'VIII', 'IV'].map(seg), merge([...['V', 'VI', 'VII', 'VIII'].map(whole), patch(seg('IV'), p => p[1] - yMid, {maxEdge: .0025})]), ['', ''], ['', ''], ['Liver segments V–VIII and the upper part of segment IV of the model (right of the falciform ligament, without the quadrate and caudate lobes)', '由模型的肝第 V–VIII 段與第 IV 段上部組成（鐮狀韌帶右側，不含方形葉與尾狀葉）']);
    part('Left lobe of liver', '肝左葉', ['II', 'III'].map(seg), merge(['II', 'III'].map(whole)), ['', ''], ['', ''], ['Liver segments II–III of the model (left of the falciform ligament)', '由模型的肝第 II–III 段組成（鐮狀韌帶左側）']);
    part('Quadrate lobe of liver', '肝方形葉', seg('IV'), patch(seg('IV'), p => yMid - p[1], {maxEdge: .0025}), ['', ''], ['', ''], ['The lower part of liver segment IV of the model, between the gallbladder fossa and the fissure for the round ligament', '模型肝第 IV 段的下部，在膽囊窩與肝圓韌帶裂之間']);
  }

  // ---------------- Abdominal oesophagus: from the oesophageal hiatus (where the oesophagus passes the diaphragm) down to the stomach
  {
    group = 'oesophagus';
    const E = 'Esophagus', eso = U.V(E);
    // the hiatus: the height in the lowest 6 cm of the oesophagus where the diaphragm lies closest all round it (mean distance from eight points round the wall)
    const em = U.mesh(E), low = Math.min(...eso.map(p => p[1]));
    const centre = y => { const P = em.positions, I = em.indices, pts = []; for (let t = 0; t < I.length; t += 3) for (const [i, j] of [[0, 1], [1, 2], [2, 0]]) { const a = I[t + i] * 3, b = I[t + j] * 3; if ((P[a + 1] - y) * (P[b + 1] - y) < 0) { const f = (y - P[a + 1]) / (P[b + 1] - P[a + 1]); pts.push([P[a] + f * (P[b] - P[a]), y, P[a + 2] + f * (P[b + 2] - P[a + 2])]); } } return pts.length ? mul(pts.reduce((c, q) => add(c, q), [0, 0, 0]), 1 / pts.length) : null; };
    let yH = low + .03, best = Infinity;
    for (let y = low + .005; y < low + .06; y += .0025) { const c = centre(y); if (!c) continue; let sum = 0; for (let a = 0; a < 8; a++) sum += U.dist('Diaphragm', U.surf(E, add(c, [Math.cos(a * Math.PI / 4) * .02, 0, Math.sin(a * Math.PI / 4) * .02]))); if (sum < best) { best = sum; yH = y; } }
    // signed distance to the stomach (negative inside): the lower end of the oesophagus of the model runs a little way inside the stomach mesh, and that hidden stretch is not marked
    const sm = U.mesh('Stomach'), fromStomach = p => { const c = closest(sm, p), d = len(sub(p, c.point)); return dot(sub(p, c.point), c.normal) < 0 ? -d : d; };
    part('Abdominal esophagus', '食道腹部', E, patch(E, p => Math.min(yH - p[1], fromStomach(p) + .0005)), ['The short last part of the oesophagus, from the oesophageal hiatus of the diaphragm (about T10) to the cardia of the stomach, left of the midline', '食道最後一小段，由橫膈食道裂孔（約第十胸椎）到胃的賁門，在正中線左側'], ['', ''], ['The part of the oesophagus of the model below the oesophageal hiatus of the diaphragm', '模型食道在橫膈食道裂孔以下的部分']);
    part('Diaphragmatic (esophagogastric) constriction of esophagus', '食道橫膈狹窄', E, patch(E, p => Math.min(LINE - Math.abs(p[1] - yH), fromStomach(p) + .0005), FINE), ['Where the oesophagus passes through the oesophageal hiatus of the diaphragm, about 40 cm from the incisor teeth', '食道穿過橫膈食道裂孔處，距門齒約 40 公分'], ['', ''], ['A thin line round the oesophagus where it passes the oesophageal hiatus (the narrowing itself is not modelled)', '食道穿過食道裂孔處繞一圈的細線（模型沒有做出狹窄本身）']);
    part('Esophagogastric junction (Z-line)', '食道胃交界（Z 線）', E, patch(E, p => Math.min(2 * LINE - fromStomach(p), fromStomach(p)), FINE), ['', ''], ['', ''], ['The Z-line lies on the inner (mucosal) surface; marked here as a thin line where the oesophagus meets the stomach', 'Z 線在黏膜內面；這裡以食道與胃相接處的細線標示']);
  }

  // ---------------- Colic flexures: where the ascending and the descending colon meet the transverse colon
  {
    const T = 'Transverse colon';
    for (const [name, zh, C, side, where] of [
      ['Right colic flexure', '右結腸彎曲', 'Ascending colon', 'right (hepatic)', ['The bend between the ascending and the transverse colon, under the right lobe of the liver, in front of the right kidney', '升結腸與橫結腸之間的轉彎，在肝右葉下方、右腎前方']],
      ['Left colic flexure', '左大腸彎', 'Descending colon', 'left (splenic)', ['The bend between the transverse and the descending colon, higher than the right one, at the lower end of the spleen, held by the phrenicocolic ligament', '橫結腸與降結腸之間的轉彎，比右側高，在脾下端，由膈結腸韌帶固定']]]) {
      const [meet] = contact(U.V(C), U.V(T)); group = C;
      // a ring round the gut: the plane through the centre of the last 25 mm of the colon, across its axis there
      const near = U.V(C).filter(q => D(q, meet) < .025), c = mul(near.reduce((a, q) => add(a, q), [0, 0, 0]), 1 / near.length);
      let ax = [0, 1, 0]; for (let it = 0; it < 30; it++) { const n2 = [0, 0, 0]; for (const q of near) { const d = sub(q, c), t = dot(d, ax); for (let a = 0; a < 3; a++) n2[a] += d[a] * t; } ax = unit(n2); }
      part(name, zh, C, patch(C, p => Math.min(LINE - Math.abs(dot(sub(p, c), ax)), .03 - D(p, c)), FINE), where, ['', ''], [`A thin line round the colon at the ${side} flexure, where the ${C.toLowerCase()} turns into the transverse colon: a bend of the organ, not a separate structure`, `在${ORGAN_ZH[C]}轉為橫結腸的彎曲處繞腸管一圈的細線：這是器官的彎曲，不是獨立構造`]);
    }
  }

  // ---------------- Spleen: hilum and the three areas of its visceral surface
  {
    group = 'spleen';
    const Sp = 'Spleen', dA = p => U.dist('Splenic artery', p), dV = p => U.dist('Splenic vein', p);
    part('Hilum of spleen (splenic hilum)', '脾門', Sp, patch(Sp, p => LINE - Math.abs(Math.min(dA(p), dV(p)) - .008), FINE), ['A slit on the visceral surface of the spleen, between its gastric and renal areas, where the splenic vessels enter and leave', '脾臟面上、胃面與腎面之間的裂隙，脾血管由此進出'], ['', ''], ['A thin outline round the place where the splenic vessels enter: a part of the surface of the organ, not a separate structure', '圍繞脾血管進出處的細線：這是器官表面的一處，不是獨立構造']);
    // each area: the part of the visceral (inward-facing) surface whose nearest neighbour is that organ, within 2.5 cm of it
    const near = {gastric: p => U.dist('Stomach', p), renal: p => U.dist('Left kidney', p), colic: p => Math.min(U.dist('Transverse colon', p), U.dist('Descending colon', p))};
    const sc = U.pca(Sp).c, visceral = (p, n) => n ? dot(n, unit(sub([0, sc[1], sc[2] + .02], sc))) > .1 : true; // facing medially and forwards, away from the diaphragm
    const area = key => (p, n) => { if (!visceral(p, n)) return -1; const d = near[key](p), others = Object.entries(near).filter(([k2]) => k2 !== key).map(([, f]) => f(p)); return Math.min(.025 - d, Math.min(...others) - d); };
    part('Gastric surface of spleen', '脾胃面', Sp, patch(Sp, area('gastric')), ['The concave front part of the visceral surface, in contact with the posterior wall of the stomach', '臟面前方凹陷的部分，貼著胃後壁'], ['', ''], ['The area of the visceral surface that faces the stomach (in front of the hilum)', '臟面朝向胃的區域（在脾門前方）']);
    part('Renal surface of spleen', '脾腎面', Sp, patch(Sp, area('renal')), ['The flat back part of the visceral surface, in contact with the left kidney and suprarenal gland', '臟面後方平坦的部分，貼著左腎與左腎上腺'], ['', ''], ['The area of the visceral surface that faces the left kidney (behind the hilum)', '臟面朝向左腎的區域（在脾門後方）']);
    part('Colic surface of spleen', '脾結腸面', Sp, patch(Sp, area('colic')), ['The lower front part of the visceral surface, in contact with the left colic flexure', '臟面前下方，貼著結腸左曲'], ['', ''], ['The area of the visceral surface near the lower pole that faces the left colic flexure', '臟面靠近下端、朝向結腸左曲的區域']);
  }

  // ---------------- Liver: bare area and porta hepatis (each a set of patches on the liver segments). The whole diaphragmatic and visceral surfaces are not marked: on the nine
  // segment meshes of the model they cost about 100 000 triangles (the borders between the segments), more than all the other parts together.
  {
    group = 'liver';
    const SEGS = ['II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map(s => `Hepatovenous segment ${s}`).concat(['Caudate lobe of liver']).filter(U.has);
    const merge = list => { let pos = [], idx = []; for (const g of list) { if (!g.indices.length) continue; const base = pos.length / 3; pos = pos.concat(Array.from(g.positions)); for (const i of g.indices) idx.push(i + base); } return {positions: Float32Array.from(pos), indices: Uint32Array.from(idx)}; };
    // a face between two segments is inside the liver: only the outer surface is marked
    // (distances are kept by position: the four parts below ask for the same vertices)
    const memo = (f, m = new Map()) => p => { const key = `${Math.round(p[0] * 1e6)},${Math.round(p[1] * 1e6)},${Math.round(p[2] * 1e6)}`; let v = m.get(key); if (v === undefined) m.set(key, v = f(p)); return v; };
    // nearest vertex of another segment, from a hash of their vertices (3 mm cells): a vertex within 2 mm of another segment lies on an inner face
    const CELL = .003, cellKey = (x, y, z) => `${Math.floor(x / CELL)},${Math.floor(y / CELL)},${Math.floor(z / CELL)}`, hashes = new Map();
    for (const seg of SEGS) { const h = new Map(); for (const v of U.V(seg)) { const kk = cellKey(...v); if (!h.has(kk)) h.set(kk, []); h.get(kk).push(v); } hashes.set(seg, h); }
    const nearestIn = (h, p) => { let best = Infinity; const [cx, cy, cz] = p.map(x => Math.floor(x / CELL)); for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (let l = -1; l <= 1; l++) for (const v of h.get(`${cx + i},${cy + j},${cz + l}`) ?? []) best = Math.min(best, D(v, p)); return best; };
    const outerOf = new Map(SEGS.map(seg => [seg, memo(p => Math.min(CELL, ...SEGS.filter(o => o !== seg).map(o => nearestIn(hashes.get(o), p))) - .002)])), outer = seg => outerOf.get(seg);
    const dDia = memo(p => U.dist('Diaphragm', p)), xIvc = U.pca('Inferior vena cava').c[0]; // the bare area lies on the right lobe, round the groove for the vena cava
    const over = (field, opts) => SEGS.map(seg => { const o = outer(seg); return patch(seg, (p, n) => Math.min(o(p), field(p, n)), {maxEdge: .0025, ...opts}); });
    const used = SEGS;
    // bare area: on the back of the diaphragmatic surface, in contact with the diaphragm and not covered by peritoneum
    part('Bare area of liver', '肝裸區', used, merge(over((p, n) => Math.min(.006 - dDia(p), n ? -n[2] - .3 : 1, xIvc + .01 - p[0]))), ['', ''], ['', ''], ['The back of the liver model where it lies directly against the diaphragm (no peritoneum)', '模型肝臟背面直接貼著橫膈（沒有腹膜覆蓋）的區域']);
    const hilum = memo(p => Math.min(...['Hepatic portal vein', 'Hepatic artery proper', 'Common hepatic duct'].filter(U.has).map(v => U.dist(v, p))));
    part('Porta hepatis', '肝門', used, merge(over(p => LINE - Math.abs(hilum(p) - .009), FINE)), ['', ''], ['', ''], ['A thin outline on the visceral surface round the place where the portal vein and the hepatic artery enter and the hepatic ducts leave: a part of the surface of the organ, not a separate structure', '臟面上圍繞門靜脈、肝動脈進入與肝管離開處的細線：這是器官表面的一處，不是獨立構造']);
  }
  return out;
}
