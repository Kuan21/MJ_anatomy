// Reshaping of the two paired scalp muscles of the pinned facial-muscle source (frontalis and occipitalis) at packaging time.
// The source pieces are real solids but their edges are not what the textbook plates show: the two frontalis bellies end in two domes with a dip in the midline, and the lower edge of each
// occipitalis belly is a row of fibre ends (a saw tooth), with a straight vertical inner edge and square corners. Nothing is scaled and no triangle is added or removed: the vertices are
// moved by smooth warps that act only near the edge in question (the vertex count, the triangles and the fibre structure stay exactly as in the source), the same warp is used for both sides
// (so the pair is symmetric), and every vertex that moves along the skull is carried along the bone surface so the muscle keeps its distance from the bone.
// The warps are deterministic: running prepare-facial again gives the same bytes. The shapes below are schematic outlines; the final anatomical check is the user's.
import fs from 'node:fs';

/** Outline numbers (metres). Frontalis: the upper edge becomes one arc across the midline (top Y0 in the midline, falling to the temple), rounded at the corners. */
export const FRONTALIS = {Y0: 1.6815, A: .057, HC: .0155, POW: 4, DEPTH: .025, BIN: .0015, SIGMA: 2, TOOTH: .003, EDGE_SIGMA: .003};
/** Occipitalis: smooth lower edge, inner edge at INNER from the midline with rounded corners of radius ROUND. */
export const OCCIPITALIS = {INNER: .0153, ROUND: .012, WIDTH: .02, TOOTH: .003, EDGE_SIGMA: .003};
/** The epicranial aponeurosis (supplement catalogue, FMA46768): its lower front edge follows the same arc, 3 mm under the frontalis arc, so that the muscle and the sheet meet along one line. */
export const GALEA = {FMA: 'FMA46768', OVERLAP: .003, EXTRA: .0025, DEPTH: .02, FRONT_Z: .02};
export const REFINED_NAMES = ['Right frontalis', 'Left frontalis', 'Right occipitalis', 'Left occipitalis'];

const smooth01 = t => { const c = Math.min(1, Math.max(0, t)); return c * c * (3 - 2 * c); };

/** Gaussian smoothing of an array that may contain NaN (those are filled by the weighted neighbours); sigma in samples. */
export function gaussian(arr, sigma) {
  const r = Math.ceil(sigma * 3), out = new Float64Array(arr.length);
  for (let i = 0; i < arr.length; i++) { let s = 0, w = 0; for (let k = -r; k <= r; k++) { const v = arr[i + k]; if (v === undefined || !Number.isFinite(v)) continue; const g = Math.exp(-k * k / (2 * sigma * sigma)); s += g * v; w += g; } out[i] = w ? s / w : NaN; }
  return out;
}
/** Linear interpolation of a regularly sampled array at position u (in samples, clamped). */
function lerpAt(arr, u) { const c = Math.min(arr.length - 1, Math.max(0, u)), i = Math.min(arr.length - 2, Math.floor(c)), f = c - i; return arr[i] * (1 - f) + arr[i + 1] * f; }

