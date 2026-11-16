// Similarity registration (scale, rotation, translation) of one point cloud onto another: Umeyama alignment inside an iterative closest point loop.
// Points are flat Float64/Float32 arrays [x,y,z,...]. Used to place the IE-Map inner ear in the OpenEar specimen frame.
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
export const centroidOf=p=>{const c=[0,0,0],n=p.length/3;for(let i=0;i<p.length;i++)c[i%3]+=p[i];return c.map(v=>v/n);};
// 3x3 helpers (row-major arrays of arrays)
const mul=(A,B)=>A.map((r,i)=>[0,1,2].map(j=>r[0]*B[0][j]+r[1]*B[1][j]+r[2]*B[2][j]));
const T=A=>[0,1,2].map(i=>[0,1,2].map(j=>A[j][i]));
const det=A=>A[0][0]*(A[1][1]*A[2][2]-A[1][2]*A[2][1])-A[0][1]*(A[1][0]*A[2][2]-A[1][2]*A[2][0])+A[0][2]*(A[1][0]*A[2][1]-A[1][1]*A[2][0]);
const apply=(R,v)=>[R[0][0]*v[0]+R[0][1]*v[1]+R[0][2]*v[2],R[1][0]*v[0]+R[1][1]*v[1]+R[1][2]*v[2],R[2][0]*v[0]+R[2][1]*v[1]+R[2][2]*v[2]];
// SVD of a 3x3 by Jacobi on A^T A: returns U,S,V with A = U diag(S) V^T
const jacobi=M=>{const A=M.map(r=>r.slice()),V=[[1,0,0],[0,1,0],[0,0,1]];
 for(let it=0;it<60;it++){let p=0,q=1,m=0;for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)if(Math.abs(A[i][j])>m){m=Math.abs(A[i][j]);p=i;q=j;}if(m<1e-14)break;
  const th=.5*Math.atan2(2*A[p][q],A[q][q]-A[p][p]),c=Math.cos(th),s=Math.sin(th);
  for(let k=0;k<3;k++){const a=A[k][p],b=A[k][q];A[k][p]=c*a-s*b;A[k][q]=s*a+c*b;}
  for(let k=0;k<3;k++){const a=A[p][k],b=A[q][k];A[p][k]=c*a-s*b;A[q][k]=s*a+c*b;}
  for(let k=0;k<3;k++){const a=V[k][p],b=V[k][q];V[k][p]=c*a-s*b;V[k][q]=s*a+c*b;}}
 return {vals:[A[0][0],A[1][1],A[2][2]],V};};
const svd=A=>{const {vals,V}=jacobi(mul(T(A),A));const order=[0,1,2].sort((a,b)=>vals[b]-vals[a]);
 const S=order.map(i=>Math.sqrt(Math.max(vals[i],0))),Vs=[0,1,2].map(r=>order.map(c=>V[r][c]));
 const AV=mul(A,Vs),U=[0,1,2].map(r=>order.map((_,c)=>S[c]>1e-12?AV[r][c]/S[c]:0));
 // complete a degenerate third column
 if(S[2]<1e-12){const a=[U[0][0],U[1][0],U[2][0]],b=[U[0][1],U[1][1],U[2][1]],c=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];for(let r=0;r<3;r++)U[r][2]=c[r];}
 return {U,S,V:Vs};};
/** Umeyama: s,R,t minimising |s R a + t - b|^2 for matched pairs. proper=true forbids reflections. */
export const umeyama=(a,b,proper=true,fixedScale=0)=>{
 const n=a.length/3,ca=centroidOf(a),cb=centroidOf(b);let var_a=0;const H=[[0,0,0],[0,0,0],[0,0,0]];
 for(let i=0;i<n;i++){const p=[a[i*3]-ca[0],a[i*3+1]-ca[1],a[i*3+2]-ca[2]],q=[b[i*3]-cb[0],b[i*3+1]-cb[1],b[i*3+2]-cb[2]];var_a+=p[0]*p[0]+p[1]*p[1]+p[2]*p[2];for(let r=0;r<3;r++)for(let c=0;c<3;c++)H[r][c]+=q[r]*p[c];}
 for(let r=0;r<3;r++)for(let c=0;c<3;c++)H[r][c]/=n;var_a/=n;
 const {U,S,V}=svd(H),d=det(U)*det(V)<0&&proper?-1:1,D=[[1,0,0],[0,1,0],[0,0,d]];
 const R=mul(mul(U,D),T(V)),scale=fixedScale||(S[0]+S[1]+S[2]*d)/var_a,t=sub(cb,apply(R,ca).map(v=>v*scale));
 return {scale,R,t};};
