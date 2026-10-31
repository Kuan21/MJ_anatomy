# REVIEW_LOG

最後更新：2026-10-30。規則：只改介面、效能、腳本、文件的 PR 在 `build` 通過後自動 merge；涉及模型、示意模型、解剖內容、名稱、Quiz 資料的 PR 標【需人工審核】，**一律不開 auto-merge**，等你確認。

## 肺標籤修正 PR B（肺門、資訊卡欄位、分類、分類上色；【需人工審核】，不自動 merge）

截圖（左：修正前，右：修正後）在 `pr-screenshots` 分支 `lung-labels-2026-10-31/`（commit `c8c55fa`；網址 `https://raw.githubusercontent.com/Kuan21/MJ_anatomy/c8c55faaba70c80aede5802917c364e79fbd532e/lung-labels-2026-10-31/<檔名>`，檔名 1-left-labels 至 12-right-labels-light-after，皆回應 200）。本機重現：`npm run build`，`npx vite preview`，開 `/?mjview=1`，底部按鈕「肺」，選左肺或右肺，開「名稱標籤」；截圖腳本 `NODE_PATH=<playwright> node scripts/browser/lung-shots.cjs <port> <輸出資料夾> <標籤> [before|after|dark]`。

| 項目 | 找到的原因（修正前） | 處理 |
| --- | --- | --- |
| 1 左肺門散成多塊 | 肺門面片是「離主支氣管、肺動脈、上下肺靜脈 14 mm（靜脈 12 mm）內且朝向它們的三角形」的聯集，兩個肺葉各取一次、四個構造各取一次，結果是散在縱隔面的多塊 | 改成單一區域：以四個肺根構造貼到肺葉的點取平均作中心，區域是肺葉表面上離中心一個剛好蓋住這四點的半徑（20 至 34 mm）內、朝向縱隔的部分。位置欄寫「左肺縱隔面」。選取肺門時，另外用原有網格亮出肺動脈（紅）、上下肺靜脈（藍）、主支氣管（橘），可看出三者關係；沒有任何假模型 |
| 2 資訊卡欄位 | 肺表面面片的卡片一律用「位置／構造與毗鄰關係／血液供應與神經」三欄，壓跡原因、肺段、位置關係都被塞進「血液供應／神經」 | 依構造類型改欄位，沒有內容的欄位不顯示。壓跡：位置、壓出的構造、相鄰壓跡；肺門：位置、內容物、排列（動脈、靜脈、支氣管的上下前後關係，膈神經在前、迷走神經在後）；肺葉與舌葉：位置、包含的肺段、邊界（裂、切跡）；其他肺構造（肺尖、緣、膈面、裂、心切跡）：位置、毗鄰構造。Quiz 的答題卡同步。肺葉五個（原本沒有專屬卡）也補上這三欄 |
| 3 分類與解剖深度 | 全部面片都歸「表面標記」，且都顯示解剖深度 | 壓跡、溝、接觸區 →「壓跡」；舌葉 →「肺葉部分」；肺門、肺尖、緣、膈面、裂、心切跡 →「肺的結構」；肺葉 →「肺葉」。壓跡、肺葉與其他肺表面構造不顯示「解剖深度」（肺動脈、肺靜脈、主支氣管、肺韌帶仍顯示） |
| 4 左肺氣管接觸區 | — | **已移除（左肺）**。跑考摘要（`docs/paokao-checklist.json`）沒有氣管接觸區；解剖上左肺縱隔面與氣管之間隔著主動脈弓，標準圖譜只畫右肺有。右肺氣管接觸區同樣不在摘要裡，但右肺確有此接觸，且你的上色表有「氣管接觸區」，先保留，請你決定。Quiz 因此由 45 題變 44 題 |
| 5 分類上色 | — | 九類（動脈紅 A、靜脈藍 V、消化道與氣道橘 T、心與胸腺紫 C、骨性壓跡米 R、肺的部分與表面青 P、肺裂深綠 F、緣灰藍 B、肺門與韌帶黃 H）。模型：表面面片用貼花畫半透明色（只在上色開啟時繪出，不與肺葉搶深度），原有網格（肺動脈、靜脈、主支氣管、支氣管動脈）與底色混 55%；標籤：同色淡底、粗左邊框、同色引線、字母徽章；右側肺面板「名稱標籤」下有圖例，每類一個開關，另有總開關「分類上色」；標籤依區域螢幕高度排序，同類盡量相鄰（不增加交叉才交換）。選取仍用 PR A 的細外框，不用綠色 |

- **深色模式：** 網站目前沒有深色主題（`color-scheme: light`，3D 背景固定淺灰）。標籤與引線備有 `prefers-color-scheme: dark`／`.dark` 版本（顏色提亮、深底淺字），面板與圖例維持淺色；深色截圖是用瀏覽器的深色偏好模擬，3D 背景仍是淺色。是否要全站深色主題請你決定。
- **「線」類（肺裂、緣）：** 模型上是肺葉表面的窄帶（肺裂寬約 2.5 mm 內、緣寬約 11 至 16 mm），以同樣貼花上色，不是另畫的線。
- **同類檢查（左右肺全部標籤）：** 右肺 23 個、左肺 22 個標籤（第 1 肋溝從內側看不到，不顯示）全部有分類；左右肺的壓跡欄位依新格式；主支氣管、肺動脈、肺靜脈、支氣管動脈是原有網格的卡片，欄位維持原樣（器官類的「血液供應／神經」對支氣管是合適的欄位）。
- **跑考摘要用詞差異：** 肺尖、第 1 肋溝、胸腺接觸區、氣管接觸區、前緣、下緣、膈面、肺門、上腔靜脈溝、下腔靜脈溝、食道溝不在摘要的肺清單裡（摘要「可以多不可以少」，這些是為標籤加的）；名稱沿用既有，請核對。
- **沒有（不假造）：** 右上葉支氣管、中間支氣管、肺門淋巴結、胸膜返折袖套（同肺 PR 2）。
- **驗證：** `node scripts/test-lung-categories.mjs`（併入 `npm run check`）。畫面確認：截圖為正式 build（`vite build` + `vite preview`）。

## 肌腱與韌帶 第 1 批：上肢（【需人工審核】，不自動 merge）

PR 編號：#147。依 `docs/tendon-ligament-inventory.md` 與你「照建議做」的決定建置；下肢、胸腔、背部各由之後的 PR 接續，並共用這一批的系統分類、顏色、介面、Quiz 類別、切分工具與 Z-Anatomy 備份流程。

**共用基礎（之後各批直接沿用）**
- 新增系統「肌腱｜Tendons」（左側面板可單獨開關、資訊卡、搜尋、Quiz 第 9 個類別「肌腱」；Quiz 第 1、2 級仍共用同一題庫，`check-quiz-banks` 通過）。顏色為白色帶銀色光澤（粗糙度 .28、金屬度 .35），與肌肉（紅）、韌帶（灰綠）明顯不同。名稱含 tendon 的結構（跟腱、股四頭肌腱等）也歸入此類。
- 切分工具：`scripts/lib/tendon-cut.mjs`、`tendon-build.mjs`、`tendon-set.mjs`，規格在 `scripts/tendon/*.mjs`。把肌肉網格在「橫截面積降到最大值 20 %」處切成肌肉與肌腱兩件，兩件共用切口頂點（沒有縫隙、沒有重疊）；肌腱件細分兩次並平滑（切口固定），所以是平滑的帶或索。肌肉件沿用原 id 與名稱。`node scripts/review-tendon-cuts.mjs <資料夾> right` 會為每條肌腱輸出紅（肌肉）白（肌腱）截圖供審核切點。
- 動作：切開的肌肉與肌腱用「整條原肌肉」的包圍盒當動作綁定（`app/biomechanics-v2/tendon-bindings.json`），權重只依靜止位置計算，因此兩件的動作與未切開時完全一致，接合處不會裂開；肌腱也套用同樣的纖維變形。
- Z-Anatomy（CC BY-SA 4.0，只用 LluisV/Z-Anatomy，不用 nqwrc）：`scripts/extract-zanatomy-limb.mjs` 備份到 `scripts/data/zanatomy-upper-limb.json.gz`（公分轉公尺，依雙方共有的骨骼做一個相似變換對位：腕部殘差 0.2 mm、肩部約 3 mm），建置時不再連網。釘住的 commit 是本機副本的 HEAD `6c7f9016…`，我這個環境無法連到 GitHub 上游核對該 commit 是否存在，請你確認。ATTRIBUTION.md 與 model_sources.json 已新增條目，並更正「Z-Anatomy 裡都沒有」的舊說法。

**新增的結構（左右各一）**
| 結構 | 來源 |
| --- | --- |
| 肱二頭肌長頭腱、肱二頭肌遠端腱、肱三頭肌腱、肱橈肌腱 | 從肌肉網格切分 |
| 橈側屈腕肌腱、掌長肌腱、尺側屈腕肌腱、屈指淺肌腱、屈指深肌腱、屈拇長肌腱 | 從肌肉網格切分 |
| 橈側伸腕長肌腱、橈側伸腕短肌腱、伸指肌腱、伸小指肌腱、尺側伸腕肌腱、外展拇長肌腱、伸拇短肌腱、伸拇長肌腱、伸食指肌腱 | 從肌肉網格切分 |
| 掌腱膜 | 掌長肌網格在屈肌支持帶遠側緣以遠的部分（BodyParts3D 原有形狀） |
| 腕屈肌支持帶、腕伸肌支持帶 | Z-Anatomy（取代原本的皺褶片與薄片） |
| 腕背第一至第六伸肌間隔 | Z-Anatomy |
| 屈肌總腱鞘、屈拇長肌腱鞘、橈側屈腕肌腱鞘、結節間腱鞘 | Z-Anatomy |
| 喙肩韌帶、肋鎖韌帶、肩胛上橫韌帶（重做）、肩胛下橫韌帶 | 程序生成的帶（示意：附著點在骨網格上實測，寬度與厚度為典型值） |

**還缺的（誠實清單）**
- 旋轉肌袖四條肌腱（棘上、棘下、小圓、肩胛下）、三角肌、胸大肌、胸小肌、背闊肌的肌腱：這些肌肉的動作綁定是逐頂點對照原網格（`shoulder-attachments.json` 等以頂點雜湊鎖定），切開要重新擬合，留到肩部專案；背闊肌來自 3.0 補充包也要另外處理。
- 肱二頭肌短頭沒有切（它的遠端離橈骨粗隆約 3 cm，與長頭切出的遠端腱接續處是重疊而非焊接）；腋鞘仍是舊的圓管；錐狀、斜方韌帶與肘橈／尺側副韌帶的平滑重做、指背腱帽、手指纖維鞘與滑膜鞘（Z-Anatomy 有，未取）都沒做。
- 解剖鼻煙盒、腕隧道等空間沿用舊示意，沒有動（另案）。腕隧道輪廓因屈肌支持帶換成 Z-Anatomy 版本而重算（`app/space-shapes.json`）。

**誠實的限制**
- 切點由面積比例自動決定（各肌腱可在 `scripts/tendon/upper-limb-cuts.mjs` 調 `tau`），是解剖判斷，請你看截圖審核。
- 多個肌腹的肌腱（肱三頭肌三頭、尺側屈腕肌兩頭、屈指淺肌兩個網格、尺側伸腕肌兩個網格）在同一高度切開；肌腱件各自是一個部件，共用同一個結構（點哪一件都選到整條）。
- 肩部的喙肩、肋鎖、肩胛橫韌帶是示意帶，我只在離線渲染確認位置；關節屈伸（腕、肘、肩外展）前後截圖沒有取得，動作時的接合未在 3D 畫面確認。
## 全站顯示問題修正 PR A（選取外框、肺面片、脛骨點狀、淡化；【需人工審核】，不自動 merge）

截圖（左：修正前，右：修正後）在 `pr-screenshots` 分支 `fix-display-2026-10-31/`。每項先寫原因再修；同類問題一併處理並列在 PR 說明。
- **選取外框太粗、白色碎片（心中靜脈）：** 心臟頁的外框是「往外推 2.6 mm 的加色混合外殼」，疊在淡粉色心外膜上變成白色，外殼與相鄰表面相交處形成鋸齒碎片；隱藏部分的虛線層底色透明度 .42 也加深了白霧。主圖譜的選取（血管／空間內容物）另有白色邊緣光，而且選取結構往鏡頭拉的量是裁切空間的 0.002，遠看時約 3 cm 至 20 cm。改為：心臟頁外框 0.4 mm 深薄荷＋1.2 mm 一般混合的薄荷暈、放在表面後方（polygon offset）、隱藏層底色降到 .16；主圖譜白色邊緣改為約 2 px、同色系較深的細線（用 fwidth 量），往鏡頭拉改為沿視線 8 mm（懸停 4 mm）。選取時的薄荷填色維持原樣（需你確認是否也要取消）。
- **肺表面白色破碎斑塊：** 肺面片（心壓跡、溝、肺門等）是另一層網格，法線與肺葉不同而顯得偏亮、邊緣鋸齒；且「擋住對焦結構的東西自動淡化」會把壓在肺面上的面片當成擋住的東西，變成半透明白色碎片。面片改為貼花：只在選取或懸停時繪出，其餘不繪（仍可點選、可由標籤開啟）；自動淡化略過面片與骨性標記，且只用於單一或少數結構的對焦，整個區域（肺、四肢）不再自動淡化。
- **脛骨點狀、網狀：** 找到的原因有兩個。(1) 「脛骨粗隆」是浮在脛骨上 0.4 mm、同色的另一層網格（骨性標記），與脛骨搶深度，近看是亮色鋸齒貼片。(2) 材質的 shader 靠 onBeforeCompile 加料，但不同材質的 program 快取鍵相同，會共用先編譯的那一份，造成貼花／淡化版的碼套到別的材質上，狀況依載入順序而異。改為：骨性標記同樣是貼花，並給每個材質自己的 program 快取鍵。
- **淡化讓相鄰結構變白：** 淡化版把顏色往白色混 50%，改為 15%（保留原色，只降透明度）。
- 同類檢查：左右肺都套用；所有骨骼的標記（結節、粗隆、嵴等）走同一材質；Quiz、腦部檢視器的選取外殼本來就是細線（0.4 至 0.9 mm，未改）。

## 肌腱與韌帶盤點（Step 1，只盤點；【需人工審核】，不自動 merge）

報告：`docs/tendon-ligament-inventory.md`。沒有改任何模型或程式，等你確認做法後才開始建置。
- **主因不是「沒有肌腱」：** BodyParts3D 把肌腱畫在肌肉網格裡（我量了 40 多對，絕大多數肌肉網格一路延伸到止點骨，差 ≤ 2 mm），所以畫得出來，但不能單獨選取。匯入時沒有濾掉任何東西。
- **數量（跑考清單明列 41 項）：** (a) 已有且正常 19、(b) 粗糙或不準 16、(c) 包在肌肉內 5、(d) 完全沒有 1；由清單肌肉推得的肌腱 42 條（40 條 (c)、2 條 (d)）；你點名或我建議補充的 24 項（(b) 5、(c) 2、(d) 16、無法判定 1）。分區數字見報告第 0.1 節。
- **完全缺少的：** 掌腱膜、腕背六個伸肌間隔與各腱鞘、屈肌總腱鞘、結節間腱鞘、鵝足、比目魚肌腱弓、動脈韌帶、踝外側三條韌帶、三角韌帶完整、彈簧韌帶、喙肩韌帶、肋鎖韌帶、肩胛下橫韌帶。
- **粗糙的：** 肩胛上橫韌帶（細方棒）、股四頭肌腱與髕韌帶（等寬平片，且與肌肉網格內的腱重疊）、各支持帶（1.2 mm 薄片，沒有包住肌腱）、足底腱膜（沒到趾）、腓側副韌帶（240 頂點）。
- **開放資料：** Z-Anatomy 肌肉檔（CC BY-SA 4.0）有腕與踝各支持帶、腱鞘、掌腱膜、足底腱膜、胸腰筋膜三層等獨立網格，本專案目前沒用；HRA（CC BY 4.0）有股四頭肌腱、髕韌帶與膝部韌帶（女性）。建議：肌腱用「從肌肉網格分離」、支持帶與鞘優先取 Z-Anatomy、缺的韌帶由骨附著點生成。
- **需你決定：** 範圍（只含清單明列，或含所有清單肌肉的肌腱）、分離做法、Z-Anatomy 授權解讀與來源（原倉庫 FBX 或 nqwrc）、10 個 8 頂點方塊空間是否一併處理等，共 8 題，在報告第 8 節。

## 全站 Bug Audit（2026-10-30，只報告、沒有修改；文件 PR，CI 綠後自動 merge）

報告：`docs/BUG_AUDIT.md`（P0 11、P1 12、P2 38、P3 35）。截圖在 `pr-screenshots` 分支 `audit-2026-10-30/`。最優先：
- **P0-01**：腦部資訊卡「別名」顯示筆記片段（「下圖藍色路徑」「同側延腦」等），可被搜尋。
- **P0-02～P0-07**：名稱比對用子字串造成的錯誤（上頜神經→腋神經、神經分支變母神經、Netter 名稱搬動左右字、更正側別後中文未跟著改、足部肌用手部名稱、「滑車」）。
- **P1-01**：示意模型第 0 包每次載入失敗（`isShellSurface` 的 `/pericardi/` 匹配到 pericardiophrenic），膈神經、喉返神經、內臟神經、迷走神經幹、臂神經叢內外側束等 61 個結構目前看不到。
- 修正一律等你審核後分批開 PR（報告最後有建議分批）；涉及解剖內容者標【需人工審核】。

## 關節資料的膜、聯合與脂肪墊（Bug Audit P2-19 的 64 個未繪出關節節點；【需人工審核】，不自動 merge）

