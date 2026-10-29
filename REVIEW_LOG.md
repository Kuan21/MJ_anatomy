# REVIEW_LOG

最後更新：2026-10-29。規則：只改介面、效能、腳本、文件的 PR 在 `build` 通過後自動 merge；涉及模型、示意模型、解剖內容、名稱、Quiz 資料的 PR 標【需人工審核】，**一律不開 auto-merge**，等你確認。

## 心臟 PR3：Quiz 判定與用語（需人工審核）

- **部分與整體**：點選或輸入題目的「其中一部分」（例如題目是肺動脈瓣，答成肺動脈瓣前瓣）或題目「所屬的整體」，判為「接近」，不算答對，列入錯題，並說明你答的是整體還是其中一部分。部分／整體的關係用構造名稱判斷（`X of Y` 的 X 是 Y 的一部分），規則在 `app/quiz/naming.ts` 的 `relationOf`，已有單元測試。
- **小目標優先（點選題）**：同一條視線上有多個構造時，取最前面表面 1.2 公分內最小（外框體積最小）的那個，瓣葉、乳突肌才點得到。不會偏向正確答案。
- **用語**：畫面、資料卡、Quiz 清單與檢查腳本中的「MJ 補建」「MJ-built」一律改為「示意構造」「schematic」。
- **上、下腔靜脈縮短**（心臟詳細模式與 Quiz 同一份模型）：上腔靜脈只保留到心房上緣上方約 1.7 公分（y ≤ 1.362），下腔靜脈只保留到心房下緣下方約 2.4 公分（y ≥ 1.222）。切口數值請核對。

## 最新進度（2026-10-29）

