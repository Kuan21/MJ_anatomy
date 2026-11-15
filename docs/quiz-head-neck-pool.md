# Quiz 頭頸：題庫範圍與排除清單

此檔由 `node scripts/report-quiz-headneck.mjs` 產生，請勿手改（排除與分組由 `scripts/prepare-quiz.mjs` 依 `app/quiz/headneck.ts` 的規則決定；說明見 `docs/quiz-head-neck.md`）。來源是主站已有的頭頸構造（圖譜、面部與補充肌肉、神經疊圖、頸部血管、關節組織），沒有新增或修改任何 3D 模型。腦的構造不在這裡（有獨立的「腦」Quiz）。

可出題：435 個構造（左右分開計），去掉左右後 237 個名稱。不出題：254 項（逐項列在下方，原因見各小節）。

## 各區段 × 類別（格內為「構造數 / 去掉左右後的名稱數」）

| 區段 | 骨 | 肌肉 | 神經 | 動脈 | 靜脈 | 韌帶與筋膜 | 關節 | 特殊空間與孔 | 器官結構 | 合計 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 顱骨與下頷 | 22 / 14 | — | — | — | — | — | 10 / 5 | — | — | 32 / 19 |
| 頸椎與舌骨 | 14 / 14 | — | — | — | — | 2 / 1 | — | — | — | 16 / 15 |
| 面部與咀嚼肌 | — | 51 / 26 | — | — | — | 1 / 1 | — | — | — | 52 / 27 |
| 頸部肌肉 | — | 65 / 33 | — | — | — | — | — | 2 / 1 | — | 67 / 34 |
| 眼與眼眶 | — | 14 / 7 | — | — | — | 6 / 3 | — | — | 36 / 18 | 56 / 28 |
| 口、鼻、咽與喉 | — | 38 / 20 | — | — | — | 13 / 9 | 2 / 1 | — | 53 / 31 | 106 / 61 |
| 腦神經與頸神經 | — | — | 88 / 44 | — | — | — | — | — | — | 88 / 44 |
| 頭頸血管 | — | — | — | 16 / 8 | 2 / 1 | — | — | — | — | 18 / 9 |
| 全部頭頸 | 36 / 28 | 168 / 86 | 88 / 44 | 16 / 8 | 2 / 1 | 22 / 14 | 12 / 6 | 2 / 1 | 89 / 49 | 435 / 237 |

類別對照：顱骨、頸椎、舌骨與鼻甲 → 骨；面部、咀嚼、頸部、眼外、咽喉與舌肌 → 肌肉；腦神經與頸神經 → 神經；動脈、靜脈 → 動脈、靜脈；顳顎關節的關節囊、關節盤與韌帶 → 關節；莖突舌骨韌帶、甲狀舌骨膜、聲帶韌帶、咽縫、帽狀腱膜與眼的制止韌帶等 → 韌帶與筋膜；眼球與淚器、舌、牙與牙齦、唾液腺、喉軟骨、鼻軟骨、會厭、氣管 → 器官結構；枕下三角 → 特殊空間與孔。沿用現有類別，沒有新增類別。

## 資料卡

資料卡只使用主站已有的資料；沒有資料的欄位顯示「尚無資料」，不自行補寫。欄位齊全：149 / 435；部分欄位有資料：20；完全沒有資料：266。完整的缺漏清單在 `docs/quiz-card-gaps.md`。

| 系統 | 構造數 | 欄位齊全 | 部分有資料 | 完全沒有資料 |
| --- | --- | --- | --- | --- |
| 骨骼 | 36 | 0 | 8 | 28 |
| 肌肉 | 168 | 141 | 0 | 27 |
| 神經 | 88 | 2 | 10 | 76 |
| 動脈 | 16 | 4 | 2 | 10 |
| 靜脈 | 2 | 0 | 0 | 2 |
| 頭頸器官構造 | 111 | 0 | 0 | 111 |
| 關節構造 | 12 | 0 | 0 | 12 |
| 特殊空間與孔 | 2 | 2 | 0 | 0 |

## 眼球內部構造（外層變半透明）

