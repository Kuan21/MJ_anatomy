import type {OrganCard, OrganDef, OrganGroupDef, OrganPartDef} from '../organ-types';

/**
 * Small and large intestine detail mode. Meshes come from scripts/organ-atlas/intestines.mjs: the bowel, appendix, taeniae, mesenteries, vessels and ganglia are copied from the atlas and
 * the project's nerve models; the parts of the colon and rectum are marked on their surfaces; the omental appendices, jejunal and ileal arteries, inferior mesenteric ganglion and the
 * intermesenteric, inferior and superior mesenteric plexuses are schematic. Card text is written for this site from public anatomical descriptions.
 */
const groups: OrganGroupDef[] = [
  {id: 'organs', en: 'Small and large intestine (whole)', zh: '小腸與大腸（整體）', layer: 7, on: true},
  {id: 'zones', en: 'Parts of the colon and rectum', zh: '結腸與直腸各部', layer: 6, on: true},
  {id: 'marks', en: 'Haustra, flexures, valve and anus', zh: '結腸袋、結腸彎、迴盲瓣與肛門', layer: 5, on: true},
  {id: 'wall', en: 'Taeniae and omental appendices', zh: '結腸帶與腸脂垂', layer: 4, on: true},
  {id: 'peritoneum', en: 'Mesenteries', zh: '腸繫膜', layer: 4, on: true},
  {id: 'nerves', en: 'Nerves', zh: '神經', layer: 0, on: false},
  {id: 'veins', en: 'Veins', zh: '靜脈', layer: 1, on: false},
  {id: 'arteries', en: 'Arteries', zh: '動脈', layer: 2, on: false},
  {id: 'cardonly', en: 'Lymph nodes, folds and spaces (card only)', zh: '淋巴結、皺襞與腔隙（只有資訊卡）', layer: -1, on: true},
  {id: 'muscles', en: 'Related muscles', zh: '相關肌肉', layer: 3, on: true},
];

const ART = '#c4413a', PORTAL = '#5b4fb0', NERVE = '#d4a600', GANGLION = '#b88a00';
const b = (en: string, zh: string) => ({en, zh});
type Extra = Partial<OrganPartDef>;
const part = (key: string, en: string, zh: string, group: string, color: string, card: OrganCard, extra: Extra = {}): OrganPartDef => ({key, en, zh, group, color, card, ...extra});
const art = (key: string, zh: string, card: OrganCard, extra: Extra = {}) => part(key, key, zh, 'arteries', ART, card, {quizSystem: 'arterial', ...extra});
const portal = (key: string, zh: string, card: OrganCard, extra: Extra = {}) => part(key, key, zh, 'veins', PORTAL, card, {quizSystem: 'venous', ...extra});
const nerve = (key: string, zh: string, card: OrganCard, extra: Extra = {}) => part(key, key, zh, 'nerves', NERVE, card, {quizSystem: 'nervous', ...extra});
const note = (key: string, en: string, zh: string, card: OrganCard) => part(key, en, zh, 'cardonly', '#9fb8a0', card, {cardOnly: true, quizSystem: 'viscera'});
const zone = (host: string, v: number) => ({host, channel: 'zone' as const, values: [v]});
const line = (host: string, v: number) => ({host, channel: 'line' as const, values: [v]});

