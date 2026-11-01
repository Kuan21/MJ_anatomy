# Lower-limb vessel inventory (reconstruction step 0)
# 下肢血管盤點（重建第 0 步）

狀態：**需人工審核，未合併。** 本文件只盤點與提案，**不改模型、不做重建**。依據使用者 2026-11-01 總指引第 4 節（下肢血管重建）與第 6 節（位置關係核對清單）。放在 `docs/`，不部署。

量測腳本：`node scripts/inventory-leg-vessels.mjs --write`（約 70 秒，唯讀），原始數字在 `docs/lower-limb-vessel-inventory.json`。**所有數字都來自網格座標計算，沒有在 3D 畫面確認**（見第 1 節）。

## 0. Summary
## 0. 結論摘要

- 範圍內共 **196 個血管網格**（動脈 110、靜脈 86；圖譜網格 153、示意網格 43）。範圍包含髂總以下的骨盆與下肢血管、臀上下、陰部內、閉孔靜脈與腹壁血管。
- 對照使用者清單 a（動脈）共 43 項：**有 37、缺 6**；清單 b（靜脈）共 25 項：**有 21、缺 4**（含「有但形式不符」者，例如脛後靜脈只有單條）。
- 缺少的動脈：旋髂深動脈、閉孔動脈、膝關節動脈網、跗內側動脈、蹠背動脈、脛後動脈跟骨支（來源已隔離）。缺少的靜脈：旋髂淺靜脈、外陰淺靜脈、大隱靜脈的副隱與緣靜脈等屬支、足底內側靜脈；膝以下「兩條伴行靜脈夾著動脈」目前**沒有一處**符合。
- **重複**：穿動脈有三組來源互相重疊（示意 3 支、圖譜 4 小片、圖譜長條）；疑似同一條血管的兩個版本：「Set of dorsal digital arteries」FJ2093／FJ2197 與示意腓動脈（3.2）。
- 已知問題的量測證據：
  - 末端間隙超過半個管徑者：**74 個網格、133 處**（加連接件後；加連接件前為 127 個網格、523 處）。
  - 血管中心線進入骨網格累計 12 mm 以上者：**39 個網格**（另有 34 個輕微擦骨），其中示意網格 16 個；最嚴重為脛前動脈主幹（左 201 mm、右 219 mm 在脛骨內，最深 11.5／9.5 mm）與示意旋股內側動脈（最深 14.7 mm 在股骨內）。
  - 浮空：整條血管浮空的網格 0 個（既有 `audit-vessel-continuity` 也是 0）；但有 **2 個孤兒連接件**（FJ2091-END、FJ2195-END，位於髖外側）。
  - 臀大肌表面的靜脈碎段：只量到 3 個 3–6 頂點的小碎片（FJ3470 一個、FJ3471 兩個，在薦骨外緣），沒有量到大片段；使用者看到的位置請指給我（見第 11 節）。
  - 股深動脈資訊卡漏分支：確認；同類缺漏共 16 張卡（第 3.5 節）。
- 本文件提出：血管樹資料結構（第 5 節）、連續性與碰撞自動檢查設計（第 6 節）、資訊卡欄位（第 7 節）、分五批的計畫（第 8 節）。**開源資料我沒有下載、沒有使用**，只列出候選請你確認（第 9 節）。

## 1. Scope and method
## 1. 範圍與方法

**資料來源**：目前網站實際載入的血管網格，即圖譜（BodyParts3D 4.0，編號 `FJ####`）、示意網格（編號 `PK-##`、`PKC-###`，由專案腳本依標誌建立）與血管末端連接件（`...-END`，建置時加的連接與收尖件，見 `docs/vessel-ends.md`）。編號只是內部識別，不是圖譜編號，**不會顯示在網站上**。

**量測定義**（休息姿勢）：

| 量測 | 做法 |
| --- | --- |
| 中心線與長度 | 把網格焊接成表面圖，取兩個最遠端之間的最短路徑，路徑 8 mm 內的頂點每 3 mm 分一環，取各環中心連成折線；網格在兩環之間是直管，所以環間線性內插就是畫面上的形狀 |
| 半徑 | 各環頂點到環中心的平均距離（起／中／末三段平均） |
| 末端間隙 | 沿用既有分段工具（`scripts/lib/vessel-segments.mjs`）：每個開口端與「下一段」（它面對的末端，或它匯入的主幹）之間的距離；大於管徑一半者列為間隙。分「加連接件前」與「加連接件後（現在畫面）」兩種。注意它是啟發式：真正止於組織的小末端，若旁邊剛好有別的血管也會被算進去，不全是斷裂 |
| 穿骨 | 骨網格的內外判定（射線奇偶）：表面頂點在骨內的比例；中心線取樣點在骨內的累計長度與最深處。**骨網格很粗**（例如脛骨只有約 620 個三角形），2–3 mm 以內的深度屬於網格誤差範圍，所以判定「穿骨」用中心線累計 12 mm 以上；0–12 mm 稱「輕微擦骨」 |
| 鄰近結構 | 沿中心線每 6 mm 取最近的肌肉、神經、骨，統計最常出現者與中位距離 |
| 伴行距離 | 動脈中心線上各點到伴行靜脈中心線的最近距離（中位、90 百分位、最大） |
| 位置順序 | 在指定高度取各結構中心線的外側座標與前後座標 |

**限制（請務必讀）**：
1. **未在 3D 畫面確認。**本次沒有做 Playwright 截圖；所有「位置」「穿骨」「間隙」都是座標計算，沒有看過畫面，所以不宣稱任何位置正確。第一批重建的 PR 會補多角度截圖與極限關節角度截圖。
2. 圖譜的血管網格有些非常粗（股動脈每側約 110 個頂點、環距 22–32 mm），半徑與穿骨的數字在這類網格上只是約略值。
3. 參考核對只用 Gray's Anatomy 1918 版插圖與 OpenStax 的位置描述；最後的解剖核對由使用者進行，本文件不宣稱「已對照某某書確認」。

## 2. Inventory against the user's checklist
## 2. 對照使用者清單

標記：「有」＝模型有對應網格；「缺」＝沒有；「重複」＝同一結構有多個來源互相重疊。「來源」欄的「示意」為專案腳本依標誌建立的示意模型。側別 L／R 後面是網格編號。「長度」單位 mm（中心線，左／右）。

### 2.1 Arteries (list a)
### 2.1 動脈（清單 a）

| # | 結構（英文／中文） | 模型網格（側:編號） | 來源 | 長度 mm | 有／缺／重複 | 量測與已知問題 |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | Common iliac artery<br>髂總動脈 | L:FJ3464 R:FJ3565 | 圖譜 | L89／R81 | 有 | 未偵測到問題 |
| 2 | Internal iliac artery<br>髂內動脈 | L:FJ3468 R:FJ3569 | 圖譜 | L118／R106 | 有 | 末端間隙 3 處（最大 14 mm）；輕微擦骨（L 9 mm）；起端本身每側分成 5 片（含小碎片） |
| 3 | External iliac artery<br>髂外動脈 | L:FJ3466 R:FJ3567 | 圖譜 | L166／R156 | 有 | 末端間隙 4 處（最大 7 mm） |
| 4 | Femoral artery<br>股動脈 | L:FJ2074 R:FJ2143 L:PKC-320 | 圖譜＋示意 | L380／R381／L3 | 有 | 網格過疏（每環約 32 mm）；圖譜主幹每側只有約 110 個頂點、38 cm 長（環距 22–32 mm）；左側另有 3 mm 的示意小連接件 PKC-320 |
| 5 | Deep femoral artery<br>股深動脈 | R:PK-64 L:PK-91 | 示意 | R241／L252 | 有 | 全部為示意；長 24–25 cm |
| 6 | Medial circumflex femoral artery<br>旋股內側動脈 | R:PK-66 L:PK-93 | 示意 | R128／L133 | 有 | 末端間隙 2 處（最大 21 mm）；穿骨：R 54 mm／最深 14.7 mm（Right femur）；L 48 mm／最深 10 mm（Left femur）；示意 |
| 7 | Lateral circumflex femoral artery<br>旋股外側動脈 | L:FJ2078 R:FJ2158 R:PKC-321 L:PKC-322 | 圖譜＋示意 | L99／R100／R20／L24 | 有 | 穿骨：L 36 mm／最深 1.3 mm（Left femur）；R 33 mm／最深 1.4 mm（Right femur）；圖譜主幹＋示意小連接件 PKC-321/322 |
| 8 | Ascending branch of lateral circumflex femoral artery<br>旋股外側動脈升支 | R:PK-67 L:PK-94 | 示意 | R124／L123 | 有 | 未偵測到問題 |
| 9 | Transverse branch of lateral circumflex femoral artery<br>旋股外側動脈橫支 | R:PK-68 L:PK-95 | 示意 | R62／L62 | 有 | 未偵測到問題 |
| 10 | Descending branch of lateral circumflex femoral artery<br>旋股外側動脈降支 | R:FJ2057 L:FJ2063 | 圖譜 | R386／L388 | 有 | 末端間隙 2 處（最大 28 mm）；穿骨：R 81 mm／最深 2.3 mm（Right femur）；L 69 mm／最深 2.5 mm（Left femur）；名稱的左右夾在中間，不符命名規則 |
| 11 | Perforating arteries (3–4)<br>穿動脈（3–4 支） | R:FJ2058 L:FJ2064 L:FJ2090 L:FJ2094 R:FJ2127 R:FJ2203 R:PK-65 L:PK-92 | 圖譜＋示意 | R11／L14／L24／L358／R15／R345／R58／L55 | 重複（3 組來源） | 末端間隙 1 處（最大 14 mm）；PK-92/65：示意 3 支（各 55–58 mm）；FJ2090/FJ2127：4 小片（各 15–24 mm）；FJ2094/FJ2203：單一長條 345–358 mm、半徑約 2.2 mm（與股深動脈同粗），為「長條不自然」；FJ2064/FJ2058：末支 11–14 mm |
| 12 | Deep circumflex iliac artery<br>旋髂深動脈 | — | — | — | 缺 | — |
| 13 | Superficial circumflex iliac artery<br>旋髂淺動脈 | R:PK-69 L:PK-96 | 示意 | R108／L112 | 有 | 示意 |
| 14 | Superior gluteal artery (+ superficial and deep branches)<br>臀上動脈（含淺、深支） | R:PK-79 R:PK-80 R:PK-81 L:PK-106 L:PK-107 L:PK-108 | 示意 | R47／R57／R59／L46／L57／L59 | 有 | 末端間隙 1 處（最大 4 mm）；穿骨：R 24 mm／最深 0.5 mm（Right hip bone）；L 15 mm／最深 2.2 mm（Sacrum）；L 12 mm／最深 0.5 mm（Left hip bone）；示意；主幹僅 45 mm |
| 15 | Inferior gluteal artery<br>臀下動脈 | R:PK-82 L:PK-109 | 示意 | R72／L89 | 有 | 示意 |
| 16 | Obturator artery<br>閉孔動脈 | — | — | — | 缺 | — |
| 17 | Internal pudendal artery<br>陰部內動脈 | R:PK-83 L:PK-110 | 示意 | R116／L133 | 有 | 輕微擦骨（R 6 mm、L 6 mm）；示意（比清單多） |
| 18 | Popliteal artery<br>膕動脈 | L:FJ2086 R:FJ2170 | 圖譜 | L230／R228 | 有 | 末端間隙 3 處（最大 18 mm）；穿骨：L 33 mm／最深 3.8 mm（Left tibia）；R 33 mm／最深 3 mm（Right femur） |
| 19 | Descending genicular artery<br>降膝動脈 | L:FJ2069 R:FJ2137 R:PK-72 R:PK-73 L:PK-99 L:PK-100 | 圖譜＋示意 | L157／R155／R58／R102／L58／L102 | 有 | 末端間隙 3 處（最大 20 mm）；穿骨：R 27 mm／最深 2.8 mm（Right femur）；L 48 mm／最深 7.3 mm（Left femur）；碎片多（14 片）；主幹為圖譜、關節支與隱支為示意 |
| 20 | Superior medial genicular artery<br>膝上內側動脈 | L:FJ2083 R:FJ2166 | 圖譜 | L99／R104 | 有 | 末端間隙 1 處（最大 17 mm）；穿骨：L 21 mm／最深 0.7 mm（Left femur）；R 24 mm／最深 0.5 mm（Right femur） |
| 21 | Superior lateral genicular artery<br>膝上外側動脈 | L:FJ2080 R:FJ2162 | 圖譜 | L84／R81 | 有 | 末端間隙 4 處（最大 19 mm）；穿骨：L 27 mm／最深 1.5 mm（Left femur）；R 24 mm／最深 1.7 mm（Right femur） |
| 22 | Inferior medial genicular artery<br>膝下內側動脈 | L:FJ2077 R:FJ2152 | 圖譜 | L93／R92 | 有 | 末端間隙 1 處（最大 28 mm）；輕微擦骨（L 9 mm、R 6 mm） |
| 23 | Inferior lateral genicular artery<br>膝下外側動脈 | L:FJ2076 R:FJ2150 | 圖譜 | L95／R94 | 有 | 末端間隙 2 處（最大 16 mm） |
| 24 | Middle genicular artery<br>膝中動脈 | L:FJ2084 R:FJ2167 | 圖譜 | L47／R51 | 有 | 輕微擦骨（R 3 mm）；碎片多（12 片） |
| 25 | Genicular anastomosis (network)<br>膝關節動脈網（吻合） | — | — | — | 缺 | — |
| 26 | Anterior tibial artery<br>脛前動脈 | L:FJ2065 R:FJ2130 | 圖譜 | L343／R342 | 有 | 末端間隙 5 處（最大 42 mm）；穿骨：L 201 mm／最深 11.5 mm（Left tibia）；R 219 mm／最深 9.5 mm（Right tibia）；主幹約 34 cm；中段約 20 cm 在脛骨內 |
| 27 | Anterior tibial recurrent artery<br>脛前返動脈 | L:FJ2066 R:FJ2131 | 圖譜 | L184／R188 | 有 | 末端間隙 5 處（最大 25 mm）；碎片多（24、40 片）；長 18–19 cm（返支本應只有數公分） |
| 28 | Medial / lateral malleolar arteries (anterior)<br>內外踝動脈（前） | R:PK-74 R:PK-75 L:PK-101 L:PK-102 | 示意 | R71／R42／L70／L42 | 有 | 穿骨：R 60 mm／最深 6.5 mm（Right tibia）；R 24 mm／最深 2.1 mm（Right tibia）；L 60 mm／最深 6 mm（Left tibia）；L 15 mm／最深 1.8 mm（Left tibia）；示意（頂點 50–70% 在脛骨內）。後內踝、後外踝動脈缺 |
| 29 | Posterior tibial artery<br>脛後動脈 | L:FJ2087 R:FJ2172 | 圖譜 | L372／R372 | 有 | 末端間隙 2 處（最大 30 mm） |
| 30 | Circumflex fibular artery<br>旋腓動脈 | R:PK-77 L:PK-104 | 示意 | R39／L41 | 有 | 穿骨：R 12 mm／最深 4.2 mm（Right fibula）；L 12 mm／最深 3.2 mm（Left fibula）；示意（比清單多） |
| 31 | Fibular artery<br>腓動脈 | R:PK-76 L:PK-103 | 示意 | R319／L313 | 有 | 穿骨：R 147 mm／最深 5.6 mm（Right fibula）；L 93 mm／最深 3.3 mm（Left fibula）；示意。另見 FJ2093／FJ2197（疑似同一條血管的圖譜版本，見 3.2） |
| 32 | Dorsalis pedis artery<br>足背動脈 | R:FJ2055 L:FJ2073 | 圖譜 | R69／L73 | 有 | 輕微擦骨（R 3 mm、L 3 mm） |
| 33 | Lateral tarsal artery<br>跗外側動脈 | L:FJ2081 R:FJ2163 | 圖譜 | L65／R64 | 有 | 末端間隙 1 處（最大 23 mm）；穿骨：R 12 mm／最深 0.7 mm（Right cuboid bone） |
| 34 | Medial tarsal arteries<br>跗內側動脈 | — | — | — | 缺 | — |
| 35 | Arcuate artery<br>弓狀動脈 | L:FJ2067 R:FJ2133 | 圖譜 | L63／R61 | 有 | 末端間隙 3 處（最大 20 mm）；穿骨：L 15 mm／最深 1.3 mm（Left second metatarsal bone）；R 12 mm／最深 0.7 mm（Right medial cuneiform bone） |
| 36 | Dorsal metatarsal arteries<br>蹠背動脈 | — | — | — | 缺 | 只有「Dorsal digital artery of foot」FJ2072/FJ2141（各 5 片，名稱為趾背動脈）可能對應；蹠背動脈本身無網格，待核 |
| 37 | Dorsal digital arteries of foot<br>趾背動脈（足） | L:FJ2072 R:FJ2141 | 圖譜 | L104／R106 | 有 | 碎片多（17 片） |
| 38 | Medial plantar artery (+ superficial branch)<br>足底內側動脈 | L:FJ2082 L:FJ2089 R:FJ2164 R:FJ2179 | 圖譜 | L44／L60／R43／R60 | 有 | 末端間隙 3 處（最大 27 mm） |
| 39 | Lateral plantar artery<br>足底外側動脈 | L:FJ2079 R:FJ2159 | 圖譜 | L54／R54 | 有 | 末端間隙 1 處（最大 16 mm） |
| 40 | Deep plantar artery<br>深蹠動脈 | L:FJ2068 R:FJ2136 | 圖譜 | L26／R27 | 有 | 未偵測到問題 |
| 41 | Plantar arch<br>足底弓 | L:FJ2085 R:FJ2169 | 圖譜 | L70／R71 | 有 | 輕微擦骨（L 3 mm、R 3 mm） |
| 42 | Plantar metatarsal / common and proper plantar digital arteries<br>蹠足底、總趾足底、固有趾足底動脈 | L:FJ2092 L:FJ2095 L:FJ2096 R:FJ2196 R:FJ2204 R:FJ2205 R:FJ2206 | 圖譜 | L15／L24／L45／R18／R19／R68／R47 | 有 | 輕微擦骨（L 6 mm）；碎片多（18、20、45、20 片） |
| 43 | Calcaneal branches of posterior tibial artery<br>脛後動脈跟骨支 | — | — | — | 缺（隔離） | 來源網格 FJ2091/FJ2195 位置在大腿上段，已隔離；但其末端連接件 FJ2091-END／FJ2195-END 仍在末端串流（見 4.5） |

