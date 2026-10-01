/** Static hosts may serve .gz as a compressed response or as a gzip file.
 * Fetch already decodes Content-Encoding; inspect the payload to avoid decoding twice.
 */
export async function decodeModelResponse(response:Response,expectedBytes:number,compressed:boolean):Promise<ArrayBuffer>{
 if(!response.ok)throw new Error('An anatomy file could not be loaded.');
 // Peek at one network chunk, then decode the stream. Do not retain the
 // entire compressed file beside its decoded copy on memory-limited WebKit.
 let buffer:ArrayBuffer;
 if(compressed&&response.body){
  const reader=response.body.getReader();
  let prefix=new Uint8Array(0);
  while(prefix.length<2){const next=await reader.read();if(next.done)break;const joined=new Uint8Array(prefix.length+next.value.length);joined.set(prefix);joined.set(next.value,prefix.length);prefix=joined;}
  const gzip=prefix[0]===0x1f&&prefix[1]===0x8b;
  const stream=new ReadableStream<Uint8Array>({start(c){if(prefix.length)c.enqueue(prefix);},async pull(c){try{const next=await reader.read();if(next.done){reader.releaseLock();c.close();}else c.enqueue(next.value);}catch(e){c.error(e);}},cancel(reason){return reader.cancel(reason);}});
  const body=new Response(stream).body!;
  buffer=await new Response(gzip?body.pipeThrough(new DecompressionStream('gzip')):body).arrayBuffer();
 }else buffer=await response.arrayBuffer();
 if(expectedBytes>0&&buffer.byteLength!==expectedBytes)throw new Error('An anatomy file was incomplete. Please reload the viewer.');
 return buffer;
}

export async function fetchModelBuffer(url:string,expectedBytes:number,compressed:boolean,signal:AbortSignal,timeoutMs=60000):Promise<ArrayBuffer>{
 const controller=new AbortController();let timedOut=false;
 const cancel=()=>controller.abort(signal.reason);
 if(signal.aborted)cancel();else signal.addEventListener('abort',cancel,{once:true});
 const timer=setTimeout(()=>{timedOut=true;controller.abort();},timeoutMs);
 try{return await decodeModelResponse(await fetch(url,{signal:controller.signal}),expectedBytes,compressed);}
 catch(e){if(timedOut)throw new Error('下載逾時，正在保留已載入的組織。');throw e;}
 finally{clearTimeout(timer);signal.removeEventListener('abort',cancel);}
}

/** One failed package must not cancel the rest of the anatomy. A retry run
 * receives only missing packages, so successful geometry is never duplicated. */
export async function loadMissingChunks(indices:number[],load:(index:number)=>Promise<void>,signal:AbortSignal,onFailure:(index:number,error:unknown)=>void){
 const failed:number[]=[];
 for(const index of indices){
  if(signal.aborted)break;
  let error:unknown;
  for(let attempt=0;attempt<2;attempt++){
   try{await load(index);error=undefined;break;}
   catch(e){error=e;if(signal.aborted)break;}
  }
  if(error!==undefined&&!signal.aborted){failed.push(index);onFailure(index,error);}
 }
 return failed;
}
