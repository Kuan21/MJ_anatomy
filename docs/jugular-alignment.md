# 頸內靜脈（IJV）對齊：頸動脈鞘內排列

內部技術文件，不發布到網站。

## 問題

頸動脈鞘內，頸總動脈（CCA）在內側，頸內靜脈在外側（下頸部稍偏前），迷走神經在兩者之間的後方，三者緊貼，管壁間隙只有幾 mm（依公開資料 Gray's Anatomy 1918 年版與 OpenStax Anatomy and Physiology 核對位置，請使用者核對）。

來源血管資料中，IJV 中心線在 CCA 前外側偏移過大：左側 1.42 至 1.46 m 偏外 7 至 10 mm、偏前 13 至 16 mm，管壁間隙 6.4 至 9.1 mm；右側偏外 9 至 12 mm、偏前 6 至 9 mm，管壁間隙 3.0 至 4.3 mm。迷走神經位移表（`scripts/lib/nerve-corrections.mjs`，維持不變）把迷走神經放在 CCA 後方，所以迷走神經離 IJV 管壁左 11 至 17 mm、右 8.6 至 13.7 mm。

## 做法

不改生成檔 `public/models/neck-vessels.json.gz`。和頸動脈端點對齊（`carotid-junction.ts`）同一個做法，載入時由 `app/biomechanics-v2/jugular-align.ts` 的 `alignJugulars` 依高度平移 IJV 頂點（只在水平面移動，高度、管徑、環形狀都不變）。位移表由 `node scripts/derive-jugular-shift.mjs derive` 從網格量測推導，`report` 輸出下方的逐公分表，`groove` 輸出迷走神經若要再貼近兩管壁還需要的位移（只供評估，沒有套用）。

推導規則（每 5 mm 取一個高度，環帶 ±2 mm 的頂點平均為中心、到中心的平均距離為半徑）：

1. 參考動脈：CCA 存在時（1.488 m 以下）用 CCA 中心；以上用內頸動脈（ICA）中心。
2. 目標：IJV 中心與參考動脈中心相距「兩管半徑加 1.5 mm」，使管壁間隙約 1.5 mm（接近相貼）。
3. 方向：在外側偏後 10 度（使用者決定 (c)：迷走神經位於 CCA 與 IJV 後壁之間或附近；角度由 `IJV_ANGLE` 環境變數指定，預設 -10；另一案 -20 在分支 `mj-ijv-align-b20`）；再加上迷走神經間隙：IJV 中心若離迷走神經太近，就沿遠離迷走神經的方向推到管壁間隙 0.6 mm（`VAGUS_GAP`），使迷走神經不穿入 IJV 壁。1.51 m 以上，方向逐漸轉到外後側（到 1.55 m 為外後 50 度），因為外頸動脈（ECA）在此往外側分開，IJV 要從後方通過去往頸靜脈孔；同時把 IJV 從 ICA 與 ECA 推開到至少 1.5 mm 管壁間隙（來源資料中 IJV 在 1.50 至 1.55 m 原本穿入 ECA 最多 2.1 mm、穿入 ICA 最多 2.7 mm，已一併解除）。
4. 端點固定：下端（匯合處，1.416 m）以 24 mm 的平滑過渡淡入；上端（頸靜脈孔，1.586 m）從 1.52 m 起以 55 mm 的平滑過渡淡出到 1.575 m，兩端頂點位移為 0（`test-jugular-align.mjs` 檢查）。
5. 1.49 m 以下的目標用三點平滑（量測環帶有雜訊）；以上不平滑，以保留對分支的間隙。

位移表（高度 mm: 外側 mm, 前方 mm；右側外側方向鏡像）：

