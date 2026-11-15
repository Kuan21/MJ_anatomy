// Vendor the registered BodyParts3D 3.0 facial-muscle binary into the site.
// The viewer used to fetch one 16 MB uncompressed file from raw.githubusercontent.com
// after the head region opened. On a slow link that request hit the 60 s limit,
// the 47 facial pieces never arrived and the loading hint sat at 93 % (2,232/2,279).
// Here the pinned file is verified once, then repackaged losslessly into small,
// gzip-compressed, content-addressed packages served from the same origin, so they
// load in stages beside the rest of the atlas and are cached like every other package.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {readBone, refinePiece, REFINED_NAMES} from './lib/facial-refine.mjs';
import {download} from './lib/download.mjs';
const revision='c835665a9ade09ee0b993cee6eee1b25b7f7311b';
const sha256='7f24687034d706fc08830f617da35f77cb951cd77621a562fa064fa09d5a1b69';
const dir=new URL('../public/models/facial/',import.meta.url),out=new URL('../public/models/stream/',import.meta.url),cache=new URL('../work/',import.meta.url);
// The 16 MB source binary stays outside public/ so it is never published; only the compressed packages are.
fs.mkdirSync(cache,{recursive:true});
const source=new URL('facial.bin',cache),digest=b=>createHash('sha256').update(b).digest('hex');
let bytes;try{bytes=fs.readFileSync(source);}catch{}
// The pinned upstream (choxos/OMFAtlas) is gone (HTTP 404), so a copy with the same sha256 is kept in vendor/ (outside public/, never published); it is used before any download.
if(!bytes||digest(bytes)!==sha256){try{const kept=fs.readFileSync(new URL('../vendor/facial/facial.bin',import.meta.url));if(digest(kept)===sha256){bytes=kept;fs.writeFileSync(source,bytes);}}catch{}}
if(!bytes||digest(bytes)!==sha256){
 const url=`https://raw.githubusercontent.com/choxos/OMFAtlas/${revision}/public/models/facial/facial.bin`;
 bytes=await download(url,{label:'facial.bin',timeoutMs:120000});
 if(digest(bytes)!==sha256)throw new Error('facial.bin checksum mismatch');
 fs.writeFileSync(source,bytes);
}
const atlas=JSON.parse(fs.readFileSync(new URL('atlas.json',dir),'utf8'));
fs.mkdirSync(out,{recursive:true});
const chunks=[],parts=[];let slices=[],size=0;
const append=data=>{const padding=(4-size%4)%4;if(padding){slices.push(Buffer.alloc(padding));size+=padding;}const start=size;slices.push(data);size+=data.length;return start;};
const flush=()=>{
 if(!size)return;
 const data=Buffer.concat(slices),name=`facial-${digest(data).slice(0,20)}.bin`,gzip=gzipSync(data,{level:9});
 fs.writeFileSync(new URL(name,out),data);fs.writeFileSync(new URL(name+'.gz',out),gzip);
 chunks.push({url:'/models/stream/'+name,gzip:'/models/stream/'+name+'.gz',bytes:data.length,gzipBytes:gzip.length});slices=[];size=0;
};
// The two paired scalp muscles (frontalis, occipitalis) are reshaped here, at packaging time, by smooth edge warps that keep every vertex count and triangle (scripts/lib/facial-refine.mjs):
// the frontalis upper edge becomes one arc across the midline, the occipitalis lower edge is cut clean and its inner corner rounded. The source bytes stay pinned; the other 43 pieces are byte-identical.
const bones={frontal:readBone(new URL('../',dir),'FMA52734'),occipital:readBone(new URL('../',dir),'FMA52735')};
for(const part of atlas.parts){
 let positions=bytes.subarray(part.positions,part.positions+part.vertexCount*12),normals=bytes.subarray(part.normals,part.normals+part.vertexCount*6);const indices=bytes.subarray(part.indices,part.indices+part.indexCount*4);
 if(positions.length!==part.vertexCount*12||normals.length!==part.vertexCount*6||indices.length!==part.indexCount*4)throw new Error(`facial.bin is shorter than its catalogue: ${part.name}`);
 let bounds=part.bounds;
 if(REFINED_NAMES.includes(part.name)){
  const P=new Float32Array(positions.buffer.slice(positions.byteOffset,positions.byteOffset+positions.length)),I=new Uint32Array(indices.buffer.slice(indices.byteOffset,indices.byteOffset+indices.length));
  const refined=refinePiece(part.name,P,I,bones);
  positions=Buffer.from(refined.positions.buffer);normals=Buffer.from(refined.normals.buffer);
  bounds=[[Infinity,Infinity,Infinity],[-Infinity,-Infinity,-Infinity]];for(let i=0;i<refined.positions.length;i+=3)for(let k=0;k<3;k++){bounds[0][k]=Math.min(bounds[0][k],refined.positions[i+k]);bounds[1][k]=Math.max(bounds[1][k],refined.positions[i+k]);}
 }
 if(size&&size+positions.length+normals.length+indices.length>750000)flush();
 parts.push({...part,bounds,chunk:chunks.length,positions:append(positions),normals:append(normals),indices:append(indices)});
}
flush();
const manifest=Buffer.from(JSON.stringify({parts,chunks}));
fs.writeFileSync(new URL('facial-stream.json.gz',dir),gzipSync(manifest,{level:9}));
console.log(`Facial muscles verified (sha256 ${sha256.slice(0,12)}…): ${parts.length} pieces in ${chunks.length} packages, ${(chunks.reduce((n,c)=>n+c.gzipBytes,0)/1e6).toFixed(1)} MB compressed.`);
