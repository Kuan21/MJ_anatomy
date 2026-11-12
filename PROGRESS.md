# PROGRESS（自動排程交接檔）

最後更新：2026-11-13。分支：`claude/local-auto`（不推 main、不刪檔）。
依據：`ROADMAP.md`「穩定期」、`CLAUDE.md`、`git log`、開放 PR 清單。

## 目前狀態
- 專案處於**穩定期**（2026-11-08 起）：暫停新功能，只修顯示錯誤；所有 PR 都要使用者人工審核，不可自行 merge。
- main 最新：#224（穩定期第 1 節自動檢查）、#245/#244（走向動畫微調）、#246（ROADMAP 增補）。
- 開放 PR 共 10 個，全部【需人工審核】、等使用者：
  - #223 心臟腔內構造與標籤（部分完成）
  - #226 背闊肌撕裂與權重平滑（S2-A）
  - #227 胸腔米色三角形與白板（S2-G）
  - #228 頭部 clipping plane 移除（S2-B）
  - #229 頸部（S2-F，分叉外觀未驗收）
  - #234 穩定期 ROADMAP／CLAUDE.md 規則（文件）
  - #238 半透明加固（S3）
  - #239 玻璃腦（S4，堆疊在 #222）
  - #242 神經與關節改用 Z-Anatomy 官方檔
  - #247 肺配色乾淨版

## 已完成（已在 main）
- S1 自動檢查（碎片、穿骨、共面疊層、直線切口、關節極限拉伸、固定視角截圖）。

## 自動排程已做（分支 `claude/sweet-cerf-v7a90a`／PR #248，全部只加檔，不改模型與網站）
- 2026-11-11：新增 `scripts/report-centerlines.mjs` 與 `docs/centerline-report.md`（S5 第一階段量測）：1,453 個血管與神經網格，14 秒；成功 1,312、列出 141（多為主幹旁粗分支造成的「jump」、短腦神經根、交感幹神經節）。尚未納入 `npm run check`，未建立基準。

- 2026-11-12：把分類邏輯抽成 `scripts/lib/centreline-classify.mjs`，新增 `scripts/test-centreline-classify.mjs`（合成中心線，不需模型資料；尚未加入 `npm run check`）。`report-centerlines.mjs` 改用同一函式，行為不變。
  - 本資料夾（主 checkout）沒有 `node_modules`、`work/` 與生成檔，無法在這裡重跑實際量測，所以「jump 是否誤報」尚未查；需在有生成檔的環境（`node scripts/clean.mjs --donor` 指出的位置）跑。

- 2026-11-12（第二次）：`scripts/test-centreline-classify.mjs` 已加入 `npm run check`（不需模型資料，本機通過）。其餘待辦（S5 第二階段需生成檔；S7 涉及解剖內容）本資料夾做不了，見「待我決定」。

- 2026-11-12（第三次）：依使用者授權執行 `node scripts/clean.mjs --donor`，指出的就是本資料夾，但缺少 `work/`，且 `public/models/supplement/supplement-stream.json.gz` 不存在，`report-centerlines.mjs` 無法執行（ENOENT）。依指示記錄後跳過「jump 是否誤報」的查證，未下載資料、未改模型。需要該生成檔（或由你指定有它的環境）才能繼續 S5 第二階段。`package-lock.json` 的未提交差異只是 npm 重排 license 欄位，未提交。

- 2026-11-12（第四次）：重新檢查，`work/` 與 `supplement-stream.json.gz` 仍不存在，S5 第二階段仍被擋住；S7 與其他項目依「我的回覆」要求跳過。沒有可做的未完成項目，只更新本檔。

