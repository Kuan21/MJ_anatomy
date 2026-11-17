// Smooth carotid bifurcation. The source meshes (three 12-vertex-ring tubes) meet in a flat cut: the common carotid ends in an open ring while the internal and external carotid start
// as two nearly concentric tubes (centres 1 to 3.5 mm apart for the first 3 cm although each is 5 to 7 mm wide), so they pass through each other. This module rebuilds only the
// vertices of the first rings of both branches (same vertex count, same triangles, same radii above the junction, same distal ends) so that
//   1. the first ring of each branch is half of the common carotid's end ring plus a straight septum (a D-shaped section): the two halves together fill the common ring exactly and share its
//      vertices, so the surface is closed and continuous, with no flat cut;
//   2. over the next rings the D-section grows into the branch's own round section (smoothstep weights, zero slope at the end, so the tube continues straight into the unchanged rings);
//   3. the two branches are pushed apart sideways (opposite, equal shares) just enough that their walls no longer cross; the internal carotid goes posterolateral, the external anteromedial,
//      the push fades to nothing where the source tubes diverge by themselves. Nothing is scaled: every ring keeps its own radius.
// Before the rebuild the whole bifurcation is raised by a fixed RAISE (raiseBifurcation): the source puts it at the level of C5 (about 11 mm below the upper edge of the thyroid cartilage), a textbook bifurcation lies at the upper
// edge of the thyroid cartilage (C4). The end of the common carotid is lengthened along its own direction, the first rings of both branches move with it (so the junction stays closed) and the shift fades out to nothing over
// BRANCH_BLEND (external and internal carotid start segments become shorter); distal ends and every radius stay as they are.
// Pure functions, no imports, so scripts/test-carotid-bifurcation.mjs runs the same code as the viewer.
export const RING = 12;
type V = {name: string; positions: number[]};
type P3 = [number, number, number];
const sub = (a: P3, b: P3): P3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: P3, b: P3): P3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: P3, s: number): P3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: P3, b: P3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: P3, b: P3): P3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a: P3) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: P3): P3 => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const smooth = (t: number) => { const x = Math.max(0, Math.min(1, t)); return x * x * (3 - 2 * x); };
const ringPoints = (pos: number[], r: number): P3[] => Array.from({length: RING}, (_, k) => [pos[(r * RING + k) * 3], pos[(r * RING + k) * 3 + 1], pos[(r * RING + k) * 3 + 2]] as P3);
const centre = (pts: P3[]): P3 => mul(pts.reduce((s, p) => add(s, p), [0, 0, 0] as P3), 1 / pts.length);
const radius = (pts: P3[]) => { const c = centre(pts); return pts.reduce((s, p) => s + len(sub(p, c)), 0) / pts.length; };
const put = (pos: number[], r: number, pts: P3[]) => pts.forEach((p, k) => { pos[(r * RING + k) * 3] = p[0]; pos[(r * RING + k) * 3 + 1] = p[1]; pos[(r * RING + k) * 3 + 2] = p[2]; });
/** Rotation sense of a ring about `axis` (+1 counter-clockwise seen from the tip of the axis). */
const sense = (pts: P3[], axis: P3) => { const c = centre(pts); let s = 0; for (let i = 0; i < pts.length; i++) s += dot(cross(sub(pts[i], c), sub(pts[(i + 1) % pts.length], c)), axis); return s >= 0 ? 1 : -1; };
const axisOf = (pos: number[], r: number, rings: number): P3 => unit(sub(centre(ringPoints(pos, Math.min(rings - 1, r + 1))), centre(ringPoints(pos, Math.max(0, r - 1)))));

/** Rings each side of the junction that are rebuilt, in metres of height above the end of the common carotid. */
export const BLEND_HEIGHT = 0.011;   // D-section to round section
export const PUSH_FROM = 0.0005, PUSH_FULL = 0.012, PUSH_FADE = 0.032;   // sideways separation: starts, complete, gone

/** Fixed upward shift of the bifurcation (m): from y 1487.7/1488.4 mm to about 1500.7/1501.4 mm, 2 mm above the upper edge of the thyroid cartilage (1498.8 mm) in the C4 body (docs/carotid-landmarks.md). */
export const RAISE = 0.013;
/** Arc length (m) over which the shift fades out: down the common carotid and up each branch. */
export const COMMON_BLEND = 0.05, BRANCH_BLEND = 0.045;
/** Wall-to-wall clearance (m) asked of the two branches in the first 1 to 2 cm above the bifurcation; it fades out between GAP_FADE_FROM and GAP_FADE_TO. */
export const GAP = 0.0025, GAP_FADE_FROM = 0.025, GAP_FADE_TO = 0.05;

