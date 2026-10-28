# 腦部結構資訊卡與全部構造清單

## 內容（依你的審核意見修改）
- 模型的 433 個結構（235 個不同名稱）每一個都有資訊卡，共 200 張卡：Location｜位置、Function｜功能、Connections / Relations｜連結／毗鄰（可點擊，高亮對應結構）、Blood supply｜血液供應；皮質腦迴另有 Brodmann area｜Brodmann 分區；核團與白質、腦室、血管不顯示 Brodmann 欄位。資料在 `app/organ/brain-facts-*.ts`（皮質兩份、深部、白質、腦幹／小腦／腦神經、血管），內容依你核對過的神經解剖教科書，用自己的話寫，沒有書名或頁碼。
- **資訊卡內容暫時只有英文**；結構名稱仍是英文＋中文。`scripts/test-brain-detail.mjs` 不再要求卡片有中文內容（仍要求每個結構有中文名稱）。
- 新增 **Borders｜分界** 欄（只有腦葉分界溝裂）與 **Main nuclei｜主要核團** 子清單（下視丘各區卡片內，因模型沒有各核團的獨立網格）。
- 左側清單頂端的 **All structures｜全部構造** 維持不變；「相關腦葉」改為英文，且不列出結構本身。

## 腦葉分界溝裂（新分組）
Lobes 之下、各腦葉之後新增 **Interlobar sulci & fissures｜腦葉分界溝裂**，收入：Central sulcus、Lateral sulcus 的後支（模型名 Lat Fis-post）、Parieto-occipital sulcus、Cingulate sulcus（Marginal part）、Collateral sulcus；每張卡有 Borders 欄寫明分隔哪兩個區域。
- Lateral sulcus 的前升支與前水平支歸額葉（把額下回分成蓋部、三角部、眶部）；Intraparietal sulcus 與 Jensen 溝歸頂葉；Transverse occipital sulcus、Calcarine sulcus 歸枕葉；Circular sulcus 歸腦島；Base of peduncle（大腦腳底）歸中腦，維持。
- **模型沒有的**：Preoccipital notch 與 Longitudinal fissure（大腦縱裂）在模型內沒有網格，所以沒有可點選的結構與卡片；縱裂的說明寫在大腦鐮與相關卡片中。若你要它們獨立成項，請列入「模型未有構造補模型」那一批。

## 共用說明（拆分後仍共用的項目與理由）
功能、血液供應或受損症狀不同的已拆開：三叉神經 V1／V2／V3 各一張、下視丘五個區各一張（核團寫在卡內）、杏仁核按核群（皮質內側群、基底外側群、中央核）、丘腦各核、白質各束。仍共用的 15 張卡（共 50 個名稱），卡片底部會寫明包含哪些名稱，列表標〔共用說明〕：

