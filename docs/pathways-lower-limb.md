# Pathways: Lower-limb nerves
# 走向路徑：下肢神經（第 1 批，審核文件）

狀態：**待使用者審核。** 本文件只列路徑規格，不含程式、不改模型、不做動畫。核准後才依此建立「走向動畫」系統與路徑資料檔。本檔放在 `docs/`，不部署。

## 0. 怎麼讀這份文件

### 0.1 範圍

- 第 1 批只做**神經**：腰神經叢（L1–L4）、股神經、閉孔神經、薦神經叢（L4–S4）、坐骨神經（脛神經與總腓神經）、腓腸神經，以及必備結構清單（`docs/paokao-checklist.json`）裡其餘的下肢神經。
- 動脈（由近到遠）與靜脈（由遠到心）留待第 2、3 批。本文件只在必要處提到血管，作為神經的伴行參照。
- 每條路徑固定欄位：起點、經過結構（含孔、管）、要高亮的標誌、分支點與分支順序、各階段支配的肌肉、終點、皮膚感覺區、簡短臨床提示。

### 0.2 狀態標記（對應模型現況）

| 標記 | 意思 |
| --- | --- |
| 有 | 目前 3D 模型有這個網格（BodyParts3D 或補充資料）。名稱照模型現有名稱寫。 |
| 示意 | 模型已有、但是示意模型（資訊卡標示「示意模型」），位置依標誌量測、不是來源圖譜原形。 |
| 缺 | 模型沒有這個結構。處理方式見第 5 節對照表；不憑空捏造。 |
| 待核 | 我無法由已提交的資料確認名稱或有無，請使用者核對。 |

### 0.3 名稱寫法

- 標題與表格：英文在上、中文在下；結構名一律英文＋中文，不混拉丁文。
- 「模型名稱」欄寫**不含左右**的名稱，反引號包住，例如 `Femoral nerve`。實際網格有 Right／Left 兩側（神經網格在資料裡以 `.r`、`.l` 結尾），路徑資料以 `side` 展開，兩側各跑一次；沒有側別的網格（如腰神經叢、薦神經叢，資料裡是 `.j`）左右共用。
- 肌肉與其他結構的模型名稱有兩種現存寫法（例如 `Right gemellus superior` 與 `First lumbrical of right foot`），路徑資料不自行猜，建置時用搜尋索引的正規化名稱比對，無法比對就在檢查腳本報錯。

### 0.4 來源與核對聲明

- 解剖走向以我既有的解剖學知識，用自己的話寫成，並**以公開來源核對**：Gray's Anatomy 1918 版插圖（公有領域，Wikimedia Commons）與 OpenStax Anatomy and Physiology（CC BY 4.0）。
- 聲明格式：**「走向已對照公開來源（Gray 1918／OpenStax）檢查，待使用者核對。」** 不宣稱「已對照某某課本驗證」。
- 本次**沒有下載任何書籍、掃描檔或 PDF**，沒有使用其他來源。凡無法由我已知的公開資料確認的細節，標「待核」並彙整於第 7 節。
- 若之後想引用公開來源以外的圖譜，必須先把來源與授權列給使用者確認。

---

## 1. 路徑資料放哪裡、長什麼樣

### 1.1 位置建議

此 repo 沒有 `src/`。資料檔、生成檔都在 `app/`（例如 `app/mj-paokao.json`、`app/mj-vessel-branches.json`），因此建議：

```
app/data/pathways/
  schema.md                    欄位說明（簡短）
  lower-limb-nerves.json       本批所有神經路徑
  (之後) lower-limb-arteries.json、lower-limb-veins.json
scripts/check-pathways.mjs     建置期檢查（見 1.3）
docs/pathways-lower-limb.md    本審核文件（不部署）
```

理由：與其他結構資料同層，建置時可直接 import；不放 `public/`（不必另外下載，也不會被當成可部署原始檔）。路徑資料的文字說明用自己的話寫，一樣受 `scripts/check-no-notes.mjs` 掃描。

### 1.2 一個路徑的資料形狀（草案）

```json
{
  "id": "femoral-nerve",
  "en": "Femoral nerve", "zh": "股神經",
  "system": "nerve", "bilateral": true,
  "root": "L2–L4",
  "direction": "root-to-periphery",
  "steps": [
    {
      "id": "fn-1",
      "kind": "start | pass | landmark | branch | end",
      "structure": "Femoral nerve",
      "meshes": ["Femoral nerve"],
      "highlight": ["Psoas major", "Iliacus"],
      "dwellMs": 0,
      "text": { "en": "...", "zh": "..." },
      "supplies": ["Iliacus"],
      "skin": null,
      "status": "有 | 示意 | 缺"
    }
  ],
  "branches": [{ "from": "fn-6", "pathId": "saphenous-nerve", "order": 1 }]
}
```

- `kind=branch` 的步驟停約 1 秒，並列出分支名稱與順序；子路徑可接著播放。
- `meshes`：高亮「這一段」的網格（整條神經網格很長時，之後可加 `range: [t0, t1]` 沿網格長度只亮一段，由頂點順序決定；細節留待動畫階段）。
- `highlight`：標誌或周圍結構（其他淡化）。
- `supplies`：此階段支配的肌肉（點亮）。
- `skin`：終點的皮膚感覺區（見第 5.3 節，目前模型缺少皮區資料）。
- `status=缺` 的步驟：動畫跳過該網格高亮，改以文字說明並高亮前後兩個真實標誌，不畫假的線。

### 1.3 建置期檢查（建議，之後 PR 才做）

`scripts/check-pathways.mjs`：每個 `meshes`、`highlight` 都要在模型名稱索引裡找得到，或明確標 `缺`；`supplies` 只能列真實存在的肌肉；步驟順序與分支引用不可斷鏈。只輸出通過／失敗與數量。

---

## 2. 使用者已定的標準解剖決定（路徑資料須遵守）

1. **脛神經與脛後動脈**在小腿後區深層，位於脛後肌後方、屈趾長肌與屈拇長肌之間，一起下行。
2. **股方肌神經**走在雙子肌與閉孔內肌肌腱的深面，貼著髖關節囊。
3. **半腱肌**在**半膜肌**淺層。
4. **梨狀肌下緣出口，由外側到內側**：坐骨神經 → 股後皮神經 → 閉孔內肌神經 → 陰部神經。（臀下神經的位置見第 7 節問題 3。）
5. **坐骨小孔**只通過陰部神經、陰部內血管、閉孔內肌肌腱與閉孔內肌神經。
6. **股三角由外側到內側**：股神經 → 股動脈 → 股靜脈 → 淋巴管；股神經在股鞘外面。
7. **內收肌管內容**：股血管、隱神經、股內側肌神經。
8. **隱神經與大隱靜脈**：在大腿，隱神經走在內收肌管內，**不與大隱靜脈同行**；兩者要到膝內側以下才互相伴行。
9. **跗隧道由前到後**：脛後肌肌腱 → 屈趾長肌肌腱 → 脛後動脈 → 脛後靜脈（兩條，夾著動脈）→ 脛神經 → 屈拇長肌肌腱。

另有四點我採用的標準作法，一併列出請確認：

- 閉孔神經前支走在內收短肌**淺面**（內收長肌與內收短肌之間），後支走在內收短肌**深面**（內收短肌與內收大肌之間）。
- 脛神經在膕窩是膕窩神經血管束中最淺層（神經、靜脈、動脈由淺到深）。
- 總腓神經沿股二頭肌肌腱內側緣下行，繞腓骨頸。
- 腓腸神經由內側腓腸皮神經（脛神經來）與腓腸交通支（總腓神經來）會合而成。

