# REVIEW_LOG

最後更新：2026-10-29。規則：只改介面、效能、腳本、文件的 PR 在 `build` 通過後自動 merge；涉及模型、示意模型、解剖內容、名稱、Quiz 資料的 PR 標【需人工審核】，**一律不開 auto-merge**，等你確認。

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

## 任務狀態表（2026-10-29 晚；包括你交過的全部任務）

部署：`67cac88`（含 #112、#115、#108、#114、#109、#116、#117、#118、#119、#121）正式站部署成功。#120 的合併提交 `9748a3c` 的部署顯示「已取消」，沒有後續部署紀錄，所以 #120 的內容目前不能確定已上線；原因我還沒查出來，也沒有重跑部署。

| 任務 | 狀態（進行中 / 已完成 / 等我審核 / 未開始 / 卡住） | PR 編號 | 備註 |
| --- | --- | --- | --- |
| 第二級 Quiz（黃色高亮、輸入名稱、同義詞、答題後資料卡、錯題） | 已完成（已部署） | #98 | 題庫與同義表另需你審核過的部分已 merge |
| 肺部總整合 第一階段 PR 1：聚焦視圖修正（按鈕無反應、白斑與破洞、顏色統一、平滑化、支氣管樹／肺血管開關、胸廓平滑半透明、預設層數） | 等我審核（需人工審核，不自動 merge） | LUNGPR | 未完成：肋縱隔隱窩（模型沒有，不假造）；腋中線處壁層胸膜下緣約偏高一條肋（目標第 10 肋，量得第 9 肋）；臟層胸膜在肺裂處仍有折線；入口仍用 `?mjview` 以外的手動點擊測試（CI 沒有瀏覽器） |
| 肺部 第二階段 PR 2：內側面標籤與肺門 | 未開始 | — | PR 1 merge 後才開始 |
| 肺部 第二階段 PR 3：肺段（支氣管肺段） | 未開始 | — | PR 1 merge 後才開始；左肺合併或分開計算要你決定 |
| 肺部 第二階段 PR 4：肺淋巴引流（較低優先） | 未開始 | — | PR 1 merge 後才開始 |
| 肺 PR A／PR B（葉間裂、胸膜分部、肋膈隱窩、左肺食道壓跡、下腔靜脈溝） | 已完成 | #112、#115 | 肋縱隔隱窩形狀、專屬截圖未做，併入肺 PR 1／2 |
| 肩關節屈曲／外展 180°（鎖骨項目失敗修正） | 已 merge（你在網頁上合的，與「先不要 merge」不一致，請確認）；證據截圖重拍中 | #120 | `check:motion` 通過；畫面上沒有可見的改善，前一組截圖被你退回；重拍的證據會用新的文件 PR 補上 |
| 手指活動（四指、拇指、手勢預設、第二輪修改） | 已完成（已 merge） | #109 | — |
| 手指活動修正（指尖碎片、DIP／PIP 連動、皮膚與肌腱重疊、捏取指尖相貼） | 進行中（背景，分支 mj-fingers-2） | — | 需人工審核；先重現問題再修 |
| 特殊區域邊界線與開口形狀（含三邊孔、四邊孔） | 已完成（已 merge；你已審核） | #108 | 已知限制：四邊孔角點不完全重合，兩條邊之間有一小段細灰線；肘窩因模型沒有肱骨外上髁，頂邊只是細灰線 |
| 特殊區域 Quiz 題型（找出此區域、屬於哪個區域的內容物） | 未開始 | — | 依你指定次序排在血管、肺之後 |
| 血管連續性與平滑化（先上肢、下肢） | 進行中（背景，分支 mj-vessel-continuity） | — | 需人工審核；胸部含肺門、背部、頭頸、腹盆之後另開 PR |
| 心臟：打開心腔時隱藏表面細血管 | 已完成（已 merge） | #119 | 分類清單在下方，有兩項歸類請你核對 |
| 心臟：二尖瓣名稱（僧帽瓣 → 二尖瓣；三尖瓣、同義詞） | 已完成（你已審核並 merge） | #118 | 部署確認中 |
| 心臟 PR1：腔內構造重做（階梯邊緣、卵圓窩、梳狀肌等） | 未開始 | — | 需人工審核 |
| 心臟 PR2：光影與顏色 | 未開始 | — | 介面，可自動 merge |
| 心臟 PR3：Quiz 判定與用語 | 已完成（部分判定、去「MJ 補建」、上下腔靜脈縮短已在 #111） | #111 | — |
| 腦部：腦神經檢查表（CN I–XII）、腦神經根預設顯示、搜尋修正 | 已完成（已 merge） | #117 | 4 個問題等你決定，見下方 |
| 腦部：內側面（左右分開）視角 | 未開始 | — | 模型處理需人工審核；缺少的結構要列清單，不補假模型 |
| 腦部詳細模式其餘指引（CSF 差距、切面、突出顯示、補結構七批）、CSF 粒子限制與腦幹-脊髓接順 | 未開始 | — | — |
| 底部按鈕改腦／心／肺（眼、耳暫時隱藏） | 已完成（已 merge、已部署） | #116 | 獨立的肺詳細模式併入肺部總整合 |
| 頭顱內黃色碎塊移除 | 已完成（已部署） | #100 | — |
| 枕下靜脈叢分類（神經 → 靜脈）、區域（眼眶 → 枕下區） | 已完成 | 較早輪次 | 全站分類錯誤的完整掃描尚未做 |
| 淡化效果：點狀花紋改平滑半透明 | #110 已 merge，但仍用 alpha-to-coverage（多重取樣下仍是點狀）；LUNGPR 改為真正 alpha 混合（含手機與低記憶體裝置）| #110、LUNGPR | 等 LUNGPR 審核 |
| 頭部左側浮出身體外的黃色神經 | 卡住 | — | 我掃過神經網格沒發現超出頭部範圍的，也沒能重現；需要你當時的視角或截圖 |
| 改為私人網站（Cloudflare Pages ＋ Access） | 未開始（卡住：需要你的帳號操作） | — | ROADMAP 第 52 行；我提供逐步教學，但無法替你登入帳號 |
| 英文發音（發音鈕、IPA、已校對狀態） | 已完成（介面＋資料） | #113、#114 | 新增的肺部結構名稱隨各 PR 補 |
| 選取結構時自動顯示、鏡頭轉向、擋住的半透明 | 已完成 | #107 | — |
| 移除錯誤的空間示意模型、骨性標記資訊卡欄位、Workflow 固定 ubuntu-24.04 | 已完成 | #103、#104、#105 | — |
| 跑考範圍：足部神經、踝伸肌支持帶、子宮韌帶重做 | 未開始 | — | 需人工審核 |
| 上肢內旋 48° + 肘屈 140° 米色翼狀物 | **未解決**：重拍的 before 與 after 都有（肩下方、圖左下的一片米色大平面，疑似結締組織層，尚未確認） | — | 我還沒查成因；之後另開 PR，需人工審核 |
| 結締組織 PR1–3（分層、顏色質感、背部與頭頸） | 未開始 | — | 需人工審核（顏色可自動 merge） |
| 乳房兩層、女性生殖第二輪、女性骨盆 | 未開始（女性骨盆之前有部分進度） | — | 需人工審核 |
| Undo（Ctrl/⌘+Z）、ROADMAP 第 0 步 | 未開始 | — | Undo 介面可自動 merge |
| 神經解剖共筆匯入與資訊卡、最終審核（全模型位置合理性、資訊卡不可空白）、Quiz 資料完整性＋旋肱前動脈位置 | 未開始 | — | — |
| 效能（按系統分開載入、大分類預設收起）、Zoom-to-cursor、Source & credits 全面更新、最小二乘對齊與穿模修正、器官＋供應血管 | 未開始 | — | 之前路線圖的 S3–S8 |
| 本狀態表更新 | 已完成（#121）；本次再更新 | #121 | 只改文件 |

