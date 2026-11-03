# 特殊區域組成清單（其餘 12 個區域，尚未重做）

由 `node scripts/report-space-composition.mjs` 產生，資料在 `scripts/lib/space-composition.mjs`。**需人工審核，請確認每區的組成後才會重做**：每區分成邊界、頂、底、內容物、相關結構五組；位置依 Gray's Anatomy 1918 與 OpenStax。

狀態：**有**＝模型有這個結構的網格；**示意**＝本專案依解剖描述建立的示意模型；**缺**＝沒有任何開放模型（不會編造，只在清單標示「模型沒有」）。「—」表示該區在解剖上沒有這一組（例如孔洞前後貫通，沒有頂與底），請確認是否同意。

## 四邊孔（Quadrangular space）

> 孔洞前後貫通，沒有頂與底

- **邊界**
  - 小圓肌（Teres minor） — 上界：**有**；網格：teres minor
  - 大圓肌（Teres major） — 下界：**有**；網格：teres major
  - 肱三頭肌長頭（Triceps brachii, long head） — 內側界：**有**；網格：Long head of triceps brachii
  - 肱骨外科頸（Surgical neck of humerus） — 外側界：**示意**；網格：surgical neck of humerus
- **頂**：—
- **底**：—
- **內容物**
  - 腋神經（Axillary nerve）：**有**；網格：Axillary nerve（神經模型）
  - 旋肱後動脈（Posterior circumflex humeral artery）：**有**；網格：posterior circumflex humeral artery
  - 旋肱後靜脈（Posterior circumflex humeral vein）：**示意**；網格：posterior circumflex humeral vein
- **相關結構**
  - 肩胛下肌（前方）（Subscapularis）：**有**；網格：subscapularis
  - 三角肌（Deltoid）：**有**；網格：Acromial part of deltoid、Clavicular part of deltoid、Spinal part of deltoid

## 三邊孔（Triangular space）

> 孔洞前後貫通，沒有頂與底

- **邊界**
  - 小圓肌（Teres minor） — 上界：**有**；網格：teres minor
  - 大圓肌（Teres major） — 下界：**有**；網格：teres major
  - 肱三頭肌長頭（Triceps brachii, long head） — 外側界：**有**；網格：Long head of triceps brachii
- **頂**：—
- **底**：—
- **內容物**
  - 旋肩胛動脈（Circumflex scapular artery）：**有**；網格：circumflex scapular artery
  - 旋肩胛靜脈（Circumflex scapular vein）：**有**；網格：circumflex scapular vein
- **相關結構**
  - 肩胛下動脈（Subscapular artery）：**有**；網格：subscapular artery
  - 肩胛骨外側緣（Lateral border of scapula）：**缺**

## 三邊裂（Triangular interval）

- **邊界**
  - 大圓肌（Teres major） — 上界：**有**；網格：teres major
  - 肱三頭肌長頭（Triceps brachii, long head） — 內側界：**有**；網格：Long head of triceps brachii
  - 肱三頭肌外側頭（Triceps brachii, lateral head） — 外側界：**有**；網格：Lateral head of triceps brachii
- **頂**：—
- **底**
  - 肱骨（橈神經溝）（Humerus (radial groove)） — 底：**有**；網格：humerus
- **內容物**
  - 橈神經（Radial nerve）：**有**；網格：Radial nerve（神經模型）
  - 肱深動脈（Deep brachial artery）：**有**；網格：deep brachial artery、Radial collateral branch of deep brachial artery、Middle collateral branch of deep brachial artery
- **相關結構**
  - 四邊孔（Quadrangular space）：**區域**
  - 三邊孔（Triangular space）：**區域**

## 三角肌胸大肌三角（Clavipectoral triangle）

> 目前網站的「模型沒有胸肩峰動脈」說明已過時：模型有胸肩峰動脈幹與各分支（含三角肌支）

- **邊界**
  - 鎖骨（Clavicle） — 上界：**有**；網格：clavicle
  - 三角肌（Deltoid） — 外側界：**有**；網格：Acromial part of deltoid、Clavicular part of deltoid、Spinal part of deltoid
  - 胸大肌鎖骨部（Pectoralis major, clavicular part） — 內側界：**有**；網格：Clavicular part of pectoralis major
