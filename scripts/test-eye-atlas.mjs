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
// Fit of the orbit onto the globe: rectus insertions behind the corneal margin, nothing below the scleral surface, optic nerve on the disc.
{
 const P=id=>{const p=manifest.parts.find(x=>x.id===id);return new Float32Array(bin.buffer,bin.byteOffset+p.positions,p.vertexCount*3);};
 const C=g.center,BINS=[90,180],radius=new Float32Array(BINS[0]*BINS[1]);
 const bin2=(x,y,z)=>{const r=Math.hypot(x,y,z)||1,lat=Math.min(BINS[0]-1,Math.floor(Math.acos(Math.max(-1,Math.min(1,z/r)))/Math.PI*BINS[0])),lon=Math.min(BINS[1]-1,Math.floor((Math.atan2(y,x)+Math.PI)/(2*Math.PI)*BINS[1]));return lat*BINS[1]+lon;};
 for(const id of ['VH_M_sclera_L','VH_M_cornea_L']){const pos=P(id);for(let i=0;i<pos.length;i+=3){const x=pos[i]-C[0],y=pos[i+1]-C[1],z=pos[i+2]-C[2],b=bin2(x,y,z),r=Math.hypot(x,y,z);if(r>radius[b])radius[b]=r;}}
 const lim=P('VH_M_corneo_scleral_junction_L');let limbus=0;for(let i=0;i<lim.length;i+=3)limbus+=Math.atan2(Math.hypot(lim[i]-C[0],lim[i+1]-C[1]),lim[i+2]-C[2]);limbus/=lim.length/3;
 const insertion=id=>{const pos=P(id);let first=Infinity;for(let i=0;i<pos.length;i+=3){const x=pos[i]-C[0],y=pos[i+1]-C[1],z=pos[i+2]-C[2],rs=radius[bin2(x,y,z)];if(!rs||Math.hypot(x,y,z)-rs>.004)continue;first=Math.min(first,(Math.atan2(Math.hypot(x,y),z)-limbus)*rs);}return first*1000;};
 const want={FJ1308:5.5,FJ1295:6.5,FJ1304:6.9,FJ1323:7.7},got=Object.fromEntries(Object.keys(want).map(id=>[id,insertion(id)]));
 for(const [id,mm] of Object.entries(want))if(Math.abs(got[id]-mm)>.5)fail(`${id}: rectus insertion ${got[id].toFixed(1)} mm behind the corneal margin, expected ${mm}`);
 if(!(got.FJ1308<got.FJ1295&&got.FJ1295<got.FJ1304&&got.FJ1304<got.FJ1323))fail('rectus insertions are not in the order medial, inferior, lateral, superior');
 for(const id of ['FJ1323','FJ1295','FJ1308','FJ1304','FJ1322','FJ1294','FJ1306']){const pos=P(id);let below=0;for(let i=0;i<pos.length;i+=3){const x=pos[i]-C[0],y=pos[i+1]-C[1],z=pos[i+2]-C[2],rs=radius[bin2(x,y,z)];if(rs&&Math.hypot(x,y,z)<rs-.0001)below++;}if(below)fail(`${id}: ${below} vertices below the scleral surface`);}
 const on=P('FJ1313'),d=mid(disc);let near=Infinity;for(let i=0;i<on.length;i+=3)near=Math.min(near,Math.hypot(on[i]-d[0],on[i+1]-d[1],on[i+2]-d[2]));
 if(near>.0015)fail(`optic nerve ends ${(near*1000).toFixed(1)} mm from the optic disc`);
 // Obliques: the superior oblique reaches the globe behind the equator on the upper lateral side, the inferior oblique on the lower lateral side.
 const reach=(id)=>{const pos=P(id),sum=[0,0,0];let n=0;for(let i=0;i<pos.length;i+=3){const x=pos[i]-C[0],y=pos[i+1]-C[1],z=pos[i+2]-C[2],rs=radius[bin2(x,y,z)];if(!rs||Math.hypot(x,y,z)-rs>.001)continue;sum[0]+=x;sum[1]+=y;sum[2]+=z;n++;}return n?sum.map(v=>v/n):null;};// centre of the part lying on the globe
 const so=reach('FJ1322'),io=reach('FJ1294');
 if(!so||!(so[2]<0&&so[1]>0&&so[0]*Math.sign(C[0])>0))fail('superior oblique does not reach the upper lateral globe behind the equator');
 if(!io||!(io[2]<0&&io[1]<0&&io[0]*Math.sign(C[0])>0))fail('inferior oblique does not reach the lower lateral globe behind the equator');
}
if(problems.length){console.error(`Eye atlas: ${problems.length} problem(s)`);for(const p of problems.slice(0,20))console.error(' - '+p);process.exit(1);}
console.log(`Eye atlas ok: ${manifest.parts.length} parts in ${EYE_LAYERS.length} layers, all described in English and Chinese; globe registered on the body orbit; rectus insertions, oblique insertions, scleral clearance and optic nerve checked.`);
