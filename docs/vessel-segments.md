# 血管分段連續性（相鄰動脈／靜脈）

由 `node scripts/audit-vessel-continuity.mjs --segments --write` 產生。每個血管網格是一段；每個末端與「下一段」配對（它面對的末端，或它匯入的主幹），量測：

- 間隙：本段末端中心到下一段表面的距離（重疊則為 0）
- 切線誤差：端接端時，兩端軸向的夾角（0° = 正好接續）
- 管徑誤差：兩段管徑的比值

間隙大於管徑一半者列在下方，並收進 `REVIEW_LOG.md`。範圍：上肢、下肢；尚未處理：thorax (incl. hilum vessels)、back、head and neck、abdomen and pelvis。

| 區域 | 末端數 | 有下一段 | 已收成尖端 | 無下一段 | 間隙 > 管徑一半（修正前→後） | 切線誤差 > 45° | 管徑誤差 > 1.5 倍 |
| --- | ---: | ---: | ---: | ---: | --- | ---: | ---: |
| 上肢 | 1229 | 466 | 397 | 366 | 199 → 87 | 172 → 125 | 95 → 62 |
| 下肢 | 1475 | 479 | 572 | 424 | 312 → 108 | 192 → 102 | 98 → 62 |

## 上肢：間隙大於管徑一半（87）

