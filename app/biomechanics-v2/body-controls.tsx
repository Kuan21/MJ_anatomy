import {useEffect,useState} from 'react';
import {Button} from '@/components/ui/button';
import {Slider} from '@/components/ui/slider';
import MotionPullControl from '../motion-pull-control';
import MotionAnatomyPanel,{BODY_ACTION_ANATOMY} from '../motion-anatomy';
import {BODY_LIMITS,BODY_NEUTRAL,type BodyPose,type BodyRegion} from './body-motion';

type BodyAction='flexion'|'rotation'|'sideBend'|'knee'|'ankle';
export default function BodyControls({region,pose,onChange,onInspect,disabled=false}:{region:BodyRegion;pose:BodyPose;onChange:(region:BodyRegion,pose:BodyPose,focus?:boolean)=>void;onInspect?:(name:string)=>void;disabled?:boolean}){
 const head=region==='head',spine=region==='spine',limits=BODY_LIMITS[head?'head':spine?'spine':'leg'];
 const controls:([keyof BodyPose,string])[]=head?[['flexion','低頭（＋）／抬頭（－）'],['rotation','向左（＋）／向右（－）轉頭'],['sideBend','向左（＋）／向右（－）側彎']]:spine?[['flexion','脊柱：前屈（＋）／後伸（－）'],['rotation','軀幹：向左（＋）／向右（－）旋轉'],['sideBend','軀幹：向左（＋）／向右（－）側彎']]:[['flexion','髖：前抬（＋）／後伸（－）'],['sideBend','髖：向外展開'],['rotation','髖：內旋（＋）／外旋（－）'],['knee','膝：屈曲'],['ankle','踝：抬腳尖（＋）／下壓（－）']];
 const actions:{id:BodyAction;label:string}[]=head?
  [{id:'flexion',label:'低頭／抬頭'},{id:'rotation',label:'左右轉頭'},{id:'sideBend',label:'側彎'}]:spine?
  [{id:'flexion',label:'彎腰／伸展'},{id:'rotation',label:'軀幹旋轉'},{id:'sideBend',label:'軀幹側彎'}]:
  [{id:'flexion',label:'抬腿'},{id:'knee',label:'屈膝'},{id:'sideBend',label:'髖外展'},{id:'ankle',label:'踝背屈'}];
 const [action,setAction]=useState<BodyAction>(head||spine?'flexion':'knee');
 useEffect(()=>{setAction(region==='head'||region==='spine'?'flexion':'knee');},[region]);
 const chooseAction=(next:BodyAction)=>setAction(next);
 const actionKey: keyof BodyPose=action==='flexion'?'flexion':action==='rotation'?'rotation':action==='sideBend'?'sideBend':action==='knee'?'knee':'ankle';
 const actionLimit=limits[actionKey];
 const pullAction=(value:number)=>onChange(region,{...pose,[actionKey]:value});
 const reset=()=>onChange(region,{...BODY_NEUTRAL});
 return <section className="mj-motion-lab glass" aria-label={head?'Head and neck motion':spine?'Spine and trunk motion':'Lower limb motion'}>
  <div className="mj-motion-head"><strong>{head?'頭頸動作':spine?'軀幹與脊柱':region==='leftLeg'?'左腳動作':'右腳動作'}</strong><Button variant="ghost" disabled={disabled} onClick={reset}>復位</Button></div>
  {!head&&!spine&&<div className="mj-motion-sides"><Button variant="ghost" disabled={disabled} aria-pressed={region==='leftLeg'} onClick={()=>onChange('leftLeg',{...BODY_NEUTRAL},true)}>左腳</Button><Button variant="ghost" disabled={disabled} aria-pressed={region==='rightLeg'} onClick={()=>onChange('rightLeg',{...BODY_NEUTRAL},true)}>右腳</Button></div>}
  <div className="motion-action-picker" role="group" aria-label="選擇示範動作">{actions.map(item=><Button variant="ghost" key={item.id} aria-pressed={action===item.id} disabled={disabled} onClick={()=>chooseAction(item.id)}>{item.label}</Button>)}</div>
  <MotionPullControl label={actions.find(x=>x.id===action)?.label??'動作'} value={pose[actionKey]} min={actionLimit[0]} max={actionLimit[1]} disabled={disabled} onValueChange={pullAction}/>
  <small className="mj-motion-note">0° 為中立位；正負角度代表相反方向。拖動即時控制，不再自動播放。</small>
  <MotionAnatomyPanel anatomy={BODY_ACTION_ANATOMY(region,action)} onInspect={onInspect}/>
  <details className="motion-fine-tune"><summary>精細角度調整 <span>Advanced</span></summary>
   {controls.map(([key,label])=><label className="mj-joint-control" key={key}><span>{label}<b>{Math.round(pose[key])}°</b></span><Slider disabled={disabled} aria-label={label} min={limits[key][0]} max={limits[key][1]} step={1} value={[pose[key]]} onValueChange={v=>onChange(region,{...pose,[key]:Array.isArray(v)?v[0]:v})}/></label>)}
  </details>
  <small className="mj-motion-note">關節與軟組織連動示範；角度採保守範圍。未模擬完整承重與組織碰撞。</small>
 </section>;
}
