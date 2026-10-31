# MJ Anatomy 全站 Bug Audit

- 稽核日期：2026-10-30
- 對象：`main` @ `e09263c`；正式 build（`npm run build -- --base /MJ_anatomy/`，與 GitHub Pages 相同子路徑）＋ `vite preview`
- 本文件**只報告，沒有修改任何程式、模型或內容**。所有涉及解剖內容、名稱、Quiz 資料的修正都標 **〔需人工審核〕**，只提建議，等使用者審核後才開 PR，不可自動 merge。純介面／效能／腳本類標「可自動 merge」，可另開 PR。
- 嚴重度：**P0** 資料錯誤／保密外洩；**P1** 功能壞／阻礙使用；**P2** 體驗差；**P3** 微調。
- 截圖：依 CLAUDE.md，截圖不進工作分支，放在獨立的 `pr-screenshots` 分支（`audit-2026-10-30/` 資料夾），本文以固定 commit 網址引用。只有能在無 GPU 的 headless 瀏覽器重現的項目附截圖（P0-01、P0-02、P1-01、P2-04、P2-15 等）；其餘項目屬資料或程式邏輯，附 `檔案:行號` 與實際呼叫網站函式的結果，未附截圖。

## 方法與限制

| 項目 | 做法 |
| --- | --- |
| 名稱、覆蓋率、資訊卡、Quiz | 把網站實際使用的 TS 模組（`structureProfile()`、`buildSearchIndex()`、`judgeName()` 等）在暫存資料夾打包後直接呼叫，逐項比對 `docs/paokao-checklist.json`（574 項）、`docs/paokao-names.json`、`docs/glossary.json`、`docs/muscle-layers.json`，並對照 Netter／Grant's／Moore |
| 心臟、腦部、CSF | 讀 `app/organ/*`、`docs/neuro-card-text/*`、生成的 `heart-detail.json.gz`、`neuro-cards.json`，對照教科書與 `docs/neuro-notes.json`（只核對事實，不在網站或本文引用原文） |
| 保密 | 對 **build 輸出** `dist/`（含解壓所有 `.gz`）grep 關鍵字、檢查所有 JSON 的 note／source／context 欄位、資料夾與檔名 |
| 瀏覽器 | Playwright（Chromium headless，SwiftShader 軟體 WebGL），桌機 1440×900、手機 390×844（觸控、直向／橫向）；記錄 console、HTTP ≥ 400、request failed、draw call |

**限制（未能驗證，需使用者在真機確認）**
- 容器沒有 GPU，SwiftShader 每格 0.2–7 秒，**FPS、相機過渡是否約 300 ms、slider 是否閃爍無法實測**；這些項目只做程式碼審查，標「待確認（需真機）」。
- Safari／iOS／Firefox 無法在此環境執行，B13 只做程式碼審查。
- 關節動作時的跟隨、皮膚殘影沒有逐一在 3D 畫面確認（既有 `npm run check:motion` 有數值測試）。

---

## 總表（按嚴重度排序）

| 編號 | 嚴重度 | 類別 | 摘要 | 涉及解剖內容 |
| --- | --- | --- | --- | --- |
| P0-01 | P0 | 保密 | 腦部資訊卡「別名」直接顯示筆記片段（「下圖藍色路徑」「同側延腦」等），可被搜尋 | 〔需人工審核〕 |
| P0-02 | P0 | 名稱 | 上頜神經（maxillary nerve）全站顯示成「Axillary nerve／腋神經」 | 〔需人工審核〕 |
| P0-03 | P0 | 名稱／資訊卡 | 46 個神經分支（橈、尺、正中、腋神經分支）英文標題與卡片內容變成母神經 | 〔需人工審核〕 |
| P0-04 | P0 | 名稱 | Netter 名稱正規化把左右字搬到句首或刪掉（415 筆；9 筆左右意思改變） | 〔需人工審核〕 |
| P0-05 | P0 | 側別 | 依幾何更正左右的 mesh，英文已更正、中文仍是原側別（英 Right／中「左」） | 〔需人工審核〕 |
| P0-06 | P0 | 名稱 | 足部內收拇趾肌兩頭顯示成手部「拇收肌」；屈拇趾短肌頭顯示手部名稱 | 〔需人工審核〕 |
| P0-07 | P0 | 名稱 | 滑車神經中文只剩「滑車」；動眼神經核、上下支都顯示「動眼神經」 | 〔需人工審核〕 |
| P0-08 | P0 | 資訊卡 | 上下腔靜脈、肱／橈／尺／脛前後動脈等 32 條主要血管卡寫「細小分支逐漸變細而終止」 | 〔需人工審核〕 |
| P0-09 | P0 | 資訊卡 | 左側最上肋間動脈（肋頸幹）來源寫成鎖骨下動脈第二段（應為第一段） | 〔需人工審核〕 |
| P0-10 | P0 | 側別（待確認） | 咽中縮肌、腰升靜脈、上丘臂原始 mesh 左右對調未更正；背部 Quiz 腰升靜脈標錯側 | 〔需人工審核〕 |
| P0-11 | P0 | 模型（待確認） | 「Left fibular vein」包含一段位於大腿高度的 mesh（FJ2190） | 〔需人工審核〕 |
| P1-01 | P1 | 載入 | 示意模型第 0 包每次都載入失敗：膈神經、喉返神經、內臟神經、迷走神經幹、臂神經叢內／外側束等 61 個結構不會出現；載入條永遠停在 98% 琥珀色 | 程式修正；修好後多出 61 個示意模型，建議人工看畫面 |
| P1-02 | P1 | 名稱 | 心臟英文名仍是「Mitral valve」，未改為使用者要求的「Bicuspid valve」 | 〔需人工審核〕（已在心臟 PR C 處理，等你審核） |
| P1-03 | P1 | 缺漏 | 跑考摘要結構真正缺少：枕動脈、動脈韌帶、足背側骨間肌、肋間外／內膜（稽核腳本誤配成「已有」） | 〔需人工審核〕 |
| P1-04 | P1 | 互動 | 韌帶／關節（349）、頸部血管、腦構造從搜尋選取後 3D 無反應；按 Focus／Isolate 畫面全空 | 可自動 merge（介面程式） |
| P1-05 | P1 | 互動 | 從主搜尋選腦構造，整個 3D 圖譜卸載後重新載入、視角重設 | 可自動 merge |
| P1-06 | P1 | 缺漏／互動 | 十字韌帶、半月板、項韌帶、薦結節韌帶等 15 項只在 joints.glb：畫得出但點不到、不高亮 | 可自動 merge（介面程式） |
| P1-07 | P1 | 名稱 | 跑考摘要中文用詞未採用且搜尋 0 筆（內陰動脈、淺旋髂動脈、內旋股動脈、旋腓動脈等） | 〔需人工審核〕 |
| P1-08 | P1 | 名稱 | 特殊區域（腋窩）面板仍顯示「背闊肌」 | 〔需人工審核〕 |
| P1-09 | P1 | Quiz | 第二級：主網站卡片上的名稱、跑考摘要寫法被判錯（約 25 種，347／836 個英文名與主網站不同） | 〔需人工審核〕 |
| P1-10 | P1 | Quiz | 「只練錯題」時，與目前側別不同側的題目不會載入，無法作答 | 可自動 merge（Quiz 流程程式，不改題庫） |
| P1-11 | P1 | 保密（輕度） | 網路請求路徑與公開檔案出現「paokao」（跑考）與「course summary」 | 改檔名屬建置腳本，可自動 merge；ATTRIBUTION 文字請使用者決定 |
| P1-12 | P1 | 保密（repo） | 遠端分支名稱含 `cmu-course-notes`、`course-notes`、`mj-notes` 等（違反 CLAUDE.md） | 需使用者決定是否刪分支 |
| P2-01 | P2 | 載入 | 首次載入約 79 MB（262 個請求），主圖譜沒有 Draco／meshopt；預設隱藏的女性器官也一開始載入 | 可自動 merge |
| P2-02 | P2 | 部署 | 固定檔名的目錄檔被 Pages 快取 10 分鐘，部署後可能指向已刪 chunk；lazy 路由沒有 ErrorBoundary | 可自動 merge |
| P2-03 | P2 | 瀏覽器 | 沒有 DecompressionStream 的瀏覽器（iOS／Safari ≤ 16.3、舊 Firefox）整個圖譜載入失敗 | 可自動 merge |
| P2-04 | P2 | 介面文字 | 大量只有英文的 UI 字（系統清單、搜尋、面板底部、資訊卡按鈕、錯誤訊息、aria-label） | 可自動 merge |
| P2-05 | P2 | 互動 | 已淡化或半透明的結構（胸膜、腹膜、sheath、autoFade 遮擋物）仍會攔截點選 | 可自動 merge |
| P2-06 | P2 | 互動 | 細小結構沒有點選容許範圍；備援的螢幕距離選取只在永遠關閉的爆炸圖時執行 | 可自動 merge |
| P2-07 | P2 | 手機 | 觸控時沒有平移手勢；canvas 的 aria-label「Drag to orbit」與實際不符 | 可自動 merge |
| P2-08 | P2 | 相機 | 對焦動畫中按 Reset／視角按鈕，會被舊動畫拉回 | 可自動 merge |
| P2-09 | P2 | 互動 | Reset 沒有清除特殊區域、分層選取等狀態 | 可自動 merge |
| P2-10 | P2 | 相機 | 縮放視窗、旋轉裝置後相機被重設 | 可自動 merge |
| P2-11 | P2 | 手機 | 手機上資訊卡蓋住剛選的結構（待確認） | 可自動 merge |
| P2-12 | P2 | 互動 | 「頭部」分頁搜尋頸部以下結構，相機飛過去但結構被切面切掉 | 可自動 merge |
| P2-13 | P2 | 手機 | 手機上從搜尋選特殊區域，看不到邊界／內容物面板（待確認） | 可自動 merge |
| P2-14 | P2 | 部署 | Cache Storage 只增不減（每次重新產生資料包多存約 140 MB） | 可自動 merge |
| P2-15 | P2 | 內容頁 | 頁首與性別按鈕 title 顯示模型來源（「BodyParts3D · Human Atlas adapted」），應集中在 Source & credits | 可自動 merge |
| P2-16 | P2 | 載入 | 載入失敗時只有一條沒有文字的琥珀色細線，console 也沒有錯誤，使用者不知道缺什麼 | 可自動 merge |
| P2-17 | P2 | 名稱 | 同一 mesh 多種中文（腦部 64 張卡：中央前迴／回、大腦前動脈／前大腦動脈…；特殊區域面板 7 組；心臟瓣葉） | 〔需人工審核〕 |
| P2-18 | P2 | 名稱 | 同族結構寫法不一（總腓／腓總、外旋股／旋股外側、內蹠／足底內側…）；膝上動脈命名覆寫失效 | 〔需人工審核〕 |
| P2-19 | P2 | 搜尋 | 無結果時沒有提示；138 組重複名稱；列出網站沒畫的 64 個關節節點；簡體字、加「muscle」或單複數不同就 0 筆 | 部分〔需人工審核〕 |
| P2-20 | P2 | 缺漏 | 20 項心臟結構只在心臟頁，主搜尋 0 筆 | 可自動 merge（搜尋索引） |
| P2-21 | P2 | 腦／CSF | CSF 外側孔畫成並寫成流入小腦延髓池（應為橋小腦角池），與同模式資訊卡矛盾 | 〔需人工審核〕 |
| P2-22 | P2 | 腦 | 椎動脈被整條排除：PICA 起點懸空、椎動脈卡顯示「模型未有」 | 〔需人工審核〕 |
| P2-23 | P2 | 心臟 | 右心房腔內構造清單出現左心耳 | 〔需人工審核〕 |
| P2-24 | P2 | 腦 | 基底核直接／間接路徑沒有完整呈現；蒼白球外節作用方向描述誤導 | 〔需人工審核〕 |
| P2-25 | P2 | 腦 | 缺 Brodmann 43 區；腦島編號英文 13、14／資訊卡 13–16 不一致 | 〔需人工審核〕 |
| P2-26 | P2 | 腦 | 卡片 0087 中文名截斷；0281「外骨膜」寫成包覆顱骨內面 | 〔需人工審核〕 |
| P2-27 | P2 | 保密檢查 | `test-neuro-notes.mjs`／`check-no-notes.mjs` 涵蓋不足，抓不到 P0-01；失敗訊息會印出筆記片段 | 可自動 merge（腳本） |
| P2-28 | P2 | 資訊卡 | 喉內肌資料已寫好但因連字號比對失敗從不顯示 | 程式修正，顯示內容改變→〔需人工審核〕 |
| P2-29 | P2 | 資訊卡 | 19 張示意卡有空白「附著」列；1,711 個 mesh 卡片只有區域／類型兩列 | 部分〔需人工審核〕 |
| P2-30 | P2 | 資訊卡 | 15 個接合段沒有標「示意」；vessel-ends 示意段顯示錯的模型說明；FMA 列也套到 `-END` 示意段 | 〔需人工審核〕 |
| P2-31 | P2 | 資訊卡 | 靜脈卡用「主要分支」（應為屬支）；不同結構共用中文名；36 組兩側都有 mesh 卻沒標左右 | 〔需人工審核〕 |
| P2-32 | P2 | 資訊卡 | 肱深動脈卡沒有走向；標題 profunda brachii、分支列表 deep brachial 混用；上／下尺側副動脈區域標成「前臂」 | 〔需人工審核〕 |
| P2-33 | P2 | Quiz | Quiz 答案卡欄位標籤對不上：下肢動、靜、神經、骨骼 208／208 張全空，第二級題庫因此偏小 | Quiz 資料→〔需人工審核〕 |
| P2-34 | P2 | Quiz | 第二級不接受 n./a./v./m. 縮寫、簡體字、「左側」寫法 | 〔需人工審核〕（同義詞屬 Quiz 資料） |
| P2-35 | P2 | Quiz | 對立結構被判「拼字接近」（大／小菱形肌、腓骨長／短肌、前／後骨間神經） | 〔需人工審核〕 |
| P2-36 | P2 | Quiz | 心臟 Quiz 把右心室構造當成左心室的一部分（中線結構也刪左右字） | 〔需人工審核〕 |
| P2-37 | P2 | 稽核腳本 | `audit-paokao.mjs` 配對過寬（左右當停用字、拼字修正、只看名稱不看可否點選），造成「0 缺少」的錯誤結論 | 可自動 merge（腳本） |
| P2-38 | P2 | 效能 | 關節動作後第一次點擊要在 CPU 重新蒙皮所有可見部件（待確認） | 可自動 merge |
| P3-01～P3-35 | P3 | 各類 | 見〈P3 微調〉一節 | 見各項 |

