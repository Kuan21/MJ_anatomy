import type {HeartView} from './heart-types';

/** One structure inside a chamber. `parts` are catalogue part names that are drawn for it; with none, the source models have no mesh for it. */
export interface ChamberItem {en: string; zh: string; parts: string[]; zhDesc: string; enDesc: string}
export interface Chamber {
  id: 'ra' | 'rv' | 'la' | 'lv';
  en: string; zh: string;
  /** catalogue part whose wall is removed (drawn almost transparent) when the chamber is opened */
  wall: string;
  /** the auricle of an atrium: cut open together with the wall (it is part of the same chamber) */
  auricle?: string;
  /** how deep the cut goes, as a share of the chamber's depth along the line of sight (default .5; the left atrium is shallow and its auricle lengthens the bounding depth) */
  cutDepth?: number;
  /** great veins that open into this chamber: they stay opaque (they are what the view looks at) when the chamber is opened */
  openings?: string[];
  /** direction the camera looks from, in atlas axes (+x body left, +y up, +z anterior) */
  look: [number, number, number];
  /** catalogue parts shown only while this chamber is open (valves, papillary muscles; the other chambers keep them hidden) */
  inside: string[];
  items: ChamberItem[];
}

const PV = {
  'Left superior pulmonary vein': ['Left superior pulmonary vein', '左上肺靜脈開口', 'Opening of the left superior pulmonary vein', '左上肺靜脈開口於左心房後壁的左上角。'],
  'Left inferior pulmonary vein': ['Left inferior pulmonary vein', '左下肺靜脈開口', 'Opening of the left inferior pulmonary vein', '左下肺靜脈開口於左心房後壁的左下角。'],
  'Right superior pulmonary vein': ['Right superior pulmonary vein', '右上肺靜脈開口', 'Opening of the right superior pulmonary vein', '右上肺靜脈開口於左心房後壁的右上角。'],
  'Right inferior pulmonary vein': ['Right inferior pulmonary vein', '右下肺靜脈開口', 'Opening of the right inferior pulmonary vein', '右下肺靜脈開口於左心房後壁的右下角。'],
} as const;

const MJ = '（示意構造，位置與形狀為示意。）';
const MJ_EN = ' (schematic; position and shape are schematic.)';
const noModel = (en: string, zh: string, zhDesc: string, enDesc: string): ChamberItem => ({en, zh, parts: [], zhDesc, enDesc});
const RV_VALVE_CUSPS = ['Anterior cusp of tricuspid valve', 'Posterior cusp of tricuspid valve', 'Septal cusp of tricuspid valve'];
const LV_VALVE_CUSPS = ['Anterior cusp of bicuspid valve', 'Posterior cusp of bicuspid valve'];
const PULMONARY_CUSPS = ['Anterior semilunar cusp of pulmonary valve', 'Left semilunar cusp of pulmonary valve', 'Right semilunar cusp of pulmonary valve'];
const AORTIC_CUSPS = ['Left coronary cusp of aortic valve', 'Right coronary cusp of aortic valve', 'Non-coronary cusp of aortic valve'];

