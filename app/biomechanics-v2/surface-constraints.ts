import type {SkinBinding} from './soft-tissue';

export interface SurfaceConstraints{edges:Uint32Array;lengths:Float32Array;mobility:Float32Array;seams:Uint32Array}
/** Rest-edge guard for broad sheets. It limits local stretch after skinning;
 * it is not a collision or physiological muscle solver. Rigid attachments stay put. */
export function makeSurfaceConstraints(base:Float32Array,triangles:ArrayLike<number>,skin:SkinBinding):SurfaceConstraints{
 const edges:number[]=[],lengths:number[]=[],seen=new Set<string>(),mobility=new Float32Array(base.length/3),nodes=new Uint32Array(base.length/3),seams:number[]=[],coincident=new Map<string,number>();
 for(let i=0;i<mobility.length;i++)mobility[i]=Math.max(...skin.weights.subarray(i*4,i*4+4))>=.995?0:1;
 // Exported normal seams duplicate a surface vertex. Solving those copies
 // independently tears an otherwise closed muscle along its shading seams.
 for(let i=0;i<nodes.length;i++){
  const key=`${base[i*3]},${base[i*3+1]},${base[i*3+2]}`;
  const first=coincident.get(key);
  if(first===undefined){coincident.set(key,i);nodes[i]=i;}
  else{nodes[i]=first;seams.push(i,first);mobility[first]=Math.min(mobility[first],mobility[i]);}
 }
 for(let t=0;t<triangles.length;t+=3)for(let e=0;e<3;e++){
  const a=Math.min(nodes[triangles[t+e]],nodes[triangles[t+(e+1)%3]]),b=Math.max(nodes[triangles[t+e]],nodes[triangles[t+(e+1)%3]]),key=`${a}:${b}`;
  if(seen.has(key))continue;seen.add(key);const length=Math.hypot(base[a*3]-base[b*3],base[a*3+1]-base[b*3+1],base[a*3+2]-base[b*3+2]);
  if(length<1e-7)continue;edges.push(a,b);lengths.push(length);
 }
 return{edges:new Uint32Array(edges),lengths:new Float32Array(lengths),mobility,seams:new Uint32Array(seams)};
}
export function constrainSurface(c:SurfaceConstraints,positions:Float32Array,passes=6):void{
 for(let pass=0;pass<passes;pass++)for(let k=pass%2?c.lengths.length-1:0;pass%2?k>=0:k<c.lengths.length;k+=pass%2?-1:1){
  const a=c.edges[k*2],b=c.edges[k*2+1],ma=c.mobility[a],mb=c.mobility[b],sum=ma+mb;if(!sum)continue;
  const i=a*3,j=b*3,dx=positions[j]-positions[i],dy=positions[j+1]-positions[i+1],dz=positions[j+2]-positions[i+2],length=Math.hypot(dx,dy,dz),max=c.lengths[k]*1.45;
  if(length<=max)continue;
  const correction=(length-max)/length/sum*.8;
  positions[i]+=dx*correction*ma;positions[i+1]+=dy*correction*ma;positions[i+2]+=dz*correction*ma;
  positions[j]-=dx*correction*mb;positions[j+1]-=dy*correction*mb;positions[j+2]-=dz*correction*mb;
 }
 for(let k=0;k<c.seams.length;k+=2){const a=c.seams[k]*3,b=c.seams[k+1]*3;positions[a]=positions[b];positions[a+1]=positions[b+1];positions[a+2]=positions[b+2];}
}

export interface SurfaceMember {base:Float32Array;triangles:ArrayLike<number>;skin:SkinBinding;positions:Float32Array}
/** Solve all heads together. Exact coincident source vertices share one node,
 * including duplicated vertices along normal seams. Never weld nearby but
 * distinct anatomy, and never accumulate corrections from the previous pose. */
export function makeSurfaceGroup(members:SurfaceMember[]){
 const keys=new Map<string,number>(),base:number[]=[],triangles:number[]=[],weights:number[]=[];
 const maps=members.map(member=>{
  const map=new Uint32Array(member.base.length/3);
  for(let i=0;i<map.length;i++){
   const p=member.base.subarray(i*3,i*3+3),key=`${p[0]},${p[1]},${p[2]}`;
   let node=keys.get(key);
   if(node===undefined){node=keys.size;keys.set(key,node);base.push(...p);weights.push(...member.skin.weights.subarray(i*4,i*4+4));}
   map[i]=node;
  }
  for(let i=0;i<member.triangles.length;i++)triangles.push(map[member.triangles[i]]);
  return map;
 });
 const rest=new Float32Array(base),skin={weights:new Float32Array(weights)} as SkinBinding;
 const constraints=makeSurfaceConstraints(rest,triangles,skin),positions=new Float32Array(base.length);
 return {members,maps,constraints,positions};
}
export function constrainSurfaceGroup(group:ReturnType<typeof makeSurfaceGroup>){
 group.members.forEach((m,k)=>{const map=group.maps[k];for(let i=0;i<map.length;i++)group.positions.set(m.positions.subarray(i*3,i*3+3),map[i]*3);});
 constrainSurface(group.constraints,group.positions,12);
 group.members.forEach((m,k)=>{const map=group.maps[k];for(let i=0;i<map.length;i++)m.positions.set(group.positions.subarray(map[i]*3,map[i]*3+3),i*3);});
}
