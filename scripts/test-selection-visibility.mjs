// "Not in view" hint: the verdict comes from points sampled on the structure's own mesh (frustum + card area + occlusion), not from its bounding box.
// Covers: thin curved sheet in plain view (the intercostal-membrane case), deep vessel behind a see-through gap (the dorsal-scapular-artery case),
// a structure fully covered, partly covered, outside the frustum, behind the camera and under the info card.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import ts from 'typescript';
import * as T from 'three';
const root=new URL('../',import.meta.url),tmp=new URL('.sites-runtime/',root);
await mkdir(tmp,{recursive:true});
let src=await readFile(new URL('app/selection-visibility.ts',root),'utf8');
await writeFile(new URL('selection-visibility.mjs',tmp),ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
const {sampleMeshPoints,judgeSelectionView,freeCanvasRect,projectToCanvas}=await import(new URL('selection-visibility.mjs',tmp));

const W=1000,H=700,camera=new T.PerspectiveCamera(34,W/H,.01,100);camera.position.set(0,0,3);camera.lookAt(0,0,0);camera.updateMatrixWorld();camera.updateProjectionMatrix();
const free=freeCanvasRect(W,H,{left:0,top:0},null);
const mat=new T.MeshBasicMaterial({side:T.DoubleSide});
const mesh=(g,x=0,y=0,z=0)=>{const m=new T.Mesh(g,mat);m.position.set(x,y,z);m.updateMatrixWorld(true);return m;};
const shell=()=>mesh(new T.CylinderGeometry(.2,.2,.3,24,6,true,0,Math.PI)); // half-pipe: thin curved sheet, its bounding-box centre is empty space
// occlusion exactly as the scene does it: a ray from the eye to the sample, stopped 4 mm short, against the other structures
const occluderTest=(selected,others)=>s=>{const dir=s.point.clone().sub(camera.position),dist=dir.length();dir.normalize();const ray=new T.Raycaster(camera.position,dir,0,Math.max(0,dist-.004));
 const own=selected[s.mesh];if(ray.intersectObject(own,false).length)return true;return others.some(o=>ray.intersectObject(o,false).length>0);};
const verdict=(selected,others=[],rect=free)=>{const samples=sampleMeshPoints(selected,96);return judgeSelectionView(camera,W,H,rect,samples,occluderTest(selected,others));};

// 1. a thin curved sheet in plain view is in view (bounding-box centre is not on the surface)
{const sheet=shell();sheet.rotation.y=Math.PI/2;sheet.updateMatrixWorld(true);const v=verdict([sheet]);assert.ok(v.inView,'sheet in plain view must be in view');assert.ok(v.total>=4);}
// 2. a vessel behind a wall with a gap: visible through the gap, so in view
{const vessel=mesh(new T.TubeGeometry(new T.LineCurve3(new T.Vector3(-.3,0,-.5),new T.Vector3(.3,0,-.5)),8,.01,6,false));
 const wallA=mesh(new T.BoxGeometry(.18,.6,.05),-.2,0,0),wallB=mesh(new T.BoxGeometry(.18,.6,.05),.2,0,0);
 const v=verdict([vessel],[wallA,wallB]);assert.ok(v.inView,'vessel seen through the gap between two structures must be in view');}
// 3. fully covered: a wall wider than the vessel in front of it
{const vessel=mesh(new T.TubeGeometry(new T.LineCurve3(new T.Vector3(-.2,0,-.5),new T.Vector3(.2,0,-.5)),8,.01,6,false)),wall=mesh(new T.BoxGeometry(1,1,.05),0,0,0);
 const v=verdict([vessel],[wall]);assert.equal(v.inView,false,'a structure completely covered is not in view');assert.equal(v.visible,0);}
// 4. partly covered counts as in view (the old rule wanted a quarter of the samples)
{const vessel=mesh(new T.TubeGeometry(new T.LineCurve3(new T.Vector3(-.6,0,-.5),new T.Vector3(.6,0,-.5)),24,.01,6,false)),wall=mesh(new T.BoxGeometry(1.0,1,.05),-.05,0,0);
 const v=verdict([vessel],[wall]);assert.ok(v.inView,'a mostly covered structure with a visible end is still in view');}
// 5. outside the frustum (far to the side), and behind the camera
{const off=mesh(new T.SphereGeometry(.05,8,8),9,0,0);assert.equal(verdict([off]).inView,false,'outside the frustum');assert.equal(verdict([off]).inFrustum,0);
 const behind=mesh(new T.SphereGeometry(.05,8,8),0,0,6);assert.equal(verdict([behind]).inView,false,'behind the camera');}
// 6. under a side info card: only the part of the canvas the card leaves free counts
{const right=freeCanvasRect(W,H,{left:0,top:0},{left:620,top:0,width:380});assert.equal(right.r,620);
 const hidden=mesh(new T.SphereGeometry(.05,8,8),.55,0,0);const p=projectToCanvas(camera,new T.Vector3(.55,0,0),W,H);assert.ok(p.x>620,'test sphere sits under the card');assert.equal(verdict([hidden],[],right).inView,false,'under the card is not in view');
 const clear=mesh(new T.SphereGeometry(.05,8,8),-.3,0,0);assert.equal(verdict([clear],[],right).inView,true);
 const bottom=freeCanvasRect(390,844,{left:0,top:0},{left:0,top:520,width:390});assert.equal(bottom.b,520);
 assert.equal(freeCanvasRect(W,H,{left:0,top:0},{left:200,top:100,width:300}).r,W,'a card that does not hug an edge cuts nothing off');}
// 7. a long structure running off the screen is in view while any part of it is on screen
{const long=mesh(new T.TubeGeometry(new T.LineCurve3(new T.Vector3(-9,0,0),new T.Vector3(0,0,0)),60,.01,6,false));assert.equal(verdict([long]).inView,true);}
// 8. every sampled mesh gets points, however small it is next to the others (a nerve and a big muscle selected together)
{const big=mesh(new T.SphereGeometry(.4,48,48)),tiny=mesh(new T.SphereGeometry(.002,4,4),9,0,0),pts=sampleMeshPoints([big,tiny],96);assert.ok(pts.some(p=>p.mesh===1),'small mesh sampled');assert.ok(pts.some(p=>p.mesh===0));}
console.log('selection visibility: 8 scenarios passed');
