// Shoulder girdle at 180° elevation: the broad sheets (pectoralis major, pectoralis minor, trapezius, levator scapulae, rhomboids) used to be skinned and edge-limited only, so they flattened and folded as the arm went up. They now join the volume
// solve: attachment collars stay on their bones, the belly keeps its volume and no sheet inverts.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {runnerImport} from 'vite';
const root=fileURLToPath(new URL('../',import.meta.url)),load=async f=>(await runnerImport(root+f)).module;
const [worker,soft,motion,solverModule,regions]=await Promise.all(['app/biomechanics-v2/shoulder-worker.ts','app/biomechanics-v2/soft-tissue.ts','app/mj-motion.ts','app/biomechanics-v2/shoulder-muscles.ts','app/mj-part-regions.ts'].map(load));
const {normalizeAtlasSystems}=await load('app/mj-system-classifier.ts');
const atlas=normalizeAtlasSystems(JSON.parse(fs.readFileSync(root+'public/models/atlas.json','utf8')));
const buffers=new Map(),chunk=i=>{if(!buffers.has(i))buffers.set(i,fs.readFileSync(root+'public'+atlas.chunks[i].url));return buffers.get(i);};
const view=(p,T,o,c)=>{const b=chunk(p.chunk);return new T(b.buffer.slice(b.byteOffset+o,b.byteOffset+o+c*T.BYTES_PER_ELEMENT));};
const rigs={left:soft.makeSoftRig(atlas,'left'),right:soft.makeSoftRig(atlas,'right')};
// The bony thorax, as the viewer hands it to the worker: ribs, sternum and thoracic vertebrae (static under arm motion).
const bony=atlas.parts.filter(p=>p.system==='skeletal'&&/\b(?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) rib$|manubrium|body of sternum|xiphoid process|thoracic vertebra$/i.test(p.name));
assert.ok(bony.length>=36,`bony thorax parts: ${bony.length}`);
const samples=[];for(const b of bony){const a=view(b,Float32Array,b.positions,b.vertexCount*3);for(let k=0;k<a.length;k+=6)samples.push(a[k],a[k+1],a[k+2]);}
const collision=Float32Array.from(samples),collider=solverModule.makePointCollider(collision);
const sheets=atlas.parts.filter(p=>{const b=soft.tissueBindings[p.id];return b&&b.name===p.name&&p.system==='muscular'&&solverModule.SHEET_PROFILES.includes(b.profile)&&!/serratus anterior/i.test(p.name)&&!regions.isMotionQuarantined(p);});
assert.ok(sheets.length>=19,`shoulder sheets found: ${sheets.length}`);
assert.ok(sheets.some(p=>/trapezius/i.test(p.name))&&sheets.some(p=>/pectoralis major/i.test(p.name))&&sheets.some(p=>/rhomboid/i.test(p.name))&&sheets.some(p=>/levator scapulae/i.test(p.name)));
const inputs=()=>sheets.map(p=>({part:p,base:view(p,Float32Array,p.positions,p.vertexCount*3),normals:view(p,Int16Array,p.normals,p.vertexCount*3),triangles:view(p,Uint32Array,p.indices,p.indexCount)}));
const POSES=[['flexion 180',{shoulderFlexion:180}],['abduction 180',{shoulderAbduction:180}],['flexion 150 + rotation',{shoulderFlexion:150,shoulderRotation:50}]];
const report=[];
for(const [label,pose] of POSES){
 const transforms={...motion.buildUpperLimbMotion(atlas,'left',{...motion.NEUTRAL_POSE,...pose}).transforms,...motion.buildUpperLimbMotion(atlas,'right',{...motion.NEUTRAL_POSE,...pose}).transforms};
 const solve=worker.createShoulderSolver(atlas),inp=inputs(),results=new Map(solve(inp.map(i=>({...i,base:i.base.slice(),normals:i.normals.slice(),triangles:i.triangles.slice()})),transforms,[],collision.slice()).map(r=>[r.id,r]));
 let worstPlain=0,worstSolved=0,beyondPlain=0,beyondSolved=0,pinned=0,covered=0,sunkPlain=0,sunkSolved=0,free=0;
 for(const {part,base,triangles} of inp){
  const side=soft.tissueBindings[part.id].side,rig=rigs[side],skin=soft.bindTissue(rig,soft.tissueBindings[part.id].profile,base,part,'',triangles),palette=soft.makePalette(rig,transforms),plain=new Float32Array(base.length);
  soft.deformTissue(skin,base,palette,plain);
  const solved=results.get(part.id)?.positions;if(!solved)continue;assert.ok(solved.every(Number.isFinite),`solved ${part.name}`);covered++;
  const centre=rig.shoulder,rest=solverModule.muscleVolume(base,triangles,centre),vp=solverModule.muscleVolume(plain,triangles,centre)/rest,vs=solverModule.muscleVolume(solved,triangles,centre)/rest;
  worstPlain=Math.max(worstPlain,Math.abs(vp-1));worstSolved=Math.max(worstSolved,Math.abs(vs-1));if(Math.abs(vp-1)>.1)beyondPlain++;if(Math.abs(vs-1)>.1)beyondSolved++;
  assert.ok(Math.abs(vs-1)<=.1,`${part.name} (${label}): volume ${(vs*100).toFixed(0)} % of rest after solving (skinning alone ${(vp*100).toFixed(0)} %)`);
  // No free vertex sinks into the ribs, sternum or spine: it keeps at least ~its rest clearance (capped at 4 mm).
  for(let i=0;i<base.length/3;i++){
   if(Math.max(...skin.weights.subarray(i*4,i*4+4))>=.995)continue;
   const r=collider.nearest(base[i*3],base[i*3+1],base[i*3+2],.05);if(!r)continue;const need=Math.min(r[0]*.9,.004)-.0006;free++;
   const dp=collider.nearest(plain[i*3],plain[i*3+1],plain[i*3+2],need+.001),ds=collider.nearest(solved[i*3],solved[i*3+1],solved[i*3+2],need+.001);
   if(dp&&dp[0]<need)sunkPlain++;if(ds&&ds[0]<need)sunkSolved++;
  }
  for(let i=0;i<base.length/3;i++)if(Math.max(...skin.weights.subarray(i*4,i*4+4))>=.995){pinned++;for(let k=0;k<3;k++)assert.ok(Math.abs(solved[i*3+k]-plain[i*3+k])<1e-6,`${part.name}: attachment collar vertex ${i} must stay on its bone`);}
 }
 assert.equal(sunkSolved,0,`${label}: ${sunkSolved} sheet vertices sink into the bony thorax (${sunkPlain} with skinning alone)`);
 assert.ok(covered>=18,`sheets solved: ${covered}`);
 assert.ok(pinned>1000,`attachment collars exist (${pinned})`);
 report.push(`${label}: ${covered} sheets, worst volume change ${(worstPlain*100).toFixed(0)} % with skinning alone → ${(worstSolved*100).toFixed(1)} % solved (${beyondPlain} sheets beyond ±10 % → ${beyondSolved}); vertices sunk into the ribs/spine ${sunkPlain} → ${sunkSolved} of ${free}`);
}
console.log('PASS shoulder sheets: '+report.join('; ')+'.');
