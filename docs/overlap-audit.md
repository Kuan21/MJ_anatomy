# 結構穿插（interpenetration）審核

由 `node scripts/audit-overlap.mjs` 產生。方法：逐對檢查包圍盒相交的肌肉／骨骼（含 BodyParts3D 3.0 補充件如闊背肌），A 的頂點若落在 B 最近頂點法線內側超過 1.5 mm（且距離 6 mm 內），就算「穿入」B。成對只列較嚴重的一方。血管與神經本來就穿行於肌肉之間，不列入。

共 671 件結構參與比對，找到 681 對有明顯穿插。「深穿」＝穿入超過 4 mm 的取樣頂點數；「共面」＝與對方表面距離小於 0.4 mm（容易 z-fighting／黑點）的取樣頂點數。

選取時不再受影響：被選結構以 shader 深度偏移完整顯示在鄰近結構之上（見 `app/scene.tsx` 的 `gl_Position.z` 偏移），所以下表是**模型本身的穿插**，不會因選取而消失，需要換模型或修正位置才能根治。

| # | 結構 A | 穿入結構 B | 取樣點 | 穿入 | 深穿(>4 mm) | 最深 mm | 共面 |
|---|---|---|---|---|---|---|---|
| 1 | Right subscapularis | Right infraspinatus muscle | 1663 | 212 (13%) | 195 | 5.8 | 0 |
| 2 | Left subscapularis | Left infraspinatus muscle | 1645 | 211 (13%) | 190 | 5.8 | 0 |
| 3 | Right extensor hallucis brevis | Right calcaneus | 276 | 240 (87%) | 185 | 5.7 | 2 |
| 4 | Right sternocleidomastoid | Manubrium | 439 | 199 (45%) | 159 | 6.0 | 1 |
| 5 | Descending part of left trapezius | Left clavicle | 539 | 332 (62%) | 158 | 5.9 | 7 |
| 6 | Descending part of right trapezius | Right clavicle | 534 | 304 (57%) | 155 | 5.6 | 7 |
| 7 | Left extensor hallucis brevis | Left calcaneus | 279 | 206 (74%) | 147 | 6.0 | 2 |
| 8 | Right gluteus minimus | Right femur | 464 | 202 (44%) | 130 | 6.0 | 22 |
| 9 | Left gluteus minimus | Left femur | 467 | 184 (39%) | 129 | 5.7 | 19 |
| 10 | Left palmaris longus | Left flexor digitorum superficialis | 2076 | 278 (13%) | 127 | 5.8 | 282 |
| 11 | Intervertebral disk of eleventh thoracic vertebra | Diaphragm | 2892 | 400 (14%) | 119 | 5.0 | 18 |
| 12 | Left sternocleidomastoid | Manubrium | 388 | 132 (34%) | 101 | 5.7 | 4 |
| 13 | Left subscapularis | External intercostal muscle | 1997 | 416 (21%) | 88 | 4.6 | 54 |
| 14 | Left temporoparietalis | Left parietal bone | 1899 | 167 (9%) | 88 | 6.0 | 177 |
| 15 | Left palmaris longus | Left flexor digitorum profundus | 1801 | 118 (7%) | 73 | 5.5 | 66 |
| 16 | Right omohyoid | Right supraspinatus | 439 | 79 (18%) | 69 | 5.8 | 7 |
| 17 | Left subscapularis | Left scapula | 2342 | 174 (7%) | 68 | 4.5 | 0 |
| 18 | Right temporoparietalis | Right parietal bone | 1903 | 114 (6%) | 60 | 5.9 | 256 |
| 19 | thoracic rotator | Fifth thoracic vertebra | 462 | 159 (34%) | 59 | 5.4 | 14 |
| 20 | Left sternothyroid | Manubrium | 152 | 118 (78%) | 59 | 5.2 | 5 |
| 21 | Right subscapularis | external intercostal muscle | 2023 | 415 (21%) | 58 | 4.6 | 45 |
| 22 | Third plantar interosseous of right foot | Flexor digiti minimi brevis of right foot | 572 | 65 (11%) | 57 | 4.7 | 0 |
| 23 | Third plantar interosseous of left foot | Flexor digiti minimi brevis of left foot | 573 | 65 (11%) | 57 | 4.7 | 0 |
| 24 | Body of sternum | Sternocostal part of right pectoralis major | 1134 | 374 (33%) | 56 | 6.0 | 67 |
| 25 | Left piriformis | Sacrum | 274 | 179 (65%) | 55 | 4.8 | 4 |
| 26 | Body of sternum | Sternocostal part of left pectoralis major | 1277 | 405 (32%) | 54 | 5.2 | 67 |
| 27 | Right tibialis posterior | Right fibula | 483 | 65 (13%) | 54 | 4.7 | 58 |
| 28 | Right longissimus capitis | Right temporal bone | 196 | 138 (70%) | 51 | 5.9 | 6 |
| 29 | Right palmaris longus | Right flexor digitorum profundus | 1784 | 101 (6%) | 51 | 4.9 | 53 |
| 30 | Right flexor pollicis longus | Right brachioradialis | 888 | 57 (6%) | 51 | 5.3 | 31 |
| 31 | Left gluteus minimus | Left hip bone | 1341 | 288 (21%) | 47 | 5.4 | 6 |
| 32 | Right adductor magnus | Short head of right biceps femoris | 788 | 283 (36%) | 47 | 5.9 | 81 |
| 33 | Left adductor magnus | Short head of left biceps femoris | 801 | 315 (39%) | 46 | 5.9 | 67 |
| 34 | Right extensor digitorum brevis | Right extensor digitorum longus | 2666 | 202 (8%) | 44 | 5.5 | 127 |
| 35 | Right subscapularis | Right scapula | 2368 | 164 (7%) | 44 | 5.2 | 0 |
| 36 | Right iliocostalis thoracis | Right serratus anterior | 1140 | 186 (16%) | 43 | 5.8 | 84 |
| 37 | Left iliocostalis thoracis | Left serratus anterior | 1141 | 185 (16%) | 42 | 5.3 | 99 |
| 38 | Right gluteus minimus | Right hip bone | 1342 | 262 (20%) | 41 | 5.0 | 9 |
| 39 | Flexor digiti minimi brevis of right foot | Right flexor digitorum longus | 671 | 56 (8%) | 41 | 5.7 | 15 |
| 40 | Flexor digiti minimi brevis of left foot | Left flexor digitorum longus | 670 | 53 (8%) | 41 | 5.7 | 18 |
| 41 | Right pectoralis minor | Right fifth rib | 2421 | 448 (19%) | 40 | 5.3 | 29 |
| 42 | Left multifidus | Left longissimus thoracis | 2277 | 176 (8%) | 40 | 5.9 | 56 |
| 43 | Left iliocostalis thoracis | Left scapula | 874 | 59 (7%) | 40 | 5.6 | 29 |
| 44 | Left longissimus capitis | Left temporal bone | 199 | 137 (69%) | 38 | 5.5 | 1 |
| 45 | Left iliocostalis cervicis | External intercostal muscle | 652 | 115 (18%) | 37 | 4.9 | 31 |
| 46 | Right iliocostalis cervicis | external intercostal muscle | 646 | 106 (16%) | 37 | 4.9 | 18 |
| 47 | Right flexor pollicis brevis | Left flexor carpi radialis | 404 | 91 (23%) | 35 | 5.8 | 20 |
| 48 | Ascending part of right trapezius | Spinal part of right deltoid | 920 | 74 (8%) | 35 | 5.3 | 108 |
| 49 | Ascending part of left trapezius | Spinal part of left deltoid | 875 | 71 (8%) | 35 | 5.3 | 81 |
| 50 | Right iliocostalis thoracis | external intercostal muscle | 1608 | 187 (12%) | 34 | 5.2 | 138 |
| 51 | Clavicular part of right pectoralis major | Right clavicle | 495 | 124 (25%) | 34 | 5.5 | 119 |
| 52 | Left longissimus cervicis | Left splenius cervicis | 935 | 90 (10%) | 34 | 5.4 | 23 |
| 53 | Left flexor pollicis brevis | Right flexor carpi radialis | 403 | 89 (22%) | 34 | 5.8 | 20 |
| 54 | Left extensor digitorum | Middle phalanx of left ring finger | 98 | 48 (49%) | 34 | 4.8 | 18 |
| 55 | Clavicular part of left pectoralis major | Left clavicle | 497 | 111 (22%) | 33 | 5.7 | 141 |
| 56 | Right vastus intermedius | Right femur | 479 | 58 (12%) | 33 | 5.3 | 11 |
| 57 | Left extensor digitorum brevis | Left extensor digitorum longus | 2667 | 144 (5%) | 32 | 5.3 | 108 |
| 58 | Right multifidus | Right longissimus thoracis | 2270 | 140 (6%) | 31 | 5.3 | 66 |
| 59 | Left rectus capitis posterior minor | Descending part of left trapezius | 607 | 68 (11%) | 31 | 4.2 | 61 |
| 60 | Left tibialis posterior | Left extensor hallucis longus | 417 | 38 (9%) | 31 | 5.5 | 0 |
| 61 | Right multifidus | Right semispinalis thoracis | 1228 | 210 (17%) | 30 | 5.5 | 135 |
| 62 | Right rectus femoris | Right hip bone | 260 | 39 (15%) | 30 | 5.9 | 1 |
| 63 | Right rectus capitis posterior major | Right semispinalis capitis | 648 | 88 (14%) | 28 | 5.9 | 44 |
| 64 | Left rectus capitis posterior major | Left semispinalis capitis | 569 | 71 (12%) | 28 | 5.7 | 46 |
| 65 | Right teres major | Right serratus anterior | 374 | 40 (11%) | 28 | 5.7 | 11 |
| 66 | Left iliocostalis thoracis | External intercostal muscle | 1627 | 178 (11%) | 26 | 5.2 | 125 |
| 67 | Right anconeus | Ulnar head of right flexor carpi ulnaris | 425 | 105 (25%) | 26 | 4.2 | 21 |
| 68 | Intervertebral disk of eleventh thoracic vertebra | Left psoas major | 513 | 53 (10%) | 26 | 4.2 | 12 |
| 69 | Right pectineus | Right hip bone | 347 | 157 (45%) | 25 | 5.6 | 7 |
| 70 | Intervertebral disk of fifth cervical vertebra | Vertical intermediate part of left longus colli | 311 | 60 (19%) | 25 | 5.9 | 11 |
| 71 | Right iliacus | Right hip bone | 1162 | 287 (25%) | 24 | 5.3 | 124 |
| 72 | Innermost intercostal muscle | External intercostal muscle | 2724 | 144 (5%) | 24 | 5.8 | 183 |
| 73 | Right vastus lateralis | Right tibia | 125 | 30 (24%) | 24 | 5.2 | 1 |
| 74 | Left rectus capitis posterior minor | Left semispinalis capitis | 511 | 97 (19%) | 23 | 5.1 | 124 |
| 75 | innermost intercostal muscle | external intercostal muscle | 2728 | 157 (6%) | 22 | 5.7 | 170 |
| 76 | Right extensor indicis | Right ulna | 231 | 73 (32%) | 22 | 4.4 | 16 |
| 77 | Left anconeus | Left ulna | 527 | 47 (9%) | 22 | 4.5 | 34 |
| 78 | Left multifidus | Left semispinalis thoracis | 1221 | 205 (17%) | 21 | 5.5 | 131 |
| 79 | Right quadratus lumborum | Right hip bone | 688 | 120 (17%) | 21 | 5.1 | 14 |
| 80 | Left fifth costal cartilage | Sternocostal part of left pectoralis major | 365 | 85 (23%) | 21 | 5.7 | 45 |
| 81 | Right third costal cartilage | Sternocostal part of right pectoralis major | 355 | 102 (29%) | 20 | 5.5 | 37 |
| 82 | Left lumbar rotator | Twelfth thoracic vertebra | 331 | 86 (26%) | 20 | 4.7 | 47 |
| 83 | Long head of left triceps brachii | Left ulna | 138 | 77 (56%) | 20 | 4.8 | 24 |
| 84 | Right psoas major | Twelfth thoracic vertebra | 183 | 41 (22%) | 20 | 4.7 | 19 |
| 85 | Right sternocleidomastoid | Right platysma | 788 | 169 (21%) | 19 | 5.1 | 57 |
| 86 | Left rectus abdominis | Left seventh costal cartilage | 549 | 79 (14%) | 19 | 5.8 | 22 |
| 87 | Right rectus capitis posterior minor | Right semispinalis capitis | 577 | 76 (13%) | 19 | 5.1 | 193 |
| 88 | Left obliquus capitis inferior | Left semispinalis capitis | 344 | 50 (15%) | 19 | 5.4 | 16 |
| 89 | Right palmaris longus | Right flexor digitorum superficialis | 2072 | 249 (12%) | 18 | 5.6 | 234 |
| 90 | Right flexor digitorum brevis | Right flexor digitorum longus | 1388 | 157 (11%) | 18 | 5.4 | 172 |
| 91 | Sternocostal part of right pectoralis major | Right sixth costal cartilage | 401 | 150 (37%) | 18 | 5.1 | 20 |
| 92 | Left pectineus | Left hip bone | 353 | 149 (42%) | 18 | 5.2 | 6 |
| 93 | Right lumbar rotator | Twelfth thoracic vertebra | 409 | 136 (33%) | 18 | 4.4 | 26 |
| 94 | Sacrum | Right gluteus maximus | 1443 | 108 (7%) | 18 | 5.4 | 37 |
| 95 | Right sternothyroid | Manubrium | 156 | 107 (69%) | 18 | 4.6 | 5 |
| 96 | Long head of right triceps brachii | Right ulna | 141 | 80 (57%) | 18 | 4.7 | 21 |
| 97 | Right fourth costal cartilage | Sternocostal part of right pectoralis major | 332 | 79 (24%) | 18 | 5.4 | 31 |
| 98 | Right fifth costal cartilage | Sternocostal part of right pectoralis major | 358 | 74 (21%) | 18 | 5.8 | 52 |
| 99 | Right splenius cervicis | Ascending part of right trapezius | 1415 | 225 (16%) | 17 | 4.9 | 275 |
| 100 | Right pectoralis minor | Right fourth rib | 1781 | 115 (6%) | 17 | 4.6 | 16 |
| 101 | Right lumbar rotator | Fifth lumbar vertebra | 366 | 144 (39%) | 16 | 4.5 | 33 |
| 102 | Left third costal cartilage | Sternocostal part of left pectoralis major | 306 | 84 (27%) | 16 | 5.4 | 24 |
| 103 | Right serratus posterior superior | Right subscapularis | 1161 | 166 (14%) | 15 | 5.6 | 23 |
| 104 | Right obliquus capitis superior | Right splenius capitis | 1272 | 86 (7%) | 15 | 5.1 | 0 |
| 105 | Left transversus thoracis | Left sixth costal cartilage | 660 | 63 (10%) | 15 | 4.6 | 26 |
| 106 | Right popliteus | Right tibia | 260 | 45 (17%) | 15 | 5.5 | 13 |
| 107 | Left longissimus capitis | Left splenius cervicis | 598 | 41 (7%) | 15 | 5.6 | 18 |
| 108 | Left extensor carpi radialis brevis | Left extensor digitorum | 366 | 25 (7%) | 15 | 5.7 | 31 |
| 109 | innermost intercostal muscle | internal intercostal muscle | 2723 | 208 (8%) | 14 | 4.8 | 527 |
| 110 | Left flexor digitorum brevis | Left flexor digitorum longus | 1393 | 173 (12%) | 14 | 4.9 | 171 |
| 111 | Left serratus posterior superior | Left subscapularis | 1156 | 161 (14%) | 14 | 5.6 | 20 |
| 112 | Transverse part of right trapezius | Right scapula | 527 | 101 (19%) | 14 | 4.7 | 79 |
| 113 | Right scalenus posterior | Right second rib | 399 | 95 (24%) | 14 | 4.1 | 65 |
| 114 | Right transversus thoracis | Right sixth costal cartilage | 655 | 73 (11%) | 14 | 4.7 | 34 |
| 115 | Right pronator quadratus | Right flexor pollicis longus | 472 | 53 (11%) | 14 | 4.6 | 18 |
| 116 | Left pronator quadratus | Left flexor pollicis longus | 471 | 53 (11%) | 14 | 4.6 | 19 |
| 117 | Lateral head of left gastrocnemius | Left femur | 176 | 33 (19%) | 14 | 4.6 | 9 |
| 118 | Right adductor magnus | Right femur | 1623 | 297 (18%) | 13 | 5.3 | 37 |
| 119 | Right lumbar rotator | First lumbar vertebra | 1355 | 236 (17%) | 13 | 4.9 | 139 |
| 120 | Left adductor magnus | Left femur | 1638 | 202 (12%) | 13 | 5.4 | 44 |

## 闊背肌相關

| 結構 A | 穿入結構 B | 穿入 | 深穿 | 最深 mm | 共面 |
|---|---|---|---|---|---|
| Right latissimus dorsi | Right teres major | 25 | 4 | 5.5 | 13 |
| Ascending part of right trapezius | Right latissimus dorsi | 73 | 0 | 3.9 | 92 |
| Ascending part of left trapezius | Left latissimus dorsi | 60 | 0 | 3.5 | 46 |
| Ascending part of left trapezius | Right latissimus dorsi | 42 | 0 | 2.4 | 78 |
| Left teres major | Left latissimus dorsi | 31 | 0 | 3.4 | 63 |
