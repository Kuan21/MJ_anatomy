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
};
const brainZh = (zh: string, en: string) => /ventric/i.test(en) ? zh.replace(/心室/g, '腦室') : zh;
export const zhOfBrain = (en: string): string => ZH_EXTRA[en.toLowerCase()] ?? brainZh(namingOverride(en) ?? zhAnatomy(en)?.zh ?? '', en);

export interface RawBrainNode {name: string; cat: string; region: string; label: string; side: string}
export function describeBrainNode(raw: RawBrainNode, index: number): BrainPart | null {
  const en = (raw.label || cleanBrainName(raw.name)).replace(/\*/g, '').replace(/\s+/g, ' ').trim();
  if (NOT_BRAIN.test(en)) return null;
  const side = raw.side === 'left' ? 'left' : raw.side === 'right' ? 'right' : (/\.l(?:\.\d+)?$/i.test(raw.name) ? 'left' : /\.r(?:\.\d+)?$/i.test(raw.name) ? 'right' : 'mid');
  const group = groupOf(raw.cat, raw.region), layer = BRAIN_GROUPS.find(g => g.id === group)!.layer;
  const zh = zhOfBrain(en);
  return {id: `b${index}`, en, zh: zh ? SIDE_ZH[side] + zh : '', side, cat: raw.cat, region: raw.region, group, layer};
}
export const displayEn = (p: BrainPart) => SIDE_EN[p.side] + p.en;
