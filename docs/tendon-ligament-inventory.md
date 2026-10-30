# 肌腱與韌帶盤點（Step 1：只盤點，沒有改任何模型或程式）

> 需人工審核，未合併。這份只是盤點與建議，等你確認做法之後才會開始建置。
> 名稱只列英文與中文（英文在上）；不附任何課堂筆記文字、頁碼或出處。日期：2026-10-30，依據 main `a191624`。

## 0. 摘要

**結論（一句話）：** 模型不是「沒有肌腱」，而是肌腱大多已經畫在肌肉網格裡面，只是不能單獨選取、也沒有人把它們獨立出來；真正「完全缺少」的是少數構造（腱鞘、掌腱膜、鵝足、動脈韌帶、比目魚肌腱弓、踝外側韌帶、喙肩韌帶等），而已有的 35 個示意肌腱、韌帶、支持帶、鞘、腱膜多半粗糙。公開資料（Z-Anatomy、Human Reference Atlas）可以補上其中一大部分。

### 0.1 各區域各狀態數量

「跑考清單明列」＝跑考清單裡直接寫出名稱的肌腱、韌帶、支持帶、腱膜、膜；「由清單肌肉推得的肌腱」＝清單列了該肌肉，而肌腱是它要認的構造（我依清單內容推得，請你確認範圍，見第 8 節）；「你補充／建議」＝你的訊息點名、或我認為完整度需要但清單沒有明列的。左右成對的算一個。

| 區域，層級 | (a) 已有且正常 | (b) 粗糙或不準 | (c) 包在肌肉內 | (d) 完全沒有 | (?) 無法判定 | 合計 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 背部 Back：跑考清單明列 | 6 | 2 | 0 | 0 | 0 | 8 |
| 背部 Back：由清單肌肉推得的肌腱 | 0 | 0 | 0 | 0 | 0 | 0 |
| 背部 Back：你補充／建議 | 0 | 0 | 0 | 0 | 1 | 1 |
| 上肢 Upper limb：跑考清單明列 | 0 | 2 | 0 | 0 | 0 | 2 |
| 上肢 Upper limb：由清單肌肉推得的肌腱 | 0 | 0 | 24 | 0 | 0 | 24 |
| 上肢 Upper limb：你補充／建議 | 0 | 4 | 0 | 12 | 0 | 16 |
| 胸腔 Thorax：跑考清單明列 | 3 | 2 | 0 | 1 | 0 | 6 |
| 胸腔 Thorax：由清單肌肉推得的肌腱 | 0 | 0 | 3 | 0 | 0 | 3 |
| 胸腔 Thorax：你補充／建議 | 0 | 0 | 2 | 0 | 0 | 2 |
| 下肢 Lower limb：跑考清單明列 | 10 | 10 | 5 | 0 | 0 | 25 |
| 下肢 Lower limb：由清單肌肉推得的肌腱 | 0 | 0 | 13 | 2 | 0 | 15 |
| 下肢 Lower limb：你補充／建議 | 0 | 1 | 0 | 4 | 0 | 5 |
| **全部：跑考清單明列** | 19 | 16 | 5 | 1 | 0 | 41 |
| **全部：由清單肌肉推得的肌腱** | 0 | 0 | 40 | 2 | 0 | 42 |
| **全部：你補充／建議** | 0 | 5 | 2 | 16 | 1 | 24 |

另有 5 個「通道／空間」（腕隧道、解剖鼻煙盒、跗隧道、內收肌裂孔、主動脈裂孔）：全部是 (b)，見第 3 節；它們不計入上表。

### 0.2 原因（摘要）
1. **來源資料：** BodyParts3D 4.0 在四肢只有 12 件獨立網格（左右各算 1：跟腱、腕屈肌支持帶、髂脛束、足底長韌帶、小腿與前臂骨間膜），其餘肌腱建模時就畫在肌肉裡。這個專案匯入時沒有濾掉任何東西（2,234 個網格全部都在）。
2. **肌肉網格確實帶著肌腱：** 我逐一量了 40 多對「肌肉網格最遠端到止點骨」的距離，絕大多數 ≤ 2 mm，也就是肌腱已經畫到骨頭上，只是與肌腹是同一件、無法單獨選取。例外：伸拇長肌（差 7.6 mm）、縫匠肌（7.0 mm）、肱二頭肌短頭（26–36 mm）、胸大肌（4.4 mm）。
3. **Z-Anatomy（CC BY-SA 4.0）有而本專案沒用到的：** 腕與踝的各支持帶、腕背六條腱鞘、屈肌腱鞘、結節間腱鞘、掌腱膜、足底腱膜、胸腰筋膜三層、髕支持帶、腓骨肌與脛後肌等腱鞘。這些在它的肌肉檔 `MuscularSystem100.fbx` 裡是獨立網格；它的個別肌腱則與 BodyParts3D 一樣包在肌肉裡（獨立的只有跟腱、伸趾長肌腱、二腹肌中間腱）。
4. **關節韌帶：** 本專案的 `joints.glb` 只取了 Z-Anatomy 關節檔的一部分，少了前、後距腓韌帶、跟腓韌帶、喙肩韌帶、肋鎖韌帶、肩胛上／下橫韌帶、彈簧韌帶等；Z-Anatomy 原檔這些只是 36–96 頂點的簡單形狀，不能直接用。
5. **目前的 155 個結締組織結構**（男性畫面；加女性乳房懸韌帶共 157）其中 23 個其實是「空間」（腕隧道、腋窩…，有 10 個只有 8 頂點的方塊），14 個肋軟骨、23 個椎間盤、14 個喉鼻軟骨、9 個眼部構造不屬於本次範圍；真正屬於範圍內的肌腱、韌帶、支持帶、腱膜、鞘約 50 件（詳見 4.3）。另外關節韌帶、關節囊、半月板等 349 個組織來自 `joints.glb`，它們也顯示在「結締組織」開關下，但不算在 155 內。

### 0.3 建議做法（摘要）
- (c) 類（47 條肌腱）：從 BodyParts3D 肌肉網格「分離」出遠端肌腱（方法 ii），肌腹與肌腱各自可選、可高亮；授權不變。
- 支持帶、腱鞘、腱膜、筋膜（b／d 類約 23 項）：優先取 Z-Anatomy 對應網格（方法 i，CC BY-SA 4.0，已有先例），品質不夠的（例如 105 頂點的腓骨下支持帶）用方法 iii 重做。
- 關節韌帶缺漏與過於簡陋者：方法 iii，由骨附著點生成有厚度的帶。
- 股四頭肌腱、髕韌帶：用方法 ii 取代現在的平板；HRA 的同名網格（CC BY 4.0，女性、約 550–750 頂點）可作對照。

## 1. 怎麼盤點、判斷標準與限制

**依據：** `docs/paokao-checklist.json`（574 項名稱）與 `docs/paokao-audit.json`；我另外讀了清單中每一行的內容來找出「要認的肌腱」，但這份文件只寫名稱，不抄原文。清單的名稱抽取只抓到少數肌腱與韌帶，沒有把每條肌腱列成一項，所以我把「清單肌肉的肌腱」分成第二層，請你確認。

**狀態判斷：**
- (a)：網站上有獨立、可選的網格，頂點數與位置量測合理。**我沒有在 3D 畫面逐一目視全部 (a)。** 只渲染看過手腕與踝兩處（其餘用數值、舊截圖與腳本判斷）。
- (b)：有，但（頂點很少、等寬平片、小方塊、與骨頭或肌肉位置重疊、沒有接上附著點、只有一半）。
- (c)：肌腱包在肌肉網格內，網站上無法單獨選取（量測肌肉最遠端到止點骨的距離）。
- (d)：沒有任何網格。
- (?)：我無法判定。

**方法與限制（請一併看）：**
1. 結構數量用與網站相同的流程組出（`atlas-stream` ＋ 臉部、補充、女性、漿膜、血管端、跑考示意六個資料包，系統分類用 `displaySystem`），所以 155 的數字與畫面一致。
2. 距離是兩個網格頂點之間的最小距離（約 ±1–2 mm），不是表面到表面。
3. 渲染用 `scripts/render-preview.mjs`（離線 three.js），不是正式站。
4. Z-Anatomy 的資料我讀的是本機已有的 `LluisV/Z-Anatomy` commit `6c7f9016`（`PC-Version` 的 FBX；它的說明寫「可能不是最新」）。我沒有重新連線取得 `nqwrc/3d-anatomy` 的 glb，專案實際使用的 `joints.glb` 內容是用 FBX 同名網格推得（兩者同源，349 個節點名稱完全對得上）。頂點數是 FBX 的數字，Draco 量化後可能略有差異。
5. HRA 只檢查了網格名稱與頂點數，沒有渲染。

## 2. 各區域明細

欄位：英文／中文 ｜ 層級（A 清單明列、B 由清單肌肉推得、C 你補充／建議） ｜ 現況 ｜ 目前的模型 ｜ 說明 ｜ 建議做法（i 取開放資料、ii 從肌肉網格分離、iii 由骨附著點程序化生成）。PK-xxx 是本專案自己生成的示意結構編號（僅用在這份內部文件）。

### 2.1 背部 Back

背部沒有跑考清單明列的肌腱；清單中的背部結構只有筋膜與脊柱韌帶。

