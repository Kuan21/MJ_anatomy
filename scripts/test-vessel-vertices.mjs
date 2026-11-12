// Regression test: no artery or vein vertex may fly away from its mesh when the joints move.
// The body is posed with the viewer's own solvers (scripts/lib/stability-motion.mjs) and every artery and vein mesh the viewer draws
// (atlas, schematic models and the vessel-end pieces) is measured against its rest shape:
//   spike     a vertex with an edge longer than SPIKE_MM once posed and more than SPIKE_RATIO times its rest length
//             (neighbouring vertices went to different bones: the mesh shows thorns that stick out of the body);
//   swollen   the posed bounding box is more than BOX_RATIO times the rest one (part of the mesh left with another bone);
//   detached  every tube of a vessel-end piece (connector, bridge, taper) must stay on the vessel it starts on.
// History: commit b5b68ea (PR #120) made the arm weight field fall off with the distance from the humerus. Vessel-end pieces and two schematic arteries
// read that field vertex by vertex, so at shoulder abduction 158 about 900 vertices were pulled up to 6 cm out of their mesh.
// Known findings are listed in docs/vessel-vertices-known.json with the measured value; a new finding, or a known one that got worse, fails. The list may only shrink.
//   node scripts/test-vessel-vertices.mjs [--list] [--write]      --write rewrites the known list from the current state (review the diff before committing)
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadStabilityParts} from './lib/stability-world.mjs';
import {loadMotion, registerNerves, makePoser} from './lib/stability-motion.mjs';

const file = f => fileURLToPath(new URL('../' + f, import.meta.url)), flag = n => process.argv.includes('--' + n);
export const SPIKE_MM = 4, SPIKE_RATIO = 3, BOX_RATIO = 2.2, BASE_MM = 2;
export const POSES = [
  {name: 'shoulder abduction 158', kind: 'arm', arm: {shoulderAbduction: 158}},
  {name: 'shoulder flexion 73 + abduction 158', kind: 'arm', arm: {shoulderFlexion: 73, shoulderAbduction: 158}},
  {name: 'shoulder flexion 97', kind: 'arm', arm: {shoulderFlexion: 97}},
  {name: 'internal rotation 48 + elbow flexion 129 + wrist flexion 80', kind: 'arm', arm: {shoulderRotation: 48, elbowFlexion: 129, wristFlexion: 80}},
  {name: 'elbow flexion 140', kind: 'arm', arm: {elbowFlexion: 140}},
  {name: 'hip flexion 120 + knee flexion 130', kind: 'leg', body: {flexion: 120, knee: 130}},
  {name: 'head flexion 40', kind: 'head', body: {flexion: 40}},
];

const dist = (A, a, b) => Math.hypot(A[a * 3] - A[b * 3], A[a * 3 + 1] - A[b * 3 + 1], A[a * 3 + 2] - A[b * 3 + 2]);
const diagonal = P => { const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { if (P[i + k] < lo[k]) lo[k] = P[i + k]; if (P[i + k] > hi[k]) hi[k] = P[i + k]; } return Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]); };

/** Vertices with a spike edge, and the longest such edge (metres). Exported for the unit cases below. */
export function spikes(rest, posed, indices) {
  const bad = new Uint8Array(rest.length / 3); let worst = 0, broken = false;
  for (let t = 0; t < indices.length; t += 3) for (let k = 0; k < 3; k++) {
    const a = indices[t + k], b = indices[t + (k + 1) % 3], q = dist(posed, a, b);
    if (!Number.isFinite(q)) { broken = true; bad[a] = bad[b] = 1; continue; }
    if (q > SPIKE_MM / 1000 && q > SPIKE_RATIO * Math.max(dist(rest, a, b), 1e-5)) { bad[a] = bad[b] = 1; if (q > worst) worst = q; }
  }
  let n = 0; for (const v of bad) n += v;
  return {n, worst, broken};
}
/** Connected tubes of a mesh (vertices at the same place are welded). */
export function tubes(positions, indices) {
  const count = positions.length / 3, parent = Int32Array.from({length: count}, (_, i) => i), find = i => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; }, seen = new Map();
  for (let i = 0; i < count; i++) { const k = `${Math.round(positions[i * 3] * 1e5)},${Math.round(positions[i * 3 + 1] * 1e5)},${Math.round(positions[i * 3 + 2] * 1e5)}`, w = seen.get(k); if (w === undefined) seen.set(k, i); else parent[find(i)] = find(w); }
  for (let t = 0; t < indices.length; t += 3) { const a = find(indices[t]); parent[find(indices[t + 1])] = a; parent[find(indices[t + 2])] = a; }
  const groups = new Map(); for (let i = 0; i < count; i++) { const r = find(i); (groups.get(r) ?? groups.set(r, []).get(r)).push(i); }
  return [...groups.values()];
}

// ---- unit cases of the detectors (no model needed)
{
  const rest = Float32Array.from([0, 0, 0, .001, 0, 0, 0, .001, 0]), tri = Uint32Array.from([0, 1, 2]);
  const same = spikes(rest, rest, tri), far = spikes(rest, Float32Array.from([0, 0, 0, .02, 0, 0, 0, .001, 0]), tri), nan = spikes(rest, Float32Array.from([0, 0, 0, NaN, 0, 0, 0, .001, 0]), tri);
  if (same.n !== 0 || far.n !== 3 || !(far.worst > .019) || !nan.broken) throw new Error('spike detector self-test failed');
  const two = tubes(Float32Array.from([0, 0, 0, 1, 0, 0, 0, 1, 0, 5, 0, 0, 6, 0, 0, 5, 1, 0, 0, 0, 0]), Uint32Array.from([0, 1, 2, 3, 4, 5]));
  if (two.length !== 2 || two[0].length !== 4) throw new Error('tube grouping self-test failed');
}

