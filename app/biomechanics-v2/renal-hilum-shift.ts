// Renal hilum order (AB-01). In the source meshes each renal vein runs in front of the renal artery near the midline but turns backward about 20 mm from it and enters the hilum behind the
// artery, level with the renal pelvis; at the hilum the order from front to back is renal vein, renal artery, renal pelvis (Gray's Anatomy 1918; OpenStax Anatomy and Physiology: please verify).
// The meshes are single surfaces without rings, so the vessels are moved at load time, never in the source data: the vein system forward, the artery system backward, the top of the ureter
// (renal pelvis) a little backward. Every vertex follows a smooth field of its lateral distance from the midline u and its height y: zero near the midline (the vein joins the inferior vena cava,
// the artery leaves the aorta, both unchanged), a long ramp to the full value at the hilum, held across the hilum and faded to zero inside the renal sinus, so the intrarenal branches and the
// kidney stay where they are; the same field is faded out above and below the hilum, so tributaries and branches (suprarenal and gonadal veins, suprarenal and ureteric arteries) follow
// near their junction and keep their far ends. Every step is a smootherstep, so the field has no kink. Values come from scripts/measure-renal-hilum.mjs (docs/renal-hilum-shift.md).
// Pure functions without imports, so scripts/test-renal-hilum-shift.mjs runs the same code as the viewer. Units: millimetres in the field, metres in the position arrays.
export type Side = 'Left' | 'Right';
export type Role = 'vein' | 'artery' | 'pelvis';
export interface Field {
  /** lateral distance from the midline (mm): field 0 up to ramp[0], full from ramp[1] to fall[0], 0 from fall[1] */ ramp: [number, number]; fall: [number, number];
  /** forward (+z) shift at full value, mm (negative: backward) */ dz: number;
}
export interface HilumSpec {
  /** height of the hilum (mm) and the half heights: full within inner, none from outer */ y: number; inner: number; outer: number;
  /** field of each role */ role: Record<Role, Field>;
}
export const SPEC: Record<Side, HilumSpec> = {
  Left: {y: 1118, inner: 22, outer: 46, role: {
    vein: {ramp: [18, 30], fall: [38, 52], dz: 17},
    artery: {ramp: [16, 32], fall: [38, 50], dz: -11},
    pelvis: {ramp: [20, 32], fall: [44, 56], dz: -6},
  }},
  Right: {y: 1108, inner: 22, outer: 46, role: {
    vein: {ramp: [14, 28], fall: [40, 54], dz: 15},
    artery: {ramp: [18, 32], fall: [38, 50], dz: -4},
    pelvis: {ramp: [20, 32], fall: [44, 56], dz: -6},
  }},
};
/** Pelvis role: only the upper end of the ureter moves; full from PELVIS_Y[1] up, none below PELVIS_Y[0] (mm). */
export const PELVIS_Y: [number, number] = [1062, 1085];
/** Parts of each side by role (vessel-end pieces `<id>-END` follow their vessel). The female model has its own ureters (HRAF-…). */
export const PARTS: Record<Side, Record<Role, string[]>> = {
  Left: {
    // renal vein (extrarenal trunk, hilum and intrarenal part); tributaries: left suprarenal vein, inferior phrenic vein (the left testicular vein joins 13–18 mm from the midline, where the field is zero)
    vein: ['FJ3477', 'FJ3478', 'FJ3480', 'FJ3447'],
    // renal artery and its trunk, anterior and posterior divisions, segmental branches; branches near the hilum: inferior suprarenal artery, ureteric branch
    artery: ['FJ2046', 'FJ3476', 'FJ3458', 'FJ3459', 'FJ3460', 'FJ3461', 'FJ3462', 'FJ3463', 'FJ3473', 'FJ3474', 'FJ3475', 'FJ2049', 'FJ2052', 'FJ2053', 'FJ2054', 'FJ3467', 'FJ3481'],
    pelvis: ['FJ3144', 'HRAF-Left-ureter'],
  },
  Right: {
    vein: ['FJ3577', 'FJ3578'],
    artery: ['FJ2038', 'FJ3576', 'FJ3558', 'FJ3559', 'FJ3560', 'FJ3561', 'FJ3562', 'FJ3563', 'FJ3573', 'FJ3574', 'FJ3575', 'FJ2042', 'FJ2043', 'FJ2045', 'FJ3584', 'FJ3581', 'FJ3582'],
    pelvis: ['FJ3146', 'HRAF-Right-ureter'],
  },
};
/**
 * Branches that leave the hilum region: `up` [full, none] (mm): full field up to the junction height, none from the height where the branch reaches its organ (suprarenal vessels into the
 * adrenal gland); `blend` [lo, hi]: the ureteric arteries take the artery field at their origin (y >= hi) and the pelvis field along the ureter (y <= lo), so they stay on both.
 * Junction and contact heights from scripts/measure-renal-hilum.mjs --junctions.
 */
