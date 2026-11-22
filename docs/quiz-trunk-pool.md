# Quiz 腹部、骨盆與會陰：題庫範圍與排除清單

此檔由 `node scripts/report-quiz-trunk.mjs` 產生，請勿手改（排除與分組由 `scripts/prepare-quiz.mjs` 依 `app/quiz/trunk.ts` 的規則決定；說明見 `docs/quiz-trunk.md`）。來源是主站在該區已有的構造（圖譜、補充構造與神經疊層）；肝、膽道、胰、腎的內部構造由各器官的詳細模式 Quiz 出題。

## 腹部（Abdomen）

可出題：210 個構造（左右分開計），去掉左右後 144 個名稱。不出題：75 項（逐項列在下方）。

### 各區段 × 類別（格內為「構造數 / 去掉左右後的名稱數」）

| 區段 | 骨 | 肌肉 | 神經 | 動脈 | 靜脈 | 韌帶與筋膜 | 特殊空間與孔 | 器官結構 | 合計 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 腹壁與腹股溝 | — | 10 / 5 | — | 8 / 4 | 8 / 4 | 4 / 3 | — | — | 30 / 16 |
| 胃腸與腹膜 | — | — | — | — | — | 3 / 3 | — | 12 / 12 | 15 / 15 |
| 肝、膽、胰、脾 | — | — | — | — | — | — | — | 8 / 7 | 8 / 7 |
| 腎、腎上腺與後腹壁 | — | 7 / 4 | — | — | — | — | 1 / 1 | 6 / 3 | 14 / 8 |
| 腹部血管 | — | — | — | 50 / 39 | 36 / 25 | — | — | — | 86 / 64 |
| 腹部神經與神經叢 | — | — | 30 / 15 | — | — | — | — | — | 30 / 15 |
| 腰椎、肋骨與骨盆骨 | 27 / 19 | — | — | — | — | — | — | — | 27 / 19 |
| 全部 | 27 / 19 | 17 / 9 | 30 / 15 | 58 / 43 | 44 / 29 | 7 / 6 | 1 / 1 | 26 / 22 | 210 / 144 |

### 各區段的構造

**腹壁與腹股溝（16）**：External oblique（腹外斜肌）；Inferior epigastric artery（下腹壁動脈）；Inferior epigastric vein（下腹壁靜脈）；Inguinal ligament（腹股溝韌帶）；Internal oblique（腹內斜肌）；Linea alba（白線）；Pyramidalis（錐狀肌）；Rectus abdominis（腹直肌）；Rectus sheath（腹直肌鞘）；Subcostal artery（肋下動脈）；Subcostal vein（肋下靜脈）；Superficial epigastric artery（淺腹壁動脈）；Superficial epigastric vein（淺腹壁靜脈）；Superior epigastric artery（上腹壁動脈）；Superior epigastric vein（上腹壁靜脈）；Transversus abdominis（腹橫肌）

**胃腸與腹膜（15）**：Appendix（闌尾）；Ascending colon（升結腸）；Descending colon（降結腸）；Duodenum（十二指腸）；Ileocecal junction（迴盲部）；Ileum（迴腸）；Jejunum（空腸）；Mesentery of small intestine（小腸繫膜）；Mesoappendix（闌尾繫膜）；Stomach（胃）；Taenia libera（游離結腸帶）；Taenia mesocolica（結腸繫膜帶）；Taenia omentalis（網膜帶）；Transverse colon（橫結腸）；Transverse mesocolon（橫結腸繫膜）

**肝、膽、胰、脾（7）**：Common hepatic duct（總肝管）；Cystic duct（膽囊管）；Gallbladder（膽囊）；Hepatic duct（肝管）；Pancreas（胰臟）；Pancreatic duct（胰管）；Spleen（脾臟）

**腎、腎上腺與後腹壁（8）**：Adrenal gland（腎上腺）；Aortic hiatus（主動脈裂孔）；Diaphragm（橫膈）；Iliacus（髂肌）；Kidney（腎臟）；Psoas major（腰大肌）；Quadratus lumborum（腰方肌）；Ureter（輸尿管）

