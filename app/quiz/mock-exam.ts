import {QUIZ_CATEGORIES, QUIZ_REGIONS, categoryOf, inMockExam, type QuizCatalogue, type QuizRegionId, type QuizStructure} from './catalogue';
import {namingPool} from './level2';
import {cleanKey, judgeName, relationOf, type NameResult} from './naming';
import {seededRandom, seededShuffle} from './seeded';

/**
 * Mock practical exam (the owner calls it 模擬跑考). The site rule (scripts/check-no-notes.mjs) forbids the word 跑考 in anything that ships, so the label on the site is 模擬考試 (as in the mode
 * tabs, app/quiz/mode-nav.tsx) and is kept in this one constant. Provisional until the owner decides on an exemption. The route #/exam is EXAM_HASH of app/quiz/catalogue.ts.
 */
export const MOCK_EXAM_LABEL = '模擬考試';
export const MOCK_EXAM_ENGLISH = 'Mock exam';

/** Regions the exam can draw from: every region that has a quiz catalogue. */
export const EXAM_REGION_IDS = Object.keys(QUIZ_REGIONS) as QuizRegionId[];

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------
// Settings (remembered in this browser)
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------
export interface ExamSettings {
  /** Chosen regions, each with the section of the region (`all` = the whole region: every bone, muscle, nerve, vessel, ligament and tendon in it). */
  regions: {region: QuizRegionId; section: string}[];
  count: number;
  seconds: number;
}
export const EXAM_DEFAULTS: ExamSettings = {regions: EXAM_REGION_IDS.map(region => ({region, section: 'all'})), count: 50, seconds: 30};
export const COUNT_RANGE: [number, number] = [1, 200];
export const SECONDS_RANGE: [number, number] = [5, 300];
const clamp = (n: number, [lo, hi]: [number, number], fallback: number) => Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : fallback;
/** Reads whatever was stored and returns valid settings (unknown regions or sections are dropped; numbers are clamped). */
export function sanitizeSettings(raw: unknown): ExamSettings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<ExamSettings>;
  const seen = new Set<string>();
  const regions = (Array.isArray(r.regions) ? r.regions : []).flatMap(x => {
    const region = (x as {region?: string})?.region as QuizRegionId, section = (x as {section?: string})?.section;
    if (!QUIZ_REGIONS[region] || seen.has(region)) return [];
    seen.add(region);
    return [{region, section: typeof section === 'string' && QUIZ_REGIONS[region].sections.some(s => s.id === section) ? section : 'all'}];
  });
  return {regions: regions.length ? regions : EXAM_DEFAULTS.regions, count: clamp(Number(r.count), COUNT_RANGE, EXAM_DEFAULTS.count), seconds: clamp(Number(r.seconds), SECONDS_RANGE, EXAM_DEFAULTS.seconds)};
}
const SETTINGS_KEY = 'mj-quiz-exam-settings';
type Store = Pick<Storage, 'getItem' | 'setItem'>;
const local = (): Store | null => {try {return typeof localStorage === 'undefined' ? null : localStorage;} catch {return null;}};
export function loadSettings(store: Store | null = local()): ExamSettings {
  try {const raw = store?.getItem(SETTINGS_KEY); return sanitizeSettings(raw ? JSON.parse(raw) : null);} catch {return EXAM_DEFAULTS;}
}
export function saveSettings(settings: ExamSettings, store: Store | null = local()) {
  try {store?.setItem(SETTINGS_KEY, JSON.stringify(settings));} catch {/* storage unavailable: the settings last for this visit only */}
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------
// Pool: what may be asked
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------
export type Tier = 'easy' | 'medium' | 'hard';
export interface ExamItem {region: QuizRegionId; id: string; structure: QuizStructure; score: number; tier: Tier}

const ALL_CATEGORIES = QUIZ_CATEGORIES.map(c => c.id);
/**
 * DIFFICULTY RULE (deterministic; no randomness, no stored data; docs/mock-exam.md explains it to the owner). A structure scores 0 to 8 points:
 *   size      the diagonal of its bounding box (metres): under 4 cm 3 points, under 10 cm 2, under 25 cm 1, larger 0 (small things are hard to find);
 *   kind      bone 0; muscle, joint and organ 1; tendon, ligament, space, nerve and artery 2; vein 3 (thin, deep, many look alike);
 *   siblings  structures of the same catalogue and body system whose names differ only by an ordinal, a direction word or a number (2nd/3rd lumbrical, medial/lateral head,
 *             anterior/posterior ramus): three or more in the family 2 points, two in the family 1 point.
 * Tier: 0 to 2 points easy, 3 to 5 medium, 6 or more hard.
 */
export const TIER_LIMITS = {easyMax: 2, mediumMax: 5};
const KIND_POINTS: Record<string, number> = {bone: 0, muscle: 1, joint: 1, organ: 1, tendon: 2, ligament: 2, space: 2, nerve: 2, artery: 2, vein: 3};
const SIBLING_WORDS = /\b(?:\d+(?:st|nd|rd|th)?|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|medial|lateral|anterior|posterior|superior|inferior|proximal|distal|superficial|deep|upper|lower|middle|major|minor|long|short|longus|brevis|internal|external|dorsal|palmar|plantar|ventral|left|right|part|head|belly|branch|ramus)\b/g;
export const familyKey = (s: Pick<QuizStructure, 'name' | 'system'>) => `${s.system}|${cleanKey(s.name).replace(SIBLING_WORDS, ' ').replace(/[^a-z]+/g, ' ').trim()}`;
const diagonal = (s: QuizStructure) => Math.hypot(...[0, 1, 2].map(i => s.bounds[1][i] - s.bounds[0][i]));
export function difficultyScore(s: QuizStructure, familySize: number): number {
  const d = diagonal(s), size = d < .04 ? 3 : d < .10 ? 2 : d < .25 ? 1 : 0;
  return size + (KIND_POINTS[categoryOf(s)] ?? 1) + (familySize >= 3 ? 2 : familySize === 2 ? 1 : 0);
}
export const tierOf = (score: number): Tier => score <= TIER_LIMITS.easyMax ? 'easy' : score <= TIER_LIMITS.mediumMax ? 'medium' : 'hard';

export interface ExamSource {region: QuizRegionId; catalogue: QuizCatalogue; section: string}
/** Same bank as level 3 (a Chinese name, a name no other structure shares, asked at level 3, drawn in the model), minus every structure whose availability says exam: false. */
export function examPool(sources: ExamSource[]): ExamItem[] {
  const out: ExamItem[] = [], seen = new Set<string>();
  for (const {region, catalogue, section} of sources) {
    const families = new Map<string, number>();
    for (const s of catalogue.structures) families.set(familyKey(s), (families.get(familyKey(s)) ?? 0) + 1);
    const settings = {section, systems: [], categories: ALL_CATEGORIES, side: 'both' as const, count: 9999};
    for (const structure of namingPool(catalogue, settings)) {
      if (!inMockExam(structure)) continue;
      // the same structure in two catalogues (for example a heart part in the thorax and in the heart quiz) is asked once
      const identity = `${structure.side}|${structure.name.toLowerCase().replace(/\s+/g, ' ').trim()}`;
      if (seen.has(identity)) continue;
      seen.add(identity);
      const score = difficultyScore(structure, families.get(familyKey(structure)) ?? 1);
      out.push({region, id: structure.id, structure, score, tier: tierOf(score)});
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------
// Question builder
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------
export const HARD_SHARE = .4;
/** Medium takes 40 to 50 % (drawn per exam from the seed), easy what is left (10 to 20 %). */
export const MEDIUM_SHARE_RANGE: [number, number] = [.4, .5];
export interface ExamQuestion {region: QuizRegionId; id: string; tier: Tier}
export interface ExamPaper {questions: ExamQuestion[]; mix: Record<Tier, number>; mediumShare: number}
export function tierCounts(count: number, seed: string): {hard: number; medium: number; easy: number; mediumShare: number} {
  const mediumShare = MEDIUM_SHARE_RANGE[0] + seededRandom(`${seed}|mix`)() * (MEDIUM_SHARE_RANGE[1] - MEDIUM_SHARE_RANGE[0]);
  const hard = Math.round(count * HARD_SHARE), medium = Math.min(count - hard, Math.round(count * mediumShare));
  return {hard, medium, easy: count - hard - medium, mediumShare};
}
/** The same pool, count and seed always give the same paper. The order is fully shuffled across regions and tiers (no grouping). A tier the pool cannot fill is topped up from the other tiers. */
export function buildExam(pool: ExamItem[], count: number, seed: string): ExamPaper {
  const n = Math.max(0, Math.min(count, pool.length)), target = tierCounts(n, seed);
  // sorted first: the paper must not depend on the order of the catalogue files
  const sorted = [...pool].sort((a, b) => a.region.localeCompare(b.region) || a.id.localeCompare(b.id));
  const by = (tier: Tier) => seededShuffle(sorted.filter(i => i.tier === tier), `${seed}|${tier}`);
  const lists: Record<Tier, ExamItem[]> = {hard: by('hard'), medium: by('medium'), easy: by('easy')};
  const picked: ExamItem[] = [];
  for (const tier of ['hard', 'medium', 'easy'] as const) picked.push(...lists[tier].splice(0, target[tier]));
  if (picked.length < n) picked.push(...seededShuffle([...lists.hard, ...lists.medium, ...lists.easy], `${seed}|fill`).slice(0, n - picked.length));
  const questions = seededShuffle(picked, `${seed}|order`).map(({region, id, tier}) => ({region, id, tier}));
  const mix: Record<Tier, number> = {easy: 0, medium: 0, hard: 0};
  for (const q of questions) mix[q.tier]++;
  return {questions, mix, mediumShare: target.mediumShare};
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------
// Answers
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------
/** English or Chinese, unified names and aliases accepted, left/right required for paired structures: the same matching as level 3. `catalogue` supplies the part/whole neighbours. */
export function gradeTyped(typed: string, target: QuizStructure, catalogue?: QuizCatalogue): NameResult | 'skipped' {
  if (!typed.trim()) return 'skipped';
  const related = catalogue ? catalogue.structures.filter(s => s.id !== target.id && s.system === target.system && relationOf(s, target)) : [];
  const result = judgeName(typed, target, {language: 'any', needSide: true}, related).result;
  // Level 3 accepts a Chinese name without 左/右 (the site's own spelling has none); the exam does not: a paired structure needs its side, a missing side is 接近 (not scored), the other side is wrong.
  if (result !== 'correct' || (target.side !== 'left' && target.side !== 'right')) return result;
  const side = sideOf(typed);
  return side === target.side ? 'correct' : side ? 'wrong' : 'close';
}
const sideOf = (text: string) => /\bleft\b|左/i.test(text) ? 'left' : /\bright\b|右/i.test(text) ? 'right' : '';
export interface ExamAnswer {typed: string; result: NameResult | 'skipped'; seconds: number}
export const isCorrect = (a?: ExamAnswer) => a?.result === 'correct';
export const scoreOf = (answers: (ExamAnswer | undefined)[]) => answers.filter(isCorrect).length;

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------
// Timer (pure: the page feeds it the clock)
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------
/** Whole seconds left (rounded up, so the display reads 30 at the start and 0 only when time is up). */
export const secondsLeft = (elapsedMs: number, limitSeconds: number) => Math.max(0, Math.ceil(limitSeconds - Math.max(0, elapsedMs) / 1000));
export const isExpired = (elapsedMs: number, limitSeconds: number) => elapsedMs >= limitSeconds * 1000;
/** Seconds used on a question, never more than the limit, one decimal. */
export const secondsUsed = (elapsedMs: number, limitSeconds: number) => Math.round(Math.min(Math.max(0, elapsedMs), limitSeconds * 1000) / 100) / 10;
export const clockText = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
