/**
 * Chinese names for lazily loaded neuro- and joint structures: brain gyri, sulci, nuclei and tracts, cranial and peripheral nerve
 * branches, joint ligaments and capsules, intervertebral discs. Taiwan anatomical terminology; composed names carry a `check` note.
 */
import type {ZhName} from './mj-zh-anatomy';

const EXACT:Record<string,string>={
 // cranial nerves
 'olfactory nerve (i)':'嗅神經（第一對腦神經）','optic nerve (ii)':'視神經（第二對腦神經）','oculomotor nerve (iii)':'動眼神經（第三對腦神經）','trochlear nerve (iv)':'滑車神經（第四對腦神經）','trigeminal nerve (v)':'三叉神經（第五對腦神經）',
 'abducens nerve (vi)':'外旋神經（第六對腦神經）','facial nerve (vii)':'顏面神經（第七對腦神經）','vestibulocochlear nerve (viii)':'前庭耳蝸神經（第八對腦神經）','glossopharyngeal nerve (ix)':'舌咽神經（第九對腦神經）','vagus nerve (x)':'迷走神經（第十對腦神經）',
 'accessory nerve (xi)':'副神經（第十一對腦神經）','hypoglossal nerve (xii)':'舌下神經（第十二對腦神經）','cochlear nerve':'耳蝸神經','vestibular nerve':'前庭神經','motor root of trigeminal nerve':'三叉神經運動根','sensory root of trigeminal nerve':'三叉神經感覺根',
 'posterior division of mandibular nerve':'下頷神經後股','anterior division of mandibular nerve':'下頷神經前股','buccal nerve':'頰神經','lingual nerve':'舌神經','inferior alveolar nerve':'下齒槽神經','mental nerve':'頦神經','nerve to mylohyoid muscle':'下頷舌骨肌神經',
 'motor nucleus of facial nerve':'顏面神經運動核','nucleus of abducens nerve':'外旋神經核','nucleus of accessory nerve':'副神經核','nucleus of hypoglossal nerve':'舌下神經核','posterior nucleus of vagus nerve':'迷走神經背核','superior salivatory nucleus':'上泌涎核','vestibular nuclei':'前庭神經核',
 // peripheral nerves
 'genitofemoral nerve':'生殖股神經','femoral branch of genitofemoral nerve':'生殖股神經股支','genital branch of genitofemoral nerve':'生殖股神經生殖支','iliohypogastric nerve':'髂腹下神經','ilio-inguinal nerve':'髂腹股溝神經','pudendal nerve':'陰部神經',
 'anterior branch of obturator nerve':'閉孔神經前支','posterior branch of obturator nerve':'閉孔神經後支','anterior cutaneous branches of femoral nerve':'股神經前皮支','infrapatellar branch of saphenous nerve':'隱神經髕下支','medial crural cutaneous branches of saphenous nerve':'隱神經小腿內側皮支',
 'anterior root of posterior femoral cutaneous nerve':'股後皮神經前根','posterior root of posterior femoral cutaneous nerve':'股後皮神經後根','nerve to piriformis muscle':'梨狀肌神經','sural communicating branch of common fibular nerve':'腓總神經腓腸交通支',
 'intermediate dorsal cutaneous nerve of foot':'足中間背側皮神經','medial dorsal cutaneous nerve of foot':'足內側背側皮神經','dorsal digital branches of deep fibular nerve':'腓深神經背側趾支','dorsal digital branches of superficial fibular nerve':'腓淺神經背側趾支','muscular branches of deep fibular nerve':'腓深神經肌支',
 'common plantar digital branches of lateral plantar nerve':'外蹠神經蹠側總趾支','common plantar digital branches of medial plantar nerve':'內蹠神經蹠側總趾支','proper plantar digital branches of lateral plantar nerve':'外蹠神經蹠側固有趾支','proper plantar digital branches of medial plantar nerve':'內蹠神經蹠側固有趾支',
 'inferior subscapular nerve':'肩胛下神經（下）','superior subscapular nerve':'肩胛下神經（上）','anterior root of spinal nerve':'脊神經前根','posterior root of spinal nerve':'脊神經後根','spinal ganglion':'脊神經節',
 'anterior division of superior trunk of brachial plexus':'臂神經叢上幹前股','posterior division of superior trunk of brachial plexus':'臂神經叢上幹後股','anterior division of middle trunk of brachial plexus':'臂神經叢中幹前股','posterior division of middle trunk of brachial plexus':'臂神經叢中幹後股',
 'anterior division of inferior trunk of brachial plexus':'臂神經叢下幹前股','posterior division of inferior trunk of brachial plexus':'臂神經叢下幹後股','anterior horn of spinal cord':'脊髓前角','posterior horn of spinal cord':'脊髓後角','white matter of spinal cord':'脊髓白質',
 // spinal ligaments, discs, joints
 'anterior longitudinal ligament':'前縱韌帶','posterior longitudinal ligament':'後縱韌帶','ligamenta flava':'黃韌帶','interspinous ligaments':'棘間韌帶','supraspinous ligament':'棘上韌帶','nuchal ligament':'項韌帶','iliolumbar ligament':'髂腰韌帶',
 'sacrospinous ligament':'薦棘韌帶','sacrotuberous ligament':'薦結節韌帶','anterior sacro-iliac ligament':'前薦髂韌帶','posterior sacro-iliac ligament':'後薦髂韌帶','interosseous sacro-iliac ligament':'薦髂骨間韌帶','pubic symphysis':'恥骨聯合','interpubic disc':'恥骨間盤',
 'sacrococcygeal symphysis':'薦尾聯合','superior pubic ligament':'恥骨上韌帶','inferior pubic ligament':'恥骨下韌帶','obturator membrane':'閉孔膜','triradiate cartilage':'Y 形軟骨','intercornual ligament':'角間韌帶',
 'costotransverse ligament':'肋橫突韌帶','radiate ligament of head of rib':'肋頭輻狀韌帶','intra-articular ligament of head of rib':'肋頭關節內韌帶','external intercostal membrane':'外肋間膜','internal intercostal membrane':'內肋間膜',
 // shoulder, elbow, wrist, hand
 'acromioclavicular ligament':'肩鎖韌帶','conoid ligament':'錐狀韌帶','trapezoid ligament':'斜方韌帶','coracohumeral ligament':'喙肱韌帶','superior glenohumeral ligament':'上盂肱韌帶','middle glenohumeral ligament':'中盂肱韌帶','inferior glenohumeral ligament':'下盂肱韌帶',
 'glenoid labrum':'盂唇','transverse humeral ligament':'肱橫韌帶','interclavicular ligament':'鎖骨間韌帶','anterior sternoclavicular ligament':'前胸鎖韌帶','posterior sternoclavicular ligament':'後胸鎖韌帶','annular ligament of radius':'橈骨環狀韌帶',
 'radial collateral ligament':'橈側副韌帶','ulnar collateral ligament':'尺側副韌帶','radial collateral ligament of wrist joint':'腕橈側副韌帶','ulnar collateral ligament of wrist joint':'腕尺側副韌帶','palmar radio-ulnar ligament':'掌側橈尺韌帶',
 'dorsal radiocarpal ligament':'背側橈腕韌帶','dorsal ulnocarpal ligament':'背側尺腕韌帶','ulnolunate ligament':'尺月韌帶','ulnotriquetral ligament':'尺三角韌帶','ulnocapitate ligament':'尺頭狀韌帶','radioscaphocapitate ligament':'橈舟頭狀韌帶','radiate carpal ligament':'腕輻狀韌帶',
 'dorsal scaphotriquetral ligament':'背側舟三角韌帶','palmar scaphotriquetral ligament':'掌側舟三角韌帶','scaphotrapeziotrapezoidal ligament':'舟大小多角韌帶','triquetrocapitate ligament':'三角頭狀韌帶','pisotriquetral ligament':'豆三角韌帶',
 'dorsal carpometacarpal ligaments':'背側腕掌韌帶','palmar carpometacarpal ligaments':'掌側腕掌韌帶','dorsal intercarpal ligaments':'背側腕間韌帶','dorsal metacarpal ligaments':'背側掌骨韌帶','palmar metacarpal ligaments':'掌側掌骨韌帶','interosseous metacarpal ligaments':'掌骨間韌帶',
 'deep transverse metacarpal ligament':'掌骨深橫韌帶','collateral metacarpophalangeal ligaments':'掌指關節側副韌帶','collateral interphalangeal ligaments of hand':'手指間關節側副韌帶','palmar interphalangeal ligaments':'指間關節掌側韌帶',
 'articular capsule of acromioclavicular joint':'肩鎖關節囊','articular capsule of elbow joint':'肘關節囊','articular capsule of glenohumeral joint':'盂肱關節囊','articular capsule of radiocarpal joint':'橈腕關節囊','articular capsule of sternoclavicular joint':'胸鎖關節囊',
 'articular capsules of metacarpophalangeal joints':'掌指關節囊','articular capsules of proximal interphalangeal joints':'近端指間關節囊','articular capsules of distal interphalangeal joints':'遠端指間關節囊','articular disc of acromioclavicular joint':'肩鎖關節盤',
 'articular disc of distal radio-ulnar joint':'遠端橈尺關節盤','articular disc of sternoclavicular joint':'胸鎖關節盤','articular capsule of temporomandibular joint':'顳顎關節囊','articular disc of temporomandibular joint':'顳顎關節盤',
 'lateral temporomandibular ligament':'顳顎外側韌帶','sphenomandibular ligament':'蝶下頷韌帶','stylomandibular ligament':'莖突下頷韌帶','cricopharyngeal ligament':'環咽韌帶','quadrangular membrane':'四角膜','frenula capsulae':'關節囊繫帶',
 // hip, knee, ankle, foot
 'articular capsule of hip joint':'髖關節囊','articular capsule of knee joint':'膝關節囊','articular capsule of superior tibiofibular joint':'上脛腓關節囊','articular capsule of interphalangeal joint of great toe':'拇趾趾間關節囊','articular capsules of metatarsophalangeal joints':'蹠趾關節囊',
 'articular capsules of proximal interphalangeal joints of foot':'足近端趾間關節囊','articular capsules of distal interphalangeal joints of foot':'足遠端趾間關節囊','acetabular labrum':'髖臼唇','transverse acetabular ligament':'髖臼橫韌帶','ligament of head of femur':'股骨頭韌帶',
 'iliofemoral ligament':'髂股韌帶','descending part of iliofemoral ligament':'髂股韌帶降部','transverse part of iliofemoral ligament':'髂股韌帶橫部','pubofemoral ligament':'恥股韌帶','ischiofemoral ligament':'坐股韌帶',
 'anterior cruciate ligament':'前十字韌帶','posterior cruciate ligament':'後十字韌帶','fibular collateral ligament':'腓側副韌帶','superficial part of tibial collateral ligament':'脛側副韌帶淺部','deep part of tibial collateral ligament':'脛側副韌帶深部',
 'lateral meniscus':'外側半月板','medial meniscus':'內側半月板','transverse ligament of knee':'膝橫韌帶','meniscopatellar ligament':'半月板髕韌帶','oblique popliteal ligament':'斜膕韌帶','arcuate popliteal ligament':'弓狀膕韌帶','popliteofibular ligament':'膕腓韌帶','infrapatellar fat pad':'髕下脂肪墊',
 'anterior meniscotibial ligament (lateral meniscus)':'外側半月板前脛側韌帶','anterior meniscotibial ligament (medial meniscus)':'內側半月板前脛側韌帶','posterior meniscotibial ligament (lateral meniscus)':'外側半月板後脛側韌帶','posterior meniscotibial ligament (medial meniscus)':'內側半月板後脛側韌帶',
 'anterior ligament of fibular head':'腓骨頭前韌帶','posterior ligament of fibular head':'腓骨頭後韌帶','anterior tibiofibular ligament':'前脛腓韌帶','posterior tibiofibular ligament':'後脛腓韌帶','transverse tibiofibular ligament':'脛腓橫韌帶','posterior tibiotalar ligament':'後脛距韌帶',
 'tibiocalcaneal ligament':'脛跟韌帶','tibionavicular ligament':'脛舟韌帶','anterior talocalcaneal ligament':'前距跟韌帶','posterior talocalcaneal ligament':'後距跟韌帶','lateral talocalcaneal ligament':'外側距跟韌帶','medial talocalcaneal ligament':'內側距跟韌帶','talocalcaneal interosseous ligament':'距跟骨間韌帶',
 'talonavicular ligament':'距舟韌帶','calcaneocuboid ligament':'跟骰韌帶','calcaneonavicular ligament':'跟舟韌帶','plantar calcaneocuboid ligament':'足底跟骰韌帶','cuneocuboid interosseous ligament':'楔骰骨間韌帶','intercuneiform interosseous ligaments':'楔間骨間韌帶','cuneometatarsal interosseous ligaments':'楔蹠骨間韌帶',
 'dorsal cuneonavicular ligaments':'背側楔舟韌帶','plantar cuneonavicular ligaments':'足底楔舟韌帶','dorsal intercuneiform ligaments':'背側楔間韌帶','plantar intercuneiform ligaments':'足底楔間韌帶','plantar cuneocuboid ligament':'足底楔骰韌帶','dorsal tarsometatarsal ligaments':'背側跗蹠韌帶','plantar tarsometatarsal ligaments':'足底跗蹠韌帶',
 'dorsal metatarsal ligaments':'背側蹠骨韌帶','plantar metatarsal ligaments':'足底蹠骨韌帶','metatarsal interosseous ligaments':'蹠骨間韌帶','deep transverse metatarsal ligament':'蹠骨深橫韌帶','collateral metatarsophalangeal ligaments':'蹠趾關節側副韌帶','plantar metatarsophalangeal ligaments':'足底蹠趾韌帶',
 'collateral interphalangeal ligaments of foot':'足趾間關節側副韌帶','plantar interphalangeal ligaments':'足底趾間韌帶','intersesamoid ligament':'籽骨間韌帶',
 // brain
 'adenohypophysis':'腺垂體','neurohypophysis':'神經垂體','pineal gland':'松果腺','acoustic radiation':'聽放射','optic radiation':'視放射','anterior thalamic radiation':'前視丘輻射','posterior thalamic radiation':'後視丘輻射','superior thalamic radiation':'上視丘輻射',
 'anterior hypothalamus':'下視丘前部','posterior hypothalamus':'下視丘後部','lateral hypothalamus':'下視丘外側部','preoptic hypothalamus':'視前下視丘','tuberal hypothalamus':'下視丘結節部','anterior nuclei of thalamus':'視丘前核群','mediodorsal nucleus':'背內側核','pulvinar':'視丘枕',
 'ventral anterior nucleus':'腹前核','ventral laterodorsal nucleus':'腹外背側核','ventral lateroventral nucleus':'腹外腹側核','intralaminar and lateral posterior nuclei':'板內核群及外側後核','stria medullaris thalami':'視丘髓紋','anterior intercavernous sinus':'前海綿間竇','posterior intercavernous sinus':'後海綿間竇',
 'aqueduct of midbrain':'中腦導水管','arcuate fasciculus':'弓狀束','base of peduncle':'大腦腳底','basolateral complex':'基底外側複合體','corticomedial group':'皮質內側核群','central nucleus':'中央核','lateral nucleus':'外側核','nucleus accumbens':'伏隔核','septal nuclei':'中隔核',
 'basilar venous plexus':'基底靜脈叢','cavernous sinus':'海綿竇','choroid plexus':'脈絡叢','falx cerebri':'大腦鐮','inferior petrosal sinus':'下岩竇','superior petrosal sinus':'上岩竇','inferior sagittal sinus':'下矢狀竇','superior sagittal sinus':'上矢狀竇','straight sinus':'直竇','sigmoid sinus':'乙狀竇','transverse sinus':'橫竇','occipital sinus':'枕竇',
 'corticobulbar tract':'皮質延髓徑','corticospinal tract':'皮質脊髓徑','corticopontine tract (frontal)':'額橋徑','corticopontine tract (occipital)':'枕橋徑','corticopontine tract (parietal)':'頂橋徑','corticostriatal tract (anterior)':'皮質紋狀體徑（前）','corticostriatal tract (posterior)':'皮質紋狀體徑（後）','corticostriatal tract (superior)':'皮質紋狀體徑（上）',
 'dentatorubrothalamic tract':'齒狀核紅核視丘徑','frontal aslant tract':'額斜束','hippocampal commissure':'海馬連合','inferior fronto-occipital fasciculus':'下額枕束','inferior longitudinal fasciculus':'下縱束','middle longitudinal fasciculus':'中縱束','superior longitudinal fasciculus i':'上縱束 I','superior longitudinal fasciculus ii':'上縱束 II','superior longitudinal fasciculus iii':'上縱束 III','uncinate fasciculus':'鉤束','reticulospinal tract':'網狀脊髓徑','medial lemniscus':'內側蹄系','fornix':'穹窿',
 'inferior cerebellar peduncle':'下小腦腳','middle cerebellar peduncle':'中小腦腳','superior cerebellar peduncle':'上小腦腳','peduncle of flocculus':'絨球腳','red nucleus':'紅核','substantia nigra':'黑質','subthalamic nucleus':'視丘下核','olive':'橄欖體','pyramid of medulla oblongata':'延腦錐體','septum pellucidum':'透明中隔',
 'globus pallidus external':'蒼白球外側部','globus pallidus internal':'蒼白球內側部','white matter of telencephalon':'端腦白質',
 'anterior quadrangular lobule':'前四角小葉','posterior quadrangular lobule':'後四角小葉','biventral lobule':'二腹小葉','central lobule':'中央小葉','wing of central lobule':'中央小葉翼','culmen':'山頂','declive':'山坡','flocculus':'絨球','folium of vermis':'蚓葉','gracile lobule':'薄小葉','inferior semilunar lobule':'下半月小葉','superior semilunar lobule':'上半月小葉',
 'lingula of cerebellum':'小腦舌','nodule of vermis':'蚓小結','pyramis of vermis':'蚓錐','tonsil of cerebellum':'小腦扁桃體','tuber of vermis':'蚓結節','uvula of vermis':'蚓垂','mamillary body':'乳頭體',
 'cuneus':'楔葉','precuneus':'楔前葉','lingual gyrus':'舌回','temporal pole':'顳極','temporal plane':'顳平面','occipital pole':'枕極','transverse temporal gyri':'顳橫回','lateral occipitotemporal gyrus':'外側枕顳回','superior occipital gyri':'枕上回','orbital gyri':'眶回',
 'opercular part of inferior frontal gyrus':'額下回蓋部','orbital part of inferior frontal gyrus':'額下回眶部','triangular part of inferior frontal gyrus':'額下回三角部','paracentral gyrus and sulcus':'中央旁小葉及溝','transverse frontopolar gyrus and sulcus':'橫額極回及溝',
 'calcarine sulcus':'距狀溝','collateral sulcus':'側副溝','circular sulcus of insula':'腦島環溝','inferior frontal sulcus':'額下溝','superior frontal sulcus':'額上溝','inferior temporal sulcus':'顳下溝','superior temporal sulcus':'顳上溝','intraparietal sulcus':'頂內溝','lunate sulcus':'月狀溝',
 'olfactory sulcus':'嗅溝','parieto-occipital sulcus':'頂枕溝','subparietal sulcus':'頂下溝','paracentral sulcus':'中央旁溝','posterior transverse collateral sulcus':'後橫側副溝','transverse occipital sulcus':'枕橫溝','anterior occipital sulcus':'枕前溝'
};
const SPINAL=(code:string)=>code.replace('-','–');