### 2.2 Veins (list b)
### 2.2 靜脈（清單 b）

| # | 結構（英文／中文） | 模型網格（側:編號） | 來源 | 長度 mm | 有／缺／重複 | 量測與已知問題 |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | Great saphenous vein<br>大隱靜脈 | L:FJ2103 R:FJ2145 | 圖譜 | L900／R893 | 有 | 碎片多（18、13 片）；長約 90 cm；碎片 L 18／R 13 片 |
| 2 | Superficial epigastric vein<br>腹壁淺靜脈 | L:FJ2122 R:FJ2178 | 圖譜 | L159／R160 | 有 | 未偵測到問題 |
| 3 | Superficial circumflex iliac vein<br>旋髂淺靜脈 | — | — | — | 缺 | — |
| 4 | Superficial external pudendal vein<br>外陰淺靜脈 | — | — | — | 缺 | — |
| 5 | Accessory saphenous / medial and lateral marginal / posterior arch veins<br>副隱、內外緣、後弓等隱靜脈屬支 | — | — | — | 缺 | 大隱靜脈網格是否含屬支分叉，需在 3D 畫面確認 |
| 6 | Small saphenous vein<br>小隱靜脈 | L:FJ2121 R:FJ2176 | 圖譜 | L519／R524 | 有 | 末端間隙 3 處（最大 38 mm）；長約 52 cm |
| 7 | Dorsal venous arch of foot<br>足背靜脈弓 | L:FJ2059 L:FJ2060 R:FJ2061 R:FJ2062 | 圖譜 | L92／L44／R90／R43 | 有（每側 2 個網格） | 末端間隙 1 處（最大 17 mm）；輕微擦骨（L 6 mm、R 3 mm）；網格名稱的左右夾在中間 |
| 8 | Dorsal metatarsal / digital veins<br>蹠背靜脈、趾背靜脈 | L:FJ2185 L:FJ2186 R:FJ2198 R:FJ2199 | 圖譜 | L84／L49／R37／R59 | 有 | 末端間隙 2 處（最大 7 mm）；輕微擦骨（L 3 mm）；碎片多（19、17 片） |
| 9 | Plantar venous arch and tributaries<br>足底靜脈弓與屬支 | L:FJ2113 L:FJ2115 L:FJ2128 R:FJ2129 R:FJ2160 R:FJ2165 | 圖譜 | L55／L43／L70／R69／R53／R43 | 有 | 末端間隙 1 處（最大 5 mm） |
| 10 | Plantar metatarsal / plantar digital veins<br>蹠足底靜脈、趾足底靜脈 | L:FJ2120 R:FJ2175 L:FJ2191 R:FJ2207 | 圖譜 | L101／R128／L60／R66 | 有 | 末端間隙 3 處（最大 22 mm）；碎片多（19、22 片） |
| 11 | Lateral plantar vein<br>足底外側靜脈 | R:PK-78 L:PK-105 | 示意 | R55／L55 | 有 | 穿骨：R 12 mm／最深 1.6 mm（Right cuboid bone）；示意；父血管欄位寫成外側蹠動脈 |
| 12 | Medial plantar vein<br>足底內側靜脈 | — | — | — | 缺 | — |
| 13 | Perforating veins<br>穿通靜脈 | L:FJ2100 L:FJ2119 R:FJ2138 R:FJ2174 R:FJ2192 | 圖譜 | L18／L38／R21／R38／R15 | 有 | 末端間隙 3 處（最大 7 mm）；碎片多（21、29 片）；足部 FJ2100/FJ2119/FJ2138/FJ2174；右大腿 FJ2192；左大腿缺 |
| 14 | Posterior tibial vein (paired veins, artery between)<br>脛後靜脈（兩條夾動脈） | L:FJ2118 R:FJ2173 | 圖譜 | L396／R389 | 有（單條，不符） | 末端間隙 1 處（最大 23 mm）；碎片多（19 片）；每側只有 1 個網格，中位距離動脈 10.7–12.3 mm，並非夾著動脈的兩條 |
| 15 | Anterior tibial vein (paired)<br>脛前靜脈（兩條伴行） | L:FJ2097 R:FJ2132 L:FJ2183 R:FJ2193 | 圖譜 | L176／R178／L306／R315 | 有（單條，分 2 段） | 末端間隙 9 處（最大 37 mm）；每側 2 段首尾相接，不是兩條平行伴行 |
| 16 | Fibular vein (paired)<br>腓靜脈（兩條伴行） | L:FJ2184 L:FJ2187 L:FJ2190 R:FJ2194 R:FJ2200 | 圖譜 | L13／L339／L24／R19／R350 | 有（碎段） | 末端間隙 6 處（最大 29 mm）；輕微擦骨（L 9 mm）；碎片多（11、18 片）；L 3 個、R 2 個網格；FJ2190（名為腓靜脈）在大腿高度 y 0.62–0.80 m，疑似名稱與位置不符 |
| 17 | Popliteal vein<br>膕靜脈 | L:FJ2117 R:FJ2171 | 圖譜 | L200／R216 | 有 | 末端間隙 6 處（最大 20 mm）；穿骨：L 15 mm／最深 3.1 mm（Left tibia）；R 15 mm／最深 3.3 mm（Right tibia） |
| 18 | Genicular veins<br>膝靜脈 | L:FJ2107 L:FJ2108 L:FJ2124 L:FJ2125 R:FJ2151 R:FJ2153 R:FJ2181 R:FJ2182 | 圖譜 | L84／L119／L85／L95／R85／R116／R86／R96 | 有 | 末端間隙 13 處（最大 35 mm）；穿骨：L 12 mm／最深 0.6 mm（Left tibia）；R 18 mm／最深 0.5 mm（Right tibia）；每側 4 個，無名稱區分上下內外 |
| 19 | Femoral vein<br>股靜脈 | L:FJ2102 R:FJ2144 | 圖譜 | L339／R336 | 有 | 輕微擦骨（R 9 mm）；網格過疏（每環約 31 mm）；網格過疏（環距 31–34 mm） |
| 20 | Deep femoral vein<br>股深靜脈 | L:FJ2099 R:FJ2135 | 圖譜 | L348／R353 | 有 | 末端間隙 2 處（最大 21 mm） |
| 21 | Lateral / medial circumflex femoral veins<br>旋股外側、內側靜脈 | L:FJ2188 L:FJ2189 R:FJ2201 R:FJ2202 | 圖譜 | L202／L101／R204／R99 | 有 | 末端間隙 8 處（最大 36 mm）；穿骨：R 12 mm／最深 1.7 mm（Right femur） |
| 22 | External iliac vein<br>髂外靜脈 | L:FJ3484 L:FJ3522 L:FJ3523 L:FJ3524 R:FJ3568 | 圖譜 | L155／L39／L28／L27／R162 | 有 | 末端間隙 4 處（最大 15 mm）；輕微擦骨（L 9 mm）；左 4 個網格、右 1 個，左右不對稱 |
| 23 | Internal iliac vein (and tributaries)<br>髂內靜脈 | L:FJ3469 L:FJ3470 L:FJ3471 R:FJ3570 R:FJ3571 R:FJ3572 R:FJ3607 R:FJ3608 R:FJ3609 | 圖譜 | L84／L70／L78／R82／R75／R86／R40／R34／R23 | 有 | 末端間隙 2 處（最大 8 mm）；輕微擦骨（L 6 mm、L 3 mm、R 9 mm）；左 3 個網格、右 6 個，左右不對稱 |
| 24 | Common iliac vein<br>髂總靜脈 | L:FJ3465 R:FJ3566 | 圖譜 | L90／R75 | 有 | 穿骨：L 12 mm／最深 0.8 mm（Fourth lumbar vertebra） |
| 25 | Superior / inferior gluteal, internal pudendal, obturator veins<br>臀上、臀下、陰部內、閉孔靜脈 | L:FJ3513 L:FJ3525 L:FJ3527 L:FJ3531 R:FJ3606 R:FJ3610 R:FJ3612 R:FJ3616 | 圖譜 | L175／L174／L109／L167／R176／R185／R110／R175 | 有 | 末端間隙 12 處（最大 19 mm）；穿骨：L 18 mm／最深 2.5 mm（Sacrum）；R 15 mm／最深 2.4 mm（Sacrum）；臀上靜脈於 #67 已修過走向 |

### 2.3 Extra structures not on the list
### 2.3 清單以外模型已有的結構

腹壁下動脈與靜脈（FJ3511／FJ3604、FJ3512／FJ3605）、腹壁淺動脈（FJ3529／FJ3614）、深外陰與淺外陰動脈（示意）、陰部內動脈（示意）、旋腓動脈（示意）。重建時保留，是否納入血管樹由你決定。

## 3. Where the known problems are
## 3. 已知問題逐項對應

### 3.1 Perforating arteries drawn as long strips
### 3.1 穿動脈做成長條

穿動脈應是股深動脈穿過內收大肌的 3–4 條短支。模型有三組互相重疊的來源：

| 網格 | 側 | 長度 | 半徑 | 判讀 |
| --- | --- | --- | --- | --- |
| FJ2094 Set of perforating arteries | 左 | 358 mm | 約 2.2 mm | **長條**：從大腿上段到下段，長度除以直徑約 83，與股深動脈同粗；伴隨肌肉為恥骨肌、內收長肌、股內側肌 |
| FJ2203 Set of perforating arteries | 右 | 345 mm | 約 2.3 mm | 同上，長度除以直徑約 74 |
| FJ2090／FJ2127 Set of perforating arteries | 左／右 | 24／15 mm | — | 4 個小片，比較像真正的穿支，但各片未接到主幹 |
| PK-92／PK-65 Perforating branch of deep femoral artery | 左／右 | 55／58 mm | — | 示意 3 支，各自接到股深動脈（接點 1.6–1.7 mm） |
| FJ2064／FJ2058 Distal perforating artery | 左／右 | 14／11 mm | — | 末支（第四穿動脈）小片 |

### 3.2 Branches broken into short pieces
### 3.2 分支斷成短截

- 末端間隙超過半個管徑：現在畫面 133 處（74 個網格）；連接件加入前為 523 處。最大的前 14 處：

| 血管 | 下一段 | 型態 | 間隙 mm | 管徑 mm |
| --- | --- | --- | ---: | ---: |
| FJ2130 Right anterior tibial artery | Right posterior tibial artery (FJ2172) | 分支入幹 | 42.38 | 2.45 |
| FJ2121 Left small saphenous vein | Left genicular vein (FJ2107) | 分支入幹 | 38.27 | 4.76 |
| FJ2193 Right anterior tibial vein | Right fibular vein (FJ2200) | 分支入幹 | 36.86 | 3.32 |
| FJ2201 Right lateral circumflex femoral vein | Right deep femoral vein (FJ2135) | 分支入幹 | 36.18 | 3.9 |
| FJ2121 Left small saphenous vein | Left genicular vein (FJ2107) | 分支入幹 | 36.09 | 3.66 |
| FJ2151 Right genicular vein | Right anterior tibial vein (FJ2132) | 分支入幹 | 34.78 | 2.63 |
| FJ2176 Right small saphenous vein | Right genicular vein (FJ2151) | 分支入幹 | 34.7 | 4.76 |
| FJ2193 Right anterior tibial vein | Right fibular vein (FJ2200) | 分支入幹 | 31.98 | 4.23 |
| FJ2108 Left genicular vein | Left great saphenous vein (FJ2103) | 分支入幹 | 31.92 | 1.39 |
| FJ2130 Right anterior tibial artery | Right anterior tibial recurrent artery (FJ2131) | 分支入幹 | 31.9 | 5.51 |
| FJ2188 Left lateral circumflex femoral vein | Left deep femoral vein (FJ2099) | 分支入幹 | 31.34 | 3.93 |
| FJ2172 Right posterior tibial artery | Set of dorsal digital arteries (FJ2197) | 分支入幹 | 30.05 | 1.42 |
| FJ2065 Left anterior tibial artery | Left anterior tibial recurrent artery (FJ2066) | 分支入幹 | 29.7 | 3.32 |
| FJ2187 Left fibular vein | Left posterior tibial vein (FJ2118) | 分支入幹 | 28.91 | 4.94 |

