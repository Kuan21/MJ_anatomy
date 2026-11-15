# 頭頸課程資料結構總表（兩個系列合併、去重）

內部文件，不上網站，不含任何課程資料原文，只列結構名稱（英文、中文）、類型、出現的系列與單元、強調程度與標記。中文名稱維持來源資料的用詞，其中的筆誤已在主欄改為正確名稱，原寫法放在「標記」欄；用字不一致的名稱見 `docs/quiz-head-neck-notes-classification.md`。

## 數量

- 合併去重後的頭頸結構：**924** 列（M66 125 列只出現在 M66、CM58 159 列只出現在 CM58、兩個系列都有 640 列）。
- 原始名稱數：M66 784、CM58 837（合併前，含兩個系列內部的重複寫法）。
- 已排除（胸部、上肢帶、骨盆與會陰、臨床處置點）：20 列，另列於文末。兩個系列各自的骨盆與會陰、胸部單元整份不納入。
- 依類型：骨 132、肌肉 117、神經 119、動脈 110、靜脈 63、韌帶 18、關節 10、腺體 18、器官 67、腔隙／區域 95、其他 175。
- 依最高強調程度：3（特別強調）102、2（獨立段落或列）612、1（只列出名稱）210。
- 標記：OCR 55 列、含來源筆誤 22 列、有任何標記 77 列。

## 排序規則（順序鍵）

- 兩個系列的上課日期對不起來：M66 單元以日期標示（0929 頭部I、1006 頸部I、1013 頭部II、1027 頭部III、1117 頭部IV、1124 頭部V、1124 頸部III），CM58 只以週次標示（W10 頭部1、W11 頸部1、W12 頸部2＋頭部2、W13 頭部3、W14 頸部3），無法判斷哪一週對應哪一天。所以**不交錯排序，採「M66 先、CM58 後」**：
  1. 兩個系列都有或只有 M66 的結構：依 M66 第一次出現的次序（單元次序 0929 → 1124 頸部III，單元內依原次序）；M66 是較新的系列。
  2. 只出現在 CM58 的結構：接在後面，依 CM58 第一次出現的次序（W10 → W14）。
- 「序」是連續流水號（1 起），「順序鍵」為 `M`＋M66 原序號或 `C`＋CM58 原序號（只在 CM58 時），後續批次依序號排。
- 權重：1 只列名稱、2 有獨立段落或表格列、3 被特別強調（只依文字提示判斷，偏保守）；取兩個系列中的最大值。

## 清單

