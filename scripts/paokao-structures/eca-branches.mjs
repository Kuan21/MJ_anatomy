// Branches of the external carotid artery (batch A): superior thyroid, ascending pharyngeal, lingual, facial, occipital and posterior auricular arteries, left and right.
// The atlas has the external carotid artery as one tube and none of its branches. Each branch here is a round tube with wall thickness, schematic: its course follows the standard
// anatomical descriptions (Gray's Anatomy 1918, OpenStax Anatomy and Physiology) and is placed on landmarks measured on this atlas.
//
// Origin: derived from the external carotid artery as the viewer draws it (scripts/lib/eca-reference.mjs: the neck-vessel tube after the load-time raise of the bifurcation), at a fixed
// arc length from the bifurcation (ORIGIN_ARC, mm, docs/eca-branches.md). The first ring of every branch lies inside the lumen of the parent (centre moved a little towards the
// side the branch leaves), so the junction has no gap and the open end is never seen. Waypoints are given in millimetres for the left side and mirrored for the right:
//   [x, y, z]                       absolute point
//   {e: arc, off: [dx, dy, dz]}     external carotid centre line at `arc` mm plus an offset
//   {on: 'Mesh', near: [x,y,z], off}  point on the surface of an atlas mesh nearest to `near`, moved `off` mm outwards ('%' stands for Left/Right)
//   {skin: [x, y], depth, dir}      under the skin: dir 'front' (+z) or 'back' (-z), `depth` mm below the skin surface
// Hard structures (bones, laryngeal cartilages) are never entered: the path is pushed out of them (wall clearance MARGIN), then smoothed, and the pushing is repeated.
import {sub, add, mul, unit, len, dot, cross} from '../lib/paokao-util.mjs';
import {closest} from '../lib/heart-geom.mjs';
import {externalCarotid} from '../lib/eca-reference.mjs';

const ECA = await externalCarotid();
const SIDES = [{w: 'Left', l: 'left', sx: 1, zh: '左', s: 'l', ref: ECA.left}, {w: 'Right', l: 'right', sx: -1, zh: '右', s: 'r', ref: ECA.right}];
export const MARGIN = .0004, STEP = .0007, SIDES_OF_TUBE = 12;

/** Where each branch leaves the external carotid artery: arc length (mm) from the bifurcation, and the direction (left side, x mirrored) in which the origin is moved towards the wall. */
export const ORIGINS = {
  'superior thyroid artery': {arc: 3, wall: [-.4, -.15, .9]},
  'ascending pharyngeal artery': {arc: 5, wall: [-.75, 0, -.55]},
  'lingual artery': {arc: 12, wall: [-.5, .25, .85]},
  'facial artery': {arc: 17, wall: [.1, .4, .9]},
  'occipital artery': {arc: 18, wall: [.8, .1, -.5]},
  'posterior auricular artery': {arc: 56, wall: [.3, .3, -.9]},
};

const SOLIDS = S => ['Mandible', 'Hyoid bone', 'Thyroid cartilage', 'Cricoid cartilage', 'Occipital bone', `${S.w} temporal bone`, `${S.w} maxilla`, `${S.w} zygomatic bone`, `${S.w} nasal bone`, `${S.w} lacrimal bone`, `${S.w} palatine bone`, 'Atlas', 'Axis', 'Third cervical vertebra'];

