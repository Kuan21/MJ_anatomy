// Reads a BodyParts3D atlas mesh by its exact name straight from public/models (atlas.json and the body-N.bin packages), for build scripts that run before
// the later streams exist.
import fs from 'node:fs';
const root = new URL('../../', import.meta.url);
let atlas = null; const chunks = new Map();
const chunk = i => { if (!chunks.has(i)) chunks.set(i, fs.readFileSync(new URL('public' + atlas.chunks[i].url, root))); return chunks.get(i); };
export function atlasPart(name) {
  atlas ??= JSON.parse(fs.readFileSync(new URL('public/models/atlas.json', root)));
  return atlas.parts.find(q => q.name === name);
}
export function atlasPositions(name) {
  const p = atlasPart(name); if (!p) throw new Error(`atlas has no ${name}`);
  const b = chunk(p.chunk); return new Float32Array(b.buffer.slice(b.byteOffset + p.positions, b.byteOffset + p.positions + p.vertexCount * 12));
}
export function atlasIndices(name) {
  const p = atlasPart(name); if (!p) throw new Error(`atlas has no ${name}`);
  const b = chunk(p.chunk); return new Uint32Array(b.buffer.slice(b.byteOffset + p.indices, b.byteOffset + p.indices + p.indexCount * 4));
}

/** Positions and triangle indices of a BodyParts3D atlas mesh by exact name. */
export function atlasMesh(name) {
  return {positions: atlasPositions(name), indices: atlasIndices(name)};
}

/** Positions and triangle indices of a BodyParts3D atlas mesh by its id (several atlas meshes can share a name: the left and right copies, the mirrored duplicates). */
export function atlasMeshById(id) {
  atlas ??= JSON.parse(fs.readFileSync(new URL('public/models/atlas.json', root)));
  const p = atlas.parts.find(q => q.id === id); if (!p) throw new Error(`atlas has no part ${id}`);
  const b = chunk(p.chunk);
  return {part: p, positions: new Float32Array(b.buffer.slice(b.byteOffset + p.positions, b.byteOffset + p.positions + p.vertexCount * 12)), indices: new Uint32Array(b.buffer.slice(b.byteOffset + p.indices, b.byteOffset + p.indices + p.indexCount * 4))};
}
