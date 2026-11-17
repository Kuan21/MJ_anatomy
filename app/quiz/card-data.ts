export type CardExtra = Record<string, {zh: string; en?: string}>;
const e = (zh: string, en: string) => ({zh, en});

/**
 * Hand-checked card entries for structures the repository's profile data does not describe. Keyed by lower-case English name without
 * left/right. Only standard, well-established anatomy is written here; a field we are not sure of is left out and shows up in
 * docs/quiz-card-gaps.md instead of being guessed.
 */
export const CARD_EXTRAS: Record<string, CardExtra> = {
  'suboccipital nerve': {
    來源: e('第一頸神經（C1）後支', 'Dorsal ramus of C1'),
    走向: e('在枕骨與寰椎後弓之間、椎動脈上方穿出，進入枕下三角（示意模型）', 'Emerges between the occipital bone and the posterior arch of the atlas, above the vertebral artery, into the suboccipital triangle (schematic model)'),
    支配範圍: e('運動支配枕下肌群與頭半棘肌', 'Motor to the suboccipital muscles and semispinalis capitis'),
  },
  'greater occipital nerve': {
    來源: e('第二頸神經（C2）後支內側支', 'Medial branch of the dorsal ramus of C2'),
    走向: e('自頭下斜肌下緣穿出，穿過頭半棘肌與斜方肌後沿頭皮上行（示意模型）', 'Emerges below obliquus capitis inferior, pierces semispinalis capitis and trapezius and ascends the scalp (schematic model)'),
    支配範圍: e('後頭皮至頭頂的感覺', 'Sensation of the posterior scalp up to the vertex'),
  },
  'third occipital nerve': {
    來源: e('第三頸神經（C3）後支內側支', 'Medial branch of the dorsal ramus of C3'),
    走向: e('越過 C2–C3 關節突關節，向內側穿過頭半棘肌與斜方肌近正中線處（示意模型）', 'Crosses the C2–C3 zygapophyseal joint and pierces semispinalis capitis and trapezius near the midline (schematic model)'),
    支配範圍: e('枕下正中皮膚與 C2–C3 關節突關節的感覺', 'Sensation of the suboccipital midline skin and the C2–C3 zygapophyseal joint'),
  },
  'lesser occipital nerve': {
    來源: e('第二、三頸神經（C2–C3）前支，頸神經叢', 'Ventral rami of C2–C3 (cervical plexus)'),
    走向: e('自胸鎖乳突肌後緣的 Erb 點穿出，沿後緣上行至耳後頭皮（示意模型）', 'Emerges at Erb point on the posterior border of sternocleidomastoid and ascends to the scalp behind the ear (schematic model)'),
    支配範圍: e('耳後頭皮與耳廓內側上部的感覺', 'Sensation of the scalp behind the ear and the upper medial auricle'),
  },
  'great auricular nerve': {
    來源: e('第二、三頸神經（C2–C3）前支，頸神經叢', 'Ventral rami of C2–C3 (cervical plexus)'),
    走向: e('自 Erb 點穿出，斜向上越過胸鎖乳突肌淺面，往下頜角與腮腺方向行（示意模型）', 'Emerges at Erb point and crosses sternocleidomastoid obliquely upward toward the angle of the mandible and the parotid gland (schematic model)'),
    支配範圍: e('腮腺區皮膚、下頜角與耳廓的感覺', 'Sensation of the skin over the parotid, the angle of the mandible and the auricle'),
  },
  'suboccipital venous plexus': {
    來源: e('枕下三角內環繞椎動脈的靜脈網（示意模型）', 'Venous network around the vertebral artery in the suboccipital triangle (schematic model)'),
    引流範圍: e('枕下深層肌與上頸椎區，注入椎靜脈與枕靜脈', 'Deep suboccipital muscles and the upper cervical region, draining into the vertebral and occipital veins'),
  },
  'multifidus': {
    起點: e('薦骨後面、髂後上棘、腰椎乳突、胸椎橫突、第四至第七頸椎關節突', 'Posterior sacrum, posterior superior iliac spine, mammillary processes of lumbar vertebrae, transverse processes of thoracic vertebrae, articular processes of C4–C7'),
    止點: e('向上跨越二至四個椎節，止於上位椎骨的棘突', 'Spinous processes of the vertebrae two to four levels above'),
    作用: e('伸展並穩定脊柱，使脊柱向對側旋轉', 'Extends and stabilizes the vertebral column; rotates it to the opposite side'),
    神經支配: e('相應脊神經後支', 'Dorsal rami of the corresponding spinal nerves'),
  },
  'accessory nerve (xi)': {
    來源: e('第十一對腦神經：延髓根與脊髓根（C1–C5）', 'Cranial nerve XI: cranial root from the medulla and spinal root from C1–C5'),
    走向: e('脊髓根經枕骨大孔入顱，與延髓根會合後由頸靜脈孔出顱；下行至胸鎖乳突肌深面，穿過該肌，橫越頸後三角至斜方肌深面', 'Spinal root enters the skull through the foramen magnum, joins the cranial root and leaves through the jugular foramen; descends deep to sternocleidomastoid, pierces it and crosses the posterior triangle to the deep surface of trapezius'),
    主要分支: e('內支（延髓根，併入迷走神經）、外支（脊髓根）', 'Internal branch (cranial root, joins the vagus nerve) and external branch (spinal root)'),
    支配範圍: e('外支運動支配胸鎖乳突肌與斜方肌', 'External branch supplies sternocleidomastoid and trapezius (motor)'),
  },
  'dorsal scapular nerve': {
    主要分支: e('肌支至大、小菱形肌，並分支至提肩胛肌', 'Muscular branches to rhomboid major and minor, with a branch to levator scapulae'),
  },
  'thoracodorsal nerve': {
    主要分支: e('肌支進入闊背肌', 'Muscular branches entering latissimus dorsi'),
  },
  'vertebral artery': {
    來源: e('鎖骨下動脈第一段', 'First part of the subclavian artery'),
    走向: e('向上穿過第六至第一頸椎的橫突孔，繞過寰椎後弓上方，經枕骨大孔入顱，於橋延溝處與對側會合成基底動脈', 'Ascends through the transverse foramina of C6–C1, curves over the posterior arch of the atlas, enters the skull through the foramen magnum and joins its fellow to form the basilar artery at the pontomedullary junction'),
    主要分支: e('前脊髓動脈、脊髓後動脈、後下小腦動脈、腦膜支與肌支', 'Anterior and posterior spinal arteries, posterior inferior cerebellar artery, meningeal and muscular branches'),
    供應範圍: e('腦幹、小腦、頸部脊髓；經基底動脈供應腦的後部', 'Brainstem, cerebellum and cervical spinal cord; the posterior brain through the basilar artery'),
  },
  'subcostal artery': {
    來源: e('降主動脈（胸主動脈）最下一對壁支', 'Lowest pair of parietal branches of the descending (thoracic) aorta'),
    走向: e('沿第十二肋骨下緣向外側走行，進入腹壁', 'Runs along the lower border of the twelfth rib into the abdominal wall'),
    供應範圍: e('第十二肋下方的腹壁與背部肌肉', 'Abdominal wall and back muscles below the twelfth rib'),
  },
  'costocervical trunk': {
    來源: e('鎖骨下動脈', 'Subclavian artery'),
    走向: e('向後上方越過胸膜頂，分為最上肋間動脈與深頸動脈', 'Passes backward over the cervical pleura and divides into the supreme intercostal and deep cervical arteries'),
    主要分支: e('最上肋間動脈、深頸動脈', 'Supreme intercostal artery and deep cervical artery'),
    供應範圍: e('第一、第二肋間隙與頸後深層肌', 'First and second intercostal spaces and the deep posterior neck muscles'),
  },
  'deep cervical artery': {
    來源: e('肋頸動脈幹', 'Costocervical trunk'),
    走向: e('向後越過第七頸椎橫突，在頭半棘肌與頸半棘肌之間上行', 'Passes backward over the transverse process of C7 and ascends between semispinalis capitis and semispinalis cervicis'),
    主要分支: e('肌支；與枕動脈降支吻合', 'Muscular branches; anastomoses with the descending branch of the occipital artery'),
    供應範圍: e('頸後深層肌', 'Deep posterior neck muscles'),
  },
  'dorsal scapular artery': {
    來源: e('有變異：起自鎖骨下動脈第三段（有時為第二段），或起自橫頸動脈深支', 'Variable: the third part of the subclavian artery (sometimes the second part), or the deep branch of the transverse cervical artery'),
    走向: e('沿肩胛骨內側緣、菱形肌深面下行', 'Descends along the medial border of the scapula deep to the rhomboids'),
    供應範圍: e('菱形肌、提肩胛肌；與肩胛上動脈、旋肩胛動脈吻合', 'Rhomboids and levator scapulae; anastomoses with the suprascapular and circumflex scapular arteries'),
  },
  'thoracodorsal artery': {
    來源: e('肩胛下動脈', 'Subscapular artery'),
    走向: e('與胸背神經伴行，沿闊背肌前緣下行', 'Descends with the thoracodorsal nerve along the anterior border of latissimus dorsi'),
    主要分支: e('肌支，並分支至前鋸肌', 'Muscular branches, with branches to serratus anterior'),
    供應範圍: e('闊背肌、前鋸肌與鄰近胸壁', 'Latissimus dorsi, serratus anterior and the adjacent chest wall'),
  },
  'superficial cervical artery': {
    來源: e('甲狀頸動脈幹', 'Thyrocervical trunk'),
    走向: e('橫越頸後三角，行至斜方肌深面', 'Crosses the posterior triangle of the neck to the deep surface of trapezius'),
    供應範圍: e('斜方肌', 'Trapezius'),
  },
  'transverse cervical artery': {
    來源: e('甲狀頸動脈幹', 'Thyrocervical trunk'),
    走向: e('橫越頸後三角，經臂神經叢前方行至斜方肌深面', 'Crosses the posterior triangle in front of the brachial plexus to the deep surface of trapezius'),
    主要分支: e('淺支（至斜方肌）與深支（可延續為肩胛背動脈）', 'Superficial branch (to trapezius) and deep branch (which may continue as the dorsal scapular artery)'),
    供應範圍: e('斜方肌、菱形肌與提肩胛肌', 'Trapezius, rhomboids and levator scapulae'),
  },
  'subcostal vein': {
    走向: e('沿第十二肋骨下緣前行，右側注入奇靜脈，左側注入半奇靜脈', 'Runs along the lower border of the twelfth rib; the right drains into the azygos vein and the left into the hemiazygos vein'),
    引流範圍: e('第十二肋下方的腹壁與背部', 'Abdominal wall and back below the twelfth rib'),
  },
  'thoracodorsal vein': {
    來源: e('闊背肌與鄰近胸壁的靜脈', 'Veins of latissimus dorsi and the adjacent chest wall'),
    走向: e('與胸背動脈伴行，注入肩胛下靜脈，再入腋靜脈', 'Accompanies the thoracodorsal artery and drains into the subscapular vein, then the axillary vein'),
    引流範圍: e('闊背肌與前鋸肌', 'Latissimus dorsi and serratus anterior'),
  },
  'ascending lumbar vein': {
    來源: e('腰靜脈、髂腰靜脈與外側薦靜脈之間的縱向連接', 'Longitudinal connection between the lumbar, iliolumbar and lateral sacral veins'),
    走向: e('沿腰椎橫突前方、腰大肌深面上行；右側續為奇靜脈，左側續為半奇靜脈', 'Ascends in front of the lumbar transverse processes deep to psoas major; continues as the azygos vein on the right and the hemiazygos vein on the left'),
    引流範圍: e('腰部脊柱與腹後壁', 'Lumbar spine and posterior abdominal wall'),
  },
  'scapula': {
    相關關節: e('肩鎖關節、盂肱關節（肩關節）', 'Acromioclavicular joint and glenohumeral (shoulder) joint'),
  },
  'occipital bone': {
    主要標誌: e('枕骨大孔、枕髁、枕外隆凸、上項線與下項線', 'Foramen magnum, occipital condyles, external occipital protuberance, superior and inferior nuchal lines'),
    相關關節: e('寰枕關節（枕髁與寰椎）；人字縫（與頂骨）', 'Atlanto-occipital joint (condyles with the atlas); lambdoid suture (with the parietal bones)'),
  },
  'sacrum': {
    主要標誌: e('薦岬、薦前孔與薦後孔、薦正中嵴、薦管、薦角、耳狀面', 'Sacral promontory, anterior and posterior sacral foramina, median sacral crest, sacral canal, sacral cornua, auricular surface'),
    相關關節: e('薦髂關節、腰薦關節（第五腰椎與薦骨）、薦尾關節', 'Sacroiliac joint, lumbosacral joint (L5–S1) and sacrococcygeal joint'),
  },
  'atlas': {
    主要標誌: e('無椎體與棘突；前弓與後弓、側塊、齒突凹、橫突孔', 'No vertebral body or spinous process; anterior and posterior arches, lateral masses, facet for the dens, transverse foramina'),
    相關關節: e('寰枕關節（與枕骨）、寰軸關節（與樞椎）', 'Atlanto-occipital joint (with the occipital bone) and atlanto-axial joints (with the axis)'),
  },
  'axis': {
    主要標誌: e('齒突、大而分叉的棘突、上關節面、橫突孔', 'Dens (odontoid process), large bifid spinous process, superior articular facets, transverse foramina'),
    相關關節: e('寰軸關節（正中與外側）、與第三頸椎之間的椎間盤與關節突關節', 'Median and lateral atlanto-axial joints; intervertebral disc and facet joints with C3'),
  },
};


