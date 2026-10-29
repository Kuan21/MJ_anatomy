# 血管在關節極限位置的連續性

由 `node scripts/test-vessel-motion.mjs --write` 產生。相鄰兩段血管（含連接管）以檢視器使用的蒙皮擺姿後，重新量測間隙（間隙 = 靜止間隙 + 兩端點距離的變化）。判準：間隙小於管徑一半，或小於靜止間隙 + 1 mm。

| 姿勢 | 量測的血管對 | 例外 | 最大開口 (mm) |
| --- | ---: | ---: | ---: |
| shoulder abduction 90 | 470 | 39 | 95.8 |
| shoulder flexion 90 | 470 | 38 | 122.5 |
| elbow flexion 90 | 470 | 8 | 5.4 |
| shoulder abduction 180 (limit) | 470 | 44 | 205.6 |
| shoulder flexion 180 (limit) | 470 | 49 | 218.5 |
| elbow flexion 140 (limit) | 470 | 12 | 8.9 |
| wrist flexion 80 (limit) | 470 | 0 | 0.2 |
| wrist flexion -70 (limit) | 470 | 12 | 6.1 |
| hip flexion 90 | 481 | 48 | 1231.7 |
| knee flexion 90 | 481 | 24 | 617.4 |
| hip flexion 120 + knee 130 (limit) | 481 | 75 | 720.8 |
| hip extension -20 (limit) | 481 | 29 | 301.9 |
| ankle dorsiflexion 20 (limit) | 481 | 4 | 43 |
| ankle plantar flexion -30 (limit) | 481 | 3 | 63.9 |
| hip abduction 35 (limit) | 481 | 28 | 520.1 |
| hip rotation 20 (limit) | 481 | 35 | 41.6 |

連接管背端與所屬血管分離超過 2 mm 的組合：13 個。

## shoulder abduction 90（39 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Pectoral branch of right thoraco-acromial artery (FJ2361) → Right lateral thoracic artery (FJ1938) | right | 9.62 | 100.3 | 1.24 | 下一段在trunk |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral thoracic artery (FJ1976) | left | 9.93 | 99.5 | 1.23 | 下一段在trunk |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral thoracic artery (FJ1976) | left | 0 | 95.8 | 1.19 | 下一段在trunk |
| Right dorsal scapular artery (FJ2284) → Posterior intercostal arteries (FJ1961) | right | 15.12 | 71.6 | 1.34 | 未綁定：the next segment；下一段在trunk |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral mammary artery (PK-8) | left | 6.92 | 70.6 | 1.49 | 下一段在trunk |
| Left suprascapular vein (FJ2250) → Left posterior segmental vein (FJ2929) | left | 20.5 | 66.6 | 1.71 | 未綁定：the next segment；下一段在trunk |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral mammary artery (PK-8) | left | 9.16 | 65.6 | 2.14 | 下一段在trunk |
| Left suprascapular artery (FJ2251) → Left second posterior intercostal artery (FJ1974) | left | 19.86 | 57.1 | 1.32 | 未綁定：the next segment；下一段在trunk |
| Left dorsal scapular artery (FJ2232) → Posterior intercostal arteries (FJ1975) | left | 26.95 | 49.7 | 2 | 未綁定：the next segment；下一段在trunk |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left second posterior intercostal artery (FJ1974) | left | 5.94 | 38.4 | 1.48 | 未綁定：the next segment；下一段在trunk |
| Left cephalic vein (FJ2220) → Left anterior circumflex humeral vein (FJ2213) | left | 29.09 | 34.8 | 3.39 |  |
| Left dorsal scapular artery (FJ2232) → Posterior intercostal arteries (FJ1975) | left | 15.03 | 32.8 | 1.12 | 未綁定：the next segment；下一段在trunk |
| Trunk of left thoraco-acromial artery (FJ2252) → Left second posterior intercostal artery (FJ1974) | left | 0 | 28.3 | 3.46 | 未綁定：the next segment；下一段在trunk |
| Right cephalic vein (FJ2272) → Right axillary vein (FJ2269) | right | 24.64 | 26.2 | 3.41 |  |
| Right suprascapular vein (FJ2302) → Right circumflex scapular vein (FJ2274) | right | 17.45 | 22.9 | 1.78 |  |
| Left cephalic vein (FJ2220) → Left lateral thoracic vein (FJ2233) | left | 18.8 | 20.6 | 4.22 | 下一段在trunk |
| Pectoral branch of right thoraco-acromial artery (FJ2361) → Right lateral mammary artery (PK-3) | right | 5.95 | 20.1 | 1.36 | 下一段在trunk |
| Right axillary artery (FJ2268) → Right supreme intercostal artery (PK-120) | right | 0 | 17.2 | 3.56 | 未綁定：the next segment；下一段在trunk |
| Left cephalic vein (FJ2220) → Left anterior circumflex humeral vein (FJ2213) | left | 15.57 | 16.7 | 5.03 |  |
| Left suprascapular vein (FJ2250) → Left subclavian vein (FJ3486) | left | 13.62 | 15.5 | 1.76 | 下一段在trunk |
| Left axillary vein (FJ2217) → Left apical segmental vein (FJ2963) | left | 0 | 12.9 | 4.56 | 未綁定：the next segment；下一段在trunk |
| Right anterior circumflex humeral vein (FJ2265) → Right lateral brachial vein (PK-56) | right | 0.51 | 10.9 | 4.55 |  |
| Right axillary vein (FJ2269) → Anterior part of right apical segmental vein (FJ3053) | right | 0.18 | 10.1 | 4.71 | 未綁定：the next segment；下一段在trunk |
| Right subscapular vein (FJ2299) → Right thoracodorsal vein (FJ2306) | right | 0 | 9.3 | 3.01 | 下一段在trunk |
| Right subscapular artery (FJ2298) → Right thoracodorsal artery (FJ2305) | right | 0 | 7.6 | 3.98 | 下一段在trunk |
| Left axillary artery (FJ2216) → Left first posterior intercostal artery (FJ1973) | left | 0 | 6.6 | 5.37 | 未綁定：the next segment；下一段在trunk |
| Right anterior circumflex humeral artery (FJ2264) → Right posterior circumflex humeral artery (FJ2291) | right | 2.51 | 6.5 | 5.16 |  |
| Left deep brachial artery (PKC-315) → Left brachial artery (FJ2219) | left | 0.78 | 6.3 | 3.98 |  |
| Right dorsal scapular artery (FJ2284) → Right transverse cervical artery (FJ2309) | right | 0 | 6.1 | 1.57 | 未綁定：the next segment；下一段在trunk |
| Left dorsal scapular artery (FJ2232) → Left transverse cervical artery (FJ2257) | left | 0 | 5.8 | 1.44 | 未綁定：the next segment；下一段在trunk |
| Right anterior circumflex humeral artery (FJ2264) → Right posterior circumflex humeral artery (FJ2291) | right | 0.31 | 5 | 5.34 |  |
| Left posterior circumflex humeral vein (PK-52) → Left axillary vein (FJ2217) | left | 0 | 4.1 | 3.73 |  |
| Left brachial artery (FJ2219) → Left subscapular artery (FJ2246) | left | 0 | 4 | 5.36 |  |
| Left lateral brachial vein (PK-60) → Left basilic vein (FJ2218) | left | 0 | 3.1 | 4.13 |  |
| Left axillary vein (FJ2217) → Left subclavian vein (FJ3486) | left | 1.66 | 2.9 | 3.47 | 下一段在trunk |
| Right lateral brachial vein (PK-56) → Right axillary vein (FJ2269) | right | 0 | 2.6 | 3.85 |  |
| Acromial branch of left thoraco-acromial artery (FJ2211) → Trunk of left thoraco-acromial artery (FJ2252) | left | 0.95 | 2.5 | 3.14 |  |
| Right posterior circumflex humeral artery (FJ2291) → Right axillary artery (FJ2268) | right | 0 | 2.3 | 2.07 |  |
| Deltoid branch of left thoraco-acromial artery (PKC-313) → Left axillary artery (FJ2216) | left | 0 | 2.2 | 2.07 |  |

