# 咽後間隙方案 B：位移量與穿模預檢（只量、不改）

內部技術文件（不進網站）。腳本：`node scripts/measure-retro-plan-b.mjs`（唯讀，約 2.5 分鐘，依賴生成的串流檔，不屬於 CI）。把 `docs/retropharyngeal-survey.md` 方案 B 的位移場套在頂點副本上（只改 z，隨高度漸變），再量與「留在原位的鄰居」的距離。座標：公尺換算 mm，z 向前為正。位置依 Gray's Anatomy 1918 與 OpenStax 的一般描述，請使用者核對；**未在 3D 畫面確認**（只有數值）。

兩個變體：V1＝調查報告的位移場（喉 C5 +5.9、C6 +3.4、C4-C5 以上 0，隨高度剪切）；V2＝喉軟骨與喉肌整塊剛性前移 5.9 mm（甲狀舌骨膜與外側甲狀舌骨韌帶上緣隨舌骨不動、下緣隨喉）。咽組（咽縫、下／中／上咽縮肌、顎咽肌、莖突咽肌）兩者相同。氣管與食道在 y 1465 至 1440 mm 漸減到 0。

## 結論（先看）

1. **V1 不可行**：喉依高度剪切，軟骨網格邊長被拉伸最多 1.34 倍（杓狀軟骨 10.5% 的邊超過 1.3 或低於 0.77、甲狀會厭韌帶 32.8%）；軟骨不能變形。要用整塊剛性位移（V2：軟骨不變形；只有甲狀舌骨膜、舌骨上緣韌帶等連接物伸長最多 1.22 倍）。
2. **咽與喉之間仍幾乎沒有間隙**：中線帶（|x| < 12 mm）層次鏈在位移後，V1 的喉後緣減咽縫前緣在 C4、C5、C6 為 −1.0、−0.7、−0.5 mm（仍重疊）；V2 為 +4.3、−0.1、+1.6 mm。咽縫後緣減椎前肌前面為 −0.1 至 +0.7 mm，**就是貼著，沒有厚度**。所以方案 B 只是「不重疊」，**位移之後咽後間隙的厚度是 0**，要畫出咽後間隙（半透明立體）必須用方案 C 的 +8 至 9 mm 或由使用者指定厚度；這點要先由使用者決定。
3. **前方結構全部被牽連**：喉前移 5.9 mm 後，離喉不到 0.5 mm 的帶狀肌（胸骨舌骨肌、胸骨甲狀肌、甲狀舌骨肌、肩胛舌骨肌）頂點由 167 增到 2157（V2）；頸闊肌與喉的最小距離 6.1 → 0.5 mm（V2；V1 為 2.8 mm），皮膚 9.9 → 4.5 mm。氣管／食道上段與帶狀肌 2.7 → 0.0 mm。所以帶狀肌（8 塊）也必須前移或在附著端剪切，頸闊肌與皮膚已沒有餘裕。
4. **有利的部分**：咽組前移後離椎體由 469 個近接頂點（≤ 0.5 mm）變 0、離椎前肌 541 → 16，也就是咽縫與下咽縮肌不再穿入椎體與椎前肌；咽組離頸動脈、頸內靜脈 ≥ 17 mm，離皮膚 15.4 mm，離頸闊肌 6.9 mm；喉與氣管離喉返神經仍有 3.5 至 5.1 mm（神經在示意管，終點需跟著環狀軟骨移，HN-24 的入喉點由環狀軟骨最外緣算，會自動跟隨）。
5. **要動的結構**：咽組 11 個網格、喉組約 36 個網格（含兩個重複的環狀軟骨、兩個重複的舌骨不動）、甲狀舌骨膜與韌帶 5 個、氣管與食道上段、帶狀肌 8 塊、喉返神經終點；另需修動作綁定（舌骨與甲狀軟骨中心當載體）、#316 喉修補管線、頭頸動作檢查。

## 建議

只做 V2（喉整塊剛性 +5.9 mm，咽組依表前移，帶狀肌與膜在上端隨舌骨、下端隨喉剪切，氣管食道漸減），並**先請使用者決定**：(a) 要不要把咽後間隙畫出來（要的話厚度由使用者定，方案 C 需再多 +8 至 9 mm，頸闊肌與皮膚會頂到）；(b) 接受方案 B 後咽後間隙只有 0 厚度（只能畫成貼合邊界的薄層）。

## 完整量測輸出


## V1: survey field (shear)

