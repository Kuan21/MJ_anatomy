# 頭頸名稱差異拆分（同義異名／真的不同）

內部文件，不上網站，不含任何課程資料原文，只列結構名稱、分類與建議；依據 `docs/quiz-head-neck-notes-classification.md` 第二節的 150 筆名稱衝突（2026-11-15 使用者授權：異體字、筆誤由我直接處理，兩邊其實指不同結構的才交給使用者）。本檔只做決定與清單，**沒有修改任何網站資料**；套用到網站由後續實作 PR 處理。報告不宣稱已對照任何書籍，中文統一名稱是依台灣解剖學教學常用說法與網站現有用詞判斷，請使用者最後核對。

## 一、各類型筆數

| 最終類型 | 筆數 | 處理 |
| --- | --- | --- |
| 同義異名 | 97 | 同一構造、兩邊用詞不同：統一一個名稱，另一個列為別名（搜尋與打字題都收） |
| 異體字或拼法 | 24 | 同一構造，只是字形或拼法不同：統一字形，另一寫法列為別名 |
| 筆誤 | 27 | 用正確名稱，錯誤寫法只記在內部備註，不當別名 |
| 真的不同 | 2 | 兩邊疑似指不同結構或範圍：交給使用者（第四節） |
| 合計 | 150 | 與原表 150 筆一致 |

與原表（22 異體字、103 意思不同、25 筆誤）的差異：
- 異體字或拼法→異體字或拼法：22 筆
- 筆誤→課程資料明顯筆誤：25 筆
- 意思不同→同義異名：97 筆
- 意思不同→真的不同：2 筆
- 意思不同→筆誤：2 筆
- 意思不同→異體字或拼法：2 筆

重新檢視後，原本標「意思不同」的 103 筆中，絕大多數是同一構造的不同用詞（多為用詞長短、詞序、「頜／顎」字形、別稱的差別），只有 2 筆（枕內隆突／嵴、頦下／下頷淋巴結）無法確定是否同一構造，另有 2 個不影響分類的附帶問題（第四節 Q3、Q4）。

## 二、統一名稱的原則

1. 採台灣解剖學教學常用說法；網站已有中文名的，優先沿用網站現名（記在「網站現名」欄），除非明顯不標準。
2. 字形：「頜」（下頜、上頜）與網站主體一致（原始碼約 79 處用頜、21 處用頷），統一用頜；「顎」（顎、顎骨、顳顎關節）與網站統一命名資料與 MOE 字形一致，統一用顎，「腭」「頷」列為別名；「雍」「隔」「板」「襻」「杓」亦依此。網站現在兩種並存（例如提顎帆肌／提腭帆肌、顳顎關節／軟腭），實作時一併統一。這項字形選擇若使用者想反過來，只需換字，見第四節 Q3。
3. 別名只收「同一構造」的寫法；有歧義的簡寫（例如「上顎」是上頜、「舌骨韌帶」是通稱、「下頜神經節」會與下頜神經混淆）不收為別名。
4. 筆誤的錯寫不當別名。

## 三、要套用的清單（148 筆）

「網站現名」欄是我在原始碼的對照表（`app/mj-structure-info.ts`、`app/mj-zh-*.ts`、`app/mj-naming-data.ts`（由命名資料自動生成）、`app/quiz/*`、`app/mj-eye-atlas.ts` 等）找到的中文名與位置；「—」是沒有在原始碼對照表找到（圖譜 3D 網格的名稱由英文名對應，實作 PR 需再查實際顯示名稱）。「已一致」代表不用改，只需確認別名已被搜尋與 Quiz 收錄。「序」是原表流水號。

