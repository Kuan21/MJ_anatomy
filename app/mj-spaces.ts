import type {Part} from './anatomy';
import {anatomicalSide,correctedPartName} from './mj-part-regions';

/**
 * Anatomical spaces listed in the 分層解剖 panel. Each space names the structures that bound it and the
 * structures that pass through it, in the wording of its data card (the boundaries and contents lines of the
 * schematic space). `re` matches atlas part names (lower case, either side); `nerve` is the base name of a mesh of
 * the nerve system, which is not part of the atlas parts.
 */
export type SpaceGroup='shoulder'|'arm'|'hand'|'lower'|'head'|'trunk';
/** `role` is the position of the structure at the space ("上界", "底" …), shown in its label. */
export interface SpaceItem{en:string;zh:string;re?:RegExp;nerve?:string;role?:string}
/**
 * `r` is the radius (metres) of the sphere around the meeting point of the boundaries inside which the boundaries and contents are highlighted (the highlight fades out towards its edge).
 * `look` is the camera direction as [outward, up, front]: outward is towards the side the limb is on, front is +1 from the front and -1 from the back.
 * `missing` lists boundary and content structures the dissection panel names but the model does not have (reported in REVIEW_LOG.md; never replaced by a made-up mesh).
 */
export interface SpaceDef{id:string;en:string;zh:string;group:SpaceGroup;/** lower-case name of the schematic space part, without side; it is never drawn */part:string;r:number;look:[number,number,number];boundaries:SpaceItem[];contents:SpaceItem[];missing?:string[];related?:string[]}

const m=(en:string,zh:string,re:RegExp,role?:string):SpaceItem=>({en,zh,re,role});
const n=(en:string,zh:string,nerve:string,role?:string):SpaceItem=>({en,zh,nerve,role});

const teresMinor=(role:string)=>m('Teres minor','小圓肌',/^(?:left |right )?teres minor$/,role);
const teresMajor=(role:string)=>m('Teres major','大圓肌',/^(?:left |right )?teres major$/,role);
const tricepsLong=(role:string)=>m('Triceps brachii, long head','肱三頭肌長頭',/^long head of \w+ triceps brachii$/,role);
const tricepsLateral=m('Triceps brachii, lateral head','肱三頭肌外側頭',/^lateral head of \w+ triceps brachii$/,'外側界');
const humerus=(role:string)=>m('Humerus','肱骨',/^(?:left |right )?humerus$/,role);
const medianNerve=(role?:string)=>n('Median nerve','正中神經','Median nerve',role);
const radialNerve=(role?:string)=>n('Radial nerve','橈神經','Radial nerve',role);
const femoralArtery=m('Femoral artery','股動脈',/^(?:left |right )femoral artery$/,'內容物');
const femoralVein=m('Femoral vein','股靜脈',/^(?:left |right )femoral vein$/,'內容物');
const sartorius=(role:string)=>m('Sartorius','縫匠肌',/^(?:left |right )?sartorius$/,role);
const adductorLongus=(role:string)=>m('Adductor longus','內收長肌',/^(?:left |right )?adductor longus$/,role);
const adductorMagnus=(role:string)=>m('Adductor magnus','內收大肌',/^(?:left |right )?adductor magnus$/,role);

