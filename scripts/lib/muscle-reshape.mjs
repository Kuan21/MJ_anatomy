// Shape repairs of source muscle meshes (BodyParts3D) that are placed correctly but drawn wrongly: the three parts of trapezius end in torn, saw-toothed edges and have crumpled
// surfaces; gluteus maximus crosses the midline and covers the lower sacrum and coccyx. Each repair works on the raw atlas mesh only (a pure function of that mesh and the bones
// it lies on), so prepare-model-stream (the viewer) and prepare-quiz (the Quiz catalogue) get identical geometry. The muscle keeps its id, name, side and motion binding.
import {weld, splitMesh, planeOf, smooth, bounds, normalsOf} from './tendon-cut.mjs';
import {creaseMesh, openEdges} from './tendon-build.mjs';
import {meshOf, closest, ray} from './heart-geom.mjs';

// x of the lateral insertion of the transverse part of trapezius, measured on the scapula: the acromion's medial border lies at x = 0.11 to 0.14 m and its tip at 0.166 m,
// so the fibres end where the acromion's medial part is (the lateral tip belongs to the deltoid).
const MIDLINE_GAP = .0008, TRANSVERSE_END_X = .145, ASCENDING_END_X = .14;
// gluteus maximus arises from the posterior ilium, the lateral dorsal sacrum, the side of the coccyx and the sacrotuberous ligament: the medial border runs along the side
// of the sacrococcygeal column (half-width 15 mm at the tip) and leaves the natal cleft open.
const GLUTEAL_CLEFT_X = .021, GLUTEAL_TAPER = .014;

export const RESHAPES = [
  {id: 'FJ1554', name: 'Transverse part of right trapezius', kind: 'trapezius-transverse', sx: -1},
  {id: 'FJ1554M', name: 'Transverse part of left trapezius', kind: 'trapezius-transverse', sx: 1},
  {id: 'FJ1520', name: 'Ascending part of right trapezius', kind: 'trapezius-ascending', sx: -1},
  {id: 'FJ1520M', name: 'Ascending part of left trapezius', kind: 'trapezius-ascending', sx: 1},
  {id: 'FJ1521', name: 'Descending part of right trapezius', kind: 'trapezius-descending', sx: -1},
  {id: 'FJ1521M', name: 'Descending part of left trapezius', kind: 'trapezius-descending', sx: 1},
  {id: 'FJ1418', name: 'Right gluteus maximus', kind: 'gluteus-maximus', sx: -1},
  {id: 'FJ1418M', name: 'Left gluteus maximus', kind: 'gluteus-maximus', sx: 1},
];
const BONES = {'gluteus-maximus': sx => [sx < 0 ? 'Right hip bone' : 'Left hip bone', 'Sacrum']};

const f32 = m => ({positions: Float32Array.from(m.positions), indices: m.indices});
const meshFrom = (positions, indices) => meshOf(Float32Array.from(positions), indices);
const signedDistance = (mesh, p) => { const c = closest(mesh, p), d = c.d, s = (p[0] - c.point[0]) * c.normal[0] + (p[1] - c.point[1]) * c.normal[1] + (p[2] - c.point[2]) * c.normal[2]; return {d: s < 0 ? -d : d, point: c.point, normal: c.normal}; };

/** Keeps the part of a closed mesh where dot(n, p) > c, closing the cut with a flat cap; returns the mesh and the vertices of the cap ring. */
function clip(mesh, n, point) {
  const open0 = openEdges(mesh), {pos} = splitMesh(mesh, planeOf(n, point));
  if (!pos.indices.length) throw new Error('muscle reshape: the cut removed everything');
  // the source meshes are not all watertight: the cut must not add open edges to what was already open
  if (openEdges(pos) > open0) throw new Error(`muscle reshape: the cut left ${openEdges(pos)} open edges (the source had ${open0})`);
  return {positions: pos.positions, indices: pos.indices, ring: pos.ring};
}

