// Subclavian artery behind the anterior scalene (HN-23). In the source meshes both subclavian arteries run in front of, or inside, the scalenus anterior; in an adult the artery passes through the
// interscalene gap, between scalenus anterior (in front) and scalenus medius (behind), on the first rib, behind the subclavian vein which stays in front of the anterior scalene
// (Gray's Anatomy 1918; OpenStax Anatomy and Physiology: please verify the position). The artery meshes are single surfaces without rings (313 and 219 vertices), so the artery is moved as a whole at load time, never
// in the source data: every vertex follows a smooth field that is zero at the medial end (aortic arch / brachiocephalic trunk), grows over a long ramp to its full value in the interscalene
// region and fades back to zero before the axillary artery, so no step is created where the artery meets its neighbours. The field depends on the arc length u along the artery's centre line (averaged over the nearby points of the line)
// (derived from the mesh by scripts/derive-subclavian-shift.mjs, app/biomechanics-v2/subclavian-centreline.json) and, for branches, on the distance from that line (full value within INNER, none from OUTER on), so a branch
// arising from the artery follows its origin and fades out along its own length; its far end and everything beyond stay where they are. Every shift is a smootherstep, so the field has no kink.
// Values were chosen from wall-to-wall clearance measurements against the scalene muscles, first rib and brachial plexus (docs/subclavian-shift.md, scripts/measure-subclavian-shift.mjs).
// Pure functions, no imports other than the centre-line data, so scripts/test-subclavian-shift.mjs runs the same code as the viewer. Units: millimetres in the field, metres in the position arrays.
import CENTRE from './subclavian-centreline.json';
export type Side = 'Left' | 'Right';
type P3 = [number, number, number];
export interface ShiftSpec {
  /** backward (posterior) and upward shift at full value, mm */ dz: number; dy: number;
  /** arc length (mm) along the artery from the medial end: field 0 at ramp[0], full at ramp[1] (long ramp), full until fall[0], 0 from fall[1] */ ramp: [number, number]; fall: [number, number];
}
export const SHIFT: Record<Side, ShiftSpec> = {
  Left: {dz: 12, dy: 2, ramp: [16, 48], fall: [60, 96]},
  Right: {dz: 11, dy: 4, ramp: [8, 34], fall: [48, 72]},
};
/** Branch falloff: full value within INNER mm of the centre line, none from OUTER mm on (the artery's own vertices are always within INNER). */
export const INNER = 9, OUTER = 36;
/** The artery of each side and the parts that follow it (arteries arising from it; closure checked by scripts/test-subclavian-shift.mjs). `own`: the artery and its end pieces (full field, no distance falloff). */
export const PARTS: Record<Side, {own: string[]; branches: string[]}> = {
  Left: {own: ['FJ3479', 'FJ3479-END'], branches: ['FJ1972', 'FJ1972-END', 'FJ2224', 'FJ2226', 'FJ2251', 'FJ2255', 'FJ2257', 'PK-125', 'PKC-308', 'FJ1970', 'FJ2210', 'FJ2232', 'FJ2256', 'FJ1973', 'FJ1974', 'FJ1973-END', 'FJ2251-END']},
  Right: {own: ['FJ3579'], branches: ['FJ1935', 'FJ1937', 'FJ1939', 'FJ2276', 'FJ2278', 'FJ2303', 'FJ2307', 'FJ2309', 'PKC-307', 'FJ2209', 'FJ2284', 'FJ2308', 'FJ1950', 'FJ1937-END', 'FJ1939-END', 'FJ2278-END', 'PK-122']},
};
export const smoother = (t: number) => { const x = Math.max(0, Math.min(1, t)); return x * x * x * (x * (x * 6 - 15) + 10); };
export const weightAt = (s: ShiftSpec, u: number) => u <= s.ramp[0] ? 0 : u < s.ramp[1] ? smoother((u - s.ramp[0]) / (s.ramp[1] - s.ramp[0])) : u <= s.fall[0] ? 1 : 1 - smoother((u - s.fall[0]) / (s.fall[1] - s.fall[0]));
/** Centre line resampled every STEP mm: points, arc length. */
const STEP = 2;
interface Line {pts: P3[]; arc: number[]}
const LINES = {} as Record<Side, Line>;
for (const side of ['Left', 'Right'] as Side[]) {
  const src = (CENTRE as Record<string, number[][]>)[side] as P3[], pts: P3[] = [src[0]], arc = [0]; let u = 0, next = STEP;
  for (let i = 1; i < src.length; i++) {
    const a = src[i - 1], b = src[i], l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    while (next <= u + l + 1e-9) { const t = (next - u) / l; pts.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]), a[2] + t * (b[2] - a[2])]); arc.push(next); next += STEP; }
    u += l;
  }
  pts.push(src[src.length - 1]); arc.push(u); LINES[side] = {pts, arc};
}
/** Width (mm) over which the weight is averaged along the centre line: a vertex far from the line, or between two parts of it, must not jump when its nearest point changes. */
export const SIGMA = 6;
/** Distance (mm) from the centre line and the weight of the shift at p: the weights of the centre-line points are averaged with Gaussian weights of their distance (smooth everywhere, unlike the nearest point). */
export function onLine(side: Side, p: P3): {w: number; d: number} {
  const {pts, arc} = LINES[side], s = SHIFT[side], dist = new Float64Array(pts.length); let dmin = Infinity;
  for (let i = 0; i < pts.length; i++) { const q = pts[i]; dist[i] = Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); if (dist[i] < dmin) dmin = dist[i]; }
  let sw = 0, sv = 0; for (let i = 0; i < pts.length; i++) { const om = Math.exp(-(dist[i] * dist[i] - dmin * dmin) / (2 * SIGMA * SIGMA)); sw += om; sv += om * weightAt(s, arc[i]); }
  return {w: sv / sw, d: dmin};
}
/** Shift (mm) of the point p (mm) of the given side: [dx, dy, dz]. `own` parts take the full field, branches fade out with the distance from the artery's centre line. */
export function fieldAt(side: Side, p: P3, own: boolean): P3 {
  const s = SHIFT[side], {w: a, d} = onLine(side, p), w = a * (own ? 1 : 1 - smoother((d - INNER) / (OUTER - INNER)));
  return [0, s.dy * w, -s.dz * w];
}
/** Which side and role a part has, or null. */
export function roleOf(id: string): {side: Side; own: boolean} | null {
  for (const side of ['Left', 'Right'] as Side[]) { if (PARTS[side].own.includes(id)) return {side, own: true}; if (PARTS[side].branches.includes(id)) return {side, own: false}; }
  return null;
}
/** Moves the vertices of a part in place (metres). Returns true when the part is one of the subclavian parts. */
export function shiftSubclavianPart(id: string, positions: Float32Array): boolean {
  const role = roleOf(id); if (!role) return false;
  for (let i = 0; i < positions.length; i += 3) {
    const f = fieldAt(role.side, [positions[i] * 1e3, positions[i + 1] * 1e3, positions[i + 2] * 1e3], role.own);
    positions[i] += f[0] * 1e-3; positions[i + 1] += f[1] * 1e-3; positions[i + 2] += f[2] * 1e-3;
  }
  return true;
}
