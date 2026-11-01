# 全身血管、神經、肌腱、韌帶稽核（2026-11-01）

> 只報告與量測，沒有改任何模型。解剖位置的最後核對由使用者進行：下面的「預期位置」是一般教科書對走向的描述，依 Gray's Anatomy 1918 年版插圖與 OpenStax Anatomy and Physiology 核對位置，**請使用者核對**；本報告不宣稱已對照任何書確認正確。
> 日期：2026-11-01；量測資料為 `fix/fibular-artery`（#184）分支的正式 build（與 main 的差別只有該 PR 改名的四個網格與退役的六個示意部件）。下肢的詳細量測見 `docs/lower-limb-audit-2026-11-01.md`（#177），這份報告是把同樣的方法擴到全身，並加上肌腱與韌帶。

## 0. 怎麼查

- **資料**：與檢視器相同的資料集（`scripts/lib/full-atlas.mjs`：主圖譜加臉部、補充、女性、漿膜、血管末端、跑考六個串流，已套用 `app/anatomy-source-overrides.json`），加上周邊神經串流（`nerve-stream.json`，267 個網格）。共 2,607 個項目：真實血管 1,047、示意血管 86、血管末端片 872、神經 314、示意神經 83、示意肌腱 94、切分肌腱 98 段、韌帶／膜 31、示意韌帶／支持帶／腱鞘 80。
- **腳本**（本 PR 新增，只讀不寫模型）：
  - `node scripts/audit-body-structures.mjs`：每個項目量 (1) 名稱與位置帶：名稱含 tibial、femoral、radial、carotid 等關鍵字時，重心高度必須落在對應的骨性區間（例如 tibial／fibular 在膝以下 y 20–580 mm，femoral 在 y 300–1080 mm，上肢名稱 |x| 不可小於 120 mm 等）；(2) 左右：名稱有 Left／Right 時重心 x 的正負（右側 x 為負）；(3) 碎裂：焊接頂點後算連通分量，≥30 個頂點的分量彼此包圍盒距離 > 12 mm 視為「斷成幾段」；(4) 穿骨：每個項目最多取樣 1,500 個頂點，找 6 mm 內最近的骨骼頂點，落在骨表面法線內側超過 1.5 mm 算「在骨內」（骨骼只取真正的骨，不含牙齦、軟骨與來源誤標為骨骼的肌肉）；(5) 韌帶／肌腱若沒有任何頂點在骨 6 mm 內算「浮空」。結果寫到 `work/body-structure-audit.json`。
  - `node scripts/audit-cut-tendons.mjs`：98 段切分肌腱（上下肢、左右）在骨內的比例、最深、兩端到最近骨面的距離。
- **畫面**：正式 build，骨骼＋動脈＋靜脈＋神經（肌肉與結締組織關掉），全身 29 個視角加 6 個點選放大視角，在 `pr-screenshots` 分支 `body-audit-2026-11-01/`（commit `ce02b33`）：
  `https://raw.githubusercontent.com/Kuan21/MJ_anatomy/ce02b33022ad0a6abd55ae37520d49ca69848396/body-audit-2026-11-01/<檔名>.png`
  （`body-front/back/left`、`head-neck-front/left`、`neck-right-front`、`shoulder-right-front`、`arm-right-front/back`、`elbow-right-front`、`forearm-right-front`、`hand-right-palm/dorsum`、`thorax-front/back`、`abdomen-front`、`pelvis-front/back`、`thigh-right-front/back/medial`、`knee-right-front/back`、`leg-right-front/back/lateral`、`ankle-right-medial`、`foot-right-dorsum/plantar`、`spot-*`。）
- 門檻以外的數字都在 JSON 裡，表格只列會影響判斷的。

## 1. 結論

