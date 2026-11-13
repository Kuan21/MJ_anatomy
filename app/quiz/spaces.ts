import {SPACES, type SpaceDef, type SpaceGroup, type SpaceItem} from '../mj-spaces';
import type {QuizRegionId, QuizSpace, QuizSystem, SpaceRole} from './catalogue';

/**
 * Limb spaces in the quiz (category 特殊空間與孔): the special regions of the layer panel (app/mj-spaces.ts) that lie in the upper or the lower limb.
 * A space has no mesh of its own. A question draws the real structures that bound it (boundaries, roof, floor) and that pass through it (contents), exactly the
 * structures the layer panel names, and fades everything else; no plane, disc, cylinder or invented shape is added. The rules here are pure, so that
 * scripts/prepare-quiz.mjs (build) and scripts/test-quiz-spaces.mjs (check) read the same decisions; docs/quiz-spaces.md states them.
 */
export type SpaceExclusion = 'not-limb' | 'no-range' | 'unclear-centre' | 'few-walls' | 'no-contents' | 'name-not-unique';
export const SPACE_EXCLUSION_REASONS: Record<SpaceExclusion, string> = {
  'not-limb': '不在上肢或下肢（背部、胸腔的特殊空間尚未開放測驗）',
  'no-range': '沒有各側的中心點資料（app/space-ranges.json），無法把鏡頭對準這個空間',
  'unclear-centre': '各邊界構造的交會處不明確（交會距離超過 5 公分），畫面無法指出空間位置',
  'few-walls': '題庫裡畫得出來的邊界、頂與底構造不到兩個，或所列邊界、頂與底項目有一半以上題庫沒有',
  'no-contents': '題庫裡沒有任何一項通過的內容物可以畫出',
  'name-not-unique': '名稱與同部位其他構造重複',
};
/** Distance (metres) between the meeting point of the boundaries and the farthest boundary or content structure above which the position of the space is not clear. */
export const MAX_REACH = .05;
/** The quiz region a special region belongs to; null = not a limb space. The lesser sciatic foramen opens the pelvis towards the gluteal region, which the lower-limb quiz covers. */
export const SPACE_REGION: Record<SpaceGroup, QuizRegionId | null> = {shoulder: 'upper-limb', arm: 'upper-limb', hand: 'upper-limb', lower: 'lower-limb', pelvis: 'lower-limb', head: null, trunk: null};
/** Systems whose structures can be members (the systems of the limb quizzes that have meshes). */
export const MEMBER_SYSTEMS: QuizSystem[] = ['skeletal', 'muscular', 'tendon', 'nervous', 'arterial', 'venous'];

export interface SpaceCandidate {id: string; name: string; system: QuizSystem; side: 'left' | 'right' | 'midline'}
export interface SpaceItemRole {item: SpaceItem; role: SpaceRole}
/** The items of a special region by role. The related structures nearby are not part of the space and are not drawn. */
export function spaceItems(def: SpaceDef): SpaceItemRole[] {
  return [...def.boundaries.map(item => ({item, role: 'boundary' as const})), ...(def.roof ?? []).map(item => ({item, role: 'roof' as const})), ...(def.floor ?? []).map(item => ({item, role: 'floor' as const})),
    ...def.contents.map(item => ({item, role: 'content' as const}))];
}
/** The structures of one side of a region's catalogue that stand for an item (by the same name patterns the layer panel uses; nerves by their base name). */
export function itemStructures(item: SpaceItem, side: 'left' | 'right', structures: SpaceCandidate[]): SpaceCandidate[] {
  const nerve = item.nerve ? `${side} ${item.nerve.toLowerCase()}` : undefined;
  return structures.filter(s => MEMBER_SYSTEMS.includes(s.system) && (s.side === side || s.side === 'midline') && (nerve ? s.name.toLowerCase() === nerve : !!item.re && item.re.test(s.name.toLowerCase())));
}
export interface SpaceResolution {members: QuizSpace['members']; notDrawn: string[]; walls: number; wallsDrawn: number; wallStructures: number; contentsDrawn: number}
export function resolveSpace(def: SpaceDef, side: 'left' | 'right', structures: SpaceCandidate[]): SpaceResolution {
  const members: QuizSpace['members'] = [], notDrawn: string[] = [], seen = new Set<string>();
  let walls = 0, wallsDrawn = 0, contentsDrawn = 0;
  for (const {item, role} of spaceItems(def)) {
    const found = itemStructures(item, side, structures);
    if (role !== 'content') walls++;
    if (!found.length) {notDrawn.push(item.en); continue;}
    if (role === 'content') contentsDrawn++; else wallsDrawn++;
    for (const s of found) if (!seen.has(s.id)) {seen.add(s.id); members.push({id: s.id, role, item: item.en});}
  }
  return {members, notDrawn, walls, wallsDrawn, wallStructures: members.filter(m => m.role !== 'content').length, contentsDrawn};
}
/** Why a space cannot be a question (before the check for a unique name), or null. `reach` is the meeting-point distance from app/space-ranges.json (undefined = no entry). */
export function spaceExclusion(def: SpaceDef, region: QuizRegionId | null, reach: number | undefined, found: SpaceResolution | undefined): SpaceExclusion | null {
  if (!region) return 'not-limb';
  if (reach === undefined) return 'no-range';
  if (reach > MAX_REACH) return 'unclear-centre';
  if (!found || found.wallStructures < 2 || found.wallsDrawn * 2 < found.walls) return 'few-walls';
  if (!found.contentsDrawn) return 'no-contents';
  return null;
}
export const LIMB_SPACES = SPACES.filter(def => SPACE_REGION[def.group]);
