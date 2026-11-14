# 第二次考試範圍核對：腹部（含內臟）（內部清單，不上網站）

2026-11-14 建立。範圍：腹壁、腹膜、消化道與肝膽胰脾、泌尿（腎、輸尿管）、腎上腺、腹部血管與淋巴、腹部神經叢與腰神經叢、橫膈與後腹壁。骨盆與會陰另列一區，不在本檔。依每區內順序：血管 → 腺體 → 神經分支 → 骨的細部 → 筋膜與間隙；臟器是本區的主要內容，排在最前面。本檔只放在 `docs/`，不可放進 `public/` 或 `dist/`。方法與輸出格式同 `docs/exam2-headneck-gap.md`。

## 摘要

| 項目 | 數量 |
|---|---|
| 清單結構數（`docs/required-structures/abdomen.json`） | 284 |
| 核對項（要求 3D；扣除細胞、組織層級 6 項） | 278 |
| 有（比對程式在站上資料找到） | 129（其中 †僅資訊卡資料來源 17、‡以部分網格計入 6） |
| 缺 | 144（其中只有資訊卡 1） |
| 名稱不同 | 3 |
| 部位不明 | 2 |
| 需使用者決定（處理方式欄） | 46 |

「有」的數字出自 `node scripts/check-required-abdomen.mjs`（與頭頸區共用 `scripts/lib/required-match.mjs` 與同一份站上名稱索引）。比對只看結構名稱，沒有逐項在 3D 畫面確認；也沒有宣稱任何解剖位置正確，請使用者核對。

### 來源與無法讀取、無法確認的部分

- 上傳的 PDF 共 22 份，檔名多被截斷，且沒有文字層，我逐頁轉成圖片閱讀，只取結構名稱。確認為腹部內容的只有 3 份：
  1. 腹壁、腹膜韌帶、腹股溝管（約 38 頁，檔名含 0909）；
  2. 腹腔動脈幹、腸繫膜動脈、血液供應、靜脈回流、淋巴、自主神經、腰神經叢（約 44 頁，檔名含 0923）；
  3. 腹膜與腹膜腔、後腹壁、橫膈、腎、輸尿管、腎上腺、腹主動脈分支、神經（約 42 頁，檔名含 W9／封面為腹部(2)）。
- **缺少的 PDF（沒有上傳，無法核對）：** 消化道與肝膽胰脾的器官本身（食道、胃、小腸、大腸、肝、膽囊與膽道、胰、脾的解剖分段與構造）那一份；封面為腹部(3) 的那一份（若有）。因此本清單的臟器只收「在血管、腹膜、神經章節出現過的名稱」，**器官內部細分（肝葉與肝段、胃的各部、十二指腸四段、結腸帶與結腸袋、胰頭頸體尾、膽囊各部、脾的分葉等）無法確認是否在考試範圍，沒有列入**；補上傳後再擴充（id 往後追加）。
- 腹壁、腹股溝與腹腔動脈幹以前的章節（上列 1 與 2 的前段）：我讀過，但名稱的核對同時參照 repo 內既有的名詞表（`docs/curriculum-terms.json`、`docs/glossary.json` 的腹部條目）；這兩處的逐頁圖片本回合沒有再次逐字複核，標為「大致完整、無法確認有無遺漏」。
- 其餘 19 份 PDF 為頭頸、胸、四肢、神經系統、骨盆等其他區，本回合沒有讀。
- 中文名取自上傳 PDF 與既有名詞表，沒有逐項與台灣解剖學名詞比對（例：「左大腸彎」「小囊（網膜囊）」用詞待核）。
- 比對來源標示：†比對到的名稱只在資訊卡資料表（如 paokao 卡片、腦部資訊卡），有沒有獨立網格無法確認；‡由「某結構的一部分」的網格計入。這兩類在「有」的數字內，但可能高估。
- 站上的網格若是執行階段才載入、或建置時才下載的，不在索引內，可能低估。

### 建議分批（每批 15–20 項，只含尚需處理者；149 項分 9 批）

「需使用者決定」的項目請先決定處理方式，再排入批次；批次內順序依優先級與區內順序。

| 批次 | 項數 | 內容 | id 範圍（非連續者列首尾） |
|---|---|---|---|
| 1 | 17 | 優先級高；臟器 | RS-A-0003 … RS-A-0036 |
| 2 | 17 | 優先級高；臟器、血管（動脈、靜脈、淋巴） | RS-A-0037 … RS-A-0109 |
| 3 | 17 | 優先級高／中；血管（動脈、靜脈、淋巴）、腺體 | RS-A-0045 … RS-A-0164 |
| 4 | 17 | 優先級中；血管（動脈、靜脈、淋巴）、神經分支（含自主神經叢與神經節） | RS-A-0165 … RS-A-0193 |
| 5 | 17 | 優先級中；神經分支（含自主神經叢與神經節）、腹膜、筋膜、間隙、管與孔、韌帶 | RS-A-0046 … RS-A-0223 |
| 6 | 17 | 優先級中；腹膜、筋膜、間隙、管與孔、韌帶 | RS-A-0047 … RS-A-0065 |
| 7 | 17 | 優先級中／低；腹膜、筋膜、間隙、管與孔、韌帶、腹壁與後腹壁肌肉、骨的細部（骨性標記） | RS-A-0066 … RS-A-0284 |
| 8 | 17 | 優先級低；腹膜、筋膜、間隙、管與孔、韌帶 | RS-A-0242 … RS-A-0261 |
| 9 | 13 | 優先級低；腹膜、筋膜、間隙、管與孔、韌帶 | RS-A-0262 … RS-A-0275 |

各批完整名單見下方分節表（優先級欄）；批次 id 以表內 id 為準。

## 優先級說明

- 高：臟器、腺體、腹主動脈／腹腔動脈幹／上、下腸繫膜動脈／下腔靜脈／門靜脈系統的血管。
- 中：腹腔外的其他動靜脈與淋巴、神經與自主神經叢、腹壁與後腹壁肌肉、腹膜構造。
- 低：骨性標記、筋膜、間隙、管與孔、韌帶。
- 「有」的項目不排優先級（—）。

## 總表

| 類別 | 核對項 | 有 | 缺 | 名稱不同 | 部位不明 | 需使用者決定 |
|---|---|---|---|---|---|---|
| 臟器 | 39 | 17 | 22 | 0 | 0 | 10 |
| 血管（動脈、靜脈、淋巴） | 117 | 73 | 44 | 0 | 0 | 11 |
| 腺體 | 2 | 1 | 0 | 1 | 0 | 1 |
| 神經分支（含自主神經叢與神經節） | 37 | 20 | 17 | 0 | 0 | 0 |
| 骨的細部（骨性標記） | 9 | 3 | 6 | 0 | 0 | 0 |
| 腹膜、筋膜、間隙、管與孔、韌帶 | 60 | 7 | 49 | 2 | 2 | 24 |
| 腹壁與後腹壁肌肉 | 14 | 8 | 6 | 0 | 0 | 0 |
| **合計** | **278** | **129** | **144** | **3** | **2** | **46** |