- 左：`1416:(0,0) 1421:(0.4,-2.3) 1426:(0.9,-5.9) 1431:(1.2,-10.4) 1436:(0.7,-14.3) 1441:(-0.1,-16.5) 1446:(-0.3,-17.6) 1451:(0.9,-17.6) 1456:(2.9,-16.6) 1461:(4,-15.7) 1466:(5,-14.6) 1471:(6.7,-12.9) 1476:(8.8,-11.6) 1481:(11.2,-10.6) 1486:(12.7,-9.9) 1491:(13.1,-9.2) 1496:(15.1,-8.7) 1501:(15.2,-8.4) 1506:(14.8,-9.6) 1511:(15.4,-9.5) 1516:(14,-8.6) 1521:(12.4,-7.3) 1526:(10.8,-6.9) 1531:(9.1,-5.6) 1536:(7.7,-4.5) 1541:(6,-3.8) 1546:(3.6,-3.1) 1551:(1.9,-2) 1556:(-0.2,0) 1561:(-0.5,0.1) 1566:(-0.4,0.1) 1571:(-0.1,0) 1576:(0,0)`
- 右：`1416:(0,0) 1421:(0.1,-1.2) 1426:(0.4,-3.2) 1431:(0.5,-5.8) 1436:(0.4,-8) 1441:(0,-9.1) 1446:(-0.4,-9.5) 1451:(0.1,-9.9) 1456:(1.9,-10.2) 1461:(4,-10.6) 1466:(5.9,-11.1) 1471:(8.3,-11.3) 1476:(10.5,-11.4) 1481:(12.2,-11.2) 1486:(13.2,-11) 1491:(13.5,-10.6) 1496:(14.7,-11) 1501:(13.8,-10.3) 1506:(14.2,-10.9) 1511:(14.7,-10.6) 1516:(14,-8.8) 1521:(12.4,-7.5) 1526:(10.7,-6.9) 1531:(9.1,-5.6) 1536:(7.6,-4.4) 1541:(6,-3.9) 1546:(3.6,-3.1) 1551:(1.9,-2.1) 1556:(-0.1,-0.1) 1561:(-0.5,0.1) 1566:(-0.4,0.1) 1571:(-0.1,0) 1576:(0,0)`

## 逐公分量測：調整前 → 調整後（在 main 的新頸動脈分叉之上重新推導）

座標：外 = 遠離中線；前 = 向前。迷走神經維持 #289 的位移表。「迷走神經中心到管壁」是迷走神經中心到該血管最近頂點的距離（含迷走神經約 0.5 mm 半徑）。1.49 m 時 CCA 只剩末端斷面，間隙不具參考意義；1.42 m 受下端固定限制。

### 左側

| 高度 (m) | 管徑 CCA／IJV (mm) | 迷走神經相對 CCA（外,前 mm，不變） | 迷走神經相對 IJV 中心（外,前 mm） | CCA 相對 IJV 中心（外,前,距 mm） | 迷走神經中心到 CCA 管壁／IJV 管壁 (mm) | CCA–IJV 管壁間隙 (mm) |
| --- | --- | --- | --- | --- | --- | --- |
| 1.42 | 3.9／4.9 | 4.2,-7.8 | -3.0,-21.1 → -3.4,-19.3 | -7.2,-13.4,15.2 → -7.5,-11.5,13.7 | 4.5／16.5 → 4.5／12.5 | 6.3 → 4.9 |
| 1.43 | 4.0／4.6 | 4.4,-8.3 | -2.9,-21.6 → -4.0,-12.2 | -7.3,-13.3,15.2 → -8.5,-3.9,9.3 | 5.1／17.3 → 5.1／6.9 | 6.8 → 0.8 |
| 1.44 | 4.0／4.2 | 5.2,-6.3 | -3.7,-21.1 → -3.7,-5.0 | -8.9,-14.9,17.3 → -8.9,1.2,9.0 | 4.0／17.2 → 4.0／2.2 | 9.1 → 0.8 |
| 1.45 | 4.0／4.0 | 1.9,-5.6 | -8.1,-21.3 → -8.8,-3.7 | -10.0,-15.8,18.7 → -10.7,1.8,10.9 | 2.0／18.6 → 2.0／5.5 | 10.7 → 2.9 |
| 1.46 | 4.2／4.1 | 3.8,-6.0 | -3.2,-20.5 → -7.0,-4.7 | -7.0,-14.6,16.2 → -10.8,1.3,10.9 | 3.3／15.6 → 3.3／4.9 | 7.9 → 2.6 |
| 1.47 | 3.6／4.0 | 0.2,-5.0 | -1.5,-17.8 → -7.9,-4.6 | -1.7,-12.8,12.9 → -8.0,0.4,8.0 | 1.7／12.1 → 1.7／4.8 | 5.2 → 0.4 |
| 1.48 | 3.8／4.0 | -0.9,-7.4 | 0.9,-16.8 → -9.9,-6.1 | 1.8,-9.4,9.5 → -9.0,1.4,9.1 | 3.7／12.2 → 3.7／6.8 | 1.8 → 1.4 |
| 1.49 | 4.2／3.8 | -3.9,-7.9 | 1.1,-15.8 → -12.0,-6.4 | 5.0,-7.9,9.3 → -8.0,1.4,8.2 | 4.8／11.8 → 4.8／9.8 | 1.3 → 0.2 |

