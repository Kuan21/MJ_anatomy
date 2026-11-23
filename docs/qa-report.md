# 核對報告（功能測試與內容核對）

內部文件，只放在 `docs/`，**不會部署到網站**：部署只上傳 `dist`（由 `web/` 與 `public/` 建置），網站上 `docs/` 路徑一律回 404。本檔由「核對」工作階段撰寫，只記錄問題，不修改任何模型、資料、資訊卡或程式碼；問題交總管按 `docs/WORK_REGISTRY.md` 分派。

- 測試對象：已部署網站 https://kuan21.github.io/MJ_anatomy/（main 最新部署），以及網站實際載入的資料檔（由網站下載，不在本機重新生成）。
- 「來源」欄只寫書名或網站名，不引用任何課程資料原文；中英名稱以必考結構清單（`docs/required-structures/`）為準，名詞寫法以 FIPAT TA2 對照。
- 報告不宣稱「已對照某書確認正確」；解剖判斷依所列公開資料核對，請使用者最後核對。
- 座標：模型座標 x 正值為病人左側（以 Left femur x = +91 mm、Left kidney x = +62 mm 驗證），y 向上，z 正值向前。

## 嚴重程度

| 等級 | 意思 |
|---|---|
| 會令溫書學錯 | 名稱、左右、位置、資訊卡或題目答案錯，學生照網站溫會記錯 |
| 影響使用 | 功能壞、找不到、題目無法作答、缺模型等，但不會教錯 |
| 外觀小問題 | 排版、大小寫、極小碎片等，不影響學習 |

裝置優先次序（使用者 2026-11-16）：使用者考前主要用 iPad 與電腦，iPad 與電腦的問題優先於手機；手機排版問題維持一般優先，不升級。

## 進度

| 區域 | 狀態 | 已檢查 | 問題 | 最後更新 |
|---|---|---|---|---|
| 頭頸（含腦、眼、耳） | 進行中 | 見下 | 見下 | 2026-11-15 |
| 骨盆與會陰 | 層次重點完成；其他項目未開始 | 見「骨盆與會陰」 | PP-01、PP-02 | 2026-11-16 |
| 腹部 | 層次重點完成；其他項目未開始 | 見「腹部」 | AB-01、AB-02 | 2026-11-16 |

---

## 頭頸（含腦、眼、耳）

次序（使用者 2026-11-15 指定）：11 左右 → 9 名稱 → 14 Quiz 答案 → 功能測試 1–8 → 12 位置抽查 → 13 資訊卡。

### 問題清單

建議負責工作階段依 `docs/WORK_REGISTRY.md`；「腦部工作階段」目前不在登記表六個名稱內，由總管指定。

| 編號 | 區域 | 結構或功能 | 問題 | 證據 | 來源 | 嚴重程度 | 建議負責 |
|---|---|---|---|---|---|---|---|
| HN-01 | 頭頸／顳顎關節 | Lateral temporomandibular ligament 顳顎外側韌帶（左、右） | 左右調轉：名為「左」的韌帶模型在病人右側，名為「右」的在左側。網站程式沒有更正，主圖譜關節系統與頭頸 Quiz 都受影響。需修改：`public/models/joints.glb` 的 `Lateral temporomandibular ligament.l`／`.r` 兩個節點（名稱對調或幾何對調）；受影響題目：頭頸 Quiz 的 `joint:left lateral temporomandibular ligament`、`joint:right lateral temporomandibular ligament`（`quiz-head-neck.json` 由 joints.glb 生成，修模型後要重新生成）。 | joints.glb：`.l` 中心 x = −53.2 mm，`.r` 中心 x = +53.2 mm；同檔同側的關節囊 `.l` +46.0 mm、關節盤 `.l` +44.8 mm、蝶下頜韌帶 `.l` +36.6 mm、莖突下頜韌帶 `.l` +38.8 mm 均正常；Quiz 資料「Left lateral temporomandibular ligament」範圍 x −63～−48 mm。3D 截圖：學習「認識」右側面，右顳顎關節囊的黃色標示在右顳顎關節，「右顳顎外側韌帶」在右側看不到黃色標示（[截圖](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/02f374f2e37b1273426f9eb04d6933bdb11caeed/qa-report/head-neck/hn01-tmj-lateral-ligament.jpg)）。 | Gray's Anatomy 1918（顳顎關節外側韌帶附著顴弓與下頜頸，位於同側關節囊外側）；TeachMeAnatomy | 會令溫書學錯 | 頭頸模型（joints.glb）＋總管（Quiz 題庫） |
| HN-02 | 頭頸／腦神經 | Vagus nerve (X) 迷走神經 Quiz 資訊卡「走向」（#337，左右共用一筆） | 寫「之後入胸腔，喉返神經由此分出並上行回到喉部」。右喉返神經在頸根部分出，勾住右鎖骨下動脈後上行；左喉返神經才在胸腔分出，勾住主動脈弓。左右要分開寫。 | `app/quiz/card-data.ts` 的 `'vagus nerve (x)'` 走向欄 | Gray's Anatomy 1918；TeachMeAnatomy；Kenhub | 會令溫書學錯 | 頭頸資訊卡（#337 批次） |
| HN-03 | 腦／Quiz、腦詳細模式 | 腦 Quiz 中線結構被拆成左右 | 單一的中線結構被拆成左、右兩題：視交叉（Left／Right Optic chiasm 左／右視交叉）、橋腦（Left／Right Pons 左／右橋腦）、中腦（Left／Right Midbrain 左／右中腦）、延腦（只有 Left Medulla oblongata 左延腦）。學生會以為有「左視交叉」「右橋腦」等獨立構造。完整掃描見下方「腦部中線結構掃描」。 | `quiz-brain.json` 的結構名稱；brain.glb 節點 `Optic chiasm.l/.r`、`Pons.l/.r`、`Midbrain.l/.r` 的範圍都剛好以 x = 0 為界 | Gray's Anatomy 1918；OpenStax Anatomy & Physiology（腦幹與視交叉為正中構造） | 會令溫書學錯 | 腦部工作階段（由總管指定） |
| HN-04 | 腦詳細模式 | Medulla oblongata 延腦模型 | brain.glb 只有 `Medulla oblongata.l`（x 0～+13 mm），沒有右半；腦詳細模式的延腦缺右半邊。 | brain.glb 節點清單與 POSITION 範圍 | OpenStax Anatomy & Physiology | 會令溫書學錯（與 HN-03 同一處修） | 腦部工作階段（由總管指定） |
| HN-05 | 腦詳細模式 | Tentorium cerebelli 小腦幕、Anterior spinal artery 脊髓前動脈 | 兩者都是單一構造，但 brain.glb 拆成 `.l`／`.r` 兩半（各以 x = 0 為界）。目前不在 Quiz，點選時名稱是否帶左右待功能測試確認。脊髓前動脈是單一中線動脈；本項要與 HN-03、HN-04 由同一個工作階段一起修（使用者 2026-11-15 決定）。 | brain.glb 節點範圍 | Gray's Anatomy 1918 | 影響使用 | 腦部工作階段（由總管指定），與 HN-03、HN-04 同一批 |
| HN-10 | 腦／Quiz、腦詳細模式 | Fornix 穹窿 | 只有 Left／Right Fornix 左／右穹窿（brain.glb `Fornix.l/.r`，以 x = 0 為界）。左右穹窿腳保留；穹窿體是中線構造，模型與 Quiz 要有單一「Body of fornix 穹窿體」，不分左右（使用者 2026-11-15 決定）。 | brain.glb 節點範圍；`quiz-brain.json` | Gray's Anatomy 1918；OpenStax Anatomy & Physiology | 會令溫書學錯 | 腦部工作階段（由總管指定），與 HN-03、HN-04 同一批 |
| HN-11 | 頭頸／名稱 | 中文名與必考清單用詞不同（24 個構造） | 見「9 名稱」表；名稱決定檔與 CLAUDE.md 規則不一致，等使用者決定以哪份為準 | 690 張資訊卡顯示名稱對照必考清單 | FIPAT TA2（名詞對照） | 影響使用 | 總管（決定後分派） |
| HN-12 | 頭頸 | 主圖譜資訊卡內容 | 98 個必考結構的主圖譜資訊卡沒有內容欄（只有區域、構造類型、選取件數）：骨 16、腦 16、動脈 13、神經 13、韌帶 6、咽部肌肉 6、眼 6、軟骨 6、腺體 4、靜脈 3、淚道 3、其他 6。清單見「13 資訊卡」。 | 690 張資訊卡讀取結果 | — | 影響使用 | 頭頸資訊卡 |
| HN-13 | 頸部 | Spinalis cervicis 頸棘肌資訊卡 | 起止點寫成整條棘肌的通用附著，不是頸棘肌本身（不在必考清單）。 | 資訊卡「ORIGIN／INSERTION」 | Gray's Anatomy 1918；Kenhub | 會令溫書學錯（非必考） | 頭頸資訊卡 |
| HN-14 | 喉 | Cricothyroid 環甲肌直部、斜部資訊卡 | 兩部分止點寫法相同，未分開。 | 資訊卡「INSERTION」 | Gray's Anatomy 1918；TeachMeAnatomy | 外觀小問題 | 頭頸資訊卡 |
| HN-15 | 頭頸／搜尋 | 必考清單寫法搜不到 | 主圖譜搜尋輸入必考清單的中文寫法，6 個完全沒有結果：上咽縮肌、深頸動脈、前大腦動脈、耳咽管咽肌、橫頸動脈、腦橋（網站名為咽上縮肌、頸深動脈、大腦前動脈、咽鼓管咽肌、頸橫動脈、橋腦）。另外 頸內靜脈、SCM 也搜不到。腦垂體、提嘴角肌、淚神經、頜下腺 有別名可搜到。名稱決定檔說必考清單寫法會加作別名，尚未套用。 | 桌面搜尋 40 個詞的結果（見「功能測試」） | — | 影響使用 | 總管（別名資料，`docs/paokao-aliases.json` 等） |
| HN-16 | 頭頸／資訊卡 | Quiz 資訊卡與主圖譜資訊卡是兩套資料 | #337、#346 寫的卡片文字（`app/quiz/card-data.ts`）只出現在 Quiz 與學習；主圖譜點同一構造（例如咽上縮肌、甲狀軟骨、淚腺）資訊卡仍然沒有內容（HN-12）。請決定兩邊是否共用同一份內容。 | 690 張主圖譜資訊卡讀取（#346 合併後） | — | 影響使用 | 總管 |
| HN-17 | Quiz | Quiz 記住設定 | 桌面選「雙側」「20 題」開始測驗、提早結束後，重新開啟頭頸 Quiz，設定回到預設「右側」「10 題」，沒有記住。 | 自動測試：同一分頁重新載入後 aria-pressed 狀態 | — | 影響使用 | 總管（Quiz） |
| HN-18 | 手機版（一般優先） | 主圖譜排版（390×844）（[截圖](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/02f374f2e37b1273426f9eb04d6933bdb11caeed/qa-report/head-neck/hn18-mobile-card.jpg)） | 標題下的「可點選構造」被右上角按鈕遮住；區域列只見「頭頸、雙側、左側」，「右側」要橫向捲動才看到；資訊卡內容區很矮，起止點等欄位要在卡內捲動才看到。頁面本身沒有橫向捲動。 | 截圖 mobile-02、mobile-04 | — | 外觀小問題 | 總管 |
| HN-19 | 腦詳細模式、CSF 流向 | 網站內部用詞不一致 | CSF 流向頁寫「大腦導水管」「蛛網膜下腔」「蛛網膜顆粒」；腦模型與主圖譜寫「中腦導水管」；必考清單寫「蜘蛛膜」「蜘蛛膜下腔」。同一構造在網站上有兩種寫法。 | CSF 流向頁文字、腦詳細模式清單 | FIPAT TA2（名詞對照） | 影響使用 | 總管（併入 HN-11 一起決定） |
| HN-20 | Quiz、學習、模擬考試 | 介面文字有廣東話「返去學」 | 共 5 處：`app/quiz/setup-page.tsx` 第 48 行（答錯的「返去學」→ 答錯的「回去學習」）、`app/quiz/page.tsx` 第 247 行（返去學：到{區域}學習地圖 → 回去學習：到{區域}學習地圖）、`app/quiz/exam.tsx` 第 178 行、`app/quiz/run.tsx` 第 32 行（返去學：→ 回去學習：），以及 `app/quiz/run.tsx` 第 10 行註解。另外使用者要求加強 `scripts/check-zh.mjs`（不可放寬）：(1) 加規則捉口語「返」（返去、返嚟、返學、返轉等，「返回」除外）與「撳、搵、攞、嚿、畀、郁、噉、嘥」；(2) 掃描範圍加入 `components/`、`lib/` 與建置時生成、會上網站的名稱與資訊卡資料；(3) 以「返去學」做反向測試，修改前必須失敗。完成後開【需人工審核】PR，附 Quiz 設定頁與結果頁截圖。 | Quiz 結果頁實際顯示「返去學：到頭頸學習地圖」（桌面測試） | — | 影響使用 | 總管（Quiz 與檢查腳本） |
| HN-21 | 頸部 | 頸動脈鞘上段（頸動脈分叉以上，約 C4–C2，左右） | 頸內靜脈在頸內動脈的內側並偏前；應在外側。分叉後約 1 cm 內頸內、頸外動脈幾乎重疊（x、z 相差 1–2 mm 以內），未分開。分叉以下（頸總動脈段）的關係正確。 | 左側 y 1.51 m：頸內動脈 x 34、z −5 mm；頸內靜脈 x 29、z 0 mm；y 1.49–1.55 m 每一層都如此，右側鏡像相同（neck-vessels 資料逐層斷面）。未在 3D 畫面截圖確認。 | Gray's Anatomy 1918；TeachMeAnatomy；Kenhub | 會令溫書學錯 | 頭頸模型（登記表已有「頸內靜脈中心線調整」排期，建議一併處理） |
| HN-21b | 頸部 | 頸動脈分叉後的頸內、頸外動脈 | 分叉後約 1 cm 內兩條動脈中心幾乎重疊（相差 1–2 mm 以內），未分開；應為頸外動脈在前內側、頸內動脈在後外側。（由 HN-21 拆出；HN-21 的頸內靜脈部分已由 #375 修正） | 左側 y 1.49 m：頸內動脈 x 31.7、z −3.9；頸外動脈 x 31.4、z −3.8 mm；右側相同 | Gray's Anatomy 1918；TeachMeAnatomy | 影響使用 | 頭頸模型 |
| HN-22 | 面部 | Superficial／Deep part of masseter 咬肌淺部、深部（左右） | 深部在淺部的外側（較淺），應在深面（內側）；疑為兩件名稱對調或位置錯。 | y 1.53 與 1.55 m，以 5 mm 前後分格比較，幾乎每格深部外緣比淺部外緣再外 2–5 mm（例如左側 y 1.55、z 15：淺部 44–50 mm，深部 48–55 mm）。未在 3D 畫面截圖確認。 | Gray's Anatomy 1918；Kenhub | 會令溫書學錯 | 頭頸模型（面部補充模型） |
| HN-23 | 頸根 | Subclavian artery 鎖骨下動脈與 Scalenus anterior 前斜角肌（左右） | 鎖骨下動脈在前斜角肌的前方；應在其後方（前、中斜角肌之間）。鎖骨下靜脈在前斜角肌前方，正確。 | y 1.425、1.435 m，x 40–52 mm：前斜角肌 z −8～−3，動脈 z −4～+5，中斜角肌 z −25～−14，兩肌之間沒有動脈；右側相同。未在 3D 畫面截圖確認。 | Gray's Anatomy 1918；TeachMeAnatomy；Kenhub | 會令溫書學錯 | 頭頸模型 |
| HN-24 | 頸部 | Left recurrent laryngeal nerve 左喉返神經 | 頸段在氣管外緣外側約 10 mm，不在氣管食道溝內（右側位置正確）。 | y 1.42–1.44 m：左喉返神經 x 20–22 mm；氣管中心 x 0、半徑約 9 mm。 | Gray's Anatomy 1918；TeachMeAnatomy | 影響使用 | 頭頸模型 |
| HN-25 | 學習 | 神經類別的黃色標示 | 學習「認識」步驟用黃色標示目標構造，但其他神經本身也是黃色，神經類別很難分出哪一條是目標。 | 學習地圖「神經」第 1 關截圖 | — | 影響使用 | 總管（學習） |
| HN-26 | 頭部 | Aponeurosis of epicranius 帽狀腱膜 | 向前延伸到前額與眉間，並有一塊長方形延伸到兩眼之間的鼻根；帽狀腱膜前端應接額肌，不到眉毛與鼻根。長方形外形不符合「立體結構不可用長方體」規則。 | 學習「認識」前面與側面截圖（[前面](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/02f374f2e37b1273426f9eb04d6933bdb11caeed/qa-report/head-neck/hn26-galea-front.jpg)、[側面](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/02f374f2e37b1273426f9eb04d6933bdb11caeed/qa-report/head-neck/hn26-galea-side.jpg)）；Quiz 答錯畫面同樣可見 | Gray's Anatomy 1918；TeachMeAnatomy | 會令溫書學錯 | 頭頸模型 |
| HN-27 | iPad 直向（820×1180） | 主圖譜區域列與系統面板 | 區域列（←、頭頸、雙側、左側、右側）蓋住系統面板第一行「Skeleton 骨骼」，直向時無法看到或點到骨骼開關；3D 模型被擠在兩個面板之間，顯示很小。橫向（1180×820）沒有溢出或遮擋。 | 1 倍解析度截圖（[直向](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/02f374f2e37b1273426f9eb04d6933bdb11caeed/qa-report/head-neck/hn27-ipad-portrait-overlap.jpg)） | — | 影響使用（iPad 優先） | 總管 |
| HN-06 | 腦／Quiz | 腦 Quiz 英文大小寫 | 416 題中 383 題在 Left／Right 後保留大寫，例如「Left Lateral sulcus」「Right Pons」，與主圖譜寫法（Left lateral…）不一致。 | `quiz-brain.json` | — | 外觀小問題 | 總管（Quiz） |
| HN-07 | 頭頸／名稱 | 字形「頷／頜」「腭／顎」 | `docs/quiz-head-neck-name-decisions.md` 已決定統一用「頜」「顎」，但網站仍兩種並存：Quiz 中文名「右下頷神經前股、後股」「右上頷神經腦膜支」，#337 資訊卡「下頷神經」「上頷竇」「硬腭」，主圖譜資訊卡「腭咽肌」。 | 已部署資料與資訊卡文字 | FIPAT TA2（名詞對照） | 外觀小問題 | 總管（套用名稱決定） |
| HN-08 | 頭頸／眼、喉 | 5 個結構的範圍框（bounds） | Right sclera、Suspensory ligament of right lens、Left conus elasticus、Right aryepiglotticus、Straight part of right cricothyroid 的 atlas.json 範圍框跨到對側（例如 Right sclera 範圍 x −44～+31 mm，實際網格 −44～−17 mm）。可能影響 Focus 取景與「不在目前視野」提示。 | atlas.json bounds 對比實際頂點 | — | 外觀小問題 | 頭頸模型 |
| HN-09 | 頭頸 | 名稱分左右側的極小碎片 | Right sternocleidomastoid、Right thyrohyoid、Right rectus capitis anterior、Right medial pterygoid、Right cornea、Right choroid 的網格內有數個面積 < 0.2 mm² 的三角形落在對側；肉眼看不到，只記錄。 | 逐個網格連通分量分析 | — | 外觀小問題 | 頭頸模型 |

