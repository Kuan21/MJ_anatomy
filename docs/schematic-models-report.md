# 示意模型全站檢查報告

由 `node scripts/check-schematic-models.mjs --write` 生成（不開瀏覽器；數值檢查，未在 3D 畫面確認）。

檢查範圍：骨性標誌 45 個；示意血管與神經 649 個（血管末端片 488、PK 示意血管／神經 149、神經串流示意管 12）。

門檻：骨面距離 ≤ 3 mm；標誌最長邊 ≤ 所屬骨骼最長邊的 60%（線、嵴、窩、緣 ≤ 90%）；斷開＝兩段之間的空隙大於約 1.5 mm；離開相鄰構造＝有一段離最近的構造（不計皮膚與漿膜）超過 15 mm。關節姿勢與 `scripts/test-vessel-motion.mjs` 相同（含極限角度）。區域：骨性標誌按所屬骨骼，末端片按所屬主血管。

反向對照：Left intertubercular groove 以舊的軟組織綁定重演（關節動作）已如預期判為失敗；Left median antebrachial vein 的末端片（斷開）已如預期判為失敗。

## 按區域的數目（結構數）

| 區域 | 骨性標誌 | 血管末端片（全部：單獨點選，卡寫「由相鄰構造的表面生成」） | 　其中末端片本身斷開成多段 | 　其中與主血管合併後仍斷開 | 示意血管／神經：斷開 | 示意血管／神經：多段但可能是設計（待確認） | 示意血管／神經：離開相鄰構造 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 頭頸 | 0 | 56 | 14 | 0 | 0 | 0 | 0 |
| 腹腔 | 0 | 39 | 13 | 1 | 0 | 2 | 0 |
| 骨盆與會陰 | 0 | 2 | 2 | 0 | 0 | 0 | 0 |
| 胸腔（含胸背壁） | 0 | 168 | 77 | 3 | 2 | 9 | 1 |
| 上肢 | 0 | 129 | 98 | 6 | 0 | 0 | 0 |
| 下肢 | 0 | 94 | 54 | 5 | 0 | 2 | 0 |
| **合計** | 0 | 488 | 258 | 15 | 2 | 13 | 1 |

## 頭頸

### 血管末端片（56）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| anterior inferior cerebellar artery | FJ1656-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior inferior cerebellar artery | FJ1656M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior temporal branch of left lateral occipital artery | FJ1661M-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Anterior temporal branch of right lateral occipital artery | FJ1661-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Anterolateral central branch of left middle cerebral artery | FJ1662M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterolateral central branch of right middle cerebral artery | FJ1662-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterolateral central branch of right middle cerebral artery | FJ1663-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Artery of right postcentral sulcus | FJ1666-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Artery of right precentral sulcus | FJ1669-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Branch of left anterior choroidal artery to posterior limb of left internal capsule | FJ1674M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Branch of left middle cerebral artery to left angular gyrus | FJ1673M-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Branch of right anterior choroidal artery to posterior limb of right internal capsule | FJ1674-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Branch of right middle cerebral artery to right angular gyrus | FJ1673-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Lateral branch of right superior cerebellar artery | FJ1683-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left anterior temporal artery | FJ1659M-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left callosomarginal artery | FJ1676M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left common carotid artery | FJ3483-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left medial occipital artery | FJ1691M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left pericallosal artery | FJ1699M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior inferior cerebellar artery | FJ1700M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior inferior cerebellar artery | FJ1702M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior inferior cerebellar artery | FJ1704M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior inferior cerebellar artery | FJ1705M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior inferior cerebellar artery | FJ1707M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior inferior cerebellar artery | FJ1708M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior inferior cerebellar artery | FJ1709M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior parietal artery | FJ1716M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left thalamogeniculate artery | FJ1675M-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Middle temporal branch of left lateral occipital artery | FJ1680M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Middle temporal branch of left middle cerebral artery | FJ1693M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Middle temporal branch of right lateral occipital artery | FJ1680-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Middle temporal branch of right middle cerebral artery | FJ1693-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior temporal branch of left middle cerebral artery | FJ1717M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior temporal branch of right middle cerebral artery | FJ1717-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Precuneal branch of left pericallosal artery | FJ1671M-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Precuneal branch of right pericallosal artery | FJ1671-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right anterior temporal artery | FJ1659-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right callosomarginal artery | FJ1676-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right medial occipital artery | FJ1691-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right pericallosal artery | FJ1699-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior inferior cerebellar artery | FJ1700-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior inferior cerebellar artery | FJ1702-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior inferior cerebellar artery | FJ1704-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior inferior cerebellar artery | FJ1705-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior inferior cerebellar artery | FJ1706-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior inferior cerebellar artery | FJ1707-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior inferior cerebellar artery | FJ1708-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior inferior cerebellar artery | FJ1709-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior parietal artery | FJ1716-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right thalamogeniculate artery | FJ1675-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right vertebral artery | FJ1725-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| set of posterior temporal branches of lateral occipital artery | FJ1719-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Superior vermian branch of medial branch of left superior cerebellar artery | FJ1728M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Superior vermian branch of medial branch of right superior cerebellar artery | FJ1728-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Temporo-occipital branch of left middle cerebral artery | FJ1729M-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Temporo-occipital branch of right middle cerebral artery | FJ1729-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |

