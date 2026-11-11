# 筆記與摘要相關檔案清單（交使用者決定是否移出 repo）

本文件只寫路徑與性質，不貼筆記原文。我沒有刪除或移動任何檔案。「是否被部署」依 `scripts/check-deploy-content.mjs` 的規則判定：vite 只複製 `public/`，Pages 只上傳 `dist/`，`app/` 只引入 `docs/muscle-layers.json` 與 `docs/paokao-aliases.json` 兩個 docs 檔；`npm run check` 與 `npm run build` 後會自動檢查，之後新增引入其他 docs 檔會失敗。

| 路徑 | 大小 | 性質 | 是否被部署 | 能否移出 repo |
| --- | --- | --- | --- | --- |
| `docs/neuro-notes.json` | 670 KB | 神經解剖學共筆的結構化抽取（含筆記原文片段） | 否（只被 prepare-neuro-notes、test-neuro-notes 讀取） | 可；移出後 `prepare-neuro-notes --check`、`test-neuro-notes` 需改成沒有此檔時略過，或改讀 repo 外路徑 |
| `docs/neuro-notes-curation.json` | 46 KB | 對上列抽取的人工整理決定（哪張卡對應哪個結構） | 否 | 可；同上 |
| `docs/neuro-notes-vs-model.md` | 110 KB | 筆記與模型的對照報告（結構名稱與頁碼層級的清單） | 否 | 可；純報告 |
| `docs/neuro-notes-card-mesh.png、docs/neuro-notes-card-nomesh.png` | 851 KB | 資訊卡畫面截圖（歷史檢查用） | 否 | 可 |
| `docs/course-notes-source.md` | 2 KB | 早期「解剖重點」文字來自課堂筆記切片的來源報告（只描述，不含原文） | 否 | 可；內容屬歷史紀錄 |
| `docs/curriculum-terms.json` | 254 KB | 課程名詞表（依講次整理的結構名稱） | 否（prepare-naming、audit-coverage 讀取） | 可；移出後命名與覆蓋稽核腳本需改路徑 |
| `docs/glossary.json` | 228 KB | 跑考摘要名詞表（中英名稱優先順序的來源） | 否；其衍生結果（名稱）寫入 `app/mj-naming-data.ts`，那份會被打包 | 可；`prepare-naming` 需要它，移出後要改成讀 repo 外路徑 |
| `docs/paokao-checklist.json` | 96 KB | 跑考摘要必須存在的結構清單 | 否（prepare-paokao、audit-paokao、audit-coverage 讀取） | 可；`npm run check` 與 build 需要它，移出前要先改腳本 |
| `docs/paokao-names.json` | 16 KB | 跑考摘要頁碼與結構名稱對照 | 否 | 可；audit 腳本讀取 |
| `docs/paokao-aliases.json` | 3 KB | 筆記寫法到模型名稱的對照（只有結構名稱） | **是（被 app 引入、打包進網站）**；`check-no-notes` 第 4 項掃描 | 不可移出，網站搜尋與 Quiz 判分需要；內容只有結構名稱 |
| `docs/paokao-audit.json、docs/paokao-audit.md` | 264 KB | 摘要清單與模型的稽核報告（名稱層級；`audit-paokao.mjs` 產生） | 否 | 可；`audit-paokao --check` 需要它們存在 |
| `docs/heart-checklist.json` | 8 KB | 跑考摘要心臟頁的結構清單 | 否（check-heart 讀取） | 可；移出前要改 check-heart |
| `docs/naming-report.md、docs/coverage-data.json、docs/coverage-baseline.json、docs/coverage-report.md` | 708 KB | 命名與覆蓋稽核報告（名稱與摘要頁碼層級） | 否 | 可；`audit-coverage --check` 需要基準檔 |
| `docs/peripheral-nerve-gaps.md、docs/tendon-ligament-inventory.md、docs/back-glute.md、docs/zh-wikidata-draft.md、docs/BUG_AUDIT.md` | 160 KB | 內文提到摘要或筆記的報告與草稿 | 否 | 可；純文件 |
| `docs/neuro-card-text/*.json（9 個檔）` | 184 KB | 我們自己用自己的話寫的腦部資訊卡文字（不是筆記原文） | 否；但其產物 `public/models/brain/neuro-cards.json` 會部署 | 不建議移出；它是網站內容的來源 |
| `app/mj-paokao.json` | 390 KB | 示意結構資訊卡資料（我們撰寫，由 `scripts/paokao-structures` 產生）；結構名稱來自摘要清單 | **是（被 app 引入、打包進網站）**；這是網站內容，已不含書名 | 不可移出 |
| `app/biomechanics-v2/paokao-bindings.json` | 43 KB | 動作模組中示意結構的綁定（結構名稱與骨骼對應） | 是（打包） | 不可移出；沒有筆記內容 |
| `public/models/paokao/paokao-stream.json.gz` | 42 KB | 示意結構的幾何串流（生成檔） | 是 | 不可移出；生成檔，不手改 |
| `public/models/brain/neuro-cards.json` | 278 KB | 腦部資訊卡（由 docs/neuro-card-text 產生） | 是 | 不可移出；網站內容，`test-neuro-notes` 檢查沒有連續 16 字與筆記相同 |
| `scripts/prepare-neuro-notes.mjs、scripts/test-neuro-notes.mjs、scripts/lib/notes-leak.mjs、scripts/check-no-notes.mjs` | 26 KB | 讀取筆記或檢查筆記不外洩的腳本（腳本本身不含筆記原文） | 否 | 留在 repo；它們是防線 |
| `scripts/audit-paokao.mjs、scripts/prepare-naming.mjs、scripts/audit-coverage.mjs、scripts/check-heart.mjs、scripts/lib/paokao.mjs、scripts/lib/coverage-match.mjs` | 62 KB | 讀取摘要清單產生報告或名稱的腳本 | 否 | 留在 repo |
| `REVIEW_LOG.md、ROADMAP.md、CLAUDE.md、.claude/settings.json` | 348 KB | 流程與規則文件，提到筆記與摘要的名稱但不含內容 | 否 | 留在 repo；REVIEW_LOG.md 的歷史段落仍有 Netter 等舊字串（記錄過去的修正，未改寫） |
| `git 歷史：`public/models/cmu-course-notes-v4.json`` | - | 早期曾被提交的筆記切片檔（目前工作樹沒有） | 否（已不在 HEAD） | 依 CLAUDE.md 不動 git 歷史，是否清除由你在專案完成後決定 |