- 碎片很多的網格（大於 12 頂點的片數少、小碎片 10 片以上）：脛前返動脈（左 24、右 40 片）、大隱靜脈（左 18、右 13）、趾足底固有動脈組（FJ2204 45 片）、穿通靜脈組 FJ2119／FJ2174、腓靜脈 FJ2200、脛後靜脈 FJ2173、降膝動脈右 FJ2137 等。完整數字在附錄 A。
- **疑似名稱與位置不符的網格**：
  - FJ2093（左）／FJ2197（右）「Set of dorsal digital arteries」：長 353／349 mm，沿小腿後區從踝上到膕下，伴隨屈拇長肌、比目魚肌與脛神經，位置接近腓動脈的走向，與圖譜足背趾動脈組不符；腓動脈另有示意版 PK-103／PK-76。**這是推測**，請你決定它是否為腓動脈的圖譜版本（若是，重建時以哪一個為準）。
  - FJ2190「Left fibular vein」：在大腿高度（y 0.62–0.80 m），只有 24 mm、4 小片，名稱與位置不符。
  - FJ2091／FJ2195「Set of calcaneal branches of posterior tibial artery」：來源網格位於大腿上段（y 0.84–0.91 m），已列入隔離（`app/anatomy-source-overrides.json`），但末端連接件仍存在，見 4.5。

### 3.3 Floating and bone penetration
### 3.3 浮空與穿骨

- **浮空**：既有的 `audit-vessel-continuity`（3 mm 內沒有任何其他血管的片）結果為 0 個；我另外檢查每個網格中心線離所有肌肉與骨都超過 2／3 cm 的比例，全部為 0%。因此**整條浮空沒有量到**，只有孤兒連接件（4.5）。
- **穿骨**（中心線進入骨網格累計 12 mm 以上，共 39 個網格，列前 16 名）：

| 血管 | 來源 | 在骨內 mm | 最深 mm | 骨 | 表面頂點在骨內 % |
| --- | --- | ---: | ---: | --- | ---: |
| FJ2130 Right anterior tibial artery | 圖譜 | 219 | 9.5 | Right tibia | 26.8 |
| FJ2065 Left anterior tibial artery | 圖譜 | 201 | 11.5 | Left tibia | 26.7 |
| PK-76 Right fibular artery | 示意 | 147 | 5.6 | Right fibula | 37.8 |
| PK-103 Left fibular artery | 示意 | 93 | 3.3 | Left fibula | 24.7 |
| FJ2057 Descending branch of right lateral circumflex femoral artery | 圖譜 | 81 | 2.3 | Right femur | 14.2 |
| FJ2063 Descending branch of left lateral circumflex femoral artery | 圖譜 | 69 | 2.5 | Left femur | 14.2 |
| PK-74 Right anterior lateral malleolar artery | 示意 | 60 | 6.5 | Right tibia | 69.9 |
| PK-101 Left anterior lateral malleolar artery | 示意 | 60 | 6 | Left tibia | 68 |
| PK-66 Right medial circumflex femoral artery | 示意 | 54 | 14.7 | Right femur | 36.4 |
| PK-93 Left medial circumflex femoral artery | 示意 | 48 | 10 | Left femur | 36.9 |
| PK-100 Left saphenous branch of descending genicular artery | 示意 | 48 | 7.3 | Left femur | 40.1 |
| FJ2078 Left lateral circumflex femoral artery | 圖譜 | 36 | 1.3 | Left femur | 29.2 |
| FJ2086 Left popliteal artery | 圖譜 | 33 | 3.8 | Left tibia | 6.5 |
| FJ2158 Right lateral circumflex femoral artery | 圖譜 | 33 | 1.4 | Right femur | 27 |
| FJ2170 Right popliteal artery | 圖譜 | 33 | 3 | Right femur | 5.2 |
| FJ2080 Left lateral superior genicular artery | 圖譜 | 27 | 1.5 | Left femur | 19.6 |

  - 示意網格 43 個中有 16 個穿骨：前內、前外踝動脈、腓動脈、旋腓動脈、旋股內側動脈、降膝動脈隱支、臀上動脈等。這些是用標誌估算的路徑，尚未對骨表面做避讓。
  - 圖譜的脛前動脈在脛骨內累計 20 cm（最深 11.5 mm），遠超過網格誤差；它需要整條重建。
  - 其餘穿骨多數深度只有 0.5–3 mm（膕動脈、膝動脈、旋股外側動脈）。

### 3.4 Vein fragments on the gluteus maximus surface
### 3.4 臀大肌表面穿出的靜脈碎段

我把骨盆血管的每個連通碎片取中心，判斷是否在臀大肌網格「後方」（臀大肌在正前方 30 mm 內且碎片在肌肉外）。結果：
- FJ3470（左髂內靜脈）1 個碎片：4 頂點，中心 (20, 903, −102) mm，臀大肌在正前方 1.3 mm。
- FJ3471（左髂內靜脈）2 個碎片：6、3 頂點，中心 (13, 868, −109) mm，臀大肌在正前方約 8 mm。
- 右側與臀上、臀下靜脈沒有量到肌肉外的碎片。

以上都是 3–6 個頂點的小碎片，位置在薦骨外緣。**沒有量到「大片碎段」**，可能是 #67 已處理，或是使用者看到的是別的位置。這項未在 3D 畫面確認，需要使用者指出畫面位置。

### 3.5 Deep femoral artery card is missing branches
### 3.5 股深動脈資訊卡漏分支

資訊卡的「主要分支」由 `app/mj-vessel-branches.json` 產生，只列了股深動脈的旋股外側、旋股內側動脈，**漏了穿通支**（示意結構已把股深動脈設為上一級，但分支表沒有列）。把示意結構的上一級欄位與分支表對照，同類漏列共 16 張卡：

| 血管（資訊卡） | 卡上現列的分支 | 模型有、卡上沒列 |
| --- | --- | --- |
| Right femoral artery | Right deep femoral artery、Right popliteal artery、Right descending genicular artery | Right superficial circumflex iliac artery、Right superficial external pudendal artery、Right deep external pudendal artery |
| Left femoral artery | Left deep femoral artery、Left popliteal artery、Left descending genicular artery | Left superficial circumflex iliac artery、Left superficial external pudendal artery、Left deep external pudendal artery |
| Right deep femoral artery | Right lateral circumflex femoral artery、Right medial circumflex femoral artery | Right perforating branch of deep femoral artery |
| Left deep femoral artery | Left lateral circumflex femoral artery、Left medial circumflex femoral artery | Left perforating branch of deep femoral artery |
| Right posterior tibial artery | Right fibular artery、Right medial plantar artery、Right lateral plantar artery | Right circumflex fibular artery |
| Left posterior tibial artery | Left fibular artery、Left medial plantar artery、Left lateral plantar artery | Left circumflex fibular artery |
| Right anterior tibial artery | Right dorsalis pedis artery | Right anterior lateral malleolar artery、Right anterior medial malleolar artery |
| Left anterior tibial artery | Left dorsalis pedis artery | Left anterior lateral malleolar artery、Left anterior medial malleolar artery |
| Right lateral circumflex femoral artery | （沒有列） | Right ascending branch of lateral circumflex femoral artery、Right transverse branch of lateral circumflex femoral artery |
| Right descending genicular artery | （沒有列） | Right articular branch of descending genicular artery、Right saphenous branch of descending genicular artery |
| Right lateral plantar artery | （沒有列） | Right lateral plantar vein |
| Right superior gluteal artery | （沒有列） | Right superficial branch of superior gluteal artery、Right deep branch of superior gluteal artery |
| Left lateral circumflex femoral artery | （沒有列） | Left ascending branch of lateral circumflex femoral artery、Left transverse branch of lateral circumflex femoral artery |
| Left descending genicular artery | （沒有列） | Left articular branch of descending genicular artery、Left saphenous branch of descending genicular artery |
| Left lateral plantar artery | （沒有列） | Left lateral plantar vein |
| Left superior gluteal artery | （沒有列） | Left superficial branch of superior gluteal artery、Left deep branch of superior gluteal artery |

另：股動脈卡把降膝動脈列為分支但沒有列旋髂淺、外陰淺、外陰深動脈；足底外側動脈的分支關係只有示意的足底外側靜脈（把靜脈當成動脈的分支，應改為靜脈相接），卡上沒有列分支。

## 4. Measured relations
## 4. 量測彙整

### 4.1 Tree edges (child end to parent surface)
### 4.1 血管樹邊：子血管末端到上一級表面

共量 62 組上下級關係（來源：分支關係表與示意結構的上一級欄）。「尖端距離」＝子血管任一開口端中心到上一級表面的最短距離；「貼合距離」＝子血管表面頂點到上一級表面的最短距離。距離小於約 2 mm 表示接上；尖端距離大、貼合距離小（例如左股深動脈 14.9／0.4）表示子血管有一段貼著上一級，但起端不在接點。完整列表見附錄 B。大於 2.9 mm 的只有 4 組：左股深動脈（14.9）、右膕動脈（3.0）、左右足底外側靜脈（3.4／3.5）。右股動脈的尖端無法判定（開口框架不足），貼合 0.1 mm。

### 4.2 Artery and companion vein
### 4.2 動脈與伴行靜脈

| 側 | 動脈／靜脈 | 靜脈網格數 | 中位距離 mm | 90 百分位 | 最大 |
| --- | --- | ---: | ---: | ---: | ---: |
| 左 | femoral artery／femoral vein | 1 | 14.7 | 18.7 | 33.8 |
| 左 | popliteal artery／popliteal vein | 1 | 6.2 | 25.3 | 41.6 |
| 左 | posterior tibial artery／posterior tibial vein | 1 | 10.7 | 17.5 | 19 |
| 左 | anterior tibial artery／anterior tibial vein | 2 | 8.7 | 13.1 | 37.9 |
| 左 | fibular artery／fibular vein | 3 | 16.1 | 28.7 | 29.3 |
| 左 | deep femoral artery／deep femoral vein | 1 | 6.5 | 7.8 | 9.5 |
| 右 | femoral artery／femoral vein | 1 | 13.8 | 24 | 34.4 |
| 右 | popliteal artery／popliteal vein | 1 | 6.4 | 24.1 | 41.6 |
| 右 | posterior tibial artery／posterior tibial vein | 1 | 12.3 | 16.4 | 21.9 |
| 右 | anterior tibial artery／anterior tibial vein | 2 | 8.7 | 10.6 | 38.2 |
| 右 | fibular artery／fibular vein | 2 | 19.3 | 30.1 | 30.9 |
| 右 | deep femoral artery／deep femoral vein | 1 | 6 | 7.1 | 9.3 |

判讀：脛後、脛前、腓動脈旁都**只有單條靜脈**（或首尾相接的分段），距離動脈中位 9–19 mm（動脈半徑約 2 mm），不是「兩條伴行靜脈夾著動脈」。腓靜脈左 3 個、右 2 個網格，且有一個放在大腿高度。

### 4.3 Order of structures at three landmarks
### 4.3 三個高度的結構順序

「外側」值越大越靠外；「前方」值越大越靠前（單位 mm，中心線座標，非肌肉內位置）。

| 側 | 位置 | 結果 |
| --- | --- | --- |
| 左 | 股三角, y 0.86 m (預期由外到內：神經、動脈、靜脈) | Femoral nerve（外側 63、前方 41.1）；Femoral artery（外側 46、前方 33.1）；Femoral vein（外側 34.3、前方 47.3） |
| 左 | 膕窩, y 0.46 m (預期由淺（後）到深（前）：神經、靜脈、動脈) | Popliteal vein（外側 83.1、前方 -37.9）；Tibial nerve（外側 79.9、前方 -62.5）；Popliteal artery（外側 76.3、前方 -39.2） |
| 左 | 小腿中段, y 0.22 m (脛後動脈、脛後靜脈與脛神經) | Fibular artery（外側 87.4、前方 -40.5）；Tibial nerve（外側 71.1、前方 -46.1）；Posterior tibial artery（外側 62.6、前方 -34.9）；Posterior tibial vein（外側 44.1、前方 -37.4） |
| 右 | 股三角, y 0.86 m (預期由外到內：神經、動脈、靜脈) | Femoral nerve（外側 63、前方 41.1）；Femoral artery（外側 49.7、前方 31.2）；Femoral vein（外側 36.2、前方 50.1） |
| 右 | 膕窩, y 0.46 m (預期由淺（後）到深（前）：神經、靜脈、動脈) | Popliteal vein（外側 82.4、前方 -37.4）；Tibial nerve（外側 79.9、前方 -62.5）；Popliteal artery（外側 77.8、前方 -39.3） |
| 右 | 小腿中段, y 0.22 m (脛後動脈、脛後靜脈與脛神經) | Fibular artery（外側 95.3、前方 -48.7）；Tibial nerve（外側 71.1、前方 -46.1）；Posterior tibial artery（外側 61、前方 -37.2）；Posterior tibial vein（外側 45.5、前方 -36.3） |

判讀（請使用者核對，我不裁決）：
- 股三角：由外到內為神經、動脈、靜脈，順序**符合**預期；但靜脈比動脈偏前 14–19 mm（前方 47–50 對 31–33），與靜脈在動脈內後方的一般描述不同。
- 膕窩：脛神經在最淺（最後方，−62 mm），膕靜脈與膕動脈幾乎同一深度（−38 對 −39 mm），動脈只比靜脈深 1–2 mm，靜脈偏外 5–7 mm；「神經、靜脈、動脈」的由淺到深順序只有神經成立。
- 小腿中段（y 0.22 m）：由外到內為腓動脈、脛神經、脛後動脈、脛後靜脈；脛後靜脈在動脈**內側** 16–19 mm 且只有一條，不是夾著動脈。總指引第 6 節 (c) 的「脛神經、脛後動脈在脛後肌後面、位於屈趾長肌與屈拇長肌之間」需要再量肌肉位置，留到重建時一併檢查。

### 4.4 Left–right differences
### 4.4 左右差異

- 髂外靜脈：左 4 個網格（FJ3484 主幹加 3 個 27–39 mm 小段）、右 1 個；髂內靜脈：左 3 個、右 6 個。
- 既有血管樹報告（`docs/vessel-tree.md`）：平均半徑，左髂外動脈 5.24 → 左股動脈 3.12 mm，右側為 5.01 → 5.41 mm，左股動脈比右側細約 40%（路線圖也列為待核問題）。
- 脛神經的左右位置完全鏡射，血管則不是（例如小腿中段腓動脈外側座標左 87／右 95 mm）。

