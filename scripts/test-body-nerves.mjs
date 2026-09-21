// Run after test-soft-tissue.mjs, which prepares the isolated TS modules.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {Matrix4,Quaternion,Vector3,PropertyBinding} from 'three';
const root=new URL('../',import.meta.url),tmp=new URL('.sites-runtime/',root);
const soft=await import(new URL('soft-tissue.mjs',tmp)),motion=await import(new URL('mj-motion.mjs',tmp));
await writeFile(new URL('draco.cjs',tmp),await readFile(new URL('public/draco/draco_wasm_wrapper.js',root)));
const factory=createRequire(import.meta.url)(new URL('draco.cjs',tmp).pathname);
const draco=await factory({wasmBinary:await readFile(new URL('public/draco/draco_decoder.wasm',root))});
const bytes=await readFile(new URL('public/models/nervous.glb',root)),jsonLength=bytes.readUInt32LE(12),gltf=JSON.parse(bytes.subarray(20,20+jsonLength).toString()),bin=bytes.subarray(28+jsonLength);
const body=await import(new URL('body-motion.mjs',tmp)),bindings=JSON.parse(await readFile(new URL('app/biomechanics-v2/body-nerve-bindings.json',root),'utf8'));
const atlas=JSON.parse(await readFile(new URL('public/models/atlas.json',root),'utf8'));
const world=[],parents=new Map();gltf.nodes.forEach((n,i)=>(n.children??[]).forEach(c=>parents.set(c,i)));
function matrix(i){if(world[i])return world[i];const n=gltf.nodes[i],m=n.matrix?new Matrix4().fromArray(n.matrix):new Matrix4().compose(new Vector3(...(n.translation??[0,0,0])),new Quaternion(...(n.rotation??[0,0,0,1])),new Vector3(...(n.scale??[1,1,1])));return world[i]=parents.has(i)?matrix(parents.get(i)).clone().multiply(m):m;}
let count=0,vertices=0;
for(const [i,node] of gltf.nodes.entries()){
 const binding=bindings[node.name];if(!binding)continue;
 assert.notEqual(PropertyBinding.sanitizeNodeName(node.name),node.name,'Source names must not be confused with runtime names');
 const rig=body.makeBodyRig(atlas,binding),palette=body.buildBodyMotion(rig,{...body.BODY_NEUTRAL,flexion:25,rotation:20,knee:70,ankle:15}).palette;
 for(const primitive of gltf.meshes[node.mesh].primitives){
  const ext=primitive.extensions.KHR_draco_mesh_compression,view=gltf.bufferViews[ext.bufferView],buffer=new draco.DecoderBuffer(),decoder=new draco.Decoder(),mesh=new draco.Mesh();
  const data=bin.subarray(view.byteOffset??0,(view.byteOffset??0)+view.byteLength);buffer.Init(data,data.length);
  const status=decoder.DecodeBufferToMesh(buffer,mesh);assert.ok(status.ok(),node.name);
  const attribute=decoder.GetAttributeByUniqueId(mesh,ext.attributes.POSITION),values=new draco.DracoFloat32Array();decoder.GetAttributeFloatForAllPoints(mesh,attribute,values);
  const positions=new Float32Array(mesh.num_points()*3),v=new Vector3();for(let j=0;j<mesh.num_points();j++){v.set(values.GetValue(j*3),values.GetValue(j*3+1),values.GetValue(j*3+2)).applyMatrix4(matrix(i));positions.set(v.toArray(),j*3);}
  const skull=body.cranialNerveRigid(node.name),skin=body.bindBodyTissue(rig,positions,skull),output=new Float32Array(positions.length);soft.deformTissue(skin,positions,palette,output);assert.ok(output.every(Number.isFinite));
  if(skull&&binding==='head'){const m=body.buildBodyMotion(rig,{...body.BODY_NEUTRAL,flexion:25,rotation:20,knee:70,ankle:15}).matrices[8];for(let j=0;j<positions.length;j+=3)assert.ok(new Vector3(...positions.slice(j,j+3)).applyMatrix4(m).distanceTo(new Vector3(...output.slice(j,j+3)))<3e-7,'Facial nerve must follow skull');}
  const neutral=new Float32Array(positions.length);soft.deformTissue(skin,positions,body.buildBodyMotion(rig,body.BODY_NEUTRAL).palette,neutral);assert.deepEqual(neutral,positions);
  vertices+=mesh.num_points();for(const object of [values,mesh,decoder,buffer])draco.destroy(object);
 }
 count++;
}
assert.equal(count,Object.keys(bindings).length);
console.log(`${count} exact head/leg GLB nerve nodes, ${vertices.toLocaleString()} decoded vertices: source identity, compound motion, finite geometry and exact reset PASS`);
