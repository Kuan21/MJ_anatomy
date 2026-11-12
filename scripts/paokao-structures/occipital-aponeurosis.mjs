// The aponeurotic cover of the back of the skull along the superior nuchal line: the posterior end of the epicranial aponeurosis (galea) running down over the external occipital
// protuberance between the two occipitalis bellies, and below it the tendinous origin of the upper trapezius from the medial part of the superior nuchal line and the protuberance.
// The atlas has the two bellies, the galea above and trapezius and splenius capitis below, but nothing between them: a band of occipital bone about 13 cm wide and up to 3 cm high
// (a square window in the midline, two strips beside it) showed through the muscles. This structure fills exactly that band.
// Shape: a solid with thickness. It is found on the atlas, not drawn by hand: the bone surface and the surface of every muscle, tendon and fascia seen from behind are sampled on a 1.5 mm
// grid; where the bone is the first thing seen (the band) the sheet is laid on the bone; its height above the bone is the height of the muscle edges around it, filled in smoothly
// (so it is as thick as trapezius at its lower edge and as thin as the galea at its upper edge); at its border it runs 3 mm under the neighbouring muscles, so there is no gap.
// Schematic: the position is measured on this atlas; the final anatomical check is the user's.
import fs from 'node:fs';
import zlib from 'node:zlib';
import {sub, add, mul, unit, cross} from '../lib/paokao-util.mjs';

const STEP = .0015, BOX = {x: [-.0765, .0765], y: [1.555, 1.628]}, SEED = [0, 1.595], OVERLAP = 3, INNER = .001, MIN_LIFT = .0025, MAX_LIFT = .008, ROUND = 9, ABOVE = .0004;   // ROUND: radius in cells of the disc that rounds the outline; ABOVE: where the sheet rounds a corner over a muscle it lies 0.4 mm above its surface
const NX = Math.round((BOX.x[1] - BOX.x[0]) / STEP), NY = Math.round((BOX.y[1] - BOX.y[0]) / STEP);
const COVER = new Set(['muscular', 'tendon', 'connective']);

