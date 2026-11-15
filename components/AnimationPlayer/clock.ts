// 時間軸播放時鐘：純邏輯，不依賴 React 或 three.js。時間來源與逐幀排程皆可注入，方便測試。
export const SPEEDS = [0.25, 0.5, 1, 1.5, 2] as const;
export type Speed = (typeof SPEEDS)[number];

export type FrameScheduler = {
  request: (cb: (now: number) => void) => number;
  cancel: (id: number) => void;
};

export type ClockOptions = {
  /** 一輪的長度（秒），必須大於 0。 */
  duration: number;
  /** 毫秒時間來源，預設 performance.now。 */
  now?: () => number;
  /** 逐幀排程，預設 requestAnimationFrame。 */
  scheduler?: FrameScheduler;
  /** 是否循環，預設 true；不循環時播到 1 就停住。 */
  loop?: boolean;
  speed?: Speed;
  autoplay?: boolean;
  /** 每一幀回報目前的正規化時間 0..1。 */
  onTime?: (t: number) => void;
  /** 播放狀態改變時回報（含拖曳時暫停、放開後恢復）。 */
  onPlayingChange?: (playing: boolean) => void;
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

const browserScheduler = (): FrameScheduler => ({
  request: cb => requestAnimationFrame(cb),
  cancel: id => cancelAnimationFrame(id),
});

export function createPlaybackClock(opts: ClockOptions) {
  let duration = opts.duration > 0 ? opts.duration : 1;
  const now = opts.now ?? (() => performance.now());
  const loop = opts.loop ?? true;
  let speed: Speed = opts.speed ?? 1;
  let position = 0; // 正規化時間 0..1
  let playing = false; // 使用者設定的播放狀態
  let scrubbing = false;
  let resumeAfterScrub = false;
  let last = now();
  let frameId: number | null = null;
  let scheduler = opts.scheduler;

  const running = () => playing && !scrubbing;
  const emit = () => opts.onTime?.(position);

  /** 依目前時間推進並回傳正規化時間；暫停或拖曳中不推進。 */
  function advance(at: number = now()) {
    const dt = Math.max(0, (at - last) / 1000);
    last = at;
    if (!running()) return position;
    const next = position + (dt * speed) / duration;
    if (loop) position = ((next % 1) + 1) % 1;
    else if (next >= 1) { position = 1; playing = false; opts.onPlayingChange?.(false); }
    else position = next;
    return position;
  }

  function frame(at: number) {
    frameId = null;
    advance(at);
    emit();
    schedule();
  }
  function schedule() {
    if (frameId !== null || !running()) return;
    scheduler ??= browserScheduler();
    frameId = scheduler.request(frame);
  }
  function unschedule() {
    if (frameId === null) return;
    scheduler?.cancel(frameId);
    frameId = null;
  }

  const api = {
    get position() { return position; },
    get playing() { return playing; },
    /** 實際是否正在推進（播放中且沒有在拖曳）。 */
    get running() { return running(); },
    get scrubbing() { return scrubbing; },
    get speed() { return speed; },
    get duration() { return duration; },
    play() {
      advance();
      if (!loop && position >= 1) position = 0;
      if (!playing) { playing = true; opts.onPlayingChange?.(true); }
      emit();
      schedule();
    },
    pause() {
      advance();
      if (playing) { playing = false; opts.onPlayingChange?.(false); }
      unschedule();
    },
    toggle() { if (playing) api.pause(); else api.play(); },
    setSpeed(next: Speed) {
      advance(); // 先用舊速度結算，換速後不會跳格
      speed = next;
    },
    setDuration(seconds: number) {
      advance();
      if (seconds > 0) duration = seconds;
    },
    /** 跳到正規化位置 0..1（不改變播放狀態）。 */
    seek(t: number) {
      advance();
      position = clamp01(t);
      emit();
    },
    /** 開始拖曳：記住原本是否播放並暫停，由拖曳接手。 */
    beginScrub() {
      if (scrubbing) return;
      advance();
      scrubbing = true;
      resumeAfterScrub = playing;
      unschedule();
    },
    /** 拖曳中更新位置。 */
    scrubTo(t: number) {
      if (!scrubbing) api.beginScrub();
      position = clamp01(t);
      emit();
    },
    /** 放開：回到拖曳前的播放狀態。 */
    endScrub() {
      if (!scrubbing) return;
      scrubbing = false;
      last = now();
      if (!loop && position >= 1) { resumeAfterScrub = false; if (playing) { playing = false; opts.onPlayingChange?.(false); } }
      resumeAfterScrub = false;
      schedule();
    },
    /** 手動推進一幀（測試或自行驅動時使用）。 */
    tick(at?: number) { const t = advance(at); emit(); return t; },
    destroy() { unschedule(); playing = false; scrubbing = false; },
  };
  if (opts.autoplay) api.play();
  return api;
}
export type PlaybackClock = ReturnType<typeof createPlaybackClock>;