| 類型 | 序 | 結構（英文） | 統一中文名 | 別名（搜尋與打字題收錄） | 網站現名（位置） | 備註 |
| --- | --- | --- | --- | --- | --- | --- |
| 同義異名 | 1 | Facial expression muscle (Mimetic muscle) | 顏面表情肌 | 顏面肌、表情肌 | — |  |
| 同義異名 | 3 | Second pharyngeal arch | 第二咽弓 | 第二對咽弓 | — |  |
| 同義異名 | 29 | Levator anguli oris | 提口角肌 | 提嘴角肌 | 提口角肌（mj-structure-info.ts、mj-muscle-facts-head-neck.ts、mj-facial-layers.ts） | 已一致 |
| 同義異名 | 53 | Marginal mandibular branch | 下頜邊緣支 | 邊緣下頜支、下頷邊緣支、下頜緣支 | — |  |
| 同義異名 | 56 | Facial artery | 顏面動脈 | 面動脈 | 顏面動脈（mj-muscle-facts-head-neck.ts、quiz/catalogue.ts） | 已一致 |
| 同義異名 | 65 | Transverse facial artery | 顏面橫動脈 | 橫顏動脈、面橫動脈 | — |  |
| 同義異名 | 69 | Facial vein | 顏面靜脈 | 顏面部靜脈、面靜脈 | — |  |
| 同義異名 | 97 | Great auricular nerve | 耳大神經 | 大耳神經 | 耳大神經（mj-structure-info.ts、mj-zh-extra.ts、quiz/catalogue.ts、quiz/headneck.ts） | 已一致；Quiz 缺大耳神經別名（quiz/synonyms.ts） |
| 同義異名 | 155 | Dens | 齒突 | 齒狀突 | 齒突（quiz/card-data.ts） | 已一致 |
| 同義異名 | 177 | Carotid sheath | 頸動脈鞘 | 頸動脈鞘膜 | — |  |
| 同義異名 | 178 | Alar fascia | 翼狀筋膜 | 翼筋膜 | — |  |
| 同義異名 | 180 | Danger space | 危險間隙 | 危險空間 | — |  |
| 同義異名 | 192 | Ansa cervicalis | 頸襻 | 舌下神經頸襻、頸攀 | — | 三寫法同一構造；「襻／攀」另屬異體字 |
| 同義異名 | 196 | Brachiocephalic trunk | 頭臂動脈幹 | 頭臂幹 | 頭臂動脈幹（quiz/card-data.ts）；頭臂幹（quiz/synonyms.ts） | 已一致，別名已有 |
| 同義異名 | 198 | Circle of Willis | 大腦動脈環 | 威利氏環、威利斯環、Circle of Willis（英文主名） | —（未找到中文名） |  |
| 同義異名 | 200 | Thyrocervical trunk | 甲狀頸動脈幹 | 甲狀頸幹 | 甲狀頸動脈幹（mj-zh-anatomy.ts） | 已一致；與頭臂動脈幹用詞同型 |
| 同義異名 | 205 | Costocervical trunk | 肋頸動脈幹 | 肋頸幹 | 肋頸動脈幹（mj-zh-anatomy.ts） | 已一致 |
| 同義異名 | 214 | Carotid canal | 頸動脈管 | 頸動脈孔 | 頸動脈管（mj-paokao.json） | 已一致 |
| 同義異名 | 216 | Superior laryngeal artery | 喉上動脈 | 上喉動脈 | 喉上動脈（mj-muscle-facts-head-neck.ts） | 已一致 |
| 同義異名 | 225 | Communicating branch | 交通支 | 交通枝 | 交通支（mj-eye-atlas.ts、quiz/catalogue.ts 等） | 已一致 |
| 同義異名 | 256 | Lateral pterygoid plate | 外翼板 | 翼外板、翼突外側板、外側翼板 | 外翼板（mj-muscle-facts-head-neck.ts） | 已一致 |
| 同義異名 | 269 | Maxillary tuberosity | 上頜結節 | 上頷粗隆、上頜粗隆 | 上頜結節（mj-muscle-facts-head-neck.ts） | 已一致 |
| 同義異名 | 281 | Mylohyoid nerve | 下頜舌骨肌神經 | 顎舌骨肌神經、下頷舌骨神經、下頜舌骨神經 | —（網站肌肉名為下頜舌骨肌） | 隨肌肉名；M66 的「顎」為頜之誤用 |
| 同義異名 | 285 | Submandibular ganglion | 下頜下神經節 | 下頷神經節、下頜下神經節 | — | M66 省略「下」；別名不可寫成下頜神經節（會與下頜神經混淆） |
| 同義異名 | 316 | Nasopharynx | 鼻咽 | 鼻咽部 | —（mj-muscle-facts-head-neck.ts 文字內有鼻咽） |  |
| 同義異名 | 317 | Greater palatine foramen | 顎大孔 | 腭大孔、大顎孔、大腭孔 | — | CM58 詞序不同；與顎小孔成對用詞 |
| 同義異名 | 321 | Meningeal branch of CN V2 | 腦膜支 | 腦膜分支 | — |  |
| 同義異名 | 338 | Palatine tonsil | 顎扁桃體 | 扁桃體、顎扁桃、腭扁桃體 | 扁桃體（mj-zh-extra2.ts） | 網站現名過寬，易與咽扁桃體、扁桃體環混淆，建議改顎扁桃體 |
| 同義異名 | 341 | Paranasal sinuses | 副鼻竇 | 鼻竇 | — |  |
| 同義異名 | 342 | Pharynx | 咽 | 咽部 | — |  |
| 同義異名 | 343 | Palate | 顎 | 上腭 | — | 別名不寫「上顎」（上顎＝上頜） |
| 同義異名 | 347 | Lacrimal nerve | 淚腺神經 | 淚神經、眼神經淚腺支 | 淚腺神經（mj-eye-atlas.ts、mj-structure-info.ts） | 已一致 |
| 同義異名 | 359 | Maxillary sinus | 上頜竇 | 上顎竇、上頷竇 | — | 頜／顎異體字 |
| 同義異名 | 373 | Lingula of mandible | 下頜小舌 | 小舌突、下頷骨小舌、下頜骨小舌 | — |  |
| 同義異名 | 377 | Articular tubercle | 關節結節 | 關節隆起 | — | CM58 的描述句不是名稱，不收為別名 |
| 同義異名 | 385 | Epidural space | 硬膜外腔 | 硬膜上腔、硬膜上空間 | — |  |
| 同義異名 | 386 | Subdural space | 硬膜下腔 | 硬膜下空間 | — |  |
| 同義異名 | 387 | Epidural hematoma | 硬膜外血腫 | 硬膜上血腫 | — |  |
| 同義異名 | 390 | Periosteal layer | 骨膜層 | 外骨膜層 | — |  |
| 同義異名 | 391 | Meningeal layer | 腦膜層 | 內腦膜層 | — |  |
| 同義異名 | 403 | Transverse fissure | 大腦橫裂 | 橫裂 | — |  |
| 同義異名 | 409 | Pituitary gland | 腦下垂體 | 腦垂體、垂體 | 腦下垂體（mj-zh-extra.ts、quiz/headneck.ts） | 已一致 |
| 同義異名 | 416 | Hypoglossal canal | 舌下神經管 | 舌下神經孔 | — |  |
| 同義異名 | 418 | Arachnoid granulation (Arachnoid villi) | 蛛網膜顆粒 | 蛛網膜絨毛、蜘蛛膜顆粒 | —（organ/csf-notes.ts 用蛛網膜） |  |
| 同義異名 | 423 | Pineal gland | 松果體 | 松果腺 | 松果體（mj-zh-extra.ts）；松果腺（mj-zh-extra2.ts） | 兩處不一致，mj-zh-extra2.ts 改為松果體 |
| 同義異名 | 453 | Median aperture | 正中孔 | 正中開口 | 正中孔（organ/csf-notes.ts、organ/csf-scene.ts） | 已一致 |
| 同義異名 | 454 | Lateral aperture | 外側孔 | 外側開口 | 外側孔（organ/csf-notes.ts、organ/csf-scene.ts） | 已一致 |
| 同義異名 | 455 | Cervical part of ICA | 頸段（內頸動脈） | 頸區 | — |  |
| 同義異名 | 456 | Petrous part of ICA | 岩段（內頸動脈） | 岩狀區、岩樣段 | — |  |
| 同義異名 | 457 | Cavernous part of ICA | 海綿竇段（內頸動脈） | 海綿區 | — |  |
| 同義異名 | 458 | Cerebral part of ICA | 大腦段（內頸動脈） | 腦區 | — |  |
| 同義異名 | 462 | Optic canal | 視神經管 | 視神經孔 | 視神經管（mj-eye-atlas.ts） | 已一致 |
| 同義異名 | 468 | Confluence of sinuses | 竇匯 | 匯竇、靜脈竇匯合 | — |  |
| 同義異名 | 474 | Superior orbital fissure | 眶上裂 | 上眶裂 | 眶上裂（mj-eye-atlas.ts） | 已一致 |
| 同義異名 | 475 | Petrous part of the temporal bone | 顳骨岩部 | 顳骨岩樣部 | 顳骨岩部（mj-muscle-facts-head-neck.ts、mj-paokao.json） | 已一致 |
| 同義異名 | 506 | Semilunar hiatus | 半月裂孔 | 半月裂 | — |  |
| 同義異名 | 525 | Extraocular muscle | 眼外肌 | 眼部外在肌、眼外在肌 | 眼外肌（mj-eye-atlas.ts） | 已一致 |
| 同義異名 | 542 | Common tendinous ring (Annular ring) | 總腱環 | 津氏環、環狀腱 | 總腱環（mj-eye-atlas.ts、mj-zh-extra.ts） | 已一致 |
| 同義異名 | 550 | Superior tarsal muscle | 上瞼板肌 | 苗勒氏肌、瞼上肌 | 上瞼板肌（原始碼文字內出現） | 兩個系列的寫法都不是 Taiwan 通用名，採上瞼板肌，兩者皆為別名 |
| 同義異名 | 554 | Excretory ducts of lacrimal gland | 淚腺排泄管 | 淚腺外分泌管、外泌管 | — |  |
| 同義異名 | 588 | Superior division of oculomotor nerve | 動眼神經上支 | 動眼神經上分支 | — |  |
| 同義異名 | 589 | Inferior division of oculomotor nerve | 動眼神經下支 | 動眼神經下分支 | — |  |
| 同義異名 | 599 | Infratrochlear nerve | 滑車下神經 | 下滑車神經 | 滑車下神經（mj-structure-info.ts） | 已一致 |
| 同義異名 | 612 | Oval window | 卵圓窗 | 前庭窗 | — |  |
| 同義異名 | 614 | Round window | 圓窗 | 耳蝸窗 | — |  |
| 同義異名 | 623 | Stapedius nerve | 鐙骨肌神經 | 鐙骨神經 | — |  |
| 同義異名 | 626 | Perilymph | 外淋巴 | 外淋巴液 | — |  |
| 同義異名 | 628 | Endolymph | 內淋巴 | 內淋巴液 | — |  |
| 同義異名 | 651 | Cochlear nerve (ganglion) | 耳蝸神經 | 蝸神經 | 耳蝸神經（mj-zh-extra2.ts、quiz/headneck.ts） | 已一致 |
| 同義異名 | 686 | Submandibular lymph nodes | 下頜下淋巴結 | 頷下淋巴結、下頷下淋巴結 | — |  |
| 同義異名 | 698 | Dentin | 牙本質 | 齒質、象牙質 | — |  |
| 同義異名 | 699 | Cement | 牙骨質 | 齒堊質、牙堊質 | — |  |
| 同義異名 | 710 | Submandibular duct | 下頜下腺管 | 下頷下腺管、下頷下腺導管、下頜下腺導管 | — |  |
| 同義異名 | 723 | Tracheal smooth muscle | 氣管肌 | 氣管平滑肌 | — | 英文主名 Trachealis muscle |
| 同義異名 | 729 | Cervical sympathetic ganglia | 頸交感神經節 | 上中下頸交感神經節 | — | M66 逐一列出上、中、下三個，CM58 用總稱；上、中、下三個仍各自為子項 |
| 同義異名 | 733 | Tonsillar ring | 扁桃體環 | 扁桃體（淋巴環）、淋巴環、咽淋巴環 | — |  |
| 同義異名 | 737 | Tonsillar artery | 扁桃體動脈 | 扁桃動脈 | — |  |
| 同義異名 | 741 | Pharyngoepiglottic fold | 咽會厭皺襞 | 咽會厭軟骨折 | — | M66 的「軟骨折」疑為「皺襞」誤寫，不當別名 |
| 同義異名 | 743 | Pharyngeal tonsil | 咽扁桃體 | 咽扁桃腺、腺樣體 | — |  |
| 同義異名 | 745 | Submandibular triangle | 下頜下三角 | 頷下三角、下頷下三角 | — |  |
| 同義異名 | 752 | Stylohyoid ligament | 莖突舌骨韌帶 | 莖舌骨韌帶、舌骨韌帶（CM58 簡寫） | 莖突舌骨韌帶（mj-zh-extra.ts） | 已一致；CM58 的「舌骨韌帶」是簡寫，不收為別名 |
| 同義異名 | 763 | Larynx | 喉 | 喉部 | — |  |
| 同義異名 | （英文表） | Thyroid prominence | 喉結（Laryngeal prominence） | Thyroid prominence、甲狀突起、Adam's apple | — |  |
| 同義異名 | （英文表） | Circle of Willis | 大腦動脈環（Circle of Willis） | Willis' circle、Cerebral arterial circle、威利氏環 | — |  |
| 同義異名 | （英文表） | Inferior orbital fissure | 眶下裂（Inferior orbital fissure） | Infraorbital fissure | 眶下裂（原始碼文字內出現） |  |
| 同義異名 | （英文表） | Pineal gland | 松果體（Pineal gland） | Pineal body、松果腺 | 見序 423 |  |
| 同義異名 | （英文表） | Turbinate (Nasal conchae) | 鼻甲（Nasal concha） | Turbinate、Concha、Nasal conchae | — |  |
| 同義異名 | （英文表） | Superior tarsal muscle | 上瞼板肌（Superior tarsal muscle） | Muller's muscle、苗勒氏肌 | 見序 550 |  |
| 同義異名 | （英文表） | Epiglottic cartilage | 會厭（Epiglottis） | Epiglottic cartilage、會厭軟骨 | — | Quiz 名稱為 Epiglottis，不改 |
| 同義異名 | （英文表） | Superior division of oculomotor nerve | Superior／Inferior branch of oculomotor nerve | Superior／Inferior division of oculomotor nerve | Quiz 用 branch | 英文跟 Quiz 用 branch |
| 同義異名 | （英文表） | Anterior branch of CN V3 | 下頜神經前股／後股（Anterior／Posterior division of mandibular nerve） | Anterior／Posterior branch of CN V3、前支、後支 | 下頷神經前股、後股（mj-zh-extra.ts）；Quiz 用 division（前股、後股） | 英文維持 division，中文「頷」改「頜」 |
| 同義異名 | （英文表） | Dural partitions | 硬腦膜分隔（Dural partitions） | Dural infoldings | — |  |
| 同義異名 | （英文表） | Pharyngotympanic tube | 咽鼓管（Pharyngotympanic tube） | Auditory tube、Eustachian tube、耳咽管 | 咽鼓管（mj-zh-extra.ts、mj-muscle-facts-head-neck.ts） | 已一致 |
| 同義異名 | （英文表） | Glossopalatine arch | 顎舌弓（Palatoglossal arch） | Glossopalatine arch、腭舌弓 | — |  |
| 同義異名 | （英文表） | Common tendinous ring (Annular ring) | 總腱環（Common tendinous ring） | Annular ring、津氏環、環狀腱 | 見序 542 |  |
| 同義異名 | （英文表） | Pterygoid venous plexus | 翼靜脈叢（Pterygoid venous plexus） | Pterygoid plexus、翼狀靜脈叢 | — |  |
| 同義異名 | （英文表） | Tracheal smooth muscle | 氣管肌（Trachealis muscle） | Tracheal smooth muscle、氣管平滑肌 | 見序 723 |  |
| 異體字或拼法 | 23 | Depressor septi nasi | 降鼻中隔肌 | 降鼻中膈肌 | 降鼻中隔肌（mj-structure-info.ts） | 已一致，不用改 |
| 異體字或拼法 | 87 | Submandibular gland | 下頜下腺 | 下頷下腺、顎下腺 | 頷下腺（mj-zh-extra.ts） | 改為下頜下腺 |
| 異體字或拼法 | 261 | Angle of mandible | 下頜角 | 下頷角、下頜骨角、下頷骨角 | —（未在原始碼對照表找到） |  |
| 異體字或拼法 | 318 | Lesser palatine foramen | 顎小孔 | 腭小孔 | — |  |
| 異體字或拼法 | 320 | Pterygopalatine ganglion | 翼顎神經節 | 翼腭神經節 | — |  |
| 異體字或拼法 | 333 | Nasopalatine nerve | 鼻顎神經 | 鼻腭神經 | — |  |
| 異體字或拼法 | 334 | Greater palatine nerve | 顎大神經 | 腭大神經 | — |  |
| 異體字或拼法 | 335 | Lesser palatine nerve | 顎小神經 | 腭小神經 | — |  |
| 異體字或拼法 | 337 | Uvula | 懸雍垂 | 懸壅垂 | 懸雍垂（mj-structure-info.ts、mj-muscle-facts-head-neck.ts） | 已一致；mj-related-search.json 有壅垂寫法，保留為別名 |
| 異體字或拼法 | 348 | Sphenopalatine artery | 蝶顎動脈 | 蝶腭動脈 | — |  |
| 異體字或拼法 | 349 | Nasopalatine artery | 鼻顎動脈 | 鼻腭動脈 | — |  |
| 異體字或拼法 | 354 | Descending palatine artery (Greater palatine artery) | 降顎動脈 | 降腭動脈 | — | M66 括號寫「大顎動脈」，見待使用者表 Q4，不當別名 |
| 異體字或拼法 | 355 | Lesser palatine artery | 小顎動脈 | 小腭動脈 | — |  |
| 異體字或拼法 | 407 | Sellar diaphragm | 鞍隔 | 鞍膈 | — |  |
| 異體字或拼法 | 487 | Perpendicular plate of ethmoid bone | 篩骨垂直板 | 篩骨垂直版 | — |  |
| 異體字或拼法 | 508 | Greater palatine artery | 大顎動脈 | 大腭動脈 | — |  |
| 異體字或拼法 | 675 | Palatoglossus muscle | 顎舌肌 | 腭舌肌 | — |  |
| 異體字或拼法 | 750 | Pterygomandibular raphe | 翼下頜縫 | 翼下頷縫 | 翼下頷縫（mj-zh-extra.ts） | 改為翼下頜縫 |
| 異體字或拼法 | 764 | Arytenoid cartilage | 杓狀軟骨 | 勺狀軟骨 | 杓狀軟骨（mj-zh-extra.ts） | 已一致 |
| 異體字或拼法 | （英文表） | Semilunar hiatus | 半月裂孔（Semilunar hiatus） | Semilunaris hiatus | — |  |
| 異體字或拼法 | （英文表） | Zonular fibers | 小帶纖維（Zonular fibers） | Zonula fibers | — |  |
| 異體字或拼法 | （英文表） | Abducens nerve (CN VI) | 外旋神經（Abducens nerve） | Abducent nerve、外展神經、展神經 | 外旋神經（mj-zh-extra2.ts、mj-eye-atlas.ts、quiz/headneck.ts）；外展神經（mj-cranial-search.ts、mj-muscle-facts-head-neck.ts） | 網站兩種並存，統一為外旋神經，外展神經為別名 |
| 異體字或拼法 | （英文表） | Linguofacial trunk | 舌顏動脈幹（Linguofacial trunk） | Linguo-facial trunk | — | 連字號 |
| 異體字或拼法 | （英文表） | Great auricular nerve | 耳大神經（Great auricular nerve） | Greater auricular nerve、大耳神經 | 見序 97 | 英文拼法 Great／Greater，網站用 Great |
| 筆誤 | 15 | Orbital part | 眶部 | 框部 | — | CM58 筆誤 |
| 筆誤 | 18 | Corrugator supercilii | 皺眉肌 | Corrugator supercilli（筆誤） | 皺眉肌（mj-structure-info.ts、mj-muscle-facts-head-neck.ts） |  |
| 筆誤 | 39 | Ophthalmic nerve (CN V1) | 眼神經 | 視神經（筆誤） | 眼神經（mj-structure-info.ts、quiz/headneck.ts） |  |
| 筆誤 | 83 | Maxillary vein | 上頜靜脈 | 下頷靜脈（筆誤） | — |  |
| 筆誤 | 99 | Otic ganglion | 耳神經節 | Optic ganglion（筆誤） | — |  |
| 筆誤 | 104 | Internal carotid artery | 內頸動脈 | 內頸靜脈（筆誤） | 內頸動脈（mj-zh-extra.ts） |  |
| 筆誤 | 138 | Recurrent laryngeal nerve | 喉返神經 | Reccurent laryngeal n.（筆誤） | — |  |
| 筆誤 | 231 | Supraclavicular nerve | 鎖骨上神經 | 上肩胛神經（筆誤） | — |  |
| 筆誤 | 253 | Styloid process | 莖突 | 顴骨莖突（筆誤） | — |  |
| 筆誤 | 290 | Lesser petrosal nerve | 小岩神經 | Lessor petrosal n.（筆誤） | — |  |
| 筆誤 | 343 | Palate | 顎 | 鄂部（筆誤） | — | 另有 343 同義異名列 |
| 筆誤 | 413 | Ophthalmic artery | 眼動脈 | 視神經（筆誤） | 眼動脈（mj-zh-extra.ts） | 原備註寫「應為眼神經」有誤，正確為眼動脈 |
| 筆誤 | 473 | Sphenoparietal sinus | 蝶頂竇 | 蝶竇（筆誤） | — |  |
| 筆誤 | 474 | Superior orbital fissure | 眶上裂 | 英文與下眶裂配錯（筆誤） | 眶上裂（mj-eye-atlas.ts） | 同結構另有同義異名列 |
| 筆誤 | 515 | Ophthalmic vein | 眼靜脈 | 視神經（筆誤） | — | 原備註寫「應為眼神經」有誤，正確為眼靜脈 |
| 筆誤 | 610 | Malleus | 錘骨 | 錘鼓（筆誤） | — |  |
| 筆誤 | 611 | Stapes | 鐙骨 | Stampes（筆誤） | — |  |
| 筆誤 | 630 | Semicircular duct | 半規管 | Semilunar duct（筆誤） | — |  |
| 筆誤 | 650 | Vestibulocochlear nerve (CN VIII) | 前庭耳蝸神經 | CN VII（圖面筆誤） | — |  |
| 筆誤 | 654 | Oral cavity | 口腔 | Oval cavity（筆誤） | — |  |
| 筆誤 | 656 | Hard palate | 硬顎 | Hard plate（筆誤） | — |  |
| 筆誤 | 657 | Soft palate | 軟顎 | Soft plate（筆誤） | 軟顎（mj-muscle-facts-head-neck.ts 用顎，mj-zh-anatomy.ts 有軟腭） | 統一為顎 |
| 筆誤 | 717 | Palatopharyngeal arch | 顎咽弓 | pharynopalatine arch（筆誤） | — |  |
| 筆誤 | 718 | Levator veli palatini muscle | 提顎帆肌 | 提腭帆肌、提鄂帆肌（M66 筆誤） | 提腭帆肌（mj-structure-info.ts、mj-zh-anatomy.ts、mj-muscle-facts-head-neck.ts）；提顎帆肌（mj-naming-data.ts） | 網站兩種並存；M66 的「鄂」是錯字 |
| 筆誤 | 753 | Palatine aponeurosis | 顎腱膜 | 腭腱膜、硬腱膜（M66 疑為筆誤） | 腭腱膜（mj-muscle-facts-head-neck.ts 文字內） | 顎／腭異體；M66 的「硬腱膜」疑為誤寫 |
| 筆誤 | （英文表） | Median aperture | 正中孔（Median aperture） | Medial aperture（筆誤） | — |  |
| 筆誤 | （英文表） | Dura mater | 硬腦膜（Dura mater） | Dural mater（筆誤） | — |  |