走向已對照公開來源（Gray 1918／OpenStax）檢查，待使用者核對。

---

## 3. 模型現況摘要（與路徑直接相關）

- 神經網格（`nervous.glb`，BodyParts3D 加補充）已有：腰神經叢（含前、後部分支）、薦神經叢、腰薦神經叢；髂腹下神經、髂腹股溝神經（模型名 `Ilio-inguinal nerve`）、生殖股神經與生殖支、股支；外股皮神經；股神經與股神經前皮支；隱神經、隱神經髕下支、隱神經小腿內側皮支；閉孔神經與前、後支；臀上神經；梨狀肌神經；股方肌神經；股後皮神經（含前、後根）；陰部神經；坐骨神經；脛神經；內蹠神經、外蹠神經與蹠側總趾支、固有趾支；總腓神經、腓深神經與肌支、背側趾支；腓淺神經與背側趾支、足內側背側皮神經、足中間背側皮神經；內側腓腸皮神經、腓腸交通支、腓腸神經。
- 已存在的**示意神經**（位置由標誌量測，非原形）：臀下神經、閉孔內肌神經、股內側肌神經、外側腓腸皮神經、足背外側皮神經、腓深神經內側支與外側支。左右分別建立。
- 模型沒有個別的 L1–L4、S1–S4 脊神經根與前支，只有合在一起的 `Lumbar nerves`、`Anterior rami of lumbar nerves`、`Spinal nerves`、`Roots of nerves`（無側別）。
- 資料現況會影響路徑呈現的幾點（已在 `docs/lower-limb-nerves.md` 與 `REVIEW_LOG.md` 記錄）：
  - 脛神經小腿中段離脛後動脈約 26 mm，是動脈本身偏內側 20 mm 所致，動畫在這一段兩者不會貼在一起（待血管批次修正）。
  - 陰部神經是否經閉孔管或坐骨小孔，沒有對應標誌可驗證。
  - 足趾背側與足底趾神經仍有少量頂點擦過骨面。
  - `Common plantar digital branches of medial plantar nerve` 的網格名稱在資料裡右側沒有 `.r` 側別字尾（只有一個無側別與一個 `.l`），需在建置時確認側別歸屬。

---

## 4. 逐條路徑

每條路徑的步驟表欄位：**步驟｜結構（英／中）｜模型名稱｜狀態｜標誌高亮與備註**。「點亮肌肉」、「皮膚感覺區」、「臨床提示」放在表後。

### 4.1 Lumbar plexus (L1–L4)
### 腰神經叢（L1–L4）

腰神經叢由 L1–L4 前支組成（常含 T12 一小部分），位於腰大肌內與後方，分支由腰大肌邊緣穿出。路徑共用的「起點段」：

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| P0-1 | 腰脊神經前支 L1–L4<br>Anterior rami of L1–L4 | `Anterior rami of lumbar nerves`（無側別，整體） | 有（整體；個別 L1–L4 缺） | 高亮腰椎 `First lumbar vertebra`～`Fourth lumbar vertebra` |
| P0-2 | 腰神經叢<br>Lumbar plexus | `Lumbar plexus`、`Branches of anterior part of lumbar plexus`、`Branches of posterior part of lumbar plexus` | 有 | 在腰大肌 `Psoas major` 內、橫突前方；高亮腰大肌 |

腰神經叢前部分支：髂腹下、髂腹股溝、生殖股、閉孔；後部分支：外股皮、股神經（概念上「前、後部」只作動畫分組，不改網格）。

#### 4.1.1 Iliohypogastric nerve
#### 髂腹下神經（T12–L1）

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：L1 前支（含 T12 小部分） | `Iliohypogastric nerve`（起端） | 有 | 高亮 `First lumbar vertebra` |
| 2 | 由腰大肌上部外側緣穿出 | `Psoas major` | 有 | 腰大肌淡化其他 |
| 3 | 斜越腰方肌前面、腎後面 | 腰方肌 Quadratus lumborum | 缺（committed 清單查不到，待核） | 腰方肌缺時，以高亮腰椎橫突與髂嵴代替 |
| 4 | 向外側下行，在髂嵴上方穿過腹橫肌 | 腹橫肌 Transversus abdominis | 缺（待核） | 標誌：`Right iliac crest`（右髂嵴標誌）；左側無此標誌（待核） |
| 5 | 分支點：外側皮支、前皮支 | `Iliohypogastric nerve`（遠端） | 有；兩個皮支個別網格缺 | 停約 1 秒 |
| 6 | 終點：外側皮支 → 臀外側上部皮膚；前皮支 → 恥骨上方皮膚（淺腹股溝環上方） | 皮區 | 缺 | 見 5.3 |

- 支配肌肉：腹內斜肌、腹橫肌下部（兩者模型名稱待核）。
- 臨床提示：下腹部手術（如闌尾切開、疝氣修補）可傷到此神經，造成下腹部皮膚麻木。

#### 4.1.2 Ilioinguinal nerve
#### 髂腹股溝神經（L1）

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：L1 前支 | `Ilio-inguinal nerve`（起端） | 有 | |
| 2 | 腰大肌外側緣穿出，斜越腰方肌與髂肌 | `Psoas major`、`Iliacus` | 有 | 腰方肌缺 |
| 3 | 在髂前上棘附近穿腹橫肌 | 髂前上棘 | 缺（無標誌；為髖骨一部分） | 提案：在 `Right hip bone` 表面著色標示；待核左側 |
| 4 | 進入腹股溝管，沿精索（女性為子宮圓韌帶）外側下行 | 腹股溝管 Inguinal canal | 缺 | 以腹股溝韌帶 `Inguinal ligament`（有，補充資料）作邊界高亮 |
| 5 | 經淺腹股溝環（不經深環）出腹股溝管 | 淺腹股溝環 | 缺 | |
| 6 | 終點：大腿上內側皮膚；男性陰莖根部與陰囊前部，女性陰阜與大陰唇 | 皮區 | 缺 | 見 5.3 |

- 支配肌肉：腹內斜肌與腹橫肌最下部。
- 臨床提示：腹股溝疝修補是最常見的損傷情境，造成腹股溝與生殖器前部感覺異常。

#### 4.1.3 Genitofemoral nerve
#### 生殖股神經（L1–L2）

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：L1–L2 前支 | `Genitofemoral nerve`（起端） | 有 | |
| 2 | 穿過腰大肌，由腰大肌前面穿出 | `Psoas major` | 有 | 與其他神經不同：穿過肌肉而非繞邊緣 |
| 3 | 在腰大肌前面向下，輸尿管後方 | `Genitofemoral nerve` | 有 | 輸尿管名稱待核 |
| 4 | 在腹股溝韌帶上方分支點：生殖支、股支 | `Genital branch of genitofemoral nerve`、`Femoral branch of genitofemoral nerve` | 有 | 停約 1 秒 |
| 5a | 生殖支：經深腹股溝環入腹股溝管，隨精索 | 深腹股溝環、腹股溝管 | 缺 | 同 4.1.2 提案 |
| 5b | 生殖支終點：提睪肌（女性圓韌帶）、陰囊或大陰唇前部皮膚 | 提睪肌 Cremaster | 缺（待核） | |
| 6a | 股支：在腹股溝韌帶後方、股動脈外側入大腿，穿股鞘前層與闊筋膜 | `Femoral sheath`（右股鞘／左股鞘）、`Inguinal ligament` | 有 | 股鞘在模型為 `Right femoral sheath`、`Left femoral sheath` |
| 6b | 股支終點：股三角上部皮膚 | 皮區 | 缺 | 見 5.3 |

- 臨床提示：提睪反射——輕劃大腿內側上方皮膚（股支傳入）引起同側提睪肌收縮（生殖支傳出）。

