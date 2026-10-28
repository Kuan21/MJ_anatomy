# PR B：肺葉、漿膜、女性生殖器官的模型來源審核

## 肺葉
- BodyParts3D 4.0 匯出的 99 個肺部網格沒有肺葉；舊版 3.0 的 STL 保留五個肺葉（FMA7333 右肺上葉、FMA7383 右肺中葉、FMA7337 右肺下葉、FMA7370 左肺上葉、FMA7371 左肺下葉）。
- 已加入 `scripts/supplement-parts.json`，以 sha256 鎖定來源，授權 CC BY-SA 2.1 Japan（與其他 3.0 補充件相同）。
- 不需要使用 HRA 肺部模型（NIH 3D 3DPX-021008, CC BY 4.0）。

## 漿膜（胸膜、心包）
- BodyParts3D 4.0、Z-Anatomy 匯出皆沒有分層的胸膜與心包網格（Z-Anatomy 只有一塊未拆分的 “Pleura”）。
- 因此由器官表面外擴生成，全部標為「示意模型」（`schematic: true`），預設不顯示，可逐層開關：
  - 臟層胸膜：肺葉表面外擴 0.5 mm；壁層胸膜：外擴 5 mm。
  - 漿膜心包臟層（心外膜）：心壁外擴 0.6 mm；壁層：4.5 mm；纖維心包：7.5 mm。
- 腳本：`scripts/prepare-serous.mjs`；每片不超過 9,000 個三角形。

## 女性生殖系統
| 候選 | 授權 | 大小 | 結果 |
| --- | --- | --- | --- |
| Human Reference Atlas 3D Reference Organ Set, united-female v1.5（Browne & Schlehlein, 2023） | CC BY 4.0 | 原始 GLB 約 212 MB（888 個網格） | 採用；只抽出 33 個骨盆結構，提交的子集壓縮後約 1.06 MB |
| Z-Anatomy | CC BY-SA 4.0 | — | 沒有可用的女性器官網格，不採用 |

採用的結構：陰道、子宮頸陰道交界、子宮體／底／下段／頸、輸卵管（漏斗、繖、壺腹、峽部，左右）、卵巢及其韌帶（卵巢韌帶、卵巢懸韌帶、卵巢繫膜）、子宮圓韌帶、子宮薦韌帶、子宮主韌帶、子宮闊韌帶、子宮動脈與靜脈（左右）。

放置：HRA 座標以 0.9 倍縮放後對齊 BodyParts3D 骨盆（子宮位於直腸之前、膀胱之後上方；測試 `scripts/test-organs-b.mjs` 檢查此關係與左右側）。

限制：肌肉、韌帶與會陰仍為男性模型；骨盆骨骼在選「女」時改用 HRA 女性骨盆（見 `docs/female-pelvis.md`）。
