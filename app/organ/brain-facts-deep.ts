import type {BrainFact} from './brain-facts-types';
const f = (loc: string, fn: string, rel: string[], blood: string, extra: Partial<BrainFact> = {}): BrainFact => ({loc, fn, rel, blood, ...extra});
const T = (re: RegExp, fact: BrainFact): [RegExp, BrainFact] => [re, fact];

export const FACTS: [RegExp, BrainFact][] = [
  // ---------- diencephalon: epithalamus, subthalamus, optic pathway, pituitary, pineal ----------
  T(/^Habenula$/, f(
    'A small nucleus at the posterior end of the dorsal thalamus, beside the third ventricle and in front of the pineal gland.',
    'Relays limbic and basal forebrain signals from the stria medullaris to the midbrain and brainstem; it takes part in reward, aversion and sleep-wake regulation.',
    ['Stria medullaris thalami', 'Pineal gland', 'Third ventricle', 'Posterior commissure'],
    'Posterior choroidal branches of the posterior cerebral artery.')),
  T(/^Stria medullaris thalami$/, f(
    'A thin fibre bundle running along the upper medial edge of the thalamus, in the wall of the third ventricle, ending at the habenula.',
    'Carries septal, preoptic and hypothalamic fibres to the habenula, linking the limbic forebrain with the epithalamus.',
    ['Habenula', 'Septal nuclei', 'Third ventricle', 'Pineal gland'],
    'Posterior choroidal branches of the posterior cerebral artery.')),
  T(/^Posterior commissure$/, f(
    'A small bundle of crossing fibres at the junction of the third ventricle and the cerebral aqueduct, just below the pineal gland.',
    'Connects the two sides of the pretectal area and midbrain; it carries the crossed fibres of the pupillary light reflex and of vertical gaze. Compression here (for example by a pineal tumour) causes impaired upward gaze.',
    ['Pineal gland', 'Habenula', 'Aqueduct of midbrain', 'Third ventricle'],
    'Perforating and posterior choroidal branches of the posterior cerebral artery.')),
  T(/^Pineal gland$/, f(
    'A small pine-cone shaped gland on the midline behind the third ventricle, above the superior colliculi.',
    'Secretes melatonin, which follows the day-night cycle and helps regulate circadian rhythm.',
    ['Habenula', 'Posterior commissure', 'Third ventricle', 'Superior colliculus'],
    'Posterior choroidal branches of the posterior cerebral artery.')),
  T(/^Subthalamic nucleus$/, f(
    'A lens-shaped nucleus below the thalamus, above the substantia nigra and medial to the internal capsule.',
    'An excitatory nucleus of the basal ganglia circuit that drives the internal globus pallidus and substantia nigra reticulata. A lesion causes contralateral hemiballismus.',
    ['Globus pallidus internal', 'Globus pallidus external', 'Substantia nigra', 'Putamen'],
    'Posterior cerebral artery branches, with perforators from the posterior communicating artery.')),
  T(/^Optic tract$/, f(
    'The continuation of the optic pathway behind the optic chiasm, running around the cerebral peduncle to the lateral geniculate body.',
    'Carries visual fibres from the contralateral visual field (temporal retina of the same eye and nasal retina of the other eye). A lesion causes a contralateral homonymous hemianopia.',
    ['Optic chiasm', 'Lateral geniculate body', 'Optic nerve (II)', 'Superior colliculus'],
    'Anterior choroidal artery.')),
  T(/^Optic chiasm$/, f(
    'A flat X-shaped crossing of the optic nerves in front of the infundibulum, below the floor of the third ventricle and above the pituitary.',
    'Fibres from the nasal half of each retina cross here, so each optic tract carries the opposite visual field. Midline compression (for example by a pituitary tumour) causes bitemporal hemianopia.',
    ['Optic nerve (II)', 'Optic tract', 'Neurohypophysis', 'Anterior hypothalamus'],
    'Small branches of the internal carotid, anterior cerebral and anterior communicating arteries.')),
  T(/^Lateral geniculate body$/, f(
    'A bump on the posterolateral underside of the thalamus, where the optic tract ends.',
    'The thalamic relay of vision: it receives retinal fibres through the optic tract and sends them through the optic radiation to the primary visual cortex.',
    ['Optic tract', 'Optic radiation', 'Calcarine sulcus', 'Medial geniculate body'],
    'Anterior choroidal artery (anterior part) and thalamogeniculate branches of the posterior cerebral artery (posterior part).')),
  T(/^Medial geniculate body$/, f(
    'A bump on the posterior underside of the thalamus, medial to the lateral geniculate body and below the pulvinar.',
    'The thalamic relay of hearing: it receives fibres from the inferior colliculus and projects through the acoustic radiation to the primary auditory cortex.',
    ['Inferior colliculus', 'Acoustic radiation', 'Transverse temporal gyri', 'Lateral geniculate body'],
    'Thalamogeniculate branches of the posterior cerebral artery.')),
  T(/^Pulvinar$/, f(
    'The large posterior end of the thalamus, overhanging the midbrain and the geniculate bodies.',
    'An association nucleus connected with parietal, temporal and occipital association cortex and the superior colliculus; it takes part in visual attention and visual integration.',
    ['Lateral geniculate body', 'Medial geniculate body', 'Superior colliculus', 'Posterior thalamic radiation'],
    'Thalamogeniculate and posterior choroidal branches of the posterior cerebral artery.')),
  T(/^Anterior nuclei of thalamus$/, f(
    'The most anterior thalamic nuclei, forming the anterior tubercle at the front of the thalamus, below the floor of the lateral ventricle.',
    'Part of the limbic memory circuit: they receive the mammillothalamic tract from the mamillary body and project to the cingulate gyrus. Damage causes memory impairment.',
    ['Mamillary body', 'Fornix', 'Anterior thalamic radiation', 'Cingulate gyrus and sulcus (Middle anterior part)'],
    'Perforating branches of the posterior communicating artery and the posterior cerebral artery (thalamoperforating branches).')),
  T(/^Mediodorsal nucleus$/, f(
    'A large nucleus in the medial thalamus, beside the wall of the third ventricle.',
    'Connected with the prefrontal cortex, amygdala and basal forebrain; it takes part in memory, emotion and executive function. A lesion causes memory loss and personality or motivation changes.',
    ['Anterior thalamic radiation', 'Basolateral complex', 'Orbital gyri', 'Third ventricle'],
    'Thalamoperforating branches of the posterior cerebral artery and perforators of the posterior communicating artery.')),
  T(/^Ventral anterior nucleus$/, f(
    'A motor nucleus in the anterior part of the ventral thalamus, in front of the ventral lateral nucleus.',
    'Receives the globus pallidus internal output and projects to premotor and prefrontal cortex; it helps start and select movements.',
    ['Globus pallidus internal', 'Ventral lateroventral nucleus', 'Anterior thalamic radiation', 'Caudate nucleus'],
    'Perforating branches of the posterior communicating artery, with branches of the posterior cerebral artery.')),
  T(/^Ventral lateroventral nucleus$/, f(
    'A motor nucleus in the lateral part of the ventral thalamus, behind the ventral anterior nucleus.',
    'Receives cerebellar output (dentate nucleus, through the dentatorubrothalamic tract) and pallidal fibres, and projects to the motor and premotor cortex. A lesion impairs movement coordination.',
    ['Dentatorubrothalamic tract', 'Superior cerebellar peduncle', 'Ventral anterior nucleus', 'Precentral gyrus'],
    'Thalamogeniculate branches of the posterior cerebral artery.')),
  T(/^Ventral laterodorsal nucleus$/, f(
    'A nucleus of the dorsal tier of the lateral thalamus, above the ventral lateral nucleus and beside the anterior nuclei.',
    'A limbic-associated nucleus connected with the cingulate gyrus and parietal cortex; its function resembles that of the anterior nuclei.',
    ['Anterior nuclei of thalamus', 'Ventral lateroventral nucleus', 'Pulvinar', 'Cingulate gyrus and sulcus (Middle posterior part)'],
    'Thalamogeniculate branches of the posterior cerebral artery.')),
  T(/^Intralaminar and lateral posterior nuclei$/, f(
    'The intralaminar nuclei lie inside the internal medullary lamina of the thalamus; the lateral posterior nucleus lies in the dorsal tier behind the laterodorsal nucleus.',
    'The intralaminar nuclei project widely to cortex and striatum and support arousal and attention; the lateral posterior nucleus is a parietal association relay related to the pulvinar.',
    ['Mediodorsal nucleus', 'Pulvinar', 'Caudate nucleus', 'Putamen'],
    'Thalamoperforating and thalamogeniculate branches of the posterior cerebral artery.',
    {shared: true, group: 'Shared card: Intralaminar nuclei and Lateral posterior nucleus (the model has one structure for both).'})),
  T(/^Adenohypophysis$/, f(
    'The anterior lobe of the pituitary gland, lying in the sella turcica below the optic chiasm.',
    'Makes and releases ACTH, TSH, FSH, LH, GH and prolactin under control of hypothalamic releasing and inhibiting hormones delivered by the hypophyseal portal veins.',
    ['Neurohypophysis', 'Tuberal hypothalamus', 'Optic chiasm', 'Cavernous sinus'],
    'Superior hypophysial arteries (from the internal carotid) feed the portal system; the hypophysis is also supplied by branches related to the posterior communicating artery.')),
  T(/^Neurohypophysis$/, f(
    'The posterior lobe of the pituitary gland and its stalk, continuous with the hypothalamus through the infundibulum.',
    'Stores and releases vasopressin and oxytocin made in the supraoptic and paraventricular nuclei and delivered by the hypothalamo-hypophysial tract.',
    ['Adenohypophysis', 'Anterior hypothalamus', 'Optic chiasm', 'Cavernous sinus'],
    'Inferior hypophysial arteries (from the internal carotid); the infundibulum is supplied by branches related to the posterior communicating artery.')),

  // ---------- hypothalamus (one card per region) ----------
  T(/^Preoptic hypothalamus$/, f(
    'The most anterior part of the hypothalamus, in front of the optic chiasm around the lamina terminalis.',
    'Controls body temperature and takes part in endocrine regulation and sexual behaviour. Damage can disturb thermoregulation.',
    ['Anterior hypothalamus', 'Third ventricle', 'Optic chiasm', 'Anterior commissure'],
    'Branches of the anterior cerebral artery and anterior communicating artery (perforators).',
    {nuclei: [
      {name: 'Medial preoptic nucleus', text: 'Temperature regulation, control of gonadotropin release and sexual behaviour.'},
      {name: 'Lateral preoptic nucleus', text: 'Connected with the medial forebrain bundle; takes part in sleep and arousal regulation.'},
    ]})),
  T(/^Anterior hypothalamus$/, f(
    'The hypothalamic region above the optic chiasm, behind the preoptic area, beside the third ventricle.',
    'Contains the nuclei that set circadian rhythm and make the posterior pituitary hormones; it also drives parasympathetic and heat-loss responses.',
    ['Preoptic hypothalamus', 'Optic chiasm', 'Neurohypophysis', 'Optic tract'],
    'Branches of the anterior cerebral artery and anterior communicating artery (perforators).',
    {nuclei: [
      {name: 'Suprachiasmatic nucleus', text: 'Receives retinal input and acts as the master circadian clock.'},
      {name: 'Supraoptic nucleus', text: 'Makes vasopressin and oxytocin; they are sent by the hypothalamo-hypophysial tract to the neurohypophysis.'},
      {name: 'Paraventricular nucleus', text: 'Makes vasopressin and oxytocin sent to the neurohypophysis; it also regulates autonomic output.'},
    ]})),
  T(/^Tuberal hypothalamus$/, f(
    'The middle hypothalamic region above the tuber cinereum and infundibulum, between the optic chiasm and the mamillary bodies.',
    'Regulates feeding, satiety and defensive behaviour, and controls the anterior pituitary through the median eminence.',
    ['Adenohypophysis', 'Neurohypophysis', 'Lateral hypothalamus', 'Mamillary body'],
    'Perforating branches of the posterior communicating artery.',
    {nuclei: [
      {name: 'Ventromedial nucleus', text: 'Satiety centre; also involved in defensive behaviour.'},
      {name: 'Arcuate nucleus', text: 'Controls the adenohypophysis through the median eminence.'},
      {name: 'Dorsomedial nucleus', text: 'Takes part in feeding and autonomic regulation.'},
    ]})),
  T(/^Lateral hypothalamus$/, f(
    'The lateral hypothalamic zone, running through the medial forebrain bundle on each side of the tuberal region.',
    'Drives feeding and arousal. A lesion reduces feeding, and loss of its orexin neurons is linked to narcolepsy.',
    ['Tuberal hypothalamus', 'Posterior hypothalamus', 'Subthalamic nucleus', 'Septal nuclei'],
    'Perforating branches of the posterior communicating artery.',
    {nuclei: [
      {name: 'Lateral hypothalamic area', text: 'Feeding and arousal; contains diffuse neurons projecting widely to cortex and brainstem.'},
    ]})),
  T(/^Posterior hypothalamus$/, f(
    'The hypothalamic region behind the tuberal region and above the mamillary bodies, next to the midbrain.',
    'Mediates sympathetic responses, such as heat conservation and raised blood pressure, and contributes to arousal.',
    ['Mamillary body', 'Lateral hypothalamus', 'Third ventricle', 'Subthalamic nucleus'],
    'Perforating branches of the posterior communicating artery and posterior cerebral artery.',
    {nuclei: [
      {name: 'Posterior hypothalamic nucleus', text: 'Sympathetic responses; its damage can cause loss of heat conservation and altered arousal.'},
    ]})),
  T(/^Mamillary body$/, f(
    'A paired round swelling on the underside of the hypothalamus, behind the tuber cinereum and in front of the interpeduncular fossa.',
    'Part of the memory circuit: it receives the fornix and projects through the mammillothalamic tract to the anterior thalamic nuclei. Damage (for example in thiamine deficiency) causes anterograde amnesia.',
    ['Fornix', 'Anterior nuclei of thalamus', 'Posterior hypothalamus', 'Interpeduncular fossa'],
    'Mostly perforating branches of the posterior communicating artery and posterior cerebral artery.')),

  // ---------- basal nuclei, septal nuclei, amygdala ----------
  T(/^Caudate nucleus$/, f(
    'A C-shaped nucleus along the floor of the lateral ventricle, with a head, body and tail, lateral to the thalamus and internal capsule.',
    'Part of the striatum: it receives cortical input, especially from frontal cortex, and takes part in motor planning, learning and cognition. Degeneration occurs in Huntington disease.',
    ['Putamen', 'Lateral ventricle', 'Corticostriatal tract (anterior)', 'Globus pallidus internal'],
    'Lenticulostriate branches of the middle cerebral artery and the medial striate artery (recurrent artery of Heubner) supply the head; the anterior choroidal artery supplies the body and tail.')),
  T(/^Putamen$/, f(
    'The lateral part of the lentiform nucleus, outside the globus pallidus and medial to the external capsule and insula.',
    'Part of the striatum and the main input of the motor loop of the basal ganglia; it takes part in movement regulation and habit learning.',
    ['Globus pallidus external', 'Globus pallidus internal', 'Caudate nucleus', 'Corticostriatal tract (posterior)'],
    'Lenticulostriate branches of the middle cerebral artery; the medial striate artery supplies a part.')),
  T(/^Globus pallidus external$/, f(
    'The lateral segment of the globus pallidus, between the putamen and the internal segment.',
    'Part of the indirect pathway: it receives striatal input and inhibits the subthalamic nucleus, helping to suppress unwanted movement.',
    ['Putamen', 'Globus pallidus internal', 'Subthalamic nucleus', 'Caudate nucleus'],
    'Anterior choroidal artery, with lenticulostriate branches of the middle cerebral artery.')),
  T(/^Globus pallidus internal$/, f(
    'The medial segment of the globus pallidus, next to the internal capsule.',
    'The main output of the basal ganglia: it inhibits the ventral anterior and ventral lateral thalamic nuclei. Lesions or its hyperactivity affect the amount of movement.',
    ['Globus pallidus external', 'Ventral anterior nucleus', 'Ventral lateroventral nucleus', 'Subthalamic nucleus'],
    'Anterior choroidal artery, with lenticulostriate branches of the middle cerebral artery.')),
  T(/^Nucleus accumbens$/, f(
    'The ventral part of the striatum, where the head of the caudate and the putamen join below the anterior limb of the internal capsule.',
    'The reward and motivation centre of the limbic system, receiving input from the amygdala, hippocampus and prefrontal cortex.',
    ['Caudate nucleus', 'Putamen', 'Septal nuclei', 'Basolateral complex'],
    'Medial striate artery (recurrent artery of Heubner) from the anterior cerebral artery, with lenticulostriate branches of the middle cerebral artery.')),
  T(/^Septal nuclei$/, f(
    'A group of nuclei in the septal area, below the rostrum of the corpus callosum and in front of the anterior commissure.',
    'Part of the limbic system, with reciprocal connections to the hippocampus, hypothalamus and habenula; it takes part in reward and emotion.',
    ['Septum pellucidum', 'Fornix', 'Stria medullaris thalami', 'Nucleus accumbens'],
    'Branches of the anterior cerebral artery.')),
  T(/^Corticomedial group$/, f(
    'The superomedial group of amygdala nuclei, in the dorsomedial part of the amygdala near the uncus.',
    'Receives olfactory input and projects mainly through the stria terminalis to the medial hypothalamus; it takes part in olfactory-related social and reproductive behaviour.',
    ['Stria terminalis', 'Central nucleus', 'Basolateral complex', 'Preoptic hypothalamus'],
    'Anterior choroidal artery and perforating branches of the middle cerebral artery.')),
  T(/^(Lateral nucleus|Basolateral complex)$/, f(
    'The large lateral and basal part of the amygdala, in the temporal lobe in front of the hippocampus.',
    'Receives cortical and thalamic sensory input and is central to emotional learning (for example fear conditioning); it projects to the prefrontal cortex and basal forebrain.',
    ['Central nucleus', 'Corticomedial group', 'Hippocampus', 'Mediodorsal nucleus'],
    'Anterior choroidal artery and perforating branches of the middle cerebral artery.',
    {shared: true, group: 'Shared card: Basolateral group, covering the Lateral nucleus and the Basolateral complex of the amygdala.'})),
  T(/^Central nucleus$/, f(
    'The medial part of the amygdala, deep within the amygdaloid complex.',
    'The main output of the amygdala: it drives the hypothalamus and brainstem autonomic centres to produce the autonomic and behavioural fear response.',
    ['Basolateral complex', 'Corticomedial group', 'Stria terminalis', 'Lateral hypothalamus'],
    'Anterior choroidal artery and perforating branches of the middle cerebral artery.')),

  // ---------- ventricles ----------
  T(/^Lateral ventricle$/, f(
    'A C-shaped cavity inside each cerebral hemisphere, with a frontal horn, body, atrium, occipital horn and temporal (inferior) horn.',
    'Contains cerebrospinal fluid made by the choroid plexus and drains through the interventricular foramen into the third ventricle. Blockage causes hydrocephalus.',
    ['Third ventricle', 'Choroid plexus', 'Septum pellucidum', 'Caudate nucleus'],
    'The choroid plexus of the inferior horn is supplied by the anterior choroidal artery; the plexus of the body and atrium by the posterior choroidal branches of the posterior cerebral artery.')),
  T(/^Third ventricle$/, f(
    'A narrow midline slit between the two thalami and hypothalami, linked to the lateral ventricles by the interventricular foramina.',
    'Passes cerebrospinal fluid to the cerebral aqueduct; its walls are formed by the thalamus and hypothalamus.',
    ['Lateral ventricle', 'Fourth ventricle', 'Aqueduct of midbrain', 'Choroid plexus'],
    'Tela choroidea and choroid plexus from posterior choroidal branches of the posterior cerebral artery; the walls by thalamoperforating branches of the posterior cerebral artery.')),
  T(/^Fourth ventricle$/, f(
    'A diamond-shaped cavity behind the pons and upper medulla and in front of the cerebellum; the floor is flat and rhomboid (rhomboid fossa), and the tent-shaped roof has its apex (fastigium) pointing dorsally into the cerebellum.',
    'The upper roof is the superior medullary velum between the two superior cerebellar peduncles; the lateral recesses end at the lateral apertures (foramina of Luschka), and the median aperture (foramen of Magendie) lies in the lower roof, letting cerebrospinal fluid enter the subarachnoid space. It is continuous with the cerebral aqueduct above and tapers at the obex into the central canal below.',
    ['Aqueduct of midbrain', 'Pons', 'Medulla oblongata', 'Superior cerebellar peduncle'],
    'The choroid plexus is supplied by the posterior inferior cerebellar artery (PICA).')),
  T(/^Septum pellucidum$/, f(
    'A thin midline double membrane between the two lateral ventricles, below the corpus callosum and above the fornix.',
    'Separates the frontal horns and bodies of the lateral ventricles; it also links the corpus callosum to the fornix.',
    ['Lateral ventricle', 'Corpus callosum', 'Fornix', 'Septal nuclei'],
    'Branches of the anterior cerebral artery.')),
  T(/^Choroid plexus$/, f(
    'Vascular fringes of tela choroidea in the roof or wall of the lateral, third and fourth ventricles.',
    'Produces cerebrospinal fluid and forms the blood-CSF barrier.',
    ['Lateral ventricle', 'Third ventricle', 'Fourth ventricle', 'Fornix'],
    'Anterior choroidal artery supplies the plexus of the inferior horn of the lateral ventricle; posterior choroidal branches of the posterior cerebral artery supply the third and lateral ventricle plexus; PICA supplies the fourth ventricle plexus.')),

  // ---------- meninges ----------
  T(/^Falx cerebri$/, f(
    'A sickle-shaped fold of dura mater in the longitudinal fissure between the two cerebral hemispheres.',
    'Holds the hemispheres apart and stabilises the brain; it encloses the superior and inferior sagittal sinuses and meets the tentorium at the straight sinus.',
    ['Superior sagittal sinus', 'Inferior sagittal sinus', 'Straight sinus', 'Corpus callosum'],
    'Dural meningeal arteries, mainly anterior meningeal (ethmoidal) branches in front and middle meningeal branches; the sinuses drain the veins.')),
  T(/^Tentorium cerebelli$/, f(
    'A tent-shaped fold of dura mater between the occipital lobes and the cerebellum, with a free edge around the midbrain.',
    'Supports the occipital lobes and separates the cerebrum from the cerebellum; herniation of the temporal lobe past its free edge (uncal herniation) compresses the midbrain and oculomotor nerve.',
    ['Straight sinus', 'Transverse sinus', 'Superior petrosal sinus', 'Midbrain'],
    'Dural meningeal arteries, including the tentorial branch of the internal carotid and middle meningeal branches.')),
];