- **頂**
  - 皮膚（Skin） — 頂（皮膚與淺筋膜）：**有**；網格：Skin
- **底**
  - 鎖胸筋膜（Clavipectoral fascia） — 底：**缺**
  - 胸小肌（Pectoralis minor） — 底（深面）：**有**；網格：pectoralis minor
- **內容物**
  - 頭靜脈（Cephalic vein）：**有**；網格：cephalic vein
  - 胸肩峰動脈（三角肌支）（Thoraco-acromial artery, deltoid branch）：**有**；網格：Deltoid branch of thoraco-acromial artery
- **相關結構**
  - 腋靜脈（Axillary vein）：**有**；網格：axillary vein

## 腋窩（Axillary fossa）

- **邊界**
  - 胸大肌（前壁）（Pectoralis major） — 前壁：**有**；網格：Abdominal part of pectoralis major、Clavicular part of pectoralis major、Sternocostal part of pectoralis major
  - 胸小肌（前壁）（Pectoralis minor） — 前壁：**有**；網格：pectoralis minor
  - 肩胛下肌（後壁）（Subscapularis） — 後壁：**有**；網格：subscapularis
  - 大圓肌（後壁）（Teres major） — 後壁：**有**；網格：teres major
  - 背闊肌（後壁）（Latissimus dorsi） — 後壁：**有**；網格：latissimus dorsi
  - 前鋸肌（內側壁）（Serratus anterior） — 內側壁：**有**；網格：serratus anterior
  - 肱骨（外側壁）（Humerus） — 外側壁：**有**；網格：humerus
- **頂**
  - 鎖骨（Clavicle） — 頂（頸腋管入口：前界）：**有**；網格：clavicle
  - 第一肋（First rib） — 頂（頸腋管入口：內側界）：**有**；網格：first rib
  - 肩胛骨上緣（Superior border of scapula） — 頂（頸腋管入口：後界）：**缺**
- **底**
  - 皮膚（Skin） — 底（皮膚與腋筋膜）：**有**；網格：Skin
- **內容物**
  - 腋動脈（Axillary artery）：**有**；網格：axillary artery
  - 腋靜脈（Axillary vein）：**有**；網格：axillary vein
  - 臂神經叢（外側束、內側束）（Brachial plexus cords）：**示意**；網格：lateral cord of brachial plexus、medial cord of brachial plexus
  - 臂神經叢後側束（Posterior cord of brachial plexus）：**有**；網格：Posterior cord of brachial plexus（神經模型）
  - 腋淋巴結（Axillary lymph nodes）：**缺**
- **相關結構**
  - 腋鞘（Axillary sheath）：**示意**；網格：axillary sheath

## 肘窩（Cubital fossa）

- **邊界**
  - 旋前圓肌（Pronator teres） — 內側界：**有**；網格：Humeral head of pronator teres、Ulnar head of pronator teres
  - 肱橈肌（Brachioradialis） — 外側界：**有**；網格：brachioradialis
  - 肱骨內上髁（Medial epicondyle of humerus） — 上界（兩上髁連線）：**示意**；網格：medial epicondyle of humerus
  - 肱骨外上髁（Lateral epicondyle of humerus） — 上界（兩上髁連線）：**缺**
- **頂**
  - 肱二頭肌腱膜（Bicipital aponeurosis） — 頂：**缺**
  - 肘正中靜脈（Median cubital vein） — 頂（淺靜脈）：**有**；網格：median cubital vein
- **底**
  - 肱肌（Brachialis） — 底：**有**；網格：brachialis
  - 旋後肌（Supinator） — 底：**有**；網格：supinator
- **內容物**
  - 肱二頭肌腱（Biceps brachii (tendon)）：**有**；網格：Long head of biceps brachii、Short head of biceps brachii
  - 肱動脈（Brachial artery）：**有**；網格：brachial artery
  - 正中神經（Median nerve）：**有**；網格：Median nerve（神經模型）
- **相關結構**
  - 橈神經（Radial nerve）：**有**；網格：Radial nerve（神經模型）

## 解剖鼻煙盒（Anatomical snuffbox）