1. **名稱與位置不符的網格，全身只剩下肢的幾個**：全身 1,047 條真實血管與 314 條神經跑過名稱–位置帶與左右檢查，左右沒有任何四肢血管或神經放錯邊（唯一被標出的是心臟、肝、腦的名稱，那些 Left／Right 指的是心室或肝葉，不是身體左右）。位置帶不符的只有：`FJ2184`／`FJ2194`「左／右腓靜脈」其實是腳跟下的兩小段（新發現，第 2A 節）、`FJ2190`「左腓靜脈」在大腿（#177 的 2C）、隱神經的「小腿內側皮支」在大腿（2B）。上肢、頭頸、胸腹沒有找到這類錯標。
2. **「爛掉」的觀感來源**，全身與下肢一致：(a) 末端示意片與補接管在主幹上形成短刺與截平的分支口（全身 872 片末端、683 條補接管、366 條樣條橋）；(b) 靜脈有直角轉折（膝靜脈、掌靜脈弓等，第 4 節）；(c) 來源網格本身就是斷開的幾段（門靜脈、肝動脈節段支、結腸邊緣動脈、手背掌背動脈群等，第 2C 節）。
3. **穿骨**：真實血管穿骨最嚴重的是肩胛上動／靜脈（40–60% 的頂點在肩胛骨裡）、橈側副動脈（肱骨 22–24%）、旋肩胛動脈（23%）；示意血管以胸肩峰動脈鎖骨支（鎖骨 41–48%）、內踝前動脈（脛骨 29–33%）、旋股內側動脈（22%）最嚴重；神經以下頜舌骨肌神經（下頜骨 37–51%）與示意的頸脊神經背支（椎骨 5–20%）最明顯；肌腱以肱三頭肌腱（尺骨鷹嘴 12–26%）最明顯；示意韌帶以距腓前韌帶（腓骨 17–35%）、結節間腱鞘（肱骨 29–30%）最明顯（第 3 節）。
4. **肌腱兩端都接到骨**：98 段切分肌腱兩端到最近骨面都在 8 mm 內（第 3D 節）；示意肌腱、韌帶沒有浮空的（浮空的只有喉部韌帶與乳房懸韌帶，它們本來就接軟骨或皮膚，不是問題）。

## 2. 名稱、位置與碎裂

### 2A　「左／右腓靜脈」`FJ2184`／`FJ2194` 其實在腳跟（新發現）

| 網格 | 名稱 | 位置（mm） | 頂點 | 段數 | 在骨內 |
| --- | --- | --- | ---: | ---: | --- |
| FJ2187 / FJ2200 | Left / Right fibular vein | y 32–344，沿腓骨後內側（正常） | 1,260 / 1,264 | 1 | 0% |
| **FJ2184 / FJ2194** | Left / Right fibular vein | **y 44–52，x ±39–77，z −60–−41：跟骨下方** | 196 / 213 | 2（相距 21 mm） | 跟骨 22–23% |
| FJ2190 | Left fibular vein | y 618–796：大腿（#177 的 2C） | 147 | 4（相距 65 mm） | 0% |

- 每側有三個叫「腓靜脈」的來源網格，只有 FJ2187／FJ2200 是腓靜脈。FJ2184／FJ2194 是跟骨下方兩小段、部分埋在跟骨裡的靜脈片，不可能是腓靜脈；依位置看像足底或跟骨的小靜脈，但只憑幾何無法確定名稱。
- 建議：**由你決定**——(a) 排除（加進 `app/anatomy-source-overrides.json` 的 `exclude`），或 (b) 改名為可核對的名稱。報告不自行猜名稱。

### 2B　隱神經的「小腿內側皮支」在大腿

- `Medial crural cutaneous branches of saphenous nerve`（左右，周邊神經串流）y 761–862 mm，在股骨中段內側前方（z 32–53），而「crural」指小腿，這些皮支應該在膝以下沿小腿內側分布。可能是來源（Z-Anatomy）名稱錯（實際是股神經前皮支的一部分），或登錄位置錯。**請你核對**；若要改名，候選是「Anterior cutaneous branches of femoral nerve」的一部分（該名稱已另有網格）。
- 其他位置帶標出但屬正常的：橈神經、前臂內側皮神經延伸到上臂（走向本來如此）；小隱靜脈延伸到膝（正常）；足部的「穿動脈」「穿靜脈群」（`FJ2058`／`FJ2064`、`FJ2100`／`FJ2119`／`FJ2138`／`FJ2174`）是足部的穿支，名稱與位置相符，**左右都有**（#177 的 2E 說只在左腳是錯的，更正）。

### 2C　來源網格本身斷成幾段（看起來像爛掉）

只列相距 > 40 mm 或段數多的；「組」（Set of…、intercostal、lumbar、spinal ganglion 等依定義就是多段的）不列。

