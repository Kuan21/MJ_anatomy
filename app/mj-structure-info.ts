import type {SystemId} from './anatomy';

export interface BilingualFact {
 labelEn:string;
 labelZh:string;
 valueEn:string;
 valueZh?:string;
}
export interface StructureProfile {
 english:string;
 chinese?:string;
 category:string;
 summaryEn?:string;
 summaryZh?:string;
 facts:BilingualFact[];
 source:string;
}

type ProfileBody=Omit<StructureProfile,'english'>;
const CMU_SOURCE='CMU Upper Limbs lecture; terminology cross-checked with the uploaded Netter Atlas';
const WEB_SOURCE='Standard anatomical terminology; NCBI Bookshelf / StatPearls where a CMU course entry is not available';

const muscle=(chinese:string,originEn:string,originZh:string,insertionEn:string,insertionZh:string,nerveEn:string,nerveZh:string,actionEn:string,actionZh:string):ProfileBody=>({
 chinese,category:'Muscle｜肌肉',
 summaryEn:'A named skeletal muscle represented in the 3D atlas.',
 summaryZh:'3D 人體圖譜中的具名骨骼肌。',
 facts:[
  {labelEn:'Origin',labelZh:'起點',valueEn:originEn,valueZh:originZh},
  {labelEn:'Insertion',labelZh:'止點',valueEn:insertionEn,valueZh:insertionZh},
  {labelEn:'Innervation',labelZh:'神經支配',valueEn:nerveEn,valueZh:nerveZh},
  {labelEn:'Action',labelZh:'作用',valueEn:actionEn,valueZh:actionZh}
 ],source:CMU_SOURCE
});

const nerve=(chinese:string,rootsEn:string,rootsZh:string,courseEn:string,courseZh:string,functionEn:string,functionZh:string):ProfileBody=>({
 chinese,category:'Nerve｜神經',
 summaryEn:'A named neural structure of the upper limb represented in the atlas.',
 summaryZh:'圖譜中所呈現的上肢具名神經構造。',
 facts:[
  {labelEn:'Roots / origin',labelZh:'神經根／來源',valueEn:rootsEn,valueZh:rootsZh},
  {labelEn:'Course / relation',labelZh:'走行／關係',valueEn:courseEn,valueZh:courseZh},
  {labelEn:'Main function',labelZh:'主要功能',valueEn:functionEn,valueZh:functionZh}
 ],source:CMU_SOURCE
});

const bone=(chinese:string,typeEn:string,typeZh:string,roleEn:string,roleZh:string,landmarksEn:string,landmarksZh:string):ProfileBody=>({
 chinese,category:'Bone｜骨骼',
 summaryEn:'A named skeletal structure represented in the 3D atlas.',
 summaryZh:'3D 人體圖譜中的具名骨骼構造。',
 facts:[
  {labelEn:'Type / region',labelZh:'類型／區域',valueEn:typeEn,valueZh:typeZh},
  {labelEn:'Anatomical role',labelZh:'解剖角色',valueEn:roleEn,valueZh:roleZh},
  {labelEn:'Key landmarks',labelZh:'重要骨標誌',valueEn:landmarksEn,valueZh:landmarksZh}
 ],source:CMU_SOURCE
});

