import type {BrainFact} from './brain-facts-types';
const f = (loc: string, fn: string, rel: string[], blood: string, extra: Partial<BrainFact> = {}): BrainFact => ({loc, fn, rel, blood, ...extra});
const T = (re: RegExp, fact: BrainFact): [RegExp, BrainFact] => [re, fact];

const V3_BLOOD = 'The nerve itself is supplied by small branches of the maxillary and inferior alveolar arteries; its territory is the lower face and lower teeth.';

export const FACTS: [RegExp, BrainFact][] = [
  // ---------------- cerebellum ----------------
  T(/^Base of peduncle$/, f(
    'The crus cerebri (base of the cerebral peduncle): the thick ventral part of each half of the midbrain, lateral to the interpeduncular fossa.',
    'Carries the descending corticospinal, corticobulbar and corticopontine fibres from the cerebral cortex to the brainstem and spinal cord. A lesion causes contralateral weakness (and, if the oculomotor fibres are involved, an ipsilateral oculomotor palsy).',
    ['Midbrain', 'Substantia nigra', 'Interpeduncular fossa', 'Corticospinal tract', 'Corticobulbar tract'],
    'Posterior cerebral artery and its perforating branches; the anterior choroidal artery also contributes to the crus cerebri.')),
  T(/^(Flocculus|Nodule of vermis|Peduncle of flocculus)$/, f(
    'Vestibulocerebellum (flocculonodular lobe): the most caudal and ventral part of the cerebellum, on its inferior surface next to the fourth ventricle.',
    'Controls balance, posture and eye movements (vestibulo-ocular reflex), using input from the vestibular nerve and nuclei and projecting back to the vestibular nuclei. A lesion causes truncal ataxia, vertigo and nystagmus.',
    ['Vestibular nuclei', 'Vestibular nerve', 'Fourth ventricle', 'Inferior cerebellar peduncle'],
    'Posterior inferior cerebellar artery for the nodule; anterior inferior cerebellar artery (with the posterior inferior cerebellar artery) for the flocculus and its peduncle.',
    {shared: true, group: 'Vestibulocerebellum (flocculonodular lobe): Flocculus, Nodule of vermis and Peduncle of flocculus.'})),
  T(/^(Lingula of cerebellum|Central lobule|Wing of central lobule|Culmen|Anterior quadrangular lobule|Declive|Folium of vermis|Tuber of vermis|Pyramis of vermis|Uvula of vermis)$/, f(
    'Spinocerebellum (vermis and intermediate zone, including most of the anterior lobe): the midline and paramedian cerebellum.',
    'Adjusts ongoing trunk and limb movement using spinal proprioceptive input, with output through the fastigial and interposed (emboliform and globose) nuclei. A lesion causes gait and truncal ataxia and incoordination of the limbs.',
    ['Superior cerebellar peduncle', 'Inferior cerebellar peduncle', 'Fourth ventricle', 'Red nucleus'],
    'Superior cerebellar artery for the superior surface (Lingula, Central lobule and Wing, Culmen, Anterior quadrangular lobule, Declive, Folium); posterior inferior cerebellar artery for the inferior surface (Tuber, Pyramis, Uvula); anterior inferior cerebellar artery for the anterior-inferior part.',
    {shared: true, group: 'Spinocerebellum: vermis parts Lingula of cerebellum, Central lobule, Wing of central lobule, Culmen, Declive, Folium of vermis, Tuber of vermis, Pyramis of vermis and Uvula of vermis, plus the Anterior quadrangular lobule of the intermediate zone.'})),
  T(/^(Posterior quadrangular lobule|Superior semilunar lobule|Inferior semilunar lobule|Gracile lobule|Biventral lobule|Tonsil of cerebellum)$/, f(
    'Cerebrocerebellum (lateral hemispheres): the large lateral parts of the posterior lobe, with the tonsil on the inferior surface beside the medulla.',
    'Takes part in motor planning and coordination of skilled movement, using input from the cerebral cortex through the pontine nuclei, with output through the dentate nucleus to the thalamus. A lesion causes ipsilateral limb ataxia, intention tremor and dysmetria.',
    ['Middle cerebellar peduncle', 'Dentatorubrothalamic tract', 'Superior cerebellar peduncle', 'Fourth ventricle'],
    'Superior cerebellar artery for the superior surface (Posterior quadrangular and Superior semilunar lobules); posterior inferior cerebellar artery for the inferior surface (Inferior semilunar, Gracile, Biventral lobules and Tonsil).',
    {shared: true, group: 'Cerebrocerebellum (lateral hemispheres): Posterior quadrangular lobule, Superior semilunar lobule, Inferior semilunar lobule, Gracile lobule, Biventral lobule and Tonsil of cerebellum.'})),
  T(/^Superior cerebellar peduncle$/, f(
    'White matter bundle connecting the cerebellum to the midbrain, running along the roof of the upper fourth ventricle.',
    'Main efferent pathway of the cerebellum: fibres from the dentate and other deep nuclei cross in the caudal midbrain towards the red nucleus and thalamus. It also carries some afferent fibres (anterior spinocerebellar tract). A lesion causes ipsilateral limb ataxia and tremor.',
    ['Dentatorubrothalamic tract', 'Red nucleus', 'Midbrain', 'Fourth ventricle'],
    'Superior cerebellar artery.')),

  // ---------------- brainstem ----------------
  T(/^Midbrain$/, f(
    'Uppermost part of the brainstem, between the pons and the diencephalon, with the cerebral aqueduct running through it.',
    'Relays and integrates visual and auditory reflexes, eye movement and motor control, and carries the descending cortical fibres in the crus cerebri. A lesion may cause oculomotor palsy, contralateral weakness or tremor.',
    ['Superior colliculus', 'Inferior colliculus', 'Red nucleus', 'Substantia nigra', 'Aqueduct of midbrain'],
    'Posterior cerebral artery supplies most of the midbrain; the superior cerebellar artery supplies the caudal midbrain.')),
  T(/^Nucleus of oculomotor nerve$/, f(
    'Midbrain tegmentum at the level of the superior colliculus, in front of the cerebral aqueduct.',
    'Motor nucleus for the extra-ocular muscles supplied by the oculomotor nerve (superior, medial and inferior recti, inferior oblique) and the levator palpebrae superioris. A lesion causes ptosis and a down-and-out eye.',
    ['Oculomotor nerve (III)', 'Accessory nucleus of oculomotor nerve', 'Superior colliculus', 'Aqueduct of midbrain'],
    'Posterior cerebral artery (paramedian branches from the basilar tip and the posterior cerebral artery).')),
  T(/^Accessory nucleus of oculomotor nerve$/, f(
    'Midbrain tegmentum, just dorsal and medial to the main oculomotor nucleus (Edinger-Westphal nucleus).',
    'Parasympathetic nucleus whose fibres run with the oculomotor nerve to the ciliary ganglion for pupillary constriction and accommodation. A lesion causes a dilated, poorly reactive pupil.',
    ['Nucleus of oculomotor nerve', 'Oculomotor nerve (III)', 'Aqueduct of midbrain'],
    'Posterior cerebral artery (paramedian branches).')),
  T(/^Red nucleus$/, f(
    'Rounded nucleus in the midbrain tegmentum at the level of the superior colliculus, lateral to the oculomotor nucleus.',
    'Receives input from the cerebellum (via the superior cerebellar peduncle) and cortex, and gives rise to the rubrospinal tract and the pathway to the inferior olive. It helps control limb flexor tone and movement.',
    ['Superior cerebellar peduncle', 'Dentatorubrothalamic tract', 'Substantia nigra', 'Midbrain'],
    'Posterior cerebral artery (paramedian and interpeduncular branches).')),
  T(/^Aqueduct of midbrain$/, f(
    'Narrow canal through the midbrain, linking the third and fourth ventricles.',
    'Conducts cerebrospinal fluid from the third to the fourth ventricle. Blockage causes obstructive hydrocephalus with enlargement of the lateral and third ventricles.',
    ['Third ventricle', 'Fourth ventricle', 'Midbrain', 'Superior colliculus'],
    'Surrounding midbrain tissue is supplied by the posterior cerebral artery and the superior cerebellar artery; there is no choroid plexus in the aqueduct.')),
  T(/^Superior colliculus$/, f(
    'Paired rounded eminence on the dorsal midbrain (tectum), rostral to the inferior colliculus.',
    'Directs rapid eye and head movements toward visual stimuli (saccades) using retinal and cortical input. A lesion in this region impairs vertical gaze.',
    ['Inferior colliculus', 'Optic tract', 'Lateral geniculate body', 'Pineal gland'],
    'Posterior cerebral artery (quadrigeminal branches) and the superior cerebellar artery.')),
  T(/^Inferior colliculus$/, f(
    'Paired eminence on the dorsal midbrain (tectum), caudal to the superior colliculus.',
    'Auditory relay: collects ascending auditory fibres from the lateral lemniscus and sends them to the medial geniculate body. It also mediates reflex orientation to sounds.',
    ['Superior colliculus', 'Medial geniculate body', 'Acoustic radiation', 'Midbrain'],
    'Superior cerebellar artery and the posterior cerebral artery (quadrigeminal branches).')),
  T(/^Interpeduncular fossa$/, f(
    'Depression on the ventral surface of the midbrain between the two cerebral peduncles, bordered below by the pons and above by the mammillary bodies.',
    'Landmark where the oculomotor nerves leave the brainstem; its floor is the posterior perforated substance, pierced by small arteries to the midbrain and thalamus.',
    ['Base of peduncle', 'Midbrain', 'Mamillary body', 'Oculomotor nerve (III)'],
    'Perforating branches of the basilar bifurcation, posterior cerebral and posterior communicating arteries.')),
  T(/^Substantia nigra$/, f(
    'Pigmented band of the midbrain between the crus cerebri and the tegmentum.',
    'Dopaminergic neurons of the pars compacta project to the striatum and facilitate movement; the pars reticulata is an output nucleus of the basal ganglia. Loss of these neurons causes Parkinson disease (rigidity, bradykinesia, rest tremor).',
    ['Base of peduncle', 'Red nucleus', 'Putamen', 'Caudate nucleus', 'Subthalamic nucleus'],
    'Posterior cerebral artery (perforating branches); the anterior choroidal and superior cerebellar arteries contribute to parts.')),
  T(/^Pons$/, f(
    'Part of the brainstem between the midbrain and the medulla, in front of the cerebellum and fourth ventricle.',
    'Relays cortical information to the cerebellum through the pontine nuclei and middle cerebellar peduncle, and carries the corticospinal, corticobulbar and sensory tracts. It also contains nuclei of cranial nerves V to VIII. Lesions cause contralateral weakness and cranial nerve palsies; large ones cause locked-in syndrome.',
    ['Middle cerebellar peduncle', 'Fourth ventricle', 'Corticospinal tract', 'Medial lemniscus', 'Nucleus of abducens nerve'],
    'Basilar artery: paramedian pontine branches supply the medial pons (pontine nuclei, corticospinal and corticobulbar tracts, medial lemniscus); short and long circumferential branches supply the ventrolateral pons and tegmentum; the anterior inferior cerebellar artery supplies the lateral lower pons.')),
  T(/^Vestibular nuclei$/, f(
    'Group of nuclei in the lateral floor of the fourth ventricle, at the pontomedullary junction.',
    'Receive vestibular nerve input about head position and movement and project to the cerebellum, spinal cord and ocular motor nuclei to control balance and eye movement. A lesion causes vertigo, nystagmus and nausea.',
    ['Vestibular nerve', 'Flocculus', 'Fourth ventricle', 'Inferior cerebellar peduncle'],
    'Posterior inferior cerebellar artery (medulla) and anterior inferior cerebellar artery (pons), with the labyrinthine artery supplying the end organ.')),
  T(/^Nucleus of abducens nerve$/, f(
    'Lower pontine tegmentum, in the floor of the fourth ventricle beneath the facial colliculus.',
    'Motor nucleus for the lateral rectus through the abducens nerve, and the centre for horizontal conjugate gaze. A lesion causes inability to abduct the eye or a horizontal gaze palsy.',
    ['Abducens nerve (VI)', 'Motor nucleus of facial nerve', 'Fourth ventricle', 'Pons'],
    'Paramedian pontine branches of the basilar artery and the anterior inferior cerebellar artery.')),
  T(/^Motor nucleus of facial nerve$/, f(
    'Ventrolateral tegmentum of the lower pons.',
    'Gives the branchial motor fibres of the facial nerve to the muscles of facial expression, stapedius and posterior belly of digastric. A lesion causes ipsilateral weakness of the whole face.',
    ['Facial nerve (VII)', 'Superior salivatory nucleus', 'Nucleus of abducens nerve', 'Pons'],
    'Anterior inferior cerebellar artery and circumferential branches of the basilar artery.')),
  T(/^Superior salivatory nucleus$/, f(
    'Pontine tegmentum near the facial motor nucleus.',
    'Parasympathetic nucleus of the facial nerve: its fibres supply the lacrimal gland and the submandibular and sublingual glands.',
    ['Facial nerve (VII)', 'Motor nucleus of facial nerve', 'Pons'],
    'Anterior inferior cerebellar artery and circumferential branches of the basilar artery.')),
  T(/^Medulla oblongata$/, f(
    'Lowest part of the brainstem, continuous with the spinal cord below and the pons above.',
    'Contains centres for breathing, heart rate and blood pressure, the nuclei of cranial nerves IX to XII, and the pathways crossing between the brain and spinal cord (pyramidal and medial lemniscal decussations). Lesions cause bulbar signs and cardiorespiratory failure.',
    ['Pyramid of medulla oblongata', 'Olive', 'Fourth ventricle', 'Medial lemniscus', 'Hypoglossal nerve (XII)'],
    'Anterior spinal artery supplies the medial medulla (pyramid, medial lemniscus, medial longitudinal fasciculus, hypoglossal nucleus, inferior olivary nucleus); the posterior inferior cerebellar artery supplies the lateral medulla.')),
  T(/^Pyramid of medulla oblongata$/, f(
    'Paired ridge on the ventral medulla beside the midline.',
    'Carries the corticospinal tract, most of whose fibres cross in the pyramidal decussation at the lower end. A medial medullary lesion causes contralateral hemiparesis sparing the face.',
    ['Corticospinal tract', 'Olive', 'Medulla oblongata', 'Hypoglossal nerve (XII)'],
    'Anterior spinal artery (medial medulla).')),
  T(/^Olive$/, f(
    'Oval prominence on the lateral surface of the upper medulla, lateral to the pyramid, containing the inferior olivary nucleus.',
    'The inferior olivary nucleus sends climbing fibres to the contralateral cerebellum through the inferior cerebellar peduncle and is important for motor learning and timing.',
    ['Pyramid of medulla oblongata', 'Inferior cerebellar peduncle', 'Medulla oblongata', 'Hypoglossal nerve (XII)'],
    'Inferior olivary nucleus is supplied by the anterior spinal artery (medial medulla); the lateral surface is supplied by the posterior inferior cerebellar artery.')),

  // ---------------- cranial nerves ----------------
  T(/^Olfactory nerve \(I\)$/, f(
    'Fine nerve fibres passing from the olfactory epithelium of the nasal roof through the cribriform plate to the olfactory bulb.',
    'Special sensory nerve of smell. Injury, for example a fracture of the cribriform plate, causes loss of smell (anosmia).',
    ['Septal nuclei', 'Anterior cerebral artery'],
    'Small branches of the anterior and posterior ethmoidal arteries (nasal mucosa); the olfactory bulb and tract are supplied by the anterior cerebral artery.')),
  T(/^Optic nerve \(II\)$/, f(
    'Runs from the retina through the optic canal to the optic chiasm.',
    'Special sensory nerve of vision, carrying retinal ganglion cell axons. A lesion causes ipsilateral blindness and loss of the direct pupillary light response.',
    ['Optic chiasm', 'Optic tract', 'Lateral geniculate body', 'Ophthalmic artery'],
    'Central retinal artery (a branch of the ophthalmic artery) and pial branches of the ophthalmic artery; the intracranial part also receives branches of the internal carotid artery.')),
  T(/^Oculomotor nerve \(III\)$/, f(
    'Leaves the midbrain at the interpeduncular fossa and passes through the cavernous sinus and superior orbital fissure to the orbit.',
    'Moves the eye through four extra-ocular muscles, lifts the upper eyelid, and gives parasympathetic fibres for pupillary constriction and accommodation. A lesion causes ptosis, a down-and-out eye and a dilated pupil.',
    ['Nucleus of oculomotor nerve', 'Accessory nucleus of oculomotor nerve', 'Interpeduncular fossa', 'Posterior communicating artery'],
    'Branches of the posterior cerebral and superior cerebellar arteries at the brainstem; the orbital part is supplied by branches of the ophthalmic artery.')),
  T(/^Trochlear nerve \(IV\)$/, f(
    'Leaves the dorsal midbrain below the inferior colliculus, winds round the brainstem and enters the orbit through the superior orbital fissure.',
    'Motor nerve to the superior oblique muscle (depresses and intorts the adducted eye). A lesion causes vertical double vision and a head tilt.',
    ['Inferior colliculus', 'Midbrain', 'Oculomotor nerve (III)'],
    'Branches of the superior cerebellar artery and the posterior cerebral artery; the orbital part is supplied by branches of the ophthalmic artery.')),
  T(/^Trigeminal nerve \(V\)$/, f(
    'Largest cranial nerve; attaches to the lateral pons and divides into ophthalmic (V1), maxillary (V2) and mandibular (V3) divisions.',
    'Carries sensation from the face, mouth, teeth, nasal cavity and meninges, and motor fibres to the muscles of mastication. A lesion causes facial numbness and weak chewing, with the jaw deviating toward the affected side.',
    ['Sensory root of trigeminal nerve', 'Motor root of trigeminal nerve', 'Ophthalmic nerve', 'Maxillary nerve', 'Pons'],
    'Branches of the superior cerebellar and anterior inferior cerebellar arteries at the root; each division is supplied by branches of the arteries in its territory.')),
  T(/^Sensory root of trigeminal nerve$/, f(
    'Large root entering the lateral pons, going to the trigeminal ganglion in Meckel cave.',
    'Carries touch, pain and temperature sensation of the face, mouth and meninges to the trigeminal sensory nuclei. A lesion causes ipsilateral facial numbness.',
    ['Trigeminal nerve (V)', 'Motor root of trigeminal nerve', 'Pons', 'Ophthalmic nerve'],
    'Superior cerebellar artery and branches of the anterior inferior cerebellar artery.')),
  T(/^Motor root of trigeminal nerve$/, f(
    'Small root beside the sensory root at the lateral pons that passes under the trigeminal ganglion into the mandibular nerve.',
    'Supplies the muscles of mastication (temporalis, masseter, medial and lateral pterygoids), mylohyoid, anterior belly of digastric, tensor tympani and tensor veli palatini. A lesion weakens chewing.',
    ['Trigeminal nerve (V)', 'Sensory root of trigeminal nerve', 'Pons', 'Anterior division of mandibular nerve'],
    'Superior cerebellar artery and branches of the anterior inferior cerebellar artery.')),
  T(/^Ophthalmic nerve$/, f(
    'Trigeminal nerve division V1, passing through the superior orbital fissure.',
    'Purely sensory: forehead, upper eyelid, cornea and dorsum of the nose. A lesion causes numbness and loss of the corneal reflex.',
    ['Trigeminal nerve (V)', 'Sensory root of trigeminal nerve', 'Ophthalmic artery'],
    'Branches of the ophthalmic artery (supraorbital, supratrochlear and lacrimal arteries) accompany its branches.')),
  T(/^(Maxillary nerve|Meningeal branch of maxillary nerve)$/, f(
    'Trigeminal nerve division V2, passing through the foramen rotundum into the pterygopalatine fossa; its meningeal branch (V2) supplies the dura of the middle cranial fossa.',
    'Purely sensory: mid-face and cheek, upper lip, upper teeth, palate and nasal cavity. A lesion causes numbness of the cheek and upper teeth.',
    ['Trigeminal nerve (V)', 'Ophthalmic nerve', 'Sensory root of trigeminal nerve'],
    'Maxillary artery branches (infra-orbital and sphenopalatine arteries) accompany the nerve; the meningeal branch is accompanied by the middle meningeal artery.',
    {shared: true, group: 'Maxillary nerve (V2) and its Meningeal branch of maxillary nerve.'})),
  T(/^(Anterior division of mandibular nerve|Posterior division of mandibular nerve|Buccal nerve|Inferior alveolar nerve|Lingual nerve|Mental nerve)$/, f(
    'Trigeminal nerve division V3 (mandibular), leaving the skull through the foramen ovale and dividing into anterior and posterior divisions below it.',
    'Mixed nerve. Sensory to the lower face, lower teeth and the general sensation of the anterior two thirds of the tongue; motor to the muscles of mastication. The buccal nerve is mostly sensory (cheek skin and mucosa), while the motor branches arise mainly from the anterior division. A lesion causes lower-face numbness and weak chewing.',
    ['Trigeminal nerve (V)', 'Motor root of trigeminal nerve', 'Maxillary nerve', 'Ophthalmic nerve'],
    V3_BLOOD,
    {shared: true, group: 'Mandibular nerve (V3): Anterior division of mandibular nerve, Posterior division of mandibular nerve, Buccal nerve, Inferior alveolar nerve, Lingual nerve and Mental nerve.'})),
  T(/^Abducens nerve \(VI\)$/, f(
    'Leaves the brainstem at the pontomedullary junction, runs through the cavernous sinus and enters the orbit through the superior orbital fissure.',
    'Motor nerve to the lateral rectus (abduction of the eye). A lesion causes horizontal double vision and an eye that cannot look outward.',
    ['Nucleus of abducens nerve', 'Pons', 'Oculomotor nerve (III)', 'Trochlear nerve (IV)'],
    'Branches of the anterior inferior cerebellar artery and the basilar artery; the orbital part is supplied by branches of the ophthalmic artery.')),
  T(/^Facial nerve \(VII\)$/, f(
    'Leaves the pontomedullary junction, enters the internal acoustic meatus and runs through the facial canal to the stylomastoid foramen.',
    'Motor to the muscles of facial expression and stapedius; taste from the anterior two thirds of the tongue; parasympathetic to the lacrimal, submandibular and sublingual glands. A lesion causes ipsilateral facial weakness.',
    ['Motor nucleus of facial nerve', 'Superior salivatory nucleus', 'Vestibular nerve', 'Pons'],
    'Anterior inferior cerebellar artery (labyrinthine artery) intracranially; the petrosal branch of the middle meningeal artery and the stylomastoid artery in the facial canal.')),
  T(/^Vestibular nerve$/, f(
    'Part of the vestibulocochlear nerve (VIII) from the semicircular canals, utricle and saccule, running through the internal acoustic meatus to the vestibular nuclei at the pontomedullary junction.',
    'Carries information about head position and movement to the vestibular nuclei and cerebellum. A lesion causes vertigo, nystagmus and imbalance.',
    ['Vestibular nuclei', 'Facial nerve (VII)', 'Flocculus', 'Anterior inferior cerebellar artery'],
    'Labyrinthine artery, mostly from the anterior inferior cerebellar artery.')),
  T(/^Vagus nerve \(X\)$/, f(
    'Leaves the lateral medulla, exits the skull through the jugular foramen and descends in the neck to the thorax and abdomen.',
    'Mixed nerve: motor to the pharynx and larynx, parasympathetic to the thoracic and abdominal viscera, and sensory from the ear, pharynx and viscera. A lesion causes hoarseness, dysphagia and palatal deviation.',
    ['Accessory nerve (XI)', 'Medulla oblongata', 'Hypoglossal nerve (XII)'],
    'Posterior inferior cerebellar artery near the brainstem; in the neck by small branches of nearby arteries such as the inferior thyroid and ascending pharyngeal arteries.')),
  T(/^Accessory nerve \(XI\)$/, f(
    'Cranial root arises from the medulla and spinal root ascends through the foramen magnum; both leave through the jugular foramen.',
    'Motor to the sternocleidomastoid and trapezius. A lesion causes weak head rotation to the opposite side and a drooping shoulder.',
    ['Vagus nerve (X)', 'Medulla oblongata', 'Hypoglossal nerve (XII)'],
    'Branches of the posterior inferior cerebellar and vertebral arteries intracranially; in the neck by the occipital and transverse cervical arteries.')),
  T(/^Hypoglossal nerve \(XII\)$/, f(
    'Leaves the medulla between the pyramid and the olive and exits through the hypoglossal canal.',
    'Motor to the muscles of the tongue. A lesion makes the tongue deviate toward the side of the lesion on protrusion.',
    ['Pyramid of medulla oblongata', 'Olive', 'Medulla oblongata', 'Vagus nerve (X)'],
    'Anterior spinal artery at its medullary origin; in the neck by branches of the ascending pharyngeal and lingual arteries.')),
];
