// A closed, smooth envelope around the lobes of one lung, offset outward by `offset` metres: the parietal pleura is built from it.
// The lobes touch along the fissures, so an offset of each lobe leaves torn gaps there. Here the lobe surfaces are voxelised, closed (dilate, fill, erode by `close`) so the fissures
// are bridged, turned into a signed distance field and meshed with marching tetrahedra at the wanted offset: one watertight surface with no triangle cut away.
export function envelope(pieces, {cell = .0025, close = .006, offset = .005} = {}) {
  let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (const {positions} of pieces) for (let i = 0; i < positions.length; i += 3) for (let k = 0; k < 3; k++) {lo[k] = Math.min(lo[k], positions[i + k]); hi[k] = Math.max(hi[k], positions[i + k]);}
  const pad = close + offset + 4 * cell; lo = lo.map(v => v - pad); hi = hi.map(v => v + pad);
  const dim = lo.map((v, k) => Math.ceil((hi[k] - v) / cell) + 1), [nx, ny, nz] = dim, N = nx * ny * nz, at = (x, y, z) => (z * ny + y) * nx + x;
  const surface = new Uint8Array(N), mark = (x, y, z) => {const ix = Math.round((x - lo[0]) / cell), iy = Math.round((y - lo[1]) / cell), iz = Math.round((z - lo[2]) / cell); surface[at(ix, iy, iz)] = 1;};
  for (const {positions: p, indices: ix} of pieces) for (let t = 0; t < ix.length; t += 3) {
    const v = [0, 1, 2].map(k => ix[t + k] * 3);
    // sample each triangle finely enough that no cell on the surface is skipped
    const a = [0, 1, 2].map(k => p[v[0] + k]), b = [0, 1, 2].map(k => p[v[1] + k]), c = [0, 1, 2].map(k => p[v[2] + k]);
    const e = Math.max(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]), Math.hypot(c[0] - b[0], c[1] - b[1], c[2] - b[2])), n = Math.max(1, Math.ceil(e / (cell * .6)));
    for (let i = 0; i <= n; i++) for (let j = 0; j <= n - i; j++) {const u = i / n, w = j / n, s = 1 - u - w; mark(a[0] * s + b[0] * u + c[0] * w, a[1] * s + b[1] * u + c[1] * w, a[2] * s + b[2] * u + c[2] * w);}
  }
  // chamfer distance (in cells) from the set bits of `seed` to every voxel
  const distance = seed => {
    const d = new Float32Array(N).fill(1e9); for (let i = 0; i < N; i++) if (seed[i]) d[i] = 0;
    const offs = []; for (let dz = -1; dz <= 1; dz++) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy || dz) offs.push([dx, dy, dz, Math.hypot(dx, dy, dz)]);
    const fwd = offs.filter(([dx, dy, dz]) => dz < 0 || (dz === 0 && (dy < 0 || (dy === 0 && dx < 0)))), bwd = offs.filter(o => !fwd.includes(o));
    const sweep = (list, rev) => {
      for (let q = 0; q < N; q++) {
        const i = rev ? N - 1 - q : q, x = i % nx, y = Math.floor(i / nx) % ny, z = Math.floor(i / (nx * ny));
        let best = d[i]; for (const [dx, dy, dz, w] of list) {const X = x + dx, Y = y + dy, Z = z + dz; if (X < 0 || Y < 0 || Z < 0 || X >= nx || Y >= ny || Z >= nz) continue; const v = d[at(X, Y, Z)] + w; if (v < best) best = v;}
        d[i] = best;
      }
    };
    sweep(fwd, false); sweep(bwd, true); return d;
  };
  const r = close / cell, d1 = distance(surface), grown = new Uint8Array(N); for (let i = 0; i < N; i++) grown[i] = d1[i] <= r ? 1 : 0;
  // fill: whatever the outside cannot reach is inside
  const outside = new Uint8Array(N), stack = [at(0, 0, 0)]; outside[stack[0]] = 1;
  while (stack.length) {
    const i = stack.pop(), x = i % nx, y = Math.floor(i / nx) % ny, z = Math.floor(i / (nx * ny));
    for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {const X = x + dx, Y = y + dy, Z = z + dz; if (X < 0 || Y < 0 || Z < 0 || X >= nx || Y >= ny || Z >= nz) continue; const j = at(X, Y, Z); if (!outside[j] && !grown[j]) {outside[j] = 1; stack.push(j);}}
  }
  const filled = new Uint8Array(N), out0 = new Uint8Array(N); for (let i = 0; i < N; i++) {filled[i] = outside[i] ? 0 : 1; out0[i] = outside[i];}
  const dOut = distance(out0), solid = new Uint8Array(N), solidOut = new Uint8Array(N);
  for (let i = 0; i < N; i++) {solid[i] = dOut[i] > r ? 1 : 0; solidOut[i] = 1 - solid[i];}
  const dIn = distance(solid), dEx = distance(solidOut), field = new Float32Array(N); // signed, metres: positive outside the closed lung
  for (let i = 0; i < N; i++) field[i] = (solid[i] ? -(dEx[i] - .5) : (dIn[i] - .5)) * cell;
  // light box blur removes the voxel steps of the chamfer distance
  for (let pass = 0; pass < 2; pass++) {
    const next = new Float32Array(field);
    for (let z = 1; z < nz - 1; z++) for (let y = 1; y < ny - 1; y++) for (let x = 1; x < nx - 1; x++) {
      let s = 0; for (let dz = -1; dz <= 1; dz++) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += field[at(x + dx, y + dy, z + dz)];
      next[at(x, y, z)] = s / 27;
    }
    field.set(next);
  }
  // marching tetrahedra at `offset`
  const positions = [], indices = [], cache = new Map();
  const vertex = (i, j) => {
    const key = i < j ? i * N + j : j * N + i; let v = cache.get(key); if (v !== undefined) return v;
    const fi = field[i] - offset, fj = field[j] - offset, t = fi / (fi - fj), P = k => {const q = [k % nx, Math.floor(k / nx) % ny, Math.floor(k / (nx * ny))]; return q;};
    const a = P(i), b = P(j); positions.push(...[0, 1, 2].map(k => lo[k] + (a[k] + (b[k] - a[k]) * t) * cell)); v = positions.length / 3 - 1; cache.set(key, v); return v;
  };
  const TETS = [[0, 5, 1, 6], [0, 1, 2, 6], [0, 2, 3, 6], [0, 3, 7, 6], [0, 7, 4, 6], [0, 4, 5, 6]];
  const corner = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]];
  for (let z = 0; z < nz - 1; z++) for (let y = 0; y < ny - 1; y++) for (let x = 0; x < nx - 1; x++) {
    const ids = corner.map(([a, b, c]) => at(x + a, y + b, z + c));
    if (ids.every(i => field[i] > offset) || ids.every(i => field[i] <= offset)) continue;
    for (const tet of TETS) {
      const q = tet.map(k => ids[k]), inside = q.map(i => field[i] <= offset), n = inside.filter(Boolean).length;
      if (n === 0 || n === 4) continue;
      const ins = q.filter((_, k) => inside[k]), outs = q.filter((_, k) => !inside[k]);
      // orientation is fixed afterwards from the outward gradient
      if (n === 1) indices.push(vertex(ins[0], outs[0]), vertex(ins[0], outs[1]), vertex(ins[0], outs[2]));
      else if (n === 3) indices.push(vertex(outs[0], ins[0]), vertex(outs[0], ins[2]), vertex(outs[0], ins[1]));
      else {const a = vertex(ins[0], outs[0]), b = vertex(ins[0], outs[1]), c = vertex(ins[1], outs[1]), d = vertex(ins[1], outs[0]); indices.push(a, b, c, a, c, d);}
    }
  }
  const pos = Float32Array.from(positions), idx = Uint32Array.from(indices);
  // wind every triangle so that its normal points up the field (out of the lung)
  const grad = (x, y, z) => { const g = (X, Y, Z) => field[at(Math.min(nx - 1, Math.max(0, Math.round(X))), Math.min(ny - 1, Math.max(0, Math.round(Y))), Math.min(nz - 1, Math.max(0, Math.round(Z))))]; return [g(x + 1, y, z) - g(x - 1, y, z), g(x, y + 1, z) - g(x, y - 1, z), g(x, y, z + 1) - g(x, y, z - 1)]; };
  for (let t = 0; t < idx.length; t += 3) {
    const [a, b, c] = [idx[t] * 3, idx[t + 1] * 3, idx[t + 2] * 3], u = [0, 1, 2].map(k => pos[b + k] - pos[a + k]), w = [0, 1, 2].map(k => pos[c + k] - pos[a + k]);
    const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]], m = [0, 1, 2].map(k => (pos[a + k] + pos[b + k] + pos[c + k]) / 3);
    const g = grad(...m.map((v, k) => (v - lo[k]) / cell));
    if (n[0] * g[0] + n[1] * g[1] + n[2] * g[2] < 0) {const s = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = s;}
  }
  return {positions: pos, indices: idx};
}
