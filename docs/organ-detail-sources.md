# 耳與內臟器官詳細模式：站上現況與候選模型來源（內部文件，不上網站）

2026-11-15 建立。只做調查，沒有改任何模型、程式或網站，也沒有把任何外部模型放進 repo（試看用的檔案放在暫存資料夾，用完已刪除）。本檔只放在 `docs/`，不可放進 `public/` 或 `dist/`。

**使用者要先確認的是第 6 節的來源與授權清單**；確認前不下載、不使用任何外部模型。

## 0. 摘要

| 詳細模式 | 站上現有程度 | 最佳候選來源（授權） | 需自行建模的部分 |
| --- | --- | --- | --- |
| 耳 | 只有內耳詳細模式（程式在、入口隱藏）19 個網格；外耳只有一件 External ear；聽小骨、鼓膜、鼓室、耳咽管沒有網格，只有資訊卡 | IE-Map（CC BY 4.0，內耳）、OpenEar（CC BY 4.0，聽小骨、鼓膜、外耳道、鼓階與前庭階、顏面神經、鼓索神經、耳蝸神經）、站上已有的顏面神經與前庭耳蝸神經 | 耳咽管、鼓室腔、鼓膜張肌、鐙骨肌、耳蝸管、耳殼細節；兩套來源之間的對位 |
| 胃 | 1 件 Stomach（852 頂點）；沒有分區 | 沒有授權清楚的獨立胃模型；Z-Anatomy 官方有胃（授權混合，第 4 節）；分區可在現有網格表面標示 | 分區用表面標示，不另建網格 |
| 小腸 | 十二指腸 1 件；空腸 23 件、迴腸 32 件（各分近、中、遠三段） | HRA 小腸 v1.2（CC BY 4.0）：十二指腸四部分、壺腹、括約肌、小乳突、空腸、迴腸、末端迴腸 | 幾乎不用自建 |
| 大腸 | 升、橫、降結腸、直腸、闌尾、結腸帶、迴盲部；沒有盲腸、乙狀結腸、左右結腸彎曲的名稱 | HRA 大腸 v1.3（CC BY 4.0）：盲腸、迴盲瓣、左右結腸彎曲、乙狀結腸、直腸、闌尾 | 肛管（站上只有外肛門括約肌） |
| 肝 | 尾狀葉 1 件、肝靜脈分區 II 至 IX（9 件，程式當作肝組織）、門靜脈、肝靜脈、肝動脈、膽管樹；沒有韌帶與肝門構造 | HRA 肝 v1.2（CC BY 4.0）：Couinaud 節段、左右葉、方形葉、尾葉、圓韌帶、鐮狀韌帶、靜脈韌帶、冠狀韌帶、三角韌帶、肝門、裸區、各臟器壓跡 | 幾乎不用自建；與站上血管的對位要處理 |
| 膽囊與膽道 | 膽囊 1 件、膽囊管、總肝管、左右肝管與肝內膽管；沒有總膽管、肝胰壺腹 | 膽囊本體沒有授權清楚的來源；HRA 小腸有十二指腸壺腹與括約肌；Z-Anatomy 官方有總膽管與膽囊（授權混合） | 總膽管（管狀，可沿站上肝管延伸）；膽囊各部（表面標示） |
| 胰 | 1 件 Pancreas、實質、主胰管；沒有頭、頸、體、尾、鉤突 | HRA 胰 v1.3（CC BY 4.0）：頭、頸、體、尾、鉤突分件 | 副胰管（管狀，小） |
| 脾 | 1 件 Spleen（624 頂點）、脾動脈；沒有脾門與臟器接觸面 | HRA 脾 v1.3（CC BY 4.0）：脾門與胃面、結腸面、腎面、膈面 | 不用自建 |
| 腎與腎上腺 | 左右腎各 1 件（外形）、腎動脈與其分支、輸尿管、左右腎上腺各 1 件；沒有任何腎內部構造 | HRA 腎 v1.3（CC BY 4.0）：被膜、皮質、外皮質、髓質、腎錐體、腎乳突、腎柱、腎門；HRA 腎盂 v1.0（CC BY 4.0） | 腎大盞與腎小盞（樹狀管，建議自建）、腎竇；腎上腺皮質與髓質（有機形狀，需使用者決定） |

重點發現：
1. **HRA（Human Reference Atlas）3D Reference Object Library 是內臟的最佳來源**：肝、腎、腎盂、脾、胰、小腸、大腸都有，授權逐件標示 CC BY 4.0，而且內含站上缺的分段（肝節段、十二指腸四部分、胰頭頸體尾、腎皮質髓質錐體）。本站已經用過同一套的女性骨盆、乳腺與眼，來源與處理方式有前例。
2. **HRA 沒有胃、膽囊、腎上腺，也沒有耳**。這三個器官只有 BodyParts3D 的整體網格，內部分區靠在網格表面標示；耳的中耳要靠 OpenEar。
3. 耳有兩套 CC BY 4.0 的真實掃描資料（IE-Map、OpenEar），但是**來自不同標本、座標各自獨立**，合在一個畫面要做對位，這是耳的最大風險。
4. Z-Anatomy 官方檔雖然有更細的肝、胃、胰、膽囊與耳構造，但**同一包裡混有非商用（NC）授權的改作模型**（腎、內耳），而且從檔案看不出每件網格的出處，所以只列為備案，不列為首選。

## 1. 方法與限制

- 站上現況來自 repo 內已提交的資料：`public/models/atlas.json`（BodyParts3D 4.0，2,234 件）、神經串流檔、`docs/required-structures/*.json`、`app/micro-atlas.tsx`；比對程式 `node scripts/check-required-abdomen.mjs --explain` 與 `node scripts/check-required-structures.mjs --explain`（只比對名稱）。兩支程式在新 worktree 上都可以跑（生成檔用 `tar -h` 從捐贈者 worktree 複製）。
- 內臟的結構範圍依課程範圍資料（腹壁與腹股溝、消化器官與腹膜、後腹壁與腎臟血管神經三份）整理成自己的清單，本檔不引用原文、不寫頁碼。**耳沒有課程資料可對照**，結構依解剖常規列出，使用者請自行補上遺漏。
- 比對只看名稱，**沒有逐項在 3D 畫面確認**；本檔也沒有宣稱任何解剖位置正確，請使用者核對。
- 候選模型只在可以實際取得時才看內容：IE-Map 只量了檔案大小與標頭；HRA 下載了 8 個 GLB 讀節點名稱與三角形數；OpenEar 範例集下載了 9 個 PLY 讀標頭；Z-Anatomy 官方 FBX 讀節點名稱。**都沒有在 3D 畫面檢視外形品質**（本環境沒有為這個目的架設檢視器），所以「品質觀察」欄只寫可由資料推得的事（三角形數、單位、是否分件）。試看檔案全放在 `/tmp/claude-0/` 底下，不在 repo 內。