// Head and neck cards, batches B02 and B03: cranial nerves of the orbit, nose and ear, a few more nerves, and the head-and-neck ligaments and fascia.
// Standard anatomy in our own words. Ligaments and fascia carry the two fields 附著 and 作用, which the head-and-neck organ card shows in the order written.
Object.assign(CARD_EXTRAS, {
  'lingual nerve': {
    來源: e('下頜神經（V3）後股的分支，在顳下窩內發出', 'A branch of the posterior division of the mandibular nerve (V3), given off in the infratemporal fossa'),
    走向: e('在外翼肌深面下行，位置在下齒槽神經的前方；沿內翼肌與下頜支之間向前下，途中自後方接上鼓索神經；再貼近下頜第三大臼齒內側的骨面進入口腔底，在舌骨舌肌表面前行，從頜下腺管的下方由外側繞到內側，分支入舌前部', 'Descends deep to lateral pterygoid, in front of the inferior alveolar nerve; runs between medial pterygoid and the mandibular ramus, is joined from behind by the chorda tympani, passes close to the bone medial to the third lower molar into the floor of the mouth, runs forward on hyoglossus and crosses from lateral to medial beneath the submandibular duct before breaking up in the front of the tongue'),
    支配範圍: e('舌前三分之二（界溝以前）的一般感覺（觸、壓、冷熱、痛）、口腔底與舌側牙齦的黏膜感覺；加入的鼓索神經另帶來舌前三分之二的味覺，以及到下頜下神經節的副交感節前纖維，再由節後纖維支配頜下腺與舌下腺；本身沒有運動纖維', 'General sensation (touch, pressure, temperature, pain) of the front two-thirds of the tongue, and of the mucosa of the floor of the mouth and the lingual gingiva; the joined chorda tympani adds taste from the front two-thirds and preganglionic parasympathetic fibres to the submandibular ganglion, whose postganglionic fibres supply the submandibular and sublingual glands; it has no motor fibres of its own'),
  },
  'meningeal branch of maxillary nerve': {
    來源: e('上頜神經（V2）在進入圓孔之前、仍在中顱窩時發出的細小感覺支', 'A small sensory branch of the maxillary nerve (V2), given off in the middle cranial fossa before the nerve enters the foramen rotundum'),
    走向: e('是上頜神經中唯一在圓孔之前就分出的分支，向後外方進入中顱窩的硬腦膜，與腦膜中動脈同行', 'The only branch of the maxillary nerve that leaves it before the foramen rotundum; it turns into the dura mater of the middle cranial fossa and accompanies the middle meningeal artery'),
    支配範圍: e('中顱窩的硬腦膜（以前部為主）的一般感覺；純感覺', 'General sensation of the dura mater of the middle cranial fossa, mainly its front part; purely sensory'),
  },
  'lacrimal nerve': {
    來源: e('眼神經（V1）三條分支中最外側、最細的一條，在眶上裂附近分出', 'The most lateral and smallest of the three branches of the ophthalmic nerve (V1), arising near the superior orbital fissure'),
    走向: e('經眶上裂、在總腱環之外進入眼眶，沿外直肌上緣向前外行到淚腺；途中接受顴神經（V2）的交通支', 'Enters the orbit via the superior orbital fissure, lying outside the common tendinous ring, and runs forward along the upper border of lateral rectus to the lacrimal gland; on the way it receives a communicating branch from the zygomatic nerve (V2)'),
    支配範圍: e('淚腺、鄰近結膜與上眼瞼外側皮膚的一般感覺；顴神經交通支帶來翼顎神經節的副交感節後纖維，經它到達淚腺，促進淚液分泌', 'General sensation of the lacrimal gland, the adjacent conjunctiva and the skin of the lateral upper eyelid; the communicating branch from the zygomatic nerve carries postganglionic parasympathetic fibres from the pterygopalatine ganglion that stimulate tear secretion'),
  },
  'abducens nerve (vi)': {
    來源: e('第六對腦神經，由腦橋的外旋神經核發出，在腦橋與延腦之間的橋延溝出腦', 'Cranial nerve VI, arising from the abducens nucleus of the pons and leaving the brainstem at the pontomedullary groove'),
    走向: e('向前上方行，斜行爬過顳骨岩部尖端上緣進入海綿竇，在竇腔內緊貼頸內動脈外側前行；再經眶上裂、在總腱環之內入眼眶，從內側面進入外直肌', 'Runs forward and upward, over the apex of the petrous temporal bone into the cavernous sinus, where it lies lateral to the internal carotid artery within the sinus; it then enters the orbit through the superior orbital fissure inside the common tendinous ring and reaches the medial surface of lateral rectus'),
    支配範圍: e('運動支配外直肌，使眼球外展；受損時眼球無法外展，向內偏斜並出現複視', 'Motor to lateral rectus only, which abducts the eyeball; a lesion leaves the eye turned inward and causes double vision'),
  },
  'oculomotor nerve (iii)': {
    來源: e('第三對腦神經，起自中腦的動眼神經核（運動）與動眼神經副核（副交感），由腳間窩出腦', 'Cranial nerve III, arising from the oculomotor nucleus (motor) and the accessory (parasympathetic) nucleus of the midbrain and leaving at the interpeduncular fossa'),
    走向: e('穿過後大腦動脈與上小腦動脈之間向前，進入海綿竇外側壁最上方，經眶上裂、在總腱環之內入眼眶，隨即分成上支與下支', 'Passes between the posterior cerebral and superior cerebellar arteries, enters the uppermost part of the lateral wall of the cavernous sinus, then enters the orbit through the superior orbital fissure inside the common tendinous ring and divides into a superior and an inferior branch'),
    支配範圍: e('運動支配提上眼瞼肌、上直肌、內直肌、下直肌與下斜肌（上斜肌由滑車神經、外直肌由外旋神經支配）；副交感節前纖維經下支到睫狀神經節，控制睫狀肌（調焦）與瞳孔括約肌（縮瞳）', 'Motor to levator palpebrae superioris, superior, medial and inferior recti and inferior oblique (superior oblique is supplied by the trochlear nerve and lateral rectus by the abducens); parasympathetic preganglionic fibres go through the inferior branch to the ciliary ganglion for the ciliary muscle (accommodation) and sphincter pupillae (constriction)'),
  },
  'trochlear nerve (iv)': {
    來源: e('第四對腦神經，起自中腦的滑車神經核，纖維在腦幹內交叉後，自中腦背側（下丘下方）出腦；是唯一從腦幹背面出腦的腦神經', 'Cranial nerve IV, arising from the trochlear nucleus of the midbrain; its fibres cross within the brainstem and leave on the dorsal surface below the inferior colliculus, the only cranial nerve to emerge dorsally'),
    走向: e('繞過大腦腳外側向前，進入海綿竇外側壁（位在動眼神經下方），經眶上裂、在總腱環之外入眼眶，越過提上眼瞼肌上方向內行，到上斜肌；顱內行程在腦神經中最長', 'Winds around the cerebral peduncle, enters the lateral wall of the cavernous sinus below the oculomotor nerve, passes via the superior orbital fissure, lying outside the common tendinous ring, crosses above levator palpebrae superioris and reaches superior oblique; it has the longest intracranial course of the cranial nerves'),
    支配範圍: e('只運動支配上斜肌（使眼球下壓、外展與內旋）', 'Motor to superior oblique only (depression, abduction and intorsion of the eyeball)'),
  },
  'olfactory nerve (i)': {
    來源: e('第一對腦神經，由鼻腔頂部嗅上皮（上鼻甲與相對的鼻中隔上部）內嗅覺感受細胞的中樞突聚成', 'Cranial nerve I, formed by the central processes of the olfactory receptor cells in the olfactory epithelium of the roof of the nasal cavity (superior concha and the opposite upper septum)'),
    走向: e('約二十束細小的嗅絲向上穿過篩骨篩板的小孔進入前顱窩，止於嗅球；訊號再經嗅徑傳到大腦底部的嗅覺相關區', 'About twenty fine filaments pass up through the foramina of the cribriform plate of the ethmoid into the anterior cranial fossa and end in the olfactory bulb; the signal continues by the olfactory tract to olfactory areas at the base of the brain'),
    支配範圍: e('特殊感覺：嗅覺；純感覺。篩板骨折可撕斷嗅絲，造成嗅覺喪失，並可能使腦脊髓液從鼻腔漏出', 'Special sense of smell; purely sensory. A fracture of the cribriform plate can tear the filaments, causing loss of smell and possibly leakage of cerebrospinal fluid from the nose'),
  },
  'anterior ethmoidal nerve': {
    來源: e('鼻睫神經（V1）的終末分支之一，在眼眶內側壁發出', 'One of the terminal branches of the nasociliary nerve (V1), given off at the medial wall of the orbit'),
    走向: e('與前篩動脈同行，經前篩孔離開眼眶進入前顱窩，沿篩板上面前行，再經篩板前方的小縫下降入鼻腔；分出內側與外側鼻支，終末支（外鼻神經）在鼻骨與鼻軟骨交界處穿出到鼻背皮膚', 'Accompanies the anterior ethmoidal artery out of the orbit through the anterior ethmoidal foramen into the anterior cranial fossa, runs forward on the cribriform plate and descends into the nasal cavity through a slit at its front; it gives medial and lateral nasal branches, and its terminal external nasal branch emerges between the nasal bone and the nasal cartilage to the skin of the nasal dorsum'),
    支配範圍: e('前、中篩竇，前顱窩的硬腦膜，鼻腔前上部的黏膜（鼻中隔與外側壁），以及鼻尖與鼻翼的皮膚；純感覺', 'The anterior and middle ethmoidal cells, the dura of the anterior cranial fossa, the mucosa of the anterosuperior nasal cavity (septum and lateral wall) and the skin of the tip and alae of the nose; purely sensory'),
  },
  'nasociliary nerve': {
    來源: e('眼神經（V1）的三條分支之一，是其中分支最多的一條', 'One of the three branches of the ophthalmic nerve (V1), and the one with the most branches'),
    走向: e('經眶上裂、在總腱環之內入眼眶，從外側向內跨過視神經上方，沿眼眶內側壁前行；依序分出到睫狀神經節的感覺根、長睫神經、後篩神經與前篩神經，終末延續為滑車下神經；短睫神經則由睫狀神經節發出，內含它的感覺纖維', 'Enters the orbit through the superior orbital fissure inside the common tendinous ring, crosses above the optic nerve from lateral to medial and runs along the medial orbital wall; it gives the sensory root of the ciliary ganglion and the long ciliary, posterior ethmoidal and anterior ethmoidal nerves and ends as the infratrochlear nerve; the short ciliary nerves arise from the ciliary ganglion and contain its sensory fibres'),
    支配範圍: e('眼球（角膜、虹膜、睫狀體）、篩竇與蝶竇黏膜、鼻腔前上部黏膜、鼻背與鼻尖皮膚、內眼角附近眼瞼與淚囊的一般感覺；純感覺', 'General sensation of the eyeball (cornea, iris, ciliary body), the mucosa of the ethmoidal and sphenoidal sinuses and the anterosuperior nasal cavity, the skin of the nasal dorsum and tip, and the eyelids and lacrimal sac near the medial angle; purely sensory'),
  },
  'posterior ethmoidal nerve': {
    來源: e('鼻睫神經（V1）在眼眶內側壁發出的細小分支', 'A slender branch of the nasociliary nerve (V1) arising at the medial wall of the orbit'),
    走向: e('與後篩動脈同行，經後篩孔離開眼眶，進入後篩竇與蝶竇', 'Accompanies the posterior ethmoidal artery through the posterior ethmoidal foramen out of the orbit to the posterior ethmoidal and sphenoidal sinuses'),
    支配範圍: e('後篩竇與蝶竇黏膜的一般感覺；純感覺', 'General sensation of the mucosa of the posterior ethmoidal cells and the sphenoidal sinus; purely sensory'),
  },
  'optic nerve (ii)': {
    來源: e('第二對腦神經，由視網膜神經節細胞的軸突在視盤匯集，穿過鞏膜後極離開眼球而成；胚胎來源是腦的延伸', 'Cranial nerve II, formed by the axons of the retinal ganglion cells gathering at the optic disc and leaving the eyeball through the posterior sclera; developmentally an outgrowth of the brain'),
    走向: e('向後內行經眼眶，穿視神經管（與眼動脈同行）進入顱腔，在腦垂體前上方與對側合成視交叉，再成視徑，繞過大腦腳到外側膝狀體；眶內段包有硬膜、蛛網膜與軟膜，蛛網膜下腔與顱內相通；視網膜中央動脈與靜脈在其內走行，睫狀神經節位於它與外直肌之間', 'Runs backward and medially through the orbit, enters the cranial cavity through the optic canal together with the ophthalmic artery, joins its fellow in front of and above the pituitary gland as the optic chiasm and continues as the optic tract around the cerebral peduncle to the lateral geniculate body; in the orbit it is sheathed by dura, arachnoid and pia, the subarachnoid space being continuous with the intracranial one; the central retinal artery and vein run within it, and the ciliary ganglion lies between it and lateral rectus'),
    支配範圍: e('特殊感覺：視覺，純感覺；也是瞳孔對光反射的傳入路徑', 'Special sense of vision, purely sensory; also the afferent pathway of the pupillary light reflex'),
  },
  'frontal nerve': {
    來源: e('眼神經（V1）三條分支中位於中間的一條', 'The middle one of the three branches of the ophthalmic nerve (V1)'),
    走向: e('經眶上裂、在總腱環之外入眼眶，沿提上眼瞼肌上表面與眶頂骨膜之間向前，約在眼眶中部分成眶上神經與滑車上神經', 'Enters the orbit via the superior orbital fissure, lying outside the common tendinous ring, runs forward between the roof periosteum and levator palpebrae superioris and divides about the middle of the orbit into the supra-orbital and supratrochlear nerves'),
    支配範圍: e('經兩條終末支傳導前額、上眼瞼與前頭皮的一般感覺；純感覺', 'Through its two terminal branches, general sensation of the forehead, upper eyelid and anterior scalp; purely sensory'),
  },
  'supra-orbital nerve': {
    來源: e('額神經（V1）較大、位置較外側的終末支', 'The larger, lateral terminal branch of the frontal nerve (V1)'),
    走向: e('在提上眼瞼肌上方向前，經眶上切跡或眶上孔出眼眶（位置在眶上緣內側三分之一附近），分成淺支與深支，上行到前額與頭皮', 'Runs forward above levator palpebrae superioris and leaves the orbit through the supra-orbital notch or foramen near the medial third of the supra-orbital margin, then divides into superficial and deep branches that ascend to the forehead and scalp'),
    支配範圍: e('上眼瞼的皮膚與結膜、前額皮膚與前頭皮直到頭頂的一般感覺；純感覺', 'General sensation of the skin and conjunctiva of the upper eyelid, the forehead and the scalp as far back as the vertex; purely sensory'),
  },
  'supratrochlear nerve': {
    來源: e('額神經（V1）較小、位置較內側的終末支', 'The smaller, medial terminal branch of the frontal nerve (V1)'),
    走向: e('沿眶頂內側向前，經滑車上方，與滑車上動脈同行，越過眶上緣內側（比眶上神經更靠近正中）上行到前額', 'Runs forward along the medial part of the orbital roof above the trochlea, accompanies the supratrochlear artery over the medial supra-orbital margin (nearer the midline than the supra-orbital nerve) and ascends to the forehead'),
    支配範圍: e('前額近正中處的皮膚、上眼瞼內側的皮膚與結膜的一般感覺；純感覺', 'General sensation of the skin of the forehead near the midline and of the skin and conjunctiva of the medial upper eyelid; purely sensory'),
  },
  'superior branch of oculomotor nerve': {
    來源: e('動眼神經（III）在眶上裂內、總腱環之內分出的較細上支', 'The smaller upper division of the oculomotor nerve (III), given off at the superior orbital fissure within the common tendinous ring'),
    走向: e('越過視神經上方向上前行，貼著上直肌下面進入；一小支穿過或繞過上直肌，抵達它上方的提上眼瞼肌', 'Passes above the optic nerve and enters the underside of superior rectus; a small branch passes through or around that muscle to reach levator palpebrae superioris above it'),
    支配範圍: e('運動支配上直肌（上提眼球）與提上眼瞼肌（上提上眼瞼）', 'Motor to superior rectus (elevating the eyeball) and levator palpebrae superioris (raising the upper eyelid)'),
  },
  'inferior branch of oculomotor nerve': {
    來源: e('動眼神經（III）在總腱環之內分出的較粗下支', 'The larger inferior branch of the oculomotor nerve (III), given off within the common tendinous ring'),
    走向: e('在視神經下方，與鼻睫神經、外旋神經一起位於總腱環內，分成三支，分別到內直肌、下直肌與下斜肌；到下斜肌的一支沿下直肌外緣前行，並發出到睫狀神經節的副交感根', 'Lies below the optic nerve with the nasociliary and abducens nerves inside the common tendinous ring and divides into three branches to medial rectus, inferior rectus and inferior oblique; the branch to inferior oblique runs along the lateral border of inferior rectus and gives off the parasympathetic root to the ciliary ganglion'),
    支配範圍: e('運動支配內直肌、下直肌與下斜肌；其副交感節前纖維經睫狀神經節換神經元，再分布到睫狀肌與瞳孔括約肌', 'Motor to medial rectus, inferior rectus and inferior oblique; its parasympathetic preganglionic fibres synapse in the ciliary ganglion and then supply the ciliary muscle and sphincter pupillae'),
  },
  'long ciliary nerve': {
    來源: e('鼻睫神經（V1）在眼眶內發出的細支，通常有兩條', 'A slender branch of the nasociliary nerve (V1) given off in the orbit, usually two in number'),
    走向: e('在鼻睫神經跨過視神經處發出，與短睫神經並行向前，穿過視神經附近的鞏膜後部入眼球，在鞏膜與脈絡膜之間向前到睫狀體與虹膜', 'Arises where the nasociliary nerve crosses the optic nerve, runs forward beside the short ciliary nerves, pierces the sclera near the optic nerve and passes forward between the sclera and the choroid to the ciliary body and iris'),
    支配範圍: e('虹膜、睫狀體與角膜的一般感覺；並帶有頸上神經節來的交感節後纖維，支配瞳孔開大肌', 'General sensation of the iris, ciliary body and cornea; it also carries sympathetic postganglionic fibres from the superior cervical ganglion to dilator pupillae'),
  },
  'short ciliary nerve': {
    來源: e('睫狀神經節前緣發出的六至十條細神經', 'Six to ten fine nerves leaving the front of the ciliary ganglion'),
    走向: e('分成上、下兩群環繞視神經，與短後睫動脈伴行，穿過視神經周圍的鞏膜入眼球，在鞏膜與脈絡膜之間向前', 'Pass in an upper and a lower group around the optic nerve with the short posterior ciliary arteries, pierce the sclera around the optic nerve and run forward between the sclera and the choroid'),
    支配範圍: e('副交感節後纖維支配睫狀肌（調焦）與瞳孔括約肌（縮瞳）；也帶來鼻睫神經的感覺纖維（角膜、虹膜、睫狀體）與經過神經節的交感纖維（眼球內血管）', 'Postganglionic parasympathetic fibres to the ciliary muscle (accommodation) and sphincter pupillae (constriction); they also carry sensory fibres from the nasociliary nerve (cornea, iris, ciliary body) and sympathetic fibres passing through the ganglion (intraocular vessels)'),
  },
  'ciliary ganglion': {
    來源: e('眼眶內的副交感神經節；節前纖維來自中腦的動眼神經副核，隨動眼神經下支（到下斜肌的分支）而來', 'A parasympathetic ganglion of the orbit; its preganglionic fibres come from the accessory nucleus of the oculomotor nerve in the midbrain, by way of the inferior branch of the oculomotor nerve (the branch to inferior oblique)'),
    走向: e('只有針頭般大小，位在眼眶後部、視神經與外直肌之間；有三條根：副交感根（動眼神經，在此換神經元）、感覺根（鼻睫神經）、交感根（來自頸內動脈周圍神經叢），後兩者只是穿過，不換神經元；節後纖維組成短睫神經', 'Pin-head sized, in the posterior orbit between the optic nerve and lateral rectus; it has three roots: a parasympathetic root (oculomotor nerve, where the neurons synapse), a sensory root (nasociliary nerve) and a sympathetic root (from the plexus around the internal carotid artery), the last two passing through without synapsing; its postganglionic fibres form the short ciliary nerves'),
    支配範圍: e('經短睫神經分布到睫狀肌（調焦）與瞳孔括約肌（縮瞳）', 'Through the short ciliary nerves, the ciliary muscle (accommodation) and sphincter pupillae (constriction)'),
  },
  'infratrochlear nerve': {
    來源: e('鼻睫神經（V1）的終末支，在前篩神經發出之後延續而成', 'The terminal branch of the nasociliary nerve (V1), continuing after the anterior ethmoidal nerve has been given off'),
    走向: e('沿眼眶內側壁、內直肌上緣向前，在上斜肌滑車的下方離開眼眶，到達內眼角', 'Runs forward along the medial orbital wall above the upper border of medial rectus, leaves the orbit below the trochlea of superior oblique and reaches the medial angle of the eye'),
    支配範圍: e('內眼角附近的眼瞼與結膜、淚囊、淚阜，以及鼻根與鼻背上部皮膚的一般感覺；純感覺', 'General sensation of the eyelids and conjunctiva near the medial angle, the lacrimal sac and caruncle, and the skin of the root and upper dorsum of the nose; purely sensory'),
  },
  'vestibulocochlear nerve (viii)': {
    來源: e('第八對腦神經，由來自前庭神經節的前庭神經與來自螺旋神經節的耳蝸神經合成', 'Cranial nerve VIII, formed by the vestibular nerve from the vestibular ganglion and the cochlear nerve from the spiral ganglion'),
    走向: e('兩部在內耳道內合成一條，與顏面神經一同穿過顳骨岩部的內耳道，經內耳孔進入後顱窩，在腦橋下緣、顏面神經外側入腦幹（小腦橋腦角）', 'The two parts join in the internal acoustic meatus, and the nerve runs with the facial nerve through the petrous temporal bone, leaves the internal acoustic meatus through its porus into the posterior cranial fossa and reaches the brainstem at the lower border of the pons, lateral to the facial nerve (cerebellopontine angle)'),
    支配範圍: e('特殊感覺：耳蝸部傳導聽覺、前庭部傳導平衡覺；純感覺，沒有運動纖維', 'Special senses: the cochlear part carries hearing and the vestibular part carries balance; purely sensory, with no motor fibres'),
  },
  'cochlear nerve': {
    來源: e('耳蝸蝸軸內螺旋神經節雙極神經元的軸突；周圍突連到柯蒂氏器的毛細胞', 'Axons of the bipolar neurons of the spiral ganglion in the modiolus of the cochlea, whose peripheral processes connect to the hair cells of the spiral organ'),
    走向: e('在蝸軸內聚成束，由內耳道底離開耳蝸，在內耳道內與前庭神經合成前庭耳蝸神經，入腦幹後止於耳蝸神經核', 'The axons gather in the modiolus, leave the cochlea at the fundus of the internal acoustic meatus, join the vestibular nerve there to form the vestibulocochlear nerve and end in the cochlear nuclei of the brainstem'),
    支配範圍: e('特殊感覺：傳導耳蝸管內柯蒂氏器毛細胞產生的聽覺訊號；純感覺', 'Special sense: carries the hearing signals generated by the hair cells of the spiral organ in the cochlear duct; purely sensory'),
  },
  'vestibular nerve': {
    來源: e('內耳道底前庭神經節（斯卡帕神經節）雙極神經元的軸突；周圍突連到壺腹嵴、橢圓囊斑與球囊斑', 'Axons of the bipolar neurons of the vestibular ganglion at the fundus of the internal acoustic meatus, whose peripheral processes connect to the ampullary crests, the macula of the utricle and the macula of the saccule'),
    走向: e('由前庭神經節向內行，在內耳道內與耳蝸神經合成前庭耳蝸神經，入腦幹後止於前庭神經核，部分纖維直接到小腦', 'Runs medially from the ganglion, joins the cochlear nerve in the internal acoustic meatus to form the vestibulocochlear nerve and ends in the vestibular nuclei of the brainstem, some fibres going directly to the cerebellum'),
    支配範圍: e('特殊感覺：傳導平衡覺，包括三個半規管壺腹嵴的頭部旋轉訊息，以及橢圓囊斑與球囊斑的直線加速度與重力方向；純感覺', 'Special sense: carries balance information, namely head rotation from the ampullary crests of the three semicircular ducts and linear acceleration and the direction of gravity from the maculae of the utricle and saccule; purely sensory'),
  },
  'aponeurosis of epicranius': {
    附著: e('寬廣的腱膜，覆蓋顱頂，前連額肌、後連枕肌，是頭皮的第三層；兩側向顳區變薄，續為顳筋膜', 'a broad tendinous sheet over the vault of the skull, joined in front to frontalis and behind to occipitalis, the third layer of the scalp; it thins out laterally and continues into the temporal fascia'),
    作用: e('把額肌與枕肌連成一個整體，額肌收縮時以枕肌為後方定點牽動頭皮，使眉毛上提、額部起皺；其下方的疏鬆結締組織讓頭皮能在顱骨上滑動，也是感染容易擴散的層次', 'links frontalis and occipitalis into one muscle, so that frontalis pulls the scalp forward against the fixed occipitalis, raising the eyebrows and wrinkling the forehead; the loose connective tissue beneath it lets the scalp slide over the skull and is the layer along which infection spreads easily'),
  },
  'thyrohyoid membrane': {
    附著: e('上緣附著於舌骨體與大角的後上緣，下緣附著於甲狀軟骨板的上緣；中央增厚為甲狀舌骨正中韌帶，兩側後緣增厚為甲狀舌骨外側韌帶（內含小麥軟骨）', 'its upper edge is fixed to the posterior upper margin of the body and greater horns of the hyoid, its lower edge to the upper border of the thyroid lamina; it thickens centrally as the median thyrohyoid ligament and at its posterior borders as the lateral thyrohyoid ligaments, which contain the triticeal cartilage'),
    作用: e('把喉懸吊在舌骨下方，吞嚥時讓喉隨舌骨一同上提；上喉神經內支與上喉動脈、靜脈從側面穿過它進入喉', 'suspends the larynx from the hyoid so that the larynx rises with the hyoid in swallowing; the internal branch of the superior laryngeal nerve and the superior laryngeal vessels pierce it on each side to enter the larynx'),
  },
  'suspensory ligament of lens': {
    附著: e('由睫狀體與睫狀突伸出的許多細小帶纖維組成，呈放射狀向內附著在水晶體赤道附近的前後囊', 'made up of many fine zonular fibres running from the ciliary body and ciliary processes radially inward to the anterior and posterior capsule near the equator of the lens'),
    作用: e('把水晶體懸吊在虹膜後方，並把睫狀肌的收縮與放鬆傳給水晶體：看近時睫狀肌收縮，懸韌帶鬆弛，水晶體因自身彈性變厚變圓；看遠時睫狀肌放鬆，懸韌帶拉緊，水晶體被拉扁', 'holds the lens behind the iris and transmits the contraction and relaxation of the ciliary muscle to it: in near vision the ciliary muscle contracts, the ligament slackens and the lens thickens by its own elasticity; in distant vision the muscle relaxes, the ligament tightens and the lens is flattened'),
  },
  'pharyngeal raphe': {
    附著: e('咽後壁正中的纖維縫，上端附著於枕骨基底部的咽結節，向下延伸到食道起始處；上、中、下咽縮肌的纖維從兩側止於此縫', 'a fibrous seam in the midline of the posterior pharyngeal wall, fixed above to the pharyngeal tubercle on the basilar part of the occipital bone and running down toward the start of the oesophagus; the fibres of the superior, middle and inferior constrictors insert into it from each side'),
    作用: e('作為左右咽縮肌共同的止點，使它們合成一條肌肉管，收縮時由上往下依序擠壓，把食團推向食道', 'the common insertion of the constrictors of both sides, joining them into one muscular tube that squeezes from above downward to drive the bolus toward the oesophagus'),
  },
  'pterygomandibular raphe': {
    附著: e('腱性的纖維帶，上端附著於蝶骨翼突內側板的翼鉤，下端附著於下頜骨的下頜舌骨肌線後端、最後一顆大臼齒後方；位於前方的頰肌與後方的上咽縮肌之間，在口腔黏膜下形成一道皺襞', 'a tendinous band fixed above to the pterygoid hamulus of the medial pterygoid plate and below to the posterior end of the mylohyoid line of the mandible behind the last molar; it lies between buccinator in front and the superior pharyngeal constrictor behind and raises a mucosal fold in the mouth'),
    作用: e('供頰肌與上咽縮肌附著的共同帶，把兩塊肌肉在這條線上連成一體，使頰肌壓緊臉頰、上咽縮肌收縮咽壁；也是下齒槽神經阻滯麻醉進針時的位置標誌', 'the common attachment line of buccinator and the superior constrictor, joining the two muscles so that buccinator presses the cheek against the teeth and the constrictor narrows the pharyngeal wall; it is also a landmark for needle placement in an inferior alveolar nerve block'),
  },
  'stylohyoid ligament': {
    附著: e('細長的纖維索，上端附著於顳骨莖突尖端，下端附著於舌骨小角（舌骨體與大角交界處）；是第二咽弓軟骨的遺跡，有時部分鈣化', 'a slender fibrous cord fixed above to the tip of the styloid process of the temporal bone and below to the lesser horn of the hyoid bone; a remnant of the cartilage of the second pharyngeal arch that may be partly calcified'),
    作用: e('把舌骨向上懸吊在顱底，並供中咽縮肌附著；莖突咽肌與舌咽神經在其附近下行，神經從上、中咽縮肌之間進入咽壁', 'suspends the hyoid from the skull base and gives attachment to the middle pharyngeal constrictor; stylopharyngeus and the glossopharyngeal nerve descend close to it, and the nerve enters the pharyngeal wall between the superior and middle constrictors'),
  },
});

