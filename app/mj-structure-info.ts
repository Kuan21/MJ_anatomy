import type {SystemId} from './anatomy';

export interface BilingualFact {
 labelEn:string;
 labelZh:string;
 valueEn:string;
 valueZh?:string;
}
export interface StructureProfile {
 english:string;
 chinese?:string;
 category:string;
 summaryEn?:string;
 summaryZh?:string;
 facts:BilingualFact[];
 source:string;
}

const detailed:Record<string,Omit<StructureProfile,'english'>>={
 'subclavius':{chinese:'鎖骨下肌',category:'Muscle｜肌肉',summaryEn:'Muscle connecting the first rib/costal cartilage to the clavicle.',summaryZh:'連接第一肋骨／肋軟骨與鎖骨的肌肉。',facts:[
  {labelEn:'Origin',labelZh:'起點',valueEn:'1st rib and costal cartilage',valueZh:'第一肋骨與肋軟骨'},
  {labelEn:'Insertion',labelZh:'止點',valueEn:'Inferior surface of middle third of clavicle',valueZh:'鎖骨中三分之一的下表面'},
  {labelEn:'Nerve',labelZh:'神經支配',valueEn:'Nerve to subclavius (C5–C6)',valueZh:'鎖骨下肌神經（C5–C6）'},
  {labelEn:'Action',labelZh:'作用',valueEn:'Anchors and depresses clavicle',valueZh:'固定並下壓鎖骨'}
 ],source:'CMU Upper Limbs lecture'},
 'pectoralis minor':{chinese:'胸小肌',category:'Muscle｜肌肉',facts:[
  {labelEn:'Origin',labelZh:'起點',valueEn:'3rd–5th ribs',valueZh:'第3–5肋骨'},
  {labelEn:'Insertion',labelZh:'止點',valueEn:'Coracoid process of scapula',valueZh:'肩胛骨喙突'},
  {labelEn:'Nerve',labelZh:'神經支配',valueEn:'Medial pectoral nerve (C8, T1)',valueZh:'內側胸神經（C8、T1）'},
  {labelEn:'Action',labelZh:'作用',valueEn:'Stabilizes scapula by drawing it inferiorly and anteriorly against thoracic wall',valueZh:'將肩胛骨向下、向前拉向胸壁以穩定肩胛骨'}
 ],source:'CMU Upper Limbs lecture'},
 'serratus anterior':{chinese:'前鋸肌',category:'Muscle｜肌肉',facts:[
  {labelEn:'Origin',labelZh:'起點',valueEn:'1st–8th ribs (lecture also notes 2nd–9th variant)',valueZh:'第1–8肋骨（課堂亦註記第2–9肋骨的描述）'},
  {labelEn:'Insertion',labelZh:'止點',valueEn:'Anterior surface of medial border of scapula',valueZh:'肩胛骨內側緣前面'},
  {labelEn:'Nerve',labelZh:'神經支配',valueEn:'Long thoracic nerve (C5–C7)',valueZh:'胸長神經（C5–C7）'},
  {labelEn:'Action',labelZh:'作用',valueEn:'Keeps scapula against thoracic wall on pushing',valueZh:'推動時使肩胛骨貼住胸壁'}
 ],source:'CMU Upper Limbs lecture'},
 'trapezius':{chinese:'斜方肌',category:'Muscle｜肌肉',facts:[
  {labelEn:'Origin',labelZh:'起點',valueEn:'External occipital protuberance; spinous processes C7–T12',valueZh:'枕外隆凸；C7–T12棘突'},
  {labelEn:'Insertion',labelZh:'止點',valueEn:'Spine and acromion of scapula; lateral third of clavicle',valueZh:'肩胛棘、肩峰；鎖骨外側三分之一'},
  {labelEn:'Nerve',labelZh:'神經支配',valueEn:'CN XI (accessory nerve); sensory C3–C4 ventral rami',valueZh:'第XI腦神經（副神經）；感覺由C3–C4前支'},
  {labelEn:'Action',labelZh:'作用',valueEn:'Elevation, depression and rotation of scapula',valueZh:'肩胛骨上提、下壓與旋轉'}
 ],source:'CMU Upper Limbs lecture'},
 'levator scapulae':{chinese:'提肩胛肌',category:'Muscle｜肌肉',facts:[
  {labelEn:'Origin',labelZh:'起點',valueEn:'Posterior tubercles of transverse processes C1–C4',valueZh:'C1–C4橫突後結節'},
  {labelEn:'Insertion',labelZh:'止點',valueEn:'Medial border of scapula superior to root of scapular spine',valueZh:'肩胛棘根部以上的肩胛骨內側緣'},
  {labelEn:'Nerve',labelZh:'神經支配',valueEn:'Dorsal scapular nerve (C3–C5 in lecture)',valueZh:'肩胛背神經（課堂標示C3–C5）'},
  {labelEn:'Action',labelZh:'作用',valueEn:'Elevates scapula',valueZh:'上提肩胛骨'}
 ],source:'CMU Upper Limbs lecture'},
 'rhomboid minor':{chinese:'小菱形肌',category:'Muscle｜肌肉',facts:[
  {labelEn:'Origin',labelZh:'起點',valueEn:'Nuchal ligament; spinous processes C7, T1',valueZh:'項韌帶；C7、T1棘突'},
  {labelEn:'Insertion',labelZh:'止點',valueEn:'Medial border of scapula',valueZh:'肩胛骨內側緣'},
  {labelEn:'Nerve',labelZh:'神經支配',valueEn:'Dorsal scapular nerve (C5)',valueZh:'肩胛背神經（C5）'},
  {labelEn:'Action',labelZh:'作用',valueEn:'Raises shoulder girdle and draws scapula medially',valueZh:'抬高肩帶並將肩胛骨拉向內側'}
 ],source:'CMU Upper Limbs lecture'},
 'rhomboid major':{chinese:'大菱形肌',category:'Muscle｜肌肉',facts:[
  {labelEn:'Origin',labelZh:'起點',valueEn:'Spinous processes T2–T5',valueZh:'T2–T5棘突'},
  {labelEn:'Insertion',labelZh:'止點',valueEn:'Medial border of scapula',valueZh:'肩胛骨內側緣'},
  {labelEn:'Nerve',labelZh:'神經支配',valueEn:'Dorsal scapular nerve (C5)',valueZh:'肩胛背神經（C5）'},
  {labelEn:'Action',labelZh:'作用',valueEn:'Raises shoulder girdle and draws scapula medially',valueZh:'抬高肩帶並將肩胛骨拉向內側'}
 ],source:'CMU Upper Limbs lecture'},
 'deltoid':{chinese:'三角肌',category:'Muscle｜肌肉',facts:[
  {labelEn:'Origin',labelZh:'起點',valueEn:'Anterior: lateral third of clavicle; middle: acromion; posterior: spine of scapula',valueZh:'前部：鎖骨外側三分之一；中部：肩峰；後部：肩胛棘'},
  {labelEn:'Insertion',labelZh:'止點',valueEn:'Deltoid tuberosity of humerus',valueZh:'肱骨三角肌粗隆'},
  {labelEn:'Nerve',labelZh:'神經支配',valueEn:'Axillary nerve',valueZh:'腋神經'},
  {labelEn:'Action',labelZh:'作用',valueEn:'Anterior flexes arm; middle abducts arm; posterior extends arm',valueZh:'前部屈臂；中部外展臂；後部伸臂'}
 ],source:'CMU Upper Limbs lecture'},
 'supraspinatus':{chinese:'棘上肌',category:'Muscle｜肌肉',facts:[
  {labelEn:'Origin',labelZh:'起點',valueEn:'Supraspinous fossa of scapula',valueZh:'肩胛骨棘上窩'},
  {labelEn:'Insertion',labelZh:'止點',valueEn:'Superior part of greater tubercle of humerus',valueZh:'肱骨大結節上部'},
  {labelEn:'Nerve',labelZh:'神經支配',valueEn:'Suprascapular nerve (C5–C6)',valueZh:'肩胛上神經（C5–C6）'},
  {labelEn:'Action',labelZh:'作用',valueEn:'Abduction of arm',valueZh:'手臂外展'}
 ],source:'CMU Upper Limbs lecture'},
 'infraspinatus':{chinese:'棘下肌',category:'Muscle｜肌肉',facts:[
  {labelEn:'Origin',labelZh:'起點',valueEn:'Infraspinous fossa of scapula',valueZh:'肩胛骨棘下窩'},
  {labelEn:'Insertion',labelZh:'止點',valueEn:'Middle part of greater tubercle of humerus',valueZh:'肱骨大結節中部'},
  {labelEn:'Nerve',labelZh:'神經支配',valueEn:'Suprascapular nerve (C5–C6)',valueZh:'肩胛上神經（C5–C6）'},
  {labelEn:'Action',labelZh:'作用',valueEn:'Adduction and lateral rotation of arm',valueZh:'手臂內收與外旋'}
 ],source:'CMU Upper Limbs lecture'},
 'subscapularis':{chinese:'肩胛下肌',category:'Muscle｜肌肉',facts:[
  {labelEn:'Origin',labelZh:'起點',valueEn:'Subscapular fossa',valueZh:'肩胛下窩'},
  {labelEn:'Insertion',labelZh:'止點',valueEn:'Lesser tubercle of humerus',valueZh:'肱骨小結節'},
  {labelEn:'Nerve',labelZh:'神經支配',valueEn:'Upper & lower subscapular nerves (C5–C7)',valueZh:'上、下肩胛下神經（C5–C7）'},
  {labelEn:'Action',labelZh:'作用',valueEn:'Medial rotation of arm',valueZh:'手臂內旋'}
 ],source:'CMU Upper Limbs lecture'},
 'pronator teres':{chinese:'旋前圓肌',category:'Muscle｜肌肉',facts:[
  {labelEn:'Origin',labelZh:'起點',valueEn:'Humeral head and ulnar head',valueZh:'肱骨頭與尺骨頭'},
  {labelEn:'Insertion',labelZh:'止點',valueEn:'Middle of lateral surface of radius',valueZh:'橈骨外側面中部'},
  {labelEn:'Nerve',labelZh:'神經支配',valueEn:'Median nerve',valueZh:'正中神經'},
  {labelEn:'Action',labelZh:'作用',valueEn:'Pronation; weak flexion of forearm',valueZh:'前臂旋前；弱屈曲前臂'}
 ],source:'CMU Upper Limbs lecture'}
};