### 11 左右核對（完成）

方法：讀網站實際載入的資料（主圖譜 3,714 件、頸部血管、神經模型、眼詳細模式、腦詳細模式 brain.glb、關節 joints.glb、頭頸與腦 Quiz），以網格頂點平均的 x 判斷實際側別，與名稱的 Left／Right、`.l／.r`、中文「左／右」比較；|x| < 2 mm 視為跨中線不判定。

| 資料 | 有左右的結構 | 左右調轉 |
|---|---|---|
| 主圖譜（頭頸，中心 y ≥ 1.42 m） | 731 | 0 |
| 頸部血管 | 8 | 0 |
| 神經模型（頭頸） | 87 | 0 |
| 眼詳細模式（左眼） | 71 件（無右眼模型，網站已註明） | 0 |
| 腦詳細模式 brain.glb | 403 | 0（右迷走神經延伸到胸腹，屬正常走向） |
| 關節 joints.glb | 349 件中有左右者 | **2（HN-01 的一對）** |
| 頭頸 Quiz／腦 Quiz | 435／416 題 | 1 對（HN-01）；中線結構拆左右見 HN-03 |
| 資訊卡顯示名稱（英文 Left／Right 與中文 左／右） | 690 張 | 0 |

### 14 Quiz 答案對應（完成）

- 頭頸 Quiz 435 題、腦 Quiz 416 題：每題的答案網格都在題庫套件中，套件側別與題目側別一致，網格名稱與題目名稱一致（只有腦溝 8 題的網格用原始縮寫名，如 `Lat_Fis-post.l`，內容對得上）。
- Left／Right suboccipital triangle 枕下三角兩題沒有網格（特殊空間，以邊界構造呈現），作答是否正常待功能測試確認。
- 以網格位置比對題目左右：只有 HN-01 調轉。
- 中文名與必考清單不同：見下方「9 名稱」。

### 腦部中線結構掃描（使用者 2026-11-15 要求）

以 brain.glb 全部節點與腦 Quiz 掃描。

**被拆成左右、應為單一構造（列入 HN-03／HN-04／HN-05）**

| 構造 | brain.glb | 腦 Quiz 題目 |
|---|---|---|
| Optic chiasm 視交叉 | `.l`、`.r` 以 x = 0 為界 | 左視交叉、右視交叉 |
| Pons 橋腦 | `.l`、`.r` 以 x = 0 為界 | 左橋腦、右橋腦 |
| Midbrain 中腦 | `.l`、`.r` 以 x = 0 為界 | 左中腦、右中腦 |
| Medulla oblongata 延腦 | 只有 `.l` | 左延腦（沒有右） |
| Tentorium cerebelli 小腦幕 | `.l`、`.r` | 不在 Quiz |
| Anterior spinal artery 脊髓前動脈 | `.l`、`.r` | 不在 Quiz |

**沒有被拆開（正常）**：Corpus callosum 胼胝體、Pineal gland 松果體、Adenohypophysis 腺垂體、Neurohypophysis 神經垂體、Third ventricle 第三腦室、Fourth ventricle 第四腦室、Aqueduct of midbrain 中腦導水管、Septum pellucidum 透明中隔、Anterior／Posterior／Hippocampal commissure 前／後／海馬連合、蚓部各葉（Lingula、Central lobule、Culmen、Declive、Folium、Tuber、Pyramis、Uvula、Nodule）、Basilar artery 基底動脈、Anterior communicating artery 前交通動脈、Superior／Inferior sagittal sinus 上／下矢狀竇、Straight sinus 直竇、Occipital sinus 枕竇、Falx cerebri 大腦鐮、Anterior／Posterior intercavernous sinus 前／後海綿間竇。

**本來就左右成對、分左右正確**：下視丘各部（Preoptic／Anterior／Tuberal／Lateral／Posterior hypothalamus）、Pyramid of medulla oblongata 延腦錐體、Superior／Inferior colliculus 上／下丘、Fornix 穹窿的腳（體部在中線，見 HN-10）、Wing of central lobule 中央小葉翼、基底動脈橋腦內側支與外側支。

### 9 名稱（完成）

方法：用網站的檢視工具逐一開啟頭頸 690 個結構（中心 y ≥ 1.40 m）的資訊卡，讀取顯示的英文名與中文名，與必考清單比對；另查名稱後綴、拉丁文、重複與大小寫。

- 690 張資訊卡的英文 Left／Right 與中文 左／右 全部一致。
- 沒有 `.l／.r／.001` 後綴殘留、沒有拉丁文；頭頸範圍內沒有兩個不同結構同名。全身另有 8 組同名不同結構（Right／Left transversus thoracis、Right／Left ureter、Urinary bladder、Sacrum、Right／Left hip bone），留待骨盆與腹部核對時處理。
- 顯示名稱小寫開頭只剩 1 個：nuchal origin of trapezius（外觀小問題，頭頸模型或總管）。
- 顯示中文名用「頷／腭」的：左／右翼下頷縫、左／右腭咽肌（併入 HN-07）。
- 690 張中 252 張對得到必考清單，204 張中文相同，**29 張不同**。其中 4 張是網站寫得更完整，可以接受；其餘 25 張（24 個構造）用詞不同，見下表。

**注意（等使用者決定）：** `docs/quiz-head-neck-name-decisions.md` 對下表多數項目選了網站現名，必考清單寫法只作別名；這與 CLAUDE.md「第二次考試範圍中文名跟必考清單用詞」的規則不一致。請使用者決定以哪一份為準；決定後由總管分派（主圖譜名稱、資訊卡、Quiz 三處要一起改）。

| 結構 | 網站中文名 | 必考清單中文名 | 差異 |
|---|---|---|---|
| Anterior cerebral artery | 大腦前動脈 | 前大腦動脈 | 詞序 |
| Anterior communicating artery | 前交通動脈 | 前交通支 | 用詞 |
| Anterior inferior cerebellar artery | 小腦前下動脈 | 前下小腦動脈 | 詞序 |
| Posterior inferior cerebellar artery | 小腦後下動脈 | 後下小腦動脈 | 詞序 |
| Superior cerebellar artery | 小腦上動脈 | 上小腦動脈 | 詞序 |
| Posterior communicating artery | 後交通動脈 | 後交通支 | 用詞 |
| Anterior spinal artery | 脊髓前動脈 | 前脊髓動脈 | 詞序 |
| Deep cervical artery | 頸深動脈 | 深頸動脈 | 詞序 |
| Transverse cervical artery | 頸橫動脈 | 橫頸動脈 | 詞序 |
| Superior pharyngeal constrictor | 咽上縮肌 | 上咽縮肌 | 詞序 |
| Middle pharyngeal constrictor | 咽中縮肌 | 中咽縮肌 | 詞序 |
| Inferior pharyngeal constrictor | 咽下縮肌 | 下咽縮肌 | 詞序 |
| Salpingopharyngeus | 咽鼓管咽肌 | 耳咽管咽肌 | 用詞 |
| Palatopharyngeus | 腭咽肌 | 顎咽肌 | 字形（另見 HN-07） |
| Levator anguli oris | 提口角肌 | 提嘴角肌 | 用詞 |
| Lacrimal nerve | 淚腺神經 | 淚神經 | 用詞（使用者 2026-11-17：交總管按必考清單統一，另一個寫法做搜尋別名；眼眶孔資料寫「淚神經」、眼詳細模式與資訊卡寫「淚腺神經」） |
| Submandibular gland | 下頜下腺 | 頜下腺 | 用詞 |
| Pituitary gland | 腦下垂體 | 腦垂體 | 用詞 |
| Pons | 橋腦 | 腦橋 | 用詞 |
| Cerebral aqueduct | 中腦導水管 | 大腦導水管 | 用詞 |
| Tentorium cerebelli | 小腦幕 | 小腦天幕 | 用詞 |
| Lip | 唇 | 嘴唇 | 用詞 |
| Eyebrow | 眉毛 | 眉 | 用詞 |
| Epiglottis | 會厭 | 會厭軟骨 | 名稱決定檔已決定保留「會厭」 |

網站寫得更完整、可接受（不列為問題）：

| 結構 | 網站 | 必考清單 |
|---|---|---|
| Interventricular foramen | 室間孔（Monro 孔） | 室間孔 |
| Orbital／Palpebral part of orbicularis oculi | 眼輪匝肌眶部／瞼部 | 眶部／瞼部 |
| Suspensory ligament of lens | 水晶體懸韌帶 | 懸韌帶 |
| Major alar cartilage | 大翼軟骨 | 翼軟骨 |

腦 Quiz 與頭頸 Quiz 的中文名與上表相同（另有 Quiz 才有的：大腦中動脈／中大腦動脈、大腦後動脈／後大腦動脈、外側溝／側溝；Quiz 的「右下頷神經前股、後股」見 HN-07）。

#### 已知缺項分佈（`docs/required-structures/known-gaps.json`，527 項）

必考清單中需要 3D 的共 872 項，已知缺項 527 項。按類別：

| 使用者分類 | 清單類別 | 必考 | 已知缺項 |
|---|---|---|---|
| 骨 | bone 骨 | 40 | 13 |
| 骨 | landmark 骨性標記 | 108 | 101 |
| 骨 | foramen 孔、管、裂 | 41 | 35 |
| 肌 | muscle 肌肉 | 81 | 17 |
| 神經 | nerve 神經 | 95 | 48 |
| 神經 | ganglion 神經節 | 13 | 10 |
| 動脈 | artery 動脈 | 100 | 67 |
| 靜脈 | vein 靜脈 | 49 | 42 |
| 靜脈 | sinus 靜脈竇 | 20 | 8 |
| 腦 | brain 腦 | 38 | 5 |
| 眼 | eye 眼 | 31 | 7 |
| 耳 | ear 耳 | 32 | 16 |
| 其他 | space 間隙與腔 | 55 | 50 |
| 其他 | oral 口腔 | 42 | 31 |
| 其他 | fascia 筋膜 | 24 | 21 |
| 其他 | gland 腺體 | 16 | 11 |
| 其他 | lymphoid 淋巴 | 11 | 11 |
| 其他 | ligament 韌帶 | 18 | 2 |
| 其他 | cartilage 軟骨 | 13 | 4 |
| 其他 | duct 管道 | 9 | 5 |
| 其他 | other 其他 | 36 | 23 |
| **合計** | | **872** | **527** |

#### 新缺項（不在已知缺項清單，但網站上沒有 3D 模型）

現行檢查（`scripts/check-required-structures.mjs`）把「只有資訊卡」（CARD-ONLY）與「只有概念」（CONCEPT-ONLY）都算作已有，所以以下結構不在 527 項之內，但已部署網站上找不到對應的 3D 網格（比對主圖譜 3,714 件、神經模型、頸部血管、brain.glb、joints.glb、眼詳細模式的全部名稱）。依完成標準（每項要有網站模型），列為新缺項。比對以名稱為主，可能有以骨面標示或別名呈現而未比對到的，請負責工作階段逐項確認。耳詳細模式在已部署網站上仍隱藏（`MICRO_ATLAS_ENTRY.ear` 未開），所以耳的構造全部算缺。

| 分類 | 必考清單 id | 結構 | 網站現況 |
|---|---|---|---|
| 骨（骨性標記） | RS-0020 | Anterior clinoid process 前床突 | 只有腦資訊卡 |
| 骨（骨性標記） | RS-0133 | Clivus 斜坡 | 只有腦資訊卡 |
| 骨（骨性標記） | RS-0361 | Internal occipital crest 枕內隆突 | 只有腦資訊卡 |
| 骨（骨性標記） | RS-0671 | Pterion 翼點 | 只有腦資訊卡 |
| 骨（骨性標記） | RS-0713 | Sella turcica 蝶鞍 | 只有腦資訊卡 |
| 骨（孔、管） | RS-0088 | Carotid canal 頸動脈管 | 只有腦資訊卡 |
| 骨（孔、管） | RS-0542 | Opening of carotid canal 頸動脈孔 | 沒有 |
| 骨（孔、管） | RS-0248 | Foramen magnum 枕骨大孔 | 只有腦資訊卡 |
| 骨（其他） | RS-0607 | Periosteum 骨膜 | 只有腦資訊卡 |
| 骨（其他） | RS-0647 | Posterior cranial fossa 後顱窩 | 只有腦資訊卡 |
| 動脈 | RS-0054 | Ascending cervical artery 升頸動脈 | 只有腦資訊卡 |
| 動脈 | RS-0376 | Labyrinthine artery 迷路動脈 | 只有腦資訊卡 |
| 動脈 | RS-0488 | Middle meningeal artery 中腦膜動脈 | 只有腦資訊卡 |
| 動脈（相關構造） | RS-0087 | Carotid body 頸動脈體 | 只有腦資訊卡 |
| 動脈（相關構造） | RS-0091 | Carotid sinus 頸動脈竇 | 只有腦資訊卡 |
| 靜脈 | RS-0677、RS-0679 | Pterygoid (venous) plexus 翼靜脈叢 | 只有腦資訊卡 |
| 神經 | RS-0122、RS-0123 | Chorda tympani (nerve) 鼓索神經 | 沒有 |
| 神經（神經節） | RS-0912 | Vestibular ganglion 前庭神經節 | 只有腦資訊卡 |
| 腦（腦膜與腔） | RS-0200 | Dura mater 硬腦膜 | 只有腦資訊卡 |
| 腦（腦膜與腔） | RS-0606 | Periosteal layer 骨膜層 | 只有腦資訊卡 |
| 腦（腦膜與腔） | RS-0472 | Meningeal layer 腦膜層 | 只有腦資訊卡 |
| 腦（腦膜與腔） | RS-0047 | Arachnoid mater 蜘蛛膜 | 只有腦資訊卡 |
| 腦（腦膜與腔） | RS-0630 | Pia mater 軟腦膜 | 只有腦資訊卡 |
| 腦（腦膜與腔） | RS-0212 | Epidural space 硬膜外腔 | 只有腦資訊卡 |
| 腦（腦膜與腔） | RS-0763 | Subarachnoid space 蜘蛛膜下腔 | 只有腦資訊卡 |
| 腦（腦膜與腔） | RS-0102、RS-0131 | Cerebellomedullary cistern／Cisterna magna 小腦延腦池（大池） | 只有腦資訊卡 |
| 腦 | RS-0391 | Lateral aperture 外側孔 | 只有腦資訊卡 |
| 腦 | RS-0431 | Longitudinal fissure 大腦縱裂 | 只有腦資訊卡（裂隙，是否需要模型請使用者決定） |
| 腦 | RS-0536 | Olfactory bulb 嗅球 | 只有腦資訊卡（brain.glb 只有嗅神經與嗅溝） |
| 腦 | RS-0540 | Olfactory tract 嗅徑 | 只有腦資訊卡 |
| 耳 | RS-0439 | Malleus 錘骨 | 只有腦資訊卡 |
| 耳 | RS-0311 | Incus 砧骨 | 只有腦資訊卡 |
| 耳 | RS-0745 | Stapes 鐙骨 | 只有腦資訊卡 |
| 耳 | RS-0899 | Tympanic membrane 鼓膜 | 只有腦資訊卡 |
| 耳 | RS-0571 | Oval window 卵圓窗 | 只有腦資訊卡 |
| 耳 | RS-0700 | Round window 圓窗 | 只有腦資訊卡 |
| 耳 | RS-0627 | Pharyngotympanic tube 耳咽管 | 沒有 |
| 耳 | RS-0714 | Semicircular canal 半規管 | 只有腦資訊卡 |
| 耳 | RS-0715 | Semicircular duct 半規導管 | 沒有 |
| 耳 | RS-0009 | Ampulla of semicircular canal 壺腹 | 只有腦資訊卡 |
| 耳 | RS-0701 | Saccule 球狀囊 | 只有腦資訊卡 |
| 耳 | RS-0901 | Utricle 橢圓囊 | 只有腦資訊卡 |
| 耳 | RS-0136 | Cochlear duct (scala media) 耳蝸管 | 只有腦資訊卡 |
| 耳 | RS-0705 | Scala tympani 鼓階 | 沒有 |
| 耳 | RS-0706 | Scala vestibuli 前庭階 | 沒有 |
| 耳 | RS-0299 | Helicotrema 耳蝸孔 | 只有腦資訊卡 |
| 口腔 | RS-0856 | Terminal sulcus 界溝（舌） | 沒有 |
| 其他 | RS-0707 | Scalp 頭皮 | 只有腦資訊卡 |

（2026-11-16 更正：Optic canal 視神經管在眼詳細模式「眼眶的孔、管與裂」有標示，已從本表移除。）

耳 16 項全部是因為耳詳細模式尚未部署到網站；耳的 PR 合併後重新核對這 16 項（使用者 2026-11-15 指示）。

合計 48 個結構（49 個清單 id；翼靜脈叢、鼓索神經、小腦延腦池各有兩個 id）。分組：骨 10、動脈 5、靜脈 1、神經 2、腦 12、耳 16、口腔 1、其他 1。建議負責：耳由總管（耳詳細模式）；腦膜、腦池與嗅球由腦部工作階段；骨性標記、孔、頸部動脈與翼靜脈叢由頭頸模型；界溝、頭皮由總管分派。

缺項規則（使用者 2026-11-15 批准）：只有資訊卡或只有概念、沒有 3D 模型的項目一律算缺項。`check-required-structures.mjs` 目前把 CARD-ONLY 與 CONCEPT-ONLY 算作「已有」，要改為只把有 3D 網格（PRESENT、ALIAS）算已有，並把上表各項加入 `known-gaps.json`（交總管分派）。

