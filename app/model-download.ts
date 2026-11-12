/** Static hosts may serve .gz as a compressed response or as a gzip file.
 * Fetch already decodes Content-Encoding; inspect the payload to avoid decoding twice.
 * `onData` is called for every network chunk so the caller can measure stalls instead of total time.
 */
export async function decodeModelResponse(response:Response,expectedBytes:number,compressed:boolean,onData?:()=>void):Promise<ArrayBuffer>{
 if(!response.ok)throw new Error('解剖資料檔載入失敗。');
 // Peek at one network chunk, then decode the stream. Do not retain the
 // entire compressed file beside its decoded copy on memory-limited WebKit.
 let buffer:ArrayBuffer;
 // Every body is read chunk by chunk (also uncompressed ones) so onData sees the transfer progress.
 if(response.body){
  const reader=response.body.getReader();
  let prefix=new Uint8Array(0);
  while(prefix.length<2){const next=await reader.read();if(next.done)break;onData?.();const joined=new Uint8Array(prefix.length+next.value.length);joined.set(prefix);joined.set(next.value,prefix.length);prefix=joined;}
  const gzip=compressed&&prefix[0]===0x1f&&prefix[1]===0x8b;
  const stream=new ReadableStream<Uint8Array>({start(c){if(prefix.length)c.enqueue(prefix);},async pull(c){try{const next=await reader.read();if(next.done){reader.releaseLock();c.close();}else{onData?.();c.enqueue(next.value);}}catch(e){c.error(e);}},cancel(reason){return reader.cancel(reason);}});
  const body=new Response(stream).body!;
  if(gzip&&typeof DecompressionStream==='undefined'){
   // Safari before 16.4 and Firefox before 113 have no DecompressionStream: inflate in script instead of failing the whole atlas.
   const {gunzipSync}=await import('fflate');
   const raw=new Uint8Array(await new Response(body).arrayBuffer()),out=gunzipSync(raw);
   buffer=out.buffer.slice(out.byteOffset,out.byteOffset+out.byteLength) as ArrayBuffer;
  }else buffer=await new Response(gzip?body.pipeThrough(new DecompressionStream('gzip')):body).arrayBuffer();
 }else buffer=await response.arrayBuffer();
 if(expectedBytes>0&&buffer.byteLength!==expectedBytes)throw new Error('解剖資料檔不完整，請重新載入檢視器。');
 return buffer;
}

const CACHE_NAME='mj-anatomy-models-v1';
/** Drop cached packages that no catalogue of this build refers to, so a new deployment does not grow the Cache Storage by another full atlas. */
export async function pruneModelCache(keep:Iterable<string>){
 if(typeof caches==='undefined')return 0;
 try{
  const cache=await caches.open(CACHE_NAME),wanted=new Set([...keep].map(u=>new URL(u,location.href).href));
  let removed=0;
  for(const request of await cache.keys())if(!wanted.has(request.url)){await cache.delete(request);removed++;}
  return removed;
 }catch{return 0;}
}

/** `stallMs`: the download fails when no data arrives for this long (not when the whole transfer takes long: a slow connection still finishes). */
export async function fetchModelBuffer(url:string,expectedBytes:number,compressed:boolean,signal:AbortSignal,stallMs=60000):Promise<ArrayBuffer>{
 if(signal.aborted)throw signal.reason??new DOMException('Aborted','AbortError');
 // Only immutable, content-addressed assets enter this cache. Catalogue and
 // mutable legacy URLs always use HTTP so a deployment can update them.
 let cache:Cache|undefined;
 if(expectedBytes>0&&url.includes('/models/stream/')&&typeof caches!=='undefined'){
  try{cache=await caches.open(CACHE_NAME);const hit=await cache.match(url);if(hit){const data=await hit.arrayBuffer();if(data.byteLength===expectedBytes)return data;await cache.delete(url);}}catch{cache=undefined;}
 }
 const controller=new AbortController();let timedOut=false;
 const cancel=()=>controller.abort(signal.reason);
 if(signal.aborted)cancel();else signal.addEventListener('abort',cancel,{once:true});
 let timer=setTimeout(()=>{timedOut=true;controller.abort();},stallMs);
 const touch=()=>{clearTimeout(timer);timer=setTimeout(()=>{timedOut=true;controller.abort();},stallMs);};
 try{
  // The abort also settles the decode: a body read that ignores the signal (some polyfills, test doubles) must not hang forever.
  const aborted=new Promise<never>((_,reject)=>controller.signal.addEventListener('abort',()=>reject(controller.signal.reason??new DOMException('Aborted','AbortError')),{once:true}));
  const response=await Promise.race([fetch(url,{signal:controller.signal}),aborted]);touch();
  const data=await Promise.race([decodeModelResponse(response,expectedBytes,compressed,touch),aborted]);
  // Persist the validated decoded bytes. Safari can reopen without repeating
  // the network transfer or gzip work; quota/private-mode failures are benign.
  if(cache&&!signal.aborted)try{await cache.put(url,new Response(data));}catch{ /* HTTP loading still succeeded. */ }
  return data;
 }
 catch(e){if(timedOut)throw new Error(`下載逾時（${Math.round(stallMs/1000)} 秒沒有收到資料），正在保留已載入的組織。`);throw e;}
 finally{clearTimeout(timer);signal.removeEventListener('abort',cancel);}
}

/** One failed package must not cancel the rest of the anatomy. A retry run
 * receives only missing packages, so successful geometry is never duplicated. */
export async function loadMissingChunks(indices:number[],load:(index:number)=>Promise<void>,signal:AbortSignal,onFailure:(index:number,error:unknown)=>void,concurrency=2){
 const failed:number[]=[];let cursor=0;
 const worker=async()=>{while(cursor<indices.length){
  if(signal.aborted)break;
  const index=indices[cursor++];
  let error:unknown;
  for(let attempt=0;attempt<2;attempt++){
   try{await load(index);error=undefined;break;}
   catch(e){error=e;if(signal.aborted)break;}
  }
  if(error!==undefined&&!signal.aborted){failed.push(index);onFailure(index,error);}
 }};
 await Promise.all(Array.from({length:Math.min(indices.length,Math.max(1,concurrency))},worker));
 return indices.filter(index=>failed.includes(index));
}