const detailed:Record<string,ProfileBody>={
 'pectoralis major':muscle('胸大肌','Medial half of clavicle; sternum and upper costal cartilages','鎖骨內側半、胸骨及上位肋軟骨','Lateral lip of intertubercular sulcus of humerus','肱骨結節間溝外側唇','Lateral and medial pectoral nerves (C5–T1)','外側與內側胸神經（C5–T1）','Adducts and medially rotates arm; clavicular head assists flexion','內收及內旋手臂；鎖骨部協助屈曲'),
 'subclavius':muscle('鎖骨下肌','1st rib and costal cartilage','第一肋骨與肋軟骨','Inferior surface of middle third of clavicle','鎖骨中三分之一的下表面','Nerve to subclavius (C5–C6)','鎖骨下肌神經（C5–C6）','Anchors and depresses clavicle','固定並下壓鎖骨'),
 'pectoralis minor':muscle('胸小肌','3rd–5th ribs','第3–5肋骨','Coracoid process of scapula','肩胛骨喙突','Medial pectoral nerve (C8–T1)','內側胸神經（C8–T1）','Stabilizes scapula by drawing it anteriorly and inferiorly','將肩胛骨向前、向下拉以協助穩定'),
 'serratus anterior':muscle('前鋸肌','External surfaces of ribs 1–8','第1–8肋骨外面','Anterior surface of medial border of scapula','肩胛骨內側緣前面','Long thoracic nerve (C5–C7)','胸長神經（C5–C7）','Protracts and upwardly rotates scapula; holds it against thoracic wall','前引並上旋肩胛骨，使肩胛骨貼住胸壁'),
 'trapezius':muscle('斜方肌','External occipital protuberance, nuchal ligament, spinous processes C7–T12','枕外隆凸、項韌帶、C7–T12棘突','Lateral clavicle, acromion and spine of scapula','鎖骨外側、肩峰及肩胛棘','Accessory nerve (CN XI); C3–C4 for proprioception','副神經（CN XI）；C3–C4提供本體感覺','Elevates, retracts, depresses and upwardly rotates scapula','上提、後縮、下壓及上旋肩胛骨'),
 'levator scapulae':muscle('提肩胛肌','Posterior tubercles of transverse processes C1–C4','C1–C4橫突後結節','Medial border of scapula above root of spine','肩胛棘根部以上的內側緣','Dorsal scapular nerve with C3–C4 contributions','肩胛背神經，並有C3–C4分支','Elevates and assists downward rotation of scapula','上提並協助下旋肩胛骨'),
 'rhomboid minor':muscle('小菱形肌','Nuchal ligament; spinous processes C7–T1','項韌帶；C7–T1棘突','Medial end of scapular spine','肩胛棘內側端','Dorsal scapular nerve (C4–C5)','肩胛背神經（C4–C5）','Retracts and fixes scapula to thoracic wall','後縮並固定肩胛骨於胸壁'),
 'rhomboid major':muscle('大菱形肌','Spinous processes T2–T5','T2–T5棘突','Medial border of scapula from spine to inferior angle','肩胛棘至下角之間的內側緣','Dorsal scapular nerve (C4–C5)','肩胛背神經（C4–C5）','Retracts and downwardly rotates scapula','後縮及下旋肩胛骨'),
 'deltoid':muscle('三角肌','Lateral third of clavicle, acromion and spine of scapula','鎖骨外側三分之一、肩峰及肩胛棘','Deltoid tuberosity of humerus','肱骨三角肌粗隆','Axillary nerve (C5–C6)','腋神經（C5–C6）','Middle fibers abduct; anterior fibers flex/medially rotate; posterior fibers extend/laterally rotate','中部外展；前部屈曲及內旋；後部伸展及外旋'),
 'supraspinatus':muscle('棘上肌','Supraspinous fossa of scapula','肩胛骨棘上窩','Superior facet of greater tubercle of humerus','肱骨大結節上關節面','Suprascapular nerve (C5–C6)','肩胛上神經（C5–C6）','Initiates abduction and stabilizes glenohumeral joint','啟動手臂外展並穩定盂肱關節'),
 'infraspinatus':muscle('棘下肌','Infraspinous fossa of scapula','肩胛骨棘下窩','Middle facet of greater tubercle of humerus','肱骨大結節中關節面','Suprascapular nerve (C5–C6)','肩胛上神經（C5–C6）','Laterally rotates arm and stabilizes shoulder','外旋手臂並穩定肩關節'),
 'teres minor':muscle('小圓肌','Middle lateral border of scapula','肩胛骨外側緣中段','Inferior facet of greater tubercle of humerus','肱骨大結節下關節面','Axillary nerve (C5–C6)','腋神經（C5–C6）','Laterally rotates arm; weak adduction; stabilizes shoulder','外旋手臂、輕度內收並穩定肩關節'),
 'subscapularis':muscle('肩胛下肌','Subscapular fossa','肩胛下窩','Lesser tubercle of humerus','肱骨小結節','Upper and lower subscapular nerves (C5–C7)','上、下肩胛下神經（C5–C7）','Medially rotates and adducts arm; stabilizes shoulder','內旋及內收手臂並穩定肩關節'),
 'teres major':muscle('大圓肌','Posterior surface near inferior angle of scapula','肩胛骨下角附近後面','Medial lip of intertubercular sulcus of humerus','肱骨結節間溝內側唇','Lower subscapular nerve (C5–C6)','下肩胛下神經（C5–C6）','Adducts, medially rotates and extends arm','內收、內旋及伸展手臂'),
 'biceps brachii':muscle('肱二頭肌','Long head: supraglenoid tubercle; short head: coracoid process','長頭：盂上結節；短頭：喙突','Radial tuberosity and forearm fascia through bicipital aponeurosis','橈骨粗隆及經肱二頭肌腱膜連至前臂筋膜','Musculocutaneous nerve (C5–C6)','肌皮神經（C5–C6）','Powerful supination and elbow flexion; assists shoulder flexion','強力旋後及屈肘；協助肩屈曲'),
 'brachialis':muscle('肱肌','Distal half of anterior humerus','肱骨前面遠側半','Coronoid process and tuberosity of ulna','尺骨冠狀突及尺骨粗隆','Musculocutaneous nerve (C5–C6), with small radial contribution laterally','肌皮神經（C5–C6），外側可有少量橈神經支配','Primary flexor of elbow','主要屈肘肌'),
 'coracobrachialis':muscle('喙肱肌','Coracoid process','喙突','Middle third of medial humerus','肱骨內側面中三分之一','Musculocutaneous nerve (C5–C7)','肌皮神經（C5–C7）','Flexes and adducts arm','屈曲及內收手臂'),
 'triceps brachii':muscle('肱三頭肌','Long head: infraglenoid tubercle; lateral/medial heads: posterior humerus around radial groove','長頭：盂下結節；外側頭與內側頭：橈神經溝上下的肱骨後面','Olecranon of ulna','尺骨鷹嘴','Radial nerve (C6–C8)','橈神經（C6–C8）','Chief extensor of elbow; long head also extends/adducts arm','主要伸肘；長頭亦協助伸展與內收手臂'),
 'anconeus':muscle('肘肌','Lateral epicondyle of humerus','肱骨外上髁','Lateral olecranon and proximal posterior ulna','鷹嘴外側與近端尺骨後面','Radial nerve (C7–T1)','橈神經（C7–T1）','Assists elbow extension and stabilizes elbow','協助伸肘並穩定肘關節'),
 'pronator teres':muscle('旋前圓肌','Medial epicondyle of humerus and coronoid process of ulna','肱骨內上髁與尺骨冠狀突','Middle of lateral surface of radius','橈骨外側面中部','Median nerve (C6–C7)','正中神經（C6–C7）','Pronates forearm; assists elbow flexion','前臂旋前；協助屈肘'),
 'flexor carpi radialis':muscle('橈側腕屈肌','Medial epicondyle via common flexor tendon','經共同屈肌腱起於肱骨內上髁','Base of 2nd metacarpal (often slip to 3rd)','第二掌骨底（常有纖維至第三掌骨）','Median nerve (C6–C7)','正中神經（C6–C7）','Flexes and abducts wrist','屈腕及橈偏'),
 'palmaris longus':muscle('掌長肌','Medial epicondyle via common flexor tendon','經共同屈肌腱起於肱骨內上髁','Flexor retinaculum and palmar aponeurosis','屈肌支持帶與掌腱膜','Median nerve (C7–C8)','正中神經（C7–C8）','Flexes wrist and tenses palmar aponeurosis','屈腕並張緊掌腱膜'),
 'flexor carpi ulnaris':muscle('尺側腕屈肌','Medial epicondyle; olecranon and posterior ulna','肱骨內上髁；鷹嘴及尺骨後緣','Pisiform, hook of hamate and base of 5th metacarpal','豆狀骨、鉤骨鉤與第五掌骨底','Ulnar nerve (C7–T1)','尺神經（C7–T1）','Flexes and adducts wrist','屈腕及尺偏'),
 'flexor digitorum superficialis':muscle('指淺屈肌','Medial epicondyle/coronoid and superior anterior radius','肱骨內上髁／尺骨冠狀突及橈骨前面上部','Sides of middle phalanges of digits 2–5','第2–5指中節指骨兩側','Median nerve (C7–T1)','正中神經（C7–T1）','Flexes proximal interphalangeal joints; also MCP and wrist','屈第2–5指近端指間關節，亦協助屈掌指及腕關節'),
 'flexor digitorum profundus':muscle('指深屈肌','Proximal ulna and interosseous membrane','近端尺骨與骨間膜','Bases of distal phalanges 2–5','第2–5指遠節指骨底','Anterior interosseous nerve to lateral half; ulnar nerve to medial half (C8–T1)','外側半由前骨間神經；內側半由尺神經支配（C8–T1）','Flexes distal interphalangeal joints','屈第2–5指遠端指間關節'),
 'flexor pollicis longus':muscle('拇長屈肌','Anterior radius and interosseous membrane','橈骨前面與骨間膜','Base of distal phalanx of thumb','拇指遠節指骨底','Anterior interosseous nerve (C8–T1)','前骨間神經（C8–T1）','Flexes thumb interphalangeal joint','屈拇指指間關節'),
 'pronator quadratus':muscle('旋前方肌','Distal anterior ulna','尺骨遠端前面','Distal anterior radius','橈骨遠端前面','Anterior interosseous nerve (C8–T1)','前骨間神經（C8–T1）','Pronates forearm and binds radius to ulna','使前臂旋前並穩定遠端橈尺關係'),
 'brachioradialis':muscle('肱橈肌','Proximal lateral supracondylar ridge of humerus','肱骨外上髁上嵴近端','Lateral distal radius near styloid process','橈骨遠端外側近莖突','Radial nerve (C5–C7)','橈神經（C5–C7）','Flexes elbow best in mid-prone position','以前臂中立位時最有效屈肘'),
 'extensor carpi radialis longus':muscle('橈側腕長伸肌','Lateral supracondylar ridge','肱骨外上髁上嵴','Base of 2nd metacarpal','第二掌骨底','Radial nerve (C6–C7)','橈神經（C6–C7）','Extends and abducts wrist','伸腕及橈偏'),
 'extensor carpi radialis brevis':muscle('橈側腕短伸肌','Lateral epicondyle via common extensor tendon','經共同伸肌腱起於肱骨外上髁','Base of 3rd metacarpal','第三掌骨底','Deep branch of radial nerve (C7–C8)','橈神經深支（C7–C8）','Extends and abducts wrist','伸腕及橈偏'),
 'extensor digitorum':muscle('指伸肌','Lateral epicondyle via common extensor tendon','經共同伸肌腱起於肱骨外上髁','Extensor expansions of digits 2–5','第2–5指伸肌腱膜','Posterior interosseous nerve (C7–C8)','後骨間神經（C7–C8）','Extends digits 2–5 and assists wrist extension','伸第2–5指並協助伸腕'),
 'extensor digiti minimi':muscle('小指伸肌','Lateral epicondyle via common extensor tendon','經共同伸肌腱起於肱骨外上髁','Extensor expansion of 5th digit','第五指伸肌腱膜','Posterior interosseous nerve (C7–C8)','後骨間神經（C7–C8）','Extends little finger','伸小指'),
 'extensor carpi ulnaris':muscle('尺側腕伸肌','Lateral epicondyle and posterior ulna','肱骨外上髁與尺骨後面','Base of 5th metacarpal','第五掌骨底','Posterior interosseous nerve (C7–C8)','後骨間神經（C7–C8）','Extends and adducts wrist','伸腕及尺偏'),
 'supinator':muscle('旋後肌','Lateral epicondyle, collateral/annular ligaments and supinator crest of ulna','肱骨外上髁、側副／環狀韌帶及尺骨旋後肌嵴','Proximal radius','橈骨近端','Deep branch of radial nerve (C7–C8)','橈神經深支（C7–C8）','Supinates forearm','使前臂旋後'),
 'abductor pollicis longus':muscle('拇長外展肌','Posterior ulna/radius and interosseous membrane','尺骨與橈骨後面及骨間膜','Base of 1st metacarpal','第一掌骨底','Posterior interosseous nerve (C7–C8)','後骨間神經（C7–C8）','Abducts and extends thumb at CMC joint','外展並伸展拇指腕掌關節'),
 'extensor pollicis brevis':muscle('拇短伸肌','Posterior radius and interosseous membrane','橈骨後面與骨間膜','Base of proximal phalanx of thumb','拇指近節指骨底','Posterior interosseous nerve (C7–C8)','後骨間神經（C7–C8）','Extends thumb at MCP/CMC joints','伸拇指掌指及腕掌關節'),
 'extensor pollicis longus':muscle('拇長伸肌','Posterior ulna and interosseous membrane','尺骨後面與骨間膜','Base of distal phalanx of thumb','拇指遠節指骨底','Posterior interosseous nerve (C7–C8)','後骨間神經（C7–C8）','Extends thumb, especially at IP joint','伸拇指，尤其是指間關節'),
 'extensor indicis':muscle('食指伸肌','Posterior ulna and interosseous membrane','尺骨後面與骨間膜','Extensor expansion of index finger','食指伸肌腱膜','Posterior interosseous nerve (C7–C8)','後骨間神經（C7–C8）','Extends index finger independently','獨立伸展食指'),
 'abductor pollicis brevis':muscle('拇短外展肌','Flexor retinaculum, scaphoid and trapezium','屈肌支持帶、舟狀骨及大菱形骨','Lateral base of proximal phalanx of thumb','拇指近節指骨底外側','Recurrent branch of median nerve (C8–T1)','正中神經返支（C8–T1）','Abducts thumb and assists opposition','外展拇指並協助對掌'),
 'flexor pollicis brevis':muscle('拇短屈肌','Flexor retinaculum/trapezium; deep head from carpal region','屈肌支持帶／大菱形骨；深頭來自腕骨區','Base of proximal phalanx of thumb','拇指近節指骨底','Recurrent median nerve; deep head may receive deep ulnar branch','正中神經返支；深頭可接受尺神經深支','Flexes thumb at MCP joint','屈拇指掌指關節'),
 'opponens pollicis':muscle('拇對掌肌','Flexor retinaculum and trapezium','屈肌支持帶與大菱形骨','Lateral side of 1st metacarpal','第一掌骨外側','Recurrent branch of median nerve (C8–T1)','正中神經返支（C8–T1）','Opposes thumb','使拇指對掌'),
 'adductor pollicis':muscle('拇收肌','Oblique head: capitate/bases of metacarpals 2–3; transverse head: shaft of metacarpal 3','斜頭：頭狀骨及第2–3掌骨底；橫頭：第三掌骨幹','Medial base of proximal phalanx of thumb','拇指近節指骨底內側','Deep branch of ulnar nerve (C8–T1)','尺神經深支（C8–T1）','Adducts thumb','內收拇指'),
 'abductor digiti minimi of hand':muscle('小指外展肌','Pisiform','豆狀骨','Medial base of proximal phalanx of 5th digit','第五指近節指骨底內側','Deep branch of ulnar nerve (C8–T1)','尺神經深支（C8–T1）','Abducts little finger','外展小指'),
 'flexor digiti minimi brevis of hand':muscle('小指短屈肌','Hook of hamate and flexor retinaculum','鉤骨鉤與屈肌支持帶','Base of proximal phalanx of 5th digit','第五指近節指骨底','Deep branch of ulnar nerve (C8–T1)','尺神經深支（C8–T1）','Flexes little finger at MCP joint','屈小指掌指關節'),
 'opponens digiti minimi of hand':muscle('小指對掌肌','Hook of hamate and flexor retinaculum','鉤骨鉤與屈肌支持帶','Medial border of 5th metacarpal','第五掌骨內側緣','Deep branch of ulnar nerve (C8–T1)','尺神經深支（C8–T1）','Draws 5th metacarpal anteriorly and helps cup palm','將第五掌骨向前拉並協助掌心形成弧度'),
 'lumbricals of hand':muscle('蚓狀肌','Tendons of flexor digitorum profundus','指深屈肌腱','Lateral extensor expansions of digits 2–5','第2–5指伸肌腱膜外側','1st–2nd: median nerve; 3rd–4th: deep ulnar branch','第1–2由正中神經；第3–4由尺神經深支','Flex MCP joints while extending IP joints','屈掌指關節並伸指間關節'),
 'palmar interossei of hand':muscle('掌側骨間肌','Metacarpals 2, 4 and 5','第2、4、5掌骨','Bases of proximal phalanges/extensor expansions','近節指骨底／伸肌腱膜','Deep branch of ulnar nerve (C8–T1)','尺神經深支（C8–T1）','Adduct digits toward middle finger (PAD)','使手指向中指內收（PAD）'),
 'dorsal interossei of hand':muscle('背側骨間肌','Adjacent sides of metacarpals','相鄰掌骨側面','Bases of proximal phalanges/extensor expansions','近節指骨底／伸肌腱膜','Deep branch of ulnar nerve (C8–T1)','尺神經深支（C8–T1）','Abduct digits from middle finger (DAB)','使手指遠離中指外展（DAB）'),

 'axillary nerve':nerve('腋神經','Posterior cord, mainly C5–C6','後束，主要C5–C6','Passes through quadrangular space with posterior circumflex humeral artery and winds around surgical neck of humerus','與肱骨後旋動脈通過四邊孔，繞行肱骨外科頸','Motor to deltoid and teres minor; sensory over superolateral arm','運動支配三角肌與小圓肌；感覺支配上臂外上側'),
 'musculocutaneous nerve':nerve('肌皮神經','Lateral cord, C5–C7','外側束，C5–C7','Pierces coracobrachialis, then travels between biceps and brachialis; continues as lateral antebrachial cutaneous nerve','穿過喙肱肌，在肱二頭肌與肱肌之間下行，續為外側前臂皮神經','Motor to anterior arm compartment; sensory to lateral forearm','運動支配上臂前群；感覺支配前臂外側'),
 'radial nerve':nerve('橈神經','Posterior cord, C5–T1','後束，C5–T1','Runs with profunda brachii in radial groove, then anterior to lateral epicondyle before dividing','與肱深動脈沿橈神經溝走行，至外上髁前方後分支','Motor to posterior arm/forearm extensors; sensory to posterior limb and dorsolateral hand','運動支配上臂及前臂後群伸肌；感覺支配後側肢體與手背橈側'),
 'median nerve':nerve('正中神經','Lateral and medial cords, C6–T1','外側束與內側束，C6–T1','Descends with brachial artery, enters forearm between pronator teres heads and passes through carpal tunnel','與肱動脈下行，經旋前圓肌兩頭之間進入前臂，再通過腕隧道','Most forearm flexors and thenar/lateral lumbricals; sensation to lateral palm and lateral 3½ digits','支配多數前臂屈肌及魚際／外側蚓狀肌；感覺支配外側手掌及外側3½指'),
 'ulnar nerve':nerve('尺神經','Medial cord, mainly C8–T1','內側束，主要C8–T1','Passes posterior to medial epicondyle, enters forearm between flexor carpi ulnaris heads and reaches hand via Guyon canal','經肱骨內上髁後方，穿尺側腕屈肌兩頭進入前臂，再經Guyon管入手','FCU, medial FDP and most intrinsic hand muscles; sensation to medial 1½ digits','支配尺側腕屈肌、指深屈肌內側半及多數手內在肌；感覺支配內側1½指'),
 'suprascapular nerve':nerve('肩胛上神經','Upper trunk, C5–C6','上幹，C5–C6','Passes through suprascapular notch beneath superior transverse scapular ligament','經肩胛上切跡並位於肩胛上橫韌帶下方','Motor to supraspinatus and infraspinatus; articular branches to shoulder','運動支配棘上肌與棘下肌；亦有肩關節支'),
 'dorsal scapular nerve':nerve('肩胛背神經','C5 root, sometimes C4 contribution','C5神經根，有時含C4','Runs deep to levator scapulae along medial scapular border','於提肩胛肌深面沿肩胛骨內側緣走行','Motor to rhomboids and often levator scapulae','運動支配菱形肌，常亦支配提肩胛肌'),
 'long thoracic nerve':nerve('胸長神經','C5–C7 roots','C5–C7神經根','Descends on superficial surface of serratus anterior','沿前鋸肌表面下行','Motor to serratus anterior','運動支配前鋸肌'),
 'thoracodorsal nerve':nerve('胸背神經','Posterior cord, C6–C8','後束，C6–C8','Descends on posterior axillary wall with thoracodorsal vessels','與胸背血管沿腋窩後壁下行','Motor to latissimus dorsi','運動支配背闊肌'),
 'upper subscapular nerve':nerve('上肩胛下神經','Posterior cord, C5–C6','後束，C5–C6','Short branch to upper subscapularis','短支走向肩胛下肌上部','Motor to subscapularis','運動支配肩胛下肌'),
 'lower subscapular nerve':nerve('下肩胛下神經','Posterior cord, C5–C6','後束，C5–C6','Runs to lower subscapularis and teres major','走向肩胛下肌下部與大圓肌','Motor to subscapularis and teres major','運動支配肩胛下肌與大圓肌'),
 'lateral pectoral nerve':nerve('外側胸神經','Lateral cord, C5–C7','外側束，C5–C7','Crosses anteriorly toward deep surface of pectoralis major','向前走至胸大肌深面','Motor mainly to pectoralis major','主要運動支配胸大肌'),
 'medial pectoral nerve':nerve('內側胸神經','Medial cord, C8–T1','內側束，C8–T1','Often pierces pectoralis minor before reaching pectoralis major','常穿過胸小肌後到達胸大肌','Motor to pectoralis minor and major','運動支配胸小肌與胸大肌'),
 'anterior interosseous nerve':nerve('前骨間神經','Branch of median nerve, C8–T1','正中神經分支，C8–T1','Runs on anterior interosseous membrane with anterior interosseous artery','與前骨間動脈沿前臂骨間膜前面走行','Motor to FPL, pronator quadratus and lateral FDP','運動支配拇長屈肌、旋前方肌及指深屈肌外側半'),
 'posterior interosseous nerve':nerve('後骨間神經','Continuation of deep radial branch, mainly C7–C8','橈神經深支延續，主要C7–C8','Passes through supinator to posterior forearm','穿過旋後肌進入前臂後群','Motor to most posterior forearm extensors','運動支配大部分前臂後群伸肌'),

 'clavicle':bone('鎖骨','Long bone of pectoral girdle','肩帶的長骨','Only bony connection between upper limb and axial skeleton through sternoclavicular joint','藉胸鎖關節形成上肢與中軸骨骼之間唯一的骨性連結','Sternal end, acromial end, conoid tubercle, trapezoid line','胸骨端、肩峰端、錐狀結節、斜方線'),
 'scapula':bone('肩胛骨','Flat triangular bone of pectoral girdle','肩帶的三角形扁骨','Provides glenoid socket and broad attachment surface for shoulder muscles','形成關節盂並提供大量肩部肌肉附著面','Spine, acromion, coracoid process, glenoid cavity, supra-/infraspinous and subscapular fossae','肩胛棘、肩峰、喙突、關節盂、棘上窩／棘下窩／肩胛下窩'),
 'humerus':bone('肱骨','Long bone of arm','上臂長骨','Links shoulder to elbow and provides major muscle attachment sites','連接肩與肘，並提供多個肌肉附著點','Head, anatomical/surgical necks, greater/lesser tubercles, deltoid tuberosity, radial groove, epicondyles, capitulum, trochlea','肱骨頭、解剖頸／外科頸、大／小結節、三角肌粗隆、橈神經溝、內外上髁、小頭與滑車'),
 'radius':bone('橈骨','Lateral long bone of forearm in anatomical position','解剖姿勢下前臂外側長骨','Rotates around ulna during pronation/supination and contributes strongly to wrist articulation','旋前旋後時繞尺骨轉動，並主要參與腕關節','Head, neck, radial tuberosity, styloid process','橈骨頭、橈骨頸、橈骨粗隆、橈骨莖突'),
 'ulna':bone('尺骨','Medial long bone of forearm in anatomical position','解剖姿勢下前臂內側長骨','Forms the primary hinge articulation with humeral trochlea at elbow','在肘關節與肱骨滑車形成主要鉸鏈關節','Olecranon, coronoid process, trochlear notch, radial notch, ulnar tuberosity, styloid process','鷹嘴、冠狀突、滑車切跡、橈骨切跡、尺骨粗隆、尺骨莖突'),
 'scaphoid':bone('舟狀骨','Proximal-row carpal bone','近列腕骨','Articulates with radius and links the two carpal rows','與橈骨相接並跨接兩列腕骨','Scaphoid tubercle; clinically important waist','舟狀骨結節；臨床重要的舟狀骨腰部'),
 'lunate':bone('月狀骨','Proximal-row carpal bone','近列腕骨','Central proximal carpal participating in radiocarpal articulation','位於近列腕骨中央並參與橈腕關節','Crescent-shaped proximal carpal','新月形近列腕骨'),
 'triquetrum':bone('三角骨','Proximal-row carpal bone','近列腕骨','Articulates with pisiform on palmar surface','掌側與豆狀骨相接','Pyramidal carpal on ulnar side','尺側的錐形腕骨'),
 'pisiform':bone('豆狀骨','Sesamoid carpal bone','籽骨性腕骨','Develops in flexor carpi ulnaris tendon and marks ulnar palmar wrist','位於尺側腕屈肌腱內，形成掌側尺側腕部標誌','Pisiform; attachment for FCU and hypothenar structures','豆狀骨；尺側腕屈肌與小魚際相關附著點'),
 'trapezium':bone('大菱形骨','Distal-row carpal bone','遠列腕骨','Forms saddle CMC joint with first metacarpal','與第一掌骨形成鞍狀腕掌關節','Tubercle and groove for flexor carpi radialis','大菱形骨結節與橈側腕屈肌腱溝'),
 'trapezoid':bone('小菱形骨','Distal-row carpal bone','遠列腕骨','Firmly articulates with second metacarpal','與第二掌骨緊密相接','Wedge-shaped carpal between trapezium and capitate','位於大菱形骨與頭狀骨之間的楔形腕骨'),
 'capitate':bone('頭狀骨','Largest distal-row carpal bone','最大的遠列腕骨','Central keystone of the carpus, aligned with third metacarpal','腕骨中央樞紐，與第三掌骨大致成一直線','Rounded head, neck and body','圓形頭部、頸與體'),
 'hamate':bone('鉤骨','Distal-row carpal bone','遠列腕骨','Ulnar distal carpal articulating with 4th and 5th metacarpals','尺側遠列腕骨，與第四及第五掌骨相接','Hook of hamate','鉤骨鉤')
};

