# 上肢神經與血管走向對照

走向動畫（上肢）：神經 11 步、血管 11 步，路徑資料在 `lib/pathways/upper-limb.ts`，原型在 `docs/prototypes/upper-limb-nerves.html`（不部署）。名稱以 115-1 的結構名稱為準。

## 資訊卡「播放走向」對照（上肢）

規則：資訊卡上的結構（只限右側，或沒有左右之分的神經叢）若符合下表的名稱，卡片出現「播放走向」按鈕，進入走向動畫並跳到該步驟，高亮表中的路徑（比動畫更細的結構跳到所屬主幹並高亮主幹）。對照資料在 `lib/pathways/card-map.ts`，`scripts/test-flow-card-map.mjs` 檢查每一筆的步驟與路徑都存在。

| 類別 | 步驟 | 動畫標題 | 資訊卡名稱（去掉 right／left 後，小寫） | 高亮路徑 id |
|---|---|---|---|---|
| 神經 | 1 | 臂神經叢的神經根 | brachial plexus｜roots of brachial plexus｜supraclavicular part of brachial plexus | r5, r6, r7, r8, rt1 |
| 神經 | 1 | 臂神經叢的神經根 | dorsal scapular nerve | dsn |
| 神經 | 1 | 臂神經叢的神經根 | long thoracic nerve | ltn |
| 神經 | 2 | 神經幹與分股 | superior trunk of brachial plexus | ut |
| 神經 | 2 | 神經幹與分股 | middle trunk of brachial plexus | mt |
| 神經 | 2 | 神經幹與分股 | inferior trunk of brachial plexus | lt |
| 神經 | 2 | 神經幹與分股 | anterior division of superior trunk of brachial plexus | ut_a |
| 神經 | 2 | 神經幹與分股 | posterior division of superior trunk of brachial plexus | ut_p |
| 神經 | 2 | 神經幹與分股 | anterior division of middle trunk of brachial plexus | mt_a |
| 神經 | 2 | 神經幹與分股 | posterior division of middle trunk of brachial plexus | mt_p |
| 神經 | 2 | 神經幹與分股 | anterior division of inferior trunk of brachial plexus | lt_a |
| 神經 | 2 | 神經幹與分股 | posterior division of inferior trunk of brachial plexus | lt_p |
| 神經 | 2 | 神經幹與分股 | suprascapular nerve | ssn |
| 神經 | 3 | 三條神經索 | lateral cord of brachial plexus | lc |
| 神經 | 3 | 三條神經索 | medial cord of brachial plexus | mc |
| 神經 | 3 | 三條神經索 | posterior cord of brachial plexus | pc |
| 神經 | 3 | 三條神經索 | infraclavicular part of brachial plexus | lc, mc, pc |
| 神經 | 4 | 外側索與內側索的分支 | lateral pectoral nerve｜branches of lateral cord of brachial plexus | lpn |
| 神經 | 4 | 外側索與內側索的分支 | medial pectoral nerve | mpn |
| 神經 | 4 | 外側索與內側索的分支 | medial brachial cutaneous nerve | mcna |
| 神經 | 4 | 外側索與內側索的分支 | medial antebrachial cutaneous nerve｜anterior branch of medial antebrachial cutaneous nerve｜posterior branch of medial antebrachial cutaneous nerve | mcnf |
| 神經 | 4 | 外側索與內側索的分支 | branches of medial cord of brachial plexus | mpn, mcna, mcnf |
| 神經 | 5 | 肌皮神經 | musculocutaneous nerve｜lateral antebrachial cutaneous nerve | musc |
| 神經 | 6 | 正中神經 | anterior interosseous nerve of forearm | ain |
| 神經 | 6 | 正中神經 | common｜proper) palmar digital branches of median nerve | md1, md2, md3, md4 |
| 神經 | 6 | 正中神經 | median nerve｜muscular branches of median nerve｜palmar branch of median nerve｜communicating branch of median nerve with ulnar nerve | median |
| 神經 | 7 | 尺神經 | deep branch of ulnar nerve | udp |
| 神經 | 7 | 尺神經 | superficial branch of ulnar nerve｜(common｜proper) palmar digital branches of ulnar nerve｜dorsal digital branches of ulnar nerve | ud1, ud2 |
| 神經 | 7 | 尺神經 | ulnar nerve｜dorsal branch of ulnar nerve｜palmar branch of ulnar nerve｜muscular branches of ulnar nerve | ulnar |
| 神經 | 8 | 後索的分支 | superior subscapular nerve | uss |
| 神經 | 8 | 後索的分支 | inferior subscapular nerve | lss |
| 神經 | 8 | 後索的分支 | thoracodorsal nerve | tdn |
| 神經 | 8 | 後索的分支 | branches of posterior cord of brachial plexus | uss, tdn, lss |
| 神經 | 9 | 腋神經 | axillary nerve｜muscular branches of axillary nerve｜superior lateral brachial cutaneous nerve | axn |
| 神經 | 10 | 橈神經 | superficial branch of radial nerve｜dorsal digital branches of radial nerve | rad_s |
| 神經 | 10 | 橈神經 | deep branch of radial nerve｜posterior interosseous nerve of forearm | rad_d |
| 神經 | 10 | 橈神經 | radial nerve｜muscular branches of radial nerve｜posterior antebrachial cutaneous nerve｜inferior lateral brachial cutaneous nerve | radial |
| 血管 | 1 | 鎖骨下動脈到腋動脈 | brachiocephalic trunk | bct |
| 血管 | 1 | 鎖骨下動脈到腋動脈 | subclavian artery | rsca |
| 血管 | 1 | 鎖骨下動脈到腋動脈 | axillary artery | axa |
| 血管 | 2 | 肩胛周圍的動脈 | suprascapular artery | ssa |
| 血管 | 2 | 肩胛周圍的動脈 | dorsal scapular artery | dsa |
| 血管 | 3 | 腋動脈第一、二段 | lateral thoracic artery | lta |
| 血管 | 4 | 腋動脈第三段 | subscapular artery | subsa |
| 血管 | 4 | 腋動脈第三段 | circumflex scapular artery | csa |
| 血管 | 4 | 腋動脈第三段 | thoracodorsal artery | tda |
| 血管 | 4 | 腋動脈第三段 | anterior circumflex humeral artery | acha |
| 血管 | 4 | 腋動脈第三段 | posterior circumflex humeral artery | pcha |
| 血管 | 5 | 肱動脈 | deep brachial artery | pba |
| 血管 | 5 | 肱動脈 | middle collateral branch of deep brachial artery | mca |
| 血管 | 5 | 肱動脈 | radial collateral branch of deep brachial artery | rca |
| 血管 | 5 | 肱動脈 | superior ulnar collateral artery | suca |
| 血管 | 5 | 肱動脈 | inferior ulnar collateral artery | iuca |
| 血管 | 5 | 肱動脈 | brachial artery | braa |
| 血管 | 6 | 橈動脈 | radial recurrent artery | rra |
| 血管 | 6 | 橈動脈 | radial artery｜dorsal carpal branch of radial artery｜arteria radialis indicis | rada |
| 血管 | 7 | 尺動脈與骨間動脈 | anterior ulnar recurrent artery | aura |
| 血管 | 7 | 尺動脈與骨間動脈 | posterior ulnar recurrent artery | pura |
| 血管 | 7 | 尺動脈與骨間動脈 | common interosseous artery | cia |
| 血管 | 7 | 尺動脈與骨間動脈 | anterior interosseous artery | aia |
| 血管 | 7 | 尺動脈與骨間動脈 | posterior interosseous artery｜recurrent interosseous artery | pia |
| 血管 | 7 | 尺動脈與骨間動脈 | ulnar artery｜dorsal carpal branch of ulnar artery | ula |
| 血管 | 8 | 掌部動脈弓 | superficial palmar arterial arch｜superficial palmar venous arch | spa |
| 血管 | 8 | 掌部動脈弓 | deep palmar arch｜deep palmar venous arch | dpbu |
| 血管 | 8 | 掌部動脈弓 | first｜second｜third｜fourth) common palmar digital artery | cpd1, cpd2, cpd3 |
| 血管 | 8 | 掌部動脈弓 | lateral｜medial) proper palmar digital artery of .*$｜^proper palmar digital vein of .* | ppd1, ppd2, ppd3 |
| 血管 | 8 | 掌部動脈弓 | palmar metacarpal (artery｜vein | cpd1, cpd2, cpd3 |
| 血管 | 9 | 頭靜脈 | cephalic vein | ceph |
| 血管 | 10 | 貴要靜脈與肘正中靜脈 | basilic vein｜axillary vein | bas |
| 血管 | 10 | 貴要靜脈與肘正中靜脈 | median cubital vein | mcv |
| 血管 | 10 | 貴要靜脈與肘正中靜脈 | median antebrachial vein | mav |
| 血管 | 1 | 鎖骨下動脈到腋動脈 | subclavian vein | v_rsca |
| 血管 | 2 | 肩胛周圍的動脈 | suprascapular vein | v_ssa |
| 血管 | 3 | 腋動脈第一、二段 | lateral thoracic vein | v_lta |
| 血管 | 4 | 腋動脈第三段 | subscapular vein | v_subsa |
| 血管 | 4 | 腋動脈第三段 | circumflex scapular vein | v_csa |
| 血管 | 4 | 腋動脈第三段 | thoracodorsal vein | v_tda |
| 血管 | 4 | 腋動脈第三段 | anterior circumflex humeral vein | v_acha |
| 血管 | 5 | 肱動脈 | medial brachial vein | v_braa |
| 血管 | 6 | 橈動脈 | radial vein | v_rada |
| 血管 | 7 | 尺動脈與骨間動脈 | ulnar vein | v_ula |

### 目前沒有對應資訊卡的路徑

以下動畫路徑在網站目前沒有同名資訊卡，所以沒有按鈕；之後補結構時一併補資訊卡並加入上表。列出路徑 id 與所在步驟（括號內為該步驟畫面上的標籤名稱，供對照）。

- 神經第 4 步「外側索與內側索的分支」：icbn（標籤：外側胸神經、內側胸神經、上臂內側皮神經、肋間臂神經、前臂內側皮神經）
- 神經第 6 步「正中神經」：med_l、med_m、mrec（標籤：內、外側根、肱動脈、旋前圓肌兩頭之間、前骨間神經、腕隧道）
- 神經第 9 步「腋神經」：axn_tm（標籤：腋神經、四邊孔、後旋肱動脈、三角肌）
- 血管第 2 步「肩胛周圍的動脈」：tcs（標籤：肩胛上動脈、肩胛上神經、背肩胛動脈、橫頸動脈淺支）
- 血管第 3 步「腋動脈第一、二段」：sta、taa、taa_p、taa_a、taa_c、taa_d（標籤：上胸動脈、胸肩峰動脈、三角肌支、胸肌支、外胸動脈）
- 血管第 6 步「橈動脈」：spbr、dpar（標籤：橈動脈、橈動脈迴返支、淺掌支、鼻煙壺、深掌弓）
- 血管第 7 步「尺動脈與骨間動脈」：iora（標籤：尺動脈、前尺側迴返動脈、總骨間動脈、前骨間動脈、後骨間動脈）
- 血管第 9 步「頭靜脈」：dvn_l（標籤：手背靜脈網、頭靜脈、胸三角、匯入腋靜脈）
- 血管第 10 步「貴要靜脈與肘正中靜脈」：dvn_m（標籤：貴要靜脈、肘正中靜脈、前臂正中靜脈、大圓肌下緣、腋靜脈）
