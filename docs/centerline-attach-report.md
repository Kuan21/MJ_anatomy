# 中心線上一級關係試量報告（自動產生，勿手動修改）

由 `node scripts/report-centreline-attach.mjs --write` 產生。這是連續性檢查的試量，**沒有基準、未納入檢查、沒有改模型**；數值沒有在 3D 畫面確認。

量法：依 `scripts/topology-spec.mjs` 的每個上一級關係，逐件抽出子結構與上一級的中心線（`scripts/lib/centreline-pieces.mjs`），「子端到上一級管壁」是子結構中心線的端點到上一級中心線的距離扣掉上一級在該處的半徑（0 代表端點在上一級的管壁以內）；「任一方向」另外也算上一級的端點到子結構管壁、以及兩者端點對端點，取最小。

限制：本次未含：supplement/supplement-stream.json.gz、serous/serous-stream.json.gz、female/female-stream.json.gz（這些生成檔不在本機）；也沒有載入示意血管的連接管，所以這裡列出的空隙有些在網站上是由連接管補上的，**不能直接當成缺陷清單**。中心線是由網格表面推算的軸心，分支多的粗血管半徑仍可能有誤差。

共 187 個關係：量到 127 個、本機沒有網格 60 個、抽不出中心線 0 個。

| 子端到上一級管壁 | 關係數 | 任一方向 | 關係數 |
| --- | --- | --- | --- |
| 超過 3 mm | 11 | 超過 3 mm | 11 |
| 超過 6 mm | 10 | 超過 6 mm | 10 |
| 超過 12 mm | 9 | 超過 12 mm | 9 |
| 超過 25 mm | 4 | 超過 25 mm | 4 |

## 超過 3 mm 的關係（11 個）

| 類別 | 子結構 | 上一級 | 子端到上一級管壁 | 任一方向 | 子中心線數 | 上一級中心線數 |
| --- | --- | --- | --- | --- | --- | --- |
| 動脈 | Right vertebral artery | Right subclavian artery | 50.9 mm | 50.9 mm | 1 | 1 |
| 動脈 | Left vertebral artery | Left subclavian artery | 50 mm | 50 mm | 1 | 1 |
| 動脈 | Left arteria radialis indicis | Left radial artery | 29 mm | 29 mm | 2 | 1 |
| 動脈 | Right arteria radialis indicis | Right radial artery | 28.3 mm | 28.3 mm | 2 | 1 |
| 動脈 | Right posterior ulnar recurrent artery | Right ulnar artery | 23 mm | 23 mm | 1 | 1 |
| 動脈 | Left posterior ulnar recurrent artery | Left ulnar artery | 21.5 mm | 21.5 mm | 1 | 1 |
| 動脈 | Deltoid branch of right thoraco-acromial artery | Trunk of right thoraco-acromial artery | 16.5 mm | 16.5 mm | 1 | 1 |
| 動脈 | Deltoid branch of left thoraco-acromial artery | Trunk of left thoraco-acromial artery | 16.1 mm | 16.1 mm | 1 | 1 |
| 靜脈 | Left deep palmar venous arch | Left radial vein | 12.1 mm | 12.1 mm | 1 | 1 |
| 靜脈 | Right deep palmar venous arch | Right radial vein | 11.4 mm | 11.4 mm | 1 | 1 |
| 動脈 | Right femoral artery | Right external iliac artery | 5.6 mm | 5.6 mm | 1 | 1 |

## 3 mm 以內的關係（116 個）