/** A bone's outer surface as a height field z(x, y) on a 1.5 mm lattice (front = largest z, back = smallest z), smoothed so the coarse bone mesh does not print its steps on the muscle. */
export function surfaceField({positions: P, indices: I}, mode, box = {x: [-.09, .09], y: [1.54, 1.74]}, step = .0015) {
  const nx = Math.round((box.x[1] - box.x[0]) / step), ny = Math.round((box.y[1] - box.y[0]) / step), z = new Float64Array(nx * ny).fill(NaN), front = mode === 'front';
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
    const x0 = Math.min(P[a], P[b], P[c]), x1 = Math.max(P[a], P[b], P[c]), y0 = Math.min(P[a + 1], P[b + 1], P[c + 1]), y1 = Math.max(P[a + 1], P[b + 1], P[c + 1]);
    if (x1 < box.x[0] || x0 > box.x[1] || y1 < box.y[0] || y0 > box.y[1]) continue;
    const d = (P[b + 1] - P[c + 1]) * (P[a] - P[c]) + (P[c] - P[b]) * (P[a + 1] - P[c + 1]); if (Math.abs(d) < 1e-14) continue;
    for (let ix = Math.max(0, Math.floor((x0 - box.x[0]) / step)); ix <= Math.min(nx - 1, Math.floor((x1 - box.x[0]) / step)); ix++) for (let iy = Math.max(0, Math.floor((y0 - box.y[0]) / step)); iy <= Math.min(ny - 1, Math.floor((y1 - box.y[0]) / step)); iy++) {
      const x = box.x[0] + (ix + .5) * step, y = box.y[0] + (iy + .5) * step;
      const u = ((P[b + 1] - P[c + 1]) * (x - P[c]) + (P[c] - P[b]) * (y - P[c + 1])) / d, v = ((P[c + 1] - P[a + 1]) * (x - P[c]) + (P[a] - P[c]) * (y - P[c + 1])) / d, w = 1 - u - v;
      if (u < 0 || v < 0 || w < 0) continue;
      const zz = u * P[a + 2] + v * P[b + 2] + w * P[c + 2], k = ix * ny + iy;
      if (!Number.isFinite(z[k]) || (front ? zz > z[k] : zz < z[k])) z[k] = zz;
    }
  }
  let s = Float64Array.from(z);
  for (let pass = 0; pass < 3; pass++) { const n = s.slice(); for (let ix = 1; ix < nx - 1; ix++) for (let iy = 1; iy < ny - 1; iy++) { let sum = 0, cnt = 0; for (let p = -1; p <= 1; p++) for (let q = -1; q <= 1; q++) { const v = s[(ix + p) * ny + iy + q]; if (Number.isFinite(v)) { sum += v; cnt++; } } if (Number.isFinite(s[ix * ny + iy]) && cnt) n[ix * ny + iy] = sum / cnt; } s = n; }
  /** Height of the surface at (x, y), or NaN where the bone is not seen. */
  return (x, y) => {
    const fx = (x - box.x[0]) / step - .5, fy = (y - box.y[0]) / step - .5, ix = Math.floor(fx), iy = Math.floor(fy); if (ix < 0 || iy < 0 || ix >= nx - 1 || iy >= ny - 1) return NaN;
    const tx = fx - ix, ty = fy - iy, g = (p, q) => s[(ix + p) * ny + iy + q], v = [g(0, 0), g(1, 0), g(0, 1), g(1, 1)]; if (v.some(q => !Number.isFinite(q))) return NaN;
    return v[0] * (1 - tx) * (1 - ty) + v[1] * tx * (1 - ty) + v[2] * (1 - tx) * ty + v[3] * tx * ty;
  };
}

/** The bone meshes the refinement follows, read from the raw body catalogue (the same files the viewer packages), by concept id. */
export function readBone(modelsDir, conceptId) {
  const atlas = JSON.parse(fs.readFileSync(new URL('atlas.json', modelsDir), 'utf8')), p = atlas.parts.find(q => q.conceptId === conceptId);
  if (!p) throw new Error(`facial refine: bone ${conceptId} is not in the catalogue`);
  const b = fs.readFileSync(new URL('..' + atlas.chunks[p.chunk].url, modelsDir));
  return {positions: new Float32Array(b.buffer.slice(b.byteOffset + p.positions, b.byteOffset + p.positions + p.vertexCount * 12)), indices: new Uint32Array(b.buffer.slice(b.byteOffset + p.indices, b.byteOffset + p.indices + p.indexCount * 4))};
}

/** Area-weighted vertex normals as the packages store them (three int16 per vertex). */
export function vertexNormals(P, I) {
  const N = new Float64Array(P.length);
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3, ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const i of [a, b, c]) { N[i] += nx; N[i + 1] += ny; N[i + 2] += nz; }
  }
  const out = new Int16Array(P.length);
  for (let i = 0; i < P.length; i += 3) { const l = Math.hypot(N[i], N[i + 1], N[i + 2]) || 1; for (let k = 0; k < 3; k++) out[i + k] = Math.round(N[i + k] / l * 32767); }
  return out;
}

/** Running extreme of an array: the maximum (or minimum) within `r` samples on each side. */
function running(arr, r, max) { const out = new Float64Array(arr.length); for (let i = 0; i < arr.length; i++) { let v = NaN; for (let k = -r; k <= r; k++) { const q = arr[i + k]; if (q === undefined || !Number.isFinite(q)) continue; if (!Number.isFinite(v) || (max ? q > v : q < v)) v = q; } out[i] = v; } return out; }
/**
 * A clean edge: the fibres of the source end in a row of points, so the edge is a saw tooth. The smooth curve that passes through the tops of the gaps between the teeth is found (the running
 * extreme of the edge over TOOTH on each side, then smoothed) and every vertex beyond it is put on the curve. The teeth are cut flat; nothing is added.
 * `along(i)` is the coordinate along the edge; `lower` clamps from below (y' = max(y, curve)), otherwise from above; a vertex that moves is carried along the bone surface (`field`, the height field of the bone) so it keeps its distance from the bone.
 */