## shoulder flexion 90（38 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Pectoral branch of right thoraco-acromial artery (FJ2361) → Right lateral thoracic artery (FJ1938) | right | 9.62 | 132.1 | 1.24 | 下一段在trunk |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral thoracic artery (FJ1976) | left | 9.93 | 130.9 | 1.23 | 下一段在trunk |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral thoracic artery (FJ1976) | left | 0 | 121.9 | 1.19 | 下一段在trunk |
| Right dorsal scapular artery (FJ2284) → Posterior intercostal arteries (FJ1961) | right | 15.12 | 65.5 | 1.34 | 未綁定：the next segment；下一段在trunk |
| Left suprascapular vein (FJ2250) → Left posterior segmental vein (FJ2929) | left | 20.5 | 62.9 | 1.71 | 未綁定：the next segment；下一段在trunk |
| Left suprascapular artery (FJ2251) → Left second posterior intercostal artery (FJ1974) | left | 19.86 | 54.1 | 1.32 | 未綁定：the next segment；下一段在trunk |
| Left dorsal scapular artery (FJ2232) → Posterior intercostal arteries (FJ1975) | left | 26.95 | 46.7 | 2 | 未綁定：the next segment；下一段在trunk |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left second posterior intercostal artery (FJ1974) | left | 5.94 | 41.2 | 1.48 | 未綁定：the next segment；下一段在trunk |
| Left dorsal scapular artery (FJ2232) → Posterior intercostal arteries (FJ1975) | left | 15.03 | 28.5 | 1.12 | 未綁定：the next segment；下一段在trunk |
| Left cephalic vein (FJ2220) → Left lateral thoracic vein (FJ2233) | left | 18.8 | 27 | 4.22 | 下一段在trunk |
| Right cephalic vein (FJ2272) → Right axillary vein (FJ2269) | right | 24.64 | 26.4 | 3.41 |  |
| Left anterior circumflex humeral vein (FJ2213) → Left cephalic vein (FJ2220) | left | 23.5 | 25.1 | 2.26 |  |
| Right suprascapular vein (FJ2302) → Right circumflex scapular vein (FJ2274) | right | 17.45 | 25.1 | 1.78 |  |
| Trunk of left thoraco-acromial artery (FJ2252) → Left second posterior intercostal artery (FJ1974) | left | 0 | 24.4 | 3.46 | 未綁定：the next segment；下一段在trunk |
| Right anterior circumflex humeral vein (FJ2265) → Right posterior circumflex humeral vein (PK-42) | right | 21.56 | 22.8 | 1.6 |  |
| Pectoral branch of right thoraco-acromial artery (FJ2361) → Right lateral mammary artery (PK-3) | right | 5.95 | 21.7 | 1.36 | 下一段在trunk |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral mammary artery (PK-8) | left | 6.92 | 15.8 | 1.49 | 下一段在trunk |
| Right axillary artery (FJ2268) → Right supreme intercostal artery (PK-120) | right | 0 | 15.7 | 3.56 | 未綁定：the next segment；下一段在trunk |
| Left suprascapular vein (FJ2250) → Left subclavian vein (FJ3486) | left | 13.62 | 15.5 | 1.76 | 下一段在trunk |
| Right anterior circumflex humeral artery (FJ2264) → Right posterior circumflex humeral artery (FJ2291) | right | 2.51 | 14.1 | 5.16 |  |
| Right anterior circumflex humeral artery (FJ2264) → Right posterior circumflex humeral artery (FJ2291) | right | 0.31 | 13.9 | 5.34 |  |
| Right anterior circumflex humeral vein (FJ2265) → Right lateral brachial vein (PK-56) | right | 0.51 | 13.3 | 4.55 |  |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral mammary artery (PK-8) | left | 9.16 | 12 | 2.14 | 下一段在trunk |
| Left axillary vein (FJ2217) → Left apical segmental vein (FJ2963) | left | 0 | 11.3 | 4.56 | 未綁定：the next segment；下一段在trunk |
| Right axillary vein (FJ2269) → Anterior part of right apical segmental vein (FJ3053) | right | 0.18 | 9.5 | 4.71 | 未綁定：the next segment；下一段在trunk |
| Right posterior circumflex humeral vein (PK-42) → Right anterior circumflex humeral vein (FJ2265) | right | 7.22 | 8.9 | 2.47 |  |
| Right dorsal scapular artery (FJ2284) → Right transverse cervical artery (FJ2309) | right | 0 | 5.6 | 1.57 | 未綁定：the next segment；下一段在trunk |
| Left dorsal scapular artery (FJ2232) → Left transverse cervical artery (FJ2257) | left | 0 | 5.4 | 1.44 | 未綁定：the next segment；下一段在trunk |
| Right lateral brachial vein (PK-56) → Right axillary vein (FJ2269) | right | 0 | 5.2 | 3.85 |  |
| Right brachial artery (FJ2271) → Right thoracodorsal artery (FJ2305) | right | 0 | 5 | 5.43 | 下一段在trunk |
| Left deep brachial artery (PKC-315) → Left brachial artery (FJ2219) | left | 0.78 | 4.9 | 3.98 |  |
| Left axillary artery (FJ2216) → Left first posterior intercostal artery (FJ1973) | left | 0 | 4.8 | 5.37 | 未綁定：the next segment；下一段在trunk |
| Left lateral brachial vein (PK-60) → Left basilic vein (FJ2218) | left | 0 | 4.8 | 4.13 |  |
| Right axillary artery (FJ2268) → Right anterior circumflex humeral artery (FJ2264) | right | 0 | 4.6 | 4.71 |  |
| Left axillary vein (FJ2217) → Left subclavian vein (FJ3486) | left | 1.66 | 2.8 | 3.47 | 下一段在trunk |
| Acromial branch of left thoraco-acromial artery (FJ2211) → Trunk of left thoraco-acromial artery (FJ2252) | left | 0.95 | 2.6 | 3.14 |  |
| Left posterior circumflex humeral artery (FJ2240) → Left posterior circumflex humeral artery (FJ2239) | left | 0 | 1.8 | 1.87 |  |
| Deltoid branch of left thoraco-acromial artery (PKC-313) → Left axillary artery (FJ2216) | left | 0 | 1.8 | 2.07 |  |

## elbow flexion 90（8 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Right recurrent interosseous artery (FJ2297) → Right radial recurrent artery (FJ2295) | right | 18.64 | 20.7 | 2.68 |  |
| Right superior ulnar collateral artery (FJ2373) → Right posterior ulnar recurrent artery (FJ2293) | right | 12.99 | 18.4 | 1.44 |  |
| Middle collateral branch of left deep brachial artery (FJ2331) → Left recurrent interosseous artery (FJ2245) | left | 0 | 4.9 | 1.23 |  |
| Middle collateral branch of left deep brachial artery (FJ2331) → Left recurrent interosseous artery (FJ2245) | left | 0 | 4.9 | 1.23 |  |
| Radial collateral branch of right deep brachial artery (FJ2262) → Right radial recurrent artery (FJ2295) | right | 0 | 3.8 | 2.52 |  |
| Right radial vein (FJ2296) → Right ulnar vein (FJ2312) | right | 1.35 | 3 | 4.05 |  |
| Left posterior interosseous vein (PK-62) → Left radial vein (FJ2244) | left | 0 | 2.2 | 2.41 |  |
| Left median cubital vein (FJ2235) → Left basilic vein (FJ2218) | left | 0 | 1.7 | 2.71 |  |