export interface BifurcationReport {side: string; blendRings: [number, number]; pushMm: [number, number]; raisedMm?: number}

/** Raises the bifurcation of one side by `raise` metres (see RAISE): rigid per-ring translation along the end direction of the common carotid, weight 1 at the junction and smoothstep to 0 along the arc length of each tube. Ring shapes and radii do not change. */
export function raiseBifurcation(common: V, internal: V, external: V, raise = RAISE): number | null {
  const cn = common.positions.length / (RING * 3), nI = internal.positions.length / (RING * 3), nE = external.positions.length / (RING * 3);
  if (![cn, nI, nE].every(n => Number.isInteger(n) && n >= 8)) return null;
  const cs = Array.from({length: cn}, (_, r) => centre(ringPoints(common.positions, r)));
  // end direction: from the ring 2 cm below the end to the end (a long baseline, so ring noise does not tilt it)
  let k0 = cn - 1; while (k0 > 0 && len(sub(cs[cn - 1], cs[k0])) < 0.02) k0--;
  const dir = unit(sub(cs[cn - 1], cs[k0]));
  if (dir[1] < 0.5) return null;
  const v = mul(dir, raise / dir[1]);
  const apply = (t: V, n: number, weightOf: (r: number, arc: number[]) => number) => {
    const c = Array.from({length: n}, (_, r) => centre(ringPoints(t.positions, r)));
    const arc = [0]; for (let r = 1; r < n; r++) arc.push(arc[r - 1] + len(sub(c[r], c[r - 1])));
    for (let r = 0; r < n; r++) { const w = weightOf(r, arc); if (!w) continue; put(t.positions, r, ringPoints(t.positions, r).map(p => add(p, mul(v, w)))); }
  };
  apply(common, cn, (r, arc) => 1 - smooth((arc[cn - 1] - arc[r]) / COMMON_BLEND) );
  apply(internal, nI, (r, arc) => 1 - smooth(arc[r] / BRANCH_BLEND));
  apply(external, nE, (r, arc) => 1 - smooth(arc[r] / BRANCH_BLEND));
  return v[1] * 1000;
}

