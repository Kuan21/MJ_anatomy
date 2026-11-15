// Geometry helpers of the ear atlas build: vector maths, surface splitting and the thin-walled tubes that are built from the anatomy (external acoustic meatus, pharyngotympanic tube).
export const v3={
 add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul:(a,s)=>[a[0]*s,a[1]*s,a[2]*s],
 dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
 len:a=>Math.hypot(a[0],a[1],a[2]),norm:a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];},
 lerp:(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],
};
const smooth=t=>t*t*(3-2*t);
export const bezier=(p0,p1,p2,p3,t)=>{const u=1-t,a=u*u*u,b=3*u*u*t,c=3*u*t*t,d=t*t*t;return [0,1,2].map(k=>a*p0[k]+b*p1[k]+c*p2[k]+d*p3[k]);};
export const bezierTangent=(p0,p1,p2,p3,t)=>{const u=1-t;return v3.norm([0,1,2].map(k=>3*u*u*(p1[k]-p0[k])+6*u*t*(p2[k]-p1[k])+3*t*t*(p3[k]-p2[k])));};

/** Principal axes of a point set: {c, vals (ascending), vecs}. */
export const principalAxes=(pos)=>{
 const n=pos.length/3,c=[0,0,0];for(let i=0;i<pos.length;i++)c[i%3]+=pos[i]/n;
 const C=[[0,0,0],[0,0,0],[0,0,0]];for(let i=0;i<n;i++)for(let a=0;a<3;a++)for(let b=0;b<3;b++)C[a][b]+=(pos[i*3+a]-c[a])*(pos[i*3+b]-c[b])/n;
 const A=C.map(r=>r.slice()),V=[[1,0,0],[0,1,0],[0,0,1]];
 for(let it=0;it<60;it++){let p=0,q=1,m=0;for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)if(Math.abs(A[i][j])>m){m=Math.abs(A[i][j]);p=i;q=j;}if(m<1e-14)break;
  const th=.5*Math.atan2(2*A[p][q],A[q][q]-A[p][p]),co=Math.cos(th),s=Math.sin(th);
  for(let k=0;k<3;k++){const a=A[k][p],b=A[k][q];A[k][p]=co*a-s*b;A[k][q]=s*a+co*b;}
  for(let k=0;k<3;k++){const a=A[p][k],b=A[q][k];A[p][k]=co*a-s*b;A[q][k]=s*a+co*b;}
  for(let k=0;k<3;k++){const a=V[k][p],b=V[k][q];V[k][p]=co*a-s*b;V[k][q]=s*a+co*b;}}
 const ev=[A[0][0],A[1][1],A[2][2]],ord=[0,1,2].sort((a,b)=>ev[a]-ev[b]);
 return {c,vals:ord.map(i=>ev[i]),vecs:ord.map(i=>[V[0][i],V[1][i],V[2][i]])};
};

/** Signed volume of a closed triangle mesh (positive when the faces point outward). */
export const signedVolume=(pos,idx)=>{let s=0;for(let i=0;i<idx.length;i+=3){const a=idx[i]*3,b=idx[i+1]*3,c=idx[i+2]*3;
 s+=pos[a]*(pos[b+1]*pos[c+2]-pos[b+2]*pos[c+1])-pos[a+1]*(pos[b]*pos[c+2]-pos[b+2]*pos[c])+pos[a+2]*(pos[b]*pos[c+1]-pos[b+1]*pos[c]);}return s/6;};

/**
 * A closed thin-walled tube from a list of rings (each ring: the same number of points, in the same order around the lumen).
 * The lumen surface passes through the rings; the outer wall is the lumen pushed `thickness` outward from the ring centre.
 * Both ends are closed by an annulus, so the part is a solid wall with a visible lumen.
 */
export const wallTube=(rings,thickness)=>{
 const n=rings[0].length,pos=[],idx=[];
 const outerOf=ring=>{const c=[0,1,2].map(k=>ring.reduce((s,p)=>s+p[k],0)/n);return ring.map(p=>v3.add(p,v3.mul(v3.norm(v3.sub(p,c)),thickness)));};
 const outer=rings.map(outerOf);
 const push=ring=>{const base=pos.length/3;for(const p of ring)pos.push(...p);return base;};
 const lumenBase=rings.map(push),outerBase=outer.map(push);
 const strip=(base,flip)=>{for(let r=0;r+1<rings.length;r++)for(let i=0;i<n;i++){const j=(i+1)%n,a=base[r]+i,b=base[r]+j,c=base[r+1]+i,d=base[r+1]+j;
  if(!flip)idx.push(a,b,d,a,d,c);else idx.push(a,d,b,a,c,d);}};
 strip(outerBase,false);strip(lumenBase,true);
 for(const [r,flip] of [[0,true],[rings.length-1,false]])for(let i=0;i<n;i++){const j=(i+1)%n,a=outerBase[r]+i,b=outerBase[r]+j,c=lumenBase[r]+i,d=lumenBase[r]+j;
  if(!flip)idx.push(a,b,d,a,d,c);else idx.push(a,d,b,a,c,d);}
 let positions=Float32Array.from(pos),indices=Uint32Array.from(idx);
 if(signedVolume(positions,indices)<0)for(let i=0;i<indices.length;i+=3){const t=indices[i+1];indices[i+1]=indices[i+2];indices[i+2]=t;}
 return {positions,indices};
};

/** Rotation-minimising frames along a sampled centreline: returns [{c,t,u,v}] (t = tangent, u,v span the cross-section). */
export const frames=(points,tangents,up)=>{
 const out=[];let u=v3.norm(v3.sub(up,v3.mul(tangents[0],v3.dot(up,tangents[0]))));
 for(let i=0;i<points.length;i++){const t=tangents[i];u=v3.norm(v3.sub(u,v3.mul(t,v3.dot(u,t))));out.push({c:points[i],t,u,v:v3.cross(t,u)});}
 return out;
};

/** Splits a mesh by a per-vertex label: returns {label:{positions,indices}} (vertices are copied, so each piece is its own mesh; normals are the caller's job). */
export const splitByLabel=(positions,indices,labels)=>{
 const out=new Map();
 for(let t=0;t<indices.length;t+=3){
  const l=[labels[indices[t]],labels[indices[t+1]],labels[indices[t+2]]];
  const tri=l[0]===l[1]||l[0]===l[2]?l[0]:l[1]===l[2]?l[1]:l[0];
  let m=out.get(tri);if(!m){m={pos:[],idx:[],map:new Map()};out.set(tri,m);}
  for(let k=0;k<3;k++){const v=indices[t+k];let n=m.map.get(v);if(n===undefined){n=m.pos.length/3;m.map.set(v,n);m.pos.push(positions[v*3],positions[v*3+1],positions[v*3+2]);}m.idx.push(n);}
 }
 const result={};for(const [k,m] of out)result[k]={positions:Float32Array.from(m.pos),indices:Uint32Array.from(m.idx)};return result;
};
export {smooth};