| 英文<br>中文 | 層級 | 現況 | 目前的模型 | 說明 | 建議做法 |
| --- | :---: | :---: | --- | --- | --- |
| Thoracolumbar fascia<br>胸腰筋膜 | A | (b) | PK-186 示意薄殼（13,914 頂點，左右合併成 1 件） | 只有後層；由豎脊肌表面抬起 1.4 mm，不分前、中、後三層，也不是貼在棘突與髂嵴的真實形狀 | I：Z-Anatomy 三層（480–939 頂點）；或 III |
| Ligamenta flava (ligamentum flavum)<br>黃韌帶 | A | (a) | joints.glb「Ligamenta flava」（14,184 頂點） | 另有 PK-222 示意版（434 頂點）與它重複，建議建置階段移除示意版 | 保留；移除重複 |
| Anterior longitudinal ligament<br>前縱韌帶 | A | (a) | joints.glb（14,784 頂點） |  | 保留 |
| Posterior longitudinal ligament<br>後縱韌帶 | A | (a) | joints.glb（22,608 頂點） |  | 保留 |
| Nuchal ligament<br>項韌帶 | A | (a) | joints.glb（1,935 頂點） |  | 保留 |
| Supraspinous ligament<br>棘上韌帶 | A | (a) | joints.glb（2,616 頂點） |  | 保留 |
| Interspinous ligaments<br>棘間韌帶 | A | (a) | joints.glb（1,752 頂點） |  | 保留 |
| Denticulate ligament<br>齒狀韌帶 | A | (b) | PK-220／221 示意細帶（各 176 頂點） | 簡化的帶，沒有沿脊髓一側的鋸齒狀附著 | III |
| Aponeuroses of back muscles (erector spinae common tendon, lumbar aponeurosis of latissimus dorsi, trapezius aponeurosis)<br>背部肌肉的腱膜（豎脊肌總腱、背闊肌腰部腱膜、斜方肌腱膜） | C | (?) | — | 跑考清單沒有明列；是否包在肌肉網格內我沒有逐一檢查，無法判定 | 待你決定是否要 |

### 2.2 上肢 Upper limb

跑考清單的上肢部分明列的只有肩胛上橫韌帶與腋鞘；沒有支持帶、腱膜、腱鞘，「肌腱」一項只是泛稱。屈、伸肌支持帶與腕背間隔是你這次點名的，所以放在層級 C。

| 英文<br>中文 | 層級 | 現況 | 目前的模型 | 說明 | 建議做法 |
| --- | :---: | :---: | --- | --- | --- |
| Superior transverse scapular ligament<br>肩胛上橫韌帶 | A | (b) | PK-168／177 示意（84 頂點） | 一條直的細條（見 docs/connective-fix/ankle-front.png 的截圖），像小方棒，不是貼著切跡的帶 | III（兩端接切跡內外緣的帶狀，有厚度） |
| Axillary sheath<br>腋鞘 | A | (b) | PK-169／178 示意管（352 頂點） | 只是包著腋動脈的圓管（半徑約 12 mm），沒有把腋靜脈與臂神經叢一起包住 | III |
| Tendon of long head of biceps brachii<br>肱二頭肌長頭腱 | B | (c) | 包在「Long head of biceps brachii」網格內（466 頂點）；量測：在肱骨結節間溝內（與溝的標示面同位）；上端離肩胛骨 1.3 mm |  | II |
| Distal tendon of biceps brachii<br>肱二頭肌遠端腱 | B | (c) | 只在長頭網格上（離橈骨 2.4 mm）；短頭網格止於離尺骨 26 mm、離橈骨 36 mm 處 |  | II（短頭另需判斷） |
| Tendon of latissimus dorsi<br>背闊肌腱 | B | (c) | 包在 BodyParts3D 3.0 補充的背闊肌網格內（離肱骨 0.6 mm） |  | II |
| Tendon of supraspinatus<br>棘上肌腱 | B | (c) | 包在肌肉網格內（離肱骨 1.0 mm） |  | II |
| Tendon of infraspinatus<br>棘下肌腱 | B | (c) | 包在肌肉網格內（離肱骨 0.9 mm） |  | II |
| Tendon of teres minor<br>小圓肌腱 | B | (c) | 包在肌肉網格內（離肱骨 0.5 mm） |  | II |
| Tendon of subscapularis<br>肩胛下肌腱 | B | (c) | 包在肌肉網格內（離小結節 0.3 mm） |  | II |
| Tendon of triceps brachii<br>肱三頭肌腱 | B | (c) | 包在三個頭的網格內（長頭離尺骨鷹嘴 0.4 mm） |  | II |
| Tendon of brachioradialis<br>肱橈肌腱 | B | (c) | 包在肌肉網格內（離橈骨 0.2 mm） |  | II |
| Tendon of flexor carpi radialis<br>橈側屈腕肌腱 | B | (c) | 包在肌肉網格內（離第 2 掌骨 0.4 mm） |  | II |
| Tendon of palmaris longus<br>掌長肌腱 | B | (c) | 包在肌肉網格內；通過屈肌支持帶淺層（量測位置正確） |  | II |
| Tendon of flexor carpi ulnaris<br>尺側屈腕肌腱 | B | (c) | 包在兩個頭的網格內；未量測止點 |  | II |
| Tendons of flexor digitorum superficialis<br>屈指淺肌腱 | B | (c) | 包在肌肉網格內（離中節指骨 0.5 mm）；指處的分叉與深肌腱通過沒有個別模型 |  | II |
| Tendons of flexor digitorum profundus<br>屈指深肌腱 | B | (c) | 包在肌肉網格內（離遠節指骨 0.2 mm） |  | II |
| Tendon of flexor pollicis longus<br>屈拇長肌腱 | B | (c) | 包在肌肉網格內（離拇指遠節指骨 0.3 mm） |  | II |
| Tendon of extensor carpi radialis longus<br>橈側伸腕長肌腱 | B | (c) | 包在肌肉網格內（離第 2 掌骨 1.3 mm） |  | II |
| Tendon of extensor carpi radialis brevis<br>橈側伸腕短肌腱 | B | (c) | 包在肌肉網格內（離第 3 掌骨 0.2 mm） |  | II |
| Tendons of extensor digitorum<br>伸指肌腱 | B | (c) | 包在肌肉網格內（離指骨 0.4 mm）；伸肌擴張部（腱帽）沒有 |  | II + III（腱帽） |
| Tendon of extensor digiti minimi<br>伸小指肌腱 | B | (c) | 包在肌肉網格內（離小指指骨 1.4 mm） |  | II |
| Tendon of extensor carpi ulnaris<br>尺側伸腕肌腱 | B | (c) | 包在肌肉網格內（離第 5 掌骨 0.4 mm） |  | II |
| Tendon of abductor pollicis longus<br>外展拇長肌腱 | B | (c) | 包在肌肉網格內（離第 1 掌骨 0.6 mm） |  | II |
| Tendon of extensor pollicis brevis<br>伸拇短肌腱 | B | (c) | 包在肌肉網格內（離拇指近節指骨 0.7 mm） |  | II |
| Tendon of extensor pollicis longus<br>伸拇長肌腱 | B | (c) | 包在肌肉網格內（離拇指遠節指骨 0.5 mm） |  | II |
| Tendon of extensor indicis<br>伸食指肌腱 | B | (c) | 包在肌肉網格內（離食指指骨 0.6 mm） |  | II |
| Flexor retinaculum of wrist<br>腕屈肌支持帶（屈肌支持帶） | C | (b) | BodyParts3D 網格（1,303 頂點） | 我渲染後看到是皺褶的不規則片，中間有洞，不是平滑橫帶；位置覆蓋腕隧道（量測：在屈指肌腱前方 4–7 mm） | I（Z-Anatomy 1,572 頂點）或 III |
| Extensor retinaculum of wrist<br>腕伸肌支持帶（伸肌支持帶） | C | (b) | PK-167／176 示意薄片（387／463 頂點） | 量測：在 y 0.86–0.89 m 這一層，支持帶的前後位置（z 0.007–0.011）落在伸肌腱的範圍內（0.002–0.014），也就是部分埋在肌腱裡，不是蓋在上面 | I（Z-Anatomy 1,104 頂點）或 III |
| Palmar aponeurosis<br>掌腱膜 | C | (d) | — | 模型沒有；掌長肌腱的終點沒有接到任何東西 | I（Z-Anatomy 3,852 頂點） |
| Dorsal compartment 1st of wrist (tendon sheath of APL and EPB)<br>腕背第 1 伸肌間隔（外展拇長肌與伸拇短肌的腱鞘） | C | (d) | — | 模型沒有腱鞘或間隔；各肌腱在肌肉網格內 | I（Z-Anatomy 有六條獨立腱鞘網格） |
| Dorsal compartment 2nd of wrist (tendon sheath of ECRL and ECRB)<br>腕背第 2 伸肌間隔（橈側伸腕長、短肌的腱鞘） | C | (d) | — | 模型沒有腱鞘或間隔；各肌腱在肌肉網格內 | I（Z-Anatomy 有六條獨立腱鞘網格） |
| Dorsal compartment 3rd of wrist (tendon sheath of EPL)<br>腕背第 3 伸肌間隔（伸拇長肌的腱鞘） | C | (d) | — | 模型沒有腱鞘或間隔；各肌腱在肌肉網格內 | I（Z-Anatomy 有六條獨立腱鞘網格） |
| Dorsal compartment 4th of wrist (tendon sheath of extensor digitorum and extensor indicis)<br>腕背第 4 伸肌間隔（伸指肌與伸食指肌的腱鞘） | C | (d) | — | 模型沒有腱鞘或間隔；各肌腱在肌肉網格內 | I（Z-Anatomy 有六條獨立腱鞘網格） |
| Dorsal compartment 5th of wrist (tendon sheath of extensor digiti minimi)<br>腕背第 5 伸肌間隔（伸小指肌的腱鞘） | C | (d) | — | 模型沒有腱鞘或間隔；各肌腱在肌肉網格內 | I（Z-Anatomy 有六條獨立腱鞘網格） |
| Dorsal compartment 6th of wrist (tendon sheath of extensor carpi ulnaris)<br>腕背第 6 伸肌間隔（尺側伸腕肌的腱鞘） | C | (d) | — | 模型沒有腱鞘或間隔；各肌腱在肌肉網格內 | I（Z-Anatomy 有六條獨立腱鞘網格） |
| Common flexor tendon sheath (carpal tunnel, ulnar bursa) and tendon sheath of flexor pollicis longus<br>屈肌總腱鞘與屈拇長肌腱鞘 | C | (d) | — | 模型沒有 | I（Z-Anatomy 有） |
| Intertubercular tendon sheath<br>結節間腱鞘（肱二頭肌長頭） | C | (d) | — | 模型沒有；肱骨結節間溝的標示面有（PK） | I（Z-Anatomy 2,496 頂點） |
| Coraco-acromial ligament<br>喙肩韌帶 | C | (d) | — | joints.glb 沒有；Z-Anatomy 原檔只有 36 頂點的方塊，不可用 | III |
| Costoclavicular ligament<br>肋鎖韌帶 | C | (d) | — | joints.glb 沒有；Z-Anatomy 原檔只有 36 頂點的方塊，不可用 | III |
| Inferior transverse scapular ligament<br>肩胛下橫韌帶 | C | (d) | — | 同上 | III |
| Conoid and trapezoid ligaments (coracoclavicular)<br>錐狀韌帶與斜方韌帶 | C | (b) | joints.glb（各 168 頂點） | 頂點很少（近似稜柱）；需 3D 確認 | III 重做或平滑 |
| Radial and ulnar collateral ligaments of elbow<br>肘橈側與尺側副韌帶 | C | (b) | joints.glb（288／456 頂點） | 頂點偏少；需 3D 確認 | III 重做或平滑 |

