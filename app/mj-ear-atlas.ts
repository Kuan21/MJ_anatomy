/**
 * Ear detail mode: the structure catalogue (names, groups, depth layers, colours) and the info-card text of every structure.
 * The geometry comes from public/models/ear/ear-atlas.* (scripts/build-ear-atlas.mjs): one right ear assembled from
 *   - IE-Map (CC BY 4.0): the membranous labyrinth, also the reference for the registration;
 *   - OpenEar example set (CC BY 4.0): ossicles, tympanic membrane, bony labyrinth, scala tympani, facial nerve, chorda tympani, cochlear nerve;
 *   - BodyParts3D 4.0 (CC BY 4.0): the right auricle;
 *   - two tubes built from the anatomy (external acoustic meatus, pharyngotympanic tube): schematic.
 * Names follow the Taiwan anatomy terms used on the rest of the site (English above, Taiwan Chinese below). The card text is written for this viewer, in our own words, from the standard textbook account.
 */
export type EarGroupId = 'outer' | 'middle' | 'bony' | 'membranous' | 'nerves';
export interface EarGroup {id: EarGroupId; en: string; zh: string; /** the upper node of the tree this group belongs to */ parent?: {id: string; en: string; zh: string}}
export const EAR_GROUPS: EarGroup[] = [
  {id: 'outer', en: 'Outer ear', zh: '外耳'},
  {id: 'middle', en: 'Middle ear', zh: '中耳'},
  {id: 'bony', en: 'Bony labyrinth', zh: '骨性迷路', parent: {id: 'inner', en: 'Inner ear', zh: '內耳'}},
  {id: 'membranous', en: 'Membranous labyrinth', zh: '膜性迷路', parent: {id: 'inner', en: 'Inner ear', zh: '內耳'}},
  {id: 'nerves', en: 'Nerves and ganglia', zh: '神經與神經節'},
];

/** Depth layers, from the outside in (used to fade the layers in front of a selected structure and to order the quiz); the membranous labyrinth and the nerves have no layer of their own. */
export const EAR_LAYERS = [
  {en: 'Auricle', zh: '耳廓'},
  {en: 'External auditory meatus', zh: '外聽道', aliases: ['External acoustic meatus', '外耳道']},
  {en: 'Tympanic membrane', zh: '鼓膜'},
  {en: 'Ossicles and pharyngotympanic tube', zh: '聽小骨與咽鼓管'},
  {en: 'Bony labyrinth', zh: '骨性迷路'},
] as const;

export interface EarFacts {
  /** Location and shape */ loc: string;
  /** Function */ fn: string;
  /** Blood and nerve supply */ supply?: string;
  /** Clinical or other note */ note?: string;
}
export interface EarPart {
  id: string;
  en: string;
  zh: string;
  group: EarGroupId;
  /** has a mesh in ear-atlas (false: info card only) */
  model: boolean;
  color: string;
  opacity?: number;
  /** depth layer (index of EAR_LAYERS), -1 = none */
  layer: number;
  /** a coloured patch on the surface of another structure (the windows), not a structure of its own */
  mark?: boolean;
  /** built from the described anatomy, not from a scan */
  schematic?: boolean;
  /** only for a structure without a mesh: the modelled structures that bound it or lie next to it, highlighted while it is selected (the rest is faded) */
  near?: string[];
  /** other accepted names (English or Chinese), found by the search */
  aliases?: string[];
  /** related structures (ids) shown as links on the card */
  rel: string[];
  card: {en: EarFacts; zh: EarFacts};
}

