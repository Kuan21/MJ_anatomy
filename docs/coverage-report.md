# 課程清單覆蓋報告

來源：`docs/curriculum-terms.json`（18 堂課自動抽出，3,816 個詞，寧多勿漏、含雜訊）。由 `node scripts/audit-coverage.mjs` 產生，`npm run check:coverage` 每次 build 前核對。

先篩走明顯唔係解剖結構嘅詞（病況、動作、段落字眼、純方位詞等），其餘同模型所有名稱做模糊配對：同義縮寫（m./a./v./n./lig./br.）、單複數、左右側、拉丁／英文拼法。模型名稱來自圖譜 2,234 件＋面部 47 件＋神經串流 286 件＋關節組織 349 件＋腦 437 件＋頸部血管。

| 類別 | 不重複詞數 | 意思 |
|---|---|---|
| 一、已有 | 1216 | 模型有，而且可以用搜尋／圖層揀到 |
| 二、模型有但 UI 搵唔到 | 0 | 模型有幾何，但搜尋唔到（見下面清單；已修好者會喺「修復」一節列明） |
| 三、模型冇 | 1125 | 交俾第 2 部分補模型 |
| 骨性標誌 | 262 | 結節、窩、切跡等，屬已有骨件嘅表面特徵，模型唔另外分件 |
| 雜訊（已略去） | 650 | 唔係解剖結構 |

## 闊背肌（Latissimus dorsi）點解搵唔到

**結論：係 (b)——BodyParts3D 原始資料有，但網站用嘅 4.0 匯出（2,234 件）冇匯出呢件肌肉，所以冇 geometry、冇 concept，搜尋當然搵唔到。** 唔係 (c) 有 geometry 但冇載入，亦唔係 (d) 搜尋索引漏收；之前報告話「來源入面根本冇」係錯嘅，原因係當時連唔到官方部件名單。

查證：

- BodyParts3D 3.0 官方部件名單（`parts_list_e.txt`，經 Kevin-Mattheus-Moerman/BodyParts3D 鏡像 `f0eeb6e843380cfe6b83797cf8c3e1af74de5e61` 取得）有 `FMA13357 latissimus dorsi`、`FMA13358 right latissimus dorsi`、`FMA13359 left latissimus dorsi`，而且左右兩邊都有 STL（各約 22.8 萬三角面）。
- `public/models/atlas.json`（4.0 匯出）嘅 2,234 件 mesh 同 3,432 個 concept 都冇 latissimus／dorsi／FMA13357–13359；`app/anatomy-source-overrides.json` 只排除咗 2 件（足跟動脈分支），冇涉及闊背肌。
- 3.0 有 925 個 STL；其中 128 個唔喺 4.0 atlas 入面：47 個係已經用緊嘅面部肌（OMFAtlas 套件），其餘主要係闊背肌、腹直肌、腹內斜肌、腹橫肌、錐狀肌、腰方肌、頸棘肌、多裂肌、腹股溝韌帶、伸趾短肌、右頸長肌、顳頂肌、帽狀腱膜、降鼻中隔肌（共 28 件已補入，見 `scripts/supplement-parts.json`），餘下係腦／心臟細部、毛髮、結腸等，另計。來源 mesh 編號有 100 段缺口、共 414 個編號冇匯出，同樣係 4.0 匯出時被略去。
- `normalizeAtlasSystems` 已經修正 89 件系統分類錯誤（例如腓骨肌被標成骨骼）；冇肌肉被 dissection／region／depth 過濾器濾走：全身視圖永遠顯示所有開咗嘅系統。

**修復**：`scripts/prepare-supplement.mjs` 由 3.0 鏡像下載已釘 sha256 嘅 STL，用 OMFAtlas 面部肌肉同一個相似變換（比例 1.0594、Z-up mm → Y-up m）對齊 4.0，再加一個平滑位移場（3.0 同 4.0 唔係同一個剛體：只用相似變換，肋骨處會偏 12 mm、腳部偏 30 mm），位移場用 270 塊兩版共有嘅骨做控制點；以 meshoptimizer 簡化（每件 ≤ 1.6 萬三角面，誤差 < 0.1%）、分成細包 gzip，載入方式同其餘分包一樣。留一法驗證（逐塊骨由其餘骨預測）：中位數誤差 1.3 mm、第 90 百分位 5.6 mm；`scripts/test-all-structures.mjs` 每次 check 都重算，並驗證闊背肌左右兩邊貼住肩胛骨、到達髂嵴。授權同現有資料一樣係 CC BY-SA 2.1 Japan。

**2,279 對 2,232 嘅差異**：47 件面部肌（`BP3-FMA…`）以前要由 raw.githubusercontent.com 讀 16 MB 單一檔案，慢線 60 秒逾時就永遠載入唔到，標題就顯示 2,279 但只畫到 2,232（載入條停喺 93 %）。而家改為同源、壓縮、分段載入；`test-all-structures.mjs` 檢查每一件都有對應 package bytes。

**同類 bug 嘅影響**：真正「模型有、UI 搵唔到」嘅係另一類——外周神經（286 件）、關節韌帶／關節囊（349 件）、腦結構（437 件）、頸部血管（8 件）喺 3D 入面畫到，但唔屬於 atlas concepts，搜尋搵唔到（課程詞中有 187 個受影響：神經 124、關節 49、腦 11、頸血管 3）。已經喺「Find a structure」加入呢 1,080 項索引，揀到神經會直接高亮，揀到其餘會打開圖層同資料卡。

**build 守門**：`npm run check:coverage`（亦係 `npm run build` 前置步驟）用 Find a structure 真正嘅比對函式（`app/mj-search.ts`）檢查：闊背肌（latissimus／背闊肌／闊背肌／背阔肌）等指定肌肉必須搵到；課程清單入面「模型有嘅肌肉」用講義寫法（縮寫展開後）全部必須搵到；每一件畫出嚟嘅 mesh 都屬於某個可搜尋 concept。唔通過就 build 失敗。

缺口編號（供補模型時對照）：FJ1303、FJ1307、FJ1314、FJ1327、FJ1354、FJ1358、FJ1365、FJ1378、FJ1471、FJ1519、FJ1523、FJ1529–1531、FJ1602–1653、FJ1765、FJ1845、FJ1847–1852、FJ1854–1857、FJ1859–1866、FJ1868–1873、FJ1875–1882、FJ1884–1892、FJ1894、FJ1897–1912、FJ1915、FJ1917–1923、FJ1925–1927、FJ1929–1930、FJ1940–1949、FJ1951–1960、FJ1962–1966、FJ1968、FJ1978、FJ1980、FJ1982–1984、FJ1989–1990、FJ1992、FJ1997–2010、FJ2012、FJ2014–2024、FJ2026–2033、FJ2035–2037、FJ2039–2040、FJ2047–2048、FJ2050–2051、FJ2070–2071、FJ2075、FJ2088、FJ2091、FJ2098、FJ2101、FJ2104–2106、FJ2109–2112、FJ2114、FJ2116、FJ2123、FJ2126、FJ2134、FJ2139–2140、FJ2142、FJ2146–2149、FJ2154–2157、FJ2161、FJ2168、FJ2177、FJ2180、FJ2195、FJ2375–2385、FJ2387–2393、FJ2395–2403、FJ2406–2408、FJ2410–2413、FJ2559–2560、FJ2666、FJ2669、FJ2726、FJ2825–2880、FJ3087、FJ3238、FJ3363、FJ3402–3405、FJ3407–3408、FJ3412、FJ3422–3425、FJ3435–3436、FJ3445、FJ3453–3457、FJ3487–3492、FJ3498、FJ3503–3509、FJ3521、FJ3528、FJ3535–3540、FJ3547–3552、FJ3554–3556、FJ3588、FJ3598–3602、FJ3613、FJ3627–3630、FJ3633–3634、FJ3642–3643

## 背部/上肢/胸腔/下肢（跑考摘要）　`115-1_第一次跑考摘要`

