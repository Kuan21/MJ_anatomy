// Read-only measurement: subclavian artery / vein vs scalenus anterior / medius (centroid and z range per height band, per side).
//   node scripts/measure-subclavian-scalene.mjs [--json=<file>]
// Coordinates: metres in the viewer's rest frame (printed in mm), y up, x positive = Left, z positive = anterior.
import fs from 'node:fs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
const {atlas, geometry} = loadFullAtlas();
const RE = /subclavian|scalenus (anterior|medius|posterior)|brachial plexus|first rib|^(Left|Right) rib I\b/i;
const cands = atlas.parts.filter(p => RE.test(p.name));
console.log(cands.map(p => `${p.id}\t${p.name}`).join('\n'));
const names = [['scalenus anterior', 'FJ1570', 'FJ1592'], ['scalenus medius', 'FJ1571', 'FJ1593'], ['subclavian artery', 'FJ3479', 'FJ3579'], ['subclavian vein', 'FJ3486', 'FJ3587'], ['first rib', 'FJ3228', 'FJ3334']];
const get = id => { const p = atlas.parts.find(q => q.id === id), P = geometry(p).positions, v = []; for (let i = 0; i < P.length; i += 3) v.push([P[i] * 1e3, P[i + 1] * 1e3, P[i + 2] * 1e3]); return v; };
const out = {};
for (const [si, side] of [[1, 'Left'], [2, 'Right']]) {
  out[side] = {};
  console.log(`\n## ${side}`);
  for (const nm of names) {
    const vs = get(nm[si]);
    const bands = {};
    for (const v of vs) { const b = Math.floor(v[1] / 10) * 10; (bands[b] ||= []).push(v); }
    console.log(`${nm[0]} (${nm[si]}) y ${Math.min(...vs.map(v => v[1])).toFixed(0)}..${Math.max(...vs.map(v => v[1])).toFixed(0)}`);
    for (const b of Object.keys(bands).map(Number).sort((a, c) => a - c)) {
      const a = bands[b]; if (a.length < 3) continue;
      const m = k => a.reduce((s, v) => s + v[k], 0) / a.length;
      const r = k => `${Math.min(...a.map(v => v[k])).toFixed(0)}..${Math.max(...a.map(v => v[k])).toFixed(0)}`;
      console.log(`  y ${b}-${b + 10}: n=${a.length} centroid x ${m(0).toFixed(1)} y ${m(1).toFixed(1)} z ${m(2).toFixed(1)} | x ${r(0)} z ${r(2)}`);
    }
  }
}
