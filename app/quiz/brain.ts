// Brain quiz (Quiz → 器官 → 腦): which structures of the brain package are asked, in which section and category, and which are not (every exclusion has a reason).
// Pure rules shared by scripts/prepare-quiz.mjs (builds public/models/quiz-brain.json), the viewer and scripts/test-quiz-brain.mjs. Documented in docs/quiz-brain.md.
// The groups are the ones of the brain viewer (app/organ/brain-catalogue.ts BRAIN_GROUPS); this file never changes them.

/** Sections of the brain quiz and the brain-viewer groups each one holds. */
export const BRAIN_SECTION_GROUPS: Record<string, string[]> = {
  frontal: ['frontal'],
  parietal: ['parietal'],
  temporal: ['temporal'],
  occipital: ['occipital'],
  limbic: ['limbic', 'insula', 'interlobar', 'cortex-other'],
  basal: ['basal'],
  diencephalon: ['diencephalon'],
  ventricles: ['ventricles'],
  white: ['white'],
  brainstem: ['brainstem'],
  cerebellum: ['cerebellum'],
  cranial: ['cranial'],
  vessels: ['arteries', 'veins'],
};
/** The section of a brain-viewer group (undefined: the group is not asked, e.g. the meninges). */
export const brainSectionOf = (group: string): string | undefined => Object.keys(BRAIN_SECTION_GROUPS).find(id => BRAIN_SECTION_GROUPS[id].includes(group));

/**
 * What lies in front of a structure when the brain is looked at from outside (decides which structures are drawn as glass in a question, see coversBrainTarget):
 *  cortex     the surface of the cerebral hemispheres (lobes, gyri, sulci)
 *  inset      cortex buried in the lateral sulcus (insula, Heschl's gyri, temporal plane): only the surface cortex lies in front of it
 *  envelope   the large solids that wrap deeper structures (midbrain, pons, medulla, white matter of the hemisphere)
 *  cerebellum the cerebellar surface
 *  tract      the white-matter tracts and commissures: thin bundles that cross the deep structures
 *  deep       everything else inside: basal nuclei, thalamus and hypothalamus, ventricles, brainstem nuclei, hippocampus, cerebellar peduncles
 *  open       structures that are seen from outside without anything in front of them (vessels, nerve roots) or that only wrap nothing
 */
export type BrainLayer = 'cortex' | 'inset' | 'envelope' | 'cerebellum' | 'tract' | 'deep' | 'open';
const ENVELOPE = /^(?:midbrain|pons|medulla oblongata|white matter of telencephalon)$/i;
const INSET = /^(?:insula|circular sulcus of insula|transverse temporal gyri|temporal plane)\b/i;
const CORTEX_GROUPS = /^(?:frontal|parietal|temporal|occipital|limbic|interlobar|cortex-other)$/;
export function brainLayerOf(group: string, english: string): BrainLayer {
  if (group === 'insula' || INSET.test(english)) return 'inset';
  if (/^hippocampus$/i.test(english)) return 'deep';
  if (CORTEX_GROUPS.test(group)) return 'cortex';
  if (ENVELOPE.test(english)) return 'envelope';
  if (group === 'cerebellum') return /peduncle$/i.test(english) ? 'deep' : 'cerebellum';
  if (group === 'white') return 'tract';
  if (group === 'brainstem' || group === 'basal' || group === 'diencephalon' || group === 'ventricles') return 'deep';
  return 'open';
}
/** `other` is drawn as glass (and cannot be picked) while `target` is the question: a deep structure is looked at through the cortex, the cerebellum, the wrapping solids and the tracts that cross it; a tract through the cortex,
 * the cerebellum and the wrapping solids (the other tracts stay solid: they are the choices); buried cortex through the surface cortex. */
export function coversBrainTarget(target: {layer?: BrainLayer} | undefined, other: {layer?: BrainLayer}): boolean {
  if (!target?.layer || !other.layer) return false;
  if (target.layer === 'deep') return other.layer === 'cortex' || other.layer === 'inset' || other.layer === 'envelope' || other.layer === 'cerebellum' || other.layer === 'tract';
  if (target.layer === 'tract') return other.layer === 'cortex' || other.layer === 'inset' || other.layer === 'envelope' || other.layer === 'cerebellum';
  if (target.layer === 'inset' || target.layer === 'envelope') return other.layer === 'cortex';
  return false;
}

/** Branches of the cranial nerves that run outside the skull (face, jaw) or on the dura: the brain viewer switches them off, so the quiz does not ask them either (same list as app/organ/brain-viewer.ts PERIPHERAL_NERVE). */
export const PERIPHERAL_NERVE = /^(?:buccal|mental|inferior alveolar|lingual) nerve$|^(?:anterior|posterior) division of mandibular nerve$|^meningeal branch of maxillary nerve$/i;

