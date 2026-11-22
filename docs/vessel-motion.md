# 血管在關節極限位置的連續性

由 `node scripts/test-vessel-motion.mjs --write` 產生。相鄰兩段血管（含連接管）以檢視器使用的蒙皮擺姿後，重新量測間隙（間隙 = 靜止間隙 + 兩端點距離的變化）。判準：間隙小於管徑一半，或小於靜止間隙 + 1 mm。

| 姿勢 | 量測的血管對 | 例外 | 最大開口 (mm) |
| --- | ---: | ---: | ---: |
| shoulder abduction 90 | 327 | 11 | 9.5 |
| shoulder flexion 90 | 327 | 8 | 5.6 |
| elbow flexion 90 | 327 | 1 | 1.7 |
| shoulder abduction 180 (limit) | 327 | 16 | 18.1 |
| shoulder flexion 180 (limit) | 327 | 18 | 17.5 |
| elbow flexion 140 (limit) | 327 | 1 | 2.7 |
| wrist flexion 80 (limit) | 327 | 0 | 0.3 |
| wrist flexion -70 (limit) | 327 | 8 | 2.4 |
| hip flexion 90 | 325 | 11 | 43.7 |
| knee flexion 90 | 325 | 2 | 5.5 |
| hip flexion 120 + knee 130 (limit) | 325 | 17 | 57.9 |
| hip extension -20 (limit) | 325 | 7 | 10.4 |
| ankle dorsiflexion 20 (limit) | 325 | 0 | 0 |
| ankle plantar flexion -30 (limit) | 325 | 0 | 1.7 |
| hip abduction 35 (limit) | 325 | 7 | 5.8 |
| hip rotation 20 (limit) | 325 | 8 | 8.7 |

連接管背端與所屬血管分離超過 2 mm 的組合：8 個。

## shoulder abduction 90（11 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Acromial branch of right thoraco-acromial artery (FJ2263) → Trunk of right thoraco-acromial artery (FJ2304) | right | 17.94 | 24 | 2.53 |  |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Trunk of left thoraco-acromial artery (FJ2252) | left | 19.34 | 22.8 | 2.75 |  |
| Pectoral branch of right thoraco-acromial artery (FJ2361) → Trunk of right thoraco-acromial artery (FJ2304) | right | 16.38 | 18.4 | 2.84 |  |
| Right subscapular vein (FJ2299) → Right thoracodorsal vein (FJ2306) | right | 0 | 9.5 | 3.01 | 下一段在trunk |
| Right subscapular artery (FJ2298) → Right thoracodorsal artery (FJ2305) | right | 0 | 7.6 | 3.98 | 下一段在trunk |
| Right dorsal scapular artery (FJ2284) → Right transverse cervical artery (FJ2309) | right | 0 | 6.1 | 1.57 | 未綁定：the next segment；下一段在trunk |
| Left dorsal scapular artery (FJ2232) → Left transverse cervical artery (FJ2257) | left | 0 | 5.8 | 1.44 | 未綁定：the next segment；下一段在trunk |
| Left posterior circumflex humeral vein (PK-52) → Left axillary vein (FJ2217) | left | 0 | 4.1 | 3.73 |  |
| Left axillary vein (FJ2217) → Left subclavian vein (FJ3486) | left | 1.66 | 2.9 | 3.47 | 下一段在trunk |
| Right lateral brachial vein (PK-56) → Right axillary vein (FJ2269) | right | 0 | 2.6 | 3.85 |  |
| Right posterior circumflex humeral artery (FJ2291) → Right axillary artery (FJ2268) | right | 0 | 2.3 | 2.07 |  |