## 2. 站上現況

### 2.1 耳

| 項目 | 現況 |
| --- | --- |
| 入口 | `app/page.tsx` 的 `MICRO_ATLAS_ENTRY` 設 `ear:false`，按鈕不顯示；`app/micro-atlas.tsx` 的耳場景程式還在 |
| 載入的網格 | 19 個 VTK 檔：耳蝸外輪廓、耳蝸迷路、前、外、後三條半規管，前、外、後三個壺腹，橢圓囊、球囊，三個壺腹帽（Cupula）的壁與膜性半規管，前庭階、鼓階、耳蝸頂（Cochlear cupula） |
| 載入方式 | 執行時用 `VTKLoader` 向 `https://media.githubusercontent.com/media/pydsgz/IEMap/master/data/` 下載（GitHub LFS 轉發）；沒有本地備份，離線或該主機不可用就載入失敗 |
| 大小 | 這 19 個檔合計約 4.9 MB（`Content-Length` 實測加總） |
| 來源與授權 | IE-Map：repo 的 README 寫明「論文與資料的授權都是 CC BY 4.0」，`LICENSE` 檔是 Creative Commons Attribution 4.0 International。其中 `mesh_david_*` 與 `ls_Hsapiens_*` 為 David 等人（2016）的網格，README 說明同為 CC BY 4.0；耳蝸分割來自 Wimmer 等人（2019）的 CT 資料（CC BY 4.0） |
| 署名現況 | 畫面側欄與關於頁有寫 IE-Map 與 CC BY 4.0；**`public/ATTRIBUTION.md` 與 `public/model_sources.json` 沒有條目**，沒有列出論文作者與 David、Wimmer 兩份資料 |
| 能不能改成不依賴外部下載 | **可以**。CC BY 4.0 允許再散布與改作，只要署名、附授權連結並註明修改。作法：用腳本從 repo 固定的提交下載這 19 個檔，記 sha256，轉成站上其他模型用的 glb（或二進位串流）放進 `public/models/ear/`，並在 ATTRIBUTION 補上 Ahmadi 等人（2021，Scientific Reports）、David 等人（2016）、Wimmer 等人（2019）。**要先經使用者確認授權才可做** |
| 名稱 | 現在的英文名多為檔名直譯（例如 Anterior canal cupula wall），沒有中文，也沒有資訊卡；上線前要重新命名並寫自己的說明 |
| 位置關係 | 內耳網格只有內耳，沒有周圍的顳骨、鼓室、聽小骨，也沒有與站上全身圖譜的座標對位（目前是獨立場景） |

站上耳的其他資料：
- 外耳：BodyParts3D 4.0 的 `External ear`（FJ2811，概念 FMA52781，894 頂點）1 件，是否含完整耳殼細節要看 3D 畫面，**未確認**。BodyParts3D 3.0 與 4.0 的零件表都沒有聽小骨、鼓膜、耳蝸、半規管（已逐一查零件清單）。
- 神經：站上有 Facial nerve (VII)、Vestibulocochlear nerve (VIII)、Vestibular nerve、Cochlear nerve（左右）與 Chorda tympani，來自神經模型（`nervous.glb`，神經串流檔）。**注意**：這份神經資料取自第三方複本，不是官方倉庫，見 `docs/zanatomy-evaluation.md` 第 2 節，仍待使用者決定是否改用官方檔。
- 資訊卡：Malleus、Incus、Stapes、Oval window、Round window、Cochlear duct、Helicotrema、Spiral ganglion、Vestibular ganglion 等只在腦部資訊卡資料表，沒有網格（必備結構檢查判為 CARD-ONLY）。
- 必備結構核對（頭頸清單）裡耳類別 `Auditory ossicles`、`Inner ear`、`Middle ear` 判為 MISSING，`Outer ear`、`Pharyngotympanic tube` 靠別名判為已有。

### 2.2 內臟器官（`atlas.json` 的網格）

下表「網格」欄列站上現在的零件（BodyParts3D 4.0 匯出，名稱依 `atlas.json`）；「分段」欄看是否可分部位點選；「缺」欄依第 3 節的結構清單。

| 器官 | 網格 | 分段 | 缺 |
| --- | --- | --- | --- |
| 胃 Stomach 胃 | Stomach（FJ2564，852 頂點）；Esophagus（FJ2563，173 頂點） | 無 | 賁門、胃底、胃體、幽門（幽門竇、幽門管）、胃大彎、胃小彎、胃角切跡、幽門括約肌、黏膜皺襞（程式檢查：胃底、大彎、小彎、幽門都判為缺） |
| 十二指腸 Duodenum 十二指腸 | Duodenum（FJ2573，883 頂點）1 件 | 無（一件） | 上部、降部、水平部（下部）、升部；十二指腸空腸彎曲、懸韌帶；大小十二指腸乳突 |
| 空腸 Jejunum 空腸 | 23 件，名為近段、中段、遠段（Proximal 8、Middle 5、Distal 10） | 有（三段，由多件組成） | 環狀皺壁屬內表面細節，不在外形網格內 |
| 迴腸 Ileum 迴腸 | 32 件（近段 10、中段 10、遠段 11、外加 Ileocecal junction FJ2599） | 有（三段） | 迴盲瓣的內部構造 |
| 大腸 Large intestine 大腸 | Ascending colon、Transverse colon、Descending colon、Rectum、Appendix、Taenia libera／mesocolica／omentalis、Ileocecal junction、Mesoappendix、Transverse mesocolon | 部分 | 盲腸（只有 Ileocecal junction 一件，概念 FMA14541 掛在這件上，是否含盲腸袋要看畫面）、乙狀結腸（沒有網格，降結腸下緣與直腸上緣是否涵蓋未確認）、右結腸彎曲、左結腸彎曲、結腸袋、腸脂垂、肛管（只有 External anal sphincter） |
| 肝 Liver 肝 | Caudate lobe of liver（FJ2816，節段 I）；Hepatovenous segment II、III、IV、V、VI、VII、VIII（兩件）、IX（程式 `mj-system-classifier` 當作肝組織本身）；Hepatic portal vein、左右門靜脈與分支；Left／Middle／Right hepatic vein；右、左肝動脈分支；左右肝管、總肝管與各肝區膽管分支 | 有（節段分件） | 沒有整個肝的外殼（另一件）、肝韌帶（鐮狀、圓、靜脈、冠狀、三角）、肝門構造本身、裸區、肝門三體的整合；節段 VIII 由兩件組成需合併成一個可點選結構；節段命名（II 至 IX）與常用 Couinaud 八節段的對應要使用者核對 |
| 膽囊與膽道 | Gallbladder（FJ2817，649 頂點）、Cystic duct（FJ3080）、Common hepatic duct（FJ3079）、Left／Right hepatic duct、肝內膽管樹 | 無（膽囊一件） | 膽囊底、體、頸、漏斗；總膽管（站上沒有以總膽管命名的結構）、肝胰壺腹、括約肌、Calot 三角（空間，要用邊界結構高亮呈現） |
| 胰 Pancreas 胰 | Pancreas（FJ1895）、Parenchyma of pancreas（FJ2629）、Pancreatic duct（FJ1896）、Pancreatic duct tree（FJ2630） | 無 | 頭、頸、體、尾、鉤突；副胰管；大小十二指腸乳突 |
| 脾 Spleen 脾 | Spleen（FJ2561，624 頂點）、Splenic artery（FJ2562） | 無 | 脾門、胃面、結腸面、腎面；脾相關韌帶（脾胃、脾腎、膈結腸） |
| 腎 Kidney 腎 | Left／Right kidney（FJ3145／FJ3147，約 750 頂點）；腎動脈與其節段分支；輸尿管 | 無 | 腎皮質、髓質、腎錐體、腎柱、腎乳突、腎小盞、腎大盞、腎盂、腎竇、腎門（程式檢查：10 項都判為缺）；腎筋膜、腎周脂肪 |
| 腎上腺 Suprarenal gland 腎上腺 | Left／Right adrenal gland（FJ3129／FJ3130）各 1 件 | 無 | 皮質、髓質 |