/** The facial-muscle stream is not part of the paokao world; read the occipitalis bellies from it. */
function facialMeshes(names) {
  const root = new URL('../../public/models/', import.meta.url), j = JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL('facial/facial-stream.json.gz', root)))), bufs = new Map(), out = [];
  for (const p of j.parts) if (names.test(p.name)) {
    const url = j.chunks[p.chunk].url; if (!bufs.has(url)) bufs.set(url, fs.readFileSync(new URL('../../public' + url, import.meta.url)));
    const b = bufs.get(url);
    out.push({positions: new Float32Array(b.buffer.slice(b.byteOffset + p.positions, b.byteOffset + p.positions + p.vertexCount * 12)), indices: new Uint32Array(b.buffer.slice(b.byteOffset + p.indices, b.byteOffset + p.indices + p.indexCount * 4))});
  }
  return out;
}
/** Nearest-to-the-camera (smallest z) surface of a list of meshes over the lattice, as a Float64Array (Infinity where nothing). */
function frontSurface(meshes) {
  const z = new Float64Array(NX * NY).fill(Infinity);
  for (const {positions: P, indices: I} of meshes) for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3, x0 = Math.min(P[a], P[b], P[c]), x1 = Math.max(P[a], P[b], P[c]), y0 = Math.min(P[a + 1], P[b + 1], P[c + 1]), y1 = Math.max(P[a + 1], P[b + 1], P[c + 1]);
    if (x1 < BOX.x[0] || x0 > BOX.x[1] || y1 < BOX.y[0] || y0 > BOX.y[1]) continue;
    const d = (P[b + 1] - P[c + 1]) * (P[a] - P[c]) + (P[c] - P[b]) * (P[a + 1] - P[c + 1]); if (Math.abs(d) < 1e-14) continue;
    for (let ix = Math.max(0, Math.floor((x0 - BOX.x[0]) / STEP)); ix <= Math.min(NX - 1, Math.floor((x1 - BOX.x[0]) / STEP)); ix++) for (let iy = Math.max(0, Math.floor((y0 - BOX.y[0]) / STEP)); iy <= Math.min(NY - 1, Math.floor((y1 - BOX.y[0]) / STEP)); iy++) {
      const x = BOX.x[0] + (ix + .5) * STEP, y = BOX.y[0] + (iy + .5) * STEP, u = ((P[b + 1] - P[c + 1]) * (x - P[c]) + (P[c] - P[b]) * (y - P[c + 1])) / d, v = ((P[c + 1] - P[a + 1]) * (x - P[c]) + (P[a] - P[c]) * (y - P[c + 1])) / d, w = 1 - u - v;
      if (u < 0 || v < 0 || w < 0) continue; const zz = u * P[a + 2] + v * P[b + 2] + w * P[c + 2]; if (zz < z[ix * NY + iy]) z[ix * NY + iy] = zz;
    }
  }
  return z;
}
const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/** The cells of the band: bone is the first surface and the cell is connected to SEED; and the height field of the sheet. */
function field(U, w) {
  const bones = w.entries.filter(e => e.system === 'skeletal').map(e => e.load()), cover = w.entries.filter(e => COVER.has(e.system)).map(e => e.load()).concat(facialMeshes(/occipitalis/i));
  if (!facialMeshes(/occipitalis/i).length) throw new Error('occipital aponeurosis: the occipitalis bellies were not found');
  const occ = w.entries.filter(e => e.name === 'Occipital bone').map(e => e.load()), zo = frontSurface(occ), zb = frontSurface(bones), zc = frontSurface(cover), k = (ix, iy) => ix * NY + iy;
  // the bone surface, smoothed (three passes) so the sheet does not copy the small steps of the coarse bone mesh
  let zs = Float64Array.from(zo); for (let pass = 0; pass < 3; pass++) { const n = zs.slice(); for (let ix = 1; ix < NX - 1; ix++) for (let iy = 1; iy < NY - 1; iy++) { let s = 0, c = 0; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const q = zs[k(ix + a, iy + b)]; if (Number.isFinite(q)) { s += q; c++; } } if (Number.isFinite(zs[k(ix, iy)]) && c) n[k(ix, iy)] = s / c; } zs = n; }
  const bare = new Uint8Array(NX * NY); for (let i = 0; i < bare.length; i++) bare[i] = Number.isFinite(zo[i]) && zo[i] <= zb[i] + .0005 && !(zc[i] < zo[i] - .0003) ? 1 : 0;   // the occipital bone is the first surface in view
  const si = Math.round((SEED[0] - BOX.x[0]) / STEP), sj = Math.round((SEED[1] - BOX.y[0]) / STEP);
  if (!bare[k(si, sj)]) throw new Error('occipital aponeurosis: the seed cell is not bare bone (the atlas changed?)');
  const band = new Uint8Array(NX * NY), stack = [k(si, sj)]; band[stack[0]] = 1;
  while (stack.length) { const c = stack.pop(), ix = Math.floor(c / NY), iy = c % NY; for (const [a, b] of NB) { const jx = ix + a, jy = iy + b; if (jx < 0 || jy < 0 || jx >= NX || jy >= NY) continue; const q = k(jx, jy); if (bare[q] && !band[q]) { band[q] = 1; stack.push(q); } } }
  // the outline of the band is the outline of the muscles around it: a square window with ragged teeth. Close it (a morphological closing with a disc of 13.5 mm radius (the occipitalis bellies are about 30 mm across: a larger disc would fill them); a cell is never removed): the square corners and the teeth become
  // smooth arcs of about 13 mm radius. The cells added this way lie over the edge of a muscle; there the sheet rests 0.4 mm above the muscle surface.
  const disc = []; for (let a = -ROUND; a <= ROUND; a++) for (let b = -ROUND; b <= ROUND; b++) if (a * a + b * b <= ROUND * ROUND) disc.push([a, b]);
  // outside the lattice there is nothing to grow from and nothing to block the shrinking
  const morph = (src, grow) => { const out = new Uint8Array(NX * NY); for (let ix = 0; ix < NX; ix++) for (let iy = 0; iy < NY; iy++) { let hit = grow ? 0 : 1; for (const [a, b] of disc) { const jx = ix + a, jy = iy + b, v = jx >= 0 && jy >= 0 && jx < NX && jy < NY ? src[k(jx, jy)] : grow ? 0 : 1; if (grow ? v : !v) { hit = grow ? 1 : 0; break; } } out[k(ix, iy)] = hit; } return out; };
  const sym = Uint8Array.from(band); for (let ix = 0; ix < NX; ix++) for (let iy = 0; iy < NY; iy++) if (band[k(NX - 1 - ix, iy)]) sym[k(ix, iy)] = 1;   // the lattice is centred on x = 0: the outline is made left-right symmetric (a cell that is bare bone on one side only is rounded over the muscle on the other)
  const soft = morph(morph(sym, true), false);   // closing: grow, then shrink, by the same disc
  const core = Uint8Array.from(band), over = new Uint8Array(NX * NY);
  for (let i = 0; i < core.length; i++) if (!band[i] && soft[i] && Number.isFinite(zo[i]) && Number.isFinite(zc[i]) && zo[i] - zc[i] > .0008) { core[i] = 1; over[i] = 1; }
  // the sheet covers the core and runs OVERLAP cells under the muscles around it (not beyond the bone that is in view)
  const mask = Uint8Array.from(core); for (let r = 0; r < OVERLAP; r++) { const n = Uint8Array.from(mask); for (let ix = 0; ix < NX; ix++) for (let iy = 0; iy < NY; iy++) if (mask[k(ix, iy)]) for (const [a, b] of NB) { const jx = ix + a, jy = iy + b; if (jx >= 0 && jy >= 0 && jx < NX && jy < NY && Number.isFinite(zo[k(jx, jy)])) n[k(jx, jy)] = 1; } mask.set(n); }
  // height above the bone: the muscle edges around the core give the values (the cells rounded over a muscle rest on its surface), the core takes the smooth fill between them
  const H = new Float64Array(NX * NY), known = new Uint8Array(NX * NY);
  for (let i = 0; i < H.length; i++) if (over[i]) { H[i] = zs[i] - zc[i] + ABOVE; known[i] = 1; }   // exactly 0.4 mm above the muscle surface (no cap: the muscle can be thicker than the sheet elsewhere)
  else if (mask[i] && !core[i]) { const lift = zo[i] - zc[i]; if (Number.isFinite(lift) && lift > .0008) { H[i] = Math.min(MAX_LIFT, Math.max(MIN_LIFT, lift)); known[i] = 1; } }
  const free = []; for (let i = 0; i < H.length; i++) if (mask[i] && !known[i]) { free.push(i); H[i] = .003; }
  for (let it = 0; it < 600; it++) for (const i of free) { let s = 0, c = 0; const ix = Math.floor(i / NY), iy = i % NY; for (const [a, b] of NB) { const q = k(ix + a, iy + b); if (mask[q]) { s += H[q]; c++; } } if (c) H[i] = s / c; }
  return {zs, zb, mask, band: core, over, H, known, zo};
}