### 右側

| 高度 (m) | 管徑 CCA／IJV (mm) | 迷走神經相對 CCA（外,前 mm，不變） | 迷走神經相對 IJV 中心（外,前 mm） | CCA 相對 IJV 中心（外,前,距 mm） | 迷走神經中心到 CCA 管壁／IJV 管壁 (mm) | CCA–IJV 管壁間隙 (mm) |
| --- | --- | --- | --- | --- | --- | --- |
| 1.42 | 5.4／5.6 | 3.7,-13.3 | -8.6,-20.1 → -8.7,-19.1 | -12.3,-6.8,14.0 → -12.4,-5.8,13.7 | 8.9／14.3 → 8.9／13.9 | 3.0 → 2.6 |
| 1.43 | 4.8／5.0 | 1.0,-11.7 | -9.1,-17.6 → -9.6,-12.5 | -10.2,-6.0,11.8 → -10.7,-0.8,10.7 | 6.8／14.6 → 6.8／9.8 | 2.1 → 0.9 |
| 1.44 | 4.3／4.5 | -0.3,-7.5 | -10.1,-14.8 → -10.2,-5.9 | -9.8,-7.3,12.2 → -9.8,1.6,10.0 | 2.9／13.4 → 2.9／7.3 | 3.4 → 1.2 |
| 1.45 | 3.9／4.2 | -1.7,-5.9 | -10.4,-14.9 → -10.5,-5.0 | -8.8,-9.0,12.6 → -8.8,0.8,8.9 | 2.4／14.6 → 2.4／8.1 | 4.5 → 0.7 |
| 1.46 | 3.8／4.0 | 2.5,-4.8 | -3.1,-14.6 → -6.8,-4.1 | -5.6,-9.9,11.3 → -9.2,0.7,9.3 | 2.6／10.7 → 2.6／4.5 | 3.6 → 1.5 |
| 1.47 | 3.2／4.2 | -1.2,-3.6 | -1.0,-14.0 → -8.9,-2.8 | 0.1,-10.5,10.5 → -7.7,0.8,7.8 | 1.5／9.2 → 1.5／5.2 | 3.1 → 0.4 |
| 1.48 | 4.4／4.0 | -1.2,-6.9 | 1.2,-14.8 → -10.6,-3.6 | 2.3,-7.9,8.2 → -9.5,3.3,10.1 | 3.5／11.4 → 3.5／7.5 | -0.1 → 1.7 |
| 1.49 | 4.1／3.8 | -3.6,-6.4 | 0.8,-15.0 → -12.7,-4.3 | 4.3,-8.6,9.6 → -9.1,2.1,9.3 | 3.5／11.5 → 3.5／9.2 | 1.7 → 1.4 |

## 迷走神經是否穿入血管壁（`node scripts/derive-jugular-shift.mjs vagus`，逐頂點）

L before vagus vs IJV: 6470 vertices in the vessel height range, 5 inside, smallest margin -0.08 mm at 1.533 m; per cm (smallest margin, mm): 1.41:16.1 1.42:16.3 1.43:16.9 1.44:17.3 1.45:17.1 1.46:13.1 1.47:12.2 1.48:11.4 1.49:10.4 1.5:8.9 1.51:7.5 1.52:3.8 1.53:-0.1 1.54:1.7 1.55:1.9 1.56:3.8 1.57:7.8

