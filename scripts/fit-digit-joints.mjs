// Joint centres of the fingers from the real bone meshes: for each digit the carpometacarpal (thumb only), metacarpophalangeal, proximal and distal interphalangeal joint and the tip.
// A joint is the midpoint between the articular end of the proximal bone and the articular end of the distal bone (ends found along each bone's principal axis).
// Output: app/biomechanics-v2/digit-joints.json. Run: node scripts/fit-digit-joints.mjs [--check]
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadFullAtlas} from './lib/full-atlas.mjs';
const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
const {atlas, geometry} = loadFullAtlas();
const byName = new Map(atlas.parts.map(p => [p.name, p]));
const DIGITS = [['thumb', 'first'], ['index', 'second'], ['middle', 'third'], ['ring', 'fourth'], ['little', 'fifth']];
const ORD = {first: 'First', second: 'Second', third: 'Third', fourth: 'Fourth', fifth: 'Fifth'};
function pca(points) {
  const n = points.length / 3, c = [0, 0, 0];
  for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) c[k] += points[i * 3 + k] / n;
  const m = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < n; i++) { const d = [0, 1, 2].map(k => points[i * 3 + k] - c[k]); for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) m[a][b] += d[a] * d[b]; }
  let v = [1, 1, 1];
  for (let it = 0; it < 60; it++) { const w = [0, 1, 2].map(a => m[a][0] * v[0] + m[a][1] * v[1] + m[a][2] * v[2]), l = Math.hypot(...w) || 1; v = w.map(x => x / l); }
  return {c, axis: v};
}
// the two articular ends of a bone along its principal axis: centroid of the vertices within 2.5 mm of each extreme
function ends(id) {
  const p = atlas.parts.find(q => q.id === id), pts = geometry(p).positions, {c, axis} = pca(pts), n = pts.length / 3;
  let lo = Infinity, hi = -Infinity; const proj = new Float64Array(n);
  for (let i = 0; i < n; i++) { const t = (pts[i * 3] - c[0]) * axis[0] + (pts[i * 3 + 1] - c[1]) * axis[1] + (pts[i * 3 + 2] - c[2]) * axis[2]; proj[i] = t; lo = Math.min(lo, t); hi = Math.max(hi, t); }
  const avg = (pred) => { const s = [0, 0, 0]; let k = 0; for (let i = 0; i < n; i++) if (pred(proj[i])) { for (let a = 0; a < 3; a++) s[a] += pts[i * 3 + a]; k++; } return s.map(x => x / Math.max(1, k)); };
  const a = avg(t => t <= lo + .0025), b = avg(t => t >= hi - .0025);
  // radius: mean distance of the vertices to the axis through the centroid
  let r = 0; for (let i = 0; i < n; i++) { const d = [0, 1, 2].map(k => pts[i * 3 + k] - c[k] - proj[i] * axis[k]); r += Math.hypot(...d) / n; }
  return {a, b, radius: r, length: hi - lo};
}
const mid = (p, q) => p.map((x, i) => (x + q[i]) / 2);
const dist = (p, q) => Math.hypot(...p.map((x, i) => x - q[i]));
const out = {method: 'Joint centre = midpoint between the articular ends of the two neighbouring bones (ends along each bone principal axis, centroid of the vertices within 2.5 mm of the extreme). Rest pose of the atlas.', sides: {}};
for (const side of ['left', 'right']) {
  const cap = side[0].toUpperCase() + side.slice(1), digits = {};
  for (const [digit, ord] of DIGITS) {
    const finger = digit === 'thumb' ? 'thumb' : `${digit} finger`;
    const names = {
      mc: `${cap} ${ord} metacarpal bone`,
      pp: `Proximal phalanx of ${side} ${finger}`,
      mp: digit === 'thumb' ? null : `Middle phalanx of ${side} ${finger}`,
      dp: `Distal phalanx of ${side} ${finger}`
    };
    const ids = {}, e = {};
    for (const [k, name] of Object.entries(names)) if (name) { const p = byName.get(name); if (!p) throw new Error('missing ' + name); ids[k] = p.id; e[k] = ends(p.id); }
    // orient every bone's pair of ends proximal -> distal using the distance to the metacarpal's far end chain
    const wrist = e.mc, order = k => { const x = e[k]; return dist(x.a, e.mc.a) <= dist(x.b, e.mc.a) ? [x.a, x.b] : [x.b, x.a]; };
    const mcProx = e.mc.a, mcDist = (dist(e.mc.a, e.pp.a) + dist(e.mc.a, e.pp.b)) / 2 > 0 ? null : null; void mcDist; void wrist;
    // metacarpal: proximal end is the one further from the proximal phalanx
    const ppC = mid(e.pp.a, e.pp.b), mcEnds = dist(e.mc.a, ppC) > dist(e.mc.b, ppC) ? [e.mc.a, e.mc.b] : [e.mc.b, e.mc.a];
    const chain = digit === 'thumb' ? ['pp', 'dp'] : ['pp', 'mp', 'dp'];
    const pe = {}; for (const k of chain) pe[k] = order(k);
    const joints = {cmc: mcEnds[0].map(x => x), mcp: mid(mcEnds[1], pe.pp[0]), ...(digit === 'thumb' ? {ip: mid(pe.pp[1], pe.dp[0])} : {pip: mid(pe.pp[1], pe.mp[0]), dip: mid(pe.mp[1], pe.dp[0])})};
    const radius = Math.max(...chain.map(k => e[k].radius));
    digits[digit] = {ids, joints: Object.fromEntries(Object.entries(joints).map(([k, v]) => [k, v.map(x => +x.toFixed(5))])), tip: pe.dp[1].map(x => +x.toFixed(5)), radius: +radius.toFixed(5), boneLength: Object.fromEntries(['mc', ...chain].map(k => [k, +e[k].length.toFixed(4)]))};
  }
  out.sides[side] = digits;
}
const json = JSON.stringify(out, null, 1) + '\n', target = file('app/biomechanics-v2/digit-joints.json');
if (process.argv.includes('--check')) { if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== json) { console.error('digit-joints.json is out of date: run node scripts/fit-digit-joints.mjs'); process.exit(1); } console.log('digit joints up to date'); }
else { fs.writeFileSync(target, json); console.log(JSON.stringify(out.sides.left, null, 0).slice(0, 1800)); }
