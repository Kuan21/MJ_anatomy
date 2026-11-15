# 耳詳細模式：構造清單、來源與核對事項（內部文件）

位置：圖譜左側底部「耳」按鈕，或網址 `#/organ/ear`。程式：`app/ear-detail.tsx`（頁面，使用共用模板 `OrganDetailLayout`）、`app/mj-ear-viewer.ts`（3D 顯示）、`app/mj-ear-atlas.ts`（構造清單、分組、剝離層、資訊卡）。模型檔：`public/models/ear/ear-atlas.json` 與 `ear-atlas.bin.gz`，由 `node scripts/build-ear-atlas.mjs --source <來源資料夾>` 產生（來源檔不放在 repo，以 `scripts/ear-source-files.json` 的 sha256 釘住）。

## 一、模型是什麼

一個右耳，由三個來源組成，沒有鏡射，沒有左耳：

| 部分 | 來源 | 授權 |
| --- | --- | --- |
| 膜迷路（橢圓囊、球狀囊、三條半規導管、三個壺腹） | IE-Map（https://github.com/pydsgz/IEMap） | CC BY 4.0 |
| 鼓膜、錘骨、砧骨、鐙骨、骨迷路鑄型（前庭、三條半規管、前庭階）、鼓階、顏面神經、鼓索神經、蝸神經 | OpenEar 範例組，標本 Delta（https://doi.org/10.5281/zenodo.4362584） | CC BY 4.0 |
| 耳廓 | BodyParts3D 4.0 右外耳（FJ2811），取自主站已打包的圖譜 | CC BY 4.0 |
| 外耳道、耳咽管 | 本專案依解剖描述建立的示意管道 | 無第三方幾何 |

來源說明集中在 Source & credits（`public/ATTRIBUTION.md`、`public/model_sources.json`、圖譜首頁的 Source & credits），內容頁不放來源。

## 二、36 項構造

「模型」欄：真實 = 來源網格；示意 = 本專案建立；標示 = 標在骨面上的色塊；無 = 只有資訊卡。

| 分組 | 英文 | 中文 | 模型 |
| --- | --- | --- | --- |
| 外耳 | Auricle | 耳廓 | 真實（BodyParts3D，頂點數只有 415，外形粗略） |
| 外耳 | External acoustic meatus | 外耳道 | 示意 |
| 中耳 | Tympanic cavity | 鼓室腔 | 無（高亮邊界構造，其餘淡化） |
| 中耳 | Tympanic membrane | 鼓膜 | 真實 |
| 中耳 | Malleus | 錘骨 | 真實 |
| 中耳 | Incus | 砧骨 | 真實 |
| 中耳 | Stapes | 鐙骨 | 真實 |
| 中耳 | Tensor tympani | 鼓膜張肌 | 無 |
| 中耳 | Stapedius | 鐙骨肌 | 無 |
| 中耳 | Pharyngotympanic tube | 耳咽管 | 示意 |
| 骨性迷路 | Vestibule | 前庭 | 真實（鑄型的一部分，分界近似） |
| 骨性迷路 | Anterior / Lateral / Posterior semicircular canal | 前／外側／後半規管 | 真實（同上） |
| 骨性迷路 | Scala vestibuli | 前庭階 | 真實（同上） |
| 骨性迷路 | Scala tympani | 鼓階 | 真實 |
| 骨性迷路 | Oval window | 卵圓窗 | 標示（標在前庭上） |
| 骨性迷路 | Round window | 圓窗 | 標示（標在鼓階上） |
| 膜性迷路 | Utricle | 橢圓囊 | 真實 |
| 膜性迷路 | Saccule | 球狀囊 | 真實 |
| 膜性迷路 | Anterior / Lateral / Posterior semicircular duct | 前／外側／後半規導管 | 真實 |
| 膜性迷路 | Ampulla of anterior / lateral / posterior semicircular duct | 前／外側／後半規導管壺腹 | 真實 |
| 膜性迷路 | Cochlear duct | 耳蝸管 | 無 |
| 膜性迷路 | Endolymphatic sac | 內淋巴囊 | 無 |
| 神經與神經節 | Facial nerve (intratemporal part) | 顏面神經（顳骨內段） | 真實 |
| 神經與神經節 | Chorda tympani | 鼓索神經 | 真實 |
| 神經與神經節 | Cochlear nerve | 蝸神經 | 真實 |
| 神經與神經節 | Vestibular nerve | 前庭神經 | 無 |
| 神經與神經節 | Vestibulocochlear nerve | 前庭耳蝸神經 | 無 |
| 神經與神經節 | Spiral ganglion | 螺旋神經節 | 無 |
| 神經與神經節 | Vestibular ganglion | 前庭神經節 | 無 |
| 神經與神經節 | Geniculate ganglion | 膝狀神經節 | 無 |

