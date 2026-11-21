import type {OrganCard, OrganDef, OrganGroupDef, OrganPartDef} from '../organ-types';

/**
 * Duodenum, pancreas and spleen detail mode. Meshes come from scripts/organ-atlas/duodenum-pancreas-spleen.mjs: the organs, ducts, vessels and ganglia are copied from the atlas and the
 * project's nerve models; the parts of each organ are marked on its surface; the hepatopancreatic ampulla, accessory pancreatic duct, supraduodenal artery, suspensory muscle of the
 * duodenum and the celiac and superior mesenteric plexuses are schematic. Card text is written for this site from public anatomical descriptions.
 */
const groups: OrganGroupDef[] = [
  {id: 'organs', en: 'Duodenum, pancreas and spleen (whole organs)', zh: '十二指腸、胰與脾（整體）', layer: 7, on: true},
  {id: 'zones', en: 'Parts and surfaces', zh: '各部分與各面', layer: 6, on: true},
  {id: 'marks', en: 'Papillae, flexure and hilum', zh: '乳突、彎曲與脾門', layer: 5, on: true},
  {id: 'ducts', en: 'Bile and pancreatic ducts', zh: '膽管與胰管', layer: 4, on: true},
  {id: 'nerves', en: 'Nerves', zh: '神經', layer: 0, on: false},
  {id: 'veins', en: 'Veins and portal tributaries', zh: '靜脈（含門靜脈屬支）', layer: 1, on: false},
  {id: 'arteries', en: 'Arteries', zh: '動脈', layer: 2, on: false},
  {id: 'lymph', en: 'Lymph nodes (card only)', zh: '淋巴結（只有資訊卡）', layer: -1, on: true},
  {id: 'peritoneum', en: 'Peritoneal ligaments (card only)', zh: '腹膜韌帶（只有資訊卡）', layer: -1, on: true},
  {id: 'muscles', en: 'Related muscles and ligaments', zh: '相關肌肉與韌帶', layer: 3, on: true},
  {id: 'context', en: 'Neighbouring organs', zh: '相鄰器官', layer: 3, on: true},
];

const ART = '#c4413a', VEIN = '#3f66b0', PORTAL = '#5b4fb0', NERVE = '#d4a600', GANGLION = '#b88a00', DUCT = '#4f9a5a';
const b = (en: string, zh: string) => ({en, zh});
type Extra = Partial<OrganPartDef>;
const part = (key: string, en: string, zh: string, group: string, color: string, card: OrganCard, extra: Extra = {}): OrganPartDef => ({key, en, zh, group, color, card, ...extra});
const art = (key: string, zh: string, card: OrganCard, extra: Extra = {}) => part(key, key, zh, 'arteries', ART, card, {quizSystem: 'arterial', ...extra});
const vein = (key: string, zh: string, card: OrganCard, extra: Extra = {}) => part(key, key, zh, 'veins', VEIN, card, {quizSystem: 'venous', ...extra});
const portal = (key: string, zh: string, card: OrganCard, extra: Extra = {}) => part(key, key, zh, 'veins', PORTAL, card, {quizSystem: 'venous', ...extra});
const nerve = (key: string, zh: string, card: OrganCard, extra: Extra = {}) => part(key, key, zh, 'nerves', NERVE, card, {quizSystem: 'nervous', ...extra});
const zone = (host: string, v: number) => ({host, channel: 'zone' as const, values: [v]});
const line = (host: string, v: number) => ({host, channel: 'line' as const, values: [v]});

