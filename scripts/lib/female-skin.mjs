// Female body surface: the BodyParts3D skin (CC BY-SA 2.1 Japan) is one male mesh whose penis and scrotum are part of the skin itself. For the female view this builds a copy in which that
// part of the surface is pressed back onto a smooth female groin: the pubic mound, the shallow cleft below it between the thighs and the perineum. The displacement fades out smoothly in
// every direction (no box edge, no step), both shells of the skin file (outer and inner) get the same treatment, and the surface around the moved area is relaxed over the mesh edges so no
// crease or rectangular outline is left. A modification of the source geometry, recorded in public/ATTRIBUTION.md.
export const smoothstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// Where the front of the female surface lies on the midline, by height (metres, atlas frame): the pubic mound keeps the male abdomen's front down to y = .875, then the surface
// falls back along the vulva to the perineum.
export const PROFILE = [[.93, 1], [.875, .078], [.85, .07], [.83, .061], [.80, .046], [.77, .04], [.74, .036]];
export const profileZ = y => { if (y >= PROFILE[0][0]) return 1; for (let i = 1; i < PROFILE.length; i++) if (y >= PROFILE[i][0]) { const [y0, z0] = PROFILE[i - 1], [y1, z1] = PROFILE[i], f = (y0 - y) / (y0 - y1); return z0 + (z1 - z0) * f; } return PROFILE[PROFILE.length - 1][1]; };

/** The groin area the surface is reshaped in: vertices outside this box are never moved (the back of the body is untouched). */
export const GROIN_BOX = {y0: .70, y1: .95, zBack: -.005};

/** Weight of the reshaping at a point of the surface: 1 on the midline between the thighs, fading smoothly to 0 above (into the abdomen), below (into the thigh gap) and to the sides. */
export const groinWeight = (x, y) => {
  const half = .03 + .02 * smoothstep(.80, .85, y);
  return smoothstep(.715, .80, y) * (1 - smoothstep(.85, .92, y)) * (1 - smoothstep(half, half + .03, Math.abs(x)));
};
/** The reshaped front of the surface: the midline profile, falling away to the sides in a soft convex arc (the pubic mound and the folds beside it), so it meets the inguinal creases instead of standing out of them. */
export const groinTarget = (x, y) => profileZ(y);
export function femaleSkin(positions, indices, {passes = 24, rings = 8, decay = .75} = {}) {
  const n = positions.length / 3, out = Float32Array.from(positions), w = new Float32Array(n);
  // Every vertex of the groin that stands in front of the female front is brought back towards it, by the fading weight: the front of the penis and scrotum come back onto the surface, the layers
  // behind them (the skin under the shaft) are already behind it and stay where they are, so nothing is left to show through. The weight fades smoothly in every direction.
  for (let i = 0; i < n; i++) {
    const x = positions[i * 3], y = positions[i * 3 + 1], z = positions[i * 3 + 2];
    if (y < GROIN_BOX.y0 || y > GROIN_BOX.y1 || z < GROIN_BOX.zBack) continue;
    w[i] = groinWeight(x, y); const t = groinTarget(x, y);
    // every layer of the male surface below the mound (front of the shaft, its sides, the skin under it) goes onto the same smooth surface; above it the surface is only pressed back, never raised
    if (w[i] > 0 && (z > t || y <= PROFILE[1][0])) out[i * 3 + 2] = z + w[i] * (t - z);
  }
  // relax the moved vertices and a band around them over the mesh edges, so no crease is left where the area meets the rest
  const adj = Array.from({length: n}, () => []);
  for (let t = 0; t < indices.length; t += 3) for (let k = 0; k < 3; k++) { const a = indices[t + k], b = indices[t + (k + 1) % 3]; adj[a].push(b); adj[b].push(a); }
  const s = Float32Array.from(w);
  for (let r = 0; r < rings; r++) { const next = Float32Array.from(s); for (let i = 0; i < n; i++) for (const j of adj[i]) if (s[j] * decay > next[i]) next[i] = s[j] * decay; s.set(next); }
  // the relaxation stays inside the groin area: nothing outside the box is ever moved (the back of the body, the thighs, the abdomen)
  for (let i = 0; i < n; i++) { const y = positions[i * 3 + 1], z = positions[i * 3 + 2]; if (y < GROIN_BOX.y0 || y > GROIN_BOX.y1 || z < GROIN_BOX.zBack || Math.abs(positions[i * 3]) >= .14) s[i] = 0; }
  for (let p = 0; p < passes; p++) {
    const next = Float32Array.from(out);
    for (let i = 0; i < n; i++) { if (s[i] <= 0 || !adj[i].length) continue; for (let k = 0; k < 3; k++) { let sum = 0; for (const j of adj[i]) sum += out[j * 3 + k]; next[i * 3 + k] = out[i * 3 + k] * (1 - .5 * s[i]) + (sum / adj[i].length) * .5 * s[i]; } }
    out.set(next);
  }
  return out;
}

/**
 * The triangles of the reshaped skin. The layers of the male surface that were brought onto the new surface (the skin under the shaft, the sides of the scrotum) lie on it facing
 * backwards or edge-on; they are dropped so that no sliver of them shows through the front. Vertices are not changed, so the female skin keeps the male skin's vertex count and weights.
 */
export function femaleSkinIndices(positions, indices) {
  const keep = [], P = positions;
  for (let t = 0; t < indices.length; t += 3) {
    const a = indices[t], b = indices[t + 1], c = indices[t + 2];
    const ux = P[b * 3] - P[a * 3], uy = P[b * 3 + 1] - P[a * 3 + 1], vx = P[c * 3] - P[a * 3], vy = P[c * 3 + 1] - P[a * 3 + 1], nz = ux * vy - uy * vx;   // z of the face normal (the area seen from the front)
    const cx = (P[a * 3] + P[b * 3] + P[c * 3]) / 3, cy = (P[a * 3 + 1] + P[b * 3 + 1] + P[c * 3 + 1]) / 3, cz = (P[a * 3 + 2] + P[b * 3 + 2] + P[c * 3 + 2]) / 3;
    if (cz > GROIN_BOX.zBack && groinWeight(cx, cy) >= .1 && cy >= .72 && cy <= PROFILE[1][0] && nz < 0) continue;
    keep.push(a, b, c);
  }
  return Uint32Array.from(keep);
}
