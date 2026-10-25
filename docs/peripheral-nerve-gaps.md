# 周邊神經缺口清單

由 `node scripts/list-nerve-gaps.mjs` 依 `docs/coverage-data.json`（課程詞表）與目前模型名稱比對產生。課程詞表為自動抽取、含雜訊，已略去編號前綴、句子片段、神經元／細胞層級用詞與非神經結構；縮寫（n./sup./inf. 等）已展開。

- 課程詞表中判定為周邊神經／神經叢／神經節的詞：163 個
- 其中模型已有（含本次補上的示意模型）：9 個
- 模型尚缺：154 個

## 本次補上（示意管狀模型，資料卡標示「示意模型」）

枕下神經（C1 後支）、枕大神經（C2 後支）、第三枕神經（C3 後支）、枕小神經、耳大神經、枕下靜脈叢。Z-Anatomy（LluisV/Z-Anatomy@6c7f901，NervousSystem100.fbx／CardioVascular41.fbx）及 BodyParts3D 均無這六項的三維模型，因此沿教科書走行建立簡化管狀模型；詳見 `public/model_sources.json`。

## 模型尚缺的周邊神經（待決定如何補）

### 上肢

| 英文（正規化後） | 出現的課堂 |
|---|---|
| forearm ii median nerve | 背部/上肢/胸腔/下肢（跑考摘要） |
| intercostobrachial nerve | 背部/上肢/胸腔/下肢（跑考摘要）、上肢 II |
| lateral sural cutaneous nerve | 背部/上肢/胸腔/下肢（跑考摘要） |
| lower subscapular nerve | 背部/上肢/胸腔/下肢（跑考摘要）、上肢 II |
| med cutaneous nerve | 背部/上肢/胸腔/下肢（跑考摘要） |
| middle subscapular nerve | 背部/上肢/胸腔/下肢（跑考摘要）、上肢 II |
| middle trunk lateral pectoral nerve | 上肢 II |
| recurrent branch of median nerve | 上肢 II |
| upper subscapular nerve | 背部/上肢/胸腔/下肢（跑考摘要）、上肢 II |

### 其他

| 英文（正規化後） | 出現的課堂 |
|---|---|
| autonomic nerves | 骨盆會陰 II |
| carotid sinus nerve | 頸部 II |
| cn ix glossalpharyngeal nerve | 頸部 III |
| combinations of cranial nerves | 頭部 I（顏面、腮腺、頭皮）、頭部 II |
| dorsal nerve of penis clitoris | 骨盆會陰 II |
| glossalpharyngeal nerve | 頸部 III |
| intercostal spaces b intercostal nerves | 胸部 I（胸壁、乳房） |
| ischiopubic rami | 骨盆會陰 II |
| lacrimal gland d ix nerve | 頭部 I（顏面、腮腺、頭皮）、頭部 II |
| mater cranial nerve | 神經系統 |
| parotid gland b ix nerve | 頭部 I（顏面、腮腺、頭皮）、頭部 II |
| perineum region nerves | 下肢 I（骨、臀部） |
| post vagal trunk | 背部/上肢/胸腔/下肢（跑考摘要） |
| posterior vagal trunk | 背部/上肢/胸腔/下肢（跑考摘要） |
| somatic nerves | 骨盆會陰 II |
| subclavian lymphatic trunk | 胸部 I（胸壁、乳房） |
| tibial and common fibular nerves | 下肢 I（骨、臀部） |
| vagal trunk | 腹部 III |
| vague nerve | 腹部 III |
| vil nerve | 頭部 II |

### 自主神經系統與神經叢

