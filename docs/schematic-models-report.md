# 示意模型全站檢查報告

由 `node scripts/check-schematic-models.mjs --write` 生成（不開瀏覽器；數值檢查，未在 3D 畫面確認）。

檢查範圍：骨性標誌 37 個；示意血管與神經 1034 個（血管末端片 873、PK 示意血管／神經 149、神經串流示意管 12）。

門檻：骨面距離 ≤ 3 mm；標誌最長邊 ≤ 所屬骨骼最長邊的 60%；斷開＝兩段之間的空隙大於約 1.5 mm；離開相鄰構造＝有一段離最近的構造（不計皮膚與漿膜）超過 15 mm。關節姿勢與 `scripts/test-vessel-motion.mjs` 相同（含極限角度）。區域：骨性標誌按所屬骨骼，末端片按所屬主血管。

反向對照：Left intertubercular groove（關節動作）已如預期判為失敗；Left median antebrachial vein 的末端片（斷開）已如預期判為失敗。

## 按區域的數目（結構數）

| 區域 | 骨性標誌 | 血管末端片（全部：單獨點選，卡寫「由相鄰構造的表面生成」） | 　其中末端片本身斷開成多段 | 　其中與主血管合併後仍斷開 | 示意血管／神經：斷開 | 示意血管／神經：多段但可能是設計（待確認） | 示意血管／神經：離開相鄰構造 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 頭頸 | 1 | 133 | 46 | 0 | 0 | 0 | 0 |
| 腹腔 | 0 | 78 | 55 | 8 | 0 | 2 | 0 |
| 骨盆與會陰 | 4 | 10 | 9 | 0 | 0 | 0 | 0 |
| 胸腔（含胸背壁） | 0 | 407 | 217 | 14 | 2 | 9 | 1 |
| 上肢 | 20 | 129 | 98 | 6 | 0 | 0 | 0 |
| 下肢 | 0 | 116 | 96 | 21 | 0 | 2 | 0 |
| **合計** | 25 | 873 | 521 | 49 | 2 | 13 | 1 |

## 頭頸

### 骨性標誌（1）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| Superior nuchal line | PK-166 | 尺寸過大 | 最長邊為骨骼的 71% |

### 血管末端片（133）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| anterior inferior cerebellar artery | FJ1656-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior inferior cerebellar artery | FJ1656M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior temporal branch of left lateral occipital artery | FJ1661M-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Anterior temporal branch of right lateral occipital artery | FJ1661-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Anterolateral central branch of left middle cerebral artery | FJ1662M-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Anterolateral central branch of left middle cerebral artery | FJ1663M-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Anterolateral central branch of right middle cerebral artery | FJ1662-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Anterolateral central branch of right middle cerebral artery | FJ1663-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| artery of central sulcus | FJ1664-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| artery of central sulcus | FJ1665-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Artery of central sulcus | FJ1664M-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Artery of central sulcus | FJ1665M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Artery of left postcentral sulcus | FJ1666M-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Artery of left precentral sulcus | FJ1668M-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Artery of left precentral sulcus | FJ1669M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Artery of left precentral sulcus | FJ1670M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Artery of right postcentral sulcus | FJ1666-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Artery of right precentral sulcus | FJ1668-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Artery of right precentral sulcus | FJ1669-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Artery of right precentral sulcus | FJ1670-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Branch of left anterior choroidal artery to posterior limb of left internal capsule | FJ1674M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Branch of left middle cerebral artery to left angular gyrus | FJ1673M-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Branch of right anterior choroidal artery to posterior limb of right internal capsule | FJ1674-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Branch of right middle cerebral artery to right angular gyrus | FJ1673-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Hypothalamic branch of left posterior communicating artery | FJ1679M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Hypothalamic branch of right posterior communicating artery | FJ1679-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Insular part of left middle cerebral artery | FJ1694M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Intermediomedial branch of left callosomarginal artery | FJ1681M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Intermediomedial branch of right callosomarginal artery | FJ1681-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Lateral branch of left pontine artery | FJ1684M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Lateral branch of left superior cerebellar artery | FJ1683M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Lateral branch of right pontine artery | FJ1684-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Lateral branch of right superior cerebellar artery | FJ1683-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left anterior choroidal artery | FJ1658M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left anterior parietal artery | FJ1667M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left anterior temporal artery | FJ1659M-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left callosomarginal artery | FJ1676M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left common carotid artery | FJ3483-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left deep cervical artery | FJ2226-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left inferior thyroid artery | FJ2210-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left internal carotid artery | FJ1682M-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left lateral frontobasal artery | FJ1685M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left lateral frontobasal artery | FJ1686M-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left lateral occipital artery | FJ1687M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left medial frontobasal artery | FJ1690M-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left medial occipital artery | FJ1691M-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left ophthalmic artery | FJ1695M-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left pericallosal artery | FJ1699M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left polar temporal artery | FJ1712M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior inferior cerebellar artery | FJ1700M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior inferior cerebellar artery | FJ1701M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior inferior cerebellar artery | FJ1702M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior inferior cerebellar artery | FJ1703M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior inferior cerebellar artery | FJ1704M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior inferior cerebellar artery | FJ1705M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior inferior cerebellar artery | FJ1706M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior inferior cerebellar artery | FJ1707M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior inferior cerebellar artery | FJ1708M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior inferior cerebellar artery | FJ1709M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior inferior cerebellar artery | FJ1710M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior inferior cerebellar artery | FJ1711M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior inferior cerebellar artery | FJ1715M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior medial choroidal artery | FJ1727M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior parietal artery | FJ1716M-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left prefrontal artery | FJ1724M-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left superficial cervical artery | FJ2256-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left thalamogeniculate artery | FJ1675M-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Left thalamoperforating artery | FJ1720M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left vertebral artery | FJ1725M-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Medial branch of left pontine artery | FJ1689M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Medial branch of right pontine artery | FJ1689-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Middle temporal branch of left lateral occipital artery | FJ1680M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Middle temporal branch of left middle cerebral artery | FJ1693M-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Middle temporal branch of right lateral occipital artery | FJ1680-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Middle temporal branch of right middle cerebral artery | FJ1693-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Paracentral branch of left callosomarginal artery | FJ1696M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Paracentral branch of left callosomarginal artery | FJ1697M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Paracentral branch of left callosomarginal artery | FJ1698M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Paracentral branch of right callosomarginal artery | FJ1696-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Paracentral branch of right callosomarginal artery | FJ1697-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Paracentral branch of right callosomarginal artery | FJ1698-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior temporal branch of left middle cerebral artery | FJ1717M-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Posterior temporal branch of right middle cerebral artery | FJ1717-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Posteromedial branch of left callosomarginal artery | FJ1722M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posteromedial branch of right callosomarginal artery | FJ1722-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posteromedial central branch of left posterior cerebral artery | FJ1721M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posteromedial central branch of right posterior cerebral artery | FJ1721-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Precuneal branch of left pericallosal artery | FJ1671M-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Precuneal branch of right pericallosal artery | FJ1671-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right anterior choroidal artery | FJ1658-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right anterior parietal artery | FJ1667-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right anterior temporal artery | FJ1659-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Right callosomarginal artery | FJ1676-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right common carotid artery | FJ3564-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right deep cervical artery | FJ2278-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right inferior thyroid artery | FJ2209-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right internal carotid artery | FJ1682-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right lateral frontobasal artery | FJ1685-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right lateral frontobasal artery | FJ1686-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right lateral occipital artery | FJ1687-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right medial frontobasal artery | FJ1690-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right medial occipital artery | FJ1691-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right ophthalmic artery | FJ1695-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right pericallosal artery | FJ1699-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right polar temporal artery | FJ1712-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior inferior cerebellar artery | FJ1700-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior inferior cerebellar artery | FJ1701-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior inferior cerebellar artery | FJ1702-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior inferior cerebellar artery | FJ1703-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior inferior cerebellar artery | FJ1704-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior inferior cerebellar artery | FJ1705-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior inferior cerebellar artery | FJ1706-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior inferior cerebellar artery | FJ1707-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior inferior cerebellar artery | FJ1708-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior inferior cerebellar artery | FJ1709-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior inferior cerebellar artery | FJ1710-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior inferior cerebellar artery | FJ1711-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior inferior cerebellar artery | FJ1715-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior medial choroidal artery | FJ1727-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right posterior parietal artery | FJ1716-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Right prefrontal artery | FJ1724-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right superficial cervical artery | FJ2308-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right thalamogeniculate artery | FJ1675-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Right thalamoperforating artery | FJ1720-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right vertebral artery | FJ1725-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| set of posterior temporal branches of lateral occipital artery | FJ1719-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Set of posterior temporal branches of lateral occipital artery | FJ1719M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Sphenoid part of left middle cerebral artery | FJ1692M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Sphenoid part of right middle cerebral artery | FJ1692-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Superior vermian branch of medial branch of left superior cerebellar artery | FJ1728M-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Superior vermian branch of medial branch of right superior cerebellar artery | FJ1728-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Temporo-occipital branch of left middle cerebral artery | FJ1729M-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Temporo-occipital branch of right middle cerebral artery | FJ1729-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |

## 腹腔

### 示意血管／神經（PK 與神經串流）（2）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| Left paraumbilical veins | PK-65 | 多段（名稱為複數、叢或多節段，可能是設計，待確認） | 5 段 |
| Right paraumbilical veins | PK-60 | 多段（名稱為複數、叢或多節段，可能是設計，待確認） | 5 段 |

### 血管末端片（78）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| Anterior cecal artery | FJ3406-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior division of left renal artery | FJ3461-END | 單獨點選 | 末端片 1 段；與主血管合併後 3 段 |
| Anterior division of left renal artery | FJ3463-END | 單獨點選 | 末端片 1 段；與主血管合併後 2 段 |
| Anterior division of right renal artery | FJ3558-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior division of right renal artery | FJ3559-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior division of right renal artery | FJ3563-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior inferior pancreaticoduodenal artery | FJ3401-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Appendicular artery | FJ3410-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Ascending branch of inferior branch of ileocolic artery | FJ3414-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Ascending branch of left colic artery | FJ3399-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Ascending lumbar vein | FJ3658-END | 單獨點選 | 末端片 1 段；與主血管合併後 3 段 |
| Descending branch of left colic artery | FJ3428-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Ileal vein | FJ3438-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Ileocolic artery | FJ3439-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Ileocolic vein | FJ3415-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Ileocolic vein | FJ3440-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Inferior mesenteric artery | FJ3442-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Inferior mesenteric vein | FJ3443-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Inferior segmental branch of left renal artery | FJ2049-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Inferior segmental branch of right renal artery | FJ2043-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Inferior vena cava | FJ3659-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left ascending lumbar vein | FJ3493-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left colic vein | FJ3400-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left external iliac artery | FJ3466-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left external iliac vein | FJ3484-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left iliolumbar vein | FJ3510-END | 斷開成多段 | 末端片 10 段；與主血管合併後 1 段 |
| Left inferior epigastric artery | FJ3511-END | 斷開成多段 | 末端片 11 段；與主血管合併後 1 段 |
| Left inferior epigastric vein | FJ3512-END | 斷開成多段 | 末端片 12 段；與主血管合併後 1 段 |
| Left internal iliac artery | FJ3468-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left internal iliac vein | FJ3470-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left internal iliac vein | FJ3471-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left lateral sacral vein | FJ3526-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left renal vein | FJ3477-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left renal vein | FJ3478-END | 斷開成多段 | 末端片 7 段；與主血管合併後 1 段 |
| Left superficial epigastric artery | FJ3529-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Left testicular artery | FJ3532-END | 斷開成多段 | 末端片 15 段；與主血管合併後 1 段 |
| Left testicular vein | FJ3533-END | 斷開成多段 | 末端片 20 段；與主血管合併後 1 段 |
| Lumbar artery | FJ3632-END | 斷開成多段 | 末端片 8 段；與主血管合併後 4 段 |
| Lumbar artery | FJ3636-END | 斷開成多段 | 末端片 5 段；與主血管合併後 4 段 |
| Lumbar vein | FJ3631-END | 斷開成多段 | 末端片 5 段；與主血管合併後 4 段 |
| Lumbar vein | FJ3635-END | 斷開成多段 | 末端片 5 段；與主血管合併後 4 段 |
| Median sacral vein | FJ3541-END | 斷開成多段 | 末端片 11 段；與主血管合併後 1 段 |
| Middle colic artery | FJ3542-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Middle colic vein | FJ3543-END | 斷開成多段 | 末端片 11 段；與主血管合併後 1 段 |
| Posterior cecal artery | FJ3553-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior division of left renal artery | FJ3474-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior division of right renal artery | FJ3574-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior division of right renal artery | FJ3575-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior segmental branch of left renal artery | FJ2054-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Posterior segmental branch of right renal artery | FJ2045-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Right anterior segmental artery | FJ2041-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right anterior segmental artery | FJ2044-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right ascending lumbar vein | FJ3589-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Right colic artery | FJ3590-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Right colic vein | FJ3591-END | 斷開成多段 | 末端片 10 段；與主血管合併後 1 段 |
| Right external iliac vein | FJ3568-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Right gastroepiploic vein | FJ3597-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right iliolumbar vein | FJ3603-END | 斷開成多段 | 末端片 10 段；與主血管合併後 1 段 |
| Right inferior epigastric artery | FJ3604-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Right inferior epigastric vein | FJ3605-END | 斷開成多段 | 末端片 10 段；與主血管合併後 1 段 |
| Right internal iliac artery | FJ3569-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right internal iliac vein | FJ3571-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right internal iliac vein | FJ3572-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right internal iliac vein | FJ3607-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right lateral sacral vein | FJ3611-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right renal vein | FJ3577-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right renal vein | FJ3578-END | 斷開成多段 | 末端片 7 段；與主血管合併後 1 段 |
| Right superficial epigastric artery | FJ3614-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Right testicular artery | FJ3617-END | 斷開成多段 | 末端片 21 段；與主血管合併後 1 段 |
| Right testicular vein | FJ3618-END | 斷開成多段 | 末端片 21 段；與主血管合併後 1 段 |
| Sigmoid artery | FJ3638-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Sigmoid vein | FJ3639-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Superior mesenteric vein | FJ3647-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Superior rectal artery | FJ3656-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Superior rectal vein | FJ3657-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Ureteric segment of left renal artery | FJ3481-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Ureteric segment of right renal artery | FJ3581-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Ureteric segment of right renal artery | FJ3582-END | 單獨點選 | 末端片 1 段；與主血管合併後 2 段 |