程式檢查補充（`check-required-abdomen.mjs`，只比名稱）：臟器類 39 項，有 17、缺 22；上表「缺」欄的胃、十二指腸空腸彎曲、盲腸、左右結腸彎曲、乙狀結腸、肛門、總膽管、肝門三體、腎內部 10 項即為其中的缺項。

**一個要使用者注意的事實**：BodyParts3D 4.0 的肝是「節段＋血管＋膽管」的組合，沒有一件完整的肝外殼；站上畫面上肝看起來像什麼、節段是否連成完整的肝，需要在 3D 畫面確認（本次未做）。

## 3. 各器官結構清單與歸類

歸類代號：
- **有**：站上已有可點選的網格。
- **候選 + 編號**：有授權清楚的現成模型（編號見第 4 節）。
- **自建（管）**：管狀結構，依相鄰結構走向建模。
- **自建（有機）**：有機形狀，**需使用者決定**（第 5 節列風險）。
- **標示**：在既有網格表面著色或描邊，不另做網格。

### 3.1 耳（結構依解剖常規列出，無課程資料可對照）

| 結構 | 歸類 | 說明 |
| --- | --- | --- |
| 外耳：耳殼 Auricle 耳殼 | 有（部分）、標示 | BodyParts3D External ear；耳輪、對耳輪、耳屏、耳垂等做表面標示，前提是網格有足夠細節（未確認） |
| 外耳道 External acoustic meatus 外耳道 | 候選 C5 | OpenEar 有外耳道分割 |
| 鼓膜 Tympanic membrane 鼓膜 | 候選 C5 | OpenEar 有鼓膜（範例集有，3,982 頂點） |
| 鼓室 Tympanic cavity 鼓室 | 自建（有機，空間） | 沒有現成網格；建議用貼合顳骨骨腔的半透明體，或只高亮邊界結構；OpenEar 論文說完整集有顳骨分割，單檔大小沒有確認 |
| 聽小骨：錘骨 Malleus、砧骨 Incus、鐙骨 Stapes | 候選 C5（首選）、C4（備案） | OpenEar 三件各 1,000 至 2,000 頂點；錘骨柄、頭、頸、砧骨長腳、鐙骨底板等部位可用表面標示 |
| 鼓膜張肌 Tensor tympani、鐙骨肌 Stapedius | 自建（有機） | 沒有授權清楚的現成網格；小肌肉，形狀細小 |
| 耳咽管 Pharyngotympanic tube 耳咽管 | 自建（管） | 沒有確認可用的現成網格；Z-Anatomy 官方有 Auditory tube，但出處不明（C4） |
| 乳突竇 Mastoid antrum 乳突竇 | 標示或自建（有機，空間） | 顳骨內的空腔 |
| 卵圓窗 Oval window、圓窗 Round window、岬 Promontory | 標示 | 標在耳蝸或鼓室壁表面 |
| 內耳：骨迷路 Osseous labyrinth、耳蝸 Cochlea、前庭 Vestibule、三條半規管 | 候選 C1（首選）、C6（備案） | IE-Map 已有（站上耳程式已載入）；Wimmer 的骨迷路表面模型有 23 件標本 |
| 前庭階 Scala vestibuli、鼓階 Scala tympani | 候選 C1、C5 | 兩套都有（不同標本） |
| 蝸軸 Modiolus、耳蝸孔 Helicotrema | 標示 | 由耳蝸幾何推得位置，做表面標示 |
| 耳蝸管 Cochlear duct（中間階） | 自建（管） | IE-Map 沒有；兩階之間的螺旋管，沿現有耳蝸中心線建模 |
| 膜迷路：橢圓囊 Utricle、球囊 Saccule、膜半規管、壺腹 | 候選 C1 | IE-Map 已有 |
| 內淋巴囊 Endolymphatic sac | 自建（有機） | 沒有現成網格；形狀小，可考慮只放資訊卡 |
| 基底膜、覆膜、柯蒂氏器（Organ of Corti）、嵴（Crista）、斑（Macula） | 資訊卡 | 細胞與組織層級，不做網格 |
| 螺旋神經節 Spiral ganglion、前庭神經節 Vestibular ganglion | 自建（有機）或資訊卡 | 沒有現成網格 |
| 顏面神經 Facial nerve (VII) 顏面神經 | 有；候選 C5 補顳骨內段 | 站上有；OpenEar 有顳骨內走向（單一標本） |
| 前庭耳蝸神經 Vestibulocochlear nerve (VIII)、蝸神經、前庭神經 | 有；候選 C5 補內聽道內段 | 站上有；OpenEar 有蝸神經 |
| 鼓索神經 Chorda tympani | 有；候選 C5 | 站上有；OpenEar 有分割 |

### 3.2 胃

| 結構 | 歸類 |
| --- | --- |
| 胃 Stomach 胃、食道 Esophagus 食道 | 有 |
| 賁門、胃底、胃體、幽門部（幽門竇、幽門管）、幽門 | 標示（沒有任何授權清楚的胃分區網格；表面標示用既有 Stomach 網格） |
| 胃大彎、胃小彎、胃角切跡 | 標示 |
| 幽門括約肌、黏膜皺襞、胃管 | 資訊卡；皺襞若要做是自建（有機，內表面細節，不建議） |
| 食道腹部、食道胃交界（Z 線） | 標示 |