export function zhExtra2(n:string):ZhName|undefined{
 const key=n.replace(/\*/g,'').replace(/\s+/g,' ').trim().toLowerCase();
 if(EXACT[key])return{zh:EXACT[key]};
 const disc=/^intervertebral disc ([a-z]\d+-[a-z]\d+)$/.exec(key);
 if(disc)return{zh:`${SPINAL(disc[1].toUpperCase())} 椎間盤`};
 const pulp=/^nucleus pulposus ([a-z]\d+-[a-z]\d+)$/.exec(key);
 if(pulp)return{zh:`${SPINAL(pulp[1].toUpperCase())} 髓核`};
 // names that carry a parenthetical alternative: "lateral occipital gyrus (middle occipital gyrus)" → 枕外側回（枕中回）
 const paren=/^(.+?) \((.+)\)$/.exec(key);
 if(paren){
  const a=EXACT[paren[1]]??GYRUS[paren[1]],b=EXACT[paren[2]]??GYRUS[paren[2]];
  if(a&&b)return{zh:`${a}（${b}）`,check:'腦回／溝別名並列'};
  if(a)return{zh:a,check:'括號內為來源別名'};
 }
 if(GYRUS[key])return{zh:GYRUS[key],check:'腦回／溝名稱'};
 return undefined;
}

