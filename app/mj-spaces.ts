import type {Part} from './anatomy';
import {anatomicalSide,correctedPartName} from './mj-part-regions';

/**
 * Anatomical spaces listed in the 分層解剖 panel. Each space names the structures that bound it and the
 * structures that pass through it, in the wording of its data card (the boundaries and contents lines of the
 * schematic space). `re` matches atlas part names (lower case, either side); `nerve` is the base name of a mesh of
 * the nerve system, which is not part of the atlas parts.
 */
export type SpaceGroup='shoulder'|'arm'|'hand'|'lower'|'head'|'trunk';
export interface SpaceItem{en:string;zh:string;re?:RegExp;nerve?:string}
export interface SpaceDef{/** side the camera looks from when the space is picked */view:'front'|'back';id:string;en:string;zh:string;group:SpaceGroup;/** lower-case name of the schematic space part, without side */part:string;boundaries:SpaceItem[];contents:SpaceItem[]}

const m=(en:string,zh:string,re:RegExp):SpaceItem=>({en,zh,re});
const n=(en:string,zh:string,nerve:string):SpaceItem=>({en,zh,nerve});

const teresMinor=m('Teres minor','小圓肌',/^(?:left |right )?teres minor$/);
const teresMajor=m('Teres major','大圓肌',/^(?:left |right )?teres major$/);
const tricepsLong=m('Triceps brachii, long head','肱三頭肌長頭',/^long head of \w+ triceps brachii$/);
const tricepsLateral=m('Triceps brachii, lateral head','肱三頭肌外側頭',/^lateral head of \w+ triceps brachii$/);
const humerus=m('Humerus','肱骨',/^(?:left |right )?humerus$/);
const medianNerve=n('Median nerve','正中神經','Median nerve');
const radialNerve=n('Radial nerve','橈神經','Radial nerve');
const flexorRetinaculumWrist=m('Flexor retinaculum (wrist)','屈肌支持帶（腕）',/flexor retinaculum of \w+ wrist/);
const carpals=m('Carpal bones','腕骨',/^(?:left |right )(?:scaphoid|lunate|triquetrum|pisiform|trapezium|trapezoid|capitate|hamate)$/);