## 腹腔

### 示意血管／神經（PK 與神經串流）（2）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| Left paraumbilical veins | PK-65 | 多段（名稱為複數、叢或多節段，可能是設計，待確認） | 5 段 |
| Right paraumbilical veins | PK-60 | 多段（名稱為複數、叢或多節段，可能是設計，待確認） | 5 段 |

### 血管末端片（39）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| Anterior division of right renal artery | FJ3563-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Ileocolic artery | FJ3439-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Ileocolic vein | FJ3415-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Ileocolic vein | FJ3440-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Inferior mesenteric artery | FJ3442-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Inferior mesenteric vein | FJ3443-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Inferior segmental branch of left renal artery | FJ2049-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Inferior segmental branch of right renal artery | FJ2043-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Inferior vena cava | FJ3659-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left ascending lumbar vein | FJ3493-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left external iliac artery | FJ3466-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left external iliac vein | FJ3484-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left iliolumbar vein | FJ3510-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left inferior epigastric artery | FJ3511-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left inferior epigastric vein | FJ3512-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left internal iliac artery | FJ3468-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left lateral sacral vein | FJ3526-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left renal vein | FJ3477-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left superficial epigastric artery | FJ3529-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left testicular artery | FJ3532-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Left testicular vein | FJ3533-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Lumbar vein | FJ3631-END | 斷開成多段 | 末端片 2 段；與主血管合併後 4 段 |
| Median sacral vein | FJ3541-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior division of right renal artery | FJ3574-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior segmental branch of left renal artery | FJ2054-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior segmental branch of right renal artery | FJ2045-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right anterior segmental artery | FJ2041-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right anterior segmental artery | FJ2044-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right ascending lumbar vein | FJ3589-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right external iliac vein | FJ3568-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Right iliolumbar vein | FJ3603-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right inferior epigastric artery | FJ3604-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right inferior epigastric vein | FJ3605-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right internal iliac vein | FJ3607-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right lateral sacral vein | FJ3611-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right renal vein | FJ3577-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right testicular artery | FJ3617-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Right testicular vein | FJ3618-END | 斷開成多段 | 末端片 7 段；與主血管合併後 1 段 |
| Sigmoid artery | FJ3638-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |

## 骨盆與會陰

### 血管末端片（2）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| Left internal pudendal vein | FJ3525-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right internal pudendal vein | FJ3610-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |

## 胸腔（含胸背壁）

