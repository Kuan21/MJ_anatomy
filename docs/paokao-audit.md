# 跑考摘要完整性審核

來源：`docs/paokao-checklist.json`（跑考摘要抽出 574 項）。完整名稱修正見 `docs/paokao-names.json`，名稱別名見 `docs/paokao-aliases.json`。由 `node scripts/audit-paokao.mjs` 產生；`npm run check:paokao` 在 build 前檢查「每項都存在、搜尋得到、可以點選」。

| 狀態 | 項數 | 說明 |
| --- | ---: | --- |
| 已有 | 416 | 模型原本就有（含別名拼法） |
| 新增示意模型 | 155 | 公開圖譜沒有，依真實解剖位置新做 |
| 屬於已有結構的一部分 | 14 | 肌頭、肌腱等，包含在對應肌肉內 |
| 略過 | 7 | 非結構詞，原因見下 |
| 缺少 | 0 | 仍缺（build 失敗） |

## 略過（非結構詞）

| # | 原文 | 完整名稱 | 位置 | 備註 |
| ---: | --- | --- | --- | --- |
| 59 | tendon |  | 上肢／枕下三角 Suboccipital triang | 泛稱（br. of～、head of～、tendon of～ 的說明句），不是特定結構；各肌腱、分支已於對應項目逐一列出 |
| 181 | Terminal branch |  | 上肢／上肢神經 | 泛稱（Terminal branch＝終末支），不是特定結構 |
| 182 | peripheral nerve |  | 上肢／上肢神經 | 泛稱（peripheral nerve＝周邊神經），不是特定結構 |
| 401 | nerve to XXX m |  | 下肢／大腿前區間 | 佔位寫法（nerve to XXX m.＝至某肌肉之神經的通稱），不是特定結構；各肌肉支已於 370、373、402 逐一列出 |
| 492 | Posterior m |  | 下肢／小腿後區間 | 截斷（Posterior m.＝小腿後區肌群標題），不是特定結構；後區各肌已逐項列出 |
| 529 | inf. m |  | Superficial layer （2 | 截斷（inf. m.，Serratus post. sup./inf. m. 的後半），已於 528 一併列出 |
| 535 | Roof |  | 枕下三角 Suboccipital tr | 非結構（Roof＝枕下三角的頂，即 Semispinalis capitis，已於 30 列出） |

## 新增示意模型

