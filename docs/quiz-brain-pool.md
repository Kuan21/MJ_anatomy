# Quiz 腦：題庫範圍與排除清單

此檔由 `node scripts/report-quiz-brain.mjs` 產生，請勿手改（排除與分組由 `scripts/prepare-quiz.mjs` 依 `app/quiz/brain.ts` 的規則決定；說明見 `docs/quiz-brain.md`）。來源是主站腦部畫面使用的同一個腦模型（`public/models/brain.glb`），測驗只用模型真正有的網格。

可出題：413 個構造（左右分開計），去掉左右後 225 個名稱。不出題：50 項（逐項列在下方，原因見各小節）。

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
| 白質纖維束與連合 | — | — | — | 62 / 33 | 62 / 33 |
| 腦幹 | — | — | — | 34 / 18 | 34 / 18 |
| 小腦 | — | — | — | 29 / 19 | 29 / 19 |
| 腦神經根 | 30 / 15 | — | — | — | 30 / 15 |
| 腦血管 | — | 44 / 25 | 17 / 12 | — | 61 / 37 |
| 全部腦 | 30 / 15 | 44 / 25 | 17 / 12 | 322 / 173 | 413 / 225 |

分類規則：腦神經根 → 神經；腦動脈 → 動脈；靜脈竇與靜脈 → 靜脈；皮質、核團、腦室、白質纖維束、腦幹、小腦、間腦 → 器官結構（沿用現有類別，不新增類別）。

## 資料卡

有資料卡：278 / 413 個構造；其中 82 個名稱對應的是較廣概念的資料卡（例如視丘的卡片對應視丘的各個核），卡片第一行會標明「所屬資料卡」。沒有資料卡的構造在答題後的資料卡顯示「尚無資料」，並列在 `docs/quiz-card-gaps.md`。資料卡內容全部來自 `public/models/brain/neuro-cards.json`，沒有新增文字。

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

### 名稱與同部位其他構造重複（打出名稱沒有唯一答案）（3）

- Left Superior cerebellar peduncle（左上小腦腳） [cerebellum, left]
- Right Superior cerebellar peduncle（右上小腦腳） [cerebellum, right]
- Superior cerebellar peduncle（上小腦腳） [white]

