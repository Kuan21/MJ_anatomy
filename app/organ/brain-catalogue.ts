import {zhAnatomy} from '../mj-zh-anatomy';
import {namingOverride} from '../mj-naming';
import type {BrainGroup, BrainPart} from './brain-types';

/** Level-1 groups of the right-hand list, from the superficial layer to the deepest (the order of "Peel deeper"). */
export const BRAIN_GROUPS: BrainGroup[] = [
  {id: 'meninges', en: 'Meninges & dural reflections', zh: '腦膜與硬腦膜反摺', layer: 0, on: false},
  {id: 'frontal', en: 'Frontal lobe', zh: '額葉', layer: 1, on: true},
  {id: 'parietal', en: 'Parietal lobe', zh: '頂葉', layer: 1, on: true},
  {id: 'temporal', en: 'Temporal lobe', zh: '顳葉', layer: 1, on: true},
  {id: 'occipital', en: 'Occipital lobe', zh: '枕葉', layer: 1, on: true},
  {id: 'limbic', en: 'Limbic lobe', zh: '邊緣葉', layer: 1, on: true},
  {id: 'insula', en: 'Insula', zh: '腦島', layer: 1, on: true},
  {id: 'cortex-other', en: 'Other cortical surface', zh: '其他皮質表面', layer: 1, on: true},
  {id: 'cerebellum', en: 'Cerebellum', zh: '小腦', layer: 1, on: true},
  {id: 'brainstem', en: 'Brainstem', zh: '腦幹', layer: 2, on: true},
  {id: 'white', en: 'White-matter tracts & commissures', zh: '白質纖維束與連合', layer: 3, on: false},
  {id: 'basal', en: 'Basal nuclei & deep grey matter', zh: '基底核與深部灰質', layer: 4, on: false},
  {id: 'diencephalon', en: 'Diencephalon', zh: '間腦', layer: 5, on: false},
  {id: 'ventricles', en: 'Ventricles & choroid plexus', zh: '腦室與脈絡叢', layer: 6, on: false},
  {id: 'cranial', en: 'Cranial nerves (roots)', zh: '腦神經（根部）', layer: -1, on: false},
  {id: 'arteries', en: 'Cerebral arteries (incl. circle of Willis)', zh: '腦動脈（含 Willis 環）', layer: -1, on: false},
  {id: 'veins', en: 'Venous sinuses & veins', zh: '靜脈竇與靜脈', layer: -1, on: false},
];

/** Parts that belong to the spine or the body, not to the brain: left out so nothing hangs below the brainstem. */
const NOT_BRAIN = /\bspinal artery\b|\bspinal cord\b|^vertebral artery/i;

export const cleanBrainName = (node: string) => node.trim().replace(/\.(?:l|r)(?:\.\d+)?$/i, '').replace(/[. ]0\d\d$/, '').replace(/\*/g, '').replace(/\s+/g, ' ').trim();

export function groupOf(cat: string, region: string): string {
  switch (cat) {
    case 'meninges_dura': return 'meninges';
    case 'veins_sinuses': return 'veins';
    case 'arteries': return 'arteries';
    case 'cranial_nerves': return 'cranial';
    case 'cerebellum': return 'cerebellum';
    case 'brainstem': return 'brainstem';
    case 'diencephalon': return 'diencephalon';
    case 'ventricles': return 'ventricles';
    case 'white_matter': case 'tracts': return 'white';
    case 'deep_grey': return region === 'Diencephalon' ? 'diencephalon' : region === 'Mesencephalon' ? 'brainstem' : 'basal';
    case 'cortex':
      if (/frontal/i.test(region)) return 'frontal';
      if (/parietal/i.test(region)) return 'parietal';
      if (/temporal/i.test(region)) return 'temporal';
      if (/occipital/i.test(region)) return 'occipital';
      if (/limbic/i.test(region)) return 'limbic';
      if (/insula/i.test(region)) return 'insula';
      return 'cortex-other';
    default: return 'cortex-other';
  }
}