/** Closed solid over the masked cells of the lattice: top surface at the lift height, bottom INNER behind the bone surface; one solid piece. */
function solid({zs, mask, band, over, H, known}) {
  const k = (ix, iy) => ix * NY + iy, vid = new Map(), positions = [], indices = [], top = [], bot = [];
  const vertex = (ix, iy) => { const key = k(ix, iy); if (vid.has(key)) return vid.get(key); const id = top.length, x = BOX.x[0] + ix * STEP, y = BOX.y[0] + iy * STEP, near = [[0, 0], [-1, 0], [0, -1], [-1, -1]].map(([a, b]) => k(ix + a, iy + b)).filter(q => mask[q] && Number.isFinite(zs[q]));
    const z = near.reduce((s, q) => s + zs[q], 0) / near.length, lift = near.reduce((s, q) => s + H[q], 0) / near.length, edge = near.some(q => known[q]) && !near.some(q => over[q]) ? .6 : 1;   // under the muscles the sheet is a little lower than their surface: it never fights them
    top.push([x, y, z - lift * edge]); bot.push([x, y, z - INNER]); vid.set(key, id); return id; };
  const quads = new Map();
  for (let ix = 0; ix < NX; ix++) for (let iy = 0; iy < NY; iy++) if (mask[k(ix, iy)]) { const q = [vertex(ix, iy), vertex(ix + 1, iy), vertex(ix + 1, iy + 1), vertex(ix, iy + 1)]; quads.set(k(ix, iy), q); }
  const n = top.length;
  const edges = new Map();
  for (const [a, b, c, d] of quads.values()) {
    indices.push(a, b, c, a, c, d, n + a, n + c, n + b, n + a, n + d, n + c);
    for (const [u, v] of [[a, b], [b, c], [c, d], [d, a]]) { const key = u < v ? `${u},${v}` : `${v},${u}`; (edges.get(key) ?? edges.set(key, []).get(key)).push([u, v]); }
  }
  for (const list of edges.values()) if (list.length === 1) { const [u, v] = list[0]; indices.push(u, n + u, v, v, n + u, n + v); }
  // the outline of a lattice is a staircase of 1.5 mm steps: smooth the boundary loop of the top surface (and the bottom with it) so the edge is a curve, not steps
  { const nbr = new Map(); for (const list of edges.values()) if (list.length === 1) { const [u, v] = list[0]; (nbr.get(u) ?? nbr.set(u, []).get(u)).push(v); (nbr.get(v) ?? nbr.set(v, []).get(v)).push(u); }
    for (let it = 0; it < 8; it++) { const next = new Map(); for (const [u, l] of nbr) if (l.length === 2) next.set(u, [(top[l[0]][0] + top[l[1]][0] + 2 * top[u][0]) / 4, (top[l[0]][1] + top[l[1]][1] + 2 * top[u][1]) / 4]); for (const [u, [x, y]] of next) { top[u][0] = x; top[u][1] = y; bot[u][0] = x; bot[u][1] = y; } } }
  for (const p of [...top, ...bot]) positions.push(...p);
  let vol = 0; for (let t = 0; t < indices.length; t += 3) { const P = q => positions.slice(indices[t + q] * 3, indices[t + q] * 3 + 3), a = P(0), b = P(1), c = P(2); vol += a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]); }
  if (vol < 0) for (let t = 0; t < indices.length; t += 3) { const q = indices[t + 1]; indices[t + 1] = indices[t + 2]; indices[t + 2] = q; }
  return {positions: Float32Array.from(positions), indices: Uint32Array.from(indices)};
}

