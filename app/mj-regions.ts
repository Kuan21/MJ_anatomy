export type RegionId='whole-body'|'shoulder'|'arm'|'forearm'|'hand';

export interface DissectionStage {
  id:string;
  label:string;
  description:string;
  keywords:string[];
}

export interface AnatomyRegion {
  id:RegionId;
  name:string;
  subtitle:string;
  stages:DissectionStage[];
}

export const ANATOMY_REGIONS:AnatomyRegion[]=[
 {id:'whole-body',name:'Whole body',subtitle:'System exploration',stages:[]},
 {id:'shoulder',name:'Shoulder',subtitle:'肩帶與肩關節 Shoulder girdle & glenohumeral region',stages:[
  {id:'surface',label:'Surface｜表層',description:'Body surface and superficial context.',keywords:['skin','integument']},
  {id:'superficial',label:'Superficial muscles｜淺層肌',description:'Deltoid, trapezius, pectoralis major and other superficial context.',keywords:['deltoid','trapezius','pectoralis major','latissimus dorsi']},
  {id:'cuff',label:'Rotator cuff｜旋轉肌袖',description:'Supraspinatus, infraspinatus, teres minor and subscapularis with adjacent deep muscles.',keywords:['supraspinatus','infraspinatus','teres minor','subscapularis','teres major']},
  {id:'neurovascular',label:'Neurovascular｜神經血管',description:'Major nerves and vessels of the shoulder and axilla.',keywords:['axillary nerve','suprascapular nerve','circumflex humeral','axillary artery','axillary vein']},
  {id:'joint',label:'Joint & ligaments｜關節韌帶',description:'Capsule, ligaments, labrum, cartilage and bursae where represented.',keywords:['capsule','ligament','labrum','cartilage','bursa']},
  {id:'bone',label:'Bones｜骨',description:'Clavicle, scapula and proximal humerus.',keywords:['clavicle','scapula','humerus']},
 ]},
 {id:'arm',name:'Arm',subtitle:'上臂 Brachium',stages:[
  {id:'superficial',label:'Superficial｜表層',description:'Surface and superficial muscular anatomy.',keywords:['skin','fascia','biceps brachii']},
  {id:'anterior',label:'Anterior compartment｜前群',description:'Flexor compartment of the arm.',keywords:['biceps brachii','brachialis','coracobrachialis']},
  {id:'posterior',label:'Posterior compartment｜後群',description:'Extensor compartment of the arm.',keywords:['triceps brachii']},
  {id:'neurovascular',label:'Neurovascular｜神經血管',description:'Major nerves and vessels of the arm.',keywords:['musculocutaneous nerve','radial nerve','median nerve','ulnar nerve','brachial artery','brachial vein']},
  {id:'bone',label:'Bone｜骨',description:'Humerus and related landmarks.',keywords:['humerus']},
 ]},
 {id:'forearm',name:'Forearm',subtitle:'前臂 Antebrachium',stages:[
  {id:'surface',label:'Surface｜表層',description:'Surface and fascial context.',keywords:['skin','antebrachial fascia']},
  {id:'flexor-superficial',label:'Superficial flexors｜淺層屈肌',description:'Superficial anterior forearm muscles.',keywords:['pronator teres','flexor carpi radialis','palmaris longus','flexor carpi ulnaris','flexor digitorum superficialis']},
  {id:'flexor-deep',label:'Deep flexors｜深層屈肌',description:'Deep anterior forearm muscles.',keywords:['flexor digitorum profundus','flexor pollicis longus','pronator quadratus']},
  {id:'extensor',label:'Extensors｜伸肌群',description:'Posterior forearm muscle groups.',keywords:['brachioradialis','extensor carpi','extensor digitorum','supinator']},
  {id:'neurovascular',label:'Neurovascular｜神經血管',description:'Median, ulnar and radial pathways with forearm vessels.',keywords:['median nerve','ulnar nerve','radial nerve','radial artery','ulnar artery']},
  {id:'bone',label:'Radius & ulna｜橈尺骨',description:'Bony framework for elbow and radioulnar motion.',keywords:['radius','ulna']},
 ]},
 {id:'hand',name:'Hand',subtitle:'腕與手 Wrist & hand',stages:[
  {id:'surface',label:'Surface｜表層',description:'Surface anatomy of the hand.',keywords:['skin','palmar aponeurosis']},
  {id:'tendon',label:'Tendons & retinacula｜肌腱與支持帶',description:'Tendon and retinacular relationships at the wrist and hand.',keywords:['retinaculum','tendon','sheath']},
  {id:'intrinsic',label:'Intrinsic muscles｜手內在肌',description:'Thenar, hypothenar, lumbrical and interosseous groups.',keywords:['thenar','hypothenar','lumbrical','interosse']},
  {id:'neurovascular',label:'Neurovascular｜神經血管',description:'Distal median, ulnar and radial branches and vessels.',keywords:['median nerve','ulnar nerve','radial nerve','palmar arch','digital artery']},
  {id:'bone',label:'Bones & joints｜骨與關節',description:'Carpal, metacarpal and phalangeal framework.',keywords:['carpal','metacarp','phalan']},
 ]},
];

export const regionById=(id:RegionId)=>ANATOMY_REGIONS.find(r=>r.id===id)??ANATOMY_REGIONS[0];