const muscleZh:Record<string,string>={
 'abductor hallucis':'拇外展肌','abductor pollicis brevis':'拇短外展肌','abductor pollicis longus':'拇長外展肌','adductor brevis':'短收肌','adductor longus':'長收肌','adductor magnus':'大收肌','adductor minimus':'小收肌','anconeus':'肘肌','aryepiglotticus':'杓會厭肌','brachialis':'肱肌','brachioradialis':'肱橈肌','coccygeus':'尾骨肌','coracobrachialis':'喙肱肌','digastric':'二腹肌','diaphragm':'橫膈','external oblique':'腹外斜肌','fibularis brevis':'腓骨短肌','fibularis longus':'腓骨長肌','fibularis tertius':'第三腓骨肌','flexor accessorius':'副屈肌','flexor carpi radialis':'橈側腕屈肌','flexor digitorum brevis':'趾短屈肌','flexor digitorum longus':'趾長屈肌','flexor digitorum profundus':'指深屈肌','flexor digitorum superficialis':'指淺屈肌','flexor hallucis longus':'拇長屈肌','flexor pollicis brevis':'拇短屈肌','flexor pollicis longus':'拇長屈肌','gastrocnemius':'腓腸肌','gemellus inferior':'下孖肌','gemellus superior':'上孖肌','genioglossus':'頦舌肌','geniohyoid':'頦舌骨肌','gluteus maximus':'臀大肌','gluteus medius':'臀中肌','gluteus minimus':'臀小肌','gracilis':'股薄肌','hyoglossus':'舌骨舌肌','iliacus':'髂肌','iliocostalis cervicis':'頸髂肋肌','iliocostalis lumborum':'腰髂肋肌','iliocostalis thoracis':'胸髂肋肌','inferior oblique':'下斜肌','inferior rectus':'下直肌','infraspinatus muscle':'棘下肌','interspinalis thoracis':'胸棘間肌','lateral rectus':'外直肌','latissimus dorsi':'背闊肌','levator palpebrae superioris':'提上瞼肌','levator veli palatini':'提腭帆肌','longissimus capitis':'頭最長肌','longissimus cervicis':'頸最長肌','longissimus thoracis':'胸最長肌','longus capitis':'頭長肌','medial rectus':'內直肌','mylohyoid':'下頜舌骨肌','oblique arytenoid':'斜杓肌','obliquus capitis inferior':'頭下斜肌','obliquus capitis superior':'頭上斜肌','obturator externus':'閉孔外肌','obturator internus':'閉孔內肌','omohyoid':'肩胛舌骨肌','opponens pollicis':'拇對掌肌','palmaris longus':'掌長肌','pectineus':'恥骨肌','pectoralis major':'胸大肌','pectoralis minor':'胸小肌','piriformis':'梨狀肌','plantaris':'蹠肌','platysma':'頸闊肌','popliteus':'膕肌','pronator quadratus':'旋前方肌','pronator teres':'旋前圓肌','psoas major':'腰大肌','pubococcygeus':'恥尾肌','puborectalis':'恥骨直腸肌','quadratus femoris':'股方肌','rectus capitis anterior':'頭前直肌','rectus capitis lateralis':'頭外側直肌','rectus capitis posterior major':'頭後大直肌','rectus capitis posterior minor':'頭後小直肌','rectus femoris':'股直肌','rhomboid major':'大菱形肌','rhomboid minor':'小菱形肌','sartorius':'縫匠肌','scalenus anterior':'前斜角肌','scalenus medius':'中斜角肌','scalenus posterior':'後斜角肌','semimembranosus':'半膜肌','semispinalis capitis':'頭半棘肌','semispinalis cervicis':'頸半棘肌','semispinalis thoracis':'胸半棘肌','semitendinosus':'半腱肌','serratus anterior':'前鋸肌','serratus posterior inferior':'後下鋸肌','serratus posterior superior':'後上鋸肌','soleus':'比目魚肌','spinalis':'棘肌','spinalis thoracis':'胸棘肌','splenius capitis':'頭夾肌','splenius cervicis':'頸夾肌','sternocleidomastoid':'胸鎖乳突肌','sternohyoid':'胸骨舌骨肌','sternothyroid':'胸骨甲狀肌','stylohyoid':'莖突舌骨肌','subclavius':'鎖骨下肌','superior oblique':'上斜肌','superior rectus':'上直肌','supinator':'旋後肌','supraspinatus':'棘上肌','tensor veli palatini':'張腭帆肌','teres major':'大圓肌','teres minor':'小圓肌','thyro-arytenoid':'甲杓肌','thyrohyoid':'甲狀舌骨肌','tibialis anterior':'脛骨前肌','tibialis posterior':'脛骨後肌','transversus thoracis':'胸橫肌','vastus intermedius':'股中間肌','vastus lateralis':'股外側肌','vastus medialis':'股內側肌','vocalis':'聲帶肌',
 'extensor carpi radialis brevis':'橈側腕短伸肌','extensor carpi radialis longus':'橈側腕長伸肌','extensor carpi ulnaris':'尺側腕伸肌','extensor digiti minimi':'小指伸肌','extensor digitorum':'指伸肌','extensor digitorum longus':'趾長伸肌','extensor hallucis brevis':'拇短伸肌','extensor hallucis longus':'拇長伸肌','extensor indicis':'食指伸肌','extensor pollicis brevis':'拇短伸肌','extensor pollicis longus':'拇長伸肌',
 'external anal sphincter':'肛門外括約肌','external intercostal muscle':'肋間外肌','internal intercostal muscle':'肋間內肌','innermost intercostal muscle':'肋間最內肌','flexor digiti minimi brevis of foot':'足小趾短屈肌','opponens digiti minimi of foot':'足小趾對蹠肌','lateral lumbar intertransversarius':'腰外側橫突間肌','medial lumbar intertransversarius':'腰內側橫突間肌','cervical rotator':'頸迴旋肌','thoracic rotator':'胸迴旋肌','lumbar rotator':'腰迴旋肌','iliococcygeus':'髂尾肌','lateral crico-arytenoid':'環杓外側肌','posterior crico-arytenoid':'環杓後肌','cricothyroid':'環甲肌','transverse arytenoid':'杓橫肌','uvular muscle':'懸雍垂肌','longus colli':'頸長肌','superficial perineal muscle':'淺會陰肌','papillary muscle of ventricle':'心室乳頭肌','anterior papillary muscle of ventricle':'心室前乳頭肌','posterior papillary muscle of ventricle':'心室後乳頭肌','septal papillary muscle of ventricle':'心室隔側乳頭肌','lateral papillary muscle of ventricle':'心室外側乳頭肌'
};