## shoulder flexion 90（8 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Acromial branch of right thoraco-acromial artery (FJ2263) → Trunk of right thoraco-acromial artery (FJ2304) | right | 17.94 | 23.4 | 2.53 |  |
| Right dorsal scapular artery (FJ2284) → Right transverse cervical artery (FJ2309) | right | 0 | 5.6 | 1.57 | 未綁定：the next segment；下一段在trunk |
| Left dorsal scapular artery (FJ2232) → Left transverse cervical artery (FJ2257) | left | 0 | 5.4 | 1.44 | 未綁定：the next segment；下一段在trunk |
| Right lateral brachial vein (PK-56) → Right axillary vein (FJ2269) | right | 0 | 5.2 | 3.85 |  |
| Right axillary artery (FJ2268) → Right anterior circumflex humeral artery (FJ2264) | right | 0 | 4.2 | 4.71 |  |
| Left axillary vein (FJ2217) → Left subclavian vein (FJ3486) | left | 1.66 | 2.8 | 3.47 | 下一段在trunk |
| Right basilic vein (FJ2270) → Right axillary vein (FJ2269) | right | 0 | 2 | 3.89 |  |
| Left posterior circumflex humeral artery (FJ2240) → Left posterior circumflex humeral artery (FJ2239) | left | 0 | 1.8 | 1.87 |  |

## elbow flexion 90（1 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Left median cubital vein (FJ2235) → Left basilic vein (FJ2218) | left | 0 | 1.7 | 2.71 |  |

## shoulder abduction 180 (limit)（16 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Acromial branch of right thoraco-acromial artery (FJ2263) → Trunk of right thoraco-acromial artery (FJ2304) | right | 17.94 | 32.2 | 2.53 |  |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Trunk of left thoraco-acromial artery (FJ2252) | left | 19.34 | 25.5 | 2.75 |  |
| Pectoral branch of right thoraco-acromial artery (FJ2361) → Trunk of right thoraco-acromial artery (FJ2304) | right | 16.38 | 19.8 | 2.84 |  |
| Right subscapular vein (FJ2299) → Right thoracodorsal vein (FJ2306) | right | 0 | 18.1 | 3.01 | 下一段在trunk |
| Right subscapular artery (FJ2298) → Right thoracodorsal artery (FJ2305) | right | 0 | 16.5 | 3.98 | 下一段在trunk |
| Right dorsal scapular artery (FJ2284) → Right transverse cervical artery (FJ2309) | right | 0 | 10.6 | 1.57 | 未綁定：the next segment；下一段在trunk |
| Left dorsal scapular artery (FJ2232) → Left transverse cervical artery (FJ2257) | left | 0 | 10.1 | 1.44 | 未綁定：the next segment；下一段在trunk |
| Right lateral brachial vein (PK-56) → Right axillary vein (FJ2269) | right | 0 | 7.4 | 3.85 |  |
| Left posterior circumflex humeral vein (PK-52) → Left axillary vein (FJ2217) | left | 0 | 5.6 | 3.73 |  |
| Left axillary vein (FJ2217) → Left subclavian vein (FJ3486) | left | 1.66 | 4.6 | 3.47 | 下一段在trunk |
| Right posterior circumflex humeral artery (FJ2291) → Right axillary artery (FJ2268) | right | 0 | 3.7 | 2.07 |  |
| Right basilic vein (FJ2270) → Right axillary vein (FJ2269) | right | 0 | 2.9 | 3.89 |  |
| Right medial brachial vein (FJ2341) → Right axillary vein (FJ2269) | right | 0.75 | 2.2 | 2.88 |  |
| Trunk of right thoraco-acromial artery (FJ2304) → Acromial branch of right thoraco-acromial artery (FJ2263) | right | 0 | 2 | 3.22 |  |
| Left axillary vein (FJ2217) → Left basilic vein (FJ2218) | left | 0 | 1.7 | 2.59 |  |
| Deltoid branch of left thoraco-acromial artery (PKC-310) → Trunk of left thoraco-acromial artery (FJ2252) | left | 0.67 | 1.7 | 1.93 |  |

