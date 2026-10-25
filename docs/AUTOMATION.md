# 自動化流程與 GitHub 設定

## 每個 PR 的流程（由 Claude 自動執行）
1. 開新 branch，一個 PR 只做一個主題。
2. 本機跑 `npm run check`、`npm run check:motion`、`npm run build`，全部通過才推送。
3. 開 PR；描述包含：改了什麼、怎樣在網站上找到、哪些是示意模型、參考圖譜、需要核對的地方。
4. 啟用 auto-merge（squash）；GitHub 檢查通過後自動合併。檢查失敗就修正再推，不跳過檢查。
5. 全部完成後在 `REVIEW_LOG.md` 記錄所有已合併的 PR 與待核對項目。

## 現有的檢查（`.github/workflows/deploy-preview.yml`）
每個對 `main` 的 PR 與每次 push 都會執行：`npm ci` → `npm run check` → `npm run check:motion` → `npm run build`。
job 名稱是 **build**（workflow 名稱 Deploy MJ Anatomy Preview）。所以不另外新增一份重複的 workflow（會讓每個 PR 多跑一次幾十分鐘的檢查）。

## 需要在 GitHub 網頁開啟的設定（repo owner 操作）
1. **Settings → General → Pull Requests**：勾選 *Allow auto-merge*，並勾選 *Allow squash merging*（可取消其他合併方式）；建議勾選 *Automatically delete head branches*。
2. **Settings → Branches → Add branch ruleset（或 classic branch protection rule）**，目標 `main`：
   - *Require a pull request before merging*（approval 數量設 0，這樣不需要人工批准）。
   - *Require status checks to pass before merging*，並加入必要檢查 **build**（先讓任一 PR 跑過一次，才會出現在可選清單）。
   - *Require branches to be up to date before merging*（建議）。
   - 不要開 *Allow force pushes*、*Allow deletions*。
3. **Settings → Actions → General**：*Workflow permissions* 維持 Read repository contents；Pages 的部署要求 Source 為 GitHub Actions（現有設定）。
4. 如果用 Claude 的 GitHub App / 帳號推送：確認它對此 repo 有 Contents 與 Pull requests 的寫入權限。

沒有開啟第 1、2 項時，auto-merge 會被 GitHub 拒絕；Claude 會改成等檢查全綠後直接 squash merge。