### 示意血管／神經（PK 與神經串流）（12）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| Esophageal plexus | PK-35 | 多段（名稱為複數、叢或多節段，可能是設計，待確認） | 2 段 |
| Left anterior intercostal arteries | PK-10 | 多段（名稱為複數、叢或多節段，可能是設計，待確認） | 5 段 |
| Left dorsal ramus of thoracic spinal nerve | PK-130 | 多段（名稱為複數、叢或多節段，可能是設計，待確認） | 10 段 |
| Left medial mammary branch of internal thoracic artery | PK-9 | 斷開成多段 | 3 段 |
| Left posterior cutaneous branch of dorsal ramus of thoracic spinal nerve | PK-131 | 多段（名稱為複數、叢或多節段，可能是設計，待確認） | 10 段 |
| Left posterior intercostal veins | PK-124 | 多段（名稱為複數、叢或多節段，可能是設計，待確認） | 4 段 |
| Right anterior intercostal arteries | PK-5 | 多段（名稱為複數、叢或多節段，可能是設計，待確認） | 5 段 |
| Right dorsal ramus of thoracic spinal nerve | PK-128 | 多段（名稱為複數、叢或多節段，可能是設計，待確認） | 10 段 |
| Right medial mammary branch of internal thoracic artery | PK-4 | 斷開成多段 | 3 段 |
| Right posterior cutaneous branch of dorsal ramus of thoracic spinal nerve | PK-129 | 多段（名稱為複數、叢或多節段，可能是設計，待確認） | 10 段 |
| Right posterior intercostal veins | PK-121 | 多段（名稱為複數、叢或多節段，可能是設計，待確認） | 8 段 |
| Right thoracoepigastric vein | PK-59 | 離開相鄰構造太遠 | 有一段離最近的構造 > 15 mm |

