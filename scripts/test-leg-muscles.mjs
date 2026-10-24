// Hip flexion 120° and knee flexion 130°: leg muscles keep their attachments on their bones and their material cells across the
// bend. Compares the viewer's solver against plain dual-quaternion skinning (the previous behaviour) on the same poses.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {runnerImport} from 'vite';
const root=fileURLToPath(new URL('../',import.meta.url)),load=async f=>(await runnerImport(root+f)).module;
const [worker,body,soft,partRules,solverModule]=await Promise.all(['app/biomechanics-v2/shoulder-worker.ts','app/biomechanics-v2/body-motion.ts','app/biomechanics-v2/soft-tissue.ts','app/biomechanics-v2/body-part.ts','app/biomechanics-v2/shoulder-muscles.ts'].map(load));
const {normalizeAtlasSystems}=await load('app/mj-system-classifier.ts');
const atlas=normalizeAtlasSystems(JSON.parse(fs.readFileSync(root+'public/models/atlas.json','utf8')));
const buffers=new Map(),chunk=i=>{if(!buffers.has(i))buffers.set(i,fs.readFileSync(root+'public'+atlas.chunks[i].url));return buffers.get(i);};
const view=(p,T,o,c)=>{const b=chunk(p.chunk);return new T(b.buffer.slice(b.byteOffset+o,b.byteOffset+o+c*T.BYTES_PER_ELEMENT));};
assert.deepEqual([...body.BODY_LIMITS.leg.flexion],[-20,120]);assert.deepEqual([...body.BODY_LIMITS.leg.knee],[0,130]);
const clamped=body.buildBodyMotion(body.makeBodyRig(atlas,'leftLeg'),{...body.BODY_NEUTRAL,flexion:200,knee:200}).pose;assert.equal(clamped.flexion,120);assert.equal(clamped.knee,130);
// Signed volume of a muscle's surface about the hip joint: the quantity the solver keeps constant (the meshes are not watertight, so it is a
// consistent pseudo-volume rather than the true tissue volume, which is all that is needed to compare a pose with the rest shape).
const volumeOf=(positions,triangles,centre)=>solverModule.muscleVolume(positions,triangles,centre);
// Collars: both ends of every leg muscle are weighted onto the bone they attach to.
{
 const rig=body.makeBodyRig(atlas,'leftLeg');let checked=0;
 for(const part of atlas.parts){
  if(part.system!=='muscular'||!partRules.bodyPartRule(part,rig))continue;
  const base=view(part,Float32Array,part.positions,part.vertexCount*3),skin=body.bindBodyTissue(rig,base,false,part),a=body.legMuscleAnchors(rig,part);
  let top=0,bottom=0;
  for(let i=0;i<part.vertexCount;i++){
   let sum=0;for(let k=0;k<4;k++)sum+=skin.weights[i*4+k];assert.ok(Math.abs(sum-1)<1e-5,`${part.name} partition of unity`);
   const y=base[i*3+1],big=[0,1,2,3].reduce((m,k)=>skin.weights[i*4+k]>skin.weights[i*4+m]?k:m,0),dominant=skin.indices[i*4+big],w=skin.weights[i*4+big];
   if(y>=a.top-2.5e-3&&w>=.995){assert.equal(dominant,a.origin,`${part.name}: origin collar on frame ${a.origin}`);top++;}
   if(y<=a.bottom+2.5e-3&&w>=.995){assert.equal(dominant,a.insertion,`${part.name}: insertion collar on frame ${a.insertion}`);bottom++;}
  }
  assert.ok(top>0&&bottom>0,`${part.name}: has attachment collars at both ends (${top}/${bottom})`);checked++;
 }
 assert.ok(checked>45,`leg muscles with collars: ${checked}`);
}
const report=[];
for(const [region,label,pose] of [['leftLeg','hip flexion 120',{flexion:120}],['rightLeg','hip flexion 120',{flexion:120}],['leftLeg','knee flexion 130',{knee:130}],['leftLeg','hip 120 + knee 130',{flexion:120,knee:130}]]){
 const rig=body.makeBodyRig(atlas,region),inputs=[];
 for(const part of atlas.parts){
  if(part.system!=='muscular'||!partRules.bodyPartRule(part,rig))continue;
  inputs.push({part,base:view(part,Float32Array,part.positions,part.vertexCount*3),normals:view(part,Int16Array,part.normals,part.vertexCount*3),triangles:view(part,Uint32Array,part.indices,part.indexCount)});
 }
 assert.ok(inputs.length>40,`${region}: leg muscles found (${inputs.length})`);
 const solve=worker.createBodySolver(atlas),results=new Map(solve(inputs.map(i=>({...i,base:i.base.slice(),normals:i.normals.slice(),triangles:i.triangles.slice()})),{region,pose:{...body.BODY_NEUTRAL,...pose}}).map(r=>[r.id,r]));
 const palette=body.buildBodyMotion(rig,{...body.BODY_NEUTRAL,...pose}).palette;
 let pinned=0,worstPlain=0,worstSolved=0,counted=0,squashedPlain=0,squashedSolved=0;
 for(const input of inputs){
  const {part,base,triangles}=input,skin=body.bindBodyTissue(rig,base,false,part),plain=new Float32Array(base.length);soft.deformTissue(skin,base,palette,plain);
  const solved=results.get(part.id)?.positions;assert.ok(solved&&solved.every(Number.isFinite),`solved: ${part.name}`);
  const rest=volumeOf(base,triangles,rig.pivots[1]),vPlain=volumeOf(plain,triangles,rig.pivots[1])/rest,vSolved=volumeOf(solved,triangles,rig.pivots[1])/rest;
  worstPlain=Math.max(worstPlain,Math.abs(vPlain-1));worstSolved=Math.max(worstSolved,Math.abs(vSolved-1));counted++;if(Math.abs(vPlain-1)>.1)squashedPlain++;if(Math.abs(vSolved-1)>.1)squashedSolved++;
  assert.ok(Math.abs(vSolved-1)<=.06,`${part.name} (${label}): volume ${(vSolved*100).toFixed(0)} % of rest after solving (skinning alone ${(vPlain*100).toFixed(0)} %)`);
  for(let i=0;i<base.length/3;i++)if(Math.max(...skin.weights.subarray(i*4,i*4+4))>=.995){pinned++;for(let k=0;k<3;k++)assert.ok(Math.abs(solved[i*3+k]-plain[i*3+k])<1e-6,`${part.name} collar vertex ${i} must stay on its bone`);}
 }
 assert.ok(pinned>200,'attachment collars exist');
 const neutral=new Map(solve([],{region,pose:{...body.BODY_NEUTRAL}}).map(r=>[r.id,r]));
 for(const input of inputs)assert.deepEqual([...neutral.get(input.part.id).positions],[...input.base],`${input.part.name} neutral reset`);
 assert.ok(squashedSolved===0,`${region} ${label}: ${squashedSolved} muscles still change volume by more than 10 %`);
 report.push(`${region} ${label}: ${counted} muscles, worst volume change ${(worstPlain*100).toFixed(0)} % with skinning alone → ${(worstSolved*100).toFixed(1)} % solved (${squashedPlain} muscles beyond ±10 % → ${squashedSolved})`);
}
console.log('PASS leg muscles: '+report.join('; ')+'.');