### Triangle stretch of the moved meshes (new / old edge length)
| group | mesh | worst ratio | % edges beyond 1.3 or 0.77 |
|---|---|---|---|
| pharynx | Pharyngeal raphe (FJ2749) | 1.16 | 0.0 |
| pharynx | Left inferior pharyngeal constrictor (FJ2740) | 1.16 | 0.0 |
| pharynx | Right inferior pharyngeal constrictor (FJ2752) | 1.16 | 0.0 |
| pharynx | Left palatopharyngeus (FJ2743) | 1.16 | 0.0 |
| pharynx | Right palatopharyngeus (FJ2755) | 1.16 | 0.0 |
| larynx | Cricoid cartilage (FJ2440) | 1.34 | 0.5 |
| larynx | Cricoid cartilage (FJ2769) | 1.34 | 0.5 |
| larynx | Thyroid cartilage (FJ2808) | 1.33 | 0.9 |
| larynx | Epiglottis (FJ2770) | 1.33 | 0.7 |
| larynx | Left aryepiglotticus (FJ2774) | 1.34 | 1.4 |
| larynx | Left arytenoid cartilage (FJ2775) | 1.34 | 10.5 |
| larynx | Left corniculate cartilage (FJ2776) | 1.33 | 5.2 |
| larynx | Left conus elasticus (FJ2777) | 1.34 | 1.4 |
| larynx | Left lateral crico-arytenoid (FJ2778) | 1.33 | 1.7 |
| larynx | Left oblique arytenoid (FJ2780) | 1.34 | 3.0 |
| larynx | Left posterior crico-arytenoid (FJ2782) | 1.33 | 0.2 |
| larynx | Left thyro-arytenoid (FJ2784) | 1.34 | 6.4 |
| larynx | Left thyro-arytenoid (FJ2785) | 1.34 | 0.8 |
| larynx | Left vocal ligament (FJ2787) | 1.33 | 0.1 |
| larynx | Left vocalis (FJ2788) | 1.34 | 2.2 |
| larynx | Median cricothyroid ligament (FJ2789) | 1.34 | 0.6 |
| larynx | Right aryepiglotticus (FJ2791) | 1.33 | 0.8 |
| larynx | Right arytenoid cartilage (FJ2792) | 1.34 | 7.8 |
| larynx | Right corniculate cartilage (FJ2793) | 1.34 | 8.0 |
| larynx | Right conus elasticus (FJ2794) | 1.34 | 1.2 |
| larynx | Right lateral crico-arytenoid (FJ2796) | 1.34 | 2.2 |
| larynx | Right oblique arytenoid (FJ2798) | 1.34 | 3.6 |
| larynx | Right posterior crico-arytenoid (FJ2800) | 1.33 | 0.2 |
| larynx | Right thyro-arytenoid (FJ2802) | 1.34 | 6.7 |
| larynx | Right thyro-arytenoid (FJ2803) | 1.34 | 0.8 |
| larynx | Right vocal ligament (FJ2805) | 1.33 | 0.2 |
| larynx | Right vocalis (FJ2806) | 1.34 | 1.7 |
| larynx | Thyro-epiglottic ligament (FJ2807) | 1.34 | 32.8 |
| larynx | Transverse arytenoid (FJ2809) | 1.34 | 1.4 |
| larynxMembranes | Median thyrohyoid ligament (FJ2790) | 1.34 | 0.5 |

### Layer chain in the midline band after the move (z, mm; absolute, not relative to the vertebrae)
| y | prevertebral muscle front | raphe back～front | rearmost larynx/hyoid | larynx rear minus raphe front (negative = overlap) | raphe back minus prevertebral front (negative = in the muscle) |
|---|---|---|---|---|---|
| 1550 | -5.6 | -4.9～-1.0 | — | — | 0.7 |
| 1530 | -5.3 | -5.3～-1.3 | — | — | -0.0 |
| 1510 | -6.4 | -6.2～-2.2 | 16.7 | 18.9 | 0.2 |
| 1490 | -6.0 | -6.1～-2.6 | -3.6 | -1.0 | -0.1 |
| 1480 | -5.8 | -5.9～-2.5 | -3.3 | -0.7 | -0.1 |
| 1470 | -6.0 | -7.0～-2.9 | -3.4 | -0.5 | -1.0 |

