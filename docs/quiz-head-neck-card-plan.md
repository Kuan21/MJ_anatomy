# 頭頸 Quiz 資訊卡寫作計畫（必寫／考試後、批次）

內部文件，不上網站。只列結構名稱與欄位名稱、分類與批次；沒有任何資訊卡文字或解剖描述，也不宣稱任何項目已核對。資料來源：`docs/quiz-head-neck-no-card-list.md`（PR #313 分支，內容為 147 列、266 個構造，左右分開計）、`docs/quiz-card-gaps.md` 頭頸段（另有 20 個構造只有部分欄位，合併左右後 14 列）、`docs/required-structures/head-neck.json` 與 `aliases.json`、`scripts/lib/required-match.mjs` 的比對函式。

## 一、規則與判定方式

使用者的新排序規則：頭頸筆記有提到的結構為「必寫」，依筆記出現次序與重要性排序；筆記沒有提到的（牙齒、頸椎椎間盤、鼻軟骨等不確定項目）為「考試後」。本計畫的判定如下。

- 必寫：結構英文名（含括號別名）與必備清單 `head-neck.json` 正規化後相同，或在 `aliases.json` 的 `synonym` 別名表內。
- 必寫？（不確定，需使用者決定）：只有上位總稱出現在清單（例如清單只有 Canine、Incisor、Molar、Premolar、Cervical vertebrae、Retina、Tarsal plate、Trochlea），或只有中文名相符。這類逐項是否在筆記內，無法從名稱清單判斷。
- 考試後：必備清單完全找不到（含別名與總稱）。
- 必備清單只含名稱，不含出現次序，所以「必寫」是「名稱有出現」，不是「筆記內多重要」。

## 二、筆記出現次序能否確立：不能

`scripts/build-required-structures.mjs` 把多份名稱清單合併後，**依正規化英文名的字母順序**排序並依序編 `RS-0001…`（`Abducens nerve` 是 RS-0001，`Accessory meningeal artery` 是 RS-0002，之後新增者往後追加）。所以 RS 編號是**字母順序，不是筆記順序**；檔案也沒有頁碼、日期或段落欄位，只有五個主題標籤（眼耳口、顱腦鼻、顳下顎、頸咽氣食、面腮頭皮）。因此：

- 「筆記出現次序」欄一律寫「無法確認」。
- 表內排序以兩個代理訂：先必寫、再必寫？、最後考試後；同組內依 PR #313 清單的重要性優先級（1 最高至 4 低），同級再依該清單原次序。RS 編號與主題標籤只作對照，不代表筆記次序。
- 要真正依筆記次序，需要筆記文字版（見第六節）。

## 三、數量摘要

合計 161 列（147 列完全沒有卡片文字 + 14 列只有部分欄位）。必寫 106、必寫？（不確定）21、考試後 34。左右分開計的構造數：必寫 192、不確定 38、考試後 56，合計 286（266 + 20 = 286）。

| 類別 | 列數 | 必寫 | 必寫？ | 考試後 | 其中只缺部分欄位 |
| --- | --- | --- | --- | --- | --- |
| 骨 | 28 | 18 | 4 | 6 | 8 |
| 肌肉 | 14 | 7 | 0 | 7 | 0 |
| 神經 | 43 | 39 | 0 | 4 | 5 |
| 動脈 | 6 | 5 | 0 | 1 | 1 |
| 靜脈 | 1 | 1 | 0 | 0 | 0 |
| 韌帶與筋膜 | 14 | 6 | 0 | 8 | 0 |
| 關節 | 6 | 5 | 0 | 1 | 0 |
| 器官結構 | 49 | 25 | 17 | 7 | 0 |
| 合計 | 161 | 106 | 21 | 34 | 14 |

對應必備清單：127 列（79%）在清單內找得到對應，其中 106 列為英文名或同義別名相符，21 列只是總稱或中文名相符，不確定；其餘 34 列在清單內找不到。「必寫？」逐項如下（牙齒 12 列、頸椎 4 列另有同一原因）：

