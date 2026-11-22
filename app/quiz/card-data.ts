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
    走向: e('是上頜神經中唯一在圓孔之前就分出的分支，向後外方進入中顱窩的硬腦膜，與中腦膜動脈同行', 'The only branch of the maxillary nerve that leaves it before the foramen rotundum; it turns into the dura mater of the middle cranial fossa and accompanies the middle meningeal artery'),
    支配範圍: e('中顱窩的硬腦膜（以前部為主）的一般感覺；純感覺', 'General sensation of the dura mater of the middle cranial fossa, mainly its front part; purely sensory'),
  },
  'lacrimal nerve': {
    來源: e('眼神經（V1）三條分支中最外側、最細的一條，在上眶裂附近分出', 'The most lateral and smallest of the three branches of the ophthalmic nerve (V1), arising near the superior orbital fissure'),
    走向: e('經上眶裂、在總腱環之外進入眼眶，沿外直肌上緣向前外行到淚腺；途中接受顴神經（V2）的交通支', 'Enters the orbit via the superior orbital fissure, lying outside the common tendinous ring, and runs forward along the upper border of lateral rectus to the lacrimal gland; on the way it receives a communicating branch from the zygomatic nerve (V2)'),
    支配範圍: e('淚腺、鄰近結膜與上眼瞼外側皮膚的一般感覺；顴神經交通支帶來翼顎神經節的副交感節後纖維，經它到達淚腺，促進淚液分泌', 'General sensation of the lacrimal gland, the adjacent conjunctiva and the skin of the lateral upper eyelid; the communicating branch from the zygomatic nerve carries postganglionic parasympathetic fibres from the pterygopalatine ganglion that stimulate tear secretion'),
  },
  'abducens nerve (vi)': {
    來源: e('第六對腦神經，由腦橋的外旋神經核發出，在腦橋與延腦之間的橋延溝出腦', 'Cranial nerve VI, arising from the abducens nucleus of the pons and leaving the brainstem at the pontomedullary groove'),
    走向: e('向前上方行，斜行爬過顳骨岩部尖端上緣進入海綿竇，在竇腔內緊貼頸內動脈外側前行；再經上眶裂、在總腱環之內入眼眶，從內側面進入外直肌', 'Runs forward and upward, over the apex of the petrous temporal bone into the cavernous sinus, where it lies lateral to the internal carotid artery within the sinus; it then enters the orbit through the superior orbital fissure inside the common tendinous ring and reaches the medial surface of lateral rectus'),
    支配範圍: e('運動支配外直肌，使眼球外展；受損時眼球無法外展，向內偏斜並出現複視', 'Motor to lateral rectus only, which abducts the eyeball; a lesion leaves the eye turned inward and causes double vision'),
  },
  'oculomotor nerve (iii)': {
    來源: e('第三對腦神經，起自中腦的動眼神經核（運動）與動眼神經副核（副交感），由腳間窩出腦', 'Cranial nerve III, arising from the oculomotor nucleus (motor) and the accessory (parasympathetic) nucleus of the midbrain and leaving at the interpeduncular fossa'),
    走向: e('穿過後大腦動脈與上小腦動脈之間向前，進入海綿竇外側壁最上方，經上眶裂、在總腱環之內入眼眶，隨即分成上支與下支', 'Passes between the posterior cerebral and superior cerebellar arteries, enters the uppermost part of the lateral wall of the cavernous sinus, then enters the orbit through the superior orbital fissure inside the common tendinous ring and divides into a superior and an inferior branch'),
    支配範圍: e('運動支配提上眼瞼肌、上直肌、內直肌、下直肌與下斜肌（上斜肌由滑車神經、外直肌由外旋神經支配）；副交感節前纖維經下支到睫狀神經節，控制睫狀肌（調焦）與瞳孔括約肌（縮瞳）', 'Motor to levator palpebrae superioris, superior, medial and inferior recti and inferior oblique (superior oblique is supplied by the trochlear nerve and lateral rectus by the abducens); parasympathetic preganglionic fibres go through the inferior branch to the ciliary ganglion for the ciliary muscle (accommodation) and sphincter pupillae (constriction)'),
  },
  'trochlear nerve (iv)': {
    來源: e('第四對腦神經，起自中腦的滑車神經核，纖維在腦幹內交叉後，自中腦背側（下丘下方）出腦；是唯一從腦幹背面出腦的腦神經', 'Cranial nerve IV, arising from the trochlear nucleus of the midbrain; its fibres cross within the brainstem and leave on the dorsal surface below the inferior colliculus, the only cranial nerve to emerge dorsally'),
    走向: e('繞過大腦腳外側向前，進入海綿竇外側壁（位在動眼神經下方），經上眶裂、在總腱環之外入眼眶，越過提上眼瞼肌上方向內行，到上斜肌；顱內行程在腦神經中最長', 'Winds around the cerebral peduncle, enters the lateral wall of the cavernous sinus below the oculomotor nerve, passes via the superior orbital fissure, lying outside the common tendinous ring, crosses above levator palpebrae superioris and reaches superior oblique; it has the longest intracranial course of the cranial nerves'),
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
    走向: e('經上眶裂、在總腱環之內入眼眶，從外側向內跨過視神經上方，沿眼眶內側壁前行；依序分出到睫狀神經節的感覺根、長睫神經、後篩神經與前篩神經，終末延續為滑車下神經；短睫神經則由睫狀神經節發出，內含它的感覺纖維', 'Enters the orbit through the superior orbital fissure inside the common tendinous ring, crosses above the optic nerve from lateral to medial and runs along the medial orbital wall; it gives the sensory root of the ciliary ganglion and the long ciliary, posterior ethmoidal and anterior ethmoidal nerves and ends as the infratrochlear nerve; the short ciliary nerves arise from the ciliary ganglion and contain its sensory fibres'),
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
    走向: e('經上眶裂、在總腱環之外入眼眶，沿提上眼瞼肌上表面與眶頂骨膜之間向前，約在眼眶中部分成眶上神經與滑車上神經', 'Enters the orbit via the superior orbital fissure, lying outside the common tendinous ring, runs forward between the roof periosteum and levator palpebrae superioris and divides about the middle of the orbit into the supra-orbital and supratrochlear nerves'),
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
    來源: e('動眼神經（III）在上眶裂內、總腱環之內分出的較細上支', 'The smaller upper division of the oculomotor nerve (III), given off at the superior orbital fissure within the common tendinous ring'),
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
    毗鄰: e('位於頸前部皮下，僅被皮膚與淺筋膜覆蓋；兩側有環甲肌，後方為喉腔；環甲動脈沿其上部橫過', 'Lies just beneath the skin and superficial fascia at the front of the neck, with the cricothyroid muscles at each side and the laryngeal cavity behind; the cricothyroid artery crosses along its upper part'),
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
    位置: e('眶尖，圍繞視神經管與上眶裂的中段', 'Apex of the orbit, surrounding the optic canal and the middle part of the superior orbital fissure'),
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
    主要標誌: e('體（蝶竇、蝶鞍與垂體窩）、小翼（視神經管、前床突）、鞍背、大翼（圓孔、卵圓孔、棘孔）、翼突（內側板與外側板）、上眶裂、蝶棘', 'Body (sphenoidal sinus, sella turcica and hypophysial fossa), lesser wing (optic canal, anterior clinoid process), dorsum sellae, greater wing (foramen rotundum, foramen ovale, foramen spinosum), pterygoid process (medial and lateral plates), superior orbital fissure and spine of the sphenoid'),
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
    主要標誌: e('頂結節、上顳線與下顳線；四個緣（矢狀緣、冠狀緣、人字緣、鱗緣）；內面有中腦膜動脈溝與上矢狀竇溝', 'Parietal eminence, superior and inferior temporal lines; four borders (sagittal, frontal, occipital and squamosal); on the inner surface the groove for the middle meningeal artery and the groove for the superior sagittal sinus'),
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
    主要分支: e('由下而上依序有上甲狀腺動脈、升咽動脈、舌動脈、顏面動脈、枕動脈、後耳動脈，終支為上頜動脈與淺顳動脈', 'From below upward: superior thyroid, ascending pharyngeal, lingual, facial, occipital and posterior auricular arteries, ending as the maxillary and superficial temporal arteries'),
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
    走向: e('向前走在海綿竇外側壁，於上眶裂附近分成淚神經、額神經與鼻睫神經，經上眶裂入眼眶；額神經在眶內向前，延續為眶上神經，穿眶上孔到前額', 'Runs forward in the lateral wall of the cavernous sinus, divides near the superior orbital fissure into the lacrimal, frontal and nasociliary nerves, and enters the orbit through the fissure; the frontal nerve runs forward in the orbit and continues as the supra-orbital nerve through the supra-orbital foramen to the forehead'),
    支配範圍: e('純感覺：前額與頭頂前部皮膚、上眼瞼、鼻背與鼻尖、角膜與眼球、淚腺、鼻腔上部黏膜', 'Purely sensory: skin of the forehead and anterior scalp, upper eyelid, dorsum and tip of the nose, cornea and eyeball, lacrimal gland and the upper nasal mucosa'),
  },
  'maxillary nerve': {
    來源: e('三叉神經第二支（V2），由三叉神經節中部發出', 'Second division of the trigeminal nerve (V2), arising from the middle of the trigeminal ganglion'),
    走向: e('經海綿竇外側壁，在圓孔前先分出腦膜支，再由圓孔出顱入翼顎窩；在翼顎窩分出顴神經與後上齒槽神經，並與翼顎神經節相連；之後穿下眶裂進入眼眶，延續為眶下神經，途中發出中上（部分人有）與前上齒槽神經，最後由眶下孔到達臉部', 'Passes through the lateral wall of the cavernous sinus, gives a meningeal branch before the foramen rotundum, then leaves the skull by it into the pterygopalatine fossa; there it gives the zygomatic and posterior superior alveolar nerves and is connected to the pterygopalatine ganglion; it then enters the orbit through the inferior orbital fissure as the infra-orbital nerve, which gives middle (present in some people) and anterior superior alveolar branches on its way and reaches the face at the infra-orbital foramen'),
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
    走向: e('經頸靜脈孔出顱，出孔後略下方有下神經節；在頸部走於頸動脈鞘內，位於頸內靜脈與頸動脈之間的後方，並在此分出咽支與上喉神經（再分外支與內支）；右迷走神經在頸根部分出右喉返神經，勾繞右鎖骨下動脈後上行回到喉部；左迷走神經則入胸腔，在主動脈弓處分出左喉返神經，勾繞主動脈弓後上行；主幹經肺根後方成為食道叢，隨食道穿過橫膈進入腹腔', 'Leaves the skull via the jugular foramen, with the inferior ganglion just below it; descends in the carotid sheath behind and between the internal jugular vein and the carotid artery, giving the pharyngeal branch and the superior laryngeal nerve (external and internal branches) in the neck; on the right the recurrent laryngeal nerve arises at the root of the neck, hooks under the right subclavian artery and ascends to the larynx, while on the left it arises in the thorax at the aortic arch, hooks under the arch and ascends; the trunk passes behind the lung root to form the oesophageal plexus and accompanies the oesophagus through the diaphragm into the abdomen'),
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

// ===== C01 begin: stomach and duodenum parts (card batch C01). Standard anatomy only; a field we are not sure of stays out. =====
Object.assign(CARD_EXTRAS, {
  'stomach': {
    位置: e('腹腔左上部，介於食道與十二指腸之間，大部分在左季肋區與上腹部；入口（賁門）約在第十一胸椎高度，出口（幽門）約在第一腰椎的幽門平面，略偏右', 'Left upper abdomen between the oesophagus and the duodenum, mostly in the left hypochondrium and epigastrium; the inlet (cardia) lies at about T11 and the outlet (pylorus) at about L1 on the transpyloric plane, a little right of the midline'),
    組成: e('J 形的中空肌性囊袋，可依充盈程度改變形狀；分賁門、胃底、胃體與幽門部，另有胃小彎、胃大彎兩緣；壁的肌層有三層（斜、環、縱），黏膜在空胃時形成皺襞', 'J-shaped hollow muscular bag whose shape changes with filling; divided into cardia, fundus, body and pyloric part, with lesser and greater curvatures; the muscle coat has three layers (oblique, circular, longitudinal) and the mucosa forms rugae when empty'),
    毗鄰: e('前面鄰橫膈、前腹壁與肝左葉；後面為網膜囊，其後依序有胰、脾動脈、左腎與左腎上腺、脾，構成胃床；上方連食道，下方續十二指腸；小彎連小網膜，大彎連大網膜', 'In front, the diaphragm and anterior abdominal wall and the left lobe of the liver; behind lies the lesser sac and, beyond it, the pancreas, splenic artery, left kidney and suprarenal gland and the spleen, which form the stomach bed; the oesophagus enters above and the duodenum continues below; the lesser omentum is attached to the lesser curvature and the greater omentum to the greater curvature'),
    血液供應: e('皆源自腹腔動脈幹：小彎有左胃動脈與右胃動脈相吻合；大彎有左、右胃網膜動脈相吻合；胃底由脾動脈的短胃動脈與後胃動脈供應；靜脈最後注入肝門靜脈系統', 'All from the coeliac trunk: the left and right gastric arteries anastomose along the lesser curvature; the left and right gastro-omental arteries anastomose along the greater curvature; the fundus receives short gastric and posterior gastric arteries from the splenic artery; the veins drain into the portal system'),
    神經支配: e('副交感來自迷走神經的前幹與後幹，促進蠕動與分泌；交感纖維經腹腔叢隨動脈到胃，抑制蠕動並使幽門收縮；痛覺循交感路徑傳入，常表現為上腹部疼痛', 'Parasympathetic supply from the anterior and posterior vagal trunks, increasing motility and secretion; sympathetic fibres reach the stomach from the coeliac plexus along the arteries, inhibiting motility and tightening the pylorus; pain travels with the sympathetic pathway and is felt in the epigastrium'),
  },
  'fundus of stomach': {
    位置: e('胃的最上部，在賁門水平以上向左上方膨出的圓頂，頂端貼著左側橫膈穹窿，約在第五肋間隙的高度', 'Uppermost part of the stomach, the dome bulging up and to the left above the level of the cardia, in contact with the left dome of the diaphragm at about the level of the fifth intercostal space'),
    組成: e('與胃體相連、沒有明確的外在界線；常含吞入的氣體，站立時在腹部 X 光上呈現胃泡；黏膜與胃體相同，富含分泌胃酸與消化酶的胃腺', 'Continuous with the body without a sharp external boundary; usually holds swallowed air, seen as the gastric bubble on an upright abdominal film; its mucosa is the same as the body, rich in glands secreting acid and digestive enzymes'),
    毗鄰: e('上方與後外側隔著橫膈鄰接左肺底與心臟；後方鄰脾（胃脾韌帶相連）；內側為賁門切跡與食道腹段', 'Above and posterolaterally, the diaphragm separates it from the base of the left lung and the heart; behind lies the spleen, joined by the gastrosplenic ligament; medially lie the cardial notch and the abdominal oesophagus'),
    血液供應: e('主要來自脾動脈發出的短胃動脈與後胃動脈，並有左胃動脈上部分支參與', 'Mainly the short gastric and posterior gastric arteries from the splenic artery, with contributions from upper branches of the left gastric artery'),
  },
  'body of stomach': {
    位置: e('胃的主體，上接胃底，向下延伸到胃角切跡的水平，約占胃的大部分容積', 'Main part of the stomach, continuous above with the fundus and extending down to the level of the angular incisure; it holds most of the stomach contents'),
    組成: e('黏膜有縱行的皺襞，胃腺含壁細胞（分泌鹽酸與內在因子）與主細胞（分泌胃蛋白酶原）；肌層分斜、環、縱三層', 'Mucosa with longitudinal rugae; the glands contain parietal cells (hydrochloric acid and intrinsic factor) and chief cells (pepsinogen); the muscle coat has oblique, circular and longitudinal layers'),
    毗鄰: e('右緣為胃小彎，左緣為胃大彎；前面貼肝左葉與前腹壁；後面隔網膜囊鄰胰、左腎與脾動脈', 'Its right border is the lesser curvature and its left border the greater curvature; the front lies against the left lobe of the liver and the anterior abdominal wall; behind, across the lesser sac, lie the pancreas, left kidney and splenic artery'),
    血液供應: e('小彎側為左、右胃動脈；大彎側為左、右胃網膜動脈', 'Left and right gastric arteries on the lesser curvature side; left and right gastro-omental arteries on the greater curvature side'),
  },
  'cardia (cardial orifice)': {
    位置: e('食道腹段進入胃的開口及其周圍的胃壁，位在胃的上內側，約在第十一胸椎高度、正中線左側，對著第七肋軟骨後方', 'Opening where the abdominal oesophagus enters the stomach, with the surrounding rim of gastric wall at the upper medial part of the stomach, at about T11 and left of the midline, behind the seventh costal cartilage'),
    組成: e('沒有單獨的解剖性括約肌；防止胃內容物逆流靠下食道括約肌的功能、橫膈食道裂孔的右膈腳、食道斜行穿過胃壁的瓣狀作用與賁門切跡所成的銳角共同作用', 'No separate anatomical sphincter; reflux is prevented by the lower oesophageal sphincter mechanism, the right crus of the diaphragm around the oesophageal hiatus, the flap-like oblique entry of the oesophagus into the stomach wall and the sharp angle of the cardial notch'),
    毗鄰: e('上方為食道裂孔與橫膈，前方鄰肝左葉，後方為主動脈與左膈腳；周圍有食道叢發出的迷走神經前、後幹到達', 'Above lie the oesophageal hiatus and diaphragm; the left lobe of the liver is in front and the aorta and left crus behind; the anterior and posterior vagal trunks reach it from the oesophageal plexus'),
    血液供應: e('左胃動脈的食道支與胃支；靜脈與食道下段靜脈在此吻合，是門脈與體循環的交通部位之一', 'Oesophageal and gastric branches of the left gastric artery; its veins anastomose with those of the lower oesophagus, one of the portal-systemic connections'),
  },
  'cardial notch': {
    位置: e('食道左緣與胃底之間形成的銳角切跡，位在賁門的左側', 'Sharp notch between the left border of the oesophagus and the fundus, lying just to the left of the cardia'),
    形態: e('食道斜行進入胃，與胃底在此相交成銳角，是胃左緣上的一處凹入；胃內面對應處的黏膜皺襞與抗逆流機制有關', 'The oesophagus enters the stomach obliquely and meets the fundus at an acute angle here, making a concavity in the left border of the stomach; the mucosal fold on the inner surface at this level is related to the anti-reflux mechanism'),
    毗鄰: e('上方為橫膈與食道裂孔，其左側連續為胃大彎的起始處', 'Above it lie the diaphragm and oesophageal hiatus; to its left the greater curvature begins'),
    作用: e('保持食道與胃底之間的夾角，是抗逆流機制的一部分；夾角變鈍（如裂孔疝氣）時容易逆流', 'Keeps the angle between oesophagus and fundus, part of the anti-reflux mechanism; when the angle flattens, as in a hiatal hernia, reflux becomes easier'),
  },
  'pylorus': {
    位置: e('胃的出口部分，位在幽門平面（約第一腰椎）、正中線右側；站立時可降到第三腰椎附近', 'Outlet part of the stomach on the transpyloric plane (about L1) just right of the midline; it may sag to about L3 on standing'),
    組成: e('由幽門竇、幽門管與幽門括約肌組成；管壁肌層明顯增厚，黏膜皺襞在幽門處形成瓣狀突起', 'Made up of the pyloric antrum, the pyloric canal and the pyloric sphincter; its muscle wall is much thickened and the mucosal folds form a valve-like projection at the opening'),
    毗鄰: e('前方與上方鄰肝方形葉、膽囊與前腹壁；後方為胰頭與胃十二指腸動脈；下方連十二指腸上部', 'In front and above lie the quadrate lobe of the liver, the gallbladder and the anterior abdominal wall; behind lie the head of the pancreas and the gastroduodenal artery; below it continues into the superior part of the duodenum'),
    血液供應: e('右胃動脈與右胃網膜動脈（來自胃十二指腸動脈）', 'Right gastric artery and right gastro-omental artery (from the gastroduodenal artery)'),
    神經支配: e('迷走神經與經腹腔叢的交感纖維，與胃其他部分相同', 'Vagus nerve and sympathetic fibres through the coeliac plexus, as for the rest of the stomach'),
  },
  'pyloric antrum': {
    位置: e('幽門部的近側段，從胃角切跡向右延伸到幽門管，管腔較寬', 'Proximal part of the pyloric region, running right from the angular incisure to the pyloric canal; its lumen is wide'),
    組成: e('肌層較胃體厚，黏膜含分泌胃泌素的 G 細胞與分泌黏液的細胞，壁細胞很少', 'Muscle coat thicker than in the body; the mucosa contains gastrin-secreting G cells and mucus-secreting cells, with few parietal cells'),
    毗鄰: e('上方與前方貼肝左葉與前腹壁，後方隔網膜囊鄰胰頭與胰體', 'Above and in front it lies against the liver and anterior abdominal wall; behind, across the lesser sac, lie the head and body of the pancreas'),
    血液供應: e('右胃動脈與右胃網膜動脈', 'Right gastric and right gastro-omental arteries'),
    作用: e('研磨並混合食糜、分泌胃泌素；以推進波把食糜分批送入幽門管', 'Grinds and mixes the chyme and secretes gastrin; peristaltic waves push the chyme in portions into the pyloric canal'),
  },
  'pyloric canal': {
    位置: e('幽門部的遠側段，是連接幽門竇與十二指腸上部的狹窄管道，長約兩至三公分，末端為幽門口', 'Distal part of the pyloric region, a narrow channel about 2–3 cm long joining the pyloric antrum to the superior part of the duodenum, ending at the pyloric orifice'),
    組成: e('環肌層厚，末端增厚成幽門括約肌；內面黏膜有縱行皺襞，沿小彎處形成貫通的黏膜通路（胃管）', 'Thick circular muscle that thickens at its end into the pyloric sphincter; the mucosa bears longitudinal folds, forming a channel (gastric canal) along the lesser curvature'),
    毗鄰: e('前方貼肝方形葉與膽囊，後方為胰頭與胃十二指腸動脈，下接十二指腸上部', 'Anteriorly the quadrate lobe of the liver and the gallbladder, posteriorly the pancreatic head and the gastroduodenal artery, and below the superior part of the duodenum'),
    血液供應: e('右胃動脈與右胃網膜動脈', 'Right gastric and right gastro-omental arteries'),
  },
  'pyloric sphincter': {
    位置: e('幽門口處，位於胃與十二指腸上部之間，約在第一腰椎、正中線右側', 'At the pyloric orifice between the stomach and the superior part of the duodenum, at about L1 right of the midline'),
    組成: e('胃壁環肌層局部明顯增厚形成的環形肌；與十二指腸的環肌之間隔著一層纖維組織，縱肌與外層縱行纖維則跨過幽門連到十二指腸', 'Ring of smooth muscle formed by marked local thickening of the circular layer of the gastric wall; a layer of fibrous tissue separates it from the circular muscle of the duodenum, while the longitudinal fibres pass across the pylorus into the duodenum'),
    作用: e('控制食糜進入十二指腸的速度，一次只讓少量通過，並防止十二指腸內容物逆流回胃；迷走神經與交感神經調節其張力，先天性肥厚時會造成幼兒胃出口阻塞', 'Controls the rate at which chyme enters the duodenum, letting a little through at a time, and prevents duodenal contents from flowing back into the stomach; its tone is adjusted by the vagus and sympathetic nerves, and congenital hypertrophy obstructs the stomach outlet in infants'),
  },
  'lesser curvature of stomach': {
    位置: e('胃的右側緣與上緣，凹面向右上，自賁門起弧形向下到幽門', 'Right and upper border of the stomach, concave towards the upper right, curving down from the cardia to the pylorus'),
    形態與附著: e('胃的右上緣，短而凹，最低點為胃角切跡；小網膜（肝胃韌帶）附著於此緣，向上連到肝', 'The short concave right-upper border of the stomach, lowest at the angular incisure; the lesser omentum (hepatogastric ligament) attaches along it and runs up to the liver'),
    毗鄰: e('左、右胃動脈沿此緣相接成弧，並有胃冠狀靜脈與胃周淋巴結；迷走神經的胃支沿此緣分布；胃潰瘍多發生在小彎近胃角處', 'The left and right gastric arteries join in an arcade alongside this border, together with the gastric veins and the gastric lymph nodes; gastric branches of the vagus follow it; gastric ulcers are common on the lesser curvature near the angular incisure'),
    血液供應: e('左胃動脈（來自腹腔動脈幹）與右胃動脈（來自肝固有動脈）', 'Left gastric artery (from the coeliac trunk) and right gastric artery (from the proper hepatic artery)'),
  },
  'greater curvature of stomach': {
    位置: e('胃的左側緣與下緣，凸面向左下，自賁門切跡起越過胃底，沿胃體左下方弧行到幽門，長度約為小彎的四倍', 'Left and lower border of the stomach, convex to the lower left, starting at the cardial notch, arching over the fundus and running down the left side of the body to the pylorus; it is roughly four times as long as the lesser curvature'),
    形態與附著: e('胃的左下緣，凸而長；大網膜（含胃結腸韌帶與胃脾韌帶）附著於此緣，胃底處另有胃膈韌帶連到橫膈', 'The long convex left-lower border of the stomach; the greater omentum (including the gastrocolic and gastrosplenic ligaments) attaches along it, with the gastrophrenic ligament at the fundus running to the diaphragm'),
    毗鄰: e('下方經胃結腸韌帶連橫結腸；左上方連胃脾韌帶至脾門；左、右胃網膜動脈沿弧吻合，短胃動脈經胃脾韌帶到達胃底', 'Below, the gastrocolic ligament links it to the transverse colon; at the upper left the gastrosplenic ligament runs to the hilum of the spleen; the left and right gastro-omental arteries anastomose along it, and the short gastric arteries reach the fundus through the gastrosplenic ligament'),
    血液供應: e('左胃網膜動脈（來自脾動脈）、右胃網膜動脈（來自胃十二指腸動脈）與短胃動脈', 'Left gastro-omental artery (from the splenic artery), right gastro-omental artery (from the gastroduodenal artery) and the short gastric arteries'),
  },
  'angular incisure (angular notch)': {
    位置: e('胃小彎下部最低處的明顯彎折，在幽門平面附近', 'Sharp bend at the lowest part of the lesser curvature, near the transpyloric plane'),
    形態: e('胃小彎在此由垂直轉為水平，形成一處明顯的凹入；內視鏡下可在小彎側看到對應的折角', 'The lesser curvature turns here from a vertical to a horizontal course, forming a distinct indentation; the corresponding angle can be seen on the lesser-curvature side at endoscopy'),
    毗鄰: e('為胃體與幽門部的分界；對應胃大彎側沒有明顯切跡；後方鄰胰體', 'Marks the boundary between the body and the pyloric part, with no notch on the opposite side along the greater curvature; the pancreatic body lies behind'),
    作用: e('內視鏡與影像上用來辨認胃體與幽門竇的分界，也是胃潰瘍的好發部位之一', 'A landmark at endoscopy and in imaging for the division of body and antrum, and a common site of gastric ulcer'),
  },
  'gastric rugae': {
    位置: e('胃內面黏膜與黏膜下層形成的皺襞，主要在胃體與胃底，沿小彎處較整齊', 'Folds of mucosa and submucosa on the inner surface of the stomach, mainly in the body and fundus and most regular along the lesser curvature'),
    組成: e('縱行、彼此平行或略呈網狀的暫時性皺襞，由黏膜與黏膜下層共同隆起；胃充盈擴張時變平，排空時明顯', 'Longitudinal, roughly parallel or slightly netlike temporary folds raised by mucosa and submucosa; they flatten as the stomach fills and are prominent when it is empty'),
    作用: e('使胃可大幅擴張而容納食物，並增加黏膜表面積與食物接觸；皺襞變粗或消失可見於胃炎與腫瘤等病變', 'Allow the stomach to expand and hold food and increase the mucosal surface; thickened or effaced folds can occur in gastritis and tumours'),
  },
  'esophagogastric junction (z-line)': {
    位置: e('食道腹段與賁門交接處，約在第十一胸椎高度，位於橫膈食道裂孔稍下方；Z 線是黏膜組織學上的交界，通常與內視鏡所見的胃食道交界相差不到一公分', 'Where the abdominal oesophagus meets the cardia, at about T11 just below the oesophageal hiatus of the diaphragm; the Z-line is the histological mucosal boundary and usually differs by less than 1 cm from the gastro-oesophageal junction seen at endoscopy'),
    組成: e('黏膜在此由食道的複層鱗狀上皮突然轉為胃的單層柱狀上皮，交界呈鋸齒狀的線（Z 線，鱗柱交界）；內視鏡下為粉白與橙紅黏膜的分界', 'The mucosa changes abruptly from the oesophageal stratified squamous epithelium to the gastric simple columnar epithelium along an irregular zigzag line (the Z-line, squamocolumnar junction); at endoscopy it separates pale pink from orange-red mucosa'),
    毗鄰: e('周圍有右膈腳形成的食道裂孔括約作用與下食道括約肌；食道叢的迷走神經前、後幹在此進入腹腔', 'Surrounded by the sling of the right crus at the hiatus and the lower oesophageal sphincter; the anterior and posterior vagal trunks enter the abdomen here'),
    作用: e('Z 線上移或出現柱狀上皮（巴雷特食道）與慢性胃酸逆流有關；滑動型裂孔疝氣時此交界上移到橫膈以上', 'Upward displacement of the Z-line or columnar epithelium above it (Barrett oesophagus) is linked with chronic acid reflux; in a sliding hiatal hernia the junction lies above the diaphragm'),
  },
  'duodenum': {
    位置: e('小腸的起始段，約二十五公分，呈 C 形環繞胰頭，位於第一至第三腰椎之間；起始約二點五公分前後兩面均有腹膜包被（腹膜內位），其餘為後腹膜器官，僅前面覆有腹膜', 'First part of the small intestine, about 25 cm long, C-shaped around the head of the pancreas at the levels of L1–L3; the first 2.5 cm or so is covered by peritoneum on both front and back (intraperitoneal), while the rest is retroperitoneal with peritoneum on its front only'),
    組成: e('分上部、降部、下部（水平部）與升部四段；黏膜有環狀皺襞與絨毛，十二指腸腺（Brunner 腺）分泌鹼性黏液；膽管與胰管在降部開口', 'Four parts: superior, descending, inferior (horizontal) and ascending; the mucosa has circular folds and villi, and duodenal glands (Brunner glands) secrete alkaline mucus; the bile and pancreatic ducts open into the descending part'),
    毗鄰: e('環抱胰頭；右側鄰肝、膽囊與右腎；後方有下腔靜脈、腹主動脈與右腎血管；前方有橫結腸與其繫膜根；上腸繫膜血管跨過下部前方', 'Wraps the head of the pancreas; on the right lie the liver, gallbladder and right kidney; behind lie the inferior vena cava, abdominal aorta and right renal vessels; in front lie the transverse colon and the root of its mesocolon; the superior mesenteric vessels cross in front of the inferior part'),
    血液供應: e('上半（乳突以上）由胃十二指腸動脈的上胰十二指腸動脈供應，下半由上腸繫膜動脈的下胰十二指腸動脈供應，兩者在胰頭後方吻合', 'The upper half (above the papilla) is supplied by the superior pancreaticoduodenal arteries from the gastroduodenal artery and the lower half by the inferior pancreaticoduodenal arteries from the superior mesenteric artery; the two groups anastomose behind the pancreatic head'),
    神經支配: e('迷走神經與來自腹腔叢、上腸繫膜神經叢的交感纖維', 'Vagus nerve and sympathetic fibres from the coeliac and superior mesenteric plexuses'),
  },
  'superior part of duodenum (duodenal cap)': {
    位置: e('自幽門起向右後上方走，約五公分，約在第一腰椎，止於十二指腸上曲', 'Runs from the pylorus backwards, upwards and to the right for about 5 cm at about L1, ending at the superior duodenal flexure'),
    組成: e('起始約二點五公分（十二指腸壺腹、十二指腸球部）前後兩面均有腹膜包被（腹膜內位），黏膜平滑、沒有環狀皺襞，鋇劑造影呈三角形的陰影；其餘部分為後腹膜，僅前面覆有腹膜', 'The first 2.5 cm or so (the duodenal cap or bulb) is covered by peritoneum on both front and back (intraperitoneal) and has a smooth mucosa without circular folds, giving a triangular shadow on a barium film; the rest is retroperitoneal, with peritoneum on its front only'),
    毗鄰: e('前方貼肝方形葉與膽囊；後方為膽總管、胃十二指腸動脈與肝門靜脈；下方為胰頭與頸；上方有網膜孔', 'In front lie the quadrate lobe of the liver and the gallbladder; behind lie the common bile duct, gastroduodenal artery and portal vein; below lie the head and neck of the pancreas; above lies the epiploic foramen'),
    血液供應: e('上十二指腸動脈、胃十二指腸動脈與上胰十二指腸動脈', 'Supraduodenal artery, gastroduodenal artery and superior pancreaticoduodenal arteries'),
    作用: e('接收胃排出的酸性食糜，是十二指腸潰瘍最常見的部位；後壁潰瘍可侵蝕胃十二指腸動脈而大量出血', 'Receives acid chyme from the stomach and is the commonest site of duodenal ulcer; a posterior ulcer can erode the gastroduodenal artery and bleed heavily'),
  },
  'descending part of duodenum': {
    位置: e('自十二指腸上曲向下，沿脊柱右側，約從第一腰椎到第三腰椎，長約八至十公分，止於十二指腸下曲', 'Runs down on the right of the vertebral column from about L1 to L3 for roughly 8–10 cm, ending at the inferior duodenal flexure'),
    組成: e('後腹膜器官；後內側壁有大十二指腸乳突，膽總管與主胰管在此開口，上方約二公分處有小乳突；黏膜有明顯環狀皺襞', 'Retroperitoneal; the major duodenal papilla on the posteromedial wall receives the common bile duct and main pancreatic duct, with the minor papilla about 2 cm above; circular folds are prominent'),
    毗鄰: e('內側緊貼胰頭；外側為肝右葉與結腸右曲；後方為右腎門與右腎血管；前方被橫結腸及其繫膜根橫過', 'Medially the head of the pancreas; laterally the right lobe of the liver and the right colic flexure; behind the right renal hilum and renal vessels; in front it is crossed by the transverse colon and the root of its mesocolon'),
    血液供應: e('上、下胰十二指腸動脈，在乳突附近為前、後兩支吻合成弓', 'Superior and inferior pancreaticoduodenal arteries, forming anterior and posterior arcades near the papilla'),
  },
  'inferior (horizontal) part of duodenum': {
    位置: e('自下曲向左橫行，約六至八公分，約平第三腰椎，由右向左越過脊柱', 'Runs horizontally to the left for about 6–8 cm at about L3, crossing the vertebral column from right to left'),
    組成: e('後腹膜器官，上緣貼胰頭下部與鉤突', 'Retroperitoneal; its upper border lies against the lower head and uncinate process of the pancreas'),
    毗鄰: e('前方有上腸繫膜動脈與靜脈及腸繫膜根越過；後方為右腰大肌、下腔靜脈與腹主動脈，並有右生殖腺血管與右輸尿管經過；上腸繫膜動脈與主動脈夾角過小時可壓迫此段，造成上腸繫膜動脈症候群', 'In front the superior mesenteric artery and vein and the root of the mesentery cross it; behind lie the right psoas, inferior vena cava and aorta, with the right gonadal vessels and right ureter passing by; if the angle between the superior mesenteric artery and the aorta is too narrow, this part can be compressed (superior mesenteric artery syndrome)'),
    血液供應: e('下胰十二指腸動脈，並有第一空腸動脈分支', 'Inferior pancreaticoduodenal artery, with branches of the first jejunal artery'),
  },
  'ascending part of duodenum': {
    位置: e('自下部末端向上，沿主動脈左緣，約二點五公分，上升到第二腰椎，止於十二指腸空腸彎曲', 'Runs up on the left side of the aorta for about 2.5 cm to the level of L2, ending at the duodenojejunal flexure'),
    組成: e('後腹膜器官；上端被十二指腸懸韌帶向上牽拉，是尋找十二指腸空腸彎曲的標誌', 'Retroperitoneal; its upper end is pulled upward by the suspensory ligament, which makes it a landmark for the duodenojejunal flexure'),
    毗鄰: e('右側為腹主動脈與腸繫膜根，後方為左腰大肌與左交感神經幹，上方為胰體下緣', 'On its right lie the abdominal aorta and the root of the mesentery, behind lie the left psoas and sympathetic trunk, and above lies the lower border of the pancreatic body'),
    血液供應: e('下胰十二指腸動脈與空腸動脈第一支', 'Inferior pancreaticoduodenal artery and the first jejunal artery'),
  },
  'duodenojejunal flexure': {
    位置: e('十二指腸升部轉向空腸的腸管轉彎處，約在第二腰椎左側、胰體下緣之下；是腸管轉彎的一段，有自己的管壁，與前後腸段相連', 'The turn of the gut tube where the ascending duodenum passes into the jejunum, at the left of L2 just below the lower border of the pancreatic body; it is a segment of gut with its own wall, continuous with the gut on either side'),
    固定方式: e('由十二指腸懸韌帶固定；腸管在此由後腹膜轉入有腸繫膜的腹膜內位', 'Held in place by the suspensory ligament of the duodenum; the gut passes here from a retroperitoneal position to an intraperitoneal one with a mesentery'),
    毗鄰: e('前方為胃後壁與橫結腸繫膜，左側為左腎與左腎血管，後方為左腰大肌與腹主動脈的左側；下腸繫膜靜脈常在其附近匯入脾靜脈', 'In front the posterior wall of the stomach and the transverse mesocolon, to the left the left kidney and renal vessels, behind the left psoas and the left side of the aorta; the inferior mesenteric vein often passes nearby to join the splenic vein'),
    血液供應: e('空腸第一動脈與下胰十二指腸動脈', 'First jejunal artery and the inferior pancreaticoduodenal artery'),
    作用: e('是十二指腸與空腸的分界，臨床上常以此為上、下消化道出血的分界點', 'The boundary between the duodenum and jejunum, and the usual dividing line between upper and lower gastrointestinal bleeding'),
  },
  'major duodenal papilla': {
    位置: e('十二指腸降部後內側壁的小圓形隆起，約在幽門下方八至十公分，約在第二腰椎高度', 'Small rounded elevation on the posteromedial wall of the descending duodenum, about 8–10 cm below the pylorus at about L2'),
    組成: e('膽總管與主胰管共同通過肝胰壺腹在此開口，上方常有一條縱行黏膜皺襞（縱皺襞）指引', 'The common bile duct and main pancreatic duct open here through the hepatopancreatic ampulla; a longitudinal mucosal fold above it usually points to it'),
    毗鄰: e('內側鄰胰頭，是前腸與中腸的分界處；小乳突位於其上方偏前', 'Medially the head of the pancreas; it marks the boundary between foregut and midgut; the minor papilla lies a little above and in front of it'),
    作用: e('把膽汁與胰液排入十二指腸；乳突或壺腹的結石、腫瘤會阻塞膽汁與胰液，造成黃疸或胰臟炎，也是內視鏡逆行胰膽管攝影的進入口', 'Delivers bile and pancreatic juice into the duodenum; a stone or tumour here blocks both and causes jaundice or pancreatitis; it is the entry point for endoscopic retrograde cholangiopancreatography'),
  },
  'minor duodenal papilla': {
    位置: e('十二指腸降部內側壁，位於大乳突上方約二公分處，稍偏前', 'On the medial wall of the descending duodenum, about 2 cm above the major papilla and slightly in front of it'),
    組成: e('副胰管的開口，較大乳突小而不明顯', 'Opening of the accessory pancreatic duct; smaller and less obvious than the major papilla'),
    作用: e('排出一部分胰液；主胰管阻塞或胰管發育變異（如胰臟分裂）時，成為胰液的備用通路', 'Drains part of the pancreatic juice; it serves as an alternative route when the main pancreatic duct is blocked or in developmental variants such as pancreas divisum'),
  },
  'hepatopancreatic ampulla (ampulla of vater)': {
    位置: e('位於十二指腸降部壁內，是膽總管與主胰管匯合形成的短小共同通道，向十二指腸腔開口於大乳突', 'Short common channel inside the wall of the descending duodenum formed by the union of the common bile duct and main pancreatic duct, opening into the lumen at the major papilla'),
    組成: e('管壁內層為黏膜，周圍有肝胰壺腹括約肌包圍；兩管匯合方式有變異，也可能各自開口', 'Lined by mucosa and surrounded by the sphincter of the ampulla; the manner of union of the two ducts varies and they may open separately'),
    毗鄰: e('在胰頭後內側與十二指腸壁之間，上游為膽總管末段與主胰管末段', 'Between the posteromedial part of the pancreatic head and the duodenal wall; upstream lie the ends of the common bile duct and main pancreatic duct'),
    血液供應: e('上、下胰十二指腸動脈的小分支', 'Small branches of the superior and inferior pancreaticoduodenal arteries'),
    作用: e('把膽汁與胰液送入十二指腸；膽結石卡在壺腹可造成梗阻性黃疸與膽結石性胰臟炎', 'Carries bile and pancreatic juice into the duodenum; a gallstone impacted in the ampulla causes obstructive jaundice and gallstone pancreatitis'),
  },
  'sphincter of ampulla (sphincter of oddi)': {
    位置: e('環繞肝胰壺腹及其上游膽總管與主胰管末段，位在十二指腸降部壁內的大乳突處', 'Surrounds the hepatopancreatic ampulla and the ends of the common bile duct and main pancreatic duct, in the wall of the descending duodenum at the major papilla'),
    組成: e('平滑肌；包括膽總管括約肌、胰管括約肌與壺腹括約肌三部分，與十二指腸的肌層有所區別', 'Smooth muscle; made up of the sphincters of the common bile duct, of the pancreatic duct and of the ampulla itself, distinct from the muscle of the duodenal wall'),
    作用: e('調節膽汁與胰液流入十二指腸，平時收縮使膽囊儲存膽汁，進食後在膽囊收縮素作用下放鬆；也防止十二指腸內容物逆流入膽管與胰管', 'Regulates the flow of bile and pancreatic juice into the duodenum; it is normally contracted, letting the gallbladder store bile, and relaxes after a meal under the action of cholecystokinin; it also stops duodenal contents from flowing back into the ducts'),
  },
  'suspensory ligament of duodenum (ligament of treitz)': {
    附著: e('上端起自右膈腳與包繞腹腔動脈幹起始部及上腸繫膜動脈根部附近的結締組織；下端止於十二指腸空腸彎曲及十二指腸升部', 'Upper end arises from the right crus of the diaphragm and from the connective tissue around the origin of the coeliac trunk and near the root of the superior mesenteric artery; lower end attaches to the duodenojejunal flexure and ascending duodenum'),
    毗鄰: e('斜向下走在胰體與脾靜脈的後方；內含平滑肌與纖維結締組織束；下端連到十二指腸空腸彎曲，位於十二指腸升部上端附近', 'Passes obliquely downward behind the pancreatic body and splenic vein; it contains smooth muscle and fibrous bands; its lower end joins the duodenojejunal flexure, near the upper end of the ascending duodenum'),
    作用: e('把十二指腸空腸彎曲向上懸吊固定，使十二指腸與空腸分界在手術與影像上可辨；是辨認十二指腸終點的標誌', 'Suspends and fixes the duodenojejunal flexure upward, making the boundary between duodenum and jejunum identifiable at surgery and on imaging; it is a landmark for the end of the duodenum'),
  },
});
// ===== C01 end =====

// ===== C02 begin: bowel (caecum, appendix), liver, biliary tree and renal hilum (card batch C02). Standard anatomy only; a field we are not sure of stays out. =====
Object.assign(CARD_EXTRAS, {
  'cecum': {
    位置: e('大腸的起始段，位於右髂窩，在迴盲瓣水平以下向下膨出成盲囊，長約六公分，上方連升結腸', 'Beginning of the large intestine, lying in the right iliac fossa as a blind pouch below the level of the ileocecal valve, about 6 cm long and continuous above with the ascending colon'),
    組成: e('寬而短的囊袋，三條結腸帶在其後內側壁匯集到闌尾根部；通常四面被腹膜包被而沒有繫膜，故活動度較大，也可能有一小段腹膜後固定的變異', 'A wide, short pouch; the three taeniae coli converge on the base of the appendix on its posteromedial wall; it is usually covered by peritoneum on all sides without a mesentery and is therefore fairly mobile, although some are partly fixed to the posterior wall'),
    毗鄰: e('前方貼前腹壁（或被大網膜覆蓋），後方為髂肌、腰大肌與外股皮神經，後方常有盲腸後隱窩；內側有迴腸末段進入', 'In front lies the anterior abdominal wall (or the greater omentum); behind lie iliacus, psoas major and the lateral femoral cutaneous nerve, often with a retrocecal recess; the terminal ileum enters medially'),
    血液供應: e('迴結腸動脈的前、後盲腸動脈；靜脈經迴結腸靜脈回流至上腸繫膜靜脈', 'Anterior and posterior caecal arteries from the ileocolic artery; venous blood drains through the ileocolic vein to the superior mesenteric vein'),
    神經支配: e('來自腹腔叢與上腸繫膜神經叢的交感纖維，以及迷走神經的副交感纖維', 'Sympathetic fibres from the coeliac and superior mesenteric plexuses and parasympathetic fibres from the vagus nerve'),
    作用: e('接收迴腸排入的內容物，吸收水分與電解質並開始形成糞便', 'Receives the contents of the ileum, absorbs water and electrolytes and begins to form faeces'),
  },
  'ileocecal valve': {
    位置: e('位於迴腸末段與盲腸交界處，在盲腸內側壁的後內側，約在右髂窩', 'At the junction of the terminal ileum and the caecum, on the posteromedial wall of the caecum in the right iliac fossa'),
    組成: e('迴腸末段突入盲腸腔所形成的上、下兩片唇狀黏膜皺襞，兩唇向兩端延伸成迴盲瓣繫帶；表面覆有迴腸的環肌與黏膜', 'Formed by the terminal ileum projecting into the caecal lumen as an upper and a lower lip of mucosal fold, which continue at the ends as the frenula; covered by ileal circular muscle and mucosa'),
    毗鄰: e('在下方鄰接闌尾開口，在上方連接升結腸起始處', 'The opening of the appendix lies just below it, and the start of the ascending colon lies above'),
    血液供應: e('迴結腸動脈的分支', 'Branches of the ileocolic artery'),
    作用: e('控制迴腸內容物間歇排入盲腸，並在盲腸充盈時被擠壓閉合，防止大腸內容物逆流回小腸', 'Controls the intermittent passage of ileal contents into the caecum and is pressed shut as the caecum fills, preventing backflow from the large intestine into the small intestine'),
  },
  'ileocecal junction': {
    位置: e('小腸與大腸相接的部位，在右髂窩，包括迴腸末段、迴盲瓣、盲腸起始部與闌尾根部', 'Where the small intestine meets the large intestine in the right iliac fossa, including the terminal ileum, ileocecal valve, upper caecum and the base of the appendix'),
    組成: e('迴腸末段由內側進入盲腸與升結腸交界處；腸壁上有迴盲瓣，周圍有迴腸上、下隱窩與盲腸後隱窩等腹膜小凹', 'The terminal ileum enters at the medial side of the junction of caecum and ascending colon; the valve lies in the wall, and peritoneal recesses (superior and inferior ileocecal and retrocecal) surround it'),
    血液供應: e('迴結腸動脈（上腸繫膜動脈的分支），含迴腸支、盲腸前後支與闌尾動脈', 'Ileocolic artery (a branch of the superior mesenteric artery), giving ileal, anterior and posterior caecal branches and the appendicular artery'),
    神經支配: e('腹腔叢、上腸繫膜神經叢的交感纖維與迷走神經的副交感纖維', 'Sympathetic fibres from the coeliac and superior mesenteric plexuses and vagal parasympathetic fibres'),
    作用: e('是小腸排入大腸的通道；克隆氏症與腸結核常侵犯此處，闌尾炎的疼痛與壓痛也常在附近', 'The passage from small to large intestine; Crohn disease and intestinal tuberculosis often involve it, and the pain and tenderness of appendicitis are often found near it'),
  },
  'appendix': {
    位置: e('從盲腸後內側壁的下端伸出的細長盲管，長度平均約八公分；根部位置恆定，體表約在髂前上棘與臍連線的外三分之一處（麥氏點的近似位置），尖端位置變化大，常見於盲腸後方或骨盆內', 'Narrow blind tube arising from the lower posteromedial wall of the caecum, about 8 cm long on average; its base is constant and projects on the surface at about the outer third of the line from the anterior superior iliac spine to the umbilicus (approximately McBurney point), while the tip varies, commonly lying behind the caecum or in the pelvis'),
    組成: e('壁含大量淋巴組織，腔窄；以闌尾繫膜懸吊於迴腸末段的腸繫膜下方，故為腹膜內位器官，三條結腸帶在其根部匯合', 'The wall is rich in lymphoid tissue and the lumen is narrow; it hangs from the mesentery of the terminal ileum by the mesoappendix, so it is intraperitoneal, and the three taeniae coli meet at its base'),
    毗鄰: e('尖端依位置可貼盲腸後壁、髂肌、骨盆緣、膀胱或右側卵巢與輸卵管', 'Depending on its position the tip can lie against the back of the caecum, iliacus, the pelvic brim, the bladder or the right ovary and uterine tube'),
    血液供應: e('闌尾動脈，來自迴結腸動脈，在迴腸末段後方進入闌尾繫膜；它是終末動脈，血流受阻易造成壞死穿孔', 'Appendicular artery from the ileocolic artery, passing behind the terminal ileum into the mesoappendix; it is an end artery, so obstruction readily leads to gangrene and perforation'),
    神經支配: e('腹腔叢與上腸繫膜神經叢的交感纖維（痛覺傳入約第十胸椎節段，早期痛在臍周）與迷走神經的副交感纖維', 'Sympathetic fibres from the coeliac and superior mesenteric plexuses (pain afferents enter at about T10, so early pain is felt around the umbilicus) and vagal parasympathetic fibres'),
    作用: e('富含淋巴組織，屬腸道免疫的一部分；發炎波及壁腹膜時，疼痛會轉移到右下腹', 'Rich in lymphoid tissue and part of gut immunity; when inflammation (appendicitis) reaches the parietal peritoneum the pain shifts to the right lower abdomen'),
  },
  'mesoappendix': {
    附著: e('三角形腹膜皺襞，基部連於迴腸末段腸繫膜後葉，游離緣包著闌尾', 'A triangular peritoneal fold whose base is attached to the posterior layer of the mesentery of the terminal ileum and whose free edge encloses the appendix'),
    毗鄰: e('位於迴腸末段後方，闌尾動脈與靜脈在其游離緣附近行走，並含有淋巴管與神經', 'Lies behind the terminal ileum; the appendicular artery and vein run in or near its free border together with lymphatics and nerves'),
    作用: e('懸吊闌尾並承載其血管與神經；手術切除闌尾時需先結紮闌尾動脈', 'Suspends the appendix and carries its vessels and nerves; at appendicectomy the appendicular artery has to be ligated in it'),
  },
  'liver': {
    位置: e('腹腔右上部最大的實質器官，大部分在右季肋區並延伸到上腹部，上面貼橫膈，被下位肋骨保護；上界約在右第五肋間隙', 'Largest solid organ of the abdomen, lying mainly in the right hypochondrium and extending into the epigastrium under the diaphragm and protected by the lower ribs; its upper limit reaches about the right fifth intercostal space'),
    組成: e('分為右葉、左葉、方形葉與尾葉，並以鐮狀韌帶將前方的左、右葉分開；表面有橫膈面與臟面，臟面有肝門；表面被腹膜覆蓋，只有裸區例外；外有纖維性的格利森囊', 'Divided into right, left, quadrate and caudate lobes, with the falciform ligament separating the right and left lobes in front; it has diaphragmatic and visceral surfaces, the latter with the porta hepatis; it is covered with peritoneum except at the bare area, and has a fibrous capsule (Glisson capsule)'),
    毗鄰: e('上方為橫膈，隔著橫膈鄰右肺、胸膜與心臟；臟面鄰接胃、十二指腸、結腸右曲、右腎與腎上腺及膽囊；後方有下腔靜脈與食道', 'Above lies the diaphragm, and across it the right lung, pleura and heart; the visceral surface touches the stomach, duodenum, right colic flexure, right kidney and suprarenal gland and the gallbladder; behind lie the inferior vena cava and oesophagus'),
    血液供應: e('雙重供血：肝固有動脈（來自腹腔動脈幹，約佔兩成至三成）帶來含氧血，門靜脈（約佔七成至八成）帶來來自腸道的血；靜脈經肝右、中、左靜脈注入下腔靜脈', 'A dual supply: the proper hepatic artery (from the coeliac trunk, roughly a quarter) brings oxygenated blood and the portal vein (roughly three quarters) brings blood from the gut; venous blood leaves through the right, middle and left hepatic veins into the inferior vena cava'),
    神經支配: e('主要為腹腔叢（交感）與迷走神經（副交感）的纖維，隨肝動脈與門靜脈進入肝門；包膜的痛覺可由右膈神經傳導', 'Fibres mainly from the coeliac plexus (sympathetic) and the vagus nerve (parasympathetic), entering at the porta hepatis along the hepatic artery and portal vein; pain from the capsule can be carried by the right phrenic nerve'),
    作用: e('代謝營養物質、合成血漿蛋白與凝血因子、解毒、製造膽汁、儲存肝醣與維生素，並在胎兒期造血', 'Metabolises nutrients, makes plasma proteins and clotting factors, detoxifies, produces bile, stores glycogen and vitamins and is haemopoietic in the fetus'),
  },
  'right lobe of liver': {
    位置: e('肝最大的一葉，在右季肋區，位於鐮狀韌帶右側，約佔肝的三分之二', 'The largest lobe of the liver, in the right hypochondrium to the right of the falciform ligament, making up about two thirds of the organ'),
    組成: e('臟面以膽囊窩與下腔靜脈溝為界；功能性右半肝為第五至第八段，形態上的右葉不包括方形葉（第四段）與尾葉（第一段）', 'On the visceral surface it is bounded by the gallbladder fossa and the groove for the inferior vena cava; the functional right hemiliver is segments V to VIII, and the morphological right lobe does not include the quadrate lobe (segment IV) or the caudate lobe (segment I)'),
    毗鄰: e('臟面接觸右腎、右腎上腺、結腸右曲與十二指腸；上方貼橫膈', 'Its visceral surface touches the right kidney, right suprarenal gland, right colic flexure and duodenum; above lies the diaphragm'),
    血液供應: e('肝右動脈與門靜脈右支；肝右靜脈引流至下腔靜脈', 'Right hepatic artery and right branch of the portal vein; the right hepatic vein drains to the inferior vena cava'),
    神經支配: e('腹腔叢與迷走神經的纖維', 'Fibres from the coeliac plexus and the vagus nerve'),
    作用: e('構成肝大部分的功能組織；右肝切除時沿肝中靜脈所在平面切開', 'Provides most of the functional liver tissue; a right hepatectomy divides the liver along the plane of the middle hepatic vein'),
  },
  'left lobe of liver': {
    位置: e('位於鐮狀韌帶左側，較右葉小而扁，向左延伸到上腹部，前面可達劍突下方', 'Lies to the left of the falciform ligament, smaller and flatter than the right lobe, extending to the left across the epigastrium below the xiphoid process'),
    組成: e('臟面有胃壓跡與食道溝，左三角韌帶將其外側部固定到橫膈；依功能分區，在鐮狀韌帶左側為第二、三段，方形葉為第四段', 'Its visceral surface bears the gastric impression and oesophageal groove, and the left triangular ligament fixes its tip to the diaphragm; functionally, segments II and III lie left of the falciform ligament and the quadrate lobe corresponds to segment IV'),
    毗鄰: e('上方為橫膈與心臟，下方為胃前壁與小網膜；有時延伸到脾旁', 'Above lie the diaphragm and heart, below the front of the stomach and the lesser omentum; it may reach as far as the spleen'),
    血液供應: e('肝左動脈與門靜脈左支；肝左靜脈引流至下腔靜脈', 'Left hepatic artery and left branch of the portal vein; the left hepatic vein drains to the inferior vena cava'),
    神經支配: e('腹腔叢與迷走神經的纖維', 'Fibres from the coeliac plexus and the vagus nerve'),
    作用: e('構成肝的左側部分，可獨立做左側肝切除；功能上的左半肝為第二至第四段，解剖上的左葉不含方形葉', 'Forms the left part of the liver and can be resected separately; the functional left hemiliver is segments II to IV, whereas the anatomical left lobe does not include the quadrate lobe'),
  },
  'quadrate lobe of liver': {
    位置: e('位於肝臟面的前方、膽囊與肝圓韌帶之間，前緣是肝下緣', 'On the front of the visceral surface between the gallbladder and the round ligament of the liver, with its front edge on the inferior border'),
    組成: e('形似長方形的小葉，後方以肝門為界；在功能分區屬第四段，右為膽囊窩，左為肝圓韌帶裂', 'A small oblong lobe bounded behind by the porta hepatis; functionally it is segment IV, with the gallbladder fossa on its right and the fissure for the round ligament on its left'),
    毗鄰: e('下方接觸幽門與十二指腸上部', 'Below it lie the pylorus and the first part of the duodenum'),
    血液供應: e('肝左動脈（或其中間支）與門靜脈左支', 'Left hepatic artery (or its middle branch) and the left branch of the portal vein'),
    神經支配: e('腹腔叢與迷走神經的纖維', 'Fibres from the coeliac plexus and the vagus nerve'),
    作用: e('膽汁引流入左肝管；是肝臟面上認定肝門前緣的標誌', 'Its bile drains to the left hepatic duct; it marks the front border of the porta hepatis on the visceral surface'),
  },
  'caudate lobe of liver': {
    位置: e('位於肝臟面的後上方，在下腔靜脈與靜脈韌帶裂之間，肝門的後方', 'On the back of the visceral surface between the inferior vena cava and the fissure for the ligamentum venosum, behind the porta hepatis'),
    組成: e('乳突突起向左下方突入小網膜，尾狀突在下腔靜脈與肝門之間連接右葉；在功能分區為第一段，血管與膽管分別來自左右兩側', 'Its papillary process projects to the left and downward into the lesser omentum, and the caudate process links it to the right lobe between the inferior vena cava and the porta hepatis; functionally it is segment I, receiving vessels and bile ducts from both sides'),
    毗鄰: e('前方為肝門，後方鄰下腔靜脈與右膈腳，左側貼小網膜上部（網膜囊上隱窩）', 'In front lies the porta hepatis, behind it the inferior vena cava and the right crus, and on its left it touches the upper lesser omentum (superior recess of the omental bursa)'),
    血液供應: e('肝左、右動脈與門靜脈左、右支雙側供應；肝短靜脈直接注入下腔靜脈', 'Supplied from both sides by the left and right hepatic arteries and portal branches; short hepatic veins drain directly into the inferior vena cava'),
    神經支配: e('腹腔叢與迷走神經的纖維', 'Fibres from the coeliac plexus and the vagus nerve'),
    作用: e('獨立的引流（直接進下腔靜脈）使它在布加氏症候群中常代償性肥大', 'Its separate venous drainage straight into the inferior vena cava often makes it enlarge in compensation in Budd-Chiari syndrome'),
  },
  'diaphragmatic surface of liver': {
    位置: e('肝的上面與前面及後面一部分，平滑呈圓頂狀，緊貼橫膈', 'The smooth dome-shaped upper surface of the liver with parts of its front and back, applied to the diaphragm'),
    表面特徵: e('此面大部分有腹膜覆蓋，鐮狀韌帶與冠狀韌帶附著於此面，鐮狀韌帶的附著線把肝分為左右部；後上方的裸區沒有腹膜覆蓋，直接貼橫膈', 'Most of this surface is covered by peritoneum; the falciform and coronary ligaments attach to it, the line of the falciform ligament dividing the liver into right and left parts; the bare area behind and above lacks peritoneum and lies directly against the diaphragm'),
    毗鄰: e('隔著橫膈，右側貼右肺與胸膜，左側貼心臟；前面貼前腹壁與肋弓', 'Across the diaphragm lie the right lung and pleura on the right and the heart on the left; in front lie the anterior abdominal wall and costal margin'),
    作用: e('右膈下間隙的膿瘍會貼附在此面；刺激橫膈時疼痛可牽涉到右肩', 'Subphrenic abscesses collect against it; irritation of the diaphragm can refer pain to the right shoulder'),
  },
  'visceral surface of liver': {
    位置: e('肝的下面與後下面，朝向下方與後方，與腹腔臟器相接', 'The inferior and posteroinferior surface of the liver, facing downward and backward towards the abdominal organs'),
    表面特徵: e('表面有 H 形的溝：右縱溝（膽囊窩與下腔靜脈溝）、左縱溝（肝圓韌帶裂與靜脈韌帶裂）和橫溝（肝門）；劃出右葉、左葉、方形葉與尾葉', 'Marked by an H-shaped set of grooves: the right sagittal groove (gallbladder fossa and groove for the inferior vena cava), the left sagittal groove (fissures for the round ligament and ligamentum venosum) and the transverse groove (porta hepatis); these delimit the right, left, quadrate and caudate lobes'),
    毗鄰: e('留有胃壓跡、十二指腸壓跡、結腸壓跡、腎壓跡與腎上腺壓跡，分別與相應器官相接', 'Bears gastric, duodenal, colic, renal and suprarenal impressions where it touches the respective organs'),
    作用: e('肝門與周圍的器官壓跡是辨認臟面結構的標誌', 'The porta hepatis and the organ impressions are the landmarks for identifying structures on the visceral surface'),
  },
  'porta hepatis': {
    位置: e('肝臟面橫行的深溝，位於方形葉與尾葉之間，是血管、膽管進出肝的門戶', 'Deep transverse fissure on the visceral surface between the quadrate and caudate lobes, the gateway for vessels and ducts entering and leaving the liver'),
    組成: e('通過的內容物自後向前大致為門靜脈（最後）、肝固有動脈（居中偏前）與肝管（最前）；另有淋巴管與肝神經叢；它們被小網膜游離緣的肝十二指腸韌帶包著', 'Contents from back to front are, roughly, the portal vein (posterior), the hepatic artery (intermediate) and the hepatic ducts (anterior), with lymphatics and the hepatic nerve plexus, all enclosed in the hepatoduodenal ligament forming the free edge of the lesser omentum'),
    毗鄰: e('前為方形葉，後為尾葉；下方連接小網膜（肝十二指腸韌帶），其後為網膜孔', 'The quadrate lobe lies in front and the caudate lobe behind; below it continues the lesser omentum (hepatoduodenal ligament), behind which lies the epiploic foramen'),
    血液供應: e('門靜脈與肝固有動脈分成左、右支後在此進入肝實質', 'The portal vein and proper hepatic artery divide into left and right branches here and enter the parenchyma'),
    作用: e('肝十二指腸韌帶游離緣內的血管可被壓住（普林格爾手法）以暫時阻斷肝的血流，用於控制肝外傷出血', 'The vessels in the free edge of the hepatoduodenal ligament can be compressed (Pringle manoeuvre) to stop hepatic inflow temporarily and control bleeding in liver trauma'),
  },
  'bare area of liver': {
    位置: e('位於肝橫膈面的後上方，介於冠狀韌帶上、下兩層之間的三角形區域', 'Triangular area on the back of the diaphragmatic surface enclosed between the upper and lower layers of the coronary ligament'),
    組成: e('沒有腹膜覆蓋，肝表面直接與橫膈接觸，以疏鬆結締組織連在一起；下腔靜脈溝位於其左緣，右腎上腺壓跡在其下方', 'Not covered by peritoneum; the liver surface lies directly against the diaphragm, joined by loose connective tissue; the groove for the inferior vena cava lies at its left edge and the impression for the right suprarenal gland lies below it'),
    毗鄰: e('後方為橫膈與右腎上腺；肝短靜脈與下腔靜脈在此附近', 'Behind it lie the diaphragm and the right suprarenal gland; the short hepatic veins and inferior vena cava are near'),
    作用: e('是肝直接連於橫膈的部位，也是肝與橫膈下間隙間感染可相互蔓延的通道；是肝在體腔內的一處固定', 'The area where the liver is attached directly to the diaphragm, which can allow infection to spread between the liver and the subphrenic regions; it is one of the fixations of the liver'),
  },
  'round ligament of liver': {
    附著: e('是胎兒期臍靜脈閉鎖後的殘餘，自臍向上行於鐮狀韌帶的游離下緣，抵達肝的臟面，嵌入肝圓韌帶裂，並連接門靜脈左支', 'The remnant of the fetal umbilical vein, running from the umbilicus up in the free lower edge of the falciform ligament to the visceral surface of the liver, where it lies in the fissure for the round ligament and joins the left branch of the portal vein'),
    毗鄰: e('位於方形葉與肝左葉之間；旁有臍旁靜脈與肝門靜脈系統相通', 'Lies between the quadrate lobe and the left lobe; small paraumbilical veins beside it connect with the portal system'),
    作用: e('門脈高壓時，臍旁靜脈擴張，形成臍周的「海蛇頭」側枝循環', 'In portal hypertension the paraumbilical veins dilate to give the caput medusae, a collateral pathway around the umbilicus'),
  },
  'coronary ligament of liver': {
    附著: e('由腹膜自橫膈折返到肝後上方形成的上、下兩層，上層接肝橫膈面，下層接肝右葉後下面，兩層之間為肝裸區；兩側各接成左、右三角韌帶', 'Peritoneal folds reflected from the diaphragm to the back of the liver as an upper and a lower layer, the upper meeting the diaphragmatic surface and the lower the posteroinferior surface of the right lobe, enclosing the bare area between; at each side they meet as the left and right triangular ligaments'),
    毗鄰: e('兩層之間夾著肝裸區；下層接近右腎與右腎上腺，中央附近有下腔靜脈', 'The bare area lies between its layers; the lower layer lies near the right kidney and suprarenal gland, with the inferior vena cava near the middle'),
    作用: e('把肝固定在橫膈下；兩層之間是肝與橫膈直接相連而無腹膜的部位', 'Fixes the liver to the underside of the diaphragm; between the layers the liver is directly connected to the diaphragm without peritoneum'),
  },
  'couinaud segments of liver': {
    位置: e('依血管與膽管分布將肝分成八個功能性肝段，各段有各自的門靜脈分支、肝動脈與膽管（門脈三體），靜脈則在段間匯集', 'The liver divided into eight functional segments according to its vessels and ducts, each with its own portal vein branch, hepatic artery and bile duct (portal triad), while the hepatic veins run between segments'),
    組成: e('第一段為尾葉；第二、三段在鐮狀韌帶左側（左外側部），第四段為左內側部（含方形葉）；第五至八段屬右半肝，右前部為第五、八段，右後部為第六、七段；各段以肝右、中、左靜脈與經過門靜脈分支的橫平面為界', 'Segment I is the caudate lobe; segments II and III lie left of the falciform ligament (left lateral part) and segment IV is the left medial part (including the quadrate lobe); segments V to VIII form the right hemiliver, with V and VIII anterior and VI and VII posterior; boundaries are the planes of the right, middle and left hepatic veins and a transverse plane through the portal branches'),
    血液供應: e('各段由對應的門靜脈與肝動脈分支供應；肝右、中、左靜脈走在段間平面上，匯入下腔靜脈', 'Each segment is supplied by its own portal vein and hepatic artery branches; the right, middle and left hepatic veins run between segments into the inferior vena cava'),
    作用: e('是肝手術與影像診斷定位的依據，可依段切除病灶而保留其餘肝組織', 'The basis for locating lesions on imaging and for liver surgery, allowing a segment to be resected while the rest of the liver is preserved'),
  },
  'portal triad': {
    位置: e('在肝十二指腸韌帶內向上走向肝門的三種管道，在肝內亦伴行在每一肝小葉的周邊（門管區）', 'Three channels running together in the hepatoduodenal ligament towards the porta hepatis, and inside the liver accompanying each other at the corner of the lobules (portal tracts)'),
    組成: e('膽總管（或肝管）、肝固有動脈與門靜脈；在韌帶內膽管位於右前方，動脈位於左前方，門靜脈居於兩者後方', 'The bile duct (or hepatic ducts), the proper hepatic artery and the portal vein; in the ligament the duct lies to the right front, the artery to the left front and the portal vein behind both'),
    毗鄰: e('韌帶的游離緣之後是網膜孔，其後有下腔靜脈', 'Behind the free edge of the ligament lies the epiploic foramen and behind that the inferior vena cava'),
    血液供應: e('肝動脈提供含氧血，門靜脈提供來自消化道的血；兩者在肝竇匯合後經中央靜脈出肝', 'The hepatic artery brings oxygenated blood and the portal vein brings blood from the gut; they mix in the sinusoids and leave through the central veins'),
    作用: e('輸送血液與膽汁進出肝；用手指壓住此處可暫時阻斷肝的血流入量', 'Carries blood and bile to and from the liver; compressing it with the fingers can temporarily stop blood flowing into the liver'),
  },
  'gallbladder': {
    位置: e('梨形的囊袋，位於肝臟面右縱溝前部的膽囊窩，其底部常在右側肋弓與腹直肌外緣的交點（第九肋軟骨）露出肝下緣', 'Pear-shaped sac lying in the gallbladder fossa at the front of the right sagittal groove on the visceral surface of the liver, with its fundus often projecting beyond the inferior border at the junction of the right costal margin and the lateral border of rectus abdominis (ninth costal cartilage)'),
    組成: e('分為底、體、頸三部分，頸部續接膽囊管；容積約三十至五十毫升；黏膜在頸部呈螺旋瓣；下面被腹膜覆蓋，上面直接貼肝', 'Divided into fundus, body and neck, with the neck continuing into the cystic duct; capacity about 30 to 50 mL; the mucosa forms a spiral fold in the neck; the lower surface is covered by peritoneum while the upper surface is attached directly to the liver'),
    毗鄰: e('下方與十二指腸上部及結腸右曲相鄰，內側為十二指腸，前方為肝下緣與腹前壁；頸部靠近肝門右端', 'Below it lie the first part of the duodenum and the right colic flexure, in front are the inferior liver border and the anterior abdominal wall; its neck lies near the right end of the porta hepatis'),
    血液供應: e('膽囊動脈，通常來自肝右動脈，經膽囊三角至膽囊頸；靜脈經膽囊靜脈入門靜脈右支，或直接入肝', 'Cystic artery, usually from the right hepatic artery, reaching the neck through the cystohepatic triangle; veins drain through the cystic vein to the right branch of the portal vein or directly into the liver'),
    神經支配: e('腹腔叢的交感纖維、迷走神經的副交感纖維，以及右膈神經的感覺纖維（膈下腹膜受刺激時，疼痛牽涉右肩）', 'Sympathetic fibres from the coeliac plexus, parasympathetic fibres from the vagus nerve and sensory fibres of the right phrenic nerve (irritation of the peritoneum near the diaphragm refers pain to the right shoulder)'),
    作用: e('濃縮並儲存肝分泌的膽汁；進食後在膽囊收縮素作用下收縮，把膽汁經膽囊管與膽總管排入十二指腸', 'Concentrates and stores the bile made by the liver; after a meal it contracts under cholecystokinin and drives bile through the cystic and common bile ducts into the duodenum'),
  },
  'fundus of gallbladder': {
    位置: e('膽囊最前下方的圓鈍端，常超出肝下緣，與右第九肋軟骨處的腹前壁接觸', 'The rounded blind end of the gallbladder, often projecting beyond the inferior border of the liver to touch the anterior abdominal wall at the ninth costal cartilage'),
    組成: e('壁含肌纖維，下面被腹膜完全覆蓋', 'The wall contains muscle fibres and the lower surface is completely covered by peritoneum'),
    毗鄰: e('下方與橫結腸及十二指腸相接', 'Below it lie the transverse colon and duodenum'),
    血液供應: e('膽囊動脈的分支', 'Branches of the cystic artery'),
    作用: e('壁含較多肌纖維；發炎時在體表此點（墨菲點）按壓會引起吸氣中斷', 'The wall contains more muscle fibres; when inflamed, pressure over its surface point (Murphy point) halts inspiration'),
  },
  'body of gallbladder': {
    位置: e('膽囊的主要部分，貼在肝臟面的膽囊窩，介於底與頸之間', 'The main part of the gallbladder, lying in the gallbladder fossa of the liver between fundus and neck'),
    組成: e('上面直接貼肝（以疏鬆結締組織連接），下面被腹膜覆蓋', 'Its upper surface is attached directly to the liver by loose connective tissue and its lower surface is covered by peritoneum'),
    毗鄰: e('下面為十二指腸上部與橫結腸', 'Below it lie the first part of the duodenum and the transverse colon'),
    血液供應: e('膽囊動脈的淺支與深支', 'The superficial and deep branches of the cystic artery'),
    作用: e('是儲存膽汁的主要部位', 'The main store for bile'),
  },
  'neck of gallbladder': {
    位置: e('膽囊最細的一端，向後上方朝向肝門，並彎曲連到膽囊管', 'The narrow end of the gallbladder, directed backward and upward towards the porta hepatis and curving into the cystic duct'),
    組成: e('黏膜在此與膽囊管形成螺旋瓣；壁上常有一個小膨出（哈特曼囊），是膽結石容易嵌住的地方', 'The mucosa forms a spiral fold continuous with that of the cystic duct; the wall often has a small pouch (Hartmann pouch) where a gallstone tends to lodge'),
    毗鄰: e('鄰近肝門右端與膽囊三角，膽囊動脈常在此處接近膽囊頸', 'Lies near the right end of the porta hepatis and the cystohepatic triangle, where the cystic artery commonly reaches it'),
    血液供應: e('膽囊動脈（通常來自肝右動脈）', 'Cystic artery (usually from the right hepatic artery)'),
    作用: e('膽結石嵌頓在頸部或膽囊管會引起膽絞痛與膽囊炎', 'A gallstone impacted in the neck or cystic duct causes biliary colic and cholecystitis'),
  },
  'cystic duct': {
    位置: e('連接膽囊頸與總肝管的短管，長約三到四公分，向下後方走，在肝十二指腸韌帶內與總肝管匯合成膽總管', 'Short duct, about 3 to 4 cm long, joining the neck of the gallbladder to the common hepatic duct, running down and back in the hepatoduodenal ligament to form the common bile duct'),
    組成: e('黏膜形成螺旋瓣（海斯特瓣），使管腔保持開放並調節膽汁進出；與總肝管的匯合方式變異多', 'The mucosa forms a spiral fold (valve of Heister) that keeps the lumen open and regulates the flow of bile; the way it joins the common hepatic duct varies a good deal'),
    毗鄰: e('膽囊三角的外下側邊界；膽囊動脈通常在其上方經過', 'Forms the inferolateral boundary of the cystohepatic triangle; the cystic artery usually passes above it'),
    血液供應: e('膽囊動脈的分支', 'Branches of the cystic artery'),
    作用: e('膽汁在肝與膽囊之間雙向流動的通道；膽囊切除時必須在確認膽囊三角後才結紮切斷，避免傷及總肝管', 'Allows bile to flow both ways between the liver and the gallbladder; at cholecystectomy it is clipped and divided only after the cystohepatic triangle has been identified, to avoid injuring the common hepatic duct'),
  },
  'right hepatic duct': {
    位置: e('收集右半肝的膽汁，由右前與右後段膽管匯成，在肝門處出肝', 'Collects bile from the right hemiliver, formed by the right anterior and posterior sectoral ducts, and leaves the liver at the porta hepatis'),
    組成: e('短管，走向內下方，與左肝管匯成總肝管', 'A short duct running medially and downward to join the left hepatic duct and form the common hepatic duct'),
    毗鄰: e('位於肝門前方，在肝右動脈與門靜脈右支之前', 'Lies in the front of the porta hepatis, in front of the right hepatic artery and the right branch of the portal vein'),
    血液供應: e('肝右動脈的分支', 'Branches of the right hepatic artery'),
    作用: e('輸送右半肝膽汁', 'Carries bile from the right hemiliver'),
  },
  'left hepatic duct': {
    位置: e('收集左半肝（包括尾葉大部分）的膽汁，在肝門左端出肝', 'Collects bile from the left hemiliver (and most of the caudate lobe) and leaves the liver at the left end of the porta hepatis'),
    組成: e('比右肝管長而細，橫向走在肝門，與右肝管匯成總肝管', 'Longer and narrower than the right duct, running across the porta hepatis to join the right duct and form the common hepatic duct'),
    毗鄰: e('位於肝門前方，在門靜脈左支與肝左動脈之前', 'Lies in the front of the porta hepatis, in front of the left branch of the portal vein and the left hepatic artery'),
    血液供應: e('肝左動脈的分支', 'Branches of the left hepatic artery'),
    作用: e('輸送左半肝膽汁', 'Carries bile from the left hemiliver'),
  },
  'common hepatic duct': {
    位置: e('由左、右肝管在肝門附近匯合而成，向下走在肝十二指腸韌帶內，長約三公分，在膽囊管匯入處續為膽總管', 'Formed by the union of the left and right hepatic ducts near the porta hepatis, running down in the hepatoduodenal ligament for about 3 cm and continuing as the common bile duct where the cystic duct joins'),
    組成: e('管壁為單層柱狀上皮與纖維肌層', 'The wall has a simple columnar lining and a fibromuscular layer'),
    毗鄰: e('位於肝固有動脈的右側與門靜脈的前方', 'Lies to the right of the proper hepatic artery and in front of the portal vein'),
    血液供應: e('肝右動脈與膽囊動脈的分支', 'Branches of the right hepatic and cystic arteries'),
    作用: e('輸送肝的膽汁；阻塞時出現黃疸（肝外膽道阻塞），也是膽囊三角的內側邊界', 'Carries bile from the liver; blockage causes jaundice (extrahepatic obstruction); it also forms the medial boundary of the cystohepatic triangle'),
  },
  "calot's triangle (cystohepatic triangle)": {
    位置: e('位於肝門右側下方、膽囊頸附近的三角形間隙，在肝十二指腸韌帶右緣', 'Triangular space just below the right side of the porta hepatis near the neck of the gallbladder, at the right edge of the hepatoduodenal ligament'),
    邊界: e('多數教科書的定義：內側為總肝管，外下側為膽囊管，上方為肝臟下面；卡洛原始描述的上界為膽囊動脈；外科常用的「肝膽囊三角」以肝右葉下緣為上界，範圍較大', 'In most textbooks the medial side is the common hepatic duct, the inferolateral side the cystic duct and the top the inferior surface of the liver; Calot\'s original description took the cystic artery as the upper boundary; the surgical hepatocystic triangle uses the lower edge of the right lobe as its upper boundary and is larger'),
    內容物: e('膽囊動脈（通常來自肝右動脈）、肝右動脈的一段、膽囊淋巴結（Lund 淋巴結，位於膽囊頸旁）與脂肪結締組織', 'The cystic artery (usually from the right hepatic artery), a part of the right hepatic artery, the cystic lymph node (Lund node, beside the neck of the gallbladder) and fatty connective tissue'),
    臨床意義: e('膽囊切除時要在此區辨清膽囊動脈與膽囊管再結紮，以避免誤傷肝右動脈、總肝管；動脈與膽管的變異很多', 'At cholecystectomy the cystic artery and duct are clearly identified in this area before they are ligated to avoid injury to the right hepatic artery and common hepatic duct; variations of the arteries and ducts are common'),
  },
  'cystic artery': {
    來源: e('通常為肝右動脈的分支，在膽囊三角內發出；有變異，可來自肝左動脈、肝固有動脈、腹腔動脈幹或胃十二指腸動脈', 'Usually a branch of the right hepatic artery arising in the cystohepatic triangle; variants may come from the left hepatic, proper hepatic, coeliac or gastroduodenal arteries'),
    走向: e('經膽囊三角走向膽囊頸，分為淺支與深支，分別走在膽囊的游離面與肝側面', 'Runs through the cystohepatic triangle to the neck of the gallbladder and divides into superficial and deep branches along its free and hepatic surfaces'),
    供應範圍: e('膽囊與膽囊管', 'The gallbladder and cystic duct'),
  },
  'cystic vein': {
    走向: e('由膽囊靜脈叢匯成，經膽囊頸與膽囊管向肝門走，匯入門靜脈右支；也有小靜脈直接經膽囊窩進入肝', 'Formed from the venous plexus of the gallbladder, running towards the porta hepatis along the neck and cystic duct to join the right branch of the portal vein; small veins also pass directly through the gallbladder fossa into the liver'),
    引流範圍: e('膽囊與膽囊管', 'The gallbladder and cystic duct'),
  },
  'hilum of kidney': {
    位置: e('腎內側緣中段的縱向裂隙，左腎門約平第一腰椎，右腎門略低，向前內方開口，通向腎竇', 'Vertical cleft on the middle of the medial border of the kidney, the left hilum at about L1 and the right slightly lower, opening forward and medially into the renal sinus'),
    內容物: e('由前向後依次為腎靜脈、腎動脈（及其分支）與腎盂（接輸尿管）；此外有腎神經叢纖維、淋巴管與少量脂肪', 'From front to back the renal vein, the renal artery (and its branches) and the renal pelvis (continuing into the ureter); in addition renal plexus nerves, lymphatics and some fat'),
    毗鄰: e('右側靠近十二指腸降部，左側靠近胰體尾與脾血管；後方為腰大肌，並有腎上腺鄰近上極', 'On the right it lies near the descending duodenum, on the left near the body and tail of the pancreas and the splenic vessels; behind lies psoas major and the suprarenal gland lies near the upper pole'),
    血液供應: e('腎動脈（腹主動脈的分支），在腎門附近分為前、後支再入腎竇；靜脈由腎靜脈出腎，左腎靜脈較長，越過腹主動脈前方', 'Renal artery (a branch of the abdominal aorta), dividing into anterior and posterior branches near the hilum before entering the renal sinus; veins leave by the renal vein, the left being longer and crossing in front of the aorta'),
    神經支配: e('腎神經叢（交感纖維來自腹腔神經節與主動脈腎神經節，副交感為迷走神經）隨腎動脈進入腎門；痛覺傳導約經第十至十二胸神經節段', 'The renal plexus (sympathetic fibres from the coeliac and aorticorenal ganglia, with vagal parasympathetic fibres) enters with the renal artery; pain is carried at about the T10 to T12 segments'),
    作用: e('腎的血管、淋巴與神經的進出口；腎外傷或手術時需在此控制腎蒂', 'The entrance and exit for the kidney vessels, lymphatics and nerves; the renal pedicle is controlled here in renal trauma and surgery'),
  },
  'renal pelvis': {
    位置: e('腎竇內漏斗狀的擴大部分，由大腎盞匯合而成，在腎門處移行為輸尿管，位於腎靜脈與腎動脈的後方', 'Funnel-shaped dilated part within the renal sinus, formed by the union of the major calyces and continuing as the ureter at the hilum, lying behind the renal vein and renal artery'),
    組成: e('壁有移行上皮與平滑肌；形狀有變異，可在腎內（腎竇內）或部分在腎外', 'The wall has transitional epithelium and smooth muscle; its form varies and it may lie within the sinus or partly outside the kidney'),
    毗鄰: e('位於腎門的最後方；與腎盞及輸尿管相連', 'The most posterior structure at the hilum, continuous with the calyces and the ureter'),
    血液供應: e('腎動脈的分支（腎盂動脈）與輸尿管上動脈', 'Branches of the renal artery (pelvic arteries) and the superior ureteric arteries'),
    神經支配: e('腎神經叢（含交感與迷走神經副交感纖維），痛覺由約第十至十二胸脊髓節段傳入', 'Renal plexus (sympathetic and vagal parasympathetic fibres), with pain afferents entering the cord at about T10 to T12'),
    作用: e('收集尿液並送入輸尿管；腎盂與輸尿管交界處是結石與狹窄的好發部位', 'Collects urine and passes it into the ureter; the pelviureteric junction is a common site of stones and narrowing'),
  },
});
// ===== C02 end =====

// ===== AB-A1 begin: abdominal aorta and its unpaired branches (card batch AB-A1). Standard anatomy only; a field we are not sure of stays out. =====
Object.assign(CARD_EXTRAS, {
  'abdominal aorta': {
    來源: e('主動脈在第十二胸椎（T12）下緣高度經橫膈的主動脈裂孔進入腹腔後續成腹主動脈', 'The continuation of the thoracic aorta after it passes through the aortic hiatus of the diaphragm at the lower border of T12'),
    走向: e('沿腰椎體前方稍偏左下行，右側為下腔靜脈，前方依次有胰、十二指腸第三部與腸繫膜根；約在第四腰椎（L4）高度分為左、右總髂動脈，分叉處另發出細小的正中薦動脈', 'Descends in front of the lumbar vertebral bodies slightly to the left of the midline, with the inferior vena cava on its right and the pancreas, third part of the duodenum and root of the mesentery in front; at about L4 it divides into the left and right common iliac arteries and gives off a slender median sacral artery at the fork'),
    主要分支: e('不成對的內臟分支：腹腔動脈幹（約 T12）、上腸繫膜動脈（約 L1）、下腸繫膜動脈（約 L3）；成對分支：下膈動脈、中腎上腺動脈、腎動脈、生殖腺動脈、腰動脈、肋下動脈；分叉處另有正中薦動脈', 'Unpaired visceral branches: the celiac trunk (about T12), superior mesenteric artery (about L1) and inferior mesenteric artery (about L3); paired branches: inferior phrenic, middle suprarenal, renal, gonadal, lumbar and subcostal arteries; the median sacral artery arises at the bifurcation'),
    供應範圍: e('腹腔內臟、後腹壁、橫膈下面，並藉總髂動脈供應骨盆與下肢', 'The abdominal viscera, posterior abdominal wall and underside of the diaphragm, and through the common iliac arteries the pelvis and lower limbs'),
  },
  'celiac trunk': {
    來源: e('在約第十二胸椎（T12）高度（部分資料作 T12 至 L1 上緣），主動脈裂孔下方，由腹主動脈前壁發出', 'Arises from the front of the abdominal aorta at about T12 (some sources give T12 to the upper border of L1), just below the aortic hiatus'),
    走向: e('非常短（約一至二公分），幾乎水平向前，位於胰體上緣上方、小網膜囊後方，被腹腔叢與腹腔神經節環繞；隨即分為三支', 'Very short (about 1 to 2 cm) and running almost horizontally forward, above the upper border of the body of the pancreas and behind the lesser sac, surrounded by the celiac plexus and ganglia; it soon divides into three branches'),
    主要分支: e('左胃動脈、脾動脈、總肝動脈', 'Left gastric, splenic and common hepatic arteries'),
    供應範圍: e('前腸衍生的器官：食道腹段、胃、十二指腸近端（至大十二指腸乳頭）、肝、膽囊、膽道、胰的大部分與脾', 'Foregut derivatives: the abdominal oesophagus, stomach, proximal duodenum (down to the major duodenal papilla), liver, gallbladder, bile ducts, most of the pancreas and the spleen'),
  },
  'left gastric artery': {
    來源: e('腹腔動脈幹的三條分支中最小的一條，向左上走', 'The smallest of the three branches of the celiac trunk, running up and to the left'),
    走向: e('在腹膜後向左上走到胃食道交界處，再轉向下，沿胃小彎走在小網膜兩層之間，與右胃動脈在小彎中部相接', 'Ascends retroperitoneally to the left towards the gastro-oesophageal junction, then turns down and runs along the lesser curvature between the layers of the lesser omentum to meet the right gastric artery'),
    主要分支: e('食道支（向上）；胃支（沿小彎的前、後壁）；有時另有肝左副動脈', 'Oesophageal branches (upward) and gastric branches along the front and back walls of the lesser curvature; sometimes an accessory left hepatic artery'),
    供應範圍: e('食道腹段下端與胃小彎側', 'The lower abdominal oesophagus and the lesser-curvature side of the stomach'),
  },
  'esophageal branch of left gastric artery': {
    來源: e('左胃動脈在接近胃食道交界處發出的上行支', 'The ascending branch of the left gastric artery given off near the gastro-oesophageal junction'),
    走向: e('沿食道前面上行，隨食道穿過橫膈的食道裂孔進入下胸部', 'Runs up on the front of the oesophagus and passes with it through the oesophageal hiatus of the diaphragm into the lower thorax'),
    供應範圍: e('食道腹段與下胸段；與主動脈胸部的食道支在此吻合', 'The abdominal and lower thoracic oesophagus; it anastomoses here with the oesophageal branches of the thoracic aorta'),
  },
  'splenic artery': {
    來源: e('腹腔動脈幹最大的分支，向左走', 'The largest branch of the celiac trunk, running to the left'),
    走向: e('彎曲迂迴，沿胰體與胰尾上緣走，位於胃的後方、小網膜囊後壁，之後在脾腎韌帶內進入脾門，並在近脾門處分成數條終末支', 'Tortuous, running along the upper border of the body and tail of the pancreas behind the stomach and the back wall of the lesser sac, then within the splenorenal ligament to the splenic hilum, where it divides into terminal branches'),
    主要分支: e('胰支（常包括背胰動脈、大胰動脈）、短胃動脈、左胃網膜動脈、後胃動脈（不恆定）、脾門處的脾支', 'Pancreatic branches (often including the dorsal and greater pancreatic arteries), short gastric arteries, left gastro-omental artery, posterior gastric artery (inconstant) and the splenic branches at the hilum'),
    供應範圍: e('脾、胰體與胰尾、胃底與胃大彎左半', 'The spleen, body and tail of the pancreas, and the fundus and left part of the greater curvature of the stomach'),
  },
  'short gastric arteries': {
    來源: e('脾動脈末端或其脾支發出的數條（約五至七條）細小動脈', 'Several (about five to seven) small arteries arising from the end of the splenic artery or its splenic branches'),
    走向: e('在胃脾韌帶內向左上走，抵達胃底的大彎側', 'Run in the gastrosplenic ligament up to the greater-curvature side of the gastric fundus'),
    供應範圍: e('胃底與胃體上部的大彎側；與左胃動脈及左胃網膜動脈互相吻合', 'The fundus and upper greater-curvature side of the stomach, anastomosing with the left gastric and left gastro-omental arteries'),
  },
  'left gastro-omental artery': {
    來源: e('脾動脈末端（或脾支）的分支', 'A branch of the end of the splenic artery or one of its splenic branches'),
    走向: e('經胃脾韌帶向下，再沿胃大彎走在大網膜前兩層之間，向右與右胃網膜動脈相接', 'Passes down in the gastrosplenic ligament and along the greater curvature between the layers of the greater omentum, running to the right to meet the right gastro-omental artery'),
    供應範圍: e('胃大彎左側部分的前後壁與大網膜', 'The front and back walls of the left part of the greater curvature of the stomach, and the greater omentum'),
  },
  'posterior gastric artery': {
    來源: e('脾動脈的小分支，不一定存在（出現率各報告不一）', 'A small branch of the splenic artery that is not always present (reported frequency varies)'),
    走向: e('在腹膜後沿小網膜囊後壁向上走，經胃膈韌帶到達胃底後壁', 'Ascends behind the peritoneum of the posterior wall of the lesser sac and reaches the back wall of the fundus through the gastrophrenic fold'),
    供應範圍: e('胃底與胃體上部的後壁', 'The back wall of the fundus and upper body of the stomach'),
  },
  'dorsal pancreatic artery': {
    來源: e('最常見起自脾動脈根部（約四成），也可起自腹腔動脈幹、總肝動脈或上腸繫膜動脈', 'Most often from the root of the splenic artery (about 40 per cent); it may instead arise from the celiac trunk, common hepatic or superior mesenteric artery'),
    走向: e('在胰頸後方向下走，分成左、右支；右支與前上胰十二指腸動脈相接，左支沿胰體下緣向左，續為胰下動脈', 'Descends behind the neck of the pancreas and divides into right and left branches; the right branch joins the anterior superior pancreaticoduodenal artery and the left branch runs along the lower border of the body of the pancreas as the inferior pancreatic artery'),
    供應範圍: e('胰頸與胰體；與前上胰十二指腸動脈及大胰動脈吻合', 'The neck and body of the pancreas, anastomosing with the anterior superior pancreaticoduodenal artery and the greater pancreatic artery'),
  },
  'greater pancreatic artery': {
    來源: e('脾動脈沿胰體上緣行經時，在約胰體中部發出的最大胰支', 'The largest pancreatic branch of the splenic artery, arising as it runs along the upper border of the pancreas at about the middle of the body'),
    走向: e('向下進入胰體實質，分支供應胰體左段與胰尾，並與胰下動脈吻合', 'Passes down into the substance of the pancreas, supplying the left part of the body and the tail through its branches and anastomosing with the inferior pancreatic artery'),
    供應範圍: e('胰體左段與胰尾', 'The left part of the body and the tail of the pancreas'),
  },
  'common hepatic artery': {
    來源: e('腹腔動脈幹的右向分支', 'The rightward branch of the celiac trunk'),
    走向: e('在小網膜囊後壁的腹膜後，沿胰頸上緣向右走，到十二指腸上部上緣附近分為肝固有動脈與胃十二指腸動脈', 'Runs to the right along the upper border of the neck of the pancreas, behind the peritoneum of the back wall of the lesser sac, and divides near the upper border of the first part of the duodenum into the proper hepatic and gastroduodenal arteries'),
    主要分支: e('肝固有動脈、胃十二指腸動脈', 'Hepatic artery proper and gastroduodenal artery'),
    供應範圍: e('肝、膽道、胃右側、十二指腸近端與胰頭（經其分支）', 'The liver, bile ducts, right side of the stomach, proximal duodenum and head of the pancreas through its branches'),
  },
  'hepatic artery proper': {
    來源: e('總肝動脈分出胃十二指腸動脈之後的延續', 'The continuation of the common hepatic artery after the gastroduodenal artery is given off'),
    走向: e('在肝十二指腸韌帶（小網膜游離緣）內上行，位於門靜脈的前方、膽總管的左側，到肝門附近分為左、右肝動脈', 'Ascends in the hepatoduodenal ligament (free edge of the lesser omentum) in front of the portal vein and to the left of the bile duct, and divides near the porta hepatis into the left and right hepatic arteries'),
    主要分支: e('右胃動脈、左肝動脈、右肝動脈', 'Right gastric artery and the left and right hepatic arteries'),
    供應範圍: e('肝與膽道', 'The liver and biliary tract'),
  },
  'left hepatic artery': {
    來源: e('肝固有動脈在肝門的左側終支', 'The left terminal branch of the hepatic artery proper at the porta hepatis'),
    走向: e('進入肝門左側，沿門靜脈左支走向左葉；若自左胃動脈發出，稱為替代肝左動脈（若除正常的肝左動脈外另有一條，稱副肝左動脈），是常見變異', 'Enters the left side of the porta hepatis and runs with the left branch of the portal vein to the left lobe; when it arises from the left gastric artery it is called a replaced left hepatic artery (an accessory left hepatic artery if there is one in addition to the normal left hepatic artery), a common variant'),
    供應範圍: e('肝左葉與方葉（內側段），並分支供應尾狀葉', 'The left lobe and quadrate lobe (medial segment) of the liver, with branches to the caudate lobe'),
  },
  'right hepatic artery': {
    來源: e('肝固有動脈在肝門右側的終支；約有一成多起自上腸繫膜動脈（替代肝右動脈），是最常見的肝動脈變異之一', 'The right terminal branch of the hepatic artery proper; in more than one in ten people it arises from the superior mesenteric artery (a replaced right hepatic artery), one of the commonest hepatic arterial variants'),
    走向: e('向右走，約三分之二在總肝管後方越過，其餘在前方，進入肝門右側；替代型則走在門靜脈後方。途中通常在膽囊三角內發出膽囊動脈', 'Runs to the right, passing behind the common hepatic duct in about two thirds of people and in front of it in the rest, to enter the right side of the porta hepatis (a replaced one runs behind the portal vein); it usually gives off the cystic artery within the cystohepatic triangle'),
    主要分支: e('膽囊動脈', 'Cystic artery'),
    供應範圍: e('肝右葉與膽囊', 'The right lobe of the liver and the gallbladder'),
  },
  'right gastric artery': {
    來源: e('通常起自肝固有動脈，也可起自總肝動脈或胃十二指腸動脈', 'Usually from the hepatic artery proper, sometimes from the common hepatic or gastroduodenal artery'),
    走向: e('在小網膜內向左走到幽門上緣，再沿胃小彎向左上方，與左胃動脈相吻合', 'Runs to the left in the lesser omentum to the upper border of the pylorus, then along the lesser curvature to the left and upward, anastomosing with the left gastric artery'),
    供應範圍: e('幽門與胃小彎右側（胃竇側）', 'The pylorus and the right (antral) part of the lesser curvature'),
  },
  'gastroduodenal artery': {
    來源: e('總肝動脈的終末分支之一，在十二指腸上部上緣附近發出', 'One of the two terminal branches of the common hepatic artery, arising near the upper border of the first part of the duodenum'),
    走向: e('在十二指腸上部後方下行，位於胰頸前方偏右，並在十二指腸上部下緣分為右胃網膜動脈與前上胰十二指腸動脈（後上胰十二指腸動脈較早自其後壁發出）', 'Descends behind the first part of the duodenum, in front of the neck of the pancreas on the right, and divides at the lower border of the duodenum into the right gastro-omental and anterior superior pancreaticoduodenal arteries (the posterior superior pancreaticoduodenal artery arises earlier from its back wall)'),
    主要分支: e('上十二指腸動脈（不恆定）、後上胰十二指腸動脈、右胃網膜動脈、前上胰十二指腸動脈', 'Supraduodenal artery (inconstant), posterior superior pancreaticoduodenal artery, right gastro-omental artery and anterior superior pancreaticoduodenal artery'),
    供應範圍: e('胃大彎右側、十二指腸上部與胰頭；十二指腸後壁潰瘍侵蝕時可大量出血', 'The right part of the greater curvature, the first part of the duodenum and the head of the pancreas; erosion by a posterior duodenal ulcer can cause heavy bleeding'),
  },
  'right gastro-omental artery': {
    來源: e('胃十二指腸動脈的較大終支', 'The larger terminal branch of the gastroduodenal artery'),
    走向: e('在幽門下方進入大網膜前兩層之間，沿胃大彎向左，與左胃網膜動脈相吻合', 'Enters the layers of the greater omentum below the pylorus and runs to the left along the greater curvature to anastomose with the left gastro-omental artery'),
    供應範圍: e('胃大彎右側部分的前後壁與大網膜', 'The front and back walls of the right part of the greater curvature and the greater omentum'),
  },
  'superior pancreaticoduodenal artery': {
    來源: e('胃十二指腸動脈的分支，包括前、後兩支：後支在十二指腸上部後方較高處發出，前支為其終末支之一', 'Branches of the gastroduodenal artery, comprising anterior and posterior branches: the posterior branch arises higher up, behind the first part of the duodenum, and the anterior branch is one of its terminal branches'),
    走向: e('沿胰頭與十二指腸降部之間的溝下行，與下胰十二指腸動脈吻合，構成腹腔動脈幹與上腸繫膜動脈之間的重要側支通路', 'Descends in the groove between the head of the pancreas and the descending duodenum and anastomoses with the inferior pancreaticoduodenal artery, forming an important collateral route between the celiac trunk and superior mesenteric artery'),
    主要分支: e('前上胰十二指腸動脈、後上胰十二指腸動脈', 'Anterior and posterior superior pancreaticoduodenal arteries'),
    供應範圍: e('胰頭與十二指腸降部', 'The head of the pancreas and the descending duodenum'),
  },
  'anterior superior pancreaticoduodenal artery': {
    來源: e('胃十二指腸動脈的終末分支', 'A terminal branch of the gastroduodenal artery'),
    走向: e('沿胰頭前面靠近十二指腸處下行，與前下胰十二指腸動脈相接成弓', 'Descends on the front of the head of the pancreas next to the duodenum and joins the anterior inferior pancreaticoduodenal artery to form an arcade'),
    供應範圍: e('胰頭前面與十二指腸降部前壁', 'The front of the head of the pancreas and the front of the descending duodenum'),
  },
  'posterior superior pancreaticoduodenal artery': {
    來源: e('胃十二指腸動脈在十二指腸上部後方發出（先於前支發出）', 'Arises from the gastroduodenal artery behind the first part of the duodenum (before the anterior branch)'),
    走向: e('沿胰頭後面下行，貼近膽總管（上段在其前方，再轉到其後方），隨後與後下支相接成弓', 'Descends on the back of the head of the pancreas close to the bile duct (in front of its upper part, then passing behind it), and then joins the posterior inferior branch to form an arcade'),
    供應範圍: e('胰頭後面、膽總管下段與十二指腸降部後壁', 'The back of the head of the pancreas, the lower bile duct and the back of the descending duodenum'),
  },
  'supraduodenal artery': {
    來源: e('不恆定的小動脈，常起自胃十二指腸動脈，也可起自肝動脈', 'An inconstant small artery, commonly from the gastroduodenal artery and sometimes from the hepatic artery'),
    走向: e('向前走到十二指腸上部', 'Passes forward to the first part of the duodenum'),
    供應範圍: e('十二指腸上部（球部）的上方與前後壁', 'The upper part and front and back walls of the first part (bulb) of the duodenum'),
  },
  'superior mesenteric artery': {
    來源: e('約在第一腰椎（L1）高度，腹腔動脈幹下方約一公分處，由腹主動脈前壁發出', 'Arises from the front of the abdominal aorta at about L1, roughly 1 cm below the celiac trunk'),
    走向: e('先在胰頸與脾靜脈後方下行，越過左腎靜脈、鉤突與十二指腸第三部前方，進入腸繫膜根，在小腸繫膜內向右下走向右髂窩，終末與迴結腸動脈相吻合', 'First descends behind the neck of the pancreas and the splenic vein, crosses in front of the left renal vein, uncinate process and third part of the duodenum, then enters the root of the mesentery and runs down to the right iliac fossa, ending by anastomosing with the ileocolic artery'),
    主要分支: e('下胰十二指腸動脈；左側有空腸動脈與迴腸動脈；右側有中結腸動脈、右結腸動脈與迴結腸動脈', 'Inferior pancreaticoduodenal artery; on the left the jejunal and ileal arteries; on the right the middle colic, right colic and ileocolic arteries'),
    供應範圍: e('中腸衍生的器官：十二指腸（大十二指腸乳頭以下）、空腸、迴腸、盲腸、闌尾、升結腸與橫結腸近三分之二，另供應部分胰頭', 'Midgut derivatives: the duodenum below the major duodenal papilla, jejunum, ileum, caecum, appendix, ascending colon and the proximal two thirds of the transverse colon, plus part of the head of the pancreas'),
  },
  'inferior pancreaticoduodenal artery': {
    來源: e('上腸繫膜動脈剛離開主動脈後發出的第一條分支（也可與第一空腸動脈共幹）', 'The first branch of the superior mesenteric artery, close to its origin (it may share a trunk with the first jejunal artery)'),
    走向: e('沿十二指腸第三部上緣附近向右，分成前、後兩支，在胰頭與十二指腸之間上行，與上胰十二指腸動脈的前、後支相吻合', 'Passes to the right near the upper border of the third part of the duodenum and divides into anterior and posterior branches that ascend between the head of the pancreas and the duodenum to anastomose with the corresponding superior pancreaticoduodenal branches'),
    主要分支: e('前下胰十二指腸動脈、後下胰十二指腸動脈', 'Anterior and posterior inferior pancreaticoduodenal arteries'),
    供應範圍: e('胰頭下部與十二指腸降部下段、水平部', 'The lower head of the pancreas and the lower descending and horizontal parts of the duodenum'),
  },
  'anterior inferior pancreaticoduodenal artery': {
    來源: e('下胰十二指腸動脈的前支', 'The anterior branch of the inferior pancreaticoduodenal artery'),
    走向: e('沿胰頭前面向上，與前上胰十二指腸動脈相接成弓', 'Ascends on the front of the head of the pancreas and joins the anterior superior pancreaticoduodenal artery to form an arcade'),
    供應範圍: e('胰頭前下部與鄰近十二指腸', 'The front and lower part of the head of the pancreas and the adjacent duodenum'),
  },
  'posterior inferior pancreaticoduodenal artery': {
    來源: e('下胰十二指腸動脈的後支', 'The posterior branch of the inferior pancreaticoduodenal artery'),
    走向: e('沿胰頭後面向上，與後上胰十二指腸動脈相接成弓', 'Ascends on the back of the head of the pancreas and joins the posterior superior pancreaticoduodenal artery to form an arcade'),
    供應範圍: e('胰頭後下部與鄰近十二指腸', 'The back and lower part of the head of the pancreas and the adjacent duodenum'),
  },
  'jejunal arteries': {
    來源: e('上腸繫膜動脈左側壁發出的一組分支（常與迴腸動脈合計約十二至十五條）', 'A group of branches from the left side of the superior mesenteric artery (together with the ileal arteries commonly about 12 to 15)'),
    走向: e('在小腸繫膜內向左走，分支相互吻合成動脈弓，再發出直小動脈（直血管）到空腸壁；空腸的弓層數較少、直血管較長', 'Run to the left in the mesentery and join in arterial arcades from which straight vessels (vasa recta) reach the jejunal wall; the jejunum has fewer arcade layers and longer straight vessels'),
    供應範圍: e('空腸', 'The jejunum'),
  },
  'ileal arteries': {
    來源: e('上腸繫膜動脈左側壁發出、位置較下方的一組分支', 'The lower group of branches from the left side of the superior mesenteric artery'),
    走向: e('在小腸繫膜內向左下走，形成多層動脈弓，再發出較短的直小動脈到迴腸壁；最末段由迴結腸動脈的迴腸支接續', 'Run down and to the left in the mesentery, forming several layers of arcades from which shorter straight vessels reach the ileal wall; the last part is supplied by the ileal branch of the ileocolic artery'),
    供應範圍: e('迴腸', 'The ileum'),
  },
  'ileocolic artery': {
    來源: e('上腸繫膜動脈右側壁發出的最下一條分支', 'The lowest branch from the right side of the superior mesenteric artery'),
    走向: e('在腹膜後向右下走向迴盲部，分為上支（升結腸支）與下支；下支發出前、後盲腸動脈、闌尾動脈與迴腸支', 'Runs down and to the right behind the peritoneum towards the ileocaecal junction and divides into a superior (colic) branch and an inferior branch, which gives anterior and posterior caecal arteries, the appendicular artery and an ileal branch'),
    主要分支: e('結腸支、前盲腸動脈、後盲腸動脈、闌尾動脈、迴腸支', 'Colic, anterior caecal, posterior caecal, appendicular and ileal branches'),
    供應範圍: e('迴腸末端、盲腸、闌尾與升結腸下段', 'The terminal ileum, caecum, appendix and lower ascending colon'),
  },
  'appendicular artery': {
    來源: e('迴結腸動脈（或其後盲腸分支）的分支', 'A branch of the ileocolic artery (or of its posterior caecal branch)'),
    走向: e('經迴腸末端後方下降，進入闌尾繫膜，沿其游離緣到達闌尾尖端', 'Descends behind the terminal ileum into the mesoappendix and runs along its free edge to the tip of the appendix'),
    供應範圍: e('闌尾；它是終動脈，血流中斷時闌尾容易壞死', 'The appendix; it is an end artery, so interruption of flow readily leads to necrosis of the appendix'),
  },
  'right colic artery': {
    來源: e('上腸繫膜動脈右側壁，也常與迴結腸動脈共幹，有時缺如', 'From the right side of the superior mesenteric artery, often by a common trunk with the ileocolic artery, and sometimes absent'),
    走向: e('在腹膜後向右走，橫過右輸尿管、生殖腺血管及腰大肌，接近升結腸時分為上行支與下行支', 'Runs to the right behind the peritoneum, crossing the right ureter, gonadal vessels and psoas major, and divides near the ascending colon into ascending and descending branches'),
    供應範圍: e('升結腸（尤其上半）；上行支與中結腸動脈、下行支與迴結腸動脈吻合', 'The ascending colon, especially its upper half; the ascending branch anastomoses with the middle colic artery and the descending branch with the ileocolic artery'),
  },
  'middle colic artery': {
    來源: e('上腸繫膜動脈在胰頸下緣附近發出的分支', 'A branch of the superior mesenteric artery near the lower border of the neck of the pancreas'),
    走向: e('進入橫結腸繫膜，向前下走並分為右支與左支；右支與右結腸動脈吻合，左支與左結腸動脈吻合', 'Enters the transverse mesocolon, runs forward and down, and divides into right and left branches; the right branch anastomoses with the right colic artery and the left branch with the left colic artery'),
    供應範圍: e('橫結腸的近三分之二；與左結腸動脈的吻合是上、下腸繫膜動脈之間的重要側支（邊緣動脈）', 'The proximal two thirds of the transverse colon; its anastomosis with the left colic artery is a key collateral between the superior and inferior mesenteric territories (the marginal artery)'),
  },
  'inferior mesenteric artery': {
    來源: e('約在第三腰椎（L3）高度，主動脈分叉上方約三至四公分，由腹主動脈前壁偏左發出', 'Arises from the front of the abdominal aorta, slightly to the left, at about L3 and 3 to 4 cm above the aortic bifurcation'),
    走向: e('在十二指腸第三部下方的腹膜後向左下走，在左腰大肌前方下行，越過左總髂動脈在骨盆緣處續為上直腸動脈', 'Runs down and to the left behind the peritoneum below the third part of the duodenum, in front of the left psoas major, and crosses the left common iliac vessels at the pelvic brim, where it continues as the superior rectal artery'),
    主要分支: e('左結腸動脈、乙狀結腸動脈、上直腸動脈', 'Left colic, sigmoid and superior rectal arteries'),
    供應範圍: e('後腸衍生的器官：橫結腸遠端約三分之一、降結腸、乙狀結腸、直腸上部（經上直腸動脈下達肛管上段）', 'Hindgut derivatives: the distal third of the transverse colon, descending colon, sigmoid colon and upper rectum (reaching the upper anal canal through the superior rectal artery)'),
  },
  'left colic artery': {
    來源: e('下腸繫膜動脈離開主動脈後不久發出的第一條分支', 'The first branch of the inferior mesenteric artery, arising soon after it leaves the aorta'),
    走向: e('在腹膜後向左走，橫過左輸尿管與生殖腺血管前方，分為上行支與下行支', 'Runs to the left behind the peritoneum in front of the left ureter and gonadal vessels and divides into ascending and descending branches'),
    供應範圍: e('橫結腸遠端、結腸脾曲與降結腸；上行支與中結腸動脈、下行支與乙狀結腸動脈吻合', 'The distal transverse colon, splenic flexure and descending colon; the ascending branch anastomoses with the middle colic artery and the descending branch with the sigmoid arteries'),
  },
  'sigmoid arteries': {
    來源: e('下腸繫膜動脈的分支（通常有二至三條，也可起自左結腸動脈）', 'Branches of the inferior mesenteric artery (usually two or three, sometimes from the left colic artery)'),
    走向: e('進入乙狀結腸繫膜，向左下走向乙狀結腸，各自分成上行支與下行支並相互吻合', 'Enter the sigmoid mesocolon and run down and to the left to the sigmoid colon, each dividing into ascending and descending branches that anastomose with one another'),
    供應範圍: e('降結腸下端與乙狀結腸；上方與左結腸動脈、下方與上直腸動脈吻合', 'The lower descending colon and the sigmoid colon, anastomosing above with the left colic artery and below with the superior rectal artery'),
  },
  'superior rectal artery': {
    來源: e('下腸繫膜動脈的延續，在骨盆緣處越過左總髂動脈後得名', 'The continuation of the inferior mesenteric artery, named after it crosses the left common iliac vessels at the pelvic brim'),
    走向: e('在乙狀結腸繫膜根內下行至骨盆，常在約第三薦椎高度分成左、右兩支，沿直腸兩側的後外側下行到達直腸壁', 'Descends in the root of the sigmoid mesocolon into the pelvis and often at about S3 divides into left and right branches that run down the posterolateral sides of the rectum to its wall'),
    供應範圍: e('直腸上部至中部，並下達肛管上段；與中直腸動脈及下直腸動脈吻合', 'The upper and middle rectum and the upper anal canal, anastomosing with the middle and inferior rectal arteries'),
  },
});
// ===== AB-A1 end =====

// ===== HN-EC begin =====
Object.assign(CARD_EXTRAS, {
  'superior thyroid artery': {
    來源: e('外頸動脈的第一條前壁分支，在頸動脈三角內、舌骨大角下方附近發出', 'The first anterior branch of the external carotid artery, arising in the carotid triangle just below the greater horn of the hyoid bone'),
    走向: e('向前下彎成弧形，深入肩胛舌骨肌、胸骨舌骨肌與胸骨甲狀肌，到達甲狀腺上極；上極處與喉外神經相鄰', 'Arches forward and downward, passing deep to omohyoid, sternohyoid and sternothyroid to reach the upper pole of the thyroid gland, where it lies close to the external laryngeal nerve'),
    主要分支: e('舌骨下支、胸鎖乳突肌支、上喉動脈（與喉內神經一同穿過甲狀舌骨膜）、環甲支，以及供應腺體的前、後與外側支', 'Infrahyoid, sternocleidomastoid, superior laryngeal (passing through the thyrohyoid membrane with the internal laryngeal nerve) and cricothyroid branches, and the anterior, posterior and lateral glandular branches'),
    供應範圍: e('甲狀腺上部、喉、舌骨下肌群與胸鎖乳突肌；腺內與下甲狀腺動脈、對側同名動脈相吻合', 'The upper part of the thyroid gland, the larynx, the infrahyoid muscles and sternocleidomastoid; within the gland it anastomoses with the inferior thyroid artery and with its fellow of the opposite side'),
  },
  'ascending pharyngeal artery': {
    來源: e('外頸動脈起始部附近的後內側壁分支，是外頸動脈最細的分支', 'A branch from the posteromedial wall of the external carotid artery near its origin; the smallest branch of that artery'),
    走向: e('沿咽側壁、在內頸動脈內側垂直上行，到達顱底附近', 'Ascends vertically along the side wall of the pharynx, medial to the internal carotid artery, as far as the base of the skull'),
    主要分支: e('咽支、下鼓室動脈、後腦膜動脈（經頸靜脈孔入顱）與椎前肌支', 'Pharyngeal branches, the inferior tympanic artery, the posterior meningeal artery (entering the skull through the jugular foramen) and branches to the prevertebral muscles'),
    供應範圍: e('咽壁、扁桃體、軟顎、中耳與頸椎前肌，以及顱後窩的硬腦膜', 'The pharyngeal wall, tonsil, soft palate, middle ear and prevertebral muscles, and the dura mater of the posterior cranial fossa'),
  },
  'lingual artery': {
    來源: e('外頸動脈的前壁分支，約在舌骨大角尖端高度、顏面動脈起點之下發出', 'An anterior branch of the external carotid artery, arising at about the level of the tip of the greater horn of the hyoid bone, below the origin of the facial artery'),
    走向: e('先向上呈小弧形，再在舌骨大角上緣上方向前走；舌下神經橫過其淺面，接著深入舌骨舌肌的深面，其深側緊貼中咽縮肌，再前行入舌', 'Loops upward first, then runs forward above the greater horn of the hyoid bone; the hypoglossal nerve crosses its superficial side, and it then passes deep to hyoglossus, lying on the middle constrictor, before entering the tongue'),
    主要分支: e('舌骨上支、舌背支、舌下動脈與舌深動脈（為終末支）', 'Suprahyoid and dorsal lingual branches, the sublingual artery, and the deep lingual artery as its terminal branch'),
    供應範圍: e('舌、口腔底、舌下腺、扁桃體與會厭；舌深動脈在舌下面走近舌繫帶兩側', 'The tongue, floor of the mouth, sublingual gland, tonsil and epiglottis; the deep lingual artery runs on the underside of the tongue close to the frenulum'),
  },
  'facial artery': {
    來源: e('外頸動脈的前壁分支，在舌動脈起點的稍上方發出', 'An anterior branch of the external carotid artery, arising just above the lingual artery'),
    走向: e('先在二腹肌後腹與莖突舌骨肌深面上行，再貼著下頜下腺後方壓出溝槽，於咬肌前緣繞過下頜骨下緣上到顏面，彎曲地經口角外側、鼻翼旁抵達內眥', 'Ascends first deep to the posterior belly of digastric and stylohyoid, grooves the back of the submandibular gland, then winds over the lower border of the mandible at the front edge of masseter onto the face and runs tortuously beside the angle of the mouth and the side of the nose to the medial angle of the eye'),
    主要分支: e('頸部：升顎動脈、扁桃體支、腺支與頦下動脈；顏面部：下唇動脈、上唇動脈、鼻外側動脈，終支為角動脈', 'In the neck: ascending palatine, tonsillar, glandular and submental arteries; on the face: inferior and superior labial and lateral nasal arteries, ending as the angular artery'),
    供應範圍: e('扁桃體與軟顎、下頜下腺、口唇、鼻與內眥一帶的顏面；角動脈與眼動脈的鼻背支吻合，連結內、外頸動脈系統；在下頜骨下緣、咬肌前方可摸到搏動，其靜脈走在動脈後方', 'The tonsil and soft palate, submandibular gland, lips, and the face around the nose and medial angle of the eye; the angular artery anastomoses with the dorsal nasal branch of the ophthalmic artery, linking the internal and external carotid systems; its pulse can be felt on the lower border of the mandible in front of masseter, with the facial vein lying behind the artery'),
  },
  'occipital artery': {
    來源: e('外頸動脈的後壁分支，約與顏面動脈同一高度，起於二腹肌後腹下緣', 'A posterior branch of the external carotid artery, arising at about the level of the facial artery at the lower border of the posterior belly of digastric'),
    走向: e('沿顳骨乳突內側的枕動脈溝向後上行，淺越過內頸動脈、內頸靜脈、迷走神經與副神經，舌下神經由後向前繞過其起始部；行程中被胸鎖乳突肌、頭夾肌、頭最長肌與二腹肌後腹覆蓋，之後在斜方肌與胸鎖乳突肌附著於上項線處穿出筋膜，彎曲上行於後頭皮', 'Runs backward and upward along the occipital groove on the medial side of the mastoid process of the temporal bone, crossing superficial to the internal carotid artery, internal jugular vein, vagus and accessory nerves, with the hypoglossal nerve hooking round its origin from behind forward; it is covered by sternocleidomastoid, splenius capitis, longissimus capitis and the posterior belly of digastric, then pierces the fascia at the trapezius and sternocleidomastoid attachments to the superior nuchal line and ascends tortuously in the back of the scalp'),
    主要分支: e('胸鎖乳突肌支、耳支、腦膜支、降支（與深頸動脈、橫頸動脈相吻合）與枕支', 'Sternocleidomastoid, auricular and meningeal branches, a descending branch (anastomosing with the deep cervical and transverse cervical arteries) and occipital branches'),
    供應範圍: e('後頭皮、頸後部深層肌肉、胸鎖乳突肌與乳突、硬腦膜', 'The back of the scalp, the deep muscles of the back of the neck, sternocleidomastoid, the mastoid region and the dura mater'),
  },
  'posterior auricular artery': {
    來源: e('外頸動脈的後壁分支，位於二腹肌與莖突舌骨肌上方，通常在腮腺深部或其邊緣發出', 'A posterior branch of the external carotid artery arising above digastric and stylohyoid, usually deep to or at the edge of the parotid gland'),
    走向: e('在耳廓與乳突之間向後上行，沿乳突前方抵達耳後頭皮', 'Ascends between the auricle and the mastoid process and reaches the scalp behind the ear'),
    主要分支: e('莖乳動脈（經莖乳孔入顏面神經管）、耳支、枕支與腮腺支', 'The stylomastoid artery (entering the facial canal through the stylomastoid foramen), and auricular, occipital and parotid branches'),
    供應範圍: e('耳廓後面、耳後頭皮、腮腺，以及經莖乳動脈供應中耳、乳突小房與顏面神經；與枕動脈、淺顳動脈相吻合', 'The back of the auricle, the scalp behind the ear and the parotid gland, and through the stylomastoid artery the middle ear, mastoid air cells and facial nerve; it anastomoses with the occipital and superficial temporal arteries'),
  },
  'maxillary artery': {
    來源: e('外頸動脈兩條終末支中較大的一條，在腮腺內、下頜頸後方發出', 'The larger of the two terminal branches of the external carotid artery, arising within the parotid gland behind the neck of the mandible'),
    走向: e('以外側翼肌為界分三段：下頜段起於下頜頸後方，經下頜頸深面（內側、蝶下頜韌帶外側）向前進入顳下窩；翼段沿外側翼肌的淺面或深面行走（個體有差異，以淺面較常見）；翼顎段穿過翼上頜裂進入翼顎窩', 'Divided by lateral pterygoid into three parts: the mandibular part begins behind the neck of the mandible and passes forward deep (medial) to the neck, lateral to the sphenomandibular ligament, into the infratemporal fossa; the pterygoid part runs on the superficial or deep surface of lateral pterygoid (this varies between people, the superficial course being more common); the pterygopalatine part passes through the pterygomaxillary fissure into the pterygopalatine fossa'),
    主要分支: e('下頜段：深耳動脈、前鼓室動脈、中腦膜動脈（經棘孔入顱）、下齒槽動脈、副腦膜動脈；翼段：咬肌動脈、深顳動脈、翼肌支、頰動脈；翼顎段：上牙槽後動脈、眶下動脈、降顎動脈、翼管動脈、咽支與蝶顎動脈', 'Mandibular part: deep auricular, anterior tympanic, middle meningeal (entering the skull through the foramen spinosum), inferior alveolar and accessory meningeal arteries; pterygoid part: masseteric, deep temporal, pterygoid and buccal branches; pterygopalatine part: posterior superior alveolar, infraorbital, descending palatine, artery of the pterygoid canal, pharyngeal and sphenopalatine arteries'),
    供應範圍: e('深層顏面：上下頜骨與牙齒、咀嚼肌、鼻腔與硬顎、軟顎、硬腦膜（中腦膜動脈）與中耳', 'The deep face: the jaws and teeth, the muscles of mastication, the nasal cavity and hard and soft palate, the dura mater (middle meningeal artery) and the middle ear'),
  },
  'superficial temporal artery': {
    來源: e('外頸動脈兩條終末支中較小的一條，在腮腺內、下頜頸後方發出，可視為外頸動脈的延續', 'The smaller terminal branch of the external carotid artery, arising within the parotid gland behind the neck of the mandible and seen as its continuation'),
    走向: e('向上越過顴弓根部，在耳屏前方上行，耳顳神經走在其後方；約在顴弓上方五公分處（高度因人而異）分為額支與頂支', 'Ascends across the root of the zygomatic arch in front of the tragus, with the auriculotemporal nerve lying behind it, and divides about 5 cm above the arch into frontal and parietal branches'),
    主要分支: e('橫面動脈（在腮腺內發出，走在顴弓下方與腮腺管上方）、中顳動脈、顴眶動脈、前耳支，終支為額支與頂支', 'The transverse facial artery (given off within the parotid gland and running below the zygomatic arch and above the parotid duct), middle temporal, zygomatico-orbital and anterior auricular branches, ending as the frontal and parietal branches'),
    供應範圍: e('顳部與額頂部頭皮、耳廓前部、顳肌與顏面側部；在耳屏前方可摸到搏動，與眼動脈、後耳動脈、枕動脈的分支相吻合', 'The scalp of the temporal, frontal and parietal regions, the front of the auricle, temporalis and the side of the face; its pulse can be felt in front of the tragus, and it anastomoses with branches of the ophthalmic, posterior auricular and occipital arteries'),
  },
});
// ===== HN-EC end =====

// ===== HN-A1 begin: root of the neck — vessels, cervical vertebrae, ligaments, raphes, thymus, oesophagus, sympathetic trunk (card batch HN-A1). Standard anatomy only; a field we are not sure of stays out. =====
Object.assign(CARD_EXTRAS, {
  'brachiocephalic trunk': {
    來源: e('主動脈弓凸側的第一條分支，起自胸骨柄後方的上縱隔；只有右側有此幹，左側的總頸動脈與左鎖骨下動脈直接由主動脈弓發出', 'The first branch from the convexity of the aortic arch, arising in the superior mediastinum behind the manubrium; it exists on the right only, the left common carotid and left subclavian arteries arising directly from the arch'),
    走向: e('向右上斜行，約長四至五公分，前方有左頭臂靜脈與胸腺殘餘，後方為氣管，右側為右頭臂靜脈；到右胸鎖關節後方分為兩支', 'Runs obliquely up and to the right for about 4 to 5 cm, with the left brachiocephalic vein and thymic remnants in front, the trachea behind and the right brachiocephalic vein to its right; it divides behind the right sternoclavicular joint'),
    主要分支: e('右鎖骨下動脈與右總頸動脈；偶有最下甲狀腺動脈自幹發出，也可起自主動脈弓或右總頸動脈', 'The right subclavian artery and the right common carotid artery; occasionally a thyroidea ima artery arises from the trunk, and it may also arise from the aortic arch or the right common carotid artery'),
    供應範圍: e('右頭頸部與右上肢（經兩條終支）', 'The right side of the head and neck and the right upper limb, through its two terminal branches'),
  },
  'internal thoracic artery': {
    來源: e('鎖骨下動脈第一段的下壁，與甲狀頸動脈幹的起點相對', 'From the inferior surface of the first part of the subclavian artery, opposite the origin of the thyrocervical trunk'),
    走向: e('向下經鎖骨下靜脈後方進入胸腔，在前胸壁內側沿胸骨外側緣約一公分處下行；上段貼著壁胸膜、位於肋軟骨深面，下段在胸橫肌淺面；約在第六肋間隙分為兩終支', 'Passes down behind the subclavian vein into the thorax and descends about 1 cm lateral to the sternal border; its upper part lies against the parietal pleura deep to the costal cartilages and its lower part superficial to transversus thoracis; it divides into its two terminal branches at about the sixth intercostal space'),
    主要分支: e('心包膈動脈、胸骨支、穿通支、前肋間支、縱隔支與胸腺支；終支為肌膈動脈與上腹壁動脈', 'Pericardiophrenic artery, sternal, perforating, anterior intercostal, mediastinal and thymic branches; its terminal branches are the musculophrenic and superior epigastric arteries'),
    供應範圍: e('前胸壁、乳房、心包、橫膈與胸腺，並經上腹壁動脈到達腹直肌', 'The anterior chest wall, breast, pericardium, diaphragm and thymus, and through the superior epigastric artery the rectus abdominis'),
  },
  'suprascapular artery': {
    來源: e('通常起自甲狀頸動脈幹，有時直接起自鎖骨下動脈，少數起自內胸動脈', 'Usually from the thyrocervical trunk; sometimes directly from the subclavian artery and rarely from the internal thoracic artery'),
    走向: e('橫越前斜角肌與膈神經的前方，在鎖骨後方沿肩胛舌骨肌下腹行向外側；越過肩胛上橫韌帶的上方進入棘上窩，繞過肩胛頸的棘盂切跡進入棘下窩', 'Crosses in front of scalenus anterior and the phrenic nerve and runs laterally behind the clavicle along the inferior belly of omohyoid; it passes over the superior transverse scapular ligament into the supraspinous fossa and winds around the spinoglenoid notch into the infraspinous fossa'),
    主要分支: e('胸鎖乳突肌支、肩峰支、棘上與棘下肌支，並發出關節支；在肩胛頸處與旋肩胛動脈、頸橫動脈降支相吻合', 'Sternocleidomastoid and acromial branches, branches to supraspinatus and infraspinatus and articular branches; it anastomoses with the circumflex scapular artery and the descending branch of the transverse cervical artery around the scapular neck'),
    供應範圍: e('棘上肌、棘下肌、肩胛骨與肩關節，並與周圍動脈構成肩胛周圍吻合', 'Supraspinatus, infraspinatus, the scapula and the shoulder joint, forming the scapular anastomosis with neighbouring arteries'),
  },
  'thyrocervical trunk': {
    來源: e('鎖骨下動脈第一段的前上壁，在前斜角肌內側緣附近、椎動脈起點外側發出', 'From the front of the first part of the subclavian artery, near the medial border of scalenus anterior and lateral to the origin of the vertebral artery'),
    走向: e('非常短（約一公分），向上發出後即分為多條分支；膈神經沿前斜角肌前面下行，位於其前方', 'A very short trunk (about 1 cm) that divides almost at once into several branches; the phrenic nerve descends on the front of scalenus anterior, in front of it'),
    主要分支: e('甲狀腺下動脈（頸升動脈多由此發出）、頸橫動脈與肩胛上動脈', 'The inferior thyroid artery (the ascending cervical artery usually arises from it), the transverse cervical artery and the suprascapular artery'),
    供應範圍: e('甲狀腺、喉與氣管下部、食道頸段、頸後三角與肩胛區的肌肉，並由頸升動脈供應頸部深層肌與脊髓', 'The thyroid gland, lower larynx and trachea, cervical oesophagus, the muscles of the posterior triangle and scapular region, and through the ascending cervical artery the deep neck muscles and spinal cord'),
  },
  'brachiocephalic vein': {
    來源: e('由同側的鎖骨下靜脈與內頸靜脈在胸鎖關節後方匯合而成（靜脈角）', 'Formed behind the sternoclavicular joint by the union of the subclavian and internal jugular veins of the same side (the venous angle)'),
    走向: e('右側短而幾乎垂直下行；左側長約六公分，斜越過主動脈弓三條大分支的前方到達右側；兩條在右第一肋軟骨下緣後方匯成上腔靜脈', 'The right vein is short and runs almost vertically down; the left is about 6 cm long and crosses obliquely in front of the three great branches of the aortic arch to reach the right side; the two unite behind the lower border of the right first costal cartilage to form the superior vena cava'),
    主要分支: e('椎靜脈、甲狀腺下靜脈、內胸靜脈、最上肋間靜脈與胸腺靜脈；左側還有心包靜脈與支氣管靜脈', 'Vertebral, inferior thyroid, internal thoracic, supreme intercostal and thymic veins, with pericardial and bronchial tributaries on the left'),
    引流範圍: e('頭頸、上肢與上胸壁的靜脈血，匯入上腔靜脈', 'Venous blood from the head and neck, upper limb and upper chest wall, which passes on into the superior vena cava'),
  },
  'subclavian vein': {
    來源: e('為腋靜脈在第一肋外側緣處的延續', 'The continuation of the axillary vein at the outer border of the first rib'),
    走向: e('在第一肋上方、前斜角肌的前方經過，與其後方的鎖骨下動脈被前斜角肌與膈神經隔開；繞過鎖骨後方行向內側，在胸鎖關節後方與內頸靜脈匯合；左側的胸導管與右側的右淋巴導管注入靜脈角', 'Passes over the first rib in front of scalenus anterior, which separates it from the subclavian artery behind; it runs medially behind the clavicle and joins the internal jugular vein behind the sternoclavicular joint; the thoracic duct on the left and the right lymphatic duct on the right enter at the venous angle'),
    主要分支: e('頸外靜脈、肩胛背靜脈（偶有頸前靜脈）', 'The external jugular and dorsal scapular veins (occasionally the anterior jugular vein)'),
    引流範圍: e('上肢的全部靜脈血，以及頸部淺層與肩部一部分的血液', 'All the venous blood of the upper limb, with part of that from the superficial neck and shoulder'),
  },
  'superior vena cava': {
    來源: e('由左、右頭臂靜脈在右第一肋軟骨下緣後方匯合而成', 'Formed by the union of the left and right brachiocephalic veins behind the lower border of the right first costal cartilage'),
    走向: e('在上縱隔右側垂直下行，約七公分；上半段在心包外，下半段被心包包裹；在右第三肋軟骨高度注入右心房上部，奇靜脈在其進入心包前由後方注入', 'Descends vertically on the right side of the superior mediastinum for about 7 cm; its upper half lies outside the pericardium and its lower half is enclosed by it; it opens into the upper right atrium at the level of the right third costal cartilage, the azygos vein joining it from behind just before it enters the pericardium'),
    主要分支: e('左、右頭臂靜脈與奇靜脈', 'The left and right brachiocephalic veins and the azygos vein'),
    引流範圍: e('頭、頸、上肢與胸壁上部的靜脈血，回流右心房', 'Venous blood of the head, neck, upper limbs and upper chest wall, returning it to the right atrium'),
  },
  'suprascapular vein': {
    來源: e('起自肩胛區，伴隨肩胛上動脈的小靜脈（常為兩條）', 'Small veins (often two) arising in the scapular region and accompanying the suprascapular artery'),
    走向: e('自棘上窩與棘下窩收集血液，越過肩胛上橫韌帶，沿鎖骨後方向內行', 'Collect blood from the supraspinous and infraspinous fossae, pass over the superior transverse scapular ligament and run medially behind the clavicle'),
    主要分支: e('棘上、棘下肌的肌支與肩峰區的小靜脈', 'Muscular veins from supraspinatus and infraspinatus and small veins from the acromial region'),
    引流範圍: e('棘上肌、棘下肌與肩胛區，通常匯入頸外靜脈，或注入鎖骨下靜脈，也可入頸橫靜脈或內頸靜脈', 'Supraspinatus, infraspinatus and the scapular region; it usually ends in the external jugular vein or the subclavian vein, and may also enter the transverse cervical or internal jugular vein'),
  },
  'cervical vertebrae': {
    主要標誌: e('脊柱最上段，共七節（C1 至 C7），支撐頭部並保護頸段脊髓與椎動脈；椎體小而寬；橫突有橫突孔，供椎動脈與椎靜脈通過（C7 的橫突孔通常只有細小血管）；C3 至 C6 的棘突短且末端分叉；上關節突朝後上，椎孔大而呈三角形；椎體上面兩側有鉤突，形成鉤椎關節', 'The uppermost part of the vertebral column, seven vertebrae (C1 to C7), supporting the head and protecting the cervical spinal cord and the vertebral arteries; small, broad bodies; the transverse processes have foramina transversaria that transmit the vertebral artery and vein (at C7 usually only small vessels); the spines of C3 to C6 are short and bifid; the superior articular facets face backward and upward, and the vertebral foramen is large and triangular; uncinate processes on the sides of the upper body surface form the uncovertebral joints'),
    相關關節: e('相鄰椎體之間為椎間盤，後方為關節突關節，椎體側緣為鉤椎關節；C1 與枕骨相接形成寰枕關節，C1 與 C2 形成寰軸關節', 'Intervertebral discs between adjacent bodies, zygapophyseal joints behind and uncovertebral joints at the sides of the bodies; C1 meets the occipital bone at the atlanto-occipital joint and C2 at the atlanto-axial joints'),
    附著肌肉: e('橫突前結節供前斜角肌、頸長肌附著；後結節供中斜角肌、肩胛提肌（C1–C4）與頸夾肌附著；棘突供項韌帶與半棘肌、多裂肌等附著', 'The anterior tubercles of the transverse processes give attachment to scalenus anterior and longus colli, and the posterior tubercles to scalenus medius, levator scapulae (C1 to C4) and splenius cervicis; the spines give attachment to the nuchal ligament, semispinalis and multifidus'),
  },
  'anterior longitudinal ligament': {
    附著: e('寬而堅韌的纖維帶，上端附著於枕骨底部的咽結節，並與寰枕前膜相續；沿各椎體與椎間盤的前面下行，下端終止於薦骨前面', 'A broad, strong fibrous band attached above to the pharyngeal tubercle of the occipital bone and continuous with the anterior atlanto-occipital membrane; it descends over the front of the vertebral bodies and discs and ends on the front of the sacrum'),
    毗鄰: e('前方為頸長肌、咽後壁與食道（頸段）及胸主動脈；深面與椎間盤及椎體邊緣緊密相連，在椎體中部較鬆', 'In front lie longus colli, the posterior wall of the pharynx and cervical oesophagus, and below that the thoracic aorta; its deep surface is firmly bound to the discs and the margins of the vertebral bodies and more loosely to the middle of each body'),
    作用: e('限制脊柱過度後伸，並加強椎間盤前方，防止椎體相對前移', 'Limits excessive extension of the vertebral column and reinforces the front of the discs, preventing the vertebral bodies from slipping forward on one another'),
  },
  'intermediate tendon': {
    起點: e('二腹肌後腹的肌腹末端', 'The end of the muscle belly of the posterior belly of digastric'),
    走向與通道: e('向前下穿過莖突舌骨肌止點附近，以纖維筋膜環繫於舌骨體與大角交界處', 'Passes forward and downward through the insertion of stylohyoid and is held to the hyoid bone at the junction of the body and greater horn by a fibrous sling'),
    止點: e('續接二腹肌前腹，前腹止於下頜骨的二腹肌窩', 'Continues into the anterior belly of digastric, which inserts into the digastric fossa of the mandible'),
    功能: e('讓二腹肌在舌骨處轉折，如同滑車；兩腹共同收縮時下壓下頜、上提舌骨', 'Lets digastric change direction at the hyoid like a pulley; when both bellies contract together they depress the mandible and elevate the hyoid'),
  },
  'nuchal ligament': {
    附著: e('頸後部正中的矢狀位纖維彈性薄板；上端附著於枕外隆凸與枕外嵴，並連接各頸椎棘突的尖端，下端附著於第七頸椎（隆椎）棘突，向下續為棘上韌帶', 'A sagittal sheet of fibro-elastic tissue in the midline at the back of the neck; attached above to the external occipital protuberance and crest, to the tips of the cervical spines in between and below to the spine of C7, where it continues as the supraspinous ligament'),
    毗鄰: e('兩側分隔左、右後頸肌群（夾肌與半棘肌），為斜方肌與小菱形肌提供附著面；淺面僅隔皮下組織與皮膚', 'Forms a median septum between the left and right posterior neck muscles (splenius and semispinalis) and provides an attachment surface for trapezius and rhomboid minor; superficially it lies directly beneath subcutaneous tissue and skin'),
    作用: e('頸部屈曲時繃緊，限制頭頸過度前屈，同時作為肌肉的附著膜', 'Becomes taut on flexion, limiting excessive forward bending of the head and neck; it also serves as a muscular attachment membrane'),
  },
  'thymus': {
    位置: e('位於前縱隔上部、胸骨柄後方，上端可向上延伸至頸根部甲狀腺下方；由左、右兩葉組成', 'In the upper part of the anterior mediastinum behind the manubrium, its upper end sometimes reaching into the root of the neck below the thyroid; it consists of two lobes'),
    組成: e('兩葉各分為許多小葉，每小葉有外層的皮質（密集的淋巴細胞）與內層的髓質（含胸腺小體）；相對身體比例以幼年最大，青春期後逐漸退化、被脂肪取代', 'Each lobe is divided into lobules with an outer cortex packed with lymphocytes and an inner medulla containing thymic corpuscles; largest relative to body size in early childhood, it involutes after puberty and is replaced by fat'),
    毗鄰: e('前方為胸骨柄與胸骨體上部及胸骨甲狀肌起始處；後方為心包、主動脈弓、頭臂靜脈與氣管；兩側為縱隔胸膜與肺', 'In front lie the manubrium, upper body of the sternum and the origin of sternothyroid; behind are the pericardium, aortic arch, brachiocephalic veins and trachea; at the sides the mediastinal pleura and lungs'),
    血液供應: e('主要來自內胸動脈與甲狀腺下動脈的胸腺支；靜脈注入左頭臂靜脈、內胸靜脈與甲狀腺下靜脈', 'Mainly thymic branches of the internal thoracic and inferior thyroid arteries; veins drain to the left brachiocephalic, internal thoracic and inferior thyroid veins'),
    神經支配: e('迷走神經的小支與交感神經', 'Small branches of the vagus nerve and sympathetic nerves'),
    作用: e('T 淋巴細胞分化與成熟的場所，是免疫系統的中樞淋巴器官', 'The site of differentiation and maturation of T lymphocytes; a primary lymphoid organ of the immune system'),
  },
  'levator scapulae': {
    起點: e('第一至第四頸椎橫突的後結節', 'Posterior tubercles of the transverse processes of the first to fourth cervical vertebrae'),
    止點: e('肩胛骨內側緣，自肩胛上角至肩胛棘根部之間', 'The medial border of the scapula between its superior angle and the root of the spine'),
    神經支配: e('肩胛背神經（C5 根），並有 C3 與 C4 頸神經的分支', 'Dorsal scapular nerve (C5 root), with branches of the cervical nerves C3 and C4'),
    作用: e('上提肩胛骨並使肩胛下角向內旋；肩胛固定時，單側收縮使頸部向同側側屈，雙側收縮使頸部後伸', 'Elevates the scapula and rotates its inferior angle medially; with the scapula fixed, one side bends the neck to the same side and both sides extend it'),
    血液供應: e('肩胛背動脈、頸橫動脈與頸升動脈的肌支', 'The dorsal scapular artery and muscular branches of the transverse cervical and ascending cervical arteries'),
  },
  'sympathetic trunk': {
    來源: e('由脊柱兩側的一串交感神經節以神經幹相連而成，自顱底延伸到尾骨前方；節前纖維由胸髓 T1 至 L2 側角經白交通支進入', 'A chain of sympathetic ganglia joined by nerve cords on each side of the vertebral column from the skull base to the front of the coccyx; preganglionic fibres enter from the lateral horn of T1 to L2 through white rami communicantes'),
    走向: e('頸段位於頸動脈鞘的後方、椎前筋膜的前方，在頸椎橫突與頸長肌的前面，有上、中、下三個神經節（中神經節常缺）；下神經節常與第一胸神經節合成星狀神經節（頸胸神經節）；其後續為胸、腰、薦段', 'The cervical part lies behind the carotid sheath and in front of the prevertebral fascia, on the front of the transverse processes of the cervical vertebrae and longus colli, with superior, middle (often absent) and inferior ganglia; the inferior often fuses with the first thoracic ganglion as the stellate (cervicothoracic) ganglion; below it continues as the thoracic, lumbar and sacral parts'),
    主要分支: e('灰交通支（到頸神經）、頸內動脈神經叢、頸外動脈神經叢、上、中、下心神經、咽支與喉咽支', 'Grey rami communicantes (to the cervical nerves), internal and external carotid plexuses, the superior, middle and inferior cardiac nerves, and pharyngeal branches'),
    支配範圍: e('頭頸部的汗腺、豎毛肌、血管平滑肌，瞳孔開大肌與上瞼板肌，以及心臟與唾液腺等；節後纖維循動脈或隨脊神經分布', 'Sweat glands, arrector pili muscles and vascular smooth muscle of the head and neck, dilator pupillae and superior tarsal muscle, and the heart and salivary glands; postganglionic fibres follow arteries or travel with spinal nerves'),
  },
  'esophagus': {
    位置: e('始於第六頸椎高度、環狀軟骨下緣（與咽相續），在頸部位於氣管後方稍偏左，下行入胸腔經後縱隔，約在第十胸椎高度穿過橫膈食道裂孔，止於胃的賁門（全長約 25 公分：頸段約 5 公分、胸段約 18 公分、腹段約 1–2 公分）', 'Begins at the level of C6 at the lower border of the cricoid cartilage, where it continues from the pharynx; in the neck it lies behind the trachea, slightly to the left, then descends through the posterior mediastinum and passes the oesophageal hiatus of the diaphragm at about T10 to end at the cardia of the stomach (about 25 cm in all: cervical part about 5 cm, thoracic part about 18 cm, abdominal part about 1 to 2 cm)'),
    組成: e('肌性管道：上三分之一為骨骼肌，中段混合，下三分之一為平滑肌；內面襯複層鱗狀上皮，外層頸段與胸段為外膜，沒有漿膜', 'A muscular tube: striated muscle in the upper third, mixed in the middle and smooth muscle in the lower third; lined by stratified squamous epithelium, with an adventitia rather than a serosa in the neck and thorax'),
    毗鄰: e('頸段：前方為氣管，兩側為甲狀腺側葉與頸總動脈，喉返神經在氣管食道溝內上行，後方為椎前筋膜與頸椎；胸段：前方為氣管、左主支氣管與心包，後方為胸椎與胸主動脈，左側為主動脈弓', 'Cervical part: the trachea lies in front, the thyroid lobes and common carotid arteries at the sides, the recurrent laryngeal nerves ascend in the tracheo-oesophageal groove and the prevertebral fascia and cervical spine lie behind; thoracic part: the trachea, left main bronchus and pericardium lie in front, the thoracic vertebrae and descending aorta behind and the aortic arch to the left'),
    血液供應: e('頸段由甲狀腺下動脈供應，胸段由胸主動脈的食道支與支氣管動脈供應，腹段由左胃動脈與下膈動脈供應；靜脈流向甲狀腺下靜脈、奇靜脈與左胃靜脈', 'The cervical part is supplied by the inferior thyroid artery, the thoracic part by oesophageal branches of the thoracic aorta and bronchial arteries and the abdominal part by the left gastric and inferior phrenic arteries; veins drain to the inferior thyroid, azygos and left gastric veins'),
    神經支配: e('迷走神經（含喉返神經）與交感神經幹的分支，構成食道神經叢', 'Vagus nerves (including the recurrent laryngeal nerves) and branches of the sympathetic trunk, forming the oesophageal plexus'),
    作用: e('以蠕動把食團由咽輸送到胃；上、下端各有括約肌（上食道括約肌與下食道括約肌）防止逆流', 'Carries the swallowed bolus from the pharynx to the stomach by peristalsis; sphincters at the upper and lower ends (upper and lower oesophageal sphincters) prevent reflux'),
  },
  'skin': {
    位置: e('頭頸部的體表覆蓋層；頭皮、顏面、耳與頸部皮膚的厚度與附屬構造各不相同，眼瞼的最薄，後頸與頭皮的較厚', 'The outer covering of the head and neck; its thickness and appendages vary between scalp, face, ear and neck, the eyelids being thinnest and the nape and scalp thicker'),
    組成: e('表皮（角化的複層鱗狀上皮）與真皮兩層，下方為皮下組織；含毛囊、皮脂腺與汗腺；頭皮有五層（皮膚、皮下組織、帽狀腱膜、疏鬆結締組織、骨膜）', 'Epidermis (keratinised stratified squamous epithelium) and dermis, with the subcutaneous tissue beneath; contains hair follicles, sebaceous and sweat glands; the scalp has five layers (skin, connective tissue, aponeurosis, loose areolar tissue and pericranium)'),
    毗鄰: e('下方依部位而異：頭皮下是帽狀腱膜，顏面下是表情肌與其筋膜，頸部下是頸闊肌與淺筋膜', 'The underlying structures vary: the epicranial aponeurosis beneath the scalp, the muscles of facial expression and their fascia beneath the face and the platysma and superficial fascia in the neck'),
    血液供應: e('來自頸內、外動脈的分支：顏面動脈、淺顳動脈、枕動脈、後耳動脈、眶上動脈與滑車上動脈等，吻合豐富；靜脈大致與動脈伴行', 'From branches of the internal and external carotid arteries, such as the facial, superficial temporal, occipital, posterior auricular, supraorbital and supratrochlear arteries, with rich anastomoses; the veins mostly accompany the arteries'),
    神經支配: e('顏面大部分皮膚為三叉神經的三條分支，下頜角由耳大神經支配；後頭皮與頸部皮膚為頸神經叢（C2–C4）與頸神經後支；汗腺與豎毛肌由交感神經支配', 'Most facial skin by the three divisions of the trigeminal nerve, with the angle of the mandible supplied by the great auricular nerve; the back of the scalp and the neck by the cervical plexus (C2–C4) and the dorsal rami of the cervical nerves; sweat glands and arrector pili by sympathetic fibres'),
    作用: e('保護、感覺、調節體溫、防止水分流失，並藉維生素 D 合成參與代謝', 'Protection, sensation, temperature regulation, prevention of water loss and, through vitamin D synthesis, a metabolic role'),
  },
});
CARD_EXTRAS['seventh cervical vertebra'] = {
  主要標誌: e('頸胸交界處，頸椎中最下的一節；頸部屈曲時，後頸部正中最明顯隆起的骨突即是其棘突（隆椎）；棘突特別長，近乎水平，末端不分叉而有結節，體表易於觸及，供項韌帶附著；橫突較大，橫突孔小，通常只有副椎靜脈通過；椎體形態接近胸椎', 'At the cervicothoracic junction, the lowest cervical vertebra; its spine forms the most obvious bony projection at the back of the neck when the neck is flexed (vertebra prominens); a particularly long, nearly horizontal spine that is not bifid but ends in a tubercle, easily palpated and giving attachment to the nuchal ligament; large transverse processes with small transverse foramina, usually transmitting only the accessory vertebral vein; the body resembles that of a thoracic vertebra'),
  相關關節: CERVICAL.相關關節,
  附著肌肉: e('棘突有斜方肌、菱形肌與夾肌的附著，並有項韌帶下端；橫突後結節供中斜角肌附著，前結節不明顯', 'The spine gives attachment to trapezius, the rhomboids and splenius, together with the lower end of the nuchal ligament; the posterior tubercle of the transverse process gives attachment to scalenus medius, the anterior tubercle being indistinct'),
};
CARD_EXTRAS['vertebra prominens (c7)'] = CARD_EXTRAS['seventh cervical vertebra'];
CARD_EXTRAS['brachiocephalic artery'] = CARD_EXTRAS['brachiocephalic trunk'];
CARD_EXTRAS['cricothyroid ligament'] = CARD_EXTRAS['median cricothyroid ligament'];
CARD_EXTRAS['lobe of thymus'] = CARD_EXTRAS['thymus'];
// ===== HN-A1 end =====