### 2.3 胸腔 Thorax

胸腔的肌腱主要是胸大肌、胸小肌；心臟的腱索在清單的心臟部分另列（心臟詳細模式）。膈肌中心腱清單沒有明列，是你點名的。

| 英文<br>中文 | 層級 | 現況 | 目前的模型 | 說明 | 建議做法 |
| --- | :---: | :---: | --- | --- | --- |
| External intercostal membrane<br>外肋間膜 | A | (a) | joints.glb（20,208 頂點） |  | 保留 |
| Internal intercostal membrane<br>內肋間膜 | A | (a) | joints.glb（14,160 頂點） |  | 保留 |
| Suspensory ligament of breast (Cooper)<br>乳房懸韌帶 | A | (a) | PK-289／296（HRA，各 2,504 頂點） | 只有女性模式才有；男性模式沒有。是縮放後貼到男性胸壁的 HRA 網格（CC BY 4.0） | 保留 |
| Rectus sheath<br>腹直肌鞘 | A | (b) | PK-185 示意薄殼（24,217 頂點） | 只畫前壁，由腹直肌表面抬起；沒有後壁與弓狀線 | I（Z-Anatomy 有 Investing abdominal fascia）或 III |
| Pulmonary ligament<br>肺韌帶 | A | (b) | PK-249／250 示意帶（各 84 頂點） | 很短的直帶；位置未在 3D 畫面逐一確認 | III |
| Ligamentum arteriosum<br>動脈韌帶 | A | (d) | — | 模型沒有。審核表曾把它對到「Conus arteriosus（動脈圓錐）」，那是誤判（右心室流出道，不是動脈韌帶） | III（主動脈弓下緣到左肺動脈的短索） |
| Tendon of pectoralis major<br>胸大肌腱 | B | (c) | 包在三部分網格內（離肱骨 4.4 mm） |  | II |
| Tendon of pectoralis minor<br>胸小肌腱 | B | (c) | 包在肌肉網格內（未量測喙突端） |  | II |
| Aponeurosis of external oblique<br>腹外斜肌腱膜 | B | (c) | 包在「Right external oblique」網格內（網格延伸到中線，由範圍推定，未逐面檢查） |  | II |
| Central tendon of diaphragm (and crura)<br>橫膈中心腱（與膈腳） | C | (c) | 只有 1 件「Diaphragm」（8,469 頂點） | 肌肉部與腱性部沒有分開，也沒有膈腳；未做 3D 檢查看有沒有畫出腱性中心 | II 或 III（表面分區） |
| Chordae tendineae<br>腱索 | C | (c) | 心臟詳細模式：包在房室瓣瓣葉網格內 | docs/heart-detail.md 已說明不能單獨選取；乳突肌是獨立的件 | III（由乳突肌尖到瓣葉緣的細索） |

### 2.4 下肢 Lower limb