已有 442　·　UI 搵唔到 0　·　模型冇 37　·　骨標誌 10　·　雜訊 79

**三、模型冇**

- profunda branchial a（前穿到肱骨後側）
- deltopectoral triangle
- Profunda brachial artery
- Radial artery Ulnar artery
- superficial palmaer br
- forearm ii. Median n
- ii. Med. cutaneous n
- iii. Med. cutaneous n
- ii. Ulnar n
- i. Upper subscapular n
- ii. Middle subscapular n
- iii. Lower subscapular n
- ii. Radial n
- iii. Superficial br
- iv. Deep br
- scalis muscle
- upper subscapular nerve
- middle subscapular nerve
- lower subscapular nerve
- teres major Terminal branch
- peripheral nerve
- Subscapular m
- Dorsal interosseous m
- Palmar interosseous m
- external oblique abdominis m
- Descending aorta B. Pulmonary a
- Azygos arch
- thoracic splanchnic n
- SA nodal a
- Opening of coronary sinus
- auricle B. Interatrial septum
- chordae tendineae
- semitendinosus m. Gracilis m
- quadriceps femoris m
- iliopsoas m
- plantar interossei m
- superficial palmaer br. of radial a（橈動脈淺掌分支）

## 上肢 I　`20250228_解剖_上肢__W2`

已有 50　·　UI 搵唔到 0　·　模型冇 8　·　骨標誌 13　·　雜訊 25

**三、模型冇**

- Pyramidal space（錐形空間）
- intermuscular septum（肌間隔）
- Lateral intermuscular septum
- Medial intermuscular septum
- fascia of forearm muscles
- Bicipital aponeurosis
- phalanges（塊指骨）
- subscapularis, teres major, latissimus dorsi（三塊肌肉）

## 神經系統　`20250321_解剖_神經系統__W5_2`

已有 39　·　UI 搵唔到 0　·　模型冇 71　·　骨標誌 12　·　雜訊 26

**三、模型冇**

- epidural space
- subdural space
- subarachnoid space
- mater Cranial nerve
- myelinated nerve
- Temporal lobe（最後到達顳葉）
- superior orbital Ophthalmic nerve
- trigeminal motor nucleus
- Tympanic membrane
- lacrimal and salivary glands
- Pterygopalatine ganglion
- superior salivary nucleus
- submandibular ganglion
- Cochlear nerve Spiral ganglion
- Inferior salivary nucleus
- Ambiguus nucleus
- parotid salivery gland（腮腺）
- Dorsal motor nucleus
- amibguus nucleus
- Formed from a cranial root
- Hypoglossal nucleus
- Meningeal branches
- Communicating branches
- Preganglionic neuron Automatic ganglion
- Postganglionic neuron Automatic ganglion
- prevertebral ganglion
- pelvic splanchnic nerve（骨盆內臟神經）
- Terminal ganglia Ciliary ganglion
- CN IX Otic ganglion
- Ventriculus tertius
- brain（大腦）
- afferent（傳入）
- efferent（輸出）
- neurons（神經元）
- neuroglia（神經膠細胞）
- dendrite（樹突）
- axon（軸突）
- myelin sheath（髓鞘）
- node of ranvier（朗氏節）
- myelinated fiber（髓鞘神經纖維）
- unmyelinated fiber（無髓鞘神經纖維）
- axon hillock（軸丘）
- diencephalon（間腦）
- brainstem（腦幹）
- gray matter（灰質區）
- spinal meninges（外有三層結構的脊髓膜）
- enlargements（兩處膨大）
- myelinated nerve fiber（主要由有髓神經纖維）
- olfactory epithelium（嗅上皮）
- cribriform plate（篩板）
- olfactorytract（延伸成兩條直行嗅徑）
- primary olfactory cortex（嗅皮質區）
- ganglion cell（視網膜上的神經節細胞）
- ganglion cell layer（第八層神經節細胞層）
- optic canals（過蝶骨小翼的視神經管）
- optic radiation fibers（纖維）
- visual cortex（射到枕葉的視覺皮質區）
- ventral midbrain（中腦腹側面）
- parasympathetic（透過副交感）
- dorsal midbrain（中腦的背側面）
- orbits（眼眶）
- ateral aspect of the face（顏面部外側面）
- taste buds（味蕾）
- inner ear（內耳）
- larynx（控制喉）
- soft palate（軟顎）
- coccygeal（尾椎）
- dermatomes（皮節）
- lateral horn（自主神經節）
- arachnoid mater（蛛網膜）
- dermatome（生皮筋節）

## 生殖系統＋喉　`20250411_解剖_生殖系統_曾__喉部_陳___W8`

已有 37　·　UI 搵唔到 0　·　模型冇 61　·　骨標誌 6　·　雜訊 17

**三、模型冇**

- Bulbo-utheral gland
- Dartos m
- external spermatic fascia
- cremaster m
- internal spermatic fascia
- Spermatic Cord
- transversalis fascia
- pampiniform venous plexus（內有蔓狀靜脈叢）
- Vaginal cavity
- Ejaculatory Duct
- bulbo-urethral glands
- spiral artery
- Modified sweat gland（皮膚系統的特化汗腺）
- Tubuloalveolar exocrine gland（泡狀的複合式外分泌腺）
- vocal cord
- aryepiglottic ligament
- vestibular ligament
- laryngeal ventricle
- lateral cricothyroid ligament
- piriform recess
- infraglottic cavity
- Seminiferous tubules（曲細精管）
- Colliculus seminalis
- Stratum functionalis
- Stratum basalis
- primary sex organs（主要生殖器官）
- accessory sex organs（附屬生殖器官）
- asis（精索從腹股溝前上棘）
- deep inguinal ring（向下依序經過深鼠蹊環）
- superficial inguinal ring（淺鼠蹊環）
- ductus deferens（輸精管）
- primordial follicle（內有許多原始濾泡）
- mesometrium（子宮繫膜）
- mesovarian（卵巢繫膜）
- fimbirae（前方伸出輸卵管繖）
- isthmus of uterus（子宮峽）
- internal os（內口）
- external os（外口）
- perimetrium（子宮外膜）
- myometrium（子宮基層）
- endometrium（子宮內膜）
- uterine cycle（子宮週期）
- preovulatory phase（因此又稱為排卵前期）
- estrogen（分泌雌激素）
- postovulatory phase（因此又稱為排卵後期）
- progesterone（黃體分泌黃體固酮）
- prostaglandin（前列腺素）
- vaginal fornix（陰道穹窿）
- anterior fornix（靠近膀胱的前穹窿）
- kegel exercise（凱格爾運動）
- mucosa（黏膜層）
- muscularis（平滑肌層）
- adventitia（外膜層）
- hymen（陰道冠）
- apocrine（汗腺也是頂漿）
- prolactin（會分泌催乳素）
- oxytocin（產素）
- loose ct（皮下脂肪）
- efferent ductule（輸出小管）
- ampulla of ductus deferens（輸精管壺腹）
- tubuloalveolar glands（管泡狀腺體）

## 背部 II／脊髓　`20250513_解剖_背部II_魏___W13`

已有 23　·　UI 搵唔到 0　·　模型冇 14　·　骨標誌 3　·　雜訊 27

**三、模型冇**

- Lumbar Cistern（充滿脊髓液的腰池）
- Superficial Back Muscles（外在肌群）
- Respiratory Muscles（呼吸肌）
- Intrinsic Back Muscles（內在肌群）
- Erector spinae m
- enlargement（膨大部位）
- cervical enlargement（頸膨大）
- lumbar enlargement（腰膨大）
- medullary cone（脊髓圓錐）
- cauda equina（馬尾）
- muscles of the back（背部肌肉群）
- superficial/extrinsic（外在肌群）
- deep/intrinsic（內在肌群）
- intermediate layer（中層肌群）

## 上肢 II　`20250523_解剖_上肢II_張___W14`

已有 95　·　UI 搵唔到 0　·　模型冇 12　·　骨標誌 1　·　雜訊 19

**三、模型冇**

