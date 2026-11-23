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

/** The schematic soft palate: a curved band with thickness (not a cylinder), from the back edge of the hard palate (origin) running back and down at `angleDeg` below the horizontal,
 *  arched slightly upward like the real palate, tapering in width and thickness toward the uvula. Built in its own frame: +y up, +z front, so the band runs toward −z. Only x ≥ −width is
 *  kept visible by the section; the band is symmetric about x = 0. */
export function softPalateBand(len: number, angleDeg: number, o: {width0?: number; width1?: number; thick0?: number; thick1?: number; arch?: number; segs?: number; ring?: number} = {}) {
  const {width0 = .016, width1 = .004, thick0 = .0075, thick1 = .0045, arch = .0035, segs = 24, ring = 20} = o;
  const a = angleDeg * Math.PI / 180, end: [number, number] = [-Math.sin(a) * len, -Math.cos(a) * len]; // (y, z) of the tip
  // quadratic curve in the sagittal plane, its middle control point lifted by `arch` (the upper surface faces the nasopharynx)
  const ctrl: [number, number] = [end[0] / 2 + arch * Math.cos(a), end[1] / 2 - arch * Math.sin(a)];
  const at = (u: number): [number, number] => [2 * (1 - u) * u * ctrl[0] + u * u * end[0], 2 * (1 - u) * u * ctrl[1] + u * u * end[1]];
  const positions: number[] = [], index: number[] = [];
  for (let i = 0; i <= segs; i++) {
    const u = i / segs, [y, z] = at(u), [y2, z2] = at(Math.min(1, u + 1e-3)), [y1, z1] = at(Math.max(0, u - 1e-3));
    let ty = y2 - y1, tz = z2 - z1; const tl = Math.hypot(ty, tz) || 1; ty /= tl; tz /= tl;
    const ny = -tz, nz = ty; // normal in the sagittal plane (the thickness direction)
    const half = (width0 + (width1 - width0) * u) / 2, th = (thick0 + (thick1 - thick0) * u) / 2 * (u > .9 ? Math.sqrt(Math.max(.05, (1 - u) / .1)) : 1);
    for (let j = 0; j < ring; j++) {
      const t = j / ring * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
      // a flattened oval: wide across (x), thin through (normal); a squarer profile (|cos|^0.6) gives a band rather than a tube
      const sx = Math.sign(c) * Math.pow(Math.abs(c), .6), sn = Math.sign(s) * Math.pow(Math.abs(s), .9);
      positions.push(half * sx, y + ny * th * sn, z + nz * th * sn);
    }
  }
  for (let i = 0; i < segs; i++) for (let j = 0; j < ring; j++) {
    const a0 = i * ring + j, a1 = i * ring + (j + 1) % ring, b0 = a0 + ring, b1 = a1 + ring;
    index.push(a0, b0, a1, a1, b0, b1);
  }
  // close both ends
  const c0 = positions.length / 3; positions.push(0, 0, 0); for (let j = 0; j < ring; j++) index.push(c0, (j + 1) % ring, j);
  const [ey, ez] = at(1), c1 = positions.length / 3; positions.push(0, ey, ez); for (let j = 0; j < ring; j++) index.push(c1, segs * ring + j, segs * ring + (j + 1) % ring);
  return {positions: Float32Array.from(positions), index: Uint32Array.from(index), tip: [0, ey, ez] as P, curve: at};
}
