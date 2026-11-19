# 示意模型全站檢查報告

由 `node scripts/check-schematic-models.mjs --write` 生成（不開瀏覽器；數值檢查，未在 3D 畫面確認）。

檢查範圍：骨性標誌 45 個；示意血管與神經 645 個（血管末端片 484、PK 示意血管／神經 149、神經串流示意管 12）。

門檻：骨面距離 ≤ 3 mm；標誌最長邊 ≤ 所屬骨骼最長邊的 60%（線、嵴、窩、緣 ≤ 90%）；斷開＝兩段之間的空隙大於約 1.5 mm；離開相鄰構造＝有一段離最近的構造（不計皮膚與漿膜）超過 15 mm。關節姿勢與 `scripts/test-vessel-motion.mjs` 相同（含極限角度）。區域：骨性標誌按所屬骨骼，末端片按所屬主血管。

反向對照：Left intertubercular groove 以舊的軟組織綁定重演（關節動作）已如預期判為失敗；Left median antebrachial vein 的末端片單獨選取（舊的點選方式，斷開）已如預期判為失敗。

## 按區域的數目（結構數）

| 區域 | 骨性標誌 | 血管末端片：點選（主血管＋末端片）後仍斷開 | 示意血管／神經：斷開 | 示意血管／神經：多段但可能是設計（待確認） | 示意血管／神經：離開相鄰構造 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 頭頸 | 0 | 0 | 0 | 0 | 0 |
| 腹腔 | 0 | 1 | 0 | 2 | 0 |
| 骨盆與會陰 | 0 | 0 | 0 | 0 | 0 |
| 胸腔（含胸背壁） | 0 | 3 | 2 | 9 | 1 |
| 上肢 | 0 | 6 | 0 | 0 | 0 |
| 下肢 | 0 | 5 | 0 | 2 | 0 |
| **合計** | 0 | 15 | 2 | 13 | 1 |

## 腹腔

### 示意血管／神經（PK 與神經串流）（2）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| Left paraumbilical veins | PK-65 | 多段（名稱為複數、叢或多節段，可能是設計，待確認） | 5 段 |
| Right paraumbilical veins | PK-60 | 多段（名稱為複數、叢或多節段，可能是設計，待確認） | 5 段 |

### 血管末端片（1）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| Lumbar vein | FJ3631-END | 與主血管合併後仍斷開 | 點選得到 4 段（末端片本身 2 段） |

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

### 血管末端片（3）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| Anterior superior segmental tributary of right hepatic vein | FJ3121-END | 與主血管合併後仍斷開 | 點選得到 4 段（末端片本身 3 段） |
| Bronchial artery | FJ1933-END | 與主血管合併後仍斷開 | 點選得到 2 段（末端片本身 1 段） |
| Posterior intercostal arteries | FJ1975-END | 與主血管合併後仍斷開 | 點選得到 9 段（末端片本身 1 段） |

## 上肢

### 血管末端片（6）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| Left palmar metacarpal artery | FJ2237-END | 與主血管合併後仍斷開 | 點選得到 4 段（末端片本身 1 段） |
| Proper palmar digital vein of left little finger | FJ2319-END | 與主血管合併後仍斷開 | 點選得到 4 段（末端片本身 2 段） |
| Set of dorsal digital arteries | FJ2318-END | 與主血管合併後仍斷開 | 點選得到 5 段（末端片本身 2 段） |
| Set of dorsal digital arteries | FJ2346-END | 與主血管合併後仍斷開 | 點選得到 5 段（末端片本身 2 段） |
| Set of dorsal metacarpal arteries | FJ2347-END | 與主血管合併後仍斷開 | 點選得到 5 段（末端片本身 1 段） |
| Set of dorsal metacarpal arteries | FJ2348-END | 與主血管合併後仍斷開 | 點選得到 5 段（末端片本身 2 段） |

## 下肢

### 示意血管／神經（PK 與神經串流）（2）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| Left perforating branch of deep femoral artery | PK-94 | 多段（名稱為複數、叢或多節段，可能是設計，待確認） | 3 段 |
| Right perforating branch of deep femoral artery | PK-67 | 多段（名稱為複數、叢或多節段，可能是設計，待確認） | 3 段 |

### 血管末端片（5）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| Left dorsal metatarsal vein | FJ2186-END | 與主血管合併後仍斷開 | 點選得到 5 段（末端片本身 2 段） |
| Plantar metatarsal artery | FJ2206-END | 與主血管合併後仍斷開 | 點選得到 3 段（末端片本身 1 段） |
| Right middle genicular artery | FJ2167-END | 與主血管合併後仍斷開 | 點選得到 2 段（末端片本身 1 段） |
| Set of dorsal digital veins | FJ2185-END | 與主血管合併後仍斷開 | 點選得到 6 段（末端片本身 1 段） |
| Set of plantar digital veins | FJ2120-END | 與主血管合併後仍斷開 | 點選得到 6 段（末端片本身 1 段） |