const SIDE_ZH = {left: '左', right: '右', mid: ''} as const;
const SIDE_EN = {left: 'Left ', right: 'Right ', mid: ''} as const;
/** Chinese names the shared glossary lacks for a few labels of this model. */
const ZH_EXTRA: Record<string, string> = {
  'nucleus of oculomotor nerve': '動眼神經核', 'accessory nucleus of oculomotor nerve': '動眼神經副核（Edinger-Westphal 核）',
  'maxillary nerve': '上頷神經', 'meningeal branch of maxillary nerve': '上頷神經腦膜支', 'ophthalmic nerve': '眼神經',
  'insula (subcentral gyrus and ant. and post. sulci)': '腦島（中央下迴與前、後腦島溝）',
  'lat fis-post': '外側溝（後支）', 'lat fis-ant-vertical': '外側溝（前升支）', 'lat fis-ant-horizont': '外側溝（前水平支）', 'sulcus interm prim-jensen': '中間初級溝（Jensen 溝）',
};
const brainZh = (zh: string, en: string) => /ventric/i.test(en) ? zh.replace(/心室/g, '腦室') : zh;
export const zhOfBrain = (en: string): string => ZH_EXTRA[en.toLowerCase()] ?? brainZh(namingOverride(en) ?? zhAnatomy(en)?.zh ?? '', en);

/** The model files nine sulci under "Telencephalon" without a lobe; each goes to the lobe it mainly belongs to (the card of the structure names the neighbouring lobes). */
const SULCUS_LOBE: Record<string, string> = {
  'central sulcus': 'frontal', 'parieto-occipital sulcus': 'occipital', 'subparietal sulcus': 'parietal', 'circular sulcus of insula': 'insula', 'collateral sulcus': 'temporal',
  'anterior occipital sulcus': 'occipital', 'lat fis-post': 'temporal', 'posterior transverse collateral sulcus': 'occipital', 'sulcus interm prim-jensen': 'parietal',
};
/** English names the model abbreviates: shown in full, while the model's own name stays the key for the information cards. */
const RENAME: Record<string, string> = {
  'Lat Fis-post': 'Lateral sulcus (posterior ramus)', 'Lat Fis-ant-Vertical': 'Lateral sulcus (anterior ascending ramus)', 'Lat Fis-ant-Horizont': 'Lateral sulcus (anterior horizontal ramus)',
  'Sulcus interm prim-Jensen': 'Intermediate primary sulcus (of Jensen)',
};
const SULCUS = /sulcus|sulci|fissure|lat fis/i, LOBES = new Set(['frontal', 'parietal', 'temporal', 'occipital', 'limbic', 'insula']);
export const lobeSub = (en: string): 'gyri' | 'sulci' => SULCUS.test(en) && !/gyrus|gyri/i.test(en) ? 'sulci' : 'gyri';

export interface RawBrainNode {name: string; cat: string; region: string; label: string; side: string}
export function describeBrainNode(raw: RawBrainNode, index: number): BrainPart | null {
  const en0 = (raw.label || cleanBrainName(raw.name)).replace(/\*/g, '').replace(/\s+/g, ' ').trim(), en = en0;
  if (NOT_BRAIN.test(en)) return null;
  const side = raw.side === 'left' ? 'left' : raw.side === 'right' ? 'right' : (/\.l(?:\.\d+)?$/i.test(raw.name) ? 'left' : /\.r(?:\.\d+)?$/i.test(raw.name) ? 'right' : 'mid');
  let group = groupOf(raw.cat, raw.region); if (group === 'cortex-other') group = SULCUS_LOBE[en0.toLowerCase()] ?? group;
  const layer = BRAIN_GROUPS.find(g => g.id === group)!.layer;
  const zh = zhOfBrain(en);
  return {id: `b${index}`, en, zh: zh ? SIDE_ZH[side] + zh : '', side, cat: raw.cat, region: raw.region, group, layer, ...(LOBES.has(group) ? {sub: lobeSub(en)} : {})};
}
export const displayEn = (p: BrainPart) => SIDE_EN[p.side] + (RENAME[p.en] ?? p.en);