### 4.5 Orphan connector pieces
### 4.5 孤兒連接件

| 編號 | 名稱 | 頂點 | 範圍（mm，x／y／z） |
| --- | --- | ---: | --- |
| FJ2091-END | Set of calcaneal branches of posterior tibial artery | 530 | 87、835、-24 ～ 148、910、5 |
| FJ2195-END | Set of calcaneal branches of posterior tibial artery | 558 | -146、842、-51 ～ -95、911、5 |

來源網格 FJ2091／FJ2195 已隔離，但末端串流仍有它們的連接件，位置在髖外側（y 0.84–0.91 m）。是否仍畫在畫面上**未在 3D 畫面確認**（要看應用程式是否以來源編號過濾末端串流）。重建時一併清除。

### 4.6 Meshes that are not named Left/Right
### 4.6 名稱沒有 Left／Right 前綴

40 個網格的名稱沒有左右前綴（如 Distal perforating artery、Set of …、Plantar metatarsal artery）或把左右夾在中間（Dorsal venous arch of left foot、Descending branch of left lateral circumflex femoral artery）。命名層可能已補左右，重建時依命名規則統一。

## 5. Proposed vessel-tree data structure
## 5. 血管樹資料結構草案

**位置**：`app/data/vessel-tree/lower-limb.json`（資料與建置腳本、檢查腳本同層；文字說明用自己的話寫，也受 `check-no-notes` 掃描）。與 #171 的走向路徑檔不同：路徑檔管動畫，血管樹管「模型長什麼樣、怎麼接」。兩者以血管 id 對齊，不重複存解剖文字。

一條血管一筆：

```json
{
  "id": "popliteal-artery",
  "kind": "artery",                       // artery | vein
  "bilateral": true,
  "name": {"en": "Popliteal artery", "zh": "膕動脈"},
  "parent": {"id": "femoral-artery", "at": "adductor hiatus", "relation": "continuation"},
  "flow": {"direction": "downstream"},    // 動脈：由母到子；靜脈：由子到母（回心）
  "start": {"landmark": "adductor hiatus"},
  "course": [
    {"through": "popliteal fossa", "relations": [
      {"with": "tibial-nerve", "rule": "superficial-to-vessels"},
      {"with": "popliteal-vein", "rule": "superficial-to-artery"}
    ]}
  ],
  "branches": [
    {"id": "superior-medial-genicular-artery", "at": "femoral condyle level", "order": 1},
    {"id": "middle-genicular-artery", "at": "posterior knee capsule", "order": 3}
  ],
  "end": {"type": "bifurcation", "into": ["anterior-tibial-artery", "posterior-tibial-artery"], "landmark": "lower border of popliteus"},
  "calibreMm": {"start": 4.5, "end": 3.6},   // 直徑；沿路徑只可遞減
  "taper": "none",                            // none | terminal（只有真正末端才收細）
  "companionVeins": 0,                        // 膝以下動脈填 2：由血管樹自動生成兩條伴行靜脈的檢查
  "mayCross": [{"structure": "adductor hiatus", "kind": "aperture"}],   // 允許穿過的孔、裂孔、肌肉；其餘一律不可穿
  "model": {"build": "waypoints", "waypoints": ["..."], "status": "schematic"}   // 重建用的標誌路徑與是否為示意
}
```

欄位說明：

| 欄位 | 內容 |
| --- | --- |
| `parent`／`branches`／`end` | 樹的連結。`parent` 與 `branches` 互為反向，建置時檢查一致；`end` 描述終點（分叉、匯入、入器官、真正末端） |
| `flow` | 動脈與靜脈方向相反，資訊卡「起點／終點」與走向動畫共用 |
| `course` | 與肌、骨、神經、孔隙的關係，用標誌名稱，不用座標；第 6 節的位置核對清單轉成 `relations` 規則 |
| `calibreMm` 與 `taper` | 管徑單調遞減；只有 `taper: terminal` 的血管末端可收尖（其他末端必須接到下一條） |
| `companionVeins` | 膝以下動脈的伴行靜脈數（2），驗證兩條夾著動脈 |
| `mayCross` | 白名單：只在解剖上真的穿過處才可碰骨或肌肉（例如閉孔管、內收肌裂孔、穿動脈穿內收大肌） |
| `model` | 重建的標誌路徑、粗細與是否示意；資料與解剖文字分開 |

## 6. Automated checks (continuity and collisions)
## 6. 連續性與碰撞自動檢查設計

新腳本 `scripts/check-leg-vessels.mjs`，沿用既有 `audit-vessel-continuity`／`check-vessel-tree` 的「基準檔」做法：已知例外放 `docs/leg-vessel-baseline.json`，新增的違規或惡化的既有項目就失敗，不放寬規則。只輸出通過／失敗與數量。

| 檢查 | 判定 |
| --- | --- |
| 樹一致 | 每條血管的 `parent` 存在、`branches` 與 `parent` 互為反向；動脈沿 `flow` 無環，靜脈同理；每個網格都出現在樹裡，樹裡的每個結構都有網格 |
| 連續 | 子血管近端開口中心到上一級表面 ≤ 0.5 倍子管徑（且 ≤ 1 mm）；端接端時切線夾角 ≤ 30°；沿路徑管徑只減不增（容差 10%，匯合處除外） |
| 末端 | 只有 `taper: terminal` 的末端半徑可小於起端 40%；其他開口端必須接到下一條，不留間隙 |
| 單一連通 | 每條血管是單一連通片，沒有 12 頂點以下的碎片（現況全身有 7600 多個小端蓋，下肢部分由重建消除） |
| 穿骨 | 中心線在任何骨網格內累計 0 mm（容差：骨網格誤差 1 mm 內），`mayCross` 白名單例外；管壁距骨 ≥ 0 |
| 穿肌 | 血管可在肌內走，但只可穿過 `mayCross` 列出的肌肉或腱膜；其餘肌肉要走在肌間隙 |
| 神經 | 血管與神經不互相穿過（壁距 ≥ 0），伴行順序依 `relations` |
| 位置順序 | 股三角、內收肌管、膕窩、跗管、梨狀肌上下孔等指定高度的外側／前後座標順序（總指引第 6 節） |
| 伴行靜脈 | 膝以下動脈有 2 條伴行靜脈，兩條在動脈兩側且壁距小於 1 個管徑 |
| 動作 | 以 `test-vessel-motion` 的極限關節角度重跑連續性與穿骨 |

納入 CI 的方式：寫成 `npm run check` 的一個步驟（接在 `check-vessel-tree.mjs` 之後）並加入 `check:vessels`。目前我的盤點腳本需 70 秒，主要花在骨與肌的內外判定；正式版要先對骨與肌建三角形網格索引（格狀空間索引，沿用 `Grid`），預計降到 20 秒內，避免拖慢 CI。重建後基準檔應為空。

## 7. Information card fields
## 7. 資訊卡欄位

血管卡欄位（英文在上、中文在下，一律用自己的話寫；內容自血管樹產生，避免兩邊各寫一份）：

| 欄位 | 來源 |
| --- | --- |
| Origin 起點 | `parent`＋`start`（靜脈則為「由哪裡開始匯集」） |
| Course 走向 | `course`：經過的孔、肌間隙與伴行神經、靜脈 |
| Main branches 主要分支 | `branches`，自動帶出所有子血管（含示意分支），解決股深動脈等漏列 |
| Territory 供應範圍（靜脈為引流範圍） | 血管樹的 `supplies` 欄，文字自行撰寫 |
| Termination 終點 | `end`（分叉／匯入／止於組織） |
| Accompanied by 伴行 | 伴行神經、伴行靜脈 |
| Model 模型 | 「示意模型」標示，位置為標誌估算；末端漸細只出現在真正末端 |

Atlas reference 與 View anatomical source 只在確實有真實編號與頁面時才顯示（不編造）。
**待決**：現有示意卡的出處行寫著所引用的教科書書名（見第 11 節問題 1）。

## 8. Rebuild batches
## 8. 分批計畫

依總指引：股動脈系統 → 膕 → 脛前／脛後／腓 → 足部 → 靜脈。每批都是「血管樹條目 → 依標誌重建網格 → 自動檢查 → 多角度與極限角度截圖 → 使用者審核」；新版本審核通過後**一次替換**網站上的舊血管；第一批動脈完成時先通知使用者。

| 批 | 內容 | 解決的問題 |
| --- | --- | --- |
| 1 股動脈系統 | 髂外→股動脈、股深、旋股內外側（升、橫、降）、穿動脈 3–4 支加末支、淺分支（旋髂淺、腹壁淺、外陰淺深）、降膝動脈與關節支隱支；同批補臀上下、閉孔、旋髂深、陰部內（骨盆根部，不然股系統接不上） | 穿動脈長條與三組重複、股深卡漏分支、股動脈過疏與左右口徑 |
| 2 膕 | 膕動脈、五條膝動脈、膝關節動脈網、脛前返動脈 | 膕動脈穿骨、膝動脈間隙與穿骨、返動脈長條碎片 |
| 3 脛前、脛後、腓 | 脛前、脛後、腓動脈與踝動脈（前內、前外、後內、後外）、旋腓動脈、跟骨支 | 脛前動脈穿脛骨 20 cm、腓動脈穿腓骨、FJ2093 疑似重複、孤兒連接件 |
| 4 足部 | 足背、弓狀、跗內外側、蹠背、深蹠、足底內外側、足底弓、蹠與趾動脈 | 足部碎片、缺的跗內側與蹠背動脈 |
| 5 靜脈 | 深靜脈（膝以下兩條伴行夾動脈、膕、股、股深、旋股、髂）、大隱與小隱及主要屬支、足背與足底靜脈弓、穿通靜脈、骨盆靜脈 | 單條脛後靜脈、腓靜脈碎段與錯位、靜脈缺的屬支、髂靜脈左右不對稱 |

## 9. Missing structures and data sources
## 9. 缺漏結構與資料來源

- **缺的結構只依解剖描述自行建立**：用骨與肌網格上量到的標誌當路徑點，管狀、有厚度、起止接在正確的上下級；不以平面、碟片或長方體代替；只有真正末端才收細；位置核對只用 Gray's Anatomy 1918 版插圖與 OpenStax，最後由使用者核對。
- **若想用任何開源模型資料補足，要先經你確認。以下只是候選，我沒有下載、檢視或使用任何一個**：

| 候選 | 授權 | 目前專案已用於 | 可取得範圍 |
| --- | --- | --- | --- |
| BodyParts3D（4.0 與 3.0 版） | 4.0 為 CC BY 4.0；3.0 為 CC BY-SA 2.1 Japan（專案已分開標示） | 全部圖譜血管、補充肌肉 | **未查證**：3.0 版是否含閉孔動脈、旋髂深動脈、跗內側動脈、蹠背動脈、足底內側靜脈等缺項，需要你同意我只檢視檔案清單才能回答 |
| Z-Anatomy | CC BY-SA 4.0 | 下肢神經（經專案校正） | 未查證其下肢血管涵蓋範圍；先前檢查過頸部結構缺項 |
| Human Reference Atlas（HuBMAP） | CC BY 4.0 | 女性骨盆器官、乳房 | 以器官與骨盆內血管為主，下肢血管未查證 |

## 10. Overlap with the pathways document (#171)
## 10. 與 #171 走向路徑文件的重疊與差異

我讀過 `docs/pathways-lower-limb.md`（未修改）。重複的部分只引用，不再列：它已列出閉孔動脈缺、足底內側靜脈缺、穿動脈與示意重疊、前內外踝動脈穿骨、右腓靜脈較長。本盤點新增的差異：

1. 該文件寫「跟骨支：有」，但來源網格 FJ2091／FJ2195 已隔離（位置在大腿上段），實際上缺（4.5）。
2. 該文件寫脛後靜脈「兩條夾著動脈」為「有」，模型每側只有一條，距動脈 10–12 mm。
3. 該文件把穿動脈寫成「有（Set、Distal）」；量測顯示 FJ2094／FJ2203 是 345–358 mm 的長條，不是穿支。
4. 該文件未列 FJ2093／FJ2197（疑似腓動脈的圖譜版本）與 FJ2190（腓靜脈錯位）。
5. 該文件的血管路徑資料檔與本文的血管樹應共用血管 id，由血管樹提供形狀、路徑檔提供動畫，避免兩處各寫一份。

## 11. Decisions needed from you
## 11. 需要使用者決定的問題

1. **出處行與參考資料**：示意結構的資訊卡出處行目前寫著所引用的教科書書名與版次（全專案示意結構資料 460 筆，出處欄大多如此，下肢血管也在內）。依你的規則只可用 Gray's Anatomy 1918 與 OpenStax，這些出處行要不要改成只寫「示意模型，位置依標誌量測」？
2. FJ2093／FJ2197（足背趾動脈組，長 350 mm 沿小腿後區）是否視為腓動脈的圖譜版本？若是，重建時用它取代示意腓動脈還是廢棄？
3. 臀大肌表面的靜脈碎段：我只量到 3 個 3–6 頂點小碎片；請指出畫面上看到的位置（左或右、從哪個角度）。
4. 「兩條伴行靜脈夾著動脈」是否要做在脛前、脛後、腓三處（網格數會倍增）？
5. 清單缺項（旋髂深、閉孔、跗內側、蹠背、膝動脈網、足底內側靜脈、大隱屬支）是否全部要補？膝動脈網是否用膝動脈之間的小吻合支表示？
6. 是否允許我只檢視 BodyParts3D 3.0、Z-Anatomy、Human Reference Atlas 的**檔案清單**（不下載模型），以查缺項有無現成資料？
7. 重建後左右是否要求完全鏡射？（現況：髂靜脈左右網格數不同，左右股動脈口徑不同。）
8. 盤點用的臨界值（穿骨 12 mm、間隙半個管徑）是否合適？

## Appendix A. Per-mesh measurements
## 附錄 A：逐網格量測

欄位：編號、名稱、側、來源、中心線長 mm、環距 mm、半徑 mm（起／中／末）、大片段／全部片數、表面頂點在骨內 %、中心線在骨內 mm（最深 mm）、末端間隙數（加連接件前→後）、最常相鄰的兩條肌肉、最近神經。

