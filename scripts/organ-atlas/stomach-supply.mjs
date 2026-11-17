// Blood vessels, nerves and neighbouring organs of the stomach detail package.
//   - meshes copied from the atlas (BodyParts3D 4.0 vessels, Z-Anatomy vagus nerve, project-built sympathetic ganglia and splanchnic nerves): welded and written under the name of the structure;
//   - branches the atlas does not have, each built as one continuous tube along a smooth centre line (schematic): short gastric arteries and veins, posterior gastric artery and vein,
//     anterior vagal trunk with the anterior gastric branches, celiac plexus. Starts and ends are placed on the meshes that are really there (parent vessel, stomach surface, oesophagus).
import {weld, clipPlane, vertexNormals} from '../lib/organ-mesh.mjs';
import {add, sub, mul, lerp, len, unit, cross, verticesOf, extreme, nearest, nearestIndex, merge, tubeThrough, centreline, alongPolyline, insideMesh} from '../lib/organ-supply.mjs';

/** Parts copied from the atlas: [key, source, id or name, clip]. clip = keep y >= value (the vagus nerves continue far up the neck). */
export const COPIED = [
  ['Celiac trunk', 'atlas', 'FJ3421'], ['Common hepatic artery', 'atlas', 'FJ3078'], ['Proper hepatic artery', 'atlas', 'FJ3081'], ['Gastroduodenal artery', 'atlas', 'FJ3432'], ['Splenic artery', 'atlas', 'FJ3640'],
  ['Left gastric artery', 'atlas', 'FJ3499'], ['Right gastric artery', 'atlas', 'FJ3594'], ['Right gastro-epiploic artery', 'atlas', 'FJ3596'], ['Left gastro-epiploic artery', 'atlas', 'FJ3501'],
  ['Left gastric vein', 'atlas', 'FJ3500'], ['Right gastric vein', 'atlas', 'FJ3595'], ['Right gastro-epiploic vein', 'atlas', 'FJ3597'], ['Left gastro-epiploic vein', 'atlas', 'FJ3502'],
  ['Splenic vein', 'atlas', 'FJ3641'], ['Hepatic portal vein', 'atlas', 'FJ3082'], ['Superior mesenteric vein', 'atlas', 'FJ3647', 1.08],
  ['Right vagus nerve', 'nerve', 'Vagus nerve (X).r.001', 1.09, 1.35], ['Left vagus nerve', 'nerve', 'Vagus nerve (X).l.001', 1.09, 1.39],
  ['Esophageal plexus', 'paokao', 'Esophageal plexus'], ['Right celiac ganglion', 'paokao', 'Right celiac ganglion'], ['Left celiac ganglion', 'paokao', 'Left celiac ganglion'],
  ['Right greater splanchnic nerve', 'paokao', 'Right greater splanchnic nerve'], ['Left greater splanchnic nerve', 'paokao', 'Left greater splanchnic nerve'],
  ['Spleen', 'atlas', 'FJ2561'], ['Pancreas', 'atlas', 'FJ1895'],
  // related muscle shown with the organ: the diaphragm, whose left dome lies on the fundus and whose oesophageal hiatus the oesophagus passes through
  ['Diaphragm', 'atlas', 'FJ3131'],
];

export function buildSupply({writer, atlasPart, nervePart, paokaoPart, surface, lesser, greater}) {
  const src = {atlas: atlasPart, nerve: nervePart, paokao: paokaoPart}, meshes = new Map();
  for (const [key, kind, id, lo, hi] of COPIED) {
    let m = src[kind](id);
    if (lo !== undefined && kind === 'atlas') m = clipPlane(m.positions, m.indices, [0, -1, 0], -lo);
    if (kind === 'nerve') { m = clipPlane(m.positions, m.indices, [0, -1, 0], -lo); m = clipPlane(m.positions, m.indices, [0, 1, 0], hi); }
    m = weld(m.positions, m.indices, 1e-6); meshes.set(key, m);
  }
  const V = key => verticesOf(meshes.get(key)), sv = verticesOf(surface), sn = vertexNormals(surface.positions, surface.indices);
  const surfaceAt = i => ({p: sv[i], n: [sn[i * 3], sn[i * 3 + 1], sn[i * 3 + 2]]});
  /** A point on the stomach wall near p, lifted `lift` out of the surface along the normal. */
  const onWall = (p, lift = .0007) => { const {p: q, n} = surfaceAt(nearestIndex(sv, p)); return add(q, mul(n, lift)); };
  const wobble = (a, b, k, amp) => { const d = unit(sub(b, a)), side = unit(cross(d, [0, 1, 0])); return add(lerp(a, b, k), mul(side, amp)); };
  const R_ARTERY = .0011, R_VEIN = .0012, R_NERVE = .0007;

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
    meshes.set(key, tubeThrough([a0, lerp(a0, t, .35), lerp(a0, t, .7), t], r * .8, r * .5));
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
  for (const [key, g] of [['Common hepatic artery', gR], ['Splenic artery', gL], ['Left gastric artery', lerp(gR, gL, .5)]]) {
    const line = centreline(V(key), 16), p = alongPolyline(line, .55), q = add(root, mul(unit(sub(p, root)), .006));
    strands.push(tubeThrough([g, lerp(q, g, .35), add(p, [0, .0012, .0012])], R_NERVE * .75, R_NERVE * .6, 8, 8));
  }
  meshes.set('Celiac plexus', merge(strands));

  for (const [key, m] of meshes) writer.addMesh(key, m.positions, m.indices);
  return {keys: [...meshes.keys()]};
}