| # | 原文 | 完整名稱 | 位置 | 備註 |
| ---: | --- | --- | --- | --- |
| 3 | jugular foramen | Jugular foramen | 背部／Superficial layer （2+3+2 | Jugular foramen |
| 6 | Post. cutaneous br | Posterior cutaneous branch of dorsal ramus of spinal nerve | 背部／Superficial layer （2+3+2 | Right posterior cutaneous branch of dorsal ramus of thoracic spinal nerve |
| 7 | dorsal ramus of spinal n | Dorsal ramus of spinal nerve | 背部／Superficial layer （2+3+2 | Right dorsal ramus of thoracic spinal nerve |
| 17 | B. Thoracolumber fascia | Thoracolumbar fascia | 背部／Superficial layer （2+3+2 | thoracolumbar fascia |
| 21 | Suprascapular foramen | Suprascapular notch | 背部／Superficial layer （2+3+2 | Right suprascapular notch |
| 23 | sup. nuchal line | Superior nuchal line | 背部／Deep layer （2+3+3+3） （只有 | Superior nuchal line |
| 24 | mastoid process | Mastoid process | 背部／Deep layer （2+3+3+3） （只有 | Mastoid process |
| 31 | suboccipital triangle | Suboccipital triangle | 背部／Deep layer （2+3+3+3） （只有 | Right suboccipital triangle |
| 33 | spinous process | Spinous process of axis | 背部／Deep layer （2+3+3+3） （只有 | Spinous process of axis |
| 39 | spinal process | Spinous process of axis | 背部／枕下三角 Suboccipital triang | Spinous process of axis |
| 47 | Post. Arch | Posterior arch of atlas | 背部／枕下三角 Suboccipital triang | Posterior arch of atlas |
| 49 | Denticulate lig | Denticulate ligament | 背部／枕下三角 Suboccipital triang | Right denticulate ligament |
| 50 | b. Denticulate lig | Denticulate ligament | 背部／枕下三角 Suboccipital triang | Right denticulate ligament |
| 53 | Ligamentum flavum | Ligamentum flavum | 背部／枕下三角 Suboccipital triang | Ligamentum flavum |
| 60 | Coracoid process | Coracoid process | 上肢／上肢附著肌肉複習 | Right coracoid process |
| 61 | Great tubercle | Greater tubercle of humerus | 上肢／上肢附著肌肉複習 | Right greater tubercle of humerus |
| 62 | Lesser tubercle | Lesser tubercle of humerus | 上肢／上肢附著肌肉複習 | Right lesser tubercle of humerus |
| 63 | Intertubercle groove | Intertubercular groove | 上肢／上肢附著肌肉複習 | Right intertubercular groove |
| 64 | biceps groove | Intertubercular groove | 上肢／上肢附著肌肉複習 | Right intertubercular groove |
| 65 | Axilla fossa | Axillary fossa | 上肢／上肢附著肌肉複習 | Right axillary fossa |
| 66 | axillary sheath | Axillary sheath | 上肢／上肢附著肌肉複習 | Right axillary sheath |
| 68 | Quadrangular space | Quadrangular space | 上肢／腋窩邊界 Axillary boundary | Right quadrangular space |
| 70 | posterior circumflex humeral a./ v | Posterior circumflex humeral vein | 上肢／腋窩邊界 Axillary boundary | Right posterior circumflex humeral vein |
| 71 | Triangular interval | Triangular interval | 上肢／腋窩邊界 Axillary boundary | Right triangular interval |
| 74 | Triangular space | Triangular space | 上肢／腋窩邊界 Axillary boundary | Right triangular space |
| 78 | Sup. thoracic a | Superior thoracic artery | 上肢／腋窩邊界 Axillary boundary | Right superior thoracic artery |
| 82 | c. Clavicular br | Clavicular branch of thoracoacromial artery | 上肢／腋窩邊界 Axillary boundary | Clavicular branch of right thoraco-acromial artery |
| 86 | Mammary br | Mammary branch of lateral thoracic artery | 上肢／腋窩邊界 Axillary boundary | Right lateral mammary artery |
| 92 | space | Quadrangular space | 上肢／腋窩邊界 Axillary boundary | Right quadrangular space |
| 93 | Superior thoracic artery | Superior thoracic artery | 上肢／腋窩邊界 Axillary boundary | Right superior thoracic artery |
| 95 | clavicular br | Clavicular branch of thoracoacromial artery | 上肢／腋窩邊界 Axillary boundary | Clavicular branch of right thoraco-acromial artery |
| 102 | infraspiratus fossa | Infraspinous fossa | 上肢／腋窩邊界 Axillary boundary | Right infraspinous fossa |
| 105 | surgical neck | Surgical neck of humerus | 上肢／腋窩邊界 Axillary boundary | Right surgical neck of humerus |
| 108 | triangle | Clavipectoral triangle | 上肢／腋窩邊界 Axillary boundary | Right clavipectoral triangle |
| 126 | superficial palmaer br. of radial a | Superficial palmar branch of radial artery | 上肢／腋窩邊界 Axillary boundary | Right superficial palmar branch of radial artery |
| 130 | deep palmer br | Deep palmar branch of ulnar artery | 上肢／腋窩邊界 Axillary boundary | Right deep palmar branch of ulnar artery |
| 134 | lat. cord | Lateral cord of brachial plexus | 上肢／上肢神經 | Right lateral cord of brachial plexus |
| 142 | med. cord | Medial cord of brachial plexus | 上肢／上肢神經 | Right medial cord of brachial plexus |
| 145 | intercostobrachial n | Intercostobrachial nerve | 上肢／上肢神經 | Right intercostobrachial nerve |
| 150 | carpal tunnel | Carpal tunnel | 上肢／上肢神經 | Right carpal tunnel |
| 158 | Radial groove | Radial groove | 上肢／上肢神經 | Right radial groove |
| 164 | Superior transverse scapular ligament | Superior transverse scapular ligament | 上肢／上肢神經 | Right superior transverse scapular ligament |
| 166 | infraspinatus fossa | Infraspinous fossa | 上肢／上肢神經 | Right infraspinous fossa |
| 172 | phrenic nerve | Phrenic nerve | 上肢／上肢神經 | Right phrenic nerve |
| 175 | notch | Suprascapular notch | 上肢／上肢神經 | Right suprascapular notch |
| 186 | lateral cord | Lateral cord of brachial plexus | 上肢／上肢神經 | Right lateral cord of brachial plexus |
| 187 | lateral root | Lateral root of median nerve | 上肢／上肢神經 | Right lateral root of median nerve |
| 188 | medial cord | Medial cord of brachial plexus | 上肢／上肢神經 | Right medial cord of brachial plexus |
| 189 | medial root | Medial root of median nerve | 上肢／上肢神經 | Right medial root of median nerve |
| 194 | Recurrent br. of median n | Recurrent branch of median nerve | 上肢／上肢神經 | Right recurrent branch of median nerve |
| 207 | infraglenoid tubercle | Infraglenoid tubercle | 上肢／上肢肌肉（insertion/origin 可幫 | Right infraglenoid tubercle |
| 208 | Interval | Triangular interval | 上肢／上肢肌肉（insertion/origin 可幫 | Right triangular interval |
| 210 | medial epicondyle | Medial epicondyle of humerus | 上肢／上肢肌肉（insertion/origin 可幫 | Right medial epicondyle of humerus |
| 222 | styloid process | Styloid process of radius | 上肢／上肢肌肉（insertion/origin 可幫 | Right styloid process of radius |
| 240 | Palmaris brevis m | Palmaris brevis muscle | 上肢／上肢肌肉（insertion/origin 可幫 | Right palmaris brevis |
| 251 | iliac crest | Iliac crest | 胸腔／上肢肌肉（insertion/origin 可幫 | Right iliac crest |
| 252 | pubic tubercle | Pubic tubercle | 胸腔／上肢肌肉（insertion/origin 可幫 | Right pubic tubercle |
| 259 | B. Subcostal m | Subcostal muscle | 胸腔／上肢肌肉（insertion/origin 可幫 | Right subcostal muscles |
| 260 | Suspensory ligament | Suspensory ligament of breast | 胸腔／前胸壁（肌肉以外） | Right suspensory ligament of breast |
| 261 | B. Lat mammary a | Lateral mammary artery | 胸腔／前胸壁（肌肉以外） | Right lateral mammary artery |
| 262 | C. Med. Mammary br | Medial mammary branch of internal thoracic artery | 胸腔／前胸壁（肌肉以外） | Right medial mammary branch of internal thoracic artery |
| 268 | rectus sheath | Rectus sheath | 胸腔／前胸壁（肌肉以外） | rectus sheath |
| 270 | ant. intercostal a | Anterior intercostal artery | 胸腔／前胸壁（肌肉以外） | Right anterior intercostal arteries |
| 273 | Pericardiophrenic a | Pericardiophrenic artery | 胸腔／後胸壁 | Right pericardiophrenic artery |
| 273 | Pericardiophrenic a | Pericardiophrenic vein | 胸腔／後胸壁 | Right pericardiophrenic vein |
| 274 | B. Phrenic n | Phrenic nerve | 胸腔／後胸壁 | Right phrenic nerve |
| 275 | Thoracic duct | Thoracic duct | 胸腔／後胸壁 | Thoracic duct |
| 280 | left recurrent laryngeal n | left recurrent laryngeal nerve | 胸腔／後胸壁 | Right recurrent laryngeal nerve |
| 281 | right recurrent laryngeal n | right recurrent laryngeal nerve | 胸腔／後胸壁 | Right recurrent laryngeal nerve |
| 285 | B. Post. intercostal v | posterior intercostal vein | 胸腔／後胸壁 | Right posterior intercostal veins |
| 289 | Supreme intercostal a | Supreme intercostal artery | 胸腔／後胸壁 | Right supreme intercostal artery |
| 294 | Phrenic n | Phrenic nerve | 胸腔／後胸壁 | Right phrenic nerve |
| 297 | thoracic splanchnic n | Thoracic splanchnic nerve | 胸腔／後胸壁 | Right greater splanchnic nerve；Right lesser splanchnic nerve；Right least splanchnic nerve |
| 298 | B. Greater splanchnic n | Greater splanchnic nerve | 胸腔／後胸壁 | Right greater splanchnic nerve |
| 299 | celiac ganglion | celiac ganglion | 胸腔／後胸壁 | Right celiac ganglion |
| 300 | C. Lesser splanchnic n | Lesser splanchnic nerve | 胸腔／後胸壁 | Right lesser splanchnic nerve |
| 301 | aorticorenal ganglion | aorticorenal ganglion | 胸腔／後胸壁 | Right aorticorenal ganglion |
| 302 | sup. mesenteric ganglion | superior mesenteric ganglion | 胸腔／後胸壁 | Right superior mesenteric ganglion |
| 303 | D. Least splanchnic n | Least splanchnic nerve | 胸腔／後胸壁 | Right least splanchnic nerve |
| 304 | renal ganglion | renal ganglion | 胸腔／後胸壁 | Right renal ganglion |
| 305 | Post. vagal trunk | Posterior vagal trunk | 胸腔／後胸壁 | Posterior vagal trunk |
| 307 | esophageal plexus | esophageal plexus | 胸腔／後胸壁 | Esophageal plexus |
| 308 | posterior vagal trunk | posterior vagal trunk | 胸腔／後胸壁 | Posterior vagal trunk |
| 311 | Superior phrenic a | Superior phrenic artery | 胸腔／後胸壁 | Right superior phrenic artery |
| 312 | aortic hiatus | Aortic hiatus | 胸腔／後胸壁 | Aortic hiatus |
| 345 | C. Pulmonary lig | Pulmonary ligament | 胸腔／肺臟（拿到肺有肋骨壓痕的靠前面，接著看幾葉確認左 | Left pulmonary ligament |
| 346 | Lingula | Lingula of left lung | 胸腔／肺臟（拿到肺有肋骨壓痕的靠前面，接著看幾葉確認左 | Lingula of left lung |
| 347 | B. Oblique fissure | Oblique fissure of lung | 胸腔／肺臟（拿到肺有肋骨壓痕的靠前面，接著看幾葉確認左 | Oblique fissure of right lung |
| 348 | Cardiac impression | Cardiac impression | 胸腔／肺臟（拿到肺有肋骨壓痕的靠前面，接著看幾葉確認左 | Cardiac impression of left lung |
| 349 | Groove for aortic arch | Groove for aortic arch | 胸腔／肺臟（拿到肺有肋骨壓痕的靠前面，接著看幾葉確認左 | Groove for aortic arch |
| 350 | Groove | Groove for descending aorta | 胸腔／肺臟（拿到肺有肋骨壓痕的靠前面，接著看幾葉確認左 | Groove for descending aorta |
| 351 | Groove for subclavian a | Groove for subclavian artery | 胸腔／肺臟（拿到肺有肋骨壓痕的靠前面，接著看幾葉確認左 | Left groove for subclavian artery |
| 352 | Groove for left brachiocephalic v | Groove for left brachiocephalic vein | 胸腔／肺臟（拿到肺有肋骨壓痕的靠前面，接著看幾葉確認左 | Groove for left brachiocephalic vein |
| 353 | Cardiac notch | Cardiac notch of left lung | 胸腔／肺臟（拿到肺有肋骨壓痕的靠前面，接著看幾葉確認左 | Cardiac notch of left lung |
| 354 | Oblique fissure | Oblique fissure of lung | 胸腔／肺臟（拿到肺有肋骨壓痕的靠前面，接著看幾葉確認左 | Oblique fissure of right lung |
| 355 | B. Horizontal fissure | Horizontal fissure of right lung | 胸腔／肺臟（拿到肺有肋骨壓痕的靠前面，接著看幾葉確認左 | Horizontal fissure of right lung |
| 356 | Groove for brachiocephalic v | Groove for brachiocephalic vein | 胸腔／肺臟（拿到肺有肋骨壓痕的靠前面，接著看幾葉確認左 | Groove for left brachiocephalic vein |
| 357 | Groove for azygos v | Groove for azygos vein | 胸腔／肺臟（拿到肺有肋骨壓痕的靠前面，接著看幾葉確認左 | Groove for azygos vein |
| 367 | inf. gluteal n | inferior gluteal nerve | 下肢／臀部 | Right inferior gluteal nerve |
| 370 | Nerve to obturator internus m | Nerve to obturator internus | 下肢／臀部 | Right nerve to obturator internus |
| 372 | Internal pudendal a. v | Internal pudendal artery | 下肢／臀部 | Right internal pudendal artery |
| 374 | sup. gluteal a | Superior gluteal artery | 下肢／臀部 | Right superior gluteal artery |
| 375 | superficial br | Superficial branch of superior gluteal artery | 下肢／臀部 | Right superficial branch of superior gluteal artery |
| 376 | inf. gluteal a | Inferior gluteal artery | 下肢／臀部 | Right inferior gluteal artery |
| 377 | internal pudendal a | Internal pudendal artery | 下肢／臀部 | Right internal pudendal artery |
| 379 | ischial tuberosity | Ischial tuberosity | 下肢／臀部 | Right ischial tuberosity |
| 381 | spine | Spine of ischium | 下肢／臀部 | Right spine of ischium |
| 386 | Quadriceps tendon | Quadriceps tendon | 下肢／大腿前區間 | Right quadriceps tendon |
| 388 | tibial tuberosity | Tibial tuberosity | 下肢／大腿前區間 | Right tibial tuberosity |
| 399 | femoral sheath | Femoral sheath | 下肢／大腿前區間 | Right femoral sheath |
| 402 | nerve to vastus medialis m | Nerve to vastus medialis | 下肢／大腿前區間 | Right nerve to vastus medialis |
| 405 | saphenous br. of descending genicular a | Saphenous branch of descending genicular artery | 下肢／大腿前區間 | Right saphenous branch of descending genicular artery |
| 407 | articular br | Articular branch of descending genicular artery | 下肢／大腿前區間 | Right articular branch of descending genicular artery |
| 408 | saphenous br | Saphenous branch of descending genicular artery | 下肢／大腿前區間 | Right saphenous branch of descending genicular artery |
| 411 | superficial circumflex iliac a | superficial circumflex iliac artery | 下肢／大腿前區間 | Right superficial circumflex iliac artery |
| 413 | superficial external pudendal a | superficial external pudendal artery | 下肢／大腿前區間 | Right superficial external pudendal artery |
| 414 | deep external pudendal a | deep external pudendal artery | 下肢／大腿前區間 | Right deep external pudendal artery |
| 415 | deep femoral a | deep femoral artery | 下肢／大腿前區間 | Right deep femoral artery |
| 417 | Ascending br | Ascending branch of lateral circumflex femoral artery | 下肢／大腿前區間 | Right ascending branch of lateral circumflex femoral artery |
| 418 | Transverse br | Transverse branch of lateral circumflex femoral artery | 下肢／大腿前區間 | Right transverse branch of lateral circumflex femoral artery |
| 420 | medial circumflex femoral a | medial circumflex femoral artery | 下肢／大腿前區間 | Right medial circumflex femoral artery |
| 422 | perforating br | Perforating branch of deep femoral artery | 下肢／大腿前區間 | Right perforating branch of deep femoral artery |
| 423 | adductor hiatus | Adductor hiatus | 下肢／大腿前區間 | Right adductor hiatus |
| 441 | perforating br. of deep femoral a | Perforating branch of deep femoral artery | 下肢／大腿後側區間 | Right perforating branch of deep femoral artery |
| 452 | lateral sural cutaneous n | lateral sural cutaneous nerve | 下肢／膕窩 | Right lateral sural cutaneous nerve |
| 456 | Patellar lig | Patellar ligament | 下肢／膝關節附近 | Right patellar ligament |
| 469 | anterior lateral malleolar a | anterior lateral malleolar artery | 下肢／小腿前區間 | Right anterior lateral malleolar artery |
| 470 | anterior medial malleolar a | anterior medial malleolar artery | 下肢／小腿前區間 | Right anterior medial malleolar artery |
| 472 | lateral br | Lateral branch of deep fibular nerve | 下肢／小腿前區間 | Right lateral branch of deep fibular nerve |
| 473 | medial br | Medial branch of deep fibular nerve | 下肢／小腿前區間 | Right medial branch of deep fibular nerve |
| 477 | lateral dorsal cutaneous n | lateral dorsal cutaneous nerve | 下肢／小腿前區間 | Right lateral dorsal cutaneous nerve |
| 480 | Sup. fibular retinaculum | superior fibular retinaculum | 下肢／小腿外側區間 | Right superior fibular retinaculum |
| 481 | Inf. fibular retinaculum | inferior fibular retinaculum | 下肢／小腿外側區間 | Right inferior fibular retinaculum |
| 490 | tarsal tunnel | Tarsal tunnel | 下肢／小腿後區間 | Right tarsal tunnel |
| 495 | Circumflex fibular a | Circumflex fibular artery | 下肢／小腿後區間 | Right circumflex fibular artery |
| 496 | Fibular a | Fibular artery | 下肢／小腿後區間 | Right fibular artery |
| 497 | flexor retinaculum | Flexor retinaculum of ankle | 下肢／Tarsal tunnel：在內踝由屈肌支持帶  | Right flexor retinaculum of ankle |
| 506 | sup. extensor retinaculum | Superior extensor retinaculum of foot | 下肢／足背 | Right superior extensor retinaculum of foot |
| 507 | inf. extensor retinaculum | Inferior extensor retinaculum of foot | 下肢／足背 | Right inferior extensor retinaculum of foot |
| 509 | plantar aponeurosis | plantar aponeurosis | 下肢／足底：注意分層，但是拇指和小指的部分不用分層也看 | plantar aponeurosis |
| 513 | lat. plantar v | Lateral plantar vein | 下肢／足底：注意分層，但是拇指和小指的部分不用分層也看 | Right lateral plantar vein |
| 530 | Thoracolumber fascia | Thoracolumbar fascia | Superficial layer （2 | thoracolumbar fascia |
| 539 | a. Recurrent br. of median n | Recurrent branch of median nerve | 上肢神經 | Right recurrent branch of median nerve |
| 547 | Subcostal m | Subcostal muscle | 上肢肌肉（insertion/origi | Right subcostal muscles |
| 548 | Suspensory ligament of breast | Suspensory ligament of breast | 前胸壁（肌肉以外） | Right suspensory ligament of breast |
| 549 | Lat mammary a | Lateral mammary artery | 前胸壁（肌肉以外） | Right lateral mammary artery |
| 550 | Med. Mammary br. of internal thoracic a | Medial mammary branch of internal thoracic artery | 前胸壁（肌肉以外） | Right medial mammary branch of internal thoracic artery |
| 554 | Post. intercostal v | posterior intercostal vein | 後胸壁 | Right posterior intercostal veins |
| 556 | Lesser splanchnic n | Lesser splanchnic nerve | 後胸壁 | Right lesser splanchnic nerve |
| 557 | Least splanchnic n | Least splanchnic nerve | 後胸壁 | Right least splanchnic nerve |
| 558 | Ant. / Post. vagal trunk | Anterior vagal trunk | 後胸壁 | Anterior vagal trunk |
| 558 | Ant. / Post. vagal trunk | Posterior vagal trunk | 後胸壁 | Posterior vagal trunk |
| 563 | nodal a | Atrioventricular nodal artery | 後胸壁 | Atrioventricular nodal artery |
| 572 | Pulmonary lig | Pulmonary ligament | 肺臟（拿到肺有肋骨壓痕的靠前面，接著看幾 | Left pulmonary ligament |
| 573 | Horizontal fissure | Horizontal fissure of right lung | 肺臟（拿到肺有肋骨壓痕的靠前面，接著看幾 | Horizontal fissure of right lung |

## 全部項目

