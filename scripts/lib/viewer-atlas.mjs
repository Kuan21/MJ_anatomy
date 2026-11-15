// The atlas exactly as the viewer loads it: the compact body packages of atlas-stream.json (cut muscles with their tendons, repaired muscles, smoothed limb vessels, quantised positions) plus the
// facial, supplement, female, serous, vessel-end and schematic streams. scripts/lib/full-atlas.mjs reads the RAW body meshes (atlas.json): fine for the motion checks that were written
// against it, but wrong for anything about how a mesh LOOKS (gluteus maximus, external oblique, tendon cuts, vessel smoothing). Same return shape as loadFullAtlas.
import fs from 'node:fs';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {STREAMS} from './full-atlas.mjs';
import {indicesOf, normalsOf, positionsOf} from './stream-geometry.mjs';
const root = new URL('../../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
const readJson = f => JSON.parse(f.endsWith('.gz') ? zlib.gunzipSync(fs.readFileSync(file(f))) : fs.readFileSync(file(f), 'utf8'));
export function loadViewerAtlas({streams = STREAMS} = {}) {
  const atlas = fs.existsSync(file('public/models/atlas-stream.json')) ? readJson('public/models/atlas-stream.json') : readJson('public/models/atlas-stream.json.gz');
  const over = readJson('app/anatomy-source-overrides.json'), ex = new Set(over.exclude);
  const parts = atlas.parts.filter(p => !ex.has(p.id)).map(p => ({...p, ...(over.parts[p.id] || {})})), chunks = [...atlas.chunks];
  for (const s of streams) { const j = readJson('public/models/' + s), off = chunks.length; for (const p of j.parts) parts.push({...p, chunk: off + p.chunk, stream: s.split('/')[0]}); chunks.push(...j.chunks); }
  const cache = new Map(), buf = i => { if (!cache.has(i)) cache.set(i, fs.readFileSync(file('public' + chunks[i].url))); return cache.get(i); };
  const geometry = p => { const b = buf(p.chunk); return {positions: positionsOf(b, p), indices: Uint32Array.from(indicesOf(b, p)), normals: normalsOf(b, p)}; };
  return {atlas: {...atlas, parts, chunks}, geometry};
}
