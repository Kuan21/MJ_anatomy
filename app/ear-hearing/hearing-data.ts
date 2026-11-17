/** Hearing animation of the ear detail mode: the six steps (text, key points, exam tip), the sliders and the pure state machine.
 *  Nothing here touches the DOM or three.js, so the node tests can check it directly (scripts/test-ear-hearing.mjs). */

export interface HearingStep {
  id: 'outer' | 'middle' | 'wave' | 'corti' | 'synapse' | 'pathway';
  en: string;
  zh: string;
  /** short label of the step button */
  short: string;
  points: string[];
  tip: {label: string; text: string};
}

export const HEARING_STEPS: readonly HearingStep[] = [
  {id: 'outer', en: 'Outer ear', zh: '外耳：收集聲波', short: '外耳',
    points: [
      '耳廓收集聲波，外耳道把聲波導向鼓膜；外耳道的共振使約 2–4 kHz 的聲音變大。',
      '聲波是空氣的壓力起伏，鼓膜跟著同一頻率來回振動。',
      '鼓膜外側面由耳顳神經（三叉神經下頜支）與迷走神經耳支支配；內側面由舌咽神經（鼓室神經叢）支配。',
    ],
    tip: {label: '考點', text: '鼓膜分三層：外層皮膚、中層纖維、內層黏膜；錘骨柄附著處形成鼓膜臍（umbo）。'}},
  {id: 'middle', en: 'Middle ear', zh: '中耳：聽小骨放大壓力', short: '中耳',
    points: [
      '鼓膜 → 錘骨 → 砧骨 → 鐙骨，鐙骨底板像活塞一樣推動卵圓窗（前庭窗）。',
      '阻抗匹配：鼓膜有效面積約為鐙骨底板的 17 倍，加上槓桿約 1.3 倍，壓力放大約 20 多倍，聲音才能由空氣有效傳進液體。',
      '大聲時鐙骨肌（顏面神經）與鼓膜張肌（三叉神經下頜支）收縮，減少傳導，稱為聽覺反射。',
      '咽鼓管連到鼻咽，平衡中耳與外界的氣壓。',
    ],
    tip: {label: '考點', text: '顏面神經在發出鐙骨肌神經之前受損 → 鐙骨肌失能 → 聽覺過敏（hyperacusis）。'}},
  {id: 'wave', en: 'Cochlea · traveling wave', zh: '耳蝸：行波與音位排列', short: '耳蝸行波',
    points: [
      '鐙骨推入卵圓窗 → 前庭階外淋巴受壓 → 經蝸孔通到鼓階 → 圓窗（蝸窗）向中耳凸出釋壓。',
      '壓力差使基底膜出現由蝸底往蝸頂前進的行波，在某一點振幅最大。',
      '音位排列：蝸底窄而硬，對應高頻；蝸頂寬而軟，對應低頻。拉動下方「頻率」滑桿看最大振動點移動。',
      '人耳可聽範圍約 20 Hz – 20 kHz。',
    ],
    tip: {label: '考點', text: '噪音或年紀造成的聽力損失多先傷蝸底側 → 高頻先受影響（噪音性聽損常見 4 kHz 凹陷）。'}},
  {id: 'corti', en: 'Organ of Corti', zh: '柯蒂氏器：機械變成電', short: '柯蒂氏器',
    points: [
      '基底膜上移時，與蓋膜之間產生剪力，毛細胞的靜纖毛向最高的一排傾倒。',
      '尖端連結（tip link）拉開機械性離子通道，內淋巴的 K⁺ 流入 → 毛細胞去極化。反方向傾倒 → 通道關閉 → 過極化。',
      '內毛細胞一排，是真正把訊號傳給神經的感覺細胞（約 95% 傳入纖維接內毛細胞）。',
      '外毛細胞三排，靠 prestin 隨電位伸縮，放大基底膜振動，是耳聲傳射（otoacoustic emission）的來源。',
    ],
    tip: {label: '考點', text: 'K⁺ 由內淋巴流入毛細胞，靠的是蝸管內正電位（約 +80 mV）與細胞內負電位的大電位差；血管紋負責維持內淋巴。'}},
  {id: 'synapse', en: 'Synapse → action potential', zh: '突觸：變成動作電位', short: '突觸',
    points: [
      '去極化打開內毛細胞底部的電位門控 Ca²⁺ 通道（Cav1.3），Ca²⁺ 流入。',
      '帶狀突觸上的囊泡釋放麩胺酸，螺旋神經節神經元周邊突起的受體被活化，產生動作電位。',
      '聲音越大，放電頻率越高（頻率編碼）；不同位置的纖維對應不同頻率（位置編碼）。拉動「音量」看放電變多。',
      '螺旋神經節位於蝸軸內，是聽覺路徑的第一級神經元（雙極神經元），中樞突組成耳蝸神經（第八對腦神經）。',
    ],
    tip: {label: '考點', text: '受器電位是分級的（graded）；動作電位要到傳入神經纖維才出現，全有或全無。'}},
  {id: 'pathway', en: 'Auditory pathway', zh: '聽覺路徑：到大腦皮質', short: '聽覺路徑',
    points: [
      '耳蝸神經 → 耳蝸核（背側、腹側；延腦橋腦交界）→ 上橄欖核（雙側，經斜方體交叉）→ 外側丘系 → 下丘（中腦）→ 內側膝狀體（視丘）→ 聽放射 → 初級聽覺皮質。',
      '初級聽覺皮質在顳橫回（Heschl 回），Brodmann 41 區，旁邊 42 區為聽覺聯絡區。',
      '上橄欖核比較兩耳的時間差與音量差，用來判斷聲源方向。',
      '耳蝸核以上為雙側投射：單側中樞損傷不會造成單耳全聾；耳蝸神經或耳蝸核損傷 → 同側耳聾（例如前庭神經鞘瘤）。',
    ],
    tip: {label: '口訣 E-COLI', text: 'Eighth nerve 第八對腦神經 → Cochlear nuclei 耳蝸核 → Olive 上橄欖核 → Lateral lemniscus 外側丘系 → Inferior colliculus 下丘，之後內側膝狀體 → 聽覺皮質。'}},
];
export const STEP_COUNT = HEARING_STEPS.length;

