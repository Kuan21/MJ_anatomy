export type QuizSystem = 'skeletal' | 'muscular' | 'tendon' | 'nervous' | 'arterial' | 'venous' | 'cardiac' | 'respiratory';
export type QuizRegionId = 'lower-limb' | 'upper-limb' | 'thorax' | 'back' | 'heart' | 'lung';
/** Section ids are region specific ('hip', 'thigh'… for the leg; 'shoulder', 'arm'… for the arm; 'cage', 'wall'… for the thorax). */
export type QuizSection = string;
export type QuizSide = 'right' | 'left' | 'both';
/** Paired structures are left/right; unpaired ones (sternum, vertebrae, aorta, azygos vein…) are 'midline' and appear for either side. */
export type StructureSide = 'left' | 'right' | 'midline';
export type Bounds = [number[], number[]];

export const QUIZ_SYSTEMS: {id: QuizSystem; label: string; english: string; color: string}[] = [
  {id: 'skeletal', label: '骨骼', english: 'Bones', color: '#d6c4a4'},
  {id: 'muscular', label: '肌肉', english: 'Muscles', color: '#bb7067'},
  {id: 'tendon', label: '肌腱', english: 'Tendons', color: '#d9d9d0'},
  {id: 'nervous', label: '神經', english: 'Nerves', color: '#e4ba4b'},
  {id: 'arterial', label: '動脈', english: 'Arteries', color: '#bf5363'},
  {id: 'venous', label: '靜脈', english: 'Veins', color: '#6399bc'},
  // Heart quiz only: chambers, papillary muscles and valve leaflets.
  {id: 'cardiac', label: '心臟構造', english: 'Heart structures', color: '#d98a85'},
  // Lung quiz only: the surface marks of the lungs, the lobes and the main bronchi.
  {id: 'respiratory', label: '肺表面與氣道', english: 'Lung surface and airway', color: '#c98a8f'},
];
export interface QuizSectionDef {id: string; label: string; english: string; range: [number, number]}
export interface QuizRegionDef {
  id: QuizRegionId;
  label: string;
  english: string;
  /** Header tag, catalogue file and route. */
  tag: string;
  file: string;
  hash: string;
  atlasHash: string;
  /** Short lines for the setup page. */
  headline: [string, string];
  description: [string, string];
  scope: string;
  /** View the model opens in; the back quiz starts from behind. */
  defaultView?: 'front' | 'back' | 'medial';
  /** Side selected when the setup page opens (the back is symmetric, so both sides). */
  defaultSide?: QuizSide;
  /** Systems offered on the setup page; omitted = the five body-system chips (not the heart or lung structures). */
  systems?: QuizSystem[];
  /** Framing of the section box: half-width in x (per side) and the z range in metres. */
  frame: {x: number; z: [number, number]; footZ?: number};
  sections: QuizSectionDef[];
}
const LOWER_SECTIONS: QuizSectionDef[] = [
  {id: 'all', label: '全部下肢', english: 'Lower limb', range: [0, 1.13]},
  {id: 'hip', label: '臀部・髖', english: 'Gluteal & hip', range: [.75, 1.13]},
  {id: 'thigh', label: '大腿', english: 'Thigh', range: [.43, .96]},
  {id: 'knee', label: '膝', english: 'Knee', range: [.34, .58]},
  {id: 'leg', label: '小腿', english: 'Leg', range: [.08, .54]},
  {id: 'foot', label: '踝・足', english: 'Ankle & foot', range: [0, .23]},
];
const UPPER_SECTIONS: QuizSectionDef[] = [
  {id: 'all', label: '全部上肢', english: 'Upper limb', range: [.66, 1.47]},
  {id: 'shoulder', label: '肩帶・肩', english: 'Shoulder girdle', range: [1.2, 1.47]},
  {id: 'arm', label: '上臂', english: 'Arm', range: [1.04, 1.42]},
  {id: 'elbow', label: '肘', english: 'Elbow', range: [.98, 1.2]},
  {id: 'forearm', label: '前臂', english: 'Forearm', range: [.84, 1.16]},
  {id: 'hand', label: '腕・手', english: 'Wrist & hand', range: [.66, .93]},
];
const THORAX_SECTIONS: QuizSectionDef[] = [
  {id: 'all', label: '全部胸腔', english: 'Thorax', range: [1.04, 1.5]},
  {id: 'cage', label: '胸廓骨架', english: 'Bony thorax', range: [1.04, 1.5]},
  {id: 'wall', label: '胸壁・呼吸肌', english: 'Chest wall & breathing muscles', range: [1.04, 1.5]},
  {id: 'vessels', label: '縱膈・大血管', english: 'Mediastinum & great vessels', range: [1.04, 1.5]},
  {id: 'intercostal', label: '肋間與胸壁血管神經', english: 'Intercostal & chest-wall vessels and nerves', range: [1.04, 1.5]},
];
const BACK_SECTIONS: QuizSectionDef[] = [
  {id: 'all', label: '全部背部', english: 'Back', range: [.78, 1.68]},
  {id: 'superficial', label: '淺層背肌', english: 'Superficial back muscles', range: [.85, 1.62]},
  {id: 'intermediate', label: '中層背肌', english: 'Intermediate back muscles', range: [.95, 1.5]},
  {id: 'deep', label: '深層固有背肌', english: 'Deep (intrinsic) back muscles', range: [.78, 1.68]},
  {id: 'suboccipital', label: '枕下區', english: 'Suboccipital region', range: [1.5, 1.68]},
  {id: 'neurovascular', label: '背部神經與血管', english: 'Nerves and vessels of the back', range: [.78, 1.68]},
];
/** Question scope: any combination of these nine categories, crossed freely with region (section) and side. */
export type QuizCategory = 'bone' | 'muscle' | 'tendon' | 'nerve' | 'artery' | 'vein' | 'ligament' | 'space' | 'organ';
export const QUIZ_CATEGORIES: {id: QuizCategory; label: string; english: string; color: string; note: string}[] = [
  {id: 'bone', label: '骨', english: 'Bones', color: '#d6c4a4', note: '含骨性標記'},
  {id: 'muscle', label: '肌肉', english: 'Muscles', color: '#bb7067', note: ''},
  {id: 'tendon', label: '肌腱', english: 'Tendons', color: '#d9d9d0', note: ''},
  {id: 'nerve', label: '神經', english: 'Nerves', color: '#e4ba4b', note: ''},
  {id: 'artery', label: '動脈', english: 'Arteries', color: '#bf5363', note: ''},
  {id: 'vein', label: '靜脈', english: 'Veins', color: '#6399bc', note: ''},
  {id: 'ligament', label: '韌帶與筋膜', english: 'Ligaments and fasciae', color: '#c9b98a', note: ''},
  {id: 'space', label: '特殊空間與孔', english: 'Spaces and openings', color: '#8fa7a0', note: '四邊孔、三邊孔、解剖鼻煙盒、跗管'},
  {id: 'organ', label: '器官結構', english: 'Organ structures', color: '#d98a85', note: '心臟內部、肺的壓跡與肺門'},
];
const SPACE_NAME = /quadrangular space|quadrilateral space|triangular space|triangular interval|anatomical snuffbox|snuff ?box|tarsal tunnel|carpal tunnel|cubital fossa|popliteal fossa|femoral triangle|adductor canal|axilla\b|foramen|hiatus|canal\b/i;
const LIGAMENT_NAME = /ligament|fascia|retinaculum|aponeurosis|membrane|septum|raphe|capsule/i;
const SYSTEM_CATEGORY: Record<QuizSystem, QuizCategory> = {skeletal: 'bone', muscular: 'muscle', tendon: 'tendon', nervous: 'nerve', arterial: 'artery', venous: 'vein', cardiac: 'organ', respiratory: 'organ'};
/** One category per structure: spaces and ligaments are recognised by name; every other structure follows its body system. */
export function categoryOf(structure: {name: string; system: QuizSystem}): QuizCategory {
  if (structure.system === 'muscular' || structure.system === 'skeletal') {
    if (SPACE_NAME.test(structure.name) && !/^(?:left |right )?(?:intervertebral|neural) /i.test(structure.name)) return 'space';
    if (LIGAMENT_NAME.test(structure.name) && !/tensor fasciae|membranous/i.test(structure.name)) return 'ligament';
  }
  if (structure.system === 'respiratory' && /ligament/i.test(structure.name)) return 'ligament';
  return SYSTEM_CATEGORY[structure.system];
}
export const QUIZ_REGIONS = {
  'lower-limb': {
    id: 'lower-limb', label: '下肢', english: 'Lower limb', tag: '下肢篇', file: 'quiz-lower.json', hash: '#/quiz/lower-limb', atlasHash: '#/atlas/lower',
    headline: ['看名稱，', '點出位置。'], description: ['由臀部到足部，在 3D 模型上練習辨認。', '每答一題，立即顯示正確位置與資料卡。'],
    scope: '採用現有圖譜的固定解剖姿勢。題目只涵蓋已有模型的構造；神經、動脈與靜脈可以獨立練習。',
    frame: {x: .19, z: [-.13, .09], footZ: .19}, sections: LOWER_SECTIONS,
  },
  'upper-limb': {
    id: 'upper-limb', label: '上肢', english: 'Upper limb', tag: '上肢篇', file: 'quiz-upper.json', hash: '#/quiz/upper-limb', atlasHash: '#/atlas/upper',
    headline: ['看名稱，', '點出位置。'], description: ['由肩帶到手指，在 3D 模型上練習辨認。', '每答一題，立即顯示正確位置與資料卡。'],
    scope: '採用現有圖譜的固定解剖姿勢。題目涵蓋肩帶、上臂、肘、前臂與手；神經、動脈與靜脈可以獨立練習。',
    frame: {x: .37, z: [-.13, .13]}, sections: UPPER_SECTIONS,
  },
  thorax: {
    id: 'thorax', label: '胸腔', english: 'Thorax', tag: '胸腔篇', file: 'quiz-thorax.json', hash: '#/quiz/thorax', atlasHash: '#/atlas/whole',
    headline: ['看名稱，', '點出位置。'], description: ['由胸廓骨架到縱膈大血管，在 3D 模型上練習辨認。', '每答一題，立即顯示正確位置與資料卡。'],
    scope: '採用現有圖譜的固定解剖姿勢。題目只涵蓋胸腔內外已有模型的主要構造（不含器官內部分支）；神經、動脈與靜脈可以獨立練習。',
    frame: {x: .24, z: [-.13, .15]}, sections: THORAX_SECTIONS,
  },
} as Record<QuizRegionId, QuizRegionDef>;
QUIZ_REGIONS.back = {
  id: 'back', label: '背部', english: 'Back', tag: '背部篇', file: 'quiz-back.json', hash: '#/quiz/back', atlasHash: '#/atlas/whole',
  headline: ['看名稱，', '點出位置。'], description: ['由淺層到深層背肌，連同枕下區的神經與血管，在 3D 模型上練習辨認。', '每答一題，立即顯示正確位置與資料卡。'],
  scope: '採用現有圖譜的固定解剖姿勢，預設由後方觀看。題目涵蓋斜方肌、闊背肌、提肩胛肌、大小菱形肌、後上下鋸肌、夾肌、豎脊肌群、橫棘肌群、枕下肌群，以及模型中已有的相關神經與血管；枕下神經、枕大神經、第三枕神經、枕小神經、耳大神經與枕下靜脈叢因公開模型沒有，為沿教科書走行建立的示意管狀模型（資料卡標示「示意模型」）；胸椎以下的背支神經未收錄，不會出題。',
  defaultView: 'back', defaultSide: 'both',
  frame: {x: .26, z: [-.17, .12]}, sections: BACK_SECTIONS,
};
const HEART_SECTIONS: QuizSectionDef[] = [
  {id: 'all', label: '全部心臟', english: 'Heart', range: [1.2, 1.42]},
  {id: 'chambers', label: '心腔', english: 'Chambers', range: [1.2, 1.42]},
  {id: 'papillary', label: '乳突肌', english: 'Papillary muscles', range: [1.2, 1.42]},
  {id: 'valves', label: '瓣膜（含腱索）', english: 'Valves with chordae tendineae', range: [1.2, 1.42]},
  {id: 'coronary', label: '冠狀動脈', english: 'Coronary arteries', range: [1.2, 1.42]},
  {id: 'veins', label: '心臟靜脈', english: 'Cardiac veins', range: [1.2, 1.42]},
  {id: 'vessels', label: '相連大血管', english: 'Great vessels', range: [1.2, 1.42]},
  {id: 'interior', label: '腔內構造（示意構造）', english: 'Internal structures (schematic)', range: [1.2, 1.42]},
  {id: 'pericardium', label: '心包膜', english: 'Pericardium', range: [1.2, 1.42]},
];
QUIZ_REGIONS.heart = {
  id: 'heart', label: '心臟', english: 'Heart', tag: '心臟篇', file: 'quiz-heart.json', hash: '#/quiz/heart', atlasHash: '#/organ/heart',
  headline: ['看名稱，', '點出位置。'], description: ['由心腔、瓣膜、乳突肌到冠狀動脈，在 3D 心臟模型上練習辨認。', '每答一題，立即顯示正確位置與說明。'],
  scope: '採用心臟詳細模型。瓣膜（房室瓣）連同腱索一併呈現，腱索不能單獨作答；乳突肌與瓣膜位於心腔內，題目開始時心腔已先移開，可用「移開遮擋」再調整。腔內構造（界嵴、梳狀肌、卵圓窩、節制索、室上嵴、肉柱等）與兩個心包竇是依解剖知識補建的示意模型，資料卡標示「示意構造」。傳導系統不在範圍內，不會出題。',
  defaultView: 'front', defaultSide: 'both', systems: ['cardiac', 'arterial', 'venous'],
  frame: {x: .075, z: [-.06, .09]}, sections: HEART_SECTIONS,
};
const LUNG_SECTIONS: QuizSectionDef[] = [
  {id: 'all', label: '全部肺表面與肺門', english: 'Lung surface and hilum', range: [1.15, 1.45]},
  {id: 'impressions', label: '壓跡與溝', english: 'Impressions, grooves and contact areas', range: [1.15, 1.45]},
  {id: 'features', label: '尖、緣、面、裂、切跡與舌葉', english: 'Apex, borders, surfaces, fissures, notch and lingula', range: [1.15, 1.45]},
  {id: 'hilum', label: '肺門', english: 'Hilum', range: [1.15, 1.45]},
];
QUIZ_REGIONS.lung = {
  id: 'lung', label: '肺', english: 'Lungs', tag: '肺篇', file: 'quiz-lung.json', hash: '#/quiz/lung', atlasHash: '#/atlas/whole',
  headline: ['看名稱，', '點出位置。'], description: ['由肺的壓跡、溝、緣、裂到肺門，在 3D 肺模型上練習辨認。', '每答一題，立即顯示正確位置與資料卡。'],
  scope: '題目只涵蓋模型中真正有的肺表面面片（由肺葉表面依相鄰構造切出，邊界為近似）與肺門構造（主支氣管、肺動脈、肺靜脈、支氣管動脈）。右上葉支氣管、中間支氣管、肺門淋巴結與肺門處的胸膜返折模型沒有，不出題；肺內的支氣管樹與肺血管不在範圍內。',
  defaultView: 'medial', defaultSide: 'right', systems: ['respiratory', 'arterial', 'venous'],
  frame: {x: .13, z: [-.1, .11]}, sections: LUNG_SECTIONS,
};
export const QUIZ_REGION_IDS = Object.keys(QUIZ_REGIONS) as QuizRegionId[];
export const isQuizHub = (hash: string) => hash === '#/quiz' || hash === '#/quiz/';
export const regionOfHash = (hash: string): QuizRegionId | undefined => QUIZ_REGION_IDS.find(id => QUIZ_REGIONS[id].hash === hash);
export const QUIZ_SECTIONS = LOWER_SECTIONS;
export const regionSections = (region: QuizRegionId | undefined) => QUIZ_REGIONS[region ?? 'lower-limb'].sections;

