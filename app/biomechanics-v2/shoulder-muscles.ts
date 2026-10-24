import {Vector3} from 'three';
import {makeSurfaceGroup,type SurfaceMember} from './surface-constraints';
import {makeMuscleCells,constrainMuscleCells} from './muscle-cells';
// Coordinates are metres, bounded by the atlas; no overflow-safe hypot is
// needed in the millions of inner-loop distance calculations.
const length3=(x:number,y:number,z:number)=>Math.sqrt(x*x+y*y+z*z);

/** Position-based, anisotropic muscle approximation. Distances THROUGH the
 * belly constrain its thickness as well as surface distances. It is not a
 * physiological force model or a substitute for measured fibre architecture. */
/** Which skeleton frames hold a muscle's two attachments (0 trunk, 1 clavicle, 2 scapula, 3 humerus). Broad sheets
 * (pectoralis major, trapezius, rhomboids, levator scapulae, pectoralis minor) are solved like any belly:
 * collars on their bones stay fixed, the belly keeps its volume and cannot fold flat as the girdle moves. */
export const SHEET_PROFILES=['chest','pectoralPath','scapular'];
const SHOULDER_ANCHORS={proximal:[1,2],distal:[3]};

/** Static bone surface samples (ribs, sternum, thoracic vertebrae) that a free muscle vertex may approach but not sink into. */
export interface PointCollider{nearest(x:number,y:number,z:number,limit:number):[number,number,number,number]|null}
export function makePointCollider(points:Float32Array,cell=.012):PointCollider{
 const grid=new Map<number,number[]>(),key=(x:number,y:number,z:number)=>((x+4096)*8192+(y+4096))*8192+(z+4096);
 for(let i=0;i<points.length;i+=3){const k=key(Math.floor(points[i]/cell),Math.floor(points[i+1]/cell),Math.floor(points[i+2]/cell));let l=grid.get(k);if(!l)grid.set(k,l=[]);l.push(i);}
 return{nearest(x,y,z,limit){
  const r=Math.ceil(limit/cell),cx=Math.floor(x/cell),cy=Math.floor(y/cell),cz=Math.floor(z/cell);let best=limit*limit,bi=-1;
  for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++)for(let c=-r;c<=r;c++){const l=grid.get(key(cx+a,cy+b,cz+c));if(!l)continue;for(const i of l){const dx=points[i]-x,dy=points[i+1]-y,dz=points[i+2]-z,d=dx*dx+dy*dy+dz*dz;if(d<best){best=d;bi=i;}}}
  return bi<0?null:[Math.sqrt(best),points[bi],points[bi+1],points[bi+2]];
 }};
}
function anchorFrames(members:SurfaceMember[]){
 const profile=members[0]?.skin.profile;
 if(profile==='chest'||profile==='pectoralPath')return{proximal:[0,1],distal:[3]};
 if(profile==='scapular')return{proximal:[0],distal:[1,2]};
 return SHOULDER_ANCHORS;
}
export function makeShoulderMuscles(members:SurfaceMember[],head:Vector3,radius:number,frames?:{proximal:number[];distal:number[]},collider?:PointCollider){
 const anchors=frames??anchorFrames(members),sheet=SHEET_PROFILES.includes(members[0]?.skin.profile??'');
 const group=makeSurfaceGroup(members),rest=group.positions.slice();
 const longitudinal=members.every(m=>!!m.skin.fibre);
 if(longitudinal){
  radius=0;group.constraints.mobility.fill(1);
  members.forEach((m,k)=>group.maps[k].forEach((node,i)=>{
   const t=m.skin.fibre!.coordinates[i];
   let hand=0;for(let j=0;j<4;j++)if(m.skin.indices[i*4+j]===6)hand+=m.skin.weights[i*4+j];
   const free=Math.min(1,Math.min(t,1-t)/.12)*(1-hand);
   group.constraints.mobility[node]=Math.min(group.constraints.mobility[node],free<1e-6?0:free);
  }));
 }
 members.forEach((m,k)=>group.maps[k].forEach((node,i)=>rest.set(m.base.subarray(i*3,i*3+3),node*3)));
 const muscles=members.map((m,member)=>{
  const map=group.maps[member],unique=[...new Set(map)],normals=new Float64Array(rest.length),edges=new Set<string>();
  const links:number[]=[],lengths:number[]=[],axial:number[]=[],stiffness:number[]=[];
  const add=(a:number,b:number,strength=.8)=>{
   if(a===b)return;const key=a<b?`${a}:${b}`:`${b}:${a}`;if(edges.has(key))return;edges.add(key);
   const d=length3(rest[a*3]-rest[b*3],rest[a*3+1]-rest[b*3+1],rest[a*3+2]-rest[b*3+2]);if(d<1e-7)return;
   links.push(a,b);lengths.push(d);stiffness.push(strength);
  };
  for(let t=0;t<m.triangles.length;t+=3){
   const ids=[map[m.triangles[t]],map[m.triangles[t+1]],map[m.triangles[t+2]]];
   const [a,b,c]=ids.map(i=>new Vector3().fromArray(rest,i*3));
   const n=b.sub(a).cross(c.sub(a));
   ids.forEach((id,k)=>{for(let j=0;j<3;j++)normals[id*3+j]+=n.getComponent(j);add(id,ids[(k+1)%3]);});
  }
  unique.forEach(i=>{const n=length3(normals[i*3],normals[i*3+1],normals[i*3+2]);if(n>0)for(let c=0;c<3;c++)normals[i*3+c]/=n;});
  // Edge lengths and bulk volume alone permit neighbouring triangles to
  // hinge into sharp folds. Cross-edge diagonals retain local sheet curvature
  // without welding separate muscles or restricting their bone attachments.
  const opposite=new Map<string,number[]>();
  for(let t=0;t<m.triangles.length;t+=3){
   const ids=[map[m.triangles[t]],map[m.triangles[t+1]],map[m.triangles[t+2]]];
   for(let k=0;k<3;k++){const a=ids[k],b=ids[(k+1)%3],key=a<b?`${a}:${b}`:`${b}:${a}`;const list=opposite.get(key)??[];list.push(ids[(k+2)%3]);opposite.set(key,list);}
  }
  let bendingLinks=0;
  for(const ids of opposite.values())if(ids.length===2){const before=lengths.length;add(ids[0],ids[1],.25);bendingLinks+=lengths.length-before;}
  // Only opposite-facing surfaces within this SAME muscle are joined. Never
  // weld adjacent muscles, blood vessels, nerves or nearby but distinct parts.
  let thicknessLinks=0;const through=new Map<number,number[]>();
  for(const a of unique){
   const candidates:{b:number;d:number}[]=[];
   for(const b of unique){
    if(b===a)continue;
    const dx=rest[b*3]-rest[a*3],dy=rest[b*3+1]-rest[a*3+1],dz=rest[b*3+2]-rest[a*3+2],d2=dx*dx+dy*dy+dz*dz;
    if(d2<.001**2||d2>.035**2)continue;
    const d=Math.sqrt(d2);
    const dot=normals[a*3]*normals[b*3]+normals[a*3+1]*normals[b*3+1]+normals[a*3+2]*normals[b*3+2];
    const inward=(dx*normals[a*3]+dy*normals[a*3+1]+dz*normals[a*3+2])/d;
    if(dot<-.5&&inward<-.5)candidates.push({b,d});
   }
   candidates.sort((a,b)=>a.d-b.d);
   through.set(a,candidates.slice(0,3).map(x=>x.b));
   for(const {b} of candidates.slice(0,3)){const before=lengths.length;add(a,b);thicknessLinks+=lengths.length-before;}
  }
  const proximal:number[]=[],distal:number[]=[];
  for(let i=0;i<map.length;i++){
   const frame=m.skin.indices[i*4],weight=m.skin.weights[i*4];
   if(longitudinal){const t=m.skin.fibre!.coordinates[i];if(t<.025)proximal.push(map[i]);if(t>.975)distal.push(map[i]);}
   else if(weight>=.995){if(anchors.distal.includes(frame))distal.push(map[i]);else if(anchors.proximal.includes(frame))proximal.push(map[i]);}
  }
  const centroid=(ids:number[],p:Float32Array)=>{const v=new Vector3();for(const i of ids)v.add(new Vector3().fromArray(p,i*3));return v.multiplyScalar(1/Math.max(1,ids.length));};
  const a=centroid(proximal,rest),b=centroid(distal,rest);
  // Derive longitudinal strain from this muscle's own attachments, not a
  // world X/Y axis. This remains an estimated bulk fibre direction, not
  // measured fascicles. Without two distinct anchors, use no directional bias.
  const direction=b.clone().sub(a),hasAxis=proximal.length>0&&distal.length>0&&direction.lengthSq()>1e-12;
  direction.normalize();
  for(let e=0;e<lengths.length;e++){
   const i=links[e*2]*3,j=links[e*2+1]*3;
   const projection=((rest[j]-rest[i])*direction.x+(rest[j+1]-rest[i+1])*direction.y+(rest[j+2]-rest[i+2])*direction.z)/lengths[e];
   axial.push(hasAxis?Math.min(1,projection*projection):1/3);
  }
  const triangles=Uint32Array.from(m.triangles,i=>map[i]);
  // A bent route has not necessarily shortened. Measure the material route
  // through the belly, not the chord between the two attachment endpoints.
  const stations=Array.from({length:17},()=>[] as number[]);
  if(m.skin.fibre)for(let i=0;i<map.length;i++)stations[Math.min(16,Math.round(m.skin.fibre.coordinates[i]*16))].push(map[i]);
  const routeLength=(p:Float32Array)=>{
   const centres=stations.filter(s=>s.length).map(s=>centroid(s,p));let length=0;
   for(let i=1;i<centres.length;i++)length+=centres[i].distanceTo(centres[i-1]);return length;
  };
  return{routeLength,restRoute:routeLength(rest),cells:makeMuscleCells(rest,triangles,through),links:new Uint32Array(links),lengths:new Float32Array(lengths),axial:new Float32Array(axial),stiffness:new Float32Array(stiffness),bendingLinks,thicknessLinks,proximal,distal,centroid,restLength:wrappedLength(a,b,head,radius),triangles,volume:muscleVolume(rest,triangles,head),gradient:new Float64Array(rest.length),unique};
 });
 // Preserve source clearance; do not "correct" rest anatomy by inflating it.
 const clearance=new Float32Array(rest.length/3);
 for(let i=0;i<clearance.length;i++)clearance[i]=Math.min(radius,new Vector3().fromArray(rest,i*3).distanceTo(head));
 // Only free vertices with a non-zero clearance can ever be pushed out of the head: elsewhere the test below can never
 // fire. Longitudinal muscles use radius 0, so they skip the collision scans entirely.
 const mobility=group.constraints.mobility,colliders=Uint32Array.from({length:clearance.length},(_,i)=>i).filter(i=>mobility[i]&&clearance[i]>0);
 // Broad sheets also keep clear of the thoracic cage: a free vertex may not sink closer to a rib, the sternum or a vertebra than
 // (a little under) its rest distance, capped at 4 mm. Attachment collars (mobility 0) are never moved.
 const boneNodes:number[]=[],boneClearance:number[]=[];
 if(collider&&sheet)for(let n=0;n<clearance.length;n++){
  if(!mobility[n])continue;
  const near=collider.nearest(rest[n*3],rest[n*3+1],rest[n*3+2],.05);
  if(near){boneNodes.push(n);boneClearance.push(Math.min(near[0]*.9,.004));}
 }
 return{group,rest,muscles,clearance,colliders,head:head.clone(),radius,longitudinal,sheet,collider,boneNodes:Uint32Array.from(boneNodes),boneClearance:Float32Array.from(boneClearance)};
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

/** `nodes` (optional) lists the only gradient entries a muscle touches, so a muscle in a large shared group clears
 * its own vertices instead of the whole group's array. */
export function muscleVolume(p:Float32Array,triangles:ArrayLike<number>,centre:Vector3,gradient?:Float64Array,nodes?:ArrayLike<number>):number{
 if(gradient){if(nodes){for(let k=0;k<nodes.length;k++){const i=nodes[k]*3;gradient[i]=0;gradient[i+1]=0;gradient[i+2]=0;}}else gradient.fill(0);}
 let volume=0;
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

export function solveShoulderMuscles(model:ReturnType<typeof makeShoulderMuscles>,head:Vector3,passes=model.longitudinal?24:model.sheet?32:80){
 const {group,rest}=model,p=group.positions,mobility=group.constraints.mobility;
 group.members.forEach((m,k)=>group.maps[k].forEach((node,i)=>p.set(m.positions.subarray(i*3,i*3+3),node*3)));
 // Exact neutral/rest reset; no numerical constraint creep.
 if(p.every((v,i)=>v===rest[i]))return;
 const targets=model.muscles.map(m=>{
  const length=wrappedLength(m.centroid(m.proximal,p),m.centroid(m.distal,p),head,model.radius);
  const ratio=model.longitudinal&&m.restRoute>1e-6?m.routeLength(p)/m.restRoute:m.proximal.length&&m.distal.length?length/Math.max(1e-6,m.restLength):1;
  const stretch=Math.max(.5,Math.min(2,ratio));
  return m.lengths.map((length,i)=>length*Math.sqrt(m.axial[i]*stretch*stretch+(1-m.axial[i])/stretch));
 });
 const preserveVolume=()=>{
  for(const m of model.muscles){
   const volume=muscleVolume(p,m.triangles,head,m.gradient,m.unique);let denominator=0;
   for(const n of m.unique)if(mobility[n]){const i=n*3;denominator+=mobility[n]*(m.gradient[i]**2+m.gradient[i+1]**2+m.gradient[i+2]**2);}
   if(denominator<1e-20)continue;
   const lambda=(m.volume-volume)/denominator;
   for(const n of m.unique)if(mobility[n]){
    // Minimum-displacement volume projection. Normalising every vertex's
    // gradient used to push tiny surface triangles as far as broad belly
    // regions, and ignored the attachment collar's fractional mobility.
    const i=n*3,weight=mobility[n],dx=lambda*weight*m.gradient[i],dy=lambda*weight*m.gradient[i+1],dz=lambda*weight*m.gradient[i+2],scale=Math.min(1,.003/Math.max(1e-12,length3(dx,dy,dz)));
    p[i]+=dx*scale;p[i+1]+=dy*scale;p[i+2]+=dz*scale;
   }
  }
 };
 const pushOffBones=()=>{
  const collider=model.collider;if(!collider)return;
  for(let k=0;k<model.boneNodes.length;k++){
   const n=model.boneNodes[k],i=n*3,clear=model.boneClearance[k],q=collider.nearest(p[i],p[i+1],p[i+2],clear);
   if(q&&q[0]<clear){const dx=p[i]-q[1],dy=p[i+1]-q[2],dz=p[i+2]-q[3],d=length3(dx,dy,dz);if(d>1e-9){p[i]=q[1]+dx*clear/d;p[i+1]=q[2]+dy*clear/d;p[i+2]=q[3]+dz*clear/d;}}
  }
 };
 for(let pass=0;pass<passes;pass++){
  const reverse=pass%2===1;
  model.muscles.forEach((m,mi)=>{
   const {links,stiffness}=m,target=targets[mi],count=m.lengths.length;
   for(let k=0;k<count;k++){
    const e=reverse?count-1-k:k;
    const a=links[e*2],b=links[e*2+1],ma=mobility[a],mb=mobility[b],sum=ma+mb;if(!sum)continue;
    const i=a*3,j=b*3,dx=p[j]-p[i],dy=p[j+1]-p[i+1],dz=p[j+2]-p[i+2],length=length3(dx,dy,dz);if(length<1e-9)continue;
    const goal=target[e],error=length>goal*1.15?length-goal*1.15:length<goal*.85?length-goal*.85:0;
    if(!error)continue;
    const correction=stiffness[e]*error/(length*sum);
    p[i]+=dx*correction*ma;p[i+1]+=dy*correction*ma;p[i+2]+=dz*correction*ma;
    p[j]-=dx*correction*mb;p[j+1]-=dy*correction*mb;p[j+2]-=dz*correction*mb;
   }
  });
  // Bulk-volume preservation prevents the folded/flattened sheet failure
  // that a surface edge limit (or local thickness links alone) cannot detect.
  for(const m of model.muscles)constrainMuscleCells(m.cells,p,mobility);
  preserveVolume();
  // Keep free belly vertices outside the estimated humeral-head surface.
  // Bone-pinned attachments are never displaced by collision correction.
  for(const n of model.colliders){
   const i=n*3,dx=p[i]-head.x,dy=p[i+1]-head.y,dz=p[i+2]-head.z,d=length3(dx,dy,dz),r=model.clearance[n];
   if(d<r&&d>1e-9){p[i]=head.x+dx*r/d;p[i+1]=head.y+dy*r/d;p[i+2]=head.z+dz*r/d;}
  }
  pushOffBones();
 }
 // Final local spike guard, independent of triangle size. Bulk constraints
 // cannot certify local mesh quality; report volume/clearance after this pass.
 const edges=group.constraints.edges,lengths=group.constraints.lengths;
 for(let pass=0;pass<passes;pass++){
 for(let e=0;e<lengths.length;e++){
  const a=edges[e*2],b=edges[e*2+1],ma=mobility[a],mb=mobility[b],sum=ma+mb;if(!sum)continue;
  const i=a*3,j=b*3,dx=p[j]-p[i],dy=p[j+1]-p[i+1],dz=p[j+2]-p[i+2],length=length3(dx,dy,dz),max=lengths[e]*2;
  if(length<=max)continue;const correction=(length-max)/(length*sum);
  p[i]+=dx*correction*ma;p[i+1]+=dy*correction*ma;p[i+2]+=dz*correction*ma;
  p[j]-=dx*correction*mb;p[j+1]-=dy*correction*mb;p[j+2]-=dz*correction*mb;
 }
 // The edge guard must not flatten away the volume just solved above.
 // Alternate both constraints; attachment mobility remains zero throughout.
 for(const m of model.muscles)constrainMuscleCells(m.cells,p,mobility);
 preserveVolume();
 for(const n of model.colliders){
  const i=n*3,dx=p[i]-head.x,dy=p[i+1]-head.y,dz=p[i+2]-head.z,d=length3(dx,dy,dz),r=model.clearance[n];
  if(d<r&&d>1e-9){p[i]=head.x+dx*r/d;p[i+1]=head.y+dy*r/d;p[i+2]=head.z+dz*r/d;}
 }
 pushOffBones();
 }
 // End with orientation recovery: bulk-volume/edge projection can otherwise
 // re-invert a small cell on its last iteration. Preserve bone clearance and
 // exact fixed attachments; do not accumulate this correction between poses.
 for(let pass=0;model.longitudinal&&pass<24;pass++){
  for(const m of model.muscles)constrainMuscleCells(m.cells,p,mobility,.02);
  for(const n of model.colliders){
   const i=n*3,dx=p[i]-head.x,dy=p[i+1]-head.y,dz=p[i+2]-head.z,d=length3(dx,dy,dz),r=model.clearance[n];
   if(d<r&&d>1e-9){p[i]=head.x+dx*r/d;p[i+1]=head.y+dy*r/d;p[i+2]=head.z+dz*r/d;}
  }
 }
 group.members.forEach((m,k)=>group.maps[k].forEach((node,i)=>m.positions.set(p.subarray(node*3,node*3+3),i*3)));
}
