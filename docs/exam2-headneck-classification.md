# 頭頸缺項 A／B／C 分類表（內部文件，不上網站）

2026-11-14 建立。對象：`docs/exam2-headneck-gap.md` 總表中站上沒有 3D 網格的 185 項（「缺」，含只有資訊卡、沒有 3D 者）。本檔只放在 `docs/`，只含結構名稱（英文＋中文）與我們自己寫的判斷，不可放進 `public/` 或 `dist/`。

**本檔沒有動任何模型，也沒有使用任何新來源。** 依 CLAUDE.md，任何來源與授權都要使用者確認後才可使用；下面的 A 類只列出「repo 內可查證已在站上、或站上已有的網格」，不代表已核准新增任何外部資料。所有位置與關係只供規劃，解剖內容由使用者人工核對；本檔不宣稱任何結構已經過解剖核對。

## 一、摘要

### 1.1 類別與數量

| 類別 | 定義 | 項數 |
|---|---|---|
| A | 有現成、授權清楚的模型，且 repo 內能查證來源確實有該結構（或該結構的承載骨骼網格已在站上） | 36 |
| B | 沒有現成模型（或來源未確認），需要手作示意結構 | 91 |
| C | 考試價值低，建議不建（只做資訊卡或相關搜尋），每項附一句理由 | 58 |
| 合計 | | 185 |

補充說明：
- A 的 36 項中，**28 項是骨性標記**（孔、裂、管、突、窩）：承載的骨骼網格（Mandible、Sphenoid bone、Occipital bone、Frontal bone、左右 temporal／maxilla／zygomatic／palatine bone）都已在站上，用骨面標示即可，不新增網格；孔洞在網格上是否清楚尚未在 3D 畫面確認。另 **8 項是「疑似站上已有」**（眼、內耳詳細模式與外耳），見第四節。真正「新引進外部模型」的 A 為 0 項。
- B 的來源欄位寫「來源未確認」：BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無該名稱，但 BodyParts3D 3.0 完整名單、Z-Anatomy 其他 FBX、Human Reference Atlas 其他器官組在 repo 內沒有可核對的清單，所以不能斷言「全世界沒有現成模型」，只能說「repo 內無法證實有」。第五節列出建議使用者確認的來源。
- 逐項表裡「必備清單 id」欄是 `docs/required-structures/head-neck.json` 的對應編號（只比對名稱，僅供對照）。

### 1.2 依使用者六個批次（分區）的數量

| 分區 | 項數 | A | B | C | A＋B（C 捨去後要做的） |
|---|---|---|---|---|---|
| 1 腦神經及其主要分支＋頸外動脈分支 | 61 | 0 | 40 | 21 | 40 |
| 2 喉與咽（軟骨、肌肉、神經） | 14 | 0 | 8 | 6 | 8 |
| 3 腺體 | 6 | 0 | 5 | 1 | 5 |
| 4 眼眶與耳剩餘結構 | 33 | 8 | 12 | 13 | 20 |
| 5 顱骨孔道與骨細部 | 34 | 28 | 1 | 5 | 29 |
| 6 筋膜與間隙 | 22 | 0 | 16 | 6 | 16 |
| 其他 | 15 | 0 | 9 | 6 | 9 |
| 合計 | 185 | 36 | 91 | 58 | 127 |

分區對應的取捨（我的歸法，使用者可改）：
- 分區 1 含所有腦神經分支、神經節與頸外動脈及其分支；動脈中屬眼動脈分支者歸 4（眼眶），屬甲狀腺者歸 3，上喉動脈歸 2。
- 扁桃體（顎、咽、舌、咽鼓管）原在腺體節，這裡歸 2（咽的淋巴組織）；甲狀腺的動、靜脈歸 3 與腺體一起做。
- 眼眶靜脈與眼球內血管歸 4；頭頸靜脈（外頸靜脈、顏面靜脈、下頷後靜脈、翼靜脈叢等）、淋巴、鼻腔不在六個批次內，歸「其他」，放最後。其中外頸靜脈、顏面靜脈、下頷後靜脈、翼靜脈叢原列高優先，使用者若要提前，可單獨拉出一個小 PR 放在批次 1 之後。

### 1.3 PR 切分建議（每個 PR 約 15–20 項，C 捨去、只做 A／B）

細分批次（超過 20 項者拆開）：分區 1 的 A＋B 共 40 項，拆成 1A／1B／1C／1D；分區 4 拆 4A／4B；分區 5 拆 5A／5B；分區 6 拆 6A／6B。依使用者的批次次序，相鄰的小批次合併成一個 PR：

| 建議 PR | 內容 | A＋B 項數 | 備註 |
|---|---|---|---|
| P1 | 1A＋1B 頸外動脈主幹與上頷動脈分支 | 14 | 上頷動脈分支多數是 C，只剩中腦膜動脈與下齒槽動脈 |
| P2 | 1C 三叉、顏面神經分支與副交感神經節 | 16 |  |
| P3 | 1D＋2 頸神經叢、頸交感、舌咽相關＋喉與咽 | 18 | 1D 內 3 項耳大、枕小、枕大神經與頸交感神經節需先做第四節確認，確認已有就從清單移除，項數會再減少 |
| P4 | 3＋4A 腺體與甲狀腺血管＋眼眶 | 18 | 4A 有 6 項疑似已有（眼詳細模式），先確認再做，項數可能大減 |
| P5 | 4B＋5A 耳＋顱底孔、裂、管 | 22 | 合計超過 20：5A 全是既有骨網格上的標示、工作量輕；若要嚴守 20，把 Foramen magnum 與 Hypoglossal canal 移到 P6 |
| P6 | 5B 顏面與翼顎區孔、突、窩 | 14 | 骨面標示為主 |
| P7 | 6A＋6B 筋膜、頸三角、窩、腦膜、頭皮層次 | 16 | 筋膜與空間的呈現方式需使用者先決定 |
| P8 | 其他 頭頸靜脈、鼻腔 | 9 | 淋巴 4 項為 C；若使用者要提前外頸靜脈等 4 項，另開小 PR |
| 合計 | | 127 | |

每個 PR 依 CLAUDE.md：改模型或解剖內容者標【需人工審核】、附前後截圖；PR 說明前三行寫「改了什麼／我要看哪裡／風險」；待審 PR 同時最多 5 個。

### 1.4 各細分批次的 A／B／C

| 批次 | 內容 | 項數 | A | B | C | A＋B |
|---|---|---|---|---|---|---|
| 1A | 頸外動脈主幹與主要分支 | 14 | 0 | 12 | 2 | 12 |
| 1B | 上頷動脈及其分支 | 17 | 0 | 2 | 15 | 2 |
| 1C | 三叉、顏面神經分支與副交感神經節 | 18 | 0 | 16 | 2 | 16 |
| 1D | 頸神經叢、頸交感神經節與舌咽相關 | 12 | 0 | 10 | 2 | 10 |
| 2 | 喉、咽、扁桃體與軟顎 | 14 | 0 | 8 | 6 | 8 |
| 3 | 腺體與甲狀腺血管 | 6 | 0 | 5 | 1 | 5 |
| 4A | 眼眶：血管與眼球細部 | 20 | 6 | 7 | 7 | 13 |
| 4B | 耳：外耳、中耳、內耳 | 13 | 2 | 5 | 6 | 7 |
| 5A | 顱底與眼眶孔、裂、管 | 15 | 15 | 0 | 0 | 15 |
| 5B | 顏面與翼顎區孔、突、窩，鼻骨細部 | 19 | 13 | 1 | 5 | 14 |
| 6A | 頸筋膜與頸三角 | 15 | 0 | 11 | 4 | 11 |
| 6B | 顱部窩、腦膜、頭皮層次 | 7 | 0 | 5 | 2 | 5 |
| 7 | 頭頸靜脈、淋巴、鼻腔 | 15 | 0 | 9 | 6 | 9 |

