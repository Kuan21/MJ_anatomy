import {QUIZ_CATEGORIES, QUIZ_REGIONS, regionIds, type QuizCategory, type QuizRegionId} from './catalogue';
import {defaultStore, type Store} from './lesson-progress';

/** Mock exam setup: regions and sections (mixed freely), kinds of structure, number of stations and seconds per station. Remembered like the Quiz setup. */
export interface ExamSetup {regions: Record<string, string[]>; categories: QuizCategory[]; count: number; seconds: number; remember: boolean}
export const EXAM_DEFAULTS = {count: 50, seconds: 30};
export const EXAM_LIMITS = {count: [5, 200], seconds: [10, 180]} as const;
const ALL = QUIZ_CATEGORIES.map(c => c.id);
export const defaultExamSetup = (): ExamSetup => ({regions: {}, categories: ALL, ...EXAM_DEFAULTS, remember: true});
const clamp = (v: unknown, [lo, hi]: readonly [number, number], fallback: number) => Number.isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v as number))) : fallback;
const KEY = 'mj-exam-setup';
export function loadExamSetup(store: Store | null = defaultStore()): ExamSetup {
  const base = defaultExamSetup();
  try {
    const raw = store?.getItem(KEY); if (!raw) return base;
    const v = JSON.parse(raw) as Partial<ExamSetup>, known = new Set<string>(regionIds()), regions: Record<string, string[]> = {};
    for (const [id, sections] of Object.entries(v.regions ?? {})) if (known.has(id) && Array.isArray(sections)) {
      const valid = new Set(QUIZ_REGIONS[id as QuizRegionId].sections.map(s => s.id)), keep = sections.filter(x => typeof x === 'string' && valid.has(x));
      regions[id] = keep.length ? keep : ['all'];
    }
    const categories = Array.isArray(v.categories) ? v.categories.filter((c): c is QuizCategory => ALL.includes(c as QuizCategory)) : base.categories;
    return {regions, categories: categories.length ? categories : base.categories, count: clamp(v.count, EXAM_LIMITS.count, base.count), seconds: clamp(v.seconds, EXAM_LIMITS.seconds, base.seconds), remember: v.remember !== false};
  } catch { return base; }
}
export function saveExamSetup(setup: ExamSetup, store: Store | null = defaultStore()) {
  try { if (setup.remember) store?.setItem(KEY, JSON.stringify(setup)); else store?.removeItem(KEY); } catch { /* not remembered */ }
}
/** The side a paired structure is answered with is added to what was typed, in the language that was typed (judgeName looks for left, right, 左 or 右). */
export function withSide(text: string, side: 'left' | 'right' | null): string {
  const t = text.trim();
  if (!side || !t || /\b(?:left|right)\b|[左右]/i.test(t)) return t;
  return /[㐀-鿿]/.test(t) ? `${side === 'left' ? '左' : '右'}${t}` : `${side === 'left' ? 'Left' : 'Right'} ${t}`;
}
/** m:ss */
export const clock = (seconds: number) => {const s = Math.max(0, Math.ceil(seconds)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;};
/** Seconds left at a station: the clock starts at `startedMs` (when the station's model was ready) and runs `seconds` whatever the player does; 0 means the answer is handed in. */
export const remainingSeconds = (startedMs: number, nowMs: number, seconds: number) => Math.max(0, seconds - (nowMs - startedMs) / 1000);
