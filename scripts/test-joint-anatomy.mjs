import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import ts from 'typescript';
import * as T from 'three';
const root=new URL('../',import.meta.url),tmp=new URL('.sites-runtime/',root);
let src=await readFile(new URL('app/biomechanics-v2/joint-anatomy.ts',root),'utf8');
src=src.replace("import registrationData from './joint-registration.json';",`const registrationData=${await readFile(new URL('app/biomechanics-v2/joint-registration.json',root),'utf8')};`);
src=src.replace("'../mj-part-regions'","'./mj-part-regions.mjs'").replace("'./soft-tissue'","'./soft-tissue.mjs'").replace("'./body-motion'","'./body-motion.mjs'");
await writeFile(new URL('joint-anatomy.mjs',tmp),ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
const {createJointAnatomy,jointKind}=await import(new URL('joint-anatomy.mjs',tmp));
const {normalizeAtlasSystems}=await import(new URL('mj-system-classifier.mjs',tmp));
const motion=await import(new URL('mj-motion.mjs',tmp)),body=await import(new URL('body-motion.mjs',tmp));
const atlas=normalizeAtlasSystems(JSON.parse(await readFile(new URL('public/models/atlas.json',root),'utf8')));
const factory=createRequire(import.meta.url)(new URL('draco.cjs',tmp).pathname);
const draco=await factory({wasmBinary:await readFile(new URL('public/draco/draco_decoder.wasm',root))});
const b=await readFile(new URL('public/models/joints.glb',root)),n=b.readUInt32LE(12),j=JSON.parse(b.subarray(20,20+n)),bin=b.subarray(28+n);
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
  const mesh=new T.Mesh(g);mesh.name=node.name;mesh.userData=node.extras??{};mesh.matrixAutoUpdate=false;mesh.matrix.copy(matrix(i));source.add(mesh);
  for(const o of [values,faces,m,d,buf])draco.destroy(o);
 }
}
const scene=new T.Scene(),controller=createJointAnatomy(atlas,scene);controller.add(source);controller.addSurfaces(JSON.parse(await readFile(new URL('public/models/articular-surfaces.json',root),'utf8')));
const neutral={visible:['connective'],selected:[],explode:0,isolate:false,view:'front',rotate:false,reset:0,tissueMotion:true};
controller.update(neutral,0);
const rows=controller.rows;assert.ok(rows.length>200);
for(const r of rows){assert.deepEqual(r.mesh.geometry.attributes.position.array,r.base);assert.ok(r.mesh.visible);}
for(const side of ['left','right']){
 const suffix=side==='left'?'.l':'.r';
 const labrum=rows.find(r=>r.mesh.name==='Glenoid labrum'+suffix);assert.ok(labrum?.rigidId);assert.equal(labrum.region,'upper-limb');
 const meniscus=rows.find(r=>r.mesh.name==='Medial meniscus'+suffix);assert.ok(meniscus?.rigidId);assert.equal(meniscus.region,'lower-limb');
 const pose={...motion.NEUTRAL_POSE,shoulderFlexion:120,shoulderAbduction:100,elbowFlexion:140,wristFlexion:50,forearmRotation:78};
 const transforms=motion.buildUpperLimbMotion(atlas,side,pose).transforms;
 controller.update({...neutral,partTransforms:transforms},0);
 const t=transforms[labrum.rigidId],p=new T.Vector3(...labrum.base.slice(0,3)).applyQuaternion(new T.Quaternion(...t.quaternion)).add(new T.Vector3(...t.translation));
 assert.ok(p.distanceTo(new T.Vector3().fromBufferAttribute(labrum.mesh.geometry.attributes.position,0))<1e-6,'Labrum detached from scapula');
 for(const r of rows)assert.ok(r.mesh.geometry.attributes.position.array.every(Number.isFinite));
}
for(const region of ['head','spine','leftLeg','rightLeg']){
 const rig=body.makeBodyRig(atlas,region),pose={flexion:40,rotation:20,sideBend:15,knee:100,ankle:20},built=body.buildBodyMotion(rig,pose);
 controller.update({...neutral,partTransforms:built.transforms,bodyMotion:{region,pose}},0);
 for(const r of rows)assert.ok(r.mesh.geometry.attributes.position.array.every(Number.isFinite));
}
controller.update({...neutral,visible:[]},0);assert.ok(rows.every(r=>!r.mesh.visible));
controller.update({...neutral,isolate:true},0);assert.ok(rows.every(r=>!r.mesh.visible));
controller.update(neutral,1);assert.ok(rows.every(r=>!r.mesh.visible));
controller.update(neutral,0);for(const r of rows)assert.deepEqual(r.mesh.geometry.attributes.position.array,r.base);
assert.ok(controller.surfaces.length===178);
for(const s of controller.surfaces)assert.ok(s.mesh.visible);
controller.update({...neutral,jointSurfaces:false},0);assert.ok(controller.surfaces.every(s=>!s.mesh.visible));
const counts={};for(const r of rows){const kind=jointKind(r.mesh.name);counts[kind]=(counts[kind]??0)+1;}
await writeFile(new URL('joints-qa.json',tmp),JSON.stringify(rows.map(r=>({name:r.mesh.name,region:r.region,anchor:r.anchor.name,rigid:r.rigidId,vertices:[...r.base],indices:[...r.mesh.geometry.index.array]}))));
console.log(`${rows.length} source joint structures: ${JSON.stringify(counts)}; both shoulder rims anchored, four body regions finite, reset/layer/isolate/explode PASS`);
controller.dispose();