const RA_ITEMS: ChamberItem[] = [
  {en: 'Right auricle', zh: '右心耳', parts: ['Right auricle'], zhDesc: '右心房向前突出的三角形小囊，覆蓋升主動脈根部，內壁有梳狀肌。' + MJ, enDesc: 'The triangular pouch projecting forward from the right atrium over the root of the ascending aorta; its inner wall carries pectinate muscles.' + MJ_EN},
  {en: 'Left auricle', zh: '左心耳', parts: ['Left auricle'], zhDesc: '左心房向前突出的手指狀（鉤狀）小囊，沿肺動脈幹左側貼附，邊緣有淺缺口，內壁有梳狀肌。' + MJ, enDesc: 'The finger- or hook-shaped pouch projecting forward from the left atrium along the left side of the pulmonary trunk, with a notched margin; its wall carries pectinate muscles.' + MJ_EN},
  {en: 'Interatrial septum', zh: '心房中隔', parts: ['Interatrial septum'], zhDesc: '分隔左、右心房的薄壁，右側有卵圓窩。' + MJ, enDesc: 'The thin wall between the right and left atria; the fossa ovalis lies on its right side.' + MJ_EN},
  {en: 'Pectinate muscles', zh: '梳狀肌', parts: ['Pectinate muscles'], zhDesc: '右心房前外側壁與右心耳內的平行肌肉嵴，由界嵴向前伸出，使內壁呈梳齒狀。' + MJ, enDesc: 'Parallel muscular ridges on the anterolateral wall of the right atrium and in the right auricle, running forward from the crista terminalis.' + MJ_EN},
  {en: 'Fossa ovalis', zh: '卵圓窩', parts: ['Fossa ovalis'], zhDesc: '心房中隔右側、下腔靜脈開口上方的橢圓凹窩，邊緣隆起，是胎兒期卵圓孔閉合後的痕跡。' + MJ, enDesc: 'An oval depression on the right side of the interatrial septum above the opening of the inferior vena cava, with a raised rim; the remnant of the fetal foramen ovale.' + MJ_EN},
  {en: 'Opening of the coronary sinus', zh: '冠狀竇開口', parts: ['Coronary sinus'], zhDesc: '冠狀竇開口於下腔靜脈開口與右房室口之間，收集心臟本身的靜脈血。', enDesc: 'The coronary sinus opens between the opening of the inferior vena cava and the right atrioventricular orifice and drains the veins of the heart.'},
  {en: 'Crista terminalis', zh: '界嵴', parts: ['Crista terminalis'], zhDesc: '右心房內壁的垂直肌嵴，從上腔靜脈開口前方走到下腔靜脈開口前方，分隔光滑的腔靜脈竇與有梳狀肌的固有心房。' + MJ, enDesc: 'A vertical muscular ridge inside the right atrium from in front of the superior vena cava to in front of the inferior vena cava; it separates the smooth sinus venarum from the pectinate part.' + MJ_EN},
  {en: 'Opening of the superior vena cava', zh: '上腔靜脈開口', parts: ['Superior vena cava'], zhDesc: '上腔靜脈開口於右心房的上部，開口處沒有瓣膜。', enDesc: 'The superior vena cava opens into the upper part of the right atrium; its opening has no valve.'},
  {en: 'Opening of the inferior vena cava', zh: '下腔靜脈開口', parts: ['Inferior vena cava'], zhDesc: '下腔靜脈開口於右心房的下部，邊緣有不完整的下腔靜脈瓣。', enDesc: 'The inferior vena cava opens into the lower part of the right atrium; its edge carries the incomplete valve of the inferior vena cava.'},
];

const PV_ITEMS: ChamberItem[] = Object.values(PV).map(([part, zh, en, zhDesc]) => ({en, zh, parts: [part], zhDesc, enDesc: `${en} into the posterior wall of the left atrium.`}));