| 英文<br>中文 | 層級 | 現況 | 目前的模型 | 說明 | 建議做法 |
| --- | :---: | :---: | --- | --- | --- |
| Inguinal ligament<br>腹股溝韌帶 | A | (a) | BodyParts3D 3.0 補充（各 6,114 頂點） |  | 保留 |
| Sacrotuberous ligament<br>薦結節韌帶 | A | (a) | joints.glb（1,962 頂點） |  | 保留 |
| Sacrospinous ligament<br>薦棘韌帶 | A | (a) | joints.glb（840 頂點） |  | 保留 |
| Iliotibial tract<br>髂脛束 | A | (a) | BodyParts3D FJ1423（2,355 頂點） | 量測：連到闊筋膜張肌（0.7 mm）、臀大肌（0.4 mm），下端到脛骨（1.4 mm） | 保留 |
| Femoral sheath<br>股鞘 | A | (b) | PK-170／179 示意管（296 頂點） | 只包股動脈（半徑 12–16 mm），沒有分成動脈、靜脈、股管三室 | III |
| Quadriceps tendon<br>股四頭肌腱 | A | (b) | PK-189／193 示意平板（288 頂點）；同時也包在股直肌與股肌網格內 | 示意板是等寬的平片（見 docs/knee-tendons/conn-front.png），與肌肉網格內的腱重疊；股直肌網格一路延伸到脛骨粗隆（0.4 mm） | II 或 I（HRA 有，CC BY 4.0） |
| Patellar ligament<br>髕韌帶 | A | (b) | PK-190／194 示意（126 頂點） | 細長平片，離髕骨 4.7 mm、離脛骨粗隆 2.5 mm（沒有接上）；股直肌網格內也已包含 | II 或 I（HRA 有） |
| Anterior cruciate ligament<br>前十字韌帶 | A | (a) | joints.glb（4,728 頂點） |  | 保留 |
| Posterior cruciate ligament<br>後十字韌帶 | A | (a) | joints.glb（2,364 頂點） |  | 保留 |
| Fibular collateral ligament<br>腓側副韌帶 | A | (b) | joints.glb（240 頂點） | 頂點偏少（近似稜柱）；需 3D 確認 | III 重做或平滑 |
| Tibial collateral ligament<br>脛側副韌帶 | A | (a) | joints.glb 淺部 1,488、深部 768 頂點 |  | 保留 |
| Transverse ligament of knee<br>膝橫韌帶 | A | (a) | joints.glb（1,293 頂點） |  | 保留 |
| Lateral meniscus<br>外側半月板 | A | (a) | joints.glb（1,404 頂點）；內側 852 頂點也有 |  | 保留 |
| Tendon of popliteus<br>膕肌腱 | A | (c) | 包在膕肌網格內（離股骨 1.3 mm） | 「夾在腓側副韌帶與外側半月板之間」的相對位置未檢查 | II |
| Superior fibular retinaculum<br>腓骨肌上支持帶 | A | (b) | PK-174／183 示意薄片（352 頂點） | 薄片只貼在外踝後方，不環繞肌腱 | I（Z-Anatomy 1,956 頂點）或 III |
| Inferior fibular retinaculum<br>腓骨肌下支持帶 | A | (b) | PK-175／184 示意薄片（288 頂點） | 小方片 | I（Z-Anatomy 僅 105 頂點，不佳）；III |
| Calcaneal tendon (Achilles)<br>跟腱（阿基里斯腱） | A | (a) | BodyParts3D FJ1405（1,937 頂點） | 量測：y 0.022–0.236 m，連到跟骨 1.9 mm，與腓腸肌、比目魚肌相接（0.4–0.9 mm） | 保留 |
| Tendon of plantaris<br>蹠肌腱 | A | (c) | 包在蹠肌網格內（離跟骨 1.4 mm） | 在跟腱內側的獨立走向沒有個別模型 | II |
| Flexor retinaculum of ankle<br>踝屈肌支持帶 | A | (b) | PK-173／182 示意薄片（352 頂點） | 我渲染後看到是一塊小片，沒有圍成管，也沒有把三條肌腱與神經血管束圍起來 | I（Z-Anatomy 2,088 頂點）或 III |
| Tendon of tibialis posterior<br>脛後肌腱 | A | (c) | 包在肌肉網格內 | 量測：內踝後方三條肌腱由前到後為脛後肌、屈趾長肌、屈拇長肌，順序正確 | II |
| Tendon of flexor digitorum longus<br>屈趾長肌腱 | A | (c) | 包在肌肉網格內（離遠節趾骨 1.0 mm） | 順序正確 | II |
| Tendon of flexor hallucis longus<br>屈拇長肌腱 | A | (c) | 包在肌肉網格內（離拇趾遠節 1.1 mm） | 順序正確 | II |
| Superior extensor retinaculum of foot<br>伸肌上支持帶 | A | (b) | PK-171／180 示意薄片（352 頂點） | 帶狀薄片貼在前方；未確認有包住四條肌腱 | I（Z-Anatomy 780 頂點）或 III |
| Inferior extensor retinaculum of foot<br>伸肌下支持帶 | A | (b) | PK-172／181 示意薄片（362／427 頂點） | 說明寫 Y 形，實際是單片 | I（Z-Anatomy 948 頂點）或 III |
| Plantar aponeurosis<br>足底腱膜 | A | (b) | PK-187／188 示意殼（1,395／1,384 頂點） | 只從跟骨延伸到蹠骨附近，離拇趾近節趾骨 55 mm（沒有到趾）；由足底肌肉表面抬起 | I（Z-Anatomy 1,218 頂點）或 III |
| Tendon of iliopsoas<br>髂腰肌腱 | B | (c) | 包在髂肌／腰大肌網格內（離股骨 0.9 mm） |  | II |
| Tendon of sartorius<br>縫匠肌腱 | B | (c) | 包在肌肉網格內（離脛骨 7.0 mm，沒有接上） |  | II + III |
| Tendon of gracilis<br>股薄肌腱 | B | (c) | 包在肌肉網格內（離脛骨 3.8 mm） |  | II + III |
| Tendon of semitendinosus<br>半腱肌腱 | B | (c) | 包在肌肉網格內（離脛骨 1.8 mm） |  | II |
| Pes anserinus (conjoined tendon)<br>鵝足（三條肌腱的共同止點） | B | (d) | — | 沒有作為整體的構造；三條肌腱的終點也沒有真正接在同一點上 | III（共同腱膜） |
| Tendon of semimembranosus<br>半膜肌腱 | B | (c) | 包在肌肉網格內（離脛骨 2.6 mm） |  | II |
| Tendon of biceps femoris<br>股二頭肌腱 | B | (c) | 包在長頭網格內（離腓骨 1.8 mm） |  | II |
| Tendon of tibialis anterior<br>脛前肌腱 | B | (c) | 包在肌肉網格內（離內側楔骨／第 1 蹠骨 0.5 mm） |  | II |
| Tendons of extensor digitorum longus<br>伸趾長肌腱 | B | (c) | 包在肌肉網格內（離趾骨 0.3 mm） |  | II |
| Tendon of extensor hallucis longus<br>伸拇長肌腱 | B | (c) | 包在肌肉網格內 | 離拇趾遠節趾骨 7.6 mm，沒有接上 | II + III |
| Tendon of fibularis tertius<br>第三腓骨肌腱 | B | (c) | 包在肌肉網格內（離第 5 蹠骨 0.8 mm） |  | II |
| Tendon of fibularis longus<br>腓骨長肌腱 | B | (c) | 包在肌肉網格內（離內側楔骨／第 1 蹠骨 0.4 mm） | 在外踝後方通過（量測）；足底的走向未檢查 | II |
| Tendon of fibularis brevis<br>腓骨短肌腱 | B | (c) | 包在肌肉網格內（離第 5 蹠骨 0.4 mm） | 在外踝後方，比腓骨長肌更靠近骨（量測，順序正確） | II |
| Tendon of obturator internus<br>閉孔內肌腱 | B | (c) | 包在肌肉網格內（未量測） | 兩個孖肌之間的位置關係未檢查 | II |
| Tendinous arch of soleus<br>比目魚肌腱弓 | B | (d) | — | 模型沒有 | III |
| Medial and lateral patellar retinacula<br>髕內側與外側支持帶 | C | (b) | PK-191／192／195／196 示意薄片（各 140 頂點） | 薄片；我沒有再渲染 | I（Z-Anatomy 552／444 頂點）或 III |
| Anterior, posterior talofibular and calcaneofibular ligaments<br>前距腓韌帶、後距腓韌帶、跟腓韌帶 | C | (d) | — | joints.glb 沒有；Z-Anatomy 原檔每條只有 96 頂點的簡單形狀，不夠好 | III |
| Deltoid ligament (medial collateral ligament of ankle)<br>三角韌帶（踝內側副韌帶） | C | (d) | — | joints.glb 只有其中的脛距後韌帶與脛跟韌帶、脛舟韌帶（各 168 頂點）；沒有完整的三角韌帶 | III |
| Plantar calcaneonavicular (spring) ligament<br>跟舟足底韌帶（彈簧韌帶） | C | (d) | — | joints.glb 有「Calcaneonavicular ligament」（288 頂點）；足底面這條沒有 | III |
| Common tendon sheath of fibularis muscles; tendon sheaths of tibialis posterior, flexor digitorum longus and flexor hallucis longus<br>腓骨肌總腱鞘；脛後肌、屈趾長肌、屈拇長肌腱鞘 | C | (d) | — | 模型沒有 | I（Z-Anatomy 有各腱鞘網格） |

**關節囊（清單沒有明列，僅供參考）：** `joints.glb` 已有 32 個關節囊（肩鎖、胸鎖、盂肱、肘、橈腕、髖、膝、上脛腓、顳顎、指間、掌指、蹠趾等），都屬於「結締組織」開關。

## 3. 通道與路徑（建置階段要逐一檢查）

數字是我在 `atlas`＋示意資料上實測的（y 為由腳底算起的高度，+z 往前，單位 m），用來判斷肌肉網格現在是不是已經走對路徑。

| 通道 | 要求 | 目前有哪些網格 | 實測與判斷 | 現況 |
| --- | --- | --- | --- | :---: |
| 肱二頭肌長頭腱在結節間溝<br>Long head of biceps in the intertubercular groove | 肌腱走在結節間溝內，上方有橫肱韌帶，外包腱鞘 | 長頭網格（466 頂點，包含肌腱）、結節間溝標示面（PK）、橫肱韌帶（joints.glb，1,392 頂點） | y 1.36–1.39 處，長頭中心 x −0.178、z −0.010，與溝標示面（x −0.175、z −0.010）重合：位置對。結節間腱鞘沒有 | (c)；腱鞘 (d) |
| 屈肌腱在腕隧道<br>Flexor tendons in the carpal tunnel | 屈指淺肌、深肌、屈拇長肌（與橈側屈腕肌另有腱鞘）在屈肌支持帶下，掌長肌在支持帶淺層 | 各屈肌網格（含肌腱）、BodyParts3D 屈肌支持帶（皺褶片）、腕隧道示意空間（PK-202，122 頂點） | y 0.84–0.87 處，淺肌、深肌 z 0.031–0.034，支持帶 z 0.038，掌長肌 z 0.041：層次順序對。正中神經與腱鞘未檢查；支持帶本身粗糙 | (c)；支持帶 (b)；空間 (b) |
| 腕背六個伸肌間隔<br>Six extensor compartments | 六組肌腱各在自己的腱鞘內，被伸肌支持帶壓住 | 各伸肌網格（含肌腱）、伸肌支持帶（PK-167，387 頂點） | 六個間隔與腱鞘都沒有。支持帶薄片與肌腱有重疊（見 2.2）。這一組要認的是「第幾間隔有哪幾條肌腱」，目前完全做不到 | (c)；腱鞘 (d) |
| 解剖鼻煙盒（外展拇長肌、伸拇短肌、伸拇長肌）<br>Anatomical snuffbox | 橈側邊界是外展拇長肌與伸拇短肌肌腱，尺側邊界是伸拇長肌肌腱 | 示意空間（PK-205／216，240／210 頂點）、三條肌肉網格 | y 0.86–0.89 處三條肌腱的 x 依序為 −0.287、−0.285、−0.272（橈側到尺側），順序合理；空間是否在三者之間未檢查 | (c)；空間 (b) |
| 腓骨長、短肌腱在外踝後方<br>Fibularis longus and brevis behind the lateral malleolus | 兩條肌腱繞過外踝後方，短肌在內（較靠骨）、長肌在外，由腓骨肌上支持帶壓住 | 兩條肌肉網格、腓骨肌上、下支持帶（PK）| y 0.06–0.08 處，短肌 z −0.046、長肌 z −0.051，腓骨 z −0.052 至 −0.025：在外踝後方、短肌較近骨，順序對。支持帶只是小片 | (c)；支持帶 (b) |
| 脛後肌、屈趾長肌、屈拇長肌在跗隧道<br>Tibialis posterior, flexor digitorum longus, flexor hallucis longus in the tarsal tunnel | 由前到後依序：脛後肌、屈趾長肌、（脛後動靜脈與脛神經）、屈拇長肌；由屈肌支持帶圍住 | 三條肌肉網格、屈肌支持帶（PK-173，352 頂點）、跗隧道示意空間（PK-203，162 頂點） | 內踝後方 y 0.06–0.08：脛後肌 z −0.028、屈趾長肌 z −0.040、屈拇長肌 z −0.046：由前到後順序正確。動靜脈與神經在隧道內的位置未檢查；支持帶沒有圍成管 | (c)；支持帶 (b)；空間 (b) |
| 跟腱<br>Achilles (calcaneal) tendon | 腓腸肌與比目魚肌匯成，止於跟骨，蹠肌腱在內側 | BodyParts3D 跟腱（獨立網格，1,937 頂點）、蹠肌網格 | 跟腱 y 0.022–0.236 m，連到跟骨（1.9 mm）、與兩頭腓腸肌、比目魚肌接續（0.4–0.9 mm）；蹠肌網格到跟骨 1.4 mm | (a) |
| 股四頭肌腱<br>Quadriceps tendon | 四個頭匯成，止於髕骨底 | 股直肌、股內、外、中間肌網格；PK-189／193 示意平板 | 兩套並存：網格內已有腱，並一路延伸到脛骨粗隆（0.4 mm，也就是已含髕韌帶）；示意平板（離髕骨 0.9 mm）是重複且較粗糙 | (b)＋(c) |
| 鵝足<br>Pes anserinus | 縫匠肌、股薄肌、半腱肌共同止於脛骨內側 | 三條肌肉網格 | 三條肌腱離脛骨 7.0、3.8、1.8 mm，沒有共同腱；沒有鵝足滑液囊 | (d) |
| 橫膈中心腱<br>Central tendon of diaphragm | 腱性中心與肌性部分、膈腳要能分辨 | 1 件「Diaphragm」（8,469 頂點） | 只有單件；未分區 | (c)（未做 3D 檢查） |
| 腱索<br>Chordae tendineae | 乳突肌連到瓣葉緣 | 心臟詳細模式：瓣葉網格內，乳突肌獨立 | 不能單獨選取（docs/heart-detail.md） | (c) |
| 膝十字與側副韌帶<br>Cruciate and collateral ligaments of the knee | 前、後十字、腓側、脛側副韌帶 | joints.glb：前十字 4,728、後十字 2,364、腓側副 240、脛側副淺 1,488／深 768 頂點；半月板、膝橫韌帶、斜膕、弓狀膕、膕腓韌帶也有 | 腓側副韌帶頂點偏少，其餘正常；位置未在 3D 逐一確認 | (a)；腓側副 (b) |
| 腕、踝的屈、伸肌支持帶<br>Flexor and extensor retinacula of wrist and ankle | 帶狀、有厚度、包住肌腱、兩端接骨 | 腕屈（BodyParts3D 皺褶片）、腕伸（PK-167）；踝屈、伸上、伸下、腓上、腓下（PK） | 全部是 1.2–1.6 mm 的薄片，沒有包住肌腱；渲染看到屈肌支持帶（腕）像有洞的皺紙，踝的幾片是小方片 | (b) |
| 解剖空間（共 5）<br>Spaces: carpal tunnel, snuffbox, tarsal tunnel, adductor hiatus, aortic hiatus | 依 CLAUDE.md：用邊界構造與內容物呈現，不用方塊 | PK-202／205／203／206／219；其中內收肌裂孔（PK-206／217）只有 8 頂點的長方體 | 共有 10 個只有 8 頂點的方塊空間（四邊孔、三邊孔、三邊間隙、腋窩、內收肌裂孔，左右各一；含這裡的內收肌裂孔 2 個）；這是「空間」不是肌腱，但使用者說的「像方塊」很可能包含它們 | (b) |