## 一、臟器

核對 39 項：有 17；缺 22；名稱不同 0；部位不明 0；需使用者決定 10。

| id | 英文名 | 中文名 | 站上現況 | 建議處理 | 優先級 | 備註 |
|---|---|---|---|---|---|---|
| RS-A-0003 | Fundus of stomach | 胃底 | 缺 | 補建 | 高 | 在既有胃或結腸網格上標示區域，不另做浮空模型 |
| RS-A-0004 | Lesser curvature of stomach | 胃小彎 | 缺 | 補建 | 高 | 在既有胃或結腸網格上標示區域，不另做浮空模型 |
| RS-A-0005 | Greater curvature of stomach | 胃大彎 | 缺 | 補建 | 高 | 在既有胃或結腸網格上標示區域，不另做浮空模型 |
| RS-A-0006 | Pylorus | 幽門 | 缺 | 補建 | 高 | 在既有胃或結腸網格上標示區域，不另做浮空模型 |
| RS-A-0008 | Duodenojejunal flexure | 十二指腸空腸彎曲 | 缺 | 補建 | 高 | 在既有胃或結腸網格上標示區域，不另做浮空模型 |
| RS-A-0012 | Cecum | 盲腸 | 缺 | 補建 | 高 |  |
| RS-A-0015 | Right colic flexure | 右結腸彎曲 | 缺 | 補建 | 高 | 在既有胃或結腸網格上標示區域，不另做浮空模型 |
| RS-A-0017 | Left colic flexure | 左大腸彎 | 缺 | 補建 | 高 | 在既有胃或結腸網格上標示區域，不另做浮空模型 |
| RS-A-0019 | Sigmoid colon | 乙狀結腸 | 缺 | 補建 | 高 |  |
| RS-A-0021 | Anus | 肛門 | 缺 | 補建 | 高 | 站上只找到 External anal sphincter，沒有名為肛門或肛管的結構 |
| RS-A-0024 | Bile duct (common bile duct) | 膽管 | 缺 | 補建 | 高 | 站上有 Common hepatic duct 與 Cystic duct，沒有以總膽管命名的結構 |
| RS-A-0025 | Portal triad | 肝門三體 | 缺 | 補建 | 高 |  |
| RS-A-0032 | Renal cortex | 腎皮質 | 缺 | 需使用者決定 | 高 | 腎內部構造：站上只有整個腎，需決定用剖面示意或在腎網格上標示 |
| RS-A-0033 | Renal medulla | 腎髓質 | 缺 | 需使用者決定 | 高 | 腎內部構造：站上只有整個腎，需決定用剖面示意或在腎網格上標示 |
| RS-A-0034 | Renal pyramid | 腎錐體 | 缺 | 需使用者決定 | 高 | 腎內部構造：站上只有整個腎，需決定用剖面示意或在腎網格上標示 |
| RS-A-0035 | Renal column | 腎柱 | 缺 | 需使用者決定 | 高 | 腎內部構造：站上只有整個腎，需決定用剖面示意或在腎網格上標示 |
| RS-A-0036 | Renal papilla | 腎乳突 | 缺 | 需使用者決定 | 高 | 腎內部構造：站上只有整個腎，需決定用剖面示意或在腎網格上標示 |
| RS-A-0037 | Minor calyx | 腎小盞 | 缺 | 需使用者決定 | 高 | 腎內部構造：站上只有整個腎，需決定用剖面示意或在腎網格上標示 |
| RS-A-0038 | Major calyx | 腎大盞 | 缺 | 需使用者決定 | 高 | 腎內部構造：站上只有整個腎，需決定用剖面示意或在腎網格上標示 |
| RS-A-0039 | Renal pelvis | 腎盂 | 缺 | 需使用者決定 | 高 | 腎內部構造：站上只有整個腎，需決定用剖面示意或在腎網格上標示 |
| RS-A-0040 | Renal sinus | 腎竇 | 缺 | 需使用者決定 | 高 | 腎內部構造：站上只有整個腎，需決定用剖面示意或在腎網格上標示 |
| RS-A-0041 | Hilum of kidney | 腎門 | 缺 | 需使用者決定 | 高 | 腎內部構造：站上只有整個腎，需決定用剖面示意或在腎網格上標示 |
| RS-A-0001 | Esophagus | 食道 | 有 | 已有 | — |  |
| RS-A-0002 | Stomach | 胃 | 有 | 已有 | — |  |
| RS-A-0007 | Duodenum | 十二指腸 | 有 | 已有 | — |  |
| RS-A-0009 | Jejunum | 空腸 | 有 | 已有 | — | ‡以較大結構的部分網格計入（例如以肝的分段、胃十二指腸動脈所屬分支），需確認是否可單獨點選 |
| RS-A-0010 | Ileum | 迴腸 | 有 | 已有 | — | ‡以較大結構的部分網格計入（例如以肝的分段、胃十二指腸動脈所屬分支），需確認是否可單獨點選 |
| RS-A-0011 | Ileocecal junction | 迴盲部 | 有 | 已有 | — |  |
| RS-A-0013 | Appendix | 闌尾 | 有 | 已有 | — |  |
| RS-A-0014 | Ascending colon | 升結腸 | 有 | 已有 | — |  |
| RS-A-0016 | Transverse colon | 橫結腸 | 有 | 已有 | — |  |
| RS-A-0018 | Descending colon | 降結腸 | 有 | 已有 | — |  |
| RS-A-0020 | Rectum | 直腸 | 有 | 已有 | — |  |
| RS-A-0022 | Liver | 肝臟 | 有 | 已有 | — | ‡以較大結構的部分網格計入（例如以肝的分段、胃十二指腸動脈所屬分支），需確認是否可單獨點選 |
| RS-A-0023 | Gallbladder | 膽囊 | 有 | 已有 | — |  |
| RS-A-0030 | Spleen | 脾臟 | 有 | 已有 | — |  |
| RS-A-0031 | Kidney | 腎臟 | 有 | 已有 | — |  |
| RS-A-0043 | Ureter | 輸尿管 | 有 | 已有 | — |  |
| RS-A-0044 | Urinary bladder | 膀胱 | 有 | 已有 | — |  |

## 二、血管（動脈、靜脈、淋巴）

核對 117 項：有 73；缺 44；名稱不同 0；部位不明 0；需使用者決定 11。

