# PROGRESS（自動排程交接檔）

最後更新：2026-11-14。分支：`claude/local-auto`（不推 main、不刪檔）。
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

- 2026-11-13（第六次）：
  - 重新檢查：`work/` 與 supplement／serous／female 三個生成串流仍不存在，完整量測仍做不了；沒有下載資料。
  - 修正 `scripts/prepare-nerve-stream.mjs` 的 Windows 路徑錯誤（同上次的 `URL.pathname` 問題），本機現在可以由已有的 `nervous.glb` 產生神經串流（生成檔，不提交）。其他腳本還有同類寫法（`prepare-heart`、`decode-joint-source`、`export-joints-rest`、`extract-neck-vessels`、`audit-cranial-nerves`、`test-body-nerves`、`test-joint-anatomy`、`test-nerve-motion`、`lib/stability-static`），這次沒有動。
  - `report-centerlines.mjs` 新增 `--available`：缺少生成檔時只量本機有的資料（大圖譜與神經），並在輸出與報告中寫明略過哪些檔。這次量了 1,449 個網格（少了三個生成串流的部分）。
  - **「jump 是否誤報」已查：是誤報，但原因不是之前寫的「粗分支被算進主幹」。** 115 個 jump 全部是網格三角形很長（最長邊 21–132 mm），兩圈之間表面上沒有頂點；每一個的圈距都與沿表面的距離相符（例如左股動脈圈距 85 mm、表面距離 87 mm），管子本身連續。
  - 依此修改：`centrelineOf` 可選擇回傳沿表面的圈距（預設行為不變，`leg-vessel-build` 不受影響）；`classifyRings` 收到圈距時，解釋得了的不再算 jump；新增 `pieceCount`（網格分離件數）。合成測試已補，`test-centreline-classify`、`test-centreline-continuity`、`check-no-notes`、`check:zh`、`tsc --noEmit` 本機通過；完整 `npm run check` 因缺生成檔沒有跑。
  - `docs/centerline-report.md` 已用 `--available --write` 重新產生：列出 26 個（很短的腦神經根 18、形狀不是管 6、睫狀神經節 2），另列「網格較粗」115 個與「由多件組成」252 個。**這份報告不含三個缺少的串流**，有生成檔後要重跑。
  - 量測時發現、尚未處理的兩個限制：（1）252 個網格由多件組成，中心線只沿其中一件走，連續性檢查要逐件處理；（2）主動脈等粗血管量到的半徑只有約 4–5 mm，看來偏小（抽取只取鏈附近 8 mm 的表面點），`attachGap` 會扣上一級半徑，所以粗血管的結果要先修正半徑才可信。原因尚未驗證。
  - 留下一個未提交的暫存診斷腳本 `scripts/_diag-jumps.mjs`（依「不刪檔」沒有刪），可以由你刪除。
  - 沒有改模型、解剖內容或網站。本機沒有 `gh`，未查開放 PR 是否有變動。

