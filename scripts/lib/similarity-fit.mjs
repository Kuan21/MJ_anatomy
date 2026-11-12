// Weighted similarity registration (uniform scale, rotation, translation) by Horn's quaternion method, with an ICP loop to the nearest target point.
export const IDENTITY = {s: 1, R: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], t: [0, 0, 0]};
export const applyFit = (T, p) => T.R.map((r, k) => T.s * (r[0] * p[0] + r[1] * p[1] + r[2] * p[2]) + T.t[k]);

/** The s, R, t that minimise sum W |s R a + t - b|^2. */
export function horn(A, B, W) {
  let sw = 0; const ca = [0, 0, 0], cb = [0, 0, 0];
  for (let i = 0; i < A.length; i++) { sw += W[i]; for (let k = 0; k < 3; k++) { ca[k] += W[i] * A[i][k]; cb[k] += W[i] * B[i][k]; } }
  for (let k = 0; k < 3; k++) { ca[k] /= sw; cb[k] /= sw; }
  const S = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; let va = 0;
  for (let i = 0; i < A.length; i++) {
    const a = A[i].map((v, k) => v - ca[k]), b = B[i].map((v, k) => v - cb[k]);
    va += W[i] * (a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) S[r][c] += W[i] * a[r] * b[c];
  }
  const [[sxx, sxy, sxz], [syx, syy, syz], [szx, szy, szz]] = S;
  const N = [[sxx + syy + szz, syz - szy, szx - sxz, sxy - syx], [syz - szy, sxx - syy - szz, sxy + syx, szx + sxz],
    [szx - sxz, sxy + syx, -sxx + syy - szz, syz + szy], [sxy - syx, szx + sxz, syz + szy, -sxx - syy + szz]];
  // largest eigenvector by power iteration; the shift makes every eigenvalue positive
  let q = [1, 0, 0, 0]; const shift = 100 * va + 1;
  for (let it = 0; it < 500; it++) { const n = N.map((row, r) => row.reduce((s, v, c) => s + (v + (r === c ? shift : 0)) * q[c], 0)); const l = Math.hypot(...n); q = n.map(v => v / l); }
  const [w, x, y, z] = q;
  const R = [[1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)], [2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)], [2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)]];
  let num = 0;
  for (let i = 0; i < A.length; i++) {
    const a = A[i].map((v, k) => v - ca[k]), b = B[i].map((v, k) => v - cb[k]), Ra = R.map(r => r[0] * a[0] + r[1] * a[1] + r[2] * a[2]);
    num += W[i] * (Ra[0] * b[0] + Ra[1] * b[1] + Ra[2] * b[2]);
  }
  const s = num / va, Rca = R.map(r => r[0] * ca[0] + r[1] * ca[1] + r[2] * ca[2]);
  return {s, R, t: cb.map((v, k) => v - s * Rca[k])};
}

/** ICP of `source` points onto `target` points (matches beyond `reach` metres are ignored), with extra weighted landmark pairs. */
export function icp(source, target, {landmarks = [], landmarkWeight = 1000, start, iterations = 40, reach = .03} = {}) {
  let T = start;
  for (let it = 0; it < iterations; it++) {
    const A = [], B = [], W = [];
    for (const p of source) {
      const q = applyFit(T, p); let best = Infinity, hit = null;
      for (const a of target) { const d = (a[0] - q[0]) ** 2 + (a[1] - q[1]) ** 2 + (a[2] - q[2]) ** 2; if (d < best) { best = d; hit = a; } }
      if (best < reach * reach) { A.push(p); B.push(hit); W.push(1); }
    }
    for (const [a, b] of landmarks) { A.push(a); B.push(b); W.push(landmarkWeight); }
    T = horn(A, B, W);
  }
  return T;
}
