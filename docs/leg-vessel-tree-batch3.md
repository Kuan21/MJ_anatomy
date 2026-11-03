# Leg vessel tree, batch 3: tibial, fibular and ankle arteries
# 下肢血管樹 第 3 批：脛前、脛後、腓動脈與踝部動脈

由 `node scripts/build-leg-vessels.mjs --write` 產生，資料在 `app/data/vessel-tree/`，檢查是 `scripts/check-leg-vessel-tree.mjs`（已併入 `npm run check`）。新血管與網站現有血管並存，**尚未替換**；全部批次完成並經你審核後一次替換。

## 血管（12 條 × 左右）

| 血管 | 上一級 | 直徑 mm（起→末） | 末端 | 中心線長度 mm |
| --- | --- | --- | --- | --- |
| Anterior tibial artery<br>脛前動脈 | 膕動脈 | 3.4→2.6 | 分出或延續 | L 342／R 324 |
| Anterior medial malleolar artery<br>前內踝動脈 | 脛前動脈 | 1.2→0.6 | 末端（收細） | L 42／R 42 |
| Anterior lateral malleolar artery<br>前外踝動脈 | 脛前動脈 | 1.2→0.6 | 末端（收細） | L 48／R 54 |
| Dorsalis pedis artery<br>足背動脈 | 脛前動脈 | 2.4→1.8 | 分出或延續 | L 69／R 72 |
| Lateral tarsal artery<br>跗外側動脈 | 足背動脈 | 1.4→0.7 | 末端（收細） | L 72／R 69 |
| Medial tarsal arteries<br>跗內側動脈 | 足背動脈 | 1.2→0.6 | 末端（收細） | L 36／R 36 |
| Posterior tibial artery<br>脛後動脈 | 膕動脈 | 3.2→2.2 | 分出或延續 | L 372／R 381 |
| Circumflex fibular artery<br>旋腓動脈 | 脛後動脈 | 1.4→0.7 | 末端（收細） | L 42／R 42 |
| Fibular artery<br>腓動脈 | 脛後動脈 | 2.2→1.4 | 分出或延續 | L 354／R 354 |
| Posterior medial malleolar artery<br>後內踝動脈 | 脛後動脈 | 1→0.5 | 末端（收細） | L 27／R 33 |
| Posterior lateral malleolar artery<br>後外踝動脈 | 腓動脈 | 1→0.5 | 末端（收細） | L 39／R 39 |
| Calcaneal branches of posterior tibial artery<br>脛後動脈跟骨支 | 脛後動脈 | 1.4→0.6 | 末端（收細） | L 51／R 48 |

## 建法

1. 每條血管以網站現有網格（圖譜或示意）的中心線為導引，保留位置；沒有可用導引的，依骨與肌網格上量到的標誌另寫路線（示意）。
2. 起點移到上一級的中心線上，子血管一定接在上一級上；吻合支的兩端各接在一條血管上。
3. 中心線被推出骨外（壁離骨面至少 1.2 mm）並避開神經，再平滑；直徑由起端線性遞減到末端，只有標記為末端的血管才收細。

## 資訊卡欄位（由血管樹產生）

### Anterior tibial artery｜脛前動脈

- Origin 起點：Popliteal artery, at the lower border of popliteus｜膕動脈，在膕肌下緣
- Course 走向：Passes forwards above the interosseous membrane into the anterior compartment, runs down on the membrane between tibialis anterior and extensor hallucis longus (extensor digitorum longus below) with the deep fibular nerve, and continues in front of the ankle as the dorsalis pedis artery｜在骨間膜上緣向前進入小腿前區，沿骨間膜前面下行，位於脛前肌與伸拇長肌之間（下段為伸趾長肌），與腓深神經同行，越過踝前改稱足背動脈
- Main branches 主要分支：Anterior tibial recurrent artery（脛前返動脈）、Dorsalis pedis artery（足背動脈）、Anterior medial malleolar artery（前內踝動脈）、Anterior lateral malleolar artery（前外踝動脈）
- Territory 供應範圍：Muscles of the anterior compartment, the ankle joint and, through the dorsalis pedis artery, the dorsum of the foot｜小腿前區肌肉、踝關節，並經足背動脈供應足背
- 位置關係：deep fibular nerve runs with the artery in the anterior compartment

### Anterior medial malleolar artery｜前內踝動脈

- Origin 起點：Anterior tibial artery, above the ankle｜脛前動脈，踝上方
- Course 走向：Passes behind the tendons of extensor hallucis longus and tibialis anterior to the medial malleolus｜經伸拇長肌腱與脛前肌腱深面，到內踝
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Ankle joint and the skin over the malleolus; joins the malleolar network｜踝關節與踝部皮膚；參與踝動脈網

### Anterior lateral malleolar artery｜前外踝動脈