#### 4.1.4 Lateral femoral cutaneous nerve
#### 外股皮神經（L2–L3）

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：L2–L3 前支（後部） | `Lateral femoral cutaneous nerve`（起端） | 有 | |
| 2 | 由腰大肌外側緣穿出，斜越髂肌前面 | `Psoas major`、`Iliacus` | 有 | |
| 3 | 在髂前上棘內側，經腹股溝韌帶深面（外端）入大腿 | `Inguinal ligament`；髂前上棘缺 | 有／缺 | 標誌：腹股溝韌帶外側端 |
| 4 | 越過縫匠肌表面，穿出闊筋膜 | `Sartorius`、`Tensor fasciae latae` | 有 | 闊筋膜在補充資料（待核） |
| 5 | 分支點：前支、後支 | `Lateral femoral cutaneous nerve`（遠端） | 有（兩支個別缺） | 停約 1 秒 |
| 6 | 終點：大腿前外側至膝外側皮膚（前支）；大腿外側面（後支） | 皮區 | 缺 | |

- 支配肌肉：無（純感覺）。
- 臨床提示：緊身腰帶或髂前上棘處壓迫可引起大腿前外側灼熱麻木，稱感覺異常性股痛。

---

### 4.2 Femoral nerve (L2–L4)
### 股神經（L2–L4）

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：L2–L4 前支後股，在腰大肌內合成 | `Femoral nerve`（起端）、`Lumbar plexus` | 有 | |
| 2 | 由腰大肌外側緣穿出，走在腰大肌與髂肌之間的溝，髂筋膜下 | `Psoas major`、`Iliacus` | 有 | 髂腰肌 `Right tendon of iliopsoas` 可作遠端參照 |
| 2a | 分支（骨盆內）：髂肌肌支（髂肌）、腰大肌小支 | 個別分支 | 缺 | 動畫用文字帶過 |
| 3 | 在腹股溝韌帶深面、髂腰肌表面通過，位於股鞘外側 | `Inguinal ligament`、`Femoral sheath` | 有 | 高亮腹股溝韌帶；神經在股鞘**外**（標準決定 6） |
| 4 | 進入股三角：由外向內依序神經、動脈、靜脈、淋巴管 | `Femoral artery`、`Femoral vein`（股三角本身為缺） | 有（血管）／缺（空間） | 股三角以腹股溝韌帶、縫匠肌 `Sartorius`、內收長肌 `Adductor longus` 三個邊界高亮，不另畫立體 |
| 5 | **分支點（股三角內，約在腹股溝韌帶下 3–4 cm）**：前股、後股 | `Femoral nerve`（遠端） | 有 | 停約 1 秒 |

#### 前股（前支）分支順序

| 序 | 分支 | 模型名稱 | 狀態 | 終點 |
| --- | --- | --- | --- | --- |
| a | 股中間皮神經、股內側皮神經 | `Anterior cutaneous branches of femoral nerve`（合為一個網格） | 有（兩支合併；個別缺） | 大腿前面至內側皮膚 |
| b | 縫匠肌支 | 個別分支缺；肌肉 `Sartorius` | 缺 | 縫匠肌 |
| c | 恥骨肌支（有時由閉孔神經副支） | 個別分支缺；肌肉 `Pectineus` | 缺 | 恥骨肌 |

#### 後股（後支）分支順序

| 序 | 分支 | 模型名稱 | 狀態 | 終點 |
| --- | --- | --- | --- | --- |
| d | 股直肌支 | 個別分支缺；`Rectus femoris` | 缺 | 股直肌 |
| e | 股外側肌支（含髖、膝關節支） | 個別分支缺；`Vastus lateralis` | 缺 | 股外側肌 |
| f | 股中間肌支（含膝關節支） | 個別分支缺；`Vastus intermedius` | 缺 | 股中間肌 |
| g | **股內側肌神經**：與股血管一起入內收肌管 | `Nerve to vastus medialis` | 示意 | 股內側肌 `Vastus medialis` |
| h | **隱神經**：入內收肌管（見 4.2.1） | `Saphenous nerve` | 有 | 小腿內側與足內側緣 |

- 支配肌肉總表：髂肌（骨盆內）、縫匠肌、恥骨肌、股四頭肌四條（股直肌、股外側肌、股中間肌、股內側肌）。
- 皮膚感覺區：大腿前面、內側（前皮支）；小腿內側與足內緣（隱神經）。
- 臨床提示：股神經受損時膝無法伸直、上樓困難，大腿前面與小腿內側感覺減退，膝反射消失。

#### 4.2.1 Saphenous nerve
#### 隱神經（股神經最長的感覺支）

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：股神經後股，在股三角內 | `Saphenous nerve`（起端） | 有 | |
| 2 | 在股三角尖端進入內收肌管（Hunter 管） | 內收肌管 Adductor canal | 缺（無空間模型） | 以縫匠肌 `Sartorius`（頂）、股內側肌 `Vastus medialis`（外側）、內收長肌與內收大肌 `Adductor longus`／`Adductor magnus`（後）三面高亮，內容物高亮 `Femoral artery`、`Femoral vein`、`Saphenous nerve`、`Nerve to vastus medialis`（標準決定 7） |
| 3 | 在管內自股動脈**外側**跨到**前面**再到內側 | `Femoral artery` | 有 | 提示：此時隱神經**不**伴大隱靜脈 |
| 4 | 在管的下端離開股血管（血管穿內收肌裂孔往後），隱神經與膝降動脈隱支一起穿出，在縫匠肌與股薄肌肌腱之間穿深筋膜 | `Right adductor hiatus`／`Left adductor hiatus`（內收肌裂孔空間，示意）、`Gracilis`、`Sartorius` | 有 | 標誌：內收肌裂孔、縫匠肌與股薄肌之間 |
| 5 | 分支點（膝內側）：髕下支 → 繞脛骨內髁向前橫越髕韌帶前方 | `Infrapatellar branch of saphenous nerve` | 有 | 標誌：`Right tibial tuberosity`（右脛骨粗隆；左側待核）、髕韌帶 `Right patellar ligament` |
| 6 | 主幹在膝內側以下**開始與大隱靜脈同行**，沿脛骨內側緣下行 | `Great saphenous vein`（大隱靜脈）、`Tibia` | 有 | 兩者此後伴行；模型量測：主幹離脛骨內緣約 4.5 mm（骨外） |
| 7 | 小腿內側皮支 | `Medial crural cutaneous branches of saphenous nerve` | 有 | 小腿前內側皮膚 |
| 8 | 經內踝前方（標誌：內踝） | 內踝 Medial malleolus | 缺（無標誌；為脛骨一部分） | 提案：在 `Tibia` 表面著色標示內踝區 |
| 9 | 終點：沿足內側緣到第一蹠趾關節附近 | （無足部延伸網格，主幹止於足內側） | 有；足內側延伸待核 | 皮區：足內緣至大趾基部 |

- 臨床提示：取大隱靜脈或膝內側手術可傷到隱神經，造成小腿內側與足內緣麻木或刺痛。

---