| id | 英文名 | 中文名 | 站上現況 | 建議處理 | 優先級 | 備註 |
|---|---|---|---|---|---|---|
| RS-A-0072 | Esophageal branch of left gastric artery | 左胃動脈食道支 | 缺 | 補建 | 高 |  |
| RS-A-0074 | Short gastric arteries | 短胃動脈 | 缺 | 補建 | 高 |  |
| RS-A-0075 | Left gastro-omental artery | 左胃網膜動脈 | 缺 | 補建 | 高 |  |
| RS-A-0076 | Posterior gastric artery | 後胃動脈 | 缺 | 補建 | 高 |  |
| RS-A-0078 | Greater pancreatic artery | 大胰動脈 | 缺 | 補建 | 高 |  |
| RS-A-0083 | Cystic artery | 膽囊動脈 | 缺 | 補建 | 高 |  |
| RS-A-0086 | Right gastro-omental artery | 右胃網膜動脈 | 缺 | 補建 | 高 |  |
| RS-A-0087 | Superior pancreaticoduodenal artery | 上胰十二指腸動脈 | 缺 | 相關搜尋 | 高 | 站上已有前、後上胰十二指腸動脈；建議以相關搜尋指向這兩條 |
| RS-A-0090 | Supraduodenal artery | 上十二指腸動脈 | 缺 | 補建 | 高 |  |
| RS-A-0095 | Jejunal arteries | 空腸動脈 | 缺 | 補建 | 高 |  |
| RS-A-0107 | Superior suprarenal artery | 上腎上腺動脈 | 缺 | 補建 | 高 |  |
| RS-A-0109 | Gonadal artery | 生殖腺動脈 | 缺 | 相關搜尋 | 高 | 站上有睪丸動脈；卵巢動脈缺。建議「生殖腺動脈」作為相關搜尋 |
| RS-A-0111 | Ovarian artery | 卵巢動脈 | 缺 | 補建 | 高 |  |
| RS-A-0114 | Median sacral artery | 正中薦動脈 | 缺 | 補建 | 高 |  |
| RS-A-0135 | Right gonadal vein | 右生殖腺靜脈 | 缺 | 相關搜尋 | 高 | 站上有睪丸靜脈；建議相關搜尋指向睪丸靜脈（卵巢靜脈缺，見該項） |
| RS-A-0136 | Left gonadal vein | 左生殖腺靜脈 | 缺 | 相關搜尋 | 高 | 站上有睪丸靜脈；建議相關搜尋指向睪丸靜脈（卵巢靜脈缺，見該項） |
| RS-A-0138 | Ovarian vein | 卵巢靜脈 | 缺 | 補建 | 高 |  |
| RS-A-0152 | Short gastric veins | 短胃靜脈 | 缺 | 補建 | 高 |  |
| RS-A-0153 | Left gastro-omental vein | 左胃網膜靜脈 | 缺 | 補建 | 高 |  |
| RS-A-0154 | Cystic vein | 膽囊靜脈 | 缺 | 補建 | 高 |  |
| RS-A-0157 | Middle rectal veins | 中直腸靜脈 | 缺 | 補建 | 高 |  |
| RS-A-0158 | Inferior rectal veins | 下直腸靜脈 | 缺 | 補建 | 高 |  |
| RS-A-0159 | Esophageal vein | 食道靜脈 | 缺 | 補建 | 高 | 食道靜脈曲張與門體吻合相關，站上沒有此名稱 |
| RS-A-0126 | Pericardiacophrenic artery | 心包膜膈動脈 | 缺 | 補建 | 中 |  |
| RS-A-0127 | Cremasteric artery | 提睪肌動脈 | 缺 | 補建 | 中 |  |
| RS-A-0128 | Inferior vesical artery | 下膀胱動脈 | 缺 | 補建 | 中 |  |
| RS-A-0160 | Pampiniform venous plexus | 蔓狀靜脈叢 | 缺 | 補建 | 中 |  |
| RS-A-0164 | Superficial circumflex iliac vein | 淺旋髂靜脈 | 缺 | 補建 | 中 |  |
| RS-A-0165 | Deep circumflex iliac vein | 深旋髂靜脈 | 缺 | 補建 | 中 |  |
| RS-A-0171 | Cisterna chyli | 乳糜池 | 缺 | 補建 | 中 | 位於腹膜後，在 L1–L2 高度 |
| RS-A-0172 | Intestinal trunk | 腸幹 | 缺 | 補建 | 中 |  |
| RS-A-0173 | Right lumbar trunk | 右腰幹 | 缺 | 補建 | 中 |  |
| RS-A-0174 | Left lumbar trunk | 左腰幹 | 缺 | 補建 | 中 |  |
| RS-A-0175 | Celiac nodes | 腹腔淋巴結 | 缺 | 需使用者決定 | 中 | 淋巴結群沒有明確單一形狀；決定用區域標示或示意點群 |
| RS-A-0176 | Superior mesenteric nodes | 上腸繫膜淋巴結 | 缺 | 需使用者決定 | 中 | 淋巴結群沒有明確單一形狀；決定用區域標示或示意點群 |
| RS-A-0177 | Inferior mesenteric nodes | 下腸繫膜淋巴結 | 缺 | 需使用者決定 | 中 | 淋巴結群沒有明確單一形狀；決定用區域標示或示意點群 |
| RS-A-0178 | Pre-aortic nodes | 主動脈前淋巴結 | 缺 | 需使用者決定 | 中 | 淋巴結群沒有明確單一形狀；決定用區域標示或示意點群 |
| RS-A-0179 | Para-aortic nodes | 主動脈旁淋巴結 | 缺 | 需使用者決定 | 中 | 淋巴結群沒有明確單一形狀；決定用區域標示或示意點群 |
| RS-A-0180 | Lateral aortic nodes | 左右側主動脈淋巴結 | 缺 | 需使用者決定 | 中 | 淋巴結群沒有明確單一形狀；決定用區域標示或示意點群 |
| RS-A-0181 | Lumbar nodes | 腰淋巴結 | 缺 | 需使用者決定 | 中 | 淋巴結群沒有明確單一形狀；決定用區域標示或示意點群 |
| RS-A-0182 | Common iliac nodes | 總髂淋巴結 | 缺 | 需使用者決定 | 中 | 淋巴結群沒有明確單一形狀；決定用區域標示或示意點群 |
| RS-A-0183 | External iliac nodes | 外髂淋巴結 | 缺 | 需使用者決定 | 中 | 淋巴結群沒有明確單一形狀；決定用區域標示或示意點群 |
| RS-A-0184 | Internal iliac nodes | 內髂淋巴結 | 缺 | 需使用者決定 | 中 | 淋巴結群沒有明確單一形狀；決定用區域標示或示意點群 |
| RS-A-0185 | Superficial inguinal nodes | 淺腹股溝淋巴結 | 缺 | 需使用者決定 | 中 | 淋巴結群沒有明確單一形狀；決定用區域標示或示意點群 |
| RS-A-0069 | Abdominal aorta | 腹主動脈 | 有 | 已有 | — |  |
| RS-A-0070 | Celiac trunk | 腹腔動脈幹 | 有 | 已有 | — |  |
| RS-A-0071 | Left gastric artery | 左胃動脈 | 有 | 已有 | — |  |
| RS-A-0073 | Splenic artery | 脾動脈 | 有 | 已有 | — |  |
| RS-A-0077 | Dorsal pancreatic artery | 背胰動脈 | 有 | 已有 | — |  |
| RS-A-0079 | Common hepatic artery | 總肝動脈 | 有 | 已有 | — |  |
| RS-A-0080 | Hepatic artery proper | 肝固有動脈 | 有 | 已有 | — |  |
| RS-A-0081 | Left hepatic artery | 左肝動脈 | 有 | 已有 | — | ‡以較大結構的部分網格計入（例如以肝的分段、胃十二指腸動脈所屬分支），需確認是否可單獨點選 |
| RS-A-0082 | Right hepatic artery | 右肝動脈 | 有 | 已有 | — | ‡以較大結構的部分網格計入（例如以肝的分段、胃十二指腸動脈所屬分支），需確認是否可單獨點選 |
| RS-A-0084 | Right gastric artery | 右胃動脈 | 有 | 已有 | — |  |
| RS-A-0085 | Gastroduodenal artery | 胃十二指腸動脈 | 有 | 已有 | — | ‡以較大結構的部分網格計入（例如以肝的分段、胃十二指腸動脈所屬分支），需確認是否可單獨點選 |
| RS-A-0088 | Anterior superior pancreaticoduodenal artery | 前上胰十二指腸動脈 | 有 | 已有 | — |  |
| RS-A-0089 | Posterior superior pancreaticoduodenal artery | 後上胰十二指腸動脈 | 有 | 已有 | — |  |
| RS-A-0091 | Superior mesenteric artery | 上腸繫膜動脈 | 有 | 已有 | — |  |
| RS-A-0092 | Inferior pancreaticoduodenal artery | 下胰十二指腸動脈 | 有 | 已有 | — |  |
| RS-A-0093 | Anterior inferior pancreaticoduodenal artery | 前下胰十二指腸動脈 | 有 | 已有 | — |  |
| RS-A-0094 | Posterior inferior pancreaticoduodenal artery | 後下胰十二指腸動脈 | 有 | 已有 | — |  |
| RS-A-0096 | Ileal arteries | 迴腸動脈 | 有 | 已有 | — |  |
| RS-A-0097 | Ileocolic artery | 迴結腸動脈 | 有 | 已有 | — |  |
| RS-A-0098 | Appendicular artery | 闌尾動脈 | 有 | 已有 | — |  |
| RS-A-0099 | Right colic artery | 右結腸動脈 | 有 | 已有 | — |  |
| RS-A-0100 | Middle colic artery | 中結腸動脈 | 有 | 已有 | — |  |
| RS-A-0101 | Inferior mesenteric artery | 下腸繫膜動脈 | 有 | 已有 | — |  |
| RS-A-0102 | Left colic artery | 左結腸動脈 | 有 | 已有 | — |  |
| RS-A-0103 | Sigmoid arteries | 乙狀結腸動脈 | 有 | 已有 | — |  |
| RS-A-0104 | Superior rectal artery | 上直腸動脈 | 有 | 已有 | — |  |
| RS-A-0105 | Renal artery | 腎動脈 | 有 | 已有 | — |  |
| RS-A-0106 | Middle suprarenal artery | 中腎上腺動脈 | 有 | 已有 | — |  |
| RS-A-0108 | Inferior suprarenal artery | 下腎上腺動脈 | 有 | 已有 | — |  |
| RS-A-0110 | Testicular artery | 睪丸動脈 | 有 | 已有 | — |  |
| RS-A-0112 | Inferior phrenic artery | 下膈動脈 | 有 | 已有 | — |  |
| RS-A-0113 | Lumbar arteries | 腰動脈 | 有 | 已有 | — |  |
| RS-A-0115 | Subcostal artery | 肋下動脈 | 有 | 已有 | — |  |
| RS-A-0116 | Common iliac artery | 總髂動脈 | 有 | 已有 | — |  |
| RS-A-0117 | Internal iliac artery | 內髂動脈 | 有 | 已有 | — |  |
| RS-A-0118 | External iliac artery | 外髂動脈 | 有 | 已有 | — |  |
| RS-A-0119 | Inferior epigastric artery | 下腹壁動脈 | 有 | 已有 | — |  |
| RS-A-0120 | Deep circumflex iliac artery | 深旋髂動脈 | 有 | 已有 | — |  |
| RS-A-0121 | Superficial epigastric artery | 淺腹壁動脈 | 有 | 已有 | — |  |
| RS-A-0122 | Superficial circumflex iliac artery | 淺旋髂動脈 | 有 | 已有 | — |  |
| RS-A-0123 | Superior epigastric artery | 上腹壁動脈 | 有 | 已有 | — |  |
| RS-A-0124 | Musculophrenic artery | 肌膈動脈 | 有 | 已有 | — |  |
| RS-A-0125 | Superior phrenic artery | 上膈動脈 | 有 | 已有 | — | †比對來源為資訊卡資料表，有沒有獨立可點選網格無法確認 |
| RS-A-0129 | Inferior vena cava | 下腔靜脈 | 有 | 已有 | — |  |
| RS-A-0130 | Hepatic veins | 肝靜脈 | 有 | 已有 | — |  |
| RS-A-0131 | Inferior phrenic vein | 下膈靜脈 | 有 | 已有 | — |  |
| RS-A-0132 | Renal vein | 腎靜脈 | 有 | 已有 | — |  |
| RS-A-0133 | Right suprarenal vein | 右腎上腺靜脈 | 有 | 已有 | — |  |
| RS-A-0134 | Left suprarenal vein | 左腎上腺靜脈 | 有 | 已有 | — |  |
| RS-A-0137 | Testicular vein | 睪丸靜脈 | 有 | 已有 | — |  |
| RS-A-0139 | Lumbar veins | 腰靜脈 | 有 | 已有 | — |  |
| RS-A-0140 | Ascending lumbar vein | 升腰靜脈 | 有 | 已有 | — |  |
| RS-A-0141 | Iliolumbar vein | 髂腰靜脈 | 有 | 已有 | — |  |
| RS-A-0142 | Common iliac vein | 總髂靜脈 | 有 | 已有 | — |  |
| RS-A-0143 | Median sacral vein | 正中薦靜脈 | 有 | 已有 | — |  |
| RS-A-0144 | Azygos vein | 奇靜脈 | 有 | 已有 | — |  |
| RS-A-0145 | Hemiazygos vein | 半奇靜脈 | 有 | 已有 | — |  |
| RS-A-0146 | Hepatic portal vein | 肝門靜脈 | 有 | 已有 | — |  |
| RS-A-0147 | Splenic vein | 脾靜脈 | 有 | 已有 | — |  |
| RS-A-0148 | Superior mesenteric vein | 上腸繫膜靜脈 | 有 | 已有 | — |  |
| RS-A-0149 | Inferior mesenteric vein | 下腸繫膜靜脈 | 有 | 已有 | — |  |
| RS-A-0150 | Left gastric vein | 左胃靜脈 | 有 | 已有 | — |  |
| RS-A-0151 | Right gastric vein | 右胃靜脈 | 有 | 已有 | — |  |
| RS-A-0155 | Paraumbilical vein | 臍旁靜脈 | 有 | 已有 | — | †比對來源為資訊卡資料表，有沒有獨立可點選網格無法確認 |
| RS-A-0156 | Superior rectal vein | 上直腸靜脈 | 有 | 已有 | — |  |
| RS-A-0161 | Superficial epigastric vein | 淺腹壁靜脈 | 有 | 已有 | — |  |
| RS-A-0162 | Superior epigastric vein | 上腹壁靜脈 | 有 | 已有 | — |  |
| RS-A-0163 | Inferior epigastric vein | 下腹壁靜脈 | 有 | 已有 | — |  |
| RS-A-0166 | Thoracoepigastric vein | 胸腹壁靜脈 | 有 | 已有 | — | †比對來源為資訊卡資料表，有沒有獨立可點選網格無法確認 |
| RS-A-0167 | External iliac vein | 外髂靜脈 | 有 | 已有 | — |  |
| RS-A-0168 | Femoral vein | 股靜脈 | 有 | 已有 | — |  |
| RS-A-0169 | Internal thoracic vein | 內胸靜脈 | 有 | 已有 | — |  |
| RS-A-0170 | Thoracic duct | 胸管 | 有 | 已有 | — | †比對來源為資訊卡資料表，有沒有獨立可點選網格無法確認 |