/** The nested list of the left panel: lobes (each with gyri, then sulci and fissures), then the other main regions. Every structure sits in exactly one leaf. */
export interface BrainTreeNode {id: string; en: string; zh: string; /** structures of this node's own, when it is a leaf */ leaf: BrainPart[]; children: BrainTreeNode[]; /** every structure below this node */ all: BrainPart[]}
const LOBE_NODES: [string, string, string][] = [['frontal', 'Frontal lobe', '額葉'], ['parietal', 'Parietal lobe', '頂葉'], ['temporal', 'Temporal lobe', '顳葉'], ['occipital', 'Occipital lobe', '枕葉'], ['limbic', 'Limbic lobe', '邊緣葉'], ['insula', 'Insula', '腦島']];
const MIDBRAIN = /midbrain|colliculus|red nucleus|oculomotor|aqueduct|interpeduncular|substantia nigra|trochlear/i, PONS = /\bpons\b|abducens|facial|vestibular|salivatory|trigeminal/i, MEDULLA = /medulla|olive|pyramid|hypoglossal|vagus|ambiguus|solitary|cuneate|gracile/i;
export function buildBrainTree(parts: BrainPart[]): BrainTreeNode[] {
  const node = (id: string, en: string, zh: string, leaf: BrainPart[] = [], children: BrainTreeNode[] = []): BrainTreeNode => ({id, en, zh, leaf, children, all: [...leaf, ...children.flatMap(c => c.all)]});
  const inGroup = (g: string) => parts.filter(p => p.group === g);
  const byName = (list: BrainPart[]) => [...list].sort((a, b) => a.en.localeCompare(b.en) || a.side.localeCompare(b.side));
  const lobes = LOBE_NODES.map(([id, en, zh]) => node(id, en, zh, [], [
    node(`${id}-gyri`, 'Gyri', '腦迴', byName(inGroup(id).filter(p => p.sub !== 'sulci'))),
    node(`${id}-sulci`, 'Sulci & fissures', '腦溝與裂', byName(inGroup(id).filter(p => p.sub === 'sulci'))),
  ].filter(n => n.leaf.length)));
  const stem = inGroup('brainstem'), midbrain = stem.filter(p => MIDBRAIN.test(p.en) || p.region === 'Mesencephalon'), rest1 = stem.filter(p => !midbrain.includes(p));
  const pons = rest1.filter(p => PONS.test(p.en)), rest2 = rest1.filter(p => !pons.includes(p)), medulla = rest2.filter(p => MEDULLA.test(p.en)), other = rest2.filter(p => !medulla.includes(p));
  const tree = [
    node('lobes', 'Lobes', '腦葉', [], lobes),
    node('diencephalon', 'Diencephalon', '間腦', byName(inGroup('diencephalon'))),
    node('basal', 'Basal nuclei', '基底核', byName(inGroup('basal'))),
    node('brainstem', 'Brainstem', '腦幹', byName(other), [node('midbrain', 'Midbrain', '中腦', byName(midbrain)), node('pons', 'Pons', '橋腦', byName(pons)), node('medulla', 'Medulla oblongata', '延腦', byName(medulla))].filter(n => n.leaf.length)),
    node('cerebellum', 'Cerebellum', '小腦', byName(inGroup('cerebellum'))),
    node('ventricles', 'Ventricles & choroid plexus', '腦室與脈絡叢', byName(inGroup('ventricles'))),
    node('white', 'White matter tracts', '白質纖維束', byName(inGroup('white'))),
    node('meninges', 'Meninges', '腦膜', byName(inGroup('meninges'))),
    node('vessels', 'Blood vessels', '血管', [], [node('arteries', 'Arteries (incl. circle of Willis)', '動脈（含 Willis 環）', byName(inGroup('arteries'))), node('veins', 'Venous sinuses & veins', '靜脈竇與靜脈', byName(inGroup('veins')))]),
    node('cranial', 'Cranial nerves (roots)', '腦神經（根部）', byName(inGroup('cranial'))),
  ];
  return tree.filter(n => n.all.length);
}

/** Structures that sit on the border of several lobes are listed under one lobe only; the card names the others. [name test, lobes] */
const RELATED_LOBES: [RegExp, string][] = [
  [/^central sulcus$/i, '額葉、頂葉'], [/^lat fis|lateral sulcus/i, '額葉、頂葉、顳葉'], [/^parieto-occipital sulcus$/i, '頂葉、枕葉'], [/^anterior occipital sulcus$/i, '顳葉、枕葉'],
  [/^collateral sulcus$|^posterior transverse collateral sulcus$/i, '顳葉、枕葉'], [/^subparietal sulcus$/i, '頂葉、邊緣葉（扣帶迴）'], [/^cingulate/i, '額葉、頂葉（內側面）'],
  [/^circular sulcus of insula$|^insula/i, '額葉、顳葉（蓋部）'], [/^hippocampus$/i, '顳葉（內側）'], [/^intraparietal sulcus$|^sulcus interm prim/i, '頂葉'],
  [/^precentral|^postcentral|^paracentral/i, '額葉與頂葉交界（中央溝兩側）'],
];
export const relatedLobes = (p: BrainPart): string | null => RELATED_LOBES.find(([re]) => re.test(p.en))?.[1] ?? null;