const exactZh:Record<string,string>={
 'clavicle':'鎖骨','scapula':'肩胛骨','humerus':'肱骨','radius':'橈骨','ulna':'尺骨','femur':'股骨','tibia':'脛骨','fibula':'腓骨','patella':'髕骨','hyoid bone':'舌骨','hip bone':'髖骨','sternum':'胸骨','body of sternum':'胸骨體','xiphoid process':'劍突','atlas':'寰椎','axis':'樞椎','sacrum':'薦骨','coccyx':'尾骨',
 'scaphoid':'舟狀骨','lunate':'月狀骨','triquetrum':'三角骨','pisiform':'豆狀骨','trapezium':'大菱形骨','trapezoid':'小菱形骨','capitate':'頭狀骨','hamate':'鉤骨',
 'axillary nerve':'腋神經','musculocutaneous nerve':'肌皮神經','median nerve':'正中神經','ulnar nerve':'尺神經','radial nerve':'橈神經','suprascapular nerve':'肩胛上神經','dorsal scapular nerve':'肩胛背神經','long thoracic nerve':'胸長神經','thoracodorsal nerve':'胸背神經','lateral pectoral nerve':'外側胸神經','medial pectoral nerve':'內側胸神經','upper subscapular nerve':'上肩胛下神經','lower subscapular nerve':'下肩胛下神經','anterior interosseous nerve':'前骨間神經','posterior interosseous nerve':'後骨間神經','lateral antebrachial cutaneous nerve':'外側前臂皮神經','medial antebrachial cutaneous nerve':'內側前臂皮神經','medial brachial cutaneous nerve':'內側上臂皮神經',
 'optic nerve':'視神經','oculomotor nerve':'動眼神經','trochlear nerve':'滑車神經','ophthalmic nerve':'眼神經','frontal nerve':'額神經','lacrimal nerve':'淚腺神經','nasociliary nerve':'鼻睫神經','supra-orbital nerve':'眶上神經','supratrochlear nerve':'滑車上神經','infratrochlear nerve':'滑車下神經','anterior ethmoidal nerve':'前篩神經','posterior ethmoidal nerve':'後篩神經','long ciliary nerve':'長睫狀神經','short ciliary nerve':'短睫狀神經','ciliary ganglion':'睫狀神經節'
};

