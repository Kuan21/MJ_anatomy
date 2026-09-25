import type {Part} from './anatomy';

export type AnatomicalRegion='head-neck'|'upper-limb'|'lower-limb'|'trunk';

const upperName=/\b(?:clavicle|scapula|humerus|radius|ulna|carpal|metacarpal|finger|thumb|hand|pollicis|palmar|brachial|antebrachial|deltoid|pectoralis|serratus anterior|trapezius|rhomboid|supraspinatus|infraspinatus|subscapularis|teres major|teres minor|biceps brachii|triceps brachii|coracobrachialis|brachialis|brachioradialis|pronator|supinator|carpi|cephalic vein|basilic vein|axillary artery|axillary vein|axillary nerve|musculocutaneous nerve|median nerve|ulnar nerve|radial nerve|suprascapular nerve|long thoracic nerve|thoracodorsal nerve|dorsal scapular nerve)\b/i;
const lowerName=/\b(?:hip bone|hip joint|femur|femoral|patella|tibia|tibial|fibula|fibular|peroneal|popliteal|saphenous|sciatic|gluteus|gluteal|rectus femoris|vastus|hamstring|biceps femoris|semitendinosus|semimembranosus|gastrocnemius|soleus|tibialis|fibularis|gracilis|sartorius|iliotibial|patellar|calcaneal|calcaneus|achilles|plantar|hallucis|metatarsal|toe|ankle|talus|navicular of foot|cuneiform|cuboid|obturator|piriformis|gemellus|quadratus femoris|pectineus)\b/i;
const headName=/\b(?:cervical vertebra|atlas|axis|hyoid|mandible|maxilla|zygomatic|nasal bone|lacrimal bone|palatine bone|vomer|inferior nasal concha|frontal bone|parietal bone|temporal bone|occipital bone|sphenoid|ethmoid|brain|cerebr|cerebell|brainstem|midbrain|pons|medulla oblongata|cranial|carotid|jugular|laryn|pharyn|sternocleidomastoid|scalene|longus capitis|longus colli|splenius capitis|semispinalis capitis|rectus capitis|obliquus capitis|platysma|thyroid cartilage|cricoid|epiglottis)\b/i;

export const partCenter=(part:Part):[number,number,number]=>[
 (part.bounds[0][0]+part.bounds[1][0])*.5,
 (part.bounds[0][1]+part.bounds[1][1])*.5,
 (part.bounds[0][2]+part.bounds[1][2])*.5,
];

export function anatomicalSide(part:Part):'left'|'right'|'midline'{
 const [x]=partCenter(part);
 if(x>.025)return 'left';
 if(x<-.025)return 'right';
 return 'midline';
}

/**
 * One canonical body-region classifier used by navigation, camera focus and
 * motion selection. Strong anatomical names win; geometry is only a fallback.
 * This prevents hanging hands from being classified as lower limbs simply
 * because their y-coordinate overlaps the pelvis/thigh range.
 */
export function anatomicalRegion(part:Part):AnatomicalRegion{
 const n=part.name.toLowerCase();
 if(upperName.test(n))return 'upper-limb';
 if(lowerName.test(n))return 'lower-limb';
 if(headName.test(n))return 'head-neck';

 const [x,y]=partCenter(part),ax=Math.abs(x);
 const regionalSystem=['skeletal','muscular','arterial','venous','nervous','connective','integumentary'].includes(part.system);
 if(regionalSystem){
  if(y>=1.34&&ax<.30)return 'head-neck';
  if(ax>=.175&&y>=.65&&y<=1.48)return 'upper-limb';
  if(y<=.88&&ax>=.035&&ax<=.19)return 'lower-limb';
 }
 return 'trunk';
}

export const partsInRegion=(parts:Part[],region:AnatomicalRegion)=>parts.filter(p=>anatomicalRegion(p)===region).map(p=>p.id);

export function topRegionParts(parts:Part[],region:'whole'|'upper'|'lower'|'head'|'organs',organSystems:readonly string[]=[]):string[]|undefined{
 if(region==='whole')return undefined;
 if(region==='organs')return parts.filter(p=>organSystems.includes(p.system)).map(p=>p.id);
 if(region==='upper')return partsInRegion(parts,'upper-limb');
 if(region==='lower')return partsInRegion(parts,'lower-limb');
 // Top-level "頭部" intentionally keeps upper-body context, unlike Motion
 // "頭頸", which uses only the head-neck region.
 return parts.filter(p=>{
  const r=anatomicalRegion(p),[,y]=partCenter(p);
  return r==='head-neck'||r==='upper-limb'||(r==='trunk'&&y>=.92);
 }).map(p=>p.id);
}
