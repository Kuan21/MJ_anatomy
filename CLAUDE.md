# MJ Anatomy 專案規則

給在這個 repo 工作的 Claude（以及任何人）的長期規則。使用者以繁體中文（台灣）溝通，所有回覆用書面台灣繁體中文。

## 網站不可出現筆記內容或出處（最重要）

跑考摘要、神經解剖學共筆（M65×CM57）、`cmu-course-notes-*`、之後上傳的任何筆記，**只供內部參考**，不可以出現在網站上。

- 網站任何頁面（腦部、CSF 流向、心臟、分層解剖、Quiz、資訊卡、搜尋、Source & credits 以外的所有地方）都**不可**有：
  - 筆記頁碼引用，例如「（0218 p.11）」「〔0311 p.11〕」；
  - 「筆記與課本不同」之類的比較框（內容以課本／圖譜為準，直接寫結論）；
  - 頁底的筆記出處說明（如「出處：神經解剖學共筆…」）；
  - 「共筆」「筆記」「跑考」「課堂」等字樣。
- 解說文字一律用自己的話重新撰寫，內容依教科書／圖譜為準；**不得逐字照抄筆記原文**（`scripts/test-neuro-notes.mjs` 會檢查連續 16 個字與筆記相同即失敗）。
- 筆記原檔（`docs/neuro-notes.json`、`docs/neuro-notes-curation.json` 等）只放在 `docs/`，**不可**放進 `public/` 或 `dist/`；建置時只抽取結構名稱、類型與連結，卡片文字取自 `docs/neuro-card-text/*.json`（我們自己寫的）。
- 可以保留的：模型資料來源（BodyParts3D、HuBMAP、Z-Anatomy 等授權要求的出處）與「示意模型」標示，但來源說明集中放在 Source & credits（`public/ATTRIBUTION.md` 與頁面上的 Source & credits），不放在內容頁。
- `node scripts/check-no-notes.mjs` 會掃描 `public/`、`dist/` 與 app 原始碼字串；它已併入 `npm run check`，也在 `npm run build` 後自動執行。**新增內容時一定要遵守，不要為了通過檢查而放寬規則。**

## 流程

### 合併規則（使用者 2026-10-26 指示）
- **會改動模型的 PR 不可自動 merge**：包括新增或修改示意模型、新增結構、移動或改形狀的任何結構。開好 PR 後在標題加上「【需人工審核】」，PR 說明最上方寫「需人工審核，未合併」，等使用者確認後才 merge。
- **只有不改模型的 PR**（文字、介面、效能、腳本、文件）才可以在 CI `build` 全綠後自動 squash merge。
- 不確定算不算改模型時，當作會改模型處理。

### 視覺檢查（涉及模型的 PR 必做）
- 用 headless browser（Playwright）在多個角度（正面、背面、側面、上方、近距離）截圖，自己檢查位置、形狀、大小、有無浮空、穿模、斷裂，有問題先修再開 PR。
- 截圖附在 PR 描述（放進 `docs/` 下該 PR 的資料夾並在描述中引用）；沒看過截圖不可宣稱「位置正確」。
- 只靠數值或投影圖驗證時，要在 PR 說明寫明「未在 3D 畫面確認」。

### 不可編造
- 不可編造參考編號（FMA、BodyParts3D、PK-xxx 等內部編號不可當成圖譜編號顯示）、連結或來源。沒有真實來源就不顯示該欄位。
- 資訊卡的 Atlas reference 與 View anatomical source 只在該結構確實有對應的真實編號與頁面時才顯示。

### 其他
- 一個 PR 一個主題；PR 說明用中文，寫清楚：改了什麼、在網站上怎樣找到、哪些模型是示意（示意）、使用哪個圖譜、使用者需要核對什麼；附截圖。
- 每個 PR 都要通過 `npm run check` 與 `npm run build`（CI 的 `build` job 全綠）。檢查失敗就修，不要跳過或放寬。
- 英文名在上／大，中文在下／小；中文用台灣醫學用語；所有介面中文用書面語（`npm run check:zh`）。
- 新增模型要更新 `public/ATTRIBUTION.md` 與 `model_sources.json`；動作要符合人體可能的活動範圍。
- `REVIEW_LOG.md` 分兩欄：「已自動 merge」與「等我審核」；每個 PR 開出或合併後更新。
- 不要動 `public/models/cmu-course-notes-v4.json` 的 git 歷史（是否清除由使用者在專案完成後決定）。
