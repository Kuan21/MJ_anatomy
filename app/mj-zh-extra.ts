/**
 * Chinese names (Taiwan anatomical terminology) for structures that had no Chinese name: organs, brain parts, eye and ear
 * structures, laryngeal and pharyngeal cartilages and muscles, and the segmental vessels of the viscera. Keys are lower-case English
 * without left/right. Composed names (vessel branches, discs) are returned with a `check` note so they appear in the review list.
 */
import type {ZhName} from './mj-zh-anatomy';
import {zhExtra2} from './mj-zh-extra2';

const EXACT:Record<string,string>={
 // digestive
 'esophagus':'食道','stomach':'胃','duodenum':'十二指腸','appendix':'闌尾','mesoappendix':'闌尾繫膜','ascending colon':'升結腸','transverse colon':'橫結腸','descending colon':'降結腸','rectum':'直腸',
 'ileocecal junction':'迴盲交界','mesentery of small intestine':'小腸繫膜','transverse mesocolon':'橫結腸繫膜','taenia libera':'游離結腸帶','taenia mesocolica':'結腸繫膜帶','taenia omentalis':'網膜帶',
 'distal part of ileum':'迴腸遠段','middle part of ileum':'迴腸中段','proximal part of ileum':'迴腸近段','distal part of jejunum':'空腸遠段','middle part of jejunum':'空腸中段','proximal part of jejunum':'空腸近段',
 'gallbladder':'膽囊','cystic duct':'膽囊管','common hepatic duct':'總肝管','hepatic duct':'肝管','pancreas':'胰臟','pancreatic duct':'胰管','pancreatic duct tree':'胰管樹','parenchyma of pancreas':'胰臟實質',
 'caudate lobe of liver':'肝尾狀葉','duct of caudate lobe of liver':'肝尾狀葉膽管','tongue':'舌','sublingual gland':'舌下腺','submandibular gland':'頷下腺','spleen':'脾臟','lobe of thymus':'胸腺葉',
 // urogenital, endocrine, skin
 'kidney':'腎臟','ureter':'輸尿管','urethra':'尿道','urinary bladder':'膀胱','prostate':'前列腺','seminal vesicle':'精囊','deferent duct':'輸精管','epididymis':'副睪','testis':'睪丸','glans penis':'陰莖頭',
 'corpus cavernosum of penis':'陰莖海綿體','corpus spongiosum of penis':'尿道海綿體','adrenal gland':'腎上腺','pineal body':'松果體','pituitary gland':'腦下垂體',
 'skin':'皮膚','eyebrow':'眉毛','hair of head':'頭髮','pubic hair':'陰毛','lip':'唇',
 // respiratory, larynx, pharynx
 'trachea':'氣管','main bronchus':'主支氣管','main bronchus proper':'主支氣管本幹','epiglottis':'會厭','inferior nasal concha':'下鼻甲','septal nasal cartilage':'鼻中隔軟骨','lateral nasal cartilage':'鼻外側軟骨','major alar cartilage':'大翼軟骨',
 'thyroid cartilage':'甲狀軟骨','cricoid cartilage':'環狀軟骨','arytenoid cartilage':'杓狀軟骨','corniculate cartilage':'小角軟骨','cuneiform cartilage':'楔狀軟骨','conus elasticus':'彈性圓錐',
 'hyo-epiglottic ligament':'舌骨會厭韌帶','thyro-epiglottic ligament':'甲狀會厭韌帶','median cricothyroid ligament':'環甲正中韌帶','median thyrohyoid ligament':'甲狀舌骨正中韌帶','lateral thyrohyoid ligament':'甲狀舌骨外側韌帶',
 'thyrohyoid membrane':'甲狀舌骨膜','vocal ligament':'聲帶韌帶','lateral crico-arytenoid':'環杓側肌','posterior crico-arytenoid':'環杓後肌','thyro-arytenoid':'甲杓肌',
 'superior pharyngeal constrictor':'咽上縮肌','middle pharyngeal constrictor':'咽中縮肌','inferior pharyngeal constrictor':'咽下縮肌','palatopharyngeus':'腭咽肌','salpingopharyngeus':'咽鼓管咽肌','stylopharyngeus':'莖突咽肌',
 'pharyngeal raphe':'咽縫','pterygomandibular raphe':'翼下頷縫','stylohyoid ligament':'莖突舌骨韌帶',
 'superior lingular bronchial tree':'上舌支氣管樹','inferior lingular bronchial tree':'下舌支氣管樹',
 // costal cartilage, discs, connective
 'first costal cartilage':'第一肋軟骨','second costal cartilage':'第二肋軟骨','third costal cartilage':'第三肋軟骨','fourth costal cartilage':'第四肋軟骨','fifth costal cartilage':'第五肋軟骨','sixth costal cartilage':'第六肋軟骨','seventh costal cartilage':'第七肋軟骨',
 'intervertebral disk':'椎間盤','intervertebral disk of axis':'第二頸椎椎間盤','iliotibial tract':'髂脛束','linea alba':'腹白線','calcaneal tendon':'跟腱','intermediate tendon':'中間腱','long plantar ligament':'長足底韌帶',
 'interosseous membrane of forearm':'前臂骨間膜','interosseous membrane of leg':'小腿骨間膜','flexor retinaculum of wrist':'屈肌支持帶（腕）','tendinous arch of levator ani':'提肛肌腱弓','lacrimal bone':'淚骨',
 // eye
 'anterior chamber of eyeball':'眼前房','check ligament of lateral rectus':'外直肌制止韌帶','check ligament of medial rectus':'內直肌制止韌帶','choroid':'脈絡膜','common tendinous ring':'總腱環','cornea':'角膜','corona ciliaris':'睫狀冠',
 'iris':'虹膜','lacrimal canaliculus':'淚小管','lacrimal gland':'淚腺','lacrimal lake':'淚湖','lacrimal sac':'淚囊','nasolacrimal duct':'鼻淚管','lens':'水晶體','optic part of retina':'視網膜視部','sclera':'鞏膜',
 'suspensory ligament of lens':'水晶體懸韌帶','tarsal plate of lower eyelid':'下眼瞼瞼板','tarsal plate of upper eyelid':'上眼瞼瞼板','tendon of levator palpebrae superioris':'提上瞼肌腱','vitreous body':'玻璃體','external ear':'外耳',
 'supra-orbital nerve':'眶上神經','choroid plexus of cerebral hemisphere':'大腦半球脈絡叢',
 // brain
 'amygdala':'杏仁核','angular gyrus':'角回','anterior commissure':'前連合','anterior part of superior temporal gyrus':'顳上回前部','posterior part of superior temporal gyrus':'顳上回後部','brachium of inferior colliculus':'下丘臂','brachium of superior colliculus':'上丘臂',
 'caudate nucleus':'尾狀核','central canal of spinal cord':'脊髓中央管','cerebellum':'小腦','cerebral aqueduct':'中腦導水管','cingulate gyrus':'扣帶回','commissure of fornix of forebrain':'穹窿連合','corpus callosum':'胼胝體','fornix of forebrain':'穹窿',
 'fusiform gyrus':'梭狀回','globus pallidus':'蒼白球','habenula':'韁核','hippocampus':'海馬','hypothalamus':'下視丘','inferior colliculus':'下丘','inferior frontal gyrus':'額下回','inferior temporal gyrus':'顳下回','insula':'腦島','internal capsule':'內囊',
 'interpeduncular fossa':'腳間窩','lamina terminalis':'終板','lateral geniculate body':'外側膝狀體','medial geniculate body':'內側膝狀體','lateral ventricle':'側腦室','third ventricle':'第三腦室','fourth ventricle':'第四腦室','mammillary body':'乳頭體',
 'medulla oblongata':'延腦','midbrain':'中腦','pons':'橋腦','peduncle of midbrain':'中腦腳','middle frontal gyrus':'額中回','middle temporal gyrus':'顳中回','occipital lobe':'枕葉','optic chiasm':'視交叉','optic tract':'視徑','orbital gyrus':'眶回',
 'parahippocampal gyrus':'海馬旁回','postcentral gyrus':'中央後回','precentral gyrus':'中央前回','posterior commissure':'後連合','putamen':'殼核','septum of telencephalon':'端腦中隔','stria medullaris of thalamus':'視丘髓紋','stria terminalis':'終紋',
 'superior colliculus':'上丘','superior frontal gyrus':'額上回','superior parietal lobule':'頂上小葉','supramarginal gyrus':'緣上回','tentorium cerebelli':'小腦幕','thalamus':'視丘','tuber cinereum':'灰結節','white matter of cerebral hemisphere':'大腦半球白質',
 // lung lobes, serous membranes and female reproductive organs (side is added in front)
 'upper lobe of lung':'肺上葉','middle lobe of lung':'肺中葉','lower lobe of lung':'肺下葉',
 'visceral pleura':'臟層胸膜','parietal pleura':'壁層胸膜','fibrous pericardium':'纖維心包','visceral layer of serous pericardium':'漿膜心包臟層（心外膜）','parietal layer of serous pericardium':'漿膜心包壁層',
 'vagina':'陰道','cervicovaginal junction':'子宮頸陰道交界','ampulla of uterine tube':'輸卵管壺腹','isthmus of uterine tube':'輸卵管峽部','fimbriae of uterine tube':'輸卵管繖','infundibulum of uterine tube':'輸卵管漏斗',
 'round ligament of uterus':'子宮圓韌帶','uterosacral ligament':'子宮薦韌帶','cardinal ligament of uterus':'子宮主韌帶','suspensory ligament of ovary':'卵巢懸韌帶','ovarian ligament':'卵巢韌帶','broad ligament of uterus':'子宮闊韌帶','mesovarium':'卵巢繫膜',
 'ovary':'卵巢','body of uterus':'子宮體','fundus of uterus':'子宮底','lower uterine segment':'子宮下段','cervix of uterus':'子宮頸','uterine artery':'子宮動脈','uterine vein':'子宮靜脈',
 'interventricular foramen':'室間孔（Monro 孔）','cavity of atrium':'心房腔','cavity of ventricle':'心室腔','wall of atrium':'心房壁','wall of ventricle':'心室壁',
 // heart valves, vessels with fixed names
 'anterior cusp of aortic valve':'主動脈瓣前尖','posterior cusp of aortic valve':'主動脈瓣後尖','anterior cusp of pulmonary valve':'肺動脈瓣前尖','posterior cusp of pulmonary valve':'肺動脈瓣後尖',
 'anterior leaflet of mitral valve':'二尖瓣前葉','posterior leaflet of mitral valve':'二尖瓣後葉','anterior leaflet of tricuspid valve':'三尖瓣前葉','posterior leaflet of tricuspid valve':'三尖瓣後葉','septal leaflet of tricuspid valve':'三尖瓣隔葉',
 'atrium':'心房','ventricle':'心室','inferior papillary muscle of ventricle':'下乳突肌','inferior leaflet of atrioventricular valve':'房室瓣下葉','septal leaflet of atrioventricular valve':'房室瓣隔葉','posterior leaflet of atrioventricular valve':'房室瓣後葉',
 'coronary leaflet of aortic valve':'主動脈瓣冠狀瓣','non-coronary leaflet of aortic valve':'主動脈瓣無冠瓣','anterior semilunar cusp of pulmonary valve':'肺動脈瓣前半月瓣','semilunar cusp of pulmonary valve':'肺動脈瓣半月瓣',
 'inferolateral branch of coronary artery':'冠狀動脈下外側支','circumflex artery':'迴旋支','inferior vein of ventricle':'心室下靜脈','aortic arch':'主動脈弓','bifurcation of pulmonary trunk':'肺動脈幹分叉',
 'suboccipital nerve':'枕下神經','greater occipital nerve':'枕大神經','third occipital nerve':'第三枕神經','lesser occipital nerve':'枕小神經','great auricular nerve':'耳大神經','suboccipital venous plexus':'枕下靜脈叢',
 'coronary sinus':'冠狀竇','celiac trunk':'腹腔動脈幹','celiac artery':'腹腔動脈幹','basilar artery':'基底動脈','anterior communicating artery':'前交通動脈','common hepatic artery':'總肝動脈','hepatic artery proper':'固有肝動脈',
 'inferior mesenteric artery':'下腸繫膜動脈','ileocolic artery':'迴結腸動脈','ileal artery':'迴腸動脈','appendicular artery':'闌尾動脈','anterior cecal artery':'盲腸前動脈','lumbar artery':'腰動脈','marginal colic artery':'結腸邊緣動脈','marginal artery of colon':'結腸邊緣動脈',
 'anterior inferior cerebellar artery':'小腦前下動脈','anterior inferior pancreaticoduodenal artery':'胰十二指腸前下動脈','anterior superior pancreaticoduodenal artery':'胰十二指腸前上動脈','inferior pancreaticoduodenal artery':'胰十二指腸下動脈',
 'dorsal pancreatic artery':'胰背動脈','great pancreatic artery':'胰大動脈','inferior pancreatic artery':'胰下動脈','caudal pancreatic artery':'胰尾動脈',
 'hepatic portal vein':'肝門靜脈','pre-hepatic portal vein':'肝前門靜脈','middle hepatic vein':'中肝靜脈','splenic vein':'脾靜脈','superior mesenteric vein':'上腸繫膜靜脈','inferior mesenteric vein':'下腸繫膜靜脈','ileocolic vein':'迴結腸靜脈','ileal vein':'迴腸靜脈',
 'middle colic vein':'中結腸靜脈','sigmoid vein':'乙狀結腸靜脈','superior rectal vein':'直腸上靜脈','pancreaticoduodenal vein':'胰十二指腸靜脈','gastric vein':'胃靜脈','gastroepiploic vein':'胃網膜靜脈','colic vein':'結腸靜脈','lumbar vein':'腰靜脈',
 'inferior phrenic vein':'膈下靜脈','superior phrenic vein':'膈上靜脈','median sacral vein':'薦正中靜脈','dorsal metacarpal vein':'掌背靜脈','deep dorsal vein of penis':'陰莖背深靜脈','superficial dorsal vein of penis':'陰莖背淺靜脈',
 'great cardiac vein':'心大靜脈','middle cardiac vein':'心中靜脈','small cardiac vein':'心小靜脈','anterior cardiac vein':'心前靜脈','anterior interventricular vein':'前室間靜脈','posterior vein of ventricle':'心室後靜脈',
 'inferior lingular artery':'下舌動脈','superior lingular vein':'上舌靜脈','inferior lingular vein':'下舌靜脈'
};

