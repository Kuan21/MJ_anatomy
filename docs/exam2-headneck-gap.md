# 第二次考試範圍核對：頭頸區（內部清單，不上網站）

2026-11-13 建立。範圍：頭頸，含腦、眼、耳。依每區內順序：血管 → 腺體 → 神經分支（含腦神經）→ 骨的細部 → 筋膜與間隙，最後附眼、耳、咽喉口鼻與肌肉。本檔只放在 `docs/`，不可放進 `public/` 或 `dist/`。

## 怎麼核對的

- 結構清單：取自 repo 內既有的整理檔（頭、頸、喉、神經系統各單元的詞表、覆蓋比對報告、腦與神經的比對表），去掉非結構詞後，用自己的名稱重新歸類。
- 站上現況：以目前 main 的結構資料為準（主圖譜網格、面部圖譜、頸部血管、神經串流、關節組織、示意模型、腦資訊卡與名稱表），用英文名規則比對，左右、`.l/.r`、編號後綴先合併。
- 站上現況分類：**有**＝有可點選的 3D 網格；**缺**＝找不到；**有資訊卡、無 3D**＝只在腦詳細模式清單有卡片，沒有對應網格（計入「缺」）；**缺（只在中文名稱表）**＝名稱表有中文但沒有網格（計入「缺」）；**名稱不同**＝站上有，但英文名或分法不同。
- 「建議處理」：補建／改名／相關搜尋／已有／需使用者決定。骨性標記一律用骨面標示，不另做浮空模型；筋膜與間隙依「特殊空間」規則（高亮邊界結構，必要時半透明立體）。
- 本輪只核對，沒有動任何模型。比對靠名稱，沒有逐項在 3D 畫面確認；請使用者以站上實際畫面為準核對。中文用詞差異未逐項比對。
- 腦詳細模式的網格檔在建置時才下載，本環境沒有，所以腦內結構直接採用 repo 內既有比對表的結果（見第七節），沒有重新比對網格。

## 總表（第一至六節，結構逐項）

| 類別 | 核對項 | 有 | 缺 | 名稱不同 | 需使用者決定 |
|---|---|---|---|---|---|
| 血管 | 71 | 7 | 63 | 1 | 5 |
| 腺體 | 15 | 5 | 10 | 0 | 1 |
| 神經分支（含腦神經） | 69 | 36 | 33 | 0 | 0 |
| 骨的細部 | 37 | 5 | 32 | 0 | 0 |
| 筋膜與間隙 | 24 | 1 | 23 | 0 | 11 |
| 其他（眼、耳、咽喉口鼻、肌肉） | 67 | 40 | 26 | 1 | 1 |
| **合計** | **283** | **94** | **187** | **2** | **18** |

資料不足之處：眼、耳的整理資料偏少（眼來自眼眶與眼球單元；耳只在神經系統整理的耳蝸部分與頭頸單元零星提到），中耳肌、耳殼、外耳道、內耳血管等可能還有漏列，需等使用者補上的神經與其他資料。腦神經在顱外的分支與神經節已逐項核對；腦神經核與傳導路徑見第七節。

## 一、血管（動脈、靜脈、淋巴、血管相關構造）

核對 71 項：有 7；缺 63（其中只有資訊卡 5、只有中文名稱表 0）；名稱不同 1；需使用者決定 5。

| 英文名 | 中文名 | 站上現況 | 建議處理 | 優先級 |
|---|---|---|---|---|
| Superior thyroid artery | 上甲狀腺動脈 | 缺 | 補建 | 高 |
| Lingual artery | 舌動脈 | 缺 | 補建 | 高 |
| Facial artery | 顏面動脈 | 缺 | 補建 | 高 |
| Maxillary artery | 上頷動脈 | 缺 | 補建 | 高 |
| Superficial temporal artery | 淺顳動脈 | 缺 | 補建 | 高 |
| Brachiocephalic trunk | 頭臂動脈幹 | 名稱不同（站上：brachiocephalic artery） | 改名顯示（站上名稱為 Brachiocephalic artery；建議顯示為「頭臂動脈幹 Brachiocephalic trunk」） | 高 |
| Middle meningeal artery | 中腦膜動脈 | 有資訊卡、無 3D（缺模型） | 已有資訊卡；建議補 3D 示意 | 高 |
| External jugular vein | 外頸靜脈 | 缺 | 補建 | 高 |
| Facial vein | 顏面靜脈 | 缺 | 補建 | 高 |
| Retromandibular vein | 下頷後靜脈 | 缺 | 補建 | 高 |
| Pterygoid venous plexus | 翼靜脈叢 | 有資訊卡、無 3D（缺模型） | 已有資訊卡；建議補 3D 示意 | 高 |
| Ascending pharyngeal artery | 升咽動脈 | 缺 | 補建 | 中 |
| Occipital artery | 枕動脈 | 缺 | 補建 | 中 |
| Posterior auricular artery | 耳後動脈 | 缺 | 補建 | 中 |
| Superior labial artery | 上唇動脈 | 缺 | 補建 | 中 |
| Inferior labial artery | 下唇動脈 | 缺 | 補建 | 中 |
| Ascending palatine artery | 升顎動脈 | 缺 | 補建 | 中 |
| Tonsillar artery (branch of facial artery) | 扁桃體動脈 | 缺 | 補建 | 中 |
| Superior laryngeal artery | 上喉動脈 | 缺 | 補建 | 中 |
| Inferior alveolar artery | 下齒槽動脈 | 缺 | 補建 | 中 |
| Supraorbital artery | 眶上動脈 | 缺 | 補建 | 中 |
| Supratrochlear artery | 滑車上動脈 | 缺 | 補建 | 中 |
| Central artery of retina | 視網膜中央動脈 | 缺 | 補建 | 中 |
| Labyrinthine artery | 迷路動脈 | 有資訊卡、無 3D（缺模型） | 已有資訊卡；建議補 3D 示意 | 中 |
| Anterior jugular vein | 前頸靜脈 | 缺 | 補建 | 中 |
| Superficial temporal vein | 淺顳靜脈 | 缺 | 補建 | 中 |
| Posterior auricular vein | 耳後靜脈 | 缺 | 補建 | 中 |
| Supraorbital vein | 眶上靜脈 | 缺 | 補建 | 中 |
| Supratrochlear vein | 滑車上靜脈 | 缺 | 補建 | 中 |
| Superior ophthalmic vein | 上眼靜脈 | 缺 | 補建 | 中 |
| Inferior ophthalmic vein | 下眼靜脈 | 缺 | 補建 | 中 |
| Emissary veins | 導靜脈 | 缺 | 補建 | 中 |
| Superior / middle / inferior thyroid veins | 上、中、下甲狀腺靜脈 | 缺 | 補建 | 中 |
| Carotid sinus | 頸動脈竇 | 有資訊卡、無 3D（缺模型） | 已有資訊卡；建議補 3D 示意 | 中 |
| Carotid body | 頸動脈體 | 有資訊卡、無 3D（缺模型） | 已有資訊卡；建議補 3D 示意 | 中 |
| Transverse facial artery | 顏面橫動脈 | 缺 | 補建 | 低 |
| Lateral nasal artery | 鼻外側動脈 | 缺 | 補建 | 低 |
| Middle thyroid artery / Thyroid ima artery | 中甲狀腺動脈／最下甲狀腺動脈 | 缺 | 補建 | 低 |
| Deep temporal arteries | 深顳動脈 | 缺 | 補建 | 低 |
| Deep auricular artery | 深耳動脈 | 缺 | 補建 | 低 |
| Anterior tympanic artery | 前鼓室動脈 | 缺 | 補建 | 低 |
| Accessory meningeal artery | 副腦膜動脈 | 缺 | 補建 | 低 |
| Masseteric artery | 咬肌動脈 | 缺 | 補建 | 低 |
| Buccal artery | 頰動脈 | 缺 | 補建 | 低 |
| Posterior superior alveolar artery | 後上齒槽動脈 | 缺 | 補建 | 低 |
| Middle superior alveolar artery | 中上齒槽動脈 | 缺 | 補建 | 低 |
| Anterior superior alveolar artery | 前上齒槽動脈 | 缺 | 補建 | 低 |
| Infraorbital artery | 眶下動脈 | 缺 | 補建 | 低 |
| Descending palatine artery | 下行顎動脈 | 缺 | 補建 | 低 |
| Greater palatine artery | 大顎動脈 | 缺 | 補建 | 低 |
| Lesser palatine artery | 小顎動脈 | 缺 | 補建 | 低 |
| Sphenopalatine artery | 蝶顎動脈 | 缺 | 補建 | 低 |
| Nasopalatine artery | 鼻顎動脈 | 缺 | 補建 | 低 |
| Anterior ciliary arteries | 前睫動脈 | 缺 | 補建 | 低 |
| Short posterior ciliary arteries | 短後睫動脈 | 缺 | 補建 | 低 |
| Long posterior ciliary arteries | 長後睫動脈 | 缺 | 補建 | 低 |
| Superior and inferior labial veins | 上、下唇靜脈 | 缺 | 補建 | 低 |
| Lateral nasal vein | 鼻外側靜脈 | 缺 | 補建 | 低 |
| Infraorbital / infratrochlear veins | 眶下、滑車下靜脈 | 缺 | 補建 | 低 |
| Scleral venous sinus | 鞏膜靜脈竇 | 缺 | 補建 | 低 |
| Superficial cervical lymph nodes | 頸淺淋巴結 | 缺 | 需使用者決定（淋巴示意是否要建） | 低 |
| Deep cervical lymph nodes | 頸深淋巴結 | 缺 | 需使用者決定（淋巴示意是否要建） | 低 |
| Jugular lymphatic trunk | 頸淋巴幹 | 缺 | 需使用者決定（淋巴示意是否要建） | 低 |
| Right lymphatic duct | 右淋巴導管 | 缺 | 需使用者決定（淋巴示意是否要建） | 低 |
| Thyrocervical trunk | 甲狀頸動脈幹 | 有 | 已有 | — |
| Inferior thyroid artery | 下甲狀腺動脈 | 有 | 已有 | — |
| Ophthalmic artery | 眼動脈 | 有 | 已有 | — |
| Internal jugular vein | 內頸靜脈 | 有 | 已有 | — |
| Cavernous sinus | 海綿竇 | 有 | 已有 | — |
| Suprascapular artery | 肩胛上動脈 | 有 | 已有 | — |
| Thoracic duct (cervical part) | 胸管（頸段） | 有 | 需使用者決定（站上有胸管，是否延伸到頸部匯入靜脈角需查） | — |

