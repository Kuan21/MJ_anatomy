// Small point-cloud registration helpers for the maintainer tools (similarity ICP with a nearest-neighbour grid; Horn's closed-form fit).
export function makeGrid(P, cell) {
  const g = new Map(), key = (x, y, z) => `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`;
  for (let i = 0; i < P.length; i += 3) { const k = key(P[i], P[i + 1], P[i + 2]); (g.get(k) ?? g.set(k, []).get(k)).push(i / 3); }
  return {P, cell, nearest(x, y, z, maxR = 1e9) {
    const cx = Math.floor(x / cell), cy = Math.floor(y / cell), cz = Math.floor(z / cell); let best = -1, bd = maxR * maxR;
    for (let r = 0; r < 60; r++) {
      for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) for (let dz = -r; dz <= r; dz++) {
        if (Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz)) !== r) continue;
        for (const j of g.get(`${cx + dx},${cy + dy},${cz + dz}`) ?? []) { const d = (P[j * 3] - x) ** 2 + (P[j * 3 + 1] - y) ** 2 + (P[j * 3 + 2] - z) ** 2; if (d < bd) { bd = d; best = j; } }
      }
      if (best >= 0 && Math.sqrt(bd) <= r * cell) break;
    }
    return best >= 0 ? {index: best, dist: Math.sqrt(bd)} : null;
  }};
}
function jacobiEigen4(M) {   // symmetric 4x4 → eigenvector of the largest eigenvalue
  const A = M.map(r => r.slice()), V = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0; for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) off += A[i][j] ** 2; if (off < 1e-24) break;
    for (let p = 0; p < 3; p++) for (let q = p + 1; q < 4; q++) {
      if (Math.abs(A[p][q]) < 1e-30) continue; const th = (A[q][q] - A[p][p]) / (2 * A[p][q]), t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < 4; k++) { const akp = A[k][p], akq = A[k][q]; A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq; }
      for (let k = 0; k < 4; k++) { const apk = A[p][k], aqk = A[q][k]; A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk; }
      for (let k = 0; k < 4; k++) { const vkp = V[k][p], vkq = V[k][q]; V[k][p] = c * vkp - s * vkq; V[k][q] = s * vkp + c * vkq; }
    }
  }
  let bi = 0; for (let i = 1; i < 4; i++) if (A[i][i] > A[bi][bi]) bi = i; return [V[0][bi], V[1][bi], V[2][bi], V[3][bi]];
}
/** Horn's method: the similarity (scale s, rotation R as 3x3 row-major, translation t) that maps the points `from` onto `to` (arrays of [x,y,z], same length, optional weights). */
export function hornFit(from, to, weights, withScale = true) {
  const n = from.length, w = weights ?? new Float64Array(n).fill(1); let W = 0; const cf = [0, 0, 0], ct = [0, 0, 0];
  for (let i = 0; i < n; i++) { W += w[i]; for (let k = 0; k < 3; k++) { cf[k] += w[i] * from[i][k]; ct[k] += w[i] * to[i][k]; } } for (let k = 0; k < 3; k++) { cf[k] /= W; ct[k] /= W; }
  const S = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; let sf = 0, st = 0;
  for (let i = 0; i < n; i++) { const a = [0, 1, 2].map(k => from[i][k] - cf[k]), b = [0, 1, 2].map(k => to[i][k] - ct[k]); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) S[r][c] += w[i] * a[r] * b[c]; sf += w[i] * (a[0] ** 2 + a[1] ** 2 + a[2] ** 2); st += w[i] * (b[0] ** 2 + b[1] ** 2 + b[2] ** 2); }
  const [Sxx, Sxy, Sxz] = S[0], [Syx, Syy, Syz] = S[1], [Szx, Szy, Szz] = S[2];
  const N = [[Sxx + Syy + Szz, Syz - Szy, Szx - Sxz, Sxy - Syx], [Syz - Szy, Sxx - Syy - Szz, Sxy + Syx, Szx + Sxz], [Szx - Sxz, Sxy + Syx, -Sxx + Syy - Szz, Syz + Szy], [Sxy - Syx, Szx + Sxz, Syz + Szy, -Sxx - Syy + Szz]];
  const [q0, q1, q2, q3] = jacobiEigen4(N);
  const R = [[q0 * q0 + q1 * q1 - q2 * q2 - q3 * q3, 2 * (q1 * q2 - q0 * q3), 2 * (q1 * q3 + q0 * q2)], [2 * (q1 * q2 + q0 * q3), q0 * q0 - q1 * q1 + q2 * q2 - q3 * q3, 2 * (q2 * q3 - q0 * q1)], [2 * (q1 * q3 - q0 * q2), 2 * (q2 * q3 + q0 * q1), q0 * q0 - q1 * q1 - q2 * q2 + q3 * q3]];
  const s = withScale ? Math.sqrt(st / sf) : 1, t = [0, 1, 2].map(k => ct[k] - s * (R[k][0] * cf[0] + R[k][1] * cf[1] + R[k][2] * cf[2]));
  return {s, R, t};
}
export const applyFit = (f, p) => [0, 1, 2].map(k => f.s * (f.R[k][0] * p[0] + f.R[k][1] * p[1] + f.R[k][2] * p[2]) + f.t[k]);