- Optic part of retina（視網膜視部）→ Retina RS-0691：只有 Retina 出現（視部是其部分）
- upper secondary canine tooth（上顎恆犬齒）→ Canine RS-0086：只有牙的類別總稱出現（逐顆未出現）
- lower secondary canine tooth（下顎恆犬齒）→ Canine RS-0086：只有牙的類別總稱出現（逐顆未出現）
- upper central secondary incisor tooth（上顎恆中切齒）→ Incisor RS-0310：只有牙的類別總稱出現（逐顆未出現）
- lower central secondary incisor tooth（下顎恆中切齒）→ Incisor RS-0310：只有牙的類別總稱出現（逐顆未出現）
- upper lateral secondary incisor tooth（上顎恆側切齒）→ Incisor RS-0310：只有牙的類別總稱出現（逐顆未出現）
- lower lateral secondary incisor tooth（下顎恆側切齒）→ Incisor RS-0310：只有牙的類別總稱出現（逐顆未出現）
- upper first secondary premolar tooth（上顎第一恆小臼齒）→ Premolar RS-0663：只有牙的類別總稱出現（逐顆未出現）
- lower first secondary premolar tooth（下顎第一恆小臼齒）→ Premolar RS-0663：只有牙的類別總稱出現（逐顆未出現）
- upper second secondary premolar tooth（上顎第二恆小臼齒）→ Premolar RS-0663：只有牙的類別總稱出現（逐顆未出現）
- lower second secondary premolar tooth（下顎第二恆小臼齒）→ Premolar RS-0663：只有牙的類別總稱出現（逐顆未出現）
- upper first secondary molar tooth（上顎第一恆大臼齒）→ Molar RS-0498：只有牙的類別總稱出現（逐顆未出現）
- lower first secondary molar tooth（下顎第一恆大臼齒）→ Molar RS-0498：只有牙的類別總稱出現（逐顆未出現）
- upper second secondary molar tooth（上顎第二恆大臼齒）→ Molar RS-0498：只有牙的類別總稱出現（逐顆未出現）
- lower second secondary molar tooth（下顎第二恆大臼齒）→ Molar RS-0498：只有牙的類別總稱出現（逐顆未出現）
- Tarsal plate of upper eyelid（上眼瞼瞼板）→ Tarsal plate RS-0839：成員別名（總稱，不確定）
- Trochlea of superior oblique（滑車）→ Trochlea RS-0893：成員別名（總稱，不確定）
- Third cervical vertebra（第三頸椎）→ Cervical vertebrae RS-0117：只有 Cervical vertebrae 總稱出現
- Fourth cervical vertebra（第四頸椎）→ Cervical vertebrae RS-0117：只有 Cervical vertebrae 總稱出現
- Fifth cervical vertebra（第五頸椎）→ Cervical vertebrae RS-0117：只有 Cervical vertebrae 總稱出現
- Sixth cervical vertebra（第六頸椎）→ Cervical vertebrae RS-0117：只有 Cervical vertebrae 總稱出現

與使用者預期有出入處：他舉例牙齒為考試後。清單內有牙的類別總稱（犬齒、門齒、前臼齒、臼齒、恆齒、乳齒），但沒有逐顆的名稱，因此 12 顆逐顆恆齒標為「必寫？」，請使用者決定是整組放考試後，或只寫四個類別各一張卡。頸椎椎間盤（6 列）、聲帶韌帶、甲狀舌骨膜與其他喉部韌帶、環杓後肌、環杓側肌、甲杓肌、牙齦、淚湖、第三枕神經與枕下神經（兩者只缺「主要分支」）等，清單內都找不到，為考試後。

## 四、批次建議

每批約 25–30 個結構、同一類別，必寫優先；所有「必寫」批次完成後才做「必寫？」與「考試後」，最後做「選補欄位」。下表批次編號是按類別次序流水編號，實際執行次序請見下方建議。

| 批次 | 類別 | 分組 | 列數 | 該批第一項 |
| --- | --- | --- | --- | --- |
| B01 | 骨 | 必寫 | 14 | Frontal bone |
| B02 | 骨 | 考試後 | 6 | Intervertebral disk of seventh cervical vertebra |
| B03 | 骨 | 選補欄位 | 8 | Seventh cervical vertebra |
| B04 | 肌肉 | 必寫 | 7 | superior pharyngeal constrictor |
| B05 | 肌肉 | 考試後 | 7 | posterior crico-arytenoid |
| B06 | 神經 | 必寫 | 28 | optic nerve (II) |
| B07 | 神經 | 必寫 | 8 | cochlear nerve |
| B08 | 神經 | 考試後 | 2 | sensory root of trigeminal nerve |
| B09 | 神經 | 選補欄位 | 5 | greater occipital nerve |
| B10 | 動脈 | 必寫 | 5 | common carotid artery |
| B11 | 動脈 | 選補欄位 | 1 | superficial cervical artery |
| B12 | 靜脈 | 必寫 | 1 | internal jugular vein |
| B13 | 韌帶與筋膜 | 必寫 | 6 | stylohyoid ligament |
| B14 | 韌帶與筋膜 | 考試後 | 8 | vocal ligament |
| B15 | 關節 | 必寫 | 5 | articular capsule of temporomandibular joint |
| B16 | 關節 | 考試後 | 1 | cricopharyngeal ligament |
| B17 | 器官結構 | 必寫 | 25 | Tongue |
| B18 | 器官結構 | 必寫？ | 17 | Optic part of retina |
| B19 | 器官結構 | 考試後 | 7 | Gingiva of upper jaw |

建議的實際工作次序：先做必寫批次 B01（骨）、B04（肌肉）、B06（神經）、B07（神經）、B10（動脈）、B12（靜脈）、B13（韌帶與筋膜）、B15（關節）、B17（器官結構）；再做各類別的「必寫？」批次、「考試後」批次、最後「選補欄位」。每批一個 PR，卡片文字用自己的話撰寫，依 CLAUDE.md 的解剖核對規則（Gray 1918、OpenStax）；使用者最後人工核對。

## 五、逐項清單（依類別）

欄位說明：缺哪些欄位是使用者指定欄位（骨 位置、重要標誌、關節；肌肉 起止點、神經、作用；神經 來源、走向、支配；血管 來源、走向、供應範圍／引流範圍；韌帶與筋膜 附著、作用；器官結構 位置、組成、毗鄰）。這些欄位與現行 Quiz 卡欄位（`app/quiz/card.ts` 的 `FIELDS`）不完全相同，例如現行骨卡是「主要標誌、相關關節、附著肌肉」，實作時要對齊 `app/quiz/card-data.ts`（`CARD_EXTRAS`，以小寫英文名、不含 left／right 為鍵）的欄位。「無法確認」表示筆記出現次序不能由資料導出。

