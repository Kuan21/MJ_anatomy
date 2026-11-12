import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as soft from '../.sites-runtime/soft-tissue.mjs';
import * as motion from '../.sites-runtime/mj-motion.mjs';
const root=new URL('../',import.meta.url),atlas=JSON.parse(fs.readFileSync(new URL('public/models/atlas.json',root))),sources=JSON.parse(fs.readFileSync(new URL('app/biomechanics-v2/thoracic-cables.json',root))).parts,meshes=[];
for(const p of atlas.parts.filter(p=>sources[p.name])){const b=fs.readFileSync(new URL('public'+atlas.chunks[p.chunk].url,root));meshes.push({name:p.name,part:p,base:new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3).slice(),idx:new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount)});}
const stream=JSON.parse(fs.readFileSync(new URL('public/models/nerve-stream.json',root)));
for(const chunk of stream.chunks){const selected=chunk.meshes.filter(m=>sources[m.name]);if(!selected.length)continue;const b=gunzipSync(fs.readFileSync(new URL('public'+chunk.url,root)));for(const p of selected)meshes.push({name:p.name,base:new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3).slice(),idx:new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount)});}
assert.equal(meshes.length,6);
for(const {name,part,base,idx} of meshes){
 const source=sources[name],rig=soft.makeSoftRig(atlas,source.side),binding=soft.bindTissue(rig,'path',base,part,name),old=soft.bindTissue(rig,'path',base),out=base.slice(),before=base.slice();assert.ok(binding.cable);
 const altered=base.slice();altered[0]+=.001;assert.throws(()=>soft.bindTissue(rig,'path',altered,part,name),/mismatch/);
 const poses=[...Array.from({length:12},(_,i)=>({shoulderAbduction:i*15})),...Array.from({length:12},(_,i)=>({shoulderFlexion:i*15})),{shoulderFlexion:32,shoulderAbduction:162,shoulderRotation:48},{shoulderFlexion:161,shoulderAbduction:36}];
 let maxRatio=0,oldMax=0,worst;
 for(const pose of poses){
  const palette=soft.makePalette(rig,motion.buildUpperLimbMotion(atlas,source.side,{...motion.NEUTRAL_POSE,...pose}).transforms);soft.deformTissue(binding,base,palette,out);soft.deformTissue(old,base,palette,before);assert.ok(out.every(Number.isFinite));
  const replay=base.slice();soft.deformTissue(binding,base,palette,replay);assert.deepEqual(replay,out,'history-free replay');
  const seen=new Map();for(let i=0;i<base.length;i+=3){const k=base.slice(i,i+3).join(',');if(seen.has(k))assert.deepEqual(out.slice(i,i+3),seen.get(k),'source seam split');else seen.set(k,out.slice(i,i+3));}
  for(let j=0;j<idx.length;j+=3)for(let e=0;e<3;e++){const a=idx[j+e]*3,b=idx[j+(e+1)%3]*3,len=p=>Math.hypot(p[a]-p[b],p[a+1]-p[b+1],p[a+2]-p[b+2]),rest=len(base);if(rest>.0002){const ratio=len(out)/rest;if(ratio>maxRatio){maxRatio=ratio;worst={pose,a:a/3,b:b/3,rest,edgeA:source.vertexEdges[a/3],edgeB:source.vertexEdges[b/3],uA:source.fractions[a/3],uB:source.fractions[b/3],wA:binding.weights[a/3*4],wB:binding.weights[b/3*4]};}oldMax=Math.max(oldMax,len(before)/rest);}}
  soft.deformTissue(binding,base,soft.makePalette(rig,{}),replay);assert.deepEqual(replay,base,'exact reset');
 }
 if(maxRatio>=2.5)console.log('Failing edge',name,worst,'previous',oldMax);
 assert.ok(maxRatio<2.5,`${name} surface spike ${maxRatio}`);
 console.log(name,'26 poses; source identity/seams/reset/replay PASS; max edge ratio',maxRatio.toFixed(3),'previous field',oldMax.toFixed(3));
}
