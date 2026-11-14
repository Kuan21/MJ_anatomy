// Female body surface: the BodyParts3D skin (CC BY-SA 2.1 Japan) is one male mesh whose penis and scrotum are part of the skin itself. For the female view this builds a copy in which that
// part of the surface is pressed back onto a smooth female groin: the front of the pubic mound, the cleft below it and the perineum. Only the vertices in the groin box move; both shells of
// the skin file (outer and inner) get the same treatment. A modification of the source geometry, recorded in public/ATTRIBUTION.md.
const smoothstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// Where the front of the female surface lies on the midline, by height (metres, atlas frame): the pubic mound keeps the male abdomen's front down to y = .875, then the surface
// falls back along the vulva to the perineum.
const PROFILE = [[.93, 1], [.875, .075], [.85, .062], [.83, .05], [.80, .036], [.77, .016], [.74, -.01]];
const targetZ = y => { if (y >= PROFILE[0][0]) return 1; for (let i = 1; i < PROFILE.length; i++) if (y >= PROFILE[i][0]) { const [y0, z0] = PROFILE[i - 1], [y1, z1] = PROFILE[i], f = (y0 - y) / (y0 - y1); return z0 + (z1 - z0) * f; } return PROFILE[PROFILE.length - 1][1]; };

export function femaleSkin(positions, indices, {fade = .02, passes = 16} = {}) {
  const n = positions.length / 3, out = Float32Array.from(positions), w = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = positions[i * 3], y = positions[i * 3 + 1], z = positions[i * 3 + 2];
    if (y < .74 || y > .93 || z < -.005) continue;                // groin box in front of the perineum's back edge; the back of the body is never touched
    // the cleft between the thighs is narrow below the scrotum: the box narrows with height so the inner thigh surfaces are not pulled along
    const half = .022 + .016 * smoothstep(.79, .84, y), wx = 1 - smoothstep(half, half + fade, Math.abs(x)), wy = smoothstep(.735, .79, y);
    w[i] = y >= .875 ? 0 : wx * wy;
    const t = targetZ(y); if (z > t && w[i] > 0) out[i * 3 + 2] = z - w[i] * (z - t);
  }
  // relax the moved vertices over the mesh edges so the pressed-back surface is smooth instead of a stamped plane
  const adj = Array.from({length: n}, () => []);
  for (let t = 0; t < indices.length; t += 3) for (let k = 0; k < 3; k++) { const a = indices[t + k], b = indices[t + (k + 1) % 3]; adj[a].push(b); adj[b].push(a); }
  for (let p = 0; p < passes; p++) {
    const next = Float32Array.from(out);
    for (let i = 0; i < n; i++) { if (w[i] <= 0 || !adj[i].length) continue; for (let k = 0; k < 3; k++) { let s = 0; for (const j of adj[i]) s += out[j * 3 + k]; next[i * 3 + k] = out[i * 3 + k] * (1 - .5 * w[i]) + (s / adj[i].length) * .5 * w[i]; } }
    out.set(next);
  }
  return out;
}
