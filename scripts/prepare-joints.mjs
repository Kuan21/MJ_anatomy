// The joint tissues (public/models/joints.glb) are written from the official Z-Anatomy Joints100.fbx by scripts/extract-zanatomy-joints.mjs (CC BY-SA 4.0, BodyParts3D credit
// CC BY-SA 2.1 Japan) and committed; this step only checks that the committed file is the one the build expects. Nothing is downloaded.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const expected='9ad9285edf50755ba284a954ce98b2b94ceda412';
const target=new URL('../public/models/joints.glb',import.meta.url);
const hash=b=>createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');
let b;try{b=await readFile(target);}catch{}
if(!b)throw new Error('public/models/joints.glb is missing: it is committed with the repository (scripts/extract-zanatomy-joints.mjs writes it)');
if(hash(b)!==expected)throw new Error('Joint model checksum mismatch: public/models/joints.glb is not the file the build expects; rerun scripts/extract-zanatomy-joints.mjs and update the checksum');
console.log(`Joint source verified: ${b.length} bytes`);

const {gunzipSync}=await import('node:zlib');
await writeFile(new URL('../public/models/articular-surfaces.json',import.meta.url),gunzipSync(await readFile(new URL('../public/models/articular-surfaces.json.gz',import.meta.url))));

await writeFile(new URL('../public/models/neck-vessels.json',import.meta.url),gunzipSync(await readFile(new URL('../public/models/neck-vessels.json.gz',import.meta.url))));