### 1.5 做不到查證的部分（請使用者留意）

1. **無法證實 B 類是否真的沒有現成模型**：repo 內只有 BodyParts3D 4.0 匯出（`public/models/atlas.json`：2,234 部件、3,432 概念）、站上的面部肌肉（3.0）、28 件 3.0 補充件清單、Z-Anatomy 神經模型（`nervous.glb` 709 個節點）與已萃取的 Z-Anatomy 肢體資料。BodyParts3D 3.0 完整名單、Z-Anatomy 的其他 FBX、Human Reference Atlas 的其他器官組不在 repo 內，**沒有核對，也沒有編造任何來源編號、檔名或授權**。
2. 沒有在 3D 畫面確認任何骨性標記所在的網格表面是否清楚；沒有確認眼、耳詳細模式的名稱表在畫面上是否可點選；沒有核對中文用詞。
3. 兩個詳細模式的來源（Ocularium、IE-Map）在 `public/ATTRIBUTION.md` 沒有條目（只在畫面側欄顯示來源與授權）；授權文字以 `app/micro-atlas.tsx` 顯示的為準，未查上游授權頁，請使用者確認。
4. 骨骼承載關係（哪個孔在哪塊骨）是一般解剖知識，位置不確定的已省略（例如顳線、顎管只標類別、不列承載骨）；所有位置請使用者核對，不宣稱已核對。
5. 「考試價值低」的 C 判斷是我的建議，與 `exam2-headneck-gap.md` 第八節的 P3 大致一致，但有三處不同：眼、耳詳細模式內已有的項目改列「疑似已有（A）」；鐙骨肌、鼓膜張肌改列 B（有神經支配題材）；鞏膜靜脈竇改列疑似已有。

## 二、分類方法與來源／授權表

### 2.1 判定順序

1. 先查名稱：在站上的 BodyParts3D 4.0 部件名與概念名、面部肌肉、Z-Anatomy 神經模型節點名、眼與內耳詳細模式名稱表中搜尋；已有同名者列為「疑似已有」。
2. 查得到來源實際含有該結構（或承載骨骼網格已在站上）→ A。
3. 查不到 → B（來源未確認）。
4. 考試價值低 → C（一句理由）。

### 2.2 本檔引用的授權文字（只列 repo 內可查到的原文名稱）

| 代號 | 來源 | 授權（repo 內文字） | 依據位置 |
|---|---|---|---|
| L1 | BodyParts3D 4.0 匯出（站上圖譜、骨骼） | 「CC Attribution 4.0 International」（CC BY 4.0）；同檔說明原始 OBJ 註解提到舊版「CC BY-SA 2.1 Japan」，以官方資料庫目前授權為準 | `public/ATTRIBUTION.md` 開頭段落 |
| L1b | BodyParts3D 3.0（面部肌肉、28 件補充件） | 「CC BY-SA 2.1 Japan」（`scripts/supplement-parts.json` 的 license 欄為 CC-BY-SA-2.1-JP） | `public/ATTRIBUTION.md`、`scripts/supplement-parts.json` |
| L2 | Z-Anatomy（神經模型 `nervous.glb`，commit `6c7f9016bd5899ac8edafd31b9900c151df42ed6`） | 「CC BY-SA 4.0」，並依其 License.txt 同時標示 BodyParts3D 出處 | `public/ATTRIBUTION.md` Peripheral nerves 段 |
| L3 | Human Reference Atlas / HuBMAP（眼詳細模式，Ocularium 眼模型） | 「CC BY 4.0」 | `app/micro-atlas.tsx` 的 MICRO_ATLASES；女性骨盆與乳房同一機構的資料見 `public/ATTRIBUTION.md` |
| L4 | IE-Map，LMU Munich（內耳詳細模式） | 「CC BY 4.0」 | `app/micro-atlas.tsx` 的 MICRO_ATLASES |

提醒：任務說明提到 BodyParts3D 為 CC BY-SA 2.1 JP；repo 內 4.0 匯出標示為 CC BY 4.0，3.0 件為 CC BY-SA 2.1 Japan，兩者並存，請使用者確認各批次採用的來源與授權。**依 CLAUDE.md，任何來源與授權都要使用者確認後才可使用；目前沒有任何新來源被使用。**

## 三、逐項分類

欄位：類＝A／B／C；旗標＝⚠ 疑似已有／待確認名稱／重複名稱；卡＝站上目前只有資訊卡（無 3D）。

### 批次 1A：頸外動脈主幹與主要分支（分區：1 腦神經及其主要分支＋頸外動脈分支，14 項）

| # | English | 中文 | 類 | 來源／依據 | 建議 | 旗標 | 必備清單 id |
|---|---|---|---|---|---|---|---|
| 1A1 | Superior thyroid artery | 上甲狀腺動脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0815 |
| 1A2 | Lingual artery | 舌動脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0421 |
| 1A3 | Facial artery | 顏面動脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0232 |
| 1A4 | Maxillary artery | 上頷動脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0456 |
| 1A5 | Superficial temporal artery | 淺顳動脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0785 |
| 1A6 | Ascending pharyngeal artery | 升咽動脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0056 |
| 1A7 | Occipital artery | 枕動脈 | B | 來源未確認；ATTRIBUTION 記載 Z-Anatomy 匯出只有「Occipital artery」分組節點、無獨立 mesh，且 BodyParts3D 4.0 的 occipital 概念都是腦內動脈 | 手作示意（示意模型）。 |  | RS-0527 |
| 1A8 | Posterior auricular artery | 耳後動脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0639 |
| 1A9 | Superior labial artery | 上唇動脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0798 |
| 1A10 | Inferior labial artery | 下唇動脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0319 |
| 1A11 | Ascending palatine artery | 升顎動脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0055 |
| 1A12 | Tonsillar artery (branch of facial artery) | 扁桃體動脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  |  |
| 1A13 | Transverse facial artery | 顏面橫動脈 | C | — | 不建：細小分支，只需知道起源動脈與供應區，資訊卡即可。 |  | RS-0885 |
| 1A14 | Lateral nasal artery | 鼻外側動脈 | C | — | 不建：細小分支，只需知道起源動脈與供應區，資訊卡即可。 |  | RS-0393 |

### 批次 1B：上頷動脈及其分支（分區：1 腦神經及其主要分支＋頸外動脈分支，17 項）

