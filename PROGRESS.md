# PROGRESS（自動排程交接檔）

最後更新：2026-11-19。分支：`claude/local-auto`（不推 main、不刪檔）。
依據：`ROADMAP.md`「穩定期」、`CLAUDE.md`、`git log`、開放 PR 清單。

## 目前狀態
- 專案處於**穩定期**（2026-11-08 起）：暫停新功能，只修顯示錯誤；所有 PR 都要使用者人工審核，不可自行 merge。
- main 最新：#431（2026-11-19 第三十二次確認）。本分支已合併 main 到 #431。
- **main 已經有中心線連續性檢查**（#281、#328：`scripts/check-centerlines.mjs`、基準 `docs/centerline-known.json` 57 條，已在 `npm run check` 內）。本分支的 `check-centreline-continuity.mjs` 是另一套做法，見「待我決定」。
- 開放 PR（下列是 2026-11-11 的清單；本機沒有 `gh`，之後沒有再查，main 已合併到 #338，清單很可能已過時）：
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

- 2026-11-15（第十一次）：只加腳本、測試與報告，沒有改模型、解剖內容或網站。
  - 重新檢查：`work/` 與 supplement／serous／female 三個生成串流仍不存在；另外發現跑考串流只有索引檔（`paokao-stream.json.gz`），它指向的二進位檔（`public/models/stream/paokao-*.bin`）不在本機，所以連接管仍載入不了。沒有下載資料。
  - **表面距離用在多件網格**：`centreline-surface.mjs` 新增 `surfaceLinkGap`（把一個結構的各件連成一個整體時要跨過的最大表面空隙，不經過中心線，被略過的小件也算在內），並為每個網格建一次三角形方盒樹（原本逐一比對，多件大網格要跑幾分鐘）；`surfaceGap` 多一個可選的上限參數。合成測試已補在 `test-centreline-surface`。這部分是上一次排程留下、未提交的改動，這次測試通過後才提交。
  - `report-centerlines.mjs` 多件表加了「表面連接距離」一欄，`docs/centerline-report.md` 已用 `--available --write` 重新產生（約 66 秒）。結果：「應相接」4 個都是 0 mm；「未判定」183 個中超過 5 mm 的，中心線量法 57 個、表面量法 56 個。兩種量法只在 3 個結構判斷不同（左右大腦中動脈前外側中央支、Hepatovenous segment IV：中心線說超過 5 mm、表面沒有）；沒有「表面超過而中心線沒有」的情況。也就是粗網格在這張表上幾乎沒有造成誤報，「待我決定」那一項的數量基本不變。**數值沒有在 3D 畫面確認。**
  - **連續性基準的比較邏輯**：新檔 `scripts/lib/centreline-baseline.mjs`（沿用穩定度檢查的 `compareBaseline`）與 `scripts/test-centreline-baseline.mjs`（合成資料，已加入 `npm run check`）。規則：每個上一級關係以表面距離判斷，超過 3 mm 的記入基準（取到 0.5 mm、無條件進位）；記錄的距離只能變小，變小後成為新上限，合上的從清單移除；新出現的空隙、變大的空隙、原本有網格後來沒有的關係都算失敗；失敗時不會產生可儲存的基準；沒有基準檔不會自動建立。
  - **檢查腳本**：新檔 `scripts/check-centreline-continuity.mjs`。不加參數時與 `docs/centreline-continuity-baseline.json` 比較，只印數量與通過／失敗；`--list` 印名稱；`--write` 只在通過時儲存縮小後的基準；`--init` 建立第一份基準（已有基準或缺生成檔時拒絕）；`--available` 是試跑，不讀也不寫基準。**基準檔尚未產生，腳本也還沒有加入 `npm run check`**（要先有三個生成串流與跑考串流的二進位檔）。
  - 本機試跑（`--available --list`，約 20 秒，不含連接管）：127 個關係量到、60 個沒有網格、10 個超過 3 mm，就是之前列出的同十個，數值與 `centerline-attach-report` 一致。不加 `--available` 時在本機因缺檔而停下（預期行為）。
  - 「粗管粗分支旁圈中心被拉偏」這次沒有處理（只影響位置，不影響是否相接）。
  - 本機通過：`test-centreline-baseline`、`test-centreline-surface`、`test-centreline-attach`、`test-centreline-pieces`、`test-centreline-groups`、`test-centreline-continuity`、`test-centreline-classify`、`check-no-notes`、`check:zh`。完整 `npm run check` 因缺生成檔沒有跑。
  - 未提交的暫存診斷腳本 `_diag-jumps.mjs`、`_diag-radius.mjs`、`_diag-branch.mjs`、`_diag-femoral.mjs` 仍在（依「不刪檔」沒有刪），可以由你刪除。`package-lock.json` 的未提交差異仍未提交。
  - 本機沒有 `gh`，未查開放 PR 是否有變動。

