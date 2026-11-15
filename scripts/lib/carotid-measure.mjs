// Measurements of the carotid bifurcation from the 12-vertex-ring tubes of neck-vessels.json.gz. Used by scripts/test-carotid-bifurcation.mjs and the audit table.
const R = 12;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], len = a => Math.hypot(...a);
const ring = (v, r) => Array.from({length: R}, (_, k) => [0, 1, 2].map(a => v.positions[(r * R + k) * 3 + a]));
const ctr = pts => [0, 1, 2].map(a => pts.reduce((s, p) => s + p[a], 0) / pts.length);
const normal = pts => { const n = [0, 0, 0]; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1]); } const l = len(n) || 1; return n.map(x => x / l); };
const area = (pts, c, ax) => { let s = 0; for (let i = 0; i < pts.length; i++) { const a = sub(pts[i], c), b = sub(pts[(i + 1) % pts.length], c); s += Math.abs(dot([a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], ax)); } return s / 2; };
export const info = (v, r) => { const p = ring(v, r), c = ctr(p), n = v.positions.length / (R * 3), a = sub(ctr(ring(v, Math.min(n - 1, r + 1))), ctr(ring(v, Math.max(0, r - 1)))), l = len(a) || 1, ax = a.map(x => x / l); return {p, c, ax, r: Math.sqrt(area(p, c, normal(p)) / Math.PI), n}; };
export function measureSide(common, internal, external) {
  const cn = common.positions.length / (R * 3), end = info(common, cn - 1), out = {};
  // 1. flat cut: distance of each branch's first ring from the common end ring (mean vertex to the nearest common-end vertex) and whether its section matches half of that ring
  out.startGapMm = [internal, external].map(b => { const f = ring(b, 0); return +(1000 * f.reduce((s, q) => s + Math.min(...end.p.map(e => len(sub(q, e)))), 0) / R).toFixed(2); });
  out.sectionAreaRatio = [internal, external].map(b => +(info(b, 0).r ** 2 / end.r ** 2).toFixed(2));   // each branch's first section as a share of the common end section (two halves = 1.0)
  // 2. continuity of diameter along each tube: largest ratio between neighbouring rings (equivalent radius), and of the centre step
  const worst = v => { const n = v.positions.length / (R * 3); let ratio = 1, jump = 0; let prev = info(v, 0), steps = []; for (let j = 1; j < n; j++) { const q = info(v, j); ratio = Math.max(ratio, q.r / prev.r, prev.r / q.r); steps.push(len(sub(q.c, prev.c))); prev = q; } const med = [...steps].sort((a, b) => a - b)[steps.length >> 1]; steps.forEach(s => { jump = Math.max(jump, s / med); }); return {ratio: +ratio.toFixed(3), jump: +jump.toFixed(2)}; };
  out.radiusStep = [internal, external].map(b => worst(b).ratio); out.centreJump = [internal, external].map(b => worst(b).jump);
  out.junctionRatio = [internal, external].map(b => +(info(b, 0).r / end.r).toFixed(2));
  // 3. branches passing through each other: vertices of one lying inside the other's section (circle of the equivalent radius in the ring plane nearest in height), above the septum zone
  const yEnd = end.c[1];
  const inside = (a, b, from) => { let n = 0, deep = 0; const nb = b.positions.length / (R * 3); const rings = Array.from({length: nb}, (_, j) => info(b, j)); const na = a.positions.length / (R * 3); for (let j = 0; j < na; j++) { const ia = info(a, j); if (ia.c[1] - yEnd < from) continue; for (const q of ia.p) { let best = rings[0], d0 = Infinity; for (const rb of rings) { const d = Math.abs(rb.c[1] - q[1]); if (d < d0) { d0 = d; best = rb; } } const v = sub(q, best.c), h = dot(v, best.ax), rr = len(sub(v, best.ax.map(x => x * h))); if (rr < best.r) { n++; deep = Math.max(deep, best.r - rr); } } } return {n, deepMm: +(deep * 1000).toFixed(2)}; };
  out.crossing = inside(internal, external, 0.012);
  out.crossingOther = inside(external, internal, 0.012);
  return out;
}
export const SIDES = [['left', 'Left common carotid artery', 'Internal carotid artery.l', 'External carotid artery.l'], ['right', 'Right common carotid artery', 'Internal carotid artery.r', 'External carotid artery.r']];
export function measureAll(vessels) { const by = new Map(vessels.map(v => [v.name, v])); return Object.fromEntries(SIDES.map(([s, c, i, e]) => [s, measureSide(by.get(c), by.get(i), by.get(e))])); }
