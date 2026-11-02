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
