import type {BrainFact} from './brain-facts-types';
const f = (loc: string, fn: string, rel: string[], blood: string, extra: Partial<BrainFact> = {}): BrainFact => ({loc, fn, rel, blood, ...extra});
const T = (re: RegExp, fact: BrainFact): [RegExp, BrainFact] => [re, fact];

const MCA_T = 'Supplied mainly by the temporal branches of the middle cerebral artery.';
const PCA_T = 'Supplied mainly by the posterior cerebral artery (inferior and medial temporal branches).';
const PCA_O = 'Supplied by the posterior cerebral artery.';

export const FACTS: [RegExp, BrainFact][] = [
  // ---- temporal ----
  T(/^Temporal pole$/, f(
    'Anterior tip of the temporal lobe.',
    'Higher-order association area linking emotion, semantic memory and social knowledge. Damage may impair recognition of people and meaning of concepts.',
    ['Middle temporal gyrus', 'Inferior temporal gyrus', 'Superior temporal gyrus (Lateral part)'],
    'Temporal branches of the middle cerebral artery supply the lateral pole; the inferior and medial part receives posterior cerebral artery branches.',
    {ba: 'BA 38'})),
  T(/^Collateral sulcus$/, f(
    'Groove on the inferior surface of the temporal lobe, running between the parahippocampal gyrus and the occipitotemporal gyri.',
    'Landmark separating the limbic parahippocampal gyrus from the lateral occipitotemporal (fusiform) gyrus.',
    ['Medial occipitotemporal gyrus (Parahippocampal)', 'Lateral occipitotemporal gyrus', 'Occipitotemporal sulcus (Lateral part)'],
    PCA_T,
    {borders: 'Parahippocampal gyrus (limbic, medial) / occipitotemporal gyrus (lateral)'})),
  T(/^Transverse temporal gyri$/, f(
    'Oblique gyri (of Heschl) on the superior surface of the superior temporal gyrus, buried inside the lateral fissure.',
    'Primary auditory cortex (BA 41) with adjacent auditory association cortex (BA 42). Bilateral damage causes cortical deafness; unilateral damage gives subtle hearing deficits.',
    ['Temporal plane', 'Superior temporal gyrus (Lateral part)', 'Acoustic radiation'],
    'Temporal (and insular) branches of the middle cerebral artery.',
    {ba: 'BA 41, 42'})),
  T(/^Temporal plane$/, f(
    'Flat superior surface of the temporal lobe within the lateral fissure, behind the transverse temporal gyri (planum temporale).',
    'Auditory association and language area; in the dominant hemisphere it overlaps with the Wernicke region.',
    ['Transverse temporal gyri', 'Superior temporal gyrus (Lateral part)', 'Arcuate fasciculus'],
    'Temporal branches of the middle cerebral artery.',
    {ba: 'BA 22, 42'})),
  T(/^Superior temporal gyrus \(Lateral part\)$/, f(
    'Uppermost gyrus on the lateral surface of the temporal lobe, below the lateral fissure.',
    'Auditory association and speech comprehension; its posterior part in the dominant hemisphere is the Wernicke area, and damage causes fluent but meaningless speech with poor comprehension.',
    ['Superior temporal sulcus', 'Transverse temporal gyri', 'Middle temporal gyrus', 'Arcuate fasciculus'],
    'Middle cerebral artery (temporal branches).',
    {ba: 'BA 22'})),
  T(/^Lateral occipitotemporal gyrus$/, f(
    'Gyrus (fusiform gyrus) on the inferior surface of the temporal and occipital lobes, lateral to the collateral sulcus.',
    'Ventral visual stream area for recognition of faces, objects and words. Damage may cause prosopagnosia or alexia.',
    ['Collateral sulcus', 'Occipitotemporal sulcus (Lateral part)', 'Inferior temporal gyrus', 'Medial occipitotemporal gyrus (Parahippocampal)'],
    PCA_T,
    {ba: 'BA 37'})),
  T(/^Medial occipitotemporal gyrus \(Parahippocampal\)$/, f(
    'Gyrus on the medial inferior surface of the temporal lobe, between the collateral sulcus and the hippocampal sulcus.',
    'Relay between association cortex and the hippocampus (via the entorhinal cortex); involved in memory encoding and scene processing.',
    ['Hippocampus', 'Collateral sulcus', 'Lateral occipitotemporal gyrus'],
    'Posterior cerebral artery; the hippocampal region also receives branches of the anterior choroidal artery.',
    {ba: 'BA 28, 34, 35, 36'})),
  T(/^Inferior temporal sulcus$/, f(
    'Longitudinal groove on the lateral temporal surface between the middle and inferior temporal gyri.',
    'Separates the middle temporal gyrus from the inferior temporal gyrus.',
    ['Middle temporal gyrus', 'Inferior temporal gyrus'],
    MCA_T)),
  T(/^Inferior temporal gyrus$/, f(
    'Lowest gyrus on the lateral surface of the temporal lobe, extending onto the inferior surface.',
    'High-level visual processing in the ventral stream (object and face recognition) and semantic memory.',
    ['Inferior temporal sulcus', 'Middle temporal gyrus', 'Lateral occipitotemporal gyrus'],
    'Temporal branches of the middle cerebral artery (lateral part) and posterior cerebral artery (inferior part).',
    {ba: 'BA 20'})),
  T(/^Middle temporal gyrus$/, f(
    'Gyrus on the lateral temporal surface between the superior and inferior temporal sulci.',
    'Language comprehension, semantic processing and visual motion perception.',
    ['Superior temporal sulcus', 'Inferior temporal sulcus', 'Superior temporal gyrus (Lateral part)', 'Inferior temporal gyrus'],
    MCA_T,
    {ba: 'BA 21'})),
  T(/^Superior temporal sulcus$/, f(
    'Longitudinal groove on the lateral temporal surface between the superior and middle temporal gyri.',
    'Separates the superior from the middle temporal gyrus; its banks process speech, biological motion and social cues.',
    ['Superior temporal gyrus (Lateral part)', 'Middle temporal gyrus'],
    MCA_T)),
  T(/^Occipitotemporal sulcus \(Lateral part\)$/, f(
    'Groove on the inferior surface of the temporal lobe lateral to the fusiform gyrus.',
    'Separates the lateral occipitotemporal (fusiform) gyrus from the inferior temporal gyrus.',
    ['Lateral occipitotemporal gyrus', 'Inferior temporal gyrus', 'Collateral sulcus'],
    PCA_T)),

  // ---- occipital ----
  T(/^Occipital pole$/, f(
    'Posterior tip of the occipital lobe.',
    'Represents central (macular) vision in the visual cortex; lesions cause a central visual field defect.',
    ['Calcarine sulcus', 'Lateral occipital gyrus (Middle occipital gyrus)', 'Cuneus', 'Lingual gyrus'],
    PCA_O + ' The tip may also receive some middle cerebral artery supply.',
    {ba: 'BA 17, 18'})),
  T(/^Anterior occipital sulcus$/, f(
    'Shallow groove on the lateral surface at the border between the occipital and temporal lobes.',
    'Landmark marking the front of the lateral occipital cortex.',
    ['Lateral occipital gyrus (Middle occipital gyrus)', 'Inferior occipital gyrus and sulcus', 'Inferior temporal gyrus'],
    'Middle cerebral artery (lateral surface) with posterior cerebral artery branches.')),
  T(/^Inferior occipital gyrus and sulcus$/, f(
    'Lowest gyrus of the lateral occipital surface and its sulcus, above the inferior temporal region.',
    'Visual association cortex involved in object and face recognition.',
    ['Lateral occipital gyrus (Middle occipital gyrus)', 'Lateral occipitotemporal gyrus', 'Anterior occipital sulcus'],
    PCA_O,
    {ba: 'BA 18, 19'})),
  T(/^Lingual gyrus$/, f(
    'Gyrus on the medial occipital surface below the calcarine sulcus.',
    'Receives the upper visual field (lower bank of the calcarine cortex) and takes part in visual association and word recognition. A lesion causes a superior quadrantanopia.',
    ['Calcarine sulcus', 'Cuneus', 'Collateral sulcus', 'Posterior transverse collateral sulcus'],
    'Posterior cerebral artery (calcarine branch and inferior temporal branches).',
    {ba: 'BA 17, 18, 19'})),
  T(/^Lateral occipital gyrus \(Middle occipital gyrus\)$/, f(
    'Gyrus on the lateral surface of the occipital lobe.',
    'Visual association cortex for shape, object and motion processing.',
    ['Superior occipital gyri', 'Inferior occipital gyrus and sulcus', 'Occipital pole'],
    'Posterior cerebral artery and the terminal branches of the middle cerebral artery.',
    {ba: 'BA 18, 19'})),
  T(/^Calcarine sulcus$/, f(
    'Deep horizontal groove on the medial occipital surface that separates the cuneus above from the lingual gyrus below.',
    'Its lips contain the primary visual cortex, which receives the optic radiation.',
    ['Cuneus', 'Lingual gyrus', 'Parieto-occipital sulcus', 'Optic radiation'],
    'Calcarine branch of the posterior cerebral artery.')),
  T(/^Cuneus$/, f(
    'Wedge-shaped region of the medial occipital lobe between the parieto-occipital and calcarine sulci.',
    'Primary and secondary visual cortex receiving the lower visual field. A lesion causes an inferior quadrantanopia.',
    ['Calcarine sulcus', 'Parieto-occipital sulcus', 'Lingual gyrus', 'Precuneus'],
    'Calcarine and parieto-occipital branches of the posterior cerebral artery.',
    {ba: 'BA 17, 18, 19'})),
  T(/^Superior occipital gyri$/, f(
    'Gyri on the upper lateral and dorsal part of the occipital lobe, near the interhemispheric margin.',
    'Visual association cortex, including dorsal stream processing of spatial location and motion.',
    ['Lateral occipital gyrus (Middle occipital gyrus)', 'Transverse occipital sulcus', 'Cuneus', 'Superior parietal lobule'],
    'Posterior cerebral artery with terminal branches of the middle cerebral artery.',
    {ba: 'BA 19'})),
  T(/^Lunate sulcus$/, f(
    'Crescent-shaped groove on the lateral occipital surface behind the occipital pole region.',
    'Variable sulcus that marks the approximate anterior limit of the primary visual cortex on the lateral surface.',
    ['Occipital pole', 'Lateral occipital gyrus (Middle occipital gyrus)', 'Calcarine sulcus'],
    PCA_O)),
  T(/^Transverse occipital sulcus$/, f(
    'Groove on the dorsolateral occipital lobe running transversely, near the junction with the parietal lobe.',
    'Occipital landmark separating the superior occipital gyri from parietal cortex; also a region for scene and spatial processing.',
    ['Superior occipital gyri', 'Intraparietal sulcus', 'Lateral occipital gyrus (Middle occipital gyrus)'],
    'Posterior cerebral artery with terminal middle cerebral artery branches.')),
  T(/^Posterior transverse collateral sulcus$/, f(
    'Groove on the inferior occipital surface that continues the collateral sulcus backwards.',
    'Separates the lingual gyrus from the lateral occipitotemporal region.',
    ['Collateral sulcus', 'Lingual gyrus', 'Lateral occipitotemporal gyrus'],
    PCA_O)),

  // ---- limbic ----
  T(/^Cingulate sulcus \(Marginal part\)$/, f(
    'Posterior end of the cingulate sulcus on the medial surface, curving upward to reach the dorsal margin behind the paracentral lobule.',
    'Landmark marking the border between the cingulate gyrus (in front and below) and the precuneus (behind).',
    ['Cingulate gyrus and sulcus (Posterior dorsal part)', 'Precuneus', 'Paracentral gyrus and sulcus', 'Subparietal sulcus'],
    'Branches of the anterior cerebral artery (callosomarginal and pericallosal arteries).',
    {borders: 'Limbic lobe: cingulate gyrus / frontal and parietal lobes'})),
  T(/^Cingulate gyrus and sulcus \(Middle anterior part\)$/, f(
    'Anterior-middle part of the cingulate gyrus and sulcus on the medial surface above the corpus callosum.',
    'Anterior cingulate cortex: attention, error monitoring, pain affect, emotion and autonomic control. Damage may cause apathy or akinetic mutism.',
    ['Cingulate gyrus and sulcus (Middle posterior part)', 'Corpus callosum', 'Callosomarginal artery'],
    'Anterior cerebral artery: callosomarginal and pericallosal arteries.',
    {ba: 'BA 24, 32'})),
  T(/^Cingulate gyrus and sulcus \(Middle posterior part\)$/, f(
    'Middle-posterior part of the cingulate gyrus and sulcus above the body of the corpus callosum.',
    'Midcingulate cortex involved in motor control, response selection and pain.',
    ['Cingulate gyrus and sulcus (Middle anterior part)', 'Cingulate gyrus and sulcus (Posterior dorsal part)', 'Corpus callosum'],
    'Anterior cerebral artery: callosomarginal and pericallosal arteries.',
    {ba: 'BA 23, 24, 31'})),
  T(/^Cingulate gyrus and sulcus \(Posterior dorsal part\)$/, f(
    'Posterior dorsal part of the cingulate gyrus and sulcus, above the splenium of the corpus callosum.',
    'Posterior cingulate cortex: part of the default mode network, with roles in memory retrieval and self-referential thought.',
    ['Cingulate gyrus (Posteroventral part)', 'Cingulate gyrus and sulcus (Middle posterior part)', 'Cingulate sulcus (Marginal part)', 'Precuneus'],
    'Pericallosal artery (anterior cerebral artery) with posterior cerebral artery branches posteriorly.',
    {ba: 'BA 23, 31'})),
  T(/^Cingulate gyrus \(Posteroventral part\)$/, f(
    'Posteroventral cingulate cortex curving around the splenium of the corpus callosum (isthmus region).',
    'Retrosplenial cortex linking the cingulate gyrus with the parahippocampal gyrus; involved in memory and spatial orientation.',
    ['Cingulate gyrus and sulcus (Posterior dorsal part)', 'Medial occipitotemporal gyrus (Parahippocampal)', 'Corpus callosum'],
    'Splenial branches of the posterior cerebral artery and pericallosal artery.',
    {ba: 'BA 23, 29, 30, 31'})),
  T(/^Hippocampus$/, f(
    'Curved fold of archicortex in the medial temporal lobe, forming the floor of the inferior horn of the lateral ventricle.',
    'Forms new declarative memories and supports spatial navigation. Bilateral damage causes anterograde amnesia.',
    ['Fornix', 'Medial occipitotemporal gyrus (Parahippocampal)', 'Hippocampal commissure', 'Lateral ventricle'],
    'Posterior cerebral artery, anterior choroidal artery and posterior communicating artery branches.')),
];