| # | English | 中文 | 類 | 來源／依據 | 建議 | 旗標 | 必備清單 id |
|---|---|---|---|---|---|---|---|
| 1B1 | Middle meningeal artery | 中腦膜動脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 已有資訊卡。 |  | RS-0488 |
| 1B2 | Inferior alveolar artery | 下齒槽動脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0312 |
| 1B3 | Deep temporal arteries | 深顳動脈 | C | — | 不建：細小分支，只需知道起源動脈與供應區，資訊卡即可。 |  |  |
| 1B4 | Deep auricular artery | 深耳動脈 | C | — | 不建：細小分支，只需知道起源動脈與供應區，資訊卡即可。 |  | RS-0174 |
| 1B5 | Anterior tympanic artery | 前鼓室動脈 | C | — | 不建：細小分支，只需知道起源動脈與供應區，資訊卡即可。 |  | RS-0041 |
| 1B6 | Accessory meningeal artery | 副腦膜動脈 | C | — | 不建：細小分支，只需知道起源動脈與供應區，資訊卡即可。 |  | RS-0002 |
| 1B7 | Masseteric artery | 咬肌動脈 | C | — | 不建：細小分支，只需知道起源動脈與供應區，資訊卡即可。 |  | RS-0448 |
| 1B8 | Buccal artery | 頰動脈 | C | — | 不建：細小分支，只需知道起源動脈與供應區，資訊卡即可。 |  | RS-0078 |
| 1B9 | Posterior superior alveolar artery | 後上齒槽動脈 | C | — | 不建：細小分支，只需知道起源動脈與供應區，資訊卡即可。 |  | RS-0655 |
| 1B10 | Middle superior alveolar artery | 中上齒槽動脈 | C | — | 不建：細小分支，只需知道起源動脈與供應區，資訊卡即可。 |  | RS-0493 |
| 1B11 | Anterior superior alveolar artery | 前上齒槽動脈 | C | — | 不建：細小分支，只需知道起源動脈與供應區，資訊卡即可。 |  | RS-0036 |
| 1B12 | Infraorbital artery | 眶下動脈 | C | — | 不建：細小分支，只需知道起源動脈與供應區，資訊卡即可。 |  | RS-0337 |
| 1B13 | Descending palatine artery | 下行顎動脈 | C | — | 不建：細小分支，只需知道起源動脈與供應區，資訊卡即可。 |  | RS-0189 |
| 1B14 | Greater palatine artery | 大顎動脈 | C | — | 不建：細小分支，只需知道起源動脈與供應區，資訊卡即可。 |  | RS-0280 |
| 1B15 | Lesser palatine artery | 小顎動脈 | C | — | 不建：細小分支，只需知道起源動脈與供應區，資訊卡即可。 |  | RS-0408 |
| 1B16 | Sphenopalatine artery | 蝶顎動脈 | C | — | 不建：細小分支，只需知道起源動脈與供應區，資訊卡即可。 |  | RS-0734 |
| 1B17 | Nasopalatine artery | 鼻顎動脈 | C | — | 不建：細小分支，只需知道起源動脈與供應區，資訊卡即可。 |  | RS-0511 |

### 批次 1C：三叉、顏面神經分支與副交感神經節（分區：1 腦神經及其主要分支＋頸外動脈分支，18 項）

| # | English | 中文 | 類 | 來源／依據 | 建議 | 旗標 | 必備清單 id |
|---|---|---|---|---|---|---|---|
| 1C1 | Trigeminal ganglion | 三叉神經節 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0890 |
| 1C2 | Auriculotemporal nerve | 耳顳神經 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0062 |
| 1C3 | Infraorbital nerve | 眶下神經 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0341 |
| 1C4 | Facial nerve branches (temporal, zygomatic, buccal, marginal mandibular, cervical) | 顏面神經分支（顳、顴、頰、下頷緣、頸） | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  |  |
| 1C5 | Deep temporal nerves | 深顳神經 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  |  |
| 1C6 | Masseteric nerve | 咬肌神經 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0450 |
| 1C7 | Zygomatic nerve (zygomaticotemporal / zygomaticofacial) | 顴神經（顴顳、顴面） | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  |  |
| 1C8 | Superior alveolar nerves (posterior / middle / anterior) | 上齒槽神經（後、中、前） | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  |  |
| 1C9 | Nasopalatine nerve | 鼻顎神經 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0512 |
| 1C10 | Greater / lesser palatine nerves | 大、小顎神經 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  |  |
| 1C11 | Greater petrosal nerve | 大岩神經 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0283 |
| 1C12 | Lesser petrosal nerve | 小岩神經 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0411 |
| 1C13 | Nerve of pterygoid canal (Vidian nerve) | 翼管神經 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  |  |
| 1C14 | Pterygopalatine ganglion | 翼顎神經節 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0683 |
| 1C15 | Otic ganglion | 耳神經節 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0568 |
| 1C16 | Submandibular ganglion | 下頷下神經節 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0773 |
| 1C17 | Deep petrosal nerve | 深岩神經 | C | — | 不建：細小神經或節，與所屬腦神經一起講述即可，資訊卡即可。 |  | RS-0181 |
| 1C18 | Geniculate ganglion | 膝狀神經節 | C | — | 不建：細小神經或節，與所屬腦神經一起講述即可，資訊卡即可。 |  | RS-0266 |

### 批次 1D：頸神經叢、頸交感神經節與舌咽相關（分區：1 腦神經及其主要分支＋頸外動脈分支，12 項）

| # | English | 中文 | 類 | 來源／依據 | 建議 | 旗標 | 必備清單 id |
|---|---|---|---|---|---|---|---|
| 1D1 | Carotid sinus | 頸動脈竇 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 已有資訊卡。 |  | RS-0091 |
| 1D2 | Carotid body | 頸動脈體 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 已有資訊卡。 |  | RS-0087 |
| 1D3 | Superior cervical ganglion | 上頸神經節 | B | 來源未確認；站上有 Z-Anatomy 的「Ganglia of sympathetic trunk」整組（nervous.glb 節點，CC BY-SA 4.0），單一神經節是否可分開點選未確認（必備清單判為別名） | 先確認既有交感神經節是否已含此節，再決定是否拆出或補示意。 | ⚠ 待確認名稱 | RS-0791 |
| 1D4 | Ansa cervicalis (superior and inferior roots) | 頸襻（上根、下根） | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  |  |
| 1D5 | Middle / inferior cervical ganglia, stellate ganglion | 中、下頸神經節、星狀神經節 | B | 來源未確認；站上有 Z-Anatomy 的「Ganglia of sympathetic trunk」整組（nervous.glb 節點，CC BY-SA 4.0），單一神經節是否可分開點選未確認（必備清單判為別名） | 先確認既有交感神經節是否已含此節，再決定是否拆出或補示意。 | ⚠ 待確認名稱 |  |
| 1D6 | Great auricular nerve | 耳大神經 | B | 站上已有手作示意管狀模型（public/ATTRIBUTION.md「suboccipital…」段；必備清單判定 FOUND），比對漏掉；非第三方幾何 | 先確認後從缺項移除，不需新建。 | ⚠ 疑似已有 | RS-0275 |
| 1D7 | Lesser occipital nerve | 枕小神經 | B | 站上已有手作示意管狀模型（public/ATTRIBUTION.md「suboccipital…」段；必備清單判定 FOUND），比對漏掉；非第三方幾何 | 先確認後從缺項移除，不需新建。 | ⚠ 疑似已有 | RS-0407 |
| 1D8 | Greater occipital nerve | 枕大神經 | B | 站上已有手作示意管狀模型（public/ATTRIBUTION.md「suboccipital…」段；必備清單判定 FOUND），比對漏掉；非第三方幾何 | 先確認後從缺項移除，不需新建。 | ⚠ 疑似已有 | RS-0279 |
| 1D9 | Transverse cervical nerve | 頸橫神經 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0883 |
| 1D10 | Supraclavicular nerves | 鎖骨上神經 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0819 |
| 1D11 | Superior and inferior ganglia of glossopharyngeal nerve | 舌咽神經上、下神經節 | C | — | 不建：細小神經或節，與所屬腦神經一起講述即可，資訊卡即可。 已有資訊卡。 |  |  |
| 1D12 | Carotid sinus nerve | 頸動脈竇神經 | C | — | 不建：細小神經或節，與所屬腦神經一起講述即可，資訊卡即可。 |  |  |

