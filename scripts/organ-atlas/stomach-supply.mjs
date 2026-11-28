// Blood vessels, nerves and neighbouring organs of the stomach detail package.
//   - meshes copied from the atlas (BodyParts3D 4.0 vessels, Z-Anatomy vagus nerve, project-built sympathetic ganglia and splanchnic nerves): welded and written under the name of the structure;
//   - branches the atlas does not have, each built as one continuous tube along a smooth centre line (schematic): short gastric arteries and veins, posterior gastric artery and vein,
//     anterior vagal trunk with the anterior gastric branches, celiac plexus. Starts and ends are placed on the meshes that are really there (parent vessel, stomach surface, oesophagus).
import {weld, clipPlane, vertexNormals} from '../lib/organ-mesh.mjs';
import {add, sub, mul, lerp, len, unit, cross, verticesOf, extreme, nearest, nearestIndex, merge, tubeThrough, centreline, alongPolyline, insideMesh} from '../lib/organ-supply.mjs';

/** Parts copied from the atlas: [key, source, id or name, clip]. clip = keep y >= value (the vagus nerves continue far up the neck). */
export const COPIED = [
  ['Celiac trunk', 'atlas', 'FJ3421'], ['Common hepatic artery', 'atlas', 'FJ3078'], ['Proper hepatic artery', 'atlas', 'FJ3081'], ['Gastroduodenal artery', 'atlas', 'FJ3432'], ['Splenic artery', 'atlas', 'FJ3640'],
  ['Left gastric artery', 'atlas', 'FJ3499'], ['Right gastric artery', 'atlas', 'FJ3594'], ['Right gastro-omental artery', 'atlas', 'FJ3596'], ['Left gastro-omental artery', 'atlas', 'FJ3501'],
  ['Left gastric vein', 'atlas', 'FJ3500'], ['Right gastric vein', 'atlas', 'FJ3595'], ['Right gastro-omental vein', 'atlas', 'FJ3597'], ['Left gastro-omental vein', 'atlas', 'FJ3502'],
  ['Splenic vein', 'atlas', 'FJ3641'], ['Hepatic portal vein', 'atlas', 'FJ3082'], ['Superior mesenteric vein', 'atlas', 'FJ3647', 1.08],
  ['Right vagus nerve', 'nerve', 'Vagus nerve (X).r.001', 1.09, 1.35], ['Left vagus nerve', 'nerve', 'Vagus nerve (X).l.001', 1.09, 1.39],
  ['Esophageal plexus', 'paokao', 'Esophageal plexus'], ['Right celiac ganglion', 'paokao', 'Right celiac ganglion'], ['Left celiac ganglion', 'paokao', 'Left celiac ganglion'],
  ['Right greater splanchnic nerve', 'paokao', 'Right greater splanchnic nerve'], ['Left greater splanchnic nerve', 'paokao', 'Left greater splanchnic nerve'],
  ['Spleen', 'atlas', 'FJ2561'], ['Pancreas', 'atlas', 'FJ1895'],
  // related muscle shown with the organ: the diaphragm, whose left dome lies on the fundus and whose oesophageal hiatus the oesophagus passes through;
  // only the part left of x = -20 mm is kept (left dome, central tendon next to it, hiatus and crura), so the right dome over the liver does not cover the stomach
  ['Diaphragm', 'atlas', 'FJ3131'],
  // the celiac trunk arises from the abdominal aorta: a short stretch of the aorta (from the diaphragm to below the celiac trunk) so the trunk does not start in the air
  ['Abdominal aorta', 'atlas', 'FJ1932', 1.12],
];