- middle trunk lateral pectoral n
- upper subscapular n
- middle subscapular n
- lower subscapular n
- inferior interosseous a
- bicipital aponeurosis
- dorsal interosseous m
- Carpal arch
- s. hypothenar muscles
- Intrinsic muscle
- medial epicondylitis（學名就是肱骨內上髁炎）
- lateral epicondylitis（學名就是肱骨外上髁炎）

## 腹部 III　`20250606_解剖_腹部III_謝___W16`

已有 126　·　UI 搵唔到 0　·　模型冇 127　·　骨標誌 6　·　雜訊 33

**一、已有（部分配對：模型件較概括／較細，請覆核）**

- Short gastric a → Left gastric artery［specific］
- Posterior gastric a → Left gastric artery［specific］
- left crus of diaphragm → Diaphragm［specific］
- anterior/posterior superior pancreaticoduodenal a → Anterior superior pancreaticoduodenal artery［specific］
- anterior/posterior inferior pancreaticoduodenal a → Anterior inferior pancreaticoduodenal artery［specific］

**三、模型冇**

- Lumber plexus（股骨小轉子）
- Median arcuate ligament（正中韌帶）
- Medial arcuate ligament（一起從內側弓狀韌帶）
- Lateral arcuate ligament（外側韌帶）
- Esophageal branches
- Pericardiacophrenic artery（心包膜膈動脈）
- suprarenal gland（腎上腺）
- Pressure of anterior abdominal cavity（腹腔壓力）
- Renal fascia（腎筋膜）
- Extraperitoneal fascia
- Transversalis fascia（連結腹橫筋膜）
- gonadal artery（生殖腺的分支）
- Ovarian arteries（卵巢動脈）
- pyramidal right gland（金字塔形右腺）
- crescent-shaped left gland（新月形左腺）
- Superior suprarenal artery（上腎上腺）
- Somatic Arteries
- Median sacral a（正中薦動脈）
- iliolumbar artery
- Visceral Arteries for GI Tract（供應消化道的動脈）
- Left gastro-omental a（左胃網膜動脈）
- Greater pancreatic a（大胰動脈）
- Cystic a（囊動脈）
- Right gastro-omental artery（右胃網膜動脈）
- Supraduodenal a（上十二指腸動脈）
- supraduodenal artery（上十二指腸動脈）
- Intestinal a（小腸動脈）
- Jejunal a（空腸動脈）
- Right gastro-omental a（右胃網膜動脈）
- Deep circumflex iliac artery（深旋髂動脈）
- Right gonadal vein（右生殖腺靜脈）
- Cystic vein（膽囊靜脈）
- Paraumbilical vein（旁靜脈）
- Bile duct（膽汁則會由膽管）
- Middle rectal veins
- Inferior rectal veins（下直腸靜脈）
- Right jugular trunk（頭部和頸部的右側）
- Left jugular trunk（頭部和頸部的左側）
- Right subclavian trunk（右鎖骨下幹）
- Left subclavian trunk（左鎖骨下幹）
- Pre-aortic lymph node（主動脈前淋巴結）
- Intestinal trunk（腸幹）
- Superior mesenteric node（上腸繫膜淋巴結）
- Inferior mesenteric node（下腸繫膜淋巴結）
- Para-aortic lymph node（主動脈旁淋巴結）
- left lateral aortic node
- Parasympathetic nerve（消化相關的副交感神經）
- Vague nerve（迷走神經）
- Pelvic splanchnic nerve（腸胃道）
- Inferior mesenteric ganglion
- preaortic plexus
- greater and lesser splanchnic nerve（小內臟神經）
- Superior mesenteric plexus（上腸繫膜叢）
- Intermesenteric plexus（中腸繫膜叢）
- Inferior mesenteric plexus（下腸繫膜叢）
- Superior hypogastric plexus
- Inferior hypogastric plexus（下腹下神經叢）
- Submucosal plexus
- Myenteric plexus
- Subcostal nerve（找肋骨下緣的肋下神經）
- Accessory obturator nerve（副閉孔神經）
- Lumbosacral trunk（腰薦神經幹）
- spermatic cord（精索）
- cremaster muscle（支配提睪肌）
- sympathetic ganglion chain or sympathetic chunk（交感神經鏈）
- crura of the diaphragm（橫膈腳）
- apertures of the diaphragm（橫膈裂孔）
- esophageal branches of the left gastric vessels（左胃動脈食道支）
- variable（變異度高）
- retroperitoneal organ（腹膜後器官）
- perirenal fat（腎圍脂肪層）
- cortex（皮質）
- renal pyramid（腎錐體）
- nephron（腎元）
- minor calyx（腎小盞）
- renal column（腎柱）
- renal calyces（腎盞）
- major calyx（腎大盞）
- renal pelvis（腎盂）
- muscular tube（肌肉形成的管腔）
- constriction sites（易發生結石的地方）
- uteropelvic junction（腎盂輸尿管連接部）
- pelvic brim（骨盆緣）
- entrance to bladder（膀胱開口）
- anterolateral to the right crus of diaphragm（外側）
- mesoderm（源自中胚層）
- corticosteroids（分泌腎上腺皮質素）
- androgens（睪固酮）
- epinephrine（分泌腎上腺素）
- norepinephrine（正腎上腺素）
- branches of abdominal aorta（腹主動脈的分支）
- foregut（胰臟）
- hindgut（下直腸動脈均源自其他）
- lesser omentum（小網膜）
- superior mesenteric a., sma（上腸繫膜動脈）
- hepatic sinusoid（肝竇隙）
- portal-systemic anastomoses（門靜脈與體循環的吻合）
- portal system（腔靜脈系統）
- esophageal varice（食道靜脈曲張）
- anus（肛門）
- portal hypertension（門靜脈高壓）
- ascites（腹水）
- lymphatic system（淋巴系統）
- right and left lateral aortic node（左右側主動脈淋巴結）
- preganglionic（節前）
- presynaptic（突觸前）
- postganglionic（節後）
- postsynaptic（突觸後）
- prevertebral（椎前）
- preaortic（主動脈前）
- paravertebral（椎旁）
- sympathetic ganglion chain（交感神經鏈）
- enteric nervous system（故腸神經系統）
- preganglionic neuron（前神經元）
- postganglionic neuron（可視為節後神經元）
- abdominal prevertebral/preaortic plexus（腹腔的椎前神經叢）
- visceral sensory fibers（臟器感覺神經）
- superior hypogastric plexus, shp（上腹下神經叢）
- submucosal layer（黏膜下層）
- internal oblique abdominis（腹內斜肌）
- scrotum（前側陰囊）
- labium major（大陰脣）
- asis（前上髂棘）
- musculotendinous bands（肌肉與肌腱組成）
- left colic flexure（左大腸彎）
- ureteral stone（輸尿管結石）
- urethral stone（尿道結石）

## 下肢 I（骨、臀部）　`Anatomy_Lower_Limb_Lin_CH_Part_I_bones_and_gluteal_region_bb15ebc7f24f0b132626748650ed9648_2`

已有 44　·　UI 搵唔到 0　·　模型冇 49　·　骨標誌 40　·　雜訊 42

**一、已有（部分配對：模型件較概括／較細，請覆核）**

- superior and inferior gluteal a → Right superior gluteal artery［specific］
- deep to sciatic n → Sciatic nerve［specific］

**三、模型冇**

