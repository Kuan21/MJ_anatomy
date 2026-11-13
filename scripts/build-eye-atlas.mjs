// Builds the eye detail atlas package: one left orbit assembled from two CC BY 4.0 sources.
//   orbit   extraocular muscles, eyelid plates, lacrimal apparatus, nerves, ophthalmic artery, visual pathway and orbital bones,
//           copied unchanged from the packaged BodyParts3D atlas (public/models/atlas.json);
//   globe   the 23 layered structures of the Human Reference Atlas left eye (Visible Human male), simplified and registered onto
//           the BodyParts3D eyeball: same optical axis, same axial length, optic disc on the nasal side.
// Output: public/models/eye/eye-atlas.json and eye-atlas.bin.gz (Float32 positions, Int16 normals, Uint32 indices per part).
// The globe source is not kept in the repository (27 MB). Pass its path, or let the script download the pinned release:
//   node scripts/build-eye-atlas.mjs [path/to/3d-vh-m-eye-l.glb]
import fs from 'node:fs';
import crypto from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {MeshoptSimplifier} from 'meshoptimizer';
await MeshoptSimplifier.ready;

const GLOBE_URL='https://cdn.humanatlas.io/digital-objects/ref-organ/eye-male-left/v1.3/assets/3d-vh-m-eye-l.glb';
const GLOBE_SHA256='a918173575ed1b6dbf3d90344a144940b7f055590f40e119de0ad43abee50c64';
const models=new URL('../public/models/',import.meta.url),out=new URL('eye/',models);
const atlas=JSON.parse(fs.readFileSync(new URL('atlas.json',models)));

const ORBIT_IDS=[
 // extraocular muscles and their fascia
 'FJ1323','FJ1295','FJ1308','FJ1304','FJ1322','FJ1294','FJ1306','FJ1329','FJ1291','FJ1284','FJ1292',
 // eyelids and lacrimal apparatus
 'FJ1324','FJ1328','FJ1299','FJ1301','FJ1298','FJ1309','FJ1302',
 // orbital nerves
 'FJ1321','FJ1293','FJ1330','FJ1312','FJ1290','FJ1325','FJ1326','FJ1300','FJ1310','FJ1311','FJ1288','FJ1318','FJ1319','FJ1296','FJ1283','FJ1315',
 // ophthalmic artery
 'FJ1695M',
 // visual pathway
 'FJ1313','FJ1771','FJ1773','FJ1766','FJ1735','FJ1779',
 // bony orbit
 'FJ3200','FJ3287','FJ3269','FJ3265','FJ3199','FJ3394','FJ3273',
];
// Pieces of one structure that the source splits: packaged as a single selectable part under the first id.
const MERGE={FJ1771:['FJ1818']};// optic chiasm, left and right halves
// BodyParts3D eyeball: only used to place the detailed globe.
const BODY_SCLERA='FJ1317',BODY_CORNEA='FJ1289';

const chunks=new Map();
const chunk=i=>{if(!chunks.has(i))chunks.set(i,fs.readFileSync(new URL(atlas.chunks[i].url.split('/').pop(),models)));return chunks.get(i);};
const bodyPart=id=>{const p=atlas.parts.find(x=>x.id===id);if(!p)throw new Error('Missing atlas part '+id);return p;};
const segments=[],parts=[];let offset=0;
const push=array=>{const at=offset,b=Buffer.from(array.buffer,array.byteOffset,array.byteLength);segments.push(b);offset+=b.length;const pad=(4-offset%4)%4;if(pad){segments.push(Buffer.alloc(pad));offset+=pad;}return at;};
const boundsOf=pos=>{const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(let i=0;i<pos.length;i++){const a=i%3;if(pos[i]<lo[a])lo[a]=pos[i];if(pos[i]>hi[a])hi[a]=pos[i];}return [lo,hi];};
const add=(id,positions,normals,indices)=>parts.push({id,vertexCount:positions.length/3,indexCount:indices.length,bounds:boundsOf(positions),positions:push(positions),normals:push(normals),indices:push(indices)});

