// Classifies a centreline (array of {c:[x,y,z], r}) for scripts/report-centerlines.mjs. Returns null when it looks fine, otherwise a short reason.
export const JUMP_MAX = .02, LENGTH_MIN = .004;
export function classifyRings(rings) {
  if (rings.length < 2) return 'fewer than 2 rings';
  let max = 0, len = 0;
  for (let i = 1; i < rings.length; i++) { const d = Math.hypot(...rings[i].c.map((v, k) => v - rings[i - 1].c[k])); max = Math.max(max, d); len += d; }
  if (max > JUMP_MAX) return 'jump of ' + (max * 1000).toFixed(0) + ' mm between rings';
  if (len < LENGTH_MIN) return 'length only ' + (len * 1000).toFixed(1) + ' mm';
  return null;
}