### 血管末端片（168）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| Accessory hemiazygos vein | FJ1981-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Accessory subsuperior branch of right posterior basal segmental artery | FJ3009-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Accessory subsuperior branch of right posterior basal segmental artery | FJ3010-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior branch of lateral segmental artery | FJ2982-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Anterior branch of right anterior segmental artery | FJ2975-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Anterior inferior segmental tributary of middle hepatic vein | FJ3083-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Anterior inferior segmental tributary of middle hepatic vein | FJ3086-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Anterior part of lateral segmental vein | FJ3034-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Anterior part of right apical segmental artery | FJ2978-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior part of right apical segmental vein | FJ3042-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Anterior part of right apical segmental vein | FJ3053-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Anterior superior segmental tributary of right hepatic vein | FJ3121-END | 斷開成多段 | 末端片 3 段；與主血管合併後 4 段 |
| Apical part of right apical segmental artery | FJ2967-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Apical part of right apical segmental vein | FJ3064-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Apical part of right apical segmental vein | FJ3067-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Apical part of right apical segmental vein | FJ3068-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Azygos vein | FJ3416-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Bronchial artery | FJ1933-END | 單獨點選 | 末端片 1 段；與主血管合併後 2 段 |
| Common hepatic artery | FJ3078-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Descending thoracic aorta | FJ1931-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Hepatic artery proper | FJ3081-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Hepatovenous segment II | FJ2818-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Hepatovenous segment III | FJ2819-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Hepatovenous segment IV | FJ2820-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Hepatovenous segment V | FJ2821-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Hepatovenous segment VI | FJ2822-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Hepatovenous segment VIII | FJ2824-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Inferior branch of medial segmental artery | FJ2987-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Inferior branch of medial segmental artery | FJ2988-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Inferior lingular artery | FJ2896-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Inferior lingular artery | FJ2897-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Inferior lingular vein | FJ2934-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Inferior lingular vein | FJ2935-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Inferior part of medial segmental vein | FJ3032-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Inferior part of right anterior segmental vein | FJ3021-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Lateral branch of right anterior basal segmental artery | FJ3001-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Lateral branch of right lateral basal segmental artery | FJ3005-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Lateral branch of right lateral basal segmental artery | FJ3006-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Lateral branch of right lateral basal segmental artery | FJ3007-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Lateral inferior segmental tributary of left hepatic vein | FJ3097-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Lateral inferior segmental tributary of left hepatic vein | FJ3099-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Lateral inferior segmental tributary of left hepatic vein | FJ3100-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Laterobasal branch of right posterior basal segmental artery | FJ3013-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Laterobasal branch of right posterior basal segmental artery | FJ3014-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left anterior basal segmental artery | FJ2883-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left anterior basal segmental artery | FJ2886-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left anterior basal segmental vein | FJ2956-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left anterior segmental artery | FJ2902-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left anterior segmental artery | FJ2906-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left anterior segmental vein | FJ2930-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left anterior segmental vein | FJ2931-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left anterior segmental vein | FJ2932-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left apical segmental artery | FJ2915-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left apical segmental artery | FJ2917-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left apical segmental vein | FJ2947-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left apical segmental vein | FJ2958-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left apical segmental vein | FJ2961-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left apical segmental vein | FJ2962-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left apical segmental vein | FJ2963-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left brachiocephalic vein | FJ3482-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left gastric artery | FJ3499-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left gastric vein | FJ3500-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left hepatic vein | FJ2415-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Left inferior phrenic artery | FJ3514-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left inferior pulmonary vein | FJ2944-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left inferior pulmonary vein | FJ2950-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left inferior pulmonary vein | FJ2955-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left internal thoracic artery | FJ1972-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Left lateral basal segmental artery | FJ2921-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left lateral basal segmental vein | FJ2951-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left lateral basal segmental vein | FJ2953-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left lateral basal segmental vein | FJ2954-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left lateral thoracic artery | FJ1976-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Left lateral thoracic vein | FJ2233-END | 斷開成多段 | 末端片 10 段；與主血管合併後 1 段 |
| Left medial basal segmental artery | FJ2884-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left middle suprarenal artery | FJ3472-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left portal vein | FJ2404-END | 斷開成多段 | 末端片 22 段；與主血管合併後 1 段 |
| Left posterior basal segmental artery | FJ2881-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior basal segmental artery | FJ2919-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left posterior basal segmental vein | FJ2945-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left posterior basal segmental vein | FJ2946-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior basal segmental vein | FJ2948-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior basal segmental vein | FJ2949-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior segmental artery | FJ2911-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left posterior segmental vein | FJ2926-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior segmental vein | FJ2927-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior segmental vein | FJ2928-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior segmental vein | FJ2939-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left posterior segmental vein | FJ2941-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior segmental vein | FJ2942-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior segmental vein | FJ2943-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left pulmonary artery | FJ2924-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left subclavian artery | FJ3479-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left subclavian vein | FJ3486-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left superior epigastric artery | FJ1971-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left superior intercostal vein | FJ1986-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left superior pulmonary vein | FJ2925-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left superior pulmonary vein | FJ2933-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left superior segmental artery | FJ2891-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left thoracodorsal artery | FJ2253-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Left thoracodorsal vein | FJ2254-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Medial branch of right superior segmental artery | FJ2994-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Medial inferior segmental tributary of middle hepatic vein | FJ3084-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Medial inferior segmental tributary of middle hepatic vein | FJ3085-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Medial superior segmental tributary of left hepatic vein | FJ3101-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Mediobasal branch of right posterior basal segmental artery | FJ3012-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Middle hepatic vein | FJ2414-END | 斷開成多段 | 末端片 14 段；與主血管合併後 1 段 |
| Posterior branch of lateral segmental artery | FJ2983-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior branch of right anterior segmental artery | FJ2974-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Posterior branch of right anterior segmental artery | FJ2980-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior inferior segmental tributary of right hepatic vein | FJ3118-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Posterior inferior segmental tributary of right hepatic vein | FJ3120-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Posterior intercostal arteries | FJ1975-END | 單獨點選 | 末端片 1 段；與主血管合併後 9 段 |
| Posterior part of lateral segmental vein | FJ3037-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Posterior part of lateral segmental vein | FJ3038-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior part of right posterior segmental artery | FJ2970-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Posterior superior segmental tributary of right hepatic vein | FJ3119-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Right anterior basal segmental vein | FJ3049-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right anterior basal segmental vein | FJ3056-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right anterior segmental vein | FJ3028-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right brachiocephalic vein | FJ3583-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right first posterior intercostal artery | FJ1939-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right gastric artery | FJ3594-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right gastric vein | FJ3595-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right hepatic vein | FJ2416-END | 斷開成多段 | 末端片 14 段；與主血管合併後 1 段 |
| Right inferior phrenic artery | FJ3619-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right inferior suprarenal artery | FJ3584-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right internal thoracic artery | FJ1937-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right internal thoracic vein | FJ1993-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right lateral basal segmental vein | FJ3059-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right lateral basal segmental vein | FJ3060-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right lateral basal segmental vein | FJ3061-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right lateral basal segmental vein | FJ3062-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right lateral thoracic artery | FJ1938-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Right lateral thoracic vein | FJ2285-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Right medial basal segmental vein | FJ3054-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior basal segmental vein | FJ3041-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior basal segmental vein | FJ3043-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right posterior basal segmental vein | FJ3044-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior basal segmental vein | FJ3048-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior basal segmental vein | FJ3058-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right posterior segmental vein | FJ3022-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior segmental vein | FJ3024-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior segmental vein | FJ3026-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior segmental vein | FJ3069-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right posterior segmental vein | FJ3070-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right pulmonary artery | FJ3019-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right subclavian vein | FJ3587-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right superior epigastric artery | FJ1936-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right superior intercostal vein | FJ1991-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right superior segmental vein | FJ3051-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right superior segmental vein | FJ3063-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right superior segmental vein | FJ3065-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right superior segmental vein | FJ3066-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right thoracodorsal artery | FJ2305-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Right thoracodorsal vein | FJ2306-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Right upper lobar artery | FJ2973-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Splenic artery | FJ2562-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Splenic artery | FJ3640-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Superior branch of medial segmental artery | FJ2990-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Superior lingular artery | FJ2898-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Superior lingular vein | FJ2937-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Superior part of medial segmental vein | FJ3030-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Superior part of right anterior segmental vein | FJ3027-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Superior phrenic vein | FJ3648-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Superior segmental branch of right renal artery | FJ2042-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Tributary of middle hepatic vein | FJ1867-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Trunk of right apical segmental vein | FJ3031-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |

