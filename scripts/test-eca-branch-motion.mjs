// Head and neck poses: the origin of every external carotid branch stays inside the wall of the external carotid artery, and the branch does not tear away from it.
// The artery is posed like the viewer (neck-vessel tube after the bifurcation rebuild, head rig, same body field as the branches); the branches use the same field (a function of height and depth).
// Poses: flexion -35..40 degrees and rotation -60..60 degrees, in combination.   node scripts/test-eca-branch-motion.mjs
import assert from 'node:assert/strict';
import {loadWorld} from './lib/paokao-world.mjs';
import {makeUtil, sub, add, mul, len} from './lib/paokao-util.mjs';
import {loadNeckVessels} from './lib/eca-reference.mjs';
import {loadPoseModule} from './lib/vessel-pose.mjs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import ecaBranches, {ORIGINS} from './paokao-structures/eca-branches.mjs';

const m = await loadPoseModule(), {atlas} = loadFullAtlas(), U = makeUtil(loadWorld({paokao: false})), out = ecaBranches(U), vessels = await loadNeckVessels();
const rig = m.makeBodyRig(atlas, 'head'), RING = 12;
const eca = {Left: vessels.find(v => v.name === 'External carotid artery.l'), Right: vessels.find(v => v.name === 'External carotid artery.r')};
const bindings = new Map();
const posed = (key, pos, poseBuilt) => { if (!bindings.has(key)) bindings.set(key, m.bindBodyTissue(rig, pos)); const o = new Float32Array(pos.length); m.deformTissue(bindings.get(key), pos, poseBuilt.palette, o); return o; };
const ringCentre = (P, r, n = RING) => { const c = [0, 0, 0]; for (let k = 0; k < n; k++) for (let a = 0; a < 3; a++) c[a] += P[(r * n + k) * 3 + a] / n; return c; };
const ringRadius = (P, r, c) => { let s = 0; for (let k = 0; k < RING; k++) s += len(sub([P[(r * RING + k) * 3], P[(r * RING + k) * 3 + 1], P[(r * RING + k) * 3 + 2]], c)) / RING; return s; };
let worst = 0, worstGap = 0, count = 0; const stretch = {max: 0, min: 9};
const failures = [];
for (const rotation of [-60, -30, 0, 30, 60]) for (const flexion of [-35, 0, 40]) {
  const built = m.buildBodyMotion(rig, {...m.BODY_NEUTRAL, flexion, rotation});
  for (const side of ['Left', 'Right']) {
    const base = new Float32Array(eca[side].positions), P = posed('eca' + side, base, built), nR = base.length / (RING * 3);
    const centres = Array.from({length: nR}, (_, r) => ringCentre(P, r)), radii = centres.map((c, r) => ringRadius(P, r, c));
    for (const [key, o] of Object.entries(ORIGINS)) {
      const s = out.find(x => x.name === `${side} ${key}`), bp = new Float32Array(s.geometry[0].positions), BP = posed(s.name, bp, built), rings = (bp.length / 3 - 2) / RING;
      const c0 = ringCentre(BP, 0), start0 = ringCentre(bp, 0);
      // distance from the posed first ring to the posed artery axis (nearest ring centre, interpolated), against the artery radius there
      let best = Infinity, rr = 0; for (let r = 0; r < nR - 1; r++) { const a = centres[r], b = centres[r + 1], d = sub(b, a), t = Math.max(0, Math.min(1, ((c0[0] - a[0]) * d[0] + (c0[1] - a[1]) * d[1] + (c0[2] - a[2]) * d[2]) / (len(d) ** 2 || 1))), q = add(a, mul(d, t)), dist = len(sub(c0, q)); if (dist < best) { best = dist; rr = radii[r] * (1 - t) + radii[r + 1] * t; } }
      count++; worst = Math.max(worst, best / rr);
      if (best > rr) failures.push(`${s.name} at flexion ${flexion}, rotation ${rotation}: first ring ${(best * 1000).toFixed(2)} mm from the artery axis (radius ${(rr * 1000).toFixed(2)} mm)`);
      // the branch is carried by the same soft field as everything around the neck, so it stretches with the tissue around it; only a tear (x1.8 or x0.6) fails
      const len0 = ringLen(bp, rings), len1 = ringLen(BP, rings); stretch.max = Math.max(stretch.max, len1 / len0); stretch.min = Math.min(stretch.min, len1 / len0);
      if (len1 / len0 > 1.8 || len1 / len0 < .6) failures.push(`${s.name} at flexion ${flexion}, rotation ${rotation}: length changed x${(len1 / len0).toFixed(2)}`);
      worstGap = Math.max(worstGap, len(sub(c0, start0)));
    }
  }
}
function ringLen(P, rings) { let s = 0, prev = ringCentre(P, 0); for (let r = 1; r < rings; r++) { const c = ringCentre(P, r); s += len(sub(c, prev)); prev = c; } return s; }
if (failures.length) { console.log(failures.join('\n')); process.exit(1); }
console.log(`ECA branches in motion: ${count} (branch x pose) cases, 15 head poses; the first ring stays inside the artery wall (largest distance ${(worst * 100).toFixed(0)}% of the artery radius); branch length changes x${stretch.min.toFixed(2)} to x${stretch.max.toFixed(2)} (the same field stretches the tissue around them).`);
