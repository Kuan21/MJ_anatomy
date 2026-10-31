// Repackaging of the atlas into small content-addressed packages. Every tissue, vertex, normal and triangle is kept, except that limb vessels get one
// smoothing step (scripts/lib/mesh-smooth.mjs): the source simplification left them as 5- or 6-sided prisms.
// Small content-addressed packages produce an earlier useful frame and allow
// persistent caching without serving stale anatomy after a deployment.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {smoothTube} from './lib/mesh-smooth.mjs';
import {quizModule} from './quiz-modules.mjs';
import {planCuts} from './lib/tendon-set.mjs';
const {anatomicalRegion}=await quizModule('app/mj-part-regions.ts');
/** Limb vessels of a few thousand triangles or fewer: the arm and leg trees, not the aorta or the venae cavae. */
// Some motion data files are fitted to the exact source mesh (vertex count and position hash): a vessel named there must keep its source geometry.
const hashBound=new Set();
for(const f of fs.readdirSync(new URL('../app/biomechanics-v2/',import.meta.url)).filter(f=>f.endsWith('.json'))){
 const data=JSON.parse(fs.readFileSync(new URL('../app/biomechanics-v2/'+f,import.meta.url)));
 for(const [key,entry] of Object.entries(data.parts??{}))if(entry&&typeof entry==='object'&&'positionHash' in entry){hashBound.add(key);if(entry.name)hashBound.add(entry.name);}
}
const SMOOTH_MAX_TRIANGLES=3000,smoothed=part=>(part.system==='arterial'||part.system==='venous')&&part.indexCount/3<=SMOOTH_MAX_TRIANGLES&&['upper-limb','lower-limb'].includes(anatomicalRegion(part))&&!hashBound.has(part.id)&&!hashBound.has(part.name);
let smoothedParts=0,triangles=0;const skippedParts=[];
const dir=new URL('../public/models/',import.meta.url),out=new URL('stream/',dir);
fs.mkdirSync(out,{recursive:true});
const atlas=JSON.parse(fs.readFileSync(new URL('atlas.json',dir)));
const originals=atlas.chunks.map(c=>fs.readFileSync(new URL('../'+c.url.replace(/^\//,''),dir)));
// Tendons cut off their muscle (scripts/tendon/*.mjs): the muscle part keeps its id and name but ends at the musculotendinous junction; the tendon part is added by prepare-paokao.
// The muscle part keeps its original bounds (the motion binding fits the whole muscle, see app/biomechanics-v2/tendon-bindings.json).
const {finals:bellies}=planCuts(atlas.parts,part=>{const b=originals[part.chunk];return{positions:new Float32Array(b.buffer.slice(b.byteOffset+part.positions,b.byteOffset+part.positions+part.vertexCount*12)),indices:new Uint32Array(b.buffer.slice(b.byteOffset+part.indices,b.byteOffset+part.indices+part.indexCount*4))};});
let cutMuscles=0;
const chunks=[];let slices=[],bytes=0;
const append=data=>{const padding=(4-bytes%4)%4;if(padding){slices.push(Buffer.alloc(padding));bytes+=padding;}const start=bytes;slices.push(data);bytes+=data.length;return start;};
const flush=()=>{
 if(!bytes)return;
 const data=Buffer.concat(slices),hash=createHash('sha256').update(data).digest('hex').slice(0,20),name=`body-${hash}.bin`,gzip=gzipSync(data,{level:9});
 fs.writeFileSync(new URL(name,out),data);fs.writeFileSync(new URL(name+'.gz',out),gzip);
 chunks.push({url:'/models/stream/'+name,gzip:'/models/stream/'+name+'.gz',bytes:data.length,gzipBytes:gzip.length});slices=[];bytes=0;
};
for(const part of atlas.parts){
 const source=originals[part.chunk];let positions=source.subarray(part.positions,part.positions+part.vertexCount*12),normals=source.subarray(part.normals,part.normals+part.vertexCount*6),indices=source.subarray(part.indices,part.indices+part.indexCount*4);
 const belly=bellies.get(part.id);
 if(belly){positions=Buffer.from(belly.positions.buffer,belly.positions.byteOffset,belly.positions.byteLength);normals=Buffer.from(belly.normals.buffer,belly.normals.byteOffset,belly.normals.byteLength);indices=Buffer.from(belly.indices.buffer,belly.indices.byteOffset,belly.indices.byteLength);part.vertexCount=belly.positions.length/3;part.indexCount=belly.indices.length;part.tendonCut=true;cutMuscles++;}
 else if(smoothed(part)){
  const f32=new Float32Array(positions.buffer.slice(positions.byteOffset,positions.byteOffset+positions.length)),u32=new Uint32Array(indices.buffer.slice(indices.byteOffset,indices.byteOffset+indices.length));
  const m=smoothTube(f32,u32);
  // a vessel whose surface the step would move by more than 1.5 mm (odd or non-manifold source) stays as it is
  let drift=0;for(let k=0;k<3;k++){let lo=Infinity,hi=-Infinity;for(let v=k;v<m.positions.length;v+=3){lo=Math.min(lo,m.positions[v]);hi=Math.max(hi,m.positions[v]);}drift=Math.max(drift,Math.abs(lo-part.bounds[0][k]),Math.abs(hi-part.bounds[1][k]));}
  if(drift<.0015){positions=Buffer.from(m.positions.buffer);normals=Buffer.from(m.normals.buffer);indices=Buffer.from(m.indices.buffer);part.vertexCount=m.positions.length/3;part.indexCount=m.indices.length;part.smoothed=true;smoothedParts++;}
  else skippedParts.push(part.name);
 }
 triangles+=part.indexCount/3;
 if(bytes&&bytes+positions.length+normals.length+indices.length>750000)flush();
 part.chunk=chunks.length;part.positions=append(positions);part.normals=append(normals);part.indices=append(indices);
}
flush();atlas.chunks=chunks;atlas.triangles=triangles;atlas.smoothedVessels=smoothedParts;
const manifest=Buffer.from(JSON.stringify(atlas));
fs.writeFileSync(new URL('atlas-stream.json',dir),manifest);fs.writeFileSync(new URL('atlas-stream.json.gz',dir),gzipSync(manifest,{level:9}));
if(skippedParts.length)console.log(`Left unsmoothed (surface would move more than 1.5 mm): ${skippedParts.join(', ')}`);
console.log(`${cutMuscles} muscle parts end at their musculotendinous junction (tendon parts are added by prepare-paokao).`);
console.log(`Prepared ${chunks.length} immutable packages; ${atlas.parts.length} tissues (${smoothedParts} limb vessels smoothed, ${triangles} triangles), ${(chunks.reduce((sum,c)=>sum+c.gzipBytes,0)/1e6).toFixed(1)} MB compressed.`);
