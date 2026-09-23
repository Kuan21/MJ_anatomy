import {Box3,Vector3} from 'three';

/** Perspective fit in camera axes, including depth. World-X/Y fitting clips
 * an extended arm when viewed obliquely or in a narrow tablet workspace. */
export function framingDistance(box:Box3,direction:Vector3,fov:number,aspect:number,widthFraction:number,heightFraction:number){
 const forward=direction.clone().normalize(),right=new Vector3().crossVectors(new Vector3(0,1,0),forward).normalize(),up=new Vector3().crossVectors(forward,right).normalize();
 const center=box.getCenter(new Vector3()),tanV=Math.tan(fov*Math.PI/360)*heightFraction,tanH=Math.tan(fov*Math.PI/360)*aspect*widthFraction;
 let distance=.28;
 for(let i=0;i<8;i++){
  const p=new Vector3(i&1?box.max.x:box.min.x,i&2?box.max.y:box.min.y,i&4?box.max.z:box.min.z).sub(center),depth=p.dot(forward);
  distance=Math.max(distance,depth+Math.abs(p.dot(right))/Math.max(.01,tanH),depth+Math.abs(p.dot(up))/Math.max(.01,tanV));
 }
 return distance*1.12;
}
