import type {CSSProperties} from 'react';
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
 const span=Math.max(.001,max-min);
 const position=Math.max(0,Math.min(100,(value-min)/span*100));
 const zero=Math.max(0,Math.min(100,(0-min)/span*100));
 const fillLeft=Math.min(position,zero),fillWidth=Math.abs(position-zero);
 return <div className="motion-pull-controller">
  <div className="motion-pull-head">
   <div><span>手動關節控制</span><strong>{label}</strong></div>
   <output>{value>0?'+':''}{Math.round(value)}°</output>
  </div>
  <label className={'motion-angle-track '+(disabled?'disabled':'')}>
   <span className="motion-pull-label"><b>拖動角度</b><small>Drag angle</small></span>
   <div className="motion-pull-rail" style={{'--pull':position/100,'--zero':zero/100} as CSSProperties}>
    <i className="motion-pull-fill" style={{left:`${fillLeft}%`,width:`${fillWidth}%`}}/>
    <span className="motion-pull-anchor" style={{left:`${zero}%`}}/>
    <span className="motion-pull-handle" style={{left:`${position}%`}}><GripVertical size={13}/></span>
    <input aria-label={label+' angle'} type="range" min={min} max={max} step={1} value={value} disabled={disabled} onChange={e=>onValueChange(Number(e.target.value))}/>
   </div>
  </label>
  <div className="motion-pull-scale"><span>{min}°</span>{min<0&&max>0&&<span>0° neutral</span>}<span>+{max}°</span></div>
 </div>;
}
