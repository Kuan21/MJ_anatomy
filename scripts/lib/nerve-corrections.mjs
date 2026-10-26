// Nerves whose Z-Anatomy course sits in the wrong place relative to the BodyParts3D bones and muscles are re-routed here: each vertex keeps its offset from the old
// centre line, and the centre line itself is replaced by a path through landmarks measured on the atlas meshes (millimetres, model frame, left side; the right side is mirrored).
// The waypoints for the superior gluteal nerve follow Gray's course: it leaves the pelvis through the greater sciatic foramen above piriformis, runs between gluteus medius
// and gluteus minimus (the points from the exit onward are the mid-points between the two muscle surfaces) and ends in tensor fasciae latae.
export const CORRECTIONS = {
  'Superior gluteal nerve.l.001': [[34, 946, -64], [58, 944, -58], [72, 946, -56], [85, 960, -53], [100, 976, -49], [119, 989, -33], [126, 989, -14], [134, 987, -3]],
};

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
function polyline(points) { const acc = [0]; for (let i = 1; i < points.length; i++) acc.push(acc[i - 1] + dist(points[i], points[i - 1])); return {points, acc, total: acc[acc.length - 1]}; }
function pointAt(pl, u) {
  const s = u * pl.total; let i = 1; while (i < pl.acc.length - 1 && pl.acc[i] < s) i++;
  const k = (s - pl.acc[i - 1]) / ((pl.acc[i] - pl.acc[i - 1]) || 1), a = pl.points[i - 1], b = pl.points[i];
  return [0, 1, 2].map(j => a[j] + (b[j] - a[j]) * k);
}
function nearestU(pl, p) {
  let best = 1e9, bu = 0;
  for (let i = 1; i < pl.points.length; i++) {
    const a = pl.points[i - 1], b = pl.points[i], ab = [0, 1, 2].map(j => b[j] - a[j]), l2 = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2 || 1;
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1] + (p[2] - a[2]) * ab[2]) / l2)), q = [0, 1, 2].map(j => a[j] + ab[j] * t), d = dist(p, q);
    if (d < best) { best = d; bu = (pl.acc[i - 1] + (pl.acc[i] - pl.acc[i - 1]) * t) / pl.total; }
  }
  return bu;
}
/** Smooth path through the waypoints (Catmull-Rom, resampled to a polyline). */
function smooth(wp, n = 60) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const f = i / (n - 1) * (wp.length - 1), s = Math.min(wp.length - 2, Math.floor(f)), t = f - s, at = k => wp[Math.max(0, Math.min(wp.length - 1, k))];
    const p0 = at(s - 1), p1 = at(s), p2 = at(s + 1), p3 = at(s + 2);
    out.push([0, 1, 2].map(a => .5 * ((2 * p1[a]) + (-p0[a] + p2[a]) * t + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t * t + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t ** 3)));
  }
  return out;
}

/** Re-routes `positions` (metres, in place) when the nerve has a correction; returns whether it did. */
export function correctNerve(name, positions) {
  const wp = CORRECTIONS[name] ?? CORRECTIONS[name.replace(/\.r\.001$/, '.l.001')];
  if (!wp) return false;
  reroute(positions, wp, /\.r\.001$/.test(name));
  return true;
}

/** Moves a tube-like mesh onto a new centre line: every vertex keeps its offset from the old centre line (mean of slices along the longest axis) at the same relative position along the path. */
export function reroute(positions, waypoints, mirror = false) {
  const target = smooth(waypoints.map(p => [mirror ? -p[0] : p[0], p[1], p[2]]));
  // old centre line: means of the vertices in slices along the nerve's longest axis
  const n = positions.length / 3, pts = Array.from({length: n}, (_, i) => [positions[i * 3] * 1000, positions[i * 3 + 1] * 1000, positions[i * 3 + 2] * 1000]);
  const ext = [0, 1, 2].map(a => Math.max(...pts.map(p => p[a])) - Math.min(...pts.map(p => p[a]))), axis = ext.indexOf(Math.max(...ext));
  const sorted = pts.slice().sort((a, b) => a[axis] - b[axis]), bins = 14, old = [];
  for (let k = 0; k < bins; k++) { const s = sorted.slice(Math.floor(k * n / bins), Math.floor((k + 1) * n / bins)); if (s.length) old.push([0, 1, 2].map(a => s.reduce((t, p) => t + p[a], 0) / s.length)); }
  if (target[0][axis] > target[target.length - 1][axis] !== old[0][axis] > old[old.length - 1][axis]) target.reverse();
  const oldPl = polyline(old), newPl = polyline(target);
  for (let i = 0; i < n; i++) {
    const u = nearestU(oldPl, pts[i]), c = pointAt(oldPl, u), t = pointAt(newPl, u);
    for (let a = 0; a < 3; a++) positions[i * 3 + a] = (t[a] + pts[i][a] - c[a]) / 1000;
  }
}
