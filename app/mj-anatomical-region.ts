import type {Part} from './anatomy';

export type AnatomicalZone='head-neck'|'upper-limb'|'trunk'|'lower-limb'|'other';
export type AnatomicalSubregion='head'|'neck'|'shoulder'|'arm'|'forearm'|'hand'|'thorax'|'abdomen'|'pelvis'|'hip'|'thigh'|'leg'|'foot'|'back'|'other';
export type AnatomicalSide='left'|'right'|'midline';

export interface AnatomicalRegionResult{
 zone:AnatomicalZone;
 subregion:AnatomicalSubregion;
 side:AnatomicalSide;
 labelEn:string;
 labelZh:string;
 confidence:'override'|'spatial+name'|'spatial'|'name'|'fallback';
}

const HAND=/\bhand\b|carpal|metacarp|palmar|finger|thumb|pollicis brevis|thenar|hypothenar|lumbrical.*hand|interosse.*hand/i;
const FOREARM=/\bforearm\b|antebrach|radius|ulna|brachioradialis|pronator|supinator|carpi|interosseous (?:artery|vein|nerve)|radial (?:artery|vein|nerve)|ulnar (?:artery|vein|nerve)|median cubital|median antebrachial/i;
const ARM=/\barm\b|humerus|biceps brachii|triceps brachii|brachialis|coracobrachialis|brachial (?:artery|vein)|musculocutaneous/i;
const SHOULDER=/clavicle|scapula|deltoid|axillary|suprascapular|subscapular|circumflex humeral|thoraco-?acromial|pectoralis|serratus anterior|trapezius|rhomboid|teres (?:major|minor)|supraspinatus|infraspinatus|levator scapulae/i;
const FOOT=/\bfoot\b|metatars|plantar|\btoe\b|halluc|calcane|\btalus\b|cuboid|cuneiform|navicular.*foot/i;
const LEG=/\bleg\b|tibia|fibula|fibular|peroneal|tibial|popliteal|gastrocnem|soleus|tibialis|patellar|achilles/i;
const THIGH=/\bthigh\b|femur|femoral|adductor|gracilis|sartorius|rectus femoris|vastus|hamstring|biceps femoris|semitend|semimembr/i;
const HIP=/hip bone|hip joint|glute|sciatic|obturator|piriformis|gemellus|quadratus femoris|pectineus|iliotibial/i;
const HEAD=/brain|cerebr|cerebell|medulla|pons|midbrain|skull|cranial|mandible|maxilla|zygomatic|frontal bone|parietal|temporal bone|occipital|sphenoid|ethmoid|\beye\b|ocular|orbit|optic|lacrimal|nasal bone|palatine bone|vomer/i;
const NECK=/cervical vertebra|\batlas\b|\baxis\b|hyoid|laryn|pharyn|thyroid cartilage|cricoid|epiglott|sternocleidomastoid|scalen|longus capitis|longus colli|splenius capitis|semispinalis capitis|jugular|carotid/i;
const THORAX=/rib|sternum|intercostal|diaphragm|thorac|heart|lung|bronch|mediast|pleura/i;
const ABDOMEN=/abdomin|liver|stomach|spleen|pancreas|duodenum|jejun|ileum|colon|kidney|ureter|aorta|vena cava|psoas|quadratus lumborum/i;
const PELVIS=/pelvi|sacrum|coccy|bladder|rectum|prostate|uterus|ovary|perine|pubo|levator ani/i;
const BACK=/erector spinae|multifidus|spinalis|longissimus|iliocostalis|rotator|interspinal|intertransvers|thoracolumbar/i;

const NAME_OVERRIDES:Record<string,string>={
 FJ2186:'Left dorsal metatarsal vein',
 FJ2199:'Right dorsal metatarsal vein',
 FJ1469:'Right flexor pollicis brevis',
 FJ1469M:'Left flexor pollicis brevis'
};

const REGION_OVERRIDES:Record<string,Pick<AnatomicalRegionResult,'zone'|'subregion'|'side'>>={
 FJ2186:{zone:'lower-limb',subregion:'foot',side:'left'},
 FJ2199:{zone:'lower-limb',subregion:'foot',side:'right'},
 FJ1469:{zone:'upper-limb',subregion:'hand',side:'right'},
 FJ1469M:{zone:'upper-limb',subregion:'hand',side:'left'}
};

