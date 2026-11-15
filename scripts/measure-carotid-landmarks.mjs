// Read-only measurement: where the carotid bifurcation sits relative to the laryngeal, hyoid, mandibular and cervical-vertebral landmarks of the same model.
//   node scripts/measure-carotid-landmarks.mjs [--json=<file>] [--md] [--raw]
//   --raw   measure the source tubes as stored (before the viewer's load-time raise and rebuild of the bifurcation, app/biomechanics-v2/carotid-bifurcation.ts); default: as the viewer draws them
// Reads public/models/atlas.json (+ streams) and public/models/neck-vessels.json.gz only; writes nothing unless --json is given.
// Coordinates: metres in the viewer's rest frame, y up, x positive = Left, z positive = anterior. Output heights are mm (y x 1000).
// Every number comes from vertices of the meshes; nothing is estimated.
import fs from 'node:fs';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {quizModule} from './quiz-modules.mjs';
const arg = n => process.argv.find(a => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const root = new URL('../', import.meta.url);
const {atlas, geometry} = loadFullAtlas();
const part = (name, id) => atlas.parts.find(p => (id ? p.id === id : p.name === name));
const verts = p => { const g = geometry(p), P = g.positions, out = []; for (let i = 0; i < P.length; i += 3) out.push([P[i] * 1e3, P[i + 1] * 1e3, P[i + 2] * 1e3]); return out; };
const maxY = vs => vs.length ? Math.max(...vs.map(v => v[1])) : NaN;
const minY = vs => vs.length ? Math.min(...vs.map(v => v[1])) : NaN;
const r1 = x => Number.isFinite(x) ? +x.toFixed(1) : null;
const SIDES = [['Left', 1], ['Right', -1]];   // sign of x
const onSide = (vs, s) => vs.filter(v => v[0] * s > 0);

// --- vertebrae: anterior face of the body (front 4 mm of the vertices within 10 mm of the midline) ---
const VERT = [['C2 (Axis)', 'FJ3177'], ['C3', 'FJ3161'], ['C4', 'FJ3164'], ['C5', 'FJ3167'], ['C6', 'FJ3170']];
const body = {};
for (const [label, id] of VERT) {
  const vs = verts(part(null, id)), mid = vs.filter(v => Math.abs(v[0]) < 10), zmax = Math.max(...mid.map(v => v[2])), face = mid.filter(v => v[2] > zmax - 4);
  body[label] = {top: maxY(face), bottom: minY(face), mid: (maxY(face) + minY(face)) / 2, front: zmax};
}
const disc = id => { const vs = verts(part(null, id)); return {top: maxY(vs), bottom: minY(vs)}; };
const discs = {'C2-C3': disc('FJ3202'), 'C3-C4': disc('FJ3213'), 'C4-C5': disc('FJ3218'), 'C5-C6': disc('FJ3219')};
// which vertebral level a height falls in (body ranges, then the gap below it = the disc)
function level(y) {
  const names = VERT.map(v => v[0]);
  for (let i = 0; i < names.length; i++) { const b = body[names[i]]; if (y <= b.top && y >= b.bottom) return `${names[i].split(' ')[0]} 椎體`; }
  for (let i = 0; i < names.length - 1; i++) { const a = body[names[i]], b = body[names[i + 1]]; if (y < a.bottom && y > b.top) return `${names[i].split(' ')[0]}-${names[i + 1].split(' ')[0]} 椎間`; }
  return y > body['C2 (Axis)'].top ? '高於 C2 椎體前面' : '低於 C6 椎體';
}

// --- larynx and hyoid ---
const lm = {};
const hy = verts(part(null, 'FJ2772')), th = verts(part(null, 'FJ2808')), cr = verts(part(null, 'FJ2440')), md = verts(part(null, 'FJ3289'));
for (const [side, s] of SIDES) {
  const o = {};
  const h = onSide(hy, s), tc = onSide(th, s), mn = onSide(md, s);
  // hyoid: body = within 8 mm of midline (both sides share it, so measured on the whole bone), greater horn = beyond 14 mm, tip = outermost 3 mm
  const hb = hy.filter(v => Math.abs(v[0]) < 8), gh = h.filter(v => Math.abs(v[0]) >= 14), xmax = Math.max(...gh.map(v => Math.abs(v[0]))), tip = gh.filter(v => Math.abs(v[0]) > xmax - 3), lh = h.filter(v => Math.abs(v[0]) >= 6 && Math.abs(v[0]) < 14);
  o.hyoidBodyTop = maxY(hb); o.hyoidBodyBottom = minY(hb); o.hyoidBodyMid = (o.hyoidBodyTop + o.hyoidBodyBottom) / 2;
  o.hyoidGreaterHornTip = (maxY(tip) + minY(tip)) / 2; o.hyoidGreaterHornTop = maxY(gh); o.hyoidGreaterHornBottom = minY(gh); o.hyoidLesserRegionTop = maxY(lh);
  // thyroid cartilage: absolute top (superior horn), upper border of the lamina (anterior, away from the horn), thyroid notch (midline), lower border
  o.thyroidTop = maxY(tc); o.thyroidLaminaUpper = maxY(tc.filter(v => v[2] > 0 && Math.abs(v[0]) > 4)); o.thyroidNotch = maxY(th.filter(v => Math.abs(v[0]) < 3 && v[2] > 0)); o.thyroidBottom = minY(tc);
  // cricoid: arch = anterior part (z > 3 mm, within 4 mm of midline); lamina top = highest point of the whole ring
  const arch = cr.filter(v => v[2] > 3 && Math.abs(v[0]) < 4); o.cricoidArchTop = maxY(arch); o.cricoidArchBottom = minY(arch); o.cricoidArchMid = (maxY(arch) + minY(arch)) / 2; o.cricoidLaminaTop = maxY(cr); o.cricoidBottom = minY(cr);
  // mandible: lower border (lowest point on this side) and the angle (posterior-inferior corner: vertex minimising y + z among lateral vertices)
  const lat = mn.filter(v => Math.abs(v[0]) > 25); let ang = lat[0]; for (const v of lat) if (v[1] + v[2] < ang[1] + ang[2]) ang = v;
  o.mandibleLowerBorder = minY(mn); o.mandibleAngle = ang[1];
  lm[side] = o;
}

// --- vessels (neck-vessels.json.gz is the registered Z-Anatomy tube set the viewer draws) ---
const nv = JSON.parse(zlib.gunzipSync(fs.readFileSync(fileURLToPath(new URL('public/models/neck-vessels.json.gz', root))))), R = 12;
if (!process.argv.includes('--raw')) (await quizModule('app/biomechanics-v2/carotid-bifurcation.ts')).smoothCarotids(nv.vessels);
const vessel = n => nv.vessels.find(v => v.name === n);
const ring = (v, r) => Array.from({length: R}, (_, k) => [0, 1, 2].map(a => v.positions[(r * R + k) * 3 + a] * 1e3));
const ctr = pts => [0, 1, 2].map(a => pts.reduce((s, p) => s + p[a], 0) / pts.length);
const rad = (pts, c) => pts.reduce((s, p) => s + Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]), 0) / pts.length;
const centres = v => Array.from({length: v.positions.length / (R * 3)}, (_, r) => { const p = ring(v, r), c = ctr(p); return {c, r: rad(p, c)}; });
const vess = {}, sepAll = {};
for (const [side, , tag] of [['Left', 1, 'l'], ['Right', -1, 'r']]) {
  const cca = vessel(`${side} common carotid artery`), ica = vessel(`Internal carotid artery.${tag}`), eca = vessel(`External carotid artery.${tag}`);
  const cc = centres(cca), ci = centres(ica), ce = centres(eca);
  const top = cc.reduce((a, b) => b.c[1] > a.c[1] ? b : a);
  // divergence: first height (walking up the ICA) at which the ICA and ECA centre lines are further apart than the sum of their radii at the same height
  const at = (cs, y) => cs.reduce((a, b) => Math.abs(b.c[1] - y) < Math.abs(a.c[1] - y) ? b : a);
  let diverge = NaN; for (const q of ci) { const e = at(ce, q.c[1]); if (Math.hypot(q.c[0] - e.c[0], q.c[1] - e.c[1], q.c[2] - e.c[2]) > q.r + e.r) { diverge = q.c[1]; break; } }
  // centre-line separation of ICA and ECA (mm) at fixed heights above the common-artery end
  const sep = {}; for (const dy of [5, 10, 20, 30, 40]) { const y = top.c[1] + dy, a = at(ci, y), e = at(ce, y); sep[dy] = r1(Math.hypot(a.c[0] - e.c[0], a.c[1] - e.c[1], a.c[2] - e.c[2])); }
  sepAll[side] = sep;
  vess[side] = {commonEndCentre: top.c[1], icaStartCentre: ci[0].c[1], ecaStartCentre: ce[0].c[1], divergeApex: diverge, icaTop: Math.max(...ci.map(q => q.c[1])), ecaTop: Math.max(...ce.map(q => q.c[1])), commonBottom: Math.min(...cc.map(q => q.c[1]))};
}
// BodyParts3D's own common carotid (the replaced original): top end, for reference
const bp3d = {Left: part(null, 'FJ3483'), Right: part(null, 'FJ3564')};
for (const [side] of SIDES) vess[side].bp3dCommonTop = bp3d[side].bounds[1][1] * 1e3;

