/**
 * Distance from the border of a surface patch, counted in triangle edges: 1 on the border vertices, falling to 0 at `hops` edges inside (and everywhere on a patch with no border).
 * The shader of the lung surface marks reads it to draw a thin darker outline and a soft shadow just inside the border, so a groove looks recessed and its extent can be read at a glance.
 */
export function surfaceEdgeDepth(index:ArrayLike<number>,vertexCount:number,hops=3):Float32Array{
 const out=new Float32Array(vertexCount);
 const use=new Map<number,number>();
 for(let i=0;i+2<index.length;i+=3)for(let k=0;k<3;k++){
  const a=index[i+k],b=index[i+(k+1)%3],key=a<b?a*vertexCount+b:b*vertexCount+a;
  use.set(key,(use.get(key)??0)+1);
 }
 const dist=new Int16Array(vertexCount).fill(-1),neighbours:number[][]=Array.from({length:vertexCount},()=>[]);
 let frontier:number[]=[];
 for(const [key,count] of use){
  const a=Math.floor(key/vertexCount),b=key-a*vertexCount;
  neighbours[a].push(b);neighbours[b].push(a);
  if(count===1){for(const v of [a,b])if(dist[v]<0){dist[v]=0;frontier.push(v);}}
 }
 for(let d=1;d<=hops&&frontier.length;d++){
  const next:number[]=[];
  for(const v of frontier)for(const w of neighbours[v])if(dist[w]<0){dist[w]=d;next.push(w);}
  frontier=next;
 }
 for(let v=0;v<vertexCount;v++)out[v]=dist[v]<0?0:1-dist[v]/hops;
 return out;
}

/**
 * Edge value of a closed, thin solid (the aponeurosis sheet of the back of the skull): 1 on the rim, falling linearly to 0 at `reachMm` millimetres from it, measured over the surface in the model.
 * The rim is every vertex of a side-wall triangle, a triangle with two corners at the same x and y (the sheet is built as a top surface and a bottom surface joined by vertical walls).
 * A mesh with no such triangle (the open sheet of the galea) gets 0 everywhere, so it is not darkened at all.
 */
export function solidRimDistance(positions:ArrayLike<number>,index:ArrayLike<number>,reachMm:number):Float32Array{
 const count=positions.length/3,out=new Float32Array(count),rim:number[]=[],isRim=new Uint8Array(count);
 const same=(a:number,b:number)=>Math.abs(positions[a*3]-positions[b*3])<1e-6&&Math.abs(positions[a*3+1]-positions[b*3+1])<1e-6;
 for(let t=0;t+2<index.length;t+=3){
  const a=index[t],b=index[t+1],c=index[t+2];
  if(same(a,b)||same(b,c)||same(a,c))for(const v of [a,b,c])if(!isRim[v]){isRim[v]=1;rim.push(v);}
 }
 if(!rim.length)return out;
 // rim vertices on a grid of the reach size, so each vertex only looks at the nearby ones
 const reach=reachMm/1000,cell=new Map<string,number[]>(),key=(x:number,y:number)=>Math.floor(x/reach)+','+Math.floor(y/reach);
 for(const v of rim){const k=key(positions[v*3],positions[v*3+1]),l=cell.get(k)??[];l.push(v);cell.set(k,l);}
 for(let v=0;v<count;v++){
  const x=positions[v*3],y=positions[v*3+1],z=positions[v*3+2],cx=Math.floor(x/reach),cy=Math.floor(y/reach);let best=reach;
  for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(const r of cell.get((cx+i)+','+(cy+j))??[]){const d=Math.hypot(x-positions[r*3],y-positions[r*3+1],z-positions[r*3+2]);if(d<best)best=d;}
  out[v]=1-best/reach;
 }
 return out;
}
