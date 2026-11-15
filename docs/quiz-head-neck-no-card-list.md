# 頭頸 Quiz：沒有資訊卡文字的結構清單（按第二次實作考試重要性排序）

內部文件，不上網站。只列結構名稱（英文、中文）、所屬分區、類別與建議優先級；沒有任何資訊卡文字或解剖描述，也沒有宣稱任何項目經過解剖核對。

排序說明：

1. 先依優先級分四級：「最高」為中央、體積大、最常被問的構造（腦神經主幹、頸動脈與內頸靜脈、主要顱骨、舌、喉的主要軟骨與氣管），「高」為眼球與眼附屬構造、腺體、咽喉肌、頭頸主要神經分支與顳顎關節，「中」為牙齒、牙齦、唇、韌帶與膜、淚器、鼻軟骨、頸椎椎間盤，「低」為細小、少見或是否列入考試我不確定的構造。
2. 範圍依使用者的第二次考試範圍：頭頸優先，含腦、眼、耳；排序參考 `docs/exam2-headneck-gap.md`、`docs/exam2-headneck-classification.md`、`docs/exam2-owner-decisions.md` 的優先判斷，但那三份檔案列的是站上缺少的結構，本表是站上已有、只缺 Quiz 資訊卡文字的結構，兩者沒有逐項對應，各項優先級是我的判斷。
3. 同一級內大致由中央到外周、由大到小排列；考試實際會不會考、考到多細，我不確定，優先級只供排工作順序，請使用者依自己掌握的範圍調整。

## 數量摘要

資料來源：由 `scripts/prepare-quiz.mjs` 產生的 `quiz-head-neck.json`（435 個構造，左右分開計）與 `app/quiz/card.ts` 的 `structureCard`；「沒有資訊卡文字」指資訊卡所有欄位都顯示「尚無資料」（與 `docs/quiz-head-neck-pool.md` 的「完全沒有資料」同義）。

- 沒有資訊卡文字：266 個構造（左右分開計），合併左右後 147 列（與 pool 報告的 266 相符）。
- 另有 20 個構造只有部分欄位有資料（骨 8、神經 10、動脈 2），不在本表，見 `docs/quiz-card-gaps.md`。
- 器官結構：pool 報告的「頭頸器官構造 111」是系統分類；依 Quiz 類別，其中 89 個是「器官結構」、22 個是「韌帶與筋膜」（舌骨會厭韌帶、甲狀舌骨膜、聲帶韌帶、眼的制止韌帶與水晶體懸韌帶等）。兩個數字都正確，只是分類方式不同。

### 依類別

| 類別 | 構造數（左右分開） | 列數（左右合併） |
| --- | --- | --- |
| 骨 | 28 | 20 |
| 肌肉 | 27 | 14 |
| 神經 | 76 | 38 |
| 動脈 | 10 | 5 |
| 靜脈 | 2 | 1 |
| 韌帶與筋膜 | 22 | 14 |
| 關節 | 12 | 6 |
| 器官結構 | 89 | 49 |
| 合計 | 266 | 147 |

### 依分區

| 分區 | 構造數（左右分開） | 列數（左右合併） |
| --- | --- | --- |
| 顱骨與下頷 | 31 | 18 |
| 頸椎與舌骨 | 9 | 8 |
| 面部與咀嚼肌 | 5 | 3 |
| 頸部肌肉 | 5 | 3 |
| 眼與眼眶 | 42 | 21 |
| 口、鼻、咽與喉 | 86 | 50 |
| 腦神經與頸神經 | 76 | 38 |
| 頭頸血管 | 12 | 6 |
| 合計 | 266 | 147 |

### 依建議優先級

| 優先級 | 列數 |
| --- | --- |
| 1（最高） | 28 |
| 2（高） | 47 |
| 3（中） | 51 |
| 4（低） | 21 |

### 各分區 × 類別（列數）

