/**
 * Closeness of every vertex of a surface patch to the true border of the patch: 1 on the border, falling linearly to 0 at `reach` metres (and 0 everywhere on a patch with no border).
 * The shader of the lung surface marks reads it to darken the colour softly towards the border, so a groove looks recessed and its extent can be read, without any line.
 *
 * A patch that was simplified when it was built has cracks: edges that belong to one triangle only although the surface goes on across them (two triangles that no longer share
 * their vertices). Counting such edges as border drew a net of dark lines over the inside of a mark. A border edge counts as a true border only when no other border edge lies
 * on it (within 0.05 mm): a crack always has the other lip next to it, the outline of the mark does not.
 */
export function surfaceBorderFade(index:ArrayLike<number>,positions:ArrayLike<number>,reach=.0025):Float32Array{
 const n=positions.length/3,out=new Float32Array(n),use=new Map<number,number>(),ea:number[]=[],eb:number[]=[];
 for(let i=0;i+2<index.length;i+=3)for(let k=0;k<3;k++){
  const a=index[i+k],b=index[i+(k+1)%3],key=a<b?a*n+b:b*n+a;
  use.set(key,(use.get(key)??0)+1);
 }
 for(const [key,count] of use)if(count===1){const a=Math.floor(key/n);ea.push(a);eb.push(key-a*n);}
 if(!ea.length)return out;
 const P=positions,CELL=.0006,TOL=.00005,cells=new Map<string,number[]>(),cell=(v:number)=>Math.floor(v/CELL);
 for(let e=0;e<ea.length;e++){
  const a=ea[e]*3,b=eb[e]*3,lo=[0,1,2].map(k=>Math.min(P[a+k],P[b+k])-TOL),hi=[0,1,2].map(k=>Math.max(P[a+k],P[b+k])+TOL);
  for(let x=cell(lo[0]);x<=cell(hi[0]);x++)for(let y=cell(lo[1]);y<=cell(hi[1]);y++)for(let z=cell(lo[2]);z<=cell(hi[2]);z++){
   const key=`${x},${y},${z}`;(cells.get(key)??cells.set(key,[]).get(key)!).push(e);
  }
 }
 const segDist=(px:number,py:number,pz:number,e:number)=>{
  const a=ea[e]*3,b=eb[e]*3,dx=P[b]-P[a],dy=P[b+1]-P[a+1],dz=P[b+2]-P[a+2],l2=dx*dx+dy*dy+dz*dz;
  let t=l2?((px-P[a])*dx+(py-P[a+1])*dy+(pz-P[a+2])*dz)/l2:0;t=Math.max(0,Math.min(1,t));
  return Math.hypot(P[a]+dx*t-px,P[a+1]+dy*t-py,P[a+2]+dz*t-pz);
 };
 const border:number[]=[];
 for(let e=0;e<ea.length;e++){
  const a=ea[e]*3,b=eb[e]*3,mx=(P[a]+P[b])/2,my=(P[a+1]+P[b+1])/2,mz=(P[a+2]+P[b+2])/2;
  let crack=false;
  for(const f of cells.get(`${cell(mx)},${cell(my)},${cell(mz)}`)??[])if(f!==e&&segDist(mx,my,mz,f)<=TOL){crack=true;break;}
  if(!crack)border.push(e);
 }
 if(!border.length)return out;
 // closeness of each vertex to the true border segments (straight-line distance, independent of how the triangles are connected)
 const RC=reach,bcells=new Map<string,number[]>(),rc=(v:number)=>Math.floor(v/RC);
 for(const e of border){
  const a=ea[e]*3,b=eb[e]*3,lo=[0,1,2].map(k=>Math.min(P[a+k],P[b+k])),hi=[0,1,2].map(k=>Math.max(P[a+k],P[b+k]));
  for(let x=rc(lo[0]);x<=rc(hi[0]);x++)for(let y=rc(lo[1]);y<=rc(hi[1]);y++)for(let z=rc(lo[2]);z<=rc(hi[2]);z++){
   const key=`${x},${y},${z}`;(bcells.get(key)??bcells.set(key,[]).get(key)!).push(e);
  }
 }
 for(let v=0;v<n;v++){
  const px=P[v*3],py=P[v*3+1],pz=P[v*3+2],cx=rc(px),cy=rc(py),cz=rc(pz);
  let best=reach;
  for(let x=cx-1;x<=cx+1;x++)for(let y=cy-1;y<=cy+1;y++)for(let z=cz-1;z<=cz+1;z++)for(const e of bcells.get(`${x},${y},${z}`)??[]){const d=segDist(px,py,pz,e);if(d<best)best=d;}
  out[v]=1-best/reach;
 }
 return out;
}

/**
 * Vertex normals of a patch that are shared by every vertex at the same place. A simplified patch has cracks (copies of a vertex that each belong to one side), and the normals of the
 * two copies differ, so the lighting shows every simplified triangle as a separate flat scale. Normals averaged over the vertices at one place (to 5 µm) are smooth across the cracks.
 * They are turned to point the same way as the normals the patch came with.
 */
export function smoothNormalsByPlace(index:ArrayLike<number>,positions:ArrayLike<number>,original:ArrayLike<number>):Float32Array{
 const n=positions.length/3,P=positions,place=new Map<string,number>(),id=new Uint32Array(n);
 for(let v=0;v<n;v++){
  const key=`${Math.round(P[v*3]/5e-6)},${Math.round(P[v*3+1]/5e-6)},${Math.round(P[v*3+2]/5e-6)}`;
  let p=place.get(key);if(p===undefined){p=place.size;place.set(key,p);}id[v]=p;
 }
 const sum=new Float64Array(place.size*3);
 for(let t=0;t+2<index.length;t+=3){
  const a=index[t]*3,b=index[t+1]*3,c=index[t+2]*3,ux=P[b]-P[a],uy=P[b+1]-P[a+1],uz=P[b+2]-P[a+2],vx=P[c]-P[a],vy=P[c+1]-P[a+1],vz=P[c+2]-P[a+2];
  const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
  for(let k=0;k<3;k++){const p=id[index[t+k]]*3;sum[p]+=nx;sum[p+1]+=ny;sum[p+2]+=nz;}
 }
 const out=new Float32Array(n*3);
 for(let v=0;v<n;v++){
  const p=id[v]*3;let x=sum[p],y=sum[p+1],z=sum[p+2];const l=Math.hypot(x,y,z);
  // a place no triangle has an area at (a vertex no triangle uses, a sliver) keeps the normal it came with: every normal must stay a unit vector
  if(l<1e-18){out[v*3]=original[v*3];out[v*3+1]=original[v*3+1];out[v*3+2]=original[v*3+2];continue;}
  x/=l;y/=l;z/=l;
  if(x*original[v*3]+y*original[v*3+1]+z*original[v*3+2]<0){x=-x;y=-y;z=-z;}
  out[v*3]=x;out[v*3+1]=y;out[v*3+2]=z;
 }
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
