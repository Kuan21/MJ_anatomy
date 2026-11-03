import {useEffect,useRef} from 'react';
import type * as THREE from 'three';
import {X} from 'lucide-react';
import {createFlowEngine,type FlowModel} from './engine';
import type {PathwayDataset,Pt} from './types';
import './flow-animation.css';

export interface FlowAnimationProps{
 data:PathwayDataset;
 buildModel:(scene:THREE.Scene,col:(hex:number)=>THREE.Color)=>FlowModel;
 /** 從哪一類、哪一步開始（0 = 神經，1 = 血管）；資訊卡的「播放走向」用 */
 initialMode?:number;initialStep?:number;
 /** 原型座標 → 模型座標，以及模型相對原型的大小 */
 map?:(p:Pt)=>Pt;unit?:number;
 /** 起始步驟要高亮的路徑 id */
 highlight?:string[];
 onClose:()=>void;
 label?:string;
}

/** 全頁走向動畫：桌面左 3/4 動畫、右 1/4 講解；手機直向上方動畫、下方講解。上肢、下肢共用，只換資料與示意模型。 */
export default function FlowAnimation({data,buildModel,map,unit,highlight,initialMode=0,initialStep=0,onClose,label='走向動畫'}:FlowAnimationProps){
 const root=useRef<HTMLDivElement>(null);
 const refs={stage:useRef<HTMLDivElement>(null),tags:useRef<HTMLDivElement>(null),leaders:useRef<SVGSVGElement>(null),legend:useRef<HTMLDivElement>(null),steps:useRef<HTMLOListElement>(null),body:useRef<HTMLDivElement>(null),
  h1:useRef<HTMLHeadingElement>(null),count:useRef<HTMLDivElement>(null),title:useRef<HTMLDivElement>(null),en:useRef<HTMLDivElement>(null),where:useRef<HTMLParagraphElement>(null),branches:useRef<HTMLParagraphElement>(null),brH:useRef<HTMLHeadingElement>(null),clinical:useRef<HTMLParagraphElement>(null)};
 const modeBtns=useRef<(HTMLButtonElement|null)[]>([]);
 const closeBtn=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  const r=refs;
  const engine=createFlowEngine({
   els:{stage:r.stage.current!,tagLayer:r.tags.current!,leaders:r.leaders.current!,legend:r.legend.current!,steps:r.steps.current!,body:r.body.current!,h1:r.h1.current!,
    modeButtons:modeBtns.current.filter(Boolean) as HTMLButtonElement[],count:r.count.current!,title:r.title.current!,en:r.en.current!,where:r.where.current!,branches:r.branches.current!,brH:r.brH.current!,clinical:r.clinical.current!},
   data,buildModel,map,unit,highlight,mode:initialMode,step:initialStep});
  closeBtn.current?.focus();
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.stopPropagation();onClose();}};
  window.addEventListener('keydown',key,true);
  return ()=>{window.removeEventListener('keydown',key,true);engine.dispose();};
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 return <div className="flow-anim" ref={root} role="dialog" aria-modal="true" aria-label={label}>
  <div className="fa-stage" ref={refs.stage}>
   <div className="fa-tags" ref={refs.tags}><svg className="fa-leaders" ref={refs.leaders} aria-hidden="true"/></div>
   <div className="fa-hint">{data.hint}</div>
   <div className="fa-legend" ref={refs.legend}/>
   <button type="button" className="fa-close" ref={closeBtn} onClick={onClose} aria-label="關閉走向動畫"><X size={16} aria-hidden="true"/><span>關閉 Close</span></button>
  </div>
  <aside className="fa-panel">
   <header>
    <h2 className="fa-h1" ref={refs.h1}>{data.modes[0].name}</h2>
    <div className="fa-sub">自動播放：神經播完接血管，再由頭開始。可點下面直接跳到某一類。</div>
    <div className="fa-modes" role="group" aria-label="選擇類別">
     <button type="button" ref={el=>{modeBtns.current[0]=el;}} aria-pressed="false">神經 Nerves</button>
     <button type="button" ref={el=>{modeBtns.current[1]=el;}} aria-pressed="false">血管 Vessels</button>
    </div>
    <ol className="fa-steps" ref={refs.steps}/>
   </header>
   <div className="fa-body" ref={refs.body}>
    <div className="fa-count" ref={refs.count}/>
    <div className="fa-title" ref={refs.title}/>
    <div className="fa-en" ref={refs.en}/>
    <div className="fa-sec"><h3>走向 Course</h3><p ref={refs.where}/></div>
    <div className="fa-sec"><h3 ref={refs.brH}>分支與支配</h3><p ref={refs.branches}/></div>
    <div className="fa-sec fa-clin"><h3>臨床重點 Clinical</h3><p ref={refs.clinical}/></div>
   </div>
  </aside>
 </div>;
}
