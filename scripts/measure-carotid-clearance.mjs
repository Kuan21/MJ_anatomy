// Read-only measurement: wall clearance between the three carotid arteries and their neighbours (internal jugular vein, vagus nerve, thyroid cartilage, hyoid bone, cricoid cartilage, C2 to C6).
//   node scripts/measure-carotid-clearance.mjs [--raw] [--md]
//   --raw   source tubes as stored (before the load-time raise and rebuild of the bifurcation); default: as the viewer draws them
// Method: for every vertex of the neighbour, distance to the artery's centre line (polyline of ring centres) minus the artery's ring radius at the nearest ring = wall clearance in mm; the minimum per pair is
// reported with its height. Negative = a vertex of the neighbour lies inside the artery's lumen. Vertices only (large flat triangles of the cartilages can pass between vertices), so this is an upper bound on how close
// the surfaces are; the 3D screenshots are the check for the rest. Needs the generated streams (public/models), writes nothing.
import fs from 'node:fs';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {loadWorld} from './lib/paokao-world.mjs';
import {quizModule} from './quiz-modules.mjs';
import {info, SIDES} from './lib/carotid-measure.mjs';
const raw = process.argv.includes('--raw'), md = process.argv.includes('--md');
const nv = JSON.parse(zlib.gunzipSync(fs.readFileSync(fileURLToPath(new URL('../public/models/neck-vessels.json.gz', import.meta.url)))));
if (!raw) (await quizModule('app/biomechanics-v2/carotid-bifurcation.ts')).smoothCarotids(nv.vessels);
const world = loadWorld({paokao: false});
const vessel = n => nv.vessels.find(v => v.name === n);
const rings = v => Array.from({length: v.positions.length / 36}, (_, j) => { const q = info(v, j); return {c: q.c.map(x => x * 1e3), r: q.r * 1e3}; });
const seg = (p, a, b) => { const ab = [0, 1, 2].map(k => b[k] - a[k]), ap = [0, 1, 2].map(k => p[k] - a[k]), L = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2 || 1e-12, t = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / L)); return {d: Math.hypot(...[0, 1, 2].map(k => ap[k] - ab[k] * t)), t}; };
function clearance(arteryRings, targets) {
  let best = {gap: Infinity, y: NaN};
  for (const P of targets) for (let i = 0; i < P.length; i += 3) {
    const p = [P[i] * 1e3, P[i + 1] * 1e3, P[i + 2] * 1e3];
    if (p[1] < arteryRings[0].c[1] - 40 || p[1] > arteryRings[arteryRings.length - 1].c[1] + 40 && arteryRings[0].c[1] < arteryRings[arteryRings.length - 1].c[1]) continue;
    for (let j = 1; j < arteryRings.length; j++) { const a = arteryRings[j - 1], b = arteryRings[j], s = seg(p, a.c, b.c), gap = s.d - (a.r + (b.r - a.r) * s.t); if (gap < best.gap) best = {gap, y: p[1]}; }
  }
  return {gap: +best.gap.toFixed(1), y: +best.y.toFixed(1)};
}
const byId = id => world.entries.filter(e => e.id === id).map(e => e.load().positions), geom = name => world.find(name).map(e => e.load().positions);
const rows = [];
for (const [side, c, i, e] of SIDES) {
  const tag = side === 'left' ? 'l' : 'r', S = side === 'left' ? 'Left' : 'Right';
  const arteries = [['CCA', c], ['ICA', i], ['ECA', e]].map(([k, n]) => [k, rings(vessel(n))]);
  const targets = [['IJV', [vessel(`Internal jugular vein.${tag}`).positions]], ['Vagus', geom(`Vagus nerve (X).${tag}`)], ['Thyroid cart.', byId('FJ2808')], ['Hyoid', byId('FJ2772')], ['Cricoid', byId('FJ2440')],
    ...[['C2', 'FJ3177'], ['C3', 'FJ3161'], ['C4', 'FJ3164'], ['C5', 'FJ3167'], ['C6', 'FJ3170']].map(([k, id]) => [k, byId(id)])];
  for (const [t, g] of targets) for (const [k, ar] of arteries) { const r = clearance(ar, g.filter(x => x)); rows.push({side: S, artery: k, target: t, gapMm: r.gap, atY: r.y}); }
}
if (md) { console.log('| 側 | 動脈 | 鄰近結構 | 管壁間距 mm | 在高度 y mm |\n|---|---|---|---|---|'); for (const r of rows) console.log(`| ${r.side} | ${r.artery} | ${r.target} | ${r.gapMm} | ${r.atY} |`); }
else console.log(JSON.stringify(rows));