共 20 個構造有「層」的標記：題目是眼球內部的構造時，同一側外層的鞏膜與角膜（以及更外一層的構造）改為淡色半透明、不能被點選，其他題目不變。規則：`app/quiz/headneck.ts` 的 `coversHeadNeckTarget`。

## 不出題的構造（逐項）

### 腦的構造（腦回、核團、腦室、白質纖維束、腦幹、小腦、腦膜、腦動脈與腦下垂體、松果體）：已有獨立的「腦」Quiz 區域，這裡不重複（199）

- Anterior commissure
- Anterior communicating artery
- anterior inferior cerebellar artery
- Anterior inferior cerebellar artery
- Anterior part of left superior temporal gyrus [left]
- Anterior part of right superior temporal gyrus [right]
- Anterior temporal branch of left lateral occipital artery [left]
- Anterior temporal branch of right lateral occipital artery [right]
- Anterolateral central branch of left middle cerebral artery [left]
- Anterolateral central branch of right middle cerebral artery [right]
- artery of central sulcus
- Artery of central sulcus
- Artery of left postcentral sulcus [left]
- Artery of left precentral sulcus [left]
- Artery of right postcentral sulcus [right]
- Artery of right precentral sulcus [right]
- Basilar artery
- Brachium of left inferior colliculus [left]
- Brachium of left superior colliculus [left]
- Brachium of right inferior colliculus [right]
- Brachium of right superior colliculus [right]
- Branch of left anterior choroidal artery to posterior limb of left internal capsule [left]
- Branch of left middle cerebral artery to left angular gyrus [left]
- Branch of right anterior choroidal artery to posterior limb of right internal capsule [right]
- Branch of right middle cerebral artery to right angular gyrus [right]
- Central canal of spinal cord
- Cerebellum
- Cerebral aqueduct
- Choroid plexus of cerebral hemisphere
- Commissure of fornix of forebrain
- Corpus callosum
- Fourth ventricle
- Habenula
- Hypothalamic branch of left posterior communicating artery [left]
- Hypothalamic branch of right posterior communicating artery [right]
- Hypothalamus
- Insular part of left middle cerebral artery [left]
- Insular part of right middle cerebral artery [right]
- Intermediomedial branch of left callosomarginal artery [left]
- Intermediomedial branch of right callosomarginal artery [right]
- Interpeduncular fossa
- Interventricular foramen
- Lamina terminalis
- Lateral branch of left pontine artery [left]
- Lateral branch of left superior cerebellar artery [left]
- Lateral branch of right pontine artery [right]
- Lateral branch of right superior cerebellar artery [right]
- Left amygdala [left]
- Left angular gyrus [left]
- Left anterior cerebral artery [left]
- Left anterior choroidal artery [left]
- Left anterior parietal artery [left]
- Left anterior temporal artery [left]
- Left callosomarginal artery [left]
- Left caudate nucleus [left]
- Left cingulate gyrus [left]
- Left fornix of forebrain [left]
- Left fusiform gyrus [left]
- Left globus pallidus [left]
- Left hippocampus [left]
- Left inferior colliculus [left]
- Left inferior frontal gyrus [left]
- Left inferior temporal gyrus [left]
- Left insula [left]
- Left internal capsule [left]
- Left lateral frontobasal artery [left]
- Left lateral geniculate body [left]
- Left lateral occipital artery [left]
- Left lateral ventricle [left]
- Left medial frontobasal artery [left]
- Left medial geniculate body [left]
- Left medial occipital artery [left]
- Left middle frontal gyrus [left]
- Left middle temporal gyrus [left]
- Left occipital lobe [left]
- Left optic tract [left]
- Left parahippocampal gyrus [left]
- Left pericallosal artery [left]
- Left polar temporal artery [left]
- Left postcentral gyrus [left]
- Left posterior communicating artery [left]
- Left posterior inferior cerebellar artery [left]
- Left posterior medial choroidal artery [left]
- Left posterior parietal artery [left]
- Left precentral gyrus [left]
- Left prefrontal artery [left]
- Left putamen [left]
- Left splenial artery [left]
- Left stria medullaris of thalamus [left]
- Left stria terminalis [left]
- Left superior cerebellar artery [left]
- Left superior colliculus [left]
- Left superior frontal gyrus [left]
- Left superior parietal lobule [left]
- Left supramarginal gyrus [left]
- Left thalamogeniculate artery [left]
- Left thalamoperforating artery [left]
- Left thalamus [left]
- Mammillary body
- Medial branch of left pontine artery [left]
- Medial branch of left superior cerebellar artery [left]
- Medial branch of right pontine artery [right]
- Medial branch of right superior cerebellar artery [right]
- Medulla oblongata
- Midbrain
- Middle temporal branch of left lateral occipital artery [left]
- Middle temporal branch of left middle cerebral artery [left]
- Middle temporal branch of right lateral occipital artery [right]
- Middle temporal branch of right middle cerebral artery [right]
- Optic chiasm
- Orbital gyrus
- Paracentral branch of left callosomarginal artery [left]
- Paracentral branch of right callosomarginal artery [right]
- Peduncle of midbrain
- Pineal body
- Pituitary gland
- Pons
- Postcommunicating part of left posterior cerebral artery [left]
- Postcommunicating part of right posterior cerebral artery [right]
- Posterior commissure
- Posterior part of left superior temporal gyrus [left]
- Posterior part of right superior temporal gyrus [right]
- Posterior temporal branch of left middle cerebral artery [left]
- Posterior temporal branch of right middle cerebral artery [right]
- Posteromedial branch of left callosomarginal artery [left]
- Posteromedial branch of right callosomarginal artery [right]
- Posteromedial central branch of left posterior cerebral artery [left]
- Posteromedial central branch of right posterior cerebral artery [right]
- Precommunicating part of left posterior cerebral artery [left]
- Precommunicating part of right posterior cerebral artery [right]
- Precuneal branch of left pericallosal artery [left]
- Precuneal branch of right pericallosal artery [right]
- Right amygdala [right]
- Right angular gyrus [right]
- Right anterior cerebral artery [right]
- Right anterior choroidal artery [right]
- Right anterior parietal artery [right]
- Right anterior temporal artery [right]
- Right callosomarginal artery [right]
- Right caudate nucleus [right]
- Right cingulate gyrus [right]
- Right fornix of forebrain [right]
- Right fusiform gyrus [right]
- Right globus pallidus [right]
- Right hippocampus [right]
- Right inferior colliculus [right]
- Right inferior frontal gyrus [right]
- Right inferior temporal gyrus [right]
- Right insula [right]
- Right internal capsule [right]
- Right lateral frontobasal artery [right]
- Right lateral geniculate body [right]
- Right lateral occipital artery [right]
- Right lateral ventricle [right]
- Right medial frontobasal artery [right]
- Right medial geniculate body [right]
- Right medial occipital artery [right]
- Right middle frontal gyrus [right]
- Right middle temporal gyrus [right]
- Right occipital lobe [right]
- Right optic tract [right]
- Right parahippocampal gyrus [right]
- Right pericallosal artery [right]
- Right polar temporal artery [right]
- Right postcentral gyrus [right]
- Right posterior communicating artery [right]
- Right posterior inferior cerebellar artery [right]
- Right posterior medial choroidal artery [right]
- Right posterior parietal artery [right]
- Right precentral gyrus [right]
- Right prefrontal artery [right]
- Right putamen [right]
- Right splenial artery [right]
- Right stria medullaris of thalamus [right]
- Right superior cerebellar artery [right]
- Right superior colliculus [right]
- Right superior frontal gyrus [right]
- Right superior parietal lobule [right]
- Right supramarginal gyrus [right]
- Right thalamogeniculate artery [right]
- Right thalamoperforating artery [right]
- Right thalamus [right]
- Septum of telencephalon
- set of posterior temporal branches of lateral occipital artery
- Set of posterior temporal branches of lateral occipital artery
- Sphenoid part of left middle cerebral artery [left]
- Sphenoid part of right middle cerebral artery [right]
- Stria terminalis
- Superior vermian branch of medial branch of left superior cerebellar artery [left]
- Superior vermian branch of medial branch of right superior cerebellar artery [right]
- Temporo-occipital branch of left middle cerebral artery [left]
- Temporo-occipital branch of right middle cerebral artery [right]
- Tentorium cerebelli
- Third ventricle
- Trunk of inferior terminal branch of left middle cerebral artery [left]
- Trunk of inferior terminal branch of right middle cerebral artery [right]
- Tuber cinereum
- White matter of left cerebral hemisphere [left]
- White matter of right cerebral hemisphere [right]