const aliases:[string,string][]=[
 ['posterior circumflex humeral artery','肱骨後旋動脈'],['anterior circumflex humeral artery','肱骨前旋動脈'],
 ['musculocutaneous nerve','肌皮神經'],['suprascapular nerve','肩胛上神經'],['dorsal scapular nerve','肩胛背神經'],['long thoracic nerve','胸長神經'],['thoracodorsal nerve','胸背神經'],['axillary nerve','腋神經'],['median nerve','正中神經'],['ulnar nerve','尺神經'],['radial nerve','橈神經'],
 ['profunda brachii artery','肱深動脈'],['thoracoacromial artery','胸肩峰動脈'],['lateral thoracic artery','外側胸動脈'],['subscapular artery','肩胛下動脈'],['circumflex scapular artery','旋肩胛動脈'],['thoracodorsal artery','胸背動脈'],['suprascapular artery','肩胛上動脈'],['dorsal scapular artery','肩胛背動脈'],['axillary artery','腋動脈'],['brachial artery','肱動脈'],['radial artery','橈動脈'],['ulnar artery','尺動脈'],['cephalic vein','頭靜脈'],['basilic vein','貴要靜脈'],['axillary vein','腋靜脈'],
 ['coracoclavicular ligament','喙鎖韌帶'],['acromioclavicular ligament','肩鎖韌帶'],['coracoacromial ligament','喙肩韌帶'],['coracohumeral ligament','喙肱韌帶'],['transverse humeral ligament','肱橫韌帶'],['glenohumeral ligament','盂肱韌帶'],['superior transverse scapular ligament','肩胛上橫韌帶'],['sternoclavicular ligament','胸鎖韌帶'],['costoclavicular ligament','肋鎖韌帶'],['interclavicular ligament','鎖骨間韌帶'],['annular ligament','橈骨環狀韌帶'],['ulnar collateral ligament','尺側副韌帶'],['radial collateral ligament','橈側副韌帶'],
 ['flexor digitorum superficialis','指淺屈肌'],['flexor digitorum profundus','指深屈肌'],['flexor carpi radialis','橈側腕屈肌'],['flexor carpi ulnaris','尺側腕屈肌'],['palmaris longus','掌長肌'],['pronator quadratus','旋前方肌'],['brachioradialis','肱橈肌'],['supinator','旋後肌'],['extensor carpi radialis longus','橈側腕長伸肌'],['extensor carpi radialis brevis','橈側腕短伸肌'],['extensor digitorum','指伸肌'],['extensor digiti minimi','小指伸肌'],['extensor carpi ulnaris','尺側腕伸肌'],['abductor pollicis longus','拇長外展肌'],['extensor pollicis brevis','拇短伸肌'],['extensor pollicis longus','拇長伸肌'],['extensor indicis','食指伸肌'],['biceps brachii','肱二頭肌'],['triceps brachii','肱三頭肌'],['brachialis','肱肌'],['coracobrachialis','喙肱肌'],['teres minor','小圓肌'],['teres major','大圓肌'],
 ['glenoid cavity','關節盂'],['coracoid process','喙突'],['acromion','肩峰'],['spine of scapula','肩胛棘'],['supraspinous fossa','棘上窩'],['infraspinous fossa','棘下窩'],['subscapular fossa','肩胛下窩'],['suprascapular notch','肩胛上切跡'],['greater tubercle','大結節'],['lesser tubercle','小結節'],['intertubercular groove','結節間溝'],['deltoid tuberosity','三角肌粗隆'],['radial groove','橈神經溝'],['olecranon fossa','鷹嘴窩'],
 ['metacarpal','掌骨'],['phalanges','指骨'],['phalanx','指骨'],['carpal','腕骨'],['clavicle','鎖骨'],['scapula','肩胛骨'],['humerus','肱骨'],['radius','橈骨'],['ulna','尺骨'],
 ['subclavius','鎖骨下肌'],['pectoralis minor','胸小肌'],['serratus anterior','前鋸肌'],['trapezius','斜方肌'],['levator scapulae','提肩胛肌'],['rhomboid minor','小菱形肌'],['rhomboid major','大菱形肌'],['deltoid','三角肌'],['supraspinatus','棘上肌'],['infraspinatus','棘下肌'],['subscapularis','肩胛下肌'],['pronator teres','旋前圓肌']
];

