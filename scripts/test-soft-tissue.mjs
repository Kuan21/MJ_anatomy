import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {performance} from 'node:perf_hooks';
import ts from 'typescript';
import {Vector3,Quaternion,Matrix4} from 'three';
const root=new URL('../',import.meta.url),tmp=new URL('.sites-runtime/',root);await mkdir(tmp,{recursive:true});
for(const file of ['biomechanics-v2/skeleton','biomechanics-v2/soft-tissue','mj-motion','mj-regions','mj-dissection']){
 let source=await readFile(new URL(`app/${file}.ts`,root),'utf8');
 for(const match of [...source.matchAll(/import (\w+) from '([^']+\.json)';/g)]){
  const data=await readFile(new URL(match[2],new URL(`app/${file}.ts`,root)),'utf8');source=source.replace(match[0],`const ${match[1]}=${data};`);
 }
 source=source.replace("from './skeleton'","from './skeleton.mjs'").replace("from './mj-regions'","from './mj-regions.mjs'");
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 await writeFile(new URL(`${file.split('/').pop()}.mjs`,tmp),js);
}
const soft=await import(new URL('soft-tissue.mjs',tmp)),motion=await import(new URL('mj-motion.mjs',tmp));
const atlas=JSON.parse(await readFile(new URL('public/models/atlas.json',root),'utf8'));
const {resolveDissection}=await import(new URL('mj-dissection.mjs',tmp));
const focusIds=new Set(['shoulder','arm','forearm','hand'].flatMap(region=>resolveDissection(atlas,region,0).partIds));
const buffers=await Promise.all(atlas.chunks.map(c=>readFile(new URL('public'+c.url,root))));
const geometry=p=>{const b=buffers[p.chunk];return{positions:new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3).slice(),indices:new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount).slice()};};
const poses={extension:{...motion.NEUTRAL_POSE,shoulderFlexion:-45},wristExtension:{...motion.NEUTRAL_POSE,wristFlexion:45},videoReplay:{...motion.NEUTRAL_POSE,shoulderFlexion:90,shoulderAbduction:17,shoulderRotation:-25},neutral:motion.NEUTRAL_POSE,raise60:{...motion.NEUTRAL_POSE,shoulderAbduction:60},raise90:{...motion.NEUTRAL_POSE,shoulderAbduction:90},raise145:{...motion.NEUTRAL_POSE,shoulderAbduction:145},flex90:{...motion.NEUTRAL_POSE,elbowFlexion:90},combined:{...motion.NEUTRAL_POSE,shoulderAbduction:70,shoulderFlexion:45,elbowFlexion:100,forearmRotation:40,wristFlexion:15}};
const render={};let vertices=0,maxNeutral=0;const start=performance.now();
for(const side of ['left','right']){
 const rig=soft.makeSoftRig(atlas,side);assert.ok(rig);
 // Audit the actual UI focus set, independently of the binding manifest.
 const bones=motion.buildUpperLimbMotion(atlas,side,motion.NEUTRAL_POSE).transforms;
 const focused=atlas.parts.filter(p=>focusIds.has(p.id)&&(side==='left'?(p.bounds[0][0]+p.bounds[1][0])/2>.04:(p.bounds[0][0]+p.bounds[1][0])/2<-.04));
 for(const p of focused){
  // Costal cartilage is attached to the stationary thorax, not the arm.
  if(/costal cartilage/i.test(p.name))continue;
  assert.ok(bones[p.id]||soft.tissueBindings[p.id]?.side===side,`Unbound focused anatomy: ${p.id} ${p.name}`);
 }
 const tissues=atlas.parts.filter(p=>soft.tissueBindings[p.id]?.side===side);
 for(const p of tissues){const binding=soft.tissueBindings[p.id];assert.equal(binding.name,p.name);assert.ok(!/toe|thigh|femor|glute|brain/i.test(p.name));}
 const skin=tissues.map(p=>{const g=geometry(p);return{p,...g,binding:soft.bindTissue(rig,soft.tissueBindings[p.id].profile,g.positions,p)};});
 const nerveProbe=new Float32Array([rig.shoulder.x,rig.shoulder.y-.03,0,rig.elbow.x,rig.elbow.y,0,rig.wrist.x,rig.wrist.y,0]);
 // Splitting a tube into independent source objects must not change the posed points.
 const wholeBinding=soft.bindTissue(rig,'path',nerveProbe),firstBinding=soft.bindTissue(rig,'path',nerveProbe.slice(0,6));
 for(const [poseName,pose] of Object.entries(poses)){
  const {transforms,warnings}=motion.buildUpperLimbMotion(atlas,side,pose);assert.equal(warnings.length,0);assert.equal(Object.keys(transforms).length,32);
  const palette=soft.makePalette(rig,transforms),rows=[];
  if(poseName==='extension'){
   const t=transforms[rig.ids[3]],p=rig.elbow.clone().applyQuaternion(new Quaternion(...t.quaternion)).add(new Vector3(...t.translation));
   assert.ok(p.z<rig.elbow.z-.08,'Extension must move upper arm posteriorly');
  }

  const whole=new Float32Array(9),first=new Float32Array(6);soft.deformTissue(wholeBinding,nerveProbe,palette,whole);soft.deformTissue(firstBinding,nerveProbe.slice(0,6),palette,first);assert.deepEqual([...whole.slice(0,6)],[...first]);
  for(const {p,positions,indices,binding} of skin){
   const output=new Float32Array(positions.length),scale=soft.deformTissue(binding,positions,palette,output);assert.ok(scale>=.94&&scale<=1.12);assert.ok(output.every(Number.isFinite));vertices+=p.vertexCount;
   if(poseName==='raise90'&&/brachioradialis|anconeus|circumflex scapular|dorsal metacarpal arteries|flexor retinaculum/i.test(p.name)){let squared=0;for(let i=0;i<output.length;i++)squared+=(output[i]-positions[i])**2;assert.ok(Math.sqrt(squared/p.vertexCount)>.005,`${p.name} stayed at rest`);}
   if(poseName==='wristExtension'&&binding.profile==='chest')assert.deepEqual(output,positions,'Wrist must not move the chest');
   if(poseName==='neutral'){const delta=Math.max(...output.map((v,i)=>Math.abs(v-positions[i])));maxNeutral=Math.max(maxNeutral,delta);assert.ok(delta<2e-7,`${p.name}: neutral changed ${delta}`);}
   // Attachments represented by a one-frame weight remain pinned to that frame.
   for(let i=0;i<p.vertexCount;i++)if(binding.weights[i*4]>.999999&&binding.belly[i]<1e-6){
    const f=binding.indices[i*4],t=transforms[rig.ids[f]],expected=new Vector3(...positions.slice(i*3,i*3+3));
    if(t)expected.applyQuaternion(new Quaternion(...t.quaternion)).add(new Vector3(...t.translation));
    assert.ok(expected.distanceTo(new Vector3(...output.slice(i*3,i*3+3)))<3e-7);
   }
   if(side==='left'&&/deltoid|pectoralis major|biceps brachii|triceps brachii|brachialis|brachioradialis|anconeus/i.test(p.name))rows.push({id:p.id,name:p.name,vertices:[...output],indices:[...indices]});
  }
  // Bones for visual QA, transformed by the production motion core.
  if(side==='left')for(const p of atlas.parts.filter(p=>transforms[p.id])){const g=geometry(p),t=transforms[p.id],q=new Quaternion(...t.quaternion),v=new Vector3(...t.translation),out=[];for(let i=0;i<g.positions.length;i+=3)out.push(...new Vector3(...g.positions.slice(i,i+3)).applyQuaternion(q).add(v).toArray());rows.push({id:p.id,name:p.name,vertices:out,indices:[...g.indices]});}
  if(side==='left')render[poseName]=rows;
 }
 // Equal bind points across all three deltoid heads must stay coincident.
 const deltoids=skin.filter(s=>s.binding.profile==='deltoid'),point=new Float32Array([rig.shoulder.x,rig.shoulder.y-.07,-.01]);
 const palette=soft.makePalette(rig,motion.buildUpperLimbMotion(atlas,side,poses.raise90).transforms),outputs=deltoids.map(({p})=>{const binding=soft.bindTissue(rig,'deltoid',point,p),out=new Float32Array(3);soft.deformTissue(binding,point,palette,out);return [...out];});
 outputs.forEach(o=>assert.deepEqual(o,outputs[0]));
 console.log(`${side}: ${skin.length} tissues; 9 poses finite; exact neutral; pinned endpoints; shared deltoid seams; split-tube continuity PASS`);
}
await writeFile(new URL('tissue-qa.json',tmp),JSON.stringify(render));
console.log(`Processed ${vertices.toLocaleString()} posed vertices in ${Math.round(performance.now()-start)} ms. Maximum neutral error ${maxNeutral}.`);
