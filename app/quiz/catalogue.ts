export type QuizSystem = 'skeletal' | 'muscular' | 'nervous' | 'arterial' | 'venous';
export type QuizSection = 'all' | 'hip' | 'thigh' | 'knee' | 'leg' | 'foot';
export type QuizSide = 'right' | 'left' | 'both';
export type Bounds = [number[], number[]];

export const QUIZ_SYSTEMS: {id: QuizSystem; label: string; english: string; color: string}[] = [
  {id: 'skeletal', label: '骨骼', english: 'Bones', color: '#d6c4a4'},
  {id: 'muscular', label: '肌肉', english: 'Muscles', color: '#bb7067'},
  {id: 'nervous', label: '神經', english: 'Nerves', color: '#e4ba4b'},
  {id: 'arterial', label: '動脈', english: 'Arteries', color: '#bf5363'},
  {id: 'venous', label: '靜脈', english: 'Veins', color: '#6399bc'},
];
export const QUIZ_SECTIONS: {id: QuizSection; label: string; english: string; range: [number, number]}[] = [
  {id: 'all', label: '全部下肢', english: 'Lower limb', range: [0, 1.13]},
  {id: 'hip', label: '臀部・髖', english: 'Gluteal & hip', range: [.75, 1.13]},
  {id: 'thigh', label: '大腿', english: 'Thigh', range: [.43, .96]},
  {id: 'knee', label: '膝', english: 'Knee', range: [.34, .58]},
  {id: 'leg', label: '小腿', english: 'Leg', range: [.08, .54]},
  {id: 'foot', label: '踝・足', english: 'Ankle & foot', range: [0, .23]},
];

export interface QuizStructure {
  id: string;
  name: string;
  chinese?: string;
  system: QuizSystem;
  side: 'left' | 'right';
  sections: Exclude<QuizSection, 'all'>[];
  meshIds: string[];
  bounds: Bounds;
  source: 'BodyParts3D' | 'Nervous supplement';
}
export interface QuizMesh {
  id: string;
  structureId: string;
  positions: number;
  normals: number;
  indices: number;
  vertexCount: number;
  indexCount: number;
}
export interface QuizPackage {
  url: string;
  gzip: string;
  bytes: number;
  gzipBytes: number;
  system: QuizSystem;
  side: 'left' | 'right';
  meshes: QuizMesh[];
}
export interface QuizCatalogue {
  version: 1;
  structures: QuizStructure[];
  packages: QuizPackage[];
}
export interface QuizSettings {
  section: QuizSection;
  systems: QuizSystem[];
  side: QuizSide;
  count: number;
}

// Only individually identified lower-limb nerves. Small source branches with
// inconsistent regional geometry are deliberately not turned into quiz answers.
export const LOWER_NERVES: Record<string, {zh: string; sections: Exclude<QuizSection, 'all'>[]}> = {
  'femoral nerve': {zh: '股神經', sections: ['hip', 'thigh']},
  'obturator nerve': {zh: '閉孔神經', sections: ['hip', 'thigh']},
  'sciatic nerve': {zh: '坐骨神經', sections: ['hip', 'thigh']},
  'tibial nerve': {zh: '脛神經', sections: ['knee', 'leg']},
  'common fibular nerve': {zh: '腓總神經', sections: ['knee', 'leg']},
  'superficial fibular nerve': {zh: '腓淺神經', sections: ['leg']},
  'deep fibular nerve': {zh: '腓深神經', sections: ['leg', 'foot']},
  'saphenous nerve': {zh: '隱神經', sections: ['thigh', 'knee', 'leg']},
  'sural nerve': {zh: '腓腸神經', sections: ['leg', 'foot']},
  'medial sural cutaneous nerve': {zh: '腓腸內側皮神經', sections: ['knee', 'leg']},
  'medial plantar nerve': {zh: '足底內側神經', sections: ['foot']},
  'lateral plantar nerve': {zh: '足底外側神經', sections: ['foot']},
  'superior gluteal nerve': {zh: '臀上神經', sections: ['hip']},
  'lateral femoral cutaneous nerve': {zh: '股外側皮神經', sections: ['hip', 'thigh']},
  'posterior femoral cutaneous nerve': {zh: '股後皮神經', sections: ['hip', 'thigh']},
  'nerve to quadratus femoris muscle': {zh: '股方肌神經', sections: ['hip']},
};

/** Sections overlap for long structures; no mesh is cut to fit a display box. */
export function lowerSections(name: string, bounds: Bounds): Exclude<QuizSection, 'all'>[] {
  const n = name.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/\s+/g, ' ').trim();
  if (LOWER_NERVES[n]) return LOWER_NERVES[n].sections;
  if (/\bfemur\b/.test(n)) return ['hip', 'thigh', 'knee'];
  if (/^(tibia|fibula)$/.test(n)) return ['knee', 'leg', 'foot'];
  if (/great saphenous/.test(n)) return ['thigh', 'knee', 'leg'];
  if (/small saphenous/.test(n)) return ['knee', 'leg'];
  if (/glute|hip bone|iliac|obturator|piriformis|gemellus|quadratus femoris|psoas|tensor fasciae/.test(n)) return ['hip'];
  if (/genicular|poplite|patella/.test(n)) return ['knee'];
  if (/gastrocnemius|plantaris/.test(n)) return ['knee', 'leg'];
  if (/hallucis longus|digitorum longus/.test(n)) return ['leg', 'foot'];
  if (/tibial|tibialis|fibular|peroneal|soleus/.test(n)) return ['leg'];
  if (/foot|toe|metatars|plantar|tarsal|pedis|halluc|calcane|talus|cuboid|cuneiform|flexor accessorius/.test(n)) return ['foot'];
  if (/femor|adductor|gracilis|sartorius|vastus|semitend|semimembr|pectineus|perforating/.test(n)) return ['thigh'];
  const y = (bounds[0][1] + bounds[1][1]) / 2;
  return [y < .23 ? 'foot' : y < .53 ? 'leg' : y < .84 ? 'thigh' : 'hip'];
}

export function questionPool(catalogue: QuizCatalogue, settings: QuizSettings): QuizStructure[] {
  return catalogue.structures.filter(s => settings.systems.includes(s.system)
    && (settings.side === 'both' || settings.side === s.side)
    && (settings.section === 'all' || s.sections.includes(settings.section)));
}

/** Same-system regional anatomy stays available as distractors and for peeling. */
export function sceneStructures(catalogue: QuizCatalogue, target: QuizStructure, section: QuizSection, side: QuizSide) {
  const range = QUIZ_SECTIONS.find(s => s.id === section)!.range;
  return catalogue.structures.filter(s => (side === 'both' || s.side === side)
    && (s.system === target.system || s.system === 'skeletal')
    && (s.id === target.id || section === 'all' || s.sections.includes(section)
      || (s.bounds[0][1] < range[1] && s.bounds[1][1] > range[0])));
}
