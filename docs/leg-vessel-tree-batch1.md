# Leg vessel tree, batch 1: femoral artery system
# 下肢血管樹 第 1 批：股動脈系統

由 `node scripts/build-leg-vessels.mjs --write` 產生，資料在 `app/data/vessel-tree/femoral-system.json`，檢查是 `scripts/check-leg-vessel-tree.mjs`（已併入 `npm run check`）。新血管與網站上現有血管並存，**尚未替換**；經你審核整批動脈後一次替換。畫面確認見 PR 說明與截圖，沒有在 3D 畫面確認的部分列在 PR 說明。

## 血管（22 條 × 左右）

| 血管 | 上一級 | 直徑 mm（起→末） | 末端 | 中心線長度 mm |
| --- | --- | --- | --- | --- |
| Common iliac artery<br>髂總動脈 | 腹主動脈 | 6→5.6 | 分出或延續 | L 90／R 84 |
| Internal iliac artery<br>髂內動脈 | 髂總動脈 | 4.6→4 | 分出或延續 | L 51／R 48 |
| External iliac artery<br>髂外動脈 | 髂總動脈 | 5.6→5.2 | 分出或延續 | L 156／R 129 |
| Femoral artery<br>股動脈 | 髂外動脈 | 5.2→4.4 | 分出或延續 | L 360／R 357 |
| Deep femoral artery<br>股深動脈 | 股動脈 | 3.8→2.6 | 分出或延續 | L 252／R 246 |
| Medial circumflex femoral artery<br>旋股內側動脈 | 股深動脈 | 2.8→1.6 | 末端（收細） | L 105／R 108 |
| Lateral circumflex femoral artery<br>旋股外側動脈 | 股深動脈 | 3→2.2 | 分出或延續 | L 99／R 99 |
| Ascending branch of lateral circumflex femoral artery<br>旋股外側動脈升支 | 旋股外側動脈 | 1.8→1 | 末端（收細） | L 135／R 135 |
| Transverse branch of lateral circumflex femoral artery<br>旋股外側動脈橫支 | 旋股外側動脈 | 1.6→0.9 | 末端（收細） | L 63／R 60 |
| Descending branch of lateral circumflex femoral artery<br>旋股外側動脈降支 | 旋股外側動脈 | 2→0.8 | 末端（收細） | L 390／R 399 |
| Superficial circumflex iliac artery<br>旋髂淺動脈 | 股動脈 | 1.6→0.8 | 末端（收細） | L 114／R 108 |
| Deep circumflex iliac artery<br>旋髂深動脈 | 髂外動脈 | 2.4→1 | 末端（收細） | L 156／R 156 |
| First perforating artery<br>第一穿動脈 | 股深動脈 | 1.8→0.9 | 末端（收細） | L 57／R 63 |
| Second perforating artery<br>第二穿動脈 | 股深動脈 | 1.8→0.9 | 末端（收細） | L 57／R 57 |
| Third perforating artery<br>第三穿動脈 | 股深動脈 | 1.8→0.9 | 末端（收細） | L 69／R 69 |
| Fourth perforating artery (end of the deep femoral artery)<br>第四穿動脈（股深動脈終末） | 股深動脈 | 1.8→0.8 | 末端（收細） | L 63／R 63 |
| Superior gluteal artery<br>臀上動脈 | 髂內動脈 | 4→3.2 | 分出或延續 | L 45／R 45 |
| Superficial branch of superior gluteal artery<br>臀上動脈淺支 | 臀上動脈 | 2.4→1 | 末端（收細） | L 54／R 54 |
| Deep branch of superior gluteal artery<br>臀上動脈深支 | 臀上動脈 | 2.8→1 | 末端（收細） | L 66／R 66 |
| Inferior gluteal artery<br>臀下動脈 | 髂內動脈 | 3.6→1.6 | 末端（收細） | L 84／R 72 |
| Internal pudendal artery<br>陰部內動脈 | 髂內動脈 | 3.2→1.4 | 末端（收細） | L 126／R 105 |
| Obturator artery<br>閉孔動脈 | 髂內動脈 | 2.6→1.2 | 末端（收細） | L 114／R 120 |

## 建法

