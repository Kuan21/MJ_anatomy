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
// Every rig pushed to the end of each range (and to all ends at once): the same completeness rule must hold.
for(const [region,key] of [['head','head'],['spine','spine'],['leftLeg','leg'],['rightLeg','leg']]){
 const lim=body.BODY_LIMITS[key],axes=Object.keys(lim).filter(k=>lim[k][1]!==lim[k][0]);
 for(const k of axes)for(const v of lim[k])poses[region].push({[k]:v});
 poses[region].push(Object.fromEntries(axes.map(k=>[k,lim[k][1]])),Object.fromEntries(axes.map(k=>[k,lim[k][0]])));
}
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
// Trunk motion carries the whole upper body: every organ, vessel, duct, serous layer and fascia of the chest and abdomen, the heart and lungs, and both
// arms with their carpals, metacarpals and phalanges. Only the sacrum and coccyx, the pelvic floor and the pubic skin stay with the pelvis.
{
 const rig=body.makeBodyRig(atlas,'spine'),fullAtlas={...atlas,parts:[...atlas.parts,...gz('public/models/female/female-stream.json.gz').parts,...gz('public/models/serous/serous-stream.json.gz').parts]};
 const fixedPelvis=/^(sacrum|coccyx)$|pubic hair/i;
 for(const pose of [{flexion:50},{flexion:-25},{rotation:30},{rotation:-30},{sideBend:20},{sideBend:-20},{flexion:50,rotation:30,sideBend:20}]){
  const built=body.buildBodyMotion(rig,{...body.BODY_NEUTRAL,...pose});
  const carried=p=>!!built.transforms[p.id]||!!rules.bodyPartRule(p,rig)||(rig.framePartIds??[]).flat().includes(p.id);
  const behind=fullAtlas.parts.filter(p=>['trunk','upper-limb'].includes(reg.anatomicalRegion(p))&&!fixedPelvis.test(p.name)&&!carried(p));
  assert.deepEqual(behind.map(p=>`${p.system}: ${p.name}`),[],`trunk ${JSON.stringify(pose)}: structures of the chest, abdomen or arms left in place`);
  checked+=fullAtlas.parts.length;
 }
 // hand bones in particular ride with the forearm, which rides with the shoulder girdle on the top frame
 const top=rig.framePartIds[rig.framePartIds.length-1],hand=atlas.parts.filter(p=>p.system==='skeletal'&&/metacarpal|phalanx of .*(finger|thumb)|capitate|hamate|lunate|pisiform|scaphoid|trapezium|trapezoid|triquetr/i.test(p.name));
 assert.ok(hand.length>=54,`hand bones found (${hand.length})`);
 for(const p of hand)assert.ok(top.includes(p.id),`${p.name} rides the top trunk frame`);
}
// Peripheral nerves without an explicit binding follow the limb they lie in: leg nerves (including the foot) move with the leg, hand and arm nerves with the arm.
{
 const stream=read('public/models/nerve-stream.json'),bound=read('app/biomechanics-v2/body-nerve-bindings.json');let legs=0,arms=0;
 for(const c of stream.chunks){
  let raw=fs.readFileSync(root+'public'+c.url);if(raw[0]===0x1f&&raw[1]===0x8b)raw=zlib.gunzipSync(raw);const ab=raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.length);
  for(const m of c.meshes){
   const pos=new Float32Array(ab,m.positions,m.vertexCount*3);let lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9];for(let i=0;i<pos.length;i+=3)for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],pos[i+k]);hi[k]=Math.max(hi[k],pos[i+k]);}
   const centre={x:(lo[0]+hi[0])/2,y:(lo[1]+hi[1])/2},limb=body.inferredLimb(centre);
   if(bound[m.name]){continue;}
   if(centre.y<body.HIP_LEVEL&&Math.abs(centre.x)<body.ARM_X){assert.equal(limb,centre.x>=0?'leftLeg':'rightLeg',`${m.name} (leg nerve) follows the leg`);legs++;}
   if(centre.y<1.45&&Math.abs(centre.x)>=body.ARM_X){assert.equal(limb,'arm',`${m.name} (hand or arm nerve) follows the arm`);arms++;}
  }
 }
 assert.ok(legs>=6&&arms>=20,`unbound limb nerves found (legs ${legs}, arms ${arms})`);
}
// Scalp structures that the 4.0 export lacks must ride on the skull in the head rig and in the trunk rig.
for(const name of ['Aponeurosis of epicranius','Right temporoparietalis','Left temporoparietalis','Right depressor septi nasi','Left depressor septi nasi']){
 const part=atlas.parts.find(p=>p.name===name);assert.ok(part,`${name} present`);
 const head=body.makeBodyRig(atlas,'head'),built=body.buildBodyMotion(head,{...body.BODY_NEUTRAL,flexion:30});
 assert.ok(built.transforms[part.id],`${name} follows head flexion rigidly with the skull`);
 const q=built.transforms[part.id].quaternion;assert.ok(Math.abs(q[0])>1e-3,`${name} actually rotates`);
 assert.ok(rules.bodyPartRule(part,body.makeBodyRig(atlas,'spine')),`${name} follows trunk motion with the head`);
}
// The body surface follows the head and the trunk as well.
const skin=atlas.parts.find(p=>p.system==='integumentary'&&p.name==='Skin');assert.ok(skin,'skin present');
for(const region of ['head','spine'])assert.ok(rules.bodyPartRule(skin,body.makeBodyRig(atlas,region)),`skin follows ${region} motion`);
const edb=atlas.parts.filter(p=>/extensor digitorum brevis/i.test(p.name));
assert.equal(edb.length,2);
for(const part of edb)assert.ok(rules.bodyPartRule(part,body.makeBodyRig(atlas,/^Left/.test(part.name)?'leftLeg':'rightLeg')),`${part.name} follows hip flexion`);
console.log(`PASS pose coherence: ${checked} structure checks over head, trunk and both legs (${atlas.parts.length} parts incl. facial and supplement); nothing is left in place while its neighbours move.`);
