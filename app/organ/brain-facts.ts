import type {BrainPart} from './brain-types';
import type {BrainFact} from './brain-facts-types';
import {FACTS as CORTEX1} from './brain-facts-cortex1';
import {FACTS as CORTEX2} from './brain-facts-cortex2';
import {FACTS as DEEP} from './brain-facts-deep';
import {FACTS as TRACTS} from './brain-facts-tracts';
import {FACTS as STEM} from './brain-facts-stem';
import {FACTS as VESSELS} from './brain-facts-vessels';
export type {BrainFact} from './brain-facts-types';

/** Cards of the brain structures in the model, written for this atlas in English (position, function, neighbours, blood supply and, for cortex, the Brodmann area). Each structure name matches exactly one rule. */
export const BRAIN_FACTS: [RegExp, BrainFact][] = [...CORTEX1, ...CORTEX2, ...DEEP, ...TRACTS, ...STEM, ...VESSELS];

export function factOf(part: Pick<BrainPart, 'en'>): BrainFact | null {
  for (const [re, fact] of BRAIN_FACTS) if (re.test(part.en)) return fact;
  return null;
}
/** A card that fits several differently named structures is a group description, not one written for that structure: mark those so the list and the card say so. */
export function markSharedFacts(names: string[]) {
  const unique = [...new Set(names)];
  for (const [re, fact] of BRAIN_FACTS) fact.shared = unique.filter(n => re.test(n)).length > 1;
}
