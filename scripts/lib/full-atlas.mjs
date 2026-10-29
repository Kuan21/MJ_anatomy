// The atlas as the app sees it at run time (source overrides applied, facial, supplement, female, serous, vessel-end and schematic streams appended), with a reader for each part's geometry.
import fs from 'node:fs';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
const root = new URL('../../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
const readJson = f => JSON.parse(f.endsWith('.gz') ? zlib.gunzipSync(fs.readFileSync(file(f))) : fs.readFileSync(file(f), 'utf8'));
// VESSEL_ENDS_MANIFEST=<file>: read the vessel-ends manifest from another file (to measure an earlier state of the connectors against the same meshes)
const readStream = s => s.startsWith('vessel-ends') && process.env.VESSEL_ENDS_MANIFEST ? JSON.parse(zlib.gunzipSync(fs.readFileSync(process.env.VESSEL_ENDS_MANIFEST))) : readJson('public/models/' + s);
export const STREAMS = ['facial/facial-stream.json.gz', 'supplement/supplement-stream.json.gz', 'female/female-stream.json.gz', 'serous/serous-stream.json.gz', 'vessel-ends/vessel-ends-stream.json.gz', 'paokao/paokao-stream.json.gz'];
export function loadFullAtlas({streams = STREAMS} = {}) {
  const atlas = readJson('public/models/atlas.json'), over = readJson('app/anatomy-source-overrides.json'), ex = new Set(over.exclude);
  const parts = atlas.parts.filter(p => !ex.has(p.id)).map(p => ({...p, ...(over.parts[p.id] || {})})), chunks = [...atlas.chunks];
  for (const s of streams) { const j = readStream(s), off = chunks.length; for (const p of j.parts) parts.push({...p, chunk: off + p.chunk, stream: s.split('/')[0]}); chunks.push(...j.chunks); }
  const cache = new Map(), buf = i => { if (!cache.has(i)) cache.set(i, fs.readFileSync(file('public' + chunks[i].url))); return cache.get(i); };
  const geometry = p => { const b = buf(p.chunk); return {positions: new Float32Array(b.buffer, b.byteOffset + p.positions, p.vertexCount * 3).slice(), indices: new Uint32Array(b.buffer, b.byteOffset + p.indices, p.indexCount).slice(), normals: new Int16Array(b.buffer, b.byteOffset + p.normals, p.vertexCount * 3).slice()}; };
  return {atlas: {...atlas, parts, chunks}, geometry};
}