- lateral malleoli Foot region Bones
- free lower limb Hip Bone
- pubis Parts of hip bones
- Iliacus m. Sacroiliac joint
- SI joint
- mm pubis Pubis Inguinal ligament
- pubs ischium Gluteal ligaments
- covered with articular cartilage
- crescentic plates of cartilage
- form the knee joint
- Largest sesamoid bone
- Formed in the tendon
- quadriceps femoris m
- Largest and strongest bone
- Longitudinal arch
- foot. Cuboid Cuneiform bones
- lateral malleoli Foot region Muscles
- stabilize the hip joint
- sacrum and coccyx sacrotuberous lig
- main trunk and deep br
- superior gluteal a. ascending br
- latae Deep layer of muscles
- sacrum sacrotuberous ligament
- surrounding bones
- internal pudendal a. obturator a
- Quadratus femoris Gluteus maximus m
- Gluteus medius m. Piriformis m
- largest br
- skin deep br
- Anastomoses with inferior gluteal a
- Anastomoses with superior gluteal a
- external genitalia and muscles
- perineum region Nerves
- Gluteal Region Sacral plexuses Nerves
- Several nerves
- superior clunial nerve
- middle clunial nerve
- inferior clunial nerve
- Pudendal nerve Gluteal ligaments
- piriformis innervates gluteus maximus m
- tibial and common fibular nerves
- largest nerve
- blood from inferior gluteal a
- artery to the sciatic nerve
- innervates hip joint
- piriformis descends to sacrospinous ligament
- innervates superior gemellus m
- Ischium ilium
- anatomy lower limb cheng-han lin（林成翰）

## 腹部 I　`Med_Abdomen_I_20250519_14ba0910260399815d92ca495866ae39`

已有 47　·　UI 搵唔到 0　·　模型冇 53　·　骨標誌 21　·　雜訊 57

**一、已有（部分配對：模型件較概括／較細，請覆核）**

- Upper musculophrenic a → Right musculophrenic artery［specific］
- Upper Sup. epigastric a → Right superior epigastric artery［specific］
- Lower inf. epigastric a → Left inferior epigastric artery［specific］
- Medial to inf. Epigastric a → Left inferior epigastric artery［specific］

**三、模型冇**

- Inf. thoracic aperture
- lumborum psoas major iliacus muscles
- IV disc
- superior mesenteric and splenic veins
- Scarpa's fascia
- fuses with the deep fascia
- Camper's fascia
- deeper layer of superficial fascia
- fascial layer containing smooth muscle
- subcostal n
- deep circumflex iliac a
- drains into the subclavian v
- Lower superficial circumflex iliac a
- intercostal a. Subcostal a
- Superficial circumflex iliac v
- Paraumbilical v
- Deep circumflex iliac v
- Superficial inguinal nodes
- Parasternal nodes
- along the int. thoracic a
- transversalis fascia
- median umbilical lig
- Umbilical lig
- distal of umbilical a
- Falciform lig
- Lig. remnants of umbilical v
- paired medial umbilical ligaments
- Median umbilical ligament
- liver Inguinal ligament
- extend from the lacunar ligament
- Lacunar ligament
- External oblique aponeurosis Inguinal ligament
- Iliopectineal ligament
- spermatic cord
- ring Femoral ring Lacunar ligament
- conjoint tendon
- falx Fusion of the aponeurosis
- Int. spermatic fascia
- Cremasteric muscle
- Ext. spermatic fascia
- Int. oblique abdominis m
- Cremasteric m. and fascia
- Int. spermatic fascia Smooth m
- Inf. vesical a
- Pampiniform venous plexus（蔓狀靜脈叢）
- Cremasteric a
- Cremaster m
- developing peritoneal cavity
- acquired Protrudes through inguinal triangle
- v. Inguinal triangle
- Hesselbach's triangle
- Ductus deferens
- abdomen pei-ling hsieh（謝佩伶）

## 心臟／大血管　`heart-115醫中上課_bc42d7386f0985d8632eb5dd2feacf1f`

已有 61　·　UI 搵唔到 0　·　模型冇 48　·　骨標誌 8　·　雜訊 26

**一、已有（部分配對：模型件較概括／較細，請覆核）**

- lt. superior intercostal v → Left superior intercostal vein［specific］
- rt. superior intercostal v → Left superior intercostal vein［specific］
- rt. posterior intercostal v → Right posterior intercostal veins［specific］
- rt. subcostal v → Left subcostal vein［specific］
- lt. Posterior intercostal v → Right posterior intercostal veins［specific］
- lt. subcostal v → Left subcostal vein［specific］

**三、模型冇**

- Heart Valves
- plane. Superior vena cava Arch
- heart in the thoracic cavity
- Inferior left costal cartilage
- rib and sternum costal cartilage
- sternum costal cartilage
- intercostal space
- sternopericardial lig
- pericardiacophrenic lig
- Parietal pericardium Pericardial cavity
- pericardial fluid Pericardial sinus
- heart Oblique pericardial sinus
- blind-sac recess
- Pericardiacophrenic artery
- Brachiocephalic vein Pericardiacophrenic vein
- Parallel the pericardiacophrenic a
- internal features Right atrium
- Auricle Crista terminalis
- crescent valve
- Opening of the coronary sinus
- Rt. atrioventricular orifice Tricuspid valves
- septal cusps
- Cardiac muscles Trabeculae carneae
- usually contains the right branch
- Posterior and septal papillary muscles
- Chordae tendineae
- Orifice of pulmonary trunk
- Pulmonary semilunar valves Left atrium
- Principal cavity
- Orifice of pulmonary veins
- Left atrioventricular orifice
- Aortic semilunar valves
- dilatations opposite to the cusps
- subendocardial plexus
- superficial and deep cardiac plexus
- Parasympathetic n
- force of contraction Heart Valves
- Ascending aorta Branches
- Aortic arch Brachiocephalic trunk Branches
- common carotid Left subclavian artery
- Posterior intercostal arteries-intercostal space
- diaphragm Aortic arch
- Brachiocephalic trunk
- Superior intercostol a. Subclavian a
- Joins the azygos vein
- parallel courses with pulmonary a
- Posterior mediastinum
- Ligamentum arteriosumductus

## 胸部 I（胸壁、乳房）　`解剖_0908-3`

已有 53　·　UI 搵唔到 0　·　模型冇 57　·　骨標誌 26　·　雜訊 28

**一、已有（部分配對：模型件較概括／較細，請覆核）**

- superior costotransverse ligament → Costotransverse ligament［specific］
- lateral costotransverse ligament → Costotransverse ligament［specific］
- external and internal intercostal muscles → external intercostal muscle［specific］
- lower anterior border of the right lung → Anterior border of right lung［specific］

**三、模型冇**

- Superior thoracic aperture（上胸開口）
- Inferior thoracic aperture（下胸開口）
- sebaceous glands（含有數條皮脂腺）
- retromammary space（乳房後間隙）
- pectoralis fascia
- axillary lymph node（腋淋巴結）
- subclavian lymphatic trunk（帶回鎖骨下淋巴幹）
- parasternal lymph node（胸骨旁淋巴結）
- broncomediastinal trunk（膈淋巴幹）
- right lymphatic duct（分別再帶回右淋巴總管）
- synovial joint
- Intercostal space（肋間）
- Transverse ridge（橫脊）
- Costal joints and ligaments（肋骨相關的關節和韌帶）
- costovertebral joints
- synovial joints（屬於滑液關節）
- costotransverse joints
- costochondral joints
- interchondral joints
- Sternal joints（胸骨關節）
- Manubriosternal joints
- Xiphisternal joints
- sternocostal joints
- radiate sternocostal ligaments
- sternum via cartilage
- Cisterna chyli B. Thoracic duct
- Left lymphatic duct
- They have costotransverse joints
- intercostal spaces. B. Intercostal nerves
- go through the space
- refers to the space
- ribs D. Branches
- position corresponds to the space
- Transversus thoracic muscle
- anastomoses with anterior intercostal veins
- they accompany the intercostal arteries
- intercostal vessels and nerve
- first rib joint
- the upper eight cartilages
- sternum C. the costal cartilages
- bars of hyaline cartilage
- respiratory diaphragm（向下藉由呼吸性橫膈）
- mammary gland lobules（支撐乳腺小葉）
- axillary tail（腋尾）
- osterocartilaginous thoracic cage（硬軟骨胸廓）
- true ribs（真肋）
- false ribs（假肋）
- floating ribs（浮肋）
- costal margins（肋緣）
- typical ribs（典型肋骨）
- smooth articular part（節又再分為平滑關節面）
- rough non-articular part（不平滑非關節面）
- atypical ribs（非典型肋）
- sternebrae（胸小骨）
- marker（重要標記點）
- manubrium and sternum（連接到胸骨柄和胸骨體）
- neurovascular bundles（神經血管束）

