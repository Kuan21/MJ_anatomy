import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import ts from 'typescript';
import {Vector3} from 'three';
const root=new URL('../',import.meta.url),tmp=new URL('.sites-runtime/',root);
// Run test-soft-tissue.mjs first to compile the shared motion modules.
for(const name of ['surface-constraints','shoulder-muscles']){
 let source=await readFile(new URL(`app/biomechanics-v2/${name}.ts`,root),'utf8');
 source=source.replace("from './surface-constraints'","from './surface-constraints.mjs'");
 await writeFile(new URL(`${name}.mjs`,tmp),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
}
const muscles=await import(new URL('shoulder-muscles.mjs',tmp)),soft=await import(new URL('soft-tissue.mjs',tmp)),motion=await import(new URL('mj-motion.mjs',tmp));
// Longitudinal behaviour belongs to the attachments, not world X or Y.
{
 const base=new Float32Array([0,0,0,.02,.04,.01,.01,.01,.02,-.01,.02,.01]);
 const rotated=base.slice();for(let i=0;i<base.length;i+=3){rotated[i]=-base[i+1];rotated[i+1]=base[i];}
 const skin={profile:'cuff',indices:new Uint8Array([2,0,0,0,3,0,0,0,2,3,0,0,2,3,0,0]),weights:new Float32Array([1,0,0,0,1,0,0,0,.5,.5,0,0,.5,.5,0,0])};
 const make=p=>muscles.makeShoulderMuscles([{base:p,positions:p.slice(),skin,triangles:new Uint32Array([0,2,1,0,1,3,0,3,2,1,2,3])}],new Vector3(),0).muscles[0];
 const a=make(base),b=make(rotated);
 assert.deepEqual(a.links,b.links);
 for(let i=0;i<a.axial.length;i++)assert.ok(Math.abs(a.axial[i]-b.axial[i])<1e-6,'Fibre direction changed under rigid coordinate rotation');
 assert.ok(a.axial.some(v=>v>.999),'Attachment-to-attachment link must be longitudinal');
 console.log('Attachment-derived strain: rigid-coordinate rotation invariance PASS');
}
const raw=JSON.parse(await readFile(new URL('public/models/atlas.json',root),'utf8'));
const {normalizeAtlasSystems}=await import(new URL('mj-system-classifier.mjs',tmp));
const atlas=normalizeAtlasSystems(raw),landmarks=JSON.parse(await readFile(new URL('app/biomechanics-v2/shoulder-landmarks.json',root),'utf8'));
const buffers=await Promise.all(atlas.chunks.map(c=>readFile(new URL('public'+c.url,root))));
const poses={neutral:{},raise60:{shoulderAbduction:60},raise90:{shoulderAbduction:90},raise145:{shoulderAbduction:145},flex90:{shoulderFlexion:90},extension:{shoulderFlexion:-45},reportedRaise:{shoulderFlexion:68,shoulderAbduction:150},compound:{shoulderFlexion:-45,shoulderAbduction:69,elbowFlexion:50}};
for(let angle=0;angle<=165;angle+=15){poses['abduction'+angle]={shoulderAbduction:angle};poses['flexion'+angle]={shoulderFlexion:angle};}
for(const angle of [-60,-30,30,70]){poses['rotation'+angle]={shoulderRotation:angle};poses['raisedRotation'+angle]={shoulderAbduction:120,shoulderFlexion:40,shoulderRotation:angle};}
const qa={};
let maxVolumeError=0,maxEdgeStretch=0,worstEdge='';
assert.ok(Math.abs(muscles.wrappedLength(new Vector3(2,0,0),new Vector3(-2,0,0),new Vector3(),1)-(2*Math.sqrt(3)+Math.PI/3))<1e-12);
for(const side of ['left','right']){
 const rig=soft.makeSoftRig(atlas,side),parts=atlas.parts.filter(p=>soft.tissueBindings[p.id]?.side===side&&['deltoid','cuff'].includes(soft.tissueBindings[p.id].profile));
 const members=parts.map(p=>{const b=buffers[p.chunk],base=new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3).slice();return{name:p.name,id:p.id,base,triangles:new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount).slice(),skin:soft.bindTissue(rig,soft.tissueBindings[p.id].profile,base,p),positions:base.slice()};});
 const models=[muscles.makeShoulderMuscles(members.filter(m=>m.skin.profile==='deltoid'),rig.shoulder,landmarks.sides[side].headRadius),...members.filter(m=>m.skin.profile==='cuff').map(m=>muscles.makeShoulderMuscles([m],rig.shoulder,landmarks.sides[side].headRadius))];
 for(const model of models)assert.ok(model.muscles.every(m=>m.thicknessLinks>0),'Shoulder belly must have internal thickness links');
 for(const [name,pose] of Object.entries(poses)){
  const transforms=motion.buildUpperLimbMotion(atlas,side,{...motion.NEUTRAL_POSE,...pose}).transforms,palette=soft.makePalette(rig,transforms),head=soft.deformPoint(rig.shoulder,[0,0,0,1,0,0,0],palette);
  members.forEach(m=>soft.deformTissue(m.skin,m.base,palette,m.positions));
  const input=members.map(m=>m.positions.slice());
  models.forEach(model=>muscles.solveShoulderMuscles(model,head));
  for(const model of models){
   for(const muscle of model.muscles){
    const ratio=muscles.muscleVolume(model.group.positions,muscle.triangles,head)/muscle.volume;
    maxVolumeError=Math.max(maxVolumeError,Math.abs(ratio-1));
    assert.ok(Math.abs(ratio-1)<.05,`${side} ${name}: muscle volume changed by ${((ratio-1)*100).toFixed(2)}%`);
   }
   const seams=new Map();
   model.group.members.forEach((m,k)=>model.group.maps[k].forEach((node,i)=>{
    const point=[...m.positions.subarray(i*3,i*3+3)];assert.ok(point.every(Number.isFinite));
    if(seams.has(node))assert.deepEqual(point,seams.get(node));else seams.set(node,point);
    if(!model.group.constraints.mobility[node])assert.deepEqual(point,[...input[members.indexOf(m)].subarray(i*3,i*3+3)],'Attachment drift');
    else assert.ok(new Vector3(...point).distanceTo(head)>=model.clearance[node]-2e-7,'Humeral-head penetration');
   }));
  }
  if(name==='neutral')members.forEach(m=>assert.deepEqual(m.positions,m.base));
  for(const m of members)for(let i=0;i<m.triangles.length;i+=3)for(let e=0;e<3;e++){
   const a=m.triangles[i+e]*3,b=m.triangles[i+(e+1)%3]*3,d=p=>Math.hypot(p[a]-p[b],p[a+1]-p[b+1],p[a+2]-p[b+2]);
   // Triangle edge strain is not fibre strain. This catches the 8–20x spikes
   // seen during development, not a claim of permissible biological stretch.
   if(d(m.base)>.0002)assert.ok(d(m.positions)/d(m.base)<3.5,`${side} ${name} ${m.name}: local mesh spike`);
   if(d(m.base)>.0002&&d(m.positions)/d(m.base)>maxEdgeStretch){maxEdgeStretch=d(m.positions)/d(m.base);worstEdge=`${name} ${m.name} ${a/3}-${b/3} rest=${d(m.base)}`;}
  }
  const result=members.map(m=>m.positions.slice());
  members.forEach((m,i)=>m.positions.set(input[i]));models.forEach(model=>muscles.solveShoulderMuscles(model,head));
  members.forEach((m,i)=>assert.deepEqual(m.positions,result[i],'Pose depends on previous pose'));
  qa[side+'_'+name]=members.map(m=>({name:m.name,id:m.id,vertices:[...m.positions],indices:[...m.triangles]}));
 }
 console.log(`${side}: 8 shoulder muscles, ${Object.keys(poses).length} poses; exact reset, fixed attachments, closed source seams, head clearance, deterministic replay PASS`);
}
await writeFile(new URL('shoulder-qa.json',tmp),JSON.stringify(qa));
console.log(`Maximum bulk-volume error ${(100*maxVolumeError).toFixed(2)}%; maximum triangle-edge stretch ${maxEdgeStretch.toFixed(2)}x (diagnostic, not anatomical validation).`);
console.log(worstEdge);