| 分區 | 骨 | 肌肉 | 神經 | 動脈 | 靜脈 | 韌帶與筋膜 | 關節 | 器官結構 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 顱骨與下頷 | 13 | — | — | — | — | — | 5 | — |
| 頸椎與舌骨 | 7 | — | — | — | — | 1 | — | — |
| 面部與咀嚼肌 | — | 2 | — | — | — | 1 | — | — |
| 頸部肌肉 | — | 3 | — | — | — | — | — | — |
| 眼與眼眶 | — | — | — | — | — | 3 | — | 18 |
| 口、鼻、咽與喉 | — | 9 | — | — | — | 9 | 1 | 31 |
| 腦神經與頸神經 | — | — | 38 | — | — | — | — | — |
| 頭頸血管 | — | — | — | 5 | 1 | — | — | — |

## 清單

類別欄的「骨」包含頸椎椎間盤（Quiz 以骨系統歸類）。兩側欄註明左右是否都有；有左右的合併成一列。

| 序號 | 結構名稱（英文／中文） | 兩側 | 所屬分區 | 類別 | 建議優先級 |
| --- | --- | --- | --- | --- | --- |
| 1 | optic nerve (II)／視神經（第二對腦神經） | 左右兩側 | 腦神經與頸神經 | 神經 | 1（最高） |
| 2 | oculomotor nerve (III)／動眼神經（第三對腦神經） | 左右兩側 | 腦神經與頸神經 | 神經 | 1（最高） |
| 3 | trochlear nerve (IV)／滑車神經（第四對腦神經） | 左右兩側 | 腦神經與頸神經 | 神經 | 1（最高） |
| 4 | trigeminal nerve (V)／三叉神經（第五對腦神經） | 左右兩側 | 腦神經與頸神經 | 神經 | 1（最高） |
| 5 | abducens nerve (VI)／外旋神經（第六對腦神經） | 左右兩側 | 腦神經與頸神經 | 神經 | 1（最高） |
| 6 | facial nerve (VII)／顏面神經（第七對腦神經） | 左右兩側 | 腦神經與頸神經 | 神經 | 1（最高） |
| 7 | vestibulocochlear nerve (VIII)／前庭耳蝸神經（第八對腦神經） | 左右兩側 | 腦神經與頸神經 | 神經 | 1（最高） |
| 8 | glossopharyngeal nerve (IX)／舌咽神經（第九對腦神經） | 左右兩側 | 腦神經與頸神經 | 神經 | 1（最高） |
| 9 | vagus nerve (X)／迷走神經（第十對腦神經） | 左右兩側 | 腦神經與頸神經 | 神經 | 1（最高） |
| 10 | hypoglossal nerve (XII)／舌下神經（第十二對腦神經） | 左右兩側 | 腦神經與頸神經 | 神經 | 1（最高） |
| 11 | olfactory nerve (I)／嗅神經（第一對腦神經） | 左右兩側 | 腦神經與頸神經 | 神經 | 1（最高） |
| 12 | common carotid artery／總頸動脈 | 左右兩側 | 頭頸血管 | 動脈 | 1（最高） |
| 13 | external carotid artery／外頸動脈 | 左右兩側 | 頭頸血管 | 動脈 | 1（最高） |
| 14 | internal carotid artery／內頸動脈 | 左右兩側 | 頭頸血管 | 動脈 | 1（最高） |
| 15 | internal jugular vein／內頸靜脈 | 左右兩側 | 頭頸血管 | 靜脈 | 1（最高） |
| 16 | Frontal bone／額骨 | 單一（正中） | 顱骨與下頷 | 骨 | 1（最高） |
| 17 | Sphenoid bone／蝶骨 | 單一（正中） | 顱骨與下頷 | 骨 | 1（最高） |
| 18 | temporal bone／顳骨 | 左右兩側 | 顱骨與下頷 | 骨 | 1（最高） |
| 19 | Mandible／下頜骨 | 單一（正中） | 顱骨與下頷 | 骨 | 1（最高） |
| 20 | parietal bone／頂骨 | 左右兩側 | 顱骨與下頷 | 骨 | 1（最高） |
| 21 | maxilla／上頜骨 | 左右兩側 | 顱骨與下頷 | 骨 | 1（最高） |
| 22 | zygomatic bone／顴骨 | 左右兩側 | 顱骨與下頷 | 骨 | 1（最高） |
| 23 | Ethmoid／篩骨 | 單一（正中） | 顱骨與下頷 | 骨 | 1（最高） |
| 24 | Tongue／舌 | 單一（正中） | 口、鼻、咽與喉 | 器官結構 | 1（最高） |
| 25 | Thyroid cartilage／甲狀軟骨 | 單一（正中） | 口、鼻、咽與喉 | 器官結構 | 1（最高） |
| 26 | Cricoid cartilage／環狀軟骨 | 單一（正中） | 口、鼻、咽與喉 | 器官結構 | 1（最高） |
| 27 | Epiglottis／會厭 | 單一（正中） | 口、鼻、咽與喉 | 器官結構 | 1（最高） |
| 28 | Trachea／氣管 | 單一（正中） | 口、鼻、咽與喉 | 器官結構 | 1（最高） |
| 29 | ophthalmic nerve／眼神經 | 左右兩側 | 腦神經與頸神經 | 神經 | 2（高） |
| 30 | maxillary nerve／上頷神經 | 左右兩側 | 腦神經與頸神經 | 神經 | 2（高） |
| 31 | cornea／角膜 | 左右兩側 | 眼與眼眶 | 器官結構 | 2（高） |
| 32 | lens／水晶體 | 左右兩側 | 眼與眼眶 | 器官結構 | 2（高） |
| 33 | iris／虹膜 | 左右兩側 | 眼與眼眶 | 器官結構 | 2（高） |
| 34 | sclera／鞏膜 | 左右兩側 | 眼與眼眶 | 器官結構 | 2（高） |
| 35 | choroid／脈絡膜 | 左右兩側 | 眼與眼眶 | 器官結構 | 2（高） |
| 36 | Optic part of retina／視網膜視部 | 左右兩側 | 眼與眼眶 | 器官結構 | 2（高） |
| 37 | vitreous body／玻璃體 | 左右兩側 | 眼與眼眶 | 器官結構 | 2（高） |
| 38 | Anterior chamber of eyeball／眼前房 | 左右兩側 | 眼與眼眶 | 器官結構 | 2（高） |
| 39 | lacrimal gland／淚腺 | 左右兩側 | 眼與眼眶 | 器官結構 | 2（高） |
| 40 | submandibular gland／頷下腺 | 左右兩側 | 口、鼻、咽與喉 | 器官結構 | 2（高） |
| 41 | sublingual gland／舌下腺 | 左右兩側 | 口、鼻、咽與喉 | 器官結構 | 2（高） |
| 42 | superior pharyngeal constrictor／咽上縮肌 | 左右兩側 | 口、鼻、咽與喉 | 肌肉 | 2（高） |
| 43 | middle pharyngeal constrictor／咽中縮肌 | 左右兩側 | 口、鼻、咽與喉 | 肌肉 | 2（高） |
| 44 | inferior pharyngeal constrictor／咽下縮肌 | 左右兩側 | 口、鼻、咽與喉 | 肌肉 | 2（高） |
| 45 | stylopharyngeus／莖突咽肌 | 左右兩側 | 口、鼻、咽與喉 | 肌肉 | 2（高） |
| 46 | palatopharyngeus／腭咽肌 | 左右兩側 | 口、鼻、咽與喉 | 肌肉 | 2（高） |
| 47 | salpingopharyngeus／咽鼓管咽肌 | 左右兩側 | 口、鼻、咽與喉 | 肌肉 | 2（高） |
| 48 | posterior crico-arytenoid／環杓後肌 | 左右兩側 | 口、鼻、咽與喉 | 肌肉 | 2（高） |
| 49 | lateral crico-arytenoid／環杓側肌 | 左右兩側 | 口、鼻、咽與喉 | 肌肉 | 2（高） |
| 50 | thyro-arytenoid／甲杓肌 | 左右兩側 | 口、鼻、咽與喉 | 肌肉 | 2（高） |
| 51 | arytenoid cartilage／杓狀軟骨 | 左右兩側 | 口、鼻、咽與喉 | 器官結構 | 2（高） |
| 52 | ophthalmic artery／眼動脈 | 左右兩側 | 頭頸血管 | 動脈 | 2（高） |
| 53 | inferior thyroid artery／下甲狀腺動脈 | 左右兩側 | 頭頸血管 | 動脈 | 2（高） |
| 54 | Hyoid bone／舌骨 | 單一（正中） | 頸椎與舌骨 | 骨 | 2（高） |
| 55 | palatine bone／顎骨 | 左右兩側 | 顱骨與下頷 | 骨 | 2（高） |
| 56 | nasal bone／鼻骨 | 左右兩側 | 顱骨與下頷 | 骨 | 2（高） |
| 57 | lacrimal bone／淚骨 | 左右兩側 | 顱骨與下頷 | 骨 | 2（高） |
| 58 | inferior nasal concha／下鼻甲 | 左右兩側 | 顱骨與下頷 | 骨 | 2（高） |
| 59 | Vomer／犁骨 | 單一（正中） | 顱骨與下頷 | 骨 | 2（高） |
| 60 | lingual nerve／舌神經 | 左右兩側 | 腦神經與頸神經 | 神經 | 2（高） |
| 61 | inferior alveolar nerve／下齒槽神經 | 左右兩側 | 腦神經與頸神經 | 神經 | 2（高） |
| 62 | mental nerve／頦神經 | 左右兩側 | 腦神經與頸神經 | 神經 | 2（高） |
| 63 | buccal nerve／頰神經 | 左右兩側 | 腦神經與頸神經 | 神經 | 2（高） |
| 64 | anterior division of mandibular nerve／下頷神經前股 | 左右兩側 | 腦神經與頸神經 | 神經 | 2（高） |
| 65 | posterior division of mandibular nerve／下頷神經後股 | 左右兩側 | 腦神經與頸神經 | 神經 | 2（高） |
| 66 | articular capsule of temporomandibular joint／顳顎關節囊 | 左右兩側 | 顱骨與下頷 | 關節 | 2（高） |
| 67 | articular disc of temporomandibular joint／顳顎關節盤 | 左右兩側 | 顱骨與下頷 | 關節 | 2（高） |
| 68 | ciliary ganglion／睫狀神經節 | 左右兩側 | 腦神經與頸神經 | 神經 | 2（高） |
| 69 | nasociliary nerve／鼻睫神經 | 左右兩側 | 腦神經與頸神經 | 神經 | 2（高） |
| 70 | frontal nerve／額神經 | 左右兩側 | 腦神經與頸神經 | 神經 | 2（高） |
| 71 | lacrimal nerve／淚腺神經 | 左右兩側 | 腦神經與頸神經 | 神經 | 2（高） |
| 72 | supra-orbital nerve／眶上神經 | 左右兩側 | 腦神經與頸神經 | 神經 | 2（高） |
| 73 | supratrochlear nerve／滑車上神經 | 左右兩側 | 腦神經與頸神經 | 神經 | 2（高） |
| 74 | Superior branch of oculomotor nerve／動眼神經上支 | 左右兩側 | 腦神經與頸神經 | 神經 | 2（高） |
| 75 | Inferior branch of oculomotor nerve／動眼神經下支 | 左右兩側 | 腦神經與頸神經 | 神經 | 2（高） |
| 76 | upper secondary canine tooth／上顎恆犬齒 | 左右兩側 | 口、鼻、咽與喉 | 器官結構 | 3（中） |
| 77 | lower secondary canine tooth／下顎恆犬齒 | 左右兩側 | 口、鼻、咽與喉 | 器官結構 | 3（中） |
| 78 | upper central secondary incisor tooth／上顎恆中切齒 | 左右兩側 | 口、鼻、咽與喉 | 器官結構 | 3（中） |
| 79 | lower central secondary incisor tooth／下顎恆中切齒 | 左右兩側 | 口、鼻、咽與喉 | 器官結構 | 3（中） |
| 80 | upper lateral secondary incisor tooth／上顎恆側切齒 | 左右兩側 | 口、鼻、咽與喉 | 器官結構 | 3（中） |
| 81 | lower lateral secondary incisor tooth／下顎恆側切齒 | 左右兩側 | 口、鼻、咽與喉 | 器官結構 | 3（中） |
| 82 | upper first secondary premolar tooth／上顎第一恆小臼齒 | 左右兩側 | 口、鼻、咽與喉 | 器官結構 | 3（中） |
| 83 | lower first secondary premolar tooth／下顎第一恆小臼齒 | 左右兩側 | 口、鼻、咽與喉 | 器官結構 | 3（中） |
| 84 | upper second secondary premolar tooth／上顎第二恆小臼齒 | 左右兩側 | 口、鼻、咽與喉 | 器官結構 | 3（中） |
| 85 | lower second secondary premolar tooth／下顎第二恆小臼齒 | 左右兩側 | 口、鼻、咽與喉 | 器官結構 | 3（中） |
| 86 | upper first secondary molar tooth／上顎第一恆大臼齒 | 左右兩側 | 口、鼻、咽與喉 | 器官結構 | 3（中） |
| 87 | lower first secondary molar tooth／下顎第一恆大臼齒 | 左右兩側 | 口、鼻、咽與喉 | 器官結構 | 3（中） |
| 88 | upper second secondary molar tooth／上顎第二恆大臼齒 | 左右兩側 | 口、鼻、咽與喉 | 器官結構 | 3（中） |
| 89 | lower second secondary molar tooth／下顎第二恆大臼齒 | 左右兩側 | 口、鼻、咽與喉 | 器官結構 | 3（中） |
| 90 | Gingiva of upper jaw／上顎牙齦 | 單一（正中） | 口、鼻、咽與喉 | 器官結構 | 3（中） |
| 91 | Gingiva of lower jaw／下顎牙齦 | 單一（正中） | 口、鼻、咽與喉 | 器官結構 | 3（中） |
| 92 | Lip／唇 | 單一（正中） | 口、鼻、咽與喉 | 器官結構 | 3（中） |
| 93 | vestibular nerve／前庭神經 | 左右兩側 | 腦神經與頸神經 | 神經 | 3（中） |
| 94 | cochlear nerve／耳蝸神經 | 左右兩側 | 腦神經與頸神經 | 神經 | 3（中） |
| 95 | vocal ligament／聲帶韌帶 | 左右兩側 | 口、鼻、咽與喉 | 韌帶與筋膜 | 3（中） |
| 96 | thyrohyoid membrane／甲狀舌骨膜 | 左右兩側 | 口、鼻、咽與喉 | 韌帶與筋膜 | 3（中） |
| 97 | stylohyoid ligament／莖突舌骨韌帶 | 左右兩側 | 頸椎與舌骨 | 韌帶與筋膜 | 3（中） |
| 98 | conus elasticus／彈性圓錐 | 左右兩側 | 口、鼻、咽與喉 | 器官結構 | 3（中） |
| 99 | Hyo-epiglottic ligament／舌骨會厭韌帶 | 單一（正中） | 口、鼻、咽與喉 | 韌帶與筋膜 | 3（中） |
| 100 | Thyro-epiglottic ligament／甲狀會厭韌帶 | 單一（正中） | 口、鼻、咽與喉 | 韌帶與筋膜 | 3（中） |
| 101 | Median cricothyroid ligament／環甲正中韌帶 | 單一（正中） | 口、鼻、咽與喉 | 韌帶與筋膜 | 3（中） |
| 102 | Median thyrohyoid ligament／甲狀舌骨正中韌帶 | 單一（正中） | 口、鼻、咽與喉 | 韌帶與筋膜 | 3（中） |
| 103 | lateral thyrohyoid ligament／甲狀舌骨外側韌帶 | 左右兩側 | 口、鼻、咽與喉 | 韌帶與筋膜 | 3（中） |
| 104 | Pharyngeal raphe／咽縫 | 單一（正中） | 口、鼻、咽與喉 | 韌帶與筋膜 | 3（中） |
| 105 | pterygomandibular raphe／翼下頷縫 | 左右兩側 | 口、鼻、咽與喉 | 韌帶與筋膜 | 3（中） |
| 106 | Aponeurosis of epicranius／帽狀腱膜 | 單一（正中） | 面部與咀嚼肌 | 韌帶與筋膜 | 3（中） |
| 107 | sphenomandibular ligament／蝶下頷韌帶 | 左右兩側 | 顱骨與下頷 | 關節 | 3（中） |
| 108 | stylomandibular ligament／莖突下頷韌帶 | 左右兩側 | 顱骨與下頷 | 關節 | 3（中） |
| 109 | lateral temporomandibular ligament／顳顎外側韌帶 | 左右兩側 | 顱骨與下頷 | 關節 | 3（中） |
| 110 | cricopharyngeal ligament／環咽韌帶 | 左右兩側 | 口、鼻、咽與喉 | 關節 | 3（中） |
| 111 | Tarsal plate of upper eyelid／上眼瞼瞼板 | 左右兩側 | 眼與眼眶 | 器官結構 | 3（中） |
| 112 | Tarsal plate of lower eyelid／下眼瞼瞼板 | 左右兩側 | 眼與眼眶 | 器官結構 | 3（中） |
| 113 | common tendinous ring／總腱環 | 左右兩側 | 眼與眼眶 | 器官結構 | 3（中） |
| 114 | lacrimal canaliculus／淚小管 | 左右兩側 | 眼與眼眶 | 器官結構 | 3（中） |
| 115 | lacrimal sac／淚囊 | 左右兩側 | 眼與眼眶 | 器官結構 | 3（中） |
| 116 | nasolacrimal duct／鼻淚管 | 左右兩側 | 眼與眼眶 | 器官結構 | 3（中） |
| 117 | lacrimal lake／淚湖 | 左右兩側 | 眼與眼眶 | 器官結構 | 3（中） |
| 118 | major alar cartilage／大翼軟骨 | 左右兩側 | 口、鼻、咽與喉 | 器官結構 | 3（中） |
| 119 | lateral nasal cartilage／鼻外側軟骨 | 左右兩側 | 口、鼻、咽與喉 | 器官結構 | 3（中） |
| 120 | Septal nasal cartilage／鼻中隔軟骨 | 單一（正中） | 口、鼻、咽與喉 | 器官結構 | 3（中） |
| 121 | Intervertebral disk of seventh cervical vertebra／第七頸椎椎間盤 | 單一（正中） | 頸椎與舌骨 | 骨 | 3（中） |
| 122 | Intervertebral disk of sixth cervical vertebra／第六頸椎椎間盤 | 單一（正中） | 頸椎與舌骨 | 骨 | 3（中） |
| 123 | Intervertebral disk of fifth cervical vertebra／第五頸椎椎間盤 | 單一（正中） | 頸椎與舌骨 | 骨 | 3（中） |
| 124 | Intervertebral disk of fourth cervical vertebra／第四頸椎椎間盤 | 單一（正中） | 頸椎與舌骨 | 骨 | 3（中） |
| 125 | Intervertebral disk of third cervical vertebra／第三頸椎椎間盤 | 單一（正中） | 頸椎與舌骨 | 骨 | 3（中） |
| 126 | Intervertebral disk of axis／第二頸椎椎間盤 | 單一（正中） | 頸椎與舌骨 | 骨 | 3（中） |
| 127 | corona ciliaris／睫狀冠 | 左右兩側 | 眼與眼眶 | 器官結構 | 4（低） |
| 128 | cuneiform cartilage／楔狀軟骨 | 左右兩側 | 口、鼻、咽與喉 | 器官結構 | 4（低） |
| 129 | corniculate cartilage／小角軟骨 | 左右兩側 | 口、鼻、咽與喉 | 器官結構 | 4（低） |
| 130 | Check ligament of lateral rectus／外直肌制止韌帶 | 左右兩側 | 眼與眼眶 | 韌帶與筋膜 | 4（低） |
| 131 | Check ligament of medial rectus／內直肌制止韌帶 | 左右兩側 | 眼與眼眶 | 韌帶與筋膜 | 4（低） |
| 132 | Suspensory ligament of lens／水晶體懸韌帶 | 左右兩側 | 眼與眼眶 | 韌帶與筋膜 | 4（低） |
| 133 | Trochlea of superior oblique／滑車 | 左右兩側 | 眼與眼眶 | 器官結構 | 4（低） |
| 134 | long ciliary nerve／長睫神經 | 左右兩側 | 腦神經與頸神經 | 神經 | 4（低） |
| 135 | short ciliary nerve／短睫神經 | 左右兩側 | 腦神經與頸神經 | 神經 | 4（低） |
| 136 | infratrochlear nerve／滑車下神經 | 左右兩側 | 腦神經與頸神經 | 神經 | 4（低） |
| 137 | posterior ethmoidal nerve／後篩神經 | 左右兩側 | 腦神經與頸神經 | 神經 | 4（低） |
| 138 | anterior ethmoidal nerve／前篩神經 | 左右兩側 | 腦神經與頸神經 | 神經 | 4（低） |
| 139 | sensory root of trigeminal nerve／三叉神經感覺根 | 左右兩側 | 腦神經與頸神經 | 神經 | 4（低） |
| 140 | motor root of trigeminal nerve／三叉神經運動根 | 左右兩側 | 腦神經與頸神經 | 神經 | 4（低） |
| 141 | nerve to mylohyoid muscle／下頷舌骨肌神經 | 左右兩側 | 腦神經與頸神經 | 神經 | 4（低） |
| 142 | meningeal branch of maxillary nerve／上頷神經腦膜支 | 左右兩側 | 腦神經與頸神經 | 神經 | 4（低） |
| 143 | temporoparietalis／顳頂肌 | 左右兩側 | 面部與咀嚼肌 | 肌肉 | 4（低） |
| 144 | depressor septi nasi／降鼻中隔肌 | 左右兩側 | 面部與咀嚼肌 | 肌肉 | 4（低） |
| 145 | set of anterior cervical intertransversarii／頸前橫突間肌群 | 左右兩側 | 頸部肌肉 | 肌肉 | 4（低） |
| 146 | set of interspinales cervicis／頸棘間肌群 | 單一（正中） | 頸部肌肉 | 肌肉 | 4（低） |
| 147 | set of posterior cervical intertransversarii／頸後橫突間肌群 | 左右兩側 | 頸部肌肉 | 肌肉 | 4（低） |

## 不確定與限制

- 優先級是依「中央、大、常考」的一般判斷，不是從實際考題範圍得來；牙齒、椎間盤、淚器、鼻軟骨等是否要考到這個細度，我不確定。
- 本表只列「有 Quiz 結構、卻沒有資訊卡文字」的項目；站上完全缺少的結構見 `docs/exam2-headneck-gap.md`。
- 英文名稱照 Quiz 資料原樣，沒有逐項核對；左右合併時以名稱去掉 left／right 為準。
- 資料卡文字之後由使用者自行填寫，本檔不提供也不暗示任何內容。