- 2026-11-15（第十二次）：只改腳本、測試與報告，沒有改模型、解剖內容或網站。
  - 重新檢查：`work/`、supplement／serous／female 三個生成串流與跑考串流的二進位檔仍不存在，連續性基準仍無法產生；沒有下載資料。
  - **粗管粗分支旁圈中心被拉偏的修正**：`robustRings` 原本只用半徑判斷哪一圈受分支干擾；分支旁有些圈半徑仍在 30% 容許範圍內，但中心已被拉出管外（合成測試：半徑 8 mm 的管偏 8–12 mm、12 mm 的管偏 22–29 mm），所以沒有被修正。現在多一個判斷：圈的中心離前後各 4 圈中心的中位數超過半徑的一半（而且超過一個圈距）也視為受干擾，中心同樣改放在前後最近的正常圈之間的直線上。新參數 `ctol`（預設 0.5，放在最後，原有呼叫不用改）；`centrelineOf`、`centrelineWide` 與 `leg-vessel-build` 不受影響。
  - 合成測試結果（已寫入 `test-centreline-pieces`）：半徑 8 mm 與 12 mm 的管配 4 mm 分支，中心偏移由 8–29 mm 降到 0–4 mm；半徑 3–5 mm 的管結果不變；平滑彎曲（曲率半徑 10–50 mm 的半圓）與直角彎不會被改動。試過的 36 種組合沒有一種比原本差。
  - **仍有的限制**（已寫在註解與測試）：半徑 10 mm 以上的管配超過約一半粗的分支（例如 16 mm 配 6 mm、12 mm 配 8 mm），連續受干擾超過 4 圈，中心仍偏 13–29 mm；分支旁緩慢偏向一側、超過 4 圈的圈也看不出來；與座標軸斜交、比一個圈距更急的折角，轉角那一圈會被拉直約 2 mm。
  - **對實際資料的影響很小**：`docs/centerline-attach-report.md` 重新產生後完全相同（127 個關係、超過 3 mm 的仍是同十個加右股動脈）；`docs/centerline-report.md` 只有兩列變動（左右大腦中動脈前外側中央支的中心線連接距離 17 → 18 mm），其餘數量不變。也就是這個限制在本機現有資料上原本就幾乎沒有造成差異。**數值沒有在 3D 畫面確認，也沒有用實際血管逐一核對修正後的中心。**
  - 本機通過：`test-centreline-pieces`、`test-centreline-groups`、`test-centreline-continuity`、`test-centreline-classify`、`test-centreline-attach`、`test-centreline-surface`、`test-centreline-baseline`、`check-no-notes`、`check:zh`。完整 `npm run check` 因缺生成檔沒有跑。
  - 未提交的暫存診斷腳本 `_diag-jumps.mjs`、`_diag-radius.mjs`、`_diag-branch.mjs`、`_diag-femoral.mjs` 仍在（依「不刪檔」沒有刪），可以由你刪除。`package-lock.json` 的未提交差異仍未提交。
  - 本機沒有 `gh`，未查開放 PR 是否有變動。

- 2026-11-15（第十三次）：只改腳本與測試，沒有改模型、解剖內容或網站。
  - 重新檢查：`work/`、supplement／serous／female 三個生成串流與跑考串流的二進位檔仍不存在，連續性基準仍無法產生；沒有下載資料。main 已前進到 #269（本分支沒有合併 main）。
  - **補上連續性檢查的一個漏洞**：上一級關係的距離取「子結構任何一件到上一級任何一件」的最小值，所以一個結構如果有一件鬆脫、另一件仍接著，檢查看不出來。現在 `check-centreline-continuity.mjs` 對 topology-spec 列出的每個結構另外量「把它所有網格的各件連成一個整體要跨過的最大表面空隙」（`surfaceLinkGap`，同名多個網格一起算），超過 3 mm 的以 `link|名稱` 記入同一份基準，規則與上一級關係相同（只減不增；單件變兩件、變遠都算失敗；合上的移除）。
  - `centreline-baseline.mjs`：新增 `linkFindingsOf`；`compareContinuity`、`firstBaseline` 多一個可選的 `links` 參數（不傳時結果與原本相同）。結構的網格消失時不會被當成「已合上」，仍由上一級關係的「網格消失」報失敗。合成測試已補在 `test-centreline-baseline`（已在 `npm run check` 內），本機通過。
  - 本機試跑（`--available --list`，約 20 秒，不含連接管）：127 個關係、超過 3 mm 的仍是同十個；147 個結構中 2 個自身各件相距超過 3 mm：左右拇主動脈（arteria princeps pollicis），各有兩個同名網格，相距 9 mm。**沒有載入連接管，也沒有在 3D 畫面確認**，不能當成缺陷；是兩條分開的分支還是中間缺一段，屬解剖內容，已列入「待我決定」。
  - 基準檔仍未產生，腳本仍未加入 `npm run check`。
  - 本機通過：`test-centreline-baseline`、`check-no-notes`。完整 `npm run check` 因缺生成檔沒有跑。
  - 未提交的暫存診斷腳本 `_diag-jumps.mjs`、`_diag-radius.mjs`、`_diag-branch.mjs`、`_diag-femoral.mjs` 仍在（依「不刪檔」沒有刪），可以由你刪除。`package-lock.json` 的未提交差異仍未提交。
  - 本機沒有 `gh`，未查開放 PR 是否有變動。