- **邊界**
  - 拇長伸肌腱（Extensor pollicis longus） — 尺側界：**有**；網格：extensor pollicis longus、tendon of extensor pollicis longus
  - 拇長展肌腱（Abductor pollicis longus） — 橈側界：**有**；網格：abductor pollicis longus、tendon of abductor pollicis longus
  - 拇短伸肌腱（Extensor pollicis brevis） — 橈側界：**有**；網格：extensor pollicis brevis、tendon of extensor pollicis brevis
- **頂**
  - 皮膚（Skin） — 頂：**有**；網格：Skin
- **底**
  - 舟狀骨（Scaphoid） — 底：**有**；網格：scaphoid
  - 大多角骨（Trapezium） — 底：**有**；網格：trapezium
  - 橈骨（莖突）（Radius (styloid process)） — 近側界：**有**；網格：radius
- **內容物**
  - 橈動脈（Radial artery）：**有**；網格：radial artery
- **相關結構**
  - 橈神經淺支（Superficial branch of radial nerve）：**有**；網格：Superficial branch of radial nerve（神經模型）
  - 頭靜脈（Cephalic vein）：**有**；網格：cephalic vein

## 股三角（Femoral triangle）

- **邊界**
  - 腹股溝韌帶（Inguinal ligament） — 上界：**有**；網格：inguinal ligament
  - 縫匠肌（Sartorius） — 外側界：**有**；網格：sartorius
  - 內收長肌（Adductor longus） — 內側界：**有**；網格：adductor longus
- **頂**
  - 闊筋膜（含篩筋膜）（Fascia lata (cribriform fascia)） — 頂：**缺**
- **底**
  - 髂肌（Iliacus） — 底（外）：**有**；網格：iliacus
  - 腰大肌（Psoas major） — 底（外）：**有**；網格：psoas major
  - 恥骨肌（Pectineus） — 底（內）：**有**；網格：pectineus
- **內容物**
  - 股神經（Femoral nerve） — 最外：**有**；網格：Femoral nerve（神經模型）
  - 股動脈（Femoral artery）：**有**；網格：femoral artery
  - 股靜脈（Femoral vein）：**有**；網格：femoral vein
  - 股鞘（Femoral sheath）：**示意**；網格：femoral sheath
  - 股管與腹股溝淺淋巴結（Femoral canal and lymph nodes）：**缺**
- **相關結構**
  - 大隱靜脈（Great saphenous vein）：**有**；網格：great saphenous vein

## 內收肌管（Adductor canal）

- **邊界**
  - 縫匠肌（前內側）（Sartorius） — 前內側界：**有**；網格：sartorius
  - 股內側肌（外側）（Vastus medialis） — 外側界：**有**；網格：vastus medialis
  - 內收長肌（後）（Adductor longus） — 後界：**有**；網格：adductor longus
- **頂**
  - 縫匠肌（Sartorius） — 頂：**有**；網格：sartorius
  - 股內收肌管板（股內側肌與內收肌間筋膜）（Vastoadductor membrane） — 頂：**缺**
- **底**
  - 內收長肌（Adductor longus） — 底：**有**；網格：adductor longus
  - 內收大肌（Adductor magnus） — 底：**有**；網格：adductor magnus
- **內容物**
  - 股動脈（Femoral artery）：**有**；網格：femoral artery
  - 股靜脈（Femoral vein）：**有**；網格：femoral vein
  - 隱神經（Saphenous nerve）：**有**；網格：Saphenous nerve（神經模型）
  - 股內側肌神經（Nerve to vastus medialis）：**示意**；網格：nerve to vastus medialis
- **相關結構**
  - 內收肌裂孔（Adductor hiatus）：**區域**

## 膕窩（Popliteal fossa）

- **邊界**
  - 股二頭肌（Biceps femoris） — 上外側界：**有**；網格：Long head of biceps femoris、Short head of biceps femoris、tendon of biceps femoris
  - 半膜肌（Semimembranosus） — 上內側界：**有**；網格：semimembranosus
  - 半腱肌（Semitendinosus） — 上內側界：**有**；網格：semitendinosus
  - 腓腸肌外側頭（Gastrocnemius, lateral head） — 下外側界：**有**；網格：Lateral head of gastrocnemius
  - 腓腸肌內側頭（Gastrocnemius, medial head） — 下內側界：**有**；網格：Medial head of gastrocnemius
  - 蹠肌（Plantaris） — 下外側界：**有**；網格：plantaris