| 網格 | 段數 | 最大相距 (mm) | 說明 |
| --- | ---: | ---: | --- |
| Right portal vein `FJ1913` | 10 | 56 | 肝內門靜脈分支是分開的節段 |
| Left portal vein `FJ1893` | 3 | 42 | 同上 |
| Right lobe branch of right hepatic artery `FJ1924`／`FJ2394` | 5 | 46 | 同上 |
| Posterior superior segmental branch of right portal vein `FJ3113` | 6 | 42 | 同上 |
| Marginal artery of colon `FJ3534`／`FJ2025` | 5 | 109 | 結腸邊緣動脈只畫了幾段 |
| Set of dorsal metacarpal arteries `FJ2347`／`FJ2348` | 5 | 42 | 手背四條掌背動脈互不相連，正常 |
| Lumbar artery／vein `FJ3632`／`FJ3636`／`FJ3635` | 4 | 46–68 | 各腰節段一條，正常 |
| Superior phrenic vein `FJ3653` | 3 | 64 | |
| Muscular branches of ulnar nerve（左右） | 2 | 50 | 兩條肌支 |
| Dorsal digital branches of superficial fibular nerve（左右） | 7 | 43 | 各趾一條，正常 |
| 示意：Right／Left perforating branch of deep femoral artery `PK-65`／`PK-92` | 3 | 53 | 三條穿動脈，設計如此 |
| 示意：dorsal ramus of thoracic spinal nerve `PK-126`／`PK-128` | 10 | 50–71 | 各節一條，設計如此 |

- 肝與結腸的斷段是來源模型的畫法，不是本站弄壞的；要不要補接由你決定（補接會是示意模型，需人工審核）。

## 3. 穿骨（頂點在骨表面內側 > 1.5 mm 的比例；只列 ≥ 10%，完整清單在 JSON）

### 3A　真實血管

| 血管 | 在骨內 | 最深 (mm) | 骨 |
| --- | ---: | ---: | --- |
| Left / Right suprascapular vein `FJ2250`／`FJ2302` | 59.5% / 55.4% | 4.4 / 5.5 | 肩胛骨 48–50%、鎖骨 6–11% |
| Left / Right suprascapular artery `FJ2251`／`FJ2303` | 45.8% / 44.3% | 4.5 / 4.2 | 肩胛骨 40–41% |
| Medial branch of pontine artery（左右）`FJ1689M`／`FJ1689` | 41.4% / 38.6% | 3.9 / 3.5 | 蝶骨（腦幹前方貼著斜坡） |
| Left lateral sacral vein `FJ3526` | 27.2% | 5.5 | 薦骨（薦孔處，模型沒有孔，可接受） |
| Radial collateral branch of deep brachial artery（右／左）`FJ2262`／`FJ2261` | 24.2% / 21.7% | 5.6 / 4.5 | 肱骨 |
| Right / Left circumflex scapular artery `FJ2273`／`FJ2221` | 22.7% / 22.5% | 3.0 / 2.9 | 肩胛骨 |
| 大腦皮質動脈（角回支、頂葉前動脈、中央後溝動脈等）`FJ1673`、`FJ1667M`、`FJ1666M`… | 9–17% | ≤ 5.8 | 頂骨（腦血管略微嵌進顱骨內板） |
| Left inferior phrenic artery `FJ3519` | 15.1% | 3.6 | 左第十肋 |
| Left / Right dorsalis pedis artery `FJ2073`／`FJ2055` | 14.8% / 10.6% | 3.4 / 2.6 | 脛骨下端 |
| Left internal iliac artery `FJ3468`、Right internal iliac vein `FJ3571` | 13.8% / 11.5% | 3.8 / 3.2 | 薦骨 |
| Right subclavian artery `FJ3579`、Left axillary artery `FJ2216`、Right internal thoracic vein `FJ1993` | 13.2% / 9.7% / 12.6% | 4.1 / 4.9 / 4.9 | 鎖骨 |
| Left / Right superior intercostal vein `FJ1986`／`FJ1991` | 13.4% / 10.9% | 3.6 / 3.3 | 第二、三肋 |
| Right radial recurrent artery `FJ2295`、Middle collateral branch of deep brachial artery（左右） | 10.1% / 10% / 9.1% | 5.3 / 2.6 / 2.7 | 肱骨 |

