// Abdomen and pelvis-and-perineum quizzes: pure rules shared by scripts/prepare-quiz.mjs (builds public/models/quiz-abdomen.json and quiz-pelvis.json), the viewer and scripts/test-quiz-trunk.mjs.
// The pool is the structures the main site already draws in the region (app/mj-region-bar.ts decides the region, the rules below set aside what belongs to an organ detail mode or to another region,
// and give each structure its system, section and depth layer). Documented in docs/quiz-trunk.md.
import type {QuizSystem} from './catalogue';

export type TrunkRegion = 'abdomen' | 'pelvis';
/** How deep an organ lies when the abdomen is looked at from the front: what lies in front of a deeper target is drawn as faint glass while the target is the question (see coversTrunkTarget). */
export type TrunkLayer = 'front' | 'middle' | 'deep';
const DEPTH: Record<TrunkLayer, number> = {front: 0, middle: 1, deep: 2};

export const TRUNK_EXCLUSION_REASONS: Record<string, string> = {
  'organ-detail': '肝實質、膽道樹、胰實質、腎內血管等器官內部構造：由器官詳細模式的 Quiz 出題，不在本區重複',
  'other-region': '屬於其他區域（胸腔、背部、下肢）的 Quiz',
  'no-chinese-name': '沒有可核對的中文名',
  'unsided-copy': '另有左右分開的同名構造，這個沒有左右的副本不出題',
  'name-not-unique': '同名或同中文名的另一構造無法分辨，打字作答會沒有唯一答案',
};

/** Parts of the liver, bile ducts, pancreas and kidney that the organ detail modes ask, and the vessel twigs inside an organ (segmental branches and tributaries). */
const ORGAN_INTERNAL = /segmental|hepatovenous|tributar|biliary tree|duct tree|parenchyma|lobe branch|division of|ureteric segment|(?:caudate|quadrate|right|left) lobe of liver|branch of (?:left|right) (?:hepatic artery|portal vein)|branch of .* branch of/i;
/** Meshes the main atlas holds that run through several regions or belong to another region's quiz. */
const OTHER_REGION = /^(?:descending aorta|thoracic duct)$|latissimus dorsi|^(?:left |right )?superior phrenic (?:artery|vein)$/i;

/** Names of the abdomen pool that are the same structure under two names of the model (a trunk and the vessel itself, the old and new spelling): the second is drawn with the first. */
export const TRUNK_MERGE: Record<string, {name: string; chinese?: string; midline?: true}> = {
  // the model names one mesh of the inferior vena cava "right"; it is the one unpaired vein
  'right inferior vena cava': {name: 'Inferior vena cava', midline: true},
  'celiac trunk': {name: 'Celiac artery'},
  'trunk of superior mesenteric artery': {name: 'Superior mesenteric artery'},
  'trunk of left renal artery': {name: 'Left renal artery'},
  'trunk of right renal artery': {name: 'Right renal artery'},
  'trunk of left portal vein': {name: 'Left portal vein'},
  'trunk of right portal vein': {name: 'Right portal vein'},
  'trunk of left hepatic artery': {name: 'Left hepatic artery', chinese: '左肝動脈'},
  'trunk of right hepatic artery': {name: 'Right hepatic artery', chinese: '右肝動脈'},
  'trunk of gastroduodenal artery': {name: 'Gastroduodenal artery', chinese: '胃十二指腸動脈'},
  'marginal colic artery': {name: 'Marginal artery of colon'},
  'pre-hepatic portal vein': {name: 'Hepatic portal vein'},
  // the jejunum and ileum are drawn in thirds in the model; the quiz asks the whole organ
  'proximal part of jejunum': {name: 'Jejunum', chinese: '空腸'}, 'middle part of jejunum': {name: 'Jejunum', chinese: '空腸'}, 'distal part of jejunum': {name: 'Jejunum', chinese: '空腸'},
  'proximal part of ileum': {name: 'Ileum', chinese: '迴腸'}, 'middle part of ileum': {name: 'Ileum', chinese: '迴腸'}, 'distal part of ileum': {name: 'Ileum', chinese: '迴腸'},
};

/** A left or right in the name that is part of the structure's identity (left gastric artery, right colic vein, left hepatic duct), not a side of the body: such a structure is drawn as an unpaired one. */
export const IDENTITY_SIDE = /\b(?:left|right) (?:gastric|gastro-?epiploic|colic|hepatic|portal)\b/i;

/** The quiz system of an atlas part of the abdomen or pelvis: bones and cartilage → skeletal, muscle, vessels and nerves as in the atlas; organs, peritoneal folds, ligaments and fasciae → trunkorgan. */
export function trunkSystem(atlasSystem: string, name: string): QuizSystem | null {
  switch (atlasSystem) {
    case 'skeletal': return 'skeletal';
    case 'muscular': return 'muscular';
    case 'nervous': return 'nervous';
    case 'arterial': return 'arterial';
    case 'venous': return 'venous';
    case 'connective': return /costal cartilage|intervertebral/i.test(name) ? 'skeletal' : 'trunkorgan';
    case 'digestive': case 'urinary': case 'endocrine': case 'lymphatic': case 'reproductive': case 'serous': return 'trunkorgan';
    default: return null;
  }
}

