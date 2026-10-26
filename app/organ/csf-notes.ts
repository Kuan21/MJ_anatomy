/** Lecture text for each CSF step, condensed from docs/neuro-notes.json (csf_flow and the csf_meninges entries). Nothing here is added from outside the notes;
 *  where the notes contradict the textbook the correction recorded in the notes' _meta is shown instead. */
export interface CsfNote {text: string; src: string}
export interface CsfStepNotes {
  /** Where along the brain or cord the step happens. */
  where: string;
  /** What happens to the CSF here: made, passed on, leaves the ventricles, absorbed. */
  event: '產生' | '經過' | '離開腦室' | '流動' | '吸收';
  happens: CsfNote[];
  clinical: CsfNote[];
  correction?: CsfNote;
}

/** Short labels for the step list (the full names stay in the detail heading). */
export const CSF_SHORT: [string, string][] = [['Choroid plexus', '脈絡叢'], ['Lateral ventricle → foramen of Monro', '側腦室 → 室間孔'], ['Third ventricle', '第三腦室'], ['Cerebral aqueduct', '大腦導水管'], ['Fourth ventricle', '第四腦室'], ['Median & lateral apertures', '正中孔、外側孔'], ['Subarachnoid space, lumbar cistern', '蛛網膜下腔、腰池'], ['Arachnoid granulations → sagittal sinus', '蛛網膜顆粒 → 上矢狀竇']];

export const CSF_STEP_NOTES: CsfStepNotes[] = [
  {
    where: '腦室壁背側面；以側腦室最多，第三、第四腦室亦有（第四腦室最少）',
    event: '產生',
    happens: [
      {text: '脈絡叢（Choroid plexus）位於腦室的背側面，為 CSF 最主要的製造場所。', src: '0218 p.11'},
      {text: '側腦室具有較多脈絡叢；第四腦室具有最少脈絡叢。', src: '0218 p.10'},
      {text: '側腦室下角脈絡叢的血液來自前脈絡動脈（內頸動脈分支）及後脈絡動脈（後大腦動脈分支）。', src: '0311 p.11'},
    ],
    clinical: [],
    correction: {text: '0311 筆記寫脈絡叢只存在於側腦室體部和下角；0218、0324 及課本指第三、第四腦室亦有，以課本為準。', src: '共筆校正'},
  },
  {
    where: '端腦深部，視丘旁側（海馬迴、基底核內側面）',
    event: '經過',
    happens: [
      {text: '側腦室位於視丘旁側，海馬迴、基底核內側面，又稱第一、二腦室。', src: '0218 p.10'},
      {text: '流向：側腦室 → 室間孔（Interventricular foramen）→ 第三腦室。', src: '0218 p.11；0305 p.7'},
    ],
    clinical: [],
  },
  {
    where: '間腦；夾在兩側視丘之間',
    event: '經過',
    happens: [
      {text: '側腦室向下延續至視丘邊緣處，左右視丘由視丘聯合相連，使第三腦室呈環圈狀。', src: '0218 p.10'},
      {text: '第三腦室夾在丘腦（Thalamus）之間，經大腦導水管連接第四腦室。', src: '0305 p.7'},
    ],
    clinical: [],
  },
  {
    where: '中腦高度；頂蓋與背蓋之間',
    event: '經過',
    happens: [
      {text: '第三腦室向後延伸，經狹窄的中腦中央段、頂蓋與背蓋之間，此處為中腦導水管（大腦導水管）。', src: '0218 p.10'},
      {text: '大腦導水管對應到中腦高度，連接第三與第四腦室。', src: '0305 p.7'},
    ],
    clinical: [],
  },
  {
    where: '橋腦、延腦高度；菱形窩，背側有上髓帆',
    event: '經過',
    happens: [
      {text: '導水管往下延續至橋腦、延腦腹側面，即第四腦室；此處為菱形窩，對應橋腦、延腦高度。', src: '0218 p.10；0305 p.7'},
      {text: '第四腦室背側為上髓帆（Superior medullary velum），後方為小腦。', src: '0305 p.18；0324 p.4'},
      {text: '第四腦室向下延伸到脊髓變成中央管；青春期之後中央管通常會鈣化，有些就會不通。', src: '0305 p.7'},
    ],
    clinical: [],
  },
  {
    where: '第四腦室出口 → 小腦延髓池（小腦下方、延腦後方）',
    event: '離開腦室',
    happens: [
      {text: '第四腦室有三個孔：正中孔（Median aperture）×1、外側孔（Lateral aperture）×2，CSF 由此流至蜘蛛膜下腔。', src: '0305 p.7'},
      {text: 'CSF 由外側孔流至小腦延髓池（Cerebellomedullary cistern），再進入蜘蛛網膜下腔。', src: '0218 p.10'},
      {text: '另有少量進入脊髓中央管。', src: '0218 p.11；0305 p.7'},
    ],
    clinical: [],
    correction: {text: '0218 筆記寫 CSF 由中央管流至硬膜底端，再經終絲旁回流小腦延髓池；課本：中央管為盲端、常閉鎖，脊髓段 CSF 經蜘蛛膜下腔向下，以課本為準。', src: '共筆校正'},
  },
  {
    where: '蜘蛛膜下腔：向上流過大腦半球表面；向下沿脊髓至腰池（脊髓終於約 L1，圓錐至 S2 之間含馬尾、終絲）再回流',
    event: '流動',
    happens: [
      {text: '蜘蛛網膜下腔內含 CSF、12 對腦神經、大腦動靜脈；其外為蛛網膜，內側軟腦膜緊貼大腦並隨腦迴、腦溝延伸進去。', src: '0311 p.4'},
      {text: '成年人脊髓下端（圓錐）約在 L1，L1 以下主要是神經根組成的馬尾。', src: '0226 p.2'},
      {text: '腰池：圓錐至 S2，含馬尾與終絲。', src: '0305；Essential Neuroscience ch.3'},
    ],
    clinical: [
      {text: '抽腦脊髓液是從蜘蛛膜下腔（腰池）抽，並非由中央管抽。', src: '0305 p.7'},
      {text: '蜘蛛網膜下腔出血會造成瀰漫性出血，是最嚴重的一種。', src: '0311 p.4'},
    ],
  },
  {
    where: '大腦半球頂端、上矢狀竇旁',
    event: '吸收',
    happens: [
      {text: '蜘蛛網膜顆粒／絨毛像打幫浦一樣將 CSF 打進上矢狀竇，隨靜脈系統回到右心房。', src: '0218 p.11；0305 p.7'},
    ],
    clinical: [],
    correction: {text: '0218 筆記寫「背矢狀竇 Dorsal sagittal sinus」，人體應為上矢狀竇 Superior sagittal sinus。', src: '共筆校正'},
  },
];
