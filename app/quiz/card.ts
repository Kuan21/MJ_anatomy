import {structureProfile, paokaoCardByName, type BilingualFact} from '../mj-structure-info';
import type {SystemId} from '../anatomy';
import {CARD_EXTRAS, type CardExtra} from './card-data';
import {lungSegmentByName} from '../mj-lung-segments';
import type {QuizStructure, QuizSystem} from './catalogue';

export interface CardField {label: string; zh?: string; en?: string}
export interface StructureCard {
  english: string;
  chinese?: string;
  system: QuizSystem;
  fields: CardField[];
  /** Labels of fields this structure has no data for; they stay blank rather than guessed. */
  missing: string[];
}

/** Fields each kind of structure shows, in order. Existing repository data fills them; anything not documented stays empty. */
const FIELDS: Record<QuizSystem, string[]> = {
  muscular: ['起點', '止點', '作用', '神經支配', '血液供應'],
  nervous: ['來源', '走向', '主要分支', '支配範圍'],
  arterial: ['來源', '走向', '主要分支', '供應範圍'],
  venous: ['來源', '走向', '主要分支', '引流範圍'],
  skeletal: ['主要標誌', '相關關節', '附著肌肉'],
  cardiac: ['說明'],
  // lung quiz: surface marks and airway; a mark's three fields come from its course-summary card (scripts/paokao-structures/lungs.mjs)
  respiratory: ['位置', '構造／毗鄰關係', '血液供應／神經'],
};
/** Existing profile facts (by their Chinese label) that answer a card field. */
const FROM_PROFILE: Record<QuizSystem, Record<string, string[]>> = {
  muscular: {起點: ['起點'], 止點: ['止點'], 作用: ['作用'], 神經支配: ['神經支配'], 血液供應: ['血液供應']},
  nervous: {來源: ['神經根／來源'], 走向: ['走行／關係'], 支配範圍: ['主要功能']},
  arterial: {},
  venous: {},
  skeletal: {主要標誌: ['重要骨標誌']},
  cardiac: {},
  respiratory: {位置: ['位置'], '構造／毗鄰關係': ['構造／毗鄰關係'], '血液供應／神經': ['血液供應／神經']},
};

const clean = (name: string) => name.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/\s+/g, ' ').trim();
const present = (fact?: BilingualFact) => fact && (fact.valueZh || fact.valueEn) ? {zh: fact.valueZh, en: fact.valueEn} : undefined;

/** A lung surface mark's card fields: its location, structure/relations and blood supply/nerves are the origin, course and supply lines of its course-summary card. */
function lungMark(name: string, label: string) {
  const card = paokaoCardByName(name);
  const line = card ? {位置: card.origin, '構造／毗鄰關係': card.course, '血液供應／神經': card.supply}[label] : undefined;
  return line ? {zh: line[1], en: line[0]} : undefined;
}

export function structureCard(structure: Pick<QuizStructure, 'name' | 'chinese' | 'system' | 'description'>): StructureCard {
  const system = structure.system;
  // A bronchopulmonary segment (schematic territory) has its own fields: lobe, segment, segmental bronchus, main relations and, where there is a standard one, a clinical note.
  const seg = system === 'respiratory' ? lungSegmentByName(structure.name) : undefined;
  if (seg) {
    const side = seg.side === 'left' ? ['left', '左'] : ['right', '右'], lobe = {upper: ['upper lobe', '上葉'], middle: ['middle lobe', '中葉'], lower: ['lower lobe', '下葉']}[seg.lobe];
    const fields: CardField[] = [
      {label: '肺葉', zh: `${side[1]}肺${lobe[1]}`, en: `${lobe[0][0].toUpperCase()}${lobe[0].slice(1)} of the ${side[0]} lung`},
      {label: '肺段', zh: `${seg.number}，${seg.zh.replace(/^[左右]肺[上中下]葉/, '')}`, en: `${seg.number}, ${seg.en.replace(/ of (?:left|right) lung$/, '')}`},
      {label: '段支氣管', zh: seg.bronchus[1], en: seg.bronchus[0]},
      {label: '主要毗鄰', zh: seg.relations[1], en: seg.relations[0]},
      ...(seg.clinical ? [{label: '臨床備註', zh: seg.clinical[1], en: seg.clinical[0]}] : []),
    ];
    return {english: structure.name, chinese: structure.chinese ?? seg.zh, system, fields, missing: []};
  }
  const profile = structureProfile(structure.name, system as SystemId);
  // Paired structures are keyed without left/right; names where "left"/"right" belongs to the name itself (left atrium, left pulmonary artery…) are keyed in full.
  const extra: CardExtra | undefined = CARD_EXTRAS[structure.name.toLowerCase()] ?? CARD_EXTRAS[clean(structure.name)];
  const fields: CardField[] = [], missing: string[] = [];
  for (const label of FIELDS[system]) {
    const fromExtra = extra?.[label] ?? (system === 'respiratory' ? lungMark(structure.name, label) : undefined);
    const fact = FROM_PROFILE[system][label]?.map(l => profile.facts.find(f => f.labelZh === l)).find(Boolean);
    // Heart structures carry their own checked description (catalogue), shown as the card's 說明.
    const found = fromExtra ? {zh: fromExtra.zh, en: fromExtra.en} : label === '說明' && structure.description ? structure.description : present(fact);
    if (found) fields.push({label, ...found}); else missing.push(label);
  }
  return {english: structure.name, chinese: structure.chinese ?? profile.chinese, system, fields, missing};
}
