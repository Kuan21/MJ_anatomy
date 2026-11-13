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
