import type {Part,SystemId} from './anatomy';
import {anatomicalRegion,anatomicalSide,clavicleLevel,isMotionQuarantined,partCenter,topRegionParts} from './mj-part-regions';

/**
 * Top region bar: region membership of every structure.
 *
 * Each structure can belong to several regions (the aorta runs through the chest and the retroperitoneum, the diaphragm borders both
 * cavities, latissimus dorsi lies on the back, the chest wall and the arm). A tag is "region" or "region/depth". The rules below are the
 * data file: name patterns first, then a height band for names that occur in more than one place (segmental arteries of the lung and the
 * kidney). The full list per region is written to REVIEW_LOG.md / docs/region-members.md by `node scripts/list-region-members.mjs`.
 */
export type RegionKey='whole'|'head'|'upper'|'chest'|'back'|'abdomen'|'pelvis'|'gluteal'|'lower';
export type Side='left'|'right';
export interface RegionSub{id:string;label:string;en:string}
export interface RegionDef{key:RegionKey;label:string;en:string;/** left / right choice */paired:boolean;/** depth choices of a body cavity; the first is the default */subs?:RegionSub[]}

export const REGION_BAR:RegionDef[]=[
 {key:'whole',label:'全身',en:'Whole body',paired:false},
 {key:'head',label:'頭頸',en:'Head & neck',paired:true},
 {key:'upper',label:'上肢',en:'Upper limb',paired:true},
 {key:'chest',label:'胸腔',en:'Thorax',paired:true,subs:[{id:'mediastinum',label:'縱隔與心臟',en:'Mediastinum & heart'},{id:'wall',label:'胸壁',en:'Chest wall'},{id:'lung',label:'肺與胸膜',en:'Lungs & pleura'}]},
 {key:'back',label:'背部',en:'Back',paired:true},
 {key:'abdomen',label:'腹腔',en:'Abdomen',paired:false,subs:[{id:'organs',label:'腹腔器官',en:'Abdominal organs'},{id:'wall',label:'腹壁',en:'Abdominal wall'},{id:'retro',label:'後腹壁（腎、大血管）',en:'Posterior wall (kidneys, great vessels)'}]},
 {key:'pelvis',label:'骨盆與會陰',en:'Pelvis & perineum',paired:false,subs:[{id:'organs',label:'骨盆器官',en:'Pelvic organs'},{id:'wall',label:'骨盆壁',en:'Pelvic wall'},{id:'perineum',label:'會陰',en:'Perineum'}]},
 {key:'gluteal',label:'臀區',en:'Gluteal region',paired:true},
 {key:'lower',label:'下肢',en:'Lower limb',paired:true},
];
export const regionDef=(key:RegionKey)=>REGION_BAR.find(r=>r.key===key)??REGION_BAR[0];
/** Regions that are drawn by the new focus logic; the limbs and the head keep their existing views (and joint motion). */
export const CAVITY_KEYS:RegionKey[]=['chest','abdomen','pelvis'];
export const NEW_FOCUS_KEYS:RegionKey[]=['chest','back','abdomen','pelvis','gluteal'];

export type RegionTag='head'|'upper'|'lower'|'back'|'gluteal'|'chest/wall'|'chest/mediastinum'|'chest/lung'|'abdomen/wall'|'abdomen/organs'|'abdomen/retro'|'pelvis/wall'|'pelvis/organs'|'pelvis/perineum';

type Rule={tags:RegionTag[];re:RegExp;/** only these systems */sys?:SystemId[];/** height band of the centre, metres (standing figure, floor = 0) */y?:[number,number]};
const T=(tags:RegionTag[],re:RegExp,more:{sys?:SystemId[];y?:[number,number]}={}):Rule=>({tags,re,...more});

const CHEST_BONE=/\brib\b|costal cartilage|sternum|manubrium|xiphoid|thoracic vertebra|intervertebral disk of \w+ thoracic vertebra/;
const LOWER_RIB=/\b(?:seventh|eighth|ninth|tenth|eleventh|twelfth) (?:rib|costal cartilage)/;
const LUMBAR=/lumbar vertebra|intervertebral disk of \w+ lumbar vertebra/;
const SEGMENTAL=/\bsegmental (?:artery|vein)\b|\blingular (?:artery|vein)\b|\blobar (?:artery|vein)\b/;

const ALL_CHEST:RegionTag[]=['chest/wall','chest/mediastinum','chest/lung'];
const ALL_ABD:RegionTag[]=['abdomen/wall','abdomen/organs','abdomen/retro'];