### 已 merge（你已確認，squash）
| PR | 內容 |
| --- | --- |
| [#101](https://github.com/Kuan21/MJ_anatomy/pull/101) | 主圖譜：移除腳下圓台、頂部區域列淺色背景、點標題重設 |
| [#102](https://github.com/Kuan21/MJ_anatomy/pull/102) | 頭顱內黃色碎塊移除（黑名單檢查 `check:no-intracranial`；粉紅整合腦保留） |
| [#103](https://github.com/Kuan21/MJ_anatomy/pull/103) | 移除錯誤的空間示意模型（不再畫出錯誤的空間體積） |
| [#104](https://github.com/Kuan21/MJ_anatomy/pull/104) | 骨性標記資訊卡欄位：所在骨骼／描述／附著構造／相關構造 |

### 已自動 merge（不涉及模型）
- #105 Workflow `runs-on` 固定為 `ubuntu-24.04`（main 部署已確認成功，build 與 deploy 均在 ubuntu-24.04 執行）。
- Quiz 第二級、鄰近構造淡天藍、心臟詳細模式版面（先前 PR）。

### 仍待做
- 特殊區域高亮（只亮形成空間的邊界、內容物一起亮、鏡頭自動轉角度）：新 PR，需人工審核。
- 跑考範圍：子宮韌帶示意模型重做、足部神經與踝伸肌支持帶。
- 上肢關節動作（肩外展 168°、內旋 48° + 肘屈 140° 撕裂）。
- 心臟 PR1–3、結締組織 PR1–3、乳房、Undo、ROADMAP 第 0 步。

## 總覽

最後更新：2026-10-28（#93 合併後）。

### 已 merge（已審核）：你審核後授權合併
| PR | 內容 |
| --- | --- |
| [#87](https://github.com/Kuan21/MJ_anatomy/pull/87) | 女性骨盆器官：膀胱、輸尿管、尿道、腹膜陷凹、器官分色 |
| [#92](https://github.com/Kuan21/MJ_anatomy/pull/92) | 腦部清單分層、全部構造清單與資訊卡、第四腦室（原版；你的審核意見在 #95） |
| [#93](https://github.com/Kuan21/MJ_anatomy/pull/93) | 膝部肌腱與韌帶：股四頭肌腱、髕韌帶、髕內／外側支持帶（已知限制：髕韌帶側視與髕骨尖之間有小縫隙、支持帶偏平片；全身肌腱／韌帶盒狀檢查尚未做） |

### 已 merge（需人工審核類，合併前我未取得你的審核；請補審）
- [#83](https://github.com/Kuan21/MJ_anatomy/pull/83) 血管表面平滑與靜脈補齊、[#85](https://github.com/Kuan21/MJ_anatomy/pull/85) 女性骨盆、[#81](https://github.com/Kuan21/MJ_anatomy/pull/81) CSF 粒子限制、[#77](https://github.com/Kuan21/MJ_anatomy/pull/77) 資訊卡欄位依結構類型：已 merge；我沒有開它們的 auto-merge，合併來源請你確認是否已審。
- [#76](https://github.com/Kuan21/MJ_anatomy/pull/76) 乳房改用 HuBMAP 等；#74、#73、#72、#71：先前輪次已合併，內容待你補審。

### 已自動 merge（不涉及模型）
[#91](https://github.com/Kuan21/MJ_anatomy/pull/91) 區域分頁、[#90](https://github.com/Kuan21/MJ_anatomy/pull/90) CSF 追蹤粒子、[#89](https://github.com/Kuan21/MJ_anatomy/pull/89) 腦部版面、[#88](https://github.com/Kuan21/MJ_anatomy/pull/88) 分頁標題、[#86](https://github.com/Kuan21/MJ_anatomy/pull/86) MOTION_AUDIT、[#84](https://github.com/Kuan21/MJ_anatomy/pull/84) REVIEW_LOG、[#82](https://github.com/Kuan21/MJ_anatomy/pull/82) 分層解剖面板、[#80](https://github.com/Kuan21/MJ_anatomy/pull/80)、[#79](https://github.com/Kuan21/MJ_anatomy/pull/79)、[#78](https://github.com/Kuan21/MJ_anatomy/pull/78)。

### 等你審核（未 merge）
| PR | 內容 | 請核對 |
| --- | --- | --- |
| [#95](https://github.com/Kuan21/MJ_anatomy/pull/95) | 依你的審核意見的腦部修改：腦葉分界溝裂（Borders）、英文資訊卡並依功能拆分、血液供應、Brodmann、第四腦室 | 見下方「待我核對」 |
| 分支 `mj-connective-layers` | 結締組織六層、掌腱膜／指滑車、骨間膜（尚未開 PR；#83 已 merge，下一步重新生成後開 PR） | — |

### 待我核對（#95）
- **Brodmann 分區**：你列為待核對的 9–12 與 46（prefrontal）、39（angular gyrus）、40（supramarginal gyrus）、23、24（cingulate gyrus）、28（entorhinal）、20、21（inferior／middle temporal gyrus）、37（occipitotemporal）、38（temporal pole）已加入；另外我在卡片寫了清單以外的 13、14（腦島）、25、27、29、30、31、32、34–36、47，也請核對。
- **血液供應**：清單以外、我依一般解剖寫的（腦神經、大腦腳底、尾狀核體與尾、視丘各核、垂體、硬腦膜動脈、杏仁核、韁核與松果腺）。
- **第四腦室**：示意重建；模型腦幹是實心網格，菱形底貼在背面。
- 模型沒有的結構（Preoccipital notch、Longitudinal fissure、下視丘各核團的獨立網格）沒有可點選卡片。

### Quiz 第二級「看結構寫名稱」（需人工審核：題庫與同義名稱表）
- **題庫範圍**：只有「有模型、有中文名、資料卡必填欄位完整、名稱在同一部位內唯一」的構造出題，合計 371 / 1047 個。排除的構造與原因逐項列在 [`docs/quiz-level2-pool.md`](docs/quiz-level2-pool.md)（由 `node scripts/report-quiz-level2.mjs` 產生，`npm run check` 會驗證它沒有過期）。排除最多的原因是資料卡欄位不完整（與 `docs/quiz-card-gaps.md` 一致）；資料補齊後會自動進入題庫。
- **判分規則**（請核對）：不分大小寫；忽略多餘空白、連字號、標點；忽略 the、muscle(s)；繁簡臺台視為相同；括號內別名與下表同義名稱都算對；英文、中文、不限三種作答語言；左右預設不要求（成對構造的 Left/Right 可省略），設定中可改為必須寫出；差 1–2 個字母（中文名四字以上差 1 字）判「接近正確」，顯示正確拼法並列入錯題；答案漏了「Left／Right」所屬的心房、心室（例如 atrium 對 Left atrium）判錯。
- **鄰近構造**：依模型邊界框距離，優先同系統，每題 2–3 個，可點擊高亮。

### Quiz 第二級同義名稱表（需人工審核，共 102 列）
以下是除了構造自己的英文名、中文名與括號內別名以外，額外接受的答案。依跑考摘要的寫法為先，其餘為通行別名；請逐列核對，有誤的告訴我刪改。程式表在 `app/quiz/synonyms.ts`。

| 構造（英文名，小寫，不含左右） | 額外接受的英文 | 額外接受的中文 |
| --- | --- | --- |
| right atrioventricular valve | tricuspid valve | 三尖瓣、右房室瓣 |
| left atrioventricular valve | mitral valve；bicuspid valve | 僧帽瓣、二尖瓣、左房室瓣 |
| anterior leaflet of right atrioventricular valve | anterior leaflet of tricuspid valve；anterior cusp of tricuspid valve | 三尖瓣前瓣 |
| inferior leaflet of right atrioventricular valve | posterior leaflet of tricuspid valve；inferior leaflet of tricuspid valve；posterior cusp of tricuspid valve | 三尖瓣後瓣 |
| septal leaflet of right atrioventricular valve | septal leaflet of tricuspid valve；septal cusp of tricuspid valve | 三尖瓣中隔瓣 |
| anterior leaflet of left atrioventricular valve | anterior leaflet of mitral valve；anterior cusp of mitral valve | 僧帽瓣前瓣、二尖瓣前瓣 |
| posterior leaflet of left atrioventricular valve | posterior leaflet of mitral valve；posterior cusp of mitral valve | 僧帽瓣後瓣、二尖瓣後瓣 |
| left coronary leaflet of aortic valve | left coronary cusp of aortic valve；left coronary cusp | 主動脈瓣左冠狀瓣、左冠狀瓣 |
| right coronary leaflet of aortic valve | right coronary cusp of aortic valve；right coronary cusp | 主動脈瓣右冠狀瓣、右冠狀瓣 |
| non-coronary leaflet of aortic valve | non coronary cusp of aortic valve；noncoronary cusp；posterior cusp of aortic valve | 主動脈瓣無冠狀瓣、無冠瓣 |
| anterior semilunar cusp of pulmonary valve | anterior cusp of pulmonary valve；anterior leaflet of pulmonary valve | 肺動脈瓣前瓣 |
| left semilunar cusp of pulmonary valve | left cusp of pulmonary valve；left leaflet of pulmonary valve | 肺動脈瓣左瓣 |
| right semilunar cusp of pulmonary valve | right cusp of pulmonary valve；right leaflet of pulmonary valve | 肺動脈瓣右瓣 |
| anterior interventricular artery | left anterior descending artery；lad；anterior interventricular branch；lad artery | 前降支、左前降支、前室間動脈 |
| circumflex artery | left circumflex artery；circumflex branch | 迴旋支、左迴旋支、旋支 |
| posterior interventricular branch | posterior descending artery；pda；posterior interventricular artery | 後降支、後室間動脈 |
| right marginal branch | marginal branch of right coronary artery；acute marginal artery | 右緣支、銳緣支 |
| left marginal branch | obtuse marginal artery；marginal branch of circumflex artery | 左緣支、鈍緣支 |
| diagonal branches | diagonal arteries；diagonal branch | 對角支 |
| great cardiac vein | great vein of heart | 心大靜脈 |
| middle cardiac vein | posterior interventricular vein | 心中靜脈、後室間靜脈 |
| small cardiac vein | lesser cardiac vein | 心小靜脈 |
| coronary sinus | cardiac sinus | 冠狀竇、冠狀靜脈竇 |
| aortic arch | arch of aorta | 主動脈弓 |
| ascending aorta | aorta ascending part | 升主動脈 |
| pulmonary trunk | main pulmonary artery | 肺動脈幹、肺動脈主幹 |
| superior vena cava | svc | 上腔靜脈 |
| inferior vena cava | ivc | 下腔靜脈 |
| crista terminalis | terminal crest | 界嵴 |
| pectinate muscles | musculi pectinati；pectinate muscle | 梳狀肌 |
| interatrial septum | atrial septum | 心房中隔、房中隔 |
| interventricular septum | ventricular septum | 室間隔、心室中隔 |
| fossa ovalis | oval fossa | 卵圓窩 |
| trabeculae carneae of right ventricle | trabeculae carneae of the right ventricle；trabeculae carneae | 右心室肉柱、肉柱 |
| trabeculae carneae of left ventricle | trabeculae carneae of the left ventricle | 左心室肉柱 |
| septomarginal trabecula (moderator band) | moderator band；septomarginal trabecula | 節制索、隔緣肉柱 |
| supraventricular crest | crista supraventricularis | 室上嵴 |
| conus arteriosus | infundibulum；right ventricular outflow tract | 動脈圓錐、漏斗部 |
| aortic vestibule | vestibule of left ventricle | 主動脈前庭 |
| right auricle | right atrial appendage；auricle of right atrium | 右心耳 |
| left auricle | left atrial appendage；auricle of left atrium | 左心耳 |
| fibrous pericardium | pericardium fibrous | 纖維心包、纖維性心包 |
| pectoralis major | pec major | 胸大肌 |
| deltoid | deltoideus | 三角肌 |
| latissimus dorsi | lats | 背闊肌 |
| trapezius | trapezius muscle | 斜方肌 |
| biceps brachii | biceps | 肱二頭肌 |
| triceps brachii | triceps | 肱三頭肌 |
| brachioradialis | supinator longus | 肱橈肌 |
| gluteus maximus | glute max | 臀大肌 |
| quadriceps femoris | quadriceps；quads | 股四頭肌 |
| rectus femoris | rectus femoris muscle | 股直肌 |
| tensor fasciae latae | tensor fascia lata | 闊筋膜張肌 |
| gastrocnemius | calf muscle | 腓腸肌 |
| tibialis anterior | anterior tibial muscle | 脛前肌 |
| fibularis longus | peroneus longus | 腓骨長肌 |
| fibularis brevis | peroneus brevis | 腓骨短肌 |
| fibularis tertius | peroneus tertius | 第三腓骨肌 |
| common fibular nerve | common peroneal nerve | 腓總神經 |
| superficial fibular nerve | superficial peroneal nerve | 腓淺神經 |
| deep fibular nerve | deep peroneal nerve | 腓深神經 |
| fibula | fibular bone | 腓骨 |
| sciatic nerve | ischiadic nerve | 坐骨神經 |
| saphenous nerve | internal saphenous nerve | 隱神經 |
| great saphenous vein | long saphenous vein；greater saphenous vein | 大隱靜脈 |
| small saphenous vein | short saphenous vein；lesser saphenous vein | 小隱靜脈 |
| popliteal artery | popliteal a | 膕動脈 |
| radial nerve | n radialis | 橈神經 |
| median nerve | n medianus | 正中神經 |
| ulnar nerve | n ulnaris | 尺神經 |
| musculocutaneous nerve | n musculocutaneus | 肌皮神經 |
| axillary nerve | circumflex nerve | 腋神經 |
| long thoracic nerve | nerve to serratus anterior | 胸長神經 |
| thoracodorsal nerve | nerve to latissimus dorsi；middle subscapular nerve | 胸背神經 |
| dorsal scapular nerve | nerve to rhomboids | 肩胛背神經 |
| suprascapular nerve | nerve to supraspinatus | 肩胛上神經 |
| accessory nerve (xi) | spinal accessory nerve；cranial nerve xi；accessory nerve | 副神經、第十一對腦神經 |
| vagus nerve (x) | vagus nerve；cranial nerve x | 迷走神經、第十對腦神經 |
| greater occipital nerve | occipital nerve greater | 枕大神經 |
| lesser occipital nerve | occipital nerve lesser | 枕小神經 |
| azygos vein | vena azygos | 奇靜脈 |
| internal thoracic artery | internal mammary artery；ima | 內胸動脈 |
| internal thoracic vein | internal mammary vein | 內胸靜脈 |
| brachiocephalic artery | brachiocephalic trunk；innominate artery | 頭臂動脈、頭臂幹 |
| brachiocephalic vein | innominate vein | 頭臂靜脈 |
| descending thoracic aorta | thoracic aorta；descending aorta | 降主動脈、胸主動脈 |
| xiphoid process | xiphisternum；ensiform process | 劍突 |
| manubrium | manubrium of sternum；manubrium sterni | 胸骨柄 |
| body of sternum | sternal body；gladiolus | 胸骨體 |
| scapula | shoulder blade | 肩胛骨 |
| clavicle | collarbone | 鎖骨 |
| patella | kneecap | 髕骨 |
| sacrum | os sacrum | 薦骨 |
| coccyx | tailbone | 尾骨 |
| atlas | c1；first cervical vertebra | 寰椎、第一頸椎 |
| axis | c2；second cervical vertebra | 軸椎、樞椎、第二頸椎 |
| diaphragm | thoracic diaphragm | 橫膈、橫膈膜 |
| splenius capitis | splenius capitis muscle | 頭夾肌 |
| splenius cervicis | splenius cervicis muscle | 頸夾肌 |
| levator scapulae | levator scapulae muscle | 提肩胛肌 |
| rhomboid major | greater rhomboid | 大菱形肌 |
| rhomboid minor | lesser rhomboid | 小菱形肌 |


### 需要你決定
- [#75](https://github.com/Kuan21/MJ_anatomy/pull/75)（已關閉，未合併）：建議的做法是另開小 PR 只修 GPU 屬性精度，不加瀏覽器實際渲染測試（CI 軟體 WebGL 逾時）。
- 全身肌腱／韌帶／筋膜的盒狀、平板檢查（接 #93）：尚未做，下一項。
- Actions 列表仍登記 11 個舊的「Temporary … validation」workflow 名稱（log 無筆記內容、檔案已不存在）：只能刪其 runs 才會消失，等你決定是否刪除。

### 流程
- 「需人工審核」PR 一律不開 auto-merge；這次 #87、#92、#93 是你審核後授權合併，不代表規則改變。
- 每當有 PR 合併進 main，我檢查所有 open PR 有沒有衝突，有就把 main 合併進分支並重新生成生成檔（不改寫歷史）。

## 第 0 步查證結果（Human Atlas 的來源與版本）

- **你的網站是 `slorksmo/Human-Atlas` 的衍生版。** 證據：兩者的 MIT `LICENSE`（版權人 ashemag）相同；`public/models/body-*.bin` 等模型封包逐位元組相同；`README.md` 標題與內容都是「Human Atlas」；`validate-atlas.mjs`、`optimize-anatomy.mjs`、`convert-anatomy.py` 等腳本同源；`public/ATTRIBUTION.md` 的 BodyParts3D 段落相同。我們的 git 歷史第一個 commit 是 `5e437fe`（Kuan21，2026-09-19），所以是以 Human-Atlas 當時的快照為起點、之後獨立開發。
- **版本**：我們的基底是 Human-Atlas **女性參考身體（HuBMAP v1.10）加入之前**的快照——我們的 `public/ATTRIBUTION.md` 仍把 HuBMAP *3D Reference Organ Set for Female v1.5* 列在「Historical assets (not included in the current release)」；上游現在（HEAD `5bb5713`，2026-09-06）已經是 v1.10＋以 v1.5 補回坐骨、恥骨，並附 `atlas-female.json`（1,220 個部件）。因為只取得上游淺層複製，確切分叉的 commit 無法逐一比對，以上是依檔案內容判斷。
- **`HiMahendraBeniwal/female-atlas` 也是 Human-Atlas 的衍生版**：87 個與上游共有的檔案中有 72 個與 Human-Atlas 逐位元組相同（含 `components/ui/*`、`lib/utils.ts`），其 `public/ATTRIBUTION.md` 只列 HuBMAP v1.5 的資料來源，沒有提到 Human-Atlas。所以我們只借鑑它的 zoom-to-cursor 概念，不直接複製程式碼。

## 已合併的 PR（最新在上）

| PR | 內容 | 在網站上怎樣找到 | 示意模型 |
| --- | --- | --- | --- |
| #64 | 名稱清理：驗證涵蓋搜尋專用名稱與左右中文、修正 `*` 殘留與小寫 left、第三／第四腦室中文名（原誤作「心室」）；Wikidata 中文標籤草稿 `docs/zh-wikidata-draft.md` | `npm run check:model`、`npm run zh:wikidata` | — |
| #63 | 神經解剖共筆匯入：597 條整理為 485 張資訊卡、搜尋與「共筆結構」清單、對照表 `docs/neuro-notes-vs-model.md` | 腦部詳細模式右側「構造」搜尋框、「共筆結構」 | — |
| #61 | 腦切面平滑：平滑場＋三線性取樣，灰質 2.4 mm；前後對照 `docs/brain-cut/` | 腦部詳細模式 → 切面 | 灰白質分界仍為示意 |
| #62 | 修正 main 的 `check`：登記 #59 新增的 2 個血管名稱左右寫法例外（命名清理前的暫時處理） | — | — |
| #60 | 腦部 CSF 流向改為全頁模式：左 3/4 動畫、右 1/4 步驟同步講解欄（位置、CSF 發生什麼、臨床相關、與課本不同處、出處）；關閉後回到原視角、切面、選取 | 腦部詳細模式右上「CSF 流向」 | 孔道、腦池、蛛網膜下腔、脊髓、腰池（沿用 #55） |
| #59 | C1–C8 脊神經與背側支、乳房（乳腺、乳暈、乳頭）、女性外陰（陰阜、大小陰唇、前庭球與前庭大腺、陰蒂與陰蒂腳）示意模型 | 搜尋名稱；乳房與外陰只在性別「女」顯示 | 全部為示意；外陰位置是在男性骨盆上估算，PR3 女性身體會重新對齊 |
| #58 | 模型驗證腳本 `validate-model`：mesh、名稱、分類、中英名、左右寫法，併入 `npm run check` | `npm run check:model` | — |
| #57 | 左側面板重整（胸膜歸呼吸系統、心包膜歸心臟、腦／心／眼／耳四個入口）、心臟詳細模式改版（無 hover、房室兩層清單）、二尖瓣更名僧帽瓣、心臟 Quiz 移除分叉題 | 左側面板；底部「心」 | — |
| #55 | 腦部詳細模式：切面、逐層剝離、17 個分區、433 個構造、CSF 動畫 | `#/organ/brain` | 見上 |
| #53 | 頭部模式、ⓘ 說明、枕下區、血管末端 | 上方「頭部」分頁 | 枕下區神經血管、血管末端連接管 |
| #52 | 跑考 574 項審核、153 個新增示意模型、肺門等 | `docs/paokao-audit.md` | 見該報告 |
| #54 | 自動化流程設定 | — | — |
| #48–#51 | 先前輪次 | — | — |

## 進行中（尚未合併）

| PR | 內容 |
| --- | --- |
| 左側面板 Organs 重整（UI） | 胸膜歸呼吸、心包三層歸心臟列（子項預設收起、父開關連動子項）；Organs 無散列結構，順序心→呼吸→消化→泌尿→生殖→內分泌→淋巴→感覺；「示意模型」改為資訊卡標籤。截圖：`docs/organ-panel/`。CI 通過後自動 merge。 |
| 區域側別選擇（UI） | 上肢／下肢旁新增「雙側／左側／右側」與「另一側淡化顯示」，鏡頭拉近該側肢體，與動作面板側別同步。截圖：`docs/region-side/`（上肢左、上肢右、上肢右＋淡化、下肢左、下肢左＋淡化）。純介面，CI 通過後自動 merge。 |
| 【需人工審核】血管（表面圓滑、上肢靜脈補全、血管樹驗證） | 四肢血管一次 Loop 細分（開口端固定、半徑補償），示意血管 6 → 12 邊；新增外側肱靜脈、前／後骨間靜脈、胸腹壁靜脈；掌深靜脈弓與橈食指動脈補接；新增 `scripts/check-vessel-tree.mjs`（整棵血管樹從主動脈／腔靜脈可達、分支不得比母血管寬 40% 以上）；連續性審核改以表面距離複查。修正前後截圖：`docs/vessel-smoothing/`。 |
| 分層解剖面板（UI） | 面板與動作面板（上肢、下肢）都有 Both｜Left｜Right 三鈕並與區域側別同步；「肌肉分層」依部位只列相關項目；新增「Spaces｜特殊區域」清單（四邊孔、三邊孔、三頭肌間隙、鎖骨胸大肌三角、腋窩、肘窩、解剖鼻煙盒、腕隧道、跗隧道、內收肌裂孔、枕下三角、主動脈裂孔），選取後高亮邊界與通過結構、其餘淡化，名稱可點擊；新增 `scripts/test-layer-regions.mjs`（結果 `docs/layer-region-check.md`）。截圖：`docs/layer-panel/`。 |
| #65 | 15.2b 腦部示意構造第 1 批：內囊、外囊、帶狀核、VPL/VPM、下視丘各核 |
| 之後 | 15.2c 腦幹（腦神經核、丘系…）、15.2d 小腦（深部核、小腦徑）、15.2e 邊緣系統與網狀核群；再來：脊髓橫切面與傳導路徑沿途高亮、血管供應範圍、耳部、Brodmann |

## 待你核對

### 待我決定
- 特殊區域清單沿用跑考摘要的名稱：「三頭肌間隙」（你寫的是「三邊間隙」，英文 Triangular interval）、「跗隧道」（你寫「跗管」）。要改請告知。
- 股三角、內收肌管、膕窩不在跑考摘要的結構清單內，沒有加入；要加請告知（需新增示意模型，屬需人工審核）。
- 特殊區域中的神經（腋神經、橈神經等）在場景以選取色顯示，但有些位置被肌肉遮住；選取後鏡頭會轉到能看到的那一側（後側或前側）。


### 設定（需要你在 GitHub 網頁操作）
- 開啟 *Allow auto-merge*，並把 `main` 的 branch protection 設成要求檢查 `build` 通過（步驟見 `docs/AUTOMATION.md`）。目前 auto-merge 未開，Claude 改成等 CI 全綠後直接 squash merge。
- 此環境的 `gh` 登入失效（GH_TOKEN 驗證失敗），PR 操作改用 GitHub 整合工具。
- **經驗**：兩個 PR 各自通過 CI 後依序合併，仍可能讓 main 變紅（#58 驗證腳本與 #59 新結構）。建議 branch protection 同時勾選「Require branches to be up to date before merging」。

### 內容（需要你對照教科書／老師 PPT）
- 神經解剖共筆匯入：我對 597 條的「保留／合併／剔除／改名／mesh 對應」是逐條人工判斷（`docs/neuro-notes-curation.json`），請抽查對照表（尤其「併入」與「已剔除」）。資訊卡的歸欄（位置、功能…）是關鍵字規則，句子本身是筆記原句，沒有改寫。
- 「楔形核」在筆記中同時指延腦的 Cuneate nucleus 與中腦網狀系統的 Cuneiform nucleus，我分別標示為「楔形核（延腦，Cuneate）」與「楔形核（中腦網狀系統，Cuneiform）」。
- 示意構造（內囊、核團、纖維束…）的位置與大小是依周圍真實構造估算，用赭黃色顯示並標示「示意」，不是實測形狀。
- 示意構造的新增名稱（中英對照）列於 `docs/neuro-notes-vs-model.md` 的「是否有 mesh」欄；與跑考摘要的對照待你核對。
- 筆記正文未有描述的 9 張資訊卡（藍斑核、後縫核、脊髓丘系、顏面神經核、橫行纖維、橋腦小腦纖維、近繩狀體、視丘背內側核、海馬本體）目前顯示「待依 Essential Neuroscience 或圖譜補充」，將在最終審核時補上並註明來源。
- 腦部切面：灰質厚度為示意（2.4 mm）；皮質各溝被橋接成實心（切面已平滑，網格 0.9 mm、約 620 萬格；你要求的 256³ 未採用，因約 7 倍 GPU 記憶體，若要請告知）；放射冠沒有獨立標示。第一次切開在無 GPU 的環境約需 6 秒（有顯示「正在計算平滑切面」）。
- CSF 動畫：各孔道與腦池的位置依標誌估算；脊髓段縮短、未依比例。
- 女性／男性切換：男性專屬結構是用名稱比對隱藏，名稱不在清單內的血管神經可能漏網。

### 尚未做到
- Brodmann 52 區；腦部脊髓橫切面與傳導路徑沿途高亮；Willis 環供應範圍著色；耳部結構（頭部模式）。
- 肺臟詳細模式與肺臟 Quiz。
- 女性身體（HuBMAP v1.10＋v1.5）整合、命名清理（PR2）、對齊與穿模修正（PR4）、器官供應血管、系統分開載入、zoom-to-cursor、Source & credits 全面更新。
- 穿模（閉孔神經前支）、膝屈曲 130° 大腿後側變形、肩外展拖動時神經爆出。
- 最終審核：全部模型位置、與共筆／老師 PPT 的事實核對、每個構造的資訊卡不可空白（補充用可信醫學來源）。老師 PPT 目前不在 repo，需要你提供。

### 評估（只評估、不實作）
- 腦部：Human-Atlas 女性身體（HuBMAP v1.10）的 **283 個腦區（`system: brain`）＝ 142 種結構的左右兩側**，能否用於腦部詳細模式。結論：**可作為真實 mesh 的來源補充，但不能取代；需先對齊座標，且等你的神經解剖筆記對應確認後再決定。**
  - 座標與授權：資料在「女性身體」的座標（Visible Human Female），與腦部詳細模式使用的 Brain Project（Z-Anatomy／BodyParts3D 男性）座標不同，需用最小二乘（縮放＋平移，參考 Human-Atlas 的 `borrow-anatomy.mjs`）對齊；授權 CC BY 4.0（HuBMAP），可用。
  - **可用、且對應到你筆記的結構（現在我們用示意模型的）**：視丘腹後外側核（VPL）與腹後內側核（VPM）、腹前核、腹外側核、背內側核、外側背側核、外側後核、前核群、枕核、中線核群、中央核群、中央中核、束旁核、內膝狀體、外膝狀體（背側）、底丘腦核、韁核、松果體、下視丘分區（視前、視上、結節、乳頭區）、帶狀核、杏仁核各核群（基底外側、基底內側、外側、內側、皮質前／後、前杏仁區、杏仁海馬區）、終紋床核、基底前腦、伏隔核、蒼白球內外節、殼核、尾狀核頭／體／尾、海馬頭／體／尾、乳頭體視丘徑、穹窿、胼胝體、前連合、小腦蚓部／旁蚓部／外側半球／深部核（合為一塊）、上／中／下小腦腳、橋腦基底部與被蓋、延腦錐體與被蓋、下橄欖核、紅核、黑質、大腦腳、上丘、下丘、前頂蓋區、各腦室分部、中央管、大腦導水管、視交叉、視徑、視放射、嗅球與嗅徑，以及細分的皮質腦迴（含 Heschl 迴、腦島長短迴、眼窩迴、扣帶迴前後部）。
  - **缺少（你的筆記有、這個身體沒有，所以仍需示意模型）**：內囊（前腳、膝部、後腳）、外囊、所有腦神經核（動眼、滑車、外旋、顏面、三叉、耳蝸、上橄欖、舌下、迷走背核、疑核、孤立核）、斜方體、各丘系（內側、外側、脊髓）、內側縱束、脊髓小腦徑與其他傳導束（皮質脊髓徑等）、縫核、藍斑核、網狀核群、個別小腦深部核（頂核、球狀核、栓狀核、齒狀核）、海馬分區（齒狀迴、羊角區 CA、下托）、內嗅皮質（僅有 perirhinal 與 parahippocampal）、下視丘各核（視上核、室旁核、視交叉上核…僅有分區）、脊髓、腦膜、腦血管、Brodmann 分區。
  - 與我們現有 Brain Project 的重疊：皮質腦迴、基底核、視丘核團、腦幹大結構兩邊都有；女性身體的分區較細（例如視丘各核有 mesh、杏仁核分 8 個核群），可用來取代部分示意構造，但左右、命名與解剖位置要逐一核對後才換。

### 血管（本輪）
- **成本**：四肢血管細分使圖譜封包由 33.5 MB 增為 39.7 MB（gzip），三角形由 229 萬增為 278 萬；沙盒沒有 GPU，FPS 未量測，請在你的裝置確認載入時間與動作流暢度。若太慢，可把門檻（`SMOOTH_MAX_TRIANGLES`）降低或只細分上肢。
- **已發現、未修**：左股動脈平均半徑約 3.1 mm，比同側膕動脈（4.5 mm）細，右側是 5.4 → 4.5；左右不對稱來自圖譜本身（`docs/vessel-tree.md`）。陰莖背動脈與子宮動／靜脈 4 件未接到動脈樹（生殖器，不在本輪範圍）。
- **橈食指動脈**：圖譜把它接在掌淺弓上，解剖上應起自橈動脈或掌深弓；已加一條連接管接到掌深弓，原本與掌淺弓的接觸保留，請確認是否要移除。
- **示意血管位置**：外側肱靜脈（與內側肱靜脈對稱地放在肱動脈另一側）、骨間靜脈、胸腹壁靜脈的路徑是依鄰近構造估算，不是實測形狀；請對照課本。
- **未做**：下肢靜脈沒有新增（大隱、小隱、深靜脈伴行已在圖譜中）；依鏡頭距離調整血管細緻度（LOD）未實作。

### 其他
- `public/models/cmu-course-notes-v4.json` 的 git 歷史要不要清除：等專案完成後由你決定，Claude 不會動。
