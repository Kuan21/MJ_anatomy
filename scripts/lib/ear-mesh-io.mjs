// Readers for the source meshes of the ear atlas (IE-Map binary VTK, OpenEar ASCII PLY and OBJ) and a few mesh helpers.
// A mesh is {positions:Float32Array, indices:Uint32Array} (triangles).
import fs from 'node:fs';

export const readVtk=file=>{
 const b=fs.readFileSync(file);let p=0;
 const line=()=>{let e=b.indexOf(10,p);const s=b.toString('latin1',p,e);p=e+1;return s;};
 let count=0,positions,indices;
 while(p<b.length){
  const l=line().trim();
  if(l.startsWith('POINTS')){count=+l.split(/\s+/)[1];positions=new Float32Array(count*3);for(let i=0;i<count*3;i++)positions[i]=b.readFloatBE(p+i*4);p+=count*12;}
  else if(l.startsWith('POLYGONS')){
   const [,n]=l.split(/\s+/).map(Number),tri=[];
   for(let i=0;i<n;i++){const k=b.readInt32BE(p);p+=4;const v=[];for(let j=0;j<k;j++){v.push(b.readInt32BE(p));p+=4;}for(let j=1;j+1<k;j++)tri.push(v[0],v[j],v[j+1]);}
   indices=Uint32Array.from(tri);break;
  }
 }
 if(!positions||!indices)throw new Error('Unsupported VTK file '+file);
 return {positions,indices};
};

export const readPly=file=>{
 const text=fs.readFileSync(file,'latin1'),m=/end_header\r?\n/.exec(text),head=text.slice(0,m.index),rows=text.slice(m.index+m[0].length).split(/\r?\n/);
 const nv=+/element vertex (\d+)/.exec(head)[1],nf=+/element face (\d+)/.exec(head)[1];
 if(!/format ascii/.test(head))throw new Error('Only ASCII PLY is supported');
 const positions=new Float32Array(nv*3),tri=[];
 for(let i=0;i<nv;i++){const c=rows[i].trim().split(/\s+/);positions[i*3]=+c[0];positions[i*3+1]=+c[1];positions[i*3+2]=+c[2];}
 for(let i=0;i<nf;i++){const c=rows[nv+i].trim().split(/\s+/).map(Number),k=c[0];for(let j=1;j+1<k;j++)tri.push(c[1],c[1+j],c[2+j]);}
 return {positions,indices:Uint32Array.from(tri)};
};

export const readObj=file=>{
 const pos=[],tri=[];
 for(const l of fs.readFileSync(file,'latin1').split('\n')){
  if(l.startsWith('v '))pos.push(...l.trim().split(/\s+/).slice(1,4).map(Number));
  else if(l.startsWith('f ')){const v=l.trim().split(/\s+/).slice(1).map(s=>+s.split('/')[0]-1);for(let j=1;j+1<v.length;j++)tri.push(v[0],v[j],v[j+1]);}
 }
 return {positions:Float32Array.from(pos),indices:Uint32Array.from(tri)};
};

export const bounds=pos=>{const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(let i=0;i<pos.length;i++){const a=i%3;if(pos[i]<lo[a])lo[a]=pos[i];if(pos[i]>hi[a])hi[a]=pos[i];}return [lo,hi];};
export const centroid=pos=>{const c=[0,0,0],n=pos.length/3;for(let i=0;i<pos.length;i++)c[i%3]+=pos[i];return c.map(v=>v/n);};

/** Area-weighted vertex normals as Int16 (the package format). */
export const vertexNormals=(positions,indices)=>{
 const sum=new Float64Array(positions.length);
 for(let i=0;i<indices.length;i+=3){
  const a=indices[i]*3,b=indices[i+1]*3,c=indices[i+2]*3;
  const ux=positions[b]-positions[a],uy=positions[b+1]-positions[a+1],uz=positions[b+2]-positions[a+2],vx=positions[c]-positions[a],vy=positions[c+1]-positions[a+1],vz=positions[c+2]-positions[a+2];
  const n=[uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx];
  for(const v of [a,b,c])for(let k=0;k<3;k++)sum[v+k]+=n[k];
 }
 const normals=new Int16Array(positions.length);
 for(let i=0;i<sum.length;i+=3){const l=Math.hypot(sum[i],sum[i+1],sum[i+2])||1;for(let k=0;k<3;k++)normals[i+k]=Math.round(sum[i+k]/l*32767);}
 return normals;
};
