# 神經解剖筆記 vs 模型現況對照表（內部參考，不上網站）

由 `scripts/prepare-neuro-notes.mjs` 產生（`npm run check` 會檢查本檔是否最新）。資料來源：`docs/neuro-notes.json`；人工整理：`docs/neuro-notes-curation.json`。

## 摘要

- 筆記自動抽取的結構：597 條 → 保留成 **485 張資訊卡**；併入其他條目 87 條（名稱保留為別名）；剔除 26 條（不是構造，原因見下表）。
- 腦部模型（Brain Project）已有 mesh：155 張卡；只有近似 mesh：13 張；**模型未有：317 張**（清單與搜尋仍找得到，標示「模型未有」，點擊可開資訊卡）。
- 筆記正文未有描述的卡片：0 張（見下表「資訊卡」欄），內容待最終審核時依教科書或圖譜補上。
- 已用自己的話寫好資訊卡的：485 張；待寫：0 張。

| id | 中英名稱 | 類型 | 出處 | 是否有 mesh | 是否可點選 | 資訊卡 |
| --- | --- | --- | --- | --- | --- | --- |
| 0001 | 大腦縱裂<br>Longitudinal fissure | 皮質／腦迴／腦溝／腦葉 | 0218 p.3 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0002 | 胼胝體<br>Corpus callosum | 其他結構 | 0218 p.3；0311 p.12；0430 p.2；0430 p.13 | 有：Corpus callosum | 清單＋模型 | 已寫（位置、構造、功能） |
| 0003 | 中央溝<br>Central sulcus | 皮質／腦迴／腦溝／腦葉 | 0218 p.3；0218 p.5 | 有：Central sulcus | 清單＋模型 | 已寫（位置、功能） |
| 0004 | 額葉<br>Frontal lobe | 皮質／腦迴／腦溝／腦葉 | 0218 p.3；0218 p.5 | 有：@group:frontal | 清單＋模型 | 已寫（位置、功能、損傷表現） |
| 0005 | 頂葉<br>Parietal lobe | 皮質／腦迴／腦溝／腦葉 | 0218 p.3；0218 p.4；0218 p.5 | 有：@group:parietal | 清單＋模型 | 已寫（位置、功能、損傷表現） |
| 0006 | 中央前迴<br>Precentral gyrus | 皮質／腦迴／腦溝／腦葉 | 0218 p.3；0430 p.9 | 有：Precentral gyrus | 清單＋模型 | 已寫（位置、Brodmann 編號、功能、損傷表現） |
| 0007 | 中央後迴<br>Postcentral gyrus | 皮質／腦迴／腦溝／腦葉 | 0218 p.3；0218 p.4；0411 p.15；0411 p.16；0411 p.22；0226 p.16 | 有：Postcentral gyrus | 清單＋模型 | 已寫（位置、Brodmann 編號、功能、損傷表現） |
| 0008 | 側溝<br>Lateral sulcus (Sylvian fissure) | 皮質／腦迴／腦溝／腦葉 | 0218 p.3；0424 p.12；0430 p.10；0430 p.27 | 有：Lat Fis-post、Lat Fis-ant-Horizont、Lat Fis-ant-Vertical | 清單＋模型 | 已寫（位置、Brodmann 編號、影像表現） |
| 0009 | 顳葉<br>Temporal lobe | 皮質／腦迴／腦溝／腦葉 | 0218 p.3；0218 p.4；0218 p.5；0402 p.28 | 有：@group:temporal | 清單＋模型 | 已寫（位置、功能、損傷表現） |
| 0010 | 上額迴<br>Superior frontal gyrus | 皮質／腦迴／腦溝／腦葉 | 0218 p.3 | 有：Superior frontal gyrus | 清單＋模型 | 已寫（位置、功能） |
| 0011 | 中額迴<br>Middle frontal gyrus | 皮質／腦迴／腦溝／腦葉 | 0218 p.3 | 有：Middle frontal gyrus | 清單＋模型 | 已寫（位置、功能） |
| 0012 | 下額迴<br>Inferior frontal gyrus | 皮質／腦迴／腦溝／腦葉 | 0218 p.3 | 有：Opercular part of inferior frontal gyrus、Triangular part of inferior frontal gyrus、Orbital part of inferior frontal gyrus | 清單＋模型 | 已寫（位置、Brodmann 編號、功能、損傷表現） |
| 0013 | 額極<br>Frontal pole | 皮質／腦迴／腦溝／腦葉 | 0218 p.3 | 近似：Transverse frontopolar gyrus and sulcus | 清單＋模型 | 已寫（位置） |
| 0014 | 上頂葉<br>Superior parietal lobule | 皮質／腦迴／腦溝／腦葉 | 0218 p.4 | 有：Superior parietal lobule | 清單＋模型 | 已寫（位置、功能） |
| 0015 | 下頂葉<br>Inferior parietal lobule | 皮質／腦迴／腦溝／腦葉 | 0218 p.4 | 有：Supramarginal gyrus、Angular gyrus | 清單＋模型 | 已寫（位置、功能） |
| 0016 | 上緣迴<br>Supramarginal gyrus | 皮質／腦迴／腦溝／腦葉 | 0218 p.4 | 有：Supramarginal gyrus | 清單＋模型 | 已寫（位置、Brodmann 編號、功能、損傷表現） |
| 0017 | 角迴<br>Angular gyrus | 皮質／腦迴／腦溝／腦葉 | 0218 p.4；0218 p.7 | 有：Angular gyrus | 清單＋模型 | 已寫（位置、Brodmann 編號、功能、損傷表現） |
| 0018 | 枕葉<br>Occipital lobe | 皮質／腦迴／腦溝／腦葉 | 0218 p.4；0218 p.5 | 有：@group:occipital | 清單＋模型 | 已寫（位置、功能、損傷表現） |
| 0019 | 上枕迴<br>Superior occipital gyrus | 皮質／腦迴／腦溝／腦葉 | 0218 p.4 | 有：Superior occipital gyri | 清單＋模型 | 已寫（位置、功能） |
| 0020 | 中枕迴<br>Middle occipital gyrus | 皮質／腦迴／腦溝／腦葉 | 0218 p.4 | 有：Lateral occipital gyrus (Middle occipital gyrus) | 清單＋模型 | 已寫（位置、功能） |
| 0021 | 下枕迴<br>Inferior occipital gyrus | 皮質／腦迴／腦溝／腦葉 | 0218 p.4 | 有：Inferior occipital gyrus and sulcus | 清單＋模型 | 已寫（位置、功能） |
| 0022 | 上顳迴<br>Superior temporal gyrus | 皮質／腦迴／腦溝／腦葉 | 0218 p.4 | 有：Superior temporal gyrus (Lateral part) | 清單＋模型 | 已寫（位置、Brodmann 編號、功能、損傷表現） |
| 0023 | 中顳迴<br>Middle temporal gyrus | 皮質／腦迴／腦溝／腦葉 | 0218 p.4 | 有：Middle temporal gyrus | 清單＋模型 | 已寫（位置、功能） |
| 0024 | 下顳迴<br>Inferior temporal gyrus | 皮質／腦迴／腦溝／腦葉 | 0218 p.4 | 有：Inferior temporal gyrus | 清單＋模型 | 已寫（位置、功能） |
| 0025 | 顳極<br>Temporal pole | 皮質／腦迴／腦溝／腦葉 | 0218 p.4 | 有：Temporal pole | 清單＋模型 | 已寫（位置、功能） |
| 0026 | 視覺皮質<br>Visual cortex | 皮質／腦迴／腦溝／腦葉 | 0218 p.5 | 近似：Calcarine sulcus | 清單＋模型 | 已寫（位置、Brodmann 編號、功能、損傷表現） |
| 0027 | 聽覺皮質<br>Auditory cortex | 皮質／腦迴／腦溝／腦葉 | 0218 p.5；0424 p.12 | 有：Transverse temporal gyri、Temporal plane | 清單＋模型 | 已寫（位置、Brodmann 編號、功能、損傷表現） |
| 0028 | 前庭區<br>Vestibular area | 皮質／腦迴／腦溝／腦葉 | 0218 p.5 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0029 | 腦島區<br>Insular area | 皮質／腦迴／腦溝／腦葉 | 0218 p.5 | 見 0047 | 見 0047 | 併入 0047「腦島」，名稱保留為別名 |
| 0030 | 嗅徑<br>Olfactory tract | 纖維束／傳導路徑 | 0218 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0031 | 嗅球<br>Olfactory bulb | 其他結構 | 0218 p.8；0402 p.25 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、損傷表現） |
| 0032 | 嗅溝<br>Olfactory sulcus | 皮質／腦迴／腦溝／腦葉 | 0218 p.8 | 有：Olfactory sulcus | 清單＋模型 | 已寫（位置） |
| 0033 | 眼窩迴<br>Orbital gyrus | 皮質／腦迴／腦溝／腦葉 | 0218 p.8 | 有：Orbital gyri | 清單＋模型 | 已寫（位置、功能） |
| 0034 | 直迴<br>Gyrus rectus | 皮質／腦迴／腦溝／腦葉 | 0218 p.8 | 有：Straight gyrus (Gyrus rectus) | 清單＋模型 | 已寫（位置、功能） |
| 0035 | 梨狀葉<br>Piriform lobe | 皮質／腦迴／腦溝／腦葉 | 0218 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0036 | 杏仁核<br>Amygdala | 核團 | 0218 p.8；0218 p.16；0402 p.2；0402 p.15；0402 p.25 | 有：Basolateral complex、Corticomedial group、Central nucleus…等 4 個 | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0037 | 海馬迴<br>Hippocampus | 皮質／腦迴／腦溝／腦葉 | 0218 p.8；0402 p.2；0402 p.15；0402 p.16；0402 p.17；0402 p.23 | 有：Hippocampus | 清單＋模型 | 已寫（位置、構造、功能、損傷表現） |
| 0038 | 下視丘<br>Hypothalamus | 核團 | 0218 p.8；0218 p.15；0305 p.3；0402 p.15；0402 p.25 | 有：Anterior hypothalamus、Lateral hypothalamus、Posterior hypothalamus…等 5 個 | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0039 | 內側嗅束<br>Medial olfactory stria | 纖維束／傳導路徑 | 0218 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0040 | 外側嗅束<br>Lateral olfactory stria | 纖維束／傳導路徑 | 0218 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0041 | 前穿質<br>Anterior perforated substance | 其他結構 | 0218 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0042 | 乳頭體<br>Mammillary body | 其他結構 | 0218 p.9；0218 p.14；0402 p.16；0402 p.19 | 有：Mamillary body | 清單＋模型 | 已寫（位置、傳入、傳出、功能、損傷表現） |
| 0043 | 大腦腳<br>Crus cerebri | 纖維束／傳導路徑 | 0218 p.9；0305 p.4；0305 p.20；0423 p.12；0430 p.10；0305 p.12 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、損傷表現） |
| 0044 | 輸出性纖維<br>Efferent fiber, motor nerve | 纖維束／傳導路徑 | 0218 p.9 | — | 否 | 已剔除：泛稱（輸出性纖維），不是具體構造 |
| 0045 | 後穿質<br>Posterior perforated substance | 其他結構 | 0218 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造） |
| 0046 | 內外側大腦縱束<br>Medial & Lateral longitudinal fasciculus | 纖維束／傳導路徑 | 0218 p.10 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0047 | 腦島<br>Insula | 皮質／腦迴／腦溝／腦葉 | 0218 p.5；0218 p.10；0311 p.3 | 有：Insula (Subcentral gyrus and ant. and post. sulci)、Circular sulcus of insula | 清單＋模型 | 已寫（位置、Brodmann 編號、功能、損傷表現、影像表現） |
| 0048 | 側腦室<br>Lateral ventricle | 腦室／腦池／腦膜 | 0218 p.10 | 有：Lateral ventricle | 清單＋模型 | 已寫（位置、連通關係、內容物、臨床意義、影像表現） |
| 0049 | 第三腦室<br>Third ventricle | 腦室／腦池／腦膜 | 0218 p.10 | 有：Third ventricle | 清單＋模型 | 已寫（位置、連通關係、內容物、臨床意義） |
| 0050 | 第四腦室<br>Fourth ventricle | 腦室／腦池／腦膜 | 0218 p.10；0305 p.18；0324 p.4 | 有：Fourth ventricle | 清單＋模型 | 已寫（位置、連通關係、內容物、臨床意義） |
| 0051 | 中腦導水管<br>Mesencephalic aqueduct | 腦室／腦池／腦膜 | 0218 p.10 | 見 0242 | 見 0242 | 併入 0242「大腦導水管（中腦導水管）」，名稱保留為別名 |
| 0052 | 側孔<br>Lateral aperture | 腦室／腦池／腦膜 | 0218 p.10 | 模型未有 | 僅清單（模型未有） | 已寫（位置、連通關係） |
| 0053 | 小腦延髓池<br>Cerebellomedullary cistern | 腦室／腦池／腦膜 | 0218 p.10 | 模型未有 | 僅清單（模型未有） | 已寫（位置、連通關係、臨床意義） |
| 0054 | 蜘蛛網膜下腔<br>Subarachnoid space | 腦室／腦池／腦膜 | 0218 p.10；0218 p.11；0311 p.4；0311 p.5；0311 p.6；0430 p.3 | 模型未有 | 僅清單（模型未有） | 已寫（位置、連通關係、內容物、臨床意義） |
| 0055 | 脈絡叢<br>Choroid plexus | 腦室／腦池／腦膜 | 0218 p.11；0305 p.11；0311 p.20 | 有：Choroid plexus | 清單＋模型 | 已寫（位置、內容物、功能、臨床意義） |
| 0056 | 室間孔<br>Interventricular foramen | 腦室／腦池／腦膜 | 0218 p.11；0305 p.7 | 模型未有 | 僅清單（模型未有） | 已寫（位置、連通關係、臨床意義） |
| 0057 | 聯合纖維<br>Commissural fibers | 纖維束／傳導路徑 | 0218 p.12 | 有：Corpus callosum、Anterior commissure、Hippocampal commissure…等 4 個 | 清單＋模型 | 已寫（位置、功能、損傷表現） |
| 0058 | 投射纖維<br>Projection fibers | 纖維束／傳導路徑 | 0218 p.12 | 有：Corticospinal tract、Corticobulbar tract、Corticopontine tract (frontal)…等 10 個 | 清單＋模型 | 已寫（位置、功能） |
| 0059 | 內囊前腳<br>Anterior limb | 纖維束／傳導路徑 | 0218 p.12 | 有：Anterior limb of internal capsule | 清單＋模型 | 已寫（位置、傳遞內容、損傷表現） |
| 0060 | 內囊膝部<br>Genu | 纖維束／傳導路徑 | 0218 p.12；0423 p.14 | 有：Genu of internal capsule | 清單＋模型 | 已寫（位置、傳遞內容、損傷表現） |
| 0061 | 殼核<br>Putamen | 核團 | 0218 p.13；0218 p.16；0311 p.13；0311 p.15；0430 p.10；0430 p.11；0430 p.34 | 有：Putamen | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0062 | 蒼白球<br>Globus pallidus | 核團 | 0218 p.13；0218 p.16；0311 p.15；0430 p.10 | 有：Globus pallidus external、Globus pallidus internal | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0063 | 尾狀核<br>Caudate nucleus | 核團 | 0218 p.13；0218 p.16；0430 p.10；0430 p.11；0430 p.34 | 有：Caudate nucleus | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0064 | 結合纖維<br>Association fibers | 纖維束／傳導路徑 | 0218 p.13 | 有：Arcuate fasciculus、Superior longitudinal fasciculus I、Superior longitudinal fasciculus II…等 9 個 | 清單＋模型 | 已寫（位置、功能、損傷表現） |
| 0065 | 間腦<br>Diencephalon | 其他結構 | 0218 p.14；0305 p.3 | 有：@group:diencephalon | 清單＋模型 | 已寫（位置、構造、功能） |
| 0066 | 松果體<br>Pineal body | 其他結構 | 0218 p.14；0218 p.16 | 有：Pineal gland | 清單＋模型 | 已寫（位置、功能、臨床意義） |
| 0067 | 韁核<br>Habenular nuclei | 核團 | 0218 p.14 | 有：Habenula | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能） |
| 0068 | 下丘<br>inferior colliculus | 其他結構 | 0218 p.14；0305 p.6；0305 p.11；0305 p.18；0305 p.20 | 有：Inferior colliculus | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0069 | 旁室核<br>Paraventricular nucleus | 核團 | 0218 p.15 | 有：Paraventricular nucleus of hypothalamus | 清單＋模型 | 已寫（位置／所在高度、傳出、功能、損傷表現） |
| 0070 | 內側視前核<br>Medial preoptic nucleus | 核團 | 0218 p.15 | 有：Medial preoptic nucleus | 清單＋模型 | 已寫（位置／所在高度、傳出、功能） |
| 0071 | 外側下視丘核<br>Lateral hypothalamic area | 核團 | 0218 p.15 | 有：Lateral hypothalamus | 清單＋模型 | 已寫（位置／所在高度、功能、損傷表現） |
| 0072 | 腹內側核<br>Ventromedial nucleus | 核團 | 0218 p.15 | 有：Ventromedial nucleus of hypothalamus | 清單＋模型 | 已寫（位置／所在高度、功能、損傷表現） |
| 0073 | 下視丘後核<br>Posterior hypothalamic area | 核團 | 0218 p.15 | 有：Posterior hypothalamus | 清單＋模型 | 已寫（位置／所在高度、功能、損傷表現） |
| 0074 | 下視丘前核<br>Anterior hypothalamic area | 核團 | 0218 p.15 | 有：Anterior hypothalamus | 清單＋模型 | 已寫（位置／所在高度、功能、損傷表現） |
| 0075 | 視上核<br>Supra-optic nucleus | 核團 | 0218 p.15 | 有：Supraoptic nucleus | 清單＋模型 | 已寫（位置／所在高度、傳出、功能、損傷表現） |
| 0076 | 視交叉上核<br>Suprachiasmatic nucleus | 核團 | 0218 p.15 | 有：Suprachiasmatic nucleus | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能） |
| 0077 | 背內側核<br>Dorsomedial nucleus | 核團 | 0218 p.15 | 有：Dorsomedial nucleus of hypothalamus | 清單＋模型 | 已寫（位置／所在高度、功能） |
| 0078 | 上視丘<br>Epithalamus | 核團 | 0218 p.16 | 有：Habenula、Pineal gland、Stria medullaris thalami | 清單＋模型 | 已寫（位置、構造、功能） |
| 0079 | 底視丘<br>Subthalamus | 核團 | 0218 p.16 | 有：Subthalamic nucleus | 清單＋模型 | 已寫（位置、構造、功能、損傷表現） |
| 0080 | 基底核<br>Basal ganglia | 核團 | 0218 p.16；0311 p.3；0430 p.2；0430 p.10 | 有：@group:basal | 清單＋模型 | 已寫（位置、傳入、傳出、功能、損傷表現） |
| 0081 | 帶狀核<br>Claustrum | 核團 | 0218 p.16；0311 p.15 | 有：Claustrum | 清單＋模型 | 已寫（位置／所在高度、傳入、功能） |
| 0082 | 豆狀核<br>Lentiform nucleus | 核團 | 0218 p.16；0402 p.25；0430 p.10 | 有：Putamen、Globus pallidus external、Globus pallidus internal | 清單＋模型 | 已寫（位置／所在高度、功能、影像表現） |
| 0083 | 紋狀體<br>Corpus striatum | 其他結構 | 0218 p.16；0430 p.10 | 有：Caudate nucleus、Putamen | 清單＋模型 | 已寫（位置、功能、損傷表現） |
| 0084 | 內囊<br>Internal capsule | 纖維束／傳導路徑 | 0218 p.16；0305 p.12；0311 p.15；0324 p.16；0423 p.3；0430 p.10 | 有：Anterior limb of internal capsule、Genu of internal capsule、Posterior limb of internal capsule | 清單＋模型 | 已寫（位置、構造、傳遞內容、損傷表現、影像表現） |
| 0085 | 外囊<br>Lateral capsule | 纖維束／傳導路徑 | 0218 p.16；0311 p.15；0423 p.3 | 有：External capsule | 清單＋模型 | 已寫（位置、功能、影像表現） |
| 0086 | 伏隔核<br>Accumbens nucleus | 核團 | 0218 p.16 | 有：Nucleus accumbens | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能） |
| 0087 | 視丘迴路<br>Cortico-basal-thalamic loop | 纖維束／傳導路徑 | 0218 p.18 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能、損傷表現） |
| 0088 | 丘腦底核<br>Subthalamic nucleus | 核團 | 0218 p.18 | 有：Subthalamic nucleus | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0089 | 灰質<br>Gray Matter | 其他結構 | 0226 p.2；0226 p.3；0226 p.7；0324 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0090 | 白質<br>White Matter | 其他結構 | 0226 p.2；0226 p.3；0226 p.11；0324 p.8 | 有：White matter of telencephalon | 清單＋模型 | 已寫（位置、構造、功能） |
| 0091 | 神經核<br>Nuclei | 核團 | 0226 p.3 | — | 否 | 已剔除：泛稱（神經核），不是具體構造 |
| 0092 | 細胞本體<br>Cell body | 其他結構 | 0226 p.3 | — | 否 | 已剔除：細胞層級概念（細胞本體），不是解剖構造 |
| 0093 | 神經節<br>Ganglia | 核團 | 0226 p.3；0430 p.25 | — | 否 | 已剔除：泛稱（神經節），不是具體構造 |
| 0094 | 神經膠細胞<br>Neuroglia | 神經 | 0226 p.3 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0095 | 路徑<br>Tracts | 纖維束／傳導路徑 | 0226 p.3；0226 p.20；0411 p.10 | — | 否 | 已剔除：泛稱（路徑），不是具體構造 |
| 0096 | 間的神經纖維<br>Axon | 纖維束／傳導路徑 | 0226 p.3 | — | 否 | 已剔除：細胞層級概念（軸突），不是解剖構造 |
| 0097 | 神經<br>Nerves | 神經 | 0226 p.3；0305 p.16 | — | 否 | 已剔除：泛稱（神經），不是具體構造 |
| 0098 | 錐體交叉<br>Decussation of pyramid | 纖維束／傳導路徑 | 0226 p.4；0305 p.15；0423 p.12；0305 p.12；0423 p.13 | 模型未有 | 僅清單（模型未有） | 已寫（位置、傳遞內容、損傷表現） |
| 0099 | 枕骨大孔<br>Foramen magnum | 腦室／腦池／腦膜 | 0226 p.4；0324 p.4 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、臨床意義） |
| 0100 | 圓錐結節<br>Conus medullaris | 其他結構 | 0226 p.4 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能、損傷表現） |
| 0101 | 馬尾<br>Cauda equina | 其他結構 | 0226 p.4 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、臨床意義） |
| 0102 | 前正中裂<br>Anterior median fissure | 其他結構 | 0226 p.5；0311 p.19 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造） |
| 0103 | 後正中溝<br>Posterior median sulcus | 其他結構 | 0226 p.5 | 模型未有 | 僅清單（模型未有） | 已寫（位置） |
| 0104 | 樹突與軸突<br>Cell process | 其他結構 | 0226 p.5 | — | 否 | 已剔除：細胞層級概念（樹突與軸突），不是解剖構造 |
| 0105 | 灰質聯合區<br>Gray commissure | 纖維束／傳導路徑 | 0226 p.5 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0106 | 中央管<br>Central canal | 腦室／腦池／腦膜 | 0226 p.5；0305 p.7；0305 p.9；0305 p.15；0424 p.18 | 模型未有 | 僅清單（模型未有） | 已寫（位置、內容物、臨床意義） |
| 0107 | 腹角<br>Anterior/Ventral horn | 其他結構 | 0226 p.5 | 見 0119 | 見 0119 | 併入 0119「前角（腹角）」，名稱保留為別名 |
| 0108 | 背角<br>Posterior/Dorsal horn | 其他結構 | 0226 p.5 | 見 0110 | 見 0110 | 併入 0110「後角（背角）」，名稱保留為別名 |
| 0109 | 橫向直徑<br>Transverse diameter | 纖維束／傳導路徑 | 0226 p.5 | — | 否 | 已剔除：測量描述（橫向直徑），不是構造 |
| 0110 | 後角（背角）<br>Posterior horn (dorsal horn) | 其他結構 | 0226 p.5；0226 p.7；0226 p.13；0226 p.16；0226 p.17；0226 p.18 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、損傷表現） |
| 0111 | 後邊緣核<br>Posteromarginal Nucleus | 核團 | 0226 p.7 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能） |
| 0112 | 膠狀質<br>Substantia gelatinosa | 其他結構 | 0226 p.7 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0113 | 固有核<br>Nucleus proprius | 核團 | 0226 p.7 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能） |
| 0114 | 克拉克背核<br>Clarke’s nucleus (dorsal nucleus) | 核團 | 0226 p.7；0226 p.18；0324 p.17；0411 p.17 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0115 | 側角<br>Lateral horn | 其他結構 | 0226 p.7；0226 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0116 | 內臟感覺核<br>Visceral afferent nucleus | 核團 | 0226 p.8；0402 p.26 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、功能） |
| 0117 | 胸腰髓節（C8–L2）<br>Thoracolumbar spinal segments (C8–L2) | 其他結構 | 0226 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0118 | 薦髓節（S2–S4）<br>Sacral spinal segments (S2–S4) | 其他結構 | 0226 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0119 | 前角（腹角）<br>Anterior horn (ventral horn) | 其他結構 | 0226 p.5；0226 p.9；0423 p.4；0423 p.16 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、損傷表現） |
| 0120 | 肌梭外纖維<br>Extrafusal fibers | 纖維束／傳導路徑 | 0226 p.9；0423 p.3；0423 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、傳遞內容） |
| 0121 | 網狀系統<br>Reticular formation | 其他結構 | 0226 p.9；0305 p.11；0324 p.16；0411 p.22；0423 p.17 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、損傷表現） |
| 0122 | 肌梭內纖維<br>Infrafusal muscle spindle | 纖維束／傳導路徑 | 0226 p.9 | 見 0498 | 見 0498 | 併入 0498「梭內肌纖維」，名稱保留為別名 |
| 0123 | 雷氏分層<br>Rexed lamination | 其他結構 | 0226 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0124 | 中間帶<br>Intermediate zone | 其他結構 | 0226 p.10 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0125 | 灰質柱<br>Columns | 其他結構 | 0226 p.11 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0126 | 索<br>Funiculi | 其他結構 | 0226 p.11 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0127 | 背索<br>Posterior/Dorsal funiculus | 其他結構 | 0226 p.11 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、損傷表現） |
| 0128 | 腹索<br>Anterior/Ventral funiculus | 其他結構 | 0226 p.11；0423 p.12；0423 p.13；0423 p.19；0423 p.21；0424 p.18 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0129 | 側索<br>Lateral funiculus | 其他結構 | 0226 p.11；0423 p.19；0226 p.18；0423 p.12；0423 p.13 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0130 | 皮質脊髓徑<br>Corticospinal tract | 纖維束／傳導路徑 | 0226 p.12；0226 p.20；0226 p.23；0305 p.12；0305 p.15；0305 p.5；0423 p.10 | 有：Corticospinal tract | 清單＋模型 | 已寫（起始神經元、交叉位置、中繼站、終點、傳遞內容、損傷表現） |
| 0131 | 脊髓丘腦徑<br>Spinothalamic tract | 纖維束／傳導路徑 | 0226 p.12；0305 p.13；0411 p.10；0226 p.14；0226 p.16；0411 p.11 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、中繼站、終點、傳遞內容、損傷表現） |
| 0132 | 短程固有束<br>Proper fasciculus/Intersegmental tract | 纖維束／傳導路徑 | 0226 p.12 | 模型未有 | 僅清單（模型未有） | 已寫（傳遞內容、終點、功能） |
| 0133 | 脊髓背角<br>Dorsal horn | 其他結構 | 0226 p.13；0226 p.16；0226 p.17；0226 p.18 | 見 0110 | 見 0110 | 併入 0110「後角（背角）」，名稱保留為別名 |
| 0134 | 背根神經節<br>Dorsal root ganglion (DRG) | 神經 | 0226 p.13；0324 p.17；0411 p.5；0411 p.11；0226 p.15；0226 p.16；0226 p.18；0226 p.19；0423 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、分布、功能、損傷表現） |
| 0135 | 視丘<br>Thalamus | 核團 | 0226 p.13；0226 p.15；0226 p.16；0226 p.17；0305 p.3；0305 p.7；0324 p.7；0402 p.15；0430 p.10；0430 p.34 | 有：Anterior nuclei of thalamus、Intralaminar and lateral posterior nuclei、Mediodorsal nucleus…等 9 個 | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0136 | 延腦<br>Medulla | 其他結構 | 0226 p.13；0226 p.19；0411 p.9；0411 p.10；0411 p.21；0430 p.26；0430 p.34；0226 p.15；0324 p.4 | 有：Medulla oblongata | 清單＋模型 | 已寫（位置、構造、功能、損傷表現） |
| 0137 | 小腦<br>Cerebellum | 其他結構 | 0226 p.13；0424 p.17；0430 p.34；0324 p.2；0324 p.13；0324 p.20 | 有：@group:cerebellum | 清單＋模型 | 已寫（位置、構造、功能、損傷表現） |
| 0138 | 大腦皮質<br>Cerebral cortex | 皮質／腦迴／腦溝／腦葉 | 0226 p.13；0226 p.17；0324 p.16 | 有：@cortex | 清單＋模型 | 已寫（位置、構造、功能） |
| 0139 | 某處進行交叉<br>Cross over/decussate | 纖維束／傳導路徑 | 0226 p.13 | — | 否 | 已剔除：概念（交叉），不是構造 |
| 0140 | 跨過中央聯合<br>Central commissure | 纖維束／傳導路徑 | 0226 p.13 | 模型未有 | 僅清單（模型未有） | 已寫（交叉位置、功能） |
| 0141 | 上升徑<br>Ascending/Sensory tracts | 纖維束／傳導路徑 | 0226 p.14；0305 p.13 | 模型未有 | 僅清單（模型未有） | 已寫（傳遞內容、終點、損傷表現） |
| 0142 | 脊髓視丘路徑<br>Spinothalamic/Anterolateral pathways | 纖維束／傳導路徑 | 0226 p.14；0226 p.16 | 見 0131 | 見 0131 | 併入 0131「脊髓丘腦徑」，名稱保留為別名 |
| 0143 | 脊髓小腦路徑<br>Spinocerebellar pathways | 纖維束／傳導路徑 | 0226 p.14；0226 p.18 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、終點、傳遞內容、損傷表現） |
| 0144 | 背柱路徑<br>Dorsal Column Tract | 纖維束／傳導路徑 | 0226 p.14；0226 p.19 | 見 0493 | 見 0493 | 併入 0493「後柱—內側丘系路徑」，名稱保留為別名 |
| 0145 | 同側背根神經節<br>Dorsal root ganglion | 神經 | 0226 p.15；0226 p.16；0226 p.18；0226 p.19 | 見 0134 | 見 0134 | 併入 0134「背根神經節」，名稱保留為別名 |
| 0146 | 同側延腦<br>Medulla oblongata | 其他結構 | 0226 p.15；0226 p.19；0324 p.4 | 見 0136 | 見 0136 | 併入 0136「延腦」，名稱保留為別名 |
| 0147 | 薄束核<br>Gracile nucleus (Nucleus gracilis) | 核團 | 0226 p.15；0226 p.16；0305 p.13；0305 p.15；0411 p.9；0305 p.6；0411 p.10 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0148 | 楔形核<br>Cuneate nucleus (Nucleus cuneatus) | 核團 | 0226 p.15；0226 p.16；0305 p.13；0305 p.15；0411 p.9；0411 p.10；0305 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能） |
| 0149 | 楔束<br>Fasciculus cuneatus | 纖維束／傳導路徑 | 0226 p.15；0226 p.16；0305 p.13；0411 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、中繼站、終點、傳遞內容、損傷表現） |
| 0150 | 薄束<br>Fasciculus gracilis | 纖維束／傳導路徑 | 0226 p.15；0226 p.16；0305 p.13；0411 p.8；0305 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、中繼站、終點、傳遞內容、損傷表現） |
| 0151 | 內側弓狀纖維<br>Internal arcuate fibers | 纖維束／傳導路徑 | 0226 p.16；0305 p.13；0305 p.16；0411 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、終點、傳遞內容） |
| 0152 | 大腦感覺皮質區<br>Postcentral gyrus in cerebral cortex | 皮質／腦迴／腦溝／腦葉 | 0226 p.16 | 見 0007 | 見 0007 | 併入 0007「中央後迴」，名稱保留為別名 |
| 0153 | 腹根<br>Ventral root | 其他結構 | 0226 p.16 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能、損傷表現） |
| 0154 | 脊髓白質側索<br>Lateral funiculi | 其他結構 | 0226 p.18 | 見 0129 | 見 0129 | 併入 0129「側索」，名稱保留為別名 |
| 0155 | 前側脊髓小腦徑<br>Anterior spinocerebellar tract | 纖維束／傳導路徑 | 0226 p.18；0324 p.17；0411 p.17 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、終點、傳遞內容） |
| 0156 | 後側脊髓小腦徑<br>Posterior spinocerebellar tract | 纖維束／傳導路徑 | 0226 p.18；0324 p.17 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、終點、傳遞內容、損傷表現） |
| 0157 | 背核<br>Dorsalis nucleus | 核團 | 0226 p.18；0324 p.17；0411 p.17 | 見 0114 | 見 0114 | 併入 0114「克拉克背核」，名稱保留為別名 |
| 0158 | 下小腦角<br>Inferior cerebellar cerebellar peduncle | 纖維束／傳導路徑 | 0226 p.18；0226 p.19 | 見 0194 | 見 0194 | 併入 0194「下小腦腳」，名稱保留為別名 |
| 0159 | 楔狀小腦徑<br>Cuneocerebellar Tract | 纖維束／傳導路徑 | 0226 p.19；0324 p.17；0411 p.17 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、終點、傳遞內容） |
| 0160 | 副楔形核<br>Accessory cuneate nucleus | 核團 | 0226 p.19；0324 p.17 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能） |
| 0161 | 白質下降徑<br>Descending tract | 纖維束／傳導路徑 | 0226 p.20；0305 p.12 | 模型未有 | 僅清單（模型未有） | 已寫（傳遞內容、功能、損傷表現） |
| 0162 | 運動徑<br>Motor tract | 纖維束／傳導路徑 | 0226 p.20 | 見 0161 | 見 0161 | 併入 0161「白質下降徑」，名稱保留為別名 |
| 0163 | 皮質腦幹徑<br>Corticobulbar tract | 纖維束／傳導路徑 | 0226 p.20；0423 p.14 | 有：Corticobulbar tract | 清單＋模型 | 已寫（起始神經元、中繼站、交叉位置、傳遞內容、損傷表現） |
| 0164 | 外側皮質脊髓徑<br>Lateral corticospinal tract (LCST) | 纖維束／傳導路徑 | 0226 p.20；0305 p.12；0423 p.10；0423 p.13 | 近似：Corticospinal tract | 清單＋模型 | 已寫（起始神經元、交叉位置、終點、傳遞內容、損傷表現） |
| 0165 | 前側皮質脊髓徑<br>Anterior corticospinal tract (ACST) | 纖維束／傳導路徑 | 0226 p.20；0305 p.12；0423 p.10；0423 p.13 | 近似：Corticospinal tract | 清單＋模型 | 已寫（起始神經元、交叉位置、終點、傳遞內容） |
| 0166 | 錐狀細胞<br>Pyramidal cell | 其他結構 | 0226 p.20 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0167 | 初級運動皮層<br>Primary motor cortex | 皮質／腦迴／腦溝／腦葉 | 0226 p.22；0423 p.10；0423 p.14 | 近似：Precentral gyrus | 清單＋模型 | 已寫（位置、Brodmann 編號、功能、損傷表現） |
| 0168 | 紅核脊髓徑<br>Rubrospinal tract | 纖維束／傳導路徑 | 0226 p.22；0324 p.19；0423 p.18 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、終點、傳遞內容、損傷表現） |
| 0169 | 中腦紅核<br>Red nucleus | 核團 | 0226 p.22；0305 p.21；0324 p.7；0324 p.19 | 有：Red nucleus | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0170 | 頂蓋脊髓徑<br>Tectospinal tract | 纖維束／傳導路徑 | 0226 p.22；0423 p.21 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、終點、傳遞內容） |
| 0171 | 中腦上丘<br>Superior colliculus | 其他結構 | 0226 p.22；0305 p.6；0305 p.11；0305 p.20；0423 p.21 | 有：Superior colliculus | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0172 | 脊髓<br>spinal cord | 其他結構 | 0324 p.13；0324 p.17；0424 p.17 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、損傷表現） |
| 0173 | 前柱<br>anterior column | 其他結構 |  | 見 0128 | 見 0128 | 併入 0128「腹索」，名稱保留為別名 |
| 0175 | 脊髓小腦徑<br>posterior cerebellar tract | 纖維束／傳導路徑 |  | 見 0156 | 見 0156 | 併入 0156「後側脊髓小腦徑」，名稱保留為別名 |
| 0177 | 後顱窩<br>Posterior cranial fossa | 其他結構 | 0305 p.3；0324 p.4 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、臨床意義） |
| 0178 | 斜坡<br>Clivus | 其他結構 | 0305 p.3 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能、臨床意義） |
| 0179 | 中腦<br>Midbrain | 其他結構 | 0305 p.3；0305 p.12；0430 p.34 | 有：Midbrain | 清單＋模型 | 已寫（位置、構造、功能、損傷表現） |
| 0180 | 橋腦<br>Pons | 其他結構 | 0305 p.3；0305 p.12；0324 p.4；0324 p.7；0324 p.13；0411 p.21；0430 p.26；0430 p.34 | 有：Pons | 清單＋模型 | 已寫（位置、構造、功能、損傷表現） |
| 0181 | 腳間窩<br>Interpeduncular fossa | 其他結構 | 0305 p.4；0305 p.21 | 有：Interpeduncular fossa | 清單＋模型 | 已寫（位置、構造、功能） |
| 0182 | 中小腦腳<br>Middle cerebellar peduncle | 纖維束／傳導路徑 | 0305 p.4；0305 p.6；0324 p.7；0324 p.16 | 有：Middle cerebellar peduncle | 清單＋模型 | 已寫（位置、傳遞內容、終點、損傷表現） |
| 0183 | 錐體<br>Pyramid | 其他結構 | 0305 p.5；0305 p.12 | 有：Pyramid of medulla oblongata | 清單＋模型 | 已寫（位置、構造、功能、損傷表現） |
| 0184 | 錐體徑<br>pyramidal tract | 纖維束／傳導路徑 | 0305 p.5；0305 p.12；0423 p.10 | 見 0130 | 見 0130 | 併入 0130「皮質脊髓徑」，名稱保留為別名 |
| 0185 | 橄欖<br>Olive | 其他結構 | 0305 p.5 | 有：Olive | 清單＋模型 | 已寫（位置、構造、功能） |
| 0186 | 內含下橄欖核<br>inf. olivary nucleus | 核團 | 0305 p.5 | 見 0211 | 見 0211 | 併入 0211「下橄欖核」，名稱保留為別名 |
| 0187 | 四疊體<br>Corpora quadrigemina | 其他結構 | 0305 p.6 | 有：Superior colliculus、Inferior colliculus | 清單＋模型 | 已寫（位置、功能、臨床意義） |
| 0188 | 上丘臂<br>Brachium of superior colliculus | 其他結構 | 0305 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、傳遞內容） |
| 0189 | 外膝狀體<br>Lateral geniculate body | 其他結構 | 0305 p.6；0311 p.11 | 有：Lateral geniculate body | 清單＋模型 | 已寫（位置、構造、傳入、傳出、功能、損傷表現） |
| 0190 | 下丘臂<br>Brachium of inferior colliculus | 其他結構 | 0305 p.6；0424 p.10；0305 p.18 | 模型未有 | 僅清單（模型未有） | 已寫（位置、傳遞內容） |
| 0191 | 內膝狀體<br>Medial geniculate body | 其他結構 | 0305 p.6；0305 p.18；0424 p.10 | 有：Medial geniculate body | 清單＋模型 | 已寫（位置、傳入、傳出、功能、損傷表現） |
| 0192 | 菱形窩<br>Rhomboid fossa | 其他結構 | 0305 p.6；0305 p.16 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0193 | 上小腦腳<br>Superior cerebellar peduncle | 纖維束／傳導路徑 | 0305 p.6；0324 p.6；0324 p.17 | 有：Superior cerebellar peduncle | 清單＋模型 | 已寫（位置、傳遞內容、損傷表現） |
| 0194 | 下小腦腳<br>Inferior cerebellar peduncle (ICP) | 纖維束／傳導路徑 | 0226 p.18；0226 p.19；0305 p.6；0305 p.22；0324 p.7；0324 p.17；0424 p.17 | 有：Inferior cerebellar peduncle | 清單＋模型 | 已寫（位置、傳遞內容、損傷表現） |
| 0195 | 薄狀結節<br>Gracile tubercle | 其他結構 | 0305 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0196 | 內含薄核<br>Gracile nucleus | 核團 | 0305 p.6；0411 p.10 | 見 0147 | 見 0147 | 併入 0147「薄束核」，名稱保留為別名 |
| 0197 | 脊髓傳至薄束<br>gracile fasciculus | 纖維束／傳導路徑 | 0305 p.6 | 見 0150 | 見 0150 | 併入 0150「薄束」，名稱保留為別名 |
| 0198 | 楔狀結節<br>Cuneate tubercle | 其他結構 | 0305 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0199 | 內含楔狀核<br>Cuneate nucleus | 核團 | 0305 p.6 | 見 0148 | 見 0148 | 併入 0148「楔形核」，名稱保留為別名 |
| 0200 | 四疊板<br>Tectum | 其他結構 | 0305 p.8；0305 p.11 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能、臨床意義） |
| 0201 | 髓帆<br>Medullary velum | 其他結構 | 0305 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0202 | 上髓帆<br>Sup. medullary velum | 其他結構 | 0305 p.8；0305 p.11；0305 p.18 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造） |
| 0203 | 下髓帆<br>Inf. medullary velum | 其他結構 | 0305 p.8；0305 p.11；0305 p.16 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造） |
| 0204 | 髓紋<br>Striae medullares | 其他結構 | 0305 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0205 | 基板<br>Basal plate | 其他結構 | 0305 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0206 | 翼板<br>Alar plate | 其他結構 | 0305 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0207 | 正中溝<br>Dorsal median sulcus | 其他結構 | 0305 p.9；0305 p.18 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0208 | 界溝<br>sulcus limitans | 其他結構 | 0305 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0209 | 背蓋<br>Tegmentum | 其他結構 | 0305 p.11；0305 p.20 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0210 | 橋腦核<br>Pontine nuclei | 核團 | 0305 p.11；0305 p.19；0324 p.16 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0211 | 下橄欖核<br>inferior olivary nucleus | 核團 | 0305 p.5；0305 p.11；0324 p.17；0305 p.16 | 有：Olive | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0212 | 放射冠<br>Corona radiata | 其他結構 | 0305 p.12；0324 p.16 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能、損傷表現） |
| 0213 | 部的大腦腳<br>Cerebral Crus | 纖維束／傳導路徑 | 0305 p.12 | 見 0043 | 見 0043 | 併入 0043「大腦腳」，名稱保留為別名 |
| 0214 | 體交叉<br>Pyramidal decussation | 纖維束／傳導路徑 | 0305 p.12；0423 p.13 | 見 0098 | 見 0098 | 併入 0098「錐體交叉」，名稱保留為別名 |
| 0215 | 運動交叉<br>Motor decussation | 纖維束／傳導路徑 | 0305 p.12 | 見 0098 | 見 0098 | 併入 0098「錐體交叉」，名稱保留為別名 |
| 0216 | 內側蹄系交叉或感覺交叉<br>Sensory decussation | 纖維束／傳導路徑 | 0305 p.13 | 見 0218 | 見 0218 | 併入 0218「內側蹄系交叉」，名稱保留為別名 |
| 0217 | 延腦尾側（閉鎖部）<br>Caudal (closed) medulla | 其他結構 | 0305 p.15 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0218 | 內側蹄系交叉<br>Decussation of medial lemnisci | 纖維束／傳導路徑 | 0305 p.13；0305 p.15；0305 p.16 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能、損傷表現） |
| 0219 | 內側蹄系<br>medial lemniscus | 纖維束／傳導路徑 | 0305 p.16；0305 p.22；0411 p.6；0411 p.9 | 有：Medial lemniscus | 清單＋模型 | 已寫（起始神經元、交叉位置、中繼站、終點、傳遞內容、損傷表現） |
| 0220 | 延腦吻側（開放部）<br>Rostral (open) medulla | 其他結構 | 0305 p.16 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、損傷表現） |
| 0221 | 橄欖核複體<br>Olivary nuc. complex | 核團 | 0305 p.16 | 見 0211 | 見 0211 | 併入 0211「下橄欖核」，名稱保留為別名 |
| 0222 | 舌下神經核<br>Hypoglossal nucleus | 核團 | 0305 p.16 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0223 | 迷走神經背核<br>Dorsal vagal nucleus | 核團 | 0305 p.16；0411 p.19 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能） |
| 0224 | 內側縱束<br>Medial longitudinal fasciculus (MLF) | 纖維束／傳導路徑 | 0305 p.16；0423 p.19；0424 p.18 | 模型未有 | 僅清單（模型未有） | 已寫（位置、傳遞內容、損傷表現） |
| 0225 | 疑核<br>Nucleus ambiguus | 核團 | 0305 p.17；0411 p.19；0423 p.16 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0226 | 孤立核<br>solitary nucleus | 核團 | 0305 p.17；0411 p.19 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能） |
| 0227 | 味覺的上升徑<br>ascending taste pathway | 纖維束／傳導路徑 | 0305 p.17 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、中繼站、終點、傳遞內容、損傷表現） |
| 0228 | 顏面神經<br>Facial nerve (CN VII) | 神經 | 0305 p.17；0305 p.18 | 有：Facial nerve (VII) | 清單＋模型 | 已寫（起源核團、出腦位置、分布、功能、損傷表現） |
| 0229 | 舌咽神經<br>Glossopharyngeal nerve (CN IX) | 神經 | 0305 p.17 | 模型未有 | 僅清單（模型未有） | 已寫（起源核團、出腦位置、分布、功能、損傷表現） |
| 0230 | 迷走神經<br>Vagus nerve (CN X) | 神經 | 0305 p.17 | 有：Vagus nerve (X) | 清單＋模型 | 已寫（起源核團、出腦位置、分布、功能、損傷表現） |
| 0231 | 顏面丘<br>Facial colliculus | 其他結構 | 0305 p.18 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、臨床意義） |
| 0232 | 外旋神經核（展神經核）<br>Abducens nucleus (nucleus of abducens nerve) | 核團 | 0305 p.18 | 有：Nucleus of abducens nerve | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0233 | 顏面神經纖維<br>Facial nerve fibers | 纖維束／傳導路徑 | 0305 p.18 | 見 0228 | 見 0228 | 併入 0228「顏面神經」，名稱保留為別名 |
| 0234 | 斜方體<br>Trapezoid body | 其他結構 | 0305 p.18 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0235 | 上行聽覺傳導路徑<br>Ascending central auditory pathways | 纖維束／傳導路徑 | 0305 p.18；0424 p.9；0424 p.10 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、中繼站、終點、傳遞內容、損傷表現） |
| 0236 | 耳蝸神經核<br>Cochlear nucleus | 核團 | 0305 p.18；0424 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0237 | 上橄欖核<br>Superior olivary nucleus | 核團 | 0305 p.18；0424 p.10 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0238 | 四疊體下臂<br>Inferior quadrigeminal brachium | 其他結構 | 0305 p.18 | 見 0190 | 見 0190 | 併入 0190「下丘臂」，名稱保留為別名 |
| 0239 | 初級聽覺皮質<br>Primary auditory cortex | 皮質／腦迴／腦溝／腦葉 | 0305 p.18；0424 p.12 | 有：Transverse temporal gyri | 清單＋模型 | 已寫（位置、Brodmann 編號、功能、損傷表現） |
| 0240 | 三叉神經核<br>Trigeminal nuclei | 核團 | 0305 p.19 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0241 | 滑車神經核<br>Trochlear nucleus | 核團 | 0305 p.20 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0242 | 大腦導水管（中腦導水管）<br>Cerebral aqueduct (Mesencephalic aqueduct) | 腦室／腦池／腦膜 | 0218 p.10；0305 p.20 | 有：Aqueduct of midbrain | 清單＋模型 | 已寫（位置、連通關係、內容物、臨床意義、影像表現） |
| 0243 | 滑車神經<br>Trochlear nerve (CN IV) | 神經 | 0305 p.20；0430 p.25 | 有：Trochlear nerve (IV) | 清單＋模型 | 已寫（起源核團、出腦位置、分布、功能、損傷表現） |
| 0244 | 黑質<br>Substantia nigra | 其他結構 | 0305 p.20 | 有：Substantia nigra | 清單＋模型 | 已寫（位置、構造、功能、損傷表現） |
| 0245 | 黑質緻密部<br>Substantia nigra, pars compacta | 其他結構 | 0305 p.20 | 近似：Substantia nigra | 清單＋模型 | 已寫（位置、傳出、功能、損傷表現） |
| 0246 | 黑質網狀部<br>Substantia nigra, pars reticulata | 其他結構 | 0305 p.20 | 近似：Substantia nigra | 清單＋模型 | 已寫（位置、傳入、傳出、功能） |
| 0247 | 黑質外側部<br>Substantia nigra, pars lateralis | 其他結構 | 0305 p.20 | 近似：Substantia nigra | 清單＋模型 | 已寫（位置、功能） |
| 0248 | 動眼神經核<br>Oculomotor nucleus | 核團 | 0305 p.21 | 有：Nucleus of oculomotor nerve、Accessory nucleus of oculomotor nerve | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0249 | 動眼神經<br>Oculomotor nerve (CN III) | 神經 | 0305 p.21；0305 p.23；0430 p.24 | 有：Oculomotor nerve (III) | 清單＋模型 | 已寫（起源核團、出腦位置、分布、功能、損傷表現） |
| 0250 | 前庭核<br>Vestibular nucleus | 核團 | 0305 p.22；0424 p.17 | 有：Vestibular nuclei | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0251 | 舌下神經<br>Hypoglossal nerve (CN XII) | 神經 | 0305 p.22 | 有：Hypoglossal nerve (XII) | 清單＋模型 | 已寫（起源核團、出腦位置、分布、功能、損傷表現） |
| 0252 | 後縫核<br>Posterior raphe nucleus | 核團 |  | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳出、功能） |
| 0253 | 黑質緻密部<br>substantia nigra, pars compacta | 其他結構 |  | 見 0245 | 見 0245 | 併入 0245「黑質緻密部」，名稱保留為別名 |
| 0255 | 脊髓丘系<br>spinal lemniscus | 纖維束／傳導路徑 |  | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、終點、傳遞內容、損傷表現） |
| 0256 | 外側蹄系<br>lateral lemniscus | 纖維束／傳導路徑 | 0424 p.10 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、中繼站、終點、傳遞內容、損傷表現） |
| 0257 | 三叉神經中腦核<br>Mesencephalic nucleus of trigeminal nerve | 核團 | 0411 p.15 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能） |
| 0258 | 內側前庭核<br>Medial vestibular nucleus | 核團 | 0424 p.18 | 近似：Vestibular nuclei | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能） |
| 0260 | 顏面神經核<br>facial nucleus | 核團 |  | 有：Motor nucleus of facial nerve | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0261 | 疑核<br>ambiguous nucleus (nucleus ambiguus) | 核團 |  | 見 0225 | 見 0225 | 併入 0225「疑核」，名稱保留為別名 |
| 0265 | 一樣可以放梗圖<br>The Blood Supply of the C.N.S. | 神經 | 0311 p.1；0402 p.1；0411 p.1；0430 p.1 | — | 否 | 已剔除：章節標題／梗圖說明（The Blood Supply of the C.N.S.），不是構造 |
| 0266 | 內頸動脈<br>Internal carotid artery (ICA) | 血管 | 0311 p.3；0311 p.6；0311 p.9；0311 p.11；0430 p.25；0430 p.35 | 有：Internal carotid artery | 清單＋模型 | 已寫（來源、分支、供應範圍、阻塞症狀） |
| 0267 | 椎動脈<br>Vertebral artery | 血管 | 0311 p.3；0311 p.17；0311 p.18；0311 p.19；0324 p.7；0430 p.30 | 模型未有 | 僅清單（模型未有） | 已寫（來源、分支、供應範圍、阻塞症狀） |
| 0268 | 前大腦動脈<br>Anterior cerebral artery (ACA) | 血管 | 0311 p.3；0311 p.5；0311 p.6；0311 p.12；0430 p.30；0430 p.31 | 有：Anterior cerebral artery | 清單＋模型 | 已寫（來源、分支、供應範圍、阻塞症狀） |
| 0269 | 中大腦動脈<br>Middle cerebral artery (MCA) | 血管 | 0311 p.3；0311 p.7；0430 p.30；0430 p.31；0430 p.32；0430 p.35；0430 p.36 | 有：Middle cerebral artery (M1-segment)、Middle cerebral artery (M3 segment)、Middle cerebral artery (M3-segment)…等 7 個 | 清單＋模型 | 已寫（來源、分支、供應範圍、阻塞症狀） |
| 0270 | 威利氏環<br>Circle of Willis | 其他結構 | 0311 p.3；0311 p.5；0311 p.6；0430 p.34；0430 p.33 | 有：Anterior communicating artery、Posterior communicating artery、Anterior cerebral artery…等 5 個 | 清單＋模型 | 已寫（位置、構造、功能、臨床意義） |
| 0271 | 鎖骨下動脈<br>Subclavian artery | 血管 | 0311 p.3 | 模型未有 | 僅清單（模型未有） | 已寫（來源、分支、供應範圍、阻塞症狀） |
| 0272 | 基底動脈<br>Basilar artery | 血管 | 0311 p.3；0311 p.17；0311 p.18；0311 p.19；0324 p.7；0430 p.30 | 有：Basilar artery | 清單＋模型 | 已寫（來源、分支、供應範圍、阻塞症狀） |
| 0273 | 橋腦動脈<br>Pontine arteries | 血管 | 0311 p.3；0311 p.19 | 有：Medial pontine branches of basilar artery、Lateral pontine branches of basilar artery | 清單＋模型 | 已寫（來源、分支、供應範圍、阻塞症狀） |
| 0274 | 後大腦動脈<br>Posterior cerebral artery (PCA) | 血管 | 0311 p.3；0311 p.5；0311 p.11；0311 p.19；0430 p.30；0430 p.31；0311 p.6 | 有：Posterior cerebral artery | 清單＋模型 | 已寫（來源、分支、供應範圍、阻塞症狀） |
| 0275 | 前下小腦動脈<br>Anterior inferior cerebellar artery (AICA) | 血管 | 0311 p.3；0324 p.7 | 有：Anterior inferior cerebellar artery | 清單＋模型 | 已寫（來源、分支、供應範圍、阻塞症狀） |
| 0276 | 後下小腦動脈<br>Posterior inferior cerebellar artery (PICA) | 血管 | 0311 p.3；0324 p.5；0324 p.7 | 有：Posterior inferior cerebellar artery | 清單＋模型 | 已寫（來源、分支、供應範圍、阻塞症狀） |
| 0277 | 上小腦動脈<br>Superior cerebellar artery | 血管 | 0311 p.3；0324 p.7 | 有：Superior cerebellar artery | 清單＋模型 | 已寫（來源、分支、供應範圍、阻塞症狀） |
| 0278 | 椎動脈第四段<br>Intracranial part | 血管 | 0311 p.3 | 見 0298 | 見 0298 | 併入 0298「椎動脈顱內段」，名稱保留為別名 |
| 0279 | 前脊髓動脈<br>Anterior spinal artery | 血管 | 0311 p.3；0311 p.19 | 模型未有 | 僅清單（模型未有） | 已寫（來源、分支、供應範圍、阻塞症狀） |
| 0280 | 後脊髓動脈<br>Posterior spinal artery | 血管 | 0311 p.3；0311 p.18；0311 p.19 | 模型未有 | 僅清單（模型未有） | 已寫（來源、分支、供應範圍、阻塞症狀） |
| 0281 | 外骨膜<br>Periosteum | 其他結構 | 0311 p.4；0311 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0282 | 顱骨<br>Cranial bone | 其他結構 | 0311 p.4 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能、臨床意義） |
| 0283 | 硬腦膜外空腔<br>Extradural | 腦室／腦池／腦膜 | 0311 p.4 | 見 0286 | 見 0286 | 併入 0286「硬腦膜上腔（硬膜外腔）」，名稱保留為別名 |
| 0284 | 硬腦膜靜脈竇<br>Dural venous sinuses | 血管 | 0311 p.4；0311 p.8 | 有：@group:veins | 清單＋模型 | 已寫（位置、構造、功能、臨床意義） |
| 0285 | 中硬腦膜動脈<br>Middle meningeal artery | 血管 | 0311 p.4；0311 p.18 | 模型未有 | 僅清單（模型未有） | 已寫（來源、分支、供應範圍、阻塞症狀） |
| 0286 | 硬腦膜上腔（硬膜外腔）<br>Epidural (extradural) space | 腦室／腦池／腦膜 | 0311 p.4 | 模型未有 | 僅清單（模型未有） | 已寫（位置、內容物、臨床意義） |
| 0287 | 腦膜層<br>Meningeal layer of dura mater | 腦室／腦池／腦膜 | 0311 p.4；0311 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0288 | 硬腦膜下腔<br>Subdural | 腦室／腦池／腦膜 | 0311 p.4 | 模型未有 | 僅清單（模型未有） | 已寫（位置、臨床意義） |
| 0289 | 蛛網膜<br>Arachnoid mater | 腦室／腦池／腦膜 | 0311 p.4 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0290 | 軟腦膜<br>Pia mater | 腦室／腦池／腦膜 | 0311 p.4 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0291 | 前交通動脈<br>Anterior communicating artery | 血管 | 0311 p.5 | 有：Anterior communicating artery | 清單＋模型 | 已寫（來源、供應範圍、阻塞症狀） |
| 0292 | 後交通動脈<br>Posterior communicating artery | 血管 | 0311 p.5；0311 p.6；0430 p.26；0430 p.35 | 有：Posterior communicating artery | 清單＋模型 | 已寫（來源、供應範圍、阻塞症狀） |
| 0293 | 頸段（內頸動脈與椎動脈的第一段）<br>Cervical part (segment 1 of ICA and vertebral artery) | 其他結構 | 0311 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能、臨床意義） |
| 0294 | 內頸動脈岩樣部段<br>Petrous part (ICA segment 2) | 其他結構 | 0311 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0295 | 內頸動脈海綿竇段<br>Cavernous part (ICA segment 3) | 血管 | 0311 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、分支、臨床意義） |
| 0296 | 椎動脈寰椎段<br>Atlantic part (vertebral artery segment 3) | 其他結構 | 0311 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能、臨床意義） |
| 0297 | 內頸動脈大腦段<br>Cerebral part (ICA segment 4) | 其他結構 | 0311 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、分支、功能） |
| 0298 | 椎動脈顱內段<br>Intracranial part (vertebral artery segment 4) | 其他結構 | 0311 p.3；0311 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、分支、功能） |
| 0299 | 總頸動脈<br>Common carotid artery | 血管 | 0311 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（來源、分支、供應範圍、阻塞症狀） |
| 0300 | 頸動脈孔<br>Carotid foramen | 血管 | 0311 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0301 | 頸動脈管<br>Carotid canal | 血管 | 0311 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0302 | 接後大腦動脈<br>Posterior cerebral a | 血管 | 0311 p.6 | 見 0274 | 見 0274 | 併入 0274「後大腦動脈」，名稱保留為別名 |
| 0303 | 前脈絡動脈<br>Anterior choroidal artery | 血管 | 0311 p.6；0311 p.11 | 模型未有 | 僅清單（模型未有） | 已寫（來源、分支、供應範圍、阻塞症狀） |
| 0304 | 眼動脈<br>Ophthalmic artery | 血管 | 0311 p.6；0311 p.10 | 有：Ophthalmic artery | 清單＋模型 | 已寫（來源、分支、供應範圍、阻塞症狀） |
| 0305 | 視神經<br>Optic nerve (CN II) | 神經 | 0311 p.6；0311 p.10；0430 p.23；0430 p.24 | 有：Optic nerve (II) | 清單＋模型 | 已寫（起源核團、出腦位置、分布、功能、損傷表現） |
| 0306 | 視神經管<br>Optic canal | 其他結構 | 0311 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、臨床意義） |
| 0307 | 海綿竇<br>Cavernous sinus | 血管 | 0311 p.8；0430 p.25 | 有：Cavernous sinus | 清單＋模型 | 已寫（位置、構造、功能、臨床意義） |
| 0308 | 硬腦膜<br>Dura mater | 腦室／腦池／腦膜 | 0311 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、臨床意義） |
| 0309 | 上岩狀竇與下岩狀竇<br>Superior and inferior petrosal sinuses | 血管 | 0311 p.8 | 有：Superior petrosal sinus、Inferior petrosal sinus | 清單＋模型 | 已寫（位置、構造、功能、臨床意義） |
| 0310 | 翼靜脈叢<br>Pterygoid venous plexus | 血管 | 0311 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、臨床意義） |
| 0311 | 骨膜層<br>Periosteal layer | 其他結構 | 0311 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0312 | 硬腦膜固有層<br>Dura mater proper | 腦室／腦池／腦膜 | 0311 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0313 | 視神經孔<br>Optic foramen | 其他結構 | 0311 p.10 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、臨床意義） |
| 0314 | 狀體<br>Lat. Geniculate body | 其他結構 | 0311 p.11 | 見 0189 | 見 0189 | 併入 0189「外膝狀體」，名稱保留為別名 |
| 0315 | 後脈絡動脈<br>Posterior choroidal artery | 血管 | 0311 p.11 | 模型未有 | 僅清單（模型未有） | 已寫（來源、分支、供應範圍、阻塞症狀） |
| 0316 | 皮質支<br>Cortical branches (of cerebral arteries) | 血管 | 0311 p.12 | 模型未有 | 僅清單（模型未有） | 已寫（來源、分支、供應範圍、阻塞症狀） |
| 0317 | 中央支<br>Central branches (of cerebral arteries) | 血管 | 0311 p.12 | 模型未有 | 僅清單（模型未有） | 已寫（來源、分支、供應範圍、阻塞症狀） |
| 0318 | 橋腦基底溝<br>Basilar sulcus | 其他結構 | 0311 p.17 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0319 | 腦膜支<br>Meningeal branch (of vertebral artery) | 血管 | 0311 p.18 | 模型未有 | 僅清單（模型未有） | 已寫（來源、供應範圍、阻塞症狀） |
| 0320 | 外側溝<br>Posterolateral sulcus | 其他結構 | 0311 p.18 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0321 | 延髓動脈<br>Medullary artery (medulla oblongata) | 血管 | 0311 p.19 | 模型未有 | 僅清單（模型未有） | 已寫（來源、供應範圍、阻塞症狀） |
| 0322 | 深頸動脈<br>Deep cervical artery | 血管 | 0311 p.24 | 模型未有 | 僅清單（模型未有） | 已寫（來源、分支、供應範圍） |
| 0323 | 升頸動脈<br>Ascending cervical artery | 血管 | 0311 p.24 | 模型未有 | 僅清單（模型未有） | 已寫（來源、分支、供應範圍） |
| 0324 | 後肋間動脈<br>Posterior intercostal artery | 血管 | 0311 p.24 | 模型未有 | 僅清單（模型未有） | 已寫（來源、分支、供應範圍） |
| 0325 | 腰動脈<br>Lumbar artery | 血管 | 0311 p.24 | 模型未有 | 僅清單（模型未有） | 已寫（來源、分支、供應範圍） |
| 0326 | 椎間孔<br>Intervertebral foramen | 其他結構 | 0311 p.24 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、臨床意義） |
| 0327 | 前、後根動脈<br>Anterior and posterior radicular arteries | 血管 | 0311 p.24 | 模型未有 | 僅清單（模型未有） | 已寫（來源、供應範圍、阻塞症狀） |
| 0328 | 小腦巨觀分區<br>Macroscopic divisions of the cerebellum | 皮質／腦迴／腦溝／腦葉 | 0324 p.2；0324 p.13 | 見 0137 | 見 0137 | 併入 0137「小腦」，名稱保留為別名 |
| 0329 | 後腦<br>Hindbrain (rhombencephalon) | 其他結構 | 0324 p.3 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0330 | 枕內嵴<br>Internal occipital crest | 其他結構 | 0324 p.4 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0331 | 小腦天幕<br>Tentorium cerebelli | 其他結構 | 0324 p.4 | 有：Tentorium cerebelli | 清單＋模型 | 已寫（位置、構造、臨床意義） |
| 0332 | 許多分葉<br>lobe | 皮質／腦迴／腦溝／腦葉 | 0324 p.4 | — | 否 | 已剔除：斷詞片段（「許多分葉」），內容已併入小腦各葉 |
| 0333 | 裂隙<br>fissure | 皮質／腦迴／腦溝／腦葉 | 0324 p.4 | — | 否 | 已剔除：斷詞片段（「裂隙」），內容已併入小腦各裂 |
| 0334 | 初級裂<br>Primary fissure | 其他結構 | 0324 p.4 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0335 | 前葉<br>Anterior lobe | 其他結構 | 0324 p.4；0430 p.37 | 模型未有 | 僅清單（模型未有） | 已寫（位置、傳入、功能、損傷表現） |
| 0336 | 小腦小葉<br>Cerebellar lobules | 其他結構 | 0324 p.4；0324 p.5 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0337 | 小腦體部<br>Corpus of cerebellum | 其他結構 | 0324 p.4 | — | 否 | 已剔除：重複：小腦體部已由前葉、後葉涵蓋 |
| 0338 | 水平裂<br>Horizontal fissure | 其他結構 | 0324 p.4 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0339 | 後外側裂<br>Posterolateral fissure | 其他結構 | 0324 p.4 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0340 | 後葉<br>Posterior lobe | 其他結構 | 0324 p.4；0430 p.37 | 模型未有 | 僅清單（模型未有） | 已寫（位置、傳入、傳出、功能、損傷表現） |
| 0341 | 絨球小結葉<br>Flocculonodular lobe | 其他結構 | 0324 p.4；0324 p.18；0424 p.17 | 有：Flocculus、Nodule of vermis | 清單＋模型 | 已寫（位置、傳入、傳出、功能、損傷表現） |
| 0342 | 外側的絨球<br>Flocculus | 其他結構 | 0324 p.4 | 有：Flocculus | 清單＋模型 | 已寫（位置、功能） |
| 0343 | 小結<br>Nodule | 其他結構 | 0324 p.4 | 有：Nodule of vermis | 清單＋模型 | 已寫（位置、傳入、功能、損傷表現） |
| 0344 | 蚓部<br>Vermis | 其他結構 | 0324 p.5；0324 p.20 | 有：Lingula of cerebellum、Central lobule、Culmen…等 9 個 | 清單＋模型 | 已寫（位置、構造、傳出、功能、損傷表現） |
| 0345 | 小腦半球<br>Cerebellar hemisphere | 其他結構 | 0324 p.5 | 有：Wing of central lobule、Anterior quadrangular lobule、Posterior quadrangular lobule…等 9 個 | 清單＋模型 | 已寫（位置、構造、傳出、功能、損傷表現） |
| 0346 | 小腦扁桃體<br>Cerebellar tonsil | 其他結構 | 0324 p.5 | 有：Tonsil of cerebellum | 清單＋模型 | 已寫（位置、功能、臨床意義） |
| 0347 | 小腦延髓疝畸形<br>Chiari malformation | 其他結構 | 0324 p.5 | 見 0346 | 見 0346 | 併入 0346「小腦扁桃體」，名稱保留為別名 |
| 0348 | 小腦扁桃體下疝<br>Tonsillar herniation | 其他結構 | 0324 p.5 | 見 0346 | 見 0346 | 併入 0346「小腦扁桃體」，名稱保留為別名 |
| 0349 | 二級裂<br>Secondary fissure | 其他結構 | 0324 p.5 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0350 | 小腦葉片<br>Cerebellar folia | 其他結構 | 0324 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0351 | 中央神經核<br>Deep cerebellar nuclei | 核團 | 0324 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能） |
| 0352 | 頂核<br>Fastigial nucleus | 核團 | 0324 p.6；0324 p.19；0424 p.17 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0353 | 又稱內側小腦神經核<br>Medial cerebellar nucleus | 核團 | 0324 p.6 | 見 0352 | 見 0352 | 併入 0352「頂核」，名稱保留為別名 |
| 0354 | 間位核<br>Interposed nucleus | 核團 | 0324 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能） |
| 0355 | 球狀核<br>Globose nucleus | 核團 | 0324 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳出、功能） |
| 0356 | 栓狀核<br>Emboliform nucleus | 核團 | 0324 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳出、功能） |
| 0357 | 齒狀核<br>Dentate nucleus | 核團 | 0324 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0358 | 又稱外側小腦神經核<br>Lateral cerebellar nucleus | 核團 | 0324 p.6 | 見 0357 | 見 0357 | 併入 0357「齒狀核」，名稱保留為別名 |
| 0359 | 小腦腳<br>Cerebellar peduncles | 其他結構 | 0324 p.6 | 有：Superior cerebellar peduncle、Middle cerebellar peduncle、Inferior cerebellar peduncle | 清單＋模型 | 已寫（位置、構造、功能） |
| 0360 | 結合臂<br>Brachium conjunctivum | 其他結構 | 0324 p.6 | 見 0193 | 見 0193 | 併入 0193「上小腦腳」，名稱保留為別名 |
| 0361 | 爬行纖維<br>Climbing fiber | 纖維束／傳導路徑 | 0324 p.7；0324 p.8；0324 p.12 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、終點、傳遞內容） |
| 0362 | 苔蘚狀纖維<br>Mossy fiber | 纖維束／傳導路徑 | 0324 p.7；0324 p.8；0324 p.11；0402 p.22 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、終點、傳遞內容） |
| 0363 | 分子層<br>Molecular layer | 其他結構 | 0324 p.8；0402 p.22 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0364 | 星狀細胞<br>Stellate cells | 其他結構 | 0324 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0365 | 籃狀細胞<br>Basket cells | 其他結構 | 0324 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0366 | 蒲金氏細胞層<br>Purkinje cell layer | 其他結構 | 0324 p.8；0324 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0367 | 柏金氏細胞<br>Purkinje cells | 其他結構 | 0324 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、傳入、傳出、功能、損傷表現） |
| 0368 | 顆粒層<br>Granular layer | 腦室／腦池／腦膜 | 0324 p.8；0324 p.9 | 見 0427 | 見 0427 | 併入 0427「顆粒細胞層」，名稱保留為別名 |
| 0369 | 顆粒細胞<br>Granule cells | 其他結構 | 0324 p.8；0402 p.22 | 模型未有 | 僅清單（模型未有） | 已寫（位置、傳入、傳出、功能） |
| 0370 | 高基氏細胞<br>Golgi cells | 其他結構 | 0324 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0371 | 單極刷狀細胞<br>Unipolar brush cells | 其他結構 | 0324 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0372 | 平行纖維<br>parallel fiber | 纖維束／傳導路徑 | 0324 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、終點、傳遞內容） |
| 0373 | 顆粒小球<br>Cerebellar glomerulus | 其他結構 | 0324 p.12 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0374 | 前庭小腦<br>Vestibulocerebellum | 其他結構 | 0324 p.13；0324 p.14 | 模型未有 | 僅清單（模型未有） | 已寫（位置、傳入、傳出、功能、損傷表現） |
| 0375 | 大腦小腦（新小腦）<br>Cerebrocerebellum (neocerebellum) | 其他結構 | 0324 p.13；0324 p.14 | 模型未有 | 僅清單（模型未有） | 已寫（位置、傳入、傳出、功能、損傷表現） |
| 0376 | 脊髓小腦（古小腦）<br>Spinocerebellum (paleocerebellum) | 其他結構 | 0324 p.14 | 模型未有 | 僅清單（模型未有） | 已寫（位置、傳入、傳出、功能、損傷表現） |
| 0377 | 橋腦小腦<br>Neocerebellum | 其他結構 | 0324 p.14 | 見 0375 | 見 0375 | 併入 0375「大腦小腦（新小腦）」，名稱保留為別名 |
| 0378 | 皮質橋腦小腦徑<br>Corticopontocerebellar pathway | 纖維束／傳導路徑 | 0324 p.16 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、中繼站、交叉位置、終點、傳遞內容、損傷表現） |
| 0379 | 皮質橋腦纖維<br>Corticopontine fibers | 纖維束／傳導路徑 | 0324 p.16 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、中繼站、終點、傳遞內容） |
| 0380 | 皮質網狀小腦徑<br>Cerebro-reticular cerebellar pathway | 纖維束／傳導路徑 | 0324 p.16 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、中繼站、終點、傳遞內容） |
| 0381 | 皮質網狀纖維<br>Corticoreticular fibers | 纖維束／傳導路徑 | 0324 p.16 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、終點、傳遞內容） |
| 0382 | 網狀小腦纖維<br>Reticulocerebellar fibers | 纖維束／傳導路徑 | 0324 p.16 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、終點、傳遞內容） |
| 0383 | 皮質橄欖小腦徑<br>Cerebro-olivary cerebellar pathway | 纖維束／傳導路徑 | 0324 p.17 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、中繼站、終點、傳遞內容） |
| 0384 | 皮質橄欖纖維<br>Corticoolivary fibers | 纖維束／傳導路徑 | 0324 p.17 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、終點、傳遞內容） |
| 0385 | 橄欖小腦徑<br>Olivocerebellar tract | 纖維束／傳導路徑 | 0324 p.17 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、終點、傳遞內容、損傷表現） |
| 0386 | 背側脊髓小腦徑<br>Posterior/Dorsal spinocerebellar tract | 纖維束／傳導路徑 | 0324 p.17 | 見 0156 | 見 0156 | 併入 0156「後側脊髓小腦徑」，名稱保留為別名 |
| 0387 | 腹側脊髓小腦徑<br>Anterior/Ventral spinocerebellar tract | 纖維束／傳導路徑 | 0324 p.17 | 見 0155 | 見 0155 | 併入 0155「前側脊髓小腦徑」，名稱保留為別名 |
| 0388 | 附屬楔狀核<br>Accessory/External nucleus cuneatus | 核團 | 0324 p.17 | 見 0160 | 見 0160 | 併入 0160「副楔形核」，名稱保留為別名 |
| 0389 | 前庭神經<br>Vestibular nerve | 神經 | 0324 p.18 | 有：Vestibular nerve | 清單＋模型 | 已寫（起源核團、出腦位置、分布、功能、損傷表現） |
| 0390 | 頂核前庭路徑<br>Fastigial vestibular pathway | 纖維束／傳導路徑 | 0324 p.19 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、中繼站、終點、傳遞內容） |
| 0391 | 前庭脊髓徑<br>Vestibulospinal tract | 纖維束／傳導路徑 | 0324 p.19；0423 p.19 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、終點、傳遞內容） |
| 0392 | 頂核網狀路徑<br>Fastigial reticular pathway | 纖維束／傳導路徑 | 0324 p.19 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、中繼站、終點、傳遞內容） |
| 0393 | 網狀脊髓徑<br>Reticulospinal tract | 纖維束／傳導路徑 | 0324 p.19；0423 p.22 | 有：Reticulospinal tract | 清單＋模型 | 已寫（起始神經元、交叉位置、終點、傳遞內容、損傷表現） |
| 0394 | 腦紅核路徑<br>Globose-emboliform-rubral pathway | 纖維束／傳導路徑 | 0324 p.19 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、中繼站、終點、傳遞內容） |
| 0395 | 齒狀核丘腦路徑<br>Dentatothalamic pathway | 纖維束／傳導路徑 | 0324 p.19 | 有：Dentatorubrothalamic tract | 清單＋模型 | 已寫（起始神經元、交叉位置、中繼站、終點、傳遞內容、損傷表現） |
| 0396 | 共濟失調<br>Cerebellar ataxia | 其他結構 | 0324 p.20 | 見 0137 | 見 0137 | 併入 0137「小腦」，名稱保留為別名 |
| 0397 | 橫行纖維<br>Transverse pontine fibers | 纖維束／傳導路徑 |  | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、終點、傳遞內容） |
| 0398 | 橋腦小腦纖維<br>Pontocerebellar fibers | 纖維束／傳導路徑 |  | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、終點、傳遞內容） |
| 0399 | 橄欖小腦纖維<br>Olivocerebellar fibers | 纖維束／傳導路徑 |  | 見 0385 | 見 0385 | 併入 0385「橄欖小腦徑」，名稱保留為別名 |
| 0400 | 古小腦<br>Archicerebellum | 其他結構 |  | 見 0374 | 見 0374 | 併入 0374「前庭小腦」，名稱保留為別名 |
| 0402 | 近繩狀體<br>juxtarestiform body | 其他結構 |  | 模型未有 | 僅清單（模型未有） | 已寫（位置、傳遞內容、功能） |
| 0403 | 邊緣系統<br>Limbic system | 其他結構 | 0402 p.2；0402 p.15；0402 p.4 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、損傷表現） |
| 0404 | 杏仁核體<br>Amygdala, AMG | 核團 | 0402 p.2；0402 p.15；0402 p.25 | 見 0036 | 見 0036 | 併入 0036「杏仁核」，名稱保留為別名 |
| 0405 | 泌系統<br>autonomic & endocrine system | 其他結構 | 0402 p.4 | 見 0403 | 見 0403 | 併入 0403「邊緣系統」，名稱保留為別名 |
| 0406 | 縫核<br>Raphe nuclei | 核團 | 0402 p.5 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0407 | 下視丘視前區<br>Preoptic area | 核團 | 0402 p.11 | 有：Preoptic hypothalamus | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0408 | 扣帶迴<br>Cingulate gyrus | 皮質／腦迴／腦溝／腦葉 | 0402 p.15；0402 p.19 | 有：Cingulate gyrus (Posteroventral part)、Cingulate gyrus and sulcus (Middle anterior part)、Cingulate gyrus and sulcus (Middle posterior part)…等 5 個 | 清單＋模型 | 已寫（位置、Brodmann 編號、功能、損傷表現） |
| 0409 | 穹窿<br>Fornix | 其他結構 | 0402 p.16；0402 p.19 | 有：Fornix | 清單＋模型 | 已寫（位置、構造、功能、損傷表現） |
| 0410 | 海馬結構<br>Hippocampal formation | 其他結構 | 0402 p.16；0402 p.18 | 有：Hippocampus | 清單＋模型 | 已寫（位置、構造、功能） |
| 0411 | 齒狀迴<br>Dentate gyrus | 皮質／腦迴／腦溝／腦葉 | 0402 p.17；0402 p.18；0402 p.22 | 模型未有 | 僅清單（模型未有） | 已寫（位置、傳入、傳出、功能） |
| 0412 | 羊角區<br>Cornu ammonis, CA | 皮質／腦迴／腦溝／腦葉 | 0402 p.17 | 模型未有 | 僅清單（模型未有） | 已寫（位置、傳入、傳出、功能、損傷表現） |
| 0413 | 海馬旁迴<br>Parahippocampal gyrus | 皮質／腦迴／腦溝／腦葉 | 0402 p.17；0402 p.19 | 有：Medial occipitotemporal gyrus (Parahippocampal) | 清單＋模型 | 已寫（位置、Brodmann 編號、功能、損傷表現） |
| 0414 | 內嗅皮質區<br>Entorhinal area | 皮質／腦迴／腦溝／腦葉 | 0402 p.17；0402 p.18 | 見 0429 | 見 0429 | 併入 0429「內嗅皮質」，名稱保留為別名 |
| 0415 | 海馬輸入路徑<br>Hippocampal afferent connections | 纖維束／傳導路徑 | 0402 p.18 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、終點、傳遞內容） |
| 0416 | 內嗅皮質輸入路徑<br>Entorhinal afferents | 纖維束／傳導路徑 | 0402 p.18 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、終點、傳遞內容） |
| 0417 | 穿通路徑<br>Perforant path | 纖維束／傳導路徑 | 0402 p.18 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、終點、傳遞內容、損傷表現） |
| 0418 | 室床路徑<br>Alvear path | 纖維束／傳導路徑 | 0402 p.18 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、終點、傳遞內容） |
| 0419 | 海馬輸出路徑<br>Hippocampal efferent connections | 纖維束／傳導路徑 | 0402 p.19 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、中繼站、終點、傳遞內容） |
| 0420 | 乳頭體視丘徑<br>Mammillothalamic tract / Fasciculus | 纖維束／傳導路徑 | 0402 p.19 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、終點、傳遞內容、損傷表現） |
| 0421 | 視丘的前核區<br>Anterior nucleus of thalamus | 核團 | 0402 p.19 | 有：Anterior nuclei of thalamus | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0422 | 外側背側核<br>Lateral dorsal nucleus | 核團 | 0402 p.19 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能） |
| 0423 | 巴貝茲迴路<br>Papez circuit | 纖維束／傳導路徑 | 0402 p.20 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、中繼站、終點、傳遞內容、損傷表現） |
| 0425 | 海馬錐狀細胞層<br>Pyramidal cell layer (hippocampus) | 其他結構 | 0402 p.22 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能、損傷表現） |
| 0426 | 海馬多型層<br>Polymorphic layer (hippocampus) | 其他結構 | 0402 p.22 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0427 | 顆粒細胞層<br>Granule cell layer | 其他結構 | 0324 p.8；0324 p.9；0402 p.22 | 模型未有 | 僅清單（模型未有） | 已寫（位置、傳入、傳出、功能） |
| 0428 | 海馬迴功能<br>Hippocampal function | 皮質／腦迴／腦溝／腦葉 | 0402 p.23 | 見 0037 | 見 0037 | 併入 0037「海馬迴」，名稱保留為別名 |
| 0429 | 內嗅皮質<br>Entorhinal cortex | 皮質／腦迴／腦溝／腦葉 | 0402 p.17；0402 p.18；0402 p.24 | 模型未有 | 僅清單（模型未有） | 已寫（位置、傳入、傳出、功能、損傷表現） |
| 0430 | 側腦室顳角<br>Temporal horn of the lateral ventricle | 腦室／腦池／腦膜 | 0402 p.25 | 近似：Lateral ventricle | 清單＋模型 | 已寫（位置、連通關係、內容物、臨床意義） |
| 0431 | 皮質內側區<br>Corticomedial nuclei | 核團 | 0402 p.25 | 有：Corticomedial group | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能） |
| 0432 | 顳葉鉤<br>Uncus | 皮質／腦迴／腦溝／腦葉 | 0402 p.25 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能、臨床意義） |
| 0433 | 基底外側核區<br>Basolateral nuclei | 核團 | 0402 p.25；0402 p.26 | 有：Basolateral complex | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能） |
| 0434 | 中央核區<br>Central nuclei | 核團 | 0402 p.25 | 有：Central nucleus | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能） |
| 0435 | 聽覺核<br>Auditory | 核團 | 0402 p.26 | — | 否 | 已剔除：筆記只列「聽覺核」一詞，已由耳蝸神經核與上橄欖核條目涵蓋 |
| 0436 | 底外側核<br>Basolateral AMG | 核團 | 0402 p.26 | 見 0433 | 見 0433 | 併入 0433「基底外側核區」，名稱保留為別名 |
| 0437 | 終紋<br>Stria terminalis | 其他結構 | 0402 p.26 | 有：Stria terminalis | 清單＋模型 | 已寫（位置、傳遞內容、功能） |
| 0438 | 腹側杏仁核通路<br>Ventral amygdalofugal pathway | 纖維束／傳導路徑 | 0402 p.26 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、終點、傳遞內容） |
| 0439 | 間隔核區<br>Septal area | 核團 | 0402 p.26；0402 p.27 | 有：Septal nuclei | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能） |
| 0440 | 前腦內側神經束<br>Medial forebrain bundle | 纖維束／傳導路徑 | 0402 p.27 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、中繼站、傳遞內容、損傷表現） |
| 0441 | 顳葉癲癇<br>Temporal lobe epilepsy | 皮質／腦迴／腦溝／腦葉 | 0402 p.28 | 見 0009 | 見 0009 | 併入 0009「顳葉」，名稱保留為別名 |
| 0442 | 藍斑核<br>Locus ceruleus | 核團 |  | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0443 | 視丘背內側核<br>Mediodorsal nucleus of thalamus | 核團 |  | 有：Mediodorsal nucleus | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0444 | 腦下垂體<br>Pituitary gland | 其他結構 | 0430 p.2；0430 p.37 | 有：Adenohypophysis、Neurohypophysis | 清單＋模型 | 已寫（位置、構造、功能、損傷表現） |
| 0446 | 海馬本體<br>hippocampus proper | 其他結構 |  | 有：Hippocampus | 清單＋模型 | 已寫（位置、構造、功能、損傷表現） |
| 0448 | 體感覺傳入路徑<br>Somatic afferent pathway (GSA from body) | 纖維束／傳導路徑 | 0411 p.2；0411 p.7 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、中繼站、終點、傳遞內容、損傷表現） |
| 0449 | 背根神經纖維<br>dorsal root fiber | 纖維束／傳導路徑 | 0411 p.5 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、終點、傳遞內容、損傷表現） |
| 0451 | 不同神經節<br>different ganglion | 神經 | 0411 p.5 | — | 否 | 已剔除：泛稱（不同神經節），不是具體構造 |
| 0452 | 外側脊髓視丘徑<br>lateral spinothalamic tract | 纖維束／傳導路徑 | 0411 p.6；0411 p.11；0411 p.22 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、中繼站、終點、傳遞內容、損傷表現） |
| 0453 | 腹側脊髓視丘徑<br>ventral spinothalamic tract | 纖維束／傳導路徑 | 0411 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、終點、傳遞內容、損傷表現） |
| 0454 | 腹側三叉視丘徑<br>ventral trigeminothalamic tract | 纖維束／傳導路徑 | 0411 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、終點、傳遞內容） |
| 0455 | 背側三叉視丘徑<br>dorsal trigeminothalamic tract | 纖維束／傳導路徑 | 0411 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、終點、傳遞內容） |
| 0456 | 體感覺皮質<br>Somatosensory cortex | 皮質／腦迴／腦溝／腦葉 | 0411 p.7；0411 p.9；0411 p.10；0411 p.15；0423 p.10 | 有：Postcentral gyrus | 清單＋模型 | 已寫（位置、Brodmann 編號、功能、損傷表現） |
| 0457 | 身體下位<br>Caudal | 其他結構 | 0411 p.7 | — | 否 | 已剔除：方位詞（身體下位），不是構造 |
| 0458 | 背中間溝<br>Dorsal intermediate sulcus | 其他結構 | 0411 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0459 | 為背柱核<br>dorsal column nuclei | 核團 | 0411 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能） |
| 0460 | 脊髓視丘徑細胞<br>Spinothalamic tract cell | 纖維束／傳導路徑 | 0411 p.10；0411 p.11 | 見 0131 | 見 0131 | 併入 0131「脊髓丘腦徑」，名稱保留為別名 |
| 0461 | 比較<br>lateral spinothalamic tract vs. ventral spinothalamic tract | 纖維束／傳導路徑 | 0411 p.11 | 見 0452 | 見 0452 | 併入 0452「外側脊髓視丘徑」，名稱保留為別名 |
| 0462 | 梅氏小體<br>Meissner’s corpuscle | 其他結構 | 0411 p.11 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0463 | C 纖維<br>C fiber | 纖維束／傳導路徑 | 0411 p.11 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、終點、傳遞內容、損傷表現） |
| 0464 | 三叉神經<br>Trigeminal nerve (CN V) | 神經 | 0411 p.15；0430 p.25 | 有：Trigeminal nerve (V) | 清單＋模型 | 已寫（起源核團、出腦位置、分布、功能、損傷表現） |
| 0465 | 視丘徑<br>Trigeminothalamic tract | 纖維束／傳導路徑 | 0411 p.16 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、終點、傳遞內容） |
| 0466 | 上神經節<br>Superior ganglion | 神經 | 0411 p.16 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0467 | 下圖藍色路徑<br>Ventral/Anterior spinocerebellar tract spinocerebellar tract | 纖維束／傳導路徑 | 0411 p.17 | 見 0155 | 見 0155 | 併入 0155「前側脊髓小腦徑」，名稱保留為別名 |
| 0468 | 影響心血管系統<br>Cardiovascular system | 血管 | 0411 p.19 | — | 否 | 已剔除：系統名稱（心血管系統），不是腦部構造 |
| 0469 | 呼吸系統<br>Respiratory system | 其他結構 | 0411 p.19；0411 p.20 | — | 否 | 已剔除：系統名稱（呼吸系統），不是腦部構造 |
| 0470 | 壓力接收器<br>baroreceptor | 其他結構 | 0411 p.19 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0471 | 頸動脈竇<br>Carotid sinus | 血管 | 0411 p.19 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、臨床意義） |
| 0472 | 主動脈弓<br>Aortic arch | 血管 | 0411 p.19 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0473 | 下神經節<br>inf. ganglion | 神經 | 0411 p.19 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0474 | 孤立徑<br>solitary tract | 纖維束／傳導路徑 | 0411 p.19 | 模型未有 | 僅清單（模型未有） | 已寫（位置、傳遞內容、功能） |
| 0475 | 延腦腹外側區<br>Ventrolateral medulla | 其他結構 | 0411 p.19 | 模型未有 | 僅清單（模型未有） | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0476 | 化學接受器<br>chemoreceptor | 其他結構 | 0411 p.20 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0477 | 頸動脈體<br>Carotid body | 血管 | 0411 p.20 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、臨床意義） |
| 0478 | 主動脈體<br>Aortic body | 血管 | 0411 p.20 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0479 | 心臟與內臟神經<br>Cardiac and splanchnic nerves | 神經 | 0411 p.21 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、臨床意義） |
| 0480 | 腹下神經叢<br>Hypogastric plexus | 神經 | 0411 p.21 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、臨床意義） |
| 0481 | 腰內臟神經<br>lumbar splanchnic nerve | 神經 | 0411 p.21 | 模型未有 | 僅清單（模型未有） | 已寫（來源、分布、功能） |
| 0482 | 視丘腹後外側核（VPL）<br>Ventral posterolateral nucleus (VPL) | 核團 | 0411 p.22 | 有：Ventral posterolateral nucleus (VPL) | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0483 | 脊髓網狀徑<br>spinoreticular tract | 纖維束／傳導路徑 | 0411 p.22 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、中繼站、終點、傳遞內容、損傷表現） |
| 0484 | 視丘板內核<br>intralaminar nuclei of thalamus | 核團 | 0411 p.22 | 有：Intralaminar and lateral posterior nuclei | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
| 0485 | 側分支<br>collateral branch | 其他結構 | 0411 p.22 | — | 否 | 已剔除：細胞層級概念（側分支），不是解剖構造 |
| 0486 | 右肩胛下區<br>infrascapular region | 皮質／腦迴／腦溝／腦葉 | 0411 p.23 | — | 否 | 已剔除：體表轉移痛區域，不是腦部構造 |
| 0487 | 胸心臟分支<br>Thoracic cardiac branches | 神經 | 0411 p.23 | 模型未有 | 僅清單（模型未有） | 已寫（來源、分布、功能、臨床意義） |
| 0488 | 放射至腰部<br>loin | 其他結構 | 0411 p.23 | — | 否 | 已剔除：轉移痛部位（腰部），不是構造 |
| 0489 | 最小內臟神經<br>least splanchnic nerve | 神經 | 0411 p.23 | 模型未有 | 僅清單（模型未有） | 已寫（來源、分布、功能、臨床意義） |
| 0490 | 輸尿管<br>groin | 其他結構 | 0411 p.23 | — | 否 | 已剔除：轉移痛部位（鼠蹊），不是構造 |
| 0491 | 脊髓背核<br>nucleus dorsalis of Clarke | 核團 |  | 見 0114 | 見 0114 | 併入 0114「克拉克背核」，名稱保留為別名 |
| 0493 | 後柱—內側丘系路徑<br>Posterior column–medial lemniscus pathway | 纖維束／傳導路徑 | 0226 p.14；0226 p.19 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、中繼站、終點、傳遞內容、損傷表現） |
| 0495 | 肌束<br>Muscle fascicle | 纖維束／傳導路徑 | 0423 p.3 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0496 | 肌束膜<br>Perimysium | 纖維束／傳導路徑 | 0423 p.3 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0497 | 最外層是外囊<br>External capsule | 纖維束／傳導路徑 | 0423 p.3 | 見 0085 | 見 0085 | 併入 0085「外囊」，名稱保留為別名 |
| 0498 | 梭內肌纖維<br>Intrafusal fiber | 纖維束／傳導路徑 | 0226 p.9；0423 p.3；0423 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0499 | 核袋纖維<br>Nuclear bag fiber | 纖維束／傳導路徑 | 0423 p.3 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0500 | 核鏈纖維<br>Nuclear chain fiber | 纖維束／傳導路徑 | 0423 p.4 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0501 | 脊髓腹角<br>Spinal cord ventral horn | 其他結構 | 0423 p.4；0423 p.16 | 見 0119 | 見 0119 | 併入 0119「前角（腹角）」，名稱保留為別名 |
| 0502 | 第二型感覺纖維<br>Type II sensory fiber | 纖維束／傳導路徑 | 0423 p.4 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0503 | 肌肉張力的感覺訊息經背根神經節<br>Dorsal root ganglion, DRG | 神經 | 0423 p.6 | 見 0134 | 見 0134 | 併入 0134「背根神經節」，名稱保留為別名 |
| 0504 | 運動前區<br>Premotor cortex | 皮質／腦迴／腦溝／腦葉 | 0423 p.10；0430 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（位置、Brodmann 編號、功能、損傷表現） |
| 0505 | 運動輔助區<br>Supplementary motor area | 皮質／腦迴／腦溝／腦葉 | 0423 p.10 | 模型未有 | 僅清單（模型未有） | 已寫（位置、Brodmann 編號、功能、損傷表現） |
| 0506 | 扣帶運動區<br>Cingulate motor areas | 皮質／腦迴／腦溝／腦葉 | 0423 p.10 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0507 | 主要感覺區<br>Primary sensory cortex | 皮質／腦迴／腦溝／腦葉 | 0423 p.10 | 見 0456 | 見 0456 | 併入 0456「體感覺皮質」，名稱保留為別名 |
| 0508 | 內囊後腳<br>Posterior limb of internal capsule | 纖維束／傳導路徑 | 0423 p.11 | 有：Posterior limb of internal capsule | 清單＋模型 | 已寫（位置、傳遞內容、損傷表現） |
| 0509 | 側柱<br>Lat. Funiculus | 其他結構 | 0423 p.12；0423 p.13 | 見 0129 | 見 0129 | 併入 0129「側索」，名稱保留為別名 |
| 0510 | 前柱<br>Ant./Ventral funiculus | 其他結構 | 0423 p.12；0423 p.13 | 見 0128 | 見 0128 | 併入 0128「腹索」，名稱保留為別名 |
| 0511 | 內側皮質脊髓徑<br>ACST | 纖維束／傳導路徑 | 0423 p.13 | 見 0165 | 見 0165 | 併入 0165「前側皮質脊髓徑」，名稱保留為別名 |
| 0512 | 內囊膝<br>Genu of internal capsule | 纖維束／傳導路徑 | 0423 p.14 | 見 0060 | 見 0060 | 併入 0060「內囊膝部」，名稱保留為別名 |
| 0513 | 左側疑核<br>LMN | 核團 | 0423 p.16 | — | 否 | 已剔除：「LMN」被誤抽成「左側疑核」；下運動神經元為概念，已列於其他詞彙 |
| 0514 | 顱根<br>cranial root | 其他結構 | 0423 p.16 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能、損傷表現） |
| 0515 | 脊髓根<br>spinal root | 其他結構 | 0423 p.16 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能、損傷表現） |
| 0516 | 錐體外路徑<br>Extrapyramidal tract | 纖維束／傳導路徑 | 0423 p.17 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、傳遞內容、功能、損傷表現） |
| 0517 | 橋腦網狀脊髓徑（內側）<br>Pontine (medial) reticulospinal tract | 纖維束／傳導路徑 | 0423 p.17 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、終點、傳遞內容、損傷表現） |
| 0518 | 延腦網狀脊髓徑（外側）<br>Medullary (lateral) reticulospinal tract | 纖維束／傳導路徑 | 0423 p.17 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、終點、傳遞內容） |
| 0519 | 外側前庭脊髓徑<br>Lateral vestibulo-spinal tract | 纖維束／傳導路徑 | 0423 p.19；0424 p.18 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、終點、傳遞內容、損傷表現） |
| 0520 | 外側前庭核<br>Lateral vestibular nucleus | 核團 | 0423 p.19；0424 p.18 | 近似：Vestibular nuclei | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能） |
| 0521 | 走在同側前索<br>ventral funiculus | 其他結構 | 0423 p.19；0423 p.21 | 見 0128 | 見 0128 | 併入 0128「腹索」，名稱保留為別名 |
| 0522 | 內側前庭脊髓徑<br>Medial vestibulo-spinal tract | 纖維束／傳導路徑 | 0423 p.19；0424 p.18 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、交叉位置、終點、傳遞內容） |
| 0523 | 兩側內側縱束<br>Medial longitudinal fasiculus | 纖維束／傳導路徑 | 0423 p.19 | 見 0224 | 見 0224 | 併入 0224「內側縱束」，名稱保留為別名 |
| 0524 | 視頂蓋<br>optic tectum | 其他結構 | 0423 p.21 | 見 0171 | 見 0171 | 併入 0171「中腦上丘」，名稱保留為別名 |
| 0525 | 聽覺系統<br>Auditory system | 其他結構 | 0424 p.2；0424 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能、損傷表現） |
| 0526 | 前庭系統<br>Vestibular system | 其他結構 | 0424 p.2；0424 p.13 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能、損傷表現） |
| 0527 | 鼓膜<br>Tympanic membrane | 耳部結構 | 0424 p.3；0424 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、損傷表現） |
| 0528 | 錘骨<br>Malleus | 耳部結構 | 0424 p.3；0424 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0529 | 砧骨<br>Incus | 耳部結構 | 0424 p.3；0424 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能、損傷表現） |
| 0530 | 鐙骨<br>Stapes | 耳部結構 | 0424 p.3；0424 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能、損傷表現） |
| 0531 | 足板<br>Footplate | 耳部結構 | 0424 p.3 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0532 | 卵圓窗（前庭窗）<br>Oval window (fenestra vestibuli) | 耳部結構 | 0424 p.3；0424 p.4 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0533 | 耳蝸<br>Cochlea | 耳部結構 | 0424 p.4；0424 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、損傷表現） |
| 0534 | 半規管<br>Semicircular canals | 耳部結構 | 0424 p.4；0424 p.14 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、損傷表現） |
| 0535 | 前庭窗<br>Fenestra vestibuli | 其他結構 | 0424 p.4 | 見 0532 | 見 0532 | 併入 0532「卵圓窗（前庭窗）」，名稱保留為別名 |
| 0536 | 圓窗（耳蝸窗）<br>Round window (fenestra cochleae) | 耳部結構 | 0424 p.4 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0537 | 耳蝸窗<br>Fenestra cochlea | 耳部結構 | 0424 p.4 | 見 0536 | 見 0536 | 併入 0536「圓窗（耳蝸窗）」，名稱保留為別名 |
| 0538 | 耳蝸部<br>Cochlear part | 耳部結構 | 0424 p.4 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0539 | 前庭部<br>Vestibular part | 耳部結構 | 0424 p.4 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0540 | 橢圓囊<br>Utricle | 耳部結構 | 0424 p.4；0424 p.13 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、損傷表現） |
| 0541 | 球囊<br>Saccule | 耳部結構 | 0424 p.4；0424 p.13 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0542 | 壺腹<br>Ampulla | 耳部結構 | 0424 p.4 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0543 | 壺腹嵴<br>Crista ampullaris | 耳部結構 | 0424 p.4；0424 p.15 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0544 | 內有耳蝸管<br>Cochlear duct | 耳部結構 | 0424 p.4 | 見 0545 | 見 0545 | 併入 0545「耳蝸管（中階）」，名稱保留為別名 |
| 0545 | 耳蝸管（中階）<br>Cochlear duct (scala media) | 耳部結構 | 0424 p.4；0424 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、損傷表現） |
| 0546 | 耳蝸底部<br>Base of cochlea | 耳部結構 | 0424 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0547 | 前庭膜<br>Vestibular membrane | 耳部結構 | 0424 p.6；0424 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0548 | 中階<br>Cochlear duct/Scala media | 耳部結構 | 0424 p.6 | 見 0545 | 見 0545 | 併入 0545「耳蝸管（中階）」，名稱保留為別名 |
| 0549 | 血管紋<br>Stria vascularis | 耳部結構 | 0424 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能、損傷表現） |
| 0550 | 螺旋韌帶<br>Spiral ligament | 耳部結構 | 0424 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0551 | 骨性螺旋板<br>Osseous spiral lamina | 耳部結構 | 0424 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0552 | 底膜<br>Basilar membrane | 耳部結構 | 0424 p.6；0424 p.7；0424 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0553 | 柯氏器<br>Organ of Corti | 其他結構 | 0424 p.7；0424 p.9 | 見 0556 | 見 0556 | 併入 0556「柯氏器（螺旋器）」，名稱保留為別名 |
| 0554 | 螺旋神經節<br>Spiral ganglion | 神經 | 0424 p.7；0424 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、損傷表現） |
| 0555 | 耳蝸神經<br>Cochlear nerve | 神經 | 0424 p.7 | 模型未有 | 僅清單（模型未有） | 已寫（起源核團、出腦位置、分布、功能、損傷表現） |
| 0556 | 柯氏器（螺旋器）<br>Organ of Corti (spiral organ) | 耳部結構 | 0424 p.7；0424 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、損傷表現） |
| 0557 | 覆膜<br>Tectorial membrane | 耳部結構 | 0424 p.7 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0558 | 支持細胞<br>Supporting cells | 耳部結構 | 0424 p.7；0424 p.15 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0559 | 內、外柱細胞<br>Inner and outer pillar cells | 耳部結構 | 0424 p.7 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0560 | 柯氏管<br>Tunnel of Corti | 耳部結構 | 0424 p.7 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0561 | 內、外指細胞<br>Inner and outer phalangeal cells | 耳部結構 | 0424 p.7 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0562 | 內、外邊緣細胞<br>Inner and outer border cells | 耳部結構 | 0424 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0563 | 感覺細胞<br>Sensory cells | 耳部結構 | 0424 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0564 | 內毛細胞<br>Inner hair cell | 耳部結構 | 0424 p.8；0424 p.11 | 模型未有 | 僅清單（模型未有） | 已寫（位置、傳出、功能、損傷表現） |
| 0565 | 外毛細胞<br>Outer hair cell | 耳部結構 | 0424 p.8；0424 p.11 | 模型未有 | 僅清單（模型未有） | 已寫（位置、傳出、功能、損傷表現） |
| 0566 | 傳出纖維（耳蝸）<br>Efferent fibers (cochlear) | 纖維束／傳導路徑 | 0424 p.8 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、終點、傳遞內容） |
| 0567 | 聽覺路徑<br>Auditory pathway | 纖維束／傳導路徑 | 0424 p.9 | 見 0235 | 見 0235 | 併入 0235「上行聽覺傳導路徑」，名稱保留為別名 |
| 0568 | 耳蝸枝<br>Cochlear br. of vestibulocochlear nerve | 神經 | 0424 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（起源核團、出腦位置、分布、功能） |
| 0569 | 蝸孔<br>Helicotrema | 耳部結構 | 0424 p.9 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能） |
| 0570 | 聽覺上升徑<br>Ascending auditory pathway | 纖維束／傳導路徑 | 0424 p.9 | 見 0235 | 見 0235 | 併入 0235「上行聽覺傳導路徑」，名稱保留為別名 |
| 0571 | 腹側耳蝸神經核<br>Dorsal/Ventral cochlear nucleus | 核團 | 0424 p.9 | 見 0236 | 見 0236 | 併入 0236「耳蝸神經核」，名稱保留為別名 |
| 0572 | 同側上橄欖核<br>Sup. olivary nucleus | 核團 | 0424 p.10 | 見 0237 | 見 0237 | 併入 0237「上橄欖核」，名稱保留為別名 |
| 0573 | 纖維交叉處<br>Crossed fiber | 纖維束／傳導路徑 | 0424 p.10 | 見 0235 | 見 0235 | 併入 0235「上行聽覺傳導路徑」，名稱保留為別名 |
| 0574 | 聽覺下降徑<br>Descending auditory pathways | 纖維束／傳導路徑 | 0424 p.11 | 模型未有 | 僅清單（模型未有） | 已寫（起始神經元、中繼站、終點、傳遞內容） |
| 0575 | 聽覺聯絡皮質區<br>Associational auditory cortex | 皮質／腦迴／腦溝／腦葉 | 0424 p.12 | 近似：Temporal plane | 清單＋模型 | 已寫（位置、功能、損傷表現） |
| 0576 | 毛細胞<br>Hair cell | 耳部結構 | 0424 p.13；0424 p.15 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、損傷表現） |
| 0577 | 耳石膜<br>Otolithic membrane | 耳部結構 | 0424 p.13 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能、損傷表現） |
| 0578 | 前庭神經節（Scarpa 神經節）<br>Vestibular ganglion (Scarpa’s ganglion) | 神經 | 0424 p.16 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、損傷表現） |
| 0579 | 橋腦延腦交界<br>Pontomedullary junction (caudal pons / rostral medulla) | 其他結構 | 0424 p.17 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、損傷表現） |
| 0580 | 下蚓部<br>Inferior vermis | 其他結構 | 0424 p.17 | 模型未有 | 僅清單（模型未有） | 已寫（位置、傳入、傳出、功能、損傷表現） |
| 0581 | 走在腹索<br>Ventral feniculus | 其他結構 | 0424 p.18 | 見 0128 | 見 0128 | 併入 0128「腹索」，名稱保留為別名 |
| 0582 | 叫內側縱束<br>Medial longitudinal fasciculi, MLF | 纖維束／傳導路徑 | 0424 p.18 | 見 0224 | 見 0224 | 併入 0224「內側縱束」，名稱保留為別名 |
| 0583 | 頸髓運動神經元<br>Cervical motor neuron | 其他結構 | 0424 p.18 | 模型未有 | 僅清單（模型未有） | 已寫（位置、傳入、功能、損傷表現） |
| 0584 | 電腦斷層<br>MRI | 其他結構 | 0430 p.2；0430 p.4 | — | 否 | 已剔除：影像方法（MRI），不是構造 |
| 0585 | 認識蛛蜘網膜下腔<br>subarachnoid spaces | 腦室／腦池／腦膜 | 0430 p.3 | 見 0054 | 見 0054 | 併入 0054「蜘蛛網膜下腔」，名稱保留為別名 |
| 0586 | 深層灰質<br>deep gray matter | 其他結構 | 0430 p.10 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、影像表現） |
| 0587 | 薛氏裂<br>Sylvian fissure | 皮質／腦迴／腦溝／腦葉 | 0430 p.10；0430 p.27 | 見 0008 | 見 0008 | 併入 0008「側溝」，名稱保留為別名 |
| 0588 | 眼睛的光受體<br>Photoreceptor | 其他結構 | 0430 p.23 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、損傷表現） |
| 0589 | 視交叉<br>Optic chiasm | 纖維束／傳導路徑 | 0430 p.23；0430 p.24；0430 p.37 | 有：Optic chiasm | 清單＋模型 | 已寫（起始神經元、交叉位置、終點、傳遞內容、損傷表現） |
| 0590 | 視徑<br>Optic tract | 纖維束／傳導路徑 | 0430 p.23；0430 p.24 | 有：Optic tract | 清單＋模型 | 已寫（起始神經元、交叉位置、中繼站、終點、傳遞內容、損傷表現） |
| 0591 | 後大腦交通動脈<br>PCoA | 血管 | 0430 p.26；0430 p.35 | 見 0292 | 見 0292 | 併入 0292「後交通動脈」，名稱保留為別名 |
| 0592 | 前庭耳蝸神經<br>Vestibulocochlear nerve (CN VIII) | 神經 | 0430 p.26 | 近似：Vestibular nerve | 清單＋模型 | 已寫（起源核團、出腦位置、分布、功能、損傷表現） |
| 0593 | 數位化血管攝影<br>Digital subtraction angiography | 血管 | 0430 p.29 | — | 否 | 已剔除：影像方法（數位減影血管攝影），不是構造 |
| 0594 | 深支<br>Deep branches (of posterior cerebral artery) | 血管 | 0430 p.31 | 模型未有 | 僅清單（模型未有） | 已寫（來源、供應範圍、阻塞症狀） |
| 0595 | 分水嶺區域<br>Watershed area | 其他結構 | 0430 p.31 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、臨床意義） |
| 0596 | 穿通支動脈<br>Penetrating arteries | 血管 | 0430 p.32 | 模型未有 | 僅清單（模型未有） | 已寫（來源、供應範圍、阻塞症狀） |
| 0597 | 髓動脈<br>Medullary arteries (of white matter) | 血管 | 0430 p.32 | 模型未有 | 僅清單（模型未有） | 已寫（來源、供應範圍、阻塞症狀） |
| 0598 | 豆紋動脈<br>Lenticulostriate arteries | 血管 | 0430 p.32 | 有：Proximal lateral striate branches、Distal lateral striate branches | 清單＋模型 | 已寫（來源、分支、供應範圍、阻塞症狀） |
| 0599 | 破裂<br>Rupture | 皮質／腦迴／腦溝／腦葉 | 0430 p.33 | 見 0270 | 見 0270 | 併入 0270「威利氏環」，名稱保留為別名 |
| 0600 | 動脈瘤形成<br>Aneurysm formation | 血管 | 0430 p.34 | 見 0270 | 見 0270 | 併入 0270「威利氏環」，名稱保留為別名 |
| 0601 | 大腦皮質下層<br>Subcortex of cerebrum | 其他結構 | 0430 p.34 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能） |
| 0602 | 腺垂體<br>Adenohypophysis (anterior pituitary) | 其他結構 | 0430 p.37 | 有：Adenohypophysis | 清單＋模型 | 已寫（位置、構造、功能、損傷表現） |
| 0603 | 神經垂體<br>Neurohypophysis (posterior pituitary) | 其他結構 | 0430 p.37 | 有：Neurohypophysis | 清單＋模型 | 已寫（位置、構造、功能、損傷表現） |
| 0604 | 蝶鞍上腦池<br>Suprasellar cistern | 腦室／腦池／腦膜 | 0430 p.37 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、臨床意義） |
| 0605 | 頭皮<br>Scalp | 其他結構 | 0311 p.4 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、臨床意義） |
| 0606 | 翼點<br>Pterion | 其他結構 | 0311 p.4 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、臨床意義） |
| 0607 | 蝶鞍<br>Sella turcica | 其他結構 | 0311 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、臨床意義） |
| 0608 | 前床突<br>Anterior clinoid process | 其他結構 | 0311 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、功能、臨床意義） |
| 0609 | 迷路動脈<br>Labyrinthine artery | 血管 | 0311 p.19 | 模型未有 | 僅清單（模型未有） | 已寫（來源、分支、供應範圍、阻塞症狀） |
| 0610 | 小腦蚓垂<br>Uvula (of vermis) | 其他結構 | 0324 p.5；0423 p.16 | 有：Uvula of vermis | 清單＋模型 | 已寫（位置、功能） |
| 0611 | 小腦活樹<br>Arbor vitae | 其他結構 | 0324 p.6 | 模型未有 | 僅清單（模型未有） | 已寫（位置、構造、功能、影像表現） |
| x001 | 視丘腹後內側核（VPM）<br>Ventral posteromedial nucleus (VPM) | 核團 | 0218 p.14；0218 p.15；0411 p.6；0411 p.13；0411 p.15；0411 p.16 | 有：Ventral posteromedial nucleus (VPM)（示意） | 清單＋模型 | 已寫（位置／所在高度、傳入、傳出、功能、損傷表現） |