統計：P0 11 項、P1 12 項、P2 38 項、P3 35 項。

---

## P0：資料錯誤／保密外洩

### P0-01　腦部資訊卡「別名」直接顯示筆記片段〔需人工審核〕
- **重現**：腦部詳細模式（左欄「腦」）→ 搜尋框輸入「下圖」→ 點「其他構造」中的卡片 → 卡片「別名：」一行出現「下圖藍色路徑」。其他例子：0159「下圖紅色路徑」、0452「比較」與「…vs. ventral spinothalamic tract」、0134 一段描述句（與筆記內文 15 字相同）、0136「同側延腦」、0237「同側上橄欖核」、0270「參與威利氏環」、0352「又稱內側小腦神經核」。已在 `dist/models/brain/neuro-cards.json` 確認 10 張卡受影響。
- **原因**：`scripts/prepare-neuro-notes.mjs:65-66` 把筆記結構表的 `zh_alias`／`alt_en`，以及併入卡片的筆記項目名稱，全部寫進 `aka`；`app/organ/brain-note-card.tsx:8` 直接顯示，`app/organ/brain-notes.ts:34` 也拿來搜尋。`check-no-notes.mjs`、`test-neuro-notes.mjs` 都不檢查 `aka`。
- **截圖**：![腦部卡片別名](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/b5cace644289ab5bd2878bfc07f0d61236555d82/audit-2026-10-30/brain-aka.png)
- **建議修法**：在 `docs/neuro-notes-curation.json` 為每張卡列出允許的別名白名單，不再自動匯入筆記的別名與併入名稱；測試加上：別名不可含「圖、比較、vs.、同側、對側、參與、連接、又稱」、不可是句子、不可重複。
- **涉及解剖內容**：是（卡片內容）〔需人工審核〕。

### P0-02　上頜神經全站顯示成腋神經〔需人工審核〕
- **重現**：主圖譜 → 右上「Find a structure」→ 輸入 `maxillary nerve` → 結果全部是「Left/Right Axillary Nerve／左／右腋神經」（神經串流 2 筆、腦 2 筆、Meningeal branch of maxillary nerve 等共 8 筆）。點選後資訊卡標題也是腋神經。中文「上頜神經」「上頷神經」搜尋 0 筆。腦部詳細模式本身是對的。
- **原因**：`app/mj-structure-info.ts:287` 用 `n.includes(k)` 子字串比對，「maxillary nerve」包含「axillary nerve」；中文 `:260-262` 的 `nerveTerms` 也是 `x.includes('axillary')`。`docs/naming-report.md` 4.3 已列過但未修。
- **截圖**：![搜尋 maxillary nerve](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/b5cace644289ab5bd2878bfc07f0d61236555d82/audit-2026-10-30/s-maxillary-results.png)
- **建議修法**：兩處改成整詞比對（`\b`），加 maxillary／axillary 的回歸測試。
- **涉及解剖內容**：根源是程式，但修好後顯示名稱改變〔需人工審核〕。

### P0-03　46 個神經分支英文標題與卡片內容變成母神經〔需人工審核〕
- **重現**：搜尋 `radial nerve` 會出現 5 筆同名「Right radial nerve」；點「Right superficial branch of radial nerve」，英文標題是「Right radial nerve」、中文是「右橈神經淺支」，神經根、走向、支配範圍整段是橈神經主幹的資料。尺神經指背支的卡片寫「經內上髁後方…支配尺側腕屈肌、指深屈肌內側半」。「Communicating branch of median nerve with ulnar nerve」中英都變成正中神經。
- **原因**：`mj-structure-info.ts:283-294` 的 `displayEnglish` 取名稱中「包含」的最長 detailed key 當標題；`detailKey`（`:273`）只要分支名稱包含主幹名就配主幹資料。
- **建議修法**：只有（去掉左右後）完全相等才套用 detailed 的標題與資料；分支沒有自己的資料時只顯示區域／類型。
- **涉及解剖內容**：〔需人工審核〕。

### P0-04　Netter 名稱正規化搬動或刪除左右字〔需人工審核〕
- **重現**：
  - 「Marginal branch of right coronary artery」顯示成「Right marginal branch of coronary artery」；「Trunk of left coronary artery」→「Left trunk of coronary artery」。
  - 「First right anterior branch of anterior interventricular branch of left coronary artery」→「Left first anterior branch…of coronary artery」，**right 不見了**；中文也少了「右」。
  - 「Left lobe branch of left hepatic artery」→「Left lobe branch of hepatic artery」。
  - 共 415 個名稱的左右字被移到句首，其中 9 個左右組合改變意思。
- **原因**：`app/mj-netter-terminology.ts:59-63` 刪除所有左右字，只要有任何 left 就在句首加 Left（`:134`）。
- **建議修法**：只搬動表示身體側別的「of left/right <器官或肢體>」；名稱本身帶左右的（coronary、hepatic、portal、gastric、colic、pulmonary、ventricle、atrium）保留原文；名稱內有兩個不同左右字時不改寫。
- **涉及解剖內容**：〔需人工審核〕。

### P0-05　依幾何更正左右的 mesh，中文仍是原側別〔需人工審核〕
- **重現**：
  - FJ1469：英文「Right flexor pollicis brevis」，中文「左屈拇短肌」；FJ1469M 相反。
  - FJ2190 與 FJ2190-END：英文「Left fibular vein」，中文「右腓靜脈」。
  - FJ2186／FJ2199：英文已改為「Left/Right dorsal metatarsal vein」，中文卻是手部的「掌背靜脈」，也沒有左右；卡片的 FMA ID 仍是原 concept（FMA22954 dorsal metacarpal vein）。
- **原因**：`mj-structure-info.ts:359-362` 中文與肌肉資料用 `part.name`，英文用 `correctedPartName(part)`。Quiz 用更正後名稱，所以 Quiz 正確，兩邊不一致。
- **建議修法**：`sourceName` 改用 `correctedPartName(part)`；`*-END` 段沿用母段名稱；FMA 列在更正過的 mesh 上隱藏或註明。
- **涉及解剖內容**：〔需人工審核〕。

### P0-06　足部內收拇趾肌兩頭顯示手部「拇收肌」〔需人工審核〕
- **重現**：搜尋 `adductor hallucis` → 「Oblique/Transverse head of adductor hallucis」中文是「拇收肌斜頭／橫頭」，與手部 adductor pollicis 同名。屈拇趾短肌兩頭顯示「拇短屈肌外側／內側頭」（手部用詞）；尺側腕屈肌兩頭顯示「尺側腕屈肌…頭」，分層面板卻是「尺側屈腕肌」。
- **原因**：`mj-structure-info.ts:171` 錯誤對照 `muscleZh['adductor hallucis']='拇收肌'`；「X head of Y」規則（`:233-238`）用 `directBaseChinese()`，跳過命名覆寫。
- **建議修法**：改正對照（依 muscle-layers.json 用「內收拇趾肌」）；母肌中文改由 `chineseName()` 取得。
- **涉及解剖內容**：〔需人工審核〕。

### P0-07　滑車神經中文只剩「滑車」；動眼神經核顯示母神經〔需人工審核〕
- **重現**：搜尋 `trochlear` → 3 筆：「左滑車神經」與兩筆「左滑車」；Trochlea of superior oblique 也是「滑車」。Nucleus／accessory nucleus of oculomotor nerve、Superior/Inferior branch of oculomotor nerve 都顯示「動眼神經」；鼻睫神經與睫狀神經節交通支顯示「鼻睫神經」。
- **原因**：`mj-structure-info.ts:197` 骨性標記中文表 `landmarkZh` 用 `n.includes(key)`，且套用在非骨骼系統。
- **建議修法**：骨性標記詞表改整詞比對、只套用在骨骼系統；神經核／分支有自己的中文名。
- **涉及解剖內容**：〔需人工審核〕。