### 3.3 小腸

| 結構 | 歸類 |
| --- | --- |
| 十二指腸（整體） | 有 |
| 十二指腸上部、降部、水平部、升部 | 候選 C3（HRA 小腸分件） |
| 十二指腸壺腹（球部）、肝胰壺腹區、大十二指腸乳突、小十二指腸乳突 | 候選 C3（HRA 有 Duodenal ampulla、Sphincter of hepatopancreatic ampulla、Papilla of Santorini） |
| 十二指腸空腸彎曲、十二指腸懸韌帶 | 標示（彎曲）；懸韌帶自建（有機，帶狀）或資訊卡 |
| 空腸、迴腸 | 有（三段）；候選 C3（HRA 整件與末端迴腸） |
| 迴盲瓣 | 候選 C4／C3（HRA 大腸有 Ileocecal valve） |
| 環狀皺壁、培氏斑 | 資訊卡（內表面或組織層級） |

### 3.4 大腸

| 結構 | 歸類 |
| --- | --- |
| 升結腸、橫結腸、降結腸、直腸、闌尾、結腸帶 | 有 |
| 盲腸 Cecum、乙狀結腸 Sigmoid colon、右結腸彎曲、左結腸彎曲 | 候選 C3（HRA 大腸有 Caecum、Sigmoid colon、Hepatic flexure、Splenic flexure） |
| 迴盲瓣 Ileocecal valve | 候選 C3 |
| 結腸袋 Haustra、腸脂垂 Omental appendices | 標示（結腸袋）；腸脂垂：HRA 有橫結腸腸脂垂（Epiploic appendage of transverse colon，v1.0），其他段自建（有機）或資訊卡 |
| 肛管 Anal canal | 自建（管）；站上有 External anal sphincter（3 件，名稱重複需合併） |
| 大網膜 Omentum | 候選 C3（HRA 大網膜 v1.0）；站上另有網膜相關名稱要比對 |

### 3.5 肝

| 結構 | 歸類 |
| --- | --- |
| 肝節段 I（尾狀葉）至 VIII | 有（站上以 Caudate lobe 與 Hepatovenous segment 分件）；候選 C3（HRA 有 Couinaud 節段，命名直接對應） |
| 左葉、右葉、方形葉、尾葉 | 候選 C3 |
| 肝表面（橫膈面、臟面）與各臟器壓跡（胃、十二指腸、結腸、腎、腎上腺、食道） | 候選 C3（HRA 有壓跡分件）；裸區 Bare area：候選 C3 |
| 肝韌帶：鐮狀、圓、靜脈、冠狀、三角 | 候選 C3（HRA 有） |
| 肝門 Porta hepatis、肝門三體 Portal triad | 候選 C3（肝門）；三體用站上已有的門靜脈、肝動脈、肝管高亮呈現 |
| 肝動脈、門靜脈、肝靜脈、肝管 | 有 |
| 肝小葉 Hepatic lobule | 資訊卡（組織層級） |

### 3.6 膽囊與膽道

| 結構 | 歸類 |
| --- | --- |
| 膽囊、膽囊管、總肝管、左右肝管 | 有 |
| 膽囊底、體、頸（漏斗） | 標示 |
| 總膽管 Bile duct (common bile duct) | 自建（管）；備案 C4（Z-Anatomy 官方有 Bile duct，授權混合） |
| 肝胰壺腹、括約肌、大十二指腸乳突 | 候選 C3（HRA 小腸） |
| Calot 三角 Cystohepatic triangle | 空間：依規則以邊界結構（肝下面、總肝管、膽囊管）高亮呈現 |

### 3.6b 胰

| 結構 | 歸類 |
| --- | --- |
| 胰整體、實質、主胰管 | 有 |
| 頭、頸、體、尾、鉤突 | 候選 C3（HRA 胰分件） |
| 副胰管 Accessory pancreatic duct | 自建（管）；備案 C4（Z-Anatomy 官方有） |
| 胰小島 | 資訊卡（組織層級） |

### 3.7 脾

| 結構 | 歸類 |
| --- | --- |
| 脾、脾動脈 | 有 |
| 脾門 Hilum、胃面、結腸面、腎面、膈面 | 候選 C3（HRA 脾分件） |
| 脾相關韌帶（脾胃、脾腎、膈結腸、膈脾、脾結腸） | 自建（有機，膜狀）；建議只放資訊卡，若要建須使用者決定 |

### 3.8 腎與腎上腺

| 結構 | 歸類 |
| --- | --- |
| 腎、腎動脈與分支、輸尿管、腎上腺（整體） | 有 |
| 腎被膜 Capsule、腎皮質、外皮質、髓質、腎錐體、腎柱、腎乳突、腎門 | 候選 C3（HRA 腎分件；男性左腎 9 個乳突與錐體，女性左腎 11 個；右腎另有檔） |
| 腎盂 Renal pelvis | 候選 C3（HRA 腎盂 v1.0，3,616 個三角形；是否含大小盞要看畫面，從尺寸（約 20 mm）判斷較像只有腎盂本體） |
| 腎小盞 Minor calyx、腎大盞 Major calyx | 自建（管，樹狀）；可從 HRA 腎乳突接起，每個乳突一個小盞，再匯成大盞 |
| 腎竇 Renal sinus | 空間：以高亮腎盂、盞、血管、脂肪的容納區，或用貼合邊界的半透明體 |
| 腎筋膜、腎周脂肪、腎旁脂肪 | 自建（有機，膜與脂肪層）；建議只放資訊卡或半透明包覆示意，使用者決定 |
| 腎上腺皮質與髓質 | 自建（有機，兩層殼）；使用者決定 |
| 腎單位、腎小體 | 資訊卡（組織層級） |

## 4. 候選模型來源

> 授權欄為取得來源的原文授權名稱與版本。所有候選都**尚未放進 repo**。「可修改再散布」一欄：CC BY 4.0 與 CC BY-SA 都可（SA 要求改作以相同授權散布）；CC BY-NC-ND 與其他非商用、禁止改作的一律不可。

### C1　IE-Map 人類內耳圖譜（耳，內耳）