## 三、腺體

核對 2 項：有 1；缺 0；名稱不同 1；部位不明 0；需使用者決定 1。

| id | 英文名 | 中文名 | 站上現況 | 建議處理 | 優先級 | 備註 |
|---|---|---|---|---|---|---|
| RS-A-0045 | Suprarenal gland | 腎上腺 | 名稱不同 | 需使用者決定 | 高 | 站上為 Left／Right adrenal gland（英文名不同，中文「腎上腺」相同）；顯示名要用 Adrenal 或 Suprarenal 請使用者決定 |
| RS-A-0029 | Pancreas | 胰臟 | 有 | 已有 | — |  |

## 四、神經分支（含自主神經叢與神經節）

核對 37 項：有 20；缺 17；名稱不同 0；部位不明 0；需使用者決定 0。

| id | 英文名 | 中文名 | 站上現況 | 建議處理 | 優先級 | 備註 |
|---|---|---|---|---|---|---|
| RS-A-0193 | Lumbar splanchnic nerves | 腰內臟神經 | 缺 | 補建 | 中 | 只有資訊卡資料（腦部資訊卡），沒有網格 |
| RS-A-0194 | Pelvic splanchnic nerves | 骨盆內臟神經 | 缺 | 補建 | 中 |  |
| RS-A-0196 | Ganglion impar | 奇神經節 | 缺 | 補建 | 中 |  |
| RS-A-0197 | Hypogastric nerve | 下腹神經 | 缺 | 補建 | 中 |  |
| RS-A-0201 | Inferior mesenteric ganglion | 下腸繫膜神經節 | 缺 | 補建 | 中 |  |
| RS-A-0202 | Celiac plexus | 腹腔叢 | 缺 | 補建 | 中 |  |
| RS-A-0203 | Aortic plexus | 主動脈叢 | 缺 | 補建 | 中 |  |
| RS-A-0204 | Superior mesenteric plexus | 上腸繫膜叢 | 缺 | 補建 | 中 |  |
| RS-A-0205 | Intermesenteric plexus | 中腸繫膜叢 | 缺 | 補建 | 中 |  |
| RS-A-0206 | Inferior mesenteric plexus | 下腸繫膜叢 | 缺 | 補建 | 中 |  |
| RS-A-0207 | Renal plexus | 腎神經叢 | 缺 | 補建 | 中 |  |
| RS-A-0208 | Superior hypogastric plexus | 上腹下神經叢 | 缺 | 補建 | 中 |  |
| RS-A-0209 | Inferior hypogastric plexus | 下腹下神經叢 | 缺 | 補建 | 中 |  |
| RS-A-0212 | Lumbar plexus | 腰神經叢 | 缺 | 補建 | 中 |  |
| RS-A-0213 | Subcostal nerve | 肋下神經 | 缺 | 補建 | 中 |  |
| RS-A-0222 | Accessory obturator nerve | 副閉孔神經 | 缺 | 補建 | 中 |  |
| RS-A-0223 | Lumbosacral trunk | 腰薦神經幹 | 缺 | 補建 | 中 |  |
| RS-A-0186 | Vagus nerve | 迷走神經 | 有 | 已有 | — |  |
| RS-A-0187 | Anterior vagal trunk | 前迷走神經幹 | 有 | 已有 | — | †比對來源為資訊卡資料表，有沒有獨立可點選網格無法確認 |
| RS-A-0188 | Posterior vagal trunk | 後迷走神經幹 | 有 | 已有 | — | †比對來源為資訊卡資料表，有沒有獨立可點選網格無法確認 |
| RS-A-0189 | Phrenic nerve | 膈神經 | 有 | 已有 | — | †比對來源為資訊卡資料表，有沒有獨立可點選網格無法確認 |
| RS-A-0190 | Greater splanchnic nerve | 大內臟神經 | 有 | 已有 | — | †比對來源為資訊卡資料表，有沒有獨立可點選網格無法確認 |
| RS-A-0191 | Lesser splanchnic nerve | 小內臟神經 | 有 | 已有 | — | †比對來源為資訊卡資料表，有沒有獨立可點選網格無法確認 |
| RS-A-0192 | Least splanchnic nerve | 最小內臟神經 | 有 | 已有 | — | †比對來源為資訊卡資料表，有沒有獨立可點選網格無法確認 |
| RS-A-0195 | Sympathetic trunk | 交感神經幹 | 有 | 已有 | — |  |
| RS-A-0198 | Celiac ganglion | 腹腔神經節 | 有 | 已有 | — | †比對來源為資訊卡資料表，有沒有獨立可點選網格無法確認 |
| RS-A-0199 | Aorticorenal ganglion | 主動脈腎神經節 | 有 | 已有 | — | †比對來源為資訊卡資料表，有沒有獨立可點選網格無法確認 |
| RS-A-0200 | Superior mesenteric ganglion | 上腸繫膜神經節 | 有 | 已有 | — | †比對來源為資訊卡資料表，有沒有獨立可點選網格無法確認 |
| RS-A-0214 | Iliohypogastric nerve | 髂腹下神經 | 有 | 已有 | — |  |
| RS-A-0215 | Ilioinguinal nerve | 髂腹股溝神經 | 有 | 已有 | — |  |
| RS-A-0216 | Genitofemoral nerve | 生殖股神經 | 有 | 已有 | — |  |
| RS-A-0217 | Genital branch of genitofemoral nerve | 生殖支 | 有 | 已有 | — |  |
| RS-A-0218 | Femoral branch of genitofemoral nerve | 股支 | 有 | 已有 | — |  |
| RS-A-0219 | Lateral femoral cutaneous nerve | 外股皮神經 | 有 | 已有 | — |  |
| RS-A-0220 | Femoral nerve | 股神經 | 有 | 已有 | — |  |
| RS-A-0221 | Obturator nerve | 閉孔神經 | 有 | 已有 | — |  |
| RS-A-0224 | Intercostal nerves | 肋間神經 | 有 | 已有 | — |  |