/** The welded mesh without its loose fragments: connected pieces smaller than `fraction` of the largest one (torn debris of the source mesh, 1 to 40 vertices next to a body of 600 to 1300). */
function dropFragments(m, fraction = .05) {
  const n = m.positions.length / 3, par = Int32Array.from({length: n}, (_, i) => i), find = x => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
  for (let i = 0; i < m.indices.length; i += 3) { const a = find(m.indices[i]), b = find(m.indices[i + 1]), c = find(m.indices[i + 2]); par[b] = a; par[c] = a; }
  const size = new Map(); for (let v = 0; v < n; v++) { const r = find(v); size.set(r, (size.get(r) ?? 0) + 1); }
  const big = Math.max(...size.values()), keepTri = [], used = new Map(), P = [];
  const vert = v => { let k = used.get(v); if (k === undefined) { k = P.length / 3; used.set(v, k); P.push(m.positions[v * 3], m.positions[v * 3 + 1], m.positions[v * 3 + 2]); } return k; };
  for (let i = 0; i < m.indices.length; i += 3) if (size.get(find(m.indices[i])) >= big * fraction) keepTri.push(vert(m.indices[i]), vert(m.indices[i + 1]), vert(m.indices[i + 2]));
  return {positions: Float64Array.from(P), indices: Uint32Array.from(keepTri)};
}

/** The back surface of a thin sheet moved out along its normals by up to `d` metres (full where the normal faces backwards, nothing where it faces forwards), so the two skins of a
 *  sheet that is only a millimetre or two thick no longer cross each other (the pleats and slits of the source). Pinned vertices stay. */
function thicken(m, d, pinned = []) {
  const N = normalsOf(m.positions, m.indices), P = Float64Array.from(m.positions), fixed = new Set(pinned);
  for (let v = 0; v < P.length / 3; v++) { if (fixed.has(v)) continue; const w = Math.max(0, Math.min(1, (-N[v * 3 + 2] + .15) / .85)); for (let k = 0; k < 3; k++) P[v * 3 + k] += N[v * 3 + k] * d * w; }
  return {positions: P, indices: m.indices};
}

/** Taubin smoothing of the welded mesh; vertices in `pinned` stay where they are. */
const relax = (m, pinned, iterations) => smooth({positions: m.positions, indices: m.indices}, pinned, iterations);

function trapezius(raw, {kind, sx}) {
  let m = dropFragments(weld(raw.positions, raw.indices)), pinned = [];
  // each cut is a flat end that stays where the cut put it: `sx` is the lateral direction along x
  const cutAt = (x, medial = true) => { const c = clip(m, [medial ? -sx : sx, 0, 0], [sx * x, 0, 0]); m = c; pinned = [...pinned, ...c.ring]; };
  // the two sides meet at the midline (the nuchal and supraspinous ligaments): each part is cut where it crosses the midline plane, 0.8 mm short of it, so the halves no longer overlap
  // (the source already ends in a flat face at the midline; the few vertices beyond it are moved onto the plane)
  { const P = Float32Array.from(m.positions); for (let v = 0; v < P.length; v += 3) if (P[v] * sx < MIDLINE_GAP) P[v] = sx * MIDLINE_GAP; m = weld(P, m.indices); pinned = []; for (let v = 0; v < m.positions.length; v += 3) if (Math.abs(m.positions[v] - sx * MIDLINE_GAP) < 1e-6) pinned.push(v / 3); }
  // the torn tongue past the acromion is cut off at the acromion's medial part
  if (kind === 'trapezius-transverse') cutAt(TRANSVERSE_END_X);
  // the lower fibres end in an aponeurosis at the root of the scapular spine: the sliver the source draws on along the crest, past the acromion's angle, is cut off
  if (kind === 'trapezius-ascending') cutAt(ASCENDING_END_X);
  m = relax(m, pinned, 80);
  m = thicken(m, .0012, pinned);
  m = relax(m, pinned, 6);
  // smoothing and thickening may move a vertex across the midline plane again: back onto it
  const P = Float64Array.from(m.positions); for (let v = 0; v < P.length; v += 3) if (P[v] * sx < MIDLINE_GAP) P[v] = sx * MIDLINE_GAP;
  return {positions: P, indices: m.indices};
}

