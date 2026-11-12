// Original source topology; proximal shared field and distal host-muscle fan.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
const atlas=JSON.parse(fs.readFileSync('public/models/atlas.json')),parts={};
function geometry(p){const b=fs.readFileSync('public'+atlas.chunks[p.chunk].url);return [new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3),new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount)];}
function fit(name,base,idx){
 const side=/left|\.l\./i.test(name)?'left':'right',parent=atlas.parts.find(p=>p.name===`Sternocostal part of ${side} pectoralis major`),[muscle]=geometry(parent);
 const xs=Array.from({length:muscle.length/3},(_,i)=>Math.abs(muscle[i*3])),minX=Math.min(...xs),maxX=Math.max(...xs),tip=[0,0,0];let n=0;
 for(let i=0;i<muscle.length;i+=3)if(Math.abs(muscle[i])>=maxX-.002){for(let k=0;k<3;k++)tip[k]+=muscle[i+k];n++;}for(let k=0;k<3;k++)tip[k]/=n;
 const points=[],weld=[],lookup=new Map();for(let i=0;i<base.length;i+=3){const p=[...base.slice(i,i+3)],key=p.join(',');if(!lookup.has(key)){lookup.set(key,points.length);points.push(p);}weld.push(lookup.get(key));}
 const adj=points.map(()=>new Set());for(let i=0;i<idx.length;i+=3)for(let k=0;k<3;k++){const a=weld[idx[i+k]],b=weld[idx[i+(k+1)%3]];if(a!==b){adj[a].add(b);adj[b].add(a);}}
 const seen=new Set(),progress=new Float64Array(points.length),top=Math.max(...points.map(p=>p[1]));
 for(let i=0;i<points.length;i++)if(!seen.has(i)){
  const group=[i];seen.add(i);for(let j=0;j<group.length;j++)for(const b of adj[group[j]])if(!seen.has(b)){seen.add(b);group.push(b);}
  // Legacy nerve includes disconnected chest twigs. Only components in
  // the source's superior 25 mm enter the proximal collar. Giving every
  // twig a new plexus root causes the hanging loops seen in raised poses.
  if(Math.max(...group.map(i=>points[i][1]))<top-.025){for(const i of group)progress[i]=1;continue;}
  const seed=group.reduce((a,b)=>points[a][1]>points[b][1]?a:b),dist=new Float64Array(points.length).fill(Infinity),visited=new Set();dist[seed]=0;
  for(let j=0;j<group.length;j++){let a=-1;for(const v of group)if(!visited.has(v)&&(a<0||dist[v]<dist[a]))a=v;visited.add(a);for(const b of adj[a])dist[b]=Math.min(dist[b],dist[a]+Math.hypot(...points[a].map((x,k)=>x-points[b][k])));}
  const length=Math.max(...group.map(i=>dist[i]));for(const i of group)progress[i]=dist[i]/Math.max(length,1e-9);
 }
 let hash=2166136261;for(const x of base)hash=Math.imul(hash^Math.round(x*1e7),16777619);
 parts[name]={side,vertexCount:base.length/3,positionHash:hash>>>0,progress:weld.map(i=>progress[i]),fan:{originFrame:0,insertionFrame:3,tip,minX,spanX:maxX-minX}};
 console.log(name,base.length/3);
}
for(const p of atlas.parts.filter(p=>/^Pectoral branch of (left|right) thoraco-acromial artery$/.test(p.name)))fit(p.name,...geometry(p));
for(const c of JSON.parse(fs.readFileSync('public/models/nerve-stream.json')).chunks){const selected=c.meshes.filter(p=>/^Lateral pectoral nerve\.[rl]\.001$/.test(p.name));if(!selected.length)continue;const b=gunzipSync(fs.readFileSync('public'+c.url));for(const p of selected)fit(p.name,new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3),new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount));}
fs.writeFileSync('app/biomechanics-v2/pectoral-followers.json',JSON.stringify({method:'Source-geodesic transition from shared proximal field to sternocostal muscle fan. Geometric approximation, not clinical validation.',parts}));
