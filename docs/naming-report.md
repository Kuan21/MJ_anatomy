# 統一命名報告

由 `scripts/prepare-naming.mjs` 產生（`npm run check` 會檢查本檔是否最新）。優先次序：

1. `docs/muscle-layers.json`（跑考摘要的肌肉分層）
2. `docs/glossary.json` 中 `source_priority` 為「跑考摘要」的項目
3. `docs/glossary.json` 其他項目
4. 以上皆無，採用台灣解剖學通用譯名（程式內建對照表 `app/mj-structure-info.ts`、`app/mj-zh-anatomy.ts`、`app/mj-zh-extra*.ts`）

`docs/glossary.json` 為自動抽取，採用前逐項過濾：標為 `needs_review`、英文名不帶結構類型後綴、中文名與類型不符（如動脈對應到「分隔」）、含句子成分、分支／肌腱／系列結構者一律不採用，列於下方「待確認」。

## 一、結果摘要

- 涵蓋結構名稱（去除左右後）：1476 個
- 採用來源 1（muscle-layers.json）改名：33 個；來源 2（跑考摘要）：14 個；來源 3（其他筆記）：25 個
- 全站固定修正：「背闊肌」→「闊背肌」
- 仍缺中文名或含英文：0 個

| 來源 | 結構數 |
|---|---|
| 台灣解剖學名詞（程式內建對照表） | 1279 |
| muscle-layers.json | 88 |
| glossary.json（其他筆記） | 75 |
| glossary.json（跑考摘要） | 34 |

## 二、已改名（前後對照）

| 結構 | 使用來源 | 改名前 | 改名後 |
|---|---|---|---|
| levator palpebrae superioris | glossary.json（其他筆記） | 提上瞼肌 | 提上眼瞼肌 |
| long ciliary nerve | glossary.json（其他筆記） | 長睫狀神經 | 長睫神經 |
| Short ciliary nerve | glossary.json（其他筆記） | 短睫狀神經 | 短睫神經 |
| Abductor digiti minimi of foot | muscle-layers.json（foot_sole） | 足小趾外展肌 | 外展小趾肌 |
| Flexor digiti minimi brevis of foot | muscle-layers.json（foot_sole） | 足小趾短屈肌 | 屈小趾短肌 |
| abductor hallucis | muscle-layers.json（foot_sole） | 拇外展肌 | 外展拇趾肌 |
| adductor brevis | muscle-layers.json（thigh_medial） | 短收肌 | 內收短肌 |
| adductor longus | muscle-layers.json（thigh_medial） | 長收肌 | 內收長肌 |
| adductor magnus | muscle-layers.json（thigh_medial） | 大收肌 | 內收大肌 |
| extensor digitorum longus | muscle-layers.json（leg_anterior） | 趾長伸肌 | 伸趾長肌 |
| extensor hallucis brevis | muscle-layers.json（foot_dorsum） | 拇短伸肌 | 伸拇趾短肌 |
| extensor hallucis longus | muscle-layers.json（leg_anterior） | 拇長伸肌 | 伸拇趾長肌 |
| fibularis brevis | muscle-layers.json（leg_lateral） | 腓骨短肌 | 腓短肌 |
| fibularis longus | muscle-layers.json（leg_lateral） | 腓骨長肌 | 腓長肌 |
| flexor digitorum brevis | muscle-layers.json（foot_sole） | 趾短屈肌 | 屈趾短肌 |
| flexor digitorum longus | muscle-layers.json（leg_posterior） | 趾長屈肌 | 屈趾長肌 |
| flexor hallucis longus | muscle-layers.json（leg_posterior） | 拇長屈肌 | 屈拇趾長肌 |
| tibialis anterior | muscle-layers.json（leg_anterior） | 脛骨前肌 | 脛前肌 |
| tibialis posterior | muscle-layers.json（leg_posterior） | 脛骨後肌 | 脛後肌 |
| external intercostal muscle | glossary.json（其他筆記） | 肋間外肌 | 外肋間肌 |
| iliococcygeus | glossary.json（其他筆記） | 髂尾肌 | 髂骨尾骨肌 |
| innermost intercostal muscle | glossary.json（其他筆記） | 肋間最內肌 | 最內肋間肌 |
| internal intercostal muscle | glossary.json（其他筆記） | 肋間內肌 | 內肋間肌 |
| pubococcygeus | glossary.json（其他筆記） | 恥尾肌 | 恥骨尾骨肌 |
| Abductor digiti minimi of hand | muscle-layers.json（hand） | 小指外展肌 | 外展小指肌 |
| flexor pollicis brevis | muscle-layers.json（hand） | 拇短屈肌 | 屈拇短肌 |
| Flexor digiti minimi brevis of hand | muscle-layers.json（hand） | 小指短屈肌 | 屈小指短肌 |
| extensor carpi ulnaris | muscle-layers.json（forearm_extensor） | 尺側腕伸肌 | 尺側伸腕肌 |
| flexor digitorum superficialis | muscle-layers.json（forearm_flexor） | 指淺屈肌 | 屈指淺肌 |
| abductor pollicis brevis | muscle-layers.json（hand） | 拇短外展肌 | 外展拇短肌 |
| abductor pollicis longus | muscle-layers.json（forearm_extensor） | 拇長外展肌 | 外展拇長肌 |
| extensor carpi radialis brevis | muscle-layers.json（forearm_extensor） | 橈側腕短伸肌 | 橈側伸腕短肌 |
| extensor carpi radialis longus | muscle-layers.json（forearm_extensor） | 橈側腕長伸肌 | 橈側伸腕長肌 |
| extensor digiti minimi | muscle-layers.json（forearm_extensor） | 小指伸肌 | 伸小指肌 |
| extensor digitorum | muscle-layers.json（forearm_extensor） | 指伸肌 | 伸指肌 |
| extensor indicis | muscle-layers.json（forearm_extensor） | 食指伸肌 | 伸食指肌 |
| extensor pollicis brevis | muscle-layers.json（forearm_extensor） | 拇短伸肌 | 伸拇短肌 |
| extensor pollicis longus | muscle-layers.json（forearm_extensor） | 拇長伸肌 | 伸拇長肌 |
| flexor carpi radialis | muscle-layers.json（forearm_flexor） | 橈側腕屈肌 | 橈側屈腕肌 |
| flexor digitorum profundus | muscle-layers.json（forearm_flexor） | 指深屈肌 | 屈指深肌 |
| flexor pollicis longus | muscle-layers.json（forearm_flexor） | 拇長屈肌 | 屈拇長肌 |
| platysma | glossary.json（其他筆記） | 頸闊肌 | 闊頸肌 |
| superior epigastric artery | glossary.json（其他筆記） | 腹壁上動脈 | 上腹壁動脈 |
| deep plantar artery | glossary.json（跑考摘要） | 足底深動脈 | 深趾動脈 |
| descending genicular artery | glossary.json（跑考摘要） | 膝降動脈 | 降膝動脈 |
| inferior lateral genicular artery | glossary.json（跑考摘要） | 膝下外側動脈 | 外下膝動脈 |
| inferior medial genicular artery | glossary.json（跑考摘要） | 膝下內側動脈 | 內下膝動脈 |
| lateral circumflex femoral artery | glossary.json（跑考摘要） | 旋股外側動脈 | 外旋股動脈 |
| middle genicular artery | glossary.json（跑考摘要） | 膝中動脈 | 中膝動脈 |
| inferior thyroid artery | glossary.json（其他筆記） | 甲狀腺下動脈 | 下甲狀腺動脈 |
| posterior circumflex humeral artery | glossary.json（其他筆記） | 旋肱後動脈 | 後旋肱動脈 |
| radial recurrent artery | glossary.json（其他筆記） | 橈側返動脈 | 橈側迴返動脈 |
| levator veli palatini | glossary.json（其他筆記） | 提腭帆肌 | 提顎帆肌 |
| tensor veli palatini | glossary.json（其他筆記） | 張腭帆肌 | 張顎帆肌 |
| Dorsal pancreatic artery | glossary.json（其他筆記） | 胰背動脈 | 背胰動脈 |
| Inferior pancreaticoduodenal artery | glossary.json（其他筆記） | 胰十二指腸下動脈 | 下胰十二指腸動脈 |
| external iliac artery | glossary.json（其他筆記） | 髂外動脈 | 外髂動脈 |
| internal iliac artery | glossary.json（其他筆記） | 髂內動脈 | 內髂動脈 |
| inferior epigastric artery | glossary.json（其他筆記） | 腹壁下動脈 | 下腹壁動脈 |
| inferior phrenic artery | glossary.json（其他筆記） | 膈下動脈 | 下膈動脈 |
| lateral sacral vein | glossary.json（其他筆記） | 薦外側靜脈 | 外薦靜脈 |
| superficial epigastric artery | glossary.json（跑考摘要） | 腹壁淺動脈 | 淺腹壁動脈 |
| Superior rectal artery | glossary.json（其他筆記） | 直腸上動脈 | 上直腸動脈 |
| dorsal scapular nerve | glossary.json（其他筆記） | 肩胛背神經 | 背肩胛神經 |
| long thoracic nerve | glossary.json（其他筆記） | 胸長神經 | 長胸神經 |
| medial sural cutaneous nerve | glossary.json（跑考摘要） | 腓腸內側皮神經 | 內側腓腸皮神經 |
| lateral femoral cutaneous nerve | glossary.json（跑考摘要） | 股外側皮神經 | 外股皮神經 |
| superficial fibular nerve | glossary.json（跑考摘要） | 腓淺神經 | 淺腓神經 |
| deep fibular nerve | glossary.json（跑考摘要） | 腓深神經 | 深腓神經 |
| lateral plantar nerve | glossary.json（跑考摘要） | 足底外側神經 | 外蹠神經 |
| medial plantar nerve | glossary.json（跑考摘要） | 足底內側神經 | 內蹠神經 |
| common fibular nerve | glossary.json（跑考摘要） | 腓總神經 | 總腓神經 |

## 三、已知錯誤的修正結果

- 左背闊肌→左闊背肌
- Quiz 說明文字「背闊肌」→「闊背肌」
- 左Occipital Pole→左枕極：目前「枕極」（台灣解剖學名詞（程式內建對照表））
- 左Angular Gyrus→左角回：目前「角回」（台灣解剖學名詞（程式內建對照表））

## 四、待你確認

### 4.1 不採用的 glossary 項目（共 899 項）

- 無法判斷結構類型（缺 m/n/a/v/lig 後綴）：731 項
- 英文名含編號前綴（自動抽取殘留）：12 項
- 標為 needs_review：117 項
- 中文名類型與英文後綴不符（疑似抽取錯位）：26 項
- 分支／肌腱／系列結構，無法一對一對應：9 項
- 中文名過長或含句子成分：4 項

跑考摘要來源中被擋下的項目（請確認是否要人手補正）：

| 英文（原文） | 中文（原文） | 擋下原因 |
|---|---|---|
| a. Recurrent br | 手掌部神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| A. Splenius capitis m | 夾肌 | 英文名含編號前綴（自動抽取殘留） |
| a. Suprascapular n | 臂神經叢其他分支 | 英文名含編號前綴（自動抽取殘留） |
| Ascending br | 上升支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| B. ant. br | 跑考要分前後支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| b. Superficial br | 大魚際肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Biceps brachii | 橈骨粗隆 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| c. common palmer digital n | 可見的皮神經 | 標為 needs_review |
| c. Extensor pollicis longus m | 肌腱到大拇指的近端指節 | 標為 needs_review |
| C. Med. Mammary br | 胸肩峰動脈連到乳腺的動脈 | 標為 needs_review |
| C. Pectinate m | 分隔左右心房 | 英文名含編號前綴（自動抽取殘留） |
| C. proper palmer digital a | 淺掌弓往指頭發出的分支 | 標為 needs_review |
| D. Ant. cardiac v | 沿右冠狀動脈走回冠狀竇 | 標為 needs_review |
| d. Deltoid br | 方或胸鎖關節附近的小分支 | 標為 needs_review |
| deep br | 深支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| deep palmer br. of ulnar a | 尺動脈深掌分支 | 分支／肌腱／系列結構，無法一對一對應 |
| Descending br | 下降支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| i. Axillary n | 終末支 | 英文名含編號前綴（自動抽取殘留） |
| i. Lat. pectoral n | 分支 | 英文名含編號前綴（自動抽取殘留） |
| ii. Med. cutaneous n | 胸小肌到胸大肌 | 英文名含編號前綴（自動抽取殘留） |
| ii. Middle subscapular n | 只支配肩胛下肌 | 英文名含編號前綴（自動抽取殘留） |
| ii. Radial n | 三角肌 | 英文名含編號前綴（自動抽取殘留） |
| iii. Lower subscapular n | 闊背肌 | 英文名含編號前綴（自動抽取殘留） |
| long head of biceps femoris m | 股二頭肌長頭 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| med. cord a | 內索 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| Nerve to obturator internus m | 閉孔內肌神經 | 分支／肌腱／系列結構，無法一對一對應 |
| nerve to quadratus femoris m | 股方肌神經 | 分支／肌腱／系列結構，無法一對一對應 |
| obturator n | 分隔 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| perforating br | 穿通支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| saphenous br | 分支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| short head of biceps femoris m | 股二頭肌短頭 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| superficial br | 淺支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| superficial palmaer br. of radial a | 橈動脈淺掌分支 | 分支／肌腱／系列結構，無法一對一對應 |
| tendon of Flexor Digitorum longus m | 屈趾長肌肌腱 | 分支／肌腱／系列結構，無法一對一對應 |
| tendon of Flexor Hallucis longus m | 屈拇長肌肌腱 | 分支／肌腱／系列結構，無法一對一對應 |
| tendon of Tibialis Posterior m | 脛後肌肌腱 | 分支／肌腱／系列結構，無法一對一對應 |
| Transverse br | 橫支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |

其他筆記來源中標為 needs_review 者（部分明顯錯配，如「Enteric nervous system」不可對應「骨盆內臟神經」）：

<details><summary>展開 862 項</summary>