export const HEARING_NOTE = '示意動畫：比例與速度經簡化，用來理解機轉；結構位置請以 3D 模型為準。';
/** Shown with the pressure-gain card of step 2. */
export const PRESSURE_GAIN = {en: 'Pressure gain', zh: '壓力放大', lines: ['鼓膜面積 ÷ 鐙骨底板 ≈ ×17', '× 聽小骨槓桿 ≈ ×1.3　→ 約 ×22']};

// ---- sliders -------------------------------------------------------------------------------------------------------

export const FREQ_MIN_HZ = 20, FREQ_MAX_HZ = 20000;
const LOG_MIN = Math.log10(FREQ_MIN_HZ), LOG_MAX = Math.log10(FREQ_MAX_HZ);
/** The frequency slider holds log10(Hz), so equal slider distances are equal ratios (20 Hz – 20 kHz). */
export const FREQ_SLIDER = {min: +LOG_MIN.toFixed(3), max: +LOG_MAX.toFixed(3), step: .01, initial: 3};
export const LOUD_SLIDER = {min: .15, max: 1, step: .05, initial: .7};
export const SPEED_SLIDER = {min: .2, max: 1.2, step: .1, initial: .6};
export const sliderToHz = (v: number) => Math.min(FREQ_MAX_HZ, Math.max(FREQ_MIN_HZ, Math.pow(10, v)));
export function formatHz(hz: number) {return hz >= 1000 ? (hz / 1000).toFixed(hz >= 10000 ? 0 : 1) + ' kHz' : Math.round(hz) + ' Hz';}

/** Place along the cochlea as a share of its length from the base (0, next to the windows) to the apex (1): the pitch map (tonotopy) is drawn with equal steps per octave,
 *  so 20 kHz lies at the base and 20 Hz at the apex. */