## 4. 原因調查

### 4.1 來源資料裡有沒有
| 來源 | 授權 | 肌腱、韌帶、支持帶等 | 本專案使用情況 |
| --- | --- | --- | --- |
| BodyParts3D 4.0（2,234 網格、3,432 概念） | CC BY 4.0 | 獨立網格只有：跟腱、腕屈肌支持帶、髂脛束、足底長韌帶、小腿與前臂骨間膜、提上眼瞼肌腱、二腹肌中間腱、提肛肌腱弓、白線、眼部（滑車、制約韌帶、總腱環）、喉與咽的韌帶與膜、咽縫。肌肉的遠端肌腱畫在肌肉網格裡 | 全部使用，無濾除（只排除 2 個跟骨支動脈網格，與本題無關） |
| BodyParts3D 3.0 補充（28 件） | CC BY-SA 2.1 Japan | 腹股溝韌帶、頭皮腱膜；背闊肌等肌肉含腱 | 已使用 |
| Z-Anatomy 肌肉檔（`MuscularSystem100.fbx`，686 網格） | CC BY-SA 4.0 | 獨立網格：腕屈、伸支持帶；踝屈肌、伸上、伸下、腓上、腓下支持帶；髕內、外側支持帶；掌腱膜、足底腱膜；胸腰筋膜前、中、後層；腕與踝的各條腱鞘（腕背六條、屈指、屈拇長肌、橈側屈腕、結節間、脛前、伸拇長、伸趾長、脛後、屈趾長、屈拇長、腓骨肌）；掌、足的橫韌帶；肢體與軀幹筋膜與肌間隔；跟腱、伸趾長肌腱、二腹肌中間腱 | **未使用**（本專案只用了它的關節檔、神經檔、腦檔） |
| Z-Anatomy 關節檔（`Joints100.fbx`，416 網格） | CC BY-SA 4.0 | 349 件已在 `joints.glb` 使用；另有 67 件沒用：前、後距腓韌帶、跟腓韌帶、喙肩韌帶、肋鎖韌帶、肩胛上／下橫韌帶、彈簧韌帶（足底跟舟）、腕骨間多條韌帶、橫突間韌帶等 | 部分使用；沒用的多數只有 36–96 頂點的簡單形狀 |
| Human Reference Atlas 女性聯合（`united-female.glb`，1,073 節點） | CC BY 4.0 | 股四頭肌腱（752 頂點）、髕韌帶（554）、前、後十字韌帶（各 496）、脛側副（842）、腓側副（842）、前外側韌帶（842）等膝部；乳房懸韌帶；子宮、肝韌帶等 | 已使用骨盆器官與乳房；膝部沒用 |
| Z-Anatomy 其他檔（內臟、心血管、淋巴） | CC BY-SA 4.0 | 沒有腱索、動脈韌帶、肺韌帶、膈中心腱、鵝足的獨立網格 | — |

### 4.2 有沒有在匯入時被濾掉、合併、隱藏？
- **濾掉：沒有。** `atlas-stream.json.gz` 的 2,234 個部件就是 BodyParts3D 4.0 的 2,234 個網格；概念表沒有任何「有概念但沒網格」的肌腱（我逐一檢查）。`app/anatomy-source-overrides.json` 只排除了 2 個與本題無關的血管網格。
- **合併在肌肉裡：是，這是主因。** BodyParts3D 把肌腱畫成肌肉網格的遠端變細部分；上面 40 多對量測顯示肌肉網格延伸到止點骨。所以網站「畫得出肌腱」，但它們是 (c)：不能單獨選、單獨高亮、單獨問答。
- **隱藏：有部分隱藏機制。** 結締組織分類在 `app/mj-depth.ts` 被歸為「深層」，所以「淺層」過濾下所有支持帶、韌帶都消失；`DEFAULT_VISIBLE` 預設包含結締組織；示意的鞘、空間用半透明（不透明度 .2／.62）。這些不算「濾掉」，但會讓使用者覺得「看不到」。
- **分類規則（`app/mj-system-classifier.ts`）：** 名稱含 ligament、cartilage、labrum、bursa、tendon、fascia、aponeurosis、retinaculum、sheath、capsule、membrane 就歸「結締組織」。所以名稱不含這些字的沿用 BodyParts3D 原本的系統標記（例如白線本來就標為結締組織）；「Common tendinous ring」因為寫成 tendinous 而不是 tendon，留在眼的「感覺」系統。

### 4.3 目前 155 個「結締組織」結構是什麼
男性畫面共 155 件（含女性模式才顯示的 2 件乳房懸韌帶則為 157）。依類別：

| 類別 | 件數 | 內容（左右成對各算 1 件） |
| --- | ---: | --- |
| 示意肌腱 | 2 | 股四頭肌腱（示意） |
| 示意韌帶 | 9 | 肩胛上橫韌帶、齒狀韌帶、黃韌帶、肺韌帶、髕韌帶（示意） |
| 示意支持帶 | 16 | 腕伸肌支持帶、踝屈肌支持帶、伸肌上／下支持帶、腓骨肌上／下支持帶、髕內／外側支持帶（示意，薄片） |
| 示意鞘、筋膜、腱膜 | 8 | 腋鞘、股鞘、腹直肌鞘、胸腰筋膜、足底腱膜（示意） |
| BodyParts3D 3.0 補充 | 2 | 腹股溝韌帶（BodyParts3D 3.0 補充） |
| BodyParts3D：肢體 | 12 | 小腿與前臂骨間膜、跟腱、髂脛束、足底長韌帶、腕屈肌支持帶 |
| BodyParts3D：喉、咽、頸 | 17 | 圓錐彈性膜、聲帶韌帶、甲狀舌骨膜與外側／正中韌帶、環甲正中韌帶、會厭舌骨韌帶、甲狀會厭韌帶、莖突舌骨韌帶、翼下頜縫、咽縫 |
| BodyParts3D：軀幹與骨盆 | 6 | 白線、提肛肌腱弓（4 件）、二腹肌中間腱（1 件） |
| BodyParts3D：眼 | 9 | 眼外肌制約韌帶（內、外直肌）、上斜肌滑車、提上眼瞼肌腱、晶狀體懸韌帶 |
| BodyParts3D：喉與鼻軟骨 | 14 | 甲狀軟骨、環狀軟骨（2 件重複名稱）、杓狀、小角、楔狀軟骨、鼻翼大軟骨、鼻外側軟骨、鼻中隔軟骨 |
| BodyParts3D：肋軟骨 | 14 | 第 1–7 肋軟骨左右各 7 件 |
| BodyParts3D：椎間盤 | 23 | 椎間盤 23 件（頸、胸、腰；BodyParts3D）。另外 joints.glb 還有 23 個椎間盤與 23 個髓核 |
| 示意空間 | 23 | 腕隧道、跗隧道、解剖鼻煙盒、肘窩、四邊孔、三邊孔、三邊間隙、腋窩、鎖胸三角、內收肌裂孔、枕下三角、主動脈裂孔（示意空間；其中 10 件只有 8 頂點的方塊） |
| **合計** | **155** | 與畫面一致（男性）；另 2 件女性乳房懸韌帶 |

