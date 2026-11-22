/** Cranial nerves animation: the twelve pairs (where each leaves the brain, which opening of the skull it passes, what it supplies, one line of function, an exam tip), which meshes of
 *  the site draw them, and the pure state machine. Nothing here touches the DOM or three.js, so the node tests can check it directly (scripts/test-cranial-nerves.mjs).
 *  Chinese names follow the head-and-neck required list (外旋神經, 前庭耳蝸神經, 顏面神經 …). */

export type NerveKind = 'sensory' | 'motor' | 'mixed';
export const KIND_ZH: Record<NerveKind, string> = {sensory: '感覺', motor: '運動', mixed: '混合'};

export interface Opening {
  en: string; zh: string;
  /** names of the opening as marked on the skull (paokao package, #433), without Left/Right; null when the site has no mark (drawn as a schematic point) */
  mark: string | null;
}
export interface Target {en: string; zh: string; /** atlas or facial-package mesh names, without Left/Right (empty: text only) */ meshes: string[]}
export interface CranialNerve {
  n: number; roman: string; id: string;
  en: string; zh: string; kind: NerveKind;
  /** where it leaves the brain */
  from: {en: string; zh: string};
  openings: Opening[];
  targets: Target[];
  /** one sentence of what it does */
  fn: string;
  points: string[];
  tip: string;
  /** meshes of the nerve stream (public/models/nerve-stream.json) that draw it, matched without the side suffix */
  meshes: RegExp;
}

const O = (en: string, zh: string, mark: string | null = en): Opening => ({en, zh, mark});
const G = (en: string, zh: string, meshes: string[] = []): Target => ({en, zh, meshes});

