import type {Part} from './anatomy';

export type AnatomicalRegion='head-neck'|'upper-limb'|'lower-limb'|'trunk';
export type AnatomicalSubregion='head'|'neck'|'shoulder'|'arm'|'forearm'|'hand'|'thorax'|'abdomen'|'pelvis'|'hip'|'thigh'|'leg'|'foot'|'back'|'general';

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

const REGION_OVERRIDES:Record<string,{region:AnatomicalRegion;subregion:AnatomicalSubregion;side:'left'|'right'|'midline'}>={
 FJ2186:{region:'lower-limb',subregion:'foot',side:'left'},
 FJ2199:{region:'lower-limb',subregion:'foot',side:'right'},
 FJ1469:{region:'upper-limb',subregion:'hand',side:'right'},
 FJ1469M:{region:'upper-limb',subregion:'hand',side:'left'}
};

// These BodyParts3D elements have names that are irreconcilable with their
// geometry. Keep them in the full atlas for source traceability, but exclude
// them from regional motion/focus until a corrected source mesh is substituted.
const MOTION_QUARANTINE=new Set(['FJ2091','FJ2195']);

export const partCenter=(part:Part):[number,number,number]=>[
 (part.bounds[0][0]+part.bounds[1][0])*.5,
 (part.bounds[0][1]+part.bounds[1][1])*.5,
 (part.bounds[0][2]+part.bounds[1][2])*.5,
];

const sideFromName=(name:string):'left'|'right'|'midline'=>/\bleft\b/i.test(name)?'left':/\bright\b/i.test(name)?'right':'midline';
const sideFromGeometry=(part:Part):'left'|'right'|'midline'=>{const [x]=partCenter(part);return x>.035?'left':x<-.035?'right':'midline';};

export function correctedPartName(part:Part):string{
 const override=NAME_OVERRIDES[part.id];if(override)return override;
 const r=anatomicalRegion(part);
 if(r!=='upper-limb'&&r!=='lower-limb')return part.name;
 const geometric=sideFromGeometry(part),named=sideFromName(part.name);
 if(geometric==='midline'||named==='midline'||geometric===named)return part.name;
 return part.name.replace(/\bleft\b/i,'__MJ_SIDE__').replace(/\bright\b/i,'Left').replace('__MJ_SIDE__','Right');
}

export function anatomicalSide(part:Part):'left'|'right'|'midline'{
 const forced=REGION_OVERRIDES[part.id]?.side;if(forced)return forced;
 const region=anatomicalRegion(part);
 if(region==='upper-limb'||region==='lower-limb'){
  const geometric=sideFromGeometry(part);if(geometric!=='midline')return geometric;
 }
 return sideFromName(part.name);
}

export function anatomicalSubregion(part:Part):AnatomicalSubregion{
 const forced=REGION_OVERRIDES[part.id]?.subregion;if(forced)return forced;
 const n=correctedPartName(part).toLowerCase(),[,y]=partCenter(part),r=anatomicalRegion(part);
 if(r==='upper-limb'){
  if(HAND.test(n)||y<.90)return 'hand';
  if(FOREARM.test(n)||y<1.11)return 'forearm';
  if(ARM.test(n)||y<1.37)return 'arm';
  return 'shoulder';
 }
 if(r==='lower-limb'){
  if(FOOT.test(n)||y<.18)return 'foot';
  if(LEG.test(n)||y<.56)return 'leg';
  if(HIP.test(n)||y>.84)return 'hip';
  return 'thigh';
 }
 if(r==='head-neck')return HEAD.test(n)||y>=1.48?'head':'neck';
 if(BACK.test(n))return 'back';
 if(THORAX.test(n)||y>=1.12)return 'thorax';
 if(ABDOMEN.test(n)||y>=.90)return 'abdomen';
 if(PELVIS.test(n)||y<.90)return 'pelvis';
 return 'general';
}