const RULES:Rule[]=[
 // ---- chest wall (bones are also drawn, see-through, in the two internal views)
 T(ALL_CHEST,CHEST_BONE),
 T(['chest/wall'],/intercostal|transversus thoracis|levatores? costarum|subcostal muscle|pectoralis|serratus anterior|serratus posterior superior|subclavius|mammary|breast|nipple|areola|lactiferous|internal thoracic|musculophrenic|lateral thoracic|superior thoracic|costocervical|thoracoepigastric|intercostobrachial|thoracic spinal nerve|clavipectoral/),
 T(['chest/wall','abdomen/wall'],/superior epigastric/),
 // ---- diaphragm and other structures that cross cavities
 T([...ALL_CHEST,...ALL_ABD],/^diaphragm$|\bdiaphragm\b/,{sys:['muscular']}),
 // ---- mediastinum and heart
 T(['chest/mediastinum'],/papillary muscle|chordae|pericardi|coronary|cardiac vein|interventricular|coronary sinus|atrioventricular nodal|conus (?:artery|branch)|marginal (?:vein|branch)|posterior vein of ventricle|\bleaflet\b|\bcusp\b|(?:wall|cavity) of (?:atrium|ventricle)/,{y:[1.1,1.45]}),
 T(['chest/mediastinum'],/^(?:ascending aorta|arch of aorta|descending thoracic aorta|descending aorta|set of oesophageal branches of thoracic aorta|brachiocephalic artery|brachiocephalic vein|pulmonary trunk|superior vena cava|azygos vein|hemiazygos vein|accessory hemiazygos vein|esophageal artery|bronchial branch of arch of aorta|bronchial artery|pericardiophrenic|thymus|lobe of thymus|esophagus|trachea|esophageal plexus|thoracic duct|phrenic nerve|anterior vagal trunk|posterior vagal trunk|recurrent laryngeal nerve|greater splanchnic nerve|subclavian artery|subclavian vein|common carotid artery|superior intercostal (?:artery|vein)|supreme intercostal artery)\b/),
 T(['chest/mediastinum','chest/lung'],/\bmain bronchus\b|^trachea$|pulmonary artery|pulmonary vein|bronchial artery|bronchial branch|pulmonary trunk/),
 T(['chest/mediastinum','abdomen/organs','abdomen/retro'],/^inferior vena cava$/),
 T(['abdomen/organs','abdomen/retro'],/^abdominal aorta$/),
 T(['chest/mediastinum','abdomen/organs','abdomen/retro'],/^descending aorta$/),
 // ---- lungs and pleura
 T(['chest/lung'],/lobe of (?:right |left )?lung|\blung\b|bronchial tree|\bfissure of lung|lingula|cardiac notch|cardiac impression|groove for|esophageal impression|hilum of|pleura|pulmonary ligament|pleural/,{y:[1.1,1.5]}),
 T(['chest/lung'],SEGMENTAL,{y:[1.17,1.5]}),
 // ---- back
 T(['back'],/vertebra\b|^atlas$|^axis$|posterior arch of atlas|spinous process of axis|intervertebral disk|ligamentum flavum|denticulate|^sacrum$|^coccyx$|erector|iliocostalis|longissimus|spinalis|semispinalis|multifidus|rotator|interspinal|intertransvers|levatores? costarum|serratus posterior|splenius|trapezius|latissimus|rhomboid|levator scapulae|thoracolumbar|dorsal ramus|posterior cutaneous branch of dorsal ramus|\bc[1-8] spinal nerve|spinal nerve/),
 T(['chest/wall','abdomen/wall','upper'],/latissimus dorsi/),
 // ---- abdominal wall
 T(['abdomen/wall'],/rectus abdominis|external oblique|internal oblique|transversus abdominis|pyramidalis|linea alba|rectus sheath|inguinal ligament|inferior epigastric|superficial epigastric|superficial circumflex iliac|subcostal (?:artery|vein)|ilio-?inguinal|iliohypogastric/),
 T(['abdomen/wall'],LOWER_RIB),
 // ---- abdominal organs
 T(['abdomen/organs'],/liver|hepatic|hepatovenous|portal vein|biliary|gallbladder|cystic duct|stomach|spleen|splenic|pancrea|duoden|jejun|ileum|ileal|ileocolic|ileocecal|appendi|cecum|cecal|colon|colic|taenia|mesentery|mesocolon|mesoappendix|omentum|celiac|(?:superior|inferior) mesenteric|\bgastric|gastro-?epiploic|sigmoid|jejunal|marginal artery/,{y:[0.9,1.31],sys:['digestive','arterial','venous','nervous','lymphatic','connective','serous']}),
 T(['abdomen/organs'],LOWER_RIB),
 // ---- posterior abdominal wall
 T(['abdomen/retro'],/kidney|ureter|adrenal|suprarenal|renal|lumbar (?:artery|vein)|ascending lumbar|inferior phrenic|superior phrenic|testicular|ovarian (?:artery|vein)|psoas|iliacus|quadratus lumborum|splanchnic|celiac ganglion|aorticorenal|mesenteric ganglion|renal ganglion|common iliac|iliolumbar|median sacral|thoracic duct|aortic hiatus|ganglia of sympathetic|sympathetic trunk|gonadal/),
 T(['abdomen/retro'],SEGMENTAL,{y:[0.9,1.17]}),
 T(['abdomen/retro'],LUMBAR),
 T(['abdomen/retro'],LOWER_RIB),
 // ---- pelvis
 T(['pelvis/wall','pelvis/organs','gluteal'],/^hip bone$|\bhip bone\b|^sacrum$|^coccyx$/),
 T(['pelvis/wall','gluteal'],/iliac crest|ischial tuberosity|spine of ischium|pubic tubercle|^sacrum$|^coccyx$|sacrotuberous|sacrospinous|sacroiliac|pubic symphysis/),
 T(['pelvis/wall'],/levator ani|coccygeus|iliococcygeus|pubococcygeus|puborectalis|tendinous arch|obturator|piriformis|internal iliac|external iliac|iliolumbar|lateral sacral|median sacral|superior gluteal|inferior gluteal|sacral plexus|nerve to (?:piriformis|obturator)|lumbosacral/),
 T(['pelvis/organs'],/urinary bladder|trigone|ureter|urethra|prostate|seminal vesicle|deferent duct|ductus deferens|uter(?:us|ine)|ovar(?:y|ian)|vagina|cervico|cervix|mesosalpinx|mesovarium|broad ligament|round ligament|uterosacral|cardinal ligament|suspensory ligament of ovary|pouch|pelvic peritoneum|rectum|(?:superior|middle|inferior) rectal|sigmoid|vesical|hypogastric|ampulla of uterine|isthmus of uterine|fimbriae|infundibulum of uterine/,{y:[0.7,1.05]}),
 T(['pelvis/perineum'],/penis|corpus (?:cavernosum|spongiosum)|glans|testis|epididymis|scrotum|clitoris|labium|bulb of vestibule|vestibule|vestibular gland|perineal|\banal (?:sphincter|canal)|external anal|\banus\b|bulbospongiosus|ischiocavernosus|sphincter urethrae|pudendal|dorsal (?:artery|vein|nerve) of (?:penis|clitoris)|pubic hair|mons pubis|urethra|ischial tuberosity|inferior rectal|vagina/),
 // ---- gluteal region
 T(['gluteal'],/glute|piriformis|gemell|quadratus femoris|obturator|tensor fasciae latae|sciatic|posterior femoral cutaneous|hip joint|iliofemoral|ischiofemoral|pubofemoral|ligament of head of femur|nerve to (?:piriformis|quadratus femoris|obturator)|internal pudendal|pudendal nerve|^femur$|\bfemur\b/),
];

