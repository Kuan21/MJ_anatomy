import type {SystemId} from './anatomy';

/**
 * Display-only terminology normalization.
 *
 * The source mesh names and concept IDs stay untouched so model bindings,
 * animation, visibility, and anatomy lookup remain stable. Only the labels
 * shown to learners are normalized to the terminology used in Netter,
 * Atlas of Human Anatomy, 7th ed.
 */
export const NETTER_TERMINOLOGY_SOURCE='English nomenclature: Netter, Atlas of Human Anatomy, 7th ed. (Elsevier, 2019); Traditional Chinese nomenclature: CMU course notes where mapped.';

const preferred:Record<string,string>={
 // Netter 7 / Terminologia Anatomica wording that differs from BodyParts3D.
 'celiac artery':'celiac trunk',
 'flexor accessorius':'quadratus plantae',
 'hip bone':'coxal bone',
 'triquetral':'triquetrum bone',
 'triquetral bone':'triquetrum bone',
 'maxilla':'maxillary bone',
 'ethmoid':'ethmoid bone',
 'scaphoid':'scaphoid bone',
 'lunate':'lunate bone',
 'pisiform':'pisiform bone',
 'trapezium':'trapezium bone',
 'trapezoid':'trapezoid bone',
 'capitate':'capitate bone',
 'hamate':'hamate bone',
 'navicular bone of foot':'navicular bone',
 'supra-orbital nerve':'supraorbital nerve',
 'infra-orbital nerve':'infraorbital nerve',
 'superficial branch of radial nerve':'superficial branch of radial nerve',
 'deep brachial artery':'profunda brachii artery',
 'deep palmar venous arch':'deep venous palmar arch',
 'external oblique':'external abdominal oblique',
 'infraspinatus muscle':'infraspinatus',
 'thyro-arytenoid':'thyroarytenoid',
 'lateral crico-arytenoid':'lateral cricoarytenoid',
 'posterior crico-arytenoid':'posterior cricoarytenoid',
 'hyo-epiglottic ligament':'hyoepiglottic ligament',
 'thyro-epiglottic ligament':'thyroepiglottic ligament',
 'spinal part of deltoid':'spinous part of deltoid',
 'clavicular part of pectoralis major':'clavicular head of pectoralis major',
 'sternocostal part of pectoralis major':'sternocostal head of pectoralis major'
};

const ordinal:Record<string,string>={
 first:'1st',second:'2nd',third:'3rd',fourth:'4th',fifth:'5th',sixth:'6th',
 seventh:'7th',eighth:'8th',ninth:'9th',tenth:'10th',eleventh:'11th',twelfth:'12th'
};
const cervical:Record<string,string>={first:'atlas (C1)',second:'axis (C2)',third:'C3 vertebra',fourth:'C4 vertebra',fifth:'C5 vertebra',sixth:'C6 vertebra',seventh:'C7 vertebra'};
const thoracic:Record<string,string>={first:'T1 vertebra',second:'T2 vertebra',third:'T3 vertebra',fourth:'T4 vertebra',fifth:'T5 vertebra',sixth:'T6 vertebra',seventh:'T7 vertebra',eighth:'T8 vertebra',ninth:'T9 vertebra',tenth:'T10 vertebra',eleventh:'T11 vertebra',twelfth:'T12 vertebra'};
const lumbar:Record<string,string>={first:'L1 vertebra',second:'L2 vertebra',third:'L3 vertebra',fourth:'L4 vertebra',fifth:'L5 vertebra'};

const clean=(s:string)=>s.replace(/[._]+/g,' ').replace(/\s+/g,' ').trim();
const lowerFirst=(s:string)=>s?s[0].toLowerCase()+s.slice(1):s;
const upperFirst=(s:string)=>s?s[0].toUpperCase()+s.slice(1):s;

function extractSide(name:string){
 const left=/\bleft\b/i.test(name),right=/\bright\b/i.test(name);
 const side=left?'Left':right?'Right':'';
 const base=clean(name.replace(/\b(left|right)\b/gi,' '));
 return{side,base};
}

function vertebraName(base:string){
 const m=/^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth)\s+(cervical|thoracic|lumbar)\s+vertebra$/i.exec(base);
 if(!m)return;
 const order=m[1].toLowerCase(),region=m[2].toLowerCase();
 if(region==='cervical')return cervical[order];
 if(region==='thoracic')return thoracic[order];
 if(region==='lumbar')return lumbar[order];
}

function ordinalize(base:string){
 const m=/^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth)\s+(.+)$/i.exec(base);
 if(!m)return base;
 const tail=m[2];
 // Netter commonly labels numbered ribs, metacarpals/metatarsals,
 // lumbricals/interossei and costal cartilages with numeric ordinals.
 if(/^(rib|costal cartilage|metacarpal(?: bone)?|metatarsal(?: bone)?|lumbrical(?: of (?:hand|foot))?|plantar interosseous(?: of foot)?|dorsal interosseous(?: of (?:hand|foot))?)/i.test(tail))
  return `${ordinal[m[1].toLowerCase()]} ${tail}`;
 return base;
}

function normalizeBase(input:string,system:SystemId){
 let base=clean(input);
 const vertebra=vertebraName(base);
 if(vertebra)return vertebra;

 // BodyParts3D sometimes stores paired structures as "... of right/left foot".
 // Side is extracted separately; keep the regional qualifier only where needed
 // to distinguish the hand and foot structures.
 base=base.replace(/\bof\s+(?:the\s+)?(right|left)\b/gi,'').replace(/\s+/g,' ').trim();

 // Collection meshes are displayed as the anatomical plural, not as a dataset
 // implementation detail ("Set of ...").
 base=base.replace(/^set of\s+/i,'');

 const key=base.toLowerCase();
 if(preferred[key])base=preferred[key];

 // Apply preferred wording after removing a subdivision prefix as well.
 base=base.replace(/\bsupra-orbital\b/gi,'supraorbital').replace(/\binfra-orbital\b/gi,'infraorbital');

 // Netter labels foot/hand intrinsics with numeric ordinals (1st, 2nd, ...).
 base=ordinalize(base);

 // Tooth terminology: "secondary" in the source atlas corresponds to the
 // permanent dentition terminology used in the clinical atlas.
 base=base.replace(/\bsecondary\b/gi,'permanent');

 // Keep region qualifiers readable without changing anatomical identity.
 base=base.replace(/\bnavicular bone of foot\b/gi,'navicular bone');

 // Modern Netter 7 terminology uses fibularis in the main lower-limb plates.
 base=base.replace(/\bperoneus\b/gi,'fibularis').replace(/\bperoneal\b/gi,'fibular');

 // Preserve names that are already accepted Netter/TA terms. This is display
 // normalization only; it never merges or changes source anatomy IDs.
 if(system==='muscular'&&/^external abdominal oblique$/i.test(base))return base;
 return base;
}

export function netterEnglishName(name:string,system:SystemId){
 const {side,base:rawBase}=extractSide(name);
 let base=normalizeBase(rawBase,system);

 // Re-run exact map after ordinal/side cleanup.
 const mapped=preferred[base.toLowerCase()];
 if(mapped)base=mapped;

 // Netter-style side qualifier is placed first.
 const label=side?`${side} ${lowerFirst(base)}`:upperFirst(base);
 return clean(label);
}