### P0-08　32 條主要血管卡寫「細小分支逐漸變細而終止」〔需人工審核〕
- **重現**：點上腔靜脈（FJ3645）、下腔靜脈（FJ3441）、肱、橈、尺、脛前、脛後動脈等 → 卡片有「Model end：Small branches end by thinning out…」。上腔靜脈開口於右心房、肱動脈分成橈／尺動脈，這句話不成立。
- **原因**：`app/mj-vessel-ends.json` 的 714 個 id 一律加上同一句。
- **建議修法**：只對真正沒有下一段的細小末端顯示；主幹血管改寫為「模型在此截斷，實際延續至…」或不顯示。上下腔靜脈模型末端是否被收細，**未在 3D 畫面確認**。
- **涉及解剖內容**：〔需人工審核〕。

### P0-09　左側最上肋間動脈來源寫錯〔需人工審核〕
- **重現**：搜尋 `supreme intercostal artery` → 左側（PK-123）卡片寫肋頸幹「來自鎖骨下動脈第二段」，與右側（PK-120）相同。
- **教科書**：右側肋頸幹多起自鎖骨下動脈第二段，左側通常起自第一段（Gray's、Moore）。
- **建議修法**：左側改為第一段。
- **涉及解剖內容**：〔需人工審核〕。

### P0-10　三組原始 mesh 左右對調未更正（待確認）〔需人工審核〕
- 座標慣例已驗證：+x＝病人左側（867 個 left mesh 中 820 個 x>0）。
- 咽中縮肌：Right（FJ2742）x=+0.008、Left（FJ2754）x=−0.010；同模型咽上、咽下縮肌正確。
- 腰升靜脈：Left（FJ3493）x=−0.028～−0.007、Right（FJ3589）x=+0.012～+0.025。**背部 Quiz 問「Left ascending lumbar vein」時標示的是病人右側。**
- 上丘臂：Brachium of left superior colliculus（FJ1735）x=−0.011。
- **原因**：`app/mj-part-regions.ts:57-73` 只對上下肢做幾何更正。
- **建議修法**：先在 3D 截圖確認，再加入 `NAME_OVERRIDES`。只靠座標判斷，**未在 3D 畫面確認**。
- **涉及解剖內容**：〔需人工審核〕。

### P0-11　「Left fibular vein」包含大腿高度的 mesh（待確認）〔需人工審核〕
- 下肢 Quiz 的「Left fibular vein」由 FJ2184、FJ2187、FJ2190 組成；FJ2190 的 y＝0.62～0.80（股骨高度），右側同名結構只到 0.34。可能是原始資料命名錯誤。**未在 3D 畫面確認**。
- **建議修法**：3D 確認後，把 FJ2190 歸到正確的靜脈或排除。

---

## P1：功能壞／阻礙使用

### P1-01　示意模型第 0 包每次載入失敗，61 個結構不會出現
- **重現**：開主圖譜，等待約 20 秒 → 畫面底部載入條變成琥珀色並停在 98%（`aria-label="重試未完成的組織"`）；按它重試也一樣。搜尋 `phrenic nerve`、`recurrent laryngeal`、`greater splanchnic`、`anterior vagal trunk`、`medial cord of brachial plexus` 等：搜尋結果列得出（例如「Left Phrenic Nerve 左膈神經 1 piece」），但點選後相機只稍微移動，沒有資訊卡、3D 也沒有模型。Console 沒有任何錯誤訊息。這 61 個結構在主圖譜與神經串流中都沒有其他模型（已逐一比對），所以網站上目前完全看不到。
- **實測**：在瀏覽器攔截 `failedChunks.set`，得到「組織包 159: Cannot read properties of undefined (reading 'userData')」。組織包 159＝主圖譜 98 包＋facial 18＋supplement 18＋female 6＋serous 5＋vessel-ends 13 之後的 **paokao 示意模型第 0 包**。
- **原因**：`app/scene.tsx:408` 的 `shellOf()` 對 `isShellSurface(p.name)` 為真的部件回傳 `p.system+':shell'`；`app/mj-heart-layers.ts:10` 的 `isShellSurface` 用 `/pericardi/i`，**也匹配到「pericardiophrenic artery／vein」**，產生 `arterial:shell`、`venous:shell` 兩個沒有材質的 key；`scene.tsx:596` `fadeMatFor(mats.get(...))` 拿到 `undefined`，整包 throw。整個資料夾只有這一包受影響（已掃過所有 stream）。
- **受影響的 61 個結構**（左右各一）：superior thoracic a.、thoraco-acromial a. 鎖骨支、lateral mammary a.、internal thoracic a. 內側乳房支、anterior intercostal aa.、phrenic n.、pericardiophrenic a./v.、recurrent laryngeal n.、greater／lesser／least splanchnic n.、celiac／aorticorenal／superior mesenteric／renal ganglion、anterior／posterior vagal trunk、esophageal plexus、lateral／medial cord of brachial plexus、median n. 內／外側根、intercostobrachial n.、recurrent branch of median n.、posterior circumflex humeral v.、posterior interosseous a.、radial a. 淺掌支、ulnar a. 深掌支、lateral brachial v.、anterior／posterior interosseous v.、thoracoepigastric v.。這些都是跑考清單項目，`audit-paokao.mjs` 只看資料，所以報告「0 缺少」。
- **截圖**：![載入條停在琥珀色、搜尋 phrenic nerve 3D 無模型](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/b5cace644289ab5bd2878bfc07f0d61236555d82/audit-2026-10-30/s-phrenic-card.png)
- **建議修法**：`isShellSurface` 改為 `/pericardium|pleura/`（或排除 pericardiophrenic），並讓 `shellOf` 在沒有對應材質時退回 `p.system`；`test-scene-loading.mjs` 加上「所有 stream 的每包都能組裝」的測試；載入失敗時在 console 與畫面說明缺哪一組（見 P2-16）。
- **涉及解剖內容**：修正本身是渲染程式，不改模型資料；但修好後會多顯示 61 個示意模型，建議人工看畫面確認位置。

### P1-02　心臟英文名仍是「Mitral valve」〔需人工審核〕（已在心臟 PR C 處理：零件名改為 Bicuspid／Tricuspid valve 的 cusp，Mitral 與 Left atrioventricular 留作同義詞）
- **重現**：心臟詳細模式 → 名稱標籤 → Valves 顯示「Mitral valve」；Leaflets 顯示「Mitral · anterior／posterior」；左心室清單說明「…leaflet of the mitral valve」；Quiz 輸入框提示「e.g. Mitral valve」；主圖譜 FJ2420／FJ2432「Anterior/Posterior leaflet of mitral valve」。Tricuspid、Aortic、Pulmonary valve 正確。
- **位置**：`app/organ/heart.tsx:12,112`、`app/organ/heart-chambers.ts:73-79`、`scripts/heart-parts.json:76,121,143,148,454,459,468,688`（產生 `heart-detail.json.gz` 與心臟 Quiz）、`app/quiz/page.tsx:242`；連帶要改 `app/mj-search.ts:8,22-23`、`app/quiz/synonyms.ts:7-13`、`scripts/test-quiz-naming.mjs:9-13`、`docs/heart-checklist.json:308-342`。
- **建議修法**：用顯示名稱對照表（零件 key 不變），主名改「Bicuspid valve」，Mitral、Left atrioventricular valve 列為同義詞；中文「二尖瓣」不變。
- **涉及解剖內容**：名稱〔需人工審核〕。

### P1-03　跑考摘要結構真正缺少〔需人工審核〕
既有 `docs/paokao-audit.md` 寫「缺少 0」，逐項人工核對後實際缺少：

| 清單 # | 結構 | 稽核誤配到 | 現況 |
| ---: | --- | --- | --- |
| 48 | Occipital artery（外頸動脈分支） | 大腦後動脈的 lateral occipital artery | 網站沒有 |
| 278 | Ligamentum arteriosum | 拼字修正 arteriosum→arteriosus，配到 Conus arteriosus | 網站沒有，搜尋 0 筆 |
| 519 | 足部 Dorsal interossei | 手部 Set of dorsal interossei | 網站沒有 |
| 254、256 | External／Internal intercostal membrane | joints.glb 節點 | 被 `joint-anatomy.ts:14 includeJoint()` 排除，沒有畫出（搜尋卻列得出） |

- **建議修法**：依圖譜補模型（需依 CLAUDE.md 立體結構規則與截圖流程）；同時修正稽核腳本（P2-37）。
- **涉及解剖內容**：新增模型〔需人工審核〕。

### P1-04　韌帶／關節、頸部血管、腦構造從搜尋選取後 3D 無反應
- **重現**：主圖譜搜尋 `glenoid labrum` 或 `tibiofibular ligament` → 點結果 → 資訊卡打開，但相機不動、沒有高亮，之後約 30 秒持續重繪；按 Focus 或 Isolate → 畫面全空；按 Hide 沒作用。
- **原因**：`app/page.tsx:208-212` `chooseExtra` 把所有 extras 當神經處理（`externalNerve`／`cameraFocusNerve`）；`app/scene.tsx:1124` 只在神經 mesh 找名稱，找不到時 `nerveFocusWait++<1800` 每格重繪；`app/biomechanics-v2/joint-anatomy.ts:94-101`、`neck-vessels.ts:27` 沒有選取狀態，Isolate 時被隱藏；`page.tsx:437` Focus 與 Isolate 都設 `isolate:true`。
- **建議修法**：依 `x.k` 分流（joint→`supplementaryJoints.rows`；vessel→頸部血管 parent id；brain→`mjAtlasId`）；Isolate 保留被選的外部網格；對焦等待只在資料包仍載入時進行。
- **涉及解剖內容**：否，可自動 merge。

### P1-05　從主搜尋選腦構造，整個圖譜重新載入
- **重現**：主圖譜搜尋 `thalamus` → 點選 → `AnatomyScene` 卸載，`MicroAtlasScene` 出現後又被改回，所有資料包重新解碼、相機回到預設。
- **原因**：`page.tsx:210` 呼叫 `setMicroAtlas('brain')`，但 `page.tsx:146` `MICRO_ATLAS_ENTRY=false`，effect 立刻改回 null；`page.tsx:350` 依 `microAtlas` 切換兩個 scene。
- **建議修法**：入口關閉時不要呼叫 `setMicroAtlas`；腦構造在主圖譜中選取（併入 P1-04），或導向 `#/organ/brain` 並選中該構造。
- **涉及解剖內容**：否，可自動 merge。

### P1-06　15 項跑考韌帶只在 joints.glb：點不到、不高亮
- **項目**：#54–58 前／後縱韌帶、項韌帶、棘上／棘間韌帶；#378、380 薦結節／薦棘韌帶；#454、462 外側半月板；#455 膝橫韌帶；#457、458 前／後十字韌帶；#459、460 腓側／脛側副韌帶。
- **原因**：`scene.tsx:860-889` 點選只對 atlas 部件、神經、腦做 raycast；搜尋選取同 P1-04。
- **建議修法**：把 joints 網格加入點選與高亮；搜尋選取時對焦並高亮。依程式碼判讀，**未在 3D 畫面確認**。
- **涉及解剖內容**：否（不改模型），可自動 merge。