L before vagus vs CCA: 1939 vertices in the vessel height range, 15 inside, smallest margin -0.95 mm at 1.388 m; per cm (smallest margin, mm): 1.38:-1.0 1.39:0.7 1.4:5.0 1.41:4.6 1.42:4.8 1.43:4.4 1.44:1.7 1.45:0.8 1.46:1.7 1.47:1.8 1.48:3.6 1.49:4.2 1.5:4.2

L before vagus vs ICA: 4697 vertices in the vessel height range, 0 inside, smallest margin 2.67 mm at 1.534 m; per cm (smallest margin, mm): 1.5:3.0 1.51:2.8 1.52:3.2 1.53:2.7 1.54:4.7 1.55:4.9 1.56:5.8 1.57:6.7

L before vagus vs ECA: 3278 vertices in the vessel height range, 0 inside, smallest margin 7.47 mm at 1.502 m; per cm (smallest margin, mm): 1.5:7.5 1.51:8.7 1.52:10.0 1.53:9.0 1.54:9.6 1.55:10.9 1.56:13.6 1.57:17.7

R before vagus vs IJV: 6470 vertices in the vessel height range, 2 inside, smallest margin -0.02 mm at 1.532 m; per cm (smallest margin, mm): 1.41:15.8 1.42:14.6 1.43:13.3 1.44:13.4 1.45:11.5 1.46:9.7 1.47:10.2 1.48:11.1 1.49:10.5 1.5:9.1 1.51:7.5 1.52:3.8 1.53:-0.0 1.54:1.8 1.55:2.0 1.56:3.9 1.57:8.0

R before vagus vs CCA: 1812 vertices in the vessel height range, 0 inside, smallest margin 0.59 mm at 1.456 m; per cm (smallest margin, mm): 1.41:8.7 1.42:6.6 1.43:3.1 1.44:2.1 1.45:0.6 1.46:1.0 1.47:1.4 1.48:3.0 1.49:2.0 1.5:2.0

R before vagus vs ICA: 4694 vertices in the vessel height range, 0 inside, smallest margin 2.00 mm at 1.511 m; per cm (smallest margin, mm): 1.5:2.1 1.51:2.0 1.52:3.2 1.53:2.7 1.54:4.8 1.55:5.0 1.56:5.8 1.57:6.8

R before vagus vs ECA: 3315 vertices in the vessel height range, 0 inside, smallest margin 5.24 mm at 1.502 m; per cm (smallest margin, mm): 1.5:5.2 1.51:7.4 1.52:9.8 1.53:9.1 1.54:9.7 1.55:11.0 1.56:13.7 1.57:17.9

L after vagus vs IJV: 6470 vertices in the vessel height range, 0 inside, smallest margin 0.69 mm at 1.549 m; per cm (smallest margin, mm): 1.41:14.4 1.42:8.3 1.43:2.3 1.44:2.2 1.45:2.5 1.46:2.1 1.47:4.3 1.48:7.1 1.49:9.7 1.5:9.4 1.51:7.2 1.52:5.2 1.53:3.0 1.54:0.7 1.55:1.0 1.56:3.6 1.57:7.7

L after vagus vs CCA: 1939 vertices in the vessel height range, 15 inside, smallest margin -0.95 mm at 1.388 m; per cm (smallest margin, mm): 1.38:-1.0 1.39:0.7 1.4:5.0 1.41:4.6 1.42:4.8 1.43:4.4 1.44:1.7 1.45:0.8 1.46:1.7 1.47:1.8 1.48:3.6 1.49:4.2 1.5:4.2

L after vagus vs ICA: 4697 vertices in the vessel height range, 0 inside, smallest margin 2.67 mm at 1.534 m; per cm (smallest margin, mm): 1.5:3.0 1.51:2.8 1.52:3.2 1.53:2.7 1.54:4.7 1.55:4.9 1.56:5.8 1.57:6.7

L after vagus vs ECA: 3278 vertices in the vessel height range, 0 inside, smallest margin 7.47 mm at 1.502 m; per cm (smallest margin, mm): 1.5:7.5 1.51:8.7 1.52:10.0 1.53:9.0 1.54:9.6 1.55:10.9 1.56:13.6 1.57:17.7