| 類別 | 子結構 | 上一級 | 子端到上一級管壁 | 任一方向 | 子中心線數 | 上一級中心線數 |
| --- | --- | --- | --- | --- | --- | --- |
| 動脈 | Left femoral artery | Left external iliac artery | 2.9 mm | 2.9 mm | 1 | 1 |
| 動脈 | Right subscapular artery | Right axillary artery | 1.9 mm | 1.9 mm | 1 | 1 |
| 動脈 | Right thoracodorsal artery | Right subscapular artery | 1.4 mm | 1 mm | 1 | 1 |
| 動脈 | Right common iliac artery | Abdominal aorta | 1.4 mm | 0 mm | 1 | 1 |
| 動脈 | Trunk of right thoraco-acromial artery | Right axillary artery | 1.3 mm | 1.3 mm | 1 | 1 |
| 動脈 | Left second common palmar digital artery | Left superficial palmar arterial arch | 1.1 mm | 1.1 mm | 1 | 1 |
| 動脈 | Left subclavian artery | Arch of aorta | 0.8 mm | 0.8 mm | 1 | 1 |
| 動脈 | Right popliteal artery | Right femoral artery | 0.8 mm | 0 mm | 1 | 1 |
| 動脈 | Left common carotid artery | Arch of aorta | 0.7 mm | 0.7 mm | 1 | 1 |
| 動脈 | Right posterior circumflex humeral artery | Right axillary artery | 0.7 mm | 0.7 mm | 2 | 1 |
| 靜脈 | Right median cubital vein | Right cephalic vein | 0.7 mm | 0.7 mm | 1 | 1 |
| 動脈 | Right thyrocervical trunk | Right subclavian artery | 0.6 mm | 0.6 mm | 1 | 1 |
| 動脈 | Left subscapular artery | Left axillary artery | 0.6 mm | 0.6 mm | 1 | 1 |
| 動脈 | Right anterior circumflex humeral artery | Right axillary artery | 0.3 mm | 0.3 mm | 1 | 1 |
| 動脈 | Left posterior circumflex humeral artery | Left axillary artery | 0.3 mm | 0.3 mm | 2 | 1 |
| 靜脈 | Left medial brachial vein | Left axillary vein | 0.3 mm | 0 mm | 1 | 1 |
| 動脈 | Right suprascapular artery | Right thyrocervical trunk | 0.2 mm | 0 mm | 1 | 1 |
| 動脈 | Brachiocephalic artery | Arch of aorta | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right subclavian artery | Brachiocephalic artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right common carotid artery | Brachiocephalic artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right internal thoracic artery | Right subclavian artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left internal thoracic artery | Left subclavian artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left thyrocervical trunk | Left subclavian artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left suprascapular artery | Left thyrocervical trunk | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right transverse cervical artery | Right thyrocervical trunk | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left transverse cervical artery | Left thyrocervical trunk | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right dorsal scapular artery | Right transverse cervical artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left dorsal scapular artery | Left transverse cervical artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Trunk of left thoraco-acromial artery | Left axillary artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Pectoral branch of right thoraco-acromial artery | Trunk of right thoraco-acromial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Pectoral branch of left thoraco-acromial artery | Trunk of left thoraco-acromial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Acromial branch of right thoraco-acromial artery | Trunk of right thoraco-acromial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Acromial branch of left thoraco-acromial artery | Trunk of left thoraco-acromial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right lateral thoracic artery | Right axillary artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left lateral thoracic artery | Left axillary artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right circumflex scapular artery | Right subscapular artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left circumflex scapular artery | Left subscapular artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left thoracodorsal artery | Left subscapular artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left anterior circumflex humeral artery | Left axillary artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right brachial artery | Right axillary artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left brachial artery | Left axillary artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right deep brachial artery | Right brachial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left deep brachial artery | Left brachial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Middle collateral branch of right deep brachial artery | Right deep brachial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Middle collateral branch of left deep brachial artery | Left deep brachial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Radial collateral branch of right deep brachial artery | Right deep brachial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Radial collateral branch of left deep brachial artery | Left deep brachial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right superior ulnar collateral artery | Right brachial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left superior ulnar collateral artery | Left brachial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right inferior ulnar collateral artery | Right brachial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left inferior ulnar collateral artery | Left brachial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right radial artery | Right brachial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left radial artery | Left brachial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right ulnar artery | Right brachial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left ulnar artery | Left brachial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right radial recurrent artery | Right radial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left radial recurrent artery | Left radial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right anterior ulnar recurrent artery | Right ulnar artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left anterior ulnar recurrent artery | Left ulnar artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right common interosseous artery | Right ulnar artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left common interosseous artery | Left ulnar artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right anterior interosseous artery | Right common interosseous artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left anterior interosseous artery | Left common interosseous artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right recurrent interosseous artery | Right common interosseous artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left recurrent interosseous artery | Left common interosseous artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right superficial palmar arterial arch | Right ulnar artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left superficial palmar arterial arch | Left ulnar artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right deep palmar arch | Right radial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left deep palmar arch | Left radial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right first common palmar digital artery | Right superficial palmar arterial arch | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left first common palmar digital artery | Left superficial palmar arterial arch | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right second common palmar digital artery | Right superficial palmar arterial arch | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right third common palmar digital artery | Right superficial palmar arterial arch | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left third common palmar digital artery | Left superficial palmar arterial arch | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right fourth common palmar digital artery | Right superficial palmar arterial arch | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left fourth common palmar digital artery | Left superficial palmar arterial arch | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right arteria princeps pollicis | Right radial artery | 0 mm | 0 mm | 2 | 1 |
| 動脈 | Left arteria princeps pollicis | Left radial artery | 0 mm | 0 mm | 2 | 1 |
| 動脈 | Left common iliac artery | Abdominal aorta | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right external iliac artery | Right common iliac artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left external iliac artery | Left common iliac artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right internal iliac artery | Right common iliac artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left internal iliac artery | Left common iliac artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left popliteal artery | Left femoral artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right anterior tibial artery | Right popliteal artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left anterior tibial artery | Left popliteal artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right posterior tibial artery | Right popliteal artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left posterior tibial artery | Left popliteal artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right fibular artery | Right posterior tibial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left fibular artery | Left posterior tibial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right dorsalis pedis artery | Right anterior tibial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left dorsalis pedis artery | Left anterior tibial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right medial plantar artery | Right posterior tibial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left medial plantar artery | Left posterior tibial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right lateral plantar artery | Right posterior tibial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left lateral plantar artery | Left posterior tibial artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Right descending genicular artery | Right femoral artery | 0 mm | 0 mm | 1 | 1 |
| 動脈 | Left descending genicular artery | Left femoral artery | 0 mm | 0 mm | 1 | 1 |
| 靜脈 | Right axillary vein | Right subclavian vein | 0 mm | 0 mm | 1 | 1 |
| 靜脈 | Left axillary vein | Left subclavian vein | 0 mm | 0 mm | 1 | 1 |
| 靜脈 | Right cephalic vein | Right axillary vein | 0 mm | 0 mm | 1 | 1 |
| 靜脈 | Left cephalic vein | Left axillary vein | 0 mm | 0 mm | 1 | 1 |
| 靜脈 | Right basilic vein | Right axillary vein | 0 mm | 0 mm | 1 | 1 |
| 靜脈 | Left basilic vein | Left axillary vein | 0 mm | 0 mm | 1 | 1 |
| 靜脈 | Right medial brachial vein | Right axillary vein | 0 mm | 0 mm | 1 | 1 |
| 靜脈 | Right radial vein | Right medial brachial vein | 0 mm | 0 mm | 1 | 1 |
| 靜脈 | Left radial vein | Left medial brachial vein | 0 mm | 0 mm | 1 | 1 |
| 靜脈 | Right ulnar vein | Right medial brachial vein | 0 mm | 0 mm | 1 | 1 |
| 靜脈 | Left ulnar vein | Left medial brachial vein | 0 mm | 0 mm | 1 | 1 |
| 靜脈 | Left median cubital vein | Left cephalic vein | 0 mm | 0 mm | 1 | 1 |
| 靜脈 | Right median cubital vein | Right basilic vein | 0 mm | 0 mm | 1 | 1 |
| 靜脈 | Left median cubital vein | Left basilic vein | 0 mm | 0 mm | 1 | 1 |
| 靜脈 | Right superficial palmar venous arch | Right ulnar vein | 0 mm | 0 mm | 1 | 1 |
| 靜脈 | Left superficial palmar venous arch | Left ulnar vein | 0 mm | 0 mm | 1 | 1 |
| 靜脈 | Right lateral thoracic vein | Right axillary vein | 0 mm | 0 mm | 1 | 1 |
| 靜脈 | Left lateral thoracic vein | Left axillary vein | 0 mm | 0 mm | 1 | 1 |