## 骨盆與會陰

### 骨性標誌（4）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| Left ischial tuberosity | PK-161 | 靜止時離開骨面 | 最遠 6.9 mm（Left hip bone） |
| Left spine of ischium | PK-162 | 靜止時離開骨面 | 最遠 19.1 mm（Left hip bone） |
| Right ischial tuberosity | PK-145 | 靜止時離開骨面 | 最遠 8.7 mm（Right hip bone） |
| Right spine of ischium | PK-146 | 靜止時離開骨面 | 最遠 12.0 mm（Right hip bone） |
| Right spine of ischium | PK-146 | 包圍盒超出所屬骨骼 | Right hip bone |

### 血管末端片（10）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| Deep dorsal vein of penis | FJ2056-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Left dorsal artery of penis | FJ3496-END | 斷開成多段 | 末端片 12 段；與主血管合併後 1 段 |
| Left dorsal artery of penis | FJ3497-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left internal pudendal vein | FJ3525-END | 斷開成多段 | 末端片 9 段；與主血管合併後 1 段 |
| Left superficial dorsal vein of penis | FJ3426-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right dorsal artery of penis | FJ3592-END | 斷開成多段 | 末端片 14 段；與主血管合併後 1 段 |
| Right dorsal artery of penis | FJ3593-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right internal pudendal vein | FJ3610-END | 斷開成多段 | 末端片 10 段；與主血管合併後 1 段 |
| Right superficial dorsal vein of penis | FJ3637-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Superficial dorsal vein of penis | FJ2208-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |

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