## 實作 PR 要改動的網站現名（第三節中已知與統一名稱不同的）

- 序 87 Submandibular gland：頷下腺（mj-zh-extra.ts）→ 下頜下腺
- 序 750 Pterygomandibular raphe：翼下頷縫（mj-zh-extra.ts）→ 翼下頜縫
- 序 338 Palatine tonsil：扁桃體（mj-zh-extra2.ts）→ 顎扁桃體（原名範圍過寬，與咽扁桃體、扁桃體環易混）
- 序 423 Pineal gland：松果腺（mj-zh-extra2.ts）→ 松果體（mj-zh-extra.ts 已是松果體）
- 序 718 Levator veli palatini：提腭帆肌（mj-structure-info.ts、mj-zh-anatomy.ts、mj-muscle-facts-head-neck.ts）與提顎帆肌（mj-naming-data.ts）並存 → 統一為提顎帆肌，張顎帆肌、顎咽肌、顎舌肌同樣處理
- 英文表 Abducens nerve：外展神經（mj-cranial-search.ts、mj-muscle-facts-head-neck.ts）與外旋神經並存 → 統一為外旋神經
- 英文表 Anterior／Posterior branch of CN V3：下頷神經前股、後股（mj-zh-extra.ts）→ 下頜神經前股、後股
- 序 656、657 Hard／Soft palate 等含腭字的現名（mj-structure-info.ts、mj-muscle-facts-head-neck.ts、mj-zh-anatomy.ts、mj-zh-extra.ts）→ 統一用顎
- 凡含「頷」的現名（mj-zh-extra.ts、mj-zh-extra2.ts、mj-structure-info.ts、mj-search.ts、quiz/brain.ts）→ 統一用頜