export interface QuizStructure {
  id: string;
  name: string;
  chinese?: string;
  system: QuizSystem;
  side: StructureSide;
  sections: Exclude<QuizSection, 'all'>[];
  meshIds: string[];
  bounds: Bounds;
  source: 'BodyParts3D' | 'Nervous supplement' | 'Lung surface areas' | 'Z-Anatomy' | `Z-Anatomy / ${string}`;
  /** Short bilingual description (heart quiz), shown on the answer card. */
  description?: {zh: string; en: string};
}
export interface QuizMesh {
  id: string;
  structureId: string;
  positions: number;
  normals: number;
  indices: number;
  vertexCount: number;
  indexCount: number;
}
export interface QuizPackage {
  url: string;
  gzip: string;
  bytes: number;
  gzipBytes: number;
  system: QuizSystem;
  side: StructureSide;
  meshes: QuizMesh[];
}
export interface QuizCatalogue {
  version: 1;
  region?: QuizRegionId;
  structures: QuizStructure[];
  packages: QuizPackage[];
}
export interface QuizSettings {
  section: QuizSection;
  systems: QuizSystem[];
  /** Scope categories (multi-select, any combination). When set it decides the pool; `systems` is the older body-system filter. */
  categories?: QuizCategory[];
  side: QuizSide;
  count: number;
}

