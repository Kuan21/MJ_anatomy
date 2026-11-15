# 第二次考試範圍核對：腹部（含內臟），第二輪（內部清單，不上網站）

2026-11-15 第二輪。第一輪（2026-11-14）只讀到三份部分資料；本輪取得使用者提供的三份腹部課程資料的文字版（腹壁與腹股溝區；消化器官與腹膜；後腹壁、腎臟、血管與神經），把它們提到的腹部結構逐一補進必備清單。範圍同第一輪：腹壁、腹膜、消化道與肝膽胰脾、泌尿（腎、輸尿管）、腎上腺、腹部血管與淋巴、腹部神經叢與腰神經叢、橫膈與後腹壁；骨盆與會陰另列一區。依每區內順序：血管 → 腺體 → 神經分支 → 骨的細部 → 筋膜與間隙；臟器是本區主要內容，排在最前面。本檔只放在 `docs/`，不可放進 `public/` 或 `dist/`；只列結構名稱，沒有任何說明句、頁碼或題目。

## 摘要

| 項目 | 數量 |
|---|---|
| 必備清單結構數（`docs/required-structures/abdomen.json`） | 461（第一輪 284，本輪新增 177） |
| 核對項（要求 3D；扣除細胞、組織層級與胚胎遺跡等 33 項） | 428（第一輪 278，本輪新增 150） |
| 有（比對程式在站上資料找到） | 151（其中 †僅資訊卡資料來源 19、‡以部分網格計入 6） |
| 缺 | 263（其中只有資訊卡 1；含 17 項屬其他區域、另列核對） |
| 名稱不同（別名表或中文名比對到） | 11 |
| 部位不明 | 3 |
| 已由使用者決定（見「已有決定覆蓋的項目」，不重複計為待決定） | 46 |
| 比照使用者決定、待確認（本輪新增的同類項目） | 10 |
| 仍需使用者決定 | 16（體表分區、平面與臍 15、Couinaud 肝段 1） |

「有」的數字出自 `node scripts/check-required-abdomen.mjs`（與頭頸區共用 `scripts/lib/required-match.mjs` 與同一份站上名稱索引）。比對只看結構名稱，沒有逐項在 3D 畫面確認；也沒有宣稱任何解剖位置正確，請使用者核對。

### 本輪新增的缺口與已知缺口檔

- 本輪新增的核對項 150 項中，站上已有或以別名對應 30 項，**新缺口 120 項**。
- 已知缺口檔 `docs/required-structures/known-gaps-abdomen.json` 由 145 項變為 265 項（新增 120）。依 README 的「第一次採用」程序，用 `node scripts/check-required-abdomen.mjs --write --adopt` 一次寫入。**這是使用者明確要求更新必備清單的這一次，暫時放寬「已知缺口只可減少」；之後仍只可減少，補上結構後用 `--write` 移除。**
- 新增的 6 筆別名（`aliases-abdomen.json`，皆為 `member`：清單用總稱、站上逐一繪製成員）：腰椎、肋軟骨、結腸帶、結腸繫膜、椎前神經節、胸內臟神經。不確定的別名沒有加。

### 來源與無法讀取、無法確認的部分

- 課程資料 1：腹壁、腹股溝區（腹部分區、前外側腹壁、血管與神經、腹直肌鞘、壁層腹膜、腹股溝管、疝氣）；課程資料 2：消化器官與腹膜（食道、胃、小腸、肝膽胰脾、大腸、腹膜）；課程資料 3：後腹壁、橫膈、腎、輸尿管、腎上腺、腹主動脈分支、臟器血供、腹腔靜脈、淋巴、自主神經與腰神經叢。三份都讀完，只取結構名稱；各份末尾的歷屆題目、組員名單與玩笑段落不讀。
- 第一輪缺的消化器官與肝膽胰脾（含器官內部的分段與構造）本輪已補入，是新增項的最大宗。
- 資料是由 PDF 轉出的文字版，圖片沒有轉出、表格排版可能走樣；沒有圖就無法確認的位置關係（例如「哪個面接哪個臟器」）只記名稱，不記位置。可能有 OCR 錯字，見「名稱衝突與異常」。
- 資料中提到但屬於其他區域的結構（頭頸：環咽肌；胸腔：胸主動脈、內胸動脈、後肋間動脈、外胸靜脈、腋與胸骨旁淋巴結、頸與鎖骨下與支氣管縱膈淋巴幹；骨盆與會陰：睪丸、副睪、卵巢、子宮圓韌帶、卵巢韌帶、內陰動脈、肉膜、科利斯氏筋膜；四肢：股動脈、闊筋膜、坐骨神經、隱神經、大腿肌群）：能辨識的已放進清單並標「跨區」（見該節），不計入腹部建造批次；其餘只在最後一節列名，不放進清單。
- 中文名取自課程資料與既有名詞表，沒有逐項與台灣解剖學名詞比對；有爭議的見「名稱衝突與異常」。
- 比對來源標示：†比對到的名稱只在資訊卡資料表（如 paokao 卡片、腦部資訊卡），有沒有獨立網格無法確認；‡由「某結構的一部分」的網格計入。這兩類在「有」的數字內，但可能高估。站上的網格若是執行階段才載入、或建置時才下載的，不在索引內，可能低估。

## 建議分批（待使用者確認後再建）

尚需處理的 269 項（缺、部位不明與需改名者；不含「跨區」17 項）依性質分成五條線，**不要混在同一個 PR**：

| 線 | 項數 | 說明 |
|---|---|---|
| A 模型與標示批次（【需人工審核】） | 183（含使用者已決定的高亮邊界 8 項） | 依區內順序排：臟器 → 血管 → 腺體 → 神經 → 骨 → 腹膜與韌帶 → 肌肉；每批 16–17 項，共 11 批 |
| B 腎內部構造（【需人工審核】） | 10 | 使用者已決定：一個冠狀切面腎，一個 PR |
| C 資訊卡批次 | 34 | 已決定只做資訊卡 25 項＋比照待確認 9 項；每批 ≤17 項，共 2 批 |
| D 名稱、別名、相關搜尋（純資料，可自動 merge） | 7 加名稱統一建議（見名稱衝突節） | 腎上腺顯示名與 Suprarenal 搜尋、生殖腺動靜脈與上胰十二指腸動脈的相關搜尋等 |
| E 先查現況或等使用者決定 | 18 | 腹膜與臟層腹膜（先查現況）2 項；體表分區與平面、Couinaud 肝段等 16 項 |

### A 線：模型與標示批次

**A1（17 項；臟器）**：0003 Fundus of stomach；0004 Lesser curvature of stomach；0005 Greater curvature of stomach；0006 Pylorus；0008 Duodenojejunal flexure；0012 Cecum；0015 Right colic flexure；0017 Left colic flexure；0019 Sigmoid colon；0021 Anus；0024 Bile duct (common bile duct)；0025 Portal triad；0352 Cardia (cardial orifice)；0354 Body of stomach；0355 Pyloric antrum；0356 Pyloric canal；0372 Superior part of duodenum (duodenal cap)

**A2（17 項；臟器）**：0373 Descending part of duodenum；0374 Inferior (horizontal) part of duodenum；0375 Ascending part of duodenum；0376 Major duodenal papilla；0377 Minor duodenal papilla；0378 Hepatopancreatic ampulla (ampulla of Vater)；0391 Right lobe of liver；0392 Left lobe of liver；0393 Quadrate lobe of liver；0395 Porta hepatis；0399 Bare area of liver；0418 Hilum of spleen (splenic hilum)；0424 Anal canal；0426 Haustra of colon；0427 Omental (epiploic) appendices；0349 Abdominal esophagus；0353 Cardial notch

**A3（17 項；臟器、血管（動脈、靜脈、淋巴））**：0358 Angular incisure (angular notch)；0362 Esophagogastric junction (Z-line)；0386 Ileocecal valve；0407 Fundus of gallbladder；0408 Body of gallbladder；0409 Neck of gallbladder；0446 Ureteropelvic junction；0346 Cervical constriction of esophagus；0347 Thoracic (broncho-aortic) constriction of esophagus；0348 Diaphragmatic (esophagogastric) constriction of esophagus；0359 Gastric canal；0387 Diaphragmatic surface of liver；0388 Visceral surface of liver；0419 Gastric surface of spleen；0420 Colic surface of spleen；0421 Renal surface of spleen；0072 Esophageal branch of left gastric artery

**A4（17 項；血管（動脈、靜脈、淋巴））**：0074 Short gastric arteries；0075 Left gastro-omental artery；0076 Posterior gastric artery；0078 Greater pancreatic artery；0083 Cystic artery；0086 Right gastro-omental artery；0090 Supraduodenal artery；0095 Jejunal arteries；0107 Superior suprarenal artery；0111 Ovarian artery；0114 Median sacral artery；0138 Ovarian vein；0152 Short gastric veins；0153 Left gastro-omental vein；0154 Cystic vein；0157 Middle rectal veins；0158 Inferior rectal veins

**A5（17 項；血管（動脈、靜脈、淋巴））**：0159 Esophageal vein；0126 Pericardiacophrenic artery；0127 Cremasteric artery；0128 Inferior vesical artery；0160 Pampiniform venous plexus；0164 Superficial circumflex iliac vein；0165 Deep circumflex iliac vein；0171 Cisterna chyli；0172 Intestinal trunk；0173 Right lumbar trunk；0174 Left lumbar trunk；0370 Right gastro-omental vein；0429 Middle rectal artery；0430 Inferior rectal artery；0451 Iliolumbar artery；0369 Esophageal branch of left inferior phrenic artery；0371 Posterior gastric veins

**A6（17 項；血管（動脈、靜脈、淋巴）、腺體、神經分支（含自主神經叢與神經節））**：0452 Lumbar azygos vein；0410 Head of pancreas；0411 Uncinate process of pancreas；0413 Body of pancreas；0414 Tail of pancreas；0415 Main pancreatic duct；0412 Neck of pancreas；0416 Accessory pancreatic duct；0193 Lumbar splanchnic nerves；0194 Pelvic splanchnic nerves；0196 Ganglion impar；0197 Hypogastric nerve；0201 Inferior mesenteric ganglion；0202 Celiac plexus；0203 Aortic plexus；0204 Superior mesenteric plexus；0205 Intermesenteric plexus

**A7（17 項；神經分支（含自主神經叢與神經節）、骨的細部（骨性標記））**：0206 Inferior mesenteric plexus；0207 Renal plexus；0208 Superior hypogastric plexus；0209 Inferior hypogastric plexus；0212 Lumbar plexus；0213 Subcostal nerve；0222 Accessory obturator nerve；0223 Lumbosacral trunk；0332 Thoraco-abdominal nerves；0459 White ramus communicans；0277 Anterior superior iliac spine；0278 Iliac fossa；0280 Pubic crest；0281 Pectineal line；0282 Iliopubic eminence；0284 Costal margin；0298 Tubercle of iliac crest

**A8（16 項；腹膜、筋膜、間隙、管與孔、韌帶）**：0047 Parietal peritoneum；0051 Lesser sac (omental bursa)；0052 Omental foramen (epiploic foramen)；0053 Greater omentum；0054 Lesser omentum；0055 Hepatogastric ligament；0056 Hepatoduodenal ligament；0058 Root of mesentery；0060 Sigmoid mesocolon；0062 Median umbilical fold；0063 Medial umbilical fold；0064 Lateral umbilical fold；0065 Falciform ligament；0066 Round ligament of liver；0067 Median umbilical ligament；0068 Medial umbilical ligament