## 抽不出中心線（0 個）

| 類別 | 子結構 | 上一級 | 抽不出的結構 |
| --- | --- | --- | --- |


## 本機沒有網格（60 個）

多數是要有示意血管（跑考串流）或缺少的生成檔才有的結構。

| 類別 | 子結構 | 上一級 | 缺少的結構 |
| --- | --- | --- | --- |
| 動脈 | Right superior thoracic artery | Right axillary artery | Right superior thoracic artery |
| 動脈 | Left superior thoracic artery | Left axillary artery | Left superior thoracic artery |
| 動脈 | Clavicular branch of right thoraco-acromial artery | Trunk of right thoraco-acromial artery | Clavicular branch of right thoraco-acromial artery |
| 動脈 | Clavicular branch of left thoraco-acromial artery | Trunk of left thoraco-acromial artery | Clavicular branch of left thoraco-acromial artery |
| 動脈 | Right posterior interosseous artery | Right common interosseous artery | Right posterior interosseous artery |
| 動脈 | Left posterior interosseous artery | Left common interosseous artery | Left posterior interosseous artery |
| 動脈 | Right superficial palmar branch of radial artery | Right radial artery | Right superficial palmar branch of radial artery |
| 動脈 | Left superficial palmar branch of radial artery | Left radial artery | Left superficial palmar branch of radial artery |
| 動脈 | Right deep palmar branch of ulnar artery | Right ulnar artery | Right deep palmar branch of ulnar artery |
| 動脈 | Left deep palmar branch of ulnar artery | Left ulnar artery | Left deep palmar branch of ulnar artery |
| 動脈 | Right deep femoral artery | Right femoral artery | Right deep femoral artery |
| 動脈 | Left deep femoral artery | Left femoral artery | Left deep femoral artery |
| 動脈 | Right lateral circumflex femoral artery | Right deep femoral artery | Right deep femoral artery |
| 動脈 | Left lateral circumflex femoral artery | Left deep femoral artery | Left deep femoral artery |
| 動脈 | Right medial circumflex femoral artery | Right deep femoral artery | Right medial circumflex femoral artery |
| 動脈 | Left medial circumflex femoral artery | Left deep femoral artery | Left medial circumflex femoral artery |
| 動脈 | Right superior gluteal artery | Right internal iliac artery | Right superior gluteal artery |
| 動脈 | Left superior gluteal artery | Left internal iliac artery | Left superior gluteal artery |
| 動脈 | Right inferior gluteal artery | Right internal iliac artery | Right inferior gluteal artery |
| 動脈 | Left inferior gluteal artery | Left internal iliac artery | Left inferior gluteal artery |
| 動脈 | Right internal pudendal artery | Right internal iliac artery | Right internal pudendal artery |
| 動脈 | Left internal pudendal artery | Left internal iliac artery | Left internal pudendal artery |
| 靜脈 | Right posterior circumflex humeral vein | Right axillary vein | Right posterior circumflex humeral vein |
| 靜脈 | Left posterior circumflex humeral vein | Left axillary vein | Left posterior circumflex humeral vein |
| 靜脈 | Right lateral brachial vein | Right axillary vein | Right lateral brachial vein |
| 靜脈 | Left lateral brachial vein | Left axillary vein | Left lateral brachial vein |
| 靜脈 | Right anterior interosseous vein | Right ulnar vein | Right anterior interosseous vein |
| 靜脈 | Left anterior interosseous vein | Left ulnar vein | Left anterior interosseous vein |
| 靜脈 | Right posterior interosseous vein | Right ulnar vein | Right posterior interosseous vein |
| 靜脈 | Left posterior interosseous vein | Left ulnar vein | Left posterior interosseous vein |
| 靜脈 | Right thoracoepigastric vein | Right lateral thoracic vein | Right thoracoepigastric vein |
| 靜脈 | Left thoracoepigastric vein | Left lateral thoracic vein | Left thoracoepigastric vein |
| 神經 | Musculocutaneous nerve.r | Right lateral cord of brachial plexus | Right lateral cord of brachial plexus |
| 神經 | Musculocutaneous nerve.l | Left lateral cord of brachial plexus | Left lateral cord of brachial plexus |
| 神經 | Median nerve.r | Right lateral root of median nerve | Right lateral root of median nerve |
| 神經 | Median nerve.l | Left lateral root of median nerve | Left lateral root of median nerve |
| 神經 | Median nerve.r | Right medial root of median nerve | Right medial root of median nerve |
| 神經 | Median nerve.l | Left medial root of median nerve | Left medial root of median nerve |
| 神經 | Ulnar nerve.r | Right medial cord of brachial plexus | Right medial cord of brachial plexus |
| 神經 | Ulnar nerve.l | Left medial cord of brachial plexus | Left medial cord of brachial plexus |
| 神經 | Right lateral root of median nerve | Right lateral cord of brachial plexus | Right lateral root of median nerve |
| 神經 | Left lateral root of median nerve | Left lateral cord of brachial plexus | Left lateral root of median nerve |
| 神經 | Right medial root of median nerve | Right medial cord of brachial plexus | Right medial root of median nerve |
| 神經 | Left medial root of median nerve | Left medial cord of brachial plexus | Left medial root of median nerve |
| 神經 | Right intercostobrachial nerve | Right second rib | Right intercostobrachial nerve |
| 神經 | Left intercostobrachial nerve | Left second rib | Left intercostobrachial nerve |
| 神經 | Right greater splanchnic nerve | Sympathetic trunk.r | Right greater splanchnic nerve |
| 神經 | Left greater splanchnic nerve | Sympathetic trunk.l | Left greater splanchnic nerve |
| 神經 | Right lesser splanchnic nerve | Sympathetic trunk.r | Right lesser splanchnic nerve |
| 神經 | Left lesser splanchnic nerve | Sympathetic trunk.l | Left lesser splanchnic nerve |
| 神經 | Right least splanchnic nerve | Sympathetic trunk.r | Right least splanchnic nerve |
| 神經 | Left least splanchnic nerve | Sympathetic trunk.l | Left least splanchnic nerve |
| 神經 | Right recurrent branch of median nerve | Median nerve.r | Right recurrent branch of median nerve |
| 神經 | Left recurrent branch of median nerve | Median nerve.l | Left recurrent branch of median nerve |
| 神經 | Right lateral dorsal cutaneous nerve | Sural nerve.r | Right lateral dorsal cutaneous nerve |
| 神經 | Left lateral dorsal cutaneous nerve | Sural nerve.l | Left lateral dorsal cutaneous nerve |
| 神經 | Right inferior gluteal nerve | Sciatic nerve.r | Right inferior gluteal nerve |
| 神經 | Left inferior gluteal nerve | Sciatic nerve.l | Left inferior gluteal nerve |
| 神經 | Right nerve to obturator internus | Sciatic nerve.r | Right nerve to obturator internus |
| 神經 | Left nerve to obturator internus | Sciatic nerve.l | Left nerve to obturator internus |