**腹部血管（64）**：Abdominal aorta（腹主動脈）；Anterior cecal artery（盲腸前動脈）；Anterior inferior pancreaticoduodenal artery（前下胰十二指腸動脈）；Anterior superior pancreaticoduodenal artery（前上胰十二指腸動脈）；Appendicular artery（闌尾動脈）；Ascending branch of colic artery（結腸動脈升支）；Ascending lumbar vein（升腰靜脈）；Caudal pancreatic artery（胰尾動脈）；Celiac artery（腹腔動脈幹）；Colic artery（結腸動脈）；Colic vein（結腸靜脈）；Common hepatic artery（總肝動脈）；Common iliac artery（總髂動脈）；Common iliac vein（總髂靜脈）；Descending branch of colic artery（結腸動脈降支）；Dorsal pancreatic artery（背胰動脈）；Gastric artery（胃動脈）；Gastric vein（胃靜脈）；Gastro-epiploic artery（胃網膜動脈）；Gastroduodenal artery（胃十二指腸動脈）；Gastroepiploic vein（胃網膜靜脈）；Great pancreatic artery（大胰動脈）；Hepatic artery（肝動脈）；Hepatic artery proper（肝固有動脈）；Hepatic portal vein（肝門靜脈）；Hepatic vein（肝靜脈）；Ileal artery（迴腸動脈）；Ileal vein（迴腸靜脈）；Ileocolic artery（迴結腸動脈）；Ileocolic vein（迴結腸靜脈）；Iliolumbar vein（髂腰靜脈）；Inferior mesenteric artery（下腸繫膜動脈）；Inferior mesenteric vein（下腸繫膜靜脈）；Inferior pancreatic artery（胰下動脈）；Inferior pancreaticoduodenal artery（下胰十二指腸動脈）；Inferior phrenic artery（下膈動脈）；Inferior phrenic vein（下膈靜脈）；Inferior suprarenal artery（下腎上腺動脈）；Inferior vena cava（下腔靜脈）；Lumbar artery（腰動脈）；Lumbar vein（腰靜脈）；Marginal artery of colon（結腸邊緣動脈）；Median sacral vein（正中薦靜脈）；Middle colic artery（中結腸動脈）；Middle colic vein（中結腸靜脈）；Middle hepatic vein（中肝靜脈）；Middle suprarenal artery（中腎上腺動脈）；Pancreaticoduodenal vein（胰十二指腸靜脈）；Portal vein（門靜脈）；Posterior cecal artery（盲腸後動脈）；Posterior inferior pancreaticoduodenal artery（後下胰十二指腸動脈）；Posterior superior pancreaticoduodenal artery（後上胰十二指腸動脈）；Renal artery（腎動脈）；Renal vein（腎靜脈）；Sigmoid artery（乙狀結腸動脈）；Sigmoid vein（乙狀結腸靜脈）；Splenic artery（脾動脈）；Splenic vein（脾靜脈）；Superficial circumflex iliac artery（淺旋髂動脈）；Superior mesenteric artery（上腸繫膜動脈）；Superior mesenteric vein（上腸繫膜靜脈）；Suprarenal vein（腎上腺靜脈）；Testicular artery（睪丸動脈）；Testicular vein（睪丸靜脈）

**腹部神經與神經叢（15）**：Aorticorenal ganglion（主動脈腎神經節）；Celiac ganglion（腹腔神經節）；Femoral branch of genitofemoral nerve（生殖股神經股支）；Femoral nerve（股神經）；Genital branch of genitofemoral nerve（生殖股神經生殖支）；Genitofemoral nerve（生殖股神經）；Greater splanchnic nerve（大內臟神經）；Ilio-inguinal nerve（髂腹股溝神經）；Iliohypogastric nerve（髂腹下神經）；Lateral femoral cutaneous nerve（外股皮神經）；Least splanchnic nerve（最小內臟神經）；Lesser splanchnic nerve（小內臟神經）；Obturator nerve（閉孔神經）；Renal ganglion（腎神經節）；Superior mesenteric ganglion（上腸繫膜神經節）