- 2026-11-13（第七次）：處理上次留下的兩個限制（只加腳本與測試，沒有改模型、解剖內容或網站）。
  - 重新檢查：`work/` 與 supplement／serous／female 三個生成串流仍不存在；沒有下載資料。
  - **粗血管半徑偏小的原因已確認**：`centrelineOf` 每一圈只收集「距離表面鏈 8 mm 以內」的頂點，而鏈只沿管子的一側走，所以半徑超過約 2.5 mm 的管子每圈只取到一條管壁，中心偏向那一側、半徑固定落在 3–4 mm。用合成圓柱重現：半徑 12 mm 的管量成 3.8 mm，放寬範圍後量到 12.0 mm。
  - 修正方式：`centrelineOf` 新增第四個參數 `reach`（預設 8 mm，原有行為與 `leg-vessel-build` 不變）；新檔 `scripts/lib/centreline-pieces.mjs` 的 `centrelineWide` 把範圍逐次加倍，直到量到的半徑不再增加。本機實際資料：降主動脈 3.5 → 9.8 mm、主動脈弓 3.5 → 8.7 mm、腹主動脈 3.3 → 7.0 mm。**這些數值沒有與真實尺寸核對**，只確認不再固定落在 3–4 mm。
  - 仍有的限制（已寫在程式註解與測試）：（1）有分支離開的地方，分支靠近鏈的頂點也會算進那一圈，半徑偏大（例如左股靜脈量到 9.7 mm，可能就是這個原因，未驗證）；（2）很短的粗管（長度小於半徑約 8 倍）仍會量得偏小。
  - **多件網格逐件抽中心線**：同一檔的 `splitPieces`（把網格拆成各自獨立的件）與 `centrelinesOf`（每件一條中心線，抽不出的列入略過）。新增 `scripts/test-centreline-pieces.mjs`（合成管，不需模型資料），已加入 `npm run check`，本機通過。
  - `report-centerlines.mjs` 的「由多件組成」表加了三欄：中心線條數、略過件數、最大件距。`docs/centerline-report.md` 已用 `--available --write` 重新產生（仍不含三個缺少的串流；現在跑一次約 59 秒，原本 14 秒）。結果：252 個多件網格中，28 個只抽得出一條中心線、38 個有略過的小件、40 個件距在 5 mm 以內、193 個超過 5 mm（神經 119、動脈 41、靜脈 33）、97 個超過 20 mm。
  - 判讀：件距大的多數是「一個名稱包含多條分開的血管或神經」（肋間動靜脈、腰動靜脈、穿通動脈、脊神經根與神經節等），本來就不相接，**不能直接當成斷裂**。連續性檢查要先分辨「成組結構」與「應該相接的單一結構」，這需要對照 `topology-spec`，還沒做。
  - 本機通過：`test-centreline-pieces`、`test-centreline-classify`、`test-centreline-continuity`、`check-no-notes`、`check:zh`。完整 `npm run check` 因缺生成檔沒有跑。
  - 新留下一個未提交的暫存診斷腳本 `scripts/_diag-radius.mjs`（依「不刪檔」沒有刪），連同上次的 `scripts/_diag-jumps.mjs` 可以由你刪除。
  - 本機沒有 `gh`，未查開放 PR 是否有變動。

- 2026-11-13（第八次）：只加腳本、測試與報告，沒有改模型、解剖內容或網站。
  - 重新檢查：`work/` 與 supplement／serous／female 三個生成串流仍不存在；沒有下載資料。
  - **多件網格分類**：新檔 `scripts/lib/centreline-groups.mjs`。`structureKind` 只看名稱與 `topology-spec`（不是解剖判斷），分成三類：「應相接」＝ topology-spec 列為上一級或分支的單一結構；「成組」＝名稱本身表示多條（Set of、複數如 arteries／branches／roots／ganglia、plexus）；「未判定」＝單數名稱但 topology-spec 沒有列出。
  - **連接距離**：同一檔的 `pieceGap`（兩件之間：端點對端點，或一件的端點到另一件的管壁，取較小者）與 `linkGap`（把所有件連成一個整體時必須跨過的最大空隙，0 代表全部相接）。原本的「最大件距」只量端點對端點，分支從主幹側面離開時會誤報很大的距離。
  - 新增 `scripts/test-centreline-groups.mjs`（合成中心線，不需模型資料），已加入 `npm run check`，本機通過。
  - `report-centerlines.mjs` 的多件表加了「分類」與「連接距離」兩欄，依分類再依連接距離排列；`docs/centerline-report.md` 已用 `--available --write` 重新產生（仍不含三個缺少的串流，約 63 秒）。結果：252 個多件網格中，應相接 4 個（左右坐骨神經、左右腓腸神經，連接距離都是 0 mm；舊欄位寫 34–46 mm，是端點量法的誤報）、成組 65 個、未判定 183 個（其中連接距離超過 5 mm 的 54 個）。
  - 那 54 個（例如 Marginal colic artery 102 mm、Left fibular vein 69 mm、Superior phrenic vein 68 mm、門靜脈與肝動脈的分支、Lumbar artery／vein、脊神經前後根與神經節）是「單數名稱但含多條分開的結構」還是真的斷開，名稱判斷不了，屬解剖內容，已列入「待我決定」。**連接距離的數值沒有在 3D 畫面確認。**
  - 其餘八個腳本的 Windows 路徑同類寫法已修（`prepare-heart`、`decode-joint-source`、`export-joints-rest`、`extract-neck-vessels`、`audit-cranial-nerves`、`test-body-nerves`、`test-joint-anatomy`、`test-nerve-motion`：draco 模組路徑改用 `fileURLToPath`，Linux 行為不變）。語法檢查通過；`audit-cranial-nerves` 實際執行確認不再出現路徑錯誤（之後因本機沒有 `brain.glb` 停下）；其他幾個因缺少 `.sites-runtime` 等生成檔，在走到這一行之前就停下，**修正後未能實際執行驗證**。`lib/stability-static.mjs` 的 `pathname` 只用來切出 `/app/` 之後的相對路徑，在 Windows 沒有問題，沒有改。
  - 本機通過：`test-centreline-groups`、`test-centreline-pieces`、`test-centreline-classify`、`test-centreline-continuity`、`check-no-notes`、`check:zh`、`tsc --noEmit`。完整 `npm run check` 因缺生成檔沒有跑。
  - 分支處半徑偏大的修正（每圈改用中位數）這次沒有做。
  - 本機沒有 `gh`，未查開放 PR 是否有變動。