## 五、骨的細部（骨性標記）

核對 9 項：有 3；缺 6；名稱不同 0；部位不明 0；需使用者決定 0。

| id | 英文名 | 中文名 | 站上現況 | 建議處理 | 優先級 | 備註 |
|---|---|---|---|---|---|---|
| RS-A-0277 | Anterior superior iliac spine | 前上髂棘 | 缺 | 補建 | 低 | 站上已有骨骼；骨面標示，不另做模型 |
| RS-A-0278 | Iliac fossa | 髂窩 | 缺 | 補建 | 低 | 站上已有骨骼；骨面標示，不另做模型 |
| RS-A-0280 | Pubic crest | 恥骨脊 | 缺 | 補建 | 低 | 站上已有骨骼；骨面標示，不另做模型 |
| RS-A-0281 | Pectineal line | 恥骨線 | 缺 | 補建 | 低 | 站上已有骨骼；骨面標示，不另做模型 |
| RS-A-0282 | Iliopubic eminence | 髂恥隆凸 | 缺 | 補建 | 低 | 站上已有骨骼；骨面標示，不另做模型 |
| RS-A-0284 | Costal margin | 肋弓 | 缺 | 補建 | 低 | 站上已有骨骼；骨面標示，不另做模型 |
| RS-A-0276 | Iliac crest | 髂脊 | 有 | 已有 | — | †比對來源為資訊卡資料表，有沒有獨立可點選網格無法確認 |
| RS-A-0279 | Pubic tubercle | 恥骨結節 | 有 | 已有 | — | †比對來源為資訊卡資料表，有沒有獨立可點選網格無法確認 |
| RS-A-0283 | Xiphoid process | 劍突 | 有 | 已有 | — |  |

