// Head-and-neck quiz (Quiz → 頭頸): which structures that already exist on the site are asked, in which section and category, and which are not (every exclusion has a reason).
// Pure rules shared by scripts/prepare-quiz.mjs (builds public/models/quiz-head-neck.json), the viewer and scripts/test-quiz-headneck.mjs. Documented in docs/quiz-head-neck.md.
// Nothing here builds or changes a 3D model: the pool is made of the atlas meshes (BodyParts3D, facial and supplement packages), the nerve overlay, the neck-vessel package and the joint tissues
// that the main site already draws. The brain has its own quiz region (app/quiz/brain.ts) and is not repeated here.
import type {QuizSystem} from './catalogue';

/** Sections of the head-and-neck quiz; each structure belongs to exactly one (the setup page lists them in this order). */
export const HN_SECTIONS = ['skull', 'cervical', 'face', 'neck', 'orbit', 'oral', 'nerves', 'vessels'] as const;
export type HeadNeckSection = typeof HN_SECTIONS[number];

export type HeadNeckExclusion = 'in-brain-region' | 'replaced-by-neck-vessel' | 'duplicate-source' | 'other-region' | 'left-right-merged' | 'not-structure' | 'too-fine' | 'incomplete-pair' | 'no-chinese-name' | 'name-not-unique';
export const HN_EXCLUSION_REASONS: Record<HeadNeckExclusion, string> = {
  'in-brain-region': '腦的構造（腦回、核團、腦室、白質纖維束、腦幹、小腦、腦膜、腦動脈與腦下垂體、松果體）：已有獨立的「腦」Quiz 區域，這裡不重複',
  'replaced-by-neck-vessel': '主站畫面用頸部血管模型取代這個圖譜網格（總頸動脈、內頸動脈、內頸靜脈）；測驗改用頸部血管模型，避免同一條血管出現兩次',
  'duplicate-source': '另一個來源已經有同一條構造（神經串流的完整走向取代圖譜較短的一段），只保留一個',
  'other-region': '屬於其他部位的測驗（胸椎、脊髓動脈、斜方肌、全身走行的交感神經與神經節）',
  'left-right-merged': '模型把左右合成同一個網格（外耳、眉毛），無法分左右，不符合左右必須分開的規則',
  'not-structure': '不是解剖構造（頭髮）',
  'too-fine': '模型只是一條極細的交通支，中文名與主幹相同，打出名稱沒有唯一答案',
  'incomplete-pair': '模型只有單側（另一側沒有），而且名稱不能單獨指出是哪一條構造',
  'no-chinese-name': '缺中文名',
  'name-not-unique': '名稱與同部位其他構造重複（打出名稱沒有唯一答案）',
};

/** Muscles of the neck that the atlas files under the trunk or the shoulder (the head-and-neck region of the atlas does not hold them) but that every neck description names. */
export const HN_EXTRA_MUSCLE = /^(?:left |right )?(?:platysma|levator scapulae|semispinalis cervicis|spinalis cervicis)$/i;

/** The quiz system of an atlas structure of the head and neck, or why it is not asked. `name` is lower case without left/right; `system` is the atlas system. */
export function headNeckSystem(name: string, system: string): {system: QuizSystem} | {exclusion: HeadNeckExclusion} {
  const n = name.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/\s+/g, ' ').trim();
  switch (system) {
    case 'skeletal':
      if (/tooth$|^gingiva/.test(n)) return {system: 'headorgan'};
      if (/^first thoracic vertebra$/.test(n)) return {exclusion: 'other-region'};
      return {system: 'skeletal'};
    case 'sensory':
      if (/lacrimal bone$/.test(n)) return {system: 'skeletal'};
      if (/^external ear$/.test(n)) return {exclusion: 'left-right-merged'};
      return {system: 'headorgan'};
    case 'respiratory':
      return /inferior nasal concha/.test(n) ? {system: 'skeletal'} : {system: 'headorgan'};
    case 'digestive': return {system: 'headorgan'};
    case 'endocrine': return {exclusion: 'in-brain-region'};
    case 'integumentary':
      if (/^eyebrow$/.test(n)) return {exclusion: 'left-right-merged'};
      if (/^hair of head$/.test(n)) return {exclusion: 'not-structure'};
      return {system: 'headorgan'};
    case 'connective':
      if (/intervertebral dis[ck]/.test(n)) return {system: 'skeletal'};
      return {system: 'headorgan'};
    case 'muscular':
      if (/^spinalis$|trapezius/.test(n)) return {exclusion: 'other-region'};
      return {system: 'muscular'};
    case 'tendon': return {system: 'tendon'};
    case 'nervous':
      if (/^communicating branch of /.test(n)) return {exclusion: 'too-fine'};
      return /\bnerve\b|ganglion/.test(n) ? {system: 'nervous'} : {exclusion: 'in-brain-region'};
    case 'arterial':
      if (/^(?:common|internal) carotid artery$/.test(n)) return {exclusion: 'replaced-by-neck-vessel'};
      if (/spinal artery/.test(n)) return {exclusion: 'other-region'};
      return /^(?:vertebral|ophthalmic|deep cervical|superficial cervical|inferior thyroid) artery$/.test(n) ? {system: 'arterial'} : {exclusion: 'in-brain-region'};
    case 'venous':
      return /^internal jugular vein$/.test(n) ? {exclusion: 'replaced-by-neck-vessel'} : {exclusion: 'other-region'};
    default: return {exclusion: 'other-region'};
  }
}

