# Quiz 腦：題庫範圍與排除清單

此檔由 `node scripts/report-quiz-brain.mjs` 產生，請勿手改（排除與分組由 `scripts/prepare-quiz.mjs` 依 `app/quiz/brain.ts` 的規則決定；說明見 `docs/quiz-brain.md`）。來源是主站腦部畫面使用的同一個腦模型（`public/models/brain.glb`），測驗只用模型真正有的網格。

可出題：416 個構造（左右分開計），去掉左右後 225 個名稱。不出題：47 項（逐項列在下方，原因見各小節）。

## 各區段 × 類別（格內為「構造數 / 去掉左右後的名稱數」）

| 區段 | 神經 | 動脈 | 靜脈 | 器官結構 | 合計 |
| --- | --- | --- | --- | --- | --- |
| 額葉 | — | — | — | 42 / 21 | 42 / 21 |
| 頂葉 | — | — | — | 18 / 9 | 18 / 9 |
| 顳葉 | — | — | — | 22 / 11 | 22 / 11 |
| 枕葉 | — | — | — | 22 / 11 | 22 / 11 |
| 邊緣葉、腦島與葉間溝 | — | — | — | 24 / 12 | 24 / 12 |
| 基底核與深部灰質 | — | — | — | 19 / 10 | 19 / 10 |
| 間腦（視丘與下視丘） | — | — | — | 43 / 24 | 43 / 24 |
| 腦室與脈絡叢 | — | — | — | 7 / 5 | 7 / 5 |
| 白質纖維束與連合 | — | — | — | 63 / 34 | 63 / 34 |
| 腦幹 | — | — | — | 34 / 18 | 34 / 18 |
| 小腦 | — | — | — | 31 / 20 | 31 / 20 |
| 腦神經根 | 30 / 15 | — | — | — | 30 / 15 |
| 腦血管 | — | 44 / 23 | 17 / 12 | — | 61 / 35 |
| 全部腦 | 30 / 15 | 44 / 23 | 17 / 12 | 325 / 175 | 416 / 225 |

分類規則：腦神經根 → 神經；腦動脈 → 動脈；靜脈竇與靜脈 → 靜脈；皮質、核團、腦室、白質纖維束、腦幹、小腦、間腦 → 器官結構（沿用現有類別，不新增類別）。

## 資料卡

有資料卡：281 / 416 個構造；其中 81 個名稱對應的是較廣概念的資料卡（例如視丘的卡片對應視丘的各個核），卡片第一行會標明「所屬資料卡」。沒有資料卡的構造在答題後的資料卡顯示「尚無資料」，並列在 `docs/quiz-card-gaps.md`。資料卡內容全部來自 `public/models/brain/neuro-cards.json`，沒有新增文字。

## 只開放部分級別的構造

這些構造在 `app/organ/brain-overrides.ts` 的 `quiz` 旗標指定開放的級別；第一級題庫、學習關卡（第二級）與模擬跑考題庫都不含它們，第三級（看結構寫名稱）才出題。`scripts/check-quiz-banks.mjs` 只容許第一級與第三級題庫相差這一組。

| 構造 | 開放級別 | 學習關卡 | 模擬跑考 | 原因 |
| --- | --- | --- | --- | --- |
| Decussation of superior cerebellar peduncles（小腦上腳交叉） | 第三級 | 不收 | 不收 | 只開放第三級；不入學習關卡與模擬跑考（大體標本表面看不到） |

## 不出題的構造（逐項）

### 示意構造：模型本身沒有，主站腦部畫面以橢球或管狀示意形狀補上；測驗只用真實網格，不考示意形狀（26）

- Left Anterior limb of internal capsule（左內囊前腳） [white, left]
- Left Claustrum（左帶狀核） [basal, left]
- Left Dorsomedial nucleus of hypothalamus（左下視丘背內側核） [diencephalon, left]
- Left External capsule（左外囊） [white, left]
- Left Genu of internal capsule（左內囊膝部） [white, left]
- Left Medial preoptic nucleus（左內側視前核） [diencephalon, left]
- Left Paraventricular nucleus of hypothalamus（左下視丘室旁核） [diencephalon, left]
- Left Posterior limb of internal capsule（左內囊後腳） [white, left]
- Left Suprachiasmatic nucleus（左視交叉上核） [diencephalon, left]
- Left Supraoptic nucleus（左視上核） [diencephalon, left]
- Left Ventral posterolateral nucleus (VPL)（左視丘腹後外側核） [diencephalon, left]
- Left Ventral posteromedial nucleus (VPM)（左視丘腹後內側核） [diencephalon, left]
- Left Ventromedial nucleus of hypothalamus（左下視丘腹內側核） [diencephalon, left]
- Right Anterior limb of internal capsule（右內囊前腳） [white, right]
- Right Claustrum（右帶狀核） [basal, right]
- Right Dorsomedial nucleus of hypothalamus（右下視丘背內側核） [diencephalon, right]
- Right External capsule（右外囊） [white, right]
- Right Genu of internal capsule（右內囊膝部） [white, right]
- Right Medial preoptic nucleus（右內側視前核） [diencephalon, right]
- Right Paraventricular nucleus of hypothalamus（右下視丘室旁核） [diencephalon, right]
- Right Posterior limb of internal capsule（右內囊後腳） [white, right]
- Right Suprachiasmatic nucleus（右視交叉上核） [diencephalon, right]
- Right Supraoptic nucleus（右視上核） [diencephalon, right]
- Right Ventral posterolateral nucleus (VPL)（右視丘腹後外側核） [diencephalon, right]
- Right Ventral posteromedial nucleus (VPM)（右視丘腹後內側核） [diencephalon, right]
- Right Ventromedial nucleus of hypothalamus（右下視丘腹內側核） [diencephalon, right]