- 2026-11-15（第十四次）：合併 main，只動腳本與檢查清單，沒有改模型、解剖內容或網站。
  - 重新檢查：`work/`、supplement／serous／female 三個生成串流與跑考串流的二進位檔仍不存在；沒有下載資料。
  - **main 已前進 95 個 commit（到 #338），而且與本分支在兩個檔衝突**（`package.json`、`scripts/lib/leg-centreline.mjs`），PR #248 在解決前無法合併。已用一般 merge（不是 rebase，沒有改寫歷史）把 origin/main 合併進本分支並解決衝突；合併沒有刪除任何檔案（只有 main 自己的兩個改名）。
  - `package.json`：main 已把 `npm run check` 改成由 `scripts/run-checks.mjs` 讀清單檔；採用 main 的寫法，本分支的七個中心線合成測試改列在 `scripts/checks/check.d/20261115-centreline-lib-tests.txt`（155 步中的第 148–154 步；本機用 `--only=test-centreline` 跑過，七個都通過）。
  - `leg-centreline.mjs`：兩邊都改了 `centrelineOf` 的第三個參數（main 傳 `{start}` 指定要量哪一件；本分支傳一個接收圈距的物件，第四個參數是 `reach`）。合併後第三個參數是同一個可選物件（讀 `start`、寫回 `steps`），第四個參數 `reach` 保留，兩邊的呼叫都不用改。用合成的兩件網格確認 main 的 `centrelinesOf` 仍回傳兩條線（長的在前），本分支的圈距也照常回傳。
  - **main 已有自己的中心線連續性檢查**（#281、#328）：`scripts/check-centerlines.mjs`，上一級關係取自 `app/mj-vessel-parents.json`，以中心線距離 6 mm 判斷，基準 `docs/centerline-known.json` 目前 57 條，已在 `npm run check` 內。也就是 ROADMAP S5（a）在 main 已經有一版。本分支的 `check-centreline-continuity.mjs` 是另一套（關係取自 `topology-spec`、以表面距離 3 mm 判斷、另量同一結構各件相接），基準仍未產生、未加入檢查清單。兩套怎樣處理已列入「待我決定」；決定前本分支這一套維持現狀。
  - 合併後本機通過：七個 `test-centreline-*`、`check-no-notes`、`check:zh`（204 個檔）、`tsc --noEmit`；`check-centreline-continuity.mjs --available --list` 結果與合併前相同（127 個關係、同十個超過 3 mm、左右拇主動脈 9 mm）。main 的 `check-centerlines.mjs` 與完整 `npm run check` 在本機因缺生成檔停下，**合併後沒有跑過完整檢查**，要看 PR #248 的 CI 結果。
  - 兩邊各有一個叫 `centrelinesOf` 的函式（main 的在 `leg-centreline.mjs`，本分支的在 `centreline-pieces.mjs`），做法不同、互不影響，但名稱相同容易混淆；沒有改名，留待上面的決定。
  - 未提交的暫存診斷腳本 `_diag-jumps.mjs`、`_diag-radius.mjs`、`_diag-branch.mjs`、`_diag-femoral.mjs` 仍在（依「不刪檔」沒有刪），可以由你刪除。`package-lock.json` 的未提交差異仍未提交。
  - 本機沒有 `gh`，未查開放 PR 是否有變動，也沒有看到 PR #248 的 CI 結果。

- 2026-11-16（第十五次）：只合併 main，沒有改模型、解剖內容、網站或腳本。
  - 發現上一次排程留下一個**未提交的合併**（origin/main 到 #333，沒有衝突）。先確認暫存內容與 `git merge-tree` 算出的乾淨自動合併結果完全相同（同一個 tree），才提交。
  - 之後 main 又前進到 #347，再用一般 merge 合併一次，沒有衝突。**注意：** main 在 #347 自己移除了 `app/quiz/hub.tsx`、`app/quiz/lesson-mode.tsx`，合併跟著 main 移除；這不是本分支刪檔。
  - 合併後本機通過：七個 `test-centreline-*`（`run-checks --only=test-centreline`，現在是 162 步中的第 151–157 步）、`check-no-notes`、`check:zh`（215 個檔）、`tsc --noEmit`。完整 `npm run check` 因缺生成檔沒有跑。
  - `work/`、supplement／serous／female 三個生成串流與跑考串流二進位檔仍不存在；沒有下載資料。不需生成檔、又不改網站的 S5 工作仍然已做完，其餘等「待我決定」。
  - 未提交的暫存診斷腳本 `_diag-*.mjs` 四個與 `package-lock.json` 差異仍未提交（依「不刪檔」沒有刪）。本機沒有 `gh`，未查 PR #248 的 CI。

