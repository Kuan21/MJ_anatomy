import {useCallback, useEffect, useReducer, useRef, useState} from 'react';
import './hearing.css';
import {
  advance, FREQ_SLIDER, formatHz, goTo, HEARING_NOTE, HEARING_STEPS, initialPlay, LOUD_SLIDER, PRESSURE_GAIN, sliderToHz, SPEED_SLIDER, stepBy, STEP_COUNT, type PlayState,
} from './hearing-data';
import {createHearingEarScene} from './hearing-ear-scene';
import {createHearingBrain} from './hearing-brain-scene';
import {createCorti, createSynapse, createUnrolled, type Diagram} from './hearing-diagrams';

type EarScene = ReturnType<typeof createHearingEarScene>;
type BrainScene = ReturnType<typeof createHearingBrain>;
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The hearing animation of the ear detail mode: a full-page layer (the three columns underneath stay mounted and inert) with the 3D ear for steps 1–5, small zoom windows for the
 *  organ of Corti and the synapse, and the brain for the auditory pathway. Text and numbers are in hearing-data.ts. */
export default function HearingAnimation({onClose}: {onClose: () => void}) {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const play = useRef<PlayState>(initialPlay(reduced()));
  const [freq, setFreq] = useState<number>(FREQ_SLIDER.initial), [loud, setLoud] = useState<number>(LOUD_SLIDER.initial), [speed, setSpeed] = useState<number>(SPEED_SLIDER.initial);
  const [unrolled, setUnrolled] = useState(false), [earReady, setEarReady] = useState(false), [brainReady, setBrainReady] = useState(false), [earPercent, setEarPercent] = useState(0), [brainPercent, setBrainPercent] = useState(0), [error, setError] = useState('');
  const knobs = useRef({freq, loud, speed}); knobs.current = {freq, loud, speed};
  const earHost = useRef<HTMLDivElement>(null), brainHost = useRef<HTMLDivElement>(null), stage = useRef<HTMLDivElement>(null);
  const ear = useRef<EarScene | null>(null), brain = useRef<BrainScene | null>(null);
  const cortiSvg = useRef<SVGSVGElement>(null), synapseSvg = useRef<SVGSVGElement>(null), unrolledSvg = useRef<SVGSVGElement>(null), leader = useRef<SVGLineElement>(null), leaderDot = useRef<SVGCircleElement>(null);
  const windowBox = useRef<HTMLDivElement>(null);
  const diagrams = useRef<{corti?: Diagram; synapse?: Diagram; unrolled?: Diagram}>({});
  const unrolledOpen = useRef(false); unrolledOpen.current = unrolled;
  const step = play.current.step, info = HEARING_STEPS[step];

  const apply = useCallback((next: PlayState) => {const changed = next.step !== play.current.step; play.current = next; if (changed) {setUnrolled(false); rerender();}}, []);
  const go = useCallback((i: number) => apply(goTo(play.current, i)), [apply]);

  // ---- scenes
  useEffect(() => {
    try {
      ear.current = createHearingEarScene(earHost.current!, {progress: setEarPercent, ready: () => {setEarReady(true); ear.current?.setStep(HEARING_STEPS[play.current.step].id);}, error: setError});
    } catch {setError('無法啟動 3D 顯示。請改用支援 WebGL 的瀏覽器開啟。');}
    if (cortiSvg.current && synapseSvg.current && unrolledSvg.current) diagrams.current = {corti: createCorti(cortiSvg.current), synapse: createSynapse(synapseSvg.current), unrolled: createUnrolled(unrolledSvg.current)};
    return () => {ear.current?.dispose(); ear.current = null; brain.current?.dispose(); brain.current = null;};
  }, []);
  // the brain loads quietly once the animation reaches the synapse, so the last step opens at once; it is the brain of the brain detail mode (same file, same viewer)
  useEffect(() => {
    if (step < 4 || brain.current || !brainHost.current) return;
    try {brain.current = createHearingBrain(brainHost.current, {progress: setBrainPercent, ready: () => setBrainReady(true), error: () => setError('腦部模型未能載入，請重新載入。')});} catch {setError('無法啟動 3D 顯示。請改用支援 WebGL 的瀏覽器開啟。');}
  }, [step]);
  useEffect(() => {if (earReady) ear.current?.setStep(info.id);}, [step, earReady, info.id]);

  // ---- the clock: one animation frame drives the 3D scenes and the drawings
  useEffect(() => {
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      const k = knobs.current, before = play.current, next = advance(before, dt, k.speed);
      if (next !== before) apply(next);
      const p = play.current, params = {freqSlider: k.freq, loud: k.loud}, id = HEARING_STEPS[p.step].id;
      ear.current?.tick(p.t, params, id !== 'pathway');
      brain.current?.tick(p.t, id === 'pathway');
      if (id === 'wave' && unrolledOpen.current) diagrams.current.unrolled?.draw(p.t, k.loud, k.freq);
      if (id === 'corti') diagrams.current.corti?.draw(p.t, k.loud, k.freq);
      if (id === 'synapse') diagrams.current.synapse?.draw(p.t, k.loud, k.freq);
      // the leader from the zoom window to the place on the cochlea it shows
      const line = leader.current, dot = leaderDot.current, box = windowBox.current, st = stage.current;
      if (line && dot && box && st) {
        const point = (id === 'corti' || id === 'synapse') && ear.current ? ear.current.screenPoint(id === 'corti' ? 'peak' : 'ganglion') : null;
        if (point) {
          const s = st.getBoundingClientRect(), b = box.getBoundingClientRect(), c = earHost.current!.getBoundingClientRect();
          const x = point.x + c.left - s.left, y = point.y + c.top - s.top, ex = b.left - s.left, ey = b.top - s.top + b.height / 2;
          line.setAttribute('x1', x.toFixed(1)); line.setAttribute('y1', y.toFixed(1)); line.setAttribute('x2', ex.toFixed(1)); line.setAttribute('y2', ey.toFixed(1)); dot.setAttribute('cx', x.toFixed(1)); dot.setAttribute('cy', y.toFixed(1));
          line.style.display = dot.style.display = '';
        } else line.style.display = dot.style.display = 'none';
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [apply]);
  useEffect(() => {ear.current?.setPeakLabel(`最大振動 ${formatHz(sliderToHz(freq))}`);}, [freq, step, earReady]);

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

  const p = play.current, hz = sliderToHz(freq), small = step === 3 || step === 4;
  return <div className="hear-page" role="dialog" aria-label="聽覺傳導動畫" lang="zh-Hant">
    <header className="hear-head">
      <strong lang="en">Hearing: from sound to brain<small lang="zh-Hant">聽覺傳導：聲音如何變成腦中的電訊號</small></strong>
      <button className="hear-close" onClick={onClose} aria-label="關閉聽覺傳導動畫，回到耳部模式">關閉</button>
    </header>
    <nav className="hear-steps" aria-label="動畫步驟">
      {HEARING_STEPS.map((s, i) => <button key={s.id} aria-current={i === step ? 'step' : undefined} onClick={() => go(i)}><b>{i + 1}</b><span>{s.short}</span></button>)}
    </nav>
    <div className="hear-body">
      <section className={`hear-stage ${step === 2 && unrolled ? 'unrolled-on' : ''}`} ref={stage} aria-label="聽覺傳導 3D 動畫">
        <div className={`hear-layer ${step === 5 ? 'off' : ''}`} ref={earHost}/>
        <div className={`hear-layer brain ${step === 5 ? '' : 'off'}`} ref={brainHost}/>
        {!earReady && !error && <div className="hear-loading" role="status"><span className="organ-spinner"/><strong>載入耳部模型</strong><small>{earPercent ? `${earPercent}%` : '…'}</small></div>}
        {step === 5 && !brainReady && !error && <div className="hear-loading" role="status"><span className="organ-spinner"/><strong>載入腦部模型</strong><small>{brainPercent ? `${brainPercent}%` : '…'}</small></div>}
        {error && <div className="organ-error stage" role="alert">{error}</div>}
        {step === 1 && <div className="hear-gain" aria-label="壓力放大"><strong lang="en">{PRESSURE_GAIN.en}</strong><small lang="zh-Hant">{PRESSURE_GAIN.zh}</small>{PRESSURE_GAIN.lines.map(l => <p key={l}>{l}</p>)}</div>}
        {step === 2 && <>
          <button className="hear-unroll" aria-pressed={unrolled} onClick={() => setUnrolled(v => !v)}>{unrolled ? '收起展開圖' : '展開圖｜Unrolled view'}</button>
          <div className="hear-peak" aria-live="off"><span>頻率 Frequency</span><b>{formatHz(hz)}</b></div>
        </>}
        <div className={`hear-unrolled ${step === 2 && unrolled ? 'on' : ''}`}><svg ref={unrolledSvg} viewBox="0 0 960 540" role="img" aria-label="耳蝸展開圖：基底膜上的行波與最大振動點"><title>耳蝸展開圖</title></svg>
          <button onClick={() => setUnrolled(false)} aria-label="關閉展開圖">關閉</button></div>
        <svg className="hear-leader" aria-hidden="true"><line ref={leader}/><circle ref={leaderDot} r="5"/></svg>
        <div className={`hear-window ${small ? 'on' : ''}`} ref={windowBox} aria-hidden={!small}>
          <p className="hear-window-title">{step === 3 ? <><span lang="en">Organ of Corti</span><small>柯蒂氏器（放大示意）</small></> : <><span lang="en">Inner hair cell synapse</span><small>內毛細胞突觸（放大示意）</small></>}</p>
          <svg ref={cortiSvg} viewBox="0 0 960 540" className={step === 3 ? 'on' : ''} role="img" aria-label="柯蒂氏器放大示意"><title>柯蒂氏器</title></svg>
          <svg ref={synapseSvg} viewBox="0 0 960 540" className={step === 4 ? 'on' : ''} role="img" aria-label="內毛細胞突觸放大示意"><title>內毛細胞突觸</title></svg>
        </div>
        {step === 5 && <p className="hear-bilateral" lang="zh-Hant"><b>Bilateral above the cochlear nuclei</b>　耳蝸核以上雙側投射。黃色為模型已有的構造，淺褐色點與管為示意模型。</p>}
        <div className="hear-controls">
          <div className="hear-btns">
            <button aria-label="上一步" onClick={() => apply(stepBy(play.current, -1))}>◀ 上一步</button>
            <button className="primary" aria-pressed={p.playing} onClick={() => {apply({...play.current, playing: !play.current.playing}); rerender();}}>{p.playing ? '暫停' : '播放'}</button>
            <button aria-label="下一步" onClick={() => apply(stepBy(play.current, 1))}>下一步 ▶</button>
          </div>
          <label className="hear-slider"><span>Frequency 頻率 <b>{formatHz(hz)}</b></span><input type="range" min={FREQ_SLIDER.min} max={FREQ_SLIDER.max} step={FREQ_SLIDER.step} value={freq} aria-label="頻率" onChange={e => setFreq(+e.target.value)}/></label>
          <label className="hear-slider"><span>Loudness 音量 <b>{Math.round(loud * 100)}%</b></span><input type="range" min={LOUD_SLIDER.min} max={LOUD_SLIDER.max} step={LOUD_SLIDER.step} value={loud} aria-label="音量" onChange={e => setLoud(+e.target.value)}/></label>
          <label className="hear-slider"><span>Speed 速度 <b>{speed.toFixed(1)}×</b></span><input type="range" min={SPEED_SLIDER.min} max={SPEED_SLIDER.max} step={SPEED_SLIDER.step} value={speed} aria-label="速度" onChange={e => setSpeed(+e.target.value)}/></label>
          <label className="hear-auto"><input type="checkbox" checked={p.auto} onChange={e => {apply({...play.current, auto: e.target.checked}); rerender();}}/>自動切換下一步</label>
        </div>
      </section>
      <aside className="hear-side" aria-live="polite">
        <p className="hear-kicker">STEP {step + 1} / {STEP_COUNT}</p>
        <h2 lang="en">{info.en}<small lang="zh-Hant">{info.zh}</small></h2>
        <ul>{info.points.map(t => <li key={t}>{t}</li>)}</ul>
        <p className="hear-tip"><b>{info.tip.label}</b>　{info.tip.text}</p>
        <p className="hear-note">{HEARING_NOTE}</p>
      </aside>
    </div>
  </div>;
}