export const CRANIAL_NERVES: readonly CranialNerve[] = [
  {n: 1, roman: 'I', id: 'olfactory', en: 'Olfactory nerve', zh: '嗅神經', kind: 'sensory',
    from: {en: 'Olfactory bulb (forebrain)', zh: '嗅球（前腦）'},
    openings: [O('Cribriform plate of the ethmoid', '篩骨篩板', null)],
    targets: [G('Olfactory mucosa of the nasal roof', '鼻腔頂部的嗅覺黏膜')],
    fn: '把鼻腔頂部嗅覺細胞的訊號傳到嗅球，負責嗅覺。',
    points: ['嗅覺受器細胞的軸突約二十束，穿過篩板的小孔，終止於嗅球。', '是唯一不經過視丘、直接到達大腦皮質（嗅皮質）的感覺路徑。'],
    tip: '篩板骨折可撕斷嗅神經 → 嗅覺喪失，並可出現腦脊髓液鼻漏。',
    meshes: /^Olfactory nerve \(I\)$/},
  {n: 2, roman: 'II', id: 'optic', en: 'Optic nerve', zh: '視神經', kind: 'sensory',
    from: {en: 'Optic chiasm (diencephalon)', zh: '視交叉（間腦）'},
    openings: [O('Optic canal', '視神經管')],
    targets: [G('Retina', '視網膜', ['sclera'])],
    fn: '把視網膜的訊號經視交叉、視徑送到外側膝狀體，負責視覺。',
    points: ['由視網膜神經節細胞的軸突組成，被腦膜包覆，眼動脈與它一起穿過視神經管。', '在視交叉，鼻側半視網膜的纖維交叉到對側。'],
    tip: '腦下垂體腫瘤由下方壓迫視交叉的交叉纖維 → 雙顳側偏盲。',
    meshes: /^Optic nerve \(II\)$/},
  {n: 3, roman: 'III', id: 'oculomotor', en: 'Oculomotor nerve', zh: '動眼神經', kind: 'motor',
    from: {en: 'Midbrain, interpeduncular fossa', zh: '中腦（腳間窩）'},
    openings: [O('Superior orbital fissure', '上眶裂')],
    targets: [G('Levator palpebrae superioris', '提上眼瞼肌', ['levator palpebrae superioris']), G('Superior, inferior and medial rectus', '上直肌、下直肌、內直肌', ['superior rectus', 'inferior rectus', 'medial rectus']), G('Inferior oblique', '下斜肌', ['inferior oblique']), G('Sphincter pupillae and ciliary muscle (parasympathetic)', '瞳孔括約肌與睫狀肌（副交感）')],
    fn: '支配大部分眼外肌與提上眼瞼肌，並經睫狀神經節收縮瞳孔、調節水晶體。',
    points: ['離開中腦後在後大腦動脈與上小腦動脈之間前行，經海綿竇外側壁進入眼眶。', '副交感纖維（動眼神經副核）在睫狀神經節換元。'],
    tip: '受損 → 眼球朝「下、外」、眼瞼下垂、瞳孔放大；後交通支動脈瘤常先壓迫外圍的副交感纖維，瞳孔先放大。',
    meshes: /^Oculomotor nerve \(III\)$/},
  {n: 4, roman: 'IV', id: 'trochlear', en: 'Trochlear nerve', zh: '滑車神經', kind: 'motor',
    from: {en: 'Dorsal midbrain, below the inferior colliculus', zh: '中腦背側（下丘下方）'},
    openings: [O('Superior orbital fissure', '上眶裂')],
    targets: [G('Superior oblique', '上斜肌', ['superior oblique'])],
    fn: '支配上斜肌，使眼球內收時向下看。',
    points: ['唯一由腦幹背側離開、而且纖維全部交叉的腦神經；顱內行程最長、最細。', '經海綿竇外側壁，於總腱環外側穿過上眶裂。'],
    tip: '受損 → 向下看（下樓梯、看書）時垂直複視，頭常向健側傾斜代償。',
    meshes: /^Trochlear nerve \(IV\)$/},
  {n: 5, roman: 'V', id: 'trigeminal', en: 'Trigeminal nerve', zh: '三叉神經', kind: 'mixed',
    from: {en: 'Lateral pons', zh: '橋腦外側'},
    openings: [O('Superior orbital fissure (V1)', '上眶裂（眼神經 V1）', 'Superior orbital fissure'), O('Foramen rotundum (V2)', '圓孔（上頜神經 V2）', 'Foramen rotundum'), O('Foramen ovale (V3)', '卵圓孔（下頜神經 V3）', 'Foramen ovale')],
    targets: [G('Masseter and temporalis', '咬肌與顳肌', ['superficial part of masseter', 'deep part of masseter', 'temporalis']), G('Medial and lateral pterygoid', '翼內肌與翼外肌', ['medial pterygoid', 'upper head of lateral pterygoid', 'lower head of lateral pterygoid']), G('Skin of the face, teeth, nasal and oral cavities (sensory)', '臉部皮膚、牙齒、鼻腔與口腔（感覺）')],
    fn: '臉部、角膜、口鼻腔的主要感覺神經；下頜神經支配咀嚼肌。',
    points: ['感覺神經節（三叉神經節）位於顳骨岩部尖端的凹陷。', '分三支：眼神經 V1（感覺）、上頜神經 V2（感覺）、下頜神經 V3（感覺加運動）。', 'V3 的運動纖維也支配下頜舌骨肌、二腹肌前腹、鼓膜張肌與張顎帆肌。'],
    tip: '角膜反射：傳入為 V1、傳出為 VII；下頜神經受損 → 張口時下頜偏向患側。',
    meshes: /^(Trigeminal nerve \(V\)|Sensory root of trigeminal nerve|Motor root of trigeminal nerve|Ophthalmic nerve|Maxillary nerve|Anterior division of mandibular nerve|Posterior division of mandibular nerve|Inferior alveolar nerve|Lingual nerve|Buccal nerve|Mental nerve)$/},
  {n: 6, roman: 'VI', id: 'abducens', en: 'Abducens nerve', zh: '外旋神經', kind: 'motor',
    from: {en: 'Pontomedullary junction', zh: '橋腦延腦交界'},
    openings: [O('Superior orbital fissure', '上眶裂')],
    targets: [G('Lateral rectus', '外直肌', ['lateral rectus'])],
    fn: '支配外直肌，使眼球向外轉。',
    points: ['沿斜坡上行，越過顳骨岩部尖端，在海綿竇內緊貼內頸動脈前行。', '在總腱環內穿過上眶裂。'],
    tip: '行程長、貼著斜坡，顱內壓升高時常最先受影響 → 患眼不能外展、看向患側時水平複視。',
    meshes: /^Abducens nerve \(VI\)$/},
  {n: 7, roman: 'VII', id: 'facial', en: 'Facial nerve', zh: '顏面神經', kind: 'mixed',
    from: {en: 'Pontomedullary junction (cerebellopontine angle)', zh: '橋腦延腦交界（橋小腦角）'},
    openings: [O('Internal acoustic meatus', '內聽道'), O('Stylomastoid foramen', '莖乳突孔')],
    targets: [G('Muscles of facial expression', '表情肌', ['palpebral part of orbicularis oculi', 'orbital part of orbicularis oculi', 'zygomaticus major', 'zygomaticus minor', 'buccinator', 'nasalis']), G('Posterior belly of digastric, stylohyoid, stapedius', '二腹肌後腹、莖突舌骨肌、鐙骨肌', ['stylohyoid']), G('Taste of the anterior two-thirds of the tongue; lacrimal, submandibular and sublingual glands', '舌前三分之二味覺；淚腺、頜下腺、舌下腺', ['lacrimal gland', 'submandibular gland'])],
    fn: '支配表情肌；鼓索神經傳舌前三分之二味覺並支配頜下腺、舌下腺；岩大神經支配淚腺。',
    points: ['與前庭耳蝸神經一起進入內聽道，在顏面神經管內轉彎（膝神經節），由莖乳突孔出顱。', '出顱後穿過腮腺，分成顳支、顴支、頰支、下頜緣支、頸支。'],
    tip: '周邊性麻痺（貝爾麻痺）→ 同側整半臉無力（包括額頭）；中樞性病灶只影響對側下半臉，額頭保留。',
    meshes: /^Facial nerve \(VII\)$/},
  {n: 8, roman: 'VIII', id: 'vestibulocochlear', en: 'Vestibulocochlear nerve', zh: '前庭耳蝸神經', kind: 'sensory',
    from: {en: 'Pontomedullary junction (cerebellopontine angle)', zh: '橋腦延腦交界（橋小腦角）'},
    openings: [O('Internal acoustic meatus', '內聽道')],
    targets: [G('Cochlea (hearing) and vestibular apparatus (balance)', '耳蝸（聽覺）與前庭器（平衡）')],
    fn: '耳蝸神經傳聽覺，前庭神經傳頭部位置與加速度（平衡）。',
    points: ['不離開顱骨：經內聽道進入顳骨岩部，到達內耳。', '耳部詳細模式有內耳與聽覺傳導的動畫。'],
    tip: '前庭神經鞘瘤（橋小腦角）→ 單側感覺神經性聽力喪失、耳鳴、平衡不穩，變大時可壓迫 VII 與 V。',
    meshes: /^(Vestibulocochlear nerve \(VIII\)|Vestibular nerve|Cochlear nerve)$/},
  {n: 9, roman: 'IX', id: 'glossopharyngeal', en: 'Glossopharyngeal nerve', zh: '舌咽神經', kind: 'mixed',
    from: {en: 'Medulla, behind the olive', zh: '延腦（橄欖後溝）'},
    openings: [O('Jugular foramen', '頸靜脈孔')],
    targets: [G('Stylopharyngeus', '莖突咽肌', ['stylopharyngeus']), G('Posterior third of the tongue, pharynx, carotid sinus and body (sensory)', '舌後三分之一、咽部、頸動脈竇與頸動脈體（感覺）'), G('Parotid gland (via otic ganglion)', '腮腺（經耳神經節）')],
    fn: '舌後三分之一的味覺與一般感覺、咽部感覺；支配莖突咽肌；經耳神經節支配腮腺。',
    points: ['與迷走神經、副神經一起經頸靜脈孔出顱。', '頸動脈竇支把血壓與血氧的訊號傳回延腦。'],
    tip: '嘔吐反射：傳入為 IX、傳出為 X。',
    meshes: /^Glossopharyngeal nerve \(IX\)$/},
  {n: 10, roman: 'X', id: 'vagus', en: 'Vagus nerve', zh: '迷走神經', kind: 'mixed',
    from: {en: 'Medulla, behind the olive', zh: '延腦（橄欖後溝）'},
    openings: [O('Jugular foramen', '頸靜脈孔')],
    targets: [G('Pharyngeal constrictors and soft palate', '咽縮肌與軟顎肌肉', ['superior pharyngeal constrictor', 'middle pharyngeal constrictor', 'inferior pharyngeal constrictor']), G('Muscles of the larynx', '喉部肌肉', ['thyro-arytenoid', 'oblique part of cricothyroid', 'straight part of cricothyroid']), G('Heart, lungs and gut to the left colic flexure (parasympathetic)', '心、肺與消化道（到結腸左曲，副交感）')],
    fn: '支配咽、軟顎（張顎帆肌除外）與喉部肌肉，並把副交感纖維送到胸腹內臟。',
    points: ['在頸動脈鞘內下行，位於內頸靜脈與頸動脈之間的後方。', '喉上神經的外支支配環甲肌；喉返神經支配其餘喉內肌，右側繞鎖骨下動脈、左側繞主動脈弓。'],
    tip: '單側受損 → 懸壅垂偏向健側、聲音沙啞；喉返神經受損（甲狀腺手術）→ 聲帶麻痺。',
    meshes: /^Vagus nerve \(X\)$/},
  {n: 11, roman: 'XI', id: 'accessory', en: 'Accessory nerve', zh: '副神經', kind: 'motor',
    from: {en: 'Upper cervical spinal cord (C1–C5), entering through the foramen magnum', zh: '上段頸髓（C1–C5），經枕骨大孔入顱'},
    openings: [O('Foramen magnum (in)', '枕骨大孔（入顱）', 'Foramen magnum'), O('Jugular foramen (out)', '頸靜脈孔（出顱）', 'Jugular foramen')],
    targets: [G('Sternocleidomastoid', '胸鎖乳突肌', ['sternocleidomastoid']), G('Trapezius', '斜方肌', ['descending part of trapezius', 'transverse part of trapezius', 'ascending part of trapezius'])],
    fn: '支配胸鎖乳突肌與斜方肌：轉頭、聳肩。',
    points: ['脊髓根由頸髓上行，經枕骨大孔入顱，再與舌咽、迷走神經一起由頸靜脈孔出顱。', '斜越頸後三角，位置表淺。'],
    tip: '頸後三角手術或淋巴結切片易傷 → 聳肩無力、肩胛下垂；胸鎖乳突肌無力 → 頭難轉向對側。',
    meshes: /^Accessory nerve \(XI\)$/},
  {n: 12, roman: 'XII', id: 'hypoglossal', en: 'Hypoglossal nerve', zh: '舌下神經', kind: 'motor',
    from: {en: 'Medulla, between the pyramid and the olive', zh: '延腦（錐體與橄欖之間）'},
    openings: [O('Hypoglossal canal', '舌下神經管')],
    targets: [G('Intrinsic and extrinsic muscles of the tongue', '舌內肌與舌外肌', ['genioglossus', 'hyoglossus'])],
    fn: '支配所有舌內肌與舌外肌（顎舌肌除外，由迷走神經支配）。',
    points: ['經舌下神經管出顱，在內頸動脈與內頸靜脈之間下行，於舌骨大角上方向前進入舌。'],
    tip: '受損 → 伸舌時舌尖偏向患側（患側頦舌肌無力）。',
    meshes: /^Hypoglossal nerve \(XII\)$/},
];
export const NERVE_COUNT = CRANIAL_NERVES.length;
export const CN_NOTE = '神經走向與出顱孔取自網站現有模型；光點表示神經訊號由腦幹向外（運動）或向內（感覺）的方向，為示意。嗅神經的篩板沒有骨面標示，以示意點標出。';