export const SPACES:SpaceDef[]=[
 {view:'back',id:'quadrangular',en:'Quadrangular space',zh:'四邊孔',group:'shoulder',part:'quadrangular space',
  boundaries:[teresMinor,teresMajor,tricepsLong,m('Surgical neck of humerus','肱骨外科頸',/surgical neck of/)],
  contents:[n('Axillary nerve','腋神經','Axillary nerve'),m('Posterior circumflex humeral artery','旋肱後動脈',/posterior circumflex humeral artery/),m('Posterior circumflex humeral vein','旋肱後靜脈',/posterior circumflex humeral vein/)]},
 {view:'back',id:'triangular',en:'Triangular space',zh:'三邊孔',group:'shoulder',part:'triangular space',
  boundaries:[teresMinor,teresMajor,tricepsLong],
  contents:[m('Circumflex scapular artery','旋肩胛動脈',/circumflex scapular artery/),m('Circumflex scapular vein','旋肩胛靜脈',/circumflex scapular vein/)]},
 {view:'back',id:'triangular-interval',en:'Triangular interval',zh:'三頭肌間隙',group:'shoulder',part:'triangular interval',
  boundaries:[teresMajor,tricepsLong,tricepsLateral,humerus],
  contents:[radialNerve,m('Deep brachial artery','肱深動脈',/deep brachial artery/)]},
 {view:'front',id:'clavipectoral',en:'Clavipectoral triangle',zh:'鎖骨胸大肌三角',group:'shoulder',part:'clavipectoral triangle',
  boundaries:[m('Clavicle','鎖骨',/^(?:left |right )?clavicle$/),m('Deltoid','三角肌',/part of \w+ deltoid$/),m('Pectoralis major, clavicular part','胸大肌鎖骨部',/^clavicular part of \w+ pectoralis major$/)],
  contents:[m('Cephalic vein','頭靜脈',/^(?:left |right )cephalic vein$/)]},
 {view:'front',id:'axillary-fossa',en:'Axillary fossa',zh:'腋窩',group:'shoulder',part:'axillary fossa',
  boundaries:[m('Pectoralis major','胸大肌',/part of \w+ pectoralis major$/),m('Pectoralis minor','胸小肌',/pectoralis minor/),m('Subscapularis','肩胛下肌',/subscapularis/),teresMajor,m('Latissimus dorsi','背闊肌',/latissimus dorsi/),m('Serratus anterior','前鋸肌',/serratus anterior/),humerus],
  contents:[m('Axillary artery','腋動脈',/axillary artery$/),m('Axillary vein','腋靜脈',/axillary vein$/),m('Lateral and medial cords of brachial plexus','臂神經叢外側束與內側束',/(?:lateral|medial) cord of brachial plexus/),n('Posterior cord of brachial plexus','臂神經叢後側束','Posterior cord of brachial plexus')]},
 {view:'front',id:'cubital',en:'Cubital fossa',zh:'肘窩',group:'arm',part:'cubital fossa',
  boundaries:[m('Pronator teres','旋前圓肌',/pronator teres/),m('Brachioradialis','肱橈肌',/^(?:left |right )?brachioradialis$/),m('Brachialis','肱肌',/^(?:left |right )?brachialis$/),m('Supinator','旋後肌',/^(?:left |right )?supinator$/),m('Medial epicondyle of humerus','肱骨內上髁',/medial epicondyle of humerus/)],
  contents:[medianNerve,m('Brachial artery','肱動脈',/^(?:left |right )brachial artery$/),m('Biceps brachii (tendon)','肱二頭肌（肌腱）',/of \w+ biceps brachii$/),radialNerve,m('Median cubital vein','肘正中靜脈',/median cubital vein/)]},
 {view:'front',id:'snuffbox',en:'Anatomical snuffbox',zh:'解剖鼻煙盒',group:'hand',part:'anatomical snuffbox',
  boundaries:[m('Extensor pollicis longus','拇長伸肌',/extensor pollicis longus/),m('Abductor pollicis longus','拇長展肌',/abductor pollicis longus/),m('Extensor pollicis brevis','拇短伸肌',/extensor pollicis brevis/),m('Scaphoid','舟狀骨',/^(?:left |right )scaphoid$/),m('Trapezium','大多角骨',/^(?:left |right )trapezium$/)],
  contents:[m('Radial artery','橈動脈',/^(?:left |right )radial artery$/),n('Superficial branch of radial nerve','橈神經淺支','Superficial branch of radial nerve'),m('Cephalic vein','頭靜脈',/^(?:left |right )cephalic vein$/)]},
 {view:'front',id:'carpal-tunnel',en:'Carpal tunnel',zh:'腕隧道',group:'hand',part:'carpal tunnel',
  boundaries:[flexorRetinaculumWrist,carpals],
  contents:[medianNerve,m('Flexor digitorum superficialis','屈指淺肌',/flexor digitorum superficialis/),m('Flexor digitorum profundus','屈指深肌',/flexor digitorum profundus/),m('Flexor pollicis longus','屈拇長肌',/flexor pollicis longus/)]},
 {view:'front',id:'tarsal-tunnel',en:'Tarsal tunnel',zh:'跗隧道',group:'lower',part:'tarsal tunnel',
  boundaries:[m('Tibia','脛骨',/^(?:left |right )tibia$/),m('Talus','距骨',/^(?:left |right )talus$/),m('Calcaneus','跟骨',/^(?:left |right )calcaneus$/),m('Flexor retinaculum (ankle)','屈肌支持帶（踝）',/flexor retinaculum of (?:left |right )?ankle/)],
  contents:[m('Tibialis posterior','脛後肌',/^(?:left |right )tibialis posterior$/),m('Flexor digitorum longus','屈趾長肌',/^(?:left |right )flexor digitorum longus$/),m('Flexor hallucis longus','屈拇長肌',/^(?:left |right )flexor hallucis longus$/),m('Posterior tibial artery','脛後動脈',/^(?:left |right )posterior tibial artery$/),m('Posterior tibial vein','脛後靜脈',/^(?:left |right )posterior tibial vein$/),n('Tibial nerve','脛神經','Tibial nerve')]},
 {view:'front',id:'adductor-hiatus',en:'Adductor hiatus',zh:'內收肌裂孔',group:'lower',part:'adductor hiatus',
  boundaries:[m('Adductor magnus','內收大肌',/^(?:left |right )?adductor magnus$/)],
  contents:[m('Femoral artery','股動脈',/^(?:left |right )femoral artery$/),m('Femoral vein','股靜脈',/^(?:left |right )femoral vein$/),m('Popliteal artery','膕動脈',/^(?:left |right )popliteal artery$/),m('Popliteal vein','膕靜脈',/^(?:left |right )popliteal vein$/)]},
 {view:'back',id:'suboccipital',en:'Suboccipital triangle',zh:'枕下三角',group:'head',part:'suboccipital triangle',
  boundaries:[m('Rectus capitis posterior major','頭後大直肌',/rectus capitis posterior major/),m('Obliquus capitis superior','頭上斜肌',/obliquus capitis superior/),m('Obliquus capitis inferior','頭下斜肌',/obliquus capitis inferior/),m('Semispinalis capitis','頭半棘肌',/^(?:left |right )?semispinalis capitis$/),m('Posterior arch of atlas','寰椎後弓',/posterior arch of atlas/)],
  contents:[m('Vertebral artery','椎動脈',/^(?:left |right )vertebral artery$/),n('Suboccipital nerve','枕下神經','Suboccipital nerve')]},
 {view:'front',id:'aortic-hiatus',en:'Aortic hiatus',zh:'主動脈裂孔',group:'trunk',part:'aortic hiatus',
  boundaries:[m('Diaphragm','橫膈',/^diaphragm$/)],
  contents:[m('Aorta','主動脈',/^(?:descending thoracic aorta|abdominal aorta|descending aorta)$/),m('Thoracic duct','胸管',/^thoracic duct$/),m('Azygos vein','奇靜脈',/^azygos vein$/)]}
];

