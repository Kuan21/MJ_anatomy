import type {Part} from './anatomy';

export type TissueDepth='all'|'superficial'|'intermediate'|'deep';

const n=(p:Part)=>p.name.toLowerCase();

const superficialMuscle=/deltoid|pectoralis major|biceps brachii|triceps brachii|brachioradialis|pronator teres|flexor carpi radialis|palmaris longus|flexor carpi ulnaris|extensor carpi radialis longus|extensor digitorum|extensor digiti minimi|extensor carpi ulnaris|abductor pollicis brevis|flexor pollicis brevis|opponens pollicis|abductor digiti minimi of hand|flexor digiti minimi brevis of hand|opponens digiti minimi of hand/;
const intermediateMuscle=/pectoralis minor|serratus anterior|teres major|coracobrachialis|brachialis|anconeus|flexor digitorum superficialis|extensor carpi radialis brevis|lumbrical/;
const deepMuscle=/supraspinatus|infraspinatus|subscapularis|teres minor|subclavius|supinator|flexor digitorum profundus|flexor pollicis longus|pronator quadratus|abductor pollicis longus|extensor pollicis|extensor indicis|interosse|adductor pollicis/;

const superficialNeurovascular=/cephalic vein|basilic vein|median cubital vein|median antebrachial vein|superficial branch|cutaneous nerve|dorsal venous network|superficial palmar/;
const deepNeurovascular=/brachial plexus|subscapular|suprascapular|circumflex|interosseous|deep branch|deep palmar|thoracodorsal|long thoracic|axillary artery|axillary vein/;


/**
 * Layers of the back (Gray's Anatomy 1918 and OpenStax; names as in the course list). Superficial: trapezius, latissimus dorsi, the posterior layer of the
 * thoracolumbar fascia. Middle: rhomboids, levator scapulae, the two posterior serratus muscles. Deep (the intrinsic muscles): splenius, erector spinae,
 * transversospinal group, interspinales, intertransversarii, levatores costarum and the suboccipital muscles. Vessels and nerves follow the layer they run in.
 * The match is by name, so it holds for every side and every piece of a muscle.
 */
export const BACK_LAYERS:{depth:Exclude<TissueDepth,'all'>;re:RegExp;systems?:string[]}[]=[
 {depth:'superficial',re:/trapezius|latissimus dorsi|thoracolumbar fascia|accessory nerve|transverse cervical artery|superficial branch of transverse cervical/},
 {depth:'intermediate',re:/rhomboid|levator scapulae|serratus posterior|dorsal scapular/},
 {depth:'deep',re:/splenius|iliocostalis|longissimus|spinalis|semispinalis|multifidus|rotator|interspinal|intertransvers|levatores costarum|levator costarum|rectus capitis posterior|obliquus capitis|dorsal ramus|posterior cutaneous branch of dorsal ramus|suboccipital|greater occipital|third occipital|vertebral artery|ligamentum flavum|denticulate|spinal nerve|spinal ganglion|root of spinal|posterior rami|spinal ganglia|sympathetic trunk|suboccipital venous|suboccipital plexus/},
];
const backLayer=(name:string)=>BACK_LAYERS.find(l=>l.re.test(name))?.depth;
/** Depth of an external nerve mesh (the separate nerve model); undefined = the depth control does not apply to it (nerves of other regions keep their own region filters). */
export function nerveDepth(name:string):Exclude<TissueDepth,'all'>|undefined{return backLayer(name.toLowerCase());}

type Layer=Exclude<TissueDepth,'all'>;
/** The depth of a structure and how it was decided: by a named rule, or by the default of its system (listed in docs/depth-classification.md for checking). */
export function anatomyDepthInfo(part:Part):{depth:Layer;by:'rule'|'default'}{
 const name=n(part);
 const rule=(depth:Layer)=>({depth,by:'rule' as const}),dflt=(depth:Layer)=>({depth,by:'default' as const});
 if(part.system==='integumentary')return rule('superficial');
 const back=part.system==='skeletal'?undefined:backLayer(name);
 if(back)return rule(back);
 if(part.system==='skeletal'||part.system==='connective'||part.system==='tendon')return dflt('deep');
 if(part.system==='muscular'){
  if(deepMuscle.test(name))return rule('deep');
  if(intermediateMuscle.test(name))return rule('intermediate');
  if(superficialMuscle.test(name))return rule('superficial');
  // Whole-body fallback: small intrinsic, interosseous and axial stabilisers are
  // usually deeper; broad named surface muscles stay superficial.
  if(/obturator|gemellus|popliteus|pronator quadratus|transversus thoracis/.test(name))return rule('deep');
  if(/soleus|iliacus|pectineus/.test(name))return rule('intermediate');
  return dflt('superficial');
 }
 if(part.system==='arterial'||part.system==='venous'||part.system==='nervous'){
  if(superficialNeurovascular.test(name))return rule('superficial');
  if(deepNeurovascular.test(name))return rule('deep');
  return dflt('intermediate');
 }
 // Viscera are not peeled by the musculoskeletal depth control; classifying
 // them as deep keeps the meaning intuitive when the filter is used globally.
 return dflt('deep');
}
export const anatomyDepth=(part:Part):Layer=>anatomyDepthInfo(part).depth;

/**
 * A chosen layer shows only the muscles (with their tendons), connective tissue, vessels and nerves of that layer. Bone is the reference and is always shown.
 */
export function matchesDepth(part:Part,depth:TissueDepth|undefined){
 if(!depth||depth==='all')return true;
 // bone and the joint cartilage that belongs to it (intervertebral disks) are the reference
 if(part.system==='skeletal'||/intervertebral disk/.test(n(part)))return true;
 return anatomyDepth(part)===depth;
}
