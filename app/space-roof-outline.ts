import * as T from 'three';

/**
 * Dashed outline of the roof of a special region while the roof is lifted off (揭開): the roof structure itself is not drawn, only a dashed line in the colour of its
 * system round the part of it that covers the region. The outline is the convex hull, seen along the standard view of the region, of the vertices of the roof mesh
 * that lie inside the sphere (c, r × REACH) around the region; each corner of the hull is a real vertex of the mesh, so the line lies on the surface of the roof.
 */
export interface Roof{ids:string[];color:string;c:[number,number,number];r:number;dir:[number,number,number]}
export const REACH=1.2;

/** Convex hull (Andrew's monotone chain) of 2D points; returns the hull as indices into `pts`, counter-clockwise. */
export function convexHull(pts:{x:number;y:number}[]):number[]{
 const idx=pts.map((_,i)=>i).sort((a,b)=>pts[a]!.x-pts[b]!.x||pts[a]!.y-pts[b]!.y);
 if(idx.length<3)return idx;
 const cross=(o:number,a:number,b:number)=>(pts[a]!.x-pts[o]!.x)*(pts[b]!.y-pts[o]!.y)-(pts[a]!.y-pts[o]!.y)*(pts[b]!.x-pts[o]!.x);
 const lower:number[]=[],upper:number[]=[];
 for(const i of idx){while(lower.length>=2&&cross(lower[lower.length-2]!,lower[lower.length-1]!,i)<=0)lower.pop();lower.push(i);}
 for(const i of [...idx].reverse()){while(upper.length>=2&&cross(upper[upper.length-2]!,upper[upper.length-1]!,i)<=0)upper.pop();upper.push(i);}
 lower.pop();upper.pop();return[...lower,...upper];
}

/** Corners (world space) of the outline of the vertices inside the sphere, seen along `dir`. */
export function roofCorners(points:ArrayLike<number>,c:T.Vector3,radius:number,dir:T.Vector3,normals?:ArrayLike<number>):T.Vector3[]{
 const n=dir.clone().normalize(),up=Math.abs(n.y)>.95?new T.Vector3(0,0,1):new T.Vector3(0,1,0),u=new T.Vector3().crossVectors(up,n).normalize(),v=new T.Vector3().crossVectors(n,u);
 const inside:T.Vector3[]=[],p=new T.Vector3();
 for(let i=0;i<points.length;i+=3){p.set(points[i]!,points[i+1]!,points[i+2]!);if(p.distanceTo(c)>radius)continue;
  // only the surface that looks towards the camera: the inner surface of a thick muscle would put chords behind the structures under it
  if(normals&&normals[i]!*n.x+normals[i+1]!*n.y+normals[i+2]!*n.z<.05)continue;
  inside.push(p.clone());}
 if(inside.length<3)return[];
 const flat=inside.map(q=>({x:q.dot(u),y:q.dot(v)}));
 return convexHull(flat).map(i=>inside[i]!);
}

export function createRoofOutlines(opts:{scene:T.Scene;pick:(id:string)=>T.Mesh|undefined}){
 const group=new T.Group();group.name='MJ roof outlines';opts.scene.add(group);
 let key='',pending=false;
 const clear=()=>{for(const o of [...group.children]){group.remove(o);const l=o as T.Line;l.geometry.dispose();(l.material as T.Material).dispose();}};
 return{
  group,
  /** returns true while a mesh is still streaming in (the caller redraws and calls again) */
  update(roofs:Roof[]|undefined):boolean{
   const next=roofs?.length?JSON.stringify(roofs):'';
   if(next===key&&!pending)return false;
   key=next;pending=false;clear();
   for(const roof of roofs??[]){
    const c=new T.Vector3(...roof.c),dir=new T.Vector3(...roof.dir),n=dir.clone().normalize(),up=Math.abs(n.y)>.95?new T.Vector3(0,0,1):new T.Vector3(0,1,0),u=new T.Vector3().crossVectors(up,n).normalize();
    for(const id of roof.ids){
     const mesh=opts.pick(id);
     if(!mesh){pending=true;continue;}
     mesh.updateWorldMatrix(true,false);
     const pos=mesh.geometry.getAttribute('position');if(!pos)continue;
     const world=new Float32Array(pos.count*3),q=new T.Vector3(),nrm=mesh.geometry.getAttribute('normal'),worldNormals=nrm&&nrm.count===pos.count?new Float32Array(pos.count*3):undefined,nm=new T.Matrix3().getNormalMatrix(mesh.matrixWorld);
     for(let i=0;i<pos.count;i++){q.fromBufferAttribute(pos,i).applyMatrix4(mesh.matrixWorld);world[i*3]=q.x;world[i*3+1]=q.y;world[i*3+2]=q.z;if(worldNormals){q.fromBufferAttribute(nrm,i).applyMatrix3(nm).normalize();worldNormals[i*3]=q.x;worldNormals[i*3+1]=q.y;worldNormals[i*3+2]=q.z;}}
     const corners=roofCorners(world,c,roof.r*REACH,dir,worldNormals);
     if(corners.length<3)continue;
     // five parallel dashed lines, 0.3 mm apart, so the outline reads as one line a few px wide
     for(const off of [-.0006,-.0003,0,.0003,.0006]){
      const pts=[...corners,corners[0]!].map(k=>k.clone().addScaledVector(u,off).addScaledVector(n,.0015));
      const line=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineDashedMaterial({color:new T.Color(roof.color),dashSize:.008,gapSize:.005,depthTest:false,transparent:true,opacity:1}));
      line.computeLineDistances();line.renderOrder=999;line.frustumCulled=false;line.userData.mjRoofOutline=true;group.add(line);
     }
    }
   }
   return pending;
  },
 };
}