- 2026-11-14（第九次）：只加腳本、測試與報告，沒有改模型、解剖內容或網站。
  - 重新檢查：`work/` 與 supplement／serous／female 三個生成串流仍不存在；沒有下載資料。
  - **分支處半徑偏大的修正**：`scripts/lib/centreline-pieces.mjs` 新增 `robustRings`。每圈半徑改用前後各 4 圈的中位數；自身半徑與它相差超過 30% 的圈視為受分支干擾，中心改放在前後最近的正常圈之間的直線上；正常的圈中心不動（真正的彎曲不受影響）。`centrelinesOf` 回傳的已是修正後的圈，並多一欄 `disturbed`（修正了幾圈）。`centrelineOf` 與 `centrelineWide` 行為不變，`leg-vessel-build` 不受影響。
  - 合成測試（主幹加一條側枝，已加入 `test-centreline-pieces`）：半徑 3–5 mm 的管，分支旁的圈原本量到 4.5–10.5 mm、中心偏離 4–15 mm，修正後半徑與中心都回到原位。**仍有的限制**（已寫在註解與測試）：半徑 8 mm 以上的粗管配粗分支時，半徑已修正，但個別圈的中心仍可能被分支拉偏約一個半徑；連續超過 4 圈（約 12 mm）受干擾時修不掉。沒有用實際血管逐一核對修正後的半徑。
  - **沿上一級關係試量**：新增 `scripts/report-centreline-attach.mjs` 與 `docs/centerline-attach-report.md`（用 `--available --write` 產生，約 21 秒；未納入 `npm run check`，沒有基準）。`topology-spec` 的 187 個關係中，本機量到 127 個、60 個沒有網格（要有示意血管的連接管或缺少的生成檔）、抽不出中心線 0 個。子結構端點到上一級管壁的距離：超過 3 mm 11 個、6 mm 10 個、12 mm 9 個、25 mm 4 個（`centerline-plan` 用舊量法是 17／14／10／4）。
  - 超過 3 mm 的 11 個：左右椎動脈接鎖骨下動脈（約 50 mm）、左右橈食指動脈接橈動脈（約 29 mm）、左右尺側返動脈後支接尺動脈（約 22 mm）、左右胸肩峰動脈三角肌支接幹（約 16 mm）、左右深掌靜脈弓接橈靜脈（約 12 mm）、右股動脈接右髂外動脈（5.6 mm，左側不在名單內）。前十個與 `centerline-plan` 列出的相同，該文件說明這些位置在網站上由示意血管的連接管補上；**這次沒有載入連接管，所以不能當成缺陷清單，數值也沒有在 3D 畫面確認**。右股動脈那一個只有單側，原因未查。
  - 判讀：試量結果與現有表面檢查的已知空隙一致，量法看來可用。基準格式建議：每個關係一列（子結構、上一級、距離取到 0.5 mm），只減不增；但要先有含連接管的完整世界（跑考串流）才能建立，否則基準會把連接管補上的空隙記成已知問題。
  - `docs/centerline-report.md` 已重新產生（多件表改用修正後的圈，數值變動約 1 mm；「未判定」中連接距離超過 5 mm 的由 54 個變 57 個，右腓腸神經由 0 變 1 mm）。
  - 本機通過：`test-centreline-pieces`、`test-centreline-groups`、`test-centreline-continuity`、`test-centreline-classify`。完整 `npm run check` 因缺生成檔沒有跑。
  - 新留下一個未提交的暫存診斷腳本 `scripts/_diag-branch.mjs`（依「不刪檔」沒有刪），連同 `_diag-jumps.mjs`、`_diag-radius.mjs` 可以由你刪除。`package-lock.json` 的未提交差異仍未提交。
  - 本機沒有 `gh`，未查開放 PR 是否有變動。