### 骨（28 列；使用者欄位：位置、重要標誌、關節）

| 序號 | 英文名 | 中文名 | 缺哪些欄位 | 分類 | 筆記出現次序 | RS 編號（代理） | 主題標籤 | 批次 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Frontal bone | 額骨 | 位置、重要標誌、關節 | 必寫 | 無法確認 | RS-0256 | 眼耳口、顱腦鼻、顳下顎 | B01 |
| 2 | Sphenoid bone | 蝶骨 | 位置、重要標誌、關節 | 必寫 | 無法確認 | RS-0731 | 顱腦鼻、顳下顎 | B01 |
| 3 | temporal bone | 顳骨 | 位置、重要標誌、關節 | 必寫 | 無法確認 | RS-0842 | 顱腦鼻、顳下顎 | B01 |
| 4 | Mandible | 下頜骨 | 位置、重要標誌、關節 | 必寫 | 無法確認 | RS-0440 | 頸咽氣食、顱腦鼻、顳下顎 | B01 |
| 5 | parietal bone | 頂骨 | 位置、重要標誌、關節 | 必寫 | 無法確認 | RS-0589 | 顱腦鼻 | B01 |
| 6 | maxilla | 上頜骨 | 位置、重要標誌、關節 | 必寫 | 無法確認 | RS-0455 | 眼耳口、顱腦鼻、顳下顎 | B01 |
| 7 | zygomatic bone | 顴骨 | 位置、重要標誌、關節 | 必寫 | 無法確認 | RS-0922 | 眼耳口、顱腦鼻、顳下顎 | B01 |
| 8 | Ethmoid | 篩骨 | 位置、重要標誌、關節 | 必寫 | 無法確認 | RS-0217 | 眼耳口、顱腦鼻 | B01 |
| 9 | Hyoid bone | 舌骨 | 位置、重要標誌、關節 | 必寫 | 無法確認 | RS-0303 | 眼耳口、頸咽氣食 | B01 |
| 10 | palatine bone | 顎骨 | 位置、重要標誌、關節 | 必寫 | 無法確認 | RS-0573 | 眼耳口、顱腦鼻、顳下顎 | B01 |
| 11 | nasal bone | 鼻骨 | 位置、重要標誌、關節 | 必寫 | 無法確認 | RS-0502 | 眼耳口、顱腦鼻 | B01 |
| 12 | lacrimal bone | 淚骨 | 位置、重要標誌、關節 | 必寫 | 無法確認 | RS-0378 | 眼耳口、顱腦鼻 | B01 |
| 13 | inferior nasal concha | 下鼻甲 | 位置、重要標誌、關節 | 必寫 | 無法確認 | RS-0323 | 顱腦鼻 | B01 |
| 14 | Vomer | 犁骨 | 位置、重要標誌、關節 | 必寫 | 無法確認 | RS-0918 | 顱腦鼻 | B01 |
| 15 | Intervertebral disk of seventh cervical vertebra | 第七頸椎椎間盤 | 位置、重要標誌、關節 | 考試後 | 無法確認 | — | — | B02 |
| 16 | Intervertebral disk of sixth cervical vertebra | 第六頸椎椎間盤 | 位置、重要標誌、關節 | 考試後 | 無法確認 | — | — | B02 |
| 17 | Intervertebral disk of fifth cervical vertebra | 第五頸椎椎間盤 | 位置、重要標誌、關節 | 考試後 | 無法確認 | — | — | B02 |
| 18 | Intervertebral disk of fourth cervical vertebra | 第四頸椎椎間盤 | 位置、重要標誌、關節 | 考試後 | 無法確認 | — | — | B02 |
| 19 | Intervertebral disk of third cervical vertebra | 第三頸椎椎間盤 | 位置、重要標誌、關節 | 考試後 | 無法確認 | — | — | B02 |
| 20 | Intervertebral disk of axis | 第二頸椎椎間盤 | 位置、重要標誌、關節 | 考試後 | 無法確認 | — | — | B02 |
| 21 | Seventh cervical vertebra | 第七頸椎 | 位置（Quiz 卡已有重要標誌與關節，另缺「附著肌肉」，不在使用者欄位內） | 必寫 | 無法確認 | RS-0909 | 頸咽氣食 | B03 |
| 22 | Atlas | 寰椎 | 位置（Quiz 卡已有重要標誌與關節，另缺「附著肌肉」，不在使用者欄位內） | 必寫 | 無法確認 | RS-0058 | 頸咽氣食 | B03 |
| 23 | Axis | 樞椎 | 位置（Quiz 卡已有重要標誌與關節，另缺「附著肌肉」，不在使用者欄位內） | 必寫 | 無法確認 | RS-0065 | 頸咽氣食 | B03 |
| 24 | Occipital bone | 枕骨 | 位置（Quiz 卡已有重要標誌與關節，另缺「附著肌肉」，不在使用者欄位內） | 必寫 | 無法確認 | RS-0528 | 顱腦鼻 | B03 |
| 25 | Third cervical vertebra | 第三頸椎 | 位置（Quiz 卡已有重要標誌與關節，另缺「附著肌肉」，不在使用者欄位內） | 必寫？（不確定）：只有 Cervical vertebrae 總稱出現 | 無法確認 | RS-0117 | 頸咽氣食 | B03 |
| 26 | Fourth cervical vertebra | 第四頸椎 | 位置（Quiz 卡已有重要標誌與關節，另缺「附著肌肉」，不在使用者欄位內） | 必寫？（不確定）：只有 Cervical vertebrae 總稱出現 | 無法確認 | RS-0117 | 頸咽氣食 | B03 |
| 27 | Fifth cervical vertebra | 第五頸椎 | 位置（Quiz 卡已有重要標誌與關節，另缺「附著肌肉」，不在使用者欄位內） | 必寫？（不確定）：只有 Cervical vertebrae 總稱出現 | 無法確認 | RS-0117 | 頸咽氣食 | B03 |
| 28 | Sixth cervical vertebra | 第六頸椎 | 位置（Quiz 卡已有重要標誌與關節，另缺「附著肌肉」，不在使用者欄位內） | 必寫？（不確定）：只有 Cervical vertebrae 總稱出現 | 無法確認 | RS-0117 | 頸咽氣食 | B03 |