## shoulder flexion 180 (limit)（18 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Acromial branch of right thoraco-acromial artery (FJ2263) → Trunk of right thoraco-acromial artery (FJ2304) | right | 17.94 | 29.2 | 2.53 |  |
| Right axillary artery (FJ2268) → Right anterior circumflex humeral artery (FJ2264) | right | 0 | 17.5 | 4.71 |  |
| Right anterior circumflex humeral vein (FJ2265) → Right axillary vein (FJ2269) | right | 15.04 | 16.9 | 3.81 |  |
| Right subscapular artery (FJ2298) → Right thoracodorsal artery (FJ2305) | right | 0 | 16.7 | 3.98 | 下一段在trunk |
| Right lateral brachial vein (PK-56) → Right axillary vein (FJ2269) | right | 0 | 13.8 | 3.85 |  |
| Right subscapular vein (FJ2299) → Right thoracodorsal vein (FJ2306) | right | 0 | 12.5 | 3.01 | 下一段在trunk |
| Right dorsal scapular artery (FJ2284) → Right transverse cervical artery (FJ2309) | right | 0 | 8.6 | 1.57 | 未綁定：the next segment；下一段在trunk |
| Left dorsal scapular artery (FJ2232) → Left transverse cervical artery (FJ2257) | left | 0 | 8.4 | 1.44 | 未綁定：the next segment；下一段在trunk |
| Left axillary vein (FJ2217) → Left subclavian vein (FJ3486) | left | 1.66 | 4.2 | 3.47 | 下一段在trunk |
| Left posterior circumflex humeral artery (FJ2240) → Left posterior circumflex humeral artery (FJ2239) | left | 0 | 3.6 | 1.87 |  |
| Right basilic vein (FJ2270) → Right axillary vein (FJ2269) | right | 0 | 3.2 | 3.89 |  |
| Right anterior circumflex humeral artery (FJ2264) → Right axillary artery (FJ2268) | right | 0 | 2.8 | 4.6 |  |
| Left deep brachial artery (PKC-312) → Left brachial artery (FJ2219) | left | 0 | 2.3 | 3.79 |  |
| Right medial brachial vein (FJ2341) → Right axillary vein (FJ2269) | right | 0.75 | 2.1 | 2.88 |  |
| Right lateral brachial vein (PK-56) → Right axillary vein (FJ2269) | right | 0.35 | 2.1 | 3.59 |  |
| Trunk of right thoraco-acromial artery (FJ2304) → Acromial branch of right thoraco-acromial artery (FJ2263) | right | 0 | 1.7 | 3.22 |  |
| Left circumflex scapular vein (FJ2222) → Left suprascapular vein (FJ2250) | left | 0 | 1.5 | 1.74 |  |
| Left suprascapular vein (FJ2250) → Left circumflex scapular vein (FJ2222) | left | 0 | 1.5 | 1.6 |  |

## elbow flexion 140 (limit)（1 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Left median cubital vein (FJ2235) → Left basilic vein (FJ2218) | left | 0 | 2.7 | 2.71 |  |

## wrist flexion -70 (limit)（8 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Right superficial palmar arterial arch (FJ2300) → Right ulnar artery (FJ2310) | right | 13.79 | 15.8 | 2.86 |  |
| Right radial artery (FJ2294) → Right superficial palmar branch of radial artery (PK-44) | right | 4.88 | 5.9 | 1.01 |  |
| Left deep palmar venous arch (PKC-321) → Left radial vein (FJ2244) | left | 0.74 | 2.8 | 1.32 |  |
| Left palmar metacarpal vein (FJ2320) → Left radial vein (FJ2244) | left | 1.4 | 2.6 | 1.64 |  |
| Right deep palmar venous arch (PKC-320) → Right radial vein (FJ2296) | right | 0 | 2.4 | 1.39 |  |
| Left palmar metacarpal vein (FJ2320) → Left radial vein (FJ2244) | left | 0 | 1.8 | 1.23 |  |
| Left superficial palmar arterial arch (FJ2248) → Left ulnar artery (FJ2258) | left | 0 | 1.3 | 2.51 |  |
| Left radial vein (FJ2244) → Left palmar metacarpal vein (FJ2320) | left | 0 | 1.2 | 1.74 |  |

