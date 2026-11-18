// Left recurrent laryngeal nerve (RLN) in the neck: the generated course (scripts/paokao-structures/thorax-nerves.mjs) is moved into the tracheo-oesophageal groove by a displacement
// that grows and fades along the arc length of its own centre line. Nothing outside the nerve tube is touched, and the source meshes (trachea, oesophagus, vagus) are not changed.
//   stations: [{i, dx, dz}] at samples of the dense centre line (metres, in the horizontal plane; the height of a point never changes), sorted along the path. Before the first station and
//   after the last one the offset is 0; between two stations it is blended with smootherstep over the arc length, so the offset and its first two derivatives are continuous, with no step.
export const smootherstep = t => { const x = Math.max(0, Math.min(1, t)); return x * x * x * (x * (x * 6 - 15) + 10); };

export function arcLengths(path) { const s = [0]; for (let i = 1; i < path.length; i++) s.push(s[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1], path[i][2] - path[i - 1][2])); return s; }

/** The offset {dx, dz} at every sample of `path` (same length as `path`). */
export function offsetsAlong(path, stations) {
  const s = arcLengths(path), out = path.map(() => ({dx: 0, dz: 0}));
  for (let k = 0; k < stations.length - 1; k++) {
    const a = stations[k], b = stations[k + 1], sa = s[a.i], sb = s[b.i];
    for (let i = a.i; i <= b.i; i++) { const t = smootherstep((s[i] - sa) / (sb - sa)); out[i] = {dx: a.dx + (b.dx - a.dx) * t, dz: a.dz + (b.dz - a.dz) * t}; }
  }
  return out;
}

/** `path` moved by the offsets of `stations` (a new array; the input is not changed). */
export function displaceAlong(path, stations) { const o = offsetsAlong(path, stations); return path.map((p, i) => [p[0] + o[i].dx, p[1], p[2] + o[i].dz]); }

/**
 * The line of the tracheo-oesophageal groove on one side, from the tracheal mesh: where the recurrent laryngeal nerve lies is at the lateral extreme of the trachea, a millimetre in front of its posterior extreme: the point that touches the wall of the trachea and of the oesophagus beside it, with about a millimetre between the walls (scanned over the tracheal slab, docs/rln-groove.md), the postero-lateral corner of the
 * trachea. `verts` are the vertices of the tracheal mesh ([x, y, z] metres, x to the left), `sx` is +1 for the left side, -1 for the right. The lateral extreme and the posterior extreme of
 * the tracheal slab are fitted by a straight line over the height (the slab outline of the coarse mesh jumps by a millimetre or two from one height to the next), then the nerve is put
 * `inward` metres medial to the lateral extreme and `behind` metres behind the posterior extreme (negative: in front of it). Returns y => [x, z].
 */
export function grooveLine(verts, sx, {inward = -.0015, behind = -.001, from = 1.375, to = 1.465} = {}) {
  const rows = [];
  for (let y = from; y <= to + 1e-9; y += .005) {
    const sl = verts.filter(v => Math.abs(v[1] - y) < .004); if (sl.length < 10) continue;
    rows.push({y, lat: sx > 0 ? Math.max(...sl.map(v => v[0])) : Math.min(...sl.map(v => v[0])), post: Math.min(...sl.map(v => v[2]))});
  }
  const fit = key => { const n = rows.length, my = rows.reduce((a, r) => a + r.y, 0) / n, mf = rows.reduce((a, r) => a + r[key], 0) / n; let sxy = 0, sxx = 0; for (const r of rows) { sxy += (r.y - my) * (r[key] - mf); sxx += (r.y - my) ** 2; } const b = sxy / sxx; return y => mf + b * (y - my); };
  const lat = fit('lat'), post = fit('post');
  return y => [lat(y) - sx * inward, post(y) - behind];
}

/** Index of the first sample of `path` at or after `from` whose height reaches y. */
export function sampleAtHeight(path, y, from = 0) { let i = from; while (i < path.length - 1 && path[i][1] < y) i++; return i; }

/** `path` resampled to `n` points evenly spaced along its arc length (linear between the samples of `path`, which should be dense). */
export function resampleByArc(path, n) {
  const s = arcLengths(path), out = [path[0]]; let k = 0;
  for (let i = 1; i < n - 1; i++) { const target = s[s.length - 1] * i / (n - 1); while (s[k + 1] < target) k++; const t = (target - s[k]) / (s[k + 1] - s[k]); out.push(path[k].map((v, a) => v + (path[k + 1][a] - v) * t)); }
  out.push(path[path.length - 1]); return out;
}
