export type CardExtra = Record<string, {zh: string; en?: string}>;
const e = (zh: string, en: string) => ({zh, en});

/**
 * Hand-checked card entries for structures the repository's profile data does not describe. Keyed by lower-case English name without
 * left/right. Only standard, well-established anatomy is written here; a field we are not sure of is left out and shows up in
 * docs/quiz-card-gaps.md instead of being guessed.
 */
export const CARD_EXTRAS: Record<string, CardExtra> = {
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
    主要分支: e('肌支進入背闊肌', 'Muscular branches entering latissimus dorsi'),
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
    來源: e('頸橫動脈深支（常見），或直接起自鎖骨下動脈第三段', 'Deep branch of the transverse cervical artery (common), or directly from the third part of the subclavian artery'),
    走向: e('沿肩胛骨內側緣、菱形肌深面下行', 'Descends along the medial border of the scapula deep to the rhomboids'),
    供應範圍: e('菱形肌、提肩胛肌；與肩胛上動脈、旋肩胛動脈吻合', 'Rhomboids and levator scapulae; anastomoses with the suprascapular and circumflex scapular arteries'),
  },
  'thoracodorsal artery': {
    來源: e('肩胛下動脈', 'Subscapular artery'),
    走向: e('與胸背神經伴行，沿背闊肌前緣下行', 'Descends with the thoracodorsal nerve along the anterior border of latissimus dorsi'),
    主要分支: e('肌支，並分支至前鋸肌', 'Muscular branches, with branches to serratus anterior'),
    供應範圍: e('背闊肌、前鋸肌與鄰近胸壁', 'Latissimus dorsi, serratus anterior and the adjacent chest wall'),
  },
  'superficial cervical artery': {
    來源: e('甲狀頸動脈幹', 'Thyrocervical trunk'),
    走向: e('橫越頸後三角，行至斜方肌深面', 'Crosses the posterior triangle of the neck to the deep surface of trapezius'),
    供應範圍: e('斜方肌', 'Trapezius'),
  },
  'transverse cervical artery': {
    來源: e('甲狀頸動脈幹', 'Thyrocervical trunk'),
    走向: e('橫越頸後三角，經臂神經叢前方行至斜方肌深面', 'Crosses the posterior triangle in front of the brachial plexus to the deep surface of trapezius'),
    主要分支: e('淺支（至斜方肌）與深支（常成為肩胛背動脈）', 'Superficial branch (to trapezius) and deep branch (often becomes the dorsal scapular artery)'),
    供應範圍: e('斜方肌、菱形肌與提肩胛肌', 'Trapezius, rhomboids and levator scapulae'),
  },
  'subcostal vein': {
    走向: e('沿第十二肋骨下緣前行，右側注入奇靜脈，左側注入半奇靜脈', 'Runs along the lower border of the twelfth rib; the right drains into the azygos vein and the left into the hemiazygos vein'),
    引流範圍: e('第十二肋下方的腹壁與背部', 'Abdominal wall and back below the twelfth rib'),
  },
  'thoracodorsal vein': {
    來源: e('背闊肌與鄰近胸壁的靜脈', 'Veins of latissimus dorsi and the adjacent chest wall'),
    走向: e('與胸背動脈伴行，注入肩胛下靜脈，再入腋靜脈', 'Accompanies the thoracodorsal artery and drains into the subscapular vein, then the axillary vein'),
    引流範圍: e('背闊肌與前鋸肌', 'Latissimus dorsi and serratus anterior'),
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