| # | 原文 | 完整名稱 | 狀態 | 模型名稱 | 來源 |
| ---: | --- | --- | --- | --- | --- |
| 0 | Trapezius m | Trapezius muscle | 已有（contained） | Ascending part of right trapezius | atlas |
| 1 | Accessory n | Accessory nerve | 已有 | Accessory nerve (XI) | nerve |
| 2 | Superficial br. of transverse cervical a | Superficial branch of transverse cervical artery | 已有（alias） | Left superficial cervical artery | atlas |
| 3 | jugular foramen | Jugular foramen | 新增示意模型 | Jugular foramen | paokao |
| 4 | B. Latissimus dorsi m | Latissimus dorsi muscle | 已有 | Right latissimus dorsi | supplement |
| 5 | Thoracodorsal n | Thoracodorsal nerve | 已有 | Thoracodorsal nerve | nerve |
| 6 | Post. cutaneous br | Posterior cutaneous branch of dorsal ramus of spinal nerve | 新增示意模型（alias） | Right posterior cutaneous branch of dorsal ramus of thoracic spinal nerve | paokao |
| 7 | dorsal ramus of spinal n | Dorsal ramus of spinal nerve | 新增示意模型（alias） | Right dorsal ramus of thoracic spinal nerve | paokao |
| 8 | minor m | Rhomboid minor muscle | 已有 | Right rhomboid minor | atlas |
| 9 | B. Levator scapulae m | Levator scapulae muscle | 已有 | Right levator scapulae | atlas |
| 10 | Dorsal scapular n | Dorsal scapular nerve | 已有 | Dorsal scapular nerve | nerve |
| 11 | Subclavian a | Subclavian artery | 已有 | Left subclavian artery | atlas |
| 12 | Transverse cervical a | Transverse cervical artery | 已有 | Left transverse cervical artery | atlas |
| 13 | deep br | Deep branch of transverse cervical artery | 已有（alias） | Left dorsal scapular artery | atlas |
| 14 | Dorsal scapular a | Dorsal scapular artery | 已有 | Left dorsal scapular artery | atlas |
| 15 | Rhomboid major m | Rhomboid major muscle | 已有 | Right rhomboid major | atlas |
| 16 | Serratus post. sup. m | Serratus posterior superior muscle | 已有 | Right serratus posterior superior | atlas |
| 17 | B. Thoracolumber fascia | Thoracolumbar fascia | 新增示意模型 | thoracolumbar fascia | paokao |
| 18 | Supraspinatus m | Supraspinatus muscle | 已有 | Right supraspinatus | atlas |
| 19 | Infraspinatus m | Infraspinatus muscle | 已有 | Right infraspinatus muscle | atlas |
| 20 | Suprascapular n | Suprascapular nerve | 已有 | Suprascapular nerve | nerve |
| 21 | Suprascapular foramen | Suprascapular notch | 新增示意模型 | Right suprascapular notch | paokao |
| 22 | Splenius capitis m | Splenius capitis muscle | 已有 | Right splenius capitis | atlas |
| 23 | sup. nuchal line | Superior nuchal line | 新增示意模型 | Superior nuchal line | paokao |
| 24 | mastoid process | Mastoid process | 新增示意模型 | Mastoid process | paokao |
| 25 | B. Splenius cervicis m | Splenius cervicis muscle | 已有 | Right splenius cervicis | atlas |
| 26 | Spinalis m | Spinalis muscle | 已有 | spinalis | atlas |
| 27 | B. Longissimus m | Longissimus muscle | 已有（contained） | Right longissimus capitis | atlas |
| 28 | C. Iliocostalis m | Iliocostalis muscle | 已有（contained） | Right iliocostalis cervicis | atlas |
| 29 | Semispinalis m | Semispinalis muscle | 已有（contained） | Right semispinalis capitis | atlas |
| 30 | Semispinalis capitis m | Semispinalis capitis muscle | 已有 | Right semispinalis capitis | atlas |
| 31 | suboccipital triangle | Suboccipital triangle | 新增示意模型 | Right suboccipital triangle | paokao |
| 32 | Semispinalis cervicis m | Semispinalis cervicis muscle | 已有 | Right semispinalis cervicis | atlas |
| 33 | spinous process | Spinous process of axis | 新增示意模型 | Spinous process of axis | paokao |
| 34 | Mutifidus m | Mutifidus muscle | 已有（alias） | Right multifidus | supplement |
| 35 | capitis m | Semispinalis capitis muscle | 已有 | Right semispinalis capitis | atlas |
| 36 | Obliquus capitis sup. m | Obliquus capitis superior muscle | 已有 | Left obliquus capitis superior | atlas |
| 37 | Obliquus capitis inf. m | Obliquus capitis inferior muscle | 已有 | Left obliquus capitis inferior | atlas |
| 38 | Rectus capitis post. major m | Rectus capitis posterior major muscle | 已有 | Left rectus capitis posterior major | atlas |
| 39 | spinal process | Spinous process of axis | 新增示意模型 | Spinous process of axis | paokao |
| 40 | Rectus capitis post. minor m | Rectus capitis posterior minor muscle | 已有 | Left rectus capitis posterior minor | atlas |
| 41 | Suboccipital n | Suboccipital nerve | 已有 | Suboccipital nerve | nerve |
| 42 | Greater occipital n | Greater occipital nerve | 已有 | Greater occipital nerve | nerve |
| 43 | Third occipital n | Third occipital nerve | 已有 | Third occipital nerve | nerve |
| 44 | Lesser occipital n | Lesser occipital nerve | 已有 | Lesser occipital nerve | nerve |
| 45 | Great auricular n | Great auricular nerve | 已有 | Great auricular nerve | nerve |
| 46 | Vertebral a | Vertebral artery | 已有 | Right vertebral artery | atlas |
| 47 | Post. Arch | Posterior arch of atlas | 新增示意模型 | Posterior arch of atlas | paokao |
| 48 | Occipital a | Occipital artery | 已有（contained） | Right lateral occipital artery | atlas |
| 49 | Denticulate lig | Denticulate ligament | 新增示意模型 | Right denticulate ligament | paokao |
| 50 | b. Denticulate lig | Denticulate ligament | 新增示意模型 | Right denticulate ligament | paokao |
| 51 | Ventral root | Ventral root of spinal nerve | 已有（alias） | Anterior root of spinal nerve | nerve |
| 52 | Dorsal root | Dorsal root of spinal nerve | 已有（alias） | Posterior root of spinal nerve | nerve |
| 53 | Ligamentum flavum | Ligamentum flavum | 新增示意模型 | Ligamentum flavum | paokao |
| 54 | Post. longitudinal lig | posterior longitudinal ligament | 已有 | Posterior longitudinal ligament | joints |
| 55 | Ant. longitudinal lig | anterior longitudinal ligament | 已有 | Anterior longitudinal ligament | joints |
| 56 | Nuchal lig./ supraspinous lig | Nuchal ligament | 已有 | Nuchal ligament | joints |
| 56 | Nuchal lig./ supraspinous lig | Supraspinous ligament | 已有 | Supraspinous ligament | joints |
| 57 | supraspinous lig | Supraspinous ligament | 已有 | Supraspinous ligament | joints |
| 58 | Interspinous lig | Interspinous ligament | 已有 | Interspinous ligaments | joints |
| 59 | tendon |  | 略過 | 泛稱（br. of～、head of～、tendon of～ 的說明句），不是特定結構；各肌腱、分支已於對應項目逐一列出 |  |
| 60 | Coracoid process | Coracoid process | 新增示意模型 | Right coracoid process | paokao |
| 61 | Great tubercle | Greater tubercle of humerus | 新增示意模型 | Right greater tubercle of humerus | paokao |
| 62 | Lesser tubercle | Lesser tubercle of humerus | 新增示意模型 | Right lesser tubercle of humerus | paokao |
| 63 | Intertubercle groove | Intertubercular groove | 新增示意模型 | Right intertubercular groove | paokao |
| 64 | biceps groove | Intertubercular groove | 新增示意模型 | Right intertubercular groove | paokao |
| 65 | Axilla fossa | Axillary fossa | 新增示意模型 | Right axillary fossa | paokao |
| 66 | axillary sheath | Axillary sheath | 新增示意模型 | Right axillary sheath | paokao |
| 67 | axillary v | axillary vein | 已有 | Left axillary vein | atlas |
| 68 | Quadrangular space | Quadrangular space | 新增示意模型 | Right quadrangular space | paokao |
| 69 | axillary nerve | axillary nerve | 已有 | Axillary nerve | nerve |
| 70 | posterior circumflex humeral a./ v | Posterior circumflex humeral artery | 已有 | Left posterior circumflex humeral artery | atlas |
| 70 | posterior circumflex humeral a./ v | Posterior circumflex humeral vein | 新增示意模型 | Right posterior circumflex humeral vein | paokao |
| 71 | Triangular interval | Triangular interval | 新增示意模型 | Right triangular interval | paokao |
| 72 | radial nerve | radial nerve | 已有 | Radial nerve | nerve |
| 73 | profunda branchial a | Profunda brachii artery | 已有 | Left deep brachial artery | atlas |
| 74 | Triangular space | Triangular space | 新增示意模型 | Right triangular space | paokao |
| 75 | circumflex scapular a | circumflex scapular artery | 已有 | Left circumflex scapular artery | atlas |
| 76 | Axillary a | Axillary artery | 已有 | Left axillary artery | atlas |
| 77 | pectoralis minor m | pectoralis minor muscle | 已有 | Right pectoralis minor | atlas |
| 78 | Sup. thoracic a | Superior thoracic artery | 新增示意模型 | Right superior thoracic artery | paokao |
| 79 | Thoracoacromial a | Thoracoacromial artery | 已有（contained） | Acromial branch of left thoraco-acromial artery | atlas |
| 80 | Pectoral br | Pectoral branch of thoracoacromial artery | 已有 | Pectoral branch of left thoraco-acromial artery | atlas |
| 81 | b. Acromial br | Acromial branch of thoracoacromial artery | 已有 | Acromial branch of left thoraco-acromial artery | atlas |
| 82 | c. Clavicular br | Clavicular branch of thoracoacromial artery | 新增示意模型 | Clavicular branch of right thoraco-acromial artery | paokao |
| 83 | d. Deltoid br | Deltoid branch of thoracoacromial artery | 已有 | Deltoid branch of left thoraco-acromial artery | atlas |
| 84 | cephalic v | cephalic vein | 已有 | Left cephalic vein | atlas |
| 85 | Lat. thoracic a | Lateral thoracic artery | 已有 | Right lateral thoracic artery | atlas |
| 86 | Mammary br | Mammary branch of lateral thoracic artery | 新增示意模型（alias） | Right lateral mammary artery | paokao |
| 87 | Subscapular a | Subscapular artery | 已有 | Left subscapular artery | atlas |
| 88 | Thoracodorsal a | Thoracodorsal artery | 已有 | Left thoracodorsal artery | atlas |
| 89 | Ant. circumflex humeral a | anterior circumflex humeral artery | 已有 | Left anterior circumflex humeral artery | atlas |
| 90 | Post. circumflex humeral a | posterior circumflex humeral artery | 已有 | Left posterior circumflex humeral artery | atlas |
| 91 | axillary n | axillary nerve | 已有 | Axillary nerve | nerve |
| 92 | space | Quadrangular space | 新增示意模型 | Right quadrangular space | paokao |
| 93 | Superior thoracic artery | Superior thoracic artery | 新增示意模型 | Right superior thoracic artery | paokao |
| 94 | Thoraco-acromial artery | Thoracoacromial artery | 已有（contained） | Acromial branch of left thoraco-acromial artery | atlas |
| 95 | clavicular br | Clavicular branch of thoracoacromial artery | 新增示意模型 | Clavicular branch of right thoraco-acromial artery | paokao |
| 96 | acromial br | Acromial branch of thoracoacromial artery | 已有 | Acromial branch of left thoraco-acromial artery | atlas |
| 97 | deltoid br | Deltoid branch of thoracoacromial artery | 已有 | Deltoid branch of left thoraco-acromial artery | atlas |
| 98 | Lateral thoracic artery | Lateral thoracic artery | 已有 | Right lateral thoracic artery | atlas |
| 99 | nerve | Long thoracic nerve | 已有 | Long thoracic nerve | nerve |
| 100 | subscapular artery | subscapular artery | 已有 | Left subscapular artery | atlas |
| 101 | circumflex scapular branch | circumflex scapular branch | 已有 | Left circumflex scapular artery | atlas |
| 102 | infraspiratus fossa | Infraspinous fossa | 新增示意模型 | Right infraspinous fossa | paokao |
| 103 | thoracodorsal artery | thoracodorsal artery | 已有 | Left thoracodorsal artery | atlas |
| 104 | anterior circumflex humeral artery | anterior circumflex humeral artery | 已有 | Left anterior circumflex humeral artery | atlas |
| 105 | surgical neck | Surgical neck of humerus | 新增示意模型 | Right surgical neck of humerus | paokao |
| 106 | posterior circumflex humeral artery | posterior circumflex humeral artery | 已有 | Left posterior circumflex humeral artery | atlas |
| 107 | Cephalic vein | Cephalic vein | 已有 | Left cephalic vein | atlas |
| 108 | triangle | Clavipectoral triangle | 新增示意模型 | Right clavipectoral triangle | paokao |
| 109 | Median cubital vein | Median cubital vein | 已有 | Left median cubital vein | atlas |
| 110 | Basilic vein | Basilic vein | 已有 | Left basilic vein | atlas |
| 111 | Axillary vein | Axillary vein | 已有 | Left axillary vein | atlas |
| 112 | brachial artery | brachial artery | 已有 | Left brachial artery | atlas |
| 113 | axillary artery | axillary artery | 已有 | Left axillary artery | atlas |
| 114 | low part of teres major m | Teres major muscle | 已有 | Right teres major | atlas |
| 115 | collateral artery | Middle collateral artery | 已有（contained） | Middle collateral branch of left deep brachial artery | atlas |
| 116 | Radial artery | Radial artery | 已有 | Left radial artery | atlas |
| 117 | Ulnar artery | Ulnar artery | 已有 | Left ulnar artery | atlas |
| 118 | artery | Middle collateral artery | 已有（contained） | Middle collateral branch of left deep brachial artery | atlas |
| 119 | radial collateral artery | radial collateral artery | 已有（contained） | Radial collateral branch of left deep brachial artery | atlas |
| 120 | radial recurrent artery | radial recurrent artery | 已有 | Left radial recurrent artery | atlas |
| 121 | anterior ulnar recurrent artery | anterior ulnar recurrent artery | 已有 | Left anterior ulnar recurrent artery | atlas |
| 122 | Interosseous artery | Common interosseous artery | 已有 | Left common interosseous artery | atlas |
| 123 | anterior Interosseous artery | anterior Interosseous artery | 已有 | Left anterior interosseous artery | atlas |
| 124 | Interosseous recurrent artery | Interosseous recurrent artery | 已有（alias） | Left recurrent interosseous artery | atlas |
| 125 | superficial palmer arch | Superficial palmar arch | 已有（alias） | Left superficial palmar arterial arch | atlas |
| 126 | superficial palmaer br. of radial a | Superficial palmar branch of radial artery | 新增示意模型 | Right superficial palmar branch of radial artery | paokao |
| 127 | ulnar a | ulnar artery | 已有 | Left ulnar artery | atlas |
| 128 | deep palmer arch | Deep palmar arch | 已有 | Left deep palmar arch | atlas |
| 129 | radial a | radial artery | 已有 | Left radial artery | atlas |
| 130 | deep palmer br | Deep palmar branch of ulnar artery | 新增示意模型 | Right deep palmar branch of ulnar artery | paokao |
| 131 | B. common palmer digital a | Common palmar digital artery | 已有（contained） | Left first common palmar digital artery | atlas |
| 132 | C. proper palmer digital a | Proper palmar digital artery | 已有（contained） | Medial proper palmar digital artery of left index finger | atlas |
| 133 | Brachial plexus | Brachial plexus | 已有（contained） | Roots of brachial plexus | nerve |
| 134 | lat. cord | Lateral cord of brachial plexus | 新增示意模型 | Right lateral cord of brachial plexus | paokao |
| 135 | i. Lat. pectoral n | Lateral pectoral nerve | 已有 | Lateral pectoral nerve | nerve |
| 136 | i. Musculocutaneous n | Musculocutaneous nerve | 已有 | Musculocutaneous nerve | nerve |
| 137 | Coracobrachialis m | Coracobrachialis muscle | 已有 | Right coracobrachialis | atlas |
| 138 | biceps brachii m | biceps brachii muscle | 已有（contained） | Long head of right biceps brachii | atlas |
| 139 | brachialis m | brachialis muscle | 已有 | Right brachialis | atlas |
| 140 | Lat. cutaneous n | Lateral cutaneous nerve of forearm | 已有（alias） | Lateral antebrachial cutaneous nerve | nerve |
| 141 | ii. Median n | Median nerve | 已有 | Median nerve | nerve |
| 142 | med. cord | Medial cord of brachial plexus | 新增示意模型 | Right medial cord of brachial plexus | paokao |
| 143 | i. Med. pectoral n | medial pectoral nerve | 已有 | Medial pectoral nerve | nerve |
| 144 | ii. Med. cutaneous n | Medial cutaneous nerve of arm | 已有（alias） | Medial brachial cutaneous nerve | nerve |
| 145 | intercostobrachial n | Intercostobrachial nerve | 新增示意模型 | Right intercostobrachial nerve | paokao |
| 146 | iii. Med. cutaneous n | Medial cutaneous nerve of forearm | 已有（alias） | Medial antebrachial cutaneous nerve | nerve |
| 147 | ulnar n | ulnar nerve | 已有 | Ulnar nerve | nerve |
| 148 | i. Median n | Median nerve | 已有 | Median nerve | nerve |
| 149 | Ant. Interosseous n | anterior Interosseous nerve | 已有（contained） | Anterior interosseous nerve of forearm | nerve |
| 150 | carpal tunnel | Carpal tunnel | 新增示意模型 | Right carpal tunnel | paokao |
| 151 | ii. Ulnar n | Ulnar nerve | 已有 | Ulnar nerve | nerve |
| 152 | Flexor carpi ulnaris m | Flexor carpi ulnaris muscle | 已有（contained） | Humeral head of right flexor carpi ulnaris | atlas |
| 153 | i. Upper subscapular n | Superior subscapular nerve | 已有 | Superior subscapular nerve | nerve |
| 154 | ii. Middle subscapular n | Middle subscapular nerve | 已有（alias） | Thoracodorsal nerve | nerve |
| 155 | iii. Lower subscapular n | Inferior subscapular nerve | 已有 | Inferior subscapular nerve | nerve |
| 156 | i. Axillary n | Axillary nerve | 已有 | Axillary nerve | nerve |
| 157 | ii. Radial n | Radial nerve | 已有 | Radial nerve | nerve |
| 158 | Radial groove | Radial groove | 新增示意模型 | Right radial groove | paokao |
| 159 | brachioradialis m | brachioradialis muscle | 已有 | Right brachioradialis | atlas |
| 160 | iii. Superficial br | Superficial branch of radial nerve | 已有 | Superficial branch of radial nerve | nerve |
| 161 | iv. Deep br | Deep branch of radial nerve | 已有 | Deep branch of radial nerve | nerve |
| 162 | Supinator m | Supinator muscle | 已有 | Right supinator | atlas |
| 163 | Sup. trunk | Superior trunk of brachial plexus | 已有 | Superior trunk of brachial plexus | nerve |
| 164 | Superior transverse scapular ligament | Superior transverse scapular ligament | 新增示意模型 | Right superior transverse scapular ligament | paokao |
| 165 | Suprascapular a | Suprascapular artery | 已有 | Left suprascapular artery | atlas |
| 166 | infraspinatus fossa | Infraspinous fossa | 新增示意模型 | Right infraspinous fossa | paokao |
| 167 | b. Long thoracic n | Long thoracic nerve | 已有 | Long thoracic nerve | nerve |
| 168 | Serratus anterior m | Serratus anterior muscle | 已有 | Right serratus anterior | atlas |
| 169 | c. Dorsal scapular n | Dorsal scapular nerve | 已有 | Dorsal scapular nerve | nerve |
| 170 | scalis muscle | Anterior scalene muscle | 已有（alias） | Left scalenus anterior | atlas |
| 170 | scalis muscle | Middle scalene muscle | 已有（alias） | Left scalenus medius | atlas |
| 171 | dorsal scapular nerve | dorsal scapular nerve | 已有 | Dorsal scapular nerve | nerve |
| 172 | phrenic nerve | Phrenic nerve | 新增示意模型 | Right phrenic nerve | paokao |
| 173 | long thoracic nerve | long thoracic nerve | 已有 | Long thoracic nerve | nerve |
| 174 | suprascapular nerve | suprascapular nerve | 已有 | Suprascapular nerve | nerve |
| 175 | notch | Suprascapular notch | 新增示意模型 | Right suprascapular notch | paokao |
| 176 | lateral pectoral n | Lateral pectoral nerve | 已有 | Lateral pectoral nerve | nerve |
| 177 | upper subscapular nerve | Superior subscapular nerve | 已有 | Superior subscapular nerve | nerve |
| 178 | middle subscapular nerve | Middle subscapular nerve | 已有（alias） | Thoracodorsal nerve | nerve |
| 179 | thoracodorsal nerve | thoracodorsal nerve | 已有 | Thoracodorsal nerve | nerve |
| 180 | lower subscapular nerve | Inferior subscapular nerve | 已有 | Inferior subscapular nerve | nerve |
| 181 | Terminal branch |  | 略過 | 泛稱（Terminal branch＝終末支），不是特定結構 |  |
| 182 | peripheral nerve |  | 略過 | 泛稱（peripheral nerve＝周邊神經），不是特定結構 |  |
| 183 | medial pectoral n | Medial pectoral nerve | 已有 | Medial pectoral nerve | nerve |
| 184 | medial cutaneous nerve | Medial cutaneous nerve of arm | 已有（alias） | Medial brachial cutaneous nerve | nerve |
| 184 | medial cutaneous nerve | Medial cutaneous nerve of forearm | 已有（alias） | Medial antebrachial cutaneous nerve | nerve |
| 185 | posterior interosseous nerve | posterior interosseous nerve | 已有（contained） | Posterior interosseous nerve of forearm | nerve |
| 186 | lateral cord | Lateral cord of brachial plexus | 新增示意模型 | Right lateral cord of brachial plexus | paokao |
| 187 | lateral root | Lateral root of median nerve | 新增示意模型 | Right lateral root of median nerve | paokao |
| 188 | medial cord | Medial cord of brachial plexus | 新增示意模型 | Right medial cord of brachial plexus | paokao |
| 189 | medial root | Medial root of median nerve | 新增示意模型 | Right medial root of median nerve | paokao |
| 190 | thenar muscle | Thenar muscles | 已有（alias） | Right abductor pollicis brevis；Right flexor pollicis brevis；Right opponens pollicis | atlas |
| 191 | lumbrical muscle | Lumbrical muscle | 已有（contained） | Set of lumbricals of right hand | atlas |
| 192 | anterior interosseous n | anterior interosseous nerve | 已有（contained） | Anterior interosseous nerve of forearm | nerve |
| 193 | Ulnar nerve | Ulnar nerve | 已有 | Ulnar nerve | nerve |
| 194 | Recurrent br. of median n | Recurrent branch of median nerve | 新增示意模型 | Right recurrent branch of median nerve | paokao |
| 195 | b. Superficial br. of radial n | Superficial branch of radial nerve | 已有 | Superficial branch of radial nerve | nerve |
| 196 | c. common palmer digital n | Common palmar digital nerve | 已有（contained） | Common palmar digital branches of ulnar nerve | nerve |
| 197 | d. proper palmer digital n | Proper palmar digital nerve | 已有（contained） | Proper palmar digital branches of ulnar nerve | nerve |
| 198 | proper palmer digital br | Proper palmar digital nerve | 已有（contained） | Proper palmar digital branches of ulnar nerve | nerve |
| 199 | median n | median nerve | 已有 | Median nerve | nerve |
| 200 | short head of Biceps brachii m | short head of Biceps brachii muscle | 已有 | Short head of right biceps brachii | atlas |
| 201 | Subscapularis m | Subscapularis muscle | 已有 | Right subscapularis | atlas |
| 202 | Med. head of Triceps brachii m | medial head of Triceps brachii muscle | 已有 | Medial head of right triceps brachii | atlas |
| 203 | Anconeus m | Anconeus muscle | 已有 | Right anconeus | atlas |
| 204 | Teres minor m | Teres minor muscle | 已有 | Right teres minor | atlas |
| 205 | Teres major m | Teres major muscle | 已有 | Right teres major | atlas |
| 206 | long head of triceps brachii m | long head of triceps brachii muscle | 已有 | Long head of right triceps brachii | atlas |
| 207 | infraglenoid tubercle | Infraglenoid tubercle | 新增示意模型 | Right infraglenoid tubercle | paokao |
| 208 | Interval | Triangular interval | 新增示意模型 | Right triangular interval | paokao |
| 209 | Subscapular m | Subscapularis muscle | 已有 | Right subscapularis | atlas |
| 210 | medial epicondyle | Medial epicondyle of humerus | 新增示意模型 | Right medial epicondyle of humerus | paokao |
| 211 | Pronator teres m | Pronator teres muscle | 已有（contained） | Humeral head of right pronator teres | atlas |
| 212 | humeral head | Humeral head of pronator teres muscle | 已有（部分） | Humeral head of right pronator teres | atlas |
| 213 | ulnar head | Ulnar head of pronator teres muscle | 已有（部分） | Humeral head of right pronator teres | atlas |
| 214 | c. Flexor carpi radialis m | Flexor carpi radialis muscle | 已有 | Right flexor carpi radialis | atlas |
| 215 | d. Palmaris longus m | Palmaris longus muscle | 已有 | Right palmaris longus | atlas |
| 216 | e. Flexor carpi ulnaris m | Flexor carpi ulnaris muscle | 已有（contained） | Humeral head of right flexor carpi ulnaris | atlas |
| 217 | Flexor digitorum superficialis m | Flexor digitorum superficialis muscle | 已有 | Right flexor digitorum superficialis | atlas |
| 218 | Flexor digitorum profundus m | Flexor digitorum profundus muscle | 已有 | Right flexor digitorum profundus | atlas |
| 219 | b. Flexor pollicis longus m | Flexor pollicis longus muscle | 已有 | Right flexor pollicis longus | atlas |
| 220 | Pronator quadratus m | Pronator quadratus muscle | 已有 | Right pronator quadratus | atlas |
| 221 | pollicis longus m | pollicis longus muscle | 已有（contained） | Right abductor pollicis longus | atlas |
| 222 | styloid process | Styloid process of radius | 新增示意模型 | Right styloid process of radius | paokao |
| 223 | b. Extensor carpi radialis longus m | Extensor carpi radialis longus muscle | 已有 | Right extensor carpi radialis longus | atlas |
| 224 | Extensor carpi radialis brevis m | Extensor carpi radialis brevis muscle | 已有 | Right extensor carpi radialis brevis | atlas |
| 225 | d. Extensor digitorum m | Extensor digitorum muscle | 已有 | Right extensor digitorum | atlas |
| 226 | e. Extensor digiti minimi m | Extensor digiti minimi muscle | 已有 | Right extensor digiti minimi | atlas |
| 227 | f. Extensor carpi ulnaris m | Extensor carpi ulnaris muscle | 已有 | Right extensor carpi ulnaris | atlas |
| 228 | Abductor pollicis longus m | Abductor pollicis longus muscle | 已有 | Right abductor pollicis longus | atlas |
| 229 | b. Extensor pollicis brevis m | Extensor pollicis brevis muscle | 已有 | Right extensor pollicis brevis | atlas |
| 230 | c. Extensor pollicis longus m | Extensor pollicis longus muscle | 已有 | Right extensor pollicis longus | atlas |
| 231 | Extensor indicis m | Extensor indicis muscle | 已有 | Right extensor indicis | atlas |
| 232 | e. Supinator m | Supinator muscle | 已有 | Right supinator | atlas |
| 233 | Dorsal interosseous m | Dorsal interosseous muscle | 已有（alias） | Set of dorsal interossei of right hand | atlas |
| 234 | Abductor pollicis brevis m | Abductor pollicis brevis muscle | 已有 | Right abductor pollicis brevis | atlas |
| 235 | Flexor pollicis brevis m | Flexor pollicis brevis muscle | 已有 | Right flexor pollicis brevis | atlas |
| 236 | Opponens pollicis m | Opponens pollicis muscle | 已有 | Right opponens pollicis | atlas |
| 237 | Abductor digiti minimi m | Abductor digiti minimi muscle | 已有（contained） | Abductor digiti minimi of right foot | atlas |
| 238 | Flexor digiti minimi brevis m | Flexor digiti minimi brevis muscle | 已有（contained） | Flexor digiti minimi brevis of right foot | atlas |
| 239 | Opponens digiti minimi m | Opponens digiti minimi muscle | 已有（contained） | Opponens digiti minimi of right foot | atlas |
| 240 | Palmaris brevis m | Palmaris brevis muscle | 新增示意模型 | Right palmaris brevis | paokao |
| 241 | Adductor pollicis m | Adductor pollicis muscle | 已有（contained） | Oblique head of right adductor pollicis | atlas |
| 242 | transverse head | Transverse head of adductor pollicis muscle | 已有（部分） | Oblique head of right adductor pollicis | atlas |
| 243 | oblique head | Oblique head of adductor pollicis muscle | 已有（部分） | Oblique head of right adductor pollicis | atlas |
| 244 | Lumbrical m | Lumbrical muscle | 已有（contained） | Set of lumbricals of right hand | atlas |
| 245 | Palmar interosseous m | Palmar interosseous muscle | 已有（alias） | Set of palmar interossei of right hand | atlas |
| 246 | Pectoralis major m | Pectoralis major muscle | 已有（contained） | Abdominal part of right pectoralis major | atlas |
| 247 | pectoral branch of thoracoacromial a | Pectoral branch of thoracoacromial artery | 已有 | Pectoral branch of left thoraco-acromial artery | atlas |
| 248 | B. Pectoralis minor m | Pectoralis minor muscle | 已有 | Right pectoralis minor | atlas |
| 249 | C. Serratus anterior m | Serratus anterior muscle | 已有 | Right serratus anterior | atlas |
| 250 | external oblique abdominis m | External oblique muscle | 已有 | Right external oblique | atlas |
| 251 | iliac crest | Iliac crest | 新增示意模型 | Right iliac crest | paokao |
| 252 | pubic tubercle | Pubic tubercle | 新增示意模型 | Right pubic tubercle | paokao |
| 253 | External intercostal m | External intercostal muscle | 已有 | external intercostal muscle | atlas |
| 254 | external intercostal membrane | External intercostal membrane | 已有 | External intercostal membrane | joints |
| 255 | B. Internal intercostal m | Internal intercostal muscle | 已有 | internal intercostal muscle | atlas |
| 256 | internal intercostal membrane | Internal intercostal membrane | 已有 | Internal intercostal membrane | joints |
| 257 | C. Transverse thoracic m | Transverse thoracic muscle | 已有（alias） | Right transversus thoracis | atlas |
| 258 | Innermost intercostal m | Innermost intercostal muscle | 已有 | innermost intercostal muscle | atlas |
| 259 | B. Subcostal m | Subcostal muscle | 新增示意模型 | Right subcostal muscles | paokao |
| 260 | Suspensory ligament | Suspensory ligament of breast | 新增示意模型 | Right suspensory ligament of breast | paokao |
| 261 | B. Lat mammary a | Lateral mammary artery | 新增示意模型 | Right lateral mammary artery | paokao |
| 262 | C. Med. Mammary br | Medial mammary branch of internal thoracic artery | 新增示意模型 | Right medial mammary branch of internal thoracic artery | paokao |
| 263 | internal thoracic a | internal thoracic artery | 已有 | Right internal thoracic artery | atlas |
| 264 | thoracic v | Internal thoracic vein | 已有 | Right internal thoracic vein | atlas |
| 265 | Musculophrenic a | Musculophrenic artery | 已有 | Right musculophrenic artery | atlas |
| 266 | intercostal a | intercostal artery | 已有（contained） | Right superior intercostal artery | atlas |
| 267 | Sup. epigastric a | superior epigastric artery | 已有 | Right superior epigastric artery | atlas |
| 268 | rectus sheath | Rectus sheath | 新增示意模型 | rectus sheath | paokao |
| 269 | inf. epigastric a | inferior epigastric artery | 已有 | Left inferior epigastric artery | atlas |
| 270 | ant. intercostal a | Anterior intercostal artery | 新增示意模型 | Right anterior intercostal arteries | paokao |
| 270 | ant. intercostal a | Anterior intercostal vein | 已有 | Set of anterior intercostal veins | atlas |
| 271 | intercostal n | intercostal nerve | 已有 | Intercostal nerves | nerve |
| 272 | subcostal a | subcostal artery | 已有 | Right subcostal artery | atlas |
| 273 | Pericardiophrenic a | Pericardiophrenic artery | 新增示意模型 | Right pericardiophrenic artery | paokao |
| 273 | Pericardiophrenic a | Pericardiophrenic vein | 新增示意模型 | Right pericardiophrenic vein | paokao |
| 274 | B. Phrenic n | Phrenic nerve | 新增示意模型 | Right phrenic nerve | paokao |
| 275 | Thoracic duct | Thoracic duct | 新增示意模型 | Thoracic duct | paokao |
| 276 | Aortic arch | Aortic arch | 已有（alias） | Arch of aorta | atlas |
| 277 | B. Pulmonary a | Pulmonary artery | 已有 | Left pulmonary artery | atlas |
| 278 | Ligamentum arteriosum | Ligamentum arteriosum | 已有（contained） | Conus arteriosus | heart |
| 279 | left vagus n | left vagus nerve | 已有 | Vagus nerve (X) | nerve |
| 280 | left recurrent laryngeal n | left recurrent laryngeal nerve | 新增示意模型 | Right recurrent laryngeal nerve | paokao |
| 281 | right recurrent laryngeal n | right recurrent laryngeal nerve | 新增示意模型 | Right recurrent laryngeal nerve | paokao |
| 282 | right subclavian a | right subclavian artery | 已有 | Left subclavian artery | atlas |
| 283 | bronchial a | bronchial artery | 已有 | Bronchial artery | atlas |
| 284 | sympathetic trunk | sympathetic trunk | 已有 | Ganglia of sympathetic trunk | nerve |
| 285 | B. Post. intercostal v | posterior intercostal vein | 新增示意模型 | Right posterior intercostal veins | paokao |
| 286 | azygo v | Azygos vein | 已有 | Azygos vein | atlas |
| 287 | hemiazygo v | Hemiazygos vein | 已有 | Hemiazygos vein | atlas |
| 288 | C. Post. intercostal a | posterior intercostal artery | 已有 | Posterior intercostal arteries | atlas |
| 289 | Supreme intercostal a | Supreme intercostal artery | 新增示意模型 | Right supreme intercostal artery | paokao |
| 290 | Azygos v | Azygos vein | 已有 | Azygos vein | atlas |
| 291 | Azygos arch | Arch of azygos vein | 已有（部分） | Azygos vein | atlas |
| 292 | Ascending lumbar v | Ascending lumbar vein | 已有 | Left ascending lumbar vein | atlas |
| 293 | Left superior intercostal v | Left superior intercostal vein | 已有 | Left superior intercostal vein | atlas |
| 294 | Phrenic n | Phrenic nerve | 新增示意模型 | Right phrenic nerve | paokao |
| 295 | Accessory hemiazygos v | Accessory hemiazygos vein | 已有 | Accessory hemiazygos vein | atlas |
| 296 | Hemiazygos v | Hemiazygos vein | 已有 | Hemiazygos vein | atlas |
| 297 | thoracic splanchnic n | Thoracic splanchnic nerve | 新增示意模型（alias） | Right greater splanchnic nerve；Right lesser splanchnic nerve；Right least splanchnic nerve | paokao |
| 298 | B. Greater splanchnic n | Greater splanchnic nerve | 新增示意模型 | Right greater splanchnic nerve | paokao |
| 299 | celiac ganglion | celiac ganglion | 新增示意模型 | Right celiac ganglion | paokao |
| 300 | C. Lesser splanchnic n | Lesser splanchnic nerve | 新增示意模型 | Right lesser splanchnic nerve | paokao |
| 301 | aorticorenal ganglion | aorticorenal ganglion | 新增示意模型 | Right aorticorenal ganglion | paokao |
| 302 | sup. mesenteric ganglion | superior mesenteric ganglion | 新增示意模型 | Right superior mesenteric ganglion | paokao |
| 303 | D. Least splanchnic n | Least splanchnic nerve | 新增示意模型 | Right least splanchnic nerve | paokao |
| 304 | renal ganglion | renal ganglion | 新增示意模型 | Right renal ganglion | paokao |
| 305 | Post. vagal trunk | Posterior vagal trunk | 新增示意模型 | Posterior vagal trunk | paokao |
| 306 | vagus n | vagus nerve | 已有 | Vagus nerve (X) | nerve |
| 307 | esophageal plexus | esophageal plexus | 新增示意模型 | Esophageal plexus | paokao |
| 308 | posterior vagal trunk | posterior vagal trunk | 新增示意模型 | Posterior vagal trunk | paokao |
| 309 | Esophageal a | Esophageal artery | 已有 | Esophageal artery | atlas |
| 310 | Posterior intercostal a./ subcostal a | Posterior intercostal artery | 已有 | Posterior intercostal arteries | atlas |
| 310 | Posterior intercostal a./ subcostal a | Subcostal artery | 已有 | Right subcostal artery | atlas |
| 311 | Superior phrenic a | Superior phrenic artery | 新增示意模型 | Right superior phrenic artery | paokao |
| 312 | aortic hiatus | Aortic hiatus | 新增示意模型 | Aortic hiatus | paokao |
| 313 | Fibrous pericardium | Fibrous pericardium | 已有 | Fibrous pericardium | serous |
| 314 | B. Parietal layer of serous pericardium | Parietal layer of serous pericardium | 已有 | Parietal layer of serous pericardium | serous |
| 315 | C. Transverse pericardial sinus | Transverse pericardial sinus | 已有 | Transverse pericardial sinus | heart |
| 316 | D. Oblique pericardial sinus | Oblique pericardial sinus | 已有 | Oblique pericardial sinus | heart |
| 317 | Right coronary a | Right coronary artery | 已有 | Right coronary artery | heart |
| 318 | R. marginal branch | Right marginal branch of right coronary artery | 已有 | Marginal branch of right coronary artery | atlas |
| 319 | small cardiac v | small cardiac vein | 已有 | Small cardiac vein | atlas |
| 320 | Post. interventricular a | posterior interventricular artery | 已有 | Posterior interventricular branch | heart |
| 321 | middle cardiac v | middle cardiac vein | 已有 | Middle cardiac vein | atlas |
| 322 | coronary sinus | coronary sinus | 已有 | Coronary sinus | atlas |
| 323 | SA nodal a | Sinoatrial nodal artery | 已有 | Sinoatrial nodal artery | heart |
| 324 | B. Left coronary a | Left coronary artery | 已有 | Right coronary artery | heart |
| 325 | Ant. interventricular a | anterior interventricular artery | 已有 | Anterior interventricular artery | heart |
| 326 | great cardiac v | great cardiac vein | 已有 | Great cardiac vein | atlas |
| 327 | diagonal branch | diagonal branch | 已有（contained） | Diagonal branches | heart |
| 328 | Circumflex branch of left coronary a | Circumflex branch of left coronary artery | 已有 | Circumflex branch of left coronary artery | atlas |
| 329 | left marginal branch | Left marginal branch of circumflex artery | 已有（alias） | Left marginal vein | atlas |
| 330 | B. Middle cardiac v | Middle cardiac vein | 已有 | Middle cardiac vein | atlas |
| 331 | C. Small cardiac v | Small cardiac vein | 已有 | Small cardiac vein | atlas |
| 332 | D. Ant. cardiac v | anterior cardiac vein | 已有 | Anterior cardiac vein | atlas |
| 333 | E. Coronary sinus | Coronary sinus | 已有 | Coronary sinus | atlas |
| 334 | B. Interatrial septum | Interatrial septum | 已有 | Interatrial septum | heart |
| 335 | C. Pectinate m | Pectinate muscle | 已有 | Pectinate muscles | heart |
| 336 | D. Fossa | Fossa ovalis | 已有 | Fossa ovalis | heart |
| 337 | E. Opening of coronary sinus | Opening of coronary sinus | 已有（部分） | Coronary sinus | atlas |
| 338 | papillary m | Papillary muscle | 已有（contained） | Anterior papillary muscle of right ventricle | atlas |
| 339 | Interventricular septum | Interventricular septum | 已有 | Interventricular septum | heart |
| 340 | Septal papillary m | Septal papillary muscle | 已有（contained） | Septal papillary muscle of right ventricle | atlas |
| 341 | Moderator band | Moderator band | 已有（alias） | Septomarginal trabecula (moderator band) | heart |
| 342 | Supraventricular crest | Supraventricular crest | 已有 | Supraventricular crest | heart |
| 343 | Post. papillary m | Anterolateral papillary muscle of left ventricle | 已有 | Anterolateral papillary muscle of left ventricle | heart |
| 343 | Post. papillary m | Posteromedial papillary muscle of left ventricle | 已有（alias） | Inferior papillary muscle of right ventricle | heart |
| 344 | Pulmonary v | Pulmonary vein | 已有（contained） | Left superior pulmonary vein | atlas |
| 345 | C. Pulmonary lig | Pulmonary ligament | 新增示意模型 | Left pulmonary ligament | paokao |
| 346 | Lingula | Lingula of left lung | 新增示意模型 | Lingula of left lung | paokao |
| 347 | B. Oblique fissure | Oblique fissure of lung | 新增示意模型 | Oblique fissure of right lung | paokao |
| 348 | Cardiac impression | Cardiac impression | 新增示意模型（contained） | Cardiac impression of left lung | paokao |
| 349 | Groove for aortic arch | Groove for aortic arch | 新增示意模型 | Groove for aortic arch | paokao |
| 350 | Groove | Groove for descending aorta | 新增示意模型 | Groove for descending aorta | paokao |
| 351 | Groove for subclavian a | Groove for subclavian artery | 新增示意模型 | Left groove for subclavian artery | paokao |
| 352 | Groove for left brachiocephalic v | Groove for left brachiocephalic vein | 新增示意模型 | Groove for left brachiocephalic vein | paokao |
| 353 | Cardiac notch | Cardiac notch of left lung | 新增示意模型 | Cardiac notch of left lung | paokao |
| 354 | Oblique fissure | Oblique fissure of lung | 新增示意模型 | Oblique fissure of right lung | paokao |
| 355 | B. Horizontal fissure | Horizontal fissure of right lung | 新增示意模型 | Horizontal fissure of right lung | paokao |
| 356 | Groove for brachiocephalic v | Groove for brachiocephalic vein | 新增示意模型 | Groove for left brachiocephalic vein | paokao |
| 357 | Groove for azygos v | Groove for azygos vein | 新增示意模型 | Groove for azygos vein | paokao |
| 358 | gluteus maximus m | gluteus maximus muscle | 已有 | Right gluteus maximus | atlas |
| 359 | gluteus medius m | gluteus medius muscle | 已有 | Right gluteus medius | atlas |
| 360 | gluteus minimus m | gluteus minimus muscle | 已有 | Right gluteus minimus | atlas |
| 361 | piriformis m | piriformis muscle | 已有 | Right piriformis | atlas |
| 362 | sup. gemellus m | superior gemellus muscle | 已有（alias） | Right gemellus superior | atlas |
| 363 | obturator internus m | obturator internus muscle | 已有 | Right obturator internus | atlas |
| 364 | inf. gemellus m | inferior gemellus muscle | 已有（alias） | Right gemellus inferior | atlas |
| 365 | quadratus femoris m | quadratus femoris muscle | 已有 | Right quadratus femoris | atlas |
| 366 | sup. gluteal n | superior gluteal nerve | 已有 | Superior gluteal nerve | nerve |
| 367 | inf. gluteal n | inferior gluteal nerve | 新增示意模型 | Right inferior gluteal nerve | paokao |
| 368 | sciatic n | sciatic nerve | 已有 | Sciatic nerve | nerve |
| 369 | post. cutaneous nerve | Posterior cutaneous nerve of thigh | 已有（alias） | Posterior femoral cutaneous nerve | nerve |
| 370 | Nerve to obturator internus m | Nerve to obturator internus | 新增示意模型 | Right nerve to obturator internus | paokao |
| 371 | pudendal n | pudendal nerve | 已有 | Pudendal nerve | nerve |
| 372 | Internal pudendal a. v | Internal pudendal artery | 新增示意模型 | Right internal pudendal artery | paokao |
| 372 | Internal pudendal a. v | Internal pudendal vein | 已有 | Left internal pudendal vein | atlas |
| 373 | nerve to quadratus femoris m | Nerve to quadratus femoris | 已有 | Nerve to quadratus femoris muscle | nerve |
| 374 | sup. gluteal a | Superior gluteal artery | 新增示意模型 | Right superior gluteal artery | paokao |
| 374 | sup. gluteal a | Superior gluteal vein | 已有 | Left superior gluteal vein | atlas |
| 375 | superficial br | Superficial branch of superior gluteal artery | 新增示意模型 | Right superficial branch of superior gluteal artery | paokao |
| 376 | inf. gluteal a | Inferior gluteal artery | 新增示意模型 | Right inferior gluteal artery | paokao |
| 376 | inf. gluteal a | Inferior gluteal vein | 已有 | Left inferior gluteal vein | atlas |
| 377 | internal pudendal a | Internal pudendal artery | 新增示意模型 | Right internal pudendal artery | paokao |
| 377 | internal pudendal a | Internal pudendal vein | 已有 | Left internal pudendal vein | atlas |
| 378 | sacrotuberous ligament | sacrotuberous ligament | 已有 | Sacrotuberous ligament | joints |
| 379 | ischial tuberosity | Ischial tuberosity | 新增示意模型 | Right ischial tuberosity | paokao |
| 380 | sacrospinous ligament | sacrospinous ligament | 已有 | Sacrospinous ligament | joints |
| 381 | spine | Spine of ischium | 新增示意模型 | Right spine of ischium | paokao |
| 382 | Sartorius m | Sartorius muscle | 已有 | Right sartorius | atlas |
| 383 | semitendinosus m | semitendinosus muscle | 已有 | Right semitendinosus | atlas |
| 384 | Gracilis m | Gracilis muscle | 已有 | Right gracilis | atlas |
| 385 | quadriceps femoris m | quadriceps femoris muscle | 已有（alias） | Right rectus femoris；Right vastus lateralis；Right vastus medialis；Right vastus intermedius | atlas |
| 386 | Quadriceps tendon | Quadriceps tendon | 新增示意模型 | Right quadriceps tendon | paokao |
| 387 | Rectus femoris m | Rectus femoris muscle | 已有 | Right rectus femoris | atlas |
| 388 | tibial tuberosity | Tibial tuberosity | 新增示意模型 | Right tibial tuberosity | paokao |
| 389 | Vastus lateralis m | Vastus lateralis muscle | 已有 | Right vastus lateralis | atlas |
| 390 | iliotibial tract | iliotibial tract | 已有 | Right iliotibial tract | atlas |
| 391 | Vastus intermedius m | Vastus intermedius muscle | 已有 | Right vastus intermedius | atlas |
| 392 | Vastus medialis m | Vastus medialis muscle | 已有 | Right vastus medialis | atlas |
| 393 | iliopsoas m | iliopsoas muscle | 已有（alias） | Right psoas major；Right iliacus | atlas |
| 394 | iliacus m | iliacus muscle | 已有 | Right iliacus | atlas |
| 395 | psoas major m | psoas major muscle | 已有 | Right psoas major | atlas |
| 396 | inguinal lig | Inguinal ligament | 已有 | Right inguinal ligament | supplement |
| 397 | femoral n | femoral nerve | 已有 | Femoral nerve | nerve |
| 398 | tensor fasciae latae m | tensor fasciae latae muscle | 已有 | Right tensor fasciae latae | atlas |
| 399 | femoral sheath | Femoral sheath | 新增示意模型 | Right femoral sheath | paokao |
| 400 | ant. femoral n | Anterior femoral cutaneous nerve | 已有（contained） | Anterior cutaneous branches of femoral nerve | nerve |
| 401 | nerve to XXX m |  | 略過 | 佔位寫法（nerve to XXX m.＝至某肌肉之神經的通稱），不是特定結構；各肌肉支已於 370、373、402 逐一列出 |  |
| 402 | nerve to vastus medialis m | Nerve to vastus medialis | 新增示意模型 | Right nerve to vastus medialis | paokao |
| 403 | saphenous n | saphenous nerve | 已有 | Saphenous nerve | nerve |
| 404 | femoral a | femoral artery | 已有 | Left femoral artery | atlas |
| 405 | saphenous br. of descending genicular a | Saphenous branch of descending genicular artery | 新增示意模型 | Right saphenous branch of descending genicular artery | paokao |
| 406 | descending genicular a | descending genicular artery | 已有 | Left descending genicular artery | atlas |
| 407 | articular br | Articular branch of descending genicular artery | 新增示意模型 | Right articular branch of descending genicular artery | paokao |
| 408 | saphenous br | Saphenous branch of descending genicular artery | 新增示意模型 | Right saphenous branch of descending genicular artery | paokao |
| 409 | Lateral femoral cutaneous n | Lateral femoral cutaneous nerve | 已有 | Lateral femoral cutaneous nerve | nerve |
| 410 | lat. femoral cutaneous n | lateral femoral cutaneous nerve | 已有 | Lateral femoral cutaneous nerve | nerve |
| 411 | superficial circumflex iliac a | superficial circumflex iliac artery | 新增示意模型 | Right superficial circumflex iliac artery | paokao |
| 412 | superficial epigastric a | superficial epigastric artery | 已有 | Left superficial epigastric artery | atlas |
| 413 | superficial external pudendal a | superficial external pudendal artery | 新增示意模型 | Right superficial external pudendal artery | paokao |
| 414 | deep external pudendal a | deep external pudendal artery | 新增示意模型 | Right deep external pudendal artery | paokao |
| 415 | deep femoral a | deep femoral artery | 新增示意模型 | Right deep femoral artery | paokao |
| 416 | lateral circumflex femoral a | lateral circumflex femoral artery | 已有 | Left lateral circumflex femoral artery | atlas |
| 417 | Ascending br | Ascending branch of lateral circumflex femoral artery | 新增示意模型 | Right ascending branch of lateral circumflex femoral artery | paokao |
| 418 | Transverse br | Transverse branch of lateral circumflex femoral artery | 新增示意模型 | Right transverse branch of lateral circumflex femoral artery | paokao |
| 419 | Descending br | Descending branch of lateral circumflex femoral artery | 已有 | Descending branch of right lateral circumflex femoral artery | atlas |
| 420 | medial circumflex femoral a | medial circumflex femoral artery | 新增示意模型 | Right medial circumflex femoral artery | paokao |
| 421 | pectineus m | pectineus muscle | 已有 | Right pectineus | atlas |
| 422 | perforating br | Perforating branch of deep femoral artery | 新增示意模型 | Right perforating branch of deep femoral artery | paokao |
| 423 | adductor hiatus | Adductor hiatus | 新增示意模型 | Right adductor hiatus | paokao |
| 424 | femoral v | femoral vein | 已有 | Left femoral vein | atlas |
| 425 | great saphenous v | great saphenous vein | 已有 | Left great saphenous vein | atlas |
| 426 | sural n | sural nerve | 已有 | Sural nerve | nerve |
| 427 | obturator externus. m | Obturator externus muscle | 已有 | Right obturator externus | atlas |
| 428 | adductor longus m | adductor longus muscle | 已有 | Right adductor longus | atlas |
| 429 | adductor brevis m | adductor brevis muscle | 已有 | Right adductor brevis | atlas |
| 430 | obturator n | obturator nerve | 已有 | Obturator nerve | nerve |
| 431 | post. br | Posterior branch of obturator nerve | 已有 | Posterior branch of obturator nerve | nerve |
| 432 | adductor magnus m | adductor magnus muscle | 已有 | Right adductor magnus | atlas |
| 433 | Gracilis muscle | Gracilis muscle | 已有 | Right gracilis | atlas |
| 434 | B. ant. br | Anterior branch of obturator nerve | 已有 | Anterior branch of obturator nerve | nerve |
| 435 | semimembranosus m | semimembranosus muscle | 已有 | Right semimembranosus | atlas |
| 436 | long head of biceps femoris m | long head of biceps femoris muscle | 已有 | Long head of right biceps femoris | atlas |
| 437 | short head of biceps femoris m | short head of biceps femoris muscle | 已有 | Short head of right biceps femoris | atlas |
| 438 | tibial n | tibial nerve | 已有 | Tibial nerve | nerve |
| 439 | Gastrocnemius m | Gastrocnemius muscle | 已有（contained） | Lateral head of right gastrocnemius | atlas |
| 440 | common fibular n | common fibular nerve | 已有 | Common fibular nerve | nerve |
| 441 | perforating br. of deep femoral a | Perforating branch of deep femoral artery | 新增示意模型 | Right perforating branch of deep femoral artery | paokao |
| 442 | popliteal a | popliteal artery | 已有 | Left popliteal artery | atlas |
| 443 | genicular a | genicular artery | 已有（contained） | Left descending genicular artery | atlas |
| 444 | Sup. lat. genicular a | superior lateral genicular artery | 已有（alias） | Left lateral superior genicular artery | atlas |
| 445 | Inf. lat. genicular a | inferior lateral genicular artery | 已有 | Left inferior lateral genicular artery | atlas |
| 446 | Sup. med. genicular a | superior medial genicular artery | 已有（alias） | Left medial superior genicular artery | atlas |
| 447 | Inf. med. genicular a | inferior medial genicular artery | 已有 | Left inferior medial genicular artery | atlas |
| 448 | Middle genicular a | Middle genicular artery | 已有 | Left middle genicular artery | atlas |
| 449 | popliteal v | popliteal vein | 已有 | Left popliteal vein | atlas |
| 450 | small saphenous v | small saphenous vein | 已有 | Left small saphenous vein | atlas |
| 451 | medial sural cutaneous n | medial sural cutaneous nerve | 已有 | Medial sural cutaneous nerve | nerve |
| 452 | lateral sural cutaneous n | lateral sural cutaneous nerve | 新增示意模型 | Right lateral sural cutaneous nerve | paokao |
| 453 | Sural communicating br | Sural communicating branch of common fibular nerve | 已有 | Sural communicating branch of common fibular nerve | nerve |
| 454 | lateral meniscus | lateral meniscus | 已有 | Lateral meniscus | joints |
| 455 | transverse lig | Transverse ligament of knee | 已有 | Transverse ligament of knee | joints |
| 456 | Patellar lig | Patellar ligament | 新增示意模型 | Right patellar ligament | paokao |
| 457 | ant. Cruciate lig | anterior Cruciate ligament | 已有 | Anterior cruciate ligament | joints |
| 458 | post. Cruciate lig | posterior Cruciate ligament | 已有 | Posterior cruciate ligament | joints |
| 459 | fibular collateral lig | fibular collateral ligament | 已有 | Fibular collateral ligament | joints |
| 460 | tibial collateral lig | tibial collateral ligament | 已有（contained） | Deep part of tibial collateral ligament | joints |
| 461 | tendon of popliteus m | Tendon of popliteus muscle | 已有（部分） | Right popliteus | atlas |
| 462 | lat. meniscus | lateral meniscus | 已有 | Lateral meniscus | joints |
| 463 | Tibialis anterior m | Tibialis anterior muscle | 已有 | Right tibialis anterior | atlas |
| 464 | Extensor hallucis longus m | Extensor hallucis longus muscle | 已有 | Right extensor hallucis longus | atlas |
| 465 | Extensor digitorum longus m | Extensor digitorum longus muscle | 已有 | Right extensor digitorum longus | atlas |
| 466 | Fibularis tertius m | Fibularis tertius muscle | 已有 | Right fibularis tertius | atlas |
| 467 | anterior tibial a | anterior tibial artery | 已有 | Left anterior tibial artery | atlas |
| 468 | dorsalis pedis a | dorsalis pedis artery | 已有 | Right dorsalis pedis artery | atlas |
| 469 | anterior lateral malleolar a | anterior lateral malleolar artery | 新增示意模型 | Right anterior lateral malleolar artery | paokao |
| 470 | anterior medial malleolar a | anterior medial malleolar artery | 新增示意模型 | Right anterior medial malleolar artery | paokao |
| 471 | deep fibular n | deep fibular nerve | 已有 | Deep fibular nerve | nerve |
| 472 | lateral br | Lateral branch of deep fibular nerve | 新增示意模型 | Right lateral branch of deep fibular nerve | paokao |
| 473 | medial br | Medial branch of deep fibular nerve | 新增示意模型 | Right medial branch of deep fibular nerve | paokao |
| 474 | superficial fibular n | superficial fibular nerve | 已有 | Superficial fibular nerve | nerve |
| 475 | medial dorsal cutaneous n | medial dorsal cutaneous nerve | 已有（contained） | Medial dorsal cutaneous nerve of foot | nerve |
| 476 | intermediate dorsal cutaneous n | intermediate dorsal cutaneous nerve | 已有（contained） | Intermediate dorsal cutaneous nerve of foot | nerve |
| 477 | lateral dorsal cutaneous n | lateral dorsal cutaneous nerve | 新增示意模型 | Right lateral dorsal cutaneous nerve | paokao |
| 478 | fibularis longus m | fibularis longus muscle | 已有 | Right fibularis longus | atlas |
| 479 | fibularis brevis m | fibularis brevis muscle | 已有 | Right fibularis brevis | atlas |
| 480 | Sup. fibular retinaculum | superior fibular retinaculum | 新增示意模型 | Right superior fibular retinaculum | paokao |
| 481 | Inf. fibular retinaculum | inferior fibular retinaculum | 新增示意模型 | Right inferior fibular retinaculum | paokao |
| 482 | lateral head | Lateral head of gastrocnemius muscle | 已有（部分） | Lateral head of right gastrocnemius | atlas |
| 483 | Soleus m | Soleus muscle | 已有 | Right soleus | atlas |
| 484 | calcaneal tendon | calcaneal tendon | 已有 | Right calcaneal tendon | atlas |
| 485 | Plantaris m | Plantaris muscle | 已有 | Right plantaris | atlas |
| 486 | tendon of plantaris m | Tendon of plantaris muscle | 已有（部分） | Right plantaris | atlas |
| 487 | Tibialis Posterior m | Tibialis Posterior muscle | 已有 | Right tibialis posterior | atlas |
| 488 | Flexor hallucis longus m | Flexor hallucis longus muscle | 已有 | Right flexor hallucis longus | atlas |
| 489 | Flexor digitorum longus m | Flexor digitorum longus muscle | 已有 | Right flexor digitorum longus | atlas |
| 490 | tarsal tunnel | Tarsal tunnel | 新增示意模型 | Right tarsal tunnel | paokao |
| 491 | tibialis post. m | tibialis posterior muscle | 已有 | Right tibialis posterior | atlas |
| 492 | Posterior m |  | 略過 | 截斷（Posterior m.＝小腿後區肌群標題），不是特定結構；後區各肌已逐項列出 |  |
| 493 | Popliteus m | Popliteus muscle | 已有 | Right popliteus | atlas |
| 494 | Posterior tibial a | Posterior tibial artery | 已有 | Left posterior tibial artery | atlas |
| 495 | Circumflex fibular a | Circumflex fibular artery | 新增示意模型 | Right circumflex fibular artery | paokao |
| 496 | Fibular a | Fibular artery | 新增示意模型 | Right fibular artery | paokao |
| 497 | flexor retinaculum | Flexor retinaculum of ankle | 新增示意模型 | Right flexor retinaculum of ankle | paokao |
| 498 | tendon of Tibialis Posterior m | Tendon of tibialis posterior muscle | 已有（部分） | Right tibialis posterior | atlas |
| 499 | tendon of Flexor Digitorum longus m | Tendon of flexor digitorum longus muscle | 已有（部分） | Right flexor digitorum longus | atlas |
| 500 | Post. tibial Artery | posterior tibial Artery | 已有 | Left posterior tibial artery | atlas |
| 501 | Post. tibial Vein | posterior tibial Vein | 已有 | Left posterior tibial vein | atlas |
| 502 | Tibial Nerve | Tibial Nerve | 已有 | Tibial nerve | nerve |
| 503 | tendon of Flexor Hallucis longus m | Tendon of flexor hallucis longus muscle | 已有（部分） | Right flexor hallucis longus | atlas |
| 504 | extensor hallucis brevis m | extensor hallucis brevis muscle | 已有 | Right extensor hallucis brevis | atlas |
| 505 | extensor digitorum brevis m | extensor digitorum brevis muscle | 已有 | Right extensor digitorum brevis | supplement |
| 506 | sup. extensor retinaculum | Superior extensor retinaculum of foot | 新增示意模型 | Right superior extensor retinaculum of foot | paokao |
| 507 | inf. extensor retinaculum | Inferior extensor retinaculum of foot | 新增示意模型 | Right inferior extensor retinaculum of foot | paokao |
| 508 | deep plantar a | deep plantar artery | 已有 | Left deep plantar artery | atlas |
| 509 | plantar aponeurosis | plantar aponeurosis | 新增示意模型 | plantar aponeurosis | paokao |
| 510 | abductor hallucis m | abductor hallucis muscle | 已有 | Right abductor hallucis | atlas |
| 511 | flexor digitorum brevis m | flexor digitorum brevis muscle | 已有 | Right flexor digitorum brevis | atlas |
| 512 | quadratus plantae m | quadratus plantae muscle | 已有 | Right flexor accessorius | atlas |
| 513 | lat. plantar v | Lateral plantar vein | 新增示意模型 | Right lateral plantar vein | paokao |
| 514 | flexor hallucis brevis m | flexor hallucis brevis muscle | 已有（contained） | Lateral head of right flexor hallucis brevis | atlas |
| 515 | medial head | Medial head of flexor hallucis brevis muscle | 已有（部分） | Lateral head of right flexor hallucis brevis | atlas |
| 516 | adductor hallucis m | adductor hallucis muscle | 已有（contained） | Oblique head of right adductor hallucis | atlas |
| 517 | flexor digiti minimi m | flexor digiti minimi muscle | 已有（contained） | Flexor digiti minimi brevis of right foot | atlas |
| 518 | plantar interossei m | plantar interossei muscle | 已有（alias） | First plantar interosseous of right foot；Second plantar interosseous of right foot；Third plantar interosseous of right foot | atlas |
| 519 | dorsal interossei m | dorsal interossei muscle | 已有（contained） | Set of dorsal interossei of right hand | atlas |
| 520 | deep plantar arch | deep plantar arch | 已有（alias） | Left plantar arch | atlas |
| 521 | medial plantar n | medial plantar nerve | 已有 | Medial plantar nerve | nerve |
| 522 | medial plantar a | medial plantar artery | 已有 | Left medial plantar artery | atlas |
| 523 | lateral plantar n | lateral plantar nerve | 已有 | Lateral plantar nerve | nerve |
| 524 | lateral plantar a | lateral plantar artery | 已有 | Left lateral plantar artery | atlas |
| 525 | Latissimus dorsi m | Latissimus dorsi muscle | 已有 | Right latissimus dorsi | supplement |
| 526 | Rhomboid major/minor m | Rhomboid major muscle | 已有 | Right rhomboid major | atlas |
| 526 | Rhomboid major/minor m | Rhomboid minor muscle | 已有 | Right rhomboid minor | atlas |
| 527 | Levator scapulae m | Levator scapulae muscle | 已有 | Right levator scapulae | atlas |
| 528 | Serratus post. sup./inf. m | Serratus posterior superior muscle | 已有 | Right serratus posterior superior | atlas |
| 528 | Serratus post. sup./inf. m | Serratus posterior inferior muscle | 已有 | Right serratus posterior inferior | atlas |
| 529 | inf. m |  | 略過 | 截斷（inf. m.，Serratus post. sup./inf. m. 的後半），已於 528 一併列出 |  |
| 530 | Thoracolumber fascia | Thoracolumbar fascia | 新增示意模型 | thoracolumbar fascia | paokao |
| 531 | Scapula | Scapula | 已有 | Left scapula | atlas |
| 532 | Splenius cervicis m | Splenius cervicis muscle | 已有 | Right splenius cervicis | atlas |
| 533 | Longissimus m | Longissimus muscle | 已有（contained） | Right longissimus capitis | atlas |
| 534 | Iliocostalis m | Iliocostalis muscle | 已有（contained） | Right iliocostalis cervicis | atlas |
| 535 | Roof |  | 略過 | 非結構（Roof＝枕下三角的頂，即 Semispinalis capitis，已於 30 列出） |  |
| 536 | common palmer digital a | Common palmar digital artery | 已有（contained） | Left first common palmar digital artery | atlas |
| 537 | proper palmer digital a | Proper palmar digital artery | 已有（contained） | Medial proper palmar digital artery of left index finger | atlas |
| 538 | a. Suprascapular n | Suprascapular nerve | 已有 | Suprascapular nerve | nerve |
| 539 | a. Recurrent br. of median n | Recurrent branch of median nerve | 新增示意模型 | Right recurrent branch of median nerve | paokao |
| 540 | a. Pronator teres m | Pronator teres muscle | 已有（contained） | Humeral head of right pronator teres | atlas |
| 541 | a. Flexor digitorum superficialis m | Flexor digitorum superficialis muscle | 已有 | Right flexor digitorum superficialis | atlas |
| 542 | a. Flexor digitorum profundus m | Flexor digitorum profundus muscle | 已有 | Right flexor digitorum profundus | atlas |
| 543 | a. Brachioradialis m | Brachioradialis muscle | 已有 | Right brachioradialis | atlas |
| 544 | a. Abductor pollicis longus m | Abductor pollicis longus muscle | 已有 | Right abductor pollicis longus | atlas |
| 545 | Internal intercostal m | Internal intercostal muscle | 已有 | internal intercostal muscle | atlas |
| 546 | Transverse thoracic m | Transverse thoracic muscle | 已有（alias） | Right transversus thoracis | atlas |
| 547 | Subcostal m | Subcostal muscle | 新增示意模型 | Right subcostal muscles | paokao |
| 548 | Suspensory ligament of breast | Suspensory ligament of breast | 新增示意模型 | Right suspensory ligament of breast | paokao |
| 549 | Lat mammary a | Lateral mammary artery | 新增示意模型 | Right lateral mammary artery | paokao |
| 550 | Med. Mammary br. of internal thoracic a | Medial mammary branch of internal thoracic artery | 新增示意模型 | Right medial mammary branch of internal thoracic artery | paokao |
| 551 | Pulmonary a./v | Pulmonary artery | 已有 | Left pulmonary artery | atlas |
| 551 | Pulmonary a./v | Pulmonary vein | 已有（contained） | Left superior pulmonary vein | atlas |
| 552 | Superior vena cava | Superior vena cava | 已有 | Superior vena cava | atlas |
| 553 | Bronchus | Bronchus | 已有（contained） | Left main bronchus | atlas |
| 554 | Post. intercostal v | posterior intercostal vein | 新增示意模型 | Right posterior intercostal veins | paokao |
| 555 | Post. intercostal a | posterior intercostal artery | 已有 | Posterior intercostal arteries | atlas |
| 556 | Lesser splanchnic n | Lesser splanchnic nerve | 新增示意模型 | Right lesser splanchnic nerve | paokao |
| 557 | Least splanchnic n | Least splanchnic nerve | 新增示意模型 | Right least splanchnic nerve | paokao |
| 558 | Ant. / Post. vagal trunk | Anterior vagal trunk | 新增示意模型 | Anterior vagal trunk | paokao |
| 558 | Ant. / Post. vagal trunk | Posterior vagal trunk | 新增示意模型 | Posterior vagal trunk | paokao |
| 559 | Parietal layer of serous pericardium | Parietal layer of serous pericardium | 已有 | Parietal layer of serous pericardium | serous |
| 560 | Transverse pericardial sinus | Transverse pericardial sinus | 已有 | Transverse pericardial sinus | heart |
| 561 | Oblique pericardial sinus | Oblique pericardial sinus | 已有 | Oblique pericardial sinus | heart |
| 562 | marginal branch | Right marginal branch of right coronary artery | 已有 | Marginal branch of right coronary artery | atlas |
| 562 | marginal branch | Left marginal branch of circumflex artery | 已有（alias） | Left marginal vein | atlas |
| 563 | nodal a | Sinoatrial nodal artery | 已有 | Sinoatrial nodal artery | heart |
| 563 | nodal a | Atrioventricular nodal artery | 新增示意模型 | Atrioventricular nodal artery | paokao |
| 564 | Left coronary a | Left coronary artery | 已有 | Right coronary artery | heart |
| 565 | Ant. cardiac v | anterior cardiac vein | 已有 | Anterior cardiac vein | atlas |
| 566 | Interatrial septum | Interatrial septum | 已有 | Interatrial septum | heart |
| 567 | Pectinate m | Pectinate muscle | 已有 | Pectinate muscles | heart |
| 568 | Fossa ovalis | Fossa ovalis | 已有 | Fossa ovalis | heart |
| 569 | Opening of coronary sinus | Opening of coronary sinus | 已有（部分） | Coronary sinus | atlas |
| 570 | Crista terminalis | Crista terminalis | 已有 | Crista terminalis | heart |
| 571 | Pulmonary a | Pulmonary artery | 已有 | Left pulmonary artery | atlas |
| 572 | Pulmonary lig | Pulmonary ligament | 新增示意模型 | Left pulmonary ligament | paokao |
| 573 | Horizontal fissure | Horizontal fissure of right lung | 新增示意模型 | Horizontal fissure of right lung | paokao |