### P1-07　跑考摘要中文用詞未採用，搜尋 0 筆〔需人工審核〕

| 英文 | 摘要用詞 | 網站顯示 |
| --- | --- | --- |
| internal pudendal a. | 內陰動脈 | 陰部內動脈 |
| superficial／deep external pudendal a. | 淺／深外陰動脈 | 陰部外淺／深動脈 |
| superficial circumflex iliac a. | 淺旋髂動脈 | 旋髂淺動脈 |
| medial circumflex femoral a. | 內旋股動脈 | 旋股內側動脈（lateral 卻是「外旋股動脈」） |
| circumflex fibular a. | 旋腓動脈 | 腓旋動脈 |
| lateral sural cutaneous n. | 外側腓腸皮神經 | 腓腸外側皮神經 |
| lateral dorsal cutaneous n. | 外側足背皮神經 | 足背外側皮神經 |
| superior lateral／medial genicular a. | 外上膝／內上膝動脈 | 膝上外側／內側動脈 |

- **原因**：多數是示意模型（`app/mj-paokao.json`）自帶中文，沒有經過 `prepare-naming.mjs` 的命名優先序。
- **建議修法**：示意模型中文也走同一套命名；至少把摘要用詞加入搜尋別名。
- **涉及解剖內容**：名稱〔需人工審核〕。

### P1-08　腋窩特殊區域面板仍顯示「背闊肌」〔需人工審核〕
- **重現**：搜尋 `axilla` → 選腋窩 → 右側邊界清單出現「背闊肌」（全站其他地方已改「闊背肌」）。
- **位置**：`app/mj-spaces.ts:54`、`app/mj-space-shapes.ts:45`。這個面板不經 `applyZhFixes`，`check-zh.mjs` 也抓不到。
- **建議修法**：改「闊背肌」；檢查腳本對所有顯示字串套用 `ZH_FIXES`。
- **涉及解剖內容**：名稱〔需人工審核〕。

### P1-09　Quiz 第二級拒收主網站名稱與跑考摘要寫法〔需人工審核〕
- **重現（實際呼叫 `judgeName()`）**：
  - 開「需要答出左右」：題目「Acromial part of left deltoid」輸入主網站卡片寫法 `Left acromial part of deltoid` → wrong；「Long head of left biceps brachii」輸入 `Left long head of biceps brachii` → wrong。
  - 摘要寫法被判錯：quadratus plantae（題目是 flexor accessorius）、profunda brachii（deep brachial artery）、superior／inferior gemellus、aortic arch、transverse thoracic muscle、lateral cutaneous nerve of forearm、anterior／posterior interosseous nerve（題目多了 of forearm）、posterior intercostal artery（單複數）、circumflex branch of left coronary artery、superficial palmar arch、deep plantar arch 等。
- **原因**：Quiz 名稱用 BodyParts3D 原名、不經 Netter 改名（836 個中 347 個與主網站不同）；`app/quiz/naming.ts:21 acceptedNames()` 沒有用 `docs/paokao-aliases.json`；`synonyms.ts` 只查正向 key；`normalize` 保留左右字位置。
- **建議修法**：左右另外比對，其餘去掉左右後比；可接受答案加入主網站名稱與摘要別名（雙向）。
- **涉及解剖內容**：Quiz 資料〔需人工審核〕。

### P1-10　「只練錯題」時另一側的題目不會載入
- **重現**：Quiz 上肢 → 以左側或雙側答錯幾題 → 回到設定（預設右側）→ 按「只練錯題」→ 左側題目的 mesh 不載入，第一級無法點選，第二級沒有黃色目標。
- **原因**：`app/quiz/catalogue.ts:359-362` `sceneStructures` 的左右條件以 AND 排在 `s.id===target.id` 之前；`app/quiz/page.tsx:163` 的 `savedHere` 沒有依側別過濾。
- **建議修法**：永遠保留 target，取景以 target 的 bounds 為準。
- **涉及解剖內容**：否（Quiz 流程程式，不改題庫），可自動 merge。

### P1-11　網路路徑與公開檔案出現「paokao」與「course summary」（保密，輕度）
- **現況**：瀏覽器實際請求 `models/paokao/paokao-stream.json.gz`、`models/stream/paokao-*.bin.gz`（「paokao」＝跑考拼音，可在開發者工具與 `model_sources.json` 看到）；`dist/ATTRIBUTION.md:57` 標題「Course-summary structures (paokao)」、`:59`「structures named in the course summary」；`dist/model_sources.json:233`「Course-summary vessels…（docs/paokao-audit.md）」；paokao stream 的 `attribution`「Schematic structures for the course-summary checklist」；示意結構 id 為 `PK-xxx`。中文禁用字掃描（共筆、筆記、講義、學長姐、考古、跑考、課堂、頁碼、出處、p.＋數字、日期出處、筆記檔名）在 `dist/`（含解壓後所有 .gz）結果為 0。
- **判斷**：沒有筆記內容外洩，但檔名與英文說明透露「課程摘要」的存在。ATTRIBUTION 屬 Source & credits，依 CLAUDE.md 是唯一可放來源說明的地方，是否保留「course summary」字樣請使用者決定。
- **建議修法**：資料夾與檔名改中性名稱（如 `schematic/schematic-stream.json.gz`、`stream/schematic-*.bin`）；ATTRIBUTION／model_sources 改寫為「Schematic structures built from textbook courses」；`check-no-notes.mjs` 增加英文詞（course summary、lecture、paokao）與檔名檢查。
- **涉及解剖內容**：否。改名屬建置腳本，可自動 merge；ATTRIBUTION 措辭待使用者確認。

### P1-12　遠端分支名稱含課程／筆記字樣（保密，repo 層級）
- **現況**（`git ls-remote`）：`data/cmu-course-notes-full-descriptions-20260924`、`data/cmu-drive-course-sources-20260923`、`fix/cmu-notes-v4-ui-20260924`、`refine/course-notes-description-ui-20260924`、`mj-notes`、`mj-no-notes`。CLAUDE.md 規定分支名稱不可出現課程或筆記名稱；若 repo 公開，任何人都能看到分支名與其中內容。另有 129 條遠端分支，多數已過時。
- **建議修法**：由使用者決定是否刪除這些分支（刪除遠端分支不可復原，本次沒有動）。
- **涉及解剖內容**：否；需使用者決定。

---

## P2：體驗差

### P2-01　首次載入量大，主圖譜沒有網格壓縮
- **實測**（桌機、首次載入、無快取）：45 秒內 262 個請求，content-length 合計約 79 MB；沒有 HTTP ≥ 400、沒有 request failed。
- **各資料包**（gzip 下載／解壓後）：atlas-stream 98 包 39.6／69.6 MB；facial 9.3／16.4 MB；nerve-stream 9.3／23.7 MB；supplement 6.1、female 2.0、serous 1.6、vessel-ends 4.8、paokao 3.7 MB；articular-surfaces 0.70 MB；neck-vessels 0.16 MB；brain.glb 4.65 MB（Draco）；joints.glb 0.92 MB（Draco）。
- **沒有 Draco／meshopt 的模型**：atlas-stream、facial、supplement、female、serous、vessel-ends、paokao（自訂 bin：Float32 位置、Int16 法線、Uint32 索引，只有 gzip）；nerve-stream（Float32＋Uint32）；articular-surfaces、neck-vessels（JSON 幾何）。
- **其他**：所有資料包一開始就排入載入（含預設隱藏的女性器官，`app/mj-facial-atlas.ts:44`）；CPU 端幾何指向原始資料包、合併時再複製一份、淡化 twin 又配一份完整 Uint32 索引（`scene.tsx:536-538,599`），記憶體約原始資料 2 倍以上；`nervous.glb`（6.98 MB）與 `body-0..14.bin`（約 89 MB，只供備援）仍部署。
- **建議修法**：位置量化＋小部件 Uint16 索引，或用 meshopt（`meshoptimizer` 已在 devDependencies）；女性、臉部、vessel-ends 延後到需要時載入；合併後釋放原始資料包；不再部署沒用到的檔案。可自動 merge。

### P2-02　部署後的舊快取
- 目錄檔用固定檔名、沒有版本參數：`atlas-stream.json.gz`、`nerve-stream.json`、6 個 `*-stream.json.gz`、`skin-weights.json.gz`、`articular-surfaces.json.gz`、`neck-vessels.json.gz`、`joints.glb`、`brain.glb`、`search-extras.json.gz`、`heart-detail.json.gz`。GitHub Pages 回應 `max-age=600`，部署後 10 分鐘內可能拿到舊目錄，而它指向的雜湊 chunk 已刪除 → 404、結構缺漏。
- `web/main.tsx:5-10` 的 lazy 路由沒有 ErrorBoundary、沒處理 `vite:preloadError`：部署前就開著的分頁，切到 Quiz／心／腦時 chunk 已不存在，整頁白畫面。
- 已確認沒問題：所有 fetch 都經 `import.meta.env.BASE_URL`，在 `/MJ_anatomy/` 子路徑下實測 0 個 404；JS 檔名有雜湊；沒有 service worker。
- **建議修法**：目錄檔名加內容雜湊或 `?v=<build id>`；加 ErrorBoundary，`vite:preloadError` 時提示重新整理。可自動 merge。

### P2-03　沒有 DecompressionStream 的瀏覽器整個圖譜載入失敗（待確認，需真機）
- `app/model-download.ts:16` 遇到 gzip 直接 `new DecompressionStream`，沒有檢查是否存在；`mj-facial-atlas.ts` 6 個 stream 只有 .gz 版本且放在 `Promise.all`，退回 `atlas.json` 後仍失敗。影響 iOS／Safari 16.3 以下、Firefox 112 以下。前提是 Pages 不對 `.gz` 加 `Content-Encoding`（本機 preview 不加）。
- 另：`globals.css` 用了 23 處 `:has()`（Firefox ESR 115 不支援）；`.studio{height:100dvh}` 沒有 `100vh` 備援。
- **建議修法**：沒有 DecompressionStream 時改用 fflate；或建置時輸出未壓縮版本；改 `Promise.allSettled`。可自動 merge。

### P2-04　大量只有英文的介面文字
- **重現**：主畫面左欄系統清單只有英文（Skeleton、Muscles、Arteries…Sensory organs），沒有中文；右上「Find a structure」；搜尋結果種類直接顯示 `nerve`／`brain`／`joint`；無結果時「No structures match your search.」；面板底部「pieces visible」「Hide all」「Reset」「Source & credits」；分層面板「Peel anatomy layer by layer」「Both」「Left focus」；資訊卡「Selected pieces」「Focus」「Isolate」「Hide」「Clear」；腦部頁「Layer back」「Peel deeper」；錯誤訊息（`model-download.ts:5,18`、`scene.tsx:60,1153`、「Reload viewer」）；aria-label（Search anatomy、Drag to orbit…）。同一意思有「雙側」「Both｜雙側」「Both」三種寫法。
- **截圖**：![主畫面](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/b5cace644289ab5bd2878bfc07f0d61236555d82/audit-2026-10-30/load-2s.png)
- **建議修法**：統一用現有雙語元件（英文在上、中文在下）；錯誤訊息與 aria-label 用中文書面語。`check-zh` 目前只查粵語用詞，可加「UI 字串必須含中文」檢查。可自動 merge。

