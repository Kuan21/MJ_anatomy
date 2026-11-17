// Which moved parts are sheared against the artery they overlap: for every vertex of a moved part, its nearest vertex of the artery wall (source mesh, within RANGE mm) is paired;
// the pair distance after the shift minus the distance before is the relative displacement the shift introduces between two surfaces that were close together.
import {quizModule} from './quiz-modules.mjs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
const M = await quizModule('app/biomechanics-v2/subclavian-shift.ts');
const {atlas, geometry} = loadFullAtlas();
const mm = a => { const v = []; for (let i = 0; i < a.length; i += 3) v.push([a[i] * 1e3, a[i + 1] * 1e3, a[i + 2] * 1e3]); return v; };
const load = id => { const g = geometry(atlas.parts.find(p => p.id === id)), pos = new Float32Array(g.positions), base = mm(pos); M.shiftSubclavianPart(id, pos); return {id, base, after: mm(pos)}; };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const RANGE = +process.argv[2] || 6;
for (const side of ['Left', 'Right']) {
  const art = load(M.PARTS[side].own[0]);
  for (const id of [...M.PARTS[side].own.slice(1), ...M.PARTS[side].branches]) {
    const L = load(id); let n = 0, worst = 0, sum = 0;
    L.base.forEach((p, i) => { let bj = -1, bd = RANGE; art.base.forEach((q, j) => { const d = dist(p, q); if (d < bd) { bd = d; bj = j; } }); if (bj < 0) return; const rel = dist(L.after[i].map((x, k) => x - p[k]), art.after[bj].map((x, k) => x - art.base[bj][k])); n++; sum += rel; worst = Math.max(worst, rel); });
    if (n) console.log(`${side} ${id}: ${n} vertices within ${RANGE} mm of the artery wall, relative displacement mean ${(sum / n).toFixed(2)} max ${worst.toFixed(2)} mm`);
  }
}
