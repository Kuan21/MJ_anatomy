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
