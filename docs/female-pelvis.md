# 女性骨盆（選「女」時）

## 做了什麼
- 選 Organs → Reproductive → 性別「女」時，骨盆骨骼改用 Human Reference Atlas（HuBMAP）女性骨盆：左右髖骨（髂骨、坐骨、恥骨的緻密骨）、薦骨、尾骨。男性的髖骨與薦骨在女性模式隱藏（`app/mj-sex.ts`）；選「男」時只顯示 BodyParts3D 的男性骨盆。
- 「骨盆骨骼仍為男性模型」提示已移除。
- 來源：Browne 與 Schlehlein, *3D Reference Organ Set for Female v1.5*（CC BY 4.0）。v1.10 沒有坐骨與恥骨，v1.5 的薦骨、尾骨、髂骨與 v1.10 的座標與頂點數相同，所以骨骼全部取自 v1.5（`scripts/extract-hra-pelvis-bones.mjs` → `scripts/data/hra-female-pelvis-bones.json.gz`，約 0.7 MB）。

## 怎麼對位
`scripts/fit-female-pelvis.mjs`：把 HRA 骨盆以相似變換（等比縮放＋旋轉＋位移）對到圖譜的髖骨與薦骨（ICP），並把兩側股骨頭中心當作權重很高的地標，讓圖譜的股骨仍然坐在髖臼裡。結果存在 `scripts/data/female-pelvis-registration.json`，`prepare-female.mjs` 以同一組變換放置骨盆與女性器官（子宮、卵巢…），所以器官一定在自己的骨盆內。

| 項目 | 數值 |
| --- | --- |
| 縮放 | 0.833 |
| 股骨頭中心誤差 | 左 1.6 mm、右 2.0 mm |
| 骨骼到圖譜骨盆的距離（中位數／第 90 百分位） | 6.7 mm／12.4 mm |

`npm run check` 內的 `fit-female-pelvis.mjs --check`：登記檔過期，或股骨頭誤差超過 3 mm，會失敗。`test-organs-b.mjs` 檢查：左右側正確、子宮／陰道／子宮頸位於兩側髖骨之間、薦骨在子宮後方、男性髖骨與薦骨在女性模式隱藏。

## 已知限制（請審核時注意）
- 肌肉、韌帶、關節軟骨、盂唇與會陰仍是男性圖譜：它們附著的是男性骨盆，女性骨盆與它相差中位數約 7 mm，局部可能略微穿入或露出。
- HRA 的女性比例與圖譜男性不同（HRA 髂骨較寬、圖譜股骨頭間距較窄），所以用等比縮放折衷：股骨頭對準優先，髂骨翼比男性圖譜略窄。
- 陰阜、大陰唇、乳房等示意結構是先前在男性身體上對位的，沒有重新對位。
- 圖譜沒有尾骨，所以男性模式沒有尾骨。

## 截圖
`docs/female-pelvis/`：`repro-front.png`／`repro-side.png`（只開生殖器官，含膀胱、直腸）、`skel-repro-front.png`／`skel-repro-side.png`（骨骼＋生殖器官）、`pelvis-side-zoom.png`／`pelvis-below.png`／`pelvis-back.png`（骨盆側面放大、下方、後方）、`male-vs-female-front.png`／`-side.png`（藍色半透明為男性圖譜骨盆）。這些是離線渲染器（`scripts/render-preview.mjs`）的多角度圖；App 內的完整場景在這個環境載入需十幾分鐘，沒有逐一在 App 內截圖，請你在本機看。
