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
    走向: e('自 Erb 點穿出，斜向上越過胸鎖乳突肌淺面，往下頷角與腮腺方向行（示意模型）', 'Emerges at Erb point and crosses sternocleidomastoid obliquely upward toward the angle of the mandible and the parotid gland (schematic model)'),
    支配範圍: e('腮腺區皮膚、下頷角與耳廓的感覺', 'Sensation of the skin over the parotid, the angle of the mandible and the auricle'),
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
    主要分支: e('脊髓前動脈、脊髓後動脈、小腦下後動脈、腦膜支與肌支', 'Anterior and posterior spinal arteries, posterior inferior cerebellar artery, meningeal and muscular branches'),
    供應範圍: e('腦幹、小腦、頸部脊髓；經基底動脈供應腦的後部', 'Brainstem, cerebellum and cervical spinal cord; the posterior brain through the basilar artery'),
  },
  'subcostal artery': {
    來源: e('降主動脈（胸主動脈）最下一對壁支', 'Lowest pair of parietal branches of the descending (thoracic) aorta'),
    走向: e('沿第十二肋骨下緣向外側走行，進入腹壁', 'Runs along the lower border of the twelfth rib into the abdominal wall'),
    供應範圍: e('第十二肋下方的腹壁與背部肌肉', 'Abdominal wall and back muscles below the twelfth rib'),
  },
  'costocervical trunk': {
    來源: e('鎖骨下動脈', 'Subclavian artery'),
    走向: e('向後上方越過胸膜頂，分為最上肋間動脈與頸深動脈', 'Passes backward over the cervical pleura and divides into the supreme intercostal and deep cervical arteries'),
    主要分支: e('最上肋間動脈、頸深動脈', 'Supreme intercostal artery and deep cervical artery'),
    供應範圍: e('第一、第二肋間隙與頸後深層肌', 'First and second intercostal spaces and the deep posterior neck muscles'),
  },
  'deep cervical artery': {
    來源: e('肋頸動脈幹', 'Costocervical trunk'),
    走向: e('向後越過第七頸椎橫突，在頭半棘肌與頸半棘肌之間上行', 'Passes backward over the transverse process of C7 and ascends between semispinalis capitis and semispinalis cervicis'),
    主要分支: e('肌支；與枕動脈降支吻合', 'Muscular branches; anastomoses with the descending branch of the occipital artery'),
    供應範圍: e('頸後深層肌', 'Deep posterior neck muscles'),
  },
  'dorsal scapular artery': {
    來源: e('有變異：起自鎖骨下動脈第三段（有時為第二段），或起自頸橫動脈深支', 'Variable: the third part of the subclavian artery (sometimes the second part), or the deep branch of the transverse cervical artery'),
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
    走向: e('在外翼肌深面下行，位置在下齒槽神經的前方；沿內翼肌與下頜支之間向前下，途中自後方接上鼓索神經；再貼近下頜第三大臼齒內側的骨面進入口腔底，在舌骨舌肌表面前行，從下頜下腺管的下方由外側繞到內側，分支入舌前部', 'Descends deep to lateral pterygoid, in front of the inferior alveolar nerve; runs between medial pterygoid and the mandibular ramus, is joined from behind by the chorda tympani, passes close to the bone medial to the third lower molar into the floor of the mouth, runs forward on hyoglossus and crosses from lateral to medial beneath the submandibular duct before breaking up in the front of the tongue'),
    支配範圍: e('舌前三分之二（界溝以前）的一般感覺（觸、壓、冷熱、痛）、口腔底與舌側牙齦的黏膜感覺；加入的鼓索神經另帶來舌前三分之二的味覺，以及到下頜下神經節的副交感節前纖維，再由節後纖維支配下頜下腺與舌下腺；本身沒有運動纖維', 'General sensation (touch, pressure, temperature, pain) of the front two-thirds of the tongue, and of the mucosa of the floor of the mouth and the lingual gingiva; the joined chorda tympani adds taste from the front two-thirds and preganglionic parasympathetic fibres to the submandibular ganglion, whose postganglionic fibres supply the submandibular and sublingual glands; it has no motor fibres of its own'),
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
    來源: e('第六對腦神經，由橋腦的外旋神經核發出，在橋腦與延腦之間的橋延溝出腦', 'Cranial nerve VI, arising from the abducens nucleus of the pons and leaving the brainstem at the pontomedullary groove'),
    走向: e('向前上方行，斜行爬過顳骨岩部尖端上緣進入海綿竇，在竇腔內緊貼頸內動脈外側前行；再經眶上裂、在總腱環之內入眼眶，從內側面進入外直肌', 'Runs forward and upward, over the apex of the petrous temporal bone into the cavernous sinus, where it lies lateral to the internal carotid artery within the sinus; it then enters the orbit through the superior orbital fissure inside the common tendinous ring and reaches the medial surface of lateral rectus'),
    支配範圍: e('運動支配外直肌，使眼球外展；受損時眼球無法外展，向內偏斜並出現複視', 'Motor to lateral rectus only, which abducts the eyeball; a lesion leaves the eye turned inward and causes double vision'),
  },
  'oculomotor nerve (iii)': {
    來源: e('第三對腦神經，起自中腦的動眼神經核（運動）與動眼神經副核（副交感），由腳間窩出腦', 'Cranial nerve III, arising from the oculomotor nucleus (motor) and the accessory (parasympathetic) nucleus of the midbrain and leaving at the interpeduncular fossa'),
    走向: e('穿過後大腦動脈與小腦上動脈之間向前，進入海綿竇外側壁最上方，經眶上裂、在總腱環之內入眼眶，隨即分成上支與下支', 'Passes between the posterior cerebral and superior cerebellar arteries, enters the uppermost part of the lateral wall of the cavernous sinus, then enters the orbit through the superior orbital fissure inside the common tendinous ring and divides into a superior and an inferior branch'),
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
    走向: e('向後內行經眼眶，穿視神經管（與眼動脈同行）進入顱腔，在腦下垂體前上方與對側合成視交叉，再成視徑，繞過大腦腳到外側膝狀體；眶內段包有硬膜、蛛網膜與軟膜，蛛網膜下腔與顱內相通；視網膜中央動脈與靜脈在其內走行，睫狀神經節位於它與外直肌之間', 'Runs backward and medially through the orbit, enters the cranial cavity through the optic canal together with the ophthalmic artery, joins its fellow in front of and above the pituitary gland as the optic chiasm and continues as the optic tract around the cerebral peduncle to the lateral geniculate body; in the orbit it is sheathed by dura, arachnoid and pia, the subarachnoid space being continuous with the intracranial one; the central retinal artery and vein run within it, and the ciliary ganglion lies between it and lateral rectus'),
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
    走向: e('兩部在內耳道內合成一條，與顏面神經一同穿過顳骨岩部的內聽道，經內聽孔進入後顱窩，在橋腦下緣、顏面神經外側入腦幹（小腦橋腦角）', 'The two parts join in the internal acoustic meatus, and the nerve runs with the facial nerve through the petrous temporal bone, enters the posterior cranial fossa through the internal acoustic pore and reaches the brainstem at the lower border of the pons, lateral to the facial nerve (cerebellopontine angle)'),
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
    作用: e('把舌骨向上懸吊在顱底，並供中咽縮肌附著；舌咽神經與莖突咽肌沿著它向下，在上、中咽縮肌之間進入咽部', 'suspends the hyoid from the skull base and gives attachment to the middle pharyngeal constrictor; the glossopharyngeal nerve and stylopharyngeus follow it down and enter the pharynx between the superior and middle constrictors'),
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

// Head-and-neck cranial and trigeminal-branch nerves (card batch B01). Standard anatomy only; fields we are not sure of stay out.
Object.assign(CARD_EXTRAS, {
  'facial nerve (vii)': {
    來源: e('第七對腦神經，自橋腦與延髓交界處外側出腦，含運動、感覺與副交感纖維', 'Cranial nerve VII, leaving the brainstem at the pontomedullary junction; carries motor, sensory and parasympathetic fibres'),
    走向: e('與前庭耳蝸神經同入內耳道，穿過顳骨內的顏面神經管，由莖乳突孔出顱；進入腮腺後分成顳支、顴支、頰支、下頷緣支與頸支；鼓索神經在顏面神經管內分出，之後與舌神經會合', 'Enters the internal acoustic meatus with the vestibulocochlear nerve, runs through the facial canal of the temporal bone and exits at the stylomastoid foramen; within the parotid gland it divides into temporal, zygomatic, buccal, marginal mandibular and cervical branches; the chorda tympani leaves it in the facial canal and later joins the lingual nerve'),
    支配範圍: e('運動：顏面表情肌（頸支支配闊頸肌）、莖突舌骨肌、二腹肌後腹、鐙骨肌；感覺：舌前三分之二的味覺；副交感：淚腺、下頷下腺、舌下腺', 'Motor to the muscles of facial expression (the cervical branch supplies platysma), stylohyoid, posterior belly of digastric and stapedius; taste of the front two-thirds of the tongue; parasympathetic to the lacrimal, submandibular and sublingual glands'),
  },
  'trigeminal nerve (v)': {
    來源: e('第五對腦神經，自橋腦外側面出腦，有較粗的感覺根與較細的運動根', 'Cranial nerve V, leaving the lateral pons with a large sensory root and a small motor root'),
    走向: e('感覺根連到顳骨岩部尖端的三叉神經節，再分成眼神經、上頷神經與下頷神經三支；運動根繞過神經節下方，只加入下頷神經', 'The sensory root joins the trigeminal ganglion at the apex of the petrous temporal bone and divides into the ophthalmic, maxillary and mandibular nerves; the motor root passes beneath the ganglion and joins only the mandibular nerve'),
    支配範圍: e('臉部與前頭皮膚、口腔與鼻腔黏膜、牙齒與硬腦膜的一般感覺；運動（經下頷神經）支配咀嚼肌（咬肌、顳肌、內翼肌、外翼肌）、下頷舌骨肌、二腹肌前腹、張顎帆肌與鼓膜張肌', 'General sensation of the facial and frontal skin, oral and nasal mucosa, teeth and dura mater; motor (through the mandibular nerve) to the muscles of mastication (masseter, temporalis, medial and lateral pterygoids), mylohyoid, the anterior belly of digastric, tensor veli palatini and tensor tympani'),
  },
  'ophthalmic nerve': {
    來源: e('三叉神經第一支（V1），由三叉神經節前內側發出', 'First division of the trigeminal nerve (V1), arising from the anteromedial part of the trigeminal ganglion'),
    走向: e('向前走在海綿竇外側壁，於眶上裂附近分成淚腺神經、額神經與鼻睫神經，經眶上裂入眼眶；額神經在眶內向前，延續為眶上神經，穿眶上孔到前額', 'Runs forward in the lateral wall of the cavernous sinus, divides near the superior orbital fissure into the lacrimal, frontal and nasociliary nerves, and enters the orbit through the fissure; the frontal nerve runs forward in the orbit and continues as the supra-orbital nerve through the supra-orbital foramen to the forehead'),
    支配範圍: e('純感覺：前額與頭頂前部皮膚、上眼瞼、鼻背與鼻尖、角膜與眼球、淚腺、鼻腔上部黏膜', 'Purely sensory: skin of the forehead and anterior scalp, upper eyelid, dorsum and tip of the nose, cornea and eyeball, lacrimal gland and the upper nasal mucosa'),
  },
  'maxillary nerve': {
    來源: e('三叉神經第二支（V2），由三叉神經節中部發出', 'Second division of the trigeminal nerve (V2), arising from the middle of the trigeminal ganglion'),
    走向: e('經海綿竇外側壁，在圓孔前先分出腦膜支，再由圓孔出顱入翼顎窩；在翼顎窩分出顴神經與後上齒槽神經，並與翼顎神經節相連；之後穿眶下裂進入眼眶，延續為眶下神經，途中發出中上（部分人有）與前上齒槽神經，最後由眶下孔到達臉部', 'Passes through the lateral wall of the cavernous sinus, gives a meningeal branch before the foramen rotundum, then leaves the skull by it into the pterygopalatine fossa; there it gives the zygomatic and posterior superior alveolar nerves and is connected to the pterygopalatine ganglion; it then enters the orbit through the inferior orbital fissure as the infra-orbital nerve, which gives middle (present in some people) and anterior superior alveolar branches on its way and reaches the face at the infra-orbital foramen'),
    支配範圍: e('純感覺：下眼瞼、鼻側與上唇間的臉部皮膚、顴部與顳部前方皮膚、上排牙齒與牙齦、上頷竇、鼻腔與硬腭黏膜', 'Purely sensory: facial skin between the lower eyelid and upper lip, skin of the cheek bone and anterior temple, upper teeth and gingiva, maxillary sinus, nasal cavity and palatal mucosa'),
  },
  'mental nerve': {
    來源: e('下齒槽神經的終末分支之一', 'A terminal branch of the inferior alveolar nerve'),
    走向: e('下齒槽神經在下頷管內前行，於小臼齒附近分成頦神經與切牙神經；頦神經由頦孔穿出，向上分布於下唇與頦部', 'The inferior alveolar nerve divides in the mandibular canal near the premolars into the mental and incisive nerves; the mental nerve emerges through the mental foramen and spreads to the lower lip and chin'),
    支配範圍: e('純感覺：下唇與頦部的皮膚、下唇黏膜與前牙區唇側牙齦', 'Purely sensory: skin of the lower lip and chin, mucosa of the lower lip and the labial gingiva of the anterior teeth'),
  },
  'buccal nerve': {
    來源: e('下頷神經前股的感覺分支（三叉神經 V3）', 'Sensory branch of the anterior division of the mandibular nerve (trigeminal V3)'),
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
    走向: e('經舌下神經管出顱，在頸部先走於頸內動脈與頸內靜脈之間，再弓形向前越過頸動脈淺面，經二腹肌後腹深面進入下頷下三角，沿舌骨舌肌外側入舌', 'Leaves the skull through the hypoglossal canal, descends between the internal carotid artery and internal jugular vein, arches forward over the carotid arteries, passes deep to the posterior belly of digastric into the submandibular triangle and enters the tongue lateral to hyoglossus'),
    支配範圍: e('運動支配舌的所有內在肌，以及舌骨舌肌、頦舌肌、莖突舌肌；腭舌肌除外，由迷走神經支配；另攜帶第一頸神經（C1）纖維，分布到頦舌骨肌與甲狀舌骨肌', 'Motor to all intrinsic muscles of the tongue and to hyoglossus, genioglossus and styloglossus; palatoglossus is excluded and is supplied by the vagus nerve; it also carries C1 fibres that leave it to supply geniohyoid and thyrohyoid'),
  },
  'anterior division of mandibular nerve': {
    來源: e('下頷神經（V3）出卵圓孔後，在顳下窩分出的較小前股', 'The smaller anterior division of the mandibular nerve (V3), given off in the infratemporal fossa after it leaves the foramen ovale'),
    走向: e('在外翼肌深面前行，分出咬肌神經、顳深神經、外翼肌神經等運動支，以及感覺性的頰神經', 'Runs forward deep to lateral pterygoid and gives the motor masseteric, deep temporal and lateral pterygoid nerves plus the sensory buccal nerve'),
    支配範圍: e('以運動為主：咬肌、顳肌、外翼肌；經頰神經帶來頰部的感覺', 'Mainly motor to masseter, temporalis and lateral pterygoid; the buccal nerve carries sensation from the cheek'),
  },
  'posterior division of mandibular nerve': {
    來源: e('下頷神經（V3）在顳下窩分出的較大後股', 'The larger posterior division of the mandibular nerve (V3), given off in the infratemporal fossa'),
    走向: e('在外翼肌深面下行，分為耳顳神經、舌神經與下齒槽神經三條主要分支', 'Descends deep to lateral pterygoid and divides into the auriculotemporal, lingual and inferior alveolar nerves'),
    支配範圍: e('以感覺為主：耳前與顳部皮膚、外耳道、顳下頷關節、舌前三分之二的一般感覺、下排牙齒、下唇與頦部；耳顳神經另帶舌咽神經的副交感纖維（經耳神經節）到腮腺；經下頷舌骨肌神經支配下頷舌骨肌與二腹肌前腹', 'Mostly sensory to the skin in front of the ear and temple, the external acoustic meatus and the temporomandibular joint, general sensation of the front two-thirds of the tongue, the lower teeth, lower lip and chin; the auriculotemporal nerve also carries glossopharyngeal parasympathetic fibres (via the otic ganglion) to the parotid gland; the nerve to mylohyoid supplies mylohyoid and the anterior belly of digastric'),
  },
  'inferior alveolar nerve': {
    來源: e('下頷神經後股最粗的分支', 'The largest branch of the posterior division of the mandibular nerve'),
    走向: e('在內翼肌與下頷支之間下行，經下頷孔入下頷管，沿下牙根下方前行，於頦孔附近分成頦神經與切牙神經；入孔前先分出下頷舌骨肌神經', 'Descends between medial pterygoid and the mandibular ramus, enters the mandibular canal via the mandibular foramen, runs below the tooth roots and divides near the mental foramen into the mental and incisive nerves; the nerve to mylohyoid leaves it before it enters the foramen'),
    支配範圍: e('下排牙齒與牙周組織的感覺；經頦神經支配下唇與頦部；經下頷舌骨肌神經運動支配下頷舌骨肌與二腹肌前腹', 'Sensation of the lower teeth and periodontium; the mental nerve supplies the lower lip and chin; the nerve to mylohyoid is motor to mylohyoid and the anterior belly of digastric'),
  },
  'nerve to mylohyoid muscle': {
    來源: e('下齒槽神經在進入下頷孔之前分出的運動支', 'A motor branch of the inferior alveolar nerve given off just before it enters the mandibular foramen'),
    走向: e('沿下頷支內面的下頷舌骨肌溝向下前行，再走在下頷舌骨肌的下面', 'Runs down and forward in the mylohyoid groove on the inner surface of the mandible, then along the lower surface of mylohyoid'),
    支配範圍: e('運動支配下頷舌骨肌與二腹肌前腹', 'Motor to mylohyoid and the anterior belly of digastric'),
  },
});
