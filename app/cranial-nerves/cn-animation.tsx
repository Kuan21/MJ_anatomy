import {useCallback, useEffect, useReducer, useRef, useState} from 'react';
import '../organ/organ.css';
import '../ear-hearing/hearing.css';
import './cn.css';
import {advance, CN_NOTE, CRANIAL_NERVES, goTo, initialPlay, KIND_ZH, LEVELS, SPEED_SLIDER, stepBy, STEP_COUNT, type PlayState} from './cn-data';
import {createCranialScene} from './cn-scene';

type Scene = ReturnType<typeof createCranialScene>;
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The twelve cranial nerves, one at a time: a full page (opened from the atlas, #/animation/cranial-nerves) with the 3D nerves, an overview step and one step per nerve.
 *  Text is in cn-data.ts; the layout and controls are the hearing animation's (hearing.css). */
export default function CranialNervesAnimation({onClose}: {onClose: () => void}) {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const play = useRef<PlayState>(initialPlay(reduced()));
  const [speed, setSpeed] = useState<number>(SPEED_SLIDER.initial), [ready, setReady] = useState(false), [percent, setPercent] = useState(0), [error, setError] = useState('');
  const speedRef = useRef(speed); speedRef.current = speed;
  const host = useRef<HTMLDivElement>(null), scene = useRef<Scene | null>(null);
  const stage = useRef<HTMLDivElement>(null), leftGutter = useRef<HTMLDivElement>(null), rightGutter = useRef<HTMLDivElement>(null);
  const step = play.current.step, nerve = step ? CRANIAL_NERVES[step - 1] : null;

  const apply = useCallback((next: PlayState) => {const changed = next.step !== play.current.step; play.current = next; if (changed) rerender();}, []);
  const go = useCallback((i: number) => apply(goTo(play.current, i)), [apply]);

  useEffect(() => {
    try {scene.current = createCranialScene(host.current!, {progress: setPercent, ready: () => setReady(true), error: setError}, {stage: stage.current!, left: leftGutter.current!, right: rightGutter.current!});}
    catch {setError('無法啟動 3D 顯示。請改用支援 WebGL 的瀏覽器開啟。');}
    return () => {scene.current?.dispose(); scene.current = null;};
  }, []);
  useEffect(() => {scene.current?.setStep(step);}, [step, ready]);
  useEffect(() => {
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      const before = play.current, next = advance(before, dt, speedRef.current);
      if (next !== before) apply(next);
      scene.current?.tick(play.current.t);
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
  return <div className="hear-page cn-page" role="dialog" aria-label="十二對腦神經動畫" lang="zh-Hant">
    <header className="hear-head">
      <strong lang="en">Cranial nerves: course, exit from the skull and targets<small lang="zh-Hant">十二對腦神經：走向、出顱孔與支配目標</small></strong>
      <button className="hear-close" onClick={onClose} aria-label="關閉腦神經動畫，回到圖譜">關閉</button>
    </header>
    <nav className="hear-steps cn-steps" aria-label="選擇腦神經">
      <button aria-current={step === 0 ? 'step' : undefined} onClick={() => go(0)}><b>★</b><span>總覽</span></button>
      {CRANIAL_NERVES.map((c, i) => <button key={c.id} aria-current={step === i + 1 ? 'step' : undefined} onClick={() => go(i + 1)} title={`${c.en}｜${c.zh}`}><b>{c.roman}</b><span>{c.zh}</span></button>)}
    </nav>
    <div className="hear-body">
      <section className="hear-stage cn-stage" aria-label="腦神經 3D 動畫">
        {/* legend above the picture, labels in the two gutters beside it, controls below it: nothing is drawn over the nerves or the openings */}
        <div className="cn-legend" aria-hidden="true">
          {nerve ? <><span><i className="nerve"/>神經（光帶＝訊號方向）</span><span><i className="hole"/>出顱孔</span><span><i className="target"/>支配目標</span></>
            : LEVELS.map((l, i) => <span key={l.en}><i style={{background: ['#7aa6d8', '#9b7fd1', '#e0a43c', '#5fae8a'][i]}}/>{l.zh}：{l.nerves.map(k => CRANIAL_NERVES[k - 1].roman).join('、')}</span>)}
        </div>
        <div className="cn-view" ref={stage}>
          <div className="cn-gutter" ref={leftGutter} aria-hidden="true"/>
          <div className="cn-canvas" ref={host}>
            {!ready && !error && <div className="hear-loading" role="status"><span className="organ-spinner"/><strong>載入頭頸模型與神經</strong><small>{percent ? `${percent}%` : '…'}</small></div>}
            {error && <div className="organ-error stage" role="alert">{error}</div>}
          </div>
          <div className="cn-gutter" ref={rightGutter} aria-hidden="true"/>
        </div>
        <div className="hear-controls cn-controls">
          <div className="hear-btns">
            <button aria-label="上一對" onClick={() => apply(stepBy(play.current, -1))}>◀ 上一對</button>
            <button className="primary" aria-pressed={p.playing} onClick={() => {apply({...play.current, playing: !play.current.playing}); rerender();}}>{p.playing ? '暫停' : '播放'}</button>
            <button aria-label="下一對" onClick={() => apply(stepBy(play.current, 1))}>下一對 ▶</button>
          </div>
          <label className="hear-slider"><span>Speed 速度 <b>{speed.toFixed(1)}×</b></span><input type="range" min={SPEED_SLIDER.min} max={SPEED_SLIDER.max} step={SPEED_SLIDER.step} value={speed} aria-label="速度" onChange={e => setSpeed(+e.target.value)}/></label>
          <button className="cn-reset" onClick={() => scene.current?.resetView()}>重設視角</button>
          <label className="hear-auto"><input type="checkbox" checked={p.auto} onChange={e => {apply({...play.current, auto: e.target.checked}); rerender();}}/>自動切換下一對</label>
        </div>
      </section>
      <aside className="hear-side" aria-live="polite">
        <p className="hear-kicker">{nerve ? `CN ${nerve.roman} · ${step} / ${STEP_COUNT - 1}` : 'OVERVIEW'}</p>
        {nerve ? <>
          <h2 lang="en">{nerve.en}<small lang="zh-Hant">{nerve.roman}　{nerve.zh}（{KIND_ZH[nerve.kind]}）</small></h2>
          <p className="cn-fn">{nerve.fn}</p>
          <dl className="cn-facts">
            <dt>離開腦部</dt><dd><span lang="en">{nerve.from.en}</span>{nerve.from.zh}</dd>
            <dt>出顱孔</dt><dd>{nerve.openings.map(o => <span key={o.en} className="cn-item"><span lang="en">{o.en}</span>{o.zh}</span>)}</dd>
            <dt>支配目標</dt><dd>{nerve.targets.map(t => <span key={t.en} className="cn-item"><span lang="en">{t.en}</span>{t.zh}</span>)}</dd>
          </dl>
          <ul>{nerve.points.map(t => <li key={t}>{t}</li>)}</ul>
          <p className="hear-tip"><b>考點</b>　{nerve.tip}</p>
        </> : <>
          <h2 lang="en">Twelve pairs of cranial nerves<small lang="zh-Hant">十二對腦神經總覽</small></h2>
          <ul>
            <li>由前到後、由上到下依次離開腦部：I、II 屬前腦；III、IV 在中腦；V 至 VIII 在橋腦；IX 至 XII 在延腦（顏色依此區分）。</li>
            <li>感覺：I、II、VIII；運動：III、IV、VI、XI、XII；混合：V、VII、IX、X。</li>
            <li>帶副交感纖維的是 III、VII、IX、X。</li>
            <li>按上方的 I 至 XII 逐對查看：神經走向、出顱孔（紫紅色）、支配目標（綠色）。</li>
          </ul>
          <p className="hear-tip"><b>考點</b>　經上眶裂的有 III、IV、V1、VI；經頸靜脈孔的有 IX、X、XI；經內聽道的有 VII、VIII。</p>
        </>}
        <p className="hear-note">{CN_NOTE}</p>
      </aside>
    </div>
  </div>;
}
