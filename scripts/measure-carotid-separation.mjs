// Read-only measurement (HN-21b): internal and external carotid arteries in the first 30 mm above the bifurcation, as the viewer draws them (smoothCarotids applied; --raw = source tubes).
//   node scripts/measure-carotid-separation.mjs [--raw] [--md] [--json]
// At each height h (mm above the end of the common carotid) both branches are cut by the horizontal plane y = y_end + h; the centre of each branch is the interpolated ring centre, its radius the interpolated ring radius.
// Reported per side: horizontal centre distance, 3-D wall-to-wall gap (horizontal distance minus the two radii), and the direction internal minus external in x (positive = Left) and z (positive = anterior), in mm.
import fs from 'node:fs';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {quizModule} from './quiz-modules.mjs';
import {info, SIDES} from './lib/carotid-measure.mjs';
export const HEIGHTS = [1, 2, 5, 10, 15, 20, 25, 30];
export async function loadVessels(raw = false, mod = null) {
  const nv = JSON.parse(zlib.gunzipSync(fs.readFileSync(fileURLToPath(new URL('../public/models/neck-vessels.json.gz', import.meta.url)))));
  if (!raw) (mod ?? await quizModule('app/biomechanics-v2/carotid-bifurcation.ts')).smoothCarotids(nv.vessels);
  return nv.vessels;
}
const ringsOf = v => Array.from({length: v.positions.length / 36}, (_, j) => { const q = info(v, j); return {c: q.c.map(x => x * 1e3), r: q.r * 1e3}; });
/** Centre and radius of a tube at height y (mm), interpolated between the two rings that straddle it (rings of these tubes rise monotonically in the first centimetres). */
export function at(rings, y) {
  for (let j = 1; j < rings.length; j++) { const a = rings[j - 1], b = rings[j]; if ((a.c[1] - y) * (b.c[1] - y) <= 0 && a.c[1] !== b.c[1]) { const t = (y - a.c[1]) / (b.c[1] - a.c[1]); return {c: a.c.map((x, k) => x + t * (b.c[k] - x)), r: a.r + t * (b.r - a.r)}; } }
  return null;
}
export function separation(vessels, heights = HEIGHTS) {
  const by = new Map(vessels.map(v => [v.name, v])), out = {};
  for (const [side, c, i, e] of SIDES) {
    const common = ringsOf(by.get(c)), yEnd = common[common.length - 1].c[1], I = ringsOf(by.get(i)), E = ringsOf(by.get(e));
    out[side] = heights.map(h => { const a = at(I, yEnd + h), b = at(E, yEnd + h); if (!a || !b) return {h}; const dx = a.c[0] - b.c[0], dz = a.c[2] - b.c[2], d = Math.hypot(dx, dz); return {h, centre: +d.toFixed(2), wall: +(d - a.r - b.r).toFixed(2), dx: +dx.toFixed(2), dz: +dz.toFixed(2), rI: +a.r.toFixed(2), rE: +b.r.toFixed(2)}; });
    out[side].yEnd = +yEnd.toFixed(1);
  }
  return out;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const res = separation(await loadVessels(process.argv.includes('--raw')));
  if (process.argv.includes('--json')) console.log(JSON.stringify(res));
  else for (const side of ['left', 'right']) { console.log(`${side} (bifurcation y ${res[side].yEnd} mm)`); console.log('  h mm | centre mm | wall gap mm | ICA-ECA x | ICA-ECA z | rI | rE'); for (const r of res[side]) console.log(`  ${r.h} | ${r.centre} | ${r.wall} | ${r.dx} | ${r.dz} | ${r.rI} | ${r.rE}`); }
}