const parts: OrganPartDef[] = [
  // ---- the three organs
  part('Duodenum', 'Duodenum', '十二指腸', 'organs', '#d9b48f', {
    loc: b('The first and shortest part of the small intestine, about 25 cm long. It curves in a C shape around the head of the pancreas, from the pylorus to the duodenojejunal flexure, at the level of L1–L3.', '小腸最前、最短的一段，長約 25 公分，呈 C 字形環繞胰頭，從幽門到十二指腸空腸彎曲，約在第一至第三腰椎高度。'),
    rel: b('Apart from its first 2–3 cm it is retroperitoneal, fixed to the back wall over the right kidney, inferior vena cava and aorta. The superior mesenteric vessels cross in front of its inferior part.', '除了開頭約二至三公分外都在腹膜後，固定在右腎、下腔靜脈與主動脈前方的後腹壁上；上腸繫膜動靜脈從它的下部前方越過。'),
    blood: b('Above the papilla from the celiac trunk (supraduodenal and superior pancreaticoduodenal arteries); below it from the superior mesenteric artery (inferior pancreaticoduodenal arteries). Veins drain to the portal system.', '乳突以上由腹腔動脈幹供應（上十二指腸動脈、上胰十二指腸動脈）；以下由上腸繫膜動脈供應（下胰十二指腸動脈）。靜脈回流到門靜脈系統。'),
    nerve: b('Vagus nerves (parasympathetic) and sympathetic fibres through the celiac and superior mesenteric plexuses.', '迷走神經（副交感）與經腹腔叢、上腸繫膜叢而來的交感纖維。'),
    fn: b('It receives chyme from the stomach together with bile and pancreatic juice, neutralises the acid and begins most of chemical digestion.', '接收胃送來的食糜，以及膽汁與胰液，中和胃酸並開始大部分的化學消化。'),
    links: ['Superior part of duodenum', 'Descending part of duodenum', 'Inferior part of duodenum', 'Ascending part of duodenum', 'Major duodenal papilla'],
  }),
  part('Pancreas', 'Pancreas', '胰臟', 'organs', '#e2c27a', {
    loc: b('A soft, lobulated gland about 15 cm long lying across the posterior abdominal wall at about L1–L2, from the curve of the duodenum on the right to the hilum of the spleen on the left.', '柔軟、呈小葉狀的腺體，長約 15 公分，約在第一至第二腰椎高度橫過後腹壁，右端在十二指腸彎內，左端到脾門。'),
    rel: b('Retroperitoneal, behind the stomach and the lesser sac. The splenic artery runs along its upper border and the splenic vein behind it; the superior mesenteric vessels pass behind its neck.', '位於腹膜後，在胃與網膜囊的後方。脾動脈沿上緣走，脾靜脈在它的後方；上腸繫膜動靜脈從胰頸後方經過。'),
    blood: b('The head from the superior and inferior pancreaticoduodenal arteries; the neck, body and tail from pancreatic branches of the splenic artery (dorsal, greater, caudal and inferior pancreatic arteries).', '胰頭由上、下胰十二指腸動脈供應；胰頸、胰體、胰尾由脾動脈的胰支供應（背胰動脈、大胰動脈、胰尾動脈與下胰動脈）。'),
    nerve: b('Vagal and sympathetic fibres from the celiac and superior mesenteric plexuses; pain is felt in the epigastrium and often goes through to the back.', '由腹腔叢與上腸繫膜叢而來的迷走與交感纖維；胰臟的痛多感覺在上腹，並常穿到背部。'),
    fn: b('Exocrine: digestive enzymes and bicarbonate through the pancreatic ducts into the duodenum. Endocrine: the pancreatic islets (islets of Langerhans), scattered in the gland and most numerous in the tail, release insulin and glucagon into the blood.', '外分泌：消化酵素與碳酸氫鹽經胰管進入十二指腸。內分泌：散布在腺體內、以胰尾最多的胰島（蘭氏小島）把胰島素與升糖素分泌到血液。'),
    links: ['Head of pancreas', 'Uncinate process of pancreas', 'Neck of pancreas', 'Body of pancreas', 'Tail of pancreas', 'Main pancreatic duct'],
  }),
  part('Spleen', 'Spleen', '脾臟', 'organs', '#9a5a6c', {
    loc: b('A soft, very vascular organ in the left hypochondrium, under the diaphragm and against the 9th to 11th ribs, its long axis along the 10th rib. It is about the size of a fist.', '位於左季肋區、柔軟而血管豐富的器官，在橫膈下方、貼著第九至第十一肋，長軸順著第十肋，大小約如拳頭。'),
    rel: b('It is wrapped in peritoneum and held by the gastrosplenic and splenorenal ligaments. Its visceral surface touches the stomach, left kidney and left colic flexure; the tail of the pancreas reaches its hilum.', '被腹膜包覆，以胃脾韌帶與脾腎韌帶固定。臟面與胃、左腎、左結腸彎相貼；胰尾伸到脾門。'),
    blood: b('The splenic artery, whose branches enter at the hilum; the splenic vein leaves the hilum and joins the superior mesenteric vein behind the neck of the pancreas to form the portal vein.', '脾動脈的分支經脾門進入；脾靜脈由脾門出來，在胰頸後方與上腸繫膜靜脈會合成肝門靜脈。'),
    nerve: b('Sympathetic fibres of the celiac plexus that travel along the splenic artery.', '腹腔叢的交感纖維沿脾動脈到達。'),
    fn: b('It filters the blood, removes old red cells and platelets, and makes antibodies and lymphocytes. It is easily torn when the left lower ribs are broken.', '過濾血液，清除衰老的紅血球與血小板，並產生抗體與淋巴球。左下肋骨骨折時容易撕裂。'),
    links: ['Hilum of spleen', 'Gastric surface of spleen', 'Renal surface of spleen', 'Colic surface of spleen', 'Splenic artery', 'Splenic vein'],
  }),

  // ---- parts of the duodenum
  part('Superior part of duodenum', 'Superior part of duodenum (duodenal cap)', '十二指腸上部（十二指腸壺腹）', 'zones', '#f0c24f', {
    loc: b('The first part, about 5 cm long, running from the pylorus to the right, backward and slightly upward at the level of L1. Its first 2–3 cm, the duodenal cap, is mobile and covered by peritoneum.', '第一部，長約 5 公分，從幽門向右、向後並稍向上走，約在第一腰椎高度。開頭二至三公分稱十二指腸壺腹，可活動且有腹膜覆蓋。'),
    rel: b('Above it the hepatoduodenal ligament and the neck of the gallbladder; behind it the gastroduodenal artery, bile duct and portal vein; in front of it the gallbladder and the quadrate lobe of the liver.', '上方是肝十二指腸韌帶與膽囊頸；後方有胃十二指腸動脈、膽管與肝門靜脈；前方是膽囊與肝方葉。'),
    blood: b('Supraduodenal artery and branches of the gastroduodenal and right gastro-omental arteries.', '上十二指腸動脈，以及胃十二指腸動脈與右胃網膜動脈的分支。'),
    note: b('Most duodenal ulcers lie here; one on the back wall can erode the gastroduodenal artery.', '十二指腸潰瘍多發生在這一部；後壁的潰瘍可能侵蝕胃十二指腸動脈。'),
  }, {mark: zone('Duodenum', 1), schematic: true, quizSystem: 'viscera'}),
  part('Descending part of duodenum', 'Descending part of duodenum', '十二指腸降部', 'zones', '#7fbf7f', {
    loc: b('The second part, about 8 cm long, running down on the right of the vertebral column from L1 to L3, curving round the head of the pancreas.', '第二部，長約 8 公分，在脊柱右側從第一腰椎下行到第三腰椎，環繞胰頭。'),
    rel: b('Behind it the right kidney and renal hilum; medially the head of the pancreas; in front the transverse colon crosses it. The bile duct and main pancreatic duct open on its posteromedial wall.', '後方是右腎與腎門；內側是胰頭；前方有橫結腸越過。膽管與主胰管開口在它的後內側壁。'),
    blood: b('Superior and inferior pancreaticoduodenal arteries, which meet in arcades in front of and behind the head of the pancreas.', '上、下胰十二指腸動脈，兩者在胰頭前後形成動脈弓相接。'),
    fn: b('Bile and pancreatic juice enter here, at the major and minor duodenal papillae.', '膽汁與胰液在這一部經大、小十二指腸乳突進入。'),
  }, {mark: zone('Duodenum', 2), schematic: true, quizSystem: 'viscera'}),
  part('Inferior part of duodenum', 'Inferior (horizontal) part of duodenum', '十二指腸下部（水平部）', 'zones', '#6aa9d8', {
    loc: b('The third part, about 10 cm long, crossing from right to left at the level of L3.', '第三部，長約 10 公分，在第三腰椎高度由右向左橫過。'),
    rel: b('Behind it the right ureter, inferior vena cava and aorta; in front of it the superior mesenteric artery and vein and the root of the mesentery. It lies in the angle between the aorta and the superior mesenteric artery.', '後方有右輸尿管、下腔靜脈與主動脈；前方有上腸繫膜動靜脈與小腸繫膜根。它位在主動脈與上腸繫膜動脈之間的夾角內。'),
    blood: b('Inferior pancreaticoduodenal arteries from the superior mesenteric artery.', '來自上腸繫膜動脈的下胰十二指腸動脈。'),
    note: b('If the angle between the aorta and the superior mesenteric artery is narrow, this part can be compressed between them.', '主動脈與上腸繫膜動脈之間的夾角過窄時，這一部可能被兩者夾住壓迫。'),
  }, {mark: zone('Duodenum', 3), schematic: true, quizSystem: 'viscera'}),
  part('Ascending part of duodenum', 'Ascending part of duodenum', '十二指腸升部', 'zones', '#b48fd0', {
    loc: b('The fourth and shortest part, about 2.5 cm long, rising on the left of the aorta to the lower border of the pancreas at L2, where it turns forward as the duodenojejunal flexure.', '第四部，最短，長約 2.5 公分，在主動脈左側上升到第二腰椎高度的胰下緣，向前轉成十二指腸空腸彎曲。'),
    rel: b('Left of it the left kidney and left psoas major; above it the body of the pancreas. The suspensory muscle of the duodenum holds its upper end.', '左側是左腎與左腰大肌；上方是胰體。上端由十二指腸懸肌固定。'),
    blood: b('Inferior pancreaticoduodenal arteries and the first jejunal arteries.', '下胰十二指腸動脈與最上方的空腸動脈。'),
  }, {mark: zone('Duodenum', 4), schematic: true, quizSystem: 'viscera'}),
  part('Major duodenal papilla', 'Major duodenal papilla', '大十二指腸乳突', 'marks', '#2f3437', {
    loc: b('A small mound on the posteromedial wall of the descending part, about 7–10 cm from the pylorus. Its marking here is on the outer wall at the same place; the papilla itself lies inside.', '十二指腸降部後內側壁上的小隆起，距幽門約 7 至 10 公分。這裡把標示畫在同一位置的外壁上，乳突本身在腸腔內面。'),
    course: b('The hepatopancreatic ampulla, formed by the bile duct and the main pancreatic duct, opens at its tip; the sphincter of the ampulla surrounds it.', '由膽管與主胰管會合成的肝胰壺腹開口在它的頂端，周圍有肝胰壺腹括約肌。'),
    fn: b('Bile and pancreatic juice enter the duodenum here; it marks the boundary between foregut and midgut, and thus between the celiac and superior mesenteric arterial territories.', '膽汁與胰液在這裡進入十二指腸；這裡也是前腸與中腸的分界，即腹腔動脈幹與上腸繫膜動脈供應範圍的分界。'),
  }, {mark: line('Duodenum', 1), schematic: true, quizSystem: 'viscera'}),
  part('Minor duodenal papilla', 'Minor duodenal papilla', '小十二指腸乳突', 'marks', '#5a5f64', {
    loc: b('A smaller mound about 2 cm above and slightly in front of the major papilla, on the medial wall of the descending part. Marked on the outer wall at the same place.', '在大乳突上方約 2 公分、稍偏前的較小隆起，位於十二指腸降部內側壁；標示畫在同一位置的外壁上。'),
    course: b('The accessory pancreatic duct opens here.', '副胰管開口在這裡。'),
    fn: b('It drains part of the head of the pancreas; it is the main outlet when the two pancreatic ducts did not fuse (pancreas divisum).', '引流部分胰頭；若兩條胰管在發育時沒有融合（胰管分裂），這裡就是主要出口。'),
  }, {mark: line('Duodenum', 2), schematic: true, quizSystem: 'viscera'}),
  part('Duodenojejunal flexure', 'Duodenojejunal flexure', '十二指腸空腸彎曲', 'marks', '#3d6e8f', {
    loc: b('The sharp bend where the ascending part of the duodenum turns forward into the jejunum, at the level of L2, just left of the midline and below the body of the pancreas. Marked here as the stretch of gut at the bend.', '十二指腸升部向前急轉、接續空腸處，約在第二腰椎高度、正中線稍左、胰體下方。這裡標示轉彎處的那一段腸管。'),
    rel: b('It is held up by the suspensory muscle (ligament) of the duodenum; the paraduodenal recesses lie beside it.', '由十二指腸懸肌（懸韌帶）向上吊住；旁邊有十二指腸旁窩。'),
    note: b('Surgeons find the start of the jejunum by following the suspensory ligament to this flexure.', '外科醫師常沿著懸韌帶找到這個彎曲，以確認空腸的起點。'),
  }, {mark: line('Duodenum', 3), schematic: true, quizSystem: 'viscera'}),

  // ---- parts of the pancreas
  part('Head of pancreas', 'Head of pancreas', '胰頭', 'zones', '#f0a35a', {
    loc: b('The widest part, lying in the C-shaped curve of the duodenum, to the right of the superior mesenteric vessels.', '最寬的一段，位在十二指腸的 C 形彎內、上腸繫膜動靜脈的右側。'),
    rel: b('Behind it the inferior vena cava, right renal vein and the bile duct (in a groove or tunnel in the back of the head); in front the transverse colon and the gastroduodenal artery.', '後方有下腔靜脈、右腎靜脈，以及走在胰頭後面溝或隧道內的膽管；前方有橫結腸與胃十二指腸動脈。'),
    blood: b('Anterior and posterior arcades of the superior and inferior pancreaticoduodenal arteries.', '上、下胰十二指腸動脈形成的前後動脈弓。'),
    note: b('A tumour of the head can press on the bile duct and cause painless jaundice.', '胰頭腫瘤可壓迫膽管，造成無痛性黃疸。'),
  }, {mark: zone('Pancreas', 1), schematic: true, quizSystem: 'viscera'}),
  part('Uncinate process of pancreas', 'Uncinate process of pancreas', '胰鉤突', 'zones', '#c97b3f', {
    loc: b('A hook-like extension of the lower left part of the head that passes to the left behind the superior mesenteric vein (and often the artery).', '胰頭左下部延伸出的鉤狀突起，向左伸到上腸繫膜靜脈（常連同動脈）的後方。'),
    rel: b('In front of it the superior mesenteric vessels; behind it the aorta and inferior vena cava.', '前方是上腸繫膜動靜脈；後方是主動脈與下腔靜脈。'),
    blood: b('Inferior pancreaticoduodenal arteries.', '下胰十二指腸動脈。'),
  }, {mark: zone('Pancreas', 2), schematic: true, quizSystem: 'viscera'}),
  part('Neck of pancreas', 'Neck of pancreas', '胰頸', 'zones', '#e8d05a', {
    loc: b('The short narrow part joining head and body, about 2 cm wide, lying in front of the superior mesenteric vein and the start of the portal vein.', '連接胰頭與胰體的短窄部分，寬約 2 公分，位於上腸繫膜靜脈與肝門靜脈起點的前方。'),
    rel: b('Behind it the splenic and superior mesenteric veins join to form the portal vein; in front of it the pylorus, separated by the lesser sac. The gastroduodenal artery runs down in front of its right side.', '後方是脾靜脈與上腸繫膜靜脈會合成肝門靜脈之處；前方隔著網膜囊與幽門相對。胃十二指腸動脈在它的右前方下行。'),
    blood: b('Dorsal pancreatic artery and the pancreaticoduodenal arteries.', '背胰動脈與胰十二指腸動脈。'),
  }, {mark: zone('Pancreas', 3), schematic: true, quizSystem: 'viscera'}),
  part('Body of pancreas', 'Body of pancreas', '胰體', 'zones', '#d9b85c', {
    loc: b('The longest part, running to the left across the aorta and the left kidney, slightly upward, from the neck to the tail.', '最長的一段，從胰頸向左稍向上，越過主動脈與左腎前方，延伸到胰尾。'),
    rel: b('In front the stomach, with the lesser sac between them; behind it the aorta, superior mesenteric artery, left suprarenal gland, left kidney and the splenic vein; the splenic artery runs along its upper border.', '前方隔著網膜囊與胃相對；後方有主動脈、上腸繫膜動脈、左腎上腺、左腎與脾靜脈；脾動脈沿它的上緣走。'),
    blood: b('Pancreatic branches of the splenic artery: dorsal, greater and inferior pancreatic arteries.', '脾動脈的胰支：背胰動脈、大胰動脈與下胰動脈。'),
  }, {mark: zone('Pancreas', 4), schematic: true, quizSystem: 'viscera'}),
  part('Tail of pancreas', 'Tail of pancreas', '胰尾', 'zones', '#b0a050', {
    loc: b('The narrow left end, which runs forward in the splenorenal ligament with the splenic vessels and reaches the hilum of the spleen. Here the last 25 mm towards the spleen are marked as the tail.', '狹窄的左端，與脾血管一起走在脾腎韌帶內，向前伸到脾門。這裡把朝向脾的最後約 25 公釐標示為胰尾。'),
    rel: b('Close to the splenic hilum and the left colic flexure; it can be injured when the spleen is removed.', '靠近脾門與左結腸彎；切除脾臟時可能受傷。'),
    blood: b('Caudal pancreatic arteries and other pancreatic branches of the splenic artery.', '胰尾動脈與脾動脈的其他胰支。'),
    fn: b('The pancreatic islets are most numerous in the tail.', '胰島以胰尾最為密集。'),
  }, {mark: zone('Pancreas', 5), schematic: true, quizSystem: 'viscera'}),

  // ---- surfaces and hilum of the spleen
  part('Diaphragmatic surface of spleen', 'Diaphragmatic surface of spleen', '脾膈面', 'zones', '#c49aa8', {
    loc: b('The smooth, convex outer surface that lies against the diaphragm, which separates it from the pleura, the lung and the 9th to 11th ribs.', '貼著橫膈、平滑凸起的外側面；隔著橫膈與胸膜、肺及第九至第十一肋相鄰。'),
    note: b('Pain from the spleen or blood under the diaphragm may be felt at the tip of the left shoulder (phrenic nerve, C3–C5).', '脾或橫膈下方的出血引起的痛，可轉移到左肩尖（膈神經，C3–C5）。'),
  }, {mark: zone('Spleen', 1), schematic: true, quizSystem: 'viscera'}),
  part('Gastric surface of spleen', 'Gastric surface of spleen', '脾胃面', 'zones', '#d47f8f', {
    loc: b('The concave front part of the visceral surface, above and in front of the hilum, facing the back of the stomach. Here it is the part of the spleen that faces the stomach.', '臟面前部的凹面，在脾門的前上方，朝向胃的後壁。這裡標示的是脾臟面向胃的部分。'),
    rel: b('The gastrosplenic ligament, with the short gastric and left gastro-omental vessels, runs from here to the greater curvature.', '帶著短胃血管與左胃網膜血管的胃脾韌帶，從這裡連到胃大彎。'),
  }, {mark: zone('Spleen', 2), schematic: true, quizSystem: 'viscera'}),
  part('Renal surface of spleen', 'Renal surface of spleen', '脾腎面', 'zones', '#8f6aa0', {
    loc: b('The back part of the visceral surface, behind the hilum, lying against the upper part of the left kidney and the left suprarenal gland. Here it is the part of the spleen that faces the left kidney.', '臟面後部，在脾門後方，貼著左腎上部與左腎上腺。這裡標示的是脾臟面向左腎的部分。'),
    rel: b('The splenorenal ligament, with the splenic vessels and the tail of the pancreas, runs from near here to the front of the left kidney.', '帶著脾血管與胰尾的脾腎韌帶，從這附近連到左腎前面。'),
  }, {mark: zone('Spleen', 3), schematic: true, quizSystem: 'viscera'}),
  part('Colic surface of spleen', 'Colic surface of spleen', '脾結腸面', 'zones', '#b07a5a', {
    loc: b('The small flat area at the lower front end of the visceral surface, resting on the left colic flexure. Here it is the part of the spleen that faces the colon.', '臟面前下端的小平面，靠在左結腸彎上。這裡標示的是脾臟面向結腸的部分。'),
    rel: b('The splenocolic and phrenicocolic ligaments lie below it.', '下方有脾結腸韌帶與膈結腸韌帶。'),
  }, {mark: zone('Spleen', 4), schematic: true, quizSystem: 'viscera'}),
  part('Hilum of spleen', 'Hilum of spleen (splenic hilum)', '脾門', 'marks', '#2f3437', {
    loc: b('A long slit on the visceral surface, between the gastric and renal surfaces, where the splenic vessels and nerves enter and leave. Marked here around the end of the splenic artery and vein.', '臟面上胃面與腎面之間的長裂隙，脾血管與神經由此出入。這裡標示在脾動脈與脾靜脈末端周圍。'),
    contents: b('Branches of the splenic artery, tributaries of the splenic vein, lymph vessels and the splenic plexus; the tail of the pancreas usually reaches it.', '脾動脈的分支、脾靜脈的屬支、淋巴管與脾神經叢；胰尾通常伸到這裡。'),
  }, {mark: line('Spleen', 1), schematic: true, quizSystem: 'viscera'}),

  // ---- ducts
  part('Bile duct', 'Bile duct (common bile duct)', '膽管', 'ducts', DUCT, {
    course: b('Formed by the union of the common hepatic and cystic ducts. It runs down in the free edge of the lesser omentum, behind the first part of the duodenum, then in a groove on the back of the head of the pancreas, to the descending part of the duodenum, about 7 cm in all.', '由總肝管與膽囊管會合而成，先在小網膜游離緣內下行，經十二指腸上部後方，再走在胰頭背面的溝內，到達十二指腸降部，全長約 7 公分。'),
    rel: b('In the hepatoduodenal ligament it lies to the right of the hepatic artery proper and in front of the portal vein.', '在肝十二指腸韌帶內，位於肝固有動脈右側、肝門靜脈前方。'),
    fn: b('It joins the main pancreatic duct to form the hepatopancreatic ampulla, which opens at the major duodenal papilla.', '與主胰管會合成肝胰壺腹，開口於大十二指腸乳突。'),
    note: b('In the atlas model the common hepatic duct and the bile duct are one piece; it is split here where the cystic duct joins.', '圖譜模型中總肝管與膽管是同一件，這裡在膽囊管會合處分開。'),
  }, {quizSystem: 'viscera'}),
  part('Common hepatic duct', 'Common hepatic duct', '總肝管', 'ducts', DUCT, {
    course: b('Formed at the porta hepatis by the right and left hepatic ducts; it runs down about 3 cm and is joined from the right by the cystic duct.', '在肝門由左、右肝管會合而成，向下走約 3 公分，在右側與膽囊管會合。'),
    fn: b('Carries bile from the liver.', '把肝臟分泌的膽汁送出。'),
  }, {quizSystem: 'viscera'}),
  part('Cystic duct', 'Cystic duct', '膽囊管', 'ducts', DUCT, {
    course: b('About 3–4 cm long, from the neck of the gallbladder to the common hepatic duct; its lining forms a spiral fold.', '長約 3 至 4 公分，由膽囊頸連到總肝管；黏膜形成螺旋襞。'),
    fn: b('Carries bile into the gallbladder for storage and out again when the gallbladder contracts after a meal.', '把膽汁送進膽囊儲存，進食後膽囊收縮時再送出。'),
  }, {quizSystem: 'viscera'}),
  part('Main pancreatic duct', 'Main pancreatic duct', '主胰管', 'ducts', '#3f8f70', {
    course: b('Runs the length of the gland from the tail through the body and neck, receiving small ducts on the way, then turns down in the head to join the bile duct.', '從胰尾經胰體、胰頸貫穿全長，沿途接收許多小導管，在胰頭轉向下與膽管會合。'),
    fn: b('Carries pancreatic juice to the hepatopancreatic ampulla and the major duodenal papilla.', '把胰液送到肝胰壺腹與大十二指腸乳突。'),
  }, {quizSystem: 'viscera'}),
  part('Accessory pancreatic duct', 'Accessory pancreatic duct', '副胰管', 'ducts', '#3f8f70', {
    course: b('Drains the upper front part of the head; it leaves the main duct in the head and opens at the minor duodenal papilla about 2 cm above the major one. Built here as a schematic tube.', '引流胰頭的前上部；由胰頭內的主胰管分出，開口於大乳突上方約 2 公分的小十二指腸乳突。這裡是示意管。'),
  }, {schematic: true, quizSystem: 'viscera'}),
  part('Hepatopancreatic ampulla', 'Hepatopancreatic ampulla (ampulla of Vater)', '肝胰壺腹', 'ducts', '#2e7a4f', {
    course: b('The short dilated channel formed where the bile duct and the main pancreatic duct unite in the wall of the descending part of the duodenum; it opens at the tip of the major duodenal papilla. Built here as a schematic tube.', '膽管與主胰管在十二指腸降部壁內會合形成的短而膨大的通道，開口於大十二指腸乳突頂端。這裡是示意管。'),
    rel: b('It is surrounded by the sphincter of the ampulla (sphincter of Oddi).', '周圍有肝胰壺腹括約肌（歐迪氏括約肌）。'),
    note: b('A gallstone stuck here can block both bile and pancreatic juice, causing jaundice and pancreatitis.', '膽結石卡在這裡可同時阻塞膽汁與胰液，引起黃疸與胰臟炎。'),
  }, {schematic: true, quizSystem: 'viscera'}),
  part('Sphincter of ampulla', 'Sphincter of ampulla (sphincter of Oddi)', '肝胰壺腹括約肌', 'ducts', '#2e7a4f', {
    loc: b('A ring of smooth muscle around the hepatopancreatic ampulla and the ends of the bile and pancreatic ducts, in the wall of the duodenum.', '在十二指腸壁內、環繞肝胰壺腹以及膽管與胰管末端的一圈平滑肌。'),
    fn: b('It controls the flow of bile and pancreatic juice into the duodenum and stops duodenal contents from going back up the ducts; when it is closed, bile backs up into the gallbladder.', '控制膽汁與胰液流入十二指腸，並防止十二指腸內容物逆流入管；關閉時膽汁回流儲存在膽囊。'),
  }, {cardOnly: true, quizSystem: 'viscera'}),

  // ---- arteries
  art('Abdominal aorta', '腹主動脈', {
    loc: b('The aorta below the diaphragm, from the aortic hiatus at T12 down the front of the lumbar vertebrae, slightly left of the midline. Only the stretch beside the pancreas is shown.', '橫膈以下的主動脈，由第十二胸椎的主動脈裂孔沿腰椎前方、正中線稍左下行。這裡只顯示胰臟旁的一段。'),
    course: b('Its front gives the celiac trunk at T12 and the superior mesenteric artery at L1; the left renal vein and the inferior part of the duodenum cross in front of it below that.', '前壁在第十二胸椎發出腹腔動脈幹，在第一腰椎發出上腸繫膜動脈；其下方有左腎靜脈與十二指腸下部從前面越過。'),
  }, {opacity: .55}),
  art('Celiac trunk', '腹腔動脈幹', {
    loc: b('A short, wide branch of the front of the aorta just below the aortic hiatus (T12), above the upper border of the pancreas.', '主動脈前壁在主動脈裂孔正下方（第十二胸椎）發出的短而粗的分支，位在胰上緣的上方。'),
    course: b('After 1–2 cm it divides into the left gastric, common hepatic and splenic arteries.', '走一至二公分後分成左胃動脈、總肝動脈與脾動脈。'),
    fn: b('It supplies the foregut organs: stomach, the duodenum down to the major papilla, liver, gallbladder, pancreas (with the superior mesenteric artery) and spleen.', '供應前腸器官：胃、大乳突以上的十二指腸、肝、膽囊、胰（與上腸繫膜動脈共同）及脾。'),
  }),
  art('Left gastric artery', '左胃動脈', {
    course: b('The smallest branch of the celiac trunk; it rises to the cardia and runs along the lesser curvature of the stomach. Only its start is shown here.', '腹腔動脈幹最小的分支，上行到賁門再沿胃小彎走。這裡只顯示它的起始段。'),
  }),
  art('Common hepatic artery', '總肝動脈', {
    course: b('Runs to the right along the upper border of the head of the pancreas, gives off the gastroduodenal artery, and continues as the hepatic artery proper.', '沿胰頭上緣向右走，發出胃十二指腸動脈後，延續為肝固有動脈。'),
    rel: b('The portal vein lies behind it; the celiac plexus follows it.', '後方是肝門靜脈；腹腔叢的纖維沿它分布。'),
  }),
  art('Hepatic artery proper', '肝固有動脈', {
    course: b('The continuation of the common hepatic artery, ascending in the hepatoduodenal ligament to the porta hepatis. Only its start is shown here.', '總肝動脈的延續，在肝十二指腸韌帶內上行到肝門。這裡只顯示起始段。'),
    rel: b('With the bile duct and portal vein it forms the portal triad.', '與膽管、肝門靜脈組成肝門三體。'),
  }),
  art('Gastroduodenal artery', '胃十二指腸動脈', {
    course: b('From the common hepatic artery it passes down behind the first part of the duodenum and divides into the right gastro-omental and anterior superior pancreaticoduodenal arteries; the posterior superior pancreaticoduodenal and supraduodenal arteries arise from it higher up.', '由總肝動脈發出，經十二指腸上部後方下行，分成右胃網膜動脈與前上胰十二指腸動脈；後上胰十二指腸動脈與上十二指腸動脈在較高處由它發出。'),
    rel: b('In front of the neck of the pancreas; the bile duct lies to its right.', '位在胰頸前方；膽管在它的右側。'),
  }),
  art('Supraduodenal artery', '上十二指腸動脈', {
    course: b('A small, variable branch, usually of the gastroduodenal artery, that runs to the upper border of the superior part of the duodenum. Built here as a schematic tube.', '細小而變異多的分支，通常由胃十二指腸動脈發出，走到十二指腸上部的上緣。這裡是示意管。'),
    fn: b('Supplies the upper part of the duodenal cap.', '供應十二指腸壺腹的上部。'),
  }, {schematic: true}),
  art('Right gastro-omental artery', '右胃網膜動脈', {
    course: b('One terminal branch of the gastroduodenal artery; it runs to the left along the greater curvature of the stomach in the greater omentum.', '胃十二指腸動脈的終支之一，在大網膜內沿胃大彎向左走。'),
  }),
  art('Anterior superior pancreaticoduodenal artery', '前上胰十二指腸動脈', {
    course: b('From the end of the gastroduodenal artery it descends on the front of the head of the pancreas and joins the anterior inferior pancreaticoduodenal artery in an arcade.', '由胃十二指腸動脈末端發出，沿胰頭前面下行，與前下胰十二指腸動脈形成動脈弓。'),
    fn: b('Supplies the head of the pancreas and the descending part of the duodenum.', '供應胰頭與十二指腸降部。'),
  }),
  art('Superior pancreaticoduodenal artery', '上胰十二指腸動脈', {
    course: b('The superior pancreaticoduodenal supply from the gastroduodenal artery comes as two vessels, the anterior and the posterior superior pancreaticoduodenal arteries, shown here separately.', '由胃十二指腸動脈而來的上胰十二指腸動脈分成前、後兩條，即前上與後上胰十二指腸動脈，這裡分開顯示。'),
    fn: b('Together they supply the upper head of the pancreas and the duodenum down to the papilla.', '兩者共同供應胰頭上部與乳突以上的十二指腸。'),
    links: ['Anterior superior pancreaticoduodenal artery', 'Posterior superior pancreaticoduodenal artery'],
  }, {cardOnly: true}),
  art('Posterior superior pancreaticoduodenal artery', '後上胰十二指腸動脈', {
    course: b('Arises higher on the gastroduodenal artery, crosses behind the bile duct and descends on the back of the head of the pancreas to join the posterior inferior artery.', '在較高處由胃十二指腸動脈發出，越過膽管後方，沿胰頭背面下行，與後下胰十二指腸動脈相接。'),
    fn: b('Supplies the back of the head of the pancreas and the duodenum, and the lower bile duct.', '供應胰頭背面、十二指腸與膽管下段。'),
  }),
  art('Superior mesenteric artery', '上腸繫膜動脈', {
    loc: b('Arises from the front of the aorta at L1, about 1 cm below the celiac trunk, behind the neck of the pancreas. Only its upper part is shown.', '在第一腰椎、腹腔動脈幹下方約 1 公分處由主動脈前壁發出，位在胰頸後方。這裡只顯示上段。'),
    course: b('It runs down in front of the uncinate process and the inferior part of the duodenum into the root of the mesentery. Its first branch is the inferior pancreaticoduodenal artery.', '向下經胰鉤突與十二指腸下部前方進入小腸繫膜根。第一條分支是下胰十二指腸動脈。'),
    rel: b('The left renal vein passes between it and the aorta; the superior mesenteric vein lies on its right.', '左腎靜脈從它與主動脈之間穿過；上腸繫膜靜脈在它的右側。'),
    fn: b('It supplies the midgut: the duodenum below the major papilla, jejunum, ileum, caecum, appendix, ascending colon and most of the transverse colon.', '供應中腸：大乳突以下的十二指腸、空腸、迴腸、盲腸、闌尾、升結腸與大部分橫結腸。'),
  }),
  art('Inferior pancreaticoduodenal artery', '下胰十二指腸動脈', {
    course: b('The first branch of the superior mesenteric artery, at the upper border of the inferior part of the duodenum; it divides into anterior and posterior branches that run up the head of the pancreas.', '上腸繫膜動脈的第一條分支，在十二指腸下部上緣發出，分成前、後支沿胰頭上行。'),
  }),
  art('Anterior inferior pancreaticoduodenal artery', '前下胰十二指腸動脈', {
    course: b('Runs up on the front of the head of the pancreas to join the anterior superior pancreaticoduodenal artery.', '沿胰頭前面上行，與前上胰十二指腸動脈相接。'),
    fn: b('With its partner it links the celiac and superior mesenteric territories, a route around a blockage of either.', '與上方的動脈一起把腹腔動脈幹與上腸繫膜動脈的供應範圍連起來，任一條阻塞時可作為繞道。'),
  }),
  art('Posterior inferior pancreaticoduodenal artery', '後下胰十二指腸動脈', {
    course: b('Runs up on the back of the head of the pancreas to join the posterior superior pancreaticoduodenal artery.', '沿胰頭背面上行，與後上胰十二指腸動脈相接。'),
  }),
  art('Splenic artery', '脾動脈', {
    course: b('The largest branch of the celiac trunk; it winds to the left along the upper border of the pancreas, behind the stomach, and divides at the hilum of the spleen.', '腹腔動脈幹最大的分支，沿胰上緣、在胃後方迂曲向左走，在脾門分支。'),
    fn: b('Supplies the spleen, the neck, body and tail of the pancreas, and through its gastric branches part of the stomach.', '供應脾、胰頸、胰體與胰尾，並以胃支供應部分的胃。'),
  }),
  art('Dorsal pancreatic artery', '背胰動脈', {
    course: b('Usually from the start of the splenic artery (sometimes the celiac trunk or superior mesenteric artery); it runs down behind the neck of the pancreas and gives a right branch to the head and a left branch, the inferior pancreatic artery.', '通常由脾動脈起始處發出（有時由腹腔動脈幹或上腸繫膜動脈），沿胰頸後方下行，分出到胰頭的右支，以及成為下胰動脈的左支。'),
  }),
  art('Greater pancreatic artery', '大胰動脈', {
    course: b('The largest pancreatic branch of the splenic artery; it enters the body of the pancreas at about its junction with the tail and runs along the pancreatic duct.', '脾動脈最大的胰支，約在胰體與胰尾交界處進入胰臟，沿胰管走。'),
  }),
  art('Caudal pancreatic artery', '胰尾動脈', {
    course: b('Small branches of the end of the splenic artery (or its hilar branches) to the tail of the pancreas.', '由脾動脈末端（或其脾門分支）發出、到胰尾的小分支。'),
  }),
  art('Inferior pancreatic artery', '下胰動脈', {
    course: b('The left branch of the dorsal pancreatic artery; it runs to the left along the lower border of the body and tail of the pancreas.', '背胰動脈的左支，沿胰體與胰尾的下緣向左走。'),
  }),

  // ---- veins
  portal('Hepatic portal vein', '肝門靜脈', {
    loc: b('Formed behind the neck of the pancreas, at about L2, by the union of the superior mesenteric and splenic veins. Only its start is shown.', '在胰頸後方、約第二腰椎高度，由上腸繫膜靜脈與脾靜脈會合而成。這裡只顯示起始段。'),
    course: b('It runs up behind the first part of the duodenum into the hepatoduodenal ligament, behind the bile duct and hepatic artery proper, to the porta hepatis.', '向上經十二指腸上部後方進入肝十二指腸韌帶，在膽管與肝固有動脈的後方到達肝門。'),
    fn: b('It carries blood from the gut, pancreas and spleen to the liver.', '把消化道、胰與脾的血液送到肝臟。'),
  }),
  portal('Splenic vein', '脾靜脈', {
    course: b('Leaves the hilum of the spleen, runs to the right in a groove on the back of the pancreas, below the splenic artery, and joins the superior mesenteric vein behind the neck of the pancreas.', '由脾門出來，在脾動脈下方、沿胰臟背面的溝向右走，在胰頸後方與上腸繫膜靜脈會合。'),
    rel: b('It receives the inferior mesenteric vein and many small pancreatic veins.', '途中接收下腸繫膜靜脈與許多細小的胰靜脈。'),
  }),
  portal('Superior mesenteric vein', '上腸繫膜靜脈', {
    course: b('Runs up on the right of the superior mesenteric artery, in front of the uncinate process and the inferior part of the duodenum, and ends behind the neck of the pancreas by joining the splenic vein.', '在上腸繫膜動脈右側上行，經胰鉤突與十二指腸下部前方，在胰頸後方與脾靜脈會合而終。'),
    rel: b('It receives the right gastro-omental and pancreaticoduodenal veins.', '接收右胃網膜靜脈與胰十二指腸靜脈。'),
  }),
  portal('Inferior mesenteric vein', '下腸繫膜靜脈', {
    course: b('Comes up from the left colon, left of the duodenojejunal flexure, and usually ends in the splenic vein behind the body of the pancreas. Only its upper part is shown.', '由左側結腸上行，經十二指腸空腸彎曲左側，通常在胰體後方注入脾靜脈。這裡只顯示上段。'),
  }),
  portal('Right gastro-omental vein', '右胃網膜靜脈', {
    course: b('Accompanies the right gastro-omental artery along the greater curvature and drains into the superior mesenteric vein.', '伴隨右胃網膜動脈沿胃大彎走，注入上腸繫膜靜脈。'),
  }),
  portal('Anterior pancreaticoduodenal vein', '前胰十二指腸靜脈', {
    course: b('Veins on the front of the head of the pancreas that follow the anterior arterial arcade and drain into the superior mesenteric vein.', '在胰頭前面、伴隨前動脈弓的靜脈，注入上腸繫膜靜脈。'),
  }),
  portal('Posterior superior pancreaticoduodenal vein', '後上胰十二指腸靜脈', {
    course: b('Runs up on the back of the head of the pancreas and drains directly into the portal vein.', '沿胰頭背面上行，直接注入肝門靜脈。'),
  }),
  portal('Inferior pancreaticoduodenal vein', '下胰十二指腸靜脈', {
    course: b('Drains the lower head of the pancreas and the duodenum into the superior mesenteric vein (or a jejunal vein).', '引流胰頭下部與十二指腸，注入上腸繫膜靜脈（或空腸靜脈）。'),
  }),
  vein('Inferior vena cava', '下腔靜脈', {
    loc: b('The large vein on the right of the aorta, behind the head of the pancreas and the inferior part of the duodenum. It is not part of the portal system.', '位在主動脈右側、胰頭與十二指腸下部後方的大靜脈，不屬於門靜脈系統。'),
  }, {opacity: .55}),

  // ---- nerves
  part('Right celiac ganglion', 'Right celiac ganglion', '右腹腔神經節', 'nerves', GANGLION, {
    loc: b('An irregular mass on the right crus of the diaphragm beside the root of the celiac trunk.', '位於腹腔動脈幹根部旁、右橫膈腳上的不規則團塊。'),
    fn: b('Sympathetic relay: fibres of the greater splanchnic nerve synapse here and go on to the foregut organs along the arteries.', '交感神經的中繼站：大內臟神經的纖維在這裡換元，再沿動脈分布到前腸器官。'),
  }, {quizSystem: 'nervous', side: 'right'}),
  part('Left celiac ganglion', 'Left celiac ganglion', '左腹腔神經節', 'nerves', GANGLION, {
    loc: b('On the left crus of the diaphragm beside the root of the celiac trunk, joined to the right ganglion by the celiac plexus.', '位於腹腔動脈幹根部旁的左橫膈腳上，以腹腔叢與右側神經節相連。'),
    fn: b('Sympathetic relay for the stomach, liver, pancreas and spleen.', '胃、肝、胰與脾的交感神經中繼站。'),
  }, {quizSystem: 'nervous', side: 'left'}),
  part('Right superior mesenteric ganglion', 'Right superior mesenteric ganglion', '右上腸繫膜神經節', 'nerves', GANGLION, {
    loc: b('Beside the root of the superior mesenteric artery, below the celiac ganglion and often continuous with it.', '位在上腸繫膜動脈根部旁、腹腔神經節下方，常與之相連。'),
    fn: b('Sympathetic relay for the midgut organs: fibres reach them along the superior mesenteric artery.', '中腸器官的交感神經中繼站，纖維沿上腸繫膜動脈分布。'),
  }, {quizSystem: 'nervous', side: 'right'}),
  part('Left superior mesenteric ganglion', 'Left superior mesenteric ganglion', '左上腸繫膜神經節', 'nerves', GANGLION, {
    loc: b('On the left of the root of the superior mesenteric artery.', '位在上腸繫膜動脈根部左側。'),
    fn: b('Sympathetic relay for the midgut organs.', '中腸器官的交感神經中繼站。'),
  }, {quizSystem: 'nervous', side: 'left'}),
  nerve('Celiac plexus', '腹腔叢', {
    loc: b('A dense network around the root of the celiac trunk, joining the two celiac ganglia; it continues along the branches of the trunk. Built here as schematic strands.', '環繞腹腔動脈幹根部、連接兩側腹腔神經節的密集神經網，並沿動脈幹的分支延伸。這裡是示意纖維。'),
    contents: b('Sympathetic fibres from the greater and lesser splanchnic nerves and parasympathetic fibres from the vagal trunks (mainly the posterior one).', '來自大、小內臟神經的交感纖維，以及來自迷走神經幹（主要是後幹）的副交感纖維。'),
  }, {schematic: true}),
  nerve('Superior mesenteric plexus', '上腸繫膜叢', {
    loc: b('The continuation of the celiac plexus around the superior mesenteric artery, containing the superior mesenteric ganglia. Built here as schematic strands along the start of the artery.', '腹腔叢延續到上腸繫膜動脈周圍的神經叢，內含上腸繫膜神經節。這裡是沿動脈起始段的示意纖維。'),
    fn: b('Its fibres follow the branches of the artery to the midgut: the lower duodenum, the small intestine and the right colon.', '纖維沿動脈分支分布到中腸：十二指腸下段、小腸與右側結腸。'),
  }, {schematic: true}),
  nerve('Right greater splanchnic nerve', '右大內臟神經', {
    course: b('Preganglionic sympathetic fibres from the T5–T9 ganglia; it pierces the right crus of the diaphragm and ends in the celiac ganglion.', '來自第五至第九胸交感神經節的節前交感纖維，穿過右橫膈腳，終止於腹腔神經節。'),
  }, {side: 'right'}),
  nerve('Left greater splanchnic nerve', '左大內臟神經', {
    course: b('Preganglionic sympathetic fibres from the T5–T9 ganglia; it pierces the left crus and ends in the left celiac ganglion.', '來自第五至第九胸交感神經節的節前交感纖維，穿過左橫膈腳，終止於左腹腔神經節。'),
  }, {side: 'left'}),
  nerve('Right lesser splanchnic nerve', '右小內臟神經', {
    course: b('Preganglionic fibres from T10–T11; it pierces the crus and ends in the aorticorenal and superior mesenteric ganglia.', '來自第十至第十一胸節的節前纖維，穿過橫膈腳，終止於主動脈腎神經節與上腸繫膜神經節。'),
  }, {side: 'right'}),
  nerve('Left lesser splanchnic nerve', '左小內臟神經', {
    course: b('Preganglionic fibres from T10–T11 to the aorticorenal and superior mesenteric ganglia.', '來自第十至第十一胸節的節前纖維，到主動脈腎神經節與上腸繫膜神經節。'),
  }, {side: 'left'}),
  nerve('Posterior vagal trunk', '後迷走神經幹', {
    course: b('Formed mainly from the right vagus nerve on the back of the oesophagus; below the hiatus it sends a large celiac branch to the celiac plexus. Only the part near the plexus is shown.', '主要由右迷走神經在食道後面形成；穿過裂孔後發出粗大的腹腔支到腹腔叢。這裡只顯示接近神經叢的一段。'),
    fn: b('Parasympathetic supply of the pancreas, small intestine and proximal colon through the plexuses.', '經各神經叢提供胰、小腸與近側結腸的副交感神經支配。'),
  }),

  // ---- lymph and peritoneal ligaments (card only)
  part('Celiac nodes', 'Celiac nodes', '腹腔淋巴結', 'lymph', '#9fb8a0', {
    loc: b('Around the root of the celiac trunk.', '位在腹腔動脈幹根部周圍。'),
    course: b('They receive lymph from the nodes along the branches of the trunk (including the pancreaticosplenic and pancreaticoduodenal nodes) and drain into the intestinal trunk and the cisterna chyli.', '接收沿動脈幹分支分布的淋巴結（包括胰脾淋巴結、胰十二指腸淋巴結）的淋巴，再注入腸幹與乳糜池。'),
  }, {cardOnly: true, quizSystem: 'viscera'}),
  part('Superior mesenteric nodes', 'Superior mesenteric nodes', '上腸繫膜淋巴結', 'lymph', '#9fb8a0', {
    loc: b('Around the root of the superior mesenteric artery.', '位在上腸繫膜動脈根部周圍。'),
    course: b('They collect lymph from the midgut, including the lower head of the pancreas and the lower duodenum, and drain into the intestinal trunk.', '收集中腸（包括胰頭下部與十二指腸下段）的淋巴，注入腸幹。'),
  }, {cardOnly: true, quizSystem: 'viscera'}),
  part('Gastrosplenic ligament', 'Gastrosplenic ligament', '胃脾韌帶', 'peritoneum', '#c9c0a0', {
    course: b('A double fold of peritoneum from the greater curvature of the stomach to the hilum of the spleen, part of the greater omentum.', '由胃大彎連到脾門的雙層腹膜皺襞，屬於大網膜的一部分。'),
    contents: b('The short gastric vessels and the left gastro-omental vessels.', '短胃血管與左胃網膜血管。'),
  }, {cardOnly: true, quizSystem: 'viscera'}),
  part('Splenorenal ligament', 'Splenorenal (lienorenal) ligament', '脾腎韌帶', 'peritoneum', '#c9c0a0', {
    course: b('A double fold of peritoneum from the hilum of the spleen to the front of the left kidney.', '由脾門連到左腎前面的雙層腹膜皺襞。'),
    contents: b('The splenic artery and vein and the tail of the pancreas.', '脾動脈、脾靜脈與胰尾。'),
  }, {cardOnly: true, quizSystem: 'viscera'}),

  // ---- related muscle and ligament
  part('Suspensory muscle of duodenum', 'Suspensory ligament of duodenum (ligament of Treitz)', '十二指腸懸韌帶（屈氏韌帶）', 'muscles', '#b8695c', {
    course: b('A slender band of fibrous tissue and smooth muscle from the right crus of the diaphragm, beside the celiac trunk, down behind the pancreas and splenic vein to the duodenojejunal flexure. Built here as a schematic band.', '由腹腔動脈幹旁的右橫膈腳發出、含纖維與平滑肌的細帶，經胰臟與脾靜脈後方下行，到十二指腸空腸彎曲。這裡是示意帶。'),
    fn: b('It holds up the duodenojejunal flexure and is thought to widen the angle there, helping contents to pass on into the jejunum.', '吊住十二指腸空腸彎曲，並被認為能加大該處的角度，幫助內容物進入空腸。'),
    note: b('It marks the boundary between the upper and lower gastrointestinal tract for bleeding.', '是臨床上區分上、下消化道出血的界線。'),
  }, {schematic: true, quizSystem: 'viscera'}),
  part('Diaphragm', 'Diaphragm (crura)', '橫膈（橫膈腳）', 'muscles', '#b8695c', {
    loc: b('Only the crura and the parts next to the aorta are shown: the tendinous legs that anchor the diaphragm to the upper lumbar vertebrae.', '這裡只顯示橫膈腳與主動脈旁的部分，即把橫膈固定在上腰椎的腱性腳。'),
    rel: b('The aorta passes behind the median arcuate ligament between the crura; the celiac ganglia lie on the crura, and the suspensory muscle of the duodenum arises from the right crus.', '主動脈在兩側橫膈腳之間的正中弓狀韌帶後方通過；腹腔神經節位在橫膈腳上，十二指腸懸肌由右橫膈腳發出。'),
    nerve: b('Phrenic nerves (C3–C5).', '膈神經（C3–C5）。'),
  }, {opacity: .3, quiz: false}),

  // ---- neighbouring organs (context, not asked)
  part('Stomach', 'Stomach', '胃', 'context', '#d9a79b', {
    rel: b('It lies in front of the pancreas, separated by the lesser sac; the pylorus continues into the superior part of the duodenum.', '位於胰臟前方，中間隔著網膜囊；幽門接續十二指腸上部。'),
  }, {opacity: .25, quiz: false}),
  part('Gallbladder', 'Gallbladder', '膽囊', 'context', '#7fae6a', {
    rel: b('Its neck lies just above the superior part of the duodenum; the cystic duct leaves it.', '膽囊頸就在十二指腸上部的上方；膽囊管由此發出。'),
  }, {opacity: .45, quiz: false}),
  part('Left kidney', 'Left kidney', '左腎', 'context', '#a35a4a', {
    rel: b('Behind the body and tail of the pancreas and the renal surface of the spleen.', '位於胰體、胰尾與脾腎面的後方。'),
  }, {opacity: .35, quiz: false, side: 'left'}),
  part('Right kidney', 'Right kidney', '右腎', 'context', '#a35a4a', {
    rel: b('Behind the descending part of the duodenum.', '位於十二指腸降部的後方。'),
  }, {opacity: .35, quiz: false, side: 'right'}),
  part('Jejunum', 'Jejunum', '空腸', 'context', '#e0b2a0', {
    rel: b('Continues from the duodenojejunal flexure.', '由十二指腸空腸彎曲接續。'),
  }, {opacity: .45, quiz: false}),
  part('Transverse colon', 'Transverse colon', '橫結腸', 'context', '#c9a07f', {
    rel: b('Its left end, the left colic flexure, lies against the colic surface of the spleen.', '左端的左結腸彎靠在脾結腸面上。'),
  }, {opacity: .35, quiz: false}),
];