## 二、腺體（含扁桃體等淋巴組織）

核對 15 項：有 5；缺 10（其中只有資訊卡 0、只有中文名稱表 0）；名稱不同 0；需使用者決定 1。

| 英文名 | 中文名 | 站上現況 | 建議處理 | 優先級 |
|---|---|---|---|---|
| Parotid gland | 腮腺（耳下腺） | 缺 | 補建 | 高 |
| Thyroid gland | 甲狀腺 | 缺 | 補建 | 高 |
| Parathyroid glands | 副甲狀腺 | 缺 | 補建 | 高 |
| Parotid duct | 腮腺管（耳下腺管） | 缺 | 補建 | 中 |
| Palatine tonsil | 顎扁桃體 | 缺 | 補建 | 中 |
| Pharyngeal tonsil (adenoid) | 咽扁桃體 | 缺 | 補建 | 中 |
| Lingual tonsil | 舌扁桃體 | 缺 | 補建 | 中 |
| Excretory ducts of lacrimal gland | 淚腺排泄管 | 缺 | 相關搜尋 | 低 |
| Ceruminous glands | 耵聹腺 | 缺 | 需使用者決定（組織層級，建議只做資訊卡） | 低 |
| Tubal tonsil | 咽鼓管扁桃體 | 缺 | 補建 | 低 |
| Submandibular gland | 下頷下腺 | 有 | 已有 | — |
| Sublingual gland | 舌下腺 | 有 | 已有 | — |
| Lacrimal gland | 淚腺 | 有 | 已有 | — |
| Pituitary gland | 腦下垂體 | 有 | 已有 | — |
| Pineal gland | 松果體 | 有 | 已有 | — |

## 三、神經分支（含腦神經、神經節）

核對 69 項：有 36；缺 33（其中只有資訊卡 3、只有中文名稱表 3）；名稱不同 0；需使用者決定 0。