// Heart and adjoining great vessels (heart quiz). Standard textbook anatomy; variable branching is described as "常見".
Object.assign(CARD_EXTRAS, {
  'right coronary artery': {
    來源: e('升主動脈的右冠狀竇', 'Right aortic sinus of the ascending aorta'),
    走向: e('沿右房室溝（冠狀溝）向右下行，繞過心臟右緣至後方', 'Runs in the right atrioventricular (coronary) groove, around the right border to the back of the heart'),
    主要分支: e('竇房結支、右緣支、後室間支（後降支）、房室結支（常見）', 'Sinoatrial nodal branch, right marginal branch, posterior interventricular branch and atrioventricular nodal branch (common pattern)'),
    供應範圍: e('右心房、右心室與室間隔後部；多數人亦供應竇房結與房室結', 'Right atrium, right ventricle and the posterior part of the interventricular septum; in most people also the sinoatrial and atrioventricular nodes'),
  },
  'right inferolateral branch of right coronary artery': {
    來源: e('右冠狀動脈', 'Right coronary artery'),
    走向: e('沿心臟下緣向心尖方向走行', 'Runs along the inferior border of the heart towards the apex'),
    供應範圍: e('右心室下緣的心壁', 'The wall of the right ventricle along the inferior border'),
  },
  'left coronary artery': {
    來源: e('升主動脈的左冠狀竇', 'Left aortic sinus of the ascending aorta'),
    走向: e('短幹行於肺動脈幹與左心耳之間，隨即分為兩支', 'A short main stem passing between the pulmonary trunk and the left auricle, then dividing into two branches'),
    主要分支: e('前室間動脈（左前降支）與迴旋支', 'Anterior interventricular artery (left anterior descending) and circumflex artery'),
    供應範圍: e('左心房、左心室與室間隔前部', 'Left atrium, left ventricle and the anterior part of the interventricular septum'),
  },
  'anterior interventricular artery': {
    來源: e('左冠狀動脈', 'Left coronary artery'),
    走向: e('沿前室間溝向心尖下行，常繞過心尖至後室間溝', 'Descends in the anterior interventricular groove towards the apex, often turning round it into the posterior groove'),
    主要分支: e('對角支與室間隔支（中隔支）', 'Diagonal branches and septal branches'),
    供應範圍: e('左心室前壁、室間隔前部與右心室前壁的一部分', 'Anterior wall of the left ventricle, the anterior part of the interventricular septum and part of the anterior wall of the right ventricle'),
  },
  'septal branches of anterior interventricular artery': {
    來源: e('前室間動脈', 'Anterior interventricular artery'),
    走向: e('穿入室間隔', 'Penetrate the interventricular septum'),
    供應範圍: e('室間隔（含部分傳導系統）', 'The interventricular septum, including part of the conducting system'),
  },
  'circumflex artery': {
    來源: e('左冠狀動脈', 'Left coronary artery'),
    走向: e('沿左房室溝（冠狀溝）繞向心臟後方', 'Follows the left atrioventricular (coronary) groove round to the back of the heart'),
    主要分支: e('左緣支（鈍緣支）', 'Left marginal branch'),
    供應範圍: e('左心房與左心室的外側壁及後壁', 'Left atrium and the lateral and posterior walls of the left ventricle'),
  },
  'great cardiac vein': {
    來源: e('心尖附近，前室間溝下端', 'Near the apex, at the lower end of the anterior interventricular groove'),
    走向: e('伴隨前室間動脈上行，再沿左房室溝繞向後方，續為冠狀竇', 'Ascends beside the anterior interventricular artery, then follows the left atrioventricular groove to the back and continues as the coronary sinus'),
    主要分支: e('左緣靜脈、左心室後靜脈等屬支', 'Tributaries include the left marginal vein and the posterior vein of the left ventricle'),
    引流範圍: e('心臟前面與左側，注入冠狀竇', 'Anterior and left parts of the heart; drains into the coronary sinus'),
  },
  'middle cardiac vein': {
    來源: e('心尖附近', 'Near the apex'),
    走向: e('沿後室間溝上行，注入冠狀竇', 'Ascends in the posterior interventricular groove and drains into the coronary sinus'),
    引流範圍: e('左、右心室的後面與室間隔後部', 'Posterior surfaces of both ventricles and the posterior part of the septum'),
  },
  'inferior vein of left ventricle': {
    走向: e('沿左心室下壁走行，注入冠狀竇或心大靜脈', 'Runs along the inferior wall of the left ventricle and drains into the coronary sinus or the great cardiac vein'),
    引流範圍: e('左心室下壁', 'Inferior wall of the left ventricle'),
  },
  'posterior vein of left ventricle': {
    走向: e('沿左心室後壁走行，注入冠狀竇', 'Runs along the posterior wall of the left ventricle and drains into the coronary sinus'),
    引流範圍: e('左心室後壁', 'Posterior wall of the left ventricle'),
  },
  'coronary sinus': {
    來源: e('心大靜脈在左房室溝後部的延續', 'Continuation of the great cardiac vein in the posterior part of the left atrioventricular groove'),
    走向: e('位於後方的左房室溝內，向右開口於右心房', 'Lies in the posterior atrioventricular groove and opens to the right into the right atrium'),
    主要分支: e('心中靜脈、心小靜脈、左心室後靜脈、左緣靜脈', 'Middle and small cardiac veins, posterior vein of the left ventricle, left marginal vein'),
    引流範圍: e('絕大部分心臟的靜脈血', 'Most of the venous blood of the heart'),
  },
  'ascending aorta': {
    來源: e('左心室（經主動脈瓣）', 'Left ventricle, through the aortic valve'),
    走向: e('向上、向前、向右行，於胸骨角水平續為主動脈弓', 'Passes upward, forward and to the right, becoming the aortic arch at the level of the sternal angle'),
    主要分支: e('左、右冠狀動脈', 'Left and right coronary arteries'),
    供應範圍: e('心臟（經冠狀動脈），並將血液送往全身', 'The heart (through the coronary arteries); it also carries blood on to the whole body'),
  },
  'aortic arch': {
    來源: e('升主動脈', 'Ascending aorta'),
    走向: e('向後、向左彎，越過左主支氣管，續為降主動脈', 'Arches backward and to the left over the left main bronchus and continues as the descending aorta'),
    主要分支: e('頭臂動脈幹、左總頸動脈、左鎖骨下動脈', 'Brachiocephalic trunk, left common carotid artery and left subclavian artery'),
    供應範圍: e('頭頸部與上肢', 'Head, neck and upper limbs'),
  },
  'pulmonary trunk': {
    來源: e('右心室（經肺動脈瓣）', 'Right ventricle, through the pulmonary valve'),
    走向: e('向上、向後行，於主動脈弓下方分為左、右肺動脈', 'Ascends and passes backward, dividing below the aortic arch into the left and right pulmonary arteries'),
    主要分支: e('左肺動脈、右肺動脈', 'Left and right pulmonary arteries'),
    供應範圍: e('將缺氧血送往兩肺', 'Carries deoxygenated blood to both lungs'),
  },
  'bifurcation of pulmonary trunk': {
    來源: e('肺動脈幹', 'Pulmonary trunk'),
    走向: e('肺動脈幹在此分為左、右肺動脈', 'The pulmonary trunk divides here into the left and right pulmonary arteries'),
    主要分支: e('左肺動脈、右肺動脈', 'Left and right pulmonary arteries'),
  },
  'left pulmonary artery': {
    來源: e('肺動脈幹分叉處', 'Bifurcation of the pulmonary trunk'),
    走向: e('越過左主支氣管前方進入左肺門', 'Passes in front of the left main bronchus to the hilum of the left lung'),
    供應範圍: e('左肺（缺氧血）', 'Left lung (deoxygenated blood)'),
  },
  'right pulmonary artery': {
    來源: e('肺動脈幹分叉處', 'Bifurcation of the pulmonary trunk'),
    走向: e('經升主動脈與上腔靜脈後方、右主支氣管前方進入右肺門', 'Passes behind the ascending aorta and superior vena cava and in front of the right main bronchus to the hilum of the right lung'),
    供應範圍: e('右肺（缺氧血）', 'Right lung (deoxygenated blood)'),
  },
  'left superior pulmonary vein': {走向: e('由左肺門向內行，注入左心房', 'Passes from the hilum of the left lung to the left atrium'), 引流範圍: e('左肺上葉', 'Upper lobe of the left lung')},
  'left inferior pulmonary vein': {走向: e('由左肺門向內行，注入左心房', 'Passes from the hilum of the left lung to the left atrium'), 引流範圍: e('左肺下葉', 'Lower lobe of the left lung')},
  // Lung quiz: main bronchi and bronchial arteries (standard textbook anatomy; variable origin is written as 常見).
  'main bronchus': {
    位置: e('由氣管分叉處（隆凸）向左下外行，進入左肺門', 'Runs down and to the left from the bifurcation of the trachea (carina) to the hilum of the left lung'),
    '構造／毗鄰關係': e('較右主支氣管長而窄、走向較水平；主動脈弓由上方跨過，前方有左肺動脈，後方有食道與降主動脈；入肺門後分為上葉與下葉支氣管', 'Longer, narrower and more horizontal than the right main bronchus; the aortic arch arches over it, the left pulmonary artery lies in front and the oesophagus and descending aorta behind; it divides into upper and lower lobar bronchi'),
    '血液供應／神經': e('支氣管動脈；肺叢（迷走神經與交感神經）', 'Bronchial arteries; pulmonary plexus (vagus and sympathetic nerves)'),
  },
  'main bronchus proper': {
    位置: e('由氣管分叉處（隆凸）向右下外行，進入右肺門', 'Runs down and to the right from the bifurcation of the trachea (carina) to the hilum of the right lung'),
    '構造／毗鄰關係': e('較左主支氣管短而寬、走向較垂直（異物較易落入右側）；奇靜脈弓由後上方跨過；在進入肺門前先分出右上葉支氣管（動脈上支氣管），其餘部分續為中間支氣管', 'Shorter, wider and more vertical than the left main bronchus (inhaled objects enter the right side more easily); the arch of the azygos vein passes over it from behind; before the hilum it gives off the upper lobe bronchus (eparterial bronchus) and the rest continues as the bronchus intermedius'),
    '血液供應／神經': e('支氣管動脈；肺叢（迷走神經與交感神經）', 'Bronchial arteries; pulmonary plexus (vagus and sympathetic nerves)'),
  },
  'bronchial artery': {
    來源: e('胸主動脈（常見：左側兩條直接發自胸主動脈，右側常與第 3 肋間後動脈共幹）', 'Thoracic aorta (commonly two on the left directly from the aorta; the right usually shares a trunk with the 3rd posterior intercostal artery)'),
    走向: e('沿主支氣管後壁進入肺門，隨支氣管樹向下分支', 'Runs along the back of the main bronchus into the hilum and branches along the bronchial tree'),
    主要分支: e('隨支氣管分支的小動脈（本模型為單一示意構造）', 'Small arteries that follow the bronchi (a single schematic structure in this model)'),
    供應範圍: e('支氣管壁、肺的結締組織支架、肺門淋巴結與臟層胸膜（含氧血，屬肺的營養血管）', 'Bronchial walls, the connective tissue framework of the lung, hilar lymph nodes and visceral pleura (oxygenated blood; the nutrient supply of the lung)'),
  },
  'right superior pulmonary vein': {走向: e('由右肺門向內行，注入左心房', 'Passes from the hilum of the right lung to the left atrium'), 引流範圍: e('右肺上葉與中葉', 'Upper and middle lobes of the right lung')},
  'right inferior pulmonary vein': {走向: e('由右肺門向內行，注入左心房', 'Passes from the hilum of the right lung to the left atrium'), 引流範圍: e('右肺下葉', 'Lower lobe of the right lung')},
});

