# 官方神經檔換用後的 54 條穩定度變動檢視（#242 後續）

#242 把神經與關節改用 Z-Anatomy 官方檔重新生成後，穩定度檢查有 54 條「變差」，已一次性重設基準（總數仍 1089 條）。這份文件逐條檢視它們是不是真的變差、哪些能修。只比對檢查數值，**沒有在 3D 畫面逐條目視確認**；神經位置是否符合解剖，由使用者依 Gray's 1918、OpenStax 核對。

## 結論
- **50 條不是實際變差，是計數隨網格頂點數而變。**（脫離骨骼 36、拉伸 7、穿入 7） 「脫離骨骼」數的是「靜止時碰到骨骼、姿勢後離開的點數」，「拉伸」數的是三角形數；官方網格的頂點與三角形數和原本的第三方複本不同，同一條神經的最差倍率沒變，最遠距離相差不超過 5 mm（多數相同、有的更近），只有計數增減；有增也有減，另有 70 多條計數反而減少、不在這 54 條裡。穿入深度的差異都在 0.2 mm 以內，也是同一個原因。
- **真正有變化的有 4 條：** 左右坐骨神經與股後皮神經前根各 359 個面重合（新出現，z-fighting，共 2 條）；左趾背中間皮神經穿入腓骨第三肌 5.5 → 7.8 mm；右橈神經溝的平直切口 26.5 → 26.9 mm（原因未確認）。
- **根本的老問題沒有因換檔而更糟：** 頭部神經在頭前屈／後伸 35–40° 時最遠離骨 50–60 mm（神經沒有跟著頭骨動），肩部神經在肩外展／前屈時離肩胛骨 19–55 mm（神經沒有跟著肩胛動）。這些在換檔前就存在，要靠「讓神經跟著骨骼動」的綁定修，不是挪動位置。

