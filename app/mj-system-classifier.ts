import type {Atlas,Part,SystemId} from './anatomy';

const connectiveTerms=['ligament','cartilage','labrum','bursa','tendon','fascia','aponeurosis','retinaculum','sheath','capsule','membrane'];
const muscleTerms=['deltoid','pectoralis','subclavius','serratus','trapezius','latissimus','levator scapulae','rhomboid','supraspinatus','infraspinatus','subscapularis','teres ','biceps','triceps','coracobrachialis','brachialis','pronator','flexor','palmaris','extensor','brachioradialis','supinator','abductor','adductor','opponens','lumbrical','interosse','thenar','hypothenar'];

export function displaySystem(part:Part):SystemId{
 const n=part.name.toLowerCase();
 if(n.includes('artery'))return 'arterial';
 if(n.includes('vein'))return 'venous';
 if(n.includes('nerve'))return 'nervous';
 if(connectiveTerms.some(term=>n.includes(term)))return 'connective';
 if(muscleTerms.some(term=>n.includes(term)))return 'muscular';
 return part.system;
}

export function normalizeAtlasSystems(atlas:Atlas):Atlas{
 return {...atlas,parts:atlas.parts.map(part=>({...part,system:displaySystem(part)}))};
}