| 項目 | 內容 |
| --- | --- |
| 網址 | https://github.com/pydsgz/IEMap （資料在 `data/`；論文 doi:10.1038/s41598-021-82716-0） |
| 授權 | Creative Commons Attribution 4.0 International（README：論文與資料同為 CC BY 4.0；`LICENSE` 檔為 CC BY 4.0 原文）。內含的 `ls_Hsapiens_*` 網格為 David 等人（2016）、耳蝸分割為 Wimmer 等人（2019）的資料，README 標示同為 CC BY 4.0 |
| 涵蓋結構 | 骨迷路、耳蝸（外輪廓、前庭階、鼓階、頂）、三條半規管與壺腹、橢圓囊、球囊、膜半規管與壺腹帽、94 個解剖標誌點；另有 T1、T2、CISS、CT、microCT 影像與 3D Slicer 場景 |
| 格式與大小 | 表面網格為 VTK（二進位，3D Slicer 輸出，RAS 座標）；站上已用的 19 個合計約 4.9 MB；影像檔另計（不需要） |
| 是否分段 | 是，每個結構一個檔；沒有分左右，**側別在檔案內沒有標示（未確認）** |
| 品質觀察 | 取得標頭確認為二進位 VTK 多邊形；沒有看 3D 畫面。半規管與壺腹各一件，膜性構造與骨性構造分開 |
| 可修改再散布 | 可（CC BY 4.0）。需署名論文與資料來源、附授權連結、註明修改 |
| 已知問題 | 內耳以外的結構（聽小骨、鼓室）沒有；與站上座標沒有對位 |

### C2　BodyParts3D（已在 repo）

| 項目 | 內容 |
| --- | --- |
| 網址 | https://dbarchive.biosciencedbc.jp/en/bodyparts3d/ （4.0：`isa_`／`partof_BP3D_4.0_obj_99.zip`；3.0：`BodyParts3D_3.0_obj_95.zip`，約 547 MB） |
| 授權 | 4.0：Creative Commons Attribution 4.0 International（授權頁，最後更新 2025/02/27，署名寫法「BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International」）。3.0：CC BY-SA 2.1 Japan（repo 已用其中的補件，`scripts/supplement-parts.json`，都是肌肉、韌帶、肺葉） |
| 涵蓋結構 | 見第 2 節：胃、十二指腸、空腸、迴腸、大腸各段、肝節段與血管與膽管、胰、脾、腎、腎上腺、膽囊都已在站上。3.0 與 4.0 的零件表都**沒有**聽小骨、鼓膜、鼓室、耳蝸、半規管；3.0 也沒有更多的內臟零件（補件清單裡沒有內臟） |
| 品質觀察 | 站上已用；內臟網格頂點數低（胃 852、脾 624、腎約 750、膽囊 649），形狀偏簡化；各器官沒有內部構造 |
| 可修改再散布 | 可 |

### C3　Human Reference Atlas 3D Reference Object Library（HuBMAP）

| 項目 | 內容 |
| --- | --- |
| 網址 | 索引 API：https://apps.humanatlas.io/api/v1/reference-organs （81 件）；檔案在 `https://cdn.humanatlas.io/digital-objects/ref-organ/<名稱>/<版本>/assets/*.glb`；說明頁 https://humanatlas.io/3d-reference-library |
| 授權 | 逐件圖譜資料的中繼資料（`graph.ttl`）原文為 `dct:license "https://creativecommons.org/licenses/by/4.0/"`，即 CC BY 4.0；下列 8 件逐一讀過，全部相同 |
| repo 已用 | 女性骨盆器官與骨（Female v1.5，33 件＋5 骨）、乳腺（Female Left／Right v1.1）、眼（eye-male-left v1.3）；處理腳本在 `scripts/extract-hra-*.mjs`，來源 URL 與 sha256 已固定 |
| 涵蓋結構與版本（男性，Visible Human 資料；另有女性版） | 見下表 |
| 格式與大小 | GLB；每個檔分件（節點）命名；以下為實測 |
| 品質觀察 | 單位為公釐；三角形數足夠（肝 6.0 萬、腎 8.4 萬、胰 3.9 萬、小腸 3.4 萬、大腸 3.4 萬、脾 1.7 萬）；每個器官各有自己的座標，**與 BodyParts3D 身體不在同一座標系**，要對位（眼與骨盆已有前例）；沒有看 3D 畫面外形 |
| 可修改再散布 | 可（CC BY 4.0）；需署名 Browne、Schlehlein 等作者與 HRA／HuBMAP，註明修改 |
| 沒有的 | 胃、膽囊、腎上腺、耳（索引中沒有這些器官）；也沒有膽管、血管分支（血管另有 `blood-vasculature` 整體模型，本次未評估） |

HRA 各件內容（男性版為主；節點名稱讀自 GLB）：

| 檔案（版本） | 大小 | 分件（節點） |
| --- | --- | --- |
| liver-male v1.2 | 1.1 MB | 肝、裸區、肝被膜、橫膈面、腎上腺壓跡、腎壓跡、胃壓跡、結腸壓跡、食道壓跡、十二指腸壓跡、肝門、Couinaud 節段（後下、後上、前上、前下；左外前、左外後；左內上、左內下）、尾狀葉、右葉、左葉（左外葉、左內葉）、方形葉、肝韌帶（肝十二指腸韌帶、靜脈韌帶、圓韌帶、三角韌帶、鐮狀韌帶、冠狀韌帶） |
| kidney-male-left v1.3（右腎、女性版另有檔） | 1.5 MB（女性左 1.4 MB） | 腎、被膜、腎門、皮質、腎柱、外皮質、髓質、腎乳突（9 個，另有合併件）、腎錐體（9 個，另有合併件） |
| renal-pelvis-male-left v1.0 | 0.07 MB | 腎盂 |
| pancreas-male v1.3 | 2.1 MB | 胰、體、尾、頭、頸、鉤突 |
| small-intestine-male v1.2 | 0.6 MB | 小腸、迴腸、末端迴腸、空腸、十二指腸、十二指腸升部、降部、水平部、上部、十二指腸壺腹、肝胰壺腹括約肌、小乳突（Santorini） |
| large-intestine-male v1.3 | 0.7 MB | 結腸、升、降、橫、乙狀結腸、直腸、肝曲、脾曲、迴盲瓣、盲腸、闌尾 |
| spleen-male v1.3 | 0.5 MB | 脾、結腸面、膈面、胃面、脾門、腎面 |
| omentum-male v1.0 | 2.6 MB | 大網膜（本次沒有讀節點） |
| ureter-male-left／right v1.2 | 0.7 MB | 輸尿管（站上已有輸尿管，本次不需要） |

### C4　Z-Anatomy 官方來源（LluisV/Z-Anatomy）