| 英文（正規化後） | 出現的課堂 |
|---|---|
| abdominal prevertebral preaortic plexus | 腹部 III |
| aorticorenal ganglion | 背部/上肢/胸腔/下肢（跑考摘要）、腹部 III |
| cervicothoracic ganglion | 頸部 II |
| cn ix otic ganglion | 神經系統 |
| coccygeal ganglion | 骨盆會陰 II |
| coccygeal plexus | 骨盆會陰 II |
| cochlear nerve spiral ganglion | 神經系統 |
| esophageal plexus | 背部/上肢/胸腔/下肢（跑考摘要） |
| external laryngeal nerve | 頸部 III |
| external rectal plexus | 骨盆會陰 II |
| ganglion impar | 骨盆會陰 II |
| gluteal region sacral plexuses nerves | 下肢 I（骨、臀部） |
| greater and lesser splanchnic nerve | 腹部 III |
| greater splanchnic nerve | 背部/上肢/胸腔/下肢（跑考摘要）、腹部 III |
| hypogastric nerves | 骨盆會陰 II |
| hypogastric plexus | 骨盆會陰 II |
| inferior hypogastric plexus | 腹部 III、骨盆會陰 II |
| inferior laryngeal nerve | 頸部 II、頸部 III |
| inferior mesenteric ganglion | 腹部 III |
| inferior mesenteric plexus | 腹部 III |
| inferior sympathetic ganglion | 頸部 II |
| intermesenteric plexus | 腹部 III、骨盆會陰 II |
| internal laryngeal nerve | 頸部 II、頸部 III |
| internal rectal plexus | 骨盆會陰 II |
| laryngeal nerve | 頸部 III |
| least splanchnic nerve | 背部/上肢/胸腔/下肢（跑考摘要）、腹部 III |
| lesser splanchnic nerve | 背部/上肢/胸腔/下肢（跑考摘要）、腹部 III |
| lumber plexus | 腹部 III |
| mesenteric ganglion | 背部/上肢/胸腔/下肢（跑考摘要） |
| myenteric plexus | 腹部 III |
| otic ganglion | 頭部 I（顏面、腮腺、頭皮）、頭部 II、頸部 III |
| otic ganglion lesser petrosal nerve | 頭部 II |
| parasympathetic ganglion | 頭部 II |
| parasympathetic nerve | 腹部 III、心臟／大血管 |
| pelvic splanchnic nerve | 神經系統、腹部 III、骨盆會陰 II |
| pelvic splanchnic nerves | 骨盆會陰 II |
| periarterial plexus | 骨盆會陰 II |
| plexuses c superior hypogastric plexus | 骨盆會陰 II |
| preaortic plexus | 腹部 III |
| prevertebral ganglion | 神經系統 |
| pterygopalatine ganglion | 神經系統、頭部 I（顏面、腮腺、頭皮）、頭部 II |
| recurrent laryngeal nerve | 背部/上肢/胸腔/下肢（跑考摘要）、頸部 II、頸部 III |
| sacral sympathetic trunk | 骨盆會陰 II |
| stella ganglion | 頸部 II |
| stellate ganglion | 頸部 II |
| subendocardial plexus | 心臟／大血管 |
| submandibular ganglion | 神經系統、頭部 I（顏面、腮腺、頭皮）、頭部 II |
| submucosal plexus | 腹部 III |
| superficial and deep cardiac plexus | 心臟／大血管 |
| superior hypogastric plexus | 腹部 III、骨盆會陰 II |
| superior hypogastric plexus shp | 腹部 III |
| superior mesenteric ganglion | 腹部 III |
| superior mesenteric plexus | 腹部 III |
| sympathetic ganglion | 腹部 III、頸部 II |
| sympathetic ganglion chain | 腹部 III |
| sympathetic ganglion chain or sympathetic chunk | 腹部 III |
| sympathetic trunk | 背部/上肢/胸腔/下肢（跑考摘要）、胸部 I（胸壁、乳房）、頸部 II、頸部 III |
| terminal ganglia ciliary ganglion | 神經系統 |
| thoracic splanchnic nerve | 背部/上肢/胸腔/下肢（跑考摘要） |
| trigeminal ganglion | 頭部 II |
| tympanic plexus | 頭部 II |
| vagus nerve cnx | 頸部 III |
| vesical plexus | 骨盆會陰 II |
| where does the hypogastric nerve | 骨盆會陰 II |

### 軀幹下部、骨盆與下肢

