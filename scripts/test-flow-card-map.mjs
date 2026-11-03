// 資訊卡「播放走向」對照：每一筆的步驟與高亮路徑都必須存在於動畫資料中，且高亮路徑出現在該步驟的生長或參照路徑裡。
import fs from 'node:fs';
import {flowTargetFor,FLOW_CARD_ENTRIES} from '../lib/pathways/card-map.ts';
const load=limb=>{
  const src=fs.readFileSync(new URL(`../lib/pathways/${limb}-limb.ts`,import.meta.url),'utf8');
  const body=src.replace(/import[^\n]*\n/g,'').replace(/:Record<string,Pt\[\]>/g,'').replace(/:Step\[\]/g,'').replace(/:PathwayDataset/g,'').replace(/export const/g,'const');
  return new Function(body+';return {nerveSteps,vesselSteps,arteries};')();
};
const data={lower:load('lower'),upper:load('upper')};
let bad=0;const fail=m=>{bad++;console.error('FAIL '+m);};
for(const [limb,mode,step,highlight,pattern] of FLOW_CARD_ENTRIES){
  const steps=mode===0?data[limb].nerveSteps:data[limb].vesselSteps;
  const st=steps[step];
  if(!st){fail(`${limb} mode ${mode} step ${step} 不存在（${pattern}）`);continue;}
  if(st.orbit||(!st.ph.length&&highlight.length))fail(`${limb} mode ${mode} step ${step} 是總覽步驟，不能當目標`);
  const ids=new Set([...st.ph.flat(),...(st.ctx||[])]);
  for(const h of highlight){
    const art=h.startsWith('v_')?h.slice(2):null;
    const ok=ids.has(h)||(art&&ids.has(art));
    if(!ok)fail(`${limb} mode ${mode} step ${step}：高亮路徑 ${h} 不在該步驟（${pattern}）`);
  }
}
const t=(n,exp)=>{const r=flowTargetFor(n);const got=r?`${r.limb}:${r.mode}:${r.step}`:null;if(got!==exp)fail(`${n} → ${got}，應為 ${exp}`);};
t('Right femoral artery','lower:1:0');t('Left femoral artery',null);t('Femoral nerve.r.001','lower:0:1');t('Femoral nerve.l.001',null);
t('Right median antebrachial vein','upper:1:9');t('Dorsal carpal branch of right radial artery','upper:1:5');
t('Lumbar plexus','lower:0:0');t('Right sciatic nerve','lower:0:5');t('Right pectoralis major',null);
if(bad){console.error(`${bad} 項失敗`);process.exit(1);}
console.log(`flow card map ok: ${FLOW_CARD_ENTRIES.length} entries`);
