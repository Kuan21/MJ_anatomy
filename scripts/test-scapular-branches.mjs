import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {Vector3,Quaternion} from 'three';
import * as soft from '../.sites-runtime/soft-tissue.mjs';
import * as motion from '../.sites-runtime/mj-motion.mjs';
const root=new URL('../',import.meta.url),atlas=JSON.parse(fs.readFileSync(new URL('public/models/atlas.json',root))),sources=JSON.parse(fs.readFileSync(new URL('app/biomechanics-v2/scapular-branches.json',root))).parts,meshes=[];
for(const p of atlas.parts.filter(p=>sources[p.name])){const b=fs.readFileSync(new URL('public'+atlas.chunks[p.chunk].url,root));meshes.push({name:p.name,part:p,base:new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3).slice(),idx:new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount)});}
const stream=JSON.parse(fs.readFileSync(new URL('public/models/nerve-stream.json',root)));
for(const c of stream.chunks){const selected=c.meshes.filter(p=>sources[p.name]);if(!selected.length)continue;const b=gunzipSync(fs.readFileSync(new URL('public'+c.url,root)));for(const p of selected)meshes.push({name:p.name,base:new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3).slice(),idx:new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount)});}
assert.equal(meshes.length,2);
assert.ok(Object.keys(sources).every(name=>/dorsal scapular artery$/.test(name)),'Unvalidated nerve/other vessel must not receive this mapping');
for(const {name,part,base,idx} of meshes){
 const source=sources[name],rig=soft.makeSoftRig(atlas,source.side),binding=soft.bindTissue(rig,'path',base,part,name),old=soft.bindTissue(rig,'path',base),out=base.slice(),before=base.slice();
 const altered=base.slice();altered[0]+=.001;assert.throws(()=>soft.bindTissue(rig,'path',altered,part,name),/mismatch/);
 const poses=[...Array.from({length:12},(_,i)=>({shoulderAbduction:i*15})),...Array.from({length:12},(_,i)=>({shoulderFlexion:i*15})),{shoulderFlexion:32,shoulderAbduction:162,shoulderRotation:48},{shoulderFlexion:161,shoulderAbduction:36}];
 for(const abd of [-20,0,70,165])for(const flex of [-60,0,90,165])for(const rot of [-60,0,70])poses.push({shoulderAbduction:abd,shoulderFlexion:flex,shoulderRotation:rot,elbowFlexion:140,forearmRotation:80,wristFlexion:80});
 let maxRatio=0,oldMax=0,maxRoot=0,maxDistal=0;
 for(const pose of poses){
  const transforms=motion.buildUpperLimbMotion(atlas,source.side,{...motion.NEUTRAL_POSE,...pose}).transforms,palette=soft.makePalette(rig,transforms),sc=transforms[rig.ids[2]],q=new Quaternion(...sc.quaternion),shift=new Vector3(...sc.translation);
  soft.deformTissue(binding,base,palette,out);soft.deformTissue(old,base,palette,before);assert.ok(out.every(Number.isFinite));
  const replay=base.slice();soft.deformTissue(binding,base,palette,replay);assert.deepEqual(replay,out,'history-free replay');
  const seen=new Map();for(let i=0;i<base.length;i+=3){const key=base.slice(i,i+3).join(',');if(seen.has(key))assert.deepEqual(out.slice(i,i+3),seen.get(key),'source seam split');else seen.set(key,out.slice(i,i+3));
   if(source.progress[i/3]<=.10){const error=Math.hypot(...out.slice(i,i+3).map((v,k)=>v-before[i+k]));maxRoot=Math.max(maxRoot,error);assert.ok(error<1e-7,'proximal parent junction moved');}
   if(source.progress[i/3]>=.70){const expected=new Vector3(...base.slice(i,i+3)).applyQuaternion(q).add(shift),error=expected.distanceTo(new Vector3(...out.slice(i,i+3)));maxDistal=Math.max(maxDistal,error);assert.ok(error<2e-7,'distal scapular attachment drift');}
  }
  for(let j=0;j<idx.length;j+=3)for(let e=0;e<3;e++){const a=idx[j+e]*3,b=idx[j+(e+1)%3]*3,len=p=>Math.hypot(p[a]-p[b],p[a+1]-p[b+1],p[a+2]-p[b+2]),rest=len(base);if(rest>.0002){maxRatio=Math.max(maxRatio,len(out)/rest);oldMax=Math.max(oldMax,len(before)/rest);}}
  soft.deformTissue(binding,base,soft.makePalette(rig,{}),replay);assert.deepEqual(replay,base,'exact reset');
 }
 console.log(name,poses.length,'poses; max surface ratio',maxRatio.toFixed(3),'previous',oldMax.toFixed(3),'root error',maxRoot,'distal error',maxDistal);
 assert.ok(maxRatio<2.5,`${name}: local spike ${maxRatio}`);assert.ok(maxRatio<oldMax*.85,`${name}: insufficient improvement`);
}
