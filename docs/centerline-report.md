# 中心線抽取報告（自動產生，勿手動修改）

由 `node scripts/report-centerlines.mjs --write` 產生。共 1449 個血管與神經網格（本次未含：supplement/supplement-stream.json.gz、serous/serous-stream.json.gz、female/female-stream.json.gz，這些生成檔不在本機），抽取成功且通過檢查：動脈 636、靜脈 403、神經 384；列出 26 個。

判讀：「jump」是相鄰兩圈的距離超過 20 mm，而且沿表面的距離解釋不了（可能是抽取走錯或網格有斷口）；「length only」是很短的結構（例如腦神經根）；「fewer than 2 rings」是形狀不是管（例如交感幹神經節）。這些是量測用的提示，不是已確認的缺陷。

| 系統 | 結構 | 原因 |
| --- | --- | --- |
| nervous | Left ciliary ganglion | length only 2.3 mm |
| nervous | Right ciliary ganglion | length only 2.5 mm |
| arterial | Right pericallosal artery | fewer than 2 rings |
| arterial | Left pericallosal artery | fewer than 2 rings |
| nervous | Habenula | length only 1.0 mm |
| nervous | Interpeduncular fossa | length only 1.2 mm |
| nervous | Interpeduncular fossa | length only 1.6 mm |
| venous | Right portal vein | fewer than 2 rings |
| arterial | Posterior division of left renal artery | fewer than 2 rings |
| nervous | Oculomotor nerve (III).r | length only 1.8 mm |
| nervous | Oculomotor nerve (III).l | length only 1.8 mm |
| nervous | Ophthalmic nerve.r | length only 2.6 mm |
| nervous | Ophthalmic nerve.l | length only 2.6 mm |
| nervous | Motor root of trigeminal nerve.l | length only 1.9 mm |
| nervous | Motor root of trigeminal nerve.r | length only 1.9 mm |
| nervous | Facial nerve (VII).r | length only 2.8 mm |
| nervous | Facial nerve (VII).l | length only 2.8 mm |
| nervous | Vestibular nerve.l | length only 2.1 mm |
| nervous | Vestibular nerve.r | length only 2.1 mm |
| nervous | Vestibulocochlear nerve (VIII).l | length only 2.7 mm |
| nervous | Vestibulocochlear nerve (VIII).r | length only 2.7 mm |
| nervous | Vagus nerve (X).l | length only 2.9 mm |
| nervous | Abducens nerve (VI).r | length only 1.7 mm |
| nervous | Abducens nerve (VI).l | length only 1.7 mm |
| nervous | Ganglia of sympathetic trunk.r | fewer than 2 rings |
| nervous | Ganglia of sympathetic trunk.l | fewer than 2 rings |

## 網格較粗、圈距較大（不算斷開，115 個）

這些網格的三角形很長，兩圈之間表面上沒有頂點，所以相鄰兩圈相距超過 20 mm；沿表面的距離與圈距相符，管子本身是連續的。之前的版本把它們列為「jump」。中心線在這一段是直線，用於連續性檢查時位置誤差較大。

