// Source-topology coordinates for dorsal scapular branches. Distances travel
// along triangle edges, never jump to a spatially close neighbouring branch.
import fs from 'node:fs';
const root=new URL('../',import.meta.url),atlas=JSON.parse(fs.readFileSync(new URL('public/models/atlas.json',root))),parts={};
function fit(name,positions,indices){
 const points=[],weld=[],lookup=new Map();
 for(let i=0;i<positions.length;i+=3){const p=[...positions.slice(i,i+3)],key=p.join(',');if(!lookup.has(key)){lookup.set(key,points.length);points.push(p);}weld.push(lookup.get(key));}
 const adj=points.map(()=>new Set());for(let i=0;i<indices.length;i+=3)for(let e=0;e<3;e++){const a=weld[indices[i+e]],b=weld[indices[i+(e+1)%3]];if(a!==b){adj[a].add(b);adj[b].add(a);}}
 const components=[],seen=new Set();for(let i=0;i<points.length;i++)if(!seen.has(i)){const q=[i];seen.add(i);for(let j=0;j<q.length;j++)for(const b of adj[q[j]])if(!seen.has(b)){seen.add(b);q.push(b);}components.push(q);}
 const progress=new Float64Array(points.length),roots=[];
 for(const group of components){
  const minY=Math.min(...group.map(i=>points[i][1])),maxY=Math.max(...group.map(i=>points[i][1]));
  // The arterial proximal end is anterior to its superior arch. A highest-Y
  // seed alone picks the arch and reverses the short proximal branch.
  const proximal=group.filter(i=>points[i][1]>maxY-.25*(maxY-minY));
  const seed=/artery/i.test(name)?proximal.reduce((a,b)=>points[a][2]>points[b][2]?a:b):group.reduce((a,b)=>points[a][1]>points[b][1]?a:b);
  roots.push(points[seed]);const dist=new Float64Array(points.length).fill(Infinity),visited=new Set();dist[seed]=0;
  for(let j=0;j<group.length;j++){let a=-1;for(const n of group)if(!visited.has(n)&&(a<0||dist[n]<dist[a]))a=n;visited.add(a);for(const b of adj[a]){const length=Math.hypot(...points[a].map((v,k)=>v-points[b][k]));dist[b]=Math.min(dist[b],dist[a]+length);}}
  const length=Math.max(...group.map(i=>dist[i]));for(const i of group)progress[i]=dist[i]/Math.max(length,1e-9);
 }
 let hash=2166136261;for(const p of positions)hash=Math.imul(hash^Math.round(p*1e7),16777619);
 parts[name]={side:/^Left|\.l\./.test(name)?'left':'right',vertexCount:weld.length,positionHash:hash>>>0,roots,progress:weld.map(i=>progress[i])};
 console.log(name,weld.length,'source vertices',components.length,'components; roots',roots);
}
for(const p of atlas.parts.filter(p=>/^(Left|Right) dorsal scapular artery$/.test(p.name))){const b=fs.readFileSync(new URL('public'+atlas.chunks[p.chunk].url,root));fit(p.name,new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3),new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount));}
fs.writeFileSync(new URL('app/biomechanics-v2/scapular-branches.json',root),JSON.stringify({method:'Welded source-topology distance from proximal cap; smooth transition to scapular distal carrier. Educational approximation, not clinical validation.',parts}));
