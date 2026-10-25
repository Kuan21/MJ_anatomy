/** One mesh of the Brain Project model (Z-Anatomy / BodyParts3D), named and grouped for the detail viewer. */
export interface BrainPart {
  id: string;
  /** English name without side or mesh suffix, e.g. "Central sulcus" */
  en: string;
  zh: string;
  side: 'left' | 'right' | 'mid';
  /** the model's own category (bx_cat) and region (bx_region) */
  cat: string;
  region: string;
  group: string;
  /** peel order of the group: 0 = outermost layer, -1 = never peeled (vessels, nerves) */
  layer: number;
}
export interface BrainGroup {id: string; en: string; zh: string; layer: number; /** shown when the viewer opens */ on: boolean}

export type SectionAxis = 'none' | 'sagittal' | 'coronal' | 'horizontal';
export interface SectionState {axis: SectionAxis; offset: number; flip: boolean}
export type BrainView = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom' | 'fit';
export interface BrainViewState {
  hiddenGroups: string[];
  hiddenParts: string[];
  /** outer layers already peeled away: groups with a layer number below this are hidden (vessels and nerves are never peeled) */
  peel: number;
  /** structures drawn alone when set (Isolate) */
  isolate: string[] | null;
  selectedIds: string[];
  section: SectionState;
  command: {id: number; view: BrainView; focus?: string[]};
}
/** The model's axes: +x is the body's left, +y up, +z anterior. */
export const SECTION_AXES: Record<Exclude<SectionAxis, 'none'>, {index: 0 | 1 | 2; en: string; zh: string; cut: string}> = {
  sagittal: {index: 0, en: 'Sagittal', zh: '矢狀面', cut: '左右'},
  coronal: {index: 2, en: 'Coronal', zh: '冠狀面', cut: '前後'},
  horizontal: {index: 1, en: 'Horizontal (axial)', zh: '水平面', cut: '上下'},
};