## 頭部 I（顏面、腮腺、頭皮）　`解剖_0929`

已有 75　·　UI 搵唔到 0　·　模型冇 75　·　骨標誌 13　·　雜訊 35

**一、已有（部分配對：模型件較概括／較細，請覆核）**

- belly of the digastric muscle → Left digastric［specific］

**三、模型冇**

- Facial expression muscle
- Mimetic muscle
- Parotid gland（腮腺）
- Upper group of oral muscles
- Lower group of oral muscles
- Auricular muscles（耳肌）
- Marginal mandibular branch（邊緣下頷支）
- Inferior labial a（下唇動脈）
- Superior labial a（上唇動脈）
- Lateral nasal a（鼻外側動脈）
- Superficial temporal a（淺顳動脈）
- mandibular bone（下頷骨）
- parotid duct（耳下腺管）
- External jugular v（外頸靜脈）
- supraorbital v（眶上靜脈）
- supratrochlear v（滑車上靜脈）
- Lateral nasal v（走一路收集鼻外側靜脈）
- Superior labial v（上唇靜脈）
- Inferior labial v（下唇靜脈）
- Retromandibular vein（下頷後靜脈）
- Superior ophthalmic vein（上眼靜脈）
- Superficial temporal vein（淺顳靜脈）
- Posterior auricular vein（耳後靜脈）
- External jugular vein（外頸靜脈）
- Danger Triangle
- Superficial temporal artery（淺顳動脈）
- Auriculotemporal nerve（耳顳神經）
- Otic ganglion
- Posterior auricular artery（耳後動脈）
- Supraorbital artery（分支包括眶上動脈）
- Supratrochlear artery（滑車上動脈）
- likely to be damaged A
- division of the trigeminal nerve
- main trunk
- parotid space
- statement about the facial vein
- lies behind the facial artery
- through superior ophthalmic vein
- Meninges B. Masseter muscle
- combinations of cranial nerves
- whose branches
- corresponding parasympathetic ganglion
- parotid gland B. IX nerve
- pterygopalatine ganglion
- sublingual salivary gland
- lacrimal gland D. IX nerve
- submandibular ganglion
- palpate the facial artery
- buccal artery
- middle meningeal artery
- descending palatine artery
- inferior alveolar artery
- CN V C. Mandibular branch
- deepest in the parotid gland
- infraorbital and infratrochlear vein
- scalp（頭皮）
- subcutaneous layer（皮下層）
- calvarial group（顱頂群）
- orbital group（眼眶周圍）
- nasal group（鼻周圍）
- oral group（口周圍）
- occipitofrontalis（額枕肌）
- tip of nose（鼻尖）
- facial nerve, cn vii（顏面神經）
- external carotid artery, eca（外頸動脈）
- communication（交通）
- glabella（眉間）
- meningitis（菌帶入顱內造成腦膜炎）
- parotid sheath（耳下腺鞘）
- parotid bed（包含兩葉耳下腺床）
- second upper molar teeth（開口在上排第二顆臼齒）
- postganglionic fiber（全都是節後神經纖維）
- vasculature of the scalp（頭皮的血管系統）
- herpes zoster（帶狀皰疹）
- b. herpes zoster（帶狀皰疹）

## 頭部 II　`解剖_1013`

已有 74　·　UI 搵唔到 0　·　模型冇 128　·　骨標誌 45　·　雜訊 57

**一、已有（部分配對：模型件較概括／較細，請覆核）**

- anterior belly of digastric muscle → Left digastric［specific］

**三、模型冇**

- deep temporal artery
- auriculotemporal nerve（耳顳神經）
- temporalis fascia
- dense fascia（緻密的筋膜）
- II. III. IV. V
- deep temporal nerve（深顳神經）
- parotid gland（腮腺）
- Otic ganglion（耳神經節）
- Trigeminal ganglion（三叉神經節）
- Main Trunk Branches（主幹分支）
- Further Division of Main Trunk（主幹再分）
- chorda tympani nerve（鼓索神經）
- Middle meningeal artery（中腦膜動脈）
- Tympanic plexus（鼓室神經叢）
- Lesser petrosal nerve（小岩神經）
- superficial temporal a（另一分支為淺顳動脈）
- deep auricular a
- anterior tympanic a
- middle meningeal a
- accessory meningeal a
- inferior alveolar a
- masseteric a
- deep temporal a
- buccal a
- Inferior ophthalmic v（下眼靜脈）
- emissary v（導靜脈）
- retromandibular v（匯流至下頷後靜脈）
- Nasal cavity（鼻腔）
- roof of oral cavity（口腔頂部）
- Pterygopalatine ganglion（翼顎神經節）
- Zygomaticotemporal nerve（顴顳神經）
- Zygomaticofacial nerve（顴面神經）
- Posterior superior alveolar nerve（後上齒槽神經）
- Infraorbital nerve（眶下神經）
- Middle superior alveolar nerve（中上齒槽神經）
- Anterior superior alveolar nerve（前上齒槽神經）
- Orbital branches
- sphenoid sinus（蝶竇）
- ethmoidal sinus（篩竇）
- nasopalatine n（鼻顎神經）
- Lesser palatine n
- Parasympathetic ganglion（屬於副交感神經節）
- Paranasal sinuses（鼻竇）
- Superior cervical sympathetic ganglion
- Deep petrosal nerve（深岩神經）
- Greater petrosal nerve
- Nerve of pterygoid canal
- Vidian nerve
- Within the ganglion（神經節內）
- Greater petrosal n
- sup. cervical sympathetic ganglion
- Deep petrosal n
- otic ganglion Lesser petrosal n
- Sphenopalatine artery（上頷動脈的終）
- Nasopalatine artery（鼻顎動脈）
- Anterior superior alveolar artery（前上齒槽動脈）
- Middle superior alveolar artery（中上齒槽動脈）
- Posterior superior alveolar artery（後上齒槽動脈）
- superior alveolar artery
- Descending palatine artery
- Greater palatine artery（大顎動脈）
- palatine artery
- Lesser palatine artery（小顎動脈）
- Branches of the maxillary artery
- sphenopalatine arteries
- synovial joint（屬於滑關節）
- superficial temporal artery（淺顳動脈）
- auriculotemporal n（主要以耳顳神經）
- infrahyoid m
- deepest in the parotid gland
- Retromandibular vein
- statement about the facial vein
- infraorbital and infratrochlear vein
- through superior ophthalmic vein
- external jugular vein
- fibers innvervating the Parotid Gland
- Lesser Petrosal N
- N B. Lesser Petrosal N
- Greater Temporal N
- Damage of the lingual nerve
- Secretion of the submandibular gland
- continue with the nasal cavity
- the infraorbital artery
- mandible. D. The masseter muscles
- Middle superior alveolar n
- fibers innervating the sublingual gland
- great petrosal n
- chorda tympani n
- buccal artery
- inferior alveolar artery
- mandible. B. The synovial joint
- belongs to the hinge joint
- The deep auricular artery
- parotid space
- Marginal mandibular branch
- lies behind the facial artery
- Meninges B. Masseter muscle
- combinations of cranial nerves
- whose branches
- corresponding parasympathetic ganglion
- parotid gland B. IX nerve
- sublingual salivary gland
- Vil nerve
- lacrimal gland D. IX nerve
- submandibular ganglion
- secretion from the submandibular gland
- tympani C. Superior cervical ganglion
- superficial temporal vessels（淺顳靜脈）
- deep temporal artery/vein（靜脈）
- elevate（上提）
- exit from cranium（顱外路徑）
- facial nerve, cn vii（顏面神經）
- floor of orbit（眼眶底部）
- main divisions of cn v（三叉神經三分支）
- combination（匯合）
- connection（向上連結）
- general sensory（一般感覺）
- postganglionic sympathetic（交感節後神經）
- postganglionic parasympathetic（副交感節後神經）
- sup. cervical sympathetic ganglion, deep petrosal n. scg（來自上頸交感神經節）
- gliding（主要為滑動）
- protrusion（可執行下顎骨前突）
- retrusion（後縮）
- fan-shaped（扇形）
- nasopharynx（鼻咽）
- nasal mucosa（鼻腔黏膜）
- pharynx（咽部）
- pterygopalatine part of the maxillary artery（幾乎與同名神經伴行）

