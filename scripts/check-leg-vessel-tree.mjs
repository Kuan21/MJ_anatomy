// Checks the lower-limb vessel tree (app/data/vessel-tree/*.json) and the tubes built from it (scripts/lib/leg-vessel-build.mjs) on the rest pose.
//   tree          ids unique, every parent exists, no cycles, a child never starts wider than its parent is where the child leaves it
//   continuity    each child starts on its parent's centreline (<= 0.5 mm), is one connected piece, and its end is wide unless the vessel is marked terminal (end radius >= 60% of start)
//   bones         no centreline point behind the nearest face of a bone, wall at most 0.6 mm into a bone (the bone meshes are coarse); hip bone, femur, sacrum, lowest lumbar vertebrae
//   nerves        a centreline keeps at least 0.3 * radius (less 0.5 mm, the nerve meshes are approximate) from every nerve surface (side by side is fine, running through a nerve is not)
//   order         femoral triangle: femoral nerve lateral to the femoral artery, artery lateral to the femoral vein
// Known exceptions are in docs/leg-vessel-tree-baseline.json (key "vessel|check"); a new one, or a known one that gets worse, fails. Only counts and pass/fail are printed.
//   node scripts/check-leg-vessel-tree.mjs [--write] [--list]
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadTree, buildTree, SIDES} from './lib/leg-vessel-build.mjs';
import {Grid} from './audit-vessel-ends.mjs';
import {closest, meshOf} from './lib/heart-geom.mjs';
import {closest as exactClosest} from './lib/leg-centreline.mjs';

const root = new URL('../', import.meta.url), baseFile = fileURLToPath(new URL('docs/leg-vessel-tree-baseline.json', root));
const write = process.argv.includes('--write'), list = process.argv.includes('--list');
const tree = loadTree(), failures = new Map();   // key -> measure (smaller is better); 0 = clean
const fail = (v, check, measure, text) => failures.set(`${v}|${check}`, {measure, text});
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], len = a => Math.hypot(a[0], a[1], a[2]);

// ---- tree ------------------------------------------------------------------------------------------------------------------
const ids = new Set(); for (const v of tree.vessels) { if (ids.has(v.id)) fail(v.id, 'duplicate id', 1, 'duplicate id'); ids.add(v.id); }
for (const v of tree.vessels) {
  if (v.parent && !ids.has(v.parent)) fail(v.id, 'parent', 1, `parent ${v.parent} missing`);
  let p = v, k = 0; while (p?.parent && k++ < 50) p = tree.vessels.find(x => x.id === p.parent); if (k >= 50) fail(v.id, 'cycle', 1, 'cycle');
  if (!v.origin?.en || !v.origin?.zh || !v.course?.en || !v.course?.zh || !v.supply?.en || !v.supply?.zh) fail(v.id, 'card fields', 1, 'origin, course and supply need English and Chinese text');
  if (!v.terminal && !tree.vessels.some(x => x.parent === v.id)) fail(v.id, 'dead end', 1, 'not terminal and has no child');
}
const built = buildTree(tree), {world: w} = built;

// ---- obstacles -------------------------------------------------------------------------------------------------------------
const boneNames = side => [`${side} hip bone`, `${side} femur`, 'Sacrum', 'Fifth lumbar vertebra', 'Fourth lumbar vertebra'].filter(n => w.has(n));
const boneMesh = new Map(); for (const S of SIDES) for (const n of boneNames(S.w)) if (!boneMesh.has(n)) boneMesh.set(n, w.mesh(n));
const nerves = new Grid();
for (const e of w.entries) if (e.system === 'nervous') { const g = e.load(); let lo = 9, hi = -9; for (let i = 1; i < g.positions.length; i += 3) { lo = Math.min(lo, g.positions[i]); hi = Math.max(hi, g.positions[i]); } if (hi < 1.1 && lo > -.01 && g.indices.length) for (let i = 0; i < g.indices.length; i += 3) nerves.add(e.name, [0, 1, 2].map(a => g.positions[g.indices[i] * 3 + a]), [0, 1, 2].map(a => g.positions[g.indices[i + 1] * 3 + a]), [0, 1, 2].map(a => g.positions[g.indices[i + 2] * 3 + a])); }