const landmarkZh:[string,string][]=[
 ['glenoid cavity','關節盂'],['coracoid process','喙突'],['acromion','肩峰'],['spine of scapula','肩胛棘'],['supraspinous fossa','棘上窩'],['infraspinous fossa','棘下窩'],['subscapular fossa','肩胛下窩'],['suprascapular notch','肩胛上切跡'],['greater tubercle','大結節'],['lesser tubercle','小結節'],['intertubercular groove','結節間溝'],['intertubercular sulcus','結節間溝'],['deltoid tuberosity','三角肌粗隆'],['radial groove','橈神經溝'],['medial epicondyle','內上髁'],['lateral epicondyle','外上髁'],['radial fossa','橈骨窩'],['coronoid fossa','冠狀窩'],['capitulum','小頭'],['trochlea','滑車'],['olecranon fossa','鷹嘴窩'],['head of radius','橈骨頭'],['neck of radius','橈骨頸'],['radial tuberosity','橈骨粗隆'],['olecranon','鷹嘴'],['coronoid process','冠狀突'],['trochlear notch','滑車切跡'],['radial notch of ulna','橈骨切跡'],['ulnar tuberosity','尺骨粗隆'],['acromial end','肩峰端'],['sternal end','胸骨端'],['conoid tubercle','錐狀結節'],['trapezoid line','斜方線']
];