R after vagus vs IJV: 6470 vertices in the vessel height range, 0 inside, smallest margin 0.75 mm at 1.549 m; per cm (smallest margin, mm): 1.41:15.0 1.42:10.5 1.43:7.3 1.44:7.2 1.45:2.3 1.46:2.1 1.47:5.2 1.48:7.4 1.49:8.9 1.5:8.5 1.51:7.2 1.52:5.2 1.53:3.0 1.54:0.7 1.55:1.0 1.56:3.7 1.57:7.9

R after vagus vs CCA: 1812 vertices in the vessel height range, 0 inside, smallest margin 0.59 mm at 1.456 m; per cm (smallest margin, mm): 1.41:8.7 1.42:6.6 1.43:3.1 1.44:2.1 1.45:0.6 1.46:1.0 1.47:1.4 1.48:3.0 1.49:2.0 1.5:2.0

R after vagus vs ICA: 4694 vertices in the vessel height range, 0 inside, smallest margin 2.00 mm at 1.511 m; per cm (smallest margin, mm): 1.5:2.1 1.51:2.0 1.52:3.2 1.53:2.7 1.54:4.8 1.55:5.0 1.56:5.8 1.57:6.8

R after vagus vs ECA: 3315 vertices in the vessel height range, 0 inside, smallest margin 5.24 mm at 1.502 m; per cm (smallest margin, mm): 1.5:5.2 1.51:7.4 1.52:9.8 1.53:9.1 1.54:9.7 1.55:11.0 1.56:13.7 1.57:17.9


調整前迷走神經有少數頂點（左 5、右 2，最深 0.08 mm）已輕微穿入 IJV 壁；調整後為 0。左 CCA 在 1.388 m（IJV 範圍之下，本 PR 未改動）有 15 個迷走神經頂點穿入 CCA 最深 0.95 mm，是 #289 之後既有的狀況，不在本 PR 範圍，列為待辦。逐環以環中心與最小頂點距離近似管壁，非精確網格相交。

## 核對報告 HN-21：分叉以上頸內靜脈與頸內動脈的內外關係（`node scripts/derive-jugular-shift.mjs inout`）

HN-21 症狀：分叉以上（約 1.49–1.55 m）頸內靜脈跑到頸內動脈內側並偏前，應在外側。下表是 IJV 中心減動脈中心（mm；外 = 遠離中線，正值代表 IJV 在外側／前方），每 5 mm 一列，修改前（main）與修改後。依 Gray's Anatomy 1918 與 OpenStax 核對位置，請使用者核對；未在 3D 畫面確認。