## shoulder abduction 180 (limit)（44 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Pectoral branch of right thoraco-acromial artery (FJ2361) → Right lateral thoracic artery (FJ1938) | right | 9.62 | 215.2 | 1.24 | 下一段在trunk |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral thoracic artery (FJ1976) | left | 9.93 | 213 | 1.23 | 下一段在trunk |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral thoracic artery (FJ1976) | left | 0 | 193.8 | 1.19 | 下一段在trunk |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral mammary artery (PK-8) | left | 6.92 | 180.5 | 1.49 | 下一段在trunk |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral mammary artery (PK-8) | left | 9.16 | 178.8 | 2.14 | 下一段在trunk |
| Right dorsal scapular artery (FJ2284) → Posterior intercostal arteries (FJ1961) | right | 15.12 | 107.7 | 1.34 | 未綁定：the next segment；下一段在trunk |
| Left suprascapular vein (FJ2250) → Left posterior segmental vein (FJ2929) | left | 20.5 | 100.5 | 1.71 | 未綁定：the next segment；下一段在trunk |
| Left suprascapular artery (FJ2251) → Left second posterior intercostal artery (FJ1974) | left | 19.86 | 90.4 | 1.32 | 未綁定：the next segment；下一段在trunk |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left second posterior intercostal artery (FJ1974) | left | 5.94 | 64.4 | 1.48 | 未綁定：the next segment；下一段在trunk |
| Left dorsal scapular artery (FJ2232) → Posterior intercostal arteries (FJ1975) | left | 26.95 | 62.5 | 2 | 未綁定：the next segment；下一段在trunk |
| Trunk of left thoraco-acromial artery (FJ2252) → Left second posterior intercostal artery (FJ1974) | left | 0 | 48.2 | 3.46 | 未綁定：the next segment；下一段在trunk |
| Pectoral branch of right thoraco-acromial artery (FJ2361) → Right lateral mammary artery (PK-3) | right | 5.95 | 46.7 | 1.36 | 下一段在trunk |
| Left dorsal scapular artery (FJ2232) → Posterior intercostal arteries (FJ1975) | left | 15.03 | 45.9 | 1.12 | 未綁定：the next segment；下一段在trunk |
| Left cephalic vein (FJ2220) → Left anterior circumflex humeral vein (FJ2213) | left | 29.09 | 41.4 | 3.39 |  |
| Right axillary artery (FJ2268) → Right supreme intercostal artery (PK-120) | right | 0 | 31.4 | 3.56 | 未綁定：the next segment；下一段在trunk |
| Right suprascapular vein (FJ2302) → Right circumflex scapular vein (FJ2274) | right | 17.45 | 29.4 | 1.78 |  |
| Right cephalic vein (FJ2272) → Right axillary vein (FJ2269) | right | 24.64 | 28 | 3.41 |  |
| Left anterior circumflex humeral vein (FJ2213) → Left cephalic vein (FJ2220) | left | 23.5 | 24.9 | 2.26 |  |
| Right anterior circumflex humeral vein (FJ2265) → Right lateral brachial vein (PK-56) | right | 0.51 | 24.8 | 4.55 |  |
| Left cephalic vein (FJ2220) → Left lateral thoracic vein (FJ2233) | left | 18.8 | 23.3 | 4.22 | 下一段在trunk |
| Left axillary vein (FJ2217) → Left apical segmental vein (FJ2963) | left | 0 | 21.5 | 4.56 | 未綁定：the next segment；下一段在trunk |
| Right axillary vein (FJ2269) → Anterior part of right apical segmental vein (FJ3053) | right | 0.18 | 19.2 | 4.71 | 未綁定：the next segment；下一段在trunk |
| Left suprascapular vein (FJ2250) → Left subclavian vein (FJ3486) | left | 13.62 | 17.9 | 1.76 | 下一段在trunk |
| Right subscapular vein (FJ2299) → Right thoracodorsal vein (FJ2306) | right | 0 | 17.7 | 3.01 | 下一段在trunk |
| Left cephalic vein (FJ2220) → Left anterior circumflex humeral vein (FJ2213) | left | 15.57 | 16.9 | 5.03 |  |
| Right subscapular artery (FJ2298) → Right thoracodorsal artery (FJ2305) | right | 0 | 16.5 | 3.98 | 下一段在trunk |
| Right anterior circumflex humeral artery (FJ2264) → Right posterior circumflex humeral artery (FJ2291) | right | 2.51 | 13.3 | 5.16 |  |
| Right anterior circumflex humeral artery (FJ2264) → Right posterior circumflex humeral artery (FJ2291) | right | 0.31 | 13.1 | 5.34 |  |
| Left axillary artery (FJ2216) → Left first posterior intercostal artery (FJ1973) | left | 0 | 12.7 | 5.37 | 未綁定：the next segment；下一段在trunk |
| Left deep brachial artery (PKC-315) → Left brachial artery (FJ2219) | left | 0.78 | 12.5 | 3.98 |  |
| Right dorsal scapular artery (FJ2284) → Right transverse cervical artery (FJ2309) | right | 0 | 10.6 | 1.57 | 未綁定：the next segment；下一段在trunk |
| Left dorsal scapular artery (FJ2232) → Left transverse cervical artery (FJ2257) | left | 0 | 10.1 | 1.44 | 未綁定：the next segment；下一段在trunk |
| Left brachial artery (FJ2219) → Left subscapular artery (FJ2246) | left | 0 | 8.1 | 5.36 |  |
| Right lateral brachial vein (PK-56) → Right axillary vein (FJ2269) | right | 0 | 7.4 | 3.85 |  |
| Left lateral brachial vein (PK-60) → Left basilic vein (FJ2218) | left | 0 | 7.1 | 4.13 |  |
| Acromial branch of left thoraco-acromial artery (FJ2211) → Trunk of left thoraco-acromial artery (FJ2252) | left | 0.95 | 5.7 | 3.14 |  |
| Left posterior circumflex humeral vein (PK-52) → Left axillary vein (FJ2217) | left | 0 | 5.6 | 3.73 |  |
| Deltoid branch of left thoraco-acromial artery (PKC-313) → Left axillary artery (FJ2216) | left | 0 | 5.4 | 2.07 |  |
| Left axillary vein (FJ2217) → Left subclavian vein (FJ3486) | left | 1.66 | 4.6 | 3.47 | 下一段在trunk |
| Right posterior circumflex humeral artery (FJ2291) → Right axillary artery (FJ2268) | right | 0 | 3.8 | 2.07 |  |
| Trunk of right thoraco-acromial artery (FJ2304) → Right subclavian artery (FJ3579) | right | 0 | 2.2 | 3.46 | 下一段在trunk |
| Trunk of right thoraco-acromial artery (FJ2304) → Acromial branch of right thoraco-acromial artery (FJ2263) | right | 0 | 2 | 3.22 |  |
| Left axillary vein (FJ2217) → Left basilic vein (FJ2218) | left | 0 | 1.7 | 2.59 |  |
| Deltoid branch of left thoraco-acromial artery (PKC-313) → Trunk of left thoraco-acromial artery (FJ2252) | left | 0 | 1 | 1.92 |  |