**腰椎、肋骨與骨盆骨（19）**：Eighth rib（第八肋骨）；Eleventh rib（第十一肋骨）；Fifth lumbar vertebra（第五腰椎）；First lumbar vertebra（第一腰椎）；Fourth lumbar vertebra（第四腰椎）；Hip bone（髖骨）；Intervertebral disk of fifth lumbar vertebra（第五腰椎椎間盤）；Intervertebral disk of first lumbar vertebra（第一腰椎椎間盤）；Intervertebral disk of fourth lumbar vertebra（第四腰椎椎間盤）；Intervertebral disk of second lumbar vertebra（第二腰椎椎間盤）；Intervertebral disk of third lumbar vertebra（第三腰椎椎間盤）；Ninth rib（第九肋骨）；Sacrum（薦骨）；Second lumbar vertebra（第二腰椎）；Seventh costal cartilage（第七肋軟骨）；Seventh rib（第七肋骨）；Tenth rib（第十肋骨）；Third lumbar vertebra（第三腰椎）；Twelfth rib（第十二肋骨）

### 資料卡

資料卡只使用主站已有的資料；沒有資料的欄位顯示「尚無資料」，不自行補寫。欄位齊全：70 / 210；部分欄位有資料：23；完全沒有資料：117。

| 系統 | 構造數 | 欄位齊全 | 部分有資料 | 完全沒有資料 |
| --- | --- | --- | --- | --- |
| 骨骼 | 27 | 0 | 6 | 21 |
| 肌肉 | 17 | 17 | 0 | 0 |
| 神經 | 30 | 14 | 0 | 16 |
| 動脈 | 58 | 27 | 13 | 18 |
| 靜脈 | 44 | 0 | 4 | 40 |
| 腹盆器官構造 | 34 | 12 | 0 | 22 |

### 內臟的前後層次（前方的內臟變半透明）

共 34 個構造有「層」的標記（前層：13、中層：14、深層：7）：題目是較深層的內臟時，位於它前方的內臟改為淡色半透明、不能被點選。

### 名稱的其他接受寫法

21 個構造另有可接受的寫法（來自必考清單的用詞，顯示名稱仍是主站的名稱）。

### 不出題的構造（逐項）

#### 肝實質、膽道樹、胰實質、腎內血管等器官內部構造：由器官詳細模式的 Quiz 出題，不在本區重複（67）

