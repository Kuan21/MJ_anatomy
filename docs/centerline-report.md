# 中心線抽取報告（自動產生，勿手動修改）

由 `node scripts/report-centerlines.mjs --write` 產生。共 1453 個血管與神經網格，抽取成功且通過檢查：動脈 586、靜脈 345、神經 381；列出 141 個。

判讀：「jump」多半是主幹旁有粗分支，抽取把分支算進主幹；「length only」是很短的腦神經根；「fewer than 2 rings」是形狀不是管（交感幹神經節）。這些是量測用的提示，不是已確認的缺陷。

| 系統 | 結構 | 原因 |
| --- | --- | --- |
| nervous | Left ciliary ganglion | length only 2.3 mm |
| nervous | Right ciliary ganglion | length only 2.5 mm |
| arterial | Right internal carotid artery | jump of 29 mm between rings |
| arterial | Left internal carotid artery | jump of 29 mm between rings |
| arterial | Right pericallosal artery | fewer than 2 rings |
| arterial | Left pericallosal artery | fewer than 2 rings |
| nervous | Habenula | length only 1.0 mm |
| nervous | Interpeduncular fossa | length only 1.2 mm |
| nervous | Orbital gyrus | jump of 21 mm between rings |
| nervous | Interpeduncular fossa | length only 1.6 mm |
| venous | Hepatovenous segment IX | jump of 23 mm between rings |
| arterial | Descending thoracic aorta | jump of 45 mm between rings |
| arterial | Abdominal aorta | jump of 45 mm between rings |
| arterial | Right superior epigastric artery | jump of 25 mm between rings |
| arterial | Right internal thoracic artery | jump of 26 mm between rings |
| arterial | Right lateral thoracic artery | jump of 24 mm between rings |
| arterial | Right second posterior intercostal artery | jump of 28 mm between rings |
| arterial | Posterior intercostal arteries | jump of 22 mm between rings |
| arterial | Right musculophrenic artery | jump of 29 mm between rings |
| arterial | Left second posterior intercostal artery | jump of 25 mm between rings |
| arterial | Left lateral thoracic artery | jump of 29 mm between rings |
| venous | Right internal thoracic vein | jump of 29 mm between rings |
| venous | Set of anterior intercostal veins | jump of 21 mm between rings |
| arterial | Descending branch of right lateral circumflex femoral artery | jump of 56 mm between rings |
| arterial | Descending branch of left lateral circumflex femoral artery | jump of 42 mm between rings |
| arterial | Left anterior tibial artery | jump of 31 mm between rings |
| arterial | Left femoral artery | jump of 85 mm between rings |
| arterial | Left posterior tibial artery | jump of 28 mm between rings |
| arterial | Left fibular artery | jump of 21 mm between rings |
| arterial | Set of perforating arteries | jump of 27 mm between rings |
| venous | Left deep femoral vein | jump of 35 mm between rings |
| venous | Left femoral vein | jump of 88 mm between rings |
| venous | Left great saphenous vein | jump of 39 mm between rings |
| venous | Left small saphenous vein | jump of 29 mm between rings |
| venous | Left superficial epigastric vein | jump of 20 mm between rings |
| arterial | Right anterior tibial artery | jump of 42 mm between rings |
| venous | Right deep femoral vein | jump of 36 mm between rings |
| arterial | Right femoral artery | jump of 79 mm between rings |
| venous | Right femoral vein | jump of 80 mm between rings |
| venous | Right great saphenous vein | jump of 51 mm between rings |
| arterial | Right lateral circumflex femoral artery | jump of 21 mm between rings |
| venous | Right popliteal vein | jump of 21 mm between rings |
| arterial | Right posterior tibial artery | jump of 23 mm between rings |
| venous | Right superficial epigastric vein | jump of 28 mm between rings |
| venous | Left anterior tibial vein | jump of 26 mm between rings |
| venous | Left fibular vein | jump of 20 mm between rings |
| venous | Left medial circumflex femoral vein | jump of 22 mm between rings |
| venous | Right fibular vein | jump of 24 mm between rings |
| arterial | Set of perforating arteries | jump of 31 mm between rings |
| venous | Left axillary vein | jump of 22 mm between rings |
| arterial | Left brachial artery | jump of 27 mm between rings |
| venous | Left cephalic vein | jump of 68 mm between rings |
| venous | Left lateral thoracic vein | jump of 33 mm between rings |
| venous | Left median antebrachial vein | jump of 25 mm between rings |
| arterial | Left anterior ulnar recurrent artery | jump of 27 mm between rings |
| venous | Left ulnar vein | jump of 29 mm between rings |
| arterial | Right anterior circumflex humeral artery | jump of 29 mm between rings |
| arterial | Right anterior interosseous artery | jump of 23 mm between rings |
| venous | Right basilic vein | jump of 32 mm between rings |
| arterial | Right brachial artery | jump of 30 mm between rings |
| venous | Right cephalic vein | jump of 31 mm between rings |
| arterial | Right deep brachial artery | jump of 20 mm between rings |
| venous | Right median antebrachial vein | jump of 25 mm between rings |
| arterial | Right anterior ulnar recurrent artery | jump of 23 mm between rings |
| venous | Right ulnar vein | jump of 32 mm between rings |
| venous | Left medial brachial vein | jump of 26 mm between rings |
| arterial | Pectoral branch of left thoraco-acromial artery | jump of 21 mm between rings |
| arterial | Lateral proper palmar digital artery of left little finger | jump of 21 mm between rings |
| arterial | Left arteria princeps pollicis | jump of 25 mm between rings |
| venous | Right medial brachial vein | jump of 28 mm between rings |
| venous | Proper palmar digital vein of right little finger | jump of 23 mm between rings |
| arterial | Pectoral branch of right thoraco-acromial artery | jump of 25 mm between rings |
| arterial | Medial proper palmar digital artery of right index finger | jump of 20 mm between rings |
| venous | Right portal vein | fewer than 2 rings |
| venous | Hepatovenous segment II | jump of 24 mm between rings |
| venous | Hepatovenous segment III | jump of 21 mm between rings |
| venous | Hepatovenous segment IV | jump of 31 mm between rings |
| venous | Hepatovenous segment VIII | jump of 41 mm between rings |
| arterial | Left posterior basal segmental artery | jump of 21 mm between rings |
| arterial | Left anterior basal segmental artery | jump of 24 mm between rings |
| arterial | Inferior lingular artery | jump of 32 mm between rings |
| arterial | Left lateral basal segmental artery | jump of 27 mm between rings |
| venous | Left apical segmental vein | jump of 38 mm between rings |
| venous | Left lateral basal segmental vein | jump of 23 mm between rings |
| venous | Left lateral basal segmental vein | jump of 22 mm between rings |
| venous | Left anterior basal segmental vein | jump of 24 mm between rings |
| arterial | Lateral branch of right lateral basal segmental artery | jump of 20 mm between rings |
| arterial | Mediobasal branch of right posterior basal segmental artery | jump of 38 mm between rings |
| venous | Superior part of medial segmental vein | jump of 22 mm between rings |
| venous | Inferior part of medial segmental vein | jump of 25 mm between rings |
| venous | Right posterior basal segmental vein | jump of 42 mm between rings |
| venous | Right lateral basal segmental vein | jump of 30 mm between rings |
| venous | Right lateral basal segmental vein | jump of 21 mm between rings |
| arterial | Descending aorta | jump of 48 mm between rings |
| venous | Inferior vena cava | jump of 38 mm between rings |
| venous | Inferior mesenteric vein | jump of 25 mm between rings |
| arterial | Left common iliac artery | jump of 39 mm between rings |
| venous | Left common iliac vein | jump of 40 mm between rings |
| arterial | Left external iliac artery | jump of 24 mm between rings |
| venous | Left internal iliac vein | jump of 21 mm between rings |
| venous | Left internal iliac vein | jump of 24 mm between rings |
| venous | Left internal iliac vein | jump of 25 mm between rings |
| arterial | Posterior division of left renal artery | fewer than 2 rings |
| venous | Left external iliac vein | jump of 34 mm between rings |
| venous | Left subclavian vein | jump of 21 mm between rings |
| venous | Left ascending lumbar vein | jump of 20 mm between rings |
| venous | Left external iliac vein | jump of 20 mm between rings |
| venous | Left superior epigastric vein | jump of 20 mm between rings |
| venous | Left superior gluteal vein | jump of 42 mm between rings |
| arterial | Right common iliac artery | jump of 27 mm between rings |
| venous | Right common iliac vein | jump of 23 mm between rings |
| arterial | Right internal iliac artery | jump of 20 mm between rings |
| venous | Right internal iliac vein | jump of 22 mm between rings |
| venous | Right internal iliac vein | jump of 21 mm between rings |
| arterial | Right subclavian artery | jump of 22 mm between rings |
| arterial | Right superficial epigastric artery | jump of 43 mm between rings |
| venous | Right superior epigastric vein | jump of 22 mm between rings |
| venous | Right superior gluteal vein | jump of 44 mm between rings |
| arterial | Right inferior phrenic artery | jump of 26 mm between rings |
| arterial | Trunk of superior mesenteric artery | jump of 21 mm between rings |
| arterial | Superior rectal artery | jump of 24 mm between rings |
| venous | Inferior vena cava | jump of 54 mm between rings |
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
| nervous | Superior gluteal nerve.l | jump of 32 mm between rings |
| nervous | Superior gluteal nerve.r | jump of 32 mm between rings |
