import type {CSSProperties} from 'react';
import {GripVertical,Pause,Play} from 'lucide-react';
import {Button} from '@/components/ui/button';

export default function MotionPullControl({
 label,value,disabled=false,demoActive=false,onDemoToggle,onValueChange
}:{
 label:string;
 value:number;
 disabled?:boolean;
 demoActive?:boolean;
 onDemoToggle:()=>void;
 onValueChange:(value:number)=>void;
}){
 return <div className="motion-pull-controller">
  <div className="motion-pull-head">
   <div><span>動作驅動</span><strong>{label}</strong></div>
   <output>{Math.round(value)}%</output>
  </div>
  <div className="motion-pull-grid">
   <Button variant="ghost" className={'motion-demo-button '+(demoActive?'active':'')} disabled={disabled} onClick={onDemoToggle}>
    {demoActive?<Pause size={15}/>:<Play size={15}/>}
    <span><b>{demoActive?'暫停演示':'自動演示'}</b><small>Demo</small></span>
   </Button>
   <label className={'motion-pull-track '+(disabled?'disabled':'')}>
    <span className="motion-pull-label"><b>拉動</b><small>Pull</small></span>
    <div className="motion-pull-rail" style={{'--pull':value/100} as CSSProperties}>
     <i className="motion-pull-fill"/>
     <span className="motion-pull-anchor"/>
     <span className="motion-pull-handle"><GripVertical size={13}/></span>
     <input aria-label={label+' pull'} type="range" min={0} max={100} step={1} value={value} disabled={disabled} onChange={e=>onValueChange(Number(e.target.value))}/>
    </div>
   </label>
  </div>
  <div className="motion-pull-scale"><span>放鬆 / neutral</span><span>拉動 / target</span></div>
 </div>;
}
