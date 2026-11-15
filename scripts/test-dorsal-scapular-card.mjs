// The dorsal scapular artery card: the Origin field states both variants (subclavian artery, third or sometimes second part; or the deep branch of the transverse cervical artery), not the single mesh parent of the vessel tree; its Region is the scapular region / back.
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
const {structureProfile}=await quizModule('app/mj-structure-info.ts');
const part={id:'FJ2284',name:'Right dorsal scapular artery',system:'arterial',conceptId:'x',chunk:0,positions:0,normals:0,indices:0,vertexCount:1,indexCount:3,bounds:[[-.09,1.30,-.06],[-.07,1.40,-.03]]};
const p=structureProfile(part.name,'arterial',part),origin=p.facts.find(f=>f.labelEn==='Origin'),region=p.facts.find(f=>f.labelEn==='Region');
assert.ok(origin,'Origin field present');
assert.ok(/subclavian artery/i.test(origin.valueEn)&&/second part/i.test(origin.valueEn)&&/transverse cervical artery/i.test(origin.valueEn),origin.valueEn);
assert.ok(origin.valueZh.includes('鎖骨下動脈')&&origin.valueZh.includes('頸橫動脈深支'),origin.valueZh);
if(region)assert.ok(!/\barm\b/.test(region.valueEn),'region is not "arm": '+region.valueEn);
console.log('PASS dorsal scapular artery card:',origin.valueZh,'|',region?.valueZh??'(no region field)');
