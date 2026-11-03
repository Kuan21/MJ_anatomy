# Leg vessel tree, batch 2: popliteal artery and knee arteries
# 下肢血管樹 第 2 批：膕動脈與膝部動脈

由 `node scripts/build-leg-vessels.mjs --write` 產生，資料在 `app/data/vessel-tree/`，檢查是 `scripts/check-leg-vessel-tree.mjs`（已併入 `npm run check`）。新血管與網站現有血管並存，**尚未替換**；全部批次完成並經你審核後一次替換。

## 血管（14 條 × 左右）

| 血管 | 上一級 | 直徑 mm（起→末） | 末端 | 中心線長度 mm |
| --- | --- | --- | --- | --- |
| Descending genicular artery<br>降膝動脈 | 股動脈 | 2.4→1.6 | 分出或延續 | L 162／R 153 |
| Saphenous branch of descending genicular artery<br>降膝動脈隱支 | 降膝動脈 | 1.2→0.7 | 末端（收細） | L 99／R 99 |
| Articular branch of descending genicular artery<br>降膝動脈關節支 | 降膝動脈 | 1.2→0.7 | 末端（收細） | L 54／R 54 |
| Popliteal artery<br>膕動脈 | 股動脈 | 4.4→3.8 | 分出或延續 | L 219／R 222 |
| Superior medial genicular artery<br>膝上內側動脈 | 膕動脈 | 2→0.8 | 末端（收細） | L 114／R 108 |
| Superior lateral genicular artery<br>膝上外側動脈 | 膕動脈 | 2.2→0.8 | 末端（收細） | L 84／R 81 |
| Inferior medial genicular artery<br>膝下內側動脈 | 膕動脈 | 1.8→0.8 | 末端（收細） | L 90／R 93 |
| Inferior lateral genicular artery<br>膝下外側動脈 | 膕動脈 | 1.8→0.8 | 末端（收細） | L 96／R 105 |
| Middle genicular artery<br>膝中動脈 | 膕動脈 | 1.6→0.8 | 末端（收細） | L 45／R 60 |
| Genicular anastomosis, superior arc<br>膝關節動脈網上弧 | 膝上內側動脈，終止於膝上外側動脈 | 0.8→0.8 | 接到另一條血管 | L 90／R 87 |
| Genicular anastomosis, inferior arc<br>膝關節動脈網下弧 | 膝下內側動脈，終止於膝下外側動脈 | 0.8→0.8 | 接到另一條血管 | L 87／R 81 |
| Genicular anastomosis, medial link<br>膝關節動脈網內側連結 | 膝上內側動脈，終止於膝下內側動脈 | 0.8→0.8 | 接到另一條血管 | L 51／R 51 |
| Genicular anastomosis, lateral link<br>膝關節動脈網外側連結 | 膝上外側動脈，終止於膝下外側動脈 | 0.8→0.8 | 接到另一條血管 | L 24／R 24 |
| Anterior tibial recurrent artery<br>脛前返動脈 | 脛前動脈（之後的批次） | 1.6→0.8 | 末端（收細） | L 87／R 84 |

## 建法

1. 每條血管以網站現有網格（圖譜或示意）的中心線為導引，保留位置；沒有可用導引的，依骨與肌網格上量到的標誌另寫路線（示意）。
2. 起點移到上一級的中心線上，子血管一定接在上一級上；吻合支的兩端各接在一條血管上。
3. 中心線被推出骨外（壁離骨面至少 1.2 mm）並避開神經，再平滑；直徑由起端線性遞減到末端，只有標記為末端的血管才收細。

## 資訊卡欄位（由血管樹產生）

### Descending genicular artery｜降膝動脈

- Origin 起點：Femoral artery, in the adductor canal just above the adductor hiatus｜股動脈，在內收肌管內、內收肌裂孔上方
- Course 走向：Runs down in front of the medial side of the knee and splits into a saphenous branch, which accompanies the saphenous nerve, and an articular branch to the knee joint｜沿膝內側前方下行，分為伴隨隱神經的隱支與到膝關節的關節支
- Main branches 主要分支：Saphenous branch of descending genicular artery（降膝動脈隱支）、Articular branch of descending genicular artery（降膝動脈關節支）
- Territory 供應範圍：Medial side of the knee, the skin over it and the knee joint; joins the genicular anastomosis｜膝內側、其表面皮膚與膝關節；參與膝關節動脈網

### Saphenous branch of descending genicular artery｜降膝動脈隱支

- Origin 起點：Descending genicular artery｜降膝動脈
- Course 走向：Accompanies the saphenous nerve down the medial side of the knee and leg, deep to sartorius｜伴隨隱神經，在縫匠肌深面沿膝與小腿內側下行
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Skin and fascia of the medial knee and upper leg｜膝內側與小腿上部的皮膚和筋膜

### Articular branch of descending genicular artery｜降膝動脈關節支

- Origin 起點：Descending genicular artery｜降膝動脈
- Course 走向：Runs in front of the femur, through vastus medialis, to the upper border of the patella｜在股骨前方穿過股內側肌，到髕骨上緣
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Knee joint capsule and the patellar network｜膝關節囊與髕骨周圍動脈網

### Popliteal artery｜膕動脈

