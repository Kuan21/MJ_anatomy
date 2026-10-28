import type {Part} from './anatomy';

/**
 * Connective tissue is peeled in six layers, from the structures that lie against the bone outwards. The Connective tissue row of the left panel and the
 * dissection panel show layers 1…N (the ＋ and － buttons add or remove the next layer).
 *   1  articular cartilage and fibrocartilage (articular discs, labra, menisci)
 *   2  joint capsules
 *   3  ligaments inside and outside the capsules of the large joints (wrist, hip, knee, ankle, spine, pelvis …) and the interosseous membranes
 *   4  ligaments of the small joints: interphalangeal, metacarpophalangeal / metatarsophalangeal and the metacarpal and metatarsal ligaments
 *   5  retinacula, deep fascial sheaths, and the ligaments of the shoulder girdle and elbow
 *   6  palmar and plantar aponeuroses, fibrous digital sheaths and their pulleys
 * Structures that are not one of these (the spaces, the schematic landmarks) belong to no layer and are never hidden by the layer control.
 */
export interface ConnectiveLayer{order:number;en:string;zh:string}
export const CONNECTIVE_LAYERS:ConnectiveLayer[]=[
 {order:1,en:'Articular cartilage and discs',zh:'關節軟骨與關節盤'},
 {order:2,en:'Joint capsules',zh:'關節囊'},
 {order:3,en:'Ligaments of the large joints and interosseous membranes',zh:'關節內外韌帶與骨間膜'},
 {order:4,en:'Ligaments of the small joints of the hand and foot',zh:'指（趾）骨間、掌（蹠）指（趾）關節韌帶'},
 {order:5,en:'Retinacula, shoulder and elbow ligaments',zh:'支持帶與肩、肘韌帶'},
 {order:6,en:'Palmar and plantar aponeuroses, digital sheaths and pulleys',zh:'掌（蹠）腱膜、指（趾）纖維鞘與滑車'}
];
export const CONNECTIVE_LAYER_COUNT=CONNECTIVE_LAYERS.length;

const FIBROCARTILAGE=/labrum|meniscus|menisci|articular disc|interpubic disc|triradiate/;
const CAPSULE=/capsul/;
const SHEATH=/pulley|fibrous (?:digital |tendon )?sheath|digital sheath|annular part|cruciform part|palmar aponeurosis|plantar aponeurosis/;
const RETINACULUM=/retinaculum|axillary sheath|antebrachial fascia|crural fascia/;
const SHOULDER_ELBOW=/glenohumeral|coracohumeral|transverse humeral|acromioclavicular|coracoclavicular|conoid ligament|trapezoid ligament|coracoacromial|sternoclavicular|interclavicular|costoclavicular|superior transverse scapular|annular ligament of radius|quadrate ligament/;
// the two collateral ligaments called just "radial/ulnar collateral ligament" are the elbow's; the wrist's say "of wrist joint"
const ELBOW_COLLATERAL=/^(?:radial|ulnar) collateral ligament$/;
const SMALL_JOINT=/interphalangeal|metacarpophalangeal|metatarsophalangeal|deep transverse metacarpal|deep transverse metatarsal|(?:dorsal|palmar|plantar|interosseous) metacarpal ligament|(?:dorsal|plantar) metatarsal ligament|metatarsal interosseous|intersesamoid/;

/** Layer 1–6 of a connective structure, or null when the structure is not part of the layered tissue (spaces, landmarks …). Names are lower case, side words allowed. */
export function connectiveLayer(rawName:string):number|null{
 const name=rawName.toLowerCase().replace(/\.[lr](?:\.\d+)?$/,'').replace(/\b(?:left|right) /g,'').replace(/ of (?:left|right) /g,' of ');
 if(SHEATH.test(name))return 6;
 if(FIBROCARTILAGE.test(name))return 1;
 if(CAPSULE.test(name))return 2;
 if(RETINACULUM.test(name))return 5;
 if(SHOULDER_ELBOW.test(name)||ELBOW_COLLATERAL.test(name))return 5;
 if(SMALL_JOINT.test(name))return 4;
 if(/ligament|membrane|frenula|tract|lig\.|ligamenta/.test(name))return 3;
 return null;
}

/** Peeling to layer N shows layers 1…N; structures without a layer are always shown. */
export function matchesConnectiveLayer(part:Pick<Part,'name'|'system'>,upTo:number|undefined){
 if(upTo===undefined||upTo>=CONNECTIVE_LAYER_COUNT)return true;
 if(part.system!=='connective')return true;
 const layer=connectiveLayer(part.name);
 return layer===null||layer<=upTo;
}
