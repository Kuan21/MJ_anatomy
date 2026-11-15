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

// Box tree over the triangles of a mesh (split at the median of the longest axis, up to 8 triangles in a leaf), built once per mesh object and kept while it lives.
// Without it every vertex was tried against every triangle, which took minutes on structures made of many large pieces.
const trees = new WeakMap();
function treeOf(g) {
  let tree = trees.get(g); if (tree) return tree;
  const P = g.positions, I = g.indices, n = I.length / 3, tb = new Float64Array(n * 6), mid = new Float64Array(n * 3), order = new Uint32Array(n);
  for (let t = 0; t < n; t++) {
    order[t] = t;
    for (let k = 0; k < 3; k++) {
      const x = P[I[t * 3] * 3 + k], y = P[I[t * 3 + 1] * 3 + k], z = P[I[t * 3 + 2] * 3 + k];
      tb[t * 6 + k] = Math.min(x, y, z); tb[t * 6 + 3 + k] = Math.max(x, y, z); mid[t * 3 + k] = (tb[t * 6 + k] + tb[t * 6 + 3 + k]) / 2;
    }
  }
  // Node i: box[i * 6 ..], then either a leaf (triangles order[start[i]] onwards, count[i] of them) or two children kid[i * 2] and kid[i * 2 + 1] (count 0).
  const box = [], start = [], count = [], kid = [];
  const build = (from, to) => {
    const i = start.length; start.push(from); count.push(0); kid.push(0, 0);
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity], cl = [Infinity, Infinity, Infinity], ch = [-Infinity, -Infinity, -Infinity];
    for (let j = from; j < to; j++) for (let k = 0; k < 3; k++) {
      const t = order[j]; lo[k] = Math.min(lo[k], tb[t * 6 + k]); hi[k] = Math.max(hi[k], tb[t * 6 + 3 + k]); cl[k] = Math.min(cl[k], mid[t * 3 + k]); ch[k] = Math.max(ch[k], mid[t * 3 + k]);
    }
    for (let k = 0; k < 3; k++) { box[i * 6 + k] = lo[k]; box[i * 6 + 3 + k] = hi[k]; }
    const axis = [0, 1, 2].reduce((m, k) => ch[k] - cl[k] > ch[m] - cl[m] ? k : m, 0);
    if (to - from <= 8 || ch[axis] === cl[axis]) { count[i] = to - from; return i; }
    order.subarray(from, to).sort((x, y) => mid[x * 3 + axis] - mid[y * 3 + axis]);
    const half = (from + to) >> 1, l = build(from, half), r = build(half, to); kid[i * 2] = l; kid[i * 2 + 1] = r;
    return i;
  };
  if (n) build(0, n);
  tree = {box: Float64Array.from(box), start, count, kid, order}; trees.set(g, tree); return tree;
}

// Smallest distance from a vertex of `from` to a triangle of `to`, never above `best`; boxes of the tree that are already further than the best so far are skipped.
function vertexToSurface(from, to, best) {
  const P = to.positions, I = to.indices, {box, start, count, kid, order} = treeOf(to), stack = [];
  const corner = (t, j) => { const i = I[t * 3 + j] * 3; return [P[i], P[i + 1], P[i + 2]]; };
  const far = (i, p) => { let s = 0; for (let k = 0; k < 3; k++) { const d = Math.max(box[i * 6 + k] - p[k], p[k] - box[i * 6 + 3 + k], 0); s += d * d; } return s; };
  for (let v = 0; v < from.positions.length; v += 3) {
    const p = [from.positions[v], from.positions[v + 1], from.positions[v + 2]];
    stack.length = 0; stack.push(0);
    while (stack.length) {
      const i = stack.pop(); if (far(i, p) >= best * best) continue;
      if (count[i]) { for (let j = start[i]; j < start[i] + count[i]; j++) { const t = order[j]; best = Math.min(best, pointTriangle(p, corner(t, 0), corner(t, 1), corner(t, 2))); } continue; }
      // The nearer child is looked at first (pushed last), so the other one is more often skipped.
      const l = kid[i * 2], r = kid[i * 2 + 1]; if (far(l, p) <= far(r, p)) stack.push(r, l); else stack.push(l, r);
    }
  }
  return best;
}

/**
 * Smallest distance between the surfaces of meshes a and b: every vertex of one against every triangle of the other, both ways. null when either has no triangle.
 * With `bound`, the result is never above it (the search stops looking further away), which saves time when only gaps below a known value matter.
 * Limit: where the two surfaces cross each other without a vertex of either lying on the other, the result is the distance of the nearest vertex (a little above 0), not 0;
 * two edges that pass close to each other in mid-span are likewise measured from their nearest vertex.
 */
export function surfaceGap(a, b, bound = Infinity) {
  if (!a.indices.length || !b.indices.length) return null;
  return vertexToSurface(b, a, vertexToSurface(a, b, bound));
}

// Smallest possible distance between two meshes, from their bounding boxes alone (0 when the boxes overlap).
const boxOf = g => { const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity]; for (let i = 0; i < g.positions.length; i++) { const v = g.positions[i], k = i % 3; if (v < lo[k]) lo[k] = v; if (v > hi[k]) hi[k] = v; } return {lo, hi}; };
const boxGap = (a, b) => Math.hypot(...[0, 1, 2].map(k => Math.max(a.lo[k] - b.hi[k], b.lo[k] - a.hi[k], 0)));

/**
 * The gap that has to be bridged to make one connected structure out of the meshes (the separate pieces of one structure, see splitPieces): the longest edge of the
 * minimum spanning tree over surfaceGap. The surface counterpart of linkGap (centreline-groups.mjs): it needs no centreline, so it also covers pieces that are too small
 * or not tube-shaped, and it is not thrown off by the few noisy rings of a coarse mesh. 0 when all pieces touch into one whole; null for fewer than two meshes.
 * Pieces with fewer than `minTriangles` triangles are left out (stray slivers would otherwise set the result).
 */
export function surfaceLinkGap(meshes, minTriangles = 1) {
  const list = meshes.filter(g => g.indices.length / 3 >= minTriangles), n = list.length; if (n < 2) return null;
  const boxes = list.map(boxOf), best = new Array(n).fill(Infinity), done = new Array(n).fill(false); best[0] = 0;
  let worst = 0;
  for (let k = 0; k < n; k++) {
    let v = -1; for (let i = 0; i < n; i++) if (!done[i] && (v < 0 || best[i] < best[v])) v = i;
    done[v] = true; worst = Math.max(worst, best[v]);
    // surfaceGap is bounded by the best link found so far for that piece, and skipped when the boxes alone are already further apart.
    for (let i = 0; i < n; i++) if (!done[i] && boxGap(boxes[v], boxes[i]) < best[i]) best[i] = surfaceGap(list[v], list[i], best[i]);
  }
  return worst;
}