### 4.3 Obturator nerve (L2–L4)
### 閉孔神經（L2–L4）

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：L2–L4 前支前股，在腰大肌內合成 | `Obturator nerve`（起端）、`Lumbar plexus` | 有 | |
| 2 | 由腰大肌內側緣穿出，在骨盆緣處越薦髂關節前面，位於髂總血管後方 | `Psoas major`、`Right common iliac artery` | 有 | |
| 3 | 沿骨盆側壁（閉孔內肌表面）向前下 | `Obturator internus`、`Right hip bone` | 有 | 閉孔內肌淺面 |
| 4 | 經**閉孔管**（閉孔上部、閉孔溝與閉孔膜上緣之間）出骨盆 | 閉孔管 Obturator canal、閉孔 Obturator foramen | 缺（無標誌）；`Obturator membrane` 有（補充資料） | 提案：以閉孔膜 `Obturator membrane`、髖骨 `Right hip bone` 作邊界高亮，在髖骨表面著色閉孔區（見第 5 節）；目前資料無法驗證神經是否過閉孔管 |
| 5 | 在閉孔管出口附近**分支點**：前支、後支 | `Obturator nerve`（遠端） | 有 | 停約 1 秒 |

#### 前支（Anterior branch）

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 6a | 越過閉孔外肌上緣，走在恥骨肌與內收長肌**深面**、內收短肌**淺面** | `Anterior branch of obturator nerve`、`Obturator externus`、`Adductor brevis` | 有 | 標準：前支在內收短肌**前面**（淺面） |
| 7a | 肌支：內收長肌、股薄肌、（常有）內收短肌 | `Adductor longus`、`Gracilis`、`Adductor brevis` | 有（肌肉）；個別肌支缺 | 點亮 |
| 8a | 髖關節支 | 缺 | 缺 | 文字帶過 |
| 9a | 皮支（在股薄肌下穿出） | 缺 | 缺 | 皮區：大腿內側下部（見 5.3） |

#### 後支（Posterior branch）

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 6b | 穿過閉孔外肌，走在內收短肌**深面**、內收大肌**淺面** | `Posterior branch of obturator nerve`、`Obturator externus`、`Adductor brevis`、`Adductor magnus` | 有 | 標準：後支在內收短肌**後面**（深面） |
| 7b | 肌支：閉孔外肌、內收大肌（內收部分）、（偶爾）內收短肌 | `Obturator externus`、`Adductor magnus`、`Adductor brevis` | 有（肌肉）；個別肌支缺 | 點亮 |
| 8b | 膝關節支：隨股動脈穿內收肌裂孔入膕窩，終止於膝關節後部 | `Right adductor hiatus`／`Left adductor hiatus`（空間示意） | 缺（分支）／有（空間） | 文字帶過 |

- 皮膚感覺區：大腿內側中下部（個體差異大）。
- 臨床提示：骨盆骨折、閉孔疝或生產時損傷，會使大腿內收無力、走路時腿不易併攏，大腿內側麻木。
- 變異：副閉孔神經（L3–L4）約 10% 的人有，走在腰大肌內側緣，跨恥骨上支到恥骨肌——模型缺，不納入動畫，只在文字提及。

---

### 4.4 Sacral plexus (L4–S4)
### 薦神經叢（L4–S4）

薦神經叢位於骨盆後壁梨狀肌前面；除一部分小分支外，大多數經大坐骨孔離開骨盆。

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| P1 | 腰薦幹（L4 後部加 L5）與 S1–S4 前支 | `Lumbosacral plexus`（無側別）、`Anterior rami of lumbar nerves` | 有（整體；腰薦幹與個別 S1–S4 缺） | 高亮 `Sacrum` |
| P2 | 薦神經叢，在梨狀肌前面匯合 | `Sacral plexus`（無側別）、`Piriformis` | 有 | 高亮梨狀肌 |
| P3 | 經**大坐骨孔**出骨盆：梨狀肌上方（上孔）、下方（下孔） | 大坐骨孔 Greater sciatic foramen | 缺（無標誌） | 邊界：`Sacrospinous ligament`、`Sacrotuberous ligament`（補充資料）、`Right hip bone`、`Piriformis` 高亮；`Right spine of ischium`（右坐骨棘標誌）；左側標誌待核 |

#### 4.4.1 Superior gluteal nerve (L4–S1)
#### 臀上神經（L4–S1）

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：L4–S1 後股 | `Superior gluteal nerve`（起端） | 有 | |
| 2 | 經大坐骨孔**梨狀肌上緣**（梨狀肌上孔），與臀上血管同行 | `Piriformis`、`Superior gluteal nerve` | 有 | 模型量測已確認在梨狀肌上方約 2 mm（`check-nerve-course` 強制）；臀上動脈 `Right superior gluteal artery`（待核名稱） |
| 3 | 在臀中肌與臀小肌之間向外側 | `Gluteus medius`、`Gluteus minimus` | 有 | |
| 4 | 分支點：上支、下支 | `Superior gluteal nerve`（遠端） | 有 | 停約 1 秒 |
| 5 | 終點：臀中肌、臀小肌、闊筋膜張肌 | `Gluteus medius`、`Gluteus minimus`、`Tensor fasciae latae` | 有 | 點亮；純運動神經，無皮區 |

- 臨床提示：臀上神經受損導致臀中肌無力，單腳站立時對側骨盆下垂（Trendelenburg 徵象）。

#### 4.4.2 Inferior gluteal nerve (L5–S2)
#### 臀下神經（L5–S2）

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：L5–S2 後股 | `Inferior gluteal nerve` | 示意 | 左右各一，位置依標誌量測 |
| 2 | 經大坐骨孔**梨狀肌下緣**（梨狀肌下孔） | `Piriformis`、`Inferior gluteal nerve` | 示意 | 模型已確認在梨狀肌下方約 3 mm（強制檢查） |
| 3 | 進入臀大肌深面，分成多條肌支 | `Gluteus maximus` | 有 | |
| 4 | 終點：臀大肌 | `Gluteus maximus` | 有 | 點亮；無皮區 |

- 臨床提示：受損時由坐姿起身、爬樓梯、跑步時伸髖無力。

#### 4.4.3 Posterior femoral cutaneous nerve (S1–S3)
#### 股後皮神經（S1–S3）

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：S1–S3，前根與後根（模型分成兩根） | `Anterior root of posterior femoral cutaneous nerve`、`Posterior root of posterior femoral cutaneous nerve`、`Posterior femoral cutaneous nerve` | 有 | |
| 2 | 經大坐骨孔梨狀肌下緣，位於坐骨神經內側（標準決定 4：坐骨神經 → 股後皮神經 → 閉孔內肌神經 → 陰部神經，由外到內） | `Piriformis` | 有 | |
| 3 | 在臀大肌深面下行，越過坐骨結節與股方肌後面，走在股二頭肌長頭表面 | `Gluteus maximus`、`Long head of biceps femoris`、`Right ischial tuberosity`（右坐骨結節標誌） | 有 | 左側標誌待核 |
| 4 | 分支點（臀大肌下緣）：臀下皮支、會陰支；主幹續行 | 個別分支缺（下臀皮神經 Inferior cluneal nerves、會陰支 Perineal branch） | 缺 | 文字帶過 |
| 5 | 主幹在闊筋膜深面沿大腿後正中下行，至膕窩 | `Posterior femoral cutaneous nerve` | 有 | |
| 6 | 終點：臀下部、會陰與陰囊／大陰唇外側、大腿後面、膕窩與小腿上後面皮膚 | 皮區 | 缺 | |

- 支配肌肉：無（純感覺）。
- 臨床提示：長時間久坐壓迫坐骨結節可引起大腿後面感覺異常。

#### 4.4.4 Nerve to piriformis (S1–S2)
#### 梨狀肌神經（S1–S2）

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：S1–S2 後股 | `Nerve to piriformis muscle` | 有 | |
| 2 | 終點：直接進入梨狀肌前面（不經孔） | `Piriformis` | 有 | 點亮 |

（此神經不在必備結構清單，因模型已有而列出；若不需要可刪。）

