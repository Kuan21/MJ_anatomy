/**
 * Colour categories of the lung name labels (both lungs). One category = one colour on the model (a semi-transparent overlay), one tint on the label box,
 * one letter on the label so colour is never the only cue. `light` is used on the white label boxes and on the model; `dark` is the same hue lifted for dark label boxes.
 * Selection uses the glow outline of the viewer (never one of these colours), so a selected structure can be told from a coloured one.
 */
export type LungCategoryKey='artery'|'vein'|'tube'|'heart'|'bone'|'part'|'fissure'|'border'|'hilum';
export interface LungCategory{key:LungCategoryKey;letter:string;en:string;zh:string;/** the name of the category on the data card: "A Arterial impression｜動脈壓跡" */cardEn:string;cardZh:string;hint:string;light:string;dark:string}
export const LUNG_CATEGORIES:LungCategory[]=[
 {key:'artery',cardEn:'Arterial impression',cardZh:'動脈壓跡',letter:'A',en:'Arteries',zh:'動脈',hint:'subclavian, aortic arch, descending aorta, pulmonary, bronchial',light:'#c0392b',dark:'#ff8a7a'},
 {key:'vein',cardEn:'Venous impression',cardZh:'靜脈壓跡',letter:'V',en:'Veins',zh:'靜脈',hint:'SVC, IVC, brachiocephalic, azygos, pulmonary veins',light:'#2f6fd0',dark:'#7fb0ff'},
 {key:'tube',cardEn:'Digestive tube & airway',cardZh:'消化道與氣道',letter:'T',en:'Digestive tube & airway',zh:'消化道與氣道',hint:'oesophagus, trachea, main bronchi',light:'#d9780f',dark:'#ffb066'},
 {key:'heart',cardEn:'Heart & thymus',cardZh:'心與胸腺',letter:'C',en:'Heart & thymus',zh:'心與胸腺',hint:'cardiac impression, cardiac notch, thymus',light:'#7c4dbd',dark:'#c3a2f2'},
 {key:'bone',cardEn:'Bony impression',cardZh:'骨性壓跡',letter:'R',en:'Bony impression',zh:'骨性壓跡',hint:'first rib',light:'#b09060',dark:'#dcc592'},
 {key:'part',cardEn:'Lung part & surface',cardZh:'肺的分部與表面',letter:'P',en:'Lung parts & surfaces',zh:'肺的部分與表面',hint:'apex, diaphragmatic surface, lingula',light:'#12908a',dark:'#55d6cc'},
 {key:'fissure',cardEn:'Fissure',cardZh:'肺裂',letter:'F',en:'Fissures',zh:'肺裂',hint:'oblique, horizontal',light:'#1f6b3a',dark:'#6fcb8f'},
 {key:'border',cardEn:'Border',cardZh:'肺緣',letter:'B',en:'Borders',zh:'緣',hint:'anterior, inferior',light:'#5b7a95',dark:'#9db9d1'},
 {key:'hilum',cardEn:'Hilum & ligament',cardZh:'肺門與肺韌帶',letter:'H',en:'Hilum & ligament',zh:'肺門與韌帶',hint:'hilum, pulmonary ligament',light:'#d1a100',dark:'#f5d452'},
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

/** Drawing order of the lung surface marks, from the broad areas at the bottom to the grooves, the hilum and the fissures on top (the same order as scripts/paokao-structures/lungs.mjs). The marks do not write depth, so where two overlap the later one is drawn over the earlier one and they cannot flicker into each other. */
export const LUNG_STACK=['Diaphragmatic surface of right lung','Diaphragmatic surface of left lung','Lingula of left lung','Cardiac notch of left lung','Anterior border of right lung','Anterior border of left lung','Inferior border of right lung','Inferior border of left lung','Apex of right lung','Apex of left lung','Contact area for thymus of right lung','Contact area for thymus of left lung','Contact area for trachea of right lung','Cardiac impression of right lung','Cardiac impression of left lung','Groove for inferior vena cava','Groove for esophagus','Esophageal impression of left lung','Groove for descending aorta','Groove for aortic arch','Groove for azygos vein','Groove for superior vena cava','Groove for brachiocephalic vein','Groove for left brachiocephalic vein','Right groove for subclavian artery','Left groove for subclavian artery','Groove for first rib of right lung','Groove for first rib of left lung','Hilum of right lung','Hilum of left lung','Oblique fissure of right lung','Horizontal fissure of right lung','Oblique fissure of left lung'];
export const lungStackRank=(name:string)=>{const k=LUNG_STACK.indexOf(name);return k<0?0:k;};
