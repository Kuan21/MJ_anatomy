import {Vector3} from 'three';
import {makeSurfaceGroup,type SurfaceMember} from './surface-constraints';

/** Position-based, anisotropic muscle approximation. Distances THROUGH the
 * belly constrain its thickness as well as surface distances. It is not a
 * physiological force model or a substitute for measured fibre architecture. */
export function makeShoulderMuscles(members:SurfaceMember[],head:Vector3,radius:number){
 const group=makeSurfaceGroup(members),rest=group.positions.slice();
 members.forEach((m,k)=>group.maps[k].forEach((node,i)=>rest.set(m.base.subarray(i*3,i*3+3),node*3)));
 const muscles=members.map((m,member)=>{
  const map=group.maps[member],unique=[...new Set(map)],normals=new Float64Array(rest.length),edges=new Set<string>();
  const links:number[]=[],lengths:number[]=[],axial:number[]=[];
  const axis=m.skin.profile==='deltoid'?1:0;
  const add=(a:number,b:number)=>{
   if(a===b)return;const key=a<b?`${a}:${b}`:`${b}:${a}`;if(edges.has(key))return;edges.add(key);
   const d=Math.hypot(rest[a*3]-rest[b*3],rest[a*3+1]-rest[b*3+1],rest[a*3+2]-rest[b*3+2]);if(d<1e-7)return;
   links.push(a,b);lengths.push(d);axial.push(((rest[a*3+axis]-rest[b*3+axis])/d)**2);
  };
  for(let t=0;t<m.triangles.length;t+=3){
   const ids=[map[m.triangles[t]],map[m.triangles[t+1]],map[m.triangles[t+2]]];
   const [a,b,c]=ids.map(i=>new Vector3().fromArray(rest,i*3));
   const n=b.sub(a).cross(c.sub(a));
   ids.forEach((id,k)=>{for(let j=0;j<3;j++)normals[id*3+j]+=n.getComponent(j);add(id,ids[(k+1)%3]);});
  }
  unique.forEach(i=>{const n=Math.hypot(normals[i*3],normals[i*3+1],normals[i*3+2]);if(n>0)for(let c=0;c<3;c++)normals[i*3+c]/=n;});
  // Only opposite-facing surfaces within this SAME muscle are joined. Never
  // weld adjacent muscles, blood vessels, nerves or nearby but distinct parts.
  let thicknessLinks=0;
  for(const a of unique){
   const candidates:{b:number;d:number}[]=[];
   for(const b of unique){
    if(b===a)continue;
    const dx=rest[b*3]-rest[a*3],dy=rest[b*3+1]-rest[a*3+1],dz=rest[b*3+2]-rest[a*3+2],d=Math.hypot(dx,dy,dz);
    if(d<.001||d>.035)continue;
    const dot=normals[a*3]*normals[b*3]+normals[a*3+1]*normals[b*3+1]+normals[a*3+2]*normals[b*3+2];
    const inward=(dx*normals[a*3]+dy*normals[a*3+1]+dz*normals[a*3+2])/d;
    if(dot<-.5&&inward<-.5)candidates.push({b,d});
   }
   candidates.sort((a,b)=>a.d-b.d);
   for(const {b} of candidates.slice(0,3)){const before=lengths.length;add(a,b);thicknessLinks+=lengths.length-before;}
  }
  const proximal:number[]=[],distal:number[]=[];
  for(let i=0;i<map.length;i++){
   const frame=m.skin.indices[i*4],weight=m.skin.weights[i*4];
   if(weight>=.995){if(frame===3)distal.push(map[i]);else if(frame===1||frame===2)proximal.push(map[i]);}
  }
  const centroid=(ids:number[],p:Float32Array)=>{const v=new Vector3();for(const i of ids)v.add(new Vector3().fromArray(p,i*3));return v.multiplyScalar(1/Math.max(1,ids.length));};
  const a=centroid(proximal,rest),b=centroid(distal,rest);
  const triangles=Uint32Array.from(m.triangles,i=>map[i]);
  return{links:new Uint32Array(links),lengths:new Float32Array(lengths),axial:new Float32Array(axial),thicknessLinks,proximal,distal,centroid,restLength:wrappedLength(a,b,head,radius),triangles,volume:muscleVolume(rest,triangles,head),gradient:new Float64Array(rest.length),unique};
 });
 // Preserve source clearance; do not "correct" rest anatomy by inflating it.
 const clearance=new Float32Array(rest.length/3);
 for(let i=0;i<clearance.length;i++)clearance[i]=Math.min(radius,new Vector3().fromArray(rest,i*3).distanceTo(head));
 return{group,rest,muscles,clearance,head:head.clone(),radius};
}