const systemZh:Record<SystemId,string>={
 skeletal:'骨骼',muscular:'肌肉',arterial:'動脈',venous:'靜脈',nervous:'神經',digestive:'消化系統',respiratory:'呼吸系統',urinary:'泌尿系統',reproductive:'生殖系統',lymphatic:'淋巴系統',endocrine:'內分泌系統',integumentary:'體表／皮膚',connective:'結締組織',sensory:'感覺器官',cardiac:'心臟'
};

const norm=(s:string)=>s.toLowerCase().replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim();
const stripSide=(s:string)=>s.replace(/\b(left|right)\b/gi,'').replace(/\s+/g,' ').trim();

function directBaseChinese(base:string){
 const n=norm(base);
 if(exactZh[n])return exactZh[n];
 if(muscleZh[n])return muscleZh[n];
 if(detailed[n]?.chinese)return detailed[n].chinese;
 const lm=landmarkZh.find(([key])=>n===key||n.includes(key));
 return lm?.[1];
}

function chineseName(name:string,system:SystemId){
 const side=/\bleft\b/i.test(name)?'左':/\bright\b/i.test(name)?'右':'';
 let base=stripSide(name).replace(/^the\s+/i,'').trim();
 const direct=directBaseChinese(base);
 if(direct)return side+direct;

 const ofHand=/^(first|second|third|fourth)\s+lumbrical\s+of\s+hand$/i.exec(base);
 if(ofHand){const ord:{[k:string]:string}={first:'第一',second:'第二',third:'第三',fourth:'第四'};return side+ord[ofHand[1].toLowerCase()]+'蚓狀肌';}
 const ofFoot=/^(first|second|third|fourth)\s+lumbrical\s+of\s+foot$/i.exec(base);
 if(ofFoot){const ord:{[k:string]:string}={first:'第一',second:'第二',third:'第三',fourth:'第四'};return side+'足'+ord[ofFoot[1].toLowerCase()]+'蚓狀肌';}
 const plantarInterosseous=/^(first|second|third)\s+plantar\s+interosseous\s+of\s+foot$/i.exec(base);
 if(plantarInterosseous){const ord:{[k:string]:string}={first:'第一',second:'第二',third:'第三'};return side+'足'+ord[plantarInterosseous[1].toLowerCase()]+'蹠側骨間肌';}
 const setName=/^set\s+of\s+(.+)$/i.exec(base);
 if(setName){
  const setMap:Record<string,string>={
   'dorsal interossei of hand':'手背側骨間肌群','palmar interossei of hand':'手掌側骨間肌群','lumbricals of hand':'手蚓狀肌群',
   'anterior cervical intertransversarii':'頸前橫突間肌群','posterior cervical intertransversarii':'頸後橫突間肌群',
   'interspinales cervicis':'頸棘間肌群','interspinales lumborum':'腰棘間肌群','levatores costarum breves':'短肋提肌群','levatores costarum longi':'長肋提肌群'
  };
  const zh=setMap[norm(setName[1])];if(zh)return side+zh;
 }

 const head=/^(long|short|medial|lateral|humeral|ulnar|oblique|transverse)\s+head\s+of\s+(.+)$/i.exec(base);
 if(head){const b=directBaseChinese(head[2]);const h:{[k:string]:string}={long:'長頭',short:'短頭',medial:'內側頭',lateral:'外側頭',humeral:'肱骨頭',ulnar:'尺骨頭',oblique:'斜頭',transverse:'橫頭'};if(b)return side+b+h[head[1].toLowerCase()];}
 const part=/^(abdominal|acromial|clavicular|spinal|sternocostal|ascending|descending|transverse|superficial|deep)\s+part\s+of\s+(.+)$/i.exec(base);
 if(part){const b=directBaseChinese(part[2]);const q:{[k:string]:string}={abdominal:'腹部',acromial:'肩峰部',clavicular:'鎖骨部',spinal:'肩胛棘部',sternocostal:'胸肋部',ascending:'上行部',descending:'下行部',transverse:'橫行部',superficial:'淺部',deep:'深部'};if(b)return side+b+q[part[1].toLowerCase()];}

 const vertebra=/^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth)\s+(cervical|thoracic|lumbar)\s+vertebra$/i.exec(base);
 if(vertebra){const ord:{[k:string]:string}={first:'第一',second:'第二',third:'第三',fourth:'第四',fifth:'第五',sixth:'第六',seventh:'第七',eighth:'第八',ninth:'第九',tenth:'第十',eleventh:'第十一',twelfth:'第十二'};const reg:{[k:string]:string}={cervical:'頸椎',thoracic:'胸椎',lumbar:'腰椎'};return side+ord[vertebra[1].toLowerCase()]+reg[vertebra[2].toLowerCase()];}
 const phalanx=/^(proximal|middle|distal)\s+phalanx\s+of\s+(.+)$/i.exec(base);
 if(phalanx){const seg:{[k:string]:string}={proximal:'近節',middle:'中節',distal:'遠節'};return side+seg[phalanx[1].toLowerCase()]+'指／趾骨（'+phalanx[2]+'）';}
 const metacarpal=/^(first|second|third|fourth|fifth)\s+metacarpal(?:\s+bone)?$/i.exec(base);
 if(metacarpal){const ord:{[k:string]:string}={first:'第一',second:'第二',third:'第三',fourth:'第四',fifth:'第五'};return side+ord[metacarpal[1].toLowerCase()]+'掌骨';}
 const metatarsal=/^(first|second|third|fourth|fifth)\s+metatarsal(?:\s+bone)?$/i.exec(base);
 if(metatarsal){const ord:{[k:string]:string}={first:'第一',second:'第二',third:'第三',fourth:'第四',fifth:'第五'};return side+ord[metatarsal[1].toLowerCase()]+'蹠骨';}

 if(/\bnerve\b/i.test(base)){
  let x=norm(base);
  const nerveTerms:[string,string][]=[
   ['musculocutaneous','肌皮'],['suprascapular','肩胛上'],['dorsal scapular','肩胛背'],['long thoracic','胸長'],['thoracodorsal','胸背'],['anterior interosseous','前骨間'],['posterior interosseous','後骨間'],['medial antebrachial cutaneous','內側前臂皮'],['lateral antebrachial cutaneous','外側前臂皮'],['medial brachial cutaneous','內側上臂皮'],['posterior antebrachial cutaneous','後前臂皮'],['superficial branch of radial','橈神經淺支'],['deep branch of radial','橈神經深支'],['dorsal branch of ulnar','尺神經背支'],['palmar branch of median','正中神經掌支'],['palmar branch of ulnar','尺神經掌支'],['proper palmar digital','固有掌側指'],['common palmar digital','總掌側指'],['axillary','腋'],['median','正中'],['ulnar','尺'],['radial','橈'],['ophthalmic','眼'],['optic','視'],['oculomotor','動眼'],['trochlear','滑車'],['lacrimal','淚腺'],['frontal','額'],['nasociliary','鼻睫'],['ciliary','睫狀'],['ethmoidal','篩']
  ];
  for(const [en,zh] of nerveTerms){if(x.includes(en))return side+zh+(zh.endsWith('支')?'':'神經');}
  return side+'神經構造（'+base+'）';
 }

 if(system==='muscular')return side+'肌肉（'+base+'）';
 if(system==='skeletal')return side+'骨骼構造（'+base+'）';
 return side+base;
}