**A9（16 項；腹膜、筋膜、間隙、管與孔、韌帶）**：0255 Inguinal canal；0256 Superficial inguinal ring；0257 Deep inguinal ring；0260 Inguinal triangle (Hesselbach's triangle)；0261 Femoral canal；0262 Femoral ring；0317 Aponeurosis of internal oblique；0318 Aponeurosis of transversus abdominis；0333 Pectineal (Cooper's) ligament；0334 Medial crus of superficial inguinal ring；0335 Lateral crus of superficial inguinal ring；0363 Phrenico-esophageal ligament；0364 Gastrosplenic ligament；0365 Splenorenal (lienorenal) ligament；0366 Phrenicocolic ligament；0380 Suspensory ligament of duodenum (ligament of Treitz)

**A10（16 項；腹膜、筋膜、間隙、管與孔、韌帶）**：0398 Coronary ligament of liver；0400 Right triangular ligament；0401 Left triangular ligament；0406 Calot's triangle (cystohepatic triangle)；0240 Semilunar line (linea semilunaris)；0241 Tendinous intersections；0242 Arcuate line；0243 External oblique aponeurosis；0245 Lacunar ligament；0246 Iliopectineal ligament；0247 Conjoint tendon；0249 Median arcuate ligament；0250 Medial arcuate ligament；0251 Lateral arcuate ligament；0253 Esophageal hiatus；0254 Vena caval hiatus

**A11（16 項；腹膜、筋膜、間隙、管與孔、韌帶、腹壁與後腹壁肌肉）**：0258 Spermatic cord；0367 Phrenicosplenic ligament；0368 Splenocolic ligament；0397 Ligamentum venosum；0229 Cremaster；0231 Psoas minor；0234 Iliopsoas；0236 Right crus of diaphragm；0237 Left crus of diaphragm；0238 Central tendon of diaphragm；0351 Lower esophageal sphincter；0357 Pyloric sphincter；0379 Sphincter of ampulla (sphincter of Oddi)；0443 Sternal part of diaphragm；0444 Costal part of diaphragm；0445 Lumbar part of diaphragm

### C 線：資訊卡批次

**C1（17 項）**：0175 Celiac nodes；0176 Superior mesenteric nodes；0177 Inferior mesenteric nodes；0178 Pre-aortic nodes；0179 Para-aortic nodes；0180 Lateral aortic nodes；0181 Lumbar nodes；0182 Common iliac nodes；0183 External iliac nodes；0184 Internal iliac nodes；0185 Superficial inguinal nodes；0456 Lateral lumbar nodes；0049 Peritoneal cavity；0050 Greater sac；0263 Superficial fascia of abdomen；0264 Camper's fascia；0265 Scarpa's fascia