export const transformPoint=(x,p)=>{const q=apply(x.R,p);return [q[0]*x.scale+x.t[0],q[1]*x.scale+x.t[1],q[2]*x.scale+x.t[2]];};
/** Uniform grid for nearest-point queries. */
export const makeGrid=(pts,cell)=>{const g=new Map(),key=(x,y,z)=>`${Math.floor(x/cell)},${Math.floor(y/cell)},${Math.floor(z/cell)}`;
 for(let i=0;i<pts.length;i+=3){const k=key(pts[i],pts[i+1],pts[i+2]);(g.get(k)??g.set(k,[]).get(k)).push(i);}
 return {nearest(x,y,z,maxRing=6){const cx=Math.floor(x/cell),cy=Math.floor(y/cell),cz=Math.floor(z/cell);let best=Infinity,at=-1;
  for(let r=0;r<=maxRing;r++){for(let i=-r;i<=r;i++)for(let j=-r;j<=r;j++)for(let k=-r;k<=r;k++){if(Math.max(Math.abs(i),Math.abs(j),Math.abs(k))!==r)continue;const l=g.get(`${cx+i},${cy+j},${cz+k}`);if(!l)continue;for(const o of l){const d=(pts[o]-x)**2+(pts[o+1]-y)**2+(pts[o+2]-z)**2;if(d<best){best=d;at=o;}}}
   if(at>=0&&Math.sqrt(best)<=r*cell)break;}
  return {index:at,dist:Math.sqrt(best)};}};};
/** ICP with scale. source/target are flat arrays; init is a transform {scale,R,t}. Returns transform and the rms / 95th percentile distance (target units). */
export const icp=(source,target,init,{iterations=40,cell=1,trim=.9,proper=true,fixedScale=0}={})=>{
 const grid=makeGrid(target,cell);let x=init,rms=0;
 const n=source.length/3;
 for(let it=0;it<iterations;it++){
  const pairs=[];
  for(let i=0;i<n;i++){const p=transformPoint(x,[source[i*3],source[i*3+1],source[i*3+2]]),q=grid.nearest(p[0],p[1],p[2],12);if(q.index<0)continue;pairs.push([i,q.index,q.dist]);}
  pairs.sort((a,b)=>a[2]-b[2]);const keep=pairs.slice(0,Math.max(10,Math.floor(pairs.length*trim)));
  const a=new Float64Array(keep.length*3),b=new Float64Array(keep.length*3);let s=0;
  keep.forEach(([i,j,d],k)=>{a.set([source[i*3],source[i*3+1],source[i*3+2]],k*3);b.set([target[j],target[j+1],target[j+2]],k*3);s+=d*d;});
  rms=Math.sqrt(s/keep.length);x=umeyama(a,b,proper,fixedScale);
 }
 return {...x,rms};
};
/** Distance statistics of source (transformed) to target. */
export const distanceStats=(source,target,x,cell=1)=>{const grid=makeGrid(target,cell),d=[];
 for(let i=0;i<source.length;i+=3){const p=transformPoint(x,[source[i],source[i+1],source[i+2]]);d.push(grid.nearest(p[0],p[1],p[2],20).dist);}
 d.sort((a,b)=>a-b);return {mean:d.reduce((a,b)=>a+b,0)/d.length,median:d[d.length>>1],p95:d[Math.floor(d.length*.95)],max:d[d.length-1]};};