const parts: OrganPartDef[] = [
  // ---- whole organs
  part('Jejunum', 'Jejunum', '空腸', 'organs', '#e0b2a0', {
    loc: b('The upper two fifths of the small intestine after the duodenojejunal flexure, mostly in the left upper part of the infracolic compartment.', '十二指腸空腸彎曲之後、小腸的上五分之二，大多位在橫結腸下方腹腔的左上部。'),
    rel: b('Suspended by the mesentery; compared with the ileum it is wider, thicker-walled and redder, with long vasa recta and few arterial arcades.', '由小腸繫膜懸吊；與迴腸相比，管徑較寬、壁較厚、顏色較紅，直血管較長，動脈弓較少。'),
    blood: b('Jejunal arteries and veins from the superior mesenteric vessels.', '來自上腸繫膜動靜脈的空腸動脈與空腸靜脈。'),
    fn: b('Main site of digestion and absorption of nutrients; its tall circular folds give a large surface.', '消化與吸收養分的主要部位；高而密的環狀皺襞提供大量表面積。'),
  }),
  part('Ileum', 'Ileum', '迴腸', 'organs', '#d8a894', {
    loc: b('The lower three fifths of the small intestine, mostly in the lower abdomen and pelvis, ending at the ileocaecal junction in the right iliac fossa.', '小腸的下五分之三，大多在下腹部與骨盆，於右髂窩的迴盲部結束。'),
    rel: b('Narrower and thinner-walled than the jejunum, with more fat in its mesentery, more arterial arcades and short vasa recta; lymphoid patches (Peyer\'s patches) lie in its wall.', '比空腸細、壁較薄，繫膜內脂肪較多，動脈弓多而直血管短；壁內有淋巴集結（培氏斑）。'),
    blood: b('Ileal arteries and the ileal branch of the ileocolic artery.', '迴腸動脈與迴結腸動脈的迴腸支。'),
    fn: b('Absorbs vitamin B12 and bile salts in its last part.', '末段吸收維生素 B12 與膽鹽。'),
  }),
  part('Colon', 'Colon', '結腸', 'organs', '#c9a07f', {
    loc: b('The large intestine from the caecum to the rectum, framing the small intestine: ascending, transverse, descending and sigmoid colon. The model is the three colon pieces of the atlas put together.', '由盲腸到直腸的大腸，圍在小腸四周：升結腸、橫結腸、降結腸與乙狀結腸。這個模型由圖譜的三段結腸拼合而成。'),
    rel: b('Its outer longitudinal muscle is gathered into three taeniae coli; between them the wall bulges as haustra, and small fat-filled omental appendices hang from it.', '外層縱肌集中成三條結腸帶；帶與帶之間的管壁膨出成結腸袋，壁上掛著充滿脂肪的腸脂垂。'),
    blood: b('Up to about two thirds of the transverse colon from the superior mesenteric artery (midgut), the rest from the inferior mesenteric artery (hindgut).', '橫結腸約前三分之二以前由上腸繫膜動脈供應（中腸），其餘由下腸繫膜動脈供應（後腸）。'),
    fn: b('Absorbs water and salts and stores faeces.', '吸收水分與鹽類，並暫存糞便。'),
    links: ['Cecum', 'Ascending colon', 'Transverse colon', 'Descending colon', 'Sigmoid colon', 'Haustra of colon'],
  }),
  part('Rectum', 'Rectum', '直腸', 'organs', '#c98a70', {
    loc: b('The part of the large intestine in the pelvis from the end of the sigmoid colon (about S3) to the anorectal junction, where it turns down and back as the anal canal.', '位於骨盆內的大腸，由乙狀結腸末端（約第三薦椎）到肛管直腸交界，在此向下向後轉成肛管。'),
    rel: b('It follows the curve of the sacrum and has no taeniae, haustra or omental appendices; the puborectalis muscle slings round its lower end.', '沿著薦骨彎曲走，沒有結腸帶、結腸袋與腸脂垂；恥骨直腸肌在下端繞成吊帶。'),
    blood: b('Superior rectal artery (from the inferior mesenteric), middle and inferior rectal arteries (from the internal iliac and internal pudendal).', '上直腸動脈（來自下腸繫膜動脈）、中直腸動脈與下直腸動脈（來自髂內動脈與陰部內動脈）。'),
    fn: b('Stores faeces until defaecation.', '在排便前暫存糞便。'),
    links: ['Anal canal', 'Anus'],
  }),
  part('Ileocecal junction', 'Ileocecal junction', '迴盲部', 'organs', '#b0786a', {
    loc: b('Where the ileum opens into the large intestine, on the medial side at the junction of the caecum and ascending colon, in the right iliac fossa.', '迴腸開口於大腸之處，位在右髂窩、盲腸與升結腸交界的內側。'),
    rel: b('The ileocaecal valve guards the opening; the appendix arises about 2 cm below it.', '開口處有迴盲瓣；闌尾在它下方約 2 公分處發出。'),
    blood: b('Ileocolic artery and vein.', '迴結腸動脈與迴結腸靜脈。'),
  }, {quizSystem: 'viscera'}),
  part('Appendix', 'Appendix', '闌尾', 'organs', '#d8c0a0', {
    loc: b('A narrow blind tube, 6–10 cm long, from the back and inner side of the caecum, where the three taeniae meet. Its tip position varies (behind the caecum, in the pelvis, etc.).', '細長的盲管，長約 6 至 10 公分，由盲腸後內側、三條結腸帶會合處發出；尖端位置變化大（盲腸後、骨盆內等）。'),
    rel: b('Its base lies under McBurney\'s point, one third of the way from the anterior superior iliac spine to the umbilicus.', '基部的體表位置是麥氏點，即髂前上棘到肚臍連線的外三分之一處。'),
    blood: b('Appendicular artery, a branch of the ileocolic artery, in the mesoappendix.', '闌尾動脈，來自迴結腸動脈，走在闌尾繫膜內。'),
    note: b('Pain of appendicitis starts around the umbilicus (T10) and moves to the right iliac fossa when the parietal peritoneum is irritated.', '闌尾炎的疼痛先在肚臍周圍（T10），刺激到壁層腹膜後轉移到右髂窩。'),
  }, {quizSystem: 'viscera'}),

  // ---- parts of the colon and rectum
  part('Cecum', 'Cecum', '盲腸', 'zones', '#f0c24f', {
    loc: b('The blind pouch of the large intestine below the ileocaecal junction, in the right iliac fossa. Here it is the part of the colon below the entry of the ileum.', '迴盲部以下的大腸盲囊，位在右髂窩。這裡標示的是迴腸進入點以下的結腸。'),
    rel: b('It lies on the iliacus and psoas major; the appendix arises from it.', '位在髂肌與腰大肌上；闌尾由它發出。'),
    blood: b('Anterior and posterior caecal arteries from the ileocolic artery.', '來自迴結腸動脈的前盲腸動脈與後盲腸動脈。'),
  }, {mark: zone('Colon', 1), schematic: true}),
  part('Ascending colon', 'Ascending colon', '升結腸', 'zones', '#7fbf7f', {
    loc: b('About 15 cm long, from the caecum up the right side of the abdomen to the right colic flexure under the liver.', '長約 15 公分，由盲腸沿右側腹部上升到肝下方的右結腸彎曲。'),
    rel: b('Retroperitoneal on the back wall over the iliacus, quadratus lumborum and right kidney; the right paracolic gutter lies lateral to it.', '位在腹膜後，貼在髂肌、腰方肌與右腎前方；外側是右結腸旁溝。'),
    blood: b('Ileocolic and right colic arteries.', '迴結腸動脈與右結腸動脈。'),
  }, {mark: zone('Colon', 2), schematic: true}),
  part('Transverse colon', 'Transverse colon', '橫結腸', 'zones', '#6aa9d8', {
    loc: b('About 45 cm long, from the right to the left colic flexure, hanging down in a loop on the transverse mesocolon.', '長約 45 公分，由右結腸彎曲到左結腸彎曲，以橫結腸繫膜懸掛，向下呈弧形。'),
    rel: b('The greater omentum hangs from it in front; the stomach lies above and the small intestine below.', '前方垂掛大網膜；上方是胃，下方是小腸。'),
    blood: b('Mainly the middle colic artery; its left third from the left colic artery.', '主要由中結腸動脈供應；左三分之一由左結腸動脈供應。'),
  }, {mark: zone('Colon', 3), schematic: true}),
  part('Descending colon', 'Descending colon', '降結腸', 'zones', '#b48fd0', {
    loc: b('About 25 cm long, from the left colic flexure down the left side of the abdomen to the pelvic brim.', '長約 25 公分，由左結腸彎曲沿左側腹部下降到骨盆緣。'),
    rel: b('Retroperitoneal on the left kidney, quadratus lumborum and iliacus; the left paracolic gutter lies lateral to it.', '位在腹膜後，貼在左腎、腰方肌與髂肌前方；外側是左結腸旁溝。'),
    blood: b('Left colic artery.', '左結腸動脈。'),
  }, {mark: zone('Colon', 4), schematic: true}),
  part('Sigmoid colon', 'Sigmoid colon', '乙狀結腸', 'zones', '#b0a050', {
    loc: b('An S-shaped loop, about 40 cm long, from the pelvic brim to the start of the rectum at S3. Here it is the end of the colon piece from where it turns towards the midline.', '呈 S 形的腸袢，長約 40 公分，由骨盆緣到第三薦椎的直腸起點。這裡標示的是結腸轉向中線以後的末段。'),
    rel: b('It hangs on the sigmoid mesocolon and moves freely; its loops lie in the pelvis.', '以乙狀結腸繫膜懸掛，可自由移動；腸袢位在骨盆內。'),
    blood: b('Sigmoid arteries from the inferior mesenteric artery.', '來自下腸繫膜動脈的乙狀結腸動脈。'),
  }, {mark: zone('Colon', 5), schematic: true}),
  part('Anal canal', 'Anal canal', '肛管', 'zones', '#7fbf7f', {
    loc: b('The last 3–4 cm of the gut, from the anorectal junction at the puborectalis sling down and back to the anus. Here it is the lowest 35 mm of the rectum piece of the atlas.', '消化道最後 3 至 4 公分，由恥骨直腸肌吊帶處的肛管直腸交界向下向後到肛門。這裡標示圖譜直腸模型最下方 35 公釐。'),
    rel: b('Surrounded by the internal and external anal sphincters; its lining changes at the pectinate line.', '周圍有肛門內、外括約肌；黏膜在齒狀線處改變。'),
    blood: b('Above the pectinate line the superior rectal vessels (portal drainage); below it the inferior rectal vessels (systemic drainage).', '齒狀線以上由上直腸血管供應（回流到門靜脈）；以下由下直腸血管供應（回流到體循環）。'),
    nerve: b('Above the pectinate line autonomic (painless); below it the inferior rectal nerves (painful).', '齒狀線以上為自主神經（不痛）；以下為下直腸神經（會痛）。'),
  }, {mark: zone('Rectum', 2), schematic: true}),
  part('Haustra of colon', 'Haustra of colon', '結腸袋', 'marks', '#2f3437', {
    loc: b('The sacculations of the colon wall between the taeniae, separated by semilunar folds. Marked here on the bulges of the colon model.', '結腸帶之間管壁的袋狀膨出，彼此以半月皺襞分隔。這裡標示在結腸模型的膨出處。'),
    rel: b('They are absent from the rectum and appendix; on X-ray their folds cross only part of the lumen, unlike the circular folds of the small intestine.', '直腸與闌尾沒有結腸袋；X 光上其皺襞只橫過部分管腔，與小腸的環狀皺襞不同。'),
    fn: b('They form because the taeniae are shorter than the colon wall.', '因結腸帶比管壁短，管壁被收縮成袋狀。'),
  }, {mark: line('Colon', 1), schematic: true}),
  part('Right colic flexure', 'Right colic flexure', '右結腸彎曲', 'marks', '#8a5a3a', {
    loc: b('The bend between the ascending and transverse colon, under the right lobe of the liver (hepatic flexure).', '升結腸與橫結腸之間的轉彎處，位在肝右葉下方（肝曲）。'),
    rel: b('It lies in front of the lower part of the right kidney.', '位在右腎下部前方。'),
    blood: b('Right colic artery.', '右結腸動脈。'),
  }, {mark: line('Colon', 2), schematic: true}),
  part('Left colic flexure', 'Left colic flexure', '左大腸彎', 'marks', '#3d6e8f', {
    loc: b('The sharper, higher bend between the transverse and descending colon, against the spleen (splenic flexure).', '橫結腸與降結腸之間、較高較急的轉彎處，靠著脾臟（脾曲）。'),
    rel: b('The phrenicocolic ligament holds it to the diaphragm; it lies on the left kidney.', '由膈結腸韌帶固定在橫膈上；位在左腎前方。'),
    blood: b('Left colic artery; the meeting point of the superior and inferior mesenteric territories is near here.', '左結腸動脈；上、下腸繫膜動脈供應範圍的交會處在這附近。'),
  }, {mark: line('Colon', 3), schematic: true}),
  part('Ileocecal valve', 'Ileocecal valve', '迴盲瓣', 'marks', '#c83aa0', {
    loc: b('Two lips of the bowel wall at the opening of the ileum into the large intestine. Marked here on the outer wall at that place; the valve itself lies inside.', '迴腸開口於大腸處由腸壁形成的上下兩唇。這裡把標示畫在同一位置的外壁上，瓣本身在腸腔內面。'),
    fn: b('Slows the passage of contents into the caecum and limits reflux from it.', '減慢內容物進入盲腸，並限制逆流。'),
    rel: b('It lies at the junction of the caecum and ascending colon.', '位在盲腸與升結腸交界處。'),
  }, {mark: line('Colon', 4), schematic: true}),
  part('Anus', 'Anus', '肛門', 'marks', '#2f3437', {
    loc: b('The lower opening of the anal canal, in the perineum about 4 cm in front of the tip of the coccyx. Marked here around the lower end of the model.', '肛管的下開口，位在會陰、尾骨尖前方約 4 公分處。這裡標示在模型下端周圍。'),
    rel: b('Surrounded by the external anal sphincter and the skin of the perineum.', '周圍有肛門外括約肌與會陰皮膚。'),
    nerve: b('Inferior rectal nerves (from the pudendal nerve).', '下直腸神經（來自陰部神經）。'),
  }, {mark: line('Rectum', 1), schematic: true}),

  // ---- wall structures
  part('Taeniae coli', 'Taeniae coli', '結腸帶', 'wall', '#e0d8b0', {
    loc: b('Three narrow bands of longitudinal muscle on the colon (free, mesocolic and omental taenia), about 1 cm wide, running from the base of the appendix to the rectum.', '結腸上的三條縱肌帶（獨立帶、繫膜帶與網膜帶），寬約 1 公分，由闌尾基部延伸到直腸。'),
    rel: b('They meet at the base of the appendix (a guide to finding it) and spread out to form a continuous layer on the rectum.', '在闌尾基部會合（可據此找到闌尾），到直腸則散開成完整的一層。'),
    fn: b('Being shorter than the wall, they gather it into haustra.', '因比管壁短，把管壁收縮成結腸袋。'),
  }, {quizSystem: 'viscera'}),
  part('Omental appendices', 'Omental (epiploic) appendices', '腸脂垂', 'wall', '#f0d070', {
    loc: b('Small fat-filled pouches of peritoneum hanging from the colon along the taeniae, mostly on the transverse and sigmoid colon. Built here as schematic tags every 2 cm.', '沿結腸帶垂掛在結腸上、充滿脂肪的小腹膜囊，以橫結腸與乙狀結腸最多。這裡每 2 公分做一個示意小垂。'),
    rel: b('They are absent from the caecum, appendix and rectum.', '盲腸、闌尾與直腸沒有腸脂垂。'),
    note: b('One can twist and become inflamed (epiploic appendagitis), mimicking appendicitis or diverticulitis.', '腸脂垂扭轉發炎時，症狀可類似闌尾炎或憩室炎。'),
  }, {schematic: true, quizSystem: 'viscera'}),

  // ---- mesenteries
  part('Mesentery', 'Mesentery', '小腸繫膜', 'peritoneum', '#e8dcc0', {
    loc: b('The fan-shaped double fold of peritoneum that suspends the jejunum and ileum from the posterior abdominal wall.', '把空腸與迴腸懸掛在後腹壁上、呈扇形的雙層腹膜皺襞。'),
    contents: b('The jejunal and ileal vessels with their arcades and vasa recta, lymph nodes, nerves and fat.', '空腸與迴腸的血管（含動脈弓與直血管）、淋巴結、神經與脂肪。'),
    rel: b('Its root is only about 15 cm long, while its intestinal border is about 6 m.', '根部只有約 15 公分長，連小腸的一緣卻長約 6 公尺。'),
  }, {opacity: .35, quizSystem: 'viscera'}),
  part('Root of mesentery', 'Root of mesentery', '腸繫膜根部', 'peritoneum', '#a08050', {
    loc: b('The attachment of the mesentery to the posterior abdominal wall, running obliquely from the duodenojejunal flexure (left of L2) to the right sacroiliac joint. Marked here along the back border of the mesentery.', '小腸繫膜附著在後腹壁上的部分，由十二指腸空腸彎曲（第二腰椎左側）斜向右下到右薦髂關節。這裡沿繫膜後緣標示。'),
    rel: b('It crosses the inferior part of the duodenum, aorta, inferior vena cava, right ureter and right psoas major.', '越過十二指腸下部、主動脈、下腔靜脈、右輸尿管與右腰大肌。'),
    contents: b('The superior mesenteric vessels enter the mesentery here.', '上腸繫膜動靜脈由此進入小腸繫膜。'),
  }, {mark: line('Mesentery', 1), schematic: true, quizSystem: 'viscera'}),
  part('Transverse mesocolon', 'Transverse mesocolon', '橫結腸繫膜', 'peritoneum', '#e8dcc0', {
    loc: b('The fold of peritoneum that suspends the transverse colon from the front of the pancreas.', '把橫結腸懸掛在胰臟前方的腹膜皺襞。'),
    contents: b('The middle colic vessels.', '中結腸動靜脈。'),
    rel: b('It divides the peritoneal cavity into supracolic and infracolic compartments.', '把腹膜腔分成結腸上區與結腸下區。'),
  }, {opacity: .35, quizSystem: 'viscera'}),
  part('Mesoappendix', 'Mesoappendix', '闌尾繫膜', 'peritoneum', '#e8dcc0', {
    loc: b('A small triangular fold of peritoneum from the lower mesentery to the appendix.', '由小腸繫膜下端連到闌尾的小三角形腹膜皺襞。'),
    contents: b('The appendicular artery and vein.', '闌尾動脈與闌尾靜脈。'),
    rel: b('It lies behind the terminal ileum.', '位在迴腸末段後方。'),
  }, {opacity: .45, quizSystem: 'viscera'}),

  // ---- arteries
  art('Abdominal aorta', '腹主動脈', {
    loc: b('The aorta in the abdomen; only the stretch from the superior to the inferior mesenteric artery is shown.', '腹部的主動脈；這裡只顯示上腸繫膜動脈到下腸繫膜動脈之間的一段。'),
    course: b('It gives the superior mesenteric artery at L1 and the inferior mesenteric artery at L3.', '在第一腰椎發出上腸繫膜動脈，在第三腰椎發出下腸繫膜動脈。'),
    rel: b('The intermesenteric plexus lies on its front.', '中腸繫膜叢位在它的前面。'),
  }, {opacity: .55}),
  art('Superior mesenteric artery', '上腸繫膜動脈', {
    course: b('From the aorta at L1, behind the neck of the pancreas, down in front of the duodenum into the root of the mesentery and on to the right iliac fossa.', '在第一腰椎由主動脈發出，經胰頸後方、十二指腸前方下行入小腸繫膜根，再到右髂窩。'),
    rel: b('Jejunal and ileal branches leave its left side; the middle colic, right colic and ileocolic arteries its right side.', '左側發出空腸與迴腸動脈；右側發出中結腸、右結腸與迴結腸動脈。'),
    fn: b('Supplies the midgut, from the major duodenal papilla to about two thirds along the transverse colon.', '供應中腸，從大十二指腸乳突到橫結腸約三分之二處。'),
  }),
  art('Jejunal arteries', '空腸動脈', {
    course: b('Branches of the left side of the superior mesenteric artery that run in the mesentery, join in one or two rows of arcades and end in long vasa recta. Built here as schematic tubes.', '上腸繫膜動脈左側的分支，走在小腸繫膜內，連成一至兩排動脈弓，末端是長的直血管。這裡是示意管。'),
    rel: b('They lie in the upper, left part of the mesentery.', '位在小腸繫膜的左上部。'),
    fn: b('They supply the jejunum.', '負責供應空腸的血液。'),
  }, {schematic: true}),
  art('Ileal arteries', '迴腸動脈', {
    course: b('Branches of the superior mesenteric artery to the ileum, forming three to five rows of arcades with short vasa recta. One comes from the atlas; the others are schematic tubes.', '上腸繫膜動脈到迴腸的分支，形成三至五排動脈弓，直血管短。一條來自圖譜，其餘是示意管。'),
    rel: b('They lie in the lower part of the mesentery, with more fat around them.', '位在小腸繫膜下部，周圍脂肪較多。'),
    fn: b('They supply the ileum.', '負責供應迴腸的血液。'),
  }, {schematic: true}),
  art('Ileocolic artery', '迴結腸動脈', {
    course: b('The last branch of the right side of the superior mesenteric artery, to the ileocaecal junction; it gives ileal, caecal and colic branches and the appendicular artery.', '上腸繫膜動脈右側最後一條分支，到迴盲部；發出迴腸支、盲腸支、結腸支與闌尾動脈。'),
    rel: b('It runs down and to the right behind the peritoneum.', '在腹膜後向右下走。'),
    fn: b('Supplies the terminal ileum, caecum, appendix and lower ascending colon.', '供應迴腸末段、盲腸、闌尾與升結腸下段。'),
  }),
  art('Appendicular artery', '闌尾動脈', {
    course: b('From the ileocolic artery, behind the terminal ileum, into the mesoappendix to the tip of the appendix.', '由迴結腸動脈發出，經迴腸末段後方進入闌尾繫膜，到闌尾尖端。'),
    rel: b('It runs in the free edge of the mesoappendix.', '走在闌尾繫膜的游離緣。'),
    fn: b('Supplies the appendix; it is an end artery, so blockage leads to gangrene.', '供應闌尾；它是終末動脈，阻塞時闌尾會壞死。'),
  }),
  art('Anterior cecal artery', '前盲腸動脈', {
    course: b('A branch of the ileocolic artery to the front of the caecum.', '迴結腸動脈到盲腸前面的分支。'),
    rel: b('It runs in the anterior caecal fold.', '走在盲腸前皺襞內。'),
    fn: b('Supplies the front of the caecum.', '供應盲腸前面。'),
  }),
  art('Posterior cecal artery', '後盲腸動脈', {
    course: b('A branch of the ileocolic artery to the back of the caecum.', '迴結腸動脈到盲腸後面的分支。'),
    rel: b('It runs behind the ileocaecal junction.', '走在迴盲部後方。'),
    fn: b('Supplies the back of the caecum.', '供應盲腸後面。'),
  }),
  art('Right colic artery', '右結腸動脈', {
    course: b('From the superior mesenteric (or ileocolic) artery, to the right behind the peritoneum to the ascending colon, where it divides and joins its neighbours.', '由上腸繫膜（或迴結腸）動脈發出，在腹膜後向右到升結腸，分支後與鄰近動脈相接。'),
    rel: b('It crosses the right gonadal vessels and ureter.', '越過右側生殖腺血管與右輸尿管。'),
    fn: b('Supplies the ascending colon and right colic flexure.', '供應升結腸與右結腸彎曲。'),
  }),
  art('Middle colic artery', '中結腸動脈', {
    course: b('From the superior mesenteric artery just below the pancreas, forward in the transverse mesocolon, dividing into right and left branches.', '在胰下緣附近由上腸繫膜動脈發出，在橫結腸繫膜內向前走，分成左右兩支。'),
    rel: b('It lies in the transverse mesocolon, to the right of the midline.', '位在橫結腸繫膜內、中線右側。'),
    fn: b('Supplies the transverse colon.', '供應橫結腸。'),
  }),
  art('Marginal artery of colon', '結腸邊緣動脈', {
    course: b('A continuous arterial channel along the inner border of the colon, formed by the joined branches of all the colic arteries.', '沿結腸內緣、由各結腸動脈的分支連成的連續動脈通道。'),
    rel: b('Short straight branches go from it to the colon wall.', '由它發出短的直動脈到結腸壁。'),
    fn: b('Links the superior and inferior mesenteric territories, a bypass when one is blocked.', '連通上、下腸繫膜動脈的供應範圍，一條阻塞時可作繞道。'),
  }),
  art('Inferior mesenteric artery', '下腸繫膜動脈', {
    course: b('From the front of the aorta at L3, behind the inferior part of the duodenum, down and to the left; it ends as the superior rectal artery.', '在第三腰椎由主動脈前壁發出，經十二指腸下部後方向左下走，終於上直腸動脈。'),
    rel: b('The inferior mesenteric ganglion and plexus surround its root.', '根部有下腸繫膜神經節與神經叢包圍。'),
    fn: b('Supplies the hindgut: the last third of the transverse colon to the upper anal canal.', '供應後腸：橫結腸後三分之一到肛管上段。'),
  }),
  art('Left colic artery', '左結腸動脈', {
    course: b('The first branch of the inferior mesenteric artery; it runs to the left behind the peritoneum and divides into ascending and descending branches.', '下腸繫膜動脈的第一條分支，在腹膜後向左走，分成升支與降支。'),
    rel: b('It crosses the left ureter and gonadal vessels.', '越過左輸尿管與左生殖腺血管。'),
    fn: b('Supplies the distal transverse colon, left colic flexure and descending colon.', '供應橫結腸遠段、左結腸彎曲與降結腸。'),
  }),
  art('Sigmoid arteries', '乙狀結腸動脈', {
    course: b('Two to four branches of the inferior mesenteric artery that run down and to the left in the sigmoid mesocolon.', '下腸繫膜動脈的二至四條分支，在乙狀結腸繫膜內向左下走。'),
    rel: b('They join each other and the left colic artery in arcades.', '彼此及與左結腸動脈連成動脈弓。'),
    fn: b('Supply the sigmoid colon and lower descending colon.', '供應乙狀結腸與降結腸下段。'),
  }),
  art('Superior rectal artery', '上直腸動脈', {
    course: b('The continuation of the inferior mesenteric artery across the left common iliac vessels into the pelvis, dividing on the back of the rectum.', '下腸繫膜動脈的延續，越過左髂總血管進入骨盆，在直腸後面分支。'),
    rel: b('It lies in the root of the sigmoid mesocolon.', '位在乙狀結腸繫膜根部。'),
    fn: b('Supplies the rectum and the anal canal above the pectinate line.', '供應直腸與齒狀線以上的肛管。'),
  }),

  // ---- veins (portal system)
  portal('Superior mesenteric vein', '上腸繫膜靜脈', {
    course: b('Runs up on the right of the superior mesenteric artery in the root of the mesentery and ends behind the neck of the pancreas by joining the splenic vein.', '在小腸繫膜根內、上腸繫膜動脈右側上行，在胰頸後方與脾靜脈會合而終。'),
    rel: b('Its tributaries follow the branches of the artery.', '屬支與動脈分支同行。'),
    fn: b('Drains the midgut.', '引流中腸的靜脈血。'),
  }),
  portal('Inferior mesenteric vein', '下腸繫膜靜脈', {
    course: b('Continues up from the superior rectal vein, left of the duodenojejunal flexure, and usually ends in the splenic vein behind the pancreas.', '由上直腸靜脈向上延續，經十二指腸空腸彎曲左側，通常在胰後方注入脾靜脈。'),
    rel: b('It does not run with its artery in its upper part.', '上段不與其動脈同行。'),
    fn: b('Drains the hindgut.', '引流後腸的靜脈血。'),
  }),
  portal('Ileocolic vein', '迴結腸靜脈', {
    course: b('Accompanies the ileocolic artery and drains into the superior mesenteric vein.', '伴隨迴結腸動脈，注入上腸繫膜靜脈。'),
    rel: b('It receives the appendicular vein.', '接收闌尾靜脈。'),
    fn: b('Drains the terminal ileum, caecum and appendix.', '引流迴腸末段、盲腸與闌尾。'),
  }),
  portal('Ileal veins', '迴腸靜脈', {
    course: b('Veins of the ileum that run with the ileal arteries to the superior mesenteric vein.', '伴隨迴腸動脈、注入上腸繫膜靜脈的迴腸靜脈。'),
    rel: b('They lie in the mesentery.', '位在小腸繫膜內。'),
    fn: b('Drain the ileum.', '引流迴腸的靜脈血。'),
  }),
  portal('Right colic vein', '右結腸靜脈', {
    course: b('Accompanies the right colic artery to the superior mesenteric vein.', '伴隨右結腸動脈，注入上腸繫膜靜脈。'),
    rel: b('It runs behind the peritoneum.', '走在腹膜後。'),
    fn: b('Drains the ascending colon.', '引流升結腸。'),
  }),
  portal('Middle colic vein', '中結腸靜脈', {
    course: b('Accompanies the middle colic artery in the transverse mesocolon to the superior mesenteric vein.', '在橫結腸繫膜內伴隨中結腸動脈，注入上腸繫膜靜脈。'),
    rel: b('It lies in the transverse mesocolon.', '位在橫結腸繫膜內。'),
    fn: b('Drains the transverse colon.', '引流橫結腸。'),
  }),
  portal('Left colic vein', '左結腸靜脈', {
    course: b('Accompanies the left colic artery to the inferior mesenteric vein.', '伴隨左結腸動脈，注入下腸繫膜靜脈。'),
    rel: b('It runs behind the peritoneum.', '走在腹膜後。'),
    fn: b('Drains the descending colon.', '引流降結腸。'),
  }),
  portal('Sigmoid veins', '乙狀結腸靜脈', {
    course: b('Accompany the sigmoid arteries to the inferior mesenteric vein.', '伴隨乙狀結腸動脈，注入下腸繫膜靜脈。'),
    rel: b('They lie in the sigmoid mesocolon.', '位在乙狀結腸繫膜內。'),
    fn: b('Drain the sigmoid colon.', '引流乙狀結腸。'),
  }),
  portal('Superior rectal vein', '上直腸靜脈', {
    course: b('Drains the rectum and upper anal canal and continues up as the inferior mesenteric vein.', '引流直腸與肛管上段，向上延續為下腸繫膜靜脈。'),
    rel: b('It joins the middle and inferior rectal veins in the wall of the anal canal, a portal-systemic anastomosis.', '在肛管壁內與中、下直腸靜脈相接，是門體吻合之一。'),
    fn: b('Portal drainage of the rectum.', '直腸的門靜脈回流。'),
  }),

  // ---- nerves
  part('Right superior mesenteric ganglion', 'Right superior mesenteric ganglion', '右上腸繫膜神經節', 'nerves', GANGLION, {
    loc: b('Beside the root of the superior mesenteric artery.', '位在上腸繫膜動脈根部旁。'),
    rel: b('Continuous with the celiac ganglion above.', '向上與腹腔神經節相連。'),
    fn: b('Sympathetic relay for the midgut.', '中腸的交感神經中繼站。'),
  }, {quizSystem: 'nervous', side: 'right'}),
  part('Left superior mesenteric ganglion', 'Left superior mesenteric ganglion', '左上腸繫膜神經節', 'nerves', GANGLION, {
    loc: b('On the left of the root of the superior mesenteric artery.', '位在上腸繫膜動脈根部左側。'),
    rel: b('Joined to the right ganglion around the artery.', '環繞動脈與右側神經節相連。'),
    fn: b('Sympathetic relay for the midgut.', '中腸的交感神經中繼站。'),
  }, {quizSystem: 'nervous', side: 'left'}),
  part('Inferior mesenteric ganglion', 'Inferior mesenteric ganglion', '下腸繫膜神經節', 'nerves', GANGLION, {
    loc: b('A small ganglion beside the root of the inferior mesenteric artery. Built here as a schematic knot.', '位在下腸繫膜動脈根部旁的小神經節。這裡是示意結節。'),
    rel: b('The lumbar splanchnic nerves end in it.', '腰內臟神經終止於此。'),
    fn: b('Sympathetic relay for the hindgut.', '後腸的交感神經中繼站。'),
  }, {schematic: true, quizSystem: 'nervous'}),
  nerve('Superior mesenteric plexus', '上腸繫膜叢', {
    loc: b('The network around the superior mesenteric artery. Built here as schematic strands along its first part.', '環繞上腸繫膜動脈的神經網。這裡是沿動脈起始段的示意纖維。'),
    contents: b('Sympathetic fibres from the superior mesenteric ganglia and vagal parasympathetic fibres.', '來自上腸繫膜神經節的交感纖維與迷走神經的副交感纖維。'),
    fn: b('Supplies the midgut along the branches of the artery.', '沿動脈分支支配中腸。'),
  }, {schematic: true}),
  nerve('Intermesenteric plexus', '中腸繫膜叢', {
    loc: b('Strands on the front and sides of the aorta between the superior and inferior mesenteric arteries. Built here as schematic strands.', '位在上、下腸繫膜動脈之間、主動脈前面與兩側的神經纖維。這裡是示意纖維。'),
    contents: b('Sympathetic fibres, joined by the lumbar splanchnic nerves.', '交感纖維，並有腰內臟神經加入。'),
    fn: b('Links the superior and inferior mesenteric plexuses and continues down as the superior hypogastric plexus.', '連接上、下腸繫膜叢，向下延續為上腹下叢。'),
  }, {schematic: true}),
  nerve('Inferior mesenteric plexus', '下腸繫膜叢', {
    loc: b('The network around the inferior mesenteric artery. Built here as a schematic strand along its first part.', '環繞下腸繫膜動脈的神經網。這裡是沿動脈起始段的示意纖維。'),
    contents: b('Sympathetic fibres and parasympathetic fibres from the pelvic splanchnic nerves that come up through the hypogastric plexuses.', '交感纖維，以及經下腹叢上行、來自骨盆內臟神經的副交感纖維。'),
    fn: b('Supplies the hindgut along the branches of the artery.', '沿動脈分支支配後腸。'),
  }, {schematic: true}),

  // ---- card only
  note('Superior mesenteric nodes', 'Superior mesenteric nodes', '上腸繫膜淋巴結', {
    loc: b('Around the root of the superior mesenteric artery.', '位在上腸繫膜動脈根部周圍。'),
    course: b('They receive lymph from the mesenteric, ileocolic and colic nodes and drain into the intestinal trunk.', '接收腸繫膜、迴結腸與結腸淋巴結的淋巴，注入腸幹。'),
    fn: b('Last station for the lymph of the midgut.', '中腸淋巴的最後一站。'),
  }),
  note('Inferior mesenteric nodes', 'Inferior mesenteric nodes', '下腸繫膜淋巴結', {
    loc: b('Around the root of the inferior mesenteric artery.', '位在下腸繫膜動脈根部周圍。'),
    course: b('They receive lymph from the left colon, sigmoid colon and upper rectum and drain to the lumbar (aortic) nodes or the intestinal trunk.', '接收左側結腸、乙狀結腸與直腸上段的淋巴，注入腰（主動脈旁）淋巴結或腸幹。'),
    fn: b('Last station for the lymph of the hindgut.', '後腸淋巴的最後一站。'),
  }),
  note('Plicae circulares', 'Plicae circulares', '環狀皺襞', {
    loc: b('Permanent circular folds of the lining of the small intestine, tall and close in the jejunum, low and sparse in the ileum.', '小腸黏膜永久的環狀皺襞；在空腸高而密，在迴腸低而疏。'),
    fn: b('Increase the absorptive surface and slow the passage of contents.', '增加吸收面積並減慢內容物通過。'),
    note: b('They are inside the bowel and have no model here.', '位在腸腔內面，這裡沒有模型。'),
  }),
  note('Vasa recta', 'Vasa recta', '直血管', {
    loc: b('Straight arteries from the last arcade to the bowel wall.', '由最後一排動脈弓直達腸壁的直行動脈。'),
    rel: b('Long and few in the jejunum, short and many in the ileum.', '空腸的長而少，迴腸的短而多。'),
    fn: b('End arteries of the small intestine wall.', '小腸壁的終末動脈。'),
  }),
  note('Arterial arcades', 'Arterial arcades', '動脈弓', {
    loc: b('Loops formed by neighbouring jejunal and ileal arteries in the mesentery.', '鄰近的空腸、迴腸動脈在小腸繫膜內連成的弧形。'),
    rel: b('One or two rows for the jejunum, three to five rows for the ileum.', '空腸一至兩排，迴腸三至五排。'),
    fn: b('Keep the blood supply when the bowel moves or one branch is blocked.', '腸管移動或一支阻塞時仍能維持血流。'),
  }),
  note('Peyer\'s patches', "Peyer's patches", '培氏斑', {
    loc: b('Oval collections of lymphoid follicles in the wall of the ileum, opposite the mesenteric border.', '迴腸壁內、對著繫膜附著緣的橢圓形淋巴濾泡群。'),
    fn: b('Sample gut contents and start immune responses.', '取樣腸內物質並啟動免疫反應。'),
    note: b('Microscopic and inside the wall; no model here.', '屬顯微構造且位在腸壁內，這裡沒有模型。'),
  }),
  note('Sigmoid mesocolon', 'Sigmoid mesocolon', '乙狀結腸繫膜', {
    loc: b('An inverted-V fold of peritoneum that suspends the sigmoid colon from the pelvic wall.', '把乙狀結腸懸掛在骨盆壁上、呈倒 V 形的腹膜皺襞。'),
    contents: b('Sigmoid and superior rectal vessels.', '乙狀結腸血管與上直腸血管。'),
    rel: b('The left ureter lies behind the apex of its root.', '左輸尿管位在其根部頂點後方。'),
  }),
  note('Mesocolon', 'Mesocolon', '結腸繫膜', {
    loc: b('The peritoneal folds that suspend the colon: the transverse and sigmoid mesocolon persist; those of the ascending and descending colon fuse with the back wall during development.', '懸掛結腸的腹膜皺襞：橫結腸繫膜與乙狀結腸繫膜保留下來；升結腸與降結腸的繫膜在發育中與後腹壁融合。'),
    contents: b('The colic vessels, nerves and lymph nodes.', '結腸的血管、神經與淋巴結。'),
    rel: b('Fusion leaves the ascending and descending colon retroperitoneal.', '融合後升結腸與降結腸位在腹膜後。'),
  }),
  note('Paracolic gutters', 'Paracolic gutters', '結腸旁溝', {
    loc: b('Grooves of the peritoneal cavity lateral to the ascending and descending colon.', '升結腸與降結腸外側的腹膜腔溝槽。'),
    rel: b('The right gutter leads up to the hepatorenal recess; the left is closed above by the phrenicocolic ligament.', '右側溝向上通到肝腎隱窩；左側溝上方被膈結腸韌帶封住。'),
    note: b('Fluid and infection can spread along them.', '液體與感染可沿溝擴散。'),
  }),
  note('Phrenicocolic ligament', 'Phrenicocolic ligament', '橫膈結腸韌帶', {
    loc: b('A fold of peritoneum from the left colic flexure to the diaphragm.', '由左結腸彎曲連到橫膈的腹膜皺襞。'),
    rel: b('The lower pole of the spleen rests on it.', '脾的下端靠在它上面。'),
    fn: b('Supports the left colic flexure and closes the top of the left paracolic gutter.', '支持左結腸彎曲，並封住左結腸旁溝的上端。'),
  }),
  note('Middle rectal veins', 'Middle rectal veins', '中直腸靜脈', {
    course: b('Drain the lower rectum to the internal iliac veins.', '引流直腸下段，注入髂內靜脈。'),
    rel: b('They join the superior and inferior rectal veins in the rectal plexus.', '在直腸靜脈叢內與上、下直腸靜脈相接。'),
    note: b('Their model is part of the missing-vessel work and is not in this package yet.', '它們的模型屬於缺的血管分支工作，尚未放進這個器官包。'),
  }),
  note('Inferior rectal veins', 'Inferior rectal veins', '下直腸靜脈', {
    course: b('Drain the anal canal below the pectinate line to the internal pudendal veins.', '引流齒狀線以下的肛管，注入陰部內靜脈。'),
    rel: b('They form an anastomosis with the superior rectal vein (portal-systemic).', '與上直腸靜脈相接（門體吻合）。'),
    note: b('Their model is part of the missing-vessel work and is not in this package yet.', '它們的模型屬於缺的血管分支工作，尚未放進這個器官包。'),
  }),

  // ---- related muscles
  part('External anal sphincter', 'External anal sphincter', '肛門外括約肌', 'muscles', '#b8695c', {
    loc: b('Skeletal muscle around the lower anal canal, in subcutaneous, superficial and deep parts.', '環繞肛管下段的骨骼肌，分皮下、淺、深三部。'),
    nerve: b('Inferior rectal nerve (pudendal nerve, S2–S4).', '下直腸神經（陰部神經，S2–S4）。'),
    fn: b('Voluntary closure of the anus.', '隨意控制肛門閉合。'),
  }, {opacity: .5}),
  part('Puborectalis', 'Puborectalis', '恥骨直腸肌', 'muscles', '#b8695c', {
    loc: b('The part of levator ani that slings round the anorectal junction from the back of the pubis.', '提肛肌的一部分，由恥骨後面繞過肛管直腸交界形成吊帶。'),
    nerve: b('Nerve to levator ani (S4) and the pudendal nerve.', '提肛肌神經（S4）與陰部神經。'),
    fn: b('Keeps the anorectal angle and helps continence; it relaxes during defaecation.', '維持肛管直腸角、幫助控制排便；排便時放鬆。'),
  }, {opacity: .5}),
];