### B01 批次編號衝突（使用者 2026-11-15 已批准）

- `docs/quiz-head-neck-card-plan.md` 的批次表：B01＝骨（14 塊頭骨），B06＝神經（28 條），B07＝神經（8 條）。
- 已合併的 #337 與登記表稱「B01 神經」：實際內容是 13 條頭頸神經，不是計劃表的 B01 骨。
- 決定：以資訊卡計劃表（`docs/quiz-head-neck-card-plan.md`）為唯一編號來源，批次名稱寫成「類別＋計劃表編號」，例如「B06 神經（第 1 部分，#337）」；#337 的 review-log 與登記表改用這個寫法；之後每批 PR 標題都用「頭頸資訊卡 B06 神經（1/2）」這類格式，避免同一編號指兩批。核對報告暫時以 PR 編號指稱（例如「#337 神經卡」）。

### 13 資訊卡（#337 神經卡、主圖譜頭頸資訊卡已核對；B02–B05 合併後即核對）

#337 的 13 張神經卡（顏面、三叉、眼、上頜、頦、頰、舌咽、迷走、舌下、下頜神經前股、後股、下齒槽、下頜舌骨肌神經）逐欄核對「來源、走向、支配範圍」：

- 錯誤 1 項：HN-02（迷走神經，右喉返神經）。
- 不完整 1 項：眼神經卡寫額神經「延續為眶上神經」，沒有提滑車上神經（額神經分成眶上與滑車上神經）。外觀小問題（Gray's Anatomy 1918；TeachMeAnatomy）。
- 用字：見 HN-07。
- 其餘 11 張未見事實錯誤（Gray's Anatomy 1918；TeachMeAnatomy；Kenhub）。

#### 主圖譜資訊卡（690 張，必考項目 252 張）

- 肌肉卡（起點、止點、神經支配、作用、血供五欄齊全）89 張逐欄核對，約 50 條肌肉：未見會令溫書學錯的必考內容錯誤。細節：
  - Spinalis cervicis 頸棘肌：卡片寫的是整條棘肌的通用附著（下胸、上腰棘突到上胸、頸棘突），不是頸棘肌本身（約 C7–T2 棘突到 C2 棘突）。不在必考清單（HN-13）。
  - Straight／Oblique part of cricothyroid 環甲肌直部、斜部：兩張卡的止點寫法相同（甲狀軟骨下緣與下角），未分開直部（止於下緣）與斜部（止於下角）（HN-14）。
- **必考結構中 98 張主圖譜資訊卡只有區域與構造類型，沒有任何內容欄**（HN-12），按類別：

| 類別 | 數量 | 結構 |
|---|---|---|
| bone | 16 | Atlas 寰椎、Axis 樞椎、Ethmoid bone 篩骨、Frontal bone 額骨、Hyoid bone 舌骨、Inferior nasal concha 下鼻甲、Lacrimal bone 淚骨、Mandible 下頜骨、Nasal bone 鼻骨、Occipital bone 枕骨、Palatine bone 顎骨、Parietal bone 頂骨、Sphenoid bone 蝶骨、Temporal bone 顳骨、Vomer 犁骨、Zygomatic bone 顴骨 |
| brain | 16 | Anterior commissure 前連合、Cerebellum 小腦、Cerebral aqueduct 中腦導水管、Corpus callosum 胼胝體、Fourth ventricle 第四腦室、Hypothalamus 下視丘、Inferior colliculus 下丘、Lateral ventricle 側腦室、Medulla oblongata 延腦、Midbrain 中腦、Occipital lobe 枕葉、Optic chiasm 視交叉、Pons 橋腦、Superior colliculus 上丘、Thalamus 視丘、Third ventricle 第三腦室 |
| artery | 13 | Anterior cerebral artery 大腦前動脈、Anterior communicating artery 前交通動脈、Anterior inferior cerebellar artery 小腦前下動脈、Anterior spinal artery 脊髓前動脈、Basilar artery 基底動脈、Costocervical trunk 肋頸動脈幹、Deep cervical artery 頸深動脈、Inferior thyroid artery 下甲狀腺動脈、Internal carotid artery 內頸動脈、Ophthalmic artery 眼動脈、Posterior communicating artery 後交通動脈、Posterior inferior cerebellar artery 小腦後下動脈、Superior cerebellar artery 小腦上動脈 |
| nerve | 13 | Anterior ethmoidal nerve 前篩神經、Frontal nerve 額神經、Infratrochlear nerve 滑車下神經、Lacrimal nerve 淚腺神經、Long ciliary nerve 長睫神經、Nasociliary nerve 鼻睫神經、Ophthalmic nerve 眼神經、Optic nerve 視神經、Posterior ethmoidal nerve 後篩神經、Short ciliary nerve 短睫神經、Supraorbital nerve 眶上神經、Supratrochlear nerve 滑車上神經、Trochlear nerve 滑車神經 |
| ligament | 6 | Common tendinous ring 總腱環、Intermediate tendon 中間腱、Pharyngeal raphe 咽縫、Pterygomandibular raphe 翼下頷縫、Stylohyoid ligament 莖突舌骨韌帶、Suspensory ligament of lens 水晶體懸韌帶 |
| muscle | 6 | Inferior pharyngeal constrictor 咽下縮肌、Middle pharyngeal constrictor 咽中縮肌、Palatopharyngeus 腭咽肌、Salpingopharyngeus 咽鼓管咽肌、Stylopharyngeus 莖突咽肌、Superior pharyngeal constrictor 咽上縮肌 |
| eye | 6 | Choroid 脈絡膜、Cornea 角膜、Eyebrow 眉毛、Iris 虹膜、Lens 水晶體、Sclera 鞏膜 |
| cartilage | 6 | Arytenoid cartilage 杓狀軟骨、Corniculate cartilage 小角軟骨、Cricoid cartilage 環狀軟骨、Epiglottis 會厭、Major alar cartilage 大翼軟骨、Thyroid cartilage 甲狀軟骨 |
| gland | 4 | Lacrimal gland 淚腺、Pituitary gland 腦下垂體、Sublingual gland 舌下腺、Submandibular gland 下頜下腺 |
| vein | 3 | Brachiocephalic vein 頭臂靜脈、Internal jugular vein 內頸靜脈、Suprascapular vein 肩胛上靜脈 |
| duct | 3 | Lacrimal canaliculus 淚小管、Lacrimal sac 淚囊、Nasolacrimal duct 鼻淚管 |
| oral | 2 | Lip 唇、Tongue 舌 |
| ganglion | 1 | Ciliary ganglion 睫狀神經節 |
| other | 1 | Trachea 氣管 |
| foramen | 1 | Interventricular foramen 室間孔（Monro 孔） |
| fascia | 1 | Tentorium cerebelli 小腦幕 |

  頭頸資訊卡工作階段正在寫 B02–B05；#337 的 13 條神經文字只在 Quiz 資訊卡（`app/quiz/card-data.ts`），主圖譜點選神經時是否顯示同一內容待功能測試確認。

### 功能測試 1–8（已部署網站；本環境沒有 GPU，用軟體繪圖，所以時間偏慢，只作相對參考）

| 項目 | 桌面 1440×900 | 手機 390×844 | console error |
|---|---|---|---|
| 1 首次載入 | 載入事件 0.9 秒、3D 畫面 4 秒出現；底部進度條 120 秒後仍未走完（軟體繪圖，請在真機確認） | 3D 畫面 4 秒出現 | 無（只有 WebGL 效能警告） |
| 2 點選高亮、資訊卡 | 正常，點選後鏡頭不移動 | 正常；排版見 HN-18 | 無 |
| 2 Focus／Isolate／Hide／Clear | 全部正常；Focus 會放大到所選構造，Isolate 只剩 1 件，Hide 後可見件數減 1 | 未逐一測 | 無 |
| 3 搜尋 | 英文名、網站中文名正常；必考清單寫法 6 個搜不到（HN-15）。頭 5 次搜尋要 5–20 秒（模型仍在載入），之後約 0.3 秒 | 正常 | 無 |
| 4 區域分頁（頭頸）、分層解剖、組織深度 | 正常；分層解剖有頭面肌肉五層與枕下三角 | 區域列見 HN-18 | 無 |
| 4 性別切換 | 頭頸畫面不出現（屬骨盆區功能，骨盆會陰核對時測） | — | — |
| 5 腦詳細模式 | 切面（矢狀、冠狀、水平）、逐層剝離、六個視角、CSF 流向八步驟都正常；搜尋確認 HN-03、HN-04、HN-10 | 可開啟，頁面無橫向捲動 | 無 |
| 6 眼詳細模式 | 剝層、切面、眼球動作（六條眼外肌、CN III／IV／VI 麻痺）、眼眶孔（視神經管、眶上裂、眶下裂、眶上孔、前／後篩孔）正常 | 未測 | 無 |
| 7 耳詳細模式 | 已部署網站上隱藏（入口未開） | — | — |
| 8 學習 | 頭頸 33 關；認識→練習→過關測驗流程正常；骨的卡片顯示「資料整理中」 | 可開啟 | 無 |
| 8 Quiz | 出題、作答、答錯顯示正確位置、提早結束、計分、「返去學」連結正常；記住設定失敗（HN-17） | 出題畫面正常 | 無 |
| 8 模擬考試 | 已部署頁面仍顯示「即將推出」（#348 合併後部署可能未完成），下次更新時重測 | — | — |

搜尋 40 個詞（第一個結果）：

| 類別 | 搜得到 | 搜不到 |
|---|---|---|
| 英文名（10） | masseter、temporalis、sternocleidomastoid、facial nerve、hypoglossal nerve、thyroid cartilage、hyoid bone、internal jugular vein | parotid gland（已知缺項）；lingual artery 只出現 lingual nerve（已知缺項） |
| 網站中文名（10） | 咬肌、顳肌、胸鎖乳突肌、顏面神經、舌下神經、甲狀軟骨、舌骨、視神經 | 腮腺（已知缺項）、頸內靜脈（網站寫內頸靜脈） |
| 必考清單寫法（10） | 腦垂體、提嘴角肌、淚神經、頜下腺 | 上咽縮肌、深頸動脈、前大腦動脈、耳咽管咽肌、橫頸動脈、腦橋 |
| 英文別名（10） | CN VII、cranial nerve XII、hypophysis（找到腺垂體）、buccinator | Adam's apple、Eustachian tube、SCM、galea aponeurotica、Circle of Willis、tympanic membrane |

### 13 資訊卡：#346（B04＋B05）核對（使用者指示合併後即核對）

#346 新增的 32 張 Quiz 資訊卡逐欄核對（10 條肌肉：鼻中隔降肌、上中下咽縮肌、顎咽肌、咽鼓管咽肌、莖突咽肌、甲杓肌、環杓後肌、環杓側肌；3 條韌帶：環甲正中韌帶、甲狀舌骨外側韌帶、聲韌帶；19 個器官結構：角膜、鞏膜、玻璃體、視網膜視部、上下瞼板、淚腺、淚小管、淚囊、鼻淚管、舌下腺、下頜下腺、甲狀軟骨、環狀軟骨、氣管、大翼軟骨、鼻中隔軟骨、總腱環、上斜肌滑車）：**未見事實錯誤**（Gray's Anatomy 1918；TeachMeAnatomy；Kenhub；OpenStax Anatomy & Physiology）。用字：卡片用「咽鼓管」，必考清單用「耳咽管」（併入 HN-11）。這些內容不會出現在主圖譜資訊卡（HN-16）。

### 層次核對：頭頸重點關係（使用者 2026-11-16 指定範圍）

方法：用網站實際載入的網格，在固定高度取 4–8 mm 厚的水平斷面，比較各構造在同一斷面的左右（x，離中線距離）與前後（z，正值向前）位置；需要時再按 4–5 mm 分格比較。只用數值，未在 3D 畫面截圖確認。依公開資料核對，請使用者核對。

| 關係 | 應有 | 模型 | 結果 |
|---|---|---|---|
| 頸動脈鞘（頸總動脈段，y 1.43–1.47 m） | 頸總動脈在內、頸內靜脈在外，迷走神經在兩者之間的後方 | 左：頸總動脈 x 16–26、頸內靜脈 x 24–28，迷走神經 z 比兩者都後；右側相同 | 正確 |
| 頸動脈鞘（分叉以上，y 1.49–1.55 m） | 同上（頸內動脈取代頸總動脈） | 頸內靜脈在動脈內側並偏前 | **錯，HN-21** |
| 頸闊肌 → 胸鎖乳突肌 → 頸動脈鞘 | 由淺到深 | y 1.44：頸闊肌 z 30、胸鎖乳突肌 z 21、頸內靜脈 z 17、頸總動脈 z 2 | 正確 |
| 舌骨下肌 | 胸骨舌骨肌在胸骨甲狀肌淺面；肩胛舌骨肌上腹在胸骨舌骨肌外側 | 胸骨舌骨肌 z 12–15 比胸骨甲狀肌 z 4–10 前；肩胛舌骨肌 x 19–25 比胸骨舌骨肌 x 9–11 外 | 正確 |
| 咬肌、下頜支、翼內肌 | 由外到內 | 咬肌 x 42–53 → 下頜支 x 35–43 → 翼內肌 x 26–35 | 正確 |
| 咬肌淺部與深部 | 淺部在外、深部在內 | 深部在外 | **錯，HN-22** |
| 舌下神經與舌骨舌肌 | 舌下神經在舌骨舌肌外側（淺面），舌動脈在其深面 | 舌下神經 x 13–16、舌骨舌肌 x 9 | 舌下神經正確；舌動脈為已知缺項，無法核對 |
| 顏面動脈與顏面靜脈 | 靜脈在動脈後方 | 顏面動脈、顏面靜脈為已知缺項 | 無法核對 |
| 顏面神經分支與腮腺 | 分支在腮腺內分出 | 腮腺為已知缺項 | 無法核對 |
| 喉返神經 | 在氣管食道溝 | 右側正確；左側偏外約 10 mm | **HN-24** |
| 椎動脈 | 經 C6–C1 橫突孔 | C3–C5 斷面上椎動脈 x 約 16 mm，位於椎骨橫突範圍內 | 正確（C6 段為另一件，未比對） |
| 前斜角肌與鎖骨下動、靜脈 | 靜脈在前斜角肌前方；動脈在其後方（前、中斜角肌之間） | 靜脈在前方正確；動脈也在前方 | **錯，HN-23** |
| 膈神經 | 走在前斜角肌前面，入胸時在鎖骨下靜脈後、鎖骨下動脈前 | y 1.45–1.46 貼前斜角肌前面；y 1.42 位於靜脈（z 16）與動脈（z −3）之間 | 正確 |
| 臂神經叢 | 根與幹在前、中斜角肌之間 | 模型只有 C5–C8 神經根近段與各束，沒有幹 | 無法核對 |
| 眶內上部 | 由上而下：額神經、提上眼瞼肌、上直肌 | 眶中段至前段（z 30–40 mm）次序正確；眶尖（z 20–25 mm）三者高度相差 1–3 mm | 正確（眶尖可接受） |

### 12 位置抽查（學習「認識」步驟，黃色標示＋淡色骨骼；預設角度與側面各一張）

| 類別 | 抽查 | 結果 |
|---|---|---|
| 骨 | 右頂骨、額骨、枕骨、右鼻骨、篩骨 | 位置正確 |
| 肌肉 | 右額肌、右顳頂肌、右降眉間肌、右皺眉肌、右顳肌 | 位置正確 |
| 神經 | 右眶上神經、右滑車上神經、右眼神經、右額神經、右上頷神經腦膜支 | 走向大致正確；其他神經同為黃色，難分辨目標（HN-25） |
| 動脈 | 右眼動脈、右內頸動脈、右外頸動脈、右椎動脈、右頸深動脈 | 位置正確 |
| 靜脈 | 右內頸靜脈（學習地圖頭頸只有這一個靜脈） | 位置正確；上段與頸內動脈內外調轉見 HN-21 |
| 韌帶與筋膜 | 帽狀腱膜、右外直肌與內直肌制止韌帶、右水晶體懸韌帶、右翼下頷縫 | 帽狀腱膜範圍與形狀有誤（HN-26）；其餘正確 |
| 關節 | 右顳顎關節盤、關節囊、外側韌帶、蝶下頜韌帶、莖突下頜韌帶 | 外側韌帶標示不在右側（HN-01 3D 證據）；其餘正確 |
| 眼與眼眶（器官結構） | 右上斜肌滑車、右總腱環、右淚腺、右上瞼板、右眼前房 | 位置正確 |
| 腦（腦學習地圖神經類） | 右眼神經、右嗅神經、右視神經、右滑車神經、右動眼神經 | 已截圖，位置未見異常 |
| 耳 | — | 耳詳細模式未部署，未抽查 |

### iPad 排版（1 倍解析度；觸控由使用者用真機測試）

| 畫面 | 橫向 1180×820 | 直向 820×1180 |
|---|---|---|
| 主圖譜頭頸、資訊卡、搜尋 | 沒有溢出或遮擋（搜尋框關閉鍵與右側工具分頁有少量重疊，不影響點按） | 區域列蓋住「Skeleton 骨骼」一行（HN-27） |
| 腦詳細模式 | 正常 | 正常 |
| 眼詳細模式 | 頂部區域列較長，右上角「學習」「Quiz」按鈕被區域列蓋住 | 返回鍵與區域列有少量重疊 |
| 學習地圖、學習關卡 | 正常 | 正常 |
| Quiz 設定 | 自動測試未能進入（找不到「頭頸」按鈕，可能是點擊範圍問題），請以真機確認 | 同左 |

### 13 資訊卡：B02–B05、B07＋B08 獨立核對（2026-11-16，只列錯誤）

範圍：#358（B02＋B03，29 張：25 條神經、睫狀神經節、5 條韌帶筋膜）、#346（B04＋B05，32 張，前已核對）、#365（B07＋B08，20 張：頸內靜脈、13 塊頭骨、5 個顳下頜關節軟組織）。逐欄對照 Gray's Anatomy 1918、TeachMeAnatomy、Kenhub、OpenStax Anatomy & Physiology。

