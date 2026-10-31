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
