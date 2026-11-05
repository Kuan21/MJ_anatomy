# Pathways: Lower-limb nerves and vessels, thorax and back
# 走向路徑：下肢神經與血管、胸部與背部（審核文件）

狀態：**待使用者審核。** 本文件只列路徑規格，不含程式、不改模型、不做動畫。第一版只有下肢神經；現已擴充為**神經＋血管**（含胸部與背部），並加入與內部對照資料的差異表（第 2.5 節）。核准後才依此建立「走向動畫」系統與路徑資料檔。本檔放在 `docs/`，不部署。

## 0. 怎麼讀這份文件

### 0.1 範圍

- 原定第 1 批為**神經**（建議仍最先做，分批見第 6 節）：腰神經叢（L1–L4）、股神經、閉孔神經、薦神經叢（L4–S4）、坐骨神經（脛神經與總腓神經）、腓腸神經，以及必備結構清單（`docs/paokao-checklist.json`）裡其餘的下肢神經。
- 動脈（由近到遠）與靜脈（由遠到心）：下肢與骨盆見 4.8、4.9；胸部與背部（血管與神經）見 4.10。
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

- 解剖走向以我既有的解剖學知識，用自己的話寫成，並**以公開來源核對**；另以使用者提供的兩份內部對照資料交叉檢查位置關係（只用來核對，內容不抄錄，差異列在 2.5）：Gray's Anatomy 1918 版插圖（公有領域，Wikimedia Commons）與 OpenStax Anatomy and Physiology（CC BY 4.0）。
- 聲明格式：**「走向已對照公開來源（Gray 1918／OpenStax）檢查，待使用者核對。」** 不宣稱「已對照某某課本驗證」。
- 本次**沒有下載任何書籍、掃描檔或 PDF**，沒有使用其他來源。凡無法由我已知的公開資料確認的細節，標「待核」並彙整於第 7 節。
- 若之後想引用公開來源以外的圖譜，必須先把來源與授權列給使用者確認。

---

## 1. 路徑資料放哪裡、長什麼樣

### 1.1 位置建議

**更新（已實作）：** 已 merge 的走向動畫實際放在 `lib/pathways/`（`lower-limb.ts`、`upper-limb.ts`、`card-map.ts`，內含步驟文字與路徑）與 `components/FlowAnimation/`（引擎與身體資料），不是下面提案的 `app/data/pathways/`。下面的目錄與 JSON 草稿保留作欄位參考，不再是待辦；之後若要抽成純資料檔，由動畫那邊決定。

（以下為原提案）此 repo 沒有 `src/`。資料檔、生成檔都在 `app/`（例如 `app/mj-paokao.json`、`app/mj-vessel-branches.json`），因此建議：

```
app/data/pathways/
  schema.md                    欄位說明（簡短）
  lower-limb-nerves.json       下肢神經路徑
  lower-limb-arteries.json     下肢與骨盆動脈（含臀、陰部、閉孔）
  lower-limb-veins.json        下肢靜脈
  thorax-back.json             胸部與背部血管與神經
scripts/check-pathways.mjs     建置期檢查（見 1.3）
docs/pathways-lower-limb.md    本審核文件（不部署）
```

理由：與其他結構資料同層，建置時可直接 import；不放 `public/`（不必另外下載，也不會被當成可部署原始檔）。路徑資料的文字說明用自己的話寫，一樣受 `scripts/check-no-notes.mjs` 掃描。

### 1.2 一個路徑的資料形狀（草案）