| 英文名 | 中文名 | 站上現況 | 建議處理 | 優先級 |
|---|---|---|---|---|
| Trigeminal ganglion | 三叉神經節 | 缺 | 補建 | 高 |
| Auriculotemporal nerve | 耳顳神經 | 缺 | 補建 | 高 |
| Infraorbital nerve | 眶下神經 | 缺 | 補建 | 高 |
| Facial nerve branches (temporal, zygomatic, buccal, marginal mandibular, cervical) | 顏面神經分支（顳、顴、頰、下頷緣、頸） | 缺 | 補建 | 高 |
| Superior cervical ganglion | 上頸神經節 | 缺 | 補建 | 高 |
| Ansa cervicalis (superior and inferior roots) | 頸襻（上根、下根） | 缺 | 補建 | 高 |
| Superior laryngeal nerve (internal and external branches) | 上喉神經（內支、外支） | 缺 | 補建 | 高 |
| Deep temporal nerves | 深顳神經 | 缺 | 補建 | 中 |
| Masseteric nerve | 咬肌神經 | 缺 | 補建 | 中 |
| Zygomatic nerve (zygomaticotemporal / zygomaticofacial) | 顴神經（顴顳、顴面） | 缺 | 補建 | 中 |
| Superior alveolar nerves (posterior / middle / anterior) | 上齒槽神經（後、中、前） | 缺 | 補建 | 中 |
| Nasopalatine nerve | 鼻顎神經 | 缺 | 補建 | 中 |
| Greater / lesser palatine nerves | 大、小顎神經 | 缺 | 補建 | 中 |
| Greater petrosal nerve | 大岩神經 | 缺 | 補建 | 中 |
| Lesser petrosal nerve | 小岩神經 | 缺 | 補建 | 中 |
| Nerve of pterygoid canal (Vidian nerve) | 翼管神經 | 缺 | 補建 | 中 |
| Pterygopalatine ganglion | 翼顎神經節 | 缺 | 補建 | 中 |
| Otic ganglion | 耳神經節 | 缺 | 補建 | 中 |
| Submandibular ganglion | 下頷下神經節 | 缺 | 補建 | 中 |
| Middle / inferior cervical ganglia, stellate ganglion | 中、下頸神經節、星狀神經節 | 缺 | 補建 | 中 |
| Great auricular nerve | 耳大神經 | 缺（只在中文名稱表） | 補建（名稱表已有中文，缺網格） | 中 |
| Lesser occipital nerve | 枕小神經 | 缺（只在中文名稱表） | 補建（名稱表已有中文，缺網格） | 中 |
| Greater occipital nerve | 枕大神經 | 缺（只在中文名稱表） | 補建（名稱表已有中文，缺網格） | 中 |
| Transverse cervical nerve | 頸橫神經 | 缺 | 補建 | 中 |
| Supraclavicular nerves | 鎖骨上神經 | 缺 | 補建 | 中 |
| Pharyngeal plexus | 咽神經叢 | 缺 | 補建 | 中 |
| Deep petrosal nerve | 深岩神經 | 缺 | 補建 | 低 |
| Tympanic plexus / tympanic nerve | 鼓室神經叢 | 缺 | 補建 | 低 |
| Geniculate ganglion | 膝狀神經節 | 缺 | 補建 | 低 |
| Superior and inferior ganglia of glossopharyngeal nerve | 舌咽神經上、下神經節 | 有資訊卡、無 3D（缺模型） | 已有資訊卡；建議補 3D 示意 | 低 |
| Spiral ganglion | 螺旋神經節 | 有資訊卡、無 3D（缺模型） | 已有資訊卡；建議補 3D 示意 | 低 |
| Vestibular ganglion (Scarpa) | 前庭神經節 | 有資訊卡、無 3D（缺模型） | 已有資訊卡；建議補 3D 示意 | 低 |
| Carotid sinus nerve | 頸動脈竇神經 | 缺 | 補建 | 低 |
| Olfactory nerve (CN I) | 嗅神經 | 有 | 已有 | — |
| Optic nerve (CN II) | 視神經 | 有 | 已有 | — |
| Oculomotor nerve (CN III) | 動眼神經 | 有 | 已有 | — |
| Trochlear nerve (CN IV) | 滑車神經 | 有 | 已有 | — |
| Trigeminal nerve (CN V) | 三叉神經 | 有 | 已有 | — |
| Ophthalmic nerve (V1) | 眼神經 | 有 | 已有 | — |
| Maxillary nerve (V2) | 上頷神經 | 有 | 已有 | — |
| Mandibular nerve (V3) | 下頷神經 | 有 | 已有 | — |
| Abducens nerve (CN VI) | 外展神經 | 有 | 已有 | — |
| Facial nerve (CN VII) | 顏面神經 | 有 | 已有 | — |
| Vestibulocochlear nerve (CN VIII) | 前庭耳蝸神經 | 有 | 已有 | — |
| Glossopharyngeal nerve (CN IX) | 舌咽神經 | 有 | 已有 | — |
| Vagus nerve (CN X) | 迷走神經 | 有 | 已有 | — |
| Accessory nerve (CN XI) | 副神經 | 有 | 已有 | — |
| Hypoglossal nerve (CN XII) | 舌下神經 | 有 | 已有 | — |
| Lingual nerve | 舌神經 | 有 | 已有 | — |
| Inferior alveolar nerve | 下齒槽神經 | 有 | 已有 | — |
| Chorda tympani | 鼓索神經 | 有 | 已有 | — |
| Sympathetic trunk (cervical part) | 交感幹（頸段） | 有 | 已有 | — |
| Recurrent laryngeal nerve | 喉返神經 | 有 | 已有 | — |
| Superior / inferior divisions of oculomotor nerve | 動眼神經上、下支 | 有 | 已有 | — |
| Mental nerve | 頦神經 | 有 | 已有 | — |
| Buccal nerve | 頰神經 | 有 | 已有 | — |
| Lacrimal nerve | 淚腺神經 | 有 | 已有 | — |
| Nasociliary nerve | 鼻睫神經 | 有 | 已有 | — |
| Ciliary ganglion | 睫狀神經節 | 有 | 已有 | — |
| Phrenic nerve | 膈神經 | 有 | 已有 | — |
| Cervical plexus | 頸神經叢 | 有 | 已有 | — |
| Frontal nerve | 額神經 | 有 | 已有 | — |
| Supraorbital nerve | 眶上神經 | 有 | 已有 | — |
| Supratrochlear nerve | 滑車上神經 | 有 | 已有 | — |
| Nerve to mylohyoid | 下頷舌骨肌神經 | 有 | 已有 | — |
| Infratrochlear nerve | 滑車下神經 | 有 | 已有 | — |
| Anterior / posterior ethmoidal nerves | 篩前、篩後神經 | 有 | 已有 | — |
| Short / long ciliary nerves | 短、長睫神經 | 有 | 已有 | — |
| Meningeal branch of maxillary nerve | 上頷神經腦膜支 | 有 | 已有 | — |

## 四、骨的細部（孔、裂、管、突、窩）

核對 37 項：有 5；缺 32（其中只有資訊卡 3、只有中文名稱表 0）；名稱不同 0；需使用者決定 0。

| 英文名 | 中文名 | 站上現況 | 建議處理 | 優先級 |
|---|---|---|---|---|
| Mental foramen | 頦孔 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 高 |
| Supraorbital foramen / notch | 眶上孔（切跡） | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 高 |
| Infraorbital foramen | 眶下孔 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 高 |
| Stylomastoid foramen | 莖乳突孔 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 高 |
| Foramen ovale | 卵圓孔 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 高 |
| Foramen spinosum | 棘孔 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 高 |
| Foramen rotundum | 圓孔 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 高 |
| Carotid canal | 頸動脈管 | 有資訊卡、無 3D（缺模型） | 已有資訊卡；骨面標示（依骨性標記規則） | 高 |
| Hypoglossal canal | 舌下神經管 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 高 |
| Optic canal | 視神經管 | 有資訊卡、無 3D（缺模型） | 已有資訊卡；骨面標示（依骨性標記規則） | 高 |
| Superior orbital fissure | 眶上裂 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 高 |
| Inferior orbital fissure | 眶下裂 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 高 |
| Mandibular foramen | 下頷孔 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 高 |
| Zygomatic arch | 顴弓 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 高 |
| Foramen magnum | 枕骨大孔 | 有資訊卡、無 3D（缺模型） | 已有資訊卡；骨面標示（依骨性標記規則） | 高 |
| Foramen lacerum | 破裂孔 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 中 |
| Petrotympanic fissure | 岩鼓裂 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 中 |
| Greater / lesser palatine foramina | 大、小顎孔 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 中 |
| Sphenopalatine foramen | 蝶顎孔 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 中 |
| Pterygoid canal | 翼管 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 中 |
| Internal acoustic meatus | 內耳道 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 中 |
| External acoustic meatus | 外耳道 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 中 |
| Pterygomaxillary fissure | 翼上頷裂 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 中 |
| Pterygoid process (medial / lateral plates) | 翼突（內、外側板） | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 中 |
| Coronoid process / condylar process of mandible | 下頷骨冠狀突、髁突 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 中 |
| Ramus and angle of mandible | 下頷枝與下頷角 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 中 |
| Mandibular fossa and articular tubercle | 下頷窩、關節結節 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 中 |
| Greater wing / lesser wing / body of sphenoid bone | 蝶骨大翼、小翼、體 | 缺 | 骨面標示 | 中 |
| Palatine canal / palatovaginal canal | 顎管、顎鞘管 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 低 |
| Temporal lines (superior / inferior) | 顳線（上、下） | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 低 |
| Infratemporal crest | 顳下嵴 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 低 |
| Carotid tubercle | 頸動脈結節 | 缺 | 骨面標示（依骨性標記規則，不另做浮空模型） | 低 |
| Jugular foramen | 頸靜脈孔 | 有 | 已有 | — |
| Mandible | 下頷骨 | 有 | 已有 | — |
| Hyoid bone | 舌骨 | 有 | 已有 | — |
| Sphenoid bone (whole) | 蝶骨（整塊） | 有 | 已有 | — |
| Mastoid process | 乳突 | 有 | 已有 | — |