- 肩胛上動／靜脈：應該經肩胛上切跡（動脈在上橫韌帶上方、神經在下方）進入棘上窩，貼著骨面走；現在一半的頂點在肩胛骨裡，是來源登錄位置偏差。可用與下肢神經相同的「推出骨外」步驟（`scripts/lib/nerve-bone-clearance.mjs`）處理，需人工審核。
- 腦血管與蝶骨／頂骨、薦孔與椎間孔的穿骨，多半是骨骼網格沒有孔洞或腦血管緊貼顱骨內板造成，建議不動。

### 3B　示意血管（跑考串流）

| 示意血管 | 在骨內 | 最深 (mm) | 骨 |
| --- | ---: | ---: | --- |
| Clavicular branch of thoraco-acromial artery（右／左）`PK-2`／`PK-7` | 47.7% / 41.4% | 3.3 / 3.8 | 鎖骨 |
| Anterior medial malleolar artery（右／左）`PK-75`／`PK-102` | 32.5% / 29.1% | 3.5 / 3.8 | 脛骨 |
| Medial circumflex femoral artery（左／右）`PK-93`／`PK-66` | 22.2% / 21.6% | 5.8 / 5.7 | 髖骨 15–16%、股骨 7% |
| Left superior gluteal artery `PK-106` | 21.5% | 5.6 | 髖骨 16%、薦骨 5% |
| Left arteria radialis indicis `PKC-319` | 20.7% | 3.1 | 第二掌骨 |
| Anterior lateral malleolar artery（左／右）`PK-101`／`PK-74` | 18.9% / 11.2% | 5.9 / 5.6 | 腓骨、脛骨 |
| Saphenous branch of descending genicular artery（右／左）`PK-73`／`PK-100` | 15.2% / 7.3% | 3.5 / 4.6 | 股骨 |
| Posterior interosseous artery（右／左）`PK-43`／`PK-53` | 14.8% / 10.5% | 5.7 / 5.3 | 尺骨 |
| Right circumflex fibular artery `PK-77` | 13.6% | 5.9 | 腓骨 |
| Right posterior circumflex humeral vein `PK-42` | 12.6% | 5.2 | 肱骨 |
| Posterior intercostal veins（右／左）`PK-119`／`PK-122`、Right supreme intercostal artery `PK-120` | 11.7% / 11.3% / 10.2% | ≤ 3.9 | 肋骨 |

- 這些是我們自己建的示意管，路徑點穿過骨；修正方式是把路徑點移到骨面外（同樣需人工審核）。

### 3C　神經

| 神經 | 在骨內 | 最深 (mm) | 骨 | 判斷 |
| --- | ---: | ---: | --- | --- |
| Nerve to mylohyoid（左／右） | 51.1% / 37.3% | 5.9 / 5.6 | 下頜骨 | 應貼下頜骨內面的下頜舌骨肌溝，不應在骨內：**要修** |
| 顱神經（VIII 69%、IX 44–45%、V 20–34%、IV 13–23%、X 20%、XI 12–16%、XII 13%、視神經 11%）與篩前／篩後神經（15–25%） | — | ≤ 6 | 枕骨、蝶骨、顳骨、額骨 | 穿顱底孔道處，骨骼網格沒有孔：**不動** |
| Inferior alveolar nerve（右／左） | 27.9% / 19.8% | 5.5 / 6.0 | 下頜骨 | 走在下頜管內，正常 |
| Spinal ganglion（右／左）、Posterior root of posterior femoral cutaneous nerve | 11–15% | ≤ 5.9 | 椎骨、薦骨 | 椎間孔、薦孔處，可接受 |
| Palmar branch of ulnar nerve（左）、Anterior interosseous nerve（左）、Common palmar digital branches of median nerve（左右） | 10.6–11.1% | 3.6–6.0 | 尺骨、橈骨、第三掌骨與近節指骨 | 來源登錄偏差，建議推出骨外 |
| 示意：C1–C8 脊神經與背支 `PK-251`…`PK-282` | 5–20% | ≤ 5.5 | 頸椎 | 示意路徑穿過椎體而不是椎間孔：**要修** |
| 示意：Posterior vagal trunk `PK-34` | 10% | 5.3 | T8–T9 椎體與椎間盤 | 應在食道後面、椎體前方：**要修** |
| 示意：splanchnic nerves `PK-15`～`PK-17`、Right inferior gluteal nerve `PK-84` | 5.7–6.8% | ≤ 3.4 | 胸椎、肋骨、薦骨 | 輕微 |