| 血管對（上游 → 下一段） | 類型 | 間隙 (mm) | 管徑 (mm) |
| --- | --- | ---: | ---: |
| Right cephalic vein (FJ2272) → Right lateral brachial vein (PK-56) | 分支入幹 | 32.91 | 4.84 |
| Left cephalic vein (FJ2220) → Left lateral brachial vein (PK-60) | 分支入幹 | 30.96 | 3.81 |
| Left cephalic vein (FJ2220) → Left anterior circumflex humeral vein (FJ2213) | 分支入幹 | 29.09 | 3.39 |
| Left dorsal scapular artery (FJ2232) → Posterior intercostal arteries (FJ1975) | 分支入幹 | 26.95 | 2 |
| Left posterior interosseous vein (PK-62) → Left anterior interosseous vein (PK-61) | 分支入幹 | 25.29 | 2.52 |
| Right cephalic vein (FJ2272) → Right axillary vein (FJ2269) | 分支入幹 | 24.64 | 3.41 |
| Left radial artery (FJ2242) → Left posterior interosseous artery (PK-53) | 分支入幹 | 23.69 | 2.33 |
| Left anterior circumflex humeral vein (FJ2213) → Left cephalic vein (FJ2220) | 分支入幹 | 23.5 | 2.26 |
| Right radial artery (FJ2294) → Right posterior interosseous artery (PK-43) | 分支入幹 | 23.32 | 3.93 |
| Right anterior circumflex humeral vein (FJ2265) → Right posterior circumflex humeral vein (PK-42) | 分支入幹 | 21.56 | 1.6 |
| Right anterior circumflex humeral vein (FJ2265) → Right posterior circumflex humeral vein (PK-42) | 分支入幹 | 21.52 | 1.29 |
| Right ulnar artery (FJ2310) → Right dorsal carpal branch of ulnar artery (FJ2288) | 分支入幹 | 20.96 | 2.22 |
| Left suprascapular vein (FJ2250) → Left posterior segmental vein (FJ2929) | 分支入幹 | 20.5 | 1.71 |
| Left suprascapular artery (FJ2251) → Left second posterior intercostal artery (FJ1974) | 分支入幹 | 19.86 | 1.32 |
| Left basilic vein (FJ2218) → Left ulnar vein (FJ2260) | 分支入幹 | 19.77 | 1.8 |
| Right anterior circumflex humeral artery (FJ2264) → Right posterior circumflex humeral artery (FJ2292) | 分支入幹 | 19.16 | 2.41 |
| Left superior ulnar collateral artery (FJ2374) → Left brachial artery (FJ2219) | 分支入幹 | 18.92 | 1.22 |
| Left cephalic vein (FJ2220) → Left lateral thoracic vein (FJ2233) | 分支入幹 | 18.8 | 4.22 |
| Left radial artery (FJ2242) → Left posterior interosseous artery (PK-53) | 分支入幹 | 18.68 | 1.05 |
| Right recurrent interosseous artery (FJ2297) → Right radial recurrent artery (FJ2295) | 分支入幹 | 18.64 | 2.68 |
| Left anterior circumflex humeral artery (FJ2212) → Left posterior circumflex humeral artery (FJ2240) | 分支入幹 | 18.56 | 2.49 |
| Right ulnar artery (FJ2310) → Right anterior interosseous artery (FJ2266) | 分支入幹 | 18.51 | 3.97 |
| Right ulnar artery (FJ2310) → Right anterior interosseous artery (FJ2266) | 分支入幹 | 18.42 | 3.97 |
| Left median antebrachial vein (FJ2234) → Left ulnar vein (FJ2260) | 分支入幹 | 18.41 | 1.22 |
| Left radial artery (FJ2242) → Left superficial palmar arterial arch (FJ2248) | 分支入幹 | 17.91 | 1.6 |
| Right radial artery (FJ2294) → Right posterior interosseous artery (PK-43) | 分支入幹 | 17.86 | 2.2 |
| Right suprascapular vein (FJ2302) → Right circumflex scapular vein (FJ2274) | 分支入幹 | 17.45 | 1.78 |
| Right radial artery (FJ2294) → Right posterior interosseous artery (PK-43) | 分支入幹 | 16.76 | 3.66 |
| Left cephalic vein (FJ2220) → Left anterior circumflex humeral vein (FJ2213) | 分支入幹 | 15.57 | 5.03 |
| Right circumflex scapular vein (FJ2274) → Right posterior circumflex humeral vein (PK-42) | 分支入幹 | 15.25 | 1.65 |
| Right dorsal scapular artery (FJ2284) → Posterior intercostal arteries (FJ1961) | 分支入幹 | 15.12 | 1.34 |
| Left dorsal scapular artery (FJ2232) → Posterior intercostal arteries (FJ1975) | 分支入幹 | 15.03 | 1.12 |
| Right radial vein (FJ2296) → Right cephalic vein (FJ2272) | 分支入幹 | 14.85 | 2.42 |
| Left anterior interosseous vein (PK-61) → Left median antebrachial vein (FJ2234) | 分支入幹 | 14.6 | 1.36 |
| Right anterior interosseous vein (PK-57) → Right median antebrachial vein (FJ2286) | 分支入幹 | 14.5 | 1.36 |
| Right median antebrachial vein (FJ2286) → Right ulnar vein (FJ2312) | 分支入幹 | 13.77 | 2.08 |
| Left suprascapular vein (FJ2250) → Left subclavian vein (FJ3486) | 分支入幹 | 13.62 | 1.76 |
| Left ulnar vein (FJ2260) → Left basilic vein (FJ2218) | 分支入幹 | 13.49 | 2.25 |
| Right deep brachial artery (FJ2277) → Right brachial artery (FJ2271) | 分支入幹 | 13.26 | 2.4 |
| Right arteria radialis indicis (FJ2342) → Set of dorsal digital arteries (FJ2346) | 分支入幹 | 13.24 | 1.78 |
| Right superior ulnar collateral artery (FJ2373) → Right posterior ulnar recurrent artery (FJ2293) | 分支入幹 | 12.99 | 1.44 |
| Left superficial palmar venous arch (FJ2249) → Left deep palmar venous arch (FJ2229) | 分支入幹 | 12.94 | 1.67 |
| Right inferior ulnar collateral artery (FJ2267) → Right brachial artery (FJ2271) | 分支入幹 | 12.64 | 1.56 |
| Set of dorsal metacarpal arteries (FJ2347) → Set of dorsal digital arteries (FJ2346) | 分支入幹 | 12.53 | 2.09 |
| Right superior ulnar collateral artery (FJ2373) → Right brachial artery (FJ2271) | 分支入幹 | 12.19 | 2.57 |
| Proper palmar digital vein of left little finger (FJ2319) → Proper palmar digital vein of left little finger (FJ2321) | 分支入幹 | 12 | 1.74 |
| Left ulnar vein (FJ2260) → Left median antebrachial vein (FJ2234) | 分支入幹 | 11.72 | 2.37 |
| Set of dorsal metacarpal arteries (FJ2348) → Set of dorsal digital arteries (FJ2318) | 分支入幹 | 10.78 | 1.95 |
| Proper palmar digital vein of left little finger (FJ2329) → Proper palmar digital vein of left ring finger (FJ2328) | 分支入幹 | 10.56 | 1.03 |
| Right radial vein (FJ2296) → Right cephalic vein (FJ2272) | 分支入幹 | 10.23 | 2.24 |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral thoracic artery (FJ1976) | 分支入幹 | 9.93 | 1.23 |
| Pectoral branch of right thoraco-acromial artery (FJ2361) → Right lateral thoracic artery (FJ1938) | 分支入幹 | 9.62 | 1.24 |
| Left basilic vein (FJ2218) → Left ulnar vein (FJ2260) | 分支入幹 | 9.42 | 2.19 |
| Left lateral brachial vein (PK-60) → Left medial brachial vein (FJ2313) | 分支入幹 | 9.4 | 2.9 |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral mammary artery (PK-8) | 分支入幹 | 9.16 | 2.14 |
| Right fourth common palmar digital artery (FJ2370) → Set of dorsal digital arteries (FJ2346) | 分支入幹 | 8.93 | 1.39 |
| Right radial vein (FJ2296) → Right cephalic vein (FJ2272) | 分支入幹 | 8.92 | 1.41 |
| Left axillary artery (FJ2216) → Deltoid branch of left thoraco-acromial artery (FJ2230) | 分支入幹 | 8.25 | 1.63 |
| Right posterior circumflex humeral vein (PK-42) → Right anterior circumflex humeral vein (FJ2265) | 分支入幹 | 7.22 | 2.47 |
| Right radial artery (FJ2294) → Right radial recurrent artery (FJ2295) | 分支入幹 | 7.11 | 3.25 |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral mammary artery (PK-8) | 分支入幹 | 6.92 | 1.49 |
| Dorsal venous network of left hand (FJ2228) → Left palmar metacarpal vein (FJ2238) | 分支入幹 | 6.76 | 3.26 |
| Right deep palmar arch (FJ2279) → Right palmar metacarpal artery (FJ2289) | 分支入幹 | 6.67 | 3.12 |
| Lateral proper palmar digital artery of left middle finger (FJ2334) → Medial proper palmar digital artery of left index finger (FJ2333) | 分支入幹 | 6.55 | 1.47 |
| Right radial artery (FJ2294) → Right radial recurrent artery (FJ2295) | 分支入幹 | 6.2 | 2.77 |
| Left palmar metacarpal vein (FJ2238) → Left palmar metacarpal vein (FJ2323) | 分支入幹 | 6.14 | 1.72 |
| Pectoral branch of right thoraco-acromial artery (FJ2361) → Right lateral mammary artery (PK-3) | 分支入幹 | 5.95 | 1.36 |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left second posterior intercostal artery (FJ1974) | 分支入幹 | 5.94 | 1.48 |
| Left inferior ulnar collateral artery (FJ2215) → Left brachial artery (FJ2219) | 分支入幹 | 5.49 | 2.47 |
| Proper palmar digital vein of left little finger (FJ2321) → Proper palmar digital vein of left little finger (FJ2329) | 分支入幹 | 5.35 | 0.8 |
| Left circumflex scapular artery (FJ2221) → Left axillary artery (FJ2216) | 分支入幹 | 4.88 | 1.84 |
| Right radial artery (FJ2294) → Right superficial palmar branch of radial artery (PK-44) | 端接端 | 4.64 | 1.01 |
| Medial proper palmar digital artery of left index finger (FJ2333) → Set of dorsal digital arteries (FJ2318) | 分支入幹 | 4.6 | 0.93 |
| Proper palmar digital vein of left middle finger (FJ2340) → Proper palmar digital vein of left middle finger (FJ2326) | 分支入幹 | 4.34 | 0.8 |
| Right radial vein (FJ2296) → Right cephalic vein (FJ2272) | 分支入幹 | 4.22 | 2.93 |
| Left median cubital vein (FJ2235) → Left medial brachial vein (FJ2313) | 分支入幹 | 4.15 | 3.92 |
| Left circumflex scapular vein (FJ2222) → Left suprascapular vein (FJ2250) | 分支入幹 | 4.12 | 0.98 |
| Right palmar metacarpal vein (FJ2290) → Right palmar metacarpal vein (FJ2353) | 分支入幹 | 4.07 | 1.73 |
| Proper palmar digital vein of right middle finger (FJ2356) → Dorsal venous network of right hand (FJ2280) | 分支入幹 | 3.91 | 1.31 |
| Proper palmar digital vein of left middle finger (FJ2326) → Dorsal venous network of left hand (FJ2228) | 分支入幹 | 3.72 | 1.35 |
| Left cephalic vein (FJ2220) → Left anterior circumflex humeral vein (FJ2213) | 分支入幹 | 3.45 | 3.54 |
| Left ulnar vein (FJ2260) → Left median antebrachial vein (FJ2234) | 分支入幹 | 3.12 | 1.08 |
| Deltoid branch of left thoraco-acromial artery (FJ2230) → Left axillary artery (FJ2216) | 分支入幹 | 2.83 | 2.2 |
| Left median cubital vein (FJ2235) → Left medial brachial vein (FJ2313) | 分支入幹 | 2.27 | 4.15 |
| Right third common palmar digital artery (FJ2345) → Right palmar metacarpal artery (FJ2289) | 分支入幹 | 0.86 | 1.7 |
| Left median cubital vein (FJ2235) → Left lateral brachial vein (PK-60) | 分支入幹 | 0.75 | 1.4 |
| Proper palmar digital vein of right ring finger (FJ2358) → Proper palmar digital vein of right middle finger (FJ2357) | 分支入幹 | 0.68 | 1.19 |