export type PartSide='left'|'right';
export interface SpaceItemHit{item:SpaceItem;ids:string[];nerves:string[]}
export interface SpaceHit{space:SpaceDef;spaceIds:string[];boundaries:SpaceItemHit[];contents:SpaceItemHit[];/** every atlas part to highlight: the space itself, its boundaries and its contents */highlight:string[];nerves:string[]}

const nameOf=(p:Part)=>correctedPartName(p).toLowerCase();

/** Parts of one side (and the midline) that stand for the space, its boundary structures and its contents. */
export function resolveSpace(parts:Part[],space:SpaceDef,side:PartSide):SpaceHit{
 const ok=(p:Part)=>{const s=anatomicalSide(p);return s===side||s==='midline';};
 const spaceRe=new RegExp(`^(?:left |right )?${space.part}$`);
 const spaceIds=parts.filter(p=>ok(p)&&spaceRe.test(nameOf(p))&&p.system!=='muscular').map(p=>p.id);
 const hit=(item:SpaceItem):SpaceItemHit=>({item,ids:item.re?parts.filter(p=>ok(p)&&item.re!.test(nameOf(p))).map(p=>p.id):[],nerves:item.nerve?[`${item.nerve}.${side==='left'?'l':'r'}.001`]:[]});
 const boundaries=space.boundaries.map(hit),contents=space.contents.map(hit);
 const all=[...boundaries,...contents];
 return{space,spaceIds,boundaries,contents,highlight:[...new Set([...spaceIds,...all.flatMap(h=>h.ids)])],nerves:[...new Set(all.flatMap(h=>h.nerves))]};
}

/** Which spaces each part of the body shows; the whole-body list shows them all. */
export const spacesForGroups=(groups:SpaceGroup[]|null)=>SPACES.filter(s=>!groups||groups.includes(s.group));
