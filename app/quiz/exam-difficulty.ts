import rules from '../data/quiz-exam/difficulty.json';
import {categoryOf, inMockExam, type QuizCatalogue, type QuizRegionId, type QuizStructure} from './catalogue';
import {cleanKey} from './naming';

/** Mock exam: how hard a structure is, and how an exam is drawn from the pool. The rules are plain numbers in app/data/quiz-exam/difficulty.json (ratios, size steps, thresholds)
 * and a per-structure override table there (`<region>/<name without left or right>` -> easy, medium or hard), so they can be adjusted without touching code. */
export type Difficulty = 'easy' | 'medium' | 'hard';
export interface ExamRules {
  ratios: {hard: number; mediumMin: number; mediumMax: number};
  thresholds: {hard: number; medium: number};
  sizeSteps: [number, number][];
  harderCategories: string[];
  overrides: Record<string, Difficulty>;
}
export const EXAM_RULES = rules as ExamRules;

/** Words that tell sister structures apart (a number, an order word or a direction): the name without them is the "family" of a structure. */
const DISTINGUISHERS = /\b(?:first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th|i{1,3}|iv|v|vi{0,3}|superior|inferior|medial|lateral|anterior|posterior|proximal|distal|deep|superficial|dorsal|palmar|plantar|upper|lower|middle|long|short|major|minor|left|right|\d+)\b/g;
export const familyKey = (name: string) => cleanKey(name).replace(DISTINGUISHERS, '').replace(/\s+/g, ' ').trim();
const diagonal = (s: QuizStructure) => Math.hypot(s.bounds[1][0] - s.bounds[0][0], s.bounds[1][1] - s.bounds[0][1], s.bounds[1][2] - s.bounds[0][2]);

/** Score = size (the smaller, the harder) + sister structures with a similar name + a harder kind of structure (nerve, vessel, tendon, ligament, joint, space, organ part). */
export function difficultyScore(s: QuizStructure, siblings: number, rulesIn: ExamRules = EXAM_RULES): number {
  const size = diagonal(s);
  let score = 0;
  for (const [limit, points] of rulesIn.sizeSteps) if (size < limit) {score = points; break;}
  score += siblings >= 2 ? 2 : siblings === 1 ? 1 : 0;
  if (rulesIn.harderCategories.includes(categoryOf(s))) score += 1;
  return score;
}
export function classify(score: number, rulesIn: ExamRules = EXAM_RULES): Difficulty {
  return score >= rulesIn.thresholds.hard ? 'hard' : score >= rulesIn.thresholds.medium ? 'medium' : 'easy';
}
export interface ExamQuestion {region: QuizRegionId; structure: QuizStructure; difficulty: Difficulty}
/** Difficulty of every structure of a catalogue (sisters are counted inside the region). */
export function difficultyMap(catalogue: QuizCatalogue, region: QuizRegionId, rulesIn: ExamRules = EXAM_RULES): Map<string, Difficulty> {
  const families = new Map<string, number>();
  for (const s of catalogue.structures) {const k = familyKey(s.name); families.set(k, (families.get(k) ?? 0) + 1);}
  const out = new Map<string, Difficulty>();
  for (const s of catalogue.structures) {
    const override = rulesIn.overrides[`${region}/${cleanKey(s.name)}`];
    out.set(s.id, override ?? classify(difficultyScore(s, (families.get(familyKey(s.name)) ?? 1) - 1, rulesIn), rulesIn));
  }
  return out;
}
/** Structures the exam may ask: the ones that can be asked by typing a name (a name only that structure has) and are not left out of the exam. */
export const examEligible = (s: QuizStructure) => inMockExam(s);

export function mix(random: () => number, rulesIn: ExamRules = EXAM_RULES) {
  const {hard, mediumMin, mediumMax} = rulesIn.ratios, medium = mediumMin + random() * (mediumMax - mediumMin);
  return {hard, medium, easy: Math.max(0, 1 - hard - medium)};
}
function shuffle<T>(values: T[], random: () => number): T[] {
  const out = [...values];
  for (let i = out.length - 1; i > 0; i--) {const j = Math.floor(random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]];}
  return out;
}
/** Draws `count` questions without repeats: hard 40%, medium 40–50% (random per exam), the rest easy; a tier that runs short is filled from the nearest tier; the result is shuffled across all regions. */
export function composeExam(pool: ExamQuestion[], count: number, random: () => number = Math.random, rulesIn: ExamRules = EXAM_RULES): ExamQuestion[] {
  const n = Math.min(count, pool.length), share = mix(random, rulesIn);
  const want: Record<Difficulty, number> = {hard: Math.round(n * share.hard), medium: Math.round(n * share.medium), easy: 0};
  want.easy = Math.max(0, n - want.hard - want.medium);
  if (want.hard + want.medium + want.easy > n) want.medium = Math.max(0, n - want.hard);
  const tiers: Record<Difficulty, ExamQuestion[]> = {hard: [], medium: [], easy: []};
  for (const q of shuffle(pool, random)) tiers[q.difficulty].push(q);
  const picked: ExamQuestion[] = [];
  const take = (tier: Difficulty, k: number) => {const got = tiers[tier].splice(0, k); picked.push(...got); return k - got.length;};
  let shortHard = take('hard', want.hard), shortMedium = take('medium', want.medium), shortEasy = take('easy', want.easy);
  // shortages go to the neighbouring tier first, then anywhere
  shortMedium += shortHard; shortHard = 0; shortMedium = take('medium', shortMedium); shortEasy += shortMedium; shortMedium = 0; shortEasy = take('easy', shortEasy);
  if (shortEasy > 0) shortEasy = take('medium', shortEasy);
  if (shortEasy > 0) take('hard', shortEasy);
  return shuffle(picked, random);
}
export const tierCounts = (questions: ExamQuestion[]) => questions.reduce((o, q) => ({...o, [q.difficulty]: o[q.difficulty] + 1}), {easy: 0, medium: 0, hard: 0} as Record<Difficulty, number>);
/** Paired structures must be answered with their side; midline ones are not. */
export const needsSide = (s: Pick<QuizStructure, 'side'>) => s.side !== 'midline';