### 肌肉（14 列；使用者欄位：起止點、神經、作用）

| 序號 | 英文名 | 中文名 | 缺哪些欄位 | 分類 | 筆記出現次序 | RS 編號（代理） | 主題標籤 | 批次 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | superior pharyngeal constrictor | 咽上縮肌 | 起止點、神經、作用 | 必寫 | 無法確認 | RS-0810 | 頸咽氣食 | B04 |
| 2 | middle pharyngeal constrictor | 咽中縮肌 | 起止點、神經、作用 | 必寫 | 無法確認 | RS-0491 | 頸咽氣食 | B04 |
| 3 | inferior pharyngeal constrictor | 咽下縮肌 | 起止點、神經、作用 | 必寫 | 無法確認 | RS-0330 | 頸咽氣食 | B04 |
| 4 | stylopharyngeus | 莖突咽肌 | 起止點、神經、作用 | 必寫 | 無法確認 | RS-0762 | 眼耳口、頸咽氣食 | B04 |
| 5 | palatopharyngeus | 腭咽肌 | 起止點、神經、作用 | 必寫 | 無法確認 | RS-0581 | 眼耳口、頸咽氣食 | B04 |
| 6 | salpingopharyngeus | 咽鼓管咽肌 | 起止點、神經、作用 | 必寫 | 無法確認 | RS-0704 | 頸咽氣食 | B04 |
| 7 | depressor septi nasi | 降鼻中隔肌 | 起止點、神經、作用 | 必寫 | 無法確認 | RS-0188 | 面腮頭皮 | B04 |
| 8 | posterior crico-arytenoid | 環杓後肌 | 起止點、神經、作用 | 考試後 | 無法確認 | — | — | B05 |
| 9 | lateral crico-arytenoid | 環杓側肌 | 起止點、神經、作用 | 考試後 | 無法確認 | — | — | B05 |
| 10 | thyro-arytenoid | 甲杓肌 | 起止點、神經、作用 | 考試後 | 無法確認 | — | — | B05 |
| 11 | temporoparietalis | 顳頂肌 | 起止點、神經、作用 | 考試後 | 無法確認 | — | — | B05 |
| 12 | set of anterior cervical intertransversarii | 頸前橫突間肌群 | 起止點、神經、作用 | 考試後 | 無法確認 | — | — | B05 |
| 13 | set of interspinales cervicis | 頸棘間肌群 | 起止點、神經、作用 | 考試後 | 無法確認 | — | — | B05 |
| 14 | set of posterior cervical intertransversarii | 頸後橫突間肌群 | 起止點、神經、作用 | 考試後 | 無法確認 | — | — | B05 |

### 神經（43 列；使用者欄位：來源、走向、支配）

