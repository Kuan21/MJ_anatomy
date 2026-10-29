import * as T from 'three';
import {clearGpuAttributes} from './biomechanics-v2/gpu-skinning';
import type {OutlineRef,SpaceOutline} from './anatomy';

/**
 * Outline of a special region: a thin tube along each edge of the space and a pale translucent fill over the opening.
 * Every vertex of the outline is a copy of a vertex of a boundary mesh (same position, same part index, same skin weights), re-read from the merged anatomy
 * geometry each time the pose changes, so the shader moves the outline with exactly the transform of the structure that forms the edge (joint motion, GPU skinning,
 * CPU-deformed tissue, exploded layout). The tube ring is built around the copied vertex position; the fill uses only copied vertices.
 */
const TUBE_SIDES=6,TUBE_RADIUS=.0016,APEX_RADIUS=.0005;

interface Source{mesh:T.Mesh;vertex:number;offset:[number,number,number]}
interface Line{color:T.Color;radius:number;points:number[];key?:string}
interface Build{sources:Source[];lines:Line[];fills:number[][];unresolved:number}

/** Ear clipping of a small, nearly planar polygon given by point indices; positions are read through `at`. */
function triangulate(loop:number[],at:(i:number)=>T.Vector3):number[][]{
 if(loop.length<3)return[];
 const n=new T.Vector3();
 for(let i=0;i<loop.length;i++){const a=at(loop[i]),b=at(loop[(i+1)%loop.length]);n.x+=(a.y-b.y)*(a.z+b.z);n.y+=(a.z-b.z)*(a.x+b.x);n.z+=(a.x-b.x)*(a.y+b.y);}
 if(n.lengthSq()<1e-18)return[];
 n.normalize();
 const ax=Math.abs(n.x)>Math.abs(n.y)&&Math.abs(n.x)>Math.abs(n.z)?0:Math.abs(n.y)>Math.abs(n.z)?1:2,u=(ax+1)%3,v=(ax+2)%3;
 const xy=(i:number)=>{const p=at(i).toArray();return[p[u]!,p[v]!];};
 const area=loop.reduce((s,_,i)=>{const[a,b]=[xy(loop[i]!),xy(loop[(i+1)%loop.length]!)];return s+a[0]!*b[1]!-b[0]!*a[1]!;},0),dir=area>=0?1:-1;
 const rest=[...loop],tris:number[][]=[];let guard=rest.length*rest.length;
 const inside=(p:number[],a:number[],b:number[],c:number[])=>{const s=(p1:number[],p2:number[],p3:number[])=>(p1[0]!-p3[0]!)*(p2[1]!-p3[1]!)-(p2[0]!-p3[0]!)*(p1[1]!-p3[1]!);const d1=s(p,a,b),d2=s(p,b,c),d3=s(p,c,a);return!((d1<0||d2<0||d3<0)&&(d1>0||d2>0||d3>0));};
 while(rest.length>3&&guard-->0){
  let clipped=false;
  for(let i=0;i<rest.length;i++){
   const ia=rest[(i+rest.length-1)%rest.length]!,ib=rest[i]!,ic=rest[(i+1)%rest.length]!,a=xy(ia),b=xy(ib),c=xy(ic);
   if(dir*((b[0]!-a[0]!)*(c[1]!-a[1]!)-(b[1]!-a[1]!)*(c[0]!-a[0]!))<=0)continue;
   if(rest.some(k=>k!==ia&&k!==ib&&k!==ic&&inside(xy(k),a,b,c)))continue;
   tris.push([ia,ib,ic]);rest.splice(i,1);clipped=true;break;
  }
  if(!clipped)break;
 }
 if(rest.length===3)tris.push([rest[0]!,rest[1]!,rest[2]!]);
 else for(let i=1;i+1<rest.length;i++)tris.push([rest[0]!,rest[i]!,rest[i+1]!]);
 return tris;
}