**不在這 155 內但也在「結締組織」開關下的：** `joints.glb` 的 349 個關節組織（226 條韌帶、32 個關節囊、12 層膜、12 個半月板、4 個盂唇、23 個椎間盤與 23 個髓核、13 個盤／聯合／軟骨…），用搜尋索引計為 285 個可搜尋名稱（左右各算）。名單見附錄 B。

**範圍內的真正肌腱、韌帶、支持帶、腱膜、鞘（不含空間、軟骨、椎間盤、眼、喉）：** 4.3 表中的示意肌腱 2、示意韌帶 9、示意支持帶 16、示意鞘膜 8、補充 2、肢體 12 以及軀幹 6，共 55 件；其中屬於背部、上肢、胸腔、下肢範圍的約 41 件。

### 4.4 順帶發現的問題
1. **重複：** 黃韌帶有兩套（joints.glb 與 PK-222）；股四頭肌腱與髕韌帶的示意版與肌肉網格內的肌腱重疊。
2. **誤判：** 審核表把「動脈韌帶」對到「動脈圓錐」，實際上沒有動脈韌帶。
3. **審核表只列名稱：** `paokao-audit` 的「已有」包含「已含在肌肉內的肌腱」(14 項「屬於已有結構的一部分」)，所以顯示「缺少 0」並不代表每條肌腱都能單獨選取。
4. **示意版說明與實際不符：** 伸肌下支持帶說明寫 Y 形，實際是單片；足底腱膜說明寫「到趾」，實際停在蹠骨附近。
5. **來源說明需更正：** `public/ATTRIBUTION.md` 對跑考示意結構的說明是「BodyParts3D 與 Z-Anatomy 匯出裡都沒有」，但至少 10 種（腕伸肌支持帶、踝屈肌支持帶、伸肌上／下支持帶、腓骨肌上／下支持帶、髕內／外側支持帶、足底腱膜、胸腰筋膜）在 Z-Anatomy 肌肉檔裡有對應網格（網格已逐一確認有頂點），表示當時的比對不完整。

## 5. 建議做法（逐類）

| 類別 | 建議 | 理由與風險 |
| --- | --- | --- |
| 肌腱（c 類，47 條） | **ii 為主：** 在 BodyParts3D 肌肉網格上依「橫截面積變小」或固定位置切出遠端肌腱，肌腱與肌腹各成一件（名稱「Tendon of X」，中文「X 腱」），封口面補成平面。止點不到骨的（伸拇長肌 7.6 mm、縫匠肌 7.0 mm、肱二頭肌短頭、胸大肌 4.4 mm）用 iii 延伸補到骨。 | 授權不變（BodyParts3D 4.0 CC BY 4.0；補充件 BY-SA 2.1）。風險：切點位置是解剖判斷（要你審核）；屈指淺、深肌腱與伸指肌腱在手指處糾在一起，要在趾與指處做特別處理；每件新部件都要重新產生蒙皮權重、動作跟隨、搜尋、Quiz、跑考名單 |
| 支持帶、腱鞘、腱膜、筋膜 | **i 為主：** 從 Z-Anatomy 肌肉檔抽出對應網格（見 4.1），單位 cm→m、座標對齊 BodyParts3D（它與 joints.glb 同源），釘住來源與雜湊。品質不夠的（腓骨下支持帶 105 頂點）改 iii | 授權 CC BY-SA 4.0 已有先例；要換掉現有 16 個粗糙的示意薄片與 5 個鞘／腱膜。風險：Z-Anatomy 網格偶有重疊、是否合適要逐件渲染看 |
| 關節韌帶缺漏（踝外側三條、喙肩、肋鎖、肩胛橫、彈簧、三角韌帶完整） | **iii：** 兩端落在骨表面的附著點（用 `articular-surfaces` 與骨網格量測），中間沿骨與關節囊走的帶狀，有厚度；不用 Z-Anatomy 那些 36–96 頂點的簡單形狀 | 純自己生成，無第三方幾何，與現有示意做法一致；要附關節極限角度截圖 |
| 韌帶過於簡陋（腓側副 240、錐狀、斜方韌帶 168、橈側副 288 頂點） | iii 重做，或對現有網格細分平滑（衍生自 CC BY-SA 4.0，允許） | 低風險 |
| 股四頭肌腱、髕韌帶 | ii（從股直肌與股肌分離）；HRA 的同名網格（女性、CC BY 4.0）可作形狀對照或備案 | 現有示意平板應移除，避免與肌肉網格重疊 |
| 鵝足、比目魚肌腱弓、動脈韌帶、肺韌帶（重做）、腱索 | iii | 動脈韌帶由主動脈弓下緣到左肺動脈的短索；腱索由乳突肌尖到瓣葉緣的細索（心臟詳細模式裡另做，避免動到瓣葉網格） |
| 橫膈中心腱與膈腳 | ii（以區域在單件膈肌上分區，或沿腱性中心切分）；iii 備案（表面標示面，依 CLAUDE.md 的「骨性標記」做法） | 需要看一次膈肌網格是否有腱性中心的形狀 |
| 空間（腕隧道、跗隧道等） | 不屬本次，但現有 10 個 8 頂點方塊不符合 CLAUDE.md；建議另開一個「空間」任務改成高亮邊界構造 | — |
| 關節囊 | 沿用 `joints.glb` | 清單沒有明列 |

**絕對不做：** 不從任何商業 App 或網站複製模型或素材；不使用 CC BY-NC／ND 的來源。

## 6. 授權檢查（與 `public/ATTRIBUTION.md` 的相容性）

| 來源 | 授權 | 與目前 ATTRIBUTION 的關係 |
| --- | --- | --- |
| BodyParts3D 4.0 | CC BY 4.0 | 已列。分離肌腱屬於改作，署名不變 |
| BodyParts3D 3.0 補充 | CC BY-SA 2.1 Japan | 已另列，不可改成 4.0 的條款；從補充肌肉（背闊肌等）分離的肌腱要沿用 BY-SA 2.1 Japan |
| Z-Anatomy（肌肉檔、關節檔） | CC BY-SA 4.0（其 `Resources/Models/License.txt` 要求同時署名 BodyParts3D CC BY-SA 2.1 Japan 與 Z-Anatomy CC BY-SA 4.0） | 已有先例（`joints.glb`、`nervous.glb`、腦檔），`model_sources.json` 已列 `z-anatomy-joints`、`z-anatomy-nervous`。需新增一筆（肌肉檔）、在 ATTRIBUTION 加一段、改作說明與署名。衍生的網格要以 BY-SA 4.0 提供（網站程式仍為 MIT，資料各自授權，與現況相同） |
| HRA 女性聯合（`united-female.glb`） | CC BY 4.0 | 已使用其骨盆與乳房（有 sha 與 DOI）；用膝部網格同樣方式處理 |
| **要避開：** `nqwrc/3d-anatomy` 整包 | 倉庫標為 CC BY-NC-SA，內含腎（CC BY-NC）、內耳（CC BY-NC-SA）、白質（授權不明） | 現有流程只取單一檔案並以雜湊釘住；建議肌肉檔改直接取 `LluisV/Z-Anatomy` 原 FBX（其授權為整個倉庫 CC BY-SA 4.0），仍只抽取需要的節點。**需你確認這個授權解讀**；我沒有逐節點檢查 FBX 內是否混有非 CC BY-SA 的來源物件 |
| 來源消失風險 | — | facial.bin 的上游曾 404 使部署失敗；建議把抽出的幾十個網格放進 `scripts/data/*.json.gz`（像 HRA 那樣），不依賴上游 |
| 商業 App／網站 | 不可用 | 不使用任何來源 |

## 7. 建置階段注意事項

1. **新部件的連鎖更新：** 每個新結構都要經過 `prepare-paokao`（或新腳本）、搜尋索引、命名（`prepare-naming`）、跑考名單（`docs/paokao-aliases.json` 等，目前分在「屬於已有結構的一部分」的 14 項要改成「已有」）、Quiz 題庫、動作跟隨與蒙皮權重（上肢、下肢的肌腱必須跟關節動作）、資訊卡欄位（起點、止點、功能）。
2. **分離肌腱要保持動作：** 肌腹與肌腱分成兩件後，蒙皮權重與 motion followers 必須兩件一致，否則關節動作時兩件會分開。
3. **視覺檢查必做：** 每條新肌腱／支持帶要有正面、背面、側面、近距離、關節極限角度的截圖（CLAUDE.md）。
4. **PR 拆分建議：** 依區域與類別拆成：(1) 腕與手（支持帶、腱鞘、掌腱膜、肌腱分離）；(2) 踝與足；(3) 膝與大腿（股四頭肌腱、髕韌帶、鵝足、十字與側副）；(4) 肩與臂；(5) 背與胸（胸腰筋膜、膈中心腱、動脈韌帶、腱索）；每個 PR 都是【需人工審核】。
5. **規模：** 約 47 條肌腱分離、約 23 項支持帶／鞘／腱膜（含腕背 6 個間隔）、約 13 項韌帶新增或重做、股四頭肌腱與髕韌帶 2 項、其他示意件（鵝足、比目魚肌腱弓）約 2 項。

