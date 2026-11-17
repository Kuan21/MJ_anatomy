// Eye quiz (Quiz → 器官 → 眼): which structure lies in front of another when the left orbit is looked at from outside (decides what is drawn as glass in a question, see coversEyeTarget).
// The depth follows the peel order of the eye detail mode (app/organ/eye-catalogue.ts EYE_PEEL, layers of app/mj-eye-atlas.ts EYE_LAYERS): bony orbit, eyelids and lacrimal apparatus, the contents of the orbit
// (muscles, nerves, artery, optic nerve), the fibrous coat, the uvea, the retina and lens, the landmarks of the retina. The aqueous humour and the vitreous body are transparent: they are glass in every question except their own.

export type EyeLayer = 'bone' | 'opening' | 'adnexa' | 'orbital' | 'fibrous' | 'uveal' | 'inner' | 'landmark' | 'media';
const DEPTH: Record<EyeLayer, number> = {bone: 0, opening: .5, adnexa: 1, orbital: 2, fibrous: 3, uveal: 4, inner: 5, landmark: 6, media: 7};
/** The depth layer of a structure of the eye model, by the index of its layer in EYE_LAYERS (0 bony orbit … 14 retinal landmarks). */
export function eyeLayerOf(layerIndex: number): EyeLayer {
  switch (layerIndex) {
    case 0: return 'bone';
    case 1: case 2: return 'adnexa';
    case 3: case 4: case 5: case 6: return 'orbital';
    case 7: case 8: return 'fibrous';
    case 9: case 12: return 'uveal';
    case 10: case 13: return 'inner';
    case 14: return 'landmark';
    case 11: return 'media';
    default: throw new Error(`unknown eye layer ${layerIndex}`);
  }
}
/** `other` is drawn as faint glass (and cannot be picked) while `target` is the question when it lies outside the target (every structure of an outer layer) or is a transparent medium of the eye. */
export function coversEyeTarget(target: {layer?: string} | undefined, other: {layer?: string}): boolean {
  const a = DEPTH[target?.layer as EyeLayer], b = DEPTH[other.layer as EyeLayer];
  if (a === undefined || b === undefined) return false;
  if (other.layer === 'media') return target?.layer !== 'media';
  return b < a;
}

/** Other wordings of the structures of the eye model that the typed-answer quiz accepts (keyed by the structure's name in lower case); the wording of the required-structure list comes first.
 * The same shape as app/quiz/synonyms.ts, kept here so that the owner's review list (REVIEW_LOG.md, frozen) is not involved. */
export const EYE_NAME_ROWS: Record<string, {en?: string[]; zh?: string[]}> = {
  'suspensory ligament of lens': {en: ['zonular fibers', 'zonule', 'ciliary zonule'], zh: ['懸韌帶', '小帶纖維']},
  'aqueous humor': {en: ['aqueous humour'], zh: ['水樣狀液']},
  'vitreous body': {en: ['vitreous humor', 'vitreous humour'], zh: ['玻璃狀液']},
  'corneoscleral junction': {en: ['corneal limbus', 'limbus'], zh: ['角膜緣']},
  'optic disc': {en: ['blind spot', 'optic nerve head'], zh: ['盲點', '視神經盤']},
  'trochlea of superior oblique': {en: ['trochlea'], zh: ['上斜肌滑車']},
  'maxillary bone': {en: ['maxilla'], zh: ['上頜骨', '上顎骨']},
  'inferior orbital fissure': {en: ['infraorbital fissure'], zh: ['下眶裂']},
  'superior orbital fissure': {en: [], zh: ['上眶裂']},
  'supraorbital foramen': {en: ['supraorbital notch'], zh: ['眶上切跡']},
};