- Anterior division of left renal artery（左腎動脈前分支） [left]
- Anterior division of right renal artery（右腎動脈前分支） [right]
- Anterior inferior segmental branch of right portal vein（右門靜脈前下段支）
- Anterior inferior segmental hepatic artery（肝前下段動脈）
- Anterior inferior segmental tributary of middle hepatic vein（中肝靜脈前下段屬支）
- Anterior inferior tributary of right hepatic biliary tree（右肝內膽管樹前下屬支）
- Anterior superior segmental branch of right portal vein（右門靜脈前上段支）
- Anterior superior segmental hepatic artery（肝前上段動脈）
- Anterior superior segmental tributary of right hepatic vein（右肝靜脈前上段屬支）
- Anterior superior tributary of right hepatic biliary tree（右肝內膽管樹前上屬支）
- Ascending branch of inferior branch of ileocolic artery（迴結腸動脈下支升支）
- Caudate lobe branch of left hepatic artery（左肝動脈尾狀葉葉支）
- Caudate lobe branch of left portal vein（左門靜脈尾狀葉葉支）
- Caudate lobe branch of right hepatic artery（右肝動脈尾狀葉葉支）
- Caudate lobe branch of right portal vein（右門靜脈尾狀葉葉支）
- Caudate lobe of liver（肝尾葉）
- Caudate lobe tributary of left hepatic biliary tree（左肝內膽管樹尾狀葉屬支）
- Hepatovenous segment II
- Hepatovenous segment III
- Hepatovenous segment IV
- Hepatovenous segment IX
- Hepatovenous segment V
- Hepatovenous segment VI
- Hepatovenous segment VII
- Hepatovenous segment VIII
- Ileal branch of inferior branch of ileocolic artery（迴結腸動脈下支迴腸支）
- Inferior segmental branch of left renal artery（左腎動脈下段支） [left]
- Inferior segmental branch of right renal artery（右腎動脈下段支） [right]
- Lateral inferior segmental branch of left portal vein（左門靜脈外側下段支）
- Lateral inferior segmental hepatic artery（肝外側下段動脈）
- Lateral inferior segmental tributary of left hepatic vein（左肝靜脈外側下段屬支）
- Lateral inferior tributary of left hepatic biliary tree（左肝內膽管樹外側下屬支）
- Lateral superior segmental branch of left portal vein（左門靜脈外側上段支）
- Lateral superior segmental hepatic artery（肝外側上段動脈）
- Lateral superior segmental tributary of left hepatic vein（左肝靜脈外側上段屬支）
- Lateral superior tributary of left hepatic biliary tree（左肝內膽管樹外側上屬支）
- Left duct of caudate lobe of liver（左肝尾葉膽管） [left]
- Left lobe branch of left hepatic artery（左肝動脈葉支）
- Medial inferior segmental branch of left portal vein（左門靜脈內側下段支）
- Medial inferior segmental hepatic artery（肝內側下段動脈）
- Medial inferior segmental tributary of middle hepatic vein（中肝靜脈內側下段屬支）
- Medial inferior tributary of left hepatic biliary tree（左肝內膽管樹內側下屬支）
- Medial superior segmental branch of left portal vein（左門靜脈內側上段支）
- Medial superior segmental hepatic artery（肝內側上段動脈）
- Medial superior segmental tributary of left hepatic vein（左肝靜脈內側上段屬支）
- Medial superior tributary of left hepatic biliary tree（左肝內膽管樹內側上屬支）
- Pancreatic duct tree（胰管樹）
- Parenchyma of pancreas（胰臟實質）
- Posterior division of left renal artery（左腎動脈後分支） [left]
- Posterior division of right renal artery（右腎動脈後分支） [right]
- Posterior inferior segmental branch of right portal vein（右門靜脈後下段支）
- Posterior inferior segmental hepatic artery（肝後下段動脈）
- Posterior inferior segmental tributary of right hepatic vein（右肝靜脈後下段屬支）
- Posterior inferior tributary of right hepatic biliary tree（右肝內膽管樹後下屬支）
- Posterior segmental branch of left renal artery（左腎動脈後段支） [left]
- Posterior segmental branch of right renal artery（右腎動脈後段支） [right]
- Posterior superior segmental branch of right portal vein（右門靜脈後上段支）
- Posterior superior segmental hepatic artery（肝後上段動脈）
- Posterior superior segmental tributary of right hepatic vein（右肝靜脈後上段屬支）
- Posterior superior tributary of right hepatic biliary tree（右肝內膽管樹後上屬支）
- Right anterior segmental artery（右前段動脈） [right]
- Right lobe branch of right hepatic artery（右肝動脈葉支）
- Superior segmental branch of left renal artery（左腎動脈上段支） [left]
- Superior segmental branch of right renal artery（右腎動脈上段支） [right]
- Tributary of middle hepatic vein（中肝靜脈屬支）
- Ureteric segment of left renal artery（左腎動脈輸尿管段） [left]
- Ureteric segment of right renal artery（右腎動脈輸尿管段） [right]

#### 屬於其他區域（胸腔、背部、下肢）的 Quiz（7）

- Descending aorta（降主動脈）
- Left latissimus dorsi（左闊背肌） [left]
- Left superior phrenic artery（左上膈動脈） [left]
- Right latissimus dorsi（右闊背肌） [right]
- Right superior phrenic artery（右上膈動脈） [right]
- Superior phrenic vein（膈上靜脈）
- Thoracic duct（胸管）

#### 沒有可核對的中文名（0）

沒有。

#### 另有左右分開的同名構造，這個沒有左右的副本不出題（1）