// ---- per vessel -------------------------------------------------------------------------------------------------------------
const byKey = new Map(built.vessels.map(b => [`${b.side}|${b.id}`, b]));
for (const b of built.vessels) {
  const label = `${b.side} ${b.id}`, v = tree.vessels.find(x => x.id === b.id), n = b.path.length;
  if (b.parent) {
    const pb = byKey.get(`${b.side}|${b.parent}`), gap = Math.min(...pb.path.map(p => len(sub(p, b.path[0])))) * 1000;
    if (gap > .5) fail(label, 'start on parent', +gap.toFixed(1), `starts ${gap.toFixed(1)} mm from its parent's centreline`);
    const j = pb.path.reduce((a, p, i) => len(sub(p, b.path[0])) < len(sub(pb.path[a], b.path[0])) ? i : a, 0), pr = pb.r0 + (pb.r1 - pb.r0) * j / Math.max(1, pb.path.length - 1);
    if (b.r0 > pr * 1.02) fail(label, 'wider than parent', +((b.r0 - pr) * 1000).toFixed(2), `starts ${(b.r0 * 2000).toFixed(1)} mm wide on a ${(pr * 2000).toFixed(1)} mm parent`);
  }
  if (!b.terminal && b.r1 < b.r0 * .6) fail(label, 'taper', +((b.r0 * .6 - b.r1) * 1000).toFixed(2), 'tapers although not terminal');
  // one connected piece
  const g = b.geometry, par = Array.from({length: g.positions.length / 3}, (_, i) => i), f = x => { while (par[x] !== x) x = par[x] = par[par[x]]; return x; };
  for (let i = 0; i < g.indices.length; i += 3) { par[f(g.indices[i])] = f(g.indices[i + 1]); par[f(g.indices[i + 1])] = f(g.indices[i + 2]); }
  const pieces = new Set(); for (let i = 0; i < par.length; i++) pieces.add(f(i)); if (pieces.size > 1) fail(label, 'pieces', pieces.size, `${pieces.size} pieces`);
  // bones and nerves, along the centreline
  let inside = 0, worst = 0, near = 0;
  b.path.forEach((p, i) => {
    const r = b.r0 + (b.r1 - b.r0) * i / Math.max(1, n - 1);
    for (const nm of boneNames(b.side)) {
      const m = boneMesh.get(nm); if (p[0] < m.lo[0] - .03 || p[0] > m.hi[0] + .03 || p[1] < m.lo[1] - .03 || p[1] > m.hi[1] + .03 || p[2] < m.lo[2] - .03 || p[2] > m.hi[2] + .03) continue;
      const h = exactClosest(m, p), sgn = (p[0] - h.point[0]) * h.normal[0] + (p[1] - h.point[1]) * h.normal[1] + (p[2] - h.point[2]) * h.normal[2];
      if (sgn < 0) { inside++; worst = Math.max(worst, r + h.d); } else if (h.d < r * .8) worst = Math.max(worst, r * .8 - h.d);   // behind the nearest face of the bone, or the wall closer than 0.2 r
    }
    const q = nerves.nearest(p, .02, null); if (q.tag && q.d < r * .3) near = Math.max(near, r * .3 - q.d);
  });
  if (inside) fail(label, 'inside bone', +(inside * 3).toFixed(0), `${inside * 3} mm of the centreline inside a bone`);
  else if (worst > .0006) fail(label, 'bone wall', +(worst * 1000).toFixed(1), `wall reaches ${(worst * 1000).toFixed(1)} mm into a bone`);
  if (near > .0005) fail(label, 'nerve overlap', +(near * 1000).toFixed(1), `wall overlaps a nerve by ${(near * 1000).toFixed(1)} mm`);
}
// ---- order at the femoral triangle ---------------------------------------------------------------------------------------------
for (const S of SIDES) {
  const a = byKey.get(`${S.w}|femoral-artery`), lat = S.sx, ya = .86;
  const at = path => path.reduce((x, p) => Math.abs(p[1] - ya) < Math.abs(x[1] - ya) ? p : x, path[0]);
  const nerve = w.entries.find(e => e.system === 'nervous' && new RegExp(`^Femoral nerve\\.${S.s[0]}`).test(e.name));
  const vein = w.find(`${S.w} femoral vein`)[0];
  if (!nerve || !vein) continue;
  const centreAt = e => { const g = e.load(), pts = []; for (let i = 0; i < g.positions.length; i += 3) if (Math.abs(g.positions[i + 1] - ya) < .01) pts.push([g.positions[i], g.positions[i + 1], g.positions[i + 2]]); return pts.length ? pts.reduce((s, p) => [s[0] + p[0] / pts.length, 0, 0], [0, 0, 0])[0] * lat : null; };
  const xn = centreAt(nerve), xv = centreAt(vein), xa = at(a.path)[0] * lat;
  if (xn != null && xv != null && !(xn > xa && xa > xv)) fail(`${S.w} femoral-artery`, 'femoral triangle order', 1, 'femoral nerve, artery and vein are not lateral to medial');
}

// ---- baseline ------------------------------------------------------------------------------------------------------------------
const report = [...failures].map(([k, v]) => `${k}: ${v.text}`);
if (write) { fs.writeFileSync(baseFile, JSON.stringify({note: 'Known failures of scripts/check-leg-vessel-tree.mjs (vessel|check -> size). A new one, or a bigger one, fails the build. Fix the vessel instead of adding to this list.', known: Object.fromEntries([...failures].map(([k, v]) => [k, v.measure]))}, null, 1)); console.log(`Leg vessel tree: baseline written with ${failures.size} entries.`); process.exit(0); }
const known = fs.existsSync(baseFile) ? JSON.parse(fs.readFileSync(baseFile, 'utf8')).known : {};
const bad = [...failures].filter(([k, v]) => !(k in known) || v.measure > known[k] + 1e-9);
if (list) console.log(report.join('\n'));
if (bad.length) { console.error(`Leg vessel tree: ${bad.length} new or worse problems of ${failures.size}`); for (const [k, v] of bad) console.error(' - ' + k + ': ' + v.text); process.exit(1); }
console.log(`Leg vessel tree OK: ${tree.vessels.length} vessels x 2 sides built (${built.vessels.length} tubes), ${failures.size} known exceptions, none new.`);
