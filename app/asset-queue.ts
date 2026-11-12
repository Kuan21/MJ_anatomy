/** Bounded, deferred downloads. drain includes jobs enqueued by catalogue jobs. */
export function createAssetQueue(signal:AbortSignal,concurrency=2){
 const waiting:(()=>Promise<void>)[]=[];
 const waiters:{resolve:()=>void;reject:(error:unknown)=>void}[]=[];
 let started=false,active=0,error:unknown;
 const finish=()=>{if(active||waiting.length)return;for(const w of waiters.splice(0))error===undefined?w.resolve():w.reject(error);};
 const pump=()=>{
  if(signal.aborted)waiting.length=0;
  while(started&&!signal.aborted&&active<Math.max(1,concurrency)&&waiting.length){
   const job=waiting.shift()!;active++;
   Promise.resolve().then(job).catch(e=>{error??=e;}).finally(()=>{active--;pump();});
  }
  finish();
 };
 signal.addEventListener('abort',pump,{once:true});
 return{
  add(job:()=>Promise<void>){if(signal.aborted)return;waiting.push(job);pump();},
  start(){started=true;pump();},
  drain(){return new Promise<void>((resolve,reject)=>{waiters.push({resolve,reject});pump();});}
 };
}