export interface RegionIndex{tags:Map<string,Set<RegionTag>>;level:number;skin:string[];byId:Map<string,Part>}

export function buildRegionIndex(parts:Part[]):RegionIndex{
 const level=clavicleLevel(parts),tags=new Map<string,Set<RegionTag>>(),skin:string[]=[],byId=new Map<string,Part>();
 for(const p of parts){
  byId.set(p.id,p);
  if(isMotionQuarantined(p))continue;
  const set=new Set<RegionTag>(),n=p.name.toLowerCase(),[,y]=partCenter(p);
  if(p.system==='integumentary'&&p.name==='Skin'){skin.push(p.id);continue;}
  const r=anatomicalRegion(p);
  if(r==='head-neck'||y>=level)set.add('head');
  if(r==='upper-limb')set.add('upper');
  if(r==='lower-limb')set.add('lower');
  // internal organs inside the chest are not the head or neck just because their centre lies above the collarbone line
  if(set.has('head')&&r!=='head-neck'&&(p.system==='cardiac'||p.system==='respiratory'&&/lung|bronch|pleura|lobe|fissure|hilum/.test(n)||p.system==='serous'))set.delete('head');
  for(const rule of RULES){
   if(rule.sys&&!rule.sys.includes(p.system))continue;
   if(rule.y&&(y<rule.y[0]||y>rule.y[1]))continue;
   if(rule.re.test(n))for(const t of rule.tags)set.add(t);
  }
  // heart: every cardiac-system mesh in the chest (the cardiac system also holds the brain ventricles, which lie far higher)
  if(p.system==='cardiac'&&y<1.45)set.add('chest/mediastinum');
  // lung and bronchial airways: respiratory-system meshes in the chest
  if(p.system==='respiratory'&&y>1.15&&y<1.45&&!/nasal|pharyn|epiglott|concha/.test(n))set.add('chest/lung');
  // abdominal organs by system when no name rule matched
  if(p.system==='digestive'&&y>=0.9&&y<1.31&&!/rectum|esophag|anal/.test(n))set.add('abdomen/organs');
  if(set.size)tags.set(p.id,set);
 }
 return{tags,level,skin,byId};
}