### P2-05　已淡化或半透明的結構仍攔截點選
- `scene.tsx:860-866` `pickPartAt` 只檢查可見旗標，沒有排除淡化旗標與半透明外殼。點深層肌肉後被 autoFade 的遮擋物、開啟胸膜（肺第 2 層）或腹膜後的外殼、選取 axillary sheath 後的鞘，都會擋住後方真正要點的結構。
- **建議修法**：比照 `app/organ/heart-viewer.ts:276-285`，外殼與淡化部件只在射線上沒有其他實心結構時才算命中。可自動 merge。

### P2-06　細小結構沒有點選容許範圍
- `scene.tsx:860-874` 只做精確射線交點；以螢幕距離找目標的 `findTarget`（`scene.tsx:954`）只在 `amount>.45`（爆炸圖）時使用，但 `page.tsx` 16 處都是 `explode:0`，所以從不執行。全身預設距離下 2 mm 的神經不到 1 px，手機幾乎點不到。
- **建議修法**：沒命中時在點擊點 8–12 px（觸控 16–24 px）內多打射線或用 GPU ID buffer，優先神經與細血管。可自動 merge。

### P2-07　觸控沒有平移手勢
- `scene.tsx:328` 單指 PAN、雙指 DOLLY_ROTATE；`:920` 手指按在結構上時單指改 ROTATE；`:1147` 每格重設雙指為 DOLLY_ROTATE。放大到結構佔滿畫面後沒有任何手勢可平移；canvas 的 aria-label「Drag to orbit」與實際不符。
- **建議修法**：雙指改 `TOUCH.DOLLY_PAN`；加操作提示。可自動 merge。

### P2-08　對焦動畫中按 Reset／視角按鈕會被舊動畫拉回
- `scene.tsx:972` 對焦動畫每格 lerp；`:1109` Reset 或換視角只呼叫 `fit()`，沒清 `focusTarget`／`focusPosition`。點結構後約 1 秒內按 Reset 或「正面」，相機先跳回預設，下一格又滑回剛才的結構。
- **建議修法**：`fit()` 與 isolate 取景前清除對焦目標。可自動 merge。

### P2-09　Reset 沒有清乾淨
- `page.tsx:223` `reset()` 沒清 `spaceId`、`spaceItem`、`layerPicked`、`error`、`motionBlock`、`fadeOther`。在全身視圖搜尋 `quadrangular space` 選取後按 Reset，3D 仍只顯示該區域、其他淡化、標籤還在；之後點同一個分層按鈕要點兩次。
- **建議修法**：`reset()` 一併清除上述狀態。可自動 merge。

### P2-10　縮放視窗或旋轉裝置後相機被重設
- `scene.tsx:792` resize 呼叫 `fit()` 並重新對焦舊的 `cameraFocusParts`；`heart-viewer.ts:296-301`、`brain-viewer.ts:304-309` 每次 resize 都 `frameModel('fit')`。旋轉 iPad、開 DevTools，使用者調好的視角全部消失。
- **建議修法**：resize 只更新 aspect、renderer 尺寸與 view offset。可自動 merge。

### P2-11　手機上資訊卡蓋住剛選的結構（待確認，需真機）
- `scene.tsx:1127-1133` 對焦取景沒扣除 `.detail-sheet`；手機版卡片 `top:132px`＋`max-height:58dvh`（`workspace-layout.css:447`）。390×844 上結構被放在 y≈460 px，卡片約佔 132–621 px。
- **實測（390×844 觸控）**：點身體中央後資訊卡位於 y=132、高 490 px（佔 132–622 px，畫面中段）。轉成橫向 844×390 後，資訊卡幾乎蓋滿整個畫面高度。橫向截圖出現整頁水平重複的畫面，這可能是 headless 手機模擬改變視窗大小造成的假象（`scrollWidth`＝844，沒有水平捲動），需真機確認。
- **截圖**：![手機橫向](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/0f24b701aab6353c2f15307d0dfb4523d07ba1b0/audit-2026-10-30/m-landscape.png)
- **建議修法**：取景時扣除卡片範圍，或手機版改底部抽屜、預設只露標題列。可自動 merge。

### P2-12　「頭部」分頁搜尋頸部以下結構會被切掉
- 切到「頭部」→ 搜尋 `femur` 點選 → 相機飛到股骨位置但畫面空白（`scene.tsx:978` 全域 clipping；`page.tsx:190,193` 選取時不切分頁）。
- **建議修法**：選到切面以外的結構時自動切回「全身」，或讓選取部件不受切面影響。可自動 merge。

### P2-13　手機上從搜尋選特殊區域，看不到邊界與內容物面板（待確認，需真機）
- `page.tsx:193` 打開分層解剖面板，但手機版 `globals.css:564` 把 `.right-workspace` 設 `display:none`，只有打開「動作」才顯示（而且按鈕名稱「動作」與內容「體位／分層解剖／組織深度」不符）。
- **建議修法**：從搜尋選特殊區域時一併打開該面板，或改用獨立抽屜。可自動 merge。

### P2-14　Cache Storage 只增不減
- `model-download.ts:27-38` 存解壓後的資料，舊雜湊條目從不刪；每次重新產生資料包多存約 140 MB，配額滿後寫入靜默失敗。
- **建議修法**：存 gzip 原檔；載入目錄後刪除不在目錄中的條目；快取名稱帶 build 版本。可自動 merge。

### P2-15　內容頁顯示模型來源
- 頁首「3,571 structures · BodyParts3D · Human Atlas adapted」（`page.tsx:352`）；性別按鈕 title「（BodyParts3D）」「（Human Reference Atlas）」（`page.tsx:377`）；Quiz 頁「圖譜來源與使用範圍」連結；心臟頁「模型範圍」段落寫「…取自 BodyParts3D 4.0」與「此構造在目前使用的開源模型（Z-Anatomy…）」（`app/organ/heart.tsx:176,215`）；腦部頁「來源：Brain Project（Z-Anatomy / BodyParts3D），CC BY-SA 4.0」（`app/organ/brain.tsx:275`）。CLAUDE.md 規定來源說明集中在 Source & credits。另外頁首在載入前寫死 2,234、About 寫死 2,234／3,432（`page.tsx:352,438`），與實際 3,571 不一致。
- **截圖**：![心臟頁模型範圍](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/b5cace644289ab5bd2878bfc07f0d61236555d82/audit-2026-10-30/pg-heart.png)
- **建議修法**：頁首只留結構數（由資料計算），來源移到 Source & credits；器官頁只保留「示意模型」標示。可自動 merge。

### P2-16　載入失敗時沒有說明
- P1-01 發生時，畫面只有一條沒有文字的琥珀色細線（`page.tsx:88-93`，`<button role="progressbar">`），console 沒有錯誤（錯誤只寫進 `failedChunks`）；使用者不知道缺了哪些結構，也不知道細線可以按。
- **建議修法**：失敗時顯示「部分結構未載入（N 組）· 重試」文字並 `console.error` 原因；按鈕與進度條分開。可自動 merge。

### P2-17　同一 mesh 多種中文〔需人工審核〕
- 腦部詳細模式：64 張單一 mesh 卡片與模型清單中文不同，例如中央前迴／中央前回、緣上迴／上緣迴、前大腦動脈／大腦前動脈、丘腦底核／視丘下核、皮質腦幹徑／皮質延髓徑、蜘蛛網膜下腔／蛛網膜下腔、側孔／外側孔、大腦導水管（CSF 頁）／中腦導水管、小腦天幕／小腦幕。模型清單多用「回」，台灣醫學用語通常用「迴」。
- 特殊區域面板 vs 檢視器：拇長展肌／外展拇長肌、屈拇長肌（跗管 FHL，手部名）／屈拇趾長肌、腓總神經／總腓神經、肘正中靜脈／正中肘靜脈、旋肱後動脈／後旋肱動脈、臂神經叢後側束／後束、大多角骨／大菱形骨。
- 心臟：主圖譜瓣葉「前葉／隔葉／後葉」vs 心臟頁與 Quiz「前瓣／中隔瓣／後瓣」（用心臟頁寫法在主搜尋 0 筆）；隔側乳突肌／中隔乳突肌；邊緣支／緣支；前降支斜支／對角支；英文 Inferior papillary muscle 配中文「後乳突肌」；三尖瓣後瓣英文三種寫法。
- **建議修法**：建立單一名稱對照表（以跑考摘要用詞為準），模型清單、資訊卡、CSF 頁、特殊區域面板、心臟頁、搜尋都從它取；`check:zh` 加「同一 mesh 中文須一致」。

### P2-18　同族結構寫法不一；部分命名覆寫失效〔需人工審核〕
- 總腓／深腓／淺腓神經 vs 分支「腓總…」「腓深…」「腓淺…」；外旋股動脈 vs「旋股外側動脈降支／升支／橫支」；後旋肱動脈 vs 旋肱前動脈、旋肱後靜脈；降膝動脈 vs「膝降動脈關節支／隱支」；內蹠／外蹠神經 vs 足底內／外側動靜脈；足內側背側皮神經、足中間背側皮神經、足背外側皮神經三種詞序；臂／上臂混用（內側上臂皮神經 vs 內側臂皮神經）；「肩胛下神經（上）」vs `exactZh`「上肩胛下神經」。
- 膝上動脈：glossary key「superior lateral genicular artery」、模型名「lateral superior genicular artery」，`prepare-naming.mjs` 只做完全相等比對，superior 兩條沒被覆寫。
- **建議修法**：比對前方位詞排序或補別名；同族統一詞序。

### P2-19　搜尋清單重複、列出沒畫的結構、容錯不足
- 依顯示英文分組有 138 組重複（其中 12 組中文也不同）：P0-03 造成的同名分支；滑車神經 3 筆、視神經 3 筆；Transversus thoracis（atlas＋示意 PK-224/227）；Superior intercostal artery（atlas）與 Supreme intercostal artery（PK-120/123）都叫「最上肋間動脈」〔需人工審核〕；Ligamentum flavum（PK-222）與 Ligamenta flava（joints）；Celiac trunk 兩個 concept；腦部 extras 與 atlas 重複 63 組。
- `prepare-search-index.mjs:17` 把 64 個被 `includeJoint()` 排除的 joints 節點也收進搜尋：搜 `intervertebral disc` 有 23 筆、`external intercostal membrane` 2 筆，選了 3D 沒有東西；atlas「disk」與 joints「disc」並存。
- 照摘要寫法搜尋不到：名稱後加「muscle」0 筆（約 130 種肌肉）；單數查不到複數（posterior intercostal artery）；middle/radial collateral artery、common/proper palmar digital nerve、anterior femoral cutaneous nerve 0 筆。
- 簡體字對照表（`mj-search.ts:7`）缺 帶、結、葉、輸、額、鎖、門 等字：「韧带」「结肠」「肺叶」「锁骨」「门静脉」搜不到。（實測「锁骨」「韧带」0 筆）
- **無結果沒有提示**（實測）：輸入 `zzzzqq`，結果清單空白，面板只顯示「Showing up to 50 matches. Refine your search to find smaller structures.」，沒有出現程式中的「No structures match your search.」（`search-panel.tsx` 的 `ComboboxEmpty` 沒有顯示），也沒有建議。
- **建議修法**：搜尋 extras 套用 `includeJoint()`；去除 muscle／單複數後再比；補簡體字表；重複的 concept 合併（模型相關者〔需人工審核〕）。

