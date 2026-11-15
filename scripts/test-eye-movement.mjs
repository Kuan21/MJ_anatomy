// Eye movements of the eye detail atlas: every extraocular muscle and the three nerve palsies are listed, the directions are the
// anatomical ones (checked on the direction the cornea and the top of the eye move), and the ids exist in the atlas. Prints pass/fail only.
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
const {EYE_MOVEMENTS, EYE_MUSCLE_IDS, gazeQuaternion, rotate, followWeight} = await quizModule('app/mj-eye-movement.ts');
const {EYE_PARTS} = await quizModule('app/mj-eye-atlas.ts');
const byId = Object.fromEntries(EYE_MOVEMENTS.map(m => [m.id, m]));
assert.deepEqual(EYE_MOVEMENTS.filter(m => m.kind === 'muscle').map(m => m.id).sort(), ['io', 'ir', 'lr', 'mr', 'so', 'sr']);
assert.deepEqual(EYE_MOVEMENTS.filter(m => m.kind === 'palsy').map(m => m.id).sort(), ['cn3', 'cn4', 'cn6']);
for (const m of EYE_MOVEMENTS) {
  for (const id of [...(m.muscles ?? []), ...(m.paralysed ?? [])]) assert.ok(EYE_PARTS[id], `${m.id}: ${id} is not in the atlas`);
  assert.ok(m.text.length > 20 && /[㐀-鿿]/.test(m.textZh) && /[㐀-鿿]/.test(m.zh), `${m.id}: text`);
  const r = m.rotation;
  assert.ok(Math.abs(r.abduct) <= 25 && Math.abs(r.elevate) <= 25 && Math.abs(r.intort) <= 15, `${m.id}: angle outside the display range`);
  if (m.kind === 'muscle') assert.equal(m.name, EYE_PARTS[m.muscles[0]].name, `${m.id}: name differs from the atlas`);
}
// Where the cornea (0,0,1) and the top of the eye (0,1,0) go. Left eye: +X lateral, +Y up, +Z anterior.
const cornea = id => rotate([0, 0, 1], gazeQuaternion(byId[id].rotation)), top = id => rotate([0, 1, 0], gazeQuaternion(byId[id].rotation));
const lateral = v => v[0] > .02, medial = v => v[0] < -.02, up = v => v[1] > .02, down = v => v[1] < -.02;
assert.ok(up(cornea('sr')) && medial(cornea('sr')) && medial(top('sr')), 'superior rectus: elevation, adduction, intorsion');
assert.ok(down(cornea('ir')) && medial(cornea('ir')) && lateral(top('ir')), 'inferior rectus: depression, adduction, extorsion');
assert.ok(medial(cornea('mr')) && !up(cornea('mr')) && !down(cornea('mr')), 'medial rectus: adduction only');
assert.ok(lateral(cornea('lr')) && !up(cornea('lr')) && !down(cornea('lr')), 'lateral rectus: abduction only');
assert.ok(down(cornea('so')) && lateral(cornea('so')) && medial(top('so')), 'superior oblique: depression, abduction, intorsion');
assert.ok(up(cornea('io')) && lateral(cornea('io')) && lateral(top('io')), 'inferior oblique: elevation, abduction, extorsion');
assert.ok(down(cornea('cn3')) && lateral(cornea('cn3')), 'oculomotor palsy: down and out');
assert.ok(up(cornea('cn4')) && lateral(top('cn4')), 'trochlear palsy: higher and extorted');
assert.ok(medial(cornea('cn6')), 'abducens palsy: turned inward');
// A palsy never lists a muscle its nerve does not supply, and between them the three nerves cover the six muscles and the levator.
const M = EYE_MUSCLE_IDS;
assert.deepEqual([...byId.cn3.paralysed].sort(), [M.superiorRectus, M.inferiorRectus, M.medialRectus, M.inferiorOblique, M.levator].sort());
assert.deepEqual(byId.cn4.paralysed, [M.superiorOblique]);
assert.deepEqual(byId.cn6.paralysed, [M.lateralRectus]);
assert.ok(byId.cn3.pupil > 1, 'oculomotor palsy: dilated pupil');
// follow weights
assert.equal(followWeight(0, 1), 1); assert.equal(followWeight(1, 1), 0); assert.equal(followWeight(2, 1), 0);
assert.ok(followWeight(.25, 1) > followWeight(.5, 1) && followWeight(.5, 1) > followWeight(.75, 1));
// rotations keep length
for (const m of EYE_MOVEMENTS) assert.ok(Math.abs(Math.hypot(...cornea(m.id)) - 1) < 1e-9);
console.log(`Eye movements OK: ${EYE_MOVEMENTS.length} movements (6 muscles, 3 nerve palsies), directions checked.`);