## 上肢

### 血管末端片（129）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| Acromial branch of left thoraco-acromial artery | FJ2211-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Acromial branch of right thoraco-acromial artery | FJ2263-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Clavicular branch of right thoraco-acromial artery | PK-2-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Deltoid branch of left thoraco-acromial artery | FJ2230-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Deltoid branch of right thoraco-acromial artery | FJ2282-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Dorsal venous network of left hand | FJ2228-END | 斷開成多段 | 末端片 10 段；與主血管合併後 1 段 |
| Dorsal venous network of right hand | FJ2280-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Lateral proper palmar digital artery of left little finger | FJ2336-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Lateral proper palmar digital artery of left middle finger | FJ2334-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Lateral proper palmar digital artery of left ring finger | FJ2335-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Lateral proper palmar digital artery of right middle finger | FJ2365-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Lateral proper palmar digital artery of right ring finger | FJ2366-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left anterior circumflex humeral artery | FJ2212-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Left anterior circumflex humeral vein | FJ2213-END | 斷開成多段 | 末端片 7 段；與主血管合併後 1 段 |
| Left anterior interosseous artery | FJ2214-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left arteria princeps pollicis | FJ2338-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left arteria princeps pollicis | FJ2339-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left arteria radialis indicis | FJ2332-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left axillary artery | FJ2216-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left axillary vein | FJ2217-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left basilic vein | FJ2218-END | 斷開成多段 | 末端片 15 段；與主血管合併後 1 段 |
| Left brachial artery | FJ2219-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left cephalic vein | FJ2220-END | 斷開成多段 | 末端片 13 段；與主血管合併後 1 段 |
| Left circumflex scapular artery | FJ2221-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left circumflex scapular vein | FJ2222-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left deep brachial artery | FJ2225-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left deep palmar arch | FJ2227-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left deep palmar venous arch | FJ2229-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left dorsal scapular artery | FJ2232-END | 斷開成多段 | 末端片 11 段；與主血管合併後 1 段 |
| Left first common palmar digital artery | FJ2315-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left fourth common palmar digital artery | FJ2337-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left inferior ulnar collateral artery | FJ2215-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left lateral brachial vein | PK-61-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left medial brachial vein | FJ2313-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left median antebrachial vein | FJ2234-END | 斷開成多段 | 末端片 7 段；與主血管合併後 1 段 |
| Left median cubital vein | FJ2235-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left palmar metacarpal artery | FJ2237-END | 單獨點選 | 末端片 1 段；與主血管合併後 4 段 |
| Left palmar metacarpal vein | FJ2238-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left palmar metacarpal vein | FJ2320-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left palmar metacarpal vein | FJ2323-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior circumflex humeral artery | FJ2239-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior circumflex humeral artery | FJ2240-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left posterior ulnar recurrent artery | PKC-314-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left radial artery | FJ2242-END | 斷開成多段 | 末端片 9 段；與主血管合併後 1 段 |
| Left radial recurrent artery | FJ2243-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left radial vein | FJ2244-END | 斷開成多段 | 末端片 10 段；與主血管合併後 1 段 |
| Left recurrent interosseous artery | FJ2245-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left subscapular artery | FJ2246-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left subscapular vein | FJ2247-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left superficial palmar arterial arch | FJ2248-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left superficial palmar venous arch | FJ2249-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left superior ulnar collateral artery | FJ2374-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left suprascapular artery | FJ2251-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left suprascapular vein | FJ2250-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left ulnar artery | FJ2258-END | 斷開成多段 | 末端片 9 段；與主血管合併後 1 段 |
| Left ulnar vein | FJ2260-END | 斷開成多段 | 末端片 7 段；與主血管合併後 1 段 |
| Medial proper palmar digital artery of left index finger | FJ2333-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Medial proper palmar digital artery of right index finger | FJ2364-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Medial proper palmar digital artery of right middle finger | FJ2367-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Medial proper palmar digital artery of right ring finger | FJ2369-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Middle collateral branch of left deep brachial artery | FJ2331-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Middle collateral branch of right deep brachial artery | FJ2362-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Pectoral branch of left thoraco-acromial artery | FJ2330-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Pectoral branch of right thoraco-acromial artery | FJ2361-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Proper palmar digital vein of left index finger | FJ2324-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Proper palmar digital vein of left index finger | FJ2325-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Proper palmar digital vein of left little finger | FJ2319-END | 斷開成多段 | 末端片 2 段；與主血管合併後 4 段 |
| Proper palmar digital vein of left little finger | FJ2321-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Proper palmar digital vein of left little finger | FJ2329-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Proper palmar digital vein of left middle finger | FJ2326-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Proper palmar digital vein of left middle finger | FJ2340-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Proper palmar digital vein of left ring finger | FJ2327-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Proper palmar digital vein of left ring finger | FJ2328-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Proper palmar digital vein of right index finger | FJ2354-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Proper palmar digital vein of right index finger | FJ2355-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Proper palmar digital vein of right little finger | FJ2351-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Proper palmar digital vein of right little finger | FJ2360-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Proper palmar digital vein of right middle finger | FJ2356-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Proper palmar digital vein of right ring finger | FJ2358-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Proper palmar digital vein of right ring finger | FJ2359-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Radial collateral branch of left deep brachial artery | FJ2261-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Radial collateral branch of right deep brachial artery | FJ2262-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right anterior circumflex humeral artery | FJ2264-END | 斷開成多段 | 末端片 7 段；與主血管合併後 1 段 |
| Right anterior circumflex humeral vein | FJ2265-END | 斷開成多段 | 末端片 7 段；與主血管合併後 1 段 |
| Right anterior interosseous artery | FJ2266-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Right arteria princeps pollicis | FJ2371-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Right arteria princeps pollicis | FJ2372-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right arteria radialis indicis | FJ2342-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right arteria radialis indicis | FJ2363-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right axillary artery | FJ2268-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right axillary vein | FJ2269-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right basilic vein | FJ2270-END | 斷開成多段 | 末端片 12 段；與主血管合併後 1 段 |
| Right brachial artery | FJ2271-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right cephalic vein | FJ2272-END | 斷開成多段 | 末端片 12 段；與主血管合併後 1 段 |
| Right circumflex scapular artery | FJ2273-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right circumflex scapular vein | FJ2274-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right deep brachial artery | FJ2277-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Right deep palmar arch | FJ2279-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right dorsal scapular artery | FJ2284-END | 斷開成多段 | 末端片 12 段；與主血管合併後 1 段 |
| Right first common palmar digital artery | FJ2343-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right fourth common palmar digital artery | FJ2370-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right inferior ulnar collateral artery | FJ2267-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Right lateral brachial vein | PK-56-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right medial brachial vein | FJ2341-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right median antebrachial vein | FJ2286-END | 斷開成多段 | 末端片 7 段；與主血管合併後 1 段 |
| Right median cubital vein | FJ2287-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right palmar metacarpal vein | FJ2290-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right palmar metacarpal vein | FJ2350-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior circumflex humeral artery | FJ2291-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior circumflex humeral artery | FJ2292-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right posterior interosseous artery | PK-43-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior ulnar recurrent artery | PKC-313-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right radial artery | FJ2294-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Right radial recurrent artery | FJ2295-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Right radial vein | FJ2296-END | 斷開成多段 | 末端片 11 段；與主血管合併後 1 段 |
| Right recurrent interosseous artery | FJ2297-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right subscapular artery | FJ2298-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right subscapular vein | FJ2299-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right superficial palmar arterial arch | FJ2300-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Right superficial palmar venous arch | FJ2301-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right superior ulnar collateral artery | FJ2373-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Right suprascapular artery | FJ2303-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right suprascapular vein | FJ2302-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Right ulnar artery | FJ2310-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Right ulnar vein | FJ2312-END | 斷開成多段 | 末端片 11 段；與主血管合併後 1 段 |
| Set of dorsal digital arteries | FJ2318-END | 斷開成多段 | 末端片 2 段；與主血管合併後 5 段 |
| Set of dorsal digital arteries | FJ2346-END | 斷開成多段 | 末端片 2 段；與主血管合併後 5 段 |
| Set of dorsal metacarpal arteries | FJ2347-END | 單獨點選 | 末端片 1 段；與主血管合併後 5 段 |
| Set of dorsal metacarpal arteries | FJ2348-END | 斷開成多段 | 末端片 2 段；與主血管合併後 5 段 |