| 序號 | 英文名 | 中文名 | 缺哪些欄位 | 分類 | 筆記出現次序 | RS 編號（代理） | 主題標籤 | 批次 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | optic nerve (II) | 視神經（第二對腦神經） | 來源、走向、支配 | 必寫 | 無法確認 | RS-0549 | 眼耳口、顱腦鼻 | B06 |
| 2 | oculomotor nerve (III) | 動眼神經（第三對腦神經） | 來源、走向、支配 | 必寫 | 無法確認 | RS-0535 | 眼耳口、顱腦鼻 | B06 |
| 3 | trochlear nerve (IV) | 滑車神經（第四對腦神經） | 來源、走向、支配 | 必寫 | 無法確認 | RS-0894 | 眼耳口、顱腦鼻 | B06 |
| 4 | trigeminal nerve (V) | 三叉神經（第五對腦神經） | 來源、走向、支配 | 必寫 | 無法確認 | RS-0892 | 面腮頭皮、顱腦鼻、顳下顎 | B06 |
| 5 | abducens nerve (VI) | 外旋神經（第六對腦神經） | 來源、走向、支配 | 必寫 | 無法確認 | RS-0001 | 眼耳口、顱腦鼻 | B06 |
| 6 | facial nerve (VII) | 顏面神經（第七對腦神經） | 來源、走向、支配 | 必寫 | 無法確認 | RS-0234 | 眼耳口、面腮頭皮、顱腦鼻、顳下顎 | B06 |
| 7 | vestibulocochlear nerve (VIII) | 前庭耳蝸神經（第八對腦神經） | 來源、走向、支配 | 必寫 | 無法確認 | RS-0915 | 眼耳口、顱腦鼻 | B06 |
| 8 | glossopharyngeal nerve (IX) | 舌咽神經（第九對腦神經） | 來源、走向、支配 | 必寫 | 無法確認 | RS-0273 | 眼耳口、面腮頭皮、頸咽氣食、顱腦鼻、顳下顎 | B06 |
| 9 | vagus nerve (X) | 迷走神經（第十對腦神經） | 來源、走向、支配 | 必寫 | 無法確認 | RS-0904 | 眼耳口、頸咽氣食、顱腦鼻 | B06 |
| 10 | hypoglossal nerve (XII) | 舌下神經（第十二對腦神經） | 來源、走向、支配 | 必寫 | 無法確認 | RS-0305 | 眼耳口、頸咽氣食、顱腦鼻 | B06 |
| 11 | olfactory nerve (I) | 嗅神經（第一對腦神經） | 來源、走向、支配 | 必寫 | 無法確認 | RS-0537 | 顱腦鼻 | B06 |
| 12 | ophthalmic nerve | 眼神經 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0544 | 眼耳口、面腮頭皮、顱腦鼻、顳下顎 | B06 |
| 13 | maxillary nerve | 上頷神經 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0458 | 眼耳口、面腮頭皮、顱腦鼻、顳下顎 | B06 |
| 14 | lingual nerve | 舌神經 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0424 | 眼耳口、顳下顎 | B06 |
| 15 | inferior alveolar nerve | 下齒槽神經 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0313 | 眼耳口、顳下顎 | B06 |
| 16 | mental nerve | 頦神經 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0477 | 眼耳口、面腮頭皮、顳下顎 | B06 |
| 17 | buccal nerve | 頰神經 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0081 | 面腮頭皮、顳下顎 | B06 |
| 18 | anterior division of mandibular nerve | 下頷神經前股 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0024 | 顳下顎 | B06 |
| 19 | posterior division of mandibular nerve | 下頷神經後股 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0648 | 顳下顎 | B06 |
| 20 | ciliary ganglion | 睫狀神經節 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0128 | 眼耳口 | B06 |
| 21 | nasociliary nerve | 鼻睫神經 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0509 | 眼耳口、顱腦鼻 | B06 |
| 22 | frontal nerve | 額神經 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0261 | 眼耳口 | B06 |
| 23 | lacrimal nerve | 淚腺神經 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0382 | 眼耳口、顳下顎 | B06 |
| 24 | supra-orbital nerve | 眶上神經 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0824 | 眼耳口、面腮頭皮 | B06 |
| 25 | supratrochlear nerve | 滑車上神經 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0830 | 眼耳口、面腮頭皮 | B06 |
| 26 | Superior branch of oculomotor nerve | 動眼神經上支 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0794 | 眼耳口 | B06 |
| 27 | Inferior branch of oculomotor nerve | 動眼神經下支 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0316 | 眼耳口 | B06 |
| 28 | vestibular nerve | 前庭神經 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0913 | 眼耳口 | B06 |
| 29 | cochlear nerve | 耳蝸神經 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0137 | 眼耳口 | B07 |
| 30 | long ciliary nerve | 長睫神經 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0430 | 眼耳口 | B07 |
| 31 | short ciliary nerve | 短睫神經 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0720 | 眼耳口 | B07 |
| 32 | infratrochlear nerve | 滑車下神經 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0346 | 眼耳口 | B07 |
| 33 | posterior ethmoidal nerve | 後篩神經 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0651 | 眼耳口、顱腦鼻 | B07 |
| 34 | anterior ethmoidal nerve | 前篩神經 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0027 | 眼耳口、顱腦鼻 | B07 |
| 35 | nerve to mylohyoid muscle | 下頷舌骨肌神經 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0501 | 顳下顎 | B07 |
| 36 | meningeal branch of maxillary nerve | 上頷神經腦膜支 | 來源、走向、支配 | 必寫 | 無法確認 | RS-0469 | 顳下顎 | B07 |
| 37 | sensory root of trigeminal nerve | 三叉神經感覺根 | 來源、走向、支配 | 考試後 | 無法確認 | — | — | B08 |
| 38 | motor root of trigeminal nerve | 三叉神經運動根 | 來源、走向、支配 | 考試後 | 無法確認 | — | — | B08 |
| 39 | greater occipital nerve | 枕大神經 | 使用者欄位已齊；Quiz 卡另缺「主要分支」（可選補） | 必寫 | 無法確認 | RS-0279 | 面腮頭皮 | B09 |
| 40 | lesser occipital nerve | 枕小神經 | 使用者欄位已齊；Quiz 卡另缺「主要分支」（可選補） | 必寫 | 無法確認 | RS-0407 | 眼耳口、面腮頭皮、頸咽氣食 | B09 |
| 41 | great auricular nerve | 耳大神經 | 使用者欄位已齊；Quiz 卡另缺「主要分支」（可選補） | 必寫 | 無法確認 | RS-0275 | 眼耳口、面腮頭皮、顳下顎 | B09 |
| 42 | suboccipital nerve | 枕下神經 | 使用者欄位已齊；Quiz 卡另缺「主要分支」（可選補） | 考試後 | 無法確認 | — | — | B09 |
| 43 | third occipital nerve | 第三枕神經 | 使用者欄位已齊；Quiz 卡另缺「主要分支」（可選補） | 考試後 | 無法確認 | — | — | B09 |