## shoulder flexion 180 (limit)（49 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Pectoral branch of right thoraco-acromial artery (FJ2361) → Right lateral thoracic artery (FJ1938) | right | 9.62 | 228.2 | 1.24 | 下一段在trunk |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral thoracic artery (FJ1976) | left | 9.93 | 225.8 | 1.23 | 下一段在trunk |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral thoracic artery (FJ1976) | left | 0 | 202.9 | 1.19 | 下一段在trunk |
| Right dorsal scapular artery (FJ2284) → Posterior intercostal arteries (FJ1961) | right | 15.12 | 106.3 | 1.34 | 未綁定：the next segment；下一段在trunk |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral mammary artery (PK-8) | left | 9.16 | 96.8 | 2.14 | 下一段在trunk |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral mammary artery (PK-8) | left | 6.92 | 96.1 | 1.49 | 下一段在trunk |
| Left suprascapular vein (FJ2250) → Left posterior segmental vein (FJ2929) | left | 20.5 | 86.1 | 1.71 | 未綁定：the next segment；下一段在trunk |
| Left suprascapular artery (FJ2251) → Left second posterior intercostal artery (FJ1974) | left | 19.86 | 78.9 | 1.32 | 未綁定：the next segment；下一段在trunk |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left second posterior intercostal artery (FJ1974) | left | 5.94 | 56.3 | 1.48 | 未綁定：the next segment；下一段在trunk |
| Left dorsal scapular artery (FJ2232) → Posterior intercostal arteries (FJ1975) | left | 26.95 | 53.2 | 2 | 未綁定：the next segment；下一段在trunk |
| Pectoral branch of right thoraco-acromial artery (FJ2361) → Right lateral mammary artery (PK-3) | right | 5.95 | 50 | 1.36 | 下一段在trunk |
| Left dorsal scapular artery (FJ2232) → Posterior intercostal arteries (FJ1975) | left | 15.03 | 41.2 | 1.12 | 未綁定：the next segment；下一段在trunk |
| Left cephalic vein (FJ2220) → Left anterior circumflex humeral vein (FJ2213) | left | 29.09 | 38.6 | 3.39 |  |
| Right anterior circumflex humeral vein (FJ2265) → Right lateral brachial vein (PK-56) | right | 0.51 | 36.4 | 4.55 |  |
| Right suprascapular vein (FJ2302) → Right circumflex scapular vein (FJ2274) | right | 17.45 | 34.2 | 1.78 |  |
| Trunk of left thoraco-acromial artery (FJ2252) → Left second posterior intercostal artery (FJ1974) | left | 0 | 32.4 | 3.46 | 未綁定：the next segment；下一段在trunk |
| Left cephalic vein (FJ2220) → Left lateral thoracic vein (FJ2233) | left | 18.8 | 30.9 | 4.22 | 下一段在trunk |
| Right anterior circumflex humeral artery (FJ2264) → Right posterior circumflex humeral artery (FJ2291) | right | 0.31 | 29.6 | 5.34 |  |
| Right cephalic vein (FJ2272) → Right axillary vein (FJ2269) | right | 24.64 | 28.3 | 3.41 |  |
| Right anterior circumflex humeral artery (FJ2264) → Right posterior circumflex humeral artery (FJ2291) | right | 2.51 | 28 | 5.16 |  |
| Right anterior circumflex humeral vein (FJ2265) → Right posterior circumflex humeral vein (PK-42) | right | 21.56 | 27.7 | 1.6 |  |
| Right axillary artery (FJ2268) → Right supreme intercostal artery (PK-120) | right | 0 | 25.9 | 3.56 | 未綁定：the next segment；下一段在trunk |
| Left anterior circumflex humeral vein (FJ2213) → Left cephalic vein (FJ2220) | left | 23.5 | 25.5 | 2.26 |  |
| Right axillary artery (FJ2268) → Right anterior circumflex humeral artery (FJ2264) | right | 0 | 18.5 | 4.71 |  |
| Left suprascapular vein (FJ2250) → Left subclavian vein (FJ3486) | left | 13.62 | 17.3 | 1.76 | 下一段在trunk |
| Right subscapular artery (FJ2298) → Right thoracodorsal artery (FJ2305) | right | 0 | 16.7 | 3.98 | 下一段在trunk |
| Right axillary vein (FJ2269) → Anterior part of right apical segmental vein (FJ3053) | right | 0.18 | 15.8 | 4.71 | 未綁定：the next segment；下一段在trunk |
| Right brachial artery (FJ2271) → Right thoracodorsal artery (FJ2305) | right | 0 | 15.3 | 5.43 | 下一段在trunk |
| Left axillary vein (FJ2217) → Left apical segmental vein (FJ2963) | left | 0 | 14.1 | 4.56 | 未綁定：the next segment；下一段在trunk |
| Right lateral brachial vein (PK-56) → Right axillary vein (FJ2269) | right | 0 | 13.8 | 3.85 |  |
| Right subscapular vein (FJ2299) → Right thoracodorsal vein (FJ2306) | right | 0 | 12.1 | 3.01 | 下一段在trunk |
| Right posterior circumflex humeral vein (PK-42) → Right anterior circumflex humeral vein (FJ2265) | right | 7.22 | 11.8 | 2.47 |  |
| Left deep brachial artery (PKC-315) → Left brachial artery (FJ2219) | left | 0.78 | 10.9 | 3.98 |  |
| Left lateral brachial vein (PK-60) → Left basilic vein (FJ2218) | left | 0 | 8.8 | 4.13 |  |
| Right dorsal scapular artery (FJ2284) → Right transverse cervical artery (FJ2309) | right | 0 | 8.6 | 1.57 | 未綁定：the next segment；下一段在trunk |
| Left dorsal scapular artery (FJ2232) → Left transverse cervical artery (FJ2257) | left | 0 | 8.4 | 1.44 | 未綁定：the next segment；下一段在trunk |
| Acromial branch of left thoraco-acromial artery (FJ2211) → Trunk of left thoraco-acromial artery (FJ2252) | left | 0.95 | 4.8 | 3.14 |  |
| Left axillary artery (FJ2216) → Left first posterior intercostal artery (FJ1973) | left | 0 | 4.8 | 5.37 | 未綁定：the next segment；下一段在trunk |
| Deltoid branch of left thoraco-acromial artery (PKC-313) → Left axillary artery (FJ2216) | left | 0 | 4.3 | 2.07 |  |
| Left axillary vein (FJ2217) → Left subclavian vein (FJ3486) | left | 1.66 | 4.2 | 3.47 | 下一段在trunk |
| Left posterior circumflex humeral artery (FJ2240) → Left posterior circumflex humeral artery (FJ2239) | left | 0 | 3.6 | 1.87 |  |
| Right anterior circumflex humeral artery (FJ2264) → Right axillary artery (FJ2268) | right | 0 | 2.8 | 4.6 |  |
| Right anterior circumflex humeral artery (FJ2264) → Right posterior circumflex humeral artery (FJ2291) | right | 0 | 1.9 | 0.8 |  |
| Trunk of right thoraco-acromial artery (FJ2304) → Acromial branch of right thoraco-acromial artery (FJ2263) | right | 0 | 1.7 | 3.22 |  |
| Left circumflex scapular vein (FJ2222) → Left suprascapular vein (FJ2250) | left | 0 | 1.5 | 1.74 |  |
| Left suprascapular vein (FJ2250) → Left circumflex scapular vein (FJ2222) | left | 0 | 1.5 | 1.6 |  |
| Left posterior circumflex humeral artery (FJ2240) → Left anterior circumflex humeral artery (FJ2212) | left | 0 | 1.4 | 1.19 |  |
| Left circumflex scapular artery (FJ2221) → Left axillary artery (FJ2216) | left | 0 | 1.2 | 2.08 |  |
| Left posterior circumflex humeral artery (FJ2239) → Left posterior circumflex humeral artery (FJ2240) | left | 0 | 1.2 | 2.07 |  |

## elbow flexion 140 (limit)（12 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Right recurrent interosseous artery (FJ2297) → Right radial recurrent artery (FJ2295) | right | 18.64 | 22.5 | 2.68 |  |
| Right superior ulnar collateral artery (FJ2373) → Right posterior ulnar recurrent artery (FJ2293) | right | 12.99 | 21.9 | 1.44 |  |
| Middle collateral branch of left deep brachial artery (FJ2331) → Left recurrent interosseous artery (FJ2245) | left | 0 | 8.2 | 1.23 |  |
| Middle collateral branch of left deep brachial artery (FJ2331) → Left recurrent interosseous artery (FJ2245) | left | 0 | 8.2 | 1.23 |  |
| Radial collateral branch of right deep brachial artery (FJ2262) → Right radial recurrent artery (FJ2295) | right | 0 | 5.8 | 2.52 |  |
| Right radial vein (FJ2296) → Right ulnar vein (FJ2312) | right | 1.35 | 4.6 | 4.05 |  |
| Left posterior interosseous vein (PK-62) → Left radial vein (FJ2244) | left | 0 | 4 | 2.41 |  |
| Left median cubital vein (FJ2235) → Left basilic vein (FJ2218) | left | 0 | 2.7 | 2.71 |  |
| Right radial vein (FJ2296) → Right lateral brachial vein (PK-56) | right | 1.19 | 2.3 | 4.01 |  |
| Right posterior interosseous vein (PK-58) → Right radial vein (FJ2296) | right | 0 | 1.5 | 2.06 |  |
| Middle collateral branch of right deep brachial artery (FJ2362) → Right recurrent interosseous artery (FJ2297) | right | 0 | 1.4 | 2.43 |  |
| Left recurrent interosseous artery (FJ2245) → Middle collateral branch of left deep brachial artery (FJ2331) | left | 0 | 1.1 | 0.84 |  |

