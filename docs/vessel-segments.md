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

## 上肢：修正前（origin/main 的連接管）間隙大於管徑一半（199）

其中 124 個已不再出現（橋接後間隙小於管徑一半，或該末端收成尖端）。

| 血管對（上游 → 下一段） | 類型 | 間隙 (mm) | 管徑 (mm) | 修正後 |
| --- | --- | ---: | ---: | --- |
| Left cephalic vein (FJ2220) → Left anterior circumflex humeral vein (FJ2213) | 分支入幹 | 33.34 | 3.39 | 仍有間隙 |
| Right cephalic vein (FJ2272) → Right lateral brachial vein (PK-56) | 分支入幹 | 32.91 | 4.84 | 仍有間隙 |
| Left cephalic vein (FJ2220) → Left lateral brachial vein (PK-60) | 分支入幹 | 30.96 | 3.81 | 仍有間隙 |
| Left dorsal scapular artery (FJ2232) → Posterior intercostal arteries (FJ1975) | 分支入幹 | 26.95 | 2 | 仍有間隙 |
| Left posterior interosseous vein (PK-62) → Left anterior interosseous vein (PK-61) | 分支入幹 | 25.29 | 2.52 | 仍有間隙 |
| Right anterior circumflex humeral vein (FJ2265) → Right posterior circumflex humeral vein (PK-42) | 分支入幹 | 24.93 | 2.4 | 仍有間隙 |
| Left cephalic vein (FJ2220) → Left anterior circumflex humeral vein (FJ2213) | 分支入幹 | 24.9 | 3.54 | 仍有間隙 |
| Left radial artery (FJ2242) → Left posterior interosseous artery (PK-53) | 分支入幹 | 23.69 | 2.33 | 仍有間隙 |
| Left anterior circumflex humeral vein (FJ2213) → Left cephalic vein (FJ2220) | 分支入幹 | 23.56 | 2.26 | 仍有間隙 |
| Right radial artery (FJ2294) → Right posterior interosseous artery (PK-43) | 分支入幹 | 23.32 | 3.93 | 仍有間隙 |
| Left ulnar artery (FJ2258) → Left anterior interosseous artery (FJ2214) | 分支入幹 | 21.66 | 1.39 | 已解決 |
| Right anterior circumflex humeral vein (FJ2265) → Right posterior circumflex humeral vein (PK-42) | 分支入幹 | 21.56 | 1.6 | 仍有間隙 |
| Left suprascapular vein (FJ2250) → Left posterior segmental vein (FJ2929) | 分支入幹 | 20.5 | 1.71 | 仍有間隙 |
| Left suprascapular artery (FJ2251) → Left second posterior intercostal artery (FJ1974) | 分支入幹 | 19.86 | 1.32 | 仍有間隙 |
| Left ulnar vein (FJ2260) → Left basilic vein (FJ2218) | 端接端 | 19.47 | 3.69 | 仍有間隙 |
| Right ulnar vein (FJ2312) → Right median antebrachial vein (FJ2286) | 端接端 | 19.31 | 3.74 | 已解決 |
| Right anterior circumflex humeral artery (FJ2264) → Right posterior circumflex humeral artery (FJ2292) | 分支入幹 | 19.16 | 2.41 | 仍有間隙 |
| Left cephalic vein (FJ2220) → Left lateral thoracic vein (FJ2233) | 分支入幹 | 18.8 | 4.22 | 仍有間隙 |
| Left radial artery (FJ2242) → Left posterior interosseous artery (PK-53) | 分支入幹 | 18.78 | 1.35 | 仍有間隙 |
| Right recurrent interosseous artery (FJ2297) → Right radial recurrent artery (FJ2295) | 分支入幹 | 18.64 | 2.68 | 仍有間隙 |
| Left anterior circumflex humeral artery (FJ2212) → Left posterior circumflex humeral artery (FJ2240) | 分支入幹 | 18.56 | 2.49 | 仍有間隙 |
| Right ulnar artery (FJ2310) → Right anterior interosseous artery (FJ2266) | 分支入幹 | 18.51 | 3.97 | 仍有間隙 |
| Left median antebrachial vein (FJ2234) → Left basilic vein (FJ2218) | 分支入幹 | 18.44 | 3.39 | 已解決 |
| Right ulnar artery (FJ2310) → Right anterior interosseous artery (FJ2266) | 分支入幹 | 18.42 | 3.97 | 仍有間隙 |
| Left radial artery (FJ2242) → Left superficial palmar arterial arch (FJ2248) | 分支入幹 | 17.91 | 1.6 | 仍有間隙 |
| Right radial artery (FJ2294) → Right posterior interosseous artery (PK-43) | 分支入幹 | 17.86 | 2.2 | 仍有間隙 |
| Left dorsal scapular artery (FJ2232) → Posterior intercostal arteries (FJ1975) | 分支入幹 | 17.79 | 0.91 | 仍有間隙 |
| Right suprascapular vein (FJ2302) → Right circumflex scapular vein (FJ2274) | 分支入幹 | 17.45 | 1.78 | 仍有間隙 |
| Right radial artery (FJ2294) → Right posterior interosseous artery (PK-43) | 分支入幹 | 16.76 | 3.66 | 仍有間隙 |
| Right cephalic vein (FJ2272) → Right radial vein (FJ2296) | 端接端 | 16.73 | 4.34 | 已解決 |
| Dorsal venous network of left hand (FJ2228) → Proper palmar digital vein of left little finger (FJ2319) | 分支入幹 | 16.67 | 3.27 | 已解決 |
| Left basilic vein (FJ2218) → Left lateral brachial vein (PK-60) | 端接端 | 16.3 | 5.33 | 已解決 |
| Left cephalic vein (FJ2220) → Left axillary vein (FJ2217) | 分支入幹 | 16.03 | 5.32 | 已解決 |
| Right ulnar vein (FJ2312) → Right median antebrachial vein (FJ2286) | 端接端 | 15.75 | 3.92 | 已解決 |
| Right circumflex scapular vein (FJ2274) → Right posterior circumflex humeral vein (PK-42) | 分支入幹 | 15.25 | 1.65 | 仍有間隙 |
| Left median antebrachial vein (FJ2234) → Left ulnar vein (FJ2260) | 端接端 | 15.18 | 2.98 | 仍有間隙 |
| Right dorsal scapular artery (FJ2284) → Posterior intercostal arteries (FJ1961) | 分支入幹 | 15.12 | 1.34 | 仍有間隙 |
| Left radial artery (FJ2242) → Left radial recurrent artery (FJ2243) | 端接端 | 15.06 | 4.11 | 已解決 |
| Left radial recurrent artery (FJ2243) → Left radial artery (FJ2242) | 端接端 | 15.03 | 3.54 | 已解決 |
| Left dorsal scapular artery (FJ2232) → Posterior intercostal arteries (FJ1975) | 分支入幹 | 15.01 | 0.87 | 仍有間隙 |
| Right radial vein (FJ2296) → Right cephalic vein (FJ2272) | 分支入幹 | 14.85 | 2.42 | 仍有間隙 |
| Left cephalic vein (FJ2220) → Left radial vein (FJ2244) | 分支入幹 | 14.73 | 2.96 | 已解決 |
| Left anterior interosseous vein (PK-61) → Left median antebrachial vein (FJ2234) | 分支入幹 | 14.6 | 1.36 | 仍有間隙 |
| Right anterior interosseous vein (PK-57) → Right median antebrachial vein (FJ2286) | 分支入幹 | 14.5 | 1.36 | 仍有間隙 |
| Left radial recurrent artery (FJ2243) → Left recurrent interosseous artery (FJ2245) | 端接端 | 14.46 | 3.47 | 已解決 |
| Right cephalic vein (FJ2272) → Right median cubital vein (FJ2287) | 端接端 | 14.16 | 3.57 | 已解決 |
| Set of dorsal metacarpal arteries (FJ2348) → Left palmar metacarpal artery (FJ2237) | 分支入幹 | 13.82 | 1.46 | 已解決 |
| Left suprascapular vein (FJ2250) → Left subclavian vein (FJ3486) | 分支入幹 | 13.62 | 1.76 | 仍有間隙 |
| Left ulnar artery (FJ2258) → Left anterior interosseous artery (FJ2214) | 分支入幹 | 13.49 | 3.96 | 已解決 |
| Left ulnar vein (FJ2260) → Left basilic vein (FJ2218) | 分支入幹 | 13.49 | 2.25 | 仍有間隙 |
| Dorsal venous network of left hand (FJ2228) → Proper palmar digital vein of left middle finger (FJ2326) | 端接端 | 13.26 | 3.45 | 已解決 |
| Right deep brachial artery (FJ2277) → Right brachial artery (FJ2271) | 分支入幹 | 13.26 | 2.4 | 仍有間隙 |
| Right arteria radialis indicis (FJ2342) → Set of dorsal digital arteries (FJ2346) | 分支入幹 | 13.24 | 1.78 | 仍有間隙 |
| Right axillary vein (FJ2269) → Right lateral brachial vein (PK-56) | 端接端 | 13.19 | 3.8 | 已解決 |
| Right superior ulnar collateral artery (FJ2373) → Right posterior ulnar recurrent artery (FJ2293) | 分支入幹 | 12.99 | 1.44 | 仍有間隙 |
| Left superficial palmar venous arch (FJ2249) → Left deep palmar venous arch (FJ2229) | 分支入幹 | 12.94 | 1.67 | 仍有間隙 |
| Pectoral branch of right thoraco-acromial artery (FJ2361) → Right lateral thoracic artery (FJ1938) | 端接端 | 12.91 | 4.11 | 仍有間隙 |
| Right ulnar vein (FJ2312) → Right median antebrachial vein (FJ2286) | 端接端 | 12.74 | 3.35 | 已解決 |
| Right inferior ulnar collateral artery (FJ2267) → Right brachial artery (FJ2271) | 分支入幹 | 12.64 | 1.56 | 仍有間隙 |
| Right axillary artery (FJ2268) → Right posterior circumflex humeral artery (FJ2291) | 端接端 | 12.39 | 3.54 | 已解決 |
| Right superior ulnar collateral artery (FJ2373) → Right brachial artery (FJ2271) | 分支入幹 | 12.19 | 2.57 | 仍有間隙 |
| Left basilic vein (FJ2218) → Left lateral brachial vein (PK-60) | 端接端 | 12.01 | 4.02 | 已解決 |
| Proper palmar digital vein of left little finger (FJ2319) → Proper palmar digital vein of left little finger (FJ2321) | 分支入幹 | 12 | 1.74 | 仍有間隙 |
| Left circumflex scapular artery (FJ2221) → Left posterior circumflex humeral artery (FJ2239) | 分支入幹 | 11.96 | 1.84 | 已解決 |
| Right anterior circumflex humeral vein (FJ2265) → Right posterior circumflex humeral vein (PK-42) | 分支入幹 | 11.91 | 3.81 | 仍有間隙 |
| Right axillary artery (FJ2268) → Right thoracodorsal artery (FJ2305) | 端接端 | 11.83 | 5.6 | 已解決 |
| Right anterior circumflex humeral artery (FJ2264) → Right posterior circumflex humeral artery (FJ2292) | 端接端 | 11.57 | 1.94 | 仍有間隙 |
| Dorsal venous network of left hand (FJ2228) → Proper palmar digital vein of left middle finger (FJ2340) | 端接端 | 11.39 | 3.27 | 已解決 |
| Left anterior circumflex humeral vein (FJ2213) → Left cephalic vein (FJ2220) | 端接端 | 11.32 | 4.86 | 仍有間隙 |
| Right basilic vein (FJ2270) → Right medial brachial vein (FJ2341) | 分支入幹 | 11.17 | 4.65 | 已解決 |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral thoracic artery (FJ1976) | 端接端 | 10.78 | 4.11 | 仍有間隙 |
| Set of dorsal metacarpal arteries (FJ2348) → Set of dorsal digital arteries (FJ2318) | 分支入幹 | 10.78 | 1.95 | 仍有間隙 |
| Proper palmar digital vein of left little finger (FJ2329) → Proper palmar digital vein of left ring finger (FJ2328) | 分支入幹 | 10.6 | 0.96 | 仍有間隙 |
| Left lateral brachial vein (PK-60) → Left basilic vein (FJ2218) | 端接端 | 10.31 | 4.19 | 已解決 |
| Right anterior circumflex humeral vein (FJ2265) → Right axillary vein (FJ2269) | 分支入幹 | 10.1 | 4.53 | 已解決 |
| Left median cubital vein (FJ2235) → Left cephalic vein (FJ2220) | 端接端 | 10.07 | 2.57 | 已解決 |
| Dorsal venous network of right hand (FJ2280) → Proper palmar digital vein of right little finger (FJ2351) | 端接端 | 10.07 | 2.14 | 已解決 |
| Left axillary artery (FJ2216) → Deltoid branch of left thoraco-acromial artery (PKC-313) | 端接端 | 9.92 | 5.65 | 已解決 |
| Proper palmar digital vein of left middle finger (FJ2326) → Proper palmar digital vein of left index finger (FJ2325) | 分支入幹 | 9.89 | 1.35 | 已解決 |
| Left anterior circumflex humeral artery (FJ2212) → Left posterior circumflex humeral artery (FJ2240) | 端接端 | 9.72 | 1.82 | 仍有間隙 |
| Left axillary artery (FJ2216) → Left circumflex scapular artery (FJ2221) | 端接端 | 9.6 | 4.94 | 已解決 |
| Right axillary artery (FJ2268) → Acromial branch of right thoraco-acromial artery (FJ2263) | 端接端 | 9.52 | 5.26 | 已解決 |
| Left lateral brachial vein (PK-60) → Left medial brachial vein (FJ2313) | 分支入幹 | 9.4 | 2.9 | 仍有間隙 |
| Right axillary vein (FJ2269) → Right posterior circumflex humeral vein (PK-42) | 端接端 | 9.3 | 3.81 | 已解決 |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral mammary artery (PK-8) | 分支入幹 | 9.16 | 2.14 | 仍有間隙 |
| Right fourth common palmar digital artery (FJ2370) → Set of dorsal digital arteries (FJ2346) | 分支入幹 | 8.93 | 1.39 | 仍有間隙 |
| Right radial vein (FJ2296) → Right cephalic vein (FJ2272) | 分支入幹 | 8.92 | 1.41 | 仍有間隙 |
| Right dorsal scapular artery (FJ2284) → Posterior intercostal arteries (FJ1961) | 分支入幹 | 8.82 | 1.48 | 仍有間隙 |
| Radial collateral branch of left deep brachial artery (FJ2261) → Middle collateral branch of left deep brachial artery (FJ2331) | 端接端 | 8.8 | 3.3 | 已解決 |
| Left radial vein (FJ2244) → Left palmar metacarpal vein (FJ2320) | 端接端 | 8.73 | 1.2 | 已解決 |
| Right ulnar artery (FJ2310) → Right recurrent interosseous artery (FJ2297) | 端接端 | 8.56 | 4.09 | 已解決 |
| Middle collateral branch of left deep brachial artery (FJ2331) → Left radial recurrent artery (FJ2243) | 端接端 | 8.44 | 3.24 | 已解決 |
| Proper palmar digital vein of right middle finger (FJ2356) → Proper palmar digital vein of right index finger (FJ2355) | 分支入幹 | 8.42 | 1.31 | 已解決 |
| Right median cubital vein (FJ2287) → Right cephalic vein (FJ2272) | 端接端 | 8.32 | 4.08 | 已解決 |
| Middle collateral branch of left deep brachial artery (FJ2331) → Left radial recurrent artery (FJ2243) | 端接端 | 8.32 | 3.2 | 已解決 |
| Right superficial palmar arterial arch (FJ2300) → Right palmar metacarpal artery (FJ2289) | 端接端 | 8.09 | 2.4 | 已解決 |
| Right superficial palmar venous arch (FJ2301) → Proper palmar digital vein of right little finger (FJ2351) | 端接端 | 7.92 | 1.75 | 已解決 |
| Right deep brachial artery (FJ2277) → Right deep brachial artery (PKC-314) | 端接端 | 7.78 | 3.94 | 已解決 |
| Left circumflex scapular artery (FJ2221) → Left axillary artery (FJ2216) | 端接端 | 7.66 | 2.08 | 仍有間隙 |
| Left palmar metacarpal artery (FJ2237) → Left third common palmar digital artery (FJ2317) | 端接端 | 7.61 | 1.52 | 已解決 |
| Left anterior interosseous artery (FJ2214) → Left common interosseous artery (FJ2223) | 端接端 | 7.57 | 2.48 | 已解決 |
| Right anterior interosseous artery (FJ2266) → Right common interosseous artery (FJ2275) | 端接端 | 7.48 | 2.44 | 已解決 |
| Left median cubital vein (FJ2235) → Left basilic vein (FJ2218) | 分支入幹 | 7.47 | 4.11 | 已解決 |
| Dorsal venous network of right hand (FJ2280) → Right palmar metacarpal vein (FJ2290) | 端接端 | 7.43 | 3.36 | 已解決 |
| Right median cubital vein (FJ2287) → Right lateral brachial vein (PK-56) | 端接端 | 7.34 | 4.14 | 已解決 |
| Right posterior circumflex humeral vein (PK-42) → Right anterior circumflex humeral vein (FJ2265) | 分支入幹 | 7.23 | 2.47 | 仍有間隙 |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Acromial branch of left thoraco-acromial artery (FJ2211) | 端接端 | 7.16 | 3.72 | 已解決 |
| Proper palmar digital vein of left middle finger (FJ2326) → Proper palmar digital vein of left index finger (FJ2325) | 分支入幹 | 6.97 | 1.45 | 已解決 |
| Pectoral branch of left thoraco-acromial artery (FJ2330) → Left lateral mammary artery (PK-8) | 分支入幹 | 6.92 | 1.49 | 仍有間隙 |
| Lateral proper palmar digital artery of left middle finger (FJ2334) → Medial proper palmar digital artery of left index finger (FJ2333) | 分支入幹 | 6.84 | 1.47 | 仍有間隙 |
| Dorsal venous network of left hand (FJ2228) → Left palmar metacarpal vein (FJ2238) | 分支入幹 | 6.76 | 3.26 | 仍有間隙 |
| Right axillary artery (FJ2268) → Acromial branch of right thoraco-acromial artery (FJ2263) | 端接端 | 6.75 | 5.66 | 已解決 |
| Left medial brachial vein (FJ2313) → Left median cubital vein (FJ2235) | 端接端 | 6.68 | 4.9 | 已解決 |
| Right deep palmar arch (FJ2279) → Right palmar metacarpal artery (FJ2289) | 分支入幹 | 6.67 | 3.12 | 仍有間隙 |
| Right radial vein (FJ2296) → Right cephalic vein (FJ2272) | 端接端 | 6.62 | 2.7 | 仍有間隙 |
| Left radial artery (FJ2242) → Left deep palmar arch (FJ2227) | 端接端 | 6.6 | 2.87 | 已解決 |
| Right superficial palmar arterial arch (FJ2300) → Right deep palmar branch of ulnar artery (PK-45) | 端接端 | 6.6 | 2.84 | 已解決 |
| Left deep palmar arch (FJ2227) → Left superficial palmar arterial arch (FJ2248) | 端接端 | 6.58 | 2.89 | 已解決 |
| Left radial artery (FJ2242) → Left radial recurrent artery (FJ2243) | 端接端 | 6.3 | 4.15 | 已解決 |
| Right basilic vein (FJ2270) → Right median cubital vein (FJ2287) | 端接端 | 6.29 | 5.49 | 已解決 |
| Right median cubital vein (FJ2287) → Right radial vein (FJ2296) | 端接端 | 6.29 | 4.1 | 已解決 |
| Right arteria radialis indicis (FJ2342) → Right arteria radialis indicis (FJ2363) | 端接端 | 6.29 | 1.78 | 已解決 |
| Left median cubital vein (FJ2235) → Left radial vein (FJ2244) | 端接端 | 6.28 | 4.11 | 已解決 |
| Left palmar metacarpal vein (FJ2238) → Left palmar metacarpal vein (FJ2323) | 分支入幹 | 6.14 | 1.72 | 仍有間隙 |
| Left cephalic vein (FJ2220) → Left axillary vein (FJ2217) | 分支入幹 | 5.95 | 5.1 | 已解決 |
| Left radial artery (FJ2242) → Left posterior ulnar recurrent artery (PKC-317) | 端接端 | 5.9 | 4.29 | 已解決 |
| Right median cubital vein (FJ2287) → Right ulnar vein (FJ2312) | 端接端 | 5.9 | 4.12 | 已解決 |
| Right arteria radialis indicis (FJ2342) → Right arteria radialis indicis (FJ2363) | 端接端 | 5.54 | 1.76 | 已解決 |
| Right anterior interosseous artery (FJ2266) → Right common interosseous artery (FJ2275) | 端接端 | 5.53 | 2.57 | 已解決 |
| Left inferior ulnar collateral artery (FJ2215) → Left brachial artery (FJ2219) | 分支入幹 | 5.49 | 2.47 | 仍有間隙 |
| Right posterior interosseous artery (PK-43) → Right anterior interosseous artery (FJ2266) | 端接端 | 5.37 | 1.88 | 已解決 |
| Left cephalic vein (FJ2220) → Left median cubital vein (FJ2235) | 分支入幹 | 5.34 | 4.26 | 已解決 |
| Right medial brachial vein (FJ2341) → Right median cubital vein (FJ2287) | 端接端 | 5.29 | 5.25 | 已解決 |
| Right superficial palmar arterial arch (FJ2300) → Right arteria radialis indicis (FJ2342) | 端接端 | 5.22 | 2.52 | 已解決 |
| Left arteria radialis indicis (FJ2332) → Left arteria radialis indicis (FJ2314) | 端接端 | 5.18 | 1.21 | 已解決 |
| Left recurrent interosseous artery (FJ2245) → Left posterior interosseous artery (PK-53) | 端接端 | 5.12 | 2.23 | 已解決 |
| Left posterior interosseous artery (PK-53) → Left recurrent interosseous artery (FJ2245) | 端接端 | 5.07 | 3.23 | 已解決 |
| Set of dorsal digital arteries (FJ2346) → Set of dorsal metacarpal arteries (FJ2347) | 端接端 | 5.01 | 1.64 | 已解決 |
| Right radial vein (FJ2296) → Right ulnar vein (FJ2312) | 端接端 | 4.77 | 3.92 | 已解決 |
| Left median cubital vein (FJ2235) → Left basilic vein (FJ2218) | 分支入幹 | 4.75 | 4.12 | 已解決 |
| Right palmar metacarpal vein (FJ2290) → Proper palmar digital vein of right little finger (FJ2349) | 分支入幹 | 4.75 | 1.75 | 已解決 |
| Medial proper palmar digital artery of right index finger (FJ2364) → Right first common palmar digital artery (FJ2343) | 端接端 | 4.55 | 1.52 | 已解決 |
| Medial proper palmar digital artery of left index finger (FJ2333) → Left first common palmar digital artery (FJ2315) | 端接端 | 4.52 | 1.61 | 已解決 |
| Left subscapular artery (FJ2246) → Left posterior circumflex humeral artery (FJ2239) | 端接端 | 4.21 | 4.29 | 已解決 |
| Left axillary vein (FJ2217) → Left posterior circumflex humeral vein (PK-52) | 端接端 | 4.14 | 4.69 | 已解決 |
| Left circumflex scapular vein (FJ2222) → Left suprascapular vein (FJ2250) | 分支入幹 | 4.12 | 1.26 | 仍有間隙 |
| Left median antebrachial vein (FJ2234) → Left basilic vein (FJ2218) | 分支入幹 | 4.08 | 3.44 | 已解決 |
| Right palmar metacarpal vein (FJ2290) → Right palmar metacarpal vein (FJ2353) | 分支入幹 | 4.07 | 1.73 | 仍有間隙 |
| Left axillary artery (FJ2216) → Left circumflex scapular artery (FJ2221) | 端接端 | 4.05 | 4.85 | 已解決 |
| Dorsal venous network of left hand (FJ2228) → Left basilic vein (FJ2218) | 端接端 | 4.03 | 3.2 | 已解決 |
| Left basilic vein (FJ2218) → Left median cubital vein (FJ2235) | 端接端 | 3.95 | 5.27 | 已解決 |
| Left superior ulnar collateral artery (FJ2374) → Left brachial artery (FJ2219) | 分支入幹 | 3.74 | 2.76 | 仍有間隙 |
| Right deep brachial artery (FJ2277) → Right deep brachial artery (PKC-314) | 端接端 | 3.71 | 4.03 | 已解決 |
| Left axillary artery (FJ2216) → Trunk of left thoraco-acromial artery (FJ2252) | 端接端 | 3.69 | 4.14 | 已解決 |
| Left posterior circumflex humeral artery (FJ2240) → Left posterior circumflex humeral artery (FJ2239) | 端接端 | 3.68 | 2.03 | 已解決 |
| Left median cubital vein (FJ2235) → Left basilic vein (FJ2218) | 分支入幹 | 3.64 | 4.16 | 已解決 |
| Left lateral brachial vein (PK-60) → Left medial brachial vein (FJ2313) | 端接端 | 3.56 | 3.85 | 仍有間隙 |
| Right anterior circumflex humeral vein (FJ2265) → Right lateral brachial vein (PK-56) | 端接端 | 3.52 | 5.04 | 已解決 |
| Left axillary artery (FJ2216) → Acromial branch of left thoraco-acromial artery (FJ2211) | 端接端 | 3.39 | 4 | 已解決 |
| Left axillary vein (FJ2217) → Left lateral thoracic vein (FJ2233) | 端接端 | 3.28 | 4.22 | 已解決 |
| Left basilic vein (FJ2218) → Left medial brachial vein (FJ2313) | 端接端 | 3.22 | 3.85 | 已解決 |
| Right lateral brachial vein (PK-56) → Right median cubital vein (FJ2287) | 端接端 | 3.03 | 4.14 | 已解決 |
| Right superior ulnar collateral artery (FJ2373) → Right brachial artery (FJ2271) | 分支入幹 | 2.96 | 2.74 | 仍有間隙 |
| Right radial artery (FJ2294) → Right radial recurrent artery (FJ2295) | 分支入幹 | 2.8 | 2.51 | 仍有間隙 |
| Left radial vein (FJ2244) → Left posterior interosseous vein (PK-62) | 端接端 | 2.76 | 3.99 | 已解決 |
| Left posterior circumflex humeral artery (FJ2240) → Left axillary artery (FJ2216) | 端接端 | 2.64 | 1.89 | 已解決 |
| Radial collateral branch of left deep brachial artery (FJ2261) → Left radial recurrent artery (FJ2243) | 端接端 | 2.63 | 3.25 | 已解決 |
| Left first common palmar digital artery (FJ2315) → Lateral proper palmar digital artery of left middle finger (FJ2334) | 端接端 | 2.58 | 1.76 | 已解決 |
| Right ulnar vein (FJ2312) → Right radial vein (FJ2296) | 端接端 | 2.56 | 2.05 | 已解決 |
| Right radial artery (FJ2294) → Right superficial palmar branch of radial artery (PK-44) | 端接端 | 2.43 | 1.19 | 仍有間隙 |
| Middle collateral branch of left deep brachial artery (FJ2331) → Left recurrent interosseous artery (FJ2245) | 分支入幹 | 2.41 | 1.73 | 已解決 |
| Right superior ulnar collateral artery (FJ2373) → Right brachial artery (FJ2271) | 分支入幹 | 2.38 | 2.73 | 仍有間隙 |
| Right ulnar artery (FJ2310) → Right posterior ulnar recurrent artery (PKC-316) | 分支入幹 | 2.33 | 4.24 | 已解決 |
| Left deep brachial artery (FJ2225) → Left brachial artery (FJ2219) | 分支入幹 | 2.31 | 3.92 | 已解決 |
| Left circumflex scapular artery (FJ2221) → Left axillary artery (FJ2216) | 端接端 | 2.14 | 2.32 | 仍有間隙 |
| Left deep palmar arch (FJ2227) → Left palmar metacarpal artery (FJ2237) | 分支入幹 | 2.11 | 2.94 | 已解決 |
| Left lateral brachial vein (PK-60) → Left radial vein (FJ2244) | 端接端 | 2.1 | 4.13 | 已解決 |
| Radial collateral branch of left deep brachial artery (FJ2261) → Middle collateral branch of left deep brachial artery (FJ2331) | 端接端 | 2 | 2.38 | 已解決 |
| Left posterior circumflex humeral artery (FJ2240) → Left anterior circumflex humeral artery (FJ2212) | 端接端 | 1.95 | 1.19 | 已解決 |
| Right circumflex scapular artery (FJ2273) → Right subscapular artery (FJ2298) | 端接端 | 1.92 | 1.52 | 已解決 |
| Right inferior ulnar collateral artery (FJ2267) → Right brachial artery (FJ2271) | 分支入幹 | 1.83 | 2.69 | 仍有間隙 |
| Middle collateral branch of left deep brachial artery (FJ2331) → Radial collateral branch of left deep brachial artery (FJ2261) | 分支入幹 | 1.79 | 3.23 | 已解決 |
| Right fourth common palmar digital artery (FJ2370) → Right superficial palmar arterial arch (FJ2300) | 分支入幹 | 1.68 | 1.65 | 已解決 |
| Medial proper palmar digital artery of right ring finger (FJ2369) → Set of dorsal digital arteries (FJ2346) | 分支入幹 | 1.67 | 0.8 | 已解決 |
| Left superficial palmar arterial arch (FJ2248) → Left deep palmar branch of ulnar artery (PK-55) | 端接端 | 1.63 | 2.87 | 已解決 |
| Right superficial palmar arterial arch (FJ2300) → Right deep palmar arch (FJ2279) | 分支入幹 | 1.59 | 2.82 | 已解決 |
| Left superficial palmar arterial arch (FJ2248) → Left palmar metacarpal artery (FJ2237) | 端接端 | 1.57 | 2.85 | 已解決 |
| Proper palmar digital vein of left little finger (FJ2319) → Common palmar digital vein (FJ2322) | 端接端 | 1.49 | 1.76 | 已解決 |
| Left posterior circumflex humeral artery (FJ2239) → Left posterior circumflex humeral artery (FJ2240) | 端接端 | 1.48 | 1.87 | 已解決 |
| Left posterior circumflex humeral artery (FJ2240) → Left posterior circumflex humeral artery (FJ2239) | 端接端 | 1.36 | 1.87 | 已解決 |
| Right first common palmar digital artery (FJ2343) → Right superficial palmar arterial arch (FJ2300) | 端接端 | 1.34 | 1.75 | 已解決 |
| Right posterior circumflex humeral artery (FJ2291) → Right anterior circumflex humeral artery (FJ2264) | 端接端 | 1.25 | 1.35 | 已解決 |
| Radial collateral branch of right deep brachial artery (FJ2262) → Middle collateral branch of right deep brachial artery (FJ2362) | 端接端 | 1.21 | 2.18 | 已解決 |
| Radial collateral branch of right deep brachial artery (FJ2262) → Middle collateral branch of right deep brachial artery (FJ2362) | 端接端 | 1.21 | 2.18 | 已解決 |
| Radial collateral branch of right deep brachial artery (FJ2262) → Middle collateral branch of right deep brachial artery (FJ2362) | 端接端 | 1.21 | 2.18 | 已解決 |
| Right arteria princeps pollicis (FJ2372) → Set of dorsal digital arteries (FJ2346) | 分支入幹 | 1.19 | 0.8 | 已解決 |
| Clavicular branch of right thoraco-acromial artery (PK-2) → Right axillary artery (FJ2268) | 端接端 | 0.97 | 1.61 | 已解決 |
| Right third common palmar digital artery (FJ2345) → Right palmar metacarpal artery (FJ2289) | 分支入幹 | 0.86 | 1.7 | 仍有間隙 |
| Left posterior ulnar recurrent artery (PKC-317) → Left ulnar artery (FJ2258) | 分支入幹 | 0.6 | 1.19 | 已解決 |