- 2026-11-13（第五次）：
  - 重新檢查：`node_modules` 已有；`work/` 與 `public/models/supplement/supplement-stream.json.gz` 仍不存在（`serous/`、`female/` 串流也沒有）。`prepare-supplement.mjs` 要先下載 BodyParts3D 原始 STL 才能產生，依指示不下載，所以實際量測與「jump 是否誤報」仍未查。
  - 新增 `scripts/lib/centreline-continuity.mjs`（S5 連續性檢查要用的純幾何量測：子中心線近端到上一級管壁的距離 `attachGap`、同一結構多件零件首尾距離 `joinGap`）與 `scripts/test-centreline-continuity.mjs`（合成中心線，不需模型資料），已加入 `npm run check`，本機通過。尚未接上實際模型、未建立基準（需生成檔）。
  - 修正 `scripts/check-no-notes.mjs`、`scripts/check-zh.mjs` 在 Windows 的路徑錯誤（`URL.pathname` 會變成 `/C:/…`）：原本 `check-no-notes` 在本機讀檔失敗、之前的目錄掃描也掃不到任何檔案；改用 `fileURLToPath` 後兩個檢查在本機實際掃描並通過（check:zh 掃 170 個檔）。Linux／CI 行為不變。
  - 沒有改模型、解剖內容或網站。本機沒有 `gh`，未查開放 PR 是否有變動。

## 進行中／等審核
- S2 A–G、S3、S4、S6 相關工作都已有 PR（見上），等使用者審核。

## 待辦（ROADMAP 穩定期，尚無 PR）
- S5 血管與神經中心線（連續性檢查、整條高亮）。
- S7 模型限制說明（資訊卡與「模型範圍」）。
- S2-D 腦詳細模式（#222，狀態待確認）。
- 頸部血管、心臟詳細模式、腦詳細模式改用官方來源（#242 說明另開工作）。

## 我的回覆（2026-11-12）
- 排程：雲端排程已停用，只保留本機排程。之後所有工作都放在 claude/local-auto 同一條分支和同一個 PR，不另開分支或 PR。
- S5 第二階段：授權排程在本資料夾執行 `node scripts/clean.mjs --donor`。如缺少原始資料，記錄缺少哪些檔案後跳過，不要自行下載資料或改動模型。
- S5 連續性檢查：可以開始做，只加腳本與基準檔，不改模型。先查「jump」是否誤報。
- 待審 PR：我會先審 #234，其餘逐步審。在我審完之前，不要新開涉及模型或解剖內容的 PR。
- #228、#242、#247、#239、S7：我仍在決定，全部先跳過，不要自行處理。

## 待我決定
- S7 模型限制說明（資訊卡與「模型範圍」）的文字屬解剖內容，需你決定要寫哪些結構與措辭；決定前自動排程不動。
- S5 第二階段需在有生成檔的環境（`node scripts/clean.mjs --donor`）執行，本資料夾無 `node_modules`／`work/`；請決定由你在該環境跑，或授權排程在那裡跑。
- 待審 PR 已有 10 個，遠超 #234 擬定的上限 5 個；在使用者審核／合併前，自動排程**不新開**涉及模型或解剖內容的 PR，避免再堆積。請決定先審哪幾個。
- #228：枕部缺口要不要補、怎麼補（新增解剖內容）。
- #242：5 個關節網格位置與舊版差 4–23 mm，保留官方新位置或改回舊位置。
- #247：「噁心」的配色問題是否就是網紋、斑點、配色三點。
- #239：玻璃皮質不透明度與分色是否合意。

## 下一步（可與現有 PR 並行、不衝突的工作）
- S5 第二階段：用中心線做「上一級關係」連續性檢查，採只減不增基準，再納入 CI（先在本分支加腳本與基準檔，不動模型）。需先查「jump」是否為誤報（分支被算進主幹）。
- 為 `report-centerlines` 補測試（`scripts/test-*.mjs` 風格），確認失敗分類穩定。（已完成：`test-centreline-classify.mjs`）
- 有生成檔後：寫 `check-centreline-continuity.mjs`，用 `centreline-continuity.mjs` 的 `attachGap`／`joinGap` 沿 `topology-spec` 的上一級關係量測，建立只減不增基準。
- 規則：所有排程工作都放在本分支與 PR #248，不另開分支或 PR。

## 下一步（舊）
- 自動排程本次判斷：S5、S7 都會改模型或解剖內容，屬需人工審核且會讓待審 PR 繼續增加，故不開工，等使用者處理待審 PR 後再開始 S5。
- 下次排程：先看開放 PR 是否有減少；若有 PR 已 merge，將本檔更新並從 S5 開始（先做不改模型的連續性檢查腳本）。
