// Retropharyngeal space (schematic, user decision 2026-11-21): a thin translucent layer behind the posterior wall of the pharynx, about 2 mm thick, from the skull base down to about C6
// (the start of the oesophagus), laterally up to the medial side of the carotid sheath. Nothing is moved: the front face of the layer lies 1.5 mm behind the back surface of the pharynx as it is now (found
// by rays from behind; the shells of the constrictors are coarse) and the layer extends 2 mm further backwards (where the pharynx already overlaps the prevertebral muscles, so does the layer; scripts/measure-retropharyngeal-space.mjs lists it).
import {sub, add, mul, len} from '../lib/paokao-util.mjs';
import {ray} from '../lib/heart-geom.mjs';

export const PHARYNX = ['Pharyngeal raphe', 'Left inferior pharyngeal constrictor', 'Right inferior pharyngeal constrictor', 'Left middle pharyngeal constrictor', 'Right middle pharyngeal constrictor', 'Left superior pharyngeal constrictor', 'Right superior pharyngeal constrictor'];
export const SHEATH = ['Left common carotid artery', 'Right common carotid artery', 'Left internal jugular vein', 'Right internal jugular vein', 'Left internal carotid artery', 'Right internal carotid artery'];
export const THICK = .002, FRONT_GAP = .0015;
// Structures the layer must not enter (by more than 0.3 mm) unless the back wall of the pharynx is already inside them: where it would, the layer is made thinner there.
export const AVOID = ['Third cervical vertebra', 'Fourth cervical vertebra', 'Fifth cervical vertebra', 'Sixth cervical vertebra', 'Seventh cervical vertebra', 'Axis', 'Intervertebral disk of axis', 'Intervertebral disk of third cervical vertebra', 'Intervertebral disk of fourth cervical vertebra', 'Intervertebral disk of fifth cervical vertebra', 'Intervertebral disk of sixth cervical vertebra',
  'Left longus capitis', 'Right longus capitis', 'Superior oblique part of left longus colli', 'Superior oblique part of right longus colli', 'Vertical intermediate part of left longus colli', 'Vertical intermediate part of right longus colli', 'Left stylopharyngeus', 'Right stylopharyngeus', 'Left palatopharyngeus', 'Right palatopharyngeus', 'Hyoid bone', 'Thyroid cartilage', 'Cricoid cartilage', 'Occipital bone',
  'Left internal carotid artery', 'Right internal carotid artery', 'Left internal jugular vein', 'Right internal jugular vein', 'Left common carotid artery', 'Right common carotid artery', 'Esophagus', 'Trachea'];
const inside = (m, p) => { const votes = [0, .0002, -.0002].map(dy => { let c = 0, from = [p[0], p[1] + dy, p[2]]; for (let k = 0; k < 12; k++) { const h = ray(m, from, [1, 0, 0]); if (!h) break; c++; from = [h.point[0] + 1e-6, from[1], from[2]]; } return c % 2; }); return votes.reduce((a, b) => a + b, 0) >= 2; };