### 動脈（6 列；使用者欄位：來源、走向、供應範圍）

| 序號 | 英文名 | 中文名 | 缺哪些欄位 | 分類 | 筆記出現次序 | RS 編號（代理） | 主題標籤 | 批次 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | common carotid artery | 總頸動脈 | 來源、走向、供應範圍 | 必寫 | 無法確認 | RS-0140 | 頸咽氣食、顱腦鼻 | B10 |
| 2 | external carotid artery | 外頸動脈 | 來源、走向、供應範圍 | 必寫 | 無法確認 | RS-0222 | 眼耳口、面腮頭皮、頸咽氣食、顱腦鼻、顳下顎 | B10 |
| 3 | internal carotid artery | 內頸動脈 | 來源、走向、供應範圍 | 必寫 | 無法確認 | RS-0356 | 眼耳口、面腮頭皮、頸咽氣食、顱腦鼻、顳下顎 | B10 |
| 4 | ophthalmic artery | 眼動脈 | 來源、走向、供應範圍 | 必寫 | 無法確認 | RS-0543 | 眼耳口、顱腦鼻 | B10 |
| 5 | inferior thyroid artery | 下甲狀腺動脈 | 來源、走向、供應範圍 | 必寫 | 無法確認 | RS-0334 | 頸咽氣食 | B10 |
| 6 | superficial cervical artery | 頸淺動脈 | 使用者欄位已齊；Quiz 卡另缺「主要分支」（可選補） | 考試後 | 無法確認 | — | — | B11 |

### 靜脈（1 列；使用者欄位：來源、走向、引流範圍）

| 序號 | 英文名 | 中文名 | 缺哪些欄位 | 分類 | 筆記出現次序 | RS 編號（代理） | 主題標籤 | 批次 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | internal jugular vein | 內頸靜脈 | 來源、走向、引流範圍 | 必寫 | 無法確認 | RS-0358 | 眼耳口、面腮頭皮、頸咽氣食、顱腦鼻 | B12 |

### 韌帶與筋膜（14 列；使用者欄位：附著、作用）

| 序號 | 英文名 | 中文名 | 缺哪些欄位 | 分類 | 筆記出現次序 | RS 編號（代理） | 主題標籤 | 批次 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | stylohyoid ligament | 莖突舌骨韌帶 | 附著、作用 | 必寫 | 無法確認 | RS-0757 | 眼耳口、頸咽氣食 | B13 |
| 2 | Median cricothyroid ligament | 環甲正中韌帶 | 附著、作用 | 必寫 | 無法確認 | RS-0165 | 頸咽氣食 | B13 |
| 3 | Pharyngeal raphe | 咽縫 | 附著、作用 | 必寫 | 無法確認 | RS-0618 | 頸咽氣食 | B13 |
| 4 | pterygomandibular raphe | 翼下頷縫 | 附著、作用 | 必寫 | 無法確認 | RS-0680 | 頸咽氣食 | B13 |
| 5 | Aponeurosis of epicranius | 帽狀腱膜 | 附著、作用 | 必寫 | 無法確認 | RS-0209 | 面腮頭皮 | B13 |
| 6 | Suspensory ligament of lens | 水晶體懸韌帶 | 附著、作用 | 必寫 | 無法確認 | RS-0833 | 眼耳口 | B13 |
| 7 | vocal ligament | 聲帶韌帶 | 附著、作用 | 考試後 | 無法確認 | — | — | B14 |
| 8 | thyrohyoid membrane | 甲狀舌骨膜 | 附著、作用 | 考試後 | 無法確認 | — | — | B14 |
| 9 | Hyo-epiglottic ligament | 舌骨會厭韌帶 | 附著、作用 | 考試後 | 無法確認 | — | — | B14 |
| 10 | Thyro-epiglottic ligament | 甲狀會厭韌帶 | 附著、作用 | 考試後 | 無法確認 | — | — | B14 |
| 11 | Median thyrohyoid ligament | 甲狀舌骨正中韌帶 | 附著、作用 | 考試後 | 無法確認 | — | — | B14 |
| 12 | lateral thyrohyoid ligament | 甲狀舌骨外側韌帶 | 附著、作用 | 考試後 | 無法確認 | — | — | B14 |
| 13 | Check ligament of lateral rectus | 外直肌制止韌帶 | 附著、作用 | 考試後 | 無法確認 | — | — | B14 |
| 14 | Check ligament of medial rectus | 內直肌制止韌帶 | 附著、作用 | 考試後 | 無法確認 | — | — | B14 |

### 關節（6 列；使用者欄位：（使用者未指定；暫用卡片欄位：所屬關節、附著與連結、功能））