#### 4.4.5 Nerve to obturator internus (L5–S2)
#### 閉孔內肌神經（L5–S2）

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：L5–S2 前股 | `Nerve to obturator internus` | 示意 | |
| 2 | 經大坐骨孔梨狀肌下緣，位於陰部神經外側 | `Piriformis` | 示意 | 梨狀肌下緣出口由外到內的第三位（標準決定 4） |
| 3 | 繞坐骨棘，經**坐骨小孔**回到骨盆外下方 | 坐骨小孔 Lesser sciatic foramen | 缺（無標誌） | 邊界：`Sacrospinous ligament`、`Sacrotuberous ligament`；標準決定 5：此孔只通過陰部神經、陰部內血管、閉孔內肌肌腱與閉孔內肌神經 |
| 4 | 終點：閉孔內肌（盆腔內面）；上雙子肌 | `Obturator internus`、`Gemellus superior` | 有 | 點亮 |

注意：標準解剖一般把這條神經描述為「由梨狀肌下方出骨盆後，繞坐骨棘，經坐骨小孔再入骨盆支配閉孔內肌」。此為使用者決定的標準，已採用。

#### 4.4.6 Nerve to quadratus femoris (L4–S1)
#### 股方肌神經（L4–S1）

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：L4–S1 前股 | `Nerve to quadratus femoris muscle` | 有 | 與下雙子肌神經同源 |
| 2 | 經梨狀肌下緣，在**坐骨神經深面** | `Sciatic nerve`、`Piriformis` | 有 | |
| 3 | 下行，位於上雙子肌、閉孔內肌肌腱、下雙子肌的**深面**，貼髖關節囊後面（標準決定 2） | `Gemellus superior`、`Obturator internus`、`Gemellus inferior`、`Articular capsule of hip joint` | 有 | 淡化其他，高亮髖關節囊；模型有 27 個頂點貼骨面的情形（左側較多），顯示時屬正常誤差 |
| 4 | 分支：下雙子肌支、髖關節支 | 個別分支缺 | 缺 | 文字帶過 |
| 5 | 終點：股方肌 | `Quadratus femoris` | 有 | 點亮 |

#### 4.4.7 Pudendal nerve (S2–S4)
#### 陰部神經（S2–S4）

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：S2–S4 前支 | `Pudendal nerve`（起端） | 有 | 位置由資料量測，無標誌可驗證 |
| 2 | 經大坐骨孔梨狀肌下緣，在最內側（標準決定 4） | `Piriformis` | 有 | |
| 3 | 越過坐骨棘與薦棘韌帶後面，位於陰部內血管內側 | `Right spine of ischium`（坐骨棘標誌）、`Sacrospinous ligament` | 有（標誌右）；左待核 | 高亮坐骨棘與薦棘韌帶 |
| 4 | 經坐骨小孔回到會陰，進入陰部管（Alcock 管） | 坐骨小孔、陰部管 Pudendal canal | 缺 | 陰部管為閉孔內肌筋膜形成的管，模型無；僅文字帶過 |
| 5 | 分支點：直腸下神經 → 會陰神經 → 陰莖（陰蒂）背神經 | 個別分支缺 | 缺 | 見 5 節提案 |
| 6 | 終點：肛門外括約肌與肛周皮膚；會陰肌（球海綿體肌、坐骨海綿體肌）與陰囊（大陰唇）後部；陰莖（陰蒂）背側 | 皮區與會陰肌 | 缺 | 本批只做到分支點，終點以文字說明 |

- 臨床提示：生產時的陰部神經阻斷麻醉，以坐骨棘為標誌；此處受壓可造成會陰感覺異常與大小便控制問題。

---

### 4.5 Sciatic nerve (L4–S3)
### 坐骨神經（L4–S3）

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：L4–S3 前支，在梨狀肌前面合成（內含脛部與總腓部，同一鞘） | `Sciatic nerve`（起端）、`Sacral plexus` | 有 | |
| 2 | 經大坐骨孔梨狀肌**下緣**出骨盆，位於同孔神經中最外側 | `Piriformis` | 有 | 模型量測：神經高度在梨狀肌下緣以下約 8 mm（通過） |
| 3 | 在臀大肌深面，越過上雙子肌、閉孔內肌肌腱、下雙子肌與股方肌後面，約在坐骨結節與大轉子連線的中點 | `Gemellus superior`、`Obturator internus`、`Gemellus inferior`、`Quadratus femoris`、`Gluteus maximus`、`Right ischial tuberosity` | 有 | 標誌：坐骨結節、大轉子（大轉子為股骨一部分，缺標誌） |
| 4 | 進入大腿後區，在股二頭肌長頭**深面**、內收大肌後面下行 | `Long head of biceps femoris`、`Adductor magnus`、`Semitendinosus`、`Semimembranosus` | 有 | 標準決定 3：半腱肌淺於半膜肌 |
| 5 | **肌支（在大腿，由脛部發出）**：半腱肌、半膜肌、股二頭肌長頭、內收大肌的坐骨部；**股二頭肌短頭由總腓部發出** | 個別肌支缺 | 缺 | 點亮：`Semitendinosus`、`Semimembranosus`、`Long head of biceps femoris`、`Adductor magnus`、`Short head of biceps femoris` |
| 6 | **分支點：在膕窩上角（高度個體差異大，有些人高至骨盆）分成脛神經與總腓神經** | `Tibial nerve`、`Common fibular nerve` | 有 | 停約 1 秒；標誌：膕窩（缺，見 5 節），邊界以股二頭肌、半膜肌（半腱肌）、腓腸肌兩頭高亮 |

- 皮膚感覺區：無直接皮支（皮區由下列分支負責）。
- 臨床提示：臀部肌肉內注射應在外上象限，避開坐骨神經；髖後脫位或骨折可傷到坐骨神經，足下垂（總腓部較常受損）。

#### 4.5.1 Tibial nerve (L4–S3)
#### 脛神經

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：坐骨神經分叉點 | `Tibial nerve`（起端） | 有 | |
| 2 | 進入**膕窩**，是膕窩內神經血管束中最淺者（神經在靜脈與動脈後方偏淺） | 膕窩 Popliteal fossa（空間缺）、`Popliteal vein`、`Popliteal artery` | 缺（空間）／有（血管） | 邊界：`Long head of biceps femoris`、`Semimembranosus`、`Semitendinosus`、`Lateral head of gastrocnemius`、`Medial head of gastrocnemius` |
| 3 | **分支點（膕窩內）**：內側腓腸皮神經（見 4.6）、膝關節支、肌支（腓腸肌兩頭、蹠肌、比目魚肌、膕肌） | `Medial sural cutaneous nerve`；肌肉 `Medial head of gastrocnemius`、`Lateral head of gastrocnemius`（模型以內、外側頭兩個網格呈現，名稱含 left／right 在中間，如 `Medial head of right gastrocnemius`）、`Plantaris`、`Soleus`、`Popliteus` | 有（皮神經）／缺（肌支與關節支） | 點亮腓腸肌兩頭、蹠肌、比目魚肌、膕肌 |
| 4 | 由比目魚肌腱弓深面進入小腿後區深層 | 比目魚肌腱弓 | 缺（無標誌） | `Soleus` 淡化 |
| 5 | 在脛後肌後面下行，位於屈趾長肌與屈拇長肌之間，與脛後動脈同行（標準決定 1） | `Tibialis posterior`、`Flexor digitorum longus`、`Flexor hallucis longus`、`Posterior tibial artery`（待核名稱） | 有 | 肌支：脛後肌、屈趾長肌、屈拇長肌（個別肌支缺）；模型小腿中段脛神經離動脈約 26 mm（已知，動脈偏內） |
| 6 | 經內踝後方，進入**跗隧道**（屈肌支持帶下）；隧道內由前到後：脛後肌腱 → 屈趾長肌腱 → 脛後動脈 → 脛後靜脈（兩條） → 脛神經 → 屈拇長肌腱 | `Right tarsal tunnel`／`Left tarsal tunnel`（空間示意）、`Right flexor retinaculum of ankle`／`Left flexor retinaculum of ankle`、`Right tendon of tibialis posterior`、`Right tendon of flexor digitorum longus`、`Right tendon of flexor hallucis longus`（左側同名） | 有 | 模型量測脛神經貼近跗隧道 0.3 mm（強制檢查）；標誌：內踝（缺標誌）；跗隧道內脛後靜脈是否為兩條，待核 |
| 7 | **分支點（隧道內或近端）**：內側跟骨支（跟內側皮膚）；終支：內蹠神經、外蹠神經 | 內側跟骨支缺；`Medial plantar nerve`、`Lateral plantar nerve` | 缺（跟骨支）／有 | 停約 1 秒 |

