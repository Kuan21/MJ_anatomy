// Vendor the exact user-selected Brain Project asset into every site build.
// Fail the build if the model is missing or changes, rather than silently
// publishing a yellow substitute or requiring visitors to reach a CDN.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const revision='2929e94f521a8ddceab26bc100a98dc06b0da060';
const expected='c80dd62202b5cf8a2a43c7a019311781bd95457c';
const target=new URL('../public/models/brain.glb',import.meta.url);
const blobHash=b=>createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');
let bytes;try{bytes=await readFile(target);}catch{}
if(!bytes||blobHash(bytes)!==expected){
 const url=`https://raw.githubusercontent.com/itayinbarr/brainproject/${revision}/brain-atlas/models/brain.glb`;
 const response=await fetch(url,{signal:AbortSignal.timeout(60000)});
 if(!response.ok)throw new Error(`Brain Project download failed: ${response.status}`);
 bytes=Buffer.from(await response.arrayBuffer());
 if(blobHash(bytes)!==expected)throw new Error('Brain Project asset checksum mismatch');
 await mkdir(new URL('.',target),{recursive:true});await writeFile(target,bytes);
}
if(bytes.toString('utf8',0,4)!=='glTF'||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length)throw new Error('Invalid Brain Project GLB');
const json=JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12)));
const named=json.nodes.filter(n=>n.extras?.bx_label);
if(!named.some(n=>n.extras.bx_cat==='cortex')||!named.some(n=>/cerebell/i.test(n.extras.bx_cat+' '+n.extras.bx_label)))throw new Error('Brain Project anatomical metadata missing');
console.log(`Brain Project verified: ${bytes.length} bytes, ${named.length} labelled structures, git blob ${expected}`);