const ORDINALS: [string, string][] = [['first', '一'], ['second', '二'], ['third', '三'], ['fourth', '四'], ['fifth', '五'], ['sixth', '六'], ['seventh', '七'], ['eighth', '八'], ['ninth', '九'], ['tenth', '十'], ['eleventh', '十一'], ['twelfth', '十二']];
const CERVICAL: CardExtra = {
  主要標誌: e('椎體小而寬、橫突孔、棘突多為分叉（第三至第六頸椎）、上下關節突', 'Small wide body, transverse foramen, spinous process usually bifid (C3–C6), superior and inferior articular processes'),
  相關關節: e('椎間盤（椎體間）、關節突關節（上下相鄰椎骨）', 'Intervertebral discs (between bodies) and facet (zygapophysial) joints with the adjacent vertebrae'),
};
const THORACIC: CardExtra = {
  主要標誌: e('肋凹（椎體與橫突）、細長向下傾斜的棘突、關節突面近冠狀面', 'Costal facets on the body and transverse processes, long downward-sloping spinous process, articular facets close to the coronal plane'),
  相關關節: e('肋椎關節（肋頭關節與肋橫突關節）、椎間盤、關節突關節', 'Costovertebral joints (joint of the rib head and costotransverse joint), intervertebral discs and facet joints'),
};
const LUMBAR: CardExtra = {
  主要標誌: e('椎體大而厚、短而呈方形的水平棘突、乳突與副突、關節突面近矢狀面', 'Large thick body, short square horizontal spinous process, mammillary and accessory processes, articular facets close to the sagittal plane'),
  相關關節: e('椎間盤、關節突關節；第五腰椎與薦骨構成腰薦關節', 'Intervertebral discs and facet joints; L5 forms the lumbosacral joint with the sacrum'),
};
for (const [word, number] of ORDINALS) {
  if (!['seventh'].includes(word) && number.length === 1 && '三四五六'.includes(number)) CARD_EXTRAS[`${word} cervical vertebra`] = CERVICAL;
  CARD_EXTRAS[`${word} thoracic vertebra`] = THORACIC;
  if ('一二三四五'.includes(number) && number.length === 1) CARD_EXTRAS[`${word} lumbar vertebra`] = LUMBAR;
}
CARD_EXTRAS['seventh cervical vertebra'] = {
  主要標誌: e('棘突長且不分叉，體表易於觸及（隆椎）；橫突孔較小', 'Long non-bifid spinous process that is easily palpated (vertebra prominens); small transverse foramen'),
  相關關節: CERVICAL.相關關節,
};
CARD_EXTRAS['eleventh thoracic vertebra'] = {...THORACIC, 主要標誌: e('只有單一肋凹（在椎體上）、無橫突肋凹、棘突短而近水平', 'A single costal facet on the body, no transverse costal facet, short nearly horizontal spinous process')};
CARD_EXTRAS['twelfth thoracic vertebra'] = {...THORACIC, 主要標誌: e('只有單一肋凹（在椎體上）、無橫突肋凹，兼具胸椎與腰椎的特徵', 'A single costal facet on the body, no transverse costal facet, with features of both thoracic and lumbar vertebrae')};
CARD_EXTRAS['arch of aorta'] = CARD_EXTRAS['aortic arch'];

// Lung quiz: the fields the pulmonary arteries and veins were missing (their origin and main branches), so that they can be asked in level 2 as well.
const pa = (side: string) => ({主要分支: e(`${side}肺葉動脈，再隨支氣管分為肺段動脈`, `Lobar arteries of the ${side === '左' ? 'left' : 'right'} lung, then segmental arteries following the bronchi`)});
Object.assign(CARD_EXTRAS['left pulmonary artery'], pa('左'));
Object.assign(CARD_EXTRAS['right pulmonary artery'], pa('右'));
const pv = (side: string, lobes: string, lobesEn: string) => ({來源: e('肺泡周圍毛細血管網匯集而成的肺段靜脈', 'Segmental veins collected from the capillary network around the alveoli'), 主要分支: e(`${side}${lobes}的肺段靜脈`, `Segmental veins of the ${lobesEn}`)});
Object.assign(CARD_EXTRAS['left superior pulmonary vein'], pv('左', '上葉（含舌葉）', 'upper lobe (including the lingula) of the left lung'));
Object.assign(CARD_EXTRAS['left inferior pulmonary vein'], pv('左', '下葉', 'lower lobe of the left lung'));
Object.assign(CARD_EXTRAS['right superior pulmonary vein'], pv('右', '上葉與中葉', 'upper and middle lobes of the right lung'));
Object.assign(CARD_EXTRAS['right inferior pulmonary vein'], pv('右', '下葉', 'lower lobe of the right lung'));