- 下肢神經（隱神經、腓腸、腓深、足底、臀上等）在 #165 的推出步驟後都在 5% 以下，沒有再列。

### 3D　肌腱

切分肌腱 98 段（`scripts/audit-cut-tendons.mjs`，左右都量）：

| 肌腱 | 在骨內 | 最深 (mm) | 骨 | 兩端到骨 (mm) |
| --- | ---: | ---: | --- | --- |
| 肱三頭肌腱 長頭（左／右） | 26.3% / 23.2% | 5.0 / 5.3 | 尺骨（鷹嘴） | 2.6/13.2、3.1/10.2 |
| 肱三頭肌腱 外側頭、內側頭（左右） | 12.2–15.3% | 3.4–5.7 | 尺骨 | ≤ 10.3 |
| 伸拇長肌腱（左／右） | 8.1% / 5.4% | 2.5 / 2.1 | 大趾遠節與近節趾骨 | ≤ 6.8 |
| 股內側肌腱（左） | 6.3% | 2.1 | 股骨 | 8.6/3.4 |
| 伸小指肌腱（右）、橈側伸腕短肌腱（右）、屈指淺肌腱（左右）、尺側伸腕肌腱（左右）、伸指肌腱（左） | 2.9–5.1% | 2.4–4.8 | 指骨、掌骨、橈骨 | ≤ 9.8 |
| 其餘 80 段 | < 3% | | | |

- 兩端：98 段的兩端到最近骨面都 ≤ 13.2 mm，沒有懸空的肌腱。肱三頭肌腱遠端 10–13 mm 是因為它插進鷹嘴裡面而不是停在骨面上。
- 示意肌腱（跑考串流 94 條）：肱三頭肌腱（同上，12–26%）、伸拇長肌腱 5–8%、左股四頭肌腱 6%（股骨）、右伸小指肌腱 5%；其餘 < 5%。
- 與 #177 比：之前列的「股二頭肌短頭 5.8 mm」「腓骨長／短肌腱」「脛前肌腱」其實是頂點在「被來源誤標為骨骼的肌肉」裡（腓骨長肌、脛前肌等在 `atlas.json` 的 system 是 skeletal），不是在骨裡；這次把那些肌肉排除後，股二頭肌短頭在腓骨內只剩 2.2%。

### 3E　韌帶、支持帶、腱鞘

| 結構 | 在骨內 | 最深 (mm) | 骨 |
| --- | ---: | ---: | --- |
| 示意 Anterior talofibular ligament（左／右）`PK-489`／`PK-478` | 35% / 17% | 4.0 / 3.5 | 腓骨（外踝） |
| 示意 Intertubercular tendon sheath（左／右）`PK-411`／`PK-399` | 30.1% / 29.4% | 5.2 / 5.0 | 肱骨（結節間溝） |
| 示意 Tendinous arch of soleus（左／右）`PK-498`／`PK-487` | 20% / 16% | 4.7 / 3.9 | 腓骨、脛骨 |
| 示意 Plantar calcaneonavicular ligament（左／右）`PK-493`／`PK-482` | 16% / 15% | 4.1 / 3.7 | 距骨、舟骨、跟骨 |
| 示意 Denticulate ligament（左）`PK-221`、Ligamentum flavum `PK-222` | 14.8% / 13.6% | 5.4 / 4.6 | 頸椎 |
| 示意 Anterior tibiotalar ligament（左／右）、Inferior fibular retinaculum（左／右）、Coraco-acromial ligament（左右） | 11–14% | ≤ 5.6 | 脛骨、距骨、骰骨、肩胛骨 |
| 示意 Fibular collateral ligament（左右）、Posterior talofibular（右）、第二／第五腕背間隔、肋鎖韌帶、足上伸肌支持帶 | 5–10% | ≤ 4.6 | |
| 主圖譜 Check ligament of lateral rectus（左右）`FJ1284`／`FJ1334` | 11–12% | 5.5–5.8 | 顴骨（眼眶壁） |
| 主圖譜 Long plantar ligament（左右）、Interosseous membrane of leg（左右）、Pharyngeal raphe、Tendinous arch of levator ani | 7–8% | ≤ 5.9 | 跟骨、脛腓骨、頸椎、髖骨 |