- Precentral sulcus (inferior part)；Precentral sulcus (Superior part)
- Lateral nucleus；Basolateral complex（Shared card: Basolateral group, covering the Lateral nucleus and the Basolateral complex of the amygdala.）
- Corticopontine tract (frontal)；Corticopontine tract (occipital)；Corticopontine tract (parietal)（Corticopontine tract (frontal), Corticopontine tract (occipital) and Corticopontine tract (parietal), named after the lobe of origin.）
- Corticostriatal tract (anterior)；Corticostriatal tract (posterior)；Corticostriatal tract (superior)（Corticostriatal tract (anterior), Corticostriatal tract (posterior) and Corticostriatal tract (superior), named after the cortical region of origin.）
- Superior longitudinal fasciculus I；Superior longitudinal fasciculus II；Superior longitudinal fasciculus III（Superior longitudinal fasciculus I, II and III, three parallel subdivisions of one bundle.）
- Peduncle of flocculus；Nodule of vermis；Flocculus（Vestibulocerebellum (flocculonodular lobe): Flocculus, Nodule of vermis and Peduncle of flocculus.）
- Wing of central lobule；Uvula of vermis；Tuber of vermis；Pyramis of vermis；Lingula of cerebellum；Folium of vermis；Declive；Culmen；Central lobule；Anterior quadrangular lobule（Spinocerebellum: vermis parts Lingula of cerebellum, Central lobule, Wing of central lobule, Culmen, Declive, Folium of vermis, Tuber of vermis, Pyramis of vermis and Uvula of vermis, plus the Anterior quadr
- Tonsil of cerebellum；Superior semilunar lobule；Posterior quadrangular lobule；Inferior semilunar lobule；Gracile lobule；Biventral lobule（Cerebrocerebellum (lateral hemispheres): Posterior quadrangular lobule, Superior semilunar lobule, Inferior semilunar lobule, Gracile lobule, Biventral lobule and Tonsil of cerebellum.）
- Maxillary nerve；Meningeal branch of maxillary nerve（Maxillary nerve (V2) and its Meningeal branch of maxillary nerve.）
- Anterior division of mandibular nerve；Buccal nerve；Inferior alveolar nerve；Lingual nerve；Mental nerve；Posterior division of mandibular nerve（Mandibular nerve (V3): Anterior division of mandibular nerve, Posterior division of mandibular nerve, Buccal nerve, Inferior alveolar nerve, Lingual nerve and Mental nerve.）
- Insular branches of middle cerebral artery (M2)；Insular branches of middle cerebral artery (M2-segment)（Insular branches of middle cerebral artery (M2) and (M2-segment): two names for the same insular segment.）
- Middle cerebral artery (M3 segment)；Middle cerebral artery (M3-segment)（Middle cerebral artery (M3 segment) and (M3-segment): two names for the same opercular segment.）
- Distal lateral striate branches；Proximal lateral striate branches（Proximal lateral striate branches and Distal lateral striate branches: medial and lateral groups of the lenticulostriate arteries.）
- Anterior intercavernous sinus；Posterior intercavernous sinus（Anterior intercavernous sinus and Posterior intercavernous sinus: the front and back connections between the cavernous sinuses.）
BA:

共用理由：（1）模型把同一結構拆成兩個名稱（M2／M2-segment、M3 兩種寫法、枕葉與眶溝的左右部分）；（2）同一功能分區的小葉（小腦三個功能區）；（3）同一束的細分、內容相同（皮質橋腦徑、皮質紋狀體徑、上縱束 I–III）；（4）V2／V3 的更細分支共用所屬那一支的卡，卡上寫明屬於哪一支。

## 待你核對
- 資訊卡的血液供應依你提供的清單；清單沒有涵蓋的（腦神經、大腦腳底、尾狀核體與尾、視丘各核、垂體、硬腦膜動脈、杏仁核、韁核與松果腺等）是我依一般解剖寫成，請抽查。
- Brodmann 分區：主要分區（4、6、8、44、45、3/1/2、5/7、41/42、22、17/18/19）依你的清單；你列為「待核對」的（9–12、46、39、40、23、24、28、20、21、37、38）已加入；另外有些卡寫了清單以外的號碼（13、14、25、27、29、30、31、32、34–36、47），也請一併核對。

## 第四腦室
依你的特徵重做（示意調整，不是量測；`app/organ/brain-reshape.ts` 以原模型的位置與高度為基準重建）：
- 位置在橋腦與上半延腦的背側、小腦腹側；底為平的菱形（菱形窩），底面貼著模型腦幹背面的正中線；
- 頂為帳篷形，尖端（fastigium）向背側伸入小腦，上部為上髓帆；
- 兩側的外側隱窩向外延伸，末端是外側孔（Luschka 孔）；下頂中線有正中孔（Magendie 孔）；
- 上端接中腦導水管，下端變窄於 obex 接中央管。
- CSF 流向頁的正中孔與外側孔管線改為從這個新腦室的下頂與外側隱窩末端出發，與模型一致。
截圖：`docs/brain-review-shots/`：`fourth-alone-side|back|front.png`（單獨的第四腦室）、`fourth-back-no-cerebellum.png`、`fourth-back-zoom2.png`（去除小腦的後面觀）、`fourth-side-brainstem.png`、`fourth-midsagittal.png`、`fourth-midsagittal-zoom2.png`（正中矢狀切面）。
限制：模型的腦幹是實心網格，沒有真正的凹陷，所以菱形底是貼在腦幹背面上；外側隱窩較短，外側孔以管線示意。
