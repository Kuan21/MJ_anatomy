import {BufferAttribute,BufferGeometry} from 'three';

// Accumulating metre-scale triangle areas directly into normalized Int16
// attributes rounds small faces to zero. Accumulate in float, normalize once,
// then pack for the GPU. Share shading only across coincident vertices of this
// one tissue; never join neighbouring muscles, vessels or nerves.
const workspaces=new WeakMap<BufferGeometry,{sums:Float32Array;nodes:Uint32Array;fallback:Float32Array}>();
export function prepareSurfaceNormals(geometry:BufferGeometry){
 const position=geometry.getAttribute('position') as BufferAttribute;
 const normal=geometry.getAttribute('normal') as BufferAttribute;
 const p=position.array;
 let work=workspaces.get(geometry);
 if(!work){
  const nodes=new Uint32Array(position.count),fallback=new Float32Array(position.count*3),unique=new Map<string,number>();
  for(let i=0;i<position.count;i++){
   const key=`${p[i*3]},${p[i*3+1]},${p[i*3+2]}`,node=unique.get(key)??i;
   if(!unique.has(key))unique.set(key,i);nodes[i]=node;
   fallback.set([normal.getX(i),normal.getY(i),normal.getZ(i)],i*3);
  }
  work={sums:new Float32Array(position.count*3),nodes,fallback};workspaces.set(geometry,work);
 }
 return work;
}
export function updateSurfaceNormals(geometry:BufferGeometry){
 const position=geometry.getAttribute('position') as BufferAttribute,normal=geometry.getAttribute('normal') as BufferAttribute;
 const indices=geometry.index!.array,p=position.array;
 const {sums,nodes,fallback}=prepareSurfaceNormals(geometry);sums.fill(0);
 for(let t=0;t<indices.length;t+=3){
  const a=indices[t]*3,b=indices[t+1]*3,c=indices[t+2]*3;
  const ux=p[b]-p[a],uy=p[b+1]-p[a+1],uz=p[b+2]-p[a+2],vx=p[c]-p[a],vy=p[c+1]-p[a+1],vz=p[c+2]-p[a+2];
  const x=uy*vz-uz*vy,y=uz*vx-ux*vz,z=ux*vy-uy*vx;
  for(let k=0;k<3;k++){const j=nodes[indices[t+k]]*3;sums[j]+=x;sums[j+1]+=y;sums[j+2]+=z;}
 }
 for(let i=0;i<position.count;i++){
  const j=nodes[i]*3;let x=sums[j],y=sums[j+1],z=sums[j+2],length=Math.sqrt(x*x+y*y+z*z);
  if(length<1e-20){x=fallback[i*3];y=fallback[i*3+1];z=fallback[i*3+2];length=Math.sqrt(x*x+y*y+z*z);}
  if(length<1e-20){x=0;y=1;z=0;length=1;}
  const target=normal.array,jj=i*3;
  if(target instanceof Int16Array){target[jj]=Math.round(x/length*32767);target[jj+1]=Math.round(y/length*32767);target[jj+2]=Math.round(z/length*32767);}
  else{target[jj]=x/length;target[jj+1]=y/length;target[jj+2]=z/length;}
 }
 normal.needsUpdate=true;
}
