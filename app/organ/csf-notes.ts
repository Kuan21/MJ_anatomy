/** Explanatory text for each step of the CSF flow page, written for this site. */
export interface CsfStepNotes {
  /** Where along the brain or cord the step happens. */
  where: string;
  /** What happens to the CSF here: made, passed on, leaves the ventricles, absorbed. */
  event: '產生' | '經過' | '離開腦室' | '流動' | '吸收';
  happens: string[];
  clinical: string[];
}

/** Short labels for the step list (the full names stay in the detail heading). */
export const CSF_SHORT: [string, string][] = [['Choroid plexus', '脈絡叢'], ['Lateral ventricle → foramen of Monro', '側腦室 → 室間孔'], ['Third ventricle', '第三腦室'], ['Cerebral aqueduct', '大腦導水管'], ['Fourth ventricle', '第四腦室'], ['Median & lateral apertures', '正中孔、外側孔'], ['Subarachnoid space, lumbar cistern', '蛛網膜下腔、腰池'], ['Arachnoid granulations → sagittal sinus', '蛛網膜顆粒 → 上矢狀竇']];

export const CSF_STEP_NOTES: CsfStepNotes[] = [
  {
    where: '腦室壁；側腦室最多，第三、第四腦室也有，第四腦室的量最少',
    event: '產生',
    happens: [
      '脈絡叢（choroid plexus）是貼在腦室壁上的血管叢，外面覆著特化的室管膜細胞，是腦脊髓液最主要的製造處。',
      '側腦室的脈絡叢最發達，第三腦室頂部與第四腦室頂部也有，其中第四腦室的最少。',
      '側腦室下角的脈絡叢由前脈絡動脈（內頸動脈的分支）和後脈絡動脈（後大腦動脈的分支）供血。',
    ],
    clinical: [],
  },
  {
    where: '大腦深部，視丘外側，環繞著視丘和基底核',
    event: '經過',
    happens: [
      '兩側的側腦室位在視丘外側，形狀隨著海馬與基底核彎曲，傳統上稱為第一、第二腦室。',
      '腦脊髓液由側腦室經室間孔（foramen of Monro）流入第三腦室。',
    ],
    clinical: [],
  },
  {
    where: '間腦，夾在左右兩側視丘之間',
    event: '經過',
    happens: [
      '第三腦室是一道窄縫，兩側是視丘與下視丘；左右視丘常以視丘間黏合相連，腦脊髓液由它的周圍繞過。',
      '腦脊髓液由第三腦室向後下方，經大腦導水管流往第四腦室。',
    ],
    clinical: [],
  },
  {
    where: '中腦；位在頂蓋與被蓋之間',
    event: '經過',
    happens: [
      '大腦導水管（cerebral aqueduct）是穿過中腦的細窄管道，上接第三腦室、下連第四腦室。',
      '它的管徑很小，是整條腦室系統最容易被堵住的地方。',
    ],
    clinical: ['導水管狹窄或被腫瘤壓迫時，其上游的腦室會擴大，形成阻塞性水腦症。'],
  },
  {
    where: '橋腦與延腦的背側；底部是菱形窩，頂部連著小腦',
    event: '經過',
    happens: [
      '第四腦室位在橋腦、延腦與小腦之間，底部即菱形窩，頂部由上髓帆與下髓帆組成。',
      '第四腦室往下延續為脊髓的中央管；成人的中央管多半很細，部分節段會閉鎖。',
    ],
    clinical: [],
  },
  {
    where: '第四腦室的出口，通往小腦延髓池（小腦下方、延腦後方）',
    event: '離開腦室',
    happens: [
      '第四腦室有三個孔通往蛛網膜下腔：中線上的正中孔（Magendie 孔）一個，兩側的外側孔（Luschka 孔）各一個。',
      '腦脊髓液由這三個孔流出，首先進入小腦延髓池，之後散布到整個蛛網膜下腔。',
      '只有很少量的液體進入脊髓中央管。',
    ],
    clinical: ['這三個孔若因先天異常或發炎而閉塞，腦室內的液體流不出去，腦室會擴大，形成水腦症。'],
  },
  {
    where: '蛛網膜下腔：向上包住大腦半球表面，向下沿著脊髓一直到腰池',
    event: '流動',
    happens: [
      '蛛網膜下腔位在蛛網膜與軟腦膜之間，裡面有腦脊髓液、腦神經與腦部的動靜脈；軟腦膜緊貼腦表面，並隨著腦溝腦迴深入。',
      '成人的脊髓下端（脊髓圓錐）約在 L1 高度，其下由神經根形成馬尾。',
      '腰池是圓錐以下到第二薦椎之間的蛛網膜下腔，裡面是馬尾與終絲，沒有脊髓本體。',
    ],
    clinical: [
      '腰椎穿刺是從腰池抽取腦脊髓液，進針位置在 L3–L4 或 L4–L5，避開脊髓，也不是抽取中央管的液體。',
      '蛛網膜下腔出血時，血液會散布在整個腦池與腦溝，是最危險的顱內出血類型之一。',
    ],
  },
  {
    where: '大腦半球頂端，上矢狀竇的兩旁',
    event: '吸收',
    happens: [
      '蛛網膜顆粒（arachnoid granulations）是蛛網膜突入硬腦膜靜脈竇的絨毛狀構造，腦脊髓液依壓力差單向流入上矢狀竇。',
      '進入靜脈竇的液體隨著血液經內頸靜脈回到心臟的右心房，完成循環。',
    ],
    clinical: ['吸收受阻或靜脈竇壓力升高時，腦脊髓液會累積，可能造成交通性水腦症或顱內壓升高。'],
  },
];