## 54 條明細
| 類型 | 結構 | 說明 | 舊值 | 新值 | 判斷 |
|---|---|---|---|---|---|
| 脫離骨骼（點數） | Abducens nerve (VI).l | 最遠 50 mm（head extension 35） | 104 | 107 | 計數差（距離相同） |
| 脫離骨骼（點數） | Abducens nerve (VI).l | 最遠 60 mm（head flexion 40） | 113 | 117 | 計數差（距離相同） |
| 脫離骨骼（點數） | Abducens nerve (VI).r | 最遠 50 mm（head extension 35） | 126 | 133 | 計數差（距離相同） |
| 脫離骨骼（點數） | Abducens nerve (VI).r | 最遠 60 mm（head flexion 40） | 149 | 154 | 計數差（距離相同） |
| 脫離骨骼（點數） | Cochlear nerve | 最遠 45 mm（head extension 35） | 331 | 417 | 計數差（距離相同） |
| 脫離骨骼（點數） | Cochlear nerve | 最遠 49 mm（head flexion 40） | 348 | 441 | 計數差（距離相同） |
| 脫離骨骼（點數） | Inferior alveolar nerve.r | 最遠 52 mm（head flexion 40） | 212 | 215 | 計數差（最遠距離相差 ≤5 mm） |
| 脫離骨骼（點數） | Inferior alveolar nerve.r | 最遠 60 mm（head extension 35） | 229 | 230 | 計數差（距離相同） |
| 脫離骨骼（點數） | Long thoracic nerve.l | 最遠 41 mm（shoulder flexion 150） | 12 | 13 | 計數差（距離相同） |
| 脫離骨骼（點數） | Long thoracic nerve.l | 最遠 49 mm（shoulder abduction 120） | 12 | 13 | 計數差（距離相同） |
| 脫離骨骼（點數） | Meningeal branch of maxillary nerve.l | 最遠 31 mm（head flexion 40） | 67 | 70 | 計數差（距離相同） |
| 脫離骨骼（點數） | Meningeal branch of maxillary nerve.r | 最遠 50 mm（head extension 35） | 88 | 90 | 計數差（距離相同） |
| 脫離骨骼（點數） | Nerve to mylohyoid muscle.l | 最遠 39 mm（head flexion 40） | 171 | 193 | 計數差（距離相同） |
| 脫離骨骼（點數） | Nerve to mylohyoid muscle.l | 最遠 52 mm（head extension 35） | 209 | 229 | 計數差（距離相同） |
| 脫離骨骼（點數） | Nerve to mylohyoid muscle.r | 最遠 39 mm（head flexion 40） | 196 | 212 | 計數差（最遠距離相差 ≤5 mm） |
| 脫離骨骼（點數） | Nerve to mylohyoid muscle.r | 最遠 53 mm（head extension 35） | 210 | 228 | 計數差（距離相同） |
| 脫離骨骼（點數） | Oculomotor nerve (III).l | 最遠 60 mm（head extension 35） | 129 | 134 | 計數差（距離相同） |
| 脫離骨骼（點數） | Oculomotor nerve (III).l | 最遠 60 mm（head flexion 40） | 129 | 134 | 計數差（距離相同） |
| 脫離骨骼（點數） | Oculomotor nerve (III).r | 最遠 60 mm（head extension 35） | 121 | 127 | 計數差（最遠距離相差 ≤5 mm） |
| 脫離骨骼（點數） | Oculomotor nerve (III).r | 最遠 60 mm（head flexion 40） | 121 | 127 | 計數差（距離相同） |
| 脫離骨骼（點數） | Ophthalmic nerve.r | 最遠 39 mm（head extension 35） | 41 | 43 | 計數差（距離相同） |
| 脫離骨骼（點數） | Ophthalmic nerve.r | 最遠 53 mm（head flexion 40） | 41 | 43 | 計數差（最遠距離相差 ≤5 mm） |
| 脫離骨骼（點數） | Optic nerve (II).l | 最遠 58 mm（head extension 35） | 164 | 220 | 計數差（距離相同） |
| 脫離骨骼（點數） | Optic nerve (II).l | 最遠 60 mm（head flexion 40） | 164 | 220 | 計數差（距離相同） |
| 脫離骨骼（點數） | Optic nerve (II).r | 最遠 60 mm（head extension 35） | 171 | 232 | 計數差（距離相同） |
| 脫離骨骼（點數） | Optic nerve (II).r | 最遠 60 mm（head flexion 40） | 171 | 232 | 計數差（距離相同） |
| 脫離骨骼（點數） | Superior subscapular nerve.l | 最遠 24 mm（shoulder abduction 120） | 74 | 138 | 計數差（距離相同） |
| 脫離骨骼（點數） | Superior subscapular nerve.r | 最遠 23 mm（shoulder abduction 120） | 71 | 133 | 計數差（距離相同） |
| 脫離骨骼（點數） | Suprascapular nerve.r | 最遠 19 mm（shoulder flexion 150） | 14 | 16 | 計數差（最遠距離相差 ≤5 mm） |
| 脫離骨骼（點數） | Vestibular nerve.l | 最遠 48 mm（head flexion 40） | 266 | 281 | 計數差（距離相同） |
| 脫離骨骼（點數） | Vestibular nerve.r | 最遠 45 mm（head extension 35） | 257 | 261 | 計數差（最遠距離相差 ≤5 mm） |
| 脫離骨骼（點數） | Vestibular nerve.r | 最遠 49 mm（head flexion 40） | 296 | 305 | 計數差（距離相同） |
| 脫離骨骼（點數） | Vestibulocochlear nerve (VIII).l | 最遠 28 mm（head flexion 40） | 86 | 116 | 計數差（距離相同） |
| 脫離骨骼（點數） | Vestibulocochlear nerve (VIII).l | 最遠 43 mm（head extension 35） | 246 | 325 | 計數差（距離相同） |
| 脫離骨骼（點數） | Vestibulocochlear nerve (VIII).r | 最遠 28 mm（head flexion 40） | 81 | 107 | 計數差（距離相同） |
| 脫離骨骼（點數） | Vestibulocochlear nerve (VIII).r | 最遠 44 mm（head extension 35） | 144 | 189 | 計數差（距離相同） |
| 拉伸（三角形數） | Lateral pectoral nerve.r | 最差 ×3.0（shoulder flexion 150） | 340 | 342 | 計數差（倍率相同） |
| 拉伸（三角形數） | Pudendal nerve.l | 最差 ×2.1（hip flexion 120 knee flexion 130） | 218 | 220 | 計數差（倍率相同） |
| 拉伸（三角形數） | Pudendal nerve.r | 最差 ×2.1（hip flexion 120 knee flexion 130） | 218 | 220 | 計數差（倍率相同） |
| 拉伸（三角形數） | Right lateral cord of brachial plexus | 最差 ×2.1（shoulder flexion 150） | 16 | 18 | 計數差（倍率相同） |
| 拉伸（三角形數） | Superior lateral brachial cutaneous nerve.l | 最差 ×2.9（shoulder flexion 150） | 1053 | 1054 | 計數差（倍率相同） |
| 拉伸（三角形數） | Superior lateral brachial cutaneous nerve.r | 最差 ×2.9（shoulder flexion 150） | 1045 | 1050 | 計數差（倍率相同） |
| 拉伸（三角形數） | Suprascapular nerve.l | 最差 ×2.4（shoulder abduction 120） | 74 | 76 | 計數差（倍率相同） |
| 穿入深度（mm） | Femoral nerve.l | wall 3 mm deep into Second lumbar vertebra | 2.9 | 3 | 微小差異（≤0.2 mm） |
| 穿入深度（mm） | Intermediate dorsal cutaneous nerve of foot.l | wall 7.8 mm deep into Left fibularis tertius | 5.5 | 7.8 | 實際變化 |
| 穿入深度（mm） | Obturator nerve.l | wall 4.3 mm deep into Fourth lumbar vertebra | 4.2 | 4.3 | 微小差異（≤0.2 mm） |
| 穿入深度（mm） | Posterior root of spinal nerve.r | wall 2.4 mm deep into Eleventh thoracic vertebra | 2.3 | 2.4 | 微小差異（≤0.2 mm） |
| 穿入深度（mm） | Right inferior gluteal nerve | wall 3.3 mm deep into Sacrum | 3.2 | 3.3 | 微小差異（≤0.2 mm） |
| 穿入深度（mm） | Superior gluteal nerve.l | wall 5.1 mm deep into Sacrum | 5 | 5.1 | 微小差異（≤0.2 mm） |
| 穿入深度（mm） | Superior gluteal nerve.r | wall 2.5 mm deep into Sacrum | 2.4 | 2.5 | 微小差異（≤0.2 mm） |
| 穿入深度（mm） | Ulnar nerve.l | wall 2.6 mm deep into Left ulna | 2.5 | 2.6 | 微小差異（≤0.2 mm） |
| 面重合（面數） | Sciatic nerve.l | 359 面（較小網格的 25%）與股後皮神經前根重合 | — | 359 | 新增（官方資料） |
| 面重合（面數） | Sciatic nerve.r | 359 面（較小網格的 25%）與股後皮神經前根重合 | — | 359 | 新增（官方資料） |
| 平直切口（mm） | Right radial groove | 5 straight boundary run(s), longest 26.9 mm, direction -0.28,-0.95,-0.15 | 26.5 | 26.9 | 原因未確認 |