##### 4.5.1.1 Medial plantar nerve — 內蹠神經
| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：跗隧道內脛神經分叉 | `Medial plantar nerve` | 有 | |
| 2 | 進足底，在拇展肌深面，沿拇展肌與屈趾短肌之間向前 | `Abductor hallucis`、`Flexor digitorum brevis` | 有 | |
| 3 | 肌支：拇展肌、屈趾短肌、屈拇短肌、第一蚓狀肌 | `Abductor hallucis`、`Flexor digitorum brevis`、`Medial head of flexor hallucis brevis`、`Lateral head of flexor hallucis brevis`（實際名稱形如 `Medial head of right flexor hallucis brevis`）、`First lumbrical of foot`（實際名稱形如 `First lumbrical of right foot`） | 有（肌肉）；個別肌支缺 | 點亮 |
| 4 | 分支點：蹠側總趾神經（約三條） | `Common plantar digital branches of medial plantar nerve` | 有（右側側別待核） | 停約 1 秒 |
| 5 | 終點：蹠側固有趾神經到內側三趾半（大趾至第四趾內側半）的趾尖，及足底內側皮膚 | `Proper plantar digital branches of medial plantar nerve` | 有 | 皮區：足底內側 2/3 與內側三趾半（見 5.3）；右側有 132 個擦骨頂點 |

##### 4.5.1.2 Lateral plantar nerve — 外蹠神經
| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：跗隧道內脛神經分叉 | `Lateral plantar nerve` | 有 | |
| 2 | 斜向外側，在屈趾短肌與蹠方肌之間 | `Flexor digitorum brevis`、蹠方肌 Quadratus plantae（已提交清單查不到） | 有／缺（蹠方肌待核） | |
| 3 | 肌支（近端）：蹠方肌、小趾展肌 | 蹠方肌 Quadratus plantae（已提交清單查不到）、`Abductor digiti minimi of foot`（實際名稱形如 `Abductor digiti minimi of right foot`） | 待核（名稱）／有 | |
| 4 | **分支點**：淺支、深支 | 兩支個別缺 | 缺 | 停約 1 秒 |
| 5a | 淺支：小趾短屈肌、第四蹠間隙骨間肌；蹠側總趾神經 → 固有趾神經到外側一趾半（小趾與第四趾外側半） | `Flexor digiti minimi brevis of foot`（實際名稱形如 `Flexor digiti minimi brevis of right foot`）、`Common plantar digital branches of lateral plantar nerve`、`Proper plantar digital branches of lateral plantar nerve` | 有 | 皮區：足底外側 1/3 與外側一趾半 |
| 5b | 深支：與外側蹠動脈弓（足底深弓）一起深入，支配拇內收肌、其餘骨間肌、第二至四蚓狀肌 | `Oblique head of adductor hallucis`、`Transverse head of adductor hallucis`、`Second lumbrical of foot`、`Third lumbrical of foot`、`Fourth lumbrical of foot`、`First plantar interosseous of foot`～`Third plantar interosseous of foot`（實際名稱含 right／left） | 有／缺（深支網格缺；足底深弓待血管批次） | 點亮 |

- 臨床提示：跗隧道症候群造成足底麻木與灼熱；腰椎或膕窩病變造成脛神經損傷時，足無法蹠屈與足趾彎曲，足底感覺消失，跟腱反射消失。

#### 4.5.2 Common fibular nerve (L4–S2)
#### 總腓神經

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：坐骨神經分叉點（腓部） | `Common fibular nerve`（起端） | 有 | |
| 2 | 沿股二頭肌肌腱**內側緣**下行 | `Long head of biceps femoris`（股二頭肌肌腱的獨立網格，待核） | 有 | 模型量測貼股二頭肌肌腱 0.2 mm |
| 3 | 越過腓腸肌外側頭表面，進入膕窩外側 | `Lateral head of gastrocnemius` | 有 | |
| 4 | **分支點（膕窩內）**：外側腓腸皮神經（見 4.6）、腓腸交通支（見 4.6）、膝關節支、返支 | `Lateral sural cutaneous nerve`、`Sural communicating branch of common fibular nerve` | 示意（外側腓腸皮神經）／有 | 關節支、返支缺 |
| 5 | **繞腓骨頸**（腓骨頸外側表面、腓骨長肌深面）：最易受傷處 | 腓骨頸 Neck of fibula | 缺（無標誌；為腓骨一部分） | 模型量測總腓神經末端離腓骨 12.5 mm、腓深神經繞腓骨頸通過（強制檢查）；提案：在 `Fibula` 表面著色腓骨頸區 |
| 6 | **終端分支點**：腓淺神經、腓深神經 | `Superficial fibular nerve`、`Deep fibular nerve` | 有 | 停約 1 秒 |

- 臨床提示：總腓神經受損（腓骨頸骨折、石膏或護具壓迫）造成足下垂（無法足背屈）、行走時抬高膝（跨閾步態），小腿外側與足背麻木。
- 股二頭肌短頭由總腓神經支配（在坐骨神經段標示）。

##### 4.5.2.1 Superficial fibular nerve — 腓淺神經
| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：總腓神經，腓骨頸處 | `Superficial fibular nerve`（起端） | 有 | |
| 2 | 進小腿外側區，在腓骨長肌與腓骨短肌之間，再到趾長伸肌前面 | `Fibularis longus`、`Fibularis brevis`、`Extensor digitorum longus` | 有 | 模型量測在腓骨外側約 8 mm |
| 3 | 肌支：腓骨長肌、腓骨短肌 | 個別肌支缺 | 缺 | 點亮兩條腓骨肌 |
| 4 | 在小腿下三分之一穿出深筋膜（皮下） | 小腿筋膜 Crural fascia | 缺（待核，補充資料有名稱） | |
| 5 | 經伸肌支持帶前方，跨踝前 | `Right superior extensor retinaculum of foot`、`Right inferior extensor retinaculum of foot`（左側同名） | 有 | |
| 6 | **分支點**：足內側背側皮神經、足中間背側皮神經 | `Medial dorsal cutaneous nerve of foot`、`Intermediate dorsal cutaneous nerve of foot` | 有 | 停約 1 秒 |
| 7 | 終點：背側趾神經到各趾背側（趾尖附近） | `Dorsal digital branches of superficial fibular nerve` | 有 | 皮區：足背大部、第二至第五趾背側（大趾與第二趾相鄰側除外，由腓深神經）；擦骨頂點左 182／右 334 個 |