## 五、筋膜與間隙（含頸部三角、窩、腦膜腔）

核對 24 項：有 1；缺 23（其中只有資訊卡 3、只有中文名稱表 0）；名稱不同 0；需使用者決定 11。

| 英文名 | 中文名 | 站上現況 | 建議處理 | 優先級 |
|---|---|---|---|---|
| Investing layer of deep cervical fascia | 頸深筋膜包覆層 | 缺 | 需使用者決定（筋膜呈現方式） | 高 |
| Carotid sheath | 頸動脈鞘 | 缺 | 需使用者決定（筋膜呈現方式） | 高 |
| Occipital triangle (posterior triangle) | 枕三角（後三角） | 缺 | 空間示意（依特殊空間規則） | 高 |
| Supraclavicular triangle | 鎖骨上三角 | 缺 | 空間示意（依特殊空間規則） | 高 |
| Carotid triangle | 頸動脈三角 | 缺 | 空間示意（依特殊空間規則） | 高 |
| Submental triangle | 頦下三角 | 缺 | 空間示意（依特殊空間規則） | 高 |
| Submandibular triangle | 下頷下三角 | 缺 | 空間示意（依特殊空間規則） | 高 |
| Pterygopalatine fossa | 翼顎窩 | 缺 | 空間示意（依特殊空間規則） | 高 |
| Infratemporal fossa | 顳下窩 | 缺 | 空間示意（依特殊空間規則） | 高 |
| Pretracheal fascia | 頸深筋膜氣管前層 | 缺 | 需使用者決定（筋膜呈現方式） | 中 |
| Prevertebral fascia | 頸深筋膜椎前層 | 缺 | 需使用者決定（筋膜呈現方式） | 中 |
| Parotid sheath / parotid space | 腮腺鞘／腮腺間隙 | 缺 | 需使用者決定（筋膜呈現方式） | 中 |
| Aponeurosis of epicranius (galea aponeurotica) | 帽狀腱膜 | 缺 | 補建 | 中 |
| Muscular triangle / anterior triangle | 肌三角／前三角 | 缺 | 空間示意（依特殊空間規則） | 中 |
| Temporal fossa | 顳窩 | 缺 | 空間示意（依特殊空間規則） | 中 |
| Danger triangle of the face | 顏面危險三角 | 缺 | 相關搜尋（指向顏面靜脈、眼靜脈、海綿竇） | 中 |
| Subdural / subarachnoid / epidural spaces | 硬腦膜下、蛛網膜下、硬膜外腔 | 有資訊卡、無 3D（缺模型） | 已有資訊卡；3D 部分需使用者決定 | 中 |
| Dura mater, arachnoid mater, pia mater | 硬腦膜、蛛網膜、軟腦膜 | 有資訊卡、無 3D（缺模型） | 已有資訊卡；3D 部分需使用者決定 | 中 |
| Pharyngobasilar fascia | 咽顱底筋膜 | 缺 | 需使用者決定（筋膜呈現方式） | 低 |
| Temporalis fascia | 顳肌筋膜 | 缺 | 需使用者決定（筋膜呈現方式） | 低 |
| Palatine aponeurosis | 顎腱膜 | 缺 | 補建 | 低 |
| Cerebellomedullary and suprasellar cisterns | 小腦延髓池、鞍上池 | 有資訊卡、無 3D（缺模型） | 已有資訊卡；3D 部分需使用者決定 | 低 |
| Retropharyngeal space | 咽後間隙 | 缺 | 需使用者決定 | 低 |
| Suboccipital triangle | 枕下三角 | 有 | 已有 | — |

## 六、其他：眼、耳、咽喉口鼻、肌肉（不在每區順序內，一併核對）

核對 67 項：有 40；缺 26（其中只有資訊卡 5、只有中文名稱表 0）；名稱不同 1；需使用者決定 1。

