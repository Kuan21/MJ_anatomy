/** Mistakes of the quiz, remembered per region and level in this browser (nothing leaves the device). Level 1 = find the structure, level 2 = guided lessons, level 3 = type the name. */
const KEY = (scope: string) => `mj-quiz-mistakes:${scope}`;
export const scopeOf = (region: string, level: 1 | 2 | 3) => `${region}:L${level}`;
type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> & Partial<Pick<Storage, 'key' | 'length'>>;
const local = (): Store | null => { try { return typeof localStorage === 'undefined' ? null : localStorage; } catch { return null; } };
export function loadMistakes(scope: string, store: Store | null = local()): string[] {
  try {const raw = store?.getItem(KEY(scope)); const list = raw ? JSON.parse(raw) : []; return Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : [];} catch {return [];}
}
export function saveMistakes(scope: string, ids: string[], store: Store | null = local()) {
  try {if (ids.length) store?.setItem(KEY(scope), JSON.stringify([...new Set(ids)])); else store?.removeItem(KEY(scope));} catch {/* storage unavailable: the list lives only for this session */}
}
export function addMistakes(scope: string, ids: string[], solved: string[] = [], store: Store | null = local()): string[] {
  const next = [...new Set([...loadMistakes(scope, store).filter(id => !solved.includes(id)), ...ids])];
  saveMistakes(scope, next, store); return next;
}
export const clearMistakes = (scope: string) => saveMistakes(scope, []);

/** The typed-name quiz used to be level 2 and is now level 3: mistakes saved under `…:L2` move to `…:L3` once. The marker is written first, so a second run (or a later
 * level-2 mistake, which now belongs to the lessons) is never moved; each list is written under its new key before the old one is removed, so nothing is lost. Returns how many lists moved. */
export const MIGRATION_MARK = 'mj-quiz-mistakes-migrated:L2-to-L3';
export function migrateMistakes(store: Store | null = local()): number {
  if (!store) return 0;
  try {
    if (store.getItem(MIGRATION_MARK)) return 0;
    const old: string[] = [];
    if (typeof store.length === 'number' && store.key) for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (key && /^mj-quiz-mistakes:.+:L2$/.test(key)) old.push(key);
    }
    store.setItem(MIGRATION_MARK, new Date().toISOString());
    let moved = 0;
    for (const key of old) {
      const target = key.replace(/:L2$/, ':L3');
      const merged = [...new Set([...loadMistakes(target.slice('mj-quiz-mistakes:'.length), store), ...loadMistakes(key.slice('mj-quiz-mistakes:'.length), store)])];
      if (merged.length) store.setItem(target, JSON.stringify(merged));
      store.removeItem(key); moved++;
    }
    return moved;
  } catch { return 0; }
}
