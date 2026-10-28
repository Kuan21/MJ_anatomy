// Registers the Human Reference Atlas female pelvis (scripts/data/hra-female-pelvis-bones.json.gz) onto the BodyParts3D body:
// an iterative-closest-point fit of the HRA sacrum and hip bones to the atlas sacrum and hip bones, with the two femoral head centres as heavily weighted
// landmarks so that the atlas femurs still sit in the HRA acetabula. The result is stored in scripts/data/female-pelvis-registration.json, which
// prepare-female.mjs applies to the pelvis and to the HRA organs.
//   node scripts/fit-female-pelvis.mjs          (write)
//   node scripts/fit-female-pelvis.mjs --check  (fail when the stored registration is stale or fits badly)
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {icp, applyFit} from './lib/similarity-fit.mjs';

const root = new URL('../', import.meta.url), file = new URL('data/female-pelvis-registration.json', import.meta.url);
const atlas = JSON.parse(fs.readFileSync(new URL('public/models/atlas.json', root)));
const chunks = new Map(), chunk = i => { if (!chunks.has(i)) chunks.set(i, fs.readFileSync(new URL('public' + atlas.chunks[i].url, root))); return chunks.get(i); };
const positionsOf = name => { const p = atlas.parts.find(q => q.name === name); if (!p) throw new Error(`atlas has no ${name}`); const b = chunk(p.chunk); return new Float32Array(b.buffer.slice(b.byteOffset + p.positions, b.byteOffset + p.positions + p.vertexCount * 12)); };
const dec = (text, Type) => { const b = Buffer.from(text, 'base64'); return new Type(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)); };
const sample = (P, step) => { const out = []; for (let i = 0; i < P.length; i += 3 * step) out.push([P[i], P[i + 1], P[i + 2]]); return out; };

// Centre of an atlas femoral head: sphere through the medial half of the top 5 cm of the femur (same recipe as extract-hra-pelvis-bones.mjs).
function sphereFit(pts) {
  let c = [0, 0, 0]; for (const p of pts) for (let k = 0; k < 3; k++) c[k] += p[k] / pts.length;
  let r = 0;
  for (let it = 0; it < 40; it++) {
    const d = pts.map(p => Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2])); r = d.reduce((a, b) => a + b, 0) / d.length;
    const s = [0, 0, 0]; pts.forEach((p, i) => { for (let k = 0; k < 3; k++) s[k] += (p[k] - r * (p[k] - c[k]) / d[i]) / pts.length; }); c = s;
  }
  return c;
}
function atlasHead(side) {
  const P = positionsOf(`${side} femur`); let top = -Infinity; for (let k = 1; k < P.length; k += 3) top = Math.max(top, P[k]);
  const cand = []; for (let k = 0; k < P.length; k += 3) if (P[k + 1] > top - .05) cand.push([P[k], P[k + 1], P[k + 2]]);
  const xs = cand.map(p => p[0]).sort((a, b) => a - b), mid = xs[xs.length >> 1];
  return sphereFit(cand.filter(p => side === 'Left' ? p[0] < mid : p[0] > mid));
}

const source = JSON.parse(gunzipSync(fs.readFileSync(new URL('data/hra-female-pelvis-bones.json.gz', import.meta.url))));
const hra = source.pieces.flatMap(p => sample(dec(p.positions, Float32Array), 3));
const target = ['Left hip bone', 'Right hip bone', 'Sacrum'].flatMap(n => sample(positionsOf(n), 3));
const heads = {L: [source.femoralHeads.L.center, atlasHead('Left')], R: [source.femoralHeads.R.center, atlasHead('Right')]};
const start = {s: .9, R: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], t: [0, .8875, .018]};
const T = icp(hra, target, {landmarks: Object.values(heads), landmarkWeight: 5000, start});
const dist = p => { const q = applyFit(T, p); let b = Infinity; for (const a of target) b = Math.min(b, Math.hypot(a[0] - q[0], a[1] - q[1], a[2] - q[2])); return b; };
const d = hra.map(dist).sort((a, b) => a - b), mm = v => +(v * 1000).toFixed(1);
const headError = Object.fromEntries(Object.entries(heads).map(([k, [h, a]]) => [k, mm(Math.hypot(...applyFit(T, h).map((v, i) => v - a[i])))]));
const round = v => +v.toFixed(6);
const result = {note: 'Similarity transform HRA frame (metres) → BodyParts3D atlas frame, from scripts/fit-female-pelvis.mjs', scale: round(T.s), rotation: T.R.map(r => r.map(round)), translation: T.t.map(round),
  fit: {medianBoneDistanceMm: mm(d[d.length >> 1]), p90BoneDistanceMm: mm(d[Math.floor(d.length * .9)]), femoralHeadErrorMm: headError}};
if (process.argv.includes('--check')) {
  const stored = JSON.parse(fs.readFileSync(file));
  const off = Math.max(Math.abs(stored.scale - result.scale), ...stored.translation.map((v, i) => Math.abs(v - result.translation[i])));
  if (off > 2e-4) { console.error(`female pelvis registration is stale (scale/translation differ by ${off}); run node scripts/fit-female-pelvis.mjs`); process.exit(1); }
  if (Math.max(...Object.values(stored.fit.femoralHeadErrorMm)) > 3 || stored.fit.medianBoneDistanceMm > 8) { console.error('female pelvis does not sit on the atlas femurs', JSON.stringify(stored.fit)); process.exit(1); }
  console.log(`female pelvis registration ok: scale ${stored.scale}, femoral heads ${JSON.stringify(stored.fit.femoralHeadErrorMm)} mm, median bone distance ${stored.fit.medianBoneDistanceMm} mm`);
} else { fs.writeFileSync(file, JSON.stringify(result, null, 1) + '\n'); console.log(JSON.stringify(result)); }