### 批次 2：喉、咽、扁桃體與軟顎（分區：2 喉與咽（軟骨、肌肉、神經），14 項）

| # | English | 中文 | 類 | 來源／依據 | 建議 | 旗標 | 必備清單 id |
|---|---|---|---|---|---|---|---|
| 21 | Superior laryngeal artery | 上喉動脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0800 |
| 22 | Palatine tonsil | 顎扁桃體 | B | 來源未確認；BodyParts3D 4.0 匯出查無 | 手作示意（示意模型）。 |  | RS-0577 |
| 23 | Pharyngeal tonsil (adenoid) | 咽扁桃體 | B | 來源未確認；BodyParts3D 4.0 匯出查無 | 手作示意（示意模型）。 |  |  |
| 24 | Lingual tonsil | 舌扁桃體 | B | 來源未確認；BodyParts3D 4.0 匯出查無 | 手作示意（示意模型）。 |  | RS-0425 |
| 25 | Tubal tonsil | 咽鼓管扁桃體 | C | — | 不建：小型腺體或淋巴組織，體積極小，資訊卡即可。 |  | RS-0895 |
| 26 | Superior laryngeal nerve (internal and external branches) | 上喉神經（內支、外支） | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  |  |
| 27 | Pharyngeal plexus | 咽神經叢 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0617 |
| 28 | Palatine aponeurosis | 顎腱膜 | C | — | 不建：軟顎內的腱膜，與軟顎肌一起說明，單獨建模價值低。 |  | RS-0572 |
| 29 | Pharynx (nasopharynx, oropharynx, laryngopharynx) | 咽（鼻咽、口咽、喉咽） | B | 來源未確認；BodyParts3D 4.0 概念 subdivision of pharynx／laryngopharynx 只對應 Epiglottis 一件 mesh，不是咽腔 | 空間示意（咽腔，貼合既有咽縮肌與軟顎），使用者先決定三段是否要分開。 |  |  |
| 210 | Palatoglossal arch / palatopharyngeal arch | 顎舌弓、顎咽弓 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  |  |
| 211 | Salpingopharyngeal fold, pharyngeal recess | 耳咽管咽褶、咽隱窩 | C | — | 不建：咽黏膜的小褶與隱窩，改用相關搜尋指向咽鼓管咽肌（站上已有 Salpingopharyngeus）。 |  |  |
| 212 | Aryepiglottic fold | 杓會厭褶 | C | — | 不建：黏膜褶，改用相關搜尋指向杓會厭肌。 |  | RS-0052 |
| 213 | Vocal fold / laryngeal ventricle / vestibular fold | 聲帶（聲襞）、喉室、前庭襞 | C | — | 不建：黏膜皺襞與腔室，改用相關搜尋指向站上已有的聲帶韌帶與聲帶肌。 |  |  |
| 214 | Uvula | 懸雍垂 | C | — | 不建：站上以懸雍垂肌呈現（BodyParts3D 4.0 概念 FMA55022 uvula 對應的就是這一件 mesh），改用相關搜尋即可。 |  | RS-0902 |

### 批次 3：腺體與甲狀腺血管（分區：3 腺體，6 項）

| # | English | 中文 | 類 | 來源／依據 | 建議 | 旗標 | 必備清單 id |
|---|---|---|---|---|---|---|---|
| 31 | Superior / middle / inferior thyroid veins | 上、中、下甲狀腺靜脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  |  |
| 32 | Middle thyroid artery / Thyroid ima artery | 中甲狀腺動脈／最下甲狀腺動脈 | C | — | 不建：細小分支，只需知道起源動脈與供應區，資訊卡即可。 |  |  |
| 33 | Parotid gland | 腮腺（耳下腺） | B | 來源未確認；BodyParts3D 4.0 匯出（2,234 部件、3,432 概念）查無，3.0 完整名單與 Z-Anatomy 其他 FBX、HRA 其他器官組 repo 內無清單 | 手作示意（示意模型）。 |  | RS-0596 |
| 34 | Thyroid gland | 甲狀腺 | B | 來源未確認；BodyParts3D 4.0 匯出（2,234 部件、3,432 概念）查無，3.0 完整名單與 Z-Anatomy 其他 FBX、HRA 其他器官組 repo 內無清單 | 手作示意（示意模型）。 |  | RS-0866 |
| 35 | Parathyroid glands | 副甲狀腺 | B | 來源未確認；BodyParts3D 4.0 匯出（2,234 部件、3,432 概念）查無，3.0 完整名單與 Z-Anatomy 其他 FBX、HRA 其他器官組 repo 內無清單 | 手作示意（示意模型）。 |  | RS-0588 |
| 36 | Parotid duct | 腮腺管（耳下腺管） | B | 來源未確認；BodyParts3D 4.0 匯出（2,234 部件、3,432 概念）查無，3.0 完整名單與 Z-Anatomy 其他 FBX、HRA 其他器官組 repo 內無清單 | 手作示意（示意模型）。 |  | RS-0594 |

### 批次 4A：眼眶：血管與眼球細部（分區：4 眼眶與耳剩餘結構，20 項）

