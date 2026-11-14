// Internal jugular vein (IJV) alignment in the carotid sheath: derives the per-height shift table used by app/biomechanics-v2/jugular-align.ts from measurements,
// and reports the before/after relation of vagus nerve, common carotid artery (CCA) and IJV.
//   node scripts/derive-jugular-shift.mjs derive   prints the shift rows (paste them into jugular-align.ts)
//   node scripts/derive-jugular-shift.mjs report   prints the per-centimetre tables, before (source) and after (alignJugulars applied)
//   node scripts/derive-jugular-shift.mjs groove   prints how far the vagus would still have to move (not applied) to lie 1 mm from both walls
// Coordinates: metres, x to the left, y up, z forward. "out" = away from the midline (right side mirrored), "fwd" = anterior.
import fs from 'node:fs';
import zlib from 'node:zlib';
import {createRequire} from 'node:module';
import {Matrix4, Quaternion, Vector3} from 'three';
import {quizModule} from './quiz-modules.mjs';
import {correctNerve} from './lib/nerve-corrections.mjs';
const root = new URL('../', import.meta.url).pathname, mode = process.argv[2] || 'report';
const {joinCarotids} = await quizModule('app/biomechanics-v2/carotid-junction.ts');
const {alignJugulars, JUGULAR_SHIFTS} = await quizModule('app/biomechanics-v2/jugular-align.ts');
const GAP = 0.0015;          // wanted wall-to-wall gap between CCA/ICA/ECA and IJV: the vessels of the sheath touch, a millimetre of connective tissue
const MIN_ANGLE = 10, MAX_ANGLE = 45;  // IJV sits lateral and a little anterior: direction from the artery 10 degrees forward of pure lateral
const BOTTOM = 0.024, TOP_FROM = 1.52, TOP_TO = 1.575;   // transitions that keep the two ends of the vein where they are

