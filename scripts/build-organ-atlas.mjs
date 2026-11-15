// Builds one organ detail package: public/models/organ/<organ>/<organ>.json + <organ>.bin.gz (loaded by app/organ/organ-detail.tsx).
//   node scripts/build-organ-atlas.mjs <organ> [path/to/source.glb ...]
// Organ builders live in scripts/organ-atlas/<organ>.mjs and export build({atlasPart, hra, writer}) -> report. Sources that are not in the repository (Human Reference Atlas 3D Reference Object Library
// glb files, CC BY 4.0, https://apps.humanatlas.io/api/v1/reference-organs ) are passed as paths, or downloaded from the pinned cdn.humanatlas.io URL named in the builder and checked against its sha256.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {AtlasWriter} from './lib/organ-mesh.mjs';
const organ = process.argv[2];
if (!organ) throw new Error('usage: build-organ-atlas.mjs <organ> [glb ...]');
const models = new URL('../public/models/', import.meta.url), out = new URL(`organ/${organ}/`, models);
const atlas = JSON.parse(fs.readFileSync(new URL('atlas.json', models))), chunks = new Map();
const atlasPart = id => {
  const p = atlas.parts.find(x => x.id === id); if (!p) throw new Error('Missing atlas part ' + id);
  const file = atlas.chunks[p.chunk].url.split('/').pop(); if (!chunks.has(file)) chunks.set(file, fs.readFileSync(new URL(file, models))); const b = chunks.get(file);
  return {positions: new Float32Array(b.buffer.slice(b.byteOffset + p.positions, b.byteOffset + p.positions + p.vertexCount * 12)), indices: new Uint32Array(b.buffer.slice(b.byteOffset + p.indices, b.byteOffset + p.indices + p.indexCount * 4))};
};
const mod = await import(`./organ-atlas/${organ}.mjs`), writer = new AtlasWriter();
const report = await mod.build({atlasPart, writer, args: process.argv.slice(3), download: async (url, sha) => {
  const dir = '/tmp/claude-0/organ-src/'; fs.mkdirSync(dir, {recursive: true}); const file = dir + url.split('/').pop();
  if (!fs.existsSync(file)) fs.writeFileSync(file, Buffer.from(await (await fetch(url)).arrayBuffer()));
  const got = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); if (sha && got !== sha) throw new Error(`${url}: sha256 ${got} differs from the pinned ${sha}`); return file;
}});
const bin = writer.binary(), gz = gzipSync(bin, {level: 9});
fs.mkdirSync(out, {recursive: true});
fs.writeFileSync(new URL(`${organ}.bin.gz`, out), gz);
fs.writeFileSync(new URL(`${organ}.json`, out), JSON.stringify({organ, bytes: bin.length, gzip: `models/organ/${organ}/${organ}.bin.gz`, parts: writer.parts, ...(report?.manifest ?? {})}));
console.log(`${organ}: ${writer.parts.length} meshes, ${(bin.length / 1e6).toFixed(2)} MB (${(gz.length / 1e6).toFixed(2)} MB gzip)`);
if (report?.stats) console.log(JSON.stringify(report.stats), JSON.stringify(report.landmarks ?? {}));