| # | English | 中文 | 類 | 來源／依據 | 建議 | 旗標 | 必備清單 id |
|---|---|---|---|---|---|---|---|
| 4A1 | Supraorbital artery | 眶上動脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0821 |
| 4A2 | Supratrochlear artery | 滑車上動脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0829 |
| 4A3 | Central artery of retina | 視網膜中央動脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0097 |
| 4A4 | Supraorbital vein | 眶上靜脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0825 |
| 4A5 | Supratrochlear vein | 滑車上靜脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0831 |
| 4A6 | Superior ophthalmic vein | 上眼靜脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0807 |
| 4A7 | Inferior ophthalmic vein | 下眼靜脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0327 |
| 4A8 | Anterior ciliary arteries | 前睫動脈 | C | — | 不建：眼球內的細小動脈，只需知道起源（眼動脈）與供應區，資訊卡即可。 |  |  |
| 4A9 | Short posterior ciliary arteries | 短後睫動脈 | C | — | 不建：眼球內的細小動脈，只需知道起源（眼動脈）與供應區，資訊卡即可。 |  |  |
| 4A10 | Long posterior ciliary arteries | 長後睫動脈 | C | — | 不建：眼球內的細小動脈，只需知道起源（眼動脈）與供應區，資訊卡即可。 |  |  |
| 4A11 | Infraorbital / infratrochlear veins | 眶下、滑車下靜脈 | C | — | 不建：屬次要的頭頸靜脈小支，路徑記回流方向即可，資訊卡即可。 |  |  |
| 4A12 | Scleral venous sinus | 鞏膜靜脈竇 | A | 疑似站上已有：眼詳細模式（Human Reference Atlas，Ocularium 眼模型，CC BY 4.0；名稱表見 app/micro-atlas.tsx）已有該名稱，執行階段才載入，所以比對漏掉（Schlemm's canal 即鞏膜靜脈竇；同義名需使用者確認）。授權見來源表 L3 | 先確認詳細模式是否已可點選此結構，再決定是否只補資訊卡或別名。 | ⚠ 疑似已有 |  |
| 4A13 | Excretory ducts of lacrimal gland | 淚腺排泄管 | C | — | 不建：小型腺體或淋巴組織，體積極小，資訊卡即可。 |  | RS-0219 |
| 4A14 | Optic disc (blind spot), macula lutea, fovea centralis | 視神經盤、黃斑、中央小凹 | A | 疑似站上已有：眼詳細模式（Human Reference Atlas，Ocularium 眼模型，CC BY 4.0；名稱表見 app/micro-atlas.tsx）已有該名稱，執行階段才載入，所以比對漏掉（Optic disc、Macula lutea、Fovea）。授權見來源表 L3 | 先確認詳細模式是否已可點選此結構，再決定是否只補資訊卡或別名。 | ⚠ 疑似已有 |  |
| 4A15 | Conjunctiva (palpebral / bulbar) | 結膜（瞼、球） | A | 疑似站上已有：眼詳細模式（Human Reference Atlas，Ocularium 眼模型，CC BY 4.0；名稱表見 app/micro-atlas.tsx）已有該名稱，執行階段才載入，所以比對漏掉（Upper/Lower palpebral conjunctiva、Bulbar conjunctiva）。授權見來源表 L3 | 先確認詳細模式是否已可點選此結構，再決定是否只補資訊卡或別名。 | ⚠ 疑似已有 |  |
| 4A16 | Ora serrata | 鋸齒緣 | A | 疑似站上已有：眼詳細模式（Human Reference Atlas，Ocularium 眼模型，CC BY 4.0；名稱表見 app/micro-atlas.tsx）已有該名稱，執行階段才載入，所以比對漏掉（Ora serrata）。授權見來源表 L3 | 先確認詳細模式是否已可點選此結構，再決定是否只補資訊卡或別名。 | ⚠ 疑似已有 | RS-0556 |
| 4A17 | Superior tarsal muscle (Muller) | 上瞼板肌 | C | — | 不建：眼瞼內極薄的平滑肌，單獨建模價值低，資訊卡即可。 |  |  |
| 4A18 | Retina layers (neural layer / pigment layer) | 視網膜分層（神經層、色素層） | C | — | 不建：組織層級的分層，眼詳細模式只有整體視網膜，資訊卡即可。 |  |  |
| 4A19 | Ciliary processes / ciliary muscle | 睫狀突、睫狀肌 | A | 疑似站上已有：眼詳細模式（Human Reference Atlas，Ocularium 眼模型，CC BY 4.0；名稱表見 app/micro-atlas.tsx）已有該名稱，執行階段才載入，所以比對漏掉（Ciliary processes、Ciliary muscle、Ciliary body）；BodyParts3D 4.0 另有 Left/Right corona ciliaris。授權見來源表 L3 | 先確認詳細模式是否已可點選此結構，再決定是否只補資訊卡或別名。 | ⚠ 疑似已有 |  |
| 4A20 | Posterior chamber / aqueous humor | 後房、房水 | A | 疑似站上已有：眼詳細模式（Human Reference Atlas，Ocularium 眼模型，CC BY 4.0；名稱表見 app/micro-atlas.tsx）已有該名稱，執行階段才載入，所以比對漏掉（只有 Aqueous humour；Posterior chamber 無獨立名稱，來源未確認）。授權見來源表 L3 | 先確認詳細模式是否已可點選此結構，再決定是否只補資訊卡或別名。 | ⚠ 疑似已有 |  |

### 批次 4B：耳：外耳、中耳、內耳（分區：4 眼眶與耳剩餘結構，13 項）

| # | English | 中文 | 類 | 來源／依據 | 建議 | 旗標 | 必備清單 id |
|---|---|---|---|---|---|---|---|
| 4B1 | Labyrinthine artery | 迷路動脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 已有資訊卡。 |  | RS-0376 |
| 4B2 | Ceruminous glands | 耵聹腺 | C | — | 不建：小型腺體或淋巴組織，體積極小，資訊卡即可。 |  |  |
| 4B3 | Tympanic plexus / tympanic nerve | 鼓室神經叢 | C | — | 不建：細小神經或節，與所屬腦神經一起講述即可，資訊卡即可。 |  |  |
| 4B4 | Spiral ganglion | 螺旋神經節 | C | — | 不建：細小神經或節，與所屬腦神經一起講述即可，資訊卡即可。 已有資訊卡。 |  |  |
| 4B5 | Vestibular ganglion (Scarpa) | 前庭神經節 | C | — | 不建：細小神經或節，與所屬腦神經一起講述即可，資訊卡即可。 已有資訊卡。 |  |  |
| 4B6 | Malleus, incus, stapes | 錘骨、砧骨、鐙骨 | B | 來源未確認；內耳詳細模式名稱表（IE-Map）與 BodyParts3D 4.0 皆無此名稱 | 手作示意（示意模型）。 已有資訊卡。 |  |  |
| 4B7 | Auricle (pinna) | 耳殼 | A | 疑似站上已有：BodyParts3D 4.0 匯出有一件 External ear（FJ2811，概念 FMA52781，atlas.json 可查）；是否就是耳殼、畫面上是否完整需使用者確認。授權見來源表 L1 | 先確認詳細模式是否已可點選此結構，再決定是否只補資訊卡或別名。 | ⚠ 疑似已有 |  |
| 4B8 | External acoustic meatus (canal) | 外耳道 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意；與骨性外耳道（5A 同名項）是同一個名稱，建議合併成一個可點選結構。 | ⚠ 重複名稱 |  |
| 4B9 | Membranous labyrinth: utricle, saccule, cochlear duct | 膜迷路：橢圓囊、球囊、耳蝸管 | A | 疑似站上已有：內耳詳細模式（IE-Map，LMU Munich，CC BY 4.0；名稱表見 app/micro-atlas.tsx）有 Utricle、Saccule、Anterior/Lateral/Posterior semicircular duct；名稱表沒有 Cochlear duct（該項來源未確認）。授權見來源表 L4 | 先確認詳細模式是否已可點選此結構，再決定是否只補資訊卡或別名。 已有資訊卡。 | ⚠ 疑似已有 |  |
| 4B10 | Oval window / round window | 卵圓窗、圓窗 | B | 來源未確認；內耳詳細模式名稱表（IE-Map）與 BodyParts3D 4.0 皆無此名稱 | 手作示意（示意模型）。 已有資訊卡。 |  |  |
| 4B11 | Auricular muscles | 耳肌 | C | — | 不建：人類耳肌退化、功能小，考題少。 |  | RS-0061 |
| 4B12 | Stapedius, tensor tympani | 鐙骨肌、鼓膜張肌 | B | 來源未確認；內耳詳細模式名稱表（IE-Map）與 BodyParts3D 4.0 皆無此名稱 | 手作示意（示意模型）。 |  |  |
| 4B13 | Organ of Corti, basilar membrane, tectorial membrane | 柯氏器、底膜、覆膜 | C | — | 不建：顯微層級構造，資訊卡即可。 已有資訊卡。 |  |  |

### 批次 5A：顱底與眼眶孔、裂、管（分區：5 顱骨孔道與骨細部，15 項）

