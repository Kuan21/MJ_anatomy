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

// --- seam measurements (junction of the common carotid with its branches, and the shift that raises the bifurcation) ---
/** Area-weighted vertex normals, as three.js computeVertexNormals does. */
export function vertexNormals(positions, indices) {
  const n = new Float64Array(positions.length);
  for (let t = 0; t < indices.length; t += 3) {
    const [a, b, c] = [indices[t], indices[t + 1], indices[t + 2]], P = i => [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]];
    const pa = P(a), pb = P(b), pc = P(c), u = sub(pb, pa), w = sub(pc, pa), f = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    for (const i of [a, b, c]) for (let k = 0; k < 3; k++) n[i * 3 + k] += f[k];
  }
  for (let i = 0; i < n.length; i += 3) { const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1; n[i] /= l; n[i + 1] /= l; n[i + 2] /= l; }
  return n;
}
/** Largest angle (degrees) between the normal of a ring vertex and the radial direction (ring plane, away from the centre line) of a tube. */
export function normalVsRadial(v, normals, r) {
  const q = info(v, r), ax = q.ax; let worst = 0;
  for (let k = 0; k < R; k++) {
    const d = sub(q.p[k], q.c), h = dot(d, ax), rad = d.map((x, i) => x - ax[i] * h), l = len(rad) || 1, nn = [0, 1, 2].map(a => normals[(r * R + k) * 3 + a]);
    worst = Math.max(worst, Math.acos(Math.max(-1, Math.min(1, dot(rad, nn) / l))) * 180 / Math.PI);
  }
  return +worst.toFixed(1);
}
/** Angle (degrees) of the first vertex of each ring about the tube axis; the source rings turn by one vertex (30 degrees) per ring. */
export function ringAngles(v) {
  const n = v.positions.length / (R * 3), out = [];
  for (let r = 0; r < n; r++) {
    const q = info(v, r), ref = Math.abs(q.ax[0]) < .9 ? [1, 0, 0] : [0, 1, 0], e1 = cross(q.ax, ref), l1 = len(e1), u1 = e1.map(x => x / l1), u2 = cross(q.ax, u1), d = sub(q.p[0], q.c);
    out.push(Math.atan2(dot(d, u2), dot(d, u1)) * 180 / Math.PI);
  }
  return out;
}
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
/** Steps between ring angles wrapped to (-180, 180]. */
export const angleSteps = a => a.slice(1).map((x, i) => { let d = x - a[i]; while (d > 180) d -= 360; while (d <= -180) d += 360; return d; });
/** Ring spacing ratios between neighbouring rings (max of a/b and b/a), centre steps in mm. */
export function spacingRatios(v) { const n = v.positions.length / (R * 3), s = []; for (let r = 1; r < n; r++) s.push(len(sub(info(v, r).c, info(v, r - 1).c))); return s.slice(1).map((x, i) => Math.max(x / s[i], s[i] / x)); }
/** Second difference (mm) of the displacement field between a tube before and after a shift: |d[r-1] - 2 d[r] + d[r+1]| per ring, for rings of equal count. */
export function shiftSecondDifference(before, after) {
  const n = before.positions.length / (R * 3), d = Array.from({length: n}, (_, r) => sub(info(after, r).c, info(before, r).c).map(x => x * 1e3)), out = [];
  for (let r = 1; r < n - 1; r++) out.push(len([0, 1, 2].map(a => d[r - 1][a] - 2 * d[r][a] + d[r + 1][a])));
  return out;
}
