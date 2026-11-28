/** Swallowing animation: the three phases (text, key points, exam tip), the time line of every movement and the pure state machine.
 *  Nothing here touches the DOM or three.js, so the node tests can check it directly (scripts/test-swallow.mjs).
 *  Times are seconds of one swallow, slowed down to be watched: in life the pharyngeal phase lasts about one second and the oesophageal phase about eight to ten. */

export interface SwallowStep {
  id: 'oral' | 'pharyngeal' | 'oesophageal' | 'whole';
  en: string; zh: string; short: string;
  points: string[];
  tip: {label: string; text: string};
  /** the part of the time line this step plays (seconds) */
  span: [number, number];
}

/** Length of one swallow on the animation clock, then a short rest before it starts again. */
export const SWALLOW_S = 10, REST_S = 1.2, CYCLE_S = SWALLOW_S + REST_S;

export const SWALLOW_STEPS: readonly SwallowStep[] = [
  {id: 'oral', en: 'Oral phase (voluntary)', zh: '口腔期（隨意）', short: '口腔期', span: [0, 2.2],
    points: [
      '嘴唇閉合，舌尖先頂住上門牙後方的硬顎，舌面再由前往後依次貼上硬顎，把食團推向口咽。',
      '口底的下頜舌骨肌收縮，把舌整體托高。',
      '這一期可以自主控制，隨時停下或吐出。',
      '舌的內在肌與外在肌由舌下神經支配（顎舌肌例外，由迷走神經經咽叢支配）。',
    ],
    tip: {label: '考點', text: '舌下神經損傷：伸舌時舌尖偏向患側（患側頦舌肌無力，健側把舌推向患側），口腔期推送食團困難。'}},
  {id: 'pharyngeal', en: 'Pharyngeal phase (reflex)', zh: '咽期（反射）', short: '咽期', span: [2.0, 3.8],
    points: [
      '食團碰到咽門與口咽的感覺區（舌咽神經、迷走神經），延腦的吞嚥中樞啟動反射，之後無法自主停止。',
      '軟顎上升並向後貼住咽後壁，封住鼻咽，食物不會逆流入鼻腔（提顎帆肌上提，張顎帆肌拉緊）。',
      '舌骨上肌群收縮，舌骨與喉向上、向前移動；喉口躲到舌根下方，會厭向後下翻，蓋住喉口。',
      '聲帶與前庭襞關閉，呼吸暫停（吞嚥性呼吸暫停）。',
      '上、中、下咽縮肌由上而下依次收縮，把食團擠過會厭兩側的梨狀隱窩；上食道括約肌（環咽肌）同時放鬆。',
    ],
    tip: {label: '考點', text: '咽縮肌與大部分軟顎肌肉由迷走神經（咽叢）支配；張顎帆肌例外，由三叉神經下頜支支配；莖突咽肌由舌咽神經支配。'}},
  {id: 'oesophageal', en: 'Oesophageal phase (involuntary)', zh: '食道期（不隨意）', short: '食道期', span: [3.4, SWALLOW_S],
    points: [
      '食團通過後上食道括約肌重新收縮，防止逆流；喉與舌骨回到原位，會厭翻回，呼吸恢復。',
      '原發性蠕動波由上往下推進，把食團送到胃；在人身上約需 8 至 10 秒（動畫已縮短）。',
      '食道上三分之一為骨骼肌，下三分之一為平滑肌，中段混合；蠕動由迷走神經與食道肌間神經叢協調。',
      '蠕動波接近時下食道括約肌放鬆，讓食團進入胃。',
    ],
    tip: {label: '考點', text: '食道的三個生理性狹窄：起始處（環狀軟骨，第六頸椎高度）、主動脈弓與左主支氣管跨過處、穿過橫膈的食道裂孔處（第十胸椎高度）。'}},
  {id: 'whole', en: 'Whole swallow', zh: '完整吞嚥（三期連續）', short: '完整過程', span: [0, SWALLOW_S],
    points: [
      '口腔期（隨意）→ 咽期（反射，約 1 秒）→ 食道期（蠕動，約 8–10 秒）。',
      '咽期是氣道與食道共用通道的時刻：鼻咽由軟顎封住，喉由會厭與聲門關閉，只剩食道打開。',
      '任何一個保護動作失敗，食物就可能進入氣道（嗆咳、吸入性肺炎）或鼻腔。',
    ],
    tip: {label: '考點', text: '吞嚥中樞在延腦（孤束核接收感覺、疑核發出運動纖維到咽與喉的肌肉）；延腦外側症候群（Wallenberg）常有吞嚥困難。'}},
];
export const STEP_COUNT = SWALLOW_STEPS.length;
export const SWALLOW_NOTE = '示意動畫：動作幅度與時間經簡化，食團、軟顎與蠕動為示意；結構位置以 3D 模型為準。';

// ---- time line -----------------------------------------------------------------------------------------------------

const smooth = (k: number) => {const x = Math.min(1, Math.max(0, k)); return x * x * (3 - 2 * x);};
/** 0 before `a`, rising to 1 by `b`, holding, falling back to 0 between `c` and `d`. */
export const pulse = (t: number, a: number, b: number, c: number, d: number) => t < c ? smooth((t - a) / (b - a)) : 1 - smooth((t - c) / (d - c));
const bump = (t: number, centre: number, width: number) => Math.exp(-Math.pow((t - centre) / width, 2));