// ===== B04–B05 begin: head-and-neck muscles, ligaments and organ structures (card batches B04 and B05). Standard anatomy only; a field we are not sure of stays out. =====
const PHARYNX_NERVE = {
  神經支配: e('迷走神經的咽支，經咽神經叢', 'Pharyngeal branches of the vagus nerve, through the pharyngeal plexus'),
};
Object.assign(CARD_EXTRAS, {
  'depressor septi nasi': {
    起點: e('上頜骨中切牙上方的牙槽隆起處，位於口輪匝肌深面', 'Alveolar eminence of the maxilla above the central incisor, deep to orbicularis oris'),
    止點: e('鼻中隔可動部分的下緣與鼻翼後部，纖維與鼻肌相連', 'Lower margin of the mobile part of the nasal septum and the back of the nasal ala, blending with fibres of nasalis'),
    作用: e('把鼻中隔與鼻尖向下拉；與鼻肌橫部關係密切，對鼻孔也有影響', 'Pulls the nasal septum and the tip of the nose downward; it is closely related to the transverse part of nasalis and also has an effect on the nostril'),
    神經支配: e('顏面神經的頰支', 'Buccal branches of the facial nerve'),
  },
  'superior pharyngeal constrictor': {
    起點: e('翼突內側板下部與翼突鉤、翼下頜縫、下頜骨內面後端（下頜舌骨線末端）以及舌根的外側緣', 'Lower medial pterygoid plate and pterygoid hamulus, pterygomandibular raphe, the posterior end of the mylohyoid line on the inner surface of the mandible, and the side of the tongue base'),
    止點: e('在後方止於咽縫上部；最上緣以咽顱底筋膜附著於枕骨底部的咽結節', 'Upper part of the pharyngeal raphe at the back; its top edge reaches the pharyngeal tubercle of the occipital bone through the pharyngobasilar fascia'),
    作用: e('收縮咽壁，吞嚥時自上而下依序推動食團，並協助封閉鼻咽', 'Narrows the pharyngeal wall and drives the food bolus downward in sequence during swallowing, helping to seal off the nasopharynx'),
    ...PHARYNX_NERVE,
  },
  'middle pharyngeal constrictor': {
    起點: e('舌骨大角與小角，以及莖突舌骨韌帶下部', 'Greater and lesser horns of the hyoid bone and the lower part of the stylohyoid ligament'),
    止點: e('咽縫；肌纖維呈扇形散開，上部覆蓋上咽縮肌下緣，下部被下咽縮肌上緣覆蓋', 'Pharyngeal raphe; the fibres fan out, the upper ones overlapping the lower edge of the superior constrictor and the lower ones lying under the upper edge of the inferior constrictor'),
    作用: e('收縮咽壁中部，把食團往下推向食道', 'Narrows the middle part of the pharyngeal wall and pushes the bolus on toward the oesophagus'),
    ...PHARYNX_NERVE,
  },
  'inferior pharyngeal constrictor': {
    起點: e('甲狀軟骨斜線及其後方的區域（甲咽部），以及環狀軟骨外側面（環咽部）', 'Oblique line of the thyroid cartilage and the area behind it (thyropharyngeus), and the side of the cricoid cartilage (cricopharyngeus)'),
    止點: e('咽縫；最下方的環咽部纖維呈環形，向下續接食道', 'Pharyngeal raphe; the lowest, cricopharyngeal fibres run circularly and continue into the oesophagus'),
    作用: e('收縮下部咽壁推送食團；環咽部平時收縮，使食道上口保持關閉，防止食物逆流', 'Narrows the lower pharyngeal wall to push the bolus on; the cricopharyngeal part stays contracted at rest, keeping the upper oesophageal opening shut and preventing reflux'),
    神經支配: e('迷走神經的咽支，經咽神經叢；下部另有喉外神經與喉返神經的分支', 'Pharyngeal branches of the vagus nerve through the pharyngeal plexus; the lower part also receives branches of the external laryngeal and recurrent laryngeal nerves'),
  },
  'palatopharyngeus': {
    起點: e('硬顎後緣與軟顎的顎腱膜，分為前後兩束，中間夾著提顎帆肌', 'Posterior border of the hard palate and the palatine aponeurosis of the soft palate, in two bundles with levator veli palatini between them'),
    止點: e('咽側壁；與莖突咽肌會合後，附著於甲狀軟骨後緣並融入咽壁', 'Side wall of the pharynx; joined by stylopharyngeus, it attaches to the posterior border of the thyroid cartilage and blends into the pharyngeal wall'),
    作用: e('吞嚥時縮短並抬高咽部與喉，並把顎咽弓拉近、縮窄口咽入口；肌肉本身形成顎咽弓，構成扁桃體窩的後界', 'Shortens and raises the pharynx and larynx in swallowing and draws the palatopharyngeal arches together, narrowing the oropharyngeal isthmus; the muscle forms the palatopharyngeal arch, the back wall of the tonsillar fossa'),
    ...PHARYNX_NERVE,
  },
  'salpingopharyngeus': {
    起點: e('咽鼓管軟骨部的下緣，靠近咽口處', 'Lower edge of the cartilaginous part of the pharyngotympanic tube, near its pharyngeal opening'),
    止點: e('向下與顎咽肌纖維會合，融入咽側壁', 'Runs down to merge with the fibres of palatopharyngeus in the side wall of the pharynx'),
    作用: e('吞嚥時抬高咽側壁與喉；肌肉被包在咽鼓管咽皺襞內', 'Raises the side wall of the pharynx and the larynx in swallowing; the muscle lies inside the salpingopharyngeal fold'),
    ...PHARYNX_NERVE,
  },
  'stylopharyngeus': {
    起點: e('顳骨莖突基部的內側面', 'Medial side of the base of the styloid process of the temporal bone'),
    止點: e('在上、中咽縮肌之間入咽壁，附著於甲狀軟骨的後緣與上緣，纖維並混入咽壁與顎咽肌', 'Enters the pharyngeal wall between the superior and middle constrictors and attaches to the posterior and upper borders of the thyroid cartilage, its fibres also blending with the pharyngeal wall and palatopharyngeus'),
    作用: e('吞嚥時抬高咽部與喉，同時擴大咽腔，便於食團通過', 'Raises the pharynx and larynx in swallowing and widens the pharyngeal cavity so the bolus can pass'),
    神經支配: e('舌咽神經，是咽肌中唯一不由迷走神經支配的肌肉；神經與此肌伴行，一同在上、中咽縮肌之間進入咽壁', 'Glossopharyngeal nerve, the only pharyngeal muscle not supplied by the vagus nerve; the nerve accompanies the muscle and enters the pharyngeal wall with it between the superior and middle constrictors'),
  },
  'thyro-arytenoid': {
    起點: e('甲狀軟骨交角內面的下半部與環甲正中韌帶', 'Lower half of the inner surface of the angle of the thyroid cartilage and the median cricothyroid ligament'),
    止點: e('杓狀軟骨的前外側面（基部與聲帶突附近）', 'Anterolateral surface of the arytenoid cartilage, near its base and vocal process'),
    作用: e('縮短並放鬆聲帶，使音調降低；內側的聲帶肌纖維可微調聲帶的張力', 'Shortens and relaxes the vocal fold, lowering the pitch; its medial vocalis fibres fine-tune the tension of the fold'),
    神經支配: e('喉返神經（下喉神經）', 'Recurrent laryngeal nerve (inferior laryngeal nerve)'),
  },
  'posterior crico-arytenoid': {
    起點: e('環狀軟骨板後面的凹陷', 'Depression on the back of the lamina of the cricoid cartilage'),
    止點: e('杓狀軟骨肌突的後面', 'Back of the muscular process of the arytenoid cartilage'),
    作用: e('使杓狀軟骨向外旋轉，外展聲帶並打開聲門裂；是唯一能外展聲帶的喉內肌', 'Rotates the arytenoid cartilage outward, abducting the vocal fold and opening the rima glottidis; the only intrinsic laryngeal muscle that abducts the vocal folds'),
    神經支配: e('喉返神經（下喉神經）', 'Recurrent laryngeal nerve (inferior laryngeal nerve)'),
  },
  'lateral crico-arytenoid': {
    起點: e('環狀軟骨弓上緣的外側面', 'Upper border of the lateral part of the arch of the cricoid cartilage'),
    止點: e('杓狀軟骨肌突的前面', 'Front of the muscular process of the arytenoid cartilage'),
    作用: e('使杓狀軟骨向內旋轉，內收聲帶並關閉聲門裂的前部', 'Rotates the arytenoid cartilage inward, adducting the vocal fold and closing the front part of the rima glottidis'),
    神經支配: e('喉返神經（下喉神經）', 'Recurrent laryngeal nerve (inferior laryngeal nerve)'),
  },
  'median cricothyroid ligament': {
    附著: e('上緣附於甲狀軟骨下緣的正中，下緣附於環狀軟骨弓前方的上緣；是彈性圓錐前部增厚的正中帶', 'Upper edge on the midline of the lower border of the thyroid cartilage, lower edge on the upper border of the front of the cricoid arch; the thickened median part of the conus elasticus'),
    作用: e('連結並穩住甲狀軟骨與環狀軟骨的前部，讓甲狀軟骨能以環甲關節為軸前傾；此處在頸前正中位置表淺，也是緊急建立氣道的切開處', 'Binds the front of the thyroid and cricoid cartilages and lets the thyroid cartilage tilt forward on the cricothyroid joints; it lies superficially in the midline of the neck and is the site for emergency airway access'),
  },
  'lateral thyrohyoid ligament': {
    附著: e('甲狀舌骨膜後緣增厚形成的帶狀韌帶，連接甲狀軟骨上角的尖端與舌骨大角的後端，內部有時含小的麥粒軟骨', 'Thickened posterior edge of the thyrohyoid membrane, joining the tip of the superior horn of the thyroid cartilage to the back end of the greater horn of the hyoid bone; it sometimes contains a small triticeal cartilage'),
    作用: e('把喉懸吊於舌骨上，使吞嚥時喉與舌骨一同升降，又容許兩者之間有少許相對移動', 'Suspends the larynx from the hyoid bone so the two rise and fall together in swallowing, while allowing a little movement between them'),
  },
  'vocal ligament': {
    附著: e('前端附於甲狀軟骨內面交角處的正中，後端附於杓狀軟骨的聲帶突；是彈性圓錐上緣游離而增厚的部分，位於聲褶內', 'Front end on the midline of the inner surface of the thyroid angle, back end on the vocal process of the arytenoid cartilage; the thickened free upper edge of the conus elasticus, lying inside the vocal fold'),
    作用: e('構成聲褶的支撐核心並決定聲門裂的邊緣；聲帶肌與環甲肌調節它的張力以改變音調，其上的黏膜振動而發聲', 'Forms the supporting core of the vocal fold and defines the edge of the rima glottidis; the vocalis and cricothyroid muscles adjust its tension to change pitch, and the mucosa over it vibrates to make sound'),
  },
  'cornea': {
    位置: e('眼球纖維層的前方，約占前六分之一，向前微凸的透明部分，位在虹膜與前房之前', 'Front of the fibrous coat of the eyeball, about its anterior sixth, the transparent bulging part lying in front of the iris and anterior chamber'),
    組成: e('透明、沒有血管的緻密結締組織，膠原纖維排列極規則，表面為複層上皮，神經末梢豐富；養分主要由房水供應，並由角膜緣血管與淚膜補充', 'Transparent, avascular dense connective tissue with very regularly arranged collagen fibres, a stratified epithelium at the surface and abundant nerve endings; nourished mainly by the aqueous humour, with supplementary supply from the limbal vessels and the tear film'),
    毗鄰: e('後方為前房的房水；周緣在角鞏膜交界（角膜緣）處接鞏膜，鞏膜靜脈竇位在附近；前面隔著淚膜與上、下眼瞼和結膜相對', 'Behind it lies the aqueous humour of the anterior chamber; its rim joins the sclera at the corneoscleral junction (limbus), near the scleral venous sinus; its front surface, covered by the tear film, faces the eyelids and conjunctiva'),
  },
  'sclera': {
    位置: e('纖維層的後方，約占五分之六，是眼球最外層的白色部分，前方連接角膜，後方有視神經穿出', 'Posterior five-sixths of the fibrous coat, the white outermost layer of the eyeball, continuous with the cornea in front and pierced by the optic nerve behind'),
    組成: e('緻密的膠原纖維與少量彈性纖維組成的結締組織，堅韌、不透明', 'Dense connective tissue of collagen fibres with some elastic fibres; tough and opaque'),
    毗鄰: e('外面覆有球結膜與眼球筋膜囊，六條眼外肌附著其上；內面貼著脈絡膜；後方篩板處供視神經穿出，並與視神經鞘相連', 'Its outer surface is covered by the bulbar conjunctiva and the fascial sheath of the eyeball and carries the attachments of the six extraocular muscles; its inner surface lies against the choroid; at the back the lamina cribrosa transmits the optic nerve and the sclera continues into the optic nerve sheath'),
  },
  'vitreous body': {
    位置: e('水晶體與視網膜之間，占眼球後方的大部分空間（玻璃體腔）', 'Between the lens and the retina, filling most of the back of the eyeball (the vitreous chamber)'),
    組成: e('透明的膠狀物，絕大部分是水，含透明質酸與細緻的膠原纖維網，沒有血管；外周有玻璃體膜', 'Clear gel that is mostly water, with hyaluronic acid and a fine meshwork of collagen fibres; no blood vessels; bounded by the hyaloid membrane'),
    毗鄰: e('前方為水晶體後面（陷入玻璃體前面的凹窩）與睫狀小帶；周圍貼著視網膜視部與睫狀體；後方鄰近視盤', 'In front lie the back of the lens (set in a hollow of the vitreous) and the zonular fibres; around it are the optic part of the retina and the ciliary body; behind lies the optic disc'),
  },
  'optic part of retina': {
    位置: e('眼球壁的最內層，自視盤向前延伸到鋸齒緣，覆於脈絡膜內面', 'Innermost coat of the eyeball wall, extending from the optic disc forward to the ora serrata and lining the choroid'),
    組成: e('含感光細胞、雙極細胞與神經節細胞等神經元的神經層，以及色素上皮層，組織學上共分十層', 'Neural layer containing photoreceptors, bipolar cells and ganglion cells, together with the pigment epithelium; ten layers in histology'),
    毗鄰: e('外側緊貼脈絡膜，內側面對玻璃體；前緣在鋸齒緣處續為覆蓋睫狀體與虹膜內面的非視部；後部有視盤（盲點），外側有黃斑與中央小凹', 'Its outer side lies against the choroid and its inner side faces the vitreous body; at the ora serrata it continues forward as the non-visual part covering the ciliary body and iris; at the back lie the optic disc (blind spot) and, lateral to it, the macula lutea with the fovea centralis'),
  },
  'tarsal plate of upper eyelid': {
    位置: e('上眼瞼內，位於眼輪匝肌的深面、瞼結膜的淺面，接近瞼緣', 'Inside the upper eyelid, deep to orbicularis oculi and superficial to the palpebral conjunctiva, near the lid margin'),
    組成: e('緻密纖維結締組織構成的新月形板，高約 10 mm，內含 20–30 條瞼板腺（特化的皮脂腺）', 'Crescent-shaped plate of dense fibrous connective tissue, about 10 mm high, containing 20–30 tarsal glands (modified sebaceous glands)'),
    毗鄰: e('上緣接提上眼瞼肌腱膜與上瞼板肌；下緣為游離的瞼緣；前面隔著眼輪匝肌，後面緊貼瞼結膜；兩端借內、外側瞼韌帶連到眶緣', 'Its upper edge receives the levator palpebrae superioris aponeurosis and the superior tarsal muscle and its lower edge is the free lid margin; orbicularis oculi lies in front and the palpebral conjunctiva is adherent behind; its ends are tied to the orbital margin by the medial and lateral palpebral ligaments'),
  },
  'tarsal plate of lower eyelid': {
    位置: e('下眼瞼內，位於眼輪匝肌的深面、瞼結膜的淺面，接近瞼緣', 'Inside the lower eyelid, deep to orbicularis oculi and superficial to the palpebral conjunctiva, near the lid margin'),
    組成: e('緻密纖維結締組織構成的狹長板，高約 5 mm，比上眼瞼瞼板小，內含瞼板腺', 'Narrow plate of dense fibrous connective tissue, about 5 mm high and smaller than the upper one, containing tarsal glands'),
    毗鄰: e('下緣接眶隔與下眼瞼的縮肌筋膜；上緣為游離的瞼緣；前面隔著眼輪匝肌，後面緊貼瞼結膜；兩端借內、外側瞼韌帶連到眶緣', 'Its lower edge receives the orbital septum and the retractor fascia of the lower lid and its upper edge is the free lid margin; orbicularis oculi lies in front and the palpebral conjunctiva is adherent behind; its ends are tied to the orbital margin by the medial and lateral palpebral ligaments'),
  },
  'lacrimal gland': {
    位置: e('眼眶的外上方，位於額骨的淚腺窩內；呈杏仁狀，約 2 cm 大', 'Superolateral part of the orbit, in the lacrimal fossa of the frontal bone; almond-shaped and about 2 cm across'),
    組成: e('漿液性腺體，被提上眼瞼肌腱膜的外側部分隔成較大的眶部與較小的瞼部，以 10–20 條小排泄管開口於上結膜穹窿的外側', 'Serous gland divided by the lateral part of the levator palpebrae superioris aponeurosis into a larger orbital part and a smaller palpebral part; 10–20 small excretory ducts open into the lateral part of the superior conjunctival fornix'),
    毗鄰: e('上方貼額骨；下方與眼球上外側面及外直肌上緣相鄰；內側為提上眼瞼肌腱膜與上直肌；前面鄰眶隔', 'Above it lies the frontal bone; below it lie the upper outer surface of the eyeball and the upper edge of lateral rectus; medially lie the levator palpebrae superioris aponeurosis and superior rectus; in front lies the orbital septum'),
  },
  'lacrimal canaliculus': {
    位置: e('上、下眼瞼的內側緣，各一條，起於瞼緣上的淚點', 'One in each eyelid along its medial margin, starting at the lacrimal punctum on the lid margin'),
    組成: e('內襯複層鱗狀上皮的細管，先垂直向下（上管向上）約 2 mm，再轉成水平向內約 8 mm；兩條常先會合成共同的小管再入淚囊', 'Fine tubes lined by stratified squamous epithelium, running about 2 mm vertically from the punctum and then about 8 mm horizontally toward the nose; the two often join in a common channel before entering the lacrimal sac'),
    毗鄰: e('沿瞼緣內側走行，被眼輪匝肌的淚部纖維包繞；在內眥韌帶附近開口於淚囊的外側壁', 'Runs along the medial lid margin surrounded by the lacrimal part of orbicularis oculi and opens into the lateral wall of the lacrimal sac near the medial palpebral ligament'),
  },
  'lacrimal sac': {
    位置: e('眼眶內側壁前下部的淚囊窩內，由淚骨與上頜骨額突圍成，位於內眥韌帶的後方', 'In the lacrimal fossa at the front of the medial orbital wall, formed by the lacrimal bone and the frontal process of the maxilla, behind the medial palpebral ligament'),
    組成: e('膜性的囊，上端為盲端，下端續接鼻淚管；壁由黏膜與纖維組織構成', 'Membranous sac with a blind upper end continuing below into the nasolacrimal duct; its wall consists of mucosa and fibrous tissue'),
    毗鄰: e('前面有內眥韌帶與眼輪匝肌淚部；外側接受淚小管開口；內側隔著淚骨與前組篩竇及中鼻道前部相鄰', 'The medial palpebral ligament and the lacrimal part of orbicularis oculi lie in front; the canaliculi open into its lateral side; medially the lacrimal bone separates it from the anterior ethmoidal cells and the front of the middle meatus'),
  },
  'nasolacrimal duct': {
    位置: e('自淚囊下端向下，經上頜骨、淚骨與下鼻甲共同形成的骨性鼻淚管，開口於下鼻道前部', 'Runs down from the lower end of the lacrimal sac through the bony nasolacrimal canal formed by the maxilla, lacrimal bone and inferior nasal concha, and opens into the front of the inferior meatus'),
    組成: e('膜性管，約 1.5 cm 長，內襯柱狀上皮；下端開口處有黏膜皺襞（瓣膜）', 'Membranous duct about 1.5 cm long, lined by columnar epithelium, with a mucosal fold (valve) at its lower opening'),
    毗鄰: e('外側為上頜竇的內側壁；內側為鼻腔外側壁，緊鄰下鼻甲的附著處與中鼻道前部', 'Laterally lies the medial wall of the maxillary sinus; medially lies the lateral wall of the nasal cavity, close to the attachment of the inferior concha and the front of the middle meatus'),
  },
  'sublingual gland': {
    位置: e('口腔底，舌下方，位於下頜骨內面的舌下腺窩，在下頜舌骨肌上方、舌下皺襞下方', 'In the floor of the mouth under the tongue, in the sublingual fossa on the inner surface of the mandible, above mylohyoid and below the sublingual fold'),
    組成: e('三大唾液腺中最小的一個，混合腺但以黏液為主，由許多小腺葉組成，以約 10–20 條小導管開口於舌下皺襞，另有一條較大的導管開口於頜下腺管附近', 'The smallest of the three major salivary glands, a mixed gland that is mainly mucous, made of many small lobules; about 10–20 small ducts open along the sublingual fold and one larger duct opens near the submandibular duct'),
    毗鄰: e('外側貼下頜骨內面；內側為頦舌肌，並有舌神經與頜下腺管經過；下方為下頜舌骨肌；後端接頜下腺的深部', 'Laterally it lies against the inner surface of the mandible; medially lie genioglossus, the lingual nerve and the submandibular duct; below it is mylohyoid; its back end meets the deep part of the submandibular gland'),
  },
  'submandibular gland': {
    位置: e('下頜下三角內，位於下頜骨體下緣之下，界於二腹肌前腹、後腹與下頜骨之間', 'In the submandibular triangle below the body of the mandible, bounded by the anterior and posterior bellies of digastric and the mandible'),
    組成: e('混合腺，以漿液為主；較大的淺部在下頜舌骨肌下方，較小的深部繞過該肌後緣到其上方；導管由深部向前走，開口於舌繫帶兩側的舌下阜', 'Mixed gland that is mainly serous; the larger superficial part lies below mylohyoid and the smaller deep part curls round its posterior border above the muscle; the duct runs forward from the deep part and opens on the sublingual papilla beside the frenulum of the tongue'),
    毗鄰: e('淺面被頸闊肌、皮膚與深筋膜覆蓋，顏面靜脈與顏面神經的下頜邊緣支經其淺側；顏面動脈從其深面穿出；深面為下頜舌骨肌與舌骨舌肌，舌神經、舌下神經與其導管在此區交叉', 'Its superficial surface is covered by platysma, skin and deep fascia, with the facial vein and the marginal mandibular branch (facial nerve) passing superficial to it; the facial artery emerges from its deep side; its deep surface lies on mylohyoid and hyoglossus, where the lingual nerve, hypoglossal nerve and the duct cross one another'),
  },
  'thyroid cartilage': {
    位置: e('頸前部，位於舌骨之下、環狀軟骨之上，約在第四至第五頸椎的高度；是喉最大的軟骨', 'Front of the neck below the hyoid bone and above the cricoid cartilage, at about the level of C4–C5; the largest cartilage of the larynx'),
    組成: e('透明軟骨；左右兩片四邊形的軟骨板在前方相接成交角（男性較尖，形成喉結），上緣有甲狀上切跡，後緣向上、下延伸成上角與下角，外面有斜線', 'Hyaline cartilage; two quadrilateral laminae meet in front at an angle (more acute in men, forming the laryngeal prominence), with a superior thyroid notch above and a posterior border drawn out into superior and inferior horns; the outer surface carries the oblique line'),
    毗鄰: e('上方以甲狀舌骨膜連舌骨；下方以環甲正中韌帶與環甲關節（下角）連環狀軟骨；後方為下咽縮肌；外面有舌骨下肌群，甲狀腺側葉貼於其外側下方；內面前方有聲帶附著', 'Above it the thyrohyoid membrane joins it to the hyoid bone; below it the median cricothyroid ligament and the cricothyroid joints (inferior horns) join it to the cricoid cartilage; behind lies the inferior pharyngeal constrictor; infrahyoid muscles cover its outer surface and the lobe of the thyroid gland lies against its lower outer side; the vocal folds attach to the inner surface in front'),
  },
  'cricoid cartilage': {
    位置: e('喉的最下方、甲狀軟骨之下，約在第六頸椎的高度，下方接氣管', 'Lowest cartilage of the larynx, below the thyroid cartilage at about the level of C6, continuous below with the trachea'),
    組成: e('透明軟骨，是喉部唯一完整的環；後方高大的環板，前方狹窄的環弓；板的上緣有杓狀關節面，兩側有甲狀關節面', 'Hyaline cartilage and the only complete ring in the larynx, with a tall lamina behind and a narrow arch in front; the upper border of the lamina bears the arytenoid facets and the sides bear the facets for the thyroid cartilage'),
    毗鄰: e('上方與甲狀軟骨（環甲關節、環甲正中韌帶）及杓狀軟骨（環杓關節）相連；下方以環氣管韌帶接氣管第一環；後方為下咽縮肌的環咽部與食道起始處；前外側有甲狀腺鄰接；喉返神經在其後方入喉', 'Above, it joins the thyroid cartilage (cricothyroid joints and median cricothyroid ligament) and the arytenoid cartilages (cricoarytenoid joints); below, the cricotracheal ligament joins it to the first tracheal ring; behind lie the cricopharyngeal part of the inferior constrictor and the start of the oesophagus; the thyroid gland lies against its anterolateral side; the recurrent laryngeal nerve enters the larynx behind it'),
  },
  'trachea': {
    位置: e('起於環狀軟骨下緣，約在第六頸椎（C6）的高度，向下經頸部入胸腔，到胸骨角的高度（約第四至第五胸椎）分為左、右主支氣管', 'Starts at the lower border of the cricoid cartilage at about the level of the sixth cervical vertebra (C6), runs down through the neck into the thorax and divides into the right and left main bronchi at the level of the sternal angle (about T4–T5)'),
    組成: e('約 16–20 個 C 形透明軟骨環疊成的管道，後方缺口由氣管肌（平滑肌）與纖維彈性膜封閉；內襯偽複層纖毛柱狀上皮', 'A tube held open by about 16–20 C-shaped hyaline cartilage rings, the gap at the back closed by the trachealis muscle (smooth muscle) and a fibroelastic membrane; lined by pseudostratified ciliated columnar epithelium'),
    毗鄰: e('前方有甲狀腺峽（約第二至第四環）、胸骨柄、左頭臂靜脈與主動脈弓；後方為食道，兩者之間的溝內有喉返神經；兩側為甲狀腺側葉與頸總動脈', 'In front lie the isthmus of the thyroid gland (over about rings 2–4), the manubrium, the left brachiocephalic vein and the aortic arch; behind lies the oesophagus with the recurrent laryngeal nerves in the groove between them; at the sides lie the lobes of the thyroid gland and the common carotid arteries'),
  },
  'major alar cartilage': {
    位置: e('外鼻下部的鼻尖與鼻孔周圍，位於鼻骨與外側鼻軟骨之下', 'Around the nasal tip and nostril in the lower part of the external nose, below the nasal bone and lateral nasal cartilage'),
    組成: e('兩片薄的 U 形透明軟骨，各分內側腳與外側腳；內側腳組成鼻小柱的前部，外側腳構成鼻翼的大部分；周圍另有小的副軟骨', 'A thin U-shaped hyaline cartilage on each side, with a medial and a lateral crus; the medial crura form the front of the columella and the lateral crura form most of the nasal ala; small accessory cartilages lie around them'),
    毗鄰: e('上方以纖維組織與外側鼻軟骨相接；兩側內側腳之間夾著鼻中隔軟骨的下緣；外面覆皮膚，內面襯鼻前庭的黏膜', 'Above, fibrous tissue joins it to the lateral nasal cartilage; the lower edge of the septal cartilage lies between the two medial crura; skin covers the outside and the lining of the nasal vestibule covers the inside'),
  },
  'septal nasal cartilage': {
    位置: e('鼻中隔的前部，位於鼻骨下方、外鼻的正中', 'Front part of the nasal septum, below the nasal bones in the midline of the external nose'),
    組成: e('四邊形的透明軟骨板；上緣向兩側延伸，與外側鼻軟骨相連', 'Quadrilateral plate of hyaline cartilage whose upper edge spreads out on each side to join the lateral nasal cartilages'),
    毗鄰: e('後上方接篩骨垂直板，後下方接犁骨，下方接上頜骨的鼻嵴與前鼻棘；前下緣與大翼軟骨內側腳相鄰；上方與鼻骨相接', 'Behind and above it meets the perpendicular plate of the ethmoid, behind and below the vomer, and below the nasal crest of the maxilla and the anterior nasal spine; its front lower edge lies between the medial crura of the major alar cartilages; above it meets the nasal bones'),
  },
  'common tendinous ring': {
    位置: e('眶尖，圍繞視神經管與眶上裂的中段', 'Apex of the orbit, surrounding the optic canal and the middle part of the superior orbital fissure'),
    組成: e('纖維性的環狀腱，由上、下兩股組成，是上、下、內、外四條直肌共同的起點', 'Fibrous tendinous ring made of an upper and a lower band, the common origin of the superior, inferior, medial and lateral rectus muscles'),
    毗鄰: e('環內通過動眼神經的上支與下支、鼻睫神經、外旋神經，以及經視神經管進入、穿過此環的視神經與眼動脈；環外通過滑車神經、額神經、淚神經與眼上靜脈', 'Inside the ring pass the superior and inferior divisions of the oculomotor nerve, the nasociliary nerve, the abducens nerve, and the optic nerve with the ophthalmic artery, which enter through the optic canal and pass through the ring; outside the ring pass the trochlear, frontal and lacrimal nerves and the superior ophthalmic vein'),
  },
  'trochlea of superior oblique': {
    位置: e('眶內側壁的上前方，附於額骨的滑車窩附近，靠近眶上緣內側', 'Upper front part of the medial wall of the orbit, attached near the trochlear fossa of the frontal bone close to the medial part of the supra-orbital margin'),
    組成: e('小的纖維軟骨環，上斜肌的肌腱穿過其中，外面有滑膜鞘使肌腱滑動', 'Small ring of fibrocartilage through which the tendon of superior oblique passes, with a synovial sheath that lets the tendon glide'),
    毗鄰: e('上斜肌肌腱穿過後轉向後外側，經上直肌下方止於眼球上外側；肌腹在其後方，沿眶內側壁走在內直肌上方；附近有滑車上神經與滑車上動脈', 'After passing through it the tendon of superior oblique turns backward and outward beneath superior rectus to reach the upper outer part of the eyeball; the muscle belly lies behind it along the medial orbital wall above medial rectus; the supratrochlear nerve and artery run nearby'),
  },
});
// ===== B04–B05 end =====

