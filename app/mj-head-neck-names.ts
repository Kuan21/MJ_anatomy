import data from './mj-head-neck-names.json';
import requiredData from './mj-required-names.json';

/**
 * Unified head-and-neck names (app/mj-head-neck-names.json): one Taiwan anatomy name per structure and the other spellings and synonyms as aliases.
 * Search (app/mj-search.ts) and the typed-answer Quiz (app/quiz/synonyms.ts) both read this table, so a structure is found and accepted under every wording.
 * A row with status "not-applied" is an open owner decision and is never read here.
 */
export interface NameEntry {en: string; zh: string; enAliases: string[]; zhAliases: string[]}
export interface NameRow {id: string; kind: 'synonym' | 'spelling' | 'typo'; status: 'applied' | 'not-applied'; display: string; reason?: string; entries: NameEntry[]}
export const NAME_ROWS = (data as {rows: NameRow[]}).rows;
export const APPLIED_ROWS = NAME_ROWS.filter(r => r.status === 'applied');
/** HN-11: structures whose shown Chinese name follows the required-structure wording; the earlier site wording stays as an alias (app/mj-required-names.json). */
export const REQUIRED_NAME_ROWS = (requiredData as {rows: NameRow[]}).rows;
const ENTRIES = [...APPLIED_ROWS, ...REQUIRED_NAME_ROWS].flatMap(r => r.entries);

/** Variant characters of the same word: 頷 = 頜 (jaw), 腭 = 顎 (palate). Either spelling finds the structure whichever one the site shows. */
export const foldVariants = (s: string) => s.replace(/頷/g, '頜').replace(/腭/g, '顎');
/** Key of an English name: lower case, side words and punctuation dropped (the same shape as the search's own base name). */
export const englishKey = (n: string) => n.toLowerCase().replace(/\.[lr](\.\d+)?$/, '').replace(/\b(left|right)\b/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();

const zhAliases = new Map<string, string[]>(), enAliases = new Map<string, string[]>();
const push = (map: Map<string, string[]>, key: string, values: string[]) => { if (key) map.set(key, [...new Set([...(map.get(key) ?? []), ...values])]); };
for (const e of ENTRIES) {
  push(zhAliases, foldVariants(e.zh), e.zhAliases);
  const english = [e.en, ...e.enAliases];
  for (const n of english) push(enAliases, englishKey(n), [...english.filter(o => o !== n), e.zh, ...e.zhAliases]);
}

/** Other Chinese wordings of a structure, given its Chinese name without 左／右. */
export const headNeckZhAliases = (zh: string): string[] => zhAliases.get(foldVariants(zh)) ?? [];
/** Other English and Chinese wordings of a structure, given its English name. */
export const headNeckEnAliases = (name: string): string[] => (enAliases.get(englishKey(name)) ?? []).map(a => a.toLowerCase());

/** Rows for the Quiz synonym table: keyed by every English wording (lower case, without left/right), each accepting the other wordings and the Chinese names. */
export function headNeckSynonyms(): Record<string, {en: string[]; zh: string[]}> {
  const out: Record<string, {en: string[]; zh: string[]}> = {};
  for (const e of ENTRIES) {
    const english = [e.en, ...e.enAliases], chinese = [e.zh, ...e.zhAliases];
    for (const n of english) {
      const key = n.toLowerCase().replace(/\s+/g, ' ').trim(), row = out[key] ?? (out[key] = {en: [], zh: []});
      row.en = [...new Set([...row.en, ...english.filter(o => o !== n).map(o => o.toLowerCase())])];
      row.zh = [...new Set([...row.zh, ...chinese])];
    }
  }
  return out;
}