- 2026-11-14（第十次）：只加腳本、測試與報告，沒有改模型、解剖內容或網站。
  - 重新檢查：`work/` 與 supplement／serous／female 三個生成串流仍不存在；沒有下載資料。
  - **右股動脈接右髂外動脈 5.6 mm 只出現在單側的原因已查：是量測誤差，不是網格斷開。** 這兩條血管的網格很粗（股動脈左 107、右 118 個頂點，髂外動脈 226、204 個頂點，整條只抽得出 13–22 圈，而且超過一半的圈被判為受干擾），中心線的端點位置不穩；左側其實也量到 2.9 mm，只是剛好在 3 mm 門檻以下。直接量兩個網格的表面距離：右 0.1 mm、左 0.5 mm，表面相接。另外髂外動脈的中心線在接點之後還繼續向前走了一段（股動脈的端點落在它中段，不是末端），看來網格含一段分支；這一點只看數值，沒有在 3D 畫面確認。
  - **新增表面距離量測**：`scripts/lib/centreline-surface.mjs` 的 `surfaceGap`（兩個網格表面的最短距離，一方的每個頂點對另一方的每個三角形，雙向；不經過中心線）與 `scripts/test-centreline-surface.mjs`。限制（已寫在註解）：兩個表面互相穿過但沒有頂點落在對方表面上時，量到的是最近頂點的距離（略大於 0），不是 0。
  - **上一級關係量測補測試**：量測邏輯由報告腳本抽到 `scripts/lib/centreline-attach.mjs`（`relationGaps`：子端到上一級管壁、任一方向、表面距離三個數值），新增 `scripts/test-centreline-attach.mjs`（合成管：側枝離管壁 0／4／20 mm、首尾相接、方向寫反、同名多個網格、抽不出中心線）。兩個新測試都已加入 `npm run check`。
  - `report-centreline-attach.mjs` 與 `docs/centerline-attach-report.md` 多了「表面距離」一欄（重新產生，約 21 秒）。127 個關係中，表面距離超過 3 mm 的 10 個，就是上次列出的前十個（椎動脈、橈食指動脈、尺側返動脈後支、胸肩峰動脈三角肌支、深掌靜脈弓，左右各一），兩種量法的數值相差都在 1.2 mm 以內；中心線超過 3 mm 而表面在 1 mm 以內的只有右股動脈 1 個。沒有「中心線說相接、表面說分開」的情況。**這些數值沒有在 3D 畫面確認，也仍然沒有載入連接管，不能當成缺陷清單。**
  - 判讀與建議：基準宜同時記錄兩個數值，以表面距離為準判斷「是否相接」，中心線距離只用來指出接在上一級的哪個位置；這樣粗網格不會造成誤報。尚未建立基準（仍要先有含連接管的完整世界）。
  - 「粗管粗分支旁圈中心仍被拉偏」這次沒有處理；有了表面距離後，它不再影響「是否相接」的判斷，只影響位置。
  - 本機通過：`test-centreline-attach`、`test-centreline-surface`、`test-centreline-pieces`、`test-centreline-groups`、`test-centreline-continuity`、`test-centreline-classify`、`check-no-notes`、`check:zh`、`tsc --noEmit`。完整 `npm run check` 因缺生成檔沒有跑。
  - 新留下一個未提交的暫存診斷腳本 `scripts/_diag-femoral.mjs`（依「不刪檔」沒有刪），連同 `_diag-jumps.mjs`、`_diag-radius.mjs`、`_diag-branch.mjs` 可以由你刪除。`package-lock.json` 的未提交差異仍未提交。
  - 本機沒有 `gh`，未查開放 PR 是否有變動。

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
- S5 多件網格「未判定」183 個（`docs/centerline-report.md` 多件表，其中 57 個連接距離超過 5 mm；2026-11-14 重新產生前是 54 個）：每一個要當成「成組結構」（各件本來分開，不檢查相接）還是「單一結構」（各件必須相接，列入連續性基準），需你決定；決定前連續性檢查只會涵蓋 topology-spec 已列的結構。
- #228：枕部缺口要不要補、怎麼補（新增解剖內容）。
- #242：5 個關節網格位置與舊版差 4–23 mm，保留官方新位置或改回舊位置。
- #247：「噁心」的配色問題是否就是網紋、斑點、配色三點。
- #239：玻璃皮質不透明度與分色是否合意。