##### 4.5.2.2 Deep fibular nerve — 腓深神經
| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：總腓神經，腓骨頸處 | `Deep fibular nerve`（起端） | 有 | |
| 2 | 繞腓骨頸，穿腓骨長肌與前肌間隔入小腿前區 | 腓骨頸（缺）、`Fibularis longus` | 有／缺 | |
| 3 | 在小腿前區，走在骨間膜前面，與脛前動脈同行（上、下三分之一在其外側，中段在前） | `Interosseous membrane of leg`、`Anterior tibial artery`（待核名稱） | 有 | 模型量測貼骨間膜前 19 mm、離脛前動脈 7 mm |
| 4 | 肌支：脛前肌、伸拇長肌、趾長伸肌、第三腓骨肌 | `Muscular branches of deep fibular nerve`（模型只有一個網格，為踝前外側肌支） | 有（一個）；個別缺 | 點亮：`Tibialis anterior`、`Extensor hallucis longus`、`Extensor digitorum longus`、`Fibularis tertius` |
| 5 | 在伸肌支持帶下通過踝前，位於內、外踝之間 | `Right superior extensor retinaculum of foot`、`Right inferior extensor retinaculum of foot` | 有 | 模型量測在內外踝之間；標誌：內踝、外踝（缺標誌） |
| 6 | **終端分支點（踝前）**：外側支、內側支 | `Lateral branch of deep fibular nerve`、`Medial branch of deep fibular nerve` | 示意 | 停約 1 秒 |
| 7a | 外側支：支配伸趾短肌、伸拇短肌，並給踝與附近關節的關節支 | `Extensor hallucis brevis`；伸趾短肌 Extensor digitorum brevis（已提交清單查不到） | 有／缺（伸趾短肌在已提交清單中查不到） | 與 `Muscular branches of deep fibular nerve` 的關係，待核（見問題 5） |
| 7b | 內側支：沿足背動脈外側到第一趾蹼，分成背側趾神經到第一、二趾相鄰側 | `Dorsal digital branches of deep fibular nerve` | 有 | 皮區：第一趾蹼（大趾與第二趾相鄰側）背側 |

- 臨床提示：前室症候群與腓深神經損傷，造成足背屈與伸趾無力（足下垂）、第一趾蹼麻木；穿鞋過緊壓迫伸肌支持帶下可引起前跗隧道症候群。

---

### 4.6 Sural nerve
### 腓腸神經

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1a | 起點一：脛神經在膕窩的皮支 → 內側腓腸皮神經 | `Medial sural cutaneous nerve` | 有 | |
| 1b | 起點二：總腓神經 → 外側腓腸皮神經與腓腸交通支 | `Lateral sural cutaneous nerve`、`Sural communicating branch of common fibular nerve` | 示意（外側腓腸皮神經）／有 | |
| 2 | 內側腓腸皮神經沿腓腸肌兩頭之間的溝下行，在小腿中部穿出深筋膜 | `Medial head of gastrocnemius`、`Lateral head of gastrocnemius` | 有 | 小腿筋膜缺 |
| 3 | **會合點**：腓腸交通支與內側腓腸皮神經在小腿中下部會合成腓腸神經 | `Sural nerve` | 有 | 停約 1 秒 |
| 4 | 在跟腱外側下行，與小隱靜脈同行 | `Calcaneal tendon`（跟腱）、`Small saphenous vein` | 有 | |
| 5 | 經外踝後方（模型量測在外踝後緣約 8 mm） | 外踝 Lateral malleolus | 缺（無標誌） | 提案：在 `Fibula` 表面著色外踝區 |
| 6 | 終點：足背外側皮神經 → 足外側緣與小趾外側 | `Lateral dorsal cutaneous nerve` | 示意 | 皮區：小腿後外側下部、足外側緣、小趾外側 |

- 臨床提示：腓腸神經常被取做神經移植；跟腱手術或外踝骨折可傷到，造成足外緣麻木。

---

### 4.7 其餘必備清單中的下肢神經（已併入上列路徑，這裡列對照）

| 清單項目 | 併入路徑 | 模型 |
| --- | --- | --- |
| 股前皮神經（Anterior cutaneous branches of femoral nerve） | 4.2 股神經 | 有（合併一個網格） |
| 股內側肌神經 | 4.2 股神經（g） | 示意 |
| 隱神經 | 4.2.1 | 有 |
| 外股皮神經 | 4.1.4 | 有 |
| 閉孔神經後支、前支 | 4.3 | 有 |
| 臀上、臀下神經、閉孔內肌神經、股方肌神經 | 4.4.1、4.4.2、4.4.5、4.4.6 | 有／示意 |
| 股後皮神經 | 4.4.3 | 有 |
| 陰部神經 | 4.4.7 | 有 |
| 坐骨神經、脛神經、總腓神經 | 4.5 | 有 |
| 內側、外側腓腸皮神經、腓腸交通支、腓腸神經 | 4.6 | 有／示意 |
| 腓深神經、外側支、內側支；腓淺神經；足內側、中間、外側背側皮神經 | 4.5.2 | 有／示意 |
| 內蹠、外蹠神經 | 4.5.1 | 有 |
| 清單上的 articular branches、「nerve to XXX m」、「post. cutaneous nerve」 | 分別併入對應神經的分支步驟 | 缺（見第 5 節） |

---

## 5. 缺漏對照表與建議處理

原則：**缺的結構不捏造**。有真實標誌的才建「示意模型」，且以「貼合邊界的半透明立體」或「在骨／肌表面著色」呈現，不用平面、圓碟、圓柱；沒有標誌就只用文字說明，動畫高亮前後兩個真實標誌。

### 5.1 缺漏的神經（或分支）

| 結構 | 為什麼缺 | 建議處理 |
| --- | --- | --- |
| 個別 L1–L4、S1–S4 脊神經與前支、腰薦幹 | 只有合併的 `Lumbar nerves`、`Spinal nerves`、`Roots of nerves`（無側別） | 路徑起點使用合併網格，個別根部以文字帶過；若使用者要求，之後以示意模型接在椎間孔與神經叢之間 |
| 髂腹下神經外側皮支、前皮支；髂腹股溝神經終末（前陰囊／陰唇支） | 只有主幹 | 文字帶過；高亮終點皮區 |
| 生殖股神經：目前有主幹與兩支 | 有 | 無需處理 |
| 股神經：肌支（髂肌、縫匠肌、恥骨肌、股直肌、股外側肌、股中間肌）、關節支、股中間皮神經、股內側皮神經（分開）| 只有合併的前皮支與股內側肌神經（示意） | 肌支以「點亮肌肉」表現，神經線不畫；兩皮神經維持合併網格 |
| 閉孔神經：皮支、關節支、肌支、副閉孔神經 | 缺 | 同上；副閉孔神經不納入 |
| 梨狀肌神經有；上雙子肌神經、下雙子肌神經 | 缺（下雙子肌支與股方肌神經同源） | 文字帶過 |
| 股後皮神經：下臀皮神經、會陰支 | 缺 | 文字帶過 |
| 坐骨神經在大腿的肌支（半腱肌、半膜肌、股二頭肌長、短頭、內收大肌） | 缺 | 點亮肌肉，不畫神經線 |
| 脛神經：膕窩與小腿肌支、膝關節支、內側跟骨支 | 缺 | 同上；內側跟骨支提案：以足跟內側皮區文字說明 |
| 內蹠神經肌支；外蹠神經肌支、淺支、深支；蹠方肌 | 缺（肌支與淺、深支） | 同上 |
| 總腓神經：關節支、返支；腓淺神經肌支（至腓骨長、短肌）；外側跟骨支 | 缺 | 同上 |
| 陰部神經：直腸下神經、會陰神經、陰莖（陰蒂）背神經、陰囊（陰唇）後神經 | 缺（與上表「perineum region nerves」同屬缺口） | 本批動畫止於陰部管文字說明；若使用者要求會陰完整路徑，另開 PR 做示意模型，需有骨盆會陰標誌（坐骨結節、坐骨棘、恥骨結節、陰部管） |
| 外側腓腸皮神經、足背外側皮神經、臀下神經、閉孔內肌神經、股內側肌神經、腓深神經內側支／外側支 | 已有示意模型 | 沿用，不改；動畫畫面標「示意」 |