const GYRUS:Record<string,string>={
 'cingulate gyrus (posteroventral part)':'扣帶回（後腹側部）','cingulate gyrus and sulcus (middle anterior part)':'扣帶回及溝（中前部）','cingulate gyrus and sulcus (middle posterior part)':'扣帶回及溝（中後部）','cingulate gyrus and sulcus (posterior dorsal part)':'扣帶回及溝（後背側部）',
 'cingulate sulcus (marginal part)':'扣帶溝（邊緣部）','inferior occipital gyrus and sulcus':'枕下回及溝','lateral occipital gyrus':'枕外側回','middle occipital gyrus':'枕中回','straight gyrus':'直回','gyrus rectus':'直回','frontomarginal gyrus and sulcus':'額緣回及溝','h-shaped orbital sulci':'H 形眶溝','lateral orbital sulcus':'外側眶溝',
 'orbital gyri (frontomarginal gyrus and sulcus)':'眶回（額緣回及溝）','orbital sulci (h-shaped orbital sulci)':'眶溝（H 形眶溝）','orbital sulci (lateral orbital sulcus)':'眶溝（外側眶溝）','occipitotemporal sulcus (lateral part)':'枕顳溝（外側部）','precentral sulcus (superior part)':'中央前溝（上部）','precentral sulcus (inferior part)':'中央前溝（下部）',
 'superior temporal gyrus (lateral part)':'顳上回（外側部）','medial occipitotemporal gyrus (parahippocampal)':'內側枕顳回（海馬旁回）','insula (subcentral gyrus and ant and post sulci)':'腦島（中央下回及前後溝）','lat fis-ant-horizont':'外側裂前水平支','lat fis-ant-vertical':'外側裂前垂直支','lat fis-post':'外側裂後支',
 'sulcus interm prim-jensen':'詹森氏中間初級溝','middle cerebral artery (m1-segment)':'大腦中動脈（M1 段）','middle cerebral artery (m3 segment)':'大腦中動脈（M3 段）','middle cerebral artery (m3-segment)':'大腦中動脈（M3 段）','insular branches of middle cerebral artery (m2)':'大腦中動脈島支（M2）','insular branches of middle cerebral artery (m2-segment)':'大腦中動脈島支（M2 段）',
 'distal lateral striate branches':'外側紋狀動脈遠端分支','proximal lateral striate branches':'外側紋狀動脈近端分支','external carotid artery':'外頸動脈','frontal branches of callosomarginal artery':'胼胝體邊緣動脈額支','orbitofrontal branches of anterior cerebral artery':'大腦前動脈眶額支','parietal branches of middle cerebral artery':'大腦中動脈頂支',
 'lateral pontine branches of basilar artery':'基底動脈橋腦外側支','medial pontine branches of basilar artery':'基底動脈橋腦內側支'
};