const ORD:Record<string,string>={first:'第一',second:'第二',third:'第三',fourth:'第四',fifth:'第五',sixth:'第六',seventh:'第七',eighth:'第八',ninth:'第九',tenth:'第十',eleventh:'第十一',twelfth:'第十二'};
const REGION:Record<string,string>={cervical:'頸',thoracic:'胸',lumbar:'腰'};

/** Whole vessel names that are not composed from a parent. */
const VESSEL:Record<string,string>={
 'anterior cerebral artery':'大腦前動脈','anterior parietal artery':'頂前動脈','anterior spinal artery':'脊髓前動脈','anterior temporal artery':'顳前動脈','conus artery':'圓錐動脈','dorsal artery of penis':'陰莖背動脈',
 'gastric artery':'胃動脈','gastro-epiploic artery':'胃網膜動脈','iliolumbar vein':'髂腰靜脈','inferior epigastric artery':'腹壁下動脈','inferior epigastric vein':'腹壁下靜脈','inferior phrenic artery':'膈下動脈',
 'inferior suprarenal artery':'腎上腺下動脈','inferior thyroid artery':'甲狀腺下動脈','internal carotid artery':'內頸動脈','internal jugular vein':'內頸靜脈','internal pudendal vein':'陰部內靜脈',
 'lateral frontobasal artery':'外側額底動脈','lateral sacral vein':'薦外側靜脈','lateral thoracic vein':'胸外側靜脈','marginal vein':'邊緣靜脈','medial frontobasal artery':'內側額底動脈','medial occipital artery':'枕內側動脈',
 'middle colic artery':'中結腸動脈','middle suprarenal artery':'腎上腺中動脈','ophthalmic artery':'眼動脈','pericallosal artery':'胼胝體周動脈','polar temporal artery':'顳極動脈','posterior cecal artery':'盲腸後動脈',
 'posterior inferior cerebellar artery':'小腦後下動脈','posterior inferior pancreaticoduodenal artery':'胰十二指腸後下動脈','posterior superior pancreaticoduodenal artery':'胰十二指腸後上動脈','posterior medial choroidal artery':'脈絡叢後內側動脈',
 'posterior parietal artery':'頂後動脈','prefrontal artery':'前額動脈','renal vein':'腎靜脈','sigmoid artery':'乙狀結腸動脈','splenial artery':'胼胝體壓部動脈','splenic artery':'脾動脈','superficial epigastric artery':'腹壁淺動脈',
 'superficial epigastric vein':'腹壁淺靜脈','superior epigastric artery':'腹壁上動脈','superior epigastric vein':'腹壁上靜脈','superior lingular artery':'上舌動脈','superior mesenteric artery':'上腸繫膜動脈','superior rectal artery':'直腸上動脈',
 'suprarenal vein':'腎上腺靜脈','testicular artery':'睪丸動脈','testicular vein':'睪丸靜脈','thalamogeniculate artery':'視丘膝狀體動脈','thalamoperforating artery':'視丘穿通動脈','first posterior intercostal artery':'第一後肋間動脈',
 'second posterior intercostal artery':'第二後肋間動脈','trunk of gastroduodenal artery':'胃十二指腸動脈幹','tributary of middle hepatic vein':'中肝靜脈屬支',
 // parents used by composed names
 'middle cerebral artery':'大腦中動脈','posterior cerebral artery':'大腦後動脈','posterior communicating artery':'後交通動脈','anterior choroidal artery':'脈絡叢前動脈','lateral occipital artery':'外側枕動脈','callosomarginal artery':'胼胝體邊緣動脈',
 'coronary artery':'冠狀動脈','anterior interventricular branch of coronary artery':'冠狀動脈前室間支','anterior interventricular artery':'前室間動脈','posterior interventricular artery':'後室間動脈','renal artery':'腎動脈','hepatic artery':'肝動脈',
 'portal vein':'門靜脈','hepatic vein':'肝靜脈','middle hepatic vein':'中肝靜脈','hepatic biliary tree':'肝內膽管樹','superior cerebellar artery':'小腦上動脈','pontine artery':'橋腦動脈','colic artery':'結腸動脈','arch of aorta':'主動脈弓',
 'thoracic aorta':'胸主動脈','posterior tibial artery':'脛後動脈','pericallosal artery ':'胼胝體周動脈','inferior branch of ileocolic artery':'迴結腸動脈下支','medial branch of superior cerebellar artery':'小腦上動脈內側支',
 'inferior terminal branch of middle cerebral artery':'大腦中動脈下終支','angular gyrus':'角回','posterior limb of internal capsule':'內囊後肢','central sulcus':'中央溝','postcentral sulcus':'中央後溝','precentral sulcus':'中央前溝',
 'anterior descending branch of coronary artery':'冠狀動脈前降支','ileocolic artery ':'迴結腸動脈','gastroduodenal artery':'胃十二指腸動脈','superior mesenteric artery ':'上腸繫膜動脈'
};
const W:Record<string,string>={anterior:'前',posterior:'後',superior:'上',inferior:'下',medial:'內側',lateral:'外側',apical:'尖',basal:'底',middle:'中',accessory:'副',subsuperior:'次上',intermediomedial:'中內',
 laterobasal:'外底',mediobasal:'內底',anterolateral:'前外側',posteromedial:'後內側',central:'中央',lingular:'舌',septal:'隔',diagonal:'斜',marginal:'邊緣',descending:'降',ascending:'升',insular:'島',temporal:'顳',
 conus:'圓錐',ileal:'迴腸',bronchial:'支氣管',caudate:'尾狀葉',lobe:'葉',ventricular:'心室',circumflex:'迴旋',interventricular:'室間',segmental:'段',first:'第一',second:'第二',third:'第三',sphenoid:'蝶',precommunicating:'交通前',
 postcommunicating:'交通後',hypothalamic:'下視丘',paracentral:'中央旁',precuneal:'楔前葉',vermian:'小腦蚓',polar:'極',sphenoidal:'蝶',ureteric:'輸尿管',calcaneal:'跟',oesophageal:'食道',frontobasal:'額底',
 'temporo-occipital':'顳枕',dorsal:'背側',cecal:'盲腸',lateral_:'外側'};