**C2（17 項）**：0266 Deep fascia of abdomen；0267 Transversalis fascia；0269 Renal fascia；0270 Extraperitoneal fascia；0271 Internal spermatic fascia；0272 External spermatic fascia；0273 Cremasteric fascia；0274 Perirenal fat；0275 Pararenal fat；0320 Anterior wall of rectus sheath；0321 Posterior wall of rectus sheath；0381 Paraduodenal fossa；0389 Subphrenic recess；0390 Hepatorenal recess (Morison's pouch)；0428 Paracolic gutters；0433 Retroperitoneal space；0434 Preperitoneal (properitoneal) space

### B、D、E 線

- **B**：0032 Renal cortex；0033 Renal medulla；0034 Renal pyramid；0035 Renal column；0036 Renal papilla；0037 Minor calyx；0038 Major calyx；0039 Renal pelvis；0040 Renal sinus；0041 Hilum of kidney。
- **D**：0045 Suprarenal gland；0057 Mesentery；0087 Superior pancreaticoduodenal artery；0109 Gonadal artery；0135 Right gonadal vein；0136 Left gonadal vein；0259 Ductus deferens。
- **E（先查現況）**：0046 Peritoneum；0048 Visceral peritoneum。
- **E（待使用者決定）**：0285 Umbilicus；0299 Right hypochondriac region；0300 Epigastric region；0301 Left hypochondriac region；0302 Right lumbar region (flank)；0303 Umbilical region；0304 Left lumbar region (flank)；0305 Right inguinal region (groin)；0306 Hypogastric (pubic) region；0307 Left inguinal region (groin)；0308 Transpyloric plane (Addison's plane)；0309 Subcostal plane；0310 Transtubercular plane；0311 Transumbilical plane；0312 Interspinous plane；0396 Couinaud segments of liver。

批次內的項目以表內 id 為準；A 線各批的「在既有器官網格上標示區域」類項目不另做浮空模型。

## 優先級說明

- 高：臟器、腺體、腹主動脈／腹腔動脈幹／上、下腸繫膜動脈／下腔靜脈／門靜脈系統的血管；課程資料特別強調的新增項（肝門與肝葉、胰各部、十二指腸各部與乳突、結腸帶袋與脂垂等）。
- 中：腹腔外的其他動靜脈與淋巴、神經與自主神經叢、腹壁與後腹壁肌肉、腹膜構造、強調度中等的新增項。
- 低：骨性標記、筋膜、間隙、管與孔、韌帶、強調度低的新增項。
- 「有」與「跨區」的項目不排優先級（—）。優先級只用來排批次，不代表考試權重。

## 總表

| 類別 | 核對項 | 有 | 缺 | 名稱不同 | 部位不明 | 已決定 | 比照待確認 | 仍需決定 |
|---|---|---|---|---|---|---|---|---|
| 臟器 | 88 | 24 | 62 | 1 | 1 | 10 | 0 | 1 |
| 血管（動脈、靜脈、淋巴） | 137 | 81 | 55 | 1 | 0 | 11 | 1 | 0 |
| 腺體 | 9 | 1 | 7 | 1 | 0 | 1 | 0 | 0 |
| 神經分支（含自主神經叢與神經節） | 42 | 21 | 19 | 2 | 0 | 0 | 0 | 0 |
| 骨的細部（骨性標記） | 22 | 7 | 12 | 3 | 0 | 0 | 0 | 0 |
| 腹膜、筋膜、間隙、管與孔、韌帶 | 93 | 8 | 80 | 3 | 2 | 24 | 9 | 0 |
| 腹壁與後腹壁肌肉 | 22 | 9 | 13 | 0 | 0 | 0 | 0 | 0 |
| 體表分區與平面 | 15 | 0 | 15 | 0 | 0 | 0 | 0 | 15 |
| **合計** | **428** | **151** | **263** | **11** | **3** | **46** | **10** | **16** |

## 一、臟器

核對 88 項：有 24；缺 62；名稱不同 1；部位不明 1；已決定 10；比照待確認 0；仍需決定 1。

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
| RS-A-0032 | Renal cortex | 腎皮質 | 缺 | 已決定：冠狀切面腎（一個【需人工審核】PR） | 高 | 使用者決定：做一側冠狀切面腎，十個結構各自可點選、有資訊卡，與腎實體位置對齊 |
| RS-A-0033 | Renal medulla | 腎髓質 | 缺 | 已決定：冠狀切面腎（一個【需人工審核】PR） | 高 | 使用者決定：做一側冠狀切面腎，十個結構各自可點選、有資訊卡，與腎實體位置對齊 |
| RS-A-0034 | Renal pyramid | 腎錐體 | 缺 | 已決定：冠狀切面腎（一個【需人工審核】PR） | 高 | 使用者決定：做一側冠狀切面腎，十個結構各自可點選、有資訊卡，與腎實體位置對齊 |
| RS-A-0035 | Renal column | 腎柱 | 缺 | 已決定：冠狀切面腎（一個【需人工審核】PR） | 高 | 使用者決定：做一側冠狀切面腎，十個結構各自可點選、有資訊卡，與腎實體位置對齊 |
| RS-A-0036 | Renal papilla | 腎乳突 | 缺 | 已決定：冠狀切面腎（一個【需人工審核】PR） | 高 | 使用者決定：做一側冠狀切面腎，十個結構各自可點選、有資訊卡，與腎實體位置對齊 |
| RS-A-0037 | Minor calyx | 腎小盞 | 缺 | 已決定：冠狀切面腎（一個【需人工審核】PR） | 高 | 使用者決定：做一側冠狀切面腎，十個結構各自可點選、有資訊卡，與腎實體位置對齊 |
| RS-A-0038 | Major calyx | 腎大盞 | 缺 | 已決定：冠狀切面腎（一個【需人工審核】PR） | 高 | 使用者決定：做一側冠狀切面腎，十個結構各自可點選、有資訊卡，與腎實體位置對齊 |
| RS-A-0039 | Renal pelvis | 腎盂 | 缺 | 已決定：冠狀切面腎（一個【需人工審核】PR） | 高 | 使用者決定：做一側冠狀切面腎，十個結構各自可點選、有資訊卡，與腎實體位置對齊 |
| RS-A-0040 | Renal sinus | 腎竇 | 缺 | 已決定：冠狀切面腎（一個【需人工審核】PR） | 高 | 使用者決定：做一側冠狀切面腎，十個結構各自可點選、有資訊卡，與腎實體位置對齊 |
| RS-A-0041 | Hilum of kidney | 腎門 | 缺 | 已決定：冠狀切面腎（一個【需人工審核】PR） | 高 | 使用者決定：做一側冠狀切面腎，十個結構各自可點選、有資訊卡，與腎實體位置對齊 |
| RS-A-0352 | Cardia (cardial orifice) | 賁門 | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0354 | Body of stomach | 胃體 | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0355 | Pyloric antrum | 幽門竇 | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0356 | Pyloric canal | 幽門管 | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0372 | Superior part of duodenum (duodenal cap) | 十二指腸上部（十二指腸壺腹） | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0373 | Descending part of duodenum | 十二指腸降部 | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0374 | Inferior (horizontal) part of duodenum | 十二指腸下部（水平部） | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0375 | Ascending part of duodenum | 十二指腸升部 | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0376 | Major duodenal papilla | 大十二指腸乳突 | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；管道或開口：在既有膽囊管、總肝管、十二指腸網格上標示或補管狀示意，不另做浮空模型 |
| RS-A-0377 | Minor duodenal papilla | 小十二指腸乳突 | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；管道或開口：在既有膽囊管、總肝管、十二指腸網格上標示或補管狀示意，不另做浮空模型 |
| RS-A-0378 | Hepatopancreatic ampulla (ampulla of Vater) | 肝胰壺腹 | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；管道或開口：在既有膽囊管、總肝管、十二指腸網格上標示或補管狀示意，不另做浮空模型 |
| RS-A-0391 | Right lobe of liver | 肝右葉 | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0392 | Left lobe of liver | 肝左葉 | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0393 | Quadrate lobe of liver | 肝方形葉 | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0395 | Porta hepatis | 肝門 | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0399 | Bare area of liver | 肝裸區 | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0418 | Hilum of spleen (splenic hilum) | 脾門 | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0424 | Anal canal | 肛管 | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0426 | Haustra of colon | 結腸袋 | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0427 | Omental (epiploic) appendices | 腸脂垂 | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0349 | Abdominal esophagus | 食道腹部 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0353 | Cardial notch | 賁門切跡 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0358 | Angular incisure (angular notch) | 胃角切跡 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0362 | Esophagogastric junction (Z-line) | 食道胃交界（Z 線） | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；在既有食道、輸尿管網格上標示區域，不另做浮空模型 |
| RS-A-0386 | Ileocecal valve | 迴盲瓣 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0407 | Fundus of gallbladder | 膽囊底 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0408 | Body of gallbladder | 膽囊體 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0409 | Neck of gallbladder | 膽囊頸 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0446 | Ureteropelvic junction | 腎盂輸尿管連接部 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；在既有食道、輸尿管網格上標示區域，不另做浮空模型 |
| RS-A-0346 | Cervical constriction of esophagus | 食道頸部狹窄 | 缺 | 補建 | 低 | 【第二輪新增】課程資料權重低；在既有食道、輸尿管網格上標示區域，不另做浮空模型 |
| RS-A-0347 | Thoracic (broncho-aortic) constriction of esophagus | 食道胸部狹窄（支氣管主動脈狹窄） | 缺 | 補建 | 低 | 【第二輪新增】課程資料權重低；在既有食道、輸尿管網格上標示區域，不另做浮空模型 |
| RS-A-0348 | Diaphragmatic (esophagogastric) constriction of esophagus | 食道橫膈狹窄 | 缺 | 補建 | 低 | 【第二輪新增】課程資料權重低；在既有食道、輸尿管網格上標示區域，不另做浮空模型 |
| RS-A-0359 | Gastric canal | 胃管 | 缺 | 補建 | 低 | 【第二輪新增】課程資料權重低；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0387 | Diaphragmatic surface of liver | 肝橫膈面 | 缺 | 補建 | 低 | 【第二輪新增】課程資料權重低；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0388 | Visceral surface of liver | 肝臟面 | 缺 | 補建 | 低 | 【第二輪新增】課程資料權重低；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0419 | Gastric surface of spleen | 脾胃面 | 缺 | 補建 | 低 | 【第二輪新增】課程資料權重低；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0420 | Colic surface of spleen | 脾結腸面 | 缺 | 補建 | 低 | 【第二輪新增】課程資料權重低；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0421 | Renal surface of spleen | 脾腎面 | 缺 | 補建 | 低 | 【第二輪新增】課程資料權重低；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0343 | Ovary | 卵巢 | 缺 | 跨區：列入骨盆與會陰區核對 | — | 【第二輪新增】課程資料權重低；該區域的核對清單另列，不計入腹部建造批次 |
| RS-A-0447 | Ureterovesical junction (entrance to bladder) | 輸尿管膀胱連接部 | 缺 | 跨區：列入骨盆與會陰區核對 | — | 【第二輪新增】課程資料權重中；該區域的核對清單另列，不計入腹部建造批次 |
| RS-A-0396 | Couinaud segments of liver | 肝段（Couinaud 分段） | 部位不明 | 需使用者決定 | 低 | 【第二輪新增】課程資料權重低；站上有 Hepatovenous segment 網格，是否對應 Couinaud 分段，請使用者核對 |
| RS-A-0425 | Taeniae coli | 結腸帶 | 名稱不同 | 已有（別名或成員） | — | 【第二輪新增】課程資料權重高；以別名表（總稱對應站上成員）或中文名比對到 |
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
| RS-A-0340 | Testis | 睪丸 | 有 | 已有 | — | 【第二輪新增】課程資料權重中 |
| RS-A-0341 | Epididymis | 副睪 | 有 | 已有 | — | 【第二輪新增】課程資料權重低 |
| RS-A-0394 | Caudate lobe of liver | 肝尾葉 | 有 | 已有 | — | 【第二輪新增】課程資料權重高 |
| RS-A-0402 | Right hepatic duct | 右肝管 | 有 | 已有 | — | 【第二輪新增】課程資料權重中 |
| RS-A-0403 | Left hepatic duct | 左肝管 | 有 | 已有 | — | 【第二輪新增】課程資料權重中 |
| RS-A-0404 | Common hepatic duct | 總肝管 | 有 | 已有 | — | 【第二輪新增】課程資料權重高 |
| RS-A-0405 | Cystic duct | 膽囊管 | 有 | 已有 | — | 【第二輪新增】課程資料權重高 |

## 二、血管（動脈、靜脈、淋巴）

核對 137 項：有 81；缺 55；名稱不同 1；部位不明 0；已決定 11；比照待確認 1；仍需決定 0。

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
| RS-A-0175 | Celiac nodes | 腹腔淋巴結 | 缺 | 已決定：只做資訊卡 | 中 | 使用者決定：淋巴結群只做資訊卡；沿動脈旁區域標示列入考試後待辦 |
| RS-A-0176 | Superior mesenteric nodes | 上腸繫膜淋巴結 | 缺 | 已決定：只做資訊卡 | 中 | 使用者決定：淋巴結群只做資訊卡；沿動脈旁區域標示列入考試後待辦 |
| RS-A-0177 | Inferior mesenteric nodes | 下腸繫膜淋巴結 | 缺 | 已決定：只做資訊卡 | 中 | 使用者決定：淋巴結群只做資訊卡；沿動脈旁區域標示列入考試後待辦 |
| RS-A-0178 | Pre-aortic nodes | 主動脈前淋巴結 | 缺 | 已決定：只做資訊卡 | 中 | 使用者決定：淋巴結群只做資訊卡；沿動脈旁區域標示列入考試後待辦 |
| RS-A-0179 | Para-aortic nodes | 主動脈旁淋巴結 | 缺 | 已決定：只做資訊卡 | 中 | 使用者決定：淋巴結群只做資訊卡；沿動脈旁區域標示列入考試後待辦 |
| RS-A-0180 | Lateral aortic nodes | 左右側主動脈淋巴結 | 缺 | 已決定：只做資訊卡 | 中 | 使用者決定：淋巴結群只做資訊卡；沿動脈旁區域標示列入考試後待辦 |
| RS-A-0181 | Lumbar nodes | 腰淋巴結 | 缺 | 已決定：只做資訊卡 | 中 | 使用者決定：淋巴結群只做資訊卡；沿動脈旁區域標示列入考試後待辦 |
| RS-A-0182 | Common iliac nodes | 總髂淋巴結 | 缺 | 已決定：只做資訊卡 | 中 | 使用者決定：淋巴結群只做資訊卡；沿動脈旁區域標示列入考試後待辦 |
| RS-A-0183 | External iliac nodes | 外髂淋巴結 | 缺 | 已決定：只做資訊卡 | 中 | 使用者決定：淋巴結群只做資訊卡；沿動脈旁區域標示列入考試後待辦 |
| RS-A-0184 | Internal iliac nodes | 內髂淋巴結 | 缺 | 已決定：只做資訊卡 | 中 | 使用者決定：淋巴結群只做資訊卡；沿動脈旁區域標示列入考試後待辦 |
| RS-A-0185 | Superficial inguinal nodes | 淺腹股溝淋巴結 | 缺 | 已決定：只做資訊卡 | 中 | 使用者決定：淋巴結群只做資訊卡；沿動脈旁區域標示列入考試後待辦 |
| RS-A-0370 | Right gastro-omental vein | 右胃網膜靜脈 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；接在既有血管樹上 |
| RS-A-0429 | Middle rectal artery | 中直腸動脈 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；接在既有血管樹上 |
| RS-A-0430 | Inferior rectal artery | 下直腸動脈 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；接在既有血管樹上 |
| RS-A-0451 | Iliolumbar artery | 髂腰動脈 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；接在既有血管樹上 |
| RS-A-0369 | Esophageal branch of left inferior phrenic artery | 左下膈動脈食道支 | 缺 | 補建 | 低 | 【第二輪新增】課程資料權重低；接在既有血管樹上 |
| RS-A-0371 | Posterior gastric veins | 後胃靜脈 | 缺 | 補建 | 低 | 【第二輪新增】課程資料權重低；接在既有血管樹上 |
| RS-A-0452 | Lumbar azygos vein | 腰奇靜脈 | 缺 | 補建 | 低 | 【第二輪新增】課程資料權重低；接在既有血管樹上 |
| RS-A-0456 | Lateral lumbar nodes | 側腰淋巴結 | 缺 | 比照淋巴結群：只做資訊卡（待確認） | 低 | 【第二輪新增】課程資料權重低；建議比照使用者對淋巴結群的決定 |
| RS-A-0330 | Axillary nodes | 腋淋巴結 | 缺 | 跨區：列入胸腔區核對 | — | 【第二輪新增】課程資料權重低；該區域的核對清單另列，不計入腹部建造批次 |
| RS-A-0331 | Parasternal nodes | 胸骨旁淋巴結 | 缺 | 跨區：列入胸腔區核對 | — | 【第二輪新增】課程資料權重低；該區域的核對清單另列，不計入腹部建造批次 |
| RS-A-0339 | Artery to ductus deferens | 輸精管動脈 | 缺 | 跨區：列入骨盆與會陰區核對 | — | 【第二輪新增】課程資料權重中；該區域的核對清單另列，不計入腹部建造批次 |
| RS-A-0326 | Thoracic aorta | 胸主動脈 | 名稱不同 | 已有（別名或成員） | — | 【第二輪新增】課程資料權重低；以別名表（總稱對應站上成員）或中文名比對到 |
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
| RS-A-0325 | Posterior intercostal arteries | 後肋間動脈 | 有 | 已有 | — | 【第二輪新增】課程資料權重中 |
| RS-A-0327 | Internal thoracic artery | 內胸動脈 | 有 | 已有 | — | 【第二輪新增】課程資料權重中 |
| RS-A-0328 | Femoral artery | 股動脈 | 有 | 已有 | — | 【第二輪新增】課程資料權重中 |
| RS-A-0329 | Lateral thoracic vein | 外胸靜脈 | 有 | 已有 | — | 【第二輪新增】課程資料權重低 |
| RS-A-0431 | Internal pudendal artery | 內陰動脈 | 有 | 已有 | — | 【第二輪新增】課程資料權重低 |
| RS-A-0453 | Left hepatic vein | 左肝靜脈 | 有 | 已有 | — | 【第二輪新增】課程資料權重中 |
| RS-A-0454 | Middle (intermediate) hepatic vein | 中肝靜脈 | 有 | 已有 | — | 【第二輪新增】課程資料權重中 |
| RS-A-0455 | Right hepatic vein | 右肝靜脈 | 有 | 已有 | — | 【第二輪新增】課程資料權重中 |

## 三、腺體

核對 9 項：有 1；缺 7；名稱不同 1；部位不明 0；已決定 1；比照待確認 0；仍需決定 0。

| id | 英文名 | 中文名 | 站上現況 | 建議處理 | 優先級 | 備註 |
|---|---|---|---|---|---|---|
| RS-A-0410 | Head of pancreas | 胰頭 | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0411 | Uncinate process of pancreas | 胰鉤突 | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0413 | Body of pancreas | 胰體 | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0414 | Tail of pancreas | 胰尾 | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0415 | Main pancreatic duct | 主胰管 | 缺 | 補建 | 高 | 【第二輪新增】課程資料權重高；管道或開口：在既有膽囊管、總肝管、十二指腸網格上標示或補管狀示意，不另做浮空模型 |
| RS-A-0412 | Neck of pancreas | 胰頸 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；在既有器官網格上標示區域，不另做浮空模型 |
| RS-A-0416 | Accessory pancreatic duct | 副胰管 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；管道或開口：在既有膽囊管、總肝管、十二指腸網格上標示或補管狀示意，不另做浮空模型 |
| RS-A-0045 | Suprarenal gland | 腎上腺 | 名稱不同 | 已決定：顯示名用 Adrenal gland，加 Suprarenal 相關搜尋 | 高 | 使用者決定；只動名稱與搜尋，不動模型；站上為 Left／Right adrenal gland（英文名不同，中文「腎上腺」相同）；顯示名要用 Adrenal 或 Suprarenal 請使用者決定 |
| RS-A-0029 | Pancreas | 胰臟 | 有 | 已有 | — |  |

## 四、神經分支（含自主神經叢與神經節）

核對 42 項：有 21；缺 19；名稱不同 2；部位不明 0；已決定 0；比照待確認 0；仍需決定 0。

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
| RS-A-0332 | Thoraco-abdominal nerves | 胸腹神經 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；神經示意，依自主神經與腰神經叢既有做法 |
| RS-A-0459 | White ramus communicans | 白交通支 | 缺 | 補建 | 低 | 【第二輪新增】課程資料權重低；神經示意，依自主神經與腰神經叢既有做法 |
| RS-A-0457 | Thoracic splanchnic nerves | 胸內臟神經 | 名稱不同 | 已有（別名或成員） | — | 【第二輪新增】課程資料權重中；以別名表（總稱對應站上成員）或中文名比對到 |
| RS-A-0458 | Prevertebral (preaortic) ganglia | 椎前神經節 | 名稱不同 | 已有（別名或成員） | — | 【第二輪新增】課程資料權重中；以別名表（總稱對應站上成員）或中文名比對到 |
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
| RS-A-0345 | Esophageal plexus | 食道神經叢 | 有 | 已有 | — | 【第二輪新增】課程資料權重中；†比對來源為資訊卡資料表，有沒有獨立可點選網格無法確認 |

## 五、骨的細部（骨性標記）

核對 22 項：有 7；缺 12；名稱不同 3；部位不明 0；已決定 0；比照待確認 0；仍需決定 0。

| id | 英文名 | 中文名 | 站上現況 | 建議處理 | 優先級 | 備註 |
|---|---|---|---|---|---|---|
| RS-A-0277 | Anterior superior iliac spine | 前上髂棘 | 缺 | 補建 | 低 | 站上已有骨骼；骨面標示，不另做模型 |
| RS-A-0278 | Iliac fossa | 髂窩 | 缺 | 補建 | 低 | 站上已有骨骼；骨面標示，不另做模型 |
| RS-A-0280 | Pubic crest | 恥骨脊 | 缺 | 補建 | 低 | 站上已有骨骼；骨面標示，不另做模型 |
| RS-A-0281 | Pectineal line | 恥骨線 | 缺 | 補建 | 低 | 站上已有骨骼；骨面標示，不另做模型 |
| RS-A-0282 | Iliopubic eminence | 髂恥隆凸 | 缺 | 補建 | 低 | 站上已有骨骼；骨面標示，不另做模型 |
| RS-A-0284 | Costal margin | 肋弓 | 缺 | 補建 | 低 | 站上已有骨骼；骨面標示，不另做模型 |
| RS-A-0298 | Tubercle of iliac crest | 髂嵴結節 | 缺 | 補建 | 低 | 【第二輪新增】課程資料權重中；站上已有骨骼；骨面標示，不另做模型 |
| RS-A-0287 | Pelvic inlet | 骨盆入口 | 缺 | 跨區：列入骨盆與會陰區核對 | — | 【第二輪新增】課程資料權重中；該區域的核對清單另列，不計入腹部建造批次 |
| RS-A-0288 | Greater (false) pelvis | 大骨盆（假骨盆） | 缺 | 跨區：列入骨盆與會陰區核對 | — | 【第二輪新增】課程資料權重低；該區域的核對清單另列，不計入腹部建造批次 |
| RS-A-0289 | True pelvis | 真骨盆 | 缺 | 跨區：列入骨盆與會陰區核對 | — | 【第二輪新增】課程資料權重低；該區域的核對清單另列，不計入腹部建造批次 |
| RS-A-0297 | Jugular notch | 頸靜脈切跡 | 缺 | 跨區：列入胸腔區核對 | — | 【第二輪新增】課程資料權重低；該區域的核對清單另列，不計入腹部建造批次 |
| RS-A-0448 | Pelvic brim | 骨盆緣 | 缺 | 跨區：列入骨盆與會陰區核對 | — | 【第二輪新增】課程資料權重中；該區域的核對清單另列，不計入腹部建造批次 |
| RS-A-0292 | Lumbar vertebrae | 腰椎 | 名稱不同 | 已有（別名或成員） | — | 【第二輪新增】課程資料權重中；以別名表（總稱對應站上成員）或中文名比對到 |
| RS-A-0293 | Intervertebral discs | 椎間盤 | 名稱不同 | 已有（別名或成員） | — | 【第二輪新增】課程資料權重低；以別名表（總稱對應站上成員）或中文名比對到 |
| RS-A-0296 | Costal cartilages | 肋軟骨 | 名稱不同 | 已有（別名或成員） | — | 【第二輪新增】課程資料權重低；以別名表（總稱對應站上成員）或中文名比對到 |
| RS-A-0276 | Iliac crest | 髂脊 | 有 | 已有 | — | †比對來源為資訊卡資料表，有沒有獨立可點選網格無法確認 |
| RS-A-0279 | Pubic tubercle | 恥骨結節 | 有 | 已有 | — | †比對來源為資訊卡資料表，有沒有獨立可點選網格無法確認 |
| RS-A-0283 | Xiphoid process | 劍突 | 有 | 已有 | — |  |
| RS-A-0290 | Sacrum | 薦骨 | 有 | 已有 | — | 【第二輪新增】課程資料權重低 |
| RS-A-0291 | Pubic symphysis | 恥骨聯合 | 有 | 已有 | — | 【第二輪新增】課程資料權重中 |
| RS-A-0294 | Eleventh rib | 第 11 肋 | 有 | 已有 | — | 【第二輪新增】課程資料權重低 |
| RS-A-0295 | Twelfth rib | 第 12 肋 | 有 | 已有 | — | 【第二輪新增】課程資料權重中 |

## 六、腹膜、筋膜、間隙、管與孔、韌帶

核對 93 項：有 8；缺 80；名稱不同 3；部位不明 2；已決定 24；比照待確認 9；仍需決定 0。

| id | 英文名 | 中文名 | 站上現況 | 建議處理 | 優先級 | 備註 |
|---|---|---|---|---|---|---|
| RS-A-0047 | Parietal peritoneum | 壁層腹膜 | 缺 | 補建 | 中 |  |
| RS-A-0049 | Peritoneal cavity | 腹膜腔 | 缺 | 已決定：只做資訊卡 | 中 | 使用者決定：腹膜腔與大囊只做資訊卡，與小囊互相連結 |
| RS-A-0050 | Greater sac | 大囊 | 缺 | 已決定：只做資訊卡 | 中 | 使用者決定：腹膜腔與大囊只做資訊卡，與小囊互相連結 |
| RS-A-0051 | Lesser sac (omental bursa) | 小囊（網膜囊） | 缺 | 已決定：高亮既有邊界結構 | 中 | 使用者決定：特殊空間以高亮組成邊界的既有結構呈現，不另做模型 |
| RS-A-0052 | Omental foramen (epiploic foramen) | 網膜孔 | 缺 | 已決定：高亮既有邊界結構 | 中 | 使用者決定：特殊空間以高亮組成邊界的既有結構呈現，不另做模型 |
| RS-A-0053 | Greater omentum | 大網膜 | 缺 | 補建 | 中 |  |
| RS-A-0054 | Lesser omentum | 小網膜 | 缺 | 補建 | 中 |  |
| RS-A-0055 | Hepatogastric ligament | 肝胃韌帶 | 缺 | 補建 | 中 |  |
| RS-A-0056 | Hepatoduodenal ligament | 肝十二指腸韌帶 | 缺 | 補建 | 中 |  |
| RS-A-0058 | Root of mesentery | 腸繫膜根部 | 缺 | 補建 | 中 |  |
| RS-A-0060 | Sigmoid mesocolon | 乙狀結腸繫膜 | 缺 | 補建 | 中 |  |
| RS-A-0062 | Median umbilical fold | 正中臍襞 | 缺 | 補建 | 中 |  |
| RS-A-0063 | Medial umbilical fold | 內側臍襞 | 缺 | 補建 | 中 |  |
| RS-A-0064 | Lateral umbilical fold | 外側臍襞 | 缺 | 補建 | 中 |  |
| RS-A-0065 | Falciform ligament | 鐮狀韌帶 | 缺 | 補建 | 中 |  |
| RS-A-0066 | Round ligament of liver | 肝圓韌帶 | 缺 | 補建 | 中 |  |
| RS-A-0067 | Median umbilical ligament | 正中臍韌帶 | 缺 | 補建 | 中 |  |
| RS-A-0068 | Medial umbilical ligament | 內側臍韌帶 | 缺 | 補建 | 中 |  |
| RS-A-0255 | Inguinal canal | 腹股溝管 | 缺 | 已決定：高亮既有邊界結構 | 中 | 使用者決定：特殊空間以高亮組成邊界的既有結構呈現，不另做模型 |
| RS-A-0256 | Superficial inguinal ring | 淺腹股溝環 | 缺 | 已決定：高亮既有邊界結構 | 中 | 使用者決定：特殊空間以高亮組成邊界的既有結構呈現，不另做模型 |
| RS-A-0257 | Deep inguinal ring | 深腹股溝環 | 缺 | 已決定：高亮既有邊界結構 | 中 | 使用者決定：特殊空間以高亮組成邊界的既有結構呈現，不另做模型 |
| RS-A-0260 | Inguinal triangle (Hesselbach's triangle) | 腹股溝三角 | 缺 | 已決定：高亮既有邊界結構 | 中 | 使用者決定：特殊空間以高亮組成邊界的既有結構呈現，不另做模型 |
| RS-A-0261 | Femoral canal | 股管 | 缺 | 已決定：高亮既有邊界結構 | 中 | 使用者決定：特殊空間以高亮組成邊界的既有結構呈現，不另做模型 |
| RS-A-0262 | Femoral ring | 股環 | 缺 | 已決定：高亮既有邊界結構 | 中 | 使用者決定：特殊空間以高亮組成邊界的既有結構呈現，不另做模型 |
| RS-A-0317 | Aponeurosis of internal oblique | 腹內斜肌腱膜 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；帶狀、有厚度，兩端接在正確附著點 |
| RS-A-0318 | Aponeurosis of transversus abdominis | 腹橫肌腱膜 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；帶狀、有厚度，兩端接在正確附著點 |
| RS-A-0333 | Pectineal (Cooper's) ligament | 恥骨梳韌帶 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；帶狀、有厚度，兩端接在正確附著點 |
| RS-A-0334 | Medial crus of superficial inguinal ring | 淺腹股溝環內腳 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；帶狀、有厚度，兩端接在正確附著點 |
| RS-A-0335 | Lateral crus of superficial inguinal ring | 淺腹股溝環外腳 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；帶狀、有厚度，兩端接在正確附著點 |
| RS-A-0363 | Phrenico-esophageal ligament | 橫膈食道韌帶 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；帶狀、有厚度，兩端接在正確附著點 |
| RS-A-0364 | Gastrosplenic ligament | 胃脾韌帶 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重高；帶狀或褶狀，兩端接在正確附著點、貼合下方結構 |
| RS-A-0365 | Splenorenal (lienorenal) ligament | 脾腎韌帶 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重高；帶狀或褶狀，兩端接在正確附著點、貼合下方結構 |
| RS-A-0366 | Phrenicocolic ligament | 橫膈結腸韌帶 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；帶狀或褶狀，兩端接在正確附著點、貼合下方結構 |
| RS-A-0380 | Suspensory ligament of duodenum (ligament of Treitz) | 十二指腸懸韌帶（屈氏韌帶） | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重高；帶狀、有厚度，兩端接在正確附著點 |
| RS-A-0398 | Coronary ligament of liver | 肝冠狀韌帶 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重高；帶狀或褶狀，兩端接在正確附著點、貼合下方結構 |
| RS-A-0400 | Right triangular ligament | 右三角韌帶 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；帶狀或褶狀，兩端接在正確附著點、貼合下方結構 |
| RS-A-0401 | Left triangular ligament | 左三角韌帶 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；帶狀或褶狀，兩端接在正確附著點、貼合下方結構 |
| RS-A-0406 | Calot's triangle (cystohepatic triangle) | 膽囊三角（卡洛三角） | 缺 | 高亮邊界結構（比照小囊與腹股溝三角，待確認） | 中 | 【第二輪新增】課程資料權重高；邊界為肝下面、總肝管、膽囊管，內有膽囊動脈通過；依特殊空間規則高亮邊界結構 |
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
| RS-A-0258 | Spermatic cord | 精索 | 缺 | 補建 | 低 |  |
| RS-A-0263 | Superficial fascia of abdomen | 淺筋膜 | 缺 | 已決定：只做資訊卡 | 低 | 使用者決定：筋膜與腎周脂肪層只做資訊卡 |
| RS-A-0264 | Camper's fascia | 淺層脂肪層（Camper 氏筋膜） | 缺 | 已決定：只做資訊卡 | 低 | 使用者決定：筋膜與腎周脂肪層只做資訊卡 |
| RS-A-0265 | Scarpa's fascia | 深層膜性層（Scarpa 氏筋膜） | 缺 | 已決定：只做資訊卡 | 低 | 使用者決定：筋膜與腎周脂肪層只做資訊卡 |
| RS-A-0266 | Deep fascia of abdomen | 深筋膜 | 缺 | 已決定：只做資訊卡 | 低 | 使用者決定：筋膜與腎周脂肪層只做資訊卡 |
| RS-A-0267 | Transversalis fascia | 腹橫筋膜 | 缺 | 已決定：只做資訊卡 | 低 | 使用者決定：筋膜與腎周脂肪層只做資訊卡 |
| RS-A-0269 | Renal fascia | 腎筋膜 | 缺 | 已決定：只做資訊卡 | 低 | 使用者決定：筋膜與腎周脂肪層只做資訊卡 |
| RS-A-0270 | Extraperitoneal fascia | 腹膜外筋膜 | 缺 | 已決定：只做資訊卡 | 低 | 使用者決定：筋膜與腎周脂肪層只做資訊卡 |
| RS-A-0271 | Internal spermatic fascia | 內精筋膜 | 缺 | 已決定：只做資訊卡 | 低 | 使用者決定：筋膜與腎周脂肪層只做資訊卡 |
| RS-A-0272 | External spermatic fascia | 外精筋膜 | 缺 | 已決定：只做資訊卡 | 低 | 使用者決定：筋膜與腎周脂肪層只做資訊卡 |
| RS-A-0273 | Cremasteric fascia | 提睪肌筋膜 | 缺 | 已決定：只做資訊卡 | 低 | 使用者決定：筋膜與腎周脂肪層只做資訊卡 |
| RS-A-0274 | Perirenal fat | 腎圍脂肪層 | 缺 | 已決定：只做資訊卡 | 低 | 使用者決定：筋膜與腎周脂肪層只做資訊卡 |
| RS-A-0275 | Pararenal fat | 腎旁脂肪層 | 缺 | 已決定：只做資訊卡 | 低 | 使用者決定：筋膜與腎周脂肪層只做資訊卡 |
| RS-A-0320 | Anterior wall of rectus sheath | 腹直肌鞘前壁 | 缺 | 比照筋膜：只做資訊卡（待確認） | 低 | 【第二輪新增】課程資料權重低；建議比照使用者對筋膜的決定；腹直肌鞘可在腹壁肌肉卡片中說明各層組成 |
| RS-A-0321 | Posterior wall of rectus sheath | 腹直肌鞘後壁 | 缺 | 比照筋膜：只做資訊卡（待確認） | 低 | 【第二輪新增】課程資料權重低；建議比照使用者對筋膜的決定；腹直肌鞘可在腹壁肌肉卡片中說明各層組成 |
| RS-A-0367 | Phrenicosplenic ligament | 橫膈脾韌帶 | 缺 | 補建 | 低 | 【第二輪新增】課程資料權重低；帶狀或褶狀，兩端接在正確附著點、貼合下方結構 |
| RS-A-0368 | Splenocolic ligament | 脾結腸韌帶 | 缺 | 補建 | 低 | 【第二輪新增】課程資料權重低；帶狀或褶狀，兩端接在正確附著點、貼合下方結構 |
| RS-A-0381 | Paraduodenal fossa | 十二指腸旁窩 | 缺 | 比照腹膜腔：只做資訊卡（待確認） | 低 | 【第二輪新增】課程資料權重低；腹膜腔類空間，建議比照使用者對腹膜腔與大囊的決定 |
| RS-A-0389 | Subphrenic recess | 膈下隱窩 | 缺 | 比照腹膜腔：只做資訊卡（待確認） | 低 | 【第二輪新增】課程資料權重中；腹膜腔類空間，建議比照使用者對腹膜腔與大囊的決定 |
| RS-A-0390 | Hepatorenal recess (Morison's pouch) | 肝腎隱窩 | 缺 | 比照腹膜腔：只做資訊卡（待確認） | 低 | 【第二輪新增】課程資料權重中；腹膜腔類空間，建議比照使用者對腹膜腔與大囊的決定 |
| RS-A-0397 | Ligamentum venosum | 靜脈韌帶 | 缺 | 補建 | 低 | 【第二輪新增】課程資料權重低；帶狀、有厚度，兩端接在正確附著點 |
| RS-A-0428 | Paracolic gutters | 結腸旁溝 | 缺 | 比照腹膜腔：只做資訊卡（待確認） | 低 | 【第二輪新增】課程資料權重中；腹膜腔類空間，建議比照使用者對腹膜腔與大囊的決定 |
| RS-A-0433 | Retroperitoneal space | 腹膜後腔 | 缺 | 比照腹膜腔：只做資訊卡（待確認） | 低 | 【第二輪新增】課程資料權重中；腹膜腔類空間，建議比照使用者對腹膜腔與大囊的決定 |
| RS-A-0434 | Preperitoneal (properitoneal) space | 腹膜前腔 | 缺 | 比照腹膜腔：只做資訊卡（待確認） | 低 | 【第二輪新增】課程資料權重低；腹膜腔類空間，建議比照使用者對腹膜腔與大囊的決定 |
| RS-A-0322 | Dartos fascia | 肉膜 | 缺 | 跨區：列入骨盆與會陰區核對 | — | 【第二輪新增】課程資料權重低；該區域的核對清單另列，不計入腹部建造批次 |
| RS-A-0323 | Colles' fascia (superficial perineal fascia) | 淺會陰筋膜（科利斯氏筋膜） | 缺 | 跨區：列入骨盆與會陰區核對 | — | 【第二輪新增】課程資料權重低；該區域的核對清單另列，不計入腹部建造批次 |
| RS-A-0324 | Fascia lata | 闊筋膜 | 缺 | 跨區：列入四肢區核對 | — | 【第二輪新增】課程資料權重低；該區域的核對清單另列，不計入腹部建造批次 |
| RS-A-0338 | Tunica vaginalis | 睪丸鞘膜 | 缺 | 跨區：列入骨盆與會陰區核對 | — | 【第二輪新增】課程資料權重中；該區域的核對清單另列，不計入腹部建造批次 |
| RS-A-0342 | Round ligament of uterus | 子宮圓韌帶 | 缺 | 跨區：列入骨盆與會陰區核對 | — | 【第二輪新增】課程資料權重高；該區域的核對清單另列，不計入腹部建造批次 |
| RS-A-0344 | Ligament of ovary | 卵巢韌帶 | 缺 | 跨區：列入骨盆與會陰區核對 | — | 【第二輪新增】課程資料權重低；該區域的核對清單另列，不計入腹部建造批次 |
| RS-A-0046 | Peritoneum | 腹膜 | 部位不明 | 已決定：先查現況，不先建 | 中 | 使用者決定：先確認站上有沒有可點選網格再決定；站上有同名概念群組（含 region of peritoneum 等），無法確認有沒有可點選網格 |
| RS-A-0048 | Visceral peritoneum | 臟層腹膜 | 部位不明 | 已決定：先查現況，不先建 | 中 | 使用者決定：先確認站上有沒有可點選網格再決定；站上有同名概念群組，無法確認有沒有可點選網格 |
| RS-A-0057 | Mesentery | 小腸繫膜 | 名稱不同 | 相關搜尋 | 中 | 站上為 Mesentery of small intestine（以中文名比對到） |
| RS-A-0259 | Ductus deferens | 輸精管 | 名稱不同 | 相關搜尋 | 低 | 以中文名「輸精管」比對到站上結構，英文名未核實 |
| RS-A-0432 | Mesocolon | 結腸繫膜 | 名稱不同 | 已有（別名或成員） | — | 【第二輪新增】課程資料權重中；以別名表（總稱對應站上成員）或中文名比對到 |
| RS-A-0059 | Transverse mesocolon | 橫結腸繫膜 | 有 | 已有 | — |  |
| RS-A-0061 | Mesoappendix | 闌尾繫膜 | 有 | 已有 | — |  |
| RS-A-0239 | Linea alba | 白線 | 有 | 已有 | — |  |
| RS-A-0244 | Inguinal ligament | 腹股溝韌帶 | 有 | 已有 | — |  |
| RS-A-0248 | Iliolumbar ligament | 髂腰韌帶 | 有 | 已有 | — |  |
| RS-A-0252 | Aortic hiatus | 主動脈裂孔 | 有 | 已有 | — | †比對來源為資訊卡資料表，有沒有獨立可點選網格無法確認 |
| RS-A-0268 | Thoracolumbar fascia | 胸腰筋膜 | 有 | 已有 | — | †比對來源為資訊卡資料表，有沒有獨立可點選網格無法確認 |
| RS-A-0319 | Rectus sheath | 腹直肌鞘 | 有 | 已有 | — | 【第二輪新增】課程資料權重中；†比對來源為資訊卡資料表，有沒有獨立可點選網格無法確認 |

## 七、腹壁與後腹壁肌肉

核對 22 項：有 9；缺 13；名稱不同 0；部位不明 0；已決定 0；比照待確認 0；仍需決定 0。

| id | 英文名 | 中文名 | 站上現況 | 建議處理 | 優先級 | 備註 |
|---|---|---|---|---|---|---|
| RS-A-0229 | Cremaster | 提睪肌 | 缺 | 補建 | 中 |  |
| RS-A-0231 | Psoas minor | 腰小肌 | 缺 | 補建 | 中 |  |
| RS-A-0234 | Iliopsoas | 髂腰肌 | 缺 | 補建 | 中 |  |
| RS-A-0236 | Right crus of diaphragm | 橫膈右腳 | 缺 | 補建 | 中 |  |
| RS-A-0237 | Left crus of diaphragm | 橫膈左腳 | 缺 | 補建 | 中 |  |
| RS-A-0238 | Central tendon of diaphragm | 橫膈中央肌腱 | 缺 | 補建 | 中 |  |
| RS-A-0351 | Lower esophageal sphincter | 下食道括約肌 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；在既有網格上標示環狀增厚區，不另做浮空模型 |
| RS-A-0357 | Pyloric sphincter | 幽門括約肌 | 缺 | 補建 | 中 | 【第二輪新增】課程資料權重中；在既有網格上標示環狀增厚區，不另做浮空模型 |
| RS-A-0379 | Sphincter of ampulla (sphincter of Oddi) | 肝胰壺腹括約肌 | 缺 | 補建 | 低 | 【第二輪新增】課程資料權重低；在既有網格上標示環狀增厚區，不另做浮空模型 |
| RS-A-0443 | Sternal part of diaphragm | 橫膈胸骨部 | 缺 | 補建 | 低 | 【第二輪新增】課程資料權重低；在既有橫膈網格上標示區域 |
| RS-A-0444 | Costal part of diaphragm | 橫膈肋骨部 | 缺 | 補建 | 低 | 【第二輪新增】課程資料權重低；在既有橫膈網格上標示區域 |
| RS-A-0445 | Lumbar part of diaphragm | 橫膈腰部 | 缺 | 補建 | 低 | 【第二輪新增】課程資料權重低；在既有橫膈網格上標示區域 |
| RS-A-0350 | Cricopharyngeus (upper esophageal sphincter) | 環咽肌（上食道括約肌） | 缺 | 跨區：列入頭頸區核對 | — | 【第二輪新增】課程資料權重低；該區域的核對清單另列，不計入腹部建造批次 |
| RS-A-0225 | Rectus abdominis | 腹直肌 | 有 | 已有 | — |  |
| RS-A-0226 | External oblique | 腹外斜肌 | 有 | 已有 | — |  |
| RS-A-0227 | Internal oblique | 腹內斜肌 | 有 | 已有 | — |  |
| RS-A-0228 | Transversus abdominis | 腹橫肌 | 有 | 已有 | — |  |
| RS-A-0230 | Psoas major | 腰大肌 | 有 | 已有 | — |  |
| RS-A-0232 | Iliacus | 髂肌 | 有 | 已有 | — |  |
| RS-A-0233 | Quadratus lumborum | 腰方肌 | 有 | 已有 | — |  |
| RS-A-0235 | Diaphragm | 橫膈 | 有 | 已有 | — |  |
| RS-A-0316 | Pyramidalis | 錐狀肌 | 有 | 已有 | — | 【第二輪新增】課程資料權重中 |

## 八、體表分區與平面

核對 15 項：有 0；缺 15；名稱不同 0；部位不明 0；已決定 0；比照待確認 0；仍需決定 15。

| id | 英文名 | 中文名 | 站上現況 | 建議處理 | 優先級 | 備註 |
|---|---|---|---|---|---|---|
| RS-A-0299 | Right hypochondriac region | 右季肋區 | 缺 | 需使用者決定（體表分區／平面覆蓋層） | 中 | 【第二輪新增】課程資料權重高；九分區與各平面是體表劃分，沒有實體；建議做貼在體表的半透明分區與平面線，或只做資訊卡 |
| RS-A-0300 | Epigastric region | 上腹部（心窩區） | 缺 | 需使用者決定（體表分區／平面覆蓋層） | 中 | 【第二輪新增】課程資料權重高；九分區與各平面是體表劃分，沒有實體；建議做貼在體表的半透明分區與平面線，或只做資訊卡 |
| RS-A-0301 | Left hypochondriac region | 左季肋區 | 缺 | 需使用者決定（體表分區／平面覆蓋層） | 中 | 【第二輪新增】課程資料權重高；九分區與各平面是體表劃分，沒有實體；建議做貼在體表的半透明分區與平面線，或只做資訊卡 |
| RS-A-0302 | Right lumbar region (flank) | 右腰區 | 缺 | 需使用者決定（體表分區／平面覆蓋層） | 中 | 【第二輪新增】課程資料權重高；九分區與各平面是體表劃分，沒有實體；建議做貼在體表的半透明分區與平面線，或只做資訊卡 |
| RS-A-0303 | Umbilical region | 臍區 | 缺 | 需使用者決定（體表分區／平面覆蓋層） | 中 | 【第二輪新增】課程資料權重高；九分區與各平面是體表劃分，沒有實體；建議做貼在體表的半透明分區與平面線，或只做資訊卡 |
| RS-A-0304 | Left lumbar region (flank) | 左腰區 | 缺 | 需使用者決定（體表分區／平面覆蓋層） | 中 | 【第二輪新增】課程資料權重高；九分區與各平面是體表劃分，沒有實體；建議做貼在體表的半透明分區與平面線，或只做資訊卡 |
| RS-A-0305 | Right inguinal region (groin) | 右腹股溝區 | 缺 | 需使用者決定（體表分區／平面覆蓋層） | 中 | 【第二輪新增】課程資料權重高；九分區與各平面是體表劃分，沒有實體；建議做貼在體表的半透明分區與平面線，或只做資訊卡 |
| RS-A-0306 | Hypogastric (pubic) region | 下腹部（恥骨上區） | 缺 | 需使用者決定（體表分區／平面覆蓋層） | 中 | 【第二輪新增】課程資料權重高；九分區與各平面是體表劃分，沒有實體；建議做貼在體表的半透明分區與平面線，或只做資訊卡 |
| RS-A-0307 | Left inguinal region (groin) | 左腹股溝區 | 缺 | 需使用者決定（體表分區／平面覆蓋層） | 中 | 【第二輪新增】課程資料權重高；九分區與各平面是體表劃分，沒有實體；建議做貼在體表的半透明分區與平面線，或只做資訊卡 |
| RS-A-0308 | Transpyloric plane (Addison's plane) | 幽門平面 | 缺 | 需使用者決定（體表分區／平面覆蓋層） | 中 | 【第二輪新增】課程資料權重高；九分區與各平面是體表劃分，沒有實體；建議做貼在體表的半透明分區與平面線，或只做資訊卡 |
| RS-A-0285 | Umbilicus | 臍 | 缺 | 需使用者決定（體表分區／平面覆蓋層） | 低 | 【第二輪新增】課程資料權重中；九分區與各平面是體表劃分，沒有實體；建議做貼在體表的半透明分區與平面線，或只做資訊卡 |
| RS-A-0309 | Subcostal plane | 肋下平面 | 缺 | 需使用者決定（體表分區／平面覆蓋層） | 低 | 【第二輪新增】課程資料權重中；九分區與各平面是體表劃分，沒有實體；建議做貼在體表的半透明分區與平面線，或只做資訊卡 |
| RS-A-0310 | Transtubercular plane | 結節間平面 | 缺 | 需使用者決定（體表分區／平面覆蓋層） | 低 | 【第二輪新增】課程資料權重中；九分區與各平面是體表劃分，沒有實體；建議做貼在體表的半透明分區與平面線，或只做資訊卡 |
| RS-A-0311 | Transumbilical plane | 臍平面 | 缺 | 需使用者決定（體表分區／平面覆蓋層） | 低 | 【第二輪新增】課程資料權重低；九分區與各平面是體表劃分，沒有實體；建議做貼在體表的半透明分區與平面線，或只做資訊卡 |
| RS-A-0312 | Interspinous plane | 棘間平面 | 缺 | 需使用者決定（體表分區／平面覆蓋層） | 低 | 【第二輪新增】課程資料權重低；九分區與各平面是體表劃分，沒有實體；建議做貼在體表的半透明分區與平面線，或只做資訊卡 |

## 不要求 3D 的項目（細胞、組織、胚胎遺跡與參考線）

留在清單裡並寫明原因，避免之後又被加回來；不計入核對項。

- RS-A-0026 Hepatic sinusoid｜肝竇隙（cell or tissue level, not a gross structure）
- RS-A-0027 Central vein of liver lobule｜中央靜脈（cell or tissue level, not a gross structure）
- RS-A-0028 Hepatic plate｜肝板（cell or tissue level, not a gross structure）
- RS-A-0042 Nephron｜腎元（cell or tissue level, not a gross structure）
- RS-A-0210 Submucosal plexus (Meissner's plexus)｜黏膜下層神經叢（cell or tissue level, not a gross structure）
- RS-A-0211 Myenteric plexus (Auerbach's plexus)｜肌間神經叢（cell or tissue level, not a gross structure）
- RS-A-0286 Inferior thoracic aperture｜胸廓下口（boundary description of the abdomen, not a separate structure）
- RS-A-0313 Midclavicular line｜鎖骨中線（reference line on the body surface, not a structure）
- RS-A-0314 Median (mid-sagittal) plane｜正中矢狀面（reference plane, not a structure）
- RS-A-0315 Midinguinal point｜腹股溝中點（surface reference point, not a structure）
- RS-A-0336 Processus vaginalis｜鞘狀突（embryonic structure; its remnant is the tunica vaginalis）
- RS-A-0337 Gubernaculum｜引帶（embryonic structure）
- RS-A-0360 Gastric rugae｜胃皺襞（lumen mucosal fold, card level）
- RS-A-0361 Muscular layers of stomach (oblique, circular, longitudinal)｜胃肌層（斜、環、縱）（wall layers, tissue level）
- RS-A-0382 Plicae circulares｜環狀皺襞（lumen mucosal fold, card level）
- RS-A-0383 Vasa recta｜直血管（small terminal vessels in the mesentery; descriptive comparison feature）
- RS-A-0384 Arterial arcades｜動脈弓（descriptive comparison feature of jejunum and ileum）
- RS-A-0385 Peyer's patches｜培氏斑（lymphoid tissue in the mucosa, tissue level）
- RS-A-0417 Pancreatic islets (islets of Langerhans)｜胰島（蘭氏小島）（cell or tissue level, not a gross structure）
- RS-A-0422 Hepatic lobule｜肝小葉（cell or tissue level, not a gross structure）
- RS-A-0423 Bile canaliculi｜膽小管（cell or tissue level, not a gross structure）
- RS-A-0435 Mesothelium of peritoneum｜腹膜間皮（cell or tissue level, not a gross structure）
- RS-A-0436 Peritoneal fluid｜腹膜液（fluid, not a structure）
- RS-A-0437 Urachus｜臍尿管（embryonic structure; its remnant is the median umbilical ligament）
- RS-A-0438 Umbilical artery (distal part)｜臍動脈遠端部（embryonic structure; its remnant is the medial umbilical ligament）
- RS-A-0439 Umbilical vein｜臍靜脈（embryonic structure; its remnant is the round ligament of liver）
- RS-A-0440 Ductus venosus｜靜脈導管（embryonic structure; its remnant is the ligamentum venosum）
- RS-A-0441 Dorsal mesentery (dorsal mesogastrium)｜背側腸繫膜（embryonic structure）
- RS-A-0442 Ventral mesentery (ventral mesogastrium)｜腹側腸繫膜（embryonic structure）
- RS-A-0449 Adrenal cortex｜腎上腺皮質（internal zone, card level）
- RS-A-0450 Adrenal medulla｜腎上腺髓質（internal zone, card level）
- RS-A-0460 Enteric nervous system｜腸神經系統（functional system made of the two intramural plexuses, tissue level）
- RS-A-0461 Portal-systemic anastomoses｜門體吻合（concept; its member veins are listed separately）

## 已有決定覆蓋的項目（避免重複計算）

依 `docs/exam2-owner-decisions.md` 與 `docs/exam2-owner-decisions-open.md`（使用者 2026-11-15 的決定）。下表的「已決定」項目已從「仍需使用者決定」扣除；「比照待確認」是本輪新增、性質與已決定項目相同的結構，建議套用同一個決定，請使用者確認。

| 決定 | 已決定的項目 | 比照待確認的新增項目 |
|---|---|---|
| 腎內部構造：一個冠狀切面腎，十個結構各自可點選 | 10：腎皮質、腎髓質、腎錐體、腎柱、腎乳突、腎小盞、腎大盞、腎盂、腎竇、腎門 | 腎盂輸尿管連接部（在輸尿管上標示，可與腎一起做） |
| 淋巴結群只做資訊卡（沿動脈旁標示列入考試後待辦） | 11：腹腔、上／下腸繫膜、主動脈前、主動脈旁、左右側主動脈、腰、總／外／內髂、淺腹股溝淋巴結 | 側腰淋巴結（腹部）；腋與胸骨旁淋巴結（胸腔，跨區） |
| 筋膜與腎周脂肪層只做資訊卡 | 12：淺筋膜、Camper 氏、Scarpa 氏、深筋膜、腹橫筋膜、腎筋膜、腹膜外筋膜、內／外精筋膜、提睪肌筋膜、腎圍與腎旁脂肪層 | 腹直肌鞘與前後壁（3）；肉膜、科利斯氏筋膜、闊筋膜（跨區） |
| 腹膜腔與大囊只做資訊卡 | 2：腹膜腔、大囊 | 膈下隱窩、肝腎隱窩、十二指腸旁窩、結腸旁溝、腹膜後腔、腹膜前腔（6） |
| 特殊空間：高亮既有邊界結構 | 8：小囊、網膜孔、腹股溝管、深／淺腹股溝環、腹股溝三角、股管、股環 | 膽囊三角（1；邊界為肝下面、總肝管、膽囊管） |
| 腹膜與臟層腹膜：先查現況，不先建 | 2：腹膜、臟層腹膜 | — |
| 腎上腺顯示名用 Adrenal，加 Suprarenal 相關搜尋 | 1：腎上腺 | 腎上腺皮質、髓質（不要求 3D，見上節） |
| **合計** | **46** | **10**（另跨區 5 項） |

另：決定表中的胸管頸段（序號 22）屬頭頸區，不在本檔。

## 仍需使用者決定的項目

| id | 英文名 | 中文名 | 問題 | 建議 |
|---|---|---|---|---|
| RS-A-0285 | Umbilicus | 臍 | 體表分區與平面沒有實體，要不要做、怎麼做 | 貼在體表的半透明九分區與平面線（不另做立體模型），或只做資訊卡；幽門平面通過的構造可與既有結構連結 |
| RS-A-0299 | Right hypochondriac region | 右季肋區 | 體表分區與平面沒有實體，要不要做、怎麼做 | 貼在體表的半透明九分區與平面線（不另做立體模型），或只做資訊卡；幽門平面通過的構造可與既有結構連結 |
| RS-A-0300 | Epigastric region | 上腹部（心窩區） | 體表分區與平面沒有實體，要不要做、怎麼做 | 貼在體表的半透明九分區與平面線（不另做立體模型），或只做資訊卡；幽門平面通過的構造可與既有結構連結 |
| RS-A-0301 | Left hypochondriac region | 左季肋區 | 體表分區與平面沒有實體，要不要做、怎麼做 | 貼在體表的半透明九分區與平面線（不另做立體模型），或只做資訊卡；幽門平面通過的構造可與既有結構連結 |
| RS-A-0302 | Right lumbar region (flank) | 右腰區 | 體表分區與平面沒有實體，要不要做、怎麼做 | 貼在體表的半透明九分區與平面線（不另做立體模型），或只做資訊卡；幽門平面通過的構造可與既有結構連結 |
| RS-A-0303 | Umbilical region | 臍區 | 體表分區與平面沒有實體，要不要做、怎麼做 | 貼在體表的半透明九分區與平面線（不另做立體模型），或只做資訊卡；幽門平面通過的構造可與既有結構連結 |
| RS-A-0304 | Left lumbar region (flank) | 左腰區 | 體表分區與平面沒有實體，要不要做、怎麼做 | 貼在體表的半透明九分區與平面線（不另做立體模型），或只做資訊卡；幽門平面通過的構造可與既有結構連結 |
| RS-A-0305 | Right inguinal region (groin) | 右腹股溝區 | 體表分區與平面沒有實體，要不要做、怎麼做 | 貼在體表的半透明九分區與平面線（不另做立體模型），或只做資訊卡；幽門平面通過的構造可與既有結構連結 |
| RS-A-0306 | Hypogastric (pubic) region | 下腹部（恥骨上區） | 體表分區與平面沒有實體，要不要做、怎麼做 | 貼在體表的半透明九分區與平面線（不另做立體模型），或只做資訊卡；幽門平面通過的構造可與既有結構連結 |
| RS-A-0307 | Left inguinal region (groin) | 左腹股溝區 | 體表分區與平面沒有實體，要不要做、怎麼做 | 貼在體表的半透明九分區與平面線（不另做立體模型），或只做資訊卡；幽門平面通過的構造可與既有結構連結 |
| RS-A-0308 | Transpyloric plane (Addison's plane) | 幽門平面 | 體表分區與平面沒有實體，要不要做、怎麼做 | 貼在體表的半透明九分區與平面線（不另做立體模型），或只做資訊卡；幽門平面通過的構造可與既有結構連結 |
| RS-A-0309 | Subcostal plane | 肋下平面 | 體表分區與平面沒有實體，要不要做、怎麼做 | 貼在體表的半透明九分區與平面線（不另做立體模型），或只做資訊卡；幽門平面通過的構造可與既有結構連結 |
| RS-A-0310 | Transtubercular plane | 結節間平面 | 體表分區與平面沒有實體，要不要做、怎麼做 | 貼在體表的半透明九分區與平面線（不另做立體模型），或只做資訊卡；幽門平面通過的構造可與既有結構連結 |
| RS-A-0311 | Transumbilical plane | 臍平面 | 體表分區與平面沒有實體，要不要做、怎麼做 | 貼在體表的半透明九分區與平面線（不另做立體模型），或只做資訊卡；幽門平面通過的構造可與既有結構連結 |
| RS-A-0312 | Interspinous plane | 棘間平面 | 體表分區與平面沒有實體，要不要做、怎麼做 | 貼在體表的半透明九分區與平面線（不另做立體模型），或只做資訊卡；幽門平面通過的構造可與既有結構連結 |
| RS-A-0396 | Couinaud segments of liver | 肝段（Couinaud 分段） | 站上有 Hepatovenous segment 網格，是否就是 Couinaud 分段 | 確認後以別名連結；若對應，狀態改為有 |

## 跨區項目（另區核對，不計入腹部建造批次）

課程資料在腹部章節中提到、但屬於其他區域的結構。已放進清單是為了不漏，建造與核對由該區處理。標示「缺」者請在該區的核對清單中確認，不在本區重複排批。

| id | 英文名 | 中文名 | 區域 | 站上現況 |
|---|---|---|---|---|
| RS-A-0287 | Pelvic inlet | 骨盆入口 | 骨盆與會陰 | 缺 |
| RS-A-0288 | Greater (false) pelvis | 大骨盆（假骨盆） | 骨盆與會陰 | 缺 |
| RS-A-0289 | True pelvis | 真骨盆 | 骨盆與會陰 | 缺 |
| RS-A-0290 | Sacrum | 薦骨 | 背部 | 有 |
| RS-A-0291 | Pubic symphysis | 恥骨聯合 | 骨盆與會陰 | 有 |
| RS-A-0292 | Lumbar vertebrae | 腰椎 | 背部 | 名稱不同 |
| RS-A-0293 | Intervertebral discs | 椎間盤 | 背部 | 名稱不同 |
| RS-A-0294 | Eleventh rib | 第 11 肋 | 胸腔 | 有 |
| RS-A-0295 | Twelfth rib | 第 12 肋 | 胸腔 | 有 |
| RS-A-0296 | Costal cartilages | 肋軟骨 | 胸腔 | 名稱不同 |
| RS-A-0297 | Jugular notch | 頸靜脈切跡 | 胸腔 | 缺 |
| RS-A-0322 | Dartos fascia | 肉膜 | 骨盆與會陰 | 缺 |
| RS-A-0323 | Colles' fascia (superficial perineal fascia) | 淺會陰筋膜（科利斯氏筋膜） | 骨盆與會陰 | 缺 |
| RS-A-0324 | Fascia lata | 闊筋膜 | 四肢 | 缺 |
| RS-A-0325 | Posterior intercostal arteries | 後肋間動脈 | 胸腔 | 有 |
| RS-A-0326 | Thoracic aorta | 胸主動脈 | 胸腔 | 名稱不同 |
| RS-A-0327 | Internal thoracic artery | 內胸動脈 | 胸腔 | 有 |
| RS-A-0328 | Femoral artery | 股動脈 | 四肢 | 有 |
| RS-A-0329 | Lateral thoracic vein | 外胸靜脈 | 胸腔 | 有 |
| RS-A-0330 | Axillary nodes | 腋淋巴結 | 胸腔 | 缺 |
| RS-A-0331 | Parasternal nodes | 胸骨旁淋巴結 | 胸腔 | 缺 |
| RS-A-0338 | Tunica vaginalis | 睪丸鞘膜 | 骨盆與會陰 | 缺 |
| RS-A-0339 | Artery to ductus deferens | 輸精管動脈 | 骨盆與會陰 | 缺 |
| RS-A-0340 | Testis | 睪丸 | 骨盆與會陰 | 有 |
| RS-A-0341 | Epididymis | 副睪 | 骨盆與會陰 | 有 |
| RS-A-0342 | Round ligament of uterus | 子宮圓韌帶 | 骨盆與會陰 | 缺 |
| RS-A-0343 | Ovary | 卵巢 | 骨盆與會陰 | 缺 |
| RS-A-0344 | Ligament of ovary | 卵巢韌帶 | 骨盆與會陰 | 缺 |
| RS-A-0350 | Cricopharyngeus (upper esophageal sphincter) | 環咽肌（上食道括約肌） | 頭頸 | 缺 |
| RS-A-0431 | Internal pudendal artery | 內陰動脈 | 骨盆與會陰 | 有 |
| RS-A-0447 | Ureterovesical junction (entrance to bladder) | 輸尿管膀胱連接部 | 骨盆與會陰 | 缺 |
| RS-A-0448 | Pelvic brim | 骨盆緣 | 骨盆與會陰 | 缺 |

資料中提到、但沒有放進清單的其他區結構（只供該區核對時參考）：右／左頸靜脈幹、右／左鎖骨下幹、右／左支氣管縱膈幹、左鎖骨下靜脈、坐骨神經、隱神經、股骨小轉子、恥骨肌、縫匠肌、股四頭肌、閉孔外肌、股薄肌、大腿內收肌群、陰囊、陰莖、外胸壁的皮節。

## 名稱衝突與異常

處理原則（使用者的規則）：(1) 異體字或拼法差異：選台灣常見寫法當顯示名，其餘列為別名；(2) 筆誤或 OCR 錯字：改為正確名稱；(3) 實際是不同結構：不合併，交由使用者決定；另列資料彼此不一致處。這一節只列建議，**沒有改任何網站名稱**；改名與別名另開純資料 PR（D 線）。

### 一、異體字或拼法（統一為台灣常見寫法，其餘列別名）

| 序 | 寫法 | 狀況 | 建議 |
|---|---|---|---|
| 1 | 鼠蹊／腹股溝 | 淺鼠蹊環、淺鼠蹊淋巴結 與 腹股溝韌帶、腹股溝管 混用（同一份資料內） | 統一用「腹股溝」，加別名「鼠蹊」 |
| 2 | 臍褶／臍摺／臍襞 | 正中、內側、外側臍襞，三份資料寫法不一；清單用「臍襞」 | 顯示「臍襞」，加別名「臍褶」「臍摺」 |
| 3 | 腸繫膜／腸間膜 | 含上腸繫膜神經節寫成「上腸間膜神經節」；清單用「繫膜」 | 顯示「繫膜」，加別名「間膜」「腸系膜」 |
| 4 | 髂嵴／髂脊 | 資料絕大多數寫「髂嵴」，清單 RS-A-0276 寫「髂脊」 | 顯示「髂嵴」，加別名「髂脊」（動名稱要另開 PR） |
| 5 | 恥骨嵴／恥骨脊 | 資料寫「恥骨嵴」，清單 RS-A-0280 寫「恥骨脊」 | 顯示「恥骨嵴」，加別名「恥骨脊」 |
| 6 | 恥骨線／恥骨梳（Pecten pubis） | 同一條骨脊；清單 RS-A-0281 用「恥骨線」 | 保留「恥骨線」，加別名「恥骨梳」（與恥骨梳韌帶是不同結構，見下節） |
| 7 | 腎乳突／腎乳頭 | 資料與清單 RS-A-0036 用「腎乳突」；台灣常見為「腎乳頭」 | 顯示「腎乳頭」，加別名「腎乳突」；若使用者要維持清單寫法，請告訴我 |
| 8 | 胃本體／胃體 | 資料寫「胃本體」 | 顯示「胃體」，加別名「胃本體」 |
| 9 | 胃褶／胃皺襞 | 資料寫「胃褶」 | 顯示「胃皺襞」，加別名「胃褶」 |
| 10 | 胃脾韌帶／脾胃韌帶 | 同一份資料內兩種順序 | 顯示「胃脾韌帶」，加別名「脾胃韌帶」 |
| 11 | 脾腎韌帶／腎脾韌帶（lienorenal） | 資料寫「脾腎韌帶」，英文括號 lienorenal | 顯示「脾腎韌帶」，加英文別名 lienorenal ligament |
| 12 | 結腸右曲／右結腸彎曲／肝曲；結腸左曲／左大腸彎／脾曲 | 清單 RS-A-0015 寫「右結腸彎曲」，RS-A-0017 寫「左大腸彎」，兩者用詞不一致；資料用「結腸右曲、結腸左曲」 | 兩者統一為「結腸右曲」「結腸左曲」，加別名「右結腸彎曲」「左大腸彎」「肝曲」「脾曲」 |
| 13 | 腔隙韌帶／陷窩韌帶 | 資料兩種寫法；清單 RS-A-0245 用「腔隙韌帶」 | 保留「腔隙韌帶」，加別名「陷窩韌帶」 |
| 14 | 聯合肌腱／腹股鐮 | 同一結構（Conjoint tendon = inguinal aponeurotic falx） | 保留「聯合肌腱」，加別名「腹股鐮」「腹股溝鐮」 |
| 15 | 腹股溝三角／海氏三角（Hesselbach） | 同一結構 | 保留「腹股溝三角」，加別名「海氏三角」 |
| 16 | 下腔靜脈裂孔／腔靜脈裂孔／靜脈孔 | 資料 2 寫「下腔靜脈裂孔」，資料 3 寫「靜脈孔」，清單 RS-A-0254 寫「腔靜脈裂孔」 | 保留清單寫法，加別名「下腔靜脈裂孔」「靜脈孔」「腔靜脈孔」 |
| 17 | 主動脈腎神經節（Aorticorenal／Aortorenal） | 英文拼法兩種 | 顯示 Aorticorenal ganglion，加別名 Aortorenal ganglion |
| 18 | 腸繫膜／小腸繫膜 | 資料只寫「腸繫膜」，清單 RS-A-0057 寫「小腸繫膜」（站上為 Mesentery of small intestine） | 保留，加別名「腸繫膜」 |
| 19 | 總膽管／膽管／膽總管 | 清單 RS-A-0024 中文只寫「膽管」；資料多數寫「總膽管」 | 顯示「總膽管」，加別名「膽管」「膽總管」（Common bile duct 已在英文名括號內） |
| 20 | 肝門三體／肝門三合體 | 資料兩種寫法（三體較多） | 保留現有「肝門三體」，加別名「肝門三合體」 |
| 21 | 結腸旁溝／大腸側窩（Paracolic gutters） | 資料寫「大腸側窩」 | 顯示「結腸旁溝」，加別名「大腸側窩」 |
| 22 | 肝臟面／臟面／臟層面（visceral surface） | 「臟層面」容易與「臟層腹膜」混淆 | 顯示「臟面」，加別名「肝臟面」「臟層面」 |
| 23 | 腎旁脂肪／腎周脂肪（Pararenal／Paranephric／Perirenal fat） | 清單 RS-A-0274 寫「腎圍脂肪層」，資料另用 Paranephric fat | 顯示「腎周脂肪」「腎旁脂肪」，加別名「腎圍脂肪」、Paranephric fat |
| 24 | 網膜孔／Winslow 孔／epiploic foramen | 同一結構 | 保留「網膜孔」，加別名「Winslow 孔」 |
| 25 | 半月線／Spigelian line／linea semilunaris | 同一結構（半月線疝＝Spigelian hernia） | 保留「半月線」，加別名 Spigelian line |
| 26 | Camper 氏筋膜／淺層脂肪層；Scarpa 氏筋膜／深層膜性層／膜狀層 | 清單已有雙名；資料另寫「膜狀層」Deep membranous layer | 保留，加別名「膜狀層」「淺層脂肪層」英文名 |
| 27 | 肝圓韌帶／Ligamentum teres | 資料強調一定要寫「of liver」以區別子宮圓韌帶 | 顯示「肝圓韌帶」，別名 Ligamentum teres hepatis；與子宮圓韌帶不可混用「圓韌帶」 |
| 28 | 十二指腸懸韌帶／屈氏韌帶（Treitz） | 同一結構 | 顯示「十二指腸懸韌帶」，加別名「屈氏韌帶」 |
| 29 | 內側臍韌帶／臍韌帶 | 同一結構（臍動脈遠端遺跡） | 顯示「內側臍韌帶」，加別名「臍韌帶」 |
| 30 | 肝竇隙／肝竇狀隙 | 不要求 3D 項，只記寫法 | 保留「肝竇隙」，加別名「肝竇狀隙」 |
| 31 | 心包膜膈動脈／心包膈動脈 | 清單 RS-A-0126 寫「心包膜膈動脈」 | 顯示「心包膈動脈」，加別名「心包膜膈動脈」 |

### 二、筆誤或 OCR 錯字（改為正確名稱）

| 序 | 寫法 | 狀況 | 建議 |
|---|---|---|---|
| T1 | 腹臍靜脈 | 應為「臍旁靜脈」（Paraumbilical vein，清單 RS-A-0155） | 更正為「臍旁靜脈」；不加別名 |
| T2 | 小十二乳突 | 漏字，應為「小十二指腸乳突」（資料 2 的另一處寫完整） | 更正；中文名用「小十二指腸乳突」 |
| T3 | 迴盲腸開口 | 應為「迴盲口」（Ileocecal ostium）；與迴盲瓣、迴盲部的關係見下節 | 更正為「迴盲口」並交使用者確認 |

檢查過：三份腹部資料的「膈／隔」用法一致（橫膈、膈下隱窩、橫膈食道韌帶都寫「膈」；「隔」只出現在一般詞如分隔、隔離）；沒有「顎／腭」「頷／頜」，也沒有「睾／睪」混用（只寫「睪」）。所以這一類在腹部沒有需要統一的項目。

### 三、實際是不同結構（不合併，交使用者決定）

| 序 | 名稱 | 狀況 | 建議 |
|---|---|---|---|
| D1 | 十二指腸壺腹（duodenal cap／ampulla）與肝胰壺腹（ampulla of Vater） | 兩者都簡稱「壺腹」，但前者是十二指腸上部的起始段，後者是總膽管與主胰管會合的膨大處 | 不合併；顯示名分別用「十二指腸壺腹」「肝胰壺腹」，搜尋「壺腹」時兩者都列出 |
| D2 | 肛門（Anus，清單 RS-A-0021）與肛管（Anal canal） | 資料 2 的消化道總覽用「肛管」，資料 3 的門體吻合表用「肛門」；站上只找到外肛門括約肌 | 不合併；兩個都補（肛管為管道、肛門為開口），請使用者確認 |
| D3 | 恥骨梳韌帶（Cooper 韌帶）與髂恥韌帶（Iliopectineal ligament，清單 RS-A-0246） | 清單原本有後者；資料 1 講的是前者，兩者在標準解剖是不同構造 | 不合併；請使用者確認課程要的是哪一個（可能兩個都要） |
| D4 | 迴盲部（Ileocecal junction，RS-A-0011）、迴盲瓣（Ileocecal valve）、迴盲口（Ileocecal ostium） | 分別是交界區、瓣膜、開口，資料 2 都提到 | 不合併；站上已有「迴盲部」，瓣膜另補（新增項 RS-A-0386），迴盲口只作別名候選 |
| D5 | 腎筋膜（RS-A-0269）與腹膜外筋膜（RS-A-0270） | 資料 3 把兩者寫成同一結構（又稱），資料 1 把腹膜外筋膜寫成腹橫筋膜與壁層腹膜之間的一整層（較廣） | 維持分列；兩張資訊卡互相說明關係；請使用者確認 |
| D6 | 提睪肌（Cremaster，肌肉）與提睪肌筋膜（Cremasteric fascia） | 資料 1 把兩者並寫成「提睪肌和其筋膜」 | 不合併（已分別在清單 RS-A-0229、RS-A-0273）；筋膜已決定只做資訊卡 |
| D7 | 胸腹神經（Thoraco-abdominal nerves）與肋間神經（RS-A-0224） | 資料 1 把 T7–T11 肋間神經離開肋間後的前支稱為胸腹神經，同一組神經在不同位置的名稱 | 不合併；胸腹神經另補，資訊卡說明與肋間神經的關係 |
| D8 | 總肝管、肝管、總膽管、膽管 | 資料 2 有一處寫「膽管（或肝管）」，其他處分別用總肝管、總膽管；是膽道的不同段落 | 不合併；顯示名分別為「左／右肝管」「總肝管」「膽囊管」「總膽管」 |
| D9 | 橫膈腳與淺腹股溝環的「內腳、外腳」 | 兩者都用 crus／內外腳，但是不同結構 | 顯示名完整寫「淺腹股溝環內腳」「橫膈右腳」，避免只寫「腳」 |

### 四、資料彼此不一致，或與清單不一致

| 序 | 項目 | 狀況 | 建議 |
|---|---|---|---|
| C1 | 十二指腸升部高度 | 資料 2 內文寫在 L3，同份的整理表寫上升到 L2 | 位置請使用者核對；資訊卡不寫具體椎體高度，或兩者並列 |
| C2 | 十二指腸上部（壺腹）長度 | 資料 2 內文約 5 公分，整理表寫最初約 2 公分（上部 3–5 公分） | 請使用者核對；資訊卡只寫「上部起始的膨大段」 |
| C3 | 後胃動脈（與後胃靜脈）出現率 | 資料 2 寫約 60%，資料 3 寫約 30–60%；後胃靜脈也是 30–60% | 資訊卡寫「不是每個人都有」，不寫百分比 |
| C4 | 食道穿過橫膈的高度 | 資料 2 與 3 的裂孔表寫食道裂孔在 T10；資料 2 的食道橫膈狹窄與賁門、Z 線寫 T11 | 兩個高度對象不同（裂孔 vs 狹窄／賁門），資訊卡分開寫，請使用者核對 |
| C5 | 腎筋膜與腹膜外筋膜 | 見上節（資料 1 與 3 說法不同） | 同上節 |
| C6 | 肋下動脈的歸屬 | 資料 1、3 都說肋下動脈來自胸主動脈，不是腹主動脈的分支；清單 RS-A-0115 目前把它放在腹主動脈分支主題 | 清單主題標籤改為腹壁（只動清單標籤，不動模型）；請使用者確認 |
| C7 | 膽管命名層級 | 資料 2 同一小節內，肝門三體寫成「膽管（或肝管）」，別處寫「總膽管」 | 以總膽管為準，見名稱衝突 |

名稱衝突與異常合計 50 項（異體字或拼法 31、筆誤 3、不同結構 9、資料不一致 7）。

## 檢查接線

- `docs/required-structures/abdomen.json`：新增 `RS-A-0285`…`RS-A-0461`（177 筆，只有名稱、中文名、類型、主題）；新欄位 `weight`（課程資料的強調度 high／mid／low）、`source`（wall／gut／post：三份資料的先後）、`order`（本輪新增項依授課順序的序號）、`region`（所屬區域）。第一輪的 284 筆沒有改。
- `docs/required-structures/aliases-abdomen.json`：新增 6 筆 `member` 別名。
- `docs/required-structures/known-gaps-abdomen.json`：145 → 265 項（本輪一次性放寬，見上）。
- `node scripts/check-required-abdomen.mjs`（已在 `npm run check` 內）通過；補上新結構後執行 `--write` 把已補上的項目移除。