/** Rebuilds the first rings of both branches of one side. `common`, `internal`, `external` are tubes of 12-vertex rings; the branches are changed in place. Returns null when the shapes are not the expected ones. */
export function smoothBifurcation(common: V, internal: V, external: V): BifurcationReport | null {
  const cn = common.positions.length / (RING * 3), nI = internal.positions.length / (RING * 3), nE = external.positions.length / (RING * 3);
  if (![cn, nI, nE].every(n => Number.isInteger(n) && n >= 8)) return null;
  const endRing = ringPoints(common.positions, cn - 1), cEnd = centre(endRing), axisC = axisOf(common.positions, cn - 1, cn);
  const yEnd = cEnd[1];
  const rows = [internal, external];
  const counts = [nI, nE];
  // 1. sideways separation of the two source tubes (heights compared, each branch moved by half of the missing distance, opposite ways)
  const pathAt = (v: V, n: number, y: number): {c: P3; r: number} => { let j = 0; while (j < n - 2 && centre(ringPoints(v.positions, j + 1))[1] < y) j++; const a = ringPoints(v.positions, j), b = ringPoints(v.positions, j + 1), ca = centre(a), cb = centre(b); const t = cb[1] === ca[1] ? 0 : Math.max(0, Math.min(1, (y - ca[1]) / (cb[1] - ca[1]))); return {c: add(mul(ca, 1 - t), mul(cb, t)), r: radius(a) * (1 - t) + radius(b) * t}; };
  const c0 = [0, 1].map(i => centre(ringPoints(rows[i].positions, Math.min(counts[i] - 1, 14))));
  const nVec = (() => { const v = sub(c0[0], c0[1]); const up = axisC; const h = sub(v, mul(up, dot(v, up))); return len(h) > 1e-4 ? unit(h) : unit(cross(up, [0, 0, 1])); })();   // from the external towards the internal carotid
  const shifts = [new Float64Array(counts[0] * 3), new Float64Array(counts[1] * 3)];
  const maxPush = [0, 0];
  for (let i = 0; i < 2; i++) {
    const other = 1 - i;
    for (let j = 0; j < counts[i]; j++) {
      const pts = ringPoints(rows[i].positions, j), c = centre(pts), rI = radius(pts), h = c[1] - yEnd;
      if (h <= PUSH_FROM || h > PUSH_FADE + 0.02) continue;
      const o = pathAt(rows[other], counts[other], c[1]);
      const ax = axisOf(rows[i].positions, j, counts[i]);
      let d = sub(c, o.c); d = sub(d, mul(ax, dot(d, ax)));
      const dist = len(d);
      const ramp = smooth((h - PUSH_FROM) / (PUSH_FULL - PUSH_FROM));   // asked-for separation share; it fades by itself where the source tubes are far apart (the deficit becomes zero)
      const gap = GAP * (1 - smooth((h - GAP_FADE_FROM) / (GAP_FADE_TO - GAP_FADE_FROM)));
      const wanted = (rI + o.r + gap) * ramp, deficit = Math.max(0, wanted - dist);
      if (!deficit) continue;
      const dir = unit(add(mul(d, 1), mul(i === 0 ? nVec : mul(nVec, -1), 0.0015)));
      const s = mul(dir, deficit / 2);
      shifts[i][j * 3] = s[0]; shifts[i][j * 3 + 1] = s[1]; shifts[i][j * 3 + 2] = s[2];
      maxPush[i] = Math.max(maxPush[i], len(s));
    }
  }
  for (let i = 0; i < 2; i++) for (let j = 0; j < counts[i]; j++) { const pts = ringPoints(rows[i].positions, j).map(p => add(p, [shifts[i][j * 3], shifts[i][j * 3 + 1], shifts[i][j * 3 + 2]] as P3)); put(rows[i].positions, j, pts); }
  // 2. D-shaped first rings: the split diameter of the common end ring follows the direction between the two branches
  const kIdx = rows.map((v, i) => { let k = 1; while (k < counts[i] - 2 && centre(ringPoints(v.positions, k))[1] - yEnd < BLEND_HEIGHT) k++; return k; });
  const kc = rows.map((v, i) => centre(ringPoints(v.positions, kIdx[i])));
  const rel = endRing.map(p => sub(p, cEnd));
  const split = sub(kc[0], kc[1]), splitH = sub(split, mul(axisC, dot(split, axisC)));
  const dirI = unit(splitH);
  // parent vertex nearest to the direction of the internal carotid
  let iI = 0, best = -Infinity; rel.forEach((r, i) => { const d = dot(unit(r), dirI); if (d > best) { best = d; iI = i; } });
  const senseC = sense(endRing, axisC);
  for (let b = 0; b < 2; b++) {
    const first = (iI + (b === 0 ? 0 : RING / 2)) % RING;
    // seven consecutive parent vertices centred on `first` (a half ring), then the straight septum back to the first of them
    const arcIdx = Array.from({length: RING / 2 + 1}, (_, q) => (first - RING / 4 + q + RING * 2) % RING);
    const arc = arcIdx.map(i => endRing[i]);   // runs in the order of increasing index
    const septum = Array.from({length: RING / 2 - 1}, (_, q) => add(mul(arc[arc.length - 1], 1 - (q + 1) / (RING / 2)), mul(arc[0], (q + 1) / (RING / 2))));
    let D = [...arc, ...septum];
    const axB = axisOf(rows[b].positions, kIdx[b], counts[b]);
    // order D in the same sense as the branch's rings (a wrong sense would make the section twist through itself)
    if (sense(D, axB) !== sense(ringPoints(rows[b].positions, kIdx[b]), axB)) D = [D[0], ...D.slice(1).reverse()];
    const cd = centre(D);
    // The source rings turn by one vertex per ring (their first vertex spirals around the tube), so every ring is matched to D by its own cyclic shift: vertices go to the nearest angle, never across the section.
    const shiftFor = (pts: P3[]) => { const ck = centre(pts); let bestOff = 0, bestCost = Infinity; for (let off = 0; off < RING; off++) { let cost = 0; for (let m = 0; m < RING; m++) cost += len(sub(sub(D[(m + off) % RING], cd), sub(pts[m], ck))) ** 2; if (cost < bestCost) { bestCost = cost; bestOff = off; } } return Array.from({length: RING}, (_, m) => D[(m + bestOff) % RING]); };
    // ring 0 is exactly D; ring k is untouched; between them each ring is its own (pushed) shape pulled towards D (carried along the tube) by a smoothstep weight
    for (let j = 0; j < kIdx[b]; j++) {
      const w = 1 - smooth(j / kIdx[b]);
      const pts = ringPoints(rows[b].positions, j), Dm = shiftFor(pts);
      const cj = centre(pts);
      const dj = j === 0 ? Dm : Dm.map(p => add(sub(p, cd), add(mul(cd, w), mul(cj, 1 - w))));
      put(rows[b].positions, j, pts.map((p, m) => add(mul(p, 1 - w), mul(dj[m], w))));
    }
  }
  return {side: '', blendRings: [kIdx[0], kIdx[1]], pushMm: [maxPush[0] * 1000, maxPush[1] * 1000]};
}

