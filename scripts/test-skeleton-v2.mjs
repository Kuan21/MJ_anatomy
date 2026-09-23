import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile,rm} from 'node:fs/promises';
import ts from 'typescript';
import {Matrix4,Quaternion,Vector3} from 'three';
const root=new URL('../',import.meta.url);
const source=await readFile(new URL('app/biomechanics-v2/skeleton.ts',root),'utf8');
const bindings=await readFile(new URL('app/biomechanics-v2/bone-bindings.json',root),'utf8');
const js=ts.transpileModule(source.replace("import bindings from './bone-bindings.json';",`const bindings=${bindings};`),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
await mkdir(new URL('.sites-runtime/',root),{recursive:true});
const temp=new URL('.sites-runtime/skeleton-test.mjs',root);await writeFile(temp,js);
try{
 const {createSkeletonRig,evaluateSkeleton}=await import(temp.href);
 const atlas=JSON.parse(await readFile(new URL('public/models/atlas.json',root),'utf8'));
 const matrix=t=>new Matrix4().compose(new Vector3(...t.translation),new Quaternion(...t.quaternion),new Vector3(1,1,1));
 const close=(a,b)=>assert.ok(a.elements.every((v,i)=>Math.abs(v-b.elements[i])<1e-10),'matrix mismatch');
 for(const side of ['left','right']){
  const rig=createSkeletonRig(atlas,side);assert.equal(rig.valid,true);assert.equal(rig.nodes.length,8);
  const neutral=evaluateSkeleton(rig);assert.equal(Object.keys(neutral.transforms).length,32);
  for(const [id,t] of Object.entries(neutral.transforms)){
   close(matrix(t),new Matrix4());const p=atlas.parts.find(p=>p.id===id);
   assert.ok(p.name.toLowerCase().includes(side));assert.ok(!/toe|muscle|nerve|artery|vein/i.test(p.name));
  }
  const q1=new Quaternion().setFromAxisAngle(new Vector3(0,0,1),.21),q2=new Quaternion().setFromAxisAngle(new Vector3(1,0,0),-.13);
  const result=evaluateSkeleton(rig,{humerus:q1,ulna:q2});
  const hum=rig.nodes.find(n=>n.id==='humerus'),elbow=rig.nodes.find(n=>n.id==='ulna');
  const hm=matrix(result.transforms[hum.partIds[0]]),em=matrix(result.transforms[elbow.partIds[0]]);
  assert.ok(elbow.pivot.clone().applyMatrix4(hm).distanceTo(elbow.pivot.clone().applyMatrix4(em))<1e-10,'elbow pivot disconnected');
  for(const n of rig.nodes.filter(n=>['radius','carpus','hand'].includes(n.id)))for(const id of n.partIds)close(matrix(result.transforms[id]),em);
  const radial=evaluateSkeleton(rig,{radius:q1});
  close(matrix(radial.transforms[elbow.partIds[0]]),new Matrix4());
  const radius=rig.nodes.find(n=>n.id==='radius');
  for(const n of rig.nodes.filter(n=>['carpus','hand'].includes(n.id)))for(const id of n.partIds)close(matrix(radial.transforms[id]),matrix(radial.transforms[radius.partIds[0]]));
  for(const t of Object.values(result.transforms)){assert.ok(!('anchorTranslation' in t));assert.ok(Math.abs(matrix(t).determinant()-1)<1e-10);}
  for(let i=0;i<100;i++)evaluateSkeleton(rig,{humerus:q1});
  for(const t of Object.values(evaluateSkeleton(rig).transforms))close(matrix(t),new Matrix4());
  const broken=createSkeletonRig({...atlas,parts:atlas.parts.filter(p=>p.id!==hum.partIds[0])},side);assert.equal(broken.valid,false);assert.deepEqual(evaluateSkeleton(broken).transforms,{});
  assert.throws(()=>evaluateSkeleton(rig,{humerus:new Quaternion(NaN,0,0,1)}));
  console.log(`${side}: 32 exact bindings, bind identity, parent composition, pivot continuity, radius isolation, rigid-only output, drift-free reset, fail-closed mapping PASS`);
 }
}finally{await rm(temp);}