export function basePosition(hz: number) {
  const f = Math.min(FREQ_MAX_HZ, Math.max(FREQ_MIN_HZ, hz));
  return (LOG_MAX - Math.log10(f)) / (LOG_MAX - LOG_MIN);
}
export const hzAt = (u: number) => Math.pow(10, LOG_MAX - Math.min(1, Math.max(0, u)) * (LOG_MAX - LOG_MIN));

// ---- traveling wave ------------------------------------------------------------------------------------------------

/** Peak-shaped envelope along the basilar membrane: a slow rise from the base, a steep fall just past the peak. `u` and `peak` are shares of the length from the base. */
export function waveEnvelope(u: number, peak: number) {
  return u <= peak ? .12 + .88 * Math.exp(-Math.pow((peak - u) / .245, 2)) : Math.exp(-Math.pow((u - peak) / .043, 2));
}
export const WAVE_HZ = 1.2, WAVE_TURNS = 15.3 / (2 * Math.PI);
/** Signed displacement (−1…1 times the loudness) of the basilar membrane at `u` and time `t` seconds: a wave that runs from the base to the apex. */
export function waveValue(u: number, peak: number, t: number, loud: number) {
  return loud * waveEnvelope(u, peak) * Math.sin(2 * Math.PI * (WAVE_HZ * t - WAVE_TURNS * u));
}

// ---- state machine -------------------------------------------------------------------------------------------------

export interface PlayState {step: number; /** animation clock (s) */ t: number; /** seconds spent on this step while playing */ dwell: number; playing: boolean; auto: boolean}
export const AUTO_DWELL_S = 14;
export const initialPlay = (reducedMotion = false): PlayState => ({step: 0, t: 0, dwell: 0, playing: !reducedMotion, auto: false});
export const wrapStep = (i: number) => ((i % STEP_COUNT) + STEP_COUNT) % STEP_COUNT;
export const goTo = (s: PlayState, step: number): PlayState => ({...s, step: wrapStep(step), dwell: 0});
export const stepBy = (s: PlayState, delta: number): PlayState => goTo(s, s.step + delta);
/** One animation frame of `dt` seconds at the speed slider's value: the clock runs only while playing, and with "auto" on the animation moves to the next step after AUTO_DWELL_S. */
export function advance(s: PlayState, dt: number, speed: number): PlayState {
  if (!s.playing) return s;
  const next = {...s, t: s.t + dt * speed, dwell: s.dwell + dt};
  return s.auto && next.dwell > AUTO_DWELL_S ? goTo(next, s.step + 1) : next;
}

// ---- step 6: the pulse ---------------------------------------------------------------------------------------------

/** The pulse leaves each stage of the pathway after the previous one: start (s) and length of each leg inside one cycle. The two sides of one stage start together. */
export const PULSE_CYCLE_S = 4.4, PULSE_LEG_S = .8;
export const PULSE_LEGS = [
  {id: 'nerve', t0: 0}, {id: 'cn-to-soc-same', t0: .9}, {id: 'cn-to-soc-cross', t0: .9},
  {id: 'soc-to-ic-same', t0: 1.8}, {id: 'soc-to-ic-cross', t0: 1.8}, {id: 'ic-to-mgb-same', t0: 2.6}, {id: 'ic-to-mgb-cross', t0: 2.6},
  {id: 'mgb-to-a1-same', t0: 3.3}, {id: 'mgb-to-a1-cross', t0: 3.3},
] as const;
export type PulseLegId = typeof PULSE_LEGS[number]['id'];
/** Where along a leg (0–1) the pulse is at time `t`, or null while it is not on that leg. */
export function pulseAt(t: number, t0: number) {
  const u = (((t % PULSE_CYCLE_S) + PULSE_CYCLE_S) % PULSE_CYCLE_S - t0) / PULSE_LEG_S;
  return u >= 0 && u <= 1 ? u : null;
}