/** Extra separation of the external carotid (HN-21b). Right after the bifurcation the two branches are D-shaped halves of the common section and their centres are only 2.7 to 4.7 mm apart 2 to 5 mm above it (walls crossing, 8.5 mm apart at 1 cm) and
 * almost exactly one behind the other; in an adult the external carotid lies in front of and medial to the internal carotid, which goes up behind and lateral to it (Gray's Anatomy 1918, OpenStax Anatomy and Physiology: please verify). The external carotid is therefore
 * moved forward and towards the midline by SEP_MM at full value, never the internal carotid (the vagus nerve and the internal jugular vein lie behind and lateral to it, so nothing there gets closer to them). The shift is a smootherstep of the arc length
 * from the junction (zero value and slope at the first ring, which stays on the common carotid's end ring, so the seam is untouched), full between SEP_FULL and SEP_HOLD, and fades to zero at SEP_END so the tube joins its source path again; the source
 * mesh is not changed, only the loaded positions. Direction: SEP_MEDIAL of the unit step towards the midline, SEP_FRONT forward (their squares add up to 1). Units: metres. */
export const SEP_MM = 0.003, SEP_FULL = 0.009, SEP_HOLD = 0.013, SEP_END = 0.036, SEP_MEDIAL = 0.8, SEP_FRONT = 0.6;
const smoother = (t: number) => { const x = Math.max(0, Math.min(1, t)); return x * x * x * (x * (x * 6 - 15) + 10); };
export const separationAt = (arc: number) => SEP_MM * smoother(arc / SEP_FULL) * (1 - smoother((arc - SEP_HOLD) / (SEP_END - SEP_HOLD)));
/** Moves the rings of the external carotid forward and medially (see SEP_MM). Returns the largest step in metres, or null when the tube has the wrong shape. */
export function separateExternal(external: V, medialSign: number): number | null {
  const n = external.positions.length / (RING * 3);
  if (!Number.isInteger(n) || n < 8) return null;
  const cs = Array.from({length: n}, (_, r) => centre(ringPoints(external.positions, r)));
  let arc = 0, max = 0;
  for (let r = 0; r < n; r++) {
    if (r) arc += len(sub(cs[r], cs[r - 1]));
    const s = separationAt(arc); if (!s) continue;
    max = Math.max(max, s);
    put(external.positions, r, ringPoints(external.positions, r).map(p => add(p, [medialSign * SEP_MEDIAL * s, 0, SEP_FRONT * s] as P3)));
  }
  return max;
}

/** Both sides, by vessel name. */
export function smoothCarotids(vessels: V[]) {
  const by = new Map(vessels.map(v => [v.name, v]));
  const out: BifurcationReport[] = [];
  for (const [side, common, internal, external] of [['left', 'Left common carotid artery', 'Internal carotid artery.l', 'External carotid artery.l'], ['right', 'Right common carotid artery', 'Internal carotid artery.r', 'External carotid artery.r']]) {
    const c = by.get(common), i = by.get(internal), e = by.get(external);
    if (!c || !i || !e) continue;
    const up = raiseBifurcation(c, i, e);
    const r = smoothBifurcation(c, i, e); if (r) { separateExternal(e, side === 'left' ? -1 : 1); out.push({...r, side, raisedMm: up ?? 0}); }
  }
  return out;
}

/** Vertex pairs where the first ring of a branch lies on the end ring of the common carotid (same position): [index in common, index in branch]. */
export function junctionPairs(common: number[] | Float32Array, branch: number[] | Float32Array): [number, number][] {
  const out: [number, number][] = [], last = common.length / 3 - RING;
  for (let i = 0; i < RING; i++) for (let k = 0; k < RING; k++) {
    const a = (last + i) * 3, b = k * 3;
    if (Math.abs(common[a] - branch[b]) + Math.abs(common[a + 1] - branch[b + 1]) + Math.abs(common[a + 2] - branch[b + 2]) < 1e-6) out.push([last + i, k]);
  }
  return out;
}
/** Gives both sides of the junction the same (averaged) normal, so the seam between the two meshes is not drawn as a crease. */
export function stitchNormals(a: {array: ArrayLike<number> & {[i: number]: number}}, b: {array: ArrayLike<number> & {[i: number]: number}}, pairs: [number, number][]) {
  for (const [i, j] of pairs) {
    let x = a.array[i * 3] + b.array[j * 3], y = a.array[i * 3 + 1] + b.array[j * 3 + 1], z = a.array[i * 3 + 2] + b.array[j * 3 + 2];
    const l = Math.hypot(x, y, z) || 1; x /= l; y /= l; z /= l;
    a.array[i * 3] = b.array[j * 3] = x; a.array[i * 3 + 1] = b.array[j * 3 + 1] = y; a.array[i * 3 + 2] = b.array[j * 3 + 2] = z;
  }
}