// Source meshes whose label and geometry are irreconcilable enough that they
// should not participate in regional motion until a corrected source mesh is
// substituted. They remain available in the whole-body atlas for traceability.
const MOTION_QUARANTINE=new Set([
 'FJ2091','FJ2195', // "calcaneal" branches located near the proximal thigh/pelvis
 'FJ2190'           // "right fibular vein" geometry is proximal and contralateral
]);

export const partCenterTuple=(p:Part):[number,number,number]=>[
 (p.bounds[0][0]+p.bounds[1][0])*.5,
 (p.bounds[0][1]+p.bounds[1][1])*.5,
 (p.bounds[0][2]+p.bounds[1][2])*.5
];

const sideFromGeometry=(p:Part):AnatomicalSide=>{
 const [x]=partCenterTuple(p);
 if(Math.abs(x)<.035)return 'midline';
 return x>0?'left':'right';
};

const sideFromName=(name:string):AnatomicalSide=>/\bleft\b/i.test(name)?'left':/\bright\b/i.test(name)?'right':'midline';

export function correctedPartName(p:Part):string{
 const forced=NAME_OVERRIDES[p.id];
 if(forced)return forced;
 const region=anatomicalRegionForPart(p);
 if(region.zone!=='upper-limb'&&region.zone!=='lower-limb')return p.name;
 const geometric=sideFromGeometry(p),named=sideFromName(p.name);
 if(geometric==='midline'||named==='midline'||geometric===named)return p.name;
 return p.name.replace(/\bleft\b/i,'__SIDE__').replace(/\bright\b/i,'Left').replace('__SIDE__','Right');
}

export function anatomicalSideForPart(p:Part):AnatomicalSide{
 const forced=REGION_OVERRIDES[p.id]?.side;
 if(forced)return forced;
 const r=anatomicalRegionForPart(p);
 if(r.zone==='upper-limb'||r.zone==='lower-limb'){
  const geometric=sideFromGeometry(p);
  if(geometric!=='midline')return geometric;
 }
 return sideFromName(p.name);
}

const regionLabel=(zone:AnatomicalZone,subregion:AnatomicalSubregion)=>{
 const labels:Record<AnatomicalSubregion,[string,string]>={
  head:['head','頭部'],neck:['neck','頸部'],shoulder:['shoulder girdle','肩帶'],arm:['arm','上臂'],forearm:['forearm','前臂'],hand:['hand','手部'],
  thorax:['thorax','胸部'],abdomen:['abdomen','腹部'],pelvis:['pelvis','骨盆'],hip:['hip','髖部'],thigh:['thigh','大腿'],leg:['leg','小腿'],foot:['foot','足部'],back:['back / vertebral column','背部／脊柱'],other:['general anatomy','全身解剖']
 };
 const [en,zh]=labels[subregion];
 return{labelEn:en,labelZh:zh,zone};
};

