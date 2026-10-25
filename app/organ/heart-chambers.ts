import type {HeartView} from './heart-types';

/** One structure inside a chamber. `parts` are catalogue part names that are drawn for it; with none, the source models have no mesh for it. */
export interface ChamberItem {en: string; zh: string; parts: string[]; zhDesc: string; enDesc: string}
export interface Chamber {
  id: 'ra' | 'rv' | 'la' | 'lv';
  en: string; zh: string;
  /** catalogue part whose wall is removed (drawn almost transparent) when the chamber is opened */
  wall: string;
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

export const CHAMBERS: Chamber[] = [
  {id: 'ra', en: 'Right atrium', zh: '右心房', wall: 'Right atrium', look: [-1, .15, .45], inside: [],
    items: [
      {en: 'Pectinate muscles', zh: '梳狀肌', parts: [], zhDesc: '右心房前壁與右心耳內的平行肌嵴，使這部分內壁呈梳齒狀。', enDesc: 'Parallel muscular ridges on the anterior wall of the right atrium and inside the right auricle, giving the wall a comb-like look.'},
      {en: 'Crista terminalis', zh: '界嵴', parts: [], zhDesc: '右心房內壁的垂直肌嵴，分隔光滑的腔靜脈竇與有梳狀肌的固有心房；對應外表的界溝。', enDesc: 'A vertical muscular ridge inside the right atrium that separates the smooth sinus venarum from the pectinate part; it matches the sulcus terminalis outside.'},
      {en: 'Fossa ovalis', zh: '卵圓窩', parts: [], zhDesc: '心房中隔右側的淺凹，是胎兒期卵圓孔閉合後的痕跡。', enDesc: 'A shallow depression on the right side of the interatrial septum, the remnant of the foramen ovale of the fetus.'},
      {en: 'Opening of the superior vena cava', zh: '上腔靜脈開口', parts: ['Superior vena cava'], zhDesc: '上腔靜脈開口於右心房的上部，開口處沒有瓣膜。', enDesc: 'The superior vena cava opens into the upper part of the right atrium; its opening has no valve.'},
      {en: 'Opening of the inferior vena cava', zh: '下腔靜脈開口', parts: ['Inferior vena cava'], zhDesc: '下腔靜脈開口於右心房的下部，邊緣有不完整的下腔靜脈瓣。', enDesc: 'The inferior vena cava opens into the lower part of the right atrium; its edge carries the incomplete valve of the inferior vena cava.'},
      {en: 'Opening of the coronary sinus', zh: '冠狀竇開口', parts: ['Coronary sinus'], zhDesc: '冠狀竇開口於下腔靜脈開口與右房室口之間，收集心臟本身的靜脈血。', enDesc: 'The coronary sinus opens between the opening of the inferior vena cava and the right atrioventricular orifice and drains the veins of the heart.'},
      {en: 'Right auricle', zh: '右心耳', parts: [], zhDesc: '右心房向前突出的三角形小囊，覆蓋升主動脈根部，內壁有梳狀肌。', enDesc: 'The triangular pouch projecting forward from the right atrium over the root of the ascending aorta; its inner wall carries pectinate muscles.'},
    ]},
  {id: 'rv', en: 'Right ventricle', zh: '右心室', wall: 'Right ventricle', look: [-.35, .15, 1], inside: [
      'Anterior leaflet of right atrioventricular valve', 'Inferior leaflet of right atrioventricular valve', 'Septal leaflet of right atrioventricular valve',
      'Anterior papillary muscle of right ventricle', 'Inferior papillary muscle of right ventricle', 'Septal papillary muscle of right ventricle',
      'Anterior semilunar cusp of pulmonary valve', 'Left semilunar cusp of pulmonary valve', 'Right semilunar cusp of pulmonary valve'],
    items: [
      {en: 'Anterior leaflet of the tricuspid valve', zh: '三尖瓣前尖', parts: ['Anterior leaflet of right atrioventricular valve'], zhDesc: '三尖瓣最大的一片瓣葉，位於前方。', enDesc: 'The largest leaflet of the tricuspid valve, lying anteriorly.'},
      {en: 'Posterior (inferior) leaflet of the tricuspid valve', zh: '三尖瓣後尖（下尖）', parts: ['Inferior leaflet of right atrioventricular valve'], zhDesc: '三尖瓣位於後下方的瓣葉。', enDesc: 'The leaflet of the tricuspid valve lying posteroinferiorly.'},
      {en: 'Septal leaflet of the tricuspid valve', zh: '三尖瓣隔側尖', parts: ['Septal leaflet of right atrioventricular valve'], zhDesc: '三尖瓣貼近室間隔的瓣葉。', enDesc: 'The leaflet of the tricuspid valve next to the interventricular septum.'},
      {en: 'Anterior papillary muscle', zh: '前乳頭肌', parts: ['Anterior papillary muscle of right ventricle'], zhDesc: '右心室最大的乳頭肌，起自前壁，腱索連接三尖瓣前尖與後尖。', enDesc: 'The largest papillary muscle of the right ventricle; it arises from the anterior wall and its chordae go to the anterior and posterior leaflets.'},
      {en: 'Posterior (inferior) papillary muscle', zh: '後乳頭肌（下乳頭肌）', parts: ['Inferior papillary muscle of right ventricle'], zhDesc: '起自右心室下壁，腱索連接三尖瓣後尖與隔側尖。', enDesc: 'Arises from the inferior wall of the right ventricle; its chordae go to the posterior and septal leaflets.'},
      {en: 'Septal papillary muscle', zh: '中隔乳頭肌', parts: ['Septal papillary muscle of right ventricle'], zhDesc: '起自室間隔，較小，腱索連接三尖瓣前尖與隔側尖。', enDesc: 'Small; arises from the interventricular septum and its chordae go to the anterior and septal leaflets.'},
      {en: 'Chordae tendineae', zh: '腱索', parts: ['Anterior leaflet of right atrioventricular valve', 'Inferior leaflet of right atrioventricular valve', 'Septal leaflet of right atrioventricular valve'], zhDesc: '連接瓣葉與乳頭肌的纖維索，防止收縮時瓣葉翻入心房。在本模型中與瓣葉合為一體，無法單獨選取，點選時會高亮整個三尖瓣。', enDesc: 'Fibrous cords between the leaflets and the papillary muscles that keep the leaflets from prolapsing into the atrium. In this model they are part of the valve meshes and cannot be picked alone; the whole tricuspid valve is highlighted.'},
      {en: 'Trabeculae carneae', zh: '肉柱', parts: [], zhDesc: '右心室內壁凹凸不平的肌肉隆起，分為嵴狀、橋狀與乳頭肌三型。', enDesc: 'The irregular muscular ridges of the inner ventricular wall: ridges, bridges and papillary muscles.'},
      {en: 'Septomarginal trabecula (moderator band)', zh: '節制索', parts: [], zhDesc: '由室間隔橫過右心室腔到前乳頭肌基部的肌束，內有右束支通過。', enDesc: 'A muscular band from the interventricular septum across the right ventricle to the base of the anterior papillary muscle; it carries the right bundle branch.'},
      {en: 'Supraventricular crest', zh: '室上嵴', parts: [], zhDesc: '位於右房室口與肺動脈口之間的肌嵴，分隔流入道與流出道。', enDesc: 'The muscular ridge between the tricuspid and pulmonary orifices that separates the inflow from the outflow tract.'},
      {en: 'Conus arteriosus (infundibulum)', zh: '動脈圓錐', parts: [], zhDesc: '右心室通往肺動脈口的光滑漏斗狀流出道。', enDesc: 'The smooth, funnel-shaped outflow tract of the right ventricle leading to the pulmonary orifice.'},
      {en: 'Pulmonary valve', zh: '肺動脈瓣', parts: ['Anterior semilunar cusp of pulmonary valve', 'Left semilunar cusp of pulmonary valve', 'Right semilunar cusp of pulmonary valve'], zhDesc: '位於肺動脈口的三片半月瓣（前、左、右半月瓣），防止血液由肺動脈幹倒流。', enDesc: 'Three semilunar cusps (anterior, left and right) at the pulmonary orifice that stop blood flowing back from the pulmonary trunk.'},
    ]},
  {id: 'la', en: 'Left atrium', zh: '左心房', wall: 'Left atrium', look: [.2, .35, -1], inside: [],
    items: [
      ...Object.values(PV).map(([part, zh, en, zhDesc]) => ({en, zh, parts: [part], zhDesc, enDesc: `${en} into the posterior wall of the left atrium.`})),
      {en: 'Left auricle', zh: '左心耳', parts: [], zhDesc: '左心房向前突出的細長小囊，位於肺動脈幹左側，內壁有梳狀肌；是心房顫動時血栓好發處。', enDesc: 'The narrow pouch projecting forward from the left atrium beside the pulmonary trunk; its wall has pectinate muscles and it is a common site of thrombus in atrial fibrillation.'},
      {en: 'Valve of the foramen ovale (remnant)', zh: '卵圓瓣痕跡', parts: [], zhDesc: '位於心房中隔左側，是胎兒卵圓孔瓣閉合後的痕跡；兩側未癒合時形成卵圓孔未閉。', enDesc: 'On the left side of the interatrial septum, the remnant of the valve of the foramen ovale; if it does not fuse, a patent foramen ovale results.'},
    ]},
  {id: 'lv', en: 'Left ventricle', zh: '左心室', wall: 'Left ventricle', look: [1, .15, .55], inside: [
      'Anterior leaflet of left atrioventricular valve', 'Posterior leaflet of left atrioventricular valve',
      'Anterolateral papillary muscle of left ventricle', 'Inferior papillary muscle of left ventricle',
      'Left coronary leaflet of aortic valve', 'Right coronary leaflet of aortic valve', 'Non-coronary leaflet of aortic valve'],
    items: [
      {en: 'Anterior leaflet of the mitral valve', zh: '二尖瓣前瓣', parts: ['Anterior leaflet of left atrioventricular valve'], zhDesc: '二尖瓣較大的前瓣，位於主動脈前庭旁。', enDesc: 'The larger, anterior leaflet of the mitral valve beside the aortic vestibule.'},
      {en: 'Posterior leaflet of the mitral valve', zh: '二尖瓣後瓣', parts: ['Posterior leaflet of left atrioventricular valve'], zhDesc: '二尖瓣較小的後瓣，沿房室口後緣附著。', enDesc: 'The smaller, posterior leaflet of the mitral valve, attached along the back of the atrioventricular orifice.'},
      {en: 'Anterior (anterolateral) papillary muscle', zh: '前乳頭肌（前外側乳頭肌）', parts: ['Anterolateral papillary muscle of left ventricle'], zhDesc: '起自左心室前外側壁，腱索連接二尖瓣前瓣與後瓣的外側半。', enDesc: 'Arises from the anterolateral wall of the left ventricle; its chordae go to the lateral halves of both mitral leaflets.'},
      {en: 'Posterior (posteromedial) papillary muscle', zh: '後乳頭肌（後內側乳頭肌）', parts: ['Inferior papillary muscle of left ventricle'], zhDesc: '起自左心室後下壁，腱索連接二尖瓣前瓣與後瓣的內側半。', enDesc: 'Arises from the posteroinferior wall of the left ventricle; its chordae go to the medial halves of both mitral leaflets.'},
      {en: 'Chordae tendineae', zh: '腱索', parts: ['Anterior leaflet of left atrioventricular valve', 'Posterior leaflet of left atrioventricular valve'], zhDesc: '連接二尖瓣瓣葉與乳頭肌的纖維索。在本模型中與瓣葉合為一體，無法單獨選取，點選時會高亮整個二尖瓣。', enDesc: 'Fibrous cords between the mitral leaflets and the papillary muscles. In this model they are part of the valve meshes and cannot be picked alone; the whole mitral valve is highlighted.'},
      {en: 'Trabeculae carneae', zh: '肉柱', parts: [], zhDesc: '左心室內壁細密的肌肉隆起，比右心室更細緻；流出道部分的室壁則較光滑。', enDesc: 'The fine muscular ridges of the left ventricular wall, finer than on the right; the outflow part of the wall is smooth.'},
      {en: 'Aortic vestibule', zh: '主動脈前庭', parts: [], zhDesc: '二尖瓣前瓣與室間隔之間通往主動脈口的光滑流出道。', enDesc: 'The smooth outflow part of the left ventricle between the anterior mitral leaflet and the septum, leading to the aortic orifice.'},
      {en: 'Aortic valve', zh: '主動脈瓣', parts: ['Left coronary leaflet of aortic valve', 'Right coronary leaflet of aortic valve', 'Non-coronary leaflet of aortic valve'], zhDesc: '位於主動脈口的三片半月瓣（左冠狀瓣、右冠狀瓣、無冠瓣），左、右冠狀動脈分別由對應的主動脈竇發出。', enDesc: 'Three semilunar cusps (left coronary, right coronary and non-coronary) at the aortic orifice; the coronary arteries arise from the corresponding aortic sinuses.'},
    ]},
];

/** Camera direction for a chamber, as the closest named view the viewer already understands is not enough: the viewer takes an explicit direction. */
export const chamberView = (chamber: Chamber): HeartView => chamber.id === 'la' ? 'back' : chamber.id === 'lv' ? 'left' : chamber.id === 'ra' ? 'right' : 'front';
