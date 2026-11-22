# 工作登記表的分檔做法

`docs/WORK_REGISTRY.md` 由腳本生成，**不要手改**，功能 PR 一律不准改它。

- 每個工作階段只改自己的檔案 `docs/registry/<工作階段名>.md`（例如 `腹部內臟.md`）：
  - `## 狀態`：一行，`狀態｜最後活動（UTC）｜備註`；
  - `## 工作`：表格，欄位與總表相同（工作內容、負責工作階段、分支／PR、開始時間、狀態），負責欄要以自己的工作階段名開頭；完成或合併後刪走那一行；
  - `## 等使用者決定`：每行 `- 日期｜工作階段｜事項`；
  - `## 附表`（可省略）：自己的補充表格。
- `_header.md`（頂部說明、時間表）與 `_decided.md`（已決定）只由總管改。
- 總管每日一次執行 `node scripts/registry.mjs sync` 合併成 `docs/WORK_REGISTRY.md`，開只含文件的 PR，CI 綠後自動合併。
- `node scripts/registry.mjs check`（在 `npm run check` 內）檢查格式，只輸出通過／失敗與數量。
- 新增工作階段：新增 `docs/registry/<名稱>.md`，並把名稱加進 `scripts/registry.mjs` 的 `ORDER`。
- 過渡期內若 PR 在 `docs/WORK_REGISTRY.md` 撞到衝突，保留雙方內容，不要刪其他工作階段的行，之後把自己的改動搬進自己的檔案。
