import type {Part,SystemId} from './anatomy';
import {partCenter} from './mj-part-regions';

/**
 * Which organ a vessel or nerve lies inside (data table; the first matching rule gives the owner, no match means "passing": never hidden with an organ).
 * The full classification is written to docs/organ-owners.md by scripts/list-organ-owners.mjs. The display rule that uses it is in app/mj-owners.ts.
 */
export interface OrganRule{re:RegExp;organ:SystemId;/** only these systems (default: every vessel and nerve system) */sys?:SystemId[];/** height band of the centre, metres (standing figure, floor = 0) */y?:[number,number]}
const VESSELS:SystemId[]=['arterial','venous','nervous','lymphatic'];
const R=(organ:SystemId,re:RegExp,more:{sys?:SystemId[];y?:[number,number]}={}):OrganRule=>({organ,re,...more});

// Same height bands as the region rules (app/mj-region-bar.ts): the lung is above 1.17 m, the kidney below.
const LUNG_Y:[number,number]=[1.17,1.5],KIDNEY_Y:[number,number]=[.9,1.17];

export const ORGAN_RULES:OrganRule[]=[
 // ---- heart: the coronary tree and the cardiac veins lie on the heart and are drawn with it
 R('cardiac',/coronary|interventricular|conus (?:artery|branch)|atrioventricular nodal|sinoatrial|cardiac vein|marginal (?:branch|vein)|posterior vein of ventricle|(?:anterior|posterior) ventricular branch|septal branch of/),
 // ---- liver: intrahepatic branches of the portal vein and hepatic artery, the hepatic veins and their segments (the trunks at the porta hepatis pass)
 R('digestive',/segmental (?:hepatic artery|branch of portal vein|tributary)|lobe branch of (?:hepatic artery|portal vein)|hepatovenous|tributary of (?:middle |right |left )?hepatic vein|^(?:middle |right |left )?hepatic vein$/),
 // ---- kidney: segmental branches inside the renal sinus (the renal artery and vein pass to the hilum); the name rule comes before the lung's height-band rule
 R('urinary',/segmental (?:branch of renal|artery of kidney)|renal segmental/),
 // ---- lung: branches inside the lung (lobar, lingular and segmental vessels, the bronchial arteries) and, by the owner's decision, the right and left pulmonary arteries and the
 // superior and inferior pulmonary veins (their meshes run about 2 cm into the lung from the hilum). Only the pulmonary trunk stays "passing" (see docs/organ-owners.md).
 R('respiratory',/bronchial (?:artery|vein|branch)/),
 R('respiratory',/^pulmonary artery$|^(?:superior|inferior) pulmonary vein$/,{sys:['arterial','venous']}),
 R('respiratory',/lobar (?:artery|vein)|lingular (?:artery|vein)|segmental|\bbasal\b/,{sys:['arterial','venous'],y:LUNG_Y}),
 R('urinary',/segmental/,{sys:['arterial','venous'],y:KIDNEY_Y}),
 // ---- gut: the branches that run in the mesenteries to the stomach, intestines and pancreas, and the plexus on the oesophagus
 R('digestive',/\bgastric|gastro-?epiploic|colic|ileal|jejunal|ileocolic|appendicular|cecal|pancreaticoduodenal|pancreatic|sigmoid|colon|superior rectal|oesophageal branch|esophageal (?:artery|plexus)/,{sys:['arterial','venous','nervous']}),
 // ---- genital organs
 R('reproductive',/uterine|dorsal vein of penis/),
 // ---- brain: the vessels named for the cerebral and cerebellar territories and the arteries of the circle; they ride with the brain, which belongs to the Nervous system switch
 R('nervous',/cerebral|cerebellar|callosomarginal|pericallosal|choroidal|thalam|pontine|frontobasal|lateral occipital|medial occipital|polar temporal|prefrontal|precuneal|splenial|central sulcus|postcentral|precentral|insular part|communicating|vermian|hypothalamic|anterior temporal|posterior temporal|parietal artery/,{sys:['arterial','venous']}),
];

/** Owner organ switch of a vessel or nerve, or null when it passes by (never hidden with an organ). */
export function organOwner(p:Part):SystemId|null{
 if(!VESSELS.includes(p.system))return null;
 // the side word sits inside names ("branch of right hepatic artery"), the rules are written without it
 const n=p.name.toLowerCase().replace(/\b(?:left|right) /g,''),y=partCenter(p)[1];
 for(const r of ORGAN_RULES){
  if(r.sys&&!r.sys.includes(p.system))continue;
  if(r.y&&(y<r.y[0]||y>r.y[1]))continue;
  if(r.re.test(n))return r.organ;
 }
 return null;
}


/** Brain tissue (gyri, nuclei, tracts ...) is the organ itself, not a nerve that runs to it: it takes part in no owner rule. */
export const isBrainTissue=(p:Part)=>p.system==='nervous'&&/gyrus|lobe|lobule|nucleus|colliculus|geniculate|commissure|capsule|fornix|hippocampus|amygdal|caudate|putamen|pallidus|thalamus|hypothalamus|mammillary|midbrain|pons|medulla|cerebell|corpus|habenula|insula|matter|body of|optic (?:chiasm|tract)|tuber|lamina|interpeduncular|aqueduct|canal|septum|stria|brachium|tentorium|peduncle/i.test(p.name)&&!/ganglion|plexus|nerve|trunk/i.test(p.name);