- 2026-11-16（第十六次）：只合併 main，沒有改模型、解剖內容、網站或腳本。
  - main 前進到 #353（#348 模擬考試、#352 頭頸核對報告、#353 登記表），`git merge-tree` 確認無衝突、沒有刪檔後用一般 merge 合併。
  - 合併後本機通過：七個 `test-centreline-*`（`run-checks check --only=test-centreline`，現在是 163 步中的第 151–157 步）、`check-no-notes`、`check:zh`（219 個檔）、`tsc --noEmit`。
  - main 新增的 `scripts/test-quiz-exam.mjs` 在本機失敗於「every tier has questions {0,0,0}」：它讀 `public/models/quiz-*.json`（生成檔），本機沒有這些檔，所以真實資料部分量到 0 題；前面不需資料的部分都通過。屬缺生成檔，與本分支無關，沒有改它。完整 `npm run check` 因缺生成檔沒有跑。
  - 其餘不變：生成檔仍缺、`_diag-*.mjs` 與 `package-lock.json` 差異仍未提交、本機沒有 `gh`。

- 2026-11-17（第十七次）：合併 main 並修腳本的 Windows 路徑，沒有改模型、解剖內容或網站。
  - main 前進 37 個 commit 到 #388。`git merge-tree` 指出 `scripts/check-zh.mjs` 有衝突：main 加了 `ZH_ROOT` 環境變數與 `lib/zh-rules.mjs`，本分支把 `root` 改成 `fileURLToPath`。用一般 merge 解決，兩邊都保留（`process.env.ZH_ROOT ?? fileURLToPath(...)`）。合併沒有刪除本分支任何檔案。
  - main 新增的七個腳本有同樣的 `URL.pathname` 寫法，在 Windows 會變成 `C:\C:\…`：`test-abducens-name`、`test-check-zh`、`test-joint-motion-table`、`check-deploy-content`、`audit-lr-names`、`build-ear-atlas`、`derive-jugular-shift`，全部改用 `fileURLToPath`。`check-deploy-content` 另外在 Windows 把相對路徑寫成 `docs\…`，對不上允許清單而誤報兩個檔，改成一律用 `/`。Linux／CI 行為不變。
  - 修正後本機通過：`test-abducens-name`、`test-check-zh`、`test-joint-motion-table`、`check-deploy-content`、`check-zh`（314 個檔）、`check-no-notes`、`tsc --noEmit`、七個 `test-centreline-*`（現在是 178 步中的第 152–158 步）。`audit-lr-names` 不再出現路徑錯誤，之後因本機沒有 `facial-stream.json.gz` 停下；`build-ear-atlas`、`derive-jugular-shift` 只做了語法檢查，**沒有實際執行**（需要原始資料）。完整 `npm run check` 因缺生成檔沒有跑。
  - 其餘不變：生成檔仍缺、`_diag-*.mjs` 與 `package-lock.json` 差異仍未提交、本機沒有 `gh`，未查 PR #248 的 CI。

- 2026-11-17（第十八次）：只查狀態，沒有改程式、模型、解剖內容或網站。
  - `git fetch` 後 main 仍在 #388，本分支已含全部 main 的 commit，不需要合併。
  - `work/`、`serous/`、`female/` 仍不存在；`public/models/supplement/` 只有神經的 `.bin.gz`，沒有 `supplement-stream.json.gz`；`public/models/stream/` 不存在（跑考串流二進位檔仍缺）。連續性基準仍無法產生；沒有下載資料。
  - 本機通過：七個 `test-centreline-*`（178 步中的第 152–158 步）、`check-no-notes`。
  - 不需生成檔、又不改網站的工作已做完，其餘仍等「待我決定」。生成檔仍缺、`_diag-*.mjs` 四個與 `package-lock.json` 差異仍未提交、本機沒有 `gh`，未查 PR #248 的 CI。

- 2026-11-17（第十九次）：只合併 main，沒有改程式、模型、解剖內容或網站。
  - main 前進到 #391（#389 學習與模擬考試只載入目標與鄰近構造、#390 登記表、#391 核對報告）。`git merge-tree` 確認無衝突，main 這次只有修改與新增（沒有刪檔），用一般 merge 合併。
  - 新改的 `scripts/test-quiz-viewer.mjs` 沒有 `URL.pathname` 寫法；在本機停在讀取 `public/models/quiz-lower.json`（生成檔，本機沒有），與 `test-quiz-exam` 同樣是缺生成檔，與本分支無關，沒有改它。
  - 合併後本機通過：七個 `test-centreline-*`（178 步中的第 152–158 步）、`check-no-notes`、`tsc --noEmit`。完整 `npm run check` 因缺生成檔沒有跑。
  - 其餘不變：生成檔仍缺、`_diag-*.mjs` 四個與 `package-lock.json` 差異仍未提交、本機沒有 `gh`，未查 PR #248 的 CI。

