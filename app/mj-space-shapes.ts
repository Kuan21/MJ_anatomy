/**
 * Shapes of the special regions (分層解剖 → 特殊區域): which margin of which boundary structure forms each side of a space.
 * scripts/compute-space-shapes.mjs turns this into vertex references (app/space-shapes.json): every corner and every line of a space is a vertex of
 * the boundary mesh itself, so the drawn outline is carried by the same skinning as the structure (it follows the joint when the limb moves).
 *
 * `items` are the `en` names of the space's boundary items (app/mj-spaces.ts). `margin` says which edge of those meshes is the boundary, in anatomical terms
 * (up/down, medial/lateral towards the midline or away from it, anterior/posterior); `facing` takes the surface that looks into the space. `along` is the
 * model axis the edge runs along (x = left-right, y = up-down, z = front-back), used to sample the edge in order.
 */
export type Margin='up'|'down'|'medial'|'lateral'|'anterior'|'posterior'|'facing';
export interface ShapeEdge{key:string;en:string;zh:string;items:string[];margin:Margin;along:'x'|'y'|'z';/** colour index in SHAPE_COLORS */color:number;/** radius around the space centre that limits the edge (metres) */reach?:number}
export interface SpaceShape{
 /** polygon: the loop of the edges is filled; tube: the edges run side by side along a canal and the walls between them are filled; none: lines only */
 fill:'polygon'|'tube'|'none';edges:ShapeEdge[];
 /** thin lines from the middle of each edge to a point (the apex of the axilla), drawn without a fill */
 apex?:{part:RegExp;from:[number,number,number]};
 /** how the corners are reported */shape:string;
}
/** One colour per edge, shared by the outline, the label of that boundary and the list in the panel. */
export const SHAPE_COLORS=['#e8590c','#7048e8','#0b7285','#c2255c','#5c940d','#1971c2'] as const;

const e=(key:string,en:string,zh:string,items:string[],margin:Margin,along:'x'|'y'|'z',color:number,reach?:number):ShapeEdge=>({key,en,zh,items,margin,along,color,reach});