/** Branch specs: name, Chinese name, radii (mm) at the origin and at the end, the waypoints after the origin and the card text. */
export const BRANCHES = [
  {key: 'superior thyroid artery', en: 'superior thyroid artery', zh: '甲狀腺上動脈', r: [1.25, .7],
    pts: [[35.6, 1497, 3], [32.5, 1494, 12], [27, 1490, 16], [23, 1482, 13], [21, 1475, 12.5]],
    card: {origin: ['External carotid artery, just above the carotid bifurcation and below the greater horn of the hyoid bone', '頸外動脈起始段，頸動脈分叉稍上方、舌骨大角下方'],
      course: ['Arches forward and downwards beside the thyroid cartilage, under the infrahyoid muscles, to the upper pole of the thyroid gland', '向前下呈弧形，沿甲狀軟骨外側、在舌骨下肌群深面行至甲狀腺上極'],
      supply: ['Upper part of the thyroid gland; gives the superior laryngeal artery to the larynx', '甲狀腺上部；並發出上喉動脈供應喉部']}},
  {key: 'ascending pharyngeal artery', en: 'ascending pharyngeal artery', zh: '咽升動脈', r: [.95, .5],
    pts: [[27.5, 1506, -4.5], [24.5, 1520, -6], [22.5, 1538, -7], [20.5, 1553, -8]],
    card: {origin: ['Medial (deep) side of the external carotid artery, close to its beginning', '頸外動脈內側（深側），靠近起始處'],
      course: ['Ascends on the side wall of the pharynx, medial to the internal carotid artery, towards the base of the skull', '沿咽側壁上行，位於頸內動脈內側，朝顱底走'],
      supply: ['Pharyngeal wall, soft palate, tonsil and the prevertebral muscles; meningeal twigs to the base of the skull', '咽壁、軟顎、扁桃體與椎前肌；並有細支到顱底腦膜']}},
  {key: 'lingual artery', en: 'lingual artery', zh: '舌動脈', r: [1.45, .85],
    pts: [[28.5, 1514, 5], [22.5, 1521.5, 8], [16, 1520, 17], [10.5, 1521, 28], [7, 1525, 40], [5.5, 1529, 49]],
    card: {origin: ['Front of the external carotid artery, at about the level of the greater horn of the hyoid bone', '頸外動脈前面，約在舌骨大角高度'],
      course: ['Loops upward above the greater horn of the hyoid, then runs forward deep to hyoglossus into the tongue', '先在舌骨大角上方向上彎，再沿舌骨舌肌深面向前進入舌'],
      supply: ['Tongue, floor of the mouth and the sublingual gland', '舌、口腔底與舌下腺']}},
  {key: 'facial artery', en: 'facial artery', zh: '顏面動脈', r: [1.6, .7],
    pts: [[33.5, 1521, 5], [30, 1527, 10], [23, 1530, 22], [22.5, 1522, 36],
      {on: 'Mandible', near: [20, 1504, 46], off: 2.4}, {skin: [27, 1520], depth: 8, dir: 'front'}, {skin: [28, 1535], depth: 7, dir: 'front'}, {skin: [21, 1553], depth: 7, dir: 'front'}, {skin: [16, 1571], depth: 7, dir: 'front'}, {skin: [15, 1586], depth: 6, dir: 'front'}],
    card: {origin: ['External carotid artery, just above the lingual artery', '頸外動脈，舌動脈起點稍上方'],
      course: ['Passes deep to the posterior belly of digastric and the submandibular gland, turns over the lower border of the mandible at the front of masseter, then climbs the face beside the mouth and nose to the medial angle of the eye', '經二腹肌後腹與下頜下腺深面，在咬肌前緣繞過下頜骨下緣，沿口與鼻旁上行至內眼角'],
      supply: ['Submandibular gland, tonsil, lips, nose and the face', '下頜下腺、扁桃體、唇、鼻與面部']}},
  {key: 'occipital artery', en: 'occipital artery', zh: '枕動脈', r: [1.25, .6],
    pts: [[40, 1521, -5.5], [42, 1530, -10], [42, 1541, -14], [43, 1553, -24], [40, 1557, -40], [38, 1558.5, -60], [37, 1563, -72], {skin: [36, 1572], depth: 4.5, dir: 'back'},
      {skin: [33.5, 1583], depth: 5.5, dir: 'back'}, {skin: [31, 1596], depth: 3.5, dir: 'back'}, {skin: [26, 1616], depth: 3.5, dir: 'back'}, {skin: [22, 1634], depth: 3.5, dir: 'back'}],
    card: {origin: ['Back of the external carotid artery, at about the level of the facial artery', '頸外動脈後面，約與顏面動脈同高'],
      course: ['Runs backward along the lower border of the posterior belly of digastric, in the groove medial to the mastoid process, then up through the neck muscles into the scalp at the back of the head', '沿二腹肌後腹下緣向後，經乳突內側的溝，穿過頸部肌肉上行入後頭部頭皮'],
      supply: ['Scalp of the back of the head, sternocleidomastoid and the muscles at the back of the neck', '後頭部頭皮、胸鎖乳突肌與後頸肌群']}},
  {key: 'posterior auricular artery', en: 'posterior auricular artery', zh: '耳後動脈', r: [1.0, .5],
    pts: [[44.5, 1558, -12.5], {on: '% temporal bone', near: [52, 1566, -18], off: 2.2}, {on: '% temporal bone', near: [57, 1575, -24], off: 2.2}, {on: '% temporal bone', near: [60, 1584, -28], off: 2.2}],
    card: {origin: ['Back of the external carotid artery, above the digastric and stylohyoid muscles, within the parotid gland region', '頸外動脈後面，二腹肌與莖突舌骨肌上方，靠近腮腺區'],
      course: ['Runs up and backward along the styloid process and over the mastoid process into the groove behind the auricle', '沿莖突向上後行，越過乳突，進入耳廓後方的溝'],
      supply: ['Skin behind the ear and over the mastoid, the auricle and the scalp above it', '耳後與乳突部皮膚、耳廓及其上方頭皮']}},
];

