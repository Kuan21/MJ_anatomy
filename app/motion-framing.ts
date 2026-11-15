import {Box3,Vector3} from 'three';
import {focusFrame} from './camera-framing';

/**
 * Keeps a moving arm on screen. The camera is never turned and never moves while the arm is inside the part of the canvas the panels leave free;
 * once a joint angle sends any part of the arm (shoulder, elbow, wrist or fingertips, plus a margin for the soft tissue around them) outside that part, or under the title and
 * region bar at the top, the camera backs away along its current line of sight and re-centres just far enough to fit it. It does not zoom back in when the arm comes down:
 * the person may have zoomed in on purpose.
 */
export interface FreeArea{left:number;right:number;top:number;bottom:number}
export interface MotionFrameInput{
 /** world-space joint positions of the posed arm(s) */
 points:Vector3[];
 /** camera screen position of a world point, in canvas pixels (null = behind the camera) */
 project:(p:Vector3)=>{x:number;y:number}|null;
 fov:number;aspect:number;width:number;height:number;free:FreeArea;
 /** line of sight: from the point the camera looks at towards the camera */
 direction:Vector3;
 /** current distance from camera to its target: the camera is never moved closer than this by the framing */
 distance:number;
}
export const FRAME_MARGIN=14,SOFT_TISSUE=.09;
export function armFits(input:Pick<MotionFrameInput,'points'|'project'|'free'>,margin=FRAME_MARGIN){
 const {points,project,free}=input;
 return points.every(p=>{const s=project(p);return !!s&&s.x>=free.left+margin&&s.x<=free.right-margin&&s.y>=free.top+margin&&s.y<=free.bottom-margin;});
}
/** null when the arm already fits; otherwise the camera target, position and view offset that frame it. */
export function motionFrame(input:MotionFrameInput):{target:Vector3;position:Vector3;offset:[number,number]}|null{
 if(!input.points.length||armFits(input))return null;
 const box=new Box3().setFromPoints(input.points).expandByScalar(SOFT_TISSUE),dir=input.direction.clone().normalize();
 const {distance,offset}=focusFrame(box,dir,input.fov,input.aspect,input.width,input.height,input.free);
 const target=box.getCenter(new Vector3());
 return{target,position:target.clone().addScaledVector(dir,Math.max(distance,input.distance)),offset};
}