export function buildSupply({writer, atlasPart, nervePart, paokaoPart, surface, lesser, greater, organs = {}}) {
  const src = {atlas: atlasPart, nerve: nervePart, paokao: paokaoPart}, meshes = new Map();
  for (const [key, kind, id, lo, hi] of COPIED) {
    let m = src[kind](id);
    if (lo !== undefined && kind === 'atlas') m = clipPlane(m.positions, m.indices, [0, -1, 0], -lo);
    if (kind === 'nerve') { m = clipPlane(m.positions, m.indices, [0, -1, 0], -lo); m = clipPlane(m.positions, m.indices, [0, 1, 0], hi); }
    if (key === 'Diaphragm') m = clipPlane(m.positions, m.indices, [-1, 0, 0], .02);
    if (key === 'Abdominal aorta') m = clipPlane(m.positions, m.indices, [0, 1, 0], 1.205);
    m = weld(m.positions, m.indices, 1e-6); meshes.set(key, m);
  }
  const V = key => verticesOf(meshes.get(key)), sv = verticesOf(surface), sn = vertexNormals(surface.positions, surface.indices);
  const surfaceAt = i => ({p: sv[i], n: [sn[i * 3], sn[i * 3 + 1], sn[i * 3 + 2]]});
  /** A point on the stomach wall near p, lifted `lift` out of the surface along the normal. */
  const onWall = (p, lift = .0007) => { const {p: q, n} = surfaceAt(nearestIndex(sv, p)); return add(q, mul(n, lift)); };
  const wobble = (a, b, k, amp) => { const d = unit(sub(b, a)), side = unit(cross(d, [0, 1, 0])); return add(lerp(a, b, k), mul(side, amp)); };
  const R_ARTERY = .0011, R_VEIN = .0012, R_NERVE = .0007;
  const distinctPath = (points, minStep = 1e-6) => points.filter((p, i) => !i || len(sub(p, points[i - 1])) >= minStep);

  // The wall point nearest to `aim` among the points that face `from` (the outside of the wall, seen from the vessel that ends on it), lifted a little out of the surface.
  const wallFacing = (from, aim, lift = .0007) => {
    let best = -1, bd = Infinity;
    for (let i = 0; i < sv.length; i++) { const n = [sn[i * 3], sn[i * 3 + 1], sn[i * 3 + 2]]; if (n[0] * (from[0] - sv[i][0]) + n[1] * (from[1] - sv[i][1]) + n[2] * (from[2] - sv[i][2]) <= 0) continue; const d = len(sub(sv[i], aim)); if (d < bd) { bd = d; best = i; } }
    const {p, n} = surfaceAt(best); return add(p, mul(n, lift));
  };
  // short gastric vessels: from the end of the splenic artery and vein at the splenic hilum, a short run in the gastrosplenic fold to the posterior wall of the fundus and the upper body, which lie against the spleen
  const splenicA = V('Splenic artery'), splenicV = V('Splenic vein'), hilumA = extreme(splenicA, 0, 1), hilumV = extreme(splenicV, 0, 1), shortArt = [], shortVein = [];
  [1.166, 1.178, 1.19, 1.202].forEach((y, k) => {
    const sign = k % 2 ? 1 : -1, startA = nearest(splenicA, add(hilumA, [-.004 * k, 0, 0])), startV = nearest(splenicV, add(hilumV, [-.004 * k, 0, 0]));
    const target = wallFacing(hilumA, [hilumA[0] - .004, y, hilumA[2] + .004]), targetV = wallFacing(hilumV, [hilumV[0] - .004, y + .005, hilumV[2] + .003]);
    shortArt.push(tubeThrough([startA, wobble(startA, target, .4, sign * .0016), wobble(startA, target, .75, -sign * .001), target], R_ARTERY * .8, R_ARTERY * .55));
    shortVein.push(tubeThrough([startV, wobble(startV, targetV, .45, -sign * .002), wobble(startV, targetV, .78, sign * .0012), targetV], R_VEIN * .8, R_VEIN * .55));
  });
  meshes.set('Short gastric arteries', merge(shortArt)); meshes.set('Short gastric veins', merge(shortVein));

  // posterior gastric artery and vein: from the middle third of the splenic vessels up behind the stomach to the posterior wall of the fundus
  // the start is the highest point of the splenic vessel, in its middle part, that lies outside the stomach (the atlas stomach reaches over parts of the splenic artery)
  const fromSplenic = (verts, lo, hi) => { const xs = verts.map(p => p[0]), x0 = Math.min(...xs), x1 = Math.max(...xs); return verts.filter(p => p[0] > x0 + lo * (x1 - x0) && p[0] < x0 + hi * (x1 - x0) && !insideMesh(surface, p)).reduce((b, p) => p[1] > b[1] ? p : b); };
  for (const [key, verts, lo, hi, dx, r] of [['Posterior gastric artery', splenicA, .35, .7, 0, R_ARTERY], ['Posterior gastric vein', splenicV, .35, .7, .008, R_VEIN]]) {
    const a0 = fromSplenic(verts, lo, hi), t = wallFacing(a0, add(a0, [dx, .03, -.004]));
    // on the wall it runs on over the back of the stomach for about 20 mm, tapering, with two small branches, as its branches do: seen through the glass stomach from the front, a vessel that stopped at the
    // wall looked like a stick ending in the air
    // the run on the wall keeps the direction the vessel arrives in (no bend where it reaches the wall): small steps, each one put back on the wall
    const dIn = unit(sub(t, lerp(a0, t, .7))), onBack = []; let at = t;
    for (let k = 0; k < 5; k++) { const next = wallFacing(a0, add(at, mul(dIn, .004)), .0006); onBack.push(next); at = next; }
    const twigs = [];
    meshes.set(key, merge([tubeThrough(distinctPath([a0, lerp(a0, t, .35), lerp(a0, t, .7), t, ...onBack]), r * .8, r * .3), ...twigs]));
  }

  // anterior vagal trunk: the continuation of the left vagus nerve, down the front of the oesophagus to the cardia; the anterior gastric branches fan out on the front wall along the lesser curvature
  const eso = verticesOf(weld(...Object.values(atlasPart('FJ2563')), 1e-6)), leftVagus = V('Left vagus nerve'), vEnd = extreme(leftVagus, 1, -1);
  const esoAt = y => { const ring = eso.filter(p => Math.abs(p[1] - y) < .002), c = [0, 1, 2].map(a => ring.reduce((s, p) => s + p[a], 0) / ring.length), r = Math.max(...ring.map(p => Math.hypot(p[0] - c[0], p[2] - c[2]))); return {c, r}; };
  const frontOf = y => { const {c, r} = esoAt(y); return [c[0] + .0015, y, c[2] + r + .0008]; };
  const yCardia = lesser[0][1];
  const trunk = [vEnd, lerp(vEnd, frontOf(1.31), .5), frontOf(1.31), frontOf(1.28), frontOf(1.25), frontOf(1.225), onWall(lerp(frontOf(yCardia + .004), lesser[0], .3), .0009)];
  meshes.set('Anterior vagal trunk', tubeThrough(trunk, R_NERVE * 1.25, R_NERVE * 1.05, 9, 10));
  // the anterior nerve of the lesser curvature runs on the front wall about 6 mm from the curvature; three branches leave it for the body
  const nerveLine = lesser.map(p => onWall(add(p, [0, 0, .006]), .0009)), n = nerveLine.length, pick = f => nerveLine[Math.min(n - 1, Math.round(f * (n - 1)))];
  const guide = [0, .25, .5, .75, .95].map(pick);
  const branches = [tubeThrough(guide, R_NERVE, R_NERVE * .65, 10, 8)];
  for (const f of [.32, .55, .78]) { const a = pick(f), tip = onWall(add(a, [.012 - f * .006, -.004 - f * .002, .004]), .0009); branches.push(tubeThrough([a, lerp(a, tip, .5), tip], R_NERVE * .7, R_NERVE * .4, 8, 8)); }
  meshes.set('Anterior gastric branches', merge(branches));

  // celiac plexus: the two celiac ganglia are joined in front of and behind the root of the celiac trunk, and strands follow the three branches of the trunk
  const gR = [0, 1, 2].map(a => V('Right celiac ganglion').reduce((s, p) => s + p[a], 0) / V('Right celiac ganglion').length), gL = [0, 1, 2].map(a => V('Left celiac ganglion').reduce((s, p) => s + p[a], 0) / V('Left celiac ganglion').length);
  const trunkV = V('Celiac trunk'), root = [0, 1, 2].map(a => trunkV.reduce((s, p) => s + p[a], 0) / trunkV.length), strands = [];
  strands.push(tubeThrough([gR, [gR[0] + .004, root[1] + .001, root[2] + .0085], add(root, [0, .0005, .0095]), [gL[0] - .004, root[1] + .001, root[2] + .0085], gL], R_NERVE, R_NERVE, 8, 8));
  strands.push(tubeThrough([gR, [gR[0] + .004, root[1] - .007, root[2] + .003], add(root, [0, -.008, .0025]), [gL[0] - .004, root[1] - .007, root[2] + .003], gL], R_NERVE * .9, R_NERVE * .9, 8, 8));
  // strands along the first part of each branch of the trunk: they follow the artery (its centre line by rings of equal distance from the trunk, lifted 1.5 mm off its axis
  // towards the top), so they never cut through the open space in front of the stomach
  const followArtery = (key, from, frac) => {
    const vs = V(key); let s0 = vs[0]; for (const p of vs) if (len(sub(p, from)) < len(sub(s0, from))) s0 = p;
    const d = vs.map(p => len(sub(p, s0))), dmax = Math.max(...d), pts = [];
    for (let k = 0; k <= 10; k++) { const lo = dmax * frac * k / 10, ring = vs.filter((p, i) => Math.abs(d[i] - lo) < .0025); if (ring.length) pts.push(add(mul(ring.reduce((a, p) => add(a, p), [0, 0, 0]), 1 / ring.length), [0, .0015, 0])); }
    return pts;
  };
  for (const [key, g] of [['Common hepatic artery', gR], ['Splenic artery', gL], ['Left gastric artery', lerp(gR, gL, .5)]]) {
    const along = followArtery(key, root, key === 'Left gastric artery' ? .35 : .5);
    strands.push(tubeThrough([g, ...along], R_NERVE * .75, R_NERVE * .6, 6, 8));
  }
  meshes.set('Celiac plexus', merge(strands));

  const tidyReport = tidy(meshes, surface, organs);
  for (const [key, m] of meshes) writer.addMesh(key, m.positions, m.indices);
  return {keys: [...meshes.keys()], tidy: tidyReport};
}

