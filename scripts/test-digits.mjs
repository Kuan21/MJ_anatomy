// Finger motion: joint axes, limits, skinning weights and "nothing left behind" for the soft tissue of the hand.
// Run: node scripts/test-digits.mjs
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {Box3, Vector3} from 'three';
import {loadFullAtlas} from './lib/full-atlas.mjs';
const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
await build({entryPoints: [file('scripts/lib/digits-entry.ts')], bundle: true, format: 'esm', platform: 'node', outfile: file('.sites-runtime/digits-test.mjs'), loader: {'.json': 'json'}, logLevel: 'error', external: ['three']});
const m = await import(file('.sites-runtime/digits-test.mjs'));
const {atlas, geometry} = loadFullAtlas();
const ids = side => m.digitBoneIds(side);
const quat = t => ({x: t.quaternion[0], y: t.quaternion[1], z: t.quaternion[2], w: t.quaternion[3]});
const apply = (t, p) => { // rest point -> posed point
  const q = quat(t), v = new Vector3(...p), u = new Vector3(q.x, q.y, q.z), c = u.clone().cross(v).multiplyScalar(2);
  return v.add(c.clone().multiplyScalar(q.w)).add(u.clone().cross(c)).add(new Vector3(...t.translation));
};
const joints = (await import(file('app/biomechanics-v2/digit-joints.json'), {with: {type: 'json'}})).default;