// Only individually identified lower-limb nerves. Small source branches with
// inconsistent regional geometry are deliberately not turned into quiz answers.
export const LOWER_NERVES: Record<string, {zh: string; sections: Exclude<QuizSection, 'all'>[]}> = {
  'femoral nerve': {zh: '股神經', sections: ['hip', 'thigh']},
  'obturator nerve': {zh: '閉孔神經', sections: ['hip', 'thigh']},
  'sciatic nerve': {zh: '坐骨神經', sections: ['hip', 'thigh']},
  'tibial nerve': {zh: '脛神經', sections: ['knee', 'leg']},
  'common fibular nerve': {zh: '腓總神經', sections: ['knee', 'leg']},
  'superficial fibular nerve': {zh: '腓淺神經', sections: ['leg']},
  'deep fibular nerve': {zh: '腓深神經', sections: ['leg', 'foot']},
  'saphenous nerve': {zh: '隱神經', sections: ['thigh', 'knee', 'leg']},
  'sural nerve': {zh: '腓腸神經', sections: ['leg', 'foot']},
  'medial sural cutaneous nerve': {zh: '腓腸內側皮神經', sections: ['knee', 'leg']},
  'medial plantar nerve': {zh: '足底內側神經', sections: ['foot']},
  'lateral plantar nerve': {zh: '足底外側神經', sections: ['foot']},
  'superior gluteal nerve': {zh: '臀上神經', sections: ['hip']},
  'lateral femoral cutaneous nerve': {zh: '股外側皮神經', sections: ['hip', 'thigh']},
  'posterior femoral cutaneous nerve': {zh: '股後皮神經', sections: ['hip', 'thigh']},
  'nerve to quadratus femoris muscle': {zh: '股方肌神經', sections: ['hip']},
};

