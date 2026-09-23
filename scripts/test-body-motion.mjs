import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import ts from 'typescript';
import {Vector3,Matrix4} from 'three';
const root=new URL('../',import.meta.url),tmp=new URL('.sites-runtime/',root);
let source=await readFile(new URL('app/biomechanics-v2/body-motion.ts',root),'utf8');
source=source.replace("import rawBindings from './body-bindings.json';",`const rawBindings=${await readFile(new URL('app/biomechanics-v2/body-bindings.json',root),'utf8')};`);
await writeFile(new URL('body-motion.mjs',tmp),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
const body=await import(new URL('body-motion.mjs',tmp)),soft=await import(new URL('soft-tissue.mjs',tmp));
const atlas=JSON.parse(await readFile(new URL('public/models/atlas.json',root),'utf8'));
const chunks=await Promise.all(atlas.chunks.map(c=>readFile(new URL('public'+c.url,root))));
const geometry=p=>{const b=chunks[p.chunk];return{positions:new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3).slice(),indices:new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount).slice()};};
const qa={};let vertices=0;
for(const region of ['head','leftLeg','rightLeg']){
 const rig=body.makeBodyRig(atlas,region),parts=atlas.parts.filter(p=>body.bodyBindings[p.id]?.rig===region);
 assert.ok(parts.length>100);
 const posedParts=parts.map(p=>{const g=geometry(p),b=body.bodyBindings[p.id];assert.equal(b.name,p.name);if(region==='head'&&/tooth|gingiva|alar cartilage|nasal concha|mandible/i.test(p.name))assert.equal(b.frame,8,'Facial and dental structures must stay with skull');if(region!=='head')assert.ok(!/finger|hand|humerus|radius|ulna|carpal/i.test(p.name));return{p,b,...g,skin:b.frame===null?body.bindBodyTissue(rig,g.positions,false,p):null};});
 const poses=region==='head'?{neutral:body.BODY_NEUTRAL,nod:{...body.BODY_NEUTRAL,flexion:35},lookUp:{...body.BODY_NEUTRAL,flexion:-30},turn:{...body.BODY_NEUTRAL,rotation:55},tilt:{...body.BODY_NEUTRAL,sideBend:25},combined:{...body.BODY_NEUTRAL,flexion:20,rotation:35,sideBend:15}}:{neutral:body.BODY_NEUTRAL,lift:{...body.BODY_NEUTRAL,flexion:65,knee:75},back:{...body.BODY_NEUTRAL,flexion:-20},bend:{...body.BODY_NEUTRAL,knee:110},ankle:{...body.BODY_NEUTRAL,ankle:20},abduct:{...body.BODY_NEUTRAL,sideBend:35},combined:{...body.BODY_NEUTRAL,flexion:45,knee:65,ankle:15,rotation:15}};
 if(region==='head'){poses.turnOther={...body.BODY_NEUTRAL,rotation:-55};poses.tiltOther={...body.BODY_NEUTRAL,sideBend:-25};}
 for(const [name,pose] of Object.entries(poses)){
  const built=body.buildBodyMotion(rig,pose),rows=[];
  for(const m of built.matrices)assert.ok(Math.abs(m.determinant()-1)<1e-10);
  // Child rotations leave their joint pivots on the parent, for every pose.
  for(let i=2;i<(region==='head'?9:4);i++)assert.ok(rig.pivots[i].clone().applyMatrix4(built.matrices[i]).distanceTo(rig.pivots[i].clone().applyMatrix4(built.matrices[i-1]))<1e-10);
  for(const {p,b,positions,indices,skin} of posedParts){
   const out=new Float32Array(positions.length);
   if(skin)soft.deformTissue(skin,positions,built.palette,out);
   else for(let i=0;i<positions.length;i+=3)out.set(new Vector3(...positions.slice(i,i+3)).applyMatrix4(built.matrices[b.frame]).toArray(),i);
   assert.ok(out.every(Number.isFinite),p.name);vertices+=p.vertexCount;
   if(name==='neutral')assert.deepEqual(out,positions,`${p.name} neutral`);
   if(skin)for(let i=0;i<positions.length;i+=3)if(skin.indices[i/3*4]===0&&skin.weights[i/3*4]===1&&skin.weights[i/3*4+1]===0)assert.deepEqual([...out.slice(i,i+3)],[...positions.slice(i,i+3)],`${p.name} fixed origin`);
   if(region==='head'&&name!=='neutral'&&/sternocleidomastoid|^Trachea$|^Hyoid bone$|^Thyroid cartilage$|^Cricoid cartilage$/.test(p.name)){
    const max=Math.max(...Array.from({length:p.vertexCount},(_,i)=>Math.hypot(out[i*3]-positions[i*3],out[i*3+1]-positions[i*3+1],out[i*3+2]-positions[i*3+2])));
    assert.ok(max>.0005,`${p.name} must move in ${name}, measured ${max}`);
   }
   if(region==='head'&&/^(Hyoid bone|Thyroid cartilage|Cricoid cartilage)$/.test(p.name)){
    const a=new Vector3().fromArray(positions),b=new Vector3().fromArray(out);
    for(let i=3;i<positions.length;i+=3)assert.ok(Math.abs(a.distanceTo(new Vector3().fromArray(positions,i))-b.distanceTo(new Vector3().fromArray(out,i)))<5e-7,`${p.name} must retain its rigid shape`);
   }
   if(region!=='rightLeg'&&(p.system==='skeletal'||p.system==='muscular'))rows.push({name:p.name,vertices:[...out],indices:[...indices],system:p.system});
  }
  if(region!=='rightLeg')qa[region+'_'+name]=rows;
 }
 console.log(`${region}: ${parts.length} exact parts, ${Object.keys(poses).length} poses; finite, exact reset, rigid bones, joint continuity and fixed origins PASS`);
}
await writeFile(new URL('body-qa.json',tmp),JSON.stringify(qa));
console.log(`${vertices.toLocaleString()} posed body vertices checked.`);
