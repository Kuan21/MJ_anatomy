# Cloudflare Pages 部署記錄

使用者於 2026-11-17 在 Cloudflare Pages 另開第二個網站 `mj-anatomy.pages.dev`，之後會加 Cloudflare Access 做邀請制。考試前 GitHub Pages 照舊是主要網站，部署流程不改。

## 責任分工

- Cloudflare 設定由使用者在 Cloudflare 介面管理。
- agent 不可修改 Cloudflare 設定，也不可為了 Cloudflare 改 `vite.config` 或 build 指令；有需要先問使用者。

## 目前設定

| 項目 | 設定 |
| --- | --- |
| Production branch | `main` |
| Build 指令 | `npm run build` |
| 輸出資料夾 | `dist` |
| 環境變數 | `NODE_VERSION=24` |
| base | `/`（GitHub Pages 仍用 `--base /MJ_anatomy/`） |
| 預覽分支 | 不 build |

## 日常注意

- 每次 main 合併都會觸發一次 Cloudflare build，約 30 分鐘一次，需要排隊；不需要理會。
- 若使用者通知 build 逾時失敗，改用備案：先在 GitHub Actions 建置完成，再用 `wrangler` 上傳 `dist`。**目前只是計畫，在使用者通知之前不要動手。**

## 考試後步驟（2026-12-17 之後）

以下每一項都需使用者另行批准後才可進行：

1. 拆除 GitHub Pages 部署。
2. 將 repo 轉為私人。
3. 減少 CI 用量。
4. 清除 git 歷史中的筆記檔（例如 `public/models/cmu-course-notes-v4.json`）。這會改寫歷史，必須由使用者另外批准，並在做之前先備份。