- **未見事實錯誤**；沒有會令溫書學錯的項目。
- 用詞不一致（併入 HN-11，由總管決定統一寫法）：
  - 資訊卡寫「顳下頜關節」，網站名稱與 Quiz 寫「顳顎關節」（例如「右顳顎關節盤」）。
  - 甲狀舌骨外側韌帶內的 triticeal cartilage：#346 寫「麥粒軟骨」，#358 寫「小麥軟骨」。

### 耳 16 項缺項重新核對（耳詳細模式 #367 已部署，2026-11-16）

方法：已部署 `models/ear/ear-atlas.json`（26 件網格，右耳）與耳詳細模式頁面（`#/organ/ear`，載入無 console error；頁面列出 36 項，其中 10 項只有資訊卡）。

| 結果 | 必考清單 id | 結構 |
|---|---|---|
| **已有 3D 模型（14 項，從新缺項移除）** | RS-0439、RS-0311、RS-0745、RS-0899、RS-0571、RS-0700、RS-0627、RS-0714、RS-0715、RS-0009、RS-0701、RS-0901、RS-0705、RS-0706 | 錘骨、砧骨、鐙骨、鼓膜、卵圓窗、圓窗、耳咽管、半規管（前、外、後）、半規導管（三條）、壺腹（三個）、球狀囊、橢圓囊、鼓階、前庭階 |
| **仍缺（2 項）** | RS-0136 | Cochlear duct (scala media) 耳蝸管：只有資訊卡（選取時標示相鄰構造） |
| | RS-0299 | Helicotrema 耳蝸孔：沒有模型，也不在耳詳細模式清單 |

耳以外同一張新缺項表的相關項目：
- RS-0122、RS-0123 Chorda tympani 鼓索神經：耳詳細模式已有模型，從新缺項移除。
- RS-0912 Vestibular ganglion 前庭神經節：只有資訊卡，仍缺。

新缺項總數由 48 個結構改為 33 個（移除耳 14 項與鼓索神經）。用詞：耳詳細模式寫「咽鼓管」，必考清單寫「耳咽管」（併入 HN-11）。建議負責：耳蝸管、耳蝸孔、前庭神經節由總管（耳）決定是否補模型。

---

## 覆核已合併的修正（2026-11-16）

| 編號 | 修正 PR | 覆核方法 | 結果 |
|---|---|---|---|
| HN-01 | #374 | 已部署 `joints.glb` 與 `quiz-head-neck.json`；學習「認識」前面與右側面截圖（[截圖](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/14ed79ea68a742f1048f25fde9533f701ac7d4dc/qa-report/recheck/hn01-hn21-recheck.jpg) 上排） | **已修正**：`Lateral temporomandibular ligament.r` 中心 x −53.2 mm（病人右側），`.l` +53.2 mm；Quiz 左右兩題的範圍同步；右側面可見右顳顎外側韌帶的黃色標示在右顳顎關節。 |
| HN-21 | #375 | 已部署 `neck-vessels.json.gz` 加上載入時的位移表（`app/biomechanics-v2/jugular-align.ts`）逐層斷面；學習「認識」前面與右側面截圖（[截圖](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/14ed79ea68a742f1048f25fde9533f701ac7d4dc/qa-report/recheck/hn01-hn21-recheck.jpg) 下排，學習模式只顯示頸內靜脈本身，內外關係以數值判斷） | **頸內靜脈內外關係已修正**：y 1.45–1.55 m 每一層，頸內靜脈都在頸內／頸總動脈外側 4–11 mm、略偏後 2–5 mm，左右一致。**仍未處理**：頸動脈分叉後約 1 cm（y 1.49–1.51 m）頸內、頸外動脈中心仍幾乎重疊（相差 1–2 mm 以內），應為頸外動脈在前內側、頸內動脈在後外側；建議另列為 HN-21b，交頭頸模型。 |

依公開資料核對，請使用者核對。

---

## 覆核：使用者未審即合併的 PR（2026-11-17）

| PR | 內容 | 覆核方法 | 結果 |
|---|---|---|---|
| #384 | 穹窿體範圍 | 腦詳細模式搜尋與矢狀切面（[截圖](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/0521acf0b3ce1ad223379117ca586a057d5df0fd/qa-report/round2/384-fornix-sag.jpg)）；腦 Quiz 資料 | 清單有左、右穹窿（腳）與單一「Body of fornix 穹窿體」；腦 Quiz 的視交叉、橋腦、中腦、延腦已改為單一結構，並有穹窿體。截圖中穹窿體的標示不明顯，範圍未能目視確認。 |
| #385 | 主圖譜資訊卡共用卡片文字 | 主圖譜 117 個結構以名稱對上卡片，沒有對到不同結構；隨機抽 20 張在網站開啟（[截圖](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/0521acf0b3ce1ad223379117ca586a057d5df0fd/qa-report/round2/385-card.jpg)） | 20 張全部顯示正確結構與對應文字（其中「Right maxilla」顯示名為「Right maxillary bone」，內容正確）。 |
| #388 | 學習／Quiz 紫色高亮 | 學習「神經」第 1 關側面（[截圖](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/0521acf0b3ce1ad223379117ca586a057d5df0fd/qa-report/round2/388-learn-nerve.jpg)） | 目標神經為紫色，與其他黃色神經分得清。HN-25 已解決。 |
| #372 | 骨盆與會陰分頁 | 主圖譜「骨盆與會陰」三個子分頁（[截圖](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/0521acf0b3ce1ad223379117ca586a057d5df0fd/qa-report/round2/372-perineum.jpg)）；`docs/region-members.md`；網格比對 | 子分頁正常。**新問題 PP-03、PP-04**（見下）。 |
| #382 | 咬肌淺部／深部 | 已部署 `facial/atlas.json` 與 Quiz 資料 | 名稱已對調，淺部在外側（中心 |x| 50 mm），Quiz 同步。HN-22 已解決。 |
| #386 | 脊髓前動脈單一名稱 | 主圖譜中英文搜尋與 Focus（[截圖](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/0521acf0b3ce1ad223379117ca586a057d5df0fd/qa-report/round2/386-asa.jpg)） | 只有一項「Anterior spinal artery 脊髓前動脈」，不分左右。 |
| #387 | 用字 | 已部署 Quiz 資料與 main 原始碼 | Quiz 名稱已無「頷／腭」；腦 Quiz 英文 Left／Right 後改小寫；程式中「頷／腭」只留作搜尋別名與自動更正表。仍不一致的用字見下方 HN-28。 |

### 新問題

| 編號 | 區域 | 結構或功能 | 問題 | 證據 | 來源 | 嚴重程度 | 建議負責 |
|---|---|---|---|---|---|---|---|
| PP-03 | 會陰 | superficial perineal muscle 會陰淺肌（`FJ1450`） | 這件網格其實是外肛門括約肌的一部分：與 `FJ2548`「External anal sphincter」頂點數相同（240）、中心完全相同（x −7.4、y 842.5、z −72.4 mm），位置在肛門周圍，不在會陰中心腱前方的會陰淺橫肌位置。會陰分頁與搜尋會把它當成會陰淺肌。 | 網格逐件比對。未在 3D 畫面截圖確認。 | Gray's Anatomy 1918；TeachMeAnatomy | 會令溫書學錯 | 生殖＋內臟 |
| PP-04 | 盆底 | 尾骨肌、恥骨尾骨肌、恥骨直腸肌、外肛門括約肌（左側） | 同一結構有兩件幾乎重疊的網格（`FJ1449M`／`FJ2542`、`FJ1457M`／`FJ2545`、`FJ1458M`／`FJ2546`、`FJ1450M`／`FJ2543`），清單顯示「×3」。「M」結尾的疑為由右側鏡像再改名為左側的副本。 | 中心相差 0.4–5 mm，概念編號相同 | — | 影響使用 | 生殖＋內臟 |
| HN-28 | 全站 | 用字仍與必考清單不一致 | 使用者 2026-11-17 指示跟必考清單用詞統一：(1) 必考清單「顳顎關節」（關節）、「顳下頜韌帶」（韌帶），清單本身兩種都有，請使用者決定；資訊卡多寫「顳下頜關節」。(2) 必考清單「大腦導水管」，#387 把 CSF 頁統一為「中腦導水管」，與必考清單相反。(3) CSF 頁「蛛網膜」「蛛網膜下腔」「蛛網膜顆粒」，必考清單為「蜘蛛膜」。(4) 甲狀舌骨外側韌帶內的 triticeal cartilage：#346「麥粒軟骨」、#358「小麥軟骨」，不在必考清單，請使用者選一個。 | main 原始碼與必考清單 | FIPAT TA2（名詞對照） | 影響使用 | 總管 |

---

## 覆核 #383（HN-23 鎖骨下動脈，使用者 2026-11-17 要求）

方法：用已部署網站的模型資料（2026-11-17 13:24 UTC 抓取），套用與網站相同的載入時位移公式（`app/biomechanics-v2/subclavian-shift.ts` 的數值與中心線），每 6 mm 一段比對前後位置。分支接續：凡是在位移前與左右各 17 件跟隨部件（動脈本身加 16 個分支）相距 2 mm 以內的血管、神經、骨或肺標示，都比對位移前後的最近距離。末端件：逐個連通塊比對。未在 3D 畫面截圖確認。

| 項目 | 結果 |
|---|---|
| 位置 | **已修正**：在前、中斜角肌之間的一段（左右 \|x\| 38–56 mm），動脈 z −15.7～−4.8 mm，前斜角肌 −8.9～−3.2，中斜角肌 −25.5～−14.0，靜脈 +5.8～+17.5（正值為前方），也就是靜脈在前斜角肌前方，動脈在兩肌之間，左右一致。內側端（接主動脈弓／頭臂幹）與外側端（接腋動脈）沒有移動。 |
| 分支連續 | **沒有斷開**：真正相連的血管位移前後距離變化都在 0.15 mm 以內，包括左右椎動脈接續段、腋動脈、頭臂幹、主動脈弓、右頸總動脈、甲狀頸幹、肋頸幹、肩胛上動脈、胸廓內動脈及其下游。距離變大的只有肺內的尖段動脈與靜脈（0.3 → 最多 6.3 mm），以及肺表面的「鎖骨下動脈溝」標示（左 0.5 → 5.8 mm），這兩項在解剖上不和鎖骨下動脈相連，#383 已列為已知限制。 |
| 方塊碎片 | **原本已存在，不是 #383 造成**：左鎖骨下動脈末端件有 6 個收口塊，左胸廓內動脈末端件有 7 個，都是 37 個頂點的小塊。跟著位移的收口塊，與所屬動脈的相對距離位移前後只差 0.5 mm 以內；位置較遠的收口塊位移量是 0。來源網格沒有被 #383 修改（只在載入時位移）。左胸廓內動脈在主動脈弓前方有收口塊突出（鈎狀小片，不是方塊），見 VS-03。 |

依公開資料核對，請使用者核對。

---

## 碎片與尖刺清單（交血管平順；2026-11-17，main 含 #366）

方法：已部署網站，關閉肌肉與結締組織，各區用 Focus 放大後從前、斜後方截圖；可疑處在同一視角點選取得結構名稱。逐檔掃描網格的「分離小塊」與「細長三角形」雜訊太多（血管本來分段、末端連接件、細血管的長三角形），只作輔助，不列入清單。

| 編號 | 區域 | 位置 | 結構（點選或附近候選） | 現象 | 截圖 |
|---|---|---|---|---|---|
| VS-01 | 頸根部、左上胸後方 | 鎖骨後方、第一至第二肋附近（斜後方視角） | 附近候選：左頸深動脈、左肩胛上動脈與靜脈、左第一肋間後動脈、左肺尖段靜脈、副半奇靜脈末端件（位置 x 24–37、y 1.40–1.41 m、z −12～+1 mm） | 多條細血管末端仍呈小三角形箭頭狀尖刺（紅色動脈與藍色靜脈都有，圖中橘色圈）；#383 截圖所見的淺藍色碎片在同一區域 | [頸根部尖刺](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/2a7f782904015edea1d6e66776b18cc3136a1ecf/qa-report/fragments/hn-root-spikes.jpg)、[頸根部前面](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/2a7f782904015edea1d6e66776b18cc3136a1ecf/qa-report/fragments/hn-root-front.jpg) |
| VS-02 | 骨盆 | 直腸上方、骶骨前（骨盆器官分頁，Focus 左髂內動脈後） | Superior rectal artery 上直腸動脈（點選確認） | 與伴行靜脈多處急轉成尖角（鋸齒狀折線） | [骨盆](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/2a7f782904015edea1d6e66776b18cc3136a1ecf/qa-report/fragments/pelvis-superior-rectal.jpg) |
| VS-03 | 頸根部至上縱膈、左側 | 左胸廓內動脈越過主動脈弓前方的一段（x 17–30、y 1.377–1.397 m、z +14～+38 mm） | Left internal thoracic artery 左胸廓內動脈的末端件（`FJ1972-END`，示意件） | 3D 截圖確認（2026-11-17）：胸廓內動脈後方伸出幾片鈎狀、薄片狀的綠色小突起（選取時顯示為綠色），大部分埋入主動脈弓，不是方塊。靜脈開著時被頭臂靜脈遮住看不到，關掉靜脈（例如只看動脈）才看得到。資料上最遠一點離動脈表面約 11 mm。#383 前後位置相同（位移量 0），是末端收口本身的問題。外觀小問題，交血管平順。（先前寫的「方塊」與左鎖骨下動脈內側端突出約 5 mm 一句，是只看數據的推測，截圖沒有看到，已刪除。） | [左胸廓內動脈 4 張](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/7e8b217c1f6a440c9fa57212218faf9cc8d10082/qa-report/fragments/vs03-ita.jpg)（1 靜脈開著；2–4 關掉骨骼、肌肉、結締組織、靜脈、神經：斜前方、上方、左側） |
| — | 腹部 | 胰臟上緣、腹主動脈前 | 黃色小橢圓為 Right celiac ganglion 右腹腔神經節（示意模型），紅色為腹腔動脈幹 | 不是碎片，不列入 | [腹部](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/2a7f782904015edea1d6e66776b18cc3136a1ecf/qa-report/fragments/abdomen-overview.jpg) |

### 全站血管自動掃描（使用者 2026-11-17 要求：不想逐條自己查）

方法：已部署網站的全部 1,614 件動脈、靜脈網格（2026-11-17 15:13 UTC 抓取）。(1) 浮空碎片：每個相連塊與任何其他血管相距 2 mm 以上。(2) 尖刺：頂點比周圍一圈突出 3 倍以上。(3) 錯接：建置時加的「連接管」（末端件；12 mm 內有同類血管就補一條細管）逐條找出另一端插入哪一條血管，再按名稱分類。抽兩處用 3D 截圖確認屬實（VS-03、VS-04）。

**重掃（2026-11-17，本機最新 main，已含 #411）：** VS-04 至 VS-09 的數量不變（VS-07 頸根部、肺尖項目仍在），浮空碎片仍是 12 件。以下限制中「未含 #411」一句已不適用。

**限制：** 抓取時網站上的版本還沒有 #411（頸根部連接管改 12 邊、肺尖與第一肋間血管重做；#411 的部署被之後的部署取消，等 #407 的部署完成後才會上線），所以 VS-07 中頸根部與肺尖的項目要在新版部署後重掃。這是自動篩選，不是逐條目視；連接管另一端若沒有插入任何血管（例如 VS-03 那幾條）就不會被 (3) 抓到，所以清單不是全部。名稱相關的 139 條（多為母血管與分支，例如膕動脈接膝動脈）沒有逐條判斷。

| 編號 | 類別 | 數量 | 內容（連接管由前者接到後者） | 嚴重程度 | 建議負責 |
|---|---|---|---|---|---|
| VS-04 | 睪丸血管接到腸的血管（腹部、骨盆） | 18 條 | 右睪丸動脈 → 迴結腸動脈迴腸支（4）、上腸繫膜動脈（1）；左睪丸動脈 → 左結腸動脈升支（2）、降支（1）、乙狀結腸動脈（2）；右睪丸靜脈 → 上腸繫膜靜脈（2）、迴腸靜脈（1）、右結腸靜脈（1）；左睪丸靜脈 → 乙狀結腸靜脈（3）、下腸繫膜靜脈（1）。解剖上互不相通（睪丸動脈起自腹主動脈；右睪丸靜脈入下腔靜脈，左入左腎靜脈）。截圖：[右睪丸動脈的鈎狀連接管](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/2944b1de68ed5362ddf1868439becb5d1a6a4ef2/qa-report/fragments/vs04-testicular.jpg)（綠色為選取的右睪丸動脈，只開動脈） | 會令溫書學錯 | 血管平順 |
| VS-05 | 肝靜脈接到門靜脈（腹部） | 13 條 | 肝中靜脈及其屬支 → 左門靜脈（7）；肝右靜脈 → 右門靜脈後上段支（3）；肝右靜脈後下段屬支 → 右門靜脈（1）；左門靜脈 → 肝中靜脈及屬支（2）。肝靜脈入下腔靜脈，門靜脈入肝竇，兩者不直接相連。另有肝右靜脈屬支 → 肝動脈分支 2 條（靜脈接到動脈）。 | 會令溫書學錯 | 血管平順 |
| VS-06 | 浮空碎片（腹部為主） | 12 件 | 肝靜脈第 II、III、IV、V、VI、VIII 段的末端件與血管相距 3–14 mm（第 V 段那件 15 mm 以內沒有任何血管）；左、右臍旁靜脈各一段相距 6 mm；左腎動脈後支一小塊（約 3 mm）相距 3.4 mm；食管動脈、胸主動脈食管支各一段相距 2.2 mm。器官打開時多半在肝內看不到，關掉器官才看到。 | 外觀小問題 | 血管平順 |
| VS-07 | 肺內血管接到胸壁或體循環血管（胸腔、頸根部） | 16 條 | 左、右肺多條段靜脈 → 前肋間靜脈（10）；副半奇靜脈 → 左尖段靜脈（2）；右尖段靜脈前部 → 右頭臂靜脈（1）；左鎖骨下動脈 → 左尖段動脈（1）；右胸廓內動脈 → 右尖段動脈尖部（1）；右上段動脈內側支 → 肋間後動脈（1）。肺循環與胸壁血管不直接相連。胸腔已考完，交使用者決定是否現在處理。 | 會令溫書學錯（胸腔已考完） | 血管平順（改補接規則，全身一次修正；胸腔、四肢的截圖核對考試後逐項做） |
| VS-08 | 動脈接到靜脈 | 11 條 | 主要在下肢（膕動脈 → 膕靜脈 3、膝動脈 → 膕靜脈 2、右膕動脈 → 右脛前靜脈 1）與上肢（右前臂正中靜脈 → 右尺動脈、左旋肱前動脈 → 左旋肱前靜脈）；腹部有左腰升靜脈 → 右髂總動脈 1 條。四肢暫停到考試後。 | 影響使用 | 血管平順（改補接規則，全身一次修正；胸腔、四肢的截圖核對考試後逐項做） |
| VS-09 | 骨盆其他可疑連接 | 9 條 | 臀下靜脈 → 陰部內靜脈（左 3、右 5）；右臀下靜脈 → 右骶外側靜脈 1。兩者都是髂內靜脈的屬支，彼此不直接相通。另有右膈下動脈 → 右肋下動脈 1 條（腹部）。 | 影響使用 | 血管平順 |