const raw = () => JSON.parse(zlib.gunzipSync(fs.readFileSync(root + 'public/models/neck-vessels.json.gz'))).vessels.map(v => ({...v, positions: v.positions.slice()}));
function vagus() {   // the corrected vagus trunks, decoded as prepare-nerve-stream.mjs does
  fs.mkdirSync(root + '.sites-runtime', {recursive: true}); fs.copyFileSync(root + 'public/draco/draco_wasm_wrapper.js', root + '.sites-runtime/ijv-draco.cjs');
  return createRequire(import.meta.url)(root + '.sites-runtime/ijv-draco.cjs')({wasmBinary: fs.readFileSync(root + 'public/draco/draco_decoder.wasm')}).then(draco => {
    const bytes = fs.readFileSync(root + 'public/models/nervous.glb'), n = bytes.readUInt32LE(12), gltf = JSON.parse(bytes.subarray(20, 20 + n)), bin = bytes.subarray(28 + n);
    const parents = new Map(), world = []; gltf.nodes.forEach((nd, i) => (nd.children ?? []).forEach(c => parents.set(c, i)));
    const matrix = i => { if (world[i]) return world[i]; const nd = gltf.nodes[i], m = nd.matrix ? new Matrix4().fromArray(nd.matrix) : new Matrix4().compose(new Vector3(...(nd.translation ?? [0, 0, 0])), new Quaternion(...(nd.rotation ?? [0, 0, 0, 1])), new Vector3(...(nd.scale ?? [1, 1, 1]))); const p = parents.get(i); return world[i] = p === undefined ? m : new Matrix4().multiplyMatrices(matrix(p), m); };
    const out = {};
    for (const [i, nd] of gltf.nodes.entries()) {
      if (nd.mesh === undefined || !/^Vagus nerve \(X\)\.[lr]\.001$/.test(nd.name ?? '')) continue;
      for (const pr of gltf.meshes[nd.mesh].primitives) {
        const ext = pr.extensions.KHR_draco_mesh_compression, view = gltf.bufferViews[ext.bufferView], dec = new draco.Decoder(), buf = new draco.DecoderBuffer(), mesh = new draco.Mesh();
        const data = bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength); buf.Init(data, data.length); dec.DecodeBufferToMesh(buf, mesh);
        const vals = new draco.DracoFloat32Array(); dec.GetAttributeFloatForAllPoints(mesh, dec.GetAttributeByUniqueId(mesh, ext.attributes.POSITION), vals);
        const pos = new Float32Array(mesh.num_points() * 3), v = new Vector3();
        for (let k = 0; k < mesh.num_points(); k++) { v.set(vals.GetValue(k * 3), vals.GetValue(k * 3 + 1), vals.GetValue(k * 3 + 2)).applyMatrix4(matrix(i)); pos.set(v.toArray(), k * 3); }
        const idx = new Uint32Array(mesh.num_faces() * 3), face = new draco.DracoInt32Array();
        for (let k = 0; k < mesh.num_faces(); k++) { dec.GetFaceFromMesh(mesh, k, face); for (let j = 0; j < 3; j++) idx[k * 3 + j] = face.GetValue(j); }
        correctNerve(nd.name, pos, idx); out[nd.name] = pos;
      }
    }
    return out;
  });
}
const band = (pos, y, h) => { const o = []; for (let i = 0; i < pos.length; i += 3) if (Math.abs(pos[i + 1] - y) <= h) o.push([pos[i], pos[i + 1], pos[i + 2]]); return o; };
const ctr = p => [p.reduce((a, b) => a + b[0], 0) / p.length, p.reduce((a, b) => a + b[2], 0) / p.length];
const rad = (p, c) => p.reduce((a, b) => a + Math.hypot(b[0] - c[0], b[2] - c[1]), 0) / p.length;
const minDc = (c, y, B) => { let m = 1e9; for (const b of B) { const d = Math.hypot(c[0] - b[0], y - b[1], c[1] - b[2]); if (d < m) m = d; } return m; };
const SIDES = [['L', 'Left common carotid artery', 'Internal carotid artery.l', 'External carotid artery.l', 'Internal jugular vein.l', 'Vagus nerve (X).l.001', 1],
               ['R', 'Right common carotid artery', 'Internal carotid artery.r', 'External carotid artery.r', 'Internal jugular vein.r', 'Vagus nerve (X).r.001', -1]];
const smooth = t => { const x = Math.max(0, Math.min(1, t)); return x * x * (3 - 2 * x); };
const vagi = await vagus();
const scene = (aligned) => { const vs = raw(); joinCarotids(vs); if (aligned) alignJugulars(vs); return new Map(vs.map(v => [v.name, v.positions])); };