export function anatomicalRegionForPart(p:Part):AnatomicalRegionResult{
 const override=REGION_OVERRIDES[p.id];
 if(override){const l=regionLabel(override.zone,override.subregion);return{...override,...l,confidence:'override'};}

 const name=p.name.toLowerCase(),[x,y]=partCenterTuple(p),ax=Math.abs(x);
 const explicitHand=HAND.test(name),explicitFoot=FOOT.test(name);
 const spatialFoot=y<.22&&ax>=.035&&ax<=.20;
 const spatialLower=(y<.80&&ax>=.035&&ax<=.205)||(y<.97&&ax<.17&&(HIP.test(name)||THIGH.test(name)||LEG.test(name)||explicitFoot));
 const spatialHand=y>=.67&&y<=.96&&ax>=.19;
 const spatialUpper=y>=.80&&y<=1.50&&ax>=.135;
 const spatialHead=y>=1.48&&ax<=.36;
 const spatialNeck=y>=1.10&&y<1.50&&ax<=.20;
 const spatialTrunk=y>=.72&&y<1.50&&ax<.18;

 let zone:AnatomicalZone='other',subregion:AnatomicalSubregion='other',confidence:AnatomicalRegionResult['confidence']='fallback';

 // Strong geometry wins over a contradictory label. This is essential for
 // known BodyParts3D element-label mismatches such as FJ2186/FJ2199.
 if(spatialFoot){zone='lower-limb';subregion='foot';confidence=explicitFoot?'spatial+name':'spatial';}
 else if(spatialHand){zone='upper-limb';subregion='hand';confidence=explicitHand?'spatial+name':'spatial';}
 else if(spatialLower&&(HIP.test(name)||THIGH.test(name)||LEG.test(name)||explicitFoot||y<.58)){
  zone='lower-limb';confidence='spatial+name';
  subregion=explicitFoot?'foot':LEG.test(name)||y<.56?'leg':HIP.test(name)||y>.84?'hip':'thigh';
 }else if(spatialUpper&&(SHOULDER.test(name)||ARM.test(name)||FOREARM.test(name)||explicitHand)){
  zone='upper-limb';confidence='spatial+name';
  subregion=explicitHand?'hand':FOREARM.test(name)||y<1.10?'forearm':ARM.test(name)||y<1.36?'arm':'shoulder';
 }else if((HEAD.test(name)&&y>.98)||spatialHead){zone='head-neck';subregion:'head';subregion='head';confidence=HEAD.test(name)?'spatial+name':'spatial';}
 else if((NECK.test(name)&&y>.95)||spatialNeck&&NECK.test(name)){zone='head-neck';subregion='neck';confidence='spatial+name';}
 else if(BACK.test(name)){zone='trunk';subregion='back';confidence='name';}
 else if(THORAX.test(name)||spatialTrunk&&y>=1.10){zone='trunk';subregion='thorax';confidence=THORAX.test(name)?'spatial+name':'spatial';}
 else if(ABDOMEN.test(name)||spatialTrunk&&y>=.90){zone='trunk';subregion='abdomen';confidence=ABDOMEN.test(name)?'spatial+name':'spatial';}
 else if(PELVIS.test(name)||spatialTrunk){zone='trunk';subregion='pelvis';confidence=PELVIS.test(name)?'spatial+name':'spatial';}
 else if(explicitHand||FOREARM.test(name)||ARM.test(name)||SHOULDER.test(name)){
  zone='upper-limb';subregion=explicitHand?'hand':FOREARM.test(name)?'forearm':ARM.test(name)?'arm':'shoulder';confidence='name';
 }else if(explicitFoot||LEG.test(name)||THIGH.test(name)||HIP.test(name)){
  zone='lower-limb';subregion=explicitFoot?'foot':LEG.test(name)?'leg':THIGH.test(name)?'thigh':'hip';confidence='name';
 }else if(HEAD.test(name)||NECK.test(name)){zone='head-neck';subregion=HEAD.test(name)?'head':'neck';confidence='name';}

 const side=(zone==='upper-limb'||zone==='lower-limb')?sideFromGeometry(p):sideFromName(p.name);
 const l=regionLabel(zone,subregion);
 return{zone,subregion,side,...l,confidence};
}

export function isUpperLimbPart(p:Part){return anatomicalRegionForPart(p).zone==='upper-limb';}
export function isLowerLimbPart(p:Part){return anatomicalRegionForPart(p).zone==='lower-limb';}
export function isHeadNeckPart(p:Part){return anatomicalRegionForPart(p).zone==='head-neck';}
export function isTrunkPart(p:Part){return anatomicalRegionForPart(p).zone==='trunk';}
export function isMotionQuarantined(p:Part){return MOTION_QUARANTINE.has(p.id);}

export function isRegionalFocusPart(p:Part,region:'upper'|'lower'|'head'){
 if(isMotionQuarantined(p))return false;
 const r=anatomicalRegionForPart(p);
 if(region==='upper')return r.zone==='upper-limb';
 if(region==='lower')return r.zone==='lower-limb';
 // The top navigation's "head" view intentionally keeps upper torso context,
 // while the motion panel uses isHeadNeckPart() for a true head/neck close-up.
 const [,y]=partCenterTuple(p);
 return r.zone==='head-neck'||(r.zone==='trunk'&&y>=1.05)||(r.zone==='upper-limb'&&y>=1.00);
}