| # | English | 中文 | 類 | 來源／依據 | 建議 | 旗標 | 必備清單 id |
|---|---|---|---|---|---|---|---|
| 5A1 | Stylomastoid foramen | 莖乳突孔 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Left/Right temporal bone；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  | RS-0761 |
| 5A2 | Foramen ovale | 卵圓孔 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Sphenoid bone；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  | RS-0249 |
| 5A3 | Foramen spinosum | 棘孔 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Sphenoid bone；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  | RS-0251 |
| 5A4 | Foramen rotundum | 圓孔 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Sphenoid bone；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  | RS-0250 |
| 5A5 | Carotid canal | 頸動脈管 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Left/Right temporal bone；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 已有資訊卡。 |  | RS-0088 |
| 5A6 | Hypoglossal canal | 舌下神經管 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Occipital bone；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  | RS-0304 |
| 5A7 | Optic canal | 視神經管 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Sphenoid bone；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 已有資訊卡。 |  | RS-0546 |
| 5A8 | Superior orbital fissure | 眶上裂 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Sphenoid bone；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  | RS-0808 |
| 5A9 | Inferior orbital fissure | 眶下裂 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Sphenoid bone 與 Left/Right maxilla 之間；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  | RS-0328 |
| 5A10 | Foramen magnum | 枕骨大孔 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Occipital bone；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 已有資訊卡。 |  | RS-0248 |
| 5A11 | Foramen lacerum | 破裂孔 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Sphenoid bone、temporal bone、Occipital bone 之間；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  | RS-0247 |
| 5A12 | Petrotympanic fissure | 岩鼓裂 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Left/Right temporal bone；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  | RS-0612 |
| 5A13 | Pterygoid canal | 翼管 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Sphenoid bone；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  | RS-0673 |
| 5A14 | Internal acoustic meatus | 內耳道 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Left/Right temporal bone；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  | RS-0355 |
| 5A15 | External acoustic meatus | 外耳道 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Left/Right temporal bone；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 與 4B 的軟組織外耳道同名，建議合併。 | ⚠ 重複名稱 | RS-0220 |

### 批次 5B：顏面與翼顎區孔、突、窩，鼻骨細部（分區：5 顱骨孔道與骨細部，19 項）

| # | English | 中文 | 類 | 來源／依據 | 建議 | 旗標 | 必備清單 id |
|---|---|---|---|---|---|---|---|
| 5B1 | Mental foramen | 頦孔 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Mandible；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  | RS-0475 |
| 5B2 | Supraorbital foramen / notch | 眶上孔（切跡） | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Frontal bone；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  |  |
| 5B3 | Infraorbital foramen | 眶下孔 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Left/Right maxilla；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  | RS-0338 |
| 5B4 | Mandibular foramen | 下頷孔 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Mandible；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  | RS-0442 |
| 5B5 | Zygomatic arch | 顴弓 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Left/Right zygomatic bone 與 temporal bone；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  | RS-0921 |
| 5B6 | Greater / lesser palatine foramina | 大、小顎孔 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Left/Right palatine bone；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  |  |
| 5B7 | Sphenopalatine foramen | 蝶顎孔 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Left/Right palatine bone 與 Sphenoid bone 之間；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  | RS-0735 |
| 5B8 | Pterygomaxillary fissure | 翼上頷裂 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Left/Right maxilla 與 Sphenoid bone 之間；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  | RS-0681 |
| 5B9 | Pterygoid process (medial / lateral plates) | 翼突（內、外側板） | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Sphenoid bone；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  |  |
| 5B10 | Coronoid process / condylar process of mandible | 下頷骨冠狀突、髁突 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Mandible；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  |  |
| 5B11 | Ramus and angle of mandible | 下頷枝與下頷角 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Mandible；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  |  |
| 5B12 | Mandibular fossa and articular tubercle | 下頷窩、關節結節 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Left/Right temporal bone；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  |  |
| 5B13 | Greater wing / lesser wing / body of sphenoid bone | 蝶骨大翼、小翼、體 | A | 既有 BodyParts3D 4.0 骨骼網格已在站上（Sphenoid bone；atlas.json 可查），以骨面標示，不新增網格。授權見來源表 L1 | 骨面標示；孔、裂在網格上是否清楚尚未在 3D 畫面確認。 |  |  |
| 5B14 | Palatine canal / palatovaginal canal | 顎管、顎鞘管 | C | — | 不建：顱骨上的細小通道，考題少，資訊卡說明通過的結構即可。 |  |  |
| 5B15 | Temporal lines (superior / inferior) | 顳線（上、下） | C | — | 不建：顱骨表面的細線標記，考題少，資訊卡即可。 |  |  |
| 5B16 | Infratemporal crest | 顳下嵴 | C | — | 不建：蝶骨表面的小嵴，考題少，資訊卡即可。 |  | RS-0343 |
| 5B17 | Carotid tubercle | 頸動脈結節 | C | — | 不建：頸椎的小結節標記，考題少，資訊卡即可。 |  | RS-0093 |
| 5B18 | Paranasal sinuses (maxillary, frontal, ethmoidal, sphenoid) | 鼻竇（上頷、額、篩、蝶） | B | 來源未確認；BodyParts3D 4.0 匯出查無竇腔；Ethmoid、Left/Right maxilla、Frontal bone、Sphenoid bone 骨骼網格已在站上 | 空間示意（貼合骨骼的半透明立體），使用者先決定四個竇是否一併建。 |  |  |
| 5B19 | Middle / superior nasal conchae | 中、上鼻甲 | C | — | 不建：篩骨上的鼻甲，次要題材；資訊卡即可（篩骨在站上已有一件 Ethmoid）。 |  |  |

### 批次 6A：頸筋膜與頸三角（分區：6 筋膜與間隙，15 項）