/** artery (CCA below its end, else ICA) and IJV centre/radius at height y, in the (out, fwd) plane of one side */
function frame(S, y, side) {
  const [, cca, ica, eca, ijv, vag, sg] = side, h = 0.002;
  const C = band(S.get(cca), y, h), I = band(S.get(ica), y, h), E = band(S.get(eca), y, h), J = band(S.get(ijv), y, h), V = band(vagi[vag], y, h);
  if (!J.length || !V.length) return null;
  const A = C.length >= 6 ? C : I; if (A.length < 6) return null;
  const ca = ctr(A), ra = rad(A, ca), cj = ctr(J), rj = rad(J, cj), cv = ctr(V), rv = rad(V, cv);
  const to = c => [(c[0] - ca[0]) * sg, c[1] - ca[1]];
  return {ca, ra, cj, rj, cv, rv, sg, art: C.length >= 6 ? 'CCA' : 'ICA', ecaRel: E.length >= 6 ? [ctr(E), rad(E, ctr(E))] : null, icaRel: I.length >= 6 ? [ctr(I), rad(I, ctr(I))] : null, ccaRel: C.length >= 6 ? [ctr(C), rad(C, ctr(C))] : null, to};
}
/** direction wanted from the artery, degrees forward of pure lateral: slightly anterior in the neck; above the carotid bifurcation the vein passes behind the external carotid on its way to the jugular foramen */
const wantedAngle = y => y <= 1.51 ? MIN_ANGLE : Math.max(-50, MIN_ANGLE - (y - 1.51) / 0.04 * (MIN_ANGLE + 50));
/** pushes the centre j (out, fwd relative to the artery centre) straight away from any carotid branch it would touch, to a wall gap of GAP */
function clear(f, j) {
  const {ca, rj, sg} = f;
  for (let it = 0; it < 30; it++) for (const o of [f.icaRel, f.ecaRel]) {
    if (!o) continue; const oc = [(o[0][0] - ca[0]) * sg, o[0][1] - ca[1]], need = o[1] + rj + GAP, dx = j[0] - oc[0], dz = j[1] - oc[1], d = Math.hypot(dx, dz) || 1e-6;
    if (d < need) j = [oc[0] + dx / d * need, oc[1] + dz / d * need];
  }
  return j;
}
/** wanted IJV centre: tangent to the artery (gap GAP), lateral and slightly anterior; the angle is the wanted one (equalGapAngle, the angle that would put the vagus equally far from both walls, is returned for the report: it is always behind the wanted one) */
function target(f, y) {
  const {ca, ra, rj, cv, sg} = f, D = ra + rj + GAP, v = [(cv[0] - ca[0]) * sg, cv[1] - ca[1]], dv = Math.hypot(...v);
  let eq = null;
  for (let a = -60; a <= MAX_ANGLE; a += 0.5) {
    const t = a * Math.PI / 180, j = [D * Math.cos(t), D * Math.sin(t)], e = Math.abs((dv - ra) - (Math.hypot(v[0] - j[0], v[1] - j[1]) - rj));
    if (!eq || e < eq.e) eq = {e, a};
  }
  const a = wantedAngle(y), t = a * Math.PI / 180;
  return {j: [D * Math.cos(t), D * Math.sin(t)], angle: a, equalGapAngle: eq.a};
}
function derive() {
  const S = scene(false), rows = {};
  for (const side of SIDES) {
    const rel = [];
    for (let y = 1.416; y <= 1.5851; y += 0.005) {
      const f = frame(S, y, side); if (!f) continue;
      const cur = f.to(f.cj), t = target(f, y), wb = smooth((y - 1.416) / BOTTOM), wt = smooth((TOP_TO - y) / (TOP_TO - TOP_FROM)), w = Math.min(wb, wt);
      let j = [cur[0] + (t.j[0] - cur[0]) * w, cur[1] + (t.j[1] - cur[1]) * w];
      if (f.art === 'ICA') j = clear(f, j);
      rel.push([Math.round(y * 1000), (j[0] - cur[0]) * 1000, (j[1] - cur[1]) * 1000, t.angle, f.art]);
    }
    // three-point smoothing of the targets below the carotid bifurcation (the measured bands are noisy), ends stay at zero; above it the rows keep the clearance to the branches exactly
    const sm = rel.map((r, i) => i === 0 || i === rel.length - 1 ? [r[0], 0, 0] : r[0] >= 1490 ? [r[0], r[1], r[2]] : [r[0], (rel[i - 1][1] + r[1] * 2 + rel[i + 1][1]) / 4, (rel[i - 1][2] + r[2] * 2 + rel[i + 1][2]) / 4]);
    rows[side[0]] = sm.map(r => [r[0], +r[1].toFixed(1), +r[2].toFixed(1)]);
    console.log(side[0], 'angles', rel.map(r => `${r[0]}:${r[3].toFixed(0)}${r[4][0]}`).join(' '));
  }
  console.log(JSON.stringify(rows));
}
function report() {
  const f1 = v => (v * 1000).toFixed(1);
  for (const label of ['before', 'after']) {
    const S = scene(label === 'after');
    for (const side of SIDES) {
      const [name, , , , , , sg] = side;
      console.log(`\n${name} (${label}) | y m | CCA r, IJV r mm | vagus rel CCA out,fwd | vagus rel IJV out,fwd | CCA-IJV centre out,fwd,dist | vagus centre to CCA wall, to IJV wall | CCA-IJV wall gap`);
      for (let y = 1.42; y <= 1.4901; y += 0.01) {
        const C = band(S.get(side[1]), y, .002), J = band(S.get(side[4]), y, .002), V = band(vagi[side[5]], y, .002);
        const cc = ctr(C), cj = ctr(J), cv = ctr(V), rc = rad(C, cc), rj = rad(J, cj);
        const rel = (a, b) => `${((a[0] - b[0]) * sg * 1000).toFixed(1)},${((a[1] - b[1]) * 1000).toFixed(1)}`;
        const wc = minDc(cv, y, band(S.get(side[1]), y, .01)), wj = minDc(cv, y, band(S.get(side[4]), y, .01));
        const dist = Math.hypot(cc[0] - cj[0], cc[1] - cj[1]);
        console.log(y.toFixed(2), '|', f1(rc), f1(rj), '|', rel(cv, cc), '|', rel(cv, cj), '|', `${((cc[0] - cj[0]) * sg * 1000).toFixed(1)},${((cc[1] - cj[1]) * 1000).toFixed(1)},${(dist * 1000).toFixed(1)}`, '|', f1(wc), f1(wj), '|', ((dist - rc - rj) * 1000).toFixed(1));
      }
    }
  }
}
/** what the vagus table would have to move by (not applied) for the vagus to sit in the groove, 1 mm from both walls: the circle intersection behind the two vessels */
function groove() {
  const S = scene(true);
  for (const side of SIDES) {
    console.log(`\n${side[0]} groove: y | vagus now rel CCA out,fwd | groove point rel CCA out,fwd | extra vagus shift out,fwd mm`);
    for (let y = 1.42; y <= 1.4801; y += 0.01) {
      const C = band(S.get(side[1]), y, .002), J = band(S.get(side[4]), y, .002), V = band(vagi[side[5]], y, .002), sg = side[6];
      const cc = ctr(C), cj = ctr(J), cv = ctr(V), rc = rad(C, cc), rj = rad(J, cj), rv = rad(V, cv);
      const j = [(cj[0] - cc[0]) * sg, cj[1] - cc[1]], r1 = rc + rv + 0.001, r2 = rj + rv + 0.001, d = Math.hypot(...j);
      if (d > r1 + r2 || d < Math.abs(r1 - r2)) { console.log(y.toFixed(2), 'no solution'); continue; }
      const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, r1 * r1 - a * a)), ux = j[0] / d, uz = j[1] / d;
      const c1 = [a * ux + h * uz, a * uz - h * ux], c2 = [a * ux - h * uz, a * uz + h * ux], p = c1[1] < c2[1] ? c1 : c2;
      const now = [(cv[0] - cc[0]) * sg, cv[1] - cc[1]];
      console.log(y.toFixed(2), '|', now.map(x => (x * 1000).toFixed(1)).join(','), '|', p.map(x => (x * 1000).toFixed(1)).join(','), '|', ((p[0] - now[0]) * 1000).toFixed(1) + ',' + ((p[1] - now[1]) * 1000).toFixed(1));
    }
  }
}
/** centres (metres) of CCA, IJV and vagus at the given heights, before and after: anchors for the labels of the review screenshots */
function anchors(heights) {
  const out = {};
  for (const label of ['before', 'after']) {
    const S = scene(label === 'after'); out[label] = {};
    for (const y of heights) {
      out[label][y] = {};
      for (const side of SIDES) {
        const at = (pos) => { const b = band(pos, y, .002), c = ctr(b); return [c[0], y, c[1]]; };
        out[label][y][side[0]] = {cca: at(S.get(side[1])), ijv: at(S.get(side[4])), vagus: at(vagi[side[5]])};
      }
    }
  }
  console.log(JSON.stringify(out));
}
if (mode === 'derive') derive(); else if (mode === 'groove') groove(); else if (mode === 'anchors') anchors(process.argv.slice(3).map(Number)); else report();