| 英文（原文） | 中文（原文） | 擋下原因 |
|---|---|---|
| A. Angular vein | 角靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| A. Facial a | 顏面動脈 | 英文名含編號前綴（自動抽取殘留） |
| A. Nutrient a | 分支 | 英文名含編號前綴（自動抽取殘留） |
| A. of round lig. of uterus | 子宮圓韌帶支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| A. Orbicularis oculi | 眼輪匝肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| A. Pharyngeal tonsil | 咽扁桃腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| a. to the. bulb | 尿道球動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Abdominal aorta | 腹主動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| abdominal artery | 腹主動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Abdominal prevertebral/preaortic plexus | 腹腔的椎前神經叢 | 標為 needs_review |
| Accessory nerve | 斜方肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| accessory obturator a | 的副閉孔動脈 | 標為 needs_review |
| Accessory obturator nerve | 副閉孔神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Anal aperture | 肛門口 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Anal canal | 肛管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Anal sinus | 肛竇 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Anal triangle | 肛門三角 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Anal valve | 肛瓣 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| anatomical anal canal | 解剖肛管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| anconeus | 肘肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Angle | 陰蒂角 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| angle of mandible | 下頷角 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| anocutaneous line | 肛門皮膚線 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| anorectal line | 肛門直腸腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ant. Border of the Sternocleidomastoid m | 胸鎖乳突肌前側緣 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| Ant. Border of the Trapezius m | 斜方肌的前側緣 | 標為 needs_review |
| Ant. Midline of the Neck | 頸前中線 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ant. recesses | 前隱窩 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Anterior | 前緣 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Anterior border of the trapezius muscle | 斜方肌前緣 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Anterior branch | 前支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Anterior chamber | 前房 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Anterior ethmoidal nerve | 前篩神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Anterior superior alveolar artery | 前上齒槽動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Anterior superior alveolar nerve | 前上齒槽神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Anterior Surface of Sacrum | 薦骨前表面 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Anterior/posterior inferior pancreaticoduodenal a | 後下胰十二指腸動脈 | 標為 needs_review |
| aortic hiatus | 主動脈裂孔 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Aortic plexus | 主動脈叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Apertures of the diaphragm | 橫膈裂孔 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| aponeurosis | 腱膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| arachnoid mater | 蛛網膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Arcuate ligaments | 弓狀韌帶 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Artery to the bulb | 前庭球動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| articular disc | 關節盤 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| articular tubercle | 關節結節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ascending lumbar vein | 升腰靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| ascending pharyngeal artery | 升咽動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| ateral aspect of the face | 顏面部外側面 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Auricular muscles | 耳肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Auriculotemporal nerve | 耳顳神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Autonomic nerves | 自主神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| axillary artery | 腋動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Axillary fossa | 腋窩 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| axillary lymph node | 腋淋巴結 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| axillary vein | 腋靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| axon | 軸突 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| axon hillock | 軸丘 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Azygos vein | 部分血液引導至奇靜脈 | 標為 needs_review |
| B. Superficial temporal a | 淺顳動脈 | 英文名含編號前綴（自動抽取殘留） |
| B. Tubal tonsil | 咽鼓管扁桃腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Bile duct | 膽汁則會由膽管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Bladder body | 膀胱體 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| bodies of pubic bones | 恥骨體 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| body | 胸骨體 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| body of uterus | 子宮體 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Brachial plexus | 臂神經叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| brachialis | 肱肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Brachioradialis m | 神經 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| brain | 大腦 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Brainstem | 腦幹 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Branches | 分支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Branches of Abdominal Aorta | 腹主動脈的分支 | 標為 needs_review |
| Branches of internal thoracic a | 內胸動脈分支 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| broad ligament of uterus | 子宮擴韌帶 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| broncomediastinal trunk | 帶回支氣管縱膈淋巴幹 | 標為 needs_review |
| Buccal branch | 頰支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Bulbar conjunctiva | 球結膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Bulbar urethra | 尿道球腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Bulbospongiosus | 球海綿體肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Bulbospongiosus muscle | 球海綿體肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Bulbourethral glands | 尿道球腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| C. Palatine tonsil | 腭扁桃腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| capitate | 頭狀骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| capsule | 關節囊 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Carotid a | 頸動脈三角 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| Carotid Body | 頸動脈體 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Carotid sheath | 頸動脈鞘膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Carotid Sinus | 頸動脈竇 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Carotid Sinus nerve | 血壓訊息由頸動脈竇神經 | 標為 needs_review |
| Carotid Triangle | 頸動脈三角 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| carpal | 塊腕骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Cavernous sinus | 海綿竇 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Celiac node | 腹腔淋巴結 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Celiac plexus | 腹腔叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Celiac Trunk | 前腸 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| cell body | 這些區域包括神經細胞體 | 標為 needs_review |
| Central artery of retina | 視網膜中央動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Central tendon | 中央肌腱 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Central vein | 肝小葉內側為中央靜脈 | 標為 needs_review |
| Cephalic v | 血管 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| Ceruminous gland | 耵聹腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Cervical branch | 頸支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| cervical canal | 頸管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Cervical sympathetic ganglia | 中下頸交感神經節交感神經 | 標為 needs_review |
| cervix | 子宮頸 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Chamber | 眼房 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| chorda tympani nerve | 鼓索神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Choroid coat | 脈絡膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Choroid plexus | 微血管共同特化形成脈絡叢 | 標為 needs_review |
| Ciliary body | 睫狀體 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| ciliary ganglion | 傳遞睫狀神經節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ciliary muscle | 睫狀肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ciliary processes | 睫狀突 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| CN III | 動眼神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| CN IX | 節前神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| CN VII | 顏面神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| CNIII | 動眼神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Coccygeal ganglion | 又名尾神經節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Coccygeal plexus | 尾神經叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Coccygeus muscle | 尾骨肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| collateral a | 深肱動脈分支 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| Common facial vein | 總面靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Common iliac artery | 總髂動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Common iliac nodes | 總骼淋巴結 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Common iliac vein | 可將總髂靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Compressor urethra | 尿道壓迫肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Compressor urethrae m | 旁邊兩條斜走的尿道壓迫肌 | 標為 needs_review |
| Compressor urethrae muscle | 女生是尿道壓迫肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| condylar process | 髁突 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Conjunctiva | 結膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Connection | 上連結 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Cornea | 角膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| coronoid fossa | 冠狀窩 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| coronoid process | 冠狀突 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Corpus callosum | 愈低等的則愈少胼胝體 | 標為 needs_review |
| Corpus cavernosum penis | 陰莖海綿體 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Corpus spongiosum penis | 尿道海綿體 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Corrugator supercilii | 皺眉肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| costal angle | 具有彎曲的肋骨角 | 標為 needs_review |
| costal cartilages | 肋軟骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| costal facet | 胸椎橫突的關節面 | 標為 needs_review |
| Costal groove | 肋間溝 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Costal joints and ligaments | 肋骨相關的關節和韌帶 | 標為 needs_review |
| costal margins | 肋緣 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Costoclavicular ligament | 肋鎖韌帶 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| costotransverse ligament | 關節面則會連接肋橫突韌帶 | 標為 needs_review |
| cranial nerve | 對腦神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| cremaster m | 筋膜 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| cremaster muscle | 提睪肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Cremasteric a | 外精索動脈又名提睪肌動脈 | 標為 needs_review |
| crescent-shaped left gland | 新月形左腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| crest | 中間有嵴 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Cribriform plate | 篩板 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Cricoid cartilage | 軟骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| cutaneous n | 肱肌 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| Cystic a | 進一步分支出膽囊動脈 | 標為 needs_review |
| Cystic vein | 膽囊靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| D. Lingual tonsil | 舌扁桃腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| deep a. to the penis/clitoris | 陰蒂深動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Deep branch | 深支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Deep branch of transverse cervical artery | 橫頸動脈深分支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Deep circumflex iliac artery | 深旋髂動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Deep facial vein | 深面靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Deep head | 深頭 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Deep lobe | 深葉 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Deep petrosal nerve | 深岩神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| deep temporal artery/vein | 靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| deep temporal nerve | 深顳神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Deep transverse perineal muscle | 陰深橫肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| dendrite | 樹突 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| dense fascia | 緻密的筋膜 | 標為 needs_review |
| Dental/Pectinate line | 梳狀線 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Depressor septi nasi | 降鼻中隔肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Dermatome | 生皮筋節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| dermatomes | 皮節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Diaphragm | 橫隔 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Diencephalon | 作用為連結左右間腦 | 標為 needs_review |
| Digastric m | 頸前三角由二腹肌 | 中文名過長或含句子成分 |
| Dilator pupillae | 瞳孔擴張肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| distal phalanx | 指的遠端指節 | 標為 needs_review |
| Dorsal a. to the Penis | 陰莖背動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| dorsal a. to the penis/clitoris | 陰蒂背動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Dorsal midbrain | 中腦的背側面 | 標為 needs_review |
| Dorsal nerve of penis /clitoris | 陰蒂背神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| dorsal rami of spinal n | 脊神經背支 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| dorsal rami of spinal nerves | 由脊神經的背支 | 標為 needs_review |
| Dorsal Root Ganglion | 其胞體位於背根神經節 | 標為 needs_review |
| Dorsal scapular nerve | 背肩胛神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| ductus deferens | 輸精管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Duodenum | 十二指腸 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Efferent ductule | 輸出小管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ejaculatory duct | 射精管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| endometrium | 子宮內膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Endotracheal intubation/ on endo | 較適用氣管插管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Enteric nervous system | 骨盆內臟神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Entrance to bladder | 膀胱開口 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Epicranius aponeurosis | 頭皮腱膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Epicranius muscle | 顱頂肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Erector spinae | 豎棘肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Esophageal branch | 食道支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Esophageal branches of the left gastric vessels | 左胃動脈食道支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Esophageal hiatus | 食道裂孔 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ethmoid bone | 篩骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| ethmoidal sinus | 篩竇 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Excretory ducts of lacrimal gland | 條淚腺外分泌管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ext. anal sphincter | 肛門外括約肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| External anal sphincter muscle | 肛門外括約肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| External anal sphincters | 肛門外括約肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| External auditory meatus | 外耳道 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| External carotid artery | 外頸動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| External genitalia | 到外生殖器 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| External iliac artery | 外髂動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| External iliac nodes | 外骼淋巴結 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| external intercostal membranes | 外肋間膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| External jugular vein | 外頸靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| external os | 外口 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| External Rectal Plexus | 外直腸靜脈叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| External urethral orifice | 尿道外口 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| External urethral sphincter | 尿道外括約肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| External urethral sphincter muscle | 尿道外括約肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Extraocular muscle | 眼外肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Extrinsic eye muscles | 眼球外在肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| facial motor nucleus | 顏面運動核 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Facial nerve | 顏面神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Facial vein | 顏面靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| fascia | 些人闊頸肌薄如筋膜 | 標為 needs_review |
| Femoral artery | 股動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| femoral branch | 股骨支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Femoral nerve | 股神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| flexor digitorum profundus muscle | 屈指伸肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| foramen magnum | 枕骨大孔 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Foramen ovale | 卵圓孔 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Foramen rotundum | 圓孔 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Foramen spinosum | 棘孔 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Foregut | 胰臟 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Frenulum of the clitoris | 陰蒂繫帶 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Frenulum of the labia minora/ fourchette | 小陰唇繫帶 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| frontal bone | 需鋸開方能觀察額骨 | 標為 needs_review |
| Frontal nerve | 額神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Frontalis | 額肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ganglion | 神經節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ganglion impar | 下端匯成一個奇神經節經節 | 標為 needs_review |
| geniculate ganglion | 膝狀神經節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Geniohyoid m | 深層有頦舌骨肌 | 中文名過長或含句子成分 |
| genital branch | 生殖支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| genital branch of genitofemoral n | 生殖支 | 分支／肌腱／系列結構，無法一對一對應 |
| Genitofemoral nerve | 生殖股神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Genitofemoral sulcus | 腿內側的凹陷稱為生殖股溝 | 標為 needs_review |
| Glossopharyngeal n. / CN IX | 舌咽神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Glossopharyngeal nerve | 舌咽神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| gonadal artery | 生殖腺的分支 | 標為 needs_review |
| gracilis | 股薄肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Gray Matter | 灰質區 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Great auricular nerve | 大耳神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| greater and lesser splanchnic nerve | 小內臟神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Greater Auricular | 耳大神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Greater palatine artery | 大顎動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Greater palatine foramen | 腭大孔 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Greater splanchnic nerve | 內臟神經表神經大內臟神經 | 標為 needs_review |
| hamate | 鉤狀骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| head | 陰蒂頭 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Head of a rib | 肋的肋骨頭 | 標為 needs_review |
| Hemiazygos vein | 半奇靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Hepatic artery proper | 肝固有動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Hepatic portal vein | 肝門靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Hepatic vein | 肝靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Hindgut | 後腸 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Hip bone | 髖骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| honeycombed with blood vessel | 佈滿血管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Horizontal fissure | 水平裂 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| humerus | 肱骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Hypogastric nerves | 分成左右的腹下神經 | 標為 needs_review |
| Hypogastric plexus | 腹下神經叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| hypoglossal canal | 過舌下神經管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Hypoglossal nerve | 舌下神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Iliac crest | 橫突髂脊 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Iliac fossa | 髂窩 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| iliacus | 髂肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Iliohypogastric nerve | 髂腹下神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ilioinguinal nerve | 髂腹股溝神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Iliolumbar artery | 內髂動脈的後分支髂腰動脈 | 標為 needs_review |
| Iliolumbar ligament | 髂腰韌帶 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Iliolumbar vein | 髂腰靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ilium | 髂骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Inf. Border of Mandible | 下顎骨下側緣 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Inf. Constrictor m | 升咽動脈 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| inf. epigastric a | 髂動脈分支的下腹壁上動脈 | 標為 needs_review |
| Inf. ganglion | 結狀神經節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Inf. hypogastric plexus | 腹下神經叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Inferior border of mandible | 下頷骨下緣 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| inferior cavity | 下關節腔 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Inferior epigastric artery | 下腹壁動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Inferior fascia | 提肛肌下筋膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Inferior head | 下頭 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Inferior hypogastric plexus | 下腹下神經叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Inferior mesenteric artery | 下腸繫膜動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Inferior mesenteric node | 下腸繫膜淋巴結 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Inferior mesenteric nodes | 腸動脈流向下腸繫膜淋巴結 | 標為 needs_review |
| Inferior mesenteric plexus | 下腸繫膜叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Inferior mesenteric vein | 下腸繫膜靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| inferior orbital fissure | 眶下裂 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| inferior phrenic artery | 下膈動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Inferior phrenic vein | 下膈靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Inferior rectal veins | 下直腸靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Inferior suprarenal artery | 下腎上腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| inferior temporal line | 下顳線 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Inferior thoracic aperture | 下胸開口 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Inferior vena cava | 下腔靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Infra-orbital foramen | 神經末梢主要經由眶下孔 | 標為 needs_review |
| infraorbital fissure | 眶下裂 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Infraorbital foramen | 眶下孔 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Infraorbital nerve | 眶下神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| infrasternal/subcostal angle | 胸骨下角 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| infratemporal crest | 顳下脊 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| infratemporal fossa | 顳下區 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| infratrochlear nerve | 滑車下神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| inguinal canal | 側邊進入腹股溝 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Inguinal nodes | 鼠蹊淋巴結 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Int. anal sphincter | 肛門內括約肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Interclavicular ligament | 鎖骨間韌帶 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| intercostal artery | 肋間動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| intercostal muscles | 肋間肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| intercostal n | 側皮神經會和第二肋間神經 | 標為 needs_review |
| intercostobrachial n | 皮分支結合形成肋間臂神經 | 標為 needs_review |
| Intermesenteric plexus | 中腸繫膜叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| intermuscular septum | 肌間隔 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Internal acoustic meatus | 內耳道 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Internal carotid artery | 內頸動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Internal iliac artery | 內髂動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Internal iliac nodes | 內骼淋巴結 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Internal Iliac vein | 內髂靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| internal intercostal membranes | 內肋間膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| internal jugular vein | 內頸靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| internal oblique abdominis | 腹內斜肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| internal oblique m | 腱膜 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| internal os | 上而下分為內口 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Internal Rectal Plexus | 內直腸靜脈叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| internal thoracic a | 源自內胸動脈 | 中文名過長或含句子成分 |
| internal thoracic artery | 分支出內胸動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| internal thoracic vein | 部分流入內胸靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Internal urethral orifice | 下方頂點為內尿道開口 | 標為 needs_review |
| Internal urethral sphincter | 尿道內括約肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| interosseous membrane | 前臂透過骨間膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Intertubercular groove of humerus | 肱骨結節間溝 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| intertubercular sulcus | 肱骨結節間溝 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Interureteric crest | 輸尿管間嵴 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Intestinal a | 下胰十二指腸動脈小腸動脈 | 標為 needs_review |
| Intestinal trunk | 腸幹 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Intramural part | 尿道內口 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Iris | 虹膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ischial tuberosities | 坐骨粗隆 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ischioanal fossa | 坐骨肛門窩 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ischioanal fossa/Ischiorectal fossa | 坐骨直腸窩 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ischiopubic rami | 坐骨恥骨支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ischiorectal fossa | 坐骨直腸窩 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| joints of the thoracic wall | 胸壁關節和韌帶 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| jugular foramen | 過頸靜脈孔 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| jugular lymphatic trunks | 方向匯流至頸部淋巴幹 | 標為 needs_review |
| Labia majora | 大陰唇 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Labium minora | 小陰唇 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Lacrimal apparatus | 淚器 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Lacrimal canaliculus | 下淚小管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Lacrimal gland | 淚腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Lacrimal nerve | 淚神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Lacrimal sac | 淚囊 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| lactiferous duct | 腺小葉分泌乳汁經由乳腺管 | 標為 needs_review |
| Lactiferous ducts | 汁會經由放射排列的輸乳管 | 標為 needs_review |
| lactiferous sinus | 並將乳汁匯集輸乳竇 | 標為 needs_review |
| Laryngopharynx | 喉咽 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| larynx | 控制喉 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Lateral arcuate ligament | 外側韌帶 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Lateral femoral cutaneous nerve | 外股皮神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| lateral horn | 髓鞘節前神經元自主神經節 | 標為 needs_review |
| Lateral sacral artery | 外薦動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| lateral thoracic artery | 分支出外胸動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Lateral ventricles | 大腦內的兩個側腦室 | 標為 needs_review |
| latissimus dorsi | 闊背肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Left hepatic a | 胃十二肝固有動脈左肝動脈 | 標為 needs_review |
| Left subclavian trunk | 左鎖骨下幹 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| left subclavian vein | 左鎖骨下靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| left venous angle | 靜脈吻合處會形成左靜脈角 | 標為 needs_review |
| Lens | 水晶體 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Lesser omentum | 小網膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Lesser palatine artery | 小顎動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Lesser petrosal nerve | 小岩神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Levator ani | 提肛肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Levator ani muscle | 提肛肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Lingual nerve | 舌神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| lingula | 蝶骨棘到下頷骨的小舌突 | 標為 needs_review |
| Liver | 應的血液供應來源器官肝臟 | 標為 needs_review |
| lobule | 葉再分出小葉 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| long head of triceps brachii | 肱三頭肌長頭 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| long thoracic nerve | 長胸神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Longus Colli muscle | 頸椎高度以及頸長肌 | 標為 needs_review |
| Lower anterior border of the right lung | 右肺下緣 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Lumbar artery | 之相對的腰動脈 | 標為 needs_review |
| Lumbar vein | 腰靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Lumbar/para-aortic nodes | 上移到腰淋巴結 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Lumbosacral trunk | 腰薦神經幹 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| lunate | 月狀骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| madibular foramen | 同名神經伴行通過下頷孔 | 標為 needs_review |
| Main divisions of CN V | 三叉神經三分支 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| Main Trunk Branches | 主幹分支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| mammary gland | 斷乳癌的重要參考依據乳腺 | 標為 needs_review |
| mammary gland lobules | 個乳腺小葉 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| mandibular bone | 下頷骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| mandibular foramen | 下頷孔 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| mandibular fossa | 下頷窩 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| manubrium | 胸骨柄 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| manubrium and sternum | 軟骨連接到胸骨柄和胸骨體 | 標為 needs_review |
| marginal mandibular branch | 下頷緣支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Maxilla | 上頜骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Maxillary artery | 上頷動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Maxillary vein | 上頷靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Medial arcuate ligament | 內側韌帶 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Medial border of scapula | 肩胛骨內側緣 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| medial cutaneous n | 小肌 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| medial mammary branch | 出行走在內側的內乳腺分支 | 標為 needs_review |
| medial pectoral n | 胸大肌 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| Medial pterygoid muscle | 內翼肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Median arcuate ligament | 正中韌帶 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| median n | 蚓狀肌 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| Medulla oblongata | 延腦 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Membranous urethra | 膜狀尿道 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Meningeal branch | 腦膜支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Meningeal nerve | 腦膜分支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Mental foramen | 頦孔 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Mental nerve | 神經末梢其中的頦神經 | 標為 needs_review |
| Mentalis muscle | 頦肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Mesoappendix | 得如果有的話會被闌尾繫膜 | 標為 needs_review |
| mesometrium | 子宮繫膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Mesorectum | 回收直腸繫膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| mesosalpinx | 輸卵管繫膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| mesovarian | 卵巢繫膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| mesovarium | 卵巢繫膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| metacarpal | 塊掌骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| mid-axillary line | 外側緣到腋中線 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Midbrain | 中腦 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Middle colic a | 結腸動脈後再認中結腸動脈 | 標為 needs_review |
| Middle constrictor m | 升咽動脈 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| Middle cranial cavity | 中顱窩 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Middle Cranial Fossa | 中顱窩 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Middle meningeal artery | 中腦膜動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| middle phalanx | 指的中間指節 | 標為 needs_review |
| Middle sacral artery | 正中薦動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| middle subscapular n | 肩胛下肌 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| Middle superior alveolar artery | 中上齒槽動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Middle superior alveolar nerve | 中上齒槽神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Middle suprarenal artery | 中腎上腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Modified sweat gland | 屬於皮膚系統的特化汗腺 | 標為 needs_review |
| Muscles of Mastication | 類別咀嚼肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Muscular triangle | 肌肉三角 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Muscular tube | 肌肉形成的管腔 | 標為 needs_review |
| Musculophrenic artery | 肌膈動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| musculotendinous rotator cuff | 肌腱旋轉套肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| musculus rectus abdominis | 延伸至腹直肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Mylohyoid m | 下層為下頷舌骨肌 | 中文名過長或含句子成分 |
| mylohyoid nerve | 顎舌骨肌神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Nasal cavity | 鼻腔 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Nasal mucosa | 鼻腔黏膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Nasalis | 鼻肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Nasociliary nerve | 鼻睫神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Nasolacrimal duct | 鼻淚管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Nasopalatine artery | 其末端形成鼻顎動脈 | 標為 needs_review |
| Nasopharynx | 鼻咽 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Navicular fossa | 舟狀窩 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Neck | 膀胱頸 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| nerve of pterygoid canal | 翼管神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| nerve plexus | 神經叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Nerve to medial pterygoid muscle | 內翼肌神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Nerves | 神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| neurovascular bundles | 神經血管束 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| nipple | 奶頭 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Nissl body | 尼氏小體 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| node of Ranvier | 中間會有朗氏節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Nucleus | 神經核 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Obturator canal | 閉孔管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| obturator externus | 閉孔外肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Obturator fascia | 閉孔筋膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Obturator membrane | 閉孔膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Obturator nerve | 閉孔神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Occipital artery | 分支包括枕動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Occipital triangle | 枕三角 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Occipitalis | 枕肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Occipitofrontalis | 額枕肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| olecranon | 鷹嘴突 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| olecranon fossa | 鷹嘴窩 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Opening of pharyngotympanic tube | 耳咽管開口 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ophthalmic vein | 眼靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Optic canal | 視神經管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Optic canals | 蝶骨小翼的視神經管 | 標為 needs_review |
| optic disc | 視盤 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Optical Canal | 視神經管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ora serrata | 鋸齒緣 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Orifice of pharyngotympanic tube / Eustachian tube | 耳咽管開口 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Oropharynx | 口咽 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Otic ganglion | 耳神經節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Outer tunica | 構成眼睛外側膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| oval facet/costal facet | 橢圓關節面 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ovarian arteries | 卵巢動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ovarian artery | 卵巢動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ovarian branch | 卵巢支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| ovarian ligament | 卵巢韌帶 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ovarian Venous Plexus | 也包括卵巢靜脈叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Palatine bone | 顎骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| palatine canal | 腭管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Palatine tonsil | 顎扁桃體 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Palatoglossal arch | 顎舌弓 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Palatopharyngeal arch | 顎咽弓 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Palatopharyngeus | 顎咽肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Palatopharyngeus muscle | 顎咽肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| palatovaginal canal | 腭鞘管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Palmaris longus m | 正中神經 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| palmaris longus tendon | 掌長肌肌腱 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Palpebral conjunctiva | 瞼結膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pampiniform venous plexus | 蔓狀靜脈叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pancreas | 前段與後段相通吻合胰臟 | 標為 needs_review |
| Para-aortic lymph node | 主動脈旁淋巴結 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Paranasal sinuses | 鼻竇 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pararectal fossa | 直腸旁窩 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| parasternal lymph node | 胸骨旁淋巴結 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Parasympathetic ganglion | 屬於副交感神經節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Parasympathetic nerve | 消化相關的副交感神經 | 標為 needs_review |
| Parathyroid | 副甲狀腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Paraumbilical vein | 臍旁靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Paravesical fossa | 膀胱旁窩 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Parietal plexus | 動脈周壁神經叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Parotid duct | 耳下腺管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Parotid gland | 腮腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| parotid salivery gland | 腮腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pectineal line | 肋骨恥骨線 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pectoralis major | 胸大肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| pelvic brim | 骨盆緣 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pelvic brim/inlet | 入口 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pelvic diaphragm | 骨盆膈膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pelvic inlet | 骨盆入口 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pelvic outlet | 骨盆出口 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pelvic pain line | 骨盆痛覺線 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| pelvic splanchnic nerve | 骨盆內臟神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pelvic Viscera | 骨盆腔內臟器的靜脈叢 | 標為 needs_review |
| Periarterial plexus | 動脈周壁神經叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pericardiacophrenic artery | 心包膜膈動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| perimetrium | 子宮外膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Perineal a./ v./ n | 靜脈及陰部神經的會陰分支 | 標為 needs_review |
| Perineal body | 陰體 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Perineal branches of internal pudendal vessels | 內陰動靜脈的會陰分支 | 標為 needs_review |
| Perineal branches of pudendal n | 陰部神經的會陰分支 | 標為 needs_review |
| Perineal membrane | 陰膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| perineal muscles | 陰肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Perineal nerve | 陰神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| peritoneal body | 陰體 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Peritoneum | 脹大的膀胱會將腹膜 | 標為 needs_review |
| Petrotympanic fissure | 岩鼓溝 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| phalanges | 塊指骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pharyngeal constrictor | 下咽縮肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pharyngeal recesses | 咽隱窩 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pharyngeal tonsil | 咽扁桃腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pharyngotympanic tube | 耳咽管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| phrenic nerve | 膈神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| pisiform | 豆狀骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| pituitary | 甲狀腺分泌由腦下垂體 | 標為 needs_review |
| pituitary gland | 腦下垂體 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Platysma muscle | 闊頸肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pons | 橋腦 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| pons-medulla border | 橋腦延腦緣 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Portal triad | 外側為六組肝門三體 | 標為 needs_review |
| Post. Border of the Sternocleidomastoid m | 胸鎖乳突肌的後側緣 | 標為 needs_review |
| post. rami of spinal n | 脊神經後支 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| Post. recesses | 後隱窩 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Posterior auricular artery | 耳後動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Posterior auricular vein | 耳後靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Posterior border of the sternocleidomastoid muscle | 胸鎖乳突肌後緣 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Posterior branch | 後支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Posterior chamber | 後房 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| posterior interosseous nerve | 後骨間神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Posterior superior alveolar artery | 後上齒槽動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Posterior superior alveolar nerve | 後上齒槽神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Posterior triangle | 下列何者不是頸部後三角 | 標為 needs_review |
| Postganglionic parasympathetic | 副交感節後神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Postganglionic sympathetic | 交感節後神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pre-aortic lymph node | 主動脈前淋巴結 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pretracheal fascia | 氣管前筋膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Primary olfactory cortex | 嗅皮質區 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Procerus | 降眉間肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| profunda brachii a | 後側索 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| Pronator teres m | 神經 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| Prostate | 前列腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Prostatic branch | 前列腺支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Prostatic urethra | 前列腺尿道 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Prostatic utricle | 中央大洞為前列腺小囊開口 | 標為 needs_review |
| protrusion | 可執行下顎骨前突 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Proximal urethra | 近端尿道 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| pterygoid br | 內翼肌動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pterygoid canal | 翼管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pterygoid plexus | 翼顎靜脈叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pterygoid process | 翼突 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pterygoid venous plexus | 翼靜脈叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pterygomaxillary fissure | 翼上頜裂 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pterygopalatine fossa | 翼顎窩 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pterygopalatine ganglion | 翼顎神經節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pubic arch | 利於生育恥骨下角 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pubic br | 恥骨支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| pubic region | 恥骨區 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pubic Tributary vein | 恥骨靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pubo-analis mi | 恥骨肛門肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pudendal canal | 陰部管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pudendal nerve | 陰部神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Pupil | 瞳孔 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| pyramidal right gland | 金字塔形右腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| quadrangular space | 方形間隙 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| quadricepts | 股四頭肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| R. lymphatic duct | 右淋巴總管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| radial groove | 後側肌肉橈神經溝 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| radial nerve | 橈神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| radial tuberosity | 橈骨粗隆 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| radius | 橈骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| ramus of mandible | 下顎支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Reccurent laryngeal | 喉返神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Recesses | 坐骨肛門窩的隱窩 | 標為 needs_review |
| Rectal Venous Plexus | 藉直腸靜脈叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Rectovaginal septum | 直腸陰道隔膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Rectovesical septum | 直腸膀胱隔膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Rectum | 直腸 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| recurrent branch of median n | 神經 | 分支／肌腱／系列結構，無法一對一對應 |
| Renal artery | 腎動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| renal fascia | 腎筋膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Renal papilla | 匯集成腎乳突 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Renal pyramid | 腎錐體 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Renal sinus | 腎竇 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Renal vein | 腎靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Respiratory Muscles | 呼吸肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Retina | 眼睛的視網膜 | 標為 needs_review |
| retromammary space | 第四肋間的高度乳房後間隙 | 標為 needs_review |
| Retromandibular vein | 下頷後靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| ribs | 肋骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Right acromioclavicular joint | 右肩鎖關節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Right and left gastric vein | 左右胃靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Right and left lateral aortic node | 左右側主動脈淋巴結 | 標為 needs_review |
| Right and left lateral lumbar node | 左右側腰淋巴結 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Right and left lumbar trunk | 左右腰幹 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Right gastro-omental artery | 右胃網膜動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Right gonadal vein | 右生殖腺靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Right lymphatic duct | 右側匯入右淋巴總管 | 標為 needs_review |
| Right oblique fissure | 右肺斜裂 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Right phrenic nerve | 右膈神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Right recurrent laryngeal n | 交感神經幹 | 中文名類型與英文後綴不符（疑似抽取錯位） |
| Right subclavian trunk | 右鎖骨下幹 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Right suprarenal vein | 右腎上腺靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| rough non-articular part | 不平滑非關節面 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| round ligament of uterus | 子宮圓韌帶 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Sacral hiatus | 尾神經從薦骨裂孔 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Sacral nodes | 薦淋巴結 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Sacral plexus | 薦神經叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Sacral sympathetic trunk | 薦交感幹 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Sacral Venous Plexus | 脈的枝流聚集成的薦靜脈叢 | 標為 needs_review |
| Sacro-iliac joint | 薦髂關節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Sacrotuberous ligaments | 薦結節韌帶 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Salpingopharyngeus | 耳咽管肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Salpingopharyngeus muscle | 耳咽管咽肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Scalene tubercle | 溝間以斜角肌節結 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| scaphoid | 舟狀骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| scapula | 肩胛骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| sciatic nerve | 結合後成為坐骨神經 | 標為 needs_review |
| Sclera | 鞏膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Scleral venous sinus | 鞏膜靜脈竇 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Scrotum | 陰囊 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| sebaceous glands | 數條皮脂腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Second upper molar teeth | 開口在上排第二顆臼齒 | 標為 needs_review |
| Segments | 脊髓分節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Seminal branch | 精囊支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Seminal vesicle | 精腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Seminal vesicles | 儲精囊 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Seminiferous tubules | 曲細精管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Serratus anterior | 前鋸肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Sigmoid colon | 部分乙狀結腸 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| smooth articular part | 處結節又再分為平滑關節面 | 標為 needs_review |
| Somatic Arteries for Posterior Abdominal Wall | 後腹壁的動脈 | 標為 needs_review |
| Somatic nerves | 非自主神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| spermatic cord | 精索 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Sphenoid | 蝶骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Sphenoid bone | 蝶骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| sphenoid sinus | 蝶竇 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Sphenopalatine foramen | 蝶顎孔 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| sphincter muscle | 隔絕眼部與外界屬於括約肌 | 標為 needs_review |
| Sphincter pupillae | 瞳孔括約肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| spinal cord | 脊髓 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| spinal meninges | 脊髓外有三層結構的脊髓膜 | 標為 needs_review |
| spinal nerve | 對脊神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| spine crest | 菱形肌與大菱形肌以肩胛脊 | 標為 needs_review |
| Splenic vein | 脾靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Spongy urethra | 海綿體尿道 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Stellate ganglion | 星狀神經節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Sternal angle | 胸骨角 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Sternal joints | 胸骨關節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Sternebrae | 胸小骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| sternocleidomastoid | 胸鎖乳突肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Sternum | 胸骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| sternum and xiphoid process | 肋軟骨連接到胸骨體和劍突 | 標為 needs_review |
| stylohyoid muscle | 莖突舌骨肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| styloid process | 莖突 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Stylomastoid foramen | 莖乳突孔 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Stylopharyngeus | 莖肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Stylopharyngeus muscle | 莖突咽肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| subclavian artery | 鎖骨下動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| subclavian lymphatic trunk | 帶回鎖骨下淋巴幹 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Subcostal nerve | 先找肋骨下緣的肋下神經 | 標為 needs_review |
| Sublingual gland | 舌下腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Submandibular gland | 下頷下腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Submandibular triangle | 下頷下三角 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Submental triangle | 頦下三角 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Suboccipital Region | 枕下三角 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Subscapularis | 肩胛下肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Sup. Cervical sympathetic ganglion | 交感神經的上頸神經節 | 標為 needs_review |
| Sup. part of vagina | 上半部陰道 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Sup. Surface of the Clavicle | 鎖骨的上表面 | 標為 needs_review |
| Superficial branch | 淺支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superficial circumflex iliac artery | 淺旋髂動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superficial epigastric artery | 淺腹壁動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superficial head | 淺頭 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superficial inguinal nodes | 淺鼠蹊淋巴結 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superficial lobe | 淺葉 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superficial temporal artery | 淺顳動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superficial temporal vein | 淺顳靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superficial temporal vessels | 淺顳靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superficial transverse perineal m | 陰淺橫肌淺陷凹後緣 | 標為 needs_review |
| Superficial transverse perineal muscle | 陰淺橫肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| superior and inferior vesical veins | 下膀胱靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| superior cavity | 上關節腔 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superior cervical ganglion | 上頸神經節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superior constrictor | 上咽缩肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superior gluteal artery | 上臀動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superior head | 上頭 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superior hypogastric plexus | 上腹下神經叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superior mesenteric node | 上腸繫膜淋巴結 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superior mesenteric plexus | 上腸繫膜叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superior mesenteric vein | 上腸繫膜靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superior oblique | 上斜肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superior ophthalmic vein | 上眼靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superior orbital fissure | 蝶骨的眶上裂 | 標為 needs_review |
| Superior pancreaticoduodenal artery | 上胰十二指腸動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superior phrenic artery | 上膈動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superior rectal artery | 上直腸動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superior suprarenal artery | 上腎上腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superior surface | 上表面 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superior surface of the clavicle | 鎖骨上緣 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| superior temporal line | 上顳線 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Superior thoracic aperture | 上部的腹腔臟器上胸開口 | 標為 needs_review |
| superior vena cava | 上腔靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| supinator muscle | 旋後肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Supra-orbital foramen | 神經末梢主要經眶上孔 | 標為 needs_review |
| Supraclavicular triangle | 鎖骨上三角 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| supraduodenal artery | 上十二指腸動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Supraobital nerve | 眶上神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Supraorbital artery | 分支包括眶上動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Suprarenal artery | 腎上腺動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| suprarenal gland | 腎上腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Supratrochlear artery | 滑車上動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Supratrochlear nerve | 滑車上神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Supravesical fossa | 膀胱上窩 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| surgical anal canal | 外科肛管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Suspension of the penis | 莖根部較容易看到陰莖韌帶 | 標為 needs_review |
| suspensory ligament | 之間懸韌帶 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| suspensory ligament of ovary | 卵巢懸韌帶 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Suspensory ligament of the lens | 維聚集成一束肌腱叫懸韌帶 | 標為 needs_review |
| Sympathetic nerve | 消化相關的交感神經 | 標為 needs_review |
| sympathetic trunk | 交感神經幹 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| symphysis | 屬於軟骨聯合關節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| synovial joint | 屬滑關節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| synovial joints | 屬於滑液關節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Tarsal glands | 瞼腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Tarsal plates | 瞼板 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Temporal branch | 顳支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| temporal fossa | 顳窩 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| temporal line | 顳線 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Temporal lobe | 到達顳葉 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Temporal region | 顳區 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| temporalis muscle | 顳肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Tendinous arch | 腱弓 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| tendon | 肌腱 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| teres major | 大圓肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Testicular arteries | 睪丸動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| testicular artery/vein | 靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| thick disk | 厚圓盤 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| thoracic aorta | 源自胸主動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Thoracic duct | 胸管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| thoracoacromial artery | 胸肩峰動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Thoracodorsal artery | 胸背動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Thoracodorsal nerve | 胸背神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Thoracolumbar Fascia | 胸腰筋膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Thyroid | 甲狀腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Thyroid cartilage | 上從甲狀軟骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Thyroid gland | 甲狀腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Tonsillar ring | 扁桃體 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Transversalis fascia | 連結腹橫筋膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Transverse facial artery | 橫顏動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Transverse ridge | 橫脊 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| trapezium | 大菱形骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| trapezius | 斜方肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| trapezoid | 小菱形骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| triangular space | 三角形間隙 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| triceps brachii | 肱三頭肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Trigeminal ganglion | 三叉神經節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Trigeminal nerve | 三叉神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Trigone | 膀胱三角 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| triquetral | 三角骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Tubal br | 輸卵管支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Tubal br. of ovarian a | 卵巢動脈的輸卵管支 | 標為 needs_review |
| Tubal branch | 輸卵管支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Tubal tonsils | 咽鼓管扁桃腺 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| tubercle | 具有肋骨結節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Tubercle of a rib | 肋骨結節 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| tubercle of rib | 相同數字的肋骨的肋骨結節 | 標為 needs_review |
| Tubuloalveolar exocrine gland | 腺泡狀的複合式外分泌腺 | 標為 needs_review |
| Tubuloalveolar glands | 管泡狀腺體 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Tunica albuginea | 白膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Tympanic membrane | 鼓膜 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Tympanic plexus | 鼓室神經叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Typical ribs | 典型肋骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| ulna | 尺骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| ulnar tuberosity | 尺骨粗隆 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ureter | 輸尿管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ureters | 輸尿管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Urethra | 尿道 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Urethral crest | 尿道脊 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Urethral sphincters | 尿道外括約肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Urethrovaginal sphincter | 尿道陰道括約肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Urogenital hiatus | 泌尿生殖裂口 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Urogenital triangle | 可分為泌尿生殖三角 | 標為 needs_review |
| Uterine artery | 分別會和子宮動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Uterine tube | 輸卵管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Uterine vein | 子宮靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Uterine Venous Plexus | 子宮中段的子宮靜脈叢 | 標為 needs_review |
| vagal trunk | 來自後迷走神經幹 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Vagina | 陰道 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Vaginal branch | 陰道支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Vaginal vein | 陰道靜脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Vaginal Venous Plexus | 陰道上段的陰道靜脈叢 | 標為 needs_review |
| Vague nerve | 迷走神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Vagus n. / CN X | 迷走神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Vagus nerve | 迷走神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Vas deferens | 輸尿管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Vena caval hiatus | 橫膈高度靜脈孔 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| venous angle | 靜脈角 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Venous Plexus | 靜脈叢 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Ventral midbrain | 中腦腹側面 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| vertebral artery | 中間有椎動脈 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Vesical Plexus | 藉膀胱上的膀胱靜脈叢 | 標為 needs_review |
| Vessels | 血管 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Viscera of Pelvic cavity | 骨盆內臟器 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Visceral Arteries for GI Tract | 消化道的動脈 | 標為 needs_review |
| visceral sensory fibers | 臟器感覺神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Visual cortex | 視放射到枕葉的視覺皮質區 | 標為 needs_review |
| White matter | 白質區 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| xiphoid process | 劍突 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Zygomatic arch | 顴弓 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| zygomatic bone | 顴骨 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Zygomatic branch | 顴支 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Zygomatic major muscle | 顴大肌 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Zygomatic nerve | 顴神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Zygomaticofacial nerve | 顴面神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |
| Zygomaticotemporal nerve | 顴顳神經 | 無法判斷結構類型（缺 m/n/a/v/lig 後綴） |