1. 每條血管以網站現有網格（圖譜或示意）的中心線為導引，保留位置；穿動脈、旋髂深動脈、旋股外側動脈升支與橫支、閉孔動脈沒有可用的導引，依骨與肌網格上量到的標誌另寫路線（示意）。
2. 起點移到上一級的中心線上，子血管一定接在上一級上；髂總動脈分叉處與腹股溝韌帶處（外髂動脈到股動脈）接點相同。
3. 中心線被推出骨外（壁離骨面至少 1.2 mm）並避開神經（距神經表面至少 0.7 倍半徑），再平滑；直徑由起端線性遞減到末端，只有標記為末端的血管才收細。
4. 股動脈的下端接現有的膕動脈（第 2 批重建）。

## 資訊卡欄位（由血管樹產生）

### Common iliac artery｜髂總動脈

- Origin 起點：Abdominal aorta at its bifurcation, in front of the fourth lumbar vertebra｜腹主動脈分叉處，位於第四腰椎前方
- Course 走向：Runs down and outwards along the medial border of psoas major, in front of the common iliac vein, and divides in front of the sacroiliac joint｜沿腰大肌內側緣向下外側行，位於髂總靜脈前方，在薦髂關節前方分為內、外兩支
- Main branches 主要分支：External iliac artery（髂外動脈）、Internal iliac artery（髂內動脈）
- Territory 供應範圍：Pelvis and lower limb, through its two terminal branches｜經兩條終支供應骨盆與下肢

### Internal iliac artery｜髂內動脈

- Origin 起點：Common iliac artery｜髂總動脈
- Course 走向：Short trunk that runs down into the pelvis in front of the sacroiliac joint and splits into an anterior and a posterior division｜短幹，在薦髂關節前方向下進入骨盆，分為前幹與後幹
- Main branches 主要分支：Superior gluteal artery（臀上動脈）、Inferior gluteal artery（臀下動脈）、Internal pudendal artery（陰部內動脈）、Obturator artery（閉孔動脈）
- Territory 供應範圍：Pelvic wall and viscera, gluteal region and perineum｜骨盆壁與盆腔臟器、臀區與會陰

### External iliac artery｜髂外動脈

- Origin 起點：Common iliac artery｜髂總動脈
- Course 走向：Runs along the medial border of psoas major to the midpoint between the anterior superior iliac spine and the pubic symphysis, where it passes under the inguinal ligament｜沿腰大肌內側緣下行，至髂前上棘與恥骨聯合連線中點，經腹股溝韌帶深面
- Main branches 主要分支：Femoral artery（股動脈）、Deep circumflex iliac artery（旋髂深動脈）
- Territory 供應範圍：Lower limb; gives the deep circumflex iliac and inferior epigastric arteries just above the inguinal ligament｜下肢；在腹股溝韌帶上方分出旋髂深動脈與腹壁下動脈

### Femoral artery｜股動脈

- Origin 起點：External iliac artery, at the inguinal ligament｜外髂動脈，於腹股溝韌帶處
- Course 走向：Descends in the femoral triangle (lateral to the femoral vein, medial to the femoral nerve), then in the adductor canal, and passes through the adductor hiatus to become the popliteal artery｜在股三角內下行（位於股靜脈外側、股神經內側），再入內收肌管，穿內收肌裂孔後改稱膕動脈
- Main branches 主要分支：Deep femoral artery（股深動脈）、Superficial circumflex iliac artery（旋髂淺動脈）
- Territory 供應範圍：Anterior and medial thigh; continues as the popliteal artery｜大腿前側與內側；延續為膕動脈
- 位置關係：nerve lateral to artery at the femoral triangle；vein medial to artery

### Deep femoral artery｜股深動脈

- Origin 起點：Femoral artery, 3–5 cm below the inguinal ligament｜股動脈，腹股溝韌帶下方 3–5 公分
- Course 走向：Runs backwards and laterally behind the femoral vessels and deep to adductor longus, close to the femur, giving the circumflex femoral and perforating arteries; its end is the fourth perforating artery｜向後外側行經股血管後方、內收長肌深面，貼近股骨，依序分出旋股動脈與穿動脈，終末為第四穿動脈
- Main branches 主要分支：Medial circumflex femoral artery（旋股內側動脈）、Lateral circumflex femoral artery（旋股外側動脈）、First perforating artery（第一穿動脈）、Second perforating artery（第二穿動脈）、Third perforating artery（第三穿動脈）、Fourth perforating artery (end of the deep femoral artery)（第四穿動脈（股深動脈終末））
- Territory 供應範圍：Main blood supply of the thigh muscles and the femur｜大腿肌肉與股骨的主要血液供應

