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

## 進度

| 區域 | 狀態 | 已檢查 | 問題 | 最後更新 |
|---|---|---|---|---|
| 頭頸（含腦、眼、耳） | 進行中 | 見下 | 見下 | 2026-11-15 |
| 骨盆與會陰 | 未開始 | — | — | — |
| 腹部 | 未開始 | — | — | — |

---

## 頭頸（含腦、眼、耳）

次序（使用者 2026-11-15 指定）：11 左右 → 9 名稱 → 14 Quiz 答案 → 功能測試 1–8 → 12 位置抽查 → 13 資訊卡。

### 問題清單

建議負責工作階段依 `docs/WORK_REGISTRY.md`；「腦部工作階段」目前不在登記表六個名稱內，由總管指定。

| 編號 | 區域 | 結構或功能 | 問題 | 證據 | 來源 | 嚴重程度 | 建議負責 |
|---|---|---|---|---|---|---|---|
| HN-01 | 頭頸／顳顎關節 | Lateral temporomandibular ligament 顳顎外側韌帶（左、右） | 左右調轉：名為「左」的韌帶模型在病人右側，名為「右」的在左側。網站程式沒有更正，主圖譜關節系統與頭頸 Quiz 都受影響。需修改：`public/models/joints.glb` 的 `Lateral temporomandibular ligament.l`／`.r` 兩個節點（名稱對調或幾何對調）；受影響題目：頭頸 Quiz 的 `joint:left lateral temporomandibular ligament`、`joint:right lateral temporomandibular ligament`（`quiz-head-neck.json` 由 joints.glb 生成，修模型後要重新生成）。 | joints.glb：`.l` 中心 x = −53.2 mm，`.r` 中心 x = +53.2 mm；同檔同側的關節囊 `.l` +46.0 mm、關節盤 `.l` +44.8 mm、蝶下頜韌帶 `.l` +36.6 mm、莖突下頜韌帶 `.l` +38.8 mm 均正常；Quiz 資料「Left lateral temporomandibular ligament」範圍 x −63～−48 mm。未在 3D 畫面截圖確認（數值）。 | Gray's Anatomy 1918（顳顎關節外側韌帶附著顴弓與下頜頸，位於同側關節囊外側）；TeachMeAnatomy | 會令溫書學錯 | 頭頸模型（joints.glb）＋總管（Quiz 題庫） |
| HN-02 | 頭頸／腦神經 | Vagus nerve (X) 迷走神經 Quiz 資訊卡「走向」（#337，左右共用一筆） | 寫「之後入胸腔，喉返神經由此分出並上行回到喉部」。右喉返神經在頸根部分出，勾住右鎖骨下動脈後上行；左喉返神經才在胸腔分出，勾住主動脈弓。左右要分開寫。 | `app/quiz/card-data.ts` 的 `'vagus nerve (x)'` 走向欄 | Gray's Anatomy 1918；TeachMeAnatomy；Kenhub | 會令溫書學錯 | 頭頸資訊卡（#337 批次） |
| HN-03 | 腦／Quiz、腦詳細模式 | 腦 Quiz 中線結構被拆成左右 | 單一的中線結構被拆成左、右兩題：視交叉（Left／Right Optic chiasm 左／右視交叉）、橋腦（Left／Right Pons 左／右橋腦）、中腦（Left／Right Midbrain 左／右中腦）、延腦（只有 Left Medulla oblongata 左延腦）。學生會以為有「左視交叉」「右橋腦」等獨立構造。完整掃描見下方「腦部中線結構掃描」。 | `quiz-brain.json` 的結構名稱；brain.glb 節點 `Optic chiasm.l/.r`、`Pons.l/.r`、`Midbrain.l/.r` 的範圍都剛好以 x = 0 為界 | Gray's Anatomy 1918；OpenStax Anatomy & Physiology（腦幹與視交叉為正中構造） | 會令溫書學錯 | 腦部工作階段（由總管指定） |
| HN-04 | 腦詳細模式 | Medulla oblongata 延腦模型 | brain.glb 只有 `Medulla oblongata.l`（x 0～+13 mm），沒有右半；腦詳細模式的延腦缺右半邊。 | brain.glb 節點清單與 POSITION 範圍 | OpenStax Anatomy & Physiology | 會令溫書學錯（與 HN-03 同一處修） | 腦部工作階段（由總管指定） |
| HN-05 | 腦詳細模式 | Tentorium cerebelli 小腦幕、Anterior spinal artery 脊髓前動脈 | 兩者都是單一構造，但 brain.glb 拆成 `.l`／`.r` 兩半（各以 x = 0 為界）。目前不在 Quiz，點選時名稱是否帶左右待功能測試確認。 | brain.glb 節點範圍 | Gray's Anatomy 1918 | 影響使用 | 腦部工作階段（由總管指定） |
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
| 資訊卡顯示名稱（英文 Left／Right 與中文 左／右） | 讀取中，已讀 300 張 | 0 |

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