- Ascending lumbar vein（升腰靜脈）

#### 同名或同中文名的另一構造無法分辨，打字作答會沒有唯一答案（0）

沒有。

### 必考清單的覆蓋

必考清單要求 3D 的 428 項：本區出題 122 項；沒有出題 306 項（主站沒有該構造的模型，或屬器官詳細模式／其他區域的 Quiz；缺項記入 ROADMAP，考試後才做）。

沒有出題的項目：

- Esophagus（食道）
- Fundus of stomach（胃底）
- Lesser curvature of stomach（胃小彎）
- Greater curvature of stomach（胃大彎）
- Pylorus（幽門）
- Duodenojejunal flexure（十二指腸空腸彎曲）
- Cecum（盲腸）
- Right colic flexure（右結腸彎曲）
- Left colic flexure（左大腸彎）
- Sigmoid colon（乙狀結腸）
- Rectum（直腸）
- Anus（肛門）
- Liver（肝臟）
- Bile duct (common bile duct)（膽管）
- Portal triad（肝門三體）
- Renal cortex（腎皮質）
- Renal medulla（腎髓質）
- Renal pyramid（腎錐體）
- Renal column（腎柱）
- Renal papilla（腎乳突）
- Minor calyx（腎小盞）
- Major calyx（腎大盞）
- Renal pelvis（腎盂）
- Renal sinus（腎竇）
- Hilum of kidney（腎門）
- Urinary bladder（膀胱）
- Peritoneum（腹膜）
- Parietal peritoneum（壁層腹膜）
- Visceral peritoneum（臟層腹膜）
- Peritoneal cavity（腹膜腔）
- Greater sac（大囊）
- Lesser sac (omental bursa)（小囊（網膜囊））
- Omental foramen (epiploic foramen)（網膜孔）
- Greater omentum（大網膜）
- Lesser omentum（小網膜）
- Hepatogastric ligament（肝胃韌帶）
- Hepatoduodenal ligament（肝十二指腸韌帶）
- Root of mesentery（腸繫膜根部）
- Sigmoid mesocolon（乙狀結腸繫膜）
- Median umbilical fold（正中臍襞）
- Medial umbilical fold（內側臍襞）
- Lateral umbilical fold（外側臍襞）
- Falciform ligament（鐮狀韌帶）
- Round ligament of liver（肝圓韌帶）
- Median umbilical ligament（正中臍韌帶）
- Medial umbilical ligament（內側臍韌帶）
- Esophageal branch of left gastric artery（左胃動脈食道支）
- Short gastric arteries（短胃動脈）
- Posterior gastric artery（後胃動脈）
- Cystic artery（膽囊動脈）
- Superior pancreaticoduodenal artery（上胰十二指腸動脈）
- Supraduodenal artery（上十二指腸動脈）
- Jejunal arteries（空腸動脈）
- Superior rectal artery（上直腸動脈）
- Superior suprarenal artery（上腎上腺動脈）
- Gonadal artery（生殖腺動脈）
- Ovarian artery（卵巢動脈）
- Median sacral artery（正中薦動脈）
- Internal iliac artery（內髂動脈）
- External iliac artery（外髂動脈）
- Deep circumflex iliac artery（深旋髂動脈）
- Musculophrenic artery（肌膈動脈）
- Superior phrenic artery（上膈動脈）
- Pericardiacophrenic artery（心包膜膈動脈）
- Cremasteric artery（提睪肌動脈）
- Inferior vesical artery（下膀胱動脈）
- Hepatic veins（肝靜脈）
- Right gonadal vein（右生殖腺靜脈）
- Left gonadal vein（左生殖腺靜脈）
- Ovarian vein（卵巢靜脈）
- Azygos vein（奇靜脈）
- Hemiazygos vein（半奇靜脈）
- Short gastric veins（短胃靜脈）
- Cystic vein（膽囊靜脈）
- Paraumbilical vein（臍旁靜脈）
- Superior rectal vein（上直腸靜脈）
- Middle rectal veins（中直腸靜脈）
- Inferior rectal veins（下直腸靜脈）
- Esophageal vein（食道靜脈）
- Pampiniform venous plexus（蔓狀靜脈叢）
- Superficial circumflex iliac vein（淺旋髂靜脈）
- Deep circumflex iliac vein（深旋髂靜脈）
- Thoracoepigastric vein（胸腹壁靜脈）
- External iliac vein（外髂靜脈）
- Femoral vein（股靜脈）
- Internal thoracic vein（內胸靜脈）
- Thoracic duct（胸管）
- Cisterna chyli（乳糜池）
- Intestinal trunk（腸幹）
- Right lumbar trunk（右腰幹）
- Left lumbar trunk（左腰幹）
- Celiac nodes（腹腔淋巴結）
- Superior mesenteric nodes（上腸繫膜淋巴結）
- Inferior mesenteric nodes（下腸繫膜淋巴結）
- Pre-aortic nodes（主動脈前淋巴結）
- Para-aortic nodes（主動脈旁淋巴結）
- Lateral aortic nodes（左右側主動脈淋巴結）
- Lumbar nodes（腰淋巴結）
- Common iliac nodes（總髂淋巴結）
- External iliac nodes（外髂淋巴結）
- Internal iliac nodes（內髂淋巴結）
- Superficial inguinal nodes（淺腹股溝淋巴結）
- Vagus nerve（迷走神經）
- Anterior vagal trunk（前迷走神經幹）
- Posterior vagal trunk（後迷走神經幹）
- Phrenic nerve（膈神經）
- Lumbar splanchnic nerves（腰內臟神經）
- Pelvic splanchnic nerves（骨盆內臟神經）
- Sympathetic trunk（交感神經幹）
- Ganglion impar（奇神經節）
- Hypogastric nerve（下腹神經）
- Inferior mesenteric ganglion（下腸繫膜神經節）
- Celiac plexus（腹腔叢）
- Aortic plexus（主動脈叢）
- Superior mesenteric plexus（上腸繫膜叢）
- Intermesenteric plexus（中腸繫膜叢）
- Inferior mesenteric plexus（下腸繫膜叢）
- Renal plexus（腎神經叢）
- Superior hypogastric plexus（上腹下神經叢）
- Inferior hypogastric plexus（下腹下神經叢）
- Lumbar plexus（腰神經叢）
- Subcostal nerve（肋下神經）
- Accessory obturator nerve（副閉孔神經）
- Lumbosacral trunk（腰薦神經幹）
- Intercostal nerves（肋間神經）
- Cremaster（提睪肌）
- Psoas minor（腰小肌）
- Iliopsoas（髂腰肌）
- Right crus of diaphragm（橫膈右腳）
- Left crus of diaphragm（橫膈左腳）
- Central tendon of diaphragm（橫膈中央肌腱）
- Semilunar line (linea semilunaris)（半月線）
- Tendinous intersections（腱劃）
- Arcuate line（弓狀線）
- External oblique aponeurosis（腹外斜肌腱膜）
- Lacunar ligament（腔隙韌帶）
- Iliopectineal ligament（髂恥韌帶）
- Conjoint tendon（聯合肌腱）
- Iliolumbar ligament（髂腰韌帶）
- Median arcuate ligament（正中弓狀韌帶）
- Medial arcuate ligament（內側弓狀韌帶）
- Lateral arcuate ligament（外側弓狀韌帶）
- Esophageal hiatus（食道裂孔）
- Vena caval hiatus（腔靜脈裂孔）
- Inguinal canal（腹股溝管）
- Superficial inguinal ring（淺腹股溝環）
- Deep inguinal ring（深腹股溝環）
- Spermatic cord（精索）
- Ductus deferens（輸精管）
- Inguinal triangle (Hesselbach's triangle)（腹股溝三角）
- Femoral canal（股管）
- Femoral ring（股環）
- Superficial fascia of abdomen（淺筋膜）
- Camper's fascia（淺層脂肪層（Camper 氏筋膜））
- Scarpa's fascia（深層膜性層（Scarpa 氏筋膜））
- Deep fascia of abdomen（深筋膜）
- Transversalis fascia（腹橫筋膜）
- Thoracolumbar fascia（胸腰筋膜）
- Renal fascia（腎筋膜）
- Extraperitoneal fascia（腹膜外筋膜）
- Internal spermatic fascia（內精筋膜）
- External spermatic fascia（外精筋膜）
- Cremasteric fascia（提睪肌筋膜）
- Perirenal fat（腎圍脂肪層）
- Pararenal fat（腎旁脂肪層）
- Iliac crest（髂脊）
- Anterior superior iliac spine（前上髂棘）
- Iliac fossa（髂窩）
- Pubic tubercle（恥骨結節）
- Pubic crest（恥骨脊）
- Pectineal line（恥骨線）
- Iliopubic eminence（髂恥隆凸）
- Xiphoid process（劍突）
- Costal margin（肋弓）
- Umbilicus（臍）
- Pelvic inlet（骨盆入口）
- Greater (false) pelvis（大骨盆（假骨盆））
- True pelvis（真骨盆）
- Pubic symphysis（恥骨聯合）
- Intervertebral discs（椎間盤）
- Costal cartilages（肋軟骨）
- Jugular notch（頸靜脈切跡）
- Tubercle of iliac crest（髂嵴結節）
- Right hypochondriac region（右季肋區）
- Epigastric region（上腹部（心窩區））
- Left hypochondriac region（左季肋區）
- Right lumbar region (flank)（右腰區）
- Umbilical region（臍區）
- Left lumbar region (flank)（左腰區）
- Right inguinal region (groin)（右腹股溝區）
- Hypogastric (pubic) region（下腹部（恥骨上區））
- Left inguinal region (groin)（左腹股溝區）
- Transpyloric plane (Addison's plane)（幽門平面）
- Subcostal plane（肋下平面）
- Transtubercular plane（結節間平面）
- Transumbilical plane（臍平面）
- Interspinous plane（棘間平面）
- Aponeurosis of internal oblique（腹內斜肌腱膜）
- Aponeurosis of transversus abdominis（腹橫肌腱膜）
- Anterior wall of rectus sheath（腹直肌鞘前壁）
- Posterior wall of rectus sheath（腹直肌鞘後壁）
- Dartos fascia（肉膜）
- Colles' fascia (superficial perineal fascia)（淺會陰筋膜（科利斯氏筋膜））
- Fascia lata（闊筋膜）
- Posterior intercostal arteries（後肋間動脈）
- Thoracic aorta（胸主動脈）
- Internal thoracic artery（內胸動脈）
- Femoral artery（股動脈）
- Lateral thoracic vein（外胸靜脈）
- Axillary nodes（腋淋巴結）
- Parasternal nodes（胸骨旁淋巴結）
- Thoraco-abdominal nerves（胸腹神經）
- Pectineal (Cooper's) ligament（恥骨梳韌帶）
- Medial crus of superficial inguinal ring（淺腹股溝環內腳）
- Lateral crus of superficial inguinal ring（淺腹股溝環外腳）
- Tunica vaginalis（睪丸鞘膜）
- Artery to ductus deferens（輸精管動脈）
- Testis（睪丸）
- Epididymis（副睪）
- Round ligament of uterus（子宮圓韌帶）
- Ovary（卵巢）
- Ligament of ovary（卵巢韌帶）
- Esophageal plexus（食道神經叢）
- Cervical constriction of esophagus（食道頸部狹窄）
- Thoracic (broncho-aortic) constriction of esophagus（食道胸部狹窄（支氣管主動脈狹窄））
- Diaphragmatic (esophagogastric) constriction of esophagus（食道橫膈狹窄）
- Abdominal esophagus（食道腹部）
- Cricopharyngeus (upper esophageal sphincter)（環咽肌（上食道括約肌））
- Lower esophageal sphincter（下食道括約肌）
- Cardia (cardial orifice)（賁門）
- Cardial notch（賁門切跡）
- Body of stomach（胃體）
- Pyloric antrum（幽門竇）
- Pyloric canal（幽門管）
- Pyloric sphincter（幽門括約肌）
- Angular incisure (angular notch)（胃角切跡）
- Gastric canal（胃管）
- Esophagogastric junction (Z-line)（食道胃交界（Z 線））
- Phrenico-esophageal ligament（橫膈食道韌帶）
- Gastrosplenic ligament（胃脾韌帶）
- Splenorenal (lienorenal) ligament（脾腎韌帶）
- Phrenicocolic ligament（橫膈結腸韌帶）
- Phrenicosplenic ligament（橫膈脾韌帶）
- Splenocolic ligament（脾結腸韌帶）
- Esophageal branch of left inferior phrenic artery（左下膈動脈食道支）
- Posterior gastric veins（後胃靜脈）
- Superior part of duodenum (duodenal cap)（十二指腸上部（十二指腸壺腹））
- Descending part of duodenum（十二指腸降部）
- Inferior (horizontal) part of duodenum（十二指腸下部（水平部））
- Ascending part of duodenum（十二指腸升部）
- Major duodenal papilla（大十二指腸乳突）
- Minor duodenal papilla（小十二指腸乳突）
- Hepatopancreatic ampulla (ampulla of Vater)（肝胰壺腹）
- Sphincter of ampulla (sphincter of Oddi)（肝胰壺腹括約肌）
- Suspensory ligament of duodenum (ligament of Treitz)（十二指腸懸韌帶（屈氏韌帶））
- Paraduodenal fossa（十二指腸旁窩）
- Ileocecal valve（迴盲瓣）
- Diaphragmatic surface of liver（肝橫膈面）
- Visceral surface of liver（肝臟面）
- Subphrenic recess（膈下隱窩）
- Hepatorenal recess (Morison's pouch)（肝腎隱窩）
- Right lobe of liver（肝右葉）
- Left lobe of liver（肝左葉）
- Quadrate lobe of liver（肝方形葉）
- Caudate lobe of liver（肝尾葉）
- Porta hepatis（肝門）
- Couinaud segments of liver（肝段（Couinaud 分段））
- Ligamentum venosum（靜脈韌帶）
- Coronary ligament of liver（肝冠狀韌帶）
- Bare area of liver（肝裸區）
- Right triangular ligament（右三角韌帶）
- Left triangular ligament（左三角韌帶）
- Calot's triangle (cystohepatic triangle)（膽囊三角（卡洛三角））
- Fundus of gallbladder（膽囊底）
- Body of gallbladder（膽囊體）
- Neck of gallbladder（膽囊頸）
- Head of pancreas（胰頭）
- Uncinate process of pancreas（胰鉤突）
- Neck of pancreas（胰頸）
- Body of pancreas（胰體）
- Tail of pancreas（胰尾）
- Main pancreatic duct（主胰管）
- Accessory pancreatic duct（副胰管）
- Hilum of spleen (splenic hilum)（脾門）
- Gastric surface of spleen（脾胃面）
- Colic surface of spleen（脾結腸面）
- Renal surface of spleen（脾腎面）
- Anal canal（肛管）
- Haustra of colon（結腸袋）
- Omental (epiploic) appendices（腸脂垂）
- Paracolic gutters（結腸旁溝）
- Middle rectal artery（中直腸動脈）
- Inferior rectal artery（下直腸動脈）
- Internal pudendal artery（內陰動脈）
- Retroperitoneal space（腹膜後腔）
- Preperitoneal (properitoneal) space（腹膜前腔）
- Sternal part of diaphragm（橫膈胸骨部）
- Costal part of diaphragm（橫膈肋骨部）
- Lumbar part of diaphragm（橫膈腰部）
- Ureteropelvic junction（腎盂輸尿管連接部）
- Ureterovesical junction (entrance to bladder)（輸尿管膀胱連接部）
- Pelvic brim（骨盆緣）
- Iliolumbar artery（髂腰動脈）
- Lumbar azygos vein（腰奇靜脈）
- Lateral lumbar nodes（側腰淋巴結）
- White ramus communicans（白交通支）