| 序 | 順序鍵 | 英文 | 中文 | 類型 | 系列 | 最高權重 | 首見單元 | 標記 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | M0001 | Facial expression muscle (Mimetic muscle) | 顏面表情肌 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 2 | M0002 | Subcutaneous layer | 皮下層 | 其他 | M66 | 1 | M66 0929 頭部I |  |
| 3 | M0003 | Second pharyngeal arch | 第二咽弓 | 其他 | M66＋CM58 | 1 | M66 0929 頭部I |  |
| 4 | M0004 | Facial nerve (CN VII) | 顏面神經 | 神經 | M66＋CM58 | 3 | M66 0929 頭部I |  |
| 5 | M0005 | Calvarial group | 顱頂群 | 肌肉 | M66 | 2 | M66 0929 頭部I |  |
| 6 | M0006 | Orbital group | 眼眶周圍 | 肌肉 | M66 | 2 | M66 0929 頭部I |  |
| 7 | M0007 | Nasal group | 鼻周圍 | 肌肉 | M66 | 2 | M66 0929 頭部I |  |
| 8 | M0008 | Oral group | 口周圍 | 肌肉 | M66 | 2 | M66 0929 頭部I |  |
| 9 | M0009 | Epicranius muscle | 顱頂肌 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 10 | M0010 | Occipitofrontalis | 額枕肌 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 11 | M0011 | Frontalis | 額肌 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 12 | M0012 | Occipitalis | 枕肌 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 13 | M0013 | Epicranius aponeurosis | 頭皮腱膜 | 韌帶 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 14 | M0014 | Orbicularis oculi | 眼輪匝肌 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 15 | M0015 | Orbital part | 眶部 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 16 | M0016 | Palpebral part | 瞼部 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 17 | M0017 | Lacrimal part | 淚部 | 肌肉 | M66 | 1 | M66 0929 頭部I |  |
| 18 | M0018 | Corrugator supercilii | 皺眉肌 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I | 筆誤：原寫 Corrugator supercilli |
| 19 | M0019 | Procerus | 降眉間肌 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 20 | M0020 | Nasalis | 鼻肌 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 21 | M0021 | Transverse part of nasalis | 橫部 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 22 | M0022 | Alar part of nasalis | 翼部 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 23 | M0023 | Depressor septi nasi | 降鼻中隔肌 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 24 | M0024 | Orbicularis oris | 口輪匝肌 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 25 | M0025 | Buccinator | 頰肌 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 26 | M0026 | Risorius | 笑肌 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 27 | M0027 | Zygomaticus major | 顴大肌 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 28 | M0028 | Zygomaticus minor | 顴小肌 | 肌肉 | M66 | 2 | M66 0929 頭部I |  |
| 29 | M0029 | Levator anguli oris | 提嘴角肌 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 30 | M0030 | Levator labii superioris | 提上唇肌 | 肌肉 | M66＋CM58 | 3 | M66 0929 頭部I |  |
| 31 | M0031 | Infra-orbital foramen | 眶下孔 | 骨 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 32 | M0032 | Depressor anguli oris | 降口角肌 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 33 | M0033 | Depressor labii inferioris | 降下唇肌 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 34 | M0034 | Mental foramen | 頦孔 | 骨 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 35 | M0035 | Mentalis | 頦肌 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 36 | M0036 | Platysma | 闊頸肌 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 37 | M0037 | Auricular muscles | 耳肌 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 38 | M0038 | Trigeminal nerve (CN V) | 三叉神經 | 神經 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 39 | M0039 | Ophthalmic nerve (CN V1) | 眼神經 | 神經 | M66＋CM58 | 3 | M66 0929 頭部I | 筆誤：中文曾寫「視神經」（應為眼神經） |
| 40 | M0040 | Supra-orbital foramen | 眶上孔 | 骨 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 41 | M0041 | Maxillary nerve (CN V2) | 上頷神經 | 神經 | M66＋CM58 | 3 | M66 0929 頭部I |  |
| 42 | M0042 | Mandibular nerve (CN V3) | 下頷神經 | 神經 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 43 | M0043 | Mental nerve | 頦神經 | 神經 | M66 | 2 | M66 0929 頭部I |  |
| 44 | M0044 | Glabella | 眉間 | 其他 | M66 | 1 | M66 0929 頭部I |  |
| 45 | M0045 | Cornea | 角膜 | 器官 | M66＋CM58 | 3 | M66 0929 頭部I |  |
| 46 | M0046 | Tip of nose | 鼻尖 | 其他 | M66 | 1 | M66 0929 頭部I |  |
| 47 | M0047 | Stylomastoid foramen | 莖乳突孔 | 骨 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 48 | M0048 | Parotid gland | 耳下腺（腮腺） | 腺體 | M66＋CM58 | 3 | M66 0929 頭部I |  |
| 49 | M0049 | Temporal branch | 顳支 | 神經 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 50 | M0050 | Zygomatic branch | 顴支 | 神經 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 51 | M0051 | Buccal branch (CN VII) | 頰支 | 神經 | M66＋CM58 | 3 | M66 0929 頭部I |  |
| 52 | M0052 | Buccal nerve (CN V3) | 頰神經 | 神經 | M66＋CM58 | 3 | M66 0929 頭部I |  |
| 53 | M0053 | Marginal mandibular branch | 邊緣下頷支 | 神經 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 54 | M0054 | Cervical branch | 頸支 | 神經 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 55 | M0055 | External carotid artery | 外頸動脈 | 動脈 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 56 | M0056 | Facial artery | 顏面動脈 | 動脈 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 57 | M0057 | Ramus of mandible | 下頷骨支 | 骨 | M66＋CM58 | 1 | M66 0929 頭部I |  |
| 58 | M0058 | Masseter muscle | 咬肌 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 59 | M0059 | Inferior labial artery | 下唇動脈 | 動脈 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 60 | M0060 | Superior labial artery | 上唇動脈 | 動脈 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 61 | M0061 | Lateral nasal artery | 鼻外側動脈 | 動脈 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 62 | M0062 | Angular artery | 角動脈 | 動脈 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 63 | M0063 | Superficial temporal artery | 淺顳動脈 | 動脈 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 64 | M0064 | Maxillary artery | 上頷動脈 | 動脈 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 65 | M0065 | Transverse facial artery | 橫顏動脈 | 動脈 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 66 | M0066 | Parotid duct | 耳下腺管 | 腺體 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 67 | M0067 | External jugular vein | 外頸靜脈 | 靜脈 | M66＋CM58 | 3 | M66 0929 頭部I |  |
| 68 | M0068 | Internal jugular vein | 內頸靜脈 | 靜脈 | M66＋CM58 | 3 | M66 0929 頭部I |  |
| 69 | M0069 | Facial vein | 顏面靜脈 | 靜脈 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 70 | M0070 | Angular vein | 角靜脈 | 靜脈 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 71 | M0071 | Supraorbital vein | 眶上靜脈 | 靜脈 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 72 | M0072 | Supratrochlear vein | 滑車上靜脈 | 靜脈 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 73 | M0073 | Lateral nasal vein | 鼻外側靜脈 | 靜脈 | M66 | 1 | M66 0929 頭部I |  |
| 74 | M0074 | Superior labial vein | 上唇靜脈 | 靜脈 | M66 | 1 | M66 0929 頭部I |  |
| 75 | M0075 | Inferior labial vein | 下唇靜脈 | 靜脈 | M66 | 1 | M66 0929 頭部I |  |
| 76 | M0076 | Retromandibular vein | 下頷後靜脈 | 靜脈 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 77 | M0077 | Common facial vein | 總面靜脈 | 靜脈 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 78 | M0078 | Superior ophthalmic vein | 上眼靜脈 | 靜脈 | M66＋CM58 | 3 | M66 0929 頭部I |  |
| 79 | M0079 | Cavernous sinus | 海綿竇 | 靜脈 | M66＋CM58 | 3 | M66 0929 頭部I |  |
| 80 | M0080 | Deep facial vein | 深面靜脈 | 靜脈 | M66 | 2 | M66 0929 頭部I |  |
| 81 | M0081 | Pterygoid venous plexus | 翼靜脈叢 | 靜脈 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 82 | M0082 | Superficial temporal vein | 淺顳靜脈 | 靜脈 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 83 | M0083 | Maxillary vein | 上頷靜脈 | 靜脈 | M66＋CM58 | 2 | M66 0929 頭部I | 筆誤：中文曾寫「下頷靜脈」 |
| 84 | M0084 | Posterior auricular vein | 耳後靜脈 | 靜脈 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 85 | M0085 | Subclavian vein | 鎖骨下靜脈 | 靜脈 | M66＋CM58 | 3 | M66 0929 頭部I |  |
| 86 | M0086 | Danger triangle zone | 危險三角區 | 腔隙／區域 | M66＋CM58 | 3 | M66 0929 頭部I |  |
| 87 | M0087 | Submandibular gland | 下頜下腺 | 腺體 | M66＋CM58 | 3 | M66 0929 頭部I |  |
| 88 | M0088 | Sublingual gland | 舌下腺 | 腺體 | M66＋CM58 | 3 | M66 0929 頭部I |  |
| 89 | M0089 | Parotid sheath | 耳下腺鞘 | 其他 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 90 | M0090 | Superficial lobe of parotid | 淺葉 | 腺體 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 91 | M0091 | Deep lobe of parotid | 深葉 | 腺體 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 92 | M0092 | External auditory meatus | 外聽道 | 腔隙／區域 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 93 | M0093 | Medial pterygoid muscle | 內翼肌 | 肌肉 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 94 | M0094 | Zygomatic arch | 顴弓 | 骨 | M66＋CM58 | 1 | M66 0929 頭部I |  |
| 95 | M0095 | Second upper molar teeth | 上排第二顆臼齒 | 其他 | M66 | 1 | M66 0929 頭部I |  |
| 96 | M0096 | Auriculotemporal nerve | 耳顳神經 | 神經 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 97 | M0097 | Great auricular nerve | 大耳神經 | 神經 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 98 | M0098 | Superior cervical ganglion | 上頸神經節 | 神經 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 99 | M0099 | Otic ganglion | 耳神經節 | 神經 | M66＋CM58 | 2 | M66 0929 頭部I | 筆誤：原寫 Optic ganglion |
| 100 | M0100 | Glossopharyngeal nerve (CN IX) | 舌咽神經 | 神經 | M66＋CM58 | 3 | M66 0929 頭部I |  |
| 101 | M0101 | Scalp | 頭皮 | 器官 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 102 | M0102 | Occipital artery | 枕動脈 | 動脈 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 103 | M0103 | Posterior auricular artery | 耳後動脈 | 動脈 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 104 | M0104 | Internal carotid artery | 內頸動脈 | 動脈 | M66＋CM58 | 2 | M66 0929 頭部I | 筆誤：段落中曾把內頸動脈寫成「內頸靜脈」 |
| 105 | M0105 | Supraorbital artery | 眶上動脈 | 動脈 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 106 | M0106 | Supratrochlear artery | 滑車上動脈 | 動脈 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 107 | M0107 | Cervical plexus | 頸神經叢 | 神經 | M66＋CM58 | 2 | M66 0929 頭部I |  |
| 108 | M0108 | Mandible | 下頷骨 | 骨 | M66＋CM58 | 1 | M66 1006 頸部I |  |
| 109 | M0109 | Clavicle | 鎖骨 | 骨 | M66＋CM58 | 1 | M66 1006 頸部I |  |
| 110 | M0110 | Hyoid bone | 舌骨 | 骨 | M66＋CM58 | 3 | M66 1006 頸部I |  |
| 111 | M0111 | Thyroid cartilage | 甲狀軟骨 | 其他 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 112 | M0112 | Thyroid prominence | — | 其他 | M66＋CM58 | 1 | M66 1006 頸部I |  |
| 113 | M0113 | Cricoid cartilage | 環狀軟骨 | 其他 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 114 | M0114 | Trachea | 氣管 | 器官 | M66＋CM58 | 3 | M66 1006 頸部I |  |
| 115 | M0115 | Thyroid gland | 甲狀腺 | 腺體 | M66＋CM58 | 3 | M66 1006 頸部I |  |
| 116 | M0116 | Jugular notch | 頸靜脈切跡 | 骨 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 117 | M0117 | Sternocleidomastoid muscle | 胸鎖乳突肌 | 肌肉 | M66＋CM58 | 3 | M66 1006 頸部I |  |
| 118 | M0119 | Anterior triangle of the neck | 頸前三角 | 腔隙／區域 | M66＋CM58 | 1 | M66 1006 頸部I |  |
| 119 | M0120 | Posterior triangle of the neck | 頸後三角 | 腔隙／區域 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 120 | M0121 | Trapezius muscle | 斜方肌 | 肌肉 | M66＋CM58 | 1 | M66 1006 頸部I |  |
| 121 | M0122 | Subclavian vessels | 鎖骨下動靜脈 | 動脈 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 122 | M0123 | Brachial plexus | 臂神經叢 | 神經 | M66＋CM58 | 3 | M66 1006 頸部I |  |
| 123 | M0124 | Suprahyoid muscles | 舌骨上肌群 | 肌肉 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 124 | M0125 | Stylohyoid muscle | 莖突舌骨肌 | 肌肉 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 125 | M0126 | Digastric muscle | 二腹肌 | 肌肉 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 126 | M0127 | Mylohyoid muscle | 下頷舌骨肌 | 肌肉 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 127 | M0128 | Infrahyoid muscles | 舌骨下肌群 | 肌肉 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 128 | M0129 | Sternothyroid muscle | 胸骨甲狀肌 | 肌肉 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 129 | M0130 | Omohyoid muscle | 肩胛舌骨肌 | 肌肉 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 130 | M0131 | Common carotid artery | 總頸動脈 | 動脈 | M66＋CM58 | 3 | M66 1006 頸部I |  |
| 131 | M0132 | Vagus nerve | 迷走神經 | 神經 | M66＋CM58 | 3 | M66 1006 頸部I |  |
| 132 | M0133 | Sympathetic nerve | 交感神經 | 神經 | M66 | 1 | M66 1006 頸部I |  |
| 133 | M0134 | Superior thyroid vein | 上甲狀腺靜脈 | 靜脈 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 134 | M0135 | Middle thyroid vein | 中甲狀腺靜脈 | 靜脈 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 135 | M0136 | Inferior thyroid vein | 下甲狀腺靜脈 | 靜脈 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 136 | M0137 | Deep cervical lymph node | 深頸淋巴結 | 其他 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 137 | M0138 | Thoracic duct | 胸管 | 其他 | M66＋CM58 | 3 | M66 1006 頸部I |  |
| 138 | M0139 | Recurrent laryngeal nerve | 喉返神經 | 神經 | M66＋CM58 | 2 | M66 1006 頸部I | 筆誤：原寫 Reccurent laryngeal n. |
| 139 | M0140 | Left brachiocephalic vein | 左頭臂靜脈 | 靜脈 | M66＋CM58 | 3 | M66 1006 頸部I |  |
| 140 | M0141 | Cervical vertebrae (C1-C7) | 頸椎 | 骨 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 141 | M0142 | Anterior vertebral line | 椎前線 | 其他 | M66 | 1 | M66 1006 頸部I |  |
| 142 | M0143 | Posterior vertebral line | 椎後線 | 其他 | M66 | 1 | M66 1006 頸部I |  |
| 143 | M0144 | Spinolaminal line | 脊突椎板線 | 其他 | M66 | 1 | M66 1006 頸部I |  |
| 144 | M0145 | Spinous process line | 脊突線 | 其他 | M66 | 1 | M66 1006 頸部I |  |
| 145 | M0146 | Nuchal ligament | 項韌帶 | 韌帶 | M66＋CM58 | 1 | M66 1006 頸部I |  |
| 146 | M0147 | Vertebra prominens (C7) | 第七頸椎 | 骨 | M66 | 2 | M66 1006 頸部I |  |
| 147 | M0148 | Atlas | 寰椎 | 骨 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 148 | M0149 | Vertebral body | 椎體 | 骨 | M66 | 1 | M66 1006 頸部I |  |
| 149 | M0150 | Anterior tubercle | 前結節 | 骨 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 150 | M0151 | Posterior tubercle | 後結節 | 骨 | M66 | 2 | M66 1006 頸部I |  |
| 151 | M0152 | Longus colli muscle | 頸長肌 | 肌肉 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 152 | M0153 | Groove for vertebral artery | 椎動脈溝 | 骨 | M66 | 2 | M66 1006 頸部I |  |
| 153 | M0154 | Vertebral artery | 椎動脈 | 動脈 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 154 | M0155 | Axis | 樞椎 | 骨 | M66 | 2 | M66 1006 頸部I |  |
| 155 | M0156 | Dens | 齒突 | 骨 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 156 | M0157 | Median atlanto-axial joint | 寰樞正中關節 | 關節 | M66 | 1 | M66 1006 頸部I |  |
| 157 | M0158 | C3-C6 | 第三至第六頸椎 | 骨 | M66 | 2 | M66 1006 頸部I |  |
| 158 | M0159 | Transverse process | 橫突 | 骨 | M66 | 1 | M66 1006 頸部I |  |
| 159 | M0160 | Scalenus anterior muscle | 前斜角肌 | 肌肉 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 160 | M0161 | Splenius capitis muscle | 頭夾肌 | 肌肉 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 161 | M0162 | Splenius cervicis muscle | 頸夾肌 | 肌肉 | M66 | 1 | M66 1006 頸部I |  |
| 162 | M0163 | Scalenus medius muscle | 中斜角肌 | 肌肉 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 163 | M0164 | Carotid tubercle | 頸動脈結節 | 骨 | M66＋CM58 | 3 | M66 1006 頸部I |  |
| 164 | M0165 | Transverse foramen | 橫突孔 | 骨 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 165 | M0166 | Vertebral vein | 椎靜脈 | 靜脈 | M66 | 1 | M66 1006 頸部I |  |
| 166 | M0167 | Greater horn | 大角 | 骨 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 167 | M0168 | Lesser horn | 小角 | 骨 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 168 | M0169 | Body of hyoid bone | 舌骨體 | 骨 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 169 | M0170 | Fibrocartilage | — | 其他 | M66 | 1 | M66 1006 頸部I | OCR（只見於圖面辨識，名稱可能有誤） |
| 170 | M0171 | Superficial fascia | 淺筋膜 | 其他 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 171 | M0172 | Deep fascia | 深筋膜 | 其他 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 172 | M0173 | Investing fascia | 包覆筋膜 | 其他 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 173 | M0174 | Pretracheal fascia | 氣管前筋膜 | 其他 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 174 | M0175 | Esophagus | 食道 | 器官 | M66＋CM58 | 3 | M66 1006 頸部I |  |
| 175 | M0176 | Buccopharyngeal fascia | 頰咽筋膜 | 其他 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 176 | M0177 | Prevertebral fascia | 椎前筋膜 | 其他 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 177 | M0178 | Carotid sheath | 頸動脈鞘 | 其他 | M66＋CM58 | 3 | M66 1006 頸部I |  |
| 178 | M0179 | Alar fascia | 翼筋膜 | 其他 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 179 | M0180 | Retropharyngeal space | 後咽部間隙 | 腔隙／區域 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 180 | M0181 | Danger space | 危險空間 | 腔隙／區域 | M66＋CM58 | 3 | M66 1006 頸部I |  |
| 181 | M0182 | Prevertebral space | — | 腔隙／區域 | M66＋CM58 | 1 | M66 1006 頸部I | OCR（只見於圖面辨識，名稱可能有誤） |
| 182 | M0183 | Anterior visceral space | — | 腔隙／區域 | M66＋CM58 | 1 | M66 1006 頸部I | OCR（只見於圖面辨識，名稱可能有誤） |
| 183 | M0184 | Suprasternal space | — | 腔隙／區域 | M66＋CM58 | 1 | M66 1006 頸部I | OCR（只見於圖面辨識，名稱可能有誤） |
| 184 | M0185 | Sternohyoid muscle | 胸骨舌骨肌 | 肌肉 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 185 | M0186 | Accessory nerve | 副神經 | 神經 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 186 | M0187 | Torticollis | 斜頸症 | 其他 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 187 | M0188 | Geniohyoid muscle | 頦舌骨肌 | 肌肉 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 188 | M0189 | Anterior belly of digastric | 二腹肌前腹 | 肌肉 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 189 | M0190 | Posterior belly of digastric | 二腹肌後腹 | 肌肉 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 190 | M0191 | Hypoglossal nerve (CN XII) | 舌下神經 | 神經 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 191 | M0192 | Thyrohyoid muscle | 甲狀舌骨肌 | 肌肉 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 192 | M0193 | Ansa cervicalis | 頸襻 | 神經 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 193 | M0194 | Fascial sling | 纖維環 | 其他 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 194 | M0195 | Oblique line of thyroid cartilage | 甲狀軟骨斜線 | 骨 | M66＋CM58 | 1 | M66 1006 頸部I |  |
| 195 | M0197 | Subclavian artery | 鎖骨下動脈 | 動脈 | M66＋CM58 | 3 | M66 1006 頸部I |  |
| 196 | M0199 | Brachiocephalic trunk | 頭臂幹 | 動脈 | M66＋CM58 | 3 | M66 1006 頸部I |  |
| 197 | M0201 | Foramen magnum | 枕骨大孔 | 骨 | M66＋CM58 | 1 | M66 1006 頸部I |  |
| 198 | M0202 | Circle of Willis | 威利氏環 | 動脈 | M66＋CM58 | 3 | M66 1006 頸部I |  |
| 199 | M0203 | Internal thoracic artery | 內胸動脈 | 動脈 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 200 | M0204 | Thyrocervical trunk | 甲狀頸動脈幹 | 動脈 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 201 | M0205 | Inferior thyroid artery | 下甲狀腺動脈 | 動脈 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 202 | M0206 | Ascending cervical artery | 升頸動脈 | 動脈 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 203 | M0207 | Transverse cervical artery | 橫頸動脈 | 動脈 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 204 | M0208 | Suprascapular artery | 肩胛上動脈 | 動脈 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 205 | M0210 | Costocervical trunk | 肋頸動脈幹 | 動脈 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 206 | M0211 | Deep cervical artery | 深頸動脈 | 動脈 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 207 | M0212 | Supreme intercostal artery (Superior intercostal artery) | 最上肋間動脈 | 動脈 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 208 | M0213 | Dorsal scapular artery | 背肩胛動脈 | 動脈 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 209 | M0214 | Deep branch of transverse cervical artery | 橫頸動脈深支 | 動脈 | M66 | 2 | M66 1006 頸部I |  |
| 210 | M0215 | Superficial branch of transverse cervical artery | 橫頸動脈淺支 | 動脈 | M66 | 1 | M66 1006 頸部I |  |
| 211 | M0216 | Carotid body | 頸動脈體 | 其他 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 212 | M0217 | Carotid sinus | 頸動脈竇 | 其他 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 213 | M0218 | Foramen lacerum | 破裂孔 | 骨 | M66＋CM58 | 1 | M66 1006 頸部I |  |
| 214 | M0219 | Carotid canal | 頸動脈管 | 骨 | M66＋CM58 | 1 | M66 1006 頸部I |  |
| 215 | M0220 | Superior thyroid artery | 上甲狀腺動脈 | 動脈 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 216 | M0221 | Superior laryngeal artery | 上喉動脈 | 動脈 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 217 | M0222 | Superior laryngeal nerve | 上喉神經 | 神經 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 218 | M0223 | Thyrohyoid membrane | 甲狀舌骨膜 | 韌帶 | M66＋CM58 | 1 | M66 1006 頸部I |  |
| 219 | M0224 | Cricothyroid artery | 環甲動脈 | 動脈 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 220 | M0225 | Lingual artery | 舌動脈 | 動脈 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 221 | M0226 | Hyoglossus muscle | 舌骨舌肌 | 肌肉 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 222 | M0227 | Linguofacial trunk | 舌顏動脈幹 | 動脈 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 223 | M0228 | Ascending pharyngeal artery | 升咽動脈 | 動脈 | M66＋CM58 | 3 | M66 1006 頸部I |  |
| 224 | M0229 | Pharyngo-occipital trunk | — | 動脈 | M66＋CM58 | 1 | M66 1006 頸部I |  |
| 225 | M0230 | Communicating branch | 交通枝 | 靜脈 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 226 | M0231 | Anterior jugular vein | 前頸靜脈 | 靜脈 | M66＋CM58 | 3 | M66 1006 頸部I |  |
| 227 | M0233 | Lingual vein | 舌靜脈 | 靜脈 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 228 | M0234 | Right brachiocephalic vein | — | 靜脈 | M66 | 1 | M66 1006 頸部I | OCR（只見於圖面辨識，名稱可能有誤） |
| 229 | M0236 | Nerve point of neck | 頸部神經點 | 神經 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 230 | M0237 | Lesser occipital nerve | 枕小神經 | 神經 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 231 | M0238 | Supraclavicular nerve | 鎖骨上神經 | 神經 | M66＋CM58 | 2 | M66 1006 頸部I | 筆誤：中文曾寫「上肩胛神經」（應為鎖骨上神經） |
| 232 | M0239 | Transverse cervical nerve | 橫頸神經 | 神經 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 233 | M0240 | Superior root of ansa cervicalis | 上根 | 神經 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 234 | M0241 | Inferior root of ansa cervicalis | 下根 | 神經 | M66＋CM58 | 2 | M66 1006 頸部I |  |
| 235 | M0242 | Phrenic nerve | 膈神經 | 神經 | M66＋CM58 | 3 | M66 1006 頸部I |  |
| 236 | M0243 | Nerve to thyrohyoid muscle | 至甲狀舌骨肌神經 | 神經 | M66 | 2 | M66 1006 頸部I |  |
| 237 | M0244 | Nerve to geniohyoid muscle | 至頦舌骨肌神經 | 神經 | M66 | 2 | M66 1006 頸部I |  |
| 238 | M0245 | Temporal region | 顳區 | 腔隙／區域 | M66 | 2 | M66 1013 頭部II |  |
| 239 | M0246 | Temporal line | 顳線 | 骨 | M66＋CM58 | 1 | M66 1013 頭部II |  |
| 240 | M0247 | Infratemporal crest | 顳下脊 | 骨 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 241 | M0248 | Frontal bone | 額骨 | 骨 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 242 | M0249 | Zygomatic bone | 顴骨 | 骨 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 243 | M0250 | Temporal fossa | 顳窩 | 骨 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 244 | M0251 | Superior temporal line | 上顳線 | 骨 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 245 | M0252 | Deep temporal artery | 深顳動脈 | 動脈 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 246 | M0253 | Deep temporal nerve | 深顳神經 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 247 | M0254 | Temporalis muscle | 顳肌 | 肌肉 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 248 | M0255 | Temporalis fascia | 顳筋膜 | 其他 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 249 | M0256 | Superficial temporal vessels | 淺顳動靜脈 | 動脈 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 250 | M0257 | Inferior temporal line | 下顳線 | 骨 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 251 | M0258 | Coronoid process | 冠狀突 | 骨 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 252 | M0259 | Infratemporal fossa | 顳下窩 | 腔隙／區域 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 253 | M0260 | Styloid process | 莖突 | 骨 | M66＋CM58 | 1 | M66 1013 頭部II | 筆誤：中文曾寫「顴骨莖突」（應為莖突） |
| 254 | M0261 | Greater wing of sphenoid | 蝶骨大翼 | 骨 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 255 | M0262 | Posterior surface of maxilla | 上頷骨後側面 | 骨 | M66 | 1 | M66 1013 頭部II |  |
| 256 | M0263 | Lateral pterygoid plate | 外翼板 | 骨 | M66＋CM58 | 1 | M66 1013 頭部II |  |
| 257 | M0264 | Muscles of mastication | 咀嚼肌 | 肌肉 | M66＋CM58 | 3 | M66 1013 頭部II |  |
| 258 | M0265 | Lateral pterygoid muscle | 外翼肌 | 肌肉 | M66＋CM58 | 3 | M66 1013 頭部II |  |
| 259 | M0266 | Superficial head of masseter | 咬肌淺頭 | 肌肉 | M66 | 2 | M66 1013 頭部II |  |
| 260 | M0267 | Deep head of masseter | 咬肌深頭 | 肌肉 | M66 | 2 | M66 1013 頭部II |  |
| 261 | M0268 | Angle of mandible | 下頷角 | 骨 | M66＋CM58 | 1 | M66 1013 頭部II |  |
| 262 | M0269 | Masseteric artery | 咬肌動脈 | 動脈 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 263 | M0270 | Masseteric nerve | 咬肌神經 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 264 | M0271 | Superior head of lateral pterygoid | 外翼肌上頭 | 肌肉 | M66 | 2 | M66 1013 頭部II |  |
| 265 | M0272 | Inferior head of lateral pterygoid | 外翼肌下頭 | 肌肉 | M66 | 2 | M66 1013 頭部II |  |
| 266 | M0273 | Condyle of mandible | 下頷骨髁突 | 骨 | M66 | 1 | M66 1013 頭部II |  |
| 267 | M0274 | Superficial head of medial pterygoid | 內翼肌淺頭 | 肌肉 | M66 | 2 | M66 1013 頭部II |  |
| 268 | M0275 | Deep head of medial pterygoid | 內翼肌深頭 | 肌肉 | M66 | 2 | M66 1013 頭部II |  |
| 269 | M0276 | Maxillary tuberosity | 上頜結節 | 骨 | M66＋CM58 | 1 | M66 1013 頭部II |  |
| 270 | M0277 | Pyramidal process of palatine bone | 顎骨錐突 | 骨 | M66 | 1 | M66 1013 頭部II |  |
| 271 | M0278 | Pterygoid fossa | 翼窩 | 骨 | M66 | 1 | M66 1013 頭部II |  |
| 272 | M0279 | Trigeminal ganglion | 三叉神經節 | 神經 | M66＋CM58 | 1 | M66 1013 頭部II |  |
| 273 | M0280 | Pons | 橋腦 | 器官 | M66＋CM58 | 1 | M66 1013 頭部II |  |
| 274 | M0281 | Foramen ovale | 卵圓孔 | 骨 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 275 | M0282 | Meningeal nerve (of CN V3) | 腦膜分支 | 神經 | M66 | 2 | M66 1013 頭部II |  |
| 276 | M0283 | Nerve to medial pterygoid muscle | 內翼肌神經 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 277 | M0284 | Anterior branch of CN V3 | 前支 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 278 | M0285 | Posterior branch of CN V3 | 後支 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 279 | M0286 | Inferior alveolar nerve | 下齒槽神經 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 280 | M0287 | Mandibular foramen | 下頷孔 | 骨 | M66＋CM58 | 1 | M66 1013 頭部II |  |
| 281 | M0288 | Mylohyoid nerve | 顎舌骨肌神經 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 282 | M0289 | Lingual nerve | 舌神經 | 神經 | M66＋CM58 | 3 | M66 1013 頭部II |  |
| 283 | M0290 | Chorda tympani nerve | 鼓索神經 | 神經 | M66＋CM58 | 3 | M66 1013 頭部II |  |
| 284 | M0291 | Geniculate ganglion | 膝狀神經節 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 285 | M0292 | Submandibular ganglion | 下頷神經節 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 286 | M0293 | Petrotympanic fissure | 岩鼓溝 | 骨 | M66 | 2 | M66 1013 頭部II |  |
| 287 | M0294 | Middle meningeal artery | 中腦膜動脈 | 動脈 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 288 | M0295 | Foramen spinosum | 棘孔 | 骨 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 289 | M0296 | Tympanic plexus | 鼓室神經叢 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 290 | M0297 | Lesser petrosal nerve | 小岩神經 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II | 筆誤：原寫 Lessor petrosal n. |
| 291 | M0298 | Maxillary artery part 1 | 上頷動脈第一部 | 動脈 | M66 | 2 | M66 1013 頭部II |  |
| 292 | M0299 | Maxillary artery part 2 | 上頷動脈第二部 | 動脈 | M66 | 2 | M66 1013 頭部II |  |
| 293 | M0300 | Maxillary artery part 3 (Pterygopalatine part) | 上頷動脈第三部 | 動脈 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 294 | M0301 | Pterygopalatine fossa | 翼顎窩 | 腔隙／區域 | M66＋CM58 | 3 | M66 1013 頭部II |  |
| 295 | M0302 | Deep auricular artery | 深耳動脈 | 動脈 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 296 | M0303 | Anterior tympanic artery | 前鼓室動脈 | 動脈 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 297 | M0304 | Accessory meningeal artery | 副腦膜動脈 | 動脈 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 298 | M0305 | Inferior alveolar artery | 下齒槽動脈 | 動脈 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 299 | M0306 | Mylohyoid artery | 顎舌骨肌動脈 | 動脈 | M66 | 1 | M66 1013 頭部II |  |
| 300 | M0307 | Pterygoid branch | 外翼肌動脈、內翼肌動脈 | 動脈 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 301 | M0308 | Buccal artery | 頰動脈 | 動脈 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 302 | M0309 | Inferior ophthalmic vein | 下眼靜脈 | 靜脈 | M66＋CM58 | 3 | M66 1013 頭部II |  |
| 303 | M0310 | Inferior orbital fissure | 眶下裂 | 骨 | M66＋CM58 | 3 | M66 1013 頭部II |  |
| 304 | M0311 | Emissary vein | 導靜脈 | 靜脈 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 305 | M0312 | Maxilla | 上頷骨 | 骨 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 306 | M0313 | Sphenoid bone | 蝶骨 | 骨 | M66＋CM58 | 1 | M66 1013 頭部II |  |
| 307 | M0314 | Pterygoid process | 翼突 | 骨 | M66＋CM58 | 1 | M66 1013 頭部II |  |
| 308 | M0315 | Palatine bone | 顎骨 | 骨 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 309 | M0316 | Pterygomaxillary fissure | 翼上頜裂 | 骨 | M66 | 2 | M66 1013 頭部II |  |
| 310 | M0317 | Palatine canal | 顎管 | 骨 | M66 | 2 | M66 1013 頭部II |  |
| 311 | M0318 | Foramen rotundum | 圓孔 | 骨 | M66＋CM58 | 3 | M66 1013 頭部II |  |
| 312 | M0319 | Pterygoid canal | 翼管 | 骨 | M66＋CM58 | 3 | M66 1013 頭部II |  |
| 313 | M0320 | Sphenopalatine foramen | 蝶顎孔 | 骨 | M66＋CM58 | 3 | M66 1013 頭部II |  |
| 314 | M0321 | Nasal cavity | 鼻腔 | 腔隙／區域 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 315 | M0322 | Palatovaginal canal | 腭鞘管 | 骨 | M66 | 2 | M66 1013 頭部II |  |
| 316 | M0323 | Nasopharynx | 鼻咽 | 腔隙／區域 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 317 | M0324 | Greater palatine foramen | 腭大孔 | 骨 | M66＋CM58 | 3 | M66 1013 頭部II |  |
| 318 | M0325 | Lesser palatine foramen | 腭小孔 | 骨 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 319 | M0326 | Roof of oral cavity | 口腔頂部 | 腔隙／區域 | M66＋CM58 | 1 | M66 1013 頭部II |  |
| 320 | M0327 | Pterygopalatine ganglion | 翼顎神經節 | 神經 | M66＋CM58 | 3 | M66 1013 頭部II |  |
| 321 | M0328 | Meningeal branch of CN V2 | 腦膜支 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 322 | M0329 | Zygomatic nerve | 顴神經 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 323 | M0330 | Zygomaticotemporal nerve | 顴顳神經 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 324 | M0331 | Zygomaticofacial nerve | 顴面神經 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 325 | M0332 | Posterior superior alveolar nerve | 後上齒槽神經 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 326 | M0333 | Infraorbital nerve | 眶下神經 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 327 | M0335 | Middle superior alveolar nerve | 中上齒槽神經 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 328 | M0336 | Anterior superior alveolar nerve | 前上齒槽神經 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 329 | M0337 | Orbital branches | 眼眶支 | 神經 | M66 | 2 | M66 1013 頭部II |  |
| 330 | M0338 | Sphenoid sinus | 蝶竇 | 腔隙／區域 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 331 | M0339 | Ethmoidal sinus | 篩竇 | 腔隙／區域 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 332 | M0340 | Nasal nerve | 鼻支 | 神經 | M66 | 2 | M66 1013 頭部II |  |
| 333 | M0341 | Nasopalatine nerve | 鼻顎神經 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 334 | M0342 | Greater palatine nerve | 腭大神經 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 335 | M0343 | Lesser palatine nerve | 腭小神經 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 336 | M0344 | Pharyngeal nerve | 咽支 | 神經 | M66 | 2 | M66 1013 頭部II |  |
| 337 | M0345 | Uvula | 懸雍垂 | 器官 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 338 | M0346 | Palatine tonsil | 扁桃體 | 器官 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 339 | M0347 | Lacrimal gland | 淚腺 | 腺體 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 340 | M0348 | Nasal mucosa | 鼻腔黏膜 | 其他 | M66 | 1 | M66 1013 頭部II |  |
| 341 | M0349 | Paranasal sinuses | 鼻竇 | 腔隙／區域 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 342 | M0350 | Pharynx | 咽部 | 器官 | M66＋CM58 | 3 | M66 1013 頭部II |  |
| 343 | M0351 | Palate | 顎 | 器官 | M66＋CM58 | 2 | M66 1013 頭部II | 筆誤：中文曾寫「鄂部」 |
| 344 | M0352 | Deep petrosal nerve | 深岩神經 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 345 | M0353 | Greater petrosal nerve | 大岩神經 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 346 | M0354 | Nerve of pterygoid canal (Vidian nerve) | 翼管神經 | 神經 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 347 | M0355 | Lacrimal nerve | 淚神經 | 神經 | M66＋CM58 | 3 | M66 1013 頭部II |  |
| 348 | M0356 | Sphenopalatine artery | 蝶顎動脈 | 動脈 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 349 | M0357 | Nasopalatine artery | 鼻顎動脈 | 動脈 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 350 | M0358 | Infraorbital artery | 眶下動脈 | 動脈 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 351 | M0359 | Anterior superior alveolar artery | 前上齒槽動脈 | 動脈 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 352 | M0360 | Middle superior alveolar artery | 中上齒槽動脈 | 動脈 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 353 | M0361 | Posterior superior alveolar artery | 後上齒槽動脈 | 動脈 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 354 | M0362 | Descending palatine artery (Greater palatine artery) | 降顎動脈（大顎動脈） | 動脈 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 355 | M0363 | Lesser palatine artery | 小顎動脈 | 動脈 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 356 | M0364 | Artery of the pterygoid canal | 翼管動脈 | 動脈 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 357 | M0365 | Pharyngeal artery | 咽動脈 | 動脈 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 358 | M0366 | Infra-orbital vein | 眶下靜脈 | 靜脈 | M66＋CM58 | 1 | M66 1013 頭部II | OCR（只見於圖面辨識，名稱可能有誤） |
| 359 | M0367 | Maxillary sinus | 上頜竇 | 腔隙／區域 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 360 | M0368 | Zygomaticofacial foramen | 顴面孔 | 骨 | M66 | 1 | M66 1013 頭部II | OCR（只見於圖面辨識，名稱可能有誤） |
| 361 | M0369 | Zygomaticotemporal foramen | 顴顳孔 | 骨 | M66 | 1 | M66 1013 頭部II | OCR（只見於圖面辨識，名稱可能有誤） |
| 362 | M0370 | Zygomatico-orbital foramen | — | 骨 | M66 | 1 | M66 1013 頭部II | OCR（只見於圖面辨識，名稱可能有誤）；存疑：孔名來自圖面，可能有誤 |
| 363 | M0371 | Posterior superior alveolar foramen | — | 骨 | M66 | 1 | M66 1013 頭部II | OCR（只見於圖面辨識，名稱可能有誤） |
| 364 | M0372 | Infraorbital groove | — | 骨 | M66 | 1 | M66 1013 頭部II | OCR（只見於圖面辨識，名稱可能有誤） |
| 365 | M0373 | Infraorbital canal | — | 骨 | M66 | 1 | M66 1013 頭部II | OCR（只見於圖面辨識，名稱可能有誤） |
| 366 | M0374 | Temporomandibular joint (TMJ) | 顳顎關節 | 關節 | M66＋CM58 | 3 | M66 1013 頭部II |  |
| 367 | M0375 | Articular disc | 關節盤 | 關節 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 368 | M0376 | Mandibular fossa | 下頷窩 | 骨 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 369 | M0377 | Condylar process | 髁突 | 骨 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 370 | M0378 | Joint capsule of TMJ | 關節囊 | 關節 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 371 | M0379 | Temporomandibular ligament | 顳下頷韌帶 | 韌帶 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 372 | M0380 | Sphenomandibular ligament | 蝶下頷韌帶 | 韌帶 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 373 | M0381 | Lingula of mandible | 小舌突 | 骨 | M66＋CM58 | 1 | M66 1013 頭部II |  |
| 374 | M0382 | Stylomandibular ligament | 莖突下頷韌帶 | 韌帶 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 375 | M0383 | Superior cavity of TMJ | 上關節腔 | 關節 | M66 | 2 | M66 1013 頭部II |  |
| 376 | M0384 | Inferior cavity of TMJ | 下關節腔 | 關節 | M66 | 2 | M66 1013 頭部II |  |
| 377 | M0385 | Articular tubercle | 關節結節 | 骨 | M66＋CM58 | 2 | M66 1013 頭部II |  |
| 378 | M0386 | Meninges | 腦膜 | 其他 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 379 | M0387 | Venous sinus | 靜脈竇 | 靜脈 | M66＋CM58 | 3 | M66 1027 頭部III |  |
| 380 | M0388 | Subarachnoid space | 蜘蛛膜下腔 | 腔隙／區域 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 381 | M0389 | Cerebrospinal fluid (CSF) | 腦脊髓液 | 其他 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 382 | M0390 | Dura mater | 硬腦膜 | 其他 | M66＋CM58 | 3 | M66 1027 頭部III |  |
| 383 | M0391 | Arachnoid mater | 蜘蛛膜 | 其他 | M66＋CM58 | 3 | M66 1027 頭部III |  |
| 384 | M0392 | Pia mater | 軟腦膜 | 其他 | M66＋CM58 | 3 | M66 1027 頭部III |  |
| 385 | M0393 | Epidural space | 硬膜外腔 | 腔隙／區域 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 386 | M0394 | Subdural space | 硬膜下腔 | 腔隙／區域 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 387 | M0395 | Epidural hematoma | 硬膜外血腫 | 其他 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 388 | M0396 | Subdural hematoma | 硬膜下血腫 | 其他 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 389 | M0397 | Bridging vein | 橋靜脈 | 靜脈 | M66 | 2 | M66 1027 頭部III |  |
| 390 | M0398 | Periosteal layer | 骨膜層 | 其他 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 391 | M0399 | Meningeal layer | 腦膜層 | 其他 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 392 | M0401 | Dural partitions | 硬腦膜分隔 | 其他 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 393 | M0402 | Cerebral falx (Falx cerebri) | 大腦鐮 | 其他 | M66＋CM58 | 3 | M66 1027 頭部III |  |
| 394 | M0403 | Longitudinal fissure | 大腦縱裂 | 其他 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 395 | M0404 | Crista galli | 雞冠 | 骨 | M66＋CM58 | 1 | M66 1027 頭部III |  |
| 396 | M0405 | Cerebellar tentorium (Tentorium cerebelli) | 小腦天幕 | 其他 | M66＋CM58 | 3 | M66 1027 頭部III |  |
| 397 | M0406 | Superior sagittal sinus | 上矢狀竇 | 靜脈 | M66＋CM58 | 3 | M66 1027 頭部III |  |
| 398 | M0407 | Inferior sagittal sinus | 下矢狀竇 | 靜脈 | M66＋CM58 | 3 | M66 1027 頭部III |  |
| 399 | M0408 | Straight sinus | 直竇 | 靜脈 | M66＋CM58 | 3 | M66 1027 頭部III |  |
| 400 | M0409 | Cerebellar falx (Falx cerebelli) | 小腦鐮 | 其他 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 401 | M0410 | Internal occipital crest | 枕內隆突 | 骨 | M66＋CM58 | 1 | M66 1027 頭部III |  |
| 402 | M0411 | Occipital sinus | 枕竇 | 靜脈 | M66＋CM58 | 3 | M66 1027 頭部III |  |
| 403 | M0412 | Transverse fissure | 橫裂 | 其他 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 404 | M0413 | Internal occipital protuberance | 枕內粗隆 | 骨 | M66 | 1 | M66 1027 頭部III |  |
| 405 | M0414 | Transverse sinus groove | 橫竇溝 | 骨 | M66＋CM58 | 1 | M66 1027 頭部III |  |
| 406 | M0415 | Transverse sinus | 橫竇 | 靜脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 407 | M0416 | Sellar diaphragm | 鞍隔 | 其他 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 408 | M0417 | Sella turcica | 蝶鞍 | 骨 | M66＋CM58 | 1 | M66 1027 頭部III |  |
| 409 | M0418 | Pituitary gland | 腦垂體 | 腺體 | M66＋CM58 | 1 | M66 1027 頭部III |  |
| 410 | M0419 | Infundibulum | 腦垂腺柄 | 其他 | M66 | 2 | M66 1027 頭部III |  |
| 411 | M0420 | Jugular foramen | 頸靜脈孔 | 骨 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 412 | M0421 | Anterior meningeal artery | 前腦膜動脈 | 動脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 413 | M0422 | Ophthalmic artery | 眼動脈 | 動脈 | M66＋CM58 | 3 | M66 1027 頭部III | 筆誤：中文曾寫「視神經」（應為眼神經） |
| 414 | M0423 | Ethmoidal artery | 篩動脈 | 動脈 | M66＋CM58 | 1 | M66 1027 頭部III |  |
| 415 | M0424 | Posterior meningeal artery | 後腦膜動脈 | 動脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 416 | M0425 | Hypoglossal canal | 舌下神經管 | 骨 | M66＋CM58 | 1 | M66 1027 頭部III |  |
| 417 | M0426 | Mastoid foramen | 乳突孔 | 骨 | M66＋CM58 | 1 | M66 1027 頭部III |  |
| 418 | M0427 | Arachnoid granulation (Arachnoid villi) | 蛛網膜顆粒 | 其他 | M66＋CM58 | 3 | M66 1027 頭部III |  |
| 419 | M0428 | Subarachnoid cistern | 蛛網膜下池 | 腔隙／區域 | M66 | 2 | M66 1027 頭部III |  |
| 420 | M0429 | Cerebellomedullary cistern (Cisterna magna) | 小腦延腦池 | 腔隙／區域 | M66 | 2 | M66 1027 頭部III |  |
| 421 | M0430 | Posterior inferior cerebellar artery (PICA) | 後下小腦動脈 | 動脈 | M66＋CM58 | 3 | M66 1027 頭部III |  |
| 422 | M0431 | Quadrigeminal cistern | 四疊體池 | 腔隙／區域 | M66 | 2 | M66 1027 頭部III |  |
| 423 | M0432 | Pineal gland | 松果體 | 腺體 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 424 | M0433 | Great cerebral vein | 大腦大靜脈 | 靜脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 425 | M0434 | Pontocerebellar cistern | 橋小腦池 | 腔隙／區域 | M66 | 2 | M66 1027 頭部III |  |
| 426 | M0435 | Basilar artery | 基底動脈 | 動脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 427 | M0436 | Interpeduncular cistern | 大腦腳間池 | 腔隙／區域 | M66 | 2 | M66 1027 頭部III |  |
| 428 | M0437 | Cerebral peduncle | 大腦腳 | 其他 | M66＋CM58 | 1 | M66 1027 頭部III |  |
| 429 | M0438 | Chiasmatic cistern | — | 腔隙／區域 | M66 | 1 | M66 1027 頭部III |  |
| 430 | M0439 | Ambient cistern | — | 腔隙／區域 | M66 | 1 | M66 1027 頭部III |  |
| 431 | M0440 | Leptomeninges | — | 其他 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 432 | M0441 | Fissure | 腦裂 | 其他 | M66＋CM58 | 1 | M66 1027 頭部III |  |
| 433 | M0442 | Sulcus | 腦溝 | 其他 | M66＋CM58 | 1 | M66 1027 頭部III |  |
| 434 | M0443 | Central sulcus | 中央溝 | 其他 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 435 | M0444 | Frontal lobe | 額葉 | 器官 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 436 | M0445 | Parietal lobe | 頂葉 | 器官 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 437 | M0446 | Lateral sulcus | 側溝 | 其他 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 438 | M0447 | Temporal lobe | 顳葉 | 器官 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 439 | M0448 | Parieto-occipital sulcus | 頂枕溝 | 其他 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 440 | M0449 | Occipital lobe | 枕葉 | 器官 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 441 | M0450 | Gyrus | 腦迴 | 其他 | M66＋CM58 | 1 | M66 1027 頭部III |  |
| 442 | M0451 | Corpus callosum | 胼胝體 | 器官 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 443 | M0452 | Ventricular system | 腦室系統 | 腔隙／區域 | M66 | 2 | M66 1027 頭部III |  |
| 444 | M0453 | Lateral ventricles | 側腦室 | 腔隙／區域 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 445 | M0454 | Interventricular foramen | 室間孔 | 腔隙／區域 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 446 | M0455 | Third ventricle | 第三腦室 | 腔隙／區域 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 447 | M0456 | Diencephalon | 間腦 | 器官 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 448 | M0457 | Fourth ventricle | 第四腦室 | 腔隙／區域 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 449 | M0458 | Central canal | 中央管 | 腔隙／區域 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 450 | M0459 | Cerebral aqueduct (Mesencephalic aqueduct) | 大腦導水管 | 腔隙／區域 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 451 | M0460 | Choroid plexus | 脈絡叢 | 其他 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 452 | M0461 | Ependymal cell | 室管膜膠細胞 | 其他 | M66 | 1 | M66 1027 頭部III |  |
| 453 | M0462 | Median aperture | 正中孔 | 腔隙／區域 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 454 | M0463 | Lateral aperture | 外側孔 | 腔隙／區域 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 455 | M0464 | Cervical part of ICA | 頸區 | 動脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 456 | M0465 | Petrous part of ICA | 岩狀區 | 動脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 457 | M0466 | Cavernous part of ICA | 海綿區 | 動脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 458 | M0467 | Cerebral part of ICA | 腦區 | 動脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 459 | M0468 | Anterior cerebral artery | 前大腦動脈 | 動脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 460 | M0469 | Anterior communicating artery | 前交通動脈 | 動脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 461 | M0470 | Middle cerebral artery | 中大腦動脈 | 動脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 462 | M0471 | Optic canal | 視神經管 | 骨 | M66＋CM58 | 3 | M66 1027 頭部III |  |
| 463 | M0472 | Anterior spinal artery | 前脊動脈 | 動脈 | M66 | 2 | M66 1027 頭部III |  |
| 464 | M0473 | Anterior inferior cerebellar artery (AICA) | 前下小腦動脈 | 動脈 | M66＋CM58 | 3 | M66 1027 頭部III |  |
| 465 | M0474 | Superior cerebellar artery | 上小腦動脈 | 動脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 466 | M0475 | Posterior cerebral artery | 後大腦動脈 | 動脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 467 | M0476 | Posterior communicating artery | 後交通動脈 | 動脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 468 | M0477 | Confluence of sinuses | 竇匯 | 靜脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 469 | M0478 | Sigmoid sinus | 乙狀竇 | 靜脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 470 | M0479 | Superior petrosal sinus | 上岩竇 | 靜脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 471 | M0480 | Inferior petrosal sinus | 下岩竇 | 靜脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 472 | M0481 | Jugular bulb | 頸靜脈球 | 靜脈 | M66 | 1 | M66 1027 頭部III |  |
| 473 | M0482 | Sphenoparietal sinus | 蝶頂竇 | 靜脈 | M66＋CM58 | 2 | M66 1027 頭部III | 筆誤：中文原寫「蝶竇」（應為蝶頂竇） |
| 474 | M0483 | Superior orbital fissure | 上眶裂 | 骨 | M66＋CM58 | 3 | M66 1027 頭部III | 筆誤：英文曾與「下眶裂」配錯 |
| 475 | M0484 | Petrous part of the temporal bone | 顳骨岩部 | 骨 | M66＋CM58 | 1 | M66 1027 頭部III |  |
| 476 | M0485 | Middle cerebral vein | 中大腦靜脈 | 靜脈 | M66＋CM58 | 1 | M66 1027 頭部III |  |
| 477 | M0487 | Sympathetic plexus | 交感神經叢 | 神經 | M66＋CM58 | 1 | M66 1027 頭部III |  |
| 478 | M0488 | Abducent nerve (CN VI) | 外旋神經 | 神經 | M66＋CM58 | 3 | M66 1027 頭部III |  |
| 479 | M0489 | Oculomotor nerve (CN III) | 動眼神經 | 神經 | M66＋CM58 | 3 | M66 1027 頭部III |  |
| 480 | M0490 | Trochlear nerve (CN IV) | 滑車神經 | 神經 | M66＋CM58 | 3 | M66 1027 頭部III |  |
| 481 | M0492 | Nose | 鼻 | 器官 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 482 | M0493 | Lacrimal ducts | 淚管 | 其他 | M66 | 1 | M66 1027 頭部III |  |
| 483 | M0494 | External nose | 外鼻部 | 器官 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 484 | M0495 | Alar cartilage | 翼軟骨 | 其他 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 485 | M0496 | Nasal bone | 鼻骨 | 骨 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 486 | M0497 | Nasal septum | 鼻中膈 | 其他 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 487 | M0498 | Perpendicular plate of ethmoid bone | 篩骨垂直版 | 骨 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 488 | M0499 | Vomer | 犁骨 | 骨 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 489 | M0500 | Septal cartilage | 鼻中膈軟骨 | 其他 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 490 | M0501 | Nasal vestibule | 鼻前庭區 | 腔隙／區域 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 491 | M0502 | Respiratory region | 呼吸區 | 腔隙／區域 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 492 | M0503 | Turbinate (Nasal conchae) | 鼻甲 | 骨 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 493 | M0504 | Olfactory region | 嗅覺區 | 腔隙／區域 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 494 | M0505 | Olfactory receptors | 嗅覺受器 | 其他 | M66＋CM58 | 1 | M66 1027 頭部III |  |
| 495 | M0506 | Cribriform plate of ethmoid | 篩骨水平板 | 骨 | M66 | 1 | M66 1027 頭部III |  |
| 496 | M0507 | Superior nasal concha | 上鼻甲 | 骨 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 497 | M0508 | Middle nasal concha | 中鼻甲 | 骨 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 498 | M0509 | Inferior nasal concha | 下鼻甲 | 骨 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 499 | M0510 | Ethmoid bone | 篩骨 | 骨 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 500 | M0511 | Nasal meatus | 鼻道 | 腔隙／區域 | M66 | 2 | M66 1027 頭部III |  |
| 501 | M0512 | Sphenoethmoidal recess | 蝶篩隱窩 | 腔隙／區域 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 502 | M0513 | Superior nasal meatus | 上鼻道 | 腔隙／區域 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 503 | M0514 | Middle nasal meatus | 中鼻道 | 腔隙／區域 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 504 | M0515 | Inferior nasal meatus | 下鼻道 | 腔隙／區域 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 505 | M0516 | Frontal sinus | 額竇 | 腔隙／區域 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 506 | M0518 | Semilunar hiatus | 半月裂孔 | 腔隙／區域 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 507 | M0519 | Ethmoidal bulla | 篩泡 | 腔隙／區域 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 508 | M0520 | Greater palatine artery | 大顎動脈 | 動脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 509 | M0521 | Incisive foramen | 門齒窩 | 骨 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 510 | M0522 | Septal branch of superior labial artery | 上唇動脈膈支 | 動脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 511 | M0523 | Anterior ethmoidal artery | 前篩動脈 | 動脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 512 | M0524 | Posterior ethmoidal artery | 後篩動脈 | 動脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 513 | M0525 | Kiesselbach's area | 基塞耳巴赫氏區 | 腔隙／區域 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 514 | M0526 | Sphenopalatine vein | 蝶顎靜脈 | 靜脈 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 515 | M0527 | Ophthalmic vein | 眼靜脈 | 靜脈 | M66＋CM58 | 2 | M66 1027 頭部III | 筆誤：中文曾寫「視神經」（應為眼神經） |
| 516 | M0528 | Olfactory nerve | 嗅神經 | 神經 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 517 | M0529 | Olfactory bulb | 嗅球 | 器官 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 518 | M0530 | Anterior ethmoidal nerve | 前篩神經 | 神經 | M66＋CM58 | 2 | M66 1027 頭部III |  |
| 519 | M0531 | Nasociliary nerve | 鼻睫神經 | 神經 | M66＋CM58 | 3 | M66 1027 頭部III |  |
| 520 | M0532 | Posterior ethmoidal nerve | 後篩神經 | 神經 | M66 | 2 | M66 1027 頭部III |  |
| 521 | M0533 | Orbit | 眼眶 | 骨 | M66＋CM58 | 3 | M66 1117 頭部IV |  |
| 522 | M0534 | Eyeball | 眼球 | 器官 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 523 | M0535 | Eyelid | 眼瞼 | 器官 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 524 | M0536 | Lacrimal apparatus | 淚器 | 器官 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 525 | M0537 | Extraocular muscle | 眼外肌 | 肌肉 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 526 | M0538 | Orbital margin | 框緣 | 骨 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 527 | M0539 | Orbital apex | 尖端 | 骨 | M66＋CM58 | 1 | M66 1117 頭部IV |  |
| 528 | M0540 | Middle cranial fossa | 中顱窩 | 腔隙／區域 | M66＋CM58 | 1 | M66 1117 頭部IV |  |
| 529 | M0541 | Lesser wing of sphenoid bone | 蝶骨小翼 | 骨 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 530 | M0543 | Lacrimal bone | 淚骨 | 骨 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 531 | M0544 | Body of sphenoid bone | 蝶骨體 | 骨 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 532 | M0545 | Optic nerve (CN II) | 視神經 | 神經 | M66＋CM58 | 3 | M66 1117 頭部IV |  |
| 533 | M0546 | Frontal nerve | 額神經 | 神經 | M66＋CM58 | 3 | M66 1117 頭部IV |  |
| 534 | M0547 | Rectus muscles | 直肌 | 肌肉 | M66 | 2 | M66 1117 頭部IV |  |
| 535 | M0548 | Superior rectus muscle | 上直肌 | 肌肉 | M66＋CM58 | 3 | M66 1117 頭部IV |  |
| 536 | M0549 | Inferior rectus muscle | 下直肌 | 肌肉 | M66＋CM58 | 3 | M66 1117 頭部IV |  |
| 537 | M0550 | Medial rectus muscle | 內直肌 | 肌肉 | M66＋CM58 | 3 | M66 1117 頭部IV |  |
| 538 | M0551 | Lateral rectus muscle | 外直肌 | 肌肉 | M66＋CM58 | 3 | M66 1117 頭部IV |  |
| 539 | M0552 | Oblique muscles | 斜肌 | 肌肉 | M66 | 2 | M66 1117 頭部IV |  |
| 540 | M0553 | Superior oblique muscle | 上斜肌 | 肌肉 | M66＋CM58 | 3 | M66 1117 頭部IV |  |
| 541 | M0554 | Inferior oblique muscle | 下斜肌 | 肌肉 | M66＋CM58 | 3 | M66 1117 頭部IV |  |
| 542 | M0555 | Common tendinous ring (Annular ring) | 總腱環 | 韌帶 | M66＋CM58 | 3 | M66 1117 頭部IV |  |
| 543 | M0556 | Trochlea | 滑車 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 544 | M0557 | Vertical axis | 垂直軸 | 其他 | M66 | 1 | M66 1117 頭部IV |  |
| 545 | M0558 | Transverse axis | 橫軸 | 其他 | M66 | 1 | M66 1117 頭部IV |  |
| 546 | M0559 | Anteroposterior axis | 前後軸 | 其他 | M66 | 1 | M66 1117 頭部IV |  |
| 547 | M0560 | Levator palpebrae superioris muscle | 提上眼瞼肌 | 肌肉 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 548 | M0561 | Tarsal plates | 瞼板 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 549 | M0562 | Tarsal glands | 瞼腺 | 腺體 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 550 | M0563 | Superior tarsal muscle | 瞼上肌 | 肌肉 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 551 | M0564 | Conjunctiva | 結膜 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 552 | M0565 | Palpebral conjunctiva | 瞼結膜 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 553 | M0566 | Bulbar conjunctiva | 球結膜 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 554 | M0567 | Excretory ducts of lacrimal gland | 淚腺外分泌管 | 腺體 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 555 | M0568 | Lacrimal punctum | 淚點 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 556 | M0569 | Lacrimal canaliculus | 淚小管 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 557 | M0570 | Lacrimal sac | 淚囊 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 558 | M0571 | Nasolacrimal duct | 鼻淚管 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 559 | M0572 | Vitreous humor | 玻璃狀液 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 560 | M0573 | Fibrous layer | 纖維層 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 561 | M0574 | Vascular layer | 血管層 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 562 | M0575 | Retina (inner layer) | 視網膜層 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 563 | M0576 | Sclera | 鞏膜 | 器官 | M66＋CM58 | 3 | M66 1117 頭部IV |  |
| 564 | M0577 | Choroid coat | 脈絡膜 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 565 | M0578 | Melanocyte | 黑色素細胞 | 其他 | M66 | 1 | M66 1117 頭部IV |  |
| 566 | M0579 | Ciliary body | 睫狀體 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 567 | M0580 | Ora serrata | 鋸齒緣 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 568 | M0581 | Ciliary processes | 睫狀突 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 569 | M0582 | Zonular fibers | 小帶纖維 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 570 | M0583 | Suspensory ligament of the lens | 懸韌帶 | 韌帶 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 571 | M0584 | Lens | 水晶體 | 器官 | M66＋CM58 | 3 | M66 1117 頭部IV |  |
| 572 | M0585 | Aqueous humor | 水樣狀液 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 573 | M0586 | Ciliary muscle | 睫狀肌 | 肌肉 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 574 | M0587 | Lens epithelium | 晶狀上皮 | 其他 | M66 | 1 | M66 1117 頭部IV |  |
| 575 | M0588 | Lens fibers | 晶狀纖維 | 其他 | M66 | 1 | M66 1117 頭部IV |  |
| 576 | M0589 | Iris | 虹膜 | 器官 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 577 | M0590 | Pupil | 瞳孔 | 器官 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 578 | M0591 | Sphincter pupillae | 瞳孔括約肌 | 肌肉 | M66＋CM58 | 3 | M66 1117 頭部IV |  |
| 579 | M0592 | Dilator pupillae | 瞳孔擴張肌 | 肌肉 | M66＋CM58 | 3 | M66 1117 頭部IV |  |
| 580 | M0593 | Anterior chamber | 前房 | 腔隙／區域 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 581 | M0594 | Posterior chamber | 後房 | 腔隙／區域 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 582 | M0595 | Scleral venous sinus | 鞏膜靜脈竇 | 靜脈 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 583 | M0596 | Neural layer of retina | 神經層 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 584 | M0597 | Pigment layer of retina | 色素層 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 585 | M0598 | Optic disc | 視盤 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 586 | M0599 | Fovea centralis | 中央小凹 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 587 | M0600 | Macula lutea | 黃斑部 | 其他 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 588 | M0601 | Superior division of oculomotor nerve | 動眼神經上分支 | 神經 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 589 | M0602 | Inferior division of oculomotor nerve | 動眼神經下分支 | 神經 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 590 | M0603 | Zygomatic branch of CN V2 | 顴支 | 神經 | M66 | 1 | M66 1117 頭部IV |  |
| 591 | M0604 | Supraorbital nerve | 眶上神經 | 神經 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 592 | M0606 | Supratrochlear nerve | 滑車上神經 | 神經 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 593 | M0607 | Supratrochlear foramen | 滑車上孔 | 骨 | M66 | 1 | M66 1117 頭部IV |  |
| 594 | M0608 | Long ciliary nerve | 長睫神經 | 神經 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 595 | M0609 | Short ciliary nerve | 短睫神經 | 神經 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 596 | M0610 | Ciliary ganglion | 睫狀神經節 | 神經 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 597 | M0611 | Anterior ethmoidal foramen | 前篩孔 | 骨 | M66＋CM58 | 1 | M66 1117 頭部IV |  |
| 598 | M0612 | Posterior ethmoidal foramen | 後篩孔 | 骨 | M66＋CM58 | 1 | M66 1117 頭部IV |  |
| 599 | M0613 | Infratrochlear nerve | 滑車下神經 | 神經 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 600 | M0614 | Central artery of retina | 視網膜中央動脈 | 動脈 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 601 | M0615 | Anterior ciliary artery | 前睫動脈 | 動脈 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 602 | M0616 | Posterior ciliary artery | 後睫動脈 | 動脈 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 603 | M0617 | Short posterior ciliary artery | 短後睫動脈 | 動脈 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 604 | M0618 | Long posterior ciliary artery | 長後睫動脈 | 動脈 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 605 | M0619 | Auricle | 耳廓 | 器官 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 606 | M0620 | Ceruminous gland | 耵聹腺 | 腺體 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 607 | M0621 | Tympanic membrane | 鼓膜 | 器官 | M66＋CM58 | 2 | M66 1117 頭部IV |  |
| 608 | M0622 | Middle ear | 中耳 | 器官 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 609 | M0623 | Tympanic cavity | 鼓室腔 | 腔隙／區域 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 610 | M0624 | Malleus | 錘骨 | 骨 | M66＋CM58 | 3 | M66 1124 頭部V | 筆誤：中文曾寫「錘鼓」 |
| 611 | M0625 | Stapes | 鐙骨 | 骨 | M66＋CM58 | 3 | M66 1124 頭部V | 筆誤：原寫 Stampes（其中一份） |
| 612 | M0626 | Oval window | 卵圓窗 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 613 | M0627 | Vestibule | 前庭 | 腔隙／區域 | M66 | 2 | M66 1124 頭部V |  |
| 614 | M0628 | Round window | 圓窗 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 615 | M0629 | Cochlea | 耳蝸 | 器官 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 616 | M0630 | Mastoid antrum | 乳突竇 | 腔隙／區域 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 617 | M0631 | Pharyngotympanic tube (Auditory tube) | 耳咽管 | 器官 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 618 | M0632 | Tegmen tympani | 鼓室蓋 | 骨 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 619 | M0633 | Auditory ossicles | 聽小骨 | 骨 | M66＋CM58 | 3 | M66 1124 頭部V |  |
| 620 | M0634 | Incus | 砧骨 | 骨 | M66＋CM58 | 3 | M66 1124 頭部V |  |
| 621 | M0635 | Tensor tympani muscle | 鼓膜張肌 | 肌肉 | M66＋CM58 | 3 | M66 1124 頭部V |  |
| 622 | M0636 | Stapedius muscle | 鐙骨肌 | 肌肉 | M66＋CM58 | 3 | M66 1124 頭部V |  |
| 623 | M0637 | Stapedius nerve | 鐙骨肌神經 | 神經 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 624 | M0638 | Inner ear | 內耳 | 器官 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 625 | M0639 | Osseous labyrinth | 骨性迷路 | 器官 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 626 | M0640 | Perilymph | 外淋巴液 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 627 | M0641 | Membranous labyrinth | 膜性迷路 | 器官 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 628 | M0642 | Endolymph | 內淋巴液 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 629 | M0643 | Semicircular canal | 半規管 | 器官 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 630 | M0644 | Semicircular duct | 半規導管 | 器官 | M66＋CM58 | 2 | M66 1124 頭部V | 筆誤：原寫 Semilunar duct |
| 631 | M0645 | Utricle | 橢圓囊 | 器官 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 632 | M0646 | Saccule | 球狀囊 | 器官 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 633 | M0647 | Ampulla | 壺腹 | 器官 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 634 | M0648 | Organ of Corti (Spiral organ) | 柯蒂氏器 | 器官 | M66＋CM58 | 3 | M66 1124 頭部V |  |
| 635 | M0649 | Basilar membrane | 基底膜 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 636 | M0650 | Stereocilia | 靜纖毛 | 其他 | M66 | 1 | M66 1124 頭部V |  |
| 637 | M0651 | Tectorial membrane | 覆膜 | 其他 | M66 | 2 | M66 1124 頭部V |  |
| 638 | M0652 | Vestibular membrane | 前庭膜 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 639 | M0653 | Modiolus | 蝸軸 | 骨 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 640 | M0654 | Cochlear duct (Scala media) | 耳蝸管 | 器官 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 641 | M0655 | Scala vestibuli | 前庭階 | 腔隙／區域 | M66＋CM58 | 3 | M66 1124 頭部V |  |
| 642 | M0656 | Helicotrema | 耳蝸孔 | 腔隙／區域 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 643 | M0657 | Scala tympani | 鼓階 | 腔隙／區域 | M66＋CM58 | 3 | M66 1124 頭部V |  |
| 644 | M0658 | Crista ampullaris | — | 其他 | M66 | 2 | M66 1124 頭部V |  |
| 645 | M0659 | Cupula | — | 其他 | M66 | 1 | M66 1124 頭部V |  |
| 646 | M0660 | Vestibular ganglion | 前庭神經節 | 神經 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 647 | M0661 | Macula | 球囊斑 | 其他 | M66 | 2 | M66 1124 頭部V |  |
| 648 | M0662 | Otolith | 耳石 | 其他 | M66 | 1 | M66 1124 頭部V |  |
| 649 | M0663 | Secondary tympanic membrane | 第二鼓膜 | 其他 | M66 | 1 | M66 1124 頭部V |  |
| 650 | M0664 | Vestibulocochlear nerve (CN VIII) | 前庭耳蝸神經 | 神經 | M66＋CM58 | 2 | M66 1124 頭部V | 筆誤：圖面曾標成 CN VII |
| 651 | M0665 | Cochlear nerve (ganglion) | 蝸神經 | 神經 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 652 | M0666 | Vestibular nerve | 前庭神經 | 神經 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 653 | M0667 | Internal acoustic meatus | 內聽道 | 骨 | M66＋CM58 | 1 | M66 1124 頭部V |  |
| 654 | M0668 | Oral cavity | 口腔 | 腔隙／區域 | M66＋CM58 | 2 | M66 1124 頭部V | 筆誤：目錄原寫 Oval cavity |
| 655 | M0669 | Oral fissure | — | 腔隙／區域 | M66 | 1 | M66 1124 頭部V |  |
| 656 | M0670 | Hard palate | 硬顎 | 器官 | M66＋CM58 | 2 | M66 1124 頭部V | 筆誤：原寫 Hard plate |
| 657 | M0671 | Soft palate | 軟顎 | 器官 | M66＋CM58 | 2 | M66 1124 頭部V | 筆誤：原寫 Soft plate |
| 658 | M0672 | Lips | 嘴唇 | 器官 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 659 | M0673 | Fauces | 咽門 | 腔隙／區域 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 660 | M0674 | Oral diaphragm | 口腔橫膈 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 661 | M0675 | Oral vestibule | 口腔前庭 | 腔隙／區域 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 662 | M0676 | Oral cavity proper | 口腔本體 | 腔隙／區域 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 663 | M0677 | Tongue | 舌頭 | 器官 | M66＋CM58 | 3 | M66 1124 頭部V |  |
| 664 | M0678 | Papillae | 乳突 | 其他 | M66 | 2 | M66 1124 頭部V |  |
| 665 | M0679 | Fungiform papillae | 蕈狀乳突 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 666 | M0680 | Filiform papillae | 絲狀乳突 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 667 | M0681 | Vallate papillae | 輪廓狀乳突 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 668 | M0682 | Foliate papillae | 葉狀乳突 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 669 | M0683 | Terminal sulcus | 界溝 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 670 | M0684 | Lingual tonsil | 舌扁桃腺 | 器官 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 671 | M0685 | Lingual frenulum | 舌繫帶 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 672 | M0686 | Extrinsic tongue muscles | 外在肌 | 肌肉 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 673 | M0687 | Genioglossus muscle | 頦舌肌 | 肌肉 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 674 | M0688 | Styloglossus muscle | 莖突舌肌 | 肌肉 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 675 | M0689 | Palatoglossus muscle | 顎舌肌 | 肌肉 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 676 | M0690 | Intrinsic tongue muscles | 內在肌 | 肌肉 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 677 | M0691 | Superior longitudinal muscle | 上縱肌 | 肌肉 | M66 | 2 | M66 1124 頭部V |  |
| 678 | M0692 | Inferior longitudinal muscle | 下縱肌 | 肌肉 | M66 | 2 | M66 1124 頭部V |  |
| 679 | M0693 | Transverse muscle of tongue | 橫肌 | 肌肉 | M66 | 2 | M66 1124 頭部V |  |
| 680 | M0694 | Vertical muscle of tongue | 垂直肌 | 肌肉 | M66 | 2 | M66 1124 頭部V |  |
| 681 | M0695 | Dorsal lingual artery | 舌背動脈 | 動脈 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 682 | M0696 | Sublingual artery | 舌下動脈 | 動脈 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 683 | M0697 | Deep lingual artery | 舌深動脈 | 動脈 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 684 | M0698 | Tonsillar branch of facial artery | 扁桃支 | 動脈 | M66 | 2 | M66 1124 頭部V |  |
| 685 | M0699 | Submental lymph nodes | 頦下淋巴結 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 686 | M0701 | Submandibular lymph nodes | 頷下淋巴結 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 687 | M0702 | Inferior deep cervical lymph nodes | 下深頸淋巴結 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 688 | M0703 | Superior deep cervical lymph nodes | 上深頸淋巴結 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 689 | M0704 | Teeth | 牙齒 | 器官 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 690 | M0705 | Deciduous teeth | 乳齒 | 器官 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 691 | M0706 | Permanent teeth | 恆齒 | 器官 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 692 | M0707 | Premolar | 前臼齒 | 器官 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 693 | M0708 | Molar | 臼齒 | 器官 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 694 | M0709 | Crown | 齒冠 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 695 | M0710 | Neck of tooth | 齒頸 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 696 | M0711 | Root | 齒根 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 697 | M0712 | Enamel | 琺瑯質 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 698 | M0713 | Dentin | 齒質 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 699 | M0714 | Cement | 齒堊質 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 700 | M0715 | Pulp cavity | 齒髓腔 | 腔隙／區域 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 701 | M0716 | Apical foramen | 頂孔 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 702 | M0717 | Incisor | 門齒 | 器官 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 703 | M0718 | Canine | 犬齒 | 器官 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 704 | M0719 | Inferior dental plexus | — | 神經 | M66 | 1 | M66 1124 頭部V | OCR（只見於圖面辨識，名稱可能有誤） |
| 705 | M0720 | Branch to mylohyoid | — | 動脈 | M66 | 1 | M66 1124 頭部V | OCR（只見於圖面辨識，名稱可能有誤） |
| 706 | M0721 | Deep temporal branches | — | 動脈 | M66 | 1 | M66 1124 頭部V | OCR（只見於圖面辨識，名稱可能有誤） |
| 707 | M0722 | Submandibular region | 頷下區 | 腔隙／區域 | M66 | 2 | M66 1124 頭部V |  |
| 708 | M0723 | Submental region | 頦下區 | 腔隙／區域 | M66 | 2 | M66 1124 頭部V |  |
| 709 | M0724 | Carotid artery plexus | 頸動脈叢 | 神經 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 710 | M0726 | Submandibular duct | 下頷下腺管 | 腺體 | M66＋CM58 | 3 | M66 1124 頭部V |  |
| 711 | M0727 | Paralingual space | — | 腔隙／區域 | M66 | 2 | M66 1124 頭部V |  |
| 712 | M0728 | Palatine processes of maxilla | 上頷骨顎突 | 骨 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 713 | M0729 | Horizontal plates of palatine bone | 顎骨水平板 | 骨 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 714 | M0730 | Musculus uvulae | 懸壅垂肌 | 肌肉 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 715 | M0731 | Glossopalatine arch | 顎舌弓 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 716 | M0732 | Palatopharyngeus muscle | 顎咽肌 | 肌肉 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 717 | M0733 | Palatopharyngeal arch | 顎咽弓 | 其他 | M66＋CM58 | 2 | M66 1124 頭部V | 筆誤：原寫 pharynopalatine arch |
| 718 | M0734 | Levator veli palatini muscle | 提鄂帆肌 | 肌肉 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 719 | M0735 | Tensor veli palatini muscle | 張顎帆肌 | 肌肉 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 720 | M0736 | Ascending palatine artery | 升顎動脈 | 動脈 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 721 | M0737 | Pharyngeal plexus | — | 神經 | M66＋CM58 | 2 | M66 1124 頭部V |  |
| 722 | M0738 | Tracheal cartilage | 氣管軟骨 | 其他 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 723 | M0739 | Tracheal smooth muscle | 氣管平滑肌 | 肌肉 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 724 | M0740 | Sternal angle | 胸骨角 | 骨 | M66＋CM58 | 1 | M66 1124 頸部III |  |
| 725 | M0742 | Tracheal branch of inferior thyroid artery | 下甲狀腺動脈氣管分支 | 動脈 | M66 | 2 | M66 1124 頸部III |  |
| 726 | M0743 | Tracheal branch of superior thyroid artery | 上甲狀腺動脈氣管分支 | 動脈 | M66 | 2 | M66 1124 頸部III |  |
| 727 | M0745 | Tracheal venous plexus | 氣管靜脈叢 | 靜脈 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 728 | M0746 | Azygos vein | 奇靜脈 | 靜脈 | M66＋CM58 | 1 | M66 1124 頸部III |  |
| 729 | M0747 | Cervical sympathetic ganglia | 上中下頸交感神經節 | 神經 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 730 | M0748 | Thyroid isthmus | 甲狀腺峽部 | 腺體 | M66＋CM58 | 1 | M66 1124 頸部III |  |
| 731 | M0749 | Oropharynx | 口咽 | 腔隙／區域 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 732 | M0750 | Laryngopharynx | 喉咽 | 腔隙／區域 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 733 | M0751 | Tonsillar ring | 扁桃體（淋巴環） | 其他 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 734 | M0752 | Pharyngeal constrictor | 咽縮肌 | 肌肉 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 735 | M0753 | Salpingopharyngeus muscle | 耳咽管咽肌 | 肌肉 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 736 | M0754 | Stylopharyngeus muscle | 莖突咽肌 | 肌肉 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 737 | M0755 | Tonsillar artery | 扁桃體動脈 | 動脈 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 738 | M0756 | Pharyngeal recesses | 咽隱窩 | 腔隙／區域 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 739 | M0757 | Salpingopharyngeal fold | 耳咽管咽折 | 其他 | M66 | 2 | M66 1124 頸部III |  |
| 740 | M0758 | Epiglottic cartilage | 會厭軟骨 | 其他 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 741 | M0759 | Pharyngoepiglottic fold | 咽會厭軟骨折 | 其他 | M66＋CM58 | 1 | M66 1124 頸部III |  |
| 742 | M0760 | Pharyngo-esophageal junction | — | 其他 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 743 | M0762 | Pharyngeal tonsil | 咽扁桃腺 | 器官 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 744 | M0763 | Tubal tonsil | 咽鼓管扁桃腺 | 器官 | M66 | 2 | M66 1124 頸部III |  |
| 745 | M0764 | Submandibular triangle | 頷下三角 | 腔隙／區域 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 746 | M0765 | Superior pharyngeal constrictor | 上咽縮肌 | 肌肉 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 747 | M0766 | Middle pharyngeal constrictor | 中咽縮肌 | 肌肉 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 748 | M0767 | Inferior pharyngeal constrictor | 下咽縮肌 | 肌肉 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 749 | M0768 | Pharyngeal raphe | 咽中縫 | 韌帶 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 750 | M0769 | Pterygomandibular raphe | 翼下頷縫 | 韌帶 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 751 | M0770 | Pterygoid hamulus (medial pterygoid plate) | 翼突內側版 | 骨 | M66 | 1 | M66 1124 頸部III |  |
| 752 | M0771 | Stylohyoid ligament | 莖舌骨韌帶 | 韌帶 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 753 | M0772 | Palatine aponeurosis | 硬腱膜 | 韌帶 | M66＋CM58 | 1 | M66 1124 頸部III |  |
| 754 | M0773 | Pharyngobasilar fascia | 咽顱底筋膜 | 其他 | M66 | 2 | M66 1124 頸部III |  |
| 755 | M0774 | Inferior ganglion of vagus nerve (Nodose ganglion) | 結狀神經節 | 其他 | M66 | 2 | M66 1124 頸部III |  |
| 756 | M0775 | External laryngeal nerve | 外喉神經 | 神經 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 757 | M0776 | Internal laryngeal nerve | 內喉神經 | 神經 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 758 | M0777 | Cricothyroid muscle | 環甲肌 | 肌肉 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 759 | M0778 | Carotid triangle | 頸動脈三角 | 腔隙／區域 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 760 | M0779 | Cervical esophagus | 頸部食道 | 器官 | M66 | 2 | M66 1124 頸部III |  |
| 761 | M0780 | Superior esophageal sphincter | — | 其他 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 762 | M0781 | Esophageal branch of inferior thyroid artery | 下甲狀腺動脈食道支 | 動脈 | M66 | 1 | M66 1124 頸部III |  |
| 763 | M0782 | Larynx | 喉部 | 器官 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 764 | M0783 | Arytenoid cartilage | 勺狀軟骨 | 其他 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 765 | M0784 | Corniculate cartilage | 小角軟骨 | 其他 | M66＋CM58 | 2 | M66 1124 頸部III |  |
| 766 | C0004 | Temporal bone | 顳骨 | 骨 | CM58 | 1 | CM58 W10 頭部1 | OCR（只見於圖面辨識，名稱可能有誤） |
| 767 | C0005 | Parietal bone | 頂骨 | 骨 | CM58 | 1 | CM58 W10 頭部1 | OCR（只見於圖面辨識，名稱可能有誤） |
| 768 | C0006 | Occipital bone | 枕骨 | 骨 | CM58 | 1 | CM58 W10 頭部1 | OCR（只見於圖面辨識，名稱可能有誤） |
| 769 | C0065 | Supra ophthalmic vein | — | 靜脈 | CM58 | 1 | CM58 W10 頭部1 |  |
| 770 | C0099 | Mastoid process | 乳突 | 骨 | CM58 | 2 | CM58 W10 頭部1 |  |
| 771 | C0100 | Tympanic plate | 鼓板 | 骨 | CM58 | 1 | CM58 W10 頭部1 |  |
| 772 | C0103 | Lateral pterygoid process | 外翼突 | 骨 | CM58 | 1 | CM58 W10 頭部1 |  |
| 773 | C0113 | Medial pterygoid plate | 翼突內側板 | 骨 | CM58 | 1 | CM58 W10 頭部1 |  |
| 774 | C0116 | Lateral pterygoid a. & nerve | 外翼肌動脈與神經 | 動脈 | CM58 | 1 | CM58 W10 頭部1 |  |
| 775 | C0117 | Medial pterygoid a. & nerve | 內翼肌動脈與神經 | 動脈 | CM58 | 1 | CM58 W10 頭部1 |  |
| 776 | C0139 | Medulla | 延腦 | 器官 | CM58 | 1 | CM58 W10 頭部1 |  |
| 777 | C0156 | Inferior alveolar vein | — | 靜脈 | CM58 | 1 | CM58 W10 頭部1 | OCR（只見於圖面辨識，名稱可能有誤） |
| 778 | C0212 | Muscular triangle | 肌三角 | 腔隙／區域 | CM58 | 2 | CM58 W11 頸部1 |  |
| 779 | C0220 | Intersectio tendinea | — | 其他 | CM58 | 1 | CM58 W11 頸部1 | OCR（只見於圖面辨識，名稱可能有誤） |
| 780 | C0222 | Longissimus capitis | — | 肌肉 | CM58 | 1 | CM58 W11 頸部1 | OCR（只見於圖面辨識，名稱可能有誤） |
| 781 | C0223 | Semispinalis capitis | — | 肌肉 | CM58 | 1 | CM58 W11 頸部1 | OCR（只見於圖面辨識，名稱可能有誤） |
| 782 | C0224 | Longus capitis | 頭長肌 | 肌肉 | CM58 | 2 | CM58 W11 頸部1 |  |
| 783 | C0226 | Levator scapulae | 提肩胛肌 | 肌肉 | CM58 | 2 | CM58 W11 頸部1 |  |
| 784 | C0229 | Scalenus posterior | 後斜角肌 | 肌肉 | CM58 | 2 | CM58 W11 頸部1 |  |
| 785 | C0253 | Brachiocephalic vein | 頭臂靜脈 | 靜脈 | CM58 | 1 | CM58 W11 頸部1 |  |
| 786 | C0254 | Thyroid v. (superior, middle, inferior) | 甲狀腺靜脈 | 靜脈 | CM58 | 2 | CM58 W11 頸部1 |  |
| 787 | C0261 | Greater occipital nerve | 枕大神經 | 神經 | CM58 | 2 | CM58 W11 頸部1 |  |
| 788 | C0262 | Third occipital nerve | 第三枕神經 | 神經 | CM58 | 2 | CM58 W11 頸部1 |  |
| 789 | C0263 | Medial supraclavicular nerve | 內側鎖骨上神經 | 神經 | CM58 | 1 | CM58 W11 頸部1 | OCR（只見於圖面辨識，名稱可能有誤） |
| 790 | C0264 | Intermediate supraclavicular nerve | 中間鎖骨上神經 | 神經 | CM58 | 1 | CM58 W11 頸部1 | OCR（只見於圖面辨識，名稱可能有誤） |
| 791 | C0265 | Lateral supraclavicular nerves | — | 神經 | CM58 | 1 | CM58 W11 頸部1 | OCR（只見於圖面辨識，名稱可能有誤） |
| 792 | C0270 | Posterior cervical region (PCR) | 後頸區 | 腔隙／區域 | CM58 | 1 | CM58 W11 頸部1 |  |
| 793 | C0271 | Lesser supraclavicular fossa | 鎖骨上小窩 | 腔隙／區域 | CM58 | 2 | CM58 W11 頸部1 |  |
| 794 | C0272 | Occipital triangle | 枕三角 | 腔隙／區域 | CM58 | 2 | CM58 W11 頸部1 |  |
| 795 | C0273 | Omoclavicular (supraclavicular) triangle | 鎖骨上三角 | 腔隙／區域 | CM58 | 2 | CM58 W11 頸部1 |  |
| 796 | C0274 | Submental triangle | 頦下三角 | 腔隙／區域 | CM58 | 2 | CM58 W11 頸部1 |  |
| 797 | C0277 | Suboccipital region (SOR) | 枕骨下區 | 腔隙／區域 | CM58 | 1 | CM58 W11 頸部1 |  |
| 798 | C0279 | Dorsal scapular nerve | 背肩胛神經 | 神經 | CM58 | 2 | CM58 W11 頸部1 |  |
| 799 | C0280 | Suprascapular nerve | 肩胛上神經 | 神經 | CM58 | 2 | CM58 W11 頸部1 |  |
| 800 | C0282 | Erb's point (superficial cervical plexus point) | — | 其他 | CM58 | 1 | CM58 W11 頸部1 | OCR（只見於圖面辨識，名稱可能有誤） |
| 801 | C0283 | Occipital lymph node | — | 其他 | CM58 | 1 | CM58 W11 頸部1 | OCR（只見於圖面辨識，名稱可能有誤） |
| 802 | C0284 | Nerve to trapezius from C3, C4 | — | 神經 | CM58 | 1 | CM58 W11 頸部1 | OCR（只見於圖面辨識，名稱可能有誤） |
| 803 | C0286 | Cervicodorsal trunk | — | 動脈 | CM58 | 1 | CM58 W11 頸部1 | OCR（只見於圖面辨識，名稱可能有誤） |
| 804 | C0289 | Venous angle | 靜脈角 | 靜脈 | CM58 | 3 | CM58 W11 頸部1 |  |
| 805 | C0290 | Right lymphatic duct | 右淋巴導管 | 其他 | CM58 | 2 | CM58 W11 頸部1 |  |
| 806 | C0301 | Jugular venous arch | 頸靜脈弓 | 靜脈 | CM58 | 3 | CM58 W11 頸部1 |  |
| 807 | C0302 | Communicating vein | 交通靜脈 | 靜脈 | CM58 | 2 | CM58 W11 頸部1 |  |
| 808 | C0305 | Subclavian artery pulse point | 鎖骨下動脈搏動點 | 動脈 | CM58 | 1 | CM58 W11 頸部1 |  |
| 809 | C0306 | Prevertebral muscles | 椎前肌群 | 肌肉 | CM58 | 1 | CM58 W11 頸部1 |  |
| 810 | C0307 | Rectus capitis anterior | 頭前直肌 | 肌肉 | CM58 | 2 | CM58 W11 頸部1 |  |
| 811 | C0308 | Basilar part of occipital bone | 枕骨的基底部 | 骨 | CM58 | 1 | CM58 W11 頸部1 |  |
| 812 | C0309 | Atlanto-occipital joint | 寰枕關節 | 關節 | CM58 | 1 | CM58 W11 頸部1 |  |
| 813 | C0310 | Lateral mass of atlas | 寰椎側塊 | 骨 | CM58 | 1 | CM58 W11 頸部1 |  |
| 814 | C0311 | Rectus capitis lateralis | 頭外直肌 | 肌肉 | CM58 | 2 | CM58 W11 頸部1 |  |
| 815 | C0312 | Jugular process (occipital bone) | 頸靜脈突 | 骨 | CM58 | 1 | CM58 W11 頸部1 |  |
| 816 | C0317 | Superior nuchal line | 上項線 | 骨 | CM58 | 1 | CM58 W11 頸部1 |  |
| 817 | C0318 | Root of the neck | 頸根 | 腔隙／區域 | CM58 | 3 | CM58 W11 頸部1 |  |
| 818 | C0319 | Cervical axillary canal | 腋頸管 | 腔隙／區域 | CM58 | 1 | CM58 W11 頸部1 |  |
| 819 | C0320 | Superior thoracic aperture (Thoracic inlet) | 胸廓上口 | 腔隙／區域 | CM58 | 1 | CM58 W11 頸部1 |  |
| 820 | C0323 | Sympathetic trunk | 交感神經幹 | 神經 | CM58 | 3 | CM58 W11 頸部1 |  |
| 821 | C0324 | Parathyroid glands | 副甲狀腺 | 腺體 | CM58 | 3 | CM58 W11 頸部1 |  |
| 822 | C0325 | Cervical pleura (cupola) | 頸肋膜 | 器官 | CM58 | 3 | CM58 W11 頸部1 |  |
| 823 | C0326 | Pharyngeal branch (of vagus) | 咽支 | 神經 | CM58 | 2 | CM58 W11 頸部1 |  |
| 824 | C0331 | Middle cervical ganglion | 中頸神經節 | 神經 | CM58 | 2 | CM58 W11 頸部1 |  |
| 825 | C0332 | Inferior cervical ganglion | 下頸神經節 | 神經 | CM58 | 2 | CM58 W11 頸部1 |  |
| 826 | C0333 | Stellate ganglion (cervicothoracic ganglion) | 星狀神經節 | 神經 | CM58 | 2 | CM58 W11 頸部1 |  |
| 827 | C0335 | Ansa subclavia | — | 神經 | CM58 | 1 | CM58 W11 頸部1 | OCR（只見於圖面辨識，名稱可能有誤） |
| 828 | C0337 | Superficial cervical lymph node | 淺層頸部淋巴結 | 其他 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 829 | C0343 | Cuneiform cartilage | 楔狀軟骨 | 其他 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 830 | C0345 | Laryngeal vestibule | 前庭 | 腔隙／區域 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 831 | C0346 | Vestibular fold | 前庭褶 | 其他 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 832 | C0347 | Rima glottidis | 聲門裂 | 腔隙／區域 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 833 | C0348 | Vocal fold | 聲褶 | 其他 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 834 | C0349 | Extrinsic laryngeal muscles | 淺層肌群 | 肌肉 | CM58 | 1 | CM58 W12 頸部2_頭部2 |  |
| 835 | C0350 | Intrinsic laryngeal muscles | 深層肌群 | 肌肉 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 836 | C0351 | Inferior laryngeal artery | 下喉動脈 | 動脈 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 837 | C0353 | Superior laryngeal vein | 上喉靜脈 | 靜脈 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 838 | C0354 | Inferior laryngeal vein | 下喉靜脈 | 靜脈 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 839 | C0357 | Inferior laryngeal nerve | 下喉神經 | 神經 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 840 | C0359 | Triticeal cartilage | — | 其他 | CM58 | 1 | CM58 W12 頸部2_頭部2 | OCR（只見於圖面辨識，名稱可能有誤） |
| 841 | C0361 | Median cricothyroid ligament | — | 韌帶 | CM58 | 1 | CM58 W12 頸部2_頭部2 | OCR（只見於圖面辨識，名稱可能有誤） |
| 842 | C0362 | Cricotracheal ligament | — | 韌帶 | CM58 | 1 | CM58 W12 頸部2_頭部2 | OCR（只見於圖面辨識，名稱可能有誤） |
| 843 | C0363 | Capsule of cricothyroid joint | — | 關節 | CM58 | 1 | CM58 W12 頸部2_頭部2 | OCR（只見於圖面辨識，名稱可能有誤） |
| 844 | C0364 | Cricothyroid joint | — | 關節 | CM58 | 1 | CM58 W12 頸部2_頭部2 | OCR（只見於圖面辨識，名稱可能有誤） |
| 845 | C0365 | Cricoarytenoid joint (capsule) | — | 關節 | CM58 | 1 | CM58 W12 頸部2_頭部2 | OCR（只見於圖面辨識，名稱可能有誤） |
| 846 | C0366 | Tracheal rings | — | 其他 | CM58 | 1 | CM58 W12 頸部2_頭部2 | OCR（只見於圖面辨識，名稱可能有誤） |
| 847 | C0367 | Lamina of cricoid | — | 其他 | CM58 | 1 | CM58 W12 頸部2_頭部2 | OCR（只見於圖面辨識，名稱可能有誤） |
| 848 | C0368 | Muscular process (arytenoid) | — | 其他 | CM58 | 1 | CM58 W12 頸部2_頭部2 | OCR（只見於圖面辨識，名稱可能有誤） |
| 849 | C0369 | Laryngeal inlet | — | 腔隙／區域 | CM58 | 1 | CM58 W12 頸部2_頭部2 | OCR（只見於圖面辨識，名稱可能有誤） |
| 850 | C0370 | Ary-epiglottic ligament | — | 韌帶 | CM58 | 1 | CM58 W12 頸部2_頭部2 | OCR（只見於圖面辨識，名稱可能有誤） |
| 851 | C0371 | Quadrangular membrane | — | 韌帶 | CM58 | 1 | CM58 W12 頸部2_頭部2 | OCR（只見於圖面辨識，名稱可能有誤） |
| 852 | C0372 | Lateral thyrohyoid ligament | — | 韌帶 | CM58 | 1 | CM58 W12 頸部2_頭部2 | OCR（只見於圖面辨識，名稱可能有誤） |
| 853 | C0373 | Superior horn of thyroid cartilage | — | 其他 | CM58 | 1 | CM58 W12 頸部2_頭部2 | OCR（只見於圖面辨識，名稱可能有誤） |
| 854 | C0374 | Inferior horn of thyroid cartilage | — | 其他 | CM58 | 1 | CM58 W12 頸部2_頭部2 | OCR（只見於圖面辨識，名稱可能有誤） |
| 855 | C0375 | Lamina of thyroid cartilage | — | 其他 | CM58 | 1 | CM58 W12 頸部2_頭部2 | OCR（只見於圖面辨識，名稱可能有誤） |
| 856 | C0376 | Keratocricoid | — | 肌肉 | CM58 | 1 | CM58 W12 頸部2_頭部2 | OCR（只見於圖面辨識，名稱可能有誤） |
| 857 | C0377 | Thyroarytenoid muscle | 甲杓肌 | 肌肉 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 858 | C0378 | Posterior cricoarytenoid muscle | 後環杓肌 | 肌肉 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 859 | C0379 | Lateral cricoarytenoid muscle | 外環杓肌 | 肌肉 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 860 | C0380 | Transverse arytenoid muscle | 橫杓肌 | 肌肉 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 861 | C0381 | Oblique arytenoid muscle | 斜杓肌 | 肌肉 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 862 | C0390 | Floor of orbit | 眼眶底部 | 腔隙／區域 | CM58 | 1 | CM58 W12 頸部2_頭部2 |  |
| 863 | C0403 | Pterygopalatine nerve | 翼顎神經 | 神經 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 864 | C0405 | Mucous gland of the nose | 鼻的黏液腺 | 腺體 | CM58 | 1 | CM58 W12 頸部2_頭部2 |  |
| 865 | C0422 | Cartilage filling foramen lacerum | — | 其他 | CM58 | 1 | CM58 W12 頸部2_頭部2 | OCR（只見於圖面辨識，名稱可能有誤） |
| 866 | C0431 | Sphenoid spine | 蝶骨棘 | 骨 | CM58 | 1 | CM58 W12 頸部2_頭部2 |  |
| 867 | C0435 | Skin (scalp) | 皮膚 | 其他 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 868 | C0436 | Dense connective tissue (scalp) | 緻密結締組織 | 其他 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 869 | C0437 | Loose connective tissue (scalp) | 疏鬆結締組織 | 其他 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 870 | C0438 | Pericranium | 顱骨膜 | 其他 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 871 | C0452 | Pterion | 翼點 | 骨 | CM58 | 1 | CM58 W12 頸部2_頭部2 |  |
| 872 | C0456 | Spinal dura mater | 硬脊膜 | 其他 | CM58 | 1 | CM58 W12 頸部2_頭部2 |  |
| 873 | C0464 | Tentorial notch | — | 其他 | CM58 | 1 | CM58 W12 頸部2_頭部2 |  |
| 874 | C0469 | Meningeal artery | 腦膜動脈 | 動脈 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 875 | C0495 | Epithalamus | 上視丘 | 器官 | CM58 | 1 | CM58 W12 頸部2_頭部2 |  |
| 876 | C0496 | Hypothalamus | 下視丘 | 器官 | CM58 | 1 | CM58 W12 頸部2_頭部2 |  |
| 877 | C0497 | Thalamus | 視丘 | 器官 | CM58 | 1 | CM58 W12 頸部2_頭部2 |  |
| 878 | C0498 | Subthalamus | 次視丘 | 器官 | CM58 | 1 | CM58 W12 頸部2_頭部2 |  |
| 879 | C0500 | Brainstem | 腦幹 | 器官 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 880 | C0501 | Midbrain | 中腦 | 器官 | CM58 | 1 | CM58 W12 頸部2_頭部2 |  |
| 881 | C0510 | Granular foveolae | 顆粒小凹 | 其他 | CM58 | 1 | CM58 W12 頸部2_頭部2 |  |
| 882 | C0520 | Optic tract | 視徑 | 神經 | CM58 | 1 | CM58 W12 頸部2_頭部2 |  |
| 883 | C0522 | Internal capsule | 內囊 | 其他 | CM58 | 1 | CM58 W12 頸部2_頭部2 |  |
| 884 | C0524 | Anterior clinoid process | 前床狀突 | 骨 | CM58 | 1 | CM58 W12 頸部2_頭部2 |  |
| 885 | C0549 | Basilar plexus (sinus) | — | 靜脈 | CM58 | 1 | CM58 W12 頸部2_頭部2 | OCR（只見於圖面辨識，名稱可能有誤） |
| 886 | C0554 | Lateral process of septal cartilage | 鼻中膈軟骨的外側突 | 其他 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 887 | C0555 | External nostrils | 外鼻孔 | 其他 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 888 | C0575 | Posterior ethmoidal cells | 後篩竇室 | 腔隙／區域 | CM58 | 1 | CM58 W12 頸部2_頭部2 |  |
| 889 | C0577 | Middle ethmoidal cells | 中篩竇室 | 腔隙／區域 | CM58 | 1 | CM58 W12 頸部2_頭部2 |  |
| 890 | C0579 | Anterior ethmoidal cells | 前篩竇室 | 腔隙／區域 | CM58 | 1 | CM58 W12 頸部2_頭部2 |  |
| 891 | C0581 | Branches of the sphenopalatine artery | 蝶顎動脈分支 | 動脈 | CM58 | 2 | CM58 W12 頸部2_頭部2 |  |
| 892 | C0594 | Amygdala | 杏仁核 | 器官 | CM58 | 1 | CM58 W12 頸部2_頭部2 |  |
| 893 | C0607 | Foramen cecum (blind foramen) | 盲孔 | 其他 | CM58 | 2 | CM58 W13 頭部3 |  |
| 894 | C0619 | Deep lingual vein | 舌深靜脈 | 靜脈 | CM58 | 1 | CM58 W13 頭部3 |  |
| 895 | C0639 | Anterior, middle, posterior superior alveolar nerve | 前、中、後上齒槽神經 | 神經 | CM58 | 1 | CM58 W13 頭部3 |  |
| 896 | C0640 | Anterior, middle, posterior superior alveolar artery | 前、中、後上齒槽動脈 | 動脈 | CM58 | 1 | CM58 W13 頭部3 |  |
| 897 | C0654 | Branches of the pterygopalatine ganglion | 翼顎神經節節後 | 神經 | CM58 | 1 | CM58 W13 頭部3 |  |
| 898 | C0659 | Orbital wall | 眼眶壁 | 骨 | CM58 | 2 | CM58 W13 頭部3 |  |
| 899 | C0673 | Extrinsic eye muscles | 眼外在肌 | 肌肉 | CM58 | 2 | CM58 W13 頭部3 |  |
| 900 | C0709 | Chamber (anterior and posterior) | 眼房 | 腔隙／區域 | CM58 | 2 | CM58 W13 頭部3 |  |
| 901 | C0719 | Potential space (retina) | 潛在空間 | 腔隙／區域 | CM58 | 2 | CM58 W13 頭部3 |  |
| 902 | C0741 | Ear | 耳 | 器官 | CM58 | 2 | CM58 W13 頭部3 |  |
| 903 | C0742 | Outer ear | 外耳 | 器官 | CM58 | 2 | CM58 W13 頭部3 |  |
| 904 | C0746 | Elastic cartilage | 彈性軟骨 | 其他 | CM58 | 1 | CM58 W13 頭部3 |  |
| 905 | C0751 | Promontory | 鼓岬 | 骨 | CM58 | 2 | CM58 W13 頭部3 |  |
| 906 | C0764 | Labyrinth | 迷路 | 其他 | CM58 | 2 | CM58 W13 頭部3 |  |
| 907 | C0769 | Otic capsule | — | 骨 | CM58 | 1 | CM58 W13 頭部3 |  |
| 908 | C0783 | Hair cells | 毛細胞 | 其他 | CM58 | 1 | CM58 W13 頭部3 |  |
| 909 | C0784 | Spiral ganglion (cochlear ganglion) | 螺旋神經節 | 神經 | CM58 | 2 | CM58 W13 頭部3 |  |
| 910 | C0790 | Vocalis (vocal fold muscle) | 聲帶肌 | 肌肉 | CM58 | 1 | CM58 W14 頸部3 |  |
| 911 | C0791 | Vocal ligament | 聲韌帶 | 韌帶 | CM58 | 1 | CM58 W14 頸部3 |  |
| 912 | C0792 | Laryngeal ventricle | 喉室 | 腔隙／區域 | CM58 | 1 | CM58 W14 頸部3 |  |
| 913 | C0797 | Thyroidea ima artery | 甲狀腺最下動脈 | 動脈 | CM58 | 1 | CM58 W14 頸部3 |  |
| 914 | C0809 | Pharyngeal plexus (venous) | 咽靜脈叢 | 靜脈 | CM58 | 1 | CM58 W14 頸部3 |  |
| 915 | C0810 | Choana(e) | 鼻後孔 | 其他 | CM58 | 1 | CM58 W14 頸部3 |  |
| 916 | C0811 | Pharyngotympanic tube opening | 耳咽管開口 | 其他 | CM58 | 1 | CM58 W14 頸部3 |  |
| 917 | C0815 | Root of tongue | — | 其他 | CM58 | 1 | CM58 W14 頸部3 | OCR（只見於圖面辨識，名稱可能有誤） |
| 918 | C0816 | Piriform recess | — | 腔隙／區域 | CM58 | 1 | CM58 W14 頸部3 | OCR（只見於圖面辨識，名稱可能有誤） |
| 919 | C0819 | Torus of pharyngotympanic tube | — | 其他 | CM58 | 1 | CM58 W14 頸部3 | OCR（只見於圖面辨識，名稱可能有誤） |
| 920 | C0820 | Ridge of levator veli palatini | — | 其他 | CM58 | 1 | CM58 W14 頸部3 | OCR（只見於圖面辨識，名稱可能有誤） |
| 921 | C0821 | Palatine glands | — | 腺體 | CM58 | 1 | CM58 W14 頸部3 | OCR（只見於圖面辨識，名稱可能有誤） |
| 922 | C0822 | Dorsum of tongue | — | 其他 | CM58 | 1 | CM58 W14 頸部3 | OCR（只見於圖面辨識，名稱可能有誤） |
| 923 | C0824 | Tonsillar bed | 扁桃體窩 | 腔隙／區域 | CM58 | 1 | CM58 W14 頸部3 |  |
| 924 | C0835 | Paratracheal lymph nodes | 旁氣管淋巴結 | 其他 | CM58 | 1 | CM58 W14 頸部3 |  |

