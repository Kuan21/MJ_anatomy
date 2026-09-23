import {Button} from '@/components/ui/button';
import {Slider} from '@/components/ui/slider';
import {BODY_LIMITS,BODY_NEUTRAL,type BodyPose,type BodyRegion} from './body-motion';
export default function BodyControls({region,pose,onChange,disabled=false}:{region:BodyRegion;pose:BodyPose;onChange:(region:BodyRegion,pose:BodyPose,focus?:boolean)=>void;disabled?:boolean}){
 const head=region==='head',limits=BODY_LIMITS[head?'head':'leg'];
 const controls:([keyof BodyPose,string])[]=head?[['flexion','低頭（＋）／抬頭（－）'],['rotation','向左（＋）／向右（－）轉頭'],['sideBend','向左（＋）／向右（－）側彎']]:[['flexion','髖：前抬（＋）／後伸（－）'],['sideBend','髖：向外展開'],['rotation','髖：內旋（＋）／外旋（－）'],['knee','膝：屈曲'],['ankle','踝：抬腳尖（＋）／下壓（－）']];
 return <section className="mj-motion-lab glass" aria-label={head?'Head and neck motion':'Lower limb motion'}>
  <div className="mj-motion-head"><strong>{head?'頭頸動作':region==='leftLeg'?'左腳動作':'右腳動作'}</strong><Button variant="ghost" disabled={disabled} onClick={()=>onChange(region,{...BODY_NEUTRAL})}>復位</Button></div>
  {!head&&<div className="mj-motion-sides"><Button variant="ghost" disabled={disabled} aria-pressed={region==='leftLeg'} onClick={()=>onChange('leftLeg',{...BODY_NEUTRAL},true)}>左腳</Button><Button variant="ghost" disabled={disabled} aria-pressed={region==='rightLeg'} onClick={()=>onChange('rightLeg',{...BODY_NEUTRAL},true)}>右腳</Button></div>}
  <div className="mj-motion-sides">{head?<><Button variant="ghost" disabled={disabled} onClick={()=>onChange(region,{...BODY_NEUTRAL,flexion:25})}>低頭</Button><Button variant="ghost" disabled={disabled} onClick={()=>onChange(region,{...BODY_NEUTRAL,rotation:40})}>向左望</Button></>:<><Button variant="ghost" disabled={disabled} onClick={()=>onChange(region,{...BODY_NEUTRAL,flexion:45,knee:65})}>抬膝</Button><Button variant="ghost" disabled={disabled} onClick={()=>onChange(region,{...BODY_NEUTRAL,knee:70})}>屈膝</Button></>}</div>
  {controls.map(([key,label])=><label className="mj-joint-control" key={key}><span>{label}<b>{Math.round(pose[key])}°</b></span><Slider disabled={disabled} aria-label={label} min={limits[key][0]} max={limits[key][1]} step={1} value={[pose[key]]} onValueChange={v=>onChange(region,{...pose,[key]:Array.isArray(v)?v[0]:v})}/></label>)}
  <small className="mj-motion-note">關節與軟組織連動示範；角度採保守範圍。未模擬完整肌腱滑動、承重及組織碰撞。</small>
 </section>;
}