### 血管末端片（407）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| Accessory hemiazygos vein | FJ1981-END | 斷開成多段 | 末端片 15 段；與主血管合併後 1 段 |
| Accessory subsuperior branch of right posterior basal segmental artery | FJ3009-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Accessory subsuperior branch of right posterior basal segmental artery | FJ3010-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior branch of lateral segmental artery | FJ2982-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Anterior branch of lateral segmental artery | FJ2985-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Anterior branch of right anterior segmental artery | FJ2975-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Anterior branch of right anterior segmental artery | FJ2976-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior branch of right anterior segmental artery | FJ2977-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Anterior branch of right anterior segmental artery | FJ2979-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior cardiac vein | FJ2725-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior cardiac vein | FJ2730-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior division of left renal artery | FJ3462-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior inferior segmental tributary of middle hepatic vein | FJ3083-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Anterior inferior segmental tributary of middle hepatic vein | FJ3086-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Anterior interventricular vein | FJ2658-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior interventricular vein | FJ2659-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior interventricular vein | FJ2660-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior interventricular vein | FJ2661-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior interventricular vein | FJ2663-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior interventricular vein | FJ2664-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior interventricular vein | FJ2665-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Anterior part of lateral segmental vein | FJ3034-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Anterior part of lateral segmental vein | FJ3035-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior part of lateral segmental vein | FJ3036-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior part of right apical segmental artery | FJ2978-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Anterior part of right apical segmental artery | FJ2989-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior part of right apical segmental artery | FJ3000-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior part of right apical segmental artery | FJ3011-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior part of right apical segmental vein | FJ3042-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Anterior part of right apical segmental vein | FJ3053-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Anterior superior pancreaticoduodenal artery | FJ3409-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Anterior superior segmental branch of right portal vein | FJ3073-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Anterior superior segmental hepatic artery | FJ3076-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Anterior superior segmental tributary of right hepatic vein | FJ3121-END | 斷開成多段 | 末端片 3 段；與主血管合併後 4 段 |
| Apical part of right apical segmental artery | FJ2967-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Apical part of right apical segmental artery | FJ3015-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Apical part of right apical segmental artery | FJ3016-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Apical part of right apical segmental artery | FJ3017-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Apical part of right apical segmental vein | FJ3064-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Apical part of right apical segmental vein | FJ3067-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Apical part of right apical segmental vein | FJ3068-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Apical part of right posterior segmental artery | FJ2969-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Apical part of right posterior segmental artery | FJ3018-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Azygos vein | FJ3416-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Basal branch of right anterior basal segmental artery | FJ3002-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Basal branch of right anterior basal segmental artery | FJ3003-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Bronchial artery | FJ1933-END | 斷開成多段 | 末端片 3 段；與主血管合併後 2 段 |
| Bronchial branch of arch of aorta | FJ3418-END | 斷開成多段 | 末端片 2 段；與主血管合併後 2 段 |
| Caudal pancreatic artery | FJ3419-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Caudate lobe branch of left hepatic artery | FJ3077-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Caudate lobe branch of left portal vein | FJ3124-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Circumflex branch of left coronary artery | FJ2649-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Circumflex branch of left coronary artery | FJ2650-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Circumflex branch of left coronary artery | FJ2651-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Circumflex branch of left coronary artery | FJ2652-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Circumflex branch of left coronary artery | FJ2653-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Circumflex branch of left coronary artery | FJ2654-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Common hepatic artery | FJ3078-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Conus branch of anterior interventricular branch of left coronary artery | FJ2643-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Conus branch of anterior interventricular branch of left coronary artery | FJ2644-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Descending thoracic aorta | FJ1931-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Diagonal branch of anterior descending branch of left coronary artery | FJ2633-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Diagonal branch of anterior descending branch of left coronary artery | FJ2634-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Diagonal branch of anterior descending branch of left coronary artery | FJ2636-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Diagonal branch of anterior descending branch of left coronary artery | FJ2638-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Diagonal branch of anterior descending branch of left coronary artery | FJ2639-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Diagonal branch of anterior descending branch of left coronary artery | FJ2640-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Diagonal branch of anterior descending branch of left coronary artery | FJ2642-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Diagonal branch of anterior descending branch of left coronary artery | FJ2648-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Esophageal artery | FJ1934-END | 單獨點選 | 末端片 1 段；與主血管合併後 3 段 |
| First anterior ventricular branch of right coronary artery | FJ2671-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| First anterior ventricular branch of right coronary artery | FJ2673-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| First anterior ventricular branch of right coronary artery | FJ2677-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| First posterior ventricular branch of right coronary artery | FJ2715-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| First posterior ventricular branch of right coronary artery | FJ2716-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| First posterior ventricular branch of right coronary artery | FJ2717-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| First posterior ventricular branch of right coronary artery | FJ2718-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| First posterior ventricular branch of right coronary artery | FJ2719-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| First posterior ventricular branch of right coronary artery | FJ2720-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| First posterior ventricular branch of right coronary artery | FJ2721-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| First posterior ventricular branch of right coronary artery | FJ2722-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| First right anterior branch of anterior interventricular branch of left coronary artery | FJ2632-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| First right anterior branch of anterior interventricular branch of left coronary artery | FJ2645-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| First septal branch of right posterior interventricular artery | FJ2735-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Great cardiac vein | FJ2656-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Hemiazygos vein | FJ3434-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Hepatic artery proper | FJ3081-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Hepatovenous segment II | FJ2818-END | 斷開成多段 | 末端片 7 段；與主血管合併後 1 段 |
| Hepatovenous segment III | FJ2819-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Hepatovenous segment IV | FJ2820-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Hepatovenous segment V | FJ2821-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Hepatovenous segment VI | FJ2822-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Hepatovenous segment VIII | FJ2824-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Inferior branch of medial segmental artery | FJ2987-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Inferior branch of medial segmental artery | FJ2988-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Inferior lingular artery | FJ2896-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Inferior lingular artery | FJ2897-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Inferior lingular vein | FJ2934-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Inferior lingular vein | FJ2935-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Inferior pancreatic artery | FJ3444-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Inferior part of medial segmental vein | FJ3032-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Inferior part of medial segmental vein | FJ3033-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Inferior part of right anterior segmental vein | FJ3021-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Inferior phrenic vein | FJ3447-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Inferior phrenic vein | FJ3448-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Inferior phrenic vein | FJ3449-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Inferior phrenic vein | FJ3450-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Inferior phrenic vein | FJ3451-END | 單獨點選 | 末端片 1 段；與主血管合併後 2 段 |
| Inferior phrenic vein | FJ3452-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Inferior vena cava | FJ3441-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Lateral branch of right anterior basal segmental artery | FJ3001-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Lateral branch of right lateral basal segmental artery | FJ3004-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Lateral branch of right lateral basal segmental artery | FJ3005-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Lateral branch of right lateral basal segmental artery | FJ3006-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Lateral branch of right lateral basal segmental artery | FJ3007-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Lateral branch of right superior segmental artery | FJ2991-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Lateral branch of right superior segmental artery | FJ2992-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Lateral branch of right superior segmental artery | FJ2993-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Lateral inferior segmental branch of left portal vein | FJ3125-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Lateral inferior segmental hepatic artery | FJ3092-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Lateral inferior segmental tributary of left hepatic vein | FJ3097-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Lateral inferior segmental tributary of left hepatic vein | FJ3099-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Lateral inferior segmental tributary of left hepatic vein | FJ3100-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Lateral superior segmental branch of left portal vein | FJ3126-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Lateral superior segmental hepatic artery | FJ3091-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Lateral superior segmental hepatic artery | FJ3093-END | 單獨點選 | 末端片 1 段；與主血管合併後 2 段 |
| Laterobasal branch of right posterior basal segmental artery | FJ3013-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Laterobasal branch of right posterior basal segmental artery | FJ3014-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left anterior basal segmental artery | FJ2883-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left anterior basal segmental artery | FJ2886-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left anterior basal segmental artery | FJ2887-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left anterior basal segmental vein | FJ2956-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left anterior basal segmental vein | FJ2959-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left anterior basal segmental vein | FJ2960-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left anterior segmental artery | FJ2902-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Left anterior segmental artery | FJ2904-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left anterior segmental artery | FJ2905-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left anterior segmental artery | FJ2906-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left anterior segmental artery | FJ2907-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left anterior segmental artery | FJ2908-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left anterior segmental artery | FJ2909-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left anterior segmental artery | FJ2910-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left anterior segmental vein | FJ2930-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left anterior segmental vein | FJ2931-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left anterior segmental vein | FJ2932-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left apical segmental artery | FJ2915-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left apical segmental artery | FJ2916-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left apical segmental artery | FJ2917-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left apical segmental artery | FJ2918-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left apical segmental vein | FJ2936-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left apical segmental vein | FJ2947-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left apical segmental vein | FJ2958-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left apical segmental vein | FJ2961-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left apical segmental vein | FJ2962-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left apical segmental vein | FJ2963-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left apical segmental vein | FJ2964-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left brachiocephalic vein | FJ3482-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left first posterior intercostal artery | FJ1973-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Left gastric artery | FJ3499-END | 斷開成多段 | 末端片 7 段；與主血管合併後 1 段 |
| Left gastric vein | FJ3500-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left gastro-epiploic artery | FJ3501-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Left gastroepiploic vein | FJ3502-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left hepatic vein | FJ2415-END | 斷開成多段 | 末端片 7 段；與主血管合併後 1 段 |
| Left inferior phrenic artery | FJ3514-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Left inferior phrenic artery | FJ3515-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Left inferior phrenic artery | FJ3516-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left inferior phrenic artery | FJ3517-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Left inferior phrenic artery | FJ3518-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left inferior phrenic artery | FJ3519-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left inferior phrenic artery | FJ3520-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left inferior pulmonary vein | FJ2944-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left inferior pulmonary vein | FJ2950-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left inferior pulmonary vein | FJ2955-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left inferior suprarenal artery | FJ3467-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left internal thoracic artery | FJ1972-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Left lateral basal segmental artery | FJ2921-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left lateral basal segmental artery | FJ2922-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left lateral basal segmental artery | FJ2923-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left lateral basal segmental vein | FJ2951-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left lateral basal segmental vein | FJ2952-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left lateral basal segmental vein | FJ2953-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left lateral basal segmental vein | FJ2954-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left lateral thoracic artery | FJ1976-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Left lateral thoracic vein | FJ2233-END | 斷開成多段 | 末端片 10 段；與主血管合併後 1 段 |
| Left lobe branch of left hepatic artery | FJ1874-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left marginal vein | FJ2703-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left marginal vein | FJ2705-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left medial basal segmental artery | FJ2884-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left medial basal segmental artery | FJ2885-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left middle suprarenal artery | FJ3472-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Left musculophrenic artery | FJ1979-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Left musculophrenic vein | FJ1988-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Left portal vein | FJ2404-END | 斷開成多段 | 末端片 22 段；與主血管合併後 1 段 |
| Left posterior basal segmental artery | FJ2881-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left posterior basal segmental artery | FJ2892-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior basal segmental artery | FJ2903-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left posterior basal segmental artery | FJ2914-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior basal segmental artery | FJ2919-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left posterior basal segmental artery | FJ2920-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left posterior basal segmental vein | FJ2945-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left posterior basal segmental vein | FJ2946-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior basal segmental vein | FJ2948-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior basal segmental vein | FJ2949-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left posterior segmental artery | FJ2911-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Left posterior segmental artery | FJ2912-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior segmental artery | FJ2913-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior segmental vein | FJ2926-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left posterior segmental vein | FJ2927-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left posterior segmental vein | FJ2928-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left posterior segmental vein | FJ2929-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior segmental vein | FJ2939-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left posterior segmental vein | FJ2940-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior segmental vein | FJ2941-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior segmental vein | FJ2942-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left posterior segmental vein | FJ2943-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left pulmonary artery | FJ2924-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left second posterior intercostal artery | FJ1974-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Left subclavian artery | FJ3479-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left subclavian vein | FJ3486-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left subcostal artery | FJ1977-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left subcostal vein | FJ1987-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Left superior epigastric artery | FJ1971-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left superior intercostal vein | FJ1986-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left superior pulmonary vein | FJ2925-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left superior pulmonary vein | FJ2933-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left superior segmental artery | FJ2888-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left superior segmental artery | FJ2889-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left superior segmental artery | FJ2890-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left superior segmental artery | FJ2891-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left superior segmental artery | FJ2893-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left superior segmental artery | FJ2894-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left superior segmental artery | FJ2895-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left suprarenal vein | FJ3480-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left thoracodorsal artery | FJ2253-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Left thoracodorsal vein | FJ2254-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Marginal branch of right coronary artery | FJ2667-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Marginal branch of right coronary artery | FJ2668-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Marginal branch of right coronary artery | FJ2672-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Marginal branch of right coronary artery | FJ2674-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Marginal branch of right coronary artery | FJ2675-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Medial branch of right superior segmental artery | FJ2994-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Medial branch of right superior segmental artery | FJ2995-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Medial branch of right superior segmental artery | FJ2996-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Medial inferior segmental branch of left portal vein | FJ3128-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Medial inferior segmental hepatic artery | FJ3106-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Medial inferior segmental tributary of middle hepatic vein | FJ3084-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Medial inferior segmental tributary of middle hepatic vein | FJ3085-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Medial superior segmental hepatic artery | FJ3107-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Medial superior segmental tributary of left hepatic vein | FJ3101-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Mediobasal branch of right posterior basal segmental artery | FJ3008-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Mediobasal branch of right posterior basal segmental artery | FJ3012-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Middle cardiac vein | FJ2678-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Middle cardiac vein | FJ2679-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Middle cardiac vein | FJ2682-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Middle cardiac vein | FJ2683-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Middle cardiac vein | FJ2685-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Middle cardiac vein | FJ2687-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Middle cardiac vein | FJ2688-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Middle cardiac vein | FJ2689-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Middle cardiac vein | FJ2691-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Middle hepatic vein | FJ2414-END | 斷開成多段 | 末端片 14 段；與主血管合併後 1 段 |
| Posterior branch of lateral segmental artery | FJ2983-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Posterior branch of lateral segmental artery | FJ2984-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior branch of right anterior segmental artery | FJ2974-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Posterior branch of right anterior segmental artery | FJ2980-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Posterior branch of right anterior segmental artery | FJ2981-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior inferior segmental branch of right portal vein | FJ3111-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Posterior inferior segmental hepatic artery | FJ3114-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Posterior inferior segmental tributary of right hepatic vein | FJ3118-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Posterior inferior segmental tributary of right hepatic vein | FJ3120-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Posterior intercostal arteries | FJ1961-END | 斷開成多段 | 末端片 16 段；與主血管合併後 9 段 |
| Posterior intercostal arteries | FJ1975-END | 斷開成多段 | 末端片 14 段；與主血管合併後 9 段 |
| Posterior interventricular branch of right coronary artery | FJ2693-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior interventricular branch of right coronary artery | FJ2694-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior interventricular branch of right coronary artery | FJ2695-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior interventricular branch of right coronary artery | FJ2696-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior interventricular branch of right coronary artery | FJ2697-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior interventricular branch of right coronary artery | FJ2698-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior part of lateral segmental vein | FJ3037-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Posterior part of lateral segmental vein | FJ3038-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Posterior part of lateral segmental vein | FJ3039-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior part of right posterior segmental artery | FJ2970-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Posterior part of right posterior segmental artery | FJ2971-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior part of right posterior segmental artery | FJ2972-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior segmental branch of left renal artery | FJ2053-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Posterior superior segmental hepatic artery | FJ3115-END | 單獨點選 | 末端片 1 段；與主血管合併後 4 段 |
| Posterior superior segmental tributary of right hepatic vein | FJ3119-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Posterior vein of left ventricle | FJ2702-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior vein of left ventricle | FJ2706-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior vein of left ventricle | FJ2707-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior vein of left ventricle | FJ2708-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior vein of left ventricle | FJ2710-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior vein of left ventricle | FJ2711-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior vein of left ventricle | FJ2712-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Posterior vein of left ventricle | FJ2713-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Pulmonary trunk | FJ2966-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right anterior basal segmental vein | FJ3049-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right anterior basal segmental vein | FJ3056-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right anterior segmental vein | FJ3028-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right anterior segmental vein | FJ3029-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right brachiocephalic vein | FJ3583-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right conus artery | FJ2670-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right conus artery | FJ2676-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right first posterior intercostal artery | FJ1939-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Right gastric artery | FJ3594-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right gastric vein | FJ3595-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right gastro-epiploic artery | FJ3596-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Right hepatic vein | FJ2416-END | 斷開成多段 | 末端片 14 段；與主血管合併後 1 段 |
| Right inferior phrenic artery | FJ3619-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Right inferior phrenic artery | FJ3620-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right inferior phrenic artery | FJ3621-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right inferior phrenic artery | FJ3622-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right inferior phrenic artery | FJ3623-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right inferior phrenic artery | FJ3624-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right inferior phrenic artery | FJ3626-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right inferior suprarenal artery | FJ3584-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Right internal thoracic artery | FJ1937-END | 斷開成多段 | 末端片 9 段；與主血管合併後 1 段 |
| Right internal thoracic vein | FJ1993-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Right lateral basal segmental vein | FJ3059-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right lateral basal segmental vein | FJ3060-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right lateral basal segmental vein | FJ3061-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right lateral basal segmental vein | FJ3062-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right lateral thoracic artery | FJ1938-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Right lateral thoracic vein | FJ2285-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Right marginal vein | FJ2727-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right marginal vein | FJ2728-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right marginal vein | FJ2729-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right medial basal segmental vein | FJ3054-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right medial basal segmental vein | FJ3055-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right middle suprarenal artery | FJ3586-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Right musculophrenic artery | FJ1969-END | 斷開成多段 | 末端片 9 段；與主血管合併後 1 段 |
| Right musculophrenic vein | FJ1996-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Right posterior basal segmental vein | FJ3041-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right posterior basal segmental vein | FJ3043-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right posterior basal segmental vein | FJ3044-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right posterior basal segmental vein | FJ3045-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right posterior basal segmental vein | FJ3046-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior basal segmental vein | FJ3047-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right posterior basal segmental vein | FJ3048-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior basal segmental vein | FJ3057-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior basal segmental vein | FJ3058-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right posterior segmental vein | FJ3022-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right posterior segmental vein | FJ3023-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior segmental vein | FJ3024-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior segmental vein | FJ3025-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior segmental vein | FJ3026-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right posterior segmental vein | FJ3069-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right posterior segmental vein | FJ3070-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right pulmonary artery | FJ3019-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right second posterior intercostal artery | FJ1950-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Right subclavian vein | FJ3587-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right subcostal artery | FJ1967-END | 斷開成多段 | 末端片 10 段；與主血管合併後 1 段 |
| Right subcostal vein | FJ1995-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Right superior epigastric artery | FJ1936-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Right superior intercostal vein | FJ1991-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right superior segmental vein | FJ3050-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right superior segmental vein | FJ3051-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right superior segmental vein | FJ3052-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right superior segmental vein | FJ3063-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right superior segmental vein | FJ3065-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right superior segmental vein | FJ3066-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right suprarenal vein | FJ3580-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right thoracodorsal artery | FJ2305-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Right thoracodorsal vein | FJ2306-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Right upper lobar artery | FJ2973-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Second right anterior branch of anterior interventricular branch of left coronary artery | FJ2646-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Second septal branch of right posterior interventricular artery | FJ2736-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Septal branch of anterior interventricular artery | FJ2732-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Septal branch of anterior interventricular artery | FJ2733-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Septal branch of anterior interventricular artery | FJ2734-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Set of anterior intercostal veins | FJ1985-END | 斷開成多段 | 末端片 13 段；與主血管合併後 10 段 |
| Set of anterior intercostal veins | FJ1994-END | 斷開成多段 | 末端片 14 段；與主血管合併後 10 段 |
| Set of oesophageal branches of thoracic aorta | FJ3431-END | 單獨點選 | 末端片 1 段；與主血管合併後 3 段 |
| Small cardiac vein | FJ2724-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Splenic artery | FJ2562-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Splenic artery | FJ3420-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Splenic artery | FJ3544-END | 單獨點選 | 末端片 1 段；與主血管合併後 4 段 |
| Splenic artery | FJ3640-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Splenic vein | FJ3641-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Superior branch of medial segmental artery | FJ2990-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Superior branch of right superior segmental artery | FJ2997-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Superior branch of right superior segmental artery | FJ2998-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Superior branch of right superior segmental artery | FJ2999-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Superior lingular artery | FJ2898-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Superior lingular artery | FJ2899-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Superior lingular artery | FJ2900-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Superior lingular artery | FJ2901-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Superior lingular vein | FJ2937-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Superior lingular vein | FJ2938-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Superior part of medial segmental vein | FJ3030-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Superior part of right anterior segmental vein | FJ3027-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Superior phrenic vein | FJ3648-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Superior phrenic vein | FJ3649-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Superior phrenic vein | FJ3650-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Superior phrenic vein | FJ3651-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Superior phrenic vein | FJ3652-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Superior phrenic vein | FJ3653-END | 單獨點選 | 末端片 1 段；與主血管合併後 3 段 |
| Superior segmental branch of left renal artery | FJ2052-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Superior segmental branch of right renal artery | FJ2042-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Superior vena cava | FJ3645-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Third right anterior branch of anterior interventricular branch of left coronary artery | FJ2641-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Third right anterior branch of anterior interventricular branch of left coronary artery | FJ2647-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Tributary of middle hepatic vein | FJ1867-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Trunk of anterior interventricular branch of left coronary artery | FJ2631-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Trunk of left portal vein | FJ3102-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Trunk of right apical segmental vein | FJ3031-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Trunk of right coronary artery | FJ2723-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |

## 上肢

### 骨性標誌（20）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| Left coracoid process | PK-154 | 關節動作時離開骨面 | 肩外展 90° 43 mm；肩屈曲 90° 39 mm；肩外展 180°（極限） 54 mm；肩屈曲 180°（極限） 46 mm |
| Left greater tubercle of humerus | PK-148 | 關節動作時離開骨面 | 屈肘 90° 257 mm；屈肘 140°（極限） 265 mm |
| Left infraglenoid tubercle | PK-156 | 關節動作時離開骨面 | 肩外展 90° 30 mm；肩屈曲 90° 24 mm；肩外展 180°（極限） 71 mm；肩屈曲 180°（極限） 50 mm |
| Left infraspinous fossa | PK-157 | 尺寸過大 | 最長邊為骨骼的 62% |
| Left infraspinous fossa | PK-157 | 關節動作時離開骨面 | 肩外展 90° 67 mm；肩屈曲 90° 63 mm；肩外展 180°（極限） 101 mm；肩屈曲 180°（極限） 82 mm |
| Left intertubercular groove | PK-150 | 關節動作時離開骨面 | 屈肘 90° 228 mm；屈肘 140°（極限） 235 mm |
| Left lesser tubercle of humerus | PK-149 | 關節動作時離開骨面 | 屈肘 90° 250 mm；屈肘 140°（極限） 255 mm |
| Left medial epicondyle of humerus | PK-153 | 關節動作時離開骨面 | 屈肘 90° 17 mm；屈肘 140°（極限） 19 mm |
| Left radial groove | PK-152 | 關節動作時離開骨面 | 屈肘 90° 93 mm；屈肘 140°（極限） 101 mm |
| Left suprascapular notch | PK-155 | 關節動作時離開骨面 | 肩外展 90° 24 mm；肩屈曲 90° 24 mm；肩外展 180°（極限） 30 mm；肩屈曲 180°（極限） 30 mm |
| Left surgical neck of humerus | PK-151 | 關節動作時離開骨面 | 屈肘 90° 199 mm；屈肘 140°（極限） 205 mm |
| Right coracoid process | PK-138 | 關節動作時離開骨面 | 肩外展 90° 43 mm；肩屈曲 90° 39 mm；肩外展 180°（極限） 54 mm；肩屈曲 180°（極限） 46 mm |
| Right greater tubercle of humerus | PK-132 | 關節動作時離開骨面 | 屈肘 90° 256 mm；屈肘 140°（極限） 265 mm |
| Right infraglenoid tubercle | PK-140 | 關節動作時離開骨面 | 肩外展 90° 32 mm；肩屈曲 90° 26 mm；肩外展 180°（極限） 73 mm；肩屈曲 180°（極限） 53 mm |
| Right infraspinous fossa | PK-141 | 尺寸過大 | 最長邊為骨骼的 62% |
| Right infraspinous fossa | PK-141 | 關節動作時離開骨面 | 肩外展 90° 66 mm；肩屈曲 90° 63 mm；肩外展 180°（極限） 100 mm；肩屈曲 180°（極限） 81 mm |
| Right intertubercular groove | PK-134 | 關節動作時離開骨面 | 屈肘 90° 226 mm；屈肘 140°（極限） 234 mm |
| Right lesser tubercle of humerus | PK-133 | 關節動作時離開骨面 | 屈肘 90° 246 mm；屈肘 140°（極限） 252 mm |
| Right medial epicondyle of humerus | PK-137 | 關節動作時離開骨面 | 屈肘 90° 16 mm；屈肘 140°（極限） 19 mm |
| Right radial groove | PK-136 | 關節動作時離開骨面 | 屈肘 90° 95 mm；屈肘 140°（極限） 103 mm |
| Right suprascapular notch | PK-139 | 關節動作時離開骨面 | 肩外展 90° 24 mm；肩屈曲 90° 24 mm；肩外展 180°（極限） 30 mm；肩屈曲 180°（極限） 29 mm |
| Right surgical neck of humerus | PK-135 | 關節動作時離開骨面 | 屈肘 90° 199 mm；屈肘 140°（極限） 205 mm |

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

