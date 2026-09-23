import type {Part} from './anatomy';

export type FacialMuscleLayer='all'|1|2|3|4|5;

export const FACIAL_MUSCLE_LAYERS=[
 {id:1,label:'Layer 1｜第1層',depth:'Deep mastication｜深層咀嚼肌',muscles:[
  'Medial pterygoid｜內翼肌',
  'Lateral pterygoid — upper head｜外翼肌上頭',
  'Lateral pterygoid — lower head｜外翼肌下頭'
 ]},
 {id:2,label:'Layer 2｜第2層',depth:'Deep facial plane｜深層面肌',muscles:[
  'Deep masseter｜咬肌深部',
  'Buccinator｜頰肌',
  'Levator anguli oris｜提口角肌',
  'Corrugator supercilii｜皺眉肌'
 ]},
 {id:3,label:'Layer 3｜第3層',depth:'Intermediate facial / mastication｜中層面肌／咀嚼肌',muscles:[
  'Temporalis｜顳肌',
  'Superficial masseter｜咬肌淺部',
  'Levator labii superioris｜提上唇肌',
  'Levator labii superioris alaeque nasi｜提上唇鼻翼肌',
  'Zygomaticus minor｜顴小肌',
  'Depressor labii inferioris｜降下唇肌'
 ]},
 {id:4,label:'Layer 4｜第4層',depth:'Superficial expression｜淺層表情肌',muscles:[
  'Zygomaticus major｜顴大肌',
  'Risorius｜笑肌',
  'Depressor anguli oris｜降口角肌',
  'Mentalis｜頦肌',
  'Nasalis｜鼻肌',
  'Procerus｜降眉間肌'
 ]},
 {id:5,label:'Layer 5｜第5層',depth:'Most superficial sheet / sphincters｜最表層肌片／括約肌',muscles:[
  'Frontalis｜額肌',
  'Occipitalis｜枕肌',
  'Orbicularis oculi — orbital part｜眼輪匝肌眶部',
  'Orbicularis oculi — palpebral part｜眼輪匝肌瞼部',
  'Orbicularis oris｜口輪匝肌'
 ]}
] as const;

const n=(p:Part)=>p.name.toLowerCase();
export const isSupplementalFacialMuscle=(p:Part)=>p.system==='muscular'&&p.id.startsWith('BP3-FMA');

const patterns:[number,RegExp][]=[
 [1,/medial pterygoid|lateral pterygoid/],
 [2,/deep part of .*masseter|\bbuccinator\b|levator anguli oris|corrugator supercilii/],
 [3,/\btemporalis\b|superficial part of .*masseter|levator labii superioris|zygomaticus minor|depressor labii inferioris/],
 [4,/zygomaticus major|\brisorius\b|depressor anguli oris|\bmentalis\b|\bnasalis\b|\bprocerus\b/],
 [5,/\bfrontalis\b|\boccipitalis\b|orbicularis oculi|orbicularis oris/]
];

export function facialMuscleLayer(part:Part):number|undefined{
 if(!isSupplementalFacialMuscle(part))return undefined;
 const name=n(part);
 for(const [layer,pattern] of patterns)if(pattern.test(name))return layer;
 return undefined;
}

/** Cumulative peel: layer 1 is deepest; choosing N keeps layers 1..N visible. */
export function matchesFacialMuscleLayer(part:Part,selected:FacialMuscleLayer|undefined){
 if(!selected||selected==='all'||!isSupplementalFacialMuscle(part))return true;
 const layer=facialMuscleLayer(part);
 return layer===undefined||layer<=selected;
}