**根本原因與處理（使用者 2026-11-17）：** VS-03、VS-04、VS-05、VS-07、VS-08、VS-09 都來自建置時同一條規則：「血管末端 12 mm 內有同類血管，就補一條連接管接過去」，沒有檢查兩條血管在解剖上是否相連。由血管平順修改規則，全身一次修正，不分區處理。修正後的截圖核對先做考試範圍（VS-04、VS-05、VS-06、VS-09），胸腔與四肢考試後逐項看。名稱相關的 139 條補接不逐條判斷，等規則改完後重掃一次，看還剩多少條。

尖刺：(2) 只找到 1 處明顯尖錐（右臍旁靜脈，突出約 15 mm，x −13、y 1.038 m、z +98 mm，示意件），併入 VS-06。依公開資料核對，請使用者核對。

### 新問題（資訊卡「區域」欄）

| 編號 | 區域 | 結構或功能 | 問題 | 證據 | 來源 | 嚴重程度 | 建議負責 |
|---|---|---|---|---|---|---|---|
| AB-03 | 腹部、骨盆 | 主圖譜資訊卡「REGION 區域」欄 | 腹部結構標成胸部：Abdominal aorta 腹主動脈、Celiac trunk 腹腔動脈幹、Right gastric artery 右胃動脈、Left gastric vein 左胃靜脈都寫「thorax 胸部」；Sacrum 薦骨、Left internal iliac artery 左髂內動脈寫「abdomen 腹部」（應為骨盆）。疑為按高度自動分區，邊界不準。 | 網站點選資訊卡 | Gray's Anatomy 1918；OpenStax Anatomy & Physiology | 影響使用 | 總管 |

---

## 新 PR 獨立核對（2026-11-17，只列錯誤）

已核對：#393（HN-02 迷走神經卡）、#396（HN-11／HN-28 名稱跟必考清單）、#397（上頜動脈名稱）、#395（主圖譜接上腦資訊卡文字，97 個主圖譜結構逐一比對都是同一構造）。#393、#397、#395 未見錯誤。第二輪（2026-11-17 晚）：#404（眼詳細模式文字）、#406（骨性標誌；女性版幾何未在 3D 畫面確認）、#408（HN-21b）、#409（HN-24）未見錯誤；HN-24 已修正，左喉返神經在 1.39–1.455 m 位於氣管外側壁外 1.5–2 mm、氣管後緣高度，即氣管食道溝。#411（頸根部尖刺）本輪未在 3D 畫面覆核。

| 編號 | PR | 問題 | 證據 | 來源 | 嚴重程度 | 建議負責 |
|---|---|---|---|---|---|---|
| HN-29 | #396 | Arachnoid mater、Subarachnoid space 顯示名改為「蛛網膜」「蛛網膜下腔」，必考清單用「蜘蛛膜」「蜘蛛膜下腔」（RS-0047、RS-0763，另有 RS-0046「蜘蛛膜顆粒」），與使用者「跟必考清單統一」的指示相反。另外 #396 已自行選定 HN-28 尚待使用者決定的兩項（顳顎關節／顳下頜韌帶並用、麥粒軟骨），請使用者確認。 | `app/mj-required-names.json`（#396）與 `docs/required-structures/head-neck.json` | FIPAT TA2（名詞對照） | 影響使用 | 總管 |
| HN-30 | #409 覆核時發現（#409 之前已存在） | 左、右喉返神經（Left／Right recurrent laryngeal nerve，建置時產生的示意管）上端在環狀軟骨下緣（y 1.459–1.471 m）向中線匯合並**交叉**：左側末端到 x −4～−9 mm（病人右側），右側末端到 x +8 mm（病人左側），後面看成 X 形。應各自在同側、甲狀軟骨下角（環甲關節）後方入喉，不越過中線。 | 已部署資料逐層斷面（左 y 1.455 m x +11.6 → 1.467 m x −4.1；右 1.456 m x −5.0 → 1.468 m x +7.9；左、右環杓後肌各在 x +1～+10、−11～−2）；只開神經系統的後方 3D 截圖：[喉返神經上端交叉](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/c664c5205ebb2d05227d15439996634b6bdcf636/qa-report/newpr/hn30-rln.jpg)（畫面中上方細的兩條） | Gray's Anatomy 1918；TeachMeAnatomy；Kenhub | 會令溫書學錯 | 頭頸模型 |

### 新 PR 第六輪（2026-11-21；#444 在本機 build：main＋#444 分支合在一起，只在本機，沒有推送）

| 編號 | PR | 問題 | 證據 | 來源 | 嚴重程度 | 建議負責 |
|---|---|---|---|---|---|---|
| HN-35 | #444（未合併） | 分水嶺區的定義寫反：步驟 4 說明「突然阻塞或環不完整時，同側中大腦動脈供血區最容易缺血（遠離各動脈的交界區，稱分水嶺區，最先受影響）」，容易讀成分水嶺區是「離開交界區」的地方。分水嶺區正是相鄰動脈供血區的交界帶，也是離各動脈起點最遠的區域。建議改為「各動脈供血區交界、離動脈起點最遠的地帶（分水嶺區）最先受影響」。 | `app/willis/willis-data.ts` 步驟 4 說明 | Radiopaedia；Kenhub | 會令溫書學錯 | 總管（轉交 #444 作者） |
| HN-36 | #444（未合併） | 左後大腦動脈（後交通支之後）阻塞的結果寫「可出現對側同側偏盲」，「對側」與「同側」並列，讀起來自相矛盾。建議改為「對側同向偏盲（homonymous hemianopia）」。 | `app/willis/willis-data.ts` BLOCK_CHOICES `p2-l`；[桌面截圖](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/4bb7a0aedce288597ed90fb045bf195be1a3bbbb/qa-report/willis444/desktop-block-left-p2.jpg)右欄紅框 | Kenhub；Radiopaedia | 影響使用 | 總管（轉交 #444 作者） |
| HN-37 | #444（未合併） | 阻塞後，其他供血區的血流顯示為 101–109%（例如右中大腦動脈阻塞時，右前大腦動脈供血區顯示 106%）。這是簡化計算模型的數字，不代表真的增加血流，可能令人以為側支會使血流超過正常。建議顯示上限為 100%，或在說明中註明。 | 本機逐項計算（12 個阻塞選項 × 完整環、後交通支細小）；[桌面截圖](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/4bb7a0aedce288597ed90fb045bf195be1a3bbbb/qa-report/willis444/desktop-block-left-ica.jpg) | — | 影響使用（不影響考試內容） | 總管（轉交 #444 作者） |

**#444 功能測試**（本機 `vite build` + `vite preview`；桌面 1440×900 用滑鼠；iPad 直向 820×1180、橫向 1180×820 用 Playwright 觸控模擬、1 倍解析度。**這是模擬，不等於 iPad 真機**）：

- 步驟 1–4、上一步、下一步、播放／暫停、重設視角、速度滑桿（0.2–1.6×）、「後交通支細小」與「自動切換下一步」核取方塊、12 個阻塞選項都能操作；Esc 與「關閉」都會回到腦部詳細模式（頁面標題也會還原）；再開再關正常。沒有頁面錯誤。
- 沒有元件被蓋住、被裁切或需要橫向捲動；直向轉橫向後版面正常（[iPad 直向](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/4bb7a0aedce288597ed90fb045bf195be1a3bbbb/qa-report/willis444/ipad-portrait-block.jpg)、[iPad 橫向](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/4bb7a0aedce288597ed90fb045bf195be1a3bbbb/qa-report/willis444/ipad-landscape-thin-pcoa.jpg)）。
- 左右方向正確：腦底由下往上看，病人左側在畫面右邊；阻塞左內頸動脈時，紅色叉號與「血流下降」的黃色區都在病人左側，右中大腦動脈阻塞時缺血區在病人右側外側面。
- 小問題（不影響使用）：阻塞選單高 36 點、兩個核取方塊 24 點（連文字的點按範圍已超過 44 點），低於 iPad 建議的 44 點；直向時控制列在說明文字上方，但步驟 4 說明寫「在下方選一條動脈阻塞」；步驟 4 的圖例只說明黃色與紅色，沒有說明正常供血區仍保留步驟 3 的顏色。

其餘說明文字（Willis 環的組成與位置、內頸動脈與椎動脈的走向、三條大腦動脈的供血區、各阻塞選項的側支路徑、動脈瘤好發位置）**未見錯誤**，依公開資料核對，請使用者核對。

其他 PR，**未見錯誤**（依公開資料核對，請使用者核對）：

- #449（已合併）：腹主動脈不成對分支 35 張資訊卡，逐欄核對來源、走向、分支與供應範圍。
- #455（草稿）：頸外動脈 8 條分支資訊卡（上甲狀腺、升咽、舌、顏面、枕、後耳、上頜、淺顳動脈），逐欄核對；中文名與必考清單相同（顏面動脈、後耳動脈、中腦膜動脈、副腦膜動脈、深耳動脈、橫面動脈）。另外，耳詳細模式的說明仍用「耳後動脈」「腦膜中動脈」，與必考清單不同，建議日後一併統一（不影響這個 PR）。

### 新 PR 第五輪（2026-11-18；#433 用它自己的分支在本機 build，因為它與最新 main 有衝突）

| 編號 | PR | 問題 | 證據 | 來源 | 嚴重程度 | 建議負責 |
|---|---|---|---|---|---|---|
| HN-31 | #433（未合併） | 「Angle of mandible 下頜角」英文說明寫成人的下頜角比幼兒與老人「更開」（more open），方向相反：幼兒與老年人（無牙）的下頜角較鈍，成人較接近直角。中文寫法正確，中英互相矛盾。 | `scripts/paokao-structures/head-bone-landmarks.mjs` angle of mandible 的說明 | Gray's Anatomy 1918 | 會令溫書學錯 | 頭頸模型 |
| HN-32 | #433（未合併） | 「Foramen rotundum 圓孔」中文寫「由前向後穿過蝶骨大翼」，方向相反：圓孔由中顱窩向前通到翼顎窩（英文寫法正確）。 | 同上，foramen rotundum 的說明 | Gray's Anatomy 1918；TeachMeAnatomy | 影響使用 | 頭頸模型 |
| HN-33 | #433（未合併） | 7 個中文名與必考清單不同：下頜枝（清單：下頜骨支）、大顎孔（顎大孔）、小顎孔（顎小孔）、眶上裂（上眶裂）、顳下嵴（顳下脊）、岩鼓裂（岩鼓溝）、內耳道（內聽道）。眶上裂在眼詳細模式也用同一寫法，請一併決定；另一寫法可做搜尋別名。 | 與 `docs/required-structures/head-neck.json` 逐名比對 | FIPAT TA2（名詞對照） | 影響使用 | 頭頸模型（名稱交總管統一） |

其餘**未見錯誤**（依公開資料核對，請使用者核對）：

- #433 共 36 種、72 個標示（左右各一，蝶骨體與枕骨大孔各一）全部在正確一側；相對位置合理：視神經管在眶上裂內側，圓孔在眶上裂內端下方，卵圓孔在圓孔後外側，棘孔再後外側，破裂孔在最內側，頸動脈管在其後外側，內耳道、舌下神經管、枕骨大孔依序向後；下頜窩在外耳道前方、關節結節再前，岩鼓裂在兩者之間；大顎孔在小顎孔前方；眶上孔與眶下孔在同一垂直線；頸動脈結節與環狀軟骨同高。顴弓兩段合成一個可點選結構，沒有重複名稱。其餘說明文字未見錯誤。位置以本機 build 的網格中心核對，**未逐項在 3D 畫面確認**。#433 與最新 main 有衝突（生成檔與 `scripts/check-stability.mjs`），需由負責的工作階段合併 main 後重新生成。
- #430（已合併）：31 張腸、肝膽、腎門資訊卡逐欄核對，未見事實錯誤；AB-06（胃卡毗鄰句子）已修正。
- #426 已合併，但 AB-04（18 個名稱）與 AB-05（左迷走神經卡）合併時尚未修正，仍待腹部內臟處理。

### 新 PR 第四輪（2026-11-18；本機 build：main（含 #425）＋#426＋#427，只在本機，沒有推送；#426 與 main 只有 `docs/stability-baseline.md` 衝突，本機取 main 版本只為測試）

| 編號 | PR | 問題 | 證據 | 來源 | 嚴重程度 | 建議負責 |
|---|---|---|---|---|---|---|
| AB-04 | #426（未合併） | 胃詳細模式 18 個中文名與必考清單不一致：腹腔幹（清單：腹腔動脈幹）、胃左／胃右動脈（左胃／右胃動脈）、肝總動脈（總肝動脈）、胃網膜右／左動脈（右胃網膜／左胃網膜動脈）、胃短動脈（短胃動脈）、胃後動脈（後胃動脈）、胃左／胃右靜脈（左胃／右胃靜脈）、胃網膜右／左靜脈（右胃網膜／左胃網膜靜脈）、胃短靜脈（短胃靜脈）、腸繫膜上靜脈（上腸繫膜靜脈）、門靜脈（肝門靜脈）、腹腔神經叢（腹腔叢）、脾（脾臟）、胰（胰臟）；另「幽門（幽門部）」「胃皺襞（胃褶）」比清單多了括號。同一頁的「胃」資訊卡又寫「左胃動脈、右胃網膜動脈」，前後不一。#425 的胃與十二指腸資訊卡用的是清單寫法。 | `app/organ/organs/stomach.ts`、`stomach-supply.ts`（#426）與 `docs/required-structures/abdomen.json` 逐名比對 | FIPAT TA2（名詞對照） | 影響使用 | 腹部內臟 |
| AB-05 | #426（未合併） | 左迷走神經資訊卡寫「從胸部下行到食道上段，之後轉到食道前面」。左迷走神經經主動脈弓前方、左肺根後方下行，到肺根以下的食道中下段才轉到食道前面形成食道叢，不是食道上段。 | `stomach-supply.ts` Left vagus nerve 的位置欄 | Gray's Anatomy 1918；TeachMeAnatomy | 影響使用 | 腹部內臟 |
| AB-06 | #425（已合併） | 「胃」卡毗鄰中文寫「前面隔著橫膈與前腹壁貼肝左葉」，讀起來像隔著橫膈與腹壁才貼到肝。實際上橫膈、前腹壁與肝左葉都是胃前面的毗鄰（英文版正確）。建議改為「前面鄰橫膈、前腹壁與肝左葉」。 | `app/quiz/card-data.ts` stomach 毗鄰欄 | Gray's Anatomy 1918 | 影響使用 | 總管（分派腹部資訊卡） |

其餘**未見錯誤**（依公開資料核對，請使用者核對）：

- #425 其餘 24 張胃、十二指腸資訊卡逐欄核對（位置、組成、毗鄰、血供、神經、作用），未見事實錯誤。
- #426 胃詳細模式：器官、動脈、靜脈、神經、全部五種視圖都能開，沒有頁面錯誤。前面觀中，胃底與胃大彎在病人左側，幽門在右側，門靜脈在中線右側，分區顏色與胃大彎標線位置合理（[四種視圖](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/6a403fb6ea43b2e9e95a5e4a8aca4f65ca0e352f/qa-report/newpr/round4-426-stomach.jpg)）。55 個結構的資訊卡除 AB-05 外未見事實錯誤。Quiz 胃篇未在網站上操作。
- #427 耳部動畫修正（本機觸控模擬、1 倍，直向 820×1180、橫向 1180×820）：EA-01 所有按鈕都已達 44 點以上（核取方塊 24 點，但連文字的點按範圍超過 44 點；滑桿高 28）；EA-02 展開圖不再蓋住最大振動點；EA-03 Tunnel 標籤不再被線條壓住，直向放大圖縮小，看得到 3D 畫面（[直向展開圖與柯蒂氏器](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/6a403fb6ea43b2e9e95a5e4a8aca4f65ca0e352f/qa-report/newpr/round4-427-ear.jpg)）。功能測試同上次全部通過。EA-01 至 EA-03 待 #427 合併後即解決。

### 新 PR 第三輪（2026-11-17 深夜；本機 build：main（含 #419）＋#421＋#423 合在一起，只在本機，沒有推送）

只列錯誤；以下 PR 都**未見錯誤**，依公開資料核對，請使用者核對。

| PR | 內容 | 核對方法與結果 |
|---|---|---|
| #421（未合併） | HN-30 喉返神經上端 | 已修正：左、右喉返神經全程留在同側（左 x +9.6～+17.3 mm、右 −78.5～−5.4 mm），上端在環甲關節後方附近（左 x +9.6～+12.6、右 −13.4～−9.8、z −7.6～−4.3 mm），不再交叉。[只開神經系統的後方截圖](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/6671d04d83fd2e462b2b51035018a5c5ea2ae67d/qa-report/newpr/round3-rln-neckroot.jpg)（左半張）。HN-30 待 #421 合併後即解決。 |
| #423（未合併） | PP-02、PP-03、PP-04 | PP-03、PP-04：5 件重疊網格（`FJ1450`、`FJ1450M`、`FJ1449M`、`FJ1457M`、`FJ1458M`）已從圖譜移除。PP-02：用 5 mm 方格比較，左右陰蒂腳與前庭球全部在女性提肛肌下表面以下 2.1–5.8 mm（原本最多高出 15 mm）；抬高前後，提肛肌與陰道、直腸的穿插比例相同，沒有因抬高而增加。另外：移除 `FJ1450` 後網站沒有任何「會陰淺橫肌」結構；它是必考清單要求的 3D 結構，已列在會陰缺項模型清單（會陰肌肉排定 12/1 前完成），不算 #423 的錯誤。 |
| #419（已合併） | AB-01 腎門次序 | 用網站同一套載入時位移公式計算：腎門處由前到後為腎靜脈、腎動脈、腎盂。左（距中線 30–38 mm）z 約 +0.6／−10.5／−22.5 mm；右（30–42 mm）約 +4.1／−4.1／−12.2 mm。AB-01 已解決。腎竇內較深處（距中線 42 mm 以外）靜脈與動脈前後相近，屬腎內分支，不影響腎門次序。未在 3D 畫面截圖確認。 |
| #422（未合併） | 耳說明文字 | 前庭階繞蝸軸改為「約兩圈半」，與公開資料一致。 |
| #418（未合併） | 眼詳細模式 Quiz | 只看程式與資料（題目取自眼詳細模式的結構與眼眶孔，卡片用眼詳細模式的說明文字），未見錯誤；網站上的實際操作待合併後測試。 |
| #411（已合併） | 頸根部尖刺 | 本機 build 只開動脈與靜脈，從後斜方與前斜方看頸根部：細血管末端為圓頭，沒有看到三角形尖刺（[後斜方截圖](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/6671d04d83fd2e462b2b51035018a5c5ea2ae67d/qa-report/newpr/round3-rln-neckroot.jpg)右半張）。 |

