// Surface to surface distance between two meshes {positions, indices} (metres), as a second opinion beside the centreline gaps of centreline-continuity.mjs.
// On a coarse mesh (a hundred vertices for a whole vessel) the rings of a centreline are few and noisy, and a gap of a few mm between centrelines can be a measuring error;
// the distance between the surfaces themselves does not depend on rings. Pure geometry, measuring only.
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Distance from point p to triangle abc (closest point by Voronoi regions; a degenerate triangle falls back to its edges and corners). */
export function pointTriangle(p, a, b, c) {
  const ab = sub(b, a), ac = sub(c, a), ap = sub(p, a), d1 = dot(ab, ap), d2 = dot(ac, ap);
  const at = (v, w) => Math.hypot(p[0] - a[0] - ab[0] * v - ac[0] * w, p[1] - a[1] - ab[1] * v - ac[1] * w, p[2] - a[2] - ab[2] * v - ac[2] * w);
  if (d1 <= 0 && d2 <= 0) return at(0, 0);
  const bp = sub(p, b), d3 = dot(ab, bp), d4 = dot(ac, bp);
  if (d3 >= 0 && d4 <= d3) return at(1, 0);
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) return at(d1 / (d1 - d3), 0);
  const cp = sub(p, c), d5 = dot(ab, cp), d6 = dot(ac, cp);
  if (d6 >= 0 && d5 <= d6) return at(0, 1);
  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) return at(0, d2 / (d2 - d6));
  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) { const w = (d4 - d3) / (d4 - d3 + d5 - d6); return at(1 - w, w); }
  const sum = va + vb + vc;
  if (!sum) return Math.min(at(0, 0), at(1, 0), at(0, 1));
  return at(vb / sum, vc / sum);
}

// Smallest distance from a vertex of `from` to a triangle of `to`; triangles whose bounding box is already further than the best so far are skipped.
function vertexToSurface(from, to, best) {
  const P = to.positions, n = to.indices.length / 3, box = new Float64Array(n * 6);
  for (let t = 0; t < n; t++) for (let k = 0; k < 3; k++) {
    const v = [P[to.indices[t * 3] * 3 + k], P[to.indices[t * 3 + 1] * 3 + k], P[to.indices[t * 3 + 2] * 3 + k]];
    box[t * 6 + k] = Math.min(...v); box[t * 6 + 3 + k] = Math.max(...v);
  }
  const corner = (t, j) => { const i = to.indices[t * 3 + j] * 3; return [P[i], P[i + 1], P[i + 2]]; };
  for (let i = 0; i < from.positions.length; i += 3) {
    const p = [from.positions[i], from.positions[i + 1], from.positions[i + 2]];
    for (let t = 0; t < n; t++) {
      let far = 0;
      for (let k = 0; k < 3; k++) { const d = Math.max(box[t * 6 + k] - p[k], p[k] - box[t * 6 + 3 + k], 0); far += d * d; }
      if (far >= best * best) continue;
      best = Math.min(best, pointTriangle(p, corner(t, 0), corner(t, 1), corner(t, 2)));
    }
  }
  return best;
}

/**
 * Smallest distance between the surfaces of meshes a and b: every vertex of one against every triangle of the other, both ways. null when either has no triangle.
 * Limit: where the two surfaces cross each other without a vertex of either lying on the other, the result is the distance of the nearest vertex (a little above 0), not 0;
 * two edges that pass close to each other in mid-span are likewise measured from their nearest vertex.
 */
export function surfaceGap(a, b) {
  if (!a.indices.length || !b.indices.length) return null;
  return vertexToSurface(b, a, vertexToSurface(a, b, Infinity));
}