### P2-20　20 項心臟結構只在心臟頁，主搜尋 0 筆
- crista terminalis、pectinate muscles、fossa ovalis、心房／心室中隔、moderator band、supraventricular crest、兩個心包竇、SA nodal artery、LV 乳突肌、diagonal、circumflex 等。
- **建議修法**：主搜尋加入心臟頁結構，點選後導向 `#/organ/heart` 並選中。可自動 merge。

### P2-21　CSF 外側孔畫成並寫成流入小腦延髓池〔需人工審核〕
- **重現**：腦部詳細模式 → CSF 流向 → 步驟 6。`app/organ/csf-scene.ts:16` 步驟名、`csf-notes.ts:66` 說明、`csf-scene.ts:157` `lateralApStep` 粒子終點都是小腦延髓池。
- **教科書**：外側孔（Luschka）開口在橋小腦角，通往橋池／橋小腦角池；正中孔（Magendie）才通小腦延髓池。同模式資訊卡 0052 寫的是對的，前後矛盾。
- 其餘：8 個步驟順序、動畫追蹤路徑順序、各步驟高亮都正確。
- **建議修法**：文字與粒子路徑改為外側孔 → 橋小腦角池。**未在 3D 畫面確認**。

### P2-22　椎動脈被整條排除〔需人工審核〕
- `app/organ/brain-catalogue.ts:28` `NOT_BRAIN` 含 `^vertebral artery`，把模型中的 Vertebral artery.l/.r 整條拿掉；但基底動脈說明（`brain-facts-vessels.ts:91`）寫由兩側椎動脈會合、PICA（`:111`）是椎動脈分支，畫面上起點懸空（待確認）；資訊卡 0267「椎動脈」顯示「模型未有」，其實模型有。
- **建議修法**：保留顱內段（V4）；0267 卡 mesh 指到 Vertebral artery。

### P2-23　右心房清單出現左心耳〔需人工審核〕
- 心臟詳細模式 → 選「Right atrium 右心房」→ 腔內構造清單有左心耳。`app/organ/heart-chambers.ts:34`（`RA_ITEMS`）、`:47`。左心耳已在左心房（`:67`）列出。
- **建議修法**：從右心房移除。

### P2-24　基底核直接／間接路徑沒有完整呈現〔需人工審核〕
- 各卡（0088、0245、0246、0062、0087）方向與正負號大致正確，但沒有任何地方呈現整條路徑，也沒有 D1／D2 與超直接路徑；`app/organ/brain-facts-deep.ts:164` 寫 GPe「helping to suppress unwanted movement」方向誤導（GPe 抑制 STN，淨效果促進運動；抑制運動的是「紋狀體抑制 GPe」這一步）。
- **教科書路徑**：皮質 →（＋）紋狀體；直接：紋狀體（D1）→（－）GPi/SNr；間接：紋狀體（D2）→（－）GPe →（－）STN →（＋）GPi/SNr；GPi/SNr →（－）VA/VL →（＋）皮質；SNc 多巴胺興奮 D1、抑制 D2，淨效果促進運動；超直接：皮質 →（＋）STN。
- **建議修法**：用自己的話寫一張完整路徑卡，改正 GPe 那句。

### P2-25　Brodmann 分區〔需人工審核〕
- 已確認正確：38（顳極）、44、45、47、4、3-1-2、39、40、22、37、20、21、17-19、24／32、23／31、29／30、8。
- 問題：全站沒有 BA 43（味覺，中央下迴；腦島 mesh 含中央下迴）；腦島英文（`brain-facts-cortex1.ts:213`）寫 13、14，資訊卡 0047 寫 13–16（13–16 是猴腦分區，人腦圖譜通常不標，待確認）；直回標 BA 11、25（`:71`，25 一般不算直回，待確認）；中央旁小葉只標 4、6（`:59`），後半部 3、1、2 未寫；初級聽覺皮質英文 41、資訊卡 0239 寫 41、42；海馬旁迴英文沒有 27、資訊卡 0413 有。
- 網站沒有獨立的分區高亮，BA 是點腦迴後顯示在資訊上。

### P2-26　腦部資訊卡錯誤〔需人工審核〕
- 0087 中文名「視丘迴路」被截斷（Cortico-basal-thalamic loop 應為「皮質—基底核—視丘迴路」）。
- 0281「外骨膜」寫成包覆顱骨內面，與名稱矛盾（pericranium 在顱骨外面），且與 0311 重複。
- 0472「主動脈弓」內容其實是壓力感受器；0028「前庭區」缺菱形窩前庭區；「Fourth ventricle」Function 欄寫的是構造。

### P2-27　保密檢查腳本涵蓋不足
- `scripts/test-neuro-notes.mjs` 只檢查 `docs/neuro-card-text`，沒檢查 `csf-notes.ts`、`csf-scene.ts`、`brain-facts-*`、`heart-chambers.ts`、`scripts/heart-parts.json`、`app/quiz/card-data.ts`、`aka`、卡片名稱；視窗每次跳 4 字，要連續 19 字才保證抓到；`tidy` 不去掉「→／」；失敗訊息會印出 16 字筆記片段（CLAUDE.md 規定只輸出通過／失敗與數量）。
- `scripts/check-no-notes.mjs` 禁用字沒有「下圖、上圖、圖中、老師、勘誤」與英文 course summary、lecture、paokao；沒檢查檔名。
- 逐字滑動比對網站所有中文字串：達到 16 字門檻的只有 `csf-scene.ts:18` 步驟 8 名稱串（去標點後）；13–15 字接近片段：card-text 0128、0129、0277、0357 與 aka 0134。`CSF_STEPS[].note`（`csf-scene.ts:11-18`）畫面不顯示，措辭與筆記接近，建議刪除。
- **建議修法**：逐字滑動、去除所有標點與箭頭、納入上列所有來源、加 `aka` 格式檢查、補禁用字、失敗只印卡片 id 與數量。腳本修改可自動 merge；`csf-scene.ts:18` 文字改寫〔需人工審核〕。

### P2-28　喉內肌資料已寫好卻從不顯示
- `app/mj-muscle-facts-head-neck.ts:45,46,50` 的 key `'posterior crico-arytenoid'`、`'lateral crico-arytenoid'`、`'thyro-arytenoid'` 含連字號，`muscleFactsFor`（`:33`）比對的名稱已把連字號換成空白，永遠對不上。6 個 mesh 受影響。
- **建議修法**：比對前兩邊都正規化連字號。修好後卡片內容會出現〔需人工審核〕。

### P2-29　資訊卡空欄位與資料稀少
- 19 張示意卡有空白「Attachments／附著」列（肩胛上橫韌帶、腋鞘、股鞘、各支持帶、胸腰筋膜、足底腱膜）：`origin` 是 `["",""]`，渲染函式（`mj-structure-info.ts:414` `L()`）沒檢查空字串。→ 程式修正可自動 merge。
- 2,234 個 atlas mesh 中 1,711 張卡只有「區域／構造類型」兩列（骨骼 272、動脈 528、靜脈 384、神經 139、肌肉 34）；沒有資料的肌肉：足蚓狀肌、足底骨間肌、闊筋膜張肌、肋提肌、橫突間肌、棘間肌、喉內肌；多裂肌主網站沒有、Quiz 有。→ 補內容〔需人工審核〕。
- `mj-structure-info.ts` 的 `detailed` 肌肉條目全被 `MUSCLE_FACTS` 蓋過、從不顯示，且有矛盾（旋後肌 C7–C8 vs C6–C7），建議刪除死資料。

### P2-30　示意標示與模型說明〔需人工審核〕
- 15 個接合段（deep brachial、vertebral、femoral、lateral circumflex femoral 等的 PKC 段）`prepare-paokao.mjs:86` 設 `schematic:false`，卡片沒有「示意模型」標示。
- vessel-ends 示意段顯示「示意模型：由相鄰構造的表面生成」（那是胸膜、心包薄殼的說明）。手機實測點到示意的「Left Dorsal Artery Of Penis」，卡片同樣顯示這句說明，而且還出現「FMA ID FMA20819 · BodyParts3D database」連結（見 P2-11 橫向截圖）。
- `page.tsx:228` 的 FMA 正則也比中 `FJxxxx-END` 示意段，點選時顯示 FMA ID 與「BodyParts3D database」連結；連結只是資料庫首頁。FMA 標示為「FMA ID」，沒有冒充圖譜頁碼，不算編造編號。

### P2-31　靜脈卡用詞、共用中文名、缺左右〔需人工審核〕
- 靜脈卡用「主要分支」（`mj-structure-info.ts:422,449`），例如鎖骨下靜脈「分支：腋靜脈」、腋靜脈「分支：頭靜脈、貴要靜脈」；應為「屬支」與「延續自」。
- 不同結構共用同一中文：動眼神經上、下支都叫「動眼神經」；Marginal colic artery 與 Marginal artery of colon 同名；手足「拇收肌斜頭／橫頭」（P0-06）。
- 36 組兩側都有 mesh、名稱卻沒左右（intercostal muscles、Short ciliary nerve、Lumbar artery／vein、Thoracic rotator…），清單出現同名項目；20 個 concept 同時包含左右 mesh（例：FMA3949「right internal carotid artery」含左側後交通動脈），從搜尋選擇時另一側也亮（待確認）。

### P2-32　肱深動脈卡〔需人工審核〕
- 已確認正確：來源肱動脈；分支中副動脈與橈側副動脈；橈神經卡寫「與肱深動脈沿橈神經溝走行」；三頭肌間隙（PK-199）、橈神經溝（PK-134）卡正確。
- 問題：肱深動脈本身的卡片沒有「走向」（伴橈神經經橈神經溝、在三頭肌間隙）；標題用 profunda brachii、分支列表寫 deep brachial；上／下尺側副動脈區域標成「前臂」（應為上臂）；後旋肱動脈本體「肩帶」、`-END` 段「上臂」。
- 另：肩胛背動脈來源寫「頸橫動脈深支（常見）」（`app/quiz/card-data.ts`）；依 Moore 直接起自鎖骨下動脈較常見（待確認）。

### P2-33　Quiz 答案卡欄位對不上，大量空白〔需人工審核〕
- `app/quiz/card.ts:28` `FROM_PROFILE.nervous` 找「神經根／來源」「走行／關係」「主要功能」，但 `nerve()` 產生的是「神經根」「走向」「支配範圍」，永遠對不上；動、靜脈的 `FROM_PROFILE` 是空的。
- 完全空白卡片數：下肢 動脈 62/62、靜脈 50/50、骨骼 64/64、神經 32/32；上肢 動脈 84/86、靜脈 42/42、神經 84/88。第二級題庫因此偏小（下肢 104/328、上肢 122/402、胸腔 30/124）。
- **建議修法**：欄位標籤對齊；動靜脈接上分支資料。欄位對齊屬程式，但會改變 Quiz 卡片內容與題庫〔需人工審核〕。

