import type {Atlas,Part,SystemId} from './anatomy';
import sourceOverrides from './anatomy-source-overrides.json';

const connectiveTerms=['ligament','cartilage','labrum','bursa','tendon','fascia','aponeurosis','retinaculum','sheath','capsule','membrane','iliotibial tract','intervertebral disk','intervertebral disc'];
const muscleTerms=['deltoid','pectoralis','subclavius','serratus','trapezius','latissimus','levator scapulae','rhomboid','supraspinatus','infraspinatus','subscapularis','teres ','biceps','triceps','coracobrachialis','brachialis','pronator','flexor','palmaris','extensor','brachioradialis','supinator','abductor','adductor','opponens','lumbrical','interosse','thenar','hypothenar','fibularis','tibialis','constrictor','palatopharyngeus','salpingopharyngeus','stylopharyngeus','cricothyroid'];

type PartOverride={name?:string;conceptId?:string};
const overrides=sourceOverrides as {exclude:string[];parts:Record<string,PartOverride>;concepts:Record<string,string>};
const excluded=new Set(overrides.exclude);

export function displaySystem(part:Part):SystemId{
 const n=part.name.toLowerCase();
 if(/artery|arterial/.test(n))return 'arterial';
 if(/vein|venous/.test(n))return 'venous';
 if(/nerve|plexus|ganglion|neural/.test(n))return 'nervous';
 if(/tensor fasciae latae/.test(n))return 'muscular';
 if(connectiveTerms.some(term=>n.includes(term)))return 'connective';
 if(muscleTerms.some(term=>n.includes(term)))return 'muscular';
 return part.system;
}

/**
 * Normalise source identity before the atlas reaches search, region filters,
 * detail panels or motion rigs. BodyParts3D contains a handful of source
 * records whose label/laterality disagrees with the actual mesh position.
 * Keeping the correction here gives every downstream feature one identity.
 */
export function normalizeAtlasSystems(atlas:Atlas):Atlas{
 const parts=atlas.parts
  .filter(part=>!excluded.has(part.id))
  .map(part=>{
   const patch=overrides.parts[part.id];
   const corrected={...part,...patch} as Part;
   return {...corrected,system:displaySystem(corrected)};
  });

 const byConcept=new Map<string,string[]>();
 for(const part of parts){
  const list=byConcept.get(part.conceptId)??[];
  list.push(part.id);byConcept.set(part.conceptId,list);
 }

 const concepts=atlas.concepts
  .map(c=>({...c,name:overrides.concepts[c.id]??c.name,elements:byConcept.get(c.id)??[]}))
  .filter(c=>c.elements.length>0);
 const known=new Set(concepts.map(c=>c.id));
 for(const [id,elements] of byConcept){
  if(known.has(id))continue;
  const first=parts.find(p=>p.conceptId===id);
  concepts.push({id,name:overrides.concepts[id]??first?.name??id,elements});
 }
 return {...atlas,parts,concepts};
}
