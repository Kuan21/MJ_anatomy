import type {OrganId} from '../organ/organ-ids';
import type {QuizRegionDef, QuizSectionDef} from './catalogue';

/**
 * Quiz → Organs → one entry per organ detail mode (app/organ/organs/<organ>.ts): the pool is the organ's own structures (meshes and surface markings), built by scripts/prepare-quiz.mjs
 * from public/models/organ/<organ>/. Sections follow the groups of the detail mode. Layers, cards and mock-exam use are shared with the other regions.
 */
const WIDE: [number, number] = [0, 2];
const section = (id: string, label: string, english: string): QuizSectionDef => ({id, label, english, range: WIDE});
interface OrganQuiz {label: string; english: string; tag: string; blurb: string; scope: string; frame: QuizRegionDef['frame']; sections: QuizSectionDef[]}
export const ORGAN_QUIZ: Record<OrganId, OrganQuiz> = {
  stomach: {
    label: '胃', english: 'Stomach', tag: '胃篇', blurb: '胃的分區（賁門、胃底、胃體、幽門竇、幽門管）、大小彎、胃角切跡、幽門括約肌、相連的食道與十二指腸，以及胃的動脈、靜脈（含門靜脈屬支）與神經',
    scope: '採用胃詳細模型（解剖姿勢，由前方觀看）。胃的分區與彎、切跡、括約肌都是標示在同一個胃模型表面上的位置，邊界為示意；胃短動脈與靜脈、胃後動脈與靜脈、前迷走神經幹、胃前支、腹腔神經叢是依一般描述畫成的示意管。問血管與神經時，胃壁與相鄰器官會變成半透明；肌層、皺襞、胃管與淋巴結沒有模型，不出題。',
    frame: {x: .13, z: [-.04, .11]},
    sections: [section('all', '全部胃', 'Stomach'), section('zones', '胃的分區', 'Regions of the stomach'), section('lines', '彎、切跡與括約肌', 'Curvatures, notches and sphincter'), section('arteries', '動脈', 'Arteries'), section('veins', '靜脈（含門靜脈屬支）', 'Veins and portal tributaries'), section('nerves', '神經', 'Nerves'), section('context', '相連的消化管', 'Neighbouring parts of the gut tube')],
  },
  'duodenum-pancreas-spleen': {
    label: '十二指腸、胰、脾', english: 'Duodenum, pancreas and spleen', tag: '十二指腸胰脾篇',
    blurb: '十二指腸四部與乳突、胰的頭頸體尾與鉤突、胰管與膽管、脾的各面與脾門，以及它們的動脈、靜脈（含門靜脈屬支）與神經',
    scope: '採用十二指腸、胰與脾的詳細模型（解剖姿勢，由前方觀看）。各部分與各面都是標示在同一個器官模型表面上的位置，邊界為示意；肝胰壺腹、副胰管、上十二指腸動脈、十二指腸懸韌帶與腹腔叢、上腸繫膜叢是依一般描述畫成的示意管或示意帶。',
    frame: {x: .13, z: [-.04, .11]},
    sections: [section('all', '全部', 'All'), section('zones', '各部分與各面', 'Parts and surfaces'), section('marks', '乳突、彎曲與脾門', 'Papillae, flexure and hilum'), section('ducts', '膽管與胰管', 'Bile and pancreatic ducts'), section('arteries', '動脈', 'Arteries'), section('veins', '靜脈（含門靜脈屬支）', 'Veins and portal tributaries'), section('nerves', '神經', 'Nerves'), section('muscles', '相關肌肉與韌帶', 'Related muscles and ligaments')],
  },
};
export const organQuizRegion = (id: OrganId): QuizRegionDef => {
  const o = ORGAN_QUIZ[id];
  return {id, label: o.label, english: o.english, tag: o.tag, file: `quiz-${id}.json`, hash: `#/quiz/${id}`, atlasHash: `#/organ/${id}`,
    headline: ['看名稱，', '點出位置。'], description: [`在 3D ${o.label}模型上練習辨認：${o.blurb}。`, '每答一題，立即顯示正確位置與資料卡。'],
    scope: o.scope, defaultView: 'front', defaultSide: 'both', systems: ['viscera', 'arterial', 'venous', 'nervous'], frame: o.frame, sections: o.sections};
};

/** While a vessel or nerve of an organ is the question, the organ's own structures (wall markings, neighbouring organs) are drawn as faint glass so the target is in view. */
export const coversOrganTarget = (target: {system: string} | undefined, other: {system: string}): boolean => !!target && target.system !== 'viscera' && other.system === 'viscera';
