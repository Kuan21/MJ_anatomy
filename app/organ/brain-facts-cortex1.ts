import type {BrainFact} from './brain-facts-types';
const f = (loc: string, fn: string, rel: string[], blood: string, extra: Partial<BrainFact> = {}): BrainFact => ({loc, fn, rel, blood, ...extra});
const T = (re: RegExp, fact: BrainFact): [RegExp, BrainFact] => [re, fact];

const MCA_LAT = 'Middle cerebral artery (MCA) supplies the lateral surface of the hemisphere here.';
const ACA_MED = 'Anterior cerebral artery (ACA) supplies the medial surface here.';

export const FACTS: [RegExp, BrainFact][] = [
  // ---- interlobar grooves ----
  T(/^Central sulcus$/i, f(
    'Deep groove running obliquely across the lateral and medial convexity of the hemisphere between the precentral and postcentral gyri.',
    'Landmark that separates the motor cortex in front from the somatosensory cortex behind; it is a boundary, not a functional area.',
    ['Precentral gyrus', 'Postcentral gyrus', 'Paracentral gyrus and sulcus'],
    'Lies on the lateral surface supplied by the middle cerebral artery (MCA); its upper end on the medial surface is supplied by the anterior cerebral artery (ACA).',
    {borders: 'Frontal lobe (anterior) / parietal lobe (posterior)'})),
  T(/^Lat Fis-post$/i, f(
    'Posterior ramus of the lateral sulcus, running backward and slightly upward along the upper edge of the temporal lobe.',
    'Landmark groove; its banks carry the auditory cortex (superior temporal plane) below and the supramarginal gyrus wraps around its end above.',
    ['Supramarginal gyrus', 'Superior temporal gyrus (Lateral part)', 'Transverse temporal gyri', 'Insula (Subcentral gyrus and ant. and post. sulci)'],
    'The MCA branches (insular and opercular M2-M3 branches) run in and over this groove and supply its banks.',
    {borders: 'Frontal and parietal lobes (above) / temporal lobe (below), the main division of the lateral sulcus'})),
  T(/^Parieto-occipital sulcus$/i, f(
    'Deep groove on the medial surface of the hemisphere that cuts the upper edge and joins the calcarine sulcus; only a short notch shows on the lateral surface.',
    'Landmark that marks the posterior limit of the parietal lobe (precuneus) and the anterior limit of the occipital lobe (cuneus).',
    ['Precuneus', 'Cuneus', 'Calcarine sulcus'],
    'ACA (pericallosal branches) supplies the medial parietal cortex up to this sulcus; the posterior cerebral artery (PCA, parieto-occipital branch) supplies the cortex behind it.',
    {borders: 'Parietal lobe / occipital lobe, clearest on the medial surface'})),

  // ---- frontal ----
  T(/^Opercular part of inferior frontal gyrus$/i, f(
    'Posterior part of the inferior frontal gyrus, between the anterior ascending ramus of the lateral sulcus and the inferior precentral sulcus; frontal lobe.',
    'Part of Broca area (speech production, motor planning of speech); damage in the dominant hemisphere causes non-fluent aphasia.',
    ['Triangular part of inferior frontal gyrus', 'Orbital part of inferior frontal gyrus', 'Lat Fis-ant-Vertical', 'Precentral sulcus (inferior part)'],
    MCA_LAT + ' Mainly the superior division of the MCA (prefrontal and precentral branches).',
    {ba: 'BA 44'})),
  T(/^Triangular part of inferior frontal gyrus$/i, f(
    'Middle part of the inferior frontal gyrus, wedged between the anterior ascending and anterior horizontal rami of the lateral sulcus; frontal lobe.',
    'Part of Broca area; language production and word selection. Damage in the dominant hemisphere impairs fluent speech.',
    ['Opercular part of inferior frontal gyrus', 'Orbital part of inferior frontal gyrus', 'Lat Fis-ant-Vertical', 'Lat Fis-ant-Horizont'],
    MCA_LAT + ' Mainly the superior division of the MCA (prefrontal branch).',
    {ba: 'BA 45'})),
  T(/^Orbital part of inferior frontal gyrus$/i, f(
    'Anterior-inferior part of the inferior frontal gyrus, below the anterior horizontal ramus of the lateral sulcus; frontal lobe.',
    'Takes part in language, especially meaning (semantic) retrieval, and in inhibitory control.',
    ['Triangular part of inferior frontal gyrus', 'Opercular part of inferior frontal gyrus', 'Lat Fis-ant-Horizont', 'Orbital gyri'],
    MCA_LAT + ' Orbitofrontal branches of the MCA, with some contribution from the ACA near the orbital surface.',
    {ba: 'BA 47'})),
  T(/^Orbital gyri \(Frontomarginal/i, f(
    'Frontomarginal gyrus and sulcus at the anterior edge of the frontal lobe where the lateral surface turns onto the orbital surface.',
    'Part of the orbitofrontal and frontopolar cortex; involved in decision making, reward evaluation and social behaviour.',
    ['Orbital gyri', 'Transverse frontopolar gyrus and sulcus', 'Superior frontal gyrus'],
    'Orbitofrontal branches of the ACA and the MCA (orbitofrontal branch).',
    {ba: 'BA 10, 11'})),
  T(/^Paracentral gyrus and sulcus$/i, f(
    'Paracentral lobule on the medial surface of the hemisphere, around the upper end of the central sulcus; the part in front of it belongs to the frontal lobe.',
    'Motor control of the contralateral lower limb (and pelvic floor/bladder control). Lesion gives contralateral leg weakness.',
    ['Paracentral sulcus', 'Central sulcus', 'Precuneus', 'Postcentral gyrus'],
    'ACA (pericallosal and callosomarginal branches): the paracentral lobule is the lower-limb motor and sensory area.',
    {ba: 'BA 4, 6'})),
  T(/^Transverse frontopolar gyrus and sulcus$/i, f(
    'Frontal pole, the most anterior tip of the frontal lobe.',
    'Prefrontal cortex for planning, working memory, and combining multiple tasks or goals.',
    ['Superior frontal gyrus', 'Orbital gyri (Frontomarginal gyrus and sulcus)', 'Middle frontal gyrus'],
    'MCA (frontal polar branches) on the lateral side and ACA (frontopolar and orbitofrontal branches) on the medial side.',
    {ba: 'BA 10'})),
  T(/^Straight gyrus \(Gyrus rectus\)$/i, f(
    'Narrow gyrus on the orbital surface of the frontal lobe, between the olfactory sulcus and the medial margin of the hemisphere.',
    'Orbitofrontal cortex involved in emotion, reward and decision making; it lies beside the olfactory tract.',
    ['Olfactory sulcus', 'Orbital gyri', 'Orbital sulci (H-shaped orbital sulci)'],
    'ACA (orbitofrontal and frontopolar branches); medial part of the orbital surface is supplied by the ACA.',
    {ba: 'BA 11, 25'})),
  T(/^Lat Fis-ant-Vertical$/i, f(
    'Anterior ascending ramus of the lateral sulcus; a short vertical cleft cutting into the inferior frontal gyrus, in the frontal lobe.',
    'Landmark groove: it divides the inferior frontal gyrus into the opercular part (behind) and the triangular part (in front).',
    ['Opercular part of inferior frontal gyrus', 'Triangular part of inferior frontal gyrus', 'Lat Fis-ant-Horizont', 'Lat Fis-post'],
    'Lies on the lateral surface supplied by MCA branches (superior division), which run along the groove.'
  )),
  T(/^Lat Fis-ant-Horizont$/i, f(
    'Anterior horizontal ramus of the lateral sulcus; a short horizontal cleft cutting forward into the inferior frontal gyrus, in the frontal lobe.',
    'Landmark groove: it separates the triangular part (above) from the orbital part (below) of the inferior frontal gyrus.',
    ['Triangular part of inferior frontal gyrus', 'Orbital part of inferior frontal gyrus', 'Lat Fis-ant-Vertical', 'Lat Fis-post'],
    'Lies on the lateral surface supplied by MCA branches (superior division), which run along the groove.'
  )),
  T(/^Inferior frontal sulcus$/i, f(
    'Horizontal groove on the lateral frontal lobe separating the middle frontal gyrus above from the inferior frontal gyrus below.',
    'Landmark groove; it marks the boundary between the middle and inferior frontal gyri.',
    ['Middle frontal gyrus', 'Triangular part of inferior frontal gyrus', 'Superior frontal sulcus', 'Precentral sulcus (inferior part)'],
    MCA_LAT + ' Prefrontal branches of the MCA.'
  )),
  T(/^Middle frontal gyrus$/i, f(
    'Central gyrus of the lateral frontal lobe, between the superior and inferior frontal sulci.',
    'Dorsolateral prefrontal cortex for working memory, planning and attention; its posterior part holds the frontal eye field for voluntary gaze to the opposite side.',
    ['Superior frontal sulcus', 'Inferior frontal sulcus', 'Precentral sulcus (Superior part)', 'Superior frontal gyrus'],
    MCA_LAT + ' Prefrontal and precentral branches of the MCA.',
    {ba: 'BA 9, 46 (anterior); BA 8 (posterior)'})),
  T(/^Orbital gyri$/i, f(
    'Group of gyri on the orbital (inferior) surface of the frontal lobe, over the roof of the orbit.',
    'Orbitofrontal cortex: evaluates reward and punishment, guides decisions and social behaviour; damage can cause disinhibition and personality change.',
    ['Orbital sulci (H-shaped orbital sulci)', 'Straight gyrus (Gyrus rectus)', 'Olfactory sulcus', 'Orbital part of inferior frontal gyrus'],
    'ACA (orbitofrontal branches) supplies the medial part of the orbital surface; MCA (orbitofrontal branch) supplies the lateral part.',
    {ba: 'BA 11, 12, 47'})),
  T(/^Precentral gyrus$/i, f(
    'Gyrus directly in front of the central sulcus; the posterior gyrus of the frontal lobe.',
    'Primary motor cortex: voluntary movement of the opposite side of the body, arranged as a motor homunculus. Lesion causes contralateral weakness (paralysis).',
    ['Central sulcus', 'Postcentral gyrus', 'Precentral sulcus (inferior part)', 'Precentral sulcus (Superior part)', 'Paracentral gyrus and sulcus'],
    'Lateral convexity (face and arm areas) is supplied by the MCA; the leg area on the medial surface is supplied by the ACA.',
    {ba: 'BA 4'})),
  T(/^Superior frontal gyrus$/i, f(
    'Uppermost gyrus of the frontal lobe, running along the superior margin and continuing on the medial surface.',
    'Contains the premotor cortex and supplementary motor area (planning and initiation of movement) and prefrontal areas for executive control.',
    ['Superior frontal sulcus', 'Middle frontal gyrus', 'Paracentral sulcus', 'Precentral gyrus'],
    'Medial surface by the ACA (callosomarginal branches); dorsolateral part by the MCA.',
    {ba: 'BA 6, 8, 9'})),
  T(/^Superior frontal sulcus$/i, f(
    'Longitudinal groove on the lateral frontal lobe between the superior and middle frontal gyri.',
    'Landmark groove; it marks the boundary between the superior and middle frontal gyri.',
    ['Superior frontal gyrus', 'Middle frontal gyrus', 'Inferior frontal sulcus', 'Precentral sulcus (Superior part)'],
    MCA_LAT + ' Prefrontal and precentral branches of the MCA.'
  )),
  T(/^Paracentral sulcus$/i, f(
    'Groove on the medial surface of the frontal lobe that bounds the front of the paracentral lobule.',
    'Landmark groove; it separates the paracentral lobule from the medial part of the superior frontal gyrus.',
    ['Paracentral gyrus and sulcus', 'Superior frontal gyrus', 'Central sulcus'],
    ACA_MED + ' Pericallosal and callosomarginal branches.'
  )),
  T(/^Orbital sulci \(/i, f(
    'Grooves on the orbital surface of the frontal lobe; the H-shaped sulci (medial, lateral, transverse and anterior/posterior limbs) delimit the orbital gyri, and the lateral orbital sulcus marks the lateral edge. Both belong to the frontal lobe.',
    'Landmark grooves that divide the orbital gyri; the H-shaped sulci are the main pattern of the orbitofrontal surface.',
    ['Orbital gyri', 'Straight gyrus (Gyrus rectus)', 'Olfactory sulcus', 'Orbital part of inferior frontal gyrus'],
    'Orbitofrontal branches of the ACA (medial part) and MCA (lateral part).'
  )),
  T(/^Olfactory sulcus$/i, f(
    'Straight groove on the orbital surface of the frontal lobe that houses the olfactory bulb and tract.',
    'Landmark groove; it separates the straight gyrus (medial) from the orbital gyri (lateral).',
    ['Straight gyrus (Gyrus rectus)', 'Orbital gyri', 'Orbital sulci (H-shaped orbital sulci)'],
    'Olfactory bulb and tract in the groove are supplied by the ACA; the medial part of the orbital surface is also ACA territory.'
  )),
  T(/^Precentral sulcus \(/i, f(
    'Groove just in front of the precentral gyrus, split into a superior and an inferior part; frontal lobe.',
    'Landmark groove marking the anterior boundary of the primary motor cortex. The superior part lies near the frontal eye field and premotor cortex; the inferior part lies next to the opercular part of the inferior frontal gyrus.',
    ['Precentral gyrus', 'Middle frontal gyrus', 'Superior frontal sulcus', 'Inferior frontal sulcus'],
    MCA_LAT + ' Precentral and prefrontal branches of the MCA.'
  )),

  // ---- parietal ----
  T(/^Subparietal sulcus$/i, f(
    'Groove on the medial surface of the parietal lobe, above the posterior part of the cingulate gyrus and below the precuneus.',
    'Landmark groove; it separates the precuneus from the cingulate gyrus.',
    ['Precuneus', 'Cingulate gyrus and sulcus (Posterior dorsal part)', 'Parieto-occipital sulcus'],
    ACA_MED + ' Pericallosal artery, with the posterior cerebral artery supplying the area behind.'
  )),
  T(/^Angular gyrus$/i, f(
    'Gyrus that arches over the end of the superior temporal sulcus, in the posterior inferior parietal lobule, behind the supramarginal gyrus.',
    'Reading, writing, calculation and semantic processing; in the dominant hemisphere lesions cause alexia with agraphia, acalculia, left-right confusion and finger agnosia (Gerstmann syndrome).',
    ['Supramarginal gyrus', 'Sulcus interm prim-Jensen', 'Intraparietal sulcus', 'Superior temporal sulcus'],
    'MCA, through the angular artery (inferior division).',
    {ba: 'BA 39'})),
  T(/^Supramarginal gyrus$/i, f(
    'Gyrus of the inferior parietal lobule that arches over the posterior end of the lateral sulcus.',
    'Phonological and language processing, body awareness and tool use (praxis). Lesion can give conduction aphasia or apraxia.',
    ['Angular gyrus', 'Postcentral gyrus', 'Lat Fis-post', 'Sulcus interm prim-Jensen'],
    MCA_LAT + ' Inferior division, parietal branches.',
    {ba: 'BA 40'})),
  T(/^Postcentral gyrus$/i, f(
    'Gyrus directly behind the central sulcus, the anterior gyrus of the parietal lobe.',
    'Primary somatosensory cortex: touch, pressure, vibration, proprioception from the opposite side of the body (sensory homunculus). Lesion gives contralateral sensory loss.',
    ['Central sulcus', 'Precentral gyrus', 'Postcentral sulcus', 'Paracentral gyrus and sulcus'],
    'Lateral convexity by the MCA; the leg area on the medial surface by the ACA.',
    {ba: 'BA 3, 1, 2'})),
  T(/^Postcentral sulcus$/i, f(
    'Groove just behind the postcentral gyrus, often joining the intraparietal sulcus; parietal lobe.',
    'Landmark groove marking the posterior limit of the primary somatosensory cortex.',
    ['Postcentral gyrus', 'Intraparietal sulcus', 'Superior parietal lobule'],
    MCA_LAT + ' Parietal branches of the MCA.'
  )),
  T(/^Precuneus$/i, f(
    'Medial surface of the parietal lobe, between the paracentral lobule in front, the parieto-occipital sulcus behind and the subparietal sulcus below.',
    'Visuospatial imagery, episodic memory retrieval and self-related thinking.',
    ['Parieto-occipital sulcus', 'Subparietal sulcus', 'Paracentral gyrus and sulcus', 'Superior parietal lobule'],
    'ACA (pericallosal artery) supplies it up to the parieto-occipital sulcus.',
    {ba: 'BA 7'})),
  T(/^Superior parietal lobule$/i, f(
    'Part of the parietal lobe above the intraparietal sulcus, extending onto the medial surface.',
    'Integrates somatosensory and visual information for spatial awareness and guiding reaching movements. Lesion can cause contralateral neglect (non-dominant side) or optic ataxia.',
    ['Intraparietal sulcus', 'Postcentral sulcus', 'Precuneus', 'Postcentral gyrus'],
    MCA_LAT + ' Parietal branches; the medial edge is supplied by the ACA.',
    {ba: 'BA 5, 7'})),
  T(/^Intraparietal sulcus$/i, f(
    'Long horizontal groove on the lateral parietal lobe that divides the superior parietal lobule from the inferior parietal lobule (supramarginal and angular gyri).',
    'Landmark groove; its banks are involved in attention, eye-hand coordination and number processing.',
    ['Superior parietal lobule', 'Supramarginal gyrus', 'Angular gyrus', 'Postcentral sulcus'],
    MCA_LAT + ' Parietal branches of the MCA.'
  )),
  T(/^Sulcus interm prim-Jensen$/i, f(
    'Intermediate sulcus of Jensen, a short groove of the parietal lobe running off the intraparietal sulcus between the supramarginal and angular gyri.',
    'Landmark groove separating the supramarginal gyrus from the angular gyrus.',
    ['Supramarginal gyrus', 'Angular gyrus', 'Intraparietal sulcus'],
    MCA_LAT + ' Parietal and angular branches of the MCA.'
  )),

  // ---- insula ----
  T(/^Circular sulcus of insula$/i, f(
    'Groove that surrounds the insula and separates it from the frontal, parietal and temporal opercula; belongs to the insula.',
    'Landmark boundary of the insula, deep within the lateral sulcus.',
    ['Insula (Subcentral gyrus and ant. and post. sulci)', 'Lat Fis-post', 'Lat Fis-ant-Vertical'],
    'Insular (M2) branches of the MCA.'
  )),
  T(/^Insula \(/i, f(
    'Cortex buried deep in the lateral sulcus, covered by the frontal, parietal and temporal opercula; includes the short and long insular gyri, with the subcentral gyrus and the anterior and posterior insular sulci.',
    'Taste, visceral and autonomic sensation, pain, interoception, and emotional awareness (e.g. disgust). Lesions can disturb taste, visceral sensation or speech articulation.',
    ['Circular sulcus of insula', 'Lat Fis-post', 'Transverse temporal gyri', 'Opercular part of inferior frontal gyrus'],
    'MCA, mainly its insular (M2) branches.',
    {ba: 'BA 13, 14'})),
];
