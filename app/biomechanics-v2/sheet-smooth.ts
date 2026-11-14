// Taubin smoothing (a shrinking and an inflating pass, so the thickness stays) of a thin sheet whose surface is stair-stepped. Pure function, no imports: scripts/test-larynx-repair.mjs runs the same code.
// Vertices at the same position are one vertex for the neighbour graph (the source repeats vertices along seams) and move together.
export function smoothSheet(positions:Float32Array|number[],index:ArrayLike<number>,passes=20,lambda=.5,mu=-.53):Float32Array{
 const n=positions.length/3,key=(i:number)=>`${Math.round(positions[i*3]*1e6)},${Math.round(positions[i*3+1]*1e6)},${Math.round(positions[i*3+2]*1e6)}`;
 const ids=new Map<string,number>(),rep=new Uint32Array(n),first:number[]=[];
 for(let i=0;i<n;i++){const k=key(i);let v=ids.get(k);if(v===undefined){v=first.length;ids.set(k,v);first.push(i);}rep[i]=v;}
 const m=first.length,nb:Set<number>[]=Array.from({length:m},()=>new Set());
 for(let t=0;t+2<index.length;t+=3){const a=rep[index[t]],b=rep[index[t+1]],c=rep[index[t+2]];if(a===b||b===c||a===c)continue;nb[a].add(b).add(c);nb[b].add(a).add(c);nb[c].add(a).add(b);}
 let p=new Float64Array(m*3);first.forEach((i,v)=>{p[v*3]=positions[i*3];p[v*3+1]=positions[i*3+1];p[v*3+2]=positions[i*3+2];});
 for(let it=0;it<passes*2;it++){
  const s=it%2?mu:lambda,q=new Float64Array(p);
  for(let v=0;v<m;v++){const s_=nb[v];if(!s_.size)continue;let x=0,y=0,z=0;for(const u of s_){x+=p[u*3];y+=p[u*3+1];z+=p[u*3+2];}x/=s_.size;y/=s_.size;z/=s_.size;q[v*3]=p[v*3]+s*(x-p[v*3]);q[v*3+1]=p[v*3+1]+s*(y-p[v*3+1]);q[v*3+2]=p[v*3+2]+s*(z-p[v*3+2]);}
  p=q;
 }
 const out=new Float32Array(positions.length);
 for(let i=0;i<n;i++){const v=rep[i];out[i*3]=p[v*3];out[i*3+1]=p[v*3+1];out[i*3+2]=p[v*3+2];}
 return out;
}