| 英文（正規化後） | 出現的課堂 |
|---|---|
| anococcygeal nerve | 骨盆會陰 II |
| anterior scrotal nerve | 骨盆會陰 II |
| clitoris b external pudendal nerve | 骨盆會陰 II |
| coccygeal nerve | 骨盆會陰 II |
| deep gluteal nerves | 下肢 I（骨、臀部） |
| if the pudendal nerve | 骨盆會陰 II |
| inferior clunial nerve | 下肢 I（骨、臀部） |
| inferior gluteal nerve | 下肢 I（骨、臀部） |
| inferior rectal nerve | 骨盆會陰 II |
| labial nerve | 骨盆會陰 II |
| middle clunial nerve | 下肢 I（骨、臀部） |
| penis b perineal nerve | 骨盆會陰 II |
| perineal a v nerve | 骨盆會陰 II |
| perineal branches of pudendal nerve | 骨盆會陰 II |
| perineal nerve | 骨盆會陰 II |
| posterior labial nerve | 骨盆會陰 II |
| posterior scrotal labial nerve | 骨盆會陰 II |
| posterior scrotal nerve | 骨盆會陰 II |
| pudendal nerve gluteal ligaments | 下肢 I（骨、臀部） |
| rectal nerve | 骨盆會陰 II |
| subcostal nerve | 腹部 III、腹部 I |
| superficial gluteal nerves | 下肢 I（骨、臀部） |
| superior clunial nerve | 下肢 I（骨、臀部） |

### 頭面部

| 英文（正規化後） | 出現的課堂 |
|---|---|
| anterior superior alveolar nerve | 頭部 II |
| auriculotemporal nerve | 頭部 I（顏面、腮腺、頭皮）、頭部 II、頭部 IV |
| chorda tympani nerve | 頭部 II |
| cn ix glossopharyngeal nerve | 頸部 III |
| deep petrosal nerve | 頭部 II |
| deep temporal nerve | 頭部 II |
| division of the trigeminal nerve | 頭部 I（顏面、腮腺、頭皮） |
| facial nerve cn vii | 頭部 I（顏面、腮腺、頭皮）、頭部 II |
| great petrosal nerve | 頭部 II |
| greater petrosal nerve | 頭部 II |
| inferior division of oculomotor nerve | 頭部 IV |
| infraorbital nerve | 頭部 II |
| lesser palatine nerve | 頭部 II |
| lesser petrosal nerve | 頭部 II |
| middle superior alveolar nerve | 頭部 II |
| nasopalatine nerve | 頭部 II |
| nerve of pterygoid canal | 頭部 II、頭部 IV |
| posterior superior alveolar nerve | 頭部 II |
| statements regarding the ophthalmic nerve | 頭部 IV |
| superior inferior division of oculomotor nerve | 頭部 IV |
| superior orbital ophthalmic nerve | 神經系統 |
| vidian nerve | 頭部 II |
| zygomaticofacial nerve | 頭部 II |
| zygomaticotemporal nerve | 頭部 II |

### 頸部／枕下

| 英文（正規化後） | 出現的課堂 |
|---|---|
| accessory obturator nerve | 腹部 III |
| ansa cervicalis | 頸部 II |
| ansa cervicalis d sympathetic trunk | 頸部 II |
| ansa cervicalis superior root | 頸部 II |
| cervical carotid triangle plexus | 頸部 II |
| cervical sympathetic ganglia | 頸部 III |
| cervical sympathetic ganglion | 頭部 II、頸部 III |
| cervicalis d transverse cervical nerve | 頸部 II |
| decendens hypoglossi ansa cervicalis superior root | 頸部 II |
| phrenic nerve | 背部/上肢/胸腔/下肢（跑考摘要）、腹部 III、心臟／大血管、胸部 I（胸壁、乳房）、頸部 II |
| spinal accessory nerve | 頸部 II |
| superior cervical sympathetic ganglion | 頭部 II |
| supraclavicular nerve | 頸部 II |
| tympani c superior cervical ganglion | 頭部 II |

## 已在模型中的對應（供核對）

<details><summary>展開 9 項</summary>

- gluteal nerve
- great auricular nerve
- greater occipital nerve
- hypogastric nerve
- lesser occipital nerve
- radial nerve
- suboccipital nerve
- third occipital nerve
- ulnar nerve

</details>