| 項目 | 內容 |
| --- | --- |
| 網址 | https://github.com/LluisV/Z-Anatomy ，固定提交 `6c7f9016bd5899ac8edafd31b9900c151df42ed6`（本站既有 Z-Anatomy 腱鞘、支持帶與筋膜用同一個提交；做法見 `scripts/extract-zanatomy-nervous.mjs` 與 `docs/zanatomy-evaluation.md`）。檔案：`Resources/Models/FBX/VisceralSystem100.fbx`（18.4 MB）、`SkeletalSystem100.fbx`（41.3 MB）、`NervousSystem100.fbx`（53.9 MB）、`LymphoidOrgans100.fbx`（2.1 MB） |
| 授權 | 官方 `Resources/Models/License.txt` 原文大意：內容是 BodyParts3D 的衍生物，須標示「BodyParts3D, The Database Center for Life Science, CC-BY-SA 2.1 Japan」與「Z-Anatomy, The open source atlas of anatomy, CC-BY-SA 4.0」，衍生作品須以相同授權散布。**同一份文件另載「其他已納入並改作的模型」：Brainder 與 White matter（華盛頓大學）、Cranial Nerves and Foramina（Dundee 大學，CC-BY 4.0）、Anatomy of the Inner Ear（Dundee 大學，CC-BY-NC-SA 4.0）、Kidney（lissiecowley，CC-BY-NC 4.0）** |
| 涵蓋結構（只讀節點名稱） | 內臟檔：胃、十二指腸、空腸、升／橫／降／乙狀結腸、結腸帶、闌尾、肝與節段（I 至 VIII，名稱含 Couinaud 編號）、膽囊、總膽管、胰、主胰管、副胰管、腎、腎盂、腎上腺、大小網膜；各器官的次分區（胃底、胃體、幽門竇、胰頭頸體尾、膽囊底體頸等）**只以標示點存在（名稱以 `.j`、`.t` 結尾），沒有獨立網格**。骨骼與神經檔：Malleus、Incus、Stapes（`.l`／`.r`）、Tympanic membrane、Cochlea、Vestibule、Auditory tube、Chorda tympani、顏面神經與前庭耳蝸神經；半規管只有標示點 |
| 格式與大小 | FBX（Blender 匯出）；官方沒有 GLB；要讀須轉換 |
| 品質觀察 | 只讀節點名稱，沒有看外形；先前的評估（`docs/zanatomy-evaluation.md` 第 9 節）量過肌肉與骨骼，網格較平滑但三角形多 1.5 至 2.5 倍 |
| 可修改再散布 | **逐件才知道**：整體是 CC BY-SA，但腎與內耳是 NC 改作，而 FBX 裡看不出每件網格的出處。**腎、腎盂、所有內耳與耳蝸相關件一律排除**；其他件要使用者確認可接受 CC BY-SA 的「相同授權散布」條件（本站既有的 Z-Anatomy 衍生資料已是這個條件，見 `public/ATTRIBUTION.md`） |
| 不建議整包使用 | 第三方複本 `nqwrc/3d-anatomy`：整個 repo 標示為非商用，不可成包搬入（見 `docs/open-model-sources.md`） |

### C5　OpenEar：人類顳骨三維模型庫（Sieber 等，Scientific Data 2019）

| 項目 | 內容 |
| --- | --- |
| 網址 | 資料集：https://doi.org/10.5281/zenodo.1473724 （Zenodo 1473724，8 個標本 Alpha 至 Theta，每個 ZIP 約 3.9 至 14 GB）；範例小集：https://doi.org/10.5281/zenodo.4362584 （Zenodo 4362584，標本 Delta，總共約 4.9 MB 的網格）；論文 doi:10.1038/sdata.2018.297 |
| 授權 | Creative Commons Attribution 4.0 International（Zenodo 兩筆紀錄的授權欄皆為 `cc-by-4.0`；論文為開放取用 CC BY 4.0） |
| 涵蓋結構（論文與範例檔名） | 鼓階、前庭階、錘骨、砧骨、鐙骨、顏面神經、鼓索神經、鼓膜、外耳道、乙狀竇、硬腦膜、頸內動脈、顳骨；範例集另有蝸神經。**沒有**半規管、橢圓囊、球囊、耳咽管、鼓膜張肌、鐙骨肌 |
| 格式與大小 | 網格為 PLY（可轉 STL）；完整集每個標本含大量影像與體素資料，ZIP 4 至 14 GB，**取其中的 PLY 需要先下載整個 ZIP 或用範圍請求只取目錄，這次沒有做**；範例集的 PLY（ASCII，含頂點顏色）：錘骨 2,000 頂點（138 KB）、砧骨 2,000（138 KB）、鐙骨 1,000（66 KB）、鼓膜 3,982（283 KB）、前庭階 10,000（720 KB）、鼓階 7,988（574 KB）、蝸神經 7,998（574 KB）、鼓索神經 3,000（211 KB）、顏面神經（OBJ，1.9 MB）。座標單位看來是公釐（數值約 20 至 50），未在檔案內聲明 |
| 是否分段 | 是，每個結構一個檔 |
| 品質觀察 | 論文說明網格以約每平方公釐 70 個頂點的密度做最佳化，範例集的聽小骨為降階後的版本（1,000 至 2,000 頂點）；論文提到標本脫水可能造成軟組織（如顏面神經）收縮，不一定填滿骨管；沒有看 3D 畫面 |
| 可修改再散布 | 可（CC BY 4.0），需署名並註明修改 |
| 已知問題 | 單一標本；側別未在檔案內標示（未確認）；與 C1 的標本不同，座標不同；要對到站上顳骨需做對位 |

### C6　人類骨迷路：CT 與顯微 CT 共同配準影像與表面模型（Wimmer 等）

| 項目 | 內容 |
| --- | --- |
| 網址 | https://doi.org/10.5281/zenodo.3355272 （Zenodo 3355272；arXiv:1907.01870） |
| 授權 | Creative Commons Attribution 4.0 International（Zenodo 授權欄 `cc-by-4.0`） |
| 涵蓋結構 | 23 個標本的骨迷路表面模型與 94 個解剖標誌點（與 C1 同一系列） |
| 格式與大小 | 每個標本一個 ZIP，約 21 至 49 MB，內含影像與模型 |
| 品質觀察 | 沒有下載；只有骨迷路外形（不含聽小骨、膜迷路、神經） |
| 可修改再散布 | 可（CC BY 4.0） |
| 用途 | 只作 C1 的備案（骨迷路外形）；C1 已含耳蝸分割，一般不需要 |

### C7　NIH 3D 與其他