| # | English | 中文 | 類 | 來源／依據 | 建議 | 旗標 | 必備清單 id |
|---|---|---|---|---|---|---|---|
| 6A1 | Investing layer of deep cervical fascia | 頸深筋膜包覆層 | B | 來源未確認；筋膜無現成模型（BodyParts3D 4.0 的 investing fascia 概念只涵蓋四肢） | 筋膜示意（薄殼，貼合邊界結構）；呈現方式需使用者先決定。 |  |  |
| 6A2 | Carotid sheath | 頸動脈鞘 | B | 來源未確認；筋膜無現成模型（BodyParts3D 4.0 的 investing fascia 概念只涵蓋四肢） | 筋膜示意（薄殼，貼合邊界結構）；呈現方式需使用者先決定。 |  | RS-0090 |
| 6A3 | Occipital triangle (posterior triangle) | 枕三角（後三角） | B | 來源未確認；空間無現成模型，依 CLAUDE.md 特殊空間規則：高亮邊界結構，必要時貼合邊界的半透明立體 | 空間示意（不用平面或圓碟）。 |  |  |
| 6A4 | Supraclavicular triangle | 鎖骨上三角 | B | 來源未確認；空間無現成模型，依 CLAUDE.md 特殊空間規則：高亮邊界結構，必要時貼合邊界的半透明立體 | 空間示意（不用平面或圓碟）。 |  |  |
| 6A5 | Carotid triangle | 頸動脈三角 | B | 來源未確認；空間無現成模型，依 CLAUDE.md 特殊空間規則：高亮邊界結構，必要時貼合邊界的半透明立體 | 空間示意（不用平面或圓碟）。 |  | RS-0092 |
| 6A6 | Submental triangle | 頦下三角 | B | 來源未確認；空間無現成模型，依 CLAUDE.md 特殊空間規則：高亮邊界結構，必要時貼合邊界的半透明立體 | 空間示意（不用平面或圓碟）。 |  |  |
| 6A7 | Submandibular triangle | 下頷下三角 | B | 來源未確認；空間無現成模型，依 CLAUDE.md 特殊空間規則：高亮邊界結構，必要時貼合邊界的半透明立體 | 空間示意（不用平面或圓碟）。 |  | RS-0777 |
| 6A8 | Pretracheal fascia | 頸深筋膜氣管前層 | B | 來源未確認；筋膜無現成模型（BodyParts3D 4.0 的 investing fascia 概念只涵蓋四肢） | 筋膜示意（薄殼，貼合邊界結構）；呈現方式需使用者先決定。 |  | RS-0665 |
| 6A9 | Prevertebral fascia | 頸深筋膜椎前層 | B | 來源未確認；筋膜無現成模型（BodyParts3D 4.0 的 investing fascia 概念只涵蓋四肢） | 筋膜示意（薄殼，貼合邊界結構）；呈現方式需使用者先決定。 |  | RS-0666 |
| 6A10 | Parotid sheath / parotid space | 腮腺鞘／腮腺間隙 | B | 來源未確認；筋膜無現成模型（BodyParts3D 4.0 的 investing fascia 概念只涵蓋四肢） | 筋膜示意（薄殼，貼合邊界結構）；呈現方式需使用者先決定。 |  |  |
| 6A11 | Muscular triangle / anterior triangle | 肌三角／前三角 | B | 來源未確認；空間無現成模型，依 CLAUDE.md 特殊空間規則：高亮邊界結構，必要時貼合邊界的半透明立體 | 空間示意（不用平面或圓碟）。 |  |  |
| 6A12 | Danger triangle of the face | 顏面危險三角 | C | — | 不建：臨床區域用語，答案是顏面靜脈、眼靜脈與海綿竇的連通；待這些血管補建後改用相關搜尋指向它們（必備清單已列為不需 3D）。 |  | RS-0171 |
| 6A13 | Pharyngobasilar fascia | 咽顱底筋膜 | C | — | 不建：咽壁內的筋膜層，需配合咽肌一起說明，單獨建模價值低。 |  | RS-0622 |
| 6A14 | Temporalis fascia | 顳肌筋膜 | C | — | 不建：顳肌表面的筋膜，單獨建模價值低，資訊卡即可。 |  | RS-0847 |
| 6A15 | Retropharyngeal space | 咽後間隙 | C | — | 不建：潛在間隙，無固定形狀；以資訊卡說明邊界與感染擴散路徑，並在頸筋膜呈現時以相關搜尋帶出。 |  | RS-0694 |

### 批次 6B：顱部窩、腦膜、頭皮層次（分區：6 筋膜與間隙，7 項）

| # | English | 中文 | 類 | 來源／依據 | 建議 | 旗標 | 必備清單 id |
|---|---|---|---|---|---|---|---|
| 6B1 | Pterygopalatine fossa | 翼顎窩 | B | 來源未確認；空間無現成模型，依 CLAUDE.md 特殊空間規則：高亮邊界結構，必要時貼合邊界的半透明立體 | 空間示意（不用平面或圓碟）。 |  | RS-0682 |
| 6B2 | Infratemporal fossa | 顳下窩 | B | 來源未確認；空間無現成模型，依 CLAUDE.md 特殊空間規則：高亮邊界結構，必要時貼合邊界的半透明立體 | 空間示意（不用平面或圓碟）。 |  | RS-0344 |
| 6B3 | Temporal fossa | 顳窩 | B | 來源未確認；空間無現成模型，依 CLAUDE.md 特殊空間規則：高亮邊界結構，必要時貼合邊界的半透明立體 | 空間示意（不用平面或圓碟）。 |  | RS-0845 |
| 6B4 | Subdural / subarachnoid / epidural spaces | 硬腦膜下、蛛網膜下、硬膜外腔 | C | — | 不建：腦膜腔屬潛在間隙，資訊卡即可（蛛網膜下腔已有 CSF 流向頁示意）。 已有資訊卡。 |  |  |
| 6B5 | Dura mater, arachnoid mater, pia mater | 硬腦膜、蛛網膜、軟腦膜 | B | 部分：BodyParts3D 4.0 有 Tentorium cerebelli（FJ1843，概念 FMA71235／FMA266054），Z-Anatomy 神經模型有 Falx cerebri、Spinal dura 節點；整層硬腦膜、蛛網膜、軟腦膜外殼無對應 mesh，來源未確認 | 硬腦膜可用既有小腦幕與大腦鐮為基礎做示意外殼；蛛網膜、軟腦膜以資訊卡處理（使用者先前傾向只做硬腦膜）。 已有資訊卡。 |  |  |
| 6B6 | Cerebellomedullary and suprasellar cisterns | 小腦延髓池、鞍上池 | C | — | 不建：腦池是腦脊液空間，資訊卡搭配既有 CSF 流向頁即可。 已有資訊卡。 |  |  |
| 6B7 | Scalp layers (skin, dense connective tissue, galea, loose areolar tissue, pericranium) | 頭皮層次 | B | 來源未確認；站上已有帽狀腱膜（BodyParts3D 3.0 補充件），其他層無來源 | 層次示意（多層薄殼）；站上已有帽狀腱膜與枕額肌，需和它們對齊。 已有資訊卡。 |  |  |

### 批次 7：頭頸靜脈、淋巴、鼻腔（分區：其他，15 項）

| # | English | 中文 | 類 | 來源／依據 | 建議 | 旗標 | 必備清單 id |
|---|---|---|---|---|---|---|---|
| 71 | External jugular vein | 外頸靜脈 | B | 來源未確認；BodyParts3D 4.0 查無此名稱（只有 tributary of external jugular vein 概念，對應兩件肩胛上靜脈） | 手作示意（示意模型）。 |  | RS-0223 |
| 72 | Facial vein | 顏面靜脈 | B | 來源未確認；BodyParts3D 4.0 查無此名稱（只有 tributary of external jugular vein 概念，對應兩件肩胛上靜脈） | 手作示意（示意模型）。 |  | RS-0235 |
| 73 | Retromandibular vein | 下頷後靜脈 | B | 來源未確認；BodyParts3D 4.0 查無此名稱（只有 tributary of external jugular vein 概念，對應兩件肩胛上靜脈） | 手作示意（示意模型）。 |  | RS-0692 |
| 74 | Pterygoid venous plexus | 翼靜脈叢 | B | 來源未確認；BodyParts3D 4.0 查無此名稱（只有 tributary of external jugular vein 概念，對應兩件肩胛上靜脈） | 手作示意（示意模型）。 已有資訊卡。 |  | RS-0679 |
| 75 | Anterior jugular vein | 前頸靜脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0030 |
| 76 | Superficial temporal vein | 淺顳靜脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0786 |
| 77 | Posterior auricular vein | 耳後靜脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  | RS-0640 |
| 78 | Emissary veins | 導靜脈 | B | 來源未確認（BodyParts3D 4.0 匯出與 Z-Anatomy 神經模型查無此名稱；其他來源 repo 內無清單） | 手作示意（示意模型）。 |  |  |
| 79 | Superior and inferior labial veins | 上、下唇靜脈 | C | — | 不建：屬次要的頭頸靜脈小支，路徑記回流方向即可，資訊卡即可。 |  |  |
| 710 | Lateral nasal vein | 鼻外側靜脈 | C | — | 不建：屬次要的頭頸靜脈小支，路徑記回流方向即可，資訊卡即可。 |  | RS-0394 |
| 711 | Superficial cervical lymph nodes | 頸淺淋巴結 | C | — | 不建：淋巴構造體積小、形狀不固定，教學上多用資訊卡帶過（是否要建示意由使用者決定）。 |  |  |
| 712 | Deep cervical lymph nodes | 頸深淋巴結 | C | — | 不建：淋巴構造體積小、形狀不固定，教學上多用資訊卡帶過（是否要建示意由使用者決定）。 |  | RS-0176 |
| 713 | Jugular lymphatic trunk | 頸淋巴幹 | C | — | 不建：淋巴構造體積小、形狀不固定，教學上多用資訊卡帶過（是否要建示意由使用者決定）。 |  |  |
| 714 | Right lymphatic duct | 右淋巴導管 | C | — | 不建：淋巴構造體積小、形狀不固定，教學上多用資訊卡帶過（是否要建示意由使用者決定）。 |  |  |
| 715 | Nasal cavity | 鼻腔 | B | 來源未確認；BodyParts3D 4.0 匯出查無鼻腔空間；Vomer、Ethmoid、Septal nasal cartilage 已在站上 | 空間示意（貼合既有鼻骨、鼻中隔與鼻甲邊界）。 |  | RS-0503 |