## 建議（需使用者決定；牽涉神經位置或綁定，屬解剖內容，PR 會標【需人工審核】）
1. **穩定度檢查的比較方式改為不受網格密度影響：** 「脫離骨骼」與「拉伸」改比最遠距離／最差倍率，不比點數與三角形數；這樣換來源或重新取樣網格就不會再出現假的變差。這是改檢查規則，要由使用者決定。
2. **坐骨神經與股後皮神經前根的重合面：** 官方資料裡前根的一段表面與坐骨神經表面重合。可選：把前根沿其軸向內縮 0.2 mm（保留位置、消除重合），或在顯示時把重合面歸為同一件。要由使用者決定。
3. **趾背中間皮神經的 5.5 → 7.8 mm 穿入：** 要依 Gray's 1918 的描述核對這條神經在腓骨第三肌表面還是肌肉內，再決定是否把那幾個頂點移出。
4. **頭部與肩部神經跟著骨骼動：** 把頭部神經綁到頭部動作、把肩胛上／下／肩胛下神經與胸長神經綁到肩胛，一次減少大約 40 條「脫離骨骼」。這是動作綁定的改動，工作量較大。
5. **右橈神經溝切口：** 先確認這個骨性標記的來源是否取自橈神經路徑；原因未確認前不動。

## 處理結果（使用者 2026-11-11 指示做 1、2、3）
- **2. 坐骨神經與前根的重合面：已處理。** 萃取工具 `scripts/extract-zanatomy-nervous.mjs` 把前根與坐骨神經表面重合的面（每側 266 面）沿各自法線向內縮 0.3 mm（前根起在坐骨神經內，這一段改為在神經鞘表面之下）；`asset.extras.adjustments` 與 `public/ATTRIBUTION.md` 記錄這項修改。穩定度檢查的這 2 條重合已消失，其他 1087 條沒有變動，已知清單由 1089 降為 1087。
- **3. 趾背中間皮神經：這次沒有移動，原因如下。**
  - 檢查說它穿入「左腓骨第三肌」，但這個「骨」是圖譜把腓骨第三肌（肌肉，編號 FJ1411M）歸在骨骼系統，被當成骨來量；同一份資料裡腓骨長肌、腓骨短肌、脛前肌也同樣被歸為骨骼。
  - 這塊網格的面朝向不一致：我試過把神經那一段往外（肌肉表面法線方向）移 8.5 mm，穿入反而從 7 個頂點變成 97 個，因為最近的面是朝內的。所以這項「穿入」本身不可靠，在釐清分類與面朝向之前移動神經位置沒有依據。
  - Gray's 1918 的文字我這次沒能取得（Wikisource、Bartleby 都找不到可用頁面），所以沒有依 Gray's 核對。依「皮神經走在皮下、在肌肉與肌腱之外」的定義，這段神經不該穿入肌肉，但具體位置請使用者核對。
  - 建議另案：把腿部肌肉的系統分類改正（讓穿骨檢查只量骨），再重新量；並檢查腓骨第三肌網格的面朝向。這是分類與模型修正，要由使用者決定。
- **1. 改穩定度檢查的比較方式：** 另開 PR 處理。