</details>

### 4.2 來源 1 與 glossary 不一致

| 結構 | muscle-layers.json（採用） | glossary.json |
|---|---|---|
| extensor digitorum longus | 伸趾長肌 | 伸指長肌 |
| extensor hallucis brevis | 伸拇趾短肌 | 伸拇短肌 |
| extensor hallucis longus | 伸拇趾長肌 | 伸拇長肌 |
| flexor digitorum longus | 屈趾長肌 | 屈指長肌 |
| flexor hallucis longus | 屈拇趾長肌 | 屈拇長肌 |
| extensor carpi ulnaris | 尺側伸腕肌 | 伸小指肌 |
| extensor pollicis brevis | 伸拇短肌 | 外展大拇指長肌 |
| extensor pollicis longus | 伸拇長肌 | 伸大拇指短肌 |
| flexor carpi radialis | 橈側屈腕肌 | 旋前圓肌 |
| pronator quadratus | 旋前方肌 | 屈拇指長肌 |

### 4.3 同一中文名對應多個不同英文結構

| 中文名 | 對應英文 |
|---|---|
| 動眼神經 | Inferior branch of oculomotor nerve；Superior branch of oculomotor nerve；nucleus of oculomotor nerve；accessory nucleus of oculomotor nerve |
| 鼻睫神經 | nasociliary nerve；Communicating branch of nasociliary nerve with ciliary ganglion |
| 滑車 | Trochlea of superior oblique；trochlear nerve (IV) |
| 拇收肌斜頭 | Oblique head of adductor hallucis；Oblique head of adductor pollicis |
| 拇收肌橫頭 | Transverse head of adductor hallucis；Transverse head of adductor pollicis |
| 中腦導水管 | Cerebral aqueduct；aqueduct of midbrain |
| 穹窿 | fornix of forebrain；fornix |
| 乳頭體 | Mammillary body；mamillary body |
| 視丘髓紋 | stria medullaris of thalamus；stria medullaris thalami |
| 眶回 | Orbital gyrus；orbital gyri |
| 腹腔動脈幹 | Celiac artery；Celiac trunk |
| 結腸邊緣動脈 | Marginal colic artery；Marginal artery of colon |
| 腋神經 | maxillary nerve；meningeal branch of maxillary nerve；axillary nerve |
| 正中神經 | communicating branch of median nerve with ulnar nerve；median nerve |
| 大腦中動脈（M3 段） | middle cerebral artery (M3 segment)；middle cerebral artery (M3-segment) |

（`muscle-layers.json` 本身將 Extensor/Flexor pollicis longus 與 Extensor/Flexor hallucis longus 都寫成「伸拇長肌」「屈拇長肌」，手部與足部同名，請確認是否要改為「伸拇趾長肌」「屈拇趾長肌」。）

### 4.4 程式內建譯名中標示為「組合詞」者

這些名稱由規則組合產生（器官段血管、椎間盤、腦回／溝別名等），已列入 `docs/zh-tw-terminology-review.md`，請抽查。

## 五、全部結構命名一覽

<details><summary>展開 1476 項</summary>