## 8. 需要你決定的問題

1. **範圍：** 「要求的肌腱」是只含清單明列的（41 項），還是連所有清單肌肉的肌腱（我推出的 B 層 42 條，再加上你點名的 C 層）都要能單獨選取？
2. **做法 ii（從肌肉網格分離肌腱）** 可以嗎？每條切點的位置會是解剖判斷，我會附截圖給你審核。
3. **Z-Anatomy 肌肉檔（CC BY-SA 4.0）** 可以當來源嗎？以及是否同意改取原倉庫 FBX 而不是 `nqwrc/3d-anatomy`（我對 NC 內容的檢查只做到檔名層次，需要你確認授權解讀）？
4. **鵝足、比目魚肌腱弓、動脈韌帶、橫膈中心腱、腱索** 要不要都做成獨立可選的結構？（跑考清單沒有明列，是你這次點名的 3 項與我加的 2 項。）
5. **10 個 8 頂點的方塊空間** 是否納入這個任務，還是另開「空間」任務？
6. **乳房懸韌帶** 在男性模式沒有，要不要在男性模式也顯示？
7. **移除重複的示意版**（黃韌帶、股四頭肌腱、髕韌帶）時，搜尋與 Quiz 的名稱要沿用哪一份？
8. **完整名單：** 清單的名稱抽取只抓到少數肌腱，若你有完整的「要認的肌腱」清單，請提供（名稱即可），我會與 B 層對照。

## 附錄 A：155 個結構明細

**示意肌腱（2）：** Right quadriceps tendon (288)；Left quadriceps tendon (288)

**示意韌帶（9）：** Right superior transverse scapular ligament (84)；Left superior transverse scapular ligament (84)；Right patellar ligament (126)；Left patellar ligament (126)；Right denticulate ligament (176)；Left denticulate ligament (176)；Ligamentum flavum (434)；Left pulmonary ligament (84)；Right pulmonary ligament (84)

**示意支持帶（16）：** Right extensor retinaculum of wrist (387)；Right superior extensor retinaculum of foot (352)；Right inferior extensor retinaculum of foot (362)；Right flexor retinaculum of ankle (352)；Right superior fibular retinaculum (352)；Right inferior fibular retinaculum (288)；Left extensor retinaculum of wrist (463)；Left superior extensor retinaculum of foot (352)；Left inferior extensor retinaculum of foot (427)；Left flexor retinaculum of ankle (352)；Left superior fibular retinaculum (352)；Left inferior fibular retinaculum (288)；Right medial patellar retinaculum (140)；Right lateral patellar retinaculum (140)；Left medial patellar retinaculum (140)；Left lateral patellar retinaculum (140)

**示意鞘、筋膜、腱膜（8）：** Right axillary sheath (352)；Right femoral sheath (296)；Left axillary sheath (352)；Left femoral sheath (296)；rectus sheath (24217)；thoracolumbar fascia (13914)；Right plantar aponeurosis (1395)；Left plantar aponeurosis (1384)

**BodyParts3D 3.0 補充（2）：** Right inguinal ligament (6114)；Left inguinal ligament (5894)

**BodyParts3D：肢體（12）：** Interosseous membrane of right leg (1320)；Interosseous membrane of left leg (1324)；Right calcaneal tendon (1937)；Left calcaneal tendon (1915)；Right iliotibial tract (2355)；Left iliotibial tract (2359)；Right long plantar ligament (1417)；Left long plantar ligament (1419)；Flexor retinaculum of right wrist (1303)；Flexor retinaculum of left wrist (1299)；Interosseous membrane of right forearm (952)；Interosseous membrane of left forearm (952)

**BodyParts3D：喉、咽、頸（17）：** Left pterygomandibular raphe (414)；Pharyngeal raphe (6023)；Right pterygomandibular raphe (381)；Left stylohyoid ligament (982)；Right stylohyoid ligament (949)；Hyo-epiglottic ligament (1004)；Left conus elasticus (1280)；Left lateral thyrohyoid ligament (411)；Left thyrohyoid membrane (1073)；Left vocal ligament (1832)；Median cricothyroid ligament (1265)；Median thyrohyoid ligament (1155)；Right conus elasticus (3074)；Right lateral thyrohyoid ligament (418)；Right thyrohyoid membrane (988)；Right vocal ligament (717)；Thyro-epiglottic ligament (989)

**BodyParts3D：軀幹與骨盆（6）：** Linea alba (285)；tendinous arch of levator ani (256)；Tendinous arch of levator ani (254)；Right intermediate tendon (390)；Tendinous arch of levator ani (210)；Tendinous arch of levator ani (224)

**BodyParts3D：眼（9）：** Check ligament of left lateral rectus (876)；Check ligament of left medial rectus (1034)；Suspensory ligament of left lens (4068)；Trochlea of left superior oblique (231)；Check ligament of right lateral rectus (901)；Check ligament of right medial rectus (1121)；Tendon of right levator palpebrae superioris (1173)；Suspensory ligament of right lens (3524)；Trochlea of right superior oblique (227)

**BodyParts3D：喉與鼻軟骨（14）：** Cricoid cartilage (838)；Right major alar cartilage (210)；Left major alar cartilage (236)；Left lateral nasal cartilage (296)；Septal nasal cartilage (263)；Right lateral nasal cartilage (312)；Cricoid cartilage (838)；Left cuneiform cartilage (91)；Left arytenoid cartilage (280)；Left corniculate cartilage (109)；Right arytenoid cartilage (279)；Right corniculate cartilage (108)；Right cuneiform cartilage (88)；Thyroid cartilage (1081)

**BodyParts3D：肋軟骨（14）：** Left first costal cartilage (391)；Left second costal cartilage (309)；Left third costal cartilage (306)；Left fourth costal cartilage (318)；Left fifth costal cartilage (365)；Left sixth costal cartilage (350)；Left seventh costal cartilage (523)；Right first costal cartilage (401)；Right second costal cartilage (346)；Right third costal cartilage (355)；Right fourth costal cartilage (332)；Right fifth costal cartilage (358)；Right sixth costal cartilage (444)；Right seventh costal cartilage (514)

**BodyParts3D：椎間盤（23）：** Intervertebral disk of axis (996)；Intervertebral disk of fourth thoracic vertebra (999)；Intervertebral disk of fifth thoracic vertebra (1280)；Intervertebral disk of sixth thoracic vertebra (1831)；Intervertebral disk of seventh thoracic vertebra (1813)；Intervertebral disk of eighth thoracic vertebra (2675)；Intervertebral disk of ninth thoracic vertebra (2552)；Intervertebral disk of tenth thoracic vertebra (2554)；Intervertebral disk of eleventh thoracic vertebra (2892)；Intervertebral disk (3614)；Intervertebral disk of first lumbar vertebra (3399)；Intervertebral disk of third cervical vertebra (582)；Intervertebral disk of second lumbar vertebra (2955)；Intervertebral disk of third lumbar vertebra (3750)；Intervertebral disk of fourth lumbar vertebra (3137)；Intervertebral disk of fifth lumbar vertebra (1765)；Intervertebral disk of fourth cervical vertebra (626)；Intervertebral disk of fifth cervical vertebra (629)；Intervertebral disk of sixth cervical vertebra (850)；Intervertebral disk of seventh cervical vertebra (828)；Intervertebral disk of first thoracic vertebra (950)；Intervertebral disk of second thoracic vertebra (1128)；Intervertebral disk of third thoracic vertebra (1410)

**示意空間（23）：** Right quadrangular space (8)；Right triangular space (8)；Right triangular interval (8)；Right clavipectoral triangle (352)；Right axillary fossa (8)；Right carpal tunnel (122)；Right tarsal tunnel (162)；Right cubital fossa (352)；Right anatomical snuffbox (240)；Right adductor hiatus (8)；Right suboccipital triangle (352)；Left quadrangular space (8)；Left triangular space (8)；Left triangular interval (8)；Left clavipectoral triangle (352)；Left axillary fossa (8)；Left carpal tunnel (122)；Left tarsal tunnel (162)；Left cubital fossa (352)；Left anatomical snuffbox (210)；Left adductor hiatus (8)；Left suboccipital triangle (352)；Aortic hiatus (148)

## 附錄 B：`joints.glb` 的關節組織名稱（204 種，左右各一者算一種）