## 下肢：間隙大於管徑一半（108）

| 血管對（上游 → 下一段） | 類型 | 間隙 (mm) | 管徑 (mm) |
| --- | --- | ---: | ---: |
| Right anterior tibial artery (FJ2130) → Right posterior tibial artery (FJ2172) | 分支入幹 | 42.38 | 2.45 |
| Left small saphenous vein (FJ2121) → Left genicular vein (FJ2107) | 分支入幹 | 38.27 | 4.76 |
| Right anterior tibial vein (FJ2193) → Right fibular vein (FJ2200) | 分支入幹 | 36.86 | 3.32 |
| Right lateral circumflex femoral vein (FJ2201) → Right deep femoral vein (FJ2135) | 分支入幹 | 36.18 | 3.9 |
| Left small saphenous vein (FJ2121) → Left genicular vein (FJ2107) | 分支入幹 | 36.09 | 3.66 |
| Right genicular vein (FJ2151) → Right anterior tibial vein (FJ2132) | 分支入幹 | 34.78 | 2.63 |
| Right small saphenous vein (FJ2176) → Right genicular vein (FJ2151) | 分支入幹 | 34.7 | 4.76 |
| Right anterior tibial artery (FJ2130) → Right anterior tibial recurrent artery (FJ2131) | 分支入幹 | 32.11 | 5.51 |
| Right anterior tibial vein (FJ2193) → Right fibular vein (FJ2200) | 分支入幹 | 31.98 | 4.23 |
| Left genicular vein (FJ2108) → Left great saphenous vein (FJ2103) | 分支入幹 | 31.92 | 1.39 |
| Left lateral circumflex femoral vein (FJ2188) → Left deep femoral vein (FJ2099) | 分支入幹 | 31.34 | 3.93 |
| Right posterior tibial artery (FJ2172) → Set of dorsal digital arteries (FJ2197) | 分支入幹 | 30.05 | 1.42 |
| Left anterior tibial artery (FJ2065) → Left popliteal artery (FJ2086) | 分支入幹 | 29.73 | 3.32 |
| Left fibular vein (FJ2187) → Left posterior tibial vein (FJ2118) | 分支入幹 | 28.91 | 4.94 |
| Left anterior tibial artery (FJ2065) → Left fibular artery (PK-103) | 分支入幹 | 28.57 | 4.94 |
| Left lateral circumflex femoral vein (FJ2188) → Left medial circumflex femoral vein (FJ2189) | 分支入幹 | 28.45 | 2.99 |
| Descending branch of right lateral circumflex femoral artery (FJ2057) → Set of perforating arteries (FJ2127) | 分支入幹 | 28.26 | 4.57 |
| Left inferior medial genicular artery (FJ2077) → Left anterior tibial recurrent artery (FJ2066) | 分支入幹 | 28.01 | 2.93 |
| Right fibular vein (FJ2200) → Right anterior tibial vein (FJ2193) | 分支入幹 | 27.73 | 5.64 |
| Right genicular vein (FJ2153) → Right anterior tibial vein (FJ2132) | 分支入幹 | 27.54 | 2.19 |
| Right lateral circumflex femoral vein (FJ2201) → Right medial circumflex femoral vein (FJ2202) | 分支入幹 | 26.72 | 2.83 |
| Right superficial medial plantar artery (FJ2179) → Set of plantar digital arteries proper (FJ2205) | 分支入幹 | 26.5 | 1.97 |
| Right lateral circumflex femoral vein (FJ2201) → Right deep femoral vein (FJ2135) | 分支入幹 | 26.39 | 4.38 |
| Right anterior tibial artery (FJ2130) → Right anterior lateral malleolar artery (PK-74) | 分支入幹 | 25.58 | 3 |
| Left anterior tibial recurrent artery (FJ2066) → Left articular branch of descending genicular artery (PK-99) | 分支入幹 | 25.47 | 2.44 |
| Left lateral circumflex femoral vein (FJ2188) → Left deep femoral vein (FJ2099) | 分支入幹 | 25.03 | 4.33 |
| Right lateral circumflex femoral vein (FJ2201) → Right deep femoral vein (FJ2135) | 分支入幹 | 24.77 | 4.23 |
| Right genicular vein (FJ2153) → Right great saphenous vein (FJ2145) | 分支入幹 | 24.45 | 2.35 |
| Left lateral circumflex femoral vein (FJ2188) → Left deep femoral vein (FJ2099) | 分支入幹 | 24.4 | 4.12 |
| Left fibular vein (FJ2187) → Left posterior tibial vein (FJ2118) | 分支入幹 | 24.32 | 4 |
| Right genicular vein (FJ2182) → Right anterior tibial vein (FJ2132) | 分支入幹 | 24.31 | 1.14 |
| Right lateral tarsal artery (FJ2163) → Right arcuate artery (FJ2133) | 分支入幹 | 22.97 | 3.2 |
| Left genicular vein (FJ2125) → Left anterior tibial vein (FJ2097) | 分支入幹 | 22.93 | 1.94 |
| Right posterior tibial vein (FJ2173) → Right anterior tibial vein (FJ2193) | 分支入幹 | 22.74 | 4.12 |
| Descending branch of right lateral circumflex femoral artery (FJ2057) → Right transverse branch of lateral circumflex femoral artery (PK-68) | 分支入幹 | 22.63 | 5.17 |
| Set of plantar digital veins (FJ2175) → Dorsal venous arch of right foot (FJ2062) | 分支入幹 | 22.41 | 1.86 |
| Right inferior medial genicular artery (FJ2152) → Right inferior lateral genicular artery (FJ2150) | 分支入幹 | 21.43 | 2.79 |
| Right genicular vein (FJ2153) → Right anterior tibial vein (FJ2132) | 分支入幹 | 21.08 | 2.12 |
| Right medial circumflex femoral artery (PK-66) → Right lateral circumflex femoral artery (FJ2158) | 分支入幹 | 21 | 2.92 |
| Right deep femoral vein (FJ2135) → Set of perforating veins (FJ2192) | 分支入幹 | 20.7 | 4.32 |
| Left arcuate artery (FJ2067) → Left lateral tarsal artery (FJ2081) | 分支入幹 | 20.29 | 2.9 |
| Right arcuate artery (FJ2133) → Right lateral tarsal artery (FJ2163) | 分支入幹 | 20.13 | 2.92 |
| Left popliteal vein (FJ2117) → Left genicular vein (FJ2125) | 分支入幹 | 19.97 | 3.84 |
| Left posterior tibial artery (FJ2087) → Left fibular artery (PK-103) | 分支入幹 | 19.93 | 3.21 |
| Left articular branch of descending genicular artery (PK-99) → Left anterior tibial recurrent artery (FJ2066) | 分支入幹 | 19.62 | 1.24 |
| Right deep femoral vein (FJ2135) → Set of perforating veins (FJ2192) | 分支入幹 | 19.48 | 2.68 |
| Right superficial medial plantar artery (FJ2179) → Set of plantar digital arteries proper (FJ2205) | 分支入幹 | 18.67 | 1.85 |
| Left genicular vein (FJ2107) → Left anterior tibial vein (FJ2097) | 分支入幹 | 18.65 | 2.53 |
| Left lateral superior genicular artery (FJ2080) → Left popliteal artery (FJ2086) | 分支入幹 | 18.64 | 3.69 |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3571) | 分支入幹 | 18.63 | 3.29 |
| Left lateral superior genicular artery (FJ2080) → Left popliteal artery (FJ2086) | 分支入幹 | 18.39 | 3.73 |
| Right articular branch of descending genicular artery (PK-72) → Right anterior tibial recurrent artery (FJ2131) | 分支入幹 | 18.37 | 1.24 |
| Right genicular vein (FJ2182) → Right popliteal vein (FJ2171) | 分支入幹 | 18.28 | 2.59 |
| Right lateral superior genicular artery (FJ2162) → Right popliteal artery (FJ2170) | 分支入幹 | 18.17 | 3.68 |
| Left anterior tibial recurrent artery (FJ2066) → Left inferior medial genicular artery (FJ2077) | 分支入幹 | 17.62 | 1.39 |
| Left anterior tibial recurrent artery (FJ2066) → Left lateral superior genicular artery (FJ2080) | 分支入幹 | 17.47 | 2.4 |
| Dorsal venous arch of left foot (FJ2059) → Left small saphenous vein (FJ2121) | 分支入幹 | 17.26 | 1.45 |
| Right medial superior genicular artery (FJ2166) → Right popliteal artery (FJ2170) | 分支入幹 | 17.22 | 2.51 |
| Left superficial medial plantar artery (FJ2089) → Left plantar arch (FJ2085) | 分支入幹 | 17.1 | 1.95 |
| Right popliteal vein (FJ2171) → Right femoral vein (FJ2144) | 分支入幹 | 16.91 | 3.98 |
| Left medial circumflex femoral artery (PK-93) → Left femoral artery (FJ2074) | 分支入幹 | 16.75 | 4.37 |
| Left lateral plantar artery (FJ2079) → Left medial plantar artery (FJ2082) | 分支入幹 | 16.16 | 2.07 |
| Set of plantar digital veins (FJ2175) → Plantar venous arch of right foot (FJ2129) | 分支入幹 | 15.79 | 1.99 |
| Left inferior lateral genicular artery (FJ2076) → Left inferior medial genicular artery (FJ2077) | 分支入幹 | 15.55 | 3.4 |
| Left inferior gluteal vein (FJ3513) → Left internal iliac vein (FJ3470) | 分支入幹 | 15.51 | 3.78 |
| Left inferior gluteal vein (FJ3513) → Left internal iliac vein (FJ3470) | 分支入幹 | 15.47 | 3.8 |
| Left descending genicular artery (FJ2069) → Left articular branch of descending genicular artery (PK-99) | 分支入幹 | 15.46 | 3.52 |
| Left genicular vein (FJ2108) → Left great saphenous vein (FJ2103) | 分支入幹 | 15.39 | 2.46 |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2181) | 分支入幹 | 15.39 | 1.78 |
| Right popliteal vein (FJ2171) → Right anterior tibial vein (FJ2193) | 分支入幹 | 14.94 | 3.82 |
| Right popliteal artery (FJ2170) → Right inferior medial genicular artery (FJ2152) | 分支入幹 | 14.43 | 4.11 |
| Left arcuate artery (FJ2067) → Left lateral tarsal artery (FJ2081) | 分支入幹 | 13.97 | 2.81 |
| Set of perforating arteries (FJ2094) → Set of perforating arteries (FJ2090) | 分支入幹 | 13.84 | 2.81 |
| Set of dorsal digital arteries (FJ2093) → Left posterior tibial artery (FJ2087) | 分支入幹 | 13.09 | 2.99 |
| Right popliteal vein (FJ2171) → Right small saphenous vein (FJ2176) | 分支入幹 | 12.83 | 3.68 |
| Right fibular vein (FJ2200) → Right anterior tibial vein (FJ2193) | 分支入幹 | 12.75 | 3.7 |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3572) | 分支入幹 | 12.61 | 2.85 |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2151) | 分支入幹 | 12.57 | 1.78 |
| Right genicular vein (FJ2151) → Right anterior tibial vein (FJ2132) | 分支入幹 | 12.42 | 2.27 |
| Left anterior tibial recurrent artery (FJ2066) → Left anterior tibial artery (FJ2065) | 分支入幹 | 12.34 | 2.24 |
| Left popliteal vein (FJ2117) → Left genicular vein (FJ2125) | 分支入幹 | 11.91 | 3.57 |
| Right fibular vein (FJ2200) → Right anterior tibial vein (FJ2193) | 分支入幹 | 11.08 | 3.71 |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2151) | 分支入幹 | 10.66 | 1.73 |
| Left anterior tibial recurrent artery (FJ2066) → Left inferior lateral genicular artery (FJ2076) | 分支入幹 | 10.18 | 2.34 |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3572) | 分支入幹 | 9.66 | 2.67 |
| Right popliteal artery (FJ2170) → Right anterior tibial artery (FJ2130) | 分支入幹 | 7.76 | 2.83 |
| Left popliteal vein (FJ2117) → Left genicular vein (FJ2107) | 分支入幹 | 7.7 | 6.16 |
| Left obturator vein (FJ3527) → Left external iliac vein (FJ3484) | 分支入幹 | 7.49 | 1.81 |
| Right popliteal artery (FJ2170) → Right inferior medial genicular artery (FJ2152) | 分支入幹 | 7.41 | 3.12 |
| Set of perforating veins (FJ2174) → Plantar metatarsal vein (FJ2207) | 分支入幹 | 7.06 | 1.7 |
| Set of perforating veins (FJ2119) → Plantar metatarsal vein (FJ2191) | 分支入幹 | 6.94 | 1.61 |
| Set of dorsal digital veins (FJ2185) → Set of plantar digital veins (FJ2120) | 分支入幹 | 6.93 | 0.8 |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3572) | 分支入幹 | 6.93 | 2.33 |
| Plantar metatarsal vein (FJ2207) → Set of plantar digital veins (FJ2175) | 分支入幹 | 6.58 | 1.84 |
| Left lateral superior genicular artery (FJ2080) → Left anterior tibial recurrent artery (FJ2066) | 分支入幹 | 6.49 | 2.01 |
| Set of perforating veins (FJ2138) → Right dorsal metatarsal vein (FJ2199) | 分支入幹 | 5.93 | 1.69 |
| Left genicular vein (FJ2124) → Left popliteal vein (FJ2117) | 分支入幹 | 5.78 | 3.61 |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2151) | 分支入幹 | 5.66 | 1.68 |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2151) | 分支入幹 | 5.66 | 1.68 |
| Plantar venous arch of left foot (FJ2128) → Set of perforating veins (FJ2119) | 端接端 | 5.28 | 1.18 |
| Left dorsal metatarsal vein (FJ2186) → Set of perforating veins (FJ2100) | 分支入幹 | 5.22 | 1.26 |
| Left anterior tibial vein (FJ2097) → Left genicular vein (FJ2107) | 分支入幹 | 4.93 | 1.75 |
| Right genicular vein (FJ2153) → Right anterior tibial vein (FJ2132) | 分支入幹 | 4.48 | 1.76 |
| Left deep branch of superior gluteal artery (PK-108) → Left superior gluteal artery (PK-106) | 分支入幹 | 4.06 | 4.82 |
| Right fibular vein (FJ2200) → Right posterior tibial vein (FJ2173) | 分支入幹 | 3.27 | 1.92 |
| Left popliteal vein (FJ2117) → Left genicular vein (FJ2107) | 分支入幹 | 3.17 | 5.75 |
| Left anterior tibial vein (FJ2183) → Left anterior tibial vein (FJ2097) | 分支入幹 | 2.23 | 4.34 |
| Left inferior lateral genicular artery (FJ2076) → Left middle genicular artery (FJ2084) | 分支入幹 | 0.51 | 0.94 |

## 表面圓滑

| 區域 | 動脈／靜脈網格 | 已圓滑（Loop 細分 + 平滑法線） | 未圓滑（超過 3000 個三角形，或形狀由運動資料綁定） |
| --- | ---: | ---: | ---: |
| 上肢 | 148 | 140 | 8 |
| 下肢 | 123 | 110 | 13 |

本步驟新增的橋接管與漸細管：上肢與下肢為 12 邊的圓形斷面、沿管長平滑法線（`scripts/prepare-vessel-ends.mjs`）；其餘區域的連接管維持 5 邊。
