import {useCallback, useEffect, useRef, useState, type CSSProperties} from 'react';
import {createPlaybackClock, SPEEDS, type PlaybackClock, type Speed} from './clock';
import './animation-player.css';

export type PlayerAction = {id: string; en: string; zh: string};
export type PlayerCaption = {
  /** 動作名稱（英文在上、中文在下）。 */
  action?: {en: string; zh: string};
  /** 關節名稱。 */
  joint?: {en: string; zh: string};
  /** 約略活動範圍，例如「約 0–150°」。 */
  range?: string;
};
export type AnimationPlayerProps = {
  /** 一輪的長度（秒）。 */
  duration: number;
  /** 可選的動作清單；只有一個或沒有時不顯示分頁按鈕。 */
  actions?: PlayerAction[];
  /** 目前的動作；省略則由元件自己管理。 */
  activeId?: string;
  /** 每一幀回報正規化時間 0..1，供 3D 端驅動模型。 */
  onTime?: (t: number) => void;
  /** 切換動作時回報；切換後時間軸回到 0。 */
  onActionChange?: (id: string) => void;
  caption?: PlayerCaption;
  autoplay?: boolean;
  loop?: boolean;
  defaultSpeed?: Speed;
  className?: string;
};

const SCRUB_STEPS = 1000;
const speedLabel = (s: Speed) => `${s}×`;

export default function AnimationPlayer({duration, actions = [], activeId, onTime, onActionChange, caption, autoplay = false, loop = true, defaultSpeed = 1, className}: AnimationPlayerProps) {
  const [playing, setPlaying] = useState(autoplay);
  const [speed, setSpeed] = useState<Speed>(defaultSpeed);
  const [inner, setInner] = useState(actions[0]?.id ?? '');
  const current = activeId ?? inner;
  const clockRef = useRef<PlaybackClock | null>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const dragging = useRef(false);
  const onTimeRef = useRef(onTime);
  onTimeRef.current = onTime;

  const paint = useCallback((t: number) => {
    const el = rangeRef.current;
    if (!el) return;
    el.value = String(Math.round(t * SCRUB_STEPS));
    el.style.setProperty('--ap-fill', `${t * 100}%`);
    el.setAttribute('aria-valuetext', `${Math.round(t * 100)}%`);
  }, []);

  // 時鐘只建立一次；時間軸用 ref 直接更新，避免每一幀重繪整個元件。
  useEffect(() => {
    const clock = createPlaybackClock({
      duration, loop, speed: defaultSpeed, autoplay,
      onTime: t => { paint(t); onTimeRef.current?.(t); },
      onPlayingChange: setPlaying,
    });
    clockRef.current = clock;
    paint(0);
    return () => { clock.destroy(); clockRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loop]);
  useEffect(() => { clockRef.current?.setDuration(duration); }, [duration]);
  useEffect(() => { clockRef.current?.setSpeed(speed); }, [speed]);

  const pick = (id: string) => {
    if (id === current) return;
    if (activeId === undefined) setInner(id);
    clockRef.current?.seek(0);
    onActionChange?.(id);
  };
  const fromInput = (el: HTMLInputElement) => Number(el.value) / SCRUB_STEPS;
  const end = () => { if (dragging.current) { dragging.current = false; clockRef.current?.endScrub(); } };

  const showTabs = actions.length > 1;
  const hasCaption = !!(caption && (caption.action || caption.joint || caption.range));
  const labelledSpeed = speedLabel(speed);

  return <section className={`anim-player${className ? ` ${className}` : ''}`} aria-label="動作播放">
    {hasCaption && <div className="ap-caption" role="status">
      {caption?.action && <div className="ap-cap-row"><span className="ap-cap-key">動作<small>Action</small></span><b>{caption.action.en}<small>{caption.action.zh}</small></b></div>}
      {caption?.joint && <div className="ap-cap-row"><span className="ap-cap-key">關節<small>Joint</small></span><b>{caption.joint.en}<small>{caption.joint.zh}</small></b></div>}
      {caption?.range && <div className="ap-cap-row"><span className="ap-cap-key">約略活動範圍<small>Range of motion</small></span><b className="ap-range">{caption.range}</b></div>}
    </div>}
    {showTabs && <div className="ap-tabs" role="tablist" aria-label="選擇動作">
      {actions.map(a => <button type="button" role="tab" key={a.id} aria-selected={a.id === current} data-active={a.id === current} onClick={() => pick(a.id)}>
        <span>{a.en}<small>{a.zh}</small></span>
      </button>)}
    </div>}
    <div className="ap-bar">
      <button type="button" className="ap-play" aria-pressed={playing} aria-label={playing ? '暫停' : '播放'} title={playing ? '暫停' : '播放'} onClick={() => clockRef.current?.toggle()}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">{playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/> : <path d="M8 5.5v13l11-6.5z" fill="currentColor"/>}</svg>
        <span>{playing ? 'Pause' : 'Play'}<small>{playing ? '暫停' : '播放'}</small></span>
      </button>
      <label className="ap-scrub">
        <span className="ap-sr">時間軸</span>
        <input ref={rangeRef} type="range" min={0} max={SCRUB_STEPS} step={1} defaultValue={0} aria-label="時間軸，拖曳可跳到動作的任一時間點"
          style={{'--ap-fill': '0%'} as CSSProperties}
          onPointerDown={() => { dragging.current = true; clockRef.current?.beginScrub(); }}
          onPointerUp={end} onPointerCancel={end} onBlur={end} onLostPointerCapture={end}
          onInput={e => { const t = fromInput(e.currentTarget); if (dragging.current) clockRef.current?.scrubTo(t); else clockRef.current?.seek(t); }}/>
      </label>
      <label className="ap-speed">
        <span>Speed<small>速度</small></span>
        <select value={speed} aria-label={`播放速度，目前 ${labelledSpeed}`} onChange={e => setSpeed(Number(e.target.value) as Speed)}>
          {SPEEDS.map(s => <option key={s} value={s}>{speedLabel(s)}</option>)}
        </select>
      </label>
    </div>
  </section>;
}