const systemZh:Record<SystemId,string>={
 skeletal:'骨骼',muscular:'肌肉',arterial:'動脈',venous:'靜脈',nervous:'神經',digestive:'消化系統',respiratory:'呼吸系統',urinary:'泌尿系統',reproductive:'生殖系統',lymphatic:'淋巴系統',endocrine:'內分泌系統',integumentary:'體表／皮膚',connective:'結締組織',sensory:'感覺器官',cardiac:'心臟'
};

const norm=(s:string)=>s.toLowerCase().replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim();
const stripSide=(s:string)=>s.replace(/\b(left|right)\b/gi,'').replace(/\s+/g,' ').trim();

function findChinese(name:string){
 const n=norm(name);
 const hit=aliases.find(([key])=>n.includes(key));
 if(!hit)return undefined;
 const side=/\bleft\b/i.test(name)?'左':/\bright\b/i.test(name)?'右':'';
 return side+hit[1];
}

function detailKey(name:string){
 const n=norm(stripSide(name));
 return Object.keys(detailed).find(k=>n.includes(k));
}

export function structureProfile(name:string,system:SystemId):StructureProfile{
 const key=detailKey(name);
 if(key){
  const d=detailed[key];
  return {english:name,chinese:findChinese(name)??d.chinese,category:d.category,summaryEn:d.summaryEn,summaryZh:d.summaryZh,facts:d.facts,source:d.source};
 }
 const chinese=findChinese(name);
 const generic:StructureProfile={english:name,chinese,category:`${system}｜${systemZh[system]}`,facts:[],source:'Bilingual label mapped from the CMU upper-limb study set'};
 const n=norm(name);
 if(n.includes('axillary nerve'))generic.facts.push({labelEn:'Course relation',labelZh:'課堂關係',valueEn:'Shown with the posterior circumflex humeral artery around the shoulder region.',valueZh:'課堂中與肱骨後旋動脈一同顯示於肩部相關區域。'});
 if(n.includes('radial nerve'))generic.facts.push({labelEn:'Course relation',labelZh:'課堂關係',valueEn:'Shown with profunda brachii artery in the triangular interval / posterior arm pathway.',valueZh:'課堂中與肱深動脈一同出現於三角間隙／上臂後方路徑。'});
 if(n.includes('suprascapular nerve'))generic.facts.push({labelEn:'Course relation',labelZh:'課堂關係',valueEn:'Related to the suprascapular notch and suprascapular artery.',valueZh:'與肩胛上切跡及肩胛上動脈相關。'});
 if(n.includes('brachial artery'))generic.facts.push({labelEn:'Course relation',labelZh:'課堂關係',valueEn:'Major artery of the arm; shown with branches including profunda brachii and around the cubital region.',valueZh:'上臂主要動脈；課堂顯示其與肱深動脈等分支及肘窩區域的關係。'});
 return generic;
}
