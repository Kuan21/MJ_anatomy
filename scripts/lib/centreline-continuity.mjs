// Continuity measures between centrelines (arrays of {c:[x,y,z], r}, metres) for the centreline continuity check of docs/centerline-plan.md.
// Pure geometry, no model data: a branch grows out of the wall of its parent, so gaps are measured to the parent's axis minus the parent's radius there.
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
// Distance from point p to the polyline of rings, with the ring radius interpolated at the nearest spot. A single ring counts as a point.
export function toAxis(p, rings) {
  let best = {dist: Infinity, r: 0, at: -1};
  for (let i = 0; i < rings.length; i++) {
    const a = rings[i], b = rings[Math.min(i + 1, rings.length - 1)], ab = sub(b.c, a.c), l2 = dot(ab, ab);
    const t = l2 ? Math.min(1, Math.max(0, dot(sub(p, a.c), ab) / l2)) : 0;
    const dist = Math.hypot(...sub(p, a.c.map((v, k) => v + ab[k] * t)));
    if (dist < best.dist) best = {dist, r: a.r + (b.r - a.r) * t, at: i + t};
  }
  return best;
}
// How far the nearer end of the child is from the wall of the parent (0 when the end lies inside the parent). null when either line is empty.
export function attachGap(child, parent) {
  if (!child.length || !parent.length) return null;
  const ends = [['start', child[0]], ['end', child[child.length - 1]]].map(([end, ring]) => {
    const m = toAxis(ring.c, parent);
    return {end, gap: Math.max(0, m.dist - m.r), at: m.at};
  });
  return ends[0].gap <= ends[1].gap ? ends[0] : ends[1];
}
// Two parts of one structure must meet end to end: the smallest distance between an end of a and an end of b, less the larger of the two radii (never below 0).
export function joinGap(a, b) {
  if (!a.length || !b.length) return null;
  let best = Infinity;
  for (const p of [a[0], a[a.length - 1]]) for (const q of [b[0], b[b.length - 1]]) best = Math.min(best, Math.max(0, Math.hypot(...sub(p.c, q.c)) - Math.max(p.r, q.r)));
  return best;
}