function cleanEdge(P, n, along, lower, tooth, sigma, bin, limit, field) {
  let lo = Infinity, hi = -Infinity; for (let i = 0; i < n; i++) { const t = along(i); lo = Math.min(lo, t); hi = Math.max(hi, t); }
  const nb = Math.ceil((hi - lo) / bin) + 1, edge = new Float64Array(nb).fill(NaN);
  for (let i = 0; i < n; i++) { const j = Math.round((along(i) - lo) / bin), y = P[i * 3 + 1]; if (!Number.isFinite(edge[j]) || (lower ? y < edge[j] : y > edge[j])) edge[j] = y; }
  // the trend of the edge (a wide Gaussian) is taken out first, so that a sloping edge is not cut lower than its teeth: only the teeth are measured against the trend
  const trend = gaussian(edge, 2 * sigma / bin), dev = Float64Array.from(edge, (v, j) => Number.isFinite(v) && Number.isFinite(trend[j]) ? v - trend[j] : NaN), env = running(dev, Math.round(tooth / bin), lower);
  const curve = Float64Array.from(gaussian(Float64Array.from(env, (v, j) => Number.isFinite(v) ? trend[j] + v : NaN), sigma / bin / 2));
  for (let i = 0; i < n; i++) { const c = lerpAt(curve, (along(i) - lo) / bin); if (!Number.isFinite(c)) continue; const w = 1 - smooth01((along(i) - limit) / .008), y = P[i * 3 + 1], cut = lower ? Math.max(y, c) : Math.min(y, c); const y2 = y + w * (cut - y), z0 = field(P[i * 3], y), z1 = field(P[i * 3], y2); if (Number.isFinite(z0) && Number.isFinite(z1)) P[i * 3 + 2] += z1 - z0; P[i * 3 + 1] = y2; }
}

/** Frontalis: one arc across the midline for the upper edge, the two bellies meeting along the midline (the arc is continuous across it), a clean upper edge. `side` is +1 for the left muscle, -1 for the right; `bone` is the frontal bone mesh. Returns new positions. */
export function refineFrontalis(positions, side, bone) {
  const {DEPTH, BIN, SIGMA, TOOTH, EDGE_SIGMA} = FRONTALIS, P = Float32Array.from(positions), n = P.length / 3, front = surfaceField(bone, 'front');
  let amax = 0; for (let i = 0; i < n; i++) amax = Math.max(amax, side * P[i * 3]);
  // 1. the dip in the midline between the two domes is filled: the upper edge is raised to the arc Y0 - HC (a / A)^POW; the edge is only raised, never lowered
  const nb = Math.ceil((amax + BIN) / BIN) + 1, top = new Float64Array(nb).fill(NaN), col = a => Math.min(nb - 1, Math.max(0, a / BIN));
  for (let i = 0; i < n; i++) { const j = Math.round(col(side * P[i * 3])); if (!(P[i * 3 + 1] <= top[j])) top[j] = P[i * 3 + 1]; }
  const topS = gaussian(top, SIGMA), target = j => arcTop(j * BIN), delta = Float64Array.from(topS, (v, j) => Number.isFinite(v) ? Math.max(0, target(j) - v) : 0);
  const follow = (x, y, x2, y2) => { const z0 = front(x, y), z1 = front(x2, y2); return Number.isFinite(z0) && Number.isFinite(z1) ? z1 - z0 : 0; };
  for (let i = 0; i < n; i++) {
    const x = P[i * 3], y = P[i * 3 + 1], u = col(side * x), d = lerpAt(delta, u), tS = lerpAt(topS, u), w = 1 - smooth01((tS - y) / DEPTH), y2 = y + d * w;
    P[i * 3 + 2] += follow(x, y, x, y2); P[i * 3 + 1] = y2;
  }
  // 2. the upper edge is cut clean along a smooth curve through the gaps between the fibre tips
  cleanEdge(P, n, i => side * P[i * 3], false, TOOTH, EDGE_SIGMA, .0004, .044, front);   // beyond 44 mm the edge turns down the temple: it is left as it is
  return P;
}

