import type {BrainFact} from './brain-facts-types';
const f = (loc: string, fn: string, rel: string[], blood: string, extra: Partial<BrainFact> = {}): BrainFact => ({loc, fn, rel, blood, ...extra});
const T = (re: RegExp, fact: BrainFact): [RegExp, BrainFact] => [re, fact];

const CAPSULE = 'Mixed supply: lenticulostriate branches of the MCA supply most of the anterior limb, genu and posterior limb; the medial striate artery (recurrent artery of Heubner, ACA) supplies the anterior limb; the anterior choroidal artery supplies the lower posterior limb and the retrolenticular part.';

export const FACTS: [RegExp, BrainFact][] = [
  T(/^Corpus callosum$/, f(
    'Large midline bundle of fibres that crosses between the two cerebral hemispheres above the lateral ventricles; it has a rostrum, genu, body and splenium.',
    'Connects corresponding areas of the two hemispheres and lets them share motor, sensory and cognitive information. Complete section causes a disconnection syndrome, and a splenial lesion can cause alexia without agraphia.',
    ['Lateral ventricle', 'Septum pellucidum', 'Fornix', 'Cingulate gyrus and sulcus (Middle anterior part)'],
    'Genu and body: pericallosal artery (ACA) and callosomarginal branches. Splenium: posterior pericallosal branches of the PCA, with some contribution from the pericallosal artery.')),
  T(/^Anterior commissure$/, f(
    'Small bundle crossing the midline in front of the columns of the fornix, at the rostral end of the third ventricle.',
    'Connects the temporal lobes and amygdalae of the two sides, and carries some olfactory fibres. Damage alone rarely gives a clear deficit.',
    ['Third ventricle', 'Fornix', 'Temporal pole', 'Corpus callosum'],
    'Small perforating branches of the anterior communicating artery and the ACA.')),
  T(/^Hippocampal commissure$/, f(
    'Thin sheet of crossing fibres under the splenium of the corpus callosum, joining the two crura of the fornix.',
    'Links the hippocampal formations of the two hemispheres. Isolated damage is not known to give a distinct deficit.',
    ['Fornix', 'Hippocampus', 'Corpus callosum'],
    'Posterior pericallosal and posterior choroidal branches of the PCA.')),
  T(/^Fornix$/, f(
    'C-shaped bundle that arches from the hippocampus (fimbria and crus) under the corpus callosum, forms the body and columns, and ends mainly in the mamillary bodies.',
    'Main output pathway of the hippocampus, carrying memory-circuit fibres to the mamillary bodies, septal nuclei and anterior thalamus. Bilateral damage causes anterograde amnesia.',
    ['Hippocampus', 'Mamillary body', 'Septal nuclei', 'Septum pellucidum', 'Anterior nuclei of thalamus'],
    'Posterior choroidal branches of the PCA supply the crus and body; ACA branches and the anterior communicating artery supply the columns.')),
  T(/^Stria terminalis$/, f(
    'Slender bundle that runs from the amygdala along the groove between the caudate nucleus and thalamus, arching in the floor of the lateral ventricle to reach the hypothalamus and septal area.',
    'Main efferent pathway of the corticomedial amygdala, carrying emotional and autonomic influences to the medial hypothalamus and septal nuclei.',
    ['Corticomedial group', 'Caudate nucleus', 'Lateral ventricle', 'Septal nuclei', 'Preoptic hypothalamus'],
    'Anterior choroidal artery and thalamostriate branches; some supply from posterior choroidal branches of the PCA.')),
  T(/^White matter of telencephalon$/, f(
    'The bulk of the cerebral hemisphere beneath the cortex (centrum semiovale and corona radiata), made of association, commissural and projection fibres.',
    'Connects cortical areas with each other, with the opposite hemisphere and with subcortical structures. Widespread damage slows processing and gives disconnection deficits.',
    ['Corpus callosum', 'Lateral ventricle', 'Caudate nucleus', 'Putamen'],
    'Deep white matter: long medullary branches of the MCA, with the ACA medially and the PCA posteriorly. The corona radiata near the internal capsule receives lenticulostriate (MCA), medial striate (ACA) and anterior choroidal branches.')),
  T(/^Acoustic radiation$/, f(
    'Runs from the medial geniculate body through the sublenticular part of the internal capsule to the transverse temporal gyri.',
    'Carries auditory information to the primary auditory cortex. Because the pathway is bilateral, a one-sided lesion gives only mild hearing loss, mainly in sound localisation.',
    ['Medial geniculate body', 'Transverse temporal gyri', 'Inferior colliculus'],
    'Anterior choroidal artery (retrolenticular and sublenticular part of the internal capsule) and MCA temporal branches.')),
  T(/^Anterior thalamic radiation$/, f(
    'Runs from the anterior and mediodorsal thalamic nuclei through the anterior limb of the internal capsule to the prefrontal cortex and cingulate gyrus.',
    'Connects the thalamus with the frontal lobe and limbic system for executive function, attention and memory. Damage causes apathy and executive dysfunction.',
    ['Anterior nuclei of thalamus', 'Mediodorsal nucleus', 'Superior frontal gyrus'],
    CAPSULE)),
  T(/^Arcuate fasciculus$/, f(
    'Association bundle that curves around the lateral sulcus, linking the posterior superior temporal region (Wernicke area) with the inferior frontal gyrus (Broca area).',
    'Carries language information between the comprehension and production areas, important for repetition. A lesion gives conduction aphasia, with fluent speech and poor repetition.',
    ['Triangular part of inferior frontal gyrus', 'Superior temporal gyrus (Lateral part)', 'Supramarginal gyrus', 'Opercular part of inferior frontal gyrus'],
    'MCA branches (insular, temporal and parietal), mainly the angular and posterior temporal arteries.')),
  T(/^Corticobulbar tract$/, f(
    'Runs from the lateral precentral gyrus through the genu of the internal capsule and the cerebral peduncle to the motor nuclei of cranial nerves in the brainstem.',
    'Gives voluntary control of the muscles of the face, jaw, tongue and pharynx, mostly with bilateral input. A lesion gives contralateral lower facial weakness and tongue deviation.',
    ['Corticospinal tract', 'Precentral gyrus', 'Base of peduncle', 'Pons'],
    'Genu of internal capsule: anterior choroidal and lenticulostriate branches. Midbrain: PCA and superior cerebellar artery. Pons: paramedian pontine branches of the basilar artery.')),
  T(/^Corticopontine tract \((frontal|occipital|parietal)\)$/, f(
    'Fibres from the frontal, parietal and occipital cortex that descend through the internal capsule and the base of the peduncle to the pontine nuclei.',
    'First link of the cortico-ponto-cerebellar loop, passing cortical information to the cerebellum through the middle cerebellar peduncle for motor planning. Frontal fibres lie medially and parieto-occipital fibres laterally in the peduncle.',
    ['Middle cerebellar peduncle', 'Base of peduncle', 'Pons', 'Corticospinal tract'],
    'Internal capsule: lenticulostriate, medial striate and anterior choroidal branches. Peduncle: PCA branches. Pons: paramedian pontine branches of the basilar artery.',
    {group: 'Corticopontine tract (frontal), Corticopontine tract (occipital) and Corticopontine tract (parietal), named after the lobe of origin.'})),
  T(/^Corticospinal tract$/, f(
    'Runs from the motor cortex through the posterior limb of the internal capsule, the base of the peduncle and the basal pons, and crosses in the pyramidal decussation to the lateral spinal cord.',
    'Main pathway for voluntary movement, especially skilled fine movement of the limbs. A lesion gives contralateral weakness with spasticity and an upgoing plantar response.',
    ['Precentral gyrus', 'Pyramid of medulla oblongata', 'Base of peduncle', 'Pons', 'Corticobulbar tract'],
    'Internal capsule: lenticulostriate (MCA) and anterior choroidal branches. Midbrain: PCA. Pons: paramedian pontine branches of the basilar artery. Medulla pyramid: anterior spinal artery.')),
  T(/^Corticostriatal tract \((anterior|posterior|superior)\)$/, f(
    'Fibres from the cerebral cortex that pass through or beside the internal capsule to the caudate nucleus and putamen; the three named bundles come from the frontal, posterior and superior cortical regions.',
    'Carry cortical input to the striatum, the entry stage of the basal ganglia loops for movement, habit and motivation. Damage contributes to basal ganglia type motor and behavioural problems.',
    ['Caudate nucleus', 'Putamen', 'Nucleus accumbens', 'Globus pallidus internal'],
    CAPSULE,
    {group: 'Corticostriatal tract (anterior), Corticostriatal tract (posterior) and Corticostriatal tract (superior), named after the cortical region of origin.'})),
  T(/^Dentatorubrothalamic tract$/, f(
    'Leaves the dentate nucleus through the superior cerebellar peduncle, crosses in the midbrain, and passes the red nucleus to reach the ventral lateral thalamus.',
    'Main output of the cerebellar hemisphere, relaying through the thalamus to the motor cortex for coordination. A lesion gives ipsilateral limb ataxia and intention tremor.',
    ['Superior cerebellar peduncle', 'Red nucleus', 'Ventral lateroventral nucleus', 'Midbrain'],
    'Superior cerebellar artery in the peduncle and caudal midbrain; PCA branches in the rostral midbrain and thalamus.')),
  T(/^Frontal aslant tract$/, f(
    'Short association bundle linking the inferior frontal gyrus with the supplementary motor area and anterior cingulate region of the same side.',
    'Supports speech initiation and verbal fluency and executive control of movement. Damage, especially on the left, reduces fluent speech.',
    ['Triangular part of inferior frontal gyrus', 'Superior frontal gyrus', 'Opercular part of inferior frontal gyrus'],
    'MCA frontal branches for the inferior frontal part; ACA branches for the medial part.')),
  T(/^Inferior cerebellar peduncle$/, f(
    'Runs between the medulla and the cerebellum along the lateral wall of the fourth ventricle, containing the restiform and juxtarestiform bodies.',
    'Carries proprioceptive input (dorsal spinocerebellar, cuneocerebellar, olivocerebellar fibres) to the cerebellum and vestibular connections in both directions. Damage gives ipsilateral ataxia and vestibular signs.',
    ['Olive', 'Vestibular nuclei', 'Medulla oblongata', 'Fourth ventricle'],
    'Posterior inferior cerebellar artery (PICA).')),
  T(/^Inferior fronto-occipital fasciculus$/, f(
    'Long association bundle running from the frontal lobe through the extreme capsule and temporal stem to the occipital and posterior temporal cortex.',
    'Links frontal and posterior regions for semantic language processing and visual attention. Damage may cause semantic errors in language.',
    ['Uncinate fasciculus', 'Inferior longitudinal fasciculus', 'Orbital gyri', 'Occipital pole'],
    'MCA branches (frontal, insular, temporal) with PCA branches posteriorly.')),
  T(/^Inferior longitudinal fasciculus$/, f(
    'Association bundle running along the lateral wall of the temporal and occipital lobes from the occipital cortex to the anterior temporal lobe.',
    'Carries visual information forward to the temporal lobe for object and face recognition and visual memory. Damage can cause visual agnosia.',
    ['Occipital pole', 'Temporal pole', 'Inferior fronto-occipital fasciculus', 'Lateral occipitotemporal gyrus'],
    'PCA branches for the occipital part and MCA temporal branches for the temporal part.')),
  T(/^Medial lemniscus$/, f(
    'Ascends from the nucleus gracilis and cuneatus (crossing as internal arcuate fibres) through the medulla, pons and midbrain to the ventral posterior thalamus.',
    'Carries fine touch, vibration and conscious proprioception. A lesion gives contralateral loss of these modalities below the level of the lesion.',
    ['Pyramid of medulla oblongata', 'Olive', 'Pons', 'Midbrain'],
    'Medulla: anterior spinal artery (medial part). Pons: paramedian pontine branches. Midbrain: PCA and superior cerebellar artery branches.')),
  T(/^Middle cerebellar peduncle$/, f(
    'Large bundle of crossed fibres that runs from the basal pontine nuclei to the cerebellar hemisphere, forming the lateral pons.',
    'Carries cortical information from the pontine nuclei to the cerebellum for motor planning. Damage gives ipsilateral limb ataxia.',
    ['Pons', 'Corticopontine tract (frontal)', 'Superior cerebellar peduncle', 'Inferior cerebellar peduncle'],
    'Anterior inferior cerebellar artery (AICA) and the superior cerebellar artery.')),
  T(/^Middle longitudinal fasciculus$/, f(
    'Association bundle running within the superior temporal gyrus from the temporal pole to the parietal and occipital regions.',
    'Probably supports auditory and language processing and attention linking the temporal and parietal lobes. Its clinical role is not well established.',
    ['Superior temporal gyrus (Lateral part)', 'Angular gyrus', 'Temporal pole', 'Arcuate fasciculus'],
    'MCA temporal and angular branches.')),
  T(/^Optic radiation$/, f(
    'Runs from the lateral geniculate body through the retrolenticular internal capsule to the visual cortex around the calcarine sulcus; the lower fibres loop into the temporal lobe (Meyer loop).',
    'Carries visual information to the primary visual cortex. Temporal lesions give a contralateral upper quadrant defect (pie in the sky), and parietal lesions a lower quadrant defect.',
    ['Lateral geniculate body', 'Calcarine sulcus', 'Lateral ventricle', 'Optic tract'],
    'Anterior choroidal artery (first part), MCA deep branches along the course, and the calcarine branch of the PCA at the cortical end.')),
  T(/^Posterior thalamic radiation$/, f(
    'Runs from the pulvinar and posterior thalamus through the retrolenticular internal capsule to the parietal, occipital and posterior temporal cortex.',
    'Connects the thalamus with posterior association cortex for visual and attentional processing. Damage gives visual or attentional deficits.',
    ['Pulvinar', 'Optic radiation', 'Lateral geniculate body', 'Angular gyrus'],
    CAPSULE)),
  T(/^Reticulospinal tract$/, f(
    'Descends from the pontine and medullary reticular formation in the brainstem to the spinal cord.',
    'Controls posture, muscle tone and automatic movement and modulates reflexes. Loss of cortical control over it contributes to spasticity.',
    ['Pons', 'Medulla oblongata', 'Corticospinal tract'],
    'Pons: paramedian and circumferential branches of the basilar artery. Medulla: anterior spinal artery medially and PICA laterally.')),
  T(/^Superior longitudinal fasciculus (I|II|III)$/, f(
    'Long association bundle above the insula connecting the frontal lobe with the parietal (and some temporal) lobe: I in the superior frontal and medial parietal region, II in the middle frontal and angular region, III in the inferior frontal and supramarginal region.',
    'Links frontal and parietal areas for motor planning, spatial attention and language. SLF I is related to movement initiation, SLF II to visuospatial attention and SLF III to speech and articulation.',
    ['Arcuate fasciculus', 'Supramarginal gyrus', 'Middle frontal gyrus', 'Superior frontal gyrus', 'Angular gyrus'],
    'MCA branches in the deep white matter of the hemisphere, with ACA branches for the medial part of SLF I.',
    {group: 'Superior longitudinal fasciculus I, II and III, three parallel subdivisions of one bundle.'})),
  T(/^Superior thalamic radiation$/, f(
    'Runs from the ventral posterior and lateral thalamic nuclei through the posterior limb of the internal capsule to the sensorimotor cortex around the central sulcus.',
    'Carries somatosensory and motor relay information between the thalamus and the pre- and postcentral gyri. Damage gives contralateral sensory loss and motor deficits.',
    ['Postcentral gyrus', 'Precentral gyrus', 'Ventral lateroventral nucleus', 'Corticospinal tract'],
    CAPSULE)),
  T(/^Uncinate fasciculus$/, f(
    'Hook-shaped association bundle that curves around the lateral sulcus, connecting the anterior temporal lobe and amygdala with the orbitofrontal cortex.',
    'Links emotion and memory areas of the temporal lobe with the frontal lobe. Damage is associated with emotional and social behaviour changes and semantic memory problems.',
    ['Temporal pole', 'Orbital gyri', 'Inferior fronto-occipital fasciculus', 'Basolateral complex'],
    'MCA branches (temporal and orbitofrontal) with ACA orbitofrontal branches.')),
];
