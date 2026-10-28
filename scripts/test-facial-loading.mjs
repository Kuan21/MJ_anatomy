// The 47 facial muscles used to come from one 16 MB remote file; when it timed out the loading hint stuck at
// 93 % (2,232/2,279). They are now same-origin, compressed, staged packages: prove every piece resolves.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {runnerImport} from 'vite';
const {normalizeAtlasSystems}=(await runnerImport(fileURLToPath(new URL('../app/mj-system-classifier.ts',import.meta.url)))).module;
const dir=new URL('../public/models/',import.meta.url);
const base=JSON.parse(fs.readFileSync(new URL('atlas-stream.json',dir),'utf8')),catalogue=JSON.parse(fs.readFileSync(new URL('facial/atlas.json',dir),'utf8'));
const facial=JSON.parse(gunzipSync(fs.readFileSync(new URL('facial/facial-stream.json.gz',dir))));
assert.equal(facial.parts.length,catalogue.parts.length,'every catalogued facial piece is packaged');
assert.equal(catalogue.parts.length,47);
const datas=facial.chunks.map(c=>{
 assert.ok(c.url.startsWith('/models/stream/facial-')&&c.gzip===c.url+'.gz','same-origin immutable package');
 const raw=fs.readFileSync(new URL('..'+c.url,dir)),gz=fs.readFileSync(new URL('..'+c.gzip,dir));
 assert.equal(raw.length,c.bytes);assert.equal(gz.length,c.gzipBytes);assert.ok(gunzipSync(gz).equals(raw),'gzip is lossless');
 assert.ok(c.bytes<=3000000,`package stays small enough to stream (${c.bytes})`);
 assert.ok(c.url.includes(createHash('sha256').update(raw).digest('hex').slice(0,20)),'content-addressed');
 return raw;
});
const source=fs.readFileSync(new URL('../../work/facial.bin',dir));
let vertices=0;
for(const p of facial.parts){
 const old=catalogue.parts.find(x=>x.id===p.id);assert.ok(old,'known piece '+p.name);
 const raw=datas[p.chunk];assert.ok(raw,'package exists');
 const same=(a,b,len)=>assert.ok(raw.subarray(a,a+len).equals(source.subarray(b,b+len)),`${p.name}: bytes identical to the pinned source`);
 same(p.positions,old.positions,p.vertexCount*12);same(p.normals,old.normals,p.vertexCount*6);same(p.indices,old.indices,p.indexCount*4);
 assert.equal(p.positions%4,0);assert.equal(p.indices%4,0);vertices+=p.vertexCount;
}
const total=facial.chunks.reduce((n,c)=>n+c.gzipBytes,0),rawTotal=facial.chunks.reduce((n,c)=>n+c.bytes,0);
assert.ok(total<rawTotal*.65,'compressed');
assert.equal(normalizeAtlasSystems(base).parts.length+facial.parts.length,2277,'2,230 body + 47 facial = 2,277 structures');
console.log(`PASS facial loading: ${facial.parts.length} pieces, ${vertices.toLocaleString()} vertices, ${facial.chunks.length} same-origin packages (${(rawTotal/1e6).toFixed(1)} MB → ${(total/1e6).toFixed(1)} MB gzip), byte-identical to the pinned source.`);