| 項目 | 內容 |
| --- | --- |
| NIH 3D（https://3d.nih.gov ） | 網站可連線，但頁面需要網頁程式才能搜尋。以搜尋引擎找到一件胃：「Stomach (ventriculus)」3DPX-021124，授權頁標 CC BY（4.0），但頁面同時列「創作者 Johnson J」與「版權 Hyes, A.g.（2017）、製作 Custom Boxes UK」，**權利人不一致，出處不明，不建議使用**。耳與其他內臟沒有找到授權清楚的條目；沒有逐一核對 NIH 3D 的全部條目 |
| Sketchfab | 搜尋 API 可連線（不需登入），有 CC BY 的耳模型（例如 Human Ear、Inner ear），但：下載需登入；上傳者多為個人，原創性無法確認（同站也有 CC BY-NC-SA 的 Anatomy of the Inner Ear，與 Z-Anatomy 清單中的 Dundee 內耳同名，疑為同一來源）。**不建議使用，也沒有下載** |
| 商業商店（CGTrader、TurboSquid、RenderHub、Skillshare 等） | 授權為付費、不得再散布，**不用** |
| 其他已排除 | IHA 人體幾何資料庫（Zenodo 16949997，CC BY-NC-SA 4.0，含耳廓；非商用，不可）；Z-Anatomy 清單中的 Dundee 內耳與腎臟（NC，不可） |
| 未查證 | 以 CT 分割產生的大型資料集（如全身器官分割資料）可得到患者特異的內臟網格，但只有器官外形、沒有內部分區，授權與條件逐一不同，這次沒有查，不列入建議 |

## 5. 缺口與自建風險

### 5.1 缺口分類總表

| 器官 | 站上已有 | 有候選模型 | 自建（管） | 自建（有機，需決定） | 標示或資訊卡 |
| --- | --- | --- | --- | --- | --- |
| 耳 | 外耳（1 件）、顏面神經、前庭耳蝸神經、鼓索神經 | 內耳（C1）、聽小骨、鼓膜、外耳道、鼓階與前庭階、顳骨內神經（C5） | 耳咽管、耳蝸管 | 鼓室腔（空間）、鼓膜張肌、鐙骨肌、內淋巴囊、神經節、乳突竇 | 卵圓窗、圓窗、岬、蝸軸、耳蝸孔、耳殼各部、柯蒂氏器 |
| 胃 | 胃、食道 | 無 | 無 | 無（皺襞不建議） | 賁門、胃底、胃體、幽門部、大彎、小彎、角切跡 |
| 小腸 | 十二指腸、空腸三段、迴腸三段 | 十二指腸四部分、壺腹、乳突（C3） | 無 | 十二指腸懸韌帶 | 空腸迴腸皺壁（資訊卡） |
| 大腸 | 各段結腸、直腸、闌尾、結腸帶 | 盲腸、乙狀結腸、左右彎曲、迴盲瓣、橫結腸腸脂垂（C3） | 肛管 | 其他段腸脂垂 | 結腸袋 |
| 肝 | 節段、血管、膽管 | 整體殼、左右葉、方形葉、尾葉、韌帶、肝門、壓跡、裸區（C3） | 無 | 無 | 肝小葉（資訊卡） |
| 膽囊與膽道 | 膽囊、膽囊管、總肝管、左右肝管 | 肝胰壺腹（C3） | 總膽管 | 無 | 膽囊底體頸 |
| 胰 | 胰、實質、主胰管 | 頭、頸、體、尾、鉤突（C3） | 副胰管 | 無 | 胰小島 |
| 脾 | 脾、脾動脈 | 脾門與四個面（C3） | 無 | 脾相關韌帶（建議只放資訊卡） | 無 |
| 腎與腎上腺 | 腎、血管、輸尿管、腎上腺整體 | 被膜、皮質、髓質、錐體、柱、乳突、腎門、腎盂（C3） | 腎小盞與腎大盞 | 腎上腺皮質與髓質、腎筋膜與周圍脂肪 | 腎竇（空間，高亮邊界） |

### 5.2 有機形狀自建的風險（請使用者決定做不做）

1. **鼓室腔、乳突竇**：空間而非實體。依規則只可用貼合邊界的半透明立體；鼓室壁形狀複雜（頂、底、前、後、內、外六壁），沒有現成的邊界網格，做出來的形狀只能是示意。建議改成「高亮組成邊界的結構（鼓膜、聽小骨、岬、卵圓窗與圓窗標示）」，不另做空間。
2. **鼓膜張肌、鐙骨肌**：肌肉細小，起止點與肌腱（鼓膜張肌腱繞過匙突止於錘骨、鐙骨肌腱從錐隆起止於鐙骨）要貼合 C5 的聽小骨位置；沒有現成網格，容易做成位置合理但形狀不實。可考慮只放資訊卡。
3. **內淋巴囊、螺旋與前庭神經節**：形狀小、解剖變異大；建議資訊卡。
4. **腎上腺皮質與髓質**：HRA 與 BodyParts3D 都沒有內部構造；可做成兩層殼（外皮質、內髓質），但厚度與形狀屬示意，且需要與腎上腺整體網格貼合不穿模。
5. **腎筋膜與腎周脂肪**：膜與脂肪層，不貼骨、不貼器官，形狀依賴相鄰器官；若做，應是依腎與腎上腺外形外擴的半透明殼（與站上的漿膜示意殼同做法，`scripts/prepare-serous.mjs`），並標明示意。
6. **脾相關韌帶、十二指腸懸韌帶**：膜狀或帶狀，規則要求有厚度、兩端接在正確附著點；附著點由使用者核對，風險高、價值低，建議資訊卡。
7. **胃的黏膜皺襞、腸的環狀皺壁、結腸袋**：內表面或表面起伏，建議資訊卡，結腸袋用表面標示。
8. **管狀自建（總膽管、副胰管、耳咽管、耳蝸管、腎小盞與大盞、肛管）**：風險較低，但仍要在 3D 畫面檢查貼合、不浮空不穿模；腎盞要接在 C3 的腎乳突與腎盂上，數量（站上腎 9 至 11 個乳突）與 HRA 一致才合理，且個體差異大，標示為示意。

### 5.3 共通風險