// ===== B07–B08 begin: internal jugular vein, head-and-neck bones and temporomandibular joint soft tissue (card batches B07 and B08). Standard anatomy only; a field we are not sure of stays out. =====
Object.assign(CARD_EXTRAS, {
  'internal jugular vein': {
    來源: e('在顱底的頸靜脈孔接續乙狀竇而成，起始處略膨大（上球）', 'Continues from the sigmoid sinus at the jugular foramen of the skull base, with a small dilatation (superior bulb) at its start'),
    走向: e('在頸動脈鞘內下行：上段在頸內動脈後方，往下逐漸移到總頸動脈外側，迷走神經走在兩者之間的後方；大多隱在胸鎖乳突肌深面，到胸鎖關節後方與鎖骨下靜脈會合成頭臂靜脈，會合處稱靜脈角', 'Descends in the carotid sheath: behind the internal carotid artery above, then lateral to the common carotid artery lower down, with the vagus nerve between and behind them; lies mostly deep to sternocleidomastoid and joins the subclavian vein behind the sternoclavicular joint to form the brachiocephalic vein (the venous angle)'),
    主要分支: e('下岩竇、總顏面靜脈、舌靜脈、咽靜脈、上甲狀腺靜脈與中甲狀腺靜脈', 'Inferior petrosal sinus, common facial vein, and the lingual, pharyngeal, superior thyroid and middle thyroid veins'),
    引流範圍: e('腦與腦膜、顏面與口咽、舌、甲狀腺與頸部深層結構的血液', 'Blood from the brain and meninges, the face and oropharynx, the tongue, the thyroid and the deep neck'),
  },
  'mandible': {
    位置: e('顏面下部，是頭部唯一可動的骨；由水平的馬蹄形下頜體與兩側向上的下頜支組成', 'Lower part of the face and the only movable bone of the head; a horizontal horseshoe-shaped body with an upright ramus on each side'),
    主要標誌: e('下頜體與牙槽部、頦隆凸、頦孔、斜線、下頜舌骨肌線；下頜角；下頜支上的下頜孔與小舌、髁突、冠突、下頜切跡', 'Body with the alveolar part, mental protuberance, mental foramen, oblique line and mylohyoid line; angle of the mandible; on the ramus the mandibular foramen with its lingula, condylar process, coronoid process and mandibular notch'),
    相關關節: e('顳顎關節（髁突與顳骨的下頜窩）', 'Temporomandibular joint (condylar process with the mandibular fossa of the temporal bone)'),
  },
  'hyoid bone': {
    位置: e('頸前部，位於下頜骨與甲狀軟骨之間，約在第三頸椎的高度；呈馬蹄形', 'Front of the neck between the mandible and the thyroid cartilage, at about the level of C3; horseshoe-shaped'),
    主要標誌: e('體、一對大角、一對小角', 'Body, a pair of greater horns and a pair of lesser horns'),
    相關關節: e('不與其他骨形成典型關節，由肌肉與韌帶懸吊（莖突舌骨韌帶、甲狀舌骨膜等）；體與大角之間有小關節', 'Forms no typical joint with another bone and is suspended by muscles and ligaments (stylohyoid ligament, thyrohyoid membrane and others); small joints lie between the body and the greater horns'),
  },
  'frontal bone': {
    位置: e('構成前額、眼眶上壁與前顱底的前部', 'Forms the forehead, the roof of the orbit and the front of the anterior cranial base'),
    主要標誌: e('額鱗、眉弓、額結節、眶上緣與眶上切跡（孔）、顴突、鼻部、額竇', 'Frontal squama, superciliary arch, frontal eminence, supraorbital margin with the supraorbital notch (foramen), zygomatic process, nasal part and frontal sinus'),
    相關關節: e('冠狀縫（與頂骨）、與蝶骨、篩骨、鼻骨、淚骨、上頜骨及顴骨相接', 'Coronal suture (with the parietal bones); also meets the sphenoid, ethmoid, nasal, lacrimal, maxilla and zygomatic bones'),
  },
  'zygomatic bone': {
    位置: e('面頰隆起處，構成眼眶的外側壁與下緣的一部分', 'The prominence of the cheek, forming part of the lateral wall and the lower margin of the orbit'),
    主要標誌: e('額突、顳突、上頜突、眶面；顴面孔與顴顳孔', 'Frontal process, temporal process, maxillary process, orbital surface; zygomaticofacial and zygomaticotemporal foramina'),
    相關關節: e('額骨（顴額縫）、上頜骨（顴上頜縫）、蝶骨大翼，並與顳骨顴突相接成顴弓', 'Frontal bone (frontozygomatic suture), maxilla (zygomaticomaxillary suture) and the greater wing of the sphenoid; joins the zygomatic process of the temporal bone to form the zygomatic arch'),
  },
  'maxilla': {
    位置: e('顏面中部，左右兩塊在中線相接；構成上顎、眼眶下壁、鼻腔外側壁與硬顎前部', 'Middle of the face, the two bones meeting in the midline; forms the upper jaw, the floor of the orbit, the lateral wall of the nasal cavity and the front of the hard palate'),
    主要標誌: e('上頜體（內含上頜竇）、額突、顴突、牙槽突、顎突、眶下孔、前鼻棘、切牙孔', 'Body (containing the maxillary sinus), frontal process, zygomatic process, alveolar process, palatine process, infraorbital foramen, anterior nasal spine and incisive foramen'),
    相關關節: e('對側上頜骨（上頜間縫）、鼻骨、額骨、淚骨、篩骨、顴骨、顎骨、犁骨與下鼻甲', 'The opposite maxilla (intermaxillary suture), nasal, frontal, lacrimal, ethmoid, zygomatic, palatine and vomer bones and the inferior nasal concha'),
  },
  'sphenoid bone': {
    位置: e('位於顱底正中，前接額骨與篩骨，後接枕骨與顳骨，形如展翅的蝴蝶', 'Lies in the middle of the cranial base between the frontal and ethmoid bones in front and the occipital and temporal bones behind, shaped like a butterfly with outspread wings'),
    主要標誌: e('體（蝶竇、蝶鞍與垂體窩）、小翼（視神經管、前床突）、鞍背、大翼（圓孔、卵圓孔、棘孔）、翼突（內側板與外側板）、眶上裂、蝶棘', 'Body (sphenoidal sinus, sella turcica and hypophysial fossa), lesser wing (optic canal, anterior clinoid process), dorsum sellae, greater wing (foramen rotundum, foramen ovale, foramen spinosum), pterygoid process (medial and lateral plates), superior orbital fissure and spine of the sphenoid'),
    相關關節: e('額骨、篩骨、頂骨、顳骨、枕骨（蝶枕軟骨結合）、顴骨、上頜骨、顎骨與犁骨', 'Frontal, ethmoid, parietal, temporal, occipital (spheno-occipital synchondrosis), zygomatic, maxilla, palatine bones and the vomer'),
  },
  'palatine bone': {
    位置: e('位於上頜骨後方、蝶骨翼突之前，構成鼻腔後外側壁與硬顎後部；呈 L 形', 'Behind the maxilla and in front of the pterygoid process of the sphenoid, forming the posterolateral wall of the nasal cavity and the back of the hard palate; L-shaped'),
    主要標誌: e('水平板（硬顎後部）、垂直板、錐突、眶突與蝶突、蝶顎切跡、大顎孔與小顎孔、後鼻棘', 'Horizontal plate (back of the hard palate), perpendicular plate, pyramidal process, orbital and sphenoidal processes, sphenopalatine notch, greater and lesser palatine foramina and posterior nasal spine'),
    相關關節: e('上頜骨、蝶骨（翼突）、對側顎骨、犁骨、篩骨與下鼻甲', 'Maxilla, sphenoid (pterygoid process), the opposite palatine bone, vomer, ethmoid and inferior nasal concha'),
  },
  'nasal bone': {
    位置: e('外鼻上部的骨性鼻樑，左右各一片小而薄的長方形骨，位於兩側上頜骨額突之間、額骨鼻部之下', 'The bony bridge of the upper external nose; a small thin rectangular bone on each side between the frontal processes of the maxillae and below the nasal part of the frontal bone'),
    主要標誌: e('鼻間縫（兩骨之間）、鼻額縫、鼻骨孔；內面有篩溝，容納前篩神經的外鼻支', 'Internasal suture between the two bones, frontonasal suture, nasal foramen; a groove on the inner surface carries the external nasal branch of the anterior ethmoidal nerve'),
    相關關節: e('對側鼻骨、額骨、上頜骨額突，內面與篩骨垂直板相接', 'The opposite nasal bone, the frontal bone and the frontal process of the maxilla; internally it meets the perpendicular plate of the ethmoid'),
  },
  'vomer': {
    位置: e('鼻中隔的後下部，位於正中線上，是薄而呈梯形的骨板', 'The posteroinferior part of the nasal septum, a thin trapezoid plate lying in the midline'),
    主要標誌: e('犁骨翼（上緣兩側）、游離的後緣（分隔左右後鼻孔）、鼻顎溝', 'Ala of the vomer (on each side of its upper border), the free posterior border that separates the two choanae, and the nasopalatine groove'),
    相關關節: e('蝶骨體下面、篩骨垂直板、上頜骨與顎骨的鼻嵴，前方與鼻中隔軟骨相接', 'Underside of the body of the sphenoid, the perpendicular plate of the ethmoid, the nasal crests of the maxillae and palatine bones, and in front the septal cartilage'),
  },
  'inferior nasal concha': {
    位置: e('鼻腔外側壁的下部，是獨立的顏面骨，下方覆蓋下鼻道', 'Lower part of the lateral wall of the nasal cavity; an independent facial bone that roofs the inferior nasal meatus'),
    主要標誌: e('向下捲曲的薄骨板；淚突、篩突、上頜突', 'A thin scroll of bone curling downward; lacrimal, ethmoidal and maxillary processes'),
    相關關節: e('上頜骨、淚骨、顎骨垂直板與篩骨鉤突', 'Maxilla, lacrimal bone, perpendicular plate of the palatine bone and the uncinate process of the ethmoid'),
  },
  'ethmoid': {
    位置: e('位於兩眼眶之間、鼻腔的上部，額骨之下、蝶骨之前；由篩板、垂直板與兩側篩骨迷路組成', 'Between the two orbits in the upper nasal cavity, below the frontal bone and in front of the sphenoid; made of the cribriform plate, the perpendicular plate and two lateral labyrinths'),
    主要標誌: e('雞冠、篩板與篩孔、垂直板、上鼻甲與中鼻甲、鉤突、篩泡、眶板（紙樣板）', 'Crista galli, cribriform plate with its foramina, perpendicular plate, superior and middle nasal conchae, uncinate process, ethmoidal bulla and orbital plate (lamina papyracea)'),
    相關關節: e('額骨、蝶骨、上頜骨、淚骨、顎骨、下鼻甲、犁骨與鼻骨', 'Frontal, sphenoid, maxilla, lacrimal, palatine, inferior nasal concha, vomer and nasal bones'),
  },
  'lacrimal bone': {
    位置: e('眼眶內側壁的前部，是顏面最小而薄的骨之一，位於上頜骨額突與篩骨眶板之間', 'Front part of the medial wall of the orbit; one of the smallest, thinnest facial bones, between the frontal process of the maxilla and the orbital plate of the ethmoid'),
    主要標誌: e('淚後嵴、淚溝（與上頜骨額突共同圍成淚囊窩）、淚鉤', 'Posterior lacrimal crest, lacrimal groove (forming the fossa for the lacrimal sac together with the frontal process of the maxilla) and lacrimal hamulus'),
    相關關節: e('額骨、篩骨、上頜骨額突與下鼻甲', 'Frontal bone, ethmoid, frontal process of the maxilla and the inferior nasal concha'),
  },
  'temporal bone': {
    位置: e('構成顱的側壁與顱底的一部分，介於蝶骨、頂骨與枕骨之間；內含中耳與內耳', 'Forms part of the side wall and base of the skull between the sphenoid, parietal and occipital bones; contains the middle and inner ear'),
    主要標誌: e('鱗部、鼓部、岩部、乳突部與莖突；顴突、下頜窩與關節結節、外耳道、莖乳孔、頸動脈管、內耳道', 'Squamous, tympanic, petrous and mastoid parts and the styloid process; zygomatic process, mandibular fossa and articular tubercle, external acoustic meatus, stylomastoid foramen, carotid canal and internal acoustic meatus'),
    相關關節: e('顳顎關節（下頜窩與下頜髁突）；鱗縫（與頂骨）、與蝶骨、枕骨相接，顴突與顴骨相接成顴弓', 'Temporomandibular joint (mandibular fossa with the condylar process of the mandible); squamous suture (with the parietal bone), contact with the sphenoid and occipital bones, and the zygomatic process meeting the zygomatic bone to form the zygomatic arch'),
  },
  'parietal bone': {
    位置: e('構成頭頂與顱側壁的上部，左右各一塊，呈四邊形的彎曲骨板', 'Forms the roof and the upper part of the side wall of the skull; a curved quadrilateral plate on each side'),
    主要標誌: e('頂結節、上顳線與下顳線；四個緣（矢狀緣、冠狀緣、人字緣、鱗緣）；內面有腦膜中動脈溝與上矢狀竇溝', 'Parietal eminence, superior and inferior temporal lines; four borders (sagittal, frontal, occipital and squamosal); on the inner surface the groove for the middle meningeal artery and the groove for the superior sagittal sinus'),
    相關關節: e('對側頂骨（矢狀縫）、額骨（冠狀縫）、枕骨（人字縫）、顳骨（鱗縫）與蝶骨大翼', 'The opposite parietal bone (sagittal suture), frontal bone (coronal suture), occipital bone (lambdoid suture), temporal bone (squamous suture) and the greater wing of the sphenoid'),
  },
  'articular disc of temporomandibular joint': {
    所屬關節: e('顳顎關節', 'Temporomandibular joint'),
    附著與連結: e('橢圓形的纖維軟骨板，夾在下頜髁突與顳骨的下頜窩及關節結節之間；周緣與關節囊相連，前方有外翼肌的部分纖維附著，後方接富含血管與神經的雙層區', 'An oval plate of fibrocartilage between the condylar process of the mandible and the mandibular fossa and articular tubercle of the temporal bone; its rim blends with the articular capsule, some fibres of lateral pterygoid attach in front, and behind it continues into a vascular and nerve-rich bilaminar zone'),
    功能: e('把關節腔分成上、下兩腔：上腔做滑動（下頜前突與後縮），下腔做樞紐運動（張口與閉口）；並緩衝壓力、使不吻合的關節面互相適應', 'Divides the joint into upper and lower compartments: gliding in the upper (protrusion and retrusion), hinge movement in the lower (opening and closing); it also cushions pressure and fits together the unmatched joint surfaces'),
  },
  'articular capsule of temporomandibular joint': {
    所屬關節: e('顳顎關節', 'Temporomandibular joint'),
    附著與連結: e('寬鬆的纖維膜，上方附著於下頜窩邊緣與關節結節前緣，下方附著於下頜髁頸；內襯滑膜，外側被外側韌帶加強', 'A loose fibrous membrane attached above to the margin of the mandibular fossa and the front of the articular tubercle and below to the neck of the condylar process; lined by synovial membrane and strengthened laterally by the lateral ligament'),
    功能: e('包圍並封閉關節腔，容許下頜大幅度活動，並與韌帶一起限制過度運動；滑膜分泌滑液潤滑關節', 'Encloses the joint cavity, allows wide movement of the mandible and, together with the ligaments, limits excessive movement; the synovial membrane secretes lubricating fluid'),
  },
  'lateral temporomandibular ligament': {
    所屬關節: e('顳顎關節', 'Temporomandibular joint'),
    附著與連結: e('由關節囊外側纖維增厚而成；起自顴弓下緣與關節結節，向後下斜行，止於下頜頸的後外側', 'A thickening of the lateral fibres of the capsule; arises from the lower border of the zygomatic arch and the articular tubercle, runs obliquely backward and downward and attaches to the back and outer side of the neck of the mandible'),
    功能: e('從外側固定下頜，是關節最主要的韌帶；限制下頜向後與向下過度移位', 'Holds the mandible from the lateral side and is the main ligament of the joint; limits excessive backward and downward displacement of the mandible'),
  },
  'sphenomandibular ligament': {
    所屬關節: e('顳顎關節（位於關節內側的輔助韌帶，與關節囊分開）', 'Temporomandibular joint (an accessory ligament on the medial side, separate from the capsule)'),
    附著與連結: e('起自蝶骨棘，向下呈扇形展開，止於下頜小舌與下頜孔的邊緣；下齒槽神經與血管走在它與下頜支之間', 'Arises from the spine of the sphenoid, fans out downward and attaches to the lingula and the edge of the mandibular foramen; the inferior alveolar nerve and vessels pass between it and the ramus'),
    功能: e('從內側懸吊下頜，張口時作為下頜轉動的支點，並限制下頜過度前移', 'Suspends the mandible from the medial side, acts as the pivot for the mandible in opening and limits excessive forward movement'),
  },
  'stylomandibular ligament': {
    所屬關節: e('顳顎關節（位於關節內側的輔助韌帶，與關節囊分開）', 'Temporomandibular joint (an accessory ligament on the medial side, separate from the capsule)'),
    附著與連結: e('起自顳骨莖突的尖端，向前下止於下頜角與下頜支的後緣；是頸深筋膜的增厚帶，把腮腺與頜下腺隔開', 'Arises from the tip of the styloid process of the temporal bone and runs forward and downward to the angle and posterior border of the ramus; a thickened band of deep cervical fascia that separates the parotid from the submandibular gland'),
    功能: e('從內側固定下頜，張口時放鬆，下頜前突時繃緊，限制其過度前移', 'Holds the mandible from the medial side; it slackens when the mouth opens and tightens on protrusion, limiting excessive forward movement'),
  },
});
// ===== B07–B08 end =====