const {atlas, geometry, parts} = loadStabilityParts(), m = await loadMotion();
registerNerves(m, atlas, parts);
const poser = makePoser(m, atlas, geometry, parts, p => p.load());
const vessels = parts.filter(p => ['arterial', 'venous'].includes(p.system)), byId = new Map(parts.map(p => [p.id, p]));
const findings = {};   // key -> {name, pose, value, detail}
const add = (key, name, pose, value, detail) => { const old = findings[key]; if (!old || value > old.value) findings[key] = {name, pose, value, detail}; };
let measured = 0, endTubes = 0;
for (const pz of POSES) {
  const {posed} = poser.pose(pz);
  for (const p of vessels) {
    const Q = posed.get(p.id); if (!(Q instanceof Float32Array)) continue;
    const g = p.load(), P = g.positions, I = g.indices; measured++;
    const s = spikes(P, Q, I);
    if (s.broken) add(`${p.id}|nan`, p.name, pz.name, 1e9, 'a posed coordinate is not a number');
    if (s.n) add(`${p.id}|spike`, p.name, pz.name, Math.round(s.worst * 1000), `${s.n} of ${P.length / 3} vertices on edges stretched more than ${SPIKE_RATIO} times, longest ${Math.round(s.worst * 1000)} mm`);
    const grow = diagonal(Q) / Math.max(diagonal(P), 1e-6);
    if (grow > BOX_RATIO) add(`${p.id}|swollen`, p.name, pz.name, +grow.toFixed(2), `posed bounding box is ${grow.toFixed(2)} times the rest one`);
    if (p.id.endsWith('-END')) {
      const main = byId.get(p.id.slice(0, -4)), M = main?.load().positions, MQ = main && posed.get(main.id);
      for (const tube of tubes(P, I)) {
        endTubes++;
        if (!(MQ instanceof Float32Array)) continue;
        // attached: the tube vertex nearest to the vessel stays where that vessel vertex goes
        let bi = tube[0], bj = 0, bd = Infinity;
        for (const i of tube) for (let j = 0; j < M.length / 3; j++) { const d = Math.hypot(P[i * 3] - M[j * 3], P[i * 3 + 1] - M[j * 3 + 1], P[i * 3 + 2] - M[j * 3 + 2]); if (d < bd) { bd = d; bi = i; bj = j; } }
        const after = Math.hypot(Q[bi * 3] - MQ[bj * 3], Q[bi * 3 + 1] - MQ[bj * 3 + 1], Q[bi * 3 + 2] - MQ[bj * 3 + 2]), moved = (after - bd) * 1000;
        if (moved > BASE_MM) add(`${p.id}|detached`, p.name, pz.name, +moved.toFixed(1), `a tube of the end piece ends up ${moved.toFixed(1)} mm further from its vessel than at rest`);
      }
    }
  }
}

const knownFile = file('docs/vessel-vertices-known.json'), known = fs.existsSync(knownFile) ? JSON.parse(fs.readFileSync(knownFile, 'utf8')).known : {};
if (flag('write')) {
  const out = {}; for (const k of Object.keys(findings).sort()) out[k] = {name: findings[k].name, pose: findings[k].pose, value: findings[k].value, reason: known[k]?.reason ?? 'existing at the time the test was added; to be fixed'};
  fs.writeFileSync(knownFile, JSON.stringify({_doc: 'Known findings of scripts/test-vessel-vertices.mjs. key = part id | kind. value = worst measured value (spike: mm; swollen: ratio; detached: mm). The list may only shrink.', known: out}, null, 1) + '\n');
  console.log(`Wrote ${Object.keys(out).length} known findings.`);
}
const tolerance = k => k.endsWith('|spike') ? 2 : k.endsWith('|detached') ? 1 : .1;
const fresh = Object.keys(findings).filter(k => !known[k]), worse = Object.keys(findings).filter(k => known[k] && findings[k].value > known[k].value + tolerance(k)), gone = Object.keys(known).filter(k => !findings[k]);
if (flag('list')) for (const k of Object.keys(findings).sort()) console.log(`${fresh.includes(k) ? 'NEW   ' : worse.includes(k) ? 'WORSE ' : 'known '}${k}  ${findings[k].name}  [${findings[k].pose}]  ${findings[k].detail}`);
console.log(`Vessel vertices: ${vessels.length} artery and vein meshes, ${measured} posed meshes in ${POSES.length} poses, ${endTubes} end-piece tubes checked; ${Object.keys(findings).length} findings (${Object.keys(known).length} known), ${fresh.length} new, ${worse.length} worse, ${gone.length} fixed but still listed.`);
if (!flag('write') && (fresh.length || worse.length || gone.length)) { console.error('FAIL vessel vertices: run with --list to see the meshes. A fixed finding has to be removed from docs/vessel-vertices-known.json.'); process.exit(1); }
console.log('PASS vessel vertices.');