## 下肢

### 示意血管／神經（PK 與神經串流）（2）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| Left perforating branch of deep femoral artery | PK-94 | 多段（名稱為複數、叢或多節段，可能是設計，待確認） | 3 段 |
| Right perforating branch of deep femoral artery | PK-67 | 多段（名稱為複數、叢或多節段，可能是設計，待確認） | 3 段 |

### 血管末端片（94）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| Descending branch of left lateral circumflex femoral artery | FJ2063-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Descending branch of right lateral circumflex femoral artery | FJ2057-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Dorsal venous arch of left foot | FJ2059-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Dorsal venous arch of right foot | FJ2061-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left anterior tibial artery | FJ2065-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left anterior tibial recurrent artery | FJ2066-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left anterior tibial vein | FJ2097-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left anterior tibial vein | FJ2183-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left arcuate artery | FJ2067-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left ascending and transverse branches of lateral circumflex femoral artery | FJ2091-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left deep femoral artery | PK-93-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Left deep femoral vein | FJ2099-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Left descending genicular artery | FJ2069-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Left dorsal metatarsal vein | FJ2186-END | 斷開成多段 | 末端片 2 段；與主血管合併後 5 段 |
| Left dorsalis pedis artery | FJ2073-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left femoral artery | PKC-317-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left fibular vein | FJ2187-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left genicular vein | FJ2107-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left genicular vein | FJ2108-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left genicular vein | FJ2124-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left genicular vein | FJ2125-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left great saphenous vein | FJ2103-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Left inferior gluteal vein | FJ3513-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left inferior lateral genicular artery | FJ2076-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left inferior medial genicular artery | FJ2077-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left lateral circumflex femoral vein | FJ2188-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left lateral plantar artery | FJ2079-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left lateral plantar vein | PK-107-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left lateral superior genicular artery | FJ2080-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left lateral tarsal artery | FJ2081-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left medial circumflex femoral artery | PK-95-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left medial circumflex femoral vein | FJ2189-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left medial plantar artery | FJ2082-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left medial superior genicular artery | FJ2083-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left middle genicular artery | FJ2084-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left obturator vein | FJ3527-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left plantar arch | FJ2085-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left popliteal artery | FJ2086-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left popliteal vein | FJ2117-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left posterior tibial artery | FJ2087-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left posterior tibial vein | FJ2118-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left small saphenous vein | FJ2121-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left superior gluteal artery | PK-108-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left superior gluteal vein | FJ3531-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Plantar metatarsal artery | FJ2206-END | 單獨點選 | 末端片 1 段；與主血管合併後 3 段 |
| Plantar venous arch of left foot | FJ2128-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Plantar venous arch of right foot | FJ2129-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Right anterior tibial artery | FJ2130-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right anterior tibial recurrent artery | FJ2131-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right anterior tibial vein | FJ2132-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right anterior tibial vein | FJ2193-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right arcuate artery | FJ2133-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right ascending and transverse branches of lateral circumflex femoral artery | FJ2195-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right deep femoral artery | PK-66-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Right deep femoral vein | FJ2135-END | 斷開成多段 | 末端片 10 段；與主血管合併後 1 段 |
| Right deep plantar artery | FJ2136-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right descending genicular artery | FJ2137-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Right dorsalis pedis artery | FJ2055-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right fibular vein | FJ2200-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right genicular vein | FJ2151-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right genicular vein | FJ2153-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right genicular vein | FJ2181-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right genicular vein | FJ2182-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right great saphenous vein | FJ2145-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right inferior gluteal vein | FJ3606-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right inferior lateral genicular artery | FJ2150-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right inferior medial genicular artery | FJ2152-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right lateral circumflex femoral artery | FJ2158-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right lateral circumflex femoral vein | FJ2201-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Right lateral plantar artery | FJ2159-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right lateral plantar vein | PK-80-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right lateral superior genicular artery | FJ2162-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right lateral tarsal artery | FJ2163-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right medial circumflex femoral artery | PK-68-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right medial circumflex femoral vein | FJ2202-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right medial plantar artery | FJ2164-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right medial superior genicular artery | FJ2166-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right middle genicular artery | FJ2167-END | 單獨點選 | 末端片 1 段；與主血管合併後 2 段 |
| Right obturator vein | FJ3612-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right plantar arch | FJ2169-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right popliteal artery | FJ2170-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Right popliteal vein | FJ2171-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Right posterior tibial artery | FJ2172-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior tibial vein | FJ2173-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right small saphenous vein | FJ2176-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right superficial medial plantar artery | FJ2179-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right superior gluteal artery | PK-81-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right superior gluteal vein | FJ3616-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Set of dorsal digital veins | FJ2185-END | 單獨點選 | 末端片 1 段；與主血管合併後 6 段 |
| Set of perforating arteries | FJ2094-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Set of perforating arteries | FJ2203-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Set of plantar digital veins | FJ2120-END | 單獨點選 | 末端片 1 段；與主血管合併後 6 段 |
| Tributary of plantar venous arch | FJ2113-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Tributary of plantar venous arch | FJ2115-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