## 下一步（可與現有 PR 並行、不衝突的工作）
- S5 第二階段：用中心線做「上一級關係」連續性檢查，採只減不增基準，再納入 CI（先在本分支加腳本與基準檔，不動模型）。「jump」已查（2026-11-13 第六次）：是網格較粗造成的誤報。
- 為 `report-centerlines` 補測試（`scripts/test-*.mjs` 風格），確認失敗分類穩定。（已完成：`test-centreline-classify.mjs`）
- 有生成檔後：寫 `check-centreline-continuity.mjs`，用 `centreline-continuity.mjs` 的 `attachGap`／`joinGap` 沿 `topology-spec` 的上一級關係量測，建立只減不增基準。
- 寫連續性檢查前先處理：多件網格逐件抽中心線；粗血管半徑偏小的原因。（已完成，2026-11-13 第七次：`centreline-pieces.mjs`）
- 多件網格分成「應相接／成組／未判定」與連接距離。（已完成，2026-11-13 第八次：`centreline-groups.mjs`；「未判定」的歸類等使用者決定）
- 其他腳本的 Windows 路徑同類寫法。（已完成，2026-11-13 第八次；八個已修，`stability-static` 不需要改）
- 下一項（不需生成檔的部分）：分支處半徑偏大的修正（例如每圈改用距離的中位數；要在 `centreline-pieces.mjs` 內做，不可改變 `centrelineOf` 的預設行為）；用 `pieceGap`／`attachGap` 沿 `topology-spec` 的上一級關係，先對本機現有資料（大圖譜與神經）試量一次，看結果是否合理，再決定基準格式。
- 上一項已完成（2026-11-14 第九次：`robustRings`、`report-centreline-attach.mjs`）。
- 下一項：（1）建立連續性基準要先有跑考串流與三個生成串流（含連接管的完整世界），本機沒有，等生成檔；（2）不需生成檔可做的：查右股動脈接右髂外動脈 5.6 mm 只出現在單側的原因（量測問題還是網格差異）；粗管粗分支旁圈中心仍被拉偏的限制；為 `report-centreline-attach` 的量測邏輯補合成測試。
- 上一項的（2）已完成兩件（2026-11-14 第十次：右股動脈為量測誤差；`centreline-attach.mjs` 與測試；另加表面距離 `centreline-surface.mjs`）。
- 下一項：（1）建立連續性基準仍要等跑考串流與三個生成串流；（2）不需生成檔可做的：把表面距離也用在多件網格的「連接距離」（`centerline-report.md` 多件表目前只用中心線，粗網格可能同樣誤報）；粗管粗分支旁圈中心被拉偏的限制（只影響位置，優先度低）；先寫好 `check-centreline-continuity.mjs` 的基準讀寫與「只減不增」比較邏輯並用合成資料測試，等生成檔到位再產生基準。
- 規則：所有排程工作都放在本分支與 PR #248，不另開分支或 PR。

## 下一步（舊）
- 自動排程本次判斷：S5、S7 都會改模型或解剖內容，屬需人工審核且會讓待審 PR 繼續增加，故不開工，等使用者處理待審 PR 後再開始 S5。
- 下次排程：先看開放 PR 是否有減少；若有 PR 已 merge，將本檔更新並從 S5 開始（先做不改模型的連續性檢查腳本）。