const P = (part: EarPart): EarPart => part;
export const EAR_PARTS: EarPart[] = [
  // ---- outer ear
  P({id: 'auricle', en: 'Auricle', zh: '耳廓', group: 'outer', model: true, color: '#e2b9a2', layer: 0, rel: ['external-acoustic-meatus'], card: {
    en: {
      loc: 'Projects from the side of the head over the opening of the external acoustic meatus. A single plate of elastic cartilage under thin skin forms the helix, antihelix, concha, tragus and antitragus; the lobule at the bottom has no cartilage.',
      fn: 'Collects sound and guides it into the meatus. Its folds filter sounds from different directions a little differently, which helps in judging whether a sound comes from in front, behind, above or below.',
      supply: 'Sensation: great auricular nerve (C2–C3), lesser occipital nerve, auriculotemporal nerve (from the mandibular nerve) and the auricular branch of the vagus nerve. Arteries: posterior auricular and superficial temporal arteries.',
      note: 'A blow can separate the skin from the cartilage and let blood collect between them. If this is not drained, scarring leaves a thickened, misshapen "cauliflower ear".',
    },
    zh: {
      loc: '位於頭部側面，覆蓋外耳道口。以一片彈性軟骨為骨架，外覆薄皮膚，形成耳輪、對耳輪、耳甲、耳屏與對耳屏；最下方的耳垂不含軟骨。',
      fn: '收集聲波並導入外耳道。各個皺褶對不同方向的聲音有些微不同的濾過效果，有助於判斷聲音來自前、後、上或下。',
      supply: '感覺：耳大神經（C2–C3）、枕小神經、耳顳神經（下頜神經的分支）與迷走神經耳支。動脈：耳後動脈與淺顳動脈。',
      note: '外力撞擊可使皮膚與軟骨分離而積血；若未引流，癒合時會形成增厚變形的「菜花耳」。',
    },
  }}),
  P({id: 'external-acoustic-meatus', en: 'External auditory meatus', zh: '外聽道', aliases: ['External acoustic meatus', '外耳道'], group: 'outer', model: true, color: '#d9a99b', opacity: .6, layer: 1, schematic: true, rel: ['auricle', 'tympanic-membrane'], card: {
    en: {
      loc: 'A slightly S-shaped canal about 2.5 cm long that runs from the concha to the tympanic membrane, inward and a little forward. The outer third is cartilage, continuous with the auricle; the inner two thirds run in the tympanic part of the temporal bone. The tympanic membrane lies obliquely across the inner end, so the floor and front wall are longer than the roof and back wall.',
      fn: 'Conducts sound to the tympanic membrane and protects it. Wax (cerumen) from glands in the cartilaginous part traps dust and keeps the skin supple.',
      supply: 'Sensation: auriculotemporal nerve (front and upper wall) and the auricular branch of the vagus nerve (floor and back). Arteries: posterior auricular, deep auricular and superficial temporal arteries.',
      note: 'In adults, pulling the auricle up and back straightens the cartilaginous part so that the membrane can be seen with an otoscope. Touching the canal can trigger a cough through the vagus nerve. The canal in this model is a schematic tube built along the described course, not a scanned canal.',
    },
    zh: {
      loc: '由耳甲通向鼓膜、長約 2.5 公分、略呈 S 形的管道，方向向內並略向前。外側約三分之一為軟骨，與耳廓相連；內側約三分之二位於顳骨鼓部。鼓膜斜置於內端，因此下壁與前壁比上壁與後壁長。',
      fn: '將聲音傳向鼓膜並保護鼓膜。軟骨部的腺體分泌耳垢，可黏住灰塵並使皮膚保持柔軟。',
      supply: '感覺：耳顳神經（前壁與上壁）與迷走神經耳支（下壁與後壁）。動脈：耳後動脈、耳深動脈與淺顳動脈。',
      note: '成人檢查時將耳廓向上、向後拉，可使軟骨部變直，以耳鏡看到鼓膜。碰觸外耳道可經迷走神經引起咳嗽。本模型的外耳道是依上述走向建立的示意管道，不是實際掃描的外耳道。',
    },
  }}),
  // ---- middle ear
  P({id: 'tympanic-cavity', en: 'Tympanic cavity', zh: '鼓室腔', group: 'middle', model: false, color: '#c8b8a4', layer: -1,
    near: ['tympanic-membrane', 'malleus', 'incus', 'stapes', 'pharyngotympanic-tube', 'oval-window', 'round-window', 'facial-nerve', 'chorda-tympani'],
    rel: ['tympanic-membrane', 'malleus', 'incus', 'stapes', 'tensor-tympani', 'stapedius', 'pharyngotympanic-tube', 'oval-window', 'round-window', 'facial-nerve', 'chorda-tympani'], card: {
    en: {
      loc: 'The air-filled space in the petrous part of the temporal bone between the tympanic membrane (lateral wall) and the bony labyrinth (medial wall). The epitympanic recess (attic) lies above the membrane, the mesotympanum opposite it and the hypotympanum below. Roof: tegmen tympani, the floor of the middle cranial fossa. Floor: the jugular wall. Front: the opening of the pharyngotympanic tube and the carotid wall. Back: the entrance to the mastoid antrum and the pyramidal eminence. Medial wall: promontory, oval window, round window and the bulge of the facial canal.',
      fn: 'Holds the ossicles, the tensor tympani and stapedius muscles, the chorda tympani and the tympanic plexus. The pharyngotympanic tube keeps its air pressure equal to the outside.',
      supply: 'The mucosa is supplied by the tympanic plexus (glossopharyngeal nerve). Arteries: anterior tympanic, stylomastoid and several small branches of the middle meningeal and internal carotid arteries.',
      note: 'The thin roof and medial wall are why an ear infection can reach the meninges and temporal lobe, the labyrinth and the facial nerve, and the back wall opens into the mastoid air cells. This space has no mesh of its own: selecting it highlights the structures that bound it or lie inside it and fades the rest.',
    },
    zh: {
      loc: '位於顳骨岩部、介於鼓膜（外側壁）與骨性迷路（內側壁）之間的含氣空間。鼓膜上方為上鼓室（鼓室隱窩），與鼓膜相對為中鼓室，下方為下鼓室。頂壁為鼓室蓋，也是中顱窩的底；底壁為頸靜脈壁；前壁有咽鼓管開口與頸動脈壁；後壁有通向乳突竇的入口與錐隆起；內側壁有岬、卵圓窗、圓窗與顏面神經管的隆起。',
      fn: '容納聽小骨、鼓膜張肌與鐙骨肌、鼓索神經及鼓室神經叢；咽鼓管使鼓室內的氣壓與外界相等。',
      supply: '黏膜由鼓室神經叢（舌咽神經）支配。動脈：前鼓室動脈、莖乳動脈，以及腦膜中動脈與內頸動脈的細小分支。',
      note: '頂壁與內側壁很薄，因此中耳感染可蔓延到腦膜與顳葉、迷路及顏面神經；後壁通向乳突氣房。此空間沒有獨立的網格：選取時會標示圍成它或位於其中的構造，其餘淡化。',
    },
  }}),
  P({id: 'tympanic-membrane', en: 'Tympanic membrane', zh: '鼓膜', group: 'middle', model: true, color: '#cfc4b0', opacity: .85, layer: 2, rel: ['external-acoustic-meatus', 'malleus', 'tympanic-cavity'], card: {
    en: {
      loc: 'A thin, oval, pearly-grey membrane about 1 cm across that closes the inner end of the meatus and forms most of the lateral wall of the tympanic cavity. It slopes, facing outward, forward and downward. The handle of the malleus draws its centre inward (the umbo). The large lower part is the taut pars tensa; the small upper part is the lax pars flaccida.',
      fn: 'Vibrates with the incoming sound and passes the vibration to the malleus. Its effective area is roughly 15 to 20 times that of the footplate of the stapes, which helps match the air to the fluid of the inner ear.',
      supply: 'Three layers: skin from the meatus, a middle fibrous layer and mucosa of the tympanic cavity. Outer surface: auriculotemporal nerve and auricular branch of the vagus nerve. Inner surface: tympanic branch of the glossopharyngeal nerve. Arteries: deep auricular, anterior tympanic and stylomastoid arteries.',
      note: 'With an otoscope a cone of light is seen in the front lower part. Middle ear infection makes the membrane bulge; a small perforation often heals by itself.',
    },
    zh: {
      loc: '薄而呈橢圓形、珍珠灰色的膜，直徑約 1 公分，封住外耳道內端，並構成鼓室腔外側壁的大部分。膜面傾斜，朝向外、前、下。錘骨柄將膜中央向內拉，形成鼓膜臍。下方大部分是緊繃的緊張部，上方小部分是鬆弛部。',
      fn: '隨聲音振動，並把振動傳給錘骨。鼓膜的有效面積約為鐙骨底板的 15 至 20 倍，有助於使空氣中的聲音與內耳的液體相配。',
      supply: '分三層：外面是外耳道延續的皮膚，中間是纖維層，內面是鼓室黏膜。外面感覺：耳顳神經與迷走神經耳支；內面：舌咽神經鼓室支。動脈：耳深動脈、前鼓室動脈與莖乳動脈。',
      note: '耳鏡下可見前下方的光錐。中耳感染時鼓膜會向外膨出；小穿孔常可自行癒合。',
    },
  }}),
  P({id: 'malleus', en: 'Malleus', zh: '錘骨', group: 'middle', model: true, color: '#efe5cf', layer: 3, rel: ['tympanic-membrane', 'incus', 'tensor-tympani', 'chorda-tympani'], card: {
    en: {
      loc: 'The largest and most lateral ossicle. The head lies in the epitympanic recess and joins the incus; the neck lies below it; the handle (manubrium) is embedded in the tympanic membrane down to the umbo; the lateral process presses on the upper part of the membrane.',
      fn: 'Receives the vibration of the tympanic membrane and passes it to the incus. The tensor tympani pulls on the handle and tightens the membrane.',
      supply: 'Arteries: anterior tympanic artery and branches of the middle meningeal artery. The chorda tympani crosses the medial side of the neck, and the tympanic plexus supplies the covering mucosa.',
      note: 'The handle and lateral process are the landmarks seen through the membrane at otoscopy.',
    },
    zh: {
      loc: '最大、最靠外側的聽小骨。錘骨頭位於上鼓室，與砧骨相接；其下為頸；錘骨柄埋在鼓膜內，向下到鼓膜臍；外側突頂著鼓膜上部。',
      fn: '接收鼓膜的振動並傳給砧骨。鼓膜張肌拉動錘骨柄，使鼓膜繃緊。',
      supply: '動脈：前鼓室動脈與腦膜中動脈的分支。鼓索神經從錘骨頸的內側經過，鼓室神經叢支配其表面黏膜。',
      note: '錘骨柄與外側突是耳鏡下透過鼓膜可見的標誌。',
    },
  }}),
  P({id: 'incus', en: 'Incus', zh: '砧骨', group: 'middle', model: true, color: '#e9dcc0', layer: 3, rel: ['malleus', 'stapes', 'chorda-tympani'], card: {
    en: {
      loc: 'The middle ossicle, shaped like an anvil. The body lies in the epitympanic recess and joins the head of the malleus. The short crus points backward to the fossa incudis; the long crus runs down behind the handle of the malleus and ends in the lenticular process, which joins the head of the stapes.',
      fn: 'Transfers the vibration from the malleus to the stapes. The joints of the chain are small synovial joints that allow slight movement.',
      supply: 'Arteries: anterior tympanic artery and branches of the middle meningeal and stylomastoid arteries. The mucosa is supplied by the tympanic plexus.',
      note: 'The long crus and lenticular process have a poor blood supply, so they can die back after infection or injury and break the chain.',
    },
    zh: {
      loc: '位於中間的聽小骨，形如鐵砧。砧骨體在上鼓室，與錘骨頭相接。短腳向後指向砧骨窩；長腳在錘骨柄後方向下，末端為豆狀突，與鐙骨頭相接。',
      fn: '把錘骨的振動傳給鐙骨。聽小骨鏈上的關節是小型滑膜關節，允許些微的活動。',
      supply: '動脈：前鼓室動脈，以及腦膜中動脈與莖乳動脈的分支。黏膜由鼓室神經叢支配。',
      note: '長腳與豆狀突的血液供應較差，感染或外傷後容易壞死，使聽小骨鏈中斷。',
    },
  }}),
  P({id: 'stapes', en: 'Stapes', zh: '鐙骨', group: 'middle', model: true, color: '#f4ebd6', layer: 3, rel: ['incus', 'oval-window', 'stapedius'], card: {
    en: {
      loc: 'The smallest bone of the body, stirrup-shaped and about 3 mm tall. The head joins the lenticular process of the incus; two crura connect the head to the oval base (footplate), which sits in the oval window and is held there by the annular ligament.',
      fn: 'Pushes the footplate in and out of the oval window, setting the perilymph of the vestibule and scala vestibuli in motion. The stapedius pulls on its neck and reduces the movement for loud sounds.',
      supply: 'Arteries: stylomastoid branch of the posterior auricular artery and branches of the middle meningeal artery. The mucosa is supplied by the tympanic plexus.',
      note: 'Fixation of the footplate by otosclerosis is a common cause of conductive hearing loss in adults; in stapedotomy the stapes is replaced by a small prosthesis.',
    },
    zh: {
      loc: '人體最小的骨，形如馬鐙，高約 3 公釐。鐙骨頭與砧骨的豆狀突相接；兩條腳連到橢圓形的底板，底板嵌在卵圓窗內，由環狀韌帶固定。',
      fn: '推動底板進出卵圓窗，使前庭與前庭階的外淋巴液振動。鐙骨肌拉動鐙骨頸，在聲音過大時減小振動。',
      supply: '動脈：耳後動脈的莖乳支與腦膜中動脈的分支。黏膜由鼓室神經叢支配。',
      note: '耳硬化症使底板固定，是成人傳導性聽力受損的常見原因；鐙骨切開術是以小型人工聽小骨取代鐙骨。',
    },
  }}),
  P({id: 'tensor-tympani', en: 'Tensor tympani muscle', zh: '鼓膜張肌', group: 'middle', model: false, color: '#b86a5c', layer: -1, near: ['malleus', 'pharyngotympanic-tube', 'tympanic-membrane'], rel: ['malleus', 'tympanic-membrane', 'pharyngotympanic-tube', 'stapedius'], card: {
    en: {
      loc: 'A small muscle lying in a bony semicanal above the pharyngotympanic tube. It arises from the cartilage of the tube, the greater wing of the sphenoid and the wall of its canal. Its tendon turns laterally around the cochleariform process and attaches to the handle of the malleus near the neck.',
      fn: 'Pulls the handle of the malleus medially, tensing the tympanic membrane and damping its vibration. It contracts before chewing, yawning or loud sounds.',
      supply: 'Nerve to tensor tympani, from the mandibular nerve (through the nerve to medial pterygoid). Arteries: branches of the middle meningeal and superior tympanic arteries.',
      note: 'It is supplied by the trigeminal nerve, whereas the other middle ear muscle, the stapedius, is supplied by the facial nerve. This muscle has no mesh in the model: selecting it highlights the malleus, tube and membrane beside which it lies.',
    },
    zh: {
      loc: '位於咽鼓管上方骨性半管內的小肌肉，起自咽鼓管軟骨、蝶骨大翼與管壁；肌腱繞過匙突後轉向外側，附著於錘骨頸附近的錘骨柄。',
      fn: '把錘骨柄向內拉，使鼓膜繃緊並減小振動。咀嚼、打呵欠或聽到巨大聲響之前會收縮。',
      supply: '鼓膜張肌神經，來自下頜神經（經內側翼肌神經）。動脈：腦膜中動脈與上鼓室動脈的分支。',
      note: '本肌由三叉神經支配，而中耳的另一條肌肉鐙骨肌由顏面神經支配。本模型沒有這條肌肉的網格：選取時會標示與它相鄰的錘骨、咽鼓管與鼓膜。',
    },
  }}),
  P({id: 'stapedius', en: 'Stapedius muscle', zh: '鐙骨肌', group: 'middle', model: false, color: '#b86a5c', layer: -1, near: ['stapes', 'facial-nerve'], rel: ['stapes', 'facial-nerve', 'tensor-tympani'], card: {
    en: {
      loc: 'The smallest skeletal muscle of the body. It lies inside the pyramidal eminence on the back wall of the tympanic cavity; its tendon leaves the tip of the eminence and attaches to the neck of the stapes.',
      fn: 'Pulls the stapes backward and tilts the footplate, stiffening the ossicular chain and reducing the transmission of loud sounds (the acoustic reflex).',
      supply: 'Nerve to stapedius, a branch of the facial nerve in the descending part of the facial canal. Artery: stylomastoid artery.',
      note: 'If the facial nerve is paralysed above this branch the damping is lost and ordinary sounds become uncomfortably loud (hyperacusis). This muscle has no mesh in the model: selecting it highlights the stapes and the facial nerve beside it.',
    },
    zh: {
      loc: '人體最小的骨骼肌，位於鼓室後壁的錐隆起內；肌腱從錐隆起尖端穿出，附著於鐙骨頸。',
      fn: '把鐙骨向後拉並使底板傾斜，使聽小骨鏈變硬，減少過大聲音的傳遞（聽覺反射）。',
      supply: '鐙骨肌神經，是顏面神經在下行段發出的分支。動脈：莖乳動脈。',
      note: '顏面神經在此分支以上受損時，這個緩衝作用消失，一般聲音會變得刺耳（聽覺過敏）。本模型沒有這條肌肉的網格：選取時會標示相鄰的鐙骨與顏面神經。',
    },
  }}),
  P({id: 'pharyngotympanic-tube', en: 'Pharyngotympanic tube (Auditory tube)', zh: '咽鼓管', aliases: ['Eustachian tube', '耳咽管'], group: 'middle', model: true, color: '#c98f86', opacity: .7, layer: 3, schematic: true, rel: ['tympanic-cavity', 'tensor-tympani'], card: {
    en: {
      loc: 'About 3.5 to 4 cm long. It runs from the front wall of the tympanic cavity forward, inward and downward to the side wall of the nasopharynx. The back third is bony and lies beside the carotid canal; the front two thirds are cartilage and fibrous tissue and open at the pharyngeal opening behind the torus tubarius.',
      fn: 'Keeps the air pressure in the tympanic cavity equal to the outside and drains mucus. It is normally closed and opens when the tensor veli palatini (with the levator veli palatini and salpingopharyngeus) contracts in swallowing or yawning.',
      supply: 'Nerves: tympanic plexus and pharyngeal branches of the maxillary nerve. Arteries: ascending pharyngeal, middle meningeal and the artery of the pterygoid canal.',
      note: 'In young children the tube is shorter, flatter and more horizontal, so infection passes up from the throat more easily; this is one reason middle ear infection is common in childhood. The tube in this model is a schematic tube built along the described course.',
    },
    zh: {
      loc: '長約 3.5 至 4 公分，由鼓室前壁向前、向內、向下通到鼻咽側壁。後側約三分之一為骨部，緊鄰頸動脈管；前側約三分之二為軟骨與纖維組織，開口於咽鼓管圓枕後方的咽口。',
      fn: '使鼓室內的氣壓與外界相等，並引流黏液。平時關閉，吞嚥或打呵欠時，顎帆張肌（與顎帆提肌、耳咽管咽肌）收縮而打開。',
      supply: '神經：鼓室神經叢與上頜神經的咽支。動脈：升咽動脈、腦膜中動脈與翼管動脈。',
      note: '幼兒的咽鼓管較短、較平、較接近水平，咽部的感染較容易上行，這是兒童常發生中耳炎的原因之一。本模型的咽鼓管是依上述走向建立的示意管道。',
    },
  }}),
  // ---- bony labyrinth
  P({id: 'vestibule', en: 'Vestibule', zh: '前庭', group: 'bony', model: true, color: '#d3c6a6', opacity: .4, layer: 4, rel: ['oval-window', 'utricle', 'saccule', 'anterior-canal', 'lateral-canal', 'posterior-canal', 'scala-vestibuli'], card: {
    en: {
      loc: 'The central chamber of the bony labyrinth, about 4 mm across, between the cochlea in front and the semicircular canals behind. The oval window lies in its lateral wall; the medial wall faces the internal acoustic meatus. It holds the utricle (in the elliptical recess, upper back) and the saccule (in the spherical recess, lower front). The vestibular aqueduct leaves it toward the back of the petrous bone.',
      fn: 'Contains the perilymph around the utricle and saccule. The oval window passes the pressure of the stapes into this fluid.',
      supply: 'Arteries: labyrinthine artery (usually from the anterior inferior cerebellar artery) and the stylomastoid artery. Nerve: branches of the vestibular nerve to the utricle and saccule.',
      note: 'In this model the bony labyrinth is the fluid-space cast of the OpenEar specimen, divided into vestibule, three canals and scala vestibuli by the nearest structure of the registered IE-Map inner ear; the borders between the parts are approximate.',
    },
    zh: {
      loc: '骨性迷路的中央腔室，寬約 4 公釐，前方是耳蝸，後方是半規管。外側壁有卵圓窗，內側壁面向內聽道。內有橢圓囊（位於上後方的橢圓隱窩）與球狀囊（位於下前方的球形隱窩）；前庭水管由此通向岩骨後面。',
      fn: '包含橢圓囊與球狀囊周圍的外淋巴液。卵圓窗把鐙骨的壓力傳入這些液體。',
      supply: '動脈：迷路動脈（通常來自前下小腦動脈）與莖乳動脈。神經：前庭神經到橢圓囊與球狀囊的分支。',
      note: '本模型的骨性迷路是 OpenEar 標本液腔的鑄型，依對位後最近的 IE-Map 內耳構造分成前庭、三條半規管與前庭階，各部之間的分界為近似。',
    },
  }}),
  P({id: 'anterior-canal', en: 'Anterior semicircular canal', zh: '前半規管', group: 'bony', model: true, color: '#d6c9a8', opacity: .4, layer: 4, rel: ['anterior-duct', 'posterior-canal', 'lateral-canal', 'vestibule'], card: {
    en: {
      loc: 'Arches upward and forms the arcuate eminence on the front of the petrous bone. Its plane is roughly at right angles to the long axis of the petrous bone. The end behind joins the posterior canal as the common crus and opens into the vestibule; the front end carries the ampulla.',
      fn: 'A bony tunnel for the anterior semicircular duct, filled with perilymph. The three canals lie at nearly right angles to each other, so a rotation of the head in any direction moves the endolymph in at least one of them.',
      supply: 'Arteries: labyrinthine artery and stylomastoid artery.',
      note: 'If the bone over this canal is thin or missing (superior canal dehiscence), loud sound or pressure changes can stimulate the vestibular system and cause vertigo.',
    },
    zh: {
      loc: '向上拱起，在岩骨前面形成弓狀隆起；其平面約與岩骨長軸垂直。後端與後半規管合成總腳，開口於前庭；前端有壺腹。',
      fn: '容納前半規導管的骨性管道，內有外淋巴液。三條半規管彼此約成直角，因此頭向任何方向轉動，至少會推動其中一條管內的內淋巴液。',
      supply: '動脈：迷路動脈與莖乳動脈。',
      note: '此管上方的骨質過薄或缺損（上半規管裂損）時，巨大聲響或壓力變化會刺激前庭系統而引起眩暈。',
    },
  }}),
  P({id: 'lateral-canal', en: 'Lateral semicircular canal', zh: '外側半規管', group: 'bony', model: true, color: '#d6c9a8', opacity: .4, layer: 4, rel: ['lateral-duct', 'anterior-canal', 'posterior-canal', 'vestibule', 'facial-nerve'], card: {
    en: {
      loc: 'The horizontal canal. With the head upright it is tilted about 30 degrees, its front end higher. It makes a bulge on the medial wall of the entrance to the mastoid antrum, just above the facial canal. It opens into the vestibule at both ends; the ampulla is at the front end.',
      fn: 'A bony tunnel for the lateral semicircular duct. It senses turning of the head about a vertical axis (looking left or right); the two lateral canals work as a pair.',
      supply: 'Arteries: labyrinthine artery and stylomastoid artery.',
      note: 'Warm or cold water in the ear changes the flow of endolymph in this canal and produces nystagmus (the caloric test). Because it lies closest to the middle ear, it is the canal most often eroded by a cholesteatoma.',
    },
    zh: {
      loc: '水平方向的半規管。頭部直立時約傾斜 30 度，前端較高。它在乳突竇入口的內側壁形成隆起，位於顏面神經管上方。兩端都開口於前庭；壺腹位於前端。',
      fn: '容納外側半規導管的骨性管道。它感受頭部繞垂直軸的轉動（向左或向右轉頭），左右兩條外側半規管成對運作。',
      supply: '動脈：迷路動脈與莖乳動脈。',
      note: '耳內注入冷水或溫水會改變此管內淋巴液的流動而引起眼振（冷熱水試驗）。由於它最靠近中耳，膽脂瘤最常侵蝕這條半規管。',
    },
  }}),
  P({id: 'posterior-canal', en: 'Posterior semicircular canal', zh: '後半規管', group: 'bony', model: true, color: '#d6c9a8', opacity: .4, layer: 4, rel: ['posterior-duct', 'anterior-canal', 'lateral-canal', 'vestibule'], card: {
    en: {
      loc: 'Runs in the back of the petrous bone, roughly parallel to its posterior surface and at right angles to the plane of the anterior canal. The upper end joins the anterior canal as the common crus; the lower end carries the ampulla and opens separately into the lower back of the vestibule.',
      fn: 'A bony tunnel for the posterior semicircular duct. Together with the anterior canal it senses rotation that nods the head or tilts it toward a shoulder.',
      supply: 'Arteries: labyrinthine artery and stylomastoid artery.',
      note: 'When the head is lying back, the posterior canal is the lowest canal, so loose otoconia tend to settle in it and cause benign paroxysmal positional vertigo; the Epley manoeuvre moves them out of the canal.',
    },
    zh: {
      loc: '位於岩骨後部，約與其後面平行，且與前半規管的平面成直角。上端與前半規管合成總腳；下端有壺腹，單獨開口於前庭的下後方。',
      fn: '容納後半規導管的骨性管道。它與前半規管一起，感受使頭點頭或向肩膀傾斜的轉動。',
      supply: '動脈：迷路動脈與莖乳動脈。',
      note: '頭向後躺時，後半規管是最低的一條管道，因此鬆脫的耳石容易落入其中，引起良性陣發性姿勢性眩暈；Epley 復位法可把耳石移出管外。',
    },
  }}),
  P({id: 'scala-vestibuli', en: 'Scala vestibuli', zh: '前庭階', group: 'bony', model: true, color: '#d98a7c', opacity: .85, layer: 4, rel: ['vestibule', 'scala-tympani', 'cochlear-duct', 'oval-window'], card: {
    en: {
      loc: 'The upper of the two perilymph channels that wind about two and three quarter turns around the modiolus of the cochlea. It begins at the vestibule just inside the oval window, runs up to the apex and joins the scala tympani at the helicotrema. The vestibular membrane separates it from the cochlear duct.',
      fn: 'Carries the pressure wave from the oval window up the cochlea.',
      supply: 'Filled with perilymph. Arteries: cochlear branches of the labyrinthine artery.',
      note: 'Shown from the OpenEar specimen, from the vestibule to the apex of the cochlea.',
    },
    zh: {
      loc: '兩條外淋巴液通道中位於上方的一條，繞耳蝸蝸軸約兩圈又四分之三。起點在前庭，緊接卵圓窗內側，向上走到蝸頂，在耳蝸孔與鼓階相通。前庭膜把它與耳蝸管隔開。',
      fn: '把來自卵圓窗的壓力波沿耳蝸向上傳送。',
      supply: '內含外淋巴液。動脈：迷路動脈的耳蝸分支。',
      note: '此處顯示的是 OpenEar 標本中從前庭到蝸頂的部分。',
    },
  }}),
  P({id: 'scala-tympani', en: 'Scala tympani', zh: '鼓階', group: 'bony', model: true, color: '#6f9bd1', opacity: .85, layer: 4, rel: ['scala-vestibuli', 'cochlear-duct', 'round-window'], card: {
    en: {
      loc: 'The lower perilymph channel of the cochlea. It begins at the helicotrema at the apex, winds down to the base and ends at the round window, close to the opening of the cochlear aqueduct. The basilar membrane separates it from the cochlear duct.',
      fn: 'Returns the pressure wave: when the stapes pushes in, the membrane of the round window bulges out, which lets the fluid move.',
      supply: 'Filled with perilymph, which connects with the cerebrospinal fluid through the cochlear aqueduct. Arteries: cochlear branches of the labyrinthine artery.',
      note: 'The electrode array of a cochlear implant is inserted into this channel, usually through or next to the round window.',
    },
    zh: {
      loc: '耳蝸中位於下方的外淋巴液通道。起點在蝸頂的耳蝸孔，向下繞到蝸底，終於圓窗，靠近耳蝸水管的開口。基底膜把它與耳蝸管隔開。',
      fn: '傳回壓力波：鐙骨向內推時，圓窗的膜向外膨出，使液體得以流動。',
      supply: '內含外淋巴液，經耳蝸水管與腦脊髓液相通。動脈：迷路動脈的耳蝸分支。',
      note: '人工電子耳的電極陣列就插入這條通道，通常經由圓窗或其旁邊進入。',
    },
  }}),
  P({id: 'oval-window', en: 'Oval window', zh: '卵圓窗', group: 'bony', model: true, color: '#b8433b', layer: 4, mark: true, rel: ['stapes', 'vestibule', 'tympanic-cavity'], card: {
    en: {
      loc: 'The oval opening in the lateral wall of the vestibule, above the promontory and below the bulge of the facial canal. It is closed by the footplate of the stapes, held by the annular ligament. It is drawn here as a coloured patch on the bony labyrinth.',
      fn: 'The entrance through which the vibration of the ossicles passes into the fluids of the inner ear.',
      supply: 'The covering mucosa is supplied by the tympanic plexus.',
      note: 'In otosclerosis new bone fixes the footplate in this window.',
    },
    zh: {
      loc: '前庭外側壁上的橢圓形開口，位於岬的上方、顏面神經管隆起的下方，由鐙骨底板封住，並以環狀韌帶固定。這裡以標在骨性迷路上的色塊表示。',
      fn: '聽小骨的振動由此進入內耳的液體。',
      supply: '表面的黏膜由鼓室神經叢支配。',
      note: '耳硬化症時，新生的骨質把底板固定在這個窗上。',
    },
  }}),
  P({id: 'round-window', en: 'Round window', zh: '圓窗', group: 'bony', model: true, color: '#2f6aa8', layer: 4, mark: true, rel: ['scala-tympani', 'tympanic-cavity'], card: {
    en: {
      loc: 'The round opening at the base of the cochlea, below and behind the oval window, at the bottom of a small niche. It is closed by the secondary tympanic membrane and opens into the scala tympani. It is drawn here as a coloured patch on the scala tympani.',
      fn: 'Lets the incompressible perilymph move: it bulges outward as the stapes pushes the oval window inward.',
      supply: 'The covering mucosa is supplied by the tympanic plexus.',
      note: 'Surgeons often reach the scala tympani through the round window niche to insert a cochlear implant.',
    },
    zh: {
      loc: '位於耳蝸底部、卵圓窗的下後方、一個小凹內的圓形開口，由第二鼓膜封住，向內通到鼓階。這裡以標在鼓階上的色塊表示。',
      fn: '讓不可壓縮的外淋巴液得以流動：鐙骨把卵圓窗向內推時，圓窗向外膨出。',
      supply: '表面的黏膜由鼓室神經叢支配。',
      note: '植入人工電子耳時，外科醫師常經圓窗凹進入鼓階。',
    },
  }}),
  // ---- membranous labyrinth
  P({id: 'utricle', en: 'Utricle', zh: '橢圓囊', group: 'membranous', model: true, color: '#e9c46a', layer: -1, rel: ['saccule', 'anterior-duct', 'lateral-duct', 'posterior-duct', 'vestibule'], card: {
    en: {
      loc: 'The larger of the two otolith sacs, in the elliptical recess at the upper back of the vestibule. The three semicircular ducts open into it by five openings. The macula of the utricle lies on its floor in a nearly horizontal plane. It joins the saccule through the utriculosaccular duct, which leads to the endolymphatic duct.',
      fn: 'Senses linear acceleration and head tilt in the horizontal plane (forward and back, side to side). The hair cells are covered by a gelatinous layer weighted with calcium carbonate crystals (otoconia), which lag behind when the head moves.',
      supply: 'Arteries: labyrinthine artery. Nerve: utricular branch of the vestibular nerve (superior division).',
      note: 'Crystals shed from the utricular macula are thought to be the source of the otoconia that cause benign paroxysmal positional vertigo.',
    },
    zh: {
      loc: '兩個耳石囊中較大的一個，位於前庭上後方的橢圓隱窩。三條半規導管以五個開口通入其中。橢圓囊斑位於囊底，近乎水平。它經橢圓囊球狀囊管與球狀囊相通，再通向內淋巴管。',
      fn: '感受水平面上的線性加速與頭部傾斜（前後、左右）。毛細胞上覆有含碳酸鈣結晶（耳石）的膠狀層，頭部移動時耳石因慣性而落後。',
      supply: '動脈：迷路動脈。神經：前庭神經上分支的橢圓囊支。',
      note: '一般認為，良性陣發性姿勢性眩暈的耳石來自橢圓囊斑脫落的結晶。',
    },
  }}),
  P({id: 'saccule', en: 'Saccule', zh: '球狀囊', group: 'membranous', model: true, color: '#f0a35e', layer: -1, rel: ['utricle', 'cochlear-duct', 'endolymphatic-sac', 'vestibule'], card: {
    en: {
      loc: 'The smaller, rounder otolith sac, in the spherical recess at the lower front of the vestibule. Its macula lies on the medial wall in a nearly vertical plane. It joins the cochlear duct through the ductus reuniens and the utricle through the utriculosaccular duct.',
      fn: 'Senses linear acceleration in the vertical plane (rising or falling, as in a lift) and also responds to loud, low-frequency sound and vibration.',
      supply: 'Arteries: labyrinthine artery. Nerve: saccular branch of the vestibular nerve (inferior division).',
      note: 'Vestibular evoked myogenic potentials recorded from the neck muscles are used clinically to test saccular function.',
    },
    zh: {
      loc: '兩個耳石囊中較小、較圓的一個，位於前庭下前方的球形隱窩。球狀囊斑位於內側壁，近乎垂直。它經連合管與耳蝸管相通，並經橢圓囊球狀囊管與橢圓囊相通。',
      fn: '感受垂直方向的線性加速（如搭電梯上升或下降），也對巨大的低頻聲音與振動有反應。',
      supply: '動脈：迷路動脈。神經：前庭神經下分支的球狀囊支。',
      note: '臨床上以頸部肌肉記錄到的前庭誘發肌源電位，來檢查球狀囊的功能。',
    },
  }}),
  P({id: 'anterior-duct', en: 'Anterior semicircular duct', zh: '前半規導管', group: 'membranous', model: true, color: '#8fcf94', layer: -1, rel: ['anterior-canal', 'anterior-ampulla', 'utricle'], card: {
    en: {
      loc: 'The membranous duct inside the anterior bony canal, occupying about a third of its width and surrounded by perilymph. The end behind unites with the posterior duct as the common duct and opens into the utricle; the front end widens into the ampulla.',
      fn: 'When the head turns in the plane of the duct, the endolymph lags behind because of its inertia and deflects the cupula in the ampulla, which signals angular acceleration.',
      supply: 'Arteries: labyrinthine artery. Nerve: anterior ampullary nerve (superior division of the vestibular nerve).',
    },
    zh: {
      loc: '位於前半規管骨管內的膜性管道，約佔管徑的三分之一，周圍是外淋巴液。後端與後半規導管合成總導管，通入橢圓囊；前端膨大成壺腹。',
      fn: '頭部在這條導管的平面內轉動時，內淋巴液因慣性而落後，推動壺腹內的嵴頂，傳遞角加速度的訊號。',
      supply: '動脈：迷路動脈。神經：前壺腹神經（前庭神經上分支）。',
    },
  }}),
  P({id: 'lateral-duct', en: 'Lateral semicircular duct', zh: '外側半規導管', group: 'membranous', model: true, color: '#90b5ee', layer: -1, rel: ['lateral-canal', 'lateral-ampulla', 'utricle'], card: {
    en: {
      loc: 'The membranous duct inside the lateral bony canal, surrounded by perilymph. It opens into the utricle at both ends; the front end widens into the ampulla.',
      fn: 'Signals angular acceleration of the head about a vertical axis. Flow of endolymph toward the utricle excites this duct, so turning to the right excites the right lateral duct more than the left.',
      supply: 'Arteries: labyrinthine artery. Nerve: lateral ampullary nerve (superior division of the vestibular nerve).',
    },
    zh: {
      loc: '位於外側半規管骨管內的膜性管道，周圍是外淋巴液。兩端都通入橢圓囊；前端膨大成壺腹。',
      fn: '傳遞頭部繞垂直軸轉動的角加速度。內淋巴液朝橢圓囊流動時會興奮這條導管，因此向右轉頭時，右側外側導管的興奮比左側強。',
      supply: '動脈：迷路動脈。神經：外側壺腹神經（前庭神經上分支）。',
    },
  }}),
  P({id: 'posterior-duct', en: 'Posterior semicircular duct', zh: '後半規導管', group: 'membranous', model: true, color: '#cfa3e6', layer: -1, rel: ['posterior-canal', 'posterior-ampulla', 'utricle'], card: {
    en: {
      loc: 'The membranous duct inside the posterior bony canal, surrounded by perilymph. The upper end joins the anterior duct as the common duct; the lower end widens into the ampulla and opens separately into the utricle.',
      fn: 'Signals angular acceleration that nods the head or tilts it toward a shoulder. The posterior duct of one ear and the anterior duct of the other ear lie in nearly the same plane and work as a pair.',
      supply: 'Arteries: labyrinthine artery. Nerve: posterior ampullary nerve (inferior division of the vestibular nerve).',
    },
    zh: {
      loc: '位於後半規管骨管內的膜性管道，周圍是外淋巴液。上端與前半規導管合成總導管；下端膨大成壺腹，單獨通入橢圓囊。',
      fn: '傳遞使頭部點頭或向肩膀傾斜的角加速度。一側耳的後半規導管與另一側耳的前半規導管，位於幾乎相同的平面，成對運作。',
      supply: '動脈：迷路動脈。神經：後壺腹神經（前庭神經下分支）。',
    },
  }}),
  P({id: 'anterior-ampulla', en: 'Ampulla of anterior semicircular duct', zh: '前半規導管壺腹', group: 'membranous', model: true, color: '#4f9d5a', layer: -1, rel: ['anterior-duct', 'utricle'], card: {
    en: {
      loc: 'The widened front end of the anterior semicircular duct. Its floor carries the crista ampullaris, a ridge of hair cells and supporting cells, covered by a jelly-like cupula that reaches across the lumen to the opposite wall.',
      fn: 'Endolymph flow bends the cupula and the hair-cell stereocilia in it. In the anterior and posterior ducts, flow away from the utricle excites the hair cells.',
      supply: 'Nerve: anterior ampullary nerve (superior division of the vestibular nerve). Arteries: labyrinthine artery.',
    },
    zh: {
      loc: '前半規導管前端膨大的部分。壺腹底有壺腹嵴，由毛細胞與支持細胞構成，上覆膠狀的嵴頂，橫越管腔到達對側管壁。',
      fn: '內淋巴液的流動使嵴頂與其中毛細胞的靜纖毛彎曲。在前、後半規導管，內淋巴液流離橢圓囊時會興奮毛細胞。',
      supply: '神經：前壺腹神經（前庭神經上分支）。動脈：迷路動脈。',
    },
  }}),
  P({id: 'lateral-ampulla', en: 'Ampulla of lateral semicircular duct', zh: '外側半規導管壺腹', group: 'membranous', model: true, color: '#4a7fd0', layer: -1, rel: ['lateral-duct', 'utricle'], card: {
    en: {
      loc: 'The widened front end of the lateral semicircular duct, close to the ampulla of the anterior duct. It contains a crista ampullaris with its cupula.',
      fn: 'In the lateral duct, flow of endolymph toward the utricle bends the cupula in the exciting direction (the opposite of the anterior and posterior ducts).',
      supply: 'Nerve: lateral ampullary nerve (superior division of the vestibular nerve). Arteries: labyrinthine artery.',
    },
    zh: {
      loc: '外側半規導管前端膨大的部分，靠近前半規導管的壺腹，內有壺腹嵴與嵴頂。',
      fn: '在外側導管，內淋巴液朝橢圓囊流動時，嵴頂向興奮方向彎曲（與前、後半規導管相反）。',
      supply: '神經：外側壺腹神經（前庭神經上分支）。動脈：迷路動脈。',
    },
  }}),
  P({id: 'posterior-ampulla', en: 'Ampulla of posterior semicircular duct', zh: '後半規導管壺腹', group: 'membranous', model: true, color: '#a35bc2', layer: -1, rel: ['posterior-duct', 'saccule'], card: {
    en: {
      loc: 'The widened lower end of the posterior semicircular duct, near the lower back of the vestibule. It contains a crista ampullaris with its cupula.',
      fn: 'Flow of endolymph away from the utricle bends the cupula in the exciting direction.',
      supply: 'Nerve: posterior ampullary nerve (inferior division of the vestibular nerve). Arteries: labyrinthine artery.',
    },
    zh: {
      loc: '後半規導管下端膨大的部分，靠近前庭的下後方，內有壺腹嵴與嵴頂。',
      fn: '內淋巴液流離橢圓囊時，嵴頂向興奮方向彎曲。',
      supply: '神經：後壺腹神經（前庭神經下分支）。動脈：迷路動脈。',
    },
  }}),
  P({id: 'cochlear-duct', en: 'Cochlear duct (Scala media)', zh: '耳蝸管', group: 'membranous', model: false, color: '#9fc4a0', layer: -1, near: ['scala-vestibuli', 'scala-tympani', 'saccule'], rel: ['scala-vestibuli', 'scala-tympani', 'saccule', 'spiral-ganglion', 'cochlear-nerve'], card: {
    en: {
      loc: 'The triangular membranous tube (scala media) inside the cochlea, between the scala vestibuli above and the scala tympani below. Its roof is the vestibular membrane; its floor is the basilar membrane, which carries the organ of Corti with the tectorial membrane above it; its outer wall is the stria vascularis. It is closed at the apex and joins the saccule through the ductus reuniens.',
      fn: 'Filled with endolymph, which is rich in potassium; the stria vascularis keeps the endocochlear potential of about +80 mV. Sound waves move the basilar membrane, and the hair cells at different places respond best to different frequencies: high at the base, low at the apex.',
      supply: 'Arteries: cochlear branch of the labyrinthine artery. Nerve: cochlear nerve fibres from the spiral ganglion.',
      note: 'This duct has no mesh in the model: selecting it highlights the scala vestibuli and scala tympani, between which it lies, and the saccule that it joins.',
    },
    zh: {
      loc: '位於耳蝸內的三角形膜性管道（中階），介於上方的前庭階與下方的鼓階之間。頂是前庭膜；底是基底膜，上有柯蒂氏器，其上方是覆膜；外側壁是血管紋。蝸頂端為盲端，經連合管與球狀囊相通。',
      fn: '內含富含鉀離子的內淋巴液，血管紋維持約 +80 mV 的耳蝸內電位。聲波使基底膜振動，不同位置的毛細胞對不同頻率反應最強：蝸底為高頻，蝸頂為低頻。',
      supply: '動脈：迷路動脈的耳蝸分支。神經：來自螺旋神經節的耳蝸神經纖維。',
      note: '本模型沒有耳蝸管的網格：選取時會標示它所在位置上下的前庭階與鼓階，以及與它相通的球狀囊。',
    },
  }}),
  P({id: 'endolymphatic-sac', en: 'Endolymphatic sac', zh: '內淋巴囊', group: 'membranous', model: false, color: '#c9b29a', layer: -1, near: ['vestibule', 'saccule', 'utricle'], rel: ['utricle', 'saccule', 'vestibule'], card: {
    en: {
      loc: 'The blind pouch at the end of the endolymphatic duct. The duct passes through the vestibular aqueduct from the junction of the utricular and saccular ducts, and the sac lies between two layers of dura on the back of the petrous bone, close to the sigmoid sinus.',
      fn: 'Thought to take up endolymph and to remove debris, and to take part in the defence of the inner ear.',
      note: 'Too much endolymph in the labyrinth (endolymphatic hydrops) is the change associated with Meniere disease: attacks of vertigo, fluctuating low-frequency hearing loss, tinnitus and a feeling of fullness in the ear. This sac has no mesh in the model: selecting it highlights the vestibule and the utricle and saccule from which its duct arises.',
    },
    zh: {
      loc: '內淋巴管末端的盲囊。內淋巴管從橢圓囊管與球狀囊管的會合處出發，穿過前庭水管；囊則位於岩骨後面兩層硬腦膜之間，靠近乙狀竇。',
      fn: '一般認為它吸收內淋巴液、清除碎屑，並參與內耳的防禦。',
      note: '迷路內的內淋巴液過多（內淋巴水腫）與梅尼爾氏症有關：反覆發作的眩暈、起伏的低頻聽力下降、耳鳴與耳脹感。本模型沒有內淋巴囊的網格：選取時會標示前庭，以及內淋巴管起源的橢圓囊與球狀囊。',
    },
  }}),
  // ---- nerves and ganglia
  P({id: 'facial-nerve', en: 'Facial nerve (intratemporal part)', zh: '顏面神經（顳骨內段）', group: 'nerves', model: true, color: '#f2c200', layer: -1, rel: ['geniculate-ganglion', 'chorda-tympani', 'stapedius', 'tympanic-cavity', 'vestibulocochlear-nerve'], card: {
    en: {
      loc: 'Runs inside the facial canal of the temporal bone. It enters the internal acoustic meatus with the vestibulocochlear nerve, passes through the short labyrinthine segment above the cochlea to the geniculate ganglion (first genu), then runs back along the medial wall of the tympanic cavity above the oval window (tympanic segment), turns down at the second genu and descends behind the cavity (mastoid segment) to the stylomastoid foramen.',
      fn: 'Motor fibres to the muscles of facial expression and to the stapedius. Parasympathetic fibres to the lacrimal, nasal and palatine glands (greater petrosal nerve) and to the submandibular and sublingual glands (chorda tympani). Taste from the front two thirds of the tongue, and a small area of skin of the ear.',
      supply: 'Arteries: petrosal branch of the middle meningeal artery (upper part), stylomastoid artery (lower part) and the labyrinthine artery.',
      note: 'The bony canal is thin over the oval window and may have gaps, so infection and surgery in the middle ear can injure the nerve. Bell palsy is a sudden paralysis of the nerve. Only the part inside the temporal bone is modelled.',
    },
    zh: {
      loc: '行經顳骨的顏面神經管。它與前庭耳蝸神經一起進入內聽道，經過耳蝸上方短而窄的迷路段到膝狀神經節（第一膝），再沿鼓室內側壁、卵圓窗上方向後走（鼓室段），在第二膝處轉向下，從鼓室後方下行（乳突段）到莖乳孔。',
      fn: '運動纖維支配顏面表情肌與鐙骨肌；副交感纖維經大淺岩神經到淚腺、鼻腺與顎腺，經鼓索神經到頜下腺與舌下腺；並傳遞舌前三分之二的味覺，以及耳部一小塊皮膚的感覺。',
      supply: '動脈：腦膜中動脈的岩支（上段）、莖乳動脈（下段）與迷路動脈。',
      note: '顏面神經管在卵圓窗上方很薄，也可能有缺口，因此中耳的感染與手術可能傷到神經。貝爾氏麻痺是此神經突然麻痺。模型只畫出位於顳骨內的部分。',
    },
  }}),
  P({id: 'chorda-tympani', en: 'Chorda tympani nerve', zh: '鼓索神經', group: 'nerves', model: true, color: '#e8a63a', layer: -1, rel: ['facial-nerve', 'malleus', 'incus', 'tympanic-cavity'], card: {
    en: {
      loc: 'A branch of the facial nerve given off in the mastoid segment about 6 mm above the stylomastoid foramen. It runs up in a small canal, enters the tympanic cavity through the back wall, crosses the medial surface of the tympanic membrane between the handle of the malleus and the long crus of the incus (covered by mucosa), leaves through the petrotympanic fissure and joins the lingual nerve in the infratemporal fossa.',
      fn: 'Carries taste from the front two thirds of the tongue and preganglionic parasympathetic fibres to the submandibular ganglion, which supplies the submandibular and sublingual glands.',
      note: 'Because it crosses the tympanic cavity, it can be stretched or cut in ear surgery or damaged by infection, which changes taste or gives a metallic taste on one side of the tongue.',
    },
    zh: {
      loc: '顏面神經的分支，在乳突段、莖乳孔上方約 6 公釐處發出。它走在一條小管內向上，從後壁進入鼓室，在錘骨柄與砧骨長腳之間、表面覆有黏膜，橫越鼓膜內側，再經岩鼓裂離開，在顳下窩加入舌神經。',
      fn: '傳遞舌前三分之二的味覺，以及到下頜下神經節的節前副交感纖維，後者支配頜下腺與舌下腺。',
      note: '由於它橫越鼓室，中耳手術或感染可能使它被拉傷或切斷，造成味覺改變，或一側舌頭有金屬味。',
    },
  }}),
  P({id: 'cochlear-nerve', en: 'Cochlear nerve', zh: '耳蝸神經', aliases: ['蝸神經'], group: 'nerves', model: true, color: '#efd27a', layer: -1, rel: ['spiral-ganglion', 'vestibular-nerve', 'vestibulocochlear-nerve', 'cochlear-duct'], card: {
    en: {
      loc: 'Formed by the central processes of the bipolar neurons of the spiral ganglion (about 30,000 fibres). It runs through the central axis of the cochlea (modiolus) to the fundus of the internal acoustic meatus, where it lies in front of and below the vestibular nerve, and goes on as the cochlear part of the vestibulocochlear nerve.',
      fn: 'Carries the sound signal from the hair cells of the organ of Corti. The fibres keep their order of pitch (tonotopic) and end in the dorsal and ventral cochlear nuclei at the pontomedullary junction.',
      supply: 'Arteries: cochlear branches of the labyrinthine artery.',
      note: 'A vestibular schwannoma usually grows from the vestibular nerve but presses on the cochlear nerve, causing one-sided hearing loss and tinnitus. The mesh from the OpenEar specimen is coarse and may include more of the nerve bundle in the internal acoustic meatus than the cochlear nerve alone.',
    },
    zh: {
      loc: '由螺旋神經節雙極神經元的中樞突（約 30,000 條纖維）組成。它穿過耳蝸中軸（蝸軸）到內聽道底，在前庭神經的前下方，再延續為前庭耳蝸神經的蝸部。',
      fn: '傳遞柯蒂氏器毛細胞的聲音訊號。纖維依音高排列（音頻分布），終止於腦橋延髓交界處的背側與腹側耳蝸神經核。',
      supply: '動脈：迷路動脈的耳蝸分支。',
      note: '前庭神經鞘瘤通常長在前庭神經，但會壓迫耳蝸神經，造成單側聽力下降與耳鳴。OpenEar 標本的網格較粗，可能包含內聽道內不只耳蝸神經的神經束。',
    },
  }}),
  P({id: 'vestibular-nerve', en: 'Vestibular nerve', zh: '前庭神經', group: 'nerves', model: false, color: '#d8c36a', layer: -1, near: ['cochlear-nerve', 'utricle', 'saccule', 'anterior-ampulla', 'lateral-ampulla', 'posterior-ampulla'], rel: ['vestibular-ganglion', 'cochlear-nerve', 'vestibulocochlear-nerve', 'utricle', 'saccule'], card: {
    en: {
      loc: 'Formed by the central processes of the bipolar neurons of the vestibular ganglion in the outer end of the internal acoustic meatus. The superior division supplies the utricle and the anterior and lateral ampullae; the inferior division supplies the saccule and the posterior ampulla. The nerve joins the cochlear nerve to form the vestibulocochlear nerve.',
      fn: 'Carries signals about head movement and position to the vestibular nuclei in the brainstem and directly to the flocculonodular lobe of the cerebellum.',
      supply: 'Arteries: labyrinthine artery.',
      note: 'Vestibular neuritis causes sudden severe vertigo without hearing loss. This nerve has no mesh in the model: selecting it highlights the cochlear nerve beside it and the end organs it supplies.',
    },
    zh: {
      loc: '由內聽道外端前庭神經節雙極神經元的中樞突組成。上分支支配橢圓囊、前壺腹與外側壺腹；下分支支配球狀囊與後壺腹。它與耳蝸神經合成前庭耳蝸神經。',
      fn: '傳遞頭部運動與位置的訊號，到腦幹的前庭神經核，並直接到小腦的絨球小結葉。',
      supply: '動脈：迷路動脈。',
      note: '前庭神經炎會突然出現嚴重眩暈，但聽力不受影響。本模型沒有前庭神經的網格：選取時會標示相鄰的耳蝸神經與它所支配的末梢器官。',
    },
  }}),
  P({id: 'vestibulocochlear-nerve', en: 'Vestibulocochlear nerve', zh: '前庭耳蝸神經', group: 'nerves', model: false, color: '#e3cf7f', layer: -1, near: ['cochlear-nerve', 'facial-nerve'], rel: ['cochlear-nerve', 'vestibular-nerve', 'facial-nerve'], card: {
    en: {
      loc: 'The eighth cranial nerve. Its cochlear and vestibular parts run together through the internal acoustic meatus with the facial nerve and the labyrinthine artery, cross the cerebellopontine angle and enter the brainstem at the pontomedullary junction, lateral to the facial nerve.',
      fn: 'Special sensory nerve for hearing (cochlear part) and balance (vestibular part).',
      supply: 'Arteries: labyrinthine artery, usually a branch of the anterior inferior cerebellar artery.',
      note: 'Tumours in the cerebellopontine angle, most often vestibular schwannomas, press on this nerve and on the facial nerve beside it. This nerve has no complete mesh in the model: selecting it highlights the cochlear nerve and the facial nerve, which run beside it.',
    },
    zh: {
      loc: '第八對腦神經。蝸部與前庭部一起，隨顏面神經與迷路動脈穿過內聽道，越過小腦橋腦角，在腦橋延髓交界處、顏面神經外側進入腦幹。',
      fn: '特殊感覺神經，負責聽覺（蝸部）與平衡覺（前庭部）。',
      supply: '動脈：迷路動脈，通常是前下小腦動脈的分支。',
      note: '小腦橋腦角的腫瘤（最常見為前庭神經鞘瘤）會壓迫此神經及其旁的顏面神經。本模型沒有完整的前庭耳蝸神經網格：選取時會標示與它並行的耳蝸神經與顏面神經。',
    },
  }}),
  P({id: 'spiral-ganglion', en: 'Spiral ganglion', zh: '螺旋神經節', group: 'nerves', model: false, color: '#dcc890', layer: -1, near: ['scala-vestibuli', 'scala-tympani', 'cochlear-nerve'], rel: ['cochlear-nerve', 'cochlear-duct'], card: {
    en: {
      loc: 'A coiled ganglion in the spiral canal of the modiolus, winding with the turns of the cochlea around the central axis.',
      fn: 'Its bipolar neurons send peripheral processes to the hair cells of the organ of Corti (about 90 to 95 per cent of the cells supply the inner hair cells) and central processes that form the cochlear nerve.',
      note: 'Survival of these neurons is one of the factors that decide how much a cochlear implant helps. This ganglion has no mesh in the model: selecting it highlights the two scalae around the modiolus and the cochlear nerve that leaves it.',
    },
    zh: {
      loc: '位於蝸軸螺旋管內的神經節，隨耳蝸的圈數繞著中軸盤旋。',
      fn: '雙極神經元的周邊突通到柯蒂氏器的毛細胞（約 90% 至 95% 的細胞支配內毛細胞），中樞突組成耳蝸神經。',
      note: '這些神經元能否存活，是人工電子耳效果的決定因素之一。本模型沒有螺旋神經節的網格：選取時會標示蝸軸周圍的前庭階與鼓階，以及由它發出的耳蝸神經。',
    },
  }}),
  P({id: 'vestibular-ganglion', en: 'Vestibular ganglion', zh: '前庭神經節', group: 'nerves', model: false, color: '#d9c978', layer: -1, near: ['vestibule', 'cochlear-nerve', 'facial-nerve'], rel: ['vestibular-nerve', 'utricle', 'saccule'], card: {
    en: {
      loc: 'A ganglion in the outer end of the internal acoustic meatus, with a superior and an inferior part (Scarpa ganglion).',
      fn: 'Its bipolar neurons send peripheral processes to the maculae of the utricle and saccule and the cristae of the semicircular ducts; the central processes form the vestibular nerve and end in the vestibular nuclei and the cerebellum.',
      note: 'This ganglion has no mesh in the model: selecting it highlights the vestibule, the cochlear nerve and the facial nerve around the end of the internal acoustic meatus.',
    },
    zh: {
      loc: '位於內聽道外端的神經節，分為上部與下部（又稱 Scarpa 神經節）。',
      fn: '雙極神經元的周邊突通到橢圓囊與球狀囊的斑，以及半規導管的嵴；中樞突組成前庭神經，終止於前庭神經核與小腦。',
      note: '本模型沒有前庭神經節的網格：選取時會標示內聽道外端周圍的前庭、耳蝸神經與顏面神經。',
    },
  }}),
  P({id: 'geniculate-ganglion', en: 'Geniculate ganglion', zh: '膝狀神經節', group: 'nerves', model: false, color: '#f0d24a', layer: -1, near: ['facial-nerve'], rel: ['facial-nerve', 'chorda-tympani'], card: {
    en: {
      loc: 'The swelling of the facial nerve at its first genu (sharp bend) in the facial canal, on the medial wall above the cochlea. The greater petrosal nerve leaves from here.',
      fn: 'Holds the cell bodies of the sensory fibres of the facial nerve: taste from the front two thirds of the tongue and the palate, and a small area of skin of the concha and the ear canal.',
      note: 'Herpes zoster of this ganglion causes Ramsay Hunt syndrome: facial paralysis with painful blisters in the concha and ear canal. This ganglion has no mesh in the model: selecting it highlights the facial nerve, on which it lies.',
    },
    zh: {
      loc: '顏面神經在第一膝（急轉彎）處的膨大，位於顏面神經管內、耳蝸上方的內側壁。大淺岩神經由此發出。',
      fn: '含有顏面神經感覺纖維的細胞本體：傳遞舌前三分之二與顎的味覺，以及耳甲與外耳道一小塊皮膚的感覺。',
      note: '此神經節感染帶狀疱疹會造成 Ramsay Hunt 症候群：顏面麻痺，並在耳甲與外耳道出現疼痛的水泡。本模型沒有膝狀神經節的網格：選取時會標示它所在的顏面神經。',
    },
  }}),
];