/** Length of a taut path around a spherical obstacle, used to derive axial
 * strain. Contact projection below is separate from this length estimate. */
export function wrappedLength(a:Vector3,b:Vector3,c:Vector3,r:number):number{
 const va=a.clone().sub(c),vb=b.clone().sub(c),da=va.length(),db=vb.length();
 if(da<=r||db<=r||r<=0)return a.distanceTo(b);
 const angle=Math.acos(Math.max(-1,Math.min(1,va.dot(vb)/(da*db))));
 const arc=angle-Math.acos(r/da)-Math.acos(r/db);
 return arc>0?Math.sqrt(da*da-r*r)+Math.sqrt(db*db-r*r)+r*arc:a.distanceTo(b);
}

export function muscleVolume(p:Float32Array,triangles:ArrayLike<number>,centre:Vector3,gradient?:Float64Array):number{
 gradient?.fill(0);let volume=0;
 for(let t=0;t<triangles.length;t+=3){
  const a=triangles[t]*3,b=triangles[t+1]*3,c=triangles[t+2]*3;
  const ax=p[a]-centre.x,ay=p[a+1]-centre.y,az=p[a+2]-centre.z,bx=p[b]-centre.x,by=p[b+1]-centre.y,bz=p[b+2]-centre.z,cx=p[c]-centre.x,cy=p[c+1]-centre.y,cz=p[c+2]-centre.z;
  volume+=(ax*(by*cz-bz*cy)+ay*(bz*cx-bx*cz)+az*(bx*cy-by*cx))/6;
  if(gradient){
   gradient[a]+=(by*cz-bz*cy)/6;gradient[a+1]+=(bz*cx-bx*cz)/6;gradient[a+2]+=(bx*cy-by*cx)/6;
   gradient[b]+=(cy*az-cz*ay)/6;gradient[b+1]+=(cz*ax-cx*az)/6;gradient[b+2]+=(cx*ay-cy*ax)/6;
   gradient[c]+=(ay*bz-az*by)/6;gradient[c+1]+=(az*bx-ax*bz)/6;gradient[c+2]+=(ax*by-ay*bx)/6;
  }
 }
 return volume;
}