/** Sections overlap for long structures; no mesh is cut to fit a display box. */
export function lowerSections(name: string, bounds: Bounds): Exclude<QuizSection, 'all'>[] {
  const n = name.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/\s+/g, ' ').trim();
  if (LOWER_NERVES[n]) return LOWER_NERVES[n].sections;
  if (/\bfemur\b/.test(n)) return ['hip', 'thigh', 'knee'];
  if (/^(tibia|fibula)$/.test(n)) return ['knee', 'leg', 'foot'];
  if (/great saphenous/.test(n)) return ['thigh', 'knee', 'leg'];
  if (/small saphenous/.test(n)) return ['knee', 'leg'];
  if (/glute|hip bone|iliac|obturator|piriformis|gemellus|quadratus femoris|psoas|tensor fasciae/.test(n)) return ['hip'];
  if (/genicular|poplite|patella/.test(n)) return ['knee'];
  if (/gastrocnemius|plantaris/.test(n)) return ['knee', 'leg'];
  if (/hallucis longus|digitorum longus/.test(n)) return ['leg', 'foot'];
  if (/tibial|tibialis|fibular|peroneal|soleus/.test(n)) return ['leg'];
  if (/foot|toe|metatars|plantar|tarsal|pedis|halluc|calcane|talus|cuboid|cuneiform|flexor accessorius/.test(n)) return ['foot'];
  if (/femor|adductor|gracilis|sartorius|vastus|semitend|semimembr|pectineus|perforating/.test(n)) return ['thigh'];
  const y = (bounds[0][1] + bounds[1][1]) / 2;
  return [y < .23 ? 'foot' : y < .53 ? 'leg' : y < .84 ? 'thigh' : 'hip'];
}