/** Chinese names the main site's dictionary gets wrong or leaves general for head-and-neck structures (side word not included; the key is the English name without left/right). */
export const HN_ZH: Record<string, string> = {
  'superior branch of oculomotor nerve': '動眼神經上支',
  'inferior branch of oculomotor nerve': '動眼神經下支',
  'short ciliary nerve': '短睫神經',
  'set of anterior cervical intertransversarii': '頸前橫突間肌群',
  'set of posterior cervical intertransversarii': '頸後橫突間肌群',
};

/** The cranial and cervical nerves of the nerve overlay that the quiz asks (the nerve stream keeps the complete course; the brain quiz only has the roots next to the brain). Keyed by the mesh name without .l/.r. */
export const HEADNECK_NERVES: Record<string, {zh: string; schematic?: boolean}> = {
  'olfactory nerve (i)': {zh: '嗅神經（第一對腦神經）'},
  'optic nerve (ii)': {zh: '視神經（第二對腦神經）'},
  'oculomotor nerve (iii)': {zh: '動眼神經（第三對腦神經）'},
  'trochlear nerve (iv)': {zh: '滑車神經（第四對腦神經）'},
  'trigeminal nerve (v)': {zh: '三叉神經（第五對腦神經）'},
  'abducens nerve (vi)': {zh: '外旋神經（第六對腦神經）'},
  'facial nerve (vii)': {zh: '顏面神經（第七對腦神經）'},
  'vestibulocochlear nerve (viii)': {zh: '前庭耳蝸神經（第八對腦神經）'},
  'glossopharyngeal nerve (ix)': {zh: '舌咽神經（第九對腦神經）'},
  'vagus nerve (x)': {zh: '迷走神經（第十對腦神經）'},
  'accessory nerve (xi)': {zh: '副神經（第十一對腦神經）'},
  'hypoglossal nerve (xii)': {zh: '舌下神經（第十二對腦神經）'},
  'sensory root of trigeminal nerve': {zh: '三叉神經感覺根'},
  'motor root of trigeminal nerve': {zh: '三叉神經運動根'},
  'ophthalmic nerve': {zh: '眼神經'},
  'maxillary nerve': {zh: '上頷神經'},
  'meningeal branch of maxillary nerve': {zh: '上頷神經腦膜支'},
  'anterior division of mandibular nerve': {zh: '下頷神經前股'},
  'posterior division of mandibular nerve': {zh: '下頷神經後股'},
  'inferior alveolar nerve': {zh: '下齒槽神經'},
  'mental nerve': {zh: '頦神經'},
  'buccal nerve': {zh: '頰神經'},
  'lingual nerve': {zh: '舌神經'},
  'nerve to mylohyoid muscle': {zh: '下頷舌骨肌神經'},
  'vestibular nerve': {zh: '前庭神經'},
  'cochlear nerve': {zh: '耳蝸神經'},
  // the schematic tube models of the back quiz (app/quiz/catalogue.ts BACK_NERVES): the cervical plexus and the dorsal rami at the neck
  'suboccipital nerve': {zh: '枕下神經', schematic: true},
  'greater occipital nerve': {zh: '枕大神經', schematic: true},
  'third occipital nerve': {zh: '第三枕神經', schematic: true},
  'lesser occipital nerve': {zh: '枕小神經', schematic: true},
  'great auricular nerve': {zh: '耳大神經', schematic: true},
};
/** Nerve overlay meshes of the head and neck that are not asked: sympathetic structures run along the whole body, the roots and trunks of the brachial plexus belong to the upper-limb quiz. */
export const HEADNECK_NERVE_OTHER = /sympathetic|spinal ganglion|root of spinal nerve|brachial plexus/i;

