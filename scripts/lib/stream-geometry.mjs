// Node-side twin of app/stream-geometry.ts for scripts that read the atlas packages: positions (Float32, dequantised when `pq`) and indices (Uint16 when `u16`).
export const positionsOf = (buf, part) => {
  const n = part.vertexCount * 3;
  if (!part.pq) return new Float32Array(buf.buffer.slice(buf.byteOffset + part.positions, buf.byteOffset + part.positions + n * 4));
  const q = new Uint16Array(buf.buffer.slice(buf.byteOffset + part.positions, buf.byteOffset + part.positions + n * 2)), out = new Float32Array(n), [lx, ly, lz, sx, sy, sz] = part.pq;
  for (let i = 0; i < n; i += 3) {out[i] = q[i] * sx + lx; out[i + 1] = q[i + 1] * sy + ly; out[i + 2] = q[i + 2] * sz + lz;}
  return out;
};
export const indicesOf = (buf, part) => part.u16
  ? new Uint16Array(buf.buffer.slice(buf.byteOffset + part.indices, buf.byteOffset + part.indices + part.indexCount * 2))
  : new Uint32Array(buf.buffer.slice(buf.byteOffset + part.indices, buf.byteOffset + part.indices + part.indexCount * 4));
/** Normals as normalised Int16 triples: decoded from the octahedral Int16 pairs when `n2`, else the stored triples. */
export const normalsOf = (buf, part) => {
  const count = part.vertexCount;
  if (!part.n2) return new Int16Array(buf.buffer.slice(buf.byteOffset + part.normals, buf.byteOffset + part.normals + count * 6));
  const o = new Int16Array(buf.buffer.slice(buf.byteOffset + part.normals, buf.byteOffset + part.normals + count * 4)), out = new Int16Array(count * 3);
  for (let i = 0; i < count; i++) {
    let x = o[i * 2] / 32767, y = o[i * 2 + 1] / 32767, z = 1 - Math.abs(x) - Math.abs(y);
    if (z < 0) {const ox = x, oy = y; x = (1 - Math.abs(oy)) * (ox >= 0 ? 1 : -1); y = (1 - Math.abs(ox)) * (oy >= 0 ? 1 : -1);}
    const l = Math.hypot(x, y, z) || 1; out[i * 3] = Math.round(x / l * 32767); out[i * 3 + 1] = Math.round(y / l * 32767); out[i * 3 + 2] = Math.round(z / l * 32767);
  }
  return out;
};