## hip flexion 90（11 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Left deep femoral vein (FJ2099) → Left superficial epigastric vein (FJ2122) | left | 1.37 | 45.1 | 4.86 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left superficial epigastric vein (FJ2122) | left | 0.65 | 39.5 | 4.35 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left external iliac vein (FJ3484) | left | 1.98 | 34.4 | 5.36 | 未綁定：the next segment；下一段在trunk |
| Set of perforating arteries (FJ2203) → Right external iliac artery (FJ3567) | right | 1.42 | 29.7 | 4.91 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left external iliac vein (FJ3484) | left | 0 | 26.4 | 5.14 | 未綁定：the next segment；下一段在trunk |
| Left lateral circumflex femoral vein (FJ2188) → Left deep femoral vein (FJ2099) | left | 25.03 | 26.4 | 4.33 |  |
| Right lateral circumflex femoral vein (FJ2201) → Right deep femoral vein (FJ2135) | right | 24.77 | 25.9 | 4.23 |  |
| Right ascending and transverse branches of lateral circumflex femoral artery (FJ2195) → Descending branch of right lateral circumflex femoral artery (FJ2057) | right | 20.07 | 21.8 | 4.12 |  |
| Right ascending and transverse branches of lateral circumflex femoral artery (FJ2195) → Descending branch of right lateral circumflex femoral artery (FJ2057) | right | 17.98 | 19.6 | 4.3 |  |
| Left femoral artery (PKC-317) → Left inferior epigastric artery (FJ3511) | left | 0 | 16 | 1.12 | 未綁定：the next segment；下一段在trunk |
| Left femoral artery (PKC-317) → Left inferior epigastric artery (FJ3511) | left | 0 | 16 | 1.12 | 未綁定：the next segment；下一段在trunk |

## knee flexion 90（2 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Left medial superior genicular artery (FJ2083) → Left anterior tibial recurrent artery (FJ2066) | left | 9.79 | 11.3 | 1.93 |  |
| Left genicular vein (FJ2124) → Left anterior tibial vein (FJ2097) | left | 0.06 | 5.6 | 1.64 |  |

## hip flexion 120 + knee 130 (limit)（17 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Left deep femoral vein (FJ2099) → Left superficial epigastric vein (FJ2122) | left | 1.37 | 59.3 | 4.86 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left superficial epigastric vein (FJ2122) | left | 0.65 | 52.3 | 4.35 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left external iliac vein (FJ3484) | left | 1.98 | 44.6 | 5.36 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left external iliac vein (FJ3484) | left | 0 | 42.7 | 5.14 | 未綁定：the next segment；下一段在trunk |
| Set of perforating arteries (FJ2203) → Right external iliac artery (FJ3567) | right | 1.42 | 38.6 | 4.91 | 未綁定：the next segment；下一段在trunk |
| Left lateral circumflex femoral vein (FJ2188) → Left deep femoral vein (FJ2099) | left | 25.03 | 26.9 | 4.33 |  |
| Right lateral circumflex femoral vein (FJ2201) → Right deep femoral vein (FJ2135) | right | 24.77 | 26.3 | 4.23 |  |
| Right ascending and transverse branches of lateral circumflex femoral artery (FJ2195) → Descending branch of right lateral circumflex femoral artery (FJ2057) | right | 24.14 | 25.6 | 3.92 |  |
| Right ascending and transverse branches of lateral circumflex femoral artery (FJ2195) → Descending branch of right lateral circumflex femoral artery (FJ2057) | right | 20.07 | 22.7 | 4.12 |  |
| Left femoral artery (PKC-317) → Left inferior epigastric artery (FJ3511) | left | 0 | 20.6 | 1.12 | 未綁定：the next segment；下一段在trunk |
| Left femoral artery (PKC-317) → Left inferior epigastric artery (FJ3511) | left | 0 | 20.6 | 1.12 | 未綁定：the next segment；下一段在trunk |
| Right ascending and transverse branches of lateral circumflex femoral artery (FJ2195) → Descending branch of right lateral circumflex femoral artery (FJ2057) | right | 17.98 | 20.6 | 4.3 |  |
| Left medial superior genicular artery (FJ2083) → Left anterior tibial recurrent artery (FJ2066) | left | 9.79 | 12 | 1.93 |  |
| Left genicular vein (FJ2124) → Left anterior tibial vein (FJ2097) | left | 0.06 | 8.4 | 1.64 |  |
| Left descending genicular artery (FJ2069) → Left anterior tibial recurrent artery (FJ2066) | left | 0 | 1.3 | 1.26 |  |
| Descending branch of right lateral circumflex femoral artery (FJ2057) → Right anterior tibial recurrent artery (FJ2131) | right | 0 | 1.2 | 2.09 |  |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2182) | right | 0 | 1.1 | 1.13 |  |