- 2026-11-17（第二十次）：合併 main 並修腳本的 Windows 路徑，沒有改模型、解剖內容或網站。
  - main 前進 13 個 commit 到 #405（#383 鎖骨下動脈位移、#394 模擬考試、#395 主圖譜接腦資訊卡、#402 耳部示意模型等）。`git merge-tree` 確認無衝突、main 沒有刪檔，用一般 merge 合併。
  - main 新增／修改的腳本有四個 `URL.pathname` 寫法，已改用 `fileURLToPath`：`test-wording-unify`、`test-ear-refinement`、`lib/brain-quiz-source`、`lib/joint-quiz-source`。其中 **`test-wording-unify` 在 Windows 原本掃到 0 個檔而空過**；改後又發現它比對允許清單時用 `\` 分隔的相對路徑，把允許的別名表誤報為違規，改成一律用 `/`。現在本機掃 310 個檔並通過。`derive-subclavian-shift` 的 `pathname` 只用在印出訊息，沒有改。Linux／CI 行為不變。
  - 修正後本機通過：`test-wording-unify`、`test-ear-refinement`（實際讀耳部模型執行）、七個 `test-centreline-*`（183 步中的第 152–158 步）、`check-no-notes`、`check-zh`（317 個檔）、`tsc --noEmit`；兩個 quiz-source 程式庫只做語法檢查（需 `.sites-runtime`，本機沒有）。完整 `npm run check` 因缺生成檔沒有跑。
  - 生成檔：`public/models/stream/` 現在有神經串流 `.bin.gz`，但仍沒有跑考串流二進位檔；`work/`、`serous/`、`female/`、`supplement-stream.json.gz` 仍不存在，連續性基準仍無法產生。
  - 其餘不變：`_diag-*.mjs` 四個與 `package-lock.json` 差異仍未提交、本機沒有 `gh`，未查 PR #248 的 CI。

- 2026-11-17（第二十一次）：修腳本的 Windows 路徑，沒有改模型、解剖內容或網站。
  - `git fetch` 後 main 仍在 #405，本分支已含全部 main 的 commit，不需要合併。
  - 再找到三個腳本有 `new URL(...).pathname` 交給 `require()` 的寫法，已改用 `fileURLToPath`：`test-joints-lr-names`（在 `npm run check` 內，`check.d/20261116-joints-lr-names.txt`）、`extract-zanatomy-joints`、`extract-zanatomy-nervous`。用同一路徑在本機重現舊寫法：`require` 得到 `MODULE_NOT_FOUND`，也就是 `test-joints-lr-names` 在 Windows 原本會失敗。改後本機實際執行通過（289 個成對組織、144 對，沒有左右顛倒）。兩個抽取腳本只做了語法檢查，**沒有實際執行**（要 Z-Anatomy 原始檔）。Linux／CI 行為不變。
  - 本機通過：`test-joints-lr-names`、七個 `test-centreline-*`（183 步中的第 152–158 步）、`check-no-notes`。完整 `npm run check` 因缺生成檔沒有跑。
  - 現在 `scripts/` 內已沒有把 `URL.pathname` 當檔案路徑用的寫法（`derive-subclavian-shift` 只用在印出訊息、`lib/stability-static` 只切相對路徑，都不需要改）。
  - 其餘不變：`work/`、`serous/`、`female/`、`supplement-stream.json.gz`、跑考串流二進位檔仍缺，連續性基準仍無法產生；`_diag-*.mjs` 四個與 `package-lock.json` 差異仍未提交；本機沒有 `gh`，未查 PR #248 的 CI。

- 2026-11-18（第二十二次）：合併 main 並修腳本的 Windows 路徑，沒有改模型、解剖內容或網站。
  - main 前進 10 個 commit 到 #425（#406 骨性標誌剛性跟骨、#407 耳部聽覺動畫、#419 腎門次序、#425 胃與十二指腸資訊卡等）。`git merge-tree` 確認無衝突、main 沒有刪檔，用一般 merge 合併。
  - 新的 `URL.pathname` 寫法三處，改用 `fileURLToPath`：
    - `test-ear-hearing`（在 `npm run check` 內，`check.d/20261117-ear-hearing.txt`）：本機重現原本會失敗（`scandir 'C:\C:\Users\…\app\ear-hearing'`），改後實際執行通過（6 步、58 段文字、10 個原始檔）。
    - `measure-rln-groove`：`process.argv[1] === …pathname` 在 Windows 永遠不成立，直接執行時什麼都不印；改成比較 `path.resolve(argv[1])` 與 `fileURLToPath`。只做語法檢查，**沒有實際執行**（要大圖譜與神經串流）。
    - `build-required-structures`：`mkdirSync` 用 `pathname`，改用 `fileURLToPath`。只做語法檢查（輸入檔不在 repo）。
    - Linux／CI 行為不變。
  - 本機通過：`test-ear-hearing`、七個 `test-centreline-*`、`check-no-notes`。完整 `npm run check` 因缺生成檔沒有跑。
  - 其餘不變：生成檔仍缺，連續性基準仍無法產生；`_diag-*.mjs` 四個與 `package-lock.json` 差異仍未提交；本機沒有 `gh`，未查 PR #248 的 CI。

- 2026-11-18（第二十三次）：合併 main 並修一個腳本的 Windows 路徑，沒有改模型、解剖內容或網站。
  - main 前進 12 個 commit 到 #437（#421 喉返神經上端、#426 胃詳細模式、#427 耳部聽覺動畫 iPad、#430 腸肝膽腎門資訊卡、#436 咽後間隙方案 B 預檢等）。`git merge-tree` 確認無衝突、main 沒有刪檔或改名，用一般 merge 合併。
  - main 新增的 `test-ear-hearing-touch`（在 `npm run check` 內，`check.d/20261117-ear-hearing-touch.txt`）用 `URL.pathname`，本機重現原本會失敗（`open 'C:\C:\Users\…\hearing.css'`），改用 `fileURLToPath` 後實際執行通過（8 個控制項都在 44 點以上）。Linux／CI 行為不變。其他新腳本沒有同類寫法。
  - 本機通過：`test-ear-hearing-touch`、`test-organ-atlas`（1 個器官包、55 個結構）、七個 `test-centreline-*`、`check-no-notes`。完整 `npm run check` 因缺生成檔沒有跑。
  - 其餘不變：生成檔仍缺，連續性基準仍無法產生；`_diag-*.mjs` 四個與 `package-lock.json` 差異仍未提交；本機沒有 `gh`，未查 PR #248 的 CI。

- 2026-11-18（第二十四次）：只查狀態，沒有改程式、模型、解剖內容或網站。
  - `git fetch` 後 main 仍在 #437，本分支已含全部 main 的 commit，不需要合併。
  - `scripts/` 內沒有新的 `URL.pathname` 寫法。
  - 生成檔仍缺（`work/`、`serous/`、`female/`、`supplement-stream.json.gz`、跑考串流二進位檔；`public/models/stream/` 只有神經串流），連續性基準仍無法產生；沒有下載資料。
  - 本機通過：七個 `test-centreline-*`（191 步中的第 152–158 步）、`check-no-notes`。
  - 不需生成檔、又不改網站的工作已做完，其餘仍等「待我決定」。`_diag-*.mjs` 四個與 `package-lock.json` 差異仍未提交；本機沒有 `gh`，未查 PR #248 的 CI。

- 2026-11-18（第二十五次）：只查狀態，沒有改程式、模型、解剖內容或網站。
  - `git fetch` 後 main 仍在 #437，本分支已含全部 main 的 commit，不需要合併；`scripts/` 內沒有新的 `URL.pathname` 寫法。
  - 生成檔仍缺（同上），連續性基準仍無法產生；沒有下載資料。
  - 本機通過：七個 `test-centreline-*`（191 步中的第 152–158 步）、`check-no-notes`。
  - 其餘仍等「待我決定」。`_diag-*.mjs` 四個與 `package-lock.json` 差異仍未提交；本機沒有 `gh`，未查 PR #248 的 CI。

- 2026-11-18（第二十六次）：合併 main 並修腳本的 Windows 動態 import 路徑，沒有改模型、解剖內容或網站。
  - main 前進到 #445（#418 眼詳細模式 Quiz、#423 骨盆與會陰重疊網格、#438／#439／#441 登記表、#445 點到血管末端片時選取主血管）。`git merge-tree` 確認無衝突、main 沒有刪檔或改名，用一般 merge 合併。
  - **新發現的同類問題**：`import()` 收到 `C:\…` 絕對路徑時，Windows 會報 `ERR_UNSUPPORTED_ESM_URL_SCHEME`（之前只修了 `URL.pathname`，沒查到這一類）。main 新增的 `test-vessel-end-select`（在 `npm run check` 內）因此在本機失敗；原因在它呼叫的共用程式庫 `lib/vessel-segments.mjs`。全部 16 個腳本／程式庫改用 `pathToFileURL(...).href`：`lib/vessel-segments`、`lib/vessel-pose`、`lib/stability-motion`、`test-vessel-end-select`、`check-schematic-models`、`check-muscle-parts`、`compute-space-ranges`、`compute-space-shapes`、`audit-motion-followers`、`audit-shoulder-pose`、`audit-vessel-motion`、`test-motion-followers`、`test-heart-vessels`、`test-digits`、`test-digit-collision`、`test-vessel-path`。Linux／CI 行為不變。
  - 驗證：`test-vessel-path` 改後在本機實際執行通過（原本會失敗）；`test-vessel-end-select`、`check-muscle-parts`、`test-digits`、`compute-space-ranges` 已越過 import，之後因缺 `facial-stream.json.gz`（生成檔）停下；其餘只做語法檢查。`audit-vessel-gaps.mjs` 寫死 `/home/user/mj-shoulder/`，是舊的一次性工具，沒有改。
  - 本機通過：`test-perineal-duplicates`、`test-vessel-path`、七個 `test-centreline-*`、`check-no-notes`。`test-quiz-eye`、`test-pelvic-floor-female` 因缺生成檔停下（與本分支無關）。完整 `npm run check` 因缺生成檔沒有跑。
  - 其餘不變：生成檔仍缺，連續性基準仍無法產生；`_diag-*.mjs` 四個與 `package-lock.json` 差異仍未提交；本機沒有 `gh`，未查 PR #248 的 CI。

- 2026-11-18（第二十七次）：只查狀態，沒有改程式、模型、解剖內容或網站。
  - `git fetch` 後 main 仍在 #445，本分支已含全部 main 的 commit，不需要合併。
  - `scripts/` 內沒有新的 `URL.pathname` 寫法；另查了以變數傳給 `import()` 的寫法，其餘都是 `new URL(..., tmp)`（file URL，Windows 可用），只剩 `audit-vessel-gaps.mjs`（舊的一次性工具，寫死 Linux 路徑，沒有改）。
  - 生成檔仍缺（`work/`、`serous/`、`female/`、`supplement-stream.json.gz`、跑考串流二進位檔；`public/models/stream/` 只有神經串流），連續性基準仍無法產生；沒有下載資料。
  - 本機通過：七個 `test-centreline-*`（195 步中的第 152–158 步）、`check-no-notes`。
  - 其餘仍等「待我決定」。`_diag-*.mjs` 四個與 `package-lock.json` 差異仍未提交；本機沒有 `gh`，未查 PR #248 的 CI。

- 2026-11-19（第二十八次）：只查狀態，沒有改程式、模型、解剖內容或網站。
  - `git fetch` 後 main 仍在 #445，本分支已含全部 main 的 commit，不需要合併；`scripts/` 內沒有新的 `URL.pathname` 寫法。
  - 生成檔仍缺（同上），連續性基準仍無法產生；沒有下載資料。
  - 本機通過：七個 `test-centreline-*`（195 步中的第 152–158 步）、`check-no-notes`。
  - 其餘仍等「待我決定」。`_diag-*.mjs` 四個與 `package-lock.json` 差異仍未提交；本機沒有 `gh`，未查 PR #248 的 CI。

- 2026-11-19（第二十九次）：只合併 main，沒有改程式、模型、解剖內容或網站。
  - main 前進到 #442／#443（胃詳細模式後胃動靜脈、胸管終點與右淋巴管示意短管）。`git merge-tree` 確認無衝突、main 沒有刪檔或改名，用一般 merge 合併。
  - main 新增／修改的腳本（`test-lymphatic-ducts-neck`、`measure-lymphatic-ducts-neck`、`paokao-structures/neck-lymphatics`、`organ-atlas/stomach*`、`lib/paokao-build`）沒有 `URL.pathname` 或變數 `import()` 寫法。
  - `test-lymphatic-ducts-neck`（在 `npm run check` 內）在本機因缺 `supplement-stream.json.gz`（生成檔）停下，與本分支無關，沒有改。
  - 本機通過：七個 `test-centreline-*`（196 步中的第 152–158 步）、`check-no-notes`。完整 `npm run check` 因缺生成檔沒有跑。
  - 其餘仍等「待我決定」。`_diag-*.mjs` 四個與 `package-lock.json` 差異仍未提交；本機沒有 `gh`，未查 PR #248 的 CI。

- 2026-11-19（第三十次）：只合併 main，沒有改程式、模型、解剖內容或網站。
  - main 前進到 #440（腹部、骨盆與會陰核對報告與登記表，只改 `docs/WORK_REGISTRY.md`、`docs/qa-report.md`）。`git merge-tree` 確認無衝突、沒有刪檔，用一般 merge 合併。
  - 本機通過：七個 `test-centreline-*`（196 步中的第 152–158 步）、`check-no-notes`。完整 `npm run check` 因缺生成檔沒有跑。
  - 其餘仍等「待我決定」。`_diag-*.mjs` 四個與 `package-lock.json` 差異仍未提交；本機沒有 `gh`，未查 PR #248 的 CI。

- 2026-11-19（第三十一次）：修一個腳本的 Windows 路徑，沒有改模型、解剖內容或網站。
  - `git fetch` 後 main 仍在 #440，本分支已含全部 main 的 commit，不需要合併。
  - 第二十九次漏看：`measure-lymphatic-ducts-neck`（#443 新增）用 `process.argv[1] === …pathname` 判斷是否直接執行，在 Windows 永遠不成立，直接執行時什麼都不印。改成比較 `path.resolve(argv[1])` 與 `fileURLToPath`（同 `measure-rln-groove` 的修法）。改後直接執行會進入主程式，之後因缺 `supplement-stream.json.gz`（生成檔）停下，**沒有完整執行**。`test-lymphatic-ducts-neck` 只 import 它的函式，不受影響。Linux／CI 行為不變。
  - 現在 `scripts/` 內的 `.pathname` 只剩 `derive-subclavian-shift`（印訊息）、`lib/stability-static`（切相對路徑），不需要改。
  - 本機通過：七個 `test-centreline-*`（196 步中的第 152–158 步）、`check-no-notes`。完整 `npm run check` 因缺生成檔沒有跑。
  - 其餘仍等「待我決定」。`_diag-*.mjs` 四個與 `package-lock.json` 差異仍未提交；本機沒有 `gh`，未查 PR #248 的 CI。

- 2026-11-19（第三十二次）：只合併 main，沒有改程式、模型、解剖內容或網站。
  - main 前進到 #431（血管連接管只接同一棵血管樹、四肢血管真缺口登記為使用者 2026-11-18 批准的暫時例外、相關生成報告）。`git merge-tree` 確認無衝突、main 沒有刪檔或改名，用一般 merge 合併。
  - main 新增的 `scripts/lib/vessel-relation.mjs` 只用相對路徑 `import('../audit-vessel-ends.mjs')`，Windows 可用；`scripts/browser/vessel-region-shots.cjs` 的輸出資料夾預設 `/tmp/vessel-region`，可由參數指定，沒有改。`scripts/` 內沒有新的 `URL.pathname` 寫法。
  - 本機通過：七個 `test-centreline-*`（196 步中的第 152–158 步）、`check-no-notes`。完整 `npm run check` 因缺生成檔沒有跑。
  - 其餘仍等「待我決定」。`_diag-*.mjs` 四個與 `package-lock.json` 差異仍未提交；本機沒有 `gh`，未查 PR #248 的 CI。

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
- S5 連續性基準（2026-11-15）：本機缺 `supplement-stream.json.gz`、`serous-stream.json.gz`、`female-stream.json.gz` 與跑考串流的二進位檔（`public/models/stream/paokao-*.bin`），產生它們要先下載 BodyParts3D 原始檔。請決定：由你在有這些檔的環境跑 `node scripts/check-centreline-continuity.mjs --init`，或授權排程下載原始資料後在本機產生。決定前基準不會建立，腳本不會加入 `npm run check`。
- 待審 PR 已有 10 個，遠超 #234 擬定的上限 5 個；在使用者審核／合併前，自動排程**不新開**涉及模型或解剖內容的 PR，避免再堆積。請決定先審哪幾個。
- S5 多件網格「未判定」183 個（`docs/centerline-report.md` 多件表，其中 57 個連接距離超過 5 mm；2026-11-14 重新產生前是 54 個）：每一個要當成「成組結構」（各件本來分開，不檢查相接）還是「單一結構」（各件必須相接，列入連續性基準），需你決定；決定前連續性檢查只會涵蓋 topology-spec 已列的結構。
- S5 左右拇主動脈（2026-11-15 第十三次）：各有兩個同名網格，表面相距 9 mm（本機試跑，不含連接管，未在 3D 畫面確認）。請決定這是兩條本來分開的分支（不檢查相接），還是應該相接（列入基準當已知空隙）。決定前建立基準時會照現況記為已知空隙。
- S5 兩套連續性檢查（2026-11-15 第十四次）：main 已有 `check-centerlines.mjs`（#281、#328；中心線距離、基準 57 條、已在 `npm run check`）；本分支另有 `check-centreline-continuity.mjs`（表面距離、topology-spec、各件相接；未有基準）。請決定：（甲）只留 main 那一套，本分支的量測程式庫只當報告工具；（乙）把本分支的表面距離與「各件相接」併入 main 那一套；（丙）兩套並存。建議（乙）或（甲），不建議（丙）（同一件事會有兩份基準）。決定前不動。
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
- 上一項的（2）已完成兩件（2026-11-15 第十一次：多件表的表面連接距離；`centreline-baseline.mjs`、`check-centreline-continuity.mjs` 與測試）。
- 下一項：（1）有了三個生成串流與跑考串流的二進位檔後：跑 `node scripts/check-centreline-continuity.mjs --init` 產生基準，看清單是否合理，再把腳本加入 `npm run check`；（2）不需生成檔可做的已所剩不多：粗管粗分支旁圈中心被拉偏的限制（優先度低）；S5 的「整條高亮」會改網站，屬需人工審核，等使用者處理待審 PR 後再開始。
- 上一項（2）的「粗管粗分支旁圈中心被拉偏」已處理（2026-11-15 第十二次：`robustRings` 加入中心位置判斷；很粗的管配粗分支仍是已知限制，對本機實際資料幾乎沒有影響，不再排入）。
- 下一項：不需生成檔、又不改網站的 S5 工作已做完。剩下的都要等你：（1）三個生成串流與跑考串流二進位檔到位後跑 `node scripts/check-centreline-continuity.mjs --init`，看清單是否合理，再加入 `npm run check`；（2）「未判定」多件網格的歸類（見「待我決定」）；（3）S5「整條高亮」會改網站，等待審 PR 處理後再開始。
- 2026-11-15 第十三次：連續性檢查補上「同一結構各件相接」（`link` 項目）。其餘不變：仍等上面（1）（2）（3）。
- 2026-11-15 第十四次：已合併 main（到 #338）並解決衝突。下一次先看 main 有沒有再前進、有沒有新衝突（`git merge-tree --write-tree --name-only HEAD origin/main`），有就再合併一次；其餘仍等上面（1）（2）（3）與「兩套連續性檢查」的決定。
- 規則：所有排程工作都放在本分支與 PR #248，不另開分支或 PR。

## 下一步（舊）
- 自動排程本次判斷：S5、S7 都會改模型或解剖內容，屬需人工審核且會讓待審 PR 繼續增加，故不開工，等使用者處理待審 PR 後再開始 S5。
- 下次排程：先看開放 PR 是否有減少；若有 PR 已 merge，將本檔更新並從 S5 開始（先做不改模型的連續性檢查腳本）。