### 正在進行中的工作（預估時間是我的粗估；三個子 agent 的輸出檔已超過 1.5 小時沒更新，但它們的本地工作目錄都有新提交，所以仍在做事，只是遠端還沒有任何提交）
- **肺 PR 1**（mj-lung-focus-fix）：本地有 2 個提交、最近一個約 15 分鐘前，尚未推送、尚未開 PR；預估再 1–2 小時。
- **肩 180° 證據重拍**：before（main）與 after 兩個 build 的截圖鏈還在跑（腋鞘點選前後，再重拍全部姿勢，等 150 秒讓血管載入完）；預估約 30 分鐘後完成，之後合成紅圈對照圖，開新的文件 PR。上一次 after 圖有些在血管層載入前拍下，所以「外展 180° 的血管不見了」只是載入時間造成的假象，不能當作退步。
- **手指修正**（mj-fingers-2）：本地有 7 個未提交的檔案，沒有提交；預估再 2 小時以上。
- **血管連續性（上肢、下肢）**（mj-vessel-continuity）：本地有 1 個提交（約 44 分鐘前）和 9 個未提交檔案，尚未推送；預估再 3–4 小時。
- 磁碟約 1.3 GB，仍緊。

### 需要你做的事
**等你審核的 PR**
- 目前沒有開啟中的 PR。之後會有：肺 PR 1（看白斑與破洞是否消失、四個按鈕是否有反應、顏色是否統一）、手指修正（看握拳與捏取截圖，指尖是否相貼）、血管連續性（看上下肢動脈靜脈前後對照與間隙清單）、肩 180° 證據補充（看紅圈位置與米色翼狀物是否仍在）。

