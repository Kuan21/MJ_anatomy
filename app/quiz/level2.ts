import {cleanKey} from './naming';
/** Left/right belongs to the name of a midline structure (left atrium); for a paired one it is the side. */
const identity = (s: QuizStructure) => `${s.side === 'midline' ? s.name.toLowerCase().replace(/\s+/g, ' ').trim() : cleanKey(s.name)}|${s.side}`;
import type {QuizCatalogue, QuizSettings, QuizStructure} from './catalogue';
import {questionPool} from './catalogue';

/** Levels 1 and 2 share ONE question bank (scripts/check-quiz-banks.mjs fails the build when they differ). Level 2 (看結構寫名稱) can ask any structure that has a model,
 * a Chinese name, and a name no other structure of the region shares (so the typed name has one right answer). A structure whose data card still has empty fields is
 * asked as well: the answer card then shows 「尚無資料」 for those fields (listed in docs/quiz-card-gaps.md). A structure that cannot be asked is a build failure, not a silent drop. */
export type Exclusion = 'no-chinese-name' | 'name-not-unique';
export function exclusionOf(structure: QuizStructure, counts: Map<string, number>): Exclusion | null {
  if (!structure.chinese) return 'no-chinese-name';
  if ((counts.get(identity(structure)) ?? 0) > 1) return 'name-not-unique';
  return null;
}
export function nameCounts(catalogue: QuizCatalogue) {
  const counts = new Map<string, number>();
  for (const s of catalogue.structures) {const key = identity(s); counts.set(key, (counts.get(key) ?? 0) + 1);}
  return counts;
}
export function namingPool(catalogue: QuizCatalogue, settings: QuizSettings): QuizStructure[] {
  const counts = nameCounts(catalogue);
  return questionPool(catalogue, settings).filter(s => !exclusionOf(s, counts));
}

const boxDistance = (a: QuizStructure, b: QuizStructure) => {
  let d2 = 0;
  for (let i = 0; i < 3; i++) {const gap = Math.max(a.bounds[0][i] - b.bounds[1][i], b.bounds[0][i] - a.bounds[1][i], 0); d2 += gap * gap;}
  return Math.sqrt(d2);
};
const centre = (s: QuizStructure) => s.bounds[0].map((v, i) => (v + s.bounds[1][i]) / 2);
/** Two or three structures that lie next to the target (same side or midline, a different name), nearest first: the related structures of the answer card. */
export function neighbours(catalogue: QuizCatalogue, target: QuizStructure, count = 3): QuizStructure[] {
  const c = centre(target), seen = new Set([cleanKey(target.name)]);
  const near = catalogue.structures
    .filter(s => s.id !== target.id && (target.side === 'midline' || s.side === 'midline' || s.side === target.side))
    .map(s => ({s, d: boxDistance(target, s), m: Math.hypot(...centre(s).map((v, i) => v - c[i]))}))
    .sort((a, b) => a.d - b.d || a.m - b.m);
  const out: QuizStructure[] = [];
  // Same-system structures first (a muscle's neighbouring muscles), then the other systems.
  for (const pass of [true, false]) for (const {s} of near) {
    if (out.length >= count) break;
    const key = cleanKey(s.name);
    if (seen.has(key) || (s.system === target.system) !== pass) continue;
    seen.add(key); out.push(s);
  }
  return out;
}