| 英文名 | 中文名 | 站上現況 | 建議處理 | 優先級 |
|---|---|---|---|---|
| Malleus, incus, stapes | 錘骨、砧骨、鐙骨 | 有資訊卡、無 3D（缺模型） | 已有資訊卡；3D 併入耳／眼詳細模式（#277 之後） | 高 |
| Pharynx (nasopharynx, oropharynx, laryngopharynx) | 咽（鼻咽、口咽、喉咽） | 缺 | 需使用者決定（空間示意：鼻咽、口咽、喉咽三段是否要建） | 高 |
| Soft palate | 軟顎 | 缺 | 補建（或以 Levator veli palatini、Tensor veli palatini 為相關搜尋） | 高 |
| Paranasal sinuses (maxillary, frontal, ethmoidal, sphenoid) | 鼻竇（上頷、額、篩、蝶） | 缺 | 補建 | 高 |
| Optic disc (blind spot), macula lutea, fovea centralis | 視神經盤、黃斑、中央小凹 | 缺 | 補建 | 中 |
| Auricle (pinna) | 耳殼 | 缺 | 補建 | 中 |
| External acoustic meatus (canal) | 外耳道 | 缺 | 補建 | 中 |
| Membranous labyrinth: utricle, saccule, cochlear duct | 膜迷路：橢圓囊、球囊、耳蝸管 | 有資訊卡、無 3D（缺模型） | 已有資訊卡；3D 併入耳／眼詳細模式（#277 之後） | 中 |
| Oval window / round window | 卵圓窗、圓窗 | 有資訊卡、無 3D（缺模型） | 已有資訊卡；3D 併入耳／眼詳細模式（#277 之後） | 中 |
| Palatoglossal arch / palatopharyngeal arch | 顎舌弓、顎咽弓 | 缺 | 補建 | 中 |
| Occipitofrontalis (epicranius) | 額枕肌 | 名稱不同（站上：） | 相關搜尋（站上分為 Frontalis 與 Occipitalis） | 中 |
| Scalp layers (skin, dense connective tissue, galea, loose areolar tissue, pericranium) | 頭皮層次 | 有資訊卡、無 3D（缺模型） | 已有資訊卡；3D 併入耳／眼詳細模式（#277 之後） | 中 |
| Nasal cavity | 鼻腔 | 缺 | 補建（空間示意） | 中 |
| Conjunctiva (palpebral / bulbar) | 結膜（瞼、球） | 缺 | 補建 | 低 |
| Ora serrata | 鋸齒緣 | 缺 | 補建 | 低 |
| Superior tarsal muscle (Muller) | 上瞼板肌 | 缺 | 補建 | 低 |
| Auricular muscles | 耳肌 | 缺 | 補建（耳前、耳上、耳後肌） | 低 |
| Stapedius, tensor tympani | 鐙骨肌、鼓膜張肌 | 缺 | 補建 | 低 |
| Organ of Corti, basilar membrane, tectorial membrane | 柯氏器、底膜、覆膜 | 有資訊卡、無 3D（缺模型） | 已有資訊卡；3D 併入耳／眼詳細模式（#277 之後） | 低 |
| Salpingopharyngeal fold, pharyngeal recess | 耳咽管咽褶、咽隱窩 | 缺 | 相關搜尋 | 低 |
| Aryepiglottic fold | 杓會厭褶 | 缺 | 相關搜尋 | 低 |
| Retina layers (neural layer / pigment layer) | 視網膜分層（神經層、色素層） | 缺 | 相關搜尋（指向 Optic part of retina） | 低 |
| Ciliary processes / ciliary muscle | 睫狀突、睫狀肌 | 缺 | 補建 | 低 |
| Posterior chamber / aqueous humor | 後房、房水 | 缺 | 補建 | 低 |
| Vocal fold / laryngeal ventricle / vestibular fold | 聲帶（聲襞）、喉室、前庭襞 | 缺 | 相關搜尋（指向 Vocal ligament 與喉內肌） | 低 |
| Uvula | 懸雍垂 | 缺 | 相關搜尋（指向 Uvular muscle 懸雍垂肌） | 低 |
| Middle / superior nasal conchae | 中、上鼻甲 | 缺 | 骨面標示（屬篩骨） | 低 |
| Eyeball | 眼球 | 有 | 已有 | — |
| Sclera | 鞏膜 | 有 | 已有 | — |
| Cornea | 角膜 | 有 | 已有 | — |
| Choroid | 脈絡膜 | 有 | 已有 | — |
| Iris, pupil | 虹膜、瞳孔 | 有 | 已有 | — |
| Lens | 水晶體 | 有 | 已有 | — |
| Retina | 視網膜 | 有 | 已有 | — |
| Extraocular muscles (4 recti, 2 obliques) | 眼外肌（四條直肌、兩條斜肌） | 有 | 已有 | — |
| Levator palpebrae superioris | 提上眼瞼肌 | 有 | 已有 | — |
| Tympanic membrane | 鼓膜 | 有 | 已有 | — |
| Tympanic cavity / middle ear | 鼓室（中耳腔） | 有 | 已有 | — |
| Cochlea | 耳蝸 | 有 | 已有 | — |
| Thyroid cartilage | 甲狀軟骨 | 有 | 已有 | — |
| Epiglottic cartilage / epiglottis | 會厭（軟骨） | 有 | 已有 | — |
| Tongue | 舌 | 有 | 已有 | — |
| Ciliary body | 睫狀體 | 有 | 已有（網格名稱帶 curve 字尾，顯示名稱請核對） | — |
| Sphincter pupillae / dilator pupillae | 瞳孔括約肌、瞳孔擴張肌 | 有 | 已有 | — |
| Anterior chamber of eyeball | 前房 | 有 | 已有 | — |
| Vitreous body (humor) | 玻璃體 | 有 | 已有 | — |
| Orbicularis oculi | 眼輪匝肌 | 有 | 已有 | — |
| Common tendinous ring | 總腱環 | 有 | 已有 | — |
| Lacrimal punctum / canaliculi / sac / nasolacrimal duct | 淚點、淚小管、淚囊、鼻淚管 | 有 | 已有 | — |
| Pharyngotympanic (auditory) tube | 耳咽管（咽鼓管） | 有 | 已有 | — |
| Pharyngeal constrictors, stylopharyngeus, salpingopharyngeus, palatopharyngeus | 咽縮肌與咽提肌群 | 有 | 已有 | — |
| Vocal ligament | 聲韌帶 | 有 | 已有 | — |
| Intrinsic laryngeal muscles | 喉內肌 | 有 | 已有 | — |
| Inferior nasal concha | 下鼻甲 | 有 | 已有 | — |
| Facial expression muscles (individual muscles) | 顏面表情肌（個別肌肉） | 有 | 已有（群組名稱「表情肌／口周群／眼周群」為分組，站上以個別肌肉呈現） | — |
| Masseter | 咬肌 | 有 | 已有（逐條核對） | — |
| Temporalis | 顳肌 | 有 | 已有 | — |
| Sternocleidomastoid and platysma | 胸鎖乳突肌、頸闊肌 | 有 | 已有 | — |
| Temporomandibular joint | 顳顎關節 | 有 | 已有 | — |
| Semicircular canals | 半規管 | 有 | 已有 | — |
| Vestibule (inner ear) | 前庭（內耳） | 有 | 已有 | — |
| Cricoid / arytenoid / corniculate / cuneiform cartilages | 環狀、杓狀、小角、楔狀軟骨 | 有 | 已有 | — |
| Scalene muscles (anterior, middle, posterior) | 斜角肌（前、中、後） | 有 | 已有（站上名稱 Scalenus） | — |
| Medial and lateral pterygoids | 翼內肌、翼外肌 | 有 | 已有 | — |
| Zonular fibers | 小帶纖維 | 有 | 已有 | — |
| Tarsal plates and eyelids | 瞼板、眼瞼 | 有 | 已有 | — |
| Nasal septum (bony and cartilaginous) | 鼻中隔 | 有 | 已有（犁骨與鼻中隔軟骨分開存在，鼻中隔整體名稱無） | — |

## 七、腦與神經系統（既有比對表的結果）

既有比對表自動抽出 597 條腦與神經的結構：保留 485 張資訊卡；腦詳細模式有網格 154 項、近似網格 13 項、**沒有網格 317 項**；其餘為併入其他條目或剔除。這 317 項在清單與搜尋仍可找到（標示模型未有）。下表是沒有網格或只有近似網格的 330 項，其中 31 項在主圖譜另有網格。

| 類別 | 項數 | 主圖譜另有網格 | 建議處理 |
|---|---|---|---|
| 血管 | 29 | 7 | 7 項主圖譜已有網格（可在腦詳細模式連到主圖譜）；其餘為腦深部與脊髓供應小分支，建議列入血管批次示意補建 |
| 耳部結構 | 35 | 3 | 大構造（鼓膜、聽小骨、耳蝸、半規管、橢圓囊、球囊、卵圓窗、圓窗）併入耳詳細模式；細胞與膜層級（毛細胞、柱細胞、底膜、覆膜、血管紋等約 18 項）建議只保留資訊卡 |
| 神經 | 15 | 2 | 舌咽神經上下神經節、螺旋神經節、前庭神經節屬頭頸；內臟神經與腹下神經叢屬腹部與骨盆，移到對應區域核對 |
| 腦室／腦池／腦膜 | 15 | 2 | 腦膜與腦池為腔隙與膜層，需使用者決定呈現方式（半透明層或只保留資訊卡） |
| 核團 | 30 | 2 | 核團體積小，建議維持資訊卡；需使用者決定是否要做示意 |
| 纖維束／傳導路徑 | 81 | 7 | 傳導路徑以示意線條呈現才有意義，需使用者決定；脊髓束歸脊髓區 |
| 其他結構 | 111 | 8 | 混合類別（脊髓、馬尾、網狀結構、結節等），需使用者決定；7 項主圖譜另有網格 |
| 皮質／腦迴／腦溝／腦葉 | 14 | 0 | 多為腦迴細分或重複名稱，建議以相關搜尋指向已有的腦迴 |

各類別項目（英文名／中文名；`*` 代表只有近似網格）：

**血管（29）**

