// Every muscle of a dissection layer region must sit in the body part the region is offered under in the 分層解剖 panel
// (shoulder → shoulder, arm → arm, forearm → forearm, hand → hand, lower limb → hip/thigh/leg/foot, ...). Also checks that the spaces listed in the panel
// resolve to atlas structures on both sides.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {runnerImport} from 'vite';
import {loadFullAtlas} from './lib/full-atlas.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),load=async f=>(await runnerImport(root+f)).module;
const layers=await load('app/mj-muscle-layers.ts'),regions=await load('app/mj-part-regions.ts'),spaces=await load('app/mj-spaces.ts');
const parts=loadFullAtlas().atlas.parts;
const EXPECT={scapular:['shoulder','arm'],arm_anterior:['arm','shoulder'],arm_posterior:['arm','shoulder','forearm'],forearm_flexor:['forearm','arm','hand'],forearm_extensor:['forearm','arm','hand'],hand:['hand','forearm'],
 gluteal:['hip','pelvis','thigh'],thigh_anterior:['thigh','hip','pelvis'],thigh_medial:['thigh','hip','pelvis'],thigh_posterior:['thigh','hip','pelvis','leg'],leg_anterior:['leg','foot'],leg_lateral:['leg','foot'],leg_posterior:['leg','thigh','foot'],foot_dorsum:['foot'],foot_sole:['foot'],
 suboccipital:['neck','head','back'],back_superficial:['back','neck','thorax','shoulder','arm','abdomen','general'],back_deep:['back','neck','thorax','abdomen','pelvis','general','head']};
const bad=[];let checked=0;
for(const r of layers.MUSCLE_LAYER_REGIONS){
 for(const g of r.layers)for(const m of g.muscles){
  for(const p of layers.partsForLayerMuscles(parts,r.id,[m.en])){checked++;const sub=regions.anatomicalSubregion(p);if(!EXPECT[r.id].includes(sub))bad.push(`${r.id}\t${m.en}\t${p.name}\t${sub}`);}
 }
}
// every region offered in some body part
const offered=new Set(Object.values(layers.LAYER_REGIONS_BY_PART).flat());
for(const r of layers.MUSCLE_LAYER_REGIONS)assert.ok(offered.has(r.id),`layer region ${r.id} is offered under no body part`);
// spaces
const missing=[];
for(const sd of ['left','right'])for(const def of spaces.SPACES){const h=spaces.resolveSpace(parts,def,sd);// a space has no mesh of its own (nothing is drawn for it): only its boundaries and contents must resolve
 for(const x of [...h.boundaries,...h.contents])if(!x.ids.length&&!x.nerves.length)missing.push(`${sd} ${def.id}: ${x.item.en}`);}
fs.mkdirSync(root+'docs',{recursive:true});
fs.writeFileSync(root+'docs/layer-region-check.md',`# 分層解剖：部位歸類檢查\n\n檢查 ${checked} 個肌肉結構是否落在該分層區域所屬的身體部位。\n\n${bad.length?'| 區域 | 條目 | 結構 | 判定部位 |\\n| --- | --- | --- | --- |\\n'+bad.map(l=>'| '+l.split('\\t').join(' | ')+' |').join('\\n'):'全部相符。'}\n\n特殊區域對不到結構：${missing.length?'\\n'+missing.map(x=>'- '+x).join('\\n'):'無'}\n`);
console.log(`layer regions: ${checked} structures checked, ${bad.length} misplaced, ${missing.length} space items unresolved`);
for(const l of bad.slice(0,40))console.log(' ',l);for(const l of missing)console.log(' ',l);
assert.equal(missing.length,0);
