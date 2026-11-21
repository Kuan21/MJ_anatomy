// Thoracic duct and right lymphatic duct end in the venous angles (generated tubes). Checks (numbers only, pass or fail):
// 1. each duct ends inside the internal jugular vein or the subclavian vein of its side, within 5 mm of the venous angle (the lower end of the jugular vein meets the medial end of the subclavian vein);
// 2. no ring centre lies inside an artery, the phrenic nerve or the trachea; the left duct clears the phrenic nerve by 0.2 mm, the right duct the common carotid artery by 3 mm;
// 3. reverse control: the earlier left duct (U.legacyDuctEnd) ends on the brachiocephalic vein more than 10 mm from the angle and is caught by check 1.
import assert from 'node:assert/strict';
import {build, clearances, inside} from './measure-lymphatic-ducts-neck.mjs';
const now = build(), old = build({legacyDuctEnd: true});
const angle = (w, U, side) => { const s = side === 'L' ? 'Left' : 'Right', a = U.extreme(`${s} internal jugular vein`, [0, -1, 0]), b = U.extreme(`${s} subclavian vein`, [side === 'L' ? -1 : 1, 0, 0]); return a.map((v, i) => (v + b[i]) / 2); };
function problems(b, name, side) {
  const spec = b.specs.find(s => s.name === name), pts = spec.tubes[0].pts, end = pts[pts.length - 1], s = side === 'L' ? 'Left' : 'Right', bad = [];
  const ijv = b.w.mesh(`${s} internal jugular vein`), scv = b.w.mesh(`${s} subclavian vein`), ang = angle(b.w, b.U, side);
  if (!(inside(ijv, end) || inside(scv, end))) bad.push('the end is not inside the jugular or subclavian vein');
  const d = Math.hypot(...end.map((v, i) => v - ang[i])) * 1000; if (d > 5) bad.push(`the end is ${d.toFixed(1)} mm from the venous angle`);
  const arteries = side === 'L' ? ['Left subclavian artery', 'Left common carotid artery'] : ['Brachiocephalic artery', 'Right common carotid artery', 'Right subclavian artery'];
  const c = clearances(b.w, pts, [...arteries, `${s} phrenic nerve`, 'Trachea']);
  for (const [n, r] of Object.entries(c)) if (r.inside) bad.push(`${r.inside} ring centres inside ${n}`);
  if (side === 'L' && c['Left phrenic nerve'].min < .2) bad.push(`phrenic nerve ${c['Left phrenic nerve'].min.toFixed(2)} mm`);
  if (side === 'R' && c['Right common carotid artery'].min < 3) bad.push(`common carotid artery ${c['Right common carotid artery'].min.toFixed(1)} mm`);
  return {bad, d};
}
const L = problems(now, 'Thoracic duct', 'L'), R = problems(now, 'Right lymphatic duct', 'R'), O = problems(old, 'Thoracic duct', 'L');
assert.deepEqual(L.bad, [], `thoracic duct: ${L.bad.join('; ')}`);
assert.deepEqual(R.bad, [], `right lymphatic duct: ${R.bad.join('; ')}`);
assert.ok(O.d > 10 && O.bad.some(b => /not inside|from the venous angle/.test(b)), `the earlier thoracic duct end must be caught (${O.d.toFixed(1)} mm from the angle)`);
console.log(`Lymphatic ducts: thoracic duct ends in the left venous angle (${L.d.toFixed(1)} mm from it; earlier end ${O.d.toFixed(1)} mm away, caught), right lymphatic duct ends in the right venous angle (${R.d.toFixed(1)} mm); no ring centre inside an artery, the phrenic nerve or the trachea.`);
