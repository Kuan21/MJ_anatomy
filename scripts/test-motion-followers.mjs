// Every joint dragged to its limits with the real motion solvers (bones are checked by audit-motion-followers.mjs): each structure that belongs to the moving region must move, none may be flung away or turn non-finite.
// Usage: node scripts/test-motion-followers.mjs [--report]  (writes docs/motion-followers-report.md; fails on any structure not listed in docs/motion-static-allowed.json)
import fs from 'node:fs';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {loadFullAtlas} from './lib/full-atlas.mjs';
const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
fs.mkdirSync(file('.sites-runtime'), {recursive: true});
const out = file('.sites-runtime/motion-followers.mjs');
await build({entryPoints: [file('scripts/lib/motion-audit-entry.ts')], bundle: true, format: 'esm', platform: 'node', outfile: out, loader: {'.json': 'json'}, logLevel: 'error', external: ['three']});
const m = await import(out);
const {atlas, geometry} = loadFullAtlas();
const allowed = JSON.parse(fs.readFileSync(file('docs/motion-static-allowed.json'), 'utf8')).map(a => ({re: new RegExp(a.name, 'i'), why: a.why}));
const isAllowed = p => allowed.find(a => a.re.test(p.name));
const centre = p => p.bounds[0].map((v, i) => (v + p.bounds[1][i]) / 2);
const inputs = atlas.parts.map(part => { const g = geometry(part); return {part, base: g.positions, normals: g.normals, triangles: g.indices}; });
const L = m.BODY_LIMITS, N = m.BODY_NEUTRAL;
const lowestLumbar = atlas.parts.filter(p => p.system === 'skeletal' && /lumbar vertebra/i.test(p.name)).map(p => centre(p)[1]).sort((a, b) => a - b)[0];
// Which structures belong to the moving region of each rig (everything else is allowed to stay).
const belongs = {
  spine: p => { const c = centre(p); return c[1] > lowestLumbar + .02 && !/hip bone|sacrum|coccyx/i.test(p.name); },
  head: p => { const c = centre(p); return c[1] > 1.5 && Math.abs(c[0]) < .14 && p.system !== 'integumentary' && !/cervical vertebra/i.test(p.name); },
  leftLeg: p => { const c = centre(p); return m.anatomicalRegion(p) === 'lower-limb' && c[1] < .9 && c[0] > .03 && !/hip bone|sacrum|coccyx/i.test(p.name); },
  rightLeg: p => { const c = centre(p); return m.anatomicalRegion(p) === 'lower-limb' && c[1] < .9 && c[0] < -.03 && !/hip bone|sacrum|coccyx/i.test(p.name); },
};
const poses = {
  spine: [{flexion: L.spine.flexion[1]}, {flexion: L.spine.flexion[0]}, {rotation: L.spine.rotation[1]}, {rotation: L.spine.rotation[0]}, {sideBend: L.spine.sideBend[1]}, {flexion: 50, rotation: 30}],
  head: [{flexion: 40}, {flexion: -35}, {rotation: 60}, {rotation: -60}, {sideBend: 30}],
  leftLeg: [{flexion: 120}, {flexion: -20}, {sideBend: 35}, {rotation: 20}, {knee: 130}, {ankle: 20}],
  rightLeg: [{flexion: 120}, {flexion: -20}, {sideBend: 35}, {rotation: 20}, {knee: 130}, {ankle: 20}],
};
const solve = m.createBodySolver(atlas), report = [], problems = [];
for (const region of Object.keys(poses)) {
  const moved = new Map(), far = new Map(); let n = 0;
  const rig0 = m.makeBodyRig(atlas, region), rigid = new Set([...rig0.focusIds, ...(rig0.skullIds ?? [])]); // parts the rig moves rigidly with a frame
  const strong = {...N, flexion: 20, rotation: 10, sideBend: 5, knee: 20, ankle: 5}, tf = m.buildBodyMotion(rig0, strong).transforms; // bones ride the frame chains: they need a transform
  const first = inputs.filter(i => belongs[region](i.part) && !(i.part.system === 'skeletal' && m.tissueBindings[i.part.id]));
  const rig = m.makeBodyRig(atlas, region), pivot = rig.pivots[1];
  for (const pose of poses[region]) {
    const results = solve(inputs, {region, pose: {...N, ...pose}}), byId = new Map(results.map(r => [r.id, r]));
    n++;
    for (const i of inputs) {
      const r = byId.get(i.part.id); if (!r) continue;
      let max = 0, ok = true; for (let k = 0; k < i.base.length; k++) { const d = Math.abs(r.positions[k] - i.base[k]); if (!Number.isFinite(r.positions[k])) ok = false; if (d > max) max = d; }
      if (!ok) problems.push(`${region}: ${i.part.name} (${i.part.id}) became non-finite`);
      moved.set(i.part.id, Math.max(moved.get(i.part.id) ?? 0, max));
      // a rotation chain about joints near the pivot can carry a point at most about 2.5 times its distance from the first pivot
      let reach = 0; for (let k = 0; k < i.base.length; k += 3) reach = Math.max(reach, Math.hypot(i.base[k] - pivot.x, i.base[k + 1] - pivot.y, i.base[k + 2] - pivot.z));
      if (i.part.system !== 'skeletal' && max > 2.5 * reach + .01) far.set(i.part.id, Math.max(far.get(i.part.id) ?? 0, max));
    }
  }
  const still = first.filter(i => (moved.get(i.part.id) ?? 0) < .0005 && !(i.part.system === 'skeletal' ? tf[i.part.id] : rigid.has(i.part.id)) && !isAllowed(i.part));
  const flung = [...far.keys()].map(id => inputs.find(i => i.part.id === id).part).filter(p => !isAllowed(p));
  console.log(`${region}: ${first.length} structures belong here, ${n} limit poses; ${still.length} did not move, ${flung.length} was carried further than its joints can reach`);
  report.push({region, belong: first.length, still: still.map(i => `${i.part.id} ${i.part.name}`), flung: flung.map(p => `${p.id} ${p.name}`)});
  for (const i of still) problems.push(`${region}: ${i.part.name} (${i.part.id}, ${i.part.system}) stayed in place`);
  for (const p of flung) problems.push(`${region}: ${p.name} (${p.id}) was carried further than its joints can reach`);
}
// Arms: every soft structure of the arm is skinned to the arm (GPU weights or solved here) and every bone of it receives a transform.
{
  const solveArm = m.createShoulderSolver(atlas), U = m.MOTION_LIMITS;
  for (const side of ['left', 'right']) {
    const pose = {...m.NEUTRAL_POSE, shoulderAbduction: U.shoulderAbduction[1], elbowFlexion: U.elbowFlexion[1], forearmRotation: U.forearmRotation[1], wristFlexion: U.wristFlexion[1]};
    const {transforms} = m.buildUpperLimbMotion(atlas, side, pose), gpu = [];
    const results = solveArm(inputs, transforms, gpu), solved = new Set([...results.map(r => r.id), ...gpu.map(g => g.id)]);
    const mine = inputs.filter(i => m.anatomicalRegion(i.part) === 'upper-limb' && m.anatomicalSide(i.part) === side && !m.isMotionQuarantined(i.part));
    const missing = mine.filter(i => !(transforms[i.part.id] || solved.has(i.part.id)) && !isAllowed(i.part));
    console.log(`${side} arm: ${mine.length} structures belong here, ${missing.length} did not follow`);
    for (const i of missing) problems.push(`${side} arm: ${i.part.name} (${i.part.id}, ${i.part.system}) stayed in place`);
    report.push({region: side + 'Arm', belong: mine.length, still: missing.map(i => `${i.part.id} ${i.part.name}`), flung: []});
  }
}
fs.writeFileSync(file('docs/motion-followers-report.json'), JSON.stringify(report, null, 1));
if (problems.length) { console.log(problems.slice(0, 80).join('\n')); console.log(`... ${problems.length} problems`); if (!process.argv.includes('--report')) process.exit(1); }
else console.log('PASS motion followers: every structure of the moving region follows its joint at the limits');