| 編號 | 名稱 | 側 | 來源 | 長 | 環距 | 半徑 | 片數 | 骨內 % | 中心線在骨內 | 間隙 | 相鄰肌肉 | 相鄰神經 |
| --- | --- | --- | --- | ---: | ---: | --- | --- | ---: | --- | --- | --- | --- |
| PK-101 | Left anterior lateral malleolar artery | L | 示意 | 70 | 4.4 | 0.6／0.8／0.9 | 1／1 | 68 | 60（6） | 0→0 | Left fibularis tertius、Left tibialis anterior | Deep fibular nerve (left) |
| PK-74 | Right anterior lateral malleolar artery | R | 示意 | 71 | 4.4 | 0.6／0.8／0.9 | 1／1 | 69.9 | 60（6.5） | 0→0 | Right fibularis tertius、Right tibialis anterior | Deep fibular nerve (right) |
| PK-102 | Left anterior medial malleolar artery | L | 示意 | 42 | 3 | 1／0.8／1 | 1／1 | 51.5 | 15（1.8） | 0→0 | Left tibialis anterior、Left tendon of tibialis anterior | Deep fibular nerve (left) |
| PK-75 | Right anterior medial malleolar artery | R | 示意 | 42 | 3 | 1／0.8／1 | 1／1 | 57.3 | 24（2.1） | 0→0 | Right tibialis anterior、Right tendon of tibialis anterior | Deep fibular nerve (right) |
| FJ2065 | Left anterior tibial artery | L | 圖譜 | 343 | 6.5 | 1.5／2.2／1.9 | 1／1 | 26.7 | 201（11.5） | 6→2 | Left tibialis anterior、Left tibialis posterior | Deep fibular nerve (left) |
| FJ2130 | Right anterior tibial artery | R | 圖譜 | 342 | 6 | 2.2／1.9／1.8 | 1／1 | 26.8 | 219（9.5） | 7→3 | Right tibialis anterior、Right tibialis posterior | Deep fibular nerve (right) |
| FJ2066 | Left anterior tibial recurrent artery | L | 圖譜 | 184 | 6.1 | 2.2／1.7／1.7 | 1／24 | 4.5 | 0（0） | 9→5 | Left vastus lateralis、Left iliotibial tract | Infrapatellar branch of saphenous nerve (left) |
| FJ2131 | Right anterior tibial recurrent artery | R | 圖譜 | 188 | 5.9 | 1.7／1.7／1.6 | 2／40 | 6.3 | 0（0） | 6→0 | Right rectus femoris、Right iliotibial tract | Infrapatellar branch of saphenous nerve (right) |
| FJ2097 | Left anterior tibial vein | L | 圖譜 | 176 | 5.7 | 2／1.5／1.8 | 1／2 | 0 | 0（0） | 6→1 | Left iliotibial tract、Left vastus lateralis | Infrapatellar branch of saphenous nerve (left) |
| FJ2183 | Left anterior tibial vein | L | 圖譜 | 306 | 6 | 1.6／2.2／2.2 | 1／1 | 0.4 | 0（0） | 3→1 | Left tibialis anterior、Left tendon of tibialis anterior | Deep fibular nerve (left) |
| FJ2132 | Right anterior tibial vein | R | 圖譜 | 178 | 5.4 | 1.1／1.9／1.9 | 1／1 | 0 | 0（0） | 6→5 | Right iliotibial tract、Right vastus lateralis | Infrapatellar branch of saphenous nerve (right) |
| FJ2193 | Right anterior tibial vein | R | 圖譜 | 315 | 5.9 | 2.3／2.2／1.7 | 1／1 | 1.3 | 0（0） | 8→2 | Right tibialis anterior、Right extensor digitorum longus | Deep fibular nerve (right) |
| FJ2067 | Left arcuate artery | L | 圖譜 | 63 | 4.2 | 1.5／1.9／0.8 | 1／1 | 12 | 15（1.3） | 4→2 | Left extensor digitorum brevis、Left tendon of fibularis tertius | Intermediate dorsal cutaneous nerve of foot (left) |
| FJ2133 | Right arcuate artery | R | 圖譜 | 61 | 4.1 | 1.1／2／1.7 | 1／1 | 11.9 | 12（0.7） | 3→1 | Right extensor digitorum brevis、Right extensor hallucis longus | Intermediate dorsal cutaneous nerve of foot (right) |
| PK-99 | Left articular branch of descending genicular artery | L | 示意 | 58 | 3.4 | 0.7／0.7／0.9 | 1／1 | 0 | 0（0） | 1→1 | Left vastus medialis、Left adductor magnus | Anterior cutaneous branches of femoral nerve (left) |
| PK-72 | Right articular branch of descending genicular artery | R | 示意 | 58 | 3.4 | 0.7／0.7／0.9 | 1／1 | 0 | 0（0） | 1→1 | Right vastus medialis、Right adductor magnus | Anterior cutaneous branches of femoral nerve (right) |
| PK-94 | Left ascending branch of lateral circumflex femoral artery | L | 示意 | 123 | 5.9 | 0.8／1.1／1.1 | 1／1 | 0 | 0（0） | 0→0 | Left iliacus、Left sartorius | Lateral femoral cutaneous nerve (left) |
| PK-67 | Right ascending branch of lateral circumflex femoral artery | R | 示意 | 124 | 6.2 | 0.8／1.1／1.3 | 1／1 | 0 | 0（0） | 0→0 | Right iliacus、Right sartorius | Lateral femoral cutaneous nerve (right) |
| PK-104 | Left circumflex fibular artery | L | 示意 | 41 | 2.9 | 0.8／0.9／1 | 1／1 | 24.8 | 12（3.2） | 0→0 | Left soleus、Left extensor digitorum longus | Tibial nerve (left) |
| PK-77 | Right circumflex fibular artery | R | 示意 | 39 | 3 | 0.8／0.9／1.2 | 1／1 | 26.2 | 12（4.2） | 0→0 | Right soleus、Right fibularis longus | Deep fibular nerve (right) |
| FJ3464 | Left common iliac artery | L | 圖譜 | 89 | 9.8 | 2.9／3／3.1 | 1／1 | 0 | 0（0） | 0→0 | Left psoas major | Genital branch of genitofemoral nerve (left) |
| FJ3565 | Right common iliac artery | R | 圖譜 | 81 | 11.5 | 4.4／3／3 | 1／1 | 0 | 0（0） | 0→0 | Right psoas major、Left psoas major | Genital branch of genitofemoral nerve (right) |
| FJ3465 | Left common iliac vein | L | 圖譜 | 90 | 10 | 2.9／2.3／3.6 | 2／4 | 3 | 12（0.8） | 0→0 | Left psoas major、Right psoas major | Nerve to quadratus femoris muscle (left) |
| FJ3566 | Right common iliac vein | R | 圖譜 | 75 | 10.8 | 4.1／2.4／4.3 | 1／3 | 0 | 0（0） | 0→0 | Right psoas major | Nerve to quadratus femoris muscle (right) |
| PK-108 | Left deep branch of superior gluteal artery | L | 示意 | 59 | 3.9 | 1.5／1.8／2.1 | 1／1 | 4.8 | 9（0.3） | 0→1 | Left gluteus medius | Superior gluteal nerve (left) |
| PK-81 | Right deep branch of superior gluteal artery | R | 示意 | 59 | 3.9 | 1.5／1.8／2.1 | 1／1 | 4.3 | 0（0） | 0→0 | Right gluteus medius | Superior gluteal nerve (right) |
| PK-98 | Left deep external pudendal artery | L | 示意 | 115 | 6.8 | 0.5／0.7／1.1 | 1／1 | 0 | 0（0） | 0→0 | Left adductor magnus、Left adductor minimus | Pudendal nerve (left) |
| PK-71 | Right deep external pudendal artery | R | 示意 | 115 | 6.7 | 0.5／0.7／1.1 | 1／1 | 0 | 0（0） | 0→0 | Right adductor magnus、Right adductor longus | Pudendal nerve (right) |
| PK-91 | Left deep femoral artery | L | 示意 | 252 | 8.1 | 1.9／2.4／2.6 | 1／1 | 0 | 0（0） | 6→0 | Left adductor longus、Left pectineus | Left nerve to vastus medialis |
| PK-64 | Right deep femoral artery | R | 示意 | 241 | 9.3 | 2.2／2.7／2.8 | 1／1 | 0 | 0（0） | 7→0 | Right adductor longus、Right pectineus | Right nerve to vastus medialis |
| FJ2099 | Left deep femoral vein | L | 圖譜 | 348 | 7.6 | 2.8／2.3／1.6 | 1／1 | 0 | 0（0） | 4→0 | Left vastus medialis、Left pectineus | Left nerve to vastus medialis |
| FJ2135 | Right deep femoral vein | R | 圖譜 | 353 | 8 | 2.1／2.4／2.7 | 1／1 | 0 | 0（0） | 7→2 | Right vastus medialis、Right pectineus | Right nerve to vastus medialis |
| FJ2068 | Left deep plantar artery | L | 圖譜 | 26 | 3.8 | 1.1／1.4／0.8 | 1／1 | 5.8 | 0（0） | 0→0 | Left extensor hallucis brevis、Oblique head of left adductor hallucis | Left medial branch of deep fibular nerve |
| FJ2136 | Right deep plantar artery | R | 圖譜 | 27 | 3.8 | 0.8／1.5／1 | 1／1 | 7.2 | 0（0） | 1→0 | Oblique head of right adductor hallucis、Right extensor hallucis brevis | Intermediate dorsal cutaneous nerve of foot (right) |
| FJ2063 | Descending branch of left lateral circumflex femoral artery | L | 圖譜 | 388 | 10.8 | 1.9／2.1／1.7 | 1／1 | 14.2 | 69（2.5） | 1→0 | Left vastus intermedius、Left vastus lateralis | Lateral femoral cutaneous nerve (left) |
| FJ2057 | Descending branch of right lateral circumflex femoral artery | R | 圖譜 | 386 | 10.7 | 1.7／1.6／1.6 | 1／1 | 14.2 | 81（2.3） | 6→2 | Right vastus intermedius、Right vastus lateralis | Lateral femoral cutaneous nerve (right) |
| FJ2069 | Left descending genicular artery | L | 圖譜 | 157 | 4.6 | 2／2／1.9 | 1／4 | 4.2 | 3（0.7） | 9→1 | Left adductor magnus、Left vastus medialis | Saphenous nerve (left) |
| FJ2137 | Right descending genicular artery | R | 圖譜 | 155 | 4.8 | 2.1／2／1.7 | 1／14 | 5 | 3（0.3） | 11→0 | Right sartorius、Right vastus medialis | Saphenous nerve (right) |
| FJ2064 | Distal perforating artery | L | 圖譜 | 14 | 4.6 | 0.7／1／0.8 | 4／5 | 0 | 0（0） | 1→0 | Oblique head of left adductor hallucis、Left extensor hallucis brevis | Proper plantar digital branches of medial plantar nerve (left) |
| FJ2058 | Distal perforating artery | R | 圖譜 | 11 | 3.6 | 0.7／0.4／1.5 | 4／4 | 0 | 0（0） | 0→0 | Transverse head of right adductor hallucis、Third plantar interosseous of right foot | Right lateral dorsal cutaneous nerve |
| FJ2072 | Dorsal digital artery of foot | L | 圖譜 | 104 | 7 | 2.6／1.7／1.9 | 5／13 | 2 | 0（0） | 0→0 | Opponens digiti minimi of left foot、Left extensor digitorum longus | Sural nerve (left) |
| FJ2141 | Dorsal digital artery of foot | R | 圖譜 | 106 | 5.9 | 2.2／1.1／0.5 | 5／17 | 2.2 | 0（0） | 0→0 | Opponens digiti minimi of right foot、Right extensor digitorum longus | Sural nerve (right) |
| FJ2186 | Left dorsal metatarsal vein | L | 圖譜 | 49 | 5.4 | 1.4／2.1／1.6 | 5／5 | 0 | 0（0） | 2→1 | Left extensor hallucis brevis、Left extensor digitorum brevis | Dorsal digital branches of superficial fibular nerve (left) |
| FJ2199 | Right dorsal metatarsal vein | R | 圖譜 | 59 | 9.8 | 0.5／1.4／0.4 | 5／5 | 0 | 0（0） | 0→0 | Right extensor digitorum longus | Sural nerve (right) |
| FJ2059 | Dorsal venous arch of left foot | L | 圖譜 | 92 | 5.1 | 1.9／1.8／1.7 | 1／1 | 0 | 0（0） | 4→1 | Left extensor digitorum longus、Left extensor digitorum brevis | Intermediate dorsal cutaneous nerve of foot (left) |
| FJ2060 | Dorsal venous arch of left foot | L | 圖譜 | 44 | 3.4 | 0.8／1.2／1 | 1／2 | 9.4 | 6（0.7） | 0→0 | Oblique head of left adductor hallucis、Left extensor hallucis brevis | Left lateral branch of deep fibular nerve |
| FJ2061 | Dorsal venous arch of right foot | R | 圖譜 | 90 | 4.8 | 1.4／1.9／1.8 | 1／1 | 0 | 0（0） | 4→0 | Right extensor digitorum longus、Right extensor digitorum brevis | Intermediate dorsal cutaneous nerve of foot (right) |
| FJ2062 | Dorsal venous arch of right foot | R | 圖譜 | 43 | 3.6 | 0.9／1.3／1 | 1／1 | 8.7 | 3（0） | 0→0 | Oblique head of right adductor hallucis、Right extensor hallucis brevis | Right lateral branch of deep fibular nerve |
| FJ2073 | Left dorsalis pedis artery | L | 圖譜 | 73 | 5.6 | 1.4／2.4／1.9 | 1／1 | 22.8 | 3（1） | 2→0 | Left extensor hallucis longus、Left tendon of tibialis anterior | Medial dorsal cutaneous nerve of foot (left) |
| FJ2055 | Right dorsalis pedis artery | R | 圖譜 | 69 | 6.9 | 2.5／2.3／1.5 | 1／1 | 20.1 | 3（1.1） | 3→0 | Right extensor hallucis longus、Right tibialis anterior | Medial dorsal cutaneous nerve of foot (right) |
| FJ3466 | Left external iliac artery | L | 圖譜 | 166 | 7.9 | 1.9／2.8／2 | 1／1 | 1.8 | 0（0） | 3→3 | Left psoas major、Left external oblique | Obturator nerve (left) |
| FJ3567 | Right external iliac artery | R | 圖譜 | 156 | 7.8 | 2.5／3.3／2.2 | 1／1 | 1.6 | 0（0） | 1→1 | Right psoas major、Right external oblique | Obturator nerve (right) |
| FJ3484 | Left external iliac vein | L | 圖譜 | 155 | 9.7 | 3.7／3.1／3.8 | 2／2 | 0 | 0（0） | 3→2 | Left psoas major、Left obturator internus | Genital branch of genitofemoral nerve (left) |
| FJ3522 | Left external iliac vein | L | 圖譜 | 39 | 7.8 | 2.4／2.7／2.2 | 1／1 | 8.2 | 9（2.4） | 0→0 | Left psoas major | Anterior root of posterior femoral cutaneous nerve (left) |
| FJ3523 | Left external iliac vein | L | 圖譜 | 28 | 5.6 | 2.2／2.2／2.2 | 1／1 | 0 | 0（0） | 1→1 | Left piriformis | Anterior root of posterior femoral cutaneous nerve (left) |
| FJ3524 | Left external iliac vein | L | 圖譜 | 27 | 5.3 | 3.6／1.7／3.4 | 1／5 | 6.9 | 0（0） | 1→1 | Left piriformis | Posterior root of posterior femoral cutaneous nerve (left) |
| FJ3568 | Right external iliac vein | R | 圖譜 | 162 | 8.1 | 3.1／3／3.3 | 1／4 | 0 | 0（0） | 2→0 | Right psoas major、Right obturator internus | Obturator nerve (right) |
| FJ2074 | Left femoral artery | L | 圖譜 | 380 | 31.6 | 3／1.9／3.2 | 1／1 | 0.9 | 0（0） | 0→0 | Left adductor longus、Left adductor magnus | Anterior branch of obturator nerve (left) |
| PKC-320 | Left femoral artery | L | 示意 | 3 | 1.4 | 1.3／1.1／0.8 | 1／1 | 0 | 0（0） | 1→0 | Left psoas major | Genital branch of genitofemoral nerve (left) |
| FJ2143 | Right femoral artery | R | 圖譜 | 381 | 22.4 | 3.2／1.7／3.2 | 1／1 | 0.9 | 0（0） | 0→0 | Right adductor longus、Right pectineus | Anterior branch of obturator nerve (right) |
| FJ2102 | Left femoral vein | L | 圖譜 | 339 | 30.8 | 2.6／1.7／3.1 | 1／1 | 5.2 | 0（0） | 0→0 | Left adductor longus、Left adductor magnus | Anterior branch of obturator nerve (left) |
| FJ2144 | Right femoral vein | R | 圖譜 | 336 | 33.6 | 3.8／1.6／2.8 | 1／1 | 6.5 | 9（1.9） | 0→0 | Right adductor longus、Right adductor magnus | Anterior branch of obturator nerve (right) |
| PK-103 | Left fibular artery | L | 示意 | 313 | 9.8 | 1.7／1.3／1.9 | 1／1 | 24.7 | 93（3.3） | 4→0 | Left tibialis posterior、Left flexor hallucis longus | Tibial nerve (left) |
| PK-76 | Right fibular artery | R | 示意 | 319 | 10.3 | 2.2／1.6／2.1 | 1／1 | 37.8 | 147（5.6） | 1→0 | Right flexor hallucis longus、Right tibialis posterior | Superficial fibular nerve (right) |
| FJ2184 | Left fibular vein | L | 圖譜 | 13 | 2.7 | 1.4／0.8／0.7 | 2／2 | 31.7 | 9（5） | 0→0 | Left fibularis longus、Left plantaris | Lateral plantar nerve (left) |
| FJ2187 | Left fibular vein | L | 圖譜 | 339 | 6.6 | 2／2／1.7 | 1／11 | 0 | 0（0） | 8→2 | Left soleus、Left flexor hallucis longus | Tibial nerve (left) |
| FJ2190 | Left fibular vein | L | 圖譜 | 24 | 4.8 | 1.7／1.5／2.5 | 4／4 | 0 | 0（0） | 0→0 | Left sartorius、Left rectus femoris | Left nerve to vastus medialis |
| FJ2194 | Right fibular vein | R | 圖譜 | 19 | 3.2 | 0.9／0.9／1.2 | 2／2 | 28.5 | 0（0） | 0→0 | Right plantaris、Right flexor digitorum longus | Tibial nerve (right) |
| FJ2200 | Right fibular vein | R | 圖譜 | 350 | 6.6 | 2.2／1.8／1.4 | 2／18 | 0 | 0（0） | 5→4 | Right soleus、Right fibularis longus | Tibial nerve (right) |
| FJ2107 | Left genicular vein | L | 圖譜 | 84 | 4.7 | 1.8／1.9／2 | 1／1 | 0 | 0（0） | 6→1 | Left iliotibial tract、Left popliteus | Common fibular nerve (left) |
| FJ2108 | Left genicular vein | L | 圖譜 | 119 | 4.3 | 1.5／1.4／1.3 | 1／1 | 10.5 | 12（0.6） | 4→2 | Left semitendinosus、Left rectus femoris | Saphenous nerve (left) |
| FJ2124 | Left genicular vein | L | 圖譜 | 85 | 3.9 | 1.2／1.8／1.8 | 1／3 | 4.2 | 3（0.1） | 4→1 | Left vastus lateralis、Left plantaris | Tibial nerve (left) |
| FJ2125 | Left genicular vein | L | 圖譜 | 95 | 4.1 | 2.9／1.5／1.7 | 2／4 | 0.8 | 0（0） | 2→1 | Left adductor magnus、Short head of left biceps femoris | Saphenous nerve (left) |
| FJ2151 | Right genicular vein | R | 圖譜 | 85 | 4.5 | 1.9／1.8／1.5 | 1／4 | 0 | 0（0） | 4→2 | Right iliotibial tract、Right popliteus | Common fibular nerve (right) |
| FJ2153 | Right genicular vein | R | 圖譜 | 116 | 4.8 | 1.9／1.7／1.2 | 1／1 | 12.1 | 18（0.5） | 5→4 | Right semitendinosus、Right iliotibial tract | Infrapatellar branch of saphenous nerve (right) |
| FJ2181 | Right genicular vein | R | 圖譜 | 86 | 4.1 | 2.4／1.7／0.9 | 1／2 | 3.2 | 6（0.2） | 2→0 | Right plantaris、Right vastus lateralis | Tibial nerve (right) |
| FJ2182 | Right genicular vein | R | 圖譜 | 96 | 4 | 2.1／1.5／2.4 | 1／6 | 0.7 | 0（0） | 6→2 | Right adductor magnus、Right sartorius | Saphenous nerve (right) |
| FJ2103 | Left great saphenous vein | L | 圖譜 | 900 | 7.6 | 1.9／1.9／2.2 | 1／18 | 0 | 0（0） | 5→0 | Left gracilis、Medial head of left gastrocnemius | Saphenous nerve (left) |
| FJ2145 | Right great saphenous vein | R | 圖譜 | 893 | 7.7 | 2／2／1.6 | 1／13 | 0 | 0（0） | 3→0 | Right gracilis、Medial head of right gastrocnemius | Saphenous nerve (right) |
| FJ3511 | Left inferior epigastric artery | L | 圖譜 | 225 | 5.5 | 1／1.8／1.3 | 1／1 | 0 | 0（0） | 7→1 | Left transversus abdominis、Left rectus abdominis | Genital branch of genitofemoral nerve (left) |
| FJ3604 | Right inferior epigastric artery | R | 圖譜 | 226 | 4.9 | 1.9／1.7／0.9 | 1／1 | 0 | 0（0） | 8→1 | Right transversus abdominis、Right rectus abdominis | Genital branch of genitofemoral nerve (right) |
| FJ3512 | Left inferior epigastric vein | L | 圖譜 | 229 | 5 | 1.1／1.8／1.9 | 1／1 | 0 | 0（0） | 8→4 | Left transversus abdominis、Left rectus abdominis | Genital branch of genitofemoral nerve (left) |
| FJ3605 | Right inferior epigastric vein | R | 圖譜 | 228 | 5.1 | 1.7／1.6／1.2 | 1／1 | 0 | 0（0） | 4→2 | Right transversus abdominis、Right rectus abdominis | Genital branch of genitofemoral nerve (right) |
| PK-109 | Left inferior gluteal artery | L | 示意 | 89 | 4 | 1.9／2.2／2.7 | 1／1 | 0 | 0（0） | 0→0 | Left piriformis、Left gluteus maximus | Posterior root of posterior femoral cutaneous nerve (left) |
| PK-82 | Right inferior gluteal artery | R | 示意 | 72 | 3.6 | 1.7／2.2／2.2 | 1／1 | 2.8 | 0（0） | 0→0 | Right piriformis、Right gluteus maximus | Right nerve to obturator internus |
| FJ3513 | Left inferior gluteal vein | L | 圖譜 | 175 | 5.3 | 1.5／1.7／2.1 | 1／1 | 0 | 3（1.6） | 10→2 | Left gluteus maximus、Left piriformis | Left inferior gluteal nerve |
| FJ3606 | Right inferior gluteal vein | R | 圖譜 | 176 | 5.2 | 2.2／1.8／1.6 | 1／1 | 0 | 0（0） | 14→4 | Right gluteus maximus、Right piriformis | Right nerve to obturator internus |
| FJ2076 | Left inferior lateral genicular artery | L | 圖譜 | 95 | 4.1 | 1.8／1.7／1.3 | 1／1 | 3.1 | 0（0） | 3→2 | Left popliteus、Left iliotibial tract | Common fibular nerve (left) |
| FJ2150 | Right inferior lateral genicular artery | R | 圖譜 | 94 | 4.3 | 1.3／1.9／1.8 | 1／1 | 2.3 | 0（0） | 3→0 | Right popliteus、Right iliotibial tract | Common fibular nerve (right) |
| FJ2077 | Left inferior medial genicular artery | L | 圖譜 | 93 | 3.7 | 1.5／1.8／1.9 | 1／1 | 17.2 | 9（1.3） | 7→1 | Left popliteus、Left gracilis | Saphenous nerve (left) |
| FJ2152 | Right inferior medial genicular artery | R | 圖譜 | 92 | 4 | 2.1／1.5／2 | 1／1 | 16.5 | 6（1.5） | 3→0 | Right popliteus、Right gracilis | Saphenous nerve (right) |
| FJ3468 | Left internal iliac artery | L | 圖譜 | 118 | 7.8 | 1.2／2.7／2.8 | 1／5 | 6.8 | 9（2.7） | 3→2 | Left piriformis、Left psoas major | Posterior root of posterior femoral cutaneous nerve (left) |
| FJ3569 | Right internal iliac artery | R | 圖譜 | 106 | 7.1 | 1.9／2／2.6 | 1／5 | 0 | 0（0） | 2→1 | Right piriformis、Right psoas major | Posterior root of posterior femoral cutaneous nerve (right) |
| FJ3469 | Left internal iliac vein | L | 圖譜 | 84 | 9.4 | 2.6／2.7／2.2 | 1／3 | 15.5 | 0（0） | 0→0 | Left piriformis、Left psoas major | Posterior root of posterior femoral cutaneous nerve (left) |
| FJ3470 | Left internal iliac vein | L | 圖譜 | 70 | 8.8 | 2.1／2.1／1.3 | 1／2 | 11.4 | 6（2.4） | 1→0 | Left piriformis、Left gluteus maximus | Posterior root of posterior femoral cutaneous nerve (left) |
| FJ3471 | Left internal iliac vein | L | 圖譜 | 78 | 13.1 | 2.5／2.7／1.4 | 1／6 | 2.3 | 3（0.4） | 3→2 | Left gluteus maximus、Left piriformis | Pudendal nerve (left) |
| FJ3570 | Right internal iliac vein | R | 圖譜 | 82 | 10.3 | 2.4／2.3／3.6 | 1／5 | 0 | 0（0） | 0→0 | Right piriformis、Right psoas major | Posterior root of posterior femoral cutaneous nerve (right) |
| FJ3571 | Right internal iliac vein | R | 圖譜 | 75 | 6.8 | 1.7／1.6／1.5 | 1／1 | 14 | 9（3.2） | 2→0 | Right piriformis、Right gluteus maximus | Posterior root of posterior femoral cutaneous nerve (right) |
| FJ3572 | Right internal iliac vein | R | 圖譜 | 86 | 7.8 | 1.1／2.3／2.6 | 1／4 | 0 | 0（0） | 1→0 | Right coccygeus、Right gluteus maximus | Pudendal nerve (right) |
| FJ3607 | Right internal iliac vein | R | 圖譜 | 40 | 7.9 | 3.4／2.3／2.6 | 3／4 | 0 | 0（0） | 0→0 | Right psoas major | Nerve to quadratus femoris muscle (right) |
| FJ3608 | Right internal iliac vein | R | 圖譜 | 34 | 4.8 | 2／2.1／2.3 | 1／1 | 0 | 0（0） | 0→0 | Right psoas major | Anterior root of posterior femoral cutaneous nerve (right) |
| FJ3609 | Right internal iliac vein | R | 圖譜 | 23 | 11.6 | 2.5／3／4.4 | 1／5 | 0 | 0（0） | 0→0 | Right piriformis、Right psoas major | Anterior root of posterior femoral cutaneous nerve (right) |
| PK-110 | Left internal pudendal artery | L | 示意 | 133 | 4.8 | 1.4／1.7／2 | 1／1 | 14.8 | 6（0.2） | 0→0 | Left piriformis、Left gemellus superior | Left nerve to obturator internus |
| PK-83 | Right internal pudendal artery | R | 示意 | 116 | 4.3 | 1.4／1.7／2.2 | 1／1 | 15.1 | 6（1.4） | 0→0 | Right gemellus superior、Right piriformis | Right nerve to obturator internus |
| FJ3525 | Left internal pudendal vein | L | 圖譜 | 174 | 4.1 | 1.8／1.7／1.8 | 1／7 | 0 | 0（0） | 11→3 | Left puborectalis、Left piriformis | Pudendal nerve (left) |
| FJ3610 | Right internal pudendal vein | R | 圖譜 | 185 | 4.5 | 2.1／1.7／1.8 | 1／5 | 0 | 0（0） | 9→2 | Right puborectalis、Right piriformis | Pudendal nerve (right) |
| FJ2078 | Left lateral circumflex femoral artery | L | 圖譜 | 99 | 5.2 | 1／1.3／1.6 | 1／1 | 29.2 | 36（1.3） | 0→0 | Left obturator externus、Left psoas major | Nerve to quadratus femoris muscle (left) |
| PKC-322 | Left lateral circumflex femoral artery | L | 示意 | 24 | 3 | 1.1／1.1／0.8 | 1／1 | 0 | 0（0） | 0→0 | Left pectineus | Anterior cutaneous branches of femoral nerve (left) |
| FJ2158 | Right lateral circumflex femoral artery | R | 圖譜 | 100 | 4.8 | 1.1／1.3／0.9 | 1／1 | 27 | 33（1.4） | 1→0 | Right psoas major、Right obturator externus | Nerve to quadratus femoris muscle (right) |
| PKC-321 | Right lateral circumflex femoral artery | R | 示意 | 20 | 2.8 | 1／1.1／0.7 | 1／1 | 0 | 0（0） | 0→0 | Right pectineus | Anterior cutaneous branches of femoral nerve (right) |
| FJ2188 | Left lateral circumflex femoral vein | L | 圖譜 | 202 | 6.3 | 1.5／2／1.6 | 1／3 | 2 | 9（0.6） | 3→4 | Left rectus femoris、Left vastus lateralis | Nerve to quadratus femoris muscle (left) |
| FJ2201 | Right lateral circumflex femoral vein | R | 圖譜 | 204 | 6 | 1.4／2／1.6 | 1／3 | 3.2 | 12（1.7） | 5→4 | Right rectus femoris、Right vastus lateralis | Nerve to quadratus femoris muscle (right) |
| FJ2079 | Left lateral plantar artery | L | 圖譜 | 54 | 5.4 | 1.7／1.8／0.8 | 1／1 | 0 | 0（0） | 3→1 | Left flexor accessorius、Flexor digiti minimi brevis of left foot | Lateral plantar nerve (left) |
| FJ2159 | Right lateral plantar artery | R | 圖譜 | 54 | 4.9 | 0.8／2.2／0.6 | 1／1 | 0 | 0（0） | 2→0 | Right flexor accessorius、Flexor digiti minimi brevis of right foot | Lateral plantar nerve (right) |
| PK-105 | Left lateral plantar vein | L | 示意 | 55 | 2.9 | 1.2／1.4／1.5 | 1／1 | 22.4 | 9（1.5） | 2→0 | Left flexor accessorius、Abductor digiti minimi of left foot | Lateral plantar nerve (left) |
| PK-78 | Right lateral plantar vein | R | 示意 | 55 | 2.9 | 1.2／1.4／1.5 | 1／1 | 19.7 | 12（1.6） | 1→0 | Right flexor accessorius、Abductor digiti minimi of right foot | Lateral plantar nerve (right) |
| FJ2080 | Left lateral superior genicular artery | L | 圖譜 | 84 | 5.3 | 1.7／1.7／2 | 1／1 | 19.6 | 27（1.5） | 4→3 | Left plantaris、Left iliotibial tract | Tibial nerve (left) |
| FJ2162 | Right lateral superior genicular artery | R | 圖譜 | 81 | 5.4 | 1.1／1.8／2.1 | 1／1 | 21.1 | 24（1.7） | 4→1 | Right plantaris、Right iliotibial tract | Tibial nerve (right) |
| FJ2081 | Left lateral tarsal artery | L | 圖譜 | 65 | 5.4 | 1.8／1.7／1.3 | 1／1 | 13.4 | 6（0.4） | 3→0 | Left extensor digitorum brevis、Left extensor hallucis brevis | Muscular branches of deep fibular nerve (left) |
| FJ2163 | Right lateral tarsal artery | R | 圖譜 | 64 | 4.9 | 1／1.7／1.8 | 1／1 | 12.6 | 12（0.7） | 5→1 | Right extensor hallucis brevis、Right extensor digitorum brevis | Muscular branches of deep fibular nerve (right) |
| PK-93 | Left medial circumflex femoral artery | L | 示意 | 133 | 4.4 | 1.4／1.7／1.8 | 1／1 | 36.9 | 48（10） | 3→1 | Left pectineus、Left obturator internus | Left nerve to obturator internus |
| PK-66 | Right medial circumflex femoral artery | R | 示意 | 128 | 4.6 | 1.4／1.7／2.3 | 1／1 | 36.4 | 54（14.7） | 2→1 | Right pectineus、Right obturator internus | Right nerve to obturator internus |
| FJ2189 | Left medial circumflex femoral vein | L | 圖譜 | 101 | 5 | 1／1.4／1.1 | 1／1 | 10.8 | 9（5） | 1→0 | Left pectineus、Left psoas major | Nerve to quadratus femoris muscle (left) |
| FJ2202 | Right medial circumflex femoral vein | R | 圖譜 | 99 | 5.2 | 1.1／1.5／1.1 | 1／1 | 8.6 | 9（5.2） | 1→0 | Right pectineus、Right obturator externus | Nerve to quadratus femoris muscle (right) |
| FJ2082 | Left medial plantar artery | L | 圖譜 | 44 | 3.4 | 1.1／1.3／1.4 | 1／2 | 0 | 0（0） | 2→0 | Left flexor hallucis longus、Left tendon of tibialis posterior | Medial plantar nerve (left) |
| FJ2164 | Right medial plantar artery | R | 圖譜 | 43 | 3.9 | 1.7／1.3／1.4 | 1／2 | 0 | 0（0） | 3→0 | Right flexor hallucis longus、Right tendon of tibialis posterior | Medial plantar nerve (right) |
| FJ2083 | Left medial superior genicular artery | L | 圖譜 | 99 | 4.7 | 2.4／1.4／2 | 1／1 | 16.1 | 21（0.7） | 3→0 | Left adductor magnus、Medial head of left gastrocnemius | Saphenous nerve (left) |
| FJ2166 | Right medial superior genicular artery | R | 圖譜 | 104 | 4.9 | 1.9／1.7／1.2 | 1／1 | 18 | 24（0.5） | 2→1 | Right adductor magnus、Right semimembranosus | Saphenous nerve (right) |
| FJ2084 | Left middle genicular artery | L | 圖譜 | 47 | 3.6 | 1.7／1.5／1.2 | 2／10 | 0.5 | 0（0） | 1→0 | Medial head of left gastrocnemius、Left plantaris | Tibial nerve (left) |
| FJ2167 | Right middle genicular artery | R | 圖譜 | 51 | 4.3 | 2.2／2／0.7 | 2／12 | 0.8 | 3（0.1） | 2→0 | Right plantaris、Right popliteus | Common fibular nerve (right) |
| FJ3527 | Left obturator vein | L | 圖譜 | 109 | 3.8 | 1.2／1.6／1.6 | 1／1 | 0 | 0（0） | 5→1 | Left piriformis、Left obturator internus | Nerve to quadratus femoris muscle (left) |
| FJ3612 | Right obturator vein | R | 圖譜 | 110 | 3.8 | 1.9／1.8／0.9 | 2／7 | 7.5 | 6（0.4） | 2→0 | Right obturator internus、Right piriformis | Nerve to quadratus femoris muscle (right) |
| PK-92 | Left perforating branch of deep femoral artery | L | 示意 | 55 | 3.9 | 1.2／1.3／1.9 | 3／3 | 0 | 0（0） | 1→0 | Left pectineus、Left adductor minimus | Nerve to quadratus femoris muscle (left) |
| PK-65 | Right perforating branch of deep femoral artery | R | 示意 | 58 | 5.3 | 1.7／1.4／2.5 | 3／3 | 0 | 0（0） | 0→0 | Right adductor minimus、Right adductor brevis | Nerve to quadratus femoris muscle (right) |
| FJ2085 | Left plantar arch | L | 圖譜 | 70 | 4.4 | 1.4／1.7／1.7 | 1／1 | 9.2 | 3（0.1） | 2→0 | Oblique head of left adductor hallucis、Lateral head of left flexor hallucis brevis | Intermediate dorsal cutaneous nerve of foot (left) |
| FJ2169 | Right plantar arch | R | 圖譜 | 71 | 5.4 | 0.4／1.7／1.3 | 1／1 | 8.2 | 3（0.3） | 2→0 | Oblique head of right adductor hallucis、Lateral head of right flexor hallucis brevis | Common plantar digital branches of lateral plantar nerve (right) |
| FJ2096 | Plantar metatarsal artery | L | 圖譜 | 45 | 6.4 | 0.8／2.2／1.6 | 4／4 | 5.5 | 6（0.2） | 0→0 | Third plantar interosseous of left foot、Fourth lumbrical of left foot | Common plantar digital branches of lateral plantar nerve (left) |
| FJ2206 | Plantar metatarsal artery | R | 圖譜 | 47 | 6.8 | 1.2／1.6／0.5 | 4／4 | 3.3 | 0（0） | 1→0 | Oblique head of right adductor hallucis | Dorsal digital branches of superficial fibular nerve (right) |
| FJ2191 | Plantar metatarsal vein | L | 圖譜 | 60 | 6.7 | 1.1／1.8／1.5 | 4／9 | 0 | 0（0） | 0→0 | Fourth lumbrical of left foot、Third plantar interosseous of left foot | Common plantar digital branches of lateral plantar nerve (left) |
| FJ2207 | Plantar metatarsal vein | R | 圖譜 | 66 | 6.6 | 1.3／2.2／0.5 | 4／12 | 0 | 0（0） | 1→1 | Oblique head of right adductor hallucis、First lumbrical of right foot | Proper plantar digital branches of medial plantar nerve (right) |
| FJ2128 | Plantar venous arch of left foot | L | 圖譜 | 70 | 5.4 | 1.1／1.9／1.2 | 1／1 | 0 | 0（0） | 3→1 | Oblique head of left adductor hallucis、Left abductor hallucis | Common plantar digital branches of lateral plantar nerve (left) |
| FJ2129 | Plantar venous arch of right foot | R | 圖譜 | 69 | 5.3 | 1.8／1.7／1.8 | 1／1 | 0 | 0（0） | 4→0 | Oblique head of right adductor hallucis、Flexor digiti minimi brevis of right foot | Common plantar digital branches of lateral plantar nerve (right) |
| FJ2086 | Left popliteal artery | L | 圖譜 | 230 | 5.1 | 2.3／2.3／2.3 | 1／1 | 6.5 | 33（3.8） | 16→0 | Left plantaris、Left soleus | Tibial nerve (left) |
| FJ2170 | Right popliteal artery | R | 圖譜 | 228 | 5.7 | 2.4／2.5／2.3 | 1／1 | 5.2 | 33（3） | 19→3 | Right plantaris、Right soleus | Tibial nerve (right) |
| FJ2117 | Left popliteal vein | L | 圖譜 | 200 | 5.4 | 2.3／2.3／2.5 | 1／10 | 11.8 | 15（3.1） | 14→3 | Left plantaris、Left adductor magnus | Tibial nerve (left) |
| FJ2171 | Right popliteal vein | R | 圖譜 | 216 | 5.1 | 2.2／2.1／2.7 | 1／8 | 11.3 | 15（3.3） | 16→3 | Right plantaris、Right adductor magnus | Tibial nerve (right) |
| FJ2087 | Left posterior tibial artery | L | 圖譜 | 372 | 7.3 | 1.6／2／3.1 | 1／4 | 0.4 | 0（0） | 7→1 | Left soleus、Left flexor hallucis longus | Tibial nerve (left) |
| FJ2172 | Right posterior tibial artery | R | 圖譜 | 372 | 6.5 | 1.6／2／1.6 | 1／4 | 1.7 | 0（0） | 3→1 | Right soleus、Right flexor hallucis longus | Tibial nerve (right) |
| FJ2118 | Left posterior tibial vein | L | 圖譜 | 396 | 5.9 | 1.7／1.8／2.3 | 2／6 | 0 | 0（0） | 1→0 | Left soleus、Left flexor digitorum longus | Tibial nerve (left) |
| FJ2173 | Right posterior tibial vein | R | 圖譜 | 389 | 6.4 | 2.4／2／1.7 | 2／19 | 0 | 0（0） | 5→1 | Right soleus、Right flexor digitorum longus | Tibial nerve (right) |
| PK-100 | Left saphenous branch of descending genicular artery | L | 示意 | 102 | 4.3 | 0.4／0.7／0.8 | 1／1 | 40.1 | 48（7.3） | 0→0 | Left adductor magnus、Left vastus medialis | Saphenous nerve (left) |
| PK-73 | Right saphenous branch of descending genicular artery | R | 示意 | 102 | 4.3 | 0.4／0.7／0.8 | 1／1 | 17.2 | 27（2.8） | 0→0 | Right adductor magnus、Right gracilis | Saphenous nerve (right) |
| FJ2092 | Set of common plantar digital arteries | L | 圖譜 | 15 | 7.3 | 1.4／2／0.8 | 5／7 | 1.4 | 0（0） | 0→0 | Fourth lumbrical of left foot、Transverse head of left adductor hallucis | Proper plantar digital branches of lateral plantar nerve (left) |
| FJ2196 | Set of common plantar digital arteries | R | 圖譜 | 18 | 4.5 | 1.1／1.5／1.3 | 4／20 | 2.4 | 0（0） | 0→0 | Lateral head of right flexor hallucis brevis、First lumbrical of right foot | Proper plantar digital branches of medial plantar nerve (right) |
| FJ2093 | Set of dorsal digital arteries | L | 圖譜 | 353 | 6.5 | 1.8／1.9／2 | 1／1 | 4.5 | 3（0.7） | 5→1 | Left flexor hallucis longus、Left soleus | Tibial nerve (left) |
| FJ2197 | Set of dorsal digital arteries | R | 圖譜 | 349 | 6.8 | 2.1／2.2／1.5 | 1／1 | 3.6 | 3（0.8） | 3→0 | Right soleus、Right flexor hallucis longus | Tibial nerve (right) |
| FJ2185 | Set of dorsal digital veins | L | 圖譜 | 84 | 4.7 | 1.5／1.1／1 | 6／19 | 0.4 | 3（0.3） | 1→1 | Left extensor hallucis longus、Left flexor hallucis longus | Dorsal digital branches of deep fibular nerve (left) |
| FJ2198 | Set of dorsal digital veins | R | 圖譜 | 37 | 4.7 | 0.9／0.8／0.2 | 6／17 | 1.4 | 0（0） | 0→0 | Right extensor digitorum longus、Right flexor digitorum longus | Sural nerve (right) |
| FJ2090 | Set of perforating arteries | L | 圖譜 | 24 | 7.9 | 2.2／2.9／0.8 | 4／4 | 0 | 0（0） | 0→0 | Left pectineus | Left nerve to vastus medialis |
| FJ2094 | Set of perforating arteries | L | 圖譜 | 358 | 7.5 | 1.6／2.2／2.3 | 1／1 | 0 | 0（0） | 10→1 | Left pectineus、Left adductor longus | Left nerve to vastus medialis |
| FJ2127 | Set of perforating arteries | R | 圖譜 | 15 | 5.1 | 0.8／1.6／1.1 | 4／4 | 1.4 | 0（0） | 0→0 | Right adductor longus、Right vastus medialis | Right nerve to vastus medialis |
| FJ2203 | Set of perforating arteries | R | 圖譜 | 345 | 8.6 | 2／2.3／2.5 | 1／1 | 0 | 0（0） | 7→0 | Right pectineus、Right adductor longus | Right nerve to vastus medialis |
| FJ2100 | Set of perforating veins | L | 圖譜 | 18 | 6.1 | 0.8／1.6／1.3 | 4／4 | 0.3 | 0（0） | 0→0 | Left extensor digitorum brevis、Oblique head of left adductor hallucis | Dorsal digital branches of superficial fibular nerve (left) |
| FJ2119 | Set of perforating veins | L | 圖譜 | 38 | 6.3 | 1.4／1.2／0.7 | 4／21 | 1.8 | 0（0） | 1→1 | Third plantar interosseous of left foot、Left extensor digitorum longus | Left lateral dorsal cutaneous nerve |
| FJ2138 | Set of perforating veins | R | 圖譜 | 21 | 5.3 | 0.9／1.6／0.9 | 4／4 | 0.3 | 0（0） | 1→1 | Third plantar interosseous of right foot、Right extensor digitorum longus | Sural nerve (right) |
| FJ2174 | Set of perforating veins | R | 圖譜 | 38 | 5.5 | 0.9／1／0.7 | 4／29 | 2.4 | 0（0） | 1→1 | Third plantar interosseous of right foot、Right extensor digitorum longus | Right lateral dorsal cutaneous nerve |
| FJ2192 | Set of perforating veins | R | 圖譜 | 15 | 3.8 | 0.8／1.9／1.7 | 4／4 | 0 | 0（0） | 0→0 | Right vastus medialis、Right sartorius | Right nerve to vastus medialis |
| FJ2095 | Set of plantar digital arteries proper | L | 圖譜 | 24 | 11.9 | 0.8／1.3／0.6 | 5／18 | 0 | 0（0） | 0→0 | Second plantar interosseous of left foot、Oblique head of left adductor hallucis | Intermediate dorsal cutaneous nerve of foot (left) |
| FJ2204 | Set of plantar digital arteries proper | R | 圖譜 | 19 | 4.6 | 1.7／1.1／0.8 | 4／45 | 0 | 0（0） | 0→0 | Third plantar interosseous of right foot | Sural nerve (right) |
| FJ2205 | Set of plantar digital arteries proper | R | 圖譜 | 68 | 4.5 | 1.2／1.2／1.4 | 6／20 | 0.4 | 0（0） | 1→0 | Right flexor hallucis longus、Right abductor hallucis | Proper plantar digital branches of medial plantar nerve (right) |
| FJ2120 | Set of plantar digital veins | L | 圖譜 | 101 | 7.2 | 1.3／1.6／1.2 | 6／19 | 0 | 0（0） | 1→0 | Abductor digiti minimi of left foot、Flexor digiti minimi brevis of left foot | Sural nerve (left) |
| FJ2175 | Set of plantar digital veins | R | 圖譜 | 128 | 6.1 | 1.1／1.5／1.6 | 6／22 | 0 | 0（0） | 3→2 | Right abductor hallucis、Right flexor hallucis longus | Proper plantar digital branches of medial plantar nerve (right) |
| FJ2121 | Left small saphenous vein | L | 圖譜 | 519 | 7.9 | 1.8／2／2.3 | 1／1 | 2.2 | 0（0） | 3→2 | Lateral head of left gastrocnemius、Left soleus | Sural nerve (left) |
| FJ2176 | Right small saphenous vein | R | 圖譜 | 524 | 7.4 | 2.3／2.1／1.7 | 1／1 | 1.3 | 0（0） | 5→1 | Lateral head of right gastrocnemius、Right soleus | Sural nerve (right) |
| PK-107 | Left superficial branch of superior gluteal artery | L | 示意 | 57 | 3.4 | 1.4／1.6／1.7 | 1／1 | 17 | 12（0.5） | 0→0 | Left gluteus medius、Left gluteus maximus | Superior gluteal nerve (left) |
| PK-80 | Right superficial branch of superior gluteal artery | R | 示意 | 57 | 3.4 | 1.4／1.6／1.7 | 1／1 | 26.1 | 24（0.5） | 0→0 | Right gluteus medius、Right gluteus maximus | Superior gluteal nerve (right) |
| PK-96 | Left superficial circumflex iliac artery | L | 示意 | 112 | 6.6 | 0.5／0.7／1.2 | 1／1 | 0 | 0（0） | 0→0 | Left external oblique、Left internal oblique | Lateral femoral cutaneous nerve (left) |
| PK-69 | Right superficial circumflex iliac artery | R | 示意 | 108 | 6 | 0.5／0.7／1 | 1／1 | 0 | 0（0） | 0→0 | Right external oblique、Right internal oblique | Lateral femoral cutaneous nerve (right) |
| FJ3529 | Left superficial epigastric artery | L | 圖譜 | 165 | 7.5 | 2.9／1.8／1 | 2／5 | 0 | 0（0） | 1→0 | Left external oblique | Femoral branch of genitofemoral nerve (left) |
| FJ3614 | Right superficial epigastric artery | R | 圖譜 | 176 | 8 | 2.8／2.2／1.6 | 2／5 | 0 | 0（0） | 3→1 | Right external oblique | Femoral branch of genitofemoral nerve (right) |
| FJ2122 | Left superficial epigastric vein | L | 圖譜 | 159 | 7.2 | 2.1／1.7／0.8 | 1／6 | 0 | 0（0） | 0→0 | Left external oblique、Left pyramidalis | Genital branch of genitofemoral nerve (left) |
| FJ2178 | Right superficial epigastric vein | R | 圖譜 | 160 | 8.4 | 3.2／2.1／0.8 | 1／3 | 0 | 0（0） | 0→0 | Right external oblique、Right pyramidalis | Genital branch of genitofemoral nerve (right) |
| PK-97 | Left superficial external pudendal artery | L | 示意 | 115 | 6.4 | 0.5／0.8／0.9 | 1／1 | 0 | 0（0） | 0→0 | Left adductor magnus、Left adductor brevis | Genital branch of genitofemoral nerve (left) |
| PK-70 | Right superficial external pudendal artery | R | 示意 | 113 | 6.6 | 0.5／0.8／0.9 | 1／1 | 0 | 0（0） | 0→0 | Right adductor magnus、Right pectineus | Genital branch of genitofemoral nerve (right) |
| FJ2089 | Left superficial medial plantar artery | L | 圖譜 | 60 | 6 | 1.3／1.7／1.1 | 1／1 | 0 | 0（0） | 1→1 | Left abductor hallucis、Medial head of left flexor hallucis brevis | Common plantar digital branches of medial plantar nerve (left) |
| FJ2179 | Right superficial medial plantar artery | R | 圖譜 | 60 | 6 | 0.8／1.7／1.4 | 1／1 | 0 | 0（0） | 4→2 | Right abductor hallucis、Medial head of right flexor hallucis brevis | Common plantar digital branches of medial plantar nerve |
| PK-106 | Left superior gluteal artery | L | 示意 | 46 | 3.1 | 2.5／2.8／2.4 | 1／1 | 25.8 | 15（2.2） | 4→0 | Left piriformis | Superior gluteal nerve (left) |
| PK-79 | Right superior gluteal artery | R | 示意 | 47 | 3.1 | 2.5／2.8／2.4 | 1／1 | 10.6 | 0（0） | 6→0 | Right piriformis | Superior gluteal nerve (right) |
| FJ3531 | Left superior gluteal vein | L | 圖譜 | 167 | 9.8 | 1／2.3／2.5 | 1／7 | 4.5 | 18（2.5） | 2→0 | Left piriformis、Left gluteus medius | Superior gluteal nerve (left) |
| FJ3616 | Right superior gluteal vein | R | 圖譜 | 175 | 12.5 | 2.4／2.5／2 | 1／5 | 6 | 15（2.4） | 3→0 | Right piriformis、Right gluteus medius | Superior gluteal nerve (right) |
| PK-95 | Left transverse branch of lateral circumflex femoral artery | L | 示意 | 62 | 4.1 | 0.9／1／1.1 | 1／1 | 0 | 0（0） | 0→0 | Left rectus femoris、Left pectineus | Nerve to quadratus femoris muscle (left) |
| PK-68 | Right transverse branch of lateral circumflex femoral artery | R | 示意 | 62 | 4.2 | 0.9／1／1.1 | 1／1 | 0 | 0（0） | 0→0 | Right rectus femoris、Right pectineus | Nerve to quadratus femoris muscle (right) |
| FJ2113 | Tributary of plantar venous arch | L | 圖譜 | 55 | 3.7 | 2.1／1.2／0.8 | 1／1 | 0 | 0（0） | 2→0 | Left flexor accessorius、Left flexor digitorum longus | Lateral plantar nerve (left) |
| FJ2115 | Tributary of plantar venous arch | L | 圖譜 | 43 | 3.9 | 1.2／1.7／1.6 | 2／4 | 0 | 0（0） | 2→0 | Left abductor hallucis、Left flexor digitorum longus | Medial plantar nerve (left) |
| FJ2160 | Tributary of plantar venous arch | R | 圖譜 | 53 | 4.8 | 1／1.8／1.3 | 1／1 | 0 | 0（0） | 0→0 | Right flexor accessorius、Abductor digiti minimi of right foot | Lateral plantar nerve (right) |
| FJ2165 | Tributary of plantar venous arch | R | 圖譜 | 43 | 3.9 | 1.1／1.4／1.6 | 1／2 | 0 | 0（0） | 0→0 | Right flexor digitorum longus、Right flexor hallucis longus | Medial plantar nerve (right) |

