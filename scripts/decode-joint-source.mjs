import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import ts from 'typescript';
import * as T from 'three';
const root=new URL('../',import.meta.url),tmp=new URL('.sites-runtime/',root);
await writeFile(new URL('draco.cjs',tmp),await readFile(new URL('public/draco/draco_wasm_wrapper.js',root)));
const factory=createRequire(import.meta.url)(new URL('draco.cjs',tmp).pathname);
const draco=await factory({wasmBinary:await readFile(new URL('public/draco/draco_decoder.wasm',root))});
const b=await readFile(new URL('.sites-runtime/joint-source/public/models/skeletal.glb',root)),n=b.readUInt32LE(12),j=JSON.parse(b.subarray(20,20+n)),bin=b.subarray(28+n);
const world=[],parents=new Map();j.nodes.forEach((n,i)=>(n.children??[]).forEach(c=>parents.set(c,i)));
function matrix(i){if(world[i])return world[i];const n=j.nodes[i],m=n.matrix?new T.Matrix4().fromArray(n.matrix):new T.Matrix4().compose(new T.Vector3(...(n.translation??[0,0,0])),new T.Quaternion(...(n.rotation??[0,0,0,1])),new T.Vector3(...(n.scale??[1,1,1])));return world[i]=parents.has(i)?matrix(parents.get(i)).clone().multiply(m):m;}
const source=new T.Group();
for(const [i,node] of j.nodes.entries())if(node.mesh!==undefined){
 for(const p of j.meshes[node.mesh].primitives){
  const ext=p.extensions.KHR_draco_mesh_compression,v=j.bufferViews[ext.bufferView],buf=new draco.DecoderBuffer(),d=new draco.Decoder(),m=new draco.Mesh();
  const bytes=bin.subarray(v.byteOffset??0,(v.byteOffset??0)+v.byteLength);buf.Init(bytes,bytes.length);assert.ok(d.DecodeBufferToMesh(buf,m).ok());
  const values=new draco.DracoFloat32Array();d.GetAttributeFloatForAllPoints(m,d.GetAttributeByUniqueId(m,ext.attributes.POSITION),values);
  const pos=Float32Array.from({length:m.num_points()*3},(_,i)=>values.GetValue(i)),faces=new draco.DracoInt32Array(),indices=[];
  for(let f=0;f<m.num_faces();f++){d.GetFaceFromMesh(m,f,faces);indices.push(faces.GetValue(0),faces.GetValue(1),faces.GetValue(2));}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setIndex(indices);
  const mesh=new T.Mesh(g);mesh.name=node.name;mesh.userData={...node.extras,material:j.materials[p.material]?.name};mesh.matrixAutoUpdate=false;mesh.matrix.copy(matrix(i));source.add(mesh);
  for(const o of [values,faces,m,d,buf])draco.destroy(o);
 }
}
await writeFile(new URL('source-bones.json',tmp),JSON.stringify(source.children.map(m=>({name:m.name,material:m.userData.material,indices:[...m.geometry.index.array],vertices:[...m.geometry.attributes.position.array].reduce((a,_,i,arr)=>{if(i%3===0)a.push(...new T.Vector3(...arr.slice(i,i+3)).applyMatrix4(m.matrix).toArray());return a;},[])}))));