type SectionList = Exclude<QuizSection, 'all'>[];
const cleanName = (name: string) => name.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/\s+/g, ' ').trim();
/** Sections whose y range a structure overlaps (long structures belong to several, no mesh is cut). */
function overlapSections(region: QuizRegionId, bounds: Bounds): SectionList {
  const [y0, y1] = [bounds[0][1], bounds[1][1]], span = Math.max(y1 - y0, 1e-3);
  const hit = regionSections(region).filter(s => s.id !== 'all' && Math.min(y1, s.range[1]) - Math.max(y0, s.range[0]) >= Math.min(.45 * span, .04));
  if (hit.length) return hit.map(s => s.id);
  const mid = (y0 + y1) / 2;
  return [regionSections(region).filter(s => s.id !== 'all').reduce((best, s) => Math.abs((s.range[0] + s.range[1]) / 2 - mid) < Math.abs((best.range[0] + best.range[1]) / 2 - mid) ? s : best).id];
}

// Individually identified upper-limb nerves (brachial plexus and its named branches).
export const UPPER_NERVES: Record<string, {zh: string; sections: SectionList}> = {
  'roots of brachial plexus': {zh: '臂神經叢神經根', sections: ['shoulder']},
  'superior trunk of brachial plexus': {zh: '臂神經叢上幹', sections: ['shoulder']},
  'middle trunk of brachial plexus': {zh: '臂神經叢中幹', sections: ['shoulder']},
  'inferior trunk of brachial plexus': {zh: '臂神經叢下幹', sections: ['shoulder']},
  'posterior cord of brachial plexus': {zh: '臂神經叢後束', sections: ['shoulder']},
  'dorsal scapular nerve': {zh: '肩胛背神經', sections: ['shoulder']},
  'long thoracic nerve': {zh: '胸長神經', sections: ['shoulder']},
  'suprascapular nerve': {zh: '肩胛上神經', sections: ['shoulder']},
  'subclavian nerve': {zh: '鎖骨下肌神經', sections: ['shoulder']},
  'lateral pectoral nerve': {zh: '外側胸神經', sections: ['shoulder']},
  'thoracodorsal nerve': {zh: '胸背神經', sections: ['shoulder']},
  'axillary nerve': {zh: '腋神經', sections: ['shoulder', 'arm']},
  'muscular branches of axillary nerve': {zh: '腋神經肌支', sections: ['shoulder']},
  'superior lateral brachial cutaneous nerve': {zh: '上外側臂皮神經', sections: ['shoulder', 'arm']},
  'musculocutaneous nerve': {zh: '肌皮神經', sections: ['shoulder', 'arm']},
  'lateral antebrachial cutaneous nerve': {zh: '外側前臂皮神經', sections: ['elbow', 'forearm']},
  'radial nerve': {zh: '橈神經', sections: ['arm', 'elbow']},
  'muscular branches of radial nerve': {zh: '橈神經肌支', sections: ['arm']},
  'inferior lateral brachial cutaneous nerve': {zh: '下外側臂皮神經', sections: ['arm']},
  'posterior antebrachial cutaneous nerve': {zh: '後前臂皮神經', sections: ['arm', 'forearm']},
  'deep branch of radial nerve': {zh: '橈神經深支', sections: ['elbow', 'forearm']},
  'posterior interosseous nerve of forearm': {zh: '後骨間神經', sections: ['forearm']},
  'superficial branch of radial nerve': {zh: '橈神經淺支', sections: ['forearm', 'hand']},
  'dorsal digital branches of radial nerve': {zh: '橈神經背側指支', sections: ['hand']},
  'median nerve': {zh: '正中神經', sections: ['arm', 'elbow', 'forearm', 'hand']},
  'anterior interosseous nerve of forearm': {zh: '前骨間神經', sections: ['forearm']},
  'palmar branch of median nerve': {zh: '正中神經掌支', sections: ['forearm', 'hand']},
  'muscular branches of median nerve': {zh: '正中神經肌支', sections: ['forearm', 'hand']},
  'common palmar digital branches of median nerve': {zh: '正中神經掌側總指支', sections: ['hand']},
  'proper palmar digital branches of median nerve': {zh: '正中神經掌側固有指支', sections: ['hand']},
  '(communicating branch of median nerve with ulnar nerve)': {zh: '正中神經與尺神經交通支', sections: ['hand']},
  'ulnar nerve': {zh: '尺神經', sections: ['arm', 'elbow', 'forearm']},
  'dorsal branch of ulnar nerve': {zh: '尺神經背支', sections: ['forearm', 'hand']},
  'palmar branch of ulnar nerve': {zh: '尺神經掌支', sections: ['forearm', 'hand']},
  'superficial branch of ulnar nerve': {zh: '尺神經淺支', sections: ['hand']},
  'deep branch of ulnar nerve': {zh: '尺神經深支', sections: ['hand']},
  'muscular branches of ulnar nerve': {zh: '尺神經肌支', sections: ['forearm']},
  'common palmar digital branches of ulnar nerve': {zh: '尺神經掌側總指支', sections: ['hand']},
  'proper palmar digital branches of ulnar nerve': {zh: '尺神經掌側固有指支', sections: ['hand']},
  'dorsal digital branches of ulnar nerve': {zh: '尺神經背側指支', sections: ['hand']},
  'medial brachial cutaneous nerve': {zh: '內側臂皮神經', sections: ['arm']},
  'medial antebrachial cutaneous nerve': {zh: '內側前臂皮神經', sections: ['arm', 'forearm']},
  'anterior branch of medial antebrachial cutaneous nerve': {zh: '內側前臂皮神經前支', sections: ['forearm']},
  'posterior branch of medial antebrachial cutaneous nerve': {zh: '內側前臂皮神經後支', sections: ['forearm']},
};

