// Offline source-mesh fitting; review candidate before including in runtime.
import fs from 'node:fs';
import {Vector3,Triangle} from 'three';
const root=new URL('../',import.meta.url);
const atlas=JSON.parse(fs.readFileSync(new URL('public/models/atlas.json',root)));
const buffers=atlas.chunks.map(c=>fs.readFileSync(new URL('public'+c.url,root)));
const geometry=p=>{const b=buffers[p.chunk];return{positions:new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3),indices:new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount)};};
const triangles=parts=>parts.flatMap(p=>{const g=geometry(p),out=[];for(let k=0;k<g.indices.length;k+=3)out.push(new Triangle(...[0,1,2].map(j=>new Vector3().fromArray(g.positions,g.indices[k+j]*3))));return out;});
const output={method:'Candidate rib/scapula proximity patches and surface-distance weights. Not validated anatomy.',parts:{}};
for(const side of ['Left','Right']){
 const part=atlas.parts.find(p=>p.name===`${side} serratus anterior`),g=geometry(part);
 const ribs=triangles(atlas.parts.filter(p=>p.system==='skeletal'&&p.name.startsWith(side+' ')&&/rib$/.test(p.name)&&!/tenth|eleventh|twelfth/.test(p.name)));
 const scapula=triangles(atlas.parts.filter(p=>p.name===`${side} scapula`));
 const keys=new Map(),nodes=[],map=[];
 for(let i=0;i<part.vertexCount;i++){const p=new Vector3().fromArray(g.positions,i*3),key=p.toArray().join(',');if(!keys.has(key)){keys.set(key,nodes.length);nodes.push(p);}map.push(keys.get(key));}
 const adjacency=nodes.map(()=>new Map()),origin=new Set(),insertion=new Set(),target=new Vector3();
 for(let k=0;k<g.indices.length;k+=3)for(let e=0;e<3;e++){const a=map[g.indices[k+e]],b=map[g.indices[k+(e+1)%3]];if(a!==b){const d=nodes[a].distanceTo(nodes[b]);adjacency[a].set(b,d);adjacency[b].set(a,d);}}
 const distance=(point,surface)=>{let min=Infinity;for(const t of surface)min=Math.min(min,t.closestPointToPoint(point,target).distanceToSquared(point));return Math.sqrt(min);};
 for(let i=0;i<nodes.length;i++){
  const p=nodes[i],dr=distance(p,ribs),ds=distance(p,scapula);
  // Distinct contact patches; exclude intermediate chest-wall sliding surface.
  if(p.z>0&&dr<.004&&dr<ds*.5)origin.add(i);
  if(p.z<-.065&&ds<.004&&ds<dr*.75)insertion.add(i);
 }
 if(!origin.size||!insertion.size)throw Error(`No fitted attachment patches for ${part.name}`);
 const distances=seeds=>{const d=nodes.map(()=>Infinity),visited=new Uint8Array(nodes.length);for(const i of seeds)d[i]=0;for(let k=0;k<nodes.length;k++){let a=-1;for(let i=0;i<nodes.length;i++)if(!visited[i]&&(a<0||d[i]<d[a]))a=i;if(a<0||!Number.isFinite(d[a]))break;visited[a]=1;for(const [b,len] of adjacency[a])d[b]=Math.min(d[b],d[a]+len);}return d;};
 const od=distances(origin),sd=distances(insertion);
 let fallback=0;
 const weight=map.map(n=>{let a=od[n],b=sd[n];if(!Number.isFinite(a+b)){fallback++;a=Math.min(...[...origin].map(i=>nodes[n].distanceTo(nodes[i])));b=Math.min(...[...insertion].map(i=>nodes[n].distanceTo(nodes[i])));}return Number((a/Math.max(1e-12,a+b)).toFixed(7));});
 let hash=2166136261;for(const x of g.positions)hash=Math.imul(hash^Math.round(x*1e7),16777619);
 output.parts[part.id]={name:part.name,vertexCount:part.vertexCount,positionHash:hash>>>0,originFrame:0,insertionFrame:2,weight};
 console.log(part.name,{vertices:part.vertexCount,nodes:nodes.length,ribAnchors:origin.size,scapularAnchors:insertion.size,fallbackVertices:fallback});
}
fs.writeFileSync(new URL('.sites-runtime/serratus-attachments-candidate.json',root),JSON.stringify(output)+'\n');
if(process.argv.includes('--write'))fs.writeFileSync(new URL('app/biomechanics-v2/serratus-attachments.json',root),JSON.stringify(output)+'\n');
