// Joint motion keeps the arm on screen (app/motion-framing.ts): the camera stays put while the arm fits the free part of the canvas, and backs away along its line of sight when it does not.
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
import * as T from 'three';
const {motionFrame,armFits,FRAME_MARGIN}=await quizModule('app/motion-framing.ts');
const W=1200,H=800,fov=34,aspect=W/H;
const camera=new T.PerspectiveCamera(fov,aspect,.05,100);camera.position.set(0,1.2,3);camera.lookAt(0,1.2,0);camera.updateMatrixWorld();camera.updateProjectionMatrix();
const project=p=>{const v=p.clone().project(camera);return v.z<-1||v.z>1?null:{x:(v.x*.5+.5)*W,y:(-v.y*.5+.5)*H};};
// the title and region bar occupy the top 130 px, the left panel 320 px, the right panels 340 px
const free={left:320,right:W-340,top:130,bottom:H-40};
const base={project,fov,aspect,width:W,height:H,free,direction:new T.Vector3(0,0,1),distance:3};
// 1. an arm hanging at the side fits: nothing moves
const hanging=[new T.Vector3(-.17,1.4,0),new T.Vector3(-.2,1.12,0),new T.Vector3(-.22,.88,0),new T.Vector3(-.23,.7,0)];
assert.ok(armFits({points:hanging,project,free}));assert.equal(motionFrame({...base,points:hanging}),null);
// 2. an arm raised overhead leaves the top of the free area: the camera backs away and re-centres, along the same line of sight
const raised=[new T.Vector3(-.17,1.4,0),new T.Vector3(-.2,1.95,0),new T.Vector3(-.2,2.5,0),new T.Vector3(-.2,2.95,0)];
assert.equal(armFits({points:raised,project,free}),false);
const f=motionFrame({...base,points:raised});assert.ok(f,'a raised arm must be re-framed');
assert.ok(f.position.clone().sub(f.target).normalize().distanceTo(new T.Vector3(0,0,1))<1e-9,'the line of sight is kept');
assert.ok(f.position.distanceTo(f.target)>=3,'the camera backs away, it does not come closer');
// after the move the whole arm lies inside the free area (check with the framing's own camera and view offset)
const moved=new T.PerspectiveCamera(fov,aspect,.05,100);moved.position.copy(f.position);moved.lookAt(f.target);moved.setViewOffset(W,H,f.offset[0],f.offset[1],W,H);moved.updateMatrixWorld();moved.updateProjectionMatrix();
const after=p=>{const v=p.clone().project(moved);return{x:(v.x*.5+.5)*W,y:(-v.y*.5+.5)*H};};
for(const p of raised){const s=after(p);assert.ok(s.x>=free.left&&s.x<=free.right&&s.y>=free.top&&s.y<=free.bottom,`joint ${p.toArray()} lands at ${s.x.toFixed(0)},${s.y.toFixed(0)} outside the free area`);}
// 3. an arm that reaches up to the title (inside the top 130 px) counts as not fitting even though it is inside the canvas
const underTitle=[new T.Vector3(-.17,1.4,0),new T.Vector3(-.2,1.9,0)];const tp=project(underTitle[1]);
assert.ok(tp.y>0&&tp.y<free.top+FRAME_MARGIN,'test point sits under the title area');assert.equal(armFits({points:underTitle,project,free}),false);
// 4. a point behind the camera cannot fit
assert.equal(armFits({points:[new T.Vector3(0,1.2,9)],project,free}),false);
// 5. no points: nothing to do
assert.equal(motionFrame({...base,points:[]}),null);
console.log('motion framing: 5 scenarios passed');
