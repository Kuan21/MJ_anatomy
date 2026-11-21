import type {OrganCard, OrganDef, OrganGroupDef, OrganPartDef} from '../organ-types';

/**
 * Liver, gallbladder and biliary tract detail mode. Meshes come from scripts/organ-atlas/liver-gallbladder.mjs: the liver segments, gallbladder, ducts and vessels are copied from the
 * atlas; the lobes and landmarks of the liver and the parts of the gallbladder are marked on their surfaces; the round ligament, ligamentum venosum, cystic artery and vein and the
 * hepatic plexus are schematic. Card text is written for this site from public anatomical descriptions.
 */
const groups: OrganGroupDef[] = [
  {id: 'organs', en: 'Liver and gallbladder (whole organs)', zh: '肝與膽囊（整體）', layer: 7, on: true},
  {id: 'zones', en: 'Lobes and parts', zh: '肝葉與膽囊各部', layer: 6, on: true},
  {id: 'marks', en: 'Porta hepatis, bare area and peritoneal attachments', zh: '肝門、裸區與腹膜附著', layer: 5, on: true},
  {id: 'ligaments', en: 'Ligaments of the liver', zh: '肝的韌帶', layer: 4, on: true},
  {id: 'ducts', en: 'Bile ducts', zh: '膽管', layer: 4, on: true},
  {id: 'nerves', en: 'Nerves', zh: '神經', layer: 0, on: false},
  {id: 'veins', en: 'Veins (portal vein and hepatic veins)', zh: '靜脈（門靜脈與肝靜脈）', layer: 1, on: false},
  {id: 'arteries', en: 'Arteries', zh: '動脈', layer: 2, on: false},
  {id: 'cardonly', en: 'Spaces, peritoneum and microscopic structures (card only)', zh: '腔隙、腹膜與顯微構造（只有資訊卡）', layer: -1, on: true},
  {id: 'muscles', en: 'Related muscles', zh: '相關肌肉', layer: 3, on: true},
  {id: 'context', en: 'Neighbouring organs', zh: '相鄰器官', layer: 3, on: true},
];

const ART = '#c4413a', VEIN = '#3f66b0', PORTAL = '#5b4fb0', NERVE = '#d4a600', GANGLION = '#b88a00', DUCT = '#4f9a5a', LIG = '#e8e2d0';
const b = (en: string, zh: string) => ({en, zh});
type Extra = Partial<OrganPartDef>;
const part = (key: string, en: string, zh: string, group: string, color: string, card: OrganCard, extra: Extra = {}): OrganPartDef => ({key, en, zh, group, color, card, ...extra});
const art = (key: string, zh: string, card: OrganCard, extra: Extra = {}) => part(key, key, zh, 'arteries', ART, card, {quizSystem: 'arterial', ...extra});
const vein = (key: string, zh: string, card: OrganCard, extra: Extra = {}) => part(key, key, zh, 'veins', VEIN, card, {quizSystem: 'venous', ...extra});
const portal = (key: string, zh: string, card: OrganCard, extra: Extra = {}) => part(key, key, zh, 'veins', PORTAL, card, {quizSystem: 'venous', ...extra});
const duct = (key: string, en: string, zh: string, card: OrganCard, extra: Extra = {}) => part(key, en, zh, 'ducts', DUCT, card, {quizSystem: 'viscera', ...extra});
const note = (key: string, en: string, zh: string, card: OrganCard) => part(key, en, zh, 'cardonly', '#9fb8a0', card, {cardOnly: true, quizSystem: 'viscera'});
const zone = (host: string, ...v: number[]) => ({host, channel: 'zone' as const, values: v});
const line = (host: string, v: number) => ({host, channel: 'line' as const, values: [v]});

