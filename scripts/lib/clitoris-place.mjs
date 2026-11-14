// Places the Clitoris-MRI-2 parts (scripts/data/clitoris-mri2.json.gz, mm, model frame: x across, y toward the glans, z toward the raised body) on the female pelvis (atlas frame, metres).
// The model is a real-size MRI reconstruction, so only a similarity transform is fitted (uniform scale, rotation, translation); nothing inside it is bent.
// Fitted terms: the crura lie against the inferior surface of the ischiopubic rami (the Human Reference Atlas hip bones), the glans is under the lower border of the pubic symphysis on the midline,
// the bulbs of the vestibule lie beside the vagina, and the scale stays near the registration scale of the female pelvis (0.83), where the organs of the same atlas live.
import {makeGrid} from './icp.mjs';

const M0 = [[-1, 0, 0], [0, 0, 1], [0, 1, 0]];   // model (x across, y toward the glans, z up) → atlas (+x body left, +y up, +z anterior); a proper rotation (determinant +1)
const mm = (A, B) => A.map(r => [0, 1, 2].map(j => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
const euler = (a, b, c) => { const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b), cc = Math.cos(c), sc = Math.sin(c); return mm([[cc, -sc, 0], [sc, cc, 0], [0, 0, 1]], mm([[cb, 0, sb], [0, 1, 0], [-sb, 0, cb]], [[1, 0, 0], [0, ca, -sa], [0, sa, ca]])); };
const centroidOf = a => { const c = [0, 0, 0], n = a.length / 3; for (let i = 0; i < a.length; i += 3) for (let k = 0; k < 3; k++) c[k] += a[i + k] / n; return c; };
const sample = (a, step) => { const o = []; for (let i = 0; i < a.length; i += 3 * step) o.push([a[i], a[i + 1], a[i + 2]]); return o; };

function nelderMead(f, x0, step, iters) {
  const n = x0.length; let S = [x0, ...x0.map((_, i) => x0.map((v, j) => (j === i ? v + step[i] : v)))].map(x => ({x, f: f(x)}));
  for (let it = 0; it < iters; it++) {
    S.sort((a, b) => a.f - b.f); const c = x0.map((_, j) => S.slice(0, n).reduce((s, p) => s + p.x[j], 0) / n);
    const xr = c.map((v, j) => v + (v - S[n].x[j])), fr = f(xr);
    if (fr < S[0].f) { const xe = c.map((v, j) => v + 2 * (v - S[n].x[j])), fe = f(xe); S[n] = fe < fr ? {x: xe, f: fe} : {x: xr, f: fr}; }
    else if (fr < S[n - 1].f) S[n] = {x: xr, f: fr};
    else { const xc = c.map((v, j) => v + .5 * (S[n].x[j] - v)), fc = f(xc); if (fc < S[n].f) S[n] = {x: xc, f: fc}; else for (let k = 1; k <= n; k++) { const x = S[k].x.map((v, j) => S[0].x[j] + .5 * (v - S[0].x[j])); S[k] = {x, f: f(x)}; } }
  }
  S.sort((a, b) => a.f - b.f); return S[0];
}

/** parts: {glans, body, crusL, crusR, bulbL, bulbR: Float32Array of xyz in mm}; hip, vagina: Float64Array/Float32Array of xyz (m). Returns {place(p) → atlas point, report}. */
export function fitClitoris(parts, hip, vagina, {glansTarget = [0, .846, .026]} = {}) {
  const hipGrid = makeGrid(hip, .004), vagGrid = makeGrid(vagina, .004), crura = [...sample(parts.crusL, 6), ...sample(parts.crusR, 6)], glansC = centroidOf(parts.glans), bulbC = [centroidOf(parts.bulbL), centroidOf(parts.bulbR)];
  const make = prm => {
    const [s, tx, ty, tz, ra, rb, rc] = prm, M = mm(euler(ra, rb, rc), M0);
    return p => [(M[0][0] * p[0] + M[0][1] * p[1] + M[0][2] * p[2]) * s * 1e-3 + tx, (M[1][0] * p[0] + M[1][1] * p[1] + M[1][2] * p[2]) * s * 1e-3 + ty, (M[2][0] * p[0] + M[2][1] * p[1] + M[2][2] * p[2]) * s * 1e-3 + tz];
  };
  const cost = prm => {
    const f = make(prm); let c = 0;
    for (const p of crura) { const q = f(p), nn = hipGrid.nearest(q[0], q[1], q[2], .03), d = nn ? nn.dist : .03; c += ((d - .0025) / .0025) ** 2 * .4; }   // crura against the rami (2.5 mm: touching)
    const g = f(glansC); c += (((g[0] - glansTarget[0]) ** 2 + (g[1] - glansTarget[1]) ** 2 + (g[2] - glansTarget[2]) ** 2) / (.004 ** 2)) * 3 + (g[0] / .0015) ** 2 * 4;   // glans under the symphysis, on the midline
    for (const b of bulbC) { const q = f(b), nn = vagGrid.nearest(q[0], q[1], q[2], .05), d = nn ? nn.dist : .05; c += ((d - .012) / .006) ** 2 * 8 + ((q[1] - .846) / .005) ** 2 * 6; }   // bulbs beside the vagina, near the level of the vestibule
    return c + ((prm[0] - .88) / .1) ** 2 * 5 + Math.max(0, (prm[0] - 1.15) / .05) ** 2 * 50 + Math.max(0, (.8 - prm[0]) / .05) ** 2 * 50 + (prm[4] ** 2 + prm[5] ** 2 + prm[6] ** 2) / .35 ** 2 * .5;
  };
  let best = null;
  for (const s0 of [.9, 1.05]) for (const tz of [-.005, .01]) { const r = nelderMead(cost, [s0, 0, .842, tz, 0, 0, 0], [.08, .004, .004, .006, .2, .2, .2], 500); if (!best || r.f < best.f) best = r; }
  const f = make(best.x), d = crura.map(p => { const q = f(p), nn = hipGrid.nearest(q[0], q[1], q[2], .05); return nn ? nn.dist * 1e3 : 50; }).sort((a, b) => a - b);
  return {place: f, scale: best.x[0], report: {cost: best.f, scale: best.x[0], crusToBoneMedianMm: d[d.length >> 1], crusToBoneP90Mm: d[Math.floor(d.length * .9)], glans: f(glansC).map(v => v * 1e3)}};
}