## hip extension -20 (limit)（7 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Left deep femoral vein (FJ2099) → Left external iliac vein (FJ3484) | left | 0 | 10.4 | 5.14 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left superficial epigastric vein (FJ2122) | left | 1.37 | 9.2 | 4.86 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left superficial epigastric vein (FJ2122) | left | 0.65 | 7.9 | 4.35 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left external iliac vein (FJ3484) | left | 1.98 | 6.3 | 5.36 | 未綁定：the next segment；下一段在trunk |
| Set of perforating arteries (FJ2203) → Right external iliac artery (FJ3567) | right | 1.42 | 5.2 | 4.91 | 未綁定：the next segment；下一段在trunk |
| Left femoral artery (PKC-317) → Left inferior epigastric artery (FJ3511) | left | 0 | 2.3 | 1.12 | 未綁定：the next segment；下一段在trunk |
| Left femoral artery (PKC-317) → Left inferior epigastric artery (FJ3511) | left | 0 | 2.3 | 1.12 | 未綁定：the next segment；下一段在trunk |

## hip abduction 35 (limit)（7 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Left deep femoral vein (FJ2099) → Left external iliac vein (FJ3484) | left | 0 | 5.8 | 5.14 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left superficial epigastric vein (FJ2122) | left | 1.37 | 5.4 | 4.86 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left external iliac vein (FJ3484) | left | 1.98 | 4.8 | 5.36 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left superficial epigastric vein (FJ2122) | left | 0.65 | 3.6 | 4.35 | 未綁定：the next segment；下一段在trunk |
| Left femoral artery (PKC-317) → Left inferior epigastric artery (FJ3511) | left | 0 | 3.1 | 1.12 | 未綁定：the next segment；下一段在trunk |
| Left femoral artery (PKC-317) → Left inferior epigastric artery (FJ3511) | left | 0 | 3.1 | 1.12 | 未綁定：the next segment；下一段在trunk |
| Set of perforating arteries (FJ2203) → Right external iliac artery (FJ3567) | right | 1.42 | 2.6 | 4.91 | 未綁定：the next segment；下一段在trunk |

## hip rotation 20 (limit)（8 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Right lateral circumflex femoral vein (FJ2201) → Right deep femoral vein (FJ2135) | right | 26.39 | 27.8 | 4.38 |  |
| Left lateral circumflex femoral vein (FJ2188) → Left deep femoral vein (FJ2099) | left | 24.4 | 25.6 | 4.12 |  |
| Left deep femoral vein (FJ2099) → Left superficial epigastric vein (FJ2122) | left | 1.37 | 10.1 | 4.86 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left external iliac vein (FJ3484) | left | 1.98 | 9.8 | 5.36 | 未綁定：the next segment；下一段在trunk |
| Set of perforating arteries (FJ2203) → Right external iliac artery (FJ3567) | right | 1.42 | 7.8 | 4.91 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left superficial epigastric vein (FJ2122) | left | 0.65 | 5.2 | 4.35 | 未綁定：the next segment；下一段在trunk |
| Left femoral artery (PKC-317) → Left inferior epigastric artery (FJ3511) | left | 0 | 2.5 | 1.12 | 未綁定：the next segment；下一段在trunk |
| Left femoral artery (PKC-317) → Left inferior epigastric artery (FJ3511) | left | 0 | 2.5 | 1.12 | 未綁定：the next segment；下一段在trunk |
