import {SYNONYMS} from './synonyms';
import type {QuizStructure} from './catalogue';

/** How a typed name is judged for the level-2 quiz (看結構寫名稱). Pure functions: the page, the tests and the REVIEW_LOG table all use these. */
export type AnswerLanguage = 'en' | 'zh' | 'any';
export type NameResult = 'correct' | 'close' | 'wrong';
export interface NameOptions {language: AnswerLanguage; needSide: boolean}
export interface Accepted {en: string[]; zh: string[]}

const SIDE_EN = /\b(left|right)\b/g;
/** "Septomarginal trabecula (moderator band)" → ["septomarginal trabecula (moderator band)", "septomarginal trabecula", "moderator band"] */
function withBrackets(name: string): string[] {
  const out = [name], match = name.match(/^(.*?)\s*[（(]([^）)]+)[）)]\s*(.*)$/);
  if (match) out.push(`${match[1]} ${match[3]}`.trim(), match[2].trim());
  return out;
}
const unique = <T,>(items: T[]) => [...new Set(items)];
export const cleanKey = (name: string) => name.toLowerCase().replace(SIDE_EN, '').replace(/\s+/g, ' ').trim();

/** Every name that is right for a structure: its own English and Chinese names, names in brackets, and the rows of the synonym table. */
export function acceptedNames(structure: Pick<QuizStructure, 'name' | 'chinese'> & {side?: string}): Accepted {
  const paired = structure.side === 'left' || structure.side === 'right';
  // Left/right is part of the identity of a midline structure (left atrium, left coronary leaflet), so its row is keyed with the word; paired structures are keyed without it.
  const row = SYNONYMS[structure.name.toLowerCase()] ?? SYNONYMS[cleanKey(structure.name)];
  const en = [...withBrackets(structure.name), ...(row?.en ?? [])];
  const zh = [...(structure.chinese ? withBrackets(structure.chinese) : []), ...(row?.zh ?? [])];
  // Paired structures carry their side in the name ("…of right pectoralis major"); a synonym row applies to both sides, so the side words are put back where the name has them.
  const side = paired ? structure.name.match(SIDE_EN)?.[0]?.toLowerCase() : undefined;
  const zhSide = paired ? (structure.chinese?.startsWith('左') ? '左' : structure.chinese?.startsWith('右') ? '右' : '') : '';
  const sided = (names: string[], text: string | undefined) => names.map(n => text && !SIDE_EN.test(n) ? `${text} ${n}` : n);
  SIDE_EN.lastIndex = 0;
  return {en: unique([...en, ...sided(row?.en ?? [], side)]), zh: unique([...zh, ...(row?.zh ?? []).map(n => zhSide && !/^[左右]/.test(n) ? zhSide + n : n)])};
}

/** Letters, digits and Chinese characters only; lower case; "the", "muscle(s)", hyphens, brackets and spaces ignored; 臺 = 台. */
export function normalize(text: string, keepSide: boolean): string {
  let t = text.normalize('NFKC').toLowerCase().replace(/臺/g, '台');
  t = t.replace(/\b(the|of the)\b/g, ' ').replace(/\bmuscles?\b/g, ' ');
  if (!keepSide) t = t.replace(SIDE_EN, ' ').replace(/[左右]側?/g, '');
  return t.replace(/[^a-z0-9㐀-鿿]+/g, '');
}

export function distance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({length: b.length + 1}, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

const isChinese = (s: string) => /[㐀-鿿]/.test(s);
/** Close = one slip in a short name, up to two in a long one (more than 8 letters); Chinese: one character in a name of four or more. */
function closeLimit(expected: string) {
  return isChinese(expected) ? (expected.length >= 4 ? 1 : 0) : expected.length > 8 ? 2 : expected.length >= 4 ? 1 : 0;
}

/**
 * Part and whole by name: "anterior cusp of pulmonary valve" is a part of "pulmonary valve". `part`: a is a part of b; `whole`: b is a part of a. A part named instead of its whole
 * (or the whole instead of a part) is close, not wrong, and is never scored as correct.
 */
export function relationOf(a: {name: string}, b: {name: string}): 'part' | 'whole' | null {
  const ka = cleanKey(a.name), kb = cleanKey(b.name);
  if (!ka || !kb || ka === kb) return null;
  const partOf = (x: string, y: string) => x.endsWith(` of ${y}`) || x.includes(` of ${y} `);
  return partOf(ka, kb) ? 'part' : partOf(kb, ka) ? 'whole' : null;
}
export type NameRelation = 'typed-part' | 'typed-whole';

/** `correct`: equals an accepted name. `close`: within the limit of one. Anything else is `wrong`. */
export function judgeName(typed: string, structure: Pick<QuizStructure, 'name' | 'chinese'> & {side?: string}, options: NameOptions, related: Array<Pick<QuizStructure, 'name' | 'chinese'> & {side?: string}> = []): {result: NameResult; best?: string; relation?: NameRelation; relatedName?: string} {
  // Only a laterality word of a paired structure may be left out; "left atrium" is a different structure from "right atrium".
  const keepSide = options.needSide || !(structure.side === 'left' || structure.side === 'right');
  const input = normalize(typed, keepSide);
  if (!input) return {result: 'wrong'};
  // When the side must be given, a missing or wrong side is an error, never "close".
  const requireSide = options.needSide && (structure.side === 'left' || structure.side === 'right');
  const sideOf = (t: string) => /\bleft\b|左/i.test(t) ? 'left' : /\bright\b|右/i.test(t) ? 'right' : '';
  const accepted = acceptedNames(structure);
  const names = options.language === 'en' ? accepted.en : options.language === 'zh' ? accepted.zh : [...accepted.en, ...accepted.zh];
  let best: string | undefined, bestDistance = Infinity;
  for (const name of names) {
    const expected = normalize(name, keepSide);
    if (!expected) continue;
    if (expected === input) return {result: 'correct', best: name};
    if (requireSide && sideOf(typed) !== sideOf(name)) continue;
    const d = distance(input, expected);
    if (d <= closeLimit(expected) && d < bestDistance) {best = name; bestDistance = d;}
  }
  if (best) return {result: 'close', best};
  // The name of a part of the target (or of the whole it belongs to) is close, but never right.
  for (const other of related) {
    const rel = relationOf(other, structure);
    if (rel && judgeName(typed, other, options).result === 'correct') return {result: 'close', relation: rel === 'part' ? 'typed-part' : 'typed-whole', relatedName: other.name};
  }
  return {result: 'wrong'};
}

/** The spelling to show after a close answer: the accepted name in the language the learner was typing. */
export function preferredName(structure: Pick<QuizStructure, 'name' | 'chinese'>, typed: string, language: AnswerLanguage): string {
  const zh = isChinese(typed) || language === 'zh';
  return zh ? structure.chinese ?? structure.name : structure.name;
}