- **對位**：HRA 每件器官都在自己的座標系（公釐，Visible Human 標本），BodyParts3D 的血管、神經、韌帶與骨是依 BodyParts3D 的器官位置放的。若直接以 HRA 取代 BodyParts3D 器官，肝門、腎門、脾門與血管的相接處會對不上。建議的做法：把詳細模式做成像眼那樣的獨立場景（只含 HRA 器官與必要的自建管，不含 BodyParts3D 血管），或另外做對位並在 3D 畫面逐一檢查。
- **標本與側別**：IE-Map 與 OpenEar 是不同標本，側別在資料內未標示；耳詳細模式若只做單側（左），需先確認側別，鏡射的網格要反轉面的繞向（`micro-atlas.tsx` 已有這個處理）。
- **兩套耳資料合併**：OpenEar 有耳蝸的前庭階與鼓階，IE-Map 也有；若兩套同時用，耳蝸會重複，應二擇一為主並以其中一套作為座標基準，另一套對位上去；半規管只有 IE-Map，聽小骨、鼓膜只有 OpenEar，兩套之間的相對位置（例如鐙骨底板與卵圓窗）靠對位而不是量測，**位置關係需要使用者核對**。
- **現成模型品質**：本次沒有看任何候選在 3D 畫面的樣子；頂點數低的網格（OpenEar 聽小骨 1,000 至 2,000 頂點）放大後可能看得出多邊形，需要平滑化或選用完整集的高密度版本（但完整集單檔極大）。
- **授權與署名**：C3、C1、C5、C6 都是 CC BY 4.0，改作要註明修改，不可暗示作者背書；署名集中在 `public/ATTRIBUTION.md` 與 `public/model_sources.json`，並補上 IE-Map 現在缺的條目。

## 6. 需要使用者確認的來源與授權清單

| 編號 | 名稱 | 授權 | 網址 | 用途 | 目前狀態 |
| --- | --- | --- | --- | --- | --- |
| C3 | Human Reference Atlas 3D Reference Object Library（HuBMAP）：liver-male v1.2、kidney-male-left／right v1.3、renal-pelvis-male-left／right v1.0、pancreas-male v1.3、small-intestine-male v1.2、large-intestine-male v1.3、spleen-male v1.3（視需要另含 omentum-male v1.0） | CC BY 4.0 | https://apps.humanatlas.io/api/v1/reference-organs 、https://humanatlas.io/3d-reference-library | 肝、腎、胰、小腸、大腸、脾詳細模式的主要網格 | 站上已用過同一套的其他器官；這幾件需使用者確認 |
| C1 | IE-Map 內耳圖譜（含 David 2016、Wimmer 2019 的資料） | CC BY 4.0 | https://github.com/pydsgz/IEMap | 耳詳細模式的內耳；並改為本地檔不依賴外部下載 | 站上已在用（入口隱藏、外部下載）；需確認授權並補署名 |
| C5 | OpenEar 人類顳骨三維模型庫（Sieber 等）；範例集 Delta | CC BY 4.0 | https://doi.org/10.5281/zenodo.1473724 、https://doi.org/10.5281/zenodo.4362584 | 聽小骨、鼓膜、外耳道、顳骨內顏面神經與鼓索神經、蝸神經 | 新增來源；需確認，並決定用範例集（約 4.9 MB，已看過）還是完整集（單檔 4 至 14 GB，只取 PLY） |
| C6 | 人類骨迷路資料（Wimmer 等） | CC BY 4.0 | https://doi.org/10.5281/zenodo.3355272 | C1 的備案 | 建議不需要 |
| C4 | Z-Anatomy 官方（固定提交 6c7f901…） | 整體 CC BY-SA 4.0＋BodyParts3D CC BY-SA 2.1 Japan；**含 NC 改作件（腎、內耳）** | https://github.com/LluisV/Z-Anatomy | 備案：總膽管、副胰管、乙狀結腸、聽小骨與耳咽管的對照 | 建議不用；若要用須逐件排除 NC 件，且出處不明；請使用者決定 |
| C2 | BodyParts3D 4.0（已在 repo） | CC BY 4.0 | https://dbarchive.biosciencedbc.jp/en/bodyparts3d/ | 胃、膽囊、腎上腺與其他器官的整體網格 | 已在用 |

**建議不使用、不需要確認**：NIH 3D 的 Stomach 3DPX-021124（權利人不一致）、Sketchfab 上的耳模型（出處不明、需登入）、商店模型、IHA 資料庫（NC）、Dundee 內耳與 lissiecowley 腎臟（NC）、第三方複本 nqwrc/3d-anatomy（整體非商用）。

## 7. 被網路擋住或無法確認的事項

- **被擋住**：`github.com` 的網頁與 API 從本環境用 `curl` 回 403（`WebFetch` 可讀網頁）；`dbarchive.biosciencedbc.jp` 可連線（授權頁與零件表已讀），`lifesciencedb.jp` 連線被重置；`anatomytool.org`、`opensource-anatomy.org` 無法連線；Nature 網站被導向登入頁（改用 Europe PMC 讀論文全文）；`morphosource.org` 回 500。
- **沒有下載**：OpenEar 完整集的任一標本（單檔 4 至 14 GB）、C6 的 ZIP、Z-Anatomy 的 FBX 內網格（只讀節點名稱）。沒有看任何候選網格在 3D 畫面的外形。
- **無法確認**：
  - IE-Map 與 OpenEar 的側別（左或右）；
  - OpenEar 完整集 PLY 的實際頂點數與是否含半規管（論文的分割清單沒有）；
  - HRA 腎盂是否含腎大小盞；
  - HRA 各器官之間的相對位置是否可直接併用（每件各自座標）；
  - Z-Anatomy 各件網格的原始出處（FBX 沒有紀錄）；
  - BodyParts3D 站上肝節段命名（Hepatovenous segment II 至 IX）與常用八節段的對應；
  - BodyParts3D External ear 是否含耳殼細節、Ileocecal junction 是否含盲腸、降結腸是否含乙狀結腸段（都需在 3D 畫面確認）；
  - IE-Map 畫面上的署名「LMU Munich」是否為正確的單位名稱（README 只列作者與論文）；
  - NIH 3D 全站條目（只看了搜尋引擎找到的一件）。
- 耳的結構範圍沒有課程資料可對照，請使用者補上遺漏（例如是否要含聽覺傳導路徑、內耳血管、耳的神經支配細節）。

## 8. 建議的下一步（等使用者決定）

1. 先確認第 6 節的 C3、C1、C5。
2. 內臟：以 C3 為主，一個器官一個 PR（建議順序：腎與腎上腺、肝、胰與膽道、小腸、大腸、脾、胃），每個 PR 要：固定來源 URL 與 sha256、轉成站上格式、對位並在多個角度截圖檢查、補 `public/ATTRIBUTION.md` 與 `model_sources.json`、寫自己的說明與雙語名稱、解剖內容 PR 一律人工審核。
3. 耳：先做「把 IE-Map 改成本地檔並補署名」（只動來源與署名，不改解剖內容），再決定 OpenEar 的使用範圍與耳的第二個 PR。
4. 胃與膽囊沒有現成來源，建議用既有網格的表面標示做分區，不新增網格。
5. 第 5.2 節的有機形狀（鼓室腔、肌肉、腎上腺兩層、腎周脂肪、各韌帶）逐項決定做或只放資訊卡。