export const CHAMBERS: Chamber[] = [
  {id: 'ra', en: 'Right atrium', zh: '右心房', wall: 'Right atrium', auricle: 'Right auricle', openings: ['Superior vena cava', 'Inferior vena cava', 'Coronary sinus'], look: [-.8, .14, .62], inside: ['Crista terminalis', 'Pectinate muscles', 'Interatrial septum', 'Fossa ovalis', 'Right auricle', 'Left auricle'], items: RA_ITEMS},
  {id: 'rv', en: 'Right ventricle', zh: '右心室', wall: 'Right ventricle', look: [.04, .22, 1], inside: [...RV_VALVE_CUSPS, 'Chordae tendineae of tricuspid valve', 'Anterior papillary muscle of right ventricle', 'Posterior papillary muscle of right ventricle', 'Septal papillary muscle of right ventricle', ...PULMONARY_CUSPS, 'Interventricular septum', 'Trabeculae carneae of right ventricle', 'Septomarginal trabecula (moderator band)', 'Supraventricular crest', 'Conus arteriosus'],
    items: [
      {en: 'Anterior cusp of the tricuspid valve', zh: '三尖瓣前瓣', parts: ['Anterior cusp of tricuspid valve'], zhDesc: '三尖瓣最大的一片瓣葉，位於前方。', enDesc: 'The largest cusp of the tricuspid valve, lying anteriorly.'},
      {en: 'Posterior (inferior) cusp of the tricuspid valve', zh: '三尖瓣後瓣', parts: ['Posterior cusp of tricuspid valve'], zhDesc: '三尖瓣位於後下方的瓣葉（下瓣）。', enDesc: 'The cusp of the tricuspid valve lying posteroinferiorly.'},
      {en: 'Septal cusp of the tricuspid valve', zh: '三尖瓣中隔瓣', parts: ['Septal cusp of tricuspid valve'], zhDesc: '三尖瓣貼近室間隔的瓣葉。', enDesc: 'The cusp of the tricuspid valve next to the interventricular septum.'},
      {en: 'Anterior papillary muscle', zh: '前乳突肌', parts: ['Anterior papillary muscle of right ventricle'], zhDesc: '右心室最大的乳突肌，起自前壁，腱索連接三尖瓣前瓣與後瓣。', enDesc: 'The largest papillary muscle of the right ventricle; it arises from the anterior wall and its chordae go to the anterior and posterior cusps.'},
      {en: 'Posterior (inferior) papillary muscle', zh: '後乳突肌', parts: ['Posterior papillary muscle of right ventricle'], zhDesc: '起自右心室下（後）壁，腱索連接三尖瓣後瓣與中隔瓣。', enDesc: 'Arises from the inferior (posterior) wall of the right ventricle; its chordae go to the posterior and septal cusps.'},
      {en: 'Septal papillary muscle', zh: '中隔乳突肌', parts: ['Septal papillary muscle of right ventricle'], zhDesc: '細小，直接起自室間隔，腱索連接三尖瓣前瓣與中隔瓣。', enDesc: 'Small; arises directly from the interventricular septum and its chordae go to the anterior and septal cusps.'},
      {en: 'Chordae tendineae', zh: '腱索', parts: ['Chordae tendineae of tricuspid valve'], zhDesc: '連接三尖瓣瓣葉與乳突肌的纖維索：由乳突肌頂端先分成較粗的主幹，再分出較細的分支，附著在瓣葉游離緣與心室面，防止收縮時瓣葉翻入右心房。' + MJ, enDesc: 'Fibrous cords between the tricuspid cusps and the papillary muscles: thicker stems from the papillary tips branch into finer cords that attach to the free margin and ventricular surface of the cusps and keep them from prolapsing into the right atrium.' + MJ_EN},
      {en: 'Trabeculae carneae', zh: '肉柱', parts: ['Trabeculae carneae of right ventricle'], zhDesc: '右心室內壁粗大而不規則的肌肉隆起，分為嵴狀、橋狀與乳突肌三型。' + MJ, enDesc: 'Coarse, irregular muscular ridges on the inner wall of the right ventricle: ridges, bridges and papillary muscles.' + MJ_EN},
      {en: 'Septomarginal trabecula (moderator band)', zh: '節制索', parts: ['Septomarginal trabecula (moderator band)'], zhDesc: '由室間隔下部橫過右心室腔，連到前乳突肌基部的肌肉柱，內有右束支通過。' + MJ, enDesc: 'A muscular band from the lower interventricular septum across the right ventricle to the base of the anterior papillary muscle; it carries the right bundle branch.' + MJ_EN},
      {en: 'Supraventricular crest', zh: '室上嵴', parts: ['Supraventricular crest'], zhDesc: '位於右房室口與肺動脈口之間的弓形肌嵴，分隔粗糙的流入部與平滑的動脈圓錐。' + MJ, enDesc: 'The arched muscular ridge between the tricuspid and pulmonary orifices that separates the rough inflow part from the smooth conus arteriosus.' + MJ_EN},
      {en: 'Conus arteriosus (infundibulum)', zh: '動脈圓錐', parts: ['Conus arteriosus'], zhDesc: '右心室通往肺動脈口的光滑漏斗狀流出道。' + MJ, enDesc: 'The smooth, funnel-shaped outflow tract of the right ventricle leading to the pulmonary orifice.' + MJ_EN},
      {en: 'Pulmonary valve', zh: '肺動脈瓣', parts: PULMONARY_CUSPS, zhDesc: '位於肺動脈口的三片半月瓣（前、左、右半月瓣），防止血液由肺動脈幹倒流。', enDesc: 'Three semilunar cusps (anterior, left and right) at the pulmonary orifice that stop blood flowing back from the pulmonary trunk.'},
      {en: 'Interventricular septum', zh: '室間隔', parts: ['Interventricular septum'], zhDesc: '分隔左、右心室的厚壁，大部分為肌部，靠近主動脈瓣下的一小塊為膜部。' + MJ, enDesc: 'The thick wall between the ventricles, mostly muscular; a small membranous part lies just below the aortic valve.' + MJ_EN},
    ]},
  {id: 'la', en: 'Left atrium', zh: '左心房', wall: 'Left atrium', auricle: 'Left auricle', cutDepth: .3, openings: ['Left superior pulmonary vein', 'Left inferior pulmonary vein', 'Right superior pulmonary vein', 'Right inferior pulmonary vein'], look: [.08, .22, -1], inside: ['Left auricle', 'Interatrial septum'],
    items: [
      ...PV_ITEMS,
      {en: 'Left auricle', zh: '左心耳', parts: ['Left auricle'], zhDesc: '左心房向前突出的手指狀（鉤狀）小囊，沿肺動脈幹左側貼附，邊緣有淺缺口，內壁有梳狀肌；心房顫動時血栓好發於此。' + MJ, enDesc: 'The finger- or hook-shaped pouch projecting forward from the left atrium along the left side of the pulmonary trunk, with a notched margin; thrombus forms here in atrial fibrillation.' + MJ_EN},
      {en: 'Interatrial septum', zh: '心房中隔', parts: ['Interatrial septum'], zhDesc: '分隔左、右心房的薄壁。' + MJ, enDesc: 'The thin wall between the right and left atria.' + MJ_EN},
      noModel('Valve of the foramen ovale (remnant)', '卵圓瓣痕跡', '位於心房中隔左側，是胎兒卵圓孔瓣閉合後的痕跡；兩側未癒合時形成卵圓孔未閉。', 'On the left side of the interatrial septum, the remnant of the valve of the foramen ovale; if it does not fuse, a patent foramen ovale results.'),
    ]},
  {id: 'lv', en: 'Left ventricle', zh: '左心室', wall: 'Left ventricle', look: [.85, .12, .55], inside: [...LV_VALVE_CUSPS, 'Chordae tendineae of bicuspid valve', 'Anterolateral papillary muscle of left ventricle', 'Posterior papillary muscle of left ventricle', ...AORTIC_CUSPS, 'Interventricular septum', 'Trabeculae carneae of left ventricle', 'Aortic vestibule'],
    items: [
      {en: 'Anterior cusp of the bicuspid valve', zh: '二尖瓣前瓣', parts: ['Anterior cusp of bicuspid valve'], zhDesc: '二尖瓣較大的前瓣，位於主動脈前庭旁。', enDesc: 'The larger, anterior cusp of the bicuspid (mitral) valve beside the aortic vestibule.'},
      {en: 'Posterior cusp of the bicuspid valve', zh: '二尖瓣後瓣', parts: ['Posterior cusp of bicuspid valve'], zhDesc: '二尖瓣較小的後瓣，沿房室口後緣附著。', enDesc: 'The smaller, posterior cusp of the bicuspid (mitral) valve, attached along the back of the atrioventricular orifice.'},
      {en: 'Anterior (anterolateral) papillary muscle', zh: '前乳突肌', parts: ['Anterolateral papillary muscle of left ventricle'], zhDesc: '起自左心室前外側壁，腱索連接二尖瓣前瓣與後瓣的外側半。', enDesc: 'Arises from the anterolateral wall of the left ventricle; its chordae go to the lateral halves of both bicuspid-valve cusps.'},
      {en: 'Posterior papillary muscle', zh: '後乳突肌', parts: ['Posterior papillary muscle of left ventricle'], zhDesc: '起自左心室後下壁，腱索連接二尖瓣前瓣與後瓣的內側半。', enDesc: 'Arises from the posteroinferior wall of the left ventricle; its chordae go to the medial halves of both bicuspid-valve cusps.'},
      {en: 'Chordae tendineae', zh: '腱索', parts: ['Chordae tendineae of bicuspid valve'], zhDesc: '連接二尖瓣瓣葉與乳突肌的纖維索：由乳突肌頂端先分成較粗的主幹，再分出較細的分支，附著在瓣葉游離緣與心室面，防止收縮時瓣葉翻入左心房。' + MJ, enDesc: 'Fibrous cords between the bicuspid-valve cusps and the papillary muscles: thicker stems from the papillary tips branch into finer cords that attach to the free margin and ventricular surface of the cusps and keep them from prolapsing into the left atrium.' + MJ_EN},
      {en: 'Trabeculae carneae', zh: '肉柱', parts: ['Trabeculae carneae of left ventricle'], zhDesc: '左心室內壁的肌肉隆起，比右心室細密；左心室壁約為右心室的三倍厚。' + MJ, enDesc: 'The muscular ridges of the left ventricular wall, finer and denser than on the right; the left ventricular wall is about three times as thick as the right.' + MJ_EN},
      {en: 'Aortic vestibule', zh: '主動脈前庭', parts: ['Aortic vestibule'], zhDesc: '二尖瓣前瓣與室間隔之間、通往主動脈口的光滑流出道。' + MJ, enDesc: 'The smooth outflow part of the left ventricle between the anterior bicuspid-valve cusp and the septum, leading to the aortic orifice.' + MJ_EN},
      {en: 'Aortic valve', zh: '主動脈瓣', parts: AORTIC_CUSPS, zhDesc: '位於主動脈口的三片半月瓣（右冠狀瓣、左冠狀瓣、無冠狀瓣），左、右冠狀動脈分別由對應的主動脈竇發出。', enDesc: 'Three semilunar cusps (right coronary, left coronary and non-coronary) at the aortic orifice; the coronary arteries arise from the corresponding aortic sinuses.'},
      {en: 'Right coronary cusp of the aortic valve', zh: '主動脈瓣右冠狀瓣', parts: ['Right coronary cusp of aortic valve'], zhDesc: '主動脈瓣的右冠狀瓣，其上方的主動脈竇發出右冠狀動脈。', enDesc: 'The right coronary cusp of the aortic valve; the right coronary artery arises from the sinus above it.'},
      {en: 'Left coronary cusp of the aortic valve', zh: '主動脈瓣左冠狀瓣', parts: ['Left coronary cusp of aortic valve'], zhDesc: '主動脈瓣的左冠狀瓣，其上方的主動脈竇發出左冠狀動脈。', enDesc: 'The left coronary cusp of the aortic valve; the left coronary artery arises from the sinus above it.'},
      {en: 'Non-coronary cusp of the aortic valve', zh: '主動脈瓣無冠狀瓣', parts: ['Non-coronary cusp of aortic valve'], zhDesc: '主動脈瓣的無冠狀瓣，其上方的主動脈竇沒有冠狀動脈發出。', enDesc: 'The non-coronary cusp of the aortic valve; no coronary artery arises from the sinus above it.'},
      {en: 'Interventricular septum', zh: '室間隔', parts: ['Interventricular septum'], zhDesc: '分隔左、右心室的厚壁，左心室側較平滑。' + MJ, enDesc: 'The thick wall between the ventricles; its left ventricular side is smoother.' + MJ_EN},
    ]},
];

/** Camera direction for a chamber: the closest named view the viewer already understands (the exact direction is `look`: right atrium from the right-anterolateral side, right ventricle from the front, left atrium from behind, left ventricle from the left-anterolateral side). */
export const chamberView = (chamber: Chamber): HeartView => chamber.id === 'la' ? 'back' : chamber.id === 'lv' ? 'left' : chamber.id === 'ra' ? 'right' : 'front';