## 血管神經接駁修正

`scripts/topology-spec.mjs` 列出每條分支應由哪一級分出（動脈、靜脈、神經共 111 組以上），`npm run check:topology` 逐組檢查，並檢查全身 1,100+ 條血管每條至少接到另一條同類血管。以下是檢查發現後已修正的接駁（加細管連回上一級；連接管與該血管同名同概念，一起選取、顯示、隱藏）：

| 分支 | 上一級 | 原本斷開（mm） | 修正 |
| --- | --- | ---: | --- |
| Right vertebral artery | Right subclavian artery | 49.9 | 加連接管 |
| Left vertebral artery | Left subclavian artery | 49.2 | 加連接管 |
| Deltoid branch of right thoraco-acromial artery | Trunk of right thoraco-acromial artery | 14.8 | 加連接管 |
| Deltoid branch of left thoraco-acromial artery | Trunk of left thoraco-acromial artery | 15 | 加連接管 |
| Right deep brachial artery | Right brachial artery | 1.2 | 起點改到 1.298 m 高（大圓肌下緣下方）並沿肱動脈後側連到原有肱深動脈 |
| Left deep brachial artery | Left brachial artery | 1 | 起點改到 1.298 m 高（大圓肌下緣下方）並沿肱動脈後側連到原有肱深動脈 |
| Right posterior ulnar recurrent artery | Right ulnar artery | 21.6 | 加連接管 |
| Left posterior ulnar recurrent artery | Left ulnar artery | 21.6 | 加連接管 |
| Left femoral artery | Left external iliac artery | 3 | 加連接管 |
| Right lateral circumflex femoral artery | Right deep femoral artery | 19.9 | 加連接管 |
| Left lateral circumflex femoral artery | Left deep femoral artery | 24.2 | 加連接管 |