## 下肢：修正前（origin/main 的連接管）間隙大於管徑一半（312）

其中 179 個已不再出現（橋接後間隙小於管徑一半，或該末端收成尖端）。

| 血管對（上游 → 下一段） | 類型 | 間隙 (mm) | 管徑 (mm) | 修正後 |
| --- | --- | ---: | ---: | --- |
| Left small saphenous vein (FJ2121) → Left genicular vein (FJ2107) | 分支入幹 | 38.34 | 4.76 | 仍有間隙 |
| Right anterior tibial vein (FJ2193) → Right fibular vein (FJ2200) | 分支入幹 | 36.86 | 3.32 | 仍有間隙 |
| Descending branch of right lateral circumflex femoral artery (FJ2057) → Set of perforating arteries (FJ2127) | 分支入幹 | 36.81 | 3.01 | 仍有間隙 |
| Right lateral circumflex femoral vein (FJ2201) → Right deep femoral vein (FJ2135) | 分支入幹 | 36.22 | 3.9 | 仍有間隙 |
| Left small saphenous vein (FJ2121) → Left genicular vein (FJ2107) | 分支入幹 | 36.05 | 3.66 | 仍有間隙 |
| Right genicular vein (FJ2151) → Right anterior tibial vein (FJ2132) | 分支入幹 | 34.78 | 2.63 | 仍有間隙 |
| Left genicular vein (FJ2108) → Left great saphenous vein (FJ2103) | 分支入幹 | 34.76 | 2.35 | 仍有間隙 |
| Right small saphenous vein (FJ2176) → Right popliteal vein (FJ2171) | 分支入幹 | 34.73 | 4.76 | 已解決 |
| Left lateral circumflex femoral vein (FJ2188) → Left deep femoral vein (FJ2099) | 分支入幹 | 31.99 | 3.93 | 仍有間隙 |
| Right anterior tibial vein (FJ2193) → Right fibular vein (FJ2200) | 分支入幹 | 31.98 | 4.23 | 仍有間隙 |
| Right anterior tibial artery (FJ2130) → Right anterior tibial recurrent artery (FJ2131) | 分支入幹 | 31.96 | 5.51 | 仍有間隙 |
| Left anterior tibial artery (FJ2065) → Left anterior tibial recurrent artery (FJ2066) | 分支入幹 | 29.78 | 3.32 | 已解決 |
| Left inferior medial genicular artery (FJ2077) → Left popliteal artery (FJ2086) | 分支入幹 | 29.52 | 3.19 | 已解決 |
| Left genicular vein (FJ2124) → Left anterior tibial vein (FJ2097) | 分支入幹 | 28.99 | 2.94 | 已解決 |
| Left fibular vein (FJ2187) → Left posterior tibial vein (FJ2118) | 分支入幹 | 28.91 | 4.94 | 仍有間隙 |
| Left anterior tibial artery (FJ2065) → Left fibular artery (PK-103) | 分支入幹 | 28.57 | 4.94 | 仍有間隙 |
| Left lateral circumflex femoral vein (FJ2188) → Left medial circumflex femoral vein (FJ2189) | 分支入幹 | 28.57 | 2.99 | 仍有間隙 |
| Descending branch of right lateral circumflex femoral artery (FJ2057) → Set of perforating arteries (FJ2127) | 分支入幹 | 28.26 | 4.57 | 仍有間隙 |
| Left inferior medial genicular artery (FJ2077) → Left anterior tibial recurrent artery (FJ2066) | 分支入幹 | 28.01 | 2.93 | 仍有間隙 |
| Right genicular vein (FJ2153) → Right anterior tibial vein (FJ2132) | 分支入幹 | 27.54 | 2.19 | 仍有間隙 |
| Right lateral circumflex femoral vein (FJ2201) → Right medial circumflex femoral vein (FJ2202) | 分支入幹 | 26.84 | 2.83 | 仍有間隙 |
| Right anterior tibial artery (FJ2130) → Right fibular artery (PK-76) | 端接端 | 26.66 | 5.55 | 已解決 |
| Right superficial medial plantar artery (FJ2179) → Set of plantar digital arteries proper (FJ2205) | 分支入幹 | 26.5 | 1.97 | 仍有間隙 |
| Right lateral circumflex femoral vein (FJ2201) → Right deep femoral vein (FJ2135) | 分支入幹 | 26.41 | 4.38 | 仍有間隙 |
| Right anterior tibial artery (FJ2130) → Right anterior lateral malleolar artery (PK-74) | 分支入幹 | 25.58 | 3 | 仍有間隙 |
| Left anterior tibial recurrent artery (FJ2066) → Left articular branch of descending genicular artery (PK-99) | 分支入幹 | 25.47 | 2.44 | 仍有間隙 |
| Left lateral circumflex femoral vein (FJ2188) → Left deep femoral vein (FJ2099) | 分支入幹 | 25.14 | 4.33 | 仍有間隙 |
| Right lateral circumflex femoral vein (FJ2201) → Right deep femoral vein (FJ2135) | 分支入幹 | 24.85 | 4.23 | 仍有間隙 |
| Left lateral circumflex femoral vein (FJ2188) → Left deep femoral vein (FJ2099) | 分支入幹 | 24.71 | 4.12 | 仍有間隙 |
| Right genicular vein (FJ2153) → Right great saphenous vein (FJ2145) | 分支入幹 | 24.45 | 2.35 | 仍有間隙 |
| Left fibular vein (FJ2187) → Left posterior tibial vein (FJ2118) | 分支入幹 | 24.32 | 4 | 仍有間隙 |
| Right genicular vein (FJ2182) → Right anterior tibial vein (FJ2132) | 分支入幹 | 23.93 | 1.48 | 仍有間隙 |
| Left genicular vein (FJ2107) → Left anterior tibial vein (FJ2097) | 分支入幹 | 23.52 | 2.53 | 仍有間隙 |
| Left genicular vein (FJ2125) → Left anterior tibial vein (FJ2097) | 分支入幹 | 22.93 | 1.94 | 仍有間隙 |
| Descending branch of right lateral circumflex femoral artery (FJ2057) → Right transverse branch of lateral circumflex femoral artery (PK-68) | 分支入幹 | 22.63 | 5.17 | 仍有間隙 |
| Right posterior tibial vein (FJ2173) → Right fibular vein (FJ2200) | 分支入幹 | 22.45 | 4.12 | 已解決 |
| Set of plantar digital veins (FJ2175) → Dorsal venous arch of right foot (FJ2062) | 分支入幹 | 22.41 | 1.86 | 仍有間隙 |
| Left genicular vein (FJ2108) → Left great saphenous vein (FJ2103) | 分支入幹 | 22.29 | 2.46 | 仍有間隙 |
| Right lateral tarsal artery (FJ2163) → Right arcuate artery (FJ2133) | 分支入幹 | 22.27 | 3.2 | 仍有間隙 |
| Right fibular vein (FJ2200) → Right posterior tibial vein (FJ2173) | 分支入幹 | 22.19 | 3.7 | 仍有間隙 |
| Right genicular vein (FJ2182) → Right popliteal vein (FJ2171) | 分支入幹 | 22.14 | 2.59 | 仍有間隙 |
| Right lateral tarsal artery (FJ2163) → Right dorsalis pedis artery (FJ2055) | 分支入幹 | 22.05 | 3.24 | 已解決 |
| Right genicular vein (FJ2153) → Right anterior tibial vein (FJ2132) | 分支入幹 | 21.08 | 2.12 | 仍有間隙 |
| Right medial circumflex femoral artery (PK-66) → Right lateral circumflex femoral artery (FJ2158) | 分支入幹 | 20.99 | 2.92 | 仍有間隙 |
| Left posterior tibial artery (FJ2087) → Left fibular artery (PK-103) | 端接端 | 20.72 | 3.66 | 仍有間隙 |
| Right deep femoral vein (FJ2135) → Set of perforating veins (FJ2192) | 分支入幹 | 20.7 | 4.32 | 仍有間隙 |
| Left arcuate artery (FJ2067) → Left lateral tarsal artery (FJ2081) | 分支入幹 | 20.45 | 2.9 | 仍有間隙 |
| Right anterior tibial vein (FJ2193) → Right fibular vein (FJ2200) | 端接端 | 20.26 | 5.46 | 仍有間隙 |
| Right arcuate artery (FJ2133) → Right lateral tarsal artery (FJ2163) | 分支入幹 | 20.13 | 2.92 | 仍有間隙 |
| Left popliteal vein (FJ2117) → Left genicular vein (FJ2125) | 分支入幹 | 20.04 | 3.84 | 仍有間隙 |
| Left anterior tibial recurrent artery (FJ2066) → Left lateral superior genicular artery (FJ2080) | 分支入幹 | 19.99 | 2.4 | 仍有間隙 |
| Left posterior tibial artery (FJ2087) → Left fibular artery (PK-103) | 分支入幹 | 19.93 | 3.21 | 仍有間隙 |
| Left genicular vein (FJ2124) → Left popliteal vein (FJ2117) | 分支入幹 | 19.86 | 3.61 | 仍有間隙 |
| Left dorsalis pedis artery (FJ2073) → Left arcuate artery (FJ2067) | 端接端 | 19.61 | 3.65 | 已解決 |
| Left articular branch of descending genicular artery (PK-99) → Left anterior tibial recurrent artery (FJ2066) | 分支入幹 | 19.61 | 1.24 | 仍有間隙 |
| Right inferior medial genicular artery (FJ2152) → Right inferior lateral genicular artery (FJ2150) | 端接端 | 19.51 | 3.67 | 仍有間隙 |
| Right deep femoral vein (FJ2135) → Set of perforating veins (FJ2192) | 分支入幹 | 19.48 | 2.68 | 仍有間隙 |
| Right superior gluteal vein (FJ3616) → Right inferior gluteal vein (FJ3606) | 分支入幹 | 19.07 | 3.32 | 已解決 |
| Right fibular vein (FJ2200) → Right posterior tibial vein (FJ2173) | 分支入幹 | 18.86 | 3.71 | 仍有間隙 |
| Right superficial medial plantar artery (FJ2179) → Set of plantar digital arteries proper (FJ2205) | 分支入幹 | 18.67 | 1.85 | 仍有間隙 |
| Left popliteal vein (FJ2117) → Left genicular vein (FJ2107) | 端接端 | 18.64 | 4.48 | 仍有間隙 |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3571) | 分支入幹 | 18.63 | 3.29 | 仍有間隙 |
| Left great saphenous vein (FJ2103) → Left genicular vein (FJ2108) | 端接端 | 18.53 | 3.81 | 已解決 |
| Right posterior tibial vein (FJ2173) → Right fibular vein (FJ2200) | 端接端 | 18.47 | 3.39 | 已解決 |
| Left inferior lateral genicular artery (FJ2076) → Left popliteal artery (FJ2086) | 分支入幹 | 18.42 | 3.4 | 已解決 |
| Right articular branch of descending genicular artery (PK-72) → Right anterior tibial recurrent artery (FJ2131) | 分支入幹 | 18.37 | 1.24 | 仍有間隙 |
| Right popliteal artery (FJ2170) → Right inferior medial genicular artery (FJ2152) | 分支入幹 | 18.16 | 4.11 | 仍有間隙 |
| Right popliteal artery (FJ2170) → Right medial superior genicular artery (FJ2166) | 端接端 | 17.8 | 4.16 | 已解決 |
| Left popliteal artery (FJ2086) → Left descending genicular artery (FJ2069) | 端接端 | 17.3 | 3.71 | 已解決 |
| Left superficial medial plantar artery (FJ2089) → Left plantar arch (FJ2085) | 分支入幹 | 17.27 | 1.95 | 仍有間隙 |
| Left popliteal vein (FJ2117) → Left anterior tibial vein (FJ2183) | 端接端 | 17.24 | 5.78 | 已解決 |
| Right popliteal vein (FJ2171) → Right genicular vein (FJ2182) | 端接端 | 17.07 | 5.12 | 已解決 |
| Right popliteal vein (FJ2171) → Right femoral vein (FJ2144) | 分支入幹 | 16.91 | 3.98 | 仍有間隙 |
| Right popliteal vein (FJ2171) → Right anterior tibial vein (FJ2193) | 分支入幹 | 16.78 | 5.95 | 仍有間隙 |
| Left medial circumflex femoral artery (PK-93) → Left femoral artery (FJ2074) | 分支入幹 | 16.75 | 4.37 | 仍有間隙 |
| Right inferior medial genicular artery (FJ2152) → Right anterior tibial recurrent artery (FJ2131) | 端接端 | 16.17 | 2.44 | 已解決 |
| Right inferior lateral genicular artery (FJ2150) → Right popliteal artery (FJ2170) | 端接端 | 16.11 | 3.59 | 已解決 |
| Left popliteal artery (FJ2086) → Left descending genicular artery (FJ2069) | 端接端 | 15.99 | 5.26 | 已解決 |
| Set of plantar digital veins (FJ2175) → Plantar venous arch of right foot (FJ2129) | 分支入幹 | 15.96 | 1.99 | 仍有間隙 |
| Left lateral plantar artery (FJ2079) → Left medial plantar artery (FJ2082) | 分支入幹 | 15.84 | 2.07 | 仍有間隙 |
| Left popliteal artery (FJ2086) → Left inferior medial genicular artery (FJ2077) | 端接端 | 15.53 | 3.11 | 已解決 |
| Left inferior gluteal vein (FJ3513) → Left internal iliac vein (FJ3470) | 分支入幹 | 15.51 | 3.78 | 仍有間隙 |
| Left inferior gluteal vein (FJ3513) → Left internal iliac vein (FJ3470) | 分支入幹 | 15.47 | 3.8 | 仍有間隙 |
| Left descending genicular artery (FJ2069) → Left articular branch of descending genicular artery (PK-99) | 分支入幹 | 15.46 | 3.52 | 仍有間隙 |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2181) | 分支入幹 | 15.39 | 1.78 | 仍有間隙 |
| Left genicular vein (FJ2108) → Left great saphenous vein (FJ2103) | 分支入幹 | 15.16 | 2.54 | 仍有間隙 |
| Right popliteal vein (FJ2171) → Right anterior tibial vein (FJ2193) | 分支入幹 | 14.94 | 3.82 | 仍有間隙 |
| Left popliteal vein (FJ2117) → Left small saphenous vein (FJ2121) | 端接端 | 14.93 | 4.87 | 已解決 |
| Left popliteal vein (FJ2117) → Left genicular vein (FJ2125) | 端接端 | 14.77 | 3.25 | 仍有間隙 |
| Right popliteal vein (FJ2171) → Right femoral vein (FJ2144) | 分支入幹 | 14.67 | 4.35 | 仍有間隙 |
| Left posterior tibial artery (FJ2087) → Set of dorsal digital arteries (FJ2093) | 端接端 | 14.65 | 3.76 | 已解決 |
| Right genicular vein (FJ2181) → Right popliteal vein (FJ2171) | 端接端 | 14.45 | 3.93 | 已解決 |
| Right genicular vein (FJ2151) → Right popliteal vein (FJ2171) | 分支入幹 | 14.12 | 3.4 | 已解決 |
| Left arcuate artery (FJ2067) → Left lateral tarsal artery (FJ2081) | 分支入幹 | 14.06 | 2.81 | 仍有間隙 |
| Set of dorsal digital arteries (FJ2093) → Left posterior tibial artery (FJ2087) | 分支入幹 | 13.94 | 3.13 | 仍有間隙 |
| Right genicular vein (FJ2182) → Right popliteal vein (FJ2171) | 端接端 | 13.94 | 2.67 | 仍有間隙 |
| Left popliteal artery (FJ2086) → Left lateral superior genicular artery (FJ2080) | 端接端 | 13.89 | 4.93 | 已解決 |
| Set of perforating arteries (FJ2094) → Set of perforating arteries (FJ2090) | 分支入幹 | 13.84 | 2.81 | 仍有間隙 |
| Left popliteal vein (FJ2117) → Left anterior tibial vein (FJ2097) | 端接端 | 13.79 | 5.91 | 已解決 |
| Right popliteal vein (FJ2171) → Right small saphenous vein (FJ2176) | 分支入幹 | 13.76 | 3.68 | 仍有間隙 |
| Left anterior tibial vein (FJ2097) → Left genicular vein (FJ2107) | 分支入幹 | 13.75 | 1.75 | 仍有間隙 |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3571) | 分支入幹 | 13.72 | 3.56 | 仍有間隙 |
| Left inferior medial genicular artery (FJ2077) → Left anterior tibial recurrent artery (FJ2066) | 端接端 | 13.4 | 2.4 | 仍有間隙 |
| Right genicular vein (FJ2182) → Right anterior tibial vein (FJ2132) | 端接端 | 13.13 | 2.08 | 仍有間隙 |
| Right popliteal artery (FJ2170) → Right lateral superior genicular artery (FJ2162) | 端接端 | 13.09 | 5.21 | 已解決 |
| Left inferior lateral genicular artery (FJ2076) → Left middle genicular artery (FJ2084) | 分支入幹 | 13 | 2.39 | 仍有間隙 |
| Right lateral tarsal artery (FJ2163) → Right dorsalis pedis artery (FJ2055) | 端接端 | 12.69 | 3.37 | 已解決 |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3572) | 分支入幹 | 12.61 | 2.85 | 仍有間隙 |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2151) | 分支入幹 | 12.57 | 1.78 | 仍有間隙 |
| Right genicular vein (FJ2151) → Right anterior tibial vein (FJ2132) | 分支入幹 | 12.4 | 2.27 | 仍有間隙 |
| Right superior gluteal artery (PK-79) → Right superficial branch of superior gluteal artery (PK-80) | 分支入幹 | 12.4 | 5.45 | 已解決 |
| Left small saphenous vein (FJ2121) → Left popliteal vein (FJ2117) | 端接端 | 12.35 | 3.21 | 已解決 |
| Left anterior tibial recurrent artery (FJ2066) → Left anterior tibial artery (FJ2065) | 分支入幹 | 12.34 | 2.24 | 仍有間隙 |
| Right anterior tibial artery (FJ2130) → Right anterior medial malleolar artery (PK-75) | 端接端 | 12.13 | 3.49 | 已解決 |
| Left popliteal vein (FJ2117) → Left genicular vein (FJ2125) | 分支入幹 | 12.06 | 3.57 | 仍有間隙 |
| Left genicular vein (FJ2124) → Left popliteal vein (FJ2117) | 端接端 | 12.04 | 3.72 | 仍有間隙 |
| Set of perforating arteries (FJ2203) → Right superficial external pudendal artery (PK-70) | 端接端 | 11.95 | 5.68 | 已解決 |
| Right inferior lateral genicular artery (FJ2150) → Right middle genicular artery (FJ2167) | 分支入幹 | 11.87 | 3.17 | 已解決 |
| Right fibular artery (PK-76) → Right posterior tibial artery (FJ2172) | 端接端 | 11.65 | 3.93 | 已解決 |
| Left medial circumflex femoral artery (PK-93) → Left femoral artery (FJ2074) | 分支入幹 | 11.47 | 4.49 | 仍有間隙 |
| Right popliteal artery (FJ2170) → Right medial superior genicular artery (FJ2166) | 端接端 | 11.38 | 4.85 | 已解決 |
| Left genicular vein (FJ2107) → Left anterior tibial vein (FJ2097) | 端接端 | 11.37 | 2.2 | 仍有間隙 |
| Left superior gluteal artery (PK-106) → Left deep branch of superior gluteal artery (PK-108) | 端接端 | 11.17 | 5.44 | 已解決 |
| Right small saphenous vein (FJ2176) → Right popliteal vein (FJ2171) | 端接端 | 11.15 | 4.42 | 已解決 |
| Right anterior tibial vein (FJ2132) → Right anterior tibial vein (FJ2193) | 分支入幹 | 10.97 | 1.34 | 已解決 |
| Right descending genicular artery (FJ2137) → Right medial superior genicular artery (FJ2166) | 端接端 | 10.97 | 2.7 | 已解決 |
| Left deep femoral artery (PK-91) → Set of perforating arteries (FJ2094) | 端接端 | 10.85 | 5.24 | 已解決 |
| Left fibular artery (PK-103) → Set of dorsal digital arteries (FJ2093) | 端接端 | 10.81 | 3.99 | 已解決 |
| Left anterior tibial artery (FJ2065) → Left anterior medial malleolar artery (PK-102) | 端接端 | 10.8 | 3.8 | 已解決 |
| Right superior gluteal artery (PK-79) → Right internal pudendal artery (PK-83) | 端接端 | 10.77 | 5.54 | 已解決 |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2151) | 分支入幹 | 10.75 | 1.73 | 仍有間隙 |
| Right superior gluteal artery (PK-79) → Right inferior gluteal artery (PK-82) | 端接端 | 10.71 | 5.71 | 已解決 |
| Right inferior lateral genicular artery (FJ2150) → Right middle genicular artery (FJ2167) | 端接端 | 10.63 | 2.24 | 已解決 |
| Left deep femoral artery (PK-91) → Set of perforating arteries (FJ2094) | 端接端 | 10.62 | 5.17 | 已解決 |
| Right popliteal vein (FJ2171) → Right anterior tibial vein (FJ2193) | 端接端 | 10.48 | 3.88 | 仍有間隙 |
| Left superior gluteal artery (PK-106) → Left internal pudendal artery (PK-110) | 端接端 | 10.43 | 5.53 | 已解決 |
| Left descending genicular artery (FJ2069) → Left medial superior genicular artery (FJ2083) | 端接端 | 10.42 | 2.66 | 已解決 |
| Left descending genicular artery (FJ2069) → Left medial superior genicular artery (FJ2083) | 端接端 | 10.4 | 2.64 | 已解決 |
| Right popliteal artery (FJ2170) → Right inferior medial genicular artery (FJ2152) | 分支入幹 | 10.4 | 3.12 | 仍有間隙 |
| Right deep femoral vein (FJ2135) → Set of perforating veins (FJ2192) | 分支入幹 | 10.36 | 2.8 | 仍有間隙 |
| Right small saphenous vein (FJ2176) → Right popliteal vein (FJ2171) | 端接端 | 10.29 | 4.57 | 已解決 |
| Right lateral plantar artery (FJ2159) → Right medial plantar artery (FJ2164) | 端接端 | 10.23 | 2.13 | 已解決 |
| Left anterior tibial recurrent artery (FJ2066) → Left inferior lateral genicular artery (FJ2076) | 分支入幹 | 10.18 | 2.34 | 仍有間隙 |
| Descending branch of right lateral circumflex femoral artery (FJ2057) → Right lateral circumflex femoral artery (FJ2158) | 端接端 | 10.09 | 3.68 | 已解決 |
| Left fibular artery (PK-103) → Set of dorsal digital arteries (FJ2093) | 端接端 | 10.08 | 3.49 | 已解決 |
| Tributary of plantar venous arch (FJ2115) → Left posterior tibial vein (FJ2118) | 端接端 | 9.66 | 2.28 | 已解決 |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3572) | 分支入幹 | 9.66 | 2.67 | 仍有間隙 |
| Left popliteal artery (FJ2086) → Left inferior lateral genicular artery (FJ2076) | 端接端 | 9.49 | 4.34 | 已解決 |
| Set of perforating arteries (FJ2203) → Right deep femoral artery (PK-64) | 端接端 | 9.49 | 4.86 | 已解決 |
| Set of perforating arteries (FJ2203) → Right deep femoral artery (PK-64) | 端接端 | 9.47 | 4.35 | 已解決 |
| Left superior gluteal artery (PK-106) → Left internal iliac artery (FJ3468) | 端接端 | 9.47 | 5.77 | 已解決 |
| Set of dorsal digital arteries (FJ2093) → Left fibular artery (PK-103) | 端接端 | 9.24 | 5.74 | 已解決 |
| Set of perforating arteries (FJ2094) → Left lateral circumflex femoral artery (FJ2078) | 端接端 | 9.2 | 5.27 | 已解決 |
| Left plantar arch (FJ2085) → Left medial plantar artery (FJ2082) | 端接端 | 9.18 | 2.12 | 已解決 |
| Right popliteal artery (FJ2170) → Right inferior lateral genicular artery (FJ2150) | 端接端 | 9.16 | 3.59 | 已解決 |
| Right popliteal vein (FJ2171) → Right femoral vein (FJ2144) | 分支入幹 | 9.14 | 3.44 | 仍有間隙 |
| Left popliteal artery (FJ2086) → Left lateral superior genicular artery (FJ2080) | 端接端 | 8.96 | 5.87 | 已解決 |
| Left fibular artery (PK-103) → Set of dorsal digital arteries (FJ2093) | 端接端 | 8.93 | 3.69 | 已解決 |
| Right fibular vein (FJ2200) → Right posterior tibial vein (FJ2173) | 端接端 | 8.9 | 3.38 | 仍有間隙 |
| Right deep femoral artery (PK-64) → Set of perforating arteries (FJ2203) | 端接端 | 8.78 | 4.98 | 已解決 |
| Right deep femoral artery (PK-64) → Set of perforating arteries (FJ2203) | 分支入幹 | 8.73 | 4.46 | 已解決 |
| Left lateral plantar vein (PK-105) → Left posterior tibial vein (FJ2118) | 端接端 | 8.58 | 3.73 | 已解決 |
| Right lateral plantar vein (PK-78) → Right posterior tibial vein (FJ2173) | 端接端 | 8.56 | 3.73 | 已解決 |
| Left medial plantar artery (FJ2082) → Left posterior tibial artery (FJ2087) | 端接端 | 8.52 | 2.27 | 已解決 |
| Right superior gluteal artery (PK-79) → Right deep branch of superior gluteal artery (PK-81) | 端接端 | 8.48 | 5.81 | 已解決 |
| Left popliteal artery (FJ2086) → Left inferior lateral genicular artery (FJ2076) | 端接端 | 8.44 | 5.71 | 已解決 |
| Left superior gluteal artery (PK-106) → Left deep branch of superior gluteal artery (PK-108) | 端接端 | 8.39 | 5.81 | 已解決 |
| Left great saphenous vein (FJ2103) → Left genicular vein (FJ2108) | 端接端 | 8.32 | 4 | 已解決 |
| Right posterior tibial artery (FJ2172) → Right circumflex fibular artery (PK-77) | 端接端 | 8.25 | 4.01 | 已解決 |
| Left popliteal artery (FJ2086) → Left inferior lateral genicular artery (FJ2076) | 端接端 | 8.2 | 4.26 | 已解決 |
| Right deep femoral artery (PK-64) → Set of perforating arteries (FJ2203) | 分支入幹 | 8.16 | 4.2 | 已解決 |
| Right popliteal vein (FJ2171) → Right genicular vein (FJ2182) | 分支入幹 | 8.11 | 3.65 | 已解決 |
| Left deep femoral artery (PK-91) → Set of perforating arteries (FJ2094) | 分支入幹 | 8.11 | 3.94 | 已解決 |
| Left obturator vein (FJ3527) → Left external iliac vein (FJ3484) | 端接端 | 8.06 | 2.81 | 仍有間隙 |
| Left fibular artery (PK-103) → Set of dorsal digital arteries (FJ2093) | 端接端 | 8.04 | 3.83 | 已解決 |
| Right deep femoral artery (PK-64) → Set of perforating arteries (FJ2203) | 端接端 | 7.92 | 4.79 | 已解決 |
| Right medial plantar artery (FJ2164) → Right posterior tibial artery (FJ2172) | 端接端 | 7.9 | 2.3 | 已解決 |
| Right plantar arch (FJ2169) → Right deep plantar artery (FJ2136) | 端接端 | 7.82 | 2.14 | 已解決 |
| Left descending genicular artery (FJ2069) → Left popliteal artery (FJ2086) | 端接端 | 7.78 | 5.27 | 已解決 |
| Right popliteal artery (FJ2170) → Right middle genicular artery (FJ2167) | 分支入幹 | 7.78 | 3.79 | 已解決 |
| Right popliteal artery (FJ2170) → Right anterior tibial artery (FJ2130) | 分支入幹 | 7.76 | 2.83 | 仍有間隙 |
| Left descending genicular artery (FJ2069) → Left medial superior genicular artery (FJ2083) | 端接端 | 7.66 | 3.04 | 已解決 |
| Tributary of plantar venous arch (FJ2113) → Left posterior tibial vein (FJ2118) | 端接端 | 7.66 | 2.12 | 已解決 |
| Set of perforating arteries (FJ2203) → Right deep femoral artery (PK-64) | 端接端 | 7.6 | 5.02 | 已解決 |
| Left obturator vein (FJ3527) → Left external iliac vein (FJ3484) | 分支入幹 | 7.49 | 1.81 | 仍有間隙 |
| Left posterior tibial artery (FJ2087) → Left circumflex fibular artery (PK-104) | 端接端 | 7.48 | 3.83 | 已解決 |
| Descending branch of right lateral circumflex femoral artery (FJ2057) → Set of perforating arteries (FJ2203) | 端接端 | 7.47 | 3.98 | 已解決 |
| Right descending genicular artery (FJ2137) → Right popliteal artery (FJ2170) | 端接端 | 7.44 | 5.7 | 已解決 |
| Right anterior tibial vein (FJ2193) → Right anterior tibial vein (FJ2132) | 端接端 | 7.35 | 4.29 | 已解決 |
| Left descending genicular artery (FJ2069) → Left medial superior genicular artery (FJ2083) | 分支入幹 | 7.26 | 3.16 | 已解決 |
| Right genicular vein (FJ2182) → Right anterior tibial vein (FJ2132) | 端接端 | 7.22 | 2.07 | 仍有間隙 |
| Set of perforating veins (FJ2174) → Plantar metatarsal vein (FJ2207) | 分支入幹 | 7.06 | 1.7 | 仍有間隙 |
| Left anterior tibial vein (FJ2183) → Left posterior tibial vein (FJ2118) | 分支入幹 | 7.05 | 3.72 | 已解決 |
| Left small saphenous vein (FJ2121) → Left popliteal vein (FJ2117) | 端接端 | 7.03 | 3.56 | 已解決 |
| Right middle genicular artery (FJ2167) → Right popliteal artery (FJ2170) | 端接端 | 7.02 | 3.28 | 已解決 |
| Left anterior tibial vein (FJ2097) → Left genicular vein (FJ2107) | 端接端 | 6.94 | 1.68 | 仍有間隙 |
| Set of perforating veins (FJ2119) → Plantar metatarsal vein (FJ2191) | 分支入幹 | 6.94 | 1.61 | 仍有間隙 |
| Right deep femoral artery (PK-64) → Set of perforating arteries (FJ2203) | 分支入幹 | 6.94 | 3.94 | 已解決 |
| Left popliteal vein (FJ2117) → Left genicular vein (FJ2107) | 端接端 | 6.93 | 5.84 | 仍有間隙 |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3572) | 分支入幹 | 6.93 | 2.33 | 仍有間隙 |
| Right deep femoral artery (PK-64) → Set of perforating arteries (FJ2203) | 端接端 | 6.89 | 5.44 | 已解決 |
| Left fibular vein (FJ2187) → Left posterior tibial vein (FJ2118) | 端接端 | 6.73 | 2.54 | 仍有間隙 |
| Left lateral superior genicular artery (FJ2080) → Left anterior tibial recurrent artery (FJ2066) | 分支入幹 | 6.68 | 2.01 | 仍有間隙 |
| Set of dorsal digital arteries (FJ2197) → Right fibular artery (PK-76) | 端接端 | 6.65 | 5.46 | 已解決 |
| Set of plantar digital veins (FJ2120) → Tributary of plantar venous arch (FJ2113) | 端接端 | 6.61 | 1.89 | 已解決 |
| Plantar metatarsal vein (FJ2207) → Set of plantar digital veins (FJ2175) | 分支入幹 | 6.58 | 1.84 | 仍有間隙 |
| Left dorsalis pedis artery (FJ2073) → Left anterior tibial artery (FJ2065) | 端接端 | 6.57 | 4.77 | 已解決 |
| Left popliteal artery (FJ2086) → Left anterior tibial recurrent artery (FJ2066) | 端接端 | 6.51 | 3.43 | 已解決 |
| Left great saphenous vein (FJ2103) → Left testicular vein (FJ3533) | 端接端 | 6.37 | 3.68 | 已解決 |
| Set of perforating arteries (FJ2203) → Right deep femoral artery (PK-64) | 端接端 | 6.13 | 3.21 | 已解決 |
| Set of perforating arteries (FJ2094) → Left perforating branch of deep femoral artery (PK-92) | 分支入幹 | 6.1 | 4.14 | 已解決 |
| Set of perforating arteries (FJ2203) → Right femoral artery (FJ2143) | 分支入幹 | 5.94 | 3.57 | 已解決 |
| Set of perforating veins (FJ2138) → Right dorsal metatarsal vein (FJ2199) | 分支入幹 | 5.93 | 1.69 | 仍有間隙 |
| Left genicular vein (FJ2107) → Left popliteal vein (FJ2117) | 端接端 | 5.8 | 3.92 | 已解決 |
| Right lateral tarsal artery (FJ2163) → Right dorsalis pedis artery (FJ2055) | 端接端 | 5.8 | 3.41 | 已解決 |
| Left genicular vein (FJ2124) → Left small saphenous vein (FJ2121) | 端接端 | 5.77 | 4.75 | 已解決 |
| Left superior gluteal vein (FJ3531) → Right superior gluteal vein (FJ3616) | 端接端 | 5.77 | 4.85 | 已解決 |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2151) | 分支入幹 | 5.66 | 1.68 | 仍有間隙 |
| Right anterior tibial vein (FJ2132) → Right genicular vein (FJ2151) | 分支入幹 | 5.66 | 1.68 | 仍有間隙 |
| Left popliteal vein (FJ2117) → Left genicular vein (FJ2124) | 端接端 | 5.52 | 3.6 | 已解決 |
| Right lateral superior genicular artery (FJ2162) → Right popliteal artery (FJ2170) | 端接端 | 5.45 | 2.92 | 仍有間隙 |
| Right inferior medial genicular artery (FJ2152) → Right anterior tibial recurrent artery (FJ2131) | 端接端 | 5.33 | 1.99 | 已解決 |
| Left perforating branch of deep femoral artery (PK-92) → Left deep femoral artery (PK-91) | 端接端 | 5.33 | 2.33 | 已解決 |
| Right medial circumflex femoral artery (PK-66) → Right deep femoral artery (PK-64) | 分支入幹 | 4.98 | 4.1 | 已解決 |
| Left medial superior genicular artery (FJ2083) → Left descending genicular artery (FJ2069) | 端接端 | 4.95 | 1.36 | 已解決 |
| Left medial superior genicular artery (FJ2083) → Left lateral superior genicular artery (FJ2080) | 端接端 | 4.91 | 2.73 | 已解決 |
| Left anterior tibial vein (FJ2097) → Left genicular vein (FJ2108) | 端接端 | 4.85 | 2.25 | 已解決 |
| Right superior gluteal artery (PK-79) → Right inferior gluteal artery (PK-82) | 端接端 | 4.83 | 5.48 | 已解決 |
| Set of dorsal digital arteries (FJ2197) → Right fibular artery (PK-76) | 端接端 | 4.8 | 3.11 | 已解決 |
| Right descending genicular artery (FJ2137) → Right medial superior genicular artery (FJ2166) | 分支入幹 | 4.73 | 3.16 | 已解決 |
| Right anterior tibial artery (FJ2130) → Right popliteal artery (FJ2170) | 端接端 | 4.68 | 4.45 | 已解決 |
| Left medial superior genicular artery (FJ2083) → Left descending genicular artery (FJ2069) | 分支入幹 | 4.63 | 1.82 | 已解決 |
| Right superior gluteal artery (PK-79) → Right deep branch of superior gluteal artery (PK-81) | 端接端 | 4.59 | 5.45 | 已解決 |
| Left deep femoral artery (PK-91) → Left perforating branch of deep femoral artery (PK-92) | 端接端 | 4.59 | 5.65 | 已解決 |
| Left popliteal vein (FJ2117) → Left genicular vein (FJ2124) | 分支入幹 | 4.57 | 4.26 | 已解決 |
| Left dorsal metatarsal vein (FJ2186) → Set of dorsal digital veins (FJ2185) | 分支入幹 | 4.51 | 2.68 | 已解決 |
| Right genicular vein (FJ2153) → Right anterior tibial vein (FJ2132) | 分支入幹 | 4.48 | 1.76 | 仍有間隙 |
| Right genicular vein (FJ2153) → Right great saphenous vein (FJ2145) | 端接端 | 4.47 | 2.71 | 仍有間隙 |
| Dorsal venous arch of right foot (FJ2061) → Right dorsal metatarsal vein (FJ2199) | 分支入幹 | 4.45 | 2.68 | 已解決 |
| Descending branch of left lateral circumflex femoral artery (FJ2063) → Set of perforating arteries (FJ2094) | 端接端 | 4.44 | 5.29 | 已解決 |
| Left lateral plantar vein (PK-105) → Set of plantar digital veins (FJ2120) | 端接端 | 4.43 | 2.66 | 已解決 |
| Right descending genicular artery (FJ2137) → Right anterior tibial recurrent artery (FJ2131) | 分支入幹 | 4.4 | 2.56 | 已解決 |
| Left deep femoral artery (PK-91) → Left perforating branch of deep femoral artery (PK-92) | 分支入幹 | 4.37 | 4.61 | 已解決 |
| Right popliteal vein (FJ2171) → Right genicular vein (FJ2181) | 端接端 | 4.27 | 3.18 | 已解決 |
| Left anterior tibial recurrent artery (FJ2066) → Left anterior tibial artery (FJ2065) | 分支入幹 | 4.25 | 2.29 | 仍有間隙 |
| Left anterior tibial recurrent artery (FJ2066) → Left anterior tibial artery (FJ2065) | 分支入幹 | 4.25 | 2.33 | 仍有間隙 |
| Left fibular vein (FJ2187) → Left posterior tibial vein (FJ2118) | 端接端 | 4.25 | 3.61 | 仍有間隙 |
| Right medial plantar artery (FJ2164) → Right superficial medial plantar artery (FJ2179) | 端接端 | 4.21 | 2.1 | 已解決 |
| Left medial circumflex femoral artery (PK-93) → Left femoral artery (FJ2074) | 分支入幹 | 4.14 | 4.78 | 仍有間隙 |
| Right deep femoral artery (PK-64) → Right perforating branch of deep femoral artery (PK-65) | 分支入幹 | 4.12 | 5.34 | 已解決 |
| Left anterior tibial vein (FJ2097) → Left genicular vein (FJ2108) | 端接端 | 4.11 | 1.76 | 已解決 |
| Left popliteal vein (FJ2117) → Left genicular vein (FJ2107) | 端接端 | 4.11 | 3.68 | 仍有間隙 |
| Right anterior tibial artery (FJ2130) → Right dorsalis pedis artery (FJ2055) | 端接端 | 4.05 | 3.56 | 已解決 |
| Left inferior gluteal vein (FJ3513) → Left obturator vein (FJ3527) | 端接端 | 4.03 | 2.83 | 已解決 |
| Plantar venous arch of left foot (FJ2128) → Tributary of plantar venous arch (FJ2113) | 分支入幹 | 3.98 | 2.05 | 已解決 |
| Left anterior tibial artery (FJ2065) → Left anterior tibial recurrent artery (FJ2066) | 端接端 | 3.93 | 4.15 | 已解決 |
| Right popliteal artery (FJ2170) → Right inferior medial genicular artery (FJ2152) | 分支入幹 | 3.73 | 3.62 | 仍有間隙 |
| Right inferior gluteal vein (FJ3606) → Right internal iliac vein (FJ3572) | 端接端 | 3.71 | 3.03 | 仍有間隙 |
| Left popliteal artery (FJ2086) → Left medial superior genicular artery (FJ2083) | 端接端 | 3.68 | 4.6 | 已解決 |
| Right anterior tibial recurrent artery (FJ2131) → Descending branch of right lateral circumflex femoral artery (FJ2057) | 端接端 | 3.68 | 2 | 已解決 |
| Right anterior tibial vein (FJ2193) → Right posterior tibial vein (FJ2173) | 端接端 | 3.64 | 5.05 | 已解決 |
| Right popliteal vein (FJ2171) → Right anterior tibial vein (FJ2193) | 端接端 | 3.62 | 4.69 | 仍有間隙 |
| Plantar venous arch of right foot (FJ2129) → Set of plantar digital veins (FJ2175) | 分支入幹 | 3.46 | 2.11 | 已解決 |
| Right medial superior genicular artery (FJ2166) → Right popliteal artery (FJ2170) | 端接端 | 3.41 | 2.7 | 仍有間隙 |
| Left popliteal artery (FJ2086) → Left inferior lateral genicular artery (FJ2076) | 端接端 | 3.34 | 3.49 | 已解決 |
| Right popliteal vein (FJ2171) → Right femoral vein (FJ2144) | 分支入幹 | 3.34 | 4.48 | 仍有間隙 |
| Right superior gluteal vein (FJ3616) → Median sacral vein (FJ3541) | 端接端 | 3.29 | 5.86 | 已解決 |
| Right descending genicular artery (FJ2137) → Right popliteal artery (FJ2170) | 端接端 | 3.28 | 4.58 | 已解決 |
| Left inferior medial genicular artery (FJ2077) → Left inferior lateral genicular artery (FJ2076) | 端接端 | 3.27 | 4.22 | 已解決 |
| Set of perforating arteries (FJ2094) → Set of perforating arteries (FJ2090) | 分支入幹 | 3.26 | 5.26 | 仍有間隙 |
| Dorsal venous arch of left foot (FJ2059) → Left dorsal metatarsal vein (FJ2186) | 分支入幹 | 3.25 | 2.65 | 已解決 |
| Left anterior tibial artery (FJ2065) → Left anterior medial malleolar artery (PK-102) | 分支入幹 | 3.18 | 5.39 | 已解決 |
| Right plantar arch (FJ2169) → Right deep plantar artery (FJ2136) | 端接端 | 3.17 | 2.02 | 已解決 |
| Right popliteal artery (FJ2170) → Right inferior medial genicular artery (FJ2152) | 分支入幹 | 3.15 | 3.28 | 仍有間隙 |
| Left genicular vein (FJ2107) → Left anterior tibial vein (FJ2097) | 分支入幹 | 3.12 | 1.92 | 仍有間隙 |
| Right anterior tibial vein (FJ2193) → Right posterior tibial vein (FJ2173) | 分支入幹 | 3.12 | 5.71 | 已解決 |
| Left inferior lateral genicular artery (FJ2076) → Left popliteal artery (FJ2086) | 端接端 | 3.08 | 4.02 | 已解決 |
| Dorsal venous arch of right foot (FJ2061) → Right dorsal metatarsal vein (FJ2199) | 端接端 | 3.03 | 2.56 | 已解決 |
| Right superior gluteal vein (FJ3616) → Superior rectal vein (FJ3657) | 端接端 | 3.02 | 5.26 | 已解決 |
| Right deep femoral vein (FJ2135) → Right superficial epigastric vein (FJ2178) | 端接端 | 2.97 | 5.14 | 已解決 |
| Left inferior medial genicular artery (FJ2077) → Left popliteal artery (FJ2086) | 端接端 | 2.94 | 4.34 | 已解決 |
| Right anterior tibial artery (FJ2130) → Right popliteal artery (FJ2170) | 分支入幹 | 2.93 | 5.13 | 已解決 |
| Right descending genicular artery (FJ2137) → Right saphenous branch of descending genicular artery (PK-73) | 分支入幹 | 2.92 | 4.15 | 已解決 |
| Plantar venous arch of right foot (FJ2129) → Plantar metatarsal vein (FJ2207) | 分支入幹 | 2.91 | 2.16 | 已解決 |
| Left popliteal artery (FJ2086) → Left middle genicular artery (FJ2084) | 分支入幹 | 2.89 | 3.76 | 已解決 |
| Dorsal venous arch of right foot (FJ2061) → Right small saphenous vein (FJ2176) | 端接端 | 2.86 | 2.59 | 已解決 |
| Right small saphenous vein (FJ2176) → Right popliteal vein (FJ2171) | 端接端 | 2.83 | 2.95 | 已解決 |
| Left descending genicular artery (FJ2069) → Left anterior tibial recurrent artery (FJ2066) | 分支入幹 | 2.78 | 2.5 | 已解決 |
| Right popliteal artery (FJ2170) → Right anterior tibial artery (FJ2130) | 端接端 | 2.69 | 4.36 | 仍有間隙 |
| Left inferior gluteal vein (FJ3513) → Left internal pudendal vein (FJ3525) | 端接端 | 2.6 | 2.95 | 已解決 |
| Left deep femoral artery (PK-91) → Left perforating branch of deep femoral artery (PK-92) | 分支入幹 | 2.55 | 5.03 | 已解決 |
| Right popliteal vein (FJ2171) → Right anterior tibial vein (FJ2193) | 分支入幹 | 2.54 | 4.66 | 仍有間隙 |
| Plantar venous arch of left foot (FJ2128) → Dorsal venous arch of left foot (FJ2060) | 端接端 | 2.5 | 2.09 | 已解決 |
| Right obturator vein (FJ3612) → Right uterine vein (HRAF-698) | 端接端 | 2.47 | 4.03 | 已解決 |
| Left anterior tibial vein (FJ2183) → Left anterior tibial vein (FJ2097) | 分支入幹 | 2.38 | 4.34 | 仍有間隙 |
| Left posterior tibial vein (FJ2118) → Left anterior tibial vein (FJ2183) | 端接端 | 2.35 | 3.33 | 已解決 |
| Left popliteal vein (FJ2117) → Left genicular vein (FJ2125) | 端接端 | 2.27 | 2.91 | 仍有間隙 |
| Set of perforating arteries (FJ2094) → Descending branch of left lateral circumflex femoral artery (FJ2063) | 分支入幹 | 2.11 | 3.59 | 已解決 |
| Right popliteal artery (FJ2170) → Right middle genicular artery (FJ2167) | 分支入幹 | 2.11 | 3.6 | 已解決 |
| Plantar venous arch of right foot (FJ2129) → Dorsal venous arch of right foot (FJ2062) | 端接端 | 2.08 | 2.08 | 已解決 |
| Right popliteal artery (FJ2170) → Right middle genicular artery (FJ2167) | 端接端 | 2.01 | 3.32 | 已解決 |
| Right genicular vein (FJ2182) → Right popliteal vein (FJ2171) | 分支入幹 | 1.95 | 2.81 | 仍有間隙 |
| Right fibular vein (FJ2200) → Right posterior tibial vein (FJ2173) | 端接端 | 1.9 | 3.55 | 仍有間隙 |
| Right descending genicular artery (FJ2137) → Right inferior medial genicular artery (FJ2152) | 端接端 | 1.89 | 2.42 | 已解決 |
| Right popliteal artery (FJ2170) → Right middle genicular artery (FJ2167) | 分支入幹 | 1.85 | 3.11 | 已解決 |
| Plantar metatarsal artery (FJ2206) → Right plantar arch (FJ2169) | 端接端 | 1.74 | 1.64 | 已解決 |
| Right popliteal artery (FJ2170) → Right medial superior genicular artery (FJ2166) | 端接端 | 1.72 | 3.27 | 已解決 |
| Right anterior tibial recurrent artery (FJ2131) → Right medial superior genicular artery (FJ2166) | 端接端 | 1.57 | 2.53 | 已解決 |
| Right anterior tibial recurrent artery (FJ2131) → Right inferior lateral genicular artery (FJ2150) | 端接端 | 1.4 | 2.66 | 已解決 |
| Right deep plantar artery (FJ2136) → Right dorsalis pedis artery (FJ2055) | 分支入幹 | 1.2 | 2.05 | 已解決 |
| Right medial superior genicular artery (FJ2166) → Right descending genicular artery (FJ2137) | 分支入幹 | 1.04 | 1.89 | 已解決 |
| Left inferior lateral genicular artery (FJ2076) → Left middle genicular artery (FJ2084) | 分支入幹 | 0.46 | 0.88 | 仍有間隙 |