// ===== B06 begin: head-and-neck organ structures (eye, lip, tongue, laryngeal cartilages) and arteries (card batch B06). Standard anatomy only; a field we are not sure of stays out. =====
Object.assign(CARD_EXTRAS, {
  'choroid': {
    位置: e('眼球壁中層（血管層）的後大部分，夾在鞏膜與視網膜之間，約覆蓋眼球後方六分之五，範圍與鞏膜相當；向前續為睫狀體', 'Posterior large part of the middle (vascular) coat of the eyeball wall, between the sclera and the retina, covering about the posterior five-sixths of the globe, the same extent as the sclera; it continues forward as the ciliary body'),
    組成: e('富含血管與色素細胞的疏鬆結締組織，由外向內有血管層與毛細血管層，最內層為薄的玻璃膜；呈深褐色，可吸收進入眼內的散射光', 'Loose connective tissue rich in vessels and pigment cells, with an outer vascular layer and an inner capillary layer, and a thin glassy membrane innermost; its dark brown colour absorbs stray light inside the eye'),
    毗鄰: e('外面僅隔一層潛在的脈絡膜上腔貼著鞏膜；內面緊貼視網膜的色素上皮，並供給視網膜外層養分；後方有視神經穿出處，前方在鋸齒緣處接睫狀體；睫狀後短動脈與長動脈供血', 'Outside, it lies against the sclera across a potential suprachoroidal space; inside, it is closely applied to the pigment epithelium of the retina and nourishes its outer layers; the optic nerve leaves at its back and the ciliary body begins at the ora serrata in front; it is supplied by the short and long posterior ciliary arteries'),
  },
  'lens': {
    位置: e('眼球前部，虹膜與瞳孔的後方、玻璃體前面的凹窩（髕狀窩）之前', 'Front part of the eyeball, behind the iris and pupil and in front of the hollow (patellar fossa) on the front of the vitreous body'),
    組成: e('透明、沒有血管與神經的雙凸透鏡；外包彈性的晶體囊，前面內側有一層上皮，內部是排列緊密的晶體纖維，核心較硬、周邊較軟', 'Transparent biconvex body without vessels or nerves; an elastic capsule encloses it, with a layer of epithelium under the front surface and tightly packed lens fibres inside, a firmer core and a softer cortex'),
    毗鄰: e('前面對著虹膜與後房，後面貼玻璃體；周緣經睫狀小帶（懸韌帶）連到睫狀突，睫狀肌收縮時小帶放鬆、水晶體變厚而看近處，放鬆時小帶拉緊、水晶體變薄而看遠處；養分來自房水與玻璃體', 'Its front faces the iris and posterior chamber and its back rests on the vitreous body; the zonular fibres (suspensory ligament) join its rim to the ciliary processes, so that contraction of the ciliary muscle slackens them and lets the lens thicken for near vision, while relaxation tightens them and flattens the lens for distance; nutrients come from the aqueous humour and vitreous body'),
  },
  'iris': {
    位置: e('眼球中層前方的圓盤狀薄膜，位於角膜與水晶體之間，中央有圓形的瞳孔', 'Thin disc at the front of the middle coat of the eyeball, between the cornea and the lens, with the round pupil at its centre'),
    組成: e('由含色素細胞與血管的結締組織基質組成，其中有兩種平滑肌：環繞瞳孔的瞳孔括約肌與呈放射狀排列的瞳孔擴張肌；後面覆有色素上皮；色素多寡決定虹膜的顏色', 'A connective tissue stroma with pigment cells and vessels, containing two smooth muscles: the sphincter pupillae ringing the pupil and the radially arranged dilator pupillae; its back is lined by pigmented epithelium, and the amount of pigment gives the iris its colour'),
    毗鄰: e('周緣（虹膜根部）連於睫狀體，並構成前房的後壁；前面為前房的房水，後面為後房並貼著水晶體前面；副交感纖維使瞳孔縮小，交感纖維使瞳孔放大', 'Its outer edge (the root) joins the ciliary body and forms the back wall of the anterior chamber; in front lies the aqueous humour of the anterior chamber, behind lies the posterior chamber and the front of the lens; parasympathetic fibres narrow the pupil and sympathetic fibres widen it'),
  },
  'anterior chamber of eyeball': {
    位置: e('眼球前部，角膜與虹膜（以及瞳孔區的水晶體前面）之間的腔隙', 'Space in the front of the eyeball between the cornea and the iris (and the front of the lens in the pupil area)'),
    組成: e('腔內充滿透明的房水，由睫狀突分泌；房水先在後房，經瞳孔流入前房', 'Filled with clear aqueous humour, secreted by the ciliary processes; it passes first through the posterior chamber and reaches the anterior chamber through the pupil'),
    毗鄰: e('前壁為角膜，後壁為虹膜與瞳孔；周緣的虹膜角膜角（前房角）處有小梁網，房水由此流入鞏膜靜脈竇，再匯入眼靜脈；此流出道受阻時眼壓升高', 'Its front wall is the cornea and its back wall the iris and pupil; at the iridocorneal angle around its edge, aqueous humour drains through the trabecular meshwork into the scleral venous sinus and on to the ocular veins; blockage of this outflow raises the intraocular pressure'),
  },
  'lip': {
    位置: e('口裂周圍的上、下兩片肉質皺襞，構成口腔前壁；上唇與下唇在口角相連', 'Upper and lower fleshy folds around the mouth opening that form the front wall of the oral cavity; they meet at the angles of the mouth'),
    組成: e('由外向內為皮膚、口輪匝肌（及附著其上的其他表情肌）、黏膜下層（含唇腺）與口腔黏膜；紅唇是表皮薄而透明、血管透出的過渡區', 'From outside to inside: skin, orbicularis oris (with other facial muscles inserting into it), submucosa containing labial glands, and oral mucosa; the red vermilion is a transitional zone with thin, translucent epithelium through which the vessels show'),
    毗鄰: e('上唇正中有人中，與鼻中隔下方相連；內面以唇繫帶連到牙齦；上、下唇動脈（來自面動脈）在唇緣附近形成動脈弓；感覺由眶下神經（上唇）與頦神經（下唇）供應，運動由顏面神經控制', 'The upper lip carries the philtrum in the midline and is continuous with the area under the nasal septum; a frenulum on its inner surface ties it to the gum; the superior and inferior labial arteries (from the facial artery) form an arcade near the lip margin; sensation comes from the infra-orbital nerve (upper lip) and the mental nerve (lower lip), and movement is controlled by the facial nerve'),
  },
  'tongue': {
    位置: e('口腔底之上，大部分在口腔內（舌體），後部向下形成口咽前壁（舌根）；以 V 形的界溝分隔前方的舌體與後方的舌根', 'Above the floor of the mouth, mostly within the oral cavity (the body), with its back part (the root) forming the front wall of the oropharynx; a V-shaped terminal sulcus separates the body in front from the root behind'),
    組成: e('以橫紋肌為主的肌性器官，分舌內肌與舌外肌（頦舌肌、舌骨舌肌、莖突舌肌、顎舌肌），表面覆黏膜；背面有絲狀、菌狀、輪廓與葉狀乳頭，其中菌狀、輪廓與葉狀乳頭含味蕾，絲狀乳頭不含味蕾、負責觸覺；中央有舌中隔將兩半分開', 'A muscular organ of mainly striated muscle, made up of intrinsic muscles and extrinsic muscles (genioglossus, hyoglossus, styloglossus, palatoglossus) and covered by mucosa; the dorsum carries filiform, fungiform, vallate and foliate papillae, of which the fungiform, vallate and foliate ones contain taste buds, while the filiform ones have none and serve touch; a median septum divides it into two halves'),
    毗鄰: e('上方為硬顎與軟顎，下方為口腔底的下頜舌骨肌與舌下腺，後方連接舌骨與會厭；運動由舌下神經（顎舌肌除外，屬迷走神經）支配；前三分之二的一般感覺走舌神經、味覺走鼓索，後三分之一由舌咽神經支配；血供主要來自舌動脈', 'Above lie the hard and soft palate, below the mylohyoid and sublingual gland of the floor of the mouth, and behind it connects to the hyoid bone and epiglottis; movement is by the hypoglossal nerve (palatoglossus is supplied by the vagus), general sensation of the front two-thirds travels in the lingual nerve and taste in the chorda tympani, while the back third is supplied by the glossopharyngeal nerve; the blood supply is mainly the lingual artery'),
  },
  'epiglottis': {
    位置: e('喉的入口前方，位於舌根與舌骨後方，下端以甲狀會厭韌帶附於甲狀軟骨內面交角處', 'At the front of the laryngeal inlet, behind the root of the tongue and the hyoid bone, its lower end fixed by the thyro-epiglottic ligament to the inner angle of the thyroid cartilage'),
    組成: e('葉片狀的彈性軟骨，上端寬而游離，下端細而成柄；表面覆黏膜，前面黏膜在舌根形成舌會厭正中皺襞，兩側為舌會厭外側皺襞，兩者之間的凹陷為會厭谷', 'Leaf-shaped plate of elastic cartilage, wide and free above and narrowing to a stalk below; it is covered by mucosa, which on the front surface forms the median and lateral glosso-epiglottic folds on the tongue root, with the valleculae between them'),
    毗鄰: e('前面隔著會厭谷對舌根；後面朝喉前庭；兩側以杓會厭皺襞連到杓狀軟骨，構成喉口邊界；吞嚥時喉上提、舌根後壓，使會厭蓋住喉口，防止食物進入氣道；感覺由喉上神經內支供應', 'In front, the valleculae separate it from the tongue root; behind, it faces the laryngeal vestibule; on each side the aryepiglottic fold runs to the arytenoid cartilage and bounds the laryngeal inlet; in swallowing the larynx rises and the tongue root presses back so that the epiglottis covers the inlet and keeps food out of the airway; its sensation comes from the internal branch of the superior laryngeal nerve'),
  },
  'arytenoid cartilage': {
    位置: e('喉的後部，環狀軟骨板上緣的外側，左右各一', 'Back of the larynx, on the upper border of the lamina of the cricoid cartilage, one on each side'),
    組成: e('成對的小型三角錐形透明軟骨，有尖端、底、前方的聲帶突與外側的肌突；底部與環狀軟骨形成環杓關節，可滑動與旋轉', 'Paired small pyramid-shaped hyaline cartilage with an apex, a base, a vocal process in front and a muscular process on the side; its base forms the cricoarytenoid joint with the cricoid, allowing gliding and rotation'),
    毗鄰: e('尖端上承小角軟骨；聲帶突連聲韌帶，肌突供環杓後肌、環杓側肌附著；外緣與會厭之間有杓會厭皺襞；其滑動與旋轉改變聲門裂的開閉與聲帶張力', 'The corniculate cartilage rests on its apex; the vocal process gives attachment to the vocal ligament and the muscular process to posterior and lateral cricoarytenoid; the aryepiglottic fold runs from it to the epiglottis; its gliding and rotation open and close the rima glottidis and alter the tension of the vocal fold'),
  },
  'corniculate cartilage': {
    位置: e('喉的後上部，各位於一側杓狀軟骨的尖端之上', 'Back and upper part of the larynx, each sitting on the apex of the arytenoid cartilage of its side'),
    組成: e('成對的微小圓錐形彈性軟骨，形成小而尖的小角', 'Paired tiny conical pieces of elastic cartilage, forming a small pointed horn'),
    毗鄰: e('位在杓會厭皺襞後端，皺襞隆起處稱小角結節；左右兩側靠近喉口後緣，其間為杓間切跡', 'Lies in the back end of the aryepiglottic fold, where it raises the corniculate tubercle; the two sides lie near the posterior margin of the laryngeal inlet with the interarytenoid notch between them'),
  },
  'cuneiform cartilage': {
    位置: e('喉的上部，位於杓會厭皺襞內，在小角軟骨的前外側', 'Upper part of the larynx, within the aryepiglottic fold, in front of and lateral to the corniculate cartilage'),
    組成: e('成對的細小棒狀（楔形）彈性軟骨，不與其他軟骨形成關節', 'Paired small rod-like (wedge-shaped) pieces of elastic cartilage that do not form a joint with any other cartilage'),
    毗鄰: e('埋在杓會厭皺襞內，在黏膜下隆起形成楔狀結節；前方鄰近會厭，後方為小角軟骨；它使皺襞保持硬挺，利於維持喉口', 'Embedded in the aryepiglottic fold, raising the cuneiform tubercle under the mucosa; the epiglottis lies in front and the corniculate cartilage behind; it stiffens the fold and helps keep the laryngeal inlet open'),
  },
  'common carotid artery': {
    來源: e('右側起自頭臂動脈幹，左側直接起自主動脈弓', 'On the right from the brachiocephalic trunk, on the left directly from the aortic arch'),
    走向: e('在頸部沿氣管與食道外側上行，與內頸靜脈、迷走神經同包在頸動脈鞘內，走在胸鎖乳突肌深面；約在第三至第四頸椎（C3–C4）高度，接近甲狀軟骨上緣至舌骨之間，分為內、外頸動脈，分叉處略膨大為頸動脈竇', 'Ascends in the neck beside the trachea and oesophagus, enclosed with the internal jugular vein and vagus nerve in the carotid sheath, deep to sternocleidomastoid; at about the level of C3–C4, between the upper border of the thyroid cartilage and the hyoid bone, it divides into the internal and external carotid arteries, with a slight dilatation at the fork, the carotid sinus'),
    主要分支: e('通常不發出分支；末端分為內頸動脈與外頸動脈', 'Usually gives off no branches; it ends by dividing into the internal and external carotid arteries'),
    供應範圍: e('以兩條終末分支供應頭與頸；分叉處的頸動脈竇有壓力感受器，頸動脈體有化學感受器', 'Supplies the head and neck through its two terminal branches; the carotid sinus at the fork holds baroreceptors and the carotid body holds chemoreceptors'),
  },
  'external carotid artery': {
    來源: e('總頸動脈在甲狀軟骨上緣附近分叉的前內側終支', 'The front-medial terminal branch of the common carotid artery, at about the upper border of the thyroid cartilage'),
    走向: e('起初在內頸動脈前內側，繼而轉到其外側上行，經二腹肌後腹與莖突舌骨肌深面，穿入腮腺；在下頜頸後方分為上頜動脈與淺顳動脈兩終支', 'At first in front of and medial to the internal carotid, it then crosses to its lateral side and ascends deep to the posterior belly of digastric and stylohyoid, entering the parotid gland; behind the neck of the mandible it ends as the maxillary and superficial temporal arteries'),
    主要分支: e('由下而上依序有上甲狀腺動脈、升咽動脈、舌動脈、面動脈、枕動脈、耳後動脈，終支為上頜動脈與淺顳動脈', 'From below upward: superior thyroid, ascending pharyngeal, lingual, facial, occipital and posterior auricular arteries, ending as the maxillary and superficial temporal arteries'),
    供應範圍: e('頸前部、甲狀腺與喉、舌與口腔、顏面、頭皮、咽與扁桃體、顱底外面與硬腦膜、上下頜骨與牙齒及鼻腔（頭頸除眼、腦以外的大部分）', 'The front of the neck, thyroid gland and larynx, tongue and mouth, face, scalp, pharynx and tonsil, the outside of the skull base and the dura mater, the jaws and teeth and the nasal cavity (most of the head and neck except the eye and brain)'),
  },
  'internal carotid artery': {
    來源: e('總頸動脈在甲狀軟骨上緣附近分叉的後外側終支', 'The back-lateral terminal branch of the common carotid artery, at about the upper border of the thyroid cartilage'),
    走向: e('頸部沒有分支，沿咽側壁上行至顱底，經頸動脈管入顱，穿過海綿竇，在視神經外側穿出硬腦膜，分成前大腦動脈與中大腦動脈', 'Gives no branches in the neck; it climbs beside the pharynx to the base of the skull, enters through the carotid canal, passes through the cavernous sinus, pierces the dura lateral to the optic nerve and divides into the anterior and middle cerebral arteries'),
    主要分支: e('眼動脈、後交通支、前脈絡叢動脈，終支為前大腦動脈與中大腦動脈', 'Ophthalmic, posterior communicating and anterior choroidal arteries, ending as the anterior and middle cerebral arteries'),
    供應範圍: e('眼球與眼眶、大腦前部與大部分大腦半球外側面（並參與組成腦底動脈環）', 'The eye and orbit, the front part of the brain and most of the lateral surface of the cerebral hemisphere (and it contributes to the arterial circle at the base of the brain)'),
  },
  'inferior thyroid artery': {
    來源: e('通常起自鎖骨下動脈的甲狀頸動脈幹；少數可直接由鎖骨下動脈發出', 'Usually from the thyrocervical trunk of the subclavian artery; occasionally directly from the subclavian artery'),
    走向: e('先向上行，在第六頸椎高度彎向內側，經頸動脈鞘後方（總頸動脈深面）抵達甲狀腺下部的後面，與喉返神經關係密切', 'Rises first, then at about the level of C6 bends medially behind the carotid sheath (deep to the common carotid artery) to reach the back of the lower thyroid gland, closely related to the recurrent laryngeal nerve'),
    主要分支: e('升支（供應副甲狀腺）、下支，以及到咽、食道、氣管與喉下部的小分支', 'Ascending branch (to the parathyroid glands), inferior branch, and small branches to the pharynx, oesophagus, trachea and lower larynx'),
    供應範圍: e('甲狀腺下部、副甲狀腺、喉下部、氣管與食道頸段', 'Lower part of the thyroid gland, the parathyroid glands, the lower larynx, and the cervical parts of the trachea and oesophagus'),
  },
  'ophthalmic artery': {
    來源: e('內頸動脈在穿出海綿竇、剛入蛛網膜下腔處發出的第一條主要分支', 'A branch of the internal carotid artery given off just after it leaves the cavernous sinus, where it enters the subarachnoid space'),
    走向: e('與視神經一同經視神經管入眶，起初在視神經外下方，再越過其上方向內側走，沿眶內側壁前行', 'Enters the orbit with the optic nerve through the optic canal, lying first below and lateral to the nerve, then crossing above it toward the medial side and running forward along the medial wall of the orbit'),
    主要分支: e('視網膜中央動脈、睫狀後短與長動脈、淚腺動脈、篩前與篩後動脈、眶上動脈、滑車上動脈、鼻背動脈', 'Central artery of the retina, short and long posterior ciliary arteries, lacrimal artery, anterior and posterior ethmoidal arteries, supra-orbital artery, supratrochlear artery and dorsal nasal artery'),
    供應範圍: e('眼球、眼外肌、淚腺、眼瞼，以及額部皮膚、鼻背與篩竇、鼻腔上部', 'The eyeball, extra-ocular muscles, lacrimal gland and eyelids, plus the skin of the forehead, the nasal dorsum, the ethmoidal sinuses and upper nasal cavity'),
  },
});
// ===== B06 end =====

