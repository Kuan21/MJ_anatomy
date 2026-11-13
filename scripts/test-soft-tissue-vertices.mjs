// Regression test: no muscle, tendon, nerve, artery, vein, ligament or fascia may be torn when the joints move.
// The body is posed with the viewer's own solvers (scripts/lib/stability-motion.mjs) and every posed soft-tissue mesh is measured against its rest shape:
//   thorn    a vertex with an edge longer than 4 mm once posed and more than 3 times its rest length (neighbouring vertices went different ways);
//   swollen  the posed bounding box is more than 2.2 times the rest one.
// scripts/test-vessel-vertices.mjs looks closer at arteries and veins (live preview, vessel-end pieces); this test covers every system with one rule.
// Known findings are listed in docs/soft-tissue-vertices-known.json with the measured value; a new finding, or a known one that got worse, fails.
// The list may only shrink.     node scripts/test-soft-tissue-vertices.mjs [--list] [--write]
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadStabilityParts} from './lib/stability-world.mjs';
import {loadMotion, registerNerves, makePoser} from './lib/stability-motion.mjs';
const file = f => fileURLToPath(new URL('../' + f, import.meta.url)), flag = n => process.argv.includes('--' + n);
const POSES = [
  {name: 'shoulder abduction 158', kind: 'arm', arm: {shoulderAbduction: 158}},
  {name: 'shoulder flexion 73 + abduction 158', kind: 'arm', arm: {shoulderFlexion: 73, shoulderAbduction: 158}},
  {name: 'shoulder flexion 97', kind: 'arm', arm: {shoulderFlexion: 97}},
  {name: 'internal rotation 48 + elbow 129 + wrist 80', kind: 'arm', arm: {shoulderRotation: 48, elbowFlexion: 129, wristFlexion: 80}},
  {name: 'elbow flexion 140', kind: 'arm', arm: {elbowFlexion: 140}},
  {name: 'forearm rotation 80', kind: 'arm', arm: {forearmRotation: 80}},
  {name: 'hip 120 + knee 130', kind: 'leg', body: {flexion: 120, knee: 130}},
  {name: 'knee 90', kind: 'leg', body: {knee: 90}},
  {name: 'head flexion 40', kind: 'head', body: {flexion: 40}},
  {name: 'head extension 35', kind: 'head', body: {flexion: -35}},
];
const {atlas, geometry, parts} = loadStabilityParts(), m = await loadMotion(); registerNerves(m, atlas, parts);
const poser = makePoser(m, atlas, geometry, parts, p => p.load());
const group = p => p.system === 'muscular' ? 'muscle' : p.system === 'tendon' ? 'tendon' : p.system === 'nervous' ? 'nerve' : p.system === 'arterial' ? 'artery' : p.system === 'venous' ? 'vein' : p.system === 'connective' ? 'ligament or fascia' : null;
const len = (A, a, b) => Math.hypot(A[a * 3] - A[b * 3], A[a * 3 + 1] - A[b * 3 + 1], A[a * 3 + 2] - A[b * 3 + 2]);
const diag = P => { const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { if (P[i + k] < lo[k]) lo[k] = P[i + k]; if (P[i + k] > hi[k]) hi[k] = P[i + k]; } return Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]); };
const findings = {}, counted = {};
const add = (key, row) => { const old = findings[key]; if (!old || row.value > old.value) findings[key] = row; };
for (const pz of POSES) {
  const {posed} = poser.pose(pz);
  for (const p of parts) {
    const g0 = group(p); if (!g0 || p.part?.kind === 'space') continue;   // a space (axillary fossa …) is a placeholder volume the viewer never draws
    const Q = posed.get(p.id); if (!(Q instanceof Float32Array)) continue;
    const g = p.load(), P = g.positions, I = g.indices; (counted[g0] ??= new Set()).add(p.id);
    const bad = new Uint8Array(P.length / 3); let worst = 0, broken = false;
    for (let t = 0; t < I.length; t += 3) for (let k = 0; k < 3; k++) {
      const a = I[t + k], b = I[t + (k + 1) % 3], q = len(Q, a, b);
      if (!Number.isFinite(q)) { broken = true; continue; }
      if (q > .004 && q > 3 * Math.max(len(P, a, b), 1e-5)) { bad[a] = bad[b] = 1; if (q > worst) worst = q; }
    }
    let n = 0; for (const v of bad) n += v;
    if (broken) add(`${p.id}|nan`, {group: g0, name: p.name, pose: pz.name, value: 1e9, detail: 'a posed coordinate is not a number'});
    if (n) add(`${p.id}|thorn`, {group: g0, name: p.name, pose: pz.name, value: Math.round(worst * 1000), detail: `${n} of ${P.length / 3} vertices on edges stretched more than 3 times, longest ${Math.round(worst * 1000)} mm`});
    const grow = diag(Q) / Math.max(diag(P), 1e-6);
    if (grow > 2.2) add(`${p.id}|swollen`, {group: g0, name: p.name, pose: pz.name, value: +grow.toFixed(2), detail: `posed bounding box is ${grow.toFixed(2)} times the rest one`});
  }
}
const knownFile = file('docs/soft-tissue-vertices-known.json'), known = fs.existsSync(knownFile) ? JSON.parse(fs.readFileSync(knownFile, 'utf8')).known : {};
if (flag('write')) {
  const out = {}; for (const k of Object.keys(findings).sort()) out[k] = {group: findings[k].group, name: findings[k].name, pose: findings[k].pose, value: findings[k].value, reason: known[k]?.reason ?? 'existing when the test was added; to be fixed'};
  fs.writeFileSync(knownFile, JSON.stringify({_doc: 'Known findings of scripts/test-soft-tissue-vertices.mjs. key = part id | kind. value = worst measured value (thorn: longest stretched edge in mm; swollen: ratio). The list may only shrink.', known: out}, null, 1) + '\n');
  console.log(`Wrote ${Object.keys(out).length} known findings.`);
}
const tolerance = k => k.endsWith('|thorn') ? 2 : .1;
const fresh = Object.keys(findings).filter(k => !known[k]), worse = Object.keys(findings).filter(k => known[k] && findings[k].value > known[k].value + tolerance(k)), gone = Object.keys(known).filter(k => !findings[k]);
if (flag('list')) for (const k of Object.keys(findings).sort()) console.log(`${fresh.includes(k) ? 'NEW   ' : worse.includes(k) ? 'WORSE ' : 'known '}${k}  ${findings[k].group}: ${findings[k].name}  [${findings[k].pose}]  ${findings[k].detail}`);
const per = {}; for (const f of Object.values(findings)) per[f.group] = (per[f.group] ?? 0) + 1;
console.log(`Soft-tissue vertices: ${Object.entries(counted).map(([g, s]) => `${s.size} ${g}`).join(', ')} meshes posed in ${POSES.length} poses; findings ${JSON.stringify(per)} (${Object.keys(known).length} known), ${fresh.length} new, ${worse.length} worse, ${gone.length} fixed but still listed.`);
if (!flag('write') && (fresh.length || worse.length || gone.length)) { console.error('FAIL soft-tissue vertices: run with --list to see the meshes. A fixed finding has to be removed from docs/soft-tissue-vertices-known.json.'); process.exit(1); }
console.log('PASS soft-tissue vertices.');