export function solveShoulderMuscles(model:ReturnType<typeof makeShoulderMuscles>,head:Vector3,passes=80){
 const {group,rest}=model,p=group.positions,mobility=group.constraints.mobility;
 group.members.forEach((m,k)=>group.maps[k].forEach((node,i)=>p.set(m.positions.subarray(i*3,i*3+3),node*3)));
 // Exact neutral/rest reset; no numerical constraint creep.
 if(p.every((v,i)=>v===rest[i]))return;
 const targets=model.muscles.map(m=>{
  const length=wrappedLength(m.centroid(m.proximal,p),m.centroid(m.distal,p),head,model.radius);
  const stretch=m.proximal.length&&m.distal.length?Math.max(.5,Math.min(2,length/Math.max(1e-6,m.restLength))):1;
  return m.lengths.map((length,i)=>length*Math.sqrt(m.axial[i]*stretch*stretch+(1-m.axial[i])/stretch));
 });
 for(let pass=0;pass<passes;pass++){
  model.muscles.forEach((m,mi)=>{
   for(let e=pass%2?m.lengths.length-1:0;pass%2?e>=0:e<m.lengths.length;e+=pass%2?-1:1){
    const a=m.links[e*2],b=m.links[e*2+1],ma=mobility[a],mb=mobility[b],sum=ma+mb;if(!sum)continue;
    const i=a*3,j=b*3,dx=p[j]-p[i],dy=p[j+1]-p[i+1],dz=p[j+2]-p[i+2],length=Math.hypot(dx,dy,dz);if(length<1e-9)continue;
    const target=targets[mi][e],error=length>target*1.15?length-target*1.15:length<target*.85?length-target*.85:0;
    if(!error)continue;
    const correction=.8*error/(length*sum);
    p[i]+=dx*correction*ma;p[i+1]+=dy*correction*ma;p[i+2]+=dz*correction*ma;
    p[j]-=dx*correction*mb;p[j+1]-=dy*correction*mb;p[j+2]-=dz*correction*mb;
   }
  });
  // Bulk-volume preservation prevents the folded/flattened sheet failure
  // that a surface edge limit (or local thickness links alone) cannot detect.
  for(const m of model.muscles){
   const volume=muscleVolume(p,m.triangles,head,m.gradient);let denominator=0;
   for(const n of m.unique)if(mobility[n])denominator+=Math.hypot(m.gradient[n*3],m.gradient[n*3+1],m.gradient[n*3+2]);
   if(denominator<1e-20)continue;
   const lambda=(m.volume-volume)/denominator;
   for(const n of m.unique)if(mobility[n]){
    const i=n*3,g=Math.max(1e-12,Math.hypot(m.gradient[i],m.gradient[i+1],m.gradient[i+2])),dx=lambda*m.gradient[i]/g,dy=lambda*m.gradient[i+1]/g,dz=lambda*m.gradient[i+2]/g,scale=Math.min(1,.003/Math.max(1e-12,Math.hypot(dx,dy,dz)));
    p[i]+=dx*scale;p[i+1]+=dy*scale;p[i+2]+=dz*scale;
   }
  }
  // Keep free belly vertices outside the estimated humeral-head surface.
  // Bone-pinned attachments are never displaced by collision correction.
  for(let n=0;n<mobility.length;n++)if(mobility[n]){
   const i=n*3,dx=p[i]-head.x,dy=p[i+1]-head.y,dz=p[i+2]-head.z,d=Math.hypot(dx,dy,dz),r=model.clearance[n];
   if(d<r&&d>1e-9){p[i]=head.x+dx*r/d;p[i+1]=head.y+dy*r/d;p[i+2]=head.z+dz*r/d;}
  }
 }
 // Final local spike guard, independent of triangle size. Bulk constraints
 // cannot certify local mesh quality; report volume/clearance after this pass.
 const edges=group.constraints.edges,lengths=group.constraints.lengths;
 for(let pass=0;pass<80;pass++){
 for(let e=0;e<lengths.length;e++){
  const a=edges[e*2],b=edges[e*2+1],ma=mobility[a],mb=mobility[b],sum=ma+mb;if(!sum)continue;
  const i=a*3,j=b*3,dx=p[j]-p[i],dy=p[j+1]-p[i+1],dz=p[j+2]-p[i+2],length=Math.hypot(dx,dy,dz),max=lengths[e]*2;
  if(length<=max)continue;const correction=(length-max)/(length*sum);
  p[i]+=dx*correction*ma;p[i+1]+=dy*correction*ma;p[i+2]+=dz*correction*ma;
  p[j]-=dx*correction*mb;p[j+1]-=dy*correction*mb;p[j+2]-=dz*correction*mb;
 }
 for(let n=0;n<mobility.length;n++)if(mobility[n]){
  const i=n*3,dx=p[i]-head.x,dy=p[i+1]-head.y,dz=p[i+2]-head.z,d=Math.hypot(dx,dy,dz),r=model.clearance[n];
  if(d<r&&d>1e-9){p[i]=head.x+dx*r/d;p[i+1]=head.y+dy*r/d;p[i+2]=head.z+dz*r/d;}
 }
 }
 group.members.forEach((m,k)=>group.maps[k].forEach((node,i)=>m.positions.set(p.subarray(node*3,node*3+3),i*3)));
}