// --- branch origins of the external carotid artery: look for any mesh carrying the branch names ---
const BRANCH = /superior thyroid a|lingual a|facial a|occipital artery|ascending pharyngeal|maxillary a|superficial temporal a|posterior auricular a/i;
const hits = [...atlas.parts.filter(p => BRANCH.test(p.name) && !/lateral occipital|medial occipital|branch of/i.test(p.name)).map(p => p.name), ...nv.vessels.filter(v => BRANCH.test(v.name)).map(v => v.name)];

// --- derived distances (mm; positive = bifurcation lower than the landmark) ---
const out = {sides: {}, branchMeshes: hits, bodies: Object.fromEntries(Object.entries(body).map(([k, b]) => [k, {top: r1(b.top), bottom: r1(b.bottom), mid: r1(b.mid)}])), discs: Object.fromEntries(Object.entries(discs).map(([k, d]) => [k, {top: r1(d.top), bottom: r1(d.bottom)}]))};
for (const [side] of SIDES) {
  const L = lm[side], V = vess[side], b = V.commonEndCentre, dist = {};
  const rel = (name, y) => { dist[name] = r1(y - b); };   // landmark above bifurcation = positive
  rel('thyroidTop', L.thyroidTop); rel('thyroidLaminaUpper', L.thyroidLaminaUpper); rel('thyroidNotch', L.thyroidNotch); rel('hyoidBodyMid', L.hyoidBodyMid); rel('hyoidGreaterHornTip', L.hyoidGreaterHornTip); rel('hyoidGreaterHornTop', L.hyoidGreaterHornTop);
  rel('cricoidArchMid', L.cricoidArchMid); rel('C3mid', body.C3.mid); rel('C4mid', body['C4'].mid); rel('C5mid', body.C5.mid); rel('mandibleAngle', L.mandibleAngle); rel('mandibleLowerBorder', L.mandibleLowerBorder);
  out.sides[side] = {landmarks: Object.fromEntries(Object.entries(L).map(([k, v]) => [k, {y: r1(v), level: level(v)}])), vessels: Object.fromEntries(Object.entries(V).map(([k, v]) => [k, {y: r1(v), level: level(v)}])), landmarkAboveBifurcation: dist};
}
out.separationMm = Object.fromEntries(SIDES.map(([side]) => [side, sepAll[side]]));
// gap between the back of the larynx / hyoid and the front of the vertebral body behind it (mm, from vertices; negative = overlap)
const zmin = vs => Math.min(...vs.map(v => v[2]));
out.gapToSpineMm = {hyoidToC3: r1(zmin(hy) - body.C3.front), thyroidToC4: r1(zmin(th) - body.C4.front), cricoidToC5: r1(zmin(cr) - body.C5.front), cricoidToC6: r1(zmin(cr) - body.C6.front)};
if (arg('json')) fs.writeFileSync(arg('json'), JSON.stringify(out, null, 1));
if (process.argv.includes('--md')) {
  console.log('| 標誌 | 左 y (mm) | 左 椎體水平 | 右 y (mm) | 右 椎體水平 |\n|---|---|---|---|---|');
  const keys = ['mandibleAngle', 'mandibleLowerBorder', 'hyoidBodyTop', 'hyoidBodyMid', 'hyoidBodyBottom', 'hyoidGreaterHornTop', 'hyoidGreaterHornTip', 'hyoidGreaterHornBottom', 'hyoidLesserRegionTop', 'thyroidTop', 'thyroidLaminaUpper', 'thyroidNotch', 'thyroidBottom', 'cricoidLaminaTop', 'cricoidArchTop', 'cricoidArchMid', 'cricoidArchBottom', 'cricoidBottom'];
  for (const k of keys) console.log(`| ${k} | ${out.sides.Left.landmarks[k].y} | ${out.sides.Left.landmarks[k].level} | ${out.sides.Right.landmarks[k].y} | ${out.sides.Right.landmarks[k].level} |`);
  for (const k of Object.keys(out.sides.Left.vessels)) console.log(`| ${k} | ${out.sides.Left.vessels[k].y} | ${out.sides.Left.vessels[k].level} | ${out.sides.Right.vessels[k].y} | ${out.sides.Right.vessels[k].level} |`);
  console.log('\n椎體前面 (mm):'); for (const [k, v] of Object.entries(out.bodies)) console.log(`| ${k} | ${v.bottom} | ${v.mid} | ${v.top} |`);
  console.log('\n椎間盤 (mm):'); for (const [k, v] of Object.entries(out.discs)) console.log(`| ${k} | ${v.bottom} | ${v.top} |`);
  console.log('\n標誌高於分叉點 (mm，以頸總動脈末端環中心為分叉):'); for (const k of Object.keys(out.sides.Left.landmarkAboveBifurcation)) console.log(`| ${k} | ${out.sides.Left.landmarkAboveBifurcation[k]} | ${out.sides.Right.landmarkAboveBifurcation[k]} |`);
  console.log('\nICA/ECA 中心線距離 (mm，分叉點以上 5/10/20/30/40 mm)：', JSON.stringify(out.separationMm));
  console.log('喉／舌骨後緣到椎體前面 (mm)：', JSON.stringify(out.gapToSpineMm));
  console.log('\n頸外動脈分支網格：', hits.length ? hits.join('、') : '無');
} else console.log(JSON.stringify(out, null, 1));