// 1. neutral: every digit bone stays exactly where it is
for (const side of ['left', 'right']) {
  const t = m.buildUpperLimbMotion(atlas, side, m.NEUTRAL_POSE).transforms;
  for (const id of ids(side)) { assert.ok(t[id], 'digit bone has a transform ' + id); assert.ok(t[id].translation.every(v => Math.abs(v) < 1e-9) && Math.abs(t[id].quaternion[3] - 1) < 1e-9, 'neutral is identity ' + id); }
}
// 2. limits
{
  const p = m.constrainPose({...m.NEUTRAL_POSE, indexMcpFlexion: 999, indexPipFlexion: -50, thumbOpposition: 999, littleMcpAbduction: -999, thumbIpFlexion: 999});
  for (const k of m.DIGIT_KEYS) assert.ok(p[k] >= m.DIGIT_LIMITS[k][0] && p[k] <= m.DIGIT_LIMITS[k][1], 'clamped ' + k);
  assert.equal(p.indexMcpFlexion, 90); assert.equal(p.indexPipFlexion, 0); assert.equal(p.thumbOpposition, 50); assert.equal(p.littleMcpAbduction, -20); assert.equal(p.thumbIpFlexion, 80);
}
// 3. directions: flexion brings the tip forward (+z, towards the palm); spreading moves index/middle towards the thumb and ring/little away from it
for (const side of ['left', 'right']) {
  const s = side === 'left' ? 1 : -1, J = joints.sides[side];
  for (const f of ['index', 'middle', 'ring', 'little']) {
    const base = {...m.NEUTRAL_POSE};
    const flex = m.buildUpperLimbMotion(atlas, side, {...base, [`${f}McpFlexion`]: 60}).transforms[J[f].ids.dp];
    const tip = apply(flex, J[f].tip), rest = new Vector3(...J[f].tip);
    assert.ok(tip.z - rest.z > 0.02, `${side} ${f} flexion moves the tip anteriorly (${(tip.z - rest.z).toFixed(3)})`);
    const pip = apply(m.buildUpperLimbMotion(atlas, side, {...base, [`${f}PipFlexion`]: 60}).transforms[J[f].ids.dp], J[f].tip), mcpTip = apply(m.buildUpperLimbMotion(atlas, side, {...base, [`${f}PipFlexion`]: 60}).transforms[J[f].ids.pp], J[f].tip);
    assert.ok(pip.distanceTo(rest) > 0.01, 'PIP moves the distal phalanx'); assert.ok(mcpTip.distanceTo(rest) < 1e-9, 'PIP leaves the proximal phalanx where it is');
    const abd = apply(m.buildUpperLimbMotion(atlas, side, {...base, [`${f}McpAbduction`]: 15}).transforms[J[f].ids.dp], J[f].tip);
    const away = f === 'index' || f === 'middle' ? s : -s;
    assert.ok((abd.x - rest.x) * away > 0.008, `${side} ${f} abduction moves towards ${away > 0 ? 'the thumb side' : 'the little finger side'} (${((abd.x - rest.x) * away).toFixed(3)})`);
  }
  const th = J.thumb, rest = new Vector3(...th.tip);
  const tAbd = apply(m.buildUpperLimbMotion(atlas, side, {...m.NEUTRAL_POSE, thumbCmcAbduction: 40}).transforms[th.ids.dp], th.tip), tFlex = apply(m.buildUpperLimbMotion(atlas, side, {...m.NEUTRAL_POSE, thumbCmcFlexion: 40}).transforms[th.ids.dp], th.tip);
  assert.ok(tAbd.z - rest.z > 0.02, side + ' thumb abduction moves the tip anteriorly (away from the palm plane)');
  assert.ok((tFlex.x - rest.x) * -s > 0.02, side + ' thumb flexion moves the tip across the palm (towards the ulnar side)');
  const opp = apply(m.buildUpperLimbMotion(atlas, side, {...m.NEUTRAL_POSE, thumbOpposition: 50}).transforms[th.ids.dp], th.tip);
  assert.ok(opp.distanceTo(rest) > 0.02, side + ' opposition moves the thumb');
}
// 4. weights: each phalanx's own bone is dominated by its own frame, finger metacarpals and the palm stay on the hand, and every weight vector is a partition of unity
for (const side of ['left', 'right']) {
  const rig = m.makeSoftRig(atlas, side), box = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1));
  m.DIGITS.forEach((digit, di) => {
    const info = joints.sides[side][digit], order = digit === 'thumb' ? ['mc', 'pp', 'dp'] : ['pp', 'mp', 'dp'];
    order.forEach((key, k) => {
      const part = atlas.parts.find(p => p.id === info.ids[key]), c = new Vector3(...part.bounds[0]).add(new Vector3(...part.bounds[1])).multiplyScalar(.5);
      const w = m.weightsAt(rig, 'hand', c, box, 'test');
      assert.ok(Math.abs(w.reduce((a, b) => a + b, 0) - 1) < 1e-9, 'partition of unity');
      assert.ok(w[7 + di * 3 + k] > .55, `${side} ${digit} ${key}: own frame dominates (${w[7 + di * 3 + k].toFixed(2)})`);
    });
    if (digit !== 'thumb') {
      const mc = atlas.parts.find(p => new RegExp(`${['', 'second', 'third', 'fourth', 'fifth'][di]} metacarpal`, 'i').test(p.name) && new RegExp(side, 'i').test(p.name)), c = new Vector3(...mc.bounds[0]).add(new Vector3(...mc.bounds[1])).multiplyScalar(.5);
      assert.ok(m.weightsAt(rig, 'hand', c, box, 'test')[6] > .9, `${side} ${digit} metacarpal stays on the hand`);
    }
  });
}
// 4b. the gestures: pinch / OK bring the thumb tip to the index tip, the fist lays the thumb over the middle phalanges of the index and middle finger
{
  const J = joints.sides.left, preset = id => m.HAND_PRESETS.find(h => h.id === id).pose;
  const tipOf = (pose, digit, bone, point) => apply(m.buildUpperLimbMotion(atlas, 'left', {...m.NEUTRAL_POSE, ...pose}).transforms[J[digit].ids[bone]], point);
  for (const id of ['pinch', 'ok']) {
    const gap = tipOf(preset(id), 'thumb', 'dp', J.thumb.tip).distanceTo(tipOf(preset(id), 'index', 'dp', J.index.tip));
    assert.ok(gap < .012, `${id}: thumb tip meets index tip (${(gap * 1000).toFixed(1)} mm)`);
  }
  const f = preset('fist'), mid = a => ['index', 'middle'].map(d => tipOf(f, d, 'mp', J[d].joints.dip)).reduce((x, y) => x.add(y)).multiplyScalar(.5);
  assert.ok(tipOf(f, 'thumb', 'dp', J.thumb.tip).distanceTo(mid()) < .03, 'fist: the thumb lies over the middle phalanges ('+(tipOf(f, 'thumb', 'dp', J.thumb.tip).distanceTo(mid())*1000).toFixed(0)+' mm)');
  for (const h of m.HAND_PRESETS) for (const k of m.DIGIT_KEYS) assert.ok(h.pose[k] >= m.DIGIT_LIMITS[k][0] && h.pose[k] <= m.DIGIT_LIMITS[k][1], `${h.id} ${k} within limits`);
}
// 5. soft tissue of the hand under a fist and a wide spread: no vertex flies off, no triangle is stretched into a spike
const MAX_STRETCH = Number(process.env.MAX_STRETCH ?? 6);
const POSES = {
  fist: {indexMcpFlexion: 85, indexPipFlexion: 100, indexDipFlexion: 65, middleMcpFlexion: 85, middlePipFlexion: 100, middleDipFlexion: 65, ringMcpFlexion: 85, ringPipFlexion: 100, ringDipFlexion: 65, littleMcpFlexion: 85, littlePipFlexion: 100, littleDipFlexion: 65, thumbCmcFlexion: 25, thumbCmcAbduction: 10, thumbOpposition: 30, thumbMcpFlexion: 35, thumbIpFlexion: 40},
  spread: {indexMcpAbduction: 20, ringMcpAbduction: 20, littleMcpAbduction: 20, indexMcpFlexion: -15, middleMcpFlexion: -15, ringMcpFlexion: -15, littleMcpFlexion: -15, thumbCmcAbduction: 55},
  pinch: {indexMcpFlexion: 40, indexPipFlexion: 45, indexDipFlexion: 20, thumbCmcAbduction: 30, thumbOpposition: 40, thumbMcpFlexion: 25, thumbIpFlexion: 30}
};
const report = [];
for (const side of ['left', 'right']) {
  const rig = m.makeSoftRig(atlas, side), wristY = rig.wrist.y;
  const hand = atlas.parts.filter(p => m.tissueBindings[p.id]?.name === p.name && m.tissueBindings[p.id].side === side && p.bounds[1][1] < wristY + .05 && p.system !== 'skeletal');
  assert.ok(hand.length > 40, side + ': found the soft parts of the hand');
  for (const [name, pose] of Object.entries(POSES)) {
    const palette = m.makePalette(rig, m.buildUpperLimbMotion(atlas, side, {...m.NEUTRAL_POSE, ...pose}).transforms);
    let worst = {ratio: 0}, farthest = {d: 0};const perPart = [];
    for (const part of hand) {
      const g = geometry(part), base = g.positions, binding = m.bindTissue(rig, m.tissueBindings[part.id].profile, base, part, '', g.indices), out = new Float32Array(base.length);
      m.deformTissue(binding, base, palette, out);
      assert.ok(out.every(Number.isFinite), part.name + ' finite');
      for (let i = 0; i < out.length / 3; i++) { const d = Math.hypot(out[i * 3] - base[i * 3], out[i * 3 + 1] - base[i * 3 + 1], out[i * 3 + 2] - base[i * 3 + 2]); if (d > farthest.d) farthest = {d, part: part.name}; }
      const tri = g.indices, seen = new Set();let partWorst = 0;
      for (let t = 0; t < tri.length; t += 3) for (let k = 0; k < 3; k++) {
        const a = tri[t + k], b = tri[t + (k + 1) % 3], key = a < b ? a * 1e7 + b : b * 1e7 + a; if (seen.has(key)) continue; seen.add(key);
        const r0 = Math.hypot(base[a * 3] - base[b * 3], base[a * 3 + 1] - base[b * 3 + 1], base[a * 3 + 2] - base[b * 3 + 2]), r1 = Math.hypot(out[a * 3] - out[b * 3], out[a * 3 + 1] - out[b * 3 + 1], out[a * 3 + 2] - out[b * 3 + 2]);
        if (r0 > 6e-4) partWorst = Math.max(partWorst, r1 / r0);
        if (r0 > 6e-4 && r1 / r0 > worst.ratio) worst = {ratio: r1 / r0, part: part.name, len: r0};
      }
      perPart.push([part.name, +partWorst.toFixed(1)]);
    }
    if (process.env.DIAG) console.log(side, name, perPart.sort((a, b) => b[1] - a[1]).slice(0, 14).map(x => x.join(' ×')).join(' | '));
    {
    report.push({side, pose: name, worstStretch: +worst.ratio.toFixed(2), worstPart: worst.part, farthest: +farthest.d.toFixed(3), farthestPart: farthest.part});
    assert.ok(farthest.d < .26, `${side} ${name}: nothing flies off (${farthest.part} moved ${farthest.d.toFixed(3)} m)`);
    assert.ok(worst.ratio < MAX_STRETCH, `${side} ${name}: no spike, worst edge ×${worst.ratio.toFixed(1)} in ${worst.part}`);
    }
  }
}
console.table(report);
console.log('PASS finger motion');