export type BrainExclusion = 'schematic' | 'meninges' | 'not-brain' | 'peripheral-nerve' | 'no-drawable-mesh' | 'no-chinese-name' | 'name-not-unique';
export const BRAIN_EXCLUSION_REASONS: Record<BrainExclusion, string> = {
  schematic: '示意構造：模型本身沒有，主站腦部畫面以橢球或管狀示意形狀補上；測驗只用真實網格，不考示意形狀',
  meninges: '腦膜（硬腦膜反摺）：包覆整個腦，會遮住其他題目，主站腦部畫面預設也關閉',
  'not-brain': '屬於脊髓或脊椎的構造（脊髓、脊髓動脈、椎動脈）：主站腦部畫面同樣不畫',
  'peripheral-nerve': '走在顱外（臉、下頷）或硬腦膜上的腦神經分支：主站腦部畫面預設關閉，只留腦神經根部',
  'no-drawable-mesh': '來源模型中沒有可畫的網格',
  'no-chinese-name': '缺中文名',
  'name-not-unique': '名稱與同部位其他構造重複（打出名稱沒有唯一答案）',
};

/** The brain viewer's category of a node, as a quiz system: nerve roots are nerves, vessels are arteries and veins, everything else is a brain structure (category 器官結構). */
export const brainSystemOf = (group: string): 'nervous' | 'arterial' | 'venous' | 'brain' => group === 'cranial' ? 'nervous' : group === 'arteries' ? 'arterial' : group === 'veins' ? 'venous' : 'brain';

/** Bounding-box centre x (metres, brain package frame) a mesh named in app/organ/brain-overrides.ts must have: left meshes lie at +x, right at -x, a midline mesh within 3 mm of the midline. */
export const renameSideOk = (rule: {x?: 'positive' | 'negative' | 'near-zero'}, centreX: number) => !rule.x || (rule.x === 'positive' ? centreX > .003 : rule.x === 'negative' ? centreX < -.003 : Math.abs(centreX) < .003);

/**
 * Name clashes of the brain meshes (docs/quiz-brain-pool.md 「同名檢查」). A base name is the English name without Left/Right, lower case, letters and digits only. A clash is
 *  (i) the same base name on a left, a right and a midline mesh, (ii) two meshes of the same side, (iii) three or more meshes, (iv) one base name in two groups or one Chinese name
 *  (without 左/右) on two base names, (v) a left/right pair whose English spellings differ. The ones that exist are listed in BRAIN_NAME_CLASHES with what they are and what to do;
 *  scripts/test-quiz-brain.mjs fails for a clash that is not listed and for a listed one that is gone.
 */
export const BRAIN_NAME_CLASHES: Record<string, string> = {
  'superior cerebellar peduncle': '模型有三個同名網格（左、右小腦上腳與一個中線白質網格）。左右兩個維持「左小腦上腳」「右小腦上腳」並正常出題；中線網格依位置改名為「小腦上腳交叉」（使用者已確認），只開放第三級。改名表：`app/organ/brain-overrides.ts`。',
  'middle cerebral artery (m3 segment)': '左右一對的英文寫法不一致（M3 segment／M3-segment）。已統一為 M3-segment（模型裡 M1、M2 也多用連字號），中文名「大腦中動脈（M3 段）」不變；主站與測驗同步。',
  'insular branches of middle cerebral artery (m2)': '左右一對的英文寫法不一致（M2／M2-segment）。已統一為 M2-segment，中文名統一為「大腦中動脈島支（M2 段）」；主站與測驗同步。',
};

export interface BrainNameItem {name: string; chinese?: string; side: 'left' | 'right' | 'midline'; group: string; cx: number}
export interface BrainNameClash<T extends BrainNameItem = BrainNameItem> {key: string; kinds: string[]; members: T[]}
const plainName = (t: string) => t.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/segment/g, '').replace(/[^a-z0-9]+/g, '');
const plainZh = (t: string) => t.replace(/[左右]/g, '').replace(/\s+/g, '');
/** Every name clash among `items` (see BRAIN_NAME_CLASHES for the kinds). Keys: the lower-case base name, or `zh:` + the Chinese name without 左/右 for a Chinese name used by two structures. */
export function brainNameClashes<T extends BrainNameItem>(items: T[]): BrainNameClash<T>[] {
  const out: BrainNameClash<T>[] = [], by = new Map<string, T[]>(), zh = new Map<string, T[]>();
  for (const it of items) {
    const k = plainName(it.name);
    if (!by.has(k)) by.set(k, []);
    by.get(k)!.push(it);
    if (it.chinese) {const z = plainZh(it.chinese); if (!zh.has(z)) zh.set(z, []); zh.get(z)!.push(it);}
  }
  const rawBase = (x: T) => x.name.replace(/\b(Left|Right) /g, '').replace(/\s+/g, ' ').trim().toLowerCase();
  for (const l of by.values()) {
    const n = (s: string) => l.filter(x => x.side === s).length, kinds: string[] = [];
    if (n('left') && n('right') && n('midline')) kinds.push('i 左、右、中線三者同名');
    if (n('left') > 1 || n('right') > 1 || n('midline') > 1) kinds.push('ii 同側兩個以上同名');
    if (l.length >= 3) kinds.push('iii 三個以上同名');
    if (new Set(l.map(x => x.group)).size > 1) kinds.push('iv 同名但分屬不同群組');
    if (new Set(l.map(rawBase)).size > 1) kinds.push('v 左右一對但英文寫法不一致');
    if (kinds.length) out.push({key: l.map(rawBase).sort()[0], kinds, members: l});
  }
  for (const l of zh.values()) {
    if (new Set(l.map(x => plainName(x.name))).size > 1) out.push({key: `zh:${l[0].chinese!.replace(/^[左右]/, '')}`, kinds: ['iv 同一中文名用在不同構造'], members: l});
  }
  return out;
}