## 頸部 II　`解剖_1020`

已有 83　·　UI 搵唔到 0　·　模型冇 74　·　骨標誌 18　·　雜訊 45

**一、已有（部分配對：模型件較概括／較細，請覆核）**

- Superior Belly of Omohyoid m → Left omohyoid［specific］
- Inferior Belly of Omohyoid m → Left omohyoid［specific］
- Posterior Belly of Digastric m → Left digastric［specific］
- posterior belly of digastric → Left digastric［specific］
- superior belly of omohyoid → Left omohyoid［specific］
- digastric, anterior belly → Left digastric［specific］
- omohyoid, superior belly → Left omohyoid［specific］

**三、模型冇**

- Occipital triangle（枕三角）
- Supraclavicular triangle（鎖骨上三角）
- Carotid Triangle（頸動脈三角）
- Submental triangle（頦下三角）
- Submandibular triangle（下頷下三角）
- Investing Fascia（頸部深筋膜的包覆層）
- Prevertebral Fascia（頸部深筋膜的椎前層）
- Pretracheal Fascia（頸部深筋膜的氣管前層）
- greater Occipital triangle cervical a
- Posterior Triangle Supraclavian triangle
- Ext. Jugular v
- Cervical Carotid triangle Plexus
- External jugular v（外頸靜脈）
- Supraclavicular n（鎖骨上神經）
- Middle Scalene m（中斜角肌）
- carotid sinus（頸動脈竇）
- Carotid Sinus nerve（壓訊息由頸動脈竇神經）
- Superior thyroid a（上甲狀腺動脈）
- Superior laryngeal a（上喉動脈）
- Spinal accessory n（副神經）
- Ansa cervicalis Superior root
- Internal laryngeal n（內喉神經）
- Anterior jugular v（前頸靜脈）
- Commom facial v（匯入總顏面靜脈）
- marginal mandibular branch（下頷緣支）
- supraclavicular space
- superior thoracic aperture
- brachiocephalic trunk
- muller muscle
- Stella ganglion
- External jugular vein
- Right lymphatic duct（右側匯入右淋巴總管）
- lymphatic duct（右淋巴總管）
- superior thyroid v（下甲狀腺靜脈）
- middle thyroid v
- inferior thyroid v（下甲狀腺靜脈）
- point B. Suprascapular a
- thyroid gland（甲狀腺）
- ima thyroid a
- Superficial cervical lymph nodes
- deep cervical lymph nodes
- inthe patient after thyroid gland
- inferior laryngeal nerve
- cervicalis D. transverse cervical nerve
- middle thyroid a
- ansa cervicalis D. sympathetic trunk
- Supraclavicular nerve
- Ant. jugular vein
- Stellate ganglion（星狀神經節）
- cervicothoracic ganglion
- Inferior Sympathetic ganglion
- Decendens hypoglossi
- carotid sheath（頸動脈鞘）
- sternocleidomastoid m. , scm（胸鎖乳突肌）
- ansa cervicalis（頸襻）
- greater auricular（耳大神經）
- decendens hypoglossi/ansa cervicalis superior root（頸襻上根）
- facial n., cn vii（顏面神經）
- hypoglossal n., cn xii（舌下神經）
- glossopharyngeal n., cn ix（舌咽神經）
- accessory n., cn xi（副神經）
- sympathetic nervous system damaged（交感神經的損傷）
- dysautonomia（自律神經失調）
- external jugular vein, ejv（順著外頸靜脈）
- jugular lymphatic trunks（方向匯流至頸部淋巴幹）
- internal jugular vein, ijv（順著內頸靜脈）
- endocrine layer（內分泌層）
- respiratory layer（呼吸層）
- alimentary layer（消化層）
- parathyroid（副甲狀腺）
- thyrocervical trunk, tct（甲狀頸動脈幹）
- posterior border of the sternocleidomastoid muscle（胸鎖乳突肌後緣）
- anterior border of the trapezius muscle（斜方肌前緣）
- pupil（會導致瞳孔）

## 骨盆會陰 I　`解剖_1110`

已有 85　·　UI 搵唔到 0　·　模型冇 123　·　骨標誌 18　·　雜訊 33

**一、已有（部分配對：模型件較概括／較細，請覆核）**

- inferior to the pudendal nerve → Pudendal nerve［specific］
- proximal urethra → Urethra［specific］

**三、模型冇**

- Viscera of Pelvic cavity（骨盆內臟器）
- Pubic arch（恥骨下角）
- Sacro-iliac joint（薦髂關節）
- Synovial joint
- Puboanalis m
- Anococcygeal lig（附著於肛尾韌帶）
- Anal aperture（肛門口）
- Puboperinealis m（恥骨會陰肌）
- Puboprostaticus m（恥骨前列腺肌）
- Levator prostatae m
- Pubovaginalis m（恥骨陰道肌）
- Ejaculatory duct（射精管）
- Median umbilical lig（韌帶）
- Detrusor m（逼尿肌）
- Internal urethral orifice（下方頂點為內尿道開口）
- Pubovesical lig（恥骨膀胱韌帶）
- Puboprostatic lig（恥骨前列腺韌帶）
- External urethral orifice（尿道外口）
- Paraurethral glands
- Rectovesical pouch（直腸膀胱陷凹）
- broad and round ligaments
- Ovarian a（卵巢動脈）
- Median sacral a（正中薦動脈）
- Umbilical a（臍動脈）
- Inferior vesical a（下膀胱動脈）
- Vaginal a（陰道動脈）
- Middle rectal a（中直腸動脈）
- Iliolumbar a（髂腰動脈）
- Deep circumflex iliac a（深旋髂動脈）
- Medial umbilical lig（內側臍韌帶）
- Sup. vesical a（分出上膀胱動脈）
- Nutrient a
- accessory obturator a（發出的副閉孔動脈）
- prostatic a（前列腺動脈）
- Vaginal br（陰道分支）
- Badal a（基底動脈）
- Spiral a（螺旋動脈）
- Vaginal branch（陰道分支）
- Tubal branch（輸卵管支）
- Tubal br. of ovarian a（卵巢動脈的輸卵管支）
- Prostatic branch（前列腺支）
- inferior rectal a（下直腸動脈）
- perineal a（會陰動脈）
- Iliolumbar artery（髂腰動脈）
- Lumbosacral trunk（腰薦神經幹）
- Nutrient artery
- Ovarian artery（卵巢動脈）
- Tubal br（輸卵管支）
- brim. B. The pubic arch
- bladder B. Pubovesical ligament
- Douglas D. Rectovesical pouch
- Median sacral artery
- Inferior vesical artery
- Middle rectal artery
- Pubovesical ligament
- Median umbilical ligament
- Puboprostatic ligament
- flexura perinealis A
- examined through the rectum A
- Vaginal artery
- prostatic artery
- Umbilical artery
- Obturator internus C. Sacrotuberous ligament
- Openings of ejaculatory ducts
- opening of prostatic duct
- Levator prostatae
- Ductus deferens（輸精管）
- Colliculus seminalis（精阜）
- Superoposterior rectum
- pelvis（骨盆）
- pelvic brim/inlet（入口）
- pelvic outlet（骨盆出口）
- pelvic inlet（骨盆入口）
- pelvic diaphragm（骨盆橫膈）
- puborectalis/puboanalis m（恥骨直腸肌）
- iliococcygeal raphe（著於髂尾中縫）
- pubo-analis mi（恥骨肛門肌）
- urinary system（泌尿系統）
- reproductive system（生殖系統）
- digestive system（消化系統）
- sigmoid colon（部分乙狀結腸）
- internal urethral sphincter（約肌）
- serosa（漿膜層）
- mucosa（黏膜上皮）
- submucosa（組織所構成的黏膜下層）
- intraureteric fold（膀胱褶）
- intramural part（間質肌部）
- uvula of bladder（膀胱懸壅垂）
- prostatic urethra（前列腺尿道）
- prostatic utricle（小囊開口）
- spongy urethra（海綿體尿道）
- bulbar urethra（尿道球腺）
- spongy urethra in bulb of penis（尿道球部）
- membranous part（膜性部）
- curvatura infrapubica（恥骨下彎）
- curvatura prepubica（恥骨前彎）
- urinary catheterization（導尿）
- rigid cystoscopy（硬膀胱鏡）
- external urethral sphincter（尿道外括約肌）
- urethrovaginal sphincter（尿道陰道括約肌）
- compressor urethra（尿道壓迫肌）
- flexura sacralis（直腸薦曲）
- flexura perinealis（肛管直腸曲）
- rectal ampulla（直腸壺腹）
- transverse rectal folds（直腸橫褶）
- superior transverse rectal fold（上橫褶）
- middle transverse rectal fold（中橫褶）
- inferior transverse rectal fold（下橫褶）
- germinal epithelium（外面由一層生殖上皮）
- mesometrium（子宮繫膜）
- peritoneal reflections（腹膜反摺）
- ureteric fold（輸尿管褶）
- culdocentesis（後穹窿穿刺）
- intraperitoneal（腹膜間器官）
- retroperitoneal（腹膜後器官）
- subperitoneal（腹膜下器官）
- patent part（開放部）
- fundus of bladder（膀胱底）
- sup. part of vagina（上半部陰道）
- dorsal a. to the penis/clitoris（陰蒂背動脈）
- deep a. to the penis/clitoris（陰蒂深動脈）
- ilium（髂骨）
- cauda equina（供應馬尾）