PR [#PRNUM](https://github.com/Kuan21/MJ_anatomy/pull/PRNUM)。`joints.glb` 有 64 個節點之前被 `includeJoint` 排除，卻仍列在搜尋裡（選了 3D 沒有東西）。處理：**改為畫出**肋間外膜、肋間內膜、閉孔膜、方形膜（左右各一）、恥骨聯合、薦尾聯合、髕下脂肪墊（左右）共 12 個（跑考清單有 external intercostal membrane）；**從搜尋移除**椎間盤 23、髓核 23、前臂與小腿骨間膜 4（主圖譜本身已有這些）與三放射軟骨 2。篩選規則移到 `app/biomechanics-v2/joint-filter.ts`，檢視器與搜尋索引共用。膜用較淺的片狀色、脂肪墊淡黃、聯合用纖維軟骨色。模型本身是 Z-Anatomy 既有網格（CC BY-SA 4.0，已在 ATTRIBUTION），沒有新造形狀。

## 懸停名稱、點空白取消選取、手機資訊卡與標題（Bug Audit P3-05、P3-06、P2-11、P3-35；介面，CI 綠後自動 merge）

PR [#154](https://github.com/Kuan21/MJ_anatomy/pull/154)。滑鼠移到結構上會高亮並顯示英文＋中文名稱（之前只在拆解模式才有、只有英文原名）；點到空白處取消選取並關閉資訊卡；手機上選取結構時，取景只用資訊卡上方的空間，結構不再被卡蓋住；手機首頁隱藏「INTERACTIVE ANATOMY ATLAS」小標、標題寬度限制，不再與右上按鈕重疊。不改模型與解剖內容。

## 全站顯示問題 A（選取外框、肺面片、骨性標記貼花、淡化；【需人工審核】，你已確認合併）

PR [#152](https://github.com/Kuan21/MJ_anatomy/pull/152)（另一個 session 開的）。選取外框改細、肺面片與骨性標記改貼花、材質 program 快取鍵、淡化不再變白。你 2026-10-31 回覆「152 ok」後以 squash 合併。PR 說明寫明未在真實 GPU 上確認脛骨點狀問題，請在你的裝置看一次。

## Quiz 第二級判分放寬與容錯（Bug Audit P1-09 部分、P2-34、P2-35、P2-36、P3-28；【需人工審核】，不自動 merge）

PR [#148](https://github.com/Kuan21/MJ_anatomy/pull/148)。只改 `app/quiz/naming.ts` 的判分與 `scripts/test-quiz-naming.mjs`；題庫、模型、名稱、同義詞表都沒有改。依你 2026-10-30 的指示：

- **整條肌肉名可答「部分」題（算答對）**：題目是某肌肉的「…part／head of …」時，寫整條肌肉的英文或中文都算對（需要左右時仍要寫左右）。適用 29 種結構（左右各一，共 58 題）：胸大肌腹部／鎖骨頭／胸肋頭、三角肌肩峰部／鎖骨部／肩胛棘部、斜方肌升部／降部／橫部、尺側腕屈肌肱骨頭／尺骨頭、旋前圓肌肱骨頭／尺骨頭、拇收肌斜頭／橫頭（手）、拇收肌斜頭／橫頭（足）、拇短屈肌淺頭（手）、拇短屈肌外側頭／內側頭（足）、腓腸肌外側頭／內側頭。
- **一定要寫出哪一個頭（寫整條肌肉只算「接近」，列入錯題）**：肱二頭肌長頭／短頭、肱三頭肌長頭／外側頭／內側頭、股二頭肌長頭／短頭（程式表 `HEADS_REQUIRED`，另含 quadriceps femoris 備用；股四頭肌四個頭本來就是獨立名稱）。
- **對立詞不算拼字接近**：major／minor、longus／brevis、medial／lateral、anterior／posterior、superior／inferior、superficial／deep、internal／external、proximal／distal、ascending／descending、maximus／minimus、大／小、長／短、內／外、前／後、上／下、淺／深、升／降、近／遠。例：題目大菱形肌寫「小菱形肌」現在判錯（之前判接近並顯示「正確拼法」）。
- **容錯**：左右字位置不限（Left acromial part of deltoid ＝ Acromial part of left deltoid）；「左側／右側」＝「左／右」；縮寫 n.、nn.、a.、aa.、v.、vv.、m.、mm.、lig.、br. 展開；簡體字讀成繁體（107 個解剖常用字對照表，在 `naming.ts`）。
- **中線結構保留左右**：右心室乳突肌不再算「左心室的一部分」；左冠狀動脈題寫右冠狀動脈分支不再判接近。
- 已知連帶效果：上肢「Flexor pollicis brevis」與「Superficial head of flexor pollicis brevis」都接受「flexor pollicis brevis」；胸腔「Descending aorta」與「Descending thoracic aorta」原本就共用「降主動脈」同義詞（既有，未改）。

## 搜尋體驗（Bug Audit P2-19 部分、P2-20、P2-12、P3-09；介面，CI 綠後自動 merge）

PR [#151](https://github.com/Kuan21/MJ_anatomy/pull/151)。搜尋無結果時顯示提示文字；心臟詳細模式才有的 37 個構造（界嵴、卵圓窩、節制索、室上嵴、冠狀動脈分支等）可在主搜尋找到，選取後開啟心臟詳細模式並選中；搜尋可寫 deltoid muscle、biceps brachii m.、radial n.、brachial a. 等課本寫法與複數；簡體字對照表補上 帶結葉輸額鎖門 等約 100 字；「頭部」分頁搜尋到頸部以下的構造時自動回到全身視圖；搜尋面板的回呼改為穩定參照，打字與拖動關節不再重繪面板。不改模型與解剖內容；心臟頁構造與主圖譜同名異寫（如 Aortic arch／Arch of aorta）的合併屬名稱資料，另案處理。

## 載入穩健性（Bug Audit P2-02 部分、P2-03、P2-14、P2-16、P3-10、P3-12；介面與載入程式，CI 綠後自動 merge）

PR [#150](https://github.com/Kuan21/MJ_anatomy/pull/150)。載入失敗時顯示「部分結構未載入（N 組）· 重試」文字並 `console.error` 原因；沒有 `DecompressionStream` 的瀏覽器改用 fflate 解壓；補充資料包其中一包失敗不再讓整個圖譜失敗（列出缺的包並提供重新載入）；逾時改為「60 秒沒有收到資料」才算；載入目錄後清掉 Cache Storage 中舊版本的資料包；切換畫面時 chunk 已被新部署刪除（`vite:preloadError`）或畫面出錯時顯示重新載入提示而不是白頁；動作警告改為可關閉的提示，不再顯示致命錯誤框。不改模型與解剖內容。

## 「只練錯題」另一側題目載入（Bug Audit P1-10；Quiz 流程，CI 綠後自動 merge）

PR [#149](https://github.com/Kuan21/MJ_anatomy/pull/149)。`sceneStructures` 永遠保留題目本身：以左側或雙側答錯後，回到設定（右側）按「只練錯題」，左側題目的 mesh 現在會載入並可點選；其他結構仍依側別設定。取景原本就會把題目範圍併入。不改題庫、模型與解剖內容。

## 點選與觸控（Bug Audit P2-11、P2-12、P2-13；介面，CI 綠後自動 merge）

PR [#146](https://github.com/Kuan21/MJ_anatomy/pull/146)。淡化、漿膜、鞘、筋膜、腱膜與半透明肺葉只在射線上沒有實心結構時才被選到；精確射線沒打中時在指標周圍兩圈再試（滑鼠 4／8 px、觸控 8／16 px）；觸控雙指改為縮放＋平移。不改模型與解剖內容。

## Reset、相機與鍵盤（Bug Audit P2-08、P2-09、P2-10、P3-08；介面，CI 綠後自動 merge）

PR [#144](https://github.com/Kuan21/MJ_anatomy/pull/144)。Reset 一併清除特殊區域、分層選取、錯誤框、關於面板；`fit()` 取消進行中的對焦動畫；主圖譜／心臟／腦部頁縮放視窗保留使用者視角；Esc 依序關面板、關於、資訊卡。不改模型與解剖內容。

## 介面文字中文化（Bug Audit P2-04、P2-15、P3-01～03；介面，CI 綠後自動 merge）

PR [#141](https://github.com/Kuan21/MJ_anatomy/pull/141)。系統清單加中文名、搜尋面板與面板按鈕中文化、資訊卡與腦部頁按鈕雙語、錯誤訊息與 aria 中文；頁首、性別按鈕、心臟頁與腦部頁不再顯示模型來源名稱（集中在 Source & credits）；取消強制大寫；`lang="zh-Hant-TW"`。不改模型與解剖內容。

## 搜尋韌帶／頸部血管／腦構造後 3D 有反應（Bug Audit P1-04、P1-05、P1-06；介面，CI 綠後自動 merge）

PR [#139](https://github.com/Kuan21/MJ_anatomy/pull/139)。關節組織可高亮、取景、點選、Isolate；頸部血管以本身名稱開卡並高亮；腦構造改為開啟腦部詳細模式並選中（`#/organ/brain?select=…`），不再讓主圖譜重載；搜尋索引只收實際繪出的關節組織（349 → 285）。不改模型與解剖內容。

## 示意模型資料包載入失敗修正（Bug Audit P1-01；【需人工審核】，不自動 merge）

PR [#135](https://github.com/Kuan21/MJ_anatomy/pull/135)。`isShellSurface` 的 `/pericardi/` 誤中 pericardiophrenic 血管，整包 61 個示意結構（膈神經、喉返神經、內臟神經、迷走神經幹、臂神經叢內外側束等）從未載入成功，載入條停在 98%。改為整詞比對、材質退回系統材質、`test-scene-loading --full` 改為合併全部六個資料包。程式不改模型資料，但這 61 個示意模型是第一次出現在網站上，請你看過畫面再合併。

## 保密檢查補強與腦部卡片別名清理（Bug Audit P0-01、P2-27；【需人工審核】，不自動 merge）

PR [#136](https://github.com/Kuan21/MJ_anatomy/pull/136)。筆記自動帶入的別名先過濾（圖說、比較列、句子片段不再寫進卡片），19 筆別名從 `neuro-cards.json` 移除（清單在 PR）；抄寫比對改逐字並涵蓋 CSF、心臟、腦部、資訊卡、Quiz、示意卡文字；`check-no-notes` 補禁用字；規則集中在 `scripts/lib/notes-leak.mjs`。請核對移除的 19 筆別名。

## 肺部聚焦視圖修正（「肺 | Lungs」，需人工審核，不自動 merge）

截圖：`docs/lung-focus/`（左：修正前，右：修正後，標題與變動像素比例寫在圖上）。驗證：`node scripts/test-lung-focus.mjs`（已併入 `npm run check`）；瀏覽器端用真實滑鼠逐一點擊每個控制項：`node scripts/browser/lung-focus-ui.cjs <port> <輸出資料夾> <標籤>`（需要 Playwright，手動執行，CI 沒有）。

| 項目 | 找到的原因 | 處理 |
| --- | --- | --- |
| 1 面板按鈕無反應 | 右側「關節系統與動作」整欄（`.right-workspace`，z-index 17、全高、透明）蓋在肺面板（z-index 7）上，所有點擊都落在那一欄。用 `elementFromPoint` 量到 6 個控制項中心點全部是 `right-workspace`。事件處理與狀態都有接好，不是程式邏輯問題 | 聚焦視圖開啟時右側欄讓開（`display:none`），肺面板 z-index 提高。Playwright 真實點擊：雙側／左肺／右肺、＋／－、透明度滑桿、兩個新開關全部通過 |
| 2 白色斑塊與破洞 | 沒有找到網格破洞：5 個肺葉原始檔是封閉、定向一致、體積為正的流形。看到的白斑與破口有四個來源：(a) 肺葉材質太亮太光滑（光源總和＋房間環境光，粗糙度 .62），朝向主光的上葉被曝成純白；(b) 半透明肋骨用 4×4 點狀圖樣／alpha-to-coverage 淡化，蓋在肺上形成一條條白色點狀斑；(c) 肺表面標記（心壓跡、溝、肺門）是貼在肺葉上的同位面片，用更深的粉紅色，與肺葉 z-fighting，邊緣破碎；(d) 壁層胸膜原本是「把肺葉往外推 5 mm、丟掉相鄰三角形」的外殼，肺裂與肋膈隱窩處被撕開，內部穿出來 | (a) 肺葉改為單一消光材質（粗糙度 1、環境反射 .35、只畫正面）；(b) 見第 6 項；(c) 標記與肺葉同色，加 polygon offset，只有選取時才會高亮；(d) 壁層胸膜改為肺的封閉包絡面（體素閉合填補肺裂＋有號距離場＋marching tetrahedra）向外 5 mm，一整片無撕裂 |
| 3 顏色統一 | 肺葉同一材質，但標記面片較深、肋骨點狀白斑、上葉曝光 | 肺葉與標記同一個粉紅，只有選取結構會變色 |
| 4 平滑化 | 原始體素分割的階梯狀表面；簡化到 16,000 三角形後保留階梯，著色出現刻面；肺裂雕刻的深度場以頂點取樣，邊緣呈鋸齒 | 肺葉先以原解析度做 Taubin 平滑（30 次，保體積）再簡化到 24,000 三角形，肺裂深度改用表面取樣＋10 次平滑，雕刻後再輕度平滑，法線用角度加權。尖銳邊比例（>60°）：肺葉 9–15 % → 2–5 %；壁層胸膜各部分 12–21 % → 0.3–2 % |
| 5 內部構造 | 模型有肺內分支：段支氣管樹約 120 個構造、肺段動脈／靜脈（含舌段）、肺動脈、肺靜脈，不需要補任何模型 | 面板新增「支氣管樹」「肺血管」開關（預設關，第 1 層維持肺葉、氣管、主支氣管、肺門）；第一次把透明度調低時自動打開兩者，之後可手動關。 |
| 6 胸廓半透明 | 淡化用 alpha-to-coverage（有多重取樣時）或 4×4 點狀圖樣（沒有時），本質都是「抽樣像素」，所以有點狀花紋 | 淡化的結構改由每個批次的「透明孿生批次」繪製：真正的 alpha 混合（30 %），不寫深度。手機與低記憶體裝置也適用（不再用點狀圖樣）。這同時改善其他用到淡化的畫面（另一側肢體、鏡頭擋住的結構） |

### 預設與第 2 層內容（驗證 #112／#115）
- 預設：肺葉不透明；第 1 層＝肺葉、氣管、主支氣管、肺門；第 2 層＝半透明胸膜（左右各：臟層 1 片、壁層 4 片＝肋部、縱隔部、膈部、頸部（胸膜頂））。肋膈隱窩做在壁層胸膜的下緣（下緣下推，前方 20 mm、側方 35 mm、後方 40 mm），不是獨立構造。
- **肋縱隔隱窩：沒有做**（模型中沒有這個構造，也沒有假造）。
- 肋骨位置量測（`node scripts/measure-lung-ribs.mjs`，用肋骨網格在同一薄片內的中心高度比對，誤差約 ±1 條肋骨間距＝約 25 mm，是粗略值）：
  - 肺下緣：鎖骨中線＝第 6 肋（右 −13 mm、左 −28 mm，即略低於第 6 肋）、腋中線＝第 8 肋（右 −5、左 −11 mm）、脊柱旁＝第 10–11 肋。與教科書 6 / 8 / 10 相符。
  - 壁層胸膜下緣：鎖骨中線在第 6 肋下 40–55 mm（約第 7.5–8 肋，目標 8，略偏高約半條肋）、腋中線＝第 9 肋（目標 10，**差約一條肋**）、脊柱旁＝第 12 肋（目標 12，相符）。腋中線處胸膜下緣偏高，沒有為了湊數字而調整。

### 肺 PR 2：內側面（縱隔面）名稱標籤與肺門（需人工審核，不自動 merge）
肺聚焦面板新增「名稱標籤」開關：選一側肺，鏡頭轉到內側面，用兩欄標籤加箭頭指向構造，標籤可點，點了打開該構造的資料卡（鏡頭不動）。標籤用英文在上、中文在下。箭頭終點一定落在構造自己的表面上（先取構造中心最近的點；那一點被肺葉擋住時，換成最近的看得到的點，用射線檢查）；從內側看不到的構造不顯示標籤。沒有補任何假模型：新增的 14 個面片全部是肺葉表面的一塊（與既有溝一樣，取離相鄰構造 4.5 mm 內且朝向它的三角形，或沿肺葉邊緣的一條帶），肺門構造用模型原有的網格。
測試：`node scripts/browser/lung-labels-ui.cjs <port> <輸出資料夾>`（Playwright，真實滑鼠；`SIDES=left` 或 `SIDES=right` 一次只測一側）。

| 構造 | 現況 |
| --- | --- |
| 右肺：肺尖、鎖骨下動脈溝、頭臂靜脈溝、上腔靜脈溝、胸腺接觸區、前緣、水平裂、斜裂、心壓跡、下腔靜脈溝、氣管接觸區、食道溝（＝食道接觸區與溝，同一面片）、奇靜脈溝、膈面、下緣 | 有（肺葉表面面片）；肺尖、第 1 肋溝、胸腺接觸區、氣管接觸區、前緣、膈面、下緣是本 PR 新增 |
| 右肺：第 1 肋溝 | 有面片，但從內側面看不到（在肺尖外上方），內側視圖不顯示標籤；選取肺尖外側時可見 |
| 右肺韌帶 | 有（結締組織，帶狀示意）；已標 |
| 右肺門：右主支氣管、右肺動脈、右上／下肺靜脈、支氣管動脈、肺門面片 | 有（模型原有網格；支氣管動脈是單一網格沿兩側主支氣管走，箭頭指向最近該側肺門的一點）；已標 |
| 右上葉支氣管（動脈上支氣管，位置最高）、中間支氣管 | 沒有：模型只有「右主支氣管」整條與段支氣管樹，沒有單獨命名的右上葉支氣管與中間支氣管；沒有為了標籤去切分網格，不假造 |
| 右肺門淋巴結、胸膜返折包圍肺門 | 沒有：模型沒有支氣管肺門淋巴結；胸膜返折只有第 2 層胸膜外殼，沒有肺門處的袖狀返折，不假造 |
| 左肺：肺尖、鎖骨下動脈溝、左頭臂靜脈溝、胸腺接觸區、前緣、斜裂、主動脈弓溝、降主動脈溝、心壓跡、心切跡、舌葉、食道壓跡、膈面、下緣 | 有（肺葉表面面片）；新增的同右肺 |
| 左肺：第 1 肋溝 | 有面片，內側面看不到時不顯示標籤 |
| 左肺心壓跡「更深」 | 同一面片，沒有表示深度的獨立構造 |
| 左肺韌帶 | 有；已標 |
| 左肺門：左肺動脈、左主支氣管、左上／下肺靜脈、支氣管動脈、肺門面片 | 有（模型原有網格）；已標 |
| 左肺門淋巴結 | 沒有 |
| 胸腺 | 模型有左、右葉，用來定義胸腺接觸區 |

英文發音：新結構名稱的單字（apex、area、border、bronchus、cardiac、contact、diaphragmatic、esophagus、fissure、hilum、horizontal、impression、ligament、lingula、notch、surface、thymus、trachea、groove 等）以 `PRON_MERGE=1 node scripts/fetch-pronunciation.mjs` 補進 `public/pronunciation.json`（只新增沒有的單字，既有 193 個單字的內容一個字都沒變；新增 23 個單字有資料）。檔案格式只有一個整體 `fetched` 日期，所以這個日期現在是今天，但只有新增的單字是今天取的。額外名稱放在 `scripts/pronunciation-extra-names.json`。


## 肺 Quiz（外表面壓跡、切跡與肺門；第二輪，需人工審核，不自動 merge）
入口：Quiz 首頁「器官」下的「肺」（`#/quiz/lung`）。第一級（看名稱、點位置）與第二級（看高亮、輸入名稱）都有；答題後顯示資料卡；視角預設「內側面」（縱隔面），另有前面、後面、側面、內側面按鈕。題目只涵蓋模型真的有的構造（原 45 題；肺 PR B 移除左肺氣管接觸區後為 44 題）：肺表面面片（由肺葉表面依相鄰構造切出，邊界是近似，不是描出來的）與肺門的原有網格。肺葉只當背景（不出題）。肺內的支氣管樹與肺血管不在範圍內（使用者說目前不考）。

**沒有所以不出題：** 右上葉支氣管（動脈上支氣管）、中間支氣管、肺門淋巴結、肺門處的胸膜返折（袖狀）、左肺心壓跡「更深」的獨立構造。第 1 肋溝（左右）有面片但從內側面看不到，題目開啟後要轉到前面或側面才找得到。

**題庫**（請逐列核對英文名、中文名、分類；「兩側」＝兩側肺都可出）：

| 英文名 | 中文名 | 分類 | 側別 |
| --- | --- | --- | --- |
| Oblique fissure of right lung | 右肺斜裂 | 尖、緣、面、裂、切跡與舌葉 | 右 |
| Horizontal fissure of right lung | 右肺水平裂 | 尖、緣、面、裂、切跡與舌葉 | 右 |
| Oblique fissure of left lung | 左肺斜裂 | 尖、緣、面、裂、切跡與舌葉 | 左 |
| Lingula of left lung | 左肺舌葉 | 尖、緣、面、裂、切跡與舌葉 | 左 |
| Cardiac notch of left lung | 左肺心切跡 | 尖、緣、面、裂、切跡與舌葉 | 左 |
| Cardiac impression of left lung | 左肺心壓跡 | 壓跡與溝 | 左 |
| Cardiac impression of right lung | 右肺心壓跡 | 壓跡與溝 | 右 |
| Left groove for aortic arch | 左主動脈弓溝 | 壓跡與溝 | 左 |
| Left groove for descending aorta | 左降主動脈溝 | 壓跡與溝 | 左 |
| Left groove for subclavian artery | 左鎖骨下動脈溝 | 壓跡與溝 | 左 |
| Right groove for subclavian artery | 右鎖骨下動脈溝 | 壓跡與溝 | 右 |
| Groove for left brachiocephalic vein | 左頭臂靜脈溝 | 壓跡與溝 | 左 |
| Right groove for brachiocephalic vein | 右頭臂靜脈溝 | 壓跡與溝 | 右 |
| Right groove for superior vena cava | 右上腔靜脈溝 | 壓跡與溝 | 右 |
| Right groove for azygos vein | 右奇靜脈溝 | 壓跡與溝 | 右 |
| Esophageal impression of left lung | 左肺食道壓跡 | 壓跡與溝 | 左 |
| Right groove for inferior vena cava | 右下腔靜脈溝 | 壓跡與溝 | 右 |
| Right groove for esophagus | 右食道溝 | 壓跡與溝 | 右 |
| Hilum of left lung | 左肺門 | 肺門 | 左 |
| Hilum of right lung | 右肺門 | 肺門 | 右 |
| Left pulmonary ligament | 左肺韌帶 | 肺門 | 左 |
| Right pulmonary ligament | 右肺韌帶 | 肺門 | 右 |
| Apex of right lung | 右肺尖 | 尖、緣、面、裂、切跡與舌葉 | 右 |
| Groove for first rib of right lung | 右肺第 1 肋溝 | 壓跡與溝 | 右 |
| Contact area for thymus of right lung | 右肺胸腺接觸區 | 壓跡與溝 | 右 |
| Contact area for trachea of right lung | 右肺氣管接觸區 | 壓跡與溝 | 右 |
| Anterior border of right lung | 右肺前緣 | 尖、緣、面、裂、切跡與舌葉 | 右 |
| Diaphragmatic surface of right lung | 右肺膈面 | 尖、緣、面、裂、切跡與舌葉 | 右 |
| Inferior border of right lung | 右肺下緣 | 尖、緣、面、裂、切跡與舌葉 | 右 |
| Apex of left lung | 左肺尖 | 尖、緣、面、裂、切跡與舌葉 | 左 |
| Groove for first rib of left lung | 左肺第 1 肋溝 | 壓跡與溝 | 左 |
| Contact area for thymus of left lung | 左肺胸腺接觸區 | 壓跡與溝 | 左 |
| Anterior border of left lung | 左肺前緣 | 尖、緣、面、裂、切跡與舌葉 | 左 |
| Diaphragmatic surface of left lung | 左肺膈面 | 尖、緣、面、裂、切跡與舌葉 | 左 |
| Inferior border of left lung | 左肺下緣 | 尖、緣、面、裂、切跡與舌葉 | 左 |
| Bronchial artery | 支氣管動脈 | 肺門 | 兩側 |
| Left main bronchus | 左主支氣管 | 肺門 | 左 |
| Right main bronchus proper | 右主支氣管本幹 | 肺門 | 右 |
| Left pulmonary artery | 左肺動脈 | 肺門 | 左 |
| Left superior pulmonary vein | 左上肺靜脈 | 肺門 | 左 |
| Left inferior pulmonary vein | 左下肺靜脈 | 肺門 | 左 |
| Right pulmonary artery | 右肺動脈 | 肺門 | 右 |
| Right superior pulmonary vein | 右上肺靜脈 | 肺門 | 右 |
| Right inferior pulmonary vein | 右下肺靜脈 | 肺門 | 右 |

第二級（輸入名稱）可出題 45 / 50（肺葉 5 個因資料卡不完整排除，本來就不是題目）；範圍清單在 `docs/quiz-level2-pool.md`。同義名稱表的新增 26 列在下方「Quiz 第二級同義名稱表」最後面，請核對（特別是「壓跡」類中文別名，以及「小裂、大裂」「肺底」是否要接受）。資料卡文字：壓跡類取自 PR #131 的面片資料卡；主支氣管與支氣管動脈為新寫的標準解剖內容（支氣管動脈來源寫「常見」），肺動脈與肺靜脈補上「來源」「主要分支」。

驗證：`node scripts/test-region-quiz.mjs`、`test-region-quiz-flow.mjs`、`test-quiz-hub.mjs`、`report-quiz-level2.mjs --check`、`test-lower-quiz.mjs` 等已更新並通過；瀏覽器截圖見 PR。

## 血管連續性與圓滑（上肢、下肢；【需人工審核】）

方法：`node scripts/audit-vessel-continuity.mjs --segments`（`scripts/lib/vessel-segments.mjs`）。每個動脈／靜脈網格是一段；每個末端與「下一段」配對（它面對的末端，或它匯入的主幹），量測**間隙**（末端中心到下一段表面，重疊為 0）、**切線誤差**（端接端時兩軸夾角）、**管徑誤差**（兩段管徑比）。間隙大於本段管徑一半者列出；完整表格（修正前與修正後）在 `docs/vessel-segments.md`。

| 區域 | 末端數 | 間隙 > 管徑一半：修正前（origin/main） → 修正後 | 切線誤差 > 45°（端接端） | 管徑誤差 > 1.5 倍（端接端） |
| --- | ---: | --- | --- | --- |
| 上肢 | 1229 | 199 → 105 | 172 → 134 | 95 → 67 |
| 下肢 | 1475 | 312 → 106 | 192 → 105 | 98 → 64 |

- **怎麼補**：沿用 `public/models/vessel-ends` 的末端機制（`scripts/prepare-vessel-ends.mjs`）。上肢與下肢中，間隙大於管徑一半、且下一段是「它面對的端」（距離不超過 3 mm + 6 倍管徑），或是「它匯入的主幹」（不超過 2 mm + 3 倍管徑，且管徑 > 3.6 mm 或間隙 ≤ 1.5 倍管徑 + 1 mm）的末端，加一條 Hermite 樣條連接管：起點沿本段軸向、終點沿下一段軸向，半徑由本段漸變到下一段，12 邊圓形斷面、沿管長平滑法線，取代同一末端原本的簡單連接管。手與手指的末端（`hand` 部位）不橋接：手指有自己的指關節綁定，連接管不會跟著指骨動（指骨動作測試會失敗），這些末端維持原本的簡單連接管並列在下表；不夠格的小分支維持原狀（真實解剖上它們止於肌肉或筋膜，硬接會**新增解剖**）。這一步共 ? 條橋接管。
- **連接管跟著骨骼動**：每條連接管複製所屬血管的手臂（`tissue-bindings`）與下肢（`body-bindings`）綁定（`vessel-end-bindings.json`），新增的 `scripts/test-vessel-motion.mjs` 逐一檢查連接管與血管綁定相同。
- **圓滑**：上肢、下肢 ≤ 3000 個三角形的血管本來就在建置模型串流時 Loop 細分並計算平滑法線（先前的血管 PR）；本 PR 沒有改動它們，只新增橋接／漸細管（12 邊）。未圓滑者（> 3000 個三角形，或形狀被動作資料綁死）數量見 `docs/vessel-segments.md`。
- **沒有新增任何血管模型**。圖譜缺少的血管（沒有下一段、管徑 ≥ 3 mm 的末端）列在 `docs/vessel-segments.md` 的「沒有下一段的大血管末端」：上肢 86 個、下肢 186 個末端（管徑 ≥ 1.5 mm）；哪些是進入組織、哪些是圖譜缺少，需要你對照課本判斷。

### 關節極限位置（`npm run check:motion` 新增 `test-vessel-motion.mjs`）

相鄰兩段（含連接管）以檢視器使用的蒙皮擺姿（肩外展 90°、肩屈曲 90°、肘屈曲 90°、髖屈曲 90°、膝屈曲 90°，以及肩 180°、肘 140°、腕 80°／−70°、髖 120°／−20°、膝 130°、踝 ±、髖外展 35°、髖旋轉 20° 的極限）後重新量測；判準：間隙小於管徑一半，或小於靜止間隙 + 1 mm。結果是**有例外**，已知例外列在 `docs/vessel-motion-exceptions.json`（新增例外會讓檢查失敗），詳表在 `docs/vessel-motion.md`：

| 姿勢 | 量測對數 | 例外 |
| --- | ---: | ---: |
| shoulder abduction 90 | 471 | 39 |
| shoulder flexion 90 | 471 | 38 |
| elbow flexion 90 | 471 | 8 |
| shoulder abduction 180 (limit) | 471 | 44 |
| shoulder flexion 180 (limit) | 471 | 49 |
| elbow flexion 140 (limit) | 471 | 12 |
| wrist flexion 80 (limit) | 471 | 0 |
| wrist flexion -70 (limit) | 471 | 14 |
| hip flexion 90 | 481 | 48 |
| knee flexion 90 | 481 | 24 |
| hip flexion 120 + knee 130 (limit) | 481 | 75 |
| hip extension -20 (limit) | 481 | 29 |
| ankle dorsiflexion 20 (limit) | 481 | 4 |
| ankle plantar flexion -30 (limit) | 481 | 3 |
| hip abduction 35 (limit) | 481 | 28 |
| hip rotation 20 (limit) | 481 | 35 |

例外幾乎都是下一段沒有綁定在同一個關節鏈上：上肢的軀幹血管（腋、鎖骨下、胸肩峰、肩胛周圍）在肩動作時不跟著動，下肢的骨盆血管（髂內、臀、腹壁）在髖動作時不跟著動，以及圖譜歸類為手的「足背趾靜脈」這類被誤判的構造。這些是綁定資料的缺口，不是連接管的問題；本 PR 沒有改動綁定規則。連接管背端與所屬血管分離超過 2 mm 的組合共 13 個，列在同一個檔案。

### 修正後仍大於管徑一半的間隙（上肢 105、下肢 106；完整列在這裡）

未修的原因：(a) 小分支（管徑 < 3 mm）停在主幹旁但距離超過連接範圍，真實解剖上多半止於肌肉，硬接會新增解剖；(b) 較大的血管（≥ 3 mm）下一段距離過遠或下一段不是它的解剖延續（例如頭靜脈上端最近的是外側肱靜脈，相距 33 mm），需要人工對照課本；(c) 18 個已加橋接但量測仍超過管徑一半。

<details><summary>上肢 105 筆（血管對 | 類型 | 間隙 mm | 管徑 mm）</summary>

| 血管對（上游 → 下一段） | 類型 | 間隙 (mm) | 管徑 (mm) |
| --- | --- | ---: | ---: |
| Right cephalic vein (FJ2272) → Right lateral brachial vein (PK-56) | 分支入幹 | 32.91 | 4.84 |
| Left cephalic vein (FJ2220) → Left lateral brachial vein (PK-60) | 分支入幹 | 30.96 | 3.81 |
| Left cephalic vein (FJ2220) → Left anterior circumflex humeral vein (FJ2213) | 分支入幹 | 29.09 | 3.39 |
| Left dorsal scapular artery (FJ2232) → Posterior intercostal arteries (FJ1975) | 分支入幹 | 26.95 | 2 |
| Left posterior interosseous vein (PK-62) → Left anterior interosseous vein (PK-61) | 分支入幹 | 25.29 | 2.52 |
| Right cephalic vein (FJ2272) → Right axillary vein (FJ2269) | 分支入幹 | 24.64 | 3.41 |
| Left radial artery (FJ2242) → Left posterior interosseous artery (PK-53) | 分支入幹 | 23.69 | 2.33 |
| Left anterior circumflex humeral vein (FJ2213) → Left cephalic vein (FJ2220) | 分支入幹 | 23.5 | 2.26 |
| Right radial artery (FJ2294) → Right posterior interosseous artery (PK-43) | 分支入幹 | 23.32 | 3.93 |
| Right anterior circumflex humeral vein (FJ2265) → Right posterior circumflex humeral vein (PK-42) | 分支入幹 | 21.56 | 1.6 |
| Right anterior circumflex humeral vein (FJ2265) → Right posterior circumflex humeral vein (PK-42) | 分支入幹 | 21.52 | 1.29 |
| Right ulnar artery (FJ2310) → Right dorsal carpal branch of ulnar artery (FJ2288) | 分支入幹 | 20.96 | 2.22 |
| Left suprascapular vein (FJ2250) → Left posterior segmental vein (FJ2929) | 分支入幹 | 20.5 | 1.71 |
| Left suprascapular artery (FJ2251) → Left second posterior intercostal artery (FJ1974) | 分支入幹 | 19.86 | 1.32 |
| Left basilic vein (FJ2218) → Left ulnar vein (FJ2260) | 分支入幹 | 19.77 | 1.8 |
| Right anterior circumflex humeral artery (FJ2264) → Right posterior circumflex humeral artery (FJ2292) | 分支入幹 | 19.16 | 2.41 |
| Left superior ulnar collateral artery (FJ2374) → Left brachial artery (FJ2219) | 分支入幹 | 18.92 | 1.22 |
| Left cephalic vein (FJ2220) → Left lateral thoracic vein (FJ2233) | 分支入幹 | 18.8 | 4.22 |
| Left radial artery (FJ2242) → Left posterior interosseous artery (PK-53) | 分支入幹 | 18.68 | 1.05 |
| Right recurrent interosseous artery (FJ2297) → Right radial recurrent artery (FJ2295) | 分支入幹 | 18.64 | 2.68 |
| Left anterior circumflex humeral artery (FJ2212) → Left posterior circumflex humeral artery (FJ2240) | 分支入幹 | 18.56 | 2.49 |
| Right ulnar artery (FJ2310) → Right anterior interosseous artery (FJ2266) | 分支入幹 | 18.51 | 3.97 |
| Right ulnar artery (FJ2310) → Right anterior interosseous artery (FJ2266) | 分支入幹 | 18.42 | 3.97 |
| Left median antebrachial vein (FJ2234) → Left ulnar vein (FJ2260) | 分支入幹 | 18.41 | 1.22 |
| Left radial artery (FJ2242) → Left superficial palmar arterial arch (FJ2248) | 分支入幹 | 17.91 | 1.6 |
| Right radial artery (FJ2294) → Right posterior interosseous artery (PK-43) | 分支入幹 | 17.86 | 2.2 |
| Right suprascapular vein (FJ2302) → Right circumflex scapular vein (FJ2274) | 分支入幹 | 17.45 | 1.78 |
| Right radial artery (FJ2294) → Right posterior interosseous artery (PK-43) | 分支入幹 | 16.76 | 3.66 |
| Left cephalic vein (FJ2220) → Left anterior circumflex humeral vein (FJ2213) | 分支入幹 | 15.57 | 5.03 |
| Right circumflex scapular vein (FJ2274) → Right posterior circumflex humeral vein (PK-42) | 分支入幹 | 15.25 | 1.65 |
| Right dorsal scapular artery (FJ2284) → Posterior intercostal arteries (FJ1961) | 分支入幹 | 15.12 | 1.34 |
| Left dorsal scapular artery (FJ2232) → Posterior intercostal arteries (FJ1975) | 分支入幹 | 15.03 | 1.12 |
| Right radial vein (FJ2296) → Right cephalic vein (FJ2272) | 分支入幹 | 14.85 | 2.42 |
| Left anterior interosseous vein (PK-61) → Left median antebrachial vein (FJ2234) | 分支入幹 | 14.6 | 1.36 |
| Right anterior interosseous vein (PK-57) → Right median antebrachial vein (FJ2286) | 分支入幹 | 14.5 | 1.36 |
| Right median antebrachial vein (FJ2286) → Right ulnar vein (FJ2312) | 分支入幹 | 13.77 | 2.08 |
| Left suprascapular vein (FJ2250) → Left subclavian vein (FJ3486) | 分支入幹 | 13.62 | 1.76 |
| Left ulnar vein (FJ2260) → Left basilic vein (FJ2218) | 分支入幹 | 13.49 | 2.25 |
| Dorsal venous network of left hand (FJ2228) → Proper palmar digital vein of left middle finger (FJ2326) | 端接端 | 13.26 | 3.45 |
| Right deep brachial artery (FJ2277) → Right brachial artery (FJ2271) | 分支入幹 | 13.26 | 2.4 |
| Right arteria radialis indicis (FJ2342) → Set of dorsal digital arteries (FJ2346) | 分支入幹 | 13.24 | 1.78 |
| Right superior ulnar collateral artery (FJ2373) → Right posterior ulnar recurrent artery (FJ2293) | 分支入幹 | 12.99 | 1.44 |
| Left superficial palmar venous arch (FJ2249) → Left deep palmar venous arch (FJ2229) | 分支入幹 | 12.94 | 1.67 |
| Right inferior ulnar collateral artery (FJ2267) → Right brachial artery (FJ2271) | 分支入幹 | 12.64 | 1.56 |
| Right superior ulnar collateral artery (FJ2373) → Right brachial artery (FJ2271) | 分支入幹 | 12.19 | 2.57 |
| Proper palmar digital vein of left little finger (FJ2319) → Proper palmar digital vein of left little finger (FJ2321) | 分支入幹 | 12 | 1.74 |
| Left ulnar vein (FJ2260) → Left median antebrachial vein (FJ2234) | 分支入幹 | 11.72 | 2.37 |
| Dorsal venous network of left hand (FJ2228) → Proper palmar digital vein of left middle finger (FJ2340) | 端接端 | 11.36 | 3.27 |
| Set of dorsal metacarpal arteries (FJ2348) → Set of dorsal digital arteries (FJ2318) | 分支入幹 | 10.78 | 1.95 |
| Proper palmar digital vein of left little finger (FJ2329) → Proper palmar digital vein of left ring finger (FJ2328) | 分支入幹 | 10.56 | 1.03 |
| Right radial vein (FJ2296) → Right cephalic vein (FJ2272) | 分支入幹 | 10.23 | 2.24 |
| Dorsal venous network of right hand (FJ2280) → Proper palmar digital vein of right little finger (FJ2351) | 端接端 | 10.07 | 2.14 |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral thoracic artery (FJ1976) | 分支入幹 | 9.93 | 1.23 |
| Proper palmar digital vein of left middle finger (FJ2326) → Proper palmar digital vein of left index finger (FJ2325) | 分支入幹 | 9.89 | 1.35 |
| Pectoral branch of right thoraco-acromial artery (FJ2361) → Right lateral thoracic artery (FJ1938) | 分支入幹 | 9.62 | 1.24 |
| Left basilic vein (FJ2218) → Left ulnar vein (FJ2260) | 分支入幹 | 9.42 | 2.19 |
| Left lateral brachial vein (PK-60) → Left medial brachial vein (FJ2313) | 分支入幹 | 9.4 | 2.9 |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral mammary artery (PK-8) | 分支入幹 | 9.16 | 2.14 |
| Right fourth common palmar digital artery (FJ2370) → Set of dorsal digital arteries (FJ2346) | 分支入幹 | 8.93 | 1.39 |
| Right radial vein (FJ2296) → Right cephalic vein (FJ2272) | 分支入幹 | 8.92 | 1.41 |
| Proper palmar digital vein of right middle finger (FJ2356) → Proper palmar digital vein of right index finger (FJ2355) | 分支入幹 | 8.42 | 1.31 |
| Left axillary artery (FJ2216) → Deltoid branch of left thoraco-acromial artery (FJ2230) | 分支入幹 | 8.25 | 1.63 |
| Right superficial palmar arterial arch (FJ2300) → Right palmar metacarpal artery (FJ2289) | 端接端 | 8.09 | 2.4 |
| Right superficial palmar venous arch (FJ2301) → Proper palmar digital vein of right little finger (FJ2351) | 端接端 | 7.92 | 1.75 |
| Left palmar metacarpal artery (FJ2237) → Left third common palmar digital artery (FJ2317) | 端接端 | 7.61 | 1.52 |
| Right posterior circumflex humeral vein (PK-42) → Right anterior circumflex humeral vein (FJ2265) | 分支入幹 | 7.22 | 2.47 |
| Right radial artery (FJ2294) → Right radial recurrent artery (FJ2295) | 分支入幹 | 7.11 | 3.25 |
| Proper palmar digital vein of left middle finger (FJ2326) → Proper palmar digital vein of left index finger (FJ2325) | 分支入幹 | 6.97 | 1.45 |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral mammary artery (PK-8) | 分支入幹 | 6.92 | 1.49 |
| Lateral proper palmar digital artery of left middle finger (FJ2334) → Medial proper palmar digital artery of left index finger (FJ2333) | 分支入幹 | 6.84 | 1.47 |
| Dorsal venous network of left hand (FJ2228) → Left palmar metacarpal vein (FJ2238) | 分支入幹 | 6.76 | 3.26 |
| Right deep palmar arch (FJ2279) → Right palmar metacarpal artery (FJ2289) | 分支入幹 | 6.67 | 3.12 |
| Right arteria radialis indicis (FJ2342) → Right arteria radialis indicis (FJ2363) | 端接端 | 6.29 | 1.78 |
| Right radial artery (FJ2294) → Right radial recurrent artery (FJ2295) | 分支入幹 | 6.2 | 2.77 |
| Left palmar metacarpal vein (FJ2238) → Left palmar metacarpal vein (FJ2323) | 分支入幹 | 6.14 | 1.72 |
| Pectoral branch of right thoraco-acromial artery (FJ2361) → Right lateral mammary artery (PK-3) | 分支入幹 | 5.95 | 1.36 |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left second posterior intercostal artery (FJ1974) | 分支入幹 | 5.94 | 1.48 |
| Right arteria radialis indicis (FJ2342) → Right arteria radialis indicis (FJ2363) | 端接端 | 5.54 | 1.76 |
| Left inferior ulnar collateral artery (FJ2215) → Left brachial artery (FJ2219) | 分支入幹 | 5.49 | 2.47 |
| Proper palmar digital vein of left little finger (FJ2321) → Proper palmar digital vein of left little finger (FJ2329) | 分支入幹 | 5.35 | 0.8 |
| Right superficial palmar arterial arch (FJ2300) → Right arteria radialis indicis (FJ2342) | 端接端 | 5.22 | 2.52 |
| Set of dorsal digital arteries (FJ2346) → Set of dorsal metacarpal arteries (FJ2347) | 端接端 | 5.01 | 1.64 |
| Left circumflex scapular artery (FJ2221) → Left axillary artery (FJ2216) | 分支入幹 | 4.88 | 1.84 |
| Right palmar metacarpal vein (FJ2290) → Proper palmar digital vein of right little finger (FJ2349) | 分支入幹 | 4.75 | 1.75 |
| Right radial artery (FJ2294) → Right superficial palmar branch of radial artery (PK-44) | 端接端 | 4.64 | 1.01 |
| Medial proper palmar digital artery of right index finger (FJ2364) → Right first common palmar digital artery (FJ2343) | 端接端 | 4.55 | 1.52 |
| Medial proper palmar digital artery of left index finger (FJ2333) → Left first common palmar digital artery (FJ2315) | 端接端 | 4.52 | 1.61 |
| Proper palmar digital vein of left middle finger (FJ2340) → Proper palmar digital vein of left middle finger (FJ2326) | 分支入幹 | 4.34 | 0.8 |
| Right radial vein (FJ2296) → Right cephalic vein (FJ2272) | 分支入幹 | 4.22 | 2.93 |
| Left median cubital vein (FJ2235) → Left medial brachial vein (FJ2313) | 分支入幹 | 4.15 | 3.92 |
| Left circumflex scapular vein (FJ2222) → Left suprascapular vein (FJ2250) | 分支入幹 | 4.12 | 0.98 |
| Right palmar metacarpal vein (FJ2290) → Right palmar metacarpal vein (FJ2353) | 分支入幹 | 4.07 | 1.73 |
| Left cephalic vein (FJ2220) → Left anterior circumflex humeral vein (FJ2213) | 分支入幹 | 3.45 | 3.54 |
| Left ulnar vein (FJ2260) → Left median antebrachial vein (FJ2234) | 分支入幹 | 3.12 | 1.08 |
| Deltoid branch of left thoraco-acromial artery (FJ2230) → Left axillary artery (FJ2216) | 分支入幹 | 2.83 | 2.2 |
| Left median cubital vein (FJ2235) → Left medial brachial vein (FJ2313) | 分支入幹 | 2.27 | 4.15 |
| Right fourth common palmar digital artery (FJ2370) → Right superficial palmar arterial arch (FJ2300) | 分支入幹 | 1.68 | 1.65 |
| Medial proper palmar digital artery of right ring finger (FJ2369) → Set of dorsal digital arteries (FJ2346) | 分支入幹 | 1.67 | 0.8 |
| Right superficial palmar arterial arch (FJ2300) → Right deep palmar arch (FJ2279) | 分支入幹 | 1.59 | 2.82 |
| Left superficial palmar arterial arch (FJ2248) → Left palmar metacarpal artery (FJ2237) | 端接端 | 1.57 | 2.85 |
| Proper palmar digital vein of left little finger (FJ2319) → Common palmar digital vein (FJ2322) | 端接端 | 1.49 | 1.76 |
| Right first common palmar digital artery (FJ2343) → Right superficial palmar arterial arch (FJ2300) | 端接端 | 1.34 | 1.75 |
| Right arteria princeps pollicis (FJ2372) → Set of dorsal digital arteries (FJ2346) | 分支入幹 | 1.19 | 0.8 |
| Right third common palmar digital artery (FJ2345) → Right palmar metacarpal artery (FJ2289) | 分支入幹 | 0.86 | 1.7 |
| Left median cubital vein (FJ2235) → Left lateral brachial vein (PK-60) | 分支入幹 | 0.75 | 1.4 |

</details>

<details><summary>下肢 106 筆（血管對 | 類型 | 間隙 mm | 管徑 mm）</summary>

| 血管對（上游 → 下一段） | 類型 | 間隙 (mm) | 管徑 (mm) |
| --- | --- | ---: | ---: |
| Right anterior tibial artery (FJ2130) → Right posterior tibial artery (FJ2172) | 分支入幹 | 42.38 | 2.45 |
| Left small saphenous vein (FJ2121) → Left genicular vein (FJ2107) | 分支入幹 | 38.27 | 4.76 |
| Right anterior tibial vein (FJ2193) → Right fibular vein (FJ2200) | 分支入幹 | 36.86 | 3.32 |
| Right lateral circumflex femoral vein (FJ2201) → Right deep femoral vein (FJ2135) | 分支入幹 | 36.18 | 3.9 |
| Left small saphenous vein (FJ2121) → Left genicular vein (FJ2107) | 分支入幹 | 36.09 | 3.66 |
| Right genicular vein (FJ2151) → Right anterior tibial vein (FJ2132) | 分支入幹 | 34.78 | 2.63 |
| Right small saphenous vein (FJ2176) → Right genicular vein (FJ2151) | 分支入幹 | 34.7 | 4.76 |
| Right anterior tibial vein (FJ2193) → Right fibular vein (FJ2200) | 分支入幹 | 31.98 | 4.23 |
| Left genicular vein (FJ2108) → Left great saphenous vein (FJ2103) | 分支入幹 | 31.92 | 1.39 |
| Right anterior tibial artery (FJ2130) → Right anterior tibial recurrent artery (FJ2131) | 分支入幹 | 31.9 | 5.51 |
| Left lateral circumflex femoral vein (FJ2188) → Left deep femoral vein (FJ2099) | 分支入幹 | 31.34 | 3.93 |
| Right posterior tibial artery (FJ2172) → Set of dorsal digital arteries (FJ2197) | 分支入幹 | 30.05 | 1.42 |
| Left anterior tibial artery (FJ2065) → Left anterior tibial recurrent artery (FJ2066) | 分支入幹 | 29.7 | 3.32 |
| Left fibular vein (FJ2187) → Left posterior tibial vein (FJ2118) | 分支入幹 | 28.91 | 4.94 |
| Left anterior tibial artery (FJ2065) → Left fibular artery (PK-103) | 分支入幹 | 28.57 | 4.94 |
| Left lateral circumflex femoral vein (FJ2188) → Left medial circumflex femoral vein (FJ2189) | 分支入幹 | 28.45 | 2.99 |
| Descending branch of right lateral circumflex femoral artery (FJ2057) → Set of perforating arteries (FJ2127) | 分支入幹 | 28.26 | 4.57 |
| Left inferior medial genicular artery (FJ2077) → Left anterior tibial recurrent artery (FJ2066) | 分支入幹 | 28.01 | 2.93 |
| Right fibular vein (FJ2200) → Right anterior tibial vein (FJ2193) | 分支入幹 | 27.73 | 5.64 |
| Right genicular vein (FJ2153) → Right anterior tibial vein (FJ2132) | 分支入幹 | 27.54 | 2.19 |
| Right lateral circumflex femoral vein (FJ2201) → Right medial circumflex femoral vein (FJ2202) | 分支入幹 | 26.72 | 2.83 |
| Right superficial medial plantar artery (FJ2179) → Set of plantar digital arteries proper (FJ2205) | 分支入幹 | 26.5 | 1.97 |
| Right lateral circumflex femoral vein (FJ2201) → Right deep femoral vein (FJ2135) | 分支入幹 | 26.39 | 4.38 |
| Right anterior tibial artery (FJ2130) → Right anterior lateral malleolar artery (PK-74) | 分支入幹 | 25.58 | 3 |
| Left anterior tibial recurrent artery (FJ2066) → Left articular branch of descending genicular artery (PK-99) | 分支入幹 | 25.47 | 2.44 |
| Left lateral circumflex femoral vein (FJ2188) → Left deep femoral vein (FJ2099) | 分支入幹 | 25.03 | 4.33 |
| Right lateral circumflex femoral vein (FJ2201) → Right deep femoral vein (FJ2135) | 分支入幹 | 24.77 | 4.23 |
| Right genicular vein (FJ2153) → Right great saphenous vein (FJ2145) | 分支入幹 | 24.45 | 2.35 |
| Left lateral circumflex femoral vein (FJ2188) → Left deep femoral vein (FJ2099) | 分支入幹 | 24.4 | 4.12 |
| Left fibular vein (FJ2187) → Left posterior tibial vein (FJ2118) | 分支入幹 | 24.32 | 4 |
| Right genicular vein (FJ2182) → Right anterior tibial vein (FJ2132) | 分支入幹 | 24.31 | 1.14 |
| Right lateral tarsal artery (FJ2163) → Right arcuate artery (FJ2133) | 分支入幹 | 22.97 | 3.2 |
| Left genicular vein (FJ2125) → Left anterior tibial vein (FJ2097) | 分支入幹 | 22.93 | 1.94 |
| Right posterior tibial vein (FJ2173) → Right anterior tibial vein (FJ2193) | 分支入幹 | 22.74 | 4.12 |
| Descending branch of right lateral circumflex femoral artery (FJ2057) → Right transverse branch of lateral circumflex femoral artery (PK-68) | 分支入幹 | 22.63 | 5.17 |
| Set of plantar digital veins (FJ2175) → Dorsal venous arch of right foot (FJ2062) | 分支入幹 | 22.41 | 1.86 |
| Right genicular vein (FJ2153) → Right anterior tibial vein (FJ2132) | 分支入幹 | 21.08 | 2.12 |
| Right medial circumflex femoral artery (PK-66) → Right lateral circumflex femoral artery (FJ2158) | 分支入幹 | 21 | 2.92 |
| Right deep femoral vein (FJ2135) → Set of perforating veins (FJ2192) | 分支入幹 | 20.7 | 4.32 |
| Left arcuate artery (FJ2067) → Left lateral tarsal artery (FJ2081) | 分支入幹 | 20.29 | 2.9 |
| Right arcuate artery (FJ2133) → Right lateral tarsal artery (FJ2163) | 分支入幹 | 20.13 | 2.92 |
| Left anterior tibial recurrent artery (FJ2066) → Left lateral superior genicular artery (FJ2080) | 分支入幹 | 19.99 | 2.4 |
| Left popliteal vein (FJ2117) → Left genicular vein (FJ2125) | 分支入幹 | 19.97 | 3.84 |
| Left posterior tibial artery (FJ2087) → Left fibular artery (PK-103) | 分支入幹 | 19.93 | 3.21 |
| Left articular branch of descending genicular artery (PK-99) → Left anterior tibial recurrent artery (FJ2066) | 分支入幹 | 19.62 | 1.24 |
| Right deep femoral vein (FJ2135) → Set of perforating veins (FJ2192) | 分支入幹 | 19.48 | 2.68 |
| Right superficial medial plantar artery (FJ2179) → Set of plantar digital arteries proper (FJ2205) | 分支入幹 | 18.67 | 1.85 |
| Left genicular vein (FJ2107) → Left anterior tibial vein (FJ2097) | 分支入幹 | 18.65 | 2.53 |
| Left lateral superior genicular artery (FJ2080) → Left popliteal artery (FJ2086) | 分支入幹 | 18.64 | 3.69 |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3571) | 分支入幹 | 18.63 | 3.29 |
| Left lateral superior genicular artery (FJ2080) → Left popliteal artery (FJ2086) | 分支入幹 | 18.39 | 3.73 |
| Right articular branch of descending genicular artery (PK-72) → Right anterior tibial recurrent artery (FJ2131) | 分支入幹 | 18.37 | 1.24 |
| Right genicular vein (FJ2182) → Right popliteal vein (FJ2171) | 分支入幹 | 18.28 | 2.59 |
| Right lateral superior genicular artery (FJ2162) → Right popliteal artery (FJ2170) | 分支入幹 | 18.17 | 3.68 |
| Right popliteal artery (FJ2170) → Right inferior medial genicular artery (FJ2152) | 分支入幹 | 18.16 | 4.11 |
| Left anterior tibial recurrent artery (FJ2066) → Left inferior medial genicular artery (FJ2077) | 分支入幹 | 17.62 | 1.39 |
| Dorsal venous arch of left foot (FJ2059) → Left small saphenous vein (FJ2121) | 分支入幹 | 17.26 | 1.45 |
| Right medial superior genicular artery (FJ2166) → Right popliteal artery (FJ2170) | 分支入幹 | 17.22 | 2.51 |
| Left superficial medial plantar artery (FJ2089) → Left plantar arch (FJ2085) | 分支入幹 | 17.1 | 1.95 |
| Right popliteal vein (FJ2171) → Right femoral vein (FJ2144) | 分支入幹 | 16.91 | 3.98 |
| Left medial circumflex femoral artery (PK-93) → Left femoral artery (FJ2074) | 分支入幹 | 16.75 | 4.37 |
| Left lateral plantar artery (FJ2079) → Left medial plantar artery (FJ2082) | 分支入幹 | 16.16 | 2.07 |
| Set of plantar digital veins (FJ2175) → Plantar venous arch of right foot (FJ2129) | 分支入幹 | 15.79 | 1.99 |
| Left inferior lateral genicular artery (FJ2076) → Left inferior medial genicular artery (FJ2077) | 分支入幹 | 15.55 | 3.4 |
| Left inferior gluteal vein (FJ3513) → Left internal iliac vein (FJ3470) | 分支入幹 | 15.51 | 3.78 |
| Left inferior gluteal vein (FJ3513) → Left internal iliac vein (FJ3470) | 分支入幹 | 15.47 | 3.8 |
| Left descending genicular artery (FJ2069) → Left articular branch of descending genicular artery (PK-99) | 分支入幹 | 15.46 | 3.52 |
| Left genicular vein (FJ2108) → Left great saphenous vein (FJ2103) | 分支入幹 | 15.39 | 2.46 |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2181) | 分支入幹 | 15.39 | 1.78 |
| Right popliteal vein (FJ2171) → Right anterior tibial vein (FJ2193) | 分支入幹 | 14.94 | 3.82 |
| Left arcuate artery (FJ2067) → Left lateral tarsal artery (FJ2081) | 分支入幹 | 13.97 | 2.81 |
| Set of perforating arteries (FJ2094) → Set of perforating arteries (FJ2090) | 分支入幹 | 13.84 | 2.81 |
| Set of dorsal digital arteries (FJ2093) → Left posterior tibial artery (FJ2087) | 分支入幹 | 13.09 | 2.99 |
| Right popliteal vein (FJ2171) → Right small saphenous vein (FJ2176) | 分支入幹 | 12.83 | 3.68 |
| Right fibular vein (FJ2200) → Right anterior tibial vein (FJ2193) | 分支入幹 | 12.75 | 3.7 |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3572) | 分支入幹 | 12.61 | 2.85 |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2151) | 分支入幹 | 12.57 | 1.78 |
| Right genicular vein (FJ2151) → Right anterior tibial vein (FJ2132) | 分支入幹 | 12.42 | 2.27 |
| Left anterior tibial recurrent artery (FJ2066) → Left anterior tibial artery (FJ2065) | 分支入幹 | 12.34 | 2.24 |
| Left popliteal vein (FJ2117) → Left genicular vein (FJ2125) | 分支入幹 | 11.91 | 3.57 |
| Right fibular vein (FJ2200) → Right anterior tibial vein (FJ2193) | 分支入幹 | 11.08 | 3.71 |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2151) | 分支入幹 | 10.66 | 1.73 |
| Right popliteal artery (FJ2170) → Right inferior medial genicular artery (FJ2152) | 分支入幹 | 10.4 | 3.12 |
| Left anterior tibial recurrent artery (FJ2066) → Left inferior lateral genicular artery (FJ2076) | 分支入幹 | 10.18 | 2.34 |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3572) | 分支入幹 | 9.66 | 2.67 |
| Right popliteal artery (FJ2170) → Right anterior tibial artery (FJ2130) | 分支入幹 | 7.76 | 2.83 |
| Left obturator vein (FJ3527) → Left external iliac vein (FJ3484) | 分支入幹 | 7.49 | 1.81 |
| Set of perforating veins (FJ2174) → Plantar metatarsal vein (FJ2207) | 分支入幹 | 7.06 | 1.7 |
| Set of perforating veins (FJ2119) → Plantar metatarsal vein (FJ2191) | 分支入幹 | 6.94 | 1.61 |
| Set of dorsal digital veins (FJ2185) → Set of plantar digital veins (FJ2120) | 分支入幹 | 6.93 | 0.8 |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3572) | 分支入幹 | 6.93 | 2.33 |
| Plantar metatarsal vein (FJ2207) → Set of plantar digital veins (FJ2175) | 分支入幹 | 6.58 | 1.84 |
| Left lateral superior genicular artery (FJ2080) → Left anterior tibial recurrent artery (FJ2066) | 分支入幹 | 6.49 | 2.01 |
| Set of perforating veins (FJ2138) → Right dorsal metatarsal vein (FJ2199) | 分支入幹 | 5.93 | 1.69 |
| Left genicular vein (FJ2124) → Left popliteal vein (FJ2117) | 分支入幹 | 5.78 | 3.61 |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2151) | 分支入幹 | 5.66 | 1.68 |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2151) | 分支入幹 | 5.66 | 1.68 |
| Plantar venous arch of left foot (FJ2128) → Set of perforating veins (FJ2119) | 端接端 | 5.28 | 1.18 |
| Left dorsal metatarsal vein (FJ2186) → Set of perforating veins (FJ2100) | 分支入幹 | 5.22 | 1.26 |
| Left anterior tibial vein (FJ2097) → Left genicular vein (FJ2107) | 分支入幹 | 4.93 | 1.75 |
| Right genicular vein (FJ2153) → Right anterior tibial vein (FJ2132) | 分支入幹 | 4.48 | 1.76 |
| Left deep branch of superior gluteal artery (PK-108) → Left superior gluteal artery (PK-106) | 分支入幹 | 4.06 | 4.82 |
| Right fibular vein (FJ2200) → Right posterior tibial vein (FJ2173) | 分支入幹 | 3.27 | 1.92 |
| Left popliteal vein (FJ2117) → Left genicular vein (FJ2107) | 分支入幹 | 3.17 | 5.75 |
| Left anterior tibial vein (FJ2183) → Left anterior tibial vein (FJ2097) | 分支入幹 | 2.23 | 4.34 |
| Left inferior lateral genicular artery (FJ2076) → Left middle genicular artery (FJ2084) | 分支入幹 | 0.51 | 0.94 |

</details>

### 其餘部位（本 PR 沒做，之後另開 PR；工具已可用 `--regions` 指定）

- 胸部（含肺門血管）、背部、頭頸、腹部與骨盆：`scripts/lib/vessel-segments.mjs` 的 `REGIONS` 已列 `thorax`、`head`（對應 `trunk`、`head-neck`），但橋接規則、綁定檢查與動作檢查都還沒針對這些部位驗證。

## 任務狀態表（2026-10-30；包括你交過的全部任務）

**部署：** 最後一次成功的是 `32a250d`（#125）。#127 merge 後的部署（`7143655`）因臉部肌肉來源檔的上游 404 失敗；#129（改用 `vendor/` 備份）你已 merge，修正後的部署（`c90ec91`，包含 #127 的肺修正）在更新本表時還在跑，我確認成功後才算上線。

**這張表曾被兩次合併不小心刪掉：** #125 與 #127 的合併提交都在解決 `REVIEW_LOG.md` 衝突時沒有保留這張表，這次從最後一個還有它的版本救回來並更新。之後的 PR 若動 `REVIEW_LOG.md`，合併後要確認這張表還在。

| 任務 | 狀態（進行中 / 已完成 / 等我審核 / 未開始 / 卡住） | PR 編號 | 備註 |
| --- | --- | --- | --- |
| Bug Audit 修正 12：關節資料的膜、聯合、脂肪墊改為真的畫出來；椎間盤／髓核／三放射軟骨從搜尋移除 | 等我審核（需人工審核，不自動 merge） | #PRNUM | 新增 12 個可點選結構，請看截圖 |
| Bug Audit 修正 11：滑鼠懸停顯示中英名稱、點空白取消選取、手機資訊卡不蓋住選取結構、手機標題不與按鈕重疊 | 已自動 merge | #154 | 介面程式與 CSS，不改模型 |
| **肺標籤修正 PR B：肺門單一區域、資訊卡欄位依類型、分類（壓跡／肺葉部分／肺的結構）、移除左肺氣管接觸區、分類上色與圖例** | 等我審核（【需人工審核】，不自動 merge；CI 結果見 PR） | #155 | 內容見「肺標籤修正 PR B」小節；Quiz 45 → 44 題；深色主題網站目前沒有，請你決定 |
| 肌腱與韌帶 第 1 批：上肢 | 等我審核（需人工審核，不自動 merge） | #147 | 見上方「肌腱與韌帶 第 1 批」；下肢、胸腔、背部各由之後的 PR 接續 |
| 全站顯示問題 A：選取外框、肺面片、骨性標記貼花、淡化 | 已合併（你 2026-10-31 確認「152 ok」） | #152 | 顯示程式，另一 session 開的 PR |
| Bug Audit 修正 7：Quiz 第二級判分放寬（整條肌肉名可答部分題；對立詞不算接近；縮寫、簡體、左側） | 已合併（你 2026-10-31 確認） | #148 | 判分規則改變，請核對下方清單 |
| Bug Audit 修正 10：搜尋體驗（無結果提示、心臟頁構造可搜、類型字與簡體容錯、頭部分頁選到頸以下自動回全身） | 已自動 merge | #151 | 搜尋與介面程式，不改模型 |
| Bug Audit 修正 9：載入穩健性（失敗提示、無 DecompressionStream 備援、閒置逾時、快取清理、路由錯誤邊界） | 已自動 merge | #150 | 載入與介面程式，不改模型 |
| Bug Audit 修正 8：「只練錯題」時另一側的題目也會載入 | 已自動 merge | #149 | Quiz 流程程式，不改題庫 |
| Bug Audit 修正 6：點選不被淡化／半透明結構搶走、細結構容錯、雙指平移 | 已自動 merge | #146 | `app/scene.tsx` 點選與觸控，不改模型 |
| Bug Audit 修正 5：Reset、相機與鍵盤 | 已自動 merge | #144 | 介面程式，不改模型 |
| 肌腱與韌帶盤點（Step 1，只盤點、不改模型） | 等我審核（需人工審核，不自動 merge） | #142 | `docs/tendon-ligament-inventory.md`；確認做法後才開始建置 |
| Bug Audit 修正 4：介面文字中文化 | CI 綠後自動 merge | #141 | 介面與 CSS，不改模型 |
| Bug Audit 修正 3：搜尋韌帶／頸部血管／腦構造後 3D 有反應 | CI 綠後自動 merge | #139 | 介面程式，不改模型 |
| 全站 Bug Audit（只報告） | 已完成報告；修正等你審核後分批開 PR | #133 | `docs/BUG_AUDIT.md`；最優先 P0-01 腦部別名、P1-01 示意包載入失敗 |
| Bug Audit 修正 1：示意模型資料包載入失敗 | 等我審核 | #135 | 61 個示意模型第一次顯示，請看畫面 |
| Bug Audit 修正 2：保密檢查補強、腦部卡片別名清理 | 等我審核 | #136 | 19 筆別名移除，請核對 |
| 修正部署：臉部肌肉來源檔上游 404，改用 `vendor/` 內雜湊相同的備份 | 已 merge（你審核過） | #129 | 16 MB 第三方資料（CC BY-SA 2.1 Japan）放在 `vendor/`，不發布到網站；部署確認中 |
| 第二級 Quiz | 已完成（已部署） | #98 | — |
| **肺 PR 1：聚焦視圖修正**（按鈕、白斑、顏色、平滑、支氣管樹／肺血管開關、胸廓半透明、面板中英分行） | 已 merge（你審核過）；**因部署失敗尚未上線** | #127 | 已知限制：左肺下緣鋸齒、肋縱隱窩模型沒有、腋中線壁層胸膜下緣偏高約一條肋、臟層胸膜在肺裂處有折線、肺裂尾端約 3 mm 穿透縫 |
| 肺 PR 2：內側面標籤與肺門 | 已完成（使用者已 merge） | #131 | 沒有：右上葉支氣管與中間支氣管、肺門淋巴結、胸膜返折包圍肺門；第 1 肋溝與左鎖骨下動脈溝內側看不到所以不標 |
| **肺 Quiz：外表面壓跡、切跡、緣、面、裂與肺門** | 等我審核（需人工審核，不自動 merge；45 題、第一級與第二級、同義名稱 26 列待核對） | #132 | 只出模型真的有的構造；沒有：右上葉支氣管、中間支氣管、肺門淋巴結、肺門處胸膜返折；題庫表與缺的清單在「肺 Quiz」小節 |
| **Quiz 題目範圍自由組合**（第二級也可只練神經／動脈等；類別 × 部位 × 左右側任意組合；第一級與第二級共用同一題庫，CI 比對） | 等我審核（需人工審核，不自動 merge；介面與邏輯為主，第二級題庫由 429 擴大為與第一級相同的 1097 題） | #137 | 類別：骨、肌肉、神經、動脈、靜脈、韌帶與筋膜、特殊空間與孔、器官結構；韌帶與筋膜只有肺韌帶 2 題，特殊空間與孔 0 題（題庫尚無這類構造，顯示「此範圍暫無題目」，沒有編造）；第二級原本排除的 668 個構造（資料卡欄位未填滿）改為照樣出題，答題後空白欄位顯示「尚無資料」；題數表 `docs/quiz-scope-counts.md`；`node scripts/check-quiz-banks.mjs` 已併入 `npm run check` |
| 肺 PR 3：肺段 | 未開始 | — | PR 2 之後；左肺合併或分開計算要你決定 |
| 肺 PR 4：肺淋巴引流 | 未開始 | — | 較低優先 |
| 肺 PR A／PR B | 已完成 | #112、#115 | — |
| 心臟：打開心腔時隱藏細血管（含正式站修正：只畫四條主要冠狀血管的主幹、資訊卡不蓋住面板） | 已完成（已在正式站驗證） | #119、#124 | 主要血管網格內較短的側枝也被藏起來；分類清單在下方請核對 |
| 心臟：選取高亮顧及前後遮擋、四個心腔的鏡頭與只切開面向鏡頭的外壁、心耳重做、左心房與左心耳分開、腔內示意構造平滑化 | 已開 PR，等你審核（未合併、不自動 merge、CI 跑中） | #138 | 模型處理，需人工審核；室間隔等薄面片選取時辨識度差、右心耳偏扁、來源左心房的隆起沒切掉（見 PR 說明的限制）；截圖在 `pr-screenshots` 分支 `heart-open-select/` |
| 心臟 PR2：光影與顏色 | 未開始 | — | 介面，可自動 merge |
| 心臟：二尖瓣名稱 | 已完成（你已審核並 merge） | #118 | — |
| 心臟 PR3：Quiz 判定與用語 | 已完成 | #111 | — |
| 肩關節屈曲／外展 180° | 已 merge；證據補在 #123 | #120、#123 | `check:motion` 通過；畫面上沒有可見的改善 |
| 上肢內旋 48° + 肘屈 140° 米色翼狀物 | **未解決**，成因未確認（初步：從身體外側垂下的長條，疑似軀幹筋膜被手臂權重拖長） | — | 子 agent 暫停中（分支 mj-beige-sheet，無提交）；需人工審核 |
| 手指改為只用預設手勢、手指修正（PR 1 已 merge #140；PR 2 加入「指向」） | PR 1 已 merge（#140，五個預設手勢＋速度）；PR 2 已開（分支 mj-fingers-point，**需人工審核，未合併**）：新增「指向」手勢（食指伸直、其餘三指與拇指握起）、OK 手勢指尖接觸量測、手勢按鈕改為英文在上中文在下 | #145 | `check:motion` 通過；指向的指動靜脈偏離指骨 6.8 mm → 0.1 mm（根因是相鄰手指爭奪權重，已修）；OK 手勢拇指與食指皮膚相距 0.5 mm（左）／0.9 mm（右），兩骨尖相距 7.6 mm；仍無掌腱膜、屈肌腱鞘與滑車（模型沒有，未自行補建） |
| 上肢動作細化（屈腕伸腕、肩外展加屈腕手部扭成一團、拇指周圍、三角肌鎖骨部高亮、組合動作測試） | 未開始 | — | 在手指 PR 1 之後 |
| 血管連續性與平滑化：上肢、下肢 | 已 merge | #125 | 間隙：上肢 199 → 105、下肢 312 → 106；剩下的間隙清單等你判斷是否相連；手與手指末端未橋接；`check:motion` 例外約 450 條；截圖是腳本畫的，不是網頁擷取 |
| 血管連續性：胸腔（含肺門）、背部，再來頭頸、腹盆 | 未開始 | — | 需人工審核；你把肺排最前面，所以暫不啟動 |
| 特殊區域邊界線與開口形狀 | 已完成 | #108 | — |
| 特殊區域 Quiz 題型 | 未開始 | — | — |
| 頂部區域列細分與區域聚焦（九個區域、深度選擇、區域歸屬資料檔） | 等我審核（分支 mj-region-bar；**【需人工審核】結構清單，不自動 merge**） | #134 | 區域列、第二級按鈕、鏡頭轉向、體腔內部視圖、淡化另一側、肺按鈕＝胸腔→肺與胸膜、Quiz／分層／特殊區域跟隨區域；歸屬清單見本檔上方與 `docs/region-members.md`，請核對背部、臀區、骨盆與會陰的邊界；模型沒有的結構已列出，沒有補假模型 |
| 腦神經檢查表、腦神經根預設顯示、搜尋修正 | 已完成 | #117 | 4 個問題等你決定，見下方 |
| 腦部：內側面（左右分開）視角、其餘細節模式指引 | 未開始 | — | 缺少的結構要列清單，不補假模型 |
| 底部按鈕改腦／心／肺 | 已完成 | #116 | 眼、耳暫時隱藏 |
| 頭顱內黃色碎塊、枕下靜脈叢分類、淡化點狀花紋 | 已完成 | #100、較早輪次、#110 | 全站分類錯誤的完整掃描未做 |
| 英文發音 | 已完成 | #113、#114 | 肺 PR 2 的新名稱隨 PR 補 |
| 磁碟清理腳本 `npm run clean`、`CLAUDE.md` 清理與截圖規則 | 已完成 | #126 | 截圖放獨立分支 `pr-screenshots` 的做法待你確認 |
| ROADMAP 最新優先次序 | 已完成 | #128 | 肺 → 心臟 → 上下肢動作 → 骨盆與會陰；眼、耳排後 |
| **眼**（詳細模式、視覺路徑、眼外肌、rod/cone 動畫） | 未開始（第二優先） | — | 上述完成後才開始 |
| **耳**（整隻耳模型、聽小骨、Corti 器、半規管、聽覺路徑動畫） | 未開始（第二優先） | — | 排在眼之後 |
| 跑考範圍：足部神經、踝伸肌支持帶、子宮韌帶重做 | 未開始 | — | 需人工審核 |
| 結締組織 PR1–3、乳房兩層、女性骨盆與生殖結構、Undo、ROADMAP 第 0 步、骨盆與會陰 | 未開始（骨盆與會陰屬第一優先第 4 項） | — | — |
| 神經解剖筆記匯入、最終審核、Quiz 資料完整性、效能、Zoom-to-cursor、Source & credits、穿模修正 | 未開始 | — | — |
| 頭部左側浮出身體外的黃色神經 | 卡住 | — | 兩次都無法重現，需要你當時的視角或截圖 |
| 改為私人網站（Cloudflare Pages ＋ Access） | 未開始（卡住：需要你的帳號操作） | — | ROADMAP 第 52 行；我提供逐步教學 |

### 需要你做的事
**等你審核：** 肺 PR 2（#131，看右肺與左肺內側面截圖的標籤位置、資料卡文字是否正確、缺少結構的清單）。

**等你決定：**
2. 腦神經：右側延髓補不補、VIII 與 IX 要不要帶進腦部模式、「外旋神經」改不改「外展神經」、「顏面神經」改不改「面神經」。
3. 肺段：左肺 S1+2、S7+8 合併（8 段）或分開（10 段）。
4. 心臟細分支分類（左右緣支、竇房結動脈歸為細分支）。
5. 血管：哪些剩下的間隙該相連（清單在 #125 的 REVIEW_LOG 可展開表）。
6. 截圖放獨立分支 `pr-screenshots`（與 main 無共同歷史、永不 merge）的做法。
7. 舊 worktree：還剩幾個有未提交變更或未 merge 的（`mj-pelvis`、`mj-trace`、`mj-heartopen`、`mj-conn`、`mj-cut` 等），要不要刪。

**等你提供：** 肺段在跑考的寫法、頭部黃色神經的截圖、Cloudflare 帳號操作、缺少模型時的參考圖。

### 外部資源風險（尚未處理）
`facial.bin` 的上游消失讓部署壞掉一次。其他腳本也有下載外部資源，例如補充結構的 BodyParts3D 鏡像、釘住的 Z-Anatomy 與 Brain Project 檔案、HRA 資料。它們這次沒失敗，但同樣可能消失；還沒盤點、沒有備份。

## 頂部區域列細分與區域聚焦（【需人工審核】結構清單，不自動 merge）

**需人工審核，未合併。** 介面部分（區域列、捲動、第二級按鈕、鏡頭、淡化、復原）可以自動 merge，但「哪個結構屬於哪個區域」是解剖內容，請核對下面的清單，尤其是**背部、臀區、骨盆與會陰**的邊界。

**怎麼看：** 頂部列由左到右為 全身｜頭頸｜上肢｜胸腔｜背部｜腹腔｜骨盆與會陰｜臀區｜下肢，窄螢幕可左右捲動，不換行。點一個區域，其他區域收起，出現第二級按鈕與「←」。成對的區域（頭頸、上肢、胸腔、背部、臀區、下肢）有 雙側｜左側｜右側，選了單側後可勾「淡化另一側」。胸腔有 縱隔與心臟｜胸壁｜肺與胸膜，腹腔有 腹腔器官｜腹壁｜後腹壁（腎、大血管），骨盆與會陰有 骨盆器官｜骨盆壁｜會陰。體腔區域預設進入內部視圖（第一個深度）：皮膚與淺層壁肌不是該深度的成員所以隱藏，肋骨、胸骨（以及腹盆的脊柱、下位肋骨、髖骨）半透明，臟器不透明。左側系統開關仍可用，只作用在目前區域；「←」或點標題「MJ Anatomy」回到全身並還原進入前的畫面。底部「肺」按鈕等同「胸腔 → 肺與胸膜」（同一組結構、同一個面板）。分層解剖的肌肉分層、特殊區域、Quiz 連結都跟著目前區域。

**歸屬資料：** `app/mj-region-bar.ts`（規則表；每個結構可屬於多個區域，跨區結構如主動脈、迷走神經、橫膈、闊背肌在經過的每個區域都顯示）。完整清單（左右合併、同名多段以 ×數量表示）：`docs/region-members.md`，由 `node scripts/list-region-members.mjs` 產生，`npm run check` 會檢查它沒有過期。下面各區域的名稱清單同一份內容。

**邊界的判斷（請特別核對）：**
- 背部：脊柱全段（含頸椎、薦骨、尾骨）、椎間盤、黃韌帶、棘肌群（豎脊肌、橫突棘肌、棘間肌、橫突間肌、肋提肌）、後鋸肌、夾肌，以及外在淺層肌（斜方肌、闊背肌、菱形肌、提肩胛肌）、胸腰筋膜、脊神經與背側支。**肩胛骨不算背部**（算上肢）；髖骨不算背部。
- 臀區：臀大、中、小肌、梨狀肌、閉孔內外肌、上下孖肌、股方肌、闊筋膜張肌、臀上下動靜脈與神經、內陰部血管、髖骨、薦骨、尾骨與股骨（模型的股骨是一整支，沒有分近端，所以整支都在）。
- 骨盆與會陰：骨盆壁＝髖骨、薦骨、尾骨、提肛肌群（恥骨尾骨肌、髂尾骨肌、尾骨肌、恥骨直腸肌）、閉孔內肌、梨狀肌、髂內與髂外血管、臀上下血管。骨盆器官＝膀胱、輸尿管、尿道、直腸、前列腺、精囊、輸精管、子宮與卵巢及其韌帶、陰道、骨盆腹膜與陷凹、乙狀結腸血管、直腸上血管、子宮血管。會陰＝陰莖、陰蒂、陰唇、前庭球、睪丸與副睪、外肛門括約肌、會陰淺肌、陰部血管、陰毛、陰阜。輸尿管、尿道、陰道同時屬於骨盆器官與會陰（跨區）。
- 髂外血管：放在骨盆壁（沿骨盆緣），同時也在下肢。總髂血管放在後腹壁。

**模型沒有（沒有補任何假模型，也沒有把別的結構硬放進去）：** 肝臟本體（只有尾狀葉與肝內血管、膽道）、乙狀結腸本體（只有乙狀結腸血管）、盲腸本體（只有迴盲交界與闌尾）、大網膜與小網膜、陰囊、肛管、球海綿體肌、坐骨海綿體肌、會陰深橫肌、會陰體、骶結節韌帶、骶棘韌帶、恥骨聯合、腰神經叢與薦神經叢（只有外部神經網格裡的個別神經）、脊髓（只有「脊髓中央管」一個網格）、支氣管肺門淋巴結、腸繫膜淋巴結。這些在清單裡就是缺的。

**各區域的結構清單**（網格數／名稱數；展開看名稱）。注意：「肺與胸膜」實際畫面沿用肺聚焦視圖的邏輯（肺葉、氣管、主支氣管、肺門、胸膜、半透明胸廓；支氣管樹與肺血管用面板開關），下表是它的全部可選成員。

<details><summary><strong>頭頸</strong>：955 個網格，400 個名稱。</summary>

- **動脈**（74）：Acromial branch of thoraco-acromial artery ×4；anterior cerebral artery ×2；anterior choroidal artery ×4；Anterior communicating artery；anterior inferior cerebellar artery ×4；anterior parietal artery ×4；Anterior part of apical segmental artery ×7；anterior spinal artery ×2；anterior temporal artery ×4；Anterior temporal branch of lateral occipital artery ×4；Anterolateral central branch of middle cerebral artery ×8；Apical part of apical segmental artery ×6；apical segmental artery ×6；artery of central sulcus ×8；Artery of postcentral sulcus ×4；Artery of precentral sulcus ×12；Basilar artery ×2；Brachiocephalic artery；Branch of anterior choroidal artery to posterior limb of internal capsule ×4；Branch of middle cerebral artery to angular gyrus ×4；callosomarginal artery ×4；Clavicular branch of thoraco-acromial artery ×3；common carotid artery ×4；costocervical trunk ×2；deep cervical artery ×4；Deltoid branch of thoraco-acromial artery；Hypothalamic branch of posterior communicating artery ×4；inferior thyroid artery ×4；Insular part of middle cerebral artery ×5；Intermediomedial branch of callosomarginal artery ×4；internal carotid artery ×4；Lateral branch of pontine artery ×4；Lateral branch of superior cerebellar artery ×4；lateral frontobasal artery ×8；lateral occipital artery ×4；Medial branch of pontine artery ×4；Medial branch of superior cerebellar artery ×2；medial frontobasal artery ×4；medial occipital artery ×4；Middle temporal branch of lateral occipital artery ×4；Middle temporal branch of middle cerebral artery ×4；ophthalmic artery ×4；Paracentral branch of callosomarginal artery ×12；pericallosal artery ×4；polar temporal artery ×4；Postcommunicating part of posterior cerebral artery ×2；posterior communicating artery ×2；posterior inferior cerebellar artery ×52；posterior medial choroidal artery ×4；posterior parietal artery ×4；Posterior temporal branch of middle cerebral artery ×4；Posteromedial branch of callosomarginal artery ×4；Posteromedial central branch of posterior cerebral artery ×4；Precommunicating part of posterior cerebral artery ×2；Precuneal branch of pericallosal artery ×4；prefrontal artery ×4；set of posterior temporal branches of lateral occipital artery ×4；Sphenoid part of middle cerebral artery ×4；splenial artery ×4；subclavian artery ×3；superficial cervical artery ×4；superior cerebellar artery ×2；superior intercostal artery ×2；Superior vermian branch of medial branch of superior cerebellar artery ×4；suprascapular artery ×4；supreme intercostal artery ×2；Temporo-occipital branch of middle cerebral artery ×4；thalamogeniculate artery ×4；thalamoperforating artery ×4；thyrocervical trunk ×2；transverse cervical artery ×2；Trunk of inferior terminal branch of middle cerebral artery ×2；Trunk of thoraco-acromial artery ×2；vertebral artery ×6
- **心臟**（4）：Fourth ventricle；Interventricular foramen；lateral ventricle ×2；Third ventricle
- **結締組織**（18）：Check ligament of lateral rectus ×2；Check ligament of medial rectus ×2；conus elasticus ×2；Hyo-epiglottic ligament；intermediate tendon；lateral thyrohyoid ligament ×2；Median cricothyroid ligament；Median thyrohyoid ligament；Pharyngeal raphe；pterygomandibular raphe ×2；stylohyoid ligament ×2；suboccipital triangle ×2；superior transverse scapular ligament ×2；Tendon of levator palpebrae superioris；Thyro-epiglottic ligament；thyrohyoid membrane ×2；Trochlea of superior oblique ×2；vocal ligament ×2
- **消化**（3）：sublingual gland ×2；submandibular gland ×2；Tongue
- **內分泌**（2）：Pineal body；Pituitary gland
- **體表**（4）：Eyebrow；Hair of head；Lip；Skin
- **肌肉**（90）：Aponeurosis of epicranius；aryepiglotticus ×2；buccinator ×2；cervical rotator ×2；corrugator supercilii ×2；Deep part of masseter ×2；depressor anguli oris ×2；depressor labii inferioris ×2；depressor septi nasi ×2；Descending part of trapezius ×2；digastric ×5；frontalis ×2；genioglossus ×2；geniohyoid ×2；hyoglossus ×2；iliocostalis cervicis ×2；inferior oblique ×2；Inferior oblique part of longus colli ×2；inferior rectus ×2；interspinalis thoracis ×2；lateral crico-arytenoid ×2；lateral rectus ×2；levator anguli oris ×2；levator labii superioris ×2；levator labii superioris alaeque nasi ×2；levator palpebrae superioris ×2；levator veli palatini ×2；longissimus capitis ×2；longissimus cervicis ×2；longus capitis ×2；Lower head of lateral pterygoid ×2；medial pterygoid ×2；medial rectus ×2；mentalis ×2；mylohyoid ×2；nasalis ×2；oblique arytenoid ×2；Oblique part of cricothyroid ×2；obliquus capitis inferior ×2；obliquus capitis superior ×2；occipitalis ×2；omohyoid ×2；Orbicularis oris；Orbital part of orbicularis oculi ×2；Palpebral part of orbicularis oculi ×2；platysma ×2；posterior crico-arytenoid ×2；procerus ×2；rectus capitis anterior ×2；rectus capitis lateralis ×2；rectus capitis posterior major ×2；rectus capitis posterior minor ×2；rhomboid minor ×2；risorius ×2；scalenus anterior ×2；scalenus medius ×2；scalenus posterior ×2；semispinalis capitis ×2；semispinalis cervicis ×2；set of anterior cervical intertransversarii ×2；set of interspinales cervicis ×2；set of posterior cervical intertransversarii ×2；spinalis ×2；spinalis cervicis ×2；splenius capitis ×2；splenius cervicis ×2；sternocleidomastoid ×2；sternohyoid ×2；sternothyroid ×2；Straight part of cricothyroid ×2；stylohyoid ×2；subclavius ×2；Superficial part of masseter ×2；superior oblique ×2；Superior oblique part of longus colli ×2；superior rectus ×2；supraspinatus ×2；temporalis ×2；temporoparietalis ×2；tensor veli palatini ×2；thyro-arytenoid ×4；thyrohyoid ×2；Transverse arytenoid；Transverse part of trapezius ×2；Upper head of lateral pterygoid ×2；Uvular muscle；Vertical intermediate part of longus colli ×2；vocalis ×2；zygomaticus major ×2；zygomaticus minor ×2
- **神經**（90）：amygdala ×2；angular gyrus ×2；Anterior commissure；anterior ethmoidal nerve ×2；Anterior part of superior temporal gyrus ×2；Brachium of inferior colliculus ×2；Brachium of superior colliculus ×2；C1 spinal nerve ×2；C2 spinal nerve ×2；C3 spinal nerve ×2；C4 spinal nerve ×2；C5 spinal nerve ×2；C6 spinal nerve ×2；C7 spinal nerve ×2；C8 spinal nerve ×2；caudate nucleus ×2；Central canal of spinal cord；Cerebellum ×2；Cerebral aqueduct；ciliary ganglion ×2；cingulate gyrus ×2；Commissure of fornix of forebrain；Communicating branch of nasociliary nerve with ciliary ganglion ×2；Corpus callosum；dorsal ramus of C1 spinal nerve ×2；dorsal ramus of C2 spinal nerve ×2；dorsal ramus of C3 spinal nerve ×2；dorsal ramus of C4 spinal nerve ×2；dorsal ramus of C5 spinal nerve ×2；dorsal ramus of C6 spinal nerve ×2；dorsal ramus of C7 spinal nerve ×2；dorsal ramus of C8 spinal nerve ×2；fornix of forebrain ×2；frontal nerve ×2；fusiform gyrus ×2；globus pallidus ×2；Habenula；hippocampus ×2；Hypothalamus ×2；Inferior branch of oculomotor nerve ×2；inferior colliculus ×2；inferior frontal gyrus ×2；inferior temporal gyrus ×2；infratrochlear nerve ×2；insula ×2；internal capsule ×2；Interpeduncular fossa ×2；lacrimal nerve ×2；Lamina terminalis ×2；lateral geniculate body ×2；long ciliary nerve ×2；Mammillary body ×2；medial geniculate body ×2；Medulla oblongata ×2；Midbrain ×2；middle frontal gyrus ×2；middle temporal gyrus ×2；nasociliary nerve ×2；occipital lobe ×2；ophthalmic nerve ×2；Optic chiasm ×2；optic nerve ×4；optic tract ×2；Orbital gyrus ×2；parahippocampal gyrus ×2；Peduncle of midbrain ×2；Pons ×2；postcentral gyrus ×2；Posterior commissure；posterior ethmoidal nerve ×2；Posterior part of superior temporal gyrus ×2；precentral gyrus ×2；putamen ×2；recurrent laryngeal nerve ×2；Septum of telencephalon；Short ciliary nerve ×2；stria medullaris of thalamus ×2；stria terminalis ×2；Superior branch of oculomotor nerve ×2；superior colliculus ×2；superior frontal gyrus ×2；superior parietal lobule ×2；supra-orbital nerve ×2；supramarginal gyrus ×2；supratrochlear nerve ×2；Tentorium cerebelli；thalamus ×2；trochlear nerve ×2；Tuber cinereum ×2；White matter of cerebral hemisphere ×2
- **呼吸**（17）：Apex of lung ×2；apical segmental bronchial tree ×10；Contact area for trachea of lung ×2；Epiglottis；Groove for brachiocephalic vein；Groove for first rib of lung ×2；groove for subclavian artery ×2；inferior nasal concha ×2；inferior pharyngeal constrictor ×2；lateral nasal cartilage ×2；middle pharyngeal constrictor ×2；palatopharyngeus ×2；salpingopharyngeus ×2；Septal nasal cartilage；stylopharyngeus ×2；superior pharyngeal constrictor ×2；Trachea
- **感覺器**（21）：Anterior chamber of eyeball ×2；choroid ×4；Choroid plexus of cerebral hemisphere ×2；common tendinous ring ×2；cornea ×2；corona ciliaris ×2；External ear；iris ×2；lacrimal bone ×2；lacrimal canaliculus ×2；lacrimal gland ×2；lacrimal lake ×2；lacrimal sac ×2；lens ×2；nasolacrimal duct ×2；Optic part of retina ×2；sclera ×2；Suspensory ligament of lens ×2；Tarsal plate of lower eyelid ×2；Tarsal plate of upper eyelid ×2；vitreous body ×2
- **漿膜**（5）：Cervical part (cupula) of parietal pleura ×2；Costal part of parietal pleura ×2；Diaphragmatic part of parietal pleura ×2；Mediastinal part of parietal pleura ×2；Parietal layer of serous pericardium
- **骨**（64）：arytenoid cartilage ×2；Atlas；Axis；clavicle ×2；coracoid process ×2；corniculate cartilage ×2；Cricoid cartilage ×2；cuneiform cartilage ×2；Ethmoid；Fifth cervical vertebra；first rib ×2；First thoracic vertebra；Fourth cervical vertebra；Frontal bone；Gingiva of lower jaw；Gingiva of upper jaw；greater tubercle of humerus ×2；Hyoid bone ×2；Intervertebral disk of axis；Intervertebral disk of fifth cervical vertebra；Intervertebral disk of first thoracic vertebra；Intervertebral disk of fourth cervical vertebra；Intervertebral disk of second thoracic vertebra；Intervertebral disk of seventh cervical vertebra；Intervertebral disk of sixth cervical vertebra；Intervertebral disk of third cervical vertebra；Jugular foramen；levator scapulae ×2；lower central secondary incisor tooth ×2；lower first secondary molar tooth ×2；lower first secondary premolar tooth ×2；lower lateral secondary incisor tooth ×2；lower second secondary molar tooth ×2；lower second secondary premolar tooth ×2；lower secondary canine tooth ×2；major alar cartilage ×2；Mandible；Mastoid process；maxilla ×2；nasal bone ×2；Occipital bone；palatine bone ×2；parietal bone ×2；Posterior arch of atlas；Second thoracic vertebra；Seventh cervical vertebra；Sixth cervical vertebra；Sphenoid bone；Spinous process of axis；Superior nuchal line；suprascapular notch ×2；temporal bone ×2；Third cervical vertebra；Third thoracic vertebra；Thyroid cartilage；upper central secondary incisor tooth ×2；upper first secondary molar tooth ×2；upper first secondary premolar tooth ×2；upper lateral secondary incisor tooth ×2；upper second secondary molar tooth ×2；upper second secondary premolar tooth ×2；upper secondary canine tooth ×2；Vomer；zygomatic bone ×2
- **靜脈**（8）：Apical part of apical segmental vein ×5；apical segmental vein ×7；brachiocephalic vein ×3；internal jugular vein ×2；posterior segmental vein ×4；subclavian vein ×4；superior intercostal vein ×2；suprascapular vein ×2

</details>

<details><summary><strong>上肢</strong>：540 個網格，190 個名稱。</summary>

- **動脈**（48）：Acromial branch of thoraco-acromial artery ×4；anterior circumflex humeral artery ×4；anterior interosseous artery ×4；anterior ulnar recurrent artery ×2；arteria princeps pollicis ×8；arteria radialis indicis ×9；axillary artery ×4；brachial artery ×4；circumflex scapular artery ×4；Clavicular branch of thoraco-acromial artery ×3；common interosseous artery ×2；deep brachial artery ×6；deep palmar arch ×4；deep palmar branch of ulnar artery ×2；Deltoid branch of thoraco-acromial artery ×6；Dorsal carpal branch of radial artery ×2；dorsal carpal branch of ulnar artery ×2；dorsal scapular artery ×4；first common palmar digital artery ×4；fourth common palmar digital artery ×4；inferior ulnar collateral artery ×4；Lateral proper palmar digital artery of little finger ×3；Lateral proper palmar digital artery of middle finger ×4；Lateral proper palmar digital artery of ring finger ×4；Medial proper palmar digital artery of index finger ×4；Medial proper palmar digital artery of middle finger ×2；Medial proper palmar digital artery of ring finger ×2；Middle collateral branch of deep brachial artery ×4；palmar metacarpal artery ×3；Pectoral branch of thoraco-acromial artery ×4；posterior circumflex humeral artery ×8；posterior interosseous artery ×3；posterior ulnar recurrent artery ×5；radial artery ×4；Radial collateral branch of deep brachial artery ×4；radial recurrent artery ×4；recurrent interosseous artery ×4；second common palmar digital artery ×2；Set of dorsal digital arteries ×4；Set of dorsal metacarpal arteries ×4；subscapular artery ×4；superficial palmar arterial arch ×4；superficial palmar branch of radial artery ×2；superior ulnar collateral artery ×4；suprascapular artery ×4；third common palmar digital artery ×2；Trunk of thoraco-acromial artery ×2；ulnar artery ×4
- **結締組織**（11）：anatomical snuffbox ×2；axillary fossa ×2；axillary sheath ×2；carpal tunnel ×2；cubital fossa ×2；extensor retinaculum of wrist ×2；Interosseous membrane of forearm ×2；quadrangular space ×2；superior transverse scapular ligament ×2；triangular interval ×2；triangular space ×2
- **肌肉**（61）：Abdominal part of pectoralis major ×2；Abductor digiti minimi of hand ×2；abductor pollicis brevis ×2；abductor pollicis longus ×2；Acromial part of deltoid ×2；anconeus ×2；Ascending part of trapezius ×2；brachialis ×2；brachioradialis ×2；Clavicular part of deltoid ×2；Clavicular part of pectoralis major ×2；coracobrachialis ×2；Descending part of trapezius ×2；extensor carpi radialis brevis ×2；extensor carpi radialis longus ×2；extensor carpi ulnaris ×4；extensor digiti minimi ×2；extensor digitorum ×2；extensor indicis ×2；extensor pollicis brevis ×2；extensor pollicis longus ×2；flexor carpi radialis ×2；Flexor digiti minimi brevis of hand ×2；flexor digitorum profundus ×2；flexor digitorum superficialis ×4；flexor pollicis brevis ×2；flexor pollicis longus ×2；Humeral head of flexor carpi ulnaris ×2；Humeral head of pronator teres ×2；infraspinatus muscle ×2；Lateral head of triceps brachii ×2；latissimus dorsi ×2；Long head of biceps brachii ×2；Long head of triceps brachii ×2；Medial head of triceps brachii ×2；Oblique head of adductor pollicis ×2；Opponens digiti minimi of hand ×2；opponens pollicis ×2；palmaris brevis ×2；palmaris longus ×2；pectoralis minor ×2；pronator quadratus ×2；rhomboid major ×2；rhomboid minor ×2；serratus anterior ×2；Set of dorsal interossei of hand ×2；Set of lumbricals of hand ×2；Set of palmar interossei of hand ×2；Short head of biceps brachii ×2；Spinal part of deltoid ×2；Sternocostal part of pectoralis major ×2；subclavius ×2；Superficial head of flexor pollicis brevis ×2；supinator ×2；supraspinatus ×2；teres major ×2；teres minor ×2；Transverse head of adductor pollicis ×2；Transverse part of trapezius ×2；Ulnar head of flexor carpi ulnaris ×2；Ulnar head of pronator teres ×2
- **神經**（2）：lateral cord of brachial plexus ×2；recurrent branch of median nerve ×2
- **感覺器**（1）：Flexor retinaculum of wrist ×2
- **骨**（42）：capitate ×2；clavicle ×2；Distal phalanx of index finger ×2；Distal phalanx of little finger ×2；Distal phalanx of middle finger ×2；Distal phalanx of ring finger ×2；Distal phalanx of thumb ×2；fifth metacarpal bone ×2；first metacarpal bone ×2；fourth metacarpal bone ×2；greater tubercle of humerus ×2；hamate ×2；humerus ×2；intertubercular groove ×2；lesser tubercle of humerus ×2；levator scapulae ×2；lunate ×2；medial epicondyle of humerus ×2；Middle phalanx of index finger ×2；Middle phalanx of little finger ×2；Middle phalanx of middle finger ×2；Middle phalanx of ring finger ×2；pisiform ×2；Proximal phalanx of index finger ×2；Proximal phalanx of little finger ×2；Proximal phalanx of middle finger ×2；Proximal phalanx of ring finger ×2；Proximal phalanx of thumb ×2；radial groove ×2；radius ×2；scaphoid ×2；scapula ×2；second metacarpal bone ×2；styloid process of radius ×2；subscapularis ×2；suprascapular notch ×2；surgical neck of humerus ×2；third metacarpal bone ×2；trapezium ×2；trapezoid ×2；triquetral ×2；ulna ×2
- **靜脈**（25）：anterior circumflex humeral vein ×4；anterior interosseous vein ×2；axillary vein ×4；basilic vein ×4；cephalic vein ×4；circumflex scapular vein ×4；Common palmar digital vein ×2；deep palmar venous arch ×5；Dorsal venous network of hand ×4；lateral brachial vein ×4；medial brachial vein ×4；median antebrachial vein ×4；median cubital vein ×4；palmar metacarpal vein ×11；posterior circumflex humeral vein ×2；posterior interosseous vein ×2；Proper palmar digital vein of index finger ×8；Proper palmar digital vein of little finger ×11；Proper palmar digital vein of middle finger ×7；Proper palmar digital vein of ring finger ×8；radial vein ×4；subscapular vein ×4；superficial palmar venous arch ×4；suprascapular vein ×4；ulnar vein ×4

</details>

<details><summary><strong>胸腔 → 縱隔與心臟</strong>：321 個網格，120 個名稱；內部視圖中 64 個骨骼半透明。</summary>

- **動脈**（29）：Arch of aorta；Ascending aorta；Atrioventricular nodal artery；Brachiocephalic artery；Bronchial artery ×2；Bronchial branch of arch of aorta ×2；Circumflex branch of coronary artery ×12；conus artery ×4；Conus branch of anterior interventricular branch of coronary artery ×4；Descending aorta；Descending thoracic aorta ×2；Diagonal branch of anterior descending branch of coronary artery ×18；Esophageal artery ×2；First anterior branch of anterior interventricular branch of coronary artery ×4；First anterior ventricular branch of coronary artery ×6；First posterior ventricular branch of coronary artery ×17；First septal branch of posterior interventricular artery ×2；Marginal branch of coronary artery ×10；pericardiophrenic artery ×2；Posterior interventricular branch of coronary artery ×15；pulmonary artery ×4；Pulmonary trunk ×2；Second anterior branch of anterior interventricular branch of coronary artery ×2；Second septal branch of posterior interventricular artery ×2；Septal branch of anterior interventricular artery ×6；Set of oesophageal branches of thoracic aorta ×2；Third anterior branch of anterior interventricular branch of coronary artery ×4；Trunk of anterior interventricular branch of coronary artery ×2；Trunk of coronary artery ×3
- **心臟**（13）：Anterior cusp of aortic valve；anterior cusp of pulmonary valve ×2；Anterior leaflet of mitral valve；Anterior leaflet of tricuspid valve；Cavity of atrium ×2；Cavity of ventricle ×2；posterior cusp of aortic valve ×2；Posterior cusp of pulmonary valve；Posterior leaflet of mitral valve；Posterior leaflet of tricuspid valve；Septal leaflet of tricuspid valve；Wall of atrium ×2；Wall of ventricle
- **消化**（1）：Esophagus
- **淋巴**（1）：Thoracic duct
- **肌肉**（6）：Anterior papillary muscle of ventricle；Anterolateral head of lateral papillary muscle of ventricle；Diaphragm；Lateral papillary muscle of ventricle；Posterior papillary muscle of ventricle；Septal papillary muscle of ventricle
- **神經**（3）：Anterior vagal trunk；Esophageal plexus；Posterior vagal trunk
- **呼吸**（4）：Groove for first rib of lung ×2；main bronchus；main bronchus proper；Trachea
- **漿膜**（3）：Fibrous pericardium；Parietal layer of serous pericardium；Visceral layer of serous pericardium
- **骨**（45）：Body of sternum；eighth rib ×2；Eighth thoracic vertebra；eleventh rib ×2；Eleventh thoracic vertebra；fifth costal cartilage ×2；fifth rib ×2；Fifth thoracic vertebra；first costal cartilage ×2；first rib ×2；First thoracic vertebra；fourth costal cartilage ×2；fourth rib ×2；Fourth thoracic vertebra；Intervertebral disk of eighth thoracic vertebra；Intervertebral disk of eleventh thoracic vertebra；Intervertebral disk of fifth thoracic vertebra；Intervertebral disk of first thoracic vertebra；Intervertebral disk of fourth thoracic vertebra；Intervertebral disk of ninth thoracic vertebra；Intervertebral disk of second thoracic vertebra；Intervertebral disk of seventh thoracic vertebra；Intervertebral disk of sixth thoracic vertebra；Intervertebral disk of tenth thoracic vertebra；Intervertebral disk of third thoracic vertebra；Manubrium；ninth rib ×2；Ninth thoracic vertebra；second costal cartilage ×2；second rib ×2；Second thoracic vertebra；seventh costal cartilage ×2；seventh rib ×2；Seventh thoracic vertebra；sixth costal cartilage ×2；sixth rib ×2；Sixth thoracic vertebra；tenth rib ×2；Tenth thoracic vertebra；third costal cartilage ×2；third rib ×2；Third thoracic vertebra；twelfth rib ×2；Twelfth thoracic vertebra；Xiphoid process
- **靜脈**（15）：Accessory hemiazygos vein ×2；Anterior cardiac vein ×4；Anterior interventricular vein ×16；Azygos vein ×2；Coronary sinus；Great cardiac vein ×2；Hemiazygos vein ×2；inferior pulmonary vein ×7；Inferior vena cava ×4；marginal vein ×11；Middle cardiac vein ×23；pericardiophrenic vein ×2；Small cardiac vein ×3；superior pulmonary vein ×5；Superior vena cava ×2

</details>

<details><summary><strong>胸腔 → 胸壁</strong>：188 個網格，96 個名稱。</summary>

- **動脈**（14）：anterior intercostal arteries ×2；costocervical trunk ×2；first posterior intercostal artery ×4；internal thoracic artery ×4；lateral mammary artery ×2；lateral thoracic artery ×4；medial mammary branch of internal thoracic artery ×2；musculophrenic artery ×4；Posterior intercostal arteries ×4；second posterior intercostal artery ×4；superior epigastric artery ×4；superior intercostal artery ×2；superior thoracic artery ×2；supreme intercostal artery ×2
- **結締組織**（2）：clavipectoral triangle ×2；suspensory ligament of breast ×2
- **體表**（1）：Skin
- **肌肉**（16）：Abdominal part of pectoralis major ×2；Clavicular part of pectoralis major ×2；Diaphragm；external intercostal muscle ×2；innermost intercostal muscle ×2；internal intercostal muscle ×2；latissimus dorsi ×2；pectoralis minor ×2；serratus anterior ×2；serratus posterior superior ×2；Set of levatores costarum breves ×2；Set of levatores costarum longi ×2；Sternocostal part of pectoralis major ×2；subclavius ×2；subcostal muscles ×2；transversus thoracis ×4
- **神經**（3）：dorsal ramus of thoracic spinal nerve ×2；intercostobrachial nerve ×2；posterior cutaneous branch of dorsal ramus of thoracic spinal nerve ×2
- **生殖**（6）：adipose tissue of breast ×2；areola ×2；lactiferous ducts ×2；lactiferous sinuses ×2；mammary gland ×2；nipple ×2
- **呼吸**（1）：Groove for first rib of lung ×2
- **骨**（45）：Body of sternum；eighth rib ×2；Eighth thoracic vertebra；eleventh rib ×2；Eleventh thoracic vertebra；fifth costal cartilage ×2；fifth rib ×2；Fifth thoracic vertebra；first costal cartilage ×2；first rib ×2；First thoracic vertebra；fourth costal cartilage ×2；fourth rib ×2；Fourth thoracic vertebra；Intervertebral disk of eighth thoracic vertebra；Intervertebral disk of eleventh thoracic vertebra；Intervertebral disk of fifth thoracic vertebra；Intervertebral disk of first thoracic vertebra；Intervertebral disk of fourth thoracic vertebra；Intervertebral disk of ninth thoracic vertebra；Intervertebral disk of second thoracic vertebra；Intervertebral disk of seventh thoracic vertebra；Intervertebral disk of sixth thoracic vertebra；Intervertebral disk of tenth thoracic vertebra；Intervertebral disk of third thoracic vertebra；Manubrium；ninth rib ×2；Ninth thoracic vertebra；second costal cartilage ×2；second rib ×2；Second thoracic vertebra；seventh costal cartilage ×2；seventh rib ×2；Seventh thoracic vertebra；sixth costal cartilage ×2；sixth rib ×2；Sixth thoracic vertebra；tenth rib ×2；Tenth thoracic vertebra；third costal cartilage ×2；third rib ×2；Third thoracic vertebra；twelfth rib ×2；Twelfth thoracic vertebra；Xiphoid process
- **靜脈**（8）：internal thoracic vein ×2；lateral thoracic vein ×4；musculophrenic vein ×4；posterior intercostal veins ×2；Set of anterior intercostal veins ×4；superior epigastric vein ×2；superior intercostal vein ×4；thoracoepigastric vein ×2

</details>

<details><summary><strong>胸腔 → 肺與胸膜</strong>：594 個網格，147 個名稱；內部視圖中 64 個骨骼半透明。</summary>

- **動脈**（34）：Accessory subsuperior branch of posterior basal segmental artery ×4；anterior basal segmental artery ×6；Anterior branch of anterior segmental artery ×8；Anterior branch of lateral segmental artery ×4；Anterior part of apical segmental artery ×8；anterior segmental artery ×16；Apical part of apical segmental artery ×8；Apical part of posterior segmental artery ×5；apical segmental artery ×8；Basal branch of anterior basal segmental artery ×4；Bronchial artery ×2；Bronchial branch of arch of aorta ×2；Inferior branch of medial segmental artery ×4；Inferior lingular artery ×4；lateral basal segmental artery ×7；Lateral branch of anterior basal segmental artery ×2；Lateral branch of lateral basal segmental artery ×8；Lateral branch of superior segmental artery ×6；Laterobasal branch of posterior basal segmental artery ×4；medial basal segmental artery ×4；Medial branch of superior segmental artery ×6；Mediobasal branch of posterior basal segmental artery ×4；posterior basal segmental artery ×12；Posterior branch of anterior segmental artery ×6；Posterior branch of lateral segmental artery ×4；Posterior part of posterior segmental artery ×6；posterior segmental artery ×6；pulmonary artery ×4；Pulmonary trunk ×2；Superior branch of medial segmental artery ×3；Superior branch of superior segmental artery ×6；Superior lingular artery ×8；superior segmental artery ×14；upper lobar artery ×2
- **結締組織**（1）：pulmonary ligament ×2
- **肌肉**（1）：Diaphragm
- **呼吸**（40）：anterior basal segmental bronchial tree ×6；Anterior border of lung ×2；anterior segmental bronchial tree ×15；Apex of lung ×2；apical segmental bronchial tree ×14；Cardiac impression of lung ×2；Cardiac notch of lung；Contact area for thymus of lung ×2；Contact area for trachea of lung ×2；Diaphragmatic surface of lung ×2；Esophageal impression of lung；Groove for aortic arch；Groove for azygos vein；Groove for brachiocephalic vein ×2；Groove for descending aorta；Groove for esophagus；Groove for first rib of lung ×2；Groove for inferior vena cava；groove for subclavian artery ×2；Groove for superior vena cava；Hilum of lung ×2；Horizontal fissure of lung；Inferior border of lung ×2；Inferior lingular bronchial tree ×2；lateral basal segmental bronchial tree ×8；Lateral segmental bronchial tree ×4；Lingula of lung；Lower lobe of lung ×2；main bronchus；main bronchus proper；medial basal segmental bronchial tree ×4；Medial segmental bronchial tree ×4；Middle lobe of lung；Oblique fissure of lung ×2；posterior basal segmental bronchial tree ×12；posterior segmental bronchial tree ×9；Superior lingular bronchial tree ×4；superior segmental bronchial tree ×16；Trachea；Upper lobe of lung ×2
- **漿膜**（5）：Cervical part (cupula) of parietal pleura ×2；Costal part of parietal pleura ×2；Diaphragmatic part of parietal pleura ×2；Mediastinal part of parietal pleura ×2；visceral pleura ×2
- **骨**（45）：Body of sternum；eighth rib ×2；Eighth thoracic vertebra；eleventh rib ×2；Eleventh thoracic vertebra；fifth costal cartilage ×2；fifth rib ×2；Fifth thoracic vertebra；first costal cartilage ×2；first rib ×2；First thoracic vertebra；fourth costal cartilage ×2；fourth rib ×2；Fourth thoracic vertebra；Intervertebral disk of eighth thoracic vertebra；Intervertebral disk of eleventh thoracic vertebra；Intervertebral disk of fifth thoracic vertebra；Intervertebral disk of first thoracic vertebra；Intervertebral disk of fourth thoracic vertebra；Intervertebral disk of ninth thoracic vertebra；Intervertebral disk of second thoracic vertebra；Intervertebral disk of seventh thoracic vertebra；Intervertebral disk of sixth thoracic vertebra；Intervertebral disk of tenth thoracic vertebra；Intervertebral disk of third thoracic vertebra；Manubrium；ninth rib ×2；Ninth thoracic vertebra；second costal cartilage ×2；second rib ×2；Second thoracic vertebra；seventh costal cartilage ×2；seventh rib ×2；Seventh thoracic vertebra；sixth costal cartilage ×2；sixth rib ×2；Sixth thoracic vertebra；tenth rib ×2；Tenth thoracic vertebra；third costal cartilage ×2；third rib ×2；Third thoracic vertebra；twelfth rib ×2；Twelfth thoracic vertebra；Xiphoid process
- **靜脈**（21）：anterior basal segmental vein ×11；Anterior part of apical segmental vein ×4；Anterior part of lateral segmental vein ×6；anterior segmental vein ×10；Apical part of apical segmental vein ×6；apical segmental vein ×14；Inferior lingular vein ×4；Inferior part of anterior segmental vein ×2；Inferior part of medial segmental vein ×4；inferior pulmonary vein ×7；lateral basal segmental vein ×16；medial basal segmental vein ×4；posterior basal segmental vein ×26；Posterior part of lateral segmental vein ×6；posterior segmental vein ×33；Superior lingular vein ×4；Superior part of anterior segmental vein ×2；Superior part of medial segmental vein ×2；superior pulmonary vein ×5；superior segmental vein ×12；Trunk of apical segmental vein ×2

</details>

<details><summary><strong>背部</strong>：165 個網格，109 個名稱。</summary>

- **結締組織**（3）：denticulate ligament ×2；Ligamentum flavum；thoracolumbar fascia
- **體表**（1）：Skin
- **肌肉**（35）：Ascending part of trapezius ×2；cervical rotator ×2；Descending part of trapezius ×2；iliocostalis cervicis ×2；iliocostalis lumborum ×2；iliocostalis thoracis ×2；interspinalis thoracis ×2；lateral lumbar intertransversarius ×2；latissimus dorsi ×2；longissimus capitis ×2；longissimus cervicis ×2；longissimus thoracis ×2；lumbar rotator ×2；medial lumbar intertransversarius ×2；multifidus ×2；rhomboid major ×2；rhomboid minor ×2；semispinalis capitis ×2；semispinalis cervicis ×2；semispinalis thoracis ×2；serratus posterior inferior ×2；serratus posterior superior ×2；set of anterior cervical intertransversarii ×2；set of interspinales cervicis ×2；set of interspinales lumborum ×2；Set of levatores costarum breves ×2；Set of levatores costarum longi ×2；set of posterior cervical intertransversarii ×2；spinalis ×2；spinalis cervicis ×2；spinalis thoracis ×2；splenius capitis ×2；splenius cervicis ×2；thoracic rotator ×2；Transverse part of trapezius ×2
- **神經**（18）：C1 spinal nerve ×2；C2 spinal nerve ×2；C3 spinal nerve ×2；C4 spinal nerve ×2；C5 spinal nerve ×2；C6 spinal nerve ×2；C7 spinal nerve ×2；C8 spinal nerve ×2；dorsal ramus of C1 spinal nerve ×2；dorsal ramus of C2 spinal nerve ×2；dorsal ramus of C3 spinal nerve ×2；dorsal ramus of C4 spinal nerve ×2；dorsal ramus of C5 spinal nerve ×2；dorsal ramus of C6 spinal nerve ×2；dorsal ramus of C7 spinal nerve ×2；dorsal ramus of C8 spinal nerve ×2；dorsal ramus of thoracic spinal nerve ×2；posterior cutaneous branch of dorsal ramus of thoracic spinal nerve ×2
- **骨**（52）：Atlas；Axis；Coccyx；Eighth thoracic vertebra；Eleventh thoracic vertebra；Fifth cervical vertebra；Fifth lumbar vertebra；Fifth thoracic vertebra；First lumbar vertebra；First thoracic vertebra；Fourth cervical vertebra；Fourth lumbar vertebra；Fourth thoracic vertebra；Intervertebral disk；Intervertebral disk of axis；Intervertebral disk of eighth thoracic vertebra；Intervertebral disk of eleventh thoracic vertebra；Intervertebral disk of fifth cervical vertebra；Intervertebral disk of fifth lumbar vertebra；Intervertebral disk of fifth thoracic vertebra；Intervertebral disk of first lumbar vertebra；Intervertebral disk of first thoracic vertebra；Intervertebral disk of fourth cervical vertebra；Intervertebral disk of fourth lumbar vertebra；Intervertebral disk of fourth thoracic vertebra；Intervertebral disk of ninth thoracic vertebra；Intervertebral disk of second lumbar vertebra；Intervertebral disk of second thoracic vertebra；Intervertebral disk of seventh cervical vertebra；Intervertebral disk of seventh thoracic vertebra；Intervertebral disk of sixth cervical vertebra；Intervertebral disk of sixth thoracic vertebra；Intervertebral disk of tenth thoracic vertebra；Intervertebral disk of third cervical vertebra；Intervertebral disk of third lumbar vertebra；Intervertebral disk of third thoracic vertebra；levator scapulae ×2；Ninth thoracic vertebra；Posterior arch of atlas；Sacrum ×2；Second lumbar vertebra；Second thoracic vertebra；Seventh cervical vertebra；Seventh thoracic vertebra；Sixth cervical vertebra；Sixth thoracic vertebra；Spinous process of axis；Tenth thoracic vertebra；Third cervical vertebra；Third lumbar vertebra；Third thoracic vertebra；Twelfth thoracic vertebra

</details>

<details><summary><strong>腹腔 → 腹腔器官</strong>：319 個網格，140 個名稱；內部視圖中 14 個骨骼半透明。</summary>

- **動脈**（47）：Abdominal aorta；Anterior cecal artery ×2；Anterior inferior pancreaticoduodenal artery ×2；Anterior inferior segmental hepatic artery；Anterior superior pancreaticoduodenal artery ×2；Anterior superior segmental hepatic artery ×2；Appendicular artery ×2；Ascending branch of colic artery ×2；Ascending branch of inferior branch of ileocolic artery ×2；Caudal pancreatic artery ×2；Caudate lobe branch of hepatic artery ×4；Celiac artery ×2；Celiac trunk；colic artery ×3；Common hepatic artery ×2；Descending aorta；Descending branch of colic artery ×2；Dorsal pancreatic artery；gastric artery ×4；gastro-epiploic artery ×4；Great pancreatic artery；Hepatic artery proper ×2；Ileal artery；Ileal branch of inferior branch of ileocolic artery；Ileocolic artery ×2；Inferior mesenteric artery ×2；Inferior pancreatic artery ×2；Inferior pancreaticoduodenal artery；Lateral inferior segmental hepatic artery ×2；Lateral superior segmental hepatic artery ×4；lobe branch of hepatic artery ×4；Marginal artery of colon；Marginal colic artery；Medial inferior segmental hepatic artery ×2；Medial superior segmental hepatic artery ×2；Middle colic artery ×2；Posterior cecal artery ×2；Posterior inferior pancreaticoduodenal artery；Posterior inferior segmental hepatic artery ×2；Posterior superior pancreaticoduodenal artery；Posterior superior segmental hepatic artery ×3；Sigmoid artery ×2；Splenic artery ×8；Superior mesenteric artery ×2；Trunk of gastroduodenal artery；Trunk of hepatic artery ×2；Trunk of superior mesenteric artery
- **消化**（38）：Anterior inferior tributary of hepatic biliary tree；Anterior superior tributary of hepatic biliary tree；Appendix；Ascending colon；Caudate lobe of liver；Caudate lobe tributary of hepatic biliary tree；Common hepatic duct；Cystic duct；Descending colon；Distal part of ileum ×11；Distal part of jejunum ×10；duct of caudate lobe of liver；Duodenum；Gallbladder；hepatic duct ×2；Ileocecal junction；Lateral inferior tributary of hepatic biliary tree；Lateral superior tributary of hepatic biliary tree ×2；Medial inferior tributary of hepatic biliary tree；Medial superior tributary of hepatic biliary tree ×2；Mesentery of small intestine；Mesoappendix；Middle part of ileum ×10；Middle part of jejunum ×5；Pancreas；Pancreatic duct；Pancreatic duct tree；Parenchyma of pancreas；Posterior inferior tributary of hepatic biliary tree；Posterior superior tributary of hepatic biliary tree ×2；Proximal part of ileum ×10；Proximal part of jejunum ×8；Stomach；Taenia libera；Taenia mesocolica；Taenia omentalis；Transverse colon；Transverse mesocolon
- **淋巴**（1）：Spleen
- **肌肉**（1）：Diaphragm
- **神經**（2）：celiac ganglion ×2；superior mesenteric ganglion ×2
- **骨**（7）：eighth rib ×2；eleventh rib ×2；ninth rib ×2；seventh costal cartilage ×2；seventh rib ×2；tenth rib ×2；twelfth rib ×2
- **靜脈**（44）：Anterior inferior segmental branch of portal vein；Anterior inferior segmental tributary of middle hepatic vein ×4；Anterior superior segmental branch of portal vein ×2；Anterior superior segmental tributary of hepatic vein ×2；Caudate lobe branch of portal vein ×3；colic vein ×6；gastric vein ×4；gastroepiploic vein ×4；Hepatic portal vein；hepatic vein ×4；Hepatovenous segment II ×2；Hepatovenous segment III ×2；Hepatovenous segment IV ×2；Hepatovenous segment IX；Hepatovenous segment V ×2；Hepatovenous segment VI ×2；Hepatovenous segment VII；Hepatovenous segment VIII ×3；Ileal vein ×2；Ileocolic vein ×4；Inferior mesenteric vein ×2；Inferior vena cava ×4；Lateral inferior segmental branch of portal vein ×2；Lateral inferior segmental tributary of hepatic vein ×6；Lateral superior segmental branch of portal vein ×2；Lateral superior segmental tributary of hepatic vein；Medial inferior segmental branch of portal vein ×2；Medial inferior segmental tributary of middle hepatic vein ×4；Medial superior segmental branch of portal vein；Medial superior segmental tributary of hepatic vein ×2；Middle colic vein ×2；Middle hepatic vein ×2；Pancreaticoduodenal vein ×3；portal vein ×5；Posterior inferior segmental branch of portal vein ×2；Posterior inferior segmental tributary of hepatic vein ×4；Posterior superior segmental branch of portal vein ×2；Posterior superior segmental tributary of hepatic vein ×2；Pre-hepatic portal vein；Sigmoid vein ×2；Splenic vein ×2；Superior mesenteric vein ×2；Tributary of middle hepatic vein ×2；Trunk of portal vein ×3

</details>

<details><summary><strong>腹腔 → 腹壁</strong>：62 個網格，27 個名稱。</summary>

- **動脈**（5）：inferior epigastric artery ×4；subcostal artery ×4；superficial circumflex iliac artery ×2；superficial epigastric artery ×4；superior epigastric artery ×4
- **結締組織**（3）：inguinal ligament ×2；Linea alba；rectus sheath
- **體表**（1）：Skin
- **肌肉**（7）：Diaphragm；external oblique ×2；internal oblique ×2；latissimus dorsi ×2；pyramidalis ×2；rectus abdominis ×2；transversus abdominis ×2
- **骨**（7）：eighth rib ×2；eleventh rib ×2；ninth rib ×2；seventh costal cartilage ×2；seventh rib ×2；tenth rib ×2；twelfth rib ×2
- **靜脈**（4）：inferior epigastric vein ×4；subcostal vein ×4；superficial epigastric vein ×2；superior epigastric vein ×2

</details>

<details><summary><strong>腹腔 → 後腹壁（腎、大血管）</strong>：224 個網格，62 個名稱；內部視圖中 24 個骨骼半透明。</summary>

- **動脈**（18）：Abdominal aorta；Anterior division of renal artery ×18；anterior segmental artery ×4；common iliac artery ×2；Descending aorta；inferior phrenic artery ×29；Inferior segmental branch of renal artery ×4；inferior suprarenal artery ×4；Lumbar artery ×4；middle suprarenal artery ×4；Posterior division of renal artery ×9；Posterior segmental branch of renal artery ×6；renal artery ×2；superior phrenic artery ×2；Superior segmental branch of renal artery ×4；testicular artery ×4；Trunk of renal artery ×2；Ureteric segment of renal artery ×6
- **結締組織**（1）：Aortic hiatus
- **內分泌**（1）：adrenal gland ×2
- **淋巴**（1）：Thoracic duct
- **肌肉**（4）：Diaphragm；iliacus ×2；psoas major ×2；quadratus lumborum ×2
- **神經**（7）：aorticorenal ganglion ×2；celiac ganglion ×2；greater splanchnic nerve ×2；least splanchnic nerve ×2；lesser splanchnic nerve ×2；renal ganglion ×2；superior mesenteric ganglion ×2
- **骨**（17）：eighth rib ×2；eleventh rib ×2；Fifth lumbar vertebra；First lumbar vertebra；Fourth lumbar vertebra；Intervertebral disk of fifth lumbar vertebra；Intervertebral disk of first lumbar vertebra；Intervertebral disk of fourth lumbar vertebra；Intervertebral disk of second lumbar vertebra；Intervertebral disk of third lumbar vertebra；ninth rib ×2；Second lumbar vertebra；seventh costal cartilage ×2；seventh rib ×2；tenth rib ×2；Third lumbar vertebra；twelfth rib ×2
- **泌尿**（2）：kidney ×2；ureter ×4
- **靜脈**（11）：ascending lumbar vein ×6；common iliac vein ×2；iliolumbar vein ×4；Inferior phrenic vein ×12；Inferior vena cava ×4；Lumbar vein ×4；Median sacral vein ×2；renal vein ×8；Superior phrenic vein ×13；suprarenal vein ×4；testicular vein ×4

</details>

<details><summary><strong>骨盆與會陰 → 骨盆器官</strong>：70 個網格，42 個名稱；內部視圖中 7 個骨骼半透明。</summary>

- **動脈**（3）：Sigmoid artery ×2；Superior rectal artery ×2；uterine artery ×2
- **消化**（1）：Rectum
- **生殖**（24）：ampulla of uterine tube ×2；Body of uterus；Broad ligament of uterus；cardinal ligament of uterus ×2；Cervicovaginal junction；Cervix of uterus；deferent duct ×2；fimbriae of uterine tube ×2；Fundus of uterus；infundibulum of uterine tube ×2；isthmus of uterine tube ×2；Lower uterine segment；mesosalpinx ×2；mesovarium ×2；ovarian ligament ×2；ovary ×2；Prostate；round ligament of uterus ×2；seminal vesicle ×2；suspensory ligament of ovary ×2；Uterine cornua；uterosacral ligament ×2；Vagina；Vestibule of vagina
- **漿膜**（3）：Pelvic peritoneum；Rectouterine pouch；Vesicouterine pouch
- **骨**（3）：Coccyx；hip bone ×4；Sacrum ×2
- **泌尿**（5）：Female urethra；Trigone of urinary bladder；ureter ×4；Urethra；Urinary bladder ×2
- **靜脈**（3）：Sigmoid vein ×2；Superior rectal vein ×2；uterine vein ×2

</details>

<details><summary><strong>骨盆與會陰 → 骨盆壁</strong>：102 個網格，32 個名稱。</summary>

- **動脈**（6）：deep branch of superior gluteal artery ×2；external iliac artery ×3；inferior gluteal artery ×2；internal iliac artery ×4；superficial branch of superior gluteal artery ×2；superior gluteal artery ×4
- **結締組織**（1）：tendinous arch of levator ani ×4
- **體表**（1）：Skin
- **肌肉**（7）：coccygeus ×3；iliococcygeus ×3；obturator externus ×2；obturator internus ×2；piriformis ×2；pubococcygeus ×3；puborectalis ×3
- **神經**（2）：inferior gluteal nerve ×2；nerve to obturator internus ×2
- **骨**（7）：Coccyx；hip bone ×4；iliac crest ×2；ischial tuberosity ×2；pubic tubercle ×2；Sacrum ×2；spine of ischium ×2
- **靜脈**（8）：external iliac vein ×7；iliolumbar vein ×4；inferior gluteal vein ×4；internal iliac vein ×14；lateral sacral vein ×4；Median sacral vein ×2；obturator vein ×4；superior gluteal vein ×4

</details>

<details><summary><strong>骨盆與會陰 → 會陰</strong>：58 個網格，29 個名稱。</summary>

- **動脈**（4）：deep external pudendal artery ×2；dorsal artery of penis ×8；internal pudendal artery ×2；superficial external pudendal artery ×2
- **體表**（2）：Pubic hair；Skin
- **肌肉**（2）：External anal sphincter ×3；superficial perineal muscle
- **生殖**（15）：bulb of vestibule ×2；Cervicovaginal junction；Clitoris；Corpus cavernosum of penis；Corpus spongiosum of penis；crus of clitoris ×2；epididymis ×2；Glans penis；greater vestibular gland ×2；labium majus ×2；labium minus ×2；Mons pubis；testis ×2；Vagina；Vestibule of vagina
- **骨**（1）：ischial tuberosity ×2
- **泌尿**（2）：Female urethra；Urethra
- **靜脈**（3）：Deep dorsal vein of penis ×2；internal pudendal vein ×4；Superficial dorsal vein of penis ×6

</details>

<details><summary><strong>臀區</strong>：70 個網格，30 個名稱。</summary>

- **動脈**（5）：deep branch of superior gluteal artery ×2；inferior gluteal artery ×2；internal pudendal artery ×2；superficial branch of superior gluteal artery ×2；superior gluteal artery ×4
- **結締組織**（1）：tensor fasciae latae ×2
- **體表**（1）：Skin
- **肌肉**（9）：gemellus inferior ×2；gemellus superior ×2；gluteus maximus ×2；gluteus medius ×2；gluteus minimus ×2；obturator externus ×2；obturator internus ×2；piriformis ×2；quadratus femoris ×2
- **神經**（2）：inferior gluteal nerve ×2；nerve to obturator internus ×2
- **骨**（8）：Coccyx；femur ×2；hip bone ×4；iliac crest ×2；ischial tuberosity ×2；pubic tubercle ×2；Sacrum ×2；spine of ischium ×2
- **靜脈**（4）：inferior gluteal vein ×4；internal pudendal vein ×4；obturator vein ×4；superior gluteal vein ×4

</details>

<details><summary><strong>下肢</strong>：512 個網格，185 個名稱。</summary>

- **動脈**（44）：anterior lateral malleolar artery ×2；anterior medial malleolar artery ×2；anterior tibial artery ×4；anterior tibial recurrent artery ×4；arcuate artery ×4；articular branch of descending genicular artery ×2；ascending branch of lateral circumflex femoral artery ×2；circumflex fibular artery ×2；deep branch of superior gluteal artery ×2；deep femoral artery ×4；deep plantar artery ×3；Descending branch of lateral circumflex femoral artery ×4；descending genicular artery ×4；Distal perforating artery ×3；Dorsal digital artery of foot ×4；dorsalis pedis artery ×4；femoral artery ×4；fibular artery ×4；inferior gluteal artery ×2；inferior lateral genicular artery ×4；inferior medial genicular artery ×4；lateral circumflex femoral artery ×6；lateral plantar artery ×4；lateral superior genicular artery ×4；lateral tarsal artery ×4；medial circumflex femoral artery ×4；medial plantar artery ×4；medial superior genicular artery ×4；middle genicular artery ×4；perforating branch of deep femoral artery ×2；plantar arch ×4；Plantar metatarsal artery ×4；popliteal artery ×4；posterior tibial artery ×4；saphenous branch of descending genicular artery ×2；Set of calcaneal branches of posterior tibial artery ×2；Set of common plantar digital arteries ×3；Set of dorsal digital arteries ×4；Set of perforating arteries ×6；Set of plantar digital arteries proper ×6；superficial branch of superior gluteal artery ×2；superficial medial plantar artery ×4；superior gluteal artery ×4；transverse branch of lateral circumflex femoral artery ×2
- **結締組織**（17）：adductor hiatus ×2；calcaneal tendon ×2；femoral sheath ×2；flexor retinaculum of ankle ×2；inferior extensor retinaculum of foot ×2；inferior fibular retinaculum ×2；Interosseous membrane of leg ×2；lateral patellar retinaculum ×2；long plantar ligament ×2；medial patellar retinaculum ×2；patellar ligament ×2；plantar aponeurosis ×2；quadriceps tendon ×2；superior extensor retinaculum of foot ×2；superior fibular retinaculum ×2；tarsal tunnel ×2；tensor fasciae latae ×2
- **肌肉**（54）：Abductor digiti minimi of foot ×2；abductor hallucis ×2；adductor brevis ×2；adductor longus ×2；adductor magnus ×2；adductor minimus ×2；extensor digitorum brevis ×2；extensor digitorum longus ×2；extensor hallucis brevis ×2；extensor hallucis longus ×2；First lumbrical of foot ×2；First plantar interosseous of foot ×2；flexor accessorius ×2；Flexor digiti minimi brevis of foot ×2；flexor digitorum brevis ×2；flexor digitorum longus ×2；flexor hallucis longus ×2；Fourth lumbrical of foot ×2；gemellus inferior ×2；gemellus superior ×2；gluteus maximus ×2；gluteus medius ×2；gluteus minimus ×2；gracilis ×2；iliacus ×2；Lateral head of flexor hallucis brevis ×2；Lateral head of gastrocnemius ×2；Long head of biceps femoris ×2；Medial head of flexor hallucis brevis ×2；Medial head of gastrocnemius ×2；Oblique head of adductor hallucis ×2；obturator externus ×2；obturator internus ×2；Opponens digiti minimi of foot ×2；pectineus ×2；piriformis ×2；plantaris ×2；popliteus ×2；psoas major ×2；quadratus femoris ×2；rectus femoris ×2；sartorius ×2；Second lumbrical of foot ×2；Second plantar interosseous of foot ×2；semimembranosus ×2；semitendinosus ×2；Short head of biceps femoris ×2；soleus ×2；Third lumbrical of foot ×2；Third plantar interosseous of foot ×2；Transverse head of adductor hallucis ×2；vastus intermedius ×2；vastus lateralis ×2；vastus medialis ×2
- **神經**（7）：inferior gluteal nerve ×2；lateral branch of deep fibular nerve ×2；lateral dorsal cutaneous nerve ×2；lateral sural cutaneous nerve ×2；medial branch of deep fibular nerve ×2；nerve to obturator internus ×2；nerve to vastus medialis ×2
- **骨**（39）：calcaneus ×2；cuboid bone ×2；Distal phalanx of big toe ×2；Distal phalanx of fourth toe ×2；Distal phalanx of little toe ×2；Distal phalanx of second toe ×2；Distal phalanx of third toe ×2；femur ×2；fibula ×2；fibularis brevis ×2；fibularis longus ×2；fibularis tertius ×2；fifth metatarsal bone ×2；first metatarsal bone ×2；fourth metatarsal bone ×2；hip bone ×4；iliotibial tract ×2；intermediate cuneiform bone ×2；lateral cuneiform bone ×2；medial cuneiform bone ×2；Middle phalanx of fourth toe ×2；Middle phalanx of little toe ×2；Middle phalanx of second toe ×2；Middle phalanx of third toe ×2；Navicular bone of foot ×2；patella ×2；Proximal phalanx of big toe ×2；Proximal phalanx of fourth toe ×2；Proximal phalanx of little toe ×2；Proximal phalanx of second toe ×2；Proximal phalanx of third toe ×2；second metatarsal bone ×2；Sesamoid bone of foot ×4；talus ×2；third metatarsal bone ×2；tibia ×2；tibial tuberosity ×2；tibialis anterior ×2；tibialis posterior ×2
- **靜脈**（24）：anterior tibial vein ×8；deep femoral vein ×4；Dorsal metacarpal vein；dorsal metatarsal vein ×2；Dorsal venous arch of foot ×6；femoral vein ×2；fibular vein ×10；genicular vein ×16；great saphenous vein ×4；inferior gluteal vein ×4；lateral circumflex femoral vein ×4；lateral plantar vein ×4；medial circumflex femoral vein ×4；obturator vein ×4；Plantar metatarsal vein ×3；Plantar venous arch of foot ×4；popliteal vein ×4；posterior tibial vein ×4；Set of dorsal digital veins ×3；Set of perforating veins ×8；Set of plantar digital veins ×4；small saphenous vein ×4；superior gluteal vein ×4；Tributary of plantar venous arch ×8

</details>

**驗證：** `node scripts/test-region-bar.mjs`（順序與標籤、各區域代表結構、內部視圖不含皮膚與淺層壁肌、骨骼半透明、跨區結構、左右、清單未過期；已併入 `npm run check`）；瀏覽器端用真實滑鼠逐一點擊：`node scripts/browser/region-bar-ui.cjs <port> <輸出資料夾>`（需要 Playwright 與正式 build 的 `vite preview`，約 30 分鐘，手動執行，CI 沒有）。

## 腦神經檢查（CN I–XII；先回報，沒有補任何假模型）

方法：`node scripts/audit-cranial-nerves.mjs`（用腦部詳細模式的真實網格 `brain.glb`；VIII、IX 另用主圖譜神經層 `nerve-stream.json` 的網格）。每條神經取離腦幹表面最近的一片頂點作為「出腦處」，再與同一模型中的地標（腳間窩、下丘、橄欖、錐體、小腦腳、橋腦、延腦、視交叉、眶回）比對。座標單位公尺，x 正為左。

| 腦神經 | 左 | 右 | 模型來源 | 可點選 | 位置是否正確 | 問題 |
| --- | --- | --- | --- | --- | --- | --- |
| I 嗅神經 | 有 | 有 | 腦部模型（Brain Project / Z-Anatomy）`Olfactory nerve (I)` | 是 | 大致正確：位於眶回下方（y 1.596–1.615，眶回 y 1.607–1.633），近端連視交叉前方 | 只有一條整合網格，沒有分開的嗅球與嗅束 |
| II 視神經 | 有 | 有 | 腦部模型：視神經＋視交叉（左右各半）＋視徑 | 是 | 正確 | — |
| III 動眼神經 | 有 | 有 | 腦部模型 `Oculomotor nerve (III)` | 是 | 正確：出腦處 x ±0.004、y 1.607、z 0.0035，貼在中腦前面（腳間窩附近） | — |
| IV 滑車神經 | 有 | 有 | 腦部模型 `Trochlear nerve (IV)` | 是 | 大致正確：在下丘下方（神經 y 1.596–1.601，下丘 y 1.601–1.615），中腦／橋腦交界 | 貼腦幹的一段約 2 cm 長，看起來沿腦幹貼附，不像單點出腦；需你目視確認是否繞大腦腳向前 |
| V 三叉神經 | 有 | 有 | 腦部模型：主幹、感覺根、運動根、眼神經、上頷神經、下頷神經分支 | 是 | 正確：橋腦外側（x ±0.0155，y 1.597） | — |
| VI 外展神經 | 有 | 有 | 腦部模型 `Abducens nerve (VI)` | 是 | 正確：橋延交界、近中線（x ±0.0057，y 1.58） | 中文名稱顯示為「外旋神經」，應為「外展神經」（見下） |
| VII 面神經 | 有 | 有 | 腦部模型 `Facial nerve (VII)` | 是 | 正確：小腦橋腦角，在 VIII 內側（x ±0.006） | 中文名稱顯示為「顏面神經」，跑考／常用為「面神經」（見下） |
| VIII 前庭耳蝸神經 | **腦部模式沒有**（只有「Vestibular nerve」） | **同左** | 主圖譜神經層（Z-Anatomy `nervous.glb`）有完整 `Vestibulocochlear nerve (VIII)`；腦部模型只有前庭神經 | 主圖譜是；腦部模式否 | 主圖譜版本正確：小腦橋腦角，在 VII 外側（x ±0.007–0.017） | 腦部詳細模式沒有 VIII 主幹（沒有蝸神經） |
| IX 舌咽神經 | **腦部模式沒有** | **同左** | 主圖譜神經層有 `Glossopharyngeal nerve (IX)` | 主圖譜是；腦部模式否 | 主圖譜版本正確：延髓橄欖後方（x ±0.006–0.013，y 1.567–1.577） | 腦部詳細模式沒有 IX |
| X 迷走神經 | 有 | 有 | 腦部模型 `Vagus nerve (X)` | 是 | 左側正確（延髓橄欖後溝）；右側見下 | 左迷走神經只到 y 1.346（頸部），右到 y 1.105（胸部）：左右不對稱；單一整條網格，沒有分開的多條小根 |
| XI 副神經 | 有 | 有 | 腦部模型 `Accessory nerve (XI)` | 是 | 左側正確；右側見下 | 延髓根與脊髓根是同一條網格（脊髓根經枕骨大孔上升存在：y 1.29–1.57），沒有分開標示 |
| XII 舌下神經 | 有 | 有 | 腦部模型 `Hypoglossal nerve (XII)` | 是 | 左側在延髓橄欖與錐體之間（x 0.006–0.010）；**右側不正確**：出腦處在 x −0.002，貼在中線錐體內緣 | 右側偏內約 6 mm；單一整條網格，沒有分開的多條小根 |

### 主要發現（需你決定，沒有動模型）
1. **腦部模型的延髓只有左半**：`Medulla oblongata` 只有 `.l`（x 0–0.013），沒有 `.r`；橋腦、橄欖、錐體則左右都有。所以右側 IX、X、XI、XII 的出腦處沒有延髓可貼，落在中線附近（左右不對稱，右側偏內約 6 mm）。這是模型缺右半延髓，不是神經位置做錯。修正要補右半延髓（鏡像左半或找開放模型），屬模型改動，等你決定。
2. **腦部詳細模式缺 VIII（蝸神經）與 IX**：主圖譜神經層有，且出腦處位置正確。可以考慮把這兩條從主圖譜神經層帶進腦部模式（同一來源、同座標），屬模型改動，等你決定。
3. 中文名稱：`abducens nerve (vi)` 顯示為「外旋神經」（應為「外展神經」，同樣影響「外旋神經核」）；`facial nerve (vii)` 顯示為「顏面神經」（你的清單用「面神經」）。屬名稱對照表改動，等你決定後再改。
4. 嗅球與嗅束、IX／X／XI／XII 的多條小根：模型只有一條網格，沒有分開的結構；沒有補。

### 本 PR 做的事（介面）
- 腦部詳細模式預設開啟「腦神經（根部）」，顏色改為較飽和的黃色（`#f2c200`）；腦神經開啟時動脈與靜脈（若使用者打開）自動半透明 40%，腦神經根從下面觀清楚可見。
- 搜尋修正（腦部模式與主圖譜相同規則，`app/mj-cranial-search.ts`）：`cranial nerve`、`cranial nerves`、`腦神經`、`顱神經`、輸入到一半的 `cranial` 列出十二對腦神經；`CN III`、`CN3`、`cranial nerve 3`、`cranial nerve III`、`第三對腦神經`、`第3對腦神經` 找到該對（含分支）；`nerves` 這類複數會退回單數再搜。各神經名稱（oculomotor、動眼神經…）原本就能搜。測試在 `scripts/test-search-index.mjs`。
## 左側面板底部按鈕：腦、心、肺（介面，疊在 #112 上）

- 眼、耳按鈕暫時隱藏（只隱藏入口，`MICRO_ATLAS_ENTRY=false`；程式與資料保留；`#/organ/eye`、`#/organ/ear` 回到主圖譜；ROADMAP.md 記為「未完成，暫時隱藏」）。
- 底部三個按鈕：腦、心、肺，平均分佈。
- 「肺」：主圖譜內的胸腔聚焦視圖，只顯示呼吸系統與胸廓骨骼（半透明），胸膜預設關閉；右側面板有左右肺選擇、層數 ＋／－、透明度滑桿與「返回」（回到點擊前的狀態）。獨立的肺詳細模式（切面、逐葉打開、動畫）尚未做，另開 PR。
- 限制：胸廓骨骼取肋骨、胸骨、胸椎、鎖骨；喉部軟骨屬呼吸系統，也會顯示在氣管上方。

## 心臟詳細模式：打開心腔時細血管仍顯示（#119 的修正）

- 原因：#119 只把 12 個「整個構造」標成細分支隱藏，但來源模型把右冠狀動脈、前室間支、迴旋支、心大靜脈這四個「主要」構造各存成「主幹＋側枝」多段不相連的管（例如右冠狀動脈 14 段、迴旋支 6 段），側枝跟主幹同屬一個構造，無法整個隱藏。名稱清單與目錄完全相符，隱藏邏輯也有生效（被隱藏的構造確實不畫），只是畫面上的細分支其實來自保留的主要構造。
- 修正（只改顯示，不改任何模型資料）：打開心腔或心臟時，這四個主要構造只畫「最長的那一段（主幹）」，同一構造內較短的相連段（側枝）不畫；關閉時恢復完整。自動測試 `scripts/test-heart-vessels.mjs` 用真實資料檢查這四個構造的主幹確實少於 60 % 三角形。
- 限制：「主幹」以每段相連網格的包圍盒對角線最長者判定，不是依解剖命名；若你覺得某條側枝該保留或某段主幹被誤隱藏，請告訴我是哪一段。打開心腔時無法單獨再顯示這些側枝（清單的眼睛鈕只控制整個構造）。
- 瀏覽器測試：`npm run test:heart-open -- <網址> <前綴> <截圖資料夾>`（需正式版建置與真實資料，約 2–3 分鐘）。
- 右側面板版面：資訊卡原本固定（sticky）在可捲動的面板頂端，會蓋住下方「心臟外觀與內部」「切面」等面板的文字。現在資訊卡有自己的區域（最高 38 %，內容多時卡片內捲動），下方控制面板獨立捲動；窄螢幕（≤900px）改回自然往下排列。

## 心臟詳細模式：打開心腔時隱藏表面細血管（介面改動，CI 綠後自動 merge）

- 用「逐個心腔打開」選任一心腔，或按「打開心臟（內部）」時：保留大血管與主要冠狀血管，隱藏其餘表面細分支與心包膜（三層＋兩個心包竇）。保留的血管若擋在被打開的心腔前面（由鏡頭視角判斷，視角轉動時即時更新），自動變成約 40 % 透明，不會完全隱藏。
- 關閉心腔（再按一次同一心腔、按「閉合（外表）」、改選切面或按還原）時，血管組與細分支恢復成打開前的狀態；使用者原本關掉的血管組、細分支不會被自動打開。
- 左側「構造」清單展開後，每個構造多一顆眼睛鈕：被隱藏的細分支顯示為已隱藏（灰色眼睛、文字變淡），按一下可手動顯示；點構造名稱選取時也會顯示該構造。
- 驗證：`scripts/test-heart-vessels.mjs`（併入 `npm run check`）檢查下列清單與模型目錄一致、冠狀動脈與心靜脈兩組的每個構造不是「主要」就是「細分支」。

### 分類清單（請核對，名稱為目錄中的構造名稱）
**主要（打開心腔時保留）**
- 大血管（Great vessels 組，全部 12 個）：Ascending aorta 升主動脈、Aortic arch 主動脈弓、Pulmonary trunk 肺動脈幹、Bifurcation of pulmonary trunk 肺動脈幹分叉、Left / Right pulmonary artery 左／右肺動脈、Superior / Inferior vena cava 上／下腔靜脈、左右上下肺靜脈（4 條）。
- 主要冠狀血管（6 個）：Right coronary artery 右冠狀動脈、Left coronary artery 左冠狀動脈（主幹）、Anterior interventricular artery 前室間支（LAD）、Circumflex artery 迴旋支、Coronary sinus 冠狀竇、Great cardiac vein 心大靜脈。

**細分支（打開心腔時隱藏，共 12 個，另加心包膜 5 個）**
- 動脈（7）：Right inferolateral branch of right coronary artery 右冠狀動脈右下外側支、Septal branches of anterior interventricular artery 前室間支的間隔支、Right marginal branch 右緣支（銳緣支）、Posterior interventricular branch 後室間支、Diagonal branches 對角支、Sinoatrial nodal artery 竇房結動脈、Left marginal branch 左緣支（鈍緣支）。
- 靜脈（5）：Middle cardiac vein 心中靜脈、Inferior vein of left ventricle 左心室下靜脈、Posterior vein of left ventricle 左心室後靜脈、Small cardiac vein 心小靜脈、Anterior cardiac veins 心前靜脈。
- 心包膜（Pericardium 組 5 個）：Fibrous pericardium 纖維心包、Parietal layer of serous pericardium 漿膜心包壁層、Visceral layer of serous pericardium (epicardium) 漿膜心包臟層（心外膜）、Transverse pericardial sinus 心包橫竇、Oblique pericardial sinus 心包斜竇。

需要你決定的：模型沒有獨立的「鈍緣支／銳緣支」命名，只有 Left marginal branch／Right marginal branch，我照此歸為細分支；Sinoatrial nodal artery 竇房結動脈依「其餘細小分支」歸為細分支。

## 特殊區域 #108 修改：改成「邊界線＋開口」（需人工審核，不自動 merge）

原本的圓形範圍漸變著色已移除。新的顯示方式：

- **邊界線**：每個邊界結構構成邊界的那一條邊緣畫一條粗線，每條邊不同顏色（橘、紫、青、桃紅、綠、藍），與標籤、右側清單的色點一致。
- **開口**：邊界線圍成的範圍填極淡半透明（約 30%）；肘窩、股三角等開口向一側的，兩條邊交會於尖端，頂邊以細灰線連接。
- **內容物**（動脈紅、靜脈藍、神經黃）仍沿用原本的有色高亮，範圍放大為邊界範圍的 1.7 倍；邊界結構本身不再著色。
- **綁定模型**：輪廓的每個點都取自邊界結構網格的頂點（再加一個小偏移，使線條平滑），寫在 `app/space-shapes.json`；畫面上這些點與該頂點用同一組蒙皮權重（`app/space-outline.ts`），所以關節活動時一起變形。產生方式與角點座標：`node scripts/compute-space-shapes.mjs` → `docs/space-shapes.md`（各邊兩端座標，單位公尺）。`npm run check` 會檢查檔案為最新、每條邊都找得到頂點。
- **邊的定義**：`app/mj-space-shapes.ts`（哪個結構的哪個邊緣、沿哪個軸取樣）。
- **鏡頭**：`cameraFocusScale` 由 .95 改為 .85，對著空間的開口方向（`look`）。

### 各空間形狀（模型取得的邊）
| 空間 | 形狀 | 邊 |
| --- | --- | --- |
| 四邊孔 | 四邊形 | 小圓肌下緣／肱骨外科頸／大圓肌上緣／肱三頭肌長頭外側緣 |
| 三邊孔 | 三角形 | 小圓肌下緣／肱三頭肌長頭內側緣／大圓肌上緣 |
| 三頭肌間隙 | 三角形 | 大圓肌下緣／肱三頭肌長頭外側緣／肱三頭肌外側頭與肱骨幹 |
| 鎖骨胸大肌三角 | 三角形 | 鎖骨／三角肌前緣／胸大肌鎖骨部上緣 |
| 腋窩 | 四邊形（腋窩底）＋四壁向頂端收窄 | 胸大肌下緣（腋前襞）／上臂（肱骨）／背闊肌與大圓肌下緣（腋後襞）／前鋸肌（胸壁）；細線連到鎖骨上的頂端點 |
| 肘窩 | 倒三角形 | 旋前圓肌外側緣／肱橈肌內側緣；頂邊（兩上髁連線）為連線。**模型沒有肱骨外上髁**，所以頂邊只是兩條邊上端之間的細灰線 |
| 解剖鼻煙盒 | 三角形 | 拇長伸肌腱橈側緣／橈骨（莖突）／拇長展肌與拇短伸肌腱尺側緣（新增「橈骨（莖突）」為邊界項目） |
| 股三角 | 倒三角形 | 腹股溝韌帶／縫匠肌內側緣／內收長肌內側緣 |
| 膕窩 | 菱形 | 股二頭肌／腓腸肌外側頭／腓腸肌內側頭／半膜肌與半腱肌 |
| 內收肌管 | 隧道 | 縫匠肌／股內側肌／內收長肌與內收大肌三條線，之間填色 |
| 內收肌裂孔 | 裂隙 | 內收大肌裂孔邊緣／股骨 |
| 腕隧道 | 四邊形 | 屈肌支持帶橈側、尺側附著緣／腕骨 |
| 跗管 | 四邊形 | 屈肌支持帶上、下緣／內踝、距骨、跟骨 |

### 已知限制
- 自動取邊：低面數網格上取到的邊緣偏鋸齒，已平滑；少數空間（四邊孔）的角點不完全重合，兩條邊之間會多一小段細灰線。
- 輪廓用「從邊界頂點偏移」的點，與頂點蒙皮權重相同，位置與關節運動接近但不是逐點精確；各動作下的視覺檢查請見 PR 截圖。
- 輪廓一律畫在最上層（不受遮擋），這是為了讓形狀一眼看得出來。

## 肺 PR B（需人工審核，不自動 merge；疊在 PR A #112 上）

- 肺表面的切跡、壓跡與溝在先前的跑考第 18 頁清單輪次已用「肺葉表面緊貼鄰近構造的那一片」標出（不是浮空模型，各自是肺葉表面的子網格，可點選、有資訊卡）：左肺心切跡、左肺舌葉、左右肺心壓跡、主動脈弓溝、降主動脈溝、左右鎖骨下動脈溝、左頭臂靜脈溝、右頭臂靜脈溝、上腔靜脈溝、奇靜脈溝、右肺食道溝，以及左右肺門與左右肺韌帶。PR A 刻出葉間裂後，這些區塊已用新的肺葉網格重新產生。
- 本 PR 補上你清單中先前缺的兩項：**左肺食道壓跡**、**下腔靜脈溝**（右肺下部，同樣取自肺葉表面貼近食道、下腔靜脈的一片；距離門檻 10 mm／8 mm，比其他溝大，因為這兩處在模型中沒有緊貼）。
- 肺門排列（右肺由上到下為支氣管、動脈、靜脈；左肺動脈在最上、支氣管在其後下、靜脈在前下）寫在左右肺門資訊卡的說明裡；未另外做 3D 排列。
- 尚未做：肋縱隔隱窩的胸膜形狀、PR B 專屬截圖（這些小區塊要從搜尋點選後逐一截圖，尚未完成）。

## 肺 PR A（需人工審核，不自動 merge）

| 項目 | 狀態 |
| --- | --- |
| 肺葉預設不透明、有光影；透明度滑桿保留 | 已完成 |
| 層數 ＋／－：第 1 層＝肺葉、氣管、主支氣管、肺門；第 2 層＝胸膜（半透明） | 已完成 |
| 斜裂／水平裂（右）、斜裂（左）：由相鄰肺葉的表面往內刻成可見縫隙 | 已完成（邊緣仍帶鋸齒，來源模型每葉只有約 8000 頂點） |
| 臟層胸膜（貼肺並進入葉間裂） | 已完成（0.5 mm 外擴殼） |
| 壁層胸膜：肋部、縱隔部、膈部、胸膜頂（各側 4 片，示意） | 已完成（5 mm 外擴殼，不進入葉間裂） |
| 肋膈隱窩：胸膜下緣比肺緣再低（前約 20 mm、側約 35 mm、後約 40 mm，示意肋 8／10／12） | 已完成（量值為示意，非逐肋量測） |
| 肋縱隔隱窩、肺心切跡處的胸膜形狀 | **未做**（PR B） |
| 切跡／壓痕（心切跡、小舌、主動脈弓溝、奇靜脈弓溝等）卡片、肺門排列、肺韌帶 | **未做**（PR B） |

已知限制：模型肺下緣在鎖骨中線約肋 7（教科書為肋 6），沒有另行位移肺；胸膜下緣為相對肺緣下移，所以肋 8／10／12 只是近似。胸膜下緣拉伸處會有直條狀紋理（三角形被垂直拉長），之後可用重新取樣改善。
截圖：`docs/lungs/`。

## 心臟 PR3：Quiz 判定與用語（需人工審核）

- **部分與整體**：點選或輸入題目的「其中一部分」（例如題目是肺動脈瓣，答成肺動脈瓣前瓣）或題目「所屬的整體」，判為「接近」，不算答對，列入錯題，並說明你答的是整體還是其中一部分。部分／整體的關係用構造名稱判斷（`X of Y` 的 X 是 Y 的一部分），規則在 `app/quiz/naming.ts` 的 `relationOf`，已有單元測試。
- **小目標優先（點選題）**：同一條視線上有多個構造時，取最前面表面 1.2 公分內最小（外框體積最小）的那個，瓣葉、乳突肌才點得到。不會偏向正確答案。
- **用語**：畫面、資料卡、Quiz 清單與檢查腳本中的「MJ 補建」「MJ-built」一律改為「示意構造」「schematic」。
- **上、下腔靜脈縮短**（心臟詳細模式與 Quiz 同一份模型）：上腔靜脈只保留到心房上緣上方約 1.7 公分（y ≤ 1.362），下腔靜脈只保留到心房下緣下方約 2.4 公分（y ≥ 1.222）。切口數值請核對。

## 英文發音（聽發音）

- **按鈕**：資訊卡與 Quiz 答案卡的英文名稱下方有「聽發音」鈕、英式／美式切換、狀態標籤（已校對／發音待校對）、「音標／查字典」展開區。
- **聲音來源順序**：① 維基共享資源（Wikimedia Commons）的真人錄音（只收 CC0、CC BY、CC BY-SA、公有領域；作者與授權顯示在展開區，Source & credits 有總說明）；② 沒有錄音的字改用瀏覽器語音（Web Speech API，可選英式 en-GB／美式 en-US）。名稱逐字處理：每個字用錄音或瀏覽器語音，整個名稱的錄音要每個字都有才用錄音。
- **音標**：英文維基詞典（Wiktionary，CC BY-SA 4.0）詞條上寫的 IPA，逐字相接；沒有詞條或沒有 IPA 的字留空，不猜、不補。
- **不使用**牛津、劍橋、韋氏字典的內容，「查字典」只是開新分頁的連結（Oxford Learner’s、Cambridge）。
- **狀態**：已校對＝名稱在 `app/pronunciation/reviewed.json`（由你核對後加入），或你在這個瀏覽器勾選「我已核對」（只存在瀏覽器），或每個字都有 Wiktionary 音標＋真人錄音。其餘（由瀏覽器語音朗讀、或有字缺音標）一律「發音待校對」。
- **資料**：`public/pronunciation.json`，由 `node scripts/fetch-pronunciation.mjs` 產生（只抓上肢、下肢、背部、胸腔四個考試範圍的名稱，批次請求並遵守 Retry-After）；缺 IPA／缺錄音的字列在 `docs/pronunciation-words.md`；`npm run check`（`scripts/check-pronunciation.mjs`）檢查授權、網址來源與格式。
- **目前資料**（2026-10-29 抓取）：考試範圍名稱共 293 個不同的字，193 個字有 Wiktionary 詞條資料，其中 187 個有 IPA，49 個有 Commons 免費錄音（授權：CC0 16、CC BY-SA 4.0 20、CC BY-SA 3.0 10、CC BY 3.0 4、CC BY 2.5 1）。多數解剖拉丁字（如 latissimus、pectoralis、brachii）在 Wiktionary 沒有英文詞條或沒有音標，這些名稱一律「發音待校對」，缺漏的字列在 `docs/pronunciation-words.md`。我沒有試聽或核對任何一筆音標與錄音（錄音網址來自 Commons API，因環境被 Wikimedia 限流，沒能下載檔案確認可播放），請你抽查。

- **你怎麼標已校對**：把英文名稱（例如 `Latissimus dorsi`）加進 `app/pronunciation/reviewed.json` 的 `reviewed` 清單，或回覆我名單由我加入。

## 名稱修改：僧帽瓣 → 二尖瓣（需人工審核，不自動 merge）

**畫面一律顯示「二尖瓣」；「僧帽瓣」留為同義名稱，搜尋與 Quiz 作答都接受。**

| 項目 | 主要名稱（畫面顯示） | 同義名稱（搜尋與 Quiz 作答接受） |
| --- | --- | --- |
| 左房室瓣（整體） | Mitral valve｜二尖瓣 | Left atrioventricular valve、Bicuspid valve｜僧帽瓣、左房室瓣 |
| 二尖瓣前瓣 | Anterior leaflet of mitral valve｜二尖瓣前瓣 | Anterior leaflet of left atrioventricular valve、Anterior leaflet of bicuspid valve、Anterior cusp of mitral valve｜僧帽瓣前瓣、僧帽瓣前葉、二尖瓣前葉 |
| 二尖瓣後瓣 | Posterior leaflet of mitral valve｜二尖瓣後瓣 | 同上（Posterior） |
| 右房室瓣（整體） | Tricuspid valve｜三尖瓣 | Right atrioventricular valve｜右房室瓣 |
| 三尖瓣前／下（後）／隔瓣 | Anterior / Inferior / Septal leaflet of tricuspid valve｜三尖瓣前瓣／後瓣／中隔瓣 | 原本的 "…of right atrioventricular valve"、Posterior leaflet of tricuspid valve（下瓣）、Cusp 寫法 |

範圍：心臟詳細模式（資料卡、清單、標籤、說明文字、腱索與乳突肌的描述）、主圖譜（圖譜零件的中文名「二尖瓣前葉／後葉」）、搜尋（`app/mj-search.ts`：僧帽瓣→二尖瓣、mitral↔left atrioventricular／bicuspid、tricuspid↔right atrioventricular）、Quiz 題庫與同義表（`app/quiz/synonyms.ts`、`test-quiz-naming.mjs`）、名稱對照表（`docs/naming-report.md` 重新產生）。3D 網格對應鍵（`node`）沒有改。

### 與跑考摘要用詞不同之處（請你決定）
- `docs/heart-checklist.json`（跑考摘要第 17 頁）原本寫「僧帽瓣前瓣／後瓣」；本 PR 依你的指示把清單的畫面名稱改為「二尖瓣前瓣／後瓣」，原始跑考用詞保留在各項目的 `paokaoZh` 欄位。
- `docs/curriculum-terms.json`（課程名詞）寫「Rt. atrioventricular orifice Tricuspid valves」「Left atrioventricular orifice」（房室口），未動。
- 英文：跑考清單寫「Anterior leaflet of the mitral valve」（含 the），畫面維持不加 the 的「Anterior leaflet of mitral valve」，與圖譜零件名一致。
- 三尖瓣的後（下）瓣：模型的名稱是 Inferior leaflet，跑考／BodyParts3D 用 Posterior leaflet；我把 Inferior 當主要名稱、Posterior 當同義名稱。要反過來請告訴我。

## 最新進度（2026-10-29）

### 已 merge（你已確認，squash）
| PR | 內容 |
| --- | --- |
| [#101](https://github.com/Kuan21/MJ_anatomy/pull/101) | 主圖譜：移除腳下圓台、頂部區域列淺色背景、點標題重設 |
| [#100](https://github.com/Kuan21/MJ_anatomy/pull/100) | 頭顱內黃色碎塊移除（黑名單檢查 `check:no-intracranial`；粉紅整合腦保留） |
| [#102](https://github.com/Kuan21/MJ_anatomy/pull/102) | 心臟詳細模式版面改為三欄（比照腦部） |
| [#103](https://github.com/Kuan21/MJ_anatomy/pull/103) | 移除錯誤的空間示意模型（不再畫出錯誤的空間體積） |
| [#104](https://github.com/Kuan21/MJ_anatomy/pull/104) | 骨性標記資訊卡欄位：所在骨骼／描述／附著構造／相關構造 |

### 已自動 merge（不涉及模型）
- [#107](https://github.com/Kuan21/MJ_anatomy/pull/107) 選取結構時自動顯示、鏡頭轉向並放大、擋住的結構半透明；神經資訊卡新增 Focus／Isolate／Hide；下肢分層解剖說明文字。
- [#106](https://github.com/Kuan21/MJ_anatomy/pull/106) REVIEW_LOG 更新。
- #105 Workflow `runs-on` 固定為 `ubuntu-24.04`（main 部署已確認成功，build 與 deploy 均在 ubuntu-24.04 執行）。
- Quiz 第二級、鄰近構造淡天藍、心臟詳細模式版面（先前 PR）。

### 等你審核（未 merge，需人工審核）
- [#108](https://github.com/Kuan21/MJ_anatomy/pull/108) 特殊區域改為局部高亮、新增股三角／內收肌管／膕窩、肌肉分部資訊卡（見下方「特殊區域與肌肉分部」）。
- 肩關節屈曲／外展 180° 的撕裂、浮空血管碎段與灰色盒狀物：處理中，完成後另開 PR。

### 仍待做
- 特殊區域 Quiz 題庫（找出此區域、此結構屬於哪個區域的內容物），資料完整的區域才出題。
- 跑考範圍：子宮韌帶示意模型重做、足部神經與踝伸肌支持帶。
- 上肢關節動作（肩外展 168°、內旋 48° + 肘屈 140° 撕裂）。
- 心臟 PR1–3、結締組織 PR1–3、乳房、Undo、ROADMAP 第 0 步。

## 手指活動（需人工審核，請核對）

**PR 2 更新（分支 mj-fingers-point，需人工審核）**：新增第六個手勢「指向｜Point」（食指伸直，中指、無名指、小指用握拳的角度，拇指蓋在中指中節上，與握拳相同）；手勢按鈕改成英文在上、中文在下，速度按鈕同樣；速度對六個手勢都有效。

- **「指向」先前失敗的真正原因**（PR 1 試做時中指的指動脈、指靜脈偏離指骨 6.7–7.2 mm）：不是肌腱，也不是閾值太嚴。指動靜脈的權重由 `withDigitWeights`（`digits.ts`）依「離每根手指骨折線的距離」分給各指節框架，每根手指各算一個高斯衰減（約 10 mm）後相加，所以中指橈側的指動脈會同時拿到食指的一份（量到食指近節指骨框架 0.16、掌框架 0.07）。握拳時食指和中指一起彎，這一份看不出來；指向時食指伸直、中指彎 86°，血管就被食指框架拉回去。改法：相鄰手指改為「爭奪」頂點（比最近的手指遠 2–7 mm 以上者不分權重，兩指之間的蹼仍共享），並且貼著指骨 4 mm 內的頂點完全交給該手指（原本在 3–4 mm 處仍有約 8% 留在手掌框架）。沒有改任何閾值或測試條件。
- **量測**（左手，`scripts/test-digits.mjs` 第 6 項，指骨旁頂點與骨頭帶動位置的偏差）：指向的指動脈／神經 0.1 mm（先前 6.8 mm）、指靜脈與手靜脈 0.7 mm（先前 6.5 mm）、伸指肌腱 0.5 mm；握拳同一項由 2.8 mm 降到 0.7 mm（修正也改善了其他手勢）。肌腱貼骨檢查（第 6b 項）現在含全部六個手勢：離開骨頭最多 1.3 mm（上限 4 mm），最靠近骨軸 0.8 倍半徑（下限 0.5）。
- **OK 手勢**：拇指尖與食指尖：骨尖點相距 7.6 mm（左右相同）、兩骨最近 2.8 mm（左）／2.4 mm（右）、皮膚到皮膚最近 0.5 mm（左）／0.9 mm（右），指腹相貼成圈，沒有穿入；指腹射線量測法為 −0.4 mm（左）／+1.4 mm（右）。PR 1 記錄的 −0.5／−0.6 mm 是捏取（不是 OK）。因為指腹射線量測會受射線方向影響，`test-digit-collision.mjs` 新增「皮膚到皮膚最近距離 ≤ 1.5 mm」的檢查（捏取、OK 兩側），原本的檢查沒有放寬。OK 手勢的角度沒有改。
- **已知限制**：指向的拇指蓋在中指上，不是真正的「拇指伸出」；皮膚與肌腱的實際厚度仍只有近似；模型沒有掌腱膜、屈肌腱鞘與滑車、指背腱帽，沒有補建。截圖見 PR 說明。

**PR 1 更新（分支 mj-fingers-presets）**：手指只有預設手勢，沒有逐關節滑桿；新增手勢過渡速度（慢 1.2 秒／中 0.5 秒／快 0.25 秒，平滑 smoothstep 緩動）。我的假設：使用者摘要提到「指向、抓握」等，但狀態表寫「五個按鈕」，所以保留張開、半握拳、握拳、捏取、OK 五個；「指向」已試做、未通過組織跟隨檢查，未加入，「抓握」目前以握拳／半握拳涵蓋，兩者待你決定是否要另做。上肢動作細化（PR 2）與米色翼狀物不在本 PR。

「關節系統與動作 → 上肢」新增可展開的「手指｜Fingers」：每隻手指的掌指關節（MCP）屈曲／外展、近端指間關節（PIP）、遠端指間關節（DIP），拇指的腕掌關節（CMC）屈曲、外展、對掌，以及拇指掌指關節（MCP）、指間關節（IP）；另有四個手勢預設：張開、握拳、捏取、OK 手勢。每根手指骨、拇指掌骨都是真實網格，依關節中心轉動；手部的肌肉、肌腱、血管、神經、結締組織與皮膚經由同一套蒙皮跟著各指節移動。

**關節中心**由骨骼網格求得（相鄰兩骨關節端的中點，`scripts/fit-digit-joints.mjs` → `app/biomechanics-v2/digit-joints.json`，`npm run check` 會驗證沒有過期）。左手各指關節中心（公尺）：

| 指 | 關節中心 (x, y, z) |
| --- | --- |
| thumb | cmc (0.278, 0.872, 0.026)；mcp (0.305, 0.843, 0.049)；ip (0.315, 0.818, 0.062) |
| index | cmc (0.267, 0.863, 0.023)；mcp (0.287, 0.799, 0.038)；pip (0.298, 0.766, 0.054)；dip (0.306, 0.751, 0.071) |
| middle | cmc (0.263, 0.862, 0.014)；mcp (0.266, 0.800, 0.039)；pip (0.272, 0.764, 0.061)；dip (0.276, 0.742, 0.080) |
| ring | cmc (0.249, 0.861, 0.022)；mcp (0.247, 0.805, 0.038)；pip (0.249, 0.770, 0.060)；dip (0.249, 0.750, 0.080) |
| little | cmc (0.241, 0.863, 0.026)；mcp (0.230, 0.812, 0.041)；pip (0.226, 0.783, 0.058)；dip (0.223, 0.766, 0.070) |

**轉動軸與符號**（請核對）：
- 食指、中指、無名指、小指：屈曲繞內外側軸（正值＝指尖向掌側／前方彎），外展繞前後軸（正值＝遠離中指，中指的正值＝朝拇指側）；PIP、DIP 只有屈曲。外展先於屈曲施加，屈曲後外展軸隨指骨轉動。
- 拇指：腕掌關節屈曲＝拇指橫過手掌向尺側移動；外展＝拇指向前（離開手掌平面）；對掌＝外展 0.55×、屈曲 0.4×、再繞掌骨長軸轉 0.6× 的合成動作；掌指與指間關節屈曲繞垂直於該節且指向內側的軸。這是近似，並非真正的鞍狀關節運動。

**角度範圍**（沿用 `articulation-registry.ts`）：手指 MCP 屈曲 −15～90°、外展 −20～20°，PIP 0～105°，DIP 0～80°；拇指 CMC 屈曲 −15～45°、外展 0～55°、對掌 0～50°，MCP 0～55°，IP −10～80°。超出範圍會被限制。

**手勢**：捏取與 OK 手勢的拇指與食指角度是用優化解出的，使拇指尖與食指尖相距小於 12 mm；握拳使拇指蓋在食指與中指的中節上。`scripts/test-digits.mjs`（併入 `npm run check:motion`）檢查：中立位完全不動、各軸方向、角度限制、各指節自己的框架占主導、掌骨與手掌留在手部框架、三個姿勢下手部所有軟組織沒有飛走或拉成尖刺（最大邊長伸長 < 6 倍），以及上述手勢。

**蒙皮**：每根可動手指骨（拇指掌骨與兩節指骨、四指各三節指骨，共 15 個）各有一個調色盤框架；手部框架原本的權重依頂點在休止姿勢的位置，按距離該指骨折線的遠近分給各指節（關節處 ±6 mm 漸變，手指起點前約 1 cm 開始過渡），手掌與掌骨區仍留在手部框架。皮膚、淋巴與未綁定的結締組織由建置時的 `prepare-skin-weights.mjs` 依最近骨骼自動分配到新的指節框架。

**第二輪修改（回應 #109 意見，需人工審核）**

1. **軸向與收攏**：四指的屈曲軸不再互相平行，向橈側傾斜（`FINGER_CONVERGENCE`：食指 0°、中指 2.5°、無名指 6°、小指 10°），握拳時指尖向舟狀骨結節方向收攏，不在同一平面。握拳角度：食指 MCP 82°／PIP 98°／DIP 70°，中指 86／100／74，無名指 90／102／76，小指 90／105／80（小指、無名指較大，食指較小，呈階梯；DIP 上限 80°）。
2. **拇指**：握拳時 CMC 屈曲 −15°、外展 14°、MCP 30°、IP 80°，覆在食指與中指中節背面（與食指、中指骨的最近距離 5.6／6.0 mm，沒有穿入）。捏取：對掌 30°、CMC 屈曲 −15°、MCP 11°、IP 3°，其他三指自然微屈（中 45／50／25、無名 55／58／28、小 62／62／30），拇指與食指遠節骨尖相距約 8 mm（指腹相貼的厚度），兩骨最近 4.0 mm。OK 手勢同樣重新解出（2.8 mm）。數值由 `scripts` 內的優化程式解出後寫入 `app/mj-hand-presets.ts`。
3. **指間碰撞**：`constrainDigits` 現在會把相鄰兩指的側向角度差限制在 −1° 以上（兩指只能一起偏、或分開，不能互相壓入）。新增 `scripts/test-digit-collision.mjs`（已併入 `npm run check:motion`）：用真實指骨網格取點，檢查相鄰指骨表面距離——三個手勢、每個關節各在最大／最小角度、全部最大／全部最小、再加 120 組固定亂數姿勢（左右手），任何一組都不得小於 3.5 mm（拇指對手指 1.5 mm）。靜止時相鄰指骨間距約 6 mm，握拳時 5.3–6.1 mm。
4. **軟組織跟隨**：查明長肌腱（屈指深淺肌、伸指肌等）原本在指節處是以「肌纖維收縮」變形，而不是跟著指骨，握拳時離開指骨 14–17 mm，並在指尖變成零碎、鋸齒狀碎片（先前的已知限制）。原因是「手部權重 > 0.5 才還原剛體跟隨」這個判斷沒有把轉移到指節框架的權重算進去（`soft-tissue.ts`）。已改正：肌腱在指骨旁的頂點與其指骨的偏差降到 1–3 mm。另外，位於指骨旁的肌腱／血管／神經頂點加上「與指骨軸線保持原本距離」的修正（`keepOnBone`，彎曲關節內側的兩節指骨混合時會把肌腱擠進骨頭），不會穿進骨頭（最近距離 ≥ 0.78 倍骨半徑）、也不會離骨超過約 3.4 mm（沒有拉成直線）。蚓狀肌、骨間肌、魚際肌與小魚際肌（以平均偏差檢查）、指動脈與指神經、手掌靜脈同樣跟隨（`scripts/test-digits.mjs` 第 6 項，左右手各三個姿勢）。
5. **手背靜脈網**：手背靜脈網與掌淺／深弓的遠端切口剛好落在指關節線上，原本被「手指起點前 10 mm 開始過渡」的權重拉進近節指骨，指彎曲時切口被拖著繞圈。這幾條改為留在手部框架（`HAND_ONLY`，`digits.ts`）。模型裡沒有手部的背側指靜脈。
6. **截圖**（張開、握拳、捏取 × 掌面、側面、背面；分「只開骨骼＋肌肉（含肌腱）」與「全部系統」兩組）：`docs/finger-motion/v2/`（共 18 張）。

**已知限制（更新）**：
- 模型沒有掌腱膜、指伸肌擴張部、屈肌腱鞘與滑車（`Palmar aponeurosis` 等沒有網格），所以這幾項只能列為缺漏，我沒有自行補建；屈肌腱的貼骨是上述剛體跟隨＋保持距離，不是真正的腱鞘滑車。
- 指尖仍有少量細小的深紅色殘片（屈指深肌腱末端網格的形狀本身是裂開的碎片），握拳時在指尖可見。
- 指間碰撞用骨骼表面距離（≥ 3.5 mm）判斷，沒有計算皮膚與肌腱的實際厚度；手指的皮膚、掌心肌肉彼此仍可能輕微重疊。拇指在隨機姿勢中不做碰撞限制（只檢查三個手勢與各關節極值）。
- 拇指軸向仍是近似，CMC 不是真正的鞍狀關節；DIP 與 PIP 沒有連動。
- 前臂長肌腱的長度變化沒有按力學計算。

## 特殊區域與肌肉分部（需人工審核，請核對）

### 1. 特殊區域：局部高亮（不畫任何假模型）
選擇特殊區域時，只高亮落在「空間範圍球」內的邊界與內容物，球邊緣柔和漸變；範圍外的邊界維持原色，其餘結構淡化。邊界為薄荷綠、內容物依種類著色（動脈紅、靜脈藍、神經黃，並有發光輪廓）。每個邊界與內容物附小標籤（含位置，例如「Teres minor 小圓肌 — 上界」），以細線連到最靠近區域中心的位置。鏡頭自動轉到指定角度並放大到範圍。預設與取消選擇時，模型上不顯示任何與特殊區域有關的東西。

**範圍球的數值**（單位公尺；中心由真實網格找出各邊界與內容物最靠近的交會處，`reach` 為中心到最遠一條結構的距離；半徑 `r` 為我設定的值，請核對是否合適）。完整表（含右側）見 [`docs/space-ranges.md`](docs/space-ranges.md)，由 `node scripts/compute-space-ranges.mjs` 產生，`npm run check` 會驗證沒有過期。

| 區域 | 半徑 r | 左側中心 (x, y, z) | reach |
| --- | --- | --- | --- |
| 四邊孔（quadrangular） | 0.04 | 0.1602, 1.3637, -0.0325 | 0.0094 |
| 三邊孔（triangular） | 0.03 | 0.148, 1.3648, -0.0362 | 0.0108 |
| 三頭肌間隙（triangular-interval） | 0.035 | 0.1629, 1.2988, -0.0275 | 0.0256 |
| 鎖骨胸大肌三角（clavipectoral） | 0.04 | 0.1076, 1.404, 0.0084 | 0.0208 |
| 腋窩（axillary-fossa） | 0.075 | 0.1442, 1.3515, -0.0195 | 0.0216 |
| 肘窩（cubital） | 0.05 | 0.211, 1.1228, -0.0153 | 0.0306 |
| 解剖鼻煙盒（snuffbox） | 0.03 | 0.2774, 0.876, 0.0193 | 0.0072 |
| 腕隧道（carpal-tunnel） | 0.035 | 0.2568, 0.8826, 0.0288 | 0.0066 |
| 跗隧道（tarsal-tunnel） | 0.04 | 0.0533, 0.0657, -0.0386 | 0.0146 |
| 股三角（femoral-triangle） | 0.08 | 0.0522, 0.8531, 0.0325 | 0.0384 |
| 內收肌管（adductor-canal） | 0.075 | 0.0545, 0.6022, 0.0074 | 0.0163 |
| 內收肌裂孔（adductor-hiatus） | 0.03 | 0.071, 0.5586, -0.0121 | 0.0085 |
| 膕窩（popliteal-fossa） | 0.07 | 0.0711, 0.4999, -0.0404 | 0.0361 |
| 枕下三角（suboccipital） | 0.03 | 0.0242, 1.5558, -0.0408 | 0.0207 |
| 主動脈裂孔（aortic-hiatus） | 0.04 | -0.0075, 1.1546, -0.0019 | 0.01 |

**模型沒有、因此沒有高亮的邊界／內容物**（不以假模型代替；補上後會自動出現）：
- 鎖骨胸大肌三角：胸肩峰動脈
- 腋窩：腋淋巴結
- 肘窩：肱二頭肌腱膜（頂）、肱骨外上髁（骨性標記）
- 股三角：闊筋膜（含篩筋膜）、股管與其淋巴結
- 膕窩：膕斜韌帶與膝關節囊後面、股骨膕面（暫以股骨代替）、膕筋膜、膕淋巴結
- 另外「股內側肌神經」目前是示意神經（MJ 補建），不是真實網格，請一併核對。
- 股三角、內收肌管、膕窩沒有對應的示意空間網格，因此搜尋框搜不到這三項，只能從「分層解剖 → Spaces｜特殊區域」選擇（搜尋支援待做）。

**本次邊界／內容物的依據**：採用你提供的清單；有取捨的地方：解剖鼻煙盒內容物只保留橈動脈（原有的橈神經淺支、頭靜脈已移除，以符合你的清單）；腋窩邊界改為胸大肌、背闊肌、大圓肌、前鋸肌、肱骨（移除胸小肌、肩胛下肌）。

### 2. 肌肉分部資訊卡（起點、止點、作用不再抄整條肌肉）
共 35 個分部（斜方肌降／橫／升部、三角肌前／中／後部、胸大肌鎖骨／胸肋／腹部、肱二頭肌長／短頭、肱三頭肌長／外側／內側頭、腓腸肌內／外側頭、股二頭肌長／短頭、旋前圓肌與尺側屈腕肌兩頭、拇內收肌與拇趾內收肌兩頭、拇短屈肌與拇趾短屈肌兩頭、咬肌淺／深部、外翼肌上／下頭、眼輪匝肌眶部／瞼部）。`npm run check` 會檢查每一個這類分部都有自己的資料，沒有就失敗。完整表（含神經與血供）見 [`docs/muscle-part-facts.md`](docs/muscle-part-facts.md)。起點、止點、作用如下，請逐列核對：

| 分部 | 中文 | 起點 | 止點 | 作用 |
| --- | --- | --- | --- | --- |
| abdominal part of pectoralis major | 胸大肌腹部 | Aponeurosis of the external oblique | Lateral lip of the intertubercular sulcus of the humerus | Depresses the shoulder; extends the flexed arm |
| acromial part of deltoid | 三角肌肩峰部（中部） | Lateral margin and superior surface of the acromion | Deltoid tuberosity of the humerus | Abducts the arm (from about 15° to 90°, after supraspinatus has started the movement) |
| ascending part of trapezius | 斜方肌升部 | Spinous processes of T4–T12 and the supraspinous ligaments | Tubercle at the medial end of the spine of the scapula (via an aponeurosis) | Depresses the scapula; with the descending part rotates the scapula upward |
| clavicular part of deltoid | 三角肌鎖骨部（前部） | Lateral third of the anterior border of the clavicle | Deltoid tuberosity of the humerus | Flexes and medially rotates the arm |
| clavicular part of pectoralis major | 胸大肌鎖骨部 | Medial half of the clavicle | Lateral lip of the intertubercular sulcus of the humerus | Flexes the arm (from the extended position); adducts and medially rotates the arm |
| deep part of masseter | 咬肌深部 | Medial surface of the zygomatic arch and the posterior third of its inferior border | Superior half of the ramus of the mandible and the lateral surface of the coronoid process | Elevates and retracts the mandible |
| descending part of trapezius | 斜方肌降部 | Medial third of superior nuchal line, external occipital protuberance, nuchal ligament | Posterior border of lateral third of clavicle | Elevates the scapula (shrug); with the ascending part rotates the scapula upward; extends and rotates the head and neck |
| humeral head of flexor carpi ulnaris | 尺側屈腕肌肱骨頭 | Medial epicondyle of the humerus (common flexor tendon) | Pisiform, hook of the hamate and base of the fifth metacarpal | Flexes and adducts (ulnar deviation) the wrist |
| humeral head of pronator teres | 旋前圓肌肱骨頭 | Medial epicondyle of the humerus (common flexor tendon) | Middle of the lateral surface of the radius (pronator tuberosity) | Pronates the forearm; weakly flexes the elbow |
| lateral head of flexor hallucis brevis | 拇趾短屈肌外側頭 | Cuboid and lateral cuneiform | Lateral side of the base of the proximal phalanx of the great toe (via the lateral sesamoid) | Flexes the metatarsophalangeal joint of the great toe |
| lateral head of gastrocnemius | 腓腸肌外側頭 | Lateral surface of the lateral condyle of the femur | Posterior surface of the calcaneus via the calcaneal tendon | Plantarflexes the ankle; flexes the knee |
| lateral head of triceps brachii | 肱三頭肌外側頭 | Posterior surface of the humerus, above the radial groove | Proximal end of the olecranon of the ulna (common tendon) | Extends the elbow (the strong head for powerful extension) |
| long head of biceps brachii | 肱二頭肌長頭 | Supraglenoid tubercle of the scapula | Radial tuberosity and, via the bicipital aponeurosis, the deep fascia of the forearm | Flexes the elbow and supinates the forearm; helps hold the humeral head in the glenoid |
| long head of biceps femoris | 股二頭肌長頭 | Inferomedial part of the ischial tuberosity | Head of the fibula (lateral side); lateral condyle of the tibia | Flexes the knee, extends the hip and laterally rotates the flexed knee |
| long head of triceps brachii | 肱三頭肌長頭 | Infraglenoid tubercle of the scapula | Proximal end of the olecranon of the ulna (common tendon) | Extends the elbow; extends and adducts the arm at the shoulder |
| lower head of lateral pterygoid | 外翼肌下頭 | Lateral surface of the lateral plate of the pterygoid process | Pterygoid fovea on the neck of the mandible | Protrudes and depresses the mandible (opens the mouth); acting alone on one side moves the jaw to the opposite side |
| medial head of flexor hallucis brevis | 拇趾短屈肌內側頭 | Medial cuneiform and the tendon of tibialis posterior | Medial side of the base of the proximal phalanx of the great toe (via the medial sesamoid) | Flexes the metatarsophalangeal joint of the great toe |
| medial head of gastrocnemius | 腓腸肌內側頭 | Popliteal surface of the femur, above the medial condyle | Posterior surface of the calcaneus via the calcaneal tendon | Plantarflexes the ankle; flexes the knee |
| medial head of triceps brachii | 肱三頭肌內側頭 | Posterior surface of the humerus, below the radial groove, and the medial and lateral intermuscular septa | Proximal end of the olecranon of the ulna (common tendon) | Extends the elbow (the constant, weaker head) |
| oblique head of adductor hallucis | 拇趾內收肌斜頭 | Bases of metatarsals 2–4 and the sheath of the tendon of fibularis longus | Lateral side of the base of the proximal phalanx of the great toe (via the lateral sesamoid) | Adducts the great toe; helps maintain the transverse arch of the foot |
| oblique head of adductor pollicis | 拇內收肌斜頭 | Bases of the second and third metacarpals, capitate and adjacent carpal bones | Medial side of the base of the proximal phalanx of the thumb (via the sesamoid) | Adducts the thumb |
| orbital part of orbicularis oculi | 眼輪匝肌眶部 | Nasal part of the frontal bone, frontal process of the maxilla and the medial palpebral ligament | Loops round the orbit and returns to the medial side, blending with the surrounding muscles | Closes the eyelids tightly (forced closure) |
| palpebral part of orbicularis oculi | 眼輪匝肌瞼部 | Medial palpebral ligament and the adjacent bone | Lateral palpebral raphe | Closes the eyelids gently (blinking) |
| short head of biceps brachii | 肱二頭肌短頭 | Apex of the coracoid process of the scapula | Radial tuberosity and, via the bicipital aponeurosis, the deep fascia of the forearm | Flexes the elbow and supinates the forearm; weakly flexes and adducts the arm at the shoulder |
| short head of biceps femoris | 股二頭肌短頭 | Lateral lip of the linea aspera and the lateral supracondylar line of the femur | Head of the fibula (lateral side); lateral condyle of the tibia | Flexes the knee and laterally rotates the flexed knee (does not act on the hip) |
| spinal part of deltoid | 三角肌肩胛棘部（後部） | Inferior lip of the crest of the spine of the scapula | Deltoid tuberosity of the humerus | Extends and laterally rotates the arm |
| sternocostal part of pectoralis major | 胸大肌胸肋部 | Anterior surface of the sternum and the costal cartilages of ribs 1–6 | Lateral lip of the intertubercular sulcus of the humerus | Adducts and medially rotates the arm; extends the flexed arm |
| superficial head of flexor pollicis brevis | 拇短屈肌淺頭 | Flexor retinaculum and tubercle of the trapezium | Lateral side of the base of the proximal phalanx of the thumb (via the lateral sesamoid) | Flexes the metacarpophalangeal joint of the thumb |
| superficial part of masseter | 咬肌淺部 | Zygomatic process of the maxilla and the anterior two thirds of the inferior border of the zygomatic arch | Angle and inferior half of the lateral surface of the ramus of the mandible | Elevates and protrudes the mandible |
| transverse head of adductor hallucis | 拇趾內收肌橫頭 | Capsules of the metatarsophalangeal joints 3–5 and the deep transverse metatarsal ligament | Lateral side of the base of the proximal phalanx of the great toe (via the lateral sesamoid) | Adducts the great toe; helps maintain the transverse arch of the foot |
| transverse head of adductor pollicis | 拇內收肌橫頭 | Anterior surface of the shaft of the third metacarpal | Medial side of the base of the proximal phalanx of the thumb (via the sesamoid) | Adducts the thumb |
| transverse part of trapezius | 斜方肌橫部 | Spinous processes of C7–T3 and the supraspinous ligament | Medial margin of the acromion and the superior lip of the crest of the spine of the scapula | Retracts the scapula (draws it towards the vertebral column) |
| ulnar head of flexor carpi ulnaris | 尺側屈腕肌尺骨頭 | Olecranon and posterior border of the ulna (via an aponeurosis) | Pisiform, hook of the hamate and base of the fifth metacarpal | Flexes and adducts (ulnar deviation) the wrist |
| ulnar head of pronator teres | 旋前圓肌尺骨頭 | Medial border of the coronoid process of the ulna | Middle of the lateral surface of the radius (pronator tuberosity) | Pronates the forearm |
| upper head of lateral pterygoid | 外翼肌上頭 | Infratemporal surface and infratemporal crest of the greater wing of the sphenoid | Articular disc and capsule of the temporomandibular joint | Steadies the articular disc during closing of the mouth |

## 總覽

最後更新：2026-10-28（#93 合併後）。

### 已 merge（已審核）：你審核後授權合併
| PR | 內容 |
| --- | --- |
| [#87](https://github.com/Kuan21/MJ_anatomy/pull/87) | 女性骨盆器官：膀胱、輸尿管、尿道、腹膜陷凹、器官分色 |
| [#92](https://github.com/Kuan21/MJ_anatomy/pull/92) | 腦部清單分層、全部構造清單與資訊卡、第四腦室（原版；你的審核意見在 #95） |
| [#93](https://github.com/Kuan21/MJ_anatomy/pull/93) | 膝部肌腱與韌帶：股四頭肌腱、髕韌帶、髕內／外側支持帶（已知限制：髕韌帶側視與髕骨尖之間有小縫隙、支持帶偏平片；全身肌腱／韌帶盒狀檢查尚未做） |

### 已 merge（需人工審核類，合併前我未取得你的審核；請補審）
- [#83](https://github.com/Kuan21/MJ_anatomy/pull/83) 血管表面平滑與靜脈補齊、[#85](https://github.com/Kuan21/MJ_anatomy/pull/85) 女性骨盆、[#81](https://github.com/Kuan21/MJ_anatomy/pull/81) CSF 粒子限制、[#77](https://github.com/Kuan21/MJ_anatomy/pull/77) 資訊卡欄位依結構類型：已 merge；我沒有開它們的 auto-merge，合併來源請你確認是否已審。
- [#76](https://github.com/Kuan21/MJ_anatomy/pull/76) 乳房改用 HuBMAP 等；#74、#73、#72、#71：先前輪次已合併，內容待你補審。

### 已自動 merge（不涉及模型）
[#91](https://github.com/Kuan21/MJ_anatomy/pull/91) 區域分頁、[#90](https://github.com/Kuan21/MJ_anatomy/pull/90) CSF 追蹤粒子、[#89](https://github.com/Kuan21/MJ_anatomy/pull/89) 腦部版面、[#88](https://github.com/Kuan21/MJ_anatomy/pull/88) 分頁標題、[#86](https://github.com/Kuan21/MJ_anatomy/pull/86) MOTION_AUDIT、[#84](https://github.com/Kuan21/MJ_anatomy/pull/84) REVIEW_LOG、[#82](https://github.com/Kuan21/MJ_anatomy/pull/82) 分層解剖面板、[#80](https://github.com/Kuan21/MJ_anatomy/pull/80)、[#79](https://github.com/Kuan21/MJ_anatomy/pull/79)、[#78](https://github.com/Kuan21/MJ_anatomy/pull/78)。

### 等你審核（未 merge）
| PR | 內容 | 請核對 |
| --- | --- | --- |
| [#95](https://github.com/Kuan21/MJ_anatomy/pull/95) | 依你的審核意見的腦部修改：腦葉分界溝裂（Borders）、英文資訊卡並依功能拆分、血液供應、Brodmann、第四腦室 | 見下方「待我核對」 |
| 分支 `mj-connective-layers` | 結締組織六層、掌腱膜／指滑車、骨間膜（尚未開 PR；#83 已 merge，下一步重新生成後開 PR） | — |

### 待我核對（#95）
- **Brodmann 分區**：你列為待核對的 9–12 與 46（prefrontal）、39（angular gyrus）、40（supramarginal gyrus）、23、24（cingulate gyrus）、28（entorhinal）、20、21（inferior／middle temporal gyrus）、37（occipitotemporal）、38（temporal pole）已加入；另外我在卡片寫了清單以外的 13、14（腦島）、25、27、29、30、31、32、34–36、47，也請核對。
- **血液供應**：清單以外、我依一般解剖寫的（腦神經、大腦腳底、尾狀核體與尾、視丘各核、垂體、硬腦膜動脈、杏仁核、韁核與松果腺）。
- **第四腦室**：示意重建；模型腦幹是實心網格，菱形底貼在背面。
- 模型沒有的結構（Preoccipital notch、Longitudinal fissure、下視丘各核團的獨立網格）沒有可點選卡片。

### Quiz 第二級「看結構寫名稱」（需人工審核：題庫與同義名稱表）
- **題庫範圍**：只有「有模型、有中文名、資料卡必填欄位完整、名稱在同一部位內唯一」的構造出題，合計 371 / 1047 個。排除的構造與原因逐項列在 [`docs/quiz-level2-pool.md`](docs/quiz-level2-pool.md)（由 `node scripts/report-quiz-level2.mjs` 產生，`npm run check` 會驗證它沒有過期）。排除最多的原因是資料卡欄位不完整（與 `docs/quiz-card-gaps.md` 一致）；資料補齊後會自動進入題庫。
- **判分規則**（請核對）：不分大小寫；忽略多餘空白、連字號、標點；忽略 the、muscle(s)；繁簡臺台視為相同；括號內別名與下表同義名稱都算對；英文、中文、不限三種作答語言；左右預設不要求（成對構造的 Left/Right 可省略），設定中可改為必須寫出；差 1–2 個字母（中文名四字以上差 1 字）判「接近正確」，顯示正確拼法並列入錯題；答案漏了「Left／Right」所屬的心房、心室（例如 atrium 對 Left atrium）判錯。
- **鄰近構造**：依模型邊界框距離，優先同系統，每題 2–3 個，可點擊高亮。

### Quiz 第二級同義名稱表（需人工審核，共 128 列）
以下是除了構造自己的英文名、中文名與括號內別名以外，額外接受的答案。依跑考摘要的寫法為先，其餘為通行別名；請逐列核對，有誤的告訴我刪改。程式表在 `app/quiz/synonyms.ts`。

| 構造（英文名，小寫，不含左右） | 額外接受的英文 | 額外接受的中文 |
| --- | --- | --- |
| tricuspid valve | right atrioventricular valve | 右房室瓣 |
| mitral valve | left atrioventricular valve；bicuspid valve | 僧帽瓣、左房室瓣 |
| anterior leaflet of tricuspid valve | anterior leaflet of right atrioventricular valve；anterior cusp of tricuspid valve | 三尖瓣前葉 |
| inferior leaflet of tricuspid valve | inferior leaflet of right atrioventricular valve；posterior leaflet of tricuspid valve；posterior cusp of tricuspid valve | 三尖瓣後瓣、三尖瓣下瓣 |
| septal leaflet of tricuspid valve | septal leaflet of right atrioventricular valve；septal cusp of tricuspid valve | 三尖瓣隔瓣 |
| anterior leaflet of mitral valve | anterior leaflet of left atrioventricular valve；anterior leaflet of bicuspid valve；anterior cusp of mitral valve | 僧帽瓣前瓣、僧帽瓣前葉、二尖瓣前葉 |
| posterior leaflet of mitral valve | posterior leaflet of left atrioventricular valve；posterior leaflet of bicuspid valve；posterior cusp of mitral valve | 僧帽瓣後瓣、僧帽瓣後葉、二尖瓣後葉 |
| left coronary leaflet of aortic valve | left coronary cusp of aortic valve；left coronary cusp | 主動脈瓣左冠狀瓣、左冠狀瓣 |
| right coronary leaflet of aortic valve | right coronary cusp of aortic valve；right coronary cusp | 主動脈瓣右冠狀瓣、右冠狀瓣 |
| non-coronary leaflet of aortic valve | non coronary cusp of aortic valve；noncoronary cusp；posterior cusp of aortic valve | 主動脈瓣無冠狀瓣、無冠瓣 |
| anterior semilunar cusp of pulmonary valve | anterior cusp of pulmonary valve；anterior leaflet of pulmonary valve | 肺動脈瓣前瓣 |
| left semilunar cusp of pulmonary valve | left cusp of pulmonary valve；left leaflet of pulmonary valve | 肺動脈瓣左瓣 |
| right semilunar cusp of pulmonary valve | right cusp of pulmonary valve；right leaflet of pulmonary valve | 肺動脈瓣右瓣 |
| anterior interventricular artery | left anterior descending artery；lad；anterior interventricular branch；lad artery | 前降支、左前降支、前室間動脈 |
| circumflex artery | left circumflex artery；circumflex branch | 迴旋支、左迴旋支、旋支 |
| posterior interventricular branch | posterior descending artery；pda；posterior interventricular artery | 後降支、後室間動脈 |
| right marginal branch | marginal branch of right coronary artery；acute marginal artery | 右緣支、銳緣支 |
| left marginal branch | obtuse marginal artery；marginal branch of circumflex artery | 左緣支、鈍緣支 |
| diagonal branches | diagonal arteries；diagonal branch | 對角支 |
| great cardiac vein | great vein of heart | 心大靜脈 |
| middle cardiac vein | posterior interventricular vein | 心中靜脈、後室間靜脈 |
| small cardiac vein | lesser cardiac vein | 心小靜脈 |
| coronary sinus | cardiac sinus | 冠狀竇、冠狀靜脈竇 |
| aortic arch | arch of aorta | 主動脈弓 |
| ascending aorta | aorta ascending part | 升主動脈 |
| pulmonary trunk | main pulmonary artery | 肺動脈幹、肺動脈主幹 |
| superior vena cava | svc | 上腔靜脈 |
| inferior vena cava | ivc | 下腔靜脈 |
| crista terminalis | terminal crest | 界嵴 |
| pectinate muscles | musculi pectinati；pectinate muscle | 梳狀肌 |
| interatrial septum | atrial septum | 心房中隔、房中隔 |
| interventricular septum | ventricular septum | 室間隔、心室中隔 |
| fossa ovalis | oval fossa | 卵圓窩 |
| trabeculae carneae of right ventricle | trabeculae carneae of the right ventricle；trabeculae carneae | 右心室肉柱、肉柱 |
| trabeculae carneae of left ventricle | trabeculae carneae of the left ventricle | 左心室肉柱 |
| septomarginal trabecula (moderator band) | moderator band；septomarginal trabecula | 節制索、隔緣肉柱 |
| supraventricular crest | crista supraventricularis | 室上嵴 |
| conus arteriosus | infundibulum；right ventricular outflow tract | 動脈圓錐、漏斗部 |
| aortic vestibule | vestibule of left ventricle | 主動脈前庭 |
| right auricle | right atrial appendage；auricle of right atrium | 右心耳 |
| left auricle | left atrial appendage；auricle of left atrium | 左心耳 |
| fibrous pericardium | pericardium fibrous | 纖維心包、纖維性心包 |
| pectoralis major | pec major | 胸大肌 |
| deltoid | deltoideus | 三角肌 |
| latissimus dorsi | lats | 背闊肌 |
| trapezius | trapezius muscle | 斜方肌 |
| biceps brachii | biceps | 肱二頭肌 |
| triceps brachii | triceps | 肱三頭肌 |
| brachioradialis | supinator longus | 肱橈肌 |
| gluteus maximus | glute max | 臀大肌 |
| quadriceps femoris | quadriceps；quads | 股四頭肌 |
| rectus femoris | rectus femoris muscle | 股直肌 |
| tensor fasciae latae | tensor fascia lata | 闊筋膜張肌 |
| gastrocnemius | calf muscle | 腓腸肌 |
| tibialis anterior | anterior tibial muscle | 脛前肌 |
| fibularis longus | peroneus longus | 腓骨長肌 |
| fibularis brevis | peroneus brevis | 腓骨短肌 |
| fibularis tertius | peroneus tertius | 第三腓骨肌 |
| common fibular nerve | common peroneal nerve | 腓總神經 |
| superficial fibular nerve | superficial peroneal nerve | 腓淺神經 |
| deep fibular nerve | deep peroneal nerve | 腓深神經 |
| fibula | fibular bone | 腓骨 |
| sciatic nerve | ischiadic nerve | 坐骨神經 |
| saphenous nerve | internal saphenous nerve | 隱神經 |
| great saphenous vein | long saphenous vein；greater saphenous vein | 大隱靜脈 |
| small saphenous vein | short saphenous vein；lesser saphenous vein | 小隱靜脈 |
| popliteal artery | popliteal a | 膕動脈 |
| radial nerve | n radialis | 橈神經 |
| median nerve | n medianus | 正中神經 |
| ulnar nerve | n ulnaris | 尺神經 |
| musculocutaneous nerve | n musculocutaneus | 肌皮神經 |
| axillary nerve | circumflex nerve | 腋神經 |
| long thoracic nerve | nerve to serratus anterior | 胸長神經 |
| thoracodorsal nerve | nerve to latissimus dorsi；middle subscapular nerve | 胸背神經 |
| dorsal scapular nerve | nerve to rhomboids | 肩胛背神經 |
| suprascapular nerve | nerve to supraspinatus | 肩胛上神經 |
| accessory nerve (xi) | spinal accessory nerve；cranial nerve xi；accessory nerve | 副神經、第十一對腦神經 |
| vagus nerve (x) | vagus nerve；cranial nerve x | 迷走神經、第十對腦神經 |
| greater occipital nerve | occipital nerve greater | 枕大神經 |
| lesser occipital nerve | occipital nerve lesser | 枕小神經 |
| azygos vein | vena azygos | 奇靜脈 |
| internal thoracic artery | internal mammary artery；ima | 內胸動脈 |
| internal thoracic vein | internal mammary vein | 內胸靜脈 |
| brachiocephalic artery | brachiocephalic trunk；innominate artery | 頭臂動脈、頭臂幹 |
| brachiocephalic vein | innominate vein | 頭臂靜脈 |
| descending thoracic aorta | thoracic aorta；descending aorta | 降主動脈、胸主動脈 |
| xiphoid process | xiphisternum；ensiform process | 劍突 |
| manubrium | manubrium of sternum；manubrium sterni | 胸骨柄 |
| body of sternum | sternal body；gladiolus | 胸骨體 |
| scapula | shoulder blade | 肩胛骨 |
| clavicle | collarbone | 鎖骨 |
| patella | kneecap | 髕骨 |
| sacrum | os sacrum | 薦骨 |
| coccyx | tailbone | 尾骨 |
| atlas | c1；first cervical vertebra | 寰椎、第一頸椎 |
| axis | c2；second cervical vertebra | 軸椎、樞椎、第二頸椎 |
| diaphragm | thoracic diaphragm | 橫膈、橫膈膜 |
| splenius capitis | splenius capitis muscle | 頭夾肌 |
| splenius cervicis | splenius cervicis muscle | 頸夾肌 |
| levator scapulae | levator scapulae muscle | 提肩胛肌 |
| rhomboid major | greater rhomboid | 大菱形肌 |
| rhomboid minor | lesser rhomboid | 小菱形肌 |
| apex of lung | lung apex；apex |  |
| groove for first rib of lung | first rib groove；groove for 1st rib；1st rib groove | 第一肋溝、第1肋溝 |
| contact area for thymus of lung | thymus contact area；thymic impression | 胸腺壓跡、胸腺接觸面 |
| contact area for trachea of lung | trachea contact area；tracheal impression | 氣管壓跡、氣管接觸面 |
| anterior border of lung | anterior margin of lung；anterior margin |  |
| inferior border of lung | inferior margin of lung；inferior margin |  |
| diaphragmatic surface of lung | base of lung；base of the lung | 肺底、橫膈面 |
| cardiac impression of lung | cardiac impression |  |
| cardiac notch of lung | cardiac notch；cardiac incisure | 心切跡、心切痕 |
| lingula of lung | lingula | 舌葉、舌狀葉 |
| oblique fissure of lung | oblique fissure；major fissure | 斜裂、大裂 |
| horizontal fissure of lung | horizontal fissure；transverse fissure；minor fissure | 水平裂、小裂 |
| esophageal impression of lung | esophageal impression；oesophageal impression | 食道壓跡 |
| groove for esophagus | esophageal groove；oesophageal groove；groove for oesophagus | 食道壓跡 |
| groove for subclavian artery | subclavian artery groove；subclavian groove | 鎖骨下動脈壓跡 |
| groove for brachiocephalic vein | brachiocephalic vein groove | 頭臂靜脈壓跡 |
| groove for superior vena cava | svc groove；superior vena cava groove | 上腔靜脈壓跡 |
| groove for azygos vein | azygos groove；azygos vein groove；azygos impression | 奇靜脈壓跡 |
| groove for inferior vena cava | ivc groove；inferior vena cava groove | 下腔靜脈壓跡 |
| groove for aortic arch | aortic arch groove；groove for arch of aorta；aortic groove；aortic impression | 主動脈弓壓跡 |
| groove for descending aorta | descending aorta groove；groove for thoracic aorta | 降主動脈壓跡 |
| hilum of lung | hilum；hilus of lung；hilum of the lung |  |
| pulmonary ligament | inferior pulmonary ligament；ligamentum pulmonale | 肺下韌帶 |
| main bronchus | primary bronchus；principal bronchus |  |
| main bronchus proper | right main bronchus；right primary bronchus；main bronchus | 主支氣管、右主支氣管 |
| bronchial artery | bronchial arteries |  |


### 需要你決定
- [#75](https://github.com/Kuan21/MJ_anatomy/pull/75)（已關閉，未合併）：建議的做法是另開小 PR 只修 GPU 屬性精度，不加瀏覽器實際渲染測試（CI 軟體 WebGL 逾時）。
- 全身肌腱／韌帶／筋膜的盒狀、平板檢查（接 #93）：尚未做，下一項。
- Actions 列表仍登記 11 個舊的「Temporary … validation」workflow 名稱（log 無筆記內容、檔案已不存在）：只能刪其 runs 才會消失，等你決定是否刪除。

### 流程
- 「需人工審核」PR 一律不開 auto-merge；這次 #87、#92、#93 是你審核後授權合併，不代表規則改變。
- 每當有 PR 合併進 main，我檢查所有 open PR 有沒有衝突，有就把 main 合併進分支並重新生成生成檔（不改寫歷史）。

## 第 0 步查證結果（Human Atlas 的來源與版本）

- **你的網站是 `slorksmo/Human-Atlas` 的衍生版。** 證據：兩者的 MIT `LICENSE`（版權人 ashemag）相同；`public/models/body-*.bin` 等模型封包逐位元組相同；`README.md` 標題與內容都是「Human Atlas」；`validate-atlas.mjs`、`optimize-anatomy.mjs`、`convert-anatomy.py` 等腳本同源；`public/ATTRIBUTION.md` 的 BodyParts3D 段落相同。我們的 git 歷史第一個 commit 是 `5e437fe`（Kuan21，2026-09-19），所以是以 Human-Atlas 當時的快照為起點、之後獨立開發。
- **版本**：我們的基底是 Human-Atlas **女性參考身體（HuBMAP v1.10）加入之前**的快照——我們的 `public/ATTRIBUTION.md` 仍把 HuBMAP *3D Reference Organ Set for Female v1.5* 列在「Historical assets (not included in the current release)」；上游現在（HEAD `5bb5713`，2026-09-06）已經是 v1.10＋以 v1.5 補回坐骨、恥骨，並附 `atlas-female.json`（1,220 個部件）。因為只取得上游淺層複製，確切分叉的 commit 無法逐一比對，以上是依檔案內容判斷。
- **`HiMahendraBeniwal/female-atlas` 也是 Human-Atlas 的衍生版**：87 個與上游共有的檔案中有 72 個與 Human-Atlas 逐位元組相同（含 `components/ui/*`、`lib/utils.ts`），其 `public/ATTRIBUTION.md` 只列 HuBMAP v1.5 的資料來源，沒有提到 Human-Atlas。所以我們只借鑑它的 zoom-to-cursor 概念，不直接複製程式碼。

## 已合併的 PR（最新在上）

| PR | 內容 | 在網站上怎樣找到 | 示意模型 |
| --- | --- | --- | --- |
| #64 | 名稱清理：驗證涵蓋搜尋專用名稱與左右中文、修正 `*` 殘留與小寫 left、第三／第四腦室中文名（原誤作「心室」）；Wikidata 中文標籤草稿 `docs/zh-wikidata-draft.md` | `npm run check:model`、`npm run zh:wikidata` | — |
| #63 | 神經解剖共筆匯入：597 條整理為 485 張資訊卡、搜尋與「共筆結構」清單、對照表 `docs/neuro-notes-vs-model.md` | 腦部詳細模式右側「構造」搜尋框、「共筆結構」 | — |
| #61 | 腦切面平滑：平滑場＋三線性取樣，灰質 2.4 mm；前後對照 `docs/brain-cut/` | 腦部詳細模式 → 切面 | 灰白質分界仍為示意 |
| #62 | 修正 main 的 `check`：登記 #59 新增的 2 個血管名稱左右寫法例外（命名清理前的暫時處理） | — | — |
| #60 | 腦部 CSF 流向改為全頁模式：左 3/4 動畫、右 1/4 步驟同步講解欄（位置、CSF 發生什麼、臨床相關、與課本不同處、出處）；關閉後回到原視角、切面、選取 | 腦部詳細模式右上「CSF 流向」 | 孔道、腦池、蛛網膜下腔、脊髓、腰池（沿用 #55） |
| #59 | C1–C8 脊神經與背側支、乳房（乳腺、乳暈、乳頭）、女性外陰（陰阜、大小陰唇、前庭球與前庭大腺、陰蒂與陰蒂腳）示意模型 | 搜尋名稱；乳房與外陰只在性別「女」顯示 | 全部為示意；外陰位置是在男性骨盆上估算，PR3 女性身體會重新對齊 |
| #58 | 模型驗證腳本 `validate-model`：mesh、名稱、分類、中英名、左右寫法，併入 `npm run check` | `npm run check:model` | — |
| #57 | 左側面板重整（胸膜歸呼吸系統、心包膜歸心臟、腦／心／眼／耳四個入口）、心臟詳細模式改版（無 hover、房室兩層清單）、二尖瓣更名僧帽瓣、心臟 Quiz 移除分叉題 | 左側面板；底部「心」 | — |
| #55 | 腦部詳細模式：切面、逐層剝離、17 個分區、433 個構造、CSF 動畫 | `#/organ/brain` | 見上 |
| #53 | 頭部模式、ⓘ 說明、枕下區、血管末端 | 上方「頭部」分頁 | 枕下區神經血管、血管末端連接管 |
| #52 | 跑考 574 項審核、153 個新增示意模型、肺門等 | `docs/paokao-audit.md` | 見該報告 |
| #54 | 自動化流程設定 | — | — |
| #48–#51 | 先前輪次 | — | — |

## 進行中（尚未合併）

| PR | 內容 |
| --- | --- |
| 左側面板 Organs 重整（UI） | 胸膜歸呼吸、心包三層歸心臟列（子項預設收起、父開關連動子項）；Organs 無散列結構，順序心→呼吸→消化→泌尿→生殖→內分泌→淋巴→感覺；「示意模型」改為資訊卡標籤。截圖：`docs/organ-panel/`。CI 通過後自動 merge。 |
| 區域側別選擇（UI） | 上肢／下肢旁新增「雙側／左側／右側」與「另一側淡化顯示」，鏡頭拉近該側肢體，與動作面板側別同步。截圖：`docs/region-side/`（上肢左、上肢右、上肢右＋淡化、下肢左、下肢左＋淡化）。純介面，CI 通過後自動 merge。 |
| 【需人工審核】血管（表面圓滑、上肢靜脈補全、血管樹驗證） | 四肢血管一次 Loop 細分（開口端固定、半徑補償），示意血管 6 → 12 邊；新增外側肱靜脈、前／後骨間靜脈、胸腹壁靜脈；掌深靜脈弓與橈食指動脈補接；新增 `scripts/check-vessel-tree.mjs`（整棵血管樹從主動脈／腔靜脈可達、分支不得比母血管寬 40% 以上）；連續性審核改以表面距離複查。修正前後截圖：`docs/vessel-smoothing/`。 |
| 分層解剖面板（UI） | 面板與動作面板（上肢、下肢）都有 Both｜Left｜Right 三鈕並與區域側別同步；「肌肉分層」依部位只列相關項目；新增「Spaces｜特殊區域」清單（四邊孔、三邊孔、三頭肌間隙、鎖骨胸大肌三角、腋窩、肘窩、解剖鼻煙盒、腕隧道、跗隧道、內收肌裂孔、枕下三角、主動脈裂孔），選取後高亮邊界與通過結構、其餘淡化，名稱可點擊；新增 `scripts/test-layer-regions.mjs`（結果 `docs/layer-region-check.md`）。截圖：`docs/layer-panel/`。 |
| #65 | 15.2b 腦部示意構造第 1 批：內囊、外囊、帶狀核、VPL/VPM、下視丘各核 |
| 之後 | 15.2c 腦幹（腦神經核、丘系…）、15.2d 小腦（深部核、小腦徑）、15.2e 邊緣系統與網狀核群；再來：脊髓橫切面與傳導路徑沿途高亮、血管供應範圍、耳部、Brodmann |

## 待你核對

### 待我決定
- 特殊區域清單沿用跑考摘要的名稱：「三頭肌間隙」（你寫的是「三邊間隙」，英文 Triangular interval）、「跗隧道」（你寫「跗管」）。要改請告知。
- 股三角、內收肌管、膕窩不在跑考摘要的結構清單內，沒有加入；要加請告知（需新增示意模型，屬需人工審核）。
- 特殊區域中的神經（腋神經、橈神經等）在場景以選取色顯示，但有些位置被肌肉遮住；選取後鏡頭會轉到能看到的那一側（後側或前側）。


### 設定（需要你在 GitHub 網頁操作）
- 開啟 *Allow auto-merge*，並把 `main` 的 branch protection 設成要求檢查 `build` 通過（步驟見 `docs/AUTOMATION.md`）。目前 auto-merge 未開，Claude 改成等 CI 全綠後直接 squash merge。
- 此環境的 `gh` 登入失效（GH_TOKEN 驗證失敗），PR 操作改用 GitHub 整合工具。
- **經驗**：兩個 PR 各自通過 CI 後依序合併，仍可能讓 main 變紅（#58 驗證腳本與 #59 新結構）。建議 branch protection 同時勾選「Require branches to be up to date before merging」。

### 內容（需要你對照教科書／老師 PPT）
- 神經解剖共筆匯入：我對 597 條的「保留／合併／剔除／改名／mesh 對應」是逐條人工判斷（`docs/neuro-notes-curation.json`），請抽查對照表（尤其「併入」與「已剔除」）。資訊卡的歸欄（位置、功能…）是關鍵字規則，句子本身是筆記原句，沒有改寫。
- 「楔形核」在筆記中同時指延腦的 Cuneate nucleus 與中腦網狀系統的 Cuneiform nucleus，我分別標示為「楔形核（延腦，Cuneate）」與「楔形核（中腦網狀系統，Cuneiform）」。
- 示意構造（內囊、核團、纖維束…）的位置與大小是依周圍真實構造估算，用赭黃色顯示並標示「示意」，不是實測形狀。
- 示意構造的新增名稱（中英對照）列於 `docs/neuro-notes-vs-model.md` 的「是否有 mesh」欄；與跑考摘要的對照待你核對。
- 筆記正文未有描述的 9 張資訊卡（藍斑核、後縫核、脊髓丘系、顏面神經核、橫行纖維、橋腦小腦纖維、近繩狀體、視丘背內側核、海馬本體）目前顯示「待依 Essential Neuroscience 或圖譜補充」，將在最終審核時補上並註明來源。
- 腦部切面：灰質厚度為示意（2.4 mm）；皮質各溝被橋接成實心（切面已平滑，網格 0.9 mm、約 620 萬格；你要求的 256³ 未採用，因約 7 倍 GPU 記憶體，若要請告知）；放射冠沒有獨立標示。第一次切開在無 GPU 的環境約需 6 秒（有顯示「正在計算平滑切面」）。
- CSF 動畫：各孔道與腦池的位置依標誌估算；脊髓段縮短、未依比例。
- 女性／男性切換：男性專屬結構是用名稱比對隱藏，名稱不在清單內的血管神經可能漏網。

### 尚未做到
- Brodmann 52 區；腦部脊髓橫切面與傳導路徑沿途高亮；Willis 環供應範圍著色；耳部結構（頭部模式）。
- 肺臟詳細模式與肺臟 Quiz。
- 女性身體（HuBMAP v1.10＋v1.5）整合、命名清理（PR2）、對齊與穿模修正（PR4）、器官供應血管、系統分開載入、zoom-to-cursor、Source & credits 全面更新。
- 穿模（閉孔神經前支）、膝屈曲 130° 大腿後側變形、肩外展拖動時神經爆出。
- 最終審核：全部模型位置、與共筆／老師 PPT 的事實核對、每個構造的資訊卡不可空白（補充用可信醫學來源）。老師 PPT 目前不在 repo，需要你提供。

### 評估（只評估、不實作）
- 腦部：Human-Atlas 女性身體（HuBMAP v1.10）的 **283 個腦區（`system: brain`）＝ 142 種結構的左右兩側**，能否用於腦部詳細模式。結論：**可作為真實 mesh 的來源補充，但不能取代；需先對齊座標，且等你的神經解剖筆記對應確認後再決定。**
  - 座標與授權：資料在「女性身體」的座標（Visible Human Female），與腦部詳細模式使用的 Brain Project（Z-Anatomy／BodyParts3D 男性）座標不同，需用最小二乘（縮放＋平移，參考 Human-Atlas 的 `borrow-anatomy.mjs`）對齊；授權 CC BY 4.0（HuBMAP），可用。
  - **可用、且對應到你筆記的結構（現在我們用示意模型的）**：視丘腹後外側核（VPL）與腹後內側核（VPM）、腹前核、腹外側核、背內側核、外側背側核、外側後核、前核群、枕核、中線核群、中央核群、中央中核、束旁核、內膝狀體、外膝狀體（背側）、底丘腦核、韁核、松果體、下視丘分區（視前、視上、結節、乳頭區）、帶狀核、杏仁核各核群（基底外側、基底內側、外側、內側、皮質前／後、前杏仁區、杏仁海馬區）、終紋床核、基底前腦、伏隔核、蒼白球內外節、殼核、尾狀核頭／體／尾、海馬頭／體／尾、乳頭體視丘徑、穹窿、胼胝體、前連合、小腦蚓部／旁蚓部／外側半球／深部核（合為一塊）、上／中／下小腦腳、橋腦基底部與被蓋、延腦錐體與被蓋、下橄欖核、紅核、黑質、大腦腳、上丘、下丘、前頂蓋區、各腦室分部、中央管、大腦導水管、視交叉、視徑、視放射、嗅球與嗅徑，以及細分的皮質腦迴（含 Heschl 迴、腦島長短迴、眼窩迴、扣帶迴前後部）。
  - **缺少（你的筆記有、這個身體沒有，所以仍需示意模型）**：內囊（前腳、膝部、後腳）、外囊、所有腦神經核（動眼、滑車、外旋、顏面、三叉、耳蝸、上橄欖、舌下、迷走背核、疑核、孤立核）、斜方體、各丘系（內側、外側、脊髓）、內側縱束、脊髓小腦徑與其他傳導束（皮質脊髓徑等）、縫核、藍斑核、網狀核群、個別小腦深部核（頂核、球狀核、栓狀核、齒狀核）、海馬分區（齒狀迴、羊角區 CA、下托）、內嗅皮質（僅有 perirhinal 與 parahippocampal）、下視丘各核（視上核、室旁核、視交叉上核…僅有分區）、脊髓、腦膜、腦血管、Brodmann 分區。
  - 與我們現有 Brain Project 的重疊：皮質腦迴、基底核、視丘核團、腦幹大結構兩邊都有；女性身體的分區較細（例如視丘各核有 mesh、杏仁核分 8 個核群），可用來取代部分示意構造，但左右、命名與解剖位置要逐一核對後才換。

### 血管（本輪）
- **成本**：四肢血管細分使圖譜封包由 33.5 MB 增為 39.7 MB（gzip），三角形由 229 萬增為 278 萬；沙盒沒有 GPU，FPS 未量測，請在你的裝置確認載入時間與動作流暢度。若太慢，可把門檻（`SMOOTH_MAX_TRIANGLES`）降低或只細分上肢。
- **已發現、未修**：左股動脈平均半徑約 3.1 mm，比同側膕動脈（4.5 mm）細，右側是 5.4 → 4.5；左右不對稱來自圖譜本身（`docs/vessel-tree.md`）。陰莖背動脈與子宮動／靜脈 4 件未接到動脈樹（生殖器，不在本輪範圍）。
- **橈食指動脈**：圖譜把它接在掌淺弓上，解剖上應起自橈動脈或掌深弓；已加一條連接管接到掌深弓，原本與掌淺弓的接觸保留，請確認是否要移除。
- **示意血管位置**：外側肱靜脈（與內側肱靜脈對稱地放在肱動脈另一側）、骨間靜脈、胸腹壁靜脈的路徑是依鄰近構造估算，不是實測形狀；請對照課本。
- **未做**：下肢靜脈沒有新增（大隱、小隱、深靜脈伴行已在圖譜中）；依鏡頭距離調整血管細緻度（LOD）未實作。

### 其他
- `public/models/cmu-course-notes-v4.json` 的 git 歷史要不要清除：等專案完成後由你決定，Claude 不會動。

## 肩屈曲／外展 180°：鎖骨項目失敗原因與修正（#120 已 merge；補上證據）

- **失敗原因：** `check:motion` 的鎖骨項目要求權重 ≥ .995 的剛性頂點在動作前後完全不動；`ANCHOR_MOBILITY` 為 .05，讓附著點錨定的頂點在 180° 時仍被拉動。
- **修正：** `ANCHOR_MOBILITY` 改為 0。`check:motion` 與 `scripts/test-shoulder-sheets.mjs` 現在通過。
- **畫面證據（`docs/shoulder-180-evidence/`，before＝main、after＝#120，血管層等 150 秒載入完才拍）：** 前後差異只有 6 到 1997 個像素（每張約 142 萬像素），肉眼看不出分別。屈曲 180° 前、後、上方，兩邊都沒有紅色血管碎段浮在肩上或左側；外展 168°、180° 兩邊都沒有撕裂碎片或灰白大平面張開。也就是說這組圖**證明不了畫面有改善**，只能說明 after 沒有退步；#120 能證明的是 `check:motion` 通過。
- **未解決：內旋 48° + 肘屈 140° 的米色翼狀物** 在 before 與 after 都有（肩下方一片米色大平面，範圍前後完全相同，約 15500 像素），沒有被 #120 修好。成因未確認，疑似結締組織層；之後另開 PR，需人工審核。
- **腋鞘：** 點選後 before 與 after 都畫出米白色弧形，位置形狀幾乎一樣；未點選時（屈曲 180°）兩邊都沒有拱形。所以沒有「#120 讓腋鞘只在點選時出現」的前後差異證據（`scene.tsx` 本來就只在點選時畫示意血管鞘）。
- **限制：** 上肢模式在身體中線切開模型，胸壁只看得到左側肌肉；全身模式下鏡頭設定被覆寫，無法拍。

## 使用者決定（2026-10-30）

- **肺 PR 3（肺段）**：以 115-1 跑考摘要為準；摘要未明確時左肺用合併 8 段（尖後段 S1+2、前內基底段 S7+8）。作答時合併名稱或分開名稱（S1、S2、S7、S8）都算對，別名表一併加入。不必等肌腱與韌帶盤點（#142）。
- **特殊空間與孔（四邊孔、三邊孔、解剖鼻煙盒、跗管等）的出題方式**：針插在空間中央，答空間名稱，作答規則同其他題目；作答後才高亮邊界結構並列出穿過的結構（答題時不顯示）；一般題目照常可以插在穿過該空間的神經、血管、肌腱上。涉及解剖內容，需使用者審核。尚未開工。
- **`pr-screenshots` 截圖分支**：正式採用，規則寫入 CLAUDE.md（orphan、永不 merge、不進 Pages 部署、本機不 checkout／fetch、PR merge 或關閉超過 30 天後可清）。
- **手指**：#140 已 merge；另開 PR 加「指向」並確認「OK 手勢」拇指與食指指尖相觸。
- **次序**：#142 盤點報告出來後先交使用者確認，再開始肌腱與韌帶（最高優先）；等待期間先做肺 PR 3，再做手指修改。肌腱與韌帶開始製作後，上肢動作細化 PR 2、米色翼狀物、骨盆與會陰仍排在後面。
