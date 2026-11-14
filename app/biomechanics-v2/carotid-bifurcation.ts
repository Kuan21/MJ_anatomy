// Smooth carotid bifurcation. The source meshes (three 12-vertex-ring tubes) meet in a flat cut: the common carotid ends in an open ring while the internal and external carotid start
// as two nearly concentric tubes (centres 1 to 3.5 mm apart for the first 3 cm although each is 5 to 7 mm wide), so they pass through each other. This module rebuilds only the
// vertices of the first rings of both branches (same vertex count, same triangles, same radii above the junction, same distal ends) so that
//   1. the first ring of each branch is half of the common carotid's end ring plus a straight septum (a D-shaped section): the two halves together fill the common ring exactly and share its
//      vertices, so the surface is closed and continuous, with no flat cut;
//   2. over the next rings the D-section grows into the branch's own round section (smoothstep weights, zero slope at the end, so the tube continues straight into the unchanged rings);
//   3. the two branches are pushed apart sideways (opposite, equal shares) just enough that their walls no longer cross; the internal carotid goes posterolateral, the external anteromedial,
//      the push fades to nothing where the source tubes diverge by themselves. Nothing is scaled: every ring keeps its own radius.
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

export interface BifurcationReport {side: string; blendRings: [number, number]; pushMm: [number, number]}

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
      const wanted = (rI + o.r) * ramp, deficit = Math.max(0, wanted - dist);
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

/** Both sides, by vessel name. */
export function smoothCarotids(vessels: V[]) {
  const by = new Map(vessels.map(v => [v.name, v]));
  const out: BifurcationReport[] = [];
  for (const [side, common, internal, external] of [['left', 'Left common carotid artery', 'Internal carotid artery.l', 'External carotid artery.l'], ['right', 'Right common carotid artery', 'Internal carotid artery.r', 'External carotid artery.r']]) {
    const c = by.get(common), i = by.get(internal), e = by.get(external);
    if (!c || !i || !e) continue;
    const r = smoothBifurcation(c, i, e); if (r) out.push({...r, side});
  }
  return out;
}
