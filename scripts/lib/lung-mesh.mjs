// Surface smoothing for the lung lobes and the pleura shells built from them (prepare-supplement.mjs, prepare-serous.mjs).
// The BodyParts3D lobes come from a voxel segmentation, so their surface carries a fine staircase; simplifying it keeps the steps and shading shows them as facets.
// Taubin smoothing (a shrinking step with lambda, an expanding step with mu) removes that noise without the shrinkage of plain Laplacian smoothing, so lobe volume,
// the cardiac notch, the lingula and the grooves of the mediastinal surface survive; the fissures are carved afterwards (lung-fissures.mjs).

/** Vertex neighbours as flat CSR arrays. */
export function neighbours(vertexCount, indices) {
  const sets = Array.from({length: vertexCount}, () => new Set());
  for (let t = 0; t < indices.length; t += 3) for (let k = 0; k < 3; k++) {
    const a = indices[t + k], b = indices[t + (k + 1) % 3];
    if (a !== b) {sets[a].add(b); sets[b].add(a);}
  }
  const start = new Uint32Array(vertexCount + 1); let total = 0;
  for (let i = 0; i < vertexCount; i++) {start[i] = total; total += sets[i].size;} start[vertexCount] = total;
  const list = new Uint32Array(total); let o = 0;
  for (let i = 0; i < vertexCount; i++) for (const j of sets[i]) list[o++] = j;
  return {start, list};
}

/** Vertices on an edge used by exactly one triangle (the border of an open surface): a flag per vertex. */
export function borderVertices(vertexCount, indices) {
  const count = new Map();
  for (let t = 0; t < indices.length; t += 3) for (let k = 0; k < 3; k++) {
    const a = indices[t + k], b = indices[t + (k + 1) % 3], key = a < b ? a * vertexCount + b : b * vertexCount + a;
    count.set(key, (count.get(key) ?? 0) + 1);
  }
  const flag = new Uint8Array(vertexCount);
  for (const [key, n] of count) if (n === 1) {flag[Math.floor(key / vertexCount)] = 1; flag[key % vertexCount] = 1;}
  return flag;
}

/** In-place Taubin smoothing. `weight` (optional Float32Array, 0..1 per vertex) scales the step, 0 pins a vertex. Border vertices of an open mesh are pinned. */
export function taubin(positions, indices, {iterations = 20, lambda = .5, mu = -.53, weight, pinBorder = true} = {}) {
  const n = positions.length / 3, {start, list} = neighbours(n, indices), pinned = pinBorder ? borderVertices(n, indices) : new Uint8Array(n), next = new Float32Array(positions.length);
  const pass = factor => {
    for (let i = 0; i < n; i++) {
      const s = start[i], e = start[i + 1], w = pinned[i] ? 0 : (weight ? weight[i] : 1);
      if (e === s || w === 0) {next[i * 3] = positions[i * 3]; next[i * 3 + 1] = positions[i * 3 + 1]; next[i * 3 + 2] = positions[i * 3 + 2]; continue;}
      let x = 0, y = 0, z = 0;
      for (let q = s; q < e; q++) {const j = list[q] * 3; x += positions[j]; y += positions[j + 1]; z += positions[j + 2];}
      const c = e - s;
      next[i * 3] = positions[i * 3] + factor * w * (x / c - positions[i * 3]);
      next[i * 3 + 1] = positions[i * 3 + 1] + factor * w * (y / c - positions[i * 3 + 1]);
      next[i * 3 + 2] = positions[i * 3 + 2] + factor * w * (z / c - positions[i * 3 + 2]);
    }
    positions.set(next);
  };
  for (let it = 0; it < iterations; it++) {pass(lambda); pass(mu);}
  return positions;
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = a => {const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l];};

/** Angle-weighted unit vertex normals (smoother than area weighting on the uneven triangles that simplification leaves). */
export function angleWeightedNormals(positions, indices) {
  const n = new Float32Array(positions.length);
  for (let t = 0; t < indices.length; t += 3) {
    const v = [indices[t], indices[t + 1], indices[t + 2]];
    const p = v.map(i => [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]]);
    const f = cross(sub(p[1], p[0]), sub(p[2], p[0])), fl = Math.hypot(...f);
    if (fl < 1e-20) continue;
    const fn = f.map(c => c / fl);
    for (let k = 0; k < 3; k++) {
      const a = unit(sub(p[(k + 1) % 3], p[k])), b = unit(sub(p[(k + 2) % 3], p[k])), angle = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
      for (let c = 0; c < 3; c++) n[v[k] * 3 + c] += fn[c] * angle;
    }
  }
  for (let i = 0; i < n.length; i += 3) {const l = Math.hypot(n[i], n[i + 1], n[i + 2]); if (l > 1e-12) {n[i] /= l; n[i + 1] /= l; n[i + 2] /= l;} else {n[i] = 0; n[i + 1] = 1; n[i + 2] = 0;}}
  return n;
}

/** Mesh quality numbers used by the checks: open edges, edges shared by more than two triangles, edges with inconsistent winding, signed volume, degenerate triangles, share of sharp edges. */
export function meshReport(positions, indices, sharpDegrees = 55) {
  const edges = new Map(), n = positions.length / 3;
  for (let t = 0; t < indices.length; t += 3) for (let k = 0; k < 3; k++) {
    const a = indices[t + k], b = indices[t + (k + 1) % 3], key = a < b ? a * n + b : b * n + a, e = edges.get(key) ?? {count: 0, fwd: 0, tris: []};
    e.count++; e.fwd += a < b ? 1 : -1; e.tris.push(t / 3); edges.set(key, e);
  }
  let open = 0, nonManifold = 0, inconsistent = 0;
  for (const e of edges.values()) {if (e.count === 1) open++; else if (e.count > 2) nonManifold++; else if (e.fwd !== 0) inconsistent++;}
  const faceNormals = new Float32Array(indices.length);
  let volume = 0, degenerate = 0;
  for (let t = 0; t < indices.length; t += 3) {
    const [a, b, c] = [indices[t] * 3, indices[t + 1] * 3, indices[t + 2] * 3];
    const pa = [positions[a], positions[a + 1], positions[a + 2]], pb = [positions[b], positions[b + 1], positions[b + 2]], pc = [positions[c], positions[c + 1], positions[c + 2]];
    const f = cross(sub(pb, pa), sub(pc, pa)), l = Math.hypot(...f);
    if (l < 1e-16) degenerate++; else for (let k = 0; k < 3; k++) faceNormals[t + k] = f[k] / l;
    volume += (pa[0] * (pb[1] * pc[2] - pb[2] * pc[1]) - pa[1] * (pb[0] * pc[2] - pb[2] * pc[0]) + pa[2] * (pb[0] * pc[1] - pb[1] * pc[0])) / 6;
  }
  const cosLimit = Math.cos(sharpDegrees * Math.PI / 180); let sharp = 0, manifold = 0;
  for (const e of edges.values()) {
    if (e.count !== 2) continue; manifold++;
    const [p, q] = e.tris; if (faceNormals[p * 3] * faceNormals[q * 3] + faceNormals[p * 3 + 1] * faceNormals[q * 3 + 1] + faceNormals[p * 3 + 2] * faceNormals[q * 3 + 2] < cosLimit) sharp++;
  }
  return {open, nonManifold, inconsistent, volume, degenerate, sharpShare: manifold ? sharp / manifold : 0, triangles: indices.length / 3};
}