// ---- aorticorenal ganglia (the lesser splanchnic nerves end in them)
parts.splice(parts.findIndex(p => p.key === 'Celiac plexus'), 0,
  part('Right aorticorenal ganglion', 'Right aorticorenal ganglion', '右主動脈腎神經節', 'nerves', GANGLION, {
    loc: b('The lower, partly separate part of the celiac ganglion, at the origin of the renal artery.', '腹腔神經節下部、部分分開的一團，位在腎動脈起點處。'),
    rel: b('The lesser splanchnic nerve ends in it; the superior mesenteric ganglion lies just in front.', '小內臟神經終止於此；上腸繫膜神經節就在它的前方。'),
    fn: b('Sympathetic relay for the kidney and the renal plexus.', '腎臟與腎神經叢的交感神經中繼站。'),
  }, {quizSystem: 'nervous', side: 'right'}),
  part('Left aorticorenal ganglion', 'Left aorticorenal ganglion', '左主動脈腎神經節', 'nerves', GANGLION, {
    loc: b('The lower part of the left celiac ganglion, at the origin of the left renal artery.', '左腹腔神經節的下部，位在左腎動脈起點處。'),
    rel: b('The left lesser splanchnic nerve ends in it.', '左小內臟神經終止於此。'),
    fn: b('Sympathetic relay for the left kidney.', '左腎的交感神經中繼站。'),
  }, {quizSystem: 'nervous', side: 'left'}),
);