/**
 * Canonical region classifier shared by navigation, detail labels and motion.
 * Geometry has veto power when a source name is anatomically impossible at the
 * mesh position; this prevents hanging hands becoming legs and foot vessels
 * being driven by upper-limb joints.
 */
export function anatomicalRegion(part:Part):AnatomicalRegion{
 const forced=REGION_OVERRIDES[part.id]?.region;if(forced)return forced;
 const n=part.name.toLowerCase(),[x,y]=partCenter(part),ax=Math.abs(x);
 const hand=HAND.test(n),foot=FOOT.test(n);
 const spatialFoot=y<.22&&ax>=.035&&ax<=.205;
 const spatialHand=y>=.67&&y<=.96&&ax>=.19;
 if(spatialFoot)return 'lower-limb';
 if(spatialHand)return 'upper-limb';

 const spatialLower=(y<.80&&ax>=.035&&ax<=.205)||(y<.97&&ax<.17&&(HIP.test(n)||THIGH.test(n)||LEG.test(n)||foot));
 const spatialUpper=y>=.80&&y<=1.50&&ax>=.135;
 if(spatialLower&&(HIP.test(n)||THIGH.test(n)||LEG.test(n)||foot||y<.58))return 'lower-limb';
 if(spatialUpper&&(SHOULDER.test(n)||ARM.test(n)||FOREARM.test(n)||hand))return 'upper-limb';

 if((HEAD.test(n)&&y>.98)||(y>=1.48&&ax<=.36))return 'head-neck';
 if((NECK.test(n)&&y>.95)||(y>=1.10&&y<1.50&&ax<=.20&&NECK.test(n)))return 'head-neck';

 const regionalSystem=['skeletal','muscular','arterial','venous','nervous','connective','integumentary'].includes(part.system);
 if(regionalSystem){
  if(spatialUpper)return 'upper-limb';
  if(spatialLower)return 'lower-limb';
 }
 if(hand||FOREARM.test(n)||ARM.test(n)||SHOULDER.test(n))return 'upper-limb';
 if(foot||LEG.test(n)||THIGH.test(n)||HIP.test(n))return 'lower-limb';
 return 'trunk';
}

export function anatomicalRegionLabel(part:Part):{en:string;zh:string}{
 const sub=anatomicalSubregion(part);
 const labels:Record<AnatomicalSubregion,[string,string]>={
  head:['head','頭部'],neck:['neck','頸部'],shoulder:['shoulder girdle','肩帶'],arm:['arm','上臂'],forearm:['forearm','前臂'],hand:['hand','手部'],
  thorax:['thorax','胸部'],abdomen:['abdomen','腹部'],pelvis:['pelvis','骨盆'],hip:['hip','髖部'],thigh:['thigh','大腿'],leg:['leg','小腿'],foot:['foot','足部'],back:['back / vertebral column','背部／脊柱'],general:['general anatomy','全身解剖']
 };
 const [en,zh]=labels[sub];return{en,zh};
}

export function isMotionQuarantined(part:Part){return MOTION_QUARANTINE.has(part.id);}

export const partsInRegion=(parts:Part[],region:AnatomicalRegion)=>parts.filter(p=>!isMotionQuarantined(p)&&anatomicalRegion(p)===region).map(p=>p.id);

export function topRegionParts(parts:Part[],region:'whole'|'upper'|'lower'|'head'|'organs',organSystems:readonly string[]=[]):string[]|undefined{
 if(region==='whole')return undefined;
 if(region==='organs')return parts.filter(p=>organSystems.includes(p.system)).map(p=>p.id);
 if(region==='upper')return partsInRegion(parts,'upper-limb');
 if(region==='lower')return partsInRegion(parts,'lower-limb');
 // Top-level 頭部 keeps upper-body context; Motion 頭頸 uses only head-neck.
 return parts.filter(p=>{
  if(isMotionQuarantined(p))return false;
  const r=anatomicalRegion(p),[,y]=partCenter(p);
  return r==='head-neck'||(r==='upper-limb'&&y>=1.00)||(r==='trunk'&&y>=1.05);
 }).map(p=>p.id);
}