const mirror = (p, sx) => [p[0] * sx, p[1], p[2]];
const side = (name, S) => name.replace('%', S.w);

/** Catmull-Rom path through the points, resampled about every STEP metres. */
export function spline(P, step = STEP) {
  const n = P.length, at = i => P[Math.max(0, Math.min(n - 1, i))], out = [];
  for (let s = 0; s < n - 1; s++) {
    const m = Math.max(2, Math.ceil(len(sub(P[s + 1], P[s])) / step));
    for (let k = 0; k < m; k++) { const t = k / m, p0 = at(s - 1), p1 = at(s), p2 = at(s + 1), p3 = at(s + 2); out.push([0, 1, 2].map(a => .5 * ((2 * p1[a]) + (-p0[a] + p2[a]) * t + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t * t + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t ** 3))); }
  }
  out.push(P[n - 1]); return out;
}
/** Radius along a path of n points: linear taper, and a rounded end (the last `cap` points shrink as a quarter circle). */
const radiusAt = (r0, r1, n, i) => { const t = i / (n - 1), base = r0 + (r1 - r0) * t, cap = 4, k = n - 1 - i; return k < cap ? base * Math.sqrt(Math.max(0, 1 - ((cap - k) / cap) ** 2)) : base; };

/** True when p lies inside the closed mesh: parity of the crossings of a ray (the stored normals of some bones are not reliable, so they are not used for this). */
export function inside(mesh, p) {
  if (p.some((v, k) => v < mesh.lo[k] || v > mesh.hi[k])) return false;
  const d = [.0123, 1, .0071]; let hits = 0;
  for (const t of mesh.tris) {
    const e1 = sub(t.b, t.a), e2 = sub(t.c, t.a), h = cross(d, e2), det = dot(e1, h); if (Math.abs(det) < 1e-14) continue;
    const f = 1 / det, sv = sub(p, t.a), u = f * dot(sv, h); if (u < 0 || u > 1) continue;
    const q = cross(sv, e1), v = f * dot(d, q); if (v < 0 || u + v > 1) continue;
    if (f * dot(e2, q) > 0) hits++;
  }
  return hits % 2 === 1;
}
/** Distance from p to the surface of a mesh, negative when p is inside it (the inside test only runs near the surface). */
export function signedDistance(mesh, p, near = .004) { const c = closest(mesh, p); if (!c) return Infinity; return c.d < near && inside(mesh, p) ? -c.d : c.d; }

/** Distance from p to the bounding box of a mesh (0 inside): a cheap reason to skip a solid that is far away. */
const boxDistance = (m, p) => Math.hypot(...[0, 1, 2].map(k => Math.max(m.lo[k] - p[k], 0, p[k] - m.hi[k])));

export function relax(U, path, r0, r1, solids, {iterations = 60, fixed = 1, stepCap = .0005} = {}) {
  const meshes = solids.filter(n => U.has(n)).map(n => U.mesh(n)), n = path.length, P = path.map(p => [...p]);
  // each pass moves a point at most `stepCap` towards where it is clear of every solid (so a path never jumps over a thin feature), then smooths the path a little
  const push = (i, cap) => {
    const need = radiusAt(r0, r1, n, i) + MARGIN;
    for (const m of meshes) {
      if (boxDistance(m, P[i]) >= need) continue;
      const c = closest(m, P[i]); if (!c || c.d >= need) continue;
      const dir = c.d > 1e-7 ? unit(sub(P[i], c.point)) : c.normal;
      const target = inside(m, P[i]) ? add(c.point, mul(unit(sub(c.point, P[i])), need)) : add(c.point, mul(dir, need));
      const move = sub(target, P[i]), l = len(move);
      P[i] = add(P[i], l > cap ? mul(move, cap / l) : move);
    }
  };
  for (let it = 0; it < iterations; it++) {
    for (let i = fixed; i < n - 1; i++) push(i, stepCap);
    for (let i = fixed + 1; i < n - 2; i++) P[i] = add(mul(P[i], .6), mul(add(P[i - 1], P[i + 1]), .2));
  }
  for (let it = 0; it < 12; it++) for (let i = fixed; i < n - 1; i++) push(i, stepCap);   // last: push only, so the result is clear of the solids
  return P;
}

