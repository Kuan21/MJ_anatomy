import {useEffect,useState} from 'react';
import {Button} from '@/components/ui/button';
import MotionPullControl from '../motion-pull-control';
import MotionAnatomyPanel,{BODY_ACTION_ANATOMY} from '../motion-anatomy';
import {BODY_LIMITS,BODY_NEUTRAL,type BodyPose,type BodyRegion} from './body-motion';

type BodyAction='flexion'|'rotation'|'sideBend'|'knee'|'ankle';

export default function BodyControls({region,pose,onChange,onInspect,disabled=false}:{region:BodyRegion;pose:BodyPose;onChange:(region:BodyRegion,pose:BodyPose,focus?:boolean)=>void;onInspect?:(name:string)=>void;disabled?:boolean}){
 const head=region==='head',spine=region==='spine',leg=!head&&!spine;
 const limits=BODY_LIMITS[head?'head':spine?'spine':'leg'];
 const controls:{key:keyof BodyPose;action:BodyAction;label:string}[]=head?[
  {key:'flexion',action:'flexion',label:'頭頸屈曲（＋）／伸展（－）'},
  {key:'rotation',action:'rotation',label:'向左（＋）／向右（－）轉頭'},
  {key:'sideBend',action:'sideBend',label:'向左（＋）／向右（－）側彎'},
 ]:spine?[
  {key:'flexion',action:'flexion',label:'脊柱前屈（＋）／後伸（－）'},
  {key:'rotation',action:'rotation',label:'軀幹向左（＋）／向右（－）旋轉'},
  {key:'sideBend',action:'sideBend',label:'軀幹向左（＋）／向右（－）側彎'},
 ]:[
  {key:'flexion',action:'flexion',label:'髖屈曲（＋）／伸展（－）'},
  {key:'sideBend',action:'sideBend',label:'髖外展（＋）／內收（－）'},
  {key:'rotation',action:'rotation',label:'髖內旋（＋）／外旋（－）'},
  {key:'knee',action:'knee',label:'膝屈曲（＋）／伸展（－）'},
  {key:'ankle',action:'ankle',label:'踝背屈（＋）／蹠屈（－）'},
 ];
 const [action,setAction]=useState<BodyAction>(head||spine?'flexion':'knee');
 useEffect(()=>{setAction(region==='head'||region==='spine'?'flexion':'knee');},[region]);
 const reset=()=>onChange(region,{...BODY_NEUTRAL});
 const setValue=(key:keyof BodyPose,nextAction:BodyAction,value:number)=>{
  setAction(nextAction);
  onChange(region,{...pose,[key]:value});
 };
 return <section className="mj-motion-lab glass" aria-label={head?'Head and neck motion':spine?'Spine and trunk motion':'Lower limb motion'}>
  <div className="mj-motion-head">
   <strong>{head?'頭頸動作':spine?'軀幹與脊柱':region==='leftLeg'?'左下肢動作':'右下肢動作'}</strong>
   <Button variant="ghost" disabled={disabled} onClick={reset}>復位</Button>
  </div>
  {leg&&<div className="mj-motion-sides">
   <Button variant="ghost" disabled={disabled} aria-pressed={region==='leftLeg'} onClick={()=>onChange('leftLeg',{...BODY_NEUTRAL},true)}>左側</Button>
   <Button variant="ghost" disabled={disabled} aria-pressed={region==='rightLeg'} onClick={()=>onChange('rightLeg',{...BODY_NEUTRAL},true)}>右側</Button>
  </div>}
  <div className="motion-control-stack">
   {controls.map(({key,action:nextAction,label})=><MotionPullControl
    key={key}
    label={label}
    value={pose[key]}
    min={limits[key][0]}
    max={limits[key][1]}
    disabled={disabled}
    onValueChange={value=>setValue(key,nextAction,value)}
   />)}
  </div>
  <small className="mj-motion-note">0° 為人體放鬆中立位；正負角度代表相反方向。所有角度可直接拖動，毋須先選動作。</small>
  <MotionAnatomyPanel anatomy={BODY_ACTION_ANATOMY(region,action)} onInspect={onInspect}/>
 </section>;
}
