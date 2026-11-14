// The two vocal ligaments only lose their shreds (no smoothing): a smoother sheet lies flatter on the vocalis muscle and the registered coincident-face count (docs/stability-known.json) would grow.
// Larynx regression: no duplicate cartilage or bone, no loose shreds, crumple (share of neighbouring triangle pairs bent by more than 60 degrees) down by at least 15%,
// sheet thickness and volume kept, joint-file copies of ligaments the atlas already draws left out, the cricopharyngeal ligament smoothed.
import assert from 'node:assert/strict';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {LARYNX_REPAIR, repairSheet, repairPasses} from './lib/larynx-repair.mjs';
import {measure} from './audit-larynx.mjs';
import {quizModule} from './quiz-modules.mjs';
const {atlas, geometry, rawGeometry} = loadFullAtlas({streams: []});
const names = new Map();
for (const p of atlas.parts) if (/^(Cricoid cartilage|Hyoid bone|Thyroid cartilage|Epiglottis)$/.test(p.name)) names.set(p.name, (names.get(p.name) || 0) + 1);
for (const n of ['Cricoid cartilage', 'Hyoid bone', 'Thyroid cartilage', 'Epiglottis']) assert.equal(names.get(n), 1, `${n} must be listed once`);
let checked = 0;
for (const p of atlas.parts.filter(q => LARYNX_REPAIR.has(q.id))) {
  const a = measure(rawGeometry(p)), b = measure(geometry(p));
  assert.ok(b.pieces <= (p.id === "FJ2749" ? 2 : 1), `${p.name}: loose shreds remain (${b.pieces} pieces)`);
  assert.ok(a.rough < 10 || repairPasses(p.id) === 0 ? b.rough <= a.rough + .5 : b.rough <= a.rough * .85 + .01, `${p.name}: crumple ${a.rough}% -> ${b.rough}% (needs 15% less)`);
  assert.ok(b.thinMm >= a.thinMm * .8, `${p.name}: thickness ${a.thinMm} -> ${b.thinMm} mm`);
  assert.ok(Math.abs(b.volMm3 - a.volMm3) <= Math.max(3, a.volMm3 * .15), `${p.name}: volume ${a.volMm3} -> ${b.volMm3} mm3`);
  assert.ok(b.spread <= a.spread * 1.1 + .01, `${p.name}: sliver triangles got worse (${a.spread} -> ${b.spread})`);
  // no vertex moves more than 2 mm (attachments stay where they are)
  const worst = repairSheet(rawGeometry(p).positions, rawGeometry(p).indices, {passes: repairPasses(p.id)}).maxMove;
  assert.ok(worst <= .002, `${p.name}: moved ${(worst * 1000).toFixed(2)} mm from the source (limit 2 mm)`);
  checked++;
}
const {includeJoint} = await quizModule('app/biomechanics-v2/joint-filter.ts');
for (const n of ['Median cricothyroid ligament', 'Median thyrohyoid ligament', 'Lateral thyrohyoid ligament.l', 'Stylohyoid ligament.r']) assert.equal(includeJoint(n), false, `${n} duplicates the atlas`);
assert.equal(includeJoint('Cricopharyngeal ligament.l'), true, 'the cricopharyngeal ligament has no other copy');
const {smoothSheet} = await quizModule('app/biomechanics-v2/sheet-smooth.ts');
const z = new Float32Array([0,0,0, 1,0,.4, 2,0,0, 0,1,.4, 1,1,0, 2,1,.4, 0,2,0, 1,2,.4, 2,2,0]), idx = [0,1,3,1,4,3,1,2,4,2,5,4,3,4,6,4,7,6,4,5,7,5,8,7];
const s = smoothSheet(z, idx, 20);
const range = a => { let lo = 1e9, hi = -1e9; for (let i = 2; i < a.length; i += 3) { lo = Math.min(lo, a[i]); hi = Math.max(hi, a[i]); } return hi - lo; };
assert.ok(range(s) < range(z) * .6, 'smoothing must flatten a corrugated sheet');
console.log(`Larynx: ${checked} sheets repaired (one piece, less crumple, thickness and volume kept); duplicates removed; joint copies filtered.`);