export const EAR_BY_ID = new Map(EAR_PARTS.map(p => [p.id, p]));
/** Ids of the structures that have a mesh in ear-atlas.json, in catalogue order. */
export const EAR_MODEL_IDS = EAR_PARTS.filter(p => p.model).map(p => p.id);
export const earGroupOf = (id: EarGroupId) => EAR_GROUPS.find(g => g.id === id)!;

/** What the "Model scope" block says (the viewer's page). */
export const EAR_SCOPE = {
  zh: '一側（右側）的完整耳：外耳（耳廓、外耳道）、中耳（鼓膜、三塊聽小骨、咽鼓管）、內耳（骨性迷路的前庭、三條半規管、前庭階與鼓階；膜性迷路的橢圓囊、球狀囊、三條半規導管與壺腹）以及顏面神經、鼓索神經與耳蝸神經。另有 10 項只有資訊卡的構造（鼓室腔、鼓膜張肌、鐙骨肌、耳蝸管、內淋巴囊、前庭神經、前庭耳蝸神經、螺旋神經節、前庭神經節、膝狀神經節），選取時只會標示相鄰的真實構造。',
  source: '耳廓取自 BodyParts3D；中耳與骨迷路取自 OpenEar 標本；膜迷路取自 IE-Map，已與骨迷路對位（平均誤差小於 1 公釐）；外耳道與咽鼓管為依解剖描述建立的示意管道。兩個標本不是同一個人的耳，各部位的相對位置與比例不是同一個人的實測值。來源與授權見圖譜首頁的 Source & credits。',
} as const;