## 移出前要先做的事
- `npm run check` 與 `npm run build` 的前置步驟（`prepare-paokao`、`prepare-naming`、`audit-paokao --check`、`audit-coverage --check`、`check-heart`）都讀取上列 docs 檔。要移出，必須先把這些腳本改成讀 repo 外的路徑（例如環境變數），並讓 CI 在沒有檔案時的處理方式經你同意；否則 CI 會失敗。
- 建議順序：先移 `docs/neuro-notes*`（只被 2 個腳本用），最後才動 `paokao-checklist.json` 與 `glossary.json`。

## 書名字串清理結果（本次 PR）
- 已移除：`app/mj-structure-info.ts` 的 `GROSS_SOURCE`／`BONE_SOURCE` 書名與 `NETTER_TERMINOLOGY_SOURCE`（改名為 `app/mj-display-terminology.ts` 的 `DISPLAY_TERMINOLOGY_SOURCE`，內容改為 Terminologia Anatomica 與台灣解剖名詞）、`scripts/paokao-structures/*.mjs` 的 Gray's Anatomy for Students／Moore 引用（`app/mj-paokao.json` 的 refs 欄改為空，只保留 Human Reference Atlas 乳腺模型的 CC BY 4.0 出處與「位置依男性骨盆估計」說明）、`public/ATTRIBUTION.md`、`scripts/audit-paokao.mjs` 與 `docs/paokao-audit.md`、`CLAUDE.md`、`docs/BUG_AUDIT.md`。
- refs 沒有填入 Gray's Anatomy 1918 或 OpenStax 的頁碼或 FMA 編號：我沒有逐結構核對真實對應，依規則不編造，所以留空。
- 仍保留且允許：Gray's Anatomy 1918（公有領域）、OpenStax（CC BY 4.0）、BodyParts3D、Z-Anatomy、Human Reference Atlas 的模型授權出處。
- 殘留：`docs/neuro-notes.json` 內有筆記作者自己寫的 netter 字樣（筆記原文，不部署，未動）；`REVIEW_LOG.md` 歷史段落。