export const SPACES:SpaceDef[]=[
 {id:'quadrangular',en:'Quadrangular space',zh:'四邊孔',group:'shoulder',part:'quadrangular space',r:.04,look:[0,.12,-1],
  related:['triangular','triangular-interval'],
  boundaries:[teresMinor('上界'),teresMajor('下界'),tricepsLong('內側界'),m('Surgical neck of humerus','肱骨外科頸',/surgical neck of/,'外側界')],
  contents:[n('Axillary nerve','腋神經','Axillary nerve'),m('Posterior circumflex humeral artery','旋肱後動脈',/posterior circumflex humeral artery/),m('Posterior circumflex humeral vein','旋肱後靜脈',/posterior circumflex humeral vein/)]},
 {id:'triangular',en:'Triangular space',zh:'三邊孔',group:'shoulder',part:'triangular space',r:.03,look:[0,.12,-1],
  related:['quadrangular','triangular-interval'],
  boundaries:[teresMinor('上界'),teresMajor('下界'),tricepsLong('外側界')],
  contents:[m('Circumflex scapular artery','旋肩胛動脈',/circumflex scapular artery/),m('Circumflex scapular vein','旋肩胛靜脈',/circumflex scapular vein/)]},
 {id:'triangular-interval',en:'Triangular interval',zh:'三頭肌間隙',group:'shoulder',part:'triangular interval',r:.035,look:[0,.12,-1],
  related:['quadrangular','triangular'],
  boundaries:[teresMajor('上界'),tricepsLong('內側界'),tricepsLateral,humerus('外側界（肱骨幹）')],
  contents:[radialNerve(),m('Deep brachial artery','肱深動脈',/deep brachial artery/)]},
 {id:'clavipectoral',en:'Clavipectoral triangle',zh:'鎖骨胸大肌三角',group:'shoulder',part:'clavipectoral triangle',r:.04,look:[0,.2,1],
  boundaries:[m('Clavicle','鎖骨',/^(?:left |right )?clavicle$/,'上界'),m('Deltoid','三角肌',/part of \w+ deltoid$/,'外側界'),m('Pectoralis major, clavicular part','胸大肌鎖骨部',/^clavicular part of \w+ pectoralis major$/,'內側界')],
  contents:[m('Cephalic vein','頭靜脈',/^(?:left |right )cephalic vein$/)],
  missing:['Thoracoacromial artery 胸肩峰動脈（模型沒有此動脈）']},
 {id:'axillary-fossa',en:'Axillary fossa',zh:'腋窩',group:'shoulder',part:'axillary fossa',r:.075,look:[.35,-.55,.8],
  boundaries:[m('Pectoralis major','胸大肌',/part of \w+ pectoralis major$/,'前壁（腋前襞）'),m('Latissimus dorsi','背闊肌',/latissimus dorsi/,'後壁（腋後襞）'),teresMajor('後壁（腋後襞）'),m('Serratus anterior','前鋸肌',/serratus anterior/,'內側壁'),humerus('外側壁（結節間溝附近）')],
  contents:[m('Axillary artery','腋動脈',/axillary artery$/),m('Axillary vein','腋靜脈',/axillary vein$/),m('Lateral and medial cords of brachial plexus','臂神經叢外側束與內側束',/(?:lateral|medial) cord of brachial plexus/),n('Posterior cord of brachial plexus','臂神經叢後側束','Posterior cord of brachial plexus')],
  missing:['腋淋巴結（模型沒有）']},
 {id:'cubital',en:'Cubital fossa',zh:'肘窩',group:'arm',part:'cubital fossa',r:.05,look:[0,.25,1],
  boundaries:[m('Pronator teres','旋前圓肌',/pronator teres/,'內側界'),m('Brachioradialis','肱橈肌',/^(?:left |right )?brachioradialis$/,'外側界'),m('Brachialis','肱肌',/^(?:left |right )?brachialis$/,'底'),m('Supinator','旋後肌',/^(?:left |right )?supinator$/,'底'),m('Medial epicondyle of humerus','肱骨內上髁',/medial epicondyle of humerus/,'上界（兩上髁連線）')],
  contents:[radialNerve('深層'),m('Biceps brachii (tendon)','肱二頭肌（肌腱）',/of \w+ biceps brachii$/),m('Brachial artery','肱動脈',/^(?:left |right )brachial artery$/),medianNerve(),m('Median cubital vein','肘正中靜脈',/median cubital vein/)],
  missing:['Bicipital aponeurosis 肱二頭肌腱膜（頂；模型沒有）','Lateral epicondyle of humerus 肱骨外上髁（模型沒有此骨性標記）']},
 {id:'snuffbox',en:'Anatomical snuffbox',zh:'解剖鼻煙盒',group:'hand',part:'anatomical snuffbox',r:.03,look:[.8,.1,-.6],
  boundaries:[m('Extensor pollicis longus','拇長伸肌',/extensor pollicis longus/,'尺側界'),m('Abductor pollicis longus','拇長展肌',/abductor pollicis longus/,'橈側界'),m('Extensor pollicis brevis','拇短伸肌',/extensor pollicis brevis/,'橈側界'),m('Radius (styloid process)','橈骨（莖突）',/^(?:left |right )?radius$/,'近側界'),m('Scaphoid','舟狀骨',/^(?:left |right )scaphoid$/,'底'),m('Trapezium','大多角骨',/^(?:left |right )trapezium$/,'底')],
  contents:[m('Radial artery','橈動脈',/^(?:left |right )radial artery$/)]},
 {id:'carpal-tunnel',en:'Carpal tunnel',zh:'腕隧道',group:'hand',part:'carpal tunnel',r:.035,look:[0,.2,1],
  boundaries:[m('Flexor retinaculum (wrist)','屈肌支持帶（腕）',/flexor retinaculum of \w+ wrist/,'頂'),m('Carpal bones','腕骨',/^(?:left |right )(?:scaphoid|lunate|triquetrum|pisiform|trapezium|trapezoid|capitate|hamate)$/,'底（腕骨溝）')],
  contents:[medianNerve(),m('Flexor digitorum superficialis','屈指淺肌',/flexor digitorum superficialis/),m('Flexor digitorum profundus','屈指深肌',/flexor digitorum profundus/),m('Flexor pollicis longus','屈拇長肌',/flexor pollicis longus/)]},
 {id:'tarsal-tunnel',en:'Tarsal tunnel',zh:'跗隧道',group:'lower',part:'tarsal tunnel',r:.04,look:[-1,.1,.2],
  boundaries:[m('Tibia (medial malleolus)','脛骨（內踝）',/^(?:left |right )tibia$/,'前上界'),m('Talus','距骨',/^(?:left |right )talus$/,'外側界'),m('Calcaneus','跟骨',/^(?:left |right )calcaneus$/,'下界'),m('Flexor retinaculum (ankle)','屈肌支持帶（踝）',/flexor retinaculum of (?:left |right )?ankle/,'頂')],
  contents:[m('Tibialis posterior','脛後肌',/^(?:left |right )tibialis posterior$/),m('Flexor digitorum longus','屈趾長肌',/^(?:left |right )flexor digitorum longus$/),m('Posterior tibial artery','脛後動脈',/^(?:left |right )posterior tibial artery$/),m('Posterior tibial vein','脛後靜脈',/^(?:left |right )posterior tibial vein$/),n('Tibial nerve','脛神經','Tibial nerve'),m('Flexor hallucis longus','屈拇長肌',/^(?:left |right )flexor hallucis longus$/)]},
 {id:'femoral-triangle',en:'Femoral triangle',zh:'股三角',group:'lower',part:'femoral triangle',r:.08,look:[.15,.55,1],
  related:['adductor-canal','adductor-hiatus','popliteal-fossa'],
  boundaries:[m('Inguinal ligament','腹股溝韌帶',/^(?:left |right )?inguinal ligament$/,'上界'),sartorius('外側界（內側緣）'),adductorLongus('內側界（內側緣）'),m('Iliacus','髂肌',/^(?:left |right )?iliacus$/,'底（外）'),m('Psoas major','腰大肌',/^(?:left |right )?psoas major$/,'底（外）'),m('Pectineus','恥骨肌',/^(?:left |right )?pectineus$/,'底（內）')],
  contents:[n('Femoral nerve','股神經','Femoral nerve','內容物（最外）'),m('Femoral artery','股動脈',/^(?:left |right )femoral artery$/,'內容物'),m('Femoral vein','股靜脈',/^(?:left |right )femoral vein$/,'內容物'),m('Femoral sheath','股鞘',/^(?:left |right )femoral sheath$/,'內容物（包住動脈、靜脈與股管）'),m('Great saphenous vein','大隱靜脈',/^(?:left |right )great saphenous vein$/,'經隱靜脈裂孔注入股靜脈')],
  missing:['Fascia lata 闊筋膜（頂，含篩筋膜；模型沒有此構造）','Femoral canal 股管與其淋巴結（模型沒有）']},
 {id:'adductor-canal',en:'Adductor canal',zh:'內收肌管',group:'lower',part:'adductor canal',r:.075,look:[-1,.05,.45],
  related:['femoral-triangle','adductor-hiatus','popliteal-fossa'],
  boundaries:[sartorius('前內側（頂）'),m('Vastus medialis','股內側肌',/^(?:left |right )?vastus medialis$/,'外側'),adductorLongus('後側'),adductorMagnus('後側')],
  contents:[femoralArtery,femoralVein,n('Saphenous nerve','隱神經','Saphenous nerve'),m('Nerve to vastus medialis','股內側肌神經',/^(?:left |right )nerve to vastus medialis$/)]},
 {id:'adductor-hiatus',en:'Adductor hiatus',zh:'內收肌裂孔',group:'lower',part:'adductor hiatus',r:.03,look:[-1,.05,.3],
  related:['adductor-canal','popliteal-fossa'],
  boundaries:[adductorMagnus('邊緣（肌腱部的裂孔）'),m('Femur','股骨',/^(?:left |right )?femur$/,'外側')],
  contents:[femoralArtery,femoralVein,m('Popliteal artery','膕動脈',/^(?:left |right )popliteal artery$/),m('Popliteal vein','膕靜脈',/^(?:left |right )popliteal vein$/)]},
 {id:'popliteal-fossa',en:'Popliteal fossa',zh:'膕窩',group:'lower',part:'popliteal fossa',r:.07,look:[0,.15,-1],
  related:['adductor-hiatus','adductor-canal','femoral-triangle'],
  boundaries:[m('Biceps femoris','股二頭肌',/biceps femoris/,'上外側界'),m('Semimembranosus','半膜肌',/^(?:left |right )?semimembranosus$/,'上內側界'),m('Semitendinosus','半腱肌',/^(?:left |right )?semitendinosus$/,'上內側界'),m('Gastrocnemius, lateral head','腓腸肌外側頭',/^lateral head of \w+ gastrocnemius$/,'下外側界'),m('Plantaris','蹠肌',/^(?:left |right )?plantaris$/,'下外側界'),m('Gastrocnemius, medial head','腓腸肌內側頭',/^medial head of \w+ gastrocnemius$/,'下內側界'),m('Popliteus','膕肌',/^(?:left |right )?popliteus$/,'底'),m('Femur','股骨',/^(?:left |right )?femur$/,'底（膕面）')],
  contents:[n('Tibial nerve','脛神經','Tibial nerve','最淺'),n('Common fibular nerve','腓總神經','Common fibular nerve','沿股二頭肌內側緣向外下'),m('Small saphenous vein','小隱靜脈',/^(?:left |right )small saphenous vein$/,'穿頂注入膕靜脈'),m('Popliteal vein','膕靜脈',/^(?:left |right )popliteal vein$/),m('Popliteal artery','膕動脈',/^(?:left |right )popliteal artery$/,'最深，貼近股骨與關節囊')],
  missing:['Oblique popliteal ligament 膕斜韌帶與膝關節囊後面（模型沒有）','Popliteal surface of femur 股骨膕面（模型沒有此骨性標記，暫以股骨代替）','Popliteal fascia 膕筋膜（頂；模型沒有）','Popliteal lymph nodes 膕淋巴結（模型沒有）']},
 {id:'suboccipital',en:'Suboccipital triangle',zh:'枕下三角',group:'head',part:'suboccipital triangle',r:.03,look:[0,.2,-1],
  boundaries:[m('Rectus capitis posterior major','頭後大直肌',/rectus capitis posterior major/,'內側界'),m('Obliquus capitis superior','頭上斜肌',/obliquus capitis superior/,'外側界'),m('Obliquus capitis inferior','頭下斜肌',/obliquus capitis inferior/,'下界'),m('Semispinalis capitis','頭半棘肌',/^(?:left |right )?semispinalis capitis$/,'頂'),m('Posterior arch of atlas','寰椎後弓',/posterior arch of atlas/,'底')],
  contents:[m('Vertebral artery','椎動脈',/^(?:left |right )vertebral artery$/),n('Suboccipital nerve','枕下神經','Suboccipital nerve')]},
 {id:'aortic-hiatus',en:'Aortic hiatus',zh:'主動脈裂孔',group:'trunk',part:'aortic hiatus',r:.04,look:[0,.2,1],
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