新增的示意結構（血管、神經）都在建置時檢查：起點必須落在其上一級的表面，否則 build 失敗。

## 請覆核：配對較寬鬆的已有項目

模型名稱比筆記名稱更具體（或更概括），自動配對接受；請抽查是否真是同一結構。

| 筆記名稱 | 模型名稱 | 配對 |
| --- | --- | --- |
| Trapezius muscle | Ascending part of right trapezius | contained |
| Longissimus muscle | Right longissimus capitis | contained |
| Iliocostalis muscle | Right iliocostalis cervicis | contained |
| Semispinalis muscle | Right semispinalis capitis | contained |
| Occipital artery | Right lateral occipital artery | contained |
| Thoracoacromial artery | Acromial branch of left thoraco-acromial artery | contained |
| Thoracoacromial artery | Acromial branch of left thoraco-acromial artery | contained |
| Middle collateral artery | Middle collateral branch of left deep brachial artery | contained |
| Middle collateral artery | Middle collateral branch of left deep brachial artery | contained |
| radial collateral artery | Radial collateral branch of left deep brachial artery | contained |
| Common palmar digital artery | Left first common palmar digital artery | contained |
| Proper palmar digital artery | Medial proper palmar digital artery of left index finger | contained |
| Brachial plexus | Roots of brachial plexus | contained |
| biceps brachii muscle | Long head of right biceps brachii | contained |
| anterior Interosseous nerve | Anterior interosseous nerve of forearm | contained |
| Flexor carpi ulnaris muscle | Humeral head of right flexor carpi ulnaris | contained |
| posterior interosseous nerve | Posterior interosseous nerve of forearm | contained |
| Lumbrical muscle | Set of lumbricals of right hand | contained |
| anterior interosseous nerve | Anterior interosseous nerve of forearm | contained |
| Common palmar digital nerve | Common palmar digital branches of ulnar nerve | contained |
| Proper palmar digital nerve | Proper palmar digital branches of ulnar nerve | contained |
| Proper palmar digital nerve | Proper palmar digital branches of ulnar nerve | contained |
| Pronator teres muscle | Humeral head of right pronator teres | contained |
| Flexor carpi ulnaris muscle | Humeral head of right flexor carpi ulnaris | contained |
| pollicis longus muscle | Right abductor pollicis longus | contained |
| Abductor digiti minimi muscle | Abductor digiti minimi of right foot | contained |
| Flexor digiti minimi brevis muscle | Flexor digiti minimi brevis of right foot | contained |
| Opponens digiti minimi muscle | Opponens digiti minimi of right foot | contained |
| Adductor pollicis muscle | Oblique head of right adductor pollicis | contained |
| Lumbrical muscle | Set of lumbricals of right hand | contained |
| Pectoralis major muscle | Abdominal part of right pectoralis major | contained |
| intercostal artery | Right superior intercostal artery | contained |
| Ligamentum arteriosum | Conus arteriosus | contained |
| diagonal branch | Diagonal branches | contained |
| Papillary muscle | Anterior papillary muscle of right ventricle | contained |
| Septal papillary muscle | Septal papillary muscle of right ventricle | contained |
| Pulmonary vein | Left superior pulmonary vein | contained |
| Cardiac impression | Cardiac impression of left lung | contained |
| Anterior femoral cutaneous nerve | Anterior cutaneous branches of femoral nerve | contained |
| Gastrocnemius muscle | Lateral head of right gastrocnemius | contained |
| genicular artery | Left descending genicular artery | contained |
| tibial collateral ligament | Deep part of tibial collateral ligament | contained |
| medial dorsal cutaneous nerve | Medial dorsal cutaneous nerve of foot | contained |
| intermediate dorsal cutaneous nerve | Intermediate dorsal cutaneous nerve of foot | contained |
| flexor hallucis brevis muscle | Lateral head of right flexor hallucis brevis | contained |
| adductor hallucis muscle | Oblique head of right adductor hallucis | contained |
| flexor digiti minimi muscle | Flexor digiti minimi brevis of right foot | contained |
| dorsal interossei muscle | Set of dorsal interossei of right hand | contained |
| Longissimus muscle | Right longissimus capitis | contained |
| Iliocostalis muscle | Right iliocostalis cervicis | contained |
| Common palmar digital artery | Left first common palmar digital artery | contained |
| Proper palmar digital artery | Medial proper palmar digital artery of left index finger | contained |
| Pronator teres muscle | Humeral head of right pronator teres | contained |
| Pulmonary vein | Left superior pulmonary vein | contained |
| Bronchus | Left main bronchus | contained |

