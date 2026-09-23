import type {Part} from './anatomy';

export type UpperLimbMuscleLayer='all'|1|2|3|4|5|6|7;

/**
 * Seven cumulative muscle layers reconstructed from the supplied dissection
 * recording and aligned with the earlier fine-layer prototype.
 * Layer 1 = deepest; Layer 7 = complete superficial cover.
 * Connective coverings (fascia/aponeuroses/retinacula) are intentionally kept
 * out of this muscle sequence and remain under Connective tissue.
 */
export const UPPER_LIMB_MUSCLE_LAYERS=[
 {id:1,label:'Layer 1｜第1層',depth:'Deepest｜最深層',muscles:[
  'Dorsal interossei of hand｜手背側骨間肌',
  'Palmar interossei of hand｜手掌側骨間肌',
  'Subscapularis｜肩胛下肌',
  'Internal intercostal muscle｜內肋間肌',
  'Innermost intercostal muscle｜最內肋間肌'
 ]},
 {id:2,label:'Layer 2｜第2層',depth:'Deep intrinsic｜深層內在肌',muscles:[
  'Lumbricals of hand｜手蚓狀肌',
  'Opponens pollicis｜拇對掌肌',
  'Abductor pollicis brevis｜拇短展肌',
  'Flexor pollicis brevis｜拇短屈肌',
  'Adductor pollicis｜拇收肌',
  'Opponens digiti minimi｜小指對掌肌',
  'Abductor digiti minimi of hand｜小指展肌',
  'Flexor digiti minimi brevis of hand｜小指短屈肌',
  'Supraspinatus｜棘上肌',
  'Teres minor｜小圓肌',
  'External intercostal muscle｜外肋間肌'
 ]},
 {id:3,label:'Layer 3｜第3層',depth:'Deep forearm / chest｜深層前臂／胸部',muscles:[
  'Flexor digitorum profundus｜指深屈肌',
  'Flexor pollicis longus｜拇長屈肌',
  'Pronator quadratus｜旋前方肌',
  'Pectoralis minor｜胸小肌',
  'Subclavius｜鎖骨下肌'
 ]},
 {id:4,label:'Layer 4｜第4層',depth:'Deep-intermediate｜深中層',muscles:[
  'Brachialis｜肱肌',
  'Coracobrachialis｜喙肱肌',
  'Supinator｜旋後肌',
  'Abductor pollicis longus｜拇長展肌',
  'Extensor pollicis longus｜拇長伸肌',
  'Extensor pollicis brevis｜拇短伸肌',
  'Extensor indicis｜示指伸肌',
  'Infraspinatus｜棘下肌',
  'Teres major｜大圓肌',
  'Rhomboid major｜大菱形肌',
  'Rhomboid minor｜小菱形肌',
  'Levator scapulae｜提肩胛肌'
 ]},
 {id:5,label:'Layer 5｜第5層',depth:'Intermediate｜中層',muscles:[
  'Flexor digitorum superficialis｜指淺屈肌',
  'Extensor digitorum｜指伸肌',
  'Extensor digiti minimi｜小指伸肌',
  'Serratus anterior｜前鋸肌'
 ]},
 {id:6,label:'Layer 6｜第6層',depth:'Superficial forearm｜淺層前臂',muscles:[
  'Pronator teres｜旋前圓肌',
  'Flexor carpi radialis｜橈側腕屈肌',
  'Palmaris longus｜掌長肌',
  'Flexor carpi ulnaris｜尺側腕屈肌',
  'Extensor carpi radialis longus｜橈側腕長伸肌',
  'Extensor carpi radialis brevis｜橈側腕短伸肌',
  'Extensor carpi ulnaris｜尺側腕伸肌',
  'Anconeus｜肘肌'
 ]},
 {id:7,label:'Layer 7｜第7層',depth:'Most superficial｜最表層',muscles:[
  'Biceps brachii — long head｜肱二頭肌長頭',
  'Biceps brachii — short head｜肱二頭肌短頭',
  'Triceps brachii — long head｜肱三頭肌長頭',
  'Triceps brachii — lateral head｜肱三頭肌外側頭',
  'Triceps brachii — medial head｜肱三頭肌內側頭',
  'Brachioradialis｜肱橈肌',
  'Deltoid — clavicular part｜三角肌鎖骨部',
  'Deltoid — acromial part｜三角肌肩峰部',
  'Deltoid — spinal part｜三角肌肩胛岡部',
  'Pectoralis major — clavicular part｜胸大肌鎖骨部',
  'Pectoralis major — sternocostal part｜胸大肌胸肋部',
  'Pectoralis major — abdominal part｜胸大肌腹部',
  'Trapezius｜斜方肌',
  'Latissimus dorsi｜背闊肌'
 ]}
] as const;

const n=(part:Part)=>part.name.toLowerCase();

const layerPatterns:[number,RegExp][]=[
 [1,/dorsal interossei of .*hand|palmar interossei of .*hand|subscapularis|internal intercostal|innermost intercostal/],
 [2,/lumbrical.*hand|opponens pollicis|abductor pollicis brevis|flexor pollicis brevis|adductor pollicis|opponens digiti minimi|abductor digiti minimi of .*hand|flexor digiti minimi brevis of .*hand|supraspinatus|teres minor|external intercostal/],
 [3,/flexor digitorum profundus|flexor pollicis longus|pronator quadratus|pectoralis minor|subclavius/],
 [4,/\bbrachialis\b|coracobrachialis|\bsupinator\b|abductor pollicis longus|extensor pollicis longus|extensor pollicis brevis|extensor indicis|infraspinatus|teres major|rhomboid major|rhomboid minor|levator scapulae/],
 [5,/flexor digitorum superficialis|extensor digitorum|extensor digiti minimi|serratus anterior/],
 [6,/pronator teres|flexor carpi radialis|palmaris longus|flexor carpi ulnaris|extensor carpi radialis longus|extensor carpi radialis brevis|extensor carpi ulnaris|\banconeus\b/],
 [7,/biceps brachii|triceps brachii|brachioradialis|deltoid|pectoralis major|trapezius|latissimus dorsi/]
];

export function upperLimbMuscleLayer(part:Part):number|undefined{
 if(part.system!=='muscular')return undefined;
 const centerY=(part.bounds[0][1]+part.bounds[1][1])*.5;
 // The seven-layer reference is for the upper limb / shoulder girdle. This
 // guard prevents same-named intrinsic foot muscles from entering the sequence.
 if(centerY<.72)return undefined;
 const name=n(part);
 for(const [layer,pattern] of layerPatterns)if(pattern.test(name))return layer;
 return undefined;
}

/**
 * Cumulative peel: selecting layer N keeps layers 1..N visible.
 * Selecting All restores every muscle.
 */
export function matchesUpperLimbMuscleLayer(part:Part,selected:UpperLimbMuscleLayer|undefined){
 if(!selected||selected==='all'||part.system!=='muscular')return true;
 const layer=upperLimbMuscleLayer(part);
 return layer===undefined||layer<=selected;
}
