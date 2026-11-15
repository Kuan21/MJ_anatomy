// Data cards of the female pelvic structures (Human Reference Atlas female set, drawn only when the sex switch is on "female"), and of the urinary structures that share the pelvis.
// Written in our own words from standard open anatomy references; keys are lower-case names without Left/Right (the card lookup strips the side).
import type {StructureProfile} from './mj-structure-info';

type Body=Omit<StructureProfile,'english'>;
const SOURCE='Standard gross-anatomy references (open-licence atlas and textbook descriptions)';
type F=[string,string,string,string];
const card=(chinese:string,category:string,summaryEn:string,summaryZh:string,facts:F[]):Body=>({
 chinese,category,summaryEn,summaryZh,source:SOURCE,
 facts:facts.map(([labelEn,labelZh,valueEn,valueZh])=>({labelEn,labelZh,valueEn,valueZh}))
});
const R='Reproductive｜生殖系統';
const U='Urinary｜泌尿系統';
const L='Ligament｜韌帶';
const loc=(en:string,zh:string):F=>['Location','位置',en,zh];
const rel=(en:string,zh:string):F=>['Relations','毗鄰',en,zh];
const fn=(en:string,zh:string):F=>['Function','功能',en,zh];
const sup=(en:string,zh:string):F=>['Blood supply','血液供應',en,zh];