export function createSpaceOutline(deps:{scene:T.Scene;tubeMaterial:T.Material;fillMaterial:T.Material;pick:(partId:string)=>T.Mesh|undefined;edgeColor:(hex:string)=>T.Color;fillColor:T.Color;fillAlpha:number}){
 const tube=new T.Mesh(new T.BufferGeometry(),deps.tubeMaterial),fill=new T.Mesh(new T.BufferGeometry(),deps.fillMaterial);
 for(const m of [tube,fill]){m.frustumCulled=false;m.visible=false;m.renderOrder=m===fill?3:4;deps.scene.add(m);}
 let current:SpaceOutline[]|undefined,build:Build|null=null,retry=0,tubeCount=0,fillCount=0,lastPos=new Float32Array(0);
 const tmp=new T.Vector3();

 const resolve=(outlines:SpaceOutline[]):Build=>{
  const sources:Source[]=[],lines:Line[]=[],fills:number[][]=[];let unresolved=0;
  const source=(ref:OutlineRef):number=>{const mesh=deps.pick(ref[0]);if(!mesh?.userData.mergedGeometry){unresolved++;return-1;}sources.push({mesh,vertex:ref[1],offset:[ref[2],ref[3],ref[4]]});return sources.length-1;};
  const merged=(i:number)=>{const s=sources[i]!,g=s.mesh.userData.mergedGeometry as T.BufferGeometry,o=(s.mesh.userData.mergedOffset as number)+s.vertex,a=g.getAttribute('position') as T.BufferAttribute;return tmp.set(a.getX(o)+s.offset[0],a.getY(o)+s.offset[1],a.getZ(o)+s.offset[2]).clone();};
  for(const outline of outlines){
   const chains=outline.chains.map(c=>({color:c.color,pts:c.refs.map(source).filter(i=>i>=0)})).filter(c=>c.pts.length>1);
   for(const c of chains)lines.push({color:deps.edgeColor(c.color),radius:TUBE_RADIUS,points:c.pts,key:c.color});
   // the chains meet at the corners of the space; a hair-thin joint closes any gap between the end of one chain and the start of the next
   for(let i=0;i<chains.length&&chains.length>1&&outline.fill==='polygon';i++){
    const a=chains[i]!.pts.at(-1)!,b=chains[(i+1)%chains.length]!.pts[0]!;
    if(a!==b&&merged(a).distanceTo(merged(b))>.0015)lines.push({color:deps.edgeColor('#868e96'),radius:APEX_RADIUS,points:[a,b]});
   }
   if(outline.fill==='polygon'&&chains.length>=3)fills.push(...triangulate(chains.flatMap(c=>c.pts),merged));
   if(outline.fill==='tube')for(let i=0;i<chains.length;i++){
    const a=chains[i]!.pts,b=chains[(i+1)%chains.length]!.pts,steps=Math.max(a.length,b.length);
    for(let k=0;k+1<steps;k++){
     const a0=a[Math.round(k*(a.length-1)/(steps-1))]!,a1=a[Math.round((k+1)*(a.length-1)/(steps-1))]!,b0=b[Math.round(k*(b.length-1)/(steps-1))]!,b1=b[Math.round((k+1)*(b.length-1)/(steps-1))]!;
     fills.push([a0,a1,b0],[a1,b1,b0]);
    }
   }
   if(outline.apex){
    const apex=source(outline.apex);
    if(apex>=0)for(const c of chains){const mid=c.pts[Math.floor(c.pts.length/2)]!;lines.push({color:deps.edgeColor('#868e96'),radius:APEX_RADIUS,points:[mid,apex]});}
   }
  }
  return{sources,lines,fills,unresolved};
 };

 const allocate=(b:Build)=>{
  tubeCount=b.lines.reduce((n,l)=>n+l.points.length*TUBE_SIDES,0);fillCount=b.sources.length;
  const makeAttributes=(g:T.BufferGeometry,count:number,color:boolean)=>{
   g.setAttribute('position',new T.BufferAttribute(new Float32Array(count*3),3).setUsage(T.DynamicDrawUsage));
   g.setAttribute('normal',new T.BufferAttribute(new Float32Array(count*3),3).setUsage(T.DynamicDrawUsage));
   g.setAttribute('partIndex',new T.BufferAttribute(new Float32Array(count),1).setUsage(T.DynamicDrawUsage));
   g.setAttribute('motionWeight',new T.BufferAttribute(new Float32Array(count).fill(1),1).setUsage(T.DynamicDrawUsage));
   const slots=new Uint8Array(count*4),weights=new Uint16Array(count*4);clearGpuAttributes(slots,weights,0,count);
   g.setAttribute('segIndex',new T.BufferAttribute(slots,4).setUsage(T.DynamicDrawUsage));g.setAttribute('segWeight',new T.BufferAttribute(weights,4,true).setUsage(T.DynamicDrawUsage));
   g.setAttribute('color',new T.BufferAttribute(new Float32Array(count*4),4));void color;
  };
  tube.geometry.dispose();fill.geometry.dispose();tube.geometry=new T.BufferGeometry();fill.geometry=new T.BufferGeometry();
  makeAttributes(tube.geometry,tubeCount,true);makeAttributes(fill.geometry,fillCount,false);
  const ti:number[]=[];let base=0;
  for(const l of b.lines){for(let i=0;i+1<l.points.length;i++)for(let j=0;j<TUBE_SIDES;j++){const a=base+i*TUBE_SIDES+j,b2=base+i*TUBE_SIDES+(j+1)%TUBE_SIDES,c=a+TUBE_SIDES,d=b2+TUBE_SIDES;ti.push(a,b2,c,b2,d,c);}base+=l.points.length*TUBE_SIDES;}
  tube.geometry.setIndex(ti);
  fill.geometry.setIndex(b.fills.flat());
  const tc=tube.geometry.getAttribute('color') as T.BufferAttribute;let v=0;
  for(const l of b.lines)for(let i=0;i<l.points.length*TUBE_SIDES;i++){tc.setXYZW(v++,l.color.r,l.color.g,l.color.b,1);}
  const fc=fill.geometry.getAttribute('color') as T.BufferAttribute;for(let i=0;i<fillCount;i++)fc.setXYZW(i,deps.fillColor.r,deps.fillColor.g,deps.fillColor.b,deps.fillAlpha);
  tc.needsUpdate=true;fc.needsUpdate=true;
 };

 /** Copy the current vertex data of every source vertex into the outline geometry. */
 const refresh=(b:Build)=>{
  const n=b.sources.length,pos=new Float32Array(n*3),part=new Float32Array(n),mw=new Float32Array(n).fill(1),seg=new Uint8Array(n*4),segW=new Uint16Array(n*4);
  lastPos=pos;
  const hasSeg=new Uint8Array(n);
  for(let i=0;i<n;i++){
   const s=b.sources[i]!,g=s.mesh.userData.mergedGeometry as T.BufferGeometry,o=(s.mesh.userData.mergedOffset as number)+s.vertex;
   const p=g.getAttribute('position') as T.BufferAttribute;pos[i*3]=p.getX(o)+s.offset[0];pos[i*3+1]=p.getY(o)+s.offset[1];pos[i*3+2]=p.getZ(o)+s.offset[2];
   part[i]=(g.getAttribute('partIndex') as T.BufferAttribute).getX(o);
   const w=g.getAttribute('motionWeight') as T.BufferAttribute|undefined;if(w)mw[i]=w.getX(o);
   const si=g.getAttribute('segIndex') as T.BufferAttribute|undefined,sw=g.getAttribute('segWeight') as T.BufferAttribute|undefined;
   if(si&&sw){hasSeg[i]=1;for(let k=0;k<4;k++){seg[i*4+k]=(si.array as Uint8Array)[o*4+k]!;segW[i*4+k]=(sw.array as Uint16Array)[o*4+k]!;}}
  }
  const writeShared=(g:T.BufferGeometry,map:number[])=>{
   const pa=g.getAttribute('partIndex') as T.BufferAttribute,ma=g.getAttribute('motionWeight') as T.BufferAttribute,sa=g.getAttribute('segIndex') as T.BufferAttribute,wa=g.getAttribute('segWeight') as T.BufferAttribute;
   map.forEach((src,v)=>{pa.setX(v,part[src]!);ma.setX(v,mw[src]!);if(hasSeg[src])for(let k=0;k<4;k++){(sa.array as Uint8Array)[v*4+k]=seg[src*4+k]!;(wa.array as Uint16Array)[v*4+k]=segW[src*4+k]!;}else{const slots=new Uint8Array(4),weights=new Uint16Array(4);clearGpuAttributes(slots,weights,0,1);for(let k=0;k<4;k++){(sa.array as Uint8Array)[v*4+k]=slots[k]!;(wa.array as Uint16Array)[v*4+k]=weights[k]!;}}});
   for(const a of [pa,ma,sa,wa])a.needsUpdate=true;
  };
  // tube: one ring of vertices round every line point
  const tp=tube.geometry.getAttribute('position') as T.BufferAttribute,tn=tube.geometry.getAttribute('normal') as T.BufferAttribute,map:number[]=[];
  const t=new T.Vector3(),u=new T.Vector3(),w=new T.Vector3(),c=new T.Vector3(),prev=new T.Vector3(),next=new T.Vector3();let v=0;
  for(const l of b.lines){
   for(let i=0;i<l.points.length;i++){
    const at=(k:number,out:T.Vector3)=>out.set(pos[l.points[k]!*3]!,pos[l.points[k]!*3+1]!,pos[l.points[k]!*3+2]!);
    at(i,c);at(Math.max(0,i-1),prev);at(Math.min(l.points.length-1,i+1),next);t.subVectors(next,prev);if(t.lengthSq()<1e-14)t.set(0,1,0);t.normalize();
    u.crossVectors(t,Math.abs(t.y)>.9?w.set(1,0,0):w.set(0,1,0)).normalize();w.crossVectors(t,u).normalize();
    for(let j=0;j<TUBE_SIDES;j++){const a=j/TUBE_SIDES*Math.PI*2,nx=u.x*Math.cos(a)+w.x*Math.sin(a),ny=u.y*Math.cos(a)+w.y*Math.sin(a),nz=u.z*Math.cos(a)+w.z*Math.sin(a);tp.setXYZ(v,c.x+nx*l.radius,c.y+ny*l.radius,c.z+nz*l.radius);tn.setXYZ(v,nx,ny,nz);map.push(l.points[i]!);v++;}
   }
  }
  writeShared(tube.geometry,map);tp.needsUpdate=true;tn.needsUpdate=true;
  // fill: the copied vertices themselves, normals from the triangles
  const fp=fill.geometry.getAttribute('position') as T.BufferAttribute,fn=fill.geometry.getAttribute('normal') as T.BufferAttribute,acc=new Float32Array(n*3);
  for(let i=0;i<n;i++)fp.setXYZ(i,pos[i*3]!,pos[i*3+1]!,pos[i*3+2]!);
  for(const tri of b.fills){
   const a=new T.Vector3(pos[tri[0]!*3],pos[tri[0]!*3+1],pos[tri[0]!*3+2]),bb=new T.Vector3(pos[tri[1]!*3],pos[tri[1]!*3+1],pos[tri[1]!*3+2]),cc=new T.Vector3(pos[tri[2]!*3],pos[tri[2]!*3+1],pos[tri[2]!*3+2]),nn=bb.sub(a).cross(cc.sub(a));
   for(const k of tri){acc[k*3]+=nn.x;acc[k*3+1]+=nn.y;acc[k*3+2]+=nn.z;}
  }
  for(let i=0;i<n;i++){tmp.set(acc[i*3]!,acc[i*3+1]!,acc[i*3+2]!).normalize();fn.setXYZ(i,tmp.x,tmp.y,tmp.z);}
  writeShared(fill.geometry,Array.from({length:n},(_,i)=>i));fp.needsUpdate=true;fn.needsUpdate=true;
 };

 return{
  /** Returns true when the outline changed and the frame must be redrawn. */
  update(outlines:SpaceOutline[]|undefined,poseChanged:boolean):boolean{
   if(!outlines?.length){const was=tube.visible;tube.visible=false;fill.visible=false;current=undefined;build=null;return was;}
   if(outlines!==current){current=outlines;build=null;retry=0;}
   if(!build||(build.unresolved>0&&retry<120&&++retry%20===0)){build=resolve(outlines);allocate(build);poseChanged=true;}
   if(poseChanged||!tube.visible){refresh(build);tube.visible=true;fill.visible=fillCount>0&&build.fills.length>0;return true;}
   return false;
  },
  /** Current position of the middle of the first edge drawn in this colour (the anchor of its label), or null while the outline is not shown. */
  midpoint(key:string):T.Vector3|null{
   if(!build||!tube.visible)return null;
   const line=build.lines.find(l=>l.key===key);if(!line)return null;
   const i=line.points[Math.floor(line.points.length/2)]!;return new T.Vector3(lastPos[i*3]!,lastPos[i*3+1]!,lastPos[i*3+2]!);
  },
  dispose(){deps.scene.remove(tube);deps.scene.remove(fill);tube.geometry.dispose();fill.geometry.dispose();},
 };
}