**等你決定的問題**
1. 腦神經：右側延髓補不補、VIII 與 IX 要不要帶進腦部模式、「外旋神經」是否改「外展神經」、「顏面神經」是否改「面神經」。
2. 肺段：左肺 S1+2、S7+8 合併（8 段）還是分開（10 段）；repo 裡沒有跑考對這點的文字。
3. 心臟隱藏細血管的分類：左右緣支、竇房結動脈我歸為細分支，請核對。
4. 是否相連的血管：等血管 PR 列出間隙超過半個管徑的清單後，請你判斷哪些該相連。
5. #120：你合併了，我需要確認這是你的意思（我先前的理解是等重拍後再審核）；如果不是，我可以開 revert PR，你同意才動。
6. #120 的部署顯示已取消：要不要我重跑部署，確保上線。
7. 磁碟：哪些舊 worktree 可以刪（之前刪除被權限拒絕，我沒有繞過）。

**等你提供的資料**
- 肺段：跑考頁面的肺段寫法。
- 頭部左側浮出的黃色神經：你當時的視角或截圖。
- 缺少模型時的參考圖：目前還沒有具體要求。
- 私人網站：Cloudflare 帳號操作（我提供逐步教學）。

### 卡住或重複失敗
- 肩 180° 截圖：第一組手臂被切掉、前後差異太小，被你退回；第二組因血管層晚載入而有一組不可用，現在用 150 秒等待重拍；負責重拍的子 agent 被截斷了五次，我已改成自己接手。
- 米色翼狀物：還沒查成因，也還沒修。
- 子 agent 的輸出檔長時間沒更新，我無法從遠端判斷它們做到哪裡（只能看本地目錄）。
- 頭部左側浮出的黃色神經：我兩次都無法重現，缺你的截圖。
- `test-scene-loading` 在多個瀏覽器同時跑時逾時：單獨重跑可過，CI 沒這問題。
- GitHub 連線：MCP 工具偶爾斷線，我改用 REST API；GraphQL 被擋。
- Cloudflare 私人網站：卡在需要你的帳號操作。

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

### Quiz 第二級同義名稱表（需人工審核，共 102 列）
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