Vertebral artery／椎動脈 ; Subclavian artery／鎖骨下動脈 ; Anterior spinal artery／前脊髓動脈 ; Posterior spinal artery／後脊髓動脈 ; Middle meningeal artery／中硬腦膜動脈 ; Cavernous part (ICA segment 3)／內頸動脈海綿竇段 ; Common carotid artery／總頸動脈 ; Carotid foramen／頸動脈孔 ; Carotid canal／頸動脈管 ; Anterior choroidal artery／前脈絡動脈 ; Pterygoid venous plexus／翼靜脈叢 ; Posterior choroidal artery／後脈絡動脈 ; Cortical branches (of cerebral arteries)／皮質支 ; Central branches (of cerebral arteries)／中央支 ; Meningeal branch (of vertebral artery)／腦膜支 ; Medullary artery (medulla oblongata)／延髓動脈 ; Deep cervical artery／深頸動脈 ; Ascending cervical artery／升頸動脈 ; Posterior intercostal artery／後肋間動脈 ; Lumbar artery／腰動脈 ; Anterior and posterior radicular arteries／前、後根動脈 ; Carotid sinus／頸動脈竇 ; Aortic arch／主動脈弓 ; Carotid body／頸動脈體 ; Aortic body／主動脈體 ; Deep branches (of posterior cerebral artery)／深支 ; Penetrating arteries／穿通支動脈 ; Medullary arteries (of white matter)／髓動脈 ; Labyrinthine artery／迷路動脈

**耳部結構（35）**

Tympanic membrane／鼓膜 ; Malleus／錘骨 ; Incus／砧骨 ; Stapes／鐙骨 ; Footplate／足板 ; Oval window (fenestra vestibuli)／卵圓窗（前庭窗） ; Cochlea／耳蝸 ; Semicircular canals／半規管 ; Round window (fenestra cochleae)／圓窗（耳蝸窗） ; Cochlear part／耳蝸部 ; Vestibular part／前庭部 ; Utricle／橢圓囊 ; Saccule／球囊 ; Ampulla／壺腹 ; Crista ampullaris／壺腹嵴 ; Cochlear duct (scala media)／耳蝸管（中階） ; Base of cochlea／耳蝸底部 ; Vestibular membrane／前庭膜 ; Stria vascularis／血管紋 ; Spiral ligament／螺旋韌帶 ; Osseous spiral lamina／骨性螺旋板 ; Basilar membrane／底膜 ; Organ of Corti (spiral organ)／柯氏器（螺旋器） ; Tectorial membrane／覆膜 ; Supporting cells／支持細胞 ; Inner and outer pillar cells／內、外柱細胞 ; Tunnel of Corti／柯氏管 ; Inner and outer phalangeal cells／內、外指細胞 ; Inner and outer border cells／內、外邊緣細胞 ; Sensory cells／感覺細胞 ; Inner hair cell／內毛細胞 ; Outer hair cell／外毛細胞 ; Helicotrema／蝸孔 ; Hair cell／毛細胞 ; Otolithic membrane／耳石膜

**神經（15）**

Neuroglia／神經膠細胞 ; Dorsal root ganglion (DRG)／背根神經節 ; Glossopharyngeal nerve (CN IX)／舌咽神經 ; Superior ganglion／上神經節 ; inf. ganglion／下神經節 ; Cardiac and splanchnic nerves／心臟與內臟神經 ; Hypogastric plexus／腹下神經叢 ; lumbar splanchnic nerve／腰內臟神經 ; Thoracic cardiac branches／胸心臟分支 ; least splanchnic nerve／最小內臟神經 ; Spiral ganglion／螺旋神經節 ; Cochlear nerve／耳蝸神經 ; Cochlear br. of vestibulocochlear nerve／耳蝸枝 ; Vestibular ganglion (Scarpa’s ganglion)／前庭神經節（Scarpa 神經節） ; Vestibulocochlear nerve (CN VIII)／前庭耳蝸神經*

**腦室／腦池／腦膜（15）**

Lateral aperture／側孔 ; Cerebellomedullary cistern／小腦延髓池 ; Subarachnoid space／蜘蛛網膜下腔 ; Interventricular foramen／室間孔 ; Foramen magnum／枕骨大孔 ; Central canal／中央管 ; Epidural (extradural) space／硬腦膜上腔（硬膜外腔） ; Meningeal layer of dura mater／腦膜層 ; Subdural／硬腦膜下腔 ; Arachnoid mater／蛛網膜 ; Pia mater／軟腦膜 ; Dura mater／硬腦膜 ; Dura mater proper／硬腦膜固有層 ; Temporal horn of the lateral ventricle／側腦室顳角* ; Suprasellar cistern／蝶鞍上腦池

**核團（30）**

Posteromarginal Nucleus／後邊緣核 ; Nucleus proprius／固有核 ; Clarke’s nucleus (dorsal nucleus)／克拉克背核 ; Visceral afferent nucleus／內臟感覺核 ; Gracile nucleus (Nucleus gracilis)／薄束核 ; Cuneate nucleus (Nucleus cuneatus)／楔形核 ; Accessory cuneate nucleus／副楔形核 ; Pontine nuclei／橋腦核 ; Hypoglossal nucleus／舌下神經核 ; Dorsal vagal nucleus／迷走神經背核 ; Nucleus ambiguus／疑核 ; solitary nucleus／孤立核 ; Cochlear nucleus／耳蝸神經核 ; Superior olivary nucleus／上橄欖核 ; Trigeminal nuclei／三叉神經核 ; Trochlear nucleus／滑車神經核 ; Posterior raphe nucleus／後縫核 ; Mesencephalic nucleus of trigeminal nerve／三叉神經中腦核 ; Medial vestibular nucleus／內側前庭核* ; Deep cerebellar nuclei／中央神經核 ; Fastigial nucleus／頂核 ; Interposed nucleus／間位核 ; Globose nucleus／球狀核 ; Emboliform nucleus／栓狀核 ; Dentate nucleus／齒狀核 ; Raphe nuclei／縫核 ; Lateral dorsal nucleus／外側背側核 ; Locus ceruleus／藍斑核 ; dorsal column nuclei／為背柱核 ; Lateral vestibular nucleus／外側前庭核*

**纖維束／傳導路徑（81）**