## wrist flexion -70 (limit)（12 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Right ulnar artery (FJ2310) → Right dorsal carpal branch of ulnar artery (FJ2288) | right | 20.96 | 27.1 | 2.22 |  |
| Left radial artery (FJ2242) → Left superficial palmar arterial arch (FJ2248) | left | 17.91 | 19.7 | 1.6 |  |
| Left superficial palmar venous arch (FJ2249) → Left deep palmar venous arch (FJ2229) | left | 12.94 | 14.5 | 1.67 |  |
| Right superficial palmar arterial arch (FJ2300) → Right deep palmar branch of ulnar artery (PK-45) | right | 1.29 | 2.8 | 2.86 |  |
| Left palmar metacarpal artery (FJ2237) → Left superficial palmar arterial arch (FJ2248) | left | 0 | 2.4 | 1.44 |  |
| Right deep palmar arch (FJ2279) → Right superficial palmar arterial arch (FJ2300) | right | 0 | 2.4 | 2.74 |  |
| Right deep palmar venous arch (PKC-323) → Right radial vein (FJ2296) | right | 0 | 2.4 | 1.37 |  |
| Left deep palmar venous arch (PKC-324) → Left radial vein (FJ2244) | left | 0.07 | 2.2 | 1.33 |  |
| Right palmar metacarpal artery (FJ2289) → Right superficial palmar arterial arch (FJ2300) | right | 0 | 2 | 1.41 |  |
| Left palmar metacarpal vein (FJ2320) → Left radial vein (FJ2244) | left | 0 | 1.8 | 1.23 |  |
| Right deep palmar branch of ulnar artery (PK-45) → Right superficial palmar arterial arch (FJ2300) | right | 0 | 1.5 | 2.2 |  |
| Left palmar metacarpal vein (FJ2320) → Left radial vein (FJ2244) | left | 0 | 1.2 | 1.64 |  |

## hip flexion 90（48 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Left dorsal metatarsal vein (FJ2186) → Set of dorsal digital veins (FJ2185) | left | 0.03 | 1231.7 | 1.34 | 未綁定：this vessel |
| Left dorsal metatarsal vein (FJ2186) → Set of perforating veins (FJ2100) | left | 5.22 | 1222.3 | 1.26 | 未綁定：this vessel |
| Set of dorsal digital veins (FJ2185) → Left dorsal metatarsal vein (FJ2186) | left | 0 | 1211.5 | 1.31 | 未綁定：the next segment |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3571) | right | 18.63 | 67.5 | 3.29 | 未綁定：the next segment；下一段在trunk |
| Right great saphenous vein (FJ2145) → Right thoracoepigastric vein (PK-59) | right | 1.03 | 65 | 3.63 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal iliac vein (FJ3470) | left | 15.51 | 60.7 | 3.78 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal iliac vein (FJ3470) | left | 15.47 | 56.2 | 3.8 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left superior epigastric vein (FJ3530) | left | 0 | 45.3 | 5.14 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left superficial epigastric vein (FJ2122) | left | 1.37 | 45.1 | 4.86 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left superficial epigastric vein (FJ2122) | left | 0.65 | 39.5 | 4.35 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal artery (PK-109) → Left internal pudendal artery (PK-110) | left | 1.7 | 34.9 | 4.9 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left external iliac vein (FJ3484) | left | 1.98 | 34.4 | 5.36 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal artery (PK-109) → Left internal pudendal artery (PK-110) | left | 0.95 | 34.2 | 4.81 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal artery (PK-82) → Right internal pudendal artery (PK-83) | right | 0.89 | 33.6 | 4.9 | 未綁定：the next segment；下一段在trunk |
| Set of perforating arteries (FJ2203) → Right external iliac artery (FJ3567) | right | 1.42 | 29.7 | 4.91 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3572) | right | 12.61 | 28.6 | 2.85 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3572) | right | 9.66 | 28.4 | 2.67 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal artery (PK-82) → Right internal pudendal artery (PK-83) | right | 0.72 | 27.6 | 5.25 | 未綁定：the next segment；下一段在trunk |
| Set of perforating arteries (FJ2203) → Right deep external pudendal artery (PK-71) | right | 1.81 | 26.6 | 5.2 | 未綁定：the next segment；下一段在trunk |
| Left lateral circumflex femoral vein (FJ2188) → Left deep femoral vein (FJ2099) | left | 25.03 | 26.4 | 4.33 |  |
| Right lateral circumflex femoral vein (FJ2201) → Right deep femoral vein (FJ2135) | right | 24.77 | 25.9 | 4.23 |  |
| Right medial circumflex femoral artery (PK-66) → Right lateral circumflex femoral artery (FJ2158) | right | 21 | 23.5 | 2.92 |  |
| Left inferior gluteal artery (PK-109) → Left internal pudendal artery (PK-110) | left | 1.86 | 23.1 | 5.24 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal artery (PK-109) → Left internal pudendal artery (PK-110) | left | 1.44 | 22 | 5.46 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal artery (PK-82) → Right internal pudendal artery (PK-83) | right | 0 | 21.9 | 5.78 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal pudendal vein (FJ3525) | left | 0 | 21.1 | 1.2 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal pudendal vein (FJ3525) | left | 0.12 | 17.1 | 1.24 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal pudendal vein (FJ3525) | left | 0.12 | 17.1 | 1.24 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3572) | right | 6.93 | 16.8 | 2.33 | 未綁定：the next segment；下一段在trunk |
| Left femoral artery (PKC-320) → Left inferior epigastric artery (FJ3511) | left | 0 | 16 | 1.12 | 未綁定：the next segment；下一段在trunk |
| Left femoral artery (PKC-320) → Left inferior epigastric artery (FJ3511) | left | 0 | 16 | 1.12 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal pudendal vein (FJ3525) | left | 1.35 | 15.6 | 3.68 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal artery (PK-82) → Right internal pudendal artery (PK-83) | right | 0.39 | 14.5 | 3.98 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal artery (PK-109) → Left internal pudendal artery (PK-110) | left | 0 | 13.8 | 5.58 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal vein (FJ3606) → Right internal pudendal vein (FJ3610) | right | 0.17 | 13.8 | 1.23 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal vein (FJ3606) → Right internal pudendal vein (FJ3610) | right | 0.17 | 13.8 | 1.23 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal artery (PK-109) → Left internal pudendal artery (PK-110) | left | 0 | 13.6 | 5.75 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal iliac vein (FJ3471) | left | 0 | 12 | 1.23 | 未綁定：the next segment；下一段在trunk |
| Left obturator vein (FJ3527) → Left external iliac vein (FJ3484) | left | 7.49 | 11.3 | 1.81 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal artery (PK-82) → Right superior gluteal artery (PK-79) | right | 0.12 | 8.7 | 4.89 |  |
| Right inferior gluteal vein (FJ3606) → Right external iliac vein (FJ3568) | right | 0 | 8.3 | 2.91 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal artery (PK-109) → Left internal pudendal artery (PK-110) | left | 0 | 7.4 | 3.58 | 未綁定：the next segment；下一段在trunk |
| Left deep branch of superior gluteal artery (PK-108) → Left inferior gluteal artery (PK-109) | left | 0 | 6.7 | 5.07 |  |
| Left obturator vein (FJ3527) → Left external iliac vein (FJ3484) | left | 0 | 6.5 | 1.6 | 未綁定：the next segment；下一段在trunk |
| Left superior gluteal vein (FJ3531) → Left uterine vein (HRAF-697) | left | 1.98 | 6.3 | 4.41 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal artery (PK-109) → Left internal pudendal artery (PK-110) | left | 0.56 | 5.4 | 4.74 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal vein (FJ3606) → Right iliolumbar vein (FJ3603) | right | 0.3 | 3.6 | 5.2 | 未綁定：the next segment；下一段在trunk |
| Left obturator vein (FJ3527) → Left inferior gluteal vein (FJ3513) | left | 0.79 | 2.6 | 1.94 |  |