const SUFFIX:Record<string,string>={branch:'支',branches:'支',part:'部',division:'分支',tributary:'屬支',trunk:'幹',segment:'段'};

const mods=(s:string)=>{const out=[];for(const w of s.trim().split(/\s+/)){if(!w)continue;if(!W[w])return undefined;out.push(W[w]);}return out.join('');};
const nounPhrase=(s:string):string|undefined=>{
 const t=s.trim();if(VESSEL[t])return VESSEL[t];
 let m=/^(.*)segmental (artery|vein|bronchial tree)$/.exec(t);
 if(m){const a=mods(m[1]);if(a!==undefined)return a+'段'+({artery:'動脈',vein:'靜脈','bronchial tree':'支氣管樹'}[m[2]] as string);}
 m=/^(.*)segmental hepatic artery$/.exec(t);
 if(m){const a=mods(m[1]);if(a!==undefined)return'肝'+a+'段動脈';}
 return undefined;
};
const compose=(s:string,depth=0):string|undefined=>{
 const np=nounPhrase(s);if(np)return np;
 if(depth>4)return undefined;
 const to=/^branch of (.+?) to (.+)$/.exec(s);
 if(to){const a=compose(to[1],depth+1),b=compose(to[2],depth+1);return a&&b?`${a}至${b}之分支`:undefined;}
 const art=/^artery of (.+) sulcus$/.exec(s);
 if(art){const g=VESSEL[art[1]+' sulcus'];return g?g.replace(/溝$/,'溝動脈'):undefined;}
 const bareRel=/^(?:set of )?(trunk) of (.+)$/.exec(s);
 if(bareRel){const parent=compose(bareRel[2],depth+1);return parent?parent+'幹':undefined;}
 const rel=/^(?:set of )?(?:(.*?) )?(branches|branch|part|division|tributary|trunk|segment) of (.+)$/.exec(s);
 if(rel){
  const parent=compose(rel[3],depth+1);if(!parent)return undefined;
  const ord=rel[1]?.match(/^(first|second|third) (.*)$/);
  const head=rel[1]?(ord?ORD[ord[1]]+(mods(ord[2])??''):mods(rel[1])):'';
  if(head===undefined)return undefined;
  return parent+head+SUFFIX[rel[2]];
 }
 return undefined;
};

