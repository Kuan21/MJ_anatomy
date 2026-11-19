// Left thoracic duct end and right lymphatic duct at the venous angles (generated tubes, scripts/paokao-structures/thorax-extra.mjs): end positions and clearances. Read-only.
//   node scripts/measure-lymphatic-ducts-neck.mjs
import {loadWorld} from './lib/paokao-world.mjs';
import {makeUtil} from './lib/paokao-util.mjs';
import {closest, ray} from './lib/heart-geom.mjs';
import thoraxExtra from './paokao-structures/thorax-extra.mjs';
import neckLymphatics from './paokao-structures/neck-lymphatics.mjs';
export function build(flags = {}) { const w = loadWorld({paokao: true}), U = makeUtil(w); Object.assign(U, flags); return {w, U, specs: [...thoraxExtra(U), ...neckLymphatics(U)]}; }
export function inside(m, p) { let c = 0, from = [...p]; for (let k = 0; k < 12; k++) { const h = ray(m, from, [1, 0, 0]); if (!h) break; c++; from = [h.point[0] + 1e-6, from[1], from[2]]; } return c % 2 === 1; }
export function clearances(w, pts, names) { const out = {}; for (const n of names) { let m; try { m = w.mesh(n); } catch { continue; } let min = 1e9, ins = 0; for (const p of pts) { min = Math.min(min, closest(m, p).d * 1000); if (inside(m, p)) ins++; } out[n] = {min, inside: ins, end: closest(m, pts[pts.length - 1]).d * 1000, endInside: inside(m, pts[pts.length - 1])}; } return out; }
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const {w, specs} = build(), mm = v => v.map(x => (x * 1000).toFixed(1)).join(', ');
  const L = ['Left internal jugular vein', 'Left subclavian vein', 'Left brachiocephalic vein', 'Left subclavian artery', 'Left common carotid artery', 'Left phrenic nerve', 'Trachea', 'Esophagus'];
  const R = ['Right internal jugular vein', 'Right subclavian vein', 'Right brachiocephalic vein', 'Brachiocephalic artery', 'Right common carotid artery', 'Right subclavian artery', 'Vagus nerve (X).r.001', 'Right phrenic nerve', 'Trachea'];
  for (const [name, list] of [['Thoracic duct', L], ['Right lymphatic duct', R]]) { const pts = specs.find(s => s.name === name).tubes[0].pts, c = clearances(w, pts, list); console.log(`\n${name}: end (x, y, z mm) ${mm(pts[pts.length - 1])}`);
    for (const [n, r] of Object.entries(c)) console.log('  ', n.padEnd(30), `end to wall ${r.end.toFixed(1)} mm${r.endInside ? ' (end inside)' : ''}; closest ring centre ${r.min.toFixed(1)} mm; ring centres inside: ${r.inside}`); }
}