/** Upper-limb sections: bones and muscles by named attachment, everything else by the height it spans. */
export function upperSections(name: string, bounds: Bounds): SectionList {
  const n = cleanName(name);
  if (UPPER_NERVES[n]) return UPPER_NERVES[n].sections;
  if (/^(clavicle|scapula)$/.test(n)) return ['shoulder'];
  if (/^humerus$/.test(n)) return ['shoulder', 'arm', 'elbow'];
  if (/^(radius|ulna)$/.test(n)) return ['elbow', 'forearm', 'hand'];
  if (/phalan|metacarp|scaphoid|lunate|triquetr|pisiform|trapezium|trapezoid|capitate|hamate/.test(n)) return ['hand'];
  if (/deltoid|teres major|teres minor|supraspinatus|infraspinatus|subscapularis/.test(n)) return /deltoid|teres major/.test(n) ? ['shoulder', 'arm'] : ['shoulder'];
  if (/pectoralis|trapezius|rhomboid|levator scapulae|serratus anterior|subclavius|latissimus/.test(n)) return ['shoulder'];
  if (/biceps brachii|brachialis|coracobrachialis|triceps brachii/.test(n)) return ['arm'];
  if (/anconeus|brachioradialis|pronator teres|supinator/.test(n)) return ['elbow', 'forearm'];
  if (/abductor pollicis longus|extensor pollicis brevis/.test(n)) return ['forearm', 'hand'];
  if (/lumbrical|interossei|flexor pollicis brevis|abductor pollicis brevis|opponens|adductor pollicis|digiti minimi of hand|palmaris brevis/.test(n)) return ['hand'];
  if (/carpi|digitorum|digiti minimi|pollicis longus|indicis|pronator quadratus|palmaris longus/.test(n)) return ['forearm'];
  return overlapSections('upper-limb', bounds);
}