Olfactory tract／嗅徑 ; Medial olfactory stria／內側嗅束 ; Lateral olfactory stria／外側嗅束 ; Crus cerebri／大腦腳 ; Medial & Lateral longitudinal fasciculus／內外側大腦縱束 ; Cortico-basal-thalamic loop／視丘迴路 ; Decussation of pyramid／錐體交叉 ; Gray commissure／灰質聯合區 ; Extrafusal fibers／肌梭外纖維 ; Spinothalamic tract／脊髓丘腦徑 ; Proper fasciculus/Intersegmental tract／短程固有束 ; Central commissure／跨過中央聯合 ; Ascending/Sensory tracts／上升徑 ; Spinocerebellar pathways／脊髓小腦路徑 ; Fasciculus cuneatus／楔束 ; Fasciculus gracilis／薄束 ; Internal arcuate fibers／內側弓狀纖維 ; Anterior spinocerebellar tract／前側脊髓小腦徑 ; Posterior spinocerebellar tract／後側脊髓小腦徑 ; Cuneocerebellar Tract／楔狀小腦徑 ; Descending tract／白質下降徑 ; Lateral corticospinal tract (LCST)／外側皮質脊髓徑* ; Anterior corticospinal tract (ACST)／前側皮質脊髓徑* ; Rubrospinal tract／紅核脊髓徑 ; Tectospinal tract／頂蓋脊髓徑 ; Decussation of medial lemnisci／內側蹄系交叉 ; Medial longitudinal fasciculus (MLF)／內側縱束 ; ascending taste pathway／味覺的上升徑 ; Ascending central auditory pathways／上行聽覺傳導路徑 ; spinal lemniscus／脊髓丘系 ; lateral lemniscus／外側蹄系 ; Climbing fiber／爬行纖維 ; Mossy fiber／苔蘚狀纖維 ; parallel fiber／平行纖維 ; Corticopontocerebellar pathway／皮質橋腦小腦徑 ; Corticopontine fibers／皮質橋腦纖維 ; Cerebro-reticular cerebellar pathway／皮質網狀小腦徑 ; Corticoreticular fibers／皮質網狀纖維 ; Reticulocerebellar fibers／網狀小腦纖維 ; Cerebro-olivary cerebellar pathway／皮質橄欖小腦徑 ; Corticoolivary fibers／皮質橄欖纖維 ; Olivocerebellar tract／橄欖小腦徑 ; Fastigial vestibular pathway／頂核前庭路徑 ; Vestibulospinal tract／前庭脊髓徑 ; Fastigial reticular pathway／頂核網狀路徑 ; Globose-emboliform-rubral pathway／腦紅核路徑 ; Transverse pontine fibers／橫行纖維 ; Pontocerebellar fibers／橋腦小腦纖維 ; Hippocampal afferent connections／海馬輸入路徑 ; Entorhinal afferents／內嗅皮質輸入路徑 ; Perforant path／穿通路徑 ; Alvear path／室床路徑 ; Hippocampal efferent connections／海馬輸出路徑 ; Mammillothalamic tract / Fasciculus／乳頭體視丘徑 ; Papez circuit／巴貝茲迴路 ; Ventral amygdalofugal pathway／腹側杏仁核通路 ; Medial forebrain bundle／前腦內側神經束 ; Somatic afferent pathway (GSA from body)／體感覺傳入路徑 ; dorsal root fiber／背根神經纖維 ; lateral spinothalamic tract／外側脊髓視丘徑 ; ventral spinothalamic tract／腹側脊髓視丘徑 ; ventral trigeminothalamic tract／腹側三叉視丘徑 ; dorsal trigeminothalamic tract／背側三叉視丘徑 ; C fiber／C 纖維 ; Trigeminothalamic tract／視丘徑 ; solitary tract／孤立徑 ; spinoreticular tract／脊髓網狀徑 ; Posterior column–medial lemniscus pathway／後柱—內側丘系路徑 ; Muscle fascicle／肌束 ; Perimysium／肌束膜 ; Intrafusal fiber／梭內肌纖維 ; Nuclear bag fiber／核袋纖維 ; Nuclear chain fiber／核鏈纖維 ; Type II sensory fiber／第二型感覺纖維 ; Extrapyramidal tract／錐體外路徑 ; Pontine (medial) reticulospinal tract／橋腦網狀脊髓徑（內側） ; Medullary (lateral) reticulospinal tract／延腦網狀脊髓徑（外側） ; Lateral vestibulo-spinal tract／外側前庭脊髓徑 ; Medial vestibulo-spinal tract／內側前庭脊髓徑 ; Efferent fibers (cochlear)／傳出纖維（耳蝸） ; Descending auditory pathways／聽覺下降徑

**其他結構（111）**

Olfactory bulb／嗅球 ; Anterior perforated substance／前穿質 ; Posterior perforated substance／後穿質 ; Gray Matter／灰質 ; Conus medullaris／圓錐結節 ; Cauda equina／馬尾 ; Anterior median fissure／前正中裂 ; Posterior median sulcus／後正中溝 ; Posterior horn (dorsal horn)／後角（背角） ; Substantia gelatinosa／膠狀質 ; Lateral horn／側角 ; Thoracolumbar spinal segments (C8–L2)／胸腰髓節（C8–L2） ; Sacral spinal segments (S2–S4)／薦髓節（S2–S4） ; Anterior horn (ventral horn)／前角（腹角） ; Reticular formation／網狀系統 ; Rexed lamination／雷氏分層 ; Intermediate zone／中間帶 ; Columns／灰質柱 ; Funiculi／索 ; Posterior/Dorsal funiculus／背索 ; Anterior/Ventral funiculus／腹索 ; Lateral funiculus／側索 ; Ventral root／腹根 ; Pyramidal cell／錐狀細胞 ; spinal cord／脊髓 ; Posterior cranial fossa／後顱窩 ; Clivus／斜坡 ; Brachium of superior colliculus／上丘臂 ; Brachium of inferior colliculus／下丘臂 ; Rhomboid fossa／菱形窩 ; Gracile tubercle／薄狀結節 ; Cuneate tubercle／楔狀結節 ; Tectum／四疊板 ; Medullary velum／髓帆 ; Sup. medullary velum／上髓帆 ; Inf. medullary velum／下髓帆 ; Striae medullares／髓紋 ; Basal plate／基板 ; Alar plate／翼板 ; Dorsal median sulcus／正中溝 ; sulcus limitans／界溝 ; Tegmentum／背蓋 ; Corona radiata／放射冠 ; Caudal (closed) medulla／延腦尾側（閉鎖部） ; Rostral (open) medulla／延腦吻側（開放部） ; Facial colliculus／顏面丘 ; Trapezoid body／斜方體 ; Substantia nigra, pars compacta／黑質緻密部* ; Substantia nigra, pars reticulata／黑質網狀部* ; Substantia nigra, pars lateralis／黑質外側部* ; Periosteum／外骨膜 ; Cranial bone／顱骨 ; Cervical part (segment 1 of ICA and vertebral artery)／頸段（內頸動脈與椎動脈的第一段） ; Petrous part (ICA segment 2)／內頸動脈岩樣部段 ; Atlantic part (vertebral artery segment 3)／椎動脈寰椎段 ; Cerebral part (ICA segment 4)／內頸動脈大腦段 ; Intracranial part (vertebral artery segment 4)／椎動脈顱內段 ; Optic canal／視神經管 ; Periosteal layer／骨膜層 ; Optic foramen／視神經孔 ; Basilar sulcus／橋腦基底溝 ; Posterolateral sulcus／外側溝 ; Intervertebral foramen／椎間孔 ; Hindbrain (rhombencephalon)／後腦 ; Internal occipital crest／枕內嵴 ; Primary fissure／初級裂 ; Anterior lobe／前葉 ; Cerebellar lobules／小腦小葉 ; Horizontal fissure／水平裂 ; Posterolateral fissure／後外側裂 ; Posterior lobe／後葉 ; Secondary fissure／二級裂 ; Cerebellar folia／小腦葉片 ; Molecular layer／分子層 ; Stellate cells／星狀細胞 ; Basket cells／籃狀細胞 ; Purkinje cell layer／蒲金氏細胞層 ; Purkinje cells／柏金氏細胞 ; Granule cells／顆粒細胞 ; Golgi cells／高基氏細胞 ; Unipolar brush cells／單極刷狀細胞 ; Cerebellar glomerulus／顆粒小球 ; Vestibulocerebellum／前庭小腦 ; Cerebrocerebellum (neocerebellum)／大腦小腦（新小腦） ; Spinocerebellum (paleocerebellum)／脊髓小腦（古小腦） ; juxtarestiform body／近繩狀體 ; Limbic system／邊緣系統 ; Pyramidal cell layer (hippocampus)／海馬錐狀細胞層 ; Polymorphic layer (hippocampus)／海馬多型層 ; Granule cell layer／顆粒細胞層 ; Dorsal intermediate sulcus／背中間溝 ; Meissner’s corpuscle／梅氏小體 ; baroreceptor／壓力接收器 ; Ventrolateral medulla／延腦腹外側區 ; chemoreceptor／化學接受器 ; cranial root／顱根 ; spinal root／脊髓根 ; Auditory system／聽覺系統 ; Vestibular system／前庭系統 ; Pontomedullary junction (caudal pons / rostral medulla)／橋腦延腦交界 ; Inferior vermis／下蚓部 ; Cervical motor neuron／頸髓運動神經元 ; deep gray matter／深層灰質 ; Photoreceptor／眼睛的光受體 ; Watershed area／分水嶺區域 ; Subcortex of cerebrum／大腦皮質下層 ; Scalp／頭皮 ; Pterion／翼點 ; Sella turcica／蝶鞍 ; Anterior clinoid process／前床突 ; Arbor vitae／小腦活樹