（其餘已知現名與統一名稱相同，不用改，只需補別名。）

## 四、給使用者決定的項目（真的不同／不確定）

| 編號 | 結構 | 問題 | 我的建議 |
| --- | --- | --- | --- |
| Q1 | Internal occipital crest（序 401） | M66 用「枕內隆突」同時指兩個構造：小腦鐮的後附著處（crest，嵴）與橫竇溝附近的隆凸（protuberance）；CM58 只在小腦鐮處寫「枕內嵴」。兩者是不同的骨性標誌 | 分成兩個結構：枕內嵴（Internal occipital crest）與枕內隆凸（Internal occipital protuberance）；「枕內隆突」不當別名；請確認考試範圍是否兩個都要 |
| Q2 | Submental lymph nodes（序 685） | M66 寫「頦下淋巴結」；CM58 在頦下三角沒有對應的淋巴結名稱，只有「下頷下淋巴結」，原表把 CM58 的某個「下頷…淋巴結」配成同一筆，疑為配錯 | 兩組淋巴結分開：頦下淋巴結（序 685）與下頜下淋巴結（序 686）；685 只用 M66 的寫法，不加 CM58 別名 |
| Q3（附帶） | 全站字形：頜／頷、顎／腭 | 網站現在兩種並存，兩個系列也各用各的；我依網站多數與台灣常見字形選了「頜」「顎」 | 若使用者偏好另一種字形，只要換字；別名兩種都收，搜尋不受影響 |
| Q4（附帶） | Descending palatine artery（序 354）與 Greater palatine artery（序 508） | M66 在「降顎動脈」後面括號寫「大顎動脈」，把降顎動脈與大顎動脈當成同一條；解剖上降顎動脈是主幹，分出大顎（大腭）動脈與小顎動脈 | 兩條分開；降顎動脈不把「大顎動脈」列為別名；序 354、508 的字形異體仍照第三節處理 |

