// Fit ONLY the axillary cutaneous/muscular terminal branches to the source
// deltoid surface. Preserve their proximal axillary-nerve junction collars.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {Vector3,Triangle} from 'three';
const atlas=JSON.parse(fs.readFileSync('public/models/atlas.json'));
const attachments=JSON.parse(fs.readFileSync('app/biomechanics-v2/shoulder-attachments.json')).parts;
const streams=JSON.parse(fs.readFileSync('public/models/nerve-stream.json'));
const source=new Map(),parts={};
for(const c of streams.chunks){const selected=c.meshes.filter(p=>/^(Axillary nerve|Superior lateral brachial cutaneous nerve|Muscular branches of axillary nerve)\.[lr]\.001$/.test(p.name));if(!selected.length)continue;const b=gunzipSync(fs.readFileSync('public'+c.url));for(const p of selected)source.set(p.name,{base:new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3).slice(),idx:new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount).slice()});}
for(const side of ['left','right']){
 const letter=side[0],parent=source.get(`Axillary nerve.${letter}.001`).base,triangles=[],samples=[],seenSamples=new Set();
 for(const p of atlas.parts.filter(p=>p.name.includes(`${side} deltoid`))){
  const fit=attachments[p.id];if(!fit)throw Error('Missing deltoid attachment '+p.name);
  const b=fs.readFileSync('public'+atlas.chunks[p.chunk].url),v=new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3),idx=new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount);
  for(let i=0;i<idx.length;i+=3){const ids=[idx[i],idx[i+1],idx[i+2]];triangles.push({id:p.id,ids,tri:new Triangle(...ids.map(n=>new Vector3().fromArray(v,n*3))),frame:fit.originFrame,weights:ids.map(n=>fit.weight[n])});}
  for(let i=0;i<v.length;i+=3){const key=[...v.subarray(i,i+3)].join(',');if(!seenSamples.has(key)){seenSamples.add(key);samples.push({id:p.id,index:i/3,point:[...v.subarray(i,i+3)]});}}
 }
 for(const name of [`Superior lateral brachial cutaneous nerve.${letter}.001`,`Muscular branches of axillary nerve.${letter}.001`]){
  const {base,idx}=source.get(name),points=[],weld=[],lookup=new Map();
  for(let i=0;i<base.length;i+=3){const p=[...base.subarray(i,i+3)],key=p.join(',');if(!lookup.has(key)){lookup.set(key,points.length);points.push(p);}weld.push(lookup.get(key));}
  const adj=points.map(()=>new Set());for(let i=0;i<idx.length;i+=3)for(let k=0;k<3;k++){const a=weld[idx[i+k]],b=weld[idx[i+(k+1)%3]];if(a!==b){adj[a].add(b);adj[b].add(a);}}
  const parentDistance=points.map(p=>{let d=Infinity;for(let i=0;i<parent.length;i+=3)d=Math.min(d,Math.hypot(p[0]-parent[i],p[1]-parent[i+1],p[2]-parent[i+2]));return d;});
  const dist=new Float64Array(points.length).fill(Infinity),done=new Set();
  // All actual source junction points, not the highest vertex of each twig.
  const threshold=Math.max(.002,Math.min(...parentDistance)+.0005);
  parentDistance.forEach((d,i)=>{if(d<=threshold)dist[i]=0;});
  while(done.size<points.length){let a=-1;for(let i=0;i<points.length;i++)if(!done.has(i)&&(a<0||dist[i]<dist[a]))a=i;if(!Number.isFinite(dist[a]))break;done.add(a);for(const b of adj[a])dist[b]=Math.min(dist[b],dist[a]+Math.hypot(...points[a].map((v,k)=>v-points[b][k])));}
  const host=points.map(p=>{const v=new Vector3(...p),q=new Vector3(),bestPoint=new Vector3();let best=null,d=Infinity;for(const t of triangles){t.tri.closestPointToPoint(v,q);const next=q.distanceToSquared(v);if(next<d){d=next;best=t;bestPoint.copy(q);}}const bary=best.tri.getBarycoord(bestPoint,new Vector3()),w=best.weights.reduce((sum,x,k)=>sum+x*bary.getComponent(k),0),weights=[0,0,0,0,0,0,0];weights[best.frame]=1-w;weights[3]+=w;return {weights,anchor:[best.id,...best.ids,...bary.toArray()]};});
  const anchors=points.map(p=>{const near=samples.map((s,index)=>({...s,sampleIndex:index,d:Math.hypot(...s.point.map((v,k)=>v-p[k]))})).sort((a,b)=>a.d-b.d).slice(0,32),radius=near.at(-1).d+1e-9,weights=near.map(s=>Math.max(0,1-s.d*s.d/(radius*radius))**3),sum=weights.reduce((a,b)=>a+b,0);return near.map((s,i)=>[s.sampleIndex,Number((weights[i]/sum).toFixed(7))]);});
  let hash=2166136261;for(const v of base)hash=Math.imul(hash^Math.round(v*1e7),16777619);
  const progress=weld.map(i=>{const t=Math.max(0,Math.min(1,(dist[i]-.005)/.030));return t*t*(3-2*t);});
  parts[name]={side,vertexCount:base.length/3,positionHash:hash>>>0,progress,hostWeights:weld.map(i=>host[i].weights),nodes:weld,samples:samples.map(s=>[s.id,s.index]),patches:anchors};
  console.log(name,base.length/3,'source vertices, proximal collar',progress.filter(t=>t===0).length);
 }
}
fs.writeFileSync('app/biomechanics-v2/deltoid-nerve-followers.json',JSON.stringify({method:'Fixed compact source-surface patches (32 neighbours) follow completed deltoid displacement; fallback uses fitted attachment weights; source-geodesic 5–35 mm transition from unchanged axillary junction. Geometric approximation.',parts}));
