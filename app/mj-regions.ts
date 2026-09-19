export type RegionId='whole-body'|'shoulder'|'arm'|'forearm'|'hand';

export interface DissectionStage {
  id:string;
  label:string;
  description:string;
  systems?:string[];
  keywords:string[];
}

export interface AnatomyRegion {
  id:RegionId;
  name:string;
  subtitle:string;
  stages:DissectionStage[];
}

/**
 * MJ Anatomy regional-dissection curriculum.
 * This metadata is deliberately separate from the renderer/kinematic hierarchy:
 * dissection answers "what should I study/see next"; motion will answer
 * "what transforms around which anatomical joint axis".
 */
export const ANATOMY_REGIONS:AnatomyRegion[]=[
 {id:'whole-body',name:'Whole body',subtitle:'System exploration',stages:[]},
 {id:'shoulder',name:'Shoulder',subtitle:'Shoulder girdle & glenohumeral region',stages:[
  {id:'surface',label:'Surface',description:'Body surface and superficial context.',keywords:['skin','integument']},
  {id:'superficial',label:'Superficial muscles',description:'Muscles encountered before the intrinsic scapulohumeral layer.',keywords:['deltoid','trapezius','pectoralis major','latissimus dorsi']},
  {id:'cuff',label:'Rotator cuff & deep muscles',description:'Intrinsic shoulder muscles around the glenohumeral joint.',keywords:['supraspinatus','infraspinatus','teres minor','subscapularis','teres major']},
  {id:'neurovascular',label:'Neurovascular',description:'Major nerves and vessels related to the shoulder and axilla.',keywords:['axillary nerve','suprascapular nerve','circumflex humeral','axillary artery','axillary vein']},
  {id:'joint',label:'Joint & connective tissue',description:'Capsule, ligaments and articular structures where represented.',keywords:['capsule','ligament','labrum','cartilage','bursa']},
  {id:'bone',label:'Bones',description:'Clavicle, scapula and proximal humerus.',keywords:['clavicle','scapula','humerus']},
 ]},
 {id:'arm',name:'Arm',subtitle:'Brachium',stages:[
  {id:'superficial',label:'Superficial',description:'Surface and superficial muscular anatomy.',keywords:['skin','fascia','biceps brachii']},
  {id:'anterior',label:'Anterior compartment',description:'Flexor compartment of the arm.',keywords:['biceps brachii','brachialis','coracobrachialis']},
  {id:'posterior',label:'Posterior compartment',description:'Extensor compartment of the arm.',keywords:['triceps brachii']},
  {id:'neurovascular',label:'Neurovascular',description:'Major nerves and vessels of the arm.',keywords:['musculocutaneous nerve','radial nerve','median nerve','ulnar nerve','brachial artery','brachial vein']},
  {id:'bone',label:'Bone',description:'Humerus and related landmarks.',keywords:['humerus']},
 ]},
 {id:'forearm',name:'Forearm',subtitle:'Antebrachium',stages:[
  {id:'surface',label:'Surface',description:'Surface and fascial context.',keywords:['skin','antebrachial fascia']},
  {id:'flexor-superficial',label:'Superficial flexors',description:'Superficial anterior forearm muscles.',keywords:['pronator teres','flexor carpi radialis','palmaris longus','flexor carpi ulnaris','flexor digitorum superficialis']},
  {id:'flexor-deep',label:'Deep flexors',description:'Deep anterior forearm muscles.',keywords:['flexor digitorum profundus','flexor pollicis longus','pronator quadratus']},
  {id:'extensor',label:'Extensors',description:'Posterior forearm muscle groups.',keywords:['brachioradialis','extensor carpi','extensor digitorum','supinator']},
  {id:'neurovascular',label:'Neurovascular',description:'Median, ulnar and radial pathways with forearm vessels.',keywords:['median nerve','ulnar nerve','radial nerve','radial artery','ulnar artery']},
  {id:'bone',label:'Radius & ulna',description:'Bony framework for elbow and radioulnar motion.',keywords:['radius','ulna']},
 ]},
 {id:'hand',name:'Hand',subtitle:'Wrist & hand',stages:[
  {id:'surface',label:'Surface',description:'Surface anatomy of the hand.',keywords:['skin','palmar aponeurosis']},
  {id:'tendon',label:'Tendons & retinacula',description:'Tendon and retinacular relationships at the wrist and hand.',keywords:['retinaculum','tendon','sheath']},
  {id:'intrinsic',label:'Intrinsic muscles',description:'Thenar, hypothenar, lumbrical and interosseous groups.',keywords:['thenar','hypothenar','lumbrical','interosse']},
  {id:'neurovascular',label:'Neurovascular',description:'Distal median, ulnar and radial branches and vessels.',keywords:['median nerve','ulnar nerve','radial nerve','palmar arch','digital artery']},
  {id:'bone',label:'Bones & joints',description:'Carpal, metacarpal and phalangeal framework.',keywords:['carpal','metacarp','phalan']},
 ]},
];

export const regionById=(id:RegionId)=>ANATOMY_REGIONS.find(r=>r.id===id)??ANATOMY_REGIONS[0];