- **頂**
  - 膕筋膜（Popliteal fascia） — 頂：**缺**
  - 小隱靜脈（穿頂）（Small saphenous vein） — 頂（穿過）：**有**；網格：small saphenous vein
- **底**
  - 股骨（膕面）（Femur） — 底：**有**；網格：femur
  - 膝關節後囊與膕斜韌帶（Oblique popliteal ligament） — 底：**缺**
  - 膕肌（Popliteus） — 底：**有**；網格：popliteus
- **內容物**
  - 脛神經（Tibial nerve） — 最淺：**有**；網格：Tibial nerve（神經模型）
  - 腓總神經（Common fibular nerve）：**有**；網格：Common fibular nerve（神經模型）
  - 膕靜脈（Popliteal vein）：**有**；網格：popliteal vein
  - 膕動脈（Popliteal artery） — 最深：**有**；網格：popliteal artery
  - 膕淋巴結（Popliteal lymph nodes）：**缺**
- **相關結構**
  - 腓腸內側皮神經（Medial sural cutaneous nerve）：**有**；網格：Medial sural cutaneous nerve（神經模型）

## 坐骨小孔（Lesser sciatic foramen）

> 目前網站沒有這個區域，需新增。

> 目前網站的特殊區域清單沒有這一項，需新增

- **邊界**
  - 坐骨棘（Spine of ischium） — 上界：**示意**；網格：spine of ischium
  - 坐骨結節（Ischial tuberosity） — 下界：**示意**；網格：ischial tuberosity
  - 薦棘韌帶（Sacrospinous ligament） — 前上界：**缺**
  - 薦結節韌帶（Sacrotuberous ligament） — 後界：**缺**
- **頂**：—
- **底**
  - 髖骨（坐骨體後面）（Hip bone (ischium)） — 底：**有**；網格：hip bone
- **內容物**
  - 閉孔內肌腱（Obturator internus tendon）：**有**；網格：obturator internus、nerve to obturator internus
  - 陰部神經（Pudendal nerve）：**有**；網格：Pudendal nerve（神經模型）
  - 陰部內動脈（Internal pudendal artery）：**示意**；網格：internal pudendal artery
  - 陰部內靜脈（Internal pudendal vein）：**有**；網格：internal pudendal vein
  - 閉孔內肌神經（Nerve to obturator internus）：**示意**；網格：nerve to obturator internus
- **相關結構**
  - 梨狀肌（坐骨大孔）（Piriformis）：**有**；網格：piriformis
  - 坐骨神經（Sciatic nerve）：**缺**

## 跗管（Tarsal tunnel）

- **邊界**
  - 脛骨（內踝）（Tibia (medial malleolus)） — 前上界：**有**；網格：tibia
  - 距骨（Talus） — 外側界：**有**；網格：talus
  - 跟骨（Calcaneus） — 下界：**有**；網格：calcaneus
- **頂**
  - 屈肌支持帶（踝）（Flexor retinaculum (ankle)） — 頂：**示意**；網格：flexor retinaculum of ankle
- **底**
  - 脛骨（內踝）（Tibia (medial malleolus)） — 底：**有**；網格：tibia
  - 距骨（Talus） — 底：**有**；網格：talus
  - 跟骨（載距突）（Calcaneus） — 底：**有**；網格：calcaneus
- **內容物**
  - 脛後肌腱（Tibialis posterior） — 由前到後第 1：**有**；網格：tibialis posterior
  - 屈趾長肌腱（Flexor digitorum longus） — 第 2：**有**；網格：flexor digitorum longus
  - 脛後動脈（Posterior tibial artery） — 第 3：**有**；網格：posterior tibial artery
  - 脛後靜脈（Posterior tibial vein） — 第 4：**有**；網格：posterior tibial vein
  - 脛神經（Tibial nerve） — 第 5：**有**；網格：Tibial nerve（神經模型）
  - 屈拇長肌腱（Flexor hallucis longus） — 第 6：**有**；網格：flexor hallucis longus
- **相關結構**
  - 足底內側神經（Medial plantar nerve）：**有**；網格：Medial plantar nerve（神經模型）
  - 足底外側神經（Lateral plantar nerve）：**有**；網格：Lateral plantar nerve（神經模型）

## 統計

有 111 項、示意 12 項、缺 15 項。
