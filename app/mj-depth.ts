import type {Part} from './anatomy';

export type TissueDepth='all'|'superficial'|'intermediate'|'deep';

const n=(p:Part)=>p.name.toLowerCase();

const superficialMuscle=/deltoid|trapezius|pectoralis major|latissimus dorsi|biceps brachii|triceps brachii|brachioradialis|pronator teres|flexor carpi radialis|palmaris longus|flexor carpi ulnaris|extensor carpi radialis longus|extensor digitorum|extensor digiti minimi|extensor carpi ulnaris|abductor pollicis brevis|flexor pollicis brevis|opponens pollicis|abductor digiti minimi of hand|flexor digiti minimi brevis of hand|opponens digiti minimi of hand/;
const intermediateMuscle=/pectoralis minor|serratus anterior|teres major|coracobrachialis|brachialis|anconeus|flexor digitorum superficialis|extensor carpi radialis brevis|lumbrical/;
const deepMuscle=/supraspinatus|infraspinatus|subscapularis|teres minor|rhomboid|levator scapulae|subclavius|supinator|flexor digitorum profundus|flexor pollicis longus|pronator quadratus|abductor pollicis longus|extensor pollicis|extensor indicis|interosse|adductor pollicis/;

const superficialNeurovascular=/cephalic vein|basilic vein|median cubital vein|median antebrachial vein|superficial branch|cutaneous nerve|dorsal venous network|superficial palmar/;
const deepNeurovascular=/brachial plexus|subscapular|suprascapular|circumflex|interosseous|deep branch|deep palmar|thoracodorsal|dorsal scapular|long thoracic|axillary artery|axillary vein/;

export function anatomyDepth(part:Part):Exclude<TissueDepth,'all'> {
 const name=n(part);
 if(part.system==='integumentary')return 'superficial';
 if(part.system==='skeletal'||part.system==='connective')return 'deep';
 if(part.system==='muscular'){
  if(deepMuscle.test(name))return 'deep';
  if(intermediateMuscle.test(name))return 'intermediate';
  if(superficialMuscle.test(name))return 'superficial';
  // Whole-body fallback: small intrinsic, interosseous and axial stabilisers are
  // usually deeper; broad named surface muscles stay superficial.
  if(/interspinal|intertransvers|rotator|multifid|obturator|gemellus|popliteus|pronator quadratus|transversus thoracis/.test(name))return 'deep';
  if(/semispinalis|splenius|soleus|iliacus|pectineus/.test(name))return 'intermediate';
  return 'superficial';
 }
 if(part.system==='arterial'||part.system==='venous'||part.system==='nervous'){
  if(superficialNeurovascular.test(name))return 'superficial';
  if(deepNeurovascular.test(name))return 'deep';
  return 'intermediate';
 }
 // Viscera are not peeled by the musculoskeletal depth control; classifying
 // them as deep keeps the meaning intuitive when the filter is used globally.
 return 'deep';
}

export function matchesDepth(part:Part,depth:TissueDepth|undefined){
 if(!depth||depth==='all')return true;
 const d=anatomyDepth(part);
 // "Intermediate" acts like a real dissection peel: remove the superficial
 // layer but keep intermediate + deep anatomy visible for spatial context.
 if(depth==='intermediate')return d==='intermediate'||d==='deep';
 return d===depth;
}
