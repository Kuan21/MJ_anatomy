import {structureProfile, type BilingualFact} from '../mj-structure-info';
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
};
/** Existing profile facts (by their Chinese label) that answer a card field. */
const FROM_PROFILE: Record<QuizSystem, Record<string, string[]>> = {
  muscular: {起點: ['起點'], 止點: ['止點'], 作用: ['作用'], 神經支配: ['神經支配'], 血液供應: ['血液供應']},
  nervous: {來源: ['神經根／來源'], 走向: ['走行／關係'], 支配範圍: ['主要功能']},
  arterial: {},
  venous: {},
  skeletal: {主要標誌: ['重要骨標誌']},
};

const clean = (name: string) => name.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/\s+/g, ' ').trim();
const present = (fact?: BilingualFact) => fact && (fact.valueZh || fact.valueEn) ? {zh: fact.valueZh, en: fact.valueEn} : undefined;

export function structureCard(structure: Pick<QuizStructure, 'name' | 'chinese' | 'system'>): StructureCard {
  const system = structure.system;
  const profile = structureProfile(structure.name, system as SystemId);
  const extra: CardExtra | undefined = CARD_EXTRAS[clean(structure.name)];
  const fields: CardField[] = [], missing: string[] = [];
  for (const label of FIELDS[system]) {
    const fromExtra = extra?.[label];
    const fact = FROM_PROFILE[system][label]?.map(l => profile.facts.find(f => f.labelZh === l)).find(Boolean);
    const found = fromExtra ? {zh: fromExtra.zh, en: fromExtra.en} : present(fact);
    if (found) fields.push({label, ...found}); else missing.push(label);
  }
  return {english: structure.name, chinese: structure.chinese ?? profile.chinese, system, fields, missing};
}