### 5.2 缺漏的標誌與空間

| 標誌或空間 | 現況 | 建議處理 |
| --- | --- | --- |
| 腹股溝韌帶 | 有（`Inguinal ligament`，補充資料，左右各一） | 直接高亮 |
| 腹股溝管、淺腹股溝環、深腹股溝環 | 缺 | 以腹股溝韌帶與腹肌邊界高亮；如要空間，做貼合邊界的半透明立體（需先有腹內斜肌、腹橫肌；其名稱目前在已提交清單查不到，待核） |
| 髂前上棘、髂嵴（左）、大轉子、內踝、外踝、腓骨頭頸 | 無標誌（為骨的一部分）；僅右髂嵴、右坐骨結節、右坐骨棘、右恥骨結節、右脛骨粗隆有標誌 | 在骨表面著色或輪廓標示，不做浮空模型；左側標誌補齊 |
| 股三角 | 缺 | 以腹股溝韌帶、縫匠肌、內收長肌三邊高亮；不另做空間 |
| 內收肌管 | 缺 | 以縫匠肌、股內側肌、內收長肌、內收大肌邊界與管內內容物（股血管、隱神經、股內側肌神經）高亮 |
| 內收肌裂孔 | 有（空間示意） | 直接用 |
| 閉孔、閉孔管、閉孔溝 | 缺；`Obturator membrane` 有（補充資料） | 在髖骨表面著色閉孔上緣區，並高亮閉孔膜；不聲稱神經一定過此管（資料無法驗證） |
| 大坐骨孔、梨狀肌上、下孔、坐骨小孔 | 缺；`Piriformis`、`Sacrospinous ligament`、`Sacrotuberous ligament`、`Right spine of ischium` 有 | 以梨狀肌與兩條韌帶、髖骨高亮；上、下孔以梨狀肌上緣、下緣分界；如要空間，貼合邊界半透明立體 |
| 陰部管 | 缺 | 文字帶過 |
| 膕窩 | 缺 | 以股二頭肌、半腱肌、半膜肌、腓腸肌兩頭四邊高亮，內容物高亮 `Popliteal vein`、`Popliteal artery`、脛神經；不另畫空間，或做貼合邊界的半透明立體 |
| 比目魚肌腱弓 | 缺 | 文字帶過 |
| 跗隧道、屈肌支持帶 | 有（空間示意、`Flexor retinaculum of ankle`） | 直接用 |
| 小腿筋膜、闊筋膜、膕筋膜、骨間膜、前肌間隔 | 骨間膜、肌間隔、筋膜屬補充資料（已列在清單；實際載入待核） | 若載入則用於高亮，否則文字帶過 |
| 第一趾蹼 | 缺 | 在足背皮膚著色（見 5.3） |

### 5.3 皮膚感覺區（每條路徑終點要「顯示皮區」）

模型有 `Skin`（單一網格），但**沒有任何皮區、皮節或感覺分區資料**。建議：新增一個資料檔 `app/data/pathways/skin-zones.json`，每個皮區以「在 `Skin` 網格表面上選出的三角形範圍」表示（由肢體座標範圍加骨性標誌決定，例如「大腿前外側」），動畫終點以著色方式疊在皮膚表面，不另建浮空曲面。這是**新增的示意資料**，需另開【需人工審核】PR，並給使用者逐區核對截圖。核准前，終點只顯示文字說明。

必要皮區（本批）：臀外側上部、恥骨上方、大腿上內側與生殖器前部、大腿前外側、大腿前面、大腿內側下部、大腿後面與膕窩、小腿前內側（隱神經）、足內緣、小腿後外側、足外緣與小趾外側、足背、第一趾蹼、足底內側、足底外側、足跟內側、各趾尖（背側與蹠側）。

### 5.4 命名與資料一致性問題（順帶發現）

- `Ilio-inguinal nerve`（模型）與 Ilioinguinal nerve（命名報告中文名「髂腹股溝神經」）寫法不同；路徑資料以模型為準，搜尋索引已有別名。
- 腓深神經：`Muscular branches of deep fibular nerve`（BodyParts3D）與示意的內側支、外側支重疊功能，見問題 5。
- 肌肉名稱在資料裡有兩種寫法（`Right gemellus superior` 與 `First lumbrical of right foot` 或 `First lumbrical of foot`）。
- `Common plantar digital branches of medial plantar nerve` 右側缺側別字尾（資料問題）。
- 清單的 sural n 出現在大腿前區間（疑似抽取錯位）；本文件以腓腸神經單獨成節（4.6）。

---

## 6. 動畫階段的共通規格（供審核；核准後才實作）

- 發光點沿神經由根到末梢移動；相機跟隨；每個「分支點」停約 1 秒，並依序列出分支名稱。
- 每個步驟高亮其標誌，其餘結構淡化；肌肉點亮；終點顯示皮區（見 5.3）。
- 側面板逐步文字：英文在上，中文在下；用台灣醫學用語；全部為自己撰寫。
- 左右兩側都可播放；兩側資料同一份路徑，由 `side` 展開。
- 缺的步驟：以文字顯示，不畫線，鏡頭停在前後兩個真實標誌之間。
- 動畫不改模型，也不改動作姿勢（沿用靜止姿勢）。

---

## 7. 待使用者核對與決定

1. 標準解剖決定第 2 節 9 條加我補充的 4 條，是否都照用？
2. **腰方肌、腹橫肌、腹內斜肌、提睪肌、伸趾短肌、蹠方肌、骨間肌（足）、臀上動脈、脛前動脈與脛後動脈的確切模型名稱**，我無法由已提交資料確認，標「待核」；請在實作階段用搜尋索引核對，或告訴我正確名稱。
3. **臀下神經位置**：我知道常見說法是它靠近坐骨神經，在梨狀肌下緣出口的外側部。你定的由外到內順序（坐骨神經 → 股後皮神經 → 閉孔內肌神經 → 陰部神經）未列臀下神經，請決定它放在哪（建議：坐骨神經與股後皮神經之間，內側靠近股後皮神經；待核）。
4. 本批只含神經，但腰神經叢路徑含髂腹下、髂腹股溝兩條（軀幹神經），因你的清單列了；若只要下肢，可刪。
5. 腓深神經：`Muscular branches of deep fibular nerve`（BodyParts3D）與示意的內側支、外側支是否同時顯示？建議路徑用 BodyParts3D 主幹，加外側支（伸趾短肌）與內側支（第一趾蹼）作為終端分支，肌支網格只用於高亮。
6. 皮膚感覺區（5.3）是否同意以 `Skin` 網格表面著色、另開 PR 建置？核准前終點只顯示文字。
7. 缺漏標誌（5.2）是否同意以骨表面著色、邊界結構高亮、必要時貼合邊界半透明立體處理？是否要先補齊左側標誌（髂嵴、坐骨結節、坐骨棘、恥骨結節、脛骨粗隆）？
8. 陰部神經完整路徑（直腸下、會陰、陰莖背神經）要不要列入第 1 批？目前只做到分支點。
9. 路徑資料位置採 `app/data/pathways/` 是否同意？
10. 隱神經足部延伸：模型主幹止於哪一點需在實作時量測，若止於踝前，足內緣段以文字說明。
11. 副閉孔神經不納入，是否同意？

走向已對照公開來源（Gray 1918／OpenStax）檢查，待使用者核對。本文件未使用其他來源。