### P2-34　第二級不接受縮寫、簡體字、「左側」〔需人工審核〕
- `radial n.`、`brachial a.`、`cephalic v.` → wrong；`桡神经`、`橈神经`、`肱二头肌长头` → wrong（`app/quiz/naming.ts:37` 只處理「臺→台」）；`左側肱骨` → wrong、`左側三角肌肩峰部` → close。
- 網站自己混用兩種中文：整條肌肉「屈拇短肌」、淺頭卻「拇短屈肌淺頭」；「橈側屈腕肌」vs「尺側腕屈肌」；`拇短屈肌`、`橈側腕屈肌`、`指伸肌`、`脛骨前肌` 都判錯。
- 已確認沒問題：大小寫、全形英數、空白、the／muscle 都能處理。

### P2-35　對立結構被判「拼字接近」〔需人工審核〕
- `rhomboid minor`／`小菱形肌`（題目大菱形肌）、`teres minor`（大圓肌）、`腓骨短肌`（腓骨長肌）、`股內側肌`（股外側肌）、`後骨間神經`（前骨間神經）都判 close，畫面還顯示「正確拼法」。`naming.ts:58` `closeLimit` 容許中文差 1 字、英文差 2 字母。
- **建議修法**：大／小、長／短、內／外、前／後、上／下、深／淺等對立詞不同時一律判錯。

### P2-36　心臟 Quiz 把右心室構造當成左心室的一部分〔需人工審核〕
- `relationOf('Anterior papillary muscle of right ventricle','Left ventricle')` 回傳 `part`；題目 LV 點右心室乳突肌判 close；題目 LCA 輸入 RCA 分支判 close。`naming.ts:18,66` `cleanKey` 對中線結構也刪左右字。

### P2-37　跑考稽核腳本配對過寬
- `scripts/audit-paokao.mjs`／`coverage-match.mjs`：left/right 當停用字（`coverage-match.mjs:26`）→「Left coronary artery」配到右冠狀動脈、左心室乳突肌配到右心室；別名含 branch 時跳過類型檢查（Left marginal branch 配到 Left marginal vein）；拼字修正把 arteriosum 改成 arteriosus；`contained` 過寬（枕動脈配大腦 lateral occipital a.、足背側骨間肌配手）；只看名稱是否存在，不看能否點選（joints 節點、心臟頁直接算有，`audit-paokao.mjs:67`）。
- **逐項人工判定（592 列）**：可點選真實模型 366、示意模型 155、只在心臟頁 20、joints.glb 不可點 15、稽核配錯但結構存在於別處 8、**缺少 5**（P1-03）、屬母結構一部分 14、略過 7。另外 P1-01 的 61 個示意結構目前實際上也不顯示。
- **建議修法**：比對保留左右；類型檢查一律套用；拼字修正只用白名單；區域詞不一致時拒絕；報告依「可點選／只在心臟頁／未繪製／示意」分欄，並加入「資料包可組裝」檢查。可自動 merge（腳本）。

### P2-38　關節動作後第一次點擊會卡頓（待確認，需真機）
- `scene.tsx:851-863` `pickTarget` 在 box 測試之前呼叫，姿勢一變，每個可見的 GPU 蒙皮部件都要在 CPU 重新蒙皮；按下與放開各觸發一次。
- **建議修法**：先用 rest pose bounds＋位移上限做粗測，射線通過的部件才更新。可自動 merge。

---

## P3：微調