// Head-and-neck cranial and trigeminal-branch nerves (card batch B01). Standard anatomy only; fields we are not sure of stay out.
Object.assign(CARD_EXTRAS, {
  'facial nerve (vii)': {
    來源: e('第七對腦神經，自腦橋與延髓交界處外側出腦，含運動、感覺與副交感纖維', 'Cranial nerve VII, leaving the brainstem at the pontomedullary junction; carries motor, sensory and parasympathetic fibres'),
    走向: e('與前庭耳蝸神經同入內耳道，穿過顳骨內的顏面神經管，由莖乳突孔出顱；進入腮腺後分成顳支、顴支、頰支、下頜緣支與頸支；鼓索神經在顏面神經管內分出，之後與舌神經會合', 'Enters the internal acoustic meatus with the vestibulocochlear nerve, runs through the facial canal of the temporal bone and exits at the stylomastoid foramen; within the parotid gland it divides into temporal, zygomatic, buccal, marginal mandibular and cervical branches; the chorda tympani leaves it in the facial canal and later joins the lingual nerve'),
    支配範圍: e('運動：顏面表情肌（頸支支配闊頸肌）、莖突舌骨肌、二腹肌後腹、鐙骨肌；感覺：舌前三分之二的味覺；副交感：淚腺、頜下腺、舌下腺', 'Motor to the muscles of facial expression (the cervical branch supplies platysma), stylohyoid, posterior belly of digastric and stapedius; taste of the front two-thirds of the tongue; parasympathetic to the lacrimal, submandibular and sublingual glands'),
  },
  'trigeminal nerve (v)': {
    來源: e('第五對腦神經，自腦橋外側面出腦，有較粗的感覺根與較細的運動根', 'Cranial nerve V, leaving the lateral pons with a large sensory root and a small motor root'),
    走向: e('感覺根連到顳骨岩部尖端的三叉神經節，再分成眼神經、上頜神經與下頜神經三支；運動根繞過神經節下方，只加入下頜神經', 'The sensory root joins the trigeminal ganglion at the apex of the petrous temporal bone and divides into the ophthalmic, maxillary and mandibular nerves; the motor root passes beneath the ganglion and joins only the mandibular nerve'),
    支配範圍: e('臉部與前頭皮膚、口腔與鼻腔黏膜、牙齒與硬腦膜的一般感覺；運動（經下頜神經）支配咀嚼肌（咬肌、顳肌、內翼肌、外翼肌）、下頜舌骨肌、二腹肌前腹、張顎帆肌與鼓膜張肌', 'General sensation of the facial and frontal skin, oral and nasal mucosa, teeth and dura mater; motor (through the mandibular nerve) to the muscles of mastication (masseter, temporalis, medial and lateral pterygoids), mylohyoid, the anterior belly of digastric, tensor veli palatini and tensor tympani'),
  },
  'ophthalmic nerve': {
    來源: e('三叉神經第一支（V1），由三叉神經節前內側發出', 'First division of the trigeminal nerve (V1), arising from the anteromedial part of the trigeminal ganglion'),
    走向: e('向前走在海綿竇外側壁，於眶上裂附近分成淚神經、額神經與鼻睫神經，經眶上裂入眼眶；額神經在眶內向前，延續為眶上神經，穿眶上孔到前額', 'Runs forward in the lateral wall of the cavernous sinus, divides near the superior orbital fissure into the lacrimal, frontal and nasociliary nerves, and enters the orbit through the fissure; the frontal nerve runs forward in the orbit and continues as the supra-orbital nerve through the supra-orbital foramen to the forehead'),
    支配範圍: e('純感覺：前額與頭頂前部皮膚、上眼瞼、鼻背與鼻尖、角膜與眼球、淚腺、鼻腔上部黏膜', 'Purely sensory: skin of the forehead and anterior scalp, upper eyelid, dorsum and tip of the nose, cornea and eyeball, lacrimal gland and the upper nasal mucosa'),
  },
  'maxillary nerve': {
    來源: e('三叉神經第二支（V2），由三叉神經節中部發出', 'Second division of the trigeminal nerve (V2), arising from the middle of the trigeminal ganglion'),
    走向: e('經海綿竇外側壁，在圓孔前先分出腦膜支，再由圓孔出顱入翼顎窩；在翼顎窩分出顴神經與後上齒槽神經，並與翼顎神經節相連；之後穿眶下裂進入眼眶，延續為眶下神經，途中發出中上（部分人有）與前上齒槽神經，最後由眶下孔到達臉部', 'Passes through the lateral wall of the cavernous sinus, gives a meningeal branch before the foramen rotundum, then leaves the skull by it into the pterygopalatine fossa; there it gives the zygomatic and posterior superior alveolar nerves and is connected to the pterygopalatine ganglion; it then enters the orbit through the inferior orbital fissure as the infra-orbital nerve, which gives middle (present in some people) and anterior superior alveolar branches on its way and reaches the face at the infra-orbital foramen'),
    支配範圍: e('純感覺：下眼瞼、鼻側與上唇間的臉部皮膚、顴部與顳部前方皮膚、上排牙齒與牙齦、上頜竇、鼻腔與硬顎黏膜', 'Purely sensory: facial skin between the lower eyelid and upper lip, skin of the cheek bone and anterior temple, upper teeth and gingiva, maxillary sinus, nasal cavity and palatal mucosa'),
  },
  'mental nerve': {
    來源: e('下齒槽神經的終末分支之一', 'A terminal branch of the inferior alveolar nerve'),
    走向: e('下齒槽神經在下頜管內前行，於小臼齒附近分成頦神經與切牙神經；頦神經由頦孔穿出，向上分布於下唇與頦部', 'The inferior alveolar nerve divides in the mandibular canal near the premolars into the mental and incisive nerves; the mental nerve emerges through the mental foramen and spreads to the lower lip and chin'),
    支配範圍: e('純感覺：下唇與頦部的皮膚、下唇黏膜與前牙區唇側牙齦', 'Purely sensory: skin of the lower lip and chin, mucosa of the lower lip and the labial gingiva of the anterior teeth'),
  },
  'buccal nerve': {
    來源: e('下頜神經前股的感覺分支（三叉神經 V3）', 'Sensory branch of the anterior division of the mandibular nerve (trigeminal V3)'),
    走向: e('自顳下窩由外翼肌兩個頭之間穿出，沿頰肌表面向前下行，分支穿過頰肌到達口腔', 'Emerges in the infratemporal fossa between the two heads of lateral pterygoid, runs forward and downward over buccinator, and sends branches through it into the mouth'),
    支配範圍: e('頰部皮膚與頰內側黏膜、下排後牙頰側牙齦的一般感覺；不支配頰肌，頰肌屬顏面神經運動支配', 'General sensation of the skin of the cheek, the lining of the cheek and the buccal gingiva of the lower posterior teeth; it does not supply buccinator, which receives facial nerve motor fibres'),
  },
  'glossopharyngeal nerve (ix)': {
    來源: e('第九對腦神經，自延髓橄欖後方上部出腦', 'Cranial nerve IX, leaving the medulla behind the upper part of the olive'),
    走向: e('與迷走神經、副神經一同經頸靜脈孔出顱，伴著莖突咽肌下行並繞到其外側，穿過上、中咽縮肌之間進入咽壁，再向前至舌根', 'Leaves the skull through the jugular foramen with the vagus and accessory nerves, descends with stylopharyngeus and winds around its lateral side, passes between the superior and middle pharyngeal constrictors into the pharyngeal wall and continues forward to the root of the tongue'),
    支配範圍: e('運動：莖突咽肌；感覺：舌後三分之一的一般感覺與味覺、咽黏膜、軟顎與扁桃體、中耳、頸動脈竇與頸動脈體；副交感：經耳神經節到腮腺', 'Motor to stylopharyngeus; general sensation and taste from the posterior third of the tongue, pharyngeal mucosa, soft palate and tonsil, middle ear, carotid sinus and carotid body; parasympathetic to the parotid gland via the otic ganglion'),
  },
  'vagus nerve (x)': {
    來源: e('第十對腦神經，自延髓橄欖後方出腦，位於舌咽神經下方', 'Cranial nerve X, leaving the medulla behind the olive, below the glossopharyngeal nerve'),
    走向: e('經頸靜脈孔出顱，出孔後略下方有下神經節；在頸部走於頸動脈鞘內，位於頸內靜脈與頸動脈之間的後方，並在此分出咽支與上喉神經（再分外支與內支）；之後入胸腔，喉返神經由此分出並上行回到喉部；主幹經肺根後方成為食道叢，隨食道穿過橫膈進入腹腔', 'Leaves the skull via the jugular foramen, with the inferior ganglion just below it; descends in the carotid sheath behind and between the internal jugular vein and the carotid artery, giving the pharyngeal branch and the superior laryngeal nerve (external and internal branches) in the neck; the recurrent laryngeal nerve arises in the thorax and returns upward to the larynx; the trunk passes behind the lung root to form the oesophageal plexus and accompanies the oesophagus through the diaphragm into the abdomen'),
    支配範圍: e('運動：咽肌（莖突咽肌除外）、喉肌（外支支配環甲肌，喉返神經支配其餘喉內肌）、軟顎肌肉（張顎帆肌除外）；副交感：心、肺及消化道大部分；感覺：咽喉黏膜、內臟及部分外耳道皮膚', 'Motor to the pharyngeal muscles except stylopharyngeus, the laryngeal muscles (the external branch supplies cricothyroid, the recurrent laryngeal nerve the other intrinsic muscles) and the soft palate muscles except tensor veli palatini; parasympathetic to the heart, lungs and most of the gut; sensory from the pharyngeal and laryngeal mucosa, viscera and part of the external acoustic meatus'),
  },
  'hypoglossal nerve (xii)': {
    來源: e('第十二對腦神經，自延髓錐體與橄欖之間的前外側溝出腦', 'Cranial nerve XII, leaving the medulla in the anterolateral sulcus between the pyramid and the olive'),
    走向: e('經舌下神經管出顱，在頸部先走於頸內動脈與頸內靜脈之間，再弓形向前越過頸動脈淺面，經二腹肌後腹深面進入下頜下三角，沿舌骨舌肌外側入舌', 'Leaves the skull through the hypoglossal canal, descends between the internal carotid artery and internal jugular vein, arches forward over the carotid arteries, passes deep to the posterior belly of digastric into the submandibular triangle and enters the tongue lateral to hyoglossus'),
    支配範圍: e('運動支配舌的所有內在肌，以及舌骨舌肌、頦舌肌、莖突舌肌；顎舌肌除外，由迷走神經支配；另攜帶第一頸神經（C1）纖維，分布到頦舌骨肌與甲狀舌骨肌', 'Motor to all intrinsic muscles of the tongue and to hyoglossus, genioglossus and styloglossus; palatoglossus is excluded and is supplied by the vagus nerve; it also carries C1 fibres that leave it to supply geniohyoid and thyrohyoid'),
  },
  'anterior division of mandibular nerve': {
    來源: e('下頜神經（V3）出卵圓孔後，在顳下窩分出的較小前股', 'The smaller anterior division of the mandibular nerve (V3), given off in the infratemporal fossa after it leaves the foramen ovale'),
    走向: e('在外翼肌深面前行，分出咬肌神經、顳深神經、外翼肌神經等運動支，以及感覺性的頰神經', 'Runs forward deep to lateral pterygoid and gives the motor masseteric, deep temporal and lateral pterygoid nerves plus the sensory buccal nerve'),
    支配範圍: e('以運動為主：咬肌、顳肌、外翼肌；經頰神經帶來頰部的感覺', 'Mainly motor to masseter, temporalis and lateral pterygoid; the buccal nerve carries sensation from the cheek'),
  },
  'posterior division of mandibular nerve': {
    來源: e('下頜神經（V3）在顳下窩分出的較大後股', 'The larger posterior division of the mandibular nerve (V3), given off in the infratemporal fossa'),
    走向: e('在外翼肌深面下行，分為耳顳神經、舌神經與下齒槽神經三條主要分支', 'Descends deep to lateral pterygoid and divides into the auriculotemporal, lingual and inferior alveolar nerves'),
    支配範圍: e('以感覺為主：耳前與顳部皮膚、外耳道、顳顎關節、舌前三分之二的一般感覺、下排牙齒、下唇與頦部；耳顳神經另帶舌咽神經的副交感纖維（經耳神經節）到腮腺；經下頜舌骨肌神經支配下頜舌骨肌與二腹肌前腹', 'Mostly sensory to the skin in front of the ear and temple, the external acoustic meatus and the temporomandibular joint, general sensation of the front two-thirds of the tongue, the lower teeth, lower lip and chin; the auriculotemporal nerve also carries glossopharyngeal parasympathetic fibres (via the otic ganglion) to the parotid gland; the nerve to mylohyoid supplies mylohyoid and the anterior belly of digastric'),
  },
  'inferior alveolar nerve': {
    來源: e('下頜神經後股最粗的分支', 'The largest branch of the posterior division of the mandibular nerve'),
    走向: e('在內翼肌與下頜支之間下行，經下頜孔入下頜管，沿下牙根下方前行，於頦孔附近分成頦神經與切牙神經；入孔前先分出下頜舌骨肌神經', 'Descends between medial pterygoid and the mandibular ramus, enters the mandibular canal via the mandibular foramen, runs below the tooth roots and divides near the mental foramen into the mental and incisive nerves; the nerve to mylohyoid leaves it before it enters the foramen'),
    支配範圍: e('下排牙齒與牙周組織的感覺；經頦神經支配下唇與頦部；經下頜舌骨肌神經運動支配下頜舌骨肌與二腹肌前腹', 'Sensation of the lower teeth and periodontium; the mental nerve supplies the lower lip and chin; the nerve to mylohyoid is motor to mylohyoid and the anterior belly of digastric'),
  },
  'nerve to mylohyoid muscle': {
    來源: e('下齒槽神經在進入下頜孔之前分出的運動支', 'A motor branch of the inferior alveolar nerve given off just before it enters the mandibular foramen'),
    走向: e('沿下頜支內面的下頜舌骨肌溝向下前行，再走在下頜舌骨肌的下面', 'Runs down and forward in the mylohyoid groove on the inner surface of the mandible, then along the lower surface of mylohyoid'),
    支配範圍: e('運動支配下頜舌骨肌與二腹肌前腹', 'Motor to mylohyoid and the anterior belly of digastric'),
  },
});
