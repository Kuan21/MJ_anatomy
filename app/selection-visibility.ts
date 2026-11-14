import * as T from 'three';

/**
 * "Is the selected structure on screen?" for the info-card hint (不在目前視野，按 Focus 查看).
 *
 * The answer comes from the structure's own geometry, never from its bounding box: points are sampled ON the posed mesh
 * (vertices at the displayed pose), each point is tested against the camera frustum and the part of the canvas the info card
 * leaves free, and then against the solid structures drawn in front of it. The structure is in view when at least one sampled
 * point is inside the frustum, outside the card and not hidden behind another drawn structure, that is, when it is neither
 * out of the frustum nor completely covered. The old test needed a quarter of its samples to be visible (or the centre of the
 * bounding box for nerves and joint tissue), which called a thin curved sheet or a deep vessel in plain view "not in view".
 */
export interface FreeRect{l:number;r:number;t:number;b:number}
export interface SamplePoint{point:T.Vector3;/** index into the list of sampled meshes, so an occlusion test can tell which mesh the point lies on */mesh:number}

/** Evenly spread vertices of the given meshes (already at their displayed pose), `budget` points in all, in world space. */
export function sampleMeshPoints(meshes:T.Mesh[],budget=96):SamplePoint[]{
 const out:SamplePoint[]=[],usable=meshes.map((mesh,k)=>({mesh,k,pos:mesh.geometry.getAttribute('position') as T.BufferAttribute|undefined})).filter(m=>m.pos&&m.pos.count>0);
 if(!usable.length)return out;
 const total=usable.reduce((n,m)=>n+m.pos!.count,0);
 for(const {mesh,k,pos} of usable){
  // every mesh gets at least a few points, however small it is next to the others
  const want=Math.max(4,Math.round(budget*pos!.count/total)),step=Math.max(1,Math.floor(pos!.count/want));
  mesh.updateWorldMatrix(true,false);
  for(let i=0;i<pos!.count;i+=step)out.push({point:new T.Vector3().fromBufferAttribute(pos!,i).applyMatrix4(mesh.matrixWorld),mesh:k});
 }
 return out;
}

/** Screen position (CSS pixels) of a world point, or null when it is behind the camera or beyond the far plane. */
export function projectToCanvas(camera:T.Camera,point:T.Vector3,width:number,height:number,scratch=new T.Vector3()){
 scratch.copy(point).project(camera);
 if(!Number.isFinite(scratch.x)||scratch.z<-1||scratch.z>1)return null;
 return{x:(scratch.x*.5+.5)*width,y:(-scratch.y*.5+.5)*height};
}

export interface ViewJudgement{inView:boolean;total:number;inFrustum:number;visible:number}
/**
 * `occluded(sample)` says whether a solid structure lies between the camera and the sampled point; it is only asked for points that are already inside the frustum and the free area.
 * Stops early once one point is visible: for the hint a single visible point is enough, and a covered structure is the only case that needs every sample tested.
 */
export function judgeSelectionView(camera:T.Camera,width:number,height:number,free:FreeRect,samples:SamplePoint[],occluded:(s:SamplePoint)=>boolean):ViewJudgement{
 let inFrustum=0,visible=0;const scratch=new T.Vector3();
 for(const s of samples){
  const screen=projectToCanvas(camera,s.point,width,height,scratch);
  if(!screen||screen.x<free.l||screen.x>free.r||screen.y<free.t||screen.y>free.b)continue;
  inFrustum++;
  if(!occluded(s)){visible++;break;}
 }
 return{inView:visible>0,total:samples.length,inFrustum,visible};
}

/** The part of the canvas the info card leaves free: a side card (desktop) cuts off the right, a bottom sheet (phone) the bottom. */
export function freeCanvasRect(width:number,height:number,canvas:{left:number;top:number},sheet?:{left:number;top:number;width:number}|null):FreeRect{
 const free={l:0,r:width,t:0,b:height};
 if(sheet&&sheet.width>0){if(sheet.left-canvas.left>width*.4)free.r=Math.min(free.r,sheet.left-canvas.left);else if(sheet.top-canvas.top>height*.3)free.b=Math.min(free.b,sheet.top-canvas.top);}
 return free;
}
