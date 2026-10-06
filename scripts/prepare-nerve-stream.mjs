// Decode the original, licensed nerve meshes at build time, not in Safari.
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {Matrix4,Quaternion,Vector3} from 'three';
const root=new URL('../',import.meta.url),out=new URL('public/models/stream/',root);
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(new URL('.sites-runtime/',root),{recursive:true});
fs.copyFileSync(new URL('public/draco/draco_wasm_wrapper.js',root),new URL('.sites-runtime/nerve-draco.cjs',root));
const draco=await createRequire(import.meta.url)(new URL('.sites-runtime/nerve-draco.cjs',root).pathname)({wasmBinary:fs.readFileSync(new URL('public/draco/draco_decoder.wasm',root))});
const bytes=fs.readFileSync(new URL('public/models/nervous.glb',root)),n=bytes.readUInt32LE(12),gltf=JSON.parse(bytes.subarray(20,20+n)),bin=bytes.subarray(28+n);
const bindings={...JSON.parse(fs.readFileSync(new URL('app/biomechanics-v2/nerve-bindings.json',root))),...JSON.parse(fs.readFileSync(new URL('app/biomechanics-v2/body-nerve-bindings.json',root)))};
const parents=new Map(),world=[];gltf.nodes.forEach((node,i)=>(node.children??[]).forEach(c=>parents.set(c,i)));
function matrix(i){if(world[i])return world[i];const node=gltf.nodes[i],m=node.matrix?new Matrix4().fromArray(node.matrix):new Matrix4().compose(new Vector3(...(node.translation??[0,0,0])),new Quaternion(...(node.rotation??[0,0,0,1])),new Vector3(...(node.scale??[1,1,1])));return world[i]=parents.has(i)?matrix(parents.get(i)).clone().multiply(m):m;}
const chunks=[];let records=[],buffers=[],size=0,total=0;
function flush(){if(!records.length)return;const raw=Buffer.concat(buffers),hash=createHash('sha256').update(raw).digest('hex').slice(0,20),url=`/models/stream/nerves-${hash}.bin.gz`;fs.writeFileSync(new URL('public'+url,root),gzipSync(raw));chunks.push({url,bytes:raw.length,meshes:records});records=[];buffers=[];size=0;}
for(const [i,node] of gltf.nodes.entries()){
 if(node.mesh===undefined)continue;
 const ancestry=[];for(let p=parents.get(i);p!==undefined;p=parents.get(p))ancestry.push(gltf.nodes[p].name??'');
 const name=node.name??'',fullName=[name,...ancestry].join(' '),spinal=/spinal cord|medulla spinalis/i.test(fullName);
 if(!bindings[name]&&!spinal&&!/nerve|ganglion|plexus|ramus|rami/i.test(name))continue;
 if(ancestry.some(s=>/central nervous system/i.test(s))&&!spinal)continue;
 for(const primitive of gltf.meshes[node.mesh].primitives){
  const ext=primitive.extensions.KHR_draco_mesh_compression,view=gltf.bufferViews[ext.bufferView],decoder=new draco.Decoder(),buffer=new draco.DecoderBuffer(),mesh=new draco.Mesh();
  const data=bin.subarray(view.byteOffset??0,(view.byteOffset??0)+view.byteLength);buffer.Init(data,data.length);
  const status=decoder.DecodeBufferToMesh(buffer,mesh);if(!status.ok())throw Error(name+': '+status.error_msg());
  const values=new draco.DracoFloat32Array(),attribute=decoder.GetAttributeByUniqueId(mesh,ext.attributes.POSITION);
  decoder.GetAttributeFloatForAllPoints(mesh,attribute,values);
  const positions=new Float32Array(mesh.num_points()*3),v=new Vector3();
  for(let k=0;k<mesh.num_points();k++){v.set(values.GetValue(k*3),values.GetValue(k*3+1),values.GetValue(k*3+2)).applyMatrix4(matrix(i));positions.set(v.toArray(),k*3);}
  const indices=new Uint32Array(mesh.num_faces()*3),face=new draco.DracoInt32Array();
  for(let k=0;k<mesh.num_faces();k++){decoder.GetFaceFromMesh(mesh,k,face);for(let j=0;j<3;j++)indices[k*3+j]=face.GetValue(j);}
  if(size+positions.byteLength+indices.byteLength>384*1024)flush();
  records.push({name,ancestry:ancestry.join(' '),positions:size,vertexCount:positions.length/3,indices:size+positions.byteLength,indexCount:indices.length});
  buffers.push(Buffer.from(positions.buffer),Buffer.from(indices.buffer));size+=positions.byteLength+indices.byteLength;total++;
  for(const object of [face,values,mesh,decoder,buffer])draco.destroy(object);
 }
}
flush();
fs.writeFileSync(new URL('public/models/nerve-stream.json',root),JSON.stringify({source:'nervous.glb',sourceSha256:createHash('sha256').update(bytes).digest('hex'),meshCount:total,chunks}));
console.log(`Nerve stream: ${total} original meshes in ${chunks.length} independently retriable packages`);