## 參考來源與查證

- 位置與走向：Gray’s Anatomy for Students 第 4 版（Drake 等）、Moore’s Clinically Oriented Anatomy 第 8 版；各結構資料卡「來源」欄逐項註明。
- 先查現有模型：BodyParts3D 4.0 圖譜（2,232 件）、已匯入的 Z-Anatomy `nervous.glb`（本次把其中的交感幹與交感神經節加回圖譜）與 Z-Anatomy 心血管匯出（`work/heart-source.glb`，676 個節點）。
- Z-Anatomy 心血管匯出另有後骨間動脈、旋股內側動脈、臀上／下動脈、陰部內動脈、陰部外淺／深動脈、最上肋間動脈、膈上動脈、穿通動脈，但其座標與 BodyParts3D 圖譜的對位誤差達 1–4 公分（共同血管重心差 10–40 mm），直接放入會浮在身體外，因此本次這些結構改以示意管狀模型，起點貼在圖譜母血管上；日後若做逐結構對位，可改用 Z-Anatomy 幾何。
- 骨性標誌、肺的裂、溝、壓跡：直接標在圖譜骨骼與肺葉表面（高出表面 0.3 mm 的薄片），不另載外部模型。
- 筋膜、鞘、支持帶、腱膜、間隙：公開人體圖譜都沒有，依解剖位置做示意模型（半透明片或帶）。

## 授權

全部新增結構為本專案產生，沒有第三方幾何；詳見 `public/model_sources.json` 的 `schematic-paokao`。