| 結構 | 使用來源 | 中文名 |
|---|---|---|
| Gingiva of upper jaw | 台灣解剖學名詞（程式內建對照表） | 上顎牙齦 |
| Gingiva of lower jaw | 台灣解剖學名詞（程式內建對照表） | 下顎牙齦 |
| lower first secondary molar tooth | 台灣解剖學名詞（程式內建對照表） | 下顎第一恆大臼齒 |
| lower first secondary premolar tooth | 台灣解剖學名詞（程式內建對照表） | 下顎第一恆小臼齒 |
| lower second secondary molar tooth | 台灣解剖學名詞（程式內建對照表） | 下顎第二恆大臼齒 |
| lower second secondary premolar tooth | 台灣解剖學名詞（程式內建對照表） | 下顎第二恆小臼齒 |
| lower central secondary incisor tooth | 台灣解剖學名詞（程式內建對照表） | 下顎恆中切齒 |
| lower lateral secondary incisor tooth | 台灣解剖學名詞（程式內建對照表） | 下顎恆側切齒 |
| lower secondary canine tooth | 台灣解剖學名詞（程式內建對照表） | 下顎恆犬齒 |
| upper first secondary molar tooth | 台灣解剖學名詞（程式內建對照表） | 上顎第一恆大臼齒 |
| upper first secondary premolar tooth | 台灣解剖學名詞（程式內建對照表） | 上顎第一恆小臼齒 |
| upper second secondary molar tooth | 台灣解剖學名詞（程式內建對照表） | 上顎第二恆大臼齒 |
| upper second secondary premolar tooth | 台灣解剖學名詞（程式內建對照表） | 上顎第二恆小臼齒 |
| upper central secondary incisor tooth | 台灣解剖學名詞（程式內建對照表） | 上顎恆中切齒 |
| upper lateral secondary incisor tooth | 台灣解剖學名詞（程式內建對照表） | 上顎恆側切齒 |
| upper secondary canine tooth | 台灣解剖學名詞（程式內建對照表） | 上顎恆犬齒 |
| Anterior chamber of eyeball | 台灣解剖學名詞（程式內建對照表） | 眼前房 |
| anterior ethmoidal nerve | 台灣解剖學名詞（程式內建對照表） | 前篩神經 |
| Check ligament of lateral rectus | 台灣解剖學名詞（程式內建對照表） | 外直肌制止韌帶 |
| choroid | 台灣解剖學名詞（程式內建對照表） | 脈絡膜 |
| corona ciliaris | 台灣解剖學名詞（程式內建對照表） | 睫狀冠 |
| ciliary ganglion | 台灣解剖學名詞（程式內建對照表） | 睫狀神經節 |
| cornea | 台灣解剖學名詞（程式內建對照表） | 角膜 |
| frontal nerve | glossary.json（其他筆記） | 額神經 |
| common tendinous ring | 台灣解剖學名詞（程式內建對照表） | 總腱環 |
| Check ligament of medial rectus | 台灣解剖學名詞（程式內建對照表） | 內直肌制止韌帶 |
| Inferior branch of oculomotor nerve | 台灣解剖學名詞（程式內建對照表） | 動眼神經 |
| inferior oblique | glossary.json（其他筆記） | 下斜肌 |
| inferior rectus | glossary.json（其他筆記） | 下直肌 |
| infratrochlear nerve | 台灣解剖學名詞（程式內建對照表） | 滑車下神經 |
| iris | 台灣解剖學名詞（程式內建對照表） | 虹膜 |
| lacrimal canaliculus | 台灣解剖學名詞（程式內建對照表） | 淚小管 |
| lacrimal gland | 台灣解剖學名詞（程式內建對照表） | 淚腺 |
| lacrimal nerve | glossary.json（其他筆記） | 淚腺神經 |
| lacrimal lake | 台灣解剖學名詞（程式內建對照表） | 淚湖 |
| nasolacrimal duct | 台灣解剖學名詞（程式內建對照表） | 鼻淚管 |
| lateral rectus | glossary.json（其他筆記） | 外直肌 |
| lens | 台灣解剖學名詞（程式內建對照表） | 水晶體 |
| levator palpebrae superioris | glossary.json（其他筆記） | 提上眼瞼肌 |
| medial rectus | glossary.json（其他筆記） | 內直肌 |
| lacrimal sac | 台灣解剖學名詞（程式內建對照表） | 淚囊 |
| nasociliary nerve | glossary.json（其他筆記） | 鼻睫神經 |
| Communicating branch of nasociliary nerve with ciliary ganglion | 台灣解剖學名詞（程式內建對照表） | 鼻睫神經 |
| ophthalmic nerve | 台灣解剖學名詞（程式內建對照表） | 眼神經 |
| optic nerve | glossary.json（其他筆記） | 視神經 |
| posterior ethmoidal nerve | glossary.json（其他筆記） | 後篩神經 |
| Optic part of retina | 台灣解剖學名詞（程式內建對照表） | 視網膜視部 |
| sclera | 台灣解剖學名詞（程式內建對照表） | 鞏膜 |
| long ciliary nerve | glossary.json（其他筆記） | 長睫神經 |
| Short ciliary nerve | glossary.json（其他筆記） | 短睫神經 |
| Suspensory ligament of lens | 台灣解剖學名詞（程式內建對照表） | 水晶體懸韌帶 |
| Superior branch of oculomotor nerve | 台灣解剖學名詞（程式內建對照表） | 動眼神經 |
| superior oblique | 台灣解剖學名詞（程式內建對照表） | 上斜肌 |
| superior rectus | glossary.json（其他筆記） | 上直肌 |
| Tarsal plate of upper eyelid | 台灣解剖學名詞（程式內建對照表） | 上眼瞼瞼板 |
| supra-orbital nerve | 台灣解剖學名詞（程式內建對照表） | 眶上神經 |
| supratrochlear nerve | 台灣解剖學名詞（程式內建對照表） | 滑車上神經 |
| Tarsal plate of lower eyelid | 台灣解剖學名詞（程式內建對照表） | 下眼瞼瞼板 |
| Trochlea of superior oblique | 台灣解剖學名詞（程式內建對照表） | 滑車 |
| trochlear nerve | glossary.json（其他筆記） | 滑車神經 |
| vitreous body | 台灣解剖學名詞（程式內建對照表） | 玻璃體 |
| Tendon of levator palpebrae superioris | 台灣解剖學名詞（程式內建對照表） | 提上瞼肌腱 |
| First lumbrical of foot | 台灣解剖學名詞（程式內建對照表） | 足第一蚓狀肌 |
| First plantar interosseous of foot | 台灣解剖學名詞（程式內建對照表） | 足第一蹠側骨間肌 |
| Second lumbrical of foot | 台灣解剖學名詞（程式內建對照表） | 足第二蚓狀肌 |
| Second plantar interosseous of foot | 台灣解剖學名詞（程式內建對照表） | 足第二蹠側骨間肌 |
| Third lumbrical of foot | 台灣解剖學名詞（程式內建對照表） | 足第三蚓狀肌 |
| Third plantar interosseous of foot | 台灣解剖學名詞（程式內建對照表） | 足第三蹠側骨間肌 |
| Fourth lumbrical of foot | 台灣解剖學名詞（程式內建對照表） | 足第四蚓狀肌 |
| Abductor digiti minimi of foot | muscle-layers.json（foot_sole） | 外展小趾肌 |
| Flexor digiti minimi brevis of foot | muscle-layers.json（foot_sole） | 屈小趾短肌 |
| Interosseous membrane of leg | 台灣解剖學名詞（程式內建對照表） | 小腿骨間膜 |
| Lateral head of flexor hallucis brevis | 台灣解剖學名詞（程式內建對照表） | 拇短屈肌外側頭 |
| Lateral head of gastrocnemius | 台灣解剖學名詞（程式內建對照表） | 腓腸肌外側頭 |
| Long head of biceps femoris | muscle-layers.json（thigh_posterior） | 股二頭肌長頭 |
| Medial head of flexor hallucis brevis | 台灣解剖學名詞（程式內建對照表） | 拇短屈肌內側頭 |
| Medial head of gastrocnemius | 台灣解剖學名詞（程式內建對照表） | 腓腸肌內側頭 |
| Oblique head of adductor hallucis | 台灣解剖學名詞（程式內建對照表） | 拇收肌斜頭 |
| Opponens digiti minimi of foot | 台灣解剖學名詞（程式內建對照表） | 足小趾對蹠肌 |
| abductor hallucis | muscle-layers.json（foot_sole） | 外展拇趾肌 |
| adductor brevis | muscle-layers.json（thigh_medial） | 內收短肌 |
| adductor longus | muscle-layers.json（thigh_medial） | 內收長肌 |
| adductor magnus | muscle-layers.json（thigh_medial） | 內收大肌 |
| adductor minimus | 台灣解剖學名詞（程式內建對照表） | 小收肌 |
| calcaneal tendon | 台灣解剖學名詞（程式內建對照表） | 跟腱 |
| extensor digitorum longus | muscle-layers.json（leg_anterior） | 伸趾長肌 |
| extensor hallucis brevis | muscle-layers.json（foot_dorsum） | 伸拇趾短肌 |
| extensor hallucis longus | muscle-layers.json（leg_anterior） | 伸拇趾長肌 |
| fibularis brevis | muscle-layers.json（leg_lateral） | 腓短肌 |
| fibularis longus | muscle-layers.json（leg_lateral） | 腓長肌 |
| fibularis tertius | muscle-layers.json（leg_anterior） | 第三腓骨肌 |
| flexor accessorius | 台灣解剖學名詞（程式內建對照表） | 足底方肌 |
| flexor digitorum brevis | muscle-layers.json（foot_sole） | 屈趾短肌 |
| flexor digitorum longus | muscle-layers.json（leg_posterior） | 屈趾長肌 |
| flexor hallucis longus | muscle-layers.json（leg_posterior） | 屈拇趾長肌 |
| gemellus inferior | glossary.json（跑考摘要） | 下孖肌 |
| gemellus superior | glossary.json（跑考摘要） | 上孖肌 |
| gluteus maximus | muscle-layers.json（gluteal） | 臀大肌 |
| gluteus medius | muscle-layers.json（gluteal） | 臀中肌 |
| gluteus minimus | muscle-layers.json（gluteal） | 臀小肌 |
| gracilis | muscle-layers.json（thigh_medial） | 股薄肌 |
| iliacus | 台灣解剖學名詞（程式內建對照表） | 髂肌 |
| iliotibial tract | 台灣解剖學名詞（程式內建對照表） | 髂脛束 |
| long plantar ligament | 台灣解剖學名詞（程式內建對照表） | 長足底韌帶 |
| obturator externus | muscle-layers.json（thigh_medial） | 閉孔外肌 |
| obturator internus | muscle-layers.json（gluteal） | 閉孔內肌 |
| pectineus | muscle-layers.json（thigh_medial） | 恥骨肌 |
| piriformis | muscle-layers.json（gluteal） | 梨狀肌 |
| plantaris | muscle-layers.json（leg_posterior） | 蹠肌 |
| popliteus | muscle-layers.json（leg_posterior） | 膕肌 |
| psoas major | glossary.json（其他筆記） | 腰大肌 |
| quadratus femoris | muscle-layers.json（gluteal） | 股方肌 |
| rectus femoris | muscle-layers.json（thigh_anterior） | 股直肌 |
| sartorius | muscle-layers.json（thigh_anterior） | 縫匠肌 |
| semimembranosus | muscle-layers.json（thigh_posterior） | 半膜肌 |
| semitendinosus | muscle-layers.json（thigh_posterior） | 半腱肌 |
| soleus | muscle-layers.json（leg_posterior） | 比目魚肌 |
| tensor fasciae latae | muscle-layers.json（thigh_anterior） | 闊筋膜張肌 |
| tibialis anterior | muscle-layers.json（leg_anterior） | 脛前肌 |
| tibialis posterior | muscle-layers.json（leg_posterior） | 脛後肌 |
| vastus intermedius | muscle-layers.json（thigh_anterior） | 股中間肌 |
| vastus lateralis | muscle-layers.json（thigh_anterior） | 股外側肌 |
| vastus medialis | muscle-layers.json（thigh_anterior） | 股內側肌 |
| Short head of biceps femoris | muscle-layers.json（thigh_posterior） | 股二頭肌短頭 |
| Transverse head of adductor hallucis | 台灣解剖學名詞（程式內建對照表） | 拇收肌橫頭 |
| Abdominal part of pectoralis major | 台灣解剖學名詞（程式內建對照表） | 胸大肌腹部 |
| Clavicular part of pectoralis major | 台灣解剖學名詞（程式內建對照表） | 胸大肌鎖骨頭 |
| Linea alba | 台灣解剖學名詞（程式內建對照表） | 腹白線 |
| coccygeus | glossary.json（其他筆記） | 尾骨肌 |
| superficial perineal muscle | 台灣解剖學名詞（程式內建對照表） | 淺會陰肌 |
| External anal sphincter | 台灣解剖學名詞（程式內建對照表） | 肛門外括約肌 |
| external intercostal muscle | glossary.json（其他筆記） | 外肋間肌 |
| external oblique | 台灣解剖學名詞（程式內建對照表） | 腹外斜肌 |
| iliococcygeus | glossary.json（其他筆記） | 髂骨尾骨肌 |
| innermost intercostal muscle | glossary.json（其他筆記） | 最內肋間肌 |
| internal intercostal muscle | glossary.json（其他筆記） | 內肋間肌 |
| pectoralis minor | 台灣解剖學名詞（程式內建對照表） | 胸小肌 |
| pubococcygeus | glossary.json（其他筆記） | 恥骨尾骨肌 |
| puborectalis | glossary.json（其他筆記） | 恥骨直腸肌 |
| serratus anterior | 台灣解剖學名詞（程式內建對照表） | 前鋸肌 |
| subclavius | 台灣解剖學名詞（程式內建對照表） | 鎖骨下肌 |
| transversus thoracis | 台灣解剖學名詞（程式內建對照表） | 胸橫肌 |
| Set of levatores costarum breves | 台灣解剖學名詞（程式內建對照表） | 短肋提肌群 |
| Set of levatores costarum longi | 台灣解剖學名詞（程式內建對照表） | 長肋提肌群 |
| Sternocostal part of pectoralis major | 台灣解剖學名詞（程式內建對照表） | 胸大肌胸肋頭 |
| tendinous arch of levator ani | 台灣解剖學名詞（程式內建對照表） | 提肛肌腱弓 |
| Abductor digiti minimi of hand | muscle-layers.json（hand） | 外展小指肌 |
| Acromial part of deltoid | 台灣解剖學名詞（程式內建對照表） | 三角肌肩峰部 |
| Clavicular part of deltoid | 台灣解剖學名詞（程式內建對照表） | 三角肌鎖骨部 |
| flexor pollicis brevis | muscle-layers.json（hand） | 屈拇短肌 |
| Flexor digiti minimi brevis of hand | muscle-layers.json（hand） | 屈小指短肌 |
| Flexor retinaculum of wrist | 台灣解剖學名詞（程式內建對照表） | 屈肌支持帶（腕） |
| extensor carpi ulnaris | muscle-layers.json（forearm_extensor） | 尺側伸腕肌 |
| Humeral head of flexor carpi ulnaris | 台灣解剖學名詞（程式內建對照表） | 尺側腕屈肌肱骨頭 |
| Humeral head of pronator teres | 台灣解剖學名詞（程式內建對照表） | 旋前圓肌肱骨頭 |
| flexor digitorum superficialis | muscle-layers.json（forearm_flexor） | 屈指淺肌 |
| Interosseous membrane of forearm | 台灣解剖學名詞（程式內建對照表） | 前臂骨間膜 |
| Lateral head of triceps brachii | muscle-layers.json（arm_posterior） | 肱三頭肌外側頭 |
| Long head of biceps brachii | muscle-layers.json（arm_anterior） | 肱二頭肌長頭 |
| Long head of triceps brachii | muscle-layers.json（arm_posterior） | 肱三頭肌長頭 |
| Medial head of triceps brachii | muscle-layers.json（arm_posterior） | 肱三頭肌內側頭 |
| Oblique head of adductor pollicis | 台灣解剖學名詞（程式內建對照表） | 拇收肌斜頭 |
| Opponens digiti minimi of hand | 台灣解剖學名詞（程式內建對照表） | 小指對掌肌 |
| abductor pollicis brevis | muscle-layers.json（hand） | 外展拇短肌 |
| abductor pollicis longus | muscle-layers.json（forearm_extensor） | 外展拇長肌 |
| anconeus | muscle-layers.json（arm_posterior） | 肘肌 |
| brachialis | muscle-layers.json（arm_anterior） | 肱肌 |
| brachioradialis | muscle-layers.json（forearm_extensor） | 肱橈肌 |
| coracobrachialis | muscle-layers.json（arm_anterior） | 喙肱肌 |
| extensor carpi radialis brevis | muscle-layers.json（forearm_extensor） | 橈側伸腕短肌 |
| extensor carpi radialis longus | muscle-layers.json（forearm_extensor） | 橈側伸腕長肌 |
| extensor digiti minimi | muscle-layers.json（forearm_extensor） | 伸小指肌 |
| extensor digitorum | muscle-layers.json（forearm_extensor） | 伸指肌 |
| extensor indicis | muscle-layers.json（forearm_extensor） | 伸食指肌 |
| extensor pollicis brevis | muscle-layers.json（forearm_extensor） | 伸拇短肌 |
| extensor pollicis longus | muscle-layers.json（forearm_extensor） | 伸拇長肌 |
| flexor carpi radialis | muscle-layers.json（forearm_flexor） | 橈側屈腕肌 |
| flexor digitorum profundus | muscle-layers.json（forearm_flexor） | 屈指深肌 |
| flexor pollicis longus | muscle-layers.json（forearm_flexor） | 屈拇長肌 |
| infraspinatus muscle | muscle-layers.json（scapular） | 棘下肌 |
| opponens pollicis | muscle-layers.json（hand） | 拇對掌肌 |
| palmaris longus | muscle-layers.json（forearm_flexor） | 掌長肌 |
| pronator quadratus | muscle-layers.json（forearm_flexor） | 旋前方肌 |
| subscapularis | muscle-layers.json（scapular） | 肩胛下肌 |
| supinator | muscle-layers.json（forearm_extensor） | 旋後肌 |
| supraspinatus | muscle-layers.json（scapular） | 棘上肌 |
| teres major | muscle-layers.json（scapular） | 大圓肌 |
| teres minor | muscle-layers.json（scapular） | 小圓肌 |
| Set of dorsal interossei of hand | 台灣解剖學名詞（程式內建對照表） | 手背側骨間肌群 |
| Set of lumbricals of hand | 台灣解剖學名詞（程式內建對照表） | 手蚓狀肌群 |
| Set of palmar interossei of hand | 台灣解剖學名詞（程式內建對照表） | 手掌側骨間肌群 |
| Short head of biceps brachii | muscle-layers.json（arm_anterior） | 肱二頭肌短頭 |
| Spinal part of deltoid | 台灣解剖學名詞（程式內建對照表） | 三角肌肩胛棘部 |
| Superficial head of flexor pollicis brevis | 台灣解剖學名詞（程式內建對照表） | 拇短屈肌淺頭 |
| Transverse head of adductor pollicis | 台灣解剖學名詞（程式內建對照表） | 拇收肌橫頭 |
| Ulnar head of pronator teres | 台灣解剖學名詞（程式內建對照表） | 旋前圓肌尺骨頭 |
| Ulnar head of flexor carpi ulnaris | 台灣解剖學名詞（程式內建對照表） | 尺側腕屈肌尺骨頭 |
| Ascending part of trapezius | 台灣解剖學名詞（程式內建對照表） | 斜方肌升部（下部纖維） |
| Descending part of trapezius | 台灣解剖學名詞（程式內建對照表） | 斜方肌降部（上部纖維） |
| lumbar rotator | 台灣解剖學名詞（程式內建對照表） | 腰迴旋肌 |
| cervical rotator | 台灣解剖學名詞（程式內建對照表） | 頸迴旋肌 |
| thoracic rotator | 台灣解剖學名詞（程式內建對照表） | 胸迴旋肌 |
| iliocostalis cervicis | 台灣解剖學名詞（程式內建對照表） | 頸髂肋肌 |
| iliocostalis lumborum | 台灣解剖學名詞（程式內建對照表） | 腰髂肋肌 |
| iliocostalis thoracis | 台灣解剖學名詞（程式內建對照表） | 胸髂肋肌 |
| levator scapulae | muscle-layers.json（back_superficial） | 提肩胛肌 |
| longissimus capitis | 台灣解剖學名詞（程式內建對照表） | 頭最長肌 |
| longissimus cervicis | 台灣解剖學名詞（程式內建對照表） | 頸最長肌 |
| longissimus thoracis | 台灣解剖學名詞（程式內建對照表） | 胸最長肌 |
| rhomboid major | muscle-layers.json（back_superficial） | 大菱形肌 |
| rhomboid minor | muscle-layers.json（back_superficial） | 小菱形肌 |
| semispinalis capitis | muscle-layers.json（back_deep） | 頭半棘肌 |
| semispinalis cervicis | muscle-layers.json（back_deep） | 頸半棘肌 |
| semispinalis thoracis | 台灣解剖學名詞（程式內建對照表） | 胸半棘肌 |
| serratus posterior inferior | muscle-layers.json（back_superficial） | 後下鋸肌 |
| serratus posterior superior | muscle-layers.json（back_superficial） | 後上鋸肌 |
| spinalis | muscle-layers.json（back_deep） | 棘肌 |
| spinalis thoracis | 台灣解剖學名詞（程式內建對照表） | 胸棘肌 |
| splenius capitis | muscle-layers.json（back_deep） | 頭夾肌 |
| splenius cervicis | muscle-layers.json（back_deep） | 頸夾肌 |
| lateral lumbar intertransversarius | 台灣解剖學名詞（程式內建對照表） | 腰外側橫突間肌 |
| medial lumbar intertransversarius | 台灣解剖學名詞（程式內建對照表） | 腰內側橫突間肌 |
| set of anterior cervical intertransversarii | 台灣解剖學名詞（程式內建對照表） | 頸前橫突間肌群 |
| set of interspinales lumborum | 台灣解剖學名詞（程式內建對照表） | 腰棘間肌群 |
| interspinalis thoracis | 台灣解剖學名詞（程式內建對照表） | 胸棘間肌 |
| set of interspinales cervicis | 台灣解剖學名詞（程式內建對照表） | 頸棘間肌群 |
| set of posterior cervical intertransversarii | 台灣解剖學名詞（程式內建對照表） | 頸後橫突間肌群 |
| Transverse part of trapezius | 台灣解剖學名詞（程式內建對照表） | 斜方肌橫部（中部纖維） |
| digastric | 台灣解剖學名詞（程式內建對照表） | 二腹肌 |
| Inferior oblique part of longus colli | 台灣解剖學名詞（程式內建對照表） | 頸長肌下斜部 |
| platysma | glossary.json（其他筆記） | 闊頸肌 |
| geniohyoid | 台灣解剖學名詞（程式內建對照表） | 頦舌骨肌 |
| longus capitis | 台灣解剖學名詞（程式內建對照表） | 頭長肌 |
| mylohyoid | 台灣解剖學名詞（程式內建對照表） | 下頜舌骨肌 |
| obliquus capitis inferior | muscle-layers.json（suboccipital） | 頭下斜肌 |
| obliquus capitis superior | muscle-layers.json（suboccipital） | 頭上斜肌 |
| omohyoid | glossary.json（其他筆記） | 肩胛舌骨肌 |
| rectus capitis anterior | 台灣解剖學名詞（程式內建對照表） | 頭前直肌 |
| rectus capitis posterior major | muscle-layers.json（suboccipital） | 頭後大直肌 |
| rectus capitis posterior minor | muscle-layers.json（suboccipital） | 頭後小直肌 |
| rectus capitis lateralis | 台灣解剖學名詞（程式內建對照表） | 頭外側直肌 |
| scalenus anterior | 台灣解剖學名詞（程式內建對照表） | 前斜角肌 |
| scalenus medius | 台灣解剖學名詞（程式內建對照表） | 中斜角肌 |
| scalenus posterior | 台灣解剖學名詞（程式內建對照表） | 後斜角肌 |
| sternocleidomastoid | 台灣解剖學名詞（程式內建對照表） | 胸鎖乳突肌 |
| sternohyoid | glossary.json（其他筆記） | 胸骨舌骨肌 |
| sternothyroid | glossary.json（其他筆記） | 胸骨甲狀肌 |
| stylohyoid | 台灣解剖學名詞（程式內建對照表） | 莖突舌骨肌 |
| thyrohyoid | 台灣解剖學名詞（程式內建對照表） | 甲狀舌骨肌 |
| intermediate tendon | 台灣解剖學名詞（程式內建對照表） | 中間腱 |
| Superior oblique part of longus colli | 台灣解剖學名詞（程式內建對照表） | 頸長肌上斜部 |
| Vertical intermediate part of longus colli | 台灣解剖學名詞（程式內建對照表） | 頸長肌垂直中間部 |
| anterior cerebral artery | 台灣解剖學名詞（程式內建對照表） | 大腦前動脈 |
| Anterior communicating artery | 台灣解剖學名詞（程式內建對照表） | 前交通動脈 |
| anterior inferior cerebellar artery | 台灣解剖學名詞（程式內建對照表） | 小腦前下動脈 |
| anterior spinal artery | 台灣解剖學名詞（程式內建對照表） | 脊髓前動脈 |
| anterior choroidal artery | 台灣解剖學名詞（程式內建對照表） | 脈絡叢前動脈 |
| anterior temporal artery | 台灣解剖學名詞（程式內建對照表） | 顳前動脈 |
| Insular part of middle cerebral artery | 台灣解剖學名詞（程式內建對照表） | 大腦中動脈島部 |
| Anterior temporal branch of lateral occipital artery | 台灣解剖學名詞（程式內建對照表） | 外側枕動脈前顳支 |
| Anterolateral central branch of middle cerebral artery | 台灣解剖學名詞（程式內建對照表） | 大腦中動脈前外側中央支 |
| artery of central sulcus | 台灣解剖學名詞（程式內建對照表） | 中央溝動脈 |
| Artery of postcentral sulcus | 台灣解剖學名詞（程式內建對照表） | 中央後溝動脈 |
| anterior parietal artery | 台灣解剖學名詞（程式內建對照表） | 頂前動脈 |
| Artery of precentral sulcus | 台灣解剖學名詞（程式內建對照表） | 中央前溝動脈 |
| Precuneal branch of pericallosal artery | 台灣解剖學名詞（程式內建對照表） | 胼胝體周動脈楔前葉支 |
| Basilar artery | 台灣解剖學名詞（程式內建對照表） | 基底動脈 |
| Branch of middle cerebral artery to angular gyrus | 台灣解剖學名詞（程式內建對照表） | 大腦中動脈至角回之分支 |
| Branch of anterior choroidal artery to posterior limb of internal capsule | 台灣解剖學名詞（程式內建對照表） | 脈絡叢前動脈至內囊後肢之分支 |
| thalamogeniculate artery | 台灣解剖學名詞（程式內建對照表） | 視丘膝狀體動脈 |
| callosomarginal artery | 台灣解剖學名詞（程式內建對照表） | 胼胝體邊緣動脈 |
| splenial artery | 台灣解剖學名詞（程式內建對照表） | 胼胝體壓部動脈 |
| Hypothalamic branch of posterior communicating artery | 台灣解剖學名詞（程式內建對照表） | 後交通動脈下視丘支 |
| Middle temporal branch of lateral occipital artery | 台灣解剖學名詞（程式內建對照表） | 外側枕動脈中顳支 |
| Intermediomedial branch of callosomarginal artery | 台灣解剖學名詞（程式內建對照表） | 胼胝體邊緣動脈中內支 |
| internal carotid artery | glossary.json（其他筆記） | 內頸動脈 |
| Lateral branch of superior cerebellar artery | 台灣解剖學名詞（程式內建對照表） | 小腦上動脈外側支 |
| Lateral branch of pontine artery | 台灣解剖學名詞（程式內建對照表） | 橋腦動脈外側支 |
| lateral frontobasal artery | 台灣解剖學名詞（程式內建對照表） | 外側額底動脈 |
| lateral occipital artery | 台灣解剖學名詞（程式內建對照表） | 外側枕動脈 |
| Medial branch of superior cerebellar artery | 台灣解剖學名詞（程式內建對照表） | 小腦上動脈內側支 |
| Medial branch of pontine artery | 台灣解剖學名詞（程式內建對照表） | 橋腦動脈內側支 |
| medial frontobasal artery | 台灣解剖學名詞（程式內建對照表） | 內側額底動脈 |
| medial occipital artery | 台灣解剖學名詞（程式內建對照表） | 枕內側動脈 |
| Sphenoid part of middle cerebral artery | 台灣解剖學名詞（程式內建對照表） | 大腦中動脈蝶部 |
| Middle temporal branch of middle cerebral artery | 台灣解剖學名詞（程式內建對照表） | 大腦中動脈中顳支 |
| ophthalmic artery | glossary.json（其他筆記） | 眼動脈 |
| Paracentral branch of callosomarginal artery | 台灣解剖學名詞（程式內建對照表） | 胼胝體邊緣動脈中央旁支 |
| pericallosal artery | 台灣解剖學名詞（程式內建對照表） | 胼胝體周動脈 |
| posterior inferior cerebellar artery | 台灣解剖學名詞（程式內建對照表） | 小腦後下動脈 |
| polar temporal artery | 台灣解剖學名詞（程式內建對照表） | 顳極動脈 |
| posterior communicating artery | 台灣解剖學名詞（程式內建對照表） | 後交通動脈 |
| Postcommunicating part of posterior cerebral artery | 台灣解剖學名詞（程式內建對照表） | 大腦後動脈交通後部 |
| posterior parietal artery | 台灣解剖學名詞（程式內建對照表） | 頂後動脈 |
| Posterior temporal branch of middle cerebral artery | 台灣解剖學名詞（程式內建對照表） | 大腦中動脈後顳支 |
| Trunk of inferior terminal branch of middle cerebral artery | 台灣解剖學名詞（程式內建對照表） | 大腦中動脈下終支幹 |
| set of posterior temporal branches of lateral occipital artery | 台灣解剖學名詞（程式內建對照表） | 外側枕動脈後顳支 |
| thalamoperforating artery | 台灣解剖學名詞（程式內建對照表） | 視丘穿通動脈 |
| Posteromedial central branch of posterior cerebral artery | 台灣解剖學名詞（程式內建對照表） | 大腦後動脈後內側中央支 |
| Posteromedial branch of callosomarginal artery | 台灣解剖學名詞（程式內建對照表） | 胼胝體邊緣動脈後內側支 |
| Precommunicating part of posterior cerebral artery | 台灣解剖學名詞（程式內建對照表） | 大腦後動脈交通前部 |
| prefrontal artery | 台灣解剖學名詞（程式內建對照表） | 前額動脈 |
| vertebral artery | 台灣解剖學名詞（程式內建對照表） | 椎動脈 |
| superior cerebellar artery | 台灣解剖學名詞（程式內建對照表） | 小腦上動脈 |
| posterior medial choroidal artery | 台灣解剖學名詞（程式內建對照表） | 脈絡叢後內側動脈 |
| Superior vermian branch of medial branch of superior cerebellar artery | 台灣解剖學名詞（程式內建對照表） | 小腦上動脈內側支上小腦蚓支 |
| Temporo-occipital branch of middle cerebral artery | 台灣解剖學名詞（程式內建對照表） | 大腦中動脈顳枕支 |
| Third ventricle | 台灣解剖學名詞（程式內建對照表） | 第三腦室 |
| Fourth ventricle | 台灣解剖學名詞（程式內建對照表） | 第四腦室 |
| angular gyrus | 台灣解剖學名詞（程式內建對照表） | 角回 |
| Anterior commissure | 台灣解剖學名詞（程式內建對照表） | 前連合 |
| Brachium of superior colliculus | 台灣解剖學名詞（程式內建對照表） | 上丘臂 |
| Central canal of spinal cord | 台灣解剖學名詞（程式內建對照表） | 脊髓中央管 |
| Cerebral aqueduct | 台灣解剖學名詞（程式內建對照表） | 中腦導水管 |
| cingulate gyrus | 台灣解剖學名詞（程式內建對照表） | 扣帶回 |
| Commissure of fornix of forebrain | 台灣解剖學名詞（程式內建對照表） | 穹窿連合 |
| Corpus callosum | 台灣解剖學名詞（程式內建對照表） | 胼胝體 |
| Habenula | 台灣解剖學名詞（程式內建對照表） | 韁核 |
| inferior frontal gyrus | 台灣解剖學名詞（程式內建對照表） | 額下回 |
| inferior temporal gyrus | 台灣解剖學名詞（程式內建對照表） | 顳下回 |
| insula | 台灣解剖學名詞（程式內建對照表） | 腦島 |
| internal capsule | 台灣解剖學名詞（程式內建對照表） | 內囊 |
| Interventricular foramen | 台灣解剖學名詞（程式內建對照表） | 室間孔（Monro 孔） |
| amygdala | 台灣解剖學名詞（程式內建對照表） | 杏仁核 |
| caudate nucleus | 台灣解剖學名詞（程式內建對照表） | 尾狀核 |
| Choroid plexus of cerebral hemisphere | 台灣解剖學名詞（程式內建對照表） | 大腦半球脈絡叢 |
| fornix of forebrain | 台灣解剖學名詞（程式內建對照表） | 穹窿 |
| globus pallidus | 台灣解剖學名詞（程式內建對照表） | 蒼白球 |
| White matter of cerebral hemisphere | 台灣解剖學名詞（程式內建對照表） | 大腦半球白質 |
| hippocampus | 台灣解剖學名詞（程式內建對照表） | 海馬 |
| Hypothalamus | 台灣解剖學名詞（程式內建對照表） | 下視丘 |
| Brachium of inferior colliculus | 台灣解剖學名詞（程式內建對照表） | 下丘臂 |
| inferior colliculus | 台灣解剖學名詞（程式內建對照表） | 下丘 |
| Interpeduncular fossa | 台灣解剖學名詞（程式內建對照表） | 腳間窩 |
| Lamina terminalis | 台灣解剖學名詞（程式內建對照表） | 終板 |
| lateral geniculate body | 台灣解剖學名詞（程式內建對照表） | 外側膝狀體 |
| lateral ventricle | 台灣解剖學名詞（程式內建對照表） | 側腦室 |
| Mammillary body | 台灣解剖學名詞（程式內建對照表） | 乳頭體 |
| Medulla oblongata | 台灣解剖學名詞（程式內建對照表） | 延腦 |
| Midbrain | 台灣解剖學名詞（程式內建對照表） | 中腦 |
| Optic chiasm | 台灣解剖學名詞（程式內建對照表） | 視交叉 |
| optic tract | 台灣解剖學名詞（程式內建對照表） | 視徑 |
| Peduncle of midbrain | 台灣解剖學名詞（程式內建對照表） | 中腦腳 |
| Pons | 台灣解剖學名詞（程式內建對照表） | 橋腦 |
| putamen | 台灣解剖學名詞（程式內建對照表） | 殼核 |
| stria medullaris of thalamus | 台灣解剖學名詞（程式內建對照表） | 視丘髓紋 |
| stria terminalis | 台灣解剖學名詞（程式內建對照表） | 終紋 |
| superior colliculus | 台灣解剖學名詞（程式內建對照表） | 上丘 |
| Tuber cinereum | 台灣解剖學名詞（程式內建對照表） | 灰結節 |
| Cerebellum | 台灣解剖學名詞（程式內建對照表） | 小腦 |
| thalamus | 台灣解剖學名詞（程式內建對照表） | 視丘 |
| fusiform gyrus | 台灣解剖學名詞（程式內建對照表） | 梭狀回 |
| parahippocampal gyrus | 台灣解剖學名詞（程式內建對照表） | 海馬旁回 |
| middle frontal gyrus | 台灣解剖學名詞（程式內建對照表） | 額中回 |
| middle temporal gyrus | 台灣解剖學名詞（程式內建對照表） | 顳中回 |
| occipital lobe | 台灣解剖學名詞（程式內建對照表） | 枕葉 |
| Orbital gyrus | 台灣解剖學名詞（程式內建對照表） | 眶回 |
| Pineal body | 台灣解剖學名詞（程式內建對照表） | 松果體 |
| Pituitary gland | 台灣解剖學名詞（程式內建對照表） | 腦下垂體 |
| postcentral gyrus | 台灣解剖學名詞（程式內建對照表） | 中央後回 |
| Posterior commissure | 台灣解剖學名詞（程式內建對照表） | 後連合 |
| precentral gyrus | 台灣解剖學名詞（程式內建對照表） | 中央前回 |
| medial geniculate body | 台灣解剖學名詞（程式內建對照表） | 內側膝狀體 |
| Septum of telencephalon | 台灣解剖學名詞（程式內建對照表） | 端腦中隔 |
| superior frontal gyrus | 台灣解剖學名詞（程式內建對照表） | 額上回 |
| superior parietal lobule | 台灣解剖學名詞（程式內建對照表） | 頂上小葉 |
| Anterior part of superior temporal gyrus | 台灣解剖學名詞（程式內建對照表） | 顳上回前部 |
| Posterior part of superior temporal gyrus | 台灣解剖學名詞（程式內建對照表） | 顳上回後部 |
| supramarginal gyrus | 台灣解剖學名詞（程式內建對照表） | 緣上回 |
| Tentorium cerebelli | 台灣解剖學名詞（程式內建對照表） | 小腦幕 |
| Celiac artery | 台灣解剖學名詞（程式內建對照表） | 腹腔動脈幹 |
| Hepatic portal vein | 台灣解剖學名詞（程式內建對照表） | 肝門靜脈 |
| Hepatovenous segment IX | 台灣解剖學名詞（程式內建對照表） | 肝第 IX 段 |
| Tributary of middle hepatic vein | 台灣解剖學名詞（程式內建對照表） | 中肝靜脈屬支 |
| lobe branch of hepatic artery | 台灣解剖學名詞（程式內建對照表） | 肝動脈葉支 |
| Caudate lobe tributary of hepatic biliary tree | 台灣解剖學名詞（程式內建對照表） | 肝內膽管樹尾狀葉屬支 |
| portal vein | 台灣解剖學名詞（程式內建對照表） | 門靜脈 |
| Pancreas | 台灣解剖學名詞（程式內建對照表） | 胰臟 |
| Pancreatic duct | 台灣解剖學名詞（程式內建對照表） | 胰管 |
| Caudate lobe branch of portal vein | 台灣解剖學名詞（程式內建對照表） | 門靜脈尾狀葉葉支 |
| Caudate lobe branch of hepatic artery | 台灣解剖學名詞（程式內建對照表） | 肝動脈尾狀葉葉支 |
| Superior mesenteric artery | 台灣解剖學名詞（程式內建對照表） | 上腸繫膜動脈 |
| Descending thoracic aorta | 台灣解剖學名詞（程式內建對照表） | 胸主動脈 |
| Abdominal aorta | 台灣解剖學名詞（程式內建對照表） | 腹主動脈 |
| Bronchial artery | 台灣解剖學名詞（程式內建對照表） | 支氣管動脈 |
| Esophageal artery | 台灣解剖學名詞（程式內建對照表） | 食道動脈 |
| superior intercostal artery | 台灣解剖學名詞（程式內建對照表） | 最上肋間動脈 |
| superior epigastric artery | glossary.json（其他筆記） | 上腹壁動脈 |
| internal thoracic artery | 台灣解剖學名詞（程式內建對照表） | 內胸動脈 |
| lateral thoracic artery | 台灣解剖學名詞（程式內建對照表） | 外側胸動脈 |
| first posterior intercostal artery | 台灣解剖學名詞（程式內建對照表） | 第一後肋間動脈 |
| second posterior intercostal artery | 台灣解剖學名詞（程式內建對照表） | 第二後肋間動脈 |
| Posterior intercostal arteries | 台灣解剖學名詞（程式內建對照表） | 後肋間動脈 |
| subcostal artery | glossary.json（其他筆記） | 肋下動脈 |
| musculophrenic artery | 台灣解剖學名詞（程式內建對照表） | 肌膈動脈 |
| Accessory hemiazygos vein | 台灣解剖學名詞（程式內建對照表） | 副半奇靜脈 |
| Set of anterior intercostal veins | 台灣解剖學名詞（程式內建對照表） | 前肋間靜脈群 |
| superior intercostal vein | 台灣解剖學名詞（程式內建對照表） | 最上肋間靜脈 |
| subcostal vein | 台灣解剖學名詞（程式內建對照表） | 肋下靜脈 |
| musculophrenic vein | 台灣解剖學名詞（程式內建對照表） | 肌膈靜脈 |
| internal thoracic vein | 台灣解剖學名詞（程式內建對照表） | 內胸靜脈 |
| Marginal colic artery | 台灣解剖學名詞（程式內建對照表） | 結腸邊緣動脈 |
| Ileal branch of inferior branch of ileocolic artery | 台灣解剖學名詞（程式內建對照表） | 迴結腸動脈下支迴腸支 |
| renal artery | 台灣解剖學名詞（程式內建對照表） | 腎動脈 |
| anterior segmental artery | 台灣解剖學名詞（程式內建對照表） | 前段動脈 |
| Superior segmental branch of renal artery | 台灣解剖學名詞（程式內建對照表） | 腎動脈上段支 |
| Inferior segmental branch of renal artery | 台灣解剖學名詞（程式內建對照表） | 腎動脈下段支 |
| Posterior segmental branch of renal artery | 台灣解剖學名詞（程式內建對照表） | 腎動脈後段支 |
| dorsalis pedis artery | glossary.json（跑考摘要） | 足背動脈 |
| Deep dorsal vein of penis | 台灣解剖學名詞（程式內建對照表） | 陰莖背深靜脈 |
| Descending branch of lateral circumflex femoral artery | 台灣解剖學名詞（程式內建對照表） | 旋股外側動脈降支 |
| Distal perforating artery | 台灣解剖學名詞（程式內建對照表） | 遠端穿動脈 |
| Dorsal venous arch of foot | 台灣解剖學名詞（程式內建對照表） | 足背靜脈弓 |
| anterior tibial artery | glossary.json（跑考摘要） | 脛前動脈 |
| anterior tibial recurrent artery | 台灣解剖學名詞（程式內建對照表） | 脛前返動脈 |
| arcuate artery | glossary.json（其他筆記） | 弓狀動脈 |
| deep plantar artery | glossary.json（跑考摘要） | 深趾動脈 |
| descending genicular artery | glossary.json（跑考摘要） | 降膝動脈 |
| Dorsal digital artery of foot | 台灣解剖學名詞（程式內建對照表） | 足背趾動脈 |
| femoral artery | 台灣解剖學名詞（程式內建對照表） | 股動脈 |
| inferior lateral genicular artery | glossary.json（跑考摘要） | 外下膝動脈 |
| inferior medial genicular artery | glossary.json（跑考摘要） | 內下膝動脈 |
| lateral circumflex femoral artery | glossary.json（跑考摘要） | 外旋股動脈 |
| lateral plantar artery | 台灣解剖學名詞（程式內建對照表） | 足底外側動脈 |
| lateral superior genicular artery | 台灣解剖學名詞（程式內建對照表） | 膝上外側動脈 |
| lateral tarsal artery | 台灣解剖學名詞（程式內建對照表） | 外側跗動脈 |
| medial plantar artery | 台灣解剖學名詞（程式內建對照表） | 足底內側動脈 |
| medial superior genicular artery | 台灣解剖學名詞（程式內建對照表） | 膝上內側動脈 |
| middle genicular artery | glossary.json（跑考摘要） | 中膝動脈 |
| plantar arch | 台灣解剖學名詞（程式內建對照表） | 足底動脈弓 |
| popliteal artery | glossary.json（跑考摘要） | 膕動脈 |
| posterior tibial artery | glossary.json（跑考摘要） | 脛後動脈 |
| superficial medial plantar artery | 台灣解剖學名詞（程式內建對照表） | 足底內側淺動脈 |
| Set of perforating arteries | 台灣解剖學名詞（程式內建對照表） | 穿動脈群 |
| Set of calcaneal branches of posterior tibial artery | 台灣解剖學名詞（程式內建對照表） | 脛後動脈跟支 |
| Set of common plantar digital arteries | 台灣解剖學名詞（程式內建對照表） | 足底總趾動脈群 |
| Set of dorsal digital arteries | 台灣解剖學名詞（程式內建對照表） | 背側指（趾）動脈群 |
| Set of plantar digital arteries proper | 台灣解剖學名詞（程式內建對照表） | 足底固有趾動脈群 |
| Plantar metatarsal artery | 台灣解剖學名詞（程式內建對照表） | 足底蹠骨動脈 |
| anterior tibial vein | 台灣解剖學名詞（程式內建對照表） | 脛前靜脈 |
| deep femoral vein | 台灣解剖學名詞（程式內建對照表） | 股深靜脈 |
| Set of perforating veins | 台灣解剖學名詞（程式內建對照表） | 穿靜脈群 |
| femoral vein | 台灣解剖學名詞（程式內建對照表） | 股靜脈 |
| great saphenous vein | glossary.json（跑考摘要） | 大隱靜脈 |
| genicular vein | 台灣解剖學名詞（程式內建對照表） | 膝靜脈 |
| Tributary of plantar venous arch | 台灣解剖學名詞（程式內建對照表） | 足底靜脈弓屬支 |
| popliteal vein | 台灣解剖學名詞（程式內建對照表） | 膕靜脈 |
| posterior tibial vein | 台灣解剖學名詞（程式內建對照表） | 脛後靜脈 |
| Set of plantar digital veins | 台灣解剖學名詞（程式內建對照表） | 足底趾靜脈群 |
| small saphenous vein | glossary.json（跑考摘要） | 小隱靜脈 |
| superficial epigastric vein | 台灣解剖學名詞（程式內建對照表） | 腹壁淺靜脈 |
| Plantar venous arch of foot | 台灣解剖學名詞（程式內建對照表） | 足底靜脈弓 |
| fibular vein | 台灣解剖學名詞（程式內建對照表） | 腓靜脈 |
| Set of dorsal digital veins | 台灣解剖學名詞（程式內建對照表） | 背側趾靜脈群 |
| Dorsal metacarpal vein | 台灣解剖學名詞（程式內建對照表） | 掌背靜脈 |
| lateral circumflex femoral vein | 台灣解剖學名詞（程式內建對照表） | 旋股外側靜脈 |
| medial circumflex femoral vein | 台灣解剖學名詞（程式內建對照表） | 旋股內側靜脈 |
| Plantar metatarsal vein | 台灣解剖學名詞（程式內建對照表） | 足底蹠骨靜脈 |
| Superficial dorsal vein of penis | 台灣解剖學名詞（程式內建對照表） | 陰莖背淺靜脈 |
| inferior thyroid artery | glossary.json（其他筆記） | 下甲狀腺動脈 |
| Acromial branch of thoraco-acromial artery | 台灣解剖學名詞（程式內建對照表） | 胸肩峰動脈肩峰支 |
| anterior circumflex humeral artery | 台灣解剖學名詞（程式內建對照表） | 旋肱前動脈 |
| anterior circumflex humeral vein | 台灣解剖學名詞（程式內建對照表） | 旋肱前靜脈 |
| anterior interosseous artery | 台灣解剖學名詞（程式內建對照表） | 前骨間動脈 |
| inferior ulnar collateral artery | 台灣解剖學名詞（程式內建對照表） | 下尺側副動脈 |
| axillary artery | glossary.json（跑考摘要） | 腋動脈 |
| axillary vein | 台灣解剖學名詞（程式內建對照表） | 腋靜脈 |
| basilic vein | 台灣解剖學名詞（程式內建對照表） | 貴要靜脈 |
| brachial artery | glossary.json（其他筆記） | 肱動脈 |
| cephalic vein | 台灣解剖學名詞（程式內建對照表） | 頭靜脈 |
| circumflex scapular artery | 台灣解剖學名詞（程式內建對照表） | 旋肩胛動脈 |
| circumflex scapular vein | 台灣解剖學名詞（程式內建對照表） | 旋肩胛靜脈 |
| common interosseous artery | glossary.json（其他筆記） | 總骨間動脈 |
| costocervical trunk | 台灣解剖學名詞（程式內建對照表） | 肋頸動脈幹 |
| deep brachial artery | 台灣解剖學名詞（程式內建對照表） | 肱深動脈 |
| deep cervical artery | 台灣解剖學名詞（程式內建對照表） | 頸深動脈 |
| deep palmar arch | 台灣解剖學名詞（程式內建對照表） | 深掌動脈弓 |
| Dorsal venous network of hand | 台灣解剖學名詞（程式內建對照表） | 手背靜脈網 |
| deep palmar venous arch | 台灣解剖學名詞（程式內建對照表） | 深掌靜脈弓 |
| Deltoid branch of thoraco-acromial artery | 台灣解剖學名詞（程式內建對照表） | 胸肩峰動脈三角肌支 |
| Dorsal carpal branch of radial artery | 台灣解剖學名詞（程式內建對照表） | 橈動脈背側腕支 |
| dorsal scapular artery | 台灣解剖學名詞（程式內建對照表） | 肩胛背動脈 |
| lateral thoracic vein | 台灣解剖學名詞（程式內建對照表） | 胸外側靜脈 |
| median antebrachial vein | 台灣解剖學名詞（程式內建對照表） | 前臂正中靜脈 |
| median cubital vein | 台灣解剖學名詞（程式內建對照表） | 正中肘靜脈 |
| dorsal carpal branch of ulnar artery | 台灣解剖學名詞（程式內建對照表） | 尺動脈背側腕支 |
| palmar metacarpal artery | 台灣解剖學名詞（程式內建對照表） | 掌側掌骨動脈 |
| palmar metacarpal vein | 台灣解剖學名詞（程式內建對照表） | 掌側掌骨靜脈 |
| posterior circumflex humeral artery | glossary.json（其他筆記） | 後旋肱動脈 |
| posterior ulnar recurrent artery | 台灣解剖學名詞（程式內建對照表） | 尺側返動脈後支 |
| radial artery | glossary.json（跑考摘要） | 橈動脈 |
| radial recurrent artery | glossary.json（其他筆記） | 橈側迴返動脈 |
| radial vein | 台灣解剖學名詞（程式內建對照表） | 橈靜脈 |
| recurrent interosseous artery | 台灣解剖學名詞（程式內建對照表） | 骨間返動脈 |
| subscapular artery | 台灣解剖學名詞（程式內建對照表） | 肩胛下動脈 |
| subscapular vein | 台灣解剖學名詞（程式內建對照表） | 肩胛下靜脈 |
| superficial palmar arterial arch | 台灣解剖學名詞（程式內建對照表） | 淺掌動脈弓 |
| superficial palmar venous arch | 台灣解剖學名詞（程式內建對照表） | 淺掌靜脈弓 |
| suprascapular vein | 台灣解剖學名詞（程式內建對照表） | 肩胛上靜脈 |
| suprascapular artery | glossary.json（其他筆記） | 肩胛上動脈 |
| Trunk of thoraco-acromial artery | 台灣解剖學名詞（程式內建對照表） | 胸肩峰動脈幹 |
| thoracodorsal artery | 台灣解剖學名詞（程式內建對照表） | 胸背動脈 |
| thoracodorsal vein | 台灣解剖學名詞（程式內建對照表） | 胸背靜脈 |
| thyrocervical trunk | 台灣解剖學名詞（程式內建對照表） | 甲狀頸動脈幹 |
| superficial cervical artery | 台灣解剖學名詞（程式內建對照表） | 頸淺動脈 |
| transverse cervical artery | 台灣解剖學名詞（程式內建對照表） | 頸橫動脈 |
| ulnar artery | glossary.json（跑考摘要） | 尺動脈 |
| anterior ulnar recurrent artery | 台灣解剖學名詞（程式內建對照表） | 尺側返動脈前支 |
| ulnar vein | 台灣解剖學名詞（程式內建對照表） | 尺靜脈 |
| Radial collateral branch of deep brachial artery | 台灣解剖學名詞（程式內建對照表） | 肱深動脈橈側副支 |
| medial brachial vein | 台灣解剖學名詞（程式內建對照表） | 內側肱靜脈 |
| arteria radialis indicis | 台灣解剖學名詞（程式內建對照表） | 食指橈側動脈 |
| first common palmar digital artery | 台灣解剖學名詞（程式內建對照表） | 第一掌側總指動脈 |
| second common palmar digital artery | 台灣解剖學名詞（程式內建對照表） | 第二掌側總指動脈 |
| third common palmar digital artery | 台灣解剖學名詞（程式內建對照表） | 第三掌側總指動脈 |
| Proper palmar digital vein of little finger | 台灣解剖學名詞（程式內建對照表） | 小指掌側固有指靜脈 |
| Common palmar digital vein | 台灣解剖學名詞（程式內建對照表） | 掌側總指靜脈 |
| Proper palmar digital vein of index finger | 台灣解剖學名詞（程式內建對照表） | 食指掌側固有指靜脈 |
| Proper palmar digital vein of middle finger | 台灣解剖學名詞（程式內建對照表） | 中指掌側固有指靜脈 |
| Proper palmar digital vein of ring finger | 台灣解剖學名詞（程式內建對照表） | 無名指掌側固有指靜脈 |
| Pectoral branch of thoraco-acromial artery | 台灣解剖學名詞（程式內建對照表） | 胸肩峰動脈胸肌支 |
| Middle collateral branch of deep brachial artery | 台灣解剖學名詞（程式內建對照表） | 肱深動脈中副支 |
| Medial proper palmar digital artery of index finger | 台灣解剖學名詞（程式內建對照表） | 食指內側掌側固有指動脈 |
| Lateral proper palmar digital artery of middle finger | 台灣解剖學名詞（程式內建對照表） | 中指外側掌側固有指動脈 |
| Lateral proper palmar digital artery of ring finger | 台灣解剖學名詞（程式內建對照表） | 無名指外側掌側固有指動脈 |
| Lateral proper palmar digital artery of little finger | 台灣解剖學名詞（程式內建對照表） | 小指外側掌側固有指動脈 |
| fourth common palmar digital artery | 台灣解剖學名詞（程式內建對照表） | 第四掌側總指動脈 |
| arteria princeps pollicis | 台灣解剖學名詞（程式內建對照表） | 拇主要動脈 |
| Set of dorsal metacarpal arteries | 台灣解剖學名詞（程式內建對照表） | 背側掌骨動脈群 |
| Medial proper palmar digital artery of middle finger | 台灣解剖學名詞（程式內建對照表） | 中指內側掌側固有指動脈 |
| Medial proper palmar digital artery of ring finger | 台灣解剖學名詞（程式內建對照表） | 無名指內側掌側固有指動脈 |
| superior ulnar collateral artery | 台灣解剖學名詞（程式內建對照表） | 上尺側副動脈 |
| Hepatovenous segment VII | 台灣解剖學名詞（程式內建對照表） | 肝第 VII 段 |
| Middle hepatic vein | 台灣解剖學名詞（程式內建對照表） | 中肝靜脈 |
| hepatic vein | 台灣解剖學名詞（程式內建對照表） | 肝靜脈 |
| anterior cusp of pulmonary valve | 台灣解剖學名詞（程式內建對照表） | 肺動脈瓣前尖 |
| Anterolateral head of lateral papillary muscle of ventricle | 台灣解剖學名詞（程式內建對照表） | 心室外側乳突肌前外側頭 |
| Anterior papillary muscle of ventricle | 台灣解剖學名詞（程式內建對照表） | 心室前乳突肌 |
| Anterior leaflet of mitral valve | 台灣解剖學名詞（程式內建對照表） | 二尖瓣前葉 |
| Anterior leaflet of tricuspid valve | 台灣解剖學名詞（程式內建對照表） | 三尖瓣前葉 |
| Cavity of ventricle | 台灣解剖學名詞（程式內建對照表） | 心室腔 |
| Cavity of atrium | 台灣解剖學名詞（程式內建對照表） | 心房腔 |
| posterior cusp of aortic valve | 台灣解剖學名詞（程式內建對照表） | 主動脈瓣後尖 |
| Posterior cusp of pulmonary valve | 台灣解剖學名詞（程式內建對照表） | 肺動脈瓣後尖 |
| Wall of ventricle | 台灣解剖學名詞（程式內建對照表） | 心室壁 |
| Lateral papillary muscle of ventricle | 台灣解剖學名詞（程式內建對照表） | 心室外側乳突肌 |
| Posterior papillary muscle of ventricle | 台灣解剖學名詞（程式內建對照表） | 心室後乳突肌 |
| Posterior leaflet of mitral valve | 台灣解剖學名詞（程式內建對照表） | 二尖瓣後葉 |
| Posterior leaflet of tricuspid valve | 台灣解剖學名詞（程式內建對照表） | 三尖瓣後葉 |
| Anterior cusp of aortic valve | 台灣解剖學名詞（程式內建對照表） | 主動脈瓣前尖 |
| Septal leaflet of tricuspid valve | 台灣解剖學名詞（程式內建對照表） | 三尖瓣隔葉 |
| Septal papillary muscle of ventricle | 台灣解剖學名詞（程式內建對照表） | 心室隔側乳突肌 |
| Wall of atrium | 台灣解剖學名詞（程式內建對照表） | 心房壁 |
| Cricoid cartilage | 台灣解剖學名詞（程式內建對照表） | 環狀軟骨 |
| Inferior lingular bronchial tree | 台灣解剖學名詞（程式內建對照表） | 下舌支氣管樹 |
| medial basal segmental bronchial tree | 台灣解剖學名詞（程式內建對照表） | 內側底段支氣管樹 |
| anterior segmental bronchial tree | 台灣解剖學名詞（程式內建對照表） | 前段支氣管樹 |
| apical segmental bronchial tree | 台灣解剖學名詞（程式內建對照表） | 尖段支氣管樹 |
| lateral basal segmental bronchial tree | 台灣解剖學名詞（程式內建對照表） | 外側底段支氣管樹 |
| posterior basal segmental bronchial tree | 台灣解剖學名詞（程式內建對照表） | 後底段支氣管樹 |
| posterior segmental bronchial tree | 台灣解剖學名詞（程式內建對照表） | 後段支氣管樹 |
| superior segmental bronchial tree | 台灣解剖學名詞（程式內建對照表） | 上段支氣管樹 |
| Lateral segmental bronchial tree | 台灣解剖學名詞（程式內建對照表） | 外側段支氣管樹 |
| main bronchus | 台灣解剖學名詞（程式內建對照表） | 主支氣管 |
| Medial segmental bronchial tree | 台灣解剖學名詞（程式內建對照表） | 內側段支氣管樹 |
| anterior basal segmental bronchial tree | 台灣解剖學名詞（程式內建對照表） | 前底段支氣管樹 |
| Superior lingular bronchial tree | 台灣解剖學名詞（程式內建對照表） | 上舌支氣管樹 |
| main bronchus proper | 台灣解剖學名詞（程式內建對照表） | 主支氣管本幹 |
| Trachea | 台灣解剖學名詞（程式內建對照表） | 氣管 |
| major alar cartilage | 台灣解剖學名詞（程式內建對照表） | 大翼軟骨 |
| lateral nasal cartilage | 台灣解剖學名詞（程式內建對照表） | 鼻外側軟骨 |
| Septal nasal cartilage | 台灣解剖學名詞（程式內建對照表） | 鼻中隔軟骨 |
| Spleen | 台灣解剖學名詞（程式內建對照表） | 脾臟 |
| Splenic artery | glossary.json（其他筆記） | 脾動脈 |
| Esophagus | 台灣解剖學名詞（程式內建對照表） | 食道 |
| Stomach | 台灣解剖學名詞（程式內建對照表） | 胃 |
| Appendix | 台灣解剖學名詞（程式內建對照表） | 闌尾 |
| Ascending colon | 台灣解剖學名詞（程式內建對照表） | 升結腸 |
| Descending colon | 台灣解剖學名詞（程式內建對照表） | 降結腸 |
| Taenia libera | 台灣解剖學名詞（程式內建對照表） | 游離結腸帶 |
| Taenia mesocolica | 台灣解剖學名詞（程式內建對照表） | 結腸繫膜帶 |
| Taenia omentalis | 台灣解剖學名詞（程式內建對照表） | 網膜帶 |
| Rectum | 台灣解剖學名詞（程式內建對照表） | 直腸 |
| Transverse colon | 台灣解剖學名詞（程式內建對照表） | 橫結腸 |
| Duodenum | 台灣解剖學名詞（程式內建對照表） | 十二指腸 |
| Proximal part of ileum | 台灣解剖學名詞（程式內建對照表） | 迴腸近段 |
| Middle part of ileum | 台灣解剖學名詞（程式內建對照表） | 迴腸中段 |
| Distal part of ileum | 台灣解剖學名詞（程式內建對照表） | 迴腸遠段 |
| Ileocecal junction | 台灣解剖學名詞（程式內建對照表） | 迴盲交界 |
| Proximal part of jejunum | 台灣解剖學名詞（程式內建對照表） | 空腸近段 |
| Middle part of jejunum | 台灣解剖學名詞（程式內建對照表） | 空腸中段 |
| Distal part of jejunum | 台灣解剖學名詞（程式內建對照表） | 空腸遠段 |
| Parenchyma of pancreas | 台灣解剖學名詞（程式內建對照表） | 胰臟實質 |
| Pancreatic duct tree | 台灣解剖學名詞（程式內建對照表） | 胰管樹 |
| Trunk of anterior interventricular branch of coronary artery | 台灣解剖學名詞（程式內建對照表） | 冠狀動脈前室間支幹 |
| First anterior branch of anterior interventricular branch of coronary artery | 台灣解剖學名詞（程式內建對照表） | 冠狀動脈前室間支第一前支 |
| Diagonal branch of anterior descending branch of coronary artery | 台灣解剖學名詞（程式內建對照表） | 冠狀動脈前降支斜支 |
| Third anterior branch of anterior interventricular branch of coronary artery | 台灣解剖學名詞（程式內建對照表） | 冠狀動脈前室間支第三前支 |
| Conus branch of anterior interventricular branch of coronary artery | 台灣解剖學名詞（程式內建對照表） | 冠狀動脈前室間支圓錐支 |
| Second anterior branch of anterior interventricular branch of coronary artery | 台灣解剖學名詞（程式內建對照表） | 冠狀動脈前室間支第二前支 |
| Circumflex branch of coronary artery | 台灣解剖學名詞（程式內建對照表） | 冠狀動脈迴旋支 |
| Coronary sinus | 台灣解剖學名詞（程式內建對照表） | 冠狀竇 |
| Great cardiac vein | 台灣解剖學名詞（程式內建對照表） | 心大靜脈 |
| Anterior interventricular vein | 台灣解剖學名詞（程式內建對照表） | 前室間靜脈 |
| Marginal branch of coronary artery | 台灣解剖學名詞（程式內建對照表） | 冠狀動脈邊緣支 |
| conus artery | 台灣解剖學名詞（程式內建對照表） | 圓錐動脈 |
| First anterior ventricular branch of coronary artery | 台灣解剖學名詞（程式內建對照表） | 冠狀動脈第一前心室支 |
| Middle cardiac vein | 台灣解剖學名詞（程式內建對照表） | 心中靜脈 |
| Posterior interventricular branch of coronary artery | 台灣解剖學名詞（程式內建對照表） | 冠狀動脈後室間支 |
| Posterior vein of ventricle | 台灣解剖學名詞（程式內建對照表） | 心室後靜脈 |
| marginal vein | 台灣解剖學名詞（程式內建對照表） | 邊緣靜脈 |
| First posterior ventricular branch of coronary artery | 台灣解剖學名詞（程式內建對照表） | 冠狀動脈第一後心室支 |
| Trunk of coronary artery | 台灣解剖學名詞（程式內建對照表） | 冠狀動脈幹 |
| Small cardiac vein | 台灣解剖學名詞（程式內建對照表） | 心小靜脈 |
| Anterior cardiac vein | 台灣解剖學名詞（程式內建對照表） | 心前靜脈 |
| Septal branch of anterior interventricular artery | 台灣解剖學名詞（程式內建對照表） | 前室間動脈隔支 |
| First septal branch of posterior interventricular artery | 台灣解剖學名詞（程式內建對照表） | 後室間動脈第一隔支 |
| Second septal branch of posterior interventricular artery | 台灣解剖學名詞（程式內建對照表） | 後室間動脈第二隔支 |
| genioglossus | 台灣解剖學名詞（程式內建對照表） | 頦舌肌 |
| hyoglossus | 台灣解剖學名詞（程式內建對照表） | 舌骨舌肌 |
| inferior pharyngeal constrictor | 台灣解剖學名詞（程式內建對照表） | 咽下縮肌 |
| levator veli palatini | glossary.json（其他筆記） | 提顎帆肌 |
| middle pharyngeal constrictor | 台灣解剖學名詞（程式內建對照表） | 咽中縮肌 |
| palatopharyngeus | 台灣解剖學名詞（程式內建對照表） | 腭咽肌 |
| pterygomandibular raphe | 台灣解剖學名詞（程式內建對照表） | 翼下頷縫 |
| salpingopharyngeus | 台灣解剖學名詞（程式內建對照表） | 咽鼓管咽肌 |
| stylopharyngeus | 台灣解剖學名詞（程式內建對照表） | 莖突咽肌 |
| superior pharyngeal constrictor | 台灣解剖學名詞（程式內建對照表） | 咽上縮肌 |
| tensor veli palatini | glossary.json（其他筆記） | 張顎帆肌 |
| Pharyngeal raphe | 台灣解剖學名詞（程式內建對照表） | 咽縫 |
| Tongue | 台灣解剖學名詞（程式內建對照表） | 舌 |
| Uvular muscle | 台灣解剖學名詞（程式內建對照表） | 懸雍垂肌 |
| stylohyoid ligament | 台灣解剖學名詞（程式內建對照表） | 莖突舌骨韌帶 |
| sublingual gland | 台灣解剖學名詞（程式內建對照表） | 舌下腺 |
| submandibular gland | 台灣解剖學名詞（程式內建對照表） | 頷下腺 |
| Epiglottis | 台灣解剖學名詞（程式內建對照表） | 會厭 |
| Hyo-epiglottic ligament | 台灣解剖學名詞（程式內建對照表） | 舌骨會厭韌帶 |
| Hyoid bone | 台灣解剖學名詞（程式內建對照表） | 舌骨 |
| cuneiform cartilage | 台灣解剖學名詞（程式內建對照表） | 楔狀軟骨 |
| aryepiglotticus | 台灣解剖學名詞（程式內建對照表） | 杓會厭肌 |
| arytenoid cartilage | 台灣解剖學名詞（程式內建對照表） | 杓狀軟骨 |
| corniculate cartilage | 台灣解剖學名詞（程式內建對照表） | 小角軟骨 |
| conus elasticus | 台灣解剖學名詞（程式內建對照表） | 彈性圓錐 |
| lateral crico-arytenoid | 台灣解剖學名詞（程式內建對照表） | 環杓側肌 |
| lateral thyrohyoid ligament | 台灣解剖學名詞（程式內建對照表） | 甲狀舌骨外側韌帶 |
| oblique arytenoid | 台灣解剖學名詞（程式內建對照表） | 斜杓肌 |
| Oblique part of cricothyroid | 台灣解剖學名詞（程式內建對照表） | 環甲肌斜部 |
| posterior crico-arytenoid | 台灣解剖學名詞（程式內建對照表） | 環杓後肌 |
| Straight part of cricothyroid | 台灣解剖學名詞（程式內建對照表） | 環甲肌直部 |
| thyro-arytenoid | 台灣解剖學名詞（程式內建對照表） | 甲杓肌 |
| thyrohyoid membrane | 台灣解剖學名詞（程式內建對照表） | 甲狀舌骨膜 |
| vocal ligament | 台灣解剖學名詞（程式內建對照表） | 聲帶韌帶 |
| vocalis | 台灣解剖學名詞（程式內建對照表） | 聲帶肌 |
| Median cricothyroid ligament | 台灣解剖學名詞（程式內建對照表） | 環甲正中韌帶 |
| Median thyrohyoid ligament | 台灣解剖學名詞（程式內建對照表） | 甲狀舌骨正中韌帶 |
| Thyro-epiglottic ligament | 台灣解剖學名詞（程式內建對照表） | 甲狀會厭韌帶 |
| Thyroid cartilage | 台灣解剖學名詞（程式內建對照表） | 甲狀軟骨 |
| Transverse arytenoid | 台灣解剖學名詞（程式內建對照表） | 杓橫肌 |
| Skin | 台灣解剖學名詞（程式內建對照表） | 皮膚 |
| External ear | 台灣解剖學名詞（程式內建對照表） | 外耳 |
| Eyebrow | 台灣解剖學名詞（程式內建對照表） | 眉毛 |
| Hair of head | 台灣解剖學名詞（程式內建對照表） | 頭髮 |
| Lip | 台灣解剖學名詞（程式內建對照表） | 唇 |
| Pubic hair | 台灣解剖學名詞（程式內建對照表） | 陰毛 |
| Caudate lobe of liver | 台灣解剖學名詞（程式內建對照表） | 肝尾狀葉 |
| Gallbladder | 台灣解剖學名詞（程式內建對照表） | 膽囊 |
| Hepatovenous segment II | 台灣解剖學名詞（程式內建對照表） | 肝第 II 段 |
| Hepatovenous segment III | 台灣解剖學名詞（程式內建對照表） | 肝第 III 段 |
| Hepatovenous segment IV | 台灣解剖學名詞（程式內建對照表） | 肝第 IV 段 |
| Hepatovenous segment V | 台灣解剖學名詞（程式內建對照表） | 肝第 V 段 |
| Hepatovenous segment VI | 台灣解剖學名詞（程式內建對照表） | 肝第 VI 段 |
| Hepatovenous segment VIII | 台灣解剖學名詞（程式內建對照表） | 肝第 VIII 段 |
| posterior basal segmental artery | 台灣解剖學名詞（程式內建對照表） | 後底段動脈 |
| lateral basal segmental artery | 台灣解剖學名詞（程式內建對照表） | 外側底段動脈 |
| anterior basal segmental artery | 台灣解剖學名詞（程式內建對照表） | 前底段動脈 |
| medial basal segmental artery | 台灣解剖學名詞（程式內建對照表） | 內側底段動脈 |
| superior segmental artery | 台灣解剖學名詞（程式內建對照表） | 上段動脈 |
| Inferior lingular artery | 台灣解剖學名詞（程式內建對照表） | 下舌動脈 |
| Superior lingular artery | 台灣解剖學名詞（程式內建對照表） | 上舌動脈 |
| posterior segmental artery | 台灣解剖學名詞（程式內建對照表） | 後段動脈 |
| apical segmental artery | 台灣解剖學名詞（程式內建對照表） | 尖段動脈 |
| pulmonary artery | 台灣解剖學名詞（程式內建對照表） | 肺動脈 |
| superior pulmonary vein | 台灣解剖學名詞（程式內建對照表） | 上肺靜脈 |
| posterior segmental vein | 台灣解剖學名詞（程式內建對照表） | 後段靜脈 |
| anterior segmental vein | 台灣解剖學名詞（程式內建對照表） | 前段靜脈 |
| Inferior lingular vein | 台灣解剖學名詞（程式內建對照表） | 下舌靜脈 |
| apical segmental vein | 台灣解剖學名詞（程式內建對照表） | 尖段靜脈 |
| Superior lingular vein | 台灣解剖學名詞（程式內建對照表） | 上舌靜脈 |
| inferior pulmonary vein | 台灣解剖學名詞（程式內建對照表） | 下肺靜脈 |
| posterior basal segmental vein | 台灣解剖學名詞（程式內建對照表） | 後底段靜脈 |
| lateral basal segmental vein | 台灣解剖學名詞（程式內建對照表） | 外側底段靜脈 |
| anterior basal segmental vein | 台灣解剖學名詞（程式內建對照表） | 前底段靜脈 |
| Pulmonary trunk | 台灣解剖學名詞（程式內建對照表） | 肺動脈幹 |
| Apical part of apical segmental artery | 台灣解剖學名詞（程式內建對照表） | 尖段動脈尖部 |
| Apical part of posterior segmental artery | 台灣解剖學名詞（程式內建對照表） | 後段動脈尖部 |
| Posterior part of posterior segmental artery | 台灣解剖學名詞（程式內建對照表） | 後段動脈後部 |
| upper lobar artery | 台灣解剖學名詞（程式內建對照表） | 上葉動脈 |
| Posterior branch of anterior segmental artery | 台灣解剖學名詞（程式內建對照表） | 前段動脈後支 |
| Anterior branch of anterior segmental artery | 台灣解剖學名詞（程式內建對照表） | 前段動脈前支 |
| Anterior part of apical segmental artery | 台灣解剖學名詞（程式內建對照表） | 尖段動脈前部 |
| Anterior branch of lateral segmental artery | 台灣解剖學名詞（程式內建對照表） | 外側段動脈前支 |
| Posterior branch of lateral segmental artery | 台灣解剖學名詞（程式內建對照表） | 外側段動脈後支 |
| Superior branch of medial segmental artery | 台灣解剖學名詞（程式內建對照表） | 內側段動脈上支 |
| Inferior branch of medial segmental artery | 台灣解剖學名詞（程式內建對照表） | 內側段動脈下支 |
| Lateral branch of superior segmental artery | 台灣解剖學名詞（程式內建對照表） | 上段動脈外側支 |
| Medial branch of superior segmental artery | 台灣解剖學名詞（程式內建對照表） | 上段動脈內側支 |
| Superior branch of superior segmental artery | 台灣解剖學名詞（程式內建對照表） | 上段動脈上支 |
| Lateral branch of anterior basal segmental artery | 台灣解剖學名詞（程式內建對照表） | 前底段動脈外側支 |
| Basal branch of anterior basal segmental artery | 台灣解剖學名詞（程式內建對照表） | 前底段動脈底支 |
| Lateral branch of lateral basal segmental artery | 台灣解剖學名詞（程式內建對照表） | 外側底段動脈外側支 |
| Mediobasal branch of posterior basal segmental artery | 台灣解剖學名詞（程式內建對照表） | 後底段動脈內底支 |
| Accessory subsuperior branch of posterior basal segmental artery | 台灣解剖學名詞（程式內建對照表） | 後底段動脈副次上支 |
| Laterobasal branch of posterior basal segmental artery | 台灣解剖學名詞（程式內建對照表） | 後底段動脈外底支 |
| Inferior part of anterior segmental vein | 台灣解剖學名詞（程式內建對照表） | 前段靜脈下部 |
| Superior part of anterior segmental vein | 台灣解剖學名詞（程式內建對照表） | 前段靜脈上部 |
| Superior part of medial segmental vein | 台灣解剖學名詞（程式內建對照表） | 內側段靜脈上部 |
| Trunk of apical segmental vein | 台灣解剖學名詞（程式內建對照表） | 尖段靜脈幹 |
| Inferior part of medial segmental vein | 台灣解剖學名詞（程式內建對照表） | 內側段靜脈下部 |
| Anterior part of lateral segmental vein | 台灣解剖學名詞（程式內建對照表） | 外側段靜脈前部 |
| Posterior part of lateral segmental vein | 台灣解剖學名詞（程式內建對照表） | 外側段靜脈後部 |
| Anterior part of apical segmental vein | 台灣解剖學名詞（程式內建對照表） | 尖段靜脈前部 |
| superior segmental vein | 台灣解剖學名詞（程式內建對照表） | 上段靜脈 |
| medial basal segmental vein | 台灣解剖學名詞（程式內建對照表） | 內側底段靜脈 |
| Apical part of apical segmental vein | 台灣解剖學名詞（程式內建對照表） | 尖段靜脈尖部 |
| Anterior superior tributary of hepatic biliary tree | 台灣解剖學名詞（程式內建對照表） | 肝內膽管樹前上屬支 |
| Anterior inferior tributary of hepatic biliary tree | 台灣解剖學名詞（程式內建對照表） | 肝內膽管樹前下屬支 |
| Anterior superior segmental branch of portal vein | 台灣解剖學名詞（程式內建對照表） | 門靜脈前上段支 |
| Anterior inferior segmental branch of portal vein | 台灣解剖學名詞（程式內建對照表） | 門靜脈前下段支 |
| Anterior inferior segmental hepatic artery | 台灣解剖學名詞（程式內建對照表） | 肝前下段動脈 |
| Anterior superior segmental hepatic artery | 台灣解剖學名詞（程式內建對照表） | 肝前上段動脈 |
| Common hepatic artery | glossary.json（其他筆記） | 總肝動脈 |
| Common hepatic duct | 台灣解剖學名詞（程式內建對照表） | 總肝管 |
| Cystic duct | 台灣解剖學名詞（程式內建對照表） | 膽囊管 |
| Hepatic artery proper | 台灣解剖學名詞（程式內建對照表） | 固有肝動脈 |
| Pre-hepatic portal vein | 台灣解剖學名詞（程式內建對照表） | 肝前門靜脈 |
| Anterior inferior segmental tributary of middle hepatic vein | 台灣解剖學名詞（程式內建對照表） | 中肝靜脈前下段屬支 |
| Medial inferior segmental tributary of middle hepatic vein | 台灣解剖學名詞（程式內建對照表） | 中肝靜脈內側下段屬支 |
| Lateral superior tributary of hepatic biliary tree | 台灣解剖學名詞（程式內建對照表） | 肝內膽管樹外側上屬支 |
| Lateral inferior tributary of hepatic biliary tree | 台灣解剖學名詞（程式內建對照表） | 肝內膽管樹外側下屬支 |
| Lateral superior segmental hepatic artery | 台灣解剖學名詞（程式內建對照表） | 肝外側上段動脈 |
| Lateral inferior segmental hepatic artery | 台灣解剖學名詞（程式內建對照表） | 肝外側下段動脈 |
| duct of caudate lobe of liver | 台灣解剖學名詞（程式內建對照表） | 肝尾狀葉膽管 |
| Trunk of hepatic artery | 台灣解剖學名詞（程式內建對照表） | 肝動脈幹 |
| hepatic duct | 台灣解剖學名詞（程式內建對照表） | 肝管 |
| Lateral inferior segmental tributary of hepatic vein | 台灣解剖學名詞（程式內建對照表） | 肝靜脈外側下段屬支 |
| Lateral superior segmental tributary of hepatic vein | 台灣解剖學名詞（程式內建對照表） | 肝靜脈外側上段屬支 |
| Medial superior segmental tributary of hepatic vein | 台灣解剖學名詞（程式內建對照表） | 肝靜脈內側上段屬支 |
| Trunk of portal vein | 台灣解剖學名詞（程式內建對照表） | 門靜脈幹 |
| Medial inferior tributary of hepatic biliary tree | 台灣解剖學名詞（程式內建對照表） | 肝內膽管樹內側下屬支 |
| Medial superior tributary of hepatic biliary tree | 台灣解剖學名詞（程式內建對照表） | 肝內膽管樹內側上屬支 |
| Medial inferior segmental hepatic artery | 台灣解剖學名詞（程式內建對照表） | 肝內側下段動脈 |
| Medial superior segmental hepatic artery | 台灣解剖學名詞（程式內建對照表） | 肝內側上段動脈 |
| Posterior inferior tributary of hepatic biliary tree | 台灣解剖學名詞（程式內建對照表） | 肝內膽管樹後下屬支 |
| Posterior superior tributary of hepatic biliary tree | 台灣解剖學名詞（程式內建對照表） | 肝內膽管樹後上屬支 |
| Posterior inferior segmental branch of portal vein | 台灣解剖學名詞（程式內建對照表） | 門靜脈後下段支 |
| Posterior superior segmental branch of portal vein | 台灣解剖學名詞（程式內建對照表） | 門靜脈後上段支 |
| Posterior inferior segmental hepatic artery | 台灣解剖學名詞（程式內建對照表） | 肝後下段動脈 |
| Posterior superior segmental hepatic artery | 台灣解剖學名詞（程式內建對照表） | 肝後上段動脈 |
| Posterior inferior segmental tributary of hepatic vein | 台灣解剖學名詞（程式內建對照表） | 肝靜脈後下段屬支 |
| Posterior superior segmental tributary of hepatic vein | 台灣解剖學名詞（程式內建對照表） | 肝靜脈後上段屬支 |
| Anterior superior segmental tributary of hepatic vein | 台灣解剖學名詞（程式內建對照表） | 肝靜脈前上段屬支 |
| Lateral inferior segmental branch of portal vein | 台灣解剖學名詞（程式內建對照表） | 門靜脈外側下段支 |
| Lateral superior segmental branch of portal vein | 台灣解剖學名詞（程式內建對照表） | 門靜脈外側上段支 |
| Medial superior segmental branch of portal vein | 台灣解剖學名詞（程式內建對照表） | 門靜脈內側上段支 |
| Medial inferior segmental branch of portal vein | 台灣解剖學名詞（程式內建對照表） | 門靜脈內側下段支 |
| adrenal gland | 台灣解剖學名詞（程式內建對照表） | 腎上腺 |
| Diaphragm | 台灣解剖學名詞（程式內建對照表） | 橫膈 |
| Corpus cavernosum of penis | 台灣解剖學名詞（程式內建對照表） | 陰莖海綿體 |
| Corpus spongiosum of penis | 台灣解剖學名詞（程式內建對照表） | 尿道海綿體 |
| Glans penis | 台灣解剖學名詞（程式內建對照表） | 陰莖頭 |
| deferent duct | 台灣解剖學名詞（程式內建對照表） | 輸精管 |
| epididymis | 台灣解剖學名詞（程式內建對照表） | 副睪 |
| seminal vesicle | 台灣解剖學名詞（程式內建對照表） | 精囊 |
| testis | 台灣解剖學名詞（程式內建對照表） | 睪丸 |
| Prostate | 台灣解剖學名詞（程式內建對照表） | 前列腺 |
| ureter | 台灣解剖學名詞（程式內建對照表） | 輸尿管 |
| kidney | 台灣解剖學名詞（程式內建對照表） | 腎臟 |
| Urethra | 台灣解剖學名詞（程式內建對照表） | 尿道 |
| Urinary bladder | 台灣解剖學名詞（程式內建對照表） | 膀胱 |
| lobe of thymus | 台灣解剖學名詞（程式內建對照表） | 胸腺葉 |
| hip bone | 台灣解剖學名詞（程式內建對照表） | 髖骨 |
| Xiphoid process | 台灣解剖學名詞（程式內建對照表） | 劍突 |
| Tenth thoracic vertebra | 台灣解剖學名詞（程式內建對照表） | 第十胸椎 |
| Eleventh thoracic vertebra | 台灣解剖學名詞（程式內建對照表） | 第十一胸椎 |
| Twelfth thoracic vertebra | 台灣解剖學名詞（程式內建對照表） | 第十二胸椎 |
| First lumbar vertebra | 台灣解剖學名詞（程式內建對照表） | 第一腰椎 |
| First thoracic vertebra | 台灣解剖學名詞（程式內建對照表） | 第一胸椎 |
| Second lumbar vertebra | 台灣解剖學名詞（程式內建對照表） | 第二腰椎 |
| Second thoracic vertebra | 台灣解剖學名詞（程式內建對照表） | 第二胸椎 |
| Third cervical vertebra | 台灣解剖學名詞（程式內建對照表） | 第三頸椎 |
| Third lumbar vertebra | 台灣解剖學名詞（程式內建對照表） | 第三腰椎 |
| Third thoracic vertebra | 台灣解剖學名詞（程式內建對照表） | 第三胸椎 |
| Fourth cervical vertebra | 台灣解剖學名詞（程式內建對照表） | 第四頸椎 |
| Fourth lumbar vertebra | 台灣解剖學名詞（程式內建對照表） | 第四腰椎 |
| Fourth thoracic vertebra | 台灣解剖學名詞（程式內建對照表） | 第四胸椎 |
| Fifth cervical vertebra | 台灣解剖學名詞（程式內建對照表） | 第五頸椎 |
| Fifth lumbar vertebra | 台灣解剖學名詞（程式內建對照表） | 第五腰椎 |
| Fifth thoracic vertebra | 台灣解剖學名詞（程式內建對照表） | 第五胸椎 |
| Sixth cervical vertebra | 台灣解剖學名詞（程式內建對照表） | 第六頸椎 |
| Sixth thoracic vertebra | 台灣解剖學名詞（程式內建對照表） | 第六胸椎 |
| Seventh cervical vertebra | 台灣解剖學名詞（程式內建對照表） | 第七頸椎 |
| Seventh thoracic vertebra | 台灣解剖學名詞（程式內建對照表） | 第七胸椎 |
| Eighth thoracic vertebra | 台灣解剖學名詞（程式內建對照表） | 第八胸椎 |
| Ninth thoracic vertebra | 台灣解剖學名詞（程式內建對照表） | 第九胸椎 |
| Atlas | 台灣解剖學名詞（程式內建對照表） | 寰椎 |
| Axis | 台灣解剖學名詞（程式內建對照表） | 樞椎 |
| Body of sternum | 台灣解剖學名詞（程式內建對照表） | 胸骨體 |
| Distal phalanx of second toe | 台灣解剖學名詞（程式內建對照表） | 第二趾遠節趾骨 |
| Distal phalanx of third toe | 台灣解剖學名詞（程式內建對照表） | 第三趾遠節趾骨 |
| Distal phalanx of fourth toe | 台灣解剖學名詞（程式內建對照表） | 第四趾遠節趾骨 |
| Distal phalanx of big toe | 台灣解剖學名詞（程式內建對照表） | 拇趾遠節趾骨 |
| Distal phalanx of index finger | 台灣解剖學名詞（程式內建對照表） | 食指遠節指骨 |
| Distal phalanx of little finger | 台灣解剖學名詞（程式內建對照表） | 小指遠節指骨 |
| Distal phalanx of little toe | 台灣解剖學名詞（程式內建對照表） | 小趾遠節趾骨 |
| Distal phalanx of middle finger | 台灣解剖學名詞（程式內建對照表） | 中指遠節指骨 |
| Distal phalanx of ring finger | 台灣解剖學名詞（程式內建對照表） | 無名指遠節指骨 |
| Distal phalanx of thumb | 台灣解剖學名詞（程式內建對照表） | 拇指遠節指骨 |
| Ethmoid | 台灣解剖學名詞（程式內建對照表） | 篩骨 |
| Frontal bone | 台灣解剖學名詞（程式內建對照表） | 額骨 |
| Intervertebral disk of axis | 台灣解剖學名詞（程式內建對照表） | 第二頸椎椎間盤 |
| Intervertebral disk of fourth thoracic vertebra | 台灣解剖學名詞（程式內建對照表） | 第四胸椎椎間盤 |
| Intervertebral disk of fifth thoracic vertebra | 台灣解剖學名詞（程式內建對照表） | 第五胸椎椎間盤 |
| Intervertebral disk of sixth thoracic vertebra | 台灣解剖學名詞（程式內建對照表） | 第六胸椎椎間盤 |
| Intervertebral disk of seventh thoracic vertebra | 台灣解剖學名詞（程式內建對照表） | 第七胸椎椎間盤 |
| Intervertebral disk of eighth thoracic vertebra | 台灣解剖學名詞（程式內建對照表） | 第八胸椎椎間盤 |
| Intervertebral disk of ninth thoracic vertebra | 台灣解剖學名詞（程式內建對照表） | 第九胸椎椎間盤 |
| Intervertebral disk of tenth thoracic vertebra | 台灣解剖學名詞（程式內建對照表） | 第十胸椎椎間盤 |
| Intervertebral disk of eleventh thoracic vertebra | 台灣解剖學名詞（程式內建對照表） | 第十一胸椎椎間盤 |
| Intervertebral disk | 台灣解剖學名詞（程式內建對照表） | 椎間盤 |
| Intervertebral disk of first lumbar vertebra | 台灣解剖學名詞（程式內建對照表） | 第一腰椎椎間盤 |
| Intervertebral disk of third cervical vertebra | 台灣解剖學名詞（程式內建對照表） | 第三頸椎椎間盤 |
| Intervertebral disk of second lumbar vertebra | 台灣解剖學名詞（程式內建對照表） | 第二腰椎椎間盤 |
| Intervertebral disk of third lumbar vertebra | 台灣解剖學名詞（程式內建對照表） | 第三腰椎椎間盤 |
| Intervertebral disk of fourth lumbar vertebra | 台灣解剖學名詞（程式內建對照表） | 第四腰椎椎間盤 |
| Intervertebral disk of fifth lumbar vertebra | 台灣解剖學名詞（程式內建對照表） | 第五腰椎椎間盤 |
| Intervertebral disk of fourth cervical vertebra | 台灣解剖學名詞（程式內建對照表） | 第四頸椎椎間盤 |
| Intervertebral disk of fifth cervical vertebra | 台灣解剖學名詞（程式內建對照表） | 第五頸椎椎間盤 |
| Intervertebral disk of sixth cervical vertebra | 台灣解剖學名詞（程式內建對照表） | 第六頸椎椎間盤 |
| Intervertebral disk of seventh cervical vertebra | 台灣解剖學名詞（程式內建對照表） | 第七頸椎椎間盤 |
| Intervertebral disk of first thoracic vertebra | 台灣解剖學名詞（程式內建對照表） | 第一胸椎椎間盤 |
| Intervertebral disk of second thoracic vertebra | 台灣解剖學名詞（程式內建對照表） | 第二胸椎椎間盤 |
| Intervertebral disk of third thoracic vertebra | 台灣解剖學名詞（程式內建對照表） | 第三胸椎椎間盤 |
| tenth rib | 台灣解剖學名詞（程式內建對照表） | 第十肋骨 |
| eleventh rib | 台灣解剖學名詞（程式內建對照表） | 第十一肋骨 |
| twelfth rib | 台灣解剖學名詞（程式內建對照表） | 第十二肋骨 |
| first rib | 台灣解剖學名詞（程式內建對照表） | 第一肋骨 |
| second rib | 台灣解剖學名詞（程式內建對照表） | 第二肋骨 |
| third rib | 台灣解剖學名詞（程式內建對照表） | 第三肋骨 |
| fourth rib | 台灣解剖學名詞（程式內建對照表） | 第四肋骨 |
| fifth rib | 台灣解剖學名詞（程式內建對照表） | 第五肋骨 |
| sixth rib | 台灣解剖學名詞（程式內建對照表） | 第六肋骨 |
| seventh rib | 台灣解剖學名詞（程式內建對照表） | 第七肋骨 |
| eighth rib | 台灣解剖學名詞（程式內建對照表） | 第八肋骨 |
| ninth rib | 台灣解剖學名詞（程式內建對照表） | 第九肋骨 |
| clavicle | 台灣解剖學名詞（程式內建對照表） | 鎖骨 |
| first costal cartilage | 台灣解剖學名詞（程式內建對照表） | 第一肋軟骨 |
| first metacarpal bone | 台灣解剖學名詞（程式內建對照表） | 第一掌骨 |
| first metatarsal bone | 台灣解剖學名詞（程式內建對照表） | 第一蹠骨 |
| second costal cartilage | 台灣解剖學名詞（程式內建對照表） | 第二肋軟骨 |
| second metacarpal bone | 台灣解剖學名詞（程式內建對照表） | 第二掌骨 |
| second metatarsal bone | 台灣解剖學名詞（程式內建對照表） | 第二蹠骨 |
| third costal cartilage | 台灣解剖學名詞（程式內建對照表） | 第三肋軟骨 |
| third metacarpal bone | 台灣解剖學名詞（程式內建對照表） | 第三掌骨 |
| third metatarsal bone | 台灣解剖學名詞（程式內建對照表） | 第三蹠骨 |
| fourth costal cartilage | 台灣解剖學名詞（程式內建對照表） | 第四肋軟骨 |
| fourth metacarpal bone | 台灣解剖學名詞（程式內建對照表） | 第四掌骨 |
| fourth metatarsal bone | 台灣解剖學名詞（程式內建對照表） | 第四蹠骨 |
| fifth costal cartilage | 台灣解剖學名詞（程式內建對照表） | 第五肋軟骨 |
| fifth metacarpal bone | 台灣解剖學名詞（程式內建對照表） | 第五掌骨 |
| fifth metatarsal bone | 台灣解剖學名詞（程式內建對照表） | 第五蹠骨 |
| sixth costal cartilage | 台灣解剖學名詞（程式內建對照表） | 第六肋軟骨 |
| seventh costal cartilage | 台灣解剖學名詞（程式內建對照表） | 第七肋軟骨 |
| calcaneus | 台灣解剖學名詞（程式內建對照表） | 跟骨 |
| capitate | 台灣解剖學名詞（程式內建對照表） | 頭狀骨 |
| cuboid bone | 台灣解剖學名詞（程式內建對照表） | 骰骨 |
| femur | 台灣解剖學名詞（程式內建對照表） | 股骨 |
| fibula | 台灣解剖學名詞（程式內建對照表） | 腓骨 |
| hamate | 台灣解剖學名詞（程式內建對照表） | 鉤骨 |
| humerus | 台灣解剖學名詞（程式內建對照表） | 肱骨 |
| inferior nasal concha | 台灣解剖學名詞（程式內建對照表） | 下鼻甲 |
| intermediate cuneiform bone | 台灣解剖學名詞（程式內建對照表） | 中間楔骨 |
| lacrimal bone | 台灣解剖學名詞（程式內建對照表） | 淚骨 |
| Sesamoid bone of foot | 台灣解剖學名詞（程式內建對照表） | 足籽骨 |
| lateral cuneiform bone | 台灣解剖學名詞（程式內建對照表） | 外側楔骨 |
| lunate | 台灣解剖學名詞（程式內建對照表） | 月狀骨 |
| maxilla | 台灣解剖學名詞（程式內建對照表） | 上頜骨 |
| medial cuneiform bone | 台灣解剖學名詞（程式內建對照表） | 內側楔骨 |
| nasal bone | 台灣解剖學名詞（程式內建對照表） | 鼻骨 |
| palatine bone | 台灣解剖學名詞（程式內建對照表） | 顎骨 |
| parietal bone | 台灣解剖學名詞（程式內建對照表） | 頂骨 |
| patella | 台灣解剖學名詞（程式內建對照表） | 髕骨 |
| pisiform | 台灣解剖學名詞（程式內建對照表） | 豆狀骨 |
| radius | 台灣解剖學名詞（程式內建對照表） | 橈骨 |
| scaphoid | 台灣解剖學名詞（程式內建對照表） | 舟狀骨 |
| scapula | 台灣解剖學名詞（程式內建對照表） | 肩胛骨 |
| talus | 台灣解剖學名詞（程式內建對照表） | 距骨 |
| temporal bone | 台灣解剖學名詞（程式內建對照表） | 顳骨 |
| tibia | 台灣解剖學名詞（程式內建對照表） | 脛骨 |
| trapezium | 台灣解剖學名詞（程式內建對照表） | 大菱形骨 |
| trapezoid | 台灣解剖學名詞（程式內建對照表） | 小菱形骨 |
| triquetral | 台灣解剖學名詞（程式內建對照表） | 三角骨 |
| ulna | 台灣解剖學名詞（程式內建對照表） | 尺骨 |
| zygomatic bone | 台灣解剖學名詞（程式內建對照表） | 顴骨 |
| Mandible | 台灣解剖學名詞（程式內建對照表） | 下頜骨 |
| Manubrium | 台灣解剖學名詞（程式內建對照表） | 胸骨柄 |
| Middle phalanx of ring finger | 台灣解剖學名詞（程式內建對照表） | 無名指中節指骨 |
| Middle phalanx of second toe | 台灣解剖學名詞（程式內建對照表） | 第二趾中節趾骨 |
| Middle phalanx of third toe | 台灣解剖學名詞（程式內建對照表） | 第三趾中節趾骨 |
| Middle phalanx of fourth toe | 台灣解剖學名詞（程式內建對照表） | 第四趾中節趾骨 |
| Middle phalanx of index finger | 台灣解剖學名詞（程式內建對照表） | 食指中節指骨 |
| Middle phalanx of little finger | 台灣解剖學名詞（程式內建對照表） | 小指中節指骨 |
| Middle phalanx of little toe | 台灣解剖學名詞（程式內建對照表） | 小趾中節趾骨 |
| Middle phalanx of middle finger | 台灣解剖學名詞（程式內建對照表） | 中指中節指骨 |
| Navicular bone of foot | 台灣解剖學名詞（程式內建對照表） | 足舟骨 |
| Occipital bone | 台灣解剖學名詞（程式內建對照表） | 枕骨 |
| Proximal phalanx of big toe | 台灣解剖學名詞（程式內建對照表） | 拇趾近節趾骨 |
| Proximal phalanx of third toe | 台灣解剖學名詞（程式內建對照表） | 第三趾近節趾骨 |
| Proximal phalanx of fourth toe | 台灣解剖學名詞（程式內建對照表） | 第四趾近節趾骨 |
| Proximal phalanx of index finger | 台灣解剖學名詞（程式內建對照表） | 食指近節指骨 |
| Proximal phalanx of little finger | 台灣解剖學名詞（程式內建對照表） | 小指近節指骨 |
| Proximal phalanx of little toe | 台灣解剖學名詞（程式內建對照表） | 小趾近節趾骨 |
| Proximal phalanx of middle finger | 台灣解剖學名詞（程式內建對照表） | 中指近節指骨 |
| Proximal phalanx of ring finger | 台灣解剖學名詞（程式內建對照表） | 無名指近節指骨 |
| Proximal phalanx of thumb | 台灣解剖學名詞（程式內建對照表） | 拇指近節指骨 |
| Proximal phalanx of second toe | 台灣解剖學名詞（程式內建對照表） | 第二趾近節趾骨 |
| Sacrum | 台灣解剖學名詞（程式內建對照表） | 薦骨 |
| Sphenoid bone | 台灣解剖學名詞（程式內建對照表） | 蝶骨 |
| Vomer | 台灣解剖學名詞（程式內建對照表） | 犁骨 |
| Mesentery of small intestine | 台灣解剖學名詞（程式內建對照表） | 小腸繫膜 |
| Mesoappendix | 台灣解剖學名詞（程式內建對照表） | 闌尾繫膜 |
| Transverse mesocolon | 台灣解剖學名詞（程式內建對照表） | 橫結腸繫膜 |
| Ascending branch of colic artery | 台灣解剖學名詞（程式內建對照表） | 結腸動脈升支 |
| colic vein | 台灣解剖學名詞（程式內建對照表） | 結腸靜脈 |
| Anterior inferior pancreaticoduodenal artery | 台灣解剖學名詞（程式內建對照表） | 胰十二指腸前下動脈 |
| Anterior cecal artery | 台灣解剖學名詞（程式內建對照表） | 盲腸前動脈 |
| Anterior superior pancreaticoduodenal artery | 台灣解剖學名詞（程式內建對照表） | 胰十二指腸前上動脈 |
| Appendicular artery | glossary.json（其他筆記） | 闌尾動脈 |
| Arch of aorta | 台灣解剖學名詞（程式內建對照表） | 主動脈弓 |
| Ascending aorta | 台灣解剖學名詞（程式內建對照表） | 升主動脈 |
| Ascending branch of inferior branch of ileocolic artery | 台灣解剖學名詞（程式內建對照表） | 迴結腸動脈下支升支 |
| Ileocolic vein | 台灣解剖學名詞（程式內建對照表） | 迴結腸靜脈 |
| Azygos vein | 台灣解剖學名詞（程式內建對照表） | 奇靜脈 |
| Brachiocephalic artery | 台灣解剖學名詞（程式內建對照表） | 頭臂動脈 |
| Bronchial branch of arch of aorta | 台灣解剖學名詞（程式內建對照表） | 主動脈弓支氣管支 |
| Caudal pancreatic artery | 台灣解剖學名詞（程式內建對照表） | 胰尾動脈 |
| Celiac trunk | 台灣解剖學名詞（程式內建對照表） | 腹腔動脈幹 |
| Descending aorta | 台灣解剖學名詞（程式內建對照表） | 降主動脈 |
| Descending branch of colic artery | 台灣解剖學名詞（程式內建對照表） | 結腸動脈降支 |
| Dorsal pancreatic artery | glossary.json（其他筆記） | 背胰動脈 |
| Set of oesophageal branches of thoracic aorta | 台灣解剖學名詞（程式內建對照表） | 胸主動脈食道支 |
| Trunk of gastroduodenal artery | 台灣解剖學名詞（程式內建對照表） | 胃十二指腸動脈幹 |
| Great pancreatic artery | 台灣解剖學名詞（程式內建對照表） | 胰大動脈 |
| Hemiazygos vein | 台灣解剖學名詞（程式內建對照表） | 半奇靜脈 |
| Ileal artery | glossary.json（其他筆記） | 迴腸動脈 |
| Ileal vein | 台灣解剖學名詞（程式內建對照表） | 迴腸靜脈 |
| Ileocolic artery | glossary.json（其他筆記） | 迴結腸動脈 |
| Inferior vena cava | 台灣解剖學名詞（程式內建對照表） | 下腔靜脈 |
| Inferior mesenteric artery | glossary.json（其他筆記） | 下腸繫膜動脈 |
| Inferior mesenteric vein | 台灣解剖學名詞（程式內建對照表） | 下腸繫膜靜脈 |
| Inferior pancreatic artery | 台灣解剖學名詞（程式內建對照表） | 胰下動脈 |
| Inferior pancreaticoduodenal artery | glossary.json（其他筆記） | 下胰十二指腸動脈 |
| Inferior phrenic vein | 台灣解剖學名詞（程式內建對照表） | 膈下靜脈 |
| Anterior division of renal artery | 台灣解剖學名詞（程式內建對照表） | 腎動脈前分支 |
| common iliac artery | 台灣解剖學名詞（程式內建對照表） | 總髂動脈 |
| common iliac vein | glossary.json（其他筆記） | 總髂靜脈 |
| external iliac artery | glossary.json（其他筆記） | 外髂動脈 |
| inferior suprarenal artery | 台灣解剖學名詞（程式內建對照表） | 腎上腺下動脈 |
| internal iliac artery | glossary.json（其他筆記） | 內髂動脈 |
| internal iliac vein | 台灣解剖學名詞（程式內建對照表） | 髂內靜脈 |
| middle suprarenal artery | 台灣解剖學名詞（程式內建對照表） | 腎上腺中動脈 |
| Posterior division of renal artery | 台灣解剖學名詞（程式內建對照表） | 腎動脈後分支 |
| Trunk of renal artery | 台灣解剖學名詞（程式內建對照表） | 腎動脈幹 |
| renal vein | 台灣解剖學名詞（程式內建對照表） | 腎靜脈 |
| subclavian artery | glossary.json（其他筆記） | 鎖骨下動脈 |
| suprarenal vein | glossary.json（其他筆記） | 腎上腺靜脈 |
| Ureteric segment of renal artery | 台灣解剖學名詞（程式內建對照表） | 腎動脈輸尿管段 |
| brachiocephalic vein | 台灣解剖學名詞（程式內建對照表） | 頭臂靜脈 |
| common carotid artery | glossary.json（其他筆記） | 總頸動脈 |
| external iliac vein | 台灣解剖學名詞（程式內建對照表） | 髂外靜脈 |
| internal jugular vein | glossary.json（其他筆記） | 內頸靜脈 |
| subclavian vein | 台灣解剖學名詞（程式內建對照表） | 鎖骨下靜脈 |
| ascending lumbar vein | 台灣解剖學名詞（程式內建對照表） | 腰升靜脈 |
| colic artery | 台灣解剖學名詞（程式內建對照表） | 結腸動脈 |
| dorsal artery of penis | 台灣解剖學名詞（程式內建對照表） | 陰莖背動脈 |
| gastric artery | 台灣解剖學名詞（程式內建對照表） | 胃動脈 |
| gastric vein | 台灣解剖學名詞（程式內建對照表） | 胃靜脈 |
| gastro-epiploic artery | 台灣解剖學名詞（程式內建對照表） | 胃網膜動脈 |
| gastroepiploic vein | 台灣解剖學名詞（程式內建對照表） | 胃網膜靜脈 |
| iliolumbar vein | 台灣解剖學名詞（程式內建對照表） | 髂腰靜脈 |
| inferior epigastric artery | glossary.json（其他筆記） | 下腹壁動脈 |
| inferior epigastric vein | 台灣解剖學名詞（程式內建對照表） | 腹壁下靜脈 |
| inferior gluteal vein | 台灣解剖學名詞（程式內建對照表） | 臀下靜脈 |
| inferior phrenic artery | glossary.json（其他筆記） | 下膈動脈 |
| internal pudendal vein | 台灣解剖學名詞（程式內建對照表） | 陰部內靜脈 |
| lateral sacral vein | glossary.json（其他筆記） | 外薦靜脈 |
| obturator vein | 台灣解剖學名詞（程式內建對照表） | 閉孔靜脈 |
| superficial epigastric artery | glossary.json（跑考摘要） | 淺腹壁動脈 |
| superior epigastric vein | 台灣解剖學名詞（程式內建對照表） | 腹壁上靜脈 |
| superior gluteal vein | 台灣解剖學名詞（程式內建對照表） | 臀上靜脈 |
| testicular artery | glossary.json（其他筆記） | 睪丸動脈 |
| testicular vein | 台灣解剖學名詞（程式內建對照表） | 睪丸靜脈 |
| Marginal artery of colon | 台灣解剖學名詞（程式內建對照表） | 結腸邊緣動脈 |
| Median sacral vein | 台灣解剖學名詞（程式內建對照表） | 薦正中靜脈 |
| Middle colic artery | 台灣解剖學名詞（程式內建對照表） | 中結腸動脈 |
| Middle colic vein | 台灣解剖學名詞（程式內建對照表） | 中結腸靜脈 |
| Pancreaticoduodenal vein | 台灣解剖學名詞（程式內建對照表） | 胰十二指腸靜脈 |
| Posterior inferior pancreaticoduodenal artery | 台灣解剖學名詞（程式內建對照表） | 胰十二指腸後下動脈 |
| Posterior cecal artery | 台灣解剖學名詞（程式內建對照表） | 盲腸後動脈 |
| Posterior superior pancreaticoduodenal artery | 台灣解剖學名詞（程式內建對照表） | 胰十二指腸後上動脈 |
| Lumbar vein | 台灣解剖學名詞（程式內建對照表） | 腰靜脈 |
| Lumbar artery | glossary.json（其他筆記） | 腰動脈 |
| Sigmoid artery | glossary.json（其他筆記） | 乙狀結腸動脈 |
| Sigmoid vein | 台灣解剖學名詞（程式內建對照表） | 乙狀結腸靜脈 |
| Splenic vein | 台灣解剖學名詞（程式內建對照表） | 脾靜脈 |
| Trunk of superior mesenteric artery | 台灣解剖學名詞（程式內建對照表） | 上腸繫膜動脈幹 |
| Superior vena cava | 台灣解剖學名詞（程式內建對照表） | 上腔靜脈 |
| Superior mesenteric vein | 台灣解剖學名詞（程式內建對照表） | 上腸繫膜靜脈 |
| Superior phrenic vein | 台灣解剖學名詞（程式內建對照表） | 膈上靜脈 |
| Superior rectal artery | glossary.json（其他筆記） | 上直腸動脈 |
| Superior rectal vein | 台灣解剖學名詞（程式內建對照表） | 直腸上靜脈 |
| olfactory nerve (I) | 台灣解剖學名詞（程式內建對照表） | 嗅神經（第一對腦神經） |
| optic nerve (II) | 台灣解剖學名詞（程式內建對照表） | 視神經（第二對腦神經） |
| oculomotor nerve (III) | 台灣解剖學名詞（程式內建對照表） | 動眼神經（第三對腦神經） |
| sensory root of trigeminal nerve | 台灣解剖學名詞（程式內建對照表） | 三叉神經感覺根 |
| trigeminal nerve (V) | 台灣解剖學名詞（程式內建對照表） | 三叉神經（第五對腦神經） |
| inferior alveolar nerve | 台灣解剖學名詞（程式內建對照表） | 下齒槽神經 |
| mental nerve | 台灣解剖學名詞（程式內建對照表） | 頦神經 |
| nerve to mylohyoid muscle | 台灣解剖學名詞（程式內建對照表） | 下頷舌骨肌神經 |
| buccal nerve | 台灣解剖學名詞（程式內建對照表） | 頰神經 |
| posterior division of mandibular nerve | 台灣解剖學名詞（程式內建對照表） | 下頷神經後股 |
| anterior division of mandibular nerve | 台灣解剖學名詞（程式內建對照表） | 下頷神經前股 |
| lingual nerve | glossary.json（其他筆記） | 舌神經 |
| maxillary nerve | 台灣解剖學名詞（程式內建對照表） | 腋神經 |
| meningeal branch of maxillary nerve | 台灣解剖學名詞（程式內建對照表） | 腋神經 |
| motor root of trigeminal nerve | 台灣解剖學名詞（程式內建對照表） | 三叉神經運動根 |
| facial nerve (VII) | 台灣解剖學名詞（程式內建對照表） | 顏面神經（第七對腦神經） |
| vestibular nerve | 台灣解剖學名詞（程式內建對照表） | 前庭神經 |
| Cochlear nerve | 台灣解剖學名詞（程式內建對照表） | 耳蝸神經 |
| vestibulocochlear nerve (VIII) | 台灣解剖學名詞（程式內建對照表） | 前庭耳蝸神經（第八對腦神經） |
| glossopharyngeal nerve (IX) | 台灣解剖學名詞（程式內建對照表） | 舌咽神經（第九對腦神經） |
| vagus nerve (X) | 台灣解剖學名詞（程式內建對照表） | 迷走神經 |
| accessory nerve (XI) | 台灣解剖學名詞（程式內建對照表） | 副神經（第十一對腦神經） |
| hypoglossal nerve (XII) | 台灣解剖學名詞（程式內建對照表） | 舌下神經（第十二對腦神經） |
| abducens nerve (VI) | 台灣解剖學名詞（程式內建對照表） | 外旋神經（第六對腦神經） |
| trochlear nerve (IV) | 台灣解剖學名詞（程式內建對照表） | 滑車 |
| superior trunk of brachial plexus | 台灣解剖學名詞（程式內建對照表） | 臂神經叢上幹 |
| posterior division of superior trunk of brachial plexus | 台灣解剖學名詞（程式內建對照表） | 臂神經叢上幹後股 |
| anterior division of superior trunk of brachial plexus | 台灣解剖學名詞（程式內建對照表） | 臂神經叢上幹前股 |
| middle trunk of brachial plexus | 台灣解剖學名詞（程式內建對照表） | 臂神經叢中幹 |
| anterior division of middle trunk of brachial plexus | 台灣解剖學名詞（程式內建對照表） | 臂神經叢中幹前股 |
| posterior division of middle trunk of brachial plexus | 台灣解剖學名詞（程式內建對照表） | 臂神經叢中幹後股 |
| inferior trunk of brachial plexus | 台灣解剖學名詞（程式內建對照表） | 臂神經叢下幹 |
| anterior division of inferior trunk of brachial plexus | 台灣解剖學名詞（程式內建對照表） | 臂神經叢下幹前股 |
| posterior division of inferior trunk of brachial plexus | 台灣解剖學名詞（程式內建對照表） | 臂神經叢下幹後股 |
| roots of brachial plexus | 台灣解剖學名詞（程式內建對照表） | 臂神經叢神經根 |
| dorsal scapular nerve | glossary.json（其他筆記） | 背肩胛神經 |
| long thoracic nerve | glossary.json（其他筆記） | 長胸神經 |
| suprascapular nerve | 台灣解剖學名詞（程式內建對照表） | 肩胛上神經 |
| subclavian nerve | 台灣解剖學名詞（程式內建對照表） | 鎖骨下肌神經 |
| axillary nerve | 台灣解剖學名詞（程式內建對照表） | 腋神經 |
| posterior cord of brachial plexus | 台灣解剖學名詞（程式內建對照表） | 臂神經叢後束 |
| lateral pectoral nerve | 台灣解剖學名詞（程式內建對照表） | 外側胸神經 |
| musculocutaneous nerve | 台灣解剖學名詞（程式內建對照表） | 肌皮神經 |
| lateral antebrachial cutaneous nerve | 台灣解剖學名詞（程式內建對照表） | 外側前臂皮神經 |
| deep branch of radial nerve | 台灣解剖學名詞（程式內建對照表） | 橈神經深支 |
| posterior interosseous nerve of forearm | 台灣解剖學名詞（程式內建對照表） | 後骨間神經 |
| superficial branch of radial nerve | 台灣解剖學名詞（程式內建對照表） | 橈神經淺支 |
| dorsal digital branches of radial nerve | 台灣解剖學名詞（程式內建對照表） | 橈神經背側指支 |
| posterior antebrachial cutaneous nerve | 台灣解剖學名詞（程式內建對照表） | 後前臂皮神經 |
| radial nerve | 台灣解剖學名詞（程式內建對照表） | 橈神經 |
| inferior lateral brachial cutaneous nerve | 台灣解剖學名詞（程式內建對照表） | 下外側臂皮神經 |
| muscular branches of radial nerve | 台灣解剖學名詞（程式內建對照表） | 橈神經肌支 |
| superior lateral brachial cutaneous nerve | 台灣解剖學名詞（程式內建對照表） | 上外側臂皮神經 |
| muscular branches of axillary nerve | 台灣解剖學名詞（程式內建對照表） | 腋神經肌支 |
| anterior branch of medial antebrachial cutaneous nerve | 台灣解剖學名詞（程式內建對照表） | 內側前臂皮神經前支 |
| posterior branch of medial antebrachial cutaneous nerve | 台灣解剖學名詞（程式內建對照表） | 內側前臂皮神經後支 |
| medial antebrachial cutaneous nerve | 台灣解剖學名詞（程式內建對照表） | 內側前臂皮神經 |
| dorsal digital branches of ulnar nerve | 台灣解剖學名詞（程式內建對照表） | 尺神經背側指支 |
| dorsal branch of ulnar nerve | 台灣解剖學名詞（程式內建對照表） | 尺神經背支 |
| proper palmar digital branches of ulnar nerve | 台灣解剖學名詞（程式內建對照表） | 尺神經掌側固有指支 |
| common palmar digital branches of ulnar nerve | 台灣解剖學名詞（程式內建對照表） | 尺神經掌側總指支 |
| superficial branch of ulnar nerve | 台灣解剖學名詞（程式內建對照表） | 尺神經淺支 |
| palmar branch of ulnar nerve | 台灣解剖學名詞（程式內建對照表） | 尺神經掌支 |
| deep branch of ulnar nerve | 台灣解剖學名詞（程式內建對照表） | 尺神經深支 |
| muscular branches of ulnar nerve | 台灣解剖學名詞（程式內建對照表） | 尺神經肌支 |
| ulnar nerve | 台灣解剖學名詞（程式內建對照表） | 尺神經 |
| medial brachial cutaneous nerve | 台灣解剖學名詞（程式內建對照表） | 內側上臂皮神經 |
| proper palmar digital branches of median nerve | 台灣解剖學名詞（程式內建對照表） | 正中神經掌側固有指支 |
| common palmar digital branches of median nerve | 台灣解剖學名詞（程式內建對照表） | 正中神經掌側總指支 |
| communicating branch of median nerve with ulnar nerve | 台灣解剖學名詞（程式內建對照表） | 正中神經 |
| median nerve | 台灣解剖學名詞（程式內建對照表） | 正中神經 |
| anterior interosseous nerve of forearm | 台灣解剖學名詞（程式內建對照表） | 前骨間神經 |
| palmar branch of median nerve | 台灣解剖學名詞（程式內建對照表） | 正中神經掌支 |
| muscular branches of median nerve | 台灣解剖學名詞（程式內建對照表） | 正中神經肌支 |
| intercostal nerves | 台灣解剖學名詞（程式內建對照表） | 肋間神經 |
| iliohypogastric nerve | 台灣解剖學名詞（程式內建對照表） | 髂腹下神經 |
| ilio-inguinal nerve | 台灣解剖學名詞（程式內建對照表） | 髂腹股溝神經 |
| infrapatellar branch of saphenous nerve | 台灣解剖學名詞（程式內建對照表） | 隱神經髕下支 |
| saphenous nerve | 台灣解剖學名詞（程式內建對照表） | 隱神經 |
| medial crural cutaneous branches of saphenous nerve | 台灣解剖學名詞（程式內建對照表） | 隱神經小腿內側皮支 |
| sural nerve | glossary.json（跑考摘要） | 腓腸神經 |
| sural communicating branch of common fibular nerve | 台灣解剖學名詞（程式內建對照表） | 腓總神經腓腸交通支 |
| medial sural cutaneous nerve | glossary.json（跑考摘要） | 內側腓腸皮神經 |
| anterior cutaneous branches of femoral nerve | 台灣解剖學名詞（程式內建對照表） | 股神經前皮支 |
| femoral nerve | glossary.json（跑考摘要） | 股神經 |
| lateral femoral cutaneous nerve | glossary.json（跑考摘要） | 外股皮神經 |
| obturator nerve | 台灣解剖學名詞（程式內建對照表） | 閉孔神經 |
| posterior branch of obturator nerve | 台灣解剖學名詞（程式內建對照表） | 閉孔神經後支 |
| anterior branch of obturator nerve | 台灣解剖學名詞（程式內建對照表） | 閉孔神經前支 |
| genitofemoral nerve | 台灣解剖學名詞（程式內建對照表） | 生殖股神經 |
| femoral branch of genitofemoral nerve | 台灣解剖學名詞（程式內建對照表） | 生殖股神經股支 |
| genital branch of genitofemoral nerve | 台灣解剖學名詞（程式內建對照表） | 生殖股神經生殖支 |
| dorsal digital branches of superficial fibular nerve | 台灣解剖學名詞（程式內建對照表） | 腓淺神經背側趾支 |
| superficial fibular nerve | glossary.json（跑考摘要） | 淺腓神經 |
| medial dorsal cutaneous nerve of foot | 台灣解剖學名詞（程式內建對照表） | 足內側背側皮神經 |
| intermediate dorsal cutaneous nerve of foot | 台灣解剖學名詞（程式內建對照表） | 足中間背側皮神經 |
| dorsal digital branches of deep fibular nerve | 台灣解剖學名詞（程式內建對照表） | 腓深神經背側趾支 |
| muscular branches of deep fibular nerve | 台灣解剖學名詞（程式內建對照表） | 腓深神經肌支 |
| deep fibular nerve | glossary.json（跑考摘要） | 深腓神經 |
| sciatic nerve | glossary.json（跑考摘要） | 坐骨神經 |
| tibial nerve | glossary.json（跑考摘要） | 脛神經 |
| proper plantar digital branches of medial plantar nerve | 台灣解剖學名詞（程式內建對照表） | 內蹠神經蹠側固有趾支 |
| common plantar digital branches of lateral plantar nerve | 台灣解剖學名詞（程式內建對照表） | 外蹠神經蹠側總趾支 |
| lateral plantar nerve | glossary.json（跑考摘要） | 外蹠神經 |
| medial plantar nerve | glossary.json（跑考摘要） | 內蹠神經 |
| common fibular nerve | glossary.json（跑考摘要） | 總腓神經 |
| proper plantar digital branches of lateral plantar nerve | 台灣解剖學名詞（程式內建對照表） | 外蹠神經蹠側固有趾支 |
| Common plantar digital branches of medial plantar nerve | 台灣解剖學名詞（程式內建對照表） | 內蹠神經蹠側總趾支 |
| sympathetic nerves | 台灣解剖學名詞（程式內建對照表） | 交感神經 |
| ganglia of sympathetic trunk | 台灣解剖學名詞（程式內建對照表） | 交感幹神經節 |
| sympathetic trunk | 台灣解剖學名詞（程式內建對照表） | 交感幹 |
| White matter of spinal cord | 台灣解剖學名詞（程式內建對照表） | 脊髓白質 |
| Posterior horn of spinal cord | 台灣解剖學名詞（程式內建對照表） | 脊髓後角 |
| Anterior horn of spinal cord | 台灣解剖學名詞（程式內建對照表） | 脊髓前角 |
| spinal ganglion | 台灣解剖學名詞（程式內建對照表） | 脊神經節 |
| posterior root of spinal nerve | 台灣解剖學名詞（程式內建對照表） | 脊神經後根 |
| anterior root of spinal nerve | 台灣解剖學名詞（程式內建對照表） | 脊神經前根 |
| medial pectoral nerve | 台灣解剖學名詞（程式內建對照表） | 內側胸神經 |
| superior subscapular nerve | 台灣解剖學名詞（程式內建對照表） | 肩胛下神經（上） |
| inferior subscapular nerve | 台灣解剖學名詞（程式內建對照表） | 肩胛下神經（下） |
| thoracodorsal nerve | 台灣解剖學名詞（程式內建對照表） | 胸背神經 |
| superior gluteal nerve | glossary.json（跑考摘要） | 臀上神經 |
| nerve to piriformis muscle | 台灣解剖學名詞（程式內建對照表） | 梨狀肌神經 |
| nerve to quadratus femoris muscle | 台灣解剖學名詞（程式內建對照表） | 股方肌神經 |
| posterior femoral cutaneous nerve | 台灣解剖學名詞（程式內建對照表） | 股後皮神經 |
| anterior root of posterior femoral cutaneous nerve | 台灣解剖學名詞（程式內建對照表） | 股後皮神經前根 |
| posterior root of posterior femoral cutaneous nerve | 台灣解剖學名詞（程式內建對照表） | 股後皮神經後根 |
| pudendal nerve | glossary.json（跑考摘要） | 陰部神經 |
| suboccipital nerve | 台灣解剖學名詞（程式內建對照表） | 枕下神經 |
| greater occipital nerve | 台灣解剖學名詞（程式內建對照表） | 枕大神經 |
| third occipital nerve | 台灣解剖學名詞（程式內建對照表） | 第三枕神經 |
| lesser occipital nerve | glossary.json（其他筆記） | 枕小神經 |
| great auricular nerve | glossary.json（其他筆記） | 耳大神經 |
| suboccipital venous plexus | 台灣解剖學名詞（程式內建對照表） | 枕下靜脈叢 |
| anterior tibiofibular ligament | 台灣解剖學名詞（程式內建對照表） | 前脛腓韌帶 |
| posterior tibiofibular ligament | 台灣解剖學名詞（程式內建對照表） | 後脛腓韌帶 |
| transverse tibiofibular ligament | 台灣解剖學名詞（程式內建對照表） | 脛腓橫韌帶 |
| posterior tibiotalar ligament | 台灣解剖學名詞（程式內建對照表） | 後脛距韌帶 |
| tibiocalcaneal ligament | 台灣解剖學名詞（程式內建對照表） | 脛跟韌帶 |
| tibionavicular ligament | 台灣解剖學名詞（程式內建對照表） | 脛舟韌帶 |
| acetabular labrum | 台灣解剖學名詞（程式內建對照表） | 髖臼唇 |
| articular capsule of hip joint | 台灣解剖學名詞（程式內建對照表） | 髖關節囊 |
| descending part of iliofemoral ligament | 台灣解剖學名詞（程式內建對照表） | 髂股韌帶降部 |
| frenula capsulae | 台灣解剖學名詞（程式內建對照表） | 關節囊繫帶 |
| ischiofemoral ligament | 台灣解剖學名詞（程式內建對照表） | 坐股韌帶 |
| ligament of head of femur | 台灣解剖學名詞（程式內建對照表） | 股骨頭韌帶 |
| pubofemoral ligament | 台灣解剖學名詞（程式內建對照表） | 恥股韌帶 |
| transverse acetabular ligament | 台灣解剖學名詞（程式內建對照表） | 髖臼橫韌帶 |
| transverse part of iliofemoral ligament | 台灣解剖學名詞（程式內建對照表） | 髂股韌帶橫部 |
| dorsal metatarsal ligaments | 台灣解剖學名詞（程式內建對照表） | 背側蹠骨韌帶 |
| intersesamoid ligament | 台灣解剖學名詞（程式內建對照表） | 籽骨間韌帶 |
| metatarsal interosseous ligaments | 台灣解剖學名詞（程式內建對照表） | 蹠骨間韌帶 |
| plantar metatarsal ligaments | 台灣解剖學名詞（程式內建對照表） | 足底蹠骨韌帶 |
| articular capsule of interphalangeal joint of great toe | 台灣解剖學名詞（程式內建對照表） | 拇趾趾間關節囊 |
| articular capsules of distal interphalangeal joints of foot | 台灣解剖學名詞（程式內建對照表） | 足遠端趾間關節囊 |
| articular capsules of proximal interphalangeal joints of foot | 台灣解剖學名詞（程式內建對照表） | 足近端趾間關節囊 |
| collateral interphalangeal ligaments of foot | 台灣解剖學名詞（程式內建對照表） | 足趾間關節側副韌帶 |
| plantar interphalangeal ligaments | 台灣解剖學名詞（程式內建對照表） | 足底趾間韌帶 |
| anterior talocalcaneal ligament | 台灣解剖學名詞（程式內建對照表） | 前距跟韌帶 |
| calcaneocuboid ligament | 台灣解剖學名詞（程式內建對照表） | 跟骰韌帶 |
| calcaneonavicular ligament | 台灣解剖學名詞（程式內建對照表） | 跟舟韌帶 |
| cuneocuboid interosseous ligament | 台灣解剖學名詞（程式內建對照表） | 楔骰骨間韌帶 |
| dorsal cuneonavicular ligaments | 台灣解剖學名詞（程式內建對照表） | 背側楔舟韌帶 |
| dorsal intercuneiform ligaments | 台灣解剖學名詞（程式內建對照表） | 背側楔間韌帶 |
| intercuneiform interosseous ligaments | 台灣解剖學名詞（程式內建對照表） | 楔間骨間韌帶 |
| lateral talocalcaneal ligament | 台灣解剖學名詞（程式內建對照表） | 外側距跟韌帶 |
| medial talocalcaneal ligament | 台灣解剖學名詞（程式內建對照表） | 內側距跟韌帶 |
| plantar calcaneocuboid ligament | 台灣解剖學名詞（程式內建對照表） | 足底跟骰韌帶 |
| plantar cuneocuboid ligament | 台灣解剖學名詞（程式內建對照表） | 足底楔骰韌帶 |
| plantar cuneonavicular ligaments | 台灣解剖學名詞（程式內建對照表） | 足底楔舟韌帶 |
| plantar intercuneiform ligaments | 台灣解剖學名詞（程式內建對照表） | 足底楔間韌帶 |
| posterior talocalcaneal ligament | 台灣解剖學名詞（程式內建對照表） | 後距跟韌帶 |
| talocalcaneal interosseous ligament | 台灣解剖學名詞（程式內建對照表） | 距跟骨間韌帶 |
| talonavicular ligament | 台灣解剖學名詞（程式內建對照表） | 距舟韌帶 |
| articular capsules of metatarsophalangeal joints | 台灣解剖學名詞（程式內建對照表） | 蹠趾關節囊 |
| collateral metatarsophalangeal ligaments | 台灣解剖學名詞（程式內建對照表） | 蹠趾關節側副韌帶 |
| deep transverse metatarsal ligament | 台灣解剖學名詞（程式內建對照表） | 蹠骨深橫韌帶 |
| plantar metatarsophalangeal ligaments | 台灣解剖學名詞（程式內建對照表） | 足底蹠趾韌帶 |
| cuneometatarsal interosseous ligaments | 台灣解剖學名詞（程式內建對照表） | 楔蹠骨間韌帶 |
| dorsal tarsometatarsal ligaments | 台灣解剖學名詞（程式內建對照表） | 背側跗蹠韌帶 |
| plantar tarsometatarsal ligaments | 台灣解剖學名詞（程式內建對照表） | 足底跗蹠韌帶 |
| anterior cruciate ligament | glossary.json（跑考摘要） | 前十字韌帶 |
| anterior meniscotibial ligament (Lateral meniscus) | 台灣解剖學名詞（程式內建對照表） | 外側半月板前脛側韌帶 |
| anterior meniscotibial ligament (Medial meniscus) | 台灣解剖學名詞（程式內建對照表） | 內側半月板前脛側韌帶 |
| arcuate popliteal ligament | 台灣解剖學名詞（程式內建對照表） | 弓狀膕韌帶 |
| articular capsule of knee joint | 台灣解剖學名詞（程式內建對照表） | 膝關節囊 |
| deep part of tibial collateral ligament | 台灣解剖學名詞（程式內建對照表） | 脛側副韌帶深部 |
| fibular collateral ligament | glossary.json（跑考摘要） | 腓側副韌帶 |
| infrapatellar fat pad | 台灣解剖學名詞（程式內建對照表） | 髕下脂肪墊 |
| lateral meniscus | 台灣解剖學名詞（程式內建對照表） | 外側半月板 |
| medial meniscus | 台灣解剖學名詞（程式內建對照表） | 內側半月板 |
| meniscopatellar ligament | 台灣解剖學名詞（程式內建對照表） | 半月板髕韌帶 |
| oblique popliteal ligament | 台灣解剖學名詞（程式內建對照表） | 斜膕韌帶 |
| popliteofibular ligament | 台灣解剖學名詞（程式內建對照表） | 膕腓韌帶 |
| posterior cruciate ligament | glossary.json（跑考摘要） | 後十字韌帶 |
| posterior meniscotibial ligament (Lateral meniscus) | 台灣解剖學名詞（程式內建對照表） | 外側半月板後脛側韌帶 |
| posterior meniscotibial ligament (Medial meniscus) | 台灣解剖學名詞（程式內建對照表） | 內側半月板後脛側韌帶 |
| superficial part of tibial collateral ligament | 台灣解剖學名詞（程式內建對照表） | 脛側副韌帶淺部 |
| transverse ligament of knee | 台灣解剖學名詞（程式內建對照表） | 膝橫韌帶 |
| anterior ligament of fibular head | 台灣解剖學名詞（程式內建對照表） | 腓骨頭前韌帶 |
| articular capsule of superior tibiofibular joint | 台灣解剖學名詞（程式內建對照表） | 上脛腓關節囊 |
| posterior ligament of fibular head | 台灣解剖學名詞（程式內建對照表） | 腓骨頭後韌帶 |
| Inferior pubic ligament | 台灣解剖學名詞（程式內建對照表） | 恥骨下韌帶 |
| Interpubic disc | 台灣解剖學名詞（程式內建對照表） | 恥骨間盤 |
| Superior pubic ligament | glossary.json（其他筆記） | 恥骨上韌帶 |
| Pubic symphysis | 台灣解剖學名詞（程式內建對照表） | 恥骨聯合 |
| iliolumbar ligament | 台灣解剖學名詞（程式內建對照表） | 髂腰韌帶 |
| obturator membrane | 台灣解剖學名詞（程式內建對照表） | 閉孔膜 |
| sacrospinous ligament | glossary.json（其他筆記） | 薦棘韌帶 |
| sacrotuberous ligament | glossary.json（其他筆記） | 薦結節韌帶 |
| anterior sacro-iliac ligament | glossary.json（其他筆記） | 前薦髂韌帶 |
| interosseous sacro-iliac ligament | glossary.json（其他筆記） | 薦髂骨間韌帶 |
| posterior sacro-iliac ligament | glossary.json（其他筆記） | 後薦髂韌帶 |
| sphenomandibular ligament | glossary.json（其他筆記） | 蝶下頷韌帶 |
| stylomandibular ligament | glossary.json（其他筆記） | 莖突下頷韌帶 |
| articular capsule of temporomandibular joint | 台灣解剖學名詞（程式內建對照表） | 顳顎關節囊 |
| articular disc of temporomandibular joint | 台灣解剖學名詞（程式內建對照表） | 顳顎關節盤 |
| lateral temporomandibular ligament | 台灣解剖學名詞（程式內建對照表） | 顳顎外側韌帶 |
| articular disc of distal radio-ulnar joint | 台灣解剖學名詞（程式內建對照表） | 遠端橈尺關節盤 |
| palmar radio-ulnar ligament | 台灣解剖學名詞（程式內建對照表） | 掌側橈尺韌帶 |
| annular ligament of radius | 台灣解剖學名詞（程式內建對照表） | 橈骨環狀韌帶 |
| articular capsule of elbow joint | 台灣解剖學名詞（程式內建對照表） | 肘關節囊 |
| radial collateral ligament | 台灣解剖學名詞（程式內建對照表） | 橈側副韌帶 |
| ulnar collateral ligament | 台灣解剖學名詞（程式內建對照表） | 尺側副韌帶 |
| articular capsule of glenohumeral joint | 台灣解剖學名詞（程式內建對照表） | 盂肱關節囊 |
| coracohumeral ligament | 台灣解剖學名詞（程式內建對照表） | 喙肱韌帶 |
| glenoid labrum | 台灣解剖學名詞（程式內建對照表） | 盂唇 |
| inferior glenohumeral ligament | 台灣解剖學名詞（程式內建對照表） | 下盂肱韌帶 |
| middle glenohumeral ligament | 台灣解剖學名詞（程式內建對照表） | 中盂肱韌帶 |
| superior glenohumeral ligament | 台灣解剖學名詞（程式內建對照表） | 上盂肱韌帶 |
| transverse humeral ligament | 台灣解剖學名詞（程式內建對照表） | 肱橫韌帶 |
| dorsal carpometacarpal ligaments | 台灣解剖學名詞（程式內建對照表） | 背側腕掌韌帶 |
| palmar carpometacarpal ligaments | 台灣解剖學名詞（程式內建對照表） | 掌側腕掌韌帶 |
| dorsal scaphotriquetral ligament | 台灣解剖學名詞（程式內建對照表） | 背側舟三角韌帶 |
| dorsal intercarpal ligaments | 台灣解剖學名詞（程式內建對照表） | 背側腕間韌帶 |
| dorsal ulnocarpal ligament | 台灣解剖學名詞（程式內建對照表） | 背側尺腕韌帶 |
| palmar scaphotriquetral ligament | 台灣解剖學名詞（程式內建對照表） | 掌側舟三角韌帶 |
| pisotriquetral ligament | 台灣解剖學名詞（程式內建對照表） | 豆三角韌帶 |
| radial collateral ligament of wrist joint | 台灣解剖學名詞（程式內建對照表） | 腕橈側副韌帶 |
| radiate carpal ligament | 台灣解剖學名詞（程式內建對照表） | 腕輻狀韌帶 |
| scaphotrapeziotrapezoidal ligament | 台灣解剖學名詞（程式內建對照表） | 舟大小多角韌帶 |
| triquetrocapitate ligament | 台灣解剖學名詞（程式內建對照表） | 三角頭狀韌帶 |
| ulnar collateral ligament of wrist joint | 台灣解剖學名詞（程式內建對照表） | 腕尺側副韌帶 |
| dorsal metacarpal ligaments | 台灣解剖學名詞（程式內建對照表） | 背側掌骨韌帶 |
| interosseous metacarpal ligaments | 台灣解剖學名詞（程式內建對照表） | 掌骨間韌帶 |
| palmar metacarpal ligaments | 台灣解剖學名詞（程式內建對照表） | 掌側掌骨韌帶 |
| articular capsules of distal interphalangeal joints | 台灣解剖學名詞（程式內建對照表） | 遠端指間關節囊 |
| articular capsules of proximal interphalangeal joints | 台灣解剖學名詞（程式內建對照表） | 近端指間關節囊 |
| collateral interphalangeal ligaments of hand | 台灣解剖學名詞（程式內建對照表） | 手指間關節側副韌帶 |
| palmar interphalangeal ligaments | 台灣解剖學名詞（程式內建對照表） | 指間關節掌側韌帶 |
| articular capsules of metacarpophalangeal joints | 台灣解剖學名詞（程式內建對照表） | 掌指關節囊 |
| collateral metacarpophalangeal ligaments | 台灣解剖學名詞（程式內建對照表） | 掌指關節側副韌帶 |
| deep transverse metacarpal ligament | 台灣解剖學名詞（程式內建對照表） | 掌骨深橫韌帶 |
| articular capsule of radiocarpal joint | 台灣解剖學名詞（程式內建對照表） | 橈腕關節囊 |
| dorsal radiocarpal ligament | 台灣解剖學名詞（程式內建對照表） | 背側橈腕韌帶 |
| radioscaphocapitate ligament | 台灣解剖學名詞（程式內建對照表） | 橈舟頭狀韌帶 |
| ulnocapitate ligament | 台灣解剖學名詞（程式內建對照表） | 尺頭狀韌帶 |
| ulnolunate ligament | 台灣解剖學名詞（程式內建對照表） | 尺月韌帶 |
| ulnotriquetral ligament | 台灣解剖學名詞（程式內建對照表） | 尺三角韌帶 |
| acromioclavicular ligament | 台灣解剖學名詞（程式內建對照表） | 肩鎖韌帶 |
| articular capsule of acromioclavicular joint | 台灣解剖學名詞（程式內建對照表） | 肩鎖關節囊 |
| articular disc of acromioclavicular joint | 台灣解剖學名詞（程式內建對照表） | 肩鎖關節盤 |
| conoid ligament | 台灣解剖學名詞（程式內建對照表） | 錐狀韌帶 |
| trapezoid ligament | 台灣解剖學名詞（程式內建對照表） | 斜方韌帶 |
| anterior sternoclavicular ligament | 台灣解剖學名詞（程式內建對照表） | 前胸鎖韌帶 |
| articular capsule of sternoclavicular joint | 台灣解剖學名詞（程式內建對照表） | 胸鎖關節囊 |
| articular disc of sternoclavicular joint | 台灣解剖學名詞（程式內建對照表） | 胸鎖關節盤 |
| interclavicular ligament | 台灣解剖學名詞（程式內建對照表） | 鎖骨間韌帶 |
| posterior sternoclavicular ligament | 台灣解剖學名詞（程式內建對照表） | 後胸鎖韌帶 |
| Sacrococcygeal symphysis | 台灣解剖學名詞（程式內建對照表） | 薦尾聯合 |
| Anterior longitudinal ligament | 台灣解剖學名詞（程式內建對照表） | 前縱韌帶 |
| intercornual ligament | 台灣解剖學名詞（程式內建對照表） | 角間韌帶 |
| Interspinous ligaments | 台灣解剖學名詞（程式內建對照表） | 棘間韌帶 |
| Ligamenta flava | 台灣解剖學名詞（程式內建對照表） | 黃韌帶 |
| Nuchal ligament | 台灣解剖學名詞（程式內建對照表） | 項韌帶 |
| Posterior longitudinal ligament | 台灣解剖學名詞（程式內建對照表） | 後縱韌帶 |
| Supraspinous ligament | 台灣解剖學名詞（程式內建對照表） | 棘上韌帶 |
| quadrangular membrane | 台灣解剖學名詞（程式內建對照表） | 四角膜 |
| cricopharyngeal ligament | 台灣解剖學名詞（程式內建對照表） | 環咽韌帶 |
| external intercostal membrane | 台灣解剖學名詞（程式內建對照表） | 外肋間膜 |
| internal intercostal membrane | 台灣解剖學名詞（程式內建對照表） | 內肋間膜 |
| costotransverse ligament | 台灣解剖學名詞（程式內建對照表） | 肋橫突韌帶 |
| Intra-articular ligament of head of rib | 台灣解剖學名詞（程式內建對照表） | 肋頭關節內韌帶 |
| radiate ligament of head of rib | 台灣解剖學名詞（程式內建對照表） | 肋頭輻狀韌帶 |
| basilar venous plexus | 台灣解剖學名詞（程式內建對照表） | 基底靜脈叢 |
| cavernous sinus | 台灣解剖學名詞（程式內建對照表） | 海綿竇 |
| anterior intercavernous sinus | 台灣解剖學名詞（程式內建對照表） | 前海綿間竇 |
| distal lateral striate branches | 台灣解剖學名詞（程式內建對照表） | 外側紋狀動脈遠端分支 |
| frontal branches of callosomarginal artery | 台灣解剖學名詞（程式內建對照表） | 胼胝體邊緣動脈額支 |
| inferior petrosal sinus | 台灣解剖學名詞（程式內建對照表） | 下岩竇 |
| inferior sagittal sinus | 台灣解剖學名詞（程式內建對照表） | 下矢狀竇 |
| insular branches of middle cerebral artery (M2) | 台灣解剖學名詞（程式內建對照表） | 大腦中動脈島支（M2） |
| insular branches of middle cerebral artery (M2-segment) | 台灣解剖學名詞（程式內建對照表） | 大腦中動脈島支（M2 段） |
| lateral pontine branches of basilar artery | 台灣解剖學名詞（程式內建對照表） | 基底動脈橋腦外側支 |
| medial pontine branches of basilar artery | 台灣解剖學名詞（程式內建對照表） | 基底動脈橋腦內側支 |
| middle cerebral artery (M1-segment) | 台灣解剖學名詞（程式內建對照表） | 大腦中動脈（M1 段） |
| middle cerebral artery (M3 segment) | 台灣解剖學名詞（程式內建對照表） | 大腦中動脈（M3 段） |
| middle cerebral artery (M3-segment) | 台灣解剖學名詞（程式內建對照表） | 大腦中動脈（M3 段） |
| occipital sinus | 台灣解剖學名詞（程式內建對照表） | 枕竇 |
| orbitofrontal branches of anterior cerebral artery | 台灣解剖學名詞（程式內建對照表） | 大腦前動脈眶額支 |
| parietal branches of middle cerebral artery | 台灣解剖學名詞（程式內建對照表） | 大腦中動脈頂支 |
| posterior cerebral artery | 台灣解剖學名詞（程式內建對照表） | 大腦後動脈 |
| posterior intercavernous sinus | 台灣解剖學名詞（程式內建對照表） | 後海綿間竇 |
| proximal lateral striate branches | 台灣解剖學名詞（程式內建對照表） | 外側紋狀動脈近端分支 |
| sigmoid sinus | 台灣解剖學名詞（程式內建對照表） | 乙狀竇 |
| straight sinus | 台灣解剖學名詞（程式內建對照表） | 直竇 |
| superior petrosal sinus | 台灣解剖學名詞（程式內建對照表） | 上岩竇 |
| superior sagittal sinus | 台灣解剖學名詞（程式內建對照表） | 上矢狀竇 |
| temporal branches of middle cerebral artery | 台灣解剖學名詞（程式內建對照表） | 大腦中動脈顳支 |
| transverse sinus | 台灣解剖學名詞（程式內建對照表） | 橫竇 |
| falx cerebri | 台灣解剖學名詞（程式內建對照表） | 大腦鐮 |
| choroid plexus | 台灣解剖學名詞（程式內建對照表） | 脈絡叢 |
| temporal pole | 台灣解剖學名詞（程式內建對照表） | 顳極 |
| occipital pole | 台灣解剖學名詞（程式內建對照表） | 枕極 |
| central sulcus | 台灣解剖學名詞（程式內建對照表） | 中央溝 |
| parieto-occipital sulcus | 台灣解剖學名詞（程式內建對照表） | 頂枕溝 |
| subparietal sulcus | 台灣解剖學名詞（程式內建對照表） | 頂下溝 |
| cingulate sulcus (Marginal part) | 台灣解剖學名詞（程式內建對照表） | 扣帶溝（邊緣部） |
| circular sulcus of insula | 台灣解剖學名詞（程式內建對照表） | 腦島環溝 |
| collateral sulcus | 台灣解剖學名詞（程式內建對照表） | 側副溝 |
| anterior occipital sulcus | 台灣解剖學名詞（程式內建對照表） | 枕前溝 |
| opercular part of inferior frontal gyrus | 台灣解剖學名詞（程式內建對照表） | 額下回蓋部 |
| orbital part of inferior frontal gyrus | 台灣解剖學名詞（程式內建對照表） | 額下回眶部 |
| triangular part of inferior frontal gyrus | 台灣解剖學名詞（程式內建對照表） | 額下回三角部 |
| orbital gyri (Frontomarginal gyrus and sulcus) | 台灣解剖學名詞（程式內建對照表） | 眶回（額緣回及溝） |
| paracentral gyrus and sulcus | 台灣解剖學名詞（程式內建對照表） | 中央旁小葉及溝 |
| transverse frontopolar gyrus and sulcus | 台灣解剖學名詞（程式內建對照表） | 橫額極回及溝 |
| straight gyrus (Gyrus rectus) | 台灣解剖學名詞（程式內建對照表） | 直回（直回） |
| lat Fis-ant-Vertical | 台灣解剖學名詞（程式內建對照表） | 外側裂前垂直支 |
| inferior frontal sulcus | 台灣解剖學名詞（程式內建對照表） | 額下溝 |
| orbital gyri | 台灣解剖學名詞（程式內建對照表） | 眶回 |
| superior frontal sulcus | 台灣解剖學名詞（程式內建對照表） | 額上溝 |
| paracentral sulcus | 台灣解剖學名詞（程式內建對照表） | 中央旁溝 |
| orbital sulci (H-shaped orbital sulci) | 台灣解剖學名詞（程式內建對照表） | 眶溝（H 形眶溝） |
| orbital sulci (Lateral Orbital sulcus) | 台灣解剖學名詞（程式內建對照表） | 眶溝（外側眶溝） |
| olfactory sulcus | 台灣解剖學名詞（程式內建對照表） | 嗅溝 |
| precentral sulcus (inferior part) | 台灣解剖學名詞（程式內建對照表） | 中央前溝（下部） |
| precentral sulcus (Superior part) | 台灣解剖學名詞（程式內建對照表） | 中央前溝（上部） |
| postcentral sulcus | 台灣解剖學名詞（程式內建對照表） | 中央後溝 |
| precuneus | 台灣解剖學名詞（程式內建對照表） | 楔前葉 |
| intraparietal sulcus | 台灣解剖學名詞（程式內建對照表） | 頂內溝 |
| inferior occipital gyrus and sulcus | 台灣解剖學名詞（程式內建對照表） | 枕下回及溝 |
| lingual gyrus | 台灣解剖學名詞（程式內建對照表） | 舌回 |
| lateral occipital gyrus (Middle occipital gyrus) | 台灣解剖學名詞（程式內建對照表） | 枕外側回（枕中回） |
| calcarine sulcus | 台灣解剖學名詞（程式內建對照表） | 距狀溝 |
| cuneus | 台灣解剖學名詞（程式內建對照表） | 楔葉 |
| superior occipital gyri | 台灣解剖學名詞（程式內建對照表） | 枕上回 |
| lunate sulcus | 台灣解剖學名詞（程式內建對照表） | 月狀溝 |
| transverse occipital sulcus | 台灣解剖學名詞（程式內建對照表） | 枕橫溝 |
| transverse temporal gyri | 台灣解剖學名詞（程式內建對照表） | 顳橫回 |
| temporal plane | 台灣解剖學名詞（程式內建對照表） | 顳平面 |
| superior temporal gyrus (Lateral part) | 台灣解剖學名詞（程式內建對照表） | 顳上回（外側部） |
| lateral occipitotemporal gyrus | 台灣解剖學名詞（程式內建對照表） | 外側枕顳回 |
| medial occipitotemporal gyrus (Parahippocampal) | 台灣解剖學名詞（程式內建對照表） | 內側枕顳回（海馬旁回） |
| inferior temporal sulcus | 台灣解剖學名詞（程式內建對照表） | 顳下溝 |
| superior temporal sulcus | 台灣解剖學名詞（程式內建對照表） | 顳上溝 |
| occipitotemporal sulcus (Lateral part) | 台灣解剖學名詞（程式內建對照表） | 枕顳溝（外側部） |
| insula (Subcentral gyrus and ant. and post. sulci) | 台灣解剖學名詞（程式內建對照表） | 腦島（中央下回及前後溝） |
| cingulate gyrus and sulcus (Middle anterior part) | 台灣解剖學名詞（程式內建對照表） | 扣帶回及溝（中前部） |
| cingulate gyrus and sulcus (Middle posterior part) | 台灣解剖學名詞（程式內建對照表） | 扣帶回及溝（中後部） |
| cingulate gyrus and sulcus (Posterior dorsal part) | 台灣解剖學名詞（程式內建對照表） | 扣帶回及溝（後背側部） |
| cingulate gyrus (Posteroventral part) | 台灣解剖學名詞（程式內建對照表） | 扣帶回（後腹側部） |
| septal nuclei | 台灣解剖學名詞（程式內建對照表） | 中隔核 |
| hippocampal commissure | 台灣解剖學名詞（程式內建對照表） | 海馬連合 |
| fornix | 台灣解剖學名詞（程式內建對照表） | 穹窿 |
| white matter of telencephalon | 台灣解剖學名詞（程式內建對照表） | 端腦白質 |
| septum pellucidum | 台灣解剖學名詞（程式內建對照表） | 透明中隔 |
| lat Fis-ant-Horizont | 台灣解剖學名詞（程式內建對照表） | 外側裂前水平支 |
| lat Fis-post | 台灣解剖學名詞（程式內建對照表） | 外側裂後支 |
| posterior transverse collateral sulcus | 台灣解剖學名詞（程式內建對照表） | 後橫側副溝 |
| sulcus interm prim-Jensen | 台灣解剖學名詞（程式內建對照表） | 詹森氏中間初級溝 |
| stria medullaris thalami | 台灣解剖學名詞（程式內建對照表） | 視丘髓紋 |
| mamillary body | 台灣解剖學名詞（程式內建對照表） | 乳頭體 |
| base of peduncle | 台灣解剖學名詞（程式內建對照表） | 大腦腳底 |
| nucleus of oculomotor nerve | 台灣解剖學名詞（程式內建對照表） | 動眼神經 |
| accessory nucleus of oculomotor nerve | 台灣解剖學名詞（程式內建對照表） | 動眼神經 |
| red nucleus | 台灣解剖學名詞（程式內建對照表） | 紅核 |
| aqueduct of midbrain | 台灣解剖學名詞（程式內建對照表） | 中腦導水管 |
| vestibular nuclei | 台灣解剖學名詞（程式內建對照表） | 前庭神經核 |
| nucleus of abducens nerve | 台灣解剖學名詞（程式內建對照表） | 外旋神經核 |
| motor nucleus of facial nerve | 台灣解剖學名詞（程式內建對照表） | 顏面神經運動核 |
| superior salivatory nucleus | 台灣解剖學名詞（程式內建對照表） | 上泌涎核 |
| pyramid of medulla oblongata | 台灣解剖學名詞（程式內建對照表） | 延腦錐體 |
| olive | 台灣解剖學名詞（程式內建對照表） | 橄欖體 |
| wing of central lobule | 台灣解剖學名詞（程式內建對照表） | 中央小葉翼 |
| uvula of vermis | 台灣解剖學名詞（程式內建對照表） | 蚓垂 |
| tuber of vermis | 台灣解剖學名詞（程式內建對照表） | 蚓結節 |
| tonsil of cerebellum | 台灣解剖學名詞（程式內建對照表） | 小腦扁桃體 |
| superior semilunar lobule | 台灣解剖學名詞（程式內建對照表） | 上半月小葉 |
| superior cerebellar peduncle | 台灣解剖學名詞（程式內建對照表） | 上小腦腳 |
| pyramis of vermis | 台灣解剖學名詞（程式內建對照表） | 蚓錐 |
| posterior quadrangular lobule | 台灣解剖學名詞（程式內建對照表） | 後四角小葉 |
| peduncle of flocculus | 台灣解剖學名詞（程式內建對照表） | 絨球腳 |
| nodule of vermis | 台灣解剖學名詞（程式內建對照表） | 蚓小結 |
| lingula of cerebellum | 台灣解剖學名詞（程式內建對照表） | 小腦舌 |
| inferior semilunar lobule | 台灣解剖學名詞（程式內建對照表） | 下半月小葉 |
| gracile lobule | 台灣解剖學名詞（程式內建對照表） | 薄小葉 |
| folium of vermis | 台灣解剖學名詞（程式內建對照表） | 蚓葉 |
| flocculus | 台灣解剖學名詞（程式內建對照表） | 絨球 |
| declive | 台灣解剖學名詞（程式內建對照表） | 山坡 |
| culmen | 台灣解剖學名詞（程式內建對照表） | 山頂 |
| central lobule | 台灣解剖學名詞（程式內建對照表） | 中央小葉 |
| biventral lobule | 台灣解剖學名詞（程式內建對照表） | 二腹小葉 |
| anterior quadrangular lobule | 台灣解剖學名詞（程式內建對照表） | 前四角小葉 |
| globus pallidus external | 台灣解剖學名詞（程式內建對照表） | 蒼白球外側部 |
| globus pallidus internal | 台灣解剖學名詞（程式內建對照表） | 蒼白球內側部 |
| subthalamic nucleus | 台灣解剖學名詞（程式內建對照表） | 視丘下核 |
| substantia nigra | 台灣解剖學名詞（程式內建對照表） | 黑質 |
| nucleus accumbens | 台灣解剖學名詞（程式內建對照表） | 伏隔核 |
| pulvinar | 台灣解剖學名詞（程式內建對照表） | 視丘枕 |
| anterior nuclei of thalamus | 台灣解剖學名詞（程式內建對照表） | 視丘前核群 |
| mediodorsal nucleus | 台灣解剖學名詞（程式內建對照表） | 背內側核 |
| ventral laterodorsal nucleus | 台灣解剖學名詞（程式內建對照表） | 腹外背側核 |
| intralaminar and lateral posterior nuclei | 台灣解剖學名詞（程式內建對照表） | 板內核群及外側後核 |
| ventral anterior nucleus | 台灣解剖學名詞（程式內建對照表） | 腹前核 |
| ventral lateroventral nucleus | 台灣解剖學名詞（程式內建對照表） | 腹外腹側核 |
| lateral nucleus | 台灣解剖學名詞（程式內建對照表） | 外側核 |
| basolateral complex | 台灣解剖學名詞（程式內建對照表） | 基底外側複合體 |
| central nucleus | 台灣解剖學名詞（程式內建對照表） | 中央核 |
| corticomedial group | 台灣解剖學名詞（程式內建對照表） | 皮質內側核群 |
| preoptic hypothalamus | 台灣解剖學名詞（程式內建對照表） | 視前下視丘 |
| anterior hypothalamus | 台灣解剖學名詞（程式內建對照表） | 下視丘前部 |
| tuberal hypothalamus | 台灣解剖學名詞（程式內建對照表） | 下視丘結節部 |
| lateral hypothalamus | 台灣解剖學名詞（程式內建對照表） | 下視丘外側部 |
| posterior hypothalamus | 台灣解剖學名詞（程式內建對照表） | 下視丘後部 |
| adenohypophysis | 台灣解剖學名詞（程式內建對照表） | 腺垂體 |
| neurohypophysis | 台灣解剖學名詞（程式內建對照表） | 神經垂體 |
| pineal gland | 台灣解剖學名詞（程式內建對照表） | 松果腺 |
| acoustic radiation | 台灣解剖學名詞（程式內建對照表） | 聽放射 |
| anterior thalamic radiation | 台灣解剖學名詞（程式內建對照表） | 前視丘輻射 |
| arcuate fasciculus | 台灣解剖學名詞（程式內建對照表） | 弓狀束 |
| corticobulbar tract | 台灣解剖學名詞（程式內建對照表） | 皮質延髓徑 |
| corticopontine tract (frontal) | 台灣解剖學名詞（程式內建對照表） | 額橋徑 |
| corticopontine tract (occipital) | 台灣解剖學名詞（程式內建對照表） | 枕橋徑 |
| corticopontine tract (parietal) | 台灣解剖學名詞（程式內建對照表） | 頂橋徑 |
| corticospinal tract | 台灣解剖學名詞（程式內建對照表） | 皮質脊髓徑 |
| corticostriatal tract (anterior) | 台灣解剖學名詞（程式內建對照表） | 皮質紋狀體徑（前） |
| corticostriatal tract (posterior) | 台灣解剖學名詞（程式內建對照表） | 皮質紋狀體徑（後） |
| corticostriatal tract (superior) | 台灣解剖學名詞（程式內建對照表） | 皮質紋狀體徑（上） |
| dentatorubrothalamic tract | 台灣解剖學名詞（程式內建對照表） | 齒狀核紅核視丘徑 |
| frontal aslant tract | 台灣解剖學名詞（程式內建對照表） | 額斜束 |
| inferior cerebellar peduncle | 台灣解剖學名詞（程式內建對照表） | 下小腦腳 |
| inferior fronto-occipital fasciculus | 台灣解剖學名詞（程式內建對照表） | 下額枕束 |
| inferior longitudinal fasciculus | 台灣解剖學名詞（程式內建對照表） | 下縱束 |
| medial lemniscus | 台灣解剖學名詞（程式內建對照表） | 內側蹄系 |
| middle cerebellar peduncle | 台灣解剖學名詞（程式內建對照表） | 中小腦腳 |
| middle longitudinal fasciculus | 台灣解剖學名詞（程式內建對照表） | 中縱束 |
| optic radiation | 台灣解剖學名詞（程式內建對照表） | 視放射 |
| posterior thalamic radiation | 台灣解剖學名詞（程式內建對照表） | 後視丘輻射 |
| reticulospinal tract | 台灣解剖學名詞（程式內建對照表） | 網狀脊髓徑 |
| superior longitudinal fasciculus I | 台灣解剖學名詞（程式內建對照表） | 上縱束 I |
| superior longitudinal fasciculus II | 台灣解剖學名詞（程式內建對照表） | 上縱束 II |
| superior longitudinal fasciculus III | 台灣解剖學名詞（程式內建對照表） | 上縱束 III |
| superior thalamic radiation | 台灣解剖學名詞（程式內建對照表） | 上視丘輻射 |
| uncinate fasciculus | 台灣解剖學名詞（程式內建對照表） | 鉤束 |
| external carotid artery | glossary.json（其他筆記） | 外頸動脈 |

</details>
