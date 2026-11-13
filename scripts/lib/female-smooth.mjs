// Shape clean-up of the Human Reference Atlas female pieces (CC BY 4.0), applied in prepare-female.mjs before simplification. It changes the source geometry and is recorded
// as a modification in public/ATTRIBUTION.md: the round, ovarian and suspensory ligaments are hair-thin in the source and are inflated along the vertex normals to a textbook cord thickness.
import {normalsOf} from './stream-writer.mjs';

/** Inflate a thin tube-like mesh along its vertex normals until its mean radius reaches `radius` (metres). Returns {before, after}. */
export function thicken(piece, radius) {
  const {positions: q, indices} = piece, n = normalsOf(q, indices);   // Int16, unit length = 32767
  let area = 0, lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (let t = 0; t < indices.length; t += 3) { const [a, b, c] = [indices[t] * 3, indices[t + 1] * 3, indices[t + 2] * 3]; const u = [q[b] - q[a], q[b + 1] - q[a + 1], q[b + 2] - q[a + 2]], v = [q[c] - q[a], q[c + 1] - q[a + 1], q[c + 2] - q[a + 2]]; area += .5 * Math.hypot(u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]); }
  for (let i = 0; i < q.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], q[i + k]); hi[k] = Math.max(hi[k], q[i + k]); }
  // the cord is longer than it is wide, but it bends, so the box diagonal stands in for its length
  const length = Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]), before = area / (2 * Math.PI * length), grow = Math.max(0, radius - before);
  for (let i = 0; i < q.length; i += 3) for (let k = 0; k < 3; k++) q[i + k] += n[i + k] / 32767 * grow;
  return {before, after: before + grow};
}
