// The ONE table of names (and quiz availability) that differ from the Brain Project model's own labels. It is read by
//   - app/organ/brain-catalogue.ts (describeBrainNode: main brain viewer, its search and cards, the structure list the information cards are checked against),
//   - scripts/prepare-search-index.mjs (the site search),
//   - scripts/prepare-quiz.mjs (the brain quiz: names, side check, which levels ask the structure).
// A node is found by its model label and, when `side` is given, its side. `en` is the name shown instead (the Chinese name is looked up for the new English name).
// Nothing here moves or reshapes a mesh.

/** Where a structure may be asked. levels: the Quiz levels that ask it (1 = find the structure, 3 = type the name); lessons: the guided lessons (level 2); exam: the future mock exam pool. */
export interface BrainQuizAvailability {levels: (1 | 3)[]; lessons: boolean; exam: boolean}
export interface BrainOverride {
  label: string;
  side?: 'left' | 'right' | 'mid';
  en?: string;
  /** the side the mesh must really lie on, checked against its position by scripts/prepare-quiz.mjs: left meshes lie at +x of the brain package frame, right at -x, a midline mesh within 3 mm of x = 0 */
  x?: 'positive' | 'negative' | 'near-zero';
  quiz?: BrainQuizAvailability;
  /** one labelled line on the information card (card text of the structure: docs/neuro-card-text/x002.json says the same) */
  note?: {zh: string; en: string};
  why: string;
}

export const DECUSSATION_NOTE = {
  zh: '示意結構，表示纖維交叉的位置，非真實形狀；位於中腦下丘水平、導水管前方的被蓋內',
  en: 'Schematic structure marking where the fibres cross; not a real shape; it lies in the midbrain tegmentum at the level of the inferior colliculi, in front of the cerebral aqueduct.',
};

export const BRAIN_OVERRIDES: BrainOverride[] = [
  // The model has three meshes labelled "Superior cerebellar peduncle": one on each side in the cerebellum group and one in the white-matter group on the midline.
  // The midline one is a closed tube about 3 mm thick whose ends touch the two peduncles and whose middle arches forward and up into the midbrain at the level of the
  // inferior colliculi, in front of the aqueduct (numbers: docs/quiz-brain.md): the decussation of the superior cerebellar peduncles. Confirmed by the owner 2026-11-13.
  {label: 'Superior cerebellar peduncle', side: 'left', x: 'positive', why: '左側小腦上腳（確認網格位置在腦的左側）'},
  {label: 'Superior cerebellar peduncle', side: 'right', x: 'negative', why: '右側小腦上腳（確認網格位置在腦的右側）'},
  {label: 'Superior cerebellar peduncle', side: 'mid', en: 'Decussation of superior cerebellar peduncles', x: 'near-zero', note: DECUSSATION_NOTE,
    quiz: {levels: [3], lessons: false, exam: false},
    why: '中線的第三個「上小腦腳」網格依位置是小腦上腳交叉'},
  // The model writes the segments of the middle cerebral artery in three ways ("M1-segment", "M2-segment", "M3 segment"/"M3-segment", "(M2)"): the hyphen form is the most used, so every pair is written that way.
  {label: 'Middle cerebral artery (M3 segment)', en: 'Middle cerebral artery (M3-segment)', why: '左右一對英文寫法統一為 M3-segment'},
  {label: 'Insular branches of middle cerebral artery (M2)', en: 'Insular branches of middle cerebral artery (M2-segment)', why: '左右一對英文寫法統一為 M2-segment'},
];

/** The override of a node (model label without side, side as the brain viewer reads it). */
export const brainOverrideOf = (label: string, side: 'left' | 'right' | 'mid'): BrainOverride | undefined => BRAIN_OVERRIDES.find(o => o.label === label && (!o.side || o.side === side));
