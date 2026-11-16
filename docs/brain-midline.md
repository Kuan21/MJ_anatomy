# 腦中線結構（HN-03、HN-04、HN-05、HN-10）

核對報告 #352 的腦中線問題，修正方式與量測（模型座標：x 向身體左側為正，y 由 1600 mm 起向上，z 向前）。

## 做法

腦詳細模式與腦 Quiz 讀同一份 `public/models/brain.glb`（Brain Project，來源與雜湊不動）。載入時由 `app/organ/brain-midline.ts` 處理，兩邊共用：

| 構造 | 來源模型 | 載入後 |
|---|---|---|
| Optic chiasm 視交叉 | `.l`、`.r` 各一半（x −7.1～0、0～+7.1 mm） | 焊接成一個結構，無側別 |
| Pons 橋腦 | `.l`、`.r`（x ±20.5 mm） | 同上 |
| Midbrain 中腦 | `.l`、`.r`（x ±14.3 mm） | 同上 |
| Tentorium cerebelli 小腦幕 | `.l`、`.r`（x ±60.3 mm） | 同上 |
| Anterior spinal artery 脊髓前動脈 | `.l`、`.r` | 同上（腦詳細模式本來就不顯示脊髓構造，見 `NOT_BRAIN`） |
| Medulla oblongata 延腦 | 只有 `.l`（x 0～+13.0 mm） | 左半加上對 x = 0 的鏡像右半，焊接成一個結構。**右半是依左右對稱補建（示意），不是來源網格** |
| Body of fornix 穹窿體 | 沒有獨立網格 | 取兩側穹窿網格中位於中線的三角形（\|x\| ≤ 7 mm、y ≥ 1630 mm、z −14～+9.5 mm），獨立成一個結構；穹窿其餘部分（腳與柱）仍是 Left／Right Fornix |

- 不移動任何頂點；穹窿體與左右穹窿的三角形互不重複，也沒有遺失（兩側各 2158 個，合計 4316 個）。
- 焊接後中線平面（x = 0）上沒有開放邊（`scripts/test-brain-midline.mjs`）。
- 穹窿體的界線（前後與上下的切點）是讀網格形狀選的，請使用者核對。