- 韌帶貼骨面附著處有幾個百分比在骨內是量測方法（取樣到附著面）造成的；超過 15% 的（距腓前韌帶、結節間腱鞘、比目魚肌腱弓、跟舟足底韌帶）是示意模型路徑穿進骨裡，要修。
- 浮空（6 mm 內沒有骨）：聲帶韌帶、環甲正中韌帶、甲狀會厭韌帶（接喉軟骨，正常）、乳房懸韌帶（接皮膚與筋膜，正常）。

## 4. 畫面檢查（29 個視角＋6 個點選）

- **整體**：全身、頭頸、肩、肘、前臂、手、胸、腹、骨盆、大腿、膝、小腿、足的主要幹線位置都合理（`body-front`、`thorax-front`、`pelvis-front`、`arm-right-front`、`hand-right-palm`、`leg-right-back` 等），沒有看到像之前「跟骨支」浮在髖部那種離譜的東西。
- **看起來爛掉的地方**（點選確認名稱）：
  - 膝後與小腿後的主幹上一排短刺與截平的分支口：點到的是膕動脈與膝靜脈的末端片／補接管（`spot-knee-right-back`、`leg-right-back`）。這是 #177 的 2F，全身都一樣（補接管 683、樣條橋 366）。
  - **膝靜脈**（Right genicular vein）有幾處直角轉折，像折斷再接上（`spot-knee-right-back` 右上）；同一條靜脈有 10% 頂點在髂脛束裡（來源標為骨骼的肌肉，不算穿骨）。
  - 手掌：淺掌靜脈弓與深掌靜脈弓的來源網格由直線段與直角構成（`spot-hand-right-palm` 中央的方形環），點選為 Right superficial palmar venous arch／Right deep venous palmar arch。
  - 大腿前面垂下的細暗紅線：點到的是右股深靜脈與右大隱靜脈的末端片（`spot-thigh-right-front`）。
  - 會陰部（恥骨聯合下方）有一叢梳狀短分支（`spot-pelvis-front` 中央下方），點選只點到左陰部內靜脈與左睪丸動脈；梳狀的細支點不到名稱，應是末端片或細分支，請你在站上確認。
- 沒有看到的：浮在空中的血管、放錯肢體的血管或神經。

## 5. 與 #177 下肢報告的對照

| #177 項目 | 這次 |
| --- | --- |
| 2A 跟骨支末端片浮在髖部 | 已由 #184 處理（改名為旋股外側動脈升支與橫支） |
| 2B 腓動脈標成足背趾動脈群、示意腓動脈重複 | 已由 #184 處理 |
| 2C 左腓靜脈 `FJ2190` 在大腿 | 未改；另外新發現 `FJ2184`／`FJ2194` 在腳跟（2A） |
| 2D 穿動脈群 | 未改，等你決定 |
| 2E 穿靜脈群只在左腳 | **更正**：左右都有（`FJ2100`／`FJ2119` 左、`FJ2138`／`FJ2174` 右），是足部穿支 |
| 2F 末端片與補接管 | 全身都有，數字見第 1 節 |
| 第 6 節 肌腱碰撞 | 之前的數字把來源誤標為骨骼的肌肉算成骨；更正後見 3D |

## 6. 建議的處理順序

1. **你決定**：`FJ2184`／`FJ2194`（腳跟的「腓靜脈」）排除或改名；`FJ2190`、穿動脈群 `FJ2094`／`FJ2203` 的去留；隱神經小腿內側皮支（2B）是否改名。
2. 一個 PR（需人工審核）：把真實血管與神經推出骨外——肩胛上動／靜脈、旋肩胛動脈、橈側副動脈、足背動脈、下頜舌骨肌神經、尺神經掌支、正中神經指掌側總支；方法沿用 `nerve-bone-clearance.mjs`。
3. 一個 PR（需人工審核）：示意結構路徑移出骨外——胸肩峰動脈鎖骨支、內外踝前動脈、旋股內側動脈、臀上動脈、骨間後動脈、頸脊神經與背支、迷走神經後幹、肱三頭肌腱、距腓前韌帶、結節間腱鞘、比目魚肌腱弓、跟舟足底韌帶、距脛前韌帶、腓骨下支持帶、喙肩韌帶。
4. 補接規則檢討（2F）與靜脈直角轉折（膝靜脈、掌靜脈弓）各另開 PR。
5. 肝內門靜脈／肝動脈與結腸邊緣動脈的斷段是否補接，由你決定。
