import {useEffect,useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import {Slider} from '@/components/ui/slider';
import MotionPullControl from '../motion-pull-control';
import {BODY_LIMITS,BODY_NEUTRAL,type BodyPose,type BodyRegion} from './body-motion';

type BodyAction='flexion'|'rotation'|'sideBend'|'knee'|'ankle';
const mixBody=(a:BodyPose,b:BodyPose,t:number):BodyPose=>({
 flexion:a.flexion+(b.flexion-a.flexion)*t,
 rotation:a.rotation+(b.rotation-a.rotation)*t,
 sideBend:a.sideBend+(b.sideBend-a.sideBend)*t,
 knee:a.knee+(b.knee-a.knee)*t,
 ankle:a.ankle+(b.ankle-a.ankle)*t,
});
const actionTarget=(region:BodyRegion,action:BodyAction):BodyPose=>{
 const p={...BODY_NEUTRAL};
 if(region==='head'){
  if(action==='rotation')p.rotation=45;
  else if(action==='sideBend')p.sideBend=22;
  else p.flexion=30;
 }else{
  if(action==='knee')p.knee=85;
  else if(action==='ankle')p.ankle=20;
  else if(action==='sideBend')p.sideBend=28;
  else p.flexion=58;
 }
 return p;
};

export default function BodyControls({region,pose,onChange,disabled=false}:{region:BodyRegion;pose:BodyPose;onChange:(region:BodyRegion,pose:BodyPose,focus?:boolean)=>void;disabled?:boolean}){
 const head=region==='head',limits=BODY_LIMITS[head?'head':'leg'];
 const controls:([keyof BodyPose,string])[]=head?[['flexion','低頭（＋）／抬頭（－）'],['rotation','向左（＋）／向右（－）轉頭'],['sideBend','向左（＋）／向右（－）側彎']]:[['flexion','髖：前抬（＋）／後伸（－）'],['sideBend','髖：向外展開'],['rotation','髖：內旋（＋）／外旋（－）'],['knee','膝：屈曲'],['ankle','踝：抬腳尖（＋）／下壓（－）']];
 const actions:{id:BodyAction;label:string}[]=head?
  [{id:'flexion',label:'低頭／抬頭'},{id:'rotation',label:'左右轉頭'},{id:'sideBend',label:'側彎'}]:
  [{id:'flexion',label:'抬腿'},{id:'knee',label:'屈膝'},{id:'sideBend',label:'髖外展'},{id:'ankle',label:'踝背屈'}];
 const [action,setAction]=useState<BodyAction>(head?'flexion':'knee'),[pull,setPull]=useState(0),[demo,setDemo]=useState(false);
 const frame=useRef<number|null>(null);
 useEffect(()=>{setDemo(false);setPull(0);setAction(region==='head'?'flexion':'knee');},[region]);
 useEffect(()=>{
  if(!demo||disabled)return;
  const target=actionTarget(region,action),start=performance.now();let last=0;
  const loop=(now:number)=>{if(now-last>=18){const phase=((now-start)%3200)/3200,raw=.5-.5*Math.cos(phase*Math.PI*2),eased=raw*raw*(3-2*raw);setPull(eased*100);onChange(region,mixBody(BODY_NEUTRAL,target,eased));last=now;}frame.current=requestAnimationFrame(loop);};
  frame.current=requestAnimationFrame(loop);return()=>{if(frame.current!==null)cancelAnimationFrame(frame.current);frame.current=null;};
 },[demo,disabled,region,action]);
 const chooseAction=(next:BodyAction)=>{setDemo(false);setAction(next);setPull(0);onChange(region,{...BODY_NEUTRAL});};
 const pullAction=(value:number)=>{setDemo(false);setPull(value);onChange(region,mixBody(BODY_NEUTRAL,actionTarget(region,action),value/100));};
 const reset=()=>{setDemo(false);setPull(0);onChange(region,{...BODY_NEUTRAL});};
 return <section className="mj-motion-lab glass" aria-label={head?'Head and neck motion':'Lower limb motion'}>
  <div className="mj-motion-head"><strong>{head?'頭頸動作':region==='leftLeg'?'左腳動作':'右腳動作'}</strong><Button variant="ghost" disabled={disabled} onClick={reset}>復位</Button></div>
  {!head&&<div className="mj-motion-sides"><Button variant="ghost" disabled={disabled} aria-pressed={region==='leftLeg'} onClick={()=>onChange('leftLeg',{...BODY_NEUTRAL},true)}>左腳</Button><Button variant="ghost" disabled={disabled} aria-pressed={region==='rightLeg'} onClick={()=>onChange('rightLeg',{...BODY_NEUTRAL},true)}>右腳</Button></div>}
  <div className="motion-action-picker" role="group" aria-label="選擇示範動作">{actions.map(item=><Button variant="ghost" key={item.id} aria-pressed={action===item.id} disabled={disabled} onClick={()=>chooseAction(item.id)}>{item.label}</Button>)}</div>
  <MotionPullControl label={actions.find(x=>x.id===action)?.label??'動作'} value={pull} disabled={disabled} demoActive={demo} onDemoToggle={()=>setDemo(v=>!v)} onValueChange={pullAction}/>
  <small className="mj-motion-note">用一個拉動量連續驅動整段動作；自動演示使用平滑往返，不再逐格跳角度。</small>
  <details className="motion-fine-tune"><summary>精細角度調整 <span>Advanced</span></summary>
   {controls.map(([key,label])=><label className="mj-joint-control" key={key}><span>{label}<b>{Math.round(pose[key])}°</b></span><Slider disabled={disabled} aria-label={label} min={limits[key][0]} max={limits[key][1]} step={1} value={[pose[key]]} onValueChange={v=>{setDemo(false);onChange(region,{...pose,[key]:Array.isArray(v)?v[0]:v});}}/></label>)}
  </details>
  <small className="mj-motion-note">關節與軟組織連動示範；角度採保守範圍。未模擬完整承重與組織碰撞。</small>
 </section>;
}