### 腦膜（硬腦膜反摺）：包覆整個腦，會遮住其他題目，主站腦部畫面預設也關閉（3）

- Falx cerebri（大腦鐮） [meninges]
- Left Tentorium cerebelli（左小腦幕） [meninges, left]
- Right Tentorium cerebelli（右小腦幕） [meninges, right]

### 屬於脊髓或脊椎的構造（脊髓、脊髓動脈、椎動脈）：主站腦部畫面同樣不畫（4）

- Anterior spinal artery [arteries, left]
- Anterior spinal artery [arteries, right]
- Vertebral artery [arteries, left]
- Vertebral artery [arteries, right]

### 走在顱外（臉、下頷）或硬腦膜上的腦神經分支：主站腦部畫面預設關閉，只留腦神經根部（14）

- Left Anterior division of mandibular nerve（左下頷神經前股） [cranial, left]
- Left Buccal nerve（左頰神經） [cranial, left]
- Left Inferior alveolar nerve（左下齒槽神經） [cranial, left]
- Left Lingual nerve（左舌神經） [cranial, left]
- Left Meningeal branch of maxillary nerve（左上頷神經腦膜支） [cranial, left]
- Left Mental nerve（左頦神經） [cranial, left]
- Left Posterior division of mandibular nerve（左下頷神經後股） [cranial, left]
- Right Anterior division of mandibular nerve（右下頷神經前股） [cranial, right]
- Right Buccal nerve（右頰神經） [cranial, right]
- Right Inferior alveolar nerve（右下齒槽神經） [cranial, right]
- Right Lingual nerve（右舌神經） [cranial, right]
- Right Meningeal branch of maxillary nerve（右上頷神經腦膜支） [cranial, right]
- Right Mental nerve（右頦神經） [cranial, right]
- Right Posterior division of mandibular nerve（右下頷神經後股） [cranial, right]

### 來源模型中沒有可畫的網格（0）

沒有。

### 缺中文名（0）

沒有。

### 名稱與同部位其他構造重複（打出名稱沒有唯一答案）（0）

沒有。

## 同名檢查

依模型原本的英文名（去掉 Left／Right、只比字母與數字）與中文名（去掉左／右）逐一比對所有腦網格；符合下列任一種就列出：(i) 左、右與中線三者同名；(ii) 同側兩個以上同名；(iii) 三個以上同名；(iv) 同名卻分屬不同群組，或同一中文名用在不同構造；(v) 左右一對但英文寫法不一致。每一項都要在 `app/quiz/brain.ts` 的 `BRAIN_NAME_CLASHES` 寫明處理方式，測試會在出現沒有說明的新同名時失敗。「中心 x」是網格包圍盒中心的 x（腦檔座標，正值為身體左側）。

### insular branches of middle cerebral artery (m2)（2 個網格；v 左右一對但英文寫法不一致）

| 模型名稱 | 位置 | 群組 | 中心 x | 測驗名稱（中文） | 狀態 |
| --- | --- | --- | --- | --- | --- |
| Right Insular branches of middle cerebral artery (M2) | 右 | arteries | -0.0426 | Right Insular branches of middle cerebral artery (M2-segment)（右大腦中動脈島支（M2 段）） | 出題 |
| Left Insular branches of middle cerebral artery (M2-segment) | 左 | arteries | 0.0426 | Left Insular branches of middle cerebral artery (M2-segment)（左大腦中動脈島支（M2 段）） | 出題 |

處理：左右一對的英文寫法不一致（M2／M2-segment）。已統一為 M2-segment，中文名統一為「大腦中動脈島支（M2 段）」；主站與測驗同步。

### middle cerebral artery (m3 segment)（2 個網格；v 左右一對但英文寫法不一致）

| 模型名稱 | 位置 | 群組 | 中心 x | 測驗名稱（中文） | 狀態 |
| --- | --- | --- | --- | --- | --- |
| Left Middle cerebral artery (M3 segment) | 左 | arteries | 0.0534 | Left Middle cerebral artery (M3-segment)（左大腦中動脈（M3 段）） | 出題 |
| Right Middle cerebral artery (M3-segment) | 右 | arteries | -0.0534 | Right Middle cerebral artery (M3-segment)（右大腦中動脈（M3 段）） | 出題 |

處理：左右一對的英文寫法不一致（M3 segment／M3-segment）。已統一為 M3-segment（模型裡 M1、M2 也多用連字號），中文名「大腦中動脈（M3 段）」不變；主站與測驗同步。

### superior cerebellar peduncle（3 個網格；i 左、右、中線三者同名；iii 三個以上同名；iv 同名但分屬不同群組）

| 模型名稱 | 位置 | 群組 | 中心 x | 測驗名稱（中文） | 狀態 |
| --- | --- | --- | --- | --- | --- |
| Left Superior cerebellar peduncle | 左 | cerebellum | 0.0092 | Left Superior cerebellar peduncle（左小腦上腳） | 出題 |
| Right Superior cerebellar peduncle | 右 | cerebellum | -0.0092 | Right Superior cerebellar peduncle（右小腦上腳） | 出題 |
| Superior cerebellar peduncle | 中線 | white | 0.0016 | Decussation of superior cerebellar peduncles（小腦上腳交叉） | 出題（限第三級） |

處理：模型有三個同名網格（左、右小腦上腳與一個中線白質網格）。左右兩個維持「左小腦上腳」「右小腦上腳」並正常出題；中線網格依位置改名為「小腦上腳交叉」（使用者已確認），只開放第三級。改名表：`app/organ/brain-overrides.ts`。