### Moved structures against neighbours that stay (smallest vertex-to-surface distance in mm before -> after; sampled vertices within 0.5 mm before -> after)
| moved group | neighbour group | before min | after min | near before | near after |
|---|---|---|---|---|---|
| pharynx | vertebrae and discs (closed) | 0.0 | 1.4 | 469 | 0 |
| pharynx | prevertebral muscles | 0.0 | 0.0 | 541 | 16 |
| pharynx | hyoid (closed) | 0.0 | 0.0 | 202 | 190 |
| pharynx | skin (closed) | 18.2 | 15.4 | 0 | 0 |
| pharynx | platysma | 9.2 | 6.9 | 0 | 0 |
| pharynx | strap muscles | 0.0 | 0.0 | 83 | 317 |
| pharynx | carotid, jugular vein | — | 17.2 | 0 | 0 |
| pharynx | vagus, sympathetic trunk | 0.0 | 0.0 | 13 | 34 |
| pharynx | recurrent laryngeal nerve (generated) | 1.1 | 2.4 | 0 | 0 |
| larynx | vertebrae and discs (closed) | 0.9 | 4.0 | 0 | 0 |
| larynx | prevertebral muscles | 0.0 | 0.1 | 146 | 19 |
| larynx | hyoid (closed) | 0.1 | 0.1 | 10 | 10 |
| larynx | skin (closed) | 9.9 | 6.8 | 0 | 0 |
| larynx | platysma | 6.1 | 2.8 | 0 | 0 |
| larynx | strap muscles | 0.0 | 0.0 | 167 | 1520 |
| larynx | vagus, sympathetic trunk | 0.0 | 0.0 | 189 | 206 |
| larynx | recurrent laryngeal nerve (generated) | 1.1 | 3.5 | 0 | 0 |
| larynxMembranes | vertebrae and discs (closed) | 10.5 | 10.5 | 0 | 0 |
| larynxMembranes | prevertebral muscles | 0.0 | 0.0 | 80 | 80 |
| larynxMembranes | hyoid (closed) | 0.0 | 0.0 | 472 | 472 |
| larynxMembranes | skin (closed) | 10.1 | 7.1 | 0 | 0 |
| larynxMembranes | platysma | 6.2 | 3.2 | 0 | 0 |
| larynxMembranes | strap muscles | 0.0 | 0.0 | 177 | 177 |
| larynxMembranes | vagus, sympathetic trunk | 4.0 | 4.0 | 0 | 0 |
| tracheaOesophagus | vertebrae and discs (closed) | 0.4 | 2.8 | 1 | 0 |
| tracheaOesophagus | prevertebral muscles | 0.1 | 0.1 | 9 | 7 |
| tracheaOesophagus | skin (closed) | 28.0 | 24.7 | 0 | 0 |
| tracheaOesophagus | platysma | 24.0 | 12.4 | 0 | 0 |
| tracheaOesophagus | strap muscles | 2.7 | 1.1 | 0 | 0 |
| tracheaOesophagus | carotid, jugular vein | 4.7 | 4.7 | 0 | 0 |
| tracheaOesophagus | vagus, sympathetic trunk | 1.1 | 0.3 | 0 | 3 |
| tracheaOesophagus | inferior thyroid artery | 24.3 | 23.7 | 0 | 0 |
| tracheaOesophagus | recurrent laryngeal nerve (generated) | 0.1 | 0.1 | 1 | 1 |

### Moved pharynx against moved larynx and moved trachea/oesophagus
| pair | before min | after min | near before | near after |
|---|---|---|---|---|
| pharynx / larynx | 0.0 | 0.0 | 660 | 1257 |
| pharynx / tracheaOesophagus | 0.0 | 0.0 | 182 | 474 |
| larynx / tracheaOesophagus | 0.0 | 0.0 | 340 | 323 |

## V2: larynx moved as one rigid block

### Triangle stretch of the moved meshes (new / old edge length)
| group | mesh | worst ratio | % edges beyond 1.3 or 0.77 |
|---|---|---|---|
| pharynx | Pharyngeal raphe (FJ2749) | 1.16 | 0.0 |
| pharynx | Left inferior pharyngeal constrictor (FJ2740) | 1.16 | 0.0 |
| pharynx | Right inferior pharyngeal constrictor (FJ2752) | 1.16 | 0.0 |
| pharynx | Left palatopharyngeus (FJ2743) | 1.16 | 0.0 |
| pharynx | Right palatopharyngeus (FJ2755) | 1.16 | 0.0 |
| larynx | Thyroid cartilage (FJ2808) | 1.22 | 0.0 |
| larynx | Epiglottis (FJ2770) | 1.22 | 0.0 |
| larynx | Hyo-epiglottic ligament (FJ2771) | 1.22 | 0.0 |
| larynx | Left aryepiglotticus (FJ2774) | 1.22 | 0.0 |
| larynx | Left thyro-arytenoid (FJ2785) | 1.21 | 0.0 |
| larynx | Right aryepiglotticus (FJ2791) | 1.21 | 0.0 |
| larynx | Right thyro-arytenoid (FJ2803) | 1.22 | 0.0 |
| larynxMembranes | Left thyrohyoid membrane (FJ2786) | 1.22 | 0.0 |
| larynxMembranes | Right thyrohyoid membrane (FJ2804) | 1.22 | 0.0 |
| larynxMembranes | Left lateral thyrohyoid ligament (FJ2779) | 1.22 | 0.0 |
| larynxMembranes | Right lateral thyrohyoid ligament (FJ2797) | 1.22 | 0.0 |