export const INTESTINES: OrganDef = {
  id: 'intestines', zh: '小腸與大腸', en: 'Small and large intestine', manifest: 'models/organ/intestines/intestines.json',
  groups, parts, coreGroups: ['organs', 'zones', 'marks'], zonesDefault: true, glassGroups: ['organs'],
  presets: [
    {id: 'organ', en: 'Organ', zh: '器官', show: ['organs', 'zones', 'marks', 'wall', 'peritoneum', 'muscles', 'cardonly'], zones: true},
    {id: 'arteries', en: 'Arteries', zh: '動脈', show: ['arteries'], ghost: ['organs']},
    {id: 'veins', en: 'Veins', zh: '靜脈', show: ['veins'], ghost: ['organs']},
    {id: 'nerves', en: 'Nerves', zh: '神經', show: ['nerves'], ghost: ['organs']},
    {id: 'overview', en: 'Overview', zh: '全部', show: ['organs', 'marks', 'wall', 'peritoneum', 'arteries', 'veins', 'nerves', 'muscles', 'cardonly'], glass: true, zones: false},
  ],
  peelNote: '由外而內：神經 → 靜脈 → 動脈 → 相關肌肉 → 腸繫膜 → 結腸帶與腸脂垂 → 結腸袋、結腸彎、迴盲瓣與肛門的標示 → 結腸與直腸各部顏色 → 腸本身。',
  scope: [
    '結腸由圖譜的升、橫、降三段拼合而成；盲腸、升結腸、橫結腸、降結腸、乙狀結腸，以及直腸與肛管，都是標示在模型表面上的位置，邊界為示意。圖譜的降結腸模型一直延伸到骨盆，這裡把它轉向中線以後的部分標示為乙狀結腸。',
    '結腸袋標示在結腸模型的膨出處；迴盲瓣標示在同一位置的外壁上；腸繫膜根部沿繫膜後緣標示。腸脂垂、空腸動脈、大部分迴腸動脈、下腸繫膜神經節與中腸繫膜叢、上下腸繫膜叢是依一般描述畫成的示意模型。',
    '淋巴結、環狀皺襞、直血管、動脈弓、培氏斑、乙狀結腸繫膜、結腸旁溝與膈結腸韌帶只有資訊卡；中、下直腸靜脈的模型屬於缺的血管分支工作，尚未放進來。',
  ],
};
