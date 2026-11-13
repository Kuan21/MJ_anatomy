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

中心線抽取只沿其中一件走，其餘各件沒有量到；連續性檢查需要逐件處理。

| 系統 | 結構 | 件數 |
| --- | --- | --- |
| nervous | Suboccipital venous plexus.l | 29 |
| nervous | Suboccipital venous plexus.r | 28 |
| nervous | Olfactory nerve (I).r | 23 |
| nervous | Olfactory nerve (I).l | 23 |
| nervous | Spinal ganglion.r | 21 |
| nervous | Spinal ganglion.l | 21 |
| nervous | Posterior root of spinal nerve.r | 21 |
| nervous | Anterior root of spinal nerve.r | 21 |
| nervous | Posterior root of spinal nerve.l | 21 |
| nervous | Anterior root of spinal nerve.l | 21 |
| nervous | Vagus nerve (X).r | 19 |
| nervous | Sympathetic nerves.r | 19 |
| nervous | Sympathetic nerves.l | 19 |
| venous | Hepatovenous segment IV | 18 |
| nervous | Ganglia of sympathetic trunk.r | 18 |
| nervous | Ganglia of sympathetic trunk.l | 18 |
| nervous | Inferior alveolar nerve.r | 12 |
| nervous | Inferior alveolar nerve.l | 12 |
| nervous | Facial nerve (VII).r | 12 |
| nervous | Facial nerve (VII).l | 12 |
| venous | Set of anterior intercostal veins | 11 |
| nervous | Intercostal nerves.r | 11 |
| nervous | Intercostal nerves.l | 11 |
| venous | Right portal vein | 10 |
| venous | Set of anterior intercostal veins | 10 |
| arterial | Posterior intercostal arteries | 9 |
| arterial | Posterior intercostal arteries | 9 |
| nervous | Hypoglossal nerve (XII).r | 8 |
| nervous | Hypoglossal nerve (XII).l | 8 |
| arterial | Right pericallosal artery | 7 |
| arterial | Left pericallosal artery | 7 |
| arterial | Set of plantar digital arteries proper | 7 |
| arterial | Anterior division of left renal artery | 7 |
| arterial | Anterior division of right renal artery | 7 |
| nervous | Oculomotor nerve (III).r | 7 |
| nervous | Oculomotor nerve (III).l | 7 |
| nervous | Glossopharyngeal nerve (IX).r | 7 |
| nervous | Glossopharyngeal nerve (IX).l | 7 |
| nervous | Vagus nerve (X).l | 7 |
| nervous | Roots of brachial plexus.r | 7 |
| nervous | Roots of brachial plexus.l | 7 |
| nervous | Dorsal digital branches of radial nerve.r | 7 |
| nervous | Dorsal digital branches of radial nerve.l | 7 |
| nervous | Proper palmar digital branches of median nerve.r | 7 |
| nervous | Proper palmar digital branches of median nerve.l | 7 |
| nervous | Dorsal digital branches of superficial fibular nerve.r | 7 |
| nervous | Dorsal digital branches of superficial fibular nerve.l | 7 |
| arterial | Set of plantar digital arteries proper | 6 |
| venous | Set of plantar digital veins | 6 |
| venous | Set of plantar digital veins | 6 |
| venous | Set of dorsal digital veins | 6 |
| venous | Set of dorsal digital veins | 6 |
| arterial | Set of plantar digital arteries proper | 6 |
| venous | Posterior superior segmental branch of right portal vein | 6 |
| nervous | Accessory nerve (XI).r | 6 |
| nervous | Accessory nerve (XI).l | 6 |
| arterial | Right lobe branch of right hepatic artery | 5 |
| arterial | Marginal colic artery | 5 |
| arterial | Dorsal digital artery of foot | 5 |
| arterial | Dorsal digital artery of foot | 5 |
| venous | Left dorsal metatarsal vein | 5 |
| venous | Right dorsal metatarsal vein | 5 |
| arterial | Set of dorsal digital arteries | 5 |
| arterial | Set of dorsal digital arteries | 5 |
| arterial | Set of dorsal metacarpal arteries | 5 |
| arterial | Set of dorsal metacarpal arteries | 5 |
| arterial | Right lobe branch of right hepatic artery | 5 |
| venous | Anterior inferior segmental branch of right portal vein | 5 |
| arterial | Marginal artery of colon | 5 |
| nervous | Maxillary nerve.r | 5 |
| nervous | Ophthalmic nerve.r | 5 |
| nervous | Maxillary nerve.l | 5 |
| nervous | Ophthalmic nerve.l | 5 |
| nervous | Suprascapular nerve.r | 5 |
| nervous | Suprascapular nerve.l | 5 |
| nervous | Lateral pectoral nerve.r | 5 |
| nervous | Lateral pectoral nerve.l | 5 |
| nervous | Muscular branches of radial nerve.r | 5 |
| nervous | Muscular branches of radial nerve.l | 5 |
| nervous | Proper plantar digital branches of medial plantar nerve.l | 5 |
| nervous | Proper plantar digital branches of lateral plantar nerve.r | 5 |
| nervous | Proper plantar digital branches of lateral plantar nerve.l | 5 |
| nervous | Peduncle of midbrain | 4 |
| nervous | Tuber cinereum | 4 |
| arterial | Distal perforating artery | 4 |
| arterial | Distal perforating artery | 4 |
| arterial | Set of perforating arteries | 4 |
| arterial | Set of common plantar digital arteries | 4 |
| arterial | Plantar metatarsal artery | 4 |
| venous | Set of perforating veins | 4 |
| venous | Set of perforating veins | 4 |
| arterial | Set of perforating arteries | 4 |
| venous | Set of perforating veins | 4 |
| venous | Set of perforating veins | 4 |
| venous | Left fibular vein | 4 |
| venous | Plantar metatarsal vein | 4 |
| venous | Set of perforating veins | 4 |
| arterial | Set of common plantar digital arteries | 4 |
| arterial | Plantar metatarsal artery | 4 |
| venous | Plantar metatarsal vein | 4 |
| arterial | Left palmar metacarpal artery | 4 |
| arterial | Right palmar metacarpal artery | 4 |
| venous | Proper palmar digital vein of left little finger | 4 |
| venous | Proper palmar digital vein of right little finger | 4 |
| arterial | Anterior inferior segmental hepatic artery | 4 |
| arterial | Posterior superior segmental hepatic artery | 4 |
| venous | Anterior superior segmental tributary of right hepatic vein | 4 |
| arterial | Splenic artery | 4 |
| venous | Lumbar vein | 4 |
| arterial | Lumbar artery | 4 |
| venous | Lumbar vein | 4 |
| arterial | Lumbar artery | 4 |
| nervous | Vestibular nerve.l | 4 |
| nervous | Vestibular nerve.r | 4 |
| nervous | Superficial branch of radial nerve.r | 4 |
| nervous | Superficial branch of radial nerve.l | 4 |
| nervous | Muscular branches of median nerve.r | 4 |
| nervous | Muscular branches of median nerve.l | 4 |
| nervous | Saphenous nerve.r | 4 |
| nervous | Saphenous nerve.l | 4 |
| nervous | Proper plantar digital branches of medial plantar nerve.r | 4 |
| nervous | Nerve to quadratus femoris muscle.r | 4 |
| nervous | Nerve to quadratus femoris muscle.l | 4 |
| arterial | Anterolateral central branch of right middle cerebral artery | 3 |
| arterial | Anterolateral central branch of left middle cerebral artery | 3 |
| nervous | Habenula | 3 |
| nervous | White matter of left cerebral hemisphere | 3 |
| nervous | Peduncle of midbrain | 3 |
| venous | Left portal vein | 3 |
| arterial | Esophageal artery | 3 |
| venous | Common palmar digital vein | 3 |
| venous | Common palmar digital vein | 3 |
| arterial | Posterior superior segmental hepatic artery | 3 |
| arterial | Set of oesophageal branches of thoracic aorta | 3 |
| arterial | Anterior division of right renal artery | 3 |
| venous | Superior phrenic vein | 3 |
| venous | Ascending lumbar vein | 3 |
| nervous | Meningeal branch of maxillary nerve.r | 3 |
| nervous | Meningeal branch of maxillary nerve.l | 3 |
| nervous | Dorsal digital branches of ulnar nerve.r | 3 |
| nervous | Dorsal digital branches of ulnar nerve.l | 3 |
| nervous | Proper palmar digital branches of ulnar nerve.r | 3 |
| nervous | Proper palmar digital branches of ulnar nerve.l | 3 |
| nervous | Common palmar digital branches of median nerve.r | 3 |
| nervous | Common palmar digital branches of median nerve.l | 3 |
| nervous | Femoral nerve.r | 3 |
| nervous | Lateral femoral cutaneous nerve.r | 3 |
| nervous | Femoral nerve.l | 3 |
| nervous | Lateral femoral cutaneous nerve.l | 3 |
| nervous | Obturator nerve.r | 3 |
| nervous | Obturator nerve.l | 3 |
| nervous | Medial dorsal cutaneous nerve of foot.r | 3 |
| nervous | Medial dorsal cutaneous nerve of foot.l | 3 |
| nervous | Sciatic nerve.r | 3 |
| nervous | Common plantar digital branches of lateral plantar nerve.r | 3 |
| nervous | Sciatic nerve.l | 3 |
| nervous | Common plantar digital branches of lateral plantar nerve.l | 3 |
| nervous | Common plantar digital branches of medial plantar nerve | 3 |
| nervous | Common plantar digital branches of medial plantar nerve.l | 3 |
| nervous | Thoracodorsal nerve.r | 3 |
| nervous | Thoracodorsal nerve.l | 3 |
| nervous | Superior gluteal nerve.l | 3 |
| nervous | Superior gluteal nerve.r | 3 |
| nervous | Posterior femoral cutaneous nerve.r | 3 |
| nervous | Anterior root of posterior femoral cutaneous nerve.r | 3 |
| nervous | Posterior root of posterior femoral cutaneous nerve.r | 3 |
| nervous | Posterior root of posterior femoral cutaneous nerve.l | 3 |
| nervous | Pudendal nerve.l | 3 |
| nervous | Pudendal nerve.r | 3 |
| nervous | Posterior femoral cutaneous nerve.l | 3 |
| nervous | Anterior root of posterior femoral cutaneous nerve.l | 3 |
| nervous | Short ciliary nerve | 2 |
| nervous | Short ciliary nerve | 2 |
| arterial | Anterolateral central branch of right middle cerebral artery | 2 |
| arterial | Anterolateral central branch of left middle cerebral artery | 2 |
| arterial | Lateral branch of right pontine artery | 2 |
| arterial | Lateral branch of left pontine artery | 2 |
| arterial | Medial branch of right superior cerebellar artery | 2 |
| arterial | Medial branch of left superior cerebellar artery | 2 |
| arterial | Medial branch of right pontine artery | 2 |
| arterial | Medial branch of left pontine artery | 2 |
| arterial | Right posterior inferior cerebellar artery | 2 |
| arterial | Left posterior inferior cerebellar artery | 2 |
| nervous | Left inferior frontal gyrus | 2 |
| nervous | Right inferior frontal gyrus | 2 |
| nervous | Hypothalamus | 2 |
| nervous | Pons | 2 |
| nervous | Tuber cinereum | 2 |
| nervous | Orbital gyrus | 2 |
| nervous | Orbital gyrus | 2 |
| nervous | White matter of right cerebral hemisphere | 2 |
| nervous | Hypothalamus | 2 |
| nervous | Stria terminalis | 2 |
| nervous | Septum of telencephalon | 2 |
| nervous | Left superior frontal gyrus | 2 |
| nervous | Right superior frontal gyrus | 2 |
| arterial | Bronchial artery | 2 |
| arterial | Left middle genicular artery | 2 |
| arterial | Right middle genicular artery | 2 |
| venous | Left fibular vein | 2 |
| venous | Right fibular vein | 2 |
| venous | Right anterior circumflex humeral vein | 2 |
| venous | Right portal vein | 2 |
| venous | Right hepatic vein | 2 |
| arterial | Lateral superior segmental hepatic artery | 2 |
| arterial | Bronchial branch of arch of aorta | 2 |
| venous | Inferior phrenic vein | 2 |
| arterial | Anterior division of left renal artery | 2 |
| arterial | Anterior division of left renal artery | 2 |
| arterial | Posterior division of left renal artery | 2 |
| arterial | Posterior division of right renal artery | 2 |
| arterial | Ureteric segment of right renal artery | 2 |
| nervous | Trigeminal nerve (V).r | 2 |
| nervous | Nerve to mylohyoid muscle.r | 2 |
| nervous | Buccal nerve.r | 2 |
| nervous | Trigeminal nerve (V).l | 2 |
| nervous | Nerve to mylohyoid muscle.l | 2 |
| nervous | Buccal nerve.l | 2 |
| nervous | Vestibulocochlear nerve (VIII).l | 2 |
| nervous | Vestibulocochlear nerve (VIII).r | 2 |
| nervous | Abducens nerve (VI).r | 2 |
| nervous | Abducens nerve (VI).l | 2 |
| nervous | Long thoracic nerve.r | 2 |
| nervous | Long thoracic nerve.l | 2 |
| nervous | Dorsal branch of ulnar nerve.r | 2 |
| nervous | Dorsal branch of ulnar nerve.l | 2 |
| nervous | Common palmar digital branches of ulnar nerve.r | 2 |
| nervous | Common palmar digital branches of ulnar nerve.l | 2 |
| nervous | Muscular branches of ulnar nerve.r | 2 |
| nervous | Muscular branches of ulnar nerve.l | 2 |
| nervous | Iliohypogastric nerve.r | 2 |
| nervous | Iliohypogastric nerve.l | 2 |
| nervous | Sural nerve.r | 2 |
| nervous | Sural nerve.l | 2 |
| nervous | Genitofemoral nerve.r | 2 |
| nervous | Femoral branch of genitofemoral nerve.r | 2 |
| nervous | Genitofemoral nerve.l | 2 |
| nervous | Femoral branch of genitofemoral nerve.l | 2 |
| nervous | Intermediate dorsal cutaneous nerve of foot.r | 2 |
| nervous | Intermediate dorsal cutaneous nerve of foot.l | 2 |
| nervous | Dorsal digital branches of deep fibular nerve.r | 2 |
| nervous | Dorsal digital branches of deep fibular nerve.l | 2 |
| nervous | Medial plantar nerve.r | 2 |
| nervous | Medial plantar nerve.l | 2 |
| nervous | Posterior horn of spinal cord | 2 |
| nervous | Anterior horn of spinal cord | 2 |
| nervous | Medial pectoral nerve.r | 2 |
| nervous | Medial pectoral nerve.l | 2 |
| nervous | Inferior subscapular nerve.r | 2 |
| nervous | Nerve to piriformis muscle.r | 2 |
| nervous | Nerve to piriformis muscle.l | 2 |
| nervous | Inferior subscapular nerve.l | 2 |