| 系統 | 結構 | 最大圈距 |
| --- | --- | --- |
| venous | Left femoral vein | 88 mm |
| arterial | Left femoral artery | 85 mm |
| venous | Right femoral vein | 80 mm |
| arterial | Right femoral artery | 79 mm |
| venous | Left cephalic vein | 68 mm |
| arterial | Descending branch of right lateral circumflex femoral artery | 56 mm |
| venous | Inferior vena cava | 54 mm |
| venous | Right great saphenous vein | 51 mm |
| arterial | Descending aorta | 48 mm |
| arterial | Descending thoracic aorta | 45 mm |
| arterial | Abdominal aorta | 45 mm |
| venous | Right superior gluteal vein | 44 mm |
| arterial | Right superficial epigastric artery | 43 mm |
| arterial | Descending branch of left lateral circumflex femoral artery | 42 mm |
| arterial | Right anterior tibial artery | 42 mm |
| venous | Right posterior basal segmental vein | 42 mm |
| venous | Left superior gluteal vein | 42 mm |
| venous | Hepatovenous segment VIII | 41 mm |
| venous | Left common iliac vein | 40 mm |
| venous | Left great saphenous vein | 39 mm |
| arterial | Left common iliac artery | 39 mm |
| venous | Left apical segmental vein | 38 mm |
| arterial | Mediobasal branch of right posterior basal segmental artery | 38 mm |
| venous | Inferior vena cava | 38 mm |
| venous | Right deep femoral vein | 36 mm |
| venous | Left deep femoral vein | 35 mm |
| venous | Left external iliac vein | 34 mm |
| venous | Left lateral thoracic vein | 33 mm |
| venous | Right basilic vein | 32 mm |
| venous | Right ulnar vein | 32 mm |
| arterial | Inferior lingular artery | 32 mm |
| nervous | Superior gluteal nerve.l | 32 mm |
| nervous | Superior gluteal nerve.r | 32 mm |
| arterial | Left anterior tibial artery | 31 mm |
| arterial | Set of perforating arteries | 31 mm |
| venous | Right cephalic vein | 31 mm |
| venous | Hepatovenous segment IV | 31 mm |
| arterial | Right brachial artery | 30 mm |
| venous | Right lateral basal segmental vein | 30 mm |
| arterial | Right internal carotid artery | 29 mm |
| arterial | Left internal carotid artery | 29 mm |
| arterial | Right musculophrenic artery | 29 mm |
| arterial | Left lateral thoracic artery | 29 mm |
| venous | Right internal thoracic vein | 29 mm |
| venous | Left small saphenous vein | 29 mm |
| venous | Left ulnar vein | 29 mm |
| arterial | Right anterior circumflex humeral artery | 29 mm |
| arterial | Right second posterior intercostal artery | 28 mm |
| arterial | Left posterior tibial artery | 28 mm |
| venous | Right superficial epigastric vein | 28 mm |
| venous | Right medial brachial vein | 28 mm |
| arterial | Set of perforating arteries | 27 mm |
| arterial | Left brachial artery | 27 mm |
| arterial | Left anterior ulnar recurrent artery | 27 mm |
| arterial | Left lateral basal segmental artery | 27 mm |
| arterial | Right common iliac artery | 27 mm |
| arterial | Right internal thoracic artery | 26 mm |
| venous | Left anterior tibial vein | 26 mm |
| venous | Left medial brachial vein | 26 mm |
| arterial | Right inferior phrenic artery | 26 mm |
| arterial | Right superior epigastric artery | 25 mm |
| arterial | Left second posterior intercostal artery | 25 mm |
| venous | Left median antebrachial vein | 25 mm |
| venous | Right median antebrachial vein | 25 mm |
| arterial | Left arteria princeps pollicis | 25 mm |
| arterial | Pectoral branch of right thoraco-acromial artery | 25 mm |
| venous | Inferior part of medial segmental vein | 25 mm |
| venous | Inferior mesenteric vein | 25 mm |
| venous | Left internal iliac vein | 25 mm |
| arterial | Right lateral thoracic artery | 24 mm |
| venous | Right fibular vein | 24 mm |
| venous | Hepatovenous segment II | 24 mm |
| arterial | Left anterior basal segmental artery | 24 mm |
| venous | Left anterior basal segmental vein | 24 mm |
| arterial | Left external iliac artery | 24 mm |
| venous | Left internal iliac vein | 24 mm |
| arterial | Superior rectal artery | 24 mm |
| venous | Hepatovenous segment IX | 23 mm |
| arterial | Right posterior tibial artery | 23 mm |
| arterial | Right anterior interosseous artery | 23 mm |
| arterial | Right anterior ulnar recurrent artery | 23 mm |
| venous | Proper palmar digital vein of right little finger | 23 mm |
| venous | Left lateral basal segmental vein | 23 mm |
| venous | Right common iliac vein | 23 mm |
| arterial | Posterior intercostal arteries | 22 mm |
| venous | Left medial circumflex femoral vein | 22 mm |
| venous | Left axillary vein | 22 mm |
| venous | Left lateral basal segmental vein | 22 mm |
| venous | Superior part of medial segmental vein | 22 mm |
| venous | Right internal iliac vein | 22 mm |
| arterial | Right subclavian artery | 22 mm |
| venous | Right superior epigastric vein | 22 mm |
| nervous | Orbital gyrus | 21 mm |
| venous | Set of anterior intercostal veins | 21 mm |
| arterial | Left fibular artery | 21 mm |
| arterial | Right lateral circumflex femoral artery | 21 mm |
| venous | Right popliteal vein | 21 mm |
| arterial | Pectoral branch of left thoraco-acromial artery | 21 mm |
| arterial | Lateral proper palmar digital artery of left little finger | 21 mm |
| venous | Hepatovenous segment III | 21 mm |
| arterial | Left posterior basal segmental artery | 21 mm |
| venous | Right lateral basal segmental vein | 21 mm |
| venous | Left internal iliac vein | 21 mm |
| venous | Left subclavian vein | 21 mm |
| venous | Right internal iliac vein | 21 mm |
| arterial | Trunk of superior mesenteric artery | 21 mm |
| venous | Left superficial epigastric vein | 20 mm |
| venous | Left fibular vein | 20 mm |
| arterial | Right deep brachial artery | 20 mm |
| arterial | Medial proper palmar digital artery of right index finger | 20 mm |
| arterial | Lateral branch of right lateral basal segmental artery | 20 mm |
| venous | Left ascending lumbar vein | 20 mm |
| venous | Left external iliac vein | 20 mm |
| venous | Left superior epigastric vein | 20 mm |
| arterial | Right internal iliac artery | 20 mm |

## 由多件組成的網格（252 個）

上面的檢查只沿其中一件走。這裡逐件抽取中心線：「中心線」是抽得出至少兩圈的件數，「略過」是太小或形狀不是管的件數，「最大件距」是各件的中心線端點到最近另一件端點的距離（已扣半徑）當中最大的一個。件距大不一定是缺陷（例如同一名稱下本來就分開的分支，或端點不是相接處），只是提示要看哪些結構。