function gluteusMaximus(raw, {sx}, bones) {
  let m = dropFragments(weld(raw.positions, raw.indices));
  // the medial border: nothing crosses the midline or covers the coccyx; the cut leaves the natal cleft open
  const c = clip(m, [sx, 0, 0], [sx * GLUTEAL_CLEFT_X, 0, 0]); m = c;
  const P = m.positions, n = P.length / 3, mesh = meshFrom(P, m.indices);
  // thin the medial border to a tendinous edge on the bone: the back surface within GLUTEAL_TAPER of the cut is drawn down towards the deep surface (which stays on the bone)
  const out = Float64Array.from(P);
  for (let v = 0; v < n; v++) {
    const x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2], d = Math.abs(x - sx * GLUTEAL_CLEFT_X);
    if (d >= GLUTEAL_TAPER) continue;
    const hit = ray(mesh, [x, y, z], [0, 0, 1]); if (!hit) continue;
    const back = hit.normal[2] > 0.2;   // the first thing in front of a back-surface vertex is the deep surface, whose normal faces forward
    if (!back) continue;
    const t = d / GLUTEAL_TAPER, s = .3 + .7 * (t * t * (3 - 2 * t));
    out[v * 3 + 2] = hit.point[2] + (z - hit.point[2]) * s;
  }
  m = {positions: out, indices: m.indices};
  m = relax(m, Array.from(c.ring), 5);
  // the deep surface rests on the bone it arises from: vertices that sank into the hip bone or the sacrum are brought back to the surface
  for (let pass = 0; pass < 3; pass++) for (let v = 0; v < m.positions.length / 3; v++) {
    const p = [m.positions[v * 3], m.positions[v * 3 + 1], m.positions[v * 3 + 2]];
    for (const b of bones) { const s = signedDistance(b, p); if (s.d < .0004 && s.d > -.012) { m.positions[v * 3] = s.point[0] + s.normal[0] * .0006; m.positions[v * 3 + 1] = s.point[1] + s.normal[1] * .0006; m.positions[v * 3 + 2] = s.point[2] + s.normal[2] * .0006; break; } }
  }
  m = relax(m, Array.from(c.ring), 2);
  return m;
}

/**
 * @param parts every atlas part {id, name, bounds}; `read(part)` -> {positions, indices}; `current` an optional map id -> geometry already replaced by an earlier step
 * Returns a Map id -> {positions: Float32Array, normals: Int16Array, indices: Uint32Array, bounds}.
 */
export function planReshapes(parts, read, current = new Map()) {
  const byId = new Map(parts.map(p => [p.id, p])), byName = new Map(); for (const p of parts) if (!byName.has(p.name)) byName.set(p.name, p);
  const out = new Map();
  for (const spec of RESHAPES) {
    const part = byId.get(spec.id); if (!part) throw new Error(`muscle reshape: no atlas part ${spec.id} (${spec.name})`);
    if (part.name !== spec.name) throw new Error(`muscle reshape: ${spec.id} is ${part.name}, not ${spec.name}`);
    const raw = current.get(spec.id) ?? read(part);
    let m;
    if (spec.kind === 'gluteus-maximus') {
      const bones = BONES[spec.kind](spec.sx).map(n => { const b = byName.get(n); if (!b) throw new Error(`muscle reshape: no bone ${n}`); const g = read(b); return meshOf(g.positions, g.indices); });
      m = gluteusMaximus(raw, spec, bones);
    } else m = trapezius(raw, spec);
    const g = f32(m), crease = creaseMesh(g.positions, g.indices, spec.kind === 'gluteus-maximus' ? 55 : 72);
    out.set(spec.id, {...crease, bounds: bounds(crease.positions)});
  }
  return out;
}