### #407 耳部聽覺傳導動畫：iPad 模擬測試（總管轉交，2026-11-17）

方法：本機最新 main（含 #407、#411）`vite build` + `vite preview`；Playwright 觸控模擬（hasTouch）、1 倍解析度，直向 820×1180、橫向 1180×820。**這是模擬，不等於 iPad 真機**，手指實際觸控仍由使用者用真機測。逐項：步驟 1–6、上一步／下一步、播放／暫停、自動切換、三條滑桿用觸控拖到頭尾、展開圖開關、開著動畫轉向、關閉後回到耳部詳細模式。截圖：[直向 4 張](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/ba932b860455e6f2dbb07a63f9ceab1a51dc9241/qa-report/ipad407/ipad-407-portrait.jpg)（步驟 1、4、6、展開圖）、[橫向 4 張](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/ba932b860455e6f2dbb07a63f9ceab1a51dc9241/qa-report/ipad407/ipad-407-landscape.jpg)、[直向展開圖](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/ba932b860455e6f2dbb07a63f9ceab1a51dc9241/qa-report/ipad407/portrait-unrolled.png)。

結果：所有按鈕與滑桿都能操作（滑桿用觸控拖動可到最小與最大值：頻率 20 Hz–20 kHz、音量 15–100%、速度 0.2–1.2×）；沒有元件被蓋住、被裁切或需要橫向捲動；轉向後版面正常；關閉後回到耳部詳細模式。只列問題：

| 編號 | 項目 | 問題 | 證據 | 嚴重程度 | 建議負責 |
|---|---|---|---|---|---|
| EA-01 | 觸控目標 | 多數按鈕高度低於 iPad 建議的 44 點：步驟按鈕 36、上一步／播放／下一步 38、右上「關閉」58×36、展開圖內「關閉」50×32、「自動切換下一步」核取方塊 13×13（連文字 103×19）；滑桿可拖動範圍高 16。手指點按容易點不中或點錯旁邊的步驟。 | 兩種方向量得的元件大小（同上方法） | 影響使用 | 總管 |
| EA-02 | 步驟 3 展開圖 | 展開圖面板蓋住右上角的「最大振動點」標籤，只露出最後一個字「z」（直向、橫向都是）。展開圖內已有「最大振動 Peak」字樣，資訊沒有缺少。 | [直向展開圖](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/ba932b860455e6f2dbb07a63f9ceab1a51dc9241/qa-report/ipad407/portrait-unrolled.png) 右上 | 外觀小問題 | 總管 |
| EA-03 | 步驟 4 柯蒂氏器放大圖 | 「Tunnel 柯蒂氏隧道」標籤被柱細胞的線條壓住，中文字不易辨認。直向時放大圖幾乎蓋住整個 3D 畫面，看不到 3D 模型上的柯蒂氏器標示（橫向正常）。 | [直向 4 張](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/ba932b860455e6f2dbb07a63f9ceab1a51dc9241/qa-report/ipad407/ipad-407-portrait.jpg) 第 2 張 | 外觀小問題 | 總管 |

步驟 1–6 說明文字順帶看過，未見事實錯誤（依公開資料核對，請使用者核對）。

---

## 覆核 #431 血管補接規則（2026-11-21，本機最新 main 已含 #431）

### 錯接連接管（我的全站掃描，與 11/17 同一方法）

| 類別 | #431 前 | #431 後 | 說明 |
|---|---|---|---|
| VS-04 睪丸血管接到腸的血管 | 18 | **0** | 已解決 |
| VS-05 肝靜脈接到門靜脈 | 13 | **0** | 已解決 |
| VS-07 肺內血管接到胸壁或體循環血管 | 16 | 1 | 剩左鎖骨下動脈 → 左尖段動脈（胸腔，考試後） |
| VS-08 動脈接到靜脈 | 11 | 9 | 8 條在四肢（膕動脈 → 膕靜脈等，考試後）；**1 條在腹部：左腰升靜脈 → 右髂總動脈**（使用者 2026-11-21：一定是錯接，交血管平順 11/27 前修） |
| VS-09 臀下靜脈接到陰部內靜脈等 | 9 | 9 | 未改：新規則把「髂內血管與骨盆分支」列為同一家族，所以容許。**使用者 2026-11-21 決定算錯接**（兩者各自流入髂內靜脈，不直接相連），交血管平順 11/27 前修，不可加例外 |
| VS-06 浮空碎片 | 12 | 12 | 未處理；使用者 2026-11-21 交血管平順 11/27 前修。**11/22 更正：** 其中肝靜脈 7 件不是幾何斷開，見下方說明；實際浮空 5 件 |
| 名稱不相關的其他補接（11/17 的 139 條） | 139 | 93 | 多為母血管與分支，未逐條判斷 |

**VS-06 更正（2026-11-22，血管平順詢問掃描方法時重新核對）：** 原掃描只納入 arterial／venous 系統。肝靜脈第 II、III、IV、V、VI（2 塊）、VIII 段的末端件（`FJ2818-END` 至 `FJ2824-END`）屬 venous，但它們的母網格 `Hepatovenous segment II…VIII`（`FJ2818` 等）在圖譜上屬 digestive，所以被漏掉。重新量：這 7 塊到各自母網格只有 0.5–1.1 mm，**不是幾何斷開**。不過畫面上確實會看到浮空：只開血管、關掉器官時，母網格隱藏，末端件留下。這是「末端件與母網格不屬同一系統」的顯示問題，已轉告血管平順。實際浮空只剩 5 件：左腎動脈後支一小塊（3.4 mm，未套用腎門載入位移）、左右臍旁靜脈各一段（約 6 mm，示意件），以及胸腔兩件食管動脈（2.2 mm，接近門檻，考試後看）。

### 四肢斷開

用專案的連續性工具（`audit-vessel-continuity.mjs --segments`，只讀）量靜止姿勢：四肢仍有 **93 處**血管與下一段之間的間隙大於管徑一半（上肢 54、下肢 39）。其中 **31 處**是 #431 移除誤接後新露出來的（上肢 19、下肢 12；#431 自報 32 處），其餘 62 處 #431 之前已存在。另有 #431 登記的動作例外 10 對、穩定度例外 8 項（極限姿勢下才出現，最大 42.7 mm：左股深靜脈 → 左髂外靜脈）。截圖：[左膝後方動脈上端截斷、肘窩正中肘靜脈末端未接上](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/5f5fbea3e7d25b5176a4c5688419a1585b71d5a0/qa-report/vessels/431-limb-gaps.jpg)。

新露出的 31 處（間隙由大到小）：

| 區域 | 血管 → 下一段 | 間隙（mm） |
|---|---|---|
| 下肢 | Left popliteal vein → Left genicular vein | 28.0 |
| 下肢 | Right posterior tibial vein → Right fibular vein | 22.9 |
| 下肢 | Right fibular vein → Right posterior tibial vein | 20.1 |
| 下肢 | Right fibular vein → Right posterior tibial vein | 18.3 |
| 下肢 | Right deep femoral artery → Right femoral artery | 17.7 |
| 下肢 | Left deep femoral artery → Left perforating branch of deep femoral artery | 17.6 |
| 下肢 | Set of perforating arteries → Set of perforating arteries | 17.5 |
| 下肢 | Left popliteal artery → Left femoral artery | 17.3 |
| 下肢 | Set of perforating arteries → Set of perforating arteries | 14.9 |
| 下肢 | Left medial superior genicular artery → Left anterior tibial recurrent artery | 9.8 |
| 下肢 | Left anterior tibial vein → Left anterior tibial vein | 7.6 |
| 下肢 | Plantar venous arch of left foot → Plantar metatarsal vein | 5.3 |
| 上肢 | Left median cubital vein → Left basilic vein | 26.5 |
| 上肢 | Right median cubital vein → Right cephalic vein | 26.4 |
| 上肢 | Right median cubital vein → Right basilic vein | 24.9 |
| 上肢 | Left median cubital vein → Left basilic vein | 21.3 |
| 上肢 | Pectoral branch of left thoraco-acromial artery → Trunk of left thoraco-acromial artery | 19.3 |
| 上肢 | Acromial branch of right thoraco-acromial artery → Trunk of right thoraco-acromial artery | 17.9 |
| 上肢 | Right superficial palmar arterial arch → Right first common palmar digital artery | 17.7 |
| 上肢 | Pectoral branch of right thoraco-acromial artery → Trunk of right thoraco-acromial artery | 16.4 |
| 上肢 | Left median cubital vein → Left basilic vein | 15.8 |
| 上肢 | Right anterior circumflex humeral vein → Right axillary vein | 15.0 |
| 上肢 | Right superficial palmar arterial arch → Right ulnar artery | 13.8 |
| 上肢 | Dorsal venous network of left hand → Left cephalic vein | 12.2 |
| 上肢 | Middle collateral branch of left deep brachial artery → Left deep brachial artery | 8.0 |
| 上肢 | Middle collateral branch of left deep brachial artery → Left deep brachial artery | 7.5 |
| 上肢 | Right posterior interosseous artery → Right common interosseous artery | 5.4 |
| 上肢 | Left recurrent interosseous artery → Left common interosseous artery | 5.1 |
| 上肢 | Medial proper palmar digital artery of right index finger → Lateral proper palmar digital artery of right middle finger | 4.5 |
| 上肢 | Left palmar metacarpal vein → Left radial vein | 1.4 |
| 上肢 | Left deep palmar venous arch → Left radial vein | 0.7 |

其中較顯眼的是主幹斷開：左膕動脈與左股動脈之間 17.3 mm、右股深動脈與右股動脈之間 17.7 mm、左膕靜脈與膝靜脈 28.0 mm、兩側正中肘靜脈與貴要／頭靜脈 21–27 mm。四肢已考完，使用者 2026-11-18 批准考試後第一優先修。

### 其他已合併 PR

- #443（胸管頸段、右淋巴管）：胸管在左側上行，於約第 7 頸椎高度拱起，終點距左靜脈角 0.7 mm；右淋巴管長 15 mm，終點距右靜脈角 1.3 mm。未見錯誤（數據核對，未在 3D 畫面截圖）。
- #433（未合併）：HN-31、HN-32 已修正，HN-33 的 7 個名稱已改成必考清單寫法；已合併 main，無衝突。HN-34（眶上裂／上眶裂兩種寫法）由 #446 處理。
- #446（未合併）：與 main 有衝突；胃詳細模式約 12 個舊名（腹腔幹、胃左動脈、肝總動脈、門靜脈、脾、胰等）未改；使用者 2026-11-21 已決定髂脊、坐骨粗隆、恥骨粗隆、第十一肋骨、第十二肋骨、陰蒂體（陰蒂海綿體）照必考清單，舊寫法留作別名，已轉交總管派回原作者。

## 神經連續性：頭頸、腹部、骨盆與會陰（2026-11-22，使用者要求；四肢考試後）

方法：用本機最新 main（#459）的 `vite build` + `vite preview`，取出網站載入的全部神經網格，包括主圖譜 229 個（含示意件）和周邊神經層 237 個。靜止姿勢，單位 mm；x 正值為病人左側。檢查三項：(1) 末端懸空：網格的一塊離任何其他神經都超過 2 mm；(2) 沒有接上母神經：整條神經不接觸任何神經，或者沒有接回應接的母神經或神經叢；(3) 中段斷開：同一網格內兩段之間有超過 1.5 mm 的空隙，而且旁邊沒有其他神經補上。

圖是**網站載入資料的投影圖，未在 3D 畫面確認**：周邊神經層在無頭瀏覽器等了 12 分鐘仍未載入，網站 3D 截圖看不到這些神經。紅線是缺口，旁邊寫距離。

| 編號 | 區域 | 問題 | 證據 | 嚴重程度 | 建議負責 |
|---|---|---|---|---|---|
| NV-01 | 頭頸 | 左、右頦神經（Mental nerve）是孤立的一小段，在頦孔附近浮空：離最近的神經 16 mm，離下頜神經後支 61 mm。網站沒有下齒槽神經（Inferior alveolar nerve，必考清單有），所以頦神經接不回下頜神經。 | [投影圖](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/d4e527ac5e945d17912b5178a8a551967c241165/qa-report/nerve1122/nf1-mental.jpg)；周邊神經層 `Mental nerve.l/.r` | 會令溫書學錯（看不出頦神經是下齒槽神經的延續） | 頭頸模型 |
| NV-02 | 頭頸 | 左、右膈神經（示意件 `Right/Left phrenic nerve`）上端停在 y 約 1485 mm，沒有接上 C3–C5：離 C5 約 5 mm、C4 約 11 mm、C3 約 26 mm。右側上端反而只離迷走神經 1.7 mm，看起來像從迷走神經分出。 | [投影圖](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/d4e527ac5e945d17912b5178a8a551967c241165/qa-report/nerve1122/nf2-phrenic.jpg) | 會令溫書學錯（膈神經來源 C3–C5 是常考點） | 頭頸模型 |
| NV-03 | 腹部 | 迷走神經後幹（示意件 `Posterior vagal trunk`）整條沒有接觸任何神經：上端離食道叢 4.7 mm，下端離腹腔神經節約 40 mm。前幹則有接上食道叢。 | [投影圖](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/d4e527ac5e945d17912b5178a8a551967c241165/qa-report/nerve1122/nf3-vagal.jpg) | 影響使用 | 腹部內臟（示意神經） |
| NV-04 | 腹部 | 左、右上腸繫膜神經節（示意件）各自浮空，沒有接觸其他神經節或內臟神經：右側離左主動脈腎神經節 2.8 mm，左側離右上腸繫膜神經節 5.0 mm。 | [投影圖](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/d4e527ac5e945d17912b5178a8a551967c241165/qa-report/nerve1122/nf4-smg.jpg) | 外觀小問題 | 腹部內臟（示意神經） |
| NV-05 | 骨盆與會陰 | 薦神經叢沒有建模：坐骨神經、陰部神經、臀下神經、閉孔內肌神經、股後皮神經等一整組（每側 31 條，連到下肢）互相連着，但沒有接回脊神經；坐骨神經上端離最近的脊神經前根約 91 mm。陰部神經只接觸臀下神經和股後皮神經根。 | [投影圖](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/d4e527ac5e945d17912b5178a8a551967c241165/qa-report/nerve1122/nf5-gluteal-sacral.jpg)（橙＝坐骨、紫＝陰部、綠＝臀下、藍＝脊神經前根） | 會令溫書學錯（看不出陰部神經來自 S2–S4） | 生殖＋內臟（骨盆）；總管決定是否補薦神經叢 |
| NV-06 | 骨盆與會陰 | 左、右臀上神經整條浮空：離最近的神經 7.4–7.8 mm，也沒有接上薦神經叢（NV-05）。 | 同上圖（紅） | 影響使用 | 同 NV-05 |
| NV-07 | 腹部 | 交感幹（`Sympathetic trunk`）只到 y 約 1133 mm（約第 12 胸椎至第 1 腰椎）就停了，腰段與薦段沒有建模；必考清單有交感幹、腰內臟神經、骨盆內臟神經。 | 周邊神經層 `Sympathetic trunk.l/.r`，y 1133–1504 mm | 影響使用（缺模型，不是斷開） | 腹部內臟 |

**排除的項目（不是問題）：** 交感神經分支、脊神經節、脊神經前根與後根、肋間神經、胸神經背側支。這些網格本來就是每個節段一塊，節段之間有空隙屬正常。交感幹本身在胸頸段是連續的一整條。右股外側皮神經在初掃時被列入，複查後它其實接上股神經（0.1 mm），屬取樣誤差。腦內構造不在主畫面顯示，不列入。

依公開資料核對神經的來源與走向，請使用者核對。

## 必考清單缺項：每日重算

方法同「必考清單覆蓋核對」一節（本機最新 main）。

| 日期 | 腹部：已有／只有資訊卡／只有組成部分／缺（共 428） | 骨盆與會陰 3D 模型：已有／只有組成部分／缺（共 169） | 區域標示：已有／缺（共 170） | 僅資訊卡：已有／缺（共 50） |
|---|---|---|---|---|
| 2026-11-18 | 179／35／6／**208** | 85／11／**73** | 24／**146** | 3／**47** |
| 2026-11-21 | 180／34／6／**208** | 85／11／**73** | 24／**146** | 3／**47** |
| 2026-11-22 | 180／39／6／**203** | 85／11／**73** | 24／**146** | 3／**47** |

11/18 至 11/21 沒有新增的必考結構合併入 main（期間合併的是胃詳細模式修正、血管規則、胸管、Quiz 資料等）。

11/22：腹部缺項由 208 減為 203，因為 #449 新增動脈資訊卡，5 項由「缺」變為「只有資訊卡」（左胃動脈食道支、胰大動脈、上胰十二指腸動脈、十二指腸上動脈、空腸動脈）；這 5 項仍沒有 3D 模型。骨盆與會陰沒有變化（#452 會陰肌肉仍是草稿，未合併）。

## 學習、Quiz、模擬考試：腹部、骨盆與會陰（2026-11-18）

方法：本機最新 main 的 `vite build` + `vite preview`；桌面 1440×900，iPad 直向 820×1180、橫向 1180×820（觸控模擬、1 倍，不等於真機）。Quiz 判分用網站同一個函式（`app/quiz/naming.ts` 的 `judgeName`）逐一測試必考清單寫法。