- Origin 起點：Anterior tibial artery, above the ankle｜脛前動脈，踝上方
- Course 走向：Passes behind the tendons of extensor digitorum longus and fibularis tertius to the lateral malleolus｜經伸趾長肌腱與第三腓骨肌腱深面，到外踝
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Ankle joint and the skin over the malleolus; joins the malleolar network｜踝關節與踝部皮膚；參與踝動脈網

### Dorsalis pedis artery｜足背動脈

- Origin 起點：Anterior tibial artery, in front of the ankle joint｜脛前動脈，踝關節前方
- Course 走向：Runs forwards on the dorsum of the foot lateral to the tendon of extensor hallucis longus, gives the tarsal arteries, and ends by dipping between the first and second metatarsal bones as the deep plantar artery｜在足背沿伸拇長肌腱外側向前，分出跗動脈，終末在第一、二蹠骨之間轉入足底，成為深蹠動脈
- Main branches 主要分支：Lateral tarsal artery（跗外側動脈）、Medial tarsal arteries（跗內側動脈）
- Territory 供應範圍：Dorsum of the foot, the tarsal joints and the first toe cleft｜足背、跗關節與第一趾間

### Lateral tarsal artery｜跗外側動脈

- Origin 起點：Dorsalis pedis artery｜足背動脈
- Course 走向：Runs laterally under extensor digitorum brevis across the tarsus｜在伸趾短肌深面橫過跗骨向外側
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Extensor digitorum brevis and the tarsal joints｜伸趾短肌與跗關節

### Medial tarsal arteries｜跗內側動脈

- Origin 起點：Dorsalis pedis artery｜足背動脈
- Course 走向：Pass medially over the tarsus to the medial border of the foot｜經跗骨表面向內側，到足內側緣
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Medial side of the tarsus and the skin of the medial foot｜跗骨內側與足內側皮膚

### Posterior tibial artery｜脛後動脈

- Origin 起點：Popliteal artery, at the lower border of popliteus｜膕動脈，在膕肌下緣
- Course 走向：Runs down the deep posterior compartment behind tibialis posterior, between flexor digitorum longus and flexor hallucis longus, with the tibial nerve, passes behind the medial malleolus through the tarsal tunnel and divides into the medial and lateral plantar arteries｜在小腿後區深層沿脛後肌後方下行，位於屈趾長肌與屈拇長肌之間，與脛神經同行，經內踝後方的跗隧道，分為足底內側與外側動脈
- Main branches 主要分支：Circumflex fibular artery（旋腓動脈）、Fibular artery（腓動脈）、Posterior medial malleolar artery（後內踝動脈）、Calcaneal branches of posterior tibial artery（脛後動脈跟骨支）
- Territory 供應範圍：Muscles of the posterior and lateral compartments, the tibia, and through its terminal branches the sole of the foot｜小腿後區與外側區肌肉、脛骨，並經終支供應足底
- 位置關係：tibial nerve lateral to the artery in the lower leg

### Circumflex fibular artery｜旋腓動脈

- Origin 起點：Posterior tibial artery, near its origin｜脛後動脈起端附近
- Course 走向：Winds round the neck of the fibula and joins the knee network｜繞過腓骨頸，加入膝部動脈網
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Soleus, fibularis longus and the head of the fibula｜比目魚肌、腓骨長肌與腓骨頭

### Fibular artery｜腓動脈

- Origin 起點：Posterior tibial artery, 2–3 cm below its origin｜脛後動脈，起端下方 2–3 公分
- Course 走向：Runs down beside the fibula deep to flexor hallucis longus and ends behind the lateral malleolus as lateral calcaneal branches｜貼腓骨內側、在屈拇長肌深面下行，終末在外踝後方成為外側跟骨支
- Main branches 主要分支：Posterior lateral malleolar artery（後外踝動脈）
- Territory 供應範圍：Fibula, the lateral and posterior compartment muscles and the lateral ankle｜腓骨、小腿外側與後區肌肉、外踝周圍

### Posterior medial malleolar artery｜後內踝動脈

- Origin 起點：Posterior tibial artery, above the ankle｜脛後動脈，踝上方
- Course 走向：Passes behind the medial malleolus beneath the tendons of the tarsal tunnel｜經內踝後方、跗隧道肌腱深面
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Ankle joint and the skin behind the medial malleolus｜踝關節與內踝後方皮膚

### Posterior lateral malleolar artery｜後外踝動脈

- Origin 起點：Fibular artery, above the ankle｜腓動脈，踝上方
- Course 走向：Passes behind the lateral malleolus deep to the fibularis tendons｜經外踝後方、腓骨肌腱深面
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Ankle joint and the skin behind the lateral malleolus｜踝關節與外踝後方皮膚

### Calcaneal branches of posterior tibial artery｜脛後動脈跟骨支

- Origin 起點：Posterior tibial artery, behind the medial malleolus｜脛後動脈，內踝後方
- Course 走向：Runs to the medial side of the heel｜到足跟內側
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Skin and fat pad of the heel and the calcaneus｜足跟的皮膚、脂肪墊與跟骨