/** The layer as {positions, indices}; `U` is the paokao util. */
export function retropharyngealLayer(U, {top = 1.576, bottom = 1.466, half = .021, dx = .0025, dy = .003, avoid: avoidNames = AVOID} = {}) {
  const names = PHARYNX.filter(n => U.has(n)), sheath = SHEATH.filter(n => U.has(n));
  const nx = Math.round(2 * half / dx), ny = Math.round((top - bottom) / dy), z = [], ok = [];
  const hitZ = (x, y) => { let best = null; for (const n of names) { const h = U.rayHit(n, [x, y, -.06], [0, 0, 1]); if (h && (best === null || h.point[2] < best)) best = h.point[2]; } return best; };
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) { const x = -half + i * dx, y = top - j * dy, h = hitZ(x, y); z.push(h); ok.push(h !== null); }
  const id = (i, j) => j * (nx + 1) + i;
  // drop points that are within 1.5 mm of the carotid sheath (the layer ends at its medial side)
  const near = (p) => sheath.some(n => U.dist(n, p) < .0015);
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) if (ok[id(i, j)] && near([-half + i * dx, top - j * dy, z[id(i, j)] - THICK / 2])) ok[id(i, j)] = false;
  // smooth the front surface (the shells of the constrictors are coarse): three passes over valid neighbours
  let cur = z.slice();
  for (let pass = 0; pass < 3; pass++) cur = cur.map((v, k) => { if (!ok[k]) return v; const i = k % (nx + 1), j = Math.floor(k / (nx + 1)), q = []; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + a, jj = j + b; if (ii >= 0 && ii <= nx && jj >= 0 && jj <= ny && ok[id(ii, jj)]) q.push(cur[id(ii, jj)]); } return q.length ? v * .4 + .6 * q.reduce((s, t) => s + t, 0) / q.length : v; });
  // only cells whose four corners are valid
  const pos = [], idx = new Map(), faces = [];
  const vert = k => { if (!idx.has(k)) { idx.set(k, pos.length); const i = k % (nx + 1), j = Math.floor(k / (nx + 1)); pos.push([-half + i * dx, top - j * dy, cur[k]]); } return idx.get(k); };
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const c = [id(i, j), id(i + 1, j), id(i + 1, j + 1), id(i, j + 1)]; if (c.every(k => ok[k])) faces.push([vert(c[0]), vert(c[1]), vert(c[2])], [vert(c[0]), vert(c[2]), vert(c[3])]); }
  // per-vertex thickness: 2 mm, thinner where the back face would enter a structure that the front face (the pharynx wall) is not already inside
  const avoid = avoidNames.filter(nm => U.has(nm)).map(nm => ({nm, m: U.mesh(nm)})), thick = pos.map(p => { const f = [p[0], p[1], p[2] - FRONT_GAP]; let t = THICK;
    for (const {nm, m} of avoid) { if (U.dist(nm, f) > t + .0008) continue; if (inside(m, f)) continue; while (t > 0 && inside(m, [f[0], f[1], f[2] - t]) && U.dist(nm, [f[0], f[1], f[2] - t]) > .0003) t -= .0004; if (t < 0) t = 0; }
    return t; });
  const n = pos.length, positions = [...pos.map(p => [p[0], p[1], p[2] - FRONT_GAP]), ...pos.map((p, i) => [p[0], p[1], p[2] - FRONT_GAP - thick[i]])].flat(), indices = [];
  for (const [a, b, c] of faces) indices.push(a, c, b, n + a, n + b, n + c);   // front face looks forward (+z), back face looks backward
  const seen = new Map(); for (const [a, b, c] of faces) for (const [x, y] of [[a, b], [b, c], [c, a]]) { const k = x < y ? `${x},${y}` : `${y},${x}`; seen.set(k, (seen.get(k) ?? []).concat([[x, y]])); }
  for (const list of seen.values()) if (list.length === 1) { const [x, y] = list[0]; indices.push(x, y, n + x, y, n + y, n + x); }
  return {positions: Float32Array.from(positions), indices: Uint32Array.from(indices)};
}

export default function retropharyngealSpace(U) {
  const geometry = retropharyngealLayer(U);
  return [{
    name: 'Retropharyngeal space', zh: '咽後間隙', system: 'connective', kind: 'space', geometry: [geometry],
    card: {origin: ['Front: the back wall of the pharynx (pharyngeal constrictors and raphe); behind: the prevertebral fascia over longus colli and longus capitis; sides: the carotid sheaths. From the base of the skull to about C6, where the pharynx becomes the oesophagus', '前：咽後壁（咽縮肌與咽縫）；後：頸長肌與頭長肌表面的椎前筋膜；兩側：頸動脈鞘；上起顱底，下到約第六頸椎（咽接食道處）'],
      course: ['A potential space behind the pharynx and in front of the vertebral column, drawn here as a thin schematic layer (about 2 mm), not as a measured thickness; nothing around it was moved', '位於咽後方、脊柱前方的潛在間隙；這裡畫成約 2 mm 的示意薄層，不代表實測厚度，周圍結構都沒有被移動'],
      supply: ['Filled with loose connective tissue that lets the pharynx slide on the vertebral column when swallowing and moving the neck; an infection here can spread downwards into the posterior mediastinum', '內含疏鬆結締組織，讓吞嚥與頸部活動時咽可以相對脊柱滑動；此處的感染可向下擴散到後縱隔']},
    refs: [],
  }];
}
