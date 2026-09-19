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
 {id:'shoulder',name:'Shoulder',subtitle:'肩區 · Shoulder',stages:[
  {id:'surface',label:'表層 · Surface',description:'Body surface and superficial context.',keywords:['skin','integument']},
  {id:'superficial',label:'淺層肌 · Superficial muscles',description:'Deltoid, trapezius, pectoralis major and other superficial context.',keywords:['deltoid','trapezius','pectoralis major','latissimus dorsi']},
  {id:'cuff',label:'旋轉肌袖 · Rotator cuff',description:'Supraspinatus, infraspinatus, teres minor and subscapularis with adjacent deep muscles.',keywords:['supraspinatus','infraspinatus','teres minor','subscapularis','teres major']},
  {id:'neurovascular',label:'神經血管 · Neurovascular',description:'Major nerves and vessels of the shoulder and axilla.',keywords:['axillary nerve','suprascapular nerve','circumflex humeral','axillary artery','axillary vein']},
  {id:'joint',label:'關節韌帶 · Joint & ligaments',description:'Capsule, ligaments, labrum, cartilage and bursae where represented.',keywords:['capsule','ligament','labrum','cartilage','bursa']},
  {id:'bone',label:'骨 · Bones',description:'Clavicle, scapula and proximal humerus.',keywords:['clavicle','scapula','humerus']},
 ]},
 {id:'arm',name:'Arm',subtitle:'上臂 · Arm',stages:[
  {id:'superficial',label:'表層 · Superficial',description:'Surface and superficial muscular anatomy.',keywords:['skin','fascia','biceps brachii']},
  {id:'anterior',label:'前群 · Anterior compartment',description:'Flexor compartment of the arm.',keywords:['biceps brachii','brachialis','coracobrachialis']},
  {id:'posterior',label:'後群 · Posterior compartment',description:'Extensor compartment of the arm.',keywords:['triceps brachii']},
  {id:'neurovascular',label:'神經血管 · Neurovascular',description:'Major nerves and vessels of the arm.',keywords:['musculocutaneous nerve','radial nerve','median nerve','ulnar nerve','brachial artery','brachial vein']},
  {id:'bone',label:'骨 · Bone',description:'Humerus and related landmarks.',keywords:['humerus']},
 ]},
 {id:'forearm',name:'Forearm',subtitle:'前臂 · Forearm',stages:[
  {id:'surface',label:'表層 · Surface',description:'Surface and fascial context.',keywords:['skin','antebrachial fascia']},
  {id:'flexor-superficial',label:'淺層屈肌 · Superficial flexors',description:'Superficial anterior forearm muscles.',keywords:['pronator teres','flexor carpi radialis','palmaris longus','flexor carpi ulnaris','flexor digitorum superficialis']},
  {id:'flexor-deep',label:'深層屈肌 · Deep flexors',description:'Deep anterior forearm muscles.',keywords:['flexor digitorum profundus','flexor pollicis longus','pronator quadratus']},
  {id:'extensor',label:'伸肌群 · Extensors',description:'Posterior forearm muscle groups.',keywords:['brachioradialis','extensor carpi','extensor digitorum','supinator']},
  {id:'neurovascular',label:'神經血管 · Neurovascular',description:'Median, ulnar and radial pathways with forearm vessels.',keywords:['median nerve','ulnar nerve','radial nerve','radial artery','ulnar artery']},
  {id:'bone',label:'橈尺骨 · Radius & ulna',description:'Bony framework for elbow and radioulnar motion.',keywords:['radius','ulna']},
 ]},
 {id:'hand',name:'Hand',subtitle:'手部 · Hand',stages:[
  {id:'surface',label:'表層 · Surface',description:'Surface anatomy of the hand.',keywords:['skin','palmar aponeurosis']},
  {id:'tendon',label:'肌腱與支持帶 · Tendons & retinacula',description:'Tendon and retinacular relationships at the wrist and hand.',keywords:['retinaculum','tendon','sheath']},
  {id:'intrinsic',label:'手內在肌 · Intrinsic muscles',description:'Thenar, hypothenar, lumbrical and interosseous groups.',keywords:['thenar','hypothenar','lumbrical','interosse']},
  {id:'neurovascular',label:'神經血管 · Neurovascular',description:'Distal median, ulnar and radial branches and vessels.',keywords:['median nerve','ulnar nerve','radial nerve','palmar arch','digital artery']},
  {id:'bone',label:'骨與關節 · Bones & joints',description:'Carpal, metacarpal and phalangeal framework.',keywords:['carpal','metacarp','phalan']},
 ]},
];

export const regionById=(id:RegionId)=>ANATOMY_REGIONS.find(r=>r.id===id)??ANATOMY_REGIONS[0];
