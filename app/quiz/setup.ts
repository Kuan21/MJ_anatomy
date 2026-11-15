import {QUIZ_CATEGORIES, QUIZ_REGIONS, orderedRegions, questionPool, regionIds, type QuizCatalogue, type QuizCategory, type QuizRegionId, type QuizSettings, type QuizSide} from './catalogue';
import {namingPool} from './level2';
import {defaultStore, type Store} from './lesson-progress';

/** Quiz setup screen: which regions and sections, which kinds of structure, how many questions and which level. Pure rules (pool, split of the question count, saved setup, the plan
 * that the run page plays) so that they can be tested. The regions come from QUIZ_REGIONS: a region added there is offered without any change here. */
export type QuizLevel = 1 | 3;
export interface QuizSetup {
  /** region id -> chosen section ids ('all' = the whole region); a region that is absent is not chosen. */
  regions: Record<string, string[]>;
  categories: QuizCategory[];
  side: QuizSide;
  level: QuizLevel;
  /** 5, 10, 20, 'all' or any number typed in. */
  count: number | 'all';
  language: 'en' | 'zh' | 'any';
  needSide: boolean;
  scope: 'all' | 'summary';
  remember: boolean;
}
export const COUNT_CHOICES = [5, 10, 20] as const;
export const MAX_COUNT = 500;
const ALL_CATEGORIES = QUIZ_CATEGORIES.map(c => c.id);
export const defaultSetup = (): QuizSetup => ({regions: {}, categories: ALL_CATEGORIES, side: 'right', level: 1, count: 10, language: 'any', needSide: false, scope: 'all', remember: true});

const KEY = 'mj-quiz-setup';
/** Reads the remembered setup; anything unreadable, or naming a region or category that no longer exists, is dropped (never an exception). */
export function loadSetup(store: Store | null = defaultStore()): QuizSetup {
  const base = defaultSetup();
  try {
    const raw = store?.getItem(KEY); if (!raw) return base;
    const v = JSON.parse(raw) as Partial<QuizSetup>;
    const known = new Set<string>(regionIds());
    const regions: Record<string, string[]> = {};
    for (const [id, sections] of Object.entries(v.regions ?? {})) if (known.has(id) && Array.isArray(sections)) {
      const valid = new Set(QUIZ_REGIONS[id as QuizRegionId].sections.map(s => s.id));
      const keep = sections.filter(x => typeof x === 'string' && valid.has(x));
      regions[id] = keep.length ? keep : ['all'];
    }
    const categories = Array.isArray(v.categories) ? v.categories.filter((c): c is QuizCategory => ALL_CATEGORIES.includes(c as QuizCategory)) : base.categories;
    return {
      regions, categories: categories.length ? categories : base.categories,
      side: v.side === 'left' || v.side === 'both' ? v.side : 'right', level: v.level === 3 ? 3 : 1,
      count: v.count === 'all' ? 'all' : Number.isInteger(v.count) && (v.count as number) > 0 ? Math.min(v.count as number, MAX_COUNT) : base.count,
      language: v.language === 'en' || v.language === 'zh' ? v.language : 'any', needSide: !!v.needSide, scope: v.scope === 'summary' ? 'summary' : 'all', remember: v.remember !== false,
    };
  } catch { return base; }
}
/** Stored only when 「記住設定」 is on; switching it off forgets the saved setup. */
export function saveSetup(setup: QuizSetup, store: Store | null = defaultStore()) {
  try { if (setup.remember) store?.setItem(KEY, JSON.stringify(setup)); else store?.removeItem(KEY); } catch { /* not remembered */ }
}

/** The settings one region of the setup turns into. A single section keeps the scene on that section; several sections (or none specific) show the whole region. */
export function settingsFor(setup: QuizSetup, regionId: string): QuizSettings {
  const sections = setup.regions[regionId] ?? ['all'], whole = sections.includes('all');
  return {section: !whole && sections.length === 1 ? sections[0] : 'all', sections: whole ? undefined : sections, systems: [], categories: setup.categories, side: setup.side, scope: setup.scope, count: 9999};
}
export const poolFor = (catalogue: QuizCatalogue, setup: QuizSetup, regionId: string) => setup.level === 3 ? namingPool(catalogue, settingsFor(setup, regionId)) : questionPool(catalogue, settingsFor(setup, regionId));

/** n questions shared out over the regions in proportion to the size of their pools (largest remainder); every region with a pool gets at least one when n allows, and no region gets more than its pool. */
export function splitCount(total: number | 'all', sizes: Record<string, number>): Record<string, number> {
  const ids = Object.keys(sizes).filter(id => sizes[id] > 0), sum = ids.reduce((n, id) => n + sizes[id], 0), out: Record<string, number> = Object.fromEntries(Object.keys(sizes).map(id => [id, 0]));
  if (!sum) return out;
  const n = total === 'all' ? sum : Math.min(total, sum);
  if (total === 'all' || n >= sum) {for (const id of ids) out[id] = sizes[id]; return out;}
  // one each first (when there is room), then the rest by size
  let left = n;
  if (n >= ids.length) {for (const id of ids) out[id] = 1; left -= ids.length;}
  const room = (id: string) => sizes[id] - out[id], weights = ids.map(id => ({id, w: room(id)})), wSum = weights.reduce((a, b) => a + b.w, 0);
  const shares = weights.map(({id, w}) => ({id, exact: wSum ? left * w / wSum : 0}));
  for (const s of shares) {const take = Math.min(Math.floor(s.exact), room(s.id)); out[s.id] += take; left -= take;}
  for (const s of [...shares].sort((a, b) => (b.exact % 1) - (a.exact % 1) || (a.id < b.id ? -1 : 1))) {if (left <= 0) break; if (room(s.id) > 0) {out[s.id]++; left--;}}
  for (const id of ids) while (left > 0 && room(id) > 0) {out[id]++; left--;}
  return out;
}

export interface QuizBlock {region: QuizRegionId; count: number}
export interface QuizPlan {level: QuizLevel; language: QuizSetup['language']; needSide: boolean; setup: QuizSetup; blocks: QuizBlock[]}
/** The plan the run page plays: one block per chosen region, in the order of the choosers. */
export function planOf(setup: QuizSetup, pools: Record<string, number>): QuizPlan {
  const counts = splitCount(setup.count, pools);
  const order = orderedRegions().map(r => r.id);
  return {level: setup.level, language: setup.language, needSide: setup.needSide, setup,
    blocks: Object.keys(counts).filter(id => counts[id] > 0).sort((a, b) => order.indexOf(a as QuizRegionId) - order.indexOf(b as QuizRegionId)).map(id => ({region: id as QuizRegionId, count: counts[id]}))};
}
const PLAN_KEY = 'mj-quiz-plan';
let memoryPlan: QuizPlan | null = null;
/** The plan is handed to the run page through the session (so a reload keeps it); without storage a module variable does it. */
export function savePlan(plan: QuizPlan, store: Store | null = (() => {try {return typeof sessionStorage === 'undefined' ? null : sessionStorage;} catch {return null;}})()) {
  memoryPlan = plan;
  try {store?.setItem(PLAN_KEY, JSON.stringify(plan));} catch {/* kept in memory */}
}
export function loadPlan(store: Store | null = (() => {try {return typeof sessionStorage === 'undefined' ? null : sessionStorage;} catch {return null;}})()): QuizPlan | null {
  try {const raw = store?.getItem(PLAN_KEY); if (raw) {const v = JSON.parse(raw) as QuizPlan; if (Array.isArray(v?.blocks) && v.blocks.length) return v;}} catch {/* fall through */}
  return memoryPlan;
}
