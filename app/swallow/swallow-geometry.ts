/** Shapes measured from the atlas meshes for the swallowing animation (plain arrays, no three.js), so the node test can check them on the real meshes (scripts/test-swallow.mjs).
 *  Model frame: metres, +x the body's left, +y up, +z front. Every measure is taken in the midline band (|x| < band), where the section of the animation is cut. */
export type P = [number, number, number];

/** The vertices of several meshes that lie in the midline band. */
export function midline(arrays: ArrayLike<number>[], band = .006): P[] {
  const out: P[] = [];
  for (const a of arrays) for (let k = 0; k + 2 < a.length; k += 3) if (Math.abs(a[k]) < band) out.push([a[k], a[k + 1], a[k + 2]]);
  return out;
}
const pick = (pts: P[], axis: 1 | 2, at: number, w: number, other: 1 | 2, max: boolean) => {
  let best: number | null = null;
  for (const p of pts) if (Math.abs(p[axis] - at) <= w) {const v = p[other]; if (best === null || (max ? v > best : v < best)) best = v;}
  return best;
};
/** Highest point (y) of the points within ±w of a front–back position z (the top of the tongue there). */
export const topAt = (pts: P[], z: number, w = .003) => pick(pts, 2, z, w, 1, true);
/** Lowest point (y) within ±w of z (the underside of the hard palate there). */
export const bottomAt = (pts: P[], z: number, w = .003) => pick(pts, 2, z, w, 1, false);
/** Hindmost point (z) within ±w of a height y (the back of the tongue, epiglottis or larynx there). */
export const backAt = (pts: P[], y: number, w = .003) => pick(pts, 1, y, w, 2, false);
/** Frontmost point (z) within ±w of a height y (the inner face of the posterior pharyngeal wall there). */
export const frontAt = (pts: P[], y: number, w = .003) => pick(pts, 1, y, w, 2, true);

/** The pharyngeal cavity at a height: between the back of the structures in front (tongue, epiglottis, larynx) and the inner face of the posterior wall (constrictors). */
export function lumenAt(front: P[], wall: P[], y: number, w = .003): {z: number; width: number} | null {
  const a = backAt(front, y, w), b = frontAt(wall, y, w);
  if (a === null || b === null || b >= a) return null;
  return {z: (a + b) / 2, width: a - b};
}

/** The way through the pharynx from yTop down to yBottom, in the middle of the cavity at every level (levels where the cavity cannot be measured are filled in between their neighbours). */
export function pharynxPath(front: P[], wall: P[], yTop: number, yBottom: number, steps = 12): {points: P[]; widths: number[]} {
  const raw = Array.from({length: steps}, (_, i) => {const y = yTop + (yBottom - yTop) * i / (steps - 1); return {y, l: lumenAt(front, wall, y)};});
  const known = raw.filter(r => r.l);
  if (!known.length) return {points: [], widths: []};
  const points: P[] = [], widths: number[] = [];
  for (const r of raw) {
    let z: number, width: number;
    if (r.l) {z = r.l.z; width = r.l.width;}
    else {
      const above = [...known].reverse().find(k => k.y > r.y), below = known.find(k => k.y < r.y);
      const a = above ?? below!, b = below ?? above!, f = a === b ? 0 : (r.y - a.y) / (b.y - a.y);
      z = a.l!.z + (b.l!.z - a.l!.z) * f; width = a.l!.width + (b.l!.width - a.l!.width) * f;
    }
    points.push([0, r.y, z]); widths.push(width);
  }
  return {points, widths};
}