| 編號 | 項目 | 問題 | 證據 | 嚴重程度 | 建議負責 |
|---|---|---|---|---|---|
| FT-01 | 學習、Quiz、模擬考試的區域 | 只有下肢、上肢、胸腔、背部、心、肺、腦、耳、頭頸與胃。**沒有「骨盆與會陰」與「腹部」區域**（胃除外），這兩區的必考結構都不能進入學習關卡、Quiz 或模擬考試。登記表也沒有這項工作。 | `app/quiz/catalogue.ts` 的 `QuizRegionId`；本機學習、Quiz 與模擬考試頁的區域清單 | 影響使用（考試範圍的完成標準未達） | 總管 |
| FT-02 | 胃 Quiz：照必考清單寫法作答被判錯 | 5 個結構照清單寫法作答會判「錯」：短胃動脈（網站：胃短動脈）、後胃動脈（胃後動脈）、短胃靜脈（胃短靜脈）、後胃靜脈（胃後靜脈）、腹腔叢（腹腔神經叢）。其餘 AB-04 的名稱（左胃動脈、總肝動脈、右胃網膜動脈、上腸繫膜靜脈、肝門靜脈、脾臟、胰臟等）已被接受。模擬考試用同一判分方式。 | `judgeName` 逐一測試 | 影響使用 | 總管（Quiz）＋腹部內臟（AB-04 名稱） |
| FT-03 | 胃 Quiz 開題畫面 | 開題時整個胃只佔 3D 畫面中央約 60–140 像素（桌面、iPad 直向、橫向都是），紫色目標很小，要先按「放大至目標」才看得清楚。頭頸、四肢的 Quiz 開題會框住目標。 | [桌面、iPad 橫向、iPad 直向開題畫面](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/705f33330fd13861a743cc48b131dbcc82822996/qa-report/ft/stomach-quiz-framing.jpg) | 影響使用 | 總管（Quiz） |
| FT-04 | 胃 Quiz 細節 | 輸入框提示文字是心臟的例子「e.g. Bicuspid valve」；胃是單一器官，左上角卻標示「雙側」，Quiz 設定頁也有「右側／左側／雙側」選項。直向時「送出」按鈕的字被擠成直排。 | 同上截圖 | 外觀小問題 | 總管（Quiz） |

其餘：胃的學習（神經 10、動脈 11、靜脈 9、器官結構 12，共 42 個構造）、Quiz 設定與模擬考試頁在三種尺寸都能開，沒有頁面錯誤、沒有元件被遮住或裁切、沒有橫向捲動。頁首「學習／Quiz／模擬考試」切換按鈕高 38、Quiz 檢視按鈕高 36，低於 iPad 建議的 44 點（同 EA-01 的情況，全站共用元件）。

## 必考清單覆蓋核對：腹部、骨盆與會陰（2026-11-18）

方法：本機最新 main（含 #426、#430；#433 的頭頸骨標示另計）。以專案的比對函式（`scripts/lib/required-match.mjs`）把必考清單逐項配對到網站結構。網站結構的來源有：主圖譜、執行時才載入的女性與跑考結構、器官詳細模式（目前只有胃）、資訊卡、神經、關節、血管樹與特殊區域。骨盆清單取自 `docs/required-structures/pelvis-perineum-genital-list.md` 中處理欄為 3D 模型、區域標示或僅資訊卡的 389 項；腹部清單取自 `abdomen.json` 中要求 3D 的 428 項。配對以英文名為主、中文名與別名表為輔；「只有組成部分」是指網站有它的分部，但沒有整體結構可點選。下列每一項都經人工抽查，排除了比對造成的誤判（見 TOOL-02）。

### 總數

| 範圍 | 清單項數 | 網站已有 | 只有資訊卡 | 只有組成部分 | 缺 |
|---|---|---|---|---|---|
| 腹部（要求 3D） | 428 | 179 | 35 | 6（空腸、迴腸、肝臟、左肝動脈、右肝動脈、胃十二指腸動脈） | **208** |
| 骨盆與會陰：3D 模型 | 169 | 85 | — | 11（恥骨、髂骨、坐骨、骨盆膈、提肛肌、陰莖、陰蒂、輸卵管、子宮；陰莖深動脈與陰莖背神經只配到「陰蒂」） | **73** |
| 骨盆與會陰：區域標示 | 170 | 24 | — | — | **146** |
| 骨盆與會陰：僅資訊卡 | 50 | 3 | — | — | **47** |

腹部 208 項與骨盆 266 項（73＋146＋47）都是「考試範圍工作 11/27 前完成」需要處理的。「只有資訊卡」的 35 項腹部結構（例如十二指腸各部、肝各葉、膽囊各部、腎門、腎盂）已有 #425、#430 的卡片，但沒有可點選的模型或標示。

### 腹部：缺的 208 項（依類型）

| 類型 | 數量 | 結構 |
|---|---|---|
| 器官 | 32 | 右結腸彎曲、左大腸彎、乙狀結腸、肛門、膽管、腎皮質、腎髓質、腎錐體、腎柱、腎乳突、腎小盞、腎大盞、腎竇、食道頸部狹窄、食道胸部狹窄（支氣管主動脈狹窄）、食道橫膈狹窄、胰頭、胰鉤突、胰頸、胰體、胰尾、主胰管、副胰管、脾門、脾胃面、脾結腸面、脾腎面、肛管、結腸袋、腸脂垂、腎盂輸尿管連接部、輸尿管膀胱連接部 |
| 腹膜 | 26 | 腹膜、壁層腹膜、臟層腹膜、腹膜腔、大囊、小囊（網膜囊）、網膜孔、大網膜、小網膜、肝胃韌帶、肝十二指腸韌帶、腸繫膜根部、乙狀結腸繫膜、正中臍襞、內側臍襞、外側臍襞、鐮狀韌帶、正中臍韌帶、內側臍韌帶、胃脾韌帶、脾腎韌帶、橫膈結腸韌帶、橫膈脾韌帶、脾結腸韌帶、右三角韌帶、左三角韌帶 |
| 韌帶 | 18 | 半月線、腱劃、弓狀線、腹外斜肌腱膜、腔隙韌帶、髂恥韌帶、聯合肌腱、正中弓狀韌帶、內側弓狀韌帶、外側弓狀韌帶、腹內斜肌腱膜、腹橫肌腱膜、恥骨梳韌帶、淺腹股溝環內腳、淺腹股溝環外腳、卵巢韌帶、橫膈食道韌帶、靜脈韌帶 |
| 動脈 | 17 | 左胃動脈食道支、大胰動脈、上胰十二指腸動脈、上十二指腸動脈、空腸動脈、上腎上腺動脈、生殖腺動脈、卵巢動脈、正中薦動脈、心包膜膈動脈、提睪肌動脈、下膀胱動脈、輸精管動脈、左下膈動脈食道支、中直腸動脈、下直腸動脈、髂腰動脈 |
| 淋巴 | 17 | 乳糜池、腸幹、右腰幹、左腰幹、上腸繫膜淋巴結、下腸繫膜淋巴結、主動脈前淋巴結、主動脈旁淋巴結、左右側主動脈淋巴結、腰淋巴結、總髂淋巴結、外髂淋巴結、內髂淋巴結、淺腹股溝淋巴結、腋淋巴結、胸骨旁淋巴結、側腰淋巴結 |
| 筋膜 | 15 | 淺筋膜、淺層脂肪層（Camper 氏筋膜）、深層膜性層（Scarpa 氏筋膜）、深筋膜、腹橫筋膜、腎筋膜、腹膜外筋膜、內精筋膜、外精筋膜、提睪肌筋膜、腹直肌鞘前壁、腹直肌鞘後壁、肉膜、淺會陰筋膜（科利斯氏筋膜）、闊筋膜 |
| 區域 | 15 | 臍、右季肋區、上腹部（心窩區）、左季肋區、右腰區、臍區、左腰區、右腹股溝區、下腹部（恥骨上區）、左腹股溝區、幽門平面、肋下平面、結節間平面、臍平面、棘間平面 |
| 骨 | 12 | 前上髂棘、髂窩、恥骨脊、恥骨線、髂恥隆凸、肋弓、骨盆入口、大骨盆（假骨盆）、真骨盆、頸靜脈切跡、髂嵴結節、骨盆緣 |
| 肌肉 | 11 | 提睪肌、腰小肌、髂腰肌、橫膈右腳、橫膈左腳、橫膈中央肌腱、環咽肌（上食道括約肌）、下食道括約肌、橫膈胸骨部、橫膈肋骨部、橫膈腰部 |
| 靜脈 | 10 | 右生殖腺靜脈、左生殖腺靜脈、卵巢靜脈、中直腸靜脈、下直腸靜脈、食道靜脈、蔓狀靜脈叢、淺旋髂靜脈、深旋髂靜脈、腰奇靜脈 |
| 神經 | 9 | 骨盆內臟神經、奇神經節、下腹神經、腰神經叢、肋下神經、副閉孔神經、腰薦神經幹、胸腹神經、白交通支 |
| 管道 | 8 | 腹股溝管、淺腹股溝環、深腹股溝環、精索、腹股溝三角、股管、股環、睪丸鞘膜 |
| 間隙 | 8 | 腎圍脂肪層、腎旁脂肪層、十二指腸旁窩、膈下隱窩、肝腎隱窩、結腸旁溝、腹膜後腔、腹膜前腔 |
| 神經叢 | 7 | 主動脈叢、上腸繫膜叢、中腸繫膜叢、下腸繫膜叢、腎神經叢、上腹下神經叢、下腹下神經叢 |
| 開口 | 2 | 食道裂孔、腔靜脈裂孔 |
| 神經節 | 1 | 下腸繫膜神經節 |

腹部只有資訊卡（35 項）：十二指腸空腸彎曲、盲腸、肝門三體、腎盂、腎門、肝圓韌帶、膽囊動脈、膽囊靜脈、腹腔淋巴結、腰內臟神經、胃管、食道胃交界（Z 線）、十二指腸上部（十二指腸壺腹）、十二指腸降部、十二指腸下部（水平部）、十二指腸升部、大十二指腸乳突、小十二指腸乳突、肝胰壺腹、肝胰壺腹括約肌、十二指腸懸韌帶（屈氏韌帶）、迴盲瓣、肝橫膈面、肝臟面、肝右葉、肝左葉、肝方形葉、肝門、肝段（Couinaud 分段）、肝冠狀韌帶、肝裸區、膽囊三角（卡洛三角）、膽囊底、膽囊體、膽囊頸

### 骨盆與會陰：缺的項目

- **3D 模型（73 項）：** 內側臍韌帶、膀胱外側韌帶、肛尾韌帶、恥骨肛門肌、恥骨會陰肌、恥骨前列腺肌（提前列腺肌）、恥骨陰道肌（陰道括約肌）、會陰體、尿道外括約肌、尿道壓迫肌、尿道陰道括約肌、會陰膜、會陰深橫肌、球海綿體肌、坐骨海綿體肌、會陰淺橫肌、陰莖球、陰莖腳、陰莖懸韌帶、陰莖襻韌帶、旁尿道腺、陰部（外陰）、正中臍韌帶、恥骨前列腺韌帶、恥骨膀胱韌帶、射精管、尿道球腺、鞘膜、精索、蔓狀靜脈叢、陰囊、乙狀結腸、肛管、肛門內括約肌、臍動脈、上膀胱動脈、下膀胱動脈、陰道動脈、卵巢動脈、中直腸動脈、下直腸動脈、正中薦動脈、輸精管動脈、陰莖（陰蒂）深動脈、前列腺動脈、副閉孔動脈、髂腰動脈、外側薦動脈、會陰動脈、陰蒂背動脈、外精索動脈（提睪肌動脈）、中直腸靜脈、下直腸靜脈、上膀胱靜脈、下膀胱靜脈、陰道靜脈、後陰囊（陰唇）動脈、後陰囊（陰唇）靜脈、腰薦神經幹、薦神經叢、下直腸神經、會陰神經、後陰囊（陰唇）神經、陰莖（陰蒂）背神經、尾神經叢、肛尾神經、薦交感神經幹、上腹下神經叢、下腹下神經叢、腹下神經、骨盆內臟神經、骨盆神經叢、會陰神經深支、會陰神經淺支、尾神經
- **區域標示（146 項）：** 大坐骨切跡、恥骨體、上恥骨枝、下恥骨枝、弓狀線、恥骨梳線、閉孔、薦骨岬、薦骨翼、前薦孔、薦骨裂孔、骨盆邊緣、骨盆入口、骨盆出口、大（假）骨盆、小（真）骨盆、恥骨弓、恥骨下角、坐骨大孔、骨盆前下壁、骨盆外側壁、骨盆後外側壁（頂）、骨盆底、髂窩、坐骨枝、後薦孔、薦骨角、尾骨尖端、髖臼、坐骨體、薦髂關節、閉孔管、髂尾中縫、泌尿生殖裂孔、肛門口、膀胱上窩、膀胱旁窩、輸尿管褶、直腸膀胱陷凹、直腸旁窩、內側臍襞、會陰、泌尿生殖三角、肛門三角、坐骨肛門窩（坐骨直腸窩）、坐骨恥骨支、會陰深陷凹、會陰淺陷凹、前隱窩（坐骨肛門窩）、後隱窩（坐骨肛門窩）、陰部管、陰部裂隙、生殖股溝、小陰唇繫帶（陰唇繫帶）、陰蒂角、陰蒂繫帶、陰蒂包皮、陰道口、膀胱尖、膀胱體、膀胱底、膀胱頸、膀胱上表面、輸尿管間嵴、輸尿管開口、內尿道口、尿道外口、近端尿道、膀胱後表面、遠端尿道、輸尿管膀胱交界、膀胱前表面、膀胱下表面、輸尿管間褶、男性尿道、尿道壁內部（間質部）、前列腺部尿道、尿道中間部（膜部）、海綿體部尿道、尿道球部、舟狀窩、尿道脊、精阜、前列腺小囊、膀胱懸雍垂、鞘膜臟層、鞘膜壁層、副睪頭、副睪體、副睪尾、輸精管壺腹、前列腺外圍區、前列腺中央區、前列腺過渡區、陰囊縫、陰莖縫、會陰縫、子宮繫膜、後穹窿、輸卵管子宮部（間質部）、子宮峽、子宮頸內口、子宮頸管、子宮頸外口、陰道穹窿、前穹窿、側穹窿、直腸橫褶、直腸壺腹、上橫褶（直腸）、中橫褶（直腸）、下橫褶（直腸）、直腸薦曲、肛管直腸曲、肛柱、肛瓣、肛竇、齒狀線、直腸繫膜、肛門直腸線、肛梳、肛門皮膚線、肛門外括約肌皮下部、肛門外括約肌淺部、肛門外括約肌深部、直腸靜脈叢、子宮靜脈叢、陰道靜脈叢、薦靜脈叢、椎內靜脈叢、卵巢靜脈叢、膀胱靜脈叢、內直腸靜脈叢、外直腸靜脈叢、奇神經節（尾神經節）、外髂淋巴結、內髂淋巴結、薦淋巴結、總髂淋巴結、淺腹股溝淋巴結、深腹股溝淋巴結、旁直腸淋巴結、下腸繫膜淋巴結、腰淋巴結、腹股溝淋巴結、乳糜池
- **僅資訊卡（47 項，沒有找到卡片）：** 子宮闊韌帶與圓韌帶的腹膜褶、閉孔筋膜、骨盆膈下筋膜、泌尿生殖膈、直腸膀胱隔膜、直腸陰道隔膜、會陰皮下組織膜層（Colles 筋膜）、陰莖深筋膜（Buck 筋膜）、腹壁淺筋膜膜層（Scarpa 筋膜）、直腸前列腺筋膜、坐骨肛門窩脂肪墊、陰莖白膜、逼尿肌、尿道內括約肌、膀胱褶、恥骨下彎、恥骨前彎、曲細精管、輸出小管、副睪導管、前纖維肌肉間質、肉膜肌、陰囊隔、外精索筋膜、提睪肌與筋膜、內精索筋膜、陰道冠、乳腺葉、乳腺小葉、結腸帶、結腸袋、腸脂垂、子宮弓狀動脈、子宮放射動脈、直動脈、螺旋動脈、恥骨支（動脈）、精囊動脈（精囊支）、子宮動脈陰道支、子宮動脈卵巢支、子宮動脈輸卵管支、子宮圓韌帶動脈、陰莖螺旋動脈、恥骨靜脈、動脈周壁神經叢、腸繫膜間神經叢、薦神經 S2–S4

### 名稱與必考清單不同

| 編號 | 範圍 | 項目（清單寫法，括號內為網站寫法） | 嚴重程度 | 建議負責 |
|---|---|---|---|---|
| AB-07 | 腹部 | 31 組：迴盲部（網站：迴盲交界）、短胃動脈（胃短動脈）、後胃動脈（胃後動脈）、後胃靜脈（胃後靜脈）、短胃靜脈（胃短靜脈）、肝固有動脈（固有肝動脈）、前上／後上／前下／後下胰十二指腸動脈（胰十二指腸前上／後上／前下／後下動脈）、中腎上腺動脈（腎上腺中動脈）、下腎上腺動脈（腎上腺下動脈）、深旋髂動脈（旋髂深動脈）、淺旋髂動脈（旋髂淺動脈）、上膈動脈（膈上動脈）、下膈靜脈（膈下靜脈）、升腰靜脈（腰升靜脈）、正中薦靜脈（薦正中靜脈）、上直腸靜脈（直腸上靜脈）、淺腹壁靜脈（腹壁淺靜脈）、上腹壁靜脈（腹壁上靜脈）、下腹壁靜脈（腹壁下靜脈）、外髂靜脈（髂外靜脈）、前迷走神經幹（迷走神經前幹）、後迷走神經幹（迷走神經後幹）、交感神經幹（交感幹）、上腸繫膜神經節（腸繫膜上神經節）、腹腔叢（腹腔神經叢）、髂脊（髂嵴）、第 11 肋（第十一肋骨）、第 12 肋（第十二肋骨）、外胸靜脈（胸外側靜脈）、肝尾葉（肝尾狀葉）、內陰動脈（陰部內動脈）。（胃詳細模式另見 AB-04。）多數是詞序不同，例如清單用「下腹壁靜脈」「外髂靜脈」，網站用「腹壁下靜脈」「髂外靜脈」。建議比照頭頸 #396 的做法，建一份腹部、骨盆的名稱對照表：顯示清單寫法，網站原寫法作搜尋別名。 | 影響使用 | 總管（名稱統一） |
| PP-05 | 骨盆與會陰 | 30 組：坐骨粗隆（網站：坐骨結節）、恥骨粗隆（恥骨結節）、薦髂前韌帶（前薦髂韌帶）、薦髂後韌帶（後薦髂韌帶）、薦粗隆韌帶（薦結節韌帶）、子宮直腸陷凹（直腸子宮陷凹）、龜頭（陰莖頭）、大前庭腺（前庭大腺）、輸卵管繫膜（輸卵管系膜）、卵巢繫膜（卵巢系膜）、卵巢韌帶（卵巢固有韌帶）、內陰動脈（陰部內動脈）、上臀動脈（臀上動脈）、下臀動脈（臀下動脈）、深旋髂動脈（旋髂深動脈）、內髂靜脈（髂內靜脈）、外髂靜脈（髂外靜脈）、上臀靜脈（臀上靜脈）、下臀靜脈（臀下靜脈）、內陰靜脈（陰部內靜脈）、外側薦靜脈（外薦靜脈）、正中薦靜脈（薦正中靜脈）、陰莖深背靜脈（陰莖背深靜脈）、陰莖淺背靜脈（陰莖背淺靜脈）、下腹壁靜脈（腹壁下靜脈）、上直腸靜脈（直腸上靜脈）、上臀神經（臀上神經）、下臀神經（臀下神經）；另有兩項比清單少了括號別名：恥骨下韌帶（恥骨弓狀韌帶）、陰蒂體（陰蒂海綿體）。其中「坐骨粗隆」「恥骨粗隆」是 #406 骨性標誌所用的名稱（網站寫坐骨結節、恥骨結節），我在核對 #406 時漏報。 | 影響使用 | 總管（名稱統一） |

