# 補充模型：候選來源（等你確認授權先加入）

**未有任何外部模型被加入呢個 PR。** 以下係查到嘅候選，逐個列出授權、大小、同現有模型對位情況。授權唔清楚嘅一律唔用。

## 候選 A：Z-Anatomy 匯出嘅 glb（nqwrc/3d-anatomy，專案已經用咗佢嘅 joints.glb 同頸血管）

| 項目 | 內容 |
|---|---|
| 來源 | <https://github.com/nqwrc/3d-anatomy>（Z-Anatomy 嘅 Blender 檔匯出成 7 個 Draco glb，2,827 個結構） |
| 授權（幾何） | BodyParts3D **CC BY-SA 2.1 Japan**＋Z-Anatomy **CC BY-SA 4.0**（`public/models/License.txt` 原文）。要求：保留署名、衍生作品用同一授權（相容，本專案已經以此方式用咗 joints.glb） |
| ⚠ 唔可以用嘅部分 | 同一包入面混有 **Kidney（lissiecowley, CC BY-NC 4.0）**、**Anatomy of the Inner Ear（Dundee, CC BY-NC-SA 4.0）**、**Brainder／White matter（授權未註明）**。若採用必須逐件排除；該 repo 整體標示為 CC BY-NC-SA，**唔可以成包搬入** |
| 大小（Draco 壓縮後） | muscular 4.5 MB、cardiovascular 5.6 MB、visceral 1.8 MB、nervous 3.8 MB、skeletal 1.9 MB、lymphatic 0.4 MB、joints 0.9 MB |
| 同現有模型對位 | 同源（BodyParts3D 座標系，專案已用 joints.glb、頸血管、腦 glb 同一系列，並已有註冊程序），預期可直接對齊；需要用重疊嘅骨件做一次驗證 |
| 補到咩 | 闊背肌、腹直肌、腹內／外斜肌、腹橫肌、腰方肌、多裂肌、顳肌、豎脊肌各段、心臟四個腔室、房室瓣／肺動脈瓣瓣葉、乳頭肌、冠狀竇…（用 `node scripts/audit-coverage.mjs --candidate=…` 試算：呢包可以補返課程「模型冇」清單中 141 個詞：肌肉 42、心血管 106、神經 11、淋巴 12、內臟 23、骨 2，部分詞有重疊） |
| 做唔到 | **腱索、界嵴、梳狀肌、卵圓窩、肉柱、節制索、傳導系統（SA／AV node、His 束、束支）**喺呢包入面搵唔到（只得乳頭肌同瓣葉） |

建議：只抽取 muscular／cardiovascular／skeletal／lymphatic 入面課程需要嘅件，排除所有 NC 或授權不明件；加入前出示逐件清單俾你確認。

## 候選 B：心臟內部細節（腱索、傳導系統、界嵴等）

| 來源 | 狀況 |
|---|---|
| Frontiers in Medicine 2025（Chen 等）心臟傳導系統三維可視化 | 文章係 CC BY，但**未能確認 3D 檔案可下載**及授權（要睇 data availability），**未驗證，唔用** |
| NIH 3D Print Exchange | 授權逐件標示（CC 或公有領域），可下載 STL；**未能喺本環境連線核對任何一件**有冇腱索／界嵴／傳導系統，**未驗證** |
| CGTrader、Sketchfab 等商店 | 授權為商用／不可再散佈，**唔用** |
| BodyParts3D 其他版本、Open Anatomy Project | 本環境網絡白名單連唔到 dbarchive.biosciencedbc.jp、anatomytool.org、sketchfab.com，**未能查證** |

結論：到目前為止**搵唔到一個授權明確、而且包含你要求嘅右心房／右心室內部全部細節同傳導系統嘅開源模型**。需要你：(1) 指定想用嘅具體模型連結，或 (2) 容許我喺有網絡嘅環境繼續查（NIH 3D、Zenodo 等），或 (3) 接受只用候選 A 做到「腔室＋瓣葉＋乳頭肌」層級。

## 腦、肺

腦：現有 brain.glb（Brain Project／Z-Anatomy，437 個命名結構）已經有；肺：候選 A 嘅 visceral.glb 有五個肺葉、支氣管樹（含肺段支氣管）同胸膜，已經喺現有圖譜內亦有 104 件呼吸系統 mesh。未發現需要另外補充嘅獨立開源肺模型。

## 下一步（等你決定）

1. 你確認候選 A 可用（排除 NC／授權不明件）→ 我會做逐件清單、對位驗證、按需載入（每個器官包壓縮後 < 5 MB）同「器官詳細」模式。
2. 心臟內部細節：請你揀 B 之中嘅路線。