## Appendix B. Parent–child pairs
## 附錄 B：上下級對照

| 子血管 | 上一級 | 尖端距離 mm | 貼合距離 mm | 關係來源 |
| --- | --- | ---: | ---: | --- |
| Right external iliac artery | Right common iliac artery | 0.2 | 0 | 分支關係表 |
| Left external iliac artery | Left common iliac artery | 0.3 | 0 | 分支關係表 |
| Right internal iliac artery | Right common iliac artery | 0.7 | 0 | 分支關係表 |
| Left internal iliac artery | Left common iliac artery | 0.9 | 0.1 | 分支關係表 |
| Right femoral artery | Right external iliac artery | — | 0.1 | 分支關係表 |
| Left femoral artery | Left external iliac artery | 0.9 | 0.5 | 分支關係表 |
| Right deep femoral artery | Right femoral artery | 2.9 | 0.2 | 分支關係表 |
| Left deep femoral artery | Left femoral artery | 14.9 | 0.4 | 分支關係表 |
| Right lateral circumflex femoral artery | Right deep femoral artery | 0.6 | 0.3 | 分支關係表 |
| Left lateral circumflex femoral artery | Left deep femoral artery | 0.7 | 0.3 | 分支關係表 |
| Right medial circumflex femoral artery | Right deep femoral artery | 1.2 | 0.6 | 分支關係表 |
| Left medial circumflex femoral artery | Left deep femoral artery | 1.8 | 0 | 分支關係表 |
| Right popliteal artery | Right femoral artery | 3 | 0 | 分支關係表 |
| Left popliteal artery | Left femoral artery | 2.3 | 0 | 分支關係表 |
| Right anterior tibial artery | Right popliteal artery | 1.2 | 0.2 | 分支關係表 |
| Left anterior tibial artery | Left popliteal artery | 1.6 | 0.1 | 分支關係表 |
| Right posterior tibial artery | Right popliteal artery | 1.1 | 0.5 | 分支關係表 |
| Left posterior tibial artery | Left popliteal artery | 1.4 | 0.4 | 分支關係表 |
| Right fibular artery | Right posterior tibial artery | 1.8 | 0.1 | 分支關係表 |
| Left fibular artery | Left posterior tibial artery | 1.2 | 0.2 | 分支關係表 |
| Right dorsalis pedis artery | Right anterior tibial artery | 0.6 | 0 | 分支關係表 |
| Left dorsalis pedis artery | Left anterior tibial artery | 0.6 | 0 | 分支關係表 |
| Right medial plantar artery | Right posterior tibial artery | 0 | 0 | 分支關係表 |
| Left medial plantar artery | Left posterior tibial artery | 0.1 | 0 | 分支關係表 |
| Right lateral plantar artery | Right posterior tibial artery | 0.5 | 0 | 分支關係表 |
| Left lateral plantar artery | Left posterior tibial artery | 0.3 | 0.1 | 分支關係表 |
| Right superior gluteal artery | Right internal iliac artery | 1.8 | 0 | 分支關係表 |
| Left superior gluteal artery | Left internal iliac artery | 2.7 | 0 | 分支關係表 |
| Right inferior gluteal artery | Right internal iliac artery | 1.7 | 1.2 | 分支關係表 |
| Left inferior gluteal artery | Left internal iliac artery | 1.2 | 0.1 | 分支關係表 |
| Right internal pudendal artery | Right internal iliac artery | 2.4 | 0.5 | 分支關係表 |
| Left internal pudendal artery | Left internal iliac artery | 1.9 | 0.3 | 分支關係表 |
| Right descending genicular artery | Right femoral artery | 1.8 | 0.6 | 分支關係表 |
| Left descending genicular artery | Left femoral artery | 0.6 | 0 | 分支關係表 |
| Right perforating branch of deep femoral artery | Right deep femoral artery | 1.6 | 0 | 示意結構的 parent 欄 |
| Right ascending branch of lateral circumflex femoral artery | Right lateral circumflex femoral artery | 0.6 | 0 | 示意結構的 parent 欄 |
| Right transverse branch of lateral circumflex femoral artery | Right lateral circumflex femoral artery | 0 | 0.1 | 示意結構的 parent 欄 |
| Right superficial circumflex iliac artery | Right femoral artery | 0 | 0 | 示意結構的 parent 欄 |
| Right superficial external pudendal artery | Right femoral artery | 0.3 | 0 | 示意結構的 parent 欄 |
| Right deep external pudendal artery | Right femoral artery | 2.2 | 0.1 | 示意結構的 parent 欄 |
| Right articular branch of descending genicular artery | Right descending genicular artery | 0.2 | 0 | 示意結構的 parent 欄 |
| Right saphenous branch of descending genicular artery | Right descending genicular artery | 0.1 | 0 | 示意結構的 parent 欄 |
| Right anterior lateral malleolar artery | Right anterior tibial artery | 1.8 | 0.1 | 示意結構的 parent 欄 |
| Right anterior medial malleolar artery | Right anterior tibial artery | 1.8 | 0 | 示意結構的 parent 欄 |
| Right circumflex fibular artery | Right posterior tibial artery | 0.3 | 0 | 示意結構的 parent 欄 |
| Right lateral plantar vein | Right lateral plantar artery | 3.5 | 0 | 示意結構的 parent 欄 |
| Right superficial branch of superior gluteal artery | Right superior gluteal artery | 0.4 | 0 | 示意結構的 parent 欄 |
| Right deep branch of superior gluteal artery | Right superior gluteal artery | 0.6 | 0 | 示意結構的 parent 欄 |
| Left perforating branch of deep femoral artery | Left deep femoral artery | 1.7 | 0.1 | 示意結構的 parent 欄 |
| Left ascending branch of lateral circumflex femoral artery | Left lateral circumflex femoral artery | 0.4 | 0.1 | 示意結構的 parent 欄 |
| Left transverse branch of lateral circumflex femoral artery | Left lateral circumflex femoral artery | 0 | 0 | 示意結構的 parent 欄 |
| Left superficial circumflex iliac artery | Left femoral artery | 0.5 | 0 | 示意結構的 parent 欄 |
| Left superficial external pudendal artery | Left femoral artery | 0.4 | 0 | 示意結構的 parent 欄 |
| Left deep external pudendal artery | Left femoral artery | 1.4 | 0 | 示意結構的 parent 欄 |
| Left articular branch of descending genicular artery | Left descending genicular artery | 0.3 | 0 | 示意結構的 parent 欄 |
| Left saphenous branch of descending genicular artery | Left descending genicular artery | 0 | 0 | 示意結構的 parent 欄 |
| Left anterior lateral malleolar artery | Left anterior tibial artery | 1.9 | 0.2 | 示意結構的 parent 欄 |
| Left anterior medial malleolar artery | Left anterior tibial artery | 2 | 0 | 示意結構的 parent 欄 |
| Left circumflex fibular artery | Left posterior tibial artery | 0.1 | 0 | 示意結構的 parent 欄 |
| Left lateral plantar vein | Left lateral plantar artery | 3.4 | 0 | 示意結構的 parent 欄 |
| Left superficial branch of superior gluteal artery | Left superior gluteal artery | 0.2 | 0 | 示意結構的 parent 欄 |
| Left deep branch of superior gluteal artery | Left superior gluteal artery | 1.2 | 0 | 示意結構的 parent 欄 |
