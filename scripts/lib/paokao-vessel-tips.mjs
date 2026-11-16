// Round the free ends of the schematic vessels (scripts/prepare-paokao.mjs): every vessel tube of the paokao structures is built with flat caps, which stand out as a clean cut where the vessel is meant to end.
// A free end narrows in its own mesh like the atlas vessels' ends do (scripts/lib/vessel-tip-shape.mjs); only vertex positions change, nothing is added or re-connected, and no end that touches another
// vessel (a branch leaving its parent, a vessel carrying on into the next piece, a connector) is touched.
import {shapeVesselTips, taperLength, continuesAhead} from './vessel-tip-shape.mjs';

export const MAX_RADIUS = .006;   // a vessel wider than 6 mm keeps its flat cut (listed in the pull request)
const TOUCH = r => Math.max(.0009, 1.5 * r);

function triDist(p, a, b, c) {   // distance from point p to triangle abc (Ericson, Real-Time Collision Detection)
  const sub = (u, v) => [u[0] - v[0], u[1] - v[1], u[2] - v[2]], dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  const ab = sub(b, a), ac = sub(c, a), ap = sub(p, a), d1 = dot(ab, ap), d2 = dot(ac, ap);
  const out = q => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]), at = (o, ...k) => [o[0] + k.reduce((s, [t, v]) => s + t * v[0], 0), o[1] + k.reduce((s, [t, v]) => s + t * v[1], 0), o[2] + k.reduce((s, [t, v]) => s + t * v[2], 0)];
  if (d1 <= 0 && d2 <= 0) return out(a);
  const bp = sub(p, b), d3 = dot(ab, bp), d4 = dot(ac, bp); if (d3 >= 0 && d4 <= d3) return out(b);
  const vc = d1 * d4 - d3 * d2; if (vc <= 0 && d1 >= 0 && d3 <= 0) return out(at(a, [d1 / (d1 - d3), ab]));
  const cp = sub(p, c), d5 = dot(ab, cp), d6 = dot(ac, cp); if (d6 >= 0 && d5 <= d6) return out(c);
  const vb = d5 * d2 - d1 * d6; if (vb <= 0 && d2 >= 0 && d6 <= 0) return out(at(a, [d2 / (d2 - d6), ac]));
  const va = d3 * d6 - d5 * d4; if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) return out(at(b, [(d4 - d3) / ((d4 - d3) + (d5 - d6)), sub(c, b)]));
  const den = 1 / (va + vb + vc); return out(at(a, [vb * den, ab], [vc * den, ac]));
}

/**
 * Plan the rounding of the free ends of one schematic vessel part (reads the geometry as built; every part is planned before any is changed, so the result does not depend on the order).
 * @param part   {positions: Float32Array, indices: Uint32Array, vesselEnds}
 * @param others [{bounds: [[x,y,z],[x,y,z]], positions, indices}]  every other vessel surface (the atlas vessels, the other schematic vessels, the connectors)
 * @returns {tapers: [{center, dir, radius, length}], kept: number, tooWide: number}
 */
export function planFreeEnds(part, others) {
  const tapers = []; let kept = 0, tooWide = 0;
  for (const e of part.vesselEnds ?? []) {
    if (e.radius > MAX_RADIUS) { tooWide++; continue; }
    const length = Math.min(taperLength(e.radius), .45 * e.pathLength);
    if (length < Math.max(.001, 1.2 * e.radius)) { kept++; continue; }
    const pad = TOUCH(e.radius) + .001;
    let touches = continuesAhead(part.positions, e.center, e.dir, e.radius, length);
    for (const o of others) {
      if (touches) break;
      const [lo, hi] = o.bounds; if (e.center.some((x, k) => x < lo[k] - pad || x > hi[k] + pad)) continue;
      const R = TOUCH(e.radius), [cx, cy, cz] = e.center, P = o.positions;
      for (let t = 0; t < o.indices.length && !touches; t += 3) {
        const i = o.indices[t] * 3, j = o.indices[t + 1] * 3, k = o.indices[t + 2] * 3;
        if ((P[i] < cx - R && P[j] < cx - R && P[k] < cx - R) || (P[i] > cx + R && P[j] > cx + R && P[k] > cx + R) || (P[i + 1] < cy - R && P[j + 1] < cy - R && P[k + 1] < cy - R) || (P[i + 1] > cy + R && P[j + 1] > cy + R && P[k + 1] > cy + R) || (P[i + 2] < cz - R && P[j + 2] < cz - R && P[k + 2] < cz - R) || (P[i + 2] > cz + R && P[j + 2] > cz + R && P[k + 2] > cz + R)) continue;   // the triangle's box does not reach the end
        if (triDist(e.center, [o.positions[i], o.positions[i + 1], o.positions[i + 2]], [o.positions[j], o.positions[j + 1], o.positions[j + 2]], [o.positions[k], o.positions[k + 1], o.positions[k + 2]]) <= TOUCH(e.radius)) touches = true;
      }
    }
    if (touches) { kept++; continue; }
    tapers.push({center: e.center, dir: e.dir, radius: e.radius, length});
  }
  return {tapers, kept, tooWide};
}

/** Apply a plan to the final (possibly simplified) mesh of the part, in place. Returns how many ends were rounded. */
export function applyFreeEnds(positions, indices, plan) {
  if (!plan.tapers.length) return 0;
  return shapeVesselTips(positions, plan.tapers, [], indices).applied.tapers;
}
