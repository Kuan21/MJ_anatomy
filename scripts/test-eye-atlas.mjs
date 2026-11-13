// Eye detail atlas package (public/models/eye/eye-atlas.*, built by scripts/build-eye-atlas.mjs) against its metadata (app/mj-eye-atlas.ts):
// every packaged part is described and the reverse, buffers are in range and inside their bounds, names are bilingual, and the
// registered globe sits on the body eyeball with the optic disc on the nasal side and the cornea in front. Prints counts only.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {quizModule} from './quiz-modules.mjs';
const {EYE_PARTS,EYE_LAYERS}=await quizModule('app/mj-eye-atlas.ts');
const dir=new URL('../public/models/eye/',import.meta.url);
const manifest=JSON.parse(fs.readFileSync(new URL('eye-atlas.json',dir))),bin=gunzipSync(fs.readFileSync(new URL('eye-atlas.bin.gz',dir)));
const problems=[],fail=m=>problems.push(m);
if(bin.length!==manifest.bytes)fail('binary size differs from the manifest');
const ids=new Set(manifest.parts.map(p=>p.id)),CJK=/[㐀-鿿]/;
for(const id of ids)if(!EYE_PARTS[id])fail(`${id}: packaged but not described`);
for(const [id,part] of Object.entries(EYE_PARTS)){
 if(!ids.has(id))fail(`${id}: described but not packaged`);
 if(!EYE_LAYERS[part.layer])fail(`${id}: unknown layer`);
 if(!part.name.trim()||/\b(left|right)\b|_|\.\d+$/i.test(part.name))fail(`${id}: English name`);
 if(!CJK.test(part.zh)||/[A-Za-z]/.test(part.zh))fail(`${id}: Chinese name`);
 if(part.text.length<30||!CJK.test(part.textZh)||part.textZh.length<12)fail(`${id}: description`);
}
const names=Object.values(EYE_PARTS).map(p=>p.name);
for(const n of new Set(names))if(names.filter(x=>x===n).length>1)fail(`duplicate name: ${n}`);
const box=id=>manifest.parts.find(p=>p.id===id)?.bounds,mid=b=>b[0].map((v,i)=>(v+b[1][i])/2);
for(const p of manifest.parts){
 if(p.positions%4||p.indices%4||p.normals%2||p.indexCount%3)fail(`${p.id}: misaligned buffers`);
 if(p.indices+p.indexCount*4>bin.length||p.normals+p.vertexCount*6>bin.length){fail(`${p.id}: buffers out of range`);continue;}
 const pos=new Float32Array(bin.buffer,bin.byteOffset+p.positions,p.vertexCount*3),idx=new Uint32Array(bin.buffer,bin.byteOffset+p.indices,p.indexCount);
 if(idx.some(i=>i>=p.vertexCount))fail(`${p.id}: index beyond vertices`);
 if(pos.some((v,i)=>!(v>=p.bounds[0][i%3]-1e-5&&v<=p.bounds[1][i%3]+1e-5)))fail(`${p.id}: vertex outside bounds`);
}
// Registration: the detailed globe shares the frame of the body orbit.
const g=manifest.globe,sclera=box('VH_M_sclera_L'),cornea=box('VH_M_cornea_L'),disc=box('VH_M_optic_disc_L'),fovea=box('VH_M_fovea_L'),nerve=box('FJ1313'),lateral=box('FJ1304'),medial=box('FJ1308');
if(!sclera||!cornea||!disc||!fovea||!nerve||!lateral||!medial)fail('registration landmarks missing');
else{
 if(Math.hypot(...mid(sclera).map((v,i)=>v-g.center[i]))>g.length*.12)fail('globe is not centred on the recorded globe frame');
 if(!(cornea[1][2]>sclera[1][2]-1e-4&&mid(cornea)[2]>mid(sclera)[2]))fail('cornea is not in front');
 const side=Math.sign(g.center[0]);
 if(!(Math.abs(mid(disc)[0])<Math.abs(mid(fovea)[0])))fail('optic disc is not nasal to the fovea');
 if(!((mid(medial)[0]-g.center[0])*side<0&&(mid(lateral)[0]-g.center[0])*side>0))fail('rectus muscles are not on their own sides of the globe');
 // The optic nerve reaches the back of the globe near the optic disc.
 const gap=[0,1,2].map(i=>Math.max(nerve[0][i]-disc[1][i],disc[0][i]-nerve[1][i],0));
 if(Math.hypot(...gap)>g.length*.15)fail('optic nerve does not meet the optic disc');
 const length=cornea[1][2]-sclera[0][2];if(Math.abs(length-g.length)>g.length*.02)fail('globe length differs from the body eyeball');
}
if(problems.length){console.error(`Eye atlas: ${problems.length} problem(s)`);for(const p of problems.slice(0,20))console.error(' - '+p);process.exit(1);}
console.log(`Eye atlas ok: ${manifest.parts.length} parts in ${EYE_LAYERS.length} layers, all described in English and Chinese; globe registered on the body orbit.`);