「分類」只看名稱與 `scripts/topology-spec.mjs`，不是解剖判斷：「應相接」是 topology-spec 列為上一級或分支的單一結構（4 個，其中連接距離超過 5 mm 的 0 個）；「成組」是名稱本身表示多條的結構（Set of、複數、plexus；65 個），各件本來分開，件距沒有意義；「未判定」是單數名稱但 topology-spec 沒有列出（183 個，其中連接距離超過 5 mm 的 54 個），需要人看。「連接距離」是把所有中心線連成一個整體時必須跨過的最大空隙（端點對端點，或端點到另一件的管壁），0 代表各件相接。表格依分類、再依連接距離排列。

| 系統 | 結構 | 分類 | 件數 | 中心線 | 略過 | 最大件距 | 連接距離 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| nervous | Sciatic nerve.r | 應相接 | 3 | 3 | 0 | 46 mm | 0 mm |
| nervous | Sciatic nerve.l | 應相接 | 3 | 3 | 0 | 46 mm | 0 mm |
| nervous | Sural nerve.r | 應相接 | 2 | 2 | 0 | 35 mm | 0 mm |
| nervous | Sural nerve.l | 應相接 | 2 | 2 | 0 | 34 mm | 0 mm |
| arterial | Marginal colic artery | 未判定 | 5 | 5 | 0 | 71 mm | 102 mm |
| arterial | Marginal artery of colon | 未判定 | 5 | 5 | 0 | 71 mm | 102 mm |
| venous | Left fibular vein | 未判定 | 4 | 4 | 0 | 45 mm | 69 mm |
| venous | Superior phrenic vein | 未判定 | 3 | 3 | 0 | 68 mm | 68 mm |
| venous | Anterior inferior segmental branch of right portal vein | 未判定 | 5 | 5 | 0 | 55 mm | 52 mm |
| venous | Posterior superior segmental branch of right portal vein | 未判定 | 6 | 6 | 0 | 49 mm | 46 mm |
| venous | Left portal vein | 未判定 | 3 | 3 | 0 | 51 mm | 45 mm |
| arterial | Right lobe branch of right hepatic artery | 未判定 | 5 | 5 | 0 | 24 mm | 44 mm |
| arterial | Right lobe branch of right hepatic artery | 未判定 | 5 | 5 | 0 | 24 mm | 44 mm |
| venous | Right portal vein | 未判定 | 10 | 10 | 0 | 22 mm | 39 mm |
| arterial | Lateral superior segmental hepatic artery | 未判定 | 2 | 2 | 0 | 40 mm | 39 mm |
| nervous | Spinal ganglion.r | 未判定 | 21 | 21 | 0 | 31 mm | 35 mm |
| nervous | Spinal ganglion.l | 未判定 | 21 | 21 | 0 | 31 mm | 35 mm |
| arterial | Lumbar artery | 未判定 | 4 | 4 | 0 | 35 mm | 35 mm |
| nervous | Anterior root of spinal nerve.r | 未判定 | 21 | 21 | 0 | 28 mm | 33 mm |
| nervous | Anterior root of spinal nerve.l | 未判定 | 21 | 21 | 0 | 28 mm | 33 mm |
| nervous | Posterior root of spinal nerve.r | 未判定 | 21 | 21 | 0 | 27 mm | 32 mm |
| nervous | Posterior root of spinal nerve.l | 未判定 | 21 | 21 | 0 | 27 mm | 32 mm |
| venous | Lumbar vein | 未判定 | 4 | 4 | 0 | 33 mm | 32 mm |
| arterial | Lumbar artery | 未判定 | 4 | 4 | 0 | 32 mm | 31 mm |
| venous | Lumbar vein | 未判定 | 4 | 4 | 0 | 30 mm | 29 mm |
| arterial | Posterior superior segmental hepatic artery | 未判定 | 4 | 4 | 0 | 31 mm | 28 mm |
| venous | Inferior phrenic vein | 未判定 | 2 | 2 | 0 | 29 mm | 28 mm |
| arterial | Anterior division of left renal artery | 未判定 | 2 | 2 | 0 | 28 mm | 28 mm |
| nervous | Anterior root of posterior femoral cutaneous nerve.r | 未判定 | 3 | 3 | 0 | 25 mm | 25 mm |
| nervous | Anterior root of posterior femoral cutaneous nerve.l | 未判定 | 3 | 3 | 0 | 25 mm | 25 mm |
| venous | Left fibular vein | 未判定 | 2 | 2 | 0 | 25 mm | 25 mm |
| venous | Right fibular vein | 未判定 | 2 | 2 | 0 | 24 mm | 24 mm |
| arterial | Esophageal artery | 未判定 | 3 | 3 | 0 | 24 mm | 22 mm |
| venous | Common palmar digital vein | 未判定 | 3 | 3 | 0 | 22 mm | 22 mm |
| arterial | Anterior division of right renal artery | 未判定 | 3 | 3 | 0 | 23 mm | 22 mm |
| venous | Ascending lumbar vein | 未判定 | 3 | 3 | 0 | 24 mm | 22 mm |
| venous | Common palmar digital vein | 未判定 | 3 | 3 | 0 | 21 mm | 21 mm |
| arterial | Posterior superior segmental hepatic artery | 未判定 | 3 | 3 | 0 | 24 mm | 19 mm |
| arterial | Bronchial artery | 未判定 | 2 | 2 | 0 | 21 mm | 19 mm |
| arterial | Distal perforating artery | 未判定 | 4 | 4 | 0 | 16 mm | 16 mm |
| arterial | Distal perforating artery | 未判定 | 4 | 4 | 0 | 16 mm | 16 mm |
| venous | Right dorsal metatarsal vein | 未判定 | 5 | 5 | 0 | 14 mm | 14 mm |
| arterial | Left palmar metacarpal artery | 未判定 | 4 | 4 | 0 | 14 mm | 14 mm |
| arterial | Right palmar metacarpal artery | 未判定 | 4 | 4 | 0 | 14 mm | 14 mm |
| venous | Left dorsal metatarsal vein | 未判定 | 5 | 5 | 0 | 15 mm | 13 mm |
| arterial | Splenic artery | 未判定 | 4 | 4 | 0 | 15 mm | 13 mm |
| arterial | Dorsal digital artery of foot | 未判定 | 5 | 5 | 0 | 16 mm | 12 mm |
| arterial | Dorsal digital artery of foot | 未判定 | 5 | 5 | 0 | 16 mm | 12 mm |
| arterial | Anterior inferior segmental hepatic artery | 未判定 | 4 | 4 | 0 | 18 mm | 12 mm |
| venous | Anterior superior segmental tributary of right hepatic vein | 未判定 | 4 | 4 | 0 | 17 mm | 12 mm |
| venous | Proper palmar digital vein of left little finger | 未判定 | 4 | 4 | 0 | 11 mm | 11 mm |
| venous | Proper palmar digital vein of right little finger | 未判定 | 4 | 4 | 0 | 11 mm | 11 mm |
| arterial | Ureteric segment of right renal artery | 未判定 | 2 | 2 | 0 | 11 mm | 11 mm |
| arterial | Plantar metatarsal artery | 未判定 | 4 | 4 | 0 | 8 mm | 8 mm |
| venous | Plantar metatarsal vein | 未判定 | 4 | 4 | 0 | 9 mm | 8 mm |
| arterial | Plantar metatarsal artery | 未判定 | 4 | 4 | 0 | 9 mm | 7 mm |
| venous | Plantar metatarsal vein | 未判定 | 4 | 4 | 0 | 8 mm | 7 mm |
| arterial | Posterior division of right renal artery | 未判定 | 2 | 2 | 0 | 7 mm | 7 mm |
| arterial | Anterolateral central branch of right middle cerebral artery | 未判定 | 3 | 2 | 1 | 21 mm | 5 mm |
| arterial | Anterolateral central branch of left middle cerebral artery | 未判定 | 3 | 2 | 1 | 21 mm | 5 mm |
| arterial | Right middle genicular artery | 未判定 | 2 | 2 | 0 | 5 mm | 4 mm |
| arterial | Bronchial branch of arch of aorta | 未判定 | 2 | 2 | 0 | 12 mm | 4 mm |
| venous | Hepatovenous segment IV | 未判定 | 18 | 4 | 14 | 9 mm | 3 mm |
| arterial | Anterior division of left renal artery | 未判定 | 7 | 7 | 0 | 2 mm | 3 mm |
| arterial | Lateral branch of right pontine artery | 未判定 | 2 | 2 | 0 | 3 mm | 3 mm |
| arterial | Lateral branch of left pontine artery | 未判定 | 2 | 2 | 0 | 3 mm | 3 mm |
| arterial | Left middle genicular artery | 未判定 | 2 | 2 | 0 | 5 mm | 3 mm |
| arterial | Anterior division of right renal artery | 未判定 | 7 | 7 | 0 | 2 mm | 2 mm |
| arterial | Medial branch of right pontine artery | 未判定 | 2 | 2 | 0 | 2 mm | 2 mm |
| arterial | Medial branch of left pontine artery | 未判定 | 2 | 2 | 0 | 2 mm | 2 mm |
| arterial | Anterior division of left renal artery | 未判定 | 2 | 2 | 0 | 12 mm | 2 mm |
| nervous | Intermediate dorsal cutaneous nerve of foot.r | 未判定 | 2 | 2 | 0 | 18 mm | 2 mm |
| nervous | Vagus nerve (X).r | 未判定 | 19 | 19 | 0 | 63 mm | 1 mm |
| nervous | Inferior alveolar nerve.r | 未判定 | 12 | 12 | 0 | 6 mm | 1 mm |
| nervous | Inferior alveolar nerve.l | 未判定 | 12 | 12 | 0 | 6 mm | 1 mm |
| nervous | Facial nerve (VII).r | 未判定 | 12 | 12 | 0 | 23 mm | 1 mm |
| nervous | Facial nerve (VII).l | 未判定 | 12 | 12 | 0 | 23 mm | 1 mm |
| nervous | Maxillary nerve.r | 未判定 | 5 | 5 | 0 | 10 mm | 1 mm |
| nervous | Maxillary nerve.l | 未判定 | 5 | 5 | 0 | 10 mm | 1 mm |
| nervous | Saphenous nerve.r | 未判定 | 4 | 4 | 0 | 68 mm | 1 mm |
| nervous | Saphenous nerve.l | 未判定 | 4 | 4 | 0 | 68 mm | 1 mm |
| nervous | Nerve to quadratus femoris muscle.r | 未判定 | 4 | 4 | 0 | 26 mm | 1 mm |
| nervous | Habenula | 未判定 | 3 | 3 | 0 | 3 mm | 1 mm |
| nervous | Medial dorsal cutaneous nerve of foot.l | 未判定 | 3 | 3 | 0 | 24 mm | 1 mm |
| nervous | Vestibulocochlear nerve (VIII).l | 未判定 | 2 | 2 | 0 | 2 mm | 1 mm |
| nervous | Vestibulocochlear nerve (VIII).r | 未判定 | 2 | 2 | 0 | 2 mm | 1 mm |
| nervous | Olfactory nerve (I).r | 未判定 | 23 | 23 | 0 | 6 mm | 0 mm |
| nervous | Olfactory nerve (I).l | 未判定 | 23 | 23 | 0 | 6 mm | 0 mm |
| nervous | Hypoglossal nerve (XII).r | 未判定 | 8 | 8 | 0 | 7 mm | 0 mm |
| nervous | Hypoglossal nerve (XII).l | 未判定 | 8 | 8 | 0 | 7 mm | 0 mm |
| nervous | Oculomotor nerve (III).r | 未判定 | 7 | 6 | 1 | 17 mm | 0 mm |
| nervous | Oculomotor nerve (III).l | 未判定 | 7 | 6 | 1 | 17 mm | 0 mm |
| nervous | Glossopharyngeal nerve (IX).r | 未判定 | 7 | 7 | 0 | 58 mm | 0 mm |
| nervous | Glossopharyngeal nerve (IX).l | 未判定 | 7 | 7 | 0 | 58 mm | 0 mm |
| nervous | Vagus nerve (X).l | 未判定 | 7 | 7 | 0 | 63 mm | 0 mm |
| nervous | Accessory nerve (XI).r | 未判定 | 6 | 6 | 0 | 38 mm | 0 mm |
| nervous | Accessory nerve (XI).l | 未判定 | 6 | 6 | 0 | 38 mm | 0 mm |
| nervous | Ophthalmic nerve.r | 未判定 | 5 | 5 | 0 | 13 mm | 0 mm |
| nervous | Ophthalmic nerve.l | 未判定 | 5 | 5 | 0 | 13 mm | 0 mm |
| nervous | Suprascapular nerve.r | 未判定 | 5 | 5 | 0 | 16 mm | 0 mm |
| nervous | Suprascapular nerve.l | 未判定 | 5 | 5 | 0 | 16 mm | 0 mm |
| nervous | Lateral pectoral nerve.r | 未判定 | 5 | 5 | 0 | 30 mm | 0 mm |
| nervous | Lateral pectoral nerve.l | 未判定 | 5 | 5 | 0 | 30 mm | 0 mm |
| nervous | Vestibular nerve.l | 未判定 | 4 | 3 | 1 | 1 mm | 0 mm |
| nervous | Vestibular nerve.r | 未判定 | 4 | 3 | 1 | 1 mm | 0 mm |
| nervous | Superficial branch of radial nerve.r | 未判定 | 4 | 4 | 0 | 23 mm | 0 mm |
| nervous | Superficial branch of radial nerve.l | 未判定 | 4 | 4 | 0 | 23 mm | 0 mm |
| nervous | Nerve to quadratus femoris muscle.l | 未判定 | 4 | 4 | 0 | 26 mm | 0 mm |
| nervous | Meningeal branch of maxillary nerve.r | 未判定 | 3 | 3 | 0 | 48 mm | 0 mm |
| nervous | Meningeal branch of maxillary nerve.l | 未判定 | 3 | 3 | 0 | 48 mm | 0 mm |
| nervous | Femoral nerve.r | 未判定 | 3 | 3 | 0 | 52 mm | 0 mm |
| nervous | Lateral femoral cutaneous nerve.r | 未判定 | 3 | 3 | 0 | 100 mm | 0 mm |
| nervous | Femoral nerve.l | 未判定 | 3 | 3 | 0 | 52 mm | 0 mm |
| nervous | Lateral femoral cutaneous nerve.l | 未判定 | 3 | 3 | 0 | 100 mm | 0 mm |
| nervous | Obturator nerve.r | 未判定 | 3 | 3 | 0 | 30 mm | 0 mm |
| nervous | Obturator nerve.l | 未判定 | 3 | 3 | 0 | 30 mm | 0 mm |
| nervous | Medial dorsal cutaneous nerve of foot.r | 未判定 | 3 | 3 | 0 | 25 mm | 0 mm |
| nervous | Thoracodorsal nerve.r | 未判定 | 3 | 3 | 0 | 44 mm | 0 mm |
| nervous | Thoracodorsal nerve.l | 未判定 | 3 | 3 | 0 | 44 mm | 0 mm |
| nervous | Superior gluteal nerve.l | 未判定 | 3 | 3 | 0 | 28 mm | 0 mm |
| nervous | Superior gluteal nerve.r | 未判定 | 3 | 3 | 0 | 28 mm | 0 mm |
| nervous | Posterior femoral cutaneous nerve.r | 未判定 | 3 | 3 | 0 | 37 mm | 0 mm |
| nervous | Posterior root of posterior femoral cutaneous nerve.r | 未判定 | 3 | 3 | 0 | 37 mm | 0 mm |
| nervous | Posterior root of posterior femoral cutaneous nerve.l | 未判定 | 3 | 3 | 0 | 37 mm | 0 mm |
| nervous | Pudendal nerve.l | 未判定 | 3 | 3 | 0 | 17 mm | 0 mm |
| nervous | Pudendal nerve.r | 未判定 | 3 | 3 | 0 | 17 mm | 0 mm |
| nervous | Posterior femoral cutaneous nerve.l | 未判定 | 3 | 3 | 0 | 37 mm | 0 mm |
| nervous | Short ciliary nerve | 未判定 | 2 | 2 | 0 | 2 mm | 0 mm |
| nervous | Short ciliary nerve | 未判定 | 2 | 2 | 0 | 2 mm | 0 mm |
| nervous | Orbital gyrus | 未判定 | 2 | 2 | 0 | 12 mm | 0 mm |
| nervous | Left superior frontal gyrus | 未判定 | 2 | 2 | 0 | 3 mm | 0 mm |
| nervous | Right superior frontal gyrus | 未判定 | 2 | 2 | 0 | 0 mm | 0 mm |
| nervous | Trigeminal nerve (V).r | 未判定 | 2 | 2 | 0 | 0 mm | 0 mm |
| nervous | Nerve to mylohyoid muscle.r | 未判定 | 2 | 2 | 0 | 7 mm | 0 mm |
| nervous | Buccal nerve.r | 未判定 | 2 | 2 | 0 | 6 mm | 0 mm |
| nervous | Trigeminal nerve (V).l | 未判定 | 2 | 2 | 0 | 0 mm | 0 mm |
| nervous | Nerve to mylohyoid muscle.l | 未判定 | 2 | 2 | 0 | 7 mm | 0 mm |
| nervous | Buccal nerve.l | 未判定 | 2 | 2 | 0 | 6 mm | 0 mm |
| nervous | Abducens nerve (VI).r | 未判定 | 2 | 2 | 0 | 5 mm | 0 mm |
| nervous | Abducens nerve (VI).l | 未判定 | 2 | 2 | 0 | 5 mm | 0 mm |
| nervous | Long thoracic nerve.r | 未判定 | 2 | 2 | 0 | 12 mm | 0 mm |
| nervous | Long thoracic nerve.l | 未判定 | 2 | 2 | 0 | 12 mm | 0 mm |
| nervous | Dorsal branch of ulnar nerve.r | 未判定 | 2 | 2 | 0 | 17 mm | 0 mm |
| nervous | Dorsal branch of ulnar nerve.l | 未判定 | 2 | 2 | 0 | 17 mm | 0 mm |
| nervous | Iliohypogastric nerve.r | 未判定 | 2 | 2 | 0 | 20 mm | 0 mm |
| nervous | Iliohypogastric nerve.l | 未判定 | 2 | 2 | 0 | 20 mm | 0 mm |
| nervous | Genitofemoral nerve.r | 未判定 | 2 | 2 | 0 | 20 mm | 0 mm |
| nervous | Femoral branch of genitofemoral nerve.r | 未判定 | 2 | 2 | 0 | 14 mm | 0 mm |
| nervous | Genitofemoral nerve.l | 未判定 | 2 | 2 | 0 | 20 mm | 0 mm |
| nervous | Femoral branch of genitofemoral nerve.l | 未判定 | 2 | 2 | 0 | 14 mm | 0 mm |
| nervous | Intermediate dorsal cutaneous nerve of foot.l | 未判定 | 2 | 2 | 0 | 17 mm | 0 mm |
| nervous | Medial plantar nerve.r | 未判定 | 2 | 2 | 0 | 10 mm | 0 mm |
| nervous | Medial plantar nerve.l | 未判定 | 2 | 2 | 0 | 10 mm | 0 mm |
| nervous | Posterior horn of spinal cord | 未判定 | 2 | 2 | 0 | 0 mm | 0 mm |
| nervous | Anterior horn of spinal cord | 未判定 | 2 | 2 | 0 | 0 mm | 0 mm |
| nervous | Medial pectoral nerve.r | 未判定 | 2 | 2 | 0 | 42 mm | 0 mm |
| nervous | Medial pectoral nerve.l | 未判定 | 2 | 2 | 0 | 42 mm | 0 mm |
| nervous | Inferior subscapular nerve.r | 未判定 | 2 | 2 | 0 | 23 mm | 0 mm |
| nervous | Nerve to piriformis muscle.r | 未判定 | 2 | 2 | 0 | 24 mm | 0 mm |
| nervous | Nerve to piriformis muscle.l | 未判定 | 2 | 2 | 0 | 24 mm | 0 mm |
| nervous | Inferior subscapular nerve.l | 未判定 | 2 | 2 | 0 | 23 mm | 0 mm |
| arterial | Right pericallosal artery | 未判定 | 7 | 1 | 6 | — | — |
| arterial | Left pericallosal artery | 未判定 | 7 | 1 | 6 | — | — |
| nervous | Peduncle of midbrain | 未判定 | 4 | 1 | 3 | — | — |
| nervous | Tuber cinereum | 未判定 | 4 | 1 | 3 | — | — |
| nervous | White matter of left cerebral hemisphere | 未判定 | 3 | 1 | 2 | — | — |
| nervous | Peduncle of midbrain | 未判定 | 3 | 1 | 2 | — | — |
| arterial | Anterolateral central branch of right middle cerebral artery | 未判定 | 2 | 1 | 1 | — | — |
| arterial | Anterolateral central branch of left middle cerebral artery | 未判定 | 2 | 1 | 1 | — | — |
| arterial | Medial branch of right superior cerebellar artery | 未判定 | 2 | 1 | 1 | — | — |
| arterial | Medial branch of left superior cerebellar artery | 未判定 | 2 | 1 | 1 | — | — |
| arterial | Right posterior inferior cerebellar artery | 未判定 | 2 | 1 | 1 | — | — |
| arterial | Left posterior inferior cerebellar artery | 未判定 | 2 | 1 | 1 | — | — |
| nervous | Left inferior frontal gyrus | 未判定 | 2 | 1 | 1 | — | — |
| nervous | Right inferior frontal gyrus | 未判定 | 2 | 1 | 1 | — | — |
| nervous | Hypothalamus | 未判定 | 2 | 1 | 1 | — | — |
| nervous | Pons | 未判定 | 2 | 1 | 1 | — | — |
| nervous | Tuber cinereum | 未判定 | 2 | 1 | 1 | — | — |
| nervous | Orbital gyrus | 未判定 | 2 | 1 | 1 | — | — |
| nervous | White matter of right cerebral hemisphere | 未判定 | 2 | 1 | 1 | — | — |
| nervous | Hypothalamus | 未判定 | 2 | 1 | 1 | — | — |
| nervous | Stria terminalis | 未判定 | 2 | 1 | 1 | — | — |
| nervous | Septum of telencephalon | 未判定 | 2 | 1 | 1 | — | — |
| venous | Right anterior circumflex humeral vein | 未判定 | 2 | 1 | 1 | — | — |
| venous | Right portal vein | 未判定 | 2 | 1 | 1 | — | — |
| venous | Right hepatic vein | 未判定 | 2 | 1 | 1 | — | — |
| arterial | Posterior division of left renal artery | 未判定 | 2 | 1 | 1 | — | — |
| arterial | Set of perforating arteries | 成組 | 4 | 4 | 0 | 43 mm | 70 mm |
| arterial | Set of perforating arteries | 成組 | 4 | 4 | 0 | 43 mm | 69 mm |
| venous | Set of perforating veins | 成組 | 4 | 4 | 0 | 45 mm | 69 mm |
| nervous | Muscular branches of ulnar nerve.r | 成組 | 2 | 2 | 0 | 53 mm | 53 mm |
| nervous | Muscular branches of ulnar nerve.l | 成組 | 2 | 2 | 0 | 53 mm | 53 mm |
| nervous | Intercostal nerves.r | 成組 | 11 | 11 | 0 | 32 mm | 31 mm |
| nervous | Intercostal nerves.l | 成組 | 11 | 11 | 0 | 32 mm | 31 mm |
| nervous | Sympathetic nerves.r | 成組 | 19 | 19 | 0 | 27 mm | 30 mm |
| nervous | Sympathetic nerves.l | 成組 | 19 | 19 | 0 | 27 mm | 30 mm |
| venous | Set of anterior intercostal veins | 成組 | 11 | 10 | 1 | 31 mm | 27 mm |
| venous | Set of anterior intercostal veins | 成組 | 10 | 10 | 0 | 26 mm | 27 mm |
| arterial | Posterior intercostal arteries | 成組 | 9 | 9 | 0 | 31 mm | 27 mm |
| arterial | Posterior intercostal arteries | 成組 | 9 | 9 | 0 | 30 mm | 26 mm |
| nervous | Dorsal digital branches of radial nerve.r | 成組 | 7 | 7 | 0 | 17 mm | 23 mm |
| nervous | Dorsal digital branches of radial nerve.l | 成組 | 7 | 7 | 0 | 17 mm | 23 mm |
| arterial | Set of oesophageal branches of thoracic aorta | 成組 | 3 | 3 | 0 | 22 mm | 21 mm |
| nervous | Dorsal digital branches of superficial fibular nerve.r | 成組 | 7 | 7 | 0 | 29 mm | 20 mm |
| nervous | Dorsal digital branches of superficial fibular nerve.l | 成組 | 7 | 7 | 0 | 30 mm | 20 mm |
| nervous | Proper palmar digital branches of median nerve.r | 成組 | 7 | 7 | 0 | 11 mm | 16 mm |
| nervous | Proper palmar digital branches of median nerve.l | 成組 | 7 | 7 | 0 | 11 mm | 16 mm |
| venous | Set of perforating veins | 成組 | 4 | 4 | 0 | 16 mm | 16 mm |
| venous | Set of perforating veins | 成組 | 4 | 4 | 0 | 16 mm | 16 mm |
| arterial | Set of common plantar digital arteries | 成組 | 4 | 4 | 0 | 16 mm | 15 mm |
| arterial | Set of common plantar digital arteries | 成組 | 4 | 4 | 0 | 16 mm | 15 mm |
| arterial | Set of plantar digital arteries proper | 成組 | 7 | 4 | 3 | 14 mm | 14 mm |
| nervous | Roots of brachial plexus.r | 成組 | 7 | 7 | 0 | 11 mm | 14 mm |
| nervous | Roots of brachial plexus.l | 成組 | 7 | 7 | 0 | 11 mm | 14 mm |
| nervous | Muscular branches of median nerve.r | 成組 | 4 | 4 | 0 | 14 mm | 14 mm |
| nervous | Muscular branches of median nerve.l | 成組 | 4 | 4 | 0 | 14 mm | 14 mm |
| arterial | Set of plantar digital arteries proper | 成組 | 6 | 4 | 2 | 13 mm | 13 mm |
| venous | Set of perforating veins | 成組 | 4 | 4 | 0 | 15 mm | 13 mm |
| venous | Set of dorsal digital veins | 成組 | 6 | 6 | 0 | 14 mm | 12 mm |
| venous | Set of dorsal digital veins | 成組 | 6 | 6 | 0 | 13 mm | 12 mm |
| arterial | Set of dorsal metacarpal arteries | 成組 | 5 | 5 | 0 | 14 mm | 12 mm |
| venous | Set of perforating veins | 成組 | 4 | 4 | 0 | 16 mm | 12 mm |
| venous | Set of plantar digital veins | 成組 | 6 | 6 | 0 | 11 mm | 11 mm |
| venous | Set of plantar digital veins | 成組 | 6 | 6 | 0 | 11 mm | 11 mm |
| arterial | Set of plantar digital arteries proper | 成組 | 6 | 6 | 0 | 11 mm | 11 mm |
| arterial | Set of dorsal metacarpal arteries | 成組 | 5 | 5 | 0 | 11 mm | 11 mm |
| nervous | Proper plantar digital branches of medial plantar nerve.l | 成組 | 5 | 5 | 0 | 10 mm | 10 mm |
| nervous | Proper plantar digital branches of medial plantar nerve.r | 成組 | 4 | 4 | 0 | 10 mm | 10 mm |
| nervous | Common plantar digital branches of medial plantar nerve | 成組 | 3 | 3 | 0 | 10 mm | 10 mm |
| nervous | Common plantar digital branches of medial plantar nerve.l | 成組 | 3 | 3 | 0 | 10 mm | 10 mm |
| nervous | Proper palmar digital branches of ulnar nerve.r | 成組 | 3 | 3 | 0 | 7 mm | 7 mm |
| nervous | Proper palmar digital branches of ulnar nerve.l | 成組 | 3 | 3 | 0 | 7 mm | 7 mm |
| nervous | Proper plantar digital branches of lateral plantar nerve.r | 成組 | 5 | 5 | 0 | 6 mm | 6 mm |
| nervous | Proper plantar digital branches of lateral plantar nerve.l | 成組 | 5 | 5 | 0 | 6 mm | 6 mm |
| nervous | Dorsal digital branches of ulnar nerve.r | 成組 | 3 | 3 | 0 | 6 mm | 6 mm |
| nervous | Dorsal digital branches of ulnar nerve.l | 成組 | 3 | 3 | 0 | 6 mm | 6 mm |
| arterial | Set of dorsal digital arteries | 成組 | 5 | 5 | 0 | 5 mm | 5 mm |
| arterial | Set of dorsal digital arteries | 成組 | 5 | 5 | 0 | 5 mm | 5 mm |
| nervous | Suboccipital venous plexus.l | 成組 | 29 | 29 | 0 | 2 mm | 0 mm |
| nervous | Suboccipital venous plexus.r | 成組 | 28 | 28 | 0 | 3 mm | 0 mm |
| nervous | Muscular branches of radial nerve.r | 成組 | 5 | 5 | 0 | 19 mm | 0 mm |
| nervous | Muscular branches of radial nerve.l | 成組 | 5 | 5 | 0 | 19 mm | 0 mm |
| nervous | Common palmar digital branches of median nerve.r | 成組 | 3 | 3 | 0 | 0 mm | 0 mm |
| nervous | Common palmar digital branches of median nerve.l | 成組 | 3 | 3 | 0 | 0 mm | 0 mm |
| nervous | Common plantar digital branches of lateral plantar nerve.r | 成組 | 3 | 3 | 0 | 0 mm | 0 mm |
| nervous | Common plantar digital branches of lateral plantar nerve.l | 成組 | 3 | 3 | 0 | 0 mm | 0 mm |
| nervous | Common palmar digital branches of ulnar nerve.r | 成組 | 2 | 2 | 0 | 17 mm | 0 mm |
| nervous | Common palmar digital branches of ulnar nerve.l | 成組 | 2 | 2 | 0 | 17 mm | 0 mm |
| nervous | Dorsal digital branches of deep fibular nerve.r | 成組 | 2 | 2 | 0 | 8 mm | 0 mm |
| nervous | Dorsal digital branches of deep fibular nerve.l | 成組 | 2 | 2 | 0 | 8 mm | 0 mm |
| nervous | Ganglia of sympathetic trunk.r | 成組 | 18 | 0 | 18 | — | — |
| nervous | Ganglia of sympathetic trunk.l | 成組 | 18 | 0 | 18 | — | — |
