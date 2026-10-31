import {structureProfile, paokaoCardByName, type BilingualFact} from '../mj-structure-info';
import type {SystemId} from '../anatomy';
import {CARD_EXTRAS, type CardExtra} from './card-data';
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
  const profile = structureProfile(structure.name, system as SystemId);
  // Paired structures are keyed without left/right; names where "left"/"right" belongs to the name itself (left atrium, left pulmonary artery…) are keyed in full.
  const extra: CardExtra | undefined = CARD_EXTRAS[structure.name.toLowerCase()] ?? CARD_EXTRAS[clean(structure.name)];
  const fields: CardField[] = [], missing: string[] = [];
  // A lung surface structure (impression, hilum, lobe part …) shows the fields of its own type, as on the atlas data card; fields without content are not listed.
  const lungCard = system === 'respiratory' ? paokaoCardByName(structure.name) : undefined;
  if (lungCard?.lung) return {english: structure.name, chinese: structure.chinese ?? lungCard.zh, system, fields: (lungCard.extra ?? []).map(f => ({label: f.labelZh, zh: f.zh, en: f.en})), missing: []};
  for (const label of FIELDS[system]) {
    const fromExtra = extra?.[label] ?? (system === 'respiratory' ? lungMark(structure.name, label) : undefined);
    const fact = FROM_PROFILE[system][label]?.map(l => profile.facts.find(f => f.labelZh === l)).find(Boolean);
    // Heart structures carry their own checked description (catalogue), shown as the card's 說明.
    const found = fromExtra ? {zh: fromExtra.zh, en: fromExtra.en} : label === '說明' && structure.description ? structure.description : present(fact);
    if (found) fields.push({label, ...found}); else missing.push(label);
  }
  return {english: structure.name, chinese: structure.chinese ?? profile.chinese, system, fields, missing};
}
