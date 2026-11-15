// A vessel and its end piece (`<id>-END`) are in different model packages and reach the motion solver in whatever order the packages finish loading.
// The end piece has to move with its vessel in every order: both in one call, the vessel first and the end piece in a later call, or the end piece first.
// Before this test an end piece that arrived in a different call kept its own chest-wall weights; at shoulder abduction 158 the end pieces of the pectoral
// branch of the thoraco-acromial artery stayed behind in the air while the artery moved with pectoralis major.
//   node scripts/test-vessel-end-arrival.mjs
import assert from 'node:assert/strict';
import {loadStabilityParts} from './lib/stability-world.mjs';
import {loadMotion} from './lib/stability-motion.mjs';
const {atlas, geometry} = loadStabilityParts(), m = await loadMotion();
const input = part => { const g = geometry(part); return {part, base: Float32Array.from(g.positions), normals: g.normals.slice(), triangles: Uint32Array.from(g.indices)}; };
const bound = p => { const b = m.tissueBindings[p.id]; return b && b.name === p.name && !m.isMotionQuarantined(p) && ['upper-limb', 'trunk'].includes(m.anatomicalRegion(p)); };
const ends = atlas.parts.filter(p => p.id.endsWith('-END') && ['arterial', 'venous'].includes(p.system) && bound(p)), mains = ends.map(e => atlas.parts.find(p => p.id === e.id.slice(0, -4))).filter(Boolean);
assert.ok(ends.length > 50 && mains.length === ends.length, `end pieces ${ends.length}, vessels ${mains.length}`);
const POSES = [{shoulderAbduction: 158}, {shoulderFlexion: 150}, {shoulderFlexion: 73, shoulderAbduction: 158}];
const run = order => {
  const solve = m.createShoulderSolver(atlas), neutral = {}, gpu = new Map(), out = [];
  for (const side of ['left', 'right']) Object.assign(neutral, m.buildUpperLimbMotion(atlas, side, {...m.NEUTRAL_POSE, shoulderAbduction: 1}).transforms);
  // the packages arrive while a first pose is shown; each call returns the bindings of the parts it received
  for (const batch of order) { const g = []; solve(batch.map(input), neutral, g); for (const b of g) gpu.set(b.id, b); }
  for (const pose of POSES) { const transforms = {}; for (const side of ['left', 'right']) Object.assign(transforms, m.buildUpperLimbMotion(atlas, side, {...m.NEUTRAL_POSE, ...pose}).transforms); out.push(new Map(solve([], transforms, []).map(r => [r.id, r.positions]))); }
  return {gpu, out};
};
const together = run([[...mains, ...ends]]), later = run([mains, ends]), first = run([ends, mains]);
let solved = 0, worst = 0;
for (const [name, other] of [['the end piece arrives after its vessel', later], ['the end piece arrives before its vessel', first]]) {
  for (const e of ends) {
    const a = together.gpu.get(e.id), b = other.gpu.get(e.id); assert.ok(a && b, `${e.name}: no binding (${name})`);
    assert.deepEqual([...b.indices ?? []], [...a.indices ?? []], `${e.name} (end piece): frames differ when ${name}`);
    assert.deepEqual([...b.weights ?? []], [...a.weights ?? []], `${e.name} (end piece): weights differ when ${name}`);
    POSES.forEach((pose, k) => {
      const p = together.out[k].get(e.id), q = other.out[k].get(e.id); assert.equal(!!p, !!q, `${e.name} (end piece): solved in one order only when ${name}`); if (!p) return;
      solved++; let d = 0; for (let i = 0; i < p.length; i++) d = Math.max(d, Math.abs(p[i] - q[i])); worst = Math.max(worst, d);
      assert.ok(d < 1e-6, `${e.name} (end piece) is ${(d * 1000).toFixed(1)} mm from where it stands when it arrives with its vessel (${name}, ${JSON.stringify(pose)})`);
    });
  }
}
console.log(`Vessel end pieces: ${ends.length} end pieces follow their vessel in every arrival order (${solved} solved positions compared, largest difference ${(worst * 1000).toFixed(4)} mm).`);