/** Further card fields (each card has at least three). */
const MORE: Record<string, OrganCard> = {
  'Diaphragmatic surface of spleen': {rel: b('It faces up, back and to the left, following the curve of the diaphragm; the costodiaphragmatic recess of the pleura lies above it.', '朝向上、後、左，順著橫膈的弧度；上方有胸膜的肋膈隱窩。')},
  'Gastric surface of spleen': {note: b('It is the largest of the visceral impressions and is concave where the stomach presses on it.', '是臟面上最大的壓跡，被胃壓成凹面。')},
  'Renal surface of spleen': {note: b('It is flatter than the gastric surface and lies behind the hilum.', '比胃面平坦，位在脾門後方。')},
  'Colic surface of spleen': {note: b('It is often small and may join the gastric surface.', '通常很小，可能與胃面相連。')},
  'Hilum of spleen': {rel: b('It lies between the gastric and renal surfaces; the gastrosplenic and splenorenal ligaments attach along its edges.', '位在胃面與腎面之間；胃脾韌帶與脾腎韌帶附著在它的兩緣。')},
  'Common hepatic duct': {rel: b('It lies in the free edge of the lesser omentum, to the right of the hepatic artery proper and in front of the portal vein.', '位在小網膜游離緣內，肝固有動脈右側、肝門靜脈前方。')},
  'Cystic duct': {rel: b('It lies in the hepatoduodenal ligament; with the common hepatic duct and the liver it bounds the cystohepatic triangle, where the cystic artery is found.', '位在肝十二指腸韌帶內；與總肝管及肝圍成膽囊三角，膽囊動脈就在三角內。')},
  'Main pancreatic duct': {rel: b('It lies nearer the back than the front of the gland; in the head it runs beside the bile duct.', '走在腺體中偏背側；在胰頭內與膽管並行。')},
  'Accessory pancreatic duct': {fn: b('A second outlet for pancreatic juice from the upper head.', '胰頭上部胰液的第二個出口。'), note: b('It usually still connects with the main duct; in some people it is closed at its duodenal end.', '通常仍與主胰管相通；有些人的十二指腸端是閉鎖的。')},
  'Sphincter of ampulla': {nerve: b('Relaxed by the hormone cholecystokinin after a meal; also supplied by autonomic fibres.', '進食後由膽囊收縮素使它放鬆；也有自主神經分布。')},
  'Abdominal aorta': {rel: b('The crura of the diaphragm and the celiac ganglia lie beside it; the inferior vena cava is on its right.', '兩側有橫膈腳與腹腔神經節；下腔靜脈在它的右側。')},
  'Left gastric artery': {rel: b('It lies in the left gastropancreatic fold, then in the lesser omentum.', '先走在左胃胰皺襞內，再進入小網膜。'), fn: b('Supplies the lesser curvature and the lower oesophagus.', '供應胃小彎與食道下段。')},
  'Common hepatic artery': {fn: b('Supplies the liver, gallbladder, duodenum, head of the pancreas and part of the stomach through its branches.', '經由分支供應肝、膽囊、十二指腸、胰頭與部分的胃。')},
  'Hepatic artery proper': {fn: b('Carries arterial blood to the liver and gallbladder; the right gastric artery usually arises from it.', '把動脈血送到肝與膽囊；右胃動脈通常由它發出。')},
  'Gastroduodenal artery': {fn: b('Supplies the duodenum, the head of the pancreas and the greater curvature of the stomach.', '供應十二指腸、胰頭與胃大彎。')},
  'Supraduodenal artery': {rel: b('It runs above the duodenal cap, close to the bile duct and the portal vein.', '走在十二指腸壺腹上方，靠近膽管與肝門靜脈。')},
  'Right gastro-omental artery': {rel: b('It passes below the pylorus, between the layers of the greater omentum.', '從幽門下方經過，走在大網膜兩層之間。'), fn: b('Supplies the lower part of the greater curvature and the greater omentum; it meets the left gastro-omental artery.', '供應胃大彎下部與大網膜，並與左胃網膜動脈吻合。')},
  'Anterior superior pancreaticoduodenal artery': {rel: b('It lies in the groove between the head of the pancreas and the descending part of the duodenum, on the front.', '走在胰頭與十二指腸降部之間溝的前面。')},
  'Superior pancreaticoduodenal artery': {rel: b('Both lie in the groove between the head of the pancreas and the duodenum, one in front and one behind.', '兩者都走在胰頭與十二指腸之間的溝內，一在前、一在後。')},
  'Posterior superior pancreaticoduodenal artery': {rel: b('It spirals round the bile duct, first in front of it and then behind it.', '環繞膽管走，先在膽管前方再轉到後方。')},
  'Inferior pancreaticoduodenal artery': {rel: b('It lies behind the superior mesenteric vein, at the upper border of the inferior part of the duodenum.', '位在上腸繫膜靜脈後方、十二指腸下部上緣。'), fn: b('Supplies the lower head of the pancreas, the uncinate process and the duodenum below the papilla.', '供應胰頭下部、胰鉤突與乳突以下的十二指腸。')},
  'Anterior inferior pancreaticoduodenal artery': {rel: b('It lies on the front of the head, in the groove next to the duodenum.', '走在胰頭前面、靠十二指腸的溝內。')},
  'Posterior inferior pancreaticoduodenal artery': {rel: b('It lies on the back of the head, close to the bile duct.', '走在胰頭背面，靠近膽管。'), fn: b('Supplies the back of the head of the pancreas and the duodenum.', '供應胰頭背面與十二指腸。')},
  'Splenic artery': {rel: b('The splenic vein runs below and behind it; it often loops above the upper border of the pancreas.', '脾靜脈在它的下後方並行；它常在胰上緣上方繞成彎曲。')},
  'Dorsal pancreatic artery': {rel: b('It lies behind the neck of the pancreas, next to the splenic and superior mesenteric veins.', '位在胰頸後方，靠近脾靜脈與上腸繫膜靜脈。'), fn: b('Supplies the neck and body of the pancreas.', '供應胰頸與胰體。')},
  'Greater pancreatic artery': {rel: b('It enters the gland from above, from the splenic artery on its upper border.', '由胰上緣的脾動脈從上方進入腺體。'), fn: b('Supplies the body and tail of the pancreas.', '供應胰體與胰尾。')},
  'Caudal pancreatic artery': {rel: b('They reach the tail in the splenorenal ligament, close to the splenic hilum.', '在脾腎韌帶內、靠近脾門處到達胰尾。'), fn: b('Supply the tail of the pancreas.', '負責供應胰尾的血液。')},
  'Inferior pancreatic artery': {rel: b('It lies along the lower border of the gland, where it may join the caudal and greater pancreatic arteries.', '沿腺體下緣走，可與胰尾動脈、大胰動脈相接。'), fn: b('Supplies the lower part of the body and tail.', '供應胰體與胰尾的下部。')},
  'Splenic vein': {fn: b('Drains the spleen, the body and tail of the pancreas and, through the inferior mesenteric vein, the left colon.', '引流脾、胰體與胰尾，並經下腸繫膜靜脈引流左側結腸。')},
  'Superior mesenteric vein': {fn: b('Drains the midgut: small intestine, caecum, ascending and transverse colon, and the head of the pancreas.', '引流中腸：小腸、盲腸、升結腸與橫結腸，以及胰頭。')},
  'Inferior mesenteric vein': {rel: b('It runs to the left of the duodenojejunal flexure, beside the paraduodenal fold.', '走在十二指腸空腸彎曲左側、十二指腸旁皺襞旁。'), fn: b('Drains the descending and sigmoid colon and the upper rectum.', '引流降結腸、乙狀結腸與直腸上部。')},
  'Right gastro-omental vein': {rel: b('It passes below the pylorus to reach the superior mesenteric vein in front of the head of the pancreas.', '經幽門下方，在胰頭前面注入上腸繫膜靜脈。'), fn: b('Drains the lower greater curvature and the greater omentum.', '引流胃大彎下部與大網膜。')},
  'Anterior pancreaticoduodenal vein': {rel: b('It lies on the front of the head of the pancreas, beside the anterior arterial arcade.', '位在胰頭前面，靠著前動脈弓。'), fn: b('Drains the front of the head of the pancreas and the duodenum.', '引流胰頭前面與十二指腸。')},
  'Posterior superior pancreaticoduodenal vein': {rel: b('It passes behind the bile duct to reach the portal vein.', '經膽管後方到達肝門靜脈。'), fn: b('Drains the back of the head of the pancreas and the upper duodenum.', '引流胰頭背面與十二指腸上段。')},
  'Inferior pancreaticoduodenal vein': {rel: b('It lies near the lower border of the head of the pancreas, beside the inferior pancreaticoduodenal artery.', '位在胰頭下緣附近，伴隨下胰十二指腸動脈。'), fn: b('Drains the lower head of the pancreas and the duodenum below the papilla.', '引流胰頭下部與乳突以下的十二指腸。')},
  'Inferior vena cava': {course: b('It is formed at L5 by the two common iliac veins and runs up on the right of the aorta to the diaphragm.', '在第五腰椎由兩條髂總靜脈會合而成，在主動脈右側上行到橫膈。'), rel: b('The head of the pancreas, the bile duct and the descending and inferior parts of the duodenum lie in front of it.', '前方有胰頭、膽管，以及十二指腸降部與下部。')},
  'Right celiac ganglion': {rel: b('The greater splanchnic nerve enters it from above; the inferior vena cava lies in front of it.', '大內臟神經由上方進入；前方有下腔靜脈。')},
  'Left celiac ganglion': {rel: b('The left greater splanchnic nerve enters it; the splenic artery lies above.', '左大內臟神經進入；上方有脾動脈。')},
  'Right superior mesenteric ganglion': {rel: b('It lies on the front of the aorta beside the superior mesenteric artery, above the left renal vein.', '位在主動脈前面、上腸繫膜動脈旁，左腎靜脈上方。')},
  'Left superior mesenteric ganglion': {rel: b('It lies on the front of the aorta beside the superior mesenteric artery.', '位在主動脈前面、上腸繫膜動脈旁。')},
  'Celiac plexus': {fn: b('Its branches follow the arteries to the foregut organs, carrying both sympathetic and parasympathetic fibres, as well as pain fibres.', '分支沿動脈分布到前腸器官，帶有交感、副交感與痛覺纖維。')},
  'Superior mesenteric plexus': {contents: b('Sympathetic fibres from the lesser and least splanchnic nerves, synapsing in the superior mesenteric ganglia, and vagal parasympathetic fibres.', '來自小、最小內臟神經並在上腸繫膜神經節換元的交感纖維，以及迷走神經的副交感纖維。')},
  'Right greater splanchnic nerve': {rel: b('In the chest it lies on the side of the vertebral bodies, beside the azygos vein.', '在胸腔內沿椎體側面走，靠近奇靜脈。'), fn: b('Carries sympathetic fibres to the foregut organs and the adrenal medulla, and pain fibres from them.', '把交感纖維送到前腸器官與腎上腺髓質，並帶回它們的痛覺纖維。')},
  'Left greater splanchnic nerve': {rel: b('In the chest it lies on the side of the vertebral bodies, beside the hemiazygos vein.', '在胸腔內沿椎體側面走，靠近半奇靜脈。'), fn: b('Sympathetic supply of the foregut organs and pain fibres from them.', '前腸器官的交感神經支配與痛覺傳入。')},
  'Right lesser splanchnic nerve': {rel: b('It runs below and lateral to the greater splanchnic nerve.', '走在大內臟神經的外下方。'), fn: b('Sympathetic supply of the midgut and the kidney.', '中腸與腎臟的交感神經支配。')},
  'Left lesser splanchnic nerve': {rel: b('It runs below and lateral to the left greater splanchnic nerve.', '走在左大內臟神經的外下方。'), fn: b('Sympathetic supply of the midgut and the left kidney.', '中腸與左腎的交感神經支配。')},
  'Posterior vagal trunk': {rel: b('It passes through the oesophageal hiatus on the back of the oesophagus, close to the left gastric artery.', '在食道後面經食道裂孔，靠近左胃動脈。')},
  'Celiac nodes': {fn: b('The last station for the lymph of the foregut organs, including the duodenum above the papilla, pancreas and spleen.', '前腸器官淋巴的最後一站，包括乳突以上的十二指腸、胰與脾。')},
  'Superior mesenteric nodes': {fn: b('The last station for the lymph of the midgut.', '中腸淋巴的最後一站。')},
  'Gastrosplenic ligament': {rel: b('It forms part of the left wall of the lesser sac and continues into the splenorenal ligament.', '構成網膜囊左壁的一部分，並與脾腎韌帶相連。')},
  'Splenorenal ligament': {rel: b('Together with the gastrosplenic ligament it forms the left border of the lesser sac.', '與胃脾韌帶共同構成網膜囊的左界。')},
  'Stomach': {loc: b('In the left upper abdomen, under the left dome of the diaphragm.', '位於左上腹、左側橫膈圓頂下方。'), fn: b('Stores and churns food, and passes chyme into the duodenum.', '暫存並攪拌食物，再把食糜送入十二指腸。')},
  'Gallbladder': {loc: b('In a fossa on the visceral surface of the liver, its fundus at the tip of the right ninth costal cartilage.', '位在肝臟面的膽囊窩內，膽囊底對著右側第九肋軟骨尖端。'), fn: b('Stores and concentrates bile and releases it after a meal.', '儲存並濃縮膽汁，進食後排出。')},
  'Left kidney': {loc: b('Retroperitoneal, from T12 to L3, a little higher than the right kidney.', '位於腹膜後，約由第十二胸椎到第三腰椎，比右腎稍高。'), fn: b('Filters the blood and makes urine.', '過濾血液、產生尿液。')},
  'Right kidney': {loc: b('Retroperitoneal, a little lower than the left kidney because of the liver.', '位於腹膜後，因肝臟在上方而比左腎稍低。'), fn: b('Filters the blood and makes urine.', '過濾血液、產生尿液。')},
  'Jejunum': {loc: b('The upper two fifths of the small intestine beyond the duodenum, mostly in the left upper abdomen.', '十二指腸之後小腸的上五分之二，大多在左上腹。'), fn: b('The main site of absorption of nutrients.', '吸收養分的主要部位。')},
  'Transverse colon': {loc: b('Hangs across the abdomen on the transverse mesocolon, from the right to the left colic flexure. Only its left part is shown.', '以橫結腸繫膜懸掛、橫過腹部，由右結腸彎到左結腸彎。這裡只顯示左段。'), fn: b('Absorbs water and salts from the bowel contents.', '吸收腸內容物中的水分與鹽類。')},
};
for (const p of parts) if (MORE[p.key]) p.card = {...p.card, ...MORE[p.key]};