### 血管末端片（116）

| 結構 | 編號 | 問題 | 細節 |
| --- | --- | --- | --- |
| Descending branch of left lateral circumflex femoral artery | FJ2063-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Descending branch of right lateral circumflex femoral artery | FJ2057-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Distal perforating artery | FJ2064-END | 單獨點選 | 末端片 1 段；與主血管合併後 4 段 |
| Dorsal digital artery of foot | FJ2072-END | 斷開成多段 | 末端片 3 段；與主血管合併後 5 段 |
| Dorsal digital artery of foot | FJ2141-END | 斷開成多段 | 末端片 2 段；與主血管合併後 5 段 |
| Dorsal venous arch of left foot | FJ2059-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Dorsal venous arch of right foot | FJ2061-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left anterior tibial artery | FJ2065-END | 斷開成多段 | 末端片 12 段；與主血管合併後 1 段 |
| Left anterior tibial recurrent artery | FJ2066-END | 斷開成多段 | 末端片 14 段；與主血管合併後 1 段 |
| Left anterior tibial vein | FJ2097-END | 斷開成多段 | 末端片 7 段；與主血管合併後 1 段 |
| Left anterior tibial vein | FJ2183-END | 斷開成多段 | 末端片 13 段；與主血管合併後 1 段 |
| Left arcuate artery | FJ2067-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left ascending and transverse branches of lateral circumflex femoral artery | FJ2091-END | 斷開成多段 | 末端片 7 段；與主血管合併後 1 段 |
| Left deep femoral artery | PK-93-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Left deep femoral vein | FJ2099-END | 斷開成多段 | 末端片 9 段；與主血管合併後 1 段 |
| Left descending genicular artery | FJ2069-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Left dorsal metatarsal vein | FJ2186-END | 斷開成多段 | 末端片 2 段；與主血管合併後 5 段 |
| Left dorsalis pedis artery | FJ2073-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left femoral artery | PKC-317-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left fibular artery | FJ2093-END | 斷開成多段 | 末端片 13 段；與主血管合併後 1 段 |
| Left fibular vein | FJ2184-END | 單獨點選 | 末端片 1 段；與主血管合併後 2 段 |
| Left fibular vein | FJ2187-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Left fibular vein | FJ2190-END | 單獨點選 | 末端片 1 段；與主血管合併後 4 段 |
| Left genicular vein | FJ2107-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left genicular vein | FJ2108-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Left genicular vein | FJ2124-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left genicular vein | FJ2125-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left great saphenous vein | FJ2103-END | 斷開成多段 | 末端片 20 段；與主血管合併後 1 段 |
| Left inferior gluteal vein | FJ3513-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Left inferior lateral genicular artery | FJ2076-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left inferior medial genicular artery | FJ2077-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left lateral circumflex femoral artery | FJ2078-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left lateral circumflex femoral vein | FJ2188-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Left lateral plantar artery | FJ2079-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left lateral plantar vein | PK-107-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left lateral superior genicular artery | FJ2080-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left lateral tarsal artery | FJ2081-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left medial circumflex femoral artery | PK-95-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left medial circumflex femoral vein | FJ2189-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left medial plantar artery | FJ2082-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Left medial superior genicular artery | FJ2083-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left middle genicular artery | FJ2084-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Left obturator vein | FJ3527-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Left plantar arch | FJ2085-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Left popliteal artery | FJ2086-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Left popliteal vein | FJ2117-END | 斷開成多段 | 末端片 6 段；與主血管合併後 1 段 |
| Left posterior tibial artery | FJ2087-END | 斷開成多段 | 末端片 13 段；與主血管合併後 1 段 |
| Left posterior tibial vein | FJ2118-END | 斷開成多段 | 末端片 14 段；與主血管合併後 1 段 |
| Left small saphenous vein | FJ2121-END | 斷開成多段 | 末端片 10 段；與主血管合併後 1 段 |
| Left superficial medial plantar artery | FJ2089-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Left superior gluteal artery | PK-108-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Left superior gluteal vein | FJ3531-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Plantar metatarsal artery | FJ2096-END | 單獨點選 | 末端片 1 段；與主血管合併後 4 段 |
| Plantar metatarsal artery | FJ2206-END | 單獨點選 | 末端片 1 段；與主血管合併後 3 段 |
| Plantar metatarsal vein | FJ2207-END | 斷開成多段 | 末端片 2 段；與主血管合併後 4 段 |
| Plantar venous arch of left foot | FJ2128-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Plantar venous arch of right foot | FJ2129-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Right anterior tibial artery | FJ2130-END | 斷開成多段 | 末端片 12 段；與主血管合併後 1 段 |
| Right anterior tibial recurrent artery | FJ2131-END | 斷開成多段 | 末端片 10 段；與主血管合併後 1 段 |
| Right anterior tibial vein | FJ2132-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Right anterior tibial vein | FJ2193-END | 斷開成多段 | 末端片 15 段；與主血管合併後 1 段 |
| Right arcuate artery | FJ2133-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right ascending and transverse branches of lateral circumflex femoral artery | FJ2195-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Right deep femoral artery | PK-66-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Right deep femoral vein | FJ2135-END | 斷開成多段 | 末端片 10 段；與主血管合併後 1 段 |
| Right deep plantar artery | FJ2136-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right descending genicular artery | FJ2137-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Right dorsalis pedis artery | FJ2055-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right fibular artery | FJ2197-END | 斷開成多段 | 末端片 15 段；與主血管合併後 1 段 |
| Right fibular vein | FJ2194-END | 單獨點選 | 末端片 1 段；與主血管合併後 2 段 |
| Right fibular vein | FJ2200-END | 斷開成多段 | 末端片 7 段；與主血管合併後 1 段 |
| Right genicular vein | FJ2151-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Right genicular vein | FJ2153-END | 斷開成多段 | 末端片 7 段；與主血管合併後 1 段 |
| Right genicular vein | FJ2181-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Right genicular vein | FJ2182-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Right great saphenous vein | FJ2145-END | 斷開成多段 | 末端片 14 段；與主血管合併後 1 段 |
| Right inferior gluteal vein | FJ3606-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Right inferior lateral genicular artery | FJ2150-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right inferior medial genicular artery | FJ2152-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Right lateral circumflex femoral artery | FJ2158-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right lateral circumflex femoral vein | FJ2201-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Right lateral plantar artery | FJ2159-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right lateral plantar vein | PK-80-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right lateral superior genicular artery | FJ2162-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Right lateral tarsal artery | FJ2163-END | 斷開成多段 | 末端片 3 段；與主血管合併後 1 段 |
| Right medial circumflex femoral artery | PK-68-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right medial circumflex femoral vein | FJ2202-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right medial plantar artery | FJ2164-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right medial superior genicular artery | FJ2166-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Right middle genicular artery | FJ2167-END | 斷開成多段 | 末端片 4 段；與主血管合併後 2 段 |
| Right obturator vein | FJ3612-END | 斷開成多段 | 末端片 5 段；與主血管合併後 1 段 |
| Right plantar arch | FJ2169-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right popliteal artery | FJ2170-END | 斷開成多段 | 末端片 12 段；與主血管合併後 1 段 |
| Right popliteal vein | FJ2171-END | 斷開成多段 | 末端片 7 段；與主血管合併後 1 段 |
| Right posterior tibial artery | FJ2172-END | 斷開成多段 | 末端片 14 段；與主血管合併後 1 段 |
| Right posterior tibial vein | FJ2173-END | 斷開成多段 | 末端片 9 段；與主血管合併後 1 段 |
| Right small saphenous vein | FJ2176-END | 斷開成多段 | 末端片 12 段；與主血管合併後 1 段 |
| Right superficial medial plantar artery | FJ2179-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Right superior gluteal artery | PK-81-END | 單獨點選 | 末端片 1 段；與主血管合併後 1 段 |
| Right superior gluteal vein | FJ3616-END | 斷開成多段 | 末端片 4 段；與主血管合併後 1 段 |
| Set of common plantar digital arteries | FJ2092-END | 單獨點選 | 末端片 1 段；與主血管合併後 4 段 |
| Set of dorsal digital veins | FJ2185-END | 斷開成多段 | 末端片 2 段；與主血管合併後 6 段 |
| Set of perforating arteries | FJ2094-END | 斷開成多段 | 末端片 10 段；與主血管合併後 1 段 |
| Set of perforating arteries | FJ2203-END | 斷開成多段 | 末端片 8 段；與主血管合併後 1 段 |
| Set of perforating veins | FJ2119-END | 單獨點選 | 末端片 1 段；與主血管合併後 4 段 |
| Set of perforating veins | FJ2138-END | 單獨點選 | 末端片 1 段；與主血管合併後 4 段 |
| Set of perforating veins | FJ2174-END | 單獨點選 | 末端片 1 段；與主血管合併後 4 段 |
| Set of plantar digital arteries proper | FJ2095-END | 單獨點選 | 末端片 1 段；與主血管合併後 4 段 |
| Set of plantar digital arteries proper | FJ2204-END | 斷開成多段 | 末端片 2 段；與主血管合併後 4 段 |
| Set of plantar digital arteries proper | FJ2205-END | 斷開成多段 | 末端片 2 段；與主血管合併後 6 段 |
| Set of plantar digital veins | FJ2120-END | 斷開成多段 | 末端片 2 段；與主血管合併後 6 段 |
| Set of plantar digital veins | FJ2175-END | 斷開成多段 | 末端片 5 段；與主血管合併後 6 段 |
| Tributary of plantar venous arch | FJ2113-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Tributary of plantar venous arch | FJ2115-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Tributary of plantar venous arch | FJ2160-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
| Tributary of plantar venous arch | FJ2165-END | 斷開成多段 | 末端片 2 段；與主血管合併後 1 段 |
