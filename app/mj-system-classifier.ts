import type {Atlas,Part,SystemId} from './anatomy';

const connectiveTerms=['ligament','cartilage','labrum','bursa','tendon','fascia','aponeurosis','retinaculum','sheath','capsule','membrane','iliotibial tract','intervertebral disk','intervertebral disc'];
const muscleTerms=['deltoid','pectoralis','subclavius','serratus','trapezius','latissimus','levator scapulae','rhomboid','supraspinatus','infraspinatus','subscapularis','teres ','biceps','triceps','coracobrachialis','brachialis','pronator','flexor','palmaris','extensor','brachioradialis','supinator','abductor','adductor','opponens','lumbrical','interosse','thenar','hypothenar','fibularis','tibialis','constrictor','palatopharyngeus','salpingopharyngeus','stylopharyngeus','cricothyroid'];

export function displaySystem(part:Part):SystemId{
 const n=part.name.toLowerCase();
 if(/artery|arterial/.test(n))return 'arterial';
 if(/vein|venous/.test(n))return 'venous';
 if(/nerve|plexus|ganglion|neural/.test(n))return 'nervous';
 if(connectiveTerms.some(term=>n.includes(term)))return 'connective';
 if(muscleTerms.some(term=>n.includes(term)))return 'muscular';
 return part.system;
}

export function normalizeAtlasSystems(atlas:Atlas):Atlas{
 return {...atlas,parts:atlas.parts.map(part=>({...part,system:displaySystem(part)}))};
}