**本來就左右成對、分左右正確**：下視丘各部（Preoptic／Anterior／Tuberal／Lateral／Posterior hypothalamus）、Pyramid of medulla oblongata 延腦錐體、Superior／Inferior colliculus 上／下丘、Fornix 穹窿（腳與柱成對；體部在中線，題目只有左右兩題，請使用者決定是否加「體部」說明）、Wing of central lobule 中央小葉翼、基底動脈橋腦內側支與外側支。

### 9 名稱（進行中）

- 主圖譜頭頸結構名稱：沒有 `.l／.r／.001` 等後綴殘留；沒有拉丁文；頭頸範圍內沒有兩個不同結構同名。全身另有 8 組同名不同結構（Right／Left transversus thoracis、Right／Left ureter、Urinary bladder、Sacrum、Right／Left hip bone），留待骨盆與腹部核對時處理。
- 13 個小寫開頭的英文名（例如 spinalis、set of interspinales cervicis、anterior inferior cerebellar artery、artery of central sulcus），與其他名稱大小寫不一致：外觀小問題，待資訊卡讀完後一併列出。
- 中文名與必考清單（共筆）用詞不同：讀取中，已讀 300 張資訊卡中有 16 個結構不同（例如 咽上縮肌／上咽縮肌、頸深動脈／深頸動脈、大腦前動脈／前大腦動脈、腦下垂體／腦垂體、提口角肌／提嘴角肌）。注意 `docs/quiz-head-neck-name-decisions.md` 對其中多數選了網站現名、共筆寫法作別名，與 CLAUDE.md「第二次跑考範圍中文名跟共筆」不一致，需使用者決定以哪一份為準。完整清單待資訊卡讀完補上。

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
| 骨（孔、管） | RS-0546 | Optic canal 視神經管 | 只有腦資訊卡（眼詳細模式的眶孔功能待功能測試確認） |
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

合計 49 個結構（50 個清單 id；翼靜脈叢、鼓索神經、小腦延腦池各有兩個 id）。分組：骨 11、動脈 5、靜脈 1、神經 2、腦 12、耳 16、口腔 1、其他 1。建議負責：耳由總管（耳詳細模式）；腦膜、腦池與嗅球由腦部工作階段；骨性標記、孔、頸部動脈與翼靜脈叢由頭頸模型；界溝、頭皮由總管分派。

另外建議修改檢查方法：`check-required-structures.mjs` 把 CARD-ONLY 與 CONCEPT-ONLY 算作「已有」，與完成標準不符；建議改為只把有 3D 網格（PRESENT、ALIAS）算已有，其餘列入缺項（交總管決定）。

### B01 批次編號衝突（等使用者批）

- `docs/quiz-head-neck-card-plan.md` 的批次表：B01＝骨（14 塊頭骨），B06＝神經（28 條），B07＝神經（8 條）。
- 已合併的 #337 與登記表稱「B01 神經」：實際內容是 13 條頭頸神經，不是計劃表的 B01 骨。
- 建議：以計劃表為唯一編號來源，批次名稱寫成「類別＋計劃表編號」，例如「B06 神經（第 1 部分，#337）」；#337 的 review-log 與登記表改用這個寫法；之後每批 PR 標題都用「頭頸資訊卡 B06 神經（1/2）」這類格式，避免同一編號指兩批。核對報告暫時以 PR 編號指稱（例如「#337 神經卡」）。

### 13 資訊卡（#337 神經卡已核對；其餘待做）

#337 的 13 張神經卡（顏面、三叉、眼、上頜、頦、頰、舌咽、迷走、舌下、下頜神經前股、後股、下齒槽、下頜舌骨肌神經）逐欄核對「來源、走向、支配範圍」：

- 錯誤 1 項：HN-02（迷走神經，右喉返神經）。
- 不完整 1 項：眼神經卡寫額神經「延續為眶上神經」，沒有提滑車上神經（額神經分成眶上與滑車上神經）。外觀小問題（Gray's Anatomy 1918；TeachMeAnatomy）。
- 用字：見 HN-07。
- 其餘 11 張未見事實錯誤（Gray's Anatomy 1918；TeachMeAnatomy；Kenhub）。