沒有其他「真的不同」的項目：其餘 148 筆我都判斷為同一構造（同義異名、字形、筆誤）。字形類依第二節原則處理，沒有另列為不確定。

## 五、英文名稱表（原第二節 2.2）的結論

- 22 筆英文衝突中：筆誤 2（Median aperture、Dura mater），拼法 5（Semilunar hiatus、Zonular fibers、Abducens／Abducent、Linguofacial trunk、Great／Greater auricular），其餘 15 筆為同義異名。
- 英文主名：沿用網站 Quiz 現用名（Epiglottis、Superior／Inferior branch of oculomotor nerve、Anterior／Posterior division of mandibular nerve、Pharyngotympanic tube、Great auricular nerve），另一寫法列為英文別名；Thyroid prominence 與 Laryngeal prominence 同一構造，中文喉結。
- 英文別名也要被搜尋與打字題接受（見第三節別名欄）。

## 六、後續

- 實作 PR（另開）：依第三節在 `app/quiz/synonyms.ts`、搜尋別名（`app/mj-related-search.json`、`app/mj-search.ts`）與上述對照表補別名並統一現名；改動屬名稱資料，依 CLAUDE.md 規則 CI 全綠後可自動合併，改到顯示的解剖內容則須人工審核。
- Q1、Q2 等使用者回覆後，再決定是否新增結構。