| 編號 | 項目 | 重現／位置 | 建議修法 | 涉及解剖內容 |
| --- | --- | --- | --- | --- |
| P3-01 | 網頁 `lang="en"`、meta description 英文，影響漢字字形與螢幕閱讀器 | `web/index.html` | 改 `zh-Hant-TW`，description 中英並列 | 否 |
| P3-02 | 「勾選後，先可以拖動」不是書面語（應為「才可以」）；`check-zh` 沒抓到 | `app/page.tsx:419` | 改字並把「先可以」加入檢查 | 否 |
| P3-03 | `text-transform:capitalize` 造成「Left Axillary Nerve」「Branch Of Right…」錯誤大小寫（見 P0-02 截圖） | `app/globals.css:15,42` | 移除 capitalize，名稱照資料顯示 | 否 |
| P3-04 | 對焦動畫：指數 lerp 約 290 ms 到 90%，但約 1.2 s 才停；`dt` 上限 0.05，低幀率時更慢；`setViewOffset` 一開始就套用，畫面先橫移約 100 px；視角按鈕與 `fit()` 直接跳位（待確認，需真機） | `scene.tsx:972,1133` | 固定 300 ms easeOutCubic，view offset 一起補間 | 否 |
| P3-05 | 滑鼠 hover 高亮與名稱提示是死程式碼（只在 explode>0 時執行）；提示只有英文原名 | `scene.tsx:940` | 啟用 hover 高亮並顯示中英名稱 | 否 |
| P3-06 | 點空白處不會取消選取 | `scene.tsx:954` | 點空白（無拖曳）時清除選取 | 否 |
| P3-07 | 切面沒有封口：頭部切面是全域 clipping＋DoubleSide；心臟切面也沒封口，只有腦部有（待確認） | `scene.tsx:370,978`、`heart-viewer.ts:88-95` | 加 stencil cap | 否 |
| P3-08 | 鍵盤：實測 Esc 可關搜尋面板，但**資訊卡按 Esc 不會關**；只有 CSF 頁另外處理 Esc；搜尋面板關閉後焦點沒回到觸發按鈕；canvas 沒有鍵盤操作 | `app/organ/brain.tsx:58` | 全站 Esc 關閉最上層面板，關閉後焦點回原按鈕 | 否 |
| P3-09 | 搜尋：打字後 150 ms 內按 Enter 可能選到上一次結果（待確認）；`onChoose={choose}` 每次新函式，`memo` 無效，拖動作時搜尋面板每格重繪 | `search-panel.tsx`、`page.tsx:399` | Enter 前先 commit；`useCallback` | 否 |
| P3-10 | 動作警告顯示在致命錯誤框並附 Reload 按鈕，同時把載入條藏起來 | `page.tsx:242,433-434` | 警告與致命錯誤分開 | 否 |
| P3-11 | draw call 多：預設全身視圖實測每格約 995 個 draw call、約 523 萬三角形（SwiftShader，數量與 GPU 無關）；主圖譜依「資料包 × 材質」分 batch，神經各一材質、腦材質複本 437 | 實測＋`scene.tsx` | 跨資料包依材質合併；神經共用材質 | 否 |
| P3-12 | 60 秒逾時包含下載與解碼，慢速網路下 brain.glb 可能逾時 | `model-download.ts:22,33` | 改成「多久沒收到資料」才算逾時 | 否 |
| P3-13 | 心臟頁 hover 是死程式碼（`hoverId` 從未設定）；心臟／腦部頁每次狀態變更都對所有材質設 `needsUpdate=true`，拖切面可能卡頓（待確認） | `heart-viewer.ts:86,128,147`、`brain-viewer.ts:163` | 只在切面數或透明狀態改變時更新 | 否 |
| P3-14 | 中英上下次序不一：器官頁小標題、分區選單（「肩區 · Shoulder」）中文在前 | `heart.tsx:132`、`brain.tsx:255,265`、`app/mj-regions.ts` | 統一英文在上／前 | 否 |
| P3-15 | 手機版 `.detail-sheet` 有 8 組以上互相 `!important` 覆蓋的規則；`.space-label` `nowrap`＋`max-width:260px` 長標籤溢出（待確認） | `globals.css:952,1160,1225,1344`、`workspace-layout.css:447` | 合併成一組規則；允許換行 | 否 |
| P3-16 | `.github/workflows/` 只有 `deploy-preview.yml`（名稱 Deploy MJ Anatomy Preview），CLAUDE.md 寫保留 Deploy、CI、Preview Check 三個 | `.github/workflows/` | 請使用者決定改文件或補 workflow | 否 |
| P3-17 | 搜尋直接顯示腦部原始標籤：「lat Fis-ant-Vertical」「lat Fis-post」「sulcus interm prim-Jensen」；拉丁名 arteria radialis indicis、arteria princeps pollicis、Ligamenta flava、Pyramis of vermis；「直回（直回）」重複 | `prepare-search-index.mjs`、`brain-catalogue.ts` RENAME 未套用到搜尋 | 搜尋用腦部頁的 RENAME；拉丁名改英文 | 〔需人工審核〕 |
| P3-18 | 英文拼法不一：Oesophageal／Esophageal、mamillary／Mammillary、disk／disc、MCA「(M2)」「(M2-segment)」「(M3 segment)」 | 搜尋、腦部頁 | 統一美式拼法與分段寫法 | 〔需人工審核〕 |
| P3-19 | 側別與大小寫：Cochlear nerve.001、Common plantar digital branches….001 原始名沒有 `.r`，顯示時沒側別、另一側有；示意「rectus sheath」「thoracolumbar fascia」小寫開頭；Mastoid process 只有右側且名稱沒標側別；Groove for brachiocephalic vein 沒標側別 | `nerve-stream`、`mj-paokao.json` | 補側別、首字大寫 | 〔需人工審核〕 |
| P3-20 | 正中構造被標左右：Left/Right Optic chiasm、Interpeduncular fossa、Midbrain、Pons，以及只有一筆的「Left Medulla oblongata」 | 腦部詳細模式清單 | 正中構造合併、不標左右 | 〔需人工審核〕 |
| P3-21 | 腦神經中文格式不一：迷走神經沒有「（第十對腦神經）」、其他有；Quiz「副神經」vs 檢視器「副神經（第十一對腦神經）」；視神經兩種 | 名稱表 | 統一格式 | 〔需人工審核〕 |
| P3-22 | 其他腦部小事實：角迴把失讀併入 Gerstmann 症候群（`brain-facts-cortex1.ts:154`）；PCA thalamogeniculate 分支寫供應視丘內側（應外側與後部，`brain-facts-vessels.ts:89`）；PCom 供應海馬、尾狀核體部由前脈絡動脈供應、頂上小葉病變造成忽略（待確認）；0277 SCA 的 Horner 沒寫同側；0293 把椎動脈 V1 稱「頸段」（TA：prevertebral part，V2 才是頸段） | 腦部資訊卡 | 依教科書改寫 | 〔需人工審核〕 |
| P3-23 | CSF 頁說法不精確：「第四腦室脈絡叢最少」（待確認）；「側腦室位在視丘外側」（體部在視丘上方）；沒提室管膜與腦實質也產生部分 CSF | `csf-notes.ts:16,20,26,29` | 依教科書改寫 | 〔需人工審核〕 |
| P3-24 | CSF 粒子路徑用寫死座標，正中孔／外側孔管子用模型算出的 `apertures`，兩者可能不重合；`csf-scene.ts:217` 註解寫 right 實為身體左側（待確認，未在 3D 畫面確認） | `csf-scene.ts:146-162,217`、`brain-reshape.ts:69` | 路徑端點改用 apertures | 〔需人工審核〕（示意） |
| P3-25 | 近似高亮範圍偏窄：視覺皮質只高亮距狀溝；運動前區、輔助運動區沒有近似 mesh；0575 聽覺聯絡皮質只到顳平面 | 腦部資訊卡 | 擴大近似範圍 | 〔需人工審核〕 |
| P3-26 | 示意卡內容細節：陰部內動脈英文「re-enters the pelvis」、中文「會陰」不一致；股四頭肌腱中英內容不同；髕內側支持帶卡寫的是外側鬆解；乳腺「upper two thirds」；C1 脊神經通用走向與 PK-259 矛盾；神經根節段不一致（拇短屈肌內側頭 S1–S2 vs 整肌 S2–S3、股二頭肌長頭 S1–S3 vs L5–S2、閉孔內肌神經 L5–S1 vs L5–S2） | `app/mj-paokao.json`、`mj-muscle-facts-*.ts` | 依教科書統一 | 〔需人工審核〕 |
| P3-27 | Quiz 同義詞品質：`nerve to supraspinatus`（也支配棘下肌）、`calf muscle`、`ima` 有疑問 | `app/quiz/synonyms.ts` | 人工檢查 | 〔需人工審核〕 |
| P3-28 | `naming.ts:30` `sided()` 對 /g 正則呼叫 `.test()`，`lastIndex` 殘留（目前未觸發） | `app/quiz/naming.ts:30` | 去掉 g 旗標 | 否 |
| P3-29 | 胸腔 Quiz 選「右側」時，右迷走神經延伸到腹部左側的部分被裁掉（解剖正確，不是左右錯） | 胸腔 Quiz | 裁切以結構 bounds 為準 | 否 |
| P3-30 | 「屬於母結構一部分」的 14 項中，肌腱 5 條、冠狀竇開口、奇靜脈弓無法單獨選取 | `docs/paokao-audit.md` | 視需要做表面標示 | 〔需人工審核〕 |
| P3-31 | `docs/glossary.json` 跑考摘要條目至少 22 條中英錯配或中文是說明句（anterior medial malleolar→前外踝動脈、Suprascapular n→臂神經叢其他分支、Lower subscapular n→闊背肌、obturator n→分隔、Biceps brachii→橈骨粗隆、Axillary n→終末支…）；內部檔案，不影響網站，但命名腳本會讀 | `docs/glossary.json` | 標 `needs_review` | 〔需人工審核〕 |
| P3-32 | 待使用者決定的用詞：glossary 把足部肌寫成手部用詞（伸指長肌、屈指長肌…），網站用「趾」字版本（解剖上正確）；deep plantar a.「深趾動脈」vs「深蹠動脈」；trapezium「大菱形骨」vs「大多角骨」；「子宮骶韌帶」的「骶」（全站其他地方用「薦」）；外蹠神經 vs 足底外側神經；胸外側神經 vs 外側胸神經 | 名稱表 | 使用者決定後統一 | 〔需人工審核〕 |
| P3-33 | 原文提到但清單沒列名的「內蹠靜脈」網站沒有（待確認） | — | 視需要補 | 〔需人工審核〕 |
| P3-34 | 已 commit 的生成檔 `public/models/paokao/paokao-stream.json.gz` 與 `npm run build` 重新產生的不同：324 個部件中 96 個（肺裂等肺表面標記）頂點數與 bounds 不同。可能是 commit 的檔案過時，或產生過程不穩定（本機 Node 22、CI Node 24，待確認）。部署用的是 CI 重新產生的版本，所以 repo 內的檔案不代表網站實際內容 | `scripts/prepare-paokao.mjs`、`scripts/paokao-structures/lungs.mjs` | 讓產生過程可重現（固定排序／精度），`--check` 模式比對 commit 檔 | 否（生成檔） |
| P3-35 | 手機（390×844）首頁（![手機首頁](https://raw.githubusercontent.com/Kuan21/MJ_anatomy/0f24b701aab6353c2f15307d0dfb4523d07ba1b0/audit-2026-10-30/m-home.png)）：標題「INTERACTIVE ANATOMY ATLAS」與右上 Quiz 按鈕重疊；底部「Systems」按鈕只有英文；「3D」標章字級 10px。實測沒有水平捲動 | `app/page.tsx` header、`globals.css` 手機版規則 | 窄螢幕縮短或隱藏 eyebrow 文字；按鈕改中英並列 | 否 |

---

## 孤兒結構（A2 反向清單）

網站有、但不在跑考清單，名稱也對不上任何 glossary 條目的結構。標準化（去左右、去 mesh 後綴）後共 1,707 種結構：對應清單 428、只對應 glossary 210、**孤兒 1,069**（精確字串比對，是保守上限）。

| 來源 | 孤兒數 | 代表例 |
| --- | ---: | --- |
| BodyParts3D atlas | 658 | 肺段／肝段動脈、牙齒、各節椎骨與肋骨、腕跗骨間韌帶 |
| 腦（Brain Project） | 153 | 各腦溝腦迴 |
| joints.glb | 119 | 各關節囊、椎間盤 |
| 神經串流 | 44 | 細小皮神經分支 |
| 示意模型 | 39 | C1–C8 脊神經及後支、乳房與女陰構造、cubital fossa、anatomical snuffbox |
| 心臟 | 16 | 心臟頁細部 |
| 女性 HRA | 15 | 女性生殖器官細部 |
| 其他 | 25 | — |

孤兒不一定是錯誤（規則是「可以比摘要多」），但其中名稱品質問題已併入 P2-19、P3-17～P3-21。完整清單在稽核暫存資料（未放入 repo，需要時可重新產生）。

---

## 資訊：心臟傳導系統與心動週期動畫

- 網站**沒有**傳導系統或心動週期（Wiggers）動畫：心臟模式說明寫明未收錄傳導系統（`app/organ/heart.tsx:216`），`docs/heart-checklist.json` 列為範圍外，Quiz 也不出題（`app/quiz/catalogue.ts:115`）。
- 現有相關文字正確：右冠狀動脈供應竇房結與房室結（`app/quiz/card-data.ts:143-144`）、節制索內有右束支（`heart-chambers.ts:58`）。
- 日後製作時的教科書基準：PR 120–200 ms；QRS < 120 ms；QTc 男性約 < 450 ms、女性約 < 460–470 ms；房室結延遲約 0.09–0.13 s。Wiggers：心房收縮 → 等容收縮（約 50 ms，房室瓣關閉＝S1）→ 快速／緩慢射血（主動脈瓣約 80 mmHg 打開）→ 等容舒張（主動脈瓣關閉＝S2）→ 快速／緩慢充填。壓力：主動脈 120/80、左心室 120/0–10、右心室 25/0–5、肺動脈 25/10 mmHg。心率 75 次／分時週期約 0.8 s（收縮約 0.3 s、舒張約 0.5 s）。

---

## 已檢查、沒有發現問題

- **保密（build 輸出）**：`dist/`（767 個檔案，含解壓所有 `.gz`）中，共筆、筆記、講義、學長、學姐、考古、跑考、課堂、頁碼、出處、`p.`＋數字、`（0218` 類日期出處、`.docx/.pdf/.pptx` 檔名、`neuro-notes`、`cmu-course`、`paokao-checklist`、`glossary.json`、`115-1` 皆為 0；沒有任何筆記檔被部署；served JSON 的 `source`／`sources`／`origin`／`description` 欄位內容都是模型來源或我們自己寫的說明，沒有 notes／context 欄位；app 原始碼沒有 `console.log` 輸出資料。例外見 P0-01（別名）與 P1-11（檔名／英文說明）。
- **部署路徑**：在 `/MJ_anatomy/` 子路徑下，主圖譜、心臟、腦部、Quiz 首頁、上肢／下肢 Quiz、上肢圖譜 0 個 HTTP ≥ 400、0 個 request failed、0 個 console error（P1-01 的錯誤被程式吞掉，不會出現在 console）。
- **瓣膜**：Tricuspid、Aortic、Pulmonary valve 英文正確。
- **Brodmann**：除 P2-25 列出者外，編號與位置正確（BA 38＝顳極）。
- **CSF**：8 個步驟順序、動畫追蹤路徑順序、各步驟高亮正確（除 P2-21 外側孔去向）。
- **Circle of Willis**：各血管名稱與供血區除 P2-22、P3-22 外正確。
- **名稱**：顯示英文沒有 mesh 後綴（`.001`、`.l/.r`、`.j`）殘留（P3-19 的兩筆除外）；中文沒有英文回退；檢視器沒有「乳頭肌」、主畫面沒有「背闊肌」（P1-08 特殊區域面板除外）；Quiz 1,047 個結構都有中文、清單內無重複。
- **Quiz**：模擬 200 次 × 40 題沒有重複題；第二級題庫沒有同名題；每個結構都有 mesh；作答前會等資料包載入（P1-10 除外）；大小寫、全形英數、空白、the／muscle 容錯正常。
- **資訊卡編號**：只有「FMA ID」一列會顯示編號，沒有把 PK、FJ 編號當圖譜頁碼；Atlas reference／View anatomical source 沒有編造的編號或連結。
- **肌肉資料**：約 230 條肌肉、168 種示意卡與 Moore／Grant's 核對，除 P0-09、P2-32、P3-26 外大致正確；`docs/muscle-layers.json` 的神經、血供與卡片一致。
- **搜尋**：有 150 ms debounce、IME 組字時不搜尋、結果最多 50 筆、索引閒置時分批建立。
- **其他**：隱藏部件不會被點到；有實心結構時會跳過皮膚；動作 worker 失敗會改用本地計算；`:focus-visible` 樣式存在（`globals.css:6`）。

---

## 需要使用者決定的事項

1. P0、P1、P2 中所有〔需人工審核〕項目的修正方向（尤其 P0-01 別名白名單、P1-02 Bicuspid 改名範圍、P1-03 補模型）。
2. P1-11：ATTRIBUTION／model_sources 是否保留「course summary」字樣；`paokao` 檔名是否改中性名稱。
3. P1-12：是否刪除含課程／筆記字樣的遠端分支（不可復原，本次未動）。
4. P3-16：workflow 數量以 CLAUDE.md 或現況為準。
5. P3-32：「趾／指」、「大多角骨／大菱形骨」、「骶／薦」等用詞。
6. 截圖存放在 `pr-screenshots` 分支的做法（CLAUDE.md 註明待確認）。

## 建議的 PR 分批（審核後再開）

| 批次 | 內容 | merge 方式 |
| --- | --- | --- |
| 1 | P1-01 示意包載入失敗＋P2-16 失敗提示＋載入測試 | 程式修正；建議人工看畫面後 merge |
| 2 | P2-27 保密檢查腳本補強＋P1-11 檔名中性化 | 可自動 merge |
| 3 | P1-04、P1-05、P1-06、P2-05～P2-12 互動與相機 | 可自動 merge |
| 4 | P2-04、P2-15、P3-01～P3-03、P3-14 介面文字 | 可自動 merge |
| 5 | P2-01、P2-02、P2-03、P2-14 載入與部署 | 可自動 merge |
| 6 | P0-02～P0-07 名稱程式錯誤（修好後名稱改變） | 【需人工審核】 |
| 7 | P0-01 腦部別名白名單、P2-21～P2-26 腦部內容 | 【需人工審核】 |
| 8 | P0-08、P0-09、P2-28～P2-32 資訊卡內容 | 【需人工審核】 |
| 9 | P1-02 Bicuspid、P2-17、P2-18、P1-07、P1-08 名稱統一 | 【需人工審核】 |
| 10 | P1-09、P1-10、P2-33～P2-36 Quiz | P1-10 可自動；其餘【需人工審核】 |
| 11 | P1-03 補缺漏模型、P2-37 稽核腳本 | 模型【需人工審核】；腳本可自動 |