| 序號 | 英文名 | 中文名 | 缺哪些欄位 | 分類 | 筆記出現次序 | RS 編號（代理） | 主題標籤 | 批次 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | articular capsule of temporomandibular joint | 顳顎關節囊 | （使用者未指定；暫用卡片欄位：所屬關節、附著與連結、功能） | 必寫 | 無法確認 | RS-0869 | 顳下顎 | B15 |
| 2 | articular disc of temporomandibular joint | 顳顎關節盤 | （使用者未指定；暫用卡片欄位：所屬關節、附著與連結、功能） | 必寫 | 無法確認 | RS-0050 | 顳下顎 | B15 |
| 3 | sphenomandibular ligament | 蝶下頷韌帶 | （使用者未指定；暫用卡片欄位：所屬關節、附著與連結、功能） | 必寫 | 無法確認 | RS-0733 | 顳下顎 | B15 |
| 4 | stylomandibular ligament | 莖突下頷韌帶 | （使用者未指定；暫用卡片欄位：所屬關節、附著與連結、功能） | 必寫 | 無法確認 | RS-0759 | 顳下顎 | B15 |
| 5 | lateral temporomandibular ligament | 顳顎外側韌帶 | （使用者未指定；暫用卡片欄位：所屬關節、附著與連結、功能） | 必寫 | 無法確認 | RS-0852 | 顳下顎 | B15 |
| 6 | cricopharyngeal ligament | 環咽韌帶 | （使用者未指定；暫用卡片欄位：所屬關節、附著與連結、功能） | 考試後 | 無法確認 | — | — | B16 |

### 器官結構（49 列；使用者欄位：位置、組成、毗鄰）

| 序號 | 英文名 | 中文名 | 缺哪些欄位 | 分類 | 筆記出現次序 | RS 編號（代理） | 主題標籤 | 批次 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Tongue | 舌 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0871 | 眼耳口 | B17 |
| 2 | Thyroid cartilage | 甲狀軟骨 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0865 | 頸咽氣食 | B17 |
| 3 | Cricoid cartilage | 環狀軟骨 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0161 | 頸咽氣食 | B17 |
| 4 | Epiglottis | 會厭 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0213 | 頸咽氣食 | B17 |
| 5 | Trachea | 氣管 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0876 | 頸咽氣食 | B17 |
| 6 | cornea | 角膜 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0150 | 眼耳口、面腮頭皮 | B17 |
| 7 | lens | 水晶體 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0402 | 眼耳口 | B17 |
| 8 | iris | 虹膜 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0369 | 眼耳口 | B17 |
| 9 | sclera | 鞏膜 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0708 | 眼耳口 | B17 |
| 10 | choroid | 脈絡膜 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0124 | 眼耳口 | B17 |
| 11 | vitreous body | 玻璃體 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0917 | 眼耳口 | B17 |
| 12 | Anterior chamber of eyeball | 眼前房 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0018 | 眼耳口 | B17 |
| 13 | lacrimal gland | 淚腺 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0381 | 眼耳口、面腮頭皮、顳下顎 | B17 |
| 14 | submandibular gland | 頷下腺 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0774 | 眼耳口、面腮頭皮、頸咽氣食、顳下顎 | B17 |
| 15 | sublingual gland | 舌下腺 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0770 | 眼耳口、面腮頭皮、顳下顎 | B17 |
| 16 | arytenoid cartilage | 杓狀軟骨 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0053 | 頸咽氣食 | B17 |
| 17 | Lip | 唇 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0429 | 眼耳口 | B17 |
| 18 | common tendinous ring | 總腱環 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0142 | 眼耳口 | B17 |
| 19 | lacrimal canaliculus | 淚小管 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0379 | 眼耳口 | B17 |
| 20 | lacrimal sac | 淚囊 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0385 | 眼耳口 | B17 |
| 21 | nasolacrimal duct | 鼻淚管 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0510 | 眼耳口、顱腦鼻 | B17 |
| 22 | major alar cartilage | 大翼軟骨 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0438 | 顱腦鼻 | B17 |
| 23 | lateral nasal cartilage | 鼻外側軟骨 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0395 | 顱腦鼻 | B17 |
| 24 | Septal nasal cartilage | 鼻中隔軟骨 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0718 | 顱腦鼻 | B17 |
| 25 | corniculate cartilage | 小角軟骨 | 位置、組成、毗鄰 | 必寫 | 無法確認 | RS-0152 | 頸咽氣食 | B17 |
| 26 | Optic part of retina | 視網膜視部 | 位置、組成、毗鄰 | 必寫？（不確定）：只有 Retina 出現（視部是其部分） | 無法確認 | RS-0691 | 眼耳口 | B18 |
| 27 | upper secondary canine tooth | 上顎恆犬齒 | 位置、組成、毗鄰 | 必寫？（不確定）：只有牙的類別總稱出現（逐顆未出現） | 無法確認 | RS-0086 | 眼耳口 | B18 |
| 28 | lower secondary canine tooth | 下顎恆犬齒 | 位置、組成、毗鄰 | 必寫？（不確定）：只有牙的類別總稱出現（逐顆未出現） | 無法確認 | RS-0086 | 眼耳口 | B18 |
| 29 | upper central secondary incisor tooth | 上顎恆中切齒 | 位置、組成、毗鄰 | 必寫？（不確定）：只有牙的類別總稱出現（逐顆未出現） | 無法確認 | RS-0310 | 眼耳口 | B18 |
| 30 | lower central secondary incisor tooth | 下顎恆中切齒 | 位置、組成、毗鄰 | 必寫？（不確定）：只有牙的類別總稱出現（逐顆未出現） | 無法確認 | RS-0310 | 眼耳口 | B18 |
| 31 | upper lateral secondary incisor tooth | 上顎恆側切齒 | 位置、組成、毗鄰 | 必寫？（不確定）：只有牙的類別總稱出現（逐顆未出現） | 無法確認 | RS-0310 | 眼耳口 | B18 |
| 32 | lower lateral secondary incisor tooth | 下顎恆側切齒 | 位置、組成、毗鄰 | 必寫？（不確定）：只有牙的類別總稱出現（逐顆未出現） | 無法確認 | RS-0310 | 眼耳口 | B18 |
| 33 | upper first secondary premolar tooth | 上顎第一恆小臼齒 | 位置、組成、毗鄰 | 必寫？（不確定）：只有牙的類別總稱出現（逐顆未出現） | 無法確認 | RS-0663 | 眼耳口 | B18 |
| 34 | lower first secondary premolar tooth | 下顎第一恆小臼齒 | 位置、組成、毗鄰 | 必寫？（不確定）：只有牙的類別總稱出現（逐顆未出現） | 無法確認 | RS-0663 | 眼耳口 | B18 |
| 35 | upper second secondary premolar tooth | 上顎第二恆小臼齒 | 位置、組成、毗鄰 | 必寫？（不確定）：只有牙的類別總稱出現（逐顆未出現） | 無法確認 | RS-0663 | 眼耳口 | B18 |
| 36 | lower second secondary premolar tooth | 下顎第二恆小臼齒 | 位置、組成、毗鄰 | 必寫？（不確定）：只有牙的類別總稱出現（逐顆未出現） | 無法確認 | RS-0663 | 眼耳口 | B18 |
| 37 | upper first secondary molar tooth | 上顎第一恆大臼齒 | 位置、組成、毗鄰 | 必寫？（不確定）：只有牙的類別總稱出現（逐顆未出現） | 無法確認 | RS-0498 | 眼耳口 | B18 |
| 38 | lower first secondary molar tooth | 下顎第一恆大臼齒 | 位置、組成、毗鄰 | 必寫？（不確定）：只有牙的類別總稱出現（逐顆未出現） | 無法確認 | RS-0498 | 眼耳口 | B18 |
| 39 | upper second secondary molar tooth | 上顎第二恆大臼齒 | 位置、組成、毗鄰 | 必寫？（不確定）：只有牙的類別總稱出現（逐顆未出現） | 無法確認 | RS-0498 | 眼耳口 | B18 |
| 40 | lower second secondary molar tooth | 下顎第二恆大臼齒 | 位置、組成、毗鄰 | 必寫？（不確定）：只有牙的類別總稱出現（逐顆未出現） | 無法確認 | RS-0498 | 眼耳口 | B18 |
| 41 | Tarsal plate of upper eyelid | 上眼瞼瞼板 | 位置、組成、毗鄰 | 必寫？（不確定）：成員別名（總稱，不確定） | 無法確認 | RS-0839 | 眼耳口 | B18 |
| 42 | Trochlea of superior oblique | 滑車 | 位置、組成、毗鄰 | 必寫？（不確定）：成員別名（總稱，不確定） | 無法確認 | RS-0893 | 眼耳口 | B18 |
| 43 | Gingiva of upper jaw | 上顎牙齦 | 位置、組成、毗鄰 | 考試後 | 無法確認 | — | — | B19 |
| 44 | Gingiva of lower jaw | 下顎牙齦 | 位置、組成、毗鄰 | 考試後 | 無法確認 | — | — | B19 |
| 45 | conus elasticus | 彈性圓錐 | 位置、組成、毗鄰 | 考試後 | 無法確認 | — | — | B19 |
| 46 | Tarsal plate of lower eyelid | 下眼瞼瞼板 | 位置、組成、毗鄰 | 考試後 | 無法確認 | — | — | B19 |
| 47 | lacrimal lake | 淚湖 | 位置、組成、毗鄰 | 考試後 | 無法確認 | — | — | B19 |
| 48 | corona ciliaris | 睫狀冠 | 位置、組成、毗鄰 | 考試後 | 無法確認 | — | — | B19 |
| 49 | cuneiform cartilage | 楔狀軟骨 | 位置、組成、毗鄰 | 考試後 | 無法確認 | — | — | B19 |