## 已排除（不在頭頸範圍）

| 名稱 | 原因 |
| --- | --- |
| Sternum／胸骨 | 胸部、上肢帶或臨床處置點 |
| First costal cartilage／— | 胸部、上肢帶或臨床處置點 |
| Aortic arch／主動脈弓 | 胸部、上肢帶或臨床處置點 |
| Axillary artery／腋動脈 | 胸部、上肢帶或臨床處置點 |
| Suprascapular notch／肩胛上切跡 | 胸部、上肢帶或臨床處置點 |
| Superior vena cava／上腔靜脈 | 胸部、上肢帶或臨床處置點 |
| Sternoclavicular joint／— | 胸部、上肢帶或臨床處置點 |
| Bronchi／支氣管 | 胸部、上肢帶或臨床處置點 |
| Branches of internal thoracic artery／內胸動脈分支 | 胸部、上肢帶或臨床處置點 |
| Long thoracic nerve／胸長神經 | 胸部、上肢帶或臨床處置點 |
| Pectoralis major muscle／— | 胸部、上肢帶或臨床處置點 |
| Suprascapular vessels／肩胛上血管 | 胸部、上肢帶或臨床處置點 |
| Central venous catheter site／中央靜脈導管 | 胸部、上肢帶或臨床處置點 |
| Pneumothorax／氣胸 | 胸部、上肢帶或臨床處置點 |
| 1st rib／第一肋骨 | 胸部、上肢帶或臨床處置點 |
| 2nd rib／第二肋骨 | 胸部、上肢帶或臨床處置點 |
| Scapula／肩胛骨 | 胸部、上肢帶或臨床處置點 |
| Ligamentum arteriosum／動脈韌帶 | 胸部、上肢帶或臨床處置點 |
| First thoracic ganglion／第一胸神經結 | 胸部、上肢帶或臨床處置點 |
| Internal thoracic artery branches (to trachea)／胸廓內動脈分支 | 胸部、上肢帶或臨床處置點 |