## 四、名稱比對可能有誤、站上其實已有（請先確認，確認已有就從缺項移除）

`exam2-headneck-gap.md` 的比對以英文名稱字串為主；下列情況會漏掉：

| 項目 | 可能已有的對應 | 依據 | 建議 |
|---|---|---|---|
| Great auricular nerve 耳大神經、Lesser occipital nerve 枕小神經、Greater occipital nerve 枕大神經 | 站上已有手作示意管狀神經模型 | `public/ATTRIBUTION.md` 記載這三條與枕下神經等六條由專案自製；必備清單判為 FOUND。缺項表仍列「缺（只在中文名稱表）」 | 從缺項移除（批次 1D 的 A／B 數隨之減 3） |
| Optic disc／Macula lutea／Fovea、Conjunctiva、Ora serrata、Ciliary processes／muscle、Aqueous humor、Scleral venous sinus（對應 Schlemm's canal） | 眼詳細模式（Ocularium）已有這些名稱 | `app/micro-atlas.tsx` 的 EYE_PARTS。這些模型到執行階段才載入；合併列（如「視神經盤、黃斑、中央小凹」）也會讓字串比對失敗 | 先確認畫面上可點選，再決定只補資訊卡；Posterior chamber 與 Retina layers 在名稱表內沒有 |
| Membranous labyrinth: utricle, saccule, cochlear duct | 內耳詳細模式（IE-Map）有 Utricle、Saccule 與三條半規管 | `app/micro-atlas.tsx` 的 EAR_FILES；名稱表沒有 Cochlear duct | Cochlear duct 另列待確認 |
| Auricle (pinna) 耳殼 | BodyParts3D 4.0 的 External ear（FJ2811，概念 FMA52781） | `public/models/atlas.json` 部件名與概念名 | 確認 External ear 是否含耳殼並可點選；若是，改為已有 |
| Ciliary processes／muscle | BodyParts3D 4.0 的 Left／Right corona ciliaris（FJ1287、FJ1338） | `public/models/atlas.json` | 與上面的眼詳細模式一併確認 |
| Superior cervical ganglion、Middle／inferior cervical ganglia、Stellate ganglion | Z-Anatomy 神經模型的 Ganglia of sympathetic trunk（左右各一組） | `nervous.glb` 節點名；必備清單判為別名（ALIAS） | 確認單一神經節是否能分開點選；不能的話才需要拆出或補示意 |
| Uvula 懸雍垂、Aryepiglottic fold 杓會厭褶 | 站上的 Uvular muscle（BodyParts3D 4.0 概念 FMA55022 uvula）、Aryepiglotticus | 必備清單判為別名；缺項表已列為相關搜尋 | 維持相關搜尋，不建新模型 |
| Dura mater 硬腦膜 | Tentorium cerebelli（FJ1843）、Falx cerebri、Spinal dura | `atlas.json`、`nervous.glb` | 部分已有（小腦幕、大腦鐮、脊髓硬膜）；缺的是整層外殼 |
| External acoustic meatus 外耳道 | 骨性（第四節）與軟組織（第六節）各列一次，名稱重複 | `exam2-headneck-gap.md` 第四、六節 | 合併為一個可點選結構（本檔 4B 與 5A 各留一列，做的時候合併） |
| 合併列（如 Superior／middle／inferior thyroid veins、Greater／lesser palatine foramina） | 一列代表多個結構 | 缺項表以一列計 1 項 | 185 是「列數」，不是獨立結構數；實際建模時要拆成各自可點選的結構 |

另外，`Carotid canal`、`Optic canal`、`Foramen magnum` 必備清單判為 FOUND（站上只有資訊卡）；`Danger triangle of the face` 必備清單標為不需 3D（EXCLUDED）。

## 五、來源待確認清單（請使用者決定是否查、由誰查）

下列是 B 類中最可能有現成模型、但 repo 內無法證實的項目。**沒有說它們存在**，只是列出值得查的地方；查證後的來源與授權要先列給使用者確認才可使用：

| 要查的來源 | 要查什麼 | 對應項目（批次） |
|---|---|---|
| BodyParts3D 3.0 完整部件名單（`docs/coverage-report.md` 記載 4.0 匯出略去 412 個來源編號、98 段缺口） | 名單內是否有下列結構 | 腮腺、甲狀腺、副甲狀腺、扁桃體（批次 2、3）；頭頸動、靜脈（批次 1A、其他）；聽小骨（4B）；咽、鼻腔、鼻竇（2、5B、其他） |
| Z-Anatomy 其他 FBX（CardioVascular、NervousSystem、MuscularSystem、SkeletalSystem 之外的匯出；commit 同上） | 是否有這些結構的獨立 mesh（目前只確認神經模型 709 節點） | 頸外動脈分支與頭頸靜脈（1A、1B、其他）；腦神經分支與神經節（1C、1D）；喉與咽（2）；耳與眼（4B） |
| Human Reference Atlas 其他器官組 | 是否有頭頸器官（目前 repo 只用女性骨盆、乳房與眼） | 腺體（3）；喉、咽（2） |
| 眼、內耳詳細模式的上游授權頁 | 確認 CC BY 4.0 與署名方式，並補進 `public/ATTRIBUTION.md` | 4A、4B |

B 類裡面「來源未確認」的結構，若來源查不到，就走手作示意（示意模型，附「示意模型」標示，位置依公開解剖資料寫、請使用者核對）。

## 六、使用方式與限制

- 本檔是規劃用的內部清單，**不是進度表**；進度以 `ROADMAP.md` 為準，不在本檔更新。
- 開始任何批次前：使用者確認該批的來源與授權、第四節的疑似已有項目、C 類是否同意捨去。
- 每批做完要更新必備清單的 `known-gaps.json`（`node scripts/check-required-structures.mjs --write`），讓缺口只減不增。
