// Fingers never pass through each other: smallest distance between the bone surfaces of neighbouring digits in the gesture presets, with every joint at its
// limits, and in random poses (seeded). Rest spacing between neighbouring finger bones is about 6 mm; the soft tissue of a finger is thicker than its bone, so the
// bones are required to stay at least 4 mm apart (thumb against a finger: 1.5 mm).
// Soft tissue: the skin of the hand is posed as the viewer does (scripts/lib/digit-skin.mjs) and
//  - no skin vertex of a finger may lie deeper than SKIN_OVERLAP_MAX inside the soft-tissue envelope of its neighbour (a regression guard measured on the skin mesh, not an
//    anatomical limit: the skin of neighbouring fingers already touches at rest);
//  - in 捏取 and OK 手勢 the finger pads of the thumb and the index finger touch: the gap between the two pad surfaces (bone gap minus the skin over each bone tip) is
//    between PAD_OVERLAP_MAX of overlap and PAD_GAP_MAX of opening.
// Run: node scripts/test-digit-collision.mjs
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {digitGaps} from './lib/digit-gap.mjs';
import {makeDigitSkin} from './lib/digit-skin.mjs';
const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
await build({entryPoints: [file('scripts/lib/digits-entry.ts')], bundle: true, format: 'esm', platform: 'node', outfile: file('.sites-runtime/digits-test.mjs'), loader: {'.json': 'json'}, logLevel: 'error', external: ['three']});
const m = await import(file('.sites-runtime/digits-test.mjs'));
const {atlas, geometry} = loadFullAtlas();
const joints = (await import(file('app/biomechanics-v2/digit-joints.json'), {with: {type: 'json'}})).default;
const FINGER_MIN = .004, THUMB_MIN = .0015, SKIN_OVERLAP_MAX = .0065, PAD_OVERLAP_MAX = .0015, PAD_GAP_MAX = .003, SKIN_TOUCH_MAX = .0015, FINGER_PAIRS = ['index-middle', 'middle-ring', 'ring-little'];
let seed = 20261029; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
const cases = [];
for (const h of m.HAND_PRESETS) cases.push([`preset ${h.id}`, h.pose, true]);
for (const k of m.DIGIT_KEYS) for (const [i, v] of m.DIGIT_LIMITS[k].entries()) cases.push([`${k} at ${i ? 'max' : 'min'}`, {[k]: v}, true]);
cases.push(['every joint at max', Object.fromEntries(m.DIGIT_KEYS.map(k => [k, m.DIGIT_LIMITS[k][1]])), true], ['every joint at min', Object.fromEntries(m.DIGIT_KEYS.map(k => [k, m.DIGIT_LIMITS[k][0]])), true]);
for (let i = 0; i < 120; i++) cases.push([`random ${i}`, Object.fromEntries(m.DIGIT_KEYS.map(k => [k, m.DIGIT_LIMITS[k][0] + rnd() * (m.DIGIT_LIMITS[k][1] - m.DIGIT_LIMITS[k][0])])), false]);
const failures = [], report = [];
for (const side of ['left', 'right']) for (const [name, pose, thumb] of cases) {
  const constrained = m.constrainPose({...m.NEUTRAL_POSE, ...pose}), gaps = digitGaps({m, atlas, geometry, joints, side, pose: constrained});
  for (const pair of FINGER_PAIRS) if (gaps[pair] < FINGER_MIN) failures.push(`${side} ${name}: ${pair} bones ${(gaps[pair] * 1000).toFixed(1)} mm apart`);
  if (thumb) for (const pair of ['thumb-index', 'thumb-middle', 'thumb-ring']) if (gaps[pair] < THUMB_MIN) failures.push(`${side} ${name}: ${pair} bones ${(gaps[pair] * 1000).toFixed(1)} mm apart`);
  if (name.startsWith('preset')) report.push({side, case: name, ...Object.fromEntries(Object.entries(gaps).map(([k, v]) => [k, +(v * 1000).toFixed(1)]))});
}
console.table(report);
// soft tissue: skin of neighbouring fingers, and the pads of a pinch
const skinReport = [];
for (const side of ['left', 'right']) {
  const skin = makeDigitSkin({m, atlas, geometry, joints, side});
  assert.ok(skin.assigned.every(c => c > 150), `${side}: skin vertices found for every digit (${skin.assigned.join(', ')})`);
  const worst = {};
  for (const [name, pose] of cases) {
    const deepest = skin.overlap(skin.pose(m.constrainPose({...m.NEUTRAL_POSE, ...pose})));
    for (const [pair, depth] of Object.entries(deepest)) {
      if (!(pair in worst) || depth > worst[pair].depth) worst[pair] = {depth, name};
      if (depth > SKIN_OVERLAP_MAX) failures.push(`${side} ${name}: skin of ${pair} overlaps ${(depth * 1000).toFixed(1)} mm`);
    }
  }
  skinReport.push({side, ...Object.fromEntries(Object.entries(worst).map(([k, v]) => [k + ' overlap mm', +(v.depth * 1000).toFixed(1)]))});
  for (const id of ['pinch', 'ok']) {
    const pad = skin.padGap(skin.pose(m.constrainPose({...m.NEUTRAL_POSE, ...m.HAND_PRESETS.find(h => h.id === id).pose})));
    const tipState = skin.pose(m.constrainPose({...m.NEUTRAL_POSE, ...m.HAND_PRESETS.find(h => h.id === id).pose})), skinGap = skin.skinGap(tipState);
    skinReport.push({side, case: id, 'bone gap mm': +(pad.boneGap * 1000).toFixed(1), 'thumb skin mm': +(pad.padA * 1000).toFixed(1), 'index skin mm': +(pad.padB * 1000).toFixed(1), 'pad gap mm': +(pad.gap * 1000).toFixed(1), 'skin-to-skin mm': +(skinGap * 1000).toFixed(1)});
    if (!(skinGap <= SKIN_TOUCH_MAX)) failures.push(`${side} ${id}: the skin of the thumb tip and the index fingertip is ${(skinGap * 1000).toFixed(1)} mm apart (must touch: at most ${SKIN_TOUCH_MAX * 1000} mm)`);
    if (!(pad.gap >= -PAD_OVERLAP_MAX && pad.gap <= PAD_GAP_MAX)) failures.push(`${side} ${id}: thumb and index pads ${(pad.gap * 1000).toFixed(1)} mm apart (must touch: ${-PAD_OVERLAP_MAX * 1000} to ${PAD_GAP_MAX * 1000} mm)`);
  }
}
console.table(skinReport);
if (failures.length) { console.log(failures.slice(0, 25).join('\n')); console.log(`${failures.length} violations`); }
assert.equal(failures.length, 0, 'no finger passes through another, and the pads of a pinch touch');
console.log('PASS finger collision');