// Thorax: individually identified unpaired and paired structures. Organ-internal branches (lung segments, coronary
// twigs, hepatic/portal tributaries) are deliberately not turned into answers.
export const THORAX_NERVES: Record<string, {zh: string; sections: SectionList}> = {
  'intercostal nerves': {zh: '肋間神經', sections: ['intercostal']},
  'vagus nerve (x)': {zh: '迷走神經', sections: ['vessels']},
  'sympathetic nerves': {zh: '交感神經', sections: ['vessels']},
};
export const THORAX_INCLUDE: Record<QuizSystem, RegExp> = {
  respiratory: /(?!)/,
  tendon: /(?!)/,
  skeletal: /^(?:(?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) rib|manubrium|body of sternum|xiphoid process|(?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) thoracic vertebra|costal cartilages?|intervertebral discs?)$/,
  muscular: /intercostal|transversus thoracis|levatores costarum|serratus posterior|^diaphragm$|spinalis thoracis|iliocostalis thoracis|longissimus thoracis|semispinalis thoracis|interspinalis thoracis|thoracic rotator|subcostal/,
  nervous: /^$/,
  cardiac: /^$/,
  arterial: /^(?:arch of aorta|ascending aorta|descending thoracic aorta|descending aorta|brachiocephalic artery|(?:left |right )?(?:common carotid|subclavian) artery|internal thoracic artery|(?:first |second )?posterior intercostal arteries?|superior intercostal artery|subcostal artery|costocervical trunk|thyrocervical trunk|bronchial arter(?:y|ies)|esophageal arter(?:y|ies)|musculophrenic artery|pulmonary trunk|pulmonary artery)$/,
  venous: /^(?:superior vena cava|inferior vena cava|brachiocephalic vein|azygos vein|hemiazygos vein|accessory hemiazygos vein|internal thoracic vein|set of anterior intercostal veins|superior intercostal vein|subcostal vein|musculophrenic vein|superior pulmonary vein|inferior pulmonary vein|(?:left |right )?subclavian vein)$/,
};
/** Thorax sections: skeleton → cage; muscles → wall; named trunk vessels → vessels; chest-wall vessels and nerves → intercostal. */
export function thoraxSections(name: string, bounds: Bounds, system?: QuizSystem): SectionList {
  const n = cleanName(name);
  if (THORAX_NERVES[n]) return THORAX_NERVES[n].sections;
  if (system === 'skeletal' || /\brib\b|sternum|manubrium|xiphoid|thoracic vertebra|costal cartilage|intervertebral/.test(n)) return ['cage'];
  if (system === 'muscular') return ['wall'];
  if (/intercostal|internal thoracic|musculophrenic|subcostal|costocervical|thyrocervical|bronchial|esophageal/.test(n)) return ['intercostal'];
  void bounds;
  return ['vessels'];
}

