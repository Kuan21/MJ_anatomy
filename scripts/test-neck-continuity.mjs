import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import ts from 'typescript';
import * as T from 'three';
const root=new URL('../',import.meta.url),tmp=new URL('.sites-runtime/',root);
let source=await readFile(new URL('app/biomechanics-v2/neck-vessels.ts',root),'utf8');
source=source.replace("'./body-motion'","'./body-motion.mjs'").replace("'./soft-tissue'","'./soft-tissue.mjs'");
await writeFile(new URL('neck-vessels.mjs',tmp),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
const {createNeckVessels}=await import(new URL('neck-vessels.mjs',tmp));
const {normalizeAtlasSystems}=await import(new URL('mj-system-classifier.mjs',tmp));
const atlas=normalizeAtlasSystems(JSON.parse(await readFile(new URL('public/models/atlas.json',root),'utf8')));
const data=JSON.parse(await readFile(new URL('public/models/neck-vessels.json',root),'utf8'));
const c=createNeckVessels(atlas,new T.Scene());c.add(data);assert.equal(c.rows.length,8);
const neutral={visible:['arterial','venous'],selected:[],explode:0,isolate:false,view:'front',rotate:false,reset:0};
const nearest=(a,b)=>{let best=Infinity,ai=0,bi=0;for(let i=0;i<a.length;i+=3)for(let j=0;j<b.length;j+=3){const d=(a[i]-b[j])**2+(a[i+1]-b[j+1])**2+(a[i+2]-b[j+2])**2;if(d<best){best=d;ai=i;bi=j;}}return{distance:Math.sqrt(best),ai,bi};};
const joins=[];for(const side of ['left','right'])for(const branch of ['Internal','External']){
 const common=c.rows.find(r=>r.mesh.name===`${side==='left'?'Left':'Right'} common carotid artery`),child=c.rows.find(r=>r.mesh.name===`${branch} carotid artery.${side==='left'?'l':'r'}`);
 const join=nearest(common.base,child.base);assert.ok(join.distance<.002,`Rest bifurcation gap ${join.distance}`);joins.push({common,child,...join});
}
let maxGap=0;const qa={};
for(const rotation of [-60,0,60])for(const flexion of [-35,0,40]){
 const state={...neutral,bodyMotion:{region:'head',pose:{flexion,rotation,sideBend:0,knee:0,ankle:0}}};c.update(state,0);
 for(const j of joins){const a=j.common.mesh.geometry.attributes.position.array,b=j.child.mesh.geometry.attributes.position.array;const d=Math.hypot(a[j.ai]-b[j.bi],a[j.ai+1]-b[j.bi+1],a[j.ai+2]-b[j.bi+2]);maxGap=Math.max(maxGap,d);assert.ok(d<.002,`Moving bifurcation gap ${d}`);}
 if(rotation===60&&flexion===-35)qa.posed=c.rows.map(r=>({name:r.mesh.name,vertices:[...r.mesh.geometry.attributes.position.array],indices:[...r.mesh.geometry.index.array]}));
}
c.update(neutral,0);for(const r of c.rows)assert.deepEqual(r.mesh.geometry.attributes.position.array,r.base);
qa.neutral=c.rows.map(r=>({name:r.mesh.name,vertices:[...r.base],indices:[...r.mesh.geometry.index.array]}));
c.update({...neutral,visible:['skeletal']},0);assert.ok(c.rows.every(r=>!r.mesh.visible));
await writeFile(new URL('neck-continuity-qa.json',tmp),JSON.stringify(qa));
console.log(`8 cervical vessel meshes; 9 head poses; four bifurcations max separation ${(maxGap*1000).toFixed(3)} mm; exact reset and layer control PASS`);