const read=id=>{
 const p=bodyPart(id),b=chunk(p.chunk);
 return {positions:new Float32Array(b.buffer.slice(b.byteOffset+p.positions,b.byteOffset+p.positions+p.vertexCount*12)),
  normals:new Int16Array(b.buffer.slice(b.byteOffset+p.normals,b.byteOffset+p.normals+p.vertexCount*6)),
  indices:new Uint32Array(b.buffer.slice(b.byteOffset+p.indices,b.byteOffset+p.indices+p.indexCount*4))};
};
for(const id of ORBIT_IDS){
 const pieces=[id,...(MERGE[id]??[])].map(read);
 if(pieces.length===1){add(id,pieces[0].positions,pieces[0].normals,pieces[0].indices);continue;}
 const count=pieces.reduce((n,p)=>n+p.positions.length,0),positions=new Float32Array(count),normals=new Int16Array(count),indices=new Uint32Array(pieces.reduce((n,p)=>n+p.indices.length,0));
 let v=0,i=0;
 for(const p of pieces){positions.set(p.positions,v);normals.set(p.normals,v);for(const x of p.indices)indices[i++]=x+v/3;v+=p.positions.length;}
 add(id,positions,normals,indices);
}

// ---- detailed globe
let glb;
if(process.argv[2])glb=fs.readFileSync(process.argv[2]);
else{const response=await fetch(GLOBE_URL);if(!response.ok)throw new Error('Globe download failed: '+response.status);glb=Buffer.from(await response.arrayBuffer());}
const sha=crypto.createHash('sha256').update(glb).digest('hex');
if(sha!==GLOBE_SHA256)throw new Error('Globe source differs from the pinned release (sha256 '+sha+')');
const jsonLength=glb.readUInt32LE(12),gltf=JSON.parse(glb.subarray(20,20+jsonLength).toString()),binary=glb.subarray(20+jsonLength+8);
if(gltf.extensionsRequired?.length)throw new Error('Unsupported glTF extensions: '+gltf.extensionsRequired);
const COMPONENT={5121:Uint8Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array};
const accessor=i=>{
 const a=gltf.accessors[i],view=gltf.bufferViews[a.bufferView],size={SCALAR:1,VEC3:3}[a.type],Type=COMPONENT[a.componentType];
 const stride=view.byteStride??size*Type.BYTES_PER_ELEMENT,start=(view.byteOffset??0)+(a.byteOffset??0),result=new Type(a.count*size);
 const data=new DataView(binary.buffer,binary.byteOffset+start,stride*(a.count-1)+size*Type.BYTES_PER_ELEMENT);
 const read={5121:(o)=>data.getUint8(o),5123:(o)=>data.getUint16(o,true),5125:(o)=>data.getUint32(o,true),5126:(o)=>data.getFloat32(o,true)}[a.componentType];
 for(let i=0;i<a.count;i++)for(let c=0;c<size;c++)result[i*size+c]=read(i*stride+c*Type.BYTES_PER_ELEMENT);
 return result;
};
const globe=[];
for(const node of gltf.nodes){
 if(node.mesh===undefined)continue;
 if(node.matrix||node.translation||node.rotation||node.scale)throw new Error('Unexpected node transform on '+node.name);
 const primitives=gltf.meshes[node.mesh].primitives;if(primitives.length!==1)throw new Error('Unexpected primitives on '+node.name);
 globe.push({name:node.name,positions:accessor(primitives[0].attributes.POSITION),indices:Uint32Array.from(accessor(primitives[0].indices))});
}
const boxCenter=([lo,hi])=>lo.map((v,i)=>(v+hi[i])/2);
const source=name=>{const g=globe.find(x=>x.name===name);if(!g)throw new Error('Globe source has no '+name);return boundsOf(g.positions);};
const sSclera=source('VH_M_sclera_L'),sCornea=source('VH_M_cornea_L'),sDisc=source('VH_M_optic_disc_L');
const bSclera=bodyPart(BODY_SCLERA).bounds,bCornea=bodyPart(BODY_CORNEA).bounds;
// Both models face +Z with +Y up, so registration is a uniform scale, an optional left-right mirror and a translation.
const sAxis=boxCenter(sCornea).map((v,i)=>v-boxCenter(sSclera)[i]),bAxis=boxCenter(bCornea).map((v,i)=>v-boxCenter(bSclera)[i]);
for(const axis of [sAxis,bAxis])if(axis[2]/Math.hypot(...axis)<.99)throw new Error('An eyeball does not face +Z; registration needs a rotation');
const sLength=sCornea[1][2]-sSclera[0][2],bLength=bCornea[1][2]-bSclera[0][2],scale=bLength/sLength;
const sCenter=[boxCenter(sSclera)[0],boxCenter(sSclera)[1],(sCornea[1][2]+sSclera[0][2])/2];
const bCenter=[boxCenter(bSclera)[0],boxCenter(bSclera)[1],(bCornea[1][2]+bSclera[0][2])/2];
// The optic disc lies on the nasal side: toward the midline (x = 0) in the body atlas.
const discSide=Math.sign(boxCenter(sDisc)[0]-sCenter[0]),nasal=-Math.sign(bCenter[0]),mirror=discSide===nasal?1:-1;
let globeTriangles=0,sourceTriangles=0;
for(const g of globe){
 // Weld coincident vertices, then simplify. Thin shells keep more of their triangles.
 const map=new Map(),remap=new Uint32Array(g.positions.length/3),welded=[];
 for(let i=0;i<remap.length;i++){const k=`${g.positions[i*3]},${g.positions[i*3+1]},${g.positions[i*3+2]}`;let n=map.get(k);if(n===undefined){n=welded.length/3;map.set(k,n);welded.push(g.positions[i*3],g.positions[i*3+1],g.positions[i*3+2]);}remap[i]=n;}
 const pos=new Float32Array(welded),indices=Uint32Array.from(g.indices,i=>remap[i]);
 const target=Math.max(600,Math.floor(Math.min(indices.length*.3,36000)/3)*3);
 const [simplified]=MeshoptSimplifier.simplify(indices,pos,3,Math.min(indices.length,target),.004);
 const [compact,count]=MeshoptSimplifier.compactMesh(simplified);
 const positions=new Float32Array(count*3);
 for(let old=0;old<compact.length;old++){const n=compact[old];if(n===0xffffffff)continue;
  positions[n*3]=(pos[old*3]-sCenter[0])*scale*mirror+bCenter[0];positions[n*3+1]=(pos[old*3+1]-sCenter[1])*scale+bCenter[1];positions[n*3+2]=(pos[old*3+2]-sCenter[2])*scale+bCenter[2];}
 if(mirror<0)for(let i=0;i<simplified.length;i+=3){const t=simplified[i+1];simplified[i+1]=simplified[i+2];simplified[i+2]=t;}
 // Area-weighted vertex normals.
 const sum=new Float64Array(count*3);
 for(let i=0;i<simplified.length;i+=3){
  const [a,b,c]=[simplified[i]*3,simplified[i+1]*3,simplified[i+2]*3];
  const ux=positions[b]-positions[a],uy=positions[b+1]-positions[a+1],uz=positions[b+2]-positions[a+2],vx=positions[c]-positions[a],vy=positions[c+1]-positions[a+1],vz=positions[c+2]-positions[a+2];
  const n=[uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx];
  for(const v of [a,b,c])for(let k=0;k<3;k++)sum[v+k]+=n[k];
 }
 const normals=new Int16Array(count*3);
 for(let i=0;i<sum.length;i+=3){const length=Math.hypot(sum[i],sum[i+1],sum[i+2])||1;for(let k=0;k<3;k++)normals[i+k]=Math.round(sum[i+k]/length*32767);}
 add(g.name,positions,normals,simplified);globeTriangles+=simplified.length/3;sourceTriangles+=g.indices.length/3;
}