## knee flexion 90（24 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Left dorsal metatarsal vein (FJ2186) → Set of dorsal digital veins (FJ2185) | left | 0.03 | 617.5 | 1.34 | 未綁定：this vessel |
| Left dorsal metatarsal vein (FJ2186) → Set of perforating veins (FJ2100) | left | 5.22 | 612.6 | 1.26 | 未綁定：this vessel |
| Set of dorsal digital veins (FJ2185) → Left dorsal metatarsal vein (FJ2186) | left | 0 | 594.7 | 1.31 | 未綁定：the next segment |
| Left small saphenous vein (FJ2121) → Left genicular vein (FJ2107) | left | 38.27 | 40.4 | 4.76 |  |
| Left small saphenous vein (FJ2121) → Left genicular vein (FJ2107) | left | 36.09 | 37.8 | 3.66 |  |
| Right small saphenous vein (FJ2176) → Right genicular vein (FJ2151) | right | 34.7 | 36 | 4.76 |  |
| Left inferior medial genicular artery (FJ2077) → Left anterior tibial recurrent artery (FJ2066) | left | 28.01 | 32.7 | 2.93 |  |
| Right genicular vein (FJ2182) → Right anterior tibial vein (FJ2132) | right | 24.31 | 28.5 | 1.14 |  |
| Left anterior tibial recurrent artery (FJ2066) → Left articular branch of descending genicular artery (PK-99) | left | 25.47 | 27.9 | 2.44 |  |
| Left genicular vein (FJ2125) → Left anterior tibial vein (FJ2097) | left | 22.93 | 27.3 | 1.94 |  |
| Left anterior tibial recurrent artery (FJ2066) → Left lateral superior genicular artery (FJ2080) | left | 19.99 | 24.3 | 2.4 |  |
| Left articular branch of descending genicular artery (PK-99) → Left anterior tibial recurrent artery (FJ2066) | left | 19.62 | 22.9 | 1.24 |  |
| Right articular branch of descending genicular artery (PK-72) → Right anterior tibial recurrent artery (FJ2131) | right | 18.37 | 21 | 1.24 |  |
| Left anterior tibial recurrent artery (FJ2066) → Left inferior medial genicular artery (FJ2077) | left | 17.62 | 20.4 | 1.39 |  |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2151) | right | 12.57 | 19.1 | 1.78 |  |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2181) | right | 15.39 | 17 | 1.78 |  |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2151) | right | 10.66 | 16.5 | 1.73 |  |
| Left anterior tibial recurrent artery (FJ2066) → Left inferior lateral genicular artery (FJ2076) | left | 10.18 | 13.3 | 2.34 |  |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2151) | right | 5.66 | 8.6 | 1.68 |  |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2151) | right | 5.66 | 8.6 | 1.68 |  |
| Left anterior tibial vein (FJ2097) → Left genicular vein (FJ2107) | left | 4.93 | 7.8 | 1.75 |  |
| Left genicular vein (FJ2124) → Left anterior tibial vein (FJ2097) | left | 0.06 | 5.6 | 1.64 |  |
| Right lateral superior genicular artery (FJ2162) → Right inferior lateral genicular artery (FJ2150) | right | 0 | 3.1 | 1.01 |  |
| Left genicular vein (FJ2107) → Left anterior tibial vein (FJ2097) | left | 0.19 | 2.9 | 0.97 |  |

## hip flexion 120 + knee 130 (limit)（75 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Set of dorsal digital veins (FJ2185) → Left dorsal metatarsal vein (FJ2186) | left | 0 | 720.8 | 1.31 | 未綁定：the next segment |
| Left dorsal metatarsal vein (FJ2186) → Set of perforating veins (FJ2100) | left | 5.22 | 720.3 | 1.26 | 未綁定：this vessel |
| Left dorsal metatarsal vein (FJ2186) → Set of dorsal digital veins (FJ2185) | left | 0.03 | 717.3 | 1.34 | 未綁定：this vessel |
| Right great saphenous vein (FJ2145) → Right thoracoepigastric vein (PK-59) | right | 1.03 | 84.6 | 3.63 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3571) | right | 18.63 | 84.2 | 3.29 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal iliac vein (FJ3470) | left | 15.51 | 76.4 | 3.78 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal iliac vein (FJ3470) | left | 15.47 | 71.1 | 3.8 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left superior epigastric vein (FJ3530) | left | 0 | 62.2 | 5.14 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left superficial epigastric vein (FJ2122) | left | 1.37 | 59.3 | 4.86 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left superficial epigastric vein (FJ2122) | left | 0.65 | 52.3 | 4.35 | 未綁定：the next segment；下一段在trunk |
| Set of perforating arteries (FJ2203) → Right deep external pudendal artery (PK-71) | right | 1.81 | 48 | 5.2 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal artery (PK-109) → Left internal pudendal artery (PK-110) | left | 1.7 | 45.4 | 4.9 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal artery (PK-109) → Left internal pudendal artery (PK-110) | left | 0.95 | 44.7 | 4.81 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left external iliac vein (FJ3484) | left | 1.98 | 44.6 | 5.36 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal artery (PK-82) → Right internal pudendal artery (PK-83) | right | 0.89 | 44.4 | 4.9 | 未綁定：the next segment；下一段在trunk |
| Left small saphenous vein (FJ2121) → Left genicular vein (FJ2107) | left | 38.27 | 42.2 | 4.76 |  |
| Left small saphenous vein (FJ2121) → Left genicular vein (FJ2107) | left | 36.09 | 39 | 3.66 |  |
| Set of perforating arteries (FJ2203) → Right external iliac artery (FJ3567) | right | 1.42 | 38.6 | 4.91 | 未綁定：the next segment；下一段在trunk |
| Right lateral circumflex femoral vein (FJ2201) → Right deep femoral vein (FJ2135) | right | 36.18 | 37.5 | 3.9 |  |
| Right small saphenous vein (FJ2176) → Right genicular vein (FJ2151) | right | 34.7 | 37 | 4.76 |  |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3572) | right | 9.66 | 36.3 | 2.67 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3572) | right | 12.61 | 36.1 | 2.85 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal artery (PK-82) → Right internal pudendal artery (PK-83) | right | 0.72 | 35.9 | 5.25 | 未綁定：the next segment；下一段在trunk |
| Left inferior medial genicular artery (FJ2077) → Left anterior tibial recurrent artery (FJ2066) | left | 28.01 | 34.5 | 2.93 |  |
| Left inferior gluteal artery (PK-109) → Left internal pudendal artery (PK-110) | left | 1.86 | 30.1 | 5.24 | 未綁定：the next segment；下一段在trunk |
| Right genicular vein (FJ2182) → Right anterior tibial vein (FJ2132) | right | 24.31 | 30.1 | 1.14 |  |
| Right inferior gluteal artery (PK-82) → Right internal pudendal artery (PK-83) | right | 0 | 29.1 | 5.78 | 未綁定：the next segment；下一段在trunk |
| Left genicular vein (FJ2125) → Left anterior tibial vein (FJ2097) | left | 22.93 | 29 | 1.94 |  |
| Left inferior gluteal artery (PK-109) → Left internal pudendal artery (PK-110) | left | 1.44 | 28.9 | 5.46 | 未綁定：the next segment；下一段在trunk |
| Left anterior tibial recurrent artery (FJ2066) → Left articular branch of descending genicular artery (PK-99) | left | 25.47 | 28.8 | 2.44 |  |
| Left inferior gluteal vein (FJ3513) → Left internal pudendal vein (FJ3525) | left | 0 | 27.3 | 1.2 | 未綁定：the next segment；下一段在trunk |
| Left lateral circumflex femoral vein (FJ2188) → Left deep femoral vein (FJ2099) | left | 25.03 | 26.9 | 4.33 |  |
| Left anterior tibial recurrent artery (FJ2066) → Left lateral superior genicular artery (FJ2080) | left | 19.99 | 26.6 | 2.4 |  |
| Right lateral circumflex femoral vein (FJ2201) → Right deep femoral vein (FJ2135) | right | 24.77 | 26.3 | 4.23 |  |
| Right medial circumflex femoral artery (PK-66) → Right lateral circumflex femoral artery (FJ2158) | right | 21 | 24.4 | 2.92 |  |
| Left articular branch of descending genicular artery (PK-99) → Left anterior tibial recurrent artery (FJ2066) | left | 19.62 | 24.2 | 1.24 |  |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3572) | right | 6.93 | 22.6 | 2.33 | 未綁定：the next segment；下一段在trunk |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2151) | right | 12.57 | 22.3 | 1.78 |  |
| Right articular branch of descending genicular artery (PK-72) → Right anterior tibial recurrent artery (FJ2131) | right | 18.37 | 22.2 | 1.24 |  |
| Left anterior tibial recurrent artery (FJ2066) → Left inferior medial genicular artery (FJ2077) | left | 17.62 | 21.8 | 1.39 |  |
| Left inferior gluteal vein (FJ3513) → Left internal pudendal vein (FJ3525) | left | 0.12 | 21.7 | 1.24 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal pudendal vein (FJ3525) | left | 0.12 | 21.7 | 1.24 | 未綁定：the next segment；下一段在trunk |
| Left femoral artery (PKC-320) → Left inferior epigastric artery (FJ3511) | left | 0 | 20.6 | 1.12 | 未綁定：the next segment；下一段在trunk |
| Left femoral artery (PKC-320) → Left inferior epigastric artery (FJ3511) | left | 0 | 20.6 | 1.12 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal pudendal vein (FJ3525) | left | 1.35 | 19.7 | 3.68 | 未綁定：the next segment；下一段在trunk |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2151) | right | 10.66 | 19.5 | 1.73 |  |
| Right inferior gluteal artery (PK-82) → Right internal pudendal artery (PK-83) | right | 0.39 | 18.4 | 3.98 | 未綁定：the next segment；下一段在trunk |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2181) | right | 15.39 | 18 | 1.78 |  |
| Left inferior gluteal artery (PK-109) → Left internal pudendal artery (PK-110) | left | 0 | 17.8 | 5.58 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal vein (FJ3606) → Right internal pudendal vein (FJ3610) | right | 0.17 | 17.6 | 1.23 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal vein (FJ3606) → Right internal pudendal vein (FJ3610) | right | 0.17 | 17.6 | 1.23 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal artery (PK-109) → Left internal pudendal artery (PK-110) | left | 0 | 17.3 | 5.75 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal iliac vein (FJ3471) | left | 0 | 15.3 | 1.23 | 未綁定：the next segment；下一段在trunk |
| Left anterior tibial recurrent artery (FJ2066) → Left inferior lateral genicular artery (FJ2076) | left | 10.18 | 14.9 | 2.34 |  |
| Left obturator vein (FJ3527) → Left external iliac vein (FJ3484) | left | 7.49 | 13.8 | 1.81 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal artery (PK-82) → Right superior gluteal artery (PK-79) | right | 0.12 | 11.6 | 4.89 |  |
| Right inferior gluteal vein (FJ3606) → Right external iliac vein (FJ3568) | right | 0 | 10.6 | 2.91 | 未綁定：the next segment；下一段在trunk |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2151) | right | 5.66 | 10.1 | 1.68 |  |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2151) | right | 5.66 | 10.1 | 1.68 |  |
| Left inferior gluteal artery (PK-109) → Left internal pudendal artery (PK-110) | left | 0 | 9.6 | 3.58 | 未綁定：the next segment；下一段在trunk |