Acetabular labrum；Acromioclavicular ligament；Annular ligament of radius；Anterior cruciate ligament；Anterior ligament of fibular head；Anterior longitudinal ligament；Anterior meniscotibial ligament (Lateral meniscus)；Anterior meniscotibial ligament (Medial meniscus)；Anterior sacro-iliac ligament；Anterior sternoclavicular ligament；Anterior talocalcaneal ligament；Anterior tibiofibular ligament；Arcuate popliteal ligament；Articular capsule of acromioclavicular joint；Articular capsule of elbow joint；Articular capsule of glenohumeral joint；Articular capsule of hip joint；Articular capsule of interphalangeal joint of great toe；Articular capsule of knee joint；Articular capsule of radiocarpal joint；Articular capsule of sternoclavicular joint；Articular capsule of superior tibiofibular joint；Articular capsule of temporomandibular joint；Articular capsules of distal interphalangeal joints；Articular capsules of distal interphalangeal joints of foot；Articular capsules of metacarpophalangeal joints；Articular capsules of metatarsophalangeal joints；Articular capsules of proximal interphalangeal joints；Articular capsules of proximal interphalangeal joints of foot；Articular disc of acromioclavicular joint；Articular disc of distal radio-ulnar joint；Articular disc of sternoclavicular joint；Articular disc of temporomandibular joint；Calcaneocuboid ligament；Calcaneonavicular ligament；Collateral interphalangeal ligaments of foot；Collateral interphalangeal ligaments of hand；Collateral metacarpophalangeal ligaments；Collateral metatarsophalangeal ligaments；Conoid ligament；Coracohumeral ligament；Costotransverse ligament；Cricopharyngeal ligament；Cuneocuboid interosseous ligament；Cuneometatarsal interosseous ligaments；Deep part of tibial collateral ligament；Deep transverse metacarpal ligament；Deep transverse metatarsal ligament；Descending part of iliofemoral ligament；Dorsal carpometacarpal ligaments；Dorsal cuneonavicular ligaments；Dorsal intercarpal ligaments；Dorsal intercuneiform ligaments；Dorsal metacarpal ligaments；Dorsal metatarsal ligaments；Dorsal radiocarpal ligament；Dorsal scaphotriquetral ligament；Dorsal tarsometatarsal ligaments；Dorsal ulnocarpal ligament；External intercostal membrane；Fibular collateral ligament；Frenula capsulae；Glenoid labrum；Iliolumbar ligament；Inferior glenohumeral ligament；Inferior pubic ligament；Infrapatellar fat pad；Interclavicular ligament；Intercornual ligament；Intercuneiform interosseous ligaments；Internal intercostal membrane；Interosseous membrane of forearm；Interosseous membrane of leg；Interosseous metacarpal ligaments；Interosseous sacro-iliac ligament；Interpubic disc；Intersesamoid ligament；Interspinous ligaments；Intervertebral disc C2-C3；Intervertebral disc C3-C4；Intervertebral disc C4-C5；Intervertebral disc C5-C6；Intervertebral disc C6-C7；Intervertebral disc C7-T1；Intervertebral disc L1-L2；Intervertebral disc L2-L3；Intervertebral disc L3-L4；Intervertebral disc L4-L5；Intervertebral disc L5-S1；Intervertebral disc T1-T2；Intervertebral disc T10-T11；Intervertebral disc T11-T12；Intervertebral disc T12-L1；Intervertebral disc T2-T3；Intervertebral disc T3-T4；Intervertebral disc T4-T5；Intervertebral disc T5-T6；Intervertebral disc T6-T7；Intervertebral disc T7-T8；Intervertebral disc T8-T9；Intervertebral disc T9-T10；Intra-articular ligament of head of rib；Ischiofemoral ligament；Lateral meniscus；Lateral talocalcaneal ligament；Lateral temporomandibular ligament；Lateral thyrohyoid ligament；Ligament of head of femur；Ligamenta flava；Long plantar ligament；Medial meniscus；Medial talocalcaneal ligament；Median cricothyroid ligament；Median thyrohyoid ligament；Meniscopatellar ligament；Metatarsal interosseous ligaments；Middle glenohumeral ligament；Nuchal ligament；Nucleus pulposus C2-C3；Nucleus pulposus C3-C4；Nucleus pulposus C4-C5；Nucleus pulposus C5-C6；Nucleus pulposus C6-C7；Nucleus pulposus C7-T1；Nucleus pulposus L1-L2；Nucleus pulposus L2-L3；Nucleus pulposus L3-L4；Nucleus pulposus L4-L5；Nucleus pulposus L5-S1；Nucleus pulposus T1-T2；Nucleus pulposus T10-T11；Nucleus pulposus T11-T12；Nucleus pulposus T12-L1；Nucleus pulposus T2-T3；Nucleus pulposus T3-T4；Nucleus pulposus T4-T5；Nucleus pulposus T5-T6；Nucleus pulposus T6-T7；Nucleus pulposus T7-T8；Nucleus pulposus T8-T9；Nucleus pulposus T9-T10；Oblique popliteal ligament；Obturator membrane；Palmar carpometacarpal ligaments；Palmar interphalangeal ligaments；Palmar metacarpal ligaments；Palmar radio-ulnar ligament；Palmar scaphotriquetral ligament；Pisotriquetral ligament；Plantar calcaneocuboid ligament；Plantar cuneocuboid ligament；Plantar cuneonavicular ligaments；Plantar intercuneiform ligaments；Plantar interphalangeal ligaments；Plantar metatarsal ligaments；Plantar metatarsophalangeal ligaments；Plantar tarsometatarsal ligaments；Popliteofibular ligament；Posterior cruciate ligament；Posterior ligament of fibular head；Posterior longitudinal ligament；Posterior meniscotibial ligament (Lateral meniscus)；Posterior meniscotibial ligament (Medial meniscus)；Posterior sacro-iliac ligament；Posterior sternoclavicular ligament；Posterior talocalcaneal ligament；Posterior tibiofibular ligament；Posterior tibiotalar ligament；Pubic symphysis；Pubofemoral ligament；Quadrangular membrane；Radial collateral ligament；Radial collateral ligament of wrist joint；Radiate carpal ligament；Radiate ligament of head of rib；Radioscaphocapitate ligament；Sacrococcygeal symphysis；Sacrospinous ligament；Sacrotuberous ligament；Scaphotrapeziotrapezoidal ligament；Sphenomandibular ligament；Stylohyoid ligament；Stylomandibular ligament；Superficial part of tibial collateral ligament；Superior glenohumeral ligament；Superior pubic ligament；Supraspinous ligament；Talocalcaneal interosseous ligament；Talonavicular ligament；Tibiocalcaneal ligament；Tibionavicular ligament；Transverse acetabular ligament；Transverse humeral ligament；Transverse ligament of knee；Transverse part of iliofemoral ligament；Transverse tibiofibular ligament；Trapezoid ligament；Triquetrocapitate ligament；Triradiate cartilage；Ulnar collateral ligament；Ulnar collateral ligament of wrist joint；Ulnocapitate ligament；Ulnolunate ligament；Ulnotriquetral ligament

## 附錄 C：Z-Anatomy 肌肉檔中與本題有關的網格（單位 cm，頂點數為單側）

Common tendon sheath of fibularis muscles (4608)；Plantar tendon sheath of fibularis longus muscle (1920)；Tendon sheath of tibialis posterior muscle (858)；Tendon sheath of flexor hallucis longus (5184)；Tendon sheath of flexor digitorum longus (768)；Tendon sheath of extensor digitorum longus (6192)；Tendon sheath of extensor hallucis longus (1776)；Tendon sheath of tibialis anterior (720)；Tensor fasciae latae (5586)；Tendon of extensor digitorum longus (15552)；Calcaneal tendon (13128)；Medial patellar retinaculum (552)；Lateral patellar retinaculum (444)；Epicranial aponeurosis (60354)；Tendon sheath of flexor carpi radialis (3264)；Common flexor tendon sheath (41904)；Tendon sheath of flexor pollicis longus (9408)；Tendon sheath of extensor pollicis longus (1296)；Tendon sheath - abd pollicis longus - ext pollicis brevis (2040)；Tendon sheath of extensors carpi radialis (6912)；Tendon sheath of extensor digitorum and extensor indicis (7104)；Tendon sheath of extensor digiti minimi manus (1776)；Tendon sheath of extensor carpi ulnaris (2880)；Cruciform part of fibrous sheath of digit of hand (14184)；Synovial sheaths of digits of hand (20928)；Intertubercular tendon sheath (2496)；Lateral intermuscular septum of arm (480)；Deltoid fascia (10623)；Antebrachial fascia (13380)；Extensor retinaculum of wrist (1104)；Brachial fascia (9054)；Medial intermuscular septum of arm (936)；Flexor retinaculum of wrist (1572)；Palmar aponeurosis (3852)；Dorsal fascia of hand (4335)；Superficial transverse metacarpal ligament (576)；Masseteric fascia (1194)；Superficial layer of temporal fascia (2055)；Clavipectoral fascia (3840)；Pectoral fascia (8127)；Transverse intermuscular septum of leg (1485)；Crural fascia (32625)；Anterior intermuscular septum of leg (624)；Superior fibular retinaculum (1956)；Fascia lata (38721)；Superior extensor retinaculum of ankle (780)；Medial femoral intermuscular septum (23139)；Inferior extensor retinaculum of ankle (948)；Inferior fibular retinaculum (105)；Plantar aponeurosis (1218)；Popliteal fascia (1464)；Piriformis fascia (2775)；Lateral femoral intermuscular septum (1764)；Superficial transverse metatarsal ligament (297)；Flexor retinaculum of ankle (2088)；Posterior intermuscular septum of leg (795)；Middle layer of thoracolumbar fascia (480)；Anterior layer of thoracolumbar fascia (528)；Posterior layer of thoracolumbar fascia (939)；Investing abdominal fascia (33318)；Diaphragmatic fascia (14124)；Iliopsoas fascia (4806)；Transversalis fascia (12621)；Superficial investing cervical fascia (10008)；Intermediate tendon of digastric muscle (684)；Inguinal ligament (3168)

## 附錄 D：量測腳本重點

肌肉到止點骨的距離（頂點間最小距離，mm）：伸拇長肌 7.6；縫匠肌 7.0；胸大肌 4.4；股薄肌 3.8；半膜肌 2.6；跟腱到跟骨 1.9；半腱肌 1.8；股二頭肌 1.8；橈側伸腕長肌 1.3；膕肌 1.3；屈指深肌 0.2；其餘大多 0.2–1.0。肱二頭肌短頭到尺骨 26、到橈骨 36（長頭到橈骨 2.4）。足底腱膜最遠端離拇趾近節趾骨 55。