/** Occipitalis: clean lower edge, rounded lower inner corner. `side` is +1 for the left muscle, -1 for the right; `bone` is the occipital bone mesh. Returns new positions. */
export function refineOccipitalis(positions, side, bone) {
  const {INNER, ROUND, WIDTH, TOOTH, EDGE_SIGMA} = OCCIPITALIS, P = Float32Array.from(positions), n = P.length / 3, back = surfaceField(bone, 'back');
  // 1. the inner edge: its straight vertical line becomes INNER from the midline, with a quarter-circle corner of radius ROUND at the lower end (the upper end lies under the epicranial aponeurosis)
  let ymin = Infinity, ymax = -Infinity; for (let i = 0; i < n; i++) { ymin = Math.min(ymin, P[i * 3 + 1]); ymax = Math.max(ymax, P[i * 3 + 1]); }
  const ROW = .001, nr = Math.ceil((ymax - ymin) / ROW) + 1, inner = new Float64Array(nr).fill(NaN), row = y => (y - ymin) / ROW;
  for (let i = 0; i < n; i++) { const j = Math.round(row(P[i * 3 + 1])), a = side * P[i * 3]; if (!(a >= inner[j])) inner[j] = a; }
  const innerS = gaussian(inner, 1.5), c0 = (() => { const v = []; for (let j = Math.round(ROUND / ROW) + 2; j < nr - 2; j++) if (Number.isFinite(innerS[j])) v.push(innerS[j]); v.sort((p, q) => p - q); return v[Math.floor(v.length / 2)]; })(), corner = y => { const dd = y - ymin; if (dd >= ROUND) return 0; const q = (ROUND - dd) / ROUND; return ROUND * (1 - Math.sqrt(Math.max(0, 1 - q * q))); };
  for (let i = 0; i < n; i++) {
    const a = side * P[i * 3], y = P[i * 3 + 1], shift = INNER + corner(y) - c0, w = 1 - smooth01((a - c0) / WIDTH), a2 = a + shift * w;
    let dz = 0; const z0 = back(P[i * 3], y), z1 = back(side * a2, y); if (Number.isFinite(z0) && Number.isFinite(z1)) dz = z1 - z0;
    P[i * 3] = side * a2; P[i * 3 + 2] += dz;
  }
  // 2. the lower edge (a row of fibre ends) is cut clean along a smooth curve through the gaps between the ends (after the shift, so the cut edge is smooth in its final place)
  cleanEdge(P, n, i => side * P[i * 3], true, TOOTH, EDGE_SIGMA, .0004, Infinity, back);
  return P;
}

/** The height of the frontalis arc at distance a from the midline. */
export const arcTop = a => FRONTALIS.Y0 - FRONTALIS.HC * Math.pow(Math.min(1, a / FRONTALIS.A), FRONTALIS.POW);

/** Epicranial aponeurosis: the tongue of the sheet that reaches down between the two frontalis domes is drawn up to the arc, so the sheet ends where the muscle begins. Returns new positions. */
export function refineGalea(positions, bone) {
  const {OVERLAP, EXTRA, DEPTH, FRONT_Z} = GALEA, BIN = FRONTALIS.BIN, P = Float32Array.from(positions), n = P.length / 3, front = surfaceField(bone, 'front');
  let amax = 0; for (let i = 0; i < n; i++) amax = Math.max(amax, Math.abs(P[i * 3]));
  const nb = Math.ceil((amax + BIN) / BIN) + 1, low = new Float64Array(nb).fill(NaN), col = a => Math.min(nb - 1, Math.max(0, a / BIN));
  for (let i = 0; i < n; i++) if (P[i * 3 + 2] > FRONT_Z) { const j = Math.round(col(Math.abs(P[i * 3]))); if (!(P[i * 3 + 1] >= low[j])) low[j] = P[i * 3 + 1]; }
  const lowS = gaussian(low, FRONTALIS.SIGMA), delta = Float64Array.from(lowS, (v, j) => Number.isFinite(v) ? Math.max(0, arcTop(j * BIN) - OVERLAP - EXTRA * (1 - smooth01(j * BIN / .008)) - v) : 0);
  for (let i = 0; i < n; i++) {
    if (P[i * 3 + 2] <= FRONT_Z) continue;
    const x = P[i * 3], y = P[i * 3 + 1], u = col(Math.abs(x)), d = lerpAt(delta, u), b = lerpAt(lowS, u), w = 1 - smooth01((y - b) / DEPTH), y2 = y + d * w;
    const z0 = front(x, y), z1 = front(x, y2); if (Number.isFinite(z0) && Number.isFinite(z1)) P[i * 3 + 2] += z1 - z0; P[i * 3 + 1] = y2;
  }
  return P;
}

/** Refine one named piece; returns {positions, normals} or null when the piece is not one of the four. */
export function refinePiece(name, positions, indices, bones) {
  const side = /^Left /.test(name) ? 1 : -1;
  let P; if (/frontalis$/.test(name)) P = refineFrontalis(positions, side, bones.frontal); else if (/occipitalis$/.test(name)) P = refineOccipitalis(positions, side, bones.occipital); else return null;
  return {positions: P, normals: vertexNormals(P, indices)};
}
