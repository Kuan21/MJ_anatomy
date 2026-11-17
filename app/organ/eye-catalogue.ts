import type {OrganSectionState} from './organ-detail-layout';

/** One structure of the eye detail mode, as the viewer reports it once the model is loaded. */
export interface EyePartInfo {
  id: string;
  name: string;
  zh: string;
  text: string;
  textZh: string;
  /** index into EYE_LAYERS (0 = bony orbit, outermost) */
  layer: number;
  group: string;
  groupZh: string;
}

export type EyeView = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom' | 'home' | 'fit' | 'look';

export interface EyeViewState {
  /** structures switched off (the bony orbit starts switched off) */
  hidden: string[];
  /** steps of EYE_PEEL already taken, from the outside in */
  peel: number;
  isolate: string | null;
  selectedId: string | null;
  section: OrganSectionState;
  /** layer separation, 0–100 */
  explode: number;
  movementId: string | null;
  openingsOpen: boolean;
  openingId: string | null;
  /** camera request: a new id moves the camera once */
  command: {id: number; view: EyeView; focus?: string[]; opening?: string};
}

/**
 * Peeling order of the eye, outside in. Each step hides the listed layers (indexes of EYE_LAYERS in app/mj-eye-atlas.ts).
 * The optic nerve with the visual pathway and the lens are never peeled: they are what is left at the end.
 */
export const EYE_PEEL: {layers: number[]; en: string; zh: string}[] = [
  {layers: [0, 1, 2], en: 'Eyelids, conjunctiva, lacrimal apparatus', zh: '眼瞼與結膜、淚器'},
  {layers: [3, 4, 5], en: 'Extraocular muscles, orbital nerves, ophthalmic artery', zh: '眼外肌、眼眶神經、眼動脈'},
  {layers: [7, 8], en: 'Fibrous coat (sclera and cornea), aqueous outflow', zh: '纖維層（鞏膜與角膜）、房水排出路徑'},
  {layers: [9, 12], en: 'Iris and ciliary body, choroid', zh: '虹膜與睫狀體、脈絡膜'},
  {layers: [13, 14], en: 'Retina and its landmarks', zh: '視網膜與視網膜標誌'},
  {layers: [11], en: 'Aqueous humour and vitreous body', zh: '房水與玻璃體'},
];
export const EYE_MAX_PEEL = EYE_PEEL.length;

/** The step (1-based) that hides a layer, or 0 when the layer is never peeled. */
export const peelStepOf = (layer: number): number => EYE_PEEL.findIndex(s => s.layers.includes(layer)) + 1;