/** left / right of a structure: from its name, or from the side of the midline its whole mesh lies on */
export function regionSide(p:Part):'left'|'right'|'midline'{
 const named=anatomicalSide(p);if(named!=='midline')return named;
 if(p.bounds[0][0]>0.008)return 'left';
 if(p.bounds[1][0]<-0.008)return 'right';
 return 'midline';
}

const tagOf=(key:RegionKey,sub?:string):RegionTag|null=>key==='whole'?null:(sub?`${key}/${sub}` as RegionTag:key as RegionTag);

/** Bones drawn see-through in the internal views (chest, abdominal and pelvic organs) so the viscera stay readable. */
const FADE_BONE=/\brib\b|costal cartilage|sternum|manubrium|xiphoid|vertebra\b|intervertebral disk|hip bone|^sacrum$|^coccyx$|clavicle/;

export interface RegionSet{focus:string[];/** drawn see-through (bones around a cavity, and the other side when 淡化另一側 is on) */faded:string[];/** structures of the region on the other side */other:string[];/** ids that give the camera its frame */camera:string[]}

export function regionMembers(index:RegionIndex,parts:Part[],key:RegionKey,sub:string|undefined,side:'both'|Side):RegionSet{
 const empty:RegionSet={focus:[],faded:[],other:[],camera:[]};
 if(key==='whole')return empty;
 const internal=(key==='chest'&&sub!=='wall')||(key==='abdomen'&&sub!=='wall')||(key==='pelvis'&&sub==='organs');
 let ids:string[];
 if(key==='head')ids=topRegionParts(parts,'head')??[];
 else{const tag=tagOf(key,sub);ids=parts.filter(p=>!!tag&&index.tags.get(p.id)?.has(tag)).map(p=>p.id);}
 const wantSkin=!internal&&(key==='head'||key==='back'||key==='gluteal'||(key==='chest'&&sub==='wall')||(key==='abdomen'&&sub==='wall')||(key==='pelvis'&&sub!=='organs'));
 const keep:string[]=[],other:string[]=[],opposite:Side=side==='left'?'right':'left';
 for(const id of ids){
  const p=index.byId.get(id);if(!p)continue;
  if(side==='both'){keep.push(id);continue;}
  const s=regionSide(p);
  if(s===opposite)other.push(id);else keep.push(id);
 }
 const skin=wantSkin?index.skin:[];
 const faded=internal?keep.filter(id=>{const p=index.byId.get(id);return !!p&&(p.system==='skeletal'||p.system==='connective')&&FADE_BONE.test(p.name.toLowerCase());}):[];
 // camera frames the organs, not the whole region (the faded bone cage would pull it back and the skin would frame the whole body)
 const solid=keep.filter(id=>!faded.includes(id));
 // long structures (aorta, vena cava, ureters, the femur) would stretch the frame far beyond the region
 const compact=(key==='abdomen'||key==='pelvis'||key==='gluteal')?solid.filter(id=>{const p=index.byId.get(id);return !!p&&p.bounds[1][1]-p.bounds[0][1]<.3&&!/^femur$|ureter/i.test(p.name);}):solid;
 return{focus:[...keep,...skin],faded,other,camera:internal&&compact.length?compact:key==='gluteal'&&compact.length?compact:keep};
}

