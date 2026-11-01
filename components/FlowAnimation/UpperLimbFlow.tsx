import {useEffect,useState} from 'react';
import FlowAnimation from './FlowAnimation';
import {loadUpperLimbBody} from './upper-limb-body';
import type {LoadedBody} from './body-loader';
import {upperLimbPathways} from '../../lib/pathways/upper-limb';
import type {Atlas} from '../../app/anatomy';

/** 上肢神經與血管走向動畫（神經 11 步、血管 11 步），背景使用網站的人體模型 */
export default function UpperLimbFlow({atlas,onClose,initialMode,initialStep}:{atlas:Atlas;onClose:()=>void;initialMode?:number;initialStep?:number}){
 const [body,setBody]=useState<LoadedBody|null>(null),[error,setError]=useState('');
 useEffect(()=>{
  const ac=new AbortController();
  loadUpperLimbBody(atlas,ac.signal).then(b=>{if(!ac.signal.aborted)setBody(b);}).catch(e=>{if(!ac.signal.aborted)setError(String(e?.message??e));});
  return ()=>ac.abort();
 },[atlas]);
 if(!body)return <div className="flow-anim flow-loading" role="dialog" aria-modal="true" aria-label="走向動畫載入中">
  <p>{error?`模型載入失敗：${error}`:'載入人體模型中…'}</p>
  <button type="button" onClick={onClose}>關閉 Close</button>
 </div>;
 return <FlowAnimation data={upperLimbPathways} buildModel={body.model} map={body.map} unit={body.unit} onClose={onClose} initialMode={initialMode} initialStep={initialStep} label="上肢神經與血管走向動畫"/>;
}
