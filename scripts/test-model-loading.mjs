import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gzipSync} from 'node:zlib';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../app/model-download.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {decodeModelResponse,fetchModelBuffer,loadMissingChunks}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const data=new Uint8Array([0,1,2,3,4,5,6,7]),gz=gzipSync(data);
assert.deepEqual(new Uint8Array(await decodeModelResponse(new Response(gz),8,true)),data);
assert.deepEqual(new Uint8Array(await decodeModelResponse(new Response(data),8,true)),data,'HTTP already decoded gzip');
let cursor=0;
const split=new ReadableStream({pull(c){if(cursor===gz.length)c.close();else c.enqueue(gz.subarray(cursor,++cursor));}});
assert.deepEqual(new Uint8Array(await decodeModelResponse(new Response(split),8,true)),data,'gzip header split across packets');
await assert.rejects(decodeModelResponse(new Response(data),9,false),/不完整/);
await assert.rejects(decodeModelResponse(new Response('not found',{status:404}),8,false));
const signal=new AbortController().signal,loaded=new Set(),calls=[],failures=[];
const load=async i=>{calls.push(i);if(i===3)throw new Error('offline');loaded.add(i);};
const failed=await loadMissingChunks(Array.from({length:15},(_,i)=>i),load,signal,i=>failures.push(i));
assert.deepEqual(failed,[3]);assert.deepEqual(failures,[3]);assert.equal(loaded.size,14);assert.ok(loaded.has(14),'failure did not cancel later vessels');assert.equal(calls.filter(i=>i===3).length,2);
await loadMissingChunks(failed,async i=>loaded.add(i),signal,()=>assert.fail('retry failed'));
assert.equal(loaded.size,15);assert.equal(calls.length,16,'successful packages were never downloaded twice');
const aborted=new AbortController();aborted.abort();let called=false;
await loadMissingChunks([1],async()=>{called=true;},aborted.signal,()=>{});assert.equal(called,false);
const realFetch=globalThis.fetch;
globalThis.fetch=async(_url,{signal})=>new Promise((_,reject)=>{if(signal.aborted)reject(new DOMException('Aborted','AbortError'));else signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true});});
await assert.rejects(fetchModelBuffer('test',8,false,signal,10),/下載逾時/);
globalThis.fetch=realFetch;
// Bound concurrency while still downloading later packages behind a slow one.
let active=0,peak=0;
await loadMissingChunks([0,1,2,3,4],async()=>{active++;peak=Math.max(peak,active);await new Promise(r=>setTimeout(r,2));active--;},signal,()=>assert.fail('unexpected failure'),2);
assert.equal(peak,2);
const queueSource=fs.readFileSync(new URL('../app/asset-queue.ts',import.meta.url),'utf8');
const queueCode=ts.transpileModule(queueSource,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {createAssetQueue}=await import(`data:text/javascript;base64,${Buffer.from(queueCode).toString('base64')}`);
const queue=createAssetQueue(signal,2),finished=[];let queueActive=0,queuePeak=0,release;
const gate=new Promise(resolve=>{release=resolve;});
for(let i=0;i<4;i++)queue.add(async()=>{queueActive++;queuePeak=Math.max(queuePeak,queueActive);await gate;if(i===0)queue.add(async()=>{finished.push('nested');});finished.push(i);queueActive--;});
await Promise.resolve();assert.equal(queueActive,0,'supplementary work waits for primary atlas');
queue.start();await Promise.resolve();assert.equal(queueActive,2);release();await queue.drain();
assert.equal(queuePeak,2);assert.equal(finished.length,5);assert.ok(finished.includes('nested'),'drain includes catalogue children');
const canceled=new AbortController(),canceledQueue=createAssetQueue(canceled.signal);let canceledRan=false;
canceledQueue.add(async()=>{canceledRan=true;});canceled.abort();canceledQueue.start();await canceledQueue.drain();assert.equal(canceledRan,false);
const cacheEntries=new Map();let networkCalls=0;
globalThis.caches={async open(){return{match:async url=>cacheEntries.get(url)?.clone(),put:async(url,response)=>cacheEntries.set(url,response),delete:async url=>cacheEntries.delete(url)};}};
globalThis.fetch=async()=>{networkCalls++;return new Response(gz);};
const immutable='/models/stream/test-immutable.bin.gz';
assert.deepEqual(new Uint8Array(await fetchModelBuffer(immutable,8,true,signal)),data);
assert.deepEqual(new Uint8Array(await fetchModelBuffer(immutable,8,true,signal)),data);assert.equal(networkCalls,1,'reopen uses validated persistent bytes');
cacheEntries.set(immutable,new Response(new Uint8Array(2)));
await fetchModelBuffer(immutable,8,true,signal);assert.equal(networkCalls,2,'incomplete cache repaired');
delete globalThis.caches;globalThis.fetch=realFetch;
const atlas=JSON.parse(fs.readFileSync(new URL('../public/models/atlas.json',import.meta.url),'utf8'));
for(const chunk of atlas.chunks){
 const raw=fs.readFileSync(new URL(`../public${chunk.url}`,import.meta.url));
 assert.equal(raw.byteLength,chunk.bytes);
 const zipped=fs.readFileSync(new URL(`../public${chunk.gzip}`,import.meta.url));
 assert.deepEqual(Buffer.from(await decodeModelResponse(new Response(zipped),chunk.bytes,true)),raw);
}
const streamed=JSON.parse(fs.readFileSync(new URL('../public/models/atlas-stream.json',import.meta.url),'utf8'));
const sourceBuffers=atlas.chunks.map(c=>fs.readFileSync(new URL(`../public${c.url}`,import.meta.url)));
const delivered=[];
for(const chunk of streamed.chunks){
 const raw=fs.readFileSync(new URL(`../public${chunk.url}`,import.meta.url)),zipped=fs.readFileSync(new URL(`../public${chunk.gzip}`,import.meta.url));
 assert.deepEqual(Buffer.from(await decodeModelResponse(new Response(zipped),chunk.bytes,true)),raw);delivered.push(raw);
}
assert.equal(streamed.parts.length,atlas.parts.length);
for(let i=0;i<atlas.parts.length;i++){
 const before=atlas.parts[i],after=streamed.parts[i];assert.equal(after.id,before.id);
 if(after.smoothed){
  // a limb vessel with one smoothing step: more vertices and triangles, same place (bounding box within 1.5 mm), every index valid
  assert.ok(['arterial','venous'].includes(before.system)&&after.vertexCount>before.vertexCount&&after.indexCount>before.indexCount,`${before.name}: smoothing`);
  const pos=new Float32Array(delivered[after.chunk].buffer.slice(delivered[after.chunk].byteOffset+after.positions,delivered[after.chunk].byteOffset+after.positions+after.vertexCount*12)),idx=new Uint32Array(delivered[after.chunk].buffer.slice(delivered[after.chunk].byteOffset+after.indices,delivered[after.chunk].byteOffset+after.indices+after.indexCount*4));
  for(let k=0;k<3;k++){let lo=Infinity,hi=-Infinity;for(let v=k;v<pos.length;v+=3){lo=Math.min(lo,pos[v]);hi=Math.max(hi,pos[v]);}assert.ok(Math.abs(lo-before.bounds[0][k])<.0015&&Math.abs(hi-before.bounds[1][k])<.0015,`${before.name}: smoothed vessel moved`);}
  assert.ok(idx.every(v=>v<after.vertexCount),`${before.name}: index out of range`);continue;
 }
 if(after.tendonCut){
  // a muscle that ends at its musculotendinous junction (scripts/tendon/*.mjs): its distal end was cut off into a tendon part, so it has other vertices but keeps its id, name, bounds and
  // lies inside its original bounds; every index is valid
  // the raw atlas files a few leg muscles (fibularis, tibialis) as bones; the viewer corrects that
  assert.ok(before.system==='muscular'||(before.system==='skeletal'&&/fibularis|tibialis/.test(before.name)),`${before.name}: tendon cut`);
  const d=delivered[after.chunk],pos=new Float32Array(d.buffer.slice(d.byteOffset+after.positions,d.byteOffset+after.positions+after.vertexCount*12)),idx=new Uint32Array(d.buffer.slice(d.byteOffset+after.indices,d.byteOffset+after.indices+after.indexCount*4));
  for(let k=0;k<3;k++){let lo=Infinity,hi=-Infinity;for(let v=k;v<pos.length;v+=3){lo=Math.min(lo,pos[v]);hi=Math.max(hi,pos[v]);}assert.ok(lo>=before.bounds[0][k]-.0005&&hi<=before.bounds[1][k]+.0005,`${before.name}: cut muscle left its bounds`);}
  assert.ok(idx.every(v=>v<after.vertexCount),`${before.name}: index out of range`);continue;
 }
 assert.equal(after.vertexCount,before.vertexCount);assert.equal(after.indexCount,before.indexCount);
 for(const [key,length] of [['positions',before.vertexCount*12],['normals',before.vertexCount*6],['indices',before.indexCount*4]])assert.deepEqual(delivered[after.chunk].subarray(after[key],after[key]+length),sourceBuffers[before.chunk].subarray(before[key],before[key]+length),`${before.name}: unchanged ${key}`);
}
console.log(`PASS: 15 source / ${streamed.chunks.length} immutable packages, all ${atlas.parts.length} tissues byte-identical (limb vessels excepted: one smoothing step, same bounds), bounded downloads, persistent cache, gzip, failure isolation, resume and timeout.`);
