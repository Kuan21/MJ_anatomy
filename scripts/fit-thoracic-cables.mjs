// Fit centreline contours to selected unbranched source tubes. Never replace
// the authored mesh or merge disconnected source components.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {Vector3} from 'three';
const root=new URL('../',import.meta.url),atlas=JSON.parse(fs.readFileSync(new URL('public/models/atlas.json',root))),parts={};
const v=a=>new Vector3(...a),key=(a,b)=>a<b?`${a},${b}`:`${b},${a}`;
function fit(name,positions,indices){
 const unique=[],map=new Map(),weld=[];
 for(let i=0;i<positions.length;i+=3){const p=[...positions.slice(i,i+3)],k=p.join(',');if(!map.has(k)){map.set(k,unique.length);unique.push(p);}weld.push(map.get(k));}
 const tri=[];const adj=unique.map(()=>new Set());
 for(let i=0;i<indices.length;i+=3){const t=[weld[indices[i]],weld[indices[i+1]],weld[indices[i+2]]];tri.push(t);for(let j=0;j<3;j++){const a=t[j],b=t[(j+1)%3];if(a!==b){adj[a].add(b);adj[b].add(a);}}}
 const comp=unique.map(()=>-1),components=[];
 for(let i=0;i<unique.length;i++)if(comp[i]<0){const q=[i],c=components.length;comp[i]=c;for(let j=0;j<q.length;j++)for(const b of adj[q[j]])if(comp[b]<0){comp[b]=c;q.push(b);}components.push(q);}
 const nodes=[],stations=[],nodeComp=[],edges=[],crossingNodes=new Map();
 for(let c=0;c<components.length;c++){
  const group=components[c],seed=group.reduce((a,b)=>unique[a][1]>unique[b][1]?a:b),dist=unique.map(()=>Infinity),seen=new Set();dist[seed]=0;
  for(let it=0;it<group.length;it++){let a=-1;for(const n of group)if(!seen.has(n)&&(a<0||dist[n]<dist[a]))a=n;if(a<0)break;seen.add(a);for(const b of adj[a])dist[b]=Math.min(dist[b],dist[a]+v(unique[a]).distanceTo(v(unique[b])));}
  const max=Math.max(...group.map(i=>dist[i])),steps=Math.max(2,Math.ceil(max/.006)),levels=[];
  for(let l=0;l<steps;l++){
   const level=(l+.5)*max/steps,points=new Map(),links=new Map();
   for(const t of tri){if(comp[t[0]]!==c)continue;const crosses=[];
    for(let j=0;j<3;j++){const a=t[j],b=t[(j+1)%3];if((dist[a]<level)===(dist[b]<level))continue;const k=key(a,b);if(!points.has(k))points.set(k,v(unique[a]).lerp(v(unique[b]),(level-dist[a])/(dist[b]-dist[a])));crosses.push(k);}
    if(crosses.length===2){const [a,b]=crosses;if(!links.has(a))links.set(a,new Set());if(!links.has(b))links.set(b,new Set());links.get(a).add(b);links.get(b).add(a);}
   }
   const visited=new Set(),levelNodes=[];
   for(const start of links.keys())if(!visited.has(start)){
    const q=[start];visited.add(start);for(let j=0;j<q.length;j++)for(const b of links.get(q[j]))if(!visited.has(b)){visited.add(b);q.push(b);}
    const centre=new Vector3();let weight=0;
    for(const a of q)for(const b of links.get(a))if(a<b){const pa=points.get(a),pb=points.get(b),w=pa.distanceTo(pb);centre.addScaledVector(pa.clone().add(pb).multiplyScalar(.5),w);weight+=w;}
    if(weight<1e-12)continue;centre.multiplyScalar(1/weight);const id=nodes.length;nodes.push(centre.toArray());stations.push(level/max);nodeComp.push(c);levelNodes.push(id);
    for(const k of q){const crossing=`${c}:${k}`;if(!crossingNodes.has(crossing))crossingNodes.set(crossing,[]);crossingNodes.get(crossing).push({l,id});}
   }
   levels.push(levelNodes);
  }
  // Adjacent contours are connected by the actual source edges they cross.
  for(const list of crossingNodes.values())for(let j=1;j<list.length;j++)if(list[j].l===list[j-1].l+1)edges.push([list[j-1].id,list[j].id]);
  for(let l=0;l<levels.length-1;l++)for(const a of levels[l])if(levels[l+1].length){const b=levels[l+1].reduce((p,n)=>v(nodes[a]).distanceToSquared(v(nodes[p]))<v(nodes[a]).distanceToSquared(v(nodes[n]))?p:n);edges.push([a,b]);}
 }
 const dedup=[...new Map(edges.map(e=>[key(...e),e])).values()],vertexEdges=[],fractions=[];
 for(let i=0;i<weld.length;i++){
  const p=v(unique[weld[i]]);let best=Infinity,bestE=-1,bestT=0;
  dedup.forEach(([a,b],e)=>{if(nodeComp[a]!==comp[weld[i]])return;const start=v(nodes[a]),d=v(nodes[b]).sub(start),t=Math.max(0,Math.min(1,p.clone().sub(start).dot(d)/d.lengthSq())),error=start.addScaledVector(d,t).distanceToSquared(p);if(error<best){best=error;bestE=e;bestT=t;}});
  if(bestE<0)throw new Error(`Unmapped source vertex: ${name}`);vertexEdges.push(bestE);fractions.push(bestT);
 }
 let hash=2166136261;for(const x of positions)hash=Math.imul(hash^Math.round(x*1e7),16777619);
 parts[name]={side:/^Left|\.l\./.test(name)?'left':'right',vertexCount:weld.length,positionHash:hash>>>0,nodes,stations,edges:dedup,vertexEdges,fractions};
 console.log(name,weld.length,'vertices',nodes.length,'nodes',dedup.length,'edges',components.length,'source components');
}
for(const p of atlas.parts.filter(p=>/^(Left|Right) lateral thoracic (artery|vein)$/.test(p.name))){const b=fs.readFileSync(new URL('public'+atlas.chunks[p.chunk].url,root));fit(p.name,new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3),new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount));}
const stream=JSON.parse(fs.readFileSync(new URL('public/models/nerve-stream.json',root)));
for(const chunk of stream.chunks){const selected=chunk.meshes.filter(m=>/^Long thoracic nerve\.[rl]\.001$/.test(m.name));if(!selected.length)continue;const b=gunzipSync(fs.readFileSync(new URL('public'+chunk.url,root)));for(const p of selected)fit(p.name,new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3),new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount));}
fs.writeFileSync(new URL('app/biomechanics-v2/thoracic-cables.json',root),JSON.stringify({method:'Source surface iso-geodesic contours at 6 mm spacing. Selected chest-attached tubes only; not clinical validation.',parts}));