export function zhExtra(n:string):ZhName|undefined{
 const key=n.replace(/\s+/g,' ').trim();
 if(EXACT[key])return{zh:EXACT[key]};
 const disc=/^intervertebral disk of (first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) (cervical|thoracic|lumbar) vertebra$/.exec(key);
 if(disc)return{zh:`${ORD[disc[1]]}${REGION[disc[2]]}椎椎間盤`,check:'椎間盤命名：以其所屬椎體命名（臺灣另有「第N與N+1椎間盤」寫法）'};
 const hv=/^hepatovenous segment ([ivx]+)$/.exec(key);
 if(hv)return{zh:`肝第 ${hv[1].toUpperCase()} 段`,check:'肝段命名（Couinaud 分段；來源名 hepatovenous segment）'};
 if(VESSEL[key])return{zh:VESSEL[key],check:'血管名稱'};
 const tree=/^(.*) tributary of hepatic biliary tree$/.exec(key);
 if(tree){const a=mods(tree[1].replace(/^caudate lobe$/,'caudate'));if(a!==undefined)return{zh:'肝內膽管樹'+a+'屬支',check:'組合詞（肝段膽管）'};}
 const composed=compose(key);
 return composed?{zh:composed,check:'組合詞（臟器段血管）'}:zhExtra2(key);
}
