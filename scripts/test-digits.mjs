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
  assert.equal(p.indexMcpFlexion, 90); assert.equal(p.indexPipFlexion, 0); assert.equal(p.thumbOpposition, 50); assert.equal(p.thumbIpFlexion, 80);
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
// 4c. the panel offers exactly these six gestures; half fist: MCP about 45, PIP about 60, DIP about 30 degrees
{
  assert.deepEqual(m.HAND_PRESETS.map(h => h.id), ['open', 'half', 'fist', 'point', 'pinch', 'ok']);
  const h = m.HAND_PRESETS.find(g => g.id === 'half').pose;
  for (const f of ['index', 'middle', 'ring', 'little']) { assert.ok(Math.abs(h[f + 'McpFlexion'] - 45) <= 8 && Math.abs(h[f + 'PipFlexion'] - 60) <= 6 && Math.abs(h[f + 'DipFlexion'] - 30) <= 6, 'half fist ' + f); }
  assert.ok(h.thumbMcpFlexion > 0 && h.thumbIpFlexion > 0, 'half fist: thumb slightly flexed');
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
// 6. tissue follows its phalanx: every soft vertex that lies beside the shaft of a phalanx (clear of the joints) ends up where that bone carries it, in the gesture presets and
//    with the fingers at their limits (no tendon bowstringing away from the bone or staying behind, no tendon, vessel or nerve pulled through the bone)
{
  const tol = .005, maxFlex = Object.fromEntries(m.DIGIT_KEYS.map(k => [k, m.DIGIT_LIMITS[k][1]]));
  const poseList = {...Object.fromEntries(m.HAND_PRESETS.map(h => [h.id, h.pose])), 'max flexion': {...maxFlex, thumbCmcAbduction: 0, thumbOpposition: 0, indexMcpAbduction: 0, middleMcpAbduction: 0, ringMcpAbduction: 0, littleMcpAbduction: 0}};
  const groups = [['flexor tendons', /flexor digitorum|flexor pollicis longus/i], ['extensor tendons', /extensor (digitorum|indicis|digiti minimi|pollicis)|extensor expansion|dorsal digital expansion/i], ['palmar aponeurosis / sheaths', /palmar aponeurosis|fibrous (digital )?sheath|annular|cruciate|pulley/i], ['thenar / hypothenar', /pollicis (brevis|longus)|opponens|adductor pollicis|abductor digiti minimi|flexor digiti minimi/i], ['interossei / lumbricals', /interosse|lumbrical/i], ['digital arteries / nerves', /digital (artery|nerve)|arteria princeps|radialis indicis/i], ['digital / hand veins', /digital vein|venous network|palmar venous/i], ['other soft tissue', /./]];
  const result = [], late = [];
  for (const side of ['left', 'right']) {
    const rig = m.makeSoftRig(atlas, side), wristY = rig.wrist.y, J = joints.sides[side], box = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1));
    const hand = atlas.parts.filter(p => m.tissueBindings[p.id]?.name === p.name && m.tissueBindings[p.id].side === side && (p.bounds[0][1] < .80 || /pollicis (brevis|longus)|opponens|adductor pollicis|digiti minimi/i.test(p.name)) && p.bounds[1][1] < 1.0 && p.system !== 'skeletal'); // everything that reaches a finger (the long tendons start in the forearm)
    // phalanx shafts: [bone transform id, from joint, to joint, radius] with a 8 mm margin at each joint
    const shafts = [];
    for (const digit of m.DIGITS) { const d = J[digit], pts = digit === 'thumb' ? [d.joints.mcp, d.joints.ip, d.tip] : [d.joints.mcp, d.joints.pip, d.joints.dip, d.tip], ids = digit === 'thumb' ? [d.ids.pp, d.ids.dp] : [d.ids.pp, d.ids.mp, d.ids.dp];
      ids.forEach((id, k) => shafts.push({digit, id, a: new Vector3(...pts[k]), b: new Vector3(...pts[k + 1]), r: d.radius}));
      if (digit === 'thumb') shafts.push({digit, id: d.ids.mc, a: new Vector3(...d.joints.cmc), b: new Vector3(...d.joints.mcp), r: d.radius * 1.4}); } // the thumb metacarpal moves too (thenar muscles attach to it)
    for (const [pname, pose] of Object.entries(poseList)) {
      const transforms = m.buildUpperLimbMotion(atlas, side, {...m.NEUTRAL_POSE, ...pose}).transforms, palette = m.makePalette(rig, transforms);
      for (const [gname, re] of groups) {
        let checked = 0, worst = 0, worstPart = '', sum = 0;
        for (const part of hand.filter(p => gname === 'other soft tissue' ? !groups.slice(0, -1).some(([, r]) => r.test(p.name)) : re.test(p.name))) {
          const g = geometry(part), base = g.positions, binding = m.bindTissue(rig, m.tissueBindings[part.id].profile, base, part, '', g.indices), out = new Float32Array(base.length);
          m.deformTissue(binding, base, palette, out);
          for (let i = 0; i < base.length / 3; i++) {
            const v = new Vector3(base[i * 3], base[i * 3 + 1], base[i * 3 + 2]);
            for (const sh of shafts) {
              const ab = sh.b.clone().sub(sh.a), len = ab.length(), t = v.clone().sub(sh.a).dot(ab) / (len * len);
              if (t * len < .008 || t * len > len - .008) continue;
              if (v.distanceTo(sh.a.clone().addScaledVector(ab, t)) > sh.r + (gname === 'thenar / hypothenar' ? .012 : .002)) continue;
              checked++; const want = apply(transforms[sh.id], [v.x, v.y, v.z]), dev = want.distanceTo(new Vector3(out[i * 3], out[i * 3 + 1], out[i * 3 + 2]));
              sum += dev; if (dev > worst) { worst = dev; worstPart = part.name; } break;
            }
          }
        }
        const measure = gname === 'thenar / hypothenar' ? sum / Math.max(1, checked) : worst; // muscle bellies deform, so the thenar group is judged by the mean
        result.push({side, pose: pname, group: gname, vertices: checked, [gname === 'thenar / hypothenar' ? 'meanMm' : 'worstMm']: +(measure * 1000).toFixed(1), worstPart});
        if (measure >= (gname === 'thenar / hypothenar' ? .006 : tol)) late.push(`${side} ${pname} ${gname}: tissue beside a phalanx follows it (${(measure * 1000).toFixed(1)} mm, worst part ${worstPart})`);
      }
    }
  }
  // 6b. tendons, vessels and nerves stay against the bone (no bowstring) and never pass through it: distance to the digit's bone line before and after the pose
  {
    const clearance = [], bad = [];
    for (const side of ['left', 'right']) {
      const rig = m.makeSoftRig(atlas, side), J = joints.sides[side], wristY = rig.wrist.y;
      const hand = atlas.parts.filter(p => m.tissueBindings[p.id]?.name === p.name && m.tissueBindings[p.id].side === side && p.bounds[0][1] < .80 && p.bounds[1][1] < 1.0 && p.system !== 'skeletal' && p.system !== 'muscular' || /flexor digitorum|extensor (digitorum|indicis|digiti)|flexor pollicis longus/i.test(p.name) && m.tissueBindings[p.id]?.side === side);
      const lines = m.DIGITS.map(digit => { const d = J[digit], pts = digit === 'thumb' ? [d.joints.mcp, d.joints.ip, d.tip] : [d.joints.mcp, d.joints.pip, d.joints.dip, d.tip], ids = digit === 'thumb' ? [d.ids.pp, d.ids.dp] : [d.ids.pp, d.ids.mp, d.ids.dp]; return {digit, pts: pts.map(a => new Vector3(...a)), ids, r: d.radius}; });
      const near = (pts, v) => { let best = {d: 1e9, k: 0, t: 0}; for (let k = 0; k + 1 < pts.length; k++) { const ab = pts[k + 1].clone().sub(pts[k]), t = Math.max(0, Math.min(1, v.clone().sub(pts[k]).dot(ab) / ab.lengthSq())), d = v.distanceTo(pts[k].clone().addScaledVector(ab, t)); if (d < best.d) best = {d, k, t}; } return best; };
      for (const [pname, pose] of Object.entries({...Object.fromEntries(m.HAND_PRESETS.filter(h => h.id !== 'open').map(h => [h.id, h.pose])), 'max flexion': Object.fromEntries(m.DIGIT_KEYS.map(k => [k, k.includes('Abduction') ? 0 : m.DIGIT_LIMITS[k][1]]))})) {
        const transforms = m.buildUpperLimbMotion(atlas, side, {...m.NEUTRAL_POSE, ...pose}).transforms, palette = m.makePalette(rig, transforms);
        const posed = lines.map(l => ({...l, pts: l.pts.map((q, i) => apply(transforms[l.ids[Math.max(0, i - 1)]], q.toArray()))}));
        let gain = 0, gainPart = '', sunk = 1, sunkPart = '', count = 0;
        for (const part of hand) {
          const g = geometry(part), base = g.positions, binding = m.bindTissue(rig, m.tissueBindings[part.id].profile, base, part, '', g.indices), out = new Float32Array(base.length);
          m.deformTissue(binding, base, palette, out);
          for (let i = 0; i < base.length / 3; i++) {
            const v = new Vector3(base[i * 3], base[i * 3 + 1], base[i * 3 + 2]), w = new Vector3(out[i * 3], out[i * 3 + 1], out[i * 3 + 2]);
            lines.forEach((l, li) => {
              const n0 = near(l.pts, v), along = v.clone().sub(l.pts[0]).dot(l.pts[l.pts.length - 1].clone().sub(l.pts[0]).normalize());
              if (n0.d > l.r + .006 || along < .004 || along > l.pts[0].distanceTo(l.pts[l.pts.length - 1]) - .004) return; // beside the shaft of this digit, clear of the knuckle and the tip
              count++; const n1 = near(posed[li].pts, w);
              if (n1.d - n0.d > gain) { gain = n1.d - n0.d; gainPart = part.name; }
              if (n0.d > l.r * .8 && n1.d / l.r < sunk) { sunk = n1.d / l.r; sunkPart = part.name; if (process.env.DIAG) console.log('sunk', side, pname, part.name, l.digit, 'seg', n0.k, 't', n0.t.toFixed(2), 'rest d mm', (n0.d * 1000).toFixed(1), 'posed d mm', (n1.d * 1000).toFixed(1), 'r', (l.r * 1000).toFixed(1), 'clear', JSON.stringify((() => { const k = binding.clear?.index.indexOf(i); return k >= 0 ? binding.clear.items[k] : null; })()), 'w', [...binding.indices.slice(i * 4, i * 4 + 4)].join(','), [...binding.weights.slice(i * 4, i * 4 + 4)].map(x => x.toFixed(2)).join(',')); }
            });
          }
        }
        clearance.push({side, pose: pname, vertices: count, leavesBoneMm: +(gain * 1000).toFixed(1), leavesPart: gainPart, closestToAxisOverRadius: +sunk.toFixed(2), closestPart: sunkPart});
        if (gain > .004) bad.push(`${side} ${pname}: ${gainPart} lifts ${(gain * 1000).toFixed(1)} mm off the bone (bowstringing)`);
        if (sunk < .5) bad.push(`${side} ${pname}: ${sunkPart} passes through the bone (${sunk.toFixed(2)} × radius from the axis)`);
      }
    }
    console.table(clearance.filter(r => r.side === 'left'));
    if (bad.length) console.log(bad.join('\n'));
    assert.equal(bad.length, 0, 'tendons and vessels stay against the bone and do not pass through it');
  }
  console.table(result.filter(r => r.side === 'left'));
  if (late.length) console.log(late.join('\n'));
  assert.equal(late.length, 0, 'tissue beside a phalanx follows it');
}
console.log('PASS finger motion');
