// Lossless repackaging only: keep every tissue, vertex, normal and triangle.
// Small content-addressed packages produce an earlier useful frame and allow
// persistent caching without serving stale anatomy after a deployment.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
const dir=new URL('../public/models/',import.meta.url),out=new URL('stream/',dir);
fs.mkdirSync(out,{recursive:true});
const atlas=JSON.parse(fs.readFileSync(new URL('atlas.json',dir)));
const originals=atlas.chunks.map(c=>fs.readFileSync(new URL('../'+c.url.replace(/^\//,''),dir)));
const chunks=[];let slices=[],bytes=0;
const append=data=>{const padding=(4-bytes%4)%4;if(padding){slices.push(Buffer.alloc(padding));bytes+=padding;}const start=bytes;slices.push(data);bytes+=data.length;return start;};
const flush=()=>{
 if(!bytes)return;
 const data=Buffer.concat(slices),hash=createHash('sha256').update(data).digest('hex').slice(0,20),name=`body-${hash}.bin`,gzip=gzipSync(data,{level:9});
 fs.writeFileSync(new URL(name,out),data);fs.writeFileSync(new URL(name+'.gz',out),gzip);
 chunks.push({url:'/models/stream/'+name,gzip:'/models/stream/'+name+'.gz',bytes:data.length,gzipBytes:gzip.length});slices=[];bytes=0;
};
for(const part of atlas.parts){
 const source=originals[part.chunk],positions=source.subarray(part.positions,part.positions+part.vertexCount*12),normals=source.subarray(part.normals,part.normals+part.vertexCount*6),indices=source.subarray(part.indices,part.indices+part.indexCount*4);
 if(bytes&&bytes+positions.length+normals.length+indices.length>750000)flush();
 part.chunk=chunks.length;part.positions=append(positions);part.normals=append(normals);part.indices=append(indices);
}
flush();atlas.chunks=chunks;
const manifest=Buffer.from(JSON.stringify(atlas));
fs.writeFileSync(new URL('atlas-stream.json',dir),manifest);fs.writeFileSync(new URL('atlas-stream.json.gz',dir),gzipSync(manifest,{level:9}));
console.log(`Prepared ${chunks.length} immutable packages; ${atlas.parts.length} unchanged tissues, ${(chunks.reduce((sum,c)=>sum+c.gzipBytes,0)/1e6).toFixed(1)} MB compressed.`);