### Layer chain in the midline band after the move (z, mm; absolute, not relative to the vertebrae)
| y | prevertebral muscle front | raphe back～front | rearmost larynx/hyoid | larynx rear minus raphe front (negative = overlap) | raphe back minus prevertebral front (negative = in the muscle) |
|---|---|---|---|---|---|
| 1550 | -5.6 | -4.9～-1.0 | — | — | 0.7 |
| 1530 | -5.3 | -5.3～-1.3 | — | — | -0.0 |
| 1510 | -6.4 | -6.2～-2.2 | 16.7 | 18.9 | 0.2 |
| 1490 | -6.0 | -6.1～-2.6 | 1.7 | 4.3 | -0.1 |
| 1480 | -5.8 | -5.9～-2.5 | -2.6 | -0.1 | -0.1 |
| 1470 | -6.0 | -7.0～-2.9 | -1.3 | 1.6 | -1.0 |

### Moved structures against neighbours that stay (smallest vertex-to-surface distance in mm before -> after; sampled vertices within 0.5 mm before -> after)
| moved group | neighbour group | before min | after min | near before | near after |
|---|---|---|---|---|---|
| pharynx | vertebrae and discs (closed) | 0.0 | 1.4 | 469 | 0 |
| pharynx | prevertebral muscles | 0.0 | 0.0 | 541 | 16 |
| pharynx | hyoid (closed) | 0.0 | 0.0 | 202 | 190 |
| pharynx | skin (closed) | 18.2 | 15.4 | 0 | 0 |
| pharynx | platysma | 9.2 | 6.9 | 0 | 0 |
| pharynx | strap muscles | 0.0 | 0.0 | 83 | 317 |
| pharynx | carotid, jugular vein | — | 17.2 | 0 | 0 |
| pharynx | vagus, sympathetic trunk | 0.0 | 0.0 | 13 | 34 |
| pharynx | recurrent laryngeal nerve (generated) | 1.1 | 2.4 | 0 | 0 |
| larynx | vertebrae and discs (closed) | 0.9 | 8.5 | 0 | 0 |
| larynx | prevertebral muscles | 0.0 | 3.7 | 146 | 0 |
| larynx | hyoid (closed) | 0.1 | 0.0 | 10 | 64 |
| larynx | skin (closed) | 9.9 | 4.5 | 0 | 0 |
| larynx | platysma | 6.1 | 0.5 | 0 | 0 |
| larynx | strap muscles | 0.0 | 0.0 | 167 | 2157 |
| larynx | vagus, sympathetic trunk | 0.0 | 0.0 | 189 | 186 |
| larynx | recurrent laryngeal nerve (generated) | 1.1 | 5.1 | 0 | 0 |
| larynxMembranes | vertebrae and discs (closed) | 10.5 | 16.2 | 0 | 0 |
| larynxMembranes | prevertebral muscles | 0.0 | 1.9 | 80 | 0 |
| larynxMembranes | hyoid (closed) | 0.0 | 0.0 | 472 | 290 |
| larynxMembranes | skin (closed) | 10.1 | 4.7 | 0 | 0 |
| larynxMembranes | platysma | 6.2 | 0.6 | 0 | 0 |
| larynxMembranes | strap muscles | 0.0 | 0.0 | 177 | 290 |
| larynxMembranes | vagus, sympathetic trunk | 4.0 | 4.6 | 0 | 0 |
| tracheaOesophagus | vertebrae and discs (closed) | 0.4 | 4.7 | 1 | 0 |
| tracheaOesophagus | prevertebral muscles | 0.1 | 0.2 | 9 | 6 |
| tracheaOesophagus | skin (closed) | 28.0 | 16.8 | 0 | 0 |
| tracheaOesophagus | platysma | 24.0 | 7.0 | 0 | 0 |
| tracheaOesophagus | strap muscles | 2.7 | 0.0 | 0 | 12 |
| tracheaOesophagus | carotid, jugular vein | 4.7 | 4.7 | 0 | 0 |
| tracheaOesophagus | vagus, sympathetic trunk | 1.1 | 0.7 | 0 | 0 |
| tracheaOesophagus | inferior thyroid artery | 24.3 | 22.8 | 0 | 0 |
| tracheaOesophagus | recurrent laryngeal nerve (generated) | 0.1 | 0.1 | 1 | 1 |

### Moved pharynx against moved larynx and moved trachea/oesophagus
| pair | before min | after min | near before | near after |
|---|---|---|---|---|
| pharynx / larynx | 0.0 | 0.0 | 660 | 881 |
| pharynx / tracheaOesophagus | 0.0 | 0.0 | 182 | 239 |
| larynx / tracheaOesophagus | 0.0 | 0.0 | 340 | 381 |
