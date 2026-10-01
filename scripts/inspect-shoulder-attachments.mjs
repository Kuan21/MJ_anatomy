import {readFile,writeFile} from 'node:fs/promises';
import {Vector3,Triangle} from 'three';
const root=new URL('../',import.meta.url),tmp=new URL('.sites-runtime/',root);
const soft=await import(new URL('soft-tissue.mjs',tmp));
const atlas=JSON.parse(await readFile(new URL('public/models/atlas.json',root),'utf8'));
const buffers=await Promise.all(atlas.chunks.map(c=>readFile(new URL('public'+c.url,root))));
const geometry=p=>{const b=buffers[p.chunk];return{base:new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3),indices:new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount)};};
const result={method:'Mesh-derived shoulder rig: near-bone patches in proximal/distal regions; surface geodesic distance distributes attachment influence. Clavicular deltoid originates on clavicle; other shoulder profiles on scapula. Approximation, not validated fibre architecture.',parts:{}};
for(const side of ['left','right']){
 const rig=soft.makeSoftRig(atlas,side),bones=new Map();
 for(const frame of [1,2,3]){
  const p=atlas.parts.find(p=>p.id===rig.ids[frame]),g=geometry(p),triangles=[];
  for(let t=0;t<g.indices.length;t+=3)triangles.push(new Triangle(...[0,1,2].map(k=>new Vector3().fromArray(g.base,g.indices[t+k]*3))));
  bones.set(frame,triangles);
 }
 for(const p of atlas.parts){
  const binding=soft.tissueBindings[p.id];if(binding?.side!==side||!['deltoid','cuff'].includes(binding.profile))continue;
  const {base,indices}=geometry(p),skin=soft.bindTissue(rig,binding.profile,base),min={},originFrame=/Clavicular part/i.test(p.name)?1:2;
  const keys=new Map(),map=[],points=[];
  for(let i=0;i<base.length/3;i++){const key=[...base.subarray(i*3,i*3+3)].join(',');if(!keys.has(key)){keys.set(key,keys.size);points.push(new Vector3().fromArray(base,i*3));}map.push(keys.get(key));}
  const adjacent=points.map(()=>new Map()),origin=new Set(),insertion=new Set();
  for(let t=0;t<indices.length;t+=3)for(let e=0;e<3;e++){const a=map[indices[t+e]],b=map[indices[t+(e+1)%3]],d=points[a].distanceTo(points[b]);if(a!==b){adjacent[a].set(b,d);adjacent[b].set(a,d);}}
  const target=new Vector3();
  for(let i=0;i<base.length/3;i++){
   let distal=0;for(let k=0;k<4;k++)if(skin.indices[i*4+k]===3)distal+=skin.weights[i*4+k];
   const frames=distal<.2?[originFrame]:distal>.8?[3]:[];
   const point=points[map[i]];
   for(const frame of frames){let distance=Infinity;
    for(const triangle of bones.get(frame))distance=Math.min(distance,triangle.closestPointToPoint(point,target).distanceTo(point));
    min[frame]=Math.min(min[frame]??Infinity,distance);
    if(distance<.003)(frame===3?insertion:origin).add(map[i]);
   }
  }
  if(!origin.size||!insertion.size)throw Error(`Missing attachment patch: ${p.name}`);
  const distances=seeds=>{const d=points.map(()=>Infinity),visited=new Set();for(const i of seeds)d[i]=0;for(let k=0;k<points.length;k++){let a=-1;for(let i=0;i<points.length;i++)if(!visited.has(i)&&(a<0||d[i]<d[a]))a=i;if(a<0||!Number.isFinite(d[a]))break;visited.add(a);for(const [b,length] of adjacent[a])d[b]=Math.min(d[b],d[a]+length);}return d;};
  const od=distances(origin),id=distances(insertion);
  // Source components are not welded together. Extend the attachment-distance
  // field to disconnected islands using spatial distance to the seed patches.
  const distance=(n,d,seeds)=>Number.isFinite(d[n])?d[n]:Math.min(...[...seeds].map(i=>points[n].distanceTo(points[i])));
  const weight=map.map(n=>{const a=distance(n,od,origin),b=distance(n,id,insertion);return Number((a/Math.max(1e-12,a+b)).toFixed(7));});
  console.log(p.name,origin.size,'origin nodes',insertion.size,'insertion nodes',min);
  let positionHash=2166136261;for(const x of base)positionHash=Math.imul(positionHash^Math.round(x*1e7),16777619);
  result.parts[p.id]={name:p.name,vertexCount:p.vertexCount,positionHash:positionHash>>>0,originFrame,spatialFallbackNodes:od.filter((v,i)=>!Number.isFinite(v+id[i])).length,weight};
 }
}
await writeFile(new URL('shoulder-attachments-candidate.json',tmp),JSON.stringify(result));
if(process.argv.includes('--write'))await writeFile(new URL('app/biomechanics-v2/shoulder-attachments.json',root),JSON.stringify(result)+'\n');
