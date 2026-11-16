// The female pelvic floor. The levator ani muscles of the atlas (BodyParts3D) belong to a male pelvis, a deep funnel whose lower border hangs below the level of the erectile structures of the
// vulva: in female mode the clitoral complex (glans, body, crura and bulbs of the vestibule, fitted to the female hip bones by scripts/lib/clitoris-place.mjs) lay inside the muscle.
// Anatomically the levator ani lies above the perineal membrane and the crura and bulbs lie below it, so the female copy of the muscles is lifted until its lower border is clear of the complex.
//
// The lift is a smooth vertical shear: every vertex keeps its x and z and moves up by D(x, z), a smooth field on a 2 mm grid. A vertical shear keeps the topology, the thickness and the fibre
// direction of the muscle, cannot fold a surface over on itself (it has determinant 1), and is the same for all six muscles (they share one field), so neighbouring muscles stay in contact.
// D is the largest lift any vertex under a given spot needs to end CLEARANCE above the top of the complex, spread over a few centimetres by a max filter and a Gaussian blur so that it fades to
// zero where the muscle is far from the complex (the part behind the anorectal junction and the lateral attachments do not move). No plane cuts the mesh.
import fs from 'node:fs';
import zlib from 'node:zlib';
import {fitClitoris} from './clitoris-place.mjs';

/** The levator ani parts of the atlas: left and right iliococcygeus, pubococcygeus and puborectalis. Coccygeus lies behind the complex and is not copied. */
export const PELVIC_FLOOR_IDS = ['FJ2544', 'FJ2545', 'FJ2546', 'FJ2549', 'FJ2550', 'FJ2551'];
/** The id of the female copy of an atlas part. */
export const femaleCopyId = id => `HRAF-${id}`;
/** Names of the six placed parts of the clitoral complex, in the order the structures are built. */
export const COMPLEX_KEYS = ['glans', 'body', 'crusL', 'crusR', 'bulbL', 'bulbR'];

export const CLEARANCE = .0015;   // the lowest vertex over the complex ends this far above its highest point (m)
const CELL = .002, X0 = -.09, Z0 = -.10, NX = 90, NZ = 80;   // grid of the lift field (m); covers the pelvic floor with room to fade
const DILATE = 8, SIGMA = 5;   // max filter radius and blur sigma in cells: the lift fades out over about 3 cm

const b64 = (t, Type) => { const b = Buffer.from(t, 'base64'); return new Type(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)); };

/**
 * The clitoral complex as scripts/paokao-structures/neck-breast-vulva.mjs places it, before the simplification that package applies (the same fit, from the same hip bones and vagina).
 * hip, vagina: Float64Array of xyz (m), hip = left then right female hip bone. Returns {key: {positions, indices}}.
 */
export function placeClitorisComplex(hip, vagina) {
  const src = JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL('../data/clitoris-mri2.json.gz', import.meta.url)))), parts = {};
  for (const [k, v] of Object.entries(src.parts)) parts[k] = {positions: b64(v.positions, Float32Array), indices: b64(v.indices, Uint32Array)};
  const fit = fitClitoris(Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, v.positions])), hip, vagina), out = {};
  for (const k of COMPLEX_KEYS) { const ps = new Float32Array(parts[k].positions.length); for (let i = 0; i < ps.length; i += 3) ps.set(fit.place([parts[k].positions[i], parts[k].positions[i + 1], parts[k].positions[i + 2]]), i); out[k] = {positions: ps, indices: parts[k].indices}; }
  return out;
}

const cx = x => Math.floor((x - X0) / CELL), cz = z => Math.floor((z - Z0) / CELL);
const inGrid = (a, b) => a >= 0 && b >= 0 && a < NX && b < NZ;
/** Max filter over a disc (radius r cells) or, with square = true, over a (2r+1) square. */
function dilate(A, r, square = false) {
  const B = new Float32Array(A.length);
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
    let m = -1e9;
    for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) { if (!square && di * di + dj * dj > r * r) continue; const a = i + di, b = j + dj; if (inGrid(a, b)) m = Math.max(m, A[b * NX + a]); }
    B[j * NX + i] = m;
  }
  return B;
}
function blur(A, s) {
  const r = Math.ceil(3 * s), k = []; for (let d = -r; d <= r; d++) k.push(Math.exp(-d * d / (2 * s * s)));
  const pass = (src, horiz) => { const B = new Float32Array(A.length); for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) { let v = 0, w = 0; for (let d = -r; d <= r; d++) { const a = horiz ? i + d : i, b = horiz ? j : j + d; if (!inGrid(a, b)) continue; v += src[b * NX + a] * k[d + r]; w += k[d + r]; } B[j * NX + i] = v / w; } return B; };
  return pass(pass(A, true), false);
}
function sample(A, x, z) {
  const fx = (x - X0) / CELL - .5, fz = (z - Z0) / CELL - .5, i = Math.floor(fx), j = Math.floor(fz), tx = fx - i, tz = fz - j;
  const g = (a, b) => A[Math.max(0, Math.min(NZ - 1, b)) * NX + Math.max(0, Math.min(NX - 1, a))];
  return (g(i, j) * (1 - tx) + g(i + 1, j) * tx) * (1 - tz) + (g(i, j + 1) * (1 - tx) + g(i + 1, j + 1) * tx) * tz;
}

/**
 * The lift field. muscles: Float32Array position arrays (the six muscles); complex: position arrays of the clitoral complex.
 * Returns {D, top, gain}: D the lift in metres on the grid, top the height of the complex (dilated by one cell) that the muscle has to clear.
 */
export function buildLiftField(muscles, complex) {
  const top = new Float32Array(NX * NZ).fill(-1e9);
  for (const P of complex) for (let i = 0; i < P.length; i += 3) { const a = cx(P[i]), b = cz(P[i + 2]); if (inGrid(a, b)) top[b * NX + a] = Math.max(top[b * NX + a], P[i + 1]); }
  const floor = dilate(top, 1, true);   // a vertex within 2 mm (in the horizontal plane) of the complex has to clear the complex vertex it is next to
  const need = new Float32Array(NX * NZ);
  for (const P of muscles) for (let i = 0; i < P.length; i += 3) { const a = cx(P[i]), b = cz(P[i + 2]); if (!inGrid(a, b) || floor[b * NX + a] < -1e8) continue; need[b * NX + a] = Math.max(need[b * NX + a], floor[b * NX + a] + CLEARANCE - P[i + 1]); }
  let D = blur(dilate(need, DILATE), SIGMA), gain = 1;
  for (let round = 0; round < 40; round++) {   // the blur can leave a vertex short of what it needs; scale the field up until every vertex clears
    let worst = 0;
    for (const P of muscles) for (let i = 0; i < P.length; i += 3) { const a = cx(P[i]), b = cz(P[i + 2]); if (!inGrid(a, b) || floor[b * NX + a] < -1e8) continue; worst = Math.max(worst, floor[b * NX + a] + CLEARANCE - (P[i + 1] + sample(D, P[i], P[i + 2]))); }
    if (worst <= 0) break;
    const f = 1 + Math.max(.02, worst / .01); gain *= f; D = D.map(v => v * f);
  }
  return {D, top: floor, gain};
}

/** Moves a position array up by the field (x and z are unchanged). */
export function liftPositions(P, field) {
  const out = new Float32Array(P.length);
  for (let i = 0; i < P.length; i += 3) { out[i] = P[i]; out[i + 1] = P[i + 1] + sample(field.D, P[i], P[i + 2]); out[i + 2] = P[i + 2]; }
  return out;
}
