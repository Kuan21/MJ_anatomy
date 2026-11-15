/** Level 2 (學習關卡): stars, typing speed, lesson results and the spaced-review schedule. Pure rules with an injectable `today` and an injectable storage, so that
 * they can be tested; every storage read and write is wrapped, and the quiz still works with no storage at all (progress then lives only for the session). */
export type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export function defaultStore(): Store | null {
  try { return typeof localStorage === 'undefined' ? null : localStorage; } catch { return null; }
}
function readJson<T>(key: string, fallback: T, store: Store | null): T {
  try { const raw = store?.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
}
function writeJson(key: string, value: unknown, store: Store | null) {
  try { store?.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable or full: progress lives only for this session */ }
}

// ---- stars ----
/** Round 3 (憑記憶) counts first attempts only; `wrongs` is the number of first attempts that were not correct in rounds 2 and 3 (wrong, close, or 「我不知道」). */
export interface StarInput {round3Total: number; round3Correct: number; wrongs: number}
/** 3 stars: every round-3 answer correct at the first attempt and at most MAX_WRONGS_FOR_THREE wrong first attempts in all (rounds 2 and 3 together).
 * 2 stars: round-3 accuracy of at least 80%.  1 star: round-3 accuracy of at least 50% (the lesson counts as cleared).  0 stars: below 50%. */
export const STAR_RULES = {three: {accuracy: 1, maxWrongs: 2}, two: 0.8, one: 0.5};
export function starsFor({round3Total, round3Correct, wrongs}: StarInput): 0 | 1 | 2 | 3 {
  if (round3Total <= 0) return 0;
  const accuracy = round3Correct / round3Total;
  if (accuracy >= STAR_RULES.three.accuracy && wrongs <= STAR_RULES.three.maxWrongs) return 3;
  if (accuracy >= STAR_RULES.two) return 2;
  if (accuracy >= STAR_RULES.one) return 1;
  return 0;
}

// ---- typing speed ----
/** One typed answer: its text and the milliseconds from the first key press to sending it. */
export interface TypedEntry {text: string; ms: number}
/** Words per minute with the usual convention: five Latin characters make a word; each Chinese character counts as one word. Accuracy is correct first attempts over first attempts. */
export function wordsOf(text: string): number {
  const cjk = (text.match(/[㐀-鿿]/g) ?? []).length;
  return cjk + (text.replace(/[㐀-鿿\s]/g, '').length) / 5;
}
export function typingSpeed(entries: TypedEntry[]): number | null {
  const ms = entries.reduce((n, e) => n + Math.max(0, e.ms), 0), words = entries.reduce((n, e) => n + wordsOf(e.text), 0);
  return ms >= 1000 && words > 0 ? Math.round(words / (ms / 60000)) : null;
}
export const accuracyOf = (correct: number, total: number) => total > 0 ? Math.round(correct / total * 100) : 0;

// ---- lesson results (best stars per lesson) ----
export interface LessonResult {stars: 0 | 1 | 2 | 3; accuracy: number; wpm: number | null; at: string}
export type LessonResults = Record<string, LessonResult>;
const RESULTS = (region: string) => `mj-quiz-lessons:${region}`;
/** Results are kept per region and per scope (side, section, scope), under the lesson key. */
export const resultKey = (scopeKey: string, lessonKey: string) => `${scopeKey}/${lessonKey}`;
export function loadResults(region: string, store: Store | null = defaultStore()): LessonResults {
  const value = readJson<unknown>(RESULTS(region), {}, store);
  return value && typeof value === 'object' && !Array.isArray(value) ? value as LessonResults : {};
}
/** Keeps the best star count of a lesson (a worse later attempt does not remove stars); the latest speed and accuracy are kept. */
export function recordResult(results: LessonResults, key: string, next: LessonResult): LessonResults {
  const old = results[key];
  return {...results, [key]: {...next, stars: Math.max(old?.stars ?? 0, next.stars) as 0 | 1 | 2 | 3}};
}
export function saveResults(region: string, results: LessonResults, store: Store | null = defaultStore()) { writeJson(RESULTS(region), results, store); }
/** 'N 關 · 已通過 M · ★ x/y' */
export function summarise(keys: string[], results: LessonResults) {
  const stars = keys.reduce((n, k) => n + (results[k]?.stars ?? 0), 0), cleared = keys.filter(k => (results[k]?.stars ?? 0) >= 1).length;
  return {lessons: keys.length, cleared, stars, maxStars: keys.length * 3, text: `${keys.length} 關 · 已通過 ${cleared} · ★ ${stars}/${keys.length * 3}`};
}

// ---- spaced review ----
/** A structure answered correctly is reviewed after 1, 3, 7, 14 and 30 days; a wrong answer goes back to 1 day. */
export const REVIEW_DAYS = [1, 3, 7, 14, 30];
export interface ReviewEntry {stage: number; due: string}
export type ReviewState = Record<string, ReviewEntry>;
const pad = (n: number) => String(n).padStart(2, '0');
/** Local calendar day as YYYY-MM-DD. */
export const dayKey = (date: Date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export function addDays(day: string, days: number): string {
  const [y, m, d] = day.split('-').map(Number), date = new Date(Date.UTC(y, m - 1, d + days));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}
/** First correct answer: due in 1 day. A correct answer on or after the due day moves one step along 1, 3, 7, 14, 30 days (the last step repeats); a correct answer before
 * the due day changes nothing. A wrong answer sets the structure back to 1 day. */
export function applyReview(state: ReviewState, id: string, correct: boolean, today: string = dayKey()): ReviewState {
  const old = state[id];
  if (!correct || !old) return {...state, [id]: {stage: 0, due: addDays(today, REVIEW_DAYS[0])}};
  if (old.due > today) return state;
  const stage = Math.min(old.stage + 1, REVIEW_DAYS.length - 1);
  return {...state, [id]: {stage, due: addDays(today, REVIEW_DAYS[stage])}};
}
/** Structures due on `today` (due day today or earlier), most overdue first. */
export function dueIds(state: ReviewState, today: string = dayKey()): string[] {
  return Object.entries(state).filter(([, e]) => e && e.due <= today).sort((a, b) => a[1].due < b[1].due ? -1 : a[1].due > b[1].due ? 1 : a[0] < b[0] ? -1 : 1).map(([id]) => id);
}
const REVIEW = (region: string) => `mj-quiz-review:${region}`;
export function loadReview(region: string, store: Store | null = defaultStore()): ReviewState {
  const value = readJson<unknown>(REVIEW(region), {}, store), out: ReviewState = {};
  if (value && typeof value === 'object' && !Array.isArray(value)) for (const [id, e] of Object.entries(value as Record<string, ReviewEntry>)) if (e && typeof e.due === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.due) && Number.isInteger(e.stage)) out[id] = {stage: Math.min(Math.max(e.stage, 0), REVIEW_DAYS.length - 1), due: e.due};
  return out;
}
export function saveReview(region: string, state: ReviewState, store: Store | null = defaultStore()) { writeJson(REVIEW(region), state, store); }