const bin=Buffer.concat(segments),gz=gzipSync(bin,{level:9});
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(new URL('eye-atlas.bin.gz',out),gz);
const round=v=>+v.toFixed(6);
fs.writeFileSync(new URL('eye-atlas.json',out),JSON.stringify({
 side:'left',bytes:bin.length,gzip:'models/eye/eye-atlas.bin.gz',gzipBytes:gz.length,
 // Globe frame in package coordinates: centre, anterior direction of the optical axis and axial length.
 globe:{center:bCenter.map(round),axis:[0,0,1],length:round(bLength)},
 sources:{orbit:'BodyParts3D 4.0',globe:{name:'Human Reference Atlas, 3D Reference Object Library, eye-male-left v1.3',url:GLOBE_URL,sha256:GLOBE_SHA256,sourceTriangles,triangles:globeTriangles,scale:round(scale),mirrored:mirror<0}},
 parts,
}));
console.log(`eye-atlas: ${parts.length} parts (${ORBIT_IDS.length} orbit, ${globe.length} globe), globe ${sourceTriangles} -> ${globeTriangles} triangles, scale ${scale.toFixed(4)}, mirrored ${mirror<0}, ${(bin.length/1e6).toFixed(2)} MB (${(gz.length/1e6).toFixed(2)} MB gzip)`);