/**
 * Every piece of a vessel or nerve must end on something. A piece is a connected part of a mesh; its two ends are the vertices farthest apart. An end is attached when it lies
 * within ATTACH of a structure it can end on: a vessel on a vessel of its kind, the stomach wall or a neighbouring organ; a nerve on a nerve, ganglion, artery or organ.
 * An end may also be a cut end where the package stops (towards the chest, the liver, or below the pancreas). A piece with one attached end and the other one near the
 * stomach wall (or, for a vessel, near a vessel of its kind) gets a short connecting tube; a piece that still has a free end is dropped (fragments of the source meshes).
 */
const ATTACH = .0025, REACH_WALL = .010, REACH_VESSEL = .015, REACH_DRAIN = .02, NERVE_GAP = .003, KEEP_NERVE = .04;
// where the free end of these goes, when it is not already there: a vein into the vessel it drains to, an artery into the organ it supplies or out of the vessel it arises from
const DRAIN = {'Right gastro-omental vein': 'Superior mesenteric vein', 'Splenic artery': 'Spleen', 'Splenic vein': 'Spleen', 'Celiac trunk': 'Abdominal aorta', 'Posterior gastric vein': 'Stomach', 'Posterior gastric artery': 'Stomach'};
const KIND = key => /vein/i.test(key) ? 'vein' : /arter(y|ies)|trunk$|aorta/i.test(key) && !/vagal/i.test(key) ? 'artery' : /nerve|plexus|ganglion|vagal|branches/i.test(key) ? 'nerve' : 'organ';
const ORGANS = new Set(['Spleen', 'Pancreas', 'Duodenum', 'Esophagus']), meshesOrOrgan = k => ORGANS.has(k);
const cutEnd = p => p[1] > 1.25 || p[1] < 1.085 || (p[0] < -.012 && p[1] > 1.18);
function tidy(meshes, surface, organs) {
  const sample = m => { const out = [], n = m.positions.length / 3, step = Math.max(1, Math.floor(n / 1500)); for (let i = 0; i < n; i += step) out.push([m.positions[i * 3], m.positions[i * 3 + 1], m.positions[i * 3 + 2]]); return out; };
  const all = m => verticesOf(m);
  const S = new Map([...[...meshes].map(([k, m]) => [k, ORGANS.has(k) ? all(m) : sample(m)]), ...Object.entries(organs).map(([k, m]) => [k, all(m)])]), wall = all(surface);
  const near = (p, pts) => { let b = Infinity, q = null; for (const x of pts) { const d = len(sub(p, x)); if (d < b) { b = d; q = x; } } return [b, q]; };
  const can = (kind, other) => { const o = KIND(other); return o === 'organ' || (kind === 'nerve' ? o !== 'vein' : o === kind); };
  const report = [];
  for (const [key, m] of [...meshes]) {
    // ganglia are knots, not tubes with two ends, and the aorta is a short stretch cut at both ends on purpose (both stay targets)
    const kind = KIND(key); if (kind === 'organ' || /ganglion/i.test(key) || key === 'Abdominal aorta') continue;
    const pcs = splitPieces(m), keep = [];
    for (const pc of pcs) {
      const pts = verticesOf(pc); let a = pts[0], b = pts[0];
      for (let r = 0; r < 2; r++) { let far = a, fd = -1; for (const p of pts) { const d = len(sub(p, a)); if (d > fd) { fd = d; far = p; } } if (r === 0) a = far; else b = far; }
      const others = [...S].filter(([k]) => k !== key && can(kind, k)), siblings = pcs.filter(x => x !== pc).flatMap(verticesOf);
      // status of an end: ok (attached), net (attached to the network: a vessel of its kind, a nerve, ganglion, plexus or artery for a nerve, a sibling piece, or a cut end), to (a point to connect to)
      const netTargets = others.filter(([k]) => KIND(k) !== 'organ' && k !== 'Stomach' && !ORGANS.has(k));
      const status = e => {
        if (cutEnd(e)) return {ok: true, net: true};
        for (const [, pts2] of netTargets) if (near(e, pts2)[0] <= ATTACH) return {ok: true, net: true};
        if (siblings.length && near(e, siblings)[0] <= ATTACH) return {ok: true, net: true};
        for (const [k, m2] of meshes) if (k !== key && can(kind, k) && /aorta|vein$/i.test(k) && insideMesh(m2, e)) return {ok: true, net: true};
        // a vessel with a named target: a free end goes to that target (lying inside another organ does not count)
        if (DRAIN[key]) {
          const target = DRAIN[key] === 'Stomach' ? wall : S.get(DRAIN[key]), tm = DRAIN[key] === 'Stomach' ? null : (meshes.get(DRAIN[key]) ?? organs[DRAIN[key]]);
          if (near(e, target)[0] <= ATTACH || (tm && insideMesh(tm, e))) return {ok: true};
          const r = near(e, target); if (r[0] <= REACH_DRAIN) return {ok: false, to: r[1]};
          return {ok: false};
        }
        if (near(e, wall)[0] <= ATTACH) return {ok: true};
        for (const k of Object.keys(organs).concat([...ORGANS])) { const m2 = meshes.get(k) ?? organs[k]; if (m2 && (near(e, S.get(k))[0] <= ATTACH || insideMesh(m2, e))) return {ok: true}; }
        // otherwise, in this order: the stomach wall, a vessel of the same kind, another organ next to the stomach
        const [dw, qw] = near(e, wall); if (dw <= REACH_WALL) return {ok: false, to: qw};
        if (kind !== 'nerve') { let best = [Infinity, null]; for (const [k, pts2] of others) if (KIND(k) === kind) { const r = near(e, pts2); if (r[0] < best[0]) best = r; } if (best[0] <= REACH_VESSEL) return {ok: false, to: best[1], net: true}; }
        let bo = [Infinity, null]; for (const [k, pts2] of S) if (ORGANS.has(k)) { const r = near(e, pts2); if (r[0] < bo[0]) bo = r; }
        if (bo[0] <= REACH_WALL) return {ok: false, to: bo[1]};
        return {ok: false};
      };
      const sa = status(a), sb = status(b), radius = Math.max(.0004, ...[a, b].map(e => { const ring = pts.filter(p => len(sub(p, e)) < .002); const c = ring.reduce((s, p) => add(s, mul(p, 1 / ring.length)), [0, 0, 0]); return ring.reduce((s, p) => s + len(sub(p, c)), 0) / ring.length; }).filter(Number.isFinite).map(r => Math.min(r, .0016)));
      // a piece must reach the network at one end at least, and a piece shorter than 4 mm is a crumb of the source mesh
      // a nerve gets a connecting tube only across a gap of NERVE_GAP at most: a longer straight tube reads as a stick standing in the air, so such a branch is dropped instead
      const shortGap = st => st.ok || !st.to || kind !== 'nerve' || len(sub(st === sa ? a : b, st.to)) <= NERVE_GAP;
      const pieceLen = len(sub(a, b)), reachable = (sa.ok || sa.to) && (sb.ok || sb.to) && (sa.net || sb.net) && pieceLen >= .004 && shortGap(sa) && shortGap(sb);
      if (reachable && sa.ok && sb.ok) { keep.push(pc); continue; }
      if (reachable) {
        keep.push(pc);
        for (const [e, st] of [[a, sa], [b, sb]]) if (!st.ok) { keep.push(tubeThrough([e, lerp(e, st.to, .5), st.to], radius, radius * .85, 4, 8)); report.push(`${key}: connector ${(len(sub(e, st.to)) * 1e3).toFixed(1)} mm`); }
        continue;
      }
      // a long nerve (a trunk or a main branch of the source mesh) is kept as it is: its free end is a branch that ends next to the organ, not a fragment
      if (kind === 'nerve' && pieceLen >= KEEP_NERVE && (sa.net || sb.net)) { keep.push(pc); report.push(`${key}: kept a ${(pieceLen * 1e3).toFixed(0)} mm branch with a free end`); continue; }
      report.push(`${key}: dropped a piece of ${(pieceLen * 1e3).toFixed(1)} mm`); if (process.env.TIDY_DEBUG) console.log("DROP", key, a.map(x => (x * 1e3).toFixed(0)), JSON.stringify(sa), b.map(x => (x * 1e3).toFixed(0)), JSON.stringify(sb));
    }
    if (!keep.length) throw new Error(`tidy: nothing left of ${key}`);
    meshes.set(key, merge(keep));
  }
  if (process.env.TIDY_DEBUG) console.log(report.join('\n'));
  return report;
}
/** Connected pieces of a mesh (vertices at the same place welded). */
function splitPieces(m) {
  const n = m.positions.length / 3, key = i => `${Math.round(m.positions[i * 3] * 1e6)},${Math.round(m.positions[i * 3 + 1] * 1e6)},${Math.round(m.positions[i * 3 + 2] * 1e6)}`, ids = new Map(), w = new Int32Array(n);
  for (let i = 0; i < n; i++) { const k = key(i); if (!ids.has(k)) ids.set(k, ids.size); w[i] = ids.get(k); }
  const par = Int32Array.from({length: ids.size}, (_, i) => i), f = x => { while (par[x] !== x) x = par[x] = par[par[x]]; return x; };
  for (let t = 0; t < m.indices.length; t += 3) { const a = f(w[m.indices[t]]), b = f(w[m.indices[t + 1]]), c = f(w[m.indices[t + 2]]); par[b] = a; par[f(c)] = a; }
  const tris = new Map(); for (let t = 0; t < m.indices.length; t += 3) { const r = f(w[m.indices[t]]); if (!tris.has(r)) tris.set(r, []); tris.get(r).push(t); }
  return [...tris.values()].map(ts => {
    const map = new Map(), pos = [], idx = [];
    for (const t of ts) for (let k = 0; k < 3; k++) { const v = m.indices[t + k]; if (!map.has(v)) { map.set(v, map.size); pos.push(m.positions[v * 3], m.positions[v * 3 + 1], m.positions[v * 3 + 2]); } idx.push(map.get(v)); }
    return {positions: Float32Array.from(pos), indices: Uint32Array.from(idx)};
  });
}