export const BRANCH: Record<string, {up?: [number, number]; blend?: [number, number]}> = {
  FJ3480: {up: [1121, 1138]}, // left suprarenal vein: joins the renal vein at y 1116–1121, enters the adrenal gland from 1140
  FJ3447: {up: [1113, 1126]}, // inferior phrenic vein: joins the left renal vein at y 1112–1113, 18–19 mm from the midline, then runs up to the diaphragm
  FJ3467: {up: [1122, 1139]}, // left inferior suprarenal artery: arises at 1118–1122, on the adrenal gland from 1141
  FJ3584: {up: [1110, 1124]}, // right inferior suprarenal artery: arises at 1108–1126, on the adrenal gland from 1124
  FJ3481: {blend: [1100, 1115]}, // ureteric branch (left): arises at 1115–1117, on the ureter up to 1103
  FJ3581: {blend: [1090, 1104]}, // ureteric branch (right): arises at 1102–1107, on the ureter up to 1099
  FJ3582: {blend: [1090, 1104]}, // second right ureteric branch, from FJ3581 and on the ureter (1061–1095)
};
export const smoother = (t: number) => { const x = Math.max(0, Math.min(1, t)); return x * x * x * (x * (x * 6 - 15) + 10); };
/** Weight (0–1) of a field at lateral distance u (mm). */
export const lateral = (s: Field, u: number) => u <= s.ramp[0] ? 0 : u < s.ramp[1] ? smoother((u - s.ramp[0]) / (s.ramp[1] - s.ramp[0])) : u <= s.fall[0] ? 1 : 1 - smoother((u - s.fall[0]) / (s.fall[1] - s.fall[0]));
/** Weight (0–1) of the field at height y (mm). */
export const vertical = (s: HilumSpec, y: number) => 1 - smoother((Math.abs(y - s.y) - s.inner) / (s.outer - s.inner));
/** Forward shift (mm) of the point (x, y in mm) for a part of the given side and role, without branch rules. x is the atlas x (left positive). */
export function fieldAt(side: Side, role: Role, x: number, y: number): number {
  const s = SPEC[side], u = side === 'Left' ? x : -x;
  const f = s.role[role]; let w = lateral(f, u) * vertical(s, y);
  if (role === 'pelvis') w *= smoother((y - PELVIS_Y[0]) / (PELVIS_Y[1] - PELVIS_Y[0]));
  return f.dz * w;
}
/** Forward shift (mm) of the point for the part `id` (branch rules applied). */
export function shiftAt(id: string, side: Side, role: Role, x: number, y: number): number {
  const b = BRANCH[id.endsWith('-END') ? id.slice(0, -4) : id];
  if (b?.blend) { const a = smoother((y - b.blend[0]) / (b.blend[1] - b.blend[0])); return a * fieldAt(side, 'artery', x, y) + (1 - a) * fieldAt(side, 'pelvis', x, y); }
  const v = fieldAt(side, role, x, y);
  return b?.up ? v * (1 - smoother((y - b.up[0]) / (b.up[1] - b.up[0]))) : v;
}
/** Side and role of a part, or null. */
export function roleOf(id: string): {side: Side; role: Role} | null {
  const base = id.endsWith('-END') ? id.slice(0, -4) : id;
  for (const side of ['Left', 'Right'] as Side[]) for (const role of ['vein', 'artery', 'pelvis'] as Role[]) if (PARTS[side][role].includes(base)) return {side, role};
  return null;
}
export const isHilumPart = (id: string) => roleOf(id) !== null;
/** Moves the vertices of a part in place (metres). Returns true when the part is one of the hilum parts. */
export function shiftHilumPart(id: string, positions: Float32Array): boolean {
  const r = roleOf(id); if (!r) return false;
  for (let i = 0; i < positions.length; i += 3) positions[i + 2] += shiftAt(id, r.side, r.role, positions[i] * 1e3, positions[i + 1] * 1e3) * 1e-3;
  return true;
}
