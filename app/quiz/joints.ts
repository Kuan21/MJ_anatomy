import {includeJoint, jointKind, type JointKind} from '../biomechanics-v2/joint-filter';
import type {QuizRegionId} from './catalogue';

/**
 * Joint soft tissue in the quiz (category 關節): capsules, labra, menisci, articular discs and joint ligaments of public/models/joints.glb.
 * The rules here are pure so that scripts/prepare-quiz.mjs (build) and scripts/test-quiz-joints.mjs (check) read the same decisions; docs/quiz-joints.md states them.
 */
export type JointRegion = QuizRegionId | 'pelvis' | 'head-neck';
export type JointExclusion = 'not-joint' | 'aggregate-capsule' | 'region-missing' | 'in-atlas' | 'bracket-name' | 'no-chinese-name' | 'name-not-unique';
export const JOINT_EXCLUSION_REASONS: Record<JointExclusion, string> = {
  'not-joint': '不是關節構造（脂肪墊、關節囊繫帶、肋間膜、閉孔膜、方形膜）',
  'aggregate-capsule': '一個模型涵蓋多個關節的合併關節囊，無法對應單一關節',
  'region-missing': '所屬部位（骨盆、頭頸）尚未開放測驗',
  'in-atlas': '圖譜已有同名構造（屬其他系統），不重複出題',
  'bracket-name': '名稱括號內是另一構造（半月板）的名稱，輸入答案時會與該構造混淆（前、後脛側半月板韌帶各 2 條）',
  'no-chinese-name': '缺中文名',
  'name-not-unique': '名稱與同部位其他關節構造重複',
};

const PELVIS = /pubic|interpubic|sacrococcygeal|iliolumbar|sacrotuberous|sacrospinous|sacro-?iliac|intercornual/;
const HEAD_NECK = /temporomandibular|sphenomandibular|stylohyoid|stylomandibular|cricothyroid|thyrohyoid|cricopharyngeal/;
const SPINE = /^(?:anterior|posterior) longitudinal ligament|^ligamenta flava|^interspinous ligament|^supraspinous ligament|^nuchal ligament/;
const COSTOVERTEBRAL = /costotransverse|head of rib|costovertebral/;
const SHOULDER_GIRDLE = /sternoclavicular|interclavicular/;
const NOT_JOINT = /fat pad|frenula|intercostal membrane|obturator membrane|quadrangular membrane/;
const AGGREGATE_CAPSULE = /^articular capsules of /;

/** Name as the quiz shows it, without the side word: lower case, brackets kept. */
export const jointKey = (name: string) => name.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/\s+/g, ' ').trim();

/** The quiz region a joint structure belongs to. Limb tissues follow the atlas region of their anchor bone (anatomicalRegion); the pelvis, spine and neck are decided by name. */
export function jointRegion(name: string, anchorRegion: string): JointRegion | 'trunk-other' {
  const n = jointKey(name);
  if (HEAD_NECK.test(n)) return 'head-neck';
  if (PELVIS.test(n)) return 'pelvis';
  if (SPINE.test(n)) return 'back';
  if (COSTOVERTEBRAL.test(n)) return 'thorax';
  if (SHOULDER_GIRDLE.test(n)) return 'upper-limb';
  if (anchorRegion === 'upper-limb' || anchorRegion === 'lower-limb') return anchorRegion;
  return 'trunk-other';
}

/** Why a joint structure cannot be a question (before the per-region checks for Chinese name and unique name), or null. */
export function jointExclusion(name: string, region: JointRegion | 'trunk-other', inAtlas: boolean, chinese?: string): JointExclusion | null {
  const n = jointKey(name);
  if (NOT_JOINT.test(n)) return 'not-joint';
  if (AGGREGATE_CAPSULE.test(n)) return 'aggregate-capsule';
  if (/\(.*\)/.test(n)) return 'bracket-name';
  if (region === 'pelvis' || region === 'head-neck' || region === 'trunk-other') return 'region-missing';
  if (inAtlas) return 'in-atlas';
  if (!chinese) return 'no-chinese-name';
  return null;
}
/** A kind label for reports. The meniscotibial ligaments carry the meniscus name in brackets and are ligaments, not menisci. */
export const jointKindOf = (name: string): JointKind => /\(.*\)/.test(name) ? 'ligament' : jointKind(name);
export {includeJoint};
