import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import * as T from 'three';
const root=new URL('../',import.meta.url);
await writeFile('/tmp/zan/draco.cjs',await readFile(new URL('public/draco/draco_wasm_wrapper.js',root)));
const factory=createRequire(import.meta.url)('/tmp/zan/draco.cjs');
const draco=await factory({wasmBinary:await readFile(new URL('public/draco/draco_decoder.wasm',root))});
const b=await readFile('/tmp/zan/cardio.glb'),n=b.readUInt32LE(12),j=JSON.parse(b.subarray(20,20+n)),bin=b.subarray(28+n);
const world=[],parents=new Map();j.nodes.forEach((nd,i)=>(nd.children??[]).forEach(c=>parents.set(c,i)));
function matrix(i){if(world[i])return world[i];const nd=j.nodes[i],m=nd.matrix?new T.Matrix4().fromArray(nd.matrix):new T.Matrix4().compose(new T.Vector3(...(nd.translation??[0,0,0])),new T.Quaternion(...(nd.rotation??[0,0,0,1])),new T.Vector3(...(nd.scale??[1,1,1])));const p=parents.get(i);return world[i]=p===undefined?m:matrix(p).clone().multiply(m);}
const re=new RegExp(process.argv[2]??'heart|atrium|ventricle|valve|leaflet|papillary|coronary|cardiac|pulmonary trunk|aorta|aortic|pulmonary (artery|vein)|coronary sinus','i');
const out=[];
for(const [i,node] of j.nodes.entries()){
 if(node.mesh===undefined||!re.test(node.name)||/sinus\.|cavernous|petrosal|sagittal|intercavernous|occipital sinus|straight sinus|transverse sinus|sigmoid/i.test(node.name))continue;
 for(const p of j.meshes[node.mesh].primitives){
  const ext=p.extensions.KHR_draco_mesh_compression,v=j.bufferViews[ext.bufferView],buf=new draco.DecoderBuffer(),d=new draco.Decoder(),m=new draco.Mesh();
  const bytes=bin.subarray(v.byteOffset??0,(v.byteOffset??0)+v.byteLength);buf.Init(bytes,bytes.length);assert.ok(d.DecodeBufferToMesh(buf,m).ok());
  const values=new draco.DracoFloat32Array();d.GetAttributeFloatForAllPoints(m,d.GetAttributeByUniqueId(m,ext.attributes.POSITION),values);
  const pos=new Float32Array(m.num_points()*3);for(let k=0;k<pos.length;k++)pos[k]=values.GetValue(k);
  const faces=new draco.DracoInt32Array(),idx=[];for(let f=0;f<m.num_faces();f++){d.GetFaceFromMesh(m,f,faces);idx.push(faces.GetValue(0),faces.GetValue(1),faces.GetValue(2));}
  const mat=matrix(i);const v3=new T.Vector3();for(let k=0;k<pos.length;k+=3){v3.set(pos[k],pos[k+1],pos[k+2]).applyMatrix4(mat);pos[k]=v3.x;pos[k+1]=v3.y;pos[k+2]=v3.z;}
  out.push({name:node.name,material:j.materials[p.material]?.name,extras:node.extras,positions:Array.from(pos),indices:idx});
  for(const o of [values,faces,m,d,buf])draco.destroy(o);
 }
}
await writeFile('/tmp/zan/out/heart.json',JSON.stringify(out));
const bb=new T.Box3();for(const m of out){for(let k=0;k<m.positions.length;k+=3)bb.expandByPoint(new T.Vector3(m.positions[k],m.positions[k+1],m.positions[k+2]));}
console.log(out.length,'meshes; bbox',bb.min.toArray().map(v=>v.toFixed(3)),bb.max.toArray().map(v=>v.toFixed(3)));