function detailKey(name:string){
 const n=norm(stripSide(name));
 return Object.keys(detailed).sort((a,b)=>b.length-a.length).find(k=>n===k||n.includes(k));
}

function genericSummary(name:string,system:SystemId,chinese:string|undefined){
 const zhName=chinese??'此構造';
 if(system==='muscular')return{
  en:`${name} is a named muscle in the 3D atlas. The course-derived profiles include origin, insertion, innervation and action when available; otherwise this entry keeps the anatomical name and regional context without inventing unsupported details.`,
  zh:`${zhName}是 3D 圖譜中的具名肌肉。若上課資料有記載，頁面會顯示起點、止點、神經支配與作用；若沒有，則保留標準名稱與區域性簡介，不杜撰細節。`
 };
 if(system==='nervous')return{
  en:`${name} is a named neural structure in the atlas. Peripheral nerve entries describe course and motor/sensory relationships when source material is available.`,
  zh:`${zhName}是圖譜中的具名神經構造。若來源資料有記載，周邊神經會補充走行以及運動／感覺關係。`
 };
 if(system==='skeletal')return{
  en:`${name} is a named skeletal structure in the atlas. Bone profiles emphasize anatomical region, articulations or structural role, and clinically useful landmarks when source material is available.`,
  zh:`${zhName}是圖譜中的具名骨骼構造。若來源資料有記載，骨骼介紹會著重所在區域、關節／結構角色及重要骨標誌。`
 };
 return{
  en:`${name} is a named ${system} structure represented in the source anatomy.`,
  zh:`${zhName}是來源人體圖譜中所呈現的${systemZh[system]}構造。`
 };
}

