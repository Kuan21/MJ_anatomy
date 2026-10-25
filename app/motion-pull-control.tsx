import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {GripVertical} from 'lucide-react';

export default function MotionPullControl({
 label,value,min,max,disabled=false,onValueChange
}:{
 label:string;
 value:number;
 min:number;
 max:number;
 disabled?:boolean;
 onValueChange:(value:number)=>void;
}){
 // While dragging, the slider keeps its own value so a drag step re-renders only this small control; the parent (the whole page) is updated
 // once per animation frame by its own scheduler. After the frame the control goes back to the value the parent settled on, which is
 // lower than the dragged value when a joint limit or the collision envelope stopped the movement.
 const [dragged,setDragged]=useState<number|null>(null),release=useRef(0);
 useEffect(()=>()=>cancelAnimationFrame(release.current),[]);
 const shown=dragged??value;
 const span=Math.max(.001,max-min);
 const position=Math.max(0,Math.min(100,(shown-min)/span*100));
 const zero=Math.max(0,Math.min(100,(0-min)/span*100));
 const fillLeft=Math.min(position,zero),fillWidth=Math.abs(position-zero);
 return <div className="motion-pull-controller">
  <div className="motion-pull-head">
   <div><span>手動關節控制</span><strong>{label}</strong></div>
   <output>{shown>0?'+':''}{Math.round(shown)}°</output>
  </div>
  <label className={'motion-angle-track '+(disabled?'disabled':'')}>
   <span className="motion-pull-label"><b>拖動角度</b><small>Drag angle</small></span>
   <div className="motion-pull-rail" style={{'--pull':position/100,'--zero':zero/100} as CSSProperties}>
    <i className="motion-pull-fill" style={{left:`${fillLeft}%`,width:`${fillWidth}%`}}/>
    <span className="motion-pull-anchor" style={{left:`${zero}%`}}/>
    <span className="motion-pull-handle" style={{left:`${position}%`}}><GripVertical size={13}/></span>
    <input aria-label={label+' angle'} type="range" min={min} max={max} step={1} value={shown} disabled={disabled} onChange={e=>{const next=Number(e.target.value);setDragged(next);onValueChange(next);cancelAnimationFrame(release.current);release.current=requestAnimationFrame(()=>{release.current=requestAnimationFrame(()=>setDragged(null));});}}/>
   </div>
  </label>
  <div className="motion-pull-scale"><span>{min}°</span>{min<0&&max>0&&<span>0° neutral</span>}<span>+{max}°</span></div>
 </div>;
}
