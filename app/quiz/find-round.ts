import type {QuizCatalogue, QuizRegionId, QuizStructure} from './catalogue';
import {relationOf} from './naming';

/** Rules of one "find it on the model" question, shared by the learning map (practice and pass test) and the Quiz: which structures are moved aside when the question opens,
 * and how a tap on the model is judged. */

/** Papillary muscles and valve leaflets sit inside the chambers, so a heart question about them opens with the chambers already moved aside. */
export function openingHidden(regionId: QuizRegionId, catalogue: QuizCatalogue, target?: QuizStructure): string[] {
  return regionId === 'heart' && target && (target.sections.includes('papillary') || target.sections.includes('valves') || target.sections.includes('interior'))
    ? catalogue.structures.filter(x => x.sections.includes('chambers')).map(x => x.id) : [];
}
/** The schematic interior and the pericardium would crowd every other heart question: they are drawn only when the question is about them. */
export function autoHidden(regionId: QuizRegionId, catalogue: QuizCatalogue, target?: QuizStructure): string[] {
  return regionId === 'heart' && target
    ? catalogue.structures.filter(x => (x.sections.includes('interior') && !target.sections.includes('interior')) || (x.sections.includes('pericardium') && !target.sections.includes('pericardium'))).map(x => x.id) : [];
}
export type PickVerdict = {ignore: true} | {ignore: false; right: boolean; relation?: 'typed-part' | 'typed-whole'};
/** A space has no mesh of its own: tapping one of the structures that bound it or pass through it is right. Another system than the target's is ignored (it is not offered as an answer). */
export function judgePick(target: QuizStructure, picked: QuizStructure | undefined): PickVerdict {
  const ofSpace = !!target.space;
  if (!picked || (!ofSpace && picked.system !== target.system)) return {ignore: true};
  const right = picked.id === target.id || (ofSpace && target.space!.members.some(m => m.id === picked.id));
  // a part of the target, or the whole the target belongs to, is close, not right
  const rel = right || ofSpace ? null : relationOf(picked, target);
  return {ignore: false, right, relation: rel ? (rel === 'part' ? 'typed-part' : 'typed-whole') : undefined};
}
