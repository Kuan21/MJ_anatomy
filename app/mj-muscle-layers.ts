import type {Part} from './anatomy';

export type UpperLimbMuscleLayer='all'|1|2|3|4|5|6|7;

export const UPPER_LIMB_MUSCLE_LAYERS=[
 {id:1,label:'Layer 1｜第1層',depth:'Deepest｜最深層',muscles:[
  'Supinator｜旋後肌','Pronator quadratus｜旋前方肌','Abductor pollicis longus｜拇長外展肌',
  'Extensor pollicis brevis｜拇短伸肌','Extensor pollicis longus｜拇長伸肌','Extensor indicis｜示指伸肌',
  'Flexor digitorum profundus｜指深屈肌','Flexor pollicis longus｜拇長屈肌',
  'Dorsal interossei｜骨間背側肌','Palmar interossei｜骨間掌側肌','Adductor pollicis｜拇收肌'
 ]},
 {id:2,label:'Layer 2｜第2層',depth:'Deep｜深層',muscles:[
  'Subscapularis｜肩胛下肌','Brachialis｜肱肌','Coracobrachialis｜喙肱肌',
  'Medial head of triceps brachii｜肱三頭肌內側頭','Lumbricals｜蚓狀肌',
  'Opponens pollicis｜拇對掌肌','Opponens digiti minimi｜小指對掌肌'
 ]},
 {id:3,label:'Layer 3｜第3層',depth:'Deep-intermediate｜深中層',muscles:[
  'Flexor digitorum superficialis｜指淺屈肌','Supraspinatus｜棘上肌','Teres minor｜小圓肌',
  'Pectoralis minor｜胸小肌','Subclavius｜鎖骨下肌','Anconeus｜肘肌',
  'Extensor carpi radialis brevis｜橈側腕短伸肌'
 ]},
 {id:4,label:'Layer 4｜第4層',depth:'Intermediate｜中層',muscles:[
  'Infraspinatus｜棘下肌','Teres major｜大圓肌','Long head of triceps brachii｜肱三頭肌長頭',
  'Lateral head of triceps brachii｜肱三頭肌外側頭','Rhomboid major｜大菱形肌','Rhomboid minor｜小菱形肌',
  'Levator scapulae｜提肩胛肌'
 ]},
 {id:5,label:'Layer 5｜第5層',depth:'Intermediate-superficial｜中淺層',muscles:[
  'Serratus anterior｜前鋸肌','Pronator teres｜旋前圓肌','Flexor carpi radialis｜橈側腕屈肌',
  'Palmaris longus｜掌長肌','Flexor carpi ulnaris｜尺側腕屈肌','Extensor digitorum｜指伸肌',
  'Extensor digiti minimi｜小指伸肌','Extensor carpi ulnaris｜尺側腕伸肌',
  'Abductor pollicis brevis｜拇短外展肌','Flexor pollicis brevis｜拇短屈肌',
  'Abductor digiti minimi｜小指外展肌','Flexor digiti minimi brevis｜小指短屈肌'
 ]},
 {id:6,label:'Layer 6｜第6層',depth:'Superficial｜淺層',muscles:[
  'Biceps brachii, long head｜肱二頭肌長頭','Biceps brachii, short head｜肱二頭肌短頭',
  'Brachioradialis｜肱橈肌','Extensor carpi radialis longus｜橈側腕長伸肌'
 ]},
 {id:7,label:'Layer 7｜第7層',depth:'Surface cover｜最表層',muscles:[
  'Deltoid, clavicular part｜三角肌鎖骨部','Deltoid, acromial part｜三角肌肩峰部','Deltoid, spinal part｜三角肌肩胛岡部',
  'Pectoralis major, clavicular part｜胸大肌鎖骨部','Pectoralis major, sternocostal part｜胸大肌胸肋部','Pectoralis major, abdominal part｜胸大肌腹部',
  'Trapezius｜斜方肌','Latissimus dorsi｜背闊肌'
 ]}
] as const;

const n=(part:Part)=>part.name.toLowerCase();

const layerPatterns:[number,RegExp][]=[
 [1,/supinator|pronator quadratus|abductor pollicis longus|extensor pollicis brevis|extensor pollicis longus|extensor indicis|flexor digitorum profundus|flexor pollicis longus|dorsal interosse|palmar interosse|adductor pollicis/],
 [2,/subscapularis|\bbrachialis\b|coracobrachialis|medial head of .*triceps brachii|lumbrical|opponens pollicis|opponens digiti minimi/],
 [3,/flexor digitorum superficialis|supraspinatus|teres minor|pectoralis minor|subclavius|anconeus|extensor carpi radialis brevis/],
 [4,/infraspinatus|teres major|long head of .*triceps brachii|lateral head of .*triceps brachii|rhomboid major|rhomboid minor|levator scapulae/],
 [5,/serratus anterior|pronator teres|flexor carpi radialis|palmaris longus|flexor carpi ulnaris|extensor digitorum|extensor digiti minimi|extensor carpi ulnaris|abductor pollicis brevis|flexor pollicis brevis|abductor digiti minimi|flexor digiti minimi brevis/],
 [6,/biceps brachii|brachioradialis|extensor carpi radialis longus/],
 [7,/deltoid|pectoralis major|trapezius|latissimus dorsi/]
];

export function upperLimbMuscleLayer(part:Part):number|undefined{
 if(part.system!=='muscular')return undefined;
 const centerY=(part.bounds[0][1]+part.bounds[1][1])*.5;
 // The seven-layer reference is an upper-limb study. Do not accidentally
 // classify similarly named intrinsic muscles in the foot or lower limb.
 if(centerY<.72)return undefined;
 const name=n(part);
 for(const [layer,pattern] of layerPatterns)if(pattern.test(name))return layer;
 return undefined;
}

/**
 * The reference video reveals muscle layers cumulatively: layer 1 is deepest,
 * and selecting layer N shows layers 1..N. Muscles outside the reference
 * upper-limb set are left untouched.
 */
export function matchesUpperLimbMuscleLayer(part:Part,selected:UpperLimbMuscleLayer|undefined){
 if(!selected||selected==='all'||part.system!=='muscular')return true;
 const layer=upperLimbMuscleLayer(part);
 return layer===undefined||layer<=selected;
}
