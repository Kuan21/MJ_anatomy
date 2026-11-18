import type {OrganCard, OrganGroupDef, OrganPartDef} from '../organ-types';

/**
 * Blood supply, venous drainage (portal system), nerves and lymph of the stomach, and the organs next to it (spleen, pancreas).
 * Meshes come from scripts/organ-atlas/stomach-supply.mjs: atlas vessels, the vagus nerve and the sympathetic ganglia are copied; the branches the atlas lacks (short and posterior gastric vessels,
 * anterior vagal trunk and gastric branches, celiac plexus) are single schematic tubes along the textbook course. Card text is written for this site from public anatomical descriptions.
 */
export const SUPPLY_GROUPS: OrganGroupDef[] = [
  {id: 'nerves', en: 'Nerves', zh: '神經', layer: 0, on: true},
  {id: 'veins', en: 'Veins and portal tributaries', zh: '靜脈（含門靜脈屬支）', layer: 1, on: true},
  {id: 'arteries', en: 'Arteries', zh: '動脈', layer: 2, on: true},
  {id: 'lymph', en: 'Lymphatic drainage (card only)', zh: '淋巴引流（只有資訊卡）', layer: -1, on: true},
  {id: 'muscles', en: 'Related muscles', zh: '相關肌肉', layer: 3, on: true},
];

const ART = '#c4413a', VEIN = '#3f66b0', PORTAL = '#5b4fb0', NERVE = '#d4a600', GANGLION = '#b88a00';
const b = (en: string, zh: string) => ({en, zh});
type Extra = Partial<OrganPartDef>;
const part = (key: string, en: string, zh: string, group: string, color: string, card: OrganCard, extra: Extra = {}): OrganPartDef => ({key, en, zh, group, color, card, ...extra});
const art = (key: string, en: string, zh: string, card: OrganCard, extra: Extra = {}) => part(key, en, zh, 'arteries', ART, card, extra);
const vein = (key: string, en: string, zh: string, card: OrganCard, extra: Extra = {}) => part(key, en, zh, 'veins', VEIN, card, extra);
const nerve = (key: string, en: string, zh: string, card: OrganCard, extra: Extra = {}) => part(key, en, zh, 'nerves', NERVE, card, extra);
const node = (key: string, en: string, zh: string, card: OrganCard) => part(key, en, zh, 'lymph', '#9fb8a0', card, {cardOnly: true, quizSystem: 'viscera'});

