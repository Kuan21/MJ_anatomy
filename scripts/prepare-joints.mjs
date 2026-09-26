// Pinned CC BY-SA joint anatomy, with a content check before each build.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const revision='8ca3b7421bcfbe88b85859eb1983d5cf79f21749';
const expected='a20651f8f3e550ae8ee51365f147c09da4f80080';
const target=new URL('../public/models/joints.glb',import.meta.url);
const hash=b=>createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');
let b;try{b=await readFile(target);}catch{}
if(!b||hash(b)!==expected){
 const r=await fetch(`https://raw.githubusercontent.com/nqwrc/3d-anatomy/${revision}/public/models/joints.glb`,{signal:AbortSignal.timeout(60000)});
 if(!r.ok)throw new Error(`Joint model download failed: ${r.status}`);
 b=Buffer.from(await r.arrayBuffer());if(hash(b)!==expected)throw new Error('Joint model checksum mismatch');await writeFile(target,b);
}
console.log(`Joint source verified: ${b.length} bytes`);

const {gunzipSync}=await import('node:zlib');
await writeFile(new URL('../public/models/articular-surfaces.json',import.meta.url),gunzipSync(await readFile(new URL('../public/models/articular-surfaces.json.gz',import.meta.url))));
