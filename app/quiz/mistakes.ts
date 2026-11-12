/** Mistakes of the level-2 quiz, remembered per region and level in this browser (nothing leaves the device). */
const KEY = (scope: string) => `mj-quiz-mistakes:${scope}`;
export const scopeOf = (region: string, level: 1 | 2) => `${region}:L${level}`;
export function loadMistakes(scope: string): string[] {
  try {const raw = localStorage.getItem(KEY(scope)); const list = raw ? JSON.parse(raw) : []; return Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : [];} catch {return [];}
}
export function saveMistakes(scope: string, ids: string[]) {
  try {if (ids.length) localStorage.setItem(KEY(scope), JSON.stringify([...new Set(ids)])); else localStorage.removeItem(KEY(scope));} catch {/* storage unavailable: the list lives only for this session */}
}
export function addMistakes(scope: string, ids: string[], solved: string[] = []): string[] {
  const next = [...new Set([...loadMistakes(scope).filter(id => !solved.includes(id)), ...ids])];
  saveMistakes(scope, next); return next;
}
export const clearMistakes = (scope: string) => saveMistakes(scope, []);