const parts: OrganPartDef[] = [
  // ---- organs
  part('Liver', 'Liver', '肝臟', 'organs', '#9c4f3c', {
    loc: b('The largest gland of the body, in the right hypochondrium and epigastrium under the diaphragm, mostly behind the right ribs; its lower border follows the right costal margin.', '人體最大的腺體，位於右季肋區與上腹區、橫膈下方，大部分在右側肋骨後方；下緣大致沿右肋緣。'),
    rel: b('The diaphragmatic surface lies against the diaphragm; the visceral surface touches the stomach, duodenum, right colic flexure, right kidney and gallbladder. The model is made of the liver segments of the atlas put together, so thin seams between segments can show.', '橫膈面貼著橫膈；臟面與胃、十二指腸、右結腸彎、右腎及膽囊相鄰。這個模型由圖譜的各肝段拼合而成，段與段之間可見細縫。'),
    blood: b('A double supply: about three quarters of the blood comes through the portal vein from the gut and a quarter through the hepatic artery proper. Blood leaves by the hepatic veins into the inferior vena cava.', '雙重血液供應：約四分之三經肝門靜脈來自消化道，約四分之一來自肝固有動脈。血液經肝靜脈流入下腔靜脈。'),
    nerve: b('Hepatic plexus from the celiac plexus (sympathetic) and the vagus nerves; the capsule is supplied by the lower intercostal and phrenic nerves, so liver swelling hurts in the right upper abdomen and the right shoulder.', '由腹腔叢而來的肝叢（交感）及迷走神經；肝被膜由下位肋間神經與膈神經支配，所以肝腫大的痛感在右上腹，也可轉移到右肩。'),
    fn: b('It makes bile, stores glycogen, makes plasma proteins and clotting factors, and breaks down drugs, hormones and ammonia.', '分泌膽汁、儲存肝醣、合成血漿蛋白與凝血因子，並分解藥物、激素與氨。'),
    links: ['Right lobe of liver', 'Left lobe of liver', 'Quadrate lobe of liver', 'Caudate lobe of liver', 'Porta hepatis', 'Bare area of liver'],
  }),
  part('Gallbladder', 'Gallbladder', '膽囊', 'organs', '#5f9a50', {
    loc: b('A pear-shaped sac, 7–10 cm long, in the gallbladder fossa on the visceral surface of the liver; its fundus reaches the inferior border at the tip of the right ninth costal cartilage.', '長約 7 至 10 公分的梨形囊，位在肝臟面的膽囊窩內；膽囊底到達肝下緣，約對著右側第九肋軟骨尖端。'),
    rel: b('The neck lies close to the first part of the duodenum and the transverse colon; the cystic duct leaves the neck to join the common hepatic duct.', '膽囊頸靠近十二指腸上部與橫結腸；膽囊管由膽囊頸發出，與總肝管會合。'),
    blood: b('The cystic artery, usually from the right hepatic artery; the cystic veins drain into the right branch of the portal vein or straight into the liver.', '膽囊動脈，通常來自右肝動脈；膽囊靜脈注入肝門靜脈右支，或直接進入肝臟。'),
    fn: b('It stores and concentrates bile between meals and empties it into the duodenum when cholecystokinin is released after a fatty meal.', '在兩餐之間儲存並濃縮膽汁；吃了含脂肪的食物後，膽囊收縮素使它把膽汁排入十二指腸。'),
    links: ['Fundus of gallbladder', 'Body of gallbladder', 'Neck of gallbladder', 'Cystic duct', 'Cystic artery'],
  }),

  // ---- lobes of the liver
  part('Right lobe of liver', 'Right lobe of liver', '肝右葉', 'zones', '#e0a43a', {
    loc: b('The large part to the right of the falciform ligament on the diaphragmatic surface (and of the gallbladder fossa and the groove for the inferior vena cava on the visceral surface). Here it is marked as segments V–VIII and the upper part of IV.', '橫膈面上位於鐮狀韌帶右側的大部分（臟面上在膽囊窩與下腔靜脈溝的右側）。這裡標示為第 V 至第 VIII 段與第 IV 段上部。'),
    rel: b('Its visceral surface bears the impressions of the right colic flexure, right kidney, right suprarenal gland and duodenum.', '臟面上有右結腸彎、右腎、右腎上腺與十二指腸的壓跡。'),
    blood: b('Right hepatic artery, right branch of the portal vein; drained mainly by the right and middle hepatic veins.', '右肝動脈與肝門靜脈右支；主要由右肝靜脈與中肝靜脈引流。'),
  }, {mark: zone('Liver', 11, 12), schematic: true}),
  part('Left lobe of liver', 'Left lobe of liver', '肝左葉', 'zones', '#7fbf7f', {
    loc: b('The smaller, thinner part to the left of the falciform ligament and of the fissures for the round ligament and the ligamentum venosum; it reaches the left hypochondrium (segments II and III).', '位於鐮狀韌帶，以及圓韌帶裂與靜脈韌帶裂左側、較小較薄的部分，延伸到左季肋區（第 II、III 段）。'),
    rel: b('Its visceral surface lies on the stomach (gastric impression) and the abdominal oesophagus; the lesser omentum attaches along the fissure for the ligamentum venosum.', '臟面覆蓋在胃上（胃壓跡）與食道腹部上；小網膜附著在靜脈韌帶裂。'),
    blood: b('Left hepatic artery, left branch of the portal vein; drained by the left hepatic vein.', '左肝動脈與肝門靜脈左支；由左肝靜脈引流。'),
  }, {mark: zone('Liver', 21, 22), schematic: true}),
  part('Quadrate lobe of liver', 'Quadrate lobe of liver', '肝方形葉', 'zones', '#6aa9d8', {
    loc: b('A square area on the visceral surface between the gallbladder fossa and the fissure for the round ligament, in front of the porta hepatis (the lower part of segment IV).', '臟面上位於膽囊窩與圓韌帶裂之間、肝門前方的方形區域（第 IV 段下部）。'),
    rel: b('It touches the pylorus and the first part of the duodenum.', '與幽門及十二指腸上部相鄰。'),
    note: b('Functionally it belongs to the left liver (segment IV), although it lies to the right of the falciform ligament.', '雖然位在鐮狀韌帶右側，在功能分區上屬於左半肝（第 IV 段）。'),
  }, {mark: zone('Liver', 31, 32), schematic: true}),
  part('Caudate lobe of liver', 'Caudate lobe of liver', '肝尾葉', 'zones', '#b48fd0', {
    loc: b('A small lobe on the back of the liver between the groove for the inferior vena cava and the fissure for the ligamentum venosum, behind the porta hepatis (segment I).', '肝後方的小葉，位在下腔靜脈溝與靜脈韌帶裂之間、肝門後方（第 I 段）。'),
    rel: b('It lies in the upper recess of the lesser sac; its caudate process joins it to the right lobe behind the porta.', '位在網膜囊上隱窩內；尾狀突在肝門後方把它與右葉連起來。'),
    blood: b('Branches from both the right and left hepatic arteries and portal branches; it drains directly into the inferior vena cava by small veins.', '同時接受左、右肝動脈與門靜脈分支；以小靜脈直接注入下腔靜脈。'),
  }, {mark: zone('Liver', 41, 42), schematic: true}),
  part('Porta hepatis', 'Porta hepatis', '肝門', 'marks', '#2f3437', {
    loc: b('A transverse fissure about 5 cm long on the visceral surface, between the quadrate lobe in front and the caudate lobe behind. Marked here around the division of the portal vein.', '臟面上長約 5 公分的橫裂，前方是方形葉，後方是尾葉。這裡標示在肝門靜脈分叉處周圍。'),
    contents: b('The portal vein (behind), the right and left hepatic arteries and the hepatic ducts (in front), hepatic nerves and lymph vessels; the lesser omentum attaches to its edges.', '肝門靜脈（後方）、左右肝動脈與左右肝管（前方）、肝神經與淋巴管；小網膜附著在它的邊緣。'),
    rel: b('It is the hilum of the liver: all structures except the hepatic veins enter or leave here.', '它是肝的門：除了肝靜脈以外，所有結構都由此出入。'),
  }, {mark: line('Liver', 1), schematic: true}),
  part('Bare area of liver', 'Bare area of liver', '肝裸區', 'marks', '#8a5a3a', {
    loc: b('A triangular area on the back of the right lobe, around the groove for the inferior vena cava, that is not covered by peritoneum. Its outline here is schematic.', '右葉後方、下腔靜脈溝周圍沒有腹膜覆蓋的三角形區域。這裡的範圍為示意。'),
    rel: b('It lies directly against the diaphragm, bounded by the upper and lower layers of the coronary ligament, which meet at the right triangular ligament.', '直接貼著橫膈，四周以冠狀韌帶上、下兩層為界，兩層在右三角韌帶處會合。'),
    note: b('Here the liver is joined to the diaphragm by connective tissue only, so infection can spread from the liver to the chest without entering the peritoneal cavity.', '這裡肝與橫膈之間只有結締組織，所以感染可不經腹膜腔直接由肝擴散到胸腔。'),
  }, {mark: line('Liver', 2), schematic: true}),
  part('Coronary ligament of liver', 'Coronary ligament of liver', '肝冠狀韌帶', 'marks', '#3d6e8f', {
    loc: b('The reflection of peritoneum from the diaphragm to the back of the liver, in an upper and a lower layer around the bare area. Marked here along the border of the bare area.', '腹膜由橫膈反折到肝後方的部分，分上、下兩層圍住裸區。這裡沿裸區邊緣標示。'),
    rel: b('Its two layers meet at the right triangular ligament; on the left they lead to the left triangular ligament.', '兩層在右側會合成右三角韌帶；左側延續到左三角韌帶。'),
    fn: b('It holds the back of the liver to the diaphragm.', '把肝的後方固定在橫膈上。'),
  }, {mark: line('Liver', 3), schematic: true, term: true}),
  part('Right triangular ligament', 'Right triangular ligament', '右三角韌帶', 'marks', '#c83aa0', {
    loc: b('The right end of the bare area, where the upper and lower layers of the coronary ligament meet, joining the right lobe to the diaphragm. Marked here at that point.', '裸區的右端，冠狀韌帶上、下兩層會合處，把右葉連到橫膈。這裡標示在該處。'),
    rel: b('It lies above the right kidney and the hepatorenal recess.', '位在右腎與肝腎隱窩的上方。'),
    fn: b('Fixes the right lobe to the diaphragm.', '把右葉固定在橫膈上。'),
  }, {mark: line('Liver', 4), schematic: true, term: true}),
  part('Left triangular ligament', 'Left triangular ligament', '左三角韌帶', 'marks', '#2ab0b0', {
    loc: b('A fold of peritoneum from the back of the tip of the left lobe to the diaphragm, in front of the oesophageal opening. Marked here on the back of the tip.', '由左葉尖端後方連到橫膈的腹膜皺襞，位在食道裂孔前方。這裡標示在左葉尖端後方。'),
    rel: b('It continues to the right as the upper layer of the coronary ligament and the falciform ligament.', '向右延續為冠狀韌帶上層與鐮狀韌帶。'),
    fn: b('Fixes the left lobe to the diaphragm.', '把左葉固定在橫膈上。'),
  }, {mark: line('Liver', 5), schematic: true, term: true}),
  part('Falciform ligament', 'Falciform ligament', '鐮狀韌帶', 'marks', '#e6e6e6', {
    loc: b('A sickle-shaped double fold of peritoneum from the anterior abdominal wall and the diaphragm to the front and upper surface of the liver. Marked here along its attachment to the liver.', '由前腹壁與橫膈連到肝前上面的鐮刀形雙層腹膜皺襞。這裡沿它在肝上的附著線標示。'),
    contents: b('Its free lower edge contains the round ligament of the liver and the small paraumbilical veins.', '下方游離緣內有肝圓韌帶與細小的臍旁靜脈。'),
    rel: b('It divides the anatomical right and left lobes on the diaphragmatic surface; above, its two layers separate into the coronary and left triangular ligaments.', '在橫膈面上分隔解剖學的左、右葉；向上兩層分開成冠狀韌帶與左三角韌帶。'),
  }, {mark: line('Liver', 6), schematic: true, term: true}),
  part('Fundus of gallbladder', 'Fundus of gallbladder', '膽囊底', 'zones', '#f0c24f', {
    loc: b('The rounded blind end that projects beyond the inferior border of the liver, against the anterior abdominal wall at the tip of the right ninth costal cartilage.', '突出到肝下緣以外的圓鈍盲端，貼著前腹壁，約對著右側第九肋軟骨尖端。'),
    rel: b('It touches the transverse colon.', '與橫結腸相鄰。'),
    note: b('Tenderness under the fundus on deep breathing (Murphy\'s sign) points to an inflamed gallbladder.', '深吸氣時膽囊底下方壓痛（墨菲氏徵象）提示膽囊發炎。'),
  }, {mark: zone('Gallbladder', 1), schematic: true}),
  part('Body of gallbladder', 'Body of gallbladder', '膽囊體', 'zones', '#7fbf7f', {
    loc: b('The main part, lying in the gallbladder fossa on the visceral surface of the liver.', '主要部分，位在肝臟面的膽囊窩內。'),
    rel: b('It touches the first and second parts of the duodenum and the transverse colon.', '與十二指腸第一、二部及橫結腸相鄰。'),
    fn: b('Holds and concentrates bile.', '容納並濃縮膽汁。'),
  }, {mark: zone('Gallbladder', 2), schematic: true}),
  part('Neck of gallbladder', 'Neck of gallbladder', '膽囊頸', 'zones', '#6aa9d8', {
    loc: b('The narrow end towards the porta hepatis, turning into the cystic duct.', '朝向肝門的狹窄端，延續為膽囊管。'),
    rel: b('It lies in the free edge of the lesser omentum area, near the cystohepatic triangle where the cystic artery runs.', '靠近小網膜游離緣，鄰近膽囊動脈所在的膽囊三角。'),
    note: b('Gallstones often lodge in a pouch of the neck (Hartmann\'s pouch).', '膽結石常卡在膽囊頸的囊袋內（哈特曼囊）。'),
  }, {mark: zone('Gallbladder', 3), schematic: true}),

  // ---- ligaments built as cords
  part('Round ligament of liver', 'Round ligament of liver', '肝圓韌帶', 'ligaments', LIG, {
    loc: b('A fibrous cord, the remnant of the left umbilical vein of the fetus, in the free edge of the falciform ligament and then in the fissure between the left and quadrate lobes. Built here as a schematic cord in that fissure.', '纖維索，是胎兒左臍靜脈的遺跡，走在鐮狀韌帶游離緣內，再進入左葉與方形葉之間的裂。這裡在該裂內做成示意索狀結構。'),
    course: b('From the umbilicus up to the inferior border of the liver and along its fissure to the left branch of the portal vein.', '由臍向上到肝下緣，沿圓韌帶裂到肝門靜脈左支。'),
    note: b('The small paraumbilical veins beside it join the portal and the body-wall veins; in portal hypertension they can open up around the umbilicus.', '旁邊細小的臍旁靜脈連接門靜脈與腹壁靜脈；門靜脈高壓時可在臍周擴張。'),
  }, {schematic: true, quizSystem: 'viscera'}),
  part('Ligamentum venosum', 'Ligamentum venosum', '靜脈韌帶', 'ligaments', LIG, {
    loc: b('A fibrous band, the remnant of the ductus venosus of the fetus, in the fissure between the caudate lobe and the left lobe. Built here as a schematic cord in that fissure.', '纖維帶，是胎兒靜脈導管的遺跡，位於尾葉與左葉之間的裂內。這裡在該裂內做成示意索狀結構。'),
    course: b('From the left branch of the portal vein to the left hepatic vein or the inferior vena cava.', '由肝門靜脈左支連到左肝靜脈或下腔靜脈。'),
    rel: b('The lesser omentum attaches in the depth of its fissure.', '小網膜附著在它的裂溝深處。'),
  }, {schematic: true, quizSystem: 'viscera'}),

  // ---- ducts
  duct('Intrahepatic bile ducts', 'Intrahepatic bile ducts', '肝內膽管', {
    course: b('Small ducts inside the liver that follow the portal vein and hepatic artery branches and join into the right and left hepatic ducts.', '肝內的小膽管，伴隨肝門靜脈與肝動脈分支走，匯成左、右肝管。'),
    fn: b('Collect the bile made by the liver cells.', '收集肝細胞分泌的膽汁。'),
    rel: b('With the portal and arterial branches they form the portal triads of the liver.', '與門靜脈及動脈分支一起構成肝內的門三體。'),
  }),
  duct('Right hepatic duct', 'Right hepatic duct', '右肝管', {
    course: b('Drains the right liver and leaves the porta hepatis to join the left hepatic duct.', '引流右半肝，出肝門後與左肝管會合。'),
    rel: b('It lies in front of the right branch of the portal vein.', '位在肝門靜脈右支前方。'),
    fn: b('Carries bile from the right liver.', '把右半肝的膽汁送出。'),
  }),
  duct('Left hepatic duct', 'Left hepatic duct', '左肝管', {
    course: b('Drains the left liver, including the quadrate and part of the caudate lobe; it is longer than the right duct and joins it at the porta hepatis.', '引流左半肝（包括方形葉與部分尾葉）；比右肝管長，在肝門與右肝管會合。'),
    rel: b('It runs along the base of segment IV, in front of the left branch of the portal vein.', '沿第 IV 段底部、在肝門靜脈左支前方走。'),
    fn: b('Carries bile from the left liver.', '把左半肝的膽汁送出。'),
  }),
  duct('Common hepatic duct', 'Common hepatic duct', '總肝管', {
    course: b('Formed at the porta hepatis by the right and left hepatic ducts; it runs down about 3 cm in the lesser omentum and is joined from the right by the cystic duct.', '在肝門由左、右肝管會合而成，在小網膜內下行約 3 公分，在右側與膽囊管會合。'),
    rel: b('It lies to the right of the hepatic artery proper and in front of the portal vein.', '位在肝固有動脈右側、肝門靜脈前方。'),
    fn: b('Carries bile from the liver.', '把肝臟分泌的膽汁送出。'),
  }),
  duct('Cystic duct', 'Cystic duct', '膽囊管', {
    course: b('About 3–4 cm long, from the neck of the gallbladder to the common hepatic duct; its lining forms a spiral fold.', '長約 3 至 4 公分，由膽囊頸連到總肝管；黏膜形成螺旋襞。'),
    rel: b('With the common hepatic duct and the liver it bounds the cystohepatic triangle.', '與總肝管及肝圍成膽囊三角。'),
    fn: b('Carries bile into the gallbladder for storage and out again.', '把膽汁送進膽囊儲存，再送出。'),
  }),
  duct('Bile duct', 'Bile duct (common bile duct)', '膽管', {
    course: b('Formed by the union of the common hepatic and cystic ducts; it runs down in the free edge of the lesser omentum, behind the first part of the duodenum and through the head of the pancreas to the duodenum. Only its upper part is shown.', '由總肝管與膽囊管會合而成，沿小網膜游離緣下行，經十二指腸上部後方、穿過胰頭到十二指腸。這裡只顯示上段。'),
    rel: b('In the hepatoduodenal ligament it lies to the right of the hepatic artery proper and in front of the portal vein (the portal triad).', '在肝十二指腸韌帶內位於肝固有動脈右側、肝門靜脈前方（肝門三體）。'),
    fn: b('Carries bile to the hepatopancreatic ampulla and the duodenum.', '把膽汁送到肝胰壺腹與十二指腸。'),
  }),

  // ---- arteries
  art('Abdominal aorta', '腹主動脈', {
    loc: b('The aorta below the diaphragm; only the stretch beside the celiac trunk is shown.', '橫膈以下的主動脈；這裡只顯示腹腔動脈幹旁的一段。'),
    course: b('Its front gives the celiac trunk at the level of T12.', '前壁在第十二胸椎高度發出腹腔動脈幹。'),
    rel: b('The inferior vena cava lies on its right.', '下腔靜脈在它的右側。'),
  }, {opacity: .55}),
  art('Celiac trunk', '腹腔動脈幹', {
    loc: b('A short branch of the front of the aorta below the aortic hiatus.', '主動脈前壁在主動脈裂孔下方發出的短分支。'),
    course: b('It divides into the left gastric, common hepatic and splenic arteries.', '分成左胃動脈、總肝動脈與脾動脈。'),
    fn: b('Supplies the foregut organs, including the liver and gallbladder.', '供應前腸器官，包括肝與膽囊。'),
  }),
  art('Common hepatic artery', '總肝動脈', {
    course: b('Runs to the right along the upper border of the pancreas, gives the gastroduodenal artery and continues as the hepatic artery proper.', '沿胰上緣向右走，發出胃十二指腸動脈後延續為肝固有動脈。'),
    rel: b('The portal vein lies behind it.', '後方是肝門靜脈。'),
    fn: b('Main arterial route to the liver.', '通往肝臟的主要動脈。'),
  }),
  art('Hepatic artery proper', '肝固有動脈', {
    course: b('Ascends in the hepatoduodenal ligament and divides into the right and left hepatic arteries at the porta hepatis; the right gastric artery usually arises from it.', '在肝十二指腸韌帶內上行，於肝門分成左、右肝動脈；右胃動脈通常由它發出。'),
    rel: b('With the bile duct and the portal vein it forms the portal triad; it lies to the left of the bile duct.', '與膽管、肝門靜脈組成肝門三體，位在膽管左側。'),
    fn: b('Brings oxygen-rich blood to the liver and gallbladder.', '把含氧血送到肝與膽囊。'),
  }),
  art('Right hepatic artery', '右肝動脈', {
    course: b('Passes to the right, usually behind the common hepatic duct, through the cystohepatic triangle into the right liver, where it divides into segmental branches.', '向右走，通常經總肝管後方、穿過膽囊三角進入右半肝，再分成各段分支。'),
    rel: b('It gives the cystic artery in the cystohepatic triangle.', '在膽囊三角內發出膽囊動脈。'),
    fn: b('Supplies the right liver and the gallbladder.', '供應右半肝與膽囊。'),
  }),
  art('Left hepatic artery', '左肝動脈', {
    course: b('Passes to the left to the fissure for the round ligament and divides into branches for segments II, III and IV.', '向左走到圓韌帶裂，分出到第 II、III、IV 段的分支。'),
    rel: b('It lies in front of the left branch of the portal vein.', '位在肝門靜脈左支前方。'),
    fn: b('Supplies the left liver, including the quadrate lobe and part of the caudate lobe.', '供應左半肝，包括方形葉與部分尾葉。'),
  }),
  art('Cystic artery', '膽囊動脈', {
    course: b('Usually a branch of the right hepatic artery in the cystohepatic triangle; at the neck of the gallbladder it divides into a superficial branch on the free surface and a deep branch between the gallbladder and the liver. Built here as a schematic tube.', '通常在膽囊三角內由右肝動脈發出；到膽囊頸分成走在游離面的淺支，以及走在膽囊與肝之間的深支。這裡是示意管。'),
    rel: b('Its origin varies; surgeons find it in the cystohepatic triangle before removing the gallbladder.', '起點變異多；切除膽囊時外科醫師在膽囊三角內找它。'),
    fn: b('Supplies the gallbladder and the cystic duct.', '供應膽囊與膽囊管。'),
  }, {schematic: true}),
  art('Gastroduodenal artery', '胃十二指腸動脈', {
    course: b('Leaves the common hepatic artery and runs down behind the first part of the duodenum. Only its start is shown.', '由總肝動脈發出，經十二指腸上部後方下行。這裡只顯示起始段。'),
    rel: b('The bile duct lies to its right.', '膽管在它的右側。'),
    fn: b('Supplies the duodenum, pancreas and greater curvature of the stomach.', '供應十二指腸、胰與胃大彎。'),
  }),

  // ---- veins
  portal('Hepatic portal vein', '肝門靜脈', {
    loc: b('Formed behind the neck of the pancreas by the superior mesenteric and splenic veins; only its upper part, in the hepatoduodenal ligament, is shown.', '在胰頸後方由上腸繫膜靜脈與脾靜脈會合而成；這裡只顯示在肝十二指腸韌帶內的上段。'),
    course: b('It runs up behind the bile duct and hepatic artery proper and divides at the porta hepatis into right and left branches.', '在膽管與肝固有動脈後方上行，於肝門分成左、右支。'),
    fn: b('Carries nutrient-rich blood from the gut, pancreas and spleen to the liver.', '把來自消化道、胰與脾、富含養分的血液送到肝臟。'),
  }),
  portal('Right branch of portal vein', '肝門靜脈右支', {
    course: b('Short and wide; it enters the right liver and divides into anterior and posterior segmental branches. It usually receives the cystic vein.', '短而粗，進入右半肝後分成前、後段分支；通常接收膽囊靜脈。'),
    rel: b('It lies behind the right hepatic duct and artery.', '位在右肝管與右肝動脈後方。'),
    fn: b('Brings portal blood to the right liver.', '把門靜脈血送到右半肝。'),
  }),
  portal('Left branch of portal vein', '肝門靜脈左支', {
    course: b('Longer; it runs to the left along the base of segment IV to the fissure for the round ligament (its umbilical part), giving branches to segments I–IV.', '較長，沿第 IV 段底部向左走到圓韌帶裂（臍部），分支到第 I 至第 IV 段。'),
    rel: b('The round ligament joins its umbilical part and the ligamentum venosum leaves it.', '圓韌帶接到它的臍部，靜脈韌帶由它發出。'),
    fn: b('Brings portal blood to the left liver.', '把門靜脈血送到左半肝。'),
  }),
  portal('Cystic vein', '膽囊靜脈', {
    course: b('Small veins from the gallbladder; those of the deep surface enter the liver directly, the others usually drain into the right branch of the portal vein. Built here as a schematic tube.', '膽囊的細小靜脈；深面的直接進入肝臟，其他通常注入肝門靜脈右支。這裡是示意管。'),
    rel: b('It runs beside the cystic duct and the neck of the gallbladder.', '沿膽囊管與膽囊頸旁走。'),
    fn: b('Drains the gallbladder.', '引流膽囊的靜脈血。'),
  }, {schematic: true}),
  vein('Right hepatic vein', '右肝靜脈', {
    course: b('The largest hepatic vein; it runs between the anterior and posterior segments of the right liver and opens into the inferior vena cava just below the diaphragm.', '最大的肝靜脈，走在右半肝前、後段之間，在橫膈正下方注入下腔靜脈。'),
    rel: b('It marks the right portal fissure between segments V/VIII and VI/VII.', '標記第 V／VIII 段與第 VI／VII 段之間的右門裂。'),
    fn: b('Drains segments V–VIII.', '引流第 V 至第 VIII 段。'),
  }),
  part('Middle hepatic vein', 'Middle (intermediate) hepatic vein', '中肝靜脈', 'veins', VEIN, {
    course: b('Runs in the plane between the right and left liver and joins the left hepatic vein or the inferior vena cava.', '走在左、右半肝之間的平面上，注入左肝靜脈或下腔靜脈。'),
    rel: b('It lies in the main portal fissure, roughly along the line from the gallbladder fossa to the inferior vena cava.', '位在主門裂內，大約沿膽囊窩到下腔靜脈的連線。'),
    fn: b('Drains segment IV and parts of V and VIII.', '引流第 IV 段及第 V、VIII 段的一部分。'),
  }, {quizSystem: 'venous'}),
  vein('Left hepatic vein', '左肝靜脈', {
    course: b('Runs between segments II and III and joins the middle hepatic vein or the inferior vena cava.', '走在第 II、III 段之間，注入中肝靜脈或下腔靜脈。'),
    rel: b('It lies in the left portal fissure.', '位在左門裂內。'),
    fn: b('Drains the left lobe.', '引流肝左葉。'),
  }),
  vein('Inferior vena cava', '下腔靜脈', {
    loc: b('The large vein in a deep groove on the back of the liver, between the bare area and the caudate lobe.', '位在肝後方深溝內、裸區與尾葉之間的大靜脈。'),
    course: b('It receives the hepatic veins just below the diaphragm and passes through the caval opening at T8.', '在橫膈正下方接收肝靜脈，經第八胸椎高度的腔靜脈孔進入胸腔。'),
    rel: b('It is not part of the portal system: the hepatic veins carry blood out of the liver into it.', '不屬於門靜脈系統：肝靜脈把血液從肝送入下腔靜脈。'),
  }, {opacity: .55}),

  // ---- nerves
  part('Right celiac ganglion', 'Right celiac ganglion', '右腹腔神經節', 'nerves', GANGLION, {
    loc: b('Beside the root of the celiac trunk on the right crus of the diaphragm.', '位於腹腔動脈幹根部旁的右橫膈腳上。'),
    rel: b('The greater splanchnic nerve enters it.', '大內臟神經進入此節。'),
    fn: b('Sympathetic relay for the liver and gallbladder; fibres reach them along the hepatic artery.', '肝與膽囊的交感神經中繼站，纖維沿肝動脈到達。'),
  }, {quizSystem: 'nervous', side: 'right'}),
  part('Left celiac ganglion', 'Left celiac ganglion', '左腹腔神經節', 'nerves', GANGLION, {
    loc: b('Beside the root of the celiac trunk on the left crus.', '位於腹腔動脈幹根部旁的左橫膈腳上。'),
    rel: b('Joined to the right ganglion by the celiac plexus.', '以腹腔叢與右側神經節相連。'),
    fn: b('Sympathetic relay for the foregut organs.', '前腸器官的交感神經中繼站。'),
  }, {quizSystem: 'nervous', side: 'left'}),
  part('Hepatic plexus', 'Hepatic plexus', '肝叢', 'nerves', NERVE, {
    loc: b('The part of the celiac plexus that follows the common hepatic artery and the hepatic artery proper to the liver. Built here as schematic strands along the artery.', '腹腔叢沿總肝動脈與肝固有動脈延伸到肝的部分。這裡是沿動脈的示意纖維。'),
    contents: b('Sympathetic fibres from the celiac ganglia and parasympathetic fibres from the vagal trunks (hepatic branch of the anterior trunk).', '來自腹腔神經節的交感纖維，以及來自迷走神經幹（前幹的肝支）的副交感纖維。'),
    fn: b('Supplies the liver, gallbladder and bile ducts; pain fibres from the gallbladder travel with it.', '支配肝、膽囊與膽管；膽囊的痛覺纖維也隨它走。'),
  }, {schematic: true, quizSystem: 'nervous'}),

  // ---- card only
  note('Portal triad', 'Portal triad', '肝門三體', {
    loc: b('The three structures that run together in the free edge of the lesser omentum and in the portal spaces inside the liver: portal vein, hepatic artery and bile duct.', '在小網膜游離緣內，以及肝內門管區中並行的三個結構：肝門靜脈、肝動脈與膽管。'),
    rel: b('In the hepatoduodenal ligament the bile duct is on the right, the artery on the left and the portal vein behind both.', '在肝十二指腸韌帶內，膽管在右、動脈在左、肝門靜脈在兩者後方。'),
    note: b('Squeezing the free edge of the lesser omentum (Pringle manoeuvre) stops blood flowing into the liver during surgery.', '手術時夾住小網膜游離緣（普林格手法）可暫時阻斷進入肝臟的血流。'),
  }),
  note('Calot triangle', "Calot's triangle (cystohepatic triangle)", '膽囊三角（卡洛三角）', {
    loc: b('A small triangle bounded by the cystic duct, the common hepatic duct and the inferior surface of the liver.', '由膽囊管、總肝管與肝下面圍成的小三角形。'),
    contents: b('The cystic artery (usually), often the right hepatic artery, and a cystic lymph node.', '通常有膽囊動脈，常有右肝動脈，以及一個膽囊淋巴結。'),
    note: b('Surgeons display it to identify the cystic artery and duct before cutting them.', '外科醫師切斷膽囊動脈與膽囊管之前，先在這個三角內辨認它們。'),
  }),
  note('Lesser omentum', 'Lesser omentum', '小網膜', {
    loc: b('A double fold of peritoneum from the porta hepatis and the fissure for the ligamentum venosum to the lesser curvature of the stomach and the first part of the duodenum.', '由肝門與靜脈韌帶裂連到胃小彎與十二指腸上部的雙層腹膜皺襞。'),
    contents: b('Its thick right free edge (hepatoduodenal ligament) holds the portal triad; the rest (hepatogastric ligament) holds the gastric vessels.', '右側增厚的游離緣（肝十二指腸韌帶）內有肝門三體；其餘部分（肝胃韌帶）內有胃的血管。'),
    rel: b('It forms the front wall of the upper part of the lesser sac; the omental foramen lies behind its free edge.', '構成網膜囊上部的前壁；網膜孔位在它的游離緣後方。'),
  }),
  note('Hepatoduodenal ligament', 'Hepatoduodenal ligament', '肝十二指腸韌帶', {
    loc: b('The right, thickened free edge of the lesser omentum, between the porta hepatis and the first part of the duodenum.', '小網膜右側增厚的游離緣，介於肝門與十二指腸上部之間。'),
    contents: b('Bile duct, hepatic artery proper and portal vein, with nerves and lymph vessels.', '膽管、肝固有動脈與肝門靜脈，以及神經與淋巴管。'),
    rel: b('It forms the front edge of the omental foramen.', '構成網膜孔的前緣。'),
  }),
  note('Hepatogastric ligament', 'Hepatogastric ligament', '肝胃韌帶', {
    loc: b('The thin part of the lesser omentum between the liver and the lesser curvature of the stomach.', '小網膜中介於肝與胃小彎之間的薄部。'),
    contents: b('The left and right gastric vessels and lymph nodes along the lesser curvature.', '沿胃小彎的左、右胃血管與淋巴結。'),
    rel: b('Behind it lies the lesser sac.', '後方是網膜囊。'),
  }),
  note('Omental foramen', 'Omental foramen (epiploic foramen)', '網膜孔', {
    loc: b('The opening from the greater sac into the lesser sac, behind the free edge of the lesser omentum, at about T12.', '由大腹膜腔通入網膜囊的開口，位在小網膜游離緣後方，約第十二胸椎高度。'),
    rel: b('In front: the hepatoduodenal ligament; behind: the inferior vena cava; above: the caudate lobe; below: the first part of the duodenum.', '前方是肝十二指腸韌帶，後方是下腔靜脈，上方是尾葉，下方是十二指腸上部。'),
    note: b('A finger passed through it lies behind the portal triad.', '手指伸入此孔時，正位於肝門三體的後方。'),
  }),
  note('Hepatorenal recess', "Hepatorenal recess (Morison's pouch)", '肝腎隱窩', {
    loc: b('The deep part of the peritoneal cavity between the visceral surface of the right lobe and the right kidney.', '右葉臟面與右腎之間的腹膜腔深部。'),
    rel: b('It is continuous with the subphrenic space above and the right paracolic gutter below.', '向上與膈下間隙相通，向下與右結腸旁溝相通。'),
    note: b('It is the lowest part of the abdominal cavity when lying on the back, so fluid and pus collect here.', '平躺時是腹腔最低的部位，液體與膿常積在這裡。'),
  }),
  note('Subphrenic recess', 'Subphrenic recess', '膈下隱窩', {
    loc: b('The space between the diaphragm and the diaphragmatic surface of the liver, divided into right and left parts by the falciform ligament.', '橫膈與肝橫膈面之間的間隙，被鐮狀韌帶分成左、右兩部分。'),
    rel: b('Behind it is limited by the coronary and triangular ligaments.', '後方以冠狀韌帶與三角韌帶為界。'),
    note: b('Abscesses can form here after abdominal infection.', '腹腔感染後可在這裡形成膿瘍。'),
  }),
  part('Diaphragmatic surface of liver', 'Diaphragmatic surface of liver', '肝橫膈面', 'marks', '#d9c27a', {
    loc: b('The smooth convex front, upper and right surface that lies under the diaphragm.', '位在橫膈下方、平滑凸起的前面、上面與右面。'),
    rel: b('The falciform ligament attaches to it; the bare area is on its back part.', '鐮狀韌帶附著在這一面；後部有裸區。'),
    note: b('Shown as a coloured area over the lobes when chosen; its border with the visceral surface is schematic.', '選取時在肝葉上整塊著色；與臟面的分界為示意。'),
  }, {mark: zone('Liver', 11, 21, 41), term: true, schematic: true, quizSystem: 'viscera'}),
  part('Visceral surface of liver', 'Visceral surface of liver', '肝臟面', 'marks', '#8fb8d8', {
    loc: b('The lower, back surface that faces the abdominal organs.', '朝向腹腔器官的下後面。'),
    rel: b('It carries the porta hepatis, the gallbladder fossa, the fissures for the round ligament and ligamentum venosum, and the impressions of the neighbouring organs.', '面上有肝門、膽囊窩、圓韌帶裂與靜脈韌帶裂，以及相鄰器官的壓跡。'),
    note: b('Shown as a coloured area over the lobes when chosen; its border with the diaphragmatic surface is schematic.', '選取時在肝葉上整塊著色；與膈面的分界為示意。'),
  }, {mark: zone('Liver', 12, 22, 32, 42), term: true, schematic: true, quizSystem: 'viscera'}),
  note('Couinaud segments', 'Couinaud segments of liver', '肝段', {
    loc: b('Eight functional segments (I–VIII), each with its own portal and arterial branch and bile duct, separated by the hepatic veins.', '八個功能肝段（第 I 至第 VIII 段），各有自己的門靜脈、動脈分支與膽管，以肝靜脈為分界。'),
    rel: b('Right liver V–VIII, left liver II–IV, caudate lobe I; the line from the gallbladder fossa to the inferior vena cava divides right from left.', '右半肝為第 V 至第 VIII 段，左半肝為第 II 至第 IV 段，尾葉為第 I 段；膽囊窩到下腔靜脈的連線分隔左右半肝。'),
    note: b('The liver model here is built from these segments; the lobes are marked over them.', '這裡的肝模型由這些肝段組成，各葉是標示在它們上面。'),
  }),
  note('Hepatic lobule', 'Hepatic lobule', '肝小葉', {
    loc: b('The microscopic hexagonal unit of the liver, about 1 mm across, with a central vein in the middle and portal triads at its corners.', '肝的顯微六角形單位，直徑約 1 公釐，中央有中央靜脈，角上有門三體。'),
    contents: b('Plates of liver cells separated by sinusoids; bile canaliculi run between the cells.', '肝細胞排成肝板，中間以肝竇隙分隔；膽小管走在肝細胞之間。'),
    fn: b('Blood flows from the corners to the central vein while bile flows the other way, to the portal triads.', '血液由角落流向中央靜脈，膽汁則反方向流向門三體。'),
  }),
  note('Hepatic sinusoid', 'Hepatic sinusoid', '肝竇隙', {
    loc: b('Wide, leaky capillaries between the plates of liver cells.', '肝板之間寬大、通透的微血管。'),
    contents: b('Mixed portal and arterial blood; Kupffer cells line them.', '門靜脈血與動脈血混合；管壁有庫佛氏細胞。'),
    fn: b('Allow exchange between the blood and the liver cells; drain to the central vein.', '讓血液與肝細胞交換物質，再流入中央靜脈。'),
  }),
  note('Central vein', 'Central vein of liver lobule', '中央靜脈', {
    loc: b('The small vein in the centre of each hepatic lobule.', '每個肝小葉中央的小靜脈。'),
    course: b('It receives the sinusoids and drains into sublobular veins and then the hepatic veins.', '接收肝竇隙的血液，匯入小葉下靜脈，再進入肝靜脈。'),
    fn: b('First step of blood leaving the liver.', '血液離開肝臟的第一站。'),
  }),
  note('Hepatic plate', 'Hepatic plate', '肝板', {
    loc: b('A sheet one or two cells thick of liver cells, radiating from the central vein.', '由一至兩層肝細胞構成、由中央靜脈向外放射的細胞板。'),
    rel: b('Sinusoids lie on both sides; bile canaliculi run inside it between neighbouring cells.', '兩側是肝竇隙；膽小管走在板內相鄰細胞之間。'),
    fn: b('The working tissue of the liver.', '肝臟執行功能的主要組織。'),
  }),
  note('Bile canaliculi', 'Bile canaliculi', '膽小管', {
    loc: b('Tiny channels between neighbouring liver cells, formed by grooves in their membranes.', '相鄰肝細胞之間、由細胞膜凹溝形成的微小通道。'),
    course: b('They carry bile towards the portal triads, where they open into the bile ductules.', '把膽汁送往門三體，在那裡接入小膽管。'),
    fn: b('The first part of the biliary tree.', '膽道系統的起點。'),
  }),
  note('Portal-systemic anastomoses', 'Portal-systemic anastomoses', '門體吻合', {
    loc: b('Places where portal tributaries meet systemic veins: lower oesophagus, around the umbilicus (paraumbilical veins), lower rectum and the bare area of the liver and retroperitoneum.', '門靜脈屬支與體循環靜脈相接處：食道下段、臍周（臍旁靜脈）、直腸下段，以及肝裸區與腹膜後。'),
    fn: b('In portal hypertension blood bypasses the liver through them.', '門靜脈高壓時，血液經這些吻合繞過肝臟。'),
    note: b('They can enlarge into oesophageal varices, caput medusae and haemorrhoids.', '可擴張成食道靜脈曲張、海蛇頭與痔。'),
  }),

  // ---- related muscle and neighbouring organs
  part('Diaphragm', 'Diaphragm', '橫膈', 'muscles', '#b8695c', {
    loc: b('The dome-shaped muscle above the liver; only the part around the liver is shown, see-through.', '肝上方的圓頂狀肌；這裡只顯示肝周圍的部分，呈半透明。'),
    rel: b('The bare area of the liver lies directly on it; the coronary and triangular ligaments attach the liver to it.', '肝裸區直接貼著它；冠狀韌帶與三角韌帶把肝固定在它上面。'),
    nerve: b('Phrenic nerves (C3–C5).', '膈神經（C3–C5）。'),
  }, {opacity: .15, quiz: false}),
  part('Stomach', 'Stomach', '胃', 'context', '#d9a79b', {
    loc: b('Below the left lobe of the liver.', '位在肝左葉下方。'),
    rel: b('It leaves a gastric impression on the visceral surface of the left lobe; the lesser omentum joins them.', '在左葉臟面留下胃壓跡；兩者以小網膜相連。'),
    fn: b('Stores and churns food.', '暫存並攪拌食物。'),
  }, {opacity: .3, quiz: false}),
  part('Duodenum', 'Duodenum (upper part)', '十二指腸（上段）', 'context', '#d9b48f', {
    loc: b('Below the quadrate lobe and the gallbladder.', '位在方形葉與膽囊下方。'),
    rel: b('The bile duct passes behind its first part.', '膽管經它的第一部後方。'),
    fn: b('Receives bile from the bile duct.', '接收由膽管送來的膽汁。'),
  }, {opacity: .4, quiz: false}),
  part('Right kidney', 'Right kidney', '右腎', 'context', '#a35a4a', {
    loc: b('Behind and below the right lobe.', '位在右葉的後下方。'),
    rel: b('It leaves a renal impression on the right lobe; the hepatorenal recess lies between them.', '在右葉留下腎壓跡；兩者之間是肝腎隱窩。'),
    fn: b('Filters the blood and makes urine.', '過濾血液、產生尿液。'),
  }, {opacity: .35, quiz: false, side: 'right'}),
];

