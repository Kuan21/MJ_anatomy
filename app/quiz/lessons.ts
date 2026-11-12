import overrides from '../data/quiz-lessons/overrides.json';
import {QUIZ_CATEGORIES, QUIZ_REGIONS, categoryOf, type QuizCatalogue, type QuizCategory, type QuizRegionId, type QuizSectionDef, type QuizSettings, type QuizStructure} from './catalogue';
import {namingPool} from './level2';
export {seededShuffle} from './seeded';
import {cleanKey, type AnswerLanguage} from './naming';

/** Level 2 (學習關卡): the question bank of the region is cut into small lessons. The cut is generated from the catalogue, so a new region or category needs data only.
 * One lesson is one category, ordered from the top of the body downwards (proximal to distal in the limbs), about `target` structures each; the human-readable
 * overrides live in app/data/quiz-lessons/overrides.json (how to edit: docs/quiz-lessons.md). */
export interface LessonOverrides {
  target?: number;
  /** `<region>/<category>-<number>` -> lesson name. */
  names?: Record<string, {en: string; zh: string}>;
  /** `<region>/<category>` -> structure names (without left/right) placed first, in that order. */
  pin?: Record<string, string[]>;
}
export interface Lesson {
  /** Stable inside one scope (region, section, side, scope): `<category>-<number>`. */
  key: string;
  category: QuizCategory;
  number: number;
  ids: string[];
  en: string;
  zh: string;
}
export const DEFAULT_TARGET = 8;
/** A category with fewer structures than MIN_SIZE stays one small lesson; every other lesson holds between MIN_SIZE and MAX_SIZE structures. */
export const MIN_SIZE = 4, MAX_SIZE = 12;

const centre = (s: QuizStructure, axis: number) => (s.bounds[0][axis] + s.bounds[1][axis]) / 2;
/** From the top of the body downwards (y is height), then by name and id so that the order never depends on the file order. */
export function byPosition(a: QuizStructure, b: QuizStructure): number {
  return Math.round(centre(b, 1) * 1000) - Math.round(centre(a, 1) * 1000) || cleanKey(a.name).localeCompare(cleanKey(b.name), 'en') || a.name.localeCompare(b.name, 'en') || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}
/** n structures into k nearly equal lessons (sizes differ by at most one, larger first). */
export function chunkSizes(n: number, target: number): number[] {
  if (n <= 0) return [];
  const k = Math.max(1, Math.round(n / Math.max(1, target))), base = Math.floor(n / k), extra = n % k;
  return Array.from({length: k}, (_, i) => base + (i < extra ? 1 : 0));
}
/** The scope a set of lessons belongs to: lessons are cut over every category of the chosen section, side and scope, so the category filter never renumbers them. */
export const scopeKeyOf = (settings: Pick<QuizSettings, 'section' | 'side' | 'scope'>) => `${settings.side}|${settings.section}|${settings.scope ?? 'all'}`;

/** The region section a structure belongs to: of its own sections, the narrowest one whose height range contains the structure's centre. */
function sectionOf(defs: QuizSectionDef[], s: QuizStructure): QuizSectionDef | null {
  const own = defs.filter(d => d.id !== 'all' && s.sections.includes(d.id));
  if (!own.length) return null;
  const y = centre(s, 1), inside = own.filter(d => y >= d.range[0] && y <= d.range[1]);
  return [...(inside.length ? inside : own)].sort((a, b) => (a.range[1] - a.range[0]) - (b.range[1] - b.range[0]) || (a.id < b.id ? -1 : 1))[0];
}
/** Where a lesson lies: its first and last structure's section ("Thigh", or "Thigh – Leg"). */
function rangeLabel(catalogue: QuizCatalogue, members: QuizStructure[]): {en: string; zh: string} | null {
  const defs = QUIZ_REGIONS[(catalogue.region ?? 'lower-limb') as QuizRegionId]?.sections ?? [];
  const first = sectionOf(defs, members[0]), last = sectionOf(defs, members[members.length - 1]);
  if (!first || !last) return null;
  return first.id === last.id ? {en: first.english, zh: first.label} : {en: `${first.english} – ${last.english}`, zh: `${first.label}～${last.label}`};
}

/** Every structure that can be asked (the same bank as levels 1 and 3) is in exactly one lesson. `settings.categories` only chooses which lessons are listed. */
export function buildLessons(catalogue: QuizCatalogue, settings: QuizSettings, rules: LessonOverrides = overrides as LessonOverrides): Lesson[] {
  const region = catalogue.region ?? 'lower-limb', target = rules.target ?? DEFAULT_TARGET;
  const all = QUIZ_CATEGORIES.map(c => c.id);
  const pool = namingPool(catalogue, {...settings, categories: all});
  const shown = settings.categories ?? all;
  const lessons: Lesson[] = [];
  for (const category of QUIZ_CATEGORIES) {
    const members = pool.filter(s => categoryOf(s) === category.id).sort(byPosition);
    const pinned = (rules.pin?.[`${region}/${category.id}`] ?? []).map(cleanKey);
    if (pinned.length) members.sort((a, b) => {
      const ia = pinned.indexOf(cleanKey(a.name)), ib = pinned.indexOf(cleanKey(b.name));
      return (ia < 0 ? 1e6 : ia) - (ib < 0 ? 1e6 : ib);
    });
    let from = 0;
    chunkSizes(members.length, target).forEach((size, i) => {
      const part = members.slice(from, from + size); from += size;
      const number = i + 1, key = `${category.id}-${number}`, named = rules.names?.[`${region}/${key}`], section = rangeLabel(catalogue, part);
      lessons.push({key, category: category.id, number, ids: part.map(s => s.id),
        en: named?.en ?? `${category.english} ${number}${section ? ` · ${section.en}` : ''}`, zh: named?.zh ?? `${category.label} ${number}${section ? `・${section.zh}` : ''}`});
    });
  }
  return lessons.filter(l => shown.includes(l.category));
}

/** Card fields that can serve as a location line, best first. A structure without any of them gets no location line (nothing is invented). */
export const LOCATION_FIELDS = ['位置', '起點', '來源', '主要標誌', '走向與通道', '走向'];
export interface Hint {letters: string; chinese?: string; location?: {label: string; text: string}}
const MAX_LOCATION = 46;
/** Round 2 hint: first letters of the English name, the Chinese name, and a location line from the existing card fields. For a Chinese-only answer the Chinese name is cut to its first character. */
export function hintFor(structure: Pick<QuizStructure, 'name' | 'chinese'>, fields: {label: string; zh?: string; en?: string}[], language: AnswerLanguage = 'any'): Hint {
  const letters = structure.name.trim().split(/\s+/).map(w => `${w[0]}…`).join(' ');
  const chinese = structure.chinese ? (language === 'zh' ? `${structure.chinese[0]}…（共 ${structure.chinese.length} 字）` : structure.chinese) : undefined;
  const names = [structure.name, structure.chinese ?? '', cleanKey(structure.name)].filter(Boolean).map(n => n.toLowerCase());
  let location: Hint['location'];
  for (const label of LOCATION_FIELDS) {
    const raw = fields.find(f => f.label === label)?.zh?.trim();
    if (!raw) continue;
    const first = raw.split(/[。；;\n]/)[0].trim();
    const text = first.length > MAX_LOCATION ? `${first.slice(0, MAX_LOCATION)}…` : first;
    // a line that spells out the name would give the answer away
    if (!text || names.some(n => text.toLowerCase().includes(n))) continue;
    location = {label, text}; break;
  }
  return {letters, chinese, location};
}
