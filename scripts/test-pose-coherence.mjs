// "Nothing stays behind": after a pose, every structure that anatomically belongs to the moving region must be carried by the pose.
// A structure that stays in world space while its neighbours move shows up as a muscle lying on the floor or a scalp muscle flipping up.
// The check uses the same part list the viewer ends up with (atlas + facial muscles + BodyParts3D 3.0 supplement) and the viewer's own
// region classifier; the few structures that are the fixed reference of a motion are listed explicitly below.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {runnerImport} from 'vite';
const root=fileURLToPath(new URL('../',import.meta.url)),load=async f=>(await runnerImport(root+f)).module;
const [body,rules,reg,classifier]=await Promise.all(['app/biomechanics-v2/body-motion.ts','app/biomechanics-v2/body-part.ts','app/mj-part-regions.ts','app/mj-system-classifier.ts'].map(load));
const read=f=>JSON.parse(fs.readFileSync(root+f,'utf8')),gz=f=>JSON.parse(zlib.gunzipSync(fs.readFileSync(root+f)));
const base=classifier.normalizeAtlasSystems(read('public/models/atlas-stream.json'));
const atlas={...base,parts:[...base.parts,...gz('public/models/facial/facial-stream.json.gz').parts,...gz('public/models/supplement/supplement-stream.json.gz').parts]};
assert.ok(atlas.parts.length>2300,'viewer part list is complete');
// Fixed references: the pelvic floor and hip bones are the base the trunk and legs move relative to; heart chambers are organs shown in their own mode.
const REFERENCE=/coccygeus|iliococcygeus|pubococcygeus|puborectalis|anal sphincter|perineal|levator ani|papillary|ventricle|atrium|valve|hip bone|^sacrum$/i;
const poses={head:[{flexion:30},{rotation:40},{sideBend:20}],spine:[{flexion:35},{rotation:25},{sideBend:15}],leftLeg:[{flexion:90},{knee:100},{ankle:15}],rightLeg:[{flexion:90},{knee:100},{ankle:15}]};
const expectedFor=(region)=>{
 if(region==='head')return p=>reg.anatomicalRegion(p)==='head-neck'&&p.bounds[1][1]>1.5;
 if(region==='spine')return p=>reg.anatomicalRegion(p)==='trunk'&&['muscular','skeletal','connective'].includes(p.system);
 const side=region==='leftLeg'?'left':'right';
 return p=>reg.anatomicalRegion(p)==='lower-limb'&&(reg.anatomicalSide(p)===side||reg.anatomicalSide(p)==='midline')&&p.system!=='integumentary'&&!reg.isMotionQuarantined(p);
};
let checked=0;
for(const [region,list] of Object.entries(poses)){
 const rig=body.makeBodyRig(atlas,region),expected=expectedFor(region);
 for(const pose of list){
  const built=body.buildBodyMotion(rig,{...body.BODY_NEUTRAL,...pose});
  assert.ok(Object.values(pose).every(v=>Math.abs(Object.values(built.pose).includes(v)?0:1)<2),'pose reaches the solver');
  const carried=p=>!!built.transforms[p.id]||!!rules.bodyPartRule(p,rig)||(rig.framePartIds??[]).flat().includes(p.id);
  const behind=atlas.parts.filter(p=>expected(p)&&!REFERENCE.test(p.name)&&!carried(p));
  assert.deepEqual(behind.map(p=>`${p.system}: ${p.name}`),[],`${region} ${JSON.stringify(pose)}: structures left in place while their neighbours move`);
  checked+=atlas.parts.filter(expected).length;
 }
}
// Scalp structures that the 4.0 export lacks must ride on the skull in the head rig and in the trunk rig.
for(const name of ['Aponeurosis of epicranius','Right temporoparietalis','Left temporoparietalis','Right depressor septi nasi','Left depressor septi nasi']){
 const part=atlas.parts.find(p=>p.name===name);assert.ok(part,`${name} present`);
 const head=body.makeBodyRig(atlas,'head'),built=body.buildBodyMotion(head,{...body.BODY_NEUTRAL,flexion:30});
 assert.ok(built.transforms[part.id],`${name} follows head flexion rigidly with the skull`);
 const q=built.transforms[part.id].quaternion;assert.ok(Math.abs(q[0])>1e-3,`${name} actually rotates`);
 assert.ok(rules.bodyPartRule(part,body.makeBodyRig(atlas,'spine')),`${name} follows trunk motion with the head`);
}
const edb=atlas.parts.filter(p=>/extensor digitorum brevis/i.test(p.name));
assert.equal(edb.length,2);
for(const part of edb)assert.ok(rules.bodyPartRule(part,body.makeBodyRig(atlas,/^Left/.test(part.name)?'leftLeg':'rightLeg')),`${part.name} follows hip flexion`);
console.log(`PASS pose coherence: ${checked} structure checks over head, trunk and both legs (${atlas.parts.length} parts incl. facial and supplement); nothing is left in place while its neighbours move.`);