- Origin 起點：Femoral artery, at the adductor hiatus｜股動脈，在內收肌裂孔
- Course 走向：Runs down the popliteal fossa as its deepest structure, behind the popliteal vein and the tibial nerve, and divides at the lower border of popliteus into the anterior and posterior tibial arteries｜在膕窩內下行，位於膕靜脈與脛神經的深面（最深層），在膕肌下緣分為脛前動脈與脛後動脈
- Main branches 主要分支：Superior medial genicular artery（膝上內側動脈）、Superior lateral genicular artery（膝上外側動脈）、Inferior medial genicular artery（膝下內側動脈）、Inferior lateral genicular artery（膝下外側動脈）、Middle genicular artery（膝中動脈）
- Territory 供應範圍：Knee joint, the muscles around the knee and, through its terminal branches, the leg and foot｜膝關節、膝周肌肉，並經終支供應小腿與足
- 位置關係：tibial nerve most superficial, then popliteal vein, then artery (deepest)

### Superior medial genicular artery｜膝上內側動脈

- Origin 起點：Popliteal artery｜膕動脈
- Course 走向：Winds forwards above the medial femoral condyle, under the tendon of adductor magnus｜繞過股骨內側髁上方向前，經內收大肌腱深面
- Main branches 主要分支：Genicular anastomosis, superior arc（膝關節動脈網上弧）、Genicular anastomosis, medial link（膝關節動脈網內側連結）
- Territory 供應範圍：Lower end of the femur, vastus medialis and the medial side of the knee joint｜股骨下端、股內側肌與膝關節內側

### Superior lateral genicular artery｜膝上外側動脈

- Origin 起點：Popliteal artery｜膕動脈
- Course 走向：Winds forwards above the lateral femoral condyle, deep to biceps femoris｜繞過股骨外側髁上方向前，經股二頭肌深面
- Main branches 主要分支：Genicular anastomosis, superior arc（膝關節動脈網上弧）、Genicular anastomosis, lateral link（膝關節動脈網外側連結）
- Territory 供應範圍：Lower end of the femur, vastus lateralis and the lateral side of the knee joint｜股骨下端、股外側肌與膝關節外側

### Inferior medial genicular artery｜膝下內側動脈

- Origin 起點：Popliteal artery｜膕動脈
- Course 走向：Runs along the upper border of popliteus, then below the medial tibial condyle, deep to the medial collateral ligament｜沿膕肌上緣，再繞過脛骨內側髁下方，經內側副韌帶深面
- Main branches 主要分支：Genicular anastomosis, inferior arc（膝關節動脈網下弧）、Genicular anastomosis, medial link（膝關節動脈網內側連結）
- Territory 供應範圍：Upper end of the tibia and the medial side of the knee joint｜脛骨上端與膝關節內側

### Inferior lateral genicular artery｜膝下外側動脈

- Origin 起點：Popliteal artery｜膕動脈
- Course 走向：Runs below the lateral tibial condyle, deep to the lateral collateral ligament｜繞過脛骨外側髁下方，經外側副韌帶深面
- Main branches 主要分支：Genicular anastomosis, inferior arc（膝關節動脈網下弧）、Genicular anastomosis, lateral link（膝關節動脈網外側連結）
- Territory 供應範圍：Upper end of the tibia, the fibular head region and the lateral side of the knee joint｜脛骨上端、腓骨頭周圍與膝關節外側

### Middle genicular artery｜膝中動脈

- Origin 起點：Popliteal artery, behind the knee joint｜膕動脈，在膝關節後方
- Course 走向：Pierces the oblique popliteal ligament and enters the intercondylar area of the knee｜穿過膕斜韌帶，進入膝關節的髁間區
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Cruciate ligaments, the synovial membrane and the menisci｜十字韌帶、滑膜與半月板

### Genicular anastomosis, superior arc｜膝關節動脈網上弧

- Origin 起點：Superior medial genicular artery｜膝上內側動脈
- Course 走向：Arches in front of the femur above the patella and ends in the superior lateral genicular artery｜在髕骨上方、股骨前方成弧，連到膝上外側動脈
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Capsule and synovial membrane of the knee; links the genicular arteries into one network around the joint｜膝關節囊與滑膜；把各膝動脈連成環繞關節的動脈網

### Genicular anastomosis, inferior arc｜膝關節動脈網下弧

- Origin 起點：Inferior medial genicular artery｜膝下內側動脈
- Course 走向：Arches below the patella, over the patellar ligament, and ends in the inferior lateral genicular artery｜在髕骨下方、髕韌帶前面成弧，連到膝下外側動脈
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Capsule and synovial membrane of the knee; links the genicular arteries into one network around the joint｜膝關節囊與滑膜；把各膝動脈連成環繞關節的動脈網

### Genicular anastomosis, medial link｜膝關節動脈網內側連結

- Origin 起點：Superior medial genicular artery｜膝上內側動脈
- Course 走向：Runs down the medial side of the knee joint and ends in the inferior medial genicular artery｜沿膝關節內側下行，連到膝下內側動脈
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Capsule and synovial membrane of the knee; links the genicular arteries into one network around the joint｜膝關節囊與滑膜；把各膝動脈連成環繞關節的動脈網

### Genicular anastomosis, lateral link｜膝關節動脈網外側連結

- Origin 起點：Superior lateral genicular artery｜膝上外側動脈
- Course 走向：Runs down the lateral side of the knee joint and ends in the inferior lateral genicular artery｜沿膝關節外側下行，連到膝下外側動脈
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Capsule and synovial membrane of the knee; links the genicular arteries into one network around the joint｜膝關節囊與滑膜；把各膝動脈連成環繞關節的動脈網

### Anterior tibial recurrent artery｜脛前返動脈

- Origin 起點：Anterior tibial artery, just after it reaches the front of the leg｜脛前動脈，剛到小腿前區處
- Course 走向：Climbs through tibialis anterior to the front of the lateral tibial condyle and joins the genicular anastomosis｜穿過脛前肌向上，到脛骨外側髁前方，加入膝關節動脈網
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Tibialis anterior and the front of the knee joint｜脛前肌與膝關節前側

