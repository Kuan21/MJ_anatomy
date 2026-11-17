// Wall-to-wall clearance (mm) of the subclavian artery against its neighbours, before and after the load-time shift of app/biomechanics-v2/subclavian-shift.ts (HN-23).
//   node scripts/measure-subclavian-shift.mjs [--md] [--json=<file>]
// A negative value is the depth (mm) of the deepest vertex of one mesh inside the other; a positive value is the smallest distance between the two surfaces (vertex to triangle, both ways, searched up to LIMIT mm).
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {quizModule} from './quiz-modules.mjs';
import {part, nerve, SIDES, tris, clearance} from './lib/subclavian-measure.mjs';
const LIMIT = 20;
export const NEIGHBOURS = side => {
  const S = SIDES.find(s => s.side === side);
  return {
    'subclavian vein': () => part(S.vein), 'scalenus anterior': () => part(S.scaA), 'scalenus medius': () => part(S.scaM), 'first rib': () => part(S.rib), 'clavicle': () => part(side === 'Left' ? 'FJ3237' : 'FJ3362'),
    'brachial plexus roots': () => nerve(S.plexus[0]), 'superior trunk': () => nerve(S.plexus[1]), 'middle trunk': () => nerve(S.plexus[2]), 'inferior trunk': () => nerve(S.plexus[3]),
    'pleural cupula': () => part(S.cupula), 'lung (upper lobe)': () => part(S.lung), 'trachea': () => part('FJ2541'),
    'axillary artery': () => part(S.axA), ...(S.bct ? {'brachiocephalic trunk': () => part(S.bct)} : {}), ...(side === 'Left' ? {'arch of aorta': () => part('FJ3411')} : {}),
  };
};
/** Artery mesh moved by the shift module (`own` role, as the viewer does). */
export function shifted(M, side, A0) { return {...A0, verts: A0.verts.map(v => { const f = M.fieldAt(side, v, true); return [v[0] + f[0], v[1] + f[1], v[2] + f[2]]; })}; }
export async function measure(M = null) {
  M ??= await quizModule('app/biomechanics-v2/subclavian-shift.ts');
  const out = {};
  for (const S of SIDES) {
    const A0 = part(S.artery), A1 = shifted(M, S.side, A0), t0 = tris(A0), t1 = tris(A1), rows = {};
    for (const [name, get] of Object.entries(NEIGHBOURS(S.side))) {
      const B = get(), tb = tris(B);
      rows[name] = {before: clearance(A0, B, {ta: t0, tb, limit: LIMIT}), after: clearance(A1, B, {ta: t1, tb, limit: LIMIT})};
    }
    out[S.side] = rows;
  }
  return out;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const m = await measure(), md = process.argv.includes('--md');
  const names = Object.keys(m.Left).filter(n => n in m.Right);
  if (md) { console.log('| 對象 | 左 修改前 | 左 修改後 | 右 修改前 | 右 修改後 |\n|---|---|---|---|---|'); for (const n of Object.keys(m.Left)) console.log(`| ${n} | ${m.Left[n].before.toFixed(1)} | ${m.Left[n].after.toFixed(1)} | ${m.Right[n] ? m.Right[n].before.toFixed(1) : '-'} | ${m.Right[n] ? m.Right[n].after.toFixed(1) : '-'} |`); }
  else for (const s of ['Left', 'Right']) { console.log('##', s); for (const [n, r] of Object.entries(m[s])) console.log(n.padEnd(24), r.before.toFixed(2).padStart(7), '->', r.after.toFixed(2).padStart(7)); }
  const j = process.argv.find(a => a.startsWith('--json=')); if (j) fs.writeFileSync(j.slice(7), JSON.stringify(m, null, 1));
  void names;
}