```json
{
  "id": "femoral-nerve",
  "en": "Femoral nerve", "zh": "股神經",
  "system": "nerve | artery | vein", "bilateral": true,
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

- 血管路徑多兩個欄位：`system` 為 `nerve`／`artery`／`vein`；`direction` 為 `root-to-periphery`（神經）、`proximal-to-distal`（動脈）、`distal-to-heart`（靜脈）。靜脈的 `branches` 欄位改稱 `tributaries`（匯入），順序由遠到近。
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
4. **梨狀肌下緣出口，由外側到內側**：坐骨神經 → 股後皮神經 → 閉孔內肌神經 → 陰部神經。**臀下神經**同樣由梨狀肌下方出，位於坐骨神經內側，與股後皮神經同行（並排），之後進入臀大肌（使用者決定，見 2.6）。
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

## 2.5 與內部對照資料的差異表（神經與位置關係）

我把本文件的路徑與兩份內部對照資料交叉檢查，資料只用來核對，文字均用自己的話改寫。**一致的項目不再重列**（例如：隱神經入內收肌管而股神經不入、閉孔神經前支在內收短肌淺面且後支在深面、股後皮神經在坐骨神經內側伴行、梨狀肌下方四條神經由外到內的順序、坐骨小孔只通過陰部神經、陰部內血管、閉孔內肌肌腱與閉孔內肌神經、梨狀肌上方只有臀上神經與血管、大隱靜脈與隱神經在小腿內側伴行、腓腸神經與小隱靜脈伴行、深腓神經與脛前動脈伴行、跗隧道由前到後的順序、股三角由外到內為神經－動脈－靜脈－淋巴管、內收肌管內容、膕窩由淺到深為神經－靜脈－動脈）。以下只列**不同或有疑義**之處。**D1、D5、D9、D12、D22、D23 已由使用者決定（見 2.6）**；其餘仍標「待核」，我不自行裁決。

| # | 項目 | 本文件現寫法（標準解剖或你已定） | 對照資料的說法 | 狀態 |
| --- | --- | --- | --- | --- |
| D1 | 腰神經叢分支相對腰大肌的位置 | 髂腹下、髂腹股溝、外股皮、**股神經**由腰大肌**外側緣**穿出（走在腰大肌與髂肌之間的溝）；閉孔神經由**內側緣**穿出；生殖股神經由**前面**穿出 | 內部對照資料把股神經歸在內側，並把肋下神經（T12，不屬腰叢）算進外側四條 | **已決定**：股神經在腹腔內行於腰大肌與髂肌之間，經腹股溝韌帶深面出骨盆，位於股動脈外側、股鞘外面。內部對照資料的「歸內側」說法不採用 |
| D2 | 髂腹下與髂腹股溝神經的相對位置 | 髂腹股溝在髂腹下**下方**（偏內下），並進腹股溝管 | 髂腹下在外側、髂腹股溝在內側並穿進腹股溝管 | 一致（只是說法不同；內外側請以上下理解） |
| D3 | 腹股溝管內的神經 | 髂腹股溝神經經淺環出管，生殖股神經生殖支經深環入管，兩者都在精索附近 | 髂腹股溝神經在精索**外側**，生殖支在精索**內**（隨精索） | 待核：精索「外側」是指在管內貼精索外面（標準說法為在精索前外側表面），動畫以「貼精索外面」呈現 |
| D4 | 一條「臀褶下最大兩條」神經 | 臀褶下最粗的兩條是坐骨神經與**股後皮神經** | 一份資料把其中第二條記成外股皮神經 | 待核：外股皮神經在髂前上棘附近入大腿，不在臀褶下，推測是筆誤；本文件維持股後皮神經 |
| D5 | 臀下神經的位置 | 梨狀肌下緣出口 | 只說在梨狀肌下方、直接進臀大肌；也沒有排序 | **已決定**：臀下神經由梨狀肌下方出骨盆，位於坐骨神經內側，與股後皮神經同行，之後進入臀大肌；其餘四條的次序照下肢架構資料：坐骨神經 → 股後皮神經 → 閉孔內肌神經 → 陰部神經（由外到內）。臀下神經與股後皮神經並排，視為同一組放在坐骨神經內側 |
| D6 | 閉孔內肌神經的位置 | 梨狀肌下緣出骨盆，繞坐骨棘，經坐骨小孔再入骨盆，末端進閉孔內肌 | 描述的是末端：在閉孔內肌與上雙子肌之間出現 | 一致（兩者描述同一條路的不同段）；仍請確認動畫畫到哪一段 |
| D7 | 股方肌神經的位置 | 在雙子肌與閉孔內肌肌腱**深面**，貼髖關節囊 | 描述的是末端：在下雙子肌與股方肌之間進入股方肌 | 一致（末端段）；動畫末端加「由下雙子肌與股方肌之間進入」 |
| D8 | 陰部神經與陰部內血管的內外關係 | 在坐骨棘處神經在最內側、血管在外側 | 一份資料：血管在神經**外側**伴行；另一份：血管「與下臀動脈同走向、在其前方」，並說它們「穿過薦結節韌帶」 | 待核：「穿過薦結節韌帶」我解讀為經坐骨小孔（在薦結節韌帶與薦棘韌帶之間繞回），與你的標準一致 |
| D9 | 脛神經、脛後動脈在小腿的相對位置 | 你已定（標準決定 1）：在脛後肌後方、屈趾長肌與屈拇長肌之間 | 內部對照資料記成夾在屈趾長肌與脛後肌這一對 | **已決定（神經與動脈的相對位置）**：小腿上段神經在動脈**內側**，之後在動脈**後方**交叉，下段神經位於動脈**外後方**；跗管內由前到後：動脈 → 靜脈 → 神經。**夾在哪兩條肌肉之間**沿用標準決定 1（決定內容沒有改它；與內部資料的說法不同處仍視為待核） |
| D10 | 腓動脈的位置 | 由脛後動脈分出向外，在脛後肌與屈拇長肌之間、貼腓骨（深在屈拇長肌內） | 同左 | 一致 |
| D11 | 深腓神經夾在哪兩條肌肉之間 | 脛前肌與伸拇長肌之間（與脛前動脈同行） | 三處寫脛前肌與伸拇長肌；一處記成穿出於屈趾長肌與脛前肌之間 | 待核：後者應是筆誤（屈趾長肌在後區），本文件用脛前肌與伸拇長肌 |
| D12 | 腓腸神經的組成與會合位置 | 內側腓腸皮神經（脛神經）＋腓腸交通支（總腓神經） | 另一份把外側腓腸皮神經當作組成之一，並說在足跟附近會合 | **已決定（組成）**：內側腓腸皮神經（脛神經）加腓腸交通支（總腓神經）；資訊卡須註明組成有個體變異。會合位置維持小腿中下部（未另行決定，視為隨變異） |
| D13 | 股神經的分支數 | 前股（皮支、縫匠肌、恥骨肌）與後股（四頭肌各頭、隱神經、關節支） | 「只有三組：前皮支、肌支、隱神經」 | 一致（歸類方式不同） |
| D14 | 內側與外側蹠神經、動脈的分出位置 | 在跗隧道內或近端分出 | 在內踝處分出 | 一致（內踝處） |
| D15 | 隱神經與股內側肌神經 | 兩者都入內收肌管；股內側肌神經鑽入股內側肌即止；隱神經繼續下行 | 同左 | 一致 |
| D16 | 內收肌三層順序 | 內收長肌在最前、內收短肌其次、內收大肌最深 | 同左（前壓後） | 一致 |
| D17 | 上、下臀動脈在骨盆內的穿行 | 本版先前沒寫 | 上臀動脈穿過腰薦幹與第一薦神經之間；下臀動脈穿過第二與第三薦神經之間；內陰動脈走向同下臀動脈、在其前方 | 新增到 4.8.5；標準解剖大致相同，細節待核 |
| D18 | 上臀動脈的分支 | 先前沒寫 | 淺支入臀大肌，深支走臀中肌與臀小肌之間 | 新增到 4.8.5（模型有兩個分支網格，為示意） |
| D19 | 股二頭肌與半腱、半膜肌的認法 | 半腱肌在半膜肌淺層 | 半膜肌會把半腱肌「包住」 | 待核：兩種說法的前後關係不同（淺層或被包住），請以你的標準決定為準（半腱肌淺於半膜肌），資料的「包住」可能是指半膜肌腱膜較寬 |
| D20 | 股深動脈起始高度 | 股動脈起端下方約 3–5 cm | 只寫「從股動脈分出」 | 一致（無衝突） |
| D21 | 旋股內側動脈 | 起自股深動脈，繞股骨頸內側，在恥骨肌與髂腰肌之間，位置較高 | 同左 | 一致 |
| D22 | 鎖骨下動脈與腋動脈的分界（胸部） | 以第一肋外緣為界 | 以鎖骨為界；鎖骨下靜脈與腋靜脈同理 | **已決定**：鎖骨下動脈與腋動脈以第 1 肋外緣為界；腋動脈與肱動脈以大圓肌下緣為界（靜脈同理處理）。動畫文字可補一句鎖骨只是外表標誌 |
| D23 | 內胸動脈終末分叉高度 | 約在第六肋間隙分成肌膈動脈與上腹上動脈 | 約在第七肋處 | **已決定**：約在第 6 肋間隙分為腹壁上動脈（上腹上動脈）與肌膈動脈 |
| D24 | 副半奇靜脈收納的肋間靜脈 | 左側第四到第八後肋間靜脈 | 左側第五到第八 | 待核（細節；模型只有一個網格，不影響動畫） |
| D25 | 內側、外側胸神經 | 內側胸神經穿過胸小肌並支配胸小肌與胸大肌；外側胸神經支配胸大肌，不穿胸小肌，由其內側緣旁繞過 | 同左（資料稱「內胸、外胸神經」） | 一致；中文建議用「內側胸神經、外側胸神經」 |
| D26 | 橫頸動脈與副神經 | 副神經沿斜方肌深面下行；橫頸動脈淺支沿斜方肌深面偏橫向走 | 同左（橫頸動脈較短、偏橫；副神經較長、偏下） | 一致 |
| D27 | 右、左喉返神經的位置 | 右側繞右鎖骨下動脈（位置較高）；左側繞主動脈弓（較低） | 同左 | 一致 |
| D28 | 枕下神經與枕大神經的出口 | 枕下神經（C1）由枕下三角出，枕大神經（C2）由下斜肌下方出 | 同左 | 一致 |
| D29 | 模型中「枕動脈」 | 模型的覆蓋資料把「枕動脈」對到 `Lateral occipital artery`（大腦的血管） | 資料裡的枕動脈是外頸動脈的分支，在頭上斜肌外上方（枕下區） | 待核：目前把兩者視為不同；外頸動脈的枕動脈**缺**（見 5.5）。這是現有覆蓋資料的疑似誤對，建議另案確認 |

說明：差異表中標「一致」的列只是讓你知道我已核對過；真正需要你回答的是標「待核」的列，已彙整在第 7 節。

---

## 2.6 使用者已決定的六項（D1、D5、D9、D12、D22、D23）

決定內容已寫入下列步驟，路徑資料與資訊卡文字須照此：

| # | 決定 | 影響到的步驟 |
| --- | --- | --- |
| a（D1） | 股神經在腹腔內行於腰大肌與髂肌之間；經腹股溝韌帶深面出骨盆；位於股動脈外側、股鞘外面 | 4.1 起點說明、4.2 步驟 2、3 |
| b（D9） | 脛神經與脛後動脈：小腿上段神經在動脈內側，之後在動脈後方交叉，下段神經位於動脈外後方；跗管內次序為動脈 → 靜脈 → 神經 | 4.5.1 步驟 5、6；4.8.4 步驟 4 |
| c（D12） | 腓腸神經由內側腓腸皮神經（脛神經）與腓腸交通支（總腓神經）組成；資訊卡註明組成有變異 | 4.6 步驟 1b、3 |
| d（D22） | 鎖骨下動脈與腋動脈以第 1 肋外緣為界；腋動脈與肱動脈以大圓肌下緣為界 | 4.10.3 步驟 2（新增步驟 2a） |
| e（D23） | 內胸動脈約在第 6 肋間隙分為腹壁上動脈與肌膈動脈 | 4.10.1 步驟 4 |
| f（D5） | 臀下神經：梨狀肌下方出，位於坐骨神經內側，與股後皮神經同行，之後進入臀大肌；其餘四條次序：坐骨神經 → 股後皮神經 → 閉孔內肌神經 → 陰部神經 | 標準決定 4；4.4.2；4.4.3 步驟 2 |

仍待核的 D 項：D3、D4、D8、D11、D19、D24、D29（其餘為「一致」）。

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

位置關係（相對腰大肌）：髂腹下、髂腹股溝、外股皮、股神經由外側緣穿出，生殖股由前面穿出，閉孔由內側緣穿出；內部對照資料把股神經歸在內側，已由使用者決定不採用（D1）。

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
| 2 | 在腹腔內行於腰大肌與髂肌之間（由腰大肌外側緣穿出，走在兩肌之間的溝，髂筋膜下）；決定 a | `Psoas major`、`Iliacus` | 有 | 髂腰肌 `Right tendon of iliopsoas` 可作遠端參照 |
| 2a | 分支（骨盆內）：髂肌肌支（髂肌）、腰大肌小支 | 個別分支 | 缺 | 動畫用文字帶過 |
| 3 | 經腹股溝韌帶深面出骨盆，位於股動脈外側、股鞘外面；決定 a | `Inguinal ligament`、`Femoral sheath` | 有 | 高亮腹股溝韌帶；神經在股鞘**外**（標準決定 6） |
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
| 6 | 主幹在膝內側以下**開始與大隱靜脈同行**（大隱靜脈路徑見 4.9.1），沿脛骨內側緣下行 | `Great saphenous vein`（大隱靜脈）、`Tibia` | 有 | 兩者此後伴行；模型量測：主幹離脛骨內緣約 4.5 mm（骨外） |
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
| 2 | 經大坐骨孔**梨狀肌下緣**（梨狀肌下孔），位於坐骨神經內側，與股後皮神經並排同行（決定 f） | `Piriformis`、`Inferior gluteal nerve`、`Sciatic nerve`、`Posterior femoral cutaneous nerve` | 示意 | 模型已確認在梨狀肌下方約 3 mm（強制檢查）；內外位置未在 3D 畫面確認，實作時需截圖核對 |
| 3 | 與股後皮神經同行片刻後，進入臀大肌深面，分成多條肌支 | `Gluteus maximus` | 有 | |
| 4 | 終點：臀大肌 | `Gluteus maximus` | 有 | 點亮；無皮區 |

- 臨床提示：受損時由坐姿起身、爬樓梯、跑步時伸髖無力。

#### 4.4.3 Posterior femoral cutaneous nerve (S1–S3)
#### 股後皮神經（S1–S3）

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：S1–S3，前根與後根（模型分成兩根） | `Anterior root of posterior femoral cutaneous nerve`、`Posterior root of posterior femoral cutaneous nerve`、`Posterior femoral cutaneous nerve` | 有 | |
| 2 | 經大坐骨孔梨狀肌下緣，位於坐骨神經內側，與臀下神經並排（決定 f；四條次序：坐骨神經 → 股後皮神經 → 閉孔內肌神經 → 陰部神經，由外到內） | `Piriformis` | 有 | |
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
| 4 | 末端：在閉孔內肌肌腱與上雙子肌之間出現，進入閉孔內肌（盆腔內面）並支配上雙子肌 | `Obturator internus`、`Gemellus superior` | 有 | 點亮 |

注意：標準解剖一般把這條神經描述為「由梨狀肌下方出骨盆後，繞坐骨棘，經坐骨小孔再入骨盆支配閉孔內肌」。此為使用者決定的標準，已採用。

#### 4.4.6 Nerve to quadratus femoris (L4–S1)
#### 股方肌神經（L4–S1）

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：L4–S1 前股 | `Nerve to quadratus femoris muscle` | 有 | 與下雙子肌神經同源 |
| 2 | 經梨狀肌下緣，在**坐骨神經深面** | `Sciatic nerve`、`Piriformis` | 有 | |
| 3 | 下行，位於上雙子肌、閉孔內肌肌腱、下雙子肌的**深面**，貼髖關節囊後面（標準決定 2） | `Gemellus superior`、`Obturator internus`、`Gemellus inferior`、`Articular capsule of hip joint` | 有 | 淡化其他，高亮髖關節囊；模型有 27 個頂點貼骨面的情形（左側較多），顯示時屬正常誤差 |
| 4 | 分支：下雙子肌支、髖關節支 | 個別分支缺 | 缺 | 文字帶過 |
| 5 | 末端：由下雙子肌與股方肌之間進入股方肌 | `Gemellus inferior`、`Quadratus femoris` | 有 | 點亮（差異表 D7） |

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
| 5 | 在脛後肌後面下行，位於屈趾長肌與屈拇長肌之間（標準決定 1），與脛後動脈同行。**相對位置（決定 b）：小腿上段神經在動脈內側，往下在動脈後方交叉，下段位於動脈外後方** | `Tibialis posterior`、`Flexor digitorum longus`、`Flexor hallucis longus`、`Posterior tibial artery`（待核名稱） | 有 | 肌支：脛後肌、屈趾長肌、屈拇長肌（個別肌支缺）；模型小腿中段脛神經離動脈約 26 mm（已知，動脈偏內） |
| 6 | 經內踝後方，進入**跗隧道**（屈肌支持帶下）；隧道內由前到後：脛後肌腱 → 屈趾長肌腱 → 脛後動脈 → 脛後靜脈（兩條，夾著動脈） → 脛神經 → 屈拇長肌腱（決定 b：動脈 → 靜脈 → 神經） | `Right tarsal tunnel`／`Left tarsal tunnel`（空間示意）、`Right flexor retinaculum of ankle`／`Left flexor retinaculum of ankle`、`Right tendon of tibialis posterior`、`Right tendon of flexor digitorum longus`、`Right tendon of flexor hallucis longus`（左側同名） | 有 | 模型量測脛神經貼近跗隧道 0.3 mm（強制檢查）；標誌：內踝（缺標誌）；跗隧道內脛後靜脈是否為兩條，待核 |
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
| 3 | 在小腿前區，走在骨間膜前面、脛前肌與伸拇長肌之間，與脛前動脈同行（上、下三分之一在其外側，中段在前）；見 D11 | `Interosseous membrane of leg`、`Anterior tibial artery`（待核名稱） | 有 | 模型量測貼骨間膜前 19 mm、離脛前動脈 7 mm |
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
| 3 | **會合點**：腓腸交通支與內側腓腸皮神經在小腿中下部會合成腓腸神經（組成已決定：脛神經的內側腓腸皮神經＋總腓神經的腓腸交通支；資訊卡註明組成有變異，D12） | `Sural nerve` | 有 | 停約 1 秒 |
| 4 | 在跟腱外側下行，與小隱靜脈同行（小隱靜脈見 4.9.2；腓淺神經沒有動脈伴行，與此區分） | `Calcaneal tendon`（跟腱）、`Small saphenous vein` | 有 | |
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

### 4.8 Lower-limb arteries (proximal → distal)
### 下肢與骨盆動脈（由近到遠）

通則：動脈路徑資料 `system: "artery"`、`direction: "proximal-to-distal"`；每個分支點停約 1 秒，列出分支順序。血管網格在模型裡多以左右各一個、連續的管狀網格呈現；有些分支只有「示意」版（`Right deep femoral artery` 等為示意，位置依標誌量測）。本批的**位置關係**是路徑重點（伴行神經、夾在哪兩條肌肉之間）。

#### 4.8.1 Femoral artery → deep femoral artery → popliteal artery
#### 股動脈 → 股深動脈 → 膕動脈

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：外髂動脈，在腹股溝韌帶深面（約髂前上棘與恥骨聯合中點）改名股動脈 | `External iliac artery`、`Femoral artery`、`Inguinal ligament` | 有 | 標誌：腹股溝韌帶 |
| 2 | 進入股三角，位於股神經內側、股靜脈外側，有彈性；股鞘包住動脈與靜脈 | `Femoral artery`、`Femoral vein`、`Femoral nerve`、`Right femoral sheath`／`Left femoral sheath`（左右各一） | 有 | 股三角邊界：腹股溝韌帶、縫匠肌、內收長肌（空間缺） |
| 3 | 淺分支（腹股溝韌帶下方起始，向淺層）：淺腹壁動脈（向上）、淺旋髂動脈（向外朝髂前上棘）、淺外陰動脈（向內） | `Superficial epigastric artery`、`Superficial circumflex iliac artery`、`Superficial external pudendal artery` | 有／示意（淺旋髂與淺外陰為示意） | 停約 1 秒 |
| 4 | 深外陰動脈（向內，在大隱靜脈深面） | `Deep external pudendal artery` | 示意 | 與淺外陰動脈以大隱靜脈區分前後（不是絕對） |
| 5 | **主要分支點（腹股溝韌帶下方約 3–5 cm）：股深動脈**，粗，向後外側深入 | `Deep femoral artery` | 示意 | 停約 1 秒 |
| 6a | 股深動脈第一組分支：旋股內側動脈（位置較高，在恥骨肌與髂腰肌之間繞股骨頸內側） | `Medial circumflex femoral artery` | 示意 | 標誌：股骨頸（骨表面著色） |
| 6b | 旋股外側動脈（向外）→ 升支、橫支、降支 | `Lateral circumflex femoral artery`、`Ascending branch of lateral circumflex femoral artery`、`Transverse branch of lateral circumflex femoral artery`、`Descending branch of lateral circumflex femoral artery` | 有（主幹與降支）／示意（升支、橫支） | |
| 6c | 穿通支：穿過內收大肌（三到四支）到後區供應膕繩肌；末支即第四穿通支 | `Perforating branch of deep femoral artery`、`Set of perforating arteries`、`Distal perforating artery` | 示意（穿通支）／有（Set、Distal 兩個 BodyParts3D 網格，與示意重疊，見問題） | 標誌：內收大肌；與坐骨神經在後區相遇 |
| 7 | 股動脈主幹進入內收肌管（與股靜脈、隱神經、股內側肌神經同在） | `Femoral artery`、`Saphenous nerve`、`Nerve to vastus medialis` | 有／示意 | 內收肌管空間缺，用邊界高亮（縫匠肌、股內側肌、內收長肌與內收大肌） |
| 8 | 管內分出降膝動脈 → 關節支（向髕）、隱支（與隱神經同行） | `Descending genicular artery`、`Articular branch of descending genicular artery`、`Saphenous branch of descending genicular artery` | 有（主幹）／示意（兩支） | 停約 1 秒 |
| 9 | 穿過**內收肌裂孔**，由前轉到後，改名膕動脈 | `Right adductor hiatus`／`Left adductor hiatus`（空間示意）、`Popliteal artery` | 有 | |

- 臨床提示：股動脈在腹股溝韌帶下可摸到脈搏，是導管檢查的常用入口；內收肌裂孔是動脈受壓處；股深動脈與旋股動脈提供股骨頭、頸的血液（股骨頸骨折有缺血風險）。

#### 4.8.2 Popliteal artery
#### 膕動脈

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：內收肌裂孔，進入膕窩，是膕窩內最深的結構 | `Popliteal artery`、`Popliteal vein`、`Tibial nerve` | 有 | 由淺到深：脛神經、膕靜脈（包在動脈淺面）、膕動脈；膕窩空間缺（以股二頭肌、半腱肌、半膜肌、腓腸肌兩頭高亮） |
| 2 | 膝動脈五條：外上、外下、內上、內下、中膝動脈 | `Lateral superior genicular artery`、`Inferior lateral genicular artery`、`Medial superior genicular artery`、`Inferior medial genicular artery`、`Middle genicular artery` | 有 | 停約 1 秒；命名：先上下再內外；上下以股骨髁與腓腸肌起點為界 |
| 3 | 在膕肌下緣分成脛前動脈（向前）與脛後動脈 | `Popliteus`、`Anterior tibial artery`、`Posterior tibial artery` | 有 | 停約 1 秒；標誌：膕肌下緣 |

#### 4.8.3 Anterior tibial artery → dorsalis pedis artery
#### 脛前動脈 → 足背動脈

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：膕動脈，在膕肌下緣；穿過骨間膜上方的缺口進入小腿前區 | `Anterior tibial artery`、`Interosseous membrane of leg` | 有 | 標誌：骨間膜上緣 |
| 2 | 在前區下行，貼骨間膜前面，走在脛前肌與伸拇長肌之間（下方伸趾長肌也靠近），與腓深神經同行 | `Tibialis anterior`、`Extensor hallucis longus`、`Deep fibular nerve` | 有 | 腓淺神經**沒有**動脈伴行（與此區分） |
| 3 | 返支（向上到膝）：脛前返動脈 | `Anterior tibial recurrent artery` | 有 | 停約 1 秒 |
| 4 | 踝前分支：前外踝動脈、前內踝動脈 | `Anterior lateral malleolar artery`、`Anterior medial malleolar artery` | 示意 | 標誌：外踝、內踝（缺標誌）；已知這兩條穿骨比例較高（`docs/lower-limb-nerves.md` 前後記錄） |
| 5 | 越過踝關節前方，在伸肌支持帶下，改名足背動脈 | `Dorsalis pedis artery`、`Right superior extensor retinaculum of foot`、`Right inferior extensor retinaculum of foot`（左側同名） | 有 | 足背動脈在伸拇長肌肌腱外側可摸到 |
| 6 | 足背動脈在第一、二蹠骨間穿入足底，成深蹠動脈，與足底弓吻合 | `Deep plantar artery`、`Plantar arch` | 有 | 停約 1 秒；吻合在足底，見 4.8.4 |

#### 4.8.4 Posterior tibial artery → medial and lateral plantar arteries; fibular artery
#### 脛後動脈 → 內、外側蹠動脈；腓動脈

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：膕動脈在膕肌下緣的終末分支 | `Posterior tibial artery` | 有 | |
| 2 | 先分出旋腓動脈（繞腓骨頸，不易開出） | `Circumflex fibular artery` | 示意 | 停約 1 秒 |
| 3 | **分支點：腓動脈**，由脛後動脈向外分出，走在脛後肌與屈拇長肌之間，貼腓骨 | `Fibular artery`、`Tibialis posterior`、`Flexor hallucis longus`、`Fibula` | 示意 | 停約 1 秒 |
| 4 | 主幹在小腿後區深層下行，與脛神經同行：上段神經在動脈內側，往下神經在動脈後方交叉，下段神經位於動脈外後方（決定 b，D9）；越下越靠近脛骨內後方 | `Tibial nerve`、`Flexor digitorum longus`、`Tibialis posterior` | 有 | 模型小腿中段脛後動脈偏內側約 20 mm（已知問題），動畫在此段與脛神經不會貼在一起 |
| 5 | 跟骨支（至足跟） | `Set of calcaneal branches of posterior tibial artery` | 有 | |
| 6 | 經內踝後方進入跗隧道：脛後肌腱 → 屈趾長肌腱 → **脛後動脈** → 脛後靜脈（兩條夾著動脈）→ 脛神經 → 屈拇長肌腱 | `Right tarsal tunnel`／`Left tarsal tunnel`、`Right flexor retinaculum of ankle`／`Left flexor retinaculum of ankle`、`Posterior tibial vein` | 有（空間示意） | |
| 7 | **分支點（內踝處）**：內側蹠動脈（淺支、深支）與外側蹠動脈 | `Medial plantar artery`、`Superficial medial plantar artery`、`Lateral plantar artery` | 有 | 停約 1 秒 |
| 8 | 外側蹠動脈斜向外側，在屈趾短肌與蹠方肌之間，最後轉向內側形成足底弓（深蹠弓） | `Lateral plantar artery`、`Plantar arch`、`Flexor digitorum brevis` | 有 | 蹠方肌名稱待核（已提交清單查不到） |
| 9 | 足底弓與足背動脈的深蹠動脈吻合；發出蹠側蹠動脈、趾動脈 | `Plantar arch`、`Deep plantar artery` | 有（趾動脈缺） | 終點：足趾尖（趾動脈缺，文字帶過） |

- 臨床提示：足背動脈與脛後動脈搏動用來評估下肢灌流；腓動脈為腓骨與小腿外側肌的血液來源，常用於骨移植（腓骨皮瓣）。

#### 4.8.5 Gluteal and pelvic arteries: superior and inferior gluteal, internal pudendal, obturator
#### 臀部與骨盆動脈：臀上、臀下、陰部內動脈、閉孔動脈

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：內髂動脈（分前、後幹） | `Internal iliac artery`、`Common iliac artery` | 有 | 標誌：骨盆緣，髂總動脈在薦髂關節前分叉 |
| 2 | **臀上動脈**：後幹，向後穿過腰薦幹與第一薦神經之間，**經梨狀肌上緣**出骨盆，與臀上神經同行 | `Superior gluteal artery`、`Superior gluteal vein`、`Piriformis`、`Superior gluteal nerve` | 示意（動脈）／有（靜脈、神經） | 梨狀肌上方只有臀上神經與血管；停約 1 秒 |
| 2a | 臀上動脈**淺支**入臀大肌；**深支**走在臀中肌與臀小肌之間 | `Superficial branch of superior gluteal artery`、`Deep branch of superior gluteal artery`、`Gluteus maximus`、`Gluteus medius`、`Gluteus minimus` | 示意 | 神經與動脈的區別：神經實心；動脈有管腔，兩者伴行須分清 |
| 3 | **臀下動脈**：穿過第二與第三薦神經之間，**經梨狀肌下緣**出骨盆，與臀下神經同行入臀大肌 | `Inferior gluteal artery`、`Inferior gluteal vein`、`Inferior gluteal nerve`、`Gluteus maximus` | 示意（動脈、神經）／有（靜脈） | |
| 4 | **陰部內動脈**：走向同臀下動脈、在其前方；經梨狀肌下緣出大坐骨孔，繞坐骨棘與薦棘韌帶，經**坐骨小孔**回到會陰；在坐骨棘處位於陰部神經外側 | `Internal pudendal artery`、`Internal pudendal vein`、`Pudendal nerve`、`Sacrospinous ligament`、`Sacrotuberous ligament`、`Right spine of ischium` | 示意（動脈）／有（靜脈、神經） | 坐骨小孔只通過這兩條血管神經加閉孔內肌肌腱與其神經；差異表 D8 |
| 5 | **閉孔動脈**：自內髂動脈（前幹）發出，沿骨盆側壁與閉孔神經同行，經閉孔管出骨盆，分前支、後支 | **缺**（模型只有 `Obturator vein`；`Obturator nerve` 有） | 缺 | 見 5.5：以 `Obturator vein` 與 `Obturator nerve` 作旁證，不畫動脈線 |

- 臨床提示：臀部注射位置偏內下可傷到臀下與陰部內血管神經；骨盆骨折可損傷臀上動脈引起大出血。

### 4.9 Lower-limb veins (distal → heart)
### 下肢靜脈（由遠到心）

通則：靜脈路徑 `system: "vein"`、`direction: "distal-to-heart"`；動畫的發光點由足部末梢向心行進。

#### 4.9.1 Great saphenous vein
#### 大隱靜脈

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：足背靜脈弓內側端（足背皮下靜脈） | `Dorsal venous arch of foot` | 有 | |
| 2 | 經內踝**前方**，進入小腿內側皮下 | `Great saphenous vein`、`Tibia` | 有 | 標誌：內踝（缺標誌，骨表面著色） |
| 3 | 沿小腿內側皮下上行，**開始與隱神經伴行**（兩者在膝內側以下伴行） | `Great saphenous vein`、`Saphenous nerve` | 有 | 隱神經在大腿**不**與大隱靜脈同行（它在內收肌管內） |
| 4 | 經膝內側（股骨內髁後方）上行 | `Great saphenous vein` | 有 | |
| 5 | 沿大腿內側皮下上行，在大腿表層 | `Great saphenous vein` | 有 | 與隱神經分開 |
| 6 | 在**隱靜脈裂孔**穿過闊筋膜與篩筋膜，注入股靜脈；注入前收納淺腹壁、淺旋髂、淺外陰靜脈等 | `Great saphenous vein`、`Femoral vein`、`Superficial epigastric vein` | 有（隱靜脈裂孔缺） | 停約 1 秒；股靜脈位於股三角最內側（V）；淺外陰、淺旋髂靜脈網格待核 |
| 7 | 終點：股靜脈 → 外髂靜脈（腹股溝韌帶深面） | `Femoral vein`、`External iliac vein` | 有 | |

- 臨床提示：大隱靜脈是靜脈曲張與冠狀動脈繞道取材的主要靜脈；穿通靜脈瓣膜失效是曲張原因。

#### 4.9.2 Small saphenous vein
#### 小隱靜脈

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：足背靜脈弓外側端（足外側緣） | `Dorsal venous arch of foot` | 有 | |
| 2 | 經外踝**後方**，進入小腿後面皮下 | `Small saphenous vein`、`Fibula` | 有 | 標誌：外踝（缺標誌） |
| 3 | 沿小腿後面中線上行，**與腓腸神經伴行** | `Small saphenous vein`、`Sural nerve` | 有 | |
| 4 | 在小腿上部**穿過深筋膜**，從腓腸肌兩頭之間進入膕窩 | `Medial head of gastrocnemius`、`Lateral head of gastrocnemius` | 有 | 小腿筋膜缺；標誌：兩頭之間的溝 |
| 5 | 終點：注入膕靜脈 | `Popliteal vein` | 有 | 停約 1 秒；膕靜脈在膕窩內包在膕動脈淺面 |

#### 4.9.3 Deep veins: tibial, popliteal and femoral veins
#### 深靜脈：脛、膕、股靜脈

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：足底內、外側蹠靜脈（外側蹠靜脈為示意；內側蹠靜脈在已提交清單查不到） | `Lateral plantar vein`、`Plantar venous arch of foot` | 示意／有／缺（內側） | |
| 2 | 脛後靜脈：兩條夾著脛後動脈上行，經跗隧道；腓靜脈匯入脛後靜脈 | `Posterior tibial vein`、`Fibular vein` | 有 | 模型右側腓靜脈較左側長 480 mm（已知，疑似多出一段，未改） |
| 3 | 脛前靜脈：與脛前動脈伴行，穿骨間膜上方進入膕窩 | `Anterior tibial vein` | 有 | |
| 4 | 兩者在膕肌下緣會合成膕靜脈，在膕窩內位於脛神經深面、膕動脈淺面；小隱靜脈在此匯入 | `Popliteal vein`、`Small saphenous vein` | 有 | 停約 1 秒 |
| 5 | 穿內收肌裂孔改名股靜脈，在內收肌管內伴股動脈；在股三角最內側 | `Femoral vein`、`Deep femoral vein`、`Right adductor hiatus`／`Left adductor hiatus` | 有 | 股深靜脈與大隱靜脈在股三角匯入；停約 1 秒 |
| 6 | 終點：腹股溝韌帶深面接外髂靜脈 | `Femoral vein`、`External iliac vein`、`Inguinal ligament` | 有 | |

- 臨床提示：深層靜脈血栓好發於小腿深靜脈與膕靜脈，膕窩處的觸診要考慮膕動脈瘤。

### 4.10 Thorax and back: arteries, veins and nerves
### 胸部與背部：動脈、靜脈與神經

這一節列出對照資料裡胸、背部的血管與神經。路徑格式與下肢相同，但本批建議**最後才做**（見第 6 節分批）。

#### 4.10.1 Internal thoracic artery
#### 內胸動脈（動脈，近到遠）

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：鎖骨下動脈（第一段） | `Subclavian artery`、`Internal thoracic artery` | 有 | |
| 2 | 在肋軟骨後面、距胸骨外緣一指寬下行，在胸橫肌前面 | `Internal thoracic artery`、`Body of sternum`、`transversus thoracis` | 有 | 標誌：胸骨體兩側 |
| 3 | 沿途前肋間動脈（向肋骨走）、穿通支、心包膈動脈 | `anterior intercostal arteries`、`pericardiophrenic artery` | 示意／有 | 停約 1 秒 |
| 4 | 約在第 6 肋間隙**終末分叉**：腹壁上動脈（上腹上動脈，向下入腹直肌鞘）、肌膈動脈（向外下）（決定 e） | `Superior epigastric artery`、`Musculophrenic artery` | 有 | 停約 1 秒 |
| 5 | 終點：上腹上動脈在腹直肌後與下腹壁動脈吻合 | `Superior epigastric artery`、`Inferior epigastric artery` | 有 | |

#### 4.10.2 Aortic arch branches and descending thoracic aorta
#### 主動脈弓分支與胸主動脈

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：升主動脈 → 主動脈弓 | `Ascending aorta`、`Arch of aorta` | 有 | |
| 2 | 弓上三條分支（由右到左）：頭臂動脈幹（分右總頸動脈、右鎖骨下動脈）、左總頸動脈、左鎖骨下動脈 | `Brachiocephalic artery`、`Common carotid artery`、`Subclavian artery` | 有 | 停約 1 秒 |
| 3 | 降主動脈（胸主動脈）：在脊柱左前方下行，最粗 | `Descending thoracic aorta`、`Descending aorta` | 有 | 兩個網格重疊，見問題 |
| 4 | 分支：食道支、支氣管支、後肋間動脈（成對）、上膈動脈 | `Set of oesophageal branches of thoracic aorta`、`Bronchial branch of arch of aorta`（弓處）、`Posterior intercostal arteries`、`Superior phrenic artery` | 有／示意 | 停約 1 秒 |
| 5 | 終點：穿過主動脈裂孔成為腹主動脈 | `Aortic hiatus`（示意）、`Abdominal aorta` | 有 | |

#### 4.10.3 Subclavian → axillary artery → thoracoacromial artery
#### 鎖骨下動脈 → 腋動脈 → 胸肩峰動脈

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 起點：右側頭臂動脈幹／左側主動脈弓 | `Subclavian artery` | 有 | |
| 2 | 以第 1 肋外緣為界，鎖骨下動脈改名腋動脈（決定 d；鎖骨只是外表標誌） | `Subclavian artery`、`Axillary artery` | 有 | 停約 1 秒 |
| 2a | 腋動脈到大圓肌下緣改名肱動脈（決定 d） | `Axillary artery`、`Brachial artery`（名稱待核）、`Teres major`（名稱待核） | 待核 | 與上肢走向文件一致，由上肢批次處理 |
| 3 | 腋動脈第二段（胸小肌後）：發出胸肩峰動脈幹 | `Trunk of thoraco-acromial artery`、`pectoralis minor` | 有 | |
| 4 | 胸肩峰動脈四個分支：肩峰支、鎖骨支、三角肌支、胸肌支 | `Acromial branch of thoraco-acromial artery`、`Clavicular branch of thoraco-acromial artery`、`Deltoid branch of thoraco-acromial artery`、`Pectoral branch of thoraco-acromial artery` | 有／示意（鎖骨支） | 停約 1 秒 |
| 5 | 另：外側胸動脈（與長胸神經伴行）、胸背動脈（與胸背神經伴行） | `Lateral thoracic artery`、`Thoracodorsal artery`、`Long thoracic nerve`、`Thoracodorsal nerve` | 有 | 其餘腋動脈分支不在本批 |

#### 4.10.4 Venous return: superior vena cava, brachiocephalic veins, cephalic vein; azygos system
#### 靜脈：上腔靜脈、頭臂靜脈、頭靜脈；奇靜脈系統（靜脈，遠到心）

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 頭靜脈：起自手背靜脈網外側，沿上臂外側、**走在三角肌與胸大肌之間（三角胸肌溝）**，穿鎖胸筋膜注入腋靜脈 | `cephalic vein`、`Axillary vein` | 有 | 標誌：三角胸肌溝（缺，以三角肌與胸大肌邊界高亮） |
| 2 | 腋靜脈 → 鎖骨下靜脈（第一肋外緣；資料以鎖骨為界） | `Axillary vein`、`Subclavian vein` | 有 | 停約 1 秒 |
| 3 | 鎖骨下靜脈與頸內靜脈會合成頭臂靜脈（左側較長，斜越過主動脈弓分支前方） | `Subclavian vein`、`Internal jugular vein`、`Brachiocephalic vein` | 有 | 停約 1 秒 |
| 4 | 左、右頭臂靜脈會合成上腔靜脈 | `Brachiocephalic vein`、`Superior vena cava` | 有 | 終點：右心房 |
| 5 | **奇靜脈**（右側）：收納右側後肋間靜脈，在食道右後方上行，繞右肺根上方注入上腔靜脈 | `Azygos vein`、`posterior intercostal veins`、`Superior vena cava` | 有 | 要把食道向左上拉開才看得到；標誌：右肺根 |
| 6 | **半奇靜脈**（左下，收納左側第九到第十一後肋間靜脈）與**副半奇靜脈**（左上，收納左側上部後肋間靜脈，差異表 D24）：越過中線注入奇靜脈 | `Hemiazygos vein`、`Accessory hemiazygos vein`、`Azygos vein` | 有 | 要把食道向右上拉開才看得到；停約 1 秒 |

#### 4.10.5 Nerves of the thorax
#### 胸部神經

| 神經 | 路徑要點 | 模型名稱 | 狀態 |
| --- | --- | --- | --- |
| 膈神經（C3–C5） | 在縱隔內單獨走在心包與縱隔胸膜之間，**騰空**（資料特別提醒：不要與交感幹混淆），伴心包膈血管，終點膈肌 | `phrenic nerve`、`pericardiophrenic artery`、`pericardiophrenic vein`、`Diaphragm` | 示意／有 |
| 迷走神經 | 在頸部走在頸內靜脈與總頸動脈之間，進胸腔，在食道周圍形成食道叢，分出喉返神經；不分支、頗粗 | `Vagus nerve (X)`、`Esophageal plexus` | 有 |
| 右喉返神經 | 右側於右鎖骨下動脈處由迷走神經分出，從動脈下方繞到後方再上行，起點位置較高 | `recurrent laryngeal nerve`、`Subclavian artery` | 示意 |
| 左喉返神經 | 左側於主動脈弓處由迷走神經分出，從弓下方繞到後方再上行，起點位置較低 | `recurrent laryngeal nerve`、`Arch of aorta` | 示意 |
| 長胸神經 | 由臂叢神經根（C5–C7）發出，沿胸廓側壁下行，伴外側胸動脈，終點前鋸肌 | `Long thoracic nerve`、`Lateral thoracic artery` | 有 |
| 內側胸神經 | 由臂叢內側束發出，穿胸小肌，支配胸小肌與胸大肌 | `Medial pectoral nerve`、`pectoralis minor` | 有 |
| 外側胸神經 | 由臂叢外側束發出，支配胸大肌，**不穿胸小肌**，由其內側緣旁繞過；與內側胸神經在胸肌間形成連結（胸襻） | `Lateral pectoral nerve`、`pectoralis minor` | 有（胸襻缺） |
| 交感神經幹 | 在後胸壁脊柱兩旁，像一串珠子；由上而下依序分出大、小、最小內臟神經 | `Sympathetic trunk`、`Ganglia of sympathetic trunk`、`greater splanchnic nerve`、`lesser splanchnic nerve`、`least splanchnic nerve` | 有／示意 |

#### 4.10.6 Back and neck: transverse cervical artery with accessory nerve; suboccipital region
#### 背與頸：橫頸動脈與副神經；枕下區

| 步驟 | 結構 | 模型名稱 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| 1 | 副神經（CN XI）：出頸靜脈孔，橫過頸後三角，進入斜方肌深面，沿深面下行（較長、偏向下） | `Accessory nerve (XI)`、`Trapezius`（模型名稱待核，實際為分部：`Descending part of trapezius`、`Transverse part of trapezius`、`Ascending part of trapezius`）、`Jugular foramen` | 有（頸靜脈孔為標誌） | 副神經同時支配胸鎖乳突肌 |
| 2 | 橫頸動脈（甲狀頸幹分支）：與副神經在斜方肌深面伴行，淺支較短、偏橫行 | `transverse cervical artery`、`thyrocervical trunk`、`superficial cervical artery` | 有（淺支個別缺） | 橫頸動脈在肩胛上動脈上方 |
| 3 | 椎動脈：進入枕下三角，在枕下三角內橫過寰椎後弓上方，再向上穿入枕骨大孔（不像枕下神經那樣真的鑽出） | `vertebral artery`、`obliquus capitis superior`、`obliquus capitis inferior`、`rectus capitis posterior major`、`Right suboccipital triangle`／`Left suboccipital triangle` | 有（空間示意） | 枕下三角三邊：頭上斜肌、頭下斜肌、大後頭直肌；屋頂為頭半棘肌 |
| 4 | 枕下神經（C1後支）：由枕下三角鑽出 | `Suboccipital nerve` | 示意（覆蓋資料記為示意模型；網格在建置產生的資料包，已提交清單查不到，待核） | |
| 5 | 枕大神經（C2後支）：由頭下斜肌下方穿出，向上到頭皮後部 | `Greater occipital nerve`、`obliquus capitis inferior` | 示意（同上，待核） | |
| 6 | 枕動脈（外頸動脈分支）：在頭上斜肌外上方，被二腹肌後腹覆蓋；與耳後動脈區分 | **缺**（覆蓋資料把「枕動脈」對到大腦的 `Lateral occipital artery`，疑似誤對，見 D29） | 缺 | 見 5.5；耳後動脈缺（待核） |

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

### 5.5 缺漏的血管、神經與標誌（血管與胸背部）

| 結構 | 為什麼缺／現況 | 建議處理 |
| --- | --- | --- |
| 閉孔動脈 Obturator artery | 模型只有閉孔靜脈與閉孔神經 | 不畫動脈線；高亮閉孔神經與閉孔靜脈，文字說明動脈與神經同行。若要補，需有閉孔管標誌（見 5.2），以示意模型接在內髂動脈與閉孔之間 |
| 外頸動脈的枕動脈、耳後動脈 | 沒有；覆蓋資料把「枕動脈」對到 `Lateral occipital artery`（大腦血管），疑似誤對 | 路徑中以文字帶過；建議另案更正覆蓋資料（需人工審核） |
| 內側蹠靜脈 | 已提交清單查不到（外側蹠靜脈為示意） | 文字帶過，用足底靜脈弓代替 |
| 趾動脈、蹠側蹠動脈 | 沒有；足底弓有 | 終點以足底弓為止，趾端用文字 |
| 股深動脈、旋股動脈、穿通支、淺旋髂、淺外陰、深外陰動脈 | 已有示意 | 沿用；動畫標「示意」 |
| 穿通支 | 示意版（`Perforating branch of deep femoral artery`）與 BodyParts3D 的 `Set of perforating arteries`、`Distal perforating artery` 並存 | 待核：動畫用哪一組（見問題） |
| 脛後動脈中段偏離（已知） | 動脈偏內側約 20 mm | 動畫在此段允許神經與動脈不貼合，或先修動脈（另案） |
| 腓骨皮瓣相關 | 不需要 | — |
| 隱靜脈裂孔、卵圓窩 | 缺 | 以闊筋膜張肌、縫匠肌、內收長肌邊界與股靜脈高亮，文字說明；不做空間 |
| 三角胸肌溝 | 缺 | 以三角肌與胸大肌邊界高亮 |
| 胸襻（內外側胸神經間連結） | 缺 | 文字帶過 |
| 前肋間動脈、後肋間動脈 | 前肋間動脈（示意）、後肋間動脈（BodyParts3D，成組網格）有；個別肋間的對應待核 | 路徑用成組網格 |
| 降主動脈 | `Descending thoracic aorta` 與 `Descending aorta` 兩個網格 | 待核：是否重複，動畫用其一 |
| 副半奇、半奇靜脈與肋間靜脈之連接 | 肋間靜脈為成組示意 | 路徑止於注入奇靜脈 |

## 6. 動畫階段的共通規格與分批建議（供審核；核准後才實作）

### 6.1 共通規格

- 發光點沿路徑移動：神經由根到末梢，動脈由近到遠，靜脈由遠到心；相機跟隨。
- 每個「分支點」（動脈與靜脈的匯入點也算）停約 1 秒，並依序列出分支名稱。
- 每個步驟高亮其標誌，其餘結構淡化；肌肉點亮；神經終點顯示皮區（見 5.3）。
- 側面板逐步文字：英文在上，中文在下；用台灣醫學用語；全部為自己撰寫。
- 左右兩側都可播放；兩側資料同一份路徑，由 `side` 展開。
- 缺的步驟：以文字顯示，不畫線，鏡頭停在前後兩個真實標誌之間。
- 動畫不改模型，也不改動作姿勢（沿用靜止姿勢）。

### 6.2 建議分批

| 批次 | 內容 | 理由 |
| --- | --- | --- |
| 1 | 下肢神經（4.1–4.6） | 模型最完整；皮區資料另案 |
| 2 | 下肢與骨盆動脈（4.8） | 神經批次完成後，伴行關係已建立；缺閉孔動脈、趾動脈 |
| 3 | 下肢靜脈（4.9） | 全部是現有網格；只缺少隱靜脈裂孔等標誌 |
| 4 | 胸部與背部（4.10） | 結構多、網格名稱需逐一核對；列為最後 |

每批各一個 PR，皆標【需人工審核】。動畫系統本體（播放器、資料讀取、檢查腳本）先隨第 1 批建立，之後各批只加資料檔。

---

## 7. 待使用者回答的問題（白話、精簡）

**位置關係：** 原問題 1–6（D1、D9、D12、D5、D22、D23）已由使用者決定，見 2.6。


**缺漏與做法**

7. 皮膚感覺區（5.3）是否同意在 `Skin` 網格上著色、另開 PR 做？核准前終點只顯示文字。
8. 缺的標誌（5.2）是否同意用「骨表面著色＋邊界結構高亮，必要時貼合邊界的半透明立體」？是否先補左側標誌？
9. **閉孔動脈**與**枕動脈（外頸動脈）**模型沒有，是否同意先不畫、用文字帶過？覆蓋資料把枕動脈對到大腦的血管，要不要另案改正？
10. **穿通支**有兩組網格（示意與 BodyParts3D）、**降主動脈**有兩個網格，動畫各用哪一組？
11. 陰部神經完整路徑（直腸下、會陰、陰莖背神經）要不要列入第 1 批？目前只做到分支點。
12. 髂腹下與髂腹股溝神經（軀幹）要保留嗎？副閉孔神經不納入可以嗎？
13. 資料位置已實作於 `lib/pathways/`（見 1.1 更新）；分批順序（下肢神經→下肢動脈→下肢靜脈→胸背）是否同意？

標「待核」的模型名稱（腰方肌、腹橫肌、腹內斜肌、提睪肌、伸趾短肌、蹠方肌、足骨間肌、胸骨、內側蹠靜脈等）在實作時用搜尋索引核對，不需要你回答。

走向已對照公開來源（Gray 1918／OpenStax）檢查，待使用者核對；位置關係另以內部對照資料交叉檢查，差異見 2.5。本文件未使用其他來源。


## 8. 與已 merge 的走向動畫資料的不一致處（只列出，不改動畫程式與資料）

比對對象：`lib/pathways/lower-limb.ts`、`lib/pathways/upper-limb.ts`、`lib/pathways/card-map.ts`、`docs/pathways-upper-limb.md`。以下由另一個工作階段處理。

| # | 項目 | 動畫資料現況 | 本文件（含六項決定） | 建議 |
| --- | --- | --- | --- | --- |
| 1 | 資料位置 | 在 `lib/pathways/` 與 `components/FlowAnimation/` | 原提案 `app/data/pathways/`（1.1 已更正） | 無需動作 |
| 2 | 股神經（決定 a） | 「沿髂肌表面下行，經腹股溝韌帶深面入大腿；不在股鞘內」 | 腹腔內行於腰大肌與髂肌之間；位於股動脈外側、股鞘外 | 補「腰大肌與髂肌之間」「股動脈外側」 |
| 3 | 脛神經與脛後動脈（決定 b） | 脛後動脈卡：「靠內側，與脛神經伴行，走在屈趾長肌與脛後肌之間」；脛神經卡：「在深淺肌群之間下行，與脛後動脈伴行」，沒有交叉描述 | 上段神經在動脈內側 → 後方交叉 → 下段外後方；肌肉位置沿用標準決定 1（屈趾長肌與屈拇長肌之間、脛後肌後面） | 補神經與動脈的相對位置；動脈卡「靠內側」與肌肉組合須與使用者最終說法對齊（D9 的肌肉部分仍待核） |
| 4 | 跗管內次序 | 脛後肌腱、屈趾長肌腱、脛後動脈、脛後靜脈、脛神經、屈拇長肌腱 | 相同（靜脈兩條夾著動脈） | 可補「靜脈兩條」 |
| 5 | 腓腸神經（決定 c） | 組成正確（內側腓腸皮神經＋腓腸交通支），但資訊卡沒有「組成有變異」的註明；另有「走在腓腸肌上方」一句語意不清 | 需註明組成有變異 | 補註；檢查該句 |
| 6 | 臀下神經（決定 f） | 「直接進入臀大肌」，沒有位置描述；四條次序（坐骨、後股皮、閉孔內肌神經、陰部）正確，但臀下神經不在次序裡 | 臀下神經位於坐骨神經內側、與股後皮神經同行，之後入臀大肌 | 補位置與同行；此神經為示意模型 |
| 7 | 閉孔神經 | 「沿骨盆側壁經閉孔管出骨盆」 | 本文件指出模型沒有閉孔管標誌、無法驗證神經是否過管 | 文字可保留（解剖上正確），但畫面無標誌 |
| 8 | 用詞 | 「坐骨大孔」「跗管」 | 本文件用「大坐骨孔」「跗隧道」 | 請使用者決定統一寫法（模型的空間名稱為跗隧道） |
| 9 | 內胸動脈（決定 e） | 動畫資料裡沒有內胸動脈（胸部尚未做） | 約第 6 肋間隙分為腹壁上動脈與肌膈動脈 | 胸部批次做時照此 |
| 10 | 鎖骨下、腋、肱動脈（決定 d） | 上肢資料：「越過第一肋外緣改稱腋動脈，過大圓肌下緣改稱肱動脈」 | 相同 | 已一致 |
| 11 | 內陰動脈與陰部神經 | 「內陰動脈走在陰部神經外側」 | 相同（D8 仍待核其餘說法） | 已一致 |
| 12 | 股三角與內收肌管 | 股三角由外到內 N／A／V／Y；隱神經與降膝動脈隱支同入管 | 相同 | 已一致 |


## 資訊卡「播放走向」對照（下肢）

規則：資訊卡上的結構（只限右側，或沒有左右之分的神經叢）若符合下表的名稱，卡片出現「播放走向」按鈕，進入走向動畫並跳到該步驟，高亮表中的路徑（比動畫更細的結構跳到所屬主幹並高亮主幹）。對照資料在 `lib/pathways/card-map.ts`，`scripts/test-flow-card-map.mjs` 檢查每一筆的步驟與路徑都存在。

| 類別 | 步驟 | 動畫標題 | 資訊卡名稱（去掉 right／left 後，小寫） | 高亮路徑 id |
|---|---|---|---|---|
| 神經 | 1 | 下肢神經從哪裡來 | lumbar plexus｜sacral plexus｜lumbosacral plexus｜anterior rami of lumbar nerves | — |
| 神經 | 2 | 股神經與外股皮神經 | femoral nerve | fem |
| 神經 | 2 | 股神經與外股皮神經 | lateral femoral cutaneous nerve | lfcn |
| 神經 | 3 | 股神經的分支 | anterior cutaneous branches of femoral nerve | afc1, afc2 |
| 神經 | 3 | 股神經的分支 | saphenous nerve｜infrapatellar branch of saphenous nerve｜medial crural cutaneous branches of saphenous nerve | saph |
| 神經 | 4 | 閉孔神經 | anterior branch of obturator nerve | obt_a |
| 神經 | 4 | 閉孔神經 | posterior branch of obturator nerve | obt_p |
| 神經 | 4 | 閉孔神經 | obturator nerve | obt |
| 神經 | 5 | 臀部的神經 | superior gluteal nerve | sgn |
| 神經 | 5 | 臀部的神經 | posterior femoral cutaneous nerve | pcnt |
| 神經 | 5 | 臀部的神經 | nerve to quadratus femoris muscle | nqf |
| 神經 | 5 | 臀部的神經 | pudendal nerve | pud |
| 神經 | 6 | 坐骨神經 | sciatic nerve | sci |
| 神經 | 7 | 膕窩與腓腸神經 | medial sural cutaneous nerve | msc |
| 神經 | 7 | 膕窩與腓腸神經 | sural communicating branch of common fibular nerve | scb |
| 神經 | 7 | 膕窩與腓腸神經 | sural nerve | sural |
| 神經 | 8 | 脛神經到足底 | tibial nerve | tib |
| 神經 | 8 | 脛神經到足底 | medial plantar nerve｜common plantar digital branches of medial plantar nerve｜proper plantar digital branches of medial plantar nerve | mpl |
| 神經 | 8 | 脛神經到足底 | lateral plantar nerve｜common plantar digital branches of lateral plantar nerve｜proper plantar digital branches of lateral plantar nerve | lpl |
| 神經 | 9 | 總腓神經 | common fibular nerve | cfib |
| 神經 | 10 | 深腓神經與淺腓神經 | deep fibular nerve｜muscular branches of deep fibular nerve｜dorsal digital branches of deep fibular nerve | dfib |
| 神經 | 10 | 深腓神經與淺腓神經 | superficial fibular nerve｜dorsal digital branches of superficial fibular nerve | sfib |
| 神經 | 10 | 深腓神經與淺腓神經 | medial dorsal cutaneous nerve of foot | mdcn |
| 神經 | 10 | 深腓神經與淺腓神經 | intermediate dorsal cutaneous nerve of foot | idcn |
| 血管 | 1 | 由主動脈到股動脈 | common iliac artery | cil |
| 血管 | 1 | 由主動脈到股動脈 | external iliac artery | eil |
| 血管 | 1 | 由主動脈到股動脈 | femoral artery | fa |
| 血管 | 1 | 由主動脈到股動脈 | femoral vein | v_fa |
| 血管 | 1 | 由主動脈到股動脈 | common iliac vein | v_cil |
| 血管 | 1 | 由主動脈到股動脈 | external iliac vein | v_eil |
| 血管 | 2 | 股動脈近端四條小分支 | superficial epigastric artery | sepa |
| 血管 | 2 | 股動脈近端四條小分支 | superficial epigastric vein | v_sepa |
| 血管 | 3 | 股深動脈 | descending branch of lateral circumflex femoral artery | lcfa_d |
| 血管 | 3 | 股深動脈 | lateral circumflex femoral artery | lcfa |
| 血管 | 3 | 股深動脈 | lateral circumflex femoral vein | v_lcfa |
| 血管 | 3 | 股深動脈 | medial circumflex femoral vein | v_mcfa |
| 血管 | 3 | 股深動脈 | deep femoral vein | v_pfa |
| 血管 | 4 | 內收肌管與降膝動脈 | descending genicular artery | dga |
| 血管 | 5 | 膕窩與膝動脈 | lateral｜superior lateral) superior genicular artery$｜^superior lateral genicular artery | gsl |
| 血管 | 5 | 膕窩與膝動脈 | medial superior｜superior medial) genicular artery | gsm |
| 血管 | 5 | 膕窩與膝動脈 | inferior lateral genicular artery | gil |
| 血管 | 5 | 膕窩與膝動脈 | inferior medial genicular artery | gim |
| 血管 | 5 | 膕窩與膝動脈 | middle genicular artery | gmid |
| 血管 | 5 | 膕窩與膝動脈 | popliteal artery | popa |
| 血管 | 5 | 膕窩與膝動脈 | popliteal vein｜genicular vein | v_popa |
| 血管 | 6 | 臀部的血管 | internal iliac artery | iil |
| 血管 | 6 | 臀部的血管 | internal iliac vein | v_iil |
| 血管 | 6 | 臀部的血管 | superior gluteal vein | v_sga |
| 血管 | 6 | 臀部的血管 | inferior gluteal vein | v_iga |
| 血管 | 6 | 臀部的血管 | internal pudendal vein | v_ipa |
| 血管 | 6 | 臀部的血管 | obturator vein | v_obta |
| 血管 | 7 | 脛前動脈與足背動脈 | anterior tibial artery｜anterior tibial recurrent artery | ata |
| 血管 | 7 | 脛前動脈與足背動脈 | anterior tibial vein | v_ata |
| 血管 | 7 | 脛前動脈與足背動脈 | dorsalis pedis artery｜arcuate artery | dpa |
| 血管 | 7 | 脛前動脈與足背動脈 | deep plantar artery | dpla |
| 血管 | 8 | 脛後動脈、腓動脈與足底 | posterior tibial artery | pta |
| 血管 | 8 | 脛後動脈、腓動脈與足底 | posterior tibial vein | v_pta |
| 血管 | 8 | 脛後動脈、腓動脈與足底 | fibular vein | v_fiba |
| 血管 | 8 | 脛後動脈、腓動脈與足底 | fibular artery | fiba |
| 血管 | 8 | 脛後動脈、腓動脈與足底 | medial plantar artery｜superficial medial plantar artery | mpa |
| 血管 | 8 | 脛後動脈、腓動脈與足底 | lateral plantar artery | lpa |
| 血管 | 8 | 脛後動脈、腓動脈與足底 | plantar arch | dpar |
| 血管 | 8 | 脛後動脈、腓動脈與足底 | plantar venous arch of foot | v_dpar |
| 血管 | 9 | 大隱靜脈 | great saphenous vein | gsv |
| 血管 | 10 | 小隱靜脈 | small saphenous vein | ssv |

### 目前沒有對應資訊卡的路徑

以下動畫路徑在網站目前沒有同名資訊卡，所以沒有按鈕；之後補結構時一併補資訊卡並加入上表。列出路徑 id 與所在步驟（括號內為該步驟畫面上的標籤名稱，供對照）。

- 神經第 2 步「股神經與外股皮神經」：fem_r2、fem_r3、fem_r4（標籤：股神經、外股皮神經、腹股溝韌帶、股動脈）
- 神經第 3 步「股神經的分支」：fem_m1、fem_m2、fem_vm（標籤：前股皮神經、股四頭肌、至股內側肌神經、隱神經）
- 神經第 4 步「閉孔神經」：obt_g（標籤：閉孔神經、前支、後支、股薄肌）
- 神經第 5 步「臀部的神經」：sci_r4、sci_r5、sci_s1、sci_s2、sci_s3、ign、noi（標籤：臀上神經、梨狀肌、臀下神經、後股皮神經、陰部神經）
- 神經第 7 步「膕窩與腓腸神經」：lsc、ldcn（標籤：內側腓腸皮神經、外側腓腸皮神經、腓腸交通支、腓腸神經、外側足背皮神經）
- 神經第 8 步「脛神經到足底」：ppd、cpd1、cpd2、cpd3、lpl_s、lpl_d（標籤：脛神經、跗管、內蹠神經、外蹠神經）
- 神經第 10 步「深腓神經與淺腓神經」：dfib_m、dfib_l（標籤：淺腓神經、深腓神經、內側足背皮神經、中間足背皮神經）
- 血管第 1 步「由主動脈到股動脈」：aorta（標籤：髂總動脈、髂外動脈、股動脈、股靜脈、股神經）
- 血管第 2 步「股動脈近端四條小分支」：scia、sepp、depp（標籤：淺旋髂動脈、淺腹壁動脈、淺外陰動脈、深外陰動脈、大隱靜脈）
- 血管第 3 步「股深動脈」：lcfa_a、lcfa_t、perf1、perf2、perf3（標籤：股深動脈、外旋股動脈、內旋股動脈、降支、穿通支）
- 血管第 4 步「內收肌管與降膝動脈」：dga_a、dga_s（標籤：降膝動脈、關節支、隱支、隱神經、內收肌裂孔）
- 血管第 6 步「臀部的血管」：sga_s、sga_d（標籤：臀上動脈、淺支、深支、臀下動脈、內陰動脈）
- 血管第 7 步「脛前動脈與足背動脈」：alma、amma（標籤：脛前動脈、前外踝動脈、前內踝動脈、足背動脈、深蹠動脈）
- 血管第 8 步「脛後動脈、腓動脈與足底」：cfa（標籤：脛後動脈、旋腓動脈、腓動脈、內蹠動脈、深蹠弓）
- 血管第 9 步「大隱靜脈」：dva_m（標籤：足背靜脈弓、內踝前側、大隱靜脈、隱神經、隱靜脈孔）
- 血管第 10 步「小隱靜脈」：dva_l（標籤：外踝後側、小隱靜脈、腓腸神經、匯入膕靜脈）