/** Round tube with a varying radius and rounded ends, built on a transported frame. */
export function roundTube(path, r0, r1, sides = SIDES_OF_TUBE) {
  const n = path.length, positions = [], indices = [], norm = unit;
  let prevUp = null;
  for (let i = 0; i < n; i++) {
    const a = path[Math.max(0, i - 1)], b = path[Math.min(n - 1, i + 1)], tan = norm(sub(b, a));
    let up = prevUp ?? (Math.abs(tan[1]) < .9 ? [0, 1, 0] : [1, 0, 0]);
    const sd = norm(cross(tan, up)); up = norm(cross(sd, tan)); prevUp = up;
    const r1s = radiusAt(r0, r1, n, i);
    for (let j = 0; j < sides; j++) { const ang = j / sides * Math.PI * 2, c = Math.cos(ang) * r1s, s = Math.sin(ang) * r1s; positions.push(path[i][0] + sd[0] * c + up[0] * s, path[i][1] + sd[1] * c + up[1] * s, path[i][2] + sd[2] * c + up[2] * s); }
  }
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < sides; j++) { const a = i * sides + j, b = i * sides + (j + 1) % sides, c = (i + 1) * sides + j, d = (i + 1) * sides + (j + 1) % sides; indices.push(a, c, b, b, c, d); }
  // flat caps (the end cap is a fan on the last, almost zero, ring; the origin cap lies inside the parent)
  for (const [ring, flip] of [[0, false], [n - 1, true]]) { const centre = positions.length / 3, p = path[ring]; positions.push(...p); for (let j = 0; j < sides; j++) { const a = ring * sides + j, b = ring * sides + (j + 1) % sides; indices.push(...(flip ? [centre, a, b] : [centre, b, a])); } }
  return {positions: new Float32Array(positions), indices: new Uint32Array(indices)};
}

/** Resolve the waypoints of one branch on one side to metres. Returns {origin, pts} where origin is the centre of the first ring. */
export function resolve(U, S, def) {
  const o = ORIGINS[def.key], ref = S.ref.at(o.arc / 1000), wall = unit(mirror(o.wall, S.sx));
  const origin = add(ref.c, mul(wall, ref.r * .55));
  const pts = def.pts.map(p => {
    if (Array.isArray(p)) return mirror(p, S.sx).map(v => v / 1000);
    if (p.e !== undefined) { const q = S.ref.at(p.e / 1000); return add(q.c, mul(mirror(p.off, S.sx), .001)); }
    if (p.on) return U.onSurface(side(p.on, S), mirror(p.near, S.sx).map(v => v / 1000), p.off / 1000);
    if (p.skin) {
      const [x, y] = [p.skin[0] * S.sx / 1000, p.skin[1] / 1000], d = p.dir === 'back' ? [0, 0, 1] : [0, 0, -1], o2 = p.dir === 'back' ? [x, y, -.4] : [x, y, .4];
      const h = U.rayHit('Skin', o2, d); if (!h) throw new Error(`eca-branches: no skin at ${JSON.stringify(p)}`);
      return p.dir === 'back' ? [h.point[0], h.point[1], h.point[2] + p.depth / 1000] : [h.point[0], h.point[1], h.point[2] - p.depth / 1000];
    }
    throw new Error('eca-branches: bad waypoint');
  });
  return {origin, pts};
}

export default function ecaBranches(U) {
  const out = [];
  for (const S of SIDES) for (const def of BRANCHES) {
    const {origin, pts} = resolve(U, S, def), r0 = def.r[0] / 1000, r1 = def.r[1] / 1000;
    const dense = spline([origin, ...pts]), path = relax(U, dense, r0, r1, SOLIDS(S));
    out.push({
      name: `${S.w} ${def.en}`, zh: `${S.zh}${def.zh}`, system: 'arterial', kind: 'artery', parent: `External carotid artery.${S.s}`,
      geometry: [roundTube(path, r0, r1)], cap: 1e9, card: def.card, refs: [],
      note: ['Schematic vessel: its course follows the standard description, and it starts from the external carotid artery as drawn here; calibre and small twigs are typical values.', '示意血管：走向依標準解剖描述，由本站的頸外動脈處發出；管徑為典型值，未畫出細小分支。'],
    });
  }
  return out;
}
