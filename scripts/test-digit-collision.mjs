// Fingers never pass through each other: smallest distance between the bone surfaces of neighbouring digits in the gesture presets, with every joint at its
// limits, and in random poses (seeded). Rest spacing between neighbouring finger bones is about 6 mm; the soft tissue of a finger is thicker than its bone, so the
// bones are required to stay at least 3.5 mm apart (thumb against a finger: 1.5 mm).
// Run: node scripts/test-digit-collision.mjs
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {digitGaps} from './lib/digit-gap.mjs';
const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
await build({entryPoints: [file('scripts/lib/digits-entry.ts')], bundle: true, format: 'esm', platform: 'node', outfile: file('.sites-runtime/digits-test.mjs'), loader: {'.json': 'json'}, logLevel: 'error', external: ['three']});
const m = await import(file('.sites-runtime/digits-test.mjs'));
const {atlas, geometry} = loadFullAtlas();
const joints = (await import(file('app/biomechanics-v2/digit-joints.json'), {with: {type: 'json'}})).default;
const FINGER_MIN = .0035, THUMB_MIN = .0015, FINGER_PAIRS = ['index-middle', 'middle-ring', 'ring-little'];
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
if (failures.length) { console.log(failures.slice(0, 25).join('\n')); console.log(`${failures.length} violations`); }
assert.equal(failures.length, 0, 'no finger passes through another');
console.log('PASS finger collision');