export function occipitalAponeurosis(U, w) { return solid(field(U, w)); }

/** The structure spec (see scripts/lib/paokao-build.mjs). Built after everything else, so no earlier structure changes its id. */
export default function occipitalAponeurosisSpec(U, w) {
  return [{
    name: 'nuchal origin of trapezius', zh: '斜方肌項線起點部', system: 'connective', kind: 'fascia-dense', cap: 12000, geometry: [occipitalAponeurosis(U, w)],
    card: {
      origin: ['Medial part of the superior nuchal line, the external occipital protuberance and the nuchal ligament; it continues upwards into the epicranial aponeurosis between the two occipitalis bellies', '上項線內側部、枕外隆凸與項韌帶；向上與兩側枕肌之間的帽狀腱膜相連'],
      course: ['A thin pale tendinous layer on the back of the occipital bone in the midline and along the superior nuchal line, from the occipitalis bellies above to the upper ends of trapezius and splenius capitis below; the red muscle bellies of trapezius begin below it', '貼在枕骨後面、沿上項線與中線的淺色薄腱性層，上接枕肌，下接斜方肌與頭夾肌上端；紅色的斜方肌肌腹從它的下方開始'],
      supply: ['The tendinous origin of the upper trapezius, joined to the epicranial aponeurosis above it; it closes the gap that the separate muscle and aponeurosis meshes leave over the occipital bone, so the bone is covered as in the textbook plates (accessory nerve CN XI and C3–C4 supply the muscle that arises from it)', '上部斜方肌的腱性起點，向上與帽狀腱膜相連；補上肌肉與腱膜各自網格之間露出枕骨的空隙，使骨頭像課本圖譜一樣被蓋住（由它發出的斜方肌受副神經與 C3–C4 支配）'],
    },
  }];
}
