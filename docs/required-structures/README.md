# 必備結構清單（內部文件，不放進網站）

目的：使用者的課程資料提到的每一個結構，網站上都必須有（網站可以比清單多，不可以少）。這個資料夾只放**結構名稱**，不放任何說明句、頁碼、題目或資料來源名稱。

## 檔案

| 檔案 | 內容 | 能不能手動改 |
|---|---|---|
| `head-neck.json` | 頭頸部必備結構清單：`id`、`en`、`zh`、`type`、`topics`、`expect3d`、`reason`、`seed` | 可以，見下方規則 |
| `aliases.json` | 清單名稱與網站名稱不同時的對照：`id`、`site`（網站上的英文名）、`kind` | 可以 |
| `known-gaps.json` | 目前已知還沒有的結構（只放 id）。**只可減少，不可增加** | 只用 `--write` 改 |

## 清單怎麼產生

清單由 `scripts/build-required-structures.mjs` 合併多份「名稱清單」而成（輸入檔放在 repo 外，所以這支腳本不接進 CI）：

```
node scripts/build-required-structures.mjs <json 檔或資料夾> [...]
```

- 輸入每筆是 `{en, zh, type, status, topic}`，只取名稱、類型、主題標籤。
- 去重鍵是「正規化後的英文名」：忽略大小寫、標點、連字號、Left／Right、`.l`／`.r`、單複數與 muscle 一詞；括號內的別名另外保留作為比對用名稱；artery／vein／nerve 不會被去掉（facial artery 與 facial nerve 是不同結構）。
- 同一結構在多個主題出現時，合併成一筆，`topics` 列出所有主題。
- 臨床術語與細胞層級項目（`expect3d: false`）仍留在檔案裡並寫明 `reason`，避免有人再把它們加回來。
- `id`（`RS-0001`…）依既有檔案保留；新結構只會往後追加，不重新編號。
- `seed` 是抽取當時人工判斷的狀態（FOUND、ALIAS、REGION-ONLY、MISSING），只作對照，不作依據。

## 檢查

```
node scripts/check-required-structures.mjs             # CI 使用，只輸出數量與 id
node scripts/check-required-structures.mjs --explain   # 本機使用，列出名稱與比對結果（不可用在 CI）
node scripts/check-required-structures.mjs --write     # 把已經補上的結構從 known-gaps.json 移除
node scripts/test-required-structures.mjs              # 檔案格式與比對函式測試
```

每個 `expect3d` 的結構會被分成 PRESENT（有同名結構）、ALIAS（以別名表或中文名找到）、CONCEPT-ONLY（只有概念、沒有模型）、CARD-ONLY（只有資訊卡）、MISSING。比對只看**結構名稱**：只出現在說明文字裡的名稱不算。名稱索引來自已提交的檔案：圖譜與面部、補充部件、神經與感覺器官模型、關節組織、頸部血管、血管樹、心臟、示意模型、特殊區域、眼與內耳微圖譜的名稱表、腦資訊卡。執行階段才從外部載入的模型（例如眼眶的網路模型）與 build 時才下載的模型（例如腦模型）不在索引內，所以相關項目可能被低估。

規則：
1. 出現不在 `known-gaps.json` 的 MISSING（新缺口）會失敗。
2. `known-gaps.json` 裡的結構已經有了，也會失敗（要用 `--write` 移除，讓缺口只減不增）。
3. 補上新模型後，跑 `--write`，再提交更新後的 `known-gaps.json`。

## 別名

`aliases.json` 的 `kind`：
- `synonym`：同一結構的另一個名稱。這類名稱同時加進 `docs/paokao-aliases.json`（搜尋與 Quiz 輸入答案都會用到）。
- `member`：清單用的是總稱（例如肋骨、犬齒），網站是逐一繪製各成員。只算作「已有」，**不會**加成可接受的答案。

不確定的別名不要加；先在 PR 說明列給使用者決定。顯示名稱不因別名而改動。