/** Brainstem level of each nerve, for the overview. */
export const LEVELS: readonly {en: string; zh: string; nerves: number[]}[] = [
  {en: 'Forebrain', zh: '前腦', nerves: [1, 2]},
  {en: 'Midbrain', zh: '中腦', nerves: [3, 4]},
  {en: 'Pons', zh: '橋腦', nerves: [5, 6, 7, 8]},
  {en: 'Medulla', zh: '延腦', nerves: [9, 10, 11, 12]},
];

/** Direction of the moving light along a nerve: outward for motor, inward for sensory, both for mixed. */
export const flowDirection = (k: NerveKind): ('out' | 'in')[] => k === 'motor' ? ['out'] : k === 'sensory' ? ['in'] : ['out', 'in'];
/** Brightness of the moving band at distance `d` (metres) from the brainstem at time `t` (s): a band that runs along the nerve at `speed` m/s and repeats every `period` metres. */
export function bandAt(d: number, t: number, dir: 'out' | 'in', speed = .05, period = .06, width = .008) {
  const phase = dir === 'out' ? d - speed * t : d + speed * t, u = ((phase % period) + period) % period;
  const x = Math.min(u, period - u);
  return Math.exp(-(x * x) / (width * width));
}

// ---- state machine: step 0 is the overview, steps 1–12 are the nerves ---------------------------------------------

export interface PlayState {step: number; t: number; dwell: number; playing: boolean; auto: boolean}
export const STEP_COUNT = NERVE_COUNT + 1, AUTO_DWELL_S = 10;
export const SPEED_SLIDER = {min: .3, max: 2, step: .1, initial: 1};
export const initialPlay = (reducedMotion = false): PlayState => ({step: 0, t: 0, dwell: 0, playing: !reducedMotion, auto: false});
export const wrapStep = (i: number) => ((i % STEP_COUNT) + STEP_COUNT) % STEP_COUNT;
export const goTo = (s: PlayState, step: number): PlayState => ({...s, step: wrapStep(step), dwell: 0});
export const stepBy = (s: PlayState, delta: number): PlayState => goTo(s, s.step + delta);
export function advance(s: PlayState, dt: number, speed: number): PlayState {
  if (!s.playing) return s;
  const next = {...s, t: s.t + dt * speed, dwell: s.dwell + dt};
  return s.auto && next.dwell > AUTO_DWELL_S ? goTo(next, s.step + 1) : next;
}