```
L before (IJV centre minus artery centre, mm; + = IJV lateral / anterior)
  1.490: vs ICA - | vs ECA - | vs CCA -5.0 out, 7.9 fwd
  1.495: vs ICA - | vs ECA - | vs CCA -6.5 out, 7.8 fwd
  1.500: vs ICA -7.2 out, 8.0 fwd | vs ECA -6.8 out, 5.6 fwd | vs CCA -5.8 out, 7.0 fwd
  1.505: vs ICA -6.9 out, 7.4 fwd | vs ECA -6.0 out, 3.1 fwd | vs CCA -
  1.510: vs ICA -7.5 out, 8.0 fwd | vs ECA -5.6 out, 0.3 fwd | vs CCA -
  1.515: vs ICA -6.8 out, 7.3 fwd | vs ECA -5.0 out, -0.7 fwd | vs CCA -
  1.520: vs ICA -6.3 out, 5.2 fwd | vs ECA -5.6 out, -2.1 fwd | vs CCA -
  1.525: vs ICA -4.8 out, 4.3 fwd | vs ECA -6.7 out, -2.9 fwd | vs CCA -
  1.530: vs ICA -3.6 out, 2.7 fwd | vs ECA -7.8 out, -2.9 fwd | vs CCA -
  1.535: vs ICA -3.0 out, 0.6 fwd | vs ECA -8.6 out, -2.2 fwd | vs CCA -
  1.540: vs ICA -2.1 out, -0.5 fwd | vs ECA -9.6 out, -2.1 fwd | vs CCA -
  1.545: vs ICA -0.5 out, -1.8 fwd | vs ECA -9.8 out, -3.0 fwd | vs CCA -
  1.550: vs ICA 1.3 out, -2.6 fwd | vs ECA -10.0 out, -3.6 fwd | vs CCA -
  1.555: vs ICA 3.6 out, -4.0 fwd | vs ECA -9.6 out, -5.3 fwd | vs CCA -
  1.560: vs ICA 6.2 out, -4.9 fwd | vs ECA -8.0 out, -6.9 fwd | vs CCA -
R before (IJV centre minus artery centre, mm; + = IJV lateral / anterior)
  1.490: vs ICA - | vs ECA - | vs CCA -4.3 out, 8.6 fwd
  1.495: vs ICA - | vs ECA - | vs CCA -4.8 out, 9.0 fwd
  1.500: vs ICA -6.3 out, 9.7 fwd | vs ECA -5.4 out, 7.5 fwd | vs CCA -4.6 out, 8.5 fwd
  1.505: vs ICA -6.1 out, 9.0 fwd | vs ECA -4.7 out, 5.4 fwd | vs CCA -
  1.510: vs ICA -6.8 out, 8.9 fwd | vs ECA -4.6 out, 1.5 fwd | vs CCA -
  1.515: vs ICA -6.9 out, 7.9 fwd | vs ECA -4.5 out, 0.1 fwd | vs CCA -
  1.520: vs ICA -6.3 out, 5.5 fwd | vs ECA -5.4 out, -1.9 fwd | vs CCA -
  1.525: vs ICA -4.8 out, 4.2 fwd | vs ECA -6.7 out, -2.9 fwd | vs CCA -
  1.530: vs ICA -3.7 out, 2.7 fwd | vs ECA -8.0 out, -2.9 fwd | vs CCA -
  1.535: vs ICA -3.0 out, 0.7 fwd | vs ECA -8.8 out, -2.3 fwd | vs CCA -
  1.540: vs ICA -2.1 out, -0.5 fwd | vs ECA -9.5 out, -2.3 fwd | vs CCA -
  1.545: vs ICA -0.5 out, -1.8 fwd | vs ECA -9.8 out, -3.0 fwd | vs CCA -
  1.550: vs ICA 1.2 out, -2.7 fwd | vs ECA -10.0 out, -3.6 fwd | vs CCA -
  1.555: vs ICA 3.6 out, -4.0 fwd | vs ECA -9.6 out, -5.4 fwd | vs CCA -
  1.560: vs ICA 6.1 out, -5.0 fwd | vs ECA -8.1 out, -7.0 fwd | vs CCA -
L after (IJV centre minus artery centre, mm; + = IJV lateral / anterior)
  1.490: vs ICA - | vs ECA - | vs CCA 8.0 out, -1.4 fwd
  1.495: vs ICA - | vs ECA - | vs CCA 8.3 out, -1.0 fwd
  1.500: vs ICA 8.0 out, -0.5 fwd | vs ECA 8.4 out, -2.9 fwd | vs CCA 9.4 out, -1.5 fwd
  1.505: vs ICA 8.0 out, -1.9 fwd | vs ECA 8.9 out, -6.3 fwd | vs CCA -
  1.510: vs ICA 7.7 out, -1.5 fwd | vs ECA 9.7 out, -9.3 fwd | vs CCA -
  1.515: vs ICA 7.5 out, -1.4 fwd | vs ECA 9.2 out, -9.4 fwd | vs CCA -
  1.520: vs ICA 6.3 out, -2.3 fwd | vs ECA 7.1 out, -9.6 fwd | vs CCA -
  1.525: vs ICA 6.3 out, -2.7 fwd | vs ECA 4.4 out, -9.9 fwd | vs CCA -
  1.530: vs ICA 5.8 out, -3.2 fwd | vs ECA 1.6 out, -8.7 fwd | vs CCA -
  1.535: vs ICA 5.0 out, -4.1 fwd | vs ECA -0.7 out, -6.9 fwd | vs CCA -
  1.540: vs ICA 4.3 out, -4.5 fwd | vs ECA -3.2 out, -6.1 fwd | vs CCA -
  1.545: vs ICA 3.5 out, -5.0 fwd | vs ECA -5.8 out, -6.2 fwd | vs CCA -
  1.550: vs ICA 3.5 out, -4.9 fwd | vs ECA -7.8 out, -5.8 fwd | vs CCA -
  1.555: vs ICA 3.7 out, -4.3 fwd | vs ECA -9.4 out, -5.7 fwd | vs CCA -
  1.560: vs ICA 5.7 out, -4.9 fwd | vs ECA -8.5 out, -6.8 fwd | vs CCA -
R after (IJV centre minus artery centre, mm; + = IJV lateral / anterior)
  1.490: vs ICA - | vs ECA - | vs CCA 9.1 out, -2.1 fwd
  1.495: vs ICA - | vs ECA - | vs CCA 9.7 out, -2.0 fwd
  1.500: vs ICA 7.7 out, -0.8 fwd | vs ECA 8.7 out, -3.0 fwd | vs CCA 9.4 out, -2.0 fwd
  1.505: vs ICA 8.0 out, -1.8 fwd | vs ECA 9.4 out, -5.4 fwd | vs CCA -
  1.510: vs ICA 7.8 out, -1.7 fwd | vs ECA 10.0 out, -9.1 fwd | vs CCA -
  1.515: vs ICA 7.2 out, -1.2 fwd | vs ECA 9.6 out, -9.0 fwd | vs CCA -
  1.520: vs ICA 6.4 out, -2.2 fwd | vs ECA 7.3 out, -9.6 fwd | vs CCA -
  1.525: vs ICA 6.1 out, -2.8 fwd | vs ECA 4.3 out, -9.9 fwd | vs CCA -
  1.530: vs ICA 5.7 out, -3.2 fwd | vs ECA 1.4 out, -8.8 fwd | vs CCA -
  1.535: vs ICA 4.9 out, -3.9 fwd | vs ECA -0.9 out, -6.9 fwd | vs CCA -
  1.540: vs ICA 4.2 out, -4.5 fwd | vs ECA -3.2 out, -6.3 fwd | vs CCA -
  1.545: vs ICA 3.5 out, -5.0 fwd | vs ECA -5.8 out, -6.2 fwd | vs CCA -
  1.550: vs ICA 3.5 out, -5.0 fwd | vs ECA -7.8 out, -5.9 fwd | vs CCA -
  1.555: vs ICA 3.8 out, -4.4 fwd | vs ECA -9.3 out, -5.9 fwd | vs CCA -
  1.560: vs ICA 5.7 out, -4.9 fwd | vs ECA -8.5 out, -6.9 fwd | vs CCA -
```