**皮質／腦迴／腦溝／腦葉（14）**

Longitudinal fissure／大腦縱裂 ; Frontal pole／額極* ; Visual cortex／視覺皮質* ; Vestibular area／前庭區 ; Piriform lobe／梨狀葉 ; Primary motor cortex／初級運動皮層* ; Dentate gyrus／齒狀迴 ; Cornu ammonis, CA／羊角區 ; Entorhinal cortex／內嗅皮質 ; Uncus／顳葉鉤 ; Premotor cortex／運動前區 ; Supplementary motor area／運動輔助區 ; Cingulate motor areas／扣帶運動區 ; Associational auditory cortex／聽覺聯絡皮質區*

## 八、需使用者決定的項目（頭頸區）

- Superficial cervical lymph nodes（頸淺淋巴結）：需使用者決定（淋巴示意是否要建）
- Deep cervical lymph nodes（頸深淋巴結）：需使用者決定（淋巴示意是否要建）
- Jugular lymphatic trunk（頸淋巴幹）：需使用者決定（淋巴示意是否要建）
- Right lymphatic duct（右淋巴導管）：需使用者決定（淋巴示意是否要建）
- Thoracic duct (cervical part)（胸管（頸段））：需使用者決定（站上有胸管，是否延伸到頸部匯入靜脈角需查）
- Ceruminous glands（耵聹腺）：需使用者決定（組織層級，建議只做資訊卡）
- Investing layer of deep cervical fascia（頸深筋膜包覆層）：需使用者決定（筋膜呈現方式）
- Pretracheal fascia（頸深筋膜氣管前層）：需使用者決定（筋膜呈現方式）
- Prevertebral fascia（頸深筋膜椎前層）：需使用者決定（筋膜呈現方式）
- Carotid sheath（頸動脈鞘）：需使用者決定（筋膜呈現方式）
- Pharyngobasilar fascia（咽顱底筋膜）：需使用者決定（筋膜呈現方式）
- Parotid sheath / parotid space（腮腺鞘／腮腺間隙）：需使用者決定（筋膜呈現方式）
- Temporalis fascia（顳肌筋膜）：需使用者決定（筋膜呈現方式）
- Subdural / subarachnoid / epidural spaces（硬腦膜下、蛛網膜下、硬膜外腔）：已有資訊卡；3D 部分需使用者決定
- Dura mater, arachnoid mater, pia mater（硬腦膜、蛛網膜、軟腦膜）：已有資訊卡；3D 部分需使用者決定
- Cerebellomedullary and suprasellar cisterns（小腦延髓池、鞍上池）：已有資訊卡；3D 部分需使用者決定
- Retropharyngeal space（咽後間隙）：需使用者決定
- Pharynx (nasopharynx, oropharynx, laryngopharynx)（咽（鼻咽、口咽、喉咽））：需使用者決定（空間示意：鼻咽、口咽、喉咽三段是否要建）
- 腦與神經：核團（30 項）是否做示意，建議維持資訊卡。
- 腦與神經：傳導路徑（81 項）是否做示意線條，建議先不做，等神經資料補齊。
- 腦與神經：耳的細胞與膜層級（約 18 項）是否只保留資訊卡，建議是。
- 腦與神經：腦膜與腦池（約 15 項）要做半透明層還是只保留資訊卡。
- 腦與神經：血管深部小分支與其他混合類別（約 140 項）要補建哪些，建議等神經資料補齊後再一起決定。

## 九、補建批次規模估計（等使用者決定，本輪不動模型）

| 批次 | 內容 | 項數（約） | 方式 |
|---|---|---|---|
| 1 外頸動脈及分支 | 上甲狀腺、舌、顏面（含唇動脈、鼻外側）、升咽、枕、耳後、上頷（含各分支）、淺顳、顏面橫、扁桃體、上喉，以及眼眶內與腦膜相關動脈 | 38 | 示意血管，沿既有外頸動脈連接 |
| 2 頭頸靜脈 | 外頸、前頸、顏面、下頷後、淺顳、耳後、眼靜脈、眶上與滑車上、甲狀腺靜脈、導靜脈、鞏膜靜脈竇 | 17 | 示意血管，接到內頸靜脈 |
| 3 腺體與扁桃體 | 腮腺與腮腺管、甲狀腺、副甲狀腺、四種扁桃體、耵聹腺 | 10 | 立體器官（甲狀腺、腮腺為主） |
| 4 神經分支與神經節 | 上頷與下頷神經分支、顏面神經分支、岩神經、鼓室神經叢、副交感與頸交感神經節、頸叢分支、喉神經、咽叢 | 33 | 示意神經，沿既有腦神經主幹 |
| 5 骨性標記 | 頭骨各孔、裂、管、突、窩 | 32 | 骨面標示，不新增網格 |
| 6 筋膜與間隙 | 頸三角各區、翼顎窩、顳下窩、顳窩、頸動脈鞘、筋膜層、腮腺間隙 | 23 | 空間示意（依特殊空間規則），需先決定呈現方式 |
| 7 眼 | 結膜、視盤與黃斑、鋸齒緣、後房、睫狀突與睫狀肌、上瞼板肌 | 6 | 眼詳細模式（#277 之後） |
| 8 耳 | 耳殼、外耳道、耳肌、鐙骨肌與鼓膜張肌、聽小骨與內耳的 3D | 約 12 | 耳詳細模式（#277 之後） |
| 9 咽喉口鼻 | 咽三段、軟顎、顎舌弓與顎咽弓、鼻腔、鼻竇 | 約 8 | 空間示意或立體 |

各批次的項數是「缺」的項目計數，同批次內若逐條建需另估；建議每批完成後再做下一批，每批一個 PR，標【需人工審核】。

## 相關搜尋對應（暫列，待使用者核對）

| 搜尋詞 | 站上最接近的結構 |
|---|---|
| Uvula 懸雍垂 | Uvular muscle 懸雍垂肌 |
| Aryepiglottic fold 杓會厭褶 | Aryepiglotticus 杓會厭肌 |
| Lacrimal ducts 淚管 | Lacrimal canaliculus 淚小管 |
| Neural layer of retina 視網膜神經層 | Optic part of retina 視網膜視部 |
| Occipitofrontalis 額枕肌 | Frontalis 額肌、Occipitalis 枕肌 |
| Danger triangle 顏面危險三角 | 尚無對應結構，待顏面靜脈與眼靜脈補建後指向它們 |
| Brachiocephalic trunk 頭臂動脈幹 | Brachiocephalic artery 頭臂動脈 |
