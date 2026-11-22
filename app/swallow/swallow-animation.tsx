import {useCallback, useEffect, useReducer, useRef, useState} from 'react';
import '../ear-hearing/hearing.css';
import './swallow.css';
import {advance, goTo, initialPlay, PHASE_ZH, phaseAt, poseAt, SPEED_SLIDER, stepBy, STEP_COUNT, SWALLOW_NOTE, SWALLOW_STEPS, type PlayState} from './swallow-data';
import {createSwallowScene} from './swallow-scene';

type Scene = ReturnType<typeof createSwallowScene>;
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The swallowing animation: a full page (opened from the atlas, #/animation/swallow) with the midsagittal 3D section, the four steps and a live panel of what is open and closed.
 *  Text and the time line are in swallow-data.ts; the layout and controls are the hearing animation's (hearing.css). */
export default function SwallowAnimation({onClose}: {onClose: () => void}) {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const play = useRef<PlayState>(initialPlay(reduced()));
  const [speed, setSpeed] = useState<number>(SPEED_SLIDER.initial), [ready, setReady] = useState(false), [percent, setPercent] = useState(0), [error, setError] = useState('');
  const speedRef = useRef(speed); speedRef.current = speed;
  const host = useRef<HTMLDivElement>(null), scene = useRef<Scene | null>(null), status = useRef<HTMLDivElement>(null);
  const step = play.current.step, info = SWALLOW_STEPS[step];

  const apply = useCallback((next: PlayState) => {const changed = next.step !== play.current.step; play.current = next; if (changed) rerender();}, []);
  const go = useCallback((i: number) => apply(goTo(play.current, i)), [apply]);

  useEffect(() => {
    try {scene.current = createSwallowScene(host.current!, {progress: setPercent, ready: () => setReady(true), error: setError});}
    catch {setError('無法啟動 3D 顯示。請改用支援 WebGL 的瀏覽器開啟。');}
    return () => {scene.current?.dispose(); scene.current = null;};
  }, []);
  useEffect(() => {scene.current?.setStep(info.id);}, [info.id, ready]);

  useEffect(() => {
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      const before = play.current, next = advance(before, dt, speedRef.current);
      if (next !== before) apply(next);
      const t = play.current.t;
      scene.current?.tick(t);
      // the live panel: written straight to the DOM every frame (no React render per frame)
      const box = status.current;
      if (box) {
        const p = poseAt(t), phase = phaseAt(t);
        const set = (k: string, on: boolean, text: string) => {const el = box.querySelector<HTMLElement>(`[data-k="${k}"]`); if (el) {el.dataset.on = on ? '1' : '0'; const b = el.querySelector('b'); if (b && b.textContent !== text) b.textContent = text;}};
        set('phase', phase !== 'rest', PHASE_ZH[phase]);
        set('naso', p.palate > .5, p.palate > .5 ? '封閉' : '開放');
        set('inlet', p.epiglottis > .5, p.epiglottis > .5 ? '會厭蓋住' : '開放');
        set('breath', p.apnoea > .5, p.apnoea > .5 ? '暫停' : '正常');
        set('ues', p.ues > .5, p.ues > .5 ? '放鬆（打開）' : '收縮（關閉）');
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [apply]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.target as HTMLElement | null)?.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') apply(stepBy(play.current, 1));
      if (e.key === 'ArrowLeft') apply(stepBy(play.current, -1));
      if (e.key === ' ') {e.preventDefault(); apply({...play.current, playing: !play.current.playing}); rerender();}
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, [onClose, apply]);

  const p = play.current;
  return <div className="hear-page swallow-page" role="dialog" aria-label="吞嚥動畫" lang="zh-Hant">
    <header className="hear-head">
      <strong lang="en">Swallowing: oral, pharyngeal and oesophageal phases<small lang="zh-Hant">吞嚥：口腔期、咽期、食道期</small></strong>
      <button className="hear-close" onClick={onClose} aria-label="關閉吞嚥動畫，回到圖譜">關閉</button>
    </header>
    <nav className="hear-steps" aria-label="動畫步驟">
      {SWALLOW_STEPS.map((s, i) => <button key={s.id} aria-current={i === step ? 'step' : undefined} onClick={() => go(i)}><b>{i + 1}</b><span>{s.short}</span></button>)}
    </nav>
    <div className="hear-body">
      <section className="hear-stage" aria-label="吞嚥 3D 動畫">
        <div className="hear-layer" ref={host}/>
        {!ready && !error && <div className="hear-loading" role="status"><span className="organ-spinner"/><strong>載入頭頸模型</strong><small>{percent ? `${percent}%` : '…'}</small></div>}
        {error && <div className="organ-error stage" role="alert">{error}</div>}
        <div className="swallow-status" ref={status} aria-hidden="true">
          <span data-k="phase">階段 <b>—</b></span><span data-k="naso">鼻咽 <b>開放</b></span><span data-k="inlet">喉口 <b>開放</b></span>
          <span data-k="breath">呼吸 <b>正常</b></span><span data-k="ues">上食道括約肌 <b>收縮（關閉）</b></span>
        </div>
        <div className="hear-controls">
          <div className="hear-btns">
            <button aria-label="上一步" onClick={() => apply(stepBy(play.current, -1))}>◀ 上一步</button>
            <button className="primary" aria-pressed={p.playing} onClick={() => {apply({...play.current, playing: !play.current.playing}); rerender();}}>{p.playing ? '暫停' : '播放'}</button>
            <button aria-label="下一步" onClick={() => apply(stepBy(play.current, 1))}>下一步 ▶</button>
          </div>
          <label className="hear-slider"><span>Speed 速度 <b>{speed.toFixed(1)}×</b></span><input type="range" min={SPEED_SLIDER.min} max={SPEED_SLIDER.max} step={SPEED_SLIDER.step} value={speed} aria-label="速度" onChange={e => setSpeed(+e.target.value)}/></label>
          <button className="swallow-reset" onClick={() => scene.current?.resetView()}>重設視角</button>
        </div>
      </section>
      <aside className="hear-side" aria-live="polite">
        <p className="hear-kicker">STEP {step + 1} / {STEP_COUNT}</p>
        <h2 lang="en">{info.en}<small lang="zh-Hant">{info.zh}</small></h2>
        <ul>{info.points.map(t => <li key={t}>{t}</li>)}</ul>
        <p className="hear-tip"><b>{info.tip.label}</b>　{info.tip.text}</p>
        <p className="hear-note">{SWALLOW_NOTE}　模型為正中矢狀切面（右半），從左側看；橘紅色為正在收縮的肌肉，土黃色為示意模型。</p>
      </aside>
    </div>
  </div>;
}