中文名維持課程摘要用詞（耳廓、鼓室腔、耳咽管、卵圓窗、圓窗、球狀囊、蝸神經、前庭耳蝸神經、螺旋神經節、前庭神經節、膝狀神經節、耳蝸管）。

沒有網格的 10 項，選取時只標示相鄰或圍成它的真實構造（藍色），其餘淡化，不假裝畫出該構造；名單寫在 `app/mj-ear-atlas.ts` 各項的 `near`。

## 三、對位（兩個標本）

IE-Map 與 OpenEar 是不同人的標本，座標也不同。IE-Map 的鼓階、前庭階與三條半規管，以剛體變換（旋轉加平移，縮放固定為 1，疊代最近點）疊到 OpenEar 的外淋巴腔上。對位後各構造到 OpenEar 外淋巴腔表面的平均距離（公釐）：鼓階 0.16、前庭階 0.18、前半規管 0.26、外側半規管 0.32、後半規管 0.25；橢圓囊 0.73、球狀囊 0.44（兩者本來就在前庭內側，距離較大是預期的）。數值寫在 `ear-atlas.json` 的 `registration.errorMm`，`scripts/test-ear-atlas.mjs` 設有上限。

- OpenEar 的 `ScalaVestibuli.ply` 其實是整個骨迷路的鑄型（前庭階、前庭與三條半規管）。依最近的已對位 IE-Map 構造分成五塊，所以各塊之間的分界是近似的。
- 鐙骨底板到前庭壁的距離約 0.28 公釐，在 OpenEar 同一標本內直接量得，不靠對位。
- 卵圓窗、圓窗是從前庭與鼓階表面切出的色塊（分別 392、444 個三角形）。
- 兩個標本不是同一個人的耳；耳廓、外耳道、耳咽管與聽小骨的相對位置、比例為示意，不是同一個人的實測值。
- 偏左右：兩個標本都沒有標示側別。IE-Map 為 3D Slicer RAS 座標，耳蝸頂朝前外下，判為右耳；OpenEar 的耳蝸螺旋方向與 IE-Map 相同，鼓膜、鼓索神經與顏面神經的相對位置也符合右耳，因此整套當右耳呈現，不鏡射。

## 四、功能

- 左欄：外耳／中耳／內耳（骨性迷路、膜性迷路）／神經與神經節的樹狀清單、搜尋、全部開關；卡片只有資訊的項目標示〔只有資訊卡〕，示意項目標示〔示意〕。
- 視角：外側、內側、前面、後面、上面、下面、重設。
- 切面：矢狀、冠狀、水平三個方向；預設通過鐙骨；被切到的構造內側以平色顯示（不是真實組織斷面）。
- 逐層剝離（5 層，由外而內）：耳廓 → 外耳道 → 鼓膜 → 聽小骨與耳咽管 → 骨性迷路；膜性迷路與神經不被剝除。
- 點選構造：只選取，不移動鏡頭、不縮放、不自動 Focus／Isolate／Hide。選取深層構造時，位於它前面的外層構造變成淡淡的玻璃，仍可穿過它點選後方的構造。資訊卡的 Focus 才會移動鏡頭。
- Quiz：`#/quiz/ear`（22 題：真實網格的構造，不含兩條示意管道、兩個窗的色塊與 10 項只有資訊卡的構造），規則與排除原因見 `docs/quiz-ear.md`。

## 五、請使用者核對

1. 兩個標本的對位位置（鼓膜、聽小骨、迷路、神經的相對位置）。
2. 耳廓、外耳道、耳咽管的位置與方向。外耳道為 25 公釐長的管道，起點用 BodyParts3D 右耳廓上外耳道開口位置，只是目測選點；耳咽管方向與長度是依常規估算。
3. 蝸神經的網格偏粗大，可能連同內聽道內的神經束一起分割；名稱照 OpenEar。
4. 骨迷路各塊（前庭、三條半規管、前庭階）之間的分界。
5. 資訊卡內容：用自己的話依標準解剖學教科書的說法撰寫，尚未逐項對照公開圖譜（Gray's Anatomy 1918 年版插圖、OpenStax Anatomy and Physiology），請使用者核對；數字（長度、角度、比例）請特別留意。
6. 驗證方式：位置與形狀用多角度截圖檢視（見 PR 截圖）；對位誤差為數值量測。

## 六、重新產生

```
node scripts/build-ear-atlas.mjs --source <含 iemap/ 與 openear/ 的資料夾> [--atlas public/models] [--register]
node scripts/prepare-quiz.mjs        # 產生 quiz-ear.json
node scripts/test-ear-atlas.mjs
node scripts/test-quiz-ear.mjs
```

`--register` 重新做疊代最近點搜尋（預設使用已記錄的對位結果）。
