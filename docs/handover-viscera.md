# 內臟器官詳細模式交接（胃）

交接日期 2026-11-17，由「生殖＋內臟」交給「腹部內臟」。分支 `feat/organ-stomach`（尚未開 PR）。這份文件只給內部交接用，不發布到網站，完成胃的 PR 後可以刪除。

## 做到哪裡

- 共用模板 `docs/organ-detail-template.md` 的胃版本已寫完程式：器官本身、供應動脈、回流靜脈（含門靜脈屬支）、神經、淋巴引流五組；每組可單獨顯示，也可用「全部」一起看（overview）；單選一組時胃壁變成淡色外殼；切面（不切、矢狀、冠狀、水平）照模板；資訊卡共 54 項；搜尋與 Quiz（胃篇）已接上。
- 使用者 2026-11-17 已批准穩定度例外 `cuts|runtime:organ/organ-viewer.ts`（`measure` 2），已寫進 `docs/stability-known.json`。
- 已把 2026-11-17 的 main 併入（merge，沒有 rebase），`app/quiz/viewer.ts` 的衝突已解決：main 改用 `coversTarget`，我們在其中保留器官蓋住目標的規則（`ORGAN_IDS`、`coversOrganTarget`）。型別檢查沒有錯誤。
- PR 說明草稿：`/tmp/claude-0/-home-user-MJ-anatomy/4eccc4ca-0a5b-5de2-bdd9-9b800c710def/scratchpad/pr-body.md`（機器重啟後 /tmp 內容可能還在，仍建議先把內容搬進 PR）。

## 用到的模型與腳本

- 模型：BodyParts3D 4.0 既有的腹腔幹、胃左、胃右、胃網膜左、胃網膜右、脾、肝總、肝固有、胃十二指腸動脈；胃左、胃右、胃網膜左、胃網膜右、脾靜脈、腸繫膜上靜脈（切在下端）、門靜脈；脾與胰（半透明相鄰構造）；左右迷走神經下段（Z-Anatomy，CC BY-SA 4.0）、食道神經叢、左右腹腔神經節、左右大內臟神經。
- 程式沿中心線生成的連續圓管，全部標「示意」：胃短動脈與靜脈、胃後動脈與靜脈、前迷走神經幹、胃前支、腹腔神經叢。起止點放在相鄰真實模型的表面上，走向依公開資料（Gray's Anatomy 1918、OpenStax），請使用者核對。
- 淋巴（胃左、胃右、脾、胃網膜、腹腔淋巴結）沒有模型，只有資訊卡。
- 腳本與程式：`scripts/build-organ-atlas.mjs`、`scripts/lib/organ-mesh.mjs`、`scripts/lib/organ-supply.mjs`、`scripts/organ-atlas/stomach.mjs`、`scripts/organ-atlas/stomach-supply.mjs`、`scripts/test-organ-atlas.mjs`、`scripts/browser/organ-stomach-shots.cjs`；程式在 `app/organ/`（檢視器 `organ-viewer.ts`、分組 `organs/stomach-supply.ts`、`organs/stomach.ts`）、`app/quiz/organs.ts`。生成物 `public/models/organ/stomach/`。

## 未完成

1. **還沒跑完 `npm run regen` 與 `npm run ci:local`。** regen 在併入 2026-11-17 main 後，第 1–10 步通過，第 11 步（`prepare-paokao`）起被機器重啟中斷；穩定度那一步（第 41 步）在登記例外後還沒驗證是不是只有這一條新增，若出現第二條要停下來問使用者。
2. 沒有 3D 實機截圖（桌面與手機），PR 說明的「3D 實機畫面確認了什麼」欄還空著。截圖腳本已寫好。
3. 已知限制要交使用者決定：胃網膜與胃右動脈貼在胃表面（埋入中位數約 1 mm）、胃左動脈靠近賁門最深埋入約 8 mm（中位數 4 mm），是圖譜原始位置，本分支不校正；後迷走神經幹沒有單獨一項，說明寫在「右迷走神經」卡內；腸繫膜下靜脈不放。
4. `docs/review-log/pr-<編號>.md` 與 `docs/roadmap-updates/pr-<編號>.md` 要在 PR 開出後補。
5. 後續器官（使用者 2026-11-17 指示）：考試前先做器官各部分表面著色（胃底、大小彎、幽門、角切跡、十二指腸四段與乳頭、盲腸、迴盲瓣、膽囊底；`docs/exam2-abdomen-gap.md` A1–A3）與缺的血管分支（胃短、胃網膜左、胃後、胰大動脈、膽囊動脈等，A4–A5），詳細模式版面考試後再做；腎門次序（QA 報告 AB-01）是優先①。順序：十二指腸、胰、脾 → 肝、膽囊與膽道 → 小腸、大腸 → 腎、腎上腺，腹腔 overview 在最後。

## 重工作的注意事項

- 4 個 CPU，`regen`、`ci:local`、build、瀏覽器一次只跑一項。我用過 `/tmp/claude-0/heavy-queue.sh <標籤> '<指令>'`（先到先做的佇列，鎖在 `/tmp/claude-0/heavy.lock`）與 `/tmp/claude-0/job.sh <工作樹> <名稱>`（可續跑的 regen＋ci:local，機器重啟後再跑一次會從中斷的步驟接著做）。這些腳本在 repo 外，機器重建後要重寫。
- 機器在 2026-11-17 重啟過多次，背景工作會被殺掉；長工作要能續跑（`npm run regen -- --from=N`、`npm run ci:local -- --from=N`）。