function sourceFor(name:string,system:SystemId){
 const n=norm(name);
 const upperLimb=/clavicle|scapula|humerus|radius|ulna|carpal|metacarp|phalan|deltoid|pectoralis|serratus|trapezius|rhomboid|supraspinatus|infraspinatus|subscapularis|teres|biceps brachii|triceps brachii|brachialis|coracobrachialis|pronator|supinator|brachioradialis|carpi|digitorum|pollicis|lumbrical|interosse|axillary nerve|musculocutaneous nerve|median nerve|ulnar nerve|radial nerve|suprascapular nerve|long thoracic nerve|thoracodorsal nerve/.test(n);
 if(upperLimb&&(system==='muscular'||system==='nervous'||system==='skeletal'))return CMU_SOURCE;
 if(system==='muscular'||system==='nervous'||system==='skeletal')return WEB_SOURCE;
 return 'BodyParts3D naming with general anatomical context';
}

export function structureProfile(name:string,system:SystemId):StructureProfile{
 const key=detailKey(name);
 const chinese=chineseName(name,system);
 if(key){
  const d=detailed[key],summary=genericSummary(name,system,chinese);
  return {english:name,chinese:chinese||d.chinese,category:d.category,summaryEn:d.summaryEn??summary.en,summaryZh:d.summaryZh??summary.zh,facts:d.facts,source:d.source};
 }
 const summary=genericSummary(name,system,chinese);
 return {
  english:name,
  chinese,
  category:`${systemZh[system]}｜${system}`,
  summaryEn:summary.en,
  summaryZh:summary.zh,
  facts:[],
  source:sourceFor(name,system)
 };
}