## hip extension -20 (limit)（29 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Left dorsal metatarsal vein (FJ2186) → Set of perforating veins (FJ2100) | left | 5.22 | 304.9 | 1.26 | 未綁定：this vessel |
| Left dorsal metatarsal vein (FJ2186) → Set of dorsal digital veins (FJ2185) | left | 0.03 | 301.9 | 1.34 | 未綁定：this vessel |
| Set of dorsal digital veins (FJ2185) → Left dorsal metatarsal vein (FJ2186) | left | 0 | 296.4 | 1.31 | 未綁定：the next segment |
| Left inferior gluteal vein (FJ3513) → Left internal iliac vein (FJ3470) | left | 15.47 | 16.7 | 3.8 | 未綁定：the next segment；下一段在trunk |
| Right great saphenous vein (FJ2145) → Right thoracoepigastric vein (PK-59) | right | 1.03 | 15.4 | 3.63 | 未綁定：the next segment；下一段在trunk |
| Set of perforating arteries (FJ2203) → Right deep external pudendal artery (PK-71) | right | 1.81 | 15.4 | 5.2 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3572) | right | 12.61 | 14.9 | 2.85 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3572) | right | 9.66 | 12.6 | 2.67 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left superior epigastric vein (FJ3530) | left | 0 | 12.1 | 5.14 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3572) | right | 6.93 | 10.1 | 2.33 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left superficial epigastric vein (FJ2122) | left | 1.37 | 9.2 | 4.86 | 未綁定：the next segment；下一段在trunk |
| Left obturator vein (FJ3527) → Left external iliac vein (FJ3484) | left | 7.49 | 8.5 | 1.81 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal artery (PK-109) → Left internal pudendal artery (PK-110) | left | 1.7 | 8.3 | 4.9 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left superficial epigastric vein (FJ2122) | left | 0.65 | 7.9 | 4.35 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal artery (PK-109) → Left internal pudendal artery (PK-110) | left | 0.95 | 7.6 | 4.81 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal artery (PK-82) → Right internal pudendal artery (PK-83) | right | 0.89 | 7.5 | 4.9 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left external iliac vein (FJ3484) | left | 1.98 | 6.3 | 5.36 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal artery (PK-109) → Left internal pudendal artery (PK-110) | left | 1.44 | 5.9 | 5.46 | 未綁定：the next segment；下一段在trunk |
| Set of perforating arteries (FJ2203) → Right external iliac artery (FJ3567) | right | 1.42 | 5.2 | 4.91 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal pudendal vein (FJ3525) | left | 0 | 4.6 | 1.2 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal pudendal vein (FJ3525) | left | 0.12 | 3.6 | 1.24 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal pudendal vein (FJ3525) | left | 0.12 | 3.6 | 1.24 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal artery (PK-82) → Right internal pudendal artery (PK-83) | right | 0.39 | 3.2 | 3.98 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal pudendal vein (FJ3525) | left | 1.9 | 3.1 | 5.15 | 未綁定：the next segment；下一段在trunk |
| Left femoral artery (PKC-320) → Left inferior epigastric artery (FJ3511) | left | 0 | 2.3 | 1.12 | 未綁定：the next segment；下一段在trunk |
| Left femoral artery (PKC-320) → Left inferior epigastric artery (FJ3511) | left | 0 | 2.3 | 1.12 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal vein (FJ3606) → Right internal pudendal vein (FJ3610) | right | 0.17 | 2.3 | 1.23 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal vein (FJ3606) → Right internal pudendal vein (FJ3610) | right | 0.17 | 2.3 | 1.23 | 未綁定：the next segment；下一段在trunk |
| Left obturator vein (FJ3527) → Left external iliac vein (FJ3484) | left | 0 | 2 | 1.6 | 未綁定：the next segment；下一段在trunk |

## ankle dorsiflexion 20 (limit)（4 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Left dorsal metatarsal vein (FJ2186) → Set of dorsal digital veins (FJ2185) | left | 0.03 | 43.1 | 1.34 | 未綁定：this vessel |
| Left dorsal metatarsal vein (FJ2186) → Set of perforating veins (FJ2100) | left | 5.22 | 40.8 | 1.26 | 未綁定：this vessel |
| Set of dorsal digital veins (FJ2185) → Left dorsal metatarsal vein (FJ2186) | left | 0 | 36 | 1.31 | 未綁定：the next segment |
| Set of dorsal digital arteries (FJ2093) → Left posterior tibial artery (FJ2087) | left | 13.09 | 15.7 | 2.99 |  |

## ankle plantar flexion -30 (limit)（3 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Left dorsal metatarsal vein (FJ2186) → Set of dorsal digital veins (FJ2185) | left | 0.03 | 64 | 1.34 | 未綁定：this vessel |
| Left dorsal metatarsal vein (FJ2186) → Set of perforating veins (FJ2100) | left | 5.22 | 59.4 | 1.26 | 未綁定：this vessel |
| Set of dorsal digital veins (FJ2185) → Left dorsal metatarsal vein (FJ2186) | left | 0 | 52.4 | 1.31 | 未綁定：the next segment |

