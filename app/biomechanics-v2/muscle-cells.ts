/** Overlapping material cells inside one source muscle. Signed volume, rather
 * than just surface-edge length, detects an inside-out/folded belly. These are
 * geometric constraints, not measured fascicles or a physiological FEM mesh. */
export function cellDeterminant(p:ArrayLike<number>,a:number,b:number,c:number,d:number){
 const ax=p[a]-p[d],ay=p[a+1]-p[d+1],az=p[a+2]-p[d+2],bx=p[b]-p[d],by=p[b+1]-p[d+1],bz=p[b+2]-p[d+2],cx=p[c]-p[d],cy=p[c+1]-p[d+1],cz=p[c+2]-p[d+2];
 return ax*(by*cz-bz*cy)+ay*(bz*cx-bx*cz)+az*(bx*cy-by*cx);
}
export function makeMuscleCells(rest:Float32Array,triangles:ArrayLike<number>,opposite:Map<number,number[]>){
 const nodes:number[]=[],volumes:number[]=[];
 for(let t=0;t<triangles.length;t+=3){
  const a=triangles[t],b=triangles[t+1],c=triangles[t+2];
  let best=0,apex=-1;
  for(const d of new Set([...(opposite.get(a)??[]),...(opposite.get(b)??[]),...(opposite.get(c)??[])])){
   if(d===a||d===b||d===c)continue;
   const v=cellDeterminant(rest,a*3,b*3,c*3,d*3);
   if(Math.abs(v)>Math.abs(best)){best=v;apex=d;}
  }
  if(apex>=0&&Math.abs(best)>1e-10){nodes.push(a,b,c,apex);volumes.push(best);}
 }
 return{nodes:new Uint32Array(nodes),volumes:new Float32Array(volumes)};
}
export function constrainMuscleCells(cells:ReturnType<typeof makeMuscleCells>,p:Float32Array,mobility:Float32Array,minimum=.15){
 const g=new Float64Array(12);
 for(let cell=0;cell<cells.volumes.length;cell++){
  const j=cell*4,a=cells.nodes[j]*3,b=cells.nodes[j+1]*3,c=cells.nodes[j+2]*3,d=cells.nodes[j+3]*3;
  const ax=p[a]-p[d],ay=p[a+1]-p[d+1],az=p[a+2]-p[d+2],bx=p[b]-p[d],by=p[b+1]-p[d+1],bz=p[b+2]-p[d+2],cx=p[c]-p[d],cy=p[c+1]-p[d+1],cz=p[c+2]-p[d+2];
  // Almost every cell is healthy: test the signed volume first and build the
  // rest of the gradient only for cells that need correcting (same arithmetic).
  const g0=by*cz-bz*cy,g1=bz*cx-bx*cz,g2=bx*cy-by*cx;
  const volume=ax*g0+ay*g1+az*g2,rest=cells.volumes[cell],ratio=volume/rest;
  if(ratio>=minimum)continue;
  g[0]=g0;g[1]=g1;g[2]=g2;
  g[3]=cy*az-cz*ay;g[4]=cz*ax-cx*az;g[5]=cx*ay-cy*ax;
  g[6]=ay*bz-az*by;g[7]=az*bx-ax*bz;g[8]=ax*by-ay*bx;
  for(let k=0;k<3;k++)g[9+k]=-g[k]-g[3+k]-g[6+k];
  let denominator=0;
  for(let k=0;k<4;k++)denominator+=mobility[cells.nodes[j+k]]*(g[k*3]**2+g[k*3+1]**2+g[k*3+2]**2);
  if(denominator<1e-20)continue;
  const lambda=.4*(rest*minimum-volume)/denominator;
  for(let k=0;k<4;k++){
   const node=cells.nodes[j+k],w=mobility[node],v=k*3;
   const dx=lambda*w*g[v],dy=lambda*w*g[v+1],dz=lambda*w*g[v+2],scale=Math.min(1,.0015/Math.max(1e-12,Math.hypot(dx,dy,dz)));
   p[node*3]+=dx*scale;p[node*3+1]+=dy*scale;p[node*3+2]+=dz*scale;
  }
 }
}