## 頭部 IV　`解剖_1117`

已有 89　·　UI 搵唔到 0　·　模型冇 72　·　骨標誌 15　·　雜訊 20

**三、模型冇**

- Inferior division of oculomotor n
- Superior ophthalmic v
- Inferior ophthalmic v
- Superior tarsal m（瞼上肌）
- Excretory ducts of lacrimal gland（條淚腺外分泌管）
- Scleral venous sinus（鞏膜靜脈竇）
- potential space（素層之間有一潛在空間）
- optic disc（視盤）
- nerve of pterygoid canal（翼管神經）
- Anterior ciliary a（前睫動脈）
- Posterior ciliary a（後睫動脈）
- Short posterior ciliary a（短後睫動脈）
- Long posterior ciliary a（長後睫動脈）
- Ophthalmic vein（眼靜脈）
- Ceruminous gland（含有耵聹腺）
- Tympanic membrane（鼓膜）
- Posterior auricular a（後耳動脈）
- Superficial temporal a（淺顳動脈）
- Auriculotemporal n（耳顳神經）
- Superior tarsal muscle
- statements regarding the ophthalmic nerve
- Lacrimal sac and nasolacrimal duct
- Aqueous humor（分泌水樣狀液）
- Dilator pupillae（瞳孔擴張肌）
- orbit（眼睛由眼眶）
- pyramid-shaped（而眼眶為錐狀）
- superior/ inferior division of oculomotor n（通過總腱環）
- common tendinous ring/annular ring（共同形成總腱環）
- vertical axis（垂直軸）
- transverse axis（橫軸）
- a-p axis（前後軸）
- conjunctiva（結膜）
- palpebral conjunctiva（瞼結膜）
- bulbar conjunctiva（球結膜）
- lacrimal apparatus（淚器）
- almond-shaped（杏仁核狀）
- lacrimal fluid（分泌淚液）
- lacrimal punctum（淚點）
- hallow（中空）
- spherical（圓型）
- vitreous humor（部分充滿膠狀玻璃狀液）
- fibrous layer（內外至內分別為纖維層）
- vascular layer（血管層）
- inner/ nervous layer（網膜層）
- outer tunica bulges（構成眼睛外側膜狀突起）
- outer tunica（構成眼睛外側膜）
- collagenous fiber（鞏膜主要是由膠原纖維）
- elastic fiber（彈性纖維）
- white fiber（纖維又可以稱為白纖維）
- choroid coat（脈絡膜）
- honeycombed with blood vessel（佈滿血管）
- melanocyte（黑色素細胞）
- ora serrata（鋸齒緣）
- ciliary processes（睫狀突）
- zonular fibers（尖端有小帶纖維）
- biconvex（雙凸）
- thick disk（厚圓盤）
- lens epithelium（晶狀上皮）
- lens fibers（晶狀纖維）
- pigment cell（虹膜表面的色素細胞）
- pupil（瞳孔）
- sphincter pupillae（瞳孔括約肌）
- posterior chamber（後房）
- inner layer/ retina（視網膜層）
- proper part /neural layer（神經層）
- non-visual part（非視覺層）
- pigment layer（因此又叫色素層）
- blind spot（視網膜中的盲點）
- fovea centralis（中央小凹）
- macula lutea（黃斑部）
- cniii（動眼神經）
- central artery of retina（視網膜中央動脈）

## 頸部 III　`解剖_1124-2_頸III_`

已有 54　·　UI 搵唔到 0　·　模型冇 55　·　骨標誌 3　·　雜訊 27

**一、已有（部分配對：模型件較概括／較細，請覆核）**

- external and internal carotid artery → Right internal carotid artery［specific］

**三、模型冇**

- Branches of internal thoracic a（內胸動脈分支）
- Tonsillar a（扁桃體動脈）
- Ascending palatine a（升顎動脈）
- Levator veli palatine m
- Orifice
- Palatoglossal arch（顎舌弓）
- Palatopharyngeal arch（顎咽弓）
- Tonsillar br. Of facial a
- Glossalpharyngeal n
- Submandibular triangle
- palatine aponeurosis
- Pharyngobasilar fascia
- Sup. Cervical sympathetic ganglion（交感神經的上頸神經節）
- carotid sinus
- Otic ganglion（腮腺中的耳下腺）
- ext. laryngeal n
- Int. laryngeal n
- Carotid triangle A
- external jugular vein
- external laryngeal nerve
- inferior laryngeal nerve
- internal laryngeal nerve
- thoracic duct B. thyrocervical trunk
- intrinsic laryngeal muscles
- laryngeal muscles
- Superficial cervical lymph nodes
- deep cervical lymph nodes
- prevertebral fascia
- parathyroid gland
- cricopharyngeus m
- cervical sympathetic ganglia（交感神經）
- reccurent laryngeal（喉返神經）
- endotracheal intubation/ on endo（較適用氣管插管）
- nasopharynx（鼻咽）
- oropharynx（口咽）
- laryngopharynx（喉咽）
- tonsillar ring（小節環繞形成的扁桃體）
- glossopharyngeal n. / cn ix（舌咽神經）
- pharyngeal recesses（咽隱窩）
- salpingopharyngeal fold（耳咽管咽折）
- pharyngotympanic tube（耳咽管）
- palatine tonsil（顎扁桃體）
- orifice of pharyngotympanic tube / eustachian tube（耳咽管開口）
- tubal tonsils（咽鼓管扁桃腺）
- lingual follicles of lingual tonsil（舌根淋巴濾泡）
- cn ix, glossalpharyngeal n（神經主要由舌咽神經）
- roof of pharynx（頂後壁）
- opening of pharyngotympanic tube（管開口周圍）
- cn ix, glossopharyngeal n（舌咽神經）
- soft palate（軟顎）
- vagus nerve, cnx（條肌肉不是由迷走神經）
- elevates the pharynx and larynx（參與提升咽部和喉部）
- pharyngo-esophageal junction（狹窄）
- b. tubal tonsil（咽鼓管扁桃腺）
- c. palatine tonsil（腭扁桃腺）

