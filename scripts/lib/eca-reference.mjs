// The external carotid artery as the viewer draws it: the 12-vertex-ring tube of neck-vessels.json.gz after the load-time raise and rebuild of the carotid bifurcation
// (app/biomechanics-v2/carotid-bifurcation.ts, the same code the viewer runs). The branch structures of the external carotid artery (scripts/paokao-structures/eca-branches.mjs) are
// derived from this centre line at fixed arc lengths, so they follow the artery wherever the bifurcation code puts it.
// Units: metres, y up, x positive = Left, z positive = anterior.
import fs from 'node:fs';
import zlib from 'node:zlib';
import {quizModule} from '../quiz-modules.mjs';

const RING = 12, root = new URL('../../', import.meta.url);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const len = a => Math.hypot(a[0], a[1], a[2]), unit = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

let cached = null;
/** The neck-vessel tubes after the load-time bifurcation rebuild (cached; a fresh copy of the generated data is read once). */
export async function loadNeckVessels() {
  if (cached) return cached;
  const data = JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL('public/models/neck-vessels.json.gz', root))));
  (await quizModule('app/biomechanics-v2/carotid-bifurcation.ts')).smoothCarotids(data.vessels);
  return (cached = data.vessels);
}

/** Ring centres, mean radii and arc lengths of one tube, plus lookups by arc length. */
export function centreLine(vessel) {
  const n = vessel.positions.length / (RING * 3), c = [], r = [], arc = [0];
  for (let i = 0; i < n; i++) {
    const p = Array.from({length: RING}, (_, k) => [0, 1, 2].map(a => vessel.positions[(i * RING + k) * 3 + a])), cc = mul(p.reduce((s, q) => add(s, q), [0, 0, 0]), 1 / RING);
    c.push(cc); r.push(p.reduce((s, q) => s + len(sub(q, cc)), 0) / RING);
    if (i) arc.push(arc[i - 1] + len(sub(cc, c[i - 1])));
  }
  const at = s => {
    const t = Math.max(0, Math.min(arc[n - 1], s)); let i = 0; while (i < n - 2 && arc[i + 1] < t) i++;
    const f = (t - arc[i]) / ((arc[i + 1] - arc[i]) || 1);
    return {c: add(mul(c[i], 1 - f), mul(c[i + 1], f)), r: r[i] * (1 - f) + r[i + 1] * f, dir: unit(sub(c[Math.min(n - 1, i + 1)], c[i])), s: t};
  };
  return {c, r, arc, at, length: arc[n - 1]};
}

/** {left, right} centre lines of the external carotid artery. */
export async function externalCarotid() {
  const vs = await loadNeckVessels(), by = n => vs.find(v => v.name === n);
  return {left: centreLine(by('External carotid artery.l')), right: centreLine(by('External carotid artery.r'))};
}