## hip abduction 35 (limit)（28 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Left dorsal metatarsal vein (FJ2186) → Set of dorsal digital veins (FJ2185) | left | 0.03 | 520.1 | 1.34 | 未綁定：this vessel |
| Left dorsal metatarsal vein (FJ2186) → Set of perforating veins (FJ2100) | left | 5.22 | 518.5 | 1.26 | 未綁定：this vessel |
| Set of dorsal digital veins (FJ2185) → Left dorsal metatarsal vein (FJ2186) | left | 0 | 512 | 1.31 | 未綁定：the next segment |
| Left inferior gluteal vein (FJ3513) → Left internal iliac vein (FJ3470) | left | 15.51 | 16.7 | 3.78 | 未綁定：the next segment；下一段在trunk |
| Left obturator vein (FJ3527) → Left external iliac vein (FJ3484) | left | 7.49 | 11.6 | 1.81 | 未綁定：the next segment；下一段在trunk |
| Set of perforating arteries (FJ2203) → Right deep external pudendal artery (PK-71) | right | 1.81 | 10.8 | 5.2 | 未綁定：the next segment；下一段在trunk |
| Right great saphenous vein (FJ2145) → Right thoracoepigastric vein (PK-59) | right | 1.03 | 9.9 | 3.63 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left superior epigastric vein (FJ3530) | left | 0 | 6.2 | 5.14 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left superficial epigastric vein (FJ2122) | left | 1.37 | 5.4 | 4.86 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal pudendal vein (FJ3525) | left | 0.12 | 5 | 1.24 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal pudendal vein (FJ3525) | left | 0.12 | 5 | 1.24 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal pudendal vein (FJ3525) | left | 0 | 4.9 | 1.2 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left external iliac vein (FJ3484) | left | 1.98 | 4.8 | 5.36 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal vein (FJ3606) → Right internal pudendal vein (FJ3610) | right | 0.17 | 4.4 | 1.23 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal vein (FJ3606) → Right internal pudendal vein (FJ3610) | right | 0.17 | 4.4 | 1.23 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal artery (PK-82) → Right internal pudendal artery (PK-83) | right | 0.39 | 4.4 | 3.98 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal pudendal vein (FJ3525) | left | 1.35 | 4.1 | 3.68 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal iliac vein (FJ3471) | left | 0 | 4.1 | 1.23 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal artery (PK-82) → Right internal pudendal artery (PK-83) | right | 0 | 4.1 | 5.78 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left superficial epigastric vein (FJ2122) | left | 0.65 | 3.6 | 4.35 | 未綁定：the next segment；下一段在trunk |
| Left superior gluteal vein (FJ3531) → Left uterine vein (HRAF-697) | left | 1.98 | 3.1 | 4.41 | 未綁定：the next segment；下一段在trunk |
| Left femoral artery (PKC-320) → Left inferior epigastric artery (FJ3511) | left | 0 | 3.1 | 1.12 | 未綁定：the next segment；下一段在trunk |
| Left femoral artery (PKC-320) → Left inferior epigastric artery (FJ3511) | left | 0 | 3.1 | 1.12 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal vein (FJ3606) → Right external iliac vein (FJ3568) | right | 0 | 2.9 | 2.91 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal artery (PK-82) → Right superior gluteal artery (PK-79) | right | 0.12 | 2.7 | 4.89 |  |
| Set of perforating arteries (FJ2203) → Right external iliac artery (FJ3567) | right | 1.42 | 2.6 | 4.91 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal artery (PK-109) → Left internal pudendal artery (PK-110) | left | 0.56 | 2.5 | 4.74 | 未綁定：the next segment；下一段在trunk |
| Left obturator vein (FJ3527) → Left external iliac vein (FJ3484) | left | 0 | 2.1 | 1.6 | 未綁定：the next segment；下一段在trunk |

## hip rotation 20 (limit)（35 個例外）

| 血管對 | 側 | 靜止間隙 (mm) | 擺姿後 (mm) | 管徑 (mm) | 備註 |
| --- | --- | ---: | ---: | ---: | --- |
| Left dorsal metatarsal vein (FJ2186) → Set of dorsal digital veins (FJ2185) | left | 0.03 | 41.6 | 1.34 | 未綁定：this vessel |
| Right lateral circumflex femoral vein (FJ2201) → Right deep femoral vein (FJ2135) | right | 36.18 | 38 | 3.9 |  |
| Left dorsal metatarsal vein (FJ2186) → Set of perforating veins (FJ2100) | left | 5.22 | 36.6 | 1.26 | 未綁定：this vessel |
| Set of dorsal digital veins (FJ2185) → Left dorsal metatarsal vein (FJ2186) | left | 0 | 34.9 | 1.31 | 未綁定：the next segment |
| Left lateral circumflex femoral vein (FJ2188) → Left deep femoral vein (FJ2099) | left | 31.34 | 32.8 | 3.93 |  |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3571) | right | 18.63 | 30.9 | 3.29 | 未綁定：the next segment；下一段在trunk |
| Right lateral circumflex femoral vein (FJ2201) → Right deep femoral vein (FJ2135) | right | 26.39 | 27.8 | 4.38 |  |
| Left inferior gluteal vein (FJ3513) → Left internal iliac vein (FJ3470) | left | 15.51 | 27.7 | 3.78 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal iliac vein (FJ3470) | left | 15.47 | 27.4 | 3.8 | 未綁定：the next segment；下一段在trunk |
| Left lateral circumflex femoral vein (FJ2188) → Left deep femoral vein (FJ2099) | left | 24.4 | 25.6 | 4.12 |  |
| Right medial circumflex femoral artery (PK-66) → Right lateral circumflex femoral artery (FJ2158) | right | 21 | 22.7 | 2.92 |  |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3572) | right | 12.61 | 17.6 | 2.85 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3572) | right | 9.66 | 14.5 | 2.67 | 未綁定：the next segment；下一段在trunk |
| Right great saphenous vein (FJ2145) → Right thoracoepigastric vein (PK-59) | right | 1.03 | 13.4 | 3.63 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3572) | right | 6.93 | 11.3 | 2.33 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left superficial epigastric vein (FJ2122) | left | 1.37 | 10.1 | 4.86 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left external iliac vein (FJ3484) | left | 1.98 | 9.8 | 5.36 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal artery (PK-109) → Left internal pudendal artery (PK-110) | left | 1.7 | 9.3 | 4.9 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left superior epigastric vein (FJ3530) | left | 0 | 8.9 | 5.14 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal artery (PK-82) → Right internal pudendal artery (PK-83) | right | 0.89 | 8.8 | 4.9 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal artery (PK-109) → Left internal pudendal artery (PK-110) | left | 0.95 | 8.5 | 4.81 | 未綁定：the next segment；下一段在trunk |
| Set of perforating arteries (FJ2203) → Right external iliac artery (FJ3567) | right | 1.42 | 7.8 | 4.91 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal artery (PK-109) → Left internal pudendal artery (PK-110) | left | 1.44 | 6 | 5.46 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal artery (PK-109) → Left internal pudendal artery (PK-110) | left | 1.86 | 5.7 | 5.24 | 未綁定：the next segment；下一段在trunk |
| Left deep femoral vein (FJ2099) → Left superficial epigastric vein (FJ2122) | left | 0.65 | 5.2 | 4.35 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal artery (PK-82) → Right internal pudendal artery (PK-83) | right | 0.72 | 4.2 | 5.25 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal pudendal vein (FJ3525) | left | 0 | 3.6 | 1.2 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal pudendal vein (FJ3525) | left | 0.12 | 3.2 | 1.24 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal pudendal vein (FJ3525) | left | 0.12 | 3.2 | 1.24 | 未綁定：the next segment；下一段在trunk |
| Left inferior gluteal vein (FJ3513) → Left internal pudendal vein (FJ3525) | left | 1.35 | 2.9 | 3.68 | 未綁定：the next segment；下一段在trunk |
| Left femoral artery (PKC-320) → Left inferior epigastric artery (FJ3511) | left | 0 | 2.5 | 1.12 | 未綁定：the next segment；下一段在trunk |
| Left femoral artery (PKC-320) → Left inferior epigastric artery (FJ3511) | left | 0 | 2.5 | 1.12 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal artery (PK-82) → Right internal pudendal artery (PK-83) | right | 0.39 | 2.3 | 3.98 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal vein (FJ3606) → Right internal pudendal vein (FJ3610) | right | 0.17 | 1.7 | 1.23 | 未綁定：the next segment；下一段在trunk |
| Right inferior gluteal vein (FJ3606) → Right internal pudendal vein (FJ3610) | right | 0.17 | 1.7 | 1.23 | 未綁定：the next segment；下一段在trunk |