結論（數值）：修改前左右 IJV 在 1.50–1.545 m 相對 ICA 都是內側 0.5–7.5 mm、前方約 8 mm；修改後 1.50–1.56 m 皆在 ICA 外側 3.5–8.0 mm、後方 0.5–5 mm。對 ECA：1.50–1.53 m 在外側；1.535 m 起 ECA 往外側分開，IJV 從其後方通過（內側 0.7–9.8 mm、後方 6–7 mm），符合 IJV 從 ECA 後方走向頸靜脈孔的設計。

## 骨頭間距（`node scripts/derive-jugular-shift.mjs bones`）

IJV 頂點到頸椎、鎖骨、甲狀軟骨、舌骨、下顎骨、顳骨表面的最近距離（每 2 cm 取最小）。1.40 至 1.52 m 調整後離骨面 7 mm 以上，沒有接近骨面；1.54 m 以上靠近顳骨（頸靜脈孔，端點固定），調整前後相同量級。完整輸出見 PR 說明。

## 限制

- 預設案為外側偏後 10 度（與 CCA 管壁間隙測試上限維持 3.5 mm，不放寬）。另一案外側偏後 20 度在分支 `mj-ijv-align-b20`：迷走神經離 IJV 壁更近（1.43–1.46 m 最小餘裕 0.9–1.5 mm，預設案 2.1–2.5 mm），但左 1.455 m 與 CCA 間隙 3.9 mm，測試上限需放寬為 4.0 mm。兩案都比一般描述（IJV 在 CCA 外側偏前）更偏後，請使用者決定。
- 模型為示意性的來源網格校正，不是個人解剖測量；依 Gray's Anatomy 1918 年版與 OpenStax 核對位置，請使用者核對。