## 骨盆會陰 II　`解剖_1201`

已有 69　·　UI 搵唔到 0　·　模型冇 175　·　骨標誌 26　·　雜訊 54

**三、模型冇**

- Ovarian a（卵巢動脈）
- Median sacral a（正中薦動脈）
- Ovarian artery（卵巢動脈）
- Tubal br（輸卵管支）
- Sup. Vesical a
- Inf. Vesical a（男性）
- Inferior Vesical a（下膀胱動脈）
- Middle Rectal a（中直腸動脈）
- Prostatic br（前列腺分支）
- Vaginal a
- Inferior Rectal a（下直腸動脈）
- Spermatic Cord（供應精索）
- External Spermatic a（外精索動脈）
- Cremasteric a
- Cremaster m
- Deferential a（輸精管動脈）
- Pubic Tributary vein（恥骨靜脈）
- Middle Rectal v（中直腸靜脈）
- Rectal Venous Plexus（藉直腸靜脈叢）
- Internal Rectal Plexus（內直腸靜脈叢）
- External Rectal Plexus（而外直腸靜脈叢）
- Inferior rectal v（下直腸靜脈）
- superior and inferior vesical veins（下膀胱靜脈）
- Vesical Plexus（藉膀胱上的膀胱靜脈叢）
- Vaginal vein（陰道靜脈）
- Uterine Venous Plexus（子宮中段的子宮靜脈叢）
- Vaginal Venous Plexus（段的陰道靜脈叢）
- Ovarian Venous Plexus（其中也包括卵巢靜脈叢）
- Sacral Venous Plexus（枝流聚集成的薦靜脈叢）
- Internal Vertebral Venous Plexus
- Inguinal nodes（鼠蹊淋巴結）
- Inferior mesenteric nodes（脈流向下腸繫膜淋巴結）
- Superficial inguinal nodes（淺鼠蹊淋巴結）
- para-aortic nodes
- Somatic nerves（非自主神經）
- Lumbosacral trunk（腰薦神經幹）
- Inferior rectal n（首先分出下直腸神經）
- Perineal n（會陰神經）
- Posterior scrotal n
- Posterior labial n
- Coccygeal plexus（尾神經叢）
- coccygeal n（尾神經）
- Anococcygeal n（肛尾神經）
- Autonomic nerves（自主神經）
- Sacral sympathetic trunk（薦交感神經幹）
- Coccygeal ganglion（又名尾神經節）
- Periarterial plexus（動脈周壁神經叢）
- Hypogastric plexus（腹下神經叢）
- Intermesenteric plexus（腹腔的腸繫膜間神經叢）
- Superior hypogastric plexus（上腹下神經叢）
- Hypogastric nerves（分成左右的腹下神經）
- Pelvic splanchnic n（骨盆內臟神經）
- Inferior hypogastric plexus（盆內形成下腹下神經叢）
- Inf. hypogastric plexus（腹下神經叢）
- Urogenital triangle（可分為泌尿生殖三角）
- Anal triangle（肛門三角）
- Ischiopubic rami（坐骨恥骨支）
- Perineal membrane（會陰膜）
- Deep perineal pouch（陷凹）
- superficial perineal pouch（會陰淺陷凹）
- Compressor urethrae muscle（生是尿道壓迫肌）
- Obturator fascia（閉孔筋膜）
- Deep transverse perineal muscle（會陰深橫肌）
- Bulbourethral glands（尿道球腺）
- Deep transverse perineal m（會陰深橫肌）
- External urethral sphincter m（環形的外尿道括約肌）
- Compressor urethrae m（兩條斜走的尿道壓迫肌）
- Urethrovaginal sphincter m（尿道陰道括約肌）
- Ischiocavernosus m（坐骨海綿體肌）
- Bulbospongiosus m（球海綿體肌）
- Perineal a（會陰動脈）
- Superficial transverse perineal m
- Perineal branches
- Perineal branches of pudendal n（陰部神經的會陰分支）
- Superior fascia Deep perineal muscles
- Deep perineal muscles
- Superficial transverse perineal muscle（會陰淺橫肌）
- Bulbospongiosus muscle（球海綿體肌）
- Intermediate layer A
- External urethral sphincter muscle（尿道外括約肌）
- Rectovesical septum（直腸膀胱隔膜）
- Rectovaginal septum（直腸陰道隔膜）
- Paraurethral gland
- Fundiform lig
- Transverse perineal m（淺橫肌）
- anococcygeal lig（連至尾骨形成肛尾韌帶）
- Inf. rectal a（下直腸動脈）
- Inf. rectal v（下直腸靜脈）
- Inf. rectal n（下直腸神經）
- bodies of pubic bones（恥骨體）
- labial a
- Perineal nerve（會陰神經）
- labial n
- Median sacral artery
- Inferior vesical artery
- Middle rectal artery
- Inferior vesical vein
- Where does the hypogastric nerve
- plexuses C. Superior hypogastric plexus
- Compressor urethrae D. Perineal artery
- Deep trans verse perineal muscle
- Pelvic splanchnic nerves
- not branches
- penis B. Perineal nerve
- Anterior scrotal nerve
- Inferior rectal nerve
- Vaginal artery
- Iliolumbar artery
- prostatic artery
- Umbilical artery
- Inferior mesenteric lymph nodes
- Internal iliac lymph nodes
- Superficial inguinal lymph nodes
- Sacral lymph nodes
- Hypogastric nerve
- sphincters C. Greater vestibular glands
- Deep transverse perineal muscles
- If the pudendal nerve
- contained inside the deep fascia
- The inferior rectal artery
- contributes to the perineal membrane
- diaphragm B. Perineal superficial fascia
- Superior perineal deep fascia
- Inferior perineal deep fascia
- sphincter D. Levator ani muscle
- anococcygeal ligament
- external and internal diac arteries
- principal nerve
- clitoris B. External pudendal nerve
- Posterior labial nerve
- Superoposterior rectum
- Compressor urethrae
- spongy urethra（海綿體尿道）
- outside pelvis（骨盆腔外）
- pelvic viscera（骨盆腔內臟器的靜脈叢）
- mesorectum（收直腸繫膜）
- internal vertebral venous plexus, ivvs（薦管中的內側椎靜脈叢）
- vas deferens（輸尿管）
- lumbar/para-aortic nodes（上移到腰淋巴結）
- ganglion impar（匯成一個奇神經節經節）
- vasomotor（血管收縮）
- pilomotor（豎毛肌收縮）
- sudomotor（排汗）
- inferiormost sacrum and coccyx（薦骨尾骨最下處）
- pelvic diaphragm（骨盆膈膜）
- roof of perineum（骨盆膈膜是會陰的頂部）
- membranous urethra（膜狀尿道）
- perineal a./ v./ n（陰部神經的會陰分支）
- perineal branches of internal pudendal vessels（內陰動靜脈的會陰分支）
- urethral sphincters（尿道外括約肌）
- episiotomy（外陰切開術）
- pudendum/vulva（外陰）
- coarse pubic hairs（陰毛）
- labia majora（大陰唇）
- scrotum（陰囊）
- pudendal cleft（空隙合併為陰部裂隙）
- labium minora（小陰唇）
- frenulum of the labia minora/ fourchette（小陰唇繫帶）
- frenulum of the clitoris（陰蒂繫帶）
- prepuce of the clitoris（陰蒂包皮）
- bulb of the penis（陰莖球）
- bulbospongiosus（球海綿體肌）
- tunica albuginea（白膜）
- suspension of the penis（陰莖韌帶）
- int. anal sphincter（肛門內括約肌）
- subcutaneous part（皮下層）
- anal column（肛柱）
- hindgut（後腸）
- proctodeum（發育自原肛）
- recesses（坐骨肛門窩的隱窩）
- ant. recesses（前隱窩）
- post. recesses（後隱窩）
- posterior scrotal/labial n（陰唇神經）
- dorsal nerve of penis /clitoris（陰蒂背神經）
- external genitalia（最後到外生殖器）