### Medial circumflex femoral artery｜旋股內側動脈

- Origin 起點：Deep femoral artery (sometimes the femoral artery)｜股深動脈（有時來自股動脈）
- Course 走向：Winds backwards round the medial side of the femoral neck between pectineus and iliopsoas, then passes above quadratus femoris to the trochanteric fossa｜繞股骨頸內側向後，經恥骨肌與髂腰肌之間，再越過股方肌上緣到轉子窩
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Femoral head and neck (retinacular arteries) and neighbouring muscles｜股骨頭、頸（支持帶動脈）與鄰近肌肉

### Lateral circumflex femoral artery｜旋股外側動脈

- Origin 起點：Deep femoral artery｜股深動脈
- Course 走向：Passes laterally between the divisions of the femoral nerve, behind sartorius and rectus femoris, and divides into ascending, transverse and descending branches｜向外側經股神經分支之間、縫匠肌與股直肌深面，分為升支、橫支與降支
- Main branches 主要分支：Ascending branch of lateral circumflex femoral artery（旋股外側動脈升支）、Transverse branch of lateral circumflex femoral artery（旋股外側動脈橫支）、Descending branch of lateral circumflex femoral artery（旋股外側動脈降支）
- Territory 供應範圍：Muscles of the front and lateral thigh and the hip joint region｜大腿前側與外側肌肉及髖關節周圍

### Ascending branch of lateral circumflex femoral artery｜旋股外側動脈升支

- Origin 起點：Lateral circumflex femoral artery｜旋股外側動脈
- Course 走向：Ascends laterally beneath sartorius and rectus femoris towards the anterior superior iliac spine｜在縫匠肌與股直肌深面向外上走，朝髂前上棘
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Tensor fasciae latae and the muscles round the hip; anastomoses with the superior gluteal artery｜闊筋膜張肌與髖周肌肉；與臀上動脈吻合

### Transverse branch of lateral circumflex femoral artery｜旋股外側動脈橫支

- Origin 起點：Lateral circumflex femoral artery｜旋股外側動脈
- Course 走向：Runs laterally through vastus lateralis and winds round the femur below the greater trochanter｜向外側穿過股外側肌，繞過大轉子下方的股骨
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Vastus lateralis; joins the cruciate anastomosis of the thigh｜股外側肌；參與大腿十字吻合

### Descending branch of lateral circumflex femoral artery｜旋股外側動脈降支

- Origin 起點：Lateral circumflex femoral artery｜旋股外側動脈
- Course 走向：Descends on the front of the thigh between vastus lateralis and rectus femoris, with the nerve to vastus lateralis, towards the knee｜沿大腿前面在股外側肌與股直肌之間下行，伴股外側肌神經，朝向膝部
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Vastus lateralis and the lateral side of the knee (anastomoses with the genicular arteries)｜股外側肌與膝外側（與膝動脈吻合）

### Superficial circumflex iliac artery｜旋髂淺動脈

- Origin 起點：Femoral artery, 1–2 cm below the inguinal ligament｜股動脈，腹股溝韌帶下方 1–2 公分
- Course 走向：Runs laterally in the subcutaneous tissue along the inguinal ligament towards the anterior superior iliac spine｜在皮下沿腹股溝韌帶向外側，朝髂前上棘
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Skin and superficial fascia of the groin and lower abdominal wall｜腹股溝與下腹壁的皮膚和淺筋膜

### Deep circumflex iliac artery｜旋髂深動脈

- Origin 起點：External iliac artery, just above the inguinal ligament｜外髂動脈，腹股溝韌帶上方
- Course 走向：Runs laterally along the inguinal ligament to the anterior superior iliac spine, then along the inner lip of the iliac crest｜沿腹股溝韌帶向外側至髂前上棘，再沿髂嵴內唇走行
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Iliacus and the muscles of the lower abdominal wall｜髂肌與下腹壁肌肉

### First perforating artery｜第一穿動脈

- Origin 起點：Deep femoral artery｜股深動脈
- Course 走向：Pierces adductor brevis and adductor magnus close to the linea aspera and reaches the posterior compartment of the thigh｜貼近股骨粗線穿過內收短肌與內收大肌，到達大腿後區
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Hamstrings, adductor magnus and the femoral shaft｜膕繩肌、內收大肌與股骨幹