/** Where a structure lies in the head-and-neck quiz. `n` is the English name without left/right, lower case. */
export function headNeckSection(n: string, system: QuizSystem): HeadNeckSection {
  if (system === 'nervous') return 'nerves';
  if (system === 'arterial' || system === 'venous') return 'vessels';
  if (system === 'space') return /suboccipital/.test(n) ? 'neck' : 'skull';
  if (system === 'joint') return /cricopharyngeal|cricothyroid|thyrohyoid/.test(n) ? 'oral' : 'skull';
  if (/hyoid bone|vertebra|^atlas$|^axis$|intervertebral|stylohyoid ligament/.test(n) && !/muscle/.test(n)) return 'cervical';
  if (system === 'skeletal') return 'skull';
  if (/tendon of .*levator palpebrae|levator palpebrae|(?:superior|inferior|lateral|medial) rectus$|^(?:superior|inferior) oblique$|eyeball|choroid|cornea|iris$|lens|sclera|vitreous|retina|ciliaris|lacrimal|tarsal plate|trochlea of|common tendinous ring|check ligament|suspensory ligament/.test(n)) return 'orbit';
  if (/frontalis|occipitalis|orbicularis|corrugator|levator labii|zygomaticus|depressor labii|levator anguli|mentalis|depressor anguli|buccinator|risorius|masseter|^temporalis|pterygoid|^nasalis|procerus|temporoparietalis|depressor septi|epicranius/.test(n) && !/pterygomandibular|pharyn|palat/.test(n)) return 'face';
  if (system === 'muscular' || system === 'tendon') {
    if (/pharyn|palat|uvular|salping|genioglossus|hyoglossus|laryn|crico|arytenoid|aryepiglott|thyro-arytenoid|vocalis/.test(n) && !/hyoid/.test(n)) return 'oral';
    return 'neck';
  }
  return 'oral';
}

/** What lies in front of a structure when the eye is looked at from outside (decides which parts of the eyeball are drawn as glass in a question, see coversHeadNeckTarget). */
export type HeadNeckLayer = 'eye-outer' | 'eye-shell' | 'eye-fill' | 'eye-core';
export function headNeckLayerOf(n: string): HeadNeckLayer | undefined {
  if (/(?:^|\b)(?:sclera|cornea)$/.test(n)) return 'eye-outer';
  if (/choroid|retina/.test(n)) return 'eye-shell';
  if (/vitreous body|anterior chamber of/.test(n)) return 'eye-fill';
  if (/(?:^|\b)(?:lens|iris|corona ciliaris)$|suspensory ligament of/.test(n)) return 'eye-core';
  return undefined;
}
/** `other` is drawn as faint glass (and cannot be picked) while `target` is the question: an inner part of the eyeball is looked at through the outer coats of the same eye. */
export function coversHeadNeckTarget(target: {layer?: string; side?: string} | undefined, other: {layer?: string; side?: string}): boolean {
  if (!target?.layer || !other.layer || target.side !== other.side) return false;
  const depth: Record<string, number> = {'eye-outer': 0, 'eye-shell': 1, 'eye-fill': 2, 'eye-core': 3};
  const t = depth[target.layer], o = depth[other.layer];
  return t !== undefined && o !== undefined && o < t;
}

export interface HeadNeckNameItem {name: string; chinese?: string; side: 'left' | 'right' | 'midline'; system: string}
const plain = (t: string) => t.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/[^a-z0-9]+/g, '');
const plainZh = (t: string) => t.replace(/^[左右]/, '').replace(/\s+/g, '');
/** Structures of one quiz system that share a name once left and right are taken out (the same English name or the same Chinese name on different structures): a typed name would have no single right answer. Returns the keys. */
export function headNeckNameClashes<T extends HeadNeckNameItem>(items: T[]): Map<string, T[]> {
  const out = new Map<string, T[]>(), seen = new Map<string, Map<string, T>>();
  const note = (key: string, it: T) => {const m = seen.get(key) ?? seen.set(key, new Map()).get(key)!; m.set(`${it.system}|${it.side}|${it.name.toLowerCase()}`, it);};
  for (const it of items) {note('en:' + plain(it.name), it); if (it.chinese) note('zh:' + plainZh(it.chinese), it);}
  for (const [key, members] of seen) {
    const list = [...members.values()], names = new Set(list.map(x => `${x.system}|${plain(x.name)}`));
    // one English name on a left and a right structure (or on the one midline structure) is the normal pair
    // a midline structure and a left or right one of the same name cannot be told apart either
    if (names.size > 1 || (list.some(x => x.side === 'midline') && list.some(x => x.side !== 'midline'))) out.set(key, list);
  }
  return out;
}
