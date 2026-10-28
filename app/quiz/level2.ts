import {structureCard} from './card';
import {cleanKey} from './naming';
/** Left/right belongs to the name of a midline structure (left atrium); for a paired one it is the side. */
const identity = (s: QuizStructure) => `${s.side === 'midline' ? s.name.toLowerCase().replace(/\s+/g, ' ').trim() : cleanKey(s.name)}|${s.side}`;
import type {QuizCatalogue, QuizSettings, QuizStructure} from './catalogue';
import {questionPool} from './catalogue';

/** Level 2 (看結構寫名稱) only asks about a structure that has a model, a Chinese name, a complete data card, and a name no other structure of the region shares
 * (so the typed name has one right answer). Everything else stays out of the pool and is listed in REVIEW_LOG.md. */
export type Exclusion = 'no-chinese-name' | 'card-incomplete' | 'name-not-unique';
export function exclusionOf(structure: QuizStructure, counts: Map<string, number>): Exclusion | null {
  if (!structure.chinese) return 'no-chinese-name';
  if (structureCard(structure).missing.length) return 'card-incomplete';
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
