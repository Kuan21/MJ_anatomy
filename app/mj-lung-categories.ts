/**
 * Colour categories of the lung name labels (both lungs). One category = one colour on the model (a semi-transparent overlay), one tint on the label box,
 * one letter on the label so colour is never the only cue. `light` is used on the white label boxes and on the model; `dark` is the same hue lifted for dark label boxes.
 * Selection uses the glow outline of the viewer (never one of these colours), so a selected structure can be told from a coloured one.
 */
export type LungCategoryKey='artery'|'vein'|'tube'|'heart'|'bone'|'part'|'fissure'|'border'|'hilum';
export interface LungCategory{key:LungCategoryKey;letter:string;en:string;zh:string;hint:string;light:string;dark:string}
export const LUNG_CATEGORIES:LungCategory[]=[
 {key:'artery',letter:'A',en:'Arteries',zh:'動脈',hint:'subclavian, aortic arch, descending aorta, pulmonary, bronchial',light:'#c0392b',dark:'#ff8a7a'},
 {key:'vein',letter:'V',en:'Veins',zh:'靜脈',hint:'SVC, IVC, brachiocephalic, azygos, pulmonary veins',light:'#2f6fd0',dark:'#7fb0ff'},
 {key:'tube',letter:'T',en:'Digestive tube & airway',zh:'消化道與氣道',hint:'oesophagus, trachea, main bronchi',light:'#d9780f',dark:'#ffb066'},
 {key:'heart',letter:'C',en:'Heart & thymus',zh:'心與胸腺',hint:'cardiac impression, cardiac notch, thymus',light:'#7c4dbd',dark:'#c3a2f2'},
 {key:'bone',letter:'R',en:'Bony impression',zh:'骨性壓跡',hint:'first rib',light:'#b09060',dark:'#dcc592'},
 {key:'part',letter:'P',en:'Lung parts & surfaces',zh:'肺的部分與表面',hint:'apex, diaphragmatic surface, lingula',light:'#12908a',dark:'#55d6cc'},
 {key:'fissure',letter:'F',en:'Fissures',zh:'肺裂',hint:'oblique, horizontal',light:'#1f6b3a',dark:'#6fcb8f'},
 {key:'border',letter:'B',en:'Borders',zh:'緣',hint:'anterior, inferior',light:'#5b7a95',dark:'#9db9d1'},
 {key:'hilum',letter:'H',en:'Hilum & ligament',zh:'肺門與韌帶',hint:'hilum, pulmonary ligament',light:'#d1a100',dark:'#f5d452'},
];
export const LUNG_CATEGORY=Object.fromEntries(LUNG_CATEGORIES.map(c=>[c.key,c])) as Record<LungCategoryKey,LungCategory>;

/** Category of a lung structure by its model name (names are anchored so that e.g. the oesophagus itself is not matched). */
export function lungCategoryOf(name:string):LungCategoryKey|null{
 if(/^(?:(?:left|right) )?groove for (?:aortic arch|descending aorta|subclavian artery)$|^(?:left|right) groove for subclavian artery$|^(?:left|right) pulmonary artery$|^bronchial artery$/i.test(name))return 'artery';
 if(/^groove for (?:left )?(?:brachiocephalic vein|superior vena cava|inferior vena cava|azygos vein)$|^(?:left|right) (?:superior|inferior) pulmonary vein$/i.test(name))return 'vein';
 if(/^groove for esophagus$|^esophageal impression of (?:left|right) lung$|^contact area for trachea of (?:left|right) lung$|^(?:left main bronchus|right main bronchus proper)$/i.test(name))return 'tube';
 if(/^cardiac (?:impression|notch) of (?:left|right) lung$|^contact area for thymus of (?:left|right) lung$/i.test(name))return 'heart';
 if(/^groove for first rib of (?:left|right) lung$/i.test(name))return 'bone';
 if(/^apex of (?:left|right) lung$|^diaphragmatic surface of (?:left|right) lung$|^lingula of left lung$/i.test(name))return 'part';
 if(/^(?:oblique|horizontal) fissure of (?:left|right) lung$/i.test(name))return 'fissure';
 if(/^(?:anterior|inferior) border of (?:left|right) lung$/i.test(name))return 'border';
 if(/^hilum of (?:left|right) lung$|^(?:left|right) pulmonary ligament$/i.test(name))return 'hilum';
 return null;
}