/** Systems switched on when a region opens (the left panel still toggles them; only this region's structures can appear). */
export function regionVisible(key:RegionKey,sub?:string):SystemId[]{
 const base:SystemId[]=['skeletal','muscular','arterial','venous','nervous','connective'];
 if(key==='chest'&&sub==='mediastinum')return[...base,'cardiac','respiratory','serous','lymphatic','digestive'];
 if(key==='chest'&&sub==='lung')return['skeletal','respiratory','serous'];
 if(key==='chest')return[...base,'reproductive'];
 if(key==='abdomen'&&sub==='organs')return[...base,'digestive','lymphatic'];
 if(key==='abdomen'&&sub==='retro')return[...base,'urinary','endocrine','lymphatic','digestive'];
 if(key==='pelvis'&&sub==='organs')return[...base,'urinary','reproductive','digestive','serous'];
 if(key==='pelvis'&&sub==='perineum')return[...base,'reproductive','urinary','digestive'];
 if(key==='pelvis')return[...base,'urinary','reproductive'];
 return base;
}

/** Camera direction (world, from the region towards the camera): the back is seen from behind, everything else from the front. */
export function regionDirection(key:RegionKey,sub?:string):[number,number,number]{
 if(key==='back'||key==='gluteal')return[0,.08,-1];
 if(key==='pelvis'&&sub==='wall')return[.15,.12,1];
 return[0,.06,1];
}
/** how tight the camera frames the region (smaller = closer) */
export function regionZoom(key:RegionKey,sub?:string):number{
 if(key==='chest')return sub==='lung'?.7:.66;
 if(key==='abdomen'||key==='pelvis')return .68;
 if(key==='back')return .9;
 if(key==='gluteal')return 1;
 return .82;
}

// ---- external nerves (separate meshes, not atlas parts): which ones a region shows
const NERVE_RULES:{key:RegionKey;sub?:string;re:RegExp}[]=[
 {key:'back',re:/spinal|dorsal ramus|dorsal scapular|greater occipital|lesser occipital|third occipital|suboccipital|accessory nerve|thoracodorsal|roots? of|sympathetic|spinal ganglion/},
 {key:'chest',sub:'wall',re:/intercostal|long thoracic|medial pectoral|lateral pectoral|thoracodorsal|intercostobrachial|subclavian nerve/},
 {key:'chest',sub:'mediastinum',re:/vagus|phrenic|recurrent laryngeal|sympathetic|splanchnic|cardiac|esophageal/},
 {key:'chest',sub:'lung',re:/vagus|sympathetic|pulmonary/},
 {key:'abdomen',sub:'wall',re:/iliohypogastric|ilio-inguinal|intercostal|subcostal|genitofemoral|lateral femoral cutaneous/},
 {key:'abdomen',sub:'organs',re:/vagus|splanchnic|celiac/},
 {key:'abdomen',sub:'retro',re:/iliohypogastric|ilio-inguinal|genitofemoral|lateral femoral cutaneous|femoral nerve|obturator nerve|splanchnic|subcostal/},
 {key:'pelvis',sub:'wall',re:/obturator nerve|sciatic|nerve to (?:piriformis|obturator|quadratus)|superior gluteal|inferior gluteal|posterior femoral cutaneous|pudendal|sacral/},
 {key:'pelvis',sub:'organs',re:/(?<!ilio)hypogastric|pelvic splanchnic/},
 {key:'pelvis',sub:'perineum',re:/pudendal|perineal|dorsal nerve of (?:penis|clitoris)/},
 {key:'gluteal',re:/sciatic|gluteal|nerve to (?:piriformis|quadratus femoris|obturator)|posterior femoral cutaneous|pudendal|obturator internus/},
];
export function regionNerveFilter(key:RegionKey,sub?:string):(name:string)=>boolean{
 const rules=NERVE_RULES.filter(r=>r.key===key&&(!r.sub||r.sub===sub));
 return name=>{const n=name.toLowerCase();return rules.some(r=>r.re.test(n));};
}

/** Which Quiz setup page matches a region (the quiz catalogue has upper limb, lower limb, thorax, back, heart and lung). */
export function quizHrefFor(key:RegionKey,sub?:string):string{
 if(key==='upper')return '#/quiz/upper-limb';
 if(key==='lower'||key==='gluteal')return '#/quiz/lower-limb';
 if(key==='chest')return sub==='mediastinum'?'#/quiz/heart':sub==='lung'?'#/quiz/lung':'#/quiz/thorax';
 if(key==='back')return '#/quiz/back';
 return '#/quiz';
}