export const femaleCards:Record<string,Body>={
 'vagina':card('陰道',R,
  'The muscular canal that runs from the vestibule of the vulva up to the cervix; it is the birth canal and the passage for menstrual flow.',
  '由陰道前庭向上連到子宮頸的肌性管道，是產道，也是經血排出的通路。',[
  loc('Behind the urinary bladder and urethra, in front of the rectum and anal canal; the upper end surrounds the cervix','位於膀胱與尿道之後、直腸與肛管之前；上端環繞子宮頸'),
  rel('The recess around the cervix is the vaginal fornix, deepest behind; the rectouterine pouch lies just above the posterior fornix','環繞子宮頸的凹隙為陰道穹窿，後穹窿最深，其上方即直腸子宮陷凹'),
  sup('Vaginal and uterine arteries, with branches of the internal pudendal artery','陰道動脈與子宮動脈，並有陰部內動脈的分支'),
  fn('Birth canal, outlet for menstrual blood, receives the penis in intercourse','產道、排出經血，並在性交時容納陰莖')]),
 'cervicovaginal junction':card('子宮頸陰道交界',R,
  'The transition where the lower end of the cervix projects into the top of the vagina.',
  '子宮頸下端突入陰道頂端的移行部位。',[
  loc('At the top of the vagina, where the cervix meets the vaginal wall','位於陰道頂端，子宮頸與陰道壁相接處'),
  rel('The surrounding fornices are the shallow recess of the vagina around the cervical part','周圍的陰道穹窿是環繞子宮頸陰道部的凹隙'),
  fn('Joins the uterine cavity to the vaginal canal through the cervical canal','藉子宮頸管連接子宮腔與陰道')]),
 'ampulla of uterine tube':card('輸卵管壺腹',R,
  'The widest and longest part of the uterine tube, lateral to the isthmus; fertilisation normally takes place here.',
  '輸卵管最寬、最長的一段，在峽部外側；受精通常發生於此。',[
  loc('Between the isthmus medially and the infundibulum laterally, in the upper free edge of the broad ligament','介於內側的峽部與外側的漏斗部之間，位於闊韌帶上緣'),
  fn('Usual site of fertilisation; moves the egg toward the uterus by ciliary beating and muscle waves','通常為受精處；以纖毛擺動與肌肉蠕動將卵送向子宮')]),
 'isthmus of uterine tube':card('輸卵管峽部',R,
  'The short, narrow, thick-walled medial third of the uterine tube, next to the uterus.',
  '輸卵管靠近子宮的內側三分之一，短、窄而管壁厚。',[
  loc('Joins the uterine horn (cornu) of the uterus and passes laterally into the ampulla','連於子宮角，向外側續接壺腹'),
  fn('Narrow passage that leads the egg into the uterine cavity','為引導卵進入子宮腔的狹窄通道')]),
 'infundibulum of uterine tube':card('輸卵管漏斗部',R,
  'The funnel-shaped lateral end of the uterine tube; its opening into the peritoneal cavity is the abdominal ostium.',
  '輸卵管外側的漏斗狀末端；開口通入腹膜腔，稱為輸卵管腹腔口。',[
  loc('Lateral end of the tube, close to the ovary, bordered by the fimbriae','位於輸卵管外側端，靠近卵巢，邊緣有繖'),
  fn('Catches the egg released from the ovary','接住卵巢排出的卵')]),
 'fimbriae of uterine tube':card('輸卵管繖',R,
  'Finger-like fringes around the opening of the infundibulum; one longer fringe (ovarian fimbria) reaches toward the ovary.',
  '輸卵管漏斗口周緣的指狀突起；其中一條較長的卵巢繖伸向卵巢。',[
  loc('Free edge of the infundibulum, next to the ovary','位於漏斗部游離緣，鄰近卵巢'),
  fn('Sweep the egg from the ovarian surface into the tube','把卵從卵巢表面撥入輸卵管')]),
 'round ligament of uterus':card('子宮圓韌帶',L,
  'A fibromuscular cord that runs from the uterine horn through the inguinal canal to the labium majus.',
  '由子宮角出發，經腹股溝管到大陰唇的纖維肌性條索。',[
  loc('From the uterus just below and in front of the tubal entrance, forward within the broad ligament, then through the deep inguinal ring','自子宮、輸卵管入口的前下方發出，在闊韌帶內向前，經腹股溝深環'),
  rel('Ends in the connective tissue of the labium majus; it is the female counterpart of the gubernaculum of the testis','止於大陰唇的結締組織，相當於男性睪丸引帶的同源構造'),
  fn('Helps keep the uterus tipped forward (anteverted)','協助維持子宮前傾位置')]),
 'uterosacral ligament':card('子宮骶韌帶',L,
  'A band of connective tissue and smooth muscle that runs from the cervix backward to the sacrum, forming a fold under the peritoneum.',
  '由子宮頸向後連到薦骨的結締組織與平滑肌帶，在腹膜下形成皺襞。',[
  loc('From the side of the cervix, curving around the rectum to the front of the sacrum','自子宮頸兩側繞過直腸，連到薦骨前面'),
  fn('Holds the cervix back and supports the uterus','向後牽拉子宮頸並支持子宮')]),
 'cardinal ligament of uterus':card('子宮主韌帶（子宮頸橫韌帶）',L,
  'A thick condensation of connective tissue at the base of the broad ligament, running from the cervix and upper vagina to the pelvic side wall.',
  '闊韌帶底部增厚的結締組織，由子宮頸與陰道上部連到骨盆側壁。',[
  loc('Base of the broad ligament; the uterine vessels and ureter lie in or beside it','位於闊韌帶底部，子宮血管與輸尿管穿行於其中或其旁'),
  fn('Main support of the cervix against downward displacement','是防止子宮頸下垂的主要支持結構')]),
 'suspensory ligament of ovary':card('卵巢懸韌帶',L,
  'A fold of peritoneum that passes from the upper pole of the ovary to the pelvic brim, carrying the ovarian vessels and nerves.',
  '由卵巢上端連到骨盆緣的腹膜皺襞，內有卵巢血管與神經。',[
  loc('From the tubal end of the ovary up over the pelvic brim toward the posterior abdominal wall','自卵巢的輸卵管端向上越過骨盆緣，走向腹後壁'),
  sup('Carries the ovarian artery and vein','內含卵巢動脈與靜脈'),
  fn('Fixes the upper pole of the ovary to the pelvic side wall','把卵巢上端固定於骨盆側壁')]),
 'ovarian ligament':card('卵巢固有韌帶',L,
  'A short fibromuscular cord that joins the lower pole of the ovary to the side of the uterus.',
  '連接卵巢下端與子宮側緣的短小纖維肌性條索。',[
  loc('Between the ovary and the uterus, just below the entrance of the uterine tube, inside the back layer of the broad ligament','位於卵巢與子宮之間，輸卵管入口稍下方，在闊韌帶後層內'),
  fn('Keeps the ovary attached to the uterus','使卵巢與子宮保持連接')]),
 'broad ligament of uterus':card('子宮闊韌帶',L,
  'A wide double fold of peritoneum that drapes over the uterus, uterine tubes and ovaries and reaches the pelvic side wall.',
  '覆蓋子宮、輸卵管與卵巢、延伸到骨盆側壁的寬闊雙層腹膜皺襞。',[
  loc('Stretches between the sides of the uterus and the lateral pelvic walls, like a sheet','在子宮兩側與骨盆側壁之間展開，如一片帷幕'),
  rel('Contains the uterine tube above, the round and ovarian ligaments, the uterine vessels and a little loose tissue (parametrium)','上緣含輸卵管，並包有圓韌帶、卵巢固有韌帶、子宮血管與疏鬆結締組織（子宮旁組織）'),
  fn('Folds that hold the uterus, tubes and ovaries in position','形成皺襞，使子宮、輸卵管與卵巢保持位置')]),
 'mesovarium':card('卵巢系膜',L,
  'The short peritoneal fold that attaches the front border of the ovary to the back layer of the broad ligament.',
  '把卵巢前緣連到闊韌帶後層的短腹膜皺襞。',[
  loc('At the hilum of the ovary, on the back of the broad ligament','位於卵巢門，在闊韌帶後方'),
  sup('Ovarian vessels and nerves enter the ovary through it','卵巢的血管與神經由此進出卵巢')]),
 'mesosalpinx':card('輸卵管系膜',L,
  'The part of the broad ligament that lies above the mesovarium and encloses the uterine tube.',
  '闊韌帶位於卵巢系膜之上、包裹輸卵管的部分。',[
  loc('Upper margin of the broad ligament, around the uterine tube','位於闊韌帶上緣，環繞輸卵管'),
  fn('Suspends the uterine tube','懸吊輸卵管')]),
 'ovary':card('卵巢',R,
  'The almond-shaped female gonad: it produces egg cells and the hormones oestrogen and progesterone.',
  '杏仁形的女性生殖腺：產生卵細胞以及雌激素與黃體素。',[
  loc('On the side wall of the pelvis in the ovarian fossa, near the division of the common iliac artery','位於骨盆側壁的卵巢窩，靠近髂總動脈分叉處'),
  rel('Held by the suspensory ligament, the mesovarium and the ovarian ligament; the fimbriae of the uterine tube lie against it','由卵巢懸韌帶、卵巢系膜與卵巢固有韌帶固定；輸卵管繖貼附於其上'),
  sup('Ovarian artery from the abdominal aorta, with a branch of the uterine artery','卵巢動脈（起自腹主動脈）與子宮動脈的分支'),
  fn('Releases an egg each cycle and secretes sex hormones','每個週期排出一顆卵，並分泌性激素')]),
 'body of uterus':card('子宮體',R,
  'The main upper part of the uterus, with the muscular wall (myometrium) around the uterine cavity.',
  '子宮的主要上部，肌層（子宮肌層）環繞子宮腔。',[
  loc('In the middle of the pelvis between the bladder in front and the rectum behind; normally tipped forward over the bladder','位於骨盆中央，前為膀胱、後為直腸；一般前傾，覆於膀胱上方'),
  rel('The uterine tubes enter at the upper corners; the body narrows to the isthmus and cervix below','輸卵管由上外角進入；向下漸窄，接子宮峽與子宮頸'),
  sup('Uterine artery, from the internal iliac artery','子宮動脈，來自髂內動脈'),
  fn('Receives the embryo, grows with the foetus and contracts in labour','容納胚胎、隨胎兒增大，並在分娩時收縮')]),
 'fundus of uterus':card('子宮底',R,
  'The rounded top of the uterus, above the openings of the uterine tubes.',
  '子宮最上方的圓頂，位於輸卵管開口之上。',[
  loc('Highest part of the uterus; in the normal position it lies at or below the pelvic brim','子宮最高處，正常位置在骨盆緣或其下方'),
  rel('Covered by peritoneum; its height above the pubic symphysis is used to follow the growth of the uterus in pregnancy','表面覆有腹膜；孕期以其距恥骨聯合的高度追蹤子宮增大')]),
 'lower uterine segment':card('子宮下段',R,
  'The thinner region between the body and the cervix, formed from the isthmus of the uterus; it stretches in late pregnancy.',
  '位於子宮體與子宮頸之間較薄的部分，由子宮峽形成；妊娠後期會被拉長。',[
  loc('Just above the cervix, behind the bladder','位於子宮頸上方，膀胱後方'),
  fn('Site of the usual incision in caesarean section','剖腹產時常用的切開部位')]),
 'cervix of uterus':card('子宮頸',R,
  'The narrow lower part of the uterus; its canal opens above into the uterine cavity and below into the vagina.',
  '子宮狹窄的下部；管道上通子宮腔、下通陰道。',[
  loc('The lower end projects into the top of the vagina','下端突入陰道頂端'),
  rel('The ureter passes about 2 cm to the side of the cervix, under the uterine artery','輸尿管在子宮頸外側約 2 公分處，從子宮動脈下方通過'),
  fn('Its mucus changes through the cycle; it dilates in labour','黏液隨週期改變，分娩時擴張')]),
 'uterine cornua':card('子宮角',R,
  'The upper lateral corners of the uterus where each uterine tube enters.',
  '子宮上外側的兩個角，輸卵管由此進入。',[
  loc('Either side of the fundus','位於子宮底兩側'),
  rel('The round ligament and the ovarian ligament attach just below and behind it','圓韌帶與卵巢固有韌帶附著於其下方與後方')]),
 'uterine artery':card('子宮動脈',"Artery｜動脈",
  'The main artery of the uterus; it arises from the internal iliac artery and runs along the base of the broad ligament.',
  '子宮的主要動脈；起自髂內動脈，沿闊韌帶底部走行。',[
  ['Course','走向','Runs medially in the cardinal ligament, crosses above and in front of the ureter, then climbs along the side of the uterus and anastomoses with the ovarian artery','在子宮主韌帶內向內側走，從輸尿管上前方跨過，再沿子宮側緣上行，與卵巢動脈吻合'],
  sup('Supplies the uterus, upper vagina, uterine tube and ovary','供應子宮、陰道上部、輸卵管與卵巢')]),
 'uterine vein':card('子宮靜脈',"Vein｜靜脈",
  'Veins that form a plexus beside the uterus and vagina and drain to the internal iliac vein.',
  '在子宮與陰道旁形成靜脈叢，回流到髂內靜脈。',[
  ['Course','走向','Follows the uterine artery along the side of the uterus to the internal iliac vein','隨子宮動脈沿子宮側緣，匯入髂內靜脈'],
  ['Drainage','回流','Uterus and upper vagina','子宮與陰道上部']]),
 'vesicouterine pouch':card('膀胱子宮陷凹',"Serous｜漿膜",
  'The shallow peritoneal pocket between the front of the uterus and the top of the bladder.',
  '子宮前方與膀胱上面之間淺的腹膜凹陷。',[
  loc('In front of the uterine body, behind the bladder','位於子宮體前方、膀胱後方'),
  rel('Shallower than the rectouterine pouch because the uterus is tipped forward over the bladder','因子宮前傾覆於膀胱上，此陷凹比直腸子宮陷凹淺')]),
 'rectouterine pouch':card('直腸子宮陷凹',"Serous｜漿膜",
  'The deep peritoneal pocket between the uterus and the rectum, also called the pouch of Douglas; it is the lowest part of the female peritoneal cavity.',
  '子宮與直腸之間深的腹膜凹陷，又稱道格拉斯氏陷凹；是女性腹膜腔最低處。',[
  loc('Behind the uterus and the upper vagina, in front of the rectum, between the two uterosacral folds','位於子宮與陰道上部後方、直腸前方，介於兩側子宮骶韌帶皺襞之間'),
  rel('Fluid or blood in the peritoneal cavity collects here when standing or sitting; it can be reached through the posterior fornix of the vagina','站坐時腹腔液體或血液積聚於此，可經陰道後穹窿到達')]),
 'urinary bladder':card('膀胱',U,
  'The hollow muscular organ that stores urine; the wall is detrusor muscle lined by a stretchable epithelium.',
  '儲存尿液的中空肌性器官；壁為逼尿肌，內襯可伸展的上皮。',[
  loc('In the pelvis behind the pubic symphysis; in the female it lies in front of the uterus and the upper vagina','位於骨盆內、恥骨聯合後方；女性位於子宮與陰道上部前方'),
  rel('The ureters enter at the back of the base; the urethra leaves from the neck','輸尿管由底部後方進入，尿道由膀胱頸發出'),
  sup('Superior and inferior vesical arteries (branches of the internal iliac artery)','膀胱上動脈與膀胱下動脈（髂內動脈分支）'),
  fn('Stores urine and empties it through the urethra','儲存尿液，並經尿道排空')]),
 'trigone of urinary bladder':card('膀胱三角',U,
  'The smooth triangular area on the inside of the bladder base, bounded by the two ureteric openings and the internal urethral opening.',
  '膀胱底內面光滑的三角形區域，由兩側輸尿管口與尿道內口圍成。',[
  loc('Floor of the bladder, at the back of the base','位於膀胱底後部'),
  rel('Its folds do not change when the bladder fills, unlike the rest of the lining','與其餘黏膜不同，充盈時此處不起皺褶'),
  fn('Guides urine from the ureters toward the urethra','引導尿液由輸尿管流向尿道')]),
 'ureter':card('輸尿管',U,
  'The muscular tube that carries urine from the renal pelvis to the bladder.',
  '把尿液由腎盂送到膀胱的肌性管道。',[
  ['Course','走向','Runs down the front of psoas major, crosses the pelvic brim at the iliac vessels, then passes forward to the bladder; in the female it goes under the uterine artery beside the cervix','沿腰大肌前面下行，在髂血管處越過骨盆緣，再向前到膀胱；女性在子宮頸旁從子宮動脈下方通過'],
  ['Narrow points','狹窄處','Pelviureteric junction, pelvic brim and the entry into the bladder wall','腎盂輸尿管交界、骨盆緣與進入膀胱壁處'],
  fn('Peristaltic waves move urine to the bladder','以蠕動波把尿液送入膀胱')]),
 'female urethra':card('女性尿道',U,
  'A short tube about 4 cm long that runs from the bladder neck to the vestibule of the vulva.',
  '約 4 公分長的短管，由膀胱頸通到陰道前庭。',[
  loc('Behind the pubic symphysis and in front of the vagina, lying along its front wall','位於恥骨聯合後方、陰道前方，貼著陰道前壁'),
  rel('Opens in the vestibule in front of the vaginal opening; surrounded by the urethral sphincter','開口於陰道口前方的前庭，周圍有尿道括約肌'),
  fn('Carries urine out of the body','把尿液排出體外')])
};