export interface SwallowPose {
  /** lips closed, tongue tip on the hard palate (0–1) */ tongueTip: number;
  /** where the wave of the tongue pressing against the palate is, front (0) to back (1), and how strong */ tongueWave: number; tongueWaveAmp: number;
  /** tongue base pulled back against the pharyngeal wall (0–1) */ tongueBase: number;
  /** soft palate raised to close the nasopharynx (0–1) */ palate: number;
  /** hyoid and larynx raised and moved forward (0–1) */ larynx: number;
  /** epiglottis tipped back over the laryngeal inlet (0–1) */ epiglottis: number;
  /** contraction of the superior, middle and inferior constrictors (0–1 each) */ constrictor: [number, number, number];
  /** suprahyoid muscles working (0–1) */ suprahyoid: number;
  /** upper oesophageal sphincter open (0–1) */ ues: number;
  /** position of the peristaltic wave along the oesophagus (0 top – 1 bottom), null when there is none */ peristalsis: number | null;
  /** position of the bolus along its path (0 front of the mouth – 1 bottom of the oesophagus) */ bolus: number;
  /** breathing paused (0–1) */ apnoea: number;
}

/** Bolus path shares where each part of the way begins: mouth (0) → oropharynx → laryngopharynx → oesophagus top → end (1). */
export const PATH_MARKS = {oropharynx: .3, laryngopharynx: .45, oesophagus: .58} as const;

export function poseAt(t: number): SwallowPose {
  const s = Math.min(Math.max(t, 0), SWALLOW_S);
  const constrictor: [number, number, number] = [bump(s, 2.45, .22), bump(s, 2.75, .22), bump(s, 3.05, .22)];
  const wave = s < 3.4 ? null : Math.min(1, (s - 3.4) / (SWALLOW_S - 3.9));
  // the bolus: on the tongue until the push, through the pharynx fast, then carried just ahead of the peristaltic wave
  let bolus: number;
  if (s < .6) bolus = 0;
  else if (s < 2.0) bolus = PATH_MARKS.oropharynx * smooth((s - .6) / 1.4);
  else if (s < 3.3) bolus = PATH_MARKS.oropharynx + (PATH_MARKS.oesophagus - PATH_MARKS.oropharynx) * smooth((s - 2.0) / 1.3);
  else bolus = PATH_MARKS.oesophagus + (1 - PATH_MARKS.oesophagus) * Math.min(1, Math.max(0, ((wave ?? 0) + .06)));
  return {
    tongueTip: pulse(s, .1, .5, 2.6, 3.2),
    tongueWave: smooth((s - .5) / 1.6), tongueWaveAmp: pulse(s, .4, .7, 2.2, 2.8),
    tongueBase: pulse(s, 1.9, 2.4, 3.0, 3.6),
    // the soft palate starts to rise at the end of the oral phase, before the bolus reaches it
    palate: pulse(s, 1.0, 1.5, 3.1, 3.6),
    larynx: pulse(s, 1.95, 2.35, 3.1, 3.7),
    epiglottis: pulse(s, 2.15, 2.5, 3.1, 3.6),
    constrictor,
    suprahyoid: pulse(s, 1.85, 2.2, 3.0, 3.4),
    ues: pulse(s, 2.55, 2.85, 3.25, 3.5),
    peristalsis: wave !== null && wave < 1 ? wave : null,
    bolus: Math.min(1, bolus),
    apnoea: pulse(s, 1.8, 2.0, 3.2, 3.5),
  };
}

/** Which phase a moment of the swallow belongs to (for the live caption under the controls). */
export function phaseAt(t: number): 'oral' | 'pharyngeal' | 'oesophageal' | 'rest' {
  if (t >= SWALLOW_S) return 'rest';
  return t < 2.0 ? 'oral' : t < 3.4 ? 'pharyngeal' : 'oesophageal';
}
export const PHASE_ZH = {oral: '口腔期', pharyngeal: '咽期', oesophageal: '食道期', rest: '休息'} as const;

// ---- state machine -------------------------------------------------------------------------------------------------

/** `t` is the time inside the swallow; it loops over the span of the current step. */
export interface PlayState {step: number; t: number; playing: boolean}
export const SPEED_SLIDER = {min: .2, max: 1.5, step: .1, initial: .6};
export const initialPlay = (reducedMotion = false): PlayState => ({step: 3, t: 0, playing: !reducedMotion});
export const wrapStep = (i: number) => ((i % STEP_COUNT) + STEP_COUNT) % STEP_COUNT;
export const goTo = (s: PlayState, step: number): PlayState => {const k = wrapStep(step); return {...s, step: k, t: SWALLOW_STEPS[k].span[0]};};
export const stepBy = (s: PlayState, delta: number): PlayState => goTo(s, s.step + delta);
/** One frame: the clock runs while playing and loops over the step's span, with a short rest at the end of the whole swallow. */
export function advance(s: PlayState, dt: number, speed: number): PlayState {
  if (!s.playing) return s;
  const [a, b] = SWALLOW_STEPS[s.step].span, end = b + (b >= SWALLOW_S ? REST_S : .5);
  const t = s.t + dt * speed;
  return {...s, t: t > end ? a : t};
}

/** Opens the whole swallow paused at `t` seconds (from a link such as #/animation/swallow?t=2.4); anything that is not a time inside the swallow leaves the state as it is. */
export function atMoment(s: PlayState, t: string | null): PlayState {
  const v = t === null ? NaN : Number(t);
  if (!Number.isFinite(v) || v < 0 || v > SWALLOW_S) return s;
  // the step of that moment (its camera shows the moment closest); a moment after the swallow opens the whole swallow
  const ph = phaseAt(v), id = ph === 'oral' ? 'oral' : ph === 'pharyngeal' ? 'pharyngeal' : ph === 'oesophageal' ? 'oesophageal' : 'whole';
  return {...s, step: SWALLOW_STEPS.findIndex(x => x.id === id), t: v, playing: false};
}