### Second perforating artery｜第二穿動脈

- Origin 起點：Deep femoral artery｜股深動脈
- Course 走向：Pierces adductor brevis and adductor magnus close to the linea aspera and reaches the posterior compartment of the thigh｜貼近股骨粗線穿過內收短肌與內收大肌，到達大腿後區
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Hamstrings, adductor magnus and the femoral shaft｜膕繩肌、內收大肌與股骨幹

### Third perforating artery｜第三穿動脈

- Origin 起點：Deep femoral artery｜股深動脈
- Course 走向：Pierces adductor brevis and adductor magnus close to the linea aspera and reaches the posterior compartment of the thigh｜貼近股骨粗線穿過內收短肌與內收大肌，到達大腿後區
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Hamstrings, adductor magnus and the femoral shaft｜膕繩肌、內收大肌與股骨幹

### Fourth perforating artery (end of the deep femoral artery)｜第四穿動脈（股深動脈終末）

- Origin 起點：Terminal part of the deep femoral artery｜股深動脈終末段
- Course 走向：Pierces adductor magnus near the lower end of the linea aspera and ends in the hamstrings｜在股骨粗線下端附近穿過內收大肌，止於膕繩肌
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Hamstrings; anastomoses with the popliteal branches｜膕繩肌；與膕動脈分支吻合

### Superior gluteal artery｜臀上動脈

- Origin 起點：Posterior division of the internal iliac artery｜髂內動脈後幹
- Course 走向：Passes backwards between the lumbosacral trunk and the first sacral nerve and leaves the pelvis through the greater sciatic foramen above piriformis, then divides into superficial and deep branches｜向後穿過腰薦幹與第一薦神經之間，經梨狀肌上緣出大坐骨孔，分為淺支與深支
- Main branches 主要分支：Superficial branch of superior gluteal artery（臀上動脈淺支）、Deep branch of superior gluteal artery（臀上動脈深支）
- Territory 供應範圍：Gluteal muscles (maximus, medius, minimus) and tensor fasciae latae｜臀大肌、臀中肌、臀小肌與闊筋膜張肌

### Superficial branch of superior gluteal artery｜臀上動脈淺支

- Origin 起點：Superior gluteal artery｜臀上動脈
- Course 走向：Enters the deep surface of gluteus maximus｜進入臀大肌深面
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Gluteus maximus and the overlying skin｜臀大肌與其表面皮膚

### Deep branch of superior gluteal artery｜臀上動脈深支

- Origin 起點：Superior gluteal artery｜臀上動脈
- Course 走向：Runs between gluteus medius and gluteus minimus｜走在臀中肌與臀小肌之間
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Gluteus medius, gluteus minimus and the hip joint｜臀中肌、臀小肌與髖關節

### Inferior gluteal artery｜臀下動脈

- Origin 起點：Anterior division of the internal iliac artery｜髂內動脈前幹
- Course 走向：Passes between the second and third sacral nerves and leaves the pelvis below piriformis, then enters gluteus maximus｜穿過第二與第三薦神經之間，經梨狀肌下緣出骨盆，進入臀大肌
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Gluteus maximus, the upper hamstrings and the sciatic nerve (artery to the sciatic nerve)｜臀大肌、膕繩肌上部與坐骨神經

### Internal pudendal artery｜陰部內動脈

- Origin 起點：Anterior division of the internal iliac artery｜髂內動脈前幹
- Course 走向：Leaves the pelvis below piriformis, curves round the ischial spine and returns to the perineum through the lesser sciatic foramen｜經梨狀肌下緣出骨盆，繞坐骨棘，再經坐骨小孔回到會陰
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Perineum and external genitalia｜會陰與外生殖器

### Obturator artery｜閉孔動脈

- Origin 起點：Anterior division of the internal iliac artery｜髂內動脈前幹
- Course 走向：Runs along the lateral wall of the pelvis with the obturator nerve and vein and leaves through the obturator canal, then divides into anterior and posterior branches｜沿骨盆側壁與閉孔神經、閉孔靜脈同行，經閉孔管出骨盆，分為前支與後支
- Main branches 主要分支：無（本批範圍內）
- Territory 供應範圍：Adductor muscles of the thigh and the head of the femur (acetabular branch)｜大腿內收肌群與股骨頭（髖臼支）

