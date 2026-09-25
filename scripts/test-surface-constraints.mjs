import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import ts from 'typescript';
const root=new URL('../',import.meta.url),tmp=new URL('.sites-runtime/',root);
await writeFile(new URL('surface-constraints.mjs',tmp),ts.transpileModule(await readFile(new URL('app/biomechanics-v2/surface-constraints.ts',root),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
const guard=await import(new URL('surface-constraints.mjs',tmp)),soft=await import(new URL('soft-tissue.mjs',tmp)),body=await import(new URL('body-motion.mjs',tmp)),motion=await import(new URL('mj-motion.mjs',tmp));
const rawAtlas=JSON.parse(await readFile(new URL('public/models/atlas.json',root),'utf8')),sourceOverrides=JSON.parse(await readFile(new URL('app/anatomy-source-overrides.json',root),'utf8')),excludedSourceIds=new Set(sourceOverrides.exclude),atlas={...rawAtlas,parts:rawAtlas.parts.filter(p=>!excludedSourceIds.has(p.id)).map(p=>({...p,...(sourceOverrides.parts[p.id]||{})}))},chunks=await Promise.all(atlas.chunks.map(c=>readFile(new URL('public'+c.url,root))));
let checked=0,before=0,after=0;
for(const p of atlas.parts){
 const binding=soft.tissueBindings[p.id],head=/platysma|sternocleidomastoid/.test(p.name);
 if(!head&&(!binding||!['chest','cuff'].includes(binding.profile)))continue;
 const chunk=chunks[p.chunk],base=new Float32Array(chunk.buffer,chunk.byteOffset+p.positions,p.vertexCount*3).slice(),tri=new Uint32Array(chunk.buffer,chunk.byteOffset+p.indices,p.indexCount);
 const rig=head?body.makeBodyRig(atlas,'head'):soft.makeSoftRig(atlas,binding.side),skin=head?body.bindBodyTissue(rig,base,false,p):soft.bindTissue(rig,binding.profile,base,p),c=guard.makeSurfaceConstraints(base,tri,skin);
 const neutral=base.slice();guard.constrainSurface(c,neutral);assert.deepEqual(neutral,base);
 const energy=out=>{let n=0;for(let k=0;k<c.lengths.length;k++){const a=c.edges[k*2],b=c.edges[k*2+1];if(!c.mobility[a]&&!c.mobility[b])continue;const length=Math.hypot(out[a*3]-out[b*3],out[a*3+1]-out[b*3+1],out[a*3+2]-out[b*3+2]);n+=Math.max(0,length-c.lengths[k]*1.45)**2;}return n;};
 for(const angle of head?[-25,25]:[-45,90,150]){
  const palette=head?body.buildBodyMotion(rig,{...body.BODY_NEUTRAL,sideBend:angle,flexion:20}).palette:soft.makePalette(rig,motion.buildUpperLimbMotion(atlas,binding.side,{...motion.NEUTRAL_POSE,shoulderFlexion:angle}).transforms);
  const out=new Float32Array(base.length);soft.deformTissue(skin,base,palette,out);const posed=out.slice();before+=energy(out);guard.constrainSurface(c,out);after+=energy(out);assert.ok(out.every(Number.isFinite));
  for(let i=0;i<c.mobility.length;i++)if(!c.mobility[i])assert.deepEqual(out.slice(i*3,i*3+3),posed.slice(i*3,i*3+3),'Rigid attachment must stay exact');checked++;
 }
}
assert.ok(before>0&&after<before,'Guard must reduce aggregate excess edge stretch on actual meshes');
console.log(`${checked} actual sheet/pose combinations; neutral and rigid anchors exact; excess edge stretch energy reduced ${Math.round((1-after/before)*100)}%.`);
for(const side of ['left','right']){
 const rig=soft.makeSoftRig(atlas,side),members=atlas.parts.filter(p=>soft.tissueBindings[p.id]?.side===side&&soft.tissueBindings[p.id]?.profile==='deltoid').map(p=>{
  const chunk=chunks[p.chunk],base=new Float32Array(chunk.buffer,chunk.byteOffset+p.positions,p.vertexCount*3).slice();
  return{base,triangles:new Uint32Array(chunk.buffer,chunk.byteOffset+p.indices,p.indexCount),skin:soft.bindTissue(rig,'deltoid',base,p),positions:base.slice()};
 });
 assert.equal(members.length,3);
 const group=guard.makeSurfaceGroup(members);
 guard.constrainSurfaceGroup(group);members.forEach(m=>assert.deepEqual(m.positions,m.base));
 let raw=0,corrected=0;
 for(const pose of [{shoulderFlexion:-45,shoulderAbduction:69,elbowFlexion:50},{shoulderAbduction:145},{shoulderFlexion:150}]){
  const palette=soft.makePalette(rig,motion.buildUpperLimbMotion(atlas,side,{...motion.NEUTRAL_POSE,...pose}).transforms);
  members.forEach(m=>soft.deformTissue(m.skin,m.base,palette,m.positions));
  const before=members.map(m=>m.positions.slice());
  const energy=()=>members.reduce((total,m)=>{for(let k=0;k<m.triangles.length;k+=3)for(let e=0;e<3;e++){const a=m.triangles[k+e]*3,b=m.triangles[k+(e+1)%3]*3,dist=p=>Math.hypot(p[a]-p[b],p[a+1]-p[b+1],p[a+2]-p[b+2]);total+=Math.max(0,dist(m.positions)-1.45*dist(m.base))**2;}return total;},0);
  raw+=energy();guard.constrainSurfaceGroup(group);corrected+=energy();
  const joined=new Map();members.forEach((m,k)=>{assert.ok(m.positions.every(Number.isFinite));for(let i=0;i<m.base.length/3;i++){
   const key=[...m.base.subarray(i*3,i*3+3)].join(','),point=[...m.positions.subarray(i*3,i*3+3)];
   if(joined.has(key))assert.deepEqual(point,joined.get(key),'Coincident source seams must remain closed');else joined.set(key,point);
   if(group.constraints.mobility[group.maps[k][i]]===0)assert.deepEqual(point,[...before[k].subarray(i*3,i*3+3)],'Pinned shoulder attachments must not drift');
  }});
  const once=members.map(m=>m.positions.slice());members.forEach(m=>soft.deformTissue(m.skin,m.base,palette,m.positions));guard.constrainSurfaceGroup(group);members.forEach((m,i)=>assert.deepEqual(m.positions,once[i],'Repeated pose must not accumulate deformation'));
 }
 assert.ok(corrected<raw);console.log(`${side} deltoid group: neutral, attachment and seam invariants PASS; excess stretch reduced ${Math.round((1-corrected/raw)*100)}% across compound and extreme poses.`);
}