## 六、筆記來源與給使用者的請求

- 必備清單 `head-neck.json` 只存名稱、類型與五個主題標籤，不存檔名或日期碼，所以**無法由 repo 內資料判斷這些頭頸結構來自哪幾份筆記的日期碼**。repo 內提到的日期碼只有腹部的 0909 與 0923（`docs/exam2-abdomen-gap.md`），頭頸沒有。使用者上傳的 PDF 我沒有開啟。
- 這些筆記 PDF 沒有文字層（只有頁面影像），所以寫卡片的人只能逐頁看圖片，或需要文字版。逐頁看圖片速度慢、容易漏項或讀錯，之後「獨立核對」也要重複看一次圖片，兩個環節都不可靠。
- 建議向使用者要：(1) 頭頸各份筆記的 Markdown 或純文字版（和他準備提供的三份腹部 MD 同樣做法），檔名帶日期碼，這樣能依實際出現次序排序、確認「必寫」判定，並讓獨立核對可以逐句對照；(2) 若只能先給一部分，優先給神經（腦神經與眼眶分支）、頭頸血管、顱骨與咽喉肌的那幾份；(3) 對「必寫？」的 21 列（牙齒逐顆、頸椎、視網膜視部等）與「考試後」的 34 列，請他確認是否維持現在的分類。文字版只放 repo 外，不進 repo、不進 PR，卡片文字仍用自己的話。