/** Why a candidate of the abdomen is not asked (null = asked). */
export function abdomenExclusion(name: string): string | null {
  if (ORGAN_INTERNAL.test(name)) return 'organ-detail';
  if (OTHER_REGION.test(name)) return 'other-region';
  return null;
}

const plain = (name: string) => name.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/\s+/g, ' ').trim();

/** Sections of the abdomen quiz (one per structure; categories cut across them). */
export function abdomenSection(name: string, system: QuizSystem): string {
  const n = plain(name);
  if (system === 'skeletal') return 'bones';
  if (system === 'nervous') return 'nerves';
  if (system === 'arterial' || system === 'venous') return /epigastric|subcostal/.test(n) ? 'wall' : 'vessels';
  if (system === 'muscular') return /psoas|iliacus|quadratus lumborum|diaphragm/.test(n) ? 'retro' : 'wall';
  if (/linea alba|rectus sheath|inguinal ligament|aponeurosis|conjoint|inguinal|arcuate line/.test(n)) return 'wall';
  if (/kidney|ureter|adrenal|suprarenal|hiatus|renal fascia/.test(n)) return 'retro';
  if (/gallbladder|cystic duct|hepatic duct|bile duct|pancrea|spleen|liver|hepatoduodenal|hepatogastric/.test(n)) return 'hpbs';
  return 'gut';
}

/** Depth of the organs of the abdomen seen from the front (decides which organs are glass while a deeper one is the question). Only organs of the trunkorgan system have a layer. */
export function abdomenLayerOf(name: string): TrunkLayer | undefined {
  const n = plain(name);
  // the front wall (rectus sheath, linea alba, inguinal ligament) lies in front of every organ
  if (/rectus sheath|linea alba|inguinal ligament/.test(n)) return 'front';
  if (/stomach|transverse colon|jejunum|ileum|sigmoid colon|mesentery|transverse mesocolon|omentum|taenia/.test(n) && !/duodenojejunal/.test(n)) return 'front';
  if (/pancreas|pancreatic duct|duoden|ascending colon|descending colon|cecum|ileocecal|appendix|mesoappendix|spleen|gallbladder|cystic duct|hepatic duct/.test(n)) return 'middle';
  if (/kidney|adrenal|ureter|hiatus/.test(n)) return 'deep';
  return undefined;
}

/** `other` is drawn as faint glass (and cannot be picked) while `target` is the question when it lies in front of the target: an organ of a shallower layer. */
export function coversTrunkTarget(target: {layer?: string} | undefined, other: {layer?: string}): boolean {
  const a = DEPTH[target?.layer as TrunkLayer], b = DEPTH[other.layer as TrunkLayer];
  return a !== undefined && b !== undefined && b < a;
}

/** Names of the abdomen nerves of the nerve overlay that the quiz asks (the other nerves of the overlay belong to the limb, thorax or head-and-neck quizzes). */
export const ABDOMEN_NERVES: Record<string, {zh: string}> = {
  'iliohypogastric nerve': {zh: '髂腹下神經'},
  'ilio-inguinal nerve': {zh: '髂腹股溝神經'},
  'genitofemoral nerve': {zh: '生殖股神經'},
  'femoral branch of genitofemoral nerve': {zh: '生殖股神經股支'},
  'genital branch of genitofemoral nerve': {zh: '生殖股神經生殖支'},
  'lateral femoral cutaneous nerve': {zh: '外股皮神經'},
  'femoral nerve': {zh: '股神經'},
  'obturator nerve': {zh: '閉孔神經'},
};

export interface TrunkNameItem {name: string; chinese?: string; side: 'left' | 'right' | 'midline'; system: string}
const plainEn = (t: string) => t.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/[^a-z0-9]+/g, '');
const plainZh = (t: string) => t.replace(/^[左右]/, '').replace(/\s+/g, '');
/** Structures of one system that share a name once left and right are taken out (or one Chinese name on two English names): a typed name would have no single right answer. Same rule as the head and neck. */
export function trunkNameClashes<T extends TrunkNameItem>(items: T[]): Map<string, T[]> {
  const out = new Map<string, T[]>(), seen = new Map<string, Map<string, T>>();
  const note = (key: string, it: T) => {const m = seen.get(key) ?? seen.set(key, new Map()).get(key)!; m.set(`${it.system}|${it.side}|${it.name.toLowerCase()}`, it);};
  for (const it of items) {note('en:' + plainEn(it.name), it); if (it.chinese) note('zh:' + plainZh(it.chinese), it);}
  for (const [key, members] of seen) {
    const list = [...members.values()], names = new Set(list.map(x => `${x.system}|${plainEn(x.name)}`));
    if (names.size > 1 || (list.some(x => x.side === 'midline') && list.some(x => x.side !== 'midline'))) out.set(key, list);
  }
  return out;
}