## 上肢：修正後仍大於管徑一半（87）

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

## 下肢：修正後仍大於管徑一半（108）

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

## 沒有下一段的大血管末端（管徑 ≥ 3 mm，未收成尖端）

這些末端附近找不到同類型的下一段：可能是血管進入組織或器官，也可能是圖譜缺少該段血管。**未新增任何血管模型**，只列出供人工對照。

| 血管 | 部位 | 側 | 管徑 (mm) | 末端位置 (m) |
| --- | --- | --- | ---: | --- |
| Dorsal venous network of left hand (FJ2228) | hand | left | 3.3 | 0.233, 0.839, 0.02 |
| Dorsal venous network of left hand (FJ2228) | hand | left | 3.3 | 0.231, 0.827, 0.024 |
| Dorsal venous network of right hand (FJ2280) | hand | right | 3.3 | -0.233, 0.836, 0.021 |
| Dorsal venous network of right hand (FJ2280) | hand | right | 3.1 | -0.282, 0.825, 0.024 |
| Left anterior circumflex humeral artery (FJ2212) | shoulder | left | 5 | 0.156, 1.353, -0.014 |
| Left anterior circumflex humeral artery (FJ2212) | shoulder | left | 5.2 | 0.155, 1.352, -0.017 |
| Left anterior circumflex humeral vein (FJ2213) | shoulder | left | 4.2 | 0.166, 1.364, -0.001 |
| Left axillary vein (FJ2217) | arm | left | 3.6 | 0.127, 1.397, 0.008 |
| Left basilic vein (FJ2218) | forearm | left | 3.3 | 0.174, 1.216, -0.034 |
| Left basilic vein (FJ2218) | forearm | left | 3.6 | 0.176, 1.081, -0.024 |
| Left basilic vein (FJ2218) | forearm | left | 3.9 | 0.175, 1.196, -0.035 |
| Left basilic vein (FJ2218) | forearm | left | 4.4 | 0.192, 1.02, -0.014 |
| Left basilic vein (FJ2218) | forearm | left | 3.5 | 0.177, 1.193, -0.036 |
| Left brachial artery (FJ2219) | arm | left | 4.9 | 0.159, 1.307, -0.02 |
| Left brachial artery (FJ2219) | arm | left | 3.8 | 0.171, 1.278, -0.027 |
| Left cephalic vein (FJ2220) | arm | left | 3.6 | 0.109, 1.402, 0.008 |
| Left cephalic vein (FJ2220) | arm | left | 4.2 | 0.235, 1.079, 0.005 |
| Left cephalic vein (FJ2220) | arm | left | 4.2 | 0.207, 1.28, -0.021 |
| Left cephalic vein (FJ2220) | arm | left | 4.4 | 0.178, 1.351, 0.014 |
| Left cephalic vein (FJ2220) | arm | left | 4.5 | 0.236, 1.088, 0.002 |
| Left cephalic vein (FJ2220) | arm | left | 5 | 0.2, 1.295, -0.018 |
| Left deep brachial artery (FJ2225) | arm | left | 3.2 | 0.19, 1.225, -0.043 |
| Left lateral brachial vein (PK-60) | arm | left | 3.2 | 0.189, 1.219, -0.027 |
| Left median antebrachial vein (FJ2234) | forearm | left | 3.1 | 0.219, 1.047, 0.012 |
| Left median antebrachial vein (FJ2234) | forearm | left | 3.5 | 0.183, 1.083, -0.01 |
| Left median cubital vein (FJ2235) | forearm | left | 4.1 | 0.203, 1.116, -0.009 |
| Left median cubital vein (FJ2235) | forearm | left | 4.1 | 0.191, 1.126, -0.017 |
| Left radial artery (FJ2242) | forearm | left | 4 | 0.256, 1.034, -0.009 |
| Left radial artery (FJ2242) | forearm | left | 3.7 | 0.258, 0.986, -0.012 |
| Left radial artery (FJ2242) | forearm | left | 3.2 | 0.269, 0.909, 0.024 |
| Left radial artery (FJ2242) | forearm | left | 3.7 | 0.256, 1, -0.015 |
| Left radial artery (FJ2242) | forearm | left | 3.6 | 0.26, 0.972, -0.008 |
| Left radial artery (FJ2242) | forearm | left | 4 | 0.253, 1.049, -0.006 |
| Left radial vein (FJ2244) | forearm | left | 4 | 0.221, 1.084, -0.012 |
| Left ulnar artery (FJ2258) | forearm | left | 3.7 | 0.22, 0.977, 0.004 |
| Left ulnar artery (FJ2258) | forearm | left | 4 | 0.215, 1.032, -0.002 |
| Left ulnar artery (FJ2258) | forearm | left | 3.5 | 0.218, 0.98, 0.004 |
| Left ulnar artery (FJ2258) | forearm | left | 3.6 | 0.217, 0.988, 0.002 |
| Middle collateral branch of left deep brachial artery (FJ2331) | arm | left | 3.2 | 0.212, 1.159, -0.046 |
| Middle collateral branch of left deep brachial artery (FJ2331) | arm | left | 3.2 | 0.216, 1.142, -0.047 |
| Pectoral branch of left thoraco-acromial artery (FJ2330) | arm | left | 3.3 | 0.094, 1.392, 0.005 |
| Pectoral branch of left thoraco-acromial artery (FJ2330) | arm | left | 4.4 | 0.098, 1.379, 0.012 |
| Right basilic vein (FJ2270) | forearm | right | 3.7 | -0.182, 1.047, -0.021 |
| Right basilic vein (FJ2270) | forearm | right | 4.2 | -0.177, 1.079, -0.023 |
| Right basilic vein (FJ2270) | forearm | right | 3.7 | -0.157, 1.278, -0.015 |
| Right basilic vein (FJ2270) | forearm | right | 3.2 | -0.181, 1.182, -0.033 |
| Right basilic vein (FJ2270) | forearm | right | 3.6 | -0.218, 0.943, 0.007 |
| Right basilic vein (FJ2270) | forearm | right | 3.6 | -0.218, 0.943, 0.007 |
| Right basilic vein (FJ2270) | forearm | right | 3.7 | -0.177, 1.1, -0.027 |
| Right basilic vein (FJ2270) | forearm | right | 3.8 | -0.154, 1.295, -0.011 |
| Right brachial artery (FJ2271) | arm | right | 4.6 | -0.157, 1.311, -0.018 |
| Right cephalic vein (FJ2272) | arm | right | 4.8 | -0.185, 1.342, 0.012 |
| Right cephalic vein (FJ2272) | arm | right | 4.7 | -0.13, 1.378, 0.031 |
| Right cephalic vein (FJ2272) | arm | right | 5.1 | -0.175, 1.354, 0.016 |
| Right cephalic vein (FJ2272) | arm | right | 5 | -0.111, 1.393, 0.021 |
| Right cephalic vein (FJ2272) | arm | right | 3.6 | -0.274, 0.9, 0.003 |
| Right cephalic vein (FJ2272) | arm | right | 4.9 | -0.203, 1.29, -0.02 |
| Right cephalic vein (FJ2272) | arm | right | 3.6 | -0.198, 1.301, -0.015 |
| Right cephalic vein (FJ2272) | arm | right | 5.2 | -0.188, 1.335, 0.011 |
| Right lateral brachial vein (PK-56) | arm | right | 4.2 | -0.192, 1.186, -0.02 |
| Right lateral brachial vein (PK-56) | arm | right | 3.9 | -0.197, 1.151, -0.019 |
| Right median antebrachial vein (FJ2286) | forearm | right | 3.4 | -0.19, 1.077, -0.001 |
| Right posterior interosseous artery (PK-43) | forearm | right | 3 | -0.226, 1.053, -0.038 |
| Right radial artery (FJ2294) | forearm | right | 3.4 | -0.239, 1.072, -0.006 |
| Right radial artery (FJ2294) | forearm | right | 3.6 | -0.258, 0.985, -0.013 |
| Right radial artery (FJ2294) | forearm | right | 4 | -0.254, 1.048, -0.006 |
| Right radial artery (FJ2294) | forearm | right | 3.8 | -0.257, 1.002, -0.015 |
| Right radial artery (FJ2294) | forearm | right | 3.9 | -0.258, 1.032, -0.01 |
| Right radial artery (FJ2294) | forearm | right | 3.7 | -0.257, 0.993, -0.014 |
| Right radial artery (FJ2294) | forearm | right | 4.1 | -0.25, 1.056, -0.006 |
| Right radial artery (FJ2294) | forearm | right | 3.6 | -0.258, 0.985, -0.013 |
| Right radial artery (FJ2294) | forearm | right | 4 | -0.255, 1.041, -0.008 |
| Right radial recurrent artery (FJ2295) | arm | right | 3.5 | -0.232, 1.142, -0.046 |
| Right ulnar artery (FJ2310) | forearm | right | 3.7 | -0.217, 0.988, 0.002 |
| Right ulnar artery (FJ2310) | forearm | right | 4 | -0.215, 1.036, -0.001 |
| Right ulnar artery (FJ2310) | forearm | right | 4.1 | -0.213, 1.061, -0.016 |
| Right ulnar artery (FJ2310) | forearm | right | 3.7 | -0.219, 0.981, 0.004 |
| Right ulnar artery (FJ2310) | forearm | right | 4 | -0.214, 1.048, -0.008 |
| Right ulnar artery (FJ2310) | forearm | right | 4.2 | -0.213, 1.061, -0.016 |
| Right ulnar artery (FJ2310) | forearm | right | 4.1 | -0.214, 1.036, -0.003 |
| Right ulnar artery (FJ2310) | forearm | right | 3.7 | -0.218, 0.984, 0.003 |
| Right ulnar artery (FJ2310) | forearm | right | 3.7 | -0.22, 0.977, 0.004 |
| Right ulnar vein (FJ2312) | forearm | right | 3.1 | -0.226, 0.96, 0.011 |
| Right ulnar vein (FJ2312) | forearm | right | 3.8 | -0.212, 1.036, 0.001 |
| Right ulnar vein (FJ2312) | forearm | right | 3.7 | -0.213, 1.035, 0.001 |
| Right ulnar vein (FJ2312) | forearm | right | 3.9 | -0.214, 1.018, 0.004 |
| Descending branch of left lateral circumflex femoral artery (FJ2063) | thigh | left | 3.1 | 0.114, 0.798, -0.006 |
| Descending branch of left lateral circumflex femoral artery (FJ2063) | thigh | left | 5.1 | 0.105, 0.82, -0.006 |
| Descending branch of left lateral circumflex femoral artery (FJ2063) | thigh | left | 4.3 | 0.12, 0.724, -0.003 |
| Descending branch of left lateral circumflex femoral artery (FJ2063) | thigh | left | 3.7 | 0.109, 0.808, -0.008 |
| Left anterior tibial artery (FJ2065) | leg | left | 3.7 | 0.094, 0.241, -0.006 |
| Left anterior tibial artery (FJ2065) | leg | left | 3.1 | 0.089, 0.322, -0.006 |
| Left anterior tibial artery (FJ2065) | leg | left | 3.8 | 0.086, 0.152, -0.01 |
| Left anterior tibial artery (FJ2065) | leg | left | 4.2 | 0.095, 0.308, -0.004 |
| Left anterior tibial artery (FJ2065) | leg | left | 5.5 | 0.093, 0.338, -0.007 |
| Left anterior tibial artery (FJ2065) | leg | left | 4.6 | 0.103, 0.36, -0.024 |
| Left anterior tibial artery (FJ2065) | leg | left | 4.4 | 0.093, 0.272, -0.003 |
| Left anterior tibial artery (FJ2065) | leg | left | 3.7 | 0.095, 0.318, -0.007 |
| Left anterior tibial artery (FJ2065) | leg | left | 5 | 0.083, 0.138, -0.007 |
| Left anterior tibial artery (FJ2065) | leg | left | 5.6 | 0.086, 0.157, -0.009 |
| Left anterior tibial vein (FJ2183) | leg | left | 5.5 | 0.101, 0.368, -0.028 |
| Left anterior tibial vein (FJ2183) | leg | left | 3.3 | 0.099, 0.334, -0.012 |
| Left anterior tibial vein (FJ2183) | leg | left | 3.9 | 0.097, 0.314, -0.008 |
| Left anterior tibial vein (FJ2183) | leg | left | 4.6 | 0.093, 0.298, -0.012 |
| Left anterior tibial vein (FJ2183) | leg | left | 5.4 | 0.096, 0.345, -0.022 |
| Left anterior tibial vein (FJ2183) | leg | left | 3.4 | 0.097, 0.291, -0.01 |
| Left anterior tibial vein (FJ2183) | leg | left | 5.2 | 0.099, 0.317, -0.008 |
| Left anterior tibial vein (FJ2183) | leg | left | 3.8 | 0.093, 0.289, -0.013 |
| Left anterior tibial vein (FJ2183) | leg | left | 5.4 | 0.097, 0.341, -0.024 |
| Left anterior tibial vein (FJ2183) | leg | left | 3.1 | 0.097, 0.332, -0.015 |
| Left anterior tibial vein (FJ2183) | leg | left | 4.2 | 0.093, 0.296, -0.012 |
| Left deep branch of superior gluteal artery (PK-108) | hip | left | 3.1 | 0.097, 0.991, -0.068 |
| Left deep femoral artery (PK-91) | thigh | left | 4.7 | 0.066, 0.699, 0.023 |
| Left deep femoral artery (PK-91) | thigh | left | 3.7 | 0.065, 0.673, 0.027 |
| Left deep femoral artery (PK-91) | thigh | left | 4 | 0.073, 0.732, 0.015 |
| Left deep femoral artery (PK-91) | thigh | left | 3.7 | 0.069, 0.709, 0.024 |
| Left deep femoral artery (PK-91) | thigh | left | 5.4 | 0.071, 0.779, 0.02 |
| Left deep femoral vein (FJ2099) | thigh | left | 4.6 | 0.077, 0.732, 0.019 |
| Left deep femoral vein (FJ2099) | thigh | left | 4.1 | 0.075, 0.814, 0.029 |
| Left deep femoral vein (FJ2099) | thigh | left | 3.8 | 0.072, 0.83, 0.028 |
| Left descending genicular artery (FJ2069) | leg | left | 3.7 | 0.041, 0.523, 0.009 |
| Left descending genicular artery (FJ2069) | leg | left | 3 | 0.04, 0.505, 0 |
| Left descending genicular artery (FJ2069) | leg | left | 3.5 | 0.039, 0.516, 0.005 |
| Left descending genicular artery (FJ2069) | leg | left | 3.8 | 0.044, 0.485, -0.004 |
| Left descending genicular artery (FJ2069) | leg | left | 4.2 | 0.042, 0.49, -0.005 |
| Left fibular artery (PK-103) | leg | left | 4.2 | 0.096, 0.301, -0.036 |
| Left fibular artery (PK-103) | leg | left | 3.1 | 0.095, 0.153, -0.04 |
| Left fibular artery (PK-103) | leg | left | 3.7 | 0.085, 0.2, -0.04 |
| Left genicular vein (FJ2124) | leg | left | 3.6 | 0.076, 0.499, -0.029 |
| Left great saphenous vein (FJ2103) | leg | left | 4.1 | 0.015, 0.549, -0.031 |
| Left great saphenous vein (FJ2103) | leg | left | 3 | 0.026, 0.5, -0.047 |
| Left great saphenous vein (FJ2103) | leg | left | 3.1 | 0.015, 0.562, -0.027 |
| Left great saphenous vein (FJ2103) | leg | left | 4 | 0.03, 0.481, -0.05 |
| Left inferior gluteal artery (PK-109) | hip | left | 3.3 | 0.061, 0.901, -0.096 |
| Left inferior gluteal vein (FJ3513) | hip | left | 3.9 | 0.036, 0.896, -0.107 |
| Left inferior gluteal vein (FJ3513) | hip | left | 4 | 0.036, 0.898, -0.106 |
| Left inferior medial genicular artery (FJ2077) | leg | left | 3.9 | 0.06, 0.416, -0.037 |
| Left inferior medial genicular artery (FJ2077) | leg | left | 3.6 | 0.052, 0.415, -0.035 |
| Left lateral circumflex femoral vein (FJ2188) | hip | left | 3.1 | 0.113, 0.886, -0.005 |
| Left lateral superior genicular artery (FJ2080) | leg | left | 3.2 | 0.111, 0.483, -0.021 |
| Left medial circumflex femoral artery (PK-93) | hip | left | 4.2 | 0.055, 0.885, -0.002 |
| Left popliteal artery (FJ2086) | leg | left | 4.2 | 0.091, 0.378, -0.03 |
| Left popliteal artery (FJ2086) | leg | left | 3.9 | 0.065, 0.547, -0.019 |
| Left popliteal artery (FJ2086) | leg | left | 3.5 | 0.073, 0.468, -0.039 |
| Left popliteal artery (FJ2086) | leg | left | 5.6 | 0.072, 0.46, -0.041 |
| Left popliteal artery (FJ2086) | leg | left | 3 | 0.078, 0.446, -0.044 |
| Left popliteal artery (FJ2086) | leg | left | 4.6 | 0.071, 0.529, -0.019 |
| Left popliteal vein (FJ2117) | leg | left | 5.8 | 0.082, 0.546, -0.023 |
| Left popliteal vein (FJ2117) | leg | left | 3.9 | 0.079, 0.547, -0.018 |
| Left popliteal vein (FJ2117) | leg | left | 3.2 | 0.085, 0.456, -0.044 |
| Left popliteal vein (FJ2117) | leg | left | 4.6 | 0.093, 0.403, -0.03 |
| Left popliteal vein (FJ2117) | leg | left | 4.6 | 0.069, 0.559, -0.014 |
| Left popliteal vein (FJ2117) | leg | left | 5.7 | 0.087, 0.445, -0.039 |
| Left popliteal vein (FJ2117) | leg | left | 3 | 0.077, 0.537, -0.021 |
| Left popliteal vein (FJ2117) | leg | left | 5.8 | 0.075, 0.549, -0.024 |
| Left popliteal vein (FJ2117) | leg | left | 5.4 | 0.084, 0.461, -0.037 |
| Left posterior tibial artery (FJ2087) | leg | left | 3.9 | 0.052, 0.126, -0.048 |
| Left posterior tibial artery (FJ2087) | leg | left | 3.4 | 0.074, 0.324, -0.042 |
| Left posterior tibial vein (FJ2118) | leg | left | 4.2 | 0.067, 0.331, -0.034 |
| Left posterior tibial vein (FJ2118) | leg | left | 3 | 0.042, 0.193, -0.037 |
| Left posterior tibial vein (FJ2118) | leg | left | 3.9 | 0.052, 0.308, -0.04 |
| Left posterior tibial vein (FJ2118) | leg | left | 4.5 | 0.043, 0.172, -0.044 |
| Left posterior tibial vein (FJ2118) | leg | left | 3.8 | 0.046, 0.283, -0.036 |
| Left posterior tibial vein (FJ2118) | leg | left | 4.7 | 0.044, 0.181, -0.041 |
| Left posterior tibial vein (FJ2118) | leg | left | 3.9 | 0.051, 0.307, -0.039 |
| Left posterior tibial vein (FJ2118) | leg | left | 3.4 | 0.048, 0.077, -0.043 |
| Left posterior tibial vein (FJ2118) | leg | left | 5.9 | 0.052, 0.303, -0.04 |
| Left small saphenous vein (FJ2121) | leg | left | 3.6 | 0.074, 0.451, -0.068 |
| Left small saphenous vein (FJ2121) | leg | left | 4.4 | 0.065, 0.403, -0.08 |
| Left superior gluteal artery (PK-106) | hip | left | 5.5 | 0.064, 0.942, -0.059 |
| Left superior gluteal vein (FJ3531) | hip | left | 3.3 | 0.06, 0.942, -0.069 |
| Left superior gluteal vein (FJ3531) | hip | left | 3.7 | 0.039, 0.936, -0.062 |
| Right anterior tibial artery (FJ2130) | leg | right | 3.1 | -0.089, 0.176, -0.013 |
| Right anterior tibial artery (FJ2130) | leg | right | 4.1 | -0.076, 0.118, -0.003 |
| Right anterior tibial artery (FJ2130) | leg | right | 4.3 | -0.087, 0.171, -0.013 |
| Right anterior tibial artery (FJ2130) | leg | right | 3.2 | -0.095, 0.275, -0.004 |
| Right anterior tibial artery (FJ2130) | leg | right | 3.2 | -0.085, 0.154, -0.012 |
| Right anterior tibial artery (FJ2130) | leg | right | 5.5 | -0.103, 0.361, -0.019 |
| Right anterior tibial artery (FJ2130) | leg | right | 4.2 | -0.089, 0.199, -0.013 |
| Right anterior tibial artery (FJ2130) | leg | right | 3.9 | -0.102, 0.352, -0.017 |
| Right anterior tibial artery (FJ2130) | leg | right | 3.1 | -0.096, 0.305, -0.007 |
| Right anterior tibial artery (FJ2130) | leg | right | 3.9 | -0.091, 0.206, -0.008 |
| Right anterior tibial artery (FJ2130) | leg | right | 3.8 | -0.087, 0.173, -0.013 |
| Right anterior tibial artery (FJ2130) | leg | right | 3.5 | -0.08, 0.145, -0.007 |
| Right anterior tibial artery (FJ2130) | leg | right | 5.5 | -0.081, 0.134, -0.003 |
| Right anterior tibial artery (FJ2130) | leg | right | 3.7 | -0.095, 0.302, -0.003 |
| Right anterior tibial vein (FJ2193) | leg | right | 5.5 | -0.101, 0.342, -0.023 |
| Right anterior tibial vein (FJ2193) | leg | right | 5.4 | -0.1, 0.317, -0.008 |
| Right anterior tibial vein (FJ2193) | leg | right | 4.2 | -0.098, 0.286, -0.013 |
| Right anterior tibial vein (FJ2193) | leg | right | 3.6 | -0.097, 0.315, -0.008 |
| Right anterior tibial vein (FJ2193) | leg | right | 5.7 | -0.101, 0.317, -0.01 |
| Right deep branch of superior gluteal artery (PK-81) | hip | right | 3.1 | -0.097, 0.991, -0.068 |
| Right deep branch of superior gluteal artery (PK-81) | hip | right | 4.8 | -0.072, 0.949, -0.058 |
| Right deep branch of superior gluteal artery (PK-81) | hip | right | 3.4 | -0.074, 0.956, -0.059 |
| Right deep femoral artery (PK-64) | thigh | right | 4.5 | -0.057, 0.852, 0.041 |
| Right deep femoral artery (PK-64) | thigh | right | 4.8 | -0.067, 0.705, 0.025 |
| Right deep femoral artery (PK-64) | thigh | right | 4.6 | -0.068, 0.701, 0.023 |
| Right deep femoral vein (FJ2135) | thigh | right | 3.2 | -0.067, 0.647, 0.027 |
| Right deep femoral vein (FJ2135) | thigh | right | 3.1 | -0.072, 0.838, 0.023 |
| Right deep femoral vein (FJ2135) | thigh | right | 4.3 | -0.073, 0.826, 0.028 |
| Right deep femoral vein (FJ2135) | thigh | right | 3.8 | -0.047, 0.863, 0.03 |
| Right deep femoral vein (FJ2135) | thigh | right | 4.4 | -0.075, 0.75, 0.016 |
| Right descending genicular artery (FJ2137) | leg | right | 5.6 | -0.043, 0.525, 0.01 |
| Right descending genicular artery (FJ2137) | leg | right | 3.2 | -0.036, 0.498, -0.006 |
| Right descending genicular artery (FJ2137) | leg | right | 3.9 | -0.044, 0.486, -0.004 |
| Right descending genicular artery (FJ2137) | leg | right | 5.5 | -0.04, 0.522, 0.007 |
| Right fibular artery (PK-76) | leg | right | 3.5 | -0.096, 0.201, -0.051 |
| Right fibular artery (PK-76) | leg | right | 4.2 | -0.102, 0.302, -0.034 |
| Right fibular artery (PK-76) | leg | right | 3.9 | -0.091, 0.315, -0.035 |
| Right fibular artery (PK-76) | leg | right | 3.7 | -0.103, 0.293, -0.035 |
| Right fibular artery (PK-76) | leg | right | 3 | -0.094, 0.159, -0.039 |
| Right fibular vein (FJ2200) | leg | right | 3.2 | -0.07, 0.081, -0.052 |
| Right fibular vein (FJ2200) | leg | right | 3.6 | -0.065, 0.119, -0.053 |
| Right genicular vein (FJ2181) | leg | right | 4.7 | -0.091, 0.494, -0.035 |
| Right great saphenous vein (FJ2145) | leg | right | 3.2 | -0.025, 0.829, 0.037 |
| Right great saphenous vein (FJ2145) | leg | right | 4.1 | -0.029, 0.487, -0.049 |
| Right inferior gluteal artery (PK-82) | hip | right | 3.4 | -0.06, 0.901, -0.096 |
| Right inferior lateral genicular artery (FJ2150) | leg | right | 4 | -0.094, 0.429, -0.044 |
| Right inferior medial genicular artery (FJ2152) | leg | right | 4.4 | -0.073, 0.425, -0.04 |
| Right lateral circumflex femoral vein (FJ2201) | hip | right | 4 | -0.103, 0.841, 0.002 |
| Right lateral circumflex femoral vein (FJ2201) | hip | right | 4.8 | -0.09, 0.849, 0.018 |
| Right lateral circumflex femoral vein (FJ2201) | hip | right | 3.3 | -0.111, 0.881, -0.001 |
| Right lateral superior genicular artery (FJ2162) | leg | right | 4.2 | -0.094, 0.495, -0.029 |
| Right lateral tarsal artery (FJ2163) | foot | right | 3.1 | -0.108, 0.045, -0.004 |
| Right medial circumflex femoral artery (PK-66) | hip | right | 4.5 | -0.059, 0.863, 0.013 |
| Right obturator vein (FJ3612) | hip | right | 3.3 | -0.059, 0.921, -0.034 |
| Right popliteal artery (FJ2170) | leg | right | 4.3 | -0.075, 0.434, -0.037 |
| Right popliteal artery (FJ2170) | leg | right | 3.4 | -0.095, 0.38, -0.032 |
| Right popliteal artery (FJ2170) | leg | right | 5.3 | -0.06, 0.543, -0.013 |
| Right popliteal artery (FJ2170) | leg | right | 3.4 | -0.067, 0.541, -0.012 |
| Right popliteal vein (FJ2171) | leg | right | 3.3 | -0.084, 0.522, -0.032 |
| Right popliteal vein (FJ2171) | leg | right | 4.4 | -0.084, 0.429, -0.042 |
| Right popliteal vein (FJ2171) | leg | right | 4.7 | -0.085, 0.453, -0.044 |
| Right popliteal vein (FJ2171) | leg | right | 5.5 | -0.074, 0.56, -0.021 |
| Right popliteal vein (FJ2171) | leg | right | 5.6 | -0.08, 0.454, -0.039 |
| Right popliteal vein (FJ2171) | leg | right | 4.8 | -0.087, 0.425, -0.033 |
| Right posterior tibial artery (FJ2172) | leg | right | 3.9 | -0.064, 0.266, -0.034 |
| Right posterior tibial artery (FJ2172) | leg | right | 4 | -0.053, 0.134, -0.049 |
| Right posterior tibial artery (FJ2172) | leg | right | 3 | -0.061, 0.256, -0.034 |
| Right posterior tibial vein (FJ2173) | leg | right | 3.7 | -0.042, 0.201, -0.037 |
| Right posterior tibial vein (FJ2173) | leg | right | 3.8 | -0.044, 0.224, -0.035 |
| Right posterior tibial vein (FJ2173) | leg | right | 4.1 | -0.05, 0.305, -0.038 |
| Right posterior tibial vein (FJ2173) | leg | right | 4 | -0.045, 0.127, -0.05 |
| Right posterior tibial vein (FJ2173) | leg | right | 4.5 | -0.044, 0.175, -0.043 |
| Right posterior tibial vein (FJ2173) | leg | right | 3.1 | -0.043, 0.211, -0.038 |
| Right posterior tibial vein (FJ2173) | leg | right | 3.2 | -0.046, 0.284, -0.037 |
| Right posterior tibial vein (FJ2173) | leg | right | 4.7 | -0.043, 0.181, -0.041 |
| Right posterior tibial vein (FJ2173) | leg | right | 4.9 | -0.043, 0.203, -0.038 |
| Right posterior tibial vein (FJ2173) | leg | right | 4.4 | -0.043, 0.166, -0.045 |
| Right posterior tibial vein (FJ2173) | leg | right | 3.8 | -0.046, 0.125, -0.049 |
| Right posterior tibial vein (FJ2173) | leg | right | 4.7 | -0.043, 0.182, -0.04 |
| Right small saphenous vein (FJ2176) | leg | right | 4.2 | -0.072, 0.445, -0.069 |
| Right small saphenous vein (FJ2176) | leg | right | 3.6 | -0.08, 0.169, -0.071 |
| Set of dorsal digital arteries (FJ2093) | leg | left | 4.5 | 0.099, 0.326, -0.046 |
| Set of dorsal digital arteries (FJ2093) | leg | left | 3.7 | 0.1, 0.286, -0.05 |
| Set of dorsal digital arteries (FJ2093) | leg | left | 3.3 | 0.093, 0.233, -0.054 |
| Set of dorsal digital arteries (FJ2197) | leg | right | 3.3 | -0.1, 0.311, -0.049 |
| Set of dorsal digital arteries (FJ2197) | leg | right | 3.5 | -0.08, 0.188, -0.055 |
| Set of dorsal digital arteries (FJ2197) | leg | right | 3.7 | -0.091, 0.229, -0.055 |
| Set of dorsal digital arteries (FJ2197) | leg | right | 4.1 | -0.101, 0.287, -0.05 |
| Set of dorsal digital arteries (FJ2197) | leg | right | 3.9 | -0.099, 0.324, -0.047 |
| Set of perforating arteries (FJ2094) | thigh | left | 3.9 | 0.082, 0.76, 0.009 |
| Set of perforating arteries (FJ2094) | thigh | left | 3.7 | 0.083, 0.786, 0.012 |
| Set of perforating arteries (FJ2127) | thigh | right | 3.8 | -0.076, 0.624, 0.005 |
| Set of perforating arteries (FJ2203) | thigh | right | 4.5 | -0.079, 0.701, 0.017 |
| Set of perforating arteries (FJ2203) | thigh | right | 3.7 | -0.082, 0.813, 0.02 |
| Set of perforating arteries (FJ2203) | thigh | right | 4.2 | -0.079, 0.696, 0.018 |
| Set of perforating arteries (FJ2203) | thigh | right | 4.2 | -0.077, 0.681, 0.018 |
| Set of perforating arteries (FJ2203) | thigh | right | 4.7 | -0.076, 0.855, 0.03 |

## 表面圓滑

| 區域 | 動脈／靜脈網格 | 已圓滑（Loop 細分 + 平滑法線） | 未圓滑（超過 3000 個三角形，或形狀由運動資料綁定） |
| --- | ---: | ---: | ---: |
| 上肢 | 148 | 140 | 8 |
| 下肢 | 123 | 110 | 13 |

本步驟新增的橋接管與漸細管：上肢與下肢為 12 邊的圓形斷面、沿管長平滑法線（`scripts/prepare-vessel-ends.mjs`）；其餘區域的連接管維持 5 邊。