## 六、腹膜、筋膜、間隙、管與孔、韌帶

核對 60 項：有 7；缺 49；名稱不同 2；部位不明 2；需使用者決定 24。

| id | 英文名 | 中文名 | 站上現況 | 建議處理 | 優先級 | 備註 |
|---|---|---|---|---|---|---|
| RS-A-0046 | Peritoneum | 腹膜 | 部位不明 | 需使用者決定 | 中 | 站上有同名概念群組（含 region of peritoneum 等），無法確認有沒有可點選網格 |
| RS-A-0047 | Parietal peritoneum | 壁層腹膜 | 缺 | 補建 | 中 |  |
| RS-A-0048 | Visceral peritoneum | 臟層腹膜 | 部位不明 | 需使用者決定 | 中 | 站上有同名概念群組，無法確認有沒有可點選網格 |
| RS-A-0049 | Peritoneal cavity | 腹膜腔 | 缺 | 需使用者決定 | 中 |  |
| RS-A-0050 | Greater sac | 大囊 | 缺 | 需使用者決定 | 中 |  |
| RS-A-0051 | Lesser sac (omental bursa) | 小囊（網膜囊） | 缺 | 需使用者決定 | 中 |  |
| RS-A-0052 | Omental foramen (epiploic foramen) | 網膜孔 | 缺 | 需使用者決定 | 中 |  |
| RS-A-0053 | Greater omentum | 大網膜 | 缺 | 補建 | 中 |  |
| RS-A-0054 | Lesser omentum | 小網膜 | 缺 | 補建 | 中 |  |
| RS-A-0055 | Hepatogastric ligament | 肝胃韌帶 | 缺 | 補建 | 中 |  |
| RS-A-0056 | Hepatoduodenal ligament | 肝十二指腸韌帶 | 缺 | 補建 | 中 |  |
| RS-A-0057 | Mesentery | 小腸繫膜 | 名稱不同 | 相關搜尋 | 中 | 站上為 Mesentery of small intestine（以中文名比對到） |
| RS-A-0058 | Root of mesentery | 腸繫膜根部 | 缺 | 補建 | 中 |  |
| RS-A-0060 | Sigmoid mesocolon | 乙狀結腸繫膜 | 缺 | 補建 | 中 |  |
| RS-A-0062 | Median umbilical fold | 正中臍襞 | 缺 | 補建 | 中 |  |
| RS-A-0063 | Medial umbilical fold | 內側臍襞 | 缺 | 補建 | 中 |  |
| RS-A-0064 | Lateral umbilical fold | 外側臍襞 | 缺 | 補建 | 中 |  |
| RS-A-0065 | Falciform ligament | 鐮狀韌帶 | 缺 | 補建 | 中 |  |
| RS-A-0066 | Round ligament of liver | 肝圓韌帶 | 缺 | 補建 | 中 |  |
| RS-A-0067 | Median umbilical ligament | 正中臍韌帶 | 缺 | 補建 | 中 |  |
| RS-A-0068 | Medial umbilical ligament | 內側臍韌帶 | 缺 | 補建 | 中 |  |
| RS-A-0240 | Semilunar line (linea semilunaris) | 半月線 | 缺 | 補建 | 低 |  |
| RS-A-0241 | Tendinous intersections | 腱劃 | 缺 | 補建 | 低 |  |
| RS-A-0242 | Arcuate line | 弓狀線 | 缺 | 補建 | 低 |  |
| RS-A-0243 | External oblique aponeurosis | 腹外斜肌腱膜 | 缺 | 補建 | 低 |  |
| RS-A-0245 | Lacunar ligament | 腔隙韌帶 | 缺 | 補建 | 低 |  |
| RS-A-0246 | Iliopectineal ligament | 髂恥韌帶 | 缺 | 補建 | 低 |  |
| RS-A-0247 | Conjoint tendon | 聯合肌腱 | 缺 | 補建 | 低 |  |
| RS-A-0249 | Median arcuate ligament | 正中弓狀韌帶 | 缺 | 補建 | 低 |  |
| RS-A-0250 | Medial arcuate ligament | 內側弓狀韌帶 | 缺 | 補建 | 低 |  |
| RS-A-0251 | Lateral arcuate ligament | 外側弓狀韌帶 | 缺 | 補建 | 低 |  |
| RS-A-0253 | Esophageal hiatus | 食道裂孔 | 缺 | 補建 | 低 |  |
| RS-A-0254 | Vena caval hiatus | 腔靜脈裂孔 | 缺 | 補建 | 低 |  |
| RS-A-0255 | Inguinal canal | 腹股溝管 | 缺 | 需使用者決定 | 低 |  |
| RS-A-0256 | Superficial inguinal ring | 淺腹股溝環 | 缺 | 需使用者決定 | 低 |  |
| RS-A-0257 | Deep inguinal ring | 深腹股溝環 | 缺 | 需使用者決定 | 低 |  |
| RS-A-0258 | Spermatic cord | 精索 | 缺 | 補建 | 低 |  |
| RS-A-0259 | Ductus deferens | 輸精管 | 名稱不同 | 相關搜尋 | 低 | 以中文名「輸精管」比對到站上結構，英文名未核實 |
| RS-A-0260 | Inguinal triangle (Hesselbach's triangle) | 腹股溝三角 | 缺 | 需使用者決定 | 低 |  |
| RS-A-0261 | Femoral canal | 股管 | 缺 | 需使用者決定 | 低 |  |
| RS-A-0262 | Femoral ring | 股環 | 缺 | 需使用者決定 | 低 |  |
| RS-A-0263 | Superficial fascia of abdomen | 淺筋膜 | 缺 | 需使用者決定 | 低 | 筋膜依特殊空間規則：高亮邊界結構，必要時半透明立體 |
| RS-A-0264 | Camper's fascia | 淺層脂肪層（Camper 氏筋膜） | 缺 | 需使用者決定 | 低 | 筋膜依特殊空間規則：高亮邊界結構，必要時半透明立體 |
| RS-A-0265 | Scarpa's fascia | 深層膜性層（Scarpa 氏筋膜） | 缺 | 需使用者決定 | 低 | 筋膜依特殊空間規則：高亮邊界結構，必要時半透明立體 |
| RS-A-0266 | Deep fascia of abdomen | 深筋膜 | 缺 | 需使用者決定 | 低 | 筋膜依特殊空間規則：高亮邊界結構，必要時半透明立體 |
| RS-A-0267 | Transversalis fascia | 腹橫筋膜 | 缺 | 需使用者決定 | 低 | 筋膜依特殊空間規則：高亮邊界結構，必要時半透明立體 |
| RS-A-0269 | Renal fascia | 腎筋膜 | 缺 | 需使用者決定 | 低 | 筋膜依特殊空間規則：高亮邊界結構，必要時半透明立體 |
| RS-A-0270 | Extraperitoneal fascia | 腹膜外筋膜 | 缺 | 需使用者決定 | 低 | 筋膜依特殊空間規則：高亮邊界結構，必要時半透明立體 |
| RS-A-0271 | Internal spermatic fascia | 內精筋膜 | 缺 | 需使用者決定 | 低 | 筋膜依特殊空間規則：高亮邊界結構，必要時半透明立體 |
| RS-A-0272 | External spermatic fascia | 外精筋膜 | 缺 | 需使用者決定 | 低 | 筋膜依特殊空間規則：高亮邊界結構，必要時半透明立體 |
| RS-A-0273 | Cremasteric fascia | 提睪肌筋膜 | 缺 | 需使用者決定 | 低 | 筋膜依特殊空間規則：高亮邊界結構，必要時半透明立體 |
| RS-A-0274 | Perirenal fat | 腎圍脂肪層 | 缺 | 需使用者決定 | 低 |  |
| RS-A-0275 | Pararenal fat | 腎旁脂肪層 | 缺 | 需使用者決定 | 低 |  |
| RS-A-0059 | Transverse mesocolon | 橫結腸繫膜 | 有 | 已有 | — |  |
| RS-A-0061 | Mesoappendix | 闌尾繫膜 | 有 | 已有 | — |  |
| RS-A-0239 | Linea alba | 白線 | 有 | 已有 | — |  |
| RS-A-0244 | Inguinal ligament | 腹股溝韌帶 | 有 | 已有 | — |  |
| RS-A-0248 | Iliolumbar ligament | 髂腰韌帶 | 有 | 已有 | — |  |
| RS-A-0252 | Aortic hiatus | 主動脈裂孔 | 有 | 已有 | — | †比對來源為資訊卡資料表，有沒有獨立可點選網格無法確認 |
| RS-A-0268 | Thoracolumbar fascia | 胸腰筋膜 | 有 | 已有 | — | †比對來源為資訊卡資料表，有沒有獨立可點選網格無法確認 |

## 七、腹壁與後腹壁肌肉

核對 14 項：有 8；缺 6；名稱不同 0；部位不明 0；需使用者決定 0。

| id | 英文名 | 中文名 | 站上現況 | 建議處理 | 優先級 | 備註 |
|---|---|---|---|---|---|---|
| RS-A-0229 | Cremaster | 提睪肌 | 缺 | 補建 | 中 |  |
| RS-A-0231 | Psoas minor | 腰小肌 | 缺 | 補建 | 中 |  |
| RS-A-0234 | Iliopsoas | 髂腰肌 | 缺 | 補建 | 中 |  |
| RS-A-0236 | Right crus of diaphragm | 橫膈右腳 | 缺 | 補建 | 中 |  |
| RS-A-0237 | Left crus of diaphragm | 橫膈左腳 | 缺 | 補建 | 中 |  |
| RS-A-0238 | Central tendon of diaphragm | 橫膈中央肌腱 | 缺 | 補建 | 中 |  |
| RS-A-0225 | Rectus abdominis | 腹直肌 | 有 | 已有 | — |  |
| RS-A-0226 | External oblique | 腹外斜肌 | 有 | 已有 | — |  |
| RS-A-0227 | Internal oblique | 腹內斜肌 | 有 | 已有 | — |  |
| RS-A-0228 | Transversus abdominis | 腹橫肌 | 有 | 已有 | — |  |
| RS-A-0230 | Psoas major | 腰大肌 | 有 | 已有 | — |  |
| RS-A-0232 | Iliacus | 髂肌 | 有 | 已有 | — |  |
| RS-A-0233 | Quadratus lumborum | 腰方肌 | 有 | 已有 | — |  |
| RS-A-0235 | Diaphragm | 橫膈 | 有 | 已有 | — |  |

## 不要求 3D 的項目（細胞、組織層級）

- RS-A-0026 Hepatic sinusoid｜肝竇隙
- RS-A-0027 Central vein of liver lobule｜中央靜脈
- RS-A-0028 Hepatic plate｜肝板
- RS-A-0042 Nephron｜腎元
- RS-A-0210 Submucosal plexus (Meissner's plexus)｜黏膜下層神經叢
- RS-A-0211 Myenteric plexus (Auerbach's plexus)｜肌間神經叢

## 批次完整名單

**批次 1（17 項）**：RS-A-0003 Fundus of stomach；RS-A-0004 Lesser curvature of stomach；RS-A-0005 Greater curvature of stomach；RS-A-0006 Pylorus；RS-A-0008 Duodenojejunal flexure；RS-A-0012 Cecum；RS-A-0015 Right colic flexure；RS-A-0017 Left colic flexure；RS-A-0019 Sigmoid colon；RS-A-0021 Anus；RS-A-0024 Bile duct (common bile duct)；RS-A-0025 Portal triad；RS-A-0032 Renal cortex；RS-A-0033 Renal medulla；RS-A-0034 Renal pyramid；RS-A-0035 Renal column；RS-A-0036 Renal papilla

**批次 2（17 項）**：RS-A-0037 Minor calyx；RS-A-0038 Major calyx；RS-A-0039 Renal pelvis；RS-A-0040 Renal sinus；RS-A-0041 Hilum of kidney；RS-A-0072 Esophageal branch of left gastric artery；RS-A-0074 Short gastric arteries；RS-A-0075 Left gastro-omental artery；RS-A-0076 Posterior gastric artery；RS-A-0078 Greater pancreatic artery；RS-A-0083 Cystic artery；RS-A-0086 Right gastro-omental artery；RS-A-0087 Superior pancreaticoduodenal artery；RS-A-0090 Supraduodenal artery；RS-A-0095 Jejunal arteries；RS-A-0107 Superior suprarenal artery；RS-A-0109 Gonadal artery

**批次 3（17 項）**：RS-A-0111 Ovarian artery；RS-A-0114 Median sacral artery；RS-A-0135 Right gonadal vein；RS-A-0136 Left gonadal vein；RS-A-0138 Ovarian vein；RS-A-0152 Short gastric veins；RS-A-0153 Left gastro-omental vein；RS-A-0154 Cystic vein；RS-A-0157 Middle rectal veins；RS-A-0158 Inferior rectal veins；RS-A-0159 Esophageal vein；RS-A-0045 Suprarenal gland；RS-A-0126 Pericardiacophrenic artery；RS-A-0127 Cremasteric artery；RS-A-0128 Inferior vesical artery；RS-A-0160 Pampiniform venous plexus；RS-A-0164 Superficial circumflex iliac vein

**批次 4（17 項）**：RS-A-0165 Deep circumflex iliac vein；RS-A-0171 Cisterna chyli；RS-A-0172 Intestinal trunk；RS-A-0173 Right lumbar trunk；RS-A-0174 Left lumbar trunk；RS-A-0175 Celiac nodes；RS-A-0176 Superior mesenteric nodes；RS-A-0177 Inferior mesenteric nodes；RS-A-0178 Pre-aortic nodes；RS-A-0179 Para-aortic nodes；RS-A-0180 Lateral aortic nodes；RS-A-0181 Lumbar nodes；RS-A-0182 Common iliac nodes；RS-A-0183 External iliac nodes；RS-A-0184 Internal iliac nodes；RS-A-0185 Superficial inguinal nodes；RS-A-0193 Lumbar splanchnic nerves

**批次 5（17 項）**：RS-A-0194 Pelvic splanchnic nerves；RS-A-0196 Ganglion impar；RS-A-0197 Hypogastric nerve；RS-A-0201 Inferior mesenteric ganglion；RS-A-0202 Celiac plexus；RS-A-0203 Aortic plexus；RS-A-0204 Superior mesenteric plexus；RS-A-0205 Intermesenteric plexus；RS-A-0206 Inferior mesenteric plexus；RS-A-0207 Renal plexus；RS-A-0208 Superior hypogastric plexus；RS-A-0209 Inferior hypogastric plexus；RS-A-0212 Lumbar plexus；RS-A-0213 Subcostal nerve；RS-A-0222 Accessory obturator nerve；RS-A-0223 Lumbosacral trunk；RS-A-0046 Peritoneum

**批次 6（17 項）**：RS-A-0047 Parietal peritoneum；RS-A-0048 Visceral peritoneum；RS-A-0049 Peritoneal cavity；RS-A-0050 Greater sac；RS-A-0051 Lesser sac (omental bursa)；RS-A-0052 Omental foramen (epiploic foramen)；RS-A-0053 Greater omentum；RS-A-0054 Lesser omentum；RS-A-0055 Hepatogastric ligament；RS-A-0056 Hepatoduodenal ligament；RS-A-0057 Mesentery；RS-A-0058 Root of mesentery；RS-A-0060 Sigmoid mesocolon；RS-A-0062 Median umbilical fold；RS-A-0063 Medial umbilical fold；RS-A-0064 Lateral umbilical fold；RS-A-0065 Falciform ligament

**批次 7（17 項）**：RS-A-0066 Round ligament of liver；RS-A-0067 Median umbilical ligament；RS-A-0068 Medial umbilical ligament；RS-A-0229 Cremaster；RS-A-0231 Psoas minor；RS-A-0234 Iliopsoas；RS-A-0236 Right crus of diaphragm；RS-A-0237 Left crus of diaphragm；RS-A-0238 Central tendon of diaphragm；RS-A-0277 Anterior superior iliac spine；RS-A-0278 Iliac fossa；RS-A-0280 Pubic crest；RS-A-0281 Pectineal line；RS-A-0282 Iliopubic eminence；RS-A-0284 Costal margin；RS-A-0240 Semilunar line (linea semilunaris)；RS-A-0241 Tendinous intersections

**批次 8（17 項）**：RS-A-0242 Arcuate line；RS-A-0243 External oblique aponeurosis；RS-A-0245 Lacunar ligament；RS-A-0246 Iliopectineal ligament；RS-A-0247 Conjoint tendon；RS-A-0249 Median arcuate ligament；RS-A-0250 Medial arcuate ligament；RS-A-0251 Lateral arcuate ligament；RS-A-0253 Esophageal hiatus；RS-A-0254 Vena caval hiatus；RS-A-0255 Inguinal canal；RS-A-0256 Superficial inguinal ring；RS-A-0257 Deep inguinal ring；RS-A-0258 Spermatic cord；RS-A-0259 Ductus deferens；RS-A-0260 Inguinal triangle (Hesselbach's triangle)；RS-A-0261 Femoral canal

**批次 9（13 項）**：RS-A-0262 Femoral ring；RS-A-0263 Superficial fascia of abdomen；RS-A-0264 Camper's fascia；RS-A-0265 Scarpa's fascia；RS-A-0266 Deep fascia of abdomen；RS-A-0267 Transversalis fascia；RS-A-0269 Renal fascia；RS-A-0270 Extraperitoneal fascia；RS-A-0271 Internal spermatic fascia；RS-A-0272 External spermatic fascia；RS-A-0273 Cremasteric fascia；RS-A-0274 Perirenal fat；RS-A-0275 Pararenal fat

## 檢查接線

- 新增 `docs/required-structures/abdomen.json`（ids `RS-A-0001`…，只有名稱、中文名、類型）、`aliases-abdomen.json`（空）、`known-gaps-abdomen.json`（目前 145 項缺口，含比對程式判為缺的全部項目，只可減少）與 `scripts/check-required-abdomen.mjs`（由頭頸區檢查複製，僅換檔名並加 `--json`）。
- 由 `scripts/checks/check.d/20261114-required-abdomen.txt` 接進 `npm run check`；沒有改 `check.txt` 與 `package.json`。CI 只輸出數量與 id。
- 補上新結構後，執行 `node scripts/check-required-abdomen.mjs --write` 把已補上的項目從缺口移除。