export const SUPPLY_PARTS: OrganPartDef[] = [
  // ---- arteries
  art('Celiac trunk', 'Celiac trunk', '腹腔幹', {
    loc: b('A short, wide, unpaired branch from the front of the abdominal aorta, just below the aortic hiatus of the diaphragm (about the level of T12–L1).', '腹主動脈前壁短而粗的單一分支，位在橫膈主動脈裂孔的正下方，約第十二胸椎至第一腰椎的高度。'),
    course: b('It is only 1–2 cm long. It runs forward and slightly down above the upper border of the pancreas and ends by dividing into the left gastric, splenic and common hepatic arteries.', '全長約一至二公分，向前並稍向下，走在胰上緣之上，隨即分成胃左動脈、脾動脈與肝總動脈三支。'),
    rel: b('The celiac ganglia and plexus surround its root; the crura of the diaphragm lie behind it and the lesser sac and stomach in front.', '根部被腹腔神經節與腹腔叢包圍；後方為橫膈腳，前方隔著網膜囊與胃相對。'),
    fn: b('It supplies the derivatives of the foregut: lower oesophagus, stomach, upper duodenum, liver, gallbladder, pancreas and spleen.', '供應前腸來源的器官：食道下段、胃、十二指腸上部、肝、膽囊、胰與脾。'),
  }, {quizSystem: 'arterial'}),
  art('Left gastric artery', 'Left gastric artery', '胃左動脈', {
    loc: b('The smallest branch of the celiac trunk. It rises up and to the left behind the lesser sac to the cardia, then turns down along the lesser curvature.', '腹腔幹最小的分支，先向上向左走在網膜囊後方到達賁門附近，再轉向下沿胃小彎行走。'),
    course: b('On the lesser curvature it runs between the two layers of the lesser omentum and ends by joining the right gastric artery. Oesophageal branches go up through the hiatus.', '沿胃小彎走在小網膜兩層之間，終點與胃右動脈吻合；食道支則經食道裂孔向上。'),
    rel: b('It is accompanied by the left gastric vein and the left gastric lymph nodes; the vagal gastric branches and sympathetic fibres follow the same line.', '與胃左靜脈、胃左淋巴結同行，迷走神經的胃支與交感神經纖維也沿同一路線。'),
    fn: b('It supplies the lower oesophagus and the part of the stomach next to the upper lesser curvature, on both the front and back walls.', '供應食道下段與靠近小彎上部的胃前壁及後壁。'),
  }, {quizSystem: 'arterial'}),
  art('Splenic artery', 'Splenic artery', '脾動脈', {
    loc: b('The largest branch of the celiac trunk. It runs to the left along the upper border of the pancreas, in a winding course, behind the stomach (the stomach bed).', '腹腔幹最大的分支，沿胰上緣向左走，路徑迂曲，位於胃後方（胃床）。'),
    course: b('It ends at the hilum of the spleen by dividing into terminal branches. On the way it gives pancreatic branches, the posterior gastric artery, and near the end the short gastric arteries and the left gastro-epiploic artery.', '終點在脾門，分成末梢分支；途中發出胰支、後胃動脈，接近末端時發出短胃動脈與胃網膜左動脈。'),
    rel: b('The splenic vein runs just below it, and the splenic lymph nodes lie along it.', '脾靜脈在它的下方並行，脾淋巴結沿著它分布。'),
    fn: b('It supplies the spleen, the body and tail of the pancreas, and through its gastric branches the fundus and the upper part of the greater curvature.', '供應脾、胰體與胰尾，並以胃支供應胃底與大彎上部。'),
  }, {quizSystem: 'arterial'}),
  art('Common hepatic artery', 'Common hepatic artery', '肝總動脈', {
    loc: b('A branch of the celiac trunk that runs to the right along the upper border of the head of the pancreas, toward the first part of the duodenum.', '腹腔幹的分支，沿胰頭上緣向右走，朝十二指腸第一部而去。'),
    course: b('It gives off the gastroduodenal artery and then continues upward as the proper hepatic artery in the lesser omentum.', '發出胃十二指腸動脈後，續向上成為在小網膜內的肝固有動脈。'),
    rel: b('The portal vein lies behind it and the pancreas below it; the hepatic lymph nodes follow it.', '後方是門靜脈，下方是胰；肝淋巴結沿著它分布。'),
    fn: b('It supplies the liver, gallbladder, upper duodenum and head of the pancreas, and through its branches the pyloric part of the stomach.', '供應肝、膽囊、十二指腸上部與胰頭，並以分支供應胃的幽門側。'),
  }, {quizSystem: 'arterial'}),
  art('Proper hepatic artery', 'Proper hepatic artery', '肝固有動脈', {
    loc: b('The continuation of the common hepatic artery after the origin of the gastroduodenal artery. It lies in the free edge of the lesser omentum.', '肝總動脈在發出胃十二指腸動脈之後的延續，位於小網膜的游離緣內。'),
    course: b('It ascends in front of the portal vein and to the left of the bile duct and divides into the right and left hepatic arteries at the porta hepatis. The right gastric artery arises from it.', '在門靜脈前方、膽管左側上行，於肝門分成左、右肝動脈；胃右動脈由它發出。'),
    rel: b('Together with the bile duct and the portal vein it forms the portal triad in the hepatoduodenal ligament.', '與膽管、門靜脈一起組成肝十二指腸韌帶內的門三合體。'),
    fn: b('It carries arterial blood to the liver and, through the right gastric artery, to the lower lesser curvature of the stomach.', '把動脈血送到肝，並經胃右動脈供應胃小彎下部。'),
  }, {quizSystem: 'arterial'}),
  art('Gastroduodenal artery', 'Gastroduodenal artery', '胃十二指腸動脈', {
    loc: b('A branch of the common hepatic artery that passes down behind the first part of the duodenum, in front of the neck of the pancreas.', '肝總動脈的分支，從十二指腸第一部後方、胰頸前方向下走。'),
    course: b('At the lower border of the duodenum it divides into the right gastro-epiploic artery and the superior pancreaticoduodenal artery.', '在十二指腸第一部下緣分成胃網膜右動脈與上胰十二指腸動脈。'),
    rel: b('The bile duct lies to its right; an ulcer on the back wall of the duodenum can erode it.', '膽管在它的右側；十二指腸後壁的潰瘍可能侵蝕它。'),
    fn: b('It supplies the pylorus, the first part of the duodenum and the head of the pancreas, and feeds the greater curvature through the right gastro-epiploic artery.', '供應幽門、十二指腸第一部與胰頭，並經胃網膜右動脈供應胃大彎。'),
  }, {quizSystem: 'arterial'}),
  art('Right gastric artery', 'Right gastric artery', '胃右動脈', {
    loc: b('A small branch of the proper hepatic artery (sometimes of the common hepatic artery) that runs down in the lesser omentum to the pylorus.', '肝固有動脈（有時為肝總動脈）的小分支，在小網膜內向下走到幽門。'),
    course: b('At the pylorus it turns left and follows the lesser curvature upward, ending by joining the left gastric artery to form the arcade of the lesser curvature.', '到幽門後轉向左，沿胃小彎向上走，終點與胃左動脈吻合，形成小彎的動脈弓。'),
    rel: b('The right gastric vein and the right gastric lymph nodes accompany it.', '胃右靜脈與胃右淋巴結與它同行。'),
    fn: b('It supplies the lower part of the lesser curvature and the pyloric region.', '供應胃小彎下部與幽門區。'),
  }, {quizSystem: 'arterial'}),
  art('Right gastro-epiploic artery', 'Right gastro-epiploic artery', '胃網膜右動脈', {
    loc: b('One of the two end branches of the gastroduodenal artery. It starts behind the pylorus and runs to the left along the greater curvature.', '胃十二指腸動脈兩個終末分支之一，起自幽門後方，沿胃大彎向左走。'),
    course: b('It lies between the two layers of the greater omentum, a finger-breadth below the curvature, and joins the left gastro-epiploic artery to form the arcade of the greater curvature.', '走在大網膜兩層之間，距胃大彎約一指寬，終點與胃網膜左動脈吻合，形成大彎的動脈弓。'),
    rel: b('The right gastro-epiploic vein and the gastro-omental lymph nodes accompany it.', '胃網膜右靜脈與胃網膜淋巴結與它同行。'),
    fn: b('It supplies the lower greater curvature of the stomach and sends omental branches to the greater omentum.', '供應胃大彎下部，並發出網膜支到大網膜。'),
  }, {quizSystem: 'arterial'}),
  art('Left gastro-epiploic artery', 'Left gastro-epiploic artery', '胃網膜左動脈', {
    loc: b('A branch of the splenic artery near the splenic hilum. It runs down and to the right along the greater curvature, in the gastrosplenic ligament and then the greater omentum.', '脾門附近由脾動脈發出，沿胃大彎向下向右走，先經胃脾韌帶，再入大網膜。'),
    course: b('It ends by joining the right gastro-epiploic artery. Its gastric branches reach the front and back walls and its omental branches go down into the greater omentum.', '終點與胃網膜右動脈吻合；胃支到前、後壁，網膜支向下進入大網膜。'),
    rel: b('The left gastro-epiploic vein runs with it, and the splenic lymph nodes lie near its origin.', '胃網膜左靜脈與它並行，起始處附近有脾淋巴結。'),
    fn: b('It supplies the upper greater curvature and the adjacent walls of the stomach.', '供應胃大彎上部及相鄰的胃壁。'),
  }, {quizSystem: 'arterial'}),
  art('Short gastric arteries', 'Short gastric arteries', '短胃動脈', {
    loc: b('Four to six small branches from the end of the splenic artery or from its terminal branches at the splenic hilum.', '約四到六條小分支，起自脾門處的脾動脈末端或其末梢分支。'),
    course: b('They run a short way in the gastrosplenic ligament and reach the fundus and the upper part of the greater curvature, where they join the left gastric and left gastro-epiploic arteries.', '在胃脾韌帶內走很短一段，到達胃底與大彎上部，並與胃左動脈、胃網膜左動脈吻合。'),
    rel: b('The short gastric veins run with them toward the splenic hilum.', '短胃靜脈與它們一起朝脾門走。'),
    fn: b('They supply the fundus, which has no other large artery of its own.', '供應胃底，這一區沒有其他較大的專屬動脈。'),
    note: b('Schematic model: the course follows the usual description and the end points are placed on the model surface.', '示意模型：走向依一般描述，起止點放在模型的表面上。'),
  }, {quizSystem: 'arterial', schematic: true}),
  art('Posterior gastric artery', 'Posterior gastric artery', '後胃動脈', {
    loc: b('A small, inconstant branch of the middle part of the splenic artery.', '脾動脈中段發出的小分支，並非每個人都有。'),
    course: b('It climbs behind the lesser sac, in the fold between the stomach and the diaphragm, to the back wall of the fundus.', '在網膜囊後方、胃與橫膈之間的皺褶內向上爬，到達胃底的後壁。'),
    rel: b('It lies behind the lesser sac, in the peritoneal fold between the stomach and the diaphragm, and its vein runs with it.', '位於網膜囊後方、胃與橫膈之間的腹膜皺褶內，靜脈與它同行。'),
    fn: b('It supplies the back wall of the fundus and the cardia region.', '供應胃底後壁與賁門區。'),
    note: b('Schematic model: a short tube from the splenic artery to the back wall of the stomach.', '示意模型：從脾動脈到胃後壁的短管。'),
  }, {quizSystem: 'arterial', schematic: true}),

  // ---- veins and the portal system
  vein('Left gastric vein', 'Left gastric vein', '胃左靜脈', {
    loc: b('It follows the left gastric artery along the lesser curvature and is also called the coronary vein.', '沿胃左動脈走在胃小彎上，也稱為冠狀靜脈。'),
    course: b('It receives oesophageal veins from the lower oesophagus, then turns down behind the lesser sac and drains into the portal vein (sometimes the splenic vein).', '接收食道下段的食道靜脈，再轉向下走在網膜囊後方，注入門靜脈（有時注入脾靜脈）。'),
    rel: b('Its oesophageal tributaries join the veins of the azygos system, one of the portal–systemic anastomoses.', '它在食道的屬支與奇靜脈系統的靜脈相通，是門體靜脈吻合之一。'),
    fn: b('It drains the lesser curvature side of the stomach and the lower oesophagus. When portal pressure is high, flow reverses into the oesophageal veins and they can become varices.', '回收胃小彎側與食道下段的血液；門靜脈壓力升高時血流逆向進入食道靜脈，可形成食道靜脈曲張。'),
  }, {quizSystem: 'venous'}),
  vein('Right gastric vein', 'Right gastric vein', '胃右靜脈', {
    loc: b('It follows the right gastric artery along the lesser curvature.', '沿胃右動脈走在胃小彎上。'),
    course: b('It runs toward the pylorus and drains directly into the portal vein. The prepyloric vein, which passes over the pylorus, joins it.', '朝幽門走，直接注入門靜脈；越過幽門的幽門前靜脈會匯入它。'),
    rel: b('It lies in the lesser omentum with the right gastric artery.', '與胃右動脈一起走在小網膜內。'),
    fn: b('It drains the lower lesser curvature and the pyloric region.', '回收胃小彎下部與幽門區的血液。'),
  }, {quizSystem: 'venous'}),
  vein('Right gastro-epiploic vein', 'Right gastro-epiploic vein', '胃網膜右靜脈', {
    loc: b('It runs along the greater curvature beside the right gastro-epiploic artery, in the greater omentum.', '在大網膜內沿胃大彎，與胃網膜右動脈並行。'),
    course: b('It runs toward the pylorus and drains into the superior mesenteric vein, usually through a short gastrocolic trunk.', '朝幽門走，注入腸繫膜上靜脈，通常經一條短的胃結腸靜脈幹。'),
    rel: b('The gastro-omental lymph nodes lie along it.', '胃網膜淋巴結沿著它分布。'),
    fn: b('It drains the lower greater curvature and the greater omentum.', '回收胃大彎下部與大網膜的血液。'),
  }, {quizSystem: 'venous'}),
  vein('Left gastro-epiploic vein', 'Left gastro-epiploic vein', '胃網膜左靜脈', {
    loc: b('It runs along the greater curvature with the left gastro-epiploic artery, from the omentum up to the splenic hilum.', '與胃網膜左動脈並行，沿胃大彎從大網膜走向脾門。'),
    course: b('It reaches the hilum through the gastrosplenic ligament and ends in the splenic vein or one of its tributaries.', '經胃脾韌帶到達脾門，注入脾靜脈或它的屬支。'),
    rel: b('The left gastro-omental lymph nodes and the splenic nodes lie near it.', '附近有胃網膜左淋巴結與脾淋巴結。'),
    fn: b('It drains the upper greater curvature and the adjacent walls.', '回收胃大彎上部與相鄰胃壁的血液。'),
  }, {quizSystem: 'venous'}),
  vein('Short gastric veins', 'Short gastric veins', '短胃靜脈', {
    loc: b('Small veins from the fundus and the upper greater curvature that run beside the short gastric arteries.', '來自胃底與大彎上部的小靜脈，與短胃動脈並行。'),
    course: b('They cross the gastrosplenic ligament to the splenic hilum and end in the splenic vein or its tributaries.', '越過胃脾韌帶到脾門，注入脾靜脈或它的屬支。'),
    rel: b('They are the shortest link between the fundus and the splenic vein.', '是胃底與脾靜脈之間最短的連結。'),
    fn: b('They drain the fundus into the splenic vein and so into the portal system.', '把胃底的血液經脾靜脈送入門靜脈系統。'),
    note: b('Schematic model: the end points are placed on the model surface.', '示意模型：起止點放在模型的表面上。'),
  }, {quizSystem: 'venous', schematic: true}),
  vein('Posterior gastric vein', 'Posterior gastric vein', '後胃靜脈', {
    loc: b('A small vein of the back wall of the fundus that runs with the posterior gastric artery.', '胃底後壁的小靜脈，與後胃動脈同行。'),
    course: b('It runs down behind the lesser sac and ends in the splenic vein.', '在網膜囊後方向下走，注入脾靜脈。'),
    rel: b('Like the artery, it is not always present.', '和動脈一樣，並非每個人都有。'),
    fn: b('It drains the back wall of the fundus into the splenic vein.', '把胃底後壁的血液送入脾靜脈。'),
    note: b('Schematic model: a short tube from the back wall of the stomach to the splenic vein.', '示意模型：從胃後壁到脾靜脈的短管。'),
  }, {quizSystem: 'venous', schematic: true}),
  part('Splenic vein', 'Splenic vein', '脾靜脈', 'veins', PORTAL, {
    loc: b('It forms at the splenic hilum from several tributaries and runs to the right behind the body of the pancreas, below the splenic artery.', '在脾門由數條屬支匯合而成，在胰體後方、脾動脈下方向右走。'),
    course: b('It receives the short gastric, left gastro-epiploic and posterior gastric veins and the pancreatic veins, and usually the inferior mesenteric vein. Behind the neck of the pancreas it joins the superior mesenteric vein to form the portal vein.', '接收短胃靜脈、胃網膜左靜脈、後胃靜脈與胰靜脈，通常還有腸繫膜下靜脈；在胰頸後方與腸繫膜上靜脈匯合成門靜脈。'),
    rel: b('It lies in front of the left kidney and suprarenal gland and behind the stomach and pancreas.', '位於左腎與左腎上腺前方、胃與胰的後方。'),
    fn: b('It drains the spleen, the left part of the stomach and the pancreas into the portal system.', '把脾、胃左側與胰的血液送入門靜脈系統。'),
  }, {quizSystem: 'venous'}),
  part('Superior mesenteric vein', 'Superior mesenteric vein', '腸繫膜上靜脈', 'veins', PORTAL, {
    loc: b('It runs up in the root of the mesentery to the right of the superior mesenteric artery and passes in front of the third part of the duodenum.', '在腸繫膜根部、腸繫膜上動脈右側向上走，越過十二指腸第三部前方。'),
    course: b('Behind the neck of the pancreas it joins the splenic vein to form the portal vein. The right gastro-epiploic vein enters it through the gastrocolic trunk.', '在胰頸後方與脾靜脈匯合成門靜脈；胃網膜右靜脈經胃結腸靜脈幹注入它。'),
    rel: b('The pancreatic head and the uncinate process lie to its right and behind it.', '胰頭與鉤突位在它的右側與後方。'),
    fn: b('It drains the small intestine, the caecum, the ascending and transverse colon, and part of the stomach and pancreas.', '回收小腸、盲腸、升結腸與橫結腸的血液，也回收部分胃與胰的血液。'),
    note: b('Only the upper part is shown here; it continues down in the root of the mesentery.', '這裡只畫出上段，下方在腸繫膜根部繼續往下。'),
  }, {quizSystem: 'venous'}),
  part('Hepatic portal vein', 'Hepatic portal vein', '門靜脈', 'veins', PORTAL, {
    loc: b('It forms behind the neck of the pancreas, about the level of L1–L2, where the splenic and superior mesenteric veins meet.', '在胰頸後方、約第一至第二腰椎高度，由脾靜脈與腸繫膜上靜脈匯合而成。'),
    course: b('It ascends about 8 cm behind the first part of the duodenum, then in the free edge of the lesser omentum behind the bile duct and hepatic artery, and divides into the right and left branches at the porta hepatis.', '長約八公分，先在十二指腸第一部後方上行，再走在小網膜游離緣內、膽管與肝動脈的後方，在肝門分成左、右支。'),
    rel: b('The gastric veins enter it directly or through the splenic vein; the cystic vein reaches its right branch.', '胃的靜脈直接或經脾靜脈注入它；膽囊靜脈注入它的右支。'),
    fn: b('It carries blood from the stomach, intestine, spleen and pancreas to the liver. It has no valves, so raised pressure is passed back to its tributaries.', '把胃、腸、脾與胰的血液送到肝；沒有瓣膜，壓力升高時會逆傳到它的屬支。'),
  }, {quizSystem: 'venous'}),

  // ---- nerves
  nerve('Right vagus nerve', 'Right vagus nerve', '右迷走神經', {
    loc: b('The model shows its lower part: down the side and then the back of the oesophagus, through the oesophageal hiatus and on toward the celiac region.', '模型顯示它的下段：沿食道側面、再到後面下行，穿過食道裂孔後朝腹腔幹區域走。'),
    course: b('Near the hiatus it forms the posterior vagal trunk. The trunk gives posterior gastric branches to the back wall of the stomach and a large celiac branch that joins the celiac plexus.', '接近食道裂孔時形成後迷走神經幹；後幹發出到胃後壁的胃後支，以及一條較大的腹腔支，匯入腹腔叢。'),
    rel: b('In the lower chest the two vagi form the oesophageal plexus; the right vagus ends up behind the oesophagus, the left in front.', '在下胸部兩側迷走神經形成食道神經叢；右迷走神經最後走到食道後面，左迷走神經走到前面。'),
    fn: b('Its parasympathetic fibres raise gastric acid secretion and gut movement and relax the pylorus; it also carries sensation back from the stomach.', '副交感纖維促進胃酸分泌與消化道蠕動、使幽門放鬆，也把胃的感覺傳回中樞。'),
  }, {quizSystem: 'nervous', side: 'right'}),
  nerve('Left vagus nerve', 'Left vagus nerve', '左迷走神經', {
    loc: b('The model shows it from the chest down to the upper oesophagus, where it moves onto the front of the oesophagus.', '模型顯示它從胸部下行到食道上段，之後轉到食道前面。'),
    course: b('It continues on the front of the oesophagus as the anterior vagal trunk and passes through the hiatus with it.', '在食道前面續成前迷走神經幹，與食道一起穿過食道裂孔。'),
    rel: b('It passes in front of the aortic arch and behind the root of the left lung on the way down.', '下行途中經過主動脈弓前方與左肺根後方。'),
    fn: b('Parasympathetic supply of the front of the stomach, the liver and the upper gut, and sensory return from them.', '提供胃前壁、肝與上消化道的副交感支配，也傳回這些器官的感覺。'),
  }, {quizSystem: 'nervous', side: 'left'}),
  nerve('Anterior vagal trunk', 'Anterior vagal trunk', '前迷走神經幹', {
    loc: b('The continuation of the left vagus nerve on the front of the lower oesophagus. It enters the abdomen through the oesophageal hiatus.', '左迷走神經在食道下段前面的延續，經食道裂孔進入腹腔。'),
    course: b('At the cardia it divides into the hepatic branch to the liver and the anterior gastric branches to the front wall of the stomach.', '到賁門處分成到肝的肝支，以及到胃前壁的胃前支。'),
    rel: b('It lies on the surface of the oesophagus, under the peritoneum of the front of the abdominal oesophagus.', '貼在食道表面，位於腹部食道前面的腹膜之下。'),
    fn: b('Parasympathetic fibres that drive acid secretion and stomach movement; cutting the trunks was once used to reduce acid.', '副交感纖維，推動胃酸分泌與胃的運動；過去曾以切斷迷走神經幹來減少胃酸。'),
    note: b('Schematic model: a single tube continuing the left vagus nerve to the cardia.', '示意模型：接續左迷走神經、通到賁門的單一管。'),
  }, {quizSystem: 'nervous', schematic: true}),
  nerve('Anterior gastric branches', 'Anterior gastric branches', '胃前支', {
    loc: b('The branches of the anterior vagal trunk on the front wall of the stomach. The main one runs close to the lesser curvature in the lesser omentum.', '前迷走神經幹在胃前壁的分支，主支在小網膜內靠近胃小彎走。'),
    course: b('Side branches leave it for the body, and its end branches spread over the pyloric antrum.', '側支分向胃體，末梢分支散開到幽門竇。'),
    rel: b('It runs with the left gastric artery and the lesser curvature arcade.', '與胃左動脈及小彎動脈弓同行。'),
    fn: b('It increases acid secretion and the contractions that move food toward the pylorus.', '增加胃酸分泌，並加強把食物推向幽門的收縮。'),
    note: b('Schematic model: tubes laid on the front wall along the lesser curvature.', '示意模型：沿胃小彎放在胃前壁上的細管。'),
  }, {quizSystem: 'nervous', schematic: true}),
  part('Esophageal plexus', 'Esophageal plexus', '食道神經叢', 'nerves', NERVE, {
    loc: b('A network around the lower oesophagus, made of branches of both vagus nerves with some sympathetic fibres.', '圍繞食道下段的網狀結構，由兩側迷走神經的分支與部分交感纖維組成。'),
    course: b('Below the plexus the fibres gather again into the anterior and posterior vagal trunks.', '神經叢下方，纖維重新集合成前、後迷走神經幹。'),
    rel: b('It lies on the wall of the oesophagus behind the heart and the left atrium.', '位於食道壁上，在心臟與左心房的後方。'),
    fn: b('It carries parasympathetic, sympathetic and sensory fibres to and from the oesophagus.', '傳送食道的副交感、交感與感覺纖維。'),
  }, {quizSystem: 'nervous'}),
  part('Right celiac ganglion', 'Right celiac ganglion', '右腹腔神經節', 'nerves', GANGLION, {
    loc: b('One of two large sympathetic ganglia, on the right of the root of the celiac trunk, in front of the crus of the diaphragm.', '兩個大型交感神經節之一，位於腹腔幹根部右側、橫膈腳前方。'),
    course: b('Preganglionic fibres of the greater splanchnic nerve end in it; postganglionic fibres leave to form the celiac plexus along the arteries.', '大內臟神經的節前纖維在此終止；節後纖維離開後形成沿動脈分布的腹腔叢。'),
    rel: b('It lies beside the right suprarenal gland and the inferior vena cava.', '靠近右腎上腺與下腔靜脈。'),
    fn: b('Relay station of the sympathetic supply to the stomach and the other foregut organs.', '胃與其他前腸器官交感支配的中繼站。'),
  }, {quizSystem: 'nervous', side: 'right'}),
  part('Left celiac ganglion', 'Left celiac ganglion', '左腹腔神經節', 'nerves', GANGLION, {
    loc: b('The ganglion on the left of the root of the celiac trunk, in front of the left crus of the diaphragm.', '位於腹腔幹根部左側、左橫膈腳前方的神經節。'),
    course: b('Like the right one, it receives the greater splanchnic nerve and sends postganglionic fibres along the arteries.', '和右側一樣，接收大內臟神經，並沿動脈送出節後纖維。'),
    rel: b('It lies beside the left suprarenal gland, behind the pancreas and the splenic vein.', '靠近左腎上腺，位在胰與脾靜脈的後方。'),
    fn: b('It relays sympathetic fibres to the stomach, spleen and pancreas.', '把交感纖維轉送到胃、脾與胰。'),
  }, {quizSystem: 'nervous', side: 'left'}),
  part('Right greater splanchnic nerve', 'Right greater splanchnic nerve', '右大內臟神經', 'nerves', NERVE, {
    loc: b('A nerve from the right sympathetic trunk in the lower chest (preganglionic fibres from about T5 to T9) that runs down along the spine.', '從右側胸段交感神經幹下部發出的神經（節前纖維約來自第五至第九胸節），沿脊柱前側下行。'),
    course: b('It pierces the crus of the diaphragm and ends in the celiac ganglion.', '穿過橫膈腳，終止於腹腔神經節。'),
    rel: b('It lies on the side of the vertebral bodies in the back of the chest, beside the azygos vein.', '位在胸腔後部椎體的側面，旁邊有奇靜脈。'),
    fn: b('It carries sympathetic fibres that slow gut movement and narrow its vessels, and it carries the pain from the stomach back to the spinal cord.', '攜帶使消化道蠕動減慢、血管收縮的交感纖維，也把胃的痛覺傳回脊髓。'),
  }, {quizSystem: 'nervous', side: 'right'}),
  part('Left greater splanchnic nerve', 'Left greater splanchnic nerve', '左大內臟神經', 'nerves', NERVE, {
    loc: b('The same nerve on the left, from the left sympathetic trunk in the lower chest.', '左側相同的神經，來自左側胸段交感神經幹下部。'),
    course: b('It pierces the left crus of the diaphragm and ends in the left celiac ganglion.', '穿過左橫膈腳，終止於左腹腔神經節。'),
    rel: b('It runs beside the descending aorta and the hemiazygos vein.', '沿降主動脈與半奇靜脈旁邊走。'),
    fn: b('Sympathetic supply of the stomach and the other foregut organs, and a route for their pain sensation.', '胃與其他前腸器官的交感支配，也是它們痛覺的傳導路徑。'),
  }, {quizSystem: 'nervous', side: 'left'}),
  part('Celiac plexus', 'Celiac plexus', '腹腔叢', 'nerves', GANGLION, {
    loc: b('The network of nerves around the root of the celiac trunk, made up of the two celiac ganglia and the fibres that reach them.', '圍繞腹腔幹根部的神經網，由兩個腹腔神經節與到達它們的纖維組成。'),
    course: b('It receives the greater and lesser splanchnic nerves and the celiac branches of the vagus nerves, and sends fibres out along the left gastric, splenic and common hepatic arteries.', '接收大、小內臟神經與迷走神經的腹腔支，並沿胃左動脈、脾動脈與肝總動脈送出纖維。'),
    rel: b('It lies in front of the aorta and the crura of the diaphragm, behind the lesser sac and the pancreas.', '位於主動脈與橫膈腳前方、網膜囊與胰的後方。'),
    fn: b('It distributes the autonomic supply of the stomach and the other upper abdominal organs along their arteries.', '沿動脈把自主神經的支配分送給胃與其他上腹部器官。'),
    note: b('Schematic model: strands joining the two ganglia and running along the three branches of the celiac trunk.', '示意模型：連接兩個神經節、並沿腹腔幹三條分支走的細絲。'),
  }, {quizSystem: 'nervous', schematic: true}),

  // ---- lymph: cards only
  node('Left gastric nodes', 'Left gastric nodes', '胃左淋巴結', {
    loc: b('Nodes along the left gastric artery on the upper lesser curvature, near the cardia.', '沿胃左動脈分布的淋巴結，在胃小彎上部、賁門附近。'),
    course: b('They receive lymph from the cardia and the upper part of the lesser curvature side and send it to the celiac nodes.', '接收賁門與胃小彎上部側的淋巴，送往腹腔淋巴結。'),
    fn: b('First station for the lymph of the upper lesser curvature; they are often involved when cancer spreads from this part of the stomach.', '胃小彎上部淋巴的第一站；此處的癌症擴散時常會涉及。'),
  }),
  node('Right gastric nodes', 'Right gastric nodes', '胃右淋巴結', {
    loc: b('Nodes along the right gastric artery on the lower lesser curvature, above the pylorus.', '沿胃右動脈分布的淋巴結，在胃小彎下部、幽門上方。'),
    course: b('They receive lymph from the lower lesser curvature and send it to the hepatic nodes and then to the celiac nodes.', '接收胃小彎下部的淋巴，送往肝淋巴結，再到腹腔淋巴結。'),
    fn: b('First station for the lymph of the pyloric side of the lesser curvature.', '幽門側胃小彎淋巴的第一站。'),
  }),
  node('Splenic nodes', 'Splenic nodes', '脾淋巴結', {
    loc: b('Nodes along the splenic artery and at the splenic hilum.', '沿脾動脈與脾門分布的淋巴結。'),
    course: b('They receive lymph from the fundus and the upper greater curvature and send it to the celiac nodes.', '接收胃底與大彎上部的淋巴，送往腹腔淋巴結。'),
    fn: b('Collect the lymph of the left part of the greater curvature together with that of the spleen and the pancreas.', '收集胃大彎左側、脾與胰的淋巴。'),
  }),
  node('Gastro-omental nodes', 'Gastro-omental nodes', '胃網膜淋巴結', {
    loc: b('Nodes along the greater curvature, beside the right gastro-epiploic vessels, in the greater omentum.', '沿胃大彎、在大網膜內、胃網膜右血管旁分布的淋巴結。'),
    course: b('They receive lymph from the lower greater curvature and drain through the pyloric nodes below the pylorus to the hepatic and celiac nodes.', '接收胃大彎下部的淋巴，經幽門下的幽門淋巴結，再流向肝淋巴結與腹腔淋巴結。'),
    fn: b('Drain the lower part of the greater curvature and the greater omentum.', '引流胃大彎下部與大網膜。'),
  }),
  node('Celiac nodes', 'Celiac nodes', '腹腔淋巴結', {
    loc: b('Nodes around the root of the celiac trunk, in front of the aorta below the diaphragm.', '位於腹腔幹根部周圍、橫膈下方主動脈前面的淋巴結。'),
    course: b('They receive lymph from the gastric, splenic and hepatic nodes and send it down into the intestinal trunk, which ends in the cisterna chyli.', '接收胃、脾與肝淋巴結的淋巴，向下注入腸淋巴幹，最後進入乳糜池。'),
    fn: b('The final station for the lymph of the foregut organs, including the whole stomach.', '前腸器官（包括整個胃）淋巴的最後一站。'),
  }),

  // ---- neighbouring organs (context, not asked)
  part('Spleen', 'Spleen', '脾', 'context', '#9a6a78', {
    loc: b('A soft organ under the left dome of the diaphragm, behind the stomach, against the ninth to eleventh ribs.', '位於左側橫膈圓頂下方、胃的後方，貼著第九至第十一肋。'),
    rel: b('Its gastric surface faces the back wall of the stomach, joined to it by the gastrosplenic ligament that carries the short gastric vessels.', '脾的胃面朝向胃後壁，兩者由帶著胃短血管的胃脾韌帶相連。'),
    fn: b('It filters the blood and removes old red cells, and it takes part in immune responses.', '過濾血液並清除衰老的紅血球，也參與免疫反應。'),
  }, {opacity: .5, quiz: false}),
  part('Pancreas', 'Pancreas', '胰', 'context', '#d8b06a', {
    loc: b('A long gland that lies across the back wall of the abdomen behind the stomach, with its head in the curve of the duodenum and its tail at the splenic hilum.', '橫過腹後壁、位於胃後方的長形腺體，胰頭在十二指腸彎內，胰尾到脾門。'),
    rel: b('The splenic artery runs along its upper border and the splenic vein behind it; the stomach lies in front, separated by the lesser sac.', '脾動脈沿其上緣走，脾靜脈在其後方；前方隔著網膜囊與胃相對。'),
    fn: b('It secretes digestive enzymes into the duodenum and insulin and glucagon into the blood.', '把消化酵素分泌到十二指腸，並把胰島素與升糖素分泌到血液。'),
  }, {opacity: .5, quiz: false}),

  // ---- related muscles (shown with the organ; the muscular coat of the stomach itself has no model, see its card)
  part('Diaphragm', 'Diaphragm', '橫膈', 'muscles', '#b8695c', {
    loc: b('A dome-shaped sheet of muscle between the chest and the abdomen; its left dome lies directly on the fundus of the stomach. Only the left half, around the oesophageal hiatus, is shown here.', '分隔胸腔與腹腔的圓頂形肌肉板；左側圓頂直接蓋在胃底上方。這裡只顯示食道裂孔附近的左半部。'),
    rel: b('The oesophagus passes through its oesophageal hiatus, at about the level of the tenth thoracic vertebra, with the vagal trunks; the fibres of the right crus loop round the hiatus.', '食道與迷走神經幹在約第十胸椎高度穿過其食道裂孔；右膈腳的肌纖維環繞裂孔。'),
    fn: b('The main muscle of breathing; around the hiatus it also helps the lower oesophageal sphincter to keep stomach contents from flowing back.', '主要的呼吸肌；裂孔周圍的肌纖維也協助食道下括約肌，防止胃內容物逆流。'),
    nerve: b('Phrenic nerves (C3–C5).', '膈神經（C3–C5）。'),
  }, {opacity: .2, quiz: false}),
];