export const DUODENUM_PANCREAS_SPLEEN: OrganDef = {
  id: 'duodenum-pancreas-spleen', zh: '十二指腸、胰與脾', en: 'Duodenum, pancreas and spleen', manifest: 'models/organ/duodenum-pancreas-spleen/duodenum-pancreas-spleen.json',
  groups, parts, coreGroups: ['organs', 'zones', 'marks'], zonesDefault: true, glassGroups: ['organs'],
  presets: [
    {id: 'organ', en: 'Organ', zh: '器官', show: ['organs', 'zones', 'marks', 'ducts', 'context', 'muscles', 'lymph', 'peritoneum'], zones: true},
    {id: 'arteries', en: 'Arteries', zh: '動脈', show: ['arteries'], ghost: ['organs']},
    {id: 'veins', en: 'Veins', zh: '靜脈', show: ['veins'], ghost: ['organs']},
    {id: 'nerves', en: 'Nerves', zh: '神經', show: ['nerves'], ghost: ['organs']},
    {id: 'overview', en: 'Overview', zh: '全部', show: ['organs', 'marks', 'ducts', 'arteries', 'veins', 'nerves', 'context', 'muscles', 'lymph', 'peritoneum'], glass: true, zones: false},
  ],
  peelNote: '由外而內：神經 → 靜脈 → 動脈 → 相鄰器官、相關肌肉與韌帶 → 膽管與胰管 → 乳突、彎曲與脾門的標示 → 各部分顏色 → 器官本身。',
  scope: [
    '十二指腸四部、胰的五部分與脾的四個面，都是標示在同一個器官模型表面上的位置，不是另外的模型；邊界為示意（十二指腸依中心線在三個轉彎處切分，胰以上腸繫膜靜脈與肝門靜脈為界，脾依它朝向的器官劃分）。',
    '大、小十二指腸乳突在腸腔內面，這裡把標示畫在同一位置的外壁上；肝胰壺腹、副胰管、上十二指腸動脈、十二指腸懸韌帶與腹腔叢、上腸繫膜叢是依一般描述沿中心線畫成的示意管或示意帶，起止點放在相鄰模型上。',
    '膽管與總肝管在圖譜中是同一件模型，這裡在膽囊管會合處分開。其他器官、導管、血管、神經節與內臟神經是圖譜或本站既有的模型。淋巴結、胃脾韌帶、脾腎韌帶與肝胰壺腹括約肌只有資訊卡。',
  ],
};