// Back: individually identified nerves and vessels. Dorsal rami below C3 are not modelled and are not turned into answers.
export const BACK_NERVES: Record<string, {zh: string; sections: SectionList; system?: QuizSystem; schematic?: boolean}> = {
  'accessory nerve (xi)': {zh: '副神經', sections: ['superficial', 'neurovascular']},
  'dorsal scapular nerve': {zh: '肩胛背神經', sections: ['intermediate', 'neurovascular']},
  'thoracodorsal nerve': {zh: '胸背神經', sections: ['superficial', 'neurovascular']},
  // Schematic tube models (neither BodyParts3D nor Z-Anatomy has them); the answer card says 示意模型.
  'suboccipital nerve': {zh: '枕下神經', sections: ['suboccipital', 'neurovascular'], schematic: true},
  'greater occipital nerve': {zh: '枕大神經', sections: ['suboccipital', 'neurovascular'], schematic: true},
  'third occipital nerve': {zh: '第三枕神經', sections: ['deep', 'neurovascular'], schematic: true},
  'lesser occipital nerve': {zh: '枕小神經', sections: ['superficial', 'neurovascular'], schematic: true},
  'great auricular nerve': {zh: '耳大神經', sections: ['superficial', 'neurovascular'], schematic: true},
  'suboccipital venous plexus': {zh: '枕下靜脈叢', sections: ['suboccipital', 'neurovascular'], system: 'venous', schematic: true},
};
export const BACK_INCLUDE: Record<QuizSystem, RegExp> = {
  respiratory: /(?!)/,
  tendon: /(?!)/,
  skeletal: /^(?:(?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) (?:cervical|thoracic|lumbar) vertebra|atlas|axis|sacrum|coccyx|occipital bone|scapula)$/,
  muscular: /^(?:(?:descending|transverse|ascending) part of trapezius|latissimus dorsi|levator scapulae|rhomboid (?:major|minor)|serratus posterior (?:superior|inferior)|splenius (?:capitis|cervicis)|iliocostalis (?:cervicis|thoracis|lumborum)|longissimus (?:capitis|cervicis|thoracis)|spinalis(?: thoracis| cervicis)?|semispinalis (?:capitis|cervicis|thoracis)|multifidus|(?:cervical|thoracic|lumbar) rotator|rectus capitis posterior (?:major|minor)|obliquus capitis (?:superior|inferior))$/,
  nervous: /^$/,
  cardiac: /^$/,
  arterial: /^(?:dorsal scapular artery|transverse cervical artery|superficial cervical artery|deep cervical artery|vertebral artery|costocervical trunk|posterior intercostal arteries|subcostal artery|lumbar artery|thoracodorsal artery)$/,
  venous: /^(?:subcostal vein|lumbar vein|ascending lumbar vein|thoracodorsal vein)$/,
};
/** Back sections: superficial (trapezius, latissimus), intermediate (levator, rhomboids, serratus posterior), deep intrinsic, suboccipital, nerves and vessels. */
export function backSections(name: string, system?: QuizSystem): SectionList {
  const n = cleanName(name);
  if (BACK_NERVES[n]) return BACK_NERVES[n].sections;
  if (/trapezius|latissimus/.test(n)) return ['superficial'];
  if (/levator scapulae|rhomboid|serratus posterior/.test(n)) return ['intermediate'];
  if (/rectus capitis posterior|obliquus capitis/.test(n)) return ['suboccipital'];
  if (/splenius|iliocostalis|longissimus|spinalis|semispinalis|multifidus|rotator/.test(n)) return ['deep'];
  if (n === 'vertebral artery') return ['suboccipital', 'neurovascular'];
  if (system === 'arterial' || system === 'venous' || system === 'nervous') return ['neurovascular'];
  if (/occipital bone|atlas|axis|first cervical|second cervical/.test(n)) return ['deep', 'suboccipital'];
  return ['deep'];
}

/** Lung quiz: the lobes only give context (no section, never asked); everything else belongs to one of the three sections. */
export function lungSections(name: string): Exclude<QuizSection, 'all'>[] {
  const n = name.toLowerCase();
  if (/\blobe of\b.*\blung\b/.test(n)) return [];
  if (/groove|impression|contact area/.test(n) && !/cardiac notch/.test(n)) return ['impressions'];
  if (/hilum|bronchus|pulmonary (artery|vein|ligament)|bronchial artery/.test(n)) return ['hilum'];
  return ['features'];
}

export function classifySections(region: QuizRegionId, name: string, bounds: Bounds, system?: QuizSystem): SectionList {
  if (region === 'lung') return lungSections(name);
  if (region === 'back') return backSections(name, system);
  return region === 'upper-limb' ? upperSections(name, bounds) : region === 'thorax' ? thoraxSections(name, bounds, system) : lowerSections(name, bounds);
}

export function questionPool(catalogue: QuizCatalogue, settings: QuizSettings): QuizStructure[] {
  return catalogue.structures.filter(s => (settings.categories ? settings.categories.includes(categoryOf(s)) : settings.systems.includes(s.system)) && s.sections.length > 0
    && (settings.side === 'both' || s.side === 'midline' || settings.side === s.side)
    && (settings.section === 'all' || s.sections.includes(settings.section)));
}

/** Same-system regional anatomy stays available as distractors and for peeling. */
export function sceneStructures(catalogue: QuizCatalogue, target: QuizStructure, section: QuizSection, side: QuizSide) {
  const range = (regionSections(catalogue.region).find(s => s.id === section) ?? regionSections(catalogue.region)[0]).range;
  // The target is always drawn: a mistake from the other side (錯題本 after the side setting changed) must still be answerable; the frame unions its bounds.
  return catalogue.structures.filter(s => s.id === target.id || ((side === 'both' || s.side === 'midline' || s.side === side)
    && (catalogue.region === 'heart' || catalogue.region === 'lung' || s.system === target.system || s.system === 'skeletal')
    && (section === 'all' || s.sections.includes(section)
      || (s.bounds[0][1] < range[1] && s.bounds[1][1] > range[0]))));
}