export const SPACE_SHAPES:Record<string,SpaceShape>={
 quadrangular:{fill:'polygon',shape:'四邊形',edges:[
  e('top','Teres minor (lower border)','小圓肌下緣（上界）',['Teres minor'],'down','x',0),
  e('lateral','Surgical neck of humerus','肱骨外科頸（外界）',['Surgical neck of humerus'],'facing','y',1),
  e('bottom','Teres major (upper border)','大圓肌上緣（下界）',['Teres major'],'up','x',2),
  e('medial','Triceps long head (lateral border)','肱三頭肌長頭外側緣（內界）',['Triceps brachii, long head'],'lateral','y',3)]},
 triangular:{fill:'polygon',shape:'三角形',edges:[
  e('top','Teres minor (lower border)','小圓肌下緣（上界）',['Teres minor'],'down','x',0),
  e('lateral','Triceps long head (medial border)','肱三頭肌長頭內側緣（外界）',['Triceps brachii, long head'],'medial','y',3),
  e('bottom','Teres major (upper border)','大圓肌上緣（下界）',['Teres major'],'up','x',2)]},
 'triangular-interval':{fill:'polygon',shape:'三角形',edges:[
  e('top','Teres major (lower border)','大圓肌下緣（上界）',['Teres major'],'down','x',2),
  e('medial','Triceps long head (lateral border)','肱三頭肌長頭外側緣（內界）',['Triceps brachii, long head'],'lateral','y',3),
  e('lateral','Triceps lateral head / humeral shaft','肱三頭肌外側頭／肱骨幹（外界）',['Triceps brachii, lateral head','Humerus'],'facing','y',1)]},
 clavipectoral:{fill:'polygon',shape:'三角形',edges:[
  e('top','Clavicle','鎖骨（上界）',['Clavicle'],'down','x',0),
  e('lateral','Deltoid (anterior border)','三角肌前緣（外界）',['Deltoid'],'medial','y',1),
  e('medial','Pectoralis major, clavicular part (upper border)','胸大肌鎖骨部上緣（內界）',['Pectoralis major, clavicular part'],'up','x',2)]},
 'axillary-fossa':{fill:'polygon',shape:'四邊形（腋窩底）＋四壁向頂端收窄',edges:[
  e('anterior','Pectoralis major (lower border, anterior axillary fold)','胸大肌下緣（腋前襞）',['Pectoralis major'],'down','x',0,.12),
  e('lateral','Humerus (arm)','上臂（肱骨）',['Humerus'],'facing','y',1,.12),
  e('posterior','Latissimus dorsi and teres major (lower border, posterior axillary fold)','背闊肌與大圓肌下緣（腋後襞）',['Latissimus dorsi','Teres major'],'down','x',2,.12),
  e('medial','Serratus anterior (chest wall)','前鋸肌（胸壁）',['Serratus anterior'],'facing','y',3,.12)],
  apex:{part:/^(?:left |right )?clavicle$/,from:[0,.1,.03]}},
 cubital:{fill:'polygon',shape:'倒三角形（尖端向下）',edges:[
  e('medial','Pronator teres (lateral border)','旋前圓肌外側緣（內界）',['Pronator teres'],'lateral','y',0),
  e('lateral','Brachioradialis (medial border)','肱橈肌內側緣（外界）',['Brachioradialis'],'medial','y',1)]},
 snuffbox:{fill:'polygon',shape:'三角形',edges:[
  e('ulnar','Extensor pollicis longus tendon (radial border)','拇長伸肌腱橈側緣（尺側界）',['Extensor pollicis longus'],'lateral','y',0),
  e('proximal','Radius (styloid process)','橈骨莖突（近側界）',['Radius (styloid process)'],'facing','x',1),
  e('radial','Abductor pollicis longus and extensor pollicis brevis tendons (ulnar border)','拇長展肌腱與拇短伸肌腱尺側緣（橈側界）',['Abductor pollicis longus','Extensor pollicis brevis'],'medial','y',2)]},
 'carpal-tunnel':{fill:'polygon',shape:'四邊形（支持帶與腕骨溝）',edges:[
  e('radial','Flexor retinaculum, radial attachment','屈肌支持帶橈側附著（舟狀骨結節、大多角骨結節）',['Flexor retinaculum (wrist)'],'lateral','y',0),
  e('floor','Carpal bones (floor)','腕骨（底）',['Carpal bones'],'facing','x',1),
  e('ulnar','Flexor retinaculum, ulnar attachment','屈肌支持帶尺側附著（豆狀骨、鉤狀骨鉤）',['Flexor retinaculum (wrist)'],'medial','y',2)]},
 'tarsal-tunnel':{fill:'polygon',shape:'四邊形（支持帶與骨性底）',edges:[
  e('top','Flexor retinaculum, upper edge','屈肌支持帶上緣（內踝）',['Flexor retinaculum (ankle)'],'up','x',0),
  e('floor','Medial malleolus, talus, calcaneus (floor)','內踝、距骨、跟骨（骨性底）',['Tibia (medial malleolus)','Talus','Calcaneus'],'facing','y',1),
  e('bottom','Flexor retinaculum, lower edge','屈肌支持帶下緣（跟骨內側）',['Flexor retinaculum (ankle)'],'down','x',2)]},
 'femoral-triangle':{fill:'polygon',shape:'倒三角形（尖端向下）',edges:[
  e('top','Inguinal ligament','腹股溝韌帶（上界）',['Inguinal ligament'],'facing','x',0),
  e('lateral','Sartorius (medial border)','縫匠肌內側緣（外界）',['Sartorius'],'medial','y',1),
  e('medial','Adductor longus (medial border)','內收長肌內側緣（內界）',['Adductor longus'],'medial','y',2)]},
 'adductor-canal':{fill:'tube',shape:'隧道（三條邊界線）',edges:[
  e('anteromedial','Sartorius (roof)','縫匠肌（前內側，頂）',['Sartorius'],'facing','y',0,.1),
  e('lateral','Vastus medialis','股內側肌（外側）',['Vastus medialis'],'facing','y',1,.1),
  e('posterior','Adductor longus / magnus','內收長肌／內收大肌（後側）',['Adductor longus','Adductor magnus'],'facing','y',2,.1)]},
 'adductor-hiatus':{fill:'polygon',shape:'裂隙',edges:[
  e('tendon','Adductor magnus (margin of the hiatus)','內收大肌（裂孔邊緣）',['Adductor magnus'],'facing','y',0,.04),
  e('femur','Femur','股骨（外側）',['Femur'],'facing','y',1,.04)]},
 'popliteal-fossa':{fill:'polygon',shape:'菱形',edges:[
  e('upper-lateral','Biceps femoris (medial border)','股二頭肌內側緣（上外界）',['Biceps femoris'],'medial','y',0),
  e('lower-lateral','Gastrocnemius lateral head (medial border)','腓腸肌外側頭內側緣（下外界）',['Gastrocnemius, lateral head'],'medial','y',1),
  e('lower-medial','Gastrocnemius medial head (lateral border)','腓腸肌內側頭外側緣（下內界）',['Gastrocnemius, medial head'],'lateral','y',2),
  e('upper-medial','Semimembranosus / semitendinosus (lateral border)','半膜肌、半腱肌外側緣（上內界）',['Semimembranosus','Semitendinosus'],'lateral','y',3)]},
};