### 檢查工具

| 編號 | 問題 | 建議負責 |
|---|---|---|
| TOOL-02 | (1) `check-required-abdomen.mjs` 的已知缺項是 265 項，實際約 208 項：它沒有把器官詳細模式（胃）、資訊卡與執行時才載入的女性、跑考結構算進去，例如胃底、胃大彎、幽門已在胃詳細模式中，卻仍算缺。(2) 比對函式忽略名稱中的「Left／Right」，所以本身帶左右的結構（右胃動脈、右結腸動脈、右肝管、右腎上腺靜脈等）可以靠另一側的同名結構配對成功。這次已逐項人工查過，這幾項都確實存在，但工具本身會漏報。(3) 骨盆與會陰清單（md 表格）沒有自動檢查，缺項不會被 CI 擋下。 | 總管 |

依公開資料核對，請使用者核對。

## 骨盆與會陰

### 問題清單

| 編號 | 區域 | 結構或功能 | 問題 | 證據 | 來源 | 嚴重程度 | 建議負責 |
|---|---|---|---|---|---|---|---|
| PP-01 | 女性骨盆 | Rectouterine pouch 直腸子宮陷凹 | 位置太前：整件在子宮頸與陰道前半（z −27～−18 mm），應在子宮頸與陰道後穹窿之後、直腸之前（約 z −40～−50 mm），偏前約 20 mm。 | 子宮頸 z −41～−21、陰道 z −39～−21；同高度（y 0.865–0.895 m）直腸前緣 z −43～−53 mm。未在 3D 畫面截圖確認。 | Gray's Anatomy 1918；OpenStax Anatomy & Physiology；TeachMeAnatomy | 會令溫書學錯 | 生殖＋內臟 |
| PP-02 | 女性會陰 | Bulb of vestibule 前庭球、Crus of clitoris 陰蒂腳（左右） | 與提肛肌重疊：在同一水平位置，前庭球頂部高出提肛肌下表面最多 13 mm（左）／15 mm（右），陰蒂腳最多 8 mm（左）／15 mm（右）。淺袋內容應在會陰膜之下，與盆膈之間還隔着深袋。 | 5 mm 方格比較：左前庭球 11 格全部高出，右前庭球 7 格；左陰蒂腳 6／15 格。陰蒂與前庭球是 #333 的 Clitoris-MRI-2，提肛肌是男性 BodyParts3D 模型。未在 3D 畫面截圖確認。 | Gray's Anatomy 1918；OpenStax Anatomy & Physiology；TeachMeAnatomy | 會令溫書學錯（待 3D 確認） | 生殖＋內臟 |

### 層次核對：骨盆與會陰重點關係

| 關係 | 應有 | 模型 | 結果 |
|---|---|---|---|
| 女性：膀胱、子宮、直腸前後 | 由前到後：膀胱 → 子宮（子宮頸、陰道）→ 直腸 | 中線 z：膀胱 +3、子宮體 −11、子宮頸 −32、陰道 −27、直腸 −62 mm | 正確 |
| 男性：膀胱、前列腺、直腸 | 前列腺在膀胱下方，直腸在後 | 膀胱 y 0.894、前列腺 y 0.861、直腸 z −62 mm | 正確 |
| 膀胱子宮陷凹 | 在膀胱與子宮之間 | z −21～+33，與膀胱後上面、子宮前面相接 | 正確 |
| 直腸子宮陷凹 | 在子宮頸、陰道後穹窿之後，直腸之前 | 在子宮頸與陰道前半 | **錯，PP-01** |
| 輸尿管與子宮動脈 | 輸尿管在子宮動脈下後方通過，約在子宮頸外側 1.5–2 cm | 左：子宮動脈在輸尿管上方 1–18 mm，交叉點在中線外 20–30 mm；右：同一高度子宮動脈在輸尿管前方約 12 mm | 正確 |
| 盆膈與會陰 | 提肛肌（盆膈）在上；會陰深袋、會陰膜、淺袋依次在下 | 前庭球、陰蒂腳與提肛肌重疊 | **PP-02** |
| 會陰淺袋內容 | 坐骨海綿體肌、球海綿體肌、會陰淺橫肌、陰蒂腳（陰莖腳）、前庭球（尿道球） | 網站只有一件「superficial perineal muscle」與陰蒂腳、前庭球；坐骨海綿體肌、球海綿體肌沒有分開的模型 | 無法逐項核對（缺模型） |
| 會陰深袋內容 | 會陰深橫肌、尿道外括約肌、會陰膜 | 網站沒有這些模型 | 無法核對（缺模型） |

依公開資料核對，請使用者核對；數值未在 3D 畫面截圖確認。

---

## 腹部

### 問題清單

| 編號 | 區域 | 結構或功能 | 問題 | 證據 | 來源 | 嚴重程度 | 建議負責 |
|---|---|---|---|---|---|---|---|
| AB-01 | 腹後壁 | 腎門：Renal vein 腎靜脈與 Renal artery 腎動脈幹（左右） | 近腎門處腎靜脈在腎動脈後方；腎門由前到後應為腎靜脈、腎動脈、腎盂。近中線（離中線 0–15 mm）次序正確，約 20–25 mm 起調轉。 | 按離中線距離 5 mm 分格：左側 30–35 mm 靜脈 z −11～−21、動脈 z +2（靜脈後 13–23 mm）；右側 20–40 mm 靜脈後 4–14 mm。未在 3D 畫面截圖確認。 | Gray's Anatomy 1918；OpenStax Anatomy & Physiology；TeachMeAnatomy | 會令溫書學錯（待 3D 確認） | 生殖＋內臟 |
| AB-02 | 腹後壁 | Left renal vein 左腎靜脈過中線 | 前後次序正確（在腸繫膜上動脈後、主動脈前），但三者在 y 1.105–1.115 m 互相重疊約 5 mm（穿模）。 | 離中線 0–14 mm：主動脈 z 14.5–31.4、左腎靜脈 z 24.4–32.4、腸繫膜上動脈 z 25.8–46.1。 | Gray's Anatomy 1918；TeachMeAnatomy | 影響使用 | 生殖＋內臟 |

### 層次核對：腹部重點關係

| 關係 | 應有 | 模型 | 結果 |
|---|---|---|---|
| 腎上腺與腎 | 腎上腺在腎上極的內上方 | 左腎上腺 y 1.141–1.186、腎頂 1.169；右 1.124–1.166、腎頂 1.149；兩側腎上腺中心都在腎中心內側 | 正確 |
| 左右腎高度 | 右腎較低 | 右腎中心 y 1.098，左腎 1.115 m | 正確 |
| 主動脈與下腔靜脈 | 主動脈偏左、下腔靜脈偏右 | 主動脈中心 x +8、下腔靜脈 x −11 mm | 正確 |
| 左腎靜脈過中線 | 在腸繫膜上動脈後、主動脈前 | 次序正確，但互相重疊 | **AB-02** |
| 腎門 | 前到後：腎靜脈、腎動脈、腎盂 | 腎靜脈在動脈後方 | **錯，AB-01** |
| 右腎動脈與下腔靜脈 | 右腎動脈在下腔靜脈後方 | 下腔靜脈網格在該高度太疏，取不到斷面 | 無法確認 |
| 胰臟、十二指腸與腎 | 胰臟在左腎前方；十二指腸降部在右腎前方 | 胰臟 z −5～46、左腎 z −40～0；十二指腸 z 4～57、右腎 z −35～12 mm | 正確 |
| 腹側壁三層肌 | 由外到內：腹外斜肌、腹內斜肌、腹橫肌 | y 1.03、1.06、1.09 m，左右離中線距離：外斜 115–124 → 內斜 110–117 → 腹橫 101–112 mm | 正確 |

依公開資料核對，請使用者核對；數值未在 3D 畫面截圖確認。

---

## 檔案清單（全站，交總管；使用者 2026-11-16 縮細範圍：不量時間與 FPS）

方法：已部署網站實際載入的資料目錄、`git ls-tree` 的 `public/` 檔案大小、一次瀏覽器網絡記錄（桌面 1440×900：首頁、頭頸、資訊卡、搜尋、骨盆與會陰、腦、眼、Quiz；同一瀏覽器第一次開與第二次開各一輪）與 GitHub Pages 回應標頭。學習與模擬考試這一輪自動點擊失敗，沒有計入。

### 下載量

| 項目 | 第一次開 | 第二次開 |
|---|---|---|
| 全部步驟 | 184 個請求，41.0 MB | 114 個請求，約 0.02 MB（模型由瀏覽器 Cache Storage 讀取，其餘 304） |
| 首頁（等 60 秒） | 75 個請求，22.3 MB | 幾乎 0 |
| 切換頭頸 | 2.7 MB | 0 |
| 骨盆與會陰 | 5.0 MB | 0 |
| 腦詳細模式 | 5.0 MB（brain.glb 3.9 MB） | 0 |
| 眼詳細模式 | 2.0 MB（eye-atlas.bin.gz） | 0 |

快取：GitHub Pages 對所有檔案回 `cache-control: max-age=600`（10 分鐘，網站無法更改）。程式把檔名帶雜湊的 `models/stream/*` 存入 Cache Storage（`mj-anatomy-models-v1`，本次 70 個），所以第二次開幾乎不用重新下載；brain.glb、eye-atlas、Quiz 套件等不在 `models/stream/` 的檔案只靠 10 分鐘 HTTP 快取，之後要重新驗證（304，資料不重下載）。

### 1. `models/body-*.bin` 與 `models/stream/body-*.bin` 是否重複下載（已核實）

- **不會重複下載。** 主圖譜只讀 `models/atlas-stream.json.gz`，再下載 `models/stream/body-*.bin.gz`（帶雜湊、壓縮、量化，29.8 MB）。
- `models/atlas.json`（1.3 MB）與 `models/body-0.bin`…`body-14.bin` 及其 `.gz`（共 30 個檔、92.5 MB）只在兩個地方用到：`atlas-stream` 載入失敗時的後備（`app/page.tsx` 第 135 行），以及只在 `?dev=1` 開啟、沒有入口的骨架實驗頁（`app/biomechanics-v2/lab.tsx`）。本次記錄中一次都沒有下載。
- 結論：不影響使用者下載量，但佔部署空間 93.9 MB（repo 內 `public/` 105.4 MB 中的 89%）。

### 2. 各資料包大小、壓縮與用途

| 資料包 | 件數 | 原始 | gzip | 量化（pq／u16／oct 法向） | 用途 | 備註 |
|---|---|---|---|---|---|---|
| `stream/body-*` | 2,230 | 37.5 MB | 29.8 MB | 2,204 件已量化 | 主圖譜 | — |
| `stream/paokao-*` | 470 | 17.6 MB | 10.3 MB | 未量化 | 示意模型、頭頸補充 | 可量化 |
| `stream/facial-*` | 47 | 16.4 MB | 9.3 MB | 未量化 | 面部肌肉 | 可量化；多邊形過多（見下） |
| `stream/supplement-*` | 33 | 9.8 MB | 5.8 MB | 未量化 | 補充部件 | 可量化 |
| `stream/vessel-ends-*` | 873 | 9.5 MB | 5.0 MB | 未量化 | 血管末端 | 可量化（血管專屬檔案，由血管平順工作階段處理） |
| `stream/female-*` | 47 | 3.4 MB | 2.0 MB | 未量化 | 女性器官 | 可量化 |
| `stream/serous-*` | 14 | 2.7 MB | 1.6 MB | 未量化 | 漿膜 | 可量化 |
| `brain.glb` | 437 | 4.6 MB | 3.9 MB | Draco | 腦詳細模式 | 已壓縮 |
| `joints.glb` | 349 | 1.5 MB | — | Draco | 關節系統 | 已壓縮；本次未觸發下載（開啟關節動作才載入） |
| `eye/eye-atlas.bin.gz` | 71 | — | 2.0 MB | — | 眼詳細模式 | 開啟時才下載（已延遲載入） |
| `nervous.glb` | — | 6.7 MB | — | — | **執行時沒有用到**（只供建置腳本 `prepare-nerve-stream.mjs` 等產生 `nerve-stream`） | 佔部署空間 |
| `neck-vessels.json.gz`、`articular-surfaces.json.gz`、`nerve-stream` | — | 0.2 MB、0.7 MB、— | — | — | 主圖譜補充（`scheduleSupplementary` 延後載入） | 本次 60 秒內未見下載，無法確認觸發時機 |

未量化的 6 個資料包合計原始 59.4 MB、gzip 34.0 MB；若照 `stream/body` 的方式量化（位置 Uint16、索引 Uint16、法向八面體編碼），估計可再減約 30–40%（未實測，請負責工作階段確認）。

### 3. 多邊形過多（可減面）

全站 3,714 件共 552 萬個三角形；面部包 47 件就有 71 萬個。

| 結構 | 三角形 | 大小 | 比較 |
|---|---|---|---|
| Left／Right temporalis 顳肌（面部包） | 各約 10.6 萬 | 約 12 cm | 全身皮膚只有 4.5 萬 |
| Left／Right frontalis 額肌 | 各約 5.9 萬 | 約 7 cm | — |
| Orbicularis oris 口輪匝肌 | 3.8 萬 | 約 7 cm | — |
| Left／Right occipitalis 枕肌 | 各約 2.7 萬 | 約 5 cm | — |
| Left／Right corona ciliaris 睫狀冠 | 1.0–1.2 萬 | 約 17 mm | 細小構造密度很高 |
| 輸卵管繖、峽、漏斗部（女性） | 1,600–3,500 | 6–9 mm | 細小構造密度很高 |

### 4. 重複下載（待確認）

第一次開的一輪中，`atlas-stream.json.gz`、幾個程式包（`mj-system-classifier`、`camera-framing`、`page`、`mj-structure-info`、`index`）與各補充資料包目錄，在三次整頁重新載入時各下載 3 次（合計約 1.1 MB）；第二輪同樣的操作全部 304。原因未確定（可能與測試工具或 10 分鐘快取有關），請總管在真機用開發者工具確認。

### 5. 可以刪除或合併的項目（只列出，等使用者批准；不會自行刪除）

| 項目 | 節省 | 風險 | 建議負責 |
|---|---|---|---|
| `public/models/atlas.json` 與 `public/models/body-*.bin(.gz)`（舊版主圖譜） | 部署空間 93.9 MB；使用者下載量不變 | 失去 `atlas-stream` 載入失敗時的後備；`?dev=1` 骨架實驗頁會壞（需改讀 stream 或一併移除） | 總管 |
| `public/models/nervous.glb` 移出 `public/`（改放建置用資料夾） | 部署空間 6.7 MB | 建置腳本與檢查腳本（`prepare-nerve-stream.mjs`、`check-required-structures.mjs` 等約 10 個）要改路徑 | 總管 |
| `app/biomechanics-v2/lab.tsx`（骨架實驗頁，沒有入口，只在 `?dev=1`） | 少一個程式包（大小未量）；可連同上一項一起刪 | 開發者預覽功能消失 | 總管 |
| `app/micro-atlas.tsx` 內腦與耳的設定 | 少量程式碼 | 不是舊程式：眼詳細模式仍用這個檔；腦已改用 `organ/brain`，耳入口關閉中（耳 PR 會用到），**不建議刪檔**，只可刪腦的設定 | 總管 |
| 未量化的 6 個資料包改為量化 | 估計 gzip 下載減少約 10–14 MB | 需重新生成並跑穩定度與動作檢查；血管包只能由血管平順工作階段改 | 總管（血管末端包：血管平順） |
| 面部包顳肌、額肌、口輪匝肌、枕肌減面 | 面部包約 9.3 MB gzip 的一大部分 | 外形與附著點要重新目視檢查 | 頭頸模型 |

## 檢查腳本（交總管；腹部內臟 2026-11-17 回報）

| 編號 | 腳本 | 問題 | 證據 | 嚴重程度 | 建議負責 |
|---|---|---|---|---|---|
| TOOL-01 | `scripts/test-wording-unify.mjs` | 本機第二次跑 `npm run ci:local` 會誤報失敗：腳本也掃描 `dist/`，而 `app/quiz/naming.ts` 的簡繁對照表（含「腭」，原始碼中屬允許例外）在 build 後會打包進 `dist/assets/level2-*.js`，上一輪 build 留下的 `dist/` 因此在 check 第 173 步報「old spelling 頷／腭」。GitHub CI 先 check 後 build，check 時沒有 `dist/`，所以 CI 不受影響。 | AB-01 分支本機 `ci:local`：`check FAILED at step 173/177`，訊息指向 `dist/assets/level2-*.js`；刪除 `dist/` 後重跑即通過。 | 影響使用（只影響本機重跑） | 總管：開純腳本 PR，例如 dist 掃描也允許 naming.ts 的對照表，或只掃原始碼與 `public/`。暫時繞過：跑 `ci:local` 前先刪除 `dist/`。 |