### 主站畫面用頸部血管模型取代這個圖譜網格（總頸動脈、內頸動脈、內頸靜脈）；測驗改用頸部血管模型，避免同一條血管出現兩次（6）

- Left common carotid artery [left]
- Left internal carotid artery [left]
- Left internal jugular vein [left]
- Right common carotid artery [right]
- Right internal carotid artery [right]
- Right internal jugular vein [right]

### 另一個來源已經有同一條構造（神經串流的完整走向取代圖譜較短的一段），只保留一個（6）

- Left ophthalmic nerve [left]
- Left optic nerve [left]
- Left trochlear nerve [left]
- Right ophthalmic nerve [right]
- Right optic nerve [right]
- Right trochlear nerve [right]

### 屬於其他部位的測驗（胸椎、脊髓動脈、斜方肌、全身走行的交感神經與神經節）（36）

- Left anterior division of inferior trunk of brachial plexus [left]
- Left anterior division of middle trunk of brachial plexus [left]
- Left anterior division of superior trunk of brachial plexus [left]
- Left anterior root of spinal nerve [left]
- Left anterior spinal artery [left]
- Left ganglia of sympathetic trunk [left]
- Left inferior trunk of brachial plexus [left]
- Left middle trunk of brachial plexus [left]
- Left posterior cord of brachial plexus [left]
- Left posterior division of inferior trunk of brachial plexus [left]
- Left posterior division of middle trunk of brachial plexus [left]
- Left posterior division of superior trunk of brachial plexus [left]
- Left posterior root of spinal nerve [left]
- Left roots of brachial plexus [left]
- Left spinal ganglion [left]
- Left superior trunk of brachial plexus [left]
- Left sympathetic nerves [left]
- Left sympathetic trunk [left]
- Right anterior division of inferior trunk of brachial plexus [right]
- Right anterior division of middle trunk of brachial plexus [right]
- Right anterior division of superior trunk of brachial plexus [right]
- Right anterior root of spinal nerve [right]
- Right anterior spinal artery [right]
- Right ganglia of sympathetic trunk [right]
- Right inferior trunk of brachial plexus [right]
- Right middle trunk of brachial plexus [right]
- Right posterior cord of brachial plexus [right]
- Right posterior division of inferior trunk of brachial plexus [right]
- Right posterior division of middle trunk of brachial plexus [right]
- Right posterior division of superior trunk of brachial plexus [right]
- Right posterior root of spinal nerve [right]
- Right roots of brachial plexus [right]
- Right spinal ganglion [right]
- Right superior trunk of brachial plexus [right]
- Right sympathetic nerves [right]
- Right sympathetic trunk [right]

### 模型把左右合成同一個網格（外耳、眉毛），無法分左右，不符合左右必須分開的規則（2）

- External ear
- Eyebrow

### 不是解剖構造（頭髮）（1）

- Hair of head

### 模型只是一條極細的交通支，中文名與主幹相同，打出名稱沒有唯一答案（2）

- Communicating branch of left nasociliary nerve with left ciliary ganglion [left]
- Communicating branch of right nasociliary nerve with right ciliary ganglion [right]

### 模型只有單側（另一側沒有），而且名稱不能單獨指出是哪一條構造（2）

- Right intermediate tendon（右中間腱） [right]
- Tendon of right levator palpebrae superioris（右提上瞼肌腱） [right]

### 缺中文名（0）

沒有。

### 名稱與同部位其他構造重複（打出名稱沒有唯一答案）（0）

沒有。

## 與其他區域重複的構造

腦神經的根部、腦血管等屬於「腦」Quiz；頸椎、頸部肌肉與頸神經在「背部」Quiz 也有（背部以後方層次為主），名稱相同的構造在不同區域各自出題，同一區域內名稱不重複。

