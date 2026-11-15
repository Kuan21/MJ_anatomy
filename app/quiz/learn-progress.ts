import {defaultStore, loadResults, type Store} from './lesson-progress';
import type {Lesson} from './lessons';

/** 學習（關卡地圖）: pass rule, unlock chain and saved progress. Pure rules with an injectable storage, so that they can be tested.
 * The learn progress is stored per region under `mj-learn:<region>`; the older star results of the guided-lessons level (`mj-quiz-lessons:<region>`) are read as well, so
 * nothing a learner already cleared is lost (two stars there meant 80% or more, which is the pass rule here). */
export const PASS_RATE = 0.8;
export type LessonStep = 'know' | 'practice' | 'test';
export interface LessonProgress {
  /** Set when the lesson was opened; a lesson that was started and not passed is shown as in progress. */
  started?: string;
  passed: boolean;
  /** Best result of the pass test, in percent. */
  best: number;
  tries: number;
  at: string;
}
export type ProgressMap = Record<string, LessonProgress>;
const KEY = (region: string) => `mj-learn:${region}`;
const SETTINGS = 'mj-learn-settings';

export const passes = (correct: number, total: number) => total > 0 && correct / total >= PASS_RATE;
export const percentOf = (correct: number, total: number) => total > 0 ? Math.round(correct / total * 100) : 0;

function read<T>(key: string, fallback: T, store: Store | null): T {
  try {const raw = store?.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback;} catch {return fallback;}
}
export function loadProgress(region: string, store: Store | null = defaultStore()): ProgressMap {
  const out: ProgressMap = {};
  // lessons cleared with two or three stars in the old level 2 count as passed
  const legacy = loadResults(region, store);
  for (const [key, r] of Object.entries(legacy)) if (r && typeof r === 'object' && (r.stars ?? 0) >= 2) out[key] = {passed: true, best: Math.max(80, Math.round(r.accuracy ?? 80)), tries: 1, at: String(r.at ?? '')};
  const value = read<unknown>(KEY(region), {}, store);
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, p] of Object.entries(value as Record<string, LessonProgress>)) {
      if (!p || typeof p !== 'object') continue;
      const old = out[key];
      out[key] = {started: typeof p.started === 'string' ? p.started : undefined, passed: !!p.passed || !!old?.passed, best: Math.max(Number(p.best) || 0, old?.best ?? 0), tries: Number(p.tries) || 0, at: String(p.at ?? '')};
    }
  }
  return out;
}
export function saveProgress(region: string, progress: ProgressMap, store: Store | null = defaultStore()) {
  try {store?.setItem(KEY(region), JSON.stringify(progress));} catch {/* storage unavailable or full: progress lives only for this session */}
}
/** Opening a lesson marks it as in progress. */
export function markStarted(progress: ProgressMap, key: string, day: string): ProgressMap {
  const old = progress[key];
  return {...progress, [key]: {passed: old?.passed ?? false, best: old?.best ?? 0, tries: old?.tries ?? 0, at: old?.at ?? '', started: old?.started ?? day}};
}
/** The result of a pass test: the best score and the pass flag are kept (a worse later attempt never takes a pass away). */
export function recordTest(progress: ProgressMap, key: string, correct: number, total: number, day: string): ProgressMap {
  const old = progress[key], pct = percentOf(correct, total);
  return {...progress, [key]: {started: old?.started ?? day, passed: (old?.passed ?? false) || passes(correct, total), best: Math.max(old?.best ?? 0, pct), tries: (old?.tries ?? 0) + 1, at: day}};
}

export type LessonState = 'passed' | 'current' | 'locked';
/** Within one category the lessons form a chain: the first is open, every other one opens when the one before it is passed. `unlockAll` opens everything. */
export function stateOf(lessons: Pick<Lesson, 'key'>[], index: number, keyOf: (l: Pick<Lesson, 'key'>) => string, progress: ProgressMap, unlockAll = false): LessonState {
  if (progress[keyOf(lessons[index])]?.passed) return 'passed';
  if (unlockAll || index === 0 || progress[keyOf(lessons[index - 1])]?.passed) return 'current';
  return 'locked';
}
/** Lessons of every category in order, with the state of each; the structure of the map. */
export function mapOf(lessons: Lesson[], keyOf: (l: Pick<Lesson, 'key'>) => string, progress: ProgressMap, unlockAll = false) {
  const groups = new Map<string, Lesson[]>();
  for (const l of lessons) groups.set(l.category, [...(groups.get(l.category) ?? []), l]);
  return [...groups.entries()].map(([category, items]) => ({category, items: items.map((lesson, i) => ({lesson, state: stateOf(items, i, keyOf, progress, unlockAll)}))}));
}
/** The structures of a lesson that the learner got wrong in the Quiz, the pass test or the mock exam and has not answered correctly since. */
export const needReview = (ids: string[], flagged: Set<string>) => ids.filter(id => flagged.has(id));

export function loadUnlockAll(store: Store | null = defaultStore()): boolean {
  return !!read<{unlockAll?: boolean}>(SETTINGS, {}, store).unlockAll;
}
export function saveUnlockAll(on: boolean, store: Store | null = defaultStore()) {
  try {store?.setItem(SETTINGS, JSON.stringify({unlockAll: on}));} catch {/* not remembered */}
}