export const LIVER_GALLBLADDER: OrganDef = {
  id: 'liver-gallbladder', zh: '肝、膽囊與膽道', en: 'Liver, gallbladder and biliary tract', manifest: 'models/organ/liver-gallbladder/liver-gallbladder.json',
  groups, parts, coreGroups: ['organs', 'zones', 'marks'], zonesDefault: true, glassGroups: ['organs'],
  presets: [
    {id: 'organ', en: 'Organ', zh: '器官', show: ['organs', 'zones', 'marks', 'ligaments', 'ducts', 'context', 'muscles', 'cardonly'], zones: true},
    {id: 'arteries', en: 'Arteries', zh: '動脈', show: ['arteries'], ghost: ['organs']},
    {id: 'veins', en: 'Veins', zh: '靜脈', show: ['veins'], ghost: ['organs']},
    {id: 'nerves', en: 'Nerves', zh: '神經', show: ['nerves'], ghost: ['organs']},
    {id: 'overview', en: 'Overview', zh: '全部', show: ['organs', 'marks', 'ligaments', 'ducts', 'arteries', 'veins', 'nerves', 'context', 'muscles', 'cardonly'], glass: true, zones: false},
  ],
  peelNote: '由外而內：神經 → 靜脈 → 動脈 → 相鄰器官與相關肌肉 → 膽管與韌帶 → 肝門、裸區與腹膜附著的標示 → 肝葉與膽囊各部顏色 → 器官本身。',
  scope: [
    '肝由圖譜的各肝段拼合而成，段與段之間可見細縫；肝右葉、左葉、方形葉、尾葉，以及膽囊底、體、頸，都是標示在同一個模型表面上的位置，邊界為示意。',
    '肝門、裸區、冠狀韌帶、左右三角韌帶與鐮狀韌帶是標示在肝表面上的位置（韌帶標示附著處）；肝圓韌帶、靜脈韌帶、膽囊動脈、膽囊靜脈與肝叢是依一般描述畫成的示意索或示意管。',
    '總肝管與膽管在圖譜中是同一件模型，這裡在膽囊管會合處分開。肝的膈面與臟面在選取時整塊著色。肝門三體、膽囊三角、小網膜與其韌帶、網膜孔、肝腎隱窩、膈下隱窩、肝段與顯微構造只有資訊卡。',
  ],
};
