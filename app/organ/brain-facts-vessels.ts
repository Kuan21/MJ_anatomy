import type {BrainFact} from './brain-facts-types';
const f = (loc: string, fn: string, rel: string[], blood: string, extra: Partial<BrainFact> = {}): BrainFact => ({loc, fn, rel, blood, ...extra});
const T = (re: RegExp, fact: BrainFact): [RegExp, BrainFact] => [re, fact];

export const FACTS: [RegExp, BrainFact][] = [
  // ---------- arteries ----------
  T(/^Internal carotid artery$/i, f(
    'Enters the skull through the carotid canal, runs through the cavernous sinus and ends at the circle of Willis by dividing into the anterior and middle cerebral arteries.',
    'Main source of the anterior circulation. Occlusion causes ipsilateral hemispheric infarction (contralateral weakness and sensory loss, aphasia or neglect) and may cause transient loss of vision in the ipsilateral eye.',
    ['Ophthalmic artery', 'Anterior cerebral artery', 'Middle cerebral artery (M1-segment)', 'Posterior communicating artery', 'Cavernous sinus'],
    'Gives the ophthalmic artery (eye and orbit), the posterior communicating artery and the anterior choroidal artery, and ends as the anterior and middle cerebral arteries.')),
  T(/^Ophthalmic artery$/i, f(
    'Arises from the internal carotid artery just after it leaves the cavernous sinus and enters the orbit with the optic nerve through the optic canal.',
    'Supplies the eye and orbit. Occlusion of its central retinal branch causes sudden painless loss of vision in one eye.',
    ['Internal carotid artery', 'Optic nerve (II)', 'Cavernous sinus'],
    'Supplies the retina, optic nerve, orbital contents and part of the nasal cavity and forehead.')),
  T(/^Anterior cerebral artery$/i, f(
    'Terminal branch of the internal carotid artery; runs forward and up in the interhemispheric fissure, curving around the genu of the corpus callosum.',
    'Supplies the medial surface of the hemisphere. Infarction causes contralateral leg weakness and sensory loss (arm and face spared), with abulia and urinary incontinence if bilateral or if the frontal lobe is involved.',
    ['Anterior communicating artery', 'Pericallosal artery', 'Callosomarginal artery', 'Orbitofrontal branches of anterior cerebral artery', 'Corpus callosum', 'Internal carotid artery'],
    'Medial frontal and parietal cortex up to the parieto-occipital sulcus, including the paracentral lobule (lower-limb motor and sensory area); olfactory bulb and tract, septal nuclei and the medial part of the orbital surface. Its medial striate branch (recurrent artery of Heubner) supplies the anteromedial caudate head, part of the putamen and the internal capsule. With the anterior communicating artery it supplies the anterior hypothalamus (preoptic and suprachiasmatic regions).')),
  T(/^Anterior communicating artery$/i, f(
    'Short vessel joining the two anterior cerebral arteries across the midline in front of the optic chiasm.',
    'Completes the anterior part of the circle of Willis and allows cross-flow between the hemispheres. A common site of aneurysm; rupture causes subarachnoid haemorrhage and may compress the optic chiasm.',
    ['Anterior cerebral artery', 'Optic chiasm', 'Anterior hypothalamus', 'Preoptic hypothalamus'],
    'Perforating branches, together with the anterior cerebral artery, supply the anterior hypothalamus (preoptic and suprachiasmatic regions).')),
  T(/^Pericallosal artery$/i, f(
    'Continuation of the anterior cerebral artery beyond the origin of the callosomarginal artery; runs backward on the upper surface of the corpus callosum.',
    'Supplies the medial parietal region and the corpus callosum. Occlusion contributes to the anterior cerebral artery syndrome (contralateral leg weakness and sensory loss).',
    ['Anterior cerebral artery', 'Callosomarginal artery', 'Corpus callosum', 'Precuneus'],
    'Precuneus and the upper rim of the corpus callosum, together with the adjoining medial parietal cortex.')),
  T(/^Callosomarginal artery$/i, f(
    'Branch of the anterior cerebral artery that runs in the cingulate sulcus above the cingulate gyrus.',
    'Supplies the medial frontal lobe and cingulate region. Occlusion causes contralateral leg weakness and sensory loss, with apathy or akinetic mutism if the cingulate region is involved.',
    ['Anterior cerebral artery', 'Pericallosal artery', 'Frontal branches of callosomarginal artery', 'Cingulate gyrus and sulcus (Middle anterior part)', 'Paracentral gyrus and sulcus'],
    'Cingulate gyrus and the medial frontal cortex, including the paracentral lobule (lower-limb motor and sensory area).')),
  T(/^Frontal branches of callosomarginal artery$/i, f(
    'Cortical branches of the callosomarginal artery that fan out over the medial surface of the frontal lobe.',
    'Supply the medial frontal cortex; their occlusion causes contralateral leg weakness with preserved face and arm function.',
    ['Callosomarginal artery', 'Anterior cerebral artery', 'Superior frontal gyrus', 'Paracentral gyrus and sulcus'],
    'Medial frontal cortex (anterior, middle and posterior frontal branches), reaching the paracentral lobule.')),
  T(/^Orbitofrontal branches of anterior cerebral artery$/i, f(
    'Branches of the anterior cerebral artery that pass forward and downward over the orbital surface of the frontal lobe.',
    'Supply the orbitofrontal region, which is involved in olfaction, emotion and decision-making. Damage may cause disinhibition and personality change.',
    ['Anterior cerebral artery', 'Orbital gyri', 'Straight gyrus (Gyrus rectus)', 'Olfactory sulcus'],
    'Medial part of the orbital surface of the frontal lobe, with the olfactory bulb and tract.')),
  T(/^Middle cerebral artery \(M1-segment\)$/i, f(
    'Horizontal (sphenoidal) segment: the largest terminal branch of the internal carotid artery, running laterally to the limen insulae.',
    'Gives off the lenticulostriate arteries. Occlusion causes contralateral hemiparesis and sensory loss (face and arm more than leg), with aphasia on the dominant side or neglect on the non-dominant side, and gaze deviation toward the lesion.',
    ['Internal carotid artery', 'Insular branches of middle cerebral artery (M2)', 'Proximal lateral striate branches', 'Putamen', 'Insula (Subcentral gyrus and ant. and post. sulci)'],
    'Lenticulostriate branches supply the putamen, caudate nucleus and internal capsule; the trunk then divides into the branches that supply most of the lateral hemisphere.')),
  T(/^Insular branches of middle cerebral artery \(M2(-segment)?\)$/i, f(
    'Insular (M2) segment: branches of the middle cerebral artery that run over the insula within the lateral sulcus.',
    'Supply the insula and the surrounding opercula. Occlusion of the superior division gives Broca-type aphasia and face-arm weakness; occlusion of the inferior division gives Wernicke-type aphasia or neglect with visual field loss.',
    ['Middle cerebral artery (M1-segment)', 'Middle cerebral artery (M3-segment)', 'Insula (Subcentral gyrus and ant. and post. sulci)', 'Circular sulcus of insula'],
    'Insula and the adjacent frontal, parietal and temporal opercula; they continue to the lateral hemisphere surface.',
    {group: 'Insular branches of middle cerebral artery (M2) and (M2-segment): two names for the same insular segment.'})),
  T(/^Middle cerebral artery \(M3[ -]segment\)$/i, f(
    'Opercular (M3) segment: branches that leave the lateral sulcus and spread over the lateral surface of the hemisphere.',
    'Supply the lateral cortex; cortical branch occlusion gives focal deficits such as aphasia, contralateral face and arm weakness or sensory loss, or neglect, depending on the branch and side.',
    ['Insular branches of middle cerebral artery (M2)', 'Parietal branches of middle cerebral artery', 'Temporal branches of middle cerebral artery', 'Precentral gyrus', 'Angular gyrus'],
    'Most of the lateral surface of the frontal, parietal and temporal lobes, including the Broca and Wernicke areas and the superior and middle temporal gyri; the angular gyrus through the angular artery.',
    {group: 'Middle cerebral artery (M3 segment) and (M3-segment): two names for the same opercular segment.'})),
  T(/^Parietal branches of middle cerebral artery$/i, f(
    'Cortical branches of the middle cerebral artery (M3) that run over the lateral parietal convexity.',
    'Supply the lateral parietal cortex. Occlusion causes contralateral sensory loss and neglect (non-dominant side) or apraxia and language disturbance (dominant side).',
    ['Middle cerebral artery (M3-segment)', 'Postcentral gyrus', 'Supramarginal gyrus', 'Angular gyrus', 'Superior parietal lobule'],
    'Lateral parietal lobe, including the postcentral gyrus, supramarginal gyrus and, through the angular artery, the angular gyrus.')),
  T(/^Temporal branches of middle cerebral artery$/i, f(
    'Cortical branches of the middle cerebral artery (M3) that run downward over the lateral surface of the temporal lobe.',
    'Supply the lateral temporal cortex. Occlusion on the dominant side causes Wernicke-type (fluent) aphasia; it may also cause a contralateral upper quadrant field defect.',
    ['Middle cerebral artery (M3-segment)', 'Superior temporal gyrus (Lateral part)', 'Middle temporal gyrus', 'Temporal pole'],
    'Lateral temporal lobe, including the superior and middle temporal gyri and the Wernicke area.')),
  T(/^(Proximal|Distal) lateral striate branches$/i, f(
    'Small perforating (lenticulostriate) branches that arise from the M1 segment of the middle cerebral artery and pass upward through the anterior perforated substance.',
    'End arteries that supply the basal ganglia and internal capsule. Occlusion causes a lacunar stroke with contralateral weakness (pure motor hemiparesis) from internal capsule involvement.',
    ['Middle cerebral artery (M1-segment)', 'Putamen', 'Caudate nucleus', 'Globus pallidus external'],
    'Putamen, caudate nucleus and the internal capsule (lenticulostriate branches).',
    {group: 'Proximal lateral striate branches and Distal lateral striate branches: medial and lateral groups of the lenticulostriate arteries.'})),
  T(/^Posterior communicating artery$/i, f(
    'Joins the internal carotid artery to the posterior cerebral artery on each side, passing above the oculomotor nerve.',
    'Links the anterior and posterior circulations in the circle of Willis. An aneurysm at its origin can compress the oculomotor nerve (painful third nerve palsy with a dilated pupil).',
    ['Internal carotid artery', 'Posterior cerebral artery', 'Oculomotor nerve (III)', 'Mamillary body'],
    'Hypophysis, infundibulum and parts of the hypothalamus, thalamus and hippocampus.')),
  T(/^Posterior cerebral artery$/i, f(
    'Terminal branch of the basilar artery; curves around the midbrain above the tentorium to reach the occipital and inferior temporal lobes.',
    'Supplies the visual cortex and the posterior thalamus. Infarction causes contralateral homonymous hemianopia with macular sparing; thalamic involvement causes contralateral sensory loss and pain.',
    ['Basilar artery', 'Posterior communicating artery', 'Calcarine sulcus', 'Midbrain', 'Pulvinar', 'Lingual gyrus'],
    'Occipital lobe (the calcarine branch supplies the primary visual cortex), inferior and medial temporal lobe, most of the midbrain, thalamus and subthalamic nucleus. Thalamogeniculate and thalamoperforating branches supply the medial thalamus and wall of the third ventricle; posterior choroidal branches supply the tela choroidea and choroid plexus of the third ventricle, and the fornix.')),
  T(/^Basilar artery$/i, f(
    'Formed by the union of the two vertebral arteries at the pontomedullary junction; runs up the front of the pons and ends by dividing into the two posterior cerebral arteries.',
    'Main trunk of the posterior circulation. Occlusion can cause coma, quadriplegia and locked-in syndrome, and often is fatal.',
    ['Pons', 'Medial pontine branches of basilar artery', 'Lateral pontine branches of basilar artery', 'Anterior inferior cerebellar artery', 'Superior cerebellar artery', 'Posterior cerebral artery'],
    'Gives the anterior inferior cerebellar, pontine (paramedian and circumferential), labyrinthine and superior cerebellar arteries, and ends as the posterior cerebral arteries.')),
  T(/^Medial pontine branches of basilar artery$/i, f(
    'Short paramedian branches that arise from the back of the basilar artery and enter the pons near the midline.',
    'Supply the medial pons. Occlusion causes contralateral hemiparesis and loss of proprioception and vibration sense, with possible cranial nerve signs such as an abducens palsy.',
    ['Basilar artery', 'Pons', 'Corticospinal tract', 'Medial lemniscus', 'Nucleus of abducens nerve'],
    'Paramedian pontine branches supply the medial part of the pons: pontine nuclei, corticospinal and corticobulbar tracts and the medial lemniscus.')),
  T(/^Lateral pontine branches of basilar artery$/i, f(
    'Short and long circumferential branches that wrap around the pons from the basilar artery.',
    'Supply the lateral pons and tegmentum. Occlusion causes ipsilateral cranial nerve and cerebellar signs with contralateral loss of pain and temperature sensation.',
    ['Basilar artery', 'Pons', 'Middle cerebellar peduncle', 'Anterior inferior cerebellar artery'],
    'Short and long circumferential branches supply the ventrolateral pons and tegmentum, and the middle cerebellar peduncle.')),
  T(/^Anterior inferior cerebellar artery$/i, f(
    'Arises from the lower basilar artery and runs laterally to the cerebellopontine angle, near the facial and vestibulocochlear nerves.',
    'Supplies the lateral lower pons and the front of the lower cerebellum. Infarction causes ipsilateral facial weakness, hearing loss, vertigo and ataxia, with contralateral loss of pain and temperature.',
    ['Basilar artery', 'Facial nerve (VII)', 'Vestibular nerve', 'Middle cerebellar peduncle', 'Flocculus'],
    'Lateral lower pons and the anterior inferior part of the cerebellum; its labyrinthine artery (usually) supplies the cochlea and labyrinth.')),
  T(/^Posterior inferior cerebellar artery$/i, f(
    'Largest branch of the vertebral artery; loops around the lateral medulla to reach the underside of the cerebellum.',
    'Occlusion causes lateral medullary (Wallenberg) syndrome: ipsilateral facial pain and temperature loss, Horner syndrome, hoarseness, dysphagia and ataxia, with contralateral body pain and temperature loss, and vertigo.',
    ['Medulla oblongata', 'Tonsil of cerebellum', 'Fourth ventricle', 'Choroid plexus', 'Vagus nerve (X)', 'Inferior cerebellar peduncle'],
    'Lateral medulla, the inferior cerebellum and the choroid plexus of the fourth ventricle.')),
  T(/^Superior cerebellar artery$/i, f(
    'Arises from the upper basilar artery just below its end and curves around the upper pons below the oculomotor and trochlear nerves.',
    'Supplies the upper cerebellum and the cerebellar peduncles. Infarction causes ipsilateral limb ataxia, dysarthria and nausea, with contralateral loss of pain and temperature.',
    ['Basilar artery', 'Superior cerebellar peduncle', 'Pons', 'Midbrain', 'Posterior cerebral artery'],
    'Superior cerebellum, rostral pons, caudal midbrain, and the superior and middle cerebellar peduncles.')),

  // ---------- veins and sinuses ----------
  T(/^Superior sagittal sinus$/i, f(
    'Runs in the upper margin of the falx cerebri from the crista galli to the internal occipital protuberance.',
    'Collects blood and, through the arachnoid granulations, drains cerebrospinal fluid. Thrombosis causes raised intracranial pressure, headache, seizures and venous infarction.',
    ['Falx cerebri', 'Inferior sagittal sinus', 'Straight sinus', 'Transverse sinus'],
    'Drains the superior cerebral veins from the upper medial and lateral cerebral surface; empties at the confluence of sinuses into the transverse sinuses (usually mostly the right).')),
  T(/^Inferior sagittal sinus$/i, f(
    'Small sinus in the free lower edge of the falx cerebri, running above the corpus callosum.',
    'Carries blood back from the medial hemispheres to the straight sinus.',
    ['Falx cerebri', 'Straight sinus', 'Corpus callosum', 'Superior sagittal sinus'],
    'Drains the falx and the medial surfaces of the cerebral hemispheres; joins the great cerebral vein to form the straight sinus.')),
  T(/^Straight sinus$/i, f(
    'Lies along the junction of the falx cerebri and the tentorium cerebelli.',
    'Conveys deep venous blood to the confluence of sinuses. Thrombosis can cause thalamic and deep venous infarction.',
    ['Inferior sagittal sinus', 'Falx cerebri', 'Tentorium cerebelli', 'Transverse sinus', 'Superior sagittal sinus'],
    'Drains the inferior sagittal sinus and the great cerebral vein (deep cerebral structures); empties at the confluence of sinuses into the transverse sinus (usually the left).')),
  T(/^Transverse sinus$/i, f(
    'Runs laterally in the attached edge of the tentorium cerebelli, in a groove on the occipital bone, from the confluence of sinuses to the petrous temporal bone.',
    'Main outflow path from the posterior dural sinuses. Thrombosis can cause raised intracranial pressure and headache.',
    ['Superior sagittal sinus', 'Straight sinus', 'Sigmoid sinus', 'Tentorium cerebelli', 'Occipital sinus'],
    'Receives the superior sagittal, straight and occipital sinuses and the superior petrosal sinus, and drains into the sigmoid sinus.')),
  T(/^Sigmoid sinus$/i, f(
    'S-shaped continuation of the transverse sinus in a groove along the mastoid part of the temporal bone, ending at the jugular foramen.',
    'Final intracranial segment of the sinus system. Mastoid infection can lead to thrombosis of this sinus.',
    ['Transverse sinus', 'Inferior petrosal sinus', 'Superior petrosal sinus'],
    'Drains the transverse sinus and receives the superior petrosal sinus; becomes the internal jugular vein at the jugular foramen, where the inferior petrosal sinus also joins.')),
  T(/^Occipital sinus$/i, f(
    'Small sinus in the attached margin of the falx cerebelli, running to the confluence of sinuses.',
    'Minor venous channel at the back of the posterior fossa.',
    ['Transverse sinus', 'Superior sagittal sinus', 'Straight sinus'],
    'Drains the dura of the posterior fossa near the foramen magnum and empties into the confluence of sinuses.')),
  T(/^Cavernous sinus$/i, f(
    'Paired venous space on each side of the sella turcica containing the internal carotid artery and the oculomotor, trochlear, ophthalmic, maxillary and abducens nerves.',
    'Thrombosis (often from infection of the face) causes painful ophthalmoplegia, proptosis, and loss of sensation of the forehead and cheek.',
    ['Internal carotid artery', 'Abducens nerve (VI)', 'Oculomotor nerve (III)', 'Trochlear nerve (IV)', 'Ophthalmic nerve', 'Maxillary nerve', 'Superior petrosal sinus', 'Inferior petrosal sinus'],
    'Drains the ophthalmic veins, superficial middle cerebral vein and sphenoparietal sinus; empties through the superior petrosal sinus into the transverse sinus and through the inferior petrosal sinus into the internal jugular vein.')),
  T(/^(Anterior|Posterior) intercavernous sinus$/i, f(
    'Venous channels in the diaphragma sellae that join the two cavernous sinuses, one in front of and one behind the pituitary gland.',
    'Connect the right and left cavernous sinuses, forming a venous ring around the pituitary gland.',
    ['Cavernous sinus', 'Adenohypophysis', 'Neurohypophysis'],
    'Drain blood between the two cavernous sinuses, which empty into the petrosal sinuses.',
    {group: 'Anterior intercavernous sinus and Posterior intercavernous sinus: the front and back connections between the cavernous sinuses.'})),
  T(/^Superior petrosal sinus$/i, f(
    'Runs along the upper edge of the petrous temporal bone, from the cavernous sinus to the junction of the transverse and sigmoid sinuses.',
    'Provides a route for blood from the cavernous sinus to the transverse sinus.',
    ['Cavernous sinus', 'Transverse sinus', 'Sigmoid sinus', 'Tentorium cerebelli'],
    'Drains the cavernous sinus and empties into the transverse sinus at its junction with the sigmoid sinus.')),
  T(/^Inferior petrosal sinus$/i, f(
    'Runs in the groove between the petrous temporal and occipital bones from the cavernous sinus to the jugular foramen.',
    'Provides a route for blood from the cavernous sinus to the internal jugular vein; used for sampling blood from the pituitary region.',
    ['Cavernous sinus', 'Sigmoid sinus', 'Basilar venous plexus'],
    'Drains the cavernous sinus (and the labyrinthine veins) and empties into the internal jugular vein just below the jugular foramen.')),
  T(/^Basilar venous plexus$/i, f(
    'Network of venous channels on the clivus, between the layers of dura, behind the dorsum sellae.',
    'Links the cavernous and petrosal sinuses with the vertebral venous plexus, providing a connection between the intracranial and spinal venous systems.',
    ['Inferior petrosal sinus', 'Cavernous sinus', 'Pons'],
    'Drains the neighbouring dural sinuses (inferior petrosal and cavernous) and empties into the internal vertebral venous plexus through the foramen magnum.')),
];
