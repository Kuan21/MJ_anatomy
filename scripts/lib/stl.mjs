// Binary / ASCII STL reader that welds the triangle soup into an indexed mesh (vertices merged at 1 µm), for the maintainer tools that import third-party models.
import fs from 'node:fs';
export function readStl(file) {
  const b = fs.readFileSync(file), tris = [];
  if (b.slice(0, 5).toString() === 'solid' && b.slice(0, 600).toString().includes('facet')) {
    for (const m of b.toString().matchAll(/vertex\s+(\S+)\s+(\S+)\s+(\S+)/g)) tris.push(+m[1], +m[2], +m[3]);
  } else {
    const n = b.readUInt32LE(80); for (let i = 0; i < n; i++) { const o = 84 + i * 50 + 12; for (let k = 0; k < 9; k++) tris.push(b.readFloatLE(o + k * 4)); }
  }
  const map = new Map(), positions = [], indices = [];
  for (let i = 0; i < tris.length; i += 3) { const key = `${Math.round(tris[i] * 1e3)},${Math.round(tris[i + 1] * 1e3)},${Math.round(tris[i + 2] * 1e3)}`; let id = map.get(key); if (id === undefined) { id = positions.length / 3; map.set(key, id); positions.push(tris[i], tris[i + 1], tris[i + 2]); } indices.push(id); }
  return {positions: Float64Array.from(positions), indices: Uint32Array.from(indices)};
}
